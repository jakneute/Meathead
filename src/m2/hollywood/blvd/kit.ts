// The boulevard's painting kit (the final pass: peak SNES): the cheap Hollywood's materials in stepped ramps (plywood
// and its 2x4s, sandbags, the Walk of Fame's charcoal and coral terrazzo, brass, concrete, asphalt, cast iron, velvet,
// Stuntman Steve's yellow), lit from the upper left, inked round in a warm plum-brown; and the view: one eye for the
// whole scene (Spooky Land's perspective: anything at depth d stands d of the way from the eye to where it'd be at the
// play plane), the fronts at FRONT_D, their bracing going back to BACK_D.
//
// Still art (a front, a lamp, a sign) is painted once into a stamp, keyed by the hour, and put down after that
// (still()); only what moves is drawn live.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { timeOfDay, farTint, skyAt, hourMix, hourly } from '../../timeOfDay';
import { box, checker, mix, hash, stamp, bandedGradient, hazeBands, pixelBlob, steppedGlow } from '../../intro/art/kit';
import { at, atDepth, poly, viewOf, type View } from '../../spooky/town/paint';
import { signText, signW, signH, type Look } from '../../signLetters';
import { tone, rampDown } from '../../signLetters';

export { box, checker, mix, hash, stamp, bandedGradient, hazeBands, pixelBlob, steppedGlow, at, atDepth, poly, viewOf, timeOfDay, farTint, skyAt, hourMix, signText, signW, signH };
export type { View, Look };
export type Ctx = CanvasRenderingContext2D;

/** The boulevard's ink: a warm plum-brown (the stucco and the brass read warmer against it than a navy). */
export const INK = '#1C1014';

/** Where the fronts stand (back from the play plane), and where their bracing comes down (the lot behind them). */
export const FRONT_D = 0.88, BACK_D = 0.76;

// ---------------------------------------------------------------------------------------------------------------
// Materials (darkest first)

/** Plywood and 2x4s (the backs of everything, its edges). */
export const PLY = ['#3A2410', '#5C3A1A', '#80562A', '#A87A3E', '#C99E5C', '#E6C488'];
/** Sandbags (burlap). */
export const SAND = ['#3A3024', '#5A4C3C', '#7A6A54', '#9C8C72', '#BCAE92', '#D8CCB2'];
/** The Walk of Fame's charcoal terrazzo, and its coral star squares. */
export const CHAR = ['#141114', '#211C21', '#2E282E', '#3E373E', '#514951', '#685E68'];
export const CORAL = ['#4A1820', '#742834', '#9E3C4A', '#C25866', '#DC8288', '#F0B0AE'];
/** Brass (the stars' rims, the plaques, the rope posts). */
export const BRASS = ['#3A2408', '#6A4410', '#9A6A1C', '#C8962E', '#E8C25A', '#FFF0A8'];
/** Concrete (the curb, the planters, the pits' walls). */
export const CONCRETE = ['#2A2628', '#423C3C', '#5C5654', '#787270', '#97918C', '#B8B2AA', '#D8D2C8'];
/** The street's asphalt. */
export const ASPHALT = ['#121014', '#1C191E', '#27232A', '#332E36', '#423C46', '#564E5A'];
/** Cast iron (the lampposts, the rails), a green-black. */
export const IRON = ['#0A0C0C', '#161A1A', '#222828', '#323A38', '#465250', '#62706C'];
/** Velvet (the ropes). */
export const VELVET = ['#3A0610', '#5E0C1A', '#8A1426', '#B4243A', '#D84A5A'];
/** Stuntman Steve's yellow (his stunt suit; everything of his is it). */
export const STEVE = ['#5A3A04', '#8A5E08', '#C08A10', '#EAB516', '#FAD43A', '#FFF08A'];
/** Galvanized steel (the scaffold, the coaster's legs, sign frames). */
export const STEEL = ['#1A1C22', '#2C3038', '#444A54', '#626A76', '#8890A0', '#B4BCC8', '#E2E8F0'];
/** The lit lip along anything he can stand on: warm, catching the light. */
export const LIP = ['#5A4630', '#A08058', '#F2D79A', '#FFF6D8'];

/** A material's ramp round a hex color: shadow, shade, a touch under itself, itself, lit, highlight. */
export const ramp6 = (c: string) => [mix(c, INK, 0.62), mix(c, INK, 0.36), mix(c, INK, 0.14), c, mix(c, '#FFFFFF', 0.28), mix(c, '#FFFFFF', 0.56)];
/** A color for the hour (outdoors, near: barely into the haze). */
export const hour = (c: string, k = 0.12) => farTint(hourMix(c, mix(c, '#7A4A5A', 0.14), mix(c, '#141832', 0.32)), k);
/** The fronts' (scenery: dimmed a step toward the dusty air, so none of it reads as somewhere to stand). */
export const dimmed = hourly((c: string) => { const tod = timeOfDay(); return mix(mix(farTint(hourMix(c, mix(c, '#5A3448', 0.16), mix(c, '#0E1024', 0.38), tod), 0.35, tod), '#4A3A48', 0.14), skyAt(0.9, tod), 0.05); });
/** A ramp for the hour, `near` or dimmed (scenery). */
export const rampH = (c: string, scenery = false) => ramp6(scenery ? dimmed(c) : hour(c));
/** After dark (the lamps, the windows, the bulbs). */
export const lit = () => timeOfDay().lamps > 0.35;

/** Window glass by the hour: by day the smoggy sky in it (banded, a glint), after dark lit warm. Darkest first. */
export const glassOf = () => {
  const tod = timeOfDay();
  return tod.lamps > 0.35
    ? ['#2A1808', '#6A3E12', '#B07024', '#E8A646', '#FCD884', '#FFF4C8']
    : [hourMix('#141A2A', '#2A1A2E', '#0A0C1A', tod), hourMix('#24364E', '#4A2E4A', '#141A30', tod), hourMix('#4A6888', '#7A4E66', '#22304A', tod), hourMix('#7E98B0', '#B07A7A', '#34466A', tod), hourMix('#C4CCC8', '#E6B094', '#5A6C90', tod), '#FFFFFF'];
};

// ---------------------------------------------------------------------------------------------------------------
// Stills, the view

const fontIn = () => (typeof document !== 'undefined' && document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n');
/** Still art at world (x, y): painted once (local coordinates, the box `bx, by, bw, bh` about (x, y)) for this hour,
 *  then stamped. */
export const still = (c: Ctx, key: string, x: number, y: number, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, `hb-${key}-${timeOfDay().key}-${fontIn()}`, bx, by, bw, bh, paint);
  c.restore();
};
/** Still art standing on the ground at world x, at depth d (scaled toward the eye). */
export const stillAt = (c: Ctx, v: View, d: number, key: string, x: number, y: number, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void) => {
  if (d === 1) { still(c, key, x, y, bx, by, bw, bh, paint); return; }
  atDepth(c, v.eye, d, () => still(c, key, x, y, bx, by, bw, bh, paint));
};
/** On screen, a thing at world x a..b at depth d (by where it's drawn: no pop-in). */
export const seen = (v: View, a: number, b: number, d = 1, pad = 60) => {
  const [sa] = at(v.eye, a, 0, d), [sb] = at(v.eye, b, 0, d);
  return sb > v.cam.x - pad && sa < v.cam.x + CANVAS_WIDTH + pad;
};
export const viewIn = (state: GameState) => viewOf(state);

// ---------------------------------------------------------------------------------------------------------------
// Faces going back (a box's side, its top), in steps, inked along their far edges

/** A box's side going back from x = e at the play plane (from `top` to `bottom`) to depth `d`, if he's looking at it. */
export const sideBack = (c: Ctx, eye: View['eye'], e: number, side: 1 | -1, top: number, bottom: number, d0: number, d1: number, R: string[], steps = 3, shadow = true) => {
  // (how wide it is on screen: under a pixel it's not drawn at all (a sub-pixel sliver flickers as the camera creeps);
  // under two, just its fill, no lit corner or ink line popping on beside the front's edge)
  const wide = (eye.x - e) * side * (d0 - d1);
  if (wide < 0.75) return false;
  if (wide < 2) { poly(c, [at(eye, e, top, d0), at(eye, e, top, d1), at(eye, e, bottom, d1), at(eye, e, bottom, d0)], R[1]); return true; }
  for (let i = 0; i < steps; i++) {
    const a = d0 - ((d0 - d1) * i) / steps, b = d0 - ((d0 - d1) * (i + 1)) / steps;
    poly(c, [at(eye, e, top, a), at(eye, e, top, b), at(eye, e, bottom, b), at(eye, e, bottom, a)], R[Math.max(0, 2 - i)]);
  }
  const [x0, t0] = at(eye, e, top, d0), [, b0] = at(eye, e, bottom, d0);
  const [x1, t1] = at(eye, e, top, d1), [, b1] = at(eye, e, bottom, d1);
  box(c, x0 - (side > 0 ? 0 : 1), t0, 1, b0 - t0, R[4]);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, t0); c.lineTo(x1, t1); c.lineTo(x1, b1); c.stroke();
  if (shadow) { c.fillStyle = 'rgba(28, 16, 20, 0.28)'; c.beginPath(); c.moveTo(x0, b0); c.lineTo(x1, b1); c.lineTo(x1 + side * 10, b1); c.lineTo(x0 + side * 14, b0); c.closePath(); c.fill(); }
  return true;
};
/** A box's top going back from x0..x1 at height y (at depth d0) to depth d1, if he's looking down on it: in bands lighter
 *  at the front. */
export const topBack = (c: Ctx, eye: View['eye'], x0: number, x1: number, y: number, d0: number, d1: number, R: string[], n = 3) => {
  if ((y - eye.y) * (d0 - d1) < 0.75) return false;
  for (let i = 0; i < n; i++) {
    const a = d0 - ((d0 - d1) * i) / n, b = d0 - ((d0 - d1) * (i + 1)) / n;
    poly(c, [at(eye, x0, y, a), at(eye, x1, y, a), at(eye, x1, y, b), at(eye, x0, y, b)], R[Math.max(0, 3 - i)]);
  }
  const [ax, ay] = at(eye, x0, y, d1), [bx, by] = at(eye, x1, y, d1), [px, py] = at(eye, x0, y, d0), [qx, qy] = at(eye, x1, y, d0);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(px, py); c.lineTo(ax, ay); c.lineTo(bx, by); c.lineTo(qx, qy); c.stroke();
  return true;
};
/** A box's underside going back (he's under it: an awning's, a marquee's soffit), darker going back. */
export const underBack = (c: Ctx, eye: View['eye'], x0: number, x1: number, y: number, d0: number, d1: number, R: string[], n = 3) => {
  if ((eye.y - y) * (d0 - d1) < 0.75) return false;
  for (let i = 0; i < n; i++) {
    const a = d0 - ((d0 - d1) * i) / n, b = d0 - ((d0 - d1) * (i + 1)) / n;
    poly(c, [at(eye, x0, y, a), at(eye, x1, y, a), at(eye, x1, y, b), at(eye, x0, y, b)], R[Math.max(0, 1 - Math.floor(i / 2))]);
  }
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// Pieces

/**
 * A slab of something (a wall, a box's front), stepped: itself, lit down its left edge and along its top, shaded down
 * its right (dithered into it), grime stippled up from its foot. `R`: a ramp6.
 */
export const slab = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], grime = true) => {
  box(g, x, y, w, h, R[3]);
  box(g, x, y, 3, h, R[4]); box(g, x + 3, y, 2, h, mix(R[3], R[4], 0.5));
  box(g, x, y, w, 2, R[4]);
  box(g, x + w - 5, y, 5, h, R[2]); checker(g, x + w - 9, y, 4, h, R[2], 0, 1);
  if (grime && h > 30) { checker(g, x, y + h - 14, w, 6, R[2], 1, 2); box(g, x, y + h - 8, w, 8, R[2]); checker(g, x, y + h - 4, w, 4, R[1], 0, 2); }
};
/** A post, round, stepped across (`R` a ramp6), from `top` down to `foot`, inked. */
export const post = (g: Ctx, x: number, top: number, foot: number, w: number, R: string[]) => {
  const x0 = Math.round(x - w / 2), t = Math.max(1, Math.round(w * 0.3));
  box(g, x0 - 1, top, w + 2, foot - top, INK);
  box(g, x0, top, w, foot - top, R[3]);
  box(g, x0, top, t, foot - top, R[4]);
  if (w > 3) box(g, x0 + 1, top, 1, foot - top, R[5]);
  box(g, x0 + w - t, top, t, foot - top, R[1]);
};
/** A ball, stepped: ink round it, its shade, itself up and left, lit, a glint. */
export const ball = (g: Ctx, x: number, y: number, r: number, col: string, ink = true) => {
  const R = ramp6(col);
  const disc = (dx: number, dy: number, rr: number, c2: string) => { if (rr <= 0) return; g.fillStyle = c2; g.beginPath(); g.arc(x + dx, y + dy, rr, 0, Math.PI * 2); g.fill(); };
  if (ink) disc(0, 0, r + 1, INK);
  disc(0, 0, r, R[1]);
  disc(-r * 0.1, -r * 0.1, r * 0.86, R[2]);
  disc(-r * 0.22, -r * 0.22, r * 0.62, R[3]);
  disc(-r * 0.35, -r * 0.35, r * 0.3, R[4]);
  if (r > 2) box(g, x - r * 0.45, y - r * 0.5, Math.max(1, r * 0.2), Math.max(1, r * 0.2), R[5]);
};
/** A five-pointed star (a polygon), squashed by `sy` (one going back), points `r` out. */
export const starPts = (x: number, y: number, r: number, sy = 1, inner = 0.42): [number, number][] => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * inner : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * sy]); }
  return pts;
};
/** A Walk of Fame star (brass rimmed, coral inside, its emblem): flat (sy 1) or lying going back (sy < 1). */
export const fameStar = (g: Ctx, x: number, y: number, r: number, sy = 1) => {
  poly(g, starPts(x, y + 1, r + 2, sy), INK);
  poly(g, starPts(x, y, r + 1.5, sy), BRASS[2]);
  poly(g, starPts(x - 0.5, y - 0.5, r + 0.5, sy), BRASS[4]);
  poly(g, starPts(x, y, r - 1.5, sy), CORAL[3]);
  poly(g, starPts(x - 1, y - 0.6, r * 0.55, sy), CORAL[4]);
  // (the brass emblem in its middle: a little camera)
  if (r * sy > 5) { box(g, x - 2, y - 1 * sy, 4, Math.max(1, 3 * sy), BRASS[3]); box(g, x - 1, y - 2 * sy, 2, Math.max(1, sy), BRASS[4]); }
};

// ---------------------------------------------------------------------------------------------------------------
// Words and boards (the park's alphabet: signLetters.ts; Hollywood's own looks)

/** Deco: tall, thin capitals in a gold ramp (lit at the top), inked, a drop shadow. The old picture palaces'. */
export const deco = (col = '#F2C24A', board = '#1C1014', sy = 3, sx = 1): Look => ({ sx, sy, fill: rampDown(col, 0.4), dither: true, ink: tone(board, '#000000', 0.6), shadow: tone(board, '#000000', 0.45), drop: 1, gap: 2 });
/** Bulbs (a marquee's): every cell a bulb in its socket, lit after dark (or by `on`). */
export const bulbs = (sx: number, sy: number, col: string, on = lit()): Look => ({ sx, sy, fill: col, bulbs: { lit: on, col: '#FFF4C8', dim: '#8A7A5A' }, gap: 1 });
/** Sign-painter's enamel: the color ramped down the letter, a drop shadow. */
export const paint = (size: number, col: string, shadow?: string): Look => ({ sx: size >= 12 ? 2 : 1, sy: size >= 12 ? 2 : size >= 10 ? 2 : 1, fill: rampDown(col, 0.3), dither: true, shadow });
/** Plain painted-on letters (a decal, a stencil on a sign). */
export const plain = (sx: number, sy: number, col: string, shadow?: string): Look => ({ sx, sy, fill: col, shadow });
/** Words, their middle-bottom at (x, y) (the baseline), in a look. */
export const words = (g: Ctx, text: string, x: number, y: number, L: Look, align: 'center' | 'left' | 'right' = 'center') => signText(g, text, x, y, L, align);

/**
 * A board (a sign bolted up, on posts, over a door): painted enamel in its ramp, inked, a frame lit along its top and
 * left, a bevel, two screws; the words on it. Its middle at (x, y); its lines in `L`. Returns [w, h].
 */
export const board = (g: Ctx, x: number, y: number, lines: string[], L: Look, bg: string, frame = BRASS, pad = 6): [number, number] => {
  const lh = signH(L) + Math.max(2, (L.sy ?? 1) * 2);
  const w = Math.round(Math.max(...lines.map(l => signW(l, L))) + pad * 2), h = Math.round(lh * lines.length - Math.max(2, (L.sy ?? 1) * 2) + pad * 1.5);
  const x0 = Math.round(x - w / 2), y0 = Math.round(y - h / 2), r = ramp6(bg);
  box(g, x0 - 3, y0 - 3, w + 6, h + 6, INK);
  box(g, x0 - 2, y0 - 2, w + 4, h + 4, frame[3]);
  box(g, x0 - 2, y0 - 2, w + 4, 1, frame[5]); box(g, x0 - 2, y0 - 2, 1, h + 4, frame[4]);
  box(g, x0 - 2, y0 + h + 1, w + 4, 1, frame[1]); box(g, x0 + w + 1, y0 - 2, 1, h + 4, frame[2]);
  box(g, x0, y0, w, h, r[3]);
  box(g, x0, y0, w, 2, r[4]); box(g, x0, y0 + 2, w, 1, mix(r[3], r[4], 0.5));
  box(g, x0, y0 + h - 2, w, 2, r[2]); checker(g, x0, y0 + h - 4, w, 2, r[2], 0, 1);
  box(g, x0, y0, 1, h, r[4]);
  if (pad >= 5 && h >= 8) for (const sx of [x0 + 2, x0 + w - 4]) { box(g, sx, Math.round(y0 + h / 2 - 1), 2, 2, r[1]); box(g, sx, Math.round(y0 + h / 2 - 1), 1, 1, frame[5]); }
  lines.forEach((l, i) => signText(g, l, x, Math.round(y0 + pad * 0.75 + signH(L) + i * lh), L));
  return [w, h];
};

void hash; void bandedGradient; void hazeBands; void pixelBlob; void steppedGlow;
