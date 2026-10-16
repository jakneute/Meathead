// Drowned (Meathead 2: a land enemy that ends up in deep water, knocked in, thrown, shoved or fallen): nobody out there
// can swim. A splash going in, half a second of flailing, arms going, then he's under, goes limp, and floats back up
// face down, butt in the air, bobbing with the water (a wave lifts him with it), drifting. One last bubble out of him,
// he swells up a little, and he bursts like every other keel-over death: the gore and the meat, a splash of the water.

import type { GameState } from '../core/state';
import { shakeScreen } from '../core/state';
import { getStageLayout } from '../stages';
import { playSound } from '../platform/audio';
import { gibs } from './gunDeaths';
import type { EnemyDeath } from './deaths';

export interface Drown {
  /** The water: its surface (world y), a wave lifting it here (px), its sides (it stays between them), its key. */
  surface: number; lift: number; x1: number; x2: number; key: string;
  /** Which way it drifts (px a frame). */
  drift: number;
  /** The water's colors for the splashes (unset: clear water's). */
  spray?: string[];
  /** A surface that moves (a flood rising): asked each frame. */
  surfaceAt?: () => number;
  /** Where its middle is now (the body turns about it) and its turn. */
  cy: number; rot: number;
}

/** Flailing, then going under, then up again face down, then bobbing; the swell before the burst, and the burst. */
export const DROWN_FLAIL = 30, DROWN_SINK = 50, DROWN_RISE = 80, DROWN_SWELL = 130, DROWN_BURST = 152;
/** Floaters per body of water at once (more: the oldest goes up early). */
const MAX_PER_WATER = 4;
const CLEAR = ['#E0F2FE', '#7DD3FC', '#BAE6FD'];

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const ease = (k: number) => k * k * (3 - 2 * k);

/** The water it's in, as it went in (a body found by the stage's waterBodyAt, or given). */
export const startDrown = (d: EnemyDeath, w: { surface: number; x1: number; x2: number; key: string }, opts: { spray?: string[]; surfaceAt?: () => number } = {}) => {
  d.dw = { surface: w.surface, lift: 0, x1: w.x1, x2: w.x2, key: w.key, drift: (Math.random() < 0.5 ? -1 : 1) * rnd(0.15, 0.35), spray: opts.spray, surfaceAt: opts.surfaceAt, cy: d.y + d.h / 2, rot: 0 };
  d.vx = 0; d.vy = 0;
};

const spray = (state: GameState, dw: Drown, x: number, y: number, n: number, up: number, spread: number) => {
  const cols = dw.spray ?? CLEAR;
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x: x + rnd(-spread, spread), y }, vel: { x: rnd(-3.5, 3.5), y: -rnd(1.5, up) }, life: rnd(18, 34), color: cols[i % cols.length], size: rnd(2, 5), grav: 0.35 });
};

/** One frame of it. False once it's over (burst). */
export const updateDrowned = (state: GameState, d: EnemyDeath): boolean => {
  if (!d.dw) startDrown(d, { surface: d.y + d.h * 0.45, x1: d.x - 200, x2: d.x + d.w + 200, key: 'water' });
  const dw = d.dw!;
  const t = ++d.t;
  const face = d.sprite?.facing ?? 1;
  // (the water: risen, or a wave through it)
  if (dw.surfaceAt) dw.surface = dw.surfaceAt();
  const cx = d.x + d.w / 2;
  const w = getStageLayout(state.stageId)?.waterBodyAt?.(state, cx, dw.surface + 6);
  if (w && w.key === dw.key) { dw.surface = w.surface; dw.lift += ((w.lift ?? 0) - dw.lift) * 0.35; }
  else dw.lift *= 0.8;
  const s = dw.surface - dw.lift;
  if (t === 1) {
    // (too many bobbing in this water: the oldest goes up now)
    const here = state.enemyDeaths.filter(o => o.kind === 'drowned' && o.dw?.key === dw.key && o.t < DROWN_SWELL);
    if (here.length > MAX_PER_WATER) { const old = here.reduce((a, b) => (b.t > a.t ? b : a)); old.t = Math.max(old.t, DROWN_SWELL); }
    spray(state, dw, cx, s, 18, 7, d.w * 0.4);
    playSound('splash', 0.8, -2);
  }
  // A float face down: about its middle, a body's thickness (its width) mostly under
  const floatY = s + d.w * 0.08;
  if (t < DROWN_FLAIL) {
    // Head and shoulders out, bobbing hard, thrashing on the spot
    dw.cy = s + d.h * 0.05 + Math.sin(t * 0.5) * 4 + (t / DROWN_FLAIL) * d.h * 0.12;
    dw.rot = Math.sin(t * 0.4) * 0.3;
    d.x += Math.sin(t * 0.3) * 0.8;
    if (t % 3 === 0) spray(state, dw, cx, s, 3, 4.5, d.w * 0.7);
    if (t === 12) playSound('glug', 0.5, 2);
  } else if (t < DROWN_SINK) {
    // Under, going limp, tipping over onto his face
    const k = ease((t - DROWN_FLAIL) / (DROWN_SINK - DROWN_FLAIL));
    dw.cy = s + d.h * 0.17 + d.h * 0.4 * k;
    dw.rot = face * (Math.PI / 2 + 0.12) * k;
    if (t % 4 === 0) state.particles.push({ pos: { x: cx + rnd(-8, 8), y: dw.cy - d.h * 0.2 }, vel: { x: rnd(-0.3, 0.3), y: -rnd(1, 2) }, life: Math.max(8, (dw.cy - s) / 1.5), color: 'rgba(224, 242, 254, 0.8)', size: rnd(2, 4) });
  } else if (t < DROWN_RISE) {
    // Back up, face down, butt first
    const k = 1 - (1 - (t - DROWN_SINK) / (DROWN_RISE - DROWN_SINK)) ** 2;
    dw.cy = s + d.h * 0.57 + (floatY - (s + d.h * 0.57)) * k;
    dw.rot = face * (Math.PI / 2 + 0.12);
    if (t === DROWN_RISE - 1) spray(state, dw, cx, s, 6, 3, d.w * 0.6);
  } else {
    // Floating: bobbing with the water, drifting, the odd ripple off him
    dw.cy = floatY + Math.sin(t * 0.09) * 2;
    dw.rot = face * (Math.PI / 2 + 0.12 + Math.sin(t * 0.07) * 0.05);
    d.x += dw.drift;
    const half = d.h / 2 + 6;
    if (cx - half < dw.x1 || cx + half > dw.x2) { dw.drift = -dw.drift; d.x += dw.drift * 2; }
    if (t % 24 === 0) state.particles.push({ pos: { x: cx + rnd(-d.h * 0.4, d.h * 0.4), y: s }, vel: { x: rnd(-0.6, 0.6), y: 0 }, life: 20, color: (dw.spray ?? CLEAR)[0], size: 2 });
    // (the last bubble, out of the back end of him: up, and pop)
    if (t === DROWN_RISE + 22) {
      const bx = cx - face * d.h * 0.06;
      for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: bx + rnd(-2, 2), y: s - 2 }, vel: { x: rnd(-0.2, 0.2), y: -rnd(0.6, 1.2) }, life: 16 + i * 4, color: 'rgba(224, 242, 254, 0.85)', size: 6 - i * 1.5 });
      playSound('fart', 0.45, -2); playSound('glug', 0.4, -6);
    }
  }
  d.y = dw.cy - d.h / 2;
  if (t < DROWN_BURST) return true;
  // And up he goes: the burst, the water thrown up with it, the meat raining back into it
  const bx = d.x + d.w / 2;
  gibs(state, bx, s - 4, 0, 1.25);
  spray(state, dw, bx, s, 30, 11, d.h * 0.35);
  playSound('splash', 0.9, -4);
  shakeScreen(state, 6);
  return false;
};
