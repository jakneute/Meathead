// Water in the streets (Norway's wave pool, Venice's canals): a stretch of the promenade dug out and filled. He swims in
// it (the stage's waterBodyAt), climbs out by a step just under the surface at each end; walkers keep out of it (a
// danger zone along it: hazardHit.ts), knocked in they drown (drown.ts) and float up. Painted crude: the dug-out's walls going back, the
// water banded, its surface lit, drawn over whoever's in it (drawFront) so they're in it, not on it.

import type { GameState } from '../../m1/game/core/state';
import type { WaterBody } from '../../m1/game/stages/index';
import type { GroundRun } from '../../m1/game/core/terrain';
import { ledge } from './section';
import { setHazardZones } from '../hazardHit';
import { GY } from './geometry';
import { type Ctx, type View, box, mix, at, ramp6, hour, INK, LIP, onScreen } from './kit';

export interface Pool {
  key: string;
  /** World x it runs between (its walls), how far down its surface is under the promenade, and its bed. */
  a: number; b: number; surface: number; bed: number;
  /** Its water, its walls. */
  col: string; wall: string;
}

/** The promenade's runs with the pools dug out of it (x0..x1, flat at GY otherwise). */
export const runsAround = (x0: number, x1: number, pools: Pool[], surface = 'hard'): GroundRun[] => {
  const out: GroundRun[] = [];
  let x = x0;
  for (const p of [...pools].sort((u, v) => u.a - v.a)) {
    if (p.a > x) out.push({ x1: x, y1: GY, x2: p.a, y2: GY, surface });
    out.push({ x1: p.a, y1: GY + p.bed, x2: p.b, y2: GY + p.bed, surface: 'hard' });
    x = p.b;
  }
  if (x < x1) out.push({ x1: x, y1: GY, x2: x1, y2: GY, surface });
  return out;
};

/** The steps to climb out by (just under the surface, at each end). */
export const poolSteps = (state: GameState, p: Pool) => {
  ledge(state, p.a, GY + p.surface + 26, 54, { hidden: true, tag: `${p.key}-step` });
  ledge(state, p.b - 54, GY + p.surface + 26, 54, { hidden: true, tag: `${p.key}-step` });
};

export const poolAt = (pools: Pool[], x: number, y: number): WaterBody | null => {
  for (const p of pools) if (x > p.a && x < p.b && y > GY + p.surface - 14 && y < GY + p.bed + 10) return { key: p.key, x1: p.a, x2: p.b, surface: GY + p.surface, bottom: GY + p.bed, kind: 'clean' };
  return null;
};

/** Walkers keep out (they stop at the edge; knocked in is another matter). */
export const poolZones = (state: GameState, owner: string, pools: Pool[]) =>
  setHazardZones(state, owner, pools.map(p => ({ x0: p.a, x1: p.b, y0: GY - 4, y1: GY + p.bed, ground: true })));

/** The dug-out behind the water: its far wall going back, its two end walls, the bed. */
export const drawPoolBack = (c: Ctx, v: View, p: Pool) => {
  if (!onScreen(v, p.a, p.b)) return;
  const W = ramp6(hour(p.wall));
  const top = GY, bot = GY + p.bed;
  // (the far wall: from the promenade's back edge down to the bed, going back)
  const [ax, ay] = at(v.eye, p.a, top, 0.86), [bx] = at(v.eye, p.b, top, 0.86), [, by] = at(v.eye, p.a, bot, 0.86);
  box(c, ax, ay, bx - ax, by - ay, W[1]);
  for (let y = ay + 14; y < by; y += 18) box(c, ax, y, bx - ax, 1, W[0]);
  // (the end walls, seen going back, and the bed)
  box(c, p.a, top, 8, p.bed, W[2]); box(c, p.b - 8, top, 8, p.bed, W[2]);
  box(c, p.a, top, 2, p.bed, W[3]); box(c, p.b - 2, top, 2, p.bed, W[0]);
  box(c, p.a, bot - 6, p.b - p.a, 6, W[0]);
  // (the steps out, lit lips: somewhere to stand)
  for (const sx of [p.a, p.b - 54]) { box(c, sx, GY + p.surface + 26, 54, 10, W[3]); box(c, sx, GY + p.surface + 26, 54, 2, LIP[2]); }
};

/** The water itself, over whoever's in it: banded deeper down, the surface's lit line (`wave` lifts it at x). */
export const drawPoolFront = (c: Ctx, v: View, p: Pool, f: number, wave?: (x: number) => number) => {
  if (!onScreen(v, p.a, p.b)) return;
  const col = hour(p.col), deep = mix(col, INK, 0.45);
  const s = GY + p.surface;
  c.globalAlpha = 0.62;
  for (let x = p.a; x < p.b; x += 8) {
    const lift = (wave?.(x) ?? 0) + Math.sin(f * 0.06 + x * 0.05) * 2;
    const y = s - lift;
    box(c, x, y, 8, 30, col); box(c, x, y + 30, 8, p.bed - p.surface - 30 + lift, deep);
  }
  c.globalAlpha = 1;
  for (let x = p.a; x < p.b; x += 8) {
    const lift = (wave?.(x) ?? 0) + Math.sin(f * 0.06 + x * 0.05) * 2;
    box(c, x, s - lift - 1, 8, 2, mix(col, '#FFFFFF', 0.45));
    if (((x / 8) | 0) % 5 === (f >> 4) % 5) box(c, x + 2, s - lift + 4, 4, 1, mix(col, '#FFFFFF', 0.3));
  }
};
