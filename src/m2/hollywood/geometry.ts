// Hollywood Land, laid out: every section of the stage in its own stretch of the world, left to right, far from
// everything else (from HWX on, well clear of Space Land's SPX). He walks from one into the next; where the story cuts
// (the coaster's launch through the warehouse wall, in at Disaster: The Ride's doors, the tornado's fling onto the
// stunt stage) he's moved on to the next one's stretch.
//
// Budget: the whole land plays about as long as Adventure Land (~76500 world px of sections, plus cutscenes and the
// boss). Hollywood Land's shares (world px of play; rides and vertical parts counted by how long they take to play,
// not their x width): blvd 11500, coaster 15000 (riding + three stops), warehouse 12500, lot 9000, disaster 6000,
// havoc 19500 (incl. the flood climb, up in -y), stunt 3000 (the arena) = ~76500. See OWNERSHIP.md.
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
  coaster: { x0: HWX + 14500, x1: HWX + 29500 },
  /** The secret warehouse: the burst-in, the green-screen sets, the Ensemble Cast sub-boss, the script kicked. */
  warehouse: { x0: HWX + 32500, x1: HWX + 45000 },
  /** The backlot: the second outdoor stretch, up to Disaster: The Ride. */
  lot: { x0: HWX + 48000, x1: HWX + 57000 },
  /** DISASTER: THE RIDE: the lame room, the screen, the narrator's loop; the booth's lever (REAL DISASTERS). */
  disaster: { x0: HWX + 60000, x1: HWX + 66000 },
  /** Every disaster at once: wind, lava rivers, crumbling buildings, the flood climb, the tornado chase, the fling. */
  havoc: { x0: HWX + 69000, x1: HWX + 88500 },
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
  coaster: { start: { x: SECTIONS.coaster.x0 + 200, y: GY }, end: { x: SECTIONS.coaster.x1 - 250, y: GY } },
  warehouse: { start: { x: SECTIONS.warehouse.x0 + 200, y: GY }, end: { x: SECTIONS.warehouse.x1 - 250, y: GY } },
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
