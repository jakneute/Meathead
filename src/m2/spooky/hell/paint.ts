// Real hell's painting kit (on the intro's: the same ramps, dither and ink, so hell comes out of a piece with the rest
// of Meathead 2). Its materials in steps (basalt, lava, bone, iron), the lit lip that says "stand here", the lava's
// own banded surface, signs, and a few shapes everything down here is built from.

import { type Ctx, INK, box, checker, mix, rampOf, hash, PIX, dark, lite, stamp, text } from '../../intro/art/kit';
import { signText, signW, signH, brand } from '../letters';

export { type Ctx, INK, box, checker, mix, rampOf, hash, PIX, dark, lite, stamp, text };

// ---------------------------------------------------------------------------------------------------------------
// Palettes (darkest first)

/** Hell's rock: a red-brown basalt. */
export const BASALT = ['#0B0504', '#160907', '#22100B', '#311710', '#432116', '#582C1C', '#713A24', '#8E4C2E'];
/** Lava: the crust's dark red up through orange to the white-hot. */
export const LAVA = ['#3E0A04', '#6A1406', '#962308', '#C2390B', '#E85A12', '#F78A22', '#FCC04E', '#FFEFA6'];
/** Bone, old and dirty. */
export const BONE = ['#2E2620', '#5A4E42', '#887B6A', '#B5A891', '#DCD1BA'];
/** Iron (cages, chains). */
export const IRON = ['#0E0C10', '#1C1A20', '#2C2932', '#423E4A', '#5E5866'];
/** The lit lip along the top of anything to stand on (the lava's light catching the edge). */
export const LIP = ['#F4A262', '#C8703C', '#8C4626'];

/** A polygon, filled. */
export const poly = (c: Ctx, pts: [number, number][], col: string) => {
  c.fillStyle = col; c.beginPath();
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath(); c.fill();
};
/** A polygon with its ink line round it (`w` thick). */
export const inkPoly = (c: Ctx, pts: [number, number][], col: string, w = 2) => {
  poly(c, pts, col);
  c.strokeStyle = INK; c.lineWidth = w; c.lineJoin = 'miter';
  c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.stroke();
};
/** Snapped to the 2 px grid. */
export const sn = (v: number) => Math.round(v / PIX) * PIX;

/** The lit lip: what can be stood on gets it (a hot highlight, the lit band, a dither row into the rock). */
export const lip = (c: Ctx, x: number, y: number, w: number) => {
  box(c, x, y, w, 2, LIP[0]); box(c, x, y + 2, w, 2, LIP[1]);
  checker(c, x, y + 4, w, PIX, LIP[2]);
};

/**
 * A slab of basalt in steps over (x, y, w, h): its color, lit along the upper left, shaded down the right and the
 * bottom, dithered between; cracks across it; no lip (that's the caller's, where it's to be stood on).
 */
export const basalt = (c: Ctx, x: number, y: number, w: number, h: number, seed: number, base = 4, cracks = true) => {
  const r = BASALT;
  box(c, x, y, w, h, r[base]);
  // (columnar facets: hell's rock comes in columns, each lit on its left)
  const fw = 16 + Math.floor(hash(seed) * 3) * 4;
  for (let fx = x, i = 0; fx < x + w; fx += fw, i++) {
    const ww = Math.min(fw, x + w - fx), k = hash(seed + i * 3.7);
    box(c, fx, y, ww, h, r[base - (k < 0.3 ? 1 : 0)]);
    box(c, fx, y, 2, h, r[base + 1]);
    checker(c, fx + 2, y, 2, h, r[base + 1]);
    box(c, fx + ww - 2, y, 2, h, r[base - 2]);
    checker(c, fx + ww - 4, y, 2, h, r[base - 2], 1);
  }
  // (the bottom in shade, stepped)
  const s1 = Math.max(0, h * 0.55), s2 = Math.max(0, h * 0.8);
  box(c, x, y + s1, w, h - s1, mix(r[base - 1], r[base - 2], 0.3));
  checker(c, x, y + s1 - PIX, w, PIX, mix(r[base - 1], r[base - 2], 0.3));
  box(c, x, y + s2, w, h - s2, r[base - 2]);
  checker(c, x, y + s2 - PIX, w, PIX, r[base - 2], 1);
  if (!cracks) return;
  // (cracks across it: ink, lit on the lip below)
  const n = Math.max(1, Math.floor((w * h) / 2600));
  for (let i = 0; i < n; i++) {
    const cx = x + hash(seed + i * 5.3) * w, cy = y + 8 + hash(seed + i * 9.1) * Math.max(1, h - 16), len = 8 + hash(seed + i * 2.2) * 22;
    box(c, sn(cx), sn(cy), sn(len), 2, INK);
    box(c, sn(cx) + 2, sn(cy) + 2, Math.max(2, sn(len) - 4), 1, r[base + 1]);
  }
};

/** A sign down here: a scorched board on two charred posts, its words burnt in, inked. Painted once (a stamp). */
export const hellSign = (c: Ctx, x: number, feetY: number, words: string, board = '#4A1A10', ink = '#FCD58A', hung = false) => {
  // (hell's lettering: burned into the board, still hot)
  const L = brand(8, board, ink), w = Math.max(64, Math.ceil(signW(words, L)) + 24), h = 24, top = hung ? -h / 2 : -92;
  c.save(); c.translate(Math.round(x), Math.round(feetY));
  stamp(c, `hell-sign-${words}-${board}-${hung}`, -w / 2 - 4, top - (hung ? 24 : 4), w + 8, hung ? 54 : 100, g => {
    const r = rampOf(board), post = BASALT[3];
    // (hung: on two chains from above)
    if (hung) for (const px of [-w / 2 + 10, w / 2 - 12]) for (let y = top - 22; y < top; y += 4) { box(g, px - 1, y, 4, 3, INK); box(g, px, y, 2, 2, IRON[3 + ((y >> 2) & 1)]); }
    else for (const px of [-w / 2 + 8, w / 2 - 14]) {
      box(g, px - 1, top + h, 8, -top - h, INK);
      box(g, px, top + h, 6, -top - h, post); box(g, px, top + h, 2, -top - h, BASALT[5]);
      box(g, px - 2, -4, 10, 4, INK);
    }
    box(g, -w / 2 - 2, top - 2, w + 4, h + 4, INK);
    box(g, -w / 2, top, w, h, r[2]);
    box(g, -w / 2, top, w, 2, r[3]); box(g, -w / 2, top + h - 4, w, 4, r[1]);
    checker(g, -w / 2, top + 2, w, PIX, r[3]); checker(g, -w / 2, top + h - 6, w, PIX, r[1], 1);
    // (the grain, and a scorched corner)
    for (let i = 0; i < 3; i++) box(g, -w / 2 + 4 + hash(w + i) * (w - 30), top + 7 + i * 5, 20, 1, r[1]);
    box(g, w / 2 - 10, top, 10, 6, r[0]); checker(g, w / 2 - 16, top, 6, 6, r[0]);
    signText(g, words, 0, top + h / 2 + signH(L) / 2, L);
  });
  c.restore();
};

/** A stepped glow (rings, flat, faint: down here the light's dim and never a glare). */
export const dimGlow = (c: Ctx, x: number, y: number, rw: number, rh: number, col: string, a: number, rings = 3) => {
  for (let i = 0; i < rings; i++) {
    const k = 1 - i / rings;
    c.fillStyle = col; c.globalAlpha = a; c.beginPath(); c.ellipse(x, y, rw * k, rh * k, 0, 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
};

// ---------------------------------------------------------------------------------------------------------------
// Big round parts (the bosses: the demon, Satan)

export type Ramp = readonly string[];
/** Flashing pale when hit: the whole ramp pushed toward white. */
export const flashed = (r: Ramp, on: boolean): Ramp => (on ? r.map(c => mix(c, '#FFE4E0', 0.6)) : r);
export const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, rot = 0) => { c.beginPath(); c.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), rot, 0, Math.PI * 2); };
/**
 * A round part in steps (a gut, a head, a thigh): inked; its darkest at the lower right going up through its ramp to
 * the highlight at the upper left, each step dithered into the next; the lava's light along its underside (`rim`).
 */
export const blob = (c: Ctx, x: number, y: number, rx: number, ry: number, r: Ramp, rim = true, line = 2) => {
  ell(c, x, y, rx + line, ry + line); c.fillStyle = INK; c.fill();
  c.save(); ell(c, x, y, rx, ry); c.clip();
  const n = r.length;
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1), sx = x - rx * 0.42 * k, sy = y - ry * 0.46 * k, s = 1.08 - 0.84 * k;
    if (i) {
      // (the dither: this step's color in a checker just outside its edge)
      c.save(); c.beginPath(); c.ellipse(sx, sy, rx * s + 3, ry * s + 3, 0, 0, Math.PI * 2); c.ellipse(sx, sy, Math.max(0.5, rx * s), Math.max(0.5, ry * s), 0, 0, Math.PI * 2); c.clip('evenodd');
      checker(c, x - rx - 4, y - ry - 4, rx * 2 + 8, ry * 2 + 8, r[i], 0);
      c.restore();
    }
    ell(c, sx, sy, rx * s, ry * s); c.fillStyle = r[i]; c.fill();
  }
  if (rim) { ell(c, x + rx * 0.1, y + ry * 1.02, rx * 0.75, ry * 0.18); c.fillStyle = mix(r[1], '#F07A30', 0.45); c.fill(); }
  c.restore();
};
/** A thick limb in steps (an arm): inked, its color, lit along its upper side. */
export const thick = (c: Ctx, x1: number, y1: number, x2: number, y2: number, w: number, r: Ramp) => {
  c.lineCap = 'round';
  const L = Math.hypot(x2 - x1, y2 - y1) || 1, nx = -(y2 - y1) / L, ny = (x2 - x1) / L, up = ny > 0 ? -1 : 1;
  for (const [col, ww, o] of [[INK, w + 4, 0], [r[1], w, 0], [r[2], w * 0.62, -0.16], [r[3], w * 0.24, -0.32]] as [string, number, number][]) {
    c.strokeStyle = col; c.lineWidth = ww; c.beginPath();
    c.moveTo(x1 + nx * w * o * up, y1 + ny * w * o * up); c.lineTo(x2 + nx * w * o * up, y2 + ny * w * o * up); c.stroke();
  }
  c.lineCap = 'butt';
};
export const path = (c: Ctx, p: [number, number][]) => { c.beginPath(); p.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); };
/** A shape filled and inked (round joins). */
export const inked = (c: Ctx, p: [number, number][], col: string, line = 2) => { path(c, p); c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = line; c.lineJoin = 'round'; c.stroke(); };

void lite; void dark;
