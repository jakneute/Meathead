// The clearing laid out: the fallen trees, the temple's side, Artie's blind, the fight's bounds and its five bushes.

import { SECTIONS, GY } from '../geometry';

export const { x0, x1 } = SECTIONS.clearing;

/** The trees in a row (the first one's in his way), the temple's side past them, Artie's blind. */
// (the camp's stretch before the trees wide enough to take on his junior guides in)
export const TREE_X = Array.from({ length: 7 }, (_, i) => x0 + 1400 + i * 170);
export const TREE_H = 320;
export const TEMPLE_X = x0 + 2650;
export const BLIND_X = x0 + 2490, BLIND_Y = GY - 150;
/** The fight's bounds: the bamboo fence that goes up behind him, the temple's wall. The view's fixed on all of it. */
export const ARENA_L = TEMPLE_X - 800, ARENA_R = TEMPLE_X - 20;
export const VIEW_L = ARENA_L - 10, VIEW_R = VIEW_L + 800;
export const ARENA_MID = (ARENA_L + ARENA_R) / 2;
export const PICKUP_X = x0 + 1100;

/** The five bushes he plays his game in, end to end across the fight (their middles), how big. */
export const BUSH_W = 140, BUSH_H = 66;
export const BUSH_X = Array.from({ length: 5 }, (_, i) => ARENA_L + 78 + i * 156);
