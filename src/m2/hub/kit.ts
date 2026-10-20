// The hub's paint kit: flat fills on the art's grid, SNES style. Ramps (six steps, darkest first), stepped shading
// (lit down the left, shaded down the right, a row of dither at each seam), inked edges, dithered blends.

import { INK } from '../../m1/game/render/npc/kit';
import { mix, hash } from '../../m1/game/render/backdrops/core';
import { checker } from '../../m1/game/render/pixelArt';

export type Ctx = CanvasRenderingContext2D;
export { INK, mix, hash, checker };

export const box = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
/** A material's ramp round a color, darkest first: shadow, shade, a touch under, itself, lit, highlight. */
export const R6 = (col: string) => [mix(col, INK, 0.6), mix(col, INK, 0.34), mix(col, INK, 0.14), col, mix(col, '#FFFFFF', 0.3), mix(col, '#FFFFFF', 0.58)];

/** Inked round a path, filled. */
export const inked = (c: Ctx, path: () => void, fill: string, line = 1) => {
  c.beginPath(); path(); c.fillStyle = fill; c.fill();
  c.lineJoin = 'round'; c.strokeStyle = INK; c.lineWidth = line; c.stroke();
};
/** A box in stepped shade: its body, a lit strip down the left (dithered off), a shaded band down the right (dithered
 * in), an inked edge. No lit top (none of the hub's buildings is to stand on). */
export const slab = (c: Ctx, x: number, y: number, w: number, h: number, R: string[], ink = true) => {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  if (ink) box(c, x - 1, y - 1, w + 2, h + 1, INK);
  box(c, x, y, w, h, R[3]);
  const lw = Math.max(2, Math.round(w * 0.1) & ~1), sw = Math.max(2, Math.round(w * 0.22) & ~1);
  box(c, x, y, lw, h, R[4]); checker(c, x + lw, y, 2, h, R[4]);
  box(c, x + w - sw, y, sw, h, R[2]); checker(c, x + w - sw - 2, y, 2, h, R[2], 1);
  box(c, x, y, w, 2, R[2]);
};
/** Bands down a box (top to bottom through the colors), a row of dither at each seam. */
export const bands = (c: Ctx, x: number, y: number, w: number, h: number, cols: string[]) => {
  const bh = h / cols.length;
  cols.forEach((col, i) => box(c, x, y + i * bh, w, bh + 1, col));
  for (let i = 1; i < cols.length; i++) checker(c, x, Math.round(y + i * bh) - 2, w, 2, cols[i]);
};
/** A window: frame, glass (the sky by day, lit after dark), a glint. */
export const pane = (c: Ctx, x: number, y: number, w: number, h: number, frame: string, lit: boolean, glass = '#9CC8E8') => {
  box(c, x - 1, y - 1, w + 2, h + 2, frame);
  box(c, x, y, w, h, lit ? '#FFD87A' : glass);
  box(c, x, y + h - Math.max(2, Math.round(h * 0.35)), w, Math.max(2, Math.round(h * 0.35)), lit ? '#F0A83E' : mix(glass, '#1E3A5A', 0.3));
  if (!lit) box(c, x + 1, y + 1, 1, Math.max(1, h - 3), '#FFFFFF');
};
/** A tree's crown: a heap of leafy lumps, each in stepped shells (shade, body, lit, a highlight), the dark of the ones
 *  behind showing between; leaf tufts round the edge, a row of dither at each step. */
export const crown = (c: Ctx, x: number, y: number, r: number, R: string[]) => {
  const blob = (cx: number, cy: number, rr: number, col: string) => { c.fillStyle = col; c.beginPath(); c.arc(cx, cy, rr, 0, Math.PI * 2); c.fill(); };
  const lumps: [number, number, number][] = [[0, 0.12, 0.78], [-0.42, 0.2, 0.55], [0.44, 0.22, 0.52], [-0.22, -0.32, 0.56], [0.26, -0.3, 0.5], [0, -0.55, 0.42]];
  for (const [dx, dy, k] of lumps) blob(x + dx * r, y + dy * r, r * k + 1, INK);
  for (const [dx, dy, k] of lumps) blob(x + dx * r + r * 0.06, y + dy * r + r * 0.06, r * k, R[1]);
  for (const [dx, dy, k] of lumps) blob(x + dx * r - r * k * 0.12, y + dy * r - r * k * 0.14, r * k * 0.74, R[2]);
  for (const [dx, dy, k] of lumps) blob(x + dx * r - r * k * 0.28, y + dy * r - r * k * 0.32, r * k * 0.42, R[3]);
  for (const [dx, dy, k] of lumps) checker(c, x + dx * r - r * k * 0.7, y + dy * r + r * k * 0.05, r * k * 1.2, 2, R[2]);
  for (const [dx, dy, k] of lumps) blob(x + dx * r - r * k * 0.38, y + dy * r - r * k * 0.42, Math.max(1, r * k * 0.14), R[4]);
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, rr = r * (0.86 + hash(i + x * 0.1) * 0.12); c.fillStyle = i % 2 ? R[1] : R[2]; c.fillRect(Math.round(x + Math.cos(a) * rr), Math.round(y + Math.sin(a) * rr * 0.92), 2, 2); }
};
/** A flag on its pole, waving (live: it's never still). */
export const flag = (c: Ctx, x: number, top: number, w: number, h: number, cols: string[], f: number, seed = 0) => {
  box(c, x - 1, top - 2, 2, h * 3, '#57534E');
  c.beginPath();
  const n = 4, bh = h / cols.length;
  for (let b = 0; b < cols.length; b++) {
    c.fillStyle = cols[b]; c.beginPath();
    for (let k = 0; k <= n; k++) { const u = k / n, wy = Math.sin(f * 0.09 + seed + u * 3) * 2 * u; c.lineTo(x + u * w, top + b * bh + wy); }
    for (let k = n; k >= 0; k--) { const u = k / n, wy = Math.sin(f * 0.09 + seed + u * 3) * 2 * u; c.lineTo(x + u * w, top + (b + 1) * bh + wy); }
    c.fill();
  }
};
