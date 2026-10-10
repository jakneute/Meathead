// The castle's PA: "Dracula" (Donnie, in his control room, in the voice), over horn speakers bolted up the walls, from
// the foyer to the end of the red-mist hallway. One voice, one line at a time (never over itself): a room's story is
// said through in order; a newer room's story waits for the one going to finish (only the newest waits: he's not made
// to sit through a backlog); a quip only when he's quiet. His words go up by the nearest speaker on the screen, only
// while they're said.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { speak, meatheadSays, saidOver, type Said } from '../section';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { PA, type Dressed, type ByPants } from './lines';
import { box } from '../section';

type Ctx = CanvasRenderingContext2D;

interface Pa {
  gen: number;
  state: GameState;
  said: Said | null;
  /** Saying something (or Meathead's having his say back, and it waits for him). */
  busy: boolean;
  /** What's left of the story going (and what Meathead says back after it), and the one waiting (the newest). */
  left: string[]; reply: string | null;
  next: { lines: string[]; reply: string | null } | null;
}
let gen = 0;
const PAS = new WeakMap<object, Pa>();
const paOf = (state: GameState): Pa => {
  const key = state.stage as object;
  let pa = PAS.get(key);
  if (!pa) { pa = { gen: ++gen, state, said: null, busy: false, left: [], reply: null, next: null }; PAS.set(key, pa); }
  return pa;
};

export const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
export const pick = <T>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
/** His pool for how Meathead is right now. */
export const byPants = (state: GameState, r: ByPants) => r[dressed(state)];

/** (a callback that can only go once: the speech's done-callbacks can come more than once) */
export const once = (f: () => void) => { let done = false; return () => { if (!done) { done = true; f(); } }; };
const sayNext = (pa: Pa) => {
  if (pa.gen !== gen) return;
  pa.said = null;
  if (!pa.left.length) {
    // (the story's done: Meathead's say back, and the PA waits for him)
    if (pa.reply) { const r = pa.reply; pa.reply = null; pa.busy = true; meatheadSays(pa.state, r, true, once(() => sayNext(pa))); return; }
    if (!pa.next) { pa.busy = false; return; }
    pa.left = pa.next.lines; pa.reply = pa.next.reply; pa.next = null;
  }
  const line = pa.left.shift()!;
  pa.busy = true;
  speak(PA, line, s => { if (pa.gen === gen) pa.said = s; }, true, once(() => sayNext(pa)));
};

/** A story (lines in order; then Meathead's `reply`). Something going: this one's next (and anything that was waiting
 *  isn't). */
export const paStory = (state: GameState, lines: readonly string[], reply: string | null = null) => {
  const pa = paOf(state);
  if (pa.busy) { pa.next = { lines: [...lines], reply }; return; }
  pa.left = [...lines]; pa.reply = reply;
  sayNext(pa);
};
/** One line, if he's quiet (nothing going, nothing waiting): true if it's said. */
export const paQuip = (state: GameState, line: string) => {
  const pa = paOf(state);
  if (pa.busy || pa.next) return false;
  pa.left = [line]; pa.reply = null;
  sayNext(pa);
  return true;
};
export const paBusy = (state: GameState) => { const pa = paOf(state); return pa.busy || !!pa.next; };
export const paSaying = (state: GameState) => paOf(state).said;

// ---------------------------------------------------------------------------------------------------------------
// The speakers, and the words

/** A horn speaker on its bracket (world space), shaking a little while it's talking. */
export const drawHorn = (c: Ctx, x: number, y: number, talking: boolean, f: number) => {
  const j = talking && (f >> 1) % 2 ? 1 : 0;
  box(c, x - 3, y - 2, 6, 14, '#27272A');
  box(c, x - 10, y + 10, 20, 4, '#3F3F46');
  c.fillStyle = '#1A0B06'; c.beginPath(); c.moveTo(x - 4, y + 2 + j); c.lineTo(x + 22, y - 10 + j); c.lineTo(x + 22, y + 14 + j); c.closePath(); c.fill();
  c.fillStyle = '#71717A'; c.beginPath(); c.moveTo(x - 2, y + 2 + j); c.lineTo(x + 20, y - 8 + j); c.lineTo(x + 20, y + 12 + j); c.closePath(); c.fill();
  box(c, x + 19, y - 9 + j, 4, 22, '#1A0B06');
  if (talking) for (let k = 0; k < 3; k++) { const r = 6 + k * 6 + ((f >> 2) % 3) * 2; c.strokeStyle = `rgba(252, 165, 165, ${0.5 - k * 0.15})`; c.lineWidth = 2; c.beginPath(); c.arc(x + 23, y + 2, r, -0.7, 0.7); c.stroke(); }
};
/** The words, by whichever of `horns` (world [x, y]) is nearest the middle of the screen. World space. */
export const drawPaWords = (c: Ctx, state: GameState, horns: readonly (readonly [number, number])[]) => {
  const s = paSaying(state);
  if (!s) return;
  const cx = state.camera.x + CANVAS_WIDTH / 2, cy = state.camera.y + CANVAS_HEIGHT / 2;
  let best: readonly [number, number] | null = null, bd = Infinity;
  for (const h of horns) { const d = Math.abs(h[0] - cx) + Math.abs(h[1] - cy) * 1.5; if (d < bd) { bd = d; best = h; } }
  if (!best) return;
  saidOver(c, s.text, best[0] + 10, best[1] - 22, '#FCA5A5', 300);
};
