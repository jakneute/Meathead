// The stunt stage laid out: STUNTMAN STEVE'S STUPENDOUS STUNTERY, an amphitheater's floor (a semicircle, extra wide:
// two and a half screens), the play plane along it, a back lane behind (where the ramps run) and a front lane in front
// (where cars swing round him), the upstage garage doors the posse drives out of, the overhead truss the hoops hang
// off, the walls at both ends and a ceiling over it (he's never knocked out of it).
//
// Fake 3D: depth z (0 the play plane, + toward the camera) puts a thing ZK px down the screen per unit; anything with
// z < CUT is drawn behind him, the rest in front.

import { SECTIONS, GY } from '../geometry';

export { GY };
export const { x0, x1 } = SECTIONS.stunt;
/** The fight's floor: its walls (the stacked-tire crash barriers) and how wide (extra wide: 2.5 screens). */
export const ARENA_L = x0 + 100, ARENA_W = 2000, ARENA_R = ARENA_L + ARENA_W;
export const ARENA_MID = (ARENA_L + ARENA_R) / 2;
/** The truss's ceiling: launched up, he bangs his head on it, never out over the top. */
export const CEIL_Y = GY - 720;
/** Depth: px down the screen per unit of z; the lanes; the upstage doors' depth; drawn behind him below this. */
export const ZK = 0.45, BACK_Z = -150, LANE_BACK = -70, LANE_FRONT = 70, CUT = 8;
/** The floor's far edge (the set's foot, upstage) and the front barrier (downstage, the crowd behind it). */
export const FLOOR_BACK_Y = GY + BACK_Z * ZK - 4, BARRIER_Y = GY + 96;
/** The upstage garage doors the posse comes out of (and goes back into). */
export const DOORS_X = [ARENA_L + 230, ARENA_L + 760, ARENA_R - 760, ARENA_R - 230];
/** Where Steve stands, by which end he's at (-1 the left, +1 the right). */
export const STEVE_AT = (side: 1 | -1) => (side > 0 ? ARENA_R - 80 : ARENA_L + 80);
/** The overhead truss (the hoops' trolleys run along it). */
export const TRUSS_Y = GY - 560;
/** His feet on the screen in here (lower than usual: the floor in front, the crowd, in view). */
export const CAM_ROW = 455;
/** Where the refill is, by the way in (big health and ammo before it starts). */
export const REFILL_X = x0 + 150;
