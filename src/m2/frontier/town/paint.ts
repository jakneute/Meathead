// Sawdust Gulch's painting kit (the final pass: peak SNES, matched to the wilds' (wilds/paint.ts) and the train's
// (train/paint.ts): the same pine planks, plywood, fiberglass, steel, brass and varnish). The town's own materials in
// stepped ramps (darkest first), lit from the upper left, inked round: the false fronts' painted plywood in the park's
// western colors, clapboard, tar paper, shingles, adobe, the street's dirt, sawdust, mine rock and timber, the queue's
// stamped concrete. Park-western lettering for the fronts (slab serifs, two-tone, a drop shadow); burned planks
// (kit.ts) for everything nailed up.
//
// The view: one eye for the whole scene (the jungle's perspective: anything at depth d stands d of the way from the eye
// to where it'd be at the play plane), the eye at the camera's middle; what's on screen is the zoomed view (view.ts).
// The fronts stand back at FRONT_D, the ground going back to FAR, the back lots between.
//
// Still art is painted once for the hour into a stamp (m1 render/stamp: it keeps up with the zoom) and put down after
// that (still()); only what moves is drawn live.

import type { GameState } from '../../../m1/game/core/state';
import { timeOfDay, farTint, skyAt, hourMix } from '../../timeOfDay';
import { box, checker, mix, hash, PIX, at, poly } from '../../adventure/jungle/art/paint';
import { stamp, bandedGradient, hazeBands, pixelBlob, steppedGlow } from '../../intro/art/kit';
import { rampDown, type Look } from '../../signLetters';
import { INK } from '../kit';
import { FIBER, STONE, DIRT, GRASS, NEEDLE, BARK, PLANK, PLY, STEEL, WATER, FIBER_LIP, part as wpart, slab, post, ball, pine, fiberglass, near, dimmed, rampOf } from '../wilds/paint';
import { RED, MAROON, IRON, BLACK, BRASS, VARNISH, GREEN, OLIVE, OXIDE, FIR, CREAM, HAY, ORE, COAL, TOPLIP, puff, flame, glass, warmth, rivets, planks, boards } from '../train/paint';
import { viewOf as townViewOf } from './view';

export { box, checker, mix, hash, PIX, at, poly, stamp, bandedGradient, hazeBands, pixelBlob, steppedGlow, INK, timeOfDay, farTint, skyAt, hourMix };
export { FIBER, STONE, DIRT, GRASS, NEEDLE, BARK, PLANK, PLY, STEEL, WATER, FIBER_LIP, slab, post, ball, pine, fiberglass, near, dimmed, rampOf };
export { RED, MAROON, IRON, BLACK, BRASS, VARNISH, GREEN, OLIVE, OXIDE, FIR, CREAM, HAY, ORE, COAL, TOPLIP, puff, flame, glass, warmth, rivets, planks, boards };
export const part = wpart;
export type Ctx = CanvasRenderingContext2D;

/** Where the street's fronts stand (back from the play plane), how far back the ground goes. */
export const FRONT_D = 0.9, FAR = 0.7;
/** How far back the mine's shafts and tunnels go (their back walls): the ground carries on behind the shafts. */
export const MINE_BK = 0.86;

// ---------------------------------------------------------------------------------------------------------------
// The view

export interface TownView {
  cam: { x: number; y: number };
  eye: { x: number; y: number };
  /** What of the world's on screen (with a margin). */
  v0: number; v1: number; top: number; bot: number;
  f: number;
}
export const viewIn = (state: GameState): TownView => {
  const v = townViewOf(state), cam = state.camera;
  return { cam: { x: cam.x, y: cam.y }, eye: { x: cam.x + 400, y: cam.y + 252 }, v0: v.x - 60, v1: v.x + v.w + 60, top: v.y - 40, bot: v.y + v.h + 40, f: state.frame };
};
/** On screen, a thing at world x a..b at depth d (by where it's drawn: no pop-in). */
export const seen = (v: TownView, a: number, b: number, d = 1, pad = 60) => {
  const [sa] = at(v.eye, a, 0, d), [sb] = at(v.eye, b, 0, d);
  return sb > v.v0 - pad && sa < v.v1 + pad;
};
/** Things drawn at a depth (d of the way from the eye): drawn as if at the play plane, scaled toward the eye. */
export const atDepth = (c: Ctx, eye: { x: number; y: number }, d: number, draw: () => void) => {
  if (d === 1) { draw(); return; }
  c.save(); c.translate(eye.x, eye.y); c.scale(d, d); c.translate(-eye.x, -eye.y); draw(); c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Stills

const fontIn = () => (typeof document !== 'undefined' && document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n');
/** Still art at world (x, y): painted once for this hour (local coordinates, the box bx, by, bw, bh about (x, y)). */
export const still = (c: Ctx, key: string, x: number, y: number, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, `ft-${key}-${timeOfDay().key}-${fontIn()}`, bx, by, bw, bh, paint);
  c.restore();
};
/** Still art at world (x, y), stood back at depth d. */
export const stillAt = (c: Ctx, v: TownView, d: number, key: string, x: number, y: number, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void) =>
  atDepth(c, v.eye, d, () => still(c, key, x, y, bx, by, bw, bh, paint));

/** Ramps for the hour, made once per hour. */
const RAMPS = new Map<string, string[]>();
export const hr = (name: string, R: string[], k = 0.18) => {
  const key = `${name}-${k}-${timeOfDay().key}`;
  let r = RAMPS.get(key);
  if (!r) { const tod = timeOfDay(); r = R.map(c => farTint(c, k, tod)); RAMPS.set(key, r); }
  return r;
};
/** A ramp round a color for the hour (seven steps: mid at [3]). */
export const hr7 = (col: string, k = 0.18) => hr(`c${col}`, [mix(col, INK, 0.66), mix(col, INK, 0.44), mix(col, INK, 0.2), col, mix(col, '#FFFFFF', 0.2), mix(col, '#FFFFFF', 0.42), mix(col, '#FFFFFF', 0.66)], k);
/** Scenery stood back for the hour (a step toward the haze: none of it reads as somewhere to stand). */
export const back7 = (col: string, k = 0.16) => { const R = hr7(col, 0.4); const tod = timeOfDay(), haze = skyAt(0.92, tod); return R.map(c => mix(c, haze, k)); };

// ---------------------------------------------------------------------------------------------------------------
// The town's materials (darkest first)

/** The street's dirt: dustier and paler than the wilds' trail. */
export const STREET = ['#1E140A', '#342414', '#4E3820', '#6A4E2E', '#86663E', '#A48254', '#C2A06E', '#DCC090'];
/** Sawdust and chips (the mill's ground). */
export const SAWDUST = ['#3A2814', '#5E4220', '#86602E', '#A87E40', '#C89C58', '#E2BC78', '#F4DCA0'];
/** Weathered clapboard (gray-brown, sun-bleached). */
export const WEATHER = ['#1E1A16', '#322C26', '#4A423A', '#62584E', '#7C7064', '#988A7C', '#B6A898'];
/** Tar paper (the rooftops). */
export const TAR = ['#0E0E10', '#18181C', '#24242A', '#303038', '#3E3E48', '#525260', '#6C6C7A'];
/** Cedar shingles. */
export const SHINGLE = ['#1A0E08', '#2E1A0E', '#462816', '#5E3820', '#78482A', '#946038', '#B07A4C'];
/** Red barn paint (the livery). */
export const BARN = ['#280A08', '#44120E', '#621A14', '#80261C', '#9C3626', '#B84E38', '#D2705A'];
/** The mine's rock: real-looking, cool and dark (the inside of the fiberglass mountain is real rock: the park dug it). */
export const MINE = ['#0C0A08', '#16120E', '#221C16', '#30281E', '#403428', '#524434', '#685844'];
/** Mine timber: old, damp, soot-dark. */
export const TIMBER = ['#120C06', '#1E140A', '#2C1E10', '#3C2A16', '#4E381E', '#624828', '#7A5C36'];
/** The queue's stamped concrete (painted to look like boards and dirt: the park). */
export const CONC = ['#2A2624', '#423C38', '#5A524C', '#746A62', '#8E847A', '#A89E92', '#C4BAAE'];
/** Brick (the bank, the jail's back). */
export const BRICK = ['#2A0E08', '#46180E', '#622416', '#7E3220', '#98442C', '#B25C40', '#CA7A5C'];
/** The pond's and the sump's water. */
export const POND = ['#0A1A20', '#10262E', '#16343E', '#1E4650', '#285A62', '#347076', '#4A8A8C', '#72AAA6', '#ACD4C8'];
export const SUMP = ['#04080A', '#081014', '#0C181E', '#122228', '#182E34', '#203A40', '#2C4A50', '#46666A', '#7A9A9A'];

/** The park's western paint for the false fronts (body colors: each made a ramp for the hour). */
export const FRONT_PAINT = {
  oxblood: '#8A3426', mustard: '#B8902E', sage: '#6E8460', slate: '#5A6E7E', plum: '#6E4A6A', cream: '#D8C8A0',
  teal: '#3E7A78', rust: '#A0582E', butter: '#D8B860', gray: '#7A7A72', navy: '#3A4A6A', pine: '#3E6248',
};

// ---------------------------------------------------------------------------------------------------------------
// Faces going back (a box's side, its top), in steps, inked along their far edges

/** A box's side going back from x = e at depth d0 (from `top` to `bottom`) to depth d1, if he's looking at it. */
export const sideBack = (c: Ctx, eye: TownView['eye'], e: number, side: 1 | -1, top: number, bottom: number, d0: number, d1: number, R: string[], steps = 3, shadow = true) => {
  if ((eye.x - e) * side <= 1) return false;
  for (let i = 0; i < steps; i++) {
    const a = d0 - ((d0 - d1) * i) / steps, b = d0 - ((d0 - d1) * (i + 1)) / steps;
    poly(c, [at(eye, e, top, a), at(eye, e, top, b), at(eye, e, bottom, b), at(eye, e, bottom, a)], R[Math.max(0, 2 - i)]);
  }
  const [x0, t0] = at(eye, e, top, d0), [, b0] = at(eye, e, bottom, d0);
  const [x1, t1] = at(eye, e, top, d1), [, b1] = at(eye, e, bottom, d1);
  box(c, x0 - (side > 0 ? 0 : 1), t0, 1, b0 - t0, R[4]);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, t0); c.lineTo(x1, t1); c.lineTo(x1, b1); c.stroke();
  if (shadow) { c.fillStyle = 'rgba(28, 18, 9, 0.28)'; c.beginPath(); c.moveTo(x0, b0); c.lineTo(x1, b1); c.lineTo(x1 + side * 10, b1); c.lineTo(x0 + side * 14, b0); c.closePath(); c.fill(); }
  return true;
};
/** A box's top going back from x0..x1 at height y (depth d0) to depth d1, if he's looking down on it: banded lighter at
 *  the front. */
export const topBack = (c: Ctx, eye: TownView['eye'], x0: number, x1: number, y: number, d0: number, d1: number, R: string[], n = 3) => {
  if (eye.y >= y - 1) return false;
  for (let i = 0; i < n; i++) {
    const a = d0 - ((d0 - d1) * i) / n, b = d0 - ((d0 - d1) * (i + 1)) / n;
    poly(c, [at(eye, x0, y, a), at(eye, x1, y, a), at(eye, x1, y, b), at(eye, x0, y, b)], R[Math.max(0, 4 - i)]);
  }
  const [ax, ay] = at(eye, x0, y, d1), [bx, by] = at(eye, x1, y, d1), [px, py] = at(eye, x0, y, d0), [qx, qy] = at(eye, x1, y, d0);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(px, py); c.lineTo(ax, ay); c.lineTo(bx, by); c.lineTo(qx, qy); c.stroke();
  return true;
};
/** A box's underside going back (he's under it: an awning's, a balcony's), darker going back. */
export const underBack = (c: Ctx, eye: TownView['eye'], x0: number, x1: number, y: number, d0: number, d1: number, R: string[], n = 3) => {
  if (eye.y <= y + 1) return false;
  for (let i = 0; i < n; i++) {
    const a = d0 - ((d0 - d1) * i) / n, b = d0 - ((d0 - d1) * (i + 1)) / n;
    poly(c, [at(eye, x0, y, a), at(eye, x1, y, a), at(eye, x1, y, b), at(eye, x0, y, b)], R[Math.max(0, 2 - i)]);
  }
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// Pieces

/** Clapboard: boards laid along, each lit along its top edge, a shadow line under its lap, the odd one a shade off,
 *  nail heads at the studs. */
export const clapboard = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], bh = 8, seed = 0) => {
  box(g, x, y, w, h, R[3]);
  for (let py = y, i = 0; py < y + h; py += bh, i++) {
    const tone = hash(seed + i * 1.37);
    if (tone < 0.2) box(g, x, py, w, bh, R[2]); else if (tone > 0.86) box(g, x, py, w, bh, mix(R[3], R[4], 0.5));
    box(g, x, py, w, 1, R[5]); box(g, x, py + 1, w, 1, R[4]);
    box(g, x, py + bh - 2, w, 1, R[1]); box(g, x, py + bh - 1, w, 1, R[0]);
    for (let j = 0; j < 2; j++) box(g, x + hash(seed + i * 3 + j) * (w - 30), py + 3 + j * 2, 12 + hash(seed + i + j * 7) * 26, 1, R[2]);
    for (let sx = x + 12 + ((i * 5) % 7); sx < x + w - 2; sx += 32) box(g, sx, py + 3, 1, 1, INK);
  }
};
/** Board and batten: wide boards stood up, a narrow batten over every seam, lit down its left. */
export const batten = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], bw = 14, seed = 0) => {
  box(g, x, y, w, h, R[3]);
  for (let px = x, i = 0; px < x + w; px += bw, i++) {
    if (hash(seed + i * 2.1) < 0.25) box(g, px, y, bw, h, R[2]);
    for (let k = 0; k < 3; k++) box(g, px + 3 + hash(seed + i + k) * (bw - 6), y + hash(seed + i * 3 + k) * h * 0.8, 1, 10 + hash(seed + k + i) * 30, R[2]);
    box(g, px - 2, y, 4, h, R[4]); box(g, px - 2, y, 1, h, R[5]); box(g, px + 2, y, 1, h, R[1]);
  }
};
/** A sash window (glass by the hour, four panes, its sill lit, its frame inked); `curtain` a color drawn half across. */
export const sash = (g: Ctx, x: number, y: number, w: number, h: number, frame: string[], warm: number, curtain?: string) => {
  box(g, x - 3, y - 3, w + 6, h + 6, INK); box(g, x - 2, y - 2, w + 4, h + 4, frame[4]); box(g, x - 2, y - 2, w + 4, 1, frame[5]); box(g, x + w + 1, y - 2, 1, h + 4, frame[2]);
  glass(g, x, y, w, h, warm);
  if (curtain) {
    const C = [mix(curtain, INK, 0.4), curtain, mix(curtain, '#FFFFFF', 0.25)];
    for (const [cx, cw] of [[x, w * 0.28], [x + w - w * 0.28, w * 0.28]] as const) { box(g, cx, y, cw, h, C[1]); box(g, cx, y, cw, 2, C[2]); for (let k = 2; k < cw; k += 4) box(g, cx + k, y + 2, 1, h - 2, C[0]); }
  }
  box(g, x + w / 2 - 1, y, 2, h, frame[2]); box(g, x, y + h / 2 - 1, w, 2, frame[2]);
  box(g, x - 4, y + h + 2, w + 8, 3, INK); box(g, x - 4, y + h + 2, w + 8, 1, frame[5]);
};
/** A door (panels, a knob), its frame. `dark` an open doorway instead. */
export const door = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], dark = false) => {
  box(g, x - 3, y - 3, w + 6, h + 3, INK); box(g, x - 2, y - 2, w + 4, h + 2, R[4]); box(g, x - 2, y - 2, w + 4, 1, R[5]);
  if (dark) { bandedGradient(g, x, y, w, h, ['#1A120A', '#120C06', '#0A0604'], 3); return; }
  box(g, x, y, w, h, R[3]); box(g, x, y, 2, h, R[4]); box(g, x + w - 2, y, 2, h, R[1]);
  for (const [py, ph] of [[y + 6, h * 0.36], [y + h * 0.5, h * 0.42]] as const) for (const px of [x + 5, x + w / 2 + 2]) {
    const pw = w / 2 - 7;
    box(g, px, py, pw, ph, R[2]); box(g, px, py, pw, 1, R[1]); box(g, px, py + ph - 1, pw, 1, R[5]); box(g, px + pw - 1, py, 1, ph, R[4]);
  }
  box(g, x + w - 9, y + h * 0.5, 4, 4, INK); box(g, x + w - 8, y + h * 0.5 + 1, 2, 2, BRASS[4]);
};
/** Park-western lettering (painted on a false front: slab serifs, banded, inked, a drop shadow). */
export const western = (cell: number, col: string, shadow = '#1C1209', ink?: string): Look => ({ sx: cell, sy: cell, serif: true, gap: 2, fill: rampDown(col, 0.3), dither: true, shadow, drop: Math.max(1, cell >> 1), ink });
/** Painted shadow letters for a sign board (two-tone, no serif). */
export const signPaint = (cell: number, col: string, shadow = '#1C1209'): Look => ({ sx: cell, sy: cell, gap: 1, fill: rampDown(col, 0.25), dither: true, shadow });
/** A softly glowing lamp's halo (stepped, see-through), for a lamp lit after dark. */
export const halo = (c: Ctx, x: number, y: number, r: number, col: string, a = 0.22) => steppedGlow(c, x, y, r, col, a, 0, 4);
/** Is it lamp time (after dark)? */
export const lampsOn = () => timeOfDay().lamps > 0.3;
