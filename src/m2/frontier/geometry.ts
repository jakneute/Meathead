// Wilderness Land (land id `frontier`), laid out: every section of the stage in its own stretch of the world, left to
// right, far from everything else (from FRX on, well clear of Foreign Lands' FLX). He walks from one into the next where
// the story walks (the wilds into the station); where it cuts (the train speeding off, the crash into the town, the
// woodchipper, the bike's chase) he's moved on to the next one's stretch.
//
// Budget (the user: every land about as long to play as Jungle Land, ~76500 px of play): the wilds ~21000 (platform
// heavy and slow going: about a third of the land by play time), the train ~12000 (played by time: running the cars),
// the town and the mines ~11000, the log ride ~9000 (a ride: counted by time), the woods ~3000, the dirt-bike chase
// ~10000 (its own view: counted by time), the catch-up and Tucker's arena ~4000 = ~70000 + the cutscenes and two fights.
// See OWNERSHIP.md.
//
// The gaps between sections are generous on purpose (3000 each): each section's owner can grow theirs to the right
// (x1) without touching anybody else's. Vertical parts (the mines' shafts) go up or down in y from GY.
//
// Shared file (see OWNERSHIP.md): section owners may only append minimally (say, widen their own x1 into the gap after
// it), and must re-read it before editing.

import { GROUND_Y } from '../../m1/constants';

export const GY = GROUND_Y;
/** Where Wilderness Land starts in the world. */
export const FRX = 700000;

/** The sections, in order: where each runs (world x). */
export const SECTIONS = {
  /** THE FRONTIER (the park's version of the wilderness): bear traps, wildlife, the ROLLING LOGS taught and built
   *  round, the rapids, the long log down to the falls; at its end, the remote train station and TUCKER. */
  wilds: { x0: FRX, x1: FRX + 21000 },
  /** THE TRAIN: on at the caboose, car by car to the engine (cars to go through, cars only to cross on top, cars
   *  uncoupled behind him, tunnels getting thicker); the KILL arrow, the shot through the eye, the crash. */
  train: { x0: FRX + 24000, x1: FRX + 36000 },
  /** THE MINING AND LOGGING TOWN (the crash stop) and THE MINES: the townsfolk, through the town and down the mines. */
  town: { x0: FRX + 39000, x1: FRX + 50000 },
  /** THE LOG RIDE: Tucker at the controls (the buzzsaw), the tracked ride and its saws, then the SEWER (way off the
   *  track), then out into a real river, which ends at the WOODCHIPPER. */
  logride: { x0: FRX + 53000, x1: FRX + 64600 },
  /** THE WOODS (outside the park): the kids on dirt bikes, "MINE", Tucker out of the leaf pile, the bounty. */
  woods: { x0: FRX + 65000, x1: FRX + 68000 },
  /** THE DIRT-BIKE CHASE: the TEENAGERS sub-boss, in a Genesis road-racer's view. */
  dirtbike: { x0: FRX + 71000, x1: FRX + 81000 },
  /** THE CATCH-UP and TUCKER's arena: the tree branch, the fake-out, the jumpscare; the fight (not designed yet). */
  arena: { x0: FRX + 84000, x1: FRX + 88000 },
} as const;
export type FrontierId = keyof typeof SECTIONS;
export const SECTION_ORDER: FrontierId[] = ['wilds', 'train', 'town', 'logride', 'woods', 'dirtbike', 'arena'];

/** The ways between sections (each section's owner can move their own): where he's put coming into each one from the
 *  one before it (start), and coming back into it from the one after it (end). Feet (x, y). */
export const DOORS: Record<FrontierId, { start: { x: number; y: number }; end: { x: number; y: number } }> =
  Object.fromEntries(SECTION_ORDER.map(id => [id, { start: { x: SECTIONS[id].x0 + 200, y: GY }, end: { x: SECTIONS[id].x1 - 250, y: GY } }])) as Record<FrontierId, { start: { x: number; y: number }; end: { x: number; y: number } }>;
// (back from the train: on the station's platform, which is up 40 off the ground: wilds/layout.ts STATION.deck)
DOORS.wilds.end = { x: SECTIONS.wilds.x1 - 250, y: GY - 40 };
/** The section before and after one (null: the land's start, the boss's arena). */
export const prevOf = (id: FrontierId): FrontierId | null => SECTION_ORDER[SECTION_ORDER.indexOf(id) - 1] ?? null;
export const nextOf = (id: FrontierId): FrontierId | null => SECTION_ORDER[SECTION_ORDER.indexOf(id) + 1] ?? null;
