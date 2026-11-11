// The second pass's brushes for FAIRY LAND, JUNGLE LAND and FOREIGN LANDS (lm/fairy.ts, jungle.ts, foreign.ts): color
// ramps, stepped shading with its seams dithered, courses, cones. One light for all of it: the sunrise, upper right
// (the east: the way they're going), so right faces are lit and left faces fall into shade. Whole pixels, nothing
// random (hash), painted once into the landmark's stamp.

import { type Ctx, INK, R, poly } from './kit';

const hx = (c: string) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
export const mix = (a: string, b: string, k: number) => { const A = hx(a), B = hx(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
/** A color's five steps: shadow, shade, itself, lit, highlight (cool shadows, warm lights: the sunrise). */
export const ramp = (c: string) => [mix(c, '#1A1030', 0.55), mix(c, '#1A1030', 0.28), c, mix(c, '#FFE8C0', 0.3), mix(c, '#FFFFFF', 0.62)];
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** A checker of single pixels over a rect (the dither between two bands). */
export const dith = (g: Ctx, x: number, y: number, w: number, h: number, col: string, ph = 0) => {
  g.fillStyle = col; x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  for (let yy = 0; yy < h; yy++) for (let xx = (yy + ph) & 1; xx < w; xx += 2) g.fillRect(x + xx, y + yy, 1, 1);
};
/** A flat wall, inked: shade down its left, lit down its right (seams dithered), a highlight along the top, shadow at
 *  the foot. */
export const wall = (g: Ctx, x: number, y: number, w: number, h: number, P: string[], ink = true) => {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  if (ink) R(g, x - 1, y - 1, w + 2, h + 2, INK);
  R(g, x, y, w, h, P[2]);
  const a = Math.max(1, Math.round(w * 0.22)), b = Math.max(1, Math.round(w * 0.3));
  R(g, x, y, a, h, P[1]); if (w > 8) dith(g, x + a, y, 1, h, P[1]);
  R(g, x + w - b, y, b, h, P[3]); if (w > 8) dith(g, x + w - b - 1, y, 1, h, P[3], 1);
  R(g, x, y, w, 1, P[4]); R(g, x, y + h - 1, w, 1, P[0]);
};
/** A round tower's drum: five bands across, dark at the left, the light well right of middle, seams dithered. */
export const drum = (g: Ctx, x: number, y: number, w: number, h: number, P: string[], ink = true) => {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  if (ink) R(g, x - 1, y - 1, w + 2, h + 1, INK);
  const cut = [0, 0.16, 0.42, 0.66, 0.86, 1], idx = [0, 1, 2, 3, 4];
  // (dark, shade, body, lit, then a turn back to body at the right rim)
  const cols = [P[0], P[1], P[2], P[3], P[2]];
  for (const i of idx) { const a = Math.round(x + cut[i] * w), b = Math.round(x + cut[i + 1] * w); R(g, a, y, b - a, h, cols[i]); if (i > 0 && w >= 8) dith(g, a - 1, y, 1, h, cols[i], i); }
  if (w >= 6) R(g, Math.round(x + w * 0.72), y, 1, h, P[4]);
};
/** Mortar lines across a wall every `step`, and a block picked out now and then. */
export const courses = (g: Ctx, x: number, y: number, w: number, h: number, col: string, step = 5, lite?: string) => {
  for (let yy = y + step - 1, r = 0; yy < y + h - 1; yy += step, r++) {
    R(g, x, yy, w, 1, col);
    for (let xx = x + ((r % 2) * step) + 2; xx < x + w - 1; xx += step * 2) R(g, xx, yy - step + 1, 1, step - 1, col);
    if (lite && w > 12) R(g, x + 2 + Math.floor(hash(yy * 3.1 + x) * (w - 8)), yy - step + 2, 3, Math.max(1, step - 3), lite);
  }
};
/** A cone roof (a witch's hat): its foot's middle at (cx, y), `hw` half across, `h` tall: shade left, lit right, inked. */
export const cone = (g: Ctx, cx: number, y: number, hw: number, h: number, P: string[]) => {
  poly(g, [cx - hw - 1, y + 1, cx, y - h - 2, cx + hw + 1, y + 1], INK, false);
  poly(g, [cx - hw, y, cx, y - h, cx + hw, y], P[2], false);
  poly(g, [cx - hw, y, cx, y - h, cx - hw * 0.35, y], P[1], false);
  poly(g, [cx + hw * 0.3, y, cx, y - h, cx + hw, y], P[3], false);
  poly(g, [cx + hw * 0.62, y, cx + 0.5, y - h + 2, cx + hw * 0.82, y], P[4], false);
};
/** A gable roof between x0 and x1, eaves at y, ridge `h` up at `at` (0..1 along it): shade left of the ridge. */
export const gable = (g: Ctx, x0: number, x1: number, y: number, h: number, P: string[], at = 0.5) => {
  const mx = x0 + (x1 - x0) * at;
  poly(g, [x0 - 2, y + 1, mx, y - h - 1, x1 + 2, y + 1], INK, false);
  poly(g, [x0 - 1, y, mx, y - h, x1 + 1, y], P[3], false);
  poly(g, [x0 - 1, y, mx, y - h, mx, y], P[1], false);
};
/** Snow lying along a top: a white cap with a blue-gray underside, lumpy. */
export const snowCap = (g: Ctx, x: number, y: number, w: number, thick = 2) => {
  R(g, x, y - thick, w, thick, '#FFFFFF'); R(g, x, y, w, 1, '#C4CCE4');
  for (let xx = x + 1; xx < x + w - 2; xx += 5) if (hash(xx * 1.7 + y) > 0.45) R(g, xx, y - thick - 1, 3, 1, '#FFFFFF');
};
/** A pennant on a stick from (x, y) up `h`, flying right. */
export const pennant = (g: Ctx, x: number, y: number, h: number, col: string, pole = '#C8962A') => {
  R(g, x, y - h, 1, h, pole);
  poly(g, [x + 1, y - h, x + 7, y - h + 2, x + 1, y - h + 4], col, false);
};
/** A leafy crown in four steps (lit upper right), lumped. */
export const crown = (g: Ctx, cx: number, cy: number, r: number, L: string[]) => {
  const blob = (x: number, y: number, rr: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(Math.round(x), Math.round(y), Math.max(1, rr), Math.max(1, rr * 0.8), 0, 0, Math.PI * 2); g.fill(); };
  blob(cx, cy, r + 1, INK); blob(cx, cy, r, L[0]);
  blob(cx + r * 0.1, cy - r * 0.1, r * 0.82, L[1]); blob(cx + r * 0.25, cy - r * 0.22, r * 0.55, L[2]); blob(cx + r * 0.36, cy - r * 0.34, r * 0.26, L[3]);
  for (let k = 0; k < Math.round(r * 0.9); k++) { const a = hash(k * 3.3 + cx) * 6.28, d = hash(k * 7.1 + cy) * r * 0.8; R(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8, 1, 1, L[Math.cos(a) > 0 && Math.sin(a) < 0.3 ? 3 : 0]); }
};
