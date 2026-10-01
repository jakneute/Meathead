// Chunky pixel-art helpers for drawing at full resolution (screen or world space), the way the backdrops'
// half-res tiles are painted: gradients as flat bands with a checkerboard dither along each seam, haze that
// fades far scenery into the sky (atmospheric perspective), and dithered edges where two fills meet, so
// nothing sits on anything else with a hard line. Cells are PIX px square, lined up to the world's pixel grid.

import { ramp } from './backdrops/core';

type Ctx = CanvasRenderingContext2D;

/** The size of a "pixel" in these helpers (the backdrops are painted at half resolution: 2 screen px). */
export const PIX = 2;

const patterns = new Map<string, CanvasPattern>();

/** A checkerboard of `color` cells, `px` square (`phase` 0 or 1 picks which half of the cells), as a fill. */
const checkerPattern = (ctx: Ctx, color: string, phase: number, px: number) => {
  const key = `${color}|${phase}|${px}`;
  let p = patterns.get(key);
  if (!p) {
    const c = document.createElement('canvas');
    c.width = px * 2; c.height = px * 2;
    const g = c.getContext('2d')!;
    g.fillStyle = color;
    g.fillRect(phase ? px : 0, 0, px, px);
    g.fillRect(phase ? 0 : px, px, px, px);
    p = ctx.createPattern(c, 'repeat')!;
    patterns.set(key, p);
  }
  return p;
};

/**
 * A repeating tile painted once (brick, siding, tiles...) as a fill, by `key`: `paint` draws the w x h tile. The
 * pattern lines up with the world's pixel grid under whatever transform is current when it's used.
 */
export const tilePattern = (ctx: Ctx, key: string, w: number, h: number, paint: (g: Ctx) => void) => {
  let p = patterns.get('tile|' + key);
  if (!p) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    paint(c.getContext('2d')!);
    p = ctx.createPattern(c, 'repeat')!;
    patterns.set('tile|' + key, p);
  }
  return p;
};

/** Brickwork as a tile: courses `course` tall, bricks `brick` wide, in two tints with mortar between. */
export const brickPattern = (ctx: Ctx, key: string, brick: number, course: number, tints: [string, string], mortar: string) => tilePattern(ctx, key, brick * 2, course * 2, g => {
  g.fillStyle = mortar; g.fillRect(0, 0, brick * 2, course * 2);
  for (let row = 0; row < 2; row++) for (let i = -1; i < 3; i++) {
    const x = i * brick + (row ? brick / 2 : 0);
    g.fillStyle = tints[(i + row * 2 + 4) % 2];
    g.fillRect(x, row * course, brick - 1, course - 1);
  }
});

/** Fills (x, y, w, h) with a checkerboard of `color` (half the cells), for dithering one fill into another. */
export const checker = (ctx: Ctx, x: number, y: number, w: number, h: number, color: string, phase = 0, px = PIX) => {
  if (typeof document === 'undefined') return;
  ctx.fillStyle = checkerPattern(ctx, color, phase, px);
  ctx.fillRect(x, y, w, h);
};

/**
 * A vertical gradient (the colours in `stops`, top to bottom) as `bands` flat stripes, each seam softened with a
 * row of dither either side: the lower band's colour reaching up into the upper, and the upper's reaching down.
 */
export const bandedGradient = (ctx: Ctx, x: number, y: number, w: number, h: number, stops: string[], bands = 16, px = PIX) => {
  const bandH = h / bands;
  for (let b = 0; b < bands; b++) {
    ctx.fillStyle = ramp(stops, b / (bands - 1));
    const y0 = Math.floor(y + b * bandH);
    ctx.fillRect(x, y0, w, Math.ceil(bandH) + 1);
  }
  for (let b = 1; b < bands; b++) {
    const ys = Math.floor(y + b * bandH);
    checker(ctx, x, ys - px, w, px, ramp(stops, b / (bands - 1)), 0, px);
    checker(ctx, x, ys, w, px, ramp(stops, (b - 1) / (bands - 1)), 1, px);
  }
};

/**
 * Haze over far scenery: `bands` translucent stripes of `color` from alpha `a0` at the top to `a1` at the bottom,
 * each seam dithered. Laid over a ridge (and whatever stands on it) just above where the next, nearer ridge will
 * cover it, it fades the distance into the sky the way air does.
 */
export const hazeBands = (ctx: Ctx, x: number, y: number, w: number, h: number, color: string, a0: number, a1: number, bands = 5, px = PIX) => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16));
  const bandH = h / bands;
  const rgba = (a: number) => `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
  for (let i = 0; i < bands; i++) {
    const a = a0 + (a1 - a0) * (i / (bands - 1));
    const y0 = Math.floor(y + i * bandH), y1 = Math.floor(y + (i + 1) * bandH);
    ctx.fillStyle = rgba(a);
    ctx.fillRect(x, y0, w, y1 - y0);
    // (the step between this band and the next, split by a dither row either side of the seam)
    if (i + 1 < bands) {
      const an = a0 + (a1 - a0) * ((i + 1) / (bands - 1));
      checker(ctx, x, y1 - px, w, px, rgba((an - a) / Math.max(0.001, 1 - a)), 0, px);
    }
  }
};

/**
 * A ridge of hills drawn column by column (PIX wide), everything below `ridge(x)` filled, with a lit rim along the
 * top, the crest rounded off with a dither of `shade` under the rim, and a brighter tone down the flanks that face
 * `lightFrom` (-1 the left, 1 the right). Returns nothing; draws from `x0` to `x1` (screen or world x), the ridge
 * sampled at `x + scroll` so it parallaxes.
 */
export const pixelRidge = (
  ctx: Ctx, x0: number, x1: number, bottom: number, ridge: (wx: number) => number, scroll: number,
  tones: { fill: string; rim: string; lit?: string; shade?: string }, lightFrom = 1, px = PIX,
) => {
  const xs = Math.floor(x0 / px) * px;
  for (let x = xs; x < x1; x += px) {
    const y = Math.floor(ridge(x + scroll) / px) * px;
    ctx.fillStyle = tones.fill;
    ctx.fillRect(x, y, px, bottom - y);
    // (the slope here: which way it faces)
    const facing = ridge(x + scroll + 6) - ridge(x + scroll - 6);
    const lit = tones.lit && Math.sign(facing) === lightFrom && Math.abs(facing) > 1.5;
    if (lit) { ctx.fillStyle = tones.lit!; ctx.fillRect(x, y + px * 2, px, px * 4); }
    ctx.fillStyle = tones.rim;
    ctx.fillRect(x, y, px, px * (lit ? 2 : 1));
  }
  if (tones.shade) {
    // (under the rim, the crest rounded off into the body: a dithered strip following the ridge)
    for (let x = xs; x < x1; x += px * 2) {
      const y = Math.floor(ridge(x + scroll) / px) * px;
      ctx.fillStyle = tones.shade;
      ctx.fillRect(x + (Math.floor(y / px) % 2) * px, y + px * 3, px, px);
      ctx.fillRect(x + ((Math.floor(y / px) + 1) % 2) * px, y + px * 5, px, px);
    }
  }
};

/** A seamless ridge height function for screen-space scenery: a sum of sines, `base` down to `base - amp`. */
export const screenRidge = (seed: number, base: number, amp: number) => (wx: number) =>
  base - amp * (0.5 + 0.5 * Math.sin(wx * 0.011 + seed) * Math.cos(wx * 0.004 + seed * 2)) - amp * 0.12 * Math.sin(wx * 0.037 + seed * 3);

/**
 * A disc of light as stepped rings (a sun, a glow, a crater): `rings` concentric flat circles of `color` from
 * alpha `a0` in the middle out to `a1` at the edge, with no smooth gradient anywhere.
 */
export const steppedGlow = (ctx: Ctx, cx: number, cy: number, radius: number, color: string, a0: number, a1: number, rings = 5) => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16));
  for (let i = rings - 1; i >= 0; i--) {
    const k = i / (rings - 1);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${(a0 + (a1 - a0) * k).toFixed(3)})`;
    ctx.beginPath(); ctx.arc(cx, cy, radius * (0.25 + 0.75 * k), 0, Math.PI * 2); ctx.fill();
  }
};

/** A soft-edged chunky blob (a cloud, a smoke puff, fog): a solid middle, a dithered skirt round it. */
export const pixelBlob = (ctx: Ctx, cx: number, cy: number, rw: number, rh: number, color: string, px = PIX) => {
  const x0 = Math.floor((cx - rw) / px) * px, x1 = cx + rw;
  for (let x = x0; x < x1; x += px) {
    const u = (x + px / 2 - cx) / rw;
    if (Math.abs(u) >= 1) continue;
    const half = Math.sqrt(1 - u * u) * rh;
    const y0 = Math.floor((cy - half) / px) * px, y1 = Math.ceil((cy + half) / px) * px;
    const h = y1 - y0;
    // (the outer ring of cells only every other one, so the edge breaks up)
    const solid = Math.max(0, h - px * 4);
    ctx.fillStyle = color;
    ctx.fillRect(x, y0 + px * 2, px, solid);
    const col = Math.floor(x / px);
    if (col % 2 === 0) { ctx.fillRect(x, y0, px, px * 2); ctx.fillRect(x, y1 - px * 2, px, px * 2); }
    else { ctx.fillRect(x, y0 + px, px, px); ctx.fillRect(x, y1 - px * 2, px, px); }
  }
};
