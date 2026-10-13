// The orbit's numbers: where the shooter happens (high over the section's ground, out of sight of it), how fast the
// screen scrolls, where it stops for the saucer, and the checkpoints along the way.

import { SECTIONS, GY } from '../geometry';

export const X0 = SECTIONS.orbit.x0, X1 = SECTIONS.orbit.x1;
/** The camera's top in flight: the whole shooter's in the 600 px under it (the section's ground is far below). */
export const CY = GY - 550 - 2400;
/** Screen size. */
export const W = 800, H = 600;
/** The screen's scroll (world px a frame): ~105 px a second. */
export const SCROLL = 1.75;
/** Where the scrolling stops: the saucer's arena (the camera's x). ~18800 px of scroll: ~3 minutes. */
export const ARENA_CAM = X1 - 1200;
/** His feet's y where he starts again at a checkpoint (the middle of the screen, about). */
export const FLY_Y = CY + 330;
/** Where on the screen he's put starting again (his middle). */
export const START_SX = 250;

/** World x from a camera offset into the section (offset 0: the camera at X0). */
export const at = (off: number) => X0 + off;

/** His flying: top speed (px a frame), how quickly he gets to it, and how close to the screen's edges he can go. */
export const FLY_SPEED = 5.6, FLY_ACCEL = 0.22;
export const EDGE_L = 8, EDGE_R = 8, EDGE_T = 34, EDGE_B = 6;
/** The ray gun in space: frames between bolts at most (the ground's is 12). */
export const RAPID_COOLDOWN = 4;
