// THE WAVE POOL'S SURGES (the owner's: "the wave pool should regularly push you back at any depth"). The wave machine
// at the deep end (its housing over the far wall) throws a surge down the whole pool on a clock: the tell first (its
// klaxon, three blasts, the water swelling up at the surface and the murk starting to stream toward the beach), then
// the surge (the current: everything in the water shoved back toward the shallow end, top to bottom, hard; not damage).
// GUPPLAX's whistle calls one early (boss.ts: still with the whole tell). In the mazes the piles stop him where they
// stop him: the surge still has him, and the corridors' snags are where it throws him.

import type { GameState } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../../../m1/constants';
import { WP, poolFloor } from './geo';

type Ctx = CanvasRenderingContext2D;

/** The clock (frames): calm, the tell, the surge (its last stretch easing off). And how hard it shoves (px/frame,
 *  taken off his speed each frame: about 2.5 px a frame back even swimming flat out into it, so the dash (9) is the
 *  only way on through one). */
export const SURGE = { calm: 400, tell: 96, on: 130, ease: 30, push: 0.55, beach: 0.25 };
const PERIOD = SURGE.calm + SURGE.tell + SURGE.on;

export interface Waves { t: number; n: number }
export const newWaves = (): Waves => ({ t: 120, n: 0 });

/** Where the clock is: 'calm' | 'tell' (k 0..1) | 'on' (k 0..1); and how hard it's shoving now (0..1). */
export const surgeOf = (w: Waves) => {
  const t = w.t % PERIOD;
  if (t < SURGE.calm) return { st: 'calm' as const, k: t / SURGE.calm, push: 0 };
  if (t < SURGE.calm + SURGE.tell) return { st: 'tell' as const, k: (t - SURGE.calm) / SURGE.tell, push: 0 };
  const k = (t - SURGE.calm - SURGE.tell) / SURGE.on, left = SURGE.on - (t - SURGE.calm - SURGE.tell);
  return { st: 'on' as const, k, push: Math.min(1, k * 8, left / SURGE.ease) };
};
/** Frames till the next surge's tell (for GUPPLAX: a whistle only calls one in the calm). */
export const calmLeft = (w: Waves) => { const t = w.t % PERIOD; return t < SURGE.calm ? SURGE.calm - t : 0; };
/** Call the next one now (the whistle): straight to its tell. */
export const callSurge = (w: Waves) => { const t = w.t % PERIOD; if (t < SURGE.calm) w.t += SURGE.calm - t; };

/** A frame: the clock, the klaxon, the shove on him (in the water, anywhere in it; on the beach's wet edge, a little). */
export const updateWaves = (state: GameState, w: Waves, live: boolean) => {
  w.t++;
  const s = surgeOf(w), t = w.t % PERIOD, p = state.player;
  if (s.st === 'tell' && (t - SURGE.calm) % 32 === 0) playSound('horn', 0.55, -10);
  if (s.st === 'tell' && t === SURGE.calm + 1) w.n++;
  if (s.st === 'on' && t === SURGE.calm + SURGE.tell) { playSound('rumble', 0.9, -10); playSound('gush', 0.8, -8); shakeScreen(state, 5, 3); }
  if (s.st === 'on' && t % 20 === 0 && s.push > 0.5) playSound('gush', 0.35, -10);
  if (!live || s.push <= 0) return s;
  const cx = p.pos.x + p.width / 2;
  if (p.swimming && !(p.isCharging && p.swimDash)) p.vel.x -= SURGE.push * s.push;
  else if (!p.swimming && cx > WP.beach - 40 && cx < WP.beach + 300 && p.isGrounded) p.vel.x -= SURGE.beach * s.push;
  return s;
};

/** How far the surface swells up (px) where x is: the tell builds it from the deep end; the surge rolls it down the pool. */
export const swellAt = (w: Waves, x: number) => {
  const s = surgeOf(w);
  if (s.st === 'tell') return 14 * s.k * Math.max(0, (x - WP.x0) / (WP.x1 - WP.x0));
  if (s.st === 'on') { const front = WP.x1 - s.k * (WP.x1 - WP.x0) * 1.3; return x > front ? 16 * s.push : 6 * s.push; }
  return 0;
};

/** World, in front: the murk streaming toward the beach (the tell: starting; the surge: everywhere, fast), the
 *  crest rolling down the surface. Live (lines and little rects only: a few dozen). */
export const drawWaves = (c: Ctx, state: GameState, w: Waves) => {
  const s = surgeOf(w);
  if (s.st === 'calm') return;
  const f = state.frame, cam = state.camera;
  const n = s.st === 'tell' ? Math.floor(10 * s.k) : Math.round(36 * s.push);
  const v = s.st === 'tell' ? 2 : 14;
  for (let i = 0; i < n; i++) {
    const sx = ((i * 211 - f * v) % (W + 200) + W + 200) % (W + 200) - 100, sy = (i * 137) % H;
    const x = cam.x + sx, y = cam.y + sy;
    if (y < WP.surf + 8 || y > poolFloor(x) - 4) continue;
    c.globalAlpha = s.st === 'tell' ? 0.35 : 0.5; c.fillStyle = i % 3 ? '#BAE6FD' : '#F0F9FF';
    c.fillRect(Math.round(x), Math.round(y), s.st === 'tell' ? 10 : 26 + (i % 4) * 8, 2);
  }
  c.globalAlpha = 1;
};
