// The dino park's layout (x from D, the section's left end; y up from GY): shared by the park (index.ts) and its art.

import { SECTIONS, GY } from '../geometry';

export const { x0, x1 } = SECTIONS.dino;
export const D = x0;

/** The pen: its back wall (the drain's mouth in it), its fence, the feeding platforms in it, the deck outside it. */
export const PEN_WALL = 30, DRAIN_Y = GY - 330, FENCE_X = D + 980, FENCE_TOP = GY - 240;
/** The maintenance booth, outside the pen (its window, the switch inside). */
export const BOOTH = { x: D + 1240, w: 180, top: GY - 140, win: { x: D + 1262, y: GY - 112, w: 64, h: 44 } };
/** The paddock's fences, the last fence, the temple's back door. */
export const PADDOCK_IN = D + 6100, PADDOCK_OUT = D + 8500, PADDOCK_TOP = GY - 200;
export const LAST_FENCE = D + 10400, LAST_FENCE_TOP = GY - 110;
/** The temple (its back): a huge stepped pyramid, from just past the last fence to the end of the park; how far the
 *  camera pulls out coming up on it. */
export const TEMPLE_L = D + 10480, TEMPLE_R = D + 11900, TIERS = 8, TIER_H = 90, TEMPLE_ZOOM_OUT = 0.45;
export const TEMPLE_DOOR_X = D + 10850;
/** Where he comes out, back from the temple through its back door. */
export const DINO_BACK_DOOR_X = D + 10760;

export const LEDGES: [number, number, number][] = [
  // the pen's feeding platforms, the viewing deck outside it
  [D + 620, GY - 100, 130], [D + 800, GY - 185, 150], [D + 1030, GY - 120, 170],
  // boardwalks over the trike field
  [D + 1550, GY - 130, 200], [D + 1850, GY - 220, 200], [D + 2150, GY - 130, 200],
  // the monorail (one long track over the gift shop) and a ledge up to it on the far side
  [D + 4100, GY - 280, 1600], [D + 5300, GY - 150, 120],
  // the paddock: in, the feeding platforms, out
  [D + 5960, GY - 110, 120], [D + 6200, GY - 110, 140], [D + 6600, GY - 190, 160], [D + 7100, GY - 290, 180], [D + 7600, GY - 190, 160], [D + 8340, GY - 110, 140], [D + 8560, GY - 110, 120],
  // the trees on the last stretch
  [D + 9000, GY - 140, 130], [D + 9250, GY - 245, 150], [D + 9520, GY - 140, 130], [D + 9900, GY - 180, 140],
];
/** Solid things: the volcano's steps, the gift shop, the fences, the pen wall. [x, top, w] (down to the ground). */
export const SOLIDS: [number, number, number, string][] = [
  [D, GY - 700, PEN_WALL, 'wall'],
  [FENCE_X, FENCE_TOP, 20, 'fence'],
  [D + 2550, GY - 100, 200, 'rock'], [D + 2750, GY - 210, 200, 'rock'], [D + 2950, GY - 320, 250, 'rock'], [D + 3200, GY - 430, 200, 'rock'],
  [D + 3400, GY - 300, 200, 'rock'], [D + 3600, GY - 170, 200, 'rock'],
  [D + 4300, GY - 150, 400, 'shop'],
  [PADDOCK_IN, PADDOCK_TOP, 20, 'fence'], [PADDOCK_OUT, PADDOCK_TOP, 20, 'fence'],
  [LAST_FENCE, LAST_FENCE_TOP, 20, 'fence'],
  [D + 10890, GY - 700, 200, 'temple'],
];

