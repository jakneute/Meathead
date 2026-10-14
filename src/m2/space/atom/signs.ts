// The giant atom's and the ride's signs (shared by atom/ and ride/): the park's own hand-built lettering
// (square/lettering.ts: chrome, neon, enamel, marquee, stencil...) on a beveled board, stamped; and what holds every
// one of them up (legs down to what they stand on, straps or cables up to what they hang from, a bracket onto a wall).
// Nothing's ever drawn over a sign's words: whatever holds it is drawn first, or stops at its frame.

import { INK, box, stamp, sign, mix, rampOf } from '../../intro/art/kit';
import { lettering, letterSize, type Letter } from '../square/lettering';
import { cyl } from './snes';

type Ctx = CanvasRenderingContext2D;
export type { Letter } from '../square/lettering';

/** A board's size for its words (one or more lines, '\n'), its frame not counted. */
export const plateSize = (text: string, font: Letter, pad = 6): [number, number] => {
  const lines = text.split('\n'), sz = lines.map(l => letterSize(l, font));
  return [Math.max(...sz.map(z => z[0])) + pad * 2, sz[0][1] * lines.length + (lines.length - 1) * 2 + Math.round(pad * 0.7) * 2];
};

/**
 * A board with the words lettered on it (stamped once, by `key`), its middle at (x, y). `lamps`: the neon and the bulbs
 * lit (indoors in the dark ride: on; left out: by the time of day). Returns its frame's box [x0, y0, x1, y1] (outside
 * the ink), so what holds it up can be put right.
 */
export const plate = (c: Ctx, key: string, x: number, y: number, text: string, font: Letter, face: string, ink: string, pad = 6, lamps = true, frame = INK): [number, number, number, number] => {
  const [w, h] = plateSize(text, font, pad), lines = text.split('\n'), lh = letterSize('A', font)[1] + 2;
  const X = Math.round(x), Y = Math.round(y), hw = Math.round(w / 2), hh = Math.round(h / 2);
  c.save(); c.translate(X, Y);
  stamp(c, `plate-${key}`, -hw - 6, -hh - 6, w + 12, h + 12, g => {
    sign(g, -hw, -hh, w, h, face, '', ink, 8, frame);
    lines.forEach((l, i) => lettering(g, l, 0, (i - (lines.length - 1) / 2) * lh, font, ink, face, lamps));
  });
  c.restore();
  return [X - hw - 4, Y - hh - 4, X - hw + w + 4, Y - hh + h + 4];
};

/** Where plate() would put a board's frame ([x0, y0, x1, y1]), without drawing it (to put what holds it up first). */
export const plateBoxAt = (text: string, font: Letter, x: number, y: number, pad = 6): [number, number, number, number] => {
  const [w, h] = plateSize(text, font, pad), X = Math.round(x), Y = Math.round(y), hw = Math.round(w / 2), hh = Math.round(h / 2);
  return [X - hw - 4, Y - hh - 4, X - hw + w + 4, Y - hh + h + 4];
};

/** A board screwed to a wall (a flat, the queue's wall): its brackets behind it, then the board. */
export const wallPlate = (c: Ctx, key: string, x: number, y: number, text: string, font: Letter, face: string, ink: string, pad = 6) => {
  const [x0, y0, x1, y1] = plateBoxAt(text, font, x, y, pad);
  brackets(c, x0, x1, y0 + 2); brackets(c, x0, x1, y1 - 8);
  return plate(c, key, x, y, text, font, face, ink, pad);
};

/** Square steel legs from `top` down to `foot` (a plate at the foot, bolted), at each of `xs`. */
export const legs = (c: Ctx, xs: number[], top: number, foot: number, col = '#52525B', w = 6) => {
  const r = rampOf(col);
  for (const x of xs) {
    const X = Math.round(x - w / 2);
    box(c, X - 1, top, w + 2, foot - top, INK);
    box(c, X, top, w, foot - top, r[2]); box(c, X, top, 1, foot - top, r[4]); box(c, X + w - 2, top, 2, foot - top, r[0]);
    box(c, X - 4, foot - 4, w + 8, 4, INK); box(c, X - 3, foot - 3, w + 6, 2, r[3]);
  }
};

/** Cables (or straps) from `top` down to `bot` at each of `xs`, a clip where each takes hold. */
export const cables = (c: Ctx, xs: number[], top: number, bot: number, col = '#A1A1AA', strap = false) => {
  for (const x of xs) {
    const X = Math.round(x), w = strap ? 4 : 2;
    box(c, X - 1, top, w + 2, bot - top, INK); box(c, X, top, w, bot - top, col);
    if (strap) box(c, X, top, 1, bot - top, mix(col, '#FFFFFF', 0.35));
    box(c, X - 2, bot - 3, w + 4, 4, INK); box(c, X - 1, bot - 2, w + 2, 2, '#71717A');
  }
};

/** A pipe (a batten, a rail) across from x0 to x1 at y: steel tube, lit along its top. */
export const pipe = (c: Ctx, x0: number, x1: number, y: number, col = '#52525B', d = 5) => cyl(c, x0, y, x1 - x0, d, col);

/** Angle brackets holding a board's back off a wall (drawn first: the board goes over them), under its two ends. */
export const brackets = (c: Ctx, x0: number, x1: number, y: number) => {
  for (const x of [x0 + 10, x1 - 14]) { box(c, x - 1, y - 2, 6, 10, INK); box(c, x, y - 1, 4, 8, '#71717A'); box(c, x, y - 1, 1, 8, '#D4D4D8'); }
};
