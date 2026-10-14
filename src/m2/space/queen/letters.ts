// The queen section's sign lettering: the park's 5x7 alphabet (square/lettering.ts), lettered the ways only this end
// of the land needs, each fitting what the sign is made of (no stock type anywhere at this end of the land):
//
//   neon        bent glass tube: each letter's strokes joined cell to cell as a tube (the dark glass when it's off; lit,
//               a stippled bloom, its color, a hot core), slanted for the script lean, on standoff clips
//   chrome      70s disco type: fat (doubled strokes), inked, a drop shadow, the chrome banded sky-to-horizon-to-gold
//               down each letter, a star glint
//   stencil     maintenance stencils: the letters' bridges cut (the gaps in the bars), sprayed (an overspray stipple
//               round them, a worn cell here and there, a run of paint off the odd foot)
//   lightbox    a backlit box sign (EXIT): stencil-cut letters, lit, a bloom stepped round them
//   emboss      a stamped plate: the letters raised (lit along their tops, a shadow off their feet)
//   engraved    cut into a plate (brass): the letters dark, their lower edges catching the light
//   square      the attraction's sci-fi marquee type: squared corners, wide, banded light down each letter
//   slime       the horror poster's type: bold, dripping
//   print       printed or painted on flat (posters, decals, banners, cabinet signs): a ramp down the letters, an
//               offset shadow
//
// Everything is flat fills (no gradients, no fonts). The static signs are painted inside the sections' stamps; the
// live ones stamp themselves (signStamp).

import { stamp } from '../../../m1/game/render/stamp';
import { glyphDots } from '../square/lettering';
import { type Ramp, dith, hash } from './paint';

type Ctx = CanvasRenderingContext2D;

// ---------------------------------------------------------------------------------------------------------------
// The alphabet: the park's own (square/lettering.ts's `glyphDots`: the same letterforms as every Futureland sign),
// trimmed to its inked columns; plus the one mark it hasn't got (the arrow up the exit signs point with).

const LOCAL: Record<string, string> = { '^': '..#..|.###.|#.#.#|..#..|..#..|..#..|..#..' };
type Glyph = boolean[][];
const GLYPHS = new Map<string, Glyph>();
const glyphOf = (ch: string): Glyph => {
  let g = GLYPHS.get(ch);
  if (g) return g;
  if (LOCAL[ch]) g = LOCAL[ch].split('|').map(r => [...r].map(k => k === '#'));
  else {
    const d = glyphDots(ch);
    g = Array.from({ length: 7 }, () => new Array<boolean>(d.w).fill(false));
    for (const [c, r] of d.on) if (r < 7 && c < d.w) g[r][c] = true;
  }
  GLYPHS.set(ch, g);
  return g;
};

/** Cut a stencil's bridges: the bars broken off the stem (or, on a round letter, split in the middle top and bottom). */
const stencilCut = (gl: Glyph): Glyph => {
  const g = gl.map(r => [...r]), w = g[0].length;
  if (w < 4) return g;
  const stem = (col: number) => g.filter(r => r[col]).length >= 5;
  const L = stem(0), R = stem(w - 1);
  for (let r = 0; r < 7; r++) {
    if (L && g[r][0] && g[r][1] && g[r][2]) g[r][1] = false;
    else if (R && g[r][w - 1] && g[r][w - 2] && g[r][w - 3]) g[r][w - 2] = false;
    else if ((r === 0 || r === 6) && g[r][1] && g[r][2] && g[r][3]) g[r][2] = false;
  }
  return g;
};
/** Square a letter's corners (the sci-fi marquee's look): a gap at an elbow filled where both its neighbors are inked. */
const squareUp = (gl: Glyph): Glyph => {
  const g = gl.map(r => [...r]), w = g[0].length, at = (r: number, c: number) => r >= 0 && r < 7 && c >= 0 && c < w && gl[r][c];
  for (let r = 0; r < 7; r++) for (let c = 0; c < w; c++) {
    if (gl[r][c]) continue;
    if ((at(r, c + 1) && at(r + 1, c) && !at(r + 1, c + 1)) || (at(r, c - 1) && at(r + 1, c) && !at(r + 1, c - 1)) || (at(r, c + 1) && at(r - 1, c) && !at(r - 1, c + 1)) || (at(r, c - 1) && at(r - 1, c) && !at(r - 1, c - 1))) g[r][c] = true;
  }
  return g;
};

export interface SetOpts { stencil?: boolean; square?: boolean; bold?: boolean; gap?: number; space?: number }
interface Cell { x: number; y: number; ch: number }
/** Sets `text` in cells: each inked cell (x, y in cells, which letter), and the whole run's width in cells. */
const set = (text: string, o: SetOpts = {}) => {
  const cells: Cell[] = [], starts: number[] = [];
  let x = 0;
  const gap = o.gap ?? 1;
  [...text.toUpperCase()].forEach((ch, i) => {
    starts.push(x);
    if (ch === ' ') { x += o.space ?? 3; return; }
    let g = glyphOf(ch);
    if (o.square) g = squareUp(g);
    if (o.stencil) g = stencilCut(g);
    const w = g[0].length + (o.bold ? 1 : 0);
    for (let r = 0; r < 7; r++) for (let c = 0; c < w; c++) {
      const on = (c < g[0].length && g[r][c]) || (o.bold && c > 0 && g[r][c - 1]);
      if (on) cells.push({ x: x + c, y: r, ch: i });
    }
    x += w + gap;
  });
  return { cells, w: Math.max(0, x - gap), starts };
};

/** How wide `text` sets, in pixels, at sx pixels to the cell. */
export const textW = (text: string, sx: number, o: SetOpts = {}) => set(text, o).w * sx;
/** How wide `text` sets in neon at s px to the cell (its slant counted). */
export const neonW = (text: string, s: number, slant = 0) => set(text, { gap: 2, space: 4 }).w * s + slant * 6;
/** How wide `text` sets in print, chrome (bold) or stencil at sx px to the cell. */
export const printW = (text: string, sx: number) => set(text, { gap: 1, space: 3 }).w * sx;
export const chromeW = (text: string, sx: number) => set(text, { bold: true, gap: 1, space: 3 }).w * sx;

const px = (g: Ctx, x: number, y: number, w: number, h: number, col: string | CanvasPattern) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

/** Stamps a live sign (the paint's coordinates are the world's; `key` must name exactly this picture). */
export const signStamp = (c: Ctx, key: string, x: number, y: number, w: number, h: number, paint: (g: Ctx) => void) => stamp(c, key, x, y, w, h, paint);

// ---------------------------------------------------------------------------------------------------------------
// The styles. Each takes the run's middle x and its top y.

/** Neon tube: s px to the cell (the tube's about half a cell thick), slant px per row (the script lean). `lit` says, per
 *  letter, 0 off (dark glass), 1 lit, 2 flaring (its hot color); `ramp`: ink, the dead glass, the color, its lit,
 *  its hot core. Clips on standoffs behind each letter. */
export const neon = (g: Ctx, text: string, cx: number, top: number, s: number, ramp: Ramp, o: { slant?: number; lit?: (i: number) => number; tube?: number; clips?: boolean } = {}) => {
  const { cells, w } = set(text, { gap: 2, space: 4 });
  const sl = o.slant ?? 0, x0 = cx - (w * s) / 2 - sl * 3, lit = o.lit ?? (() => 1);
  const on = new Set(cells.map(k => `${k.x},${k.y}`));
  const at = (x: number, y: number) => ({ x: x0 + (x + 0.5) * s + (6 - y) * sl, y: top + (y + 0.5) * s });
  // (the strokes: each inked cell joined to its inked neighbors (right, down, the diagonals where there's no corner))
  const segs: [number, number, number, number, number][] = [];
  for (const k of cells) {
    const has = (dx: number, dy: number) => on.has(`${k.x + dx},${k.y + dy}`);
    const go = (dx: number, dy: number) => segs.push([k.x, k.y, k.x + dx, k.y + dy, k.ch]);
    if (has(1, 0)) go(1, 0);
    if (has(0, 1)) go(0, 1);
    if (has(1, 1) && !has(1, 0) && !has(0, 1)) go(1, 1);
    if (has(-1, 1) && !has(-1, 0) && !has(0, 1)) go(-1, 1);
    if (!has(1, 0) && !has(0, 1) && !has(-1, 0) && !has(0, -1) && !has(1, 1) && !has(-1, -1) && !has(1, -1) && !has(-1, 1)) segs.push([k.x, k.y, k.x, k.y, k.ch]);
  }
  const tw = o.tube ?? Math.max(2, s * 0.55);
  // (each pass one path per color: the strokes batched, not stroked one by one)
  const pass = (width: number, col: (ch: number) => string | CanvasPattern | null) => {
    g.lineCap = 'round'; g.lineWidth = width;
    const runs = new Map<string | CanvasPattern, [number, number, number, number, number][]>();
    for (const sg of segs) { const cl = col(sg[4]); if (!cl) continue; let r = runs.get(cl); if (!r) runs.set(cl, (r = [])); r.push(sg); }
    for (const [cl, list] of runs) {
      g.strokeStyle = cl; g.beginPath();
      for (const [ax, ay, bx, by] of list) { const a = at(ax, ay), b = at(bx, by); g.moveTo(a.x, a.y); g.lineTo(b.x + (a.x === b.x && a.y === b.y ? 0.01 : 0), b.y); }
      g.stroke();
    }
    g.lineCap = 'butt';
  };
  // (the clips: a chrome standoff behind each letter, top and bottom)
  if (o.clips !== false) {
    const seen = new Set<number>();
    for (const k of cells) if (!seen.has(k.ch) && k.y === 0) { seen.add(k.ch); const p = at(k.x, 0), q = at(k.x, 6); px(g, p.x - 1, p.y - 2, 3, 3, '#52525B'); px(g, q.x - 1, q.y, 3, 3, '#52525B'); px(g, p.x - 1, p.y - 2, 1, 1, '#D4D4D8'); }
  }
  pass(tw + 4, ch => (lit(ch) ? dith(g, ramp[2], 2, ch % 2) : null));
  pass(tw + 2, () => ramp[0]);
  pass(tw, ch => (lit(ch) ? ramp[2] : ramp[1]));
  pass(Math.max(1, tw * 0.5), ch => (lit(ch) === 2 ? ramp[4] : lit(ch) ? ramp[3] : null));
  pass(1, ch => (lit(ch) ? ramp[4] : null));
};

/** 70s disco chrome: fat letters, inked, a drop shadow (`shadow`), each banded down its height (sky, the horizon line,
 *  the gold below), a glint on the first letter. */
export const chrome = (g: Ctx, text: string, cx: number, top: number, sx: number, sy: number, o: { shadow?: string; ink?: string; glint?: boolean; slant?: number } = {}) => {
  const { cells, w } = set(text, { bold: true, gap: 1, space: 3 });
  const H = 7 * sy, sl = o.slant ?? 0, x0 = Math.round(cx - (w * sx) / 2 - sl * 3);
  const X = (k: Cell) => x0 + k.x * sx + (6 - k.y) * sl;
  if (o.shadow) for (const k of cells) px(g, X(k) + 2, top + k.y * sy + 2, sx + 1, sy + 1, o.shadow);
  for (const k of cells) px(g, X(k) - 1, top + k.y * sy - 1, sx + 2, sy + 2, o.ink ?? '#05020B');
  // (down the letter: white-blue sky, the sky deepening, the hard horizon, gold below it lightening to the foot)
  const band = (yy: number) => { const u = yy / H; return u < 0.14 ? '#FFFFFF' : u < 0.3 ? '#DCEBFF' : u < 0.44 ? '#9CB8E0' : u < 0.52 ? '#5A6E96' : u < 0.57 ? '#2A1A30' : u < 0.66 ? '#8A5A1A' : u < 0.8 ? '#D69A3A' : u < 0.92 ? '#F4C870' : '#FFF0C0'; };
  for (const k of cells) for (let r = 0; r < sy; r++) px(g, X(k), top + k.y * sy + r, sx, 1, band(k.y * sy + r));
  if (o.glint !== false && cells.length) {
    const k = cells[0], gx = X(k) + 1, gy = top + 1;
    px(g, gx - 3, gy, 7, 1, '#FFFFFF'); px(g, gx, gy - 3, 1, 7, '#FFFFFF'); px(g, gx - 1, gy - 1, 3, 3, '#FFFFFF');
  }
};

/** Stencil paint: s px to the cell; sprayed (an overspray stipple round it, a worn cell or two, a run off the odd foot). */
export const stencil = (g: Ctx, text: string, cx: number, top: number, s: number, col: string, o: { seed?: number; spray?: string; runs?: boolean } = {}) => {
  const { cells, w } = set(text, { stencil: true, gap: 1, space: 3 });
  const x0 = Math.round(cx - (w * s) / 2), seed = o.seed ?? 1;
  if (o.spray !== '') { const sp = dith(g, o.spray ?? col, 1, seed % 2); for (const k of cells) px(g, x0 + k.x * s - 1, top + k.y * s - 1, s + 2, s + 2, sp); }
  cells.forEach((k, i) => {
    const worn = hash(i * 7.3 + seed) < 0.06;
    px(g, x0 + k.x * s, top + k.y * s, s, s, col);
    if (worn) px(g, x0 + k.x * s + (s > 1 ? 1 : 0), top + k.y * s, Math.max(1, s - 1), Math.max(1, s - 1), dith(g, 'rgba(0, 0, 0, 0.7)', 1, i % 2));
    if (o.runs !== false && k.y === 6 && hash(i * 3.1 + seed * 5) < 0.12) px(g, x0 + k.x * s + Math.floor(s / 2), top + 7 * s, 1, 2 + Math.floor(hash(i + seed) * 4) * s, col);
  });
};

/** A backlit box sign's letters: stencil-cut, lit in `lit` with a hot core row, a stepped bloom of `glow` round them. */
export const lightbox = (g: Ctx, text: string, cx: number, top: number, s: number, lit: string, hot: string, glow: string) => {
  const { cells, w } = set(text, { stencil: true, gap: 1, space: 3 });
  const x0 = Math.round(cx - (w * s) / 2);
  for (const k of cells) px(g, x0 + k.x * s - 2, top + k.y * s - 2, s + 4, s + 4, dith(g, glow, 1, 0));
  for (const k of cells) px(g, x0 + k.x * s - 1, top + k.y * s - 1, s + 2, s + 2, glow);
  for (const k of cells) px(g, x0 + k.x * s, top + k.y * s, s, s, lit);
  for (const k of cells) if (k.y >= 2 && k.y <= 4) px(g, x0 + k.x * s, top + k.y * s, s, Math.max(1, s - 1), hot);
};

/** A stamped plate's raised letters: lit along their tops (hi), a shadow off their feet (sh), their face. */
export const emboss = (g: Ctx, text: string, cx: number, top: number, s: number, face: string, hi: string, sh: string) => {
  const { cells, w } = set(text, { gap: 1, space: 3 });
  const x0 = Math.round(cx - (w * s) / 2);
  for (const k of cells) px(g, x0 + k.x * s + 1, top + k.y * s + 1, s, s, sh);
  for (const k of cells) px(g, x0 + k.x * s - (s > 1 ? 1 : 0), top + k.y * s - 1, s, s, hi);
  for (const k of cells) px(g, x0 + k.x * s, top + k.y * s, s, s, face);
};

/** Engraved: cut into a plate (dark), the cut's lower edge catching the light (`edge`). */
export const engraved = (g: Ctx, text: string, cx: number, top: number, s: number, cut: string, edge: string, o: SetOpts = {}) => {
  const { cells, w } = set(text, { gap: 1, space: 3, ...o });
  const x0 = Math.round(cx - (w * s) / 2);
  for (const k of cells) px(g, x0 + k.x * s, top + k.y * s + 1, s, s, edge);
  for (const k of cells) px(g, x0 + k.x * s, top + k.y * s, s, s, cut);
};

/** The marquee's sci-fi type: squared, wide (sx by sy a cell), wide-spaced, banded light down each letter (`ramp`: its
 *  ink, then darkest to lightest, lit from the middle out), an inked edge. */
export const square = (g: Ctx, text: string, cx: number, top: number, sx: number, sy: number, ramp: Ramp, o: { spacing?: number; bold?: boolean } = {}) => {
  const { cells, w } = set(text, { square: true, gap: o.spacing ?? 2, space: 4, bold: o.bold });
  const x0 = Math.round(cx - (w * sx) / 2), H = 7 * sy;
  for (const k of cells) px(g, x0 + k.x * sx - 1, top + k.y * sy - 1, sx + 2, sy + 2, ramp[0]);
  const band = (yy: number) => { const u = yy / H; return u < 0.12 ? ramp[2] : u < 0.3 ? ramp[3] : u < 0.62 ? ramp[4] : u < 0.82 ? ramp[3] : ramp[2]; };
  for (const k of cells) for (let r = 0; r < sy; r++) px(g, x0 + k.x * sx, top + k.y * sy + r, sx, 1, band(k.y * sy + r));
  for (const k of cells) if (k.y === 6) px(g, x0 + k.x * sx, top + 7 * sy - 1, sx, 1, ramp[1]);
};

/** The horror poster's type: bold, inked, the slime dripping off its feet (ramp: ink, deep, base, lit, hot). */
export const slime = (g: Ctx, text: string, cx: number, top: number, s: number, ramp: Ramp, seed = 3) => {
  const { cells, w } = set(text, { bold: true, gap: 1, space: 3 });
  const x0 = Math.round(cx - (w * s) / 2);
  for (const k of cells) px(g, x0 + k.x * s - 1, top + k.y * s - 1, s + 2, s + 2, ramp[0]);
  cells.forEach((k, i) => {
    if (k.y === 6 && hash(i * 4.7 + seed) < 0.3) { const l = (2 + Math.floor(hash(i + seed) * 5)) * s / 2; px(g, x0 + k.x * s - 1, top + 7 * s - 1, s + 2, l + 2, ramp[0]); px(g, x0 + k.x * s, top + 7 * s - 1, s, l, ramp[2]); px(g, x0 + k.x * s, top + 7 * s - 1 + l - 1, s, 2, ramp[3]); }
  });
  for (const k of cells) px(g, x0 + k.x * s, top + k.y * s, s, s, k.y < 2 ? ramp[3] : k.y < 5 ? ramp[2] : ramp[1]);
  for (const k of cells) if (k.y === 0) px(g, x0 + k.x * s, top, s, 1, ramp[4]);
};

/** Printed or painted on flat: sx by sy px a cell, `fill` a ramp top to bottom (or one color), an offset `shadow`
 *  (`drop` px down and right), an `ink` outline. */
export const print = (g: Ctx, text: string, cx: number, top: number, sx: number, sy: number, fill: string | string[], o: { shadow?: string; drop?: number; ink?: string; gap?: number } = {}) => {
  const { cells, w } = set(text, { gap: o.gap ?? 1, space: 3 });
  const x0 = Math.round(cx - (w * sx) / 2), fills = typeof fill === 'string' ? [fill] : fill;
  const col = (y: number) => fills[Math.min(fills.length - 1, Math.floor((y / 7) * fills.length))];
  if (o.ink) for (const k of cells) px(g, x0 + k.x * sx - 1, top + k.y * sy - 1, sx + 2, sy + 2, o.ink);
  if (o.shadow) { const d = o.drop ?? 1; for (const k of cells) px(g, x0 + k.x * sx + d, top + k.y * sy + d, sx, sy, o.shadow); }
  for (const k of cells) px(g, x0 + k.x * sx, top + k.y * sy, sx, sy, col(k.y));
};
