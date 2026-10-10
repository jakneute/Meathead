// The temple roof laid out: the temple (a stepped pyramid, four tiers; its roof the top of the top tier), the hole he
// comes up through, the ride's line at its foot, the way on. (index.ts runs it; art.ts paints it.)

import { SECTIONS, GY } from '../geometry';

export const { x0, x1 } = SECTIONS.roof;

export const BASE_L = x0 + 200, BASE_R = x0 + 1600, TIER_H = 140, TIER_IN = 110;
export const RY = GY - 4 * TIER_H;
export const ROOF_L = BASE_L + 3 * TIER_IN, ROOF_R = BASE_R - 3 * TIER_IN;
/** Where he comes up through it (the cart's ramp puts him under here). */
export const HOLE_X = x0 + 620;
export const HOLE_W = 80;
export const TILE = 20;
/** The view pulled out: how far, about where (to the middle of the screen). */
export const ZOOM_TO = 0.38, ZOOM_X = x0 + 1190, ZOOM_Y = GY - 290;
export const TILES = Math.round((ROOF_R - ROOF_L) / TILE);
/** The ride's line, outside, on the ground to the right (he lands at the head of it). */
export const LINE_L = BASE_R + 110, LINE_R = LINE_L + 400;
/** Where he splats, at the foot of the temple's right side; and where the way on is (past the line). */
export const SPLAT_X = BASE_R + 50, EXIT_X = x1 - 150;
/** The ride's entrance, in the foot of the temple's face (where the line goes in). */
export const DOOR_X = BASE_R - 120, DOOR_W = 80, DOOR_H = 110;

/** The front of the line (along the rope, nearest him): who they are (temple/people.ts seeds), where. */
export const GUESTS = Array.from({ length: 11 }, (_, i) => {
  const r = (n: number) => { const s = Math.sin((i + 1) * 91.7 + n * 13.3) * 43758.5; return s - Math.floor(s); };
  return {
    x: LINE_L + 10 + i * 36 + r(1) * 8,
    seed: 17 + i * 23 + Math.floor(r(2) * 9),
    woman: r(3) < 0.5,
    /** How tall (for the words over them). */
    h: 80,
  };
});
/** Which of them say things: a woman, a man. */
export const SPEAKER_F = GUESTS.findIndex(g => g.woman), SPEAKER_M = GUESTS.findIndex(g => !g.woman);
