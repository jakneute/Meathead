// The ballroom laid out: in through the kicked-in doors straight onto the dance floor, Donnie's arena (the view's fixed
// on all of it for the fight), the stage and the DJ booth's wall at its far end.

import { SECTIONS } from '../geometry';

export const { x0, x1 } = SECTIONS.ballroom;
/** The fight's bounds: the velvet rope's gate that goes up behind him, the stage wall. 800 wide: one screen. */
export const ARENA_L = x0 + 120, ARENA_R = ARENA_L + 800;
export const ARENA_MID = (ARENA_L + ARENA_R) / 2;
/** Where the circle opens in the dance floor. */
export const CIRCLE_X = ARENA_MID + 60;
/** Walking in past here starts it. */
export const TRIGGER_X = ARENA_L + 50;
/** The chandeliers he can stand on (x of the left end, height of the top off the floor, width), and the bandstand's riser. */
export const CHANDELIERS = [{ x: ARENA_L + 110, h: 150, w: 130 }, { x: ARENA_R - 270, h: 150, w: 130 }];
export const RISER = { x: ARENA_R - 120, h: 36, w: 120 };
