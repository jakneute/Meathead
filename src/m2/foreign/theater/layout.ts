// CULTURES OF THE WORLD, laid out (x from the section's start; heights up from the promenade). One walk in from the
// streets, no cuts: the theater's front on the promenade, through its doors into the LOBBY (concessions, the posters,
// the big refill before the house doors), through those into the HOUSE (the side aisle, the seats in the foreground),
// up the steps onto THE STAGE (one screen: the sub-boss), and after the show out through the stage-right wing door,
// down into the backstage corridor and its EXIT (on to the helipad).

import { SECTIONS, GY } from '../geometry';

export const { x0, x1 } = SECTIONS.theater;
export const X = (rx: number) => x0 + rx;
export const Y = (h: number) => GY - h;
export { GY };

/** The building's left wall (the street doors through it), the lobby, the house doors. */
export const DOOR = 720, DOOR_W = 40, LOBBY_A = DOOR + DOOR_W, HOUSE_DOOR = 1440, HOUSE_DOOR_W = 30;
/** The lobby's refill (big health + ammo, before the house doors) and its checkpoint. */
export const REFILL = 1330;
/** The aisle's steps up to the stage, the stage (SA..SB: one screen), the stage-right wing, the steps down backstage. */
export const STEPS_A = 1580, SA = 1650, SB = SA + 800, WING_B = 2550, STEPS_B = 2620;
/** How high the stage stands over the house floor. */
export const STAGE_H = 60;
export const FY = Y(STAGE_H);
/** How far onto the stage he walks before the show starts on him (the volunteer). */
export const TRIGGER = SA + 150;
/** The proscenium's opening: its top (height over the stage floor). */
export const ARCH_H = 340;
/** Where his feet sit on screen in the house and on the stage (higher than the streets': the seats are in front). */
export const HOUSE_ROW = 400;
/** Where the showpieces keep to (world x), well inside the stage's ends. */
export const L = X(SA) + 34, R = X(SB) - 34;
export const MID = (L + R) / 2;

/** The show, done (kept across his deaths: never again once it's over). */
export const SHOW_MEMO = 'm2:fl_theater_show';

export const CHECKPOINTS = [
  { name: 'CULTURES OF THE WORLD', cp: 100, x: X(300), y: GY },
  { name: 'CULTURES OF THE WORLD: THE LOBBY', cp: 101, x: X(REFILL - 140), y: GY },
  { name: 'CULTURES OF THE WORLD: BACKSTAGE', cp: 102, x: X(2700), y: GY },
];
