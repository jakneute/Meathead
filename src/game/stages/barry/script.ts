// Scripted dialogue for Barry's stage (the same system as Dale's): Meathead, Barry's
// man in the power room, Barry himself over the building's PA, whoever else has
// something to say. Each line's heard to the end before the next (spoken, or up
// long enough to read with no voice), a breath between. Meathead's go up in his
// own speech bubble; everyone else's are drawn by the stage over wherever they are.

import type { GameState } from '../../core/state';
import { say, isSpeaking, sentenceShown, Voice, MEATHEAD_VOICE } from '../../platform/speech';

export type Speaker = 'meathead' | 'minion' | 'barry';

export const VOICES: Record<Speaker, Voice> = {
  meathead: MEATHEAD_VOICE,
  minion: { id: 'barry.minion', pitch: 1.6, rate: 1.45 },
  barry: { id: 'barry.barry', pitch: 0.9, rate: 1.4 },
};

export interface ScriptLine { who: Speaker; text: string }
export interface Talk {
  queue: ScriptLine[];
  /** The line being said: who, what, when it started, whether it's actually being spoken, when it's done if it isn't. */
  current: { who: Speaker; text: string; since: number; spoken: boolean; until: number; done: boolean } | null;
  /** No line before this (the breath after the last one). */
  nextAt: number;
}

export const createTalk = (): Talk => ({ queue: [], current: null, nextAt: 0 });

/** Reading time with no voice (frames), the breath between lines, the longest a spoken line's waited on, and how long it waits for anyone else to finish. */
const READ_BASE = 50, READ_PER_CHAR = 3.4, BREATH = 16, SPOKEN_MAX_PER_CHAR = 9, WAIT_FOR_OTHERS = 90;

/** Lines to say, after whatever's already queued (and `delay` frames after the last). */
export const queueLines = (state: GameState, talk: Talk, lines: ScriptLine[], delay = 0) => {
  if (!talk.queue.length && !talk.current) talk.nextAt = Math.max(talk.nextAt, state.frame + delay);
  talk.queue.push(...lines);
};

/** Says these right away: whatever was queued is dropped (the line that's on finishes first). */
export const replaceLines = (state: GameState, talk: Talk, lines: ScriptLine[], delay = 0) => {
  talk.queue = [...lines];
  if (!talk.current) talk.nextAt = state.frame + delay;
};

/** Nothing being said and nothing waiting. */
export const quiet = (talk: Talk) => !talk.current && talk.queue.length === 0;

/** Stops the lot (a death, a cut): the line on comes down. */
export const hush = (state: GameState, talk: Talk) => {
  if (talk.current?.who === 'meathead' && state.playerLastVulgarity === talk.current.text) { state.playerVulgarityTimer = Math.min(state.playerVulgarityTimer, 10); state.isMeatheadSpeaking = false; }
  talk.current = null;
  talk.queue = [];
};

/** What someone's saying right now (for their bubble). */
export const saying = (talk: Talk, who: Speaker) => (talk.current && talk.current.who === who ? talk.current.text : '');

export const updateTalk = (state: GameState, talk: Talk) => {
  const c = talk.current;
  if (c) {
    const over = c.spoken ? c.done || state.frame - c.since > READ_BASE + c.text.length * SPOKEN_MAX_PER_CHAR : state.frame >= c.until;
    if (!over) return;
    if (c.who === 'meathead') state.isMeatheadSpeaking = false;
    talk.current = null;
    talk.nextAt = state.frame + BREATH;
  }
  if (!talk.queue.length || state.frame < talk.nextAt) return;
  // (someone else still talking, Meathead's "ow" say: they finish first, for a moment at most)
  if (isSpeaking() && state.frame < talk.nextAt + WAIT_FOR_OTHERS) return;
  const line = talk.queue.shift()!;
  const readFor = READ_BASE + line.text.length * READ_PER_CHAR;
  const cur = { who: line.who, text: line.text, since: state.frame, spoken: false, until: state.frame + readFor, done: false };
  talk.current = cur;
  const mine = line.who === 'meathead';
  if (mine) { state.playerLastVulgarity = line.text; state.playerVulgarityTimer = readFor; state.isMeatheadSpeaking = true; }
  say(line.text, VOICES[line.who], 'urgent', {
    onShow: spoken => {
      cur.spoken = spoken;
      if (!spoken) cur.until = state.frame + readFor;
      if (mine) { state.playerLastVulgarity = line.text; state.playerVulgarityTimer = spoken ? 9999 : readFor; }
    },
    onHide: () => { if (mine && state.playerLastVulgarity === line.text) state.playerVulgarityTimer = Math.min(state.playerVulgarityTimer, 20); },
    onDone: () => { cur.done = true; },
  });
};

/** A speech bubble over (x, y) (world), in the stage's style. */
export const drawBubble = (ctx: CanvasRenderingContext2D, x: number, y: number, said: string, fill = '#F8FAFC', ink = '#111827') => {
  if (!said) return;
  // (a sentence at a time)
  const text = sentenceShown(said);
  ctx.save();
  ctx.font = 'bold 8px "Press Start 2P"';
  const w = Math.min(460, ctx.measureText(text).width + 16);
  // (kept on the screen: the box slides in off the edge, the tail stays pointing at whoever's talking)
  const m = ctx.getTransform();
  const toWorld = (sx: number) => (sx - m.e) / (m.a || 1);
  const bx = Math.max(toWorld(8) + w / 2, Math.min(toWorld(ctx.canvas.width - 8) - w / 2, x));
  const tx = Math.max(bx - w / 2 + 8, Math.min(bx + w / 2 - 8, x));
  ctx.fillStyle = fill; ctx.strokeStyle = ink; ctx.lineWidth = 2;
  ctx.fillRect(bx - w / 2, y - 24, w, 20); ctx.strokeRect(bx - w / 2, y - 24, w, 20);
  ctx.beginPath(); ctx.moveTo(tx - 5, y - 4); ctx.lineTo(tx + 5, y - 4); ctx.lineTo(tx, y + 5); ctx.fillStyle = fill; ctx.fill();
  ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.fillText(text, bx, y - 10, w - 10);
  ctx.restore();
};
