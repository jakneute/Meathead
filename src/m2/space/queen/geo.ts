// The queen section, laid out (world x). The antechamber (the refill, the boss's checkpoint), the doorway, the
// showpiece room: one screen wide (the camera's held on it once it's on), the glass and her stage at the right, the
// control booth up in the left wall.

import { SECTIONS, GY } from '../geometry';

export const { x0, x1 } = SECTIONS.queen;
/** The antechamber's right end (the doorway into the room). */
export const ANTE_R = x0 + 740;
/** The big health and ammo, in the antechamber. */
export const REFILL_X = x0 + 470;
/** The room: its walls (one screen). */
export const ARENA_L = x0 + 760, ARENA_R = ARENA_L + 800;
/** Walking this far in, it starts. */
export const TRIGGER_X = ARENA_L + 180;
/** Her plinth's middle; the glass panel in front of her. */
export const QUEEN_X = ARENA_R - 220;
export const GLASS_X = QUEEN_X - 150;
/** The control booth's window (up in the wall, clear of the HUD). */
export const BOOTH = { x: ARENA_L + 40, y: GY - 400, w: 240, h: 90 };
