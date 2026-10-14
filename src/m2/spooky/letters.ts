// Spooky Land's sign lettering: the park's alphabet (signLetters.ts, the same letterforms as every sign in the park),
// set the ways a haunted town, Dracula's other castle, its dungeon, the clock tower and hell itself make their signs.
// No stock type on any sign in the land.
//
//   haunt     the town's painted boards: serifed capitals (tall where there's room), a ramp down them, a shade under
//   gothic    the castle's plaques: tall, serifed, inked, bone ramped down to shadow
//   blood     dripping: inked, red ramped dark at the foot, runs off the feet with a bead at the end
//   tomb      cut into stone: the cut dark, its lower lip lit, chipped, moss in the feet
//   iron      wrought iron letters: serifed, gunmetal ramped, inked, lit along the top, rusting
//   candle    gilt by candlelight: gold ramped, serifed, a warm stepped bloom round it (or just a shadow, drawn live)
//   brand     hell's boards: burned in, the letters still hot (white-gold down to ember red), charred round
//   enamel    a plain enamel plate (the staff's signs): crisp, top-lit, a drop shadow if given
//   stencil   backstage: sprayed on (the bridges cut where the letters are big enough)
//   led       readouts: lit dots, a little bloom round them
//   print     printed (a poster, a label, a sticker): one color, an optional drop shadow
//
// Each takes the stock size the line used to be (signLetters' cellFor: how big a cell to set it in), or a cell size.

import { type Look, cellFor, tone, rampDown } from '../signLetters';
export { signText, signAt, signW, signH, baseFor, fit, type Look } from '../signLetters';

type Cell = { sx: number; sy: number };
const at = (size: number | Cell): Cell => (typeof size === 'number' ? cellFor(size) : size);
/** Tall where a line was big enough to take it (a cell twice as tall as it's wide). */
const tall = (size: number | Cell): Cell => (typeof size === 'number' ? (size >= 12 ? { sx: 2, sy: 3 } : size >= 8 ? { sx: 1, sy: 2 } : { sx: 1, sy: 1 }) : size);

export const haunt = (size: number | Cell, ink: string, board?: string): Look => {
  const c = tall(size), big = typeof size === 'number' ? size >= 7 : c.sx > 1 || c.sy > 1;
  return { ...c, fill: rampDown(ink, 0.3), dither: true, serif: big, gap: big ? 2 : 1, shadow: board ? tone(board, '#000000', 0.55) : undefined };
};
export const gothic = (size: number | Cell, ink = '#F1EFEA', shade = '#1A0B06'): Look => ({
  ...tall(size), fill: [tone(ink, '#FFFFFF', 0.35), ink, ink, tone(ink, '#000000', 0.25), tone(ink, '#000000', 0.45)], dither: true, serif: true, gap: 2, ink: shade,
});
export const blood = (size: number | Cell, col = '#DC2626', ink = '#1A0505', seed = 0): Look => ({
  ...at(size), fill: [tone(col, '#FFFFFF', 0.3), col, col, tone(col, '#000000', 0.3)], dither: true, ink, seed,
  drip: { col: tone(col, '#000000', 0.2), tip: tone(col, '#FFFFFF', 0.35), rate: 0.4, len: Math.max(4, at(size).sy * 5) },
});
export const tomb = (size: number | Cell, cut = '#1C1917', lip = '#A8A29E', moss = '#3F6212', seed = 0): Look => ({
  ...at(size), fill: [tone(cut, '#000000', 0.4), cut, cut, tone(cut, lip, 0.15)], dither: true, lip, worn: 0.14, wornCol: tone(cut, lip, 0.55), moss, seed,
});
export const iron = (size: number | Cell, seed = 0): Look => ({
  ...tall(size), fill: ['#B8BCC4', '#8A9098', '#6B7280', '#4B5563', '#374151'], dither: true, ink: '#0A0A0C', serif: true, gap: 2, hi: '#E5E7EB', worn: 0.16, wornCol: '#9A4A1A', seed,
});
export const candle = (size: number | Cell, board: string, col = '#FDE68A', bloom = true): Look => ({
  ...tall(size), fill: [tone(col, '#FFFFFF', 0.6), tone(col, '#FFFFFF', 0.25), col, tone(col, '#B45309', 0.45), tone(col, '#7C2D12', 0.6)], dither: true, serif: true, gap: 2,
  glow: bloom ? tone(col, board, 0.78) : undefined, shadow: bloom ? undefined : tone(board, '#000000', 0.5),
});
export const enamel = (size: number | Cell, col: string, shadow?: string): Look => ({ ...at(size), fill: rampDown(col, 0.3), dither: true, shadow });
export const stencil = (size: number | Cell, col: string, board?: string, seed = 0): Look => ({ ...at(size), fill: col, stencil: at(size).sx > 1, worn: board ? 0.18 : 0, wornCol: board, seed });
export const led = (size: number | Cell, col: string, bg = '#0A0A0A'): Look => ({ ...at(size), fill: [tone(col, '#FFFFFF', 0.35), col, col, col], glow: tone(col, bg, 0.72) });
export const print = (size: number | Cell, col: string, shadow?: string): Look => ({ ...at(size), fill: col, shadow });
export const brand = (size: number | Cell, board: string, col = '#FCD58A'): Look => ({
  ...tall(size), fill: [tone(col, '#FFFFFF', 0.55), col, tone(col, '#F97316', 0.45), tone(col, '#B91C1C', 0.55)], dither: true, glow: tone('#7C2D12', board, 0.35), lo: '#1A0505',
});
