// The alpha's end (the owner's, 2026-11-03: "show a 'victory walk' through america usa similar to the victory walks
// for clearing the lands when the player exits out, with a 'the end?' line. pressing A will go to the title screen";
// "during the alpha 'victory walk' through america usa, he randomly cycles through all his weapons").
//
// Out through America USA from the hub (hub/index.ts): the walk-away screen (walkAway.ts, its scene
// walkAway/americaExit.ts), him walking out of the park at the camera, the park going away behind him (at the last
// hour, the NEVERENDING FIREWORKS SHOW over it: fireworks.ts). Every second or so he's got another of his weapons up,
// each the way its own walk-away has it (walkAway/acts.ts), in a random order, none again till they've all been round.
// The PA sees him off (intro/lines.ts PA_END_OPEN), then says how much of the 24 hidden finds he got (PA_END_TIER);
// then THE END? over the picture, the finds' count and a line under it; ~1.5 s on, buttons let go, a fresh A: the
// title. The file's kept as it is (saved first), to load and keep playing.

import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../m1/constants';
import type { WeaponType } from '../m1/types';
import { playSound } from '../m1/game/platform/audio';
import { offerSkip, takeSkip, drawSkipPrompt, SKIP_AFTER } from '../m1/game/platform/skip';
import { say, cutVoice } from '../m1/game/platform/speech';
import { voicesLoaded } from '../m1/game/platform/voiceclips';
import { inputDevice, padFamily } from '../m1/game/platform/device';
import { drawPadFace } from '../m1/game/render/padGlyph';
import { musicMoment } from './music/moments';
import { PA_VOICE, PA_END_OPEN, PA_END_TIER, alphaTier } from './intro/lines';
import { availableWeapons } from './cheats';
import { M2_WEAPONS } from './weapons';
import { setAlphaEndSeen, findsFoundTotal, FINDS_TOTAL } from './store';
import { saveProgress } from './save';
import { SAFARI_ARTIE } from './walkAway/artie';
import { BOT, TOP, LH } from './walkAway/kit';
import { font } from './walkAway/screen';

type Ctx = CanvasRenderingContext2D;

/** How long each weapon's up (frames). */
const SWITCH = 66;
/** Where in each weapon's walk-away act he's got it up by his face (walkAway/acts.ts: the frame its turn starts at). */
const HELD: Partial<Record<WeaponType, number>> = {
  GUN: 318, FLINTLOCK: 0, SPELLBOOK: 20, STUNT_CAR: 212, MALLET: 370, SPAWNER: 172, SOUVENIR: 0, SOUL_SUCKER: 190, CROSSBOW: 100,
};
/** The PA's first line comes in (frames, after the iris). */
const PA_AT = 70;
/** THE END? up this long before a press takes it (the explain cards' hold: about a second and a half). */
const HOLD = 90;

export interface EndWalk {
  /** His weapons, in the order they come up (a fresh shuffle each time round, never the same one twice running). */
  order: WeaponType[]; pool: WeaponType[];
  lines: string[]; line: number; said: string | null; nextAt: number;
  /** The line before's just finished: the next a breath after. */
  gap: boolean;
  /** THE END? (the frame it went up; -1 not yet). */
  endAt: number;
  /** A's been let go of since THE END? (a held button isn't a press). */
  armed: boolean;
  got: number;
}

const shuffle = <T,>(a: T[]) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/** (the cheats build's title, ALPHA ENDING) The next end walk plays as if this many finds were his (used once). */
let previewFinds: number | null = null;
export const setEndPreviewFinds = (n: number | null) => { previewFinds = n; };

export const startEnd = (): EndWalk => {
  // (seen: the file saved as it is now, so loading it carries on from here)
  setAlphaEndSeen(true); saveProgress();
  // (dev: ?allweapons, every one of them, for looking at the lot)
  const all = import.meta.env.DEV && typeof location !== 'undefined' && new URLSearchParams(location.search).has('allweapons');
  const pool = (all ? M2_WEAPONS : availableWeapons()).filter(w => HELD[w] !== undefined);
  const got = previewFinds ?? findsFoundTotal();
  previewFinds = null;
  return {
    order: [], pool: pool.length ? pool : ['GUN'],
    lines: [PA_END_OPEN, ...PA_END_TIER[alphaTier(got, FINDS_TOTAL)]], line: -1, said: null, nextAt: PA_AT, gap: false,
    endAt: -1, armed: false, got,
  };
};

/** The weapon up `n` turns in (dealt as it's needed). */
const weaponAt = (e: EndWalk, n: number) => {
  while (e.order.length <= n) {
    const next = shuffle([...e.pool]);
    // (not the same one twice running across a reshuffle)
    if (next.length > 1 && next[0] === e.order[e.order.length - 1]) [next[0], next[1]] = [next[1], next[0]];
    e.order.push(...next);
  }
  return e.order[n];
};

/** What he's got up at frame t, and where in its act he is. */
export const endPose = (e: EndWalk, t: number) => {
  const n = Math.floor(t / SWITCH), weapon = weaponAt(e, n);
  return { weapon, t: (HELD[weapon] ?? 0) + (t % SWITCH) };
};

/** The crossbow's drawn with Jungle Land's walk-away's own (it has no act: walkAway.ts's turned-over default). */
export const endWeaponArt = (e: EndWalk, t: number) => (endPose(e, t).weapon === 'CROSSBOW' ? { draw: SAFARI_ARTIE.drawWeapon, grip: SAFARI_ARTIE.grip } : null);

const sayLine = (e: EndWalk, i: number, t: number) => {
  e.line = i; e.nextAt = Infinity;
  const text = e.lines[i];
  let over = false;
  const done = () => { if (over) return; over = true; e.said = null; if (e.endAt < 0) e.gap = true; };
  const shown = say(text, PA_VOICE, 'queue', {
    always: true,
    onShow: spoken => { if (e.endAt < 0) e.said = text; if (!spoken) setTimeout(done, Math.max(2200, text.length * 75)); },
    onHide: done, onDropped: done,
  });
  if (!shown) e.nextAt = t + 1;
};

const toEnd = (e: EndWalk, t: number) => { e.endAt = t; e.said = null; e.armed = false; cutVoice('m2.pa'); playSound('menuok', 0.6); };

/** A frame of it (after the walk's own). `a`: A (or Enter) down. True: off to the title. */
export const tickEnd = (e: EndWalk, t: number, a: boolean): boolean => {
  musicMoment('alphaend', e.endAt >= 0 ? 'end' : 'pa');
  // (each new weapon: a click as it comes up)
  if (t > 0 && t % SWITCH === 0 && e.endAt < 0) playSound('click', 0.22, -3);
  offerSkip();
  const skip = takeSkip();
  if (e.endAt < 0) {
    // (the PA a line at a time, a breath between)
    if (e.gap) { e.gap = false; e.nextAt = t + 24; }
    if (skip && t > 20) { toEnd(e, t); return false; }
    if (t >= e.nextAt && (e.line >= 0 || voicesLoaded() || t > 600)) {
      if (e.line + 1 < e.lines.length) sayLine(e, e.line + 1, t);
      else toEnd(e, t + 30);
    }
    return false;
  }
  if (t < e.endAt) return false;
  // (held a second and a half, the button let go, then a fresh press: the title)
  if (!a && !skip) e.armed = true;
  else if (e.armed && t - e.endAt > HOLD) { playSound('menuok', 0.8); return true; }
  return false;
};

const wrap = (c: Ctx, text: string, maxW: number) => {
  const words = text.split(' '), lines: string[] = [];
  let cur = '';
  for (const w of words) { const next = cur ? `${cur} ${w}` : w; if (c.measureText(next).width > maxW && cur) { lines.push(cur); cur = w; } else cur = next; }
  if (cur) lines.push(cur);
  return lines;
};

/** The words: the PA's in the bar while he says them; THE END? over the picture; under it the count, the line, A. */
export const drawEndWords = (c: Ctx, e: EndWalk, t: number) => {
  c.save();
  c.textBaseline = 'alphabetic';
  if (e.said) {
    c.font = font(8); c.textAlign = 'center';
    const lines = wrap(c, `PA: ${e.said}`, W - 64);
    const y0 = BOT + 52 - (lines.length - 1) * 8;
    lines.forEach((l, i) => { c.fillStyle = '#000000'; c.fillText(l, W / 2 + 1, y0 + i * 16 + 1); c.fillStyle = '#FDE68A'; c.fillText(l, W / 2, y0 + i * 16); });
  }
  // (the PA can be cut short, straight to THE END?)
  if (e.endAt < 0 && t > SKIP_AFTER) drawSkipPrompt(c, W);
  if (e.endAt >= 0 && t >= e.endAt) {
    const u = t - e.endAt;
    // (the picture gone dim behind it, stepped)
    c.fillStyle = `rgba(4, 3, 14, ${Math.min(0.4, Math.floor(u / 4) * 0.08).toFixed(2)})`; c.fillRect(0, TOP, W, LH * 2);
    // THE END?: punched in big, bouncing down to size
    const zoom = u < 14 ? 2.6 - 1.7 * (u / 14) : u < 22 ? 0.9 + 0.1 * Math.sin(((u - 14) / 8) * Math.PI) + 0.1 * ((u - 14) / 8) : 1;
    c.save();
    c.translate(W / 2, TOP + 150); c.scale(zoom, zoom);
    c.font = font(40); c.textAlign = 'center';
    c.fillStyle = '#000000'; c.fillText('THE END?', 4, 4 + 14);
    c.fillStyle = '#2A0A04'; for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2]]) c.fillText('THE END?', dx, dy + 14);
    const g = c.createLinearGradient(0, -26, 0, 14);
    ['#FFF4C0', '#FFE27A', '#F6C443', '#E0A12A', '#C07E18'].forEach((col, i, a) => { g.addColorStop(i / a.length, col); g.addColorStop((i + 1) / a.length - 0.001, col); });
    c.fillStyle = g; c.fillText('THE END?', 0, 14);
    c.restore();
    // (the bar: the finds he had, the line, A for the title)
    if (u > 24) {
      c.font = font(10); c.textAlign = 'center';
      const txt = `HIDDEN FINDS: ${e.got} OF ${FINDS_TOTAL}`;
      c.fillStyle = '#000000'; c.fillText(txt, W / 2 + 2, BOT + 30); c.fillStyle = e.got >= FINDS_TOTAL ? '#FDE68A' : '#F8FAFC'; c.fillText(txt, W / 2, BOT + 28);
      c.font = font(7); c.fillStyle = '#7DD3FC'; c.fillText('CHECK BACK LATER-ISH FOR THE ENDGAME.', W / 2, BOT + 52);
    }
    if (u > HOLD) {
      c.globalAlpha = Math.min(1, (u - HOLD) / 15) * (0.75 + 0.25 * Math.sin(t * 0.12));
      c.font = font(8); c.textAlign = 'left';
      const pad = inputDevice() === 'pad';
      const label = 'PRESS', tail = 'FOR THE MAIN MENU';
      c.font = font(6);
      const keyW = pad ? 18 : Math.max(26, c.measureText('SPACE').width + 8);
      c.font = font(8);
      const total = c.measureText(label).width + 8 + keyW + 8 + c.measureText(tail).width;
      let x = Math.round(W / 2 - total / 2);
      const y = BOT + 84;
      c.fillStyle = '#F8FAFC'; c.fillText(label, x, y); x += c.measureText(label).width + 8;
      if (pad) drawPadFace(c, x + 9, y - 4, 9, 'A', padFamily());
      else {
        c.fillStyle = '#E4E4E7'; c.beginPath(); c.roundRect(x, y - 11, keyW, 14, 2); c.fill();
        c.strokeStyle = '#52525B'; c.lineWidth = 1; c.stroke();
        c.fillStyle = '#A1A1AA'; c.fillRect(x + 1, y + 1, keyW - 2, 2);
        c.font = font(6); c.fillStyle = '#18181B'; c.textAlign = 'center'; c.fillText('SPACE', x + keyW / 2, y - 1); c.textAlign = 'left'; c.font = font(8);
      }
      x += keyW + 8;
      c.fillStyle = '#F8FAFC'; c.fillText(tail, x, y);
    }
  }
  c.restore();
  void H;
};
