// Hollywood Land's billboard faces (the boards far off: down the next street over, over the city's rooftops, on the
// lot's soundstage, round the Stuntery, the coaster's): parody one-sheets painted the way a print shop's look from the
// street, peak SNES. The ink in stepped ramps (banded gradients, dithered seams), lettering with an outline, a lit top
// and a drop shadow, everything lit from the upper left; the paper pasted up in sheets (the seams, a corner peeling, the
// sun's bleach along the top, grime run down from the lamps). Each painter puts a board's face in (x, y, w, h) on the
// layer's tile, its colors through the layer's `T` (the hour, the haze), and is only ever painted the once with it.
//
//   steveBoard      Stuntman Steve (yellow, like everything of his): the sunburst off his head, him a gross-up
//                   (steveBust.ts) with his thumb up, the red band along its foot, a starburst stuck on
//   revengersBoard  REVENGERS 15: five heroes posed (one of them gone to seed) against a blast over a skyline
//   happywoodBoard  HAPPYWOOD THE STUDIO TOUR: its hill (the fallen O), the tram, the asbestos news
//   cityBoard       the little ones over the city's rooftops: a lawyer, a burger, BOOM 4
//
// Nothing on them is lit along its top like somewhere to stand: the frames are one tone all round.

import { type Ctx, INK, box, checker, mix, hash, poly, bandedGradient, words, plain, STEVE } from './blvd/kit';
import type { Look } from '../signLetters';
import { drawBust } from '../grossBust';
import { steveBust } from './steveBust';

type T = (c: string) => string;
/** A color's ramp (shadow to highlight) through the layer's T. */
const r6 = (T: T, c: string) => [mix(c, INK, 0.62), mix(c, INK, 0.36), mix(c, INK, 0.14), c, mix(c, '#FFFFFF', 0.28), mix(c, '#FFFFFF', 0.56)].map(T);

/** Whatever's painted in `fn` kept inside the board (rays, a skyline, a blast run off its edges). */
const inside = (g: Ctx, x: number, y: number, w: number, h: number, fn: () => void) => { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(); g.restore(); };

/** Print-shop lettering: the color banded down the strokes (dithered), an outline, a lit top, a drop shadow. */
export const printed = (T: T, col: string, sx: number, sy: number, ink = '#1A0C06'): Look => ({
  sx, sy, gap: sx >= 2 ? 1 : 1, fill: [mix(col, '#FFFFFF', 0.45), mix(col, '#FFFFFF', 0.15), col, col, mix(col, '#000000', 0.3)].map(T), dither: true,
  ink: T(ink), shadow: T(mix(ink, '#000000', 0.4)), drop: 1, hi: sy >= 2 ? T(mix(col, '#FFFFFF', 0.7)) : undefined,
});

/** A sunburst: `n` rays out of (cx, cy) to radius r, every other one in `col`. */
const rays = (g: Ctx, cx: number, cy: number, r: number, n: number, col: string, spin = 0) => {
  for (let k = 0; k < n; k += 2) { const a = spin + (k / n) * Math.PI * 2, d = Math.PI / n; poly(g, [[cx, cy], [cx + Math.cos(a - d) * r, cy + Math.sin(a - d) * r], [cx + Math.cos(a + d) * r, cy + Math.sin(a + d) * r]], col); }
};

/** A ball in rows of 1px (a blast, a burger's bun): ragged by `jag`, its rows from `top` (row 0) down. */
const rowBall = (g: Ctx, cx: number, cy: number, r: number, col: string, jag = 0, seed = 0, ry = r) => {
  for (let dy = -ry; dy <= ry; dy++) {
    const u = dy / ry, hw = Math.round(Math.sqrt(Math.max(0, 1 - u * u)) * r + (jag ? (hash(seed + dy * 1.7) - 0.5) * jag : 0));
    if (hw > 0) box(g, cx - hw, cy + dy, hw * 2, 1, col);
  }
};

/** A starburst sticker slapped on: a ragged star, inked, lit up its upper left, the words in it. */
const sticker = (g: Ctx, T: T, cx: number, cy: number, r: number, col: string, lines: string[], ink: string) => {
  const star = (rr: number) => { const pts: [number, number][] = []; for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2, q = k % 2 ? rr * 0.78 : rr; pts.push([Math.round(cx + Math.cos(a) * q), Math.round(cy + Math.sin(a) * q * 0.86)]); } return pts; };
  const R = r6(T, col);
  poly(g, star(r + 1).map(([x, y]) => [x + 1, y + 1] as [number, number]), T('#2A1408'));
  poly(g, star(r + 1), T(INK)); poly(g, star(r), R[3]);
  rowBall(g, cx - 1, cy - 1, Math.round(r * 0.62), R[4], 0, 0, Math.round(r * 0.52));
  box(g, cx - Math.round(r * 0.5), cy - Math.round(r * 0.5), Math.round(r * 0.4), 1, R[5]);
  const lh = 8, y0 = Math.round(cy - (lines.length * lh) / 2 + 7);
  lines.forEach((l, i) => words(g, l, cx, y0 + i * lh, plain(1, 1, T(ink))));
};

/** The paste-up over a face: the sheets' seams (a lit edge where one laps the next), the sun's bleach dithered along
 *  the top, grime run down from the lamps, a corner of one sheet peeling off to the board's grey back. */
export const pasteUp = (g: Ctx, T: T, x: number, y: number, w: number, h: number, seed: number) => {
  const sheet = w > 200 ? 64 : w > 90 ? 48 : 30;
  for (let k = x + sheet; k < x + w - 6; k += sheet) { g.globalAlpha = 0.22; box(g, k, y, 1, h, T('#2A1408')); g.globalAlpha = 0.16; box(g, k + 1, y, 1, h, '#FFFFFF'); g.globalAlpha = 1; }
  g.globalAlpha = 0.16; checker(g, x, y, w, 2, T('#FFFFFF'), 0, 1); g.globalAlpha = 0.08; box(g, x, y, w, 4, T('#FFFFFF')); g.globalAlpha = 1;
  for (let k = 0; k < Math.round(w / 26); k++) {
    const sx = Math.round(x + 4 + hash(seed + k * 3.3) * (w - 8)), len = Math.round(4 + hash(seed + k * 7.1) * h * 0.4);
    g.globalAlpha = 0.18; box(g, sx, y, 1, len, T('#3A2A1A')); g.globalAlpha = 0.1; box(g, sx + 1, y, 1, Math.round(len * 0.6), T('#3A2A1A')); g.globalAlpha = 1;
  }
  // (a corner peeling: the sheet's lower right curled over, its back pale, the board grey under it)
  if (w > 60) {
    const px = x + Math.round(sheet * (1 + Math.floor(hash(seed) * Math.max(1, (w - 20) / sheet - 1)))) - 1, py = y + h, s = w > 200 ? 8 : 5;
    poly(g, [[px - s, py], [px, py - s], [px, py]], T('#6A6A70'));
    poly(g, [[px - s, py], [px, py - s], [px - s, py - s]], T('#E8E2D2'));
    box(g, px - s, py - s, 1, s, T('#B8B0A0'));
  }
};

/** The board's steel round its face: one tone all round (no lit top: it's not somewhere to stand), inked, bolted, rust
 *  run down off the bolts along its foot. */
export const boardFrame = (g: Ctx, T: T, x: number, y: number, w: number, h: number, seed = 0) => {
  const S = r6(T, '#5A5E66');
  box(g, x - 3, y - 3, w + 6, h + 6, T(INK));
  box(g, x - 2, y - 2, w + 4, h + 4, S[2]); box(g, x - 2, y + h + 1, w + 4, 1, S[1]); box(g, x - 2, y - 2, 1, h + 4, S[3]);
  for (let k = x + 6; k < x + w - 2; k += Math.max(16, Math.round(w / 8))) {
    for (const by of [y - 2, y + h]) { box(g, k, by, 2, 2, S[0]); box(g, k, by, 1, 1, S[4]); }
    if (hash(seed + k * 0.37) > 0.45) { g.globalAlpha = 0.5; box(g, k, y + h + 2, 1, 2 + Math.round(hash(seed + k) * 4), T('#8A4A22')); g.globalAlpha = 1; }
  }
};

/** Steve's thumb up (his fist, the thumb, shaded) at (x, y): its knuckles' top left; `s` its size. */
const thumb = (g: Ctx, T: T, x: number, y: number, s: number) => {
  const K = r6(T, '#C88A5C'), u = (n: number) => Math.max(1, Math.round(n * s));
  box(g, x - 1, y - u(6) - 1, u(3) + 2, u(6) + 2, T(INK)); box(g, x - 1, y - 1, u(7) + 2, u(6) + 2, T(INK));
  box(g, x, y - u(6), u(3), u(6), K[3]); box(g, x, y - u(6), 1, u(6), K[4]); box(g, x, y - u(6), u(3), 1, K[5]);
  box(g, x, y, u(7), u(6), K[3]); box(g, x, y, u(7), 1, K[4]); box(g, x + u(7) - 1, y, 1, u(6), K[1]);
  for (let k = 1; k < 4; k++) box(g, x + u(2), y + u(k * 1.5), u(5), 1, K[1]);
  box(g, x, y + u(6) - 1, u(7), 1, K[2]);
  // (the yellow cuff of his stunt suit)
  box(g, x - 1, y + u(6), u(7) + 2, u(3) + 1, T(INK)); box(g, x, y + u(6), u(7), u(3), T(STEVE[3])); box(g, x, y + u(6), u(7), 1, T(STEVE[5]));
};

/** A tiny stunt car (red, its white racing stripe) at (x, y) (its middle), tipped nose up `up` px over its length. */
const stuntCar = (g: Ctx, T: T, x: number, y: number, s = 1) => {
  const Rd = r6(T, '#C82828'), u = (n: number) => Math.round(n * s);
  box(g, x - u(10) - 1, y - u(3) - 1, u(20) + 2, u(6) + 2, T(INK)); box(g, x - u(5) - 1, y - u(7) - 1, u(10) + 2, u(5) + 2, T(INK));
  box(g, x - u(10), y - u(3), u(20), u(6), Rd[3]); box(g, x - u(10), y - u(3), u(20), 1, Rd[4]); box(g, x - u(10), y + u(3) - 1, u(20), 1, Rd[1]);
  box(g, x - u(5), y - u(7), u(10), u(4), Rd[2]); box(g, x - u(4), y - u(6), u(4), u(2), T('#9AC8E8')); box(g, x + u(1), y - u(6), u(3), u(2), T('#6A98C0'));
  box(g, x - u(10), y - 1, u(20), 1, T('#F4F0E8'));
  for (const wx of [x - u(6), x + u(6)]) { rowBall(g, wx, y + u(3), u(2.5), T(INK)); box(g, wx - 1, y + u(3) - 1, 2, 2, T('#8A8E96')); }
};

/** A port-a-potty (blue, its vent and its moon) standing on y at x; `s` its size. */
const potty = (g: Ctx, T: T, x: number, y: number, s = 1) => {
  const B = r6(T, '#2A6AB8'), w = Math.round(9 * s), h = Math.round(16 * s);
  box(g, x - 1, y - h - 1, w + 2, h + 1, T(INK)); box(g, x, y - h, w, h, B[3]); box(g, x, y - h, 1, h, B[4]); box(g, x + w - 1, y - h, 1, h, B[1]);
  box(g, x - 1, y - h - 3, w + 2, 3, T(INK)); box(g, x, y - h - 2, w, 2, B[4]);
  box(g, x + Math.round(w / 2) - 1, y - h + 3, 3, 2, B[0]);
};

// ---------------------------------------------------------------------------------------------------------------
// Stuntman Steve's

/** One of Steve's boards' faces: yellow banded down (dithered), the sunburst off his head, him a gross-up with his thumb
 *  up (`him`; or, not him, his car jumping a row of port-a-potties), the red band along its foot with `band` in it, the
 *  lines (text, size, color) set up the right of it, a starburst stuck on (`burst`). */
export const steveBoard = (g: Ctx, T: T, x: number, y: number, w: number, h: number, lines: [string, number, string][], o: { him?: boolean; band?: string; burst?: string[]; seed?: number } = {}) => {
  const Y = STEVE.map(T), seed = o.seed ?? 7, bandH = Math.max(6, Math.round(h * 0.15));
  bandedGradient(g, x, y, w, h, [Y[5], Y[4], Y[3], Y[3], Y[2]], Math.max(4, Math.round(h / 10)), 1);
  // (the sunburst: off his head, or off the jump; a glow ringed round where it comes from)
  const hx = o.him ? x + Math.round(Math.min(w * 0.17, h * 0.5)) : x + Math.round(w * 0.22), hy = y + Math.round(h * 0.42);
  inside(g, x, y, w, h - bandH, () => {
    rays(g, hx, hy, w * 1.2, 28, T(mix(STEVE[4], '#FFFFFF', 0.25)), 0.05);
    g.globalAlpha = 0.35; rowBall(g, hx, hy, Math.round(h * 0.42), Y[5]); g.globalAlpha = 0.5; rowBall(g, hx, hy, Math.round(h * 0.26), T('#FFFBE0')); g.globalAlpha = 1;
    // (half-tone dots dithered down the board's foot, the print's)
    g.globalAlpha = 0.22; checker(g, x, y + h - bandH - Math.round(h * 0.18), w, Math.round(h * 0.18), Y[1], 0, 1); g.globalAlpha = 1;
  });
  const bw = Math.round(Math.min(w * (w < 80 ? 0.46 : 0.34), (h - 2) * 0.94)), ts = h >= 100 ? 2 : 1;
  // (the red band: lit along its top, shaded under, the words in it, white)
  const Rd = r6(T, '#B42222'), by = y + h - bandH;
  box(g, x, by - 1, w, 1, T(INK)); box(g, x, by, w, bandH, Rd[3]); box(g, x, by, w, 1, Rd[5]); box(g, x, by + 1, w, 1, Rd[4]); box(g, x, y + h - 2, w, 2, Rd[1]);
  if (o.band) words(g, o.band, o.him ? x + Math.round((bw + w) / 2) : x + Math.round(w / 2), by + Math.round(bandH / 2) + 4, plain(1, 1, T('#FFF6E0'), T('#5A0A0A')));
  if (o.him) {
    // (him: a gross-up, bigger than life, his shoulders on the band; his thumb up beside his jaw)
    drawBust(g, steveBust('poster', T('#FFFFFF')), x + 3, y + 2, bw, h - 2, 150);
    if (h >= 50) thumb(g, T, x + bw + 1, y + Math.round(h * 0.42), ts);
  } else {
    // (not him: his car jumping a row of port-a-potties, the ramp, its speed lines)
    const gy = by - 2, n = 4, ps = h >= 80 ? 1.4 : 1, px0 = x + Math.round(Math.max(26, w * 0.12));
    for (let k = 0; k < n; k++) potty(g, T, px0 + k * Math.round(11 * ps), gy, ps);
    const R = r6(T, '#8A7A6A');
    poly(g, [[px0 - 22, gy], [px0 - 4, gy - 10], [px0 - 4, gy]], T(INK)); poly(g, [[px0 - 20, gy], [px0 - 5, gy - 8], [px0 - 5, gy]], R[3]);
    const cx = px0 + Math.round(n * 11 * ps * 0.5), cy = gy - Math.round(30 * ps);
    for (let k = 0; k < 4; k++) box(g, cx - Math.round(34 * ps) - k * 3, cy - 2 + k * 3, Math.round(16 * ps), 1, Y[1]);
    stuntCar(g, T, cx, cy, ps);
  }
  // (the words up the right of it)
  const l = o.him ? x + bw + 4 + (h >= 50 ? 9 * ts : 0) : x + Math.round(w * 0.42), r = x + w - (o.burst ? Math.round(Math.max(10, h * 0.2) * 2) + 8 : 3), tx = Math.round((l + r) / 2);
  let ty = y + 4;
  for (const [text, s, col] of lines) {
    const L = s >= 2 ? printed(T, col, s, s + 1) : plain(1, 1, T(col));
    ty += 7 * (s >= 2 ? s + 1 : 1) + (s >= 2 ? 5 : 4);
    words(g, text, tx, ty, L);
  }
  if (o.burst) sticker(g, T, x + w - Math.round(h * 0.2) - 6, y + Math.round(h * 0.26), Math.round(Math.max(10, h * 0.2)), '#E8302A', o.burst, '#FFF6E0');
  pasteUp(g, T, x, y, w, h - bandH, seed);
};

// ---------------------------------------------------------------------------------------------------------------
// REVENGERS 15

/** A hero standing on y at x (his middle): legs apart, fists, a cape behind, his mask; `fat` gone to seed (the belly
 *  over the belt). Lit up his left, shaded down his right, inked round. */
const hero = (g: Ctx, T: T, x: number, y: number, h: number, col: string, fat = false) => {
  const C = r6(T, col), K = r6(T, '#D8A880'), u = (n: number) => Math.max(1, Math.round((n * h) / 28));
  const bw = fat ? u(12) : u(9), top = y - h, head = u(6);
  // (the cape: out behind him, darker, swept)
  poly(g, [[x - bw / 2 - 1, top + head + 1], [x + bw / 2 + 1, top + head + 1], [x + bw / 2 + u(5), y - u(2)], [x - bw / 2 - u(5), y - u(1)]], T(INK));
  poly(g, [[x - bw / 2, top + head + 2], [x + bw / 2, top + head + 2], [x + bw / 2 + u(4), y - u(3)], [x - bw / 2 - u(4), y - u(2)]], C[1]);
  // (inked round: legs, body, head)
  box(g, x - bw / 2 - 1, top + head - 1, bw + 2, h - head - u(9) + 2, T(INK));
  box(g, x - bw / 2, y - u(10) - 1, u(4) + 2, u(10) + 1, T(INK)); box(g, x + bw / 2 - u(4) - 2, y - u(10) - 1, u(4) + 2, u(10) + 1, T(INK));
  box(g, x - u(3) - 1, top - 1, u(6) + 2, head + 2, T(INK));
  // (legs: dark tights, boots)
  for (const lx of [x - bw / 2 + 1, x + bw / 2 - u(4) - 1]) { box(g, lx, y - u(10), u(4), u(10), C[2]); box(g, lx, y - u(4), u(4), u(4), C[0]); box(g, lx, y - u(10), 1, u(6), C[3]); }
  // (the body: lit up its left; the emblem on its chest; the belt; the belly)
  const bt = top + head, bh = h - head - u(9);
  box(g, x - bw / 2, bt, bw, bh, C[3]); box(g, x - bw / 2, bt, 1, bh, C[5]); box(g, x - bw / 2 + 1, bt, 1, bh, C[4]); box(g, x + bw / 2 - 1, bt, 1, bh, C[1]);
  box(g, x - u(2), bt + u(2), u(4), u(3), T('#FAD43A')); box(g, x - u(1), bt + u(3), u(2), u(1), C[1]);
  if (fat) { rowBall(g, x, bt + bh - u(3), Math.round(bw / 2) + 1, C[4], 0, 0, u(3)); box(g, x - 1, bt + bh - u(3), 2, 1, C[0]); }
  box(g, x - bw / 2, bt + bh - u(2), bw, u(2), T('#3A2A1A')); box(g, x - 1, bt + bh - u(2), 2, u(2), T('#FAD43A'));
  // (fists on his hips)
  for (const fx of [x - bw / 2 - u(2), x + bw / 2]) { box(g, fx - 1, bt + bh - u(5) - 1, u(2) + 2, u(3) + 2, T(INK)); box(g, fx, bt + bh - u(5), u(2), u(3), C[2]); }
  // (the head: skin, the mask across the eyes, a jaw like a brick)
  box(g, x - u(3), top, u(6), head, K[3]); box(g, x - u(3), top, 1, head, K[4]); box(g, x + u(3) - 1, top, 1, head, K[1]);
  box(g, x - u(3), top, u(6), u(2), C[2]); box(g, x - u(3), top + u(2), u(6), u(1) + 1, C[1]); box(g, x - u(2), top + u(2), 1, 1, T('#FFFFFF')); box(g, x + u(1), top + u(2), 1, 1, T('#FFFFFF'));
  box(g, x - u(2), top + head - 1, u(4), 1, K[1]);
};

/** REVENGERS 15's face: the night banded down to a blast's glow, the blast going off behind them (rows, ragged), a
 *  skyline along the foot, five heroes posed (the middle one gone to seed), the chrome title, RESEMBLE. SOON. */
export const revengersBoard = (g: Ctx, T: T, x: number, y: number, w: number, h: number) => {
  bandedGradient(g, x, y, w, h, ['#0C1034', '#1A2462', '#34286A', '#6A2A5A', '#B44A3A'].map(T), Math.max(6, Math.round(h / 6)), 1);
  inside(g, x, y, w, h, () => {
    // (stars up top)
    for (let k = 0; k < Math.round(w / 9); k++) box(g, x + Math.round(hash(k * 2.3 + 1) * w), y + Math.round(hash(k * 5.1) * h * 0.4), 1, 1, T(k % 3 ? '#8A90C0' : '#FFFFFF'));
    // (the blast: ragged rows, red out to white in, its sparks flung off)
    const bx = x + Math.round(w / 2), byy = y + Math.round(h * 0.62), r = Math.round(h * 0.55);
    rowBall(g, bx, byy, r, T('#8A1A2A'), 6, 3); rowBall(g, bx, byy, Math.round(r * 0.8), T('#D8402A'), 5, 5); rowBall(g, bx, byy, Math.round(r * 0.6), T('#F08A2A'), 4, 9);
    rowBall(g, bx, byy, Math.round(r * 0.4), T('#FAD43A'), 3, 11); rowBall(g, bx, byy, Math.round(r * 0.2), T('#FFF6C8'), 2, 13);
    for (let k = 0; k < 14; k++) { const a = hash(k * 3.7) * Math.PI * 2, d = r * (0.9 + hash(k * 1.3) * 0.5); box(g, Math.round(bx + Math.cos(a) * d), Math.round(byy + Math.sin(a) * d * 0.7), 1, 1, T(k % 2 ? '#FAD43A' : '#F08A2A')); }
    // (the skyline along the foot: towers in silhouette, a few windows lit)
    for (let k = 0, sx = x; sx < x + w; k++) {
      const tw = 6 + Math.round(hash(k * 1.9) * 10), th = 5 + Math.round(hash(k * 3.1) * h * 0.24);
      box(g, sx, y + h - th, tw, th, T('#120E22')); box(g, sx, y + h - th, 1, th, T('#2A1E3A'));
      for (let wy = y + h - th + 2; wy < y + h - 1; wy += 3) for (let wx = sx + 2; wx < sx + tw - 1; wx += 3) if (hash(wx * 0.7 + wy) > 0.6) box(g, wx, wy, 1, 1, T('#F2B060'));
      sx += tw;
    }
  });
  // (the five of them, posed, the middle one biggest; and, gone to seed, fattest)
  const hh = Math.round(h * 0.52), foot = y + h - 3, sp = Math.round(w / 6);
  const team: [number, string, number, boolean][] = [[-2, '#3A6AB8', 0.82, false], [2, '#2A8A4A', 0.82, false], [-1, '#8A3AB8', 0.92, false], [1, '#C8962E', 0.92, false], [0, '#B4243A', 1, true]];
  for (const [i, col, s, fat] of team) hero(g, T, x + Math.round(w / 2) + i * sp, foot, Math.round(hh * s), col, fat);
  // (the title, chrome: white down to gold; the line under it)
  const chrome: Look = { sx: 1, sy: 2, gap: 1, fill: ['#FFFFFF', '#DCE0EC', '#A8B0C8', '#FAD43A', '#C8962E'].map(T), dither: true, ink: T('#06061A'), shadow: T('#000000'), drop: 1 };
  words(g, 'REVENGERS 15', x + Math.round(w / 2), y + 17, chrome);
  words(g, 'RESEMBLE. SOON.', x + Math.round(w / 2), y + h - 2, plain(1, 1, T('#F4F0E8'), T('#06061A')));
  // (a red tag stuck up its corner: NOW IN 5D)
  const tg = r6(T, '#C82828');
  box(g, x + w - 27, y + 2, 25, 11, T(INK)); box(g, x + w - 26, y + 3, 23, 9, tg[3]); box(g, x + w - 26, y + 3, 23, 1, tg[5]); box(g, x + w - 26, y + 11, 23, 1, tg[1]);
  words(g, '5-D!', x + w - 14, y + 11, plain(1, 1, T('#FFF6E0')));
  pasteUp(g, T, x, y, w, h, 31);
};

// ---------------------------------------------------------------------------------------------------------------
// HAPPYWOOD THE STUDIO TOUR

/** HAPPYWOOD THE STUDIO TOUR's face: cream, pink rays off its hill (the letters on it, the second O fallen, like the
 *  real one), the tram going by under it, the name in red (outlined, lit, shadowed), the asbestos news. */
export const happywoodBoard = (g: Ctx, T: T, x: number, y: number, w: number, h: number) => {
  bandedGradient(g, x, y, w, h, ['#FFFDF4', '#F6F0E2', '#ECE2CC', '#E0D2B6'].map(T), 6, 1);
  const vw = Math.round(w * 0.32), cx = x + Math.round(vw / 2) + 2;
  inside(g, x, y, vw + 4, h, () => {
    rays(g, cx, y + h * 0.62, w * 0.6, 22, T('#F4C8C0'));
    // (the hill: stepped, lit up its left, its letters white on little legs, the O down the slope)
    const G = r6(T, '#7A9448'), top = y + Math.round(h * 0.38), base = y + h - 9;
    for (let k = 0; k <= base - top; k++) { const hw = Math.round((vw * 0.62 * (k + 2)) / (base - top + 2)); box(g, cx - hw, top + k, hw * 2, 1, k < 3 ? G[4] : G[3]); box(g, cx - hw, top + k, Math.max(1, Math.round(hw * 0.5)), 1, G[4]); box(g, cx + hw - 2, top + k, 2, 1, G[1]); }
    for (let k = 0; k < 9; k++) {
      if (k === 6) { box(g, cx - 16 + k * 4, base - 3, 3, 2, T('#F4F0E8')); continue; }
      const lx = cx - 17 + k * 4, ly = top + 5 + Math.abs(k - 4);
      box(g, lx, ly, 3, 4, T('#FFFFFF')); box(g, lx + 2, ly, 1, 4, T('#C8C0B4')); box(g, lx + 1, ly + 4, 1, 2, T('#5A4A3A'));
    }
    // (the tram: three cars, their striped awnings, faces in them, the wheels)
    const tyy = y + h - 4;
    for (let k = 0; k < 3; k++) {
      const tx = x + 3 + k * 9;
      box(g, tx - 1, tyy - 7, 9, 6, T(INK)); box(g, tx, tyy - 6, 7, 4, T('#F4F0E8')); box(g, tx, tyy - 6, 7, 1, T('#B4243A'));
      for (let f = 0; f < 2; f++) box(g, tx + 1 + f * 3, tyy - 4, 2, 1, T(f % 2 ? '#C88A5C' : '#E2B48C'));
      box(g, tx + 1, tyy - 2, 2, 2, T(INK)); box(g, tx + 5, tyy - 2, 2, 2, T(INK));
    }
  });
  box(g, x + vw + 4, y + 3, 1, h - 6, T('#C8B898'));
  const tx = x + vw + 4 + Math.round((w - vw - 4) / 2);
  words(g, 'HAPPYWOOD', tx, y + 17, printed(T, '#C8202A', 1, 2, '#3A0A0A'));
  words(g, 'STUDIO TOUR', tx, y + 28, plain(1, 1, T('#2A2228')));
  words(g, 'NOW 20% LESS', tx, y + 39, plain(1, 1, T('#B4243A')));
  words(g, 'ASBESTOS!', tx, y + 48, plain(1, 1, T('#B4243A')));
  box(g, x, y + h - 2, w, 2, T('#B4243A'));
  pasteUp(g, T, x, y, w, h - 2, 53);
};

// ---------------------------------------------------------------------------------------------------------------
// The little ones over the city

/** One of the little boards over the city's rooftops (`kind` 0 the injury lawyer, 1 the burger, 2 BOOM 4), its face in
 *  (x, y, w, h). */
export const cityBoard = (g: Ctx, T: T, x: number, y: number, w: number, h: number, kind: number) => {
  if (kind === 0) {
    // (the lawyer: blue, his grinning head (the comb-over, the teeth), SUE! in yellow)
    bandedGradient(g, x, y, w, h, ['#4A7AC8', '#3A6AB8', '#2A4A8A'].map(T), 4, 1);
    const K = r6(T, '#E2B48C');
    box(g, x + 2, y + 3, 9, h - 3, T(INK)); box(g, x + 3, y + 4, 7, h - 5, K[3]); box(g, x + 3, y + 4, 1, h - 5, K[4]); box(g, x + 9, y + 4, 1, h - 5, K[1]);
    box(g, x + 3, y + 3, 7, 2, T('#3A2A1E')); box(g, x + 4, y + 7, 1, 1, T(INK)); box(g, x + 7, y + 7, 1, 1, T(INK));
    box(g, x + 4, y + 10, 5, 2, T('#FFFDEC')); box(g, x + 4, y + 11, 5, 1, T('#C4AC6C'));
    box(g, x + 1, y + h - 3, 11, 3, T('#2A2A34')); box(g, x + 6, y + h - 3, 1, 3, T('#C82828'));
    words(g, 'SUE!', x + 24, y + 11, plain(1, 1, T('#FAD43A'), T('#0A1430')));
    box(g, x + 14, y + 14, 20, 1, T('#F4F0E8')); checker(g, x + 14, y + 16, 20, 1, T('#F4F0E8'), 0, 1);
  } else if (kind === 1) {
    // (the burger: red, the bun stepped (its seeds), the lettuce, the patty; MEAT? in white)
    bandedGradient(g, x, y, w, h, ['#D8402A', '#B4243A', '#8A1A2A'].map(T), 4, 1);
    const bx = x + 8, B = r6(T, '#D89A4A');
    box(g, bx - 6, y + 3, 13, 6, T(INK)); rowBall(g, bx, y + 7, 6, B[3], 0, 0, 3); box(g, bx - 3, y + 5, 3, 1, B[5]);
    box(g, bx - 3, y + 6, 1, 1, T('#FFF6E0')); box(g, bx + 2, y + 5, 1, 1, T('#FFF6E0'));
    box(g, bx - 7, y + 10, 15, 2, T('#4A9A3A')); box(g, bx - 6, y + 12, 13, 3, T('#5A2A14')); box(g, bx - 6, y + 12, 13, 1, T('#7A3E1E'));
    box(g, bx - 6, y + 15, 13, 3, B[2]); box(g, bx - 6, y + h - 2, 13, 1, B[0]);
    words(g, 'MEAT?', x + w - 11, y + 12, plain(1, 1, T('#FFF6E0'), T('#3A0A0A')));
  } else {
    // (BOOM 4: black, a blast, the title in gold, a car flipping off it)
    box(g, x, y, w, h, T('#14101A'));
    inside(g, x, y, w, h, () => { rowBall(g, x + w / 2, y + h - 2, 13, T('#B4243A'), 4, 2); rowBall(g, x + w / 2, y + h - 2, 9, T('#F08A2A'), 3, 4); rowBall(g, x + w / 2, y + h - 2, 5, T('#FFF0A8'), 2, 6); });
    box(g, x + 4, y + h - 8, 5, 3, T(INK)); box(g, x + 5, y + h - 7, 3, 1, T('#C8C0B4'));
    words(g, 'BOOM 4', x + Math.round(w / 2), y + 9, { sx: 1, sy: 1, fill: ['#FFF0A8', '#FAD43A', '#C8962E'].map(T), ink: T('#000000'), gap: 1 });
  }
  g.globalAlpha = 0.14; box(g, x, y, w, 1, T('#FFFFFF')); g.globalAlpha = 1;
};


