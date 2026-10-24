// The stunt stage's painting kit (the final pass: peak SNES, on the boulevard's kit, the ride's and the havoc's, so the
// land's of a piece). Two ways things stand back from the play plane, and one eye for the scene:
//
// - The stage itself (its floor, the street set along its back, the garage doors, the ramps, the hoops, the cars, the
//   truss over it) stands where the fight puts it: depth z puts a thing ZK px up the screen per unit back (arena.ts),
//   never across, so a car comes out of its door's middle and a ramp's lip is where the jump goes off.
// - The amphitheater round it (the stands up both ends going back to the set, their tire walls) stands at depths d
//   from the scene's one eye (the town's perspective, blvd/kit's at() and atDepth()): its eye across with the camera, its
//   height pinned at the camera's rest, so the stands' feet stay on the floor's back edge however high he's thrown.
//
// What's still (a front, the set, a stand's fan) is painted once for the hour and put down after.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import {
  type Ctx, type View, type Look, INK, box, checker, mix, hash, poly, at, atDepth, stamp, timeOfDay, hourMix, skyAt, signText, signW, signH,
  PLY, SAND, BRASS, STEEL, STEVE, CONCRETE, ASPHALT, IRON, LIP, ramp6, hour, dimmed, rampH, glassOf, lit, slab, post, ball, board, deco,
  bulbs, paint, plain, words,
} from '../blvd/kit';
import { FIRE, TRUSS, SHELL, CHAR, tubeH, tubeV, truss, chain } from '../disaster/paint';
import { flame, smokeUp, hazard } from '../havoc/paint';
import { GY, CAM_ROW, FLOOR_BACK_Y } from './arena';

export type { Ctx, View, Look };
export {
  INK, box, checker, mix, hash, poly, at, atDepth, stamp, timeOfDay, hourMix, skyAt, signText, signW, signH, PLY, SAND, BRASS, STEEL, STEVE,
  CONCRETE, ASPHALT, IRON, LIP, ramp6, hour, dimmed, rampH, glassOf, lit, slab, post, ball, board, deco, bulbs, paint, plain, words,
  FIRE, TRUSS, SHELL, CHAR, tubeH, tubeV, truss, chain, flame, smokeUp, hazard,
};

// ---------------------------------------------------------------------------------------------------------------
// The eye

/** The eye's height over the floor line on the screen (the camera's rest puts his feet at CAM_ROW; the eye at 252). */
export const EYE_UP = CAM_ROW - Math.round(CANVAS_HEIGHT * 0.42);
/** The eye, pinned: across with the camera, up at the rest's. */
export const EYE_Y = GY - EYE_UP;
/** The world on the screen: the camera's, and a zoom's too (his kill cam, taking him in a way off: world.ts's
 *  state.view), so what's culled by it never leaves a hole where the zoom's looking (the user's: the set missing round
 *  him as the camera went to him, and on the pan back). */
export const shown = (state: GameState) => {
  const cam = state.camera, z = state.view;
  return z ? { x0: Math.min(cam.x, z.x), x1: Math.max(cam.x + CANVAS_WIDTH, z.x + z.w), y0: Math.min(cam.y, z.y), y1: Math.max(cam.y + CANVAS_HEIGHT, z.y + z.h) }
    : { x0: cam.x, x1: cam.x + CANVAS_WIDTH, y0: cam.y, y1: cam.y + CANVAS_HEIGHT };
};
/** The scene's view. */
export const sview = (state: GameState): View => {
  const cam = state.camera, s = shown(state);
  return {
    cam: { x: cam.x, y: cam.y },
    eye: { x: cam.x + CANVAS_WIDTH / 2, y: EYE_Y },
    v0: s.x0 - 120, v1: s.x1 + 120, top: s.y0 - 40, bot: s.y1 + 40,
    f: state.frame,
  };
};
/** The depth whose ground lands on the floor's back edge (the set's foot): where the stands end. */
export const SET_D = 1 - (GY - FLOOR_BACK_Y) / EYE_UP;
/** On screen: a thing at world x a..b at depth d (by where it lands: no pop-in). */
export const seenAt = (v: View, a: number, b: number, d = 1, pad = 60) => {
  const [sa] = at(v.eye, a, 0, d), [sb] = at(v.eye, b, 0, d);
  return sb > v.cam.x - pad && sa < v.cam.x + CANVAS_WIDTH + pad;
};
/** In view (the stage's own: world x, no depth). */
export const inView = (state: GameState, a: number, b: number, pad = 40) => { const s = shown(state); return b > s.x0 - pad && a < s.x1 + pad; };

// ---------------------------------------------------------------------------------------------------------------
// Materials (darkest first)

/** Tire rubber (the walls' stacks, the cars' tires). */
export const RUBBER = ['#08080A', '#121214', '#1C1C20', '#28282E', '#36363E', '#4A4A54'];
/** The crash mats' vinyl (a dimmed blue: not his to stand on). */
export const MAT = ['#0C1A3E', '#14286A', '#1E3C96', '#2C54BE', '#4A78DA', '#7EA4EE'];
/** The stands' poured concrete (warm, sun-baked). */
export const STAND = ['#2A2422', '#3E3632', '#564C46', '#70645C', '#8C8076', '#ACA096'];
/** The stands' seats: Steve's yellow and a stunt red, every other section. */
export const SEAT_Y = ['#4A3004', '#7A520A', '#A8780E', '#D4A018', '#ECC23A'];
export const SEAT_R = ['#3A0A0A', '#621414', '#8A1E1E', '#B42C2C', '#D04A44'];
/** Stunt red (the posse's garage, the hazard paint). */
export const RED_R = ['#3A0606', '#620E0E', '#8E1616', '#BC2222', '#E04A3E', '#F88A78'];

/** A ramp for the hour, near (the stage: out in the open, lit as the sky's lit). */
export const near = (c: string) => ramp6(hour(c, 0.08));
/** A ramp for the hour, scenery (dimmed toward the air: nothing of it reads as somewhere to stand). */
export const scen = (c: string) => rampH(c, true);

// ---------------------------------------------------------------------------------------------------------------
// Pieces

/** A painted-once stamp at world (x, y), keyed by the hour: `paint` in local coordinates, the box bx, by, bw, bh. */
export const stillH = (c: Ctx, key: string, x: number, y: number, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, `hst-${key}-${timeOfDay().key}`, bx, by, bw, bh, paint);
  c.restore();
};

/** A tire lying on its side in a stack, seen from the front (x middle, y its top, w across, h tall): its tread in steps,
 *  the sidewall's lettering ring, lit along its top. `paint`: a painted band (the barrier's yellow and white). */
export const tireFace = (g: Ctx, x: number, y: number, w: number, h: number, painted?: string) => {
  const l = Math.round(x - w / 2), R = RUBBER;
  box(g, l, y, w, h, INK);
  box(g, l + 1, y + 1, w - 2, h - 2, R[2]);
  box(g, l + 2, y + 1, w - 4, Math.max(1, Math.round(h * 0.3)), R[3]);
  box(g, l + 3, y + 1, Math.max(1, Math.round(w * 0.3)), 1, R[5]);
  box(g, l + 1, y + h - 3, w - 2, 2, R[1]);
  checker(g, l + 1, y + h - 5, w - 2, 2, R[1], 0, 1);
  // (the tread blocks across its face)
  for (let k = l + 3; k < l + w - 3; k += 4) box(g, k, y + Math.round(h * 0.45), 2, 1, R[1]);
  box(g, l, y, 2, h, R[1]); box(g, l + w - 2, y, 2, h, R[0]);
  if (painted) { const P = ramp6(painted); box(g, l + 2, y + Math.round(h * 0.55), w - 4, Math.max(2, Math.round(h * 0.25)), P[3]); box(g, l + 2, y + Math.round(h * 0.55), w - 4, 1, P[4]); box(g, l + w - 6, y + Math.round(h * 0.55), 4, Math.max(2, Math.round(h * 0.25)), P[2]); }
};

/** A lamp head (a PAR can) hung off a pipe, its gel's color; lit after dark. */
export const parCan = (g: Ctx, x: number, y: number, gel: string, on: boolean, aim = 0) => {
  const S = STEEL;
  box(g, x - 1, y, 3, 5, INK); box(g, x, y, 1, 5, S[4]);
  g.save(); g.translate(x, y + 9); g.rotate(aim);
  box(g, -6, -5, 12, 14, INK); box(g, -5, -4, 10, 12, S[1]); box(g, -5, -4, 3, 12, S[3]); box(g, 3, -4, 2, 12, S[0]);
  box(g, -6, 8, 12, 3, INK); box(g, -5, 8, 10, 2, on ? mix(gel, '#FFFFFF', 0.5) : mix(gel, INK, 0.4));
  if (on) box(g, -3, 8, 4, 1, '#FFFFFF');
  g.restore();
};

/** A light cone off a lamp (live, after dark): banded, thinner as it spreads, from (x, y) down to the floor at y1. */
export const cone = (c: Ctx, x: number, y: number, y1: number, w0: number, w1: number, col: string, a: number, lean = 0) => {
  if (a <= 0.01) return;
  const [r, gg, b] = [1, 3, 5].map(i => parseInt(col.slice(i, i + 2), 16));
  const n = 4;
  for (let k = 0; k < n; k++) {
    const u0 = k / n, u1 = (k + 1) / n;
    const ya = y + (y1 - y) * u0, yb = y + (y1 - y) * u1;
    const wa = w0 + (w1 - w0) * u0, wb = w0 + (w1 - w0) * u1;
    const xa = x + lean * u0, xb = x + lean * u1;
    c.fillStyle = `rgba(${r}, ${gg}, ${b}, ${(a * (1 - u0 * 0.6)).toFixed(3)})`;
    c.beginPath(); c.moveTo(xa - wa / 2, ya); c.lineTo(xa + wa / 2, ya); c.lineTo(xb + wb / 2, yb); c.lineTo(xb - wb / 2, yb); c.closePath(); c.fill();
  }
};

/** Bunting: a sagging line from (x0, y0) to (x1, y1), pennants down it in `cols`. */
export const bunting = (g: Ctx, x0: number, y0: number, x1: number, y1: number, sag: number, cols: string[]) => {
  const n = Math.max(2, Math.round(Math.abs(x1 - x0) / 14));
  const pt = (u: number): [number, number] => [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u + sag * 4 * u * (1 - u)];
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath();
  for (let k = 0; k <= 24; k++) { const [x, y] = pt(k / 24); k ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke();
  for (let k = 0; k < n; k++) {
    const [x, y] = pt((k + 0.5) / n), col = cols[k % cols.length], P = ramp6(col);
    poly(g, [[x - 5, y], [x + 5, y], [x, y + 10]], INK);
    poly(g, [[x - 4, y + 1], [x + 4, y + 1], [x, y + 8]], P[3]);
    poly(g, [[x - 4, y + 1], [x - 1, y + 1], [x - 1, y + 5]], P[4]);
  }
};

/** Stepped smoke puffs (gray, thin) going up off something far off: a wisp. */
export const wisp = (c: Ctx, x: number, y: number, f: number, seed: number, s = 1) => {
  for (let k = 0; k < 5; k++) {
    const t = ((f * 0.3 + k * 40 + seed * 31) % 200) / 200, r = (3 + t * 14) * s;
    c.fillStyle = `rgba(70, 64, 64, ${(0.32 * (1 - t)).toFixed(2)})`;
    c.fillRect(Math.round(x - r + t * 36 * s), Math.round(y - t * 140 * s), Math.round(r * 2), Math.max(1, Math.round(r)));
  }
};

void signText; void signW; void signH; void glassOf; void lit; void slab; void post; void ball; void board; void deco; void bulbs; void paint;
void plain; void words; void PLY; void SAND; void BRASS; void STEVE; void CONCRETE; void ASPHALT; void IRON; void LIP; void dimmed; void skyAt;
void hourMix; void FIRE; void TRUSS; void SHELL; void CHAR; void tubeH; void tubeV; void truss; void chain; void flame; void smokeUp; void hazard;
