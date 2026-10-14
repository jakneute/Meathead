// Adventure Land's sign lettering: the park's alphabet (signLetters.ts, the same letterforms as every sign in the
// park), set the ways a jungle, a safari outfit, a dinosaur park and a temple ride make their signs. No stock type on
// any sign in the land.
//
//   carved    cut into a plank with a knife: each cut dark (darkest under its top edge), its lower lip catching the
//             light, the hand a little off the line
//   routed    the park's brown scenic signs: routed letters, cream in the cut, its shadow over the top edge
//   plank     painted on a plank by hand: a ramp down the letters, a wobble, the paint chipped
//   enamel    a safety plate: crisp, top-lit, a shade along the foot (no wobble: a factory made it)
//   stone     chiseled into stone: the cut dark, its lip lit, chipped, moss in the feet
//   rope      letters laid in rope: the twist in the strands, inked (big only)
//   bamboo    letters lashed up out of cane: green, banded down, a node across every stroke (big only)
//   stencil   crates and backstage: sprayed on, worn (the stencil's bridges cut where the letters are big enough)
//   dino      the dinosaur park's logo type: fat, inked, a ramp from bone to amber with a dithered seam, a drop shadow
//   led       readouts and departure boards: lit dots with a little bloom round them
//   graffiti  spray can: leaning, a hand's wobble, the paint run down off the feet
//   gilt      the temple ride's own lettering: gold leaf, ramped and dithered, chipped, a drop shadow
//   print     printed small (a decal, a label, a plaque's fine print): one color, an optional drop shadow
//
// Each takes the stock size the line used to be (signLetters' cellFor: how big a cell to set it in), or an explicit
// cell size.

import { type Look, cellFor, tone, rampDown } from '../signLetters';
export { signText, signAt, signW, signH, baseFor, type Look } from '../signLetters';

type Cell = { sx: number; sy: number };
const at = (size: number | Cell): Cell => (typeof size === 'number' ? cellFor(size) : size);

export const carved = (size: number | Cell, cut = '#2A1A0C', lip = '#E8C890', seed = 0): Look => ({
  ...at(size), fill: [tone(cut, '#000000', 0.45), cut, cut, tone(cut, lip, 0.12)], dither: true, lip, wobble: 1, seed,
});
export const routed = (size: number | Cell, cream = '#F2E6C4', cut = '#2E1A0C'): Look => ({
  ...at(size), fill: [tone(cream, '#FFFFFF', 0.25), cream, cream, tone(cream, cut, 0.2)], shadow: cut, drop: -1,
});
export const plank = (size: number | Cell, col: string, board?: string, shadow?: string, seed = 0): Look => ({
  ...at(size), fill: rampDown(col, 0.25), dither: true, wobble: 1, seed, shadow, worn: board ? 0.12 : 0, wornCol: board,
});
export const enamel = (size: number | Cell, col: string, shadow?: string): Look => ({
  ...at(size), fill: rampDown(col, 0.3), dither: true, shadow,
});
export const stone = (size: number | Cell, cut = '#2A2620', lip = '#D8D0BC', moss?: string, seed = 0): Look => ({
  ...at(size), fill: [tone(cut, '#000000', 0.4), cut, cut, tone(cut, lip, 0.15)], dither: true, lip, worn: 0.14, wornCol: tone(cut, lip, 0.55), moss, seed,
});
export const rope = (size: number | Cell = { sx: 2, sy: 2 }): Look => ({
  ...at(size), fill: ['#E6CC8E', '#D2B072', '#C09A5A', '#A27E44'], dither: true, ink: '#3A2410', twist: ['#F6E2B0', '#7A5A30'], gap: 1,
});
export const bamboo = (size: number | Cell = { sx: 2, sy: 2 }): Look => ({
  ...at(size), fill: ['#D8E890', '#B4CC5C', '#8EAE3C', '#6A8A28'], dither: true, ink: '#24320C', nodes: { rows: [2, 5], dark: '#4A6018', lit: '#E8F0B0' },
});
export const stencil = (size: number | Cell, col: string, board?: string, seed = 0): Look => ({
  ...at(size), fill: col, stencil: at(size).sx > 1, worn: board ? 0.18 : 0, wornCol: board, seed,
});
export const dino = (size: number | Cell, ramp: string[] = ['#FFF2B0', '#FFD23A', '#F2A41E', '#C8641A'], ink = '#2A1406', shadow = '#140A04'): Look => ({
  ...at(size), fill: ramp, dither: true, ink, shadow, drop: 2,
});
export const led = (size: number | Cell, col: string, bg = '#0A0A0A'): Look => ({
  ...at(size), fill: [tone(col, '#FFFFFF', 0.35), col, col, col], glow: tone(col, bg, 0.72),
});
export const print = (size: number | Cell, col: string, shadow?: string): Look => ({ ...at(size), fill: col, shadow });
export const graffiti = (size: number | Cell, col: string, seed = 0): Look => ({
  ...at(size), fill: rampDown(col, 0.2), slant: 0.5, wobble: 2, seed, drip: { col: tone(col, '#000000', 0.15), rate: 0.35, len: 6 },
});
export const gilt = (size: number | Cell, shadow = '#2A0A04', seed = 0): Look => ({
  ...at(size), fill: ['#FFF4C0', '#F8D468', '#F2C14E', '#D89A2A', '#A86A1A'], dither: true, shadow, worn: 0.1, wornCol: '#8A5A1A', seed,
});
