// THE GREAT PIXIE'S CHAMBERS, laid out: the hall outside her door (where the glass drops him), her door, and her
// bedroom (the arena: extra wide, three and a quarter screens, a princess's chambers), its furniture to stand on, its
// ceiling, where the camera sits. World x; heights up from the floor (GY).

import { SECTIONS, GY } from '../geometry';

export { GY };
export const { x0, x1 } = SECTIONS.bedroom;

/** The hall: in off the glass at its left end (DOORS.bedroom.start), the refill along it, her door at its right end. */
export const HALL_L = x0, DOOR_X = x0 + 960;
/** The big health and ammo before her door (the boss-door refill). */
export const REFILL_X = [x0 + 560, x0 + 650] as const;
/** Where he stops to kick it in. */
export const KICK_AT = DOOR_X - 80;

/** Her bedroom: its walls, its ceiling (the plumbing's in the space over it), its middle. */
export const ARENA_L = x0 + 1000, ARENA_W = 2600, ARENA_R = ARENA_L + ARENA_W, ARENA_MID = ARENA_L + ARENA_W / 2;
export const CEIL_Y = GY - 500;
/** The camera's top in here: the floor low on the screen, the ceiling just under the HUD's band (fixed: no bobbing
 *  up and down as he climbs the furniture). */
export const CAM_Y = GY - 540;
/** In the bedroom: x from its left wall. */
export const R = (x: number) => ARENA_L + x;

/** What's stood on in her bedroom (one-way, lit along the top): [x from its left wall, width, height, what]. The
 *  canopy comes down at the third slam. */
export const LEDGES: [number, number, number, 'canopy' | 'wardrobe' | 'ottoman' | 'balcony'][] = [
  [1480, 320, 205, 'canopy'],
  [1000, 130, 235, 'wardrobe'],
  [1880, 130, 235, 'wardrobe'],
  [2110, 90, 110, 'ottoman'],
  [2220, 340, 235, 'balcony'],
];

/** Her two chandeliers (x from its left wall): the one nearer him comes down at the fifth slam. */
export const CHANDELIERS = [700, 1950];
/** Where she lounges for the reveal (her chaise: near the door, so the two of them share the shot), her vanity, the
 *  trophy wall. */
export const CHAISE_X = R(600), VANITY_X = R(760), TROPHY_X = R(1190);
/** How many slams wreck the room as far as it goes (and what each one does: room.ts). */
export const MAX_STAGE = 6;

/** The checkpoints: in the hall (the refill there), and the fight's start (set as it starts). */
export const CP_HALL = 60, CP_FIGHT = 61;
