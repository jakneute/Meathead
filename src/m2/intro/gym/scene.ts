// The Iron Pit's two cutscenes (the opening, the closing: gym/index.ts), played in the stage itself: a run of shots,
// each a 256 x 144 SNES picture (shots.ts) blown up 3x and boxed in black, with whoever's talking's words under it
// while (and only while) their line plays. Nobody talks over anybody: each beat's line is said, finishes, and a breath
// later the next beat starts. No input but SKIP (Start / Esc, or the corner's prompt), which skips the lot. No HUD
// from the first frame (introCutscene), the player held still and out of it.

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { say, silenceAll, MEATHEAD_VOICE, type Voice } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { playSound } from '../../../m1/game/platform/audio';
import type { SoundType } from '../../../m1/types';

type Ctx = CanvasRenderingContext2D;
export const ART_W = 256, ART_H = 144;
/** Where the picture sits on screen (3x), and the words' box under it. */
const SCALE = 3, PX = (CANVAS_WIDTH - ART_W * SCALE) / 2, PY = 30;
const SUB_Y = PY + ART_H * SCALE + 22;

/** A shot: drawn onto the 256 x 144 canvas each frame (`t` frames into the shot, `talking`: the line's being said). */
export type Shot = (c: Ctx, t: number, talking: boolean) => void;

export interface Beat {
  shot: Shot;
  /** Who's saying it (over the words), the voice it's said in, what's said. No text: a held moment. */
  who?: string;
  voice?: string;
  text?: string;
  /** Frames after the line's over before the next beat (a held moment: how long it holds). */
  hold?: number;
  /** Frames into the beat before the line starts (a look, a beat of silence first). */
  wait?: number;
  /** Once, as the beat starts (a sound, a shake). */
  enter?: () => void;
  /** A card in the picture's place of the words (THE IRON PIT. LEG DAY.): not spoken. */
  caption?: string;
  /** Drawn this many times finer than the art (a gross-up: gross.ts), in the art's coordinates still. */
  res?: number;
}

export interface Scene {
  beats: Beat[];
  i: number;
  /** Frames into this beat, into this shot (it carries on across beats with the same shot), into the whole thing. */
  t: number; shotT: number; total: number;
  /** The words up (only while they're said). */
  said: { who: string; text: string } | null;
  /** This beat's line: started, finished (and when). */
  started: boolean; doneAt: number;
  /** Over (played out or skipped). */
  over: boolean; skipped: boolean;
  /** Fading out at the end (frames into it). */
  out: number;
}

const DEFAULT_HOLD = 26, FADE_IN = 18, FADE_OUT = 30;
/** A line that wasn't recorded: up as text this long (frames), then on. */
const unspokenFor = (text: string) => Math.max(110, text.length * 4);

export const createScene = (beats: Beat[]): Scene => {
  // (whatever anybody was saying as it cuts in: done)
  silenceAll();
  return { beats, i: 0, t: 0, shotT: 0, total: 0, said: null, started: false, doneAt: -1, over: false, skipped: false, out: -1 };
};

const voiceOf = (id: string): Voice => (id === 'meathead' ? MEATHEAD_VOICE : { id, pitch: 0, rate: 1 });

/** One frame of it. Returns true once it's over. */
export const tickScene = (s: Scene): boolean => {
  if (s.over) return true;
  s.total++;
  if (s.out >= 0) { if (++s.out >= FADE_OUT) s.over = true; return s.over; }
  if (s.total > SKIP_AFTER) offerSkip();
  if (s.total > SKIP_AFTER && takeSkip()) { silenceAll(); s.said = null; s.skipped = true; s.over = true; return true; }
  const b = s.beats[s.i];
  if (s.t === 0) b.enter?.();
  s.t++; s.shotT++;
  if (!s.started && s.t > (b.wait ?? 0)) {
    s.started = true;
    if (b.text && b.voice) {
      const line = { who: b.who ?? '', text: b.text };
      const beat = s.i;
      const shown = say(b.text, voiceOf(b.voice), 'queue', {
        always: true,
        onShow: spoken => {
          if (s.i !== beat) return;
          s.said = line;
          if (!spoken) setTimeout(() => { if (s.i === beat && s.doneAt < 0) { s.said = null; s.doneAt = s.t; } }, unspokenFor(b.text!) * (1000 / 60));
        },
        onHide: () => { if (s.i === beat) { s.said = null; if (s.doneAt < 0) s.doneAt = s.t; } },
        onDropped: () => { if (s.i === beat && s.doneAt < 0) { s.said = null; s.doneAt = s.t; } },
      });
      if (!shown) s.doneAt = s.t;
    } else s.doneAt = s.t;
  }
  // (a line that's somehow never ended: on after a good while anyway)
  if (s.started && s.doneAt < 0 && s.t > 60 * 14) { s.said = null; s.doneAt = s.t; }
  if (s.doneAt >= 0 && s.t - s.doneAt >= (b.hold ?? DEFAULT_HOLD)) {
    if (s.i >= s.beats.length - 1) { s.out = 0; return false; }
    const next = s.beats[s.i + 1];
    s.i++; s.t = 0; s.started = false; s.doneAt = -1; s.said = null;
    if (next.shot !== b.shot) s.shotT = 0;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------

/** The picture's canvas: the art's size, or `res` times finer (a gross-up), its drawing scaled to match. */
const arts = new Map<number, HTMLCanvasElement>();
const artCtx = (res: number) => {
  let art = arts.get(res);
  if (!art) { art = document.createElement('canvas'); art.width = ART_W * res; art.height = ART_H * res; arts.set(res, art); }
  const c = art.getContext('2d')!;
  c.setTransform(res, 0, 0, res, 0, 0);
  c.imageSmoothingEnabled = false;
  return c;
};

/** Words wrapped to a width (the subtitle box). */
const wrap = (c: Ctx, text: string, wide: number) => {
  const lines: string[] = [];
  let cur = '';
  for (const w of text.split(' ')) { const t = cur ? `${cur} ${w}` : w; if (c.measureText(t).width > wide && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  return lines;
};

/** The whole screen: black, the picture, the words while they're said, SKIP in the corner. Screen space. */
export const drawScene = (ctx: Ctx, s: Scene) => {
  ctx.save();
  ctx.setTransform(ctx.getTransform().a, 0, 0, ctx.getTransform().d, 0, 0);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const b = s.beats[Math.min(s.i, s.beats.length - 1)];
  const a = artCtx(b.res ?? 1);
  a.save(); b.shot(a, s.shotT, !!s.said); a.restore();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(a.canvas, PX, PY, ART_W * SCALE, ART_H * SCALE);
  // (a thin frame round it)
  ctx.strokeStyle = '#2a2a30'; ctx.lineWidth = 2; ctx.strokeRect(PX - 1, PY - 1, ART_W * SCALE + 2, ART_H * SCALE + 2);
  // The words: who, then what (wrapped, kept whole in the box under the picture)
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  if (s.said) {
    ctx.font = '10px "Press Start 2P"';
    if (s.said.who) { ctx.fillStyle = '#FACC15'; ctx.fillText(`${s.said.who}:`, PX + 12, SUB_Y); }
    ctx.font = '11px "Press Start 2P"';
    const lines = wrap(ctx, s.said.text, ART_W * SCALE - 24).slice(0, 4);
    lines.forEach((l, i) => { ctx.fillStyle = '#000'; ctx.fillText(l, PX + 13, SUB_Y + 22 + i * 18 + 1); ctx.fillStyle = '#F8FAFC'; ctx.fillText(l, PX + 12, SUB_Y + 22 + i * 18); });
  } else if (b.caption) {
    ctx.font = '12px "Press Start 2P"'; ctx.textAlign = 'center';
    b.caption.split('\n').forEach((l, i) => { ctx.fillStyle = '#7f1d1d'; ctx.fillText(l, CANVAS_WIDTH / 2 + 2, SUB_Y + 26 + i * 22 + 2); ctx.fillStyle = '#F8FAFC'; ctx.fillText(l, CANVAS_WIDTH / 2, SUB_Y + 26 + i * 22); });
    ctx.textAlign = 'left';
  }
  // (in from black at the start, out to it at the end)
  const fade = s.out >= 0 ? s.out / FADE_OUT : s.total < FADE_IN ? 1 - s.total / FADE_IN : 0;
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${Math.min(1, fade).toFixed(3)})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  if (s.total > SKIP_AFTER && s.out < 0) drawSkipPrompt(ctx, CANVAS_WIDTH);
  ctx.restore();
};

/** A beat's sound, for `enter`. */
export const sfx = (id: SoundType, vol = 0.8, pitch = 0) => () => playSound(id, vol, pitch);
