// Hollywood Land, laid out: every section of the stage in its own stretch of the world, left to right, far from
// everything else (from HWX on, well clear of Space Land's SPX). He walks from one into the next; where the story cuts
// (the coaster's launch through the warehouse wall, in at Disaster: The Ride's doors, the tornado's fling onto the
// stunt stage) he's moved on to the next one's stretch.
//
// Budget: the whole land plays about as long as Adventure Land (~76500 world px of sections, plus cutscenes and the
// boss). Hollywood Land's shares (world px of play; rides and vertical parts counted by how long they take to play,
// not their x width): blvd 11500, coaster 15000 (riding + three stops), warehouse 12500, lot 9000, disaster 6000,
// havoc 22000 (incl. the flood climb, up in -y), stunt 3000 (the arena) = ~79000. See OWNERSHIP.md.
//
// The gaps between sections are generous on purpose (3000 each): each section's owner can grow theirs to the right
// (x1) without touching anybody else's. Vertical parts (havoc's flood climb) use y, not x: up is negative y from GY, as
// far as they like.
//
// Shared file (see OWNERSHIP.md): section owners may only append minimally (say, widen their own x1 into the gap
// after it), and must re-read it before editing.

import { GROUND_Y } from '../../m1/constants';

export const GY = GROUND_Y;
/** Where Hollywood Land starts in the world. */
export const HWX = 500000;

/** The sections, in order: where each runs (world x). */
export const SECTIONS = {
  /** Hollywood Blvd (a cheap imitation of it): the Walk of Fame, the impersonator hustlers; teaches the stunt wires. */
  blvd: { x0: HWX, x1: HWX + 11500 },
  /** THRONES OF THE STARS: the line skipped, three rides and three toilet stops, the booth's lever, the launch. */
  // (x1 widened into the gap: the launch's flight off the end of the track, over the warehouse's way)
  coaster: { x0: HWX + 14500, x1: HWX + 31500 },
  /** The secret warehouse: the burst-in, the green-screen sets, the Ensemble Cast sub-boss, the script kicked. */
  warehouse: { x0: HWX + 32500, x1: HWX + 45000 },
  /** The backlot: the second outdoor stretch, up to Disaster: The Ride. */
  lot: { x0: HWX + 48000, x1: HWX + 57000 },
  /** DISASTER: THE RIDE: the lame room, the screen, the narrator's loop; the booth's lever (REAL DISASTERS). */
  disaster: { x0: HWX + 60000, x1: HWX + 66000 },
  /** Every disaster at once: wind, lava rivers, crumbling buildings, the flood climb, the tornado chase, the fling. */
  // (x1 widened into the gap: the blizzard downhill made longer, the tornado chase after it)
  havoc: { x0: HWX + 69000, x1: HWX + 91000 },
  /** STUNTMAN STEVE'S STUPENDOUS STUNTERY: the stunt stage, the boss (the skeleton's stand-in for now). */
  stunt: { x0: HWX + 91500, x1: HWX + 94500 },
} as const;
export type HollywoodId = keyof typeof SECTIONS;
export const SECTION_ORDER: HollywoodId[] = ['blvd', 'coaster', 'warehouse', 'lot', 'disaster', 'havoc', 'stunt'];

/** The ways between sections (the crude first pass: each section's owner can move their own): where he's put coming
 *  into each one from the one before it (start), and coming back into it from the one after it (end). Feet (x, y). */
export const DOORS: Record<HollywoodId, { start: { x: number; y: number }; end: { x: number; y: number } }> = {
  blvd: { start: { x: SECTIONS.blvd.x0 + 200, y: GY }, end: { x: SECTIONS.blvd.x1 - 250, y: GY } },
  // (the coaster's launch is one-way: back in from the warehouse, he's put at the third stop, by the booth (the ride
  // back down to the station is the coaster owner's call; walking out the stop's service stairs works too))
  // (end: stop 3's deck, under the control booth (coaster/layout.ts STOPS[2], BOOTH))
  coaster: { start: { x: SECTIONS.coaster.x0 + 200, y: GY }, end: { x: SECTIONS.coaster.x0 + 14050, y: GY - 1100 } },
  // (end: back in from the lot through the bulldozer's hole, just inside the far wall of the one-screen main stage
  // (warehouse/layout.ts FAR_WALL))
  warehouse: { start: { x: SECTIONS.warehouse.x0 + 200, y: GY }, end: { x: SECTIONS.warehouse.x0 + 10580, y: GY } },
  lot: { start: { x: SECTIONS.lot.x0 + 200, y: GY }, end: { x: SECTIONS.lot.x1 - 250, y: GY } },
  disaster: { start: { x: SECTIONS.disaster.x0 + 200, y: GY }, end: { x: SECTIONS.disaster.x1 - 250, y: GY } },
  // (the fling is one-way: back in from the stunt stage, he's put where the tornado caught him (havoc's end, on the
  // ground); the havoc owner keeps that spot reachable on foot both ways)
  havoc: { start: { x: SECTIONS.havoc.x0 + 200, y: GY }, end: { x: SECTIONS.havoc.x1 - 250, y: GY } },
  stunt: { start: { x: SECTIONS.stunt.x0 + 200, y: GY }, end: { x: SECTIONS.stunt.x1 - 250, y: GY } },
};
/** The section before and after one (null: the land's start, the boss's arena). */
export const prevOf = (id: HollywoodId): HollywoodId | null => SECTION_ORDER[SECTION_ORDER.indexOf(id) - 1] ?? null;
export const nextOf = (id: HollywoodId): HollywoodId | null => SECTION_ORDER[SECTION_ORDER.indexOf(id) + 1] ?? null;

/** The warehouse's far wall, seen from outside at the lot's start: where the bulldozer CRASHED through it (a jagged
 *  smashed hole, siding and rebar torn outward, rubble strewn toward the dumpster), world x of the wall's outside face
 *  and the hole's span. The lot's owner draws it; the warehouse's bulldozer push comes out of it (its cutscene can cut
 *  to here: the pile shoved out through the hole and into the dumpster). */
export const LOT_WALL_BREAK = { x: SECTIONS.lot.x0 + 90, hole: { x0: SECTIONS.lot.x0 - 40, x1: SECTIONS.lot.x0 + 90, top: GY - 230 } } as const;
/** The dumpster the dead Revengers end up in (the lot's first set piece; set back against the warehouse, walked past,
 *  not stood on): world x of its two ends, its rim's height. The bulldozer's left crashed into its left end. */
export const LOT_DUMPSTER = { x0: SECTIONS.lot.x0 + 420, x1: SECTIONS.lot.x0 + 700, top: GY - 120 } as const;
