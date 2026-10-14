// The hub's sign lettering: the park's alphabet (signLetters.ts, the same letterforms as every sign in the park), set
// the way a theme park's front plaza letters its signs. No stock type on the plaza.
//
//   gate      each land's name over its gate: chunky storybook capitals, the land's color ramped down them (lit at the
//             top, its shade at the foot, a dithered seam), inked round, a drop shadow
//   hillside  the big letters up on the hill (HAPPYWOOD): white panel letters, tall, shaded along their feet
//   enamel    the plaza's small signs (the exit, the banners, the staff's): crisp enamel, a drop shadow if given
//   print     stickers and decals: one color
//
// Each takes the stock size the line used to be (signLetters' cellFor), or a cell size.

import { type Look, cellFor, tone, rampDown } from '../signLetters';
export { signText, signAt, signW, signH, type Look } from '../signLetters';

type Cell = { sx: number; sy: number };
const at = (size: number | Cell): Cell => (typeof size === 'number' ? cellFor(size) : size);

export const gate = (size: number | Cell, col: string, board: string): Look => ({
  ...at(size), fill: rampDown(col, 0.35), dither: true, ink: tone(board, '#000000', 0.6), shadow: tone(board, '#000000', 0.45), drop: 2,
});
export const hillside = (size: number | Cell, col = '#FFFFFF', shade = '#A8A29E'): Look => ({
  ...at(size), fill: [col, col, tone(col, shade, 0.25), tone(col, shade, 0.5)], dither: true, lo: shade, gap: 2,
});
export const enamel = (size: number | Cell, col: string, shadow?: string): Look => ({ ...at(size), fill: rampDown(col, 0.3), dither: true, shadow });
export const print = (size: number | Cell, col: string, shadow?: string): Look => ({ ...at(size), fill: col, shadow });
