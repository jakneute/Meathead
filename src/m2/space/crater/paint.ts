// The crater section's painting kit (the final pass): the intro's ramps, dither and ink, so it comes out of a piece
// with the rest of the park; the section's materials in stepped ramps (darkest first); and the view: one eye for the
// whole scene (the vanishing point everything going back goes toward): anything at depth d stands d of the way from
// the eye to where it'd be at the play plane.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { box, checker, mix, rampOf, hash, PIX, stamp, bandedGradient, hazeBands, pixelBlob, steppedGlow, bendFloor } from '../../intro/art/kit';
import { BOWL } from './layout';
import { GY } from '../geometry';

export { box, checker, mix, rampOf, hash, PIX, stamp, bandedGradient, hazeBands, pixelBlob, steppedGlow, bendFloor };
export type Ctx = CanvasRenderingContext2D;
export const INK = '#120A12';

// ---------------------------------------------------------------------------------------------------------------
// Palettes (darkest first)

/** The park's lawn. */
export const LAWN = ['#1A2E0E', '#2A4512', '#3C5F17', '#4F7A1C', '#679A26', '#86B838', '#A8D258'];
/** Dirt, turned up. */
export const DIRT = ['#1C130C', '#2E2016', '#433022', '#5B4432', '#755A42', '#937458', '#B39478'];
/** Scorched (the furrow, under the burning chunk). */
export const SCORCH = ['#0E0A08', '#1A1310', '#281E18', '#382B22', '#4A3A2E'];
/** The pastel walks (poured concrete, tinted lavender). */
export const WALK = ['#4A4660', '#625D7C', '#7C7898', '#9894B2', '#B4B0CC', '#D2CEE4', '#ECEAF6'];
/** The saucer's hull (brushed alien alloy, a little green). */
export const HULL = ['#1E2426', '#323C3E', '#4A5658', '#66737A', '#87949A', '#AAB6BA', '#D2DCDE', '#F2F8F8'];
/** Chrome (the park's: poles, trim). */
export const CHROME = ['#22262E', '#3A404C', '#565E6E', '#7A8494', '#A4AEBC', '#CCD4DE', '#F4F8FC'];
/** Pink fiberglass (the churro cart, the park's trim). */
export const PINK = ['#4A0E2E', '#7A1A4A', '#AE2C68', '#DB4B8C', '#F27AAE', '#F9AACB', '#FDD8E8'];
/** Teal enamel (the park's other trim). */
export const TEAL = ['#06302E', '#0B4A46', '#11706A', '#1A9A90', '#30C4B6', '#7CE6DA', '#C8FAF4'];
/** XENOSCARE's fiberglass derelict: bone, gone gray. */
export const BONE = ['#1C1916', '#2E2924', '#46403A', '#625A52', '#827A70', '#A49C92', '#C6C0B6', '#E4E0D8'];
/** Black ship's steel (the inside's bulkheads, all colors under it). */
export const STEEL = ['#07070A', '#0F0F14', '#18181F', '#22222B', '#2E2E3A', '#3E3E4C', '#545466', '#72728A'];
/** Cardboard (the cheap: the sets' backs). */
export const CARD = ['#2A1A0C', '#4A3018', '#6E4A26', '#946838', '#B8884C', '#D6A968', '#EED092'];
/** Warehouse crates (pine, stenciled). */
export const PINE = ['#2A1608', '#46280E', '#6A3E16', '#8E5620', '#B0722E', '#CE9244', '#E8B464'];
/** Hazard yellow. */
export const HAZ = ['#3A2A04', '#6A4C06', '#A0740A', '#CE9A10', '#EEBE24', '#FBDC5C'];

// ---------------------------------------------------------------------------------------------------------------
// The view

export interface View {
  cam: { x: number; y: number };
  /** Where he's looking from (the vanishing point: everything going back goes toward it). */
  eye: { x: number; y: number };
  /** What's on screen (world), with a margin. */
  v0: number; v1: number; top: number; bot: number;
  f: number;
}
export const viewOf = (state: GameState): View => {
  const cam = state.view ? { x: state.view.x, y: state.view.y } : { x: state.camera.x, y: state.camera.y };
  const w = state.view?.w ?? CANVAS_WIDTH, h = state.view?.h ?? CANVAS_HEIGHT;
  return {
    cam,
    eye: { x: cam.x + w / 2, y: cam.y + h * 0.42 },
    v0: cam.x - 120, v1: cam.x + w + 120, top: cam.y - 40, bot: cam.y + h + 40,
    f: state.frame,
  };
};
/** A world point at the play plane, put back (d < 1) toward the eye. */
export const at = (eye: { x: number; y: number }, x: number, y: number, d: number): [number, number] => [eye.x + (x - eye.x) * d, eye.y + (y - eye.y) * d];
/** Things drawn at a depth (d of the way from the eye): drawn as if at the play plane, scaled toward the eye. */
export const atDepth = (c: Ctx, eye: { x: number; y: number }, d: number, draw: () => void) => {
  c.save(); c.translate(eye.x, eye.y); c.scale(d, d); c.translate(-eye.x, -eye.y); draw(); c.restore();
};
/** Whether anything from x a to b at the play plane, going back to depth d, is on screen (culled by where it's drawn). */
export const seenBack = (v: View, a: number, b: number, d: number, pad = 40) => {
  const fa = v.eye.x + (a - v.eye.x) * d, fb = v.eye.x + (b - v.eye.x) * d;
  return Math.max(b, fb) > v.v0 - pad && Math.min(a, fa) < v.v1 + pad;
};

/** A polygon, filled (no ink). */
export const poly = (c: Ctx, pts: [number, number][], col: string) => {
  c.fillStyle = col; c.beginPath();
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath(); c.fill();
};
/** A polygon with an ink line round it. */
export const inked = (c: Ctx, pts: [number, number][], col: string, t = 1) => {
  poly(c, pts, col);
  c.strokeStyle = INK; c.lineWidth = t; c.lineJoin = 'miter'; c.beginPath();
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath(); c.stroke();
};
/** A line (no ink). */
export const line = (c: Ctx, a: [number, number], b: [number, number], col: string, w = 1) => {
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
};

/**
 * The side of a box going back from the play plane at x = e, from `top` to `bottom`, back to depth d1; seen only from
 * its side (side 1: its face looks right). In steps across, darker the further back (`cols`: near to far).
 */
export const sideFace = (c: Ctx, eye: { x: number; y: number }, e: number, side: 1 | -1, top: number, bottom: number, d0: number, d1: number, cols: string[]) => {
  if ((eye.x - e) * side <= 1) return false;
  const n = cols.length;
  for (let i = 0; i < n; i++) {
    const a = d0 + ((d1 - d0) * i) / n, b = d0 + ((d1 - d0) * (i + 1)) / n;
    poly(c, [at(eye, e, top, a), at(eye, e, top, b), at(eye, e, bottom, b), at(eye, e, bottom, a)], cols[i]);
  }
  const [x1, t1] = at(eye, e, top, d1), [, b1] = at(eye, e, bottom, d1);
  c.strokeStyle = INK; c.lineWidth = 1;
  c.beginPath(); c.moveTo(e, top); c.lineTo(x1, t1); c.lineTo(x1, b1); c.stroke();
  return true;
};
/**
 * The top (or underside) of a box going back from the play plane at height y, from x0 to x1, back to depth d; seen
 * only from above it (a top) or below it (an underside), whichever the eye is. In bands (`cols`: near to far).
 */
export const flatFace = (c: Ctx, eye: { x: number; y: number }, x0: number, x1: number, y: number, d0: number, d1: number, cols: string[]) => {
  if (Math.abs(eye.y - y) < 1) return;
  const n = cols.length;
  for (let i = 0; i < n; i++) {
    const a = d0 + ((d1 - d0) * i) / n, b = d0 + ((d1 - d0) * (i + 1)) / n;
    poly(c, [at(eye, x0, y, a), at(eye, x1, y, a), at(eye, x1, y, b), at(eye, x0, y, b)], cols[i]);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Words and boards

/** Words, small, centered, the pixel font. */
export const words = (c: Ctx, s: string, x: number, y: number, col: string, size = 8, shadow: string | null = null, align: CanvasTextAlign = 'center') => {
  c.font = `${size}px "Press Start 2P"`; c.textAlign = align;
  if (shadow) { c.fillStyle = shadow; c.fillText(s, Math.round(x) + 1, Math.round(y) + 1); }
  c.fillStyle = col; c.fillText(s, Math.round(x), Math.round(y)); c.textAlign = 'left';
};
export const textW = (c: Ctx, s: string, size: number) => { c.font = `${size}px "Press Start 2P"`; return c.measureText(s).width; };

/**
 * A panel (a sign's board, a console's face): its ramp, inked, a lit top edge, a shaded bottom and right, a bevel, two
 * screws. (x, y) its top left.
 */
export const panel = (c: Ctx, x: number, y: number, w: number, h: number, col: string, screws = true) => {
  const r = rampOf(col);
  box(c, x - 1, y - 1, w + 2, h + 2, INK);
  box(c, x, y, w, h, r[2]);
  box(c, x, y, w, 1, r[4]); box(c, x, y + 1, w, 1, r[3]); box(c, x, y, 1, h, r[3]);
  box(c, x, y + h - 2, w, 2, r[1]); box(c, x + w - 1, y, 1, h, r[1]);
  checker(c, x + 1, y + h - 3, w - 2, 1, r[1]);
  if (screws && h > 14) for (const sx of [x + 3, x + w - 5]) { box(c, sx, y + 3, 2, 2, r[0]); box(c, sx, y + 3, 1, 1, r[4]); }
};
/** A sign board with words on it, centered at (x, y). Returns its width. */
export const board = (c: Ctx, x: number, y: number, s: string, col: string, ink: string, size = 8) => {
  const w = Math.round(textW(c, s, size) + 16), h = size + 12;
  const x0 = Math.round(x - w / 2), y0 = Math.round(y - h / 2);
  panel(c, x0, y0, w, h, col);
  words(c, s, x, y0 + h / 2 + size / 2, ink, size, rampOf(col)[0]);
  return w;
};
/** A round post (chrome by default): stepped across, inked, a foot. */
export const post = (c: Ctx, x: number, top: number, foot: number, w = 6, R: string[] = CHROME) => {
  box(c, x - w / 2 - 1, top, w + 2, foot - top, INK);
  box(c, x - w / 2, top, w, foot - top, R[3]);
  box(c, x - w / 2, top, Math.max(1, Math.round(w / 3)), foot - top, R[5]);
  box(c, x + w / 2 - 2, top, 2, foot - top, R[1]);
  box(c, x - w / 2 - 3, foot - 4, w + 6, 4, INK); box(c, x - w / 2 - 2, foot - 3, w + 4, 3, R[2]); box(c, x - w / 2 - 2, foot - 3, w + 4, 1, R[4]);
};
/** A disc (a ball, a bolt head, a porthole) in stepped tones, lit from the upper left, inked. */
export const orb = (c: Ctx, x: number, y: number, r: number, R: string[], ink = true) => {
  const n = R.length;
  if (ink) { c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + 1, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = R[Math.max(0, Math.floor(n * 0.3))]; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.fillStyle = R[Math.floor(n * 0.55)]; c.beginPath(); c.arc(x - r * 0.12, y - r * 0.12, r * 0.82, 0, Math.PI * 2); c.fill();
  c.fillStyle = R[Math.floor(n * 0.75)]; c.beginPath(); c.arc(x - r * 0.3, y - r * 0.3, r * 0.48, 0, Math.PI * 2); c.fill();
  c.fillStyle = R[n - 1]; c.fillRect(Math.round(x - r * 0.45), Math.round(y - r * 0.5), Math.max(1, Math.round(r * 0.25)), Math.max(1, Math.round(r * 0.25)));
};
/** A tube (a pipe, a rail) along x from x0 to x1 at y, `h` thick, stepped from its lit top to its dark belly (R: a
 *  ramp, darkest first). */
export const pipeH = (c: Ctx, x0: number, x1: number, y: number, h: number, R: string[]) => {
  const n = R.length;
  box(c, x0, y - 1, x1 - x0, h + 2, INK);
  box(c, x0, y, x1 - x0, h, R[Math.floor(n * 0.45)]);
  box(c, x0, y, x1 - x0, Math.max(1, Math.round(h * 0.3)), R[Math.floor(n * 0.7)]);
  box(c, x0, y + Math.max(1, Math.round(h * 0.1)), x1 - x0, 1, R[n - 1]);
  box(c, x0, y + Math.round(h * 0.7), x1 - x0, h - Math.round(h * 0.7), R[Math.floor(n * 0.2)]);
};

// ---------------------------------------------------------------------------------------------------------------
// Where things are


/** The floor's height at x (the bowl dips). */
export const floorAt = (x: number) => {
  const { a, b, c, d, deep } = BOWL;
  if (x <= a || x >= d) return GY;
  if (x < b) return GY + deep * ((x - a) / (b - a));
  if (x > c) return GY + deep * (1 - (x - c) / (d - c));
  return GY + deep;
};
/** On screen (world x from a to b, with a margin). */
export const shown = (state: GameState, a: number, b: number, pad = 60) => {
  const vx = state.view?.x ?? state.camera.x, vw = state.view?.w ?? CANVAS_WIDTH;
  return b > vx - pad && a < vx + vw + pad;
};
