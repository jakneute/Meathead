// Futureland's painting kit (the final pass: peak SNES), shared by the square, the main drag and the walk in
// (walkAway/intoSpace.ts): the park's materials in stepped ramps (pastel stucco, chrome, fiberglass, pavers, copper,
// glass by the hour), its boards (enamel, beveled, screwed on; neon round the big ones after dark), its starbursts, and
// the view (one eye for the whole scene: everything going back goes toward it, Spooky Land's perspective).
//
// Still art (a shopfront, a sign, a lamp) is painted once into a stamp, keyed by the hour, and put down after that
// (still()); only what moves is drawn live.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { timeOfDay, farTint, skyAt, hourMix } from '../../timeOfDay';
import { box, checker, mix, hash, rampOf, stamp, bandedGradient, hazeBands, pixelBlob, steppedGlow, PIX } from '../../intro/art/kit';
import { at, atDepth, poly } from '../../spooky/town/paint';

export { box, checker, mix, hash, rampOf, stamp, bandedGradient, hazeBands, pixelBlob, steppedGlow, PIX, at, atDepth, poly, hourMix, timeOfDay, farTint, skyAt };
export type Ctx = CanvasRenderingContext2D;
/** Futureland's ink: a deep navy-plum (the chrome and the pastels read cleaner against it than a brown). */
export const INK = '#140C1C';
const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;

// ---------------------------------------------------------------------------------------------------------------
// Materials (darkest first)

/** Chrome (poles, trim, the monorail, the saucers): a cool steel with a hard white glint. */
export const CHROME = ['#1C2232', '#343D52', '#56627A', '#8592AA', '#B8C3D6', '#E4EAF4', '#FFFFFF'];
/** The walkways' pavers: pale warm concrete, a touch of lilac in the shade. */
export const PAVE = ['#3A3648', '#56526A', '#767288', '#9894A6', '#B8B4C2', '#D6D2DC', '#EEEBF2'];
/** Bare concrete (the pits' walls, the track's pylons, the backs of things). */
export const CONCRETE = ['#2A2C36', '#3E414E', '#585C6A', '#767A88', '#969AA6', '#B6BAC4'];
/** The inlaid stripes in the walk: flamingo pink and atomic teal. */
export const PINK = ['#4E1230', '#84204E', '#BC3A76', '#E8659E', '#F59AC2', '#FCD0E2'];
export const TEAL = ['#08343A', '#0E5A5A', '#138A84', '#22BCAC', '#6EE2D2', '#C4F6EE'];
/** Rubber (belts, handrails, tires). */
export const RUBBER = ['#0A0A10', '#16161E', '#24242E', '#363642', '#4A4A58'];
/** Copper (the electric sidewalk). */
export const COPPER = ['#3A1606', '#62260C', '#8E3E14', '#B8601E', '#DC8A34', '#F6BC6A', '#FFE2A8'];
/** Safety orange (fences, barricades, cones). */
export const ORANGE = ['#4A1404', '#7C2408', '#B83C0C', '#EA6214', '#FB9440', '#FFC48A'];
/** The lit lip along anything he can stand on: brushed chrome catching the light, a teal glint. */
export const LIP = ['#3A4458', '#8A98B0', '#DCE4F0', '#FFFFFF', '#9EF0E4'];

/** A material's ramp for a hex color: shadow, shade, itself, lit, highlight, glint. */
export const ramp6 = (c: string) => [mix(c, INK, 0.62), mix(c, INK, 0.36), mix(c, INK, 0.14), c, mix(c, '#FFFFFF', 0.3), mix(c, '#FFFFFF', 0.6)];
/** Pushed back a step (far things, the backs of things): into the hour's haze a touch, dimmer. */
export const backTint = (c: string, k = 0.2) => { const tod = timeOfDay(); return mix(farTint(c, 0.4 + k, tod), skyAt(0.9, tod), k * 0.5); };

/** Window glass by the hour: by day the sky in it (banded, a glint), after dark lit warm from inside. Darkest first. */
export const glassOf = () => {
  const tod = timeOfDay();
  return tod.lamps > 0.35
    ? ['#2A1808', '#6A3E12', '#B07024', '#E8A646', '#FCD884', '#FFF4C8']
    : [hourMix('#10203A', '#2A1A2E', '#0A0C1A', tod), hourMix('#1E3E66', '#4A2E4A', '#141A30', tod), hourMix('#3468A0', '#7A4E66', '#22304A', tod), hourMix('#5E9ACC', '#B07A7A', '#34466A', tod), hourMix('#A8D4F2', '#E6B094', '#5A6C90', tod), '#FFFFFF'];
};
export const lit = () => timeOfDay().lamps > 0.35;

// ---------------------------------------------------------------------------------------------------------------
// Stills, the view

const fontIn = () => (typeof document !== 'undefined' && document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n');
/** Still art at world (x, y): painted once (local coordinates, the box `bx, by, bw, bh` about (x, y)) for this hour,
 *  then stamped. (What's painted before the font's in is painted again once it is.) */
export const still = (c: Ctx, key: string, x: number, y: number, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, `${key}-${timeOfDay().key}-${fontIn()}`, bx, by, bw, bh, paint);
  c.restore();
};
/** On screen (world x a..b), with a margin of `pad` (at least the drawn size past a..b). */
export const inView = (state: GameState, a: number, b: number, pad = 120) => b > state.camera.x - pad && a < state.camera.x + W + pad;

export interface View {
  cam: { x: number; y: number };
  /** Where he's looking from (the vanishing point). */
  eye: { x: number; y: number };
  /** What's on screen (world), with a margin. */
  v0: number; v1: number; top: number; bot: number;
  f: number;
}
export const viewOf = (state: GameState): View => {
  const cam = state.camera;
  return {
    cam: { x: cam.x, y: cam.y },
    eye: { x: cam.x + W / 2, y: cam.y + H * 0.42 },
    v0: cam.x - 120, v1: cam.x + W + 120, top: cam.y - 40, bot: cam.y + H + 40,
    f: state.frame,
  };
};

// ---------------------------------------------------------------------------------------------------------------
// Words, boards, poles, starbursts

export const textW = (c: Ctx, s: string, size: number) => { c.font = `${size}px "Press Start 2P"`; return c.measureText(s).width; };
/** Words, centered, the pixel font, a drop shadow. */
export const words = (c: Ctx, s: string, x: number, y: number, col: string, size = 8, shadow: string | null = null) => {
  c.font = `${size}px "Press Start 2P"`; c.textAlign = 'center';
  if (shadow) { c.fillStyle = shadow; c.fillText(s, Math.round(x) + 1, Math.round(y) + 1); }
  c.fillStyle = col; c.fillText(s, Math.round(x), Math.round(y)); c.textAlign = 'left';
};

/**
 * A board (a sign on a wall, over a door, up on posts): enamel in its ramp, inked, a chrome frame lit along the top,
 * a bevel, screws; the words with a drop shadow. Its middle at (x, y); returns its width. `neon`: a row of bulbs round
 * it (lit after dark).
 */
export const board = (g: Ctx, x: number, y: number, text: string, bg: string, ink: string, size = 8, pad = 8, neon = false) => {
  const w = Math.round(textW(g, text, size) + pad * 2), h = Math.round(size + pad * 1.5);
  const x0 = Math.round(x - w / 2), y0 = Math.round(y - h / 2);
  const r = ramp6(bg);
  // (the chrome frame round it)
  box(g, x0 - 3, y0 - 3, w + 6, h + 6, INK);
  box(g, x0 - 2, y0 - 2, w + 4, h + 4, CHROME[3]);
  box(g, x0 - 2, y0 - 2, w + 4, 1, CHROME[5]); box(g, x0 - 2, y0 - 2, 1, h + 4, CHROME[4]);
  box(g, x0 - 2, y0 + h + 1, w + 4, 1, CHROME[1]); box(g, x0 + w + 1, y0 - 2, 1, h + 4, CHROME[2]);
  // (the enamel: lit at the top, shaded at the foot, dithered between)
  box(g, x0, y0, w, h, r[3]);
  box(g, x0, y0, w, 2, r[4]); box(g, x0, y0 + 2, w, 1, mix(r[3], r[4], 0.5));
  box(g, x0, y0 + h - 2, w, 2, r[2]); checker(g, x0, y0 + h - 4, w, 2, r[2], 0, 1);
  box(g, x0, y0, 1, h, r[4]);
  // (screws, if there's room)
  if (pad >= 6) for (const sx of [x0 + 2, x0 + w - 4]) { box(g, sx, y0 + h / 2 - 1, 2, 2, r[1]); box(g, sx, y0 + h / 2 - 1, 1, 1, CHROME[5]); }
  // (the bulbs round the big ones)
  if (neon) {
    const on = lit();
    for (let bx = x0 + 2; bx < x0 + w - 1; bx += 8) for (const by of [y0 - 3, y0 + h + 1]) { box(g, bx, by, 2, 2, on ? '#FFF3B0' : '#C8A848'); if (on) box(g, bx, by, 1, 1, '#FFFFFF'); }
  }
  words(g, text, x, y0 + h / 2 + size / 2, ink, size, r[1]);
  return w;
};

/** A chrome pole from `top` down to `foot` (`w` wide): round, stepped across, inked, a collar at the foot. */
export const chromePole = (g: Ctx, x: number, top: number, foot: number, w = 6, R = CHROME) => {
  const x0 = Math.round(x - w / 2);
  box(g, x0 - 1, top, w + 2, foot - top, INK);
  box(g, x0, top, w, foot - top, R[3]);
  box(g, x0, top, Math.max(1, Math.round(w * 0.3)), foot - top, R[5]);
  box(g, x0 + 1, top, 1, foot - top, R[6] ?? R[5]);
  box(g, x0 + w - Math.max(1, Math.round(w * 0.3)), top, Math.max(1, Math.round(w * 0.3)), foot - top, R[2]);
  box(g, x0 - 3, foot - 5, w + 6, 5, INK); box(g, x0 - 2, foot - 4, w + 4, 4, R[2]); box(g, x0 - 2, foot - 4, w + 4, 1, R[4]);
};

/** An atomic starburst: long and short spikes in stepped color, a ball at the middle. */
export const starburst = (g: Ctx, x: number, y: number, r: number, col = '#FDE047', n = 8) => {
  const R = ramp6(col);
  g.lineCap = 'butt';
  for (let k = 0; k < n * 2; k++) {
    const a = (k * Math.PI) / n + 0.2, len = k % 2 ? r * 0.55 : r;
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * (len + 1), y + Math.sin(a) * (len + 1)); g.stroke();
  }
  for (let k = 0; k < n * 2; k++) {
    const a = (k * Math.PI) / n + 0.2, len = k % 2 ? r * 0.55 : r;
    g.strokeStyle = Math.cos(a - 3.9) > 0 ? R[4] : R[3]; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
    box(g, x + Math.cos(a) * len - 1, y + Math.sin(a) * len - 1, 2, 2, R[5]);
  }
  ball(g, x, y, Math.max(2, r * 0.22), col);
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

/**
 * A slab of something (a wall, a box's front), stepped: itself, lit down its left edge and along its top, shaded down
 * its right (dithered into it), grime stippled up from its foot. `R`: a ramp6.
 */
export const slab = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], grime = true) => {
  box(g, x, y, w, h, R[3]);
  box(g, x, y, 3, h, R[4]); box(g, x + 3, y, 2, h, mix(R[3], R[4], 0.5));
  box(g, x, y, w, 2, R[4]);
  box(g, x + w - 5, y, 5, h, R[2]); checker(g, x + w - 9, y, 4, h, R[2], 0, 1);
  if (grime && h > 30) { checker(g, x, y + h - 14, w, 6, R[2], 1, 1); box(g, x, y + h - 8, w, 8, R[2]); checker(g, x, y + h - 4, w, 4, R[1], 0, 1); }
};

/**
 * A box's side going back from the play plane at x = e (seen from the side he's looking at), from `top` to `bottom`,
 * back to depth `d` (1 none, less, deeper): in steps darker going back, inked along its far edges; the shadow it throws
 * along its foot. Nothing if it's facing away.
 */
export const sideBack = (c: Ctx, eye: { x: number; y: number }, e: number, side: 1 | -1, top: number, bottom: number, d: number, R: string[], steps = 3) => {
  if ((eye.x - e) * side <= 1) return false;
  for (let i = 0; i < steps; i++) {
    const a = 1 - ((1 - d) * i) / steps, b = 1 - ((1 - d) * (i + 1)) / steps;
    poly(c, [at(eye, e, top, a), at(eye, e, top, b), at(eye, e, bottom, b), at(eye, e, bottom, a)], R[Math.max(0, 2 - i)]);
  }
  const [x1, t1] = at(eye, e, top, d), [, b1] = at(eye, e, bottom, d);
  // (its near corner catching the light, the far edge inked; its shadow along the ground at its foot)
  box(c, e - (side > 0 ? 0 : 1), top, 1, bottom - top, R[4]);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(e, top); c.lineTo(x1, t1); c.lineTo(x1, b1); c.stroke();
  c.fillStyle = 'rgba(16, 10, 30, 0.28)'; c.beginPath(); c.moveTo(e, bottom); c.lineTo(x1, b1); c.lineTo(x1 + side * 10, b1); c.lineTo(e + side * 14, bottom); c.closePath(); c.fill();
  return true;
};
/** A box's top going back from the play plane (x0..x1 at height y) to depth `d`: seen only from above, in bands lighter
 *  at the front. Its front edge lit (a lip, if it's to stand on). */
export const topBack = (c: Ctx, eye: { x: number; y: number }, x0: number, x1: number, y: number, d: number, R: string[], n = 3) => {
  if (eye.y >= y - 1) return false;
  for (let i = 0; i < n; i++) {
    const a = 1 - ((1 - d) * i) / n, b = 1 - ((1 - d) * (i + 1)) / n;
    poly(c, [at(eye, x0, y, a), at(eye, x1, y, a), at(eye, x1, y, b), at(eye, x0, y, b)], R[Math.max(0, 3 - i)]);
  }
  const [ax, ay] = at(eye, x0, y, d), [bx, by] = at(eye, x1, y, d);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y); c.lineTo(ax, ay); c.lineTo(bx, by); c.lineTo(x1, y); c.stroke();
  return true;
};

/** A screen-space haze band laid over the foot of far scenery (the air between). */
export const footHaze = (c: Ctx, y: number, h: number, k = 1) => {
  const tod = timeOfDay();
  hazeBands(c, 0, Math.round(y - h), W, h, skyAt(0.92, tod), 0, 0.5 * k, 5);
};

/** Day, sundown or night: the color for the hour. */
export const night = () => timeOfDay().lamps;
void steppedGlow; void bandedGradient; void pixelBlob; void rampOf; void PIX; void atDepth; void hash;
