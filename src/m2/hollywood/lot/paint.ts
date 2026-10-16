// The backlot's painting kit (the final pass: peak SNES, on the boulevard's kit (blvd/kit.ts) so the land's of a piece:
// the same ink, the same one eye, the fronts at FRONT_D with the lot strip behind them to BACK_D): the backlot's own
// materials in stepped ramps, darkest first (New York Street's brick, the western town's dirt and its weathered boards,
// the suburb's lawn and clapboard and shingle, the dumpster's green, the bulldozer's yellow, corrugated siding), which
// zone of the lot is where (what the ground's made of), and the pieces they're built from (a lit lip along anything he
// stands on, boards, bricks, corrugated sheet, a steel tube).

import { type Ctx, INK, box, checker, mix, hash, LIP } from '../blvd/kit';

export const BRICK = ['#2A120E', '#48201A', '#6A2E22', '#8A3E2C', '#A8563C', '#C27458'];
export const DIRT = ['#2E2014', '#4A3420', '#6A4C2E', '#8C6A42', '#AC885A', '#CCA876'];
export const BOARD = ['#2C1C10', '#48301C', '#6A4828', '#8C6438', '#AC8250', '#C8A06C'];
export const LAWN = ['#12260E', '#1C3A14', '#28521C', '#387026', '#4E8C34', '#6EAA4A'];
export const SHINGLE = ['#1A1418', '#2A2228', '#3C3238', '#50444A', '#685A60', '#827478'];
/** The dumpster's steel. */
export const BIN = ['#0C2414', '#14381E', '#1C4E2A', '#266838', '#38844A', '#5AA466'];
/** Construction yellow (the bulldozer). */
export const CAT = ['#3A2A04', '#5E4406', '#8A640A', '#C08E10', '#E8B820', '#FFE070'];
/** Corrugated siding (the warehouse's walls, outside), a cool warm-gray. */
export const SIDING = ['#201D23', '#2D2930', '#3B363F', '#4D4752', '#635C68', '#837B88'];
/** Pool tile (the flood tank's walls under what's in it). */
export const TILE = ['#0E2A3A', '#16405A', '#20587A', '#2E749A', '#4A94B8', '#7AB8D4'];

// ---------------------------------------------------------------------------------------------------------------
// Where's what (x from the section's start)

export type Zone = 'lot' | 'ny' | 'apron' | 'west' | 'burb' | 'gift';
/** The lot's stretches: what the ground's made of along it. */
export const ZONES: [number, number, Zone][] = [[-600, 1500, 'lot'], [1500, 3000, 'ny'], [3000, 4700, 'apron'], [4700, 6500, 'west'], [6500, 7950, 'burb'], [7950, 9600, 'gift']];

// ---------------------------------------------------------------------------------------------------------------
// Pieces

/** The lit lip along the top of anything he stands on (`w` wide, its top at y): warm, catching the light, inked over,
 *  shaded under (standable reads standable). */
export const lip = (g: Ctx, x: number, y: number, w: number) => {
  box(g, x - 1, y - 1, w + 2, 1, INK);
  box(g, x, y, w, 3, LIP[2]); box(g, x, y, w, 1, LIP[3]); box(g, x, y + 3, w, 1, LIP[0]);
};
/** Boards running along (a boardwalk, a porch's floor, a crate's slats): each board its own shade of the ramp, their
 *  butt joints staggered, nail heads, a grain streak. `R` a ramp6 (darkest first). */
export const boards = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], bh = 6, seed = 0) => {
  for (let yy = 0, row = 0; yy < h; yy += bh, row++) {
    const rh = Math.min(bh, h - yy);
    for (let xx = -((row * 37 + seed) % 60), k = 0; xx < w; xx += 60, k++) {
      const a = Math.max(0, xx), b = Math.min(w, xx + 60);
      if (b <= a) continue;
      const t = hash(seed + row * 7.3 + k * 3.1), col = R[t > 0.66 ? 4 : t > 0.25 ? 3 : 2];
      box(g, x + a, y + yy, b - a, rh, col);
      box(g, x + a, y + yy, b - a, 1, mix(col, '#FFFFFF', 0.18));
      if (rh > 3) box(g, x + a, y + yy + rh - 1, b - a, 1, R[1]);
      if (b - a > 20) { box(g, x + a + 6 + ((k * 13) % 20), y + yy + 2, 12, 1, R[1]); box(g, x + a + 3, y + yy + 2, 1, 1, R[0]); box(g, x + b - 4, y + yy + 2, 1, 1, R[0]); }
      if (b < w) box(g, x + b - 1, y + yy, 1, rh, R[0]);
    }
  }
};
/** Upright boards (board-and-batten: a false front's siding): planks up, a batten over every seam, lit down its left. */
export const battens = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], seed = 0) => {
  for (let xx = 0, k = 0; xx < w; xx += 12, k++) {
    const t = hash(seed + k * 2.7), col = R[t > 0.7 ? 4 : t > 0.25 ? 3 : 2], pw = Math.min(12, w - xx);
    box(g, x + xx, y, pw, h, col);
    for (let yy = 8 + ((k * 23) % 30); yy < h - 4; yy += 46) box(g, x + xx + 3, y + yy, 1, 10, R[1]);
    box(g, x + xx + pw - 3, y, 3, h, R[1]); box(g, x + xx + pw - 3, y, 1, h, R[4]);
    if (hash(seed + k * 5.1) > 0.7) box(g, x + xx + 2, y + h * hash(k + seed), 3, 3, R[0]);
  }
};
/** Brick courses (running bond), each brick a step of the ramp by hash, mortar between; `R` a ramp6. */
export const bricks = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], mortar: string, seed = 0) => {
  box(g, x, y, w, h, mortar);
  for (let yy = 0, row = 0; yy < h; yy += 6, row++) for (let xx = row % 2 ? -8 : 0; xx < w; xx += 16) {
    const a = Math.max(0, xx), b = Math.min(w, xx + 15), t = hash(seed + xx * 0.31 + yy * 0.77);
    if (b <= a) continue;
    box(g, x + a, y + yy, b - a, Math.min(5, h - yy), R[t > 0.85 ? 4 : t > 0.35 ? 3 : 2]);
    box(g, x + a, y + yy, b - a, 1, R[t > 0.85 ? 5 : 4]);
  }
};
/** Corrugated sheet (ribs up it): lit and shaded rib by rib. */
export const corrugated = (g: Ctx, x: number, y: number, w: number, h: number, R: string[]) => {
  box(g, x, y, w, h, R[2]);
  for (let xx = 0; xx < w; xx += 6) { box(g, x + xx, y, 2, h, R[3]); box(g, x + xx, y, 1, h, R[4]); box(g, x + xx + 4, y, 2, h, R[1]); }
};
/** A steel tube from (ax, ay) to (bx, by): inked, its color, lit along one side. */
export const tube = (c: Ctx, ax: number, ay: number, bx: number, by: number, w: number, col: string, hi: string) => {
  c.lineCap = 'butt';
  c.strokeStyle = INK; c.lineWidth = w + 2; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
  c.strokeStyle = hi; c.lineWidth = 1; c.beginPath(); c.moveTo(ax - w / 3, ay - w / 3); c.lineTo(bx - w / 3, by - w / 3); c.stroke();
};
/** A slab of stepped shade under something (a shadow on the ground), dithered at its edge. */
export const shadowUnder = (g: Ctx, x: number, y: number, w: number, h: number) => {
  checker(g, x - 2, y, w + 4, h, 'rgba(20, 10, 14, 0.35)', 0, 1);
  box(g, x, y, w, h, 'rgba(20, 10, 14, 0.25)');
};
