// The control room's layout: where things stand (shared by the section and its art).

import { SECTIONS } from '../geometry';

export const { x0, x1 } = SECTIONS.control;
/** Where he comes up through the floor (DOORS.control.start), Donnie's desk, the coat rack, the door out. */
export const HOLE_X = x0 + 200, DESK_X = x0 + 520, RACK_X = x0 + 650, ROOM_DOOR = x0 + 730;
/** The gift shop, from the room's door to the ballroom's doors (the big health and ammo just before them). */
export const SHOP_X = x0 + 790, BALL_DOOR = x1 - 70, PICKUP_X = x1 - 300;
/** Where Donnie stands at the mic. */
export const MIC_X = x0 + 470;
/** The wall between the room and the shop (the staff door in it): its two faces. */
export const PART_L = ROOM_DOOR - 48, PART_R = SHOP_X + 56;
