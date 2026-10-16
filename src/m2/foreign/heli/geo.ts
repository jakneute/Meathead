// The helicopter's numbers: the helipad on the end of the streets (world x from the section's start), and the flight
// field high over it (one fixed view, zoomed out: the camera doesn't scroll; the park goes round below instead).

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

/** The flight, zoomed out (the user: "it should look more zoomed out"; the park laid out below and around it): the
 *  stage's zoom at Z, so the field (world) is the screen over Z. Its top-left is (CAMX, CY), far over the helipad, out
 *  of sight of it; the engine's camera sits where a zoom about the screen's middle shows exactly that (CAM_FLY). */
export const Z = 0.65;
export const SW = 800, SH = 600;
export const W = SW / Z, H = SH / Z;
export const CAMX = X(1100), CY = GY - 550 - 2400;
export const CAM_FLY = { x: CAMX + (W - SW) / 2, y: CY + (H - SH) / 2 };
/** The flight's screen to world and back (the screen at the flight's zoom; the camera at CAM_FLY). */
export const toWorld = (sx: number, sy: number) => ({ x: CAMX + sx / Z, y: CY + sy / Z });
export const toScreen = (wx: number, wy: number) => ({ x: (wx - CAMX) * Z, y: (wy - CY) * Z });
/** The patterns and the lackeys' spots were laid out on an 800x600 screen at 1:1: those places, in the field. */
export const S = 1 / Z;
export const fx = (sx: number) => CAMX + sx * S, fy = (sy: number) => CY + sy * S;

/** His flying: top speed, how quickly he gets to it; where his feet are kept (field, from its top-left). */
export const FLY_SPEED = 5.4, FLY_ACCEL = 0.22;
export const FEET_X0 = 110 / Z, FEET_X1 = 780 / Z, FEET_Y0 = 112 / Z, FEET_Y1 = 586 / Z;

/** Where the landmark he's fighting stands (its base, on the circuit: screen, then world). The park's camera (park.ts)
 *  is fitted so the landmark round in front lands exactly here at the field's own scale. */
export const BASE_SCREEN = { x: 600, y: 505 };
export const BASE = toWorld(BASE_SCREEN.x, BASE_SCREEN.y);
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
  /** How many landmarks are wrecked round the circuit (Harry's arena shows them all). */
  wrecks: 'm2:fl_heli_wrecks',
} as const;
