// Space Needle 2's lettering: no stock font on its signs. The park's alphabet (square/lettering.ts, `glyphDots`: the
// same letterforms as every Futureland sign), set the ways only the needle's signs need, so each reads as what it's
// made of (the park's own styles, stencil and neon among them, are square/lettering.ts's `lettering`):
//
//   googie    the marquee and the big headers: tall, slanted, chrome-ramped, inked, a colored drop shadow
//   deco      chrome letters over the elevators: tall upright capitals, lit along their tops, inked
//   brass     engraved plaques: the letters cut in (dark, a lit lower lip where the cut catches the light)
//   painted   hand-lettered: brush strokes, each letter a touch off its line, the paint thick in places
//   led       the readouts and the EXIT: lit dots on a dark face, each dot a little glow
//   poster    period poster type: chunky, slanted, a two-tone fill and a hard offset shadow
//
// `letters(c, text, x, y, style)`: x the middle, y the baseline (the letters sit on it, like fillText's).

import { glyphDots } from '../square/lettering';

type Ctx = CanvasRenderingContext2D;
const ROWS = 7;

export type Family = 'googie' | 'deco' | 'brass' | 'painted' | 'led' | 'poster';
export type LetterStyle = {
  family: Family;
  /** One cell's size (canvas px): its width, and its height (taller than wide for the condensed families). */
  px?: number; py?: number;
  /** The face colors, top row to bottom (a ramp), or one. */
  fill: string[] | string;
  /** The outline. */
  ink?: string;
  /** A drop shadow (colored, offset down and right by `drop` px). */
  shadow?: string; drop?: number;
  /** brass: the lit lip of the cut; led: the dark face's unlit dots. */
  hi?: string;
  /** Letter spacing in cells (default 1). */
  gap?: number;
  /** A seed (painted: which letter wobbles which way). */
  seed?: number;
};

const h01 = (n: number) => { const s = Math.sin(n * 91.7 + 13.1) * 43758.5453; return s - Math.floor(s); };

/** Each letter's cells, laid out left to right (in cells), and the whole width (in cells). */
const layout = (s: string, gap: number) => {
  const cells: { gx: number; gy: number; i: number }[] = [];
  let x = 0, i = 0;
  for (const ch of s.toUpperCase()) {
    const g = glyphDots(ch);
    for (const [k, r] of g.on) cells.push({ gx: x + k, gy: r, i });
    x += g.w + gap; i++;
  }
  return { cells, w: Math.max(0, x - gap) };
};

/** How wide `s` sets in a style (canvas px). */
export const lettersWidth = (s: string, st: Pick<LetterStyle, 'px' | 'gap' | 'family'>) => {
  const px = st.px ?? 1;
  return layout(s, st.gap ?? 1).w * px + (st.family === 'googie' || st.family === 'poster' ? ROWS * 0.5 * px : 0);
};

/** Sets `s` centered on x, sitting on y. */
export const letters = (c: Ctx, s: string, x: number, y: number, st: LetterStyle) => {
  const px = st.px ?? 1, py = st.py ?? px, gap = st.gap ?? 1;
  const { cells, w } = layout(s, gap);
  const fills = typeof st.fill === 'string' ? [st.fill] : st.fill;
  const slant = st.family === 'googie' || st.family === 'poster' ? 0.5 : 0;
  const x0 = Math.round(x - (w * px + slant * ROWS * px) / 2), y0 = Math.round(y - ROWS * py);
  const seed = st.seed ?? 0;
  // where each cell lands (the slant: each row up shifted right; painted: each letter nudged off the line)
  const at = (q: { gx: number; gy: number; i: number }) => {
    let X = x0 + q.gx * px + Math.round((ROWS - 1 - q.gy) * slant * px), Y = y0 + q.gy * py;
    if (st.family === 'painted') { X += Math.round((h01(q.i + seed) - 0.5) * 1.6); Y += Math.round((h01(q.i * 3 + seed + 7) - 0.5) * 2.4); }
    return [X, Y] as const;
  };
  const fillAt = (gy: number) => fills[Math.min(fills.length - 1, Math.floor((gy / ROWS) * fills.length))];
  const rect = (X: number, Y: number, W: number, H: number, col: string) => { c.fillStyle = col; c.fillRect(X, Y, W, H); };

  if (st.family === 'led') {
    // (the dark face's unlit dots under the whole line, then the lit ones: each a dot, a hot middle, a halo)
    const on = new Set(cells.map(q => `${q.gx},${q.gy}`));
    const dw = px >= 2 ? px - 1 : 1, dh = py >= 2 ? py - 1 : 1;
    if (st.hi) for (let gx = 0; gx < w; gx++) for (let gy = 0; gy < ROWS; gy++) if (!on.has(`${gx},${gy}`)) rect(x0 + gx * px, y0 + gy * py, dw, dh, st.hi);
    if (st.shadow) for (const q of cells) { const [X, Y] = at(q); rect(X - 1, Y - 1, dw + 2, dh + 2, st.shadow); }
    for (const q of cells) { const [X, Y] = at(q); rect(X, Y, dw, dh, fillAt(q.gy)); }
    if (px >= 3) for (const q of cells) { const [X, Y] = at(q); rect(X, Y, 1, 1, '#FFFFFF'); }
    return;
  }
  if (st.family === 'brass') {
    // (cut in: the lit lip along the cut's lower right, then the cut itself, dark, a shade lighter at its foot)
    if (st.hi) for (const q of cells) { const [X, Y] = at(q); rect(X + 1, Y + 1, px, py, st.hi); }
    for (const q of cells) { const [X, Y] = at(q); rect(X, Y, px, py, fillAt(q.gy)); }
    return;
  }
  const drop = st.drop ?? 1;
  if (st.shadow) for (const q of cells) { const [X, Y] = at(q); rect(X + drop, Y + drop, px, py, st.shadow); }
  if (st.ink) for (const q of cells) { const [X, Y] = at(q); rect(X - 1, Y - 1, px + 2, py + 2, st.ink); }
  for (const q of cells) {
    const [X, Y] = at(q);
    rect(X, Y, px, py, fillAt(q.gy));
    // painted: the brush's thick spots, where the paint pooled
    if (st.family === 'painted' && h01(q.gx * 5 + q.gy * 11 + seed) > 0.8) rect(X, Y + py, px, 1, fillAt(q.gy));
  }
  // googie / deco: the lit top edge of each cell that's a letter's top (chrome catching the light)
  if ((st.family === 'googie' || st.family === 'deco') && px >= 2) {
    const on = new Set(cells.map(q => `${q.gx},${q.gy}`));
    for (const q of cells) if (!on.has(`${q.gx},${q.gy - 1}`)) { const [X, Y] = at(q); rect(X, Y, px, 1, '#FFFFFF'); }
  }
};
