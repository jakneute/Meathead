// The ballroom laid out: the foyer (the coat check, the buffet, the folding chairs), then the dance floor: Donnie's
// arena (the view's fixed on all of it for the fight), the stage and the DJ booth's wall at its far end.

import { SECTIONS } from '../geometry';

export const { x0, x1 } = SECTIONS.ballroom;
/** The fight's bounds: the velvet rope's gate that goes up behind him, the stage wall. 800 wide: one screen. */
export const ARENA_L = x0 + 760, ARENA_R = ARENA_L + 800;
export const ARENA_MID = (ARENA_L + ARENA_R) / 2;
/** Where the circle opens in the dance floor. */
export const CIRCLE_X = ARENA_MID + 60;
/** Walking in past here starts it. */
export const TRIGGER_X = ARENA_L + 130;
