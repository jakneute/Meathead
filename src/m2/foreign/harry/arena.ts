// HELICOPTER HARRY's arena laid out: the crash site. The helicopter came down in the AMERICA pavilion's construction
// site (THE ONLY COUNTRY: COMING SOON), off the end of the ride's flight path: he comes to by the burning wreck at the
// left (DOORS.harry.start), the big health and ammo a few steps on, then the fight's floor, ONE screen wide (Contra's
// way: Harry clings to the walls at both ends and sweeps the whole floor), between two scaffold towers. The left one's
// gate (open on the way in) slams shut once it starts. Behind the floor: the berm of the dig with the gauntlet's nine
// wrecked landmark mechs strewn along it and on the rise behind (all in shot), and behind that, risen out of the dig,
// the STATUE OF LIBERTY (only her head and upper body in frame: huge).
//
// Screen rows: his feet at CAM_ROW (low: her up over it all). World y from GY; the statue's in world space too.

import { SECTIONS, GY } from '../geometry';

export { GY };
export const { x0, x1 } = SECTIONS.harry;
export const X = (rx: number) => x0 + rx;

/** His feet on the screen in here (low: the statue's head and shoulders up over the floor). */
export const CAM_ROW = 520;
/** The fight's one screen: the camera's x for it, its walls' faces (the scaffold towers in shot at both edges). */
export const VIEW_X = X(640);
export const WALL_W = 56;
export const ARENA_L = VIEW_X + WALL_W, ARENA_R = VIEW_X + 800 - WALL_W, ARENA_W = ARENA_R - ARENA_L;
export const MID = VIEW_X + 400;
/** A point on the screen (in the fight's shot) in the world. */
export const sy = (screenY: number) => GY - CAM_ROW + screenY;

/** Where he comes to (the crash), the wreck of the helicopter, the refill (big health and ammo before it starts). */
export const LAND_X = X(200), WRECK_X = X(70), REFILL_X = X(420);

/** Harry on a wall: how high his feet hang off the floor, how far off the wall's face. */
export const CLING_H = 300, CLING_IN = 20;
/** Harry in her crown: drawn this big (it's far back), his feet out of sight in it, his head and shoulders up in its
 *  middle window (WINDOW: its box on the screen's rows). */
export const CROWN_SCALE = 0.8;
export const WINDOW = { x0: MID - 28, x1: MID + 28, y0: sy(92), y1: sy(132) };
export const CROWN = { x: MID, y: sy(104) + 86 * CROWN_SCALE };

/** The statue: her middle, her head's middle, her shoulders (her right on screen left: the torch arm; her left on
 *  screen right: the tablet), how long each bone of an arm is. Risen: `rise` 0; under the dig: `rise` 1. */
export const LIB = {
  x: MID,
  head: { x: MID, y: sy(170) },
  mouth: { x: MID, y: sy(214) },
  shR: { x: MID - 236, y: sy(334) },
  shL: { x: MID + 236, y: sy(334) },
  upper: 300, fore: 300,
  /** How far down she sinks into the dig, risen to fallen (world px). */
  sink: 560,
};
/** Her right fist, held up (the torch over her head, off the top of the shot). */
export const FIST_UP = { x: MID - 300, y: sy(-60) };
/** The fist's size (it only hurts landing on him; stuck, it's just there: no collision). */
export const FIST_W = 112, FIST_H = 74;
/** The berm along the back of the floor (her below it is out of sight). */
export const BERM_Y = sy(452);
