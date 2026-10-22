// The queen section, laid out (world x), left to right:
//
//   THE HOLD          the antechamber (the hold's checkpoint) and the showpiece room: one screen (the camera's held on
//                     it once it's on), her glass and her stage at the right, the control booth up in the left wall.
//                     She's taken over; she smashes the floor and down he goes (a hole there after: the way down again).
//   THE BASEMENT      the attraction's maintenance tunnels, deep under the hold (from under her floor on east), in the
//                     dark: two levels (the floor, the catwalks over it: ladders up, drop down), pipes, ride machinery,
//                     cast-member lockers, the animatronic graveyard. She stalks him through it (basement.ts). Stairs up
//                     at its left end (back up to the hold); at its east end a long flight of stairs up toward the park.
//   THE SPACE DISCO   GALACTIC GROOVE: its door at the top of the stairs (he kicks it in: the chase is over), the dance
//                     hall (extra wide; the big refill and the boss's checkpoint inside the door): the extinguisher
//                     cutscene, then the boss.

import { SECTIONS, GY } from '../geometry';

export const { x0, x1 } = SECTIONS.queen;
/** The antechamber's right end (the doorway into the showpiece room). */
export const ANTE_R = x0 + 740;
/** The showpiece room: its walls (one screen). */
export const ARENA_L = x0 + 760, ARENA_R = ARENA_L + 800;
/** Walking this far in, it starts. */
export const TRIGGER_X = ARENA_L + 180;
/** Her plinth's middle; the glass panel in front of her. */
export const QUEEN_X = ARENA_R - 220;
export const GLASS_X = QUEEN_X - 150;
/** The control booth's window (up in the wall, clear of the HUD). */
export const BOOTH = { x: ARENA_L + 40, y: GY - 400, w: 240, h: 90 };
/** The hole she smashed in the floor (after: walk into it and down he goes again). */
export const HOLE = { a: GLASS_X - 150, b: GLASS_X - 10 };

/** The basement: under the showpiece room and on east, deep (the fall through her floor's a long one): its floor, its
 *  catwalks' level, its ceiling (the underside of the hold's floor slab). Two levels, the whole height on one screen. */
export const BASE_L = x0 + 800;
export const BF = GY + 560, CATWALK_Y = BF - 250, CEIL_B = GY + 24;
/** The stairs up at its left end (back up to the hold); where he lands, falling in (under the hole). */
export const STAIRS_X = BASE_L + 60;
export const LAND_X = (HOLE.a + HOLE.b) / 2;
/** Its east end: the foot of the long flight of stairs up out of it, toward the park (the floor's level at the top). */
export const STAIRS_A = x0 + 7400, STAIRS_B = x0 + 8200;
export const BASE_R = STAIRS_A;
/** The stairs' height at x (the floor's y: BF at their foot, GY at their top). */
export const stairsY = (x: number) => (x <= STAIRS_A ? BF : x >= STAIRS_B ? GY : BF + ((x - STAIRS_A) / (STAIRS_B - STAIRS_A)) * (GY - BF));

/** The disco: its door at the top of the stairs (he kicks it in: the chase is over), the dance hall (extra wide: the
 *  camera follows him in it). (REFILL_X: the first-aid cabinet's alcove just inside the door, painted; the refill itself
 *  and the boss's checkpoint are outside the door now: DOOR_REFILL_X, DOOR_CP_X.) */
export const DOOR_X = STAIRS_B + 160;
export const DISCO_L = DOOR_X + 40, DISCO_R = DISCO_L + 1880;
export const REFILL_X = DISCO_L + 70;
/** The boss-door refill (big health, big ammo) and the boss's checkpoint: OUTSIDE the door, on the landing at the top
 *  of the stairs (the user's standing rule: dead in a boss fight, he's back outside its door and walks in himself). */
export const DOOR_REFILL_X = DOOR_X - 80, DOOR_CP_X = DOOR_X - 135;
/** Walking this far into the hall (in through the door, himself: the first time and back for another go), it's on. */
export const DISCO_TRIGGER = DISCO_L + 130;
/** Her two sides in the hall (her feet's middle): the left well in from the door, the right at the far end. */
export const DISCO_SIDES = { l: DISCO_L + 620, r: DISCO_R - 220 };
/** Where she first stands (the right); the fire extinguisher on the wall; the DJ booth (the operators: on screen with the cutscene). */
export const DISCO_QX = DISCO_SIDES.r;
export const EXTINGUISHER_X = DISCO_L + 420;
export const DJ = { x: DISCO_L + 500, y: GY - 340, w: 200, h: 80 };
/** The mirror ball. */
export const BALL = { x: DISCO_L + 1250, y: GY - 400 };
