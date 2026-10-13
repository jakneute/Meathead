// Space Needle 2, laid out (world x, from the section's start): the lobby at its foot, the lift car (where he rides
// up: a stretch of its own, the camera held on it), and the observation deck (the cylinder: a ring with a start and an
// end, wrapped round a turning cylinder seen from inside). Feet on GY throughout.

import { SECTIONS, GY } from '../geometry';

export const { x0: NX0, x1: NX1 } = SECTIONS.needle;
export { GY };

/** The lobby: its left end (the way back out onto the drag), the lift's doors, its right wall. */
export const LOBBY0 = NX0, LIFT_X = NX0 + 940, LOBBY1 = NX0 + 1100;
/** The lift car (riding up): its walls, its middle. */
export const CAR0 = NX0 + 1500, CAR1 = NX0 + 1800, CAR_X = (CAR0 + CAR1) / 2;
/** The deck: its start (the bulkhead, the suit's case by it) and end (the big window), the lift's doors in the middle. */
export const D0 = NX0 + 2400, D1 = NX0 + 5100, DECK_LIFT = NX0 + 3750;
/** The ring it's wrapped round (seen from inside): its radius, and all the way round (the gap past the window and
 *  before the bulkhead is outside: space). */
export const RING_R = 500, RING_C = Math.round(2 * Math.PI * RING_R);
/** Where the horizon sits on screen in the deck (the inside cylinder bends about it), and his feet. */
export const DECK_HORIZON = 300, DECK_ROW = 500;
/** The deck's ceiling (world y). */
export const CEIL = GY - 430;
/** The suit's case (its middle). */
export const CASE_X = D0 + 150;
/** The outer wall in slots, SLOT wide from the deck's start: 0 the suit's (no window), the lift's (no window), the last
 *  one the big window (glass floor to ceiling, and the end of the deck glass too); the rest a window each. */
export const SLOT = 300, SLOTS = Math.round((D1 - D0) / SLOT);
export const slotX = (k: number) => D0 + SLOT * k + SLOT / 2;
export const LIFT_SLOT = Math.round((DECK_LIFT - D0 - SLOT / 2) / SLOT);
export type SlotKind = 'suit' | 'window' | 'lift' | 'big';
export const slotKind = (k: number): SlotKind => (k === 0 ? 'suit' : k === LIFT_SLOT ? 'lift' : k === SLOTS - 1 ? 'big' : 'window');
/** The windows' openings (from a slot's middle): half their width, their top and bottom (world y), their corners. */
export const WIN_HW = 104, WIN_TOP = GY - 352, WIN_BOT = GY - 104, WIN_R = 30;
/** The PA's speakers (in the soffit, one a slot). */
export const SPEAKER_Y = CEIL + 40;
