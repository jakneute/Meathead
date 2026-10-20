// The amphitheater's painting helpers for its people at boss grade (STUPID DAD, the guard, the animatronic family):
// color ramps (light, base, shade, deep, line) in stepped bands with a dithered seam between each, every material its
// own darkest tone for an outline (Piper's way: fantasy/piper.ts). Everything's drawn about a local origin (translate
// first): the bands' fills run ±4000 px.

import { mix } from '../kit';

export type Ctx = CanvasRenderingContext2D;
/** light, base, shade, deep, line */
export type Ramp = readonly [string, string, string, string, string];

/** A ramp round a color: lit, itself, two shades, its line. */
export const rampOf = (col: string, line = '#1A1028'): Ramp => [mix(col, '#FFFFFF', 0.32), col, mix(col, line, 0.22), mix(col, line, 0.42), mix(col, line, 0.72)];
/** A ramp pulled toward a color (dimmed, greened, powered down). */
export const rampMix = (r: Ramp, col: string, k: number): Ramp => [mix(r[0], col, k), mix(r[1], col, k), mix(r[2], col, k), mix(r[3], col, k), mix(r[4], col, k * 0.5)];

const dithers = new Map<string, CanvasPattern | string>();
/** A 2x2 checker of a color (the dither between two bands), made the once per color. */
export const dith = (c: Ctx, color: string): CanvasPattern | string => {
  let p = dithers.get(color);
  if (p) return p;
  if (typeof document === 'undefined') return color;
  const cv = document.createElement('canvas'); cv.width = 2; cv.height = 2;
  const g = cv.getContext('2d')!;
  g.fillStyle = color; g.fillRect(0, 0, 1, 1); g.fillRect(1, 1, 1, 1);
  p = c.createPattern(cv, 'repeat') ?? color;
  dithers.set(color, p);
  return p;
};

const BIG = 4000;
/** A shape lit from the left: the base, a lit band down its left, a shade then a deep band down its right (stepped, a
 *  dithered seam between each), outlined in its line tone. `flip`: lit from the right. */
export const shape = (c: Ctx, path: () => void, r: Ramp, x0: number, x1: number, lw = 1, flip = false) => {
  c.beginPath(); path(); c.fillStyle = r[1]; c.fill();
  c.save(); c.clip();
  const w = x1 - x0;
  const band = (a: number, b: number, col: string | CanvasPattern) => { c.fillStyle = col; const l = flip ? x1 - b * w : x0 + a * w, ww = (b - a) * w; c.fillRect(l - (a === 0 && !flip ? 4 : 0), -BIG, ww + 4, BIG * 2); };
  band(0, 0.16, r[0]); band(0.16, 0.22, dith(c, r[0]));
  band(0.57, 0.64, dith(c, r[2])); band(0.64, 1.05, r[2]);
  band(0.8, 0.86, dith(c, r[3])); band(0.86, 1.05, r[3]);
  c.restore();
  c.beginPath(); path(); c.strokeStyle = r[4]; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke();
};
/** A shape lit from above (a belly, a chin, a cushion): lit across its top, shaded across its bottom. */
export const shapeTop = (c: Ctx, path: () => void, r: Ramp, y0: number, y1: number, lw = 1) => {
  c.beginPath(); path(); c.fillStyle = r[1]; c.fill();
  c.save(); c.clip();
  const h = y1 - y0;
  c.fillStyle = r[0]; c.fillRect(-BIG, y0 - 4, BIG * 2, h * 0.2 + 4);
  c.fillStyle = dith(c, r[0]); c.fillRect(-BIG, y0 + h * 0.2, BIG * 2, Math.max(1, h * 0.08));
  c.fillStyle = dith(c, r[2]); c.fillRect(-BIG, y0 + h * 0.6, BIG * 2, Math.max(1, h * 0.08));
  c.fillStyle = r[2]; c.fillRect(-BIG, y0 + h * 0.68, BIG * 2, h + 4);
  c.fillStyle = r[3]; c.fillRect(-BIG, y0 + h * 0.88, BIG * 2, h + 4);
  c.restore();
  c.beginPath(); path(); c.strokeStyle = r[4]; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke();
};
export const fill = (c: Ctx, color: string | CanvasPattern, path: () => void) => { c.fillStyle = color; c.beginPath(); path(); c.fill(); };
export const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, color: string | CanvasPattern, rot = 0) => fill(c, color, () => c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, Math.PI * 2));
export const px = (c: Ctx, x: number, y: number, w: number, h: number, color: string | CanvasPattern) => { c.fillStyle = color; c.fillRect(x, y, w, h); };
export const line = (c: Ctx, pts: number[], w: number, color: string, cap: CanvasLineCap = 'round') => {
  c.strokeStyle = color; c.lineWidth = w; c.lineCap = cap; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.stroke();
};
/** A limb: a tapered tube from (x1, y1) r1 to (x2, y2) r2, in its ramp, `sag` flab hanging off its underside. */
export const limb = (c: Ctx, x1: number, y1: number, r1: number, x2: number, y2: number, r2: number, r: Ramp, sag = 0, lw = 1) => {
  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
  const s = ny > 0 ? 1 : -1;
  const path = () => {
    c.moveTo(x1 + nx * r1, y1 + ny * r1);
    c.lineTo(x2 + nx * r2, y2 + ny * r2);
    c.arc(x2, y2, r2, Math.atan2(ny, nx), Math.atan2(-ny, -nx));
    c.quadraticCurveTo((x1 + x2) / 2 - nx * (r1 + sag) * s, (y1 + y2) / 2 - ny * (r1 + sag) * s + sag, x1 - nx * r1, y1 - ny * r1);
    c.arc(x1, y1, r1, Math.atan2(-ny, -nx), Math.atan2(ny, nx));
  };
  shape(c, path, r, Math.min(x1, x2) - Math.max(r1, r2), Math.max(x1, x2) + Math.max(r1, r2), lw);
};
/** A little spark burst (an animatronic shorting out). */
export const sparks = (c: Ctx, x: number, y: number, f: number, n = 5) => {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + f * 0.7, r = 3 + ((f * 3 + i * 5) % 7);
    line(c, [x, y, x + Math.cos(a) * r, y + Math.sin(a) * r], 1, i % 2 ? '#FDE047' : '#FFFFFF');
  }
  ell(c, x, y, 2, 2, '#FFFFFF');
};
