// Spooky Land, laid out: every section of the stage in its own stretch of the world, left to right, far from
// everything else (from SX on, well clear of Adventure Land's AX). He walks from one into the next; where the story
// cuts (up the stairs into the castle, down into the dungeon, the drop from the clock tower into hell, the lava geyser
// back up to Donnie's control room) he's moved on to the next one's stretch.
//
// Budget: the whole land plays about as long as Adventure Land (its sections add up to ~64500 world px of walking,
// swimming and riding, plus cutscenes and the boss). Spooky Land's shares (world px of play; the vertical parts counted
// by how long they take to play, not their x width): town 12000, castle 12000, dungeon 3000, mist ~8000, tower ~9000,
// hell 11000, control + gift shop 5000, ballroom 3000 (the boss) = ~63000. See OWNERSHIP.md.
//
// The gaps between sections are generous on purpose: each section's owner can grow theirs to the right (x1) without
// touching anybody else's. Vertical parts (the red-mist hallway, the clock tower, the pit into hell) use y, not x:
// up is negative y from GY, as far as they like.
//
// Shared file (see OWNERSHIP.md): section owners may only append minimally (say, widen their own x1 into the gap
// after it), and must re-read it before editing.

import { GROUND_Y } from '../../m1/constants';

export const GY = GROUND_Y;
/** Where Spooky Land starts in the world. */
export const SX = 200000;

/** The sections, in order: where each runs (world x). */
export const SECTIONS = {
  /** The gothic Victorian town square (modern conveniences showing), its wildlife (bats), the haunted kiddie rides, the
   *  ELEVATOR TO HELL clock tower far in the background; the long stairs up to DRACULA'S OTHER CASTLE. */
  town: { x0: SX, x1: SX + 12000 },
  /** Inside the castle: the PA greeting (Donnie, as Dracula), the ghost-tour rooms (dining room, study, kitchen,
   *  bedroom, more), absurdly spacious. */
  castle: { x0: SX + 14000, x1: SX + 26000 },
  /** The dungeon: the spiked ceiling that drops (and here it hurts). */
  // (its stairway down from the castle comes first: SX + 26050 to SX + 28000; the cells from there)
  dungeon: { x0: SX + 26050, x1: SX + 33400 },
  /** The red-mist hallway: long, winding, vertical; the mist after him (it kills outright). */
  mist: { x0: SX + 34000, x1: SX + 40000 },
  /** The ELEVATOR TO HELL loading bay, then the clock tower climb: support beams to charge out, the wobble, the
   *  elevator's crash through the floor. */
  tower: { x0: SX + 42000, x1: SX + 47000 },
  /** Real hell: the wrecked elevator at the bottom of the pit, the platforming, the demon sub-boss, Satan, the lava
   *  geyser (up and out). */
  hell: { x0: SX + 49000, x1: SX + 60000 },
  /** Donnie's control room (the reveal: the wig, the cape, the fangs), the chase through the hell gift shop. */
  control: { x0: SX + 63000, x1: SX + 68000 },
  /** The tacky ballroom: Donnie Dracula's boss arena. */
  ballroom: { x0: SX + 71000, x1: SX + 74000 },
} as const;
export type SpookyId = keyof typeof SECTIONS;
export const SECTION_ORDER: SpookyId[] = ['town', 'castle', 'dungeon', 'mist', 'tower', 'hell', 'control', 'ballroom'];

/** The ways between sections (the crude first pass: each section's owner can move their own): where he's put coming
 *  into each one from the one before it (start), and coming back into it from the one after it (end). Feet (x, y). */
export const DOORS: Record<SpookyId, { start: { x: number; y: number }; end: { x: number; y: number } }> = {
  town: { start: { x: SECTIONS.town.x0 + 200, y: GY }, end: { x: SECTIONS.town.x1 - 250, y: GY - 600 } },
  // (castle: back up the dungeon stairs, he's put by the arch at the end of the gallery)
  castle: { start: { x: SECTIONS.castle.x0 + 200, y: GY }, end: { x: SECTIONS.castle.x1 - 250, y: GY } },
  // (dungeon: in at the top of its stairway, 1000 up: dungeon/stairs.ts)
  dungeon: { start: { x: SECTIONS.dungeon.x0 + 150, y: GY - 1000 }, end: { x: SECTIONS.dungeon.x1 - 250, y: GY } },
  // (mist: back from the loading bay, he's put at the top of the hallway, by its LOADING BAY door: mist/index.ts)
  mist: { start: { x: SECTIONS.mist.x0 + 200, y: GY }, end: { x: SECTIONS.mist.x0 + 4950, y: GY - 2400 } },
  // (tower: back up out of hell, he's put on the tower's ground floor by the hole the car made: tower/layout.ts)
  tower: { start: { x: SECTIONS.tower.x0 + 200, y: GY }, end: { x: SECTIONS.tower.x0 + 2530, y: GY } },
  // (hell: dropped in over the pit from the top of the clock tower, falling; back down from the control room by the geyser vent: see hell/layout.ts)
  hell: { start: { x: SECTIONS.hell.x0 + 560, y: GY - 1500 }, end: { x: SECTIONS.hell.x0 + 10350, y: GY } },
  control: { start: { x: SECTIONS.control.x0 + 200, y: GY }, end: { x: SECTIONS.control.x1 - 250, y: GY } },
  ballroom: { start: { x: SECTIONS.ballroom.x0 + 200, y: GY }, end: { x: SECTIONS.ballroom.x1 - 250, y: GY } },
};
/** The section before and after one (null: the land's start, the boss's arena). */
export const prevOf = (id: SpookyId): SpookyId | null => SECTION_ORDER[SECTION_ORDER.indexOf(id) - 1] ?? null;
export const nextOf = (id: SpookyId): SpookyId | null => SECTION_ORDER[SECTION_ORDER.indexOf(id) + 1] ?? null;
