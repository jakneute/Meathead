// DAD MAN LIVE!, laid out (x from the section's start; y is world y). The UBX AMPHITHEATER: a bowl dug into the hill,
// the stage at its foot. He comes in from the left along the top concourse (the marquee, the beer garden), down the
// aisle steps past the half-empty bleachers, across the pit (the empty front row, the boss-door refill), to the stage
// steps, where the SECURITY GUARD stands (the boss door: his nuts). Up the steps: the stage under its band shell, the
// sitcom living room set (the couch, the TV on its cart, the kitchen door), the cheap animatronic family and DAD MAN
// himself on the couch with a real beer.
//
//   0      THE GATE (cp 60): in from PUNCHY & KICKY's DAD MAN LIVE! gate; the marquee.
//   560    THE BEER GARDEN: the concession stand (COLD BEER), a high-top with two regulars at it.
//   1000   THE AISLE STEPS: down the bowl, two steps to a bleacher row, twelve rows; the crowd (what there is of it).
//   1960   THE PIT: the empty front row (RESERVED), litter; the boss-door refill (a big health, a big ammo).
//   2580   THE GUARD at the foot of the stage steps (a wall till he's down: the boss door). (cp 61 once he's down.)
//   2620   THE STAGE STEPS up to the deck.
//   2780   THE STAGE (cp 62, the fight's, set as the intro starts): the band shell, the set, the family, DAD MAN.
//
// The fake 3D (one eye: the middle of the screen; cartoon/studio's way): the play plane is depth 1; the bleacher rows,
// the pit's floor and the stage's deck run back from it to the bowl's far side (D_FAR); the stage's band shell (D_SHELL),
// the set's wall (D_SET), the furniture and the family each at their own depth in front of that.

import { SECTIONS, GY } from '../geometry';

export const x0 = SECTIONS.amphi.x0, x1 = SECTIONS.amphi.x1;
export const X = (rx: number) => x0 + rx;

// ---------------------------------------------------------------------------------------------------------------
// The ground

/** The concourse (the top of the bowl), the pit (its foot), the stage's deck. */
export const TOP_Y = GY;
export const PIT_Y = GY + 216;
export const STAGE_Y = PIT_Y - 64;
/** The aisle steps: from the concourse's edge down to the pit (two steps a bleacher row). */
export const AISLE = { a: 1000, b: 1960 };
export const ROWS = 12, ROW_W = (AISLE.b - AISLE.a) / ROWS, ROW_RISE = (PIT_Y - TOP_Y) / ROWS;
/** The stage steps: from the pit up onto the deck. */
export const STEPS = { a: 2620, b: 2780, n: 5 };
/** The stage's deck (its front edge; it runs on to the section's end). */
export const DECK_A = STEPS.b;
/** Feet's y on the ground at rx (the profile the runs lay). */
export const groundAt = (rx: number) => {
  if (rx <= AISLE.a) return TOP_Y;
  if (rx < AISLE.b) return TOP_Y + ((rx - AISLE.a) / (AISLE.b - AISLE.a)) * (PIT_Y - TOP_Y);
  if (rx <= STEPS.a) return PIT_Y;
  if (rx < STEPS.b) return PIT_Y + ((rx - STEPS.a) / (STEPS.b - STEPS.a)) * (STAGE_Y - PIT_Y);
  return STAGE_Y;
};
/** The drawn steps' tops (a stair's tread, flat) at rx: what the art lights. Where the engine puts his feet on its
 *  stairs (terrain.ts treadYAt: going down, each tread at the top of its stretch; going up, at the top too). */
export const treadAt = (rx: number) => {
  if (rx < AISLE.a) return TOP_Y;
  if (rx < AISLE.b) { const k = Math.floor((rx - AISLE.a) / (ROW_W / 2)); return TOP_Y + k * (ROW_RISE / 2); }
  if (rx < STEPS.a) return PIT_Y;
  if (rx < STEPS.b) { const k = Math.floor((rx - STEPS.a) / ((STEPS.b - STEPS.a) / STEPS.n)); return PIT_Y - (k + 1) * ((PIT_Y - STAGE_Y) / STEPS.n); }
  return STAGE_Y;
};

// ---------------------------------------------------------------------------------------------------------------
// Depths (the scale about the eye: 1 the play plane, less further back)

export const D_FAR = 0.7, D_SHELL = 0.74, D_SET = 0.8;

// ---------------------------------------------------------------------------------------------------------------
// What's where

/** The marquee at the gate; the concession stand; the high-top and its two regulars; the light poles. */
export const MARQUEE = 420;
export const STAND = { a: 560, b: 860 };
export const HIGHTOP = 930;
export const POLES = [180, 960, 1500, 2050];
/** The crowd: [row (0 the top), depth, who (a seed), what they're at]. Half empty, at best. */
export type Fan = 'asleep' | 'finger' | 'beer' | 'hat' | 'popcorn' | 'knit' | 'slump' | 'leaner';
export const CROWD: [number, number, number, Fan][] = [
  [1, 0.9, 11, 'asleep'], [2, 0.78, 4, 'knit'], [4, 0.94, 23, 'finger'], [5, 0.82, 8, 'hat'],
  [7, 0.88, 17, 'beer'], [8, 0.76, 31, 'leaner'], [8, 0.8, 30, 'slump'], [10, 0.92, 6, 'popcorn'],
];
/** Who's still there once it's all over (the land cleared): the one asleep. */
export const SLEEPER = 0;
/** The pit's front row (folding chairs: [rx, depth]), the RESERVED one. */
export const FRONT_ROW: [number, number][] = [[2010, 0.86], [2080, 0.86], [2150, 0.86], [2220, 0.86], [2290, 0.86], [2360, 0.86], [2430, 0.86]];
export const RESERVED = 2;
/** The boss-door refill, in the pit. */
export const REFILL_X = [2300, 2380];

/** The guard (his middle), and where the boss door's wall is (in front of him); where Meathead stops to kick. */
export const GUARD_X = 2580;
export const GUARD_WALL = { a: 2548, w: 46 };
export const KICK_AT = GUARD_X - 50;

/** The stage: the band shell over it, the set's wall, the furniture and the family (rx, depth). */
export const SHELL = { a: 2740, b: 4000 };
export const SET = { a: 2860, b: 3920 };
export const COUCH = { x: 3300, d: 0.9 };
export const DAD_SEAT = { x: 3346, d: 0.9 };
export const TV = { x: 2960, d: 0.94 };
export const MOM = { x: 3214, d: 0.86 };
export const GRAMPS = { x: 3560, d: 0.95 };
export const SIS = { x: 3132, d: 0.97 };
export const KITCHEN = { x: 3720 };
/** The Boy's floor track: from the couch's end (u 0) back to the kitchen door (u 1). */
export const BOY_TRACK = { a: { x: 3418, d: 0.94 }, b: { x: KITCHEN.x, d: D_SET + 0.012 } };
/** Where Meathead stops for the intro; where DAD MAN comes to, stood up, at the front (the play plane). */
export const MARK = 3010;
export const DAD_FRONT = 3230;
/** THE FIGHT: the arena (the deck from the top of the steps to the living room's right-hand wall, where the left one's
 *  flown in for it); the couch dragged up front onto the play plane (its middle); the fridge (avocado green) against
 *  the right-hand wall, a little back. */
export const ARENA = { a: DECK_A + 20, b: 3960 };
export const COUCH_HOME = 3330;
export const FRIDGE = { x: 3895, d: 0.93 };

// ---------------------------------------------------------------------------------------------------------------
// Checkpoints

export const CP_GATE = 60, CP_STEPS = 61, CP_DAD = 62;
