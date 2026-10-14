// Futureland's sign lettering: hand-built pixel letterforms (a 5x7 alphabet), set in the park's styles, so its signs
// aren't the stock font. Painted once into the stamps their boards go in (board(..., font)).
//
//   chrome   space-age capitals: tall, slanted forward, each letter banded like polished chrome (sky over a horizon line
//            over warm ground), inked round.                                                      (`chrome2`: twice the size)
//   neon     tubes: a soft halo round each stroke, the tube, a hot core (brighter after dark); slanted like script.
//   enamel   sign-writer's lettering: bold strokes, top-lit, a shade line round them and a drop shadow.
//   marquee  bulbs: every dot of the letter a bulb in its socket (lit after dark).
//   small    the jokes' boards: the plain 5x7 painted on, a drop shadow.
//   stencil  the work crews' spray paint: bold, each letter broken by a stencil's bridges, a dusting of overspray.

import { box, mix } from '../../intro/art/kit';
import { timeOfDay } from '../../timeOfDay';

type Ctx = CanvasRenderingContext2D;
export type Letter = 'chrome' | 'chrome2' | 'neon' | 'neon2' | 'enamel' | 'enamel2' | 'marquee' | 'small' | 'stencil';

const INK = '#140C1E';
const G: Record<string, string> = {
  A: '01110100011000111111100011000110001', B: '11110100011000111110100011000111110', C: '01110100011000010000100001000101110',
  D: '11110100011000110001100011000111110', E: '11111100001000011110100001000011111', F: '11111100001000011110100001000010000',
  G: '01110100011000010111100011000101111', H: '10001100011000111111100011000110001', I: '01110001000010000100001000010001110',
  J: '00111000100001000010000101001001100', K: '10001100101010011000101001001010001', L: '10000100001000010000100001000011111',
  M: '10001110111010110101100011000110001', N: '10001100011100110101100111000110001', O: '01110100011000110001100011000101110',
  P: '11110100011000111110100001000010000', Q: '01110100011000110001101011001001101', R: '11110100011000111110101001001010001',
  S: '01111100001000001110000010000111110', T: '11111001000010000100001000010000100', U: '10001100011000110001100011000101110',
  V: '10001100011000110001100010101000100', W: '10001100011000110101101011010101010', X: '10001100010101000100010101000110001',
  Y: '10001100010101000100001000010000100', Z: '11111000010001000100010001000011111',
  '0': '01110100011001110101110011000101110', '1': '00100011000010000100001000010001110', '2': '01110100010000100010001000100011111',
  '3': '11111000100010000010000011000101110', '4': '00010001100101010010111110001000010', '5': '11111100001111000001000011000101110',
  '6': '00110010001000011110100011000101110', '7': '11111000010001000100010000100001000', '8': '01110100011000101110100011000101110',
  '9': '01110100011000101111000010001001100',
  '.': '00000000000000000000000000110001100', ',': '00000000000000000000011000010001000', '!': '00100001000010000100001000000000100',
  '?': '01110100010000100010001000000000100', ':': '00000011000110000000011000110000000', "'": '00100001000100000000000000000000000',
  '(': '00010001000100001000010000010000010', ')': '01000001000001000010000100010001000', '-': '00000000000000011111000000000000000',
  '$': '00100011111010001110001011111000100', '%': '11000110010001000100010001001100011', '&': '01100100101010001000101011001001101',
  '/': '00001000100001000100010000100010000', ' ': '00000000000000000000000000000000000',
  '>': '10000010000010000010001000100010000', '<': '00001000100010001000001000001000001',
};
/** A glyph's lit dots (col, row), trimmed to its inked columns (a space: 3 wide). */
const glyph = (ch: string) => {
  const g = G[ch] ?? G['?'];
  const on: [number, number][] = [];
  for (let i = 0; i < 35; i++) if (g[i] === '1') on.push([i % 5, Math.floor(i / 5)]);
  if (ch === ' ') return { on, c0: 0, w: 3 };
  const cs = on.map(([c]) => c), c0 = Math.min(...cs), c1 = Math.max(...cs);
  const full = /[A-Z0-9$%&?]/.test(ch);
  return { on, c0: full ? 0 : c0, w: full ? 5 : c1 - c0 + 1 };
};

/** (a glyph's row is a bar across its middle: inked either side of the middle column too) */
const bar = (ch: string, r: number) => { const g = G[ch] ?? G['?']; return g[r * 5 + 1] === '1' && g[r * 5 + 2] === '1' && g[r * 5 + 3] === '1'; };

interface Spec { sx: number; sy: number; gap: number; pad: number; slant: number; bold: number }
const SPEC: Record<Letter, Spec> = {
  chrome: { sx: 1, sy: 2, gap: 2, pad: 2, slant: 4, bold: 1 },
  chrome2: { sx: 2, sy: 2, gap: 2, pad: 2, slant: 3, bold: 0 },
  neon: { sx: 1, sy: 2, gap: 2, pad: 3, slant: 4, bold: 1 },
  neon2: { sx: 2, sy: 2, gap: 3, pad: 3, slant: 3, bold: 0 },
  enamel: { sx: 1, sy: 2, gap: 2, pad: 2, slant: 0, bold: 1 },
  enamel2: { sx: 2, sy: 2, gap: 2, pad: 2, slant: 0, bold: 1 },
  marquee: { sx: 3, sy: 3, gap: 3, pad: 1, slant: 0, bold: 0 },
  small: { sx: 1, sy: 1, gap: 1, pad: 1, slant: 0, bold: 0 },
  stencil: { sx: 1, sy: 2, gap: 2, pad: 2, slant: 0, bold: 1 },
};
const advance = (ch: string, s: Spec) => { const g = glyph(ch); return (g.w + s.bold) * s.sx + s.gap; };

/** The words' size in a style ([w, h], one line), the halo/outline round them counted. */
export const letterSize = (text: string, f: Letter): [number, number] => {
  const s = SPEC[f];
  let w = 0;
  for (const ch of text) w += advance(ch, s);
  w -= s.gap;
  const slantW = s.slant ? Math.ceil(7 / s.slant) : 0;
  return [w + s.pad * 2 + slantW, 7 * s.sy + s.pad * 2];
};

/**
 * The words in a style, their middle at (x, y). `ink`: the letters' color (the neon's tube, the enamel's paint, the
 * small one's paint; chrome is chrome, the marquee's bulbs are bulbs). `bg`: the board's color (for shadows).
 * `lamps`: the neon and the bulbs on or off (left out: on after dark, by the time of day).
 */
export const lettering = (g: Ctx, text: string, x: number, y: number, f: Letter, ink: string, bg: string, lamps?: boolean) => {
  const s = SPEC[f], [w, h] = letterSize(text, f), on = lamps ?? timeOfDay().lamps > 0.35;
  const x0 = Math.round(x - w / 2) + s.pad, y0 = Math.round(y - h / 2) + s.pad;
  // every lit dot, in screen pixels (with the slant and the bold)
  const dots: [number, number, number][] = [];
  let cx = x0;
  for (const ch of text) {
    const gl = glyph(ch);
    for (const [c, r] of gl.on) {
      // (the stencil's bridges: the middle of each top, middle and bottom bar left out (bars only, never a stem))
      const gap = f === 'stencil' && (r === 0 || r === 3 || r === 6) && bar(ch, r);
      const sh = s.slant ? Math.floor((6 - r) / s.slant) : 0;
      for (let b = 0; b <= s.bold; b++) if (!(gap && c + b === 2)) dots.push([cx + (c - gl.c0 + b) * s.sx + sh, y0 + r * s.sy, r]);
    }
    cx += advance(ch, s);
  }
  const each = (o: number, col: string | ((r: number, i: number) => string), dx = 0, dy = 0, ww = s.sx, hh = s.sy) =>
    dots.forEach(([px, py, r], i) => box(g, px - o + dx, py - o + dy, ww + o * 2, hh + o * 2, typeof col === 'string' ? col : col(r, i)));
  if (f === 'chrome' || f === 'chrome2') {
    // sky over a horizon over warm ground, banded down the letter; inked round, a white glint up top
    const band = ['#FFFFFF', '#DCEBFF', '#9EC4F0', '#3A4A6A', '#B8885A', '#E2BC88', '#FFF0D0'];
    each(1, INK, 1, 1); each(1, INK);
    each(0, r => band[r]);
    dots.forEach(([px, py, r]) => { if (r === 3) box(g, px, py + s.sy - 1, s.sx, 1, '#7A8AA8'); });
    dots.forEach(([px, py, r], i) => { if (r === 0 && i % 3 === 0) box(g, px, py, 1, 1, '#FFFFFF'); });
  } else if (f === 'neon' || f === 'neon2') {
    // the halo, the tube (its glass dark at the edges), the hot core
    const halo = mix(ink, bg, on ? 0.45 : 0.7), tube = on ? ink : mix(ink, '#FFFFFF', 0.15), core = on ? mix(ink, '#FFFFFF', 0.75) : mix(ink, '#FFFFFF', 0.35);
    each(2, mix(halo, bg, 0.5)); each(1, halo);
    each(0, tube);
    dots.forEach(([px, py]) => box(g, px, py, 1, 1, core));
  } else if (f === 'enamel' || f === 'enamel2') {
    // the drop shadow, the shade line round, the paint (lit along each letter's top rows)
    const shade = mix(bg, INK, 0.55);
    each(0, shade, 1, 2); each(1, mix(ink, INK, 0.45));
    each(0, r => (r < 2 ? mix(ink, '#FFFFFF', 0.35) : r > 4 ? mix(ink, INK, 0.18) : ink));
  } else if (f === 'marquee') {
    // a socket and a bulb at each dot
    each(0, INK, 0, 0, 3, 3);
    dots.forEach(([px, py], i) => { box(g, px, py, 2, 2, on ? '#FFE070' : (i % 5 ? '#D8B050' : '#F0D070')); box(g, px, py, 1, 1, on ? '#FFFFFF' : '#FFF0B0'); });
  } else if (f === 'stencil') {
    // (the overspray: a dusting of the paint round each stroke, every other dot; the paint, its edges dry and patchy)
    dots.forEach(([px, py], i) => { if (i % 2 === 0) box(g, px - 1 + (i % 3), py - 1, 1, 1, mix(ink, bg, 0.55)); if (i % 3 === 0) box(g, px + 1, py + s.sy, 1, 1, mix(ink, bg, 0.6)); });
    each(0, ink);
    dots.forEach(([px, py], i) => { if (i % 4 === 1) box(g, px, py + 1, 1, 1, mix(ink, bg, 0.35)); });
  } else {
    each(0, mix(bg, INK, 0.45), 1, 1);
    each(0, ink);
  }
};
