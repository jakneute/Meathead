// The queen section, laid out (world x), left to right:
//
//   THE HOLD          the antechamber (the hold's checkpoint) and the showpiece room: one screen (the camera's held on
//                     it once it's on), her glass and her stage at the right, the control booth up in the left wall.
//                     She's taken over; she smashes the floor and down he goes (a hole there after: the way down again).
//   THE BASEMENT      the attraction's maintenance tunnels, in the dark: pipes, ride machinery, cast-member lockers, the
//                     animatronic graveyard. She hunts him through it (basement.ts). Stairs up at its left end (back
//                     up to the hold).
//   THE SPACE DISCO   GALACTIC GROOVE: its door at the basement's end (he kicks it in: the chase is over), the dance
//                     hall (one screen; the big refill and the boss's checkpoint inside the door): the extinguisher
//                     cutscene, then the (placeholder) boss.

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

/** The basement: its ends; the stairs up at its left end. */
export const BASE_L = x0 + 2200, BASE_R = x0 + 8000;
export const STAIRS_X = BASE_L + 60;
/** Where he lands, falling in. */
export const LAND_X = BASE_L + 260;

/** The disco: its door (the end of the basement: he kicks it in), the dance hall (one screen): the big refill and the
 *  boss's checkpoint just inside the door. */
export const DOOR_X = BASE_R;
export const DISCO_L = DOOR_X + 40, DISCO_R = DISCO_L + 800;
export const REFILL_X = DISCO_L + 70;
/** Walking this far into the hall (back for another go), it's on. */
export const DISCO_TRIGGER = DISCO_L + 220;
/** Where she stands in the hall (her feet's middle), the fire extinguisher on the wall, the DJ booth (the operators). */
export const DISCO_QX = DISCO_R - 200;
export const EXTINGUISHER_X = DISCO_L + 330;
export const DJ = { x: DISCO_L + 420, y: GY - 340, w: 200, h: 80 };
/** The mirror ball. */
export const BALL = { x: DISCO_L + 250, y: GY - 400 };
