// The painting kit shared by four of the refights' places in hell (hollywood, frontier, adventure, foreign): everything
// here is painted once into a kept canvas (bake) and put down after; the only per-frame work is drawImage and a few
// fillRects (flames, embers). No hour of the day in any of it: hell has its own light.

import type { GameState } from '../../../../m1/game/core/state';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../../../../m1/constants';
import { bandedGradient, hazeBands, steppedGlow, checker } from '../../../../m1/game/render/pixelArt';
import { signText, signW, signH, type Look } from '../../../signLetters';

export type Ctx = CanvasRenderingContext2D;
export type { Look };
export { W, H, bandedGradient, hazeBands, steppedGlow, checker, signText, signW, signH };

export const INK = '#0A0806';
export const h01 = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const box = (g: Ctx, x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
export const poly = (g: Ctx, pts: [number, number][], col: string) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
export const line = (g: Ctx, pts: [number, number][], col: string, w = 1) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); };
const rgb = (c: string) => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
export const mix = (a: string, b: string, k: number) => { const A = rgb(a), B = rgb(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
/** A material's ramp round a color, darkest first (6 shades). */
export const ramp = (c: string, dark = INK, light = '#FFFFFF') => [mix(c, dark, 0.66), mix(c, dark, 0.4), mix(c, dark, 0.16), c, mix(c, light, 0.26), mix(c, light, 0.52)];

/** Painted once, kept. */
const cache = new Map<string, HTMLCanvasElement>();
export const bake = (key: string, w: number, h: number, paint: (g: Ctx) => void) => {
  let cv = cache.get(key);
  if (!cv) { cv = document.createElement('canvas'); cv.width = Math.ceil(w); cv.height = Math.ceil(h); const g = cv.getContext('2d')!; g.imageSmoothingEnabled = false; paint(g); cache.set(key, cv); }
  return cv;
};

/** A far layer's tile slid along the screen (screen space): `off` its scroll, `y` its top; wraps. */
export const strip = (c: Ctx, cv: HTMLCanvasElement, off: number, y: number) => {
  const w = cv.width, x0 = -((((Math.round(off)) % w) + w) % w);
  for (let x = x0; x < W; x += w) c.drawImage(cv, x, Math.round(y));
};
/** Paint the same thing at x and a tile either side, so nothing's cut at a tile's seam. */
export const wrap3 = (tw: number, fn: (dx: number) => void) => { for (const dx of [-tw, 0, tw]) fn(dx); };

/** Ashlar: a wall of dressed blocks in its ramp (R: 6 shades), courses `ch` tall, blocks about `bw` wide: each block a
 *  touch its own shade, lit along its top, shaded along its foot, the joints dark. */
export const ashlar = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], ch = 20, bw = 42, seed = 0) => {
  box(g, x, y, w, h, R[2]);
  for (let r = 0, yy = y; yy < y + h; yy += ch, r++) {
    const hh = Math.min(ch, y + h - yy);
    for (let k = -1, xx = x - (r % 2 ? bw / 2 : 0) - h01(r * 3.1 + seed) * 10; xx < x + w; k++) {
      const ww = Math.round(bw * (0.7 + h01(r * 7.3 + k * 1.7 + seed) * 0.7)), a = Math.max(x, xx), b = Math.min(x + w, xx + ww);
      if (b > a + 1) {
        const t = h01(r * 5.9 + k * 3.3 + seed);
        box(g, a, yy, b - a, hh, t < 0.2 ? R[1] : t > 0.82 ? R[3] : R[2]);
        box(g, a, yy, b - a, 1, t > 0.5 ? R[3] : R[2]);
        if (hh > 4) { box(g, a, yy + hh - 2, b - a, 1, R[1]); checker(g, a, yy + hh - 4, b - a, 2, R[1], (r + k) & 1, 1); }
        box(g, b - 1, yy, 1, hh, R[0]);
        // (a chip out of a corner, a pit or two)
        if (t > 0.6 && hh > 8) box(g, a + 3 + t * (b - a - 8), yy + 4 + t * (hh - 9), 2, 1, R[0]);
        if (t < 0.12 && b - a > 12) { box(g, a + 1, yy + 1, 3, 2, R[0]); }
      }
      xx += ww;
    }
    box(g, x, yy + hh - 1, w, 1, R[0]);
  }
};

/** A crack down a wall from (x, y), `len` long: dark, a glow in it if `glow`. */
export const crack = (g: Ctx, x: number, y: number, len: number, seed: number, dark: string, glow?: string) => {
  let cx = x;
  for (let i = 0; i < len; i += 3) {
    const d = Math.round((h01(seed + i * 0.37) - 0.5) * 5);
    box(g, Math.min(cx, cx + d), y + i, Math.abs(d) + 1, 3, dark);
    if (glow && i > 4 && i < len - 6) box(g, cx + (d > 0 ? 0 : d), y + i + 1, 1, 1, glow);
    cx += d;
    if (h01(seed + i) > 0.86) for (let j = 0; j < 8; j += 2) box(g, cx + j + 1, y + i + j / 2, 2, 1, dark);
  }
};

/** A stain run down a wall (dithered at its foot). */
export const streak = (g: Ctx, x: number, y: number, w: number, len: number, col: string) => {
  box(g, x, y, w, len * 0.55, col); checker(g, x, y + len * 0.55, w, len * 0.3, col, 0, 1); checker(g, x + 1, y + len * 0.85, Math.max(1, w - 2), len * 0.15, col, 1, 2);
};

/** A chain hung straight down (links in two shades). */
export const chainV = (g: Ctx, x: number, y0: number, y1: number, R: string[]) => {
  for (let y = y0, k = 0; y < y1; y += 4, k++) { if (k % 2) { box(g, x - 1, y, 3, 4, INK); box(g, x, y, 1, 4, R[4]); } else { box(g, x - 2, y, 5, 4, INK); box(g, x - 1, y + 1, 3, 2, R[2]); box(g, x - 1, y + 1, 1, 1, R[5]); } }
};

/** A skull, about 12 x 12 at s = 1, its jaw at (x, y). */
export const skull = (g: Ctx, x: number, y: number, s = 1, R = BONE) => {
  const u = (n: number) => Math.round(n * s);
  box(g, x - u(6) - 1, y - u(12) - 1, u(12) + 2, u(9) + 2, INK); box(g, x - u(4) - 1, y - u(4), u(8) + 2, u(4) + 1, INK);
  box(g, x - u(6), y - u(12), u(12), u(9), R[3]); box(g, x - u(6), y - u(12), u(12), u(2), R[4]); box(g, x - u(6), y - u(12), u(3), u(3), R[5]); box(g, x + u(3), y - u(11), u(3), u(8), R[2]);
  box(g, x - u(4), y - u(4), u(8), u(4), R[2]);
  box(g, x - u(4), y - u(8), u(3), u(3), INK); box(g, x + u(1), y - u(8), u(3), u(3), INK); box(g, x - u(1), y - u(5), u(2), u(2), INK);
  for (let k = -3; k < 4; k += 2) box(g, x + u(k), y - u(3), 1, u(3), INK);
};
/** A bone lying at (x, y), `len` long, flat or leaning (dy over its length). */
export const bone = (g: Ctx, x: number, y: number, len: number, dy = 0, R = BONE) => {
  for (let i = 0; i < len; i += 2) { const yy = y + Math.round((dy * i) / len); box(g, x + i, yy - 2, 2, 4, INK); box(g, x + i, yy - 1, 2, 2, R[3]); box(g, x + i, yy - 1, 2, 1, R[4]); }
  for (const [ex, ey] of [[x, y], [x + len, y + dy]]) { box(g, ex - 3, ey - 4, 5, 8, INK); box(g, ex - 2, ey - 3, 3, 2, R[4]); box(g, ex - 2, ey + 1, 3, 2, R[2]); }
};
export const BONE = ['#3A3226', '#5E5440', '#8A7E62', '#B4A888', '#D4CAAC', '#EEE8D2'];
export const IRONK = ['#060606', '#101010', '#1C1C1C', '#2A2A2A', '#3C3C3C', '#565656'];

/** A fire bowl on a wall bracket or a stand, its bowl's lip at (x, y): the iron only (the flame's live: flame()). */
export const bowl = (g: Ctx, x: number, y: number, stand = 0) => {
  const I = IRONK;
  if (stand) { box(g, x - 3, y + 6, 6, stand, INK); box(g, x - 2, y + 6, 4, stand, I[3]); box(g, x - 2, y + 6, 1, stand, I[5]); box(g, x - 9, y + 4 + stand, 18, 4, INK); box(g, x - 8, y + 5 + stand, 16, 2, I[3]); }
  else { box(g, x - 2, y + 6, 4, 14, INK); box(g, x - 1, y + 6, 2, 13, I[3]); box(g, x - 2, y + 18, 12, 4, INK); box(g, x - 1, y + 19, 10, 2, I[3]); }
  box(g, x - 11, y - 1, 22, 4, INK); box(g, x - 9, y + 3, 18, 3, INK); box(g, x - 6, y + 6, 12, 2, INK);
  box(g, x - 10, y, 20, 2, I[4]); box(g, x - 10, y, 6, 1, I[5]); box(g, x - 8, y + 2, 16, 2, I[3]); box(g, x - 5, y + 4, 10, 2, I[2]);
};
/** A flame, live (a few rects, stepped): its foot at (x, y), `s` its size, in `cols` (hot first, 4 of them). */
export const flame = (c: Ctx, x: number, y: number, f: number, seed: number, cols: string[], s = 1) => {
  const t = (f >> 2) + seed * 7, a = (t % 4), b = ((t >> 1) % 3);
  const u = (n: number) => Math.round(n * s);
  c.fillStyle = cols[3]; c.fillRect(x - u(8), y - u(8), u(16), u(8)); c.fillRect(x - u(6) + a - 1, y - u(15) - b, u(11), u(8));
  c.fillStyle = cols[2]; c.fillRect(x - u(6), y - u(7), u(12), u(7)); c.fillRect(x - u(4) + b - 1, y - u(13) - a, u(7), u(7)); c.fillRect(x - 1 + a - 2, y - u(20) - b * 2, u(3), u(6));
  c.fillStyle = cols[1]; c.fillRect(x - u(4), y - u(5), u(8), u(5)); c.fillRect(x - u(2) + (a & 1), y - u(10) - b, u(4), u(6));
  c.fillStyle = cols[0]; c.fillRect(x - u(2), y - u(3), u(4), u(3));
};
/** Motes going up the screen (embers, ash, spores): `n` of them, screen space. `down`: falling instead. */
export const motes = (c: Ctx, f: number, n: number, cols: string[], down = false, speed = 1) => {
  for (let i = 0; i < n; i++) {
    const x = (i * 97 + f * (0.25 + (i % 3) * 0.18) * speed + Math.sin(f * 0.02 + i) * 14) % W, t = (f * (0.5 + (i % 4) * 0.22) * speed + i * 53) % H, y = down ? t : H - t;
    c.fillStyle = cols[i % cols.length]; c.fillRect(Math.round((x + W) % W), Math.round(y), i % 5 ? 2 : 3, 2);
  }
};

/** A sign's board: inked, its frame in `F` (a ramp), its face `bg`, the lines on it; its middle at (x, y). [w, h]. */
export const sign = (g: Ctx, x: number, y: number, lines: [string, Look][], bg: string, F: string[], pad = 7): [number, number] => {
  const gap = 4, w = Math.round(Math.max(...lines.map(([t, L]) => signW(t, L))) + pad * 2), h = Math.round(lines.reduce((s, [, L]) => s + signH(L) + gap, -gap) + pad * 2);
  const x0 = Math.round(x - w / 2), y0 = Math.round(y - h / 2), r = ramp(bg);
  box(g, x0 - 4, y0 - 4, w + 8, h + 8, INK);
  box(g, x0 - 3, y0 - 3, w + 6, h + 6, F[3]); box(g, x0 - 3, y0 - 3, w + 6, 1, F[5]); box(g, x0 - 3, y0 - 3, 1, h + 6, F[4]); box(g, x0 - 3, y0 + h + 2, w + 6, 1, F[1]); box(g, x0 + w + 2, y0 - 3, 1, h + 6, F[1]);
  box(g, x0 - 1, y0 - 1, w + 2, h + 2, INK);
  box(g, x0, y0, w, h, r[3]); box(g, x0, y0, w, 2, r[4]); box(g, x0, y0 + h - 3, w, 3, r[2]); checker(g, x0, y0 + h - 5, w, 2, r[2], 0, 1); box(g, x0 + w - 2, y0, 2, h, r[2]);
  for (const [bx, by] of [[x0 - 2, y0 - 2], [x0 + w, y0 - 2], [x0 - 2, y0 + h], [x0 + w, y0 + h]]) { box(g, bx, by, 2, 2, F[0]); box(g, bx, by, 1, 1, F[5]); }
  let yy = y0 + pad;
  for (const [t, L] of lines) { yy += signH(L); signText(g, t, x, yy, L); yy += gap; }
  return [w, h];
};

/** The view's world x span and the camera (a kill cam's zoom too), for culling by where a thing lands on screen. */
export const seen = (state: GameState, a: number, b: number, pad = 60) => {
  const cam = state.camera, z = state.view, x0 = z ? Math.min(cam.x, z.x) : cam.x, x1 = z ? Math.max(cam.x + W, z.x + z.w) : cam.x + W;
  return b > x0 - pad && a < x1 + pad;
};
