// The way in's sign lettering (the plaza, the garage and the checkpoint, America USA): the park's alphabet
// (signLetters.ts, the same letterforms as every sign in the park), set as a theme park's patriotic front gate would
// set it. No stock type on any sign on the way in.
//
//   gilt      gold leaf: a ramp from pale gold to bronze down the letters, a dithered seam, a drop shadow (the
//             monuments, the frieze, the window lettering); `extruded` stands big letters out of their sign (an ink
//             edge, a red extrusion down and right, the gilt face)
//   flag      Old Glory's: the letters striped red and white down their height, inked navy, a drop shadow
//   federal   government enamel: crisp, top-lit, a drop shadow if given (the checkpoint, the shops' plates)
//   stencil   the garage's paint on concrete: sprayed, worn
//   led       readouts (the scanner, the pay machine): lit dots, a little bloom round them
//   tube      neon (the market's, the blade's): the glass dark when it's off; lit, the tube hot, a halo round it
//   marker    handwritten: one color, the hand a little off the line
//   print     printed (a sticker, a decal, a price tag): one color, an optional drop shadow
//
// Each takes the stock size the line used to be (signLetters' cellFor), or a cell size.

import { type Look, cellFor, tone, rampDown, signText, baseFor } from '../../signLetters';
export { signText, signAt, signW, signH, baseFor, type Look } from '../../signLetters';

type Ctx = CanvasRenderingContext2D;
type Cell = { sx: number; sy: number };
const at = (size: number | Cell): Cell => (typeof size === 'number' ? cellFor(size) : size);

export const GILT = ['#FFF0A0', '#F2CC4A', '#E2B53A', '#D4A017', '#9A6A0E'];
export const gilt = (size: number | Cell, shadow?: string): Look => ({ ...at(size), fill: GILT, dither: true, shadow });
export const flag = (size: number | Cell, ink = '#14205C', shadow?: string): Look => ({
  ...at(size), fill: ['#F06A55', '#F1EFEA', '#B91C1C', '#F1EFEA', '#B91C1C', '#DAD7D2', '#8E1414'], ink, shadow,
});
export const federal = (size: number | Cell, col: string, shadow?: string): Look => ({ ...at(size), fill: rampDown(col, 0.3), dither: true, shadow });
export const stencil = (size: number | Cell, col: string, board?: string, seed = 0): Look => ({ ...at(size), fill: col, stencil: at(size).sx > 1, worn: board ? 0.18 : 0, wornCol: board, seed });
export const led = (size: number | Cell, col: string, bg = '#0A0A0A'): Look => ({ ...at(size), fill: [tone(col, '#FFFFFF', 0.35), col, col, col], glow: tone(col, bg, 0.72) });
export const tube = (size: number | Cell, col: string, lit: boolean, bg = '#0A0A0A'): Look => (lit
  ? { ...at(size), fill: [tone(col, '#FFFFFF', 0.55), tone(col, '#FFFFFF', 0.2), col, col], glow: tone(col, bg, 0.65) }
  : { ...at(size), fill: col, shadow: '#1A0B06' });
export const marker = (size: number | Cell, col: string, seed = 0): Look => ({ ...at(size), fill: col, wobble: 1, seed });
export const print = (size: number | Cell, col: string, shadow?: string): Look => ({ ...at(size), fill: col, shadow });

/** Big gilt letters standing out of their sign, `depth` px deep (an ink edge round the lot, the red extrusion down
 *  and right, the face), where a line of the stock font at `size` had its baseline at y. */
export const extruded = (c: Ctx, s: string, x: number, y: number, size: number, depth: number, cell: Cell, red: [string, string], ink: string) => {
  const face: Look = { ...cell, fill: GILT, dither: true }, base = baseFor(y, size, face);
  for (let k = depth + 1; k >= 0; k--) signText(c, s, x + k, base + k, { ...cell, fill: ink, ink });
  for (let k = depth; k >= 1; k--) signText(c, s, x + k, base + k, { ...cell, fill: k > depth / 2 ? red[0] : red[1] });
  signText(c, s, x, base, face);
};
