// Meathead 2's sign setter: the park's one alphabet (space/square/lettering.ts's `glyphDots`, the 5x7 letterforms
// every Futureland sign is set in), set the ways the other lands' signs are made: each land's own styles are looks
// built on this (adventure/letters.ts, spooky/letters.ts, hub/letters.ts, intro/art/letters.ts).
//
// A look is flat fills only (no fonts, no gradients): the letters' cells (sx by sy px), a ramp down them in bands
// (a dithered seam between bands where the cells are tall enough), and what the sign's made of on top: an ink outline,
// a drop shadow, a carved lip (cut in: the letter dark, its lower edge catching the light), a lit top edge (raised),
// wood grain, a rope's twist, bamboo's nodes, drips, a stepped bloom, chips and moss, bulbs, serifs, a hand's wobble.
//
// `signText(c, text, x, y, look, align)`: x the anchor (its middle, left or right end), y the baseline (the letters
// sit on it, like fillText's). `signW(text, look)`: the width it sets at.

import { glyphDots } from './space/square/lettering';
import { mix } from '../m1/game/render/backdrops/core';

type Ctx = CanvasRenderingContext2D;
export type Align = 'center' | 'left' | 'right';

export interface Look {
  /** One cell's size (px). */
  sx?: number; sy?: number;
  /** Letter spacing and a space's width (cells). */
  gap?: number; space?: number;
  /** Strokes doubled (a fatter letter, a column wider). */
  bold?: boolean;
  /** Stencil bridges cut in the bars. */
  stencil?: boolean;
  /** Serifs: a nub out either side of every stem's ends (give it gap 2). */
  serif?: boolean;
  /** Px each row up is shifted right (a lean). */
  slant?: number;
  /** The letters' color, or a ramp top to bottom (banded down the letters' height). */
  fill: string | string[];
  /** Dither the seams between the ramp's bands. */
  dither?: boolean;
  /** An outline round the strokes. */
  ink?: string;
  /** A drop shadow, `drop` px down and right (default 1). */
  shadow?: string; drop?: number;
  /** Carved: the cut's lower right lip catching the light (the fill is the cut). */
  lip?: string;
  /** Raised: a lit edge along each stroke's top. */
  hi?: string;
  /** A darker shade along each stroke's foot. */
  lo?: string;
  /** Wood grain: streaks through the strokes in this color. */
  grain?: string;
  /** Rope: the twist, a lit and a shaded fiber laid diagonally in alternate cells. */
  twist?: [string, string];
  /** Bamboo: a node (dark ring, lit lip under it) across the strokes at these rows (0 top .. 6 foot). */
  nodes?: { rows: number[]; dark: string; lit: string };
  /** Drips off the strokes' feet (their color; `rate` 0..1 how many feet run; `len` the longest in px). */
  drip?: { col: string; tip?: string; rate?: number; len?: number };
  /** A stepped bloom round the strokes (dithered out, solid in). */
  glow?: string;
  /** Chips: this share of cells nicked (a pixel of `wornCol`). */
  worn?: number; wornCol?: string;
  /** Moss in the cuts' feet. */
  moss?: string;
  /** Bulbs: every cell a socket and a bulb (lit or not). */
  bulbs?: { lit: boolean; col?: string; dim?: string };
  /** Hand-done: each letter nudged off the line by up to this many px. */
  wobble?: number;
  /** Which way the hand and the wear go. */
  seed?: number;
}

// The marks the alphabet hasn't got, drawn the same 5 wide by 7 tall.
const EXTRA: Record<string, string> = {
  '^': '..#..|.###.|#.#.#|..#..|..#..|..#..|..#..',
  '*': '.....|#.#.#|.###.|#####|.###.|#.#.#|.....',
  '#': '.#.#.|.#.#.|#####|.#.#.|#####|.#.#.|.#.#.',
  '+': '.....|..#..|..#..|#####|..#..|..#..|.....',
  '=': '.....|.....|#####|.....|#####|.....|.....',
  '"': '#.#|#.#|#.#|...|...|...|...',
  '@': '.###.|#...#|#.###|#.#.#|#.###|#....|.####',
};
type Glyph = boolean[][];
const CACHE = new Map<string, Glyph>();
const glyphOf = (ch: string): Glyph => {
  let g = CACHE.get(ch);
  if (g) return g;
  if (EXTRA[ch]) g = EXTRA[ch].split('|').map(r => [...r].map(k => k === '#'));
  else {
    const d = glyphDots(ch);
    g = Array.from({ length: 7 }, () => new Array<boolean>(d.w).fill(false));
    for (const [c, r] of d.on) if (r < 7 && c < d.w) g[r][c] = true;
  }
  CACHE.set(ch, g);
  return g;
};
/** Stencil bridges: the bars broken off the stem (a round letter split top and bottom). */
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

interface Cell { x: number; y: number; i: number }
const layout = (text: string, L: Look) => {
  const cells: Cell[] = [];
  const gap = L.gap ?? 1;
  let x = 0, n = 0;
  for (const ch of text.toUpperCase()) {
    if (ch === ' ') { x += (L.space ?? 3) + gap; n++; continue; }
    let g = glyphOf(ch);
    if (L.stencil) g = stencilCut(g);
    const gw = g[0].length, w = gw + (L.bold ? 1 : 0);
    for (let r = 0; r < 7; r++) for (let c = 0; c < w; c++) if ((c < gw && g[r][c]) || (L.bold && c > 0 && g[r][c - 1])) cells.push({ x: x + c, y: r, i: n });
    x += w + gap; n++;
  }
  return { cells, w: Math.max(0, x - gap) };
};

/** How wide `text` sets in a look (px; the lean counted, not the shadow or the outline). */
export const signW = (text: string, L: Look) => layout(text, L).w * (L.sx ?? 1) + Math.ceil(6 * (L.slant ?? 0)) + (L.serif ? 2 : 0);
/** How tall it sets (px). */
export const signH = (L: Look) => 7 * (L.sy ?? 1);

const h01 = (n: number) => { const s = Math.sin(n * 91.7 + 13.1) * 43758.5453; return s - Math.floor(s); };

/** Sets `text` in a look: x its anchor (`align`), y its baseline. */
export const signText = (c: Ctx, text: string, x: number, y: number, L: Look, align: Align = 'center') => {
  const sx = L.sx ?? 1, sy = L.sy ?? 1, sl = L.slant ?? 0, seed = L.seed ?? 0;
  const { cells } = layout(text, L);
  if (!cells.length) return;
  const W = signW(text, L), H = 7 * sy;
  const x0 = Math.round(align === 'center' ? x - W / 2 : align === 'right' ? x - W : x) + (L.serif ? 1 : 0), top = Math.round(y) - H;
  const wob = L.wobble ?? 0;
  const at = (k: Cell): [number, number] => {
    let X = x0 + k.x * sx + Math.round((6 - k.y) * sl), Y = top + k.y * sy;
    if (wob) { X += Math.round((h01(k.i + seed) - 0.5) * wob); Y += Math.round((h01(k.i * 3 + seed + 7) - 0.5) * 2 * wob); }
    return [X, Y];
  };
  const on = new Set(cells.map(k => `${k.x},${k.y}`));
  const has = (k: Cell, dx: number, dy: number) => on.has(`${k.x + dx},${k.y + dy}`);
  const rect = (X: number, Y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(X, Y, w, h); };
  const fills = typeof L.fill === 'string' ? [L.fill] : L.fill;
  const bandAt = (row: number) => Math.min(fills.length - 1, Math.floor((row / H) * fills.length));
  // (the stems' ends, for serifs: a cell with its stroke going only up or only down)
  const ends = L.serif ? cells.filter(k => !has(k, -1, 0) && !has(k, 1, 0) && (has(k, 0, 1) !== has(k, 0, -1))) : [];
  const serifs = (grow: number, col: string, dx = 0, dy = 0) => {
    for (const k of ends) { const [X, Y] = at(k); rect(X - 1 - grow + dx, (has(k, 0, 1) ? Y : Y + sy - 1) - grow + dy, sx + 2 + grow * 2, 1 + grow * 2, col); }
  };
  // (the drips: off a stroke's foot, some of them, each its own length)
  const drips: [number, number, number][] = [];
  if (L.drip) for (const k of cells) {
    if (has(k, 0, 1) || h01(k.x * 7.3 + k.y * 3.1 + seed) > (L.drip.rate ?? 0.3)) continue;
    const [X, Y] = at(k);
    drips.push([X, Y + sy, Math.max(2, Math.round((0.3 + h01(k.x * 1.7 + seed + 2) * 0.7) * (L.drip.len ?? sy * 4)))]);
  }

  if (L.glow) {
    for (const k of cells) { const [X, Y] = at(k); for (let py = -2; py < sy + 2; py++) for (let px = -2; px < sx + 2; px++) if (((X + px + Y + py) & 1) === 0) rect(X + px, Y + py, 1, 1, L.glow); }
    for (const k of cells) { const [X, Y] = at(k); rect(X - 1, Y - 1, sx + 2, sy + 2, L.glow); }
  }
  if (L.shadow) {
    const d = L.drop ?? 1;
    for (const k of cells) { const [X, Y] = at(k); rect(X + d, Y + d, sx, sy, L.shadow); }
    serifs(0, L.shadow, d, d);
  }
  if (L.ink) {
    for (const k of cells) { const [X, Y] = at(k); rect(X - 1, Y - 1, sx + 2, sy + 2, L.ink); }
    serifs(1, L.ink);
    for (const [X, Y, len] of drips) { rect(X - 1, Y - 1, sx + 2, len + 2, L.ink); rect(X - 1, Y + len - 1, sx + 3, 3, L.ink); }
  }
  if (L.lip) {
    for (const k of cells) { const [X, Y] = at(k); rect(X + 1, Y + 1, sx, sy, L.lip); }
    serifs(0, L.lip, 1, 1);
  }
  if (L.bulbs) {
    const lit = L.bulbs.col ?? '#FFE070', dim = L.bulbs.dim ?? '#B89848';
    cells.forEach((k, i) => {
      const [X, Y] = at(k), bw = Math.max(1, sx - 1), bh = Math.max(1, sy - 1);
      rect(X, Y, sx, sy, '#1A1208');
      rect(X, Y, bw, bh, L.bulbs!.lit ? lit : i % 4 ? dim : lit);
      if (bw > 1 && bh > 1) rect(X, Y, 1, 1, L.bulbs!.lit ? '#FFFFFF' : '#F8E8B0');
    });
    return;
  }
  // the strokes, banded down their height (a dithered seam where a band starts, if the cells are tall enough)
  for (const k of cells) {
    const [X, Y] = at(k);
    for (let r = 0; r < sy; r++) {
      const row = k.y * sy + r, b = bandAt(row);
      if (L.dither && b > 0 && bandAt(row - 1) !== b && sx > 1) {
        for (let px = 0; px < sx; px++) rect(X + px, Y + r, 1, 1, fills[((X + px + Y + r) & 1) ? b : b - 1]);
      } else rect(X, Y + r, sx, 1, fills[b]);
    }
  }
  if (L.serif) for (const k of ends) { const [X, Y] = at(k), down = has(k, 0, 1); rect(X - 1, down ? Y : Y + sy - 1, sx + 2, 1, fills[down ? bandAt(k.y * sy) : bandAt(k.y * sy + sy - 1)]); }
  for (const [X, Y, len] of drips) {
    rect(X, Y, sx, len, L.drip!.col); rect(X, Y + len - 1, sx + 1, 2, L.drip!.col);
    if (L.drip!.tip) rect(X, Y + len - 1, 1, 1, L.drip!.tip);
  }
  if (L.hi) for (const k of cells) if (!has(k, 0, -1)) { const [X, Y] = at(k); rect(X, Y, sx, 1, L.hi); }
  if (L.lo) for (const k of cells) if (!has(k, 0, 1)) { const [X, Y] = at(k); rect(X, Y + sy - 1, sx, 1, L.lo); }
  if (L.grain) for (const k of cells) {
    const [X, Y] = at(k), g = h01(k.y * 5.1 + Math.floor(k.x / 3) * 1.3 + seed);
    if (g > 0.45) rect(X, Y + Math.floor(sy * g) % sy, sx, 1, L.grain);
  }
  if (L.twist) for (const k of cells) {
    const [X, Y] = at(k), odd = (k.x + k.y) & 1;
    if (sx > 1 && sy > 1) { rect(X, Y, 1, 1, L.twist[0]); rect(X + sx - 1, Y + sy - 1, 1, 1, L.twist[1]); }
    else rect(X, Y, sx, sy, L.twist[odd]);
  }
  if (L.nodes) for (const k of cells) if (L.nodes.rows.includes(k.y)) { const [X, Y] = at(k); rect(X, Y, sx, 1, L.nodes.dark); if (sy > 1) rect(X, Y + 1, sx, 1, L.nodes.lit); }
  if (L.worn && L.wornCol) cells.forEach((k, i) => {
    if (h01(i * 4.3 + seed * 1.9) >= L.worn!) return;
    const [X, Y] = at(k), cx = sx > 1 ? Math.floor(h01(i + seed) * sx) : 0, cy = sy > 1 ? Math.floor(h01(i * 2 + seed) * sy) : 0;
    rect(X + cx, Y + cy, 1, 1, L.wornCol!);
  });
  if (L.moss) cells.forEach((k, i) => { if (!has(k, 0, 1) && h01(i * 2.9 + seed) < 0.4) { const [X, Y] = at(k); rect(X, Y + sy - 1, sx, 1, L.moss!); } });
};

// ---------------------------------------------------------------------------------------------------------------
// For the setters: sizes, ramps, and dropping a look in where a line of the stock font was.

const HEX = /^#[0-9a-f]{6}$/i;
/** a mixed toward b by k (left alone if either isn't a plain hex color: an rgba wash stays what it was). */
export const tone = (a: string, b: string, k: number) => (HEX.test(a) && HEX.test(b) ? mix(a, b, k) : a);
/** A five-step ramp round a color, top to bottom: lit, lit, itself, itself, its shade. */
export const rampDown = (col: string, k = 0.3) => [tone(col, '#FFFFFF', k), tone(col, '#FFFFFF', k * 0.45), col, col, tone(col, '#000000', k * 0.6)];
/** The cell size that sets about as big as the stock font did at `size` px (its caps 7/8 of that tall). */
export const cellFor = (size: number): { sx: number; sy: number } => (size >= 20 ? { sx: 3, sy: 3 } : size >= 12 ? { sx: 2, sy: 2 } : size >= 10 ? { sx: 1, sy: 2 } : { sx: 1, sy: 1 });
/** The baseline that puts a look's letters' middle where the stock font's were, set at `size` on baseline y. */
export const baseFor = (y: number, size: number, L: Look) => Math.round(y - (7 * size) / 16 + signH(L) / 2);
/** Sets a look where a line of the stock font at `size` (baseline y) was: the same middle, the same anchor. */
export const signAt = (c: Ctx, text: string, x: number, y: number, size: number, L: Look, align: Align = 'center') => signText(c, text, x, baseFor(y, size, L), L, align);
/** A look shrunk (its cells narrowed, then shortened) till `text` fits `maxW`, if it can be. */
export const fit = (text: string, L: Look, maxW: number): Look => {
  let l = L;
  while (signW(text, l) > maxW && ((l.sx ?? 1) > 1 || (l.sy ?? 1) > 1)) {
    const sx = l.sx ?? 1, sy = l.sy ?? 1;
    l = sx > 1 ? { ...l, sx: sx - 1 } : { ...l, sy: sy - 1 };
  }
  return l;
};
/** The plain sign-writer's plate: enamel paint, top-lit, a drop shadow in the board's shade. */
export const plate = (size: number, ink: string, shadow?: string | null): Look => ({ ...cellFor(size), fill: rampDown(ink, 0.25), dither: true, shadow: shadow ?? undefined });
