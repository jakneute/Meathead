// The White House press room, where the finale's fought: one room, all of it on screen at once (the view's pulled
// right back), with a door at the foot of each side wall for the Secret Service and a window high up each side for
// the jetpack men. Everything's in world coordinates, the room's floor the same as every arena's (GROUND_Y).

import { ARENA_LEFT, FINALE_ARENA_RIGHT, GROUND_Y } from '../../../constants';

/** The inside faces of the side walls. */
export const ROOM_L = ARENA_LEFT, ROOM_R = FINALE_ARENA_RIGHT;
export const ROOM_W = ROOM_R - ROOM_L;
export const ROOM_MID = (ROOM_L + ROOM_R) / 2;
/** The underside of the ceiling, and the floor. */
export const ROOM_TOP = -150, FLOOR = GROUND_Y;

/** How thick the side walls show (their doors and windows are in them). */
export const WALL_T = 40;
/** The view: pulled back by SCALE about (VIEW_X, VIEW_Y), which is also where the camera sits (so all 1200 x 900 of it
 * is on the screen: the room and its side walls, its ceiling over it, a strip of carpet under the floor line). */
export const VIEW_SCALE = 2 / 3;
export const VIEW_X = ROOM_L - WALL_T, VIEW_Y = -290;
export const VIEW_W = 800 / VIEW_SCALE, VIEW_H = 600 / VIEW_SCALE;

/** The doors at the foot of each side wall (how tall), and the windows up each side (their top and bottom). */
export const DOOR_W = 64, DOOR_H = 132;
export const WINDOW_TOP = -60, WINDOW_BOTTOM = 150, WINDOW_W = 70;

/** The two camera risers (the press pool's platforms), one each side: somewhere to get up to him from. */
export const RISERS = [
  { x: ROOM_L + 150, y: 412, w: 190 },
  { x: ROOM_R - 340, y: 412, w: 190 },
];
export const RISER_H = 18;

/** Which side of the room an x is on (-1 left, 1 right). */
export const sideOf = (x: number): -1 | 1 => (x < ROOM_MID ? -1 : 1);
/** Just inside a side's door (where a man coming in through it first stands), and just outside it (gone). */
export const doorInside = (side: -1 | 1, w: number) => (side < 0 ? ROOM_L + 6 : ROOM_R - 6 - w);
export const doorOutside = (side: -1 | 1, w: number) => (side < 0 ? ROOM_L - w - 4 : ROOM_R + 4);
