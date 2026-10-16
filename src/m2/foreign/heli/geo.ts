// The helicopter's numbers: the helipad on the end of the streets (world x from the section's start), and the flight
// field high over it (one fixed screen: the camera doesn't scroll, the world goes by instead, round the giant globe).

import { SECTIONS, GY } from '../geometry';

export const { x0, x1 } = SECTIONS.heli;
export const X = (rx: number) => x0 + rx;
export { GY };

/** The helipad: the refill and its checkpoint, the queue's rails (from..to), where he's taken for boarding, the pad. */
export const REFILL = 420, CP_PAD = 520, QUEUE_A = 700, QUEUE_B = 1300, BOARD_AT = 1340, PAD_X = 1520;
/** The helicopter on the pad: its origin (the cabin's floor, under the middle of it). */
export const PAD_O = { x: X(PAD_X), y: GY - 22 };
/** His seat (feet) from the helicopter's origin: the back seat on the tour, the pilot's seat once he's jacked it. */
export const SEAT_BACK = -26, SEAT_FRONT = 28;

/** The flight's camera (fixed: its top-left, world). Far over the helipad, out of sight of it. */
export const CAMX = X(1100), CY = GY - 550 - 2400;
export const W = 800, H = 600;
/** Screen to world. */
export const wx = (sx: number) => CAMX + sx, wy = (sy: number) => CY + sy;

/** His flying: top speed, how quickly he gets to it; where his feet are kept (screen). */
export const FLY_SPEED = 5.4, FLY_ACCEL = 0.22;
export const FEET_X0 = 150, FEET_X1 = 770, FEET_Y0 = 120, FEET_Y1 = 560;

/** The giant globe (screen space): its middle, its radius, and how far round (radians from its top) the landmark he's
 *  fighting stands. Upcoming ones stand further round ahead of it (smaller: further off), beaten ones roll away behind. */
export const GLOBE = { cx: 380, cy: 1290, r: 820 };
export const THETA_F = Math.asin((620 - GLOBE.cx) / GLOBE.r);
/** A point on the globe's surface at angle `t` (from its top, clockwise): screen. */
export const onGlobe = (t: number) => ({ x: GLOBE.cx + Math.sin(t) * GLOBE.r, y: GLOBE.cy - Math.cos(t) * GLOBE.r });
/** Where the landmark he's fighting stands (its base: world). */
export const BASE = { x: wx(onGlobe(THETA_F).x), y: wy(onGlobe(THETA_F).y) };
/** Mech legs: how tall (every landmark stands on a pair). */
export const LEG = 54;

/** Checkpoints: the pad (110), then each landmark (111 the Eiffel Tower .. 119 the Easter Island head). Out of reach of
 *  the flight (the camera's fixed well left of them): only ever set by the shooter itself. */
export const CP_X = X(2900);
export const MEMO = {
  /** The gauntlet's over (the crash): the ride's gone for good. */
  done: 'm2:fl_heli_done',
  /** He's said his piece taking the controls, once a run. */
  took: 'm2:fl_heli_took',
  /** The controls card shown (once a run). */
  tips: 'm2:fl_heli_tips',
  /** How many landmarks are wrecked on the globe (Harry's arena shows them all). */
  wrecks: 'm2:fl_heli_wrecks',
} as const;
