// The havoc's painting kit (the final pass: peak SNES, on the boulevard's kit and the ride's so the land's of a piece):
// where things stand going back (the one eye's depths), the havoc's own materials in stepped ramps, darkest first (snow
// and ice, the hill's rock, lava from crust to white-hot, basalt once it's crusted, ash), and the live pieces every part
// of it burns with: stepped flames (ember, orange, yellow, a white core, each a stack of rows), smoke in stepped puffs,
// a lit lip for whatever he stands on. A sprite cache for art that has to be warped live (a front tipping over toward
// us, drawn a band of rows at a time).

import { GY } from '../geometry';
import {
  type Ctx, type View, INK, box, checker, mix, hash, poly, at, atDepth, stamp, timeOfDay, skyAt, hourMix, farTint, signText, signW,
  FRONT_D, BACK_D, PLY, SAND, BRASS, STEEL, STEVE, CONCRETE, ASPHALT, IRON, LIP, ramp6, hour, dimmed, rampH, glassOf, lit, slab, post,
  ball, board, deco, bulbs, paint, plain, sideBack, topBack, underBack, seen, still, stillAt, viewOf,
} from '../blvd/kit';
import { FIRE, CHAR, ICE, WATER, SHELL, TRUSS, BLACKS, levelQ, sideQ, fromDepth, lip, tubeH, tubeV, truss, chain } from '../disaster/paint';

export type { Ctx, View };
export {
  INK, box, checker, mix, hash, poly, at, atDepth, stamp, timeOfDay, skyAt, hourMix, farTint, signText, signW, FRONT_D, BACK_D, PLY,
  SAND, BRASS, STEEL, STEVE, CONCRETE, ASPHALT, IRON, LIP, ramp6, hour, dimmed, rampH, glassOf, lit, slab, post, ball, board, deco,
  bulbs, paint, plain, sideBack, topBack, underBack, seen, still, stillAt, viewOf, FIRE, CHAR, ICE, WATER, SHELL, TRUSS, BLACKS,
  levelQ, sideQ, fromDepth, lip, tubeH, tubeV, truss, chain, GY,
};

// ---------------------------------------------------------------------------------------------------------------
// The depths (d of the way from the eye to the play plane; the ground at d lands (1 - d) x 298 px up from GY at rest)

/** The PA poles by the curb; Steve's standees; his posters on their stands; the signs on posts; the guests running
 *  about at the back of the sidewalk; the SAFE TORNADO LAUNCHING ZONE's gantry. */
export const PA_D = 0.965, STANDEE_D = 0.958, PROP_D = 0.952, SIGN_D = 0.955, GUEST_D = 0.935, GANTRY_D = 0.93;
/** The climb: each shaft's scaffold frame (the ledges are clamped to it), the HOTEL HAPPYWOOD behind the first, the
 *  soundstages' backs (STAGE 14 and 15 go back to there), the soundstages behind coming down. */
export const SCAF_D = 0.94, HOTEL_D = 0.86, STAGE_BACK_D = 0.85, BACKS_D = 0.78;
/** The hill: the road's far edge, the hillside rising behind it (to SLOPE_D, RISE px up), the HAPPYWOOD letters on it,
 *  the bunkers dug in (their back walls). */
export const ROAD_D = 0.95, SLOPE_D = 0.8, RISE = 260, LETTER_D = 0.9, BUNK_D = 0.9;
/** A front lying flat: depth per px of its height (a 300 px front lands its top ~28 px under the play plane). */
export const PXD = 0.000713;

// ---------------------------------------------------------------------------------------------------------------
// Materials (darkest first)

/** Snow and packed snow (lit from the upper left: blue in its shade). */
export const SNOW = ['#3E4C66', '#5E7090', '#8A9CBC', '#B6C6DE', '#DCE6F2', '#F6FAFF'];
/** The hill's rock (warm gray-brown, sooty). */
export const ROCK = ['#120E10', '#201A1A', '#322826', '#463A34', '#5E4E46', '#7A685C'];
/** Lava: crust to white-hot. */
export const LAVA_R = ['#2A0604', '#6A1006', '#A8240A', '#DC4A0E', '#F8861C', '#FDC848', '#FFF2B0'];
/** Basalt (the lava crusted over, spent). */
export const BASALT = ['#08070A', '#121014', '#1C1A1E', '#28252A', '#36323A', '#48424C'];
/** Ash lying (gray, a little warm). */
export const ASHY = ['#2A2624', '#3E3936', '#57514C', '#726B64', '#908880', '#B0A89E'];

// ---------------------------------------------------------------------------------------------------------------
// Fire and smoke (live)

/** One tongue of a flame: rows `step` px high from its foot (x, y) up `h`, `w` wide at the foot, bent over by `sway` at
 *  its tip; a stack of rows, never a smooth shape. */
const tongue = (c: Ctx, x: number, y: number, w: number, h: number, sway: number, col: string, step: number) => {
  if (h < 1 || w < 1) return;
  c.fillStyle = col;
  for (let k = 0; k < h; k += step) {
    const u = k / h, hw = (w / 2) * Math.pow(1 - u, 0.75) * (u < 0.15 ? 0.8 + u * 1.3 : 1);
    if (hw < 0.5) break;
    c.fillRect(Math.round(x - hw + sway * u * u), Math.round(y - k - step), Math.max(1, Math.round(hw * 2)), step);
  }
};
/** A flame (live), its foot's middle at (x, y): ember-red round orange round yellow round a white core, each a stack of
 *  stepped rows, licking up and leaning as it flickers. */
export const flame = (c: Ctx, x: number, y: number, w: number, h: number, f: number, seed: number) => {
  const t = f * 0.23 + seed * 1.71;
  const hh = h * (0.78 + 0.16 * Math.sin(t) + 0.08 * Math.sin(t * 2.7 + seed));
  const sway = Math.sin(t * 0.63 + seed) * w * 0.28;
  const step = h > 40 ? 3 : 2;
  tongue(c, x, y, w, hh, sway, FIRE[1], step);
  tongue(c, x + sway * 0.05, y, w * 0.74, hh * 0.8, sway * 0.85, FIRE[3], step);
  tongue(c, x, y, w * 0.48, hh * 0.56, sway * 0.6, FIRE[4], step);
  tongue(c, x, y, w * 0.22, hh * 0.28, sway * 0.3, FIRE[5], step);
  // (a spark off its tip now and then)
  if (((f + seed * 7) >> 2) % 5 === 0) box(c, x + sway + Math.sin(t * 3) * 4, y - hh - 4 - ((f * 2 + seed) % 10), 2, 2, FIRE[5]);
};
/** Flames along a top edge from x for w (their feet on y), `k` how big. */
export const flamesAlong = (c: Ctx, x: number, y: number, w: number, f: number, k = 1, seed = 0) => {
  const n = Math.max(1, Math.floor(w / 24));
  for (let j = 0; j < n; j++) {
    const fx = x + (w * (j + 0.5)) / n + (hash(seed + j * 3.1) - 0.5) * 8;
    flame(c, fx, y + 2, (16 + hash(seed + j) * 12) * k, (22 + hash(seed * 2 + j) * 26) * k, f, seed + j * 5);
  }
};
/** Smoke going up from (x, y) in stepped puffs, rising, spreading, thinning, leaning with the wind (`s` its scale,
 *  `a` how thick). */
export const smokeUp = (c: Ctx, x: number, y: number, f: number, seed: number, s = 1, a = 0.55, n = 7) => {
  for (let k = 0; k < n; k++) {
    const t = ((f * 0.5 + k * (200 / n) + seed * 37) % 200) / 200, r = (5 + t * 22) * s;
    const px = x + (Math.sin(t * 4 + seed) * 6 + t * 46) * s, py = y - t * 190 * s;
    const al = a * (1 - t);
    c.fillStyle = `rgba(34, 24, 24, ${al.toFixed(2)})`; c.fillRect(Math.round(px - r), Math.round(py - r * 0.6), Math.round(r * 2), Math.round(r * 1.2));
    c.fillStyle = `rgba(74, 54, 50, ${(al * 0.8).toFixed(2)})`; c.fillRect(Math.round(px - r * 0.7), Math.round(py - r * 0.6), Math.round(r * 1.2), Math.round(r * 0.5));
    c.fillStyle = `rgba(150, 70, 40, ${(al * 0.35).toFixed(2)})`; c.fillRect(Math.round(px - r * 0.8), Math.round(py + r * 0.3), Math.round(r * 1.4), Math.max(1, Math.round(r * 0.3)));
  }
};

/** The lit lip along a sloped edge (a road down the hill) from (x0, y0) to (x1, y1): inked over, lit, shaded under. */
export const slopeLip = (c: Ctx, x0: number, y0: number, x1: number, y1: number) => {
  const band = (dy: number, w: number, col: string) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0 + dy); c.lineTo(x1, y1 + dy); c.stroke(); };
  c.lineCap = 'butt';
  band(-0.5, 1, INK); band(1.5, 3, LIP[2]); band(0.5, 1, LIP[3]); band(3.5, 1, LIP[0]);
};

/** Diagonal hazard stripes (yellow and black) filling a box, sliding along by `phase`. */
export const hazard = (c: Ctx, x: number, y: number, w: number, h: number, phase = 0, col = '#FACC15') => {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  box(c, x, y, w, h, '#18181B');
  c.fillStyle = col;
  for (let sx = x - h - 16 + (((phase % 16) + 16) % 16); sx < x + w + h; sx += 16) { c.beginPath(); c.moveTo(sx, y + h); c.lineTo(sx + 8, y + h); c.lineTo(sx + 8 + h, y); c.lineTo(sx + h, y); c.closePath(); c.fill(); }
  box(c, x, y, w, 1, 'rgba(255, 255, 255, 0.25)');
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Sprites: art painted once into a canvas of its own (at the screen's scale), for warping live a band at a time

const sprites = new Map<string, HTMLCanvasElement>();
/** A painted sprite: `paint` in local coordinates, the box bx, by, bw, bh, at scale s (the screen's), per hour. */
export const sprite = (key: string, s: number, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void) => {
  const k = `${key}-${timeOfDay().key}-${s}`;
  let cv = sprites.get(k);
  if (cv) return cv;
  cv = document.createElement('canvas');
  cv.width = Math.max(1, Math.ceil(bw * s)); cv.height = Math.max(1, Math.ceil(bh * s));
  const g = cv.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  g.setTransform(s, 0, 0, s, -bx * s, -by * s);
  paint(g);
  sprites.set(k, cv);
  if (sprites.size > 24) { const first = sprites.keys().next().value; if (first !== undefined) sprites.delete(first); }
  return cv;
};
/** The screen's scale under the world's transform (for a sprite as crisp as a stamp). */
export const scaleOf = (c: Ctx) => Math.max(1, Math.min(4, Math.round(c.getTransform().a * 2) / 2));

/** Something at world x standing on the ground at depth d: where its foot lands (screen), and its scale. */
export const footAt = (v: View, x: number, y: number, d: number) => at(v.eye, x, y, d);

void GY; void mix; void hash; void checker; void poly; void at; void atDepth; void stamp; void skyAt; void hourMix; void farTint;
void ICE; void WATER; void CHAR;
