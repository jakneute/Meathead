// Water in the streets (Norway's wave pool, Venice's canals): a stretch of the promenade dug out and filled. He swims in
// it (the stage's waterBodyAt), climbs out by a step just under the surface at each end; walkers keep out of it (a
// danger zone along it: hazardHit.ts), knocked in they drown (drown.ts) and float up.
//
// Painted on the one eye (the SNES pass): the dug-out going back (its far wall in courses of pool tile, darker and
// bluer under the water line, the bed's tiles going back, its end walls going back as faces, the coping round its
// back edge, the promenade going on behind it to the railing), the water's own surface going back (banded, glinting),
// and at the play plane the water over whoever's in it (drawFront), banded deeper down, its lit surface line, caustics,
// so they're in it, not on it.

import type { GameState } from '../../m1/game/core/state';
import type { WaterBody } from '../../m1/game/stages/index';
import type { GroundRun } from '../../m1/game/core/terrain';
import { ledge } from './section';
import { setHazardZones } from '../hazardHit';
import { GY } from './geometry';
import { type Ctx, type View, box, mix, at, poly, checker, ramp6, hour, INK, LIP, onScreen, pavingBack, sideBack, topBack, lip, hash } from './kit';

export interface Pool {
  key: string;
  /** World x it runs between (its walls), how far down its surface is under the promenade, and its bed. */
  a: number; b: number; surface: number; bed: number;
  /** Its water, its walls. */
  col: string; wall: string;
}

/** How far back the dug-out goes (its far wall). */
const FAR_D = 0.86;

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

/** The water's color under the hour, `k` deeper (0 the surface, 1 the bed). */
const waterAt = (p: Pool, k: number) => mix(hour(p.col), mix(hour(p.col), INK, 0.6), k);

/** The dug-out behind the water: the promenade going on behind it, its far wall going down in pool tile, the bed, its
 *  two end walls going back, the water's surface going back, the steps out (lit lips: somewhere to stand). */
export const drawPoolBack = (c: Ctx, v: View, p: Pool) => {
  if (!onScreen(v, p.a, p.b)) return;
  const eye = v.eye, W = ramp6(hour(p.wall)), top = GY, bot = GY + p.bed, sY = GY + p.surface;
  const P = (x: number, y: number, d: number) => at(eye, x, y, d);
  // (the promenade behind it, from its back coping to the railing)
  pavingBack(c, v, p.a, p.b, FAR_D);
  // (the far wall: from the coping down to the bed, in courses of tile, the water line on it; bluer and darker under it)
  const [ax, ay] = P(p.a, top, FAR_D), [bx] = P(p.b, top, FAR_D), [, sy] = P(p.a, sY, FAR_D), [, by] = P(p.a, bot, FAR_D);
  box(c, ax, ay, bx - ax, sy - ay, W[3]);
  box(c, ax, sy, bx - ax, by - sy, mix(W[2], waterAt(p, 0.5), 0.55));
  for (let y = ay + 6, row = 0; y < by; y += 10, row++) {
    const under = y > sy;
    box(c, ax, y, bx - ax, 1, under ? mix(W[1], waterAt(p, 0.7), 0.5) : W[1]);
    for (let x = ax + (row % 2) * 8; x < bx; x += 16) box(c, x, y - 9, 1, 9, under ? mix(W[1], waterAt(p, 0.6), 0.5) : W[2]);
  }
  // (the band of trim tile along the water line, a mosaic stripe)
  box(c, ax, sy - 4, bx - ax, 4, mix(W[4], hour('#1E40AF'), 0.5)); for (let x = ax; x < bx; x += 6) box(c, x, sy - 4, 3, 2, mix(W[5], hour('#60A5FA'), 0.4));
  // (the bed going back: tile, lane lines; its end walls going back as faces, in courses)
  topBack(c, eye, p.a, p.b, bot, 1, FAR_D, [W[0], W[1], mix(W[1], waterAt(p, 0.8), 0.5), mix(W[2], waterAt(p, 0.8), 0.5), W[3], W[4]], 3);
  for (const [e, side] of [[p.a, 1], [p.b, -1]] as const) {
    if (sideBack(c, eye, e, side, top, bot, 1, FAR_D, W, 3, false)) {
      // (the water line along it, the courses)
      c.strokeStyle = mix(W[1], waterAt(p, 0.5), 0.4); c.lineWidth = 1; c.beginPath();
      for (let y = top + 10; y < bot; y += 10) { const [p0, q0] = P(e, y, 1), [p1, q1] = P(e, y, FAR_D); c.moveTo(p0, q0); c.lineTo(p1, q1); }
      c.stroke();
      poly(c, [P(e, sY, 1), P(e, sY, FAR_D), P(e, bot, FAR_D), P(e, bot, 1)], 'rgba(20, 40, 90, 0.28)');
    }
  }
  // (the water's surface going back, banded, a glint or two drifting)
  if (eye.y < sY - 1) {
    const S = [waterAt(p, 0.12), waterAt(p, 0.2), waterAt(p, 0.28)];
    c.globalAlpha = 0.72;
    for (let i = 0; i < 3; i++) { const d0 = 1 - ((1 - FAR_D) * i) / 3, d1 = 1 - ((1 - FAR_D) * (i + 1)) / 3; poly(c, [P(p.a, sY, d0), P(p.b, sY, d0), P(p.b, sY, d1), P(p.a, sY, d1)], S[i]); }
    c.globalAlpha = 1;
    for (let k = 0; k < (p.b - p.a) / 60; k++) {
      const d = FAR_D + 0.01 + hash(k * 3.7 + p.a) * (0.98 - FAR_D), gx = p.a + (((hash(k * 1.3) * (p.b - p.a) + v.f * (0.2 + hash(k) * 0.3)) % (p.b - p.a)) + (p.b - p.a)) % (p.b - p.a);
      const [px, py] = P(gx, sY, d);
      if ((v.f + k * 13) % 90 < 60) box(c, px, py, 6 * d, 1, mix(waterAt(p, 0), '#FFFFFF', 0.5));
    }
  }
  // (the coping round its back edge: a lit stone lip)
  box(c, ax - 1, ay - 2, bx - ax + 2, 3, INK); box(c, ax, ay - 2, bx - ax, 2, hour('#E8DFC8'));
  // (its end walls at the play plane, the front of the bed under it all)
  for (const sx of [p.a, p.b - 6]) { box(c, sx, top, 6, p.bed, W[2]); box(c, sx, top, 2, p.bed, W[4]); box(c, sx + 5, top, 1, p.bed, INK); }
  box(c, p.a, bot, p.b - p.a, 400, W[1]); checker(c, p.a, bot, p.b - p.a, 2, W[2], 0, 1); box(c, p.a, bot, p.b - p.a, 1, INK);
  // (the steps out: tiled treads, lit lips: somewhere to stand)
  for (const sx of [p.a, p.b - 54]) {
    const ty = GY + p.surface + 26;
    box(c, sx, ty, 54, bot - ty, W[2]); for (let y = ty + 10; y < bot; y += 10) box(c, sx, y, 54, 1, W[1]);
    box(c, sx, ty, 54, 10, W[3]); box(c, sx, ty + 9, 54, 1, INK);
    lip(c, sx, ty, 54);
  }
  void LIP;
};

/** The water itself, over whoever's in it: banded deeper down (dithered between), the surface's lit line (`wave` lifts
 *  it at x), its highlights drifting, caustic squiggles under it. */
export const drawPoolFront = (c: Ctx, v: View, p: Pool, f: number, wave?: (x: number) => number) => {
  if (!onScreen(v, p.a, p.b)) return;
  const s = GY + p.surface, depth = p.bed - p.surface;
  const bands = [waterAt(p, 0), waterAt(p, 0.18), waterAt(p, 0.36), waterAt(p, 0.55), waterAt(p, 0.75)];
  const x0 = Math.max(p.a, v.cam.x - 40), x1 = Math.min(p.b, v.cam.x + 840);
  c.globalAlpha = 0.64;
  for (let x = Math.floor((x0 - p.a) / 4) * 4 + p.a; x < x1; x += 4) {
    const lift = (wave?.(x) ?? 0) + Math.sin(f * 0.06 + x * 0.05) * 2, y = s - lift;
    box(c, x, y, 4, 8 + lift, bands[0]);
    for (let k = 1; k < bands.length; k++) box(c, x, s + 8 + ((k - 1) * (depth - 8)) / (bands.length - 1), 4, (depth - 8) / (bands.length - 1) + 1, bands[k]);
  }
  c.globalAlpha = 1;
  // (the dither where the bands meet)
  for (let k = 1; k < bands.length; k++) checker(c, x0, Math.round(s + 8 + ((k - 1) * (depth - 8)) / (bands.length - 1)) - 1, x1 - x0, 2, bands[k], 0, 2);
  // (caustics: squiggles of light on the way down)
  c.fillStyle = mix(bands[0], '#FFFFFF', 0.3);
  for (let i = 0; i < (x1 - x0) / 26; i++) {
    const cx = x0 + ((hash(i * 2.3 + p.a) * (x1 - x0) + f * 0.3) % (x1 - x0)), cy = s + 14 + hash(i * 5.1) * (depth * 0.5);
    if ((f + i * 17) % 120 < 80) { c.fillRect(Math.round(cx), Math.round(cy + Math.sin(f * 0.1 + i) * 2), 5, 1); c.fillRect(Math.round(cx) + 3, Math.round(cy + 1 + Math.sin(f * 0.1 + i) * 2), 4, 1); }
  }
  // (the surface: an ink line under a lit one, its highlights drifting)
  const hi = mix(bands[0], '#FFFFFF', 0.55), mid = mix(bands[0], '#FFFFFF', 0.3);
  for (let x = Math.floor((x0 - p.a) / 4) * 4 + p.a; x < x1; x += 4) {
    const lift = (wave?.(x) ?? 0) + Math.sin(f * 0.06 + x * 0.05) * 2, y = Math.round(s - lift);
    box(c, x, y - 1, 4, 2, hi); box(c, x, y + 1, 4, 1, mid);
    if (((x / 4) | 0) % 9 === (f >> 3) % 9) box(c, x + 1, y + 4, 6, 1, mid);
    // (foam where the wave's up)
    if ((wave?.(x) ?? 0) > 10 && ((x / 4) | 0) % 2 === 0) { box(c, x, y - 3, 4, 2, '#F0F9FF'); box(c, x + 1, y - 4, 2, 1, '#FFFFFF'); }
  }
};
