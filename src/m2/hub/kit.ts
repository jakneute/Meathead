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
/** A tree's round crown in stepped shells (shade, body, lit, a highlight), each lumped. */
export const crown = (c: Ctx, x: number, y: number, r: number, R: string[]) => {
  const blob = (cx: number, cy: number, rr: number, col: string) => { c.fillStyle = col; c.beginPath(); c.arc(cx, cy, rr, 0, Math.PI * 2); c.fill(); };
  blob(x, y, r + 1, INK);
  blob(x + r * 0.1, y + r * 0.1, r, R[1]);
  blob(x - r * 0.12, y - r * 0.12, r * 0.78, R[2]);
  blob(x - r * 0.3, y - r * 0.3, r * 0.45, R[3]);
  checker(c, x - r * 0.75, y - r * 0.1, r * 1.2, 2, R[2]);
  blob(x - r * 0.4, y - r * 0.42, r * 0.18, R[4]);
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
