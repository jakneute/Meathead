// The intro's painting kit: what every part of the way in is painted with, so it all comes out of a piece. The look is
// peak SNES: every surface in a stepped ramp of its color (lit from the upper left, four or five shades, not two), the
// steps broken up with a checker dither just where they meet, an ink line round anything that stands out, flat banded
// gradients (never a smooth one), stepped glows. Still art (a building front, a parked car) is painted once into a
// stamp (see m1 render/stamp) and put down with one drawImage after that; anything that moves is drawn live over it.

import { GROUND_Y } from '../../../m1/constants';
import { mix, ramp } from '../../../m1/game/render/backdrops/core';
import { checker, bandedGradient, hazeBands, steppedGlow, pixelBlob, tilePattern, brickPattern, PIX } from '../../../m1/game/render/pixelArt';
import { stamp as stampOnce } from '../../../m1/game/render/stamp';

export { mix, ramp, checker, bandedGradient, hazeBands, steppedGlow, pixelBlob, tilePattern, brickPattern, PIX };

/** Has the pixel font loaded? (Until it has, anything with words on it is painted live, not stamped: a stamp painted in
 * the fallback font would keep it for good, half a sign in one font and half in the other.) */
let fontIn = false;
const fontReady = () => fontIn || (fontIn = typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"'));
/** A stamp (see m1 render/stamp), once the font's in. */
export const stamp: typeof stampOnce = (c, key, x, y, w, h, paint) => (fontReady() ? stampOnce(c, key, x, y, w, h, paint) : paint(c));

export type Ctx = CanvasRenderingContext2D;
export const INK = '#1A0B06';
export const RED = '#B91C1C', WHITE = '#F8FAFC', BLUE = '#1E3A8A';
/** Old Glory's own: the stripes' red, the canton's blue, each in steps. */
export const FLAG_RED = ['#5C0A0A', '#8E1414', '#B91C1C', '#D93A2E', '#F06A55'];
export const FLAG_WHITE = ['#8E8A84', '#B8B4AE', '#DAD7D2', '#F1EFEA', '#FFFFFF'];
export const FLAG_BLUE = ['#0B1236', '#14205C', '#1E3A8A', '#2D51B0', '#4570D0'];

/** A color k of the way to the ink (darker) or to white (lighter). Always a hex color. */
export const dark = (c: string, k = 0.28) => mix(c, INK, k);
export const lite = (c: string, k = 0.25) => mix(c, '#FFFFFF', k);
/** A five-step ramp round a color, darkest first: its shadow, its shade, itself, lit, its highlight. */
export const rampOf = (c: string): string[] => [dark(c, 0.55), dark(c, 0.3), c, lite(c, 0.22), lite(c, 0.45)];
/** Background stuff dimmed toward the sky, so nothing back there reads as somewhere to stand. */
export const dim = (hex: string) => mix(hex, '#3A4A78', 0.38);

/** Snaps to the art's pixel grid (2 px cells). */
export const snap = (v: number) => Math.floor(v / PIX) * PIX;
/** A deterministic 0..1 noise from a number (the same every frame). */
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

export const box = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
export const text = (c: Ctx, s: string, x: number, y: number, col: string, size = 8, align: CanvasTextAlign = 'center', shadow: string | null = INK) => {
  c.font = `${size}px "Press Start 2P"`; c.textAlign = align;
  if (shadow) { c.fillStyle = shadow; c.fillText(s, x + 1, y + 1); }
  c.fillStyle = col; c.fillText(s, x, y);
  c.textAlign = 'left';
};
export const star = (c: Ctx, x: number, y: number, r: number, col: string) => {
  c.fillStyle = col; c.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  c.closePath(); c.fill();
};
/** A star with a lit upper-left half and an ink edge (on a sign, a badge). */
export const shinyStar = (c: Ctx, x: number, y: number, r: number, col: string) => {
  star(c, x + 1, y + 1, r, INK);
  star(c, x, y, r, dark(col, 0.25));
  c.save(); c.beginPath(); c.rect(x - r, y - r, r * 1.05, r * 2); c.clip(); star(c, x, y, r, col); c.restore();
  box(c, x - r * 0.3, y - r * 0.45, Math.max(1, r * 0.25), Math.max(1, r * 0.25), lite(col, 0.6));
};

/**
 * A slab (a wall, a panel, a beam): its color, a lit strip along the top and down the left, shade along the bottom and
 * down the right, each step dithered into the next; an ink line round it (unless `ink` is false).
 */
export const slab = (c: Ctx, x: number, y: number, w: number, h: number, col: string, opts: { ink?: boolean; edge?: number; flat?: boolean } = {}) => {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  const e = opts.edge ?? Math.max(2, Math.min(6, Math.round(Math.min(w, h) * 0.08 / 2) * 2));
  const r = rampOf(col);
  box(c, x, y, w, h, col);
  if (!opts.flat && w > e * 3 && h > e * 3) {
    box(c, x, y, w, e, r[3]); box(c, x, y, e, h, r[3]);
    box(c, x, y + h - e, w, e, r[1]); box(c, x + w - e, y, e, h, r[1]);
    checker(c, x + e, y + e, w - e * 2, PIX, r[3]);
    checker(c, x + e, y + h - e - PIX, w - e * 2, PIX, r[1], 1);
    box(c, x, y, w, Math.min(PIX, e), r[4]);
  }
  if (opts.ink !== false) { c.strokeStyle = INK; c.lineWidth = 2; c.strokeRect(x + 1, y + 1, w - 2, h - 2); }
};

/** A vertical round form (a pole, a pipe, a column), stepped across: lit on the left, shadowed on the right. */
export const pole = (c: Ctx, x: number, y: number, w: number, h: number, col: string, ink = true) => {
  const r = rampOf(col), n = r.length;
  const order = [3, 4, 3, 2, 2, 1, 1, 0];
  for (let i = 0; i < order.length; i++) {
    const x0 = x + (w * i) / order.length, x1 = x + (w * (i + 1)) / order.length;
    box(c, x0, y, Math.max(1, x1 - x0 + 0.5), h, r[Math.min(n - 1, order[i])]);
  }
  if (ink && w >= 4) { box(c, x - 1, y, 1, h, INK); box(c, x + w, y, 1, h, INK); }
};

/** A ball (a lamp globe, a finial, a knob), stepped: shadow, body, lit, highlight. */
export const ball = (c: Ctx, x: number, y: number, r: number, col: string, ink = true) => {
  const rp = rampOf(col);
  if (ink) { c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + 1, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = rp[1]; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.fillStyle = rp[2]; c.beginPath(); c.arc(x - r * 0.15, y - r * 0.15, r * 0.78, 0, Math.PI * 2); c.fill();
  c.fillStyle = rp[3]; c.beginPath(); c.arc(x - r * 0.3, y - r * 0.3, r * 0.45, 0, Math.PI * 2); c.fill();
  box(c, x - r * 0.5, y - r * 0.55, Math.max(1, r * 0.3), Math.max(1, r * 0.3), rp[4]);
};

/** A flag on a pole, waving: stepped folds (lit where the cloth faces up, shadowed in the troughs), the stars, a gold finial. */
export const flag = (c: Ctx, x: number, top: number, f: number, w = 34, h = 22, foot = GROUND_Y) => {
  pole(c, x - 1, top, 3, foot - top, '#B8BCC4', false);
  ball(c, x + 0.5, top - 1, 3, '#E8B400');
  const cols = 2, rows = 13;
  const cw = cols, rh = h / rows;
  for (let k = 0; k < w; k += cw) {
    const ph = f * 0.12 + k * 0.25, wv = Math.sin(ph) * 2 * (k / w + 0.3);
    const slope = Math.cos(ph);
    // (the light on the cloth: 0 in the trough, 4 on the crest facing up)
    const lit = Math.max(0, Math.min(4, Math.round(2 + slope * 1.6)));
    for (let i = 0; i < rows; i++) {
      const inCanton = k < w * 0.42 && i < 7;
      const col = inCanton ? FLAG_BLUE[lit] : (i % 2 ? FLAG_WHITE[lit] : FLAG_RED[lit]);
      box(c, x + 2 + k, top + 2 + i * rh + wv, cw, rh + 1, col);
    }
  }
  // (the stars on the blue, as specks, riding the wave)
  for (let k = 2; k < w * 0.42 - 1; k += 4) for (let i = 0; i < 3; i++) {
    const wv = Math.sin(f * 0.12 + k * 0.25) * 2 * (k / w + 0.3);
    box(c, x + 2 + k + (i % 2) * 2, top + 3 + i * rh * 2.2 + wv, 1, 1, '#FFFFFF');
  }
  // (the hem on the fly end: a darker edge)
  const wvEnd = Math.sin(f * 0.12 + w * 0.25) * 2 * 1.3;
  box(c, x + 2 + w - 1, top + 2 + wvEnd, 1, h, 'rgba(26, 11, 6, 0.35)');
};

/** Bunting swagged between two points: red, white and blue fans, each lit along its top and shadowed under, on a cord. */
export const bunting = (c: Ctx, x0: number, x1: number, y: number, sag = 26) => {
  const n = Math.max(4, Math.round((x1 - x0) / 22));
  const at = (k: number) => y + Math.sin(k * Math.PI) * sag;
  for (let i = 0; i < n; i++) {
    const k0 = i / n, k1 = (i + 1) / n, xa = x0 + (x1 - x0) * k0, xb = x0 + (x1 - x0) * k1;
    const ya = at(k0), yb = at(k1), mx = (xa + xb) / 2, my = (ya + yb) / 2;
    const rp = [FLAG_RED, FLAG_WHITE, FLAG_BLUE][i % 3];
    const fan = (dy: number) => { c.beginPath(); c.moveTo(xa, ya); c.lineTo(xb, yb); c.quadraticCurveTo(mx, my + dy, xa, ya); };
    c.fillStyle = INK; fan(17); c.fill();
    c.fillStyle = rp[1]; fan(15); c.fill();
    c.fillStyle = rp[2]; fan(11); c.fill();
    c.fillStyle = rp[3]; fan(5); c.fill();
    // (a pleat or two down the fan)
    c.fillStyle = rp[1]; box(c, mx - 1, my + 3, 1, 8, rp[1]); box(c, mx - 6, my + 2, 1, 5, rp[1]); box(c, mx + 5, my + 2, 1, 5, rp[1]);
  }
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, y); c.quadraticCurveTo((x0 + x1) / 2, y + sag * 2, x1, y); c.stroke();
  c.strokeStyle = '#E5E7EB'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y - 1); c.quadraticCurveTo((x0 + x1) / 2, y + sag * 2 - 1, x1, y - 1); c.stroke();
};

/**
 * A sign board: an ink line, a beveled frame (lit top and left, shadowed bottom and right), the face banded (a lit
 * strip along its top, a shaded one along its bottom, dithered between), bolts at the corners, the words with a drop
 * shadow.
 */
export const sign = (c: Ctx, x: number, y: number, w: number, h: number, face: string, words: string, ink: string, size = 8, frame = INK) => {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  box(c, x - 4, y - 4, w + 8, h + 8, INK);
  const fr = frame === INK ? '#3A3F48' : frame, fp = rampOf(fr);
  box(c, x - 3, y - 3, w + 6, h + 6, fp[2]);
  box(c, x - 3, y - 3, w + 6, 1, fp[4]); box(c, x - 3, y - 3, 1, h + 6, fp[3]);
  box(c, x - 3, y + h + 2, w + 6, 1, fp[0]); box(c, x + w + 2, y - 3, 1, h + 6, fp[1]);
  const fc = rampOf(face);
  box(c, x, y, w, h, face);
  const band = Math.max(2, Math.round(h * 0.18 / 2) * 2);
  box(c, x, y, w, band, fc[3]); checker(c, x, y + band, w, PIX, fc[3]);
  box(c, x, y + h - band, w, band, fc[1]); checker(c, x, y + h - band - PIX, w, PIX, fc[1], 1);
  box(c, x, y, w, 1, fc[4]);
  if (h >= 14 && w >= 40) for (const [bx, by] of [[x + 3, y + 3], [x + w - 5, y + 3], [x + 3, y + h - 5], [x + w - 5, y + h - 5]]) { box(c, bx, by, 2, 2, fp[0]); box(c, bx, by, 1, 1, fp[4]); }
  const sh = mix(face, INK, 0.45);
  text(c, words, x + w / 2, y + h / 2 + size / 2 - 1, ink, size, 'center', sh);
};

/** A bald eagle, wings spread (a statue's, a sign's): feathers in steps, a white head, a gold beak, talons. */
export const eagle = (c: Ctx, x: number, y: number, s: number) => {
  c.save(); c.translate(x, y); c.scale(s, s);
  const BR = ['#24140A', '#3E2410', '#5C3A16', '#7A5224', '#9A6C36'];
  // (the wings: an ink edge, the dark underside, then rows of feathers getting lighter toward the top edge)
  const wing = (dir: number) => {
    c.fillStyle = INK; c.beginPath(); c.moveTo(0, -4); c.quadraticCurveTo(dir * 18, -30, dir * 38, -2); c.lineTo(dir * 30, 2); c.lineTo(dir * 33, 6); c.lineTo(dir * 24, 6); c.lineTo(dir * 26, 10); c.lineTo(dir * 14, 8); c.quadraticCurveTo(dir * 6, 6, 0, 6); c.fill();
    for (let i = 0; i < 4; i++) {
      c.fillStyle = BR[i + 1]; c.beginPath();
      const k = 1 - i * 0.2;
      c.moveTo(0, -3 + i * 2); c.quadraticCurveTo(dir * 17 * k, -27 * k + i * 2, dir * 35 * k, -1 + i); c.quadraticCurveTo(dir * 14, 2, 0, 4 - i); c.fill();
    }
    for (let i = 0; i < 5; i++) box(c, dir > 0 ? 10 + i * 5 : -14 - i * 5, -4 + i * 1.2, 1, 6, BR[0]);
  };
  wing(-1); wing(1);
  // (the body, the tail fanned under it, the talons)
  c.fillStyle = INK; c.beginPath(); c.ellipse(0, 2, 8, 11, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = BR[2]; c.beginPath(); c.ellipse(0, 2, 7, 10, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = BR[3]; c.beginPath(); c.ellipse(-2, 0, 4, 7, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#F1EFEA'; c.beginPath(); c.moveTo(-5, 10); c.lineTo(5, 10); c.lineTo(7, 18); c.lineTo(-7, 18); c.fill();
  box(c, -5, 16, 10, 2, '#B8B4AE');
  box(c, -5, 11, 3, 3, '#E8B400'); box(c, 2, 11, 3, 3, '#E8B400');
  // (the white head, lit, the gold hooked beak, the eye under a scowl)
  c.fillStyle = INK; c.beginPath(); c.arc(0, -10, 8, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#DAD7D2'; c.beginPath(); c.arc(0, -10, 7, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(-1.5, -11.5, 5, 0, Math.PI * 2); c.fill();
  c.fillStyle = INK; c.beginPath(); c.moveTo(4, -13); c.lineTo(13, -9); c.lineTo(10, -5); c.lineTo(4, -6); c.fill();
  c.fillStyle = '#E8B400'; c.beginPath(); c.moveTo(5, -12); c.lineTo(12, -9); c.lineTo(10, -6); c.lineTo(5, -7); c.fill();
  box(c, 6, -11, 3, 1, '#FCF0A0');
  box(c, 1, -12, 2, 2, INK); box(c, 0, -14, 4, 1, '#8E8A84');
  c.restore();
};
