// Space Land, laid out: every section of the stage in its own stretch of the world, left to right, far from
// everything else (from SPX on, well clear of Spooky Land's SX). He walks from one into the next; where the story cuts
// (in at the giant atom's doors, the hijacked train, the launch back out onto the main drag, up Space Needle 2 into
// actual space, the shooter, the UFO's crash) he's moved on to the next one's stretch.
//
// Budget: the whole land plays about as long as Adventure Land (~76500 world px of sections, plus cutscenes and the
// boss). Space Land's shares (world px of play; rides, the shooter and vertical parts counted by how long they take
// to play, not their x width): square 10000, atom 7500, ride 14000 (riding), drag 7500, needle 4000 (mostly the
// cylinder), orbit 20000 (the shooter, scrolling), crater 12500, queen 3000 (the arena) = ~78500. See OWNERSHIP.md.
//
// The gaps between sections are generous on purpose (3000 each): each section's owner can grow theirs to the right
// (x1) without touching anybody else's. Vertical parts (the needle going up into space) use y, not x: up is negative
// y from GY, as far as they like.
//
// Shared file (see OWNERSHIP.md): section owners may only append minimally (say, widen their own x1 into the gap
// after it), and must re-read it before editing.

import { GROUND_Y } from '../../m1/constants';

export const GY = GROUND_Y;
/** Where Space Land starts in the world. */
export const SPX = 300000;

/** The sections, in order: where each runs (world x). */
export const SECTIONS = {
  /** The tacky retro-futurist Futureland street square, up to the giant atom's doors. */
  square: { x0: SPX, x1: SPX + 10000 },
  /** Inside the giant atom: the backstage of the dark ride, stagehands, space obstacles; cutting the line. */
  atom: { x0: SPX + 13000, x1: SPX + 20500 },
  /** The hijacked train ride: the 1990 PA, the obstacles, the power breaker reveal, the brake crash, the launch. */
  ride: { x0: SPX + 23500, x1: SPX + 39500 },
  /** Back out on the main drag: outdoor platforming up to Space Needle 2. */
  drag: { x0: SPX + 40500, x1: SPX + 48000 },
  /** Space Needle 2: up into actual space; the slow-spinning cylinder, the suit, the window. */
  needle: { x0: SPX + 51000, x1: SPX + 56300 },
  /** The space shooter (free flight, ray gun only, rapid fire) and the UFO sub-boss; the abduction; the crash. */
  orbit: { x0: SPX + 58000, x1: SPX + 78000 },
  /** The impact site (dead aliens, escaping ones), then the space haunted house. */
  crater: { x0: SPX + 81000, x1: SPX + 93500 },
  /** The haunted house's showpiece room: the queen alien behind glass; the boss fight. */
  queen: { x0: SPX + 96500, x1: SPX + 106900 },
} as const;
export type SpaceId = keyof typeof SECTIONS;
export const SECTION_ORDER: SpaceId[] = ['square', 'atom', 'ride', 'drag', 'needle', 'orbit', 'crater', 'queen'];

/** The ways between sections (the crude first pass: each section's owner can move their own): where he's put coming
 *  into each one from the one before it (start), and coming back into it from the one after it (end). Feet (x, y). */
export const DOORS: Record<SpaceId, { start: { x: number; y: number }; end: { x: number; y: number } }> = {
  square: { start: { x: SECTIONS.square.x0 + 200, y: GY }, end: { x: SECTIONS.square.x1 - 250, y: GY } },
  atom: { start: { x: SECTIONS.atom.x0 + 200, y: GY }, end: { x: SECTIONS.atom.x1 - 250, y: GY } },
  // (ride: one-way; back in from the drag, he's put at the atom's load platform, the sled waiting there)
  ride: { start: { x: SECTIONS.ride.x0 + 200, y: GY }, end: { x: SECTIONS.atom.x0 + 6960, y: GY } },
  drag: { start: { x: SECTIONS.drag.x0 + 200, y: GY }, end: { x: SECTIONS.drag.x1 - 250, y: GY } },
  needle: { start: { x: SECTIONS.needle.x0 + 200, y: GY }, end: { x: SECTIONS.needle.x0 + 4880, y: GY } },
  // (the orbit: in flight, way up over its ground (orbit/geo.ts: CY + 330). Coming back from the crater, there's no
  // flying back up into space: he's put at the foot of Space Needle 2, the needle's own way back in)
  orbit: { start: { x: SECTIONS.orbit.x0 + 250, y: GY - 2620 }, end: { x: SECTIONS.needle.x0 + 4880, y: GY } },
  crater: { start: { x: SECTIONS.crater.x0 + 200, y: GY }, end: { x: SECTIONS.crater.x1 - 250, y: GY } },
  queen: { start: { x: SECTIONS.queen.x0 + 200, y: GY }, end: { x: SECTIONS.queen.x1 - 250, y: GY } },
};
/** The section before and after one (null: the land's start, the boss's arena). */
export const prevOf = (id: SpaceId): SpaceId | null => SECTION_ORDER[SECTION_ORDER.indexOf(id) - 1] ?? null;
export const nextOf = (id: SpaceId): SpaceId | null => SECTION_ORDER[SECTION_ORDER.indexOf(id) + 1] ?? null;
