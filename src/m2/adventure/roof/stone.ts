// The Temple of the Jaguar's stonework, as the roof and the clearing both show it (and the dino park's back of it:
// the same sandy stone). It's a theme-park temple: carved stone from the front, and look closer and it's fiberglass
// panels bolted together (the seams, the bolt heads, a stenciled panel number, a patch). Painted the SNES way: every
// block in a stepped ramp (lit along its top and left, shadowed along its bottom and right), dark mortar, moss dithered
// into the joints low down, the odd chip and crack, carved glyph blocks here and there.

import { INK, box, checker, mix, hash, stamp } from '../../intro/art/kit';
import { type Look, signAt, carved, routed } from '../letters';

/** A color's lightness, roughly (0..255). */
const lum = (hex: string) => { const n = parseInt(hex.slice(1, 7), 16); return ((n >> 16) & 255) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11; };

type Ctx = CanvasRenderingContext2D;

/** The stone, darkest first (the dino agent's temple back: #9C8B66 is its face). */
export const STONE = ['#2E2618', '#4A3E2A', '#6A5A3E', '#857452', '#9C8B66', '#B8A67E', '#D4C49C'];
export const MOSS = ['#1E3412', '#2E4E1C', '#436E28', '#5E8E34'];
/** The temple's inside (backstage, under the shell): plywood, framing, the shell's own edge, the dark. */
export const PLY = ['#4A3218', '#6E4A24', '#8E6434', '#B08048'];
export const SHELL = '#E8DCC0', FOAM = '#F2B8C6', DARK = '#0E0A06';
export const COURSE = 28;

const r1 = (a: number, b: number) => hash(a * 13.7 + b * 71.3);

/**
 * A wall of stone blocks in courses, filling (x, y, w, h), its courses counted from `y` (so tiers line up). `seed`
 * varies the blocks. `seams`: the fiberglass panel seams every so many px (0 for none). `moss`: how much moss low down.
 */
export const stoneWall = (g: Ctx, x: number, y: number, w: number, h: number, seed: number, opts: { seams?: number; moss?: number; glyphs?: boolean; base?: number } = {}) => {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  const b0 = opts.base ?? 4;
  box(g, x, y, w, h, STONE[1]);
  const rows = Math.ceil(h / COURSE);
  for (let r = 0; r < rows; r++) {
    const cy = y + r * COURSE, ch = Math.min(COURSE, y + h - cy);
    let bx = x - Math.floor(r1(seed, r) * 40);
    let n = 0;
    while (bx < x + w) {
      const bw = 40 + Math.floor(r1(seed + n, r * 3.1) * 4) * 10;
      const L = Math.max(x, bx), R = Math.min(x + w, bx + bw);
      if (R - L > 2) {
        const v = r1(seed * 2 + n, r);
        const face = STONE[b0 + (v < 0.2 ? -1 : v > 0.85 ? 1 : 0)];
        const lit = mix(face, STONE[6], 0.22), sh = mix(face, STONE[0], 0.28), mortar = mix(STONE[0], STONE[1], 0.6);
        // (the block: mortar round it, its face, lit top and left, shadowed bottom and right, dithered between)
        box(g, L, cy, R - L, ch, mortar);
        box(g, L + 1, cy + 1, R - L - 2, ch - 2, face);
        box(g, L + 1, cy + 1, R - L - 2, 2, lit); box(g, L + 1, cy + 1, 2, ch - 2, lit);
        checker(g, L + 3, cy + 3, R - L - 6, 2, lit);
        box(g, L + 1, cy + ch - 3, R - L - 2, 2, sh); box(g, R - 3, cy + 1, 2, ch - 2, sh);
        checker(g, L + 3, cy + ch - 5, R - L - 6, 2, sh, 1);
        // (wear: a chip off a corner, a hairline crack, pitting)
        if (v > 0.6 && v < 0.7) box(g, R - 8, cy + 1, 6, 4, STONE[1]);
        if (v > 0.32 && v < 0.38) { g.fillStyle = STONE[0]; for (let k = 0; k < 6; k++) g.fillRect(L + 8 + k * 3, cy + 6 + ((k * 5) % 7) + k, 2, 2); }
        if (v > 0.45 && v < 0.5) for (let k = 0; k < 5; k++) box(g, L + 6 + ((k * 11) % (R - L - 10)), cy + 7 + ((k * 7) % 12), 2, 2, sh);
        // (a carved glyph block: a jaguar's face, stepped, cut in)
        if (opts.glyphs && v > 0.965 && R - L >= 40 && ch >= COURSE) glyph(g, Math.round((L + R) / 2), cy + 14, face);
      }
      bx += bw; n++;
    }
  }
  // Moss, in the joints along the bottom, dithered up into the stone
  const m = opts.moss ?? 0;
  if (m > 0) {
    const mh = Math.round(h * m);
    for (let k = 0; k < w; k += 6) {
      const hh = Math.round(mh * (0.4 + 0.6 * r1(seed + k, 9)));
      box(g, x + k, y + h - hh, 6, hh, MOSS[1]);
      checker(g, x + k, y + h - hh - 4, 6, 4, MOSS[2]);
      if (r1(k, seed) > 0.7) box(g, x + k + 2, y + h - hh - 2, 2, 2, MOSS[3]);
    }
  }
  // The fiberglass panels' seams: a dark line down, a lit one beside it, bolt heads
  const s = opts.seams ?? 0;
  if (s > 0) for (let sx = x + s - (Math.round(seed * 37) % s); sx < x + w - 4; sx += s) {
    box(g, sx, y, 1, h, STONE[0]); box(g, sx + 1, y, 1, h, STONE[5]);
    for (let by = y + 10; by < y + h - 4; by += 34) { box(g, sx - 3, by, 2, 2, STONE[0]); box(g, sx + 3, by, 2, 2, STONE[0]); box(g, sx - 3, by, 1, 1, STONE[6]); box(g, sx + 3, by, 1, 1, STONE[6]); }
  }
};

/** A jaguar's face, carved into a block (stepped: the cut lines dark, their lower lips lit). */
export const glyph = (g: Ctx, cx: number, cy: number, face: string) => {
  const d = mix(face, STONE[0], 0.55), l = mix(face, STONE[6], 0.45);
  const cut = (x: number, y: number, w: number, h: number) => { box(g, cx + x, cy + y, w, h, d); box(g, cx + x, cy + y + h, w, 1, l); };
  cut(-12, -9, 24, 2); cut(-12, -9, 2, 16); cut(10, -9, 2, 16); cut(-12, 6, 24, 2);
  cut(-7, -4, 4, 3); cut(3, -4, 4, 3);   // the eyes
  cut(-2, 0, 4, 2);                      // the nose
  cut(-6, 3, 12, 1);                     // the mouth
  for (const k of [-5, -1, 3]) box(g, cx + k, cy + 4, 2, 2, l); // the fangs
  cut(-15, -12, 4, 4); cut(11, -12, 4, 4); // the ears
};

/** A vine down a wall: a stepped wiggle of stem with leaves off it, from (x, y) down `len`. */
export const vineDown = (g: Ctx, x: number, y: number, len: number, seed: number) => {
  for (let k = 0; k < len; k += 4) {
    const wx = Math.round(x + Math.sin(k * 0.06 + seed) * 4);
    box(g, wx, y + k, 2, 4, MOSS[0]);
    if (Math.floor(k / 4 + seed) % 3 === 0) { const s = Math.floor(k / 4) % 2 ? 1 : -1; box(g, wx + (s > 0 ? 2 : -5), y + k, 5, 3, MOSS[2]); box(g, wx + (s > 0 ? 3 : -4), y + k, 3, 1, MOSS[3]); }
  }
};

/** A sign on a post or bolted to something: a board with a frame and words (diegetic: it's on something). */
export const plaque = (g: Ctx, cx: number, cy: number, w: number, h: number, face: string, words: string[], ink: string, size = 6, look?: Look) => {
  stamp(g, `plq:${face}:${words.join('|')}:${w}x${h}:${size}`, cx - w / 2 - 4, cy - h / 2 - 4, w + 8, h + 8, s => {
    const x = Math.round(cx - w / 2), y = Math.round(cy - h / 2);
    box(s, x - 3, y - 3, w + 6, h + 6, INK);
    box(s, x - 2, y - 2, w + 4, h + 4, mix(face, INK, 0.5));
    box(s, x, y, w, h, face);
    box(s, x, y, w, 2, mix(face, '#FFFFFF', 0.3)); box(s, x, y + h - 2, w, 2, mix(face, INK, 0.3));
    checker(s, x, y + 2, w, 2, mix(face, '#FFFFFF', 0.3));
    const lh = size + 4, top = cy - ((words.length - 1) * lh) / 2 + size / 2 - 1;
    // (the words: given a look, or cut in (dark words on a light board) or routed and filled (light on a dark one))
    const L = look ?? (lum(ink) < lum(face) ? carved(size, ink, mix(face, '#FFFFFF', 0.45), words.length) : routed(size, ink, mix(face, INK, 0.5)));
    words.forEach((t, i) => signAt(s, t, cx, top + i * lh, size, L));
  });
};
