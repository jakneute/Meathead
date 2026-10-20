// Cartoon Land (land id `cartoon`), laid out: every section of the stage in its own stretch of the world, left to right,
// far from everything else (from CTX on, well clear of Fairy Land's FAX). He walks from one into the next where the
// story walks (the kiddie square into the studio's front door); where it cuts (behind the studio's screen into the
// cartoon White House, the projector's collapse, the guard's nuts) he's moved on to the next one's stretch.
//
// Budget (the user: every land about as long to play as Jungle Land, ~76500 px of play): the kiddie square ~14000
// (platform heavy, the swaying towers: about a fifth of the land), the studio walk-through ~10000, the White House in
// two halves ~12000 each (the Socks segment, the five pundits), the big-kid rides ~12000, the Itchy & Scratchy knockoff
// ~10000, the amphitheater ~4000 (the guard, the stage, STUPID DAD). See OWNERSHIP.md and cartoon-spec.md.
//
// The gaps between sections are generous on purpose (3000 each): each section's owner can grow theirs to the right
// (x1) without touching anybody else's.
//
// Shared file (see OWNERSHIP.md): section owners may only append minimally (say, widen their own x1 into the gap after
// it), and must re-read it before editing.

import { GROUND_Y } from '../../m1/constants';

export const GY = GROUND_Y;
/** Where Cartoon Land starts in the world. */
export const CTX = 900000;

/** The sections, in order: where each runs (world x). */
export const SECTIONS = {
  /** SILLYVILLE SQUARE: the kiddie rides (Seuss Landing, parodied): curvy candy-striped buildings, puff-ball trees,
   *  the WUMPLE-GO-ROUND, the WISH-FISH SPINNER, the SNOOZLE CHOO, the SKY-HIGH TROLLEY; the land's new mechanic, the
   *  SWAYING STACK-TOWERS (sway.ts); the costumed cast; at its end the door of LEARN THE MAGIC OF HOW CARTOONS ARE
   *  MADE (EST. 1994). */
  kiddie: { x0: CTX, x1: CTX + 14000 },
  /** LEARN THE MAGIC OF HOW CARTOONS ARE MADE: the 1994 walk-through (lights come up on the animators as he goes; the
   *  smug narration; the Korean animators the park calls "suckers"); the hot new show's plug. */
  studio: { x0: CTX + 17000, x1: CTX + 27000 },
  /** CHELSEA AND SOCKS' WACKY WHITE HOUSE ADVENTURES, part one: behind the screen, erased and redrawn as Socks; cat moves;
   *  Chelsea nagging; PEROT, FALWELL. */
  whitehouse1: { x0: CTX + 30000, x1: CTX + 42000 },
  /** ...part two: LIMBAUGH, DOLE, GINGRICH in the Oval Office; the Clintons' thank-you; the projector's collapse; the
   *  bodies. */
  whitehouse2: { x0: CTX + 45000, x1: CTX + 57000 },
  /** The big-kid rides: trackless, they ram him; STUPID DAD's posters. */
  bigkid: { x0: CTX + 60000, x1: CTX + 72000 },
  /** The cat-and-mouse knockoff area (STUPID DAD's extended universe): mallets. */
  itchy: { x0: CTX + 75000, x1: CTX + 85000 },
  /** The amphitheater: in from the left, the security guard (the boss door is his nuts), the stage, STUPID DAD. */
  amphi: { x0: CTX + 88000, x1: CTX + 92000 },
} as const;
export type CartoonId = keyof typeof SECTIONS;
export const SECTION_ORDER: CartoonId[] = ['kiddie', 'studio', 'whitehouse1', 'whitehouse2', 'bigkid', 'itchy', 'amphi'];

/** The ways between sections (each section's owner can move their own): where he's put coming into each one from the
 *  one before it (start), and coming back into it from the one after it (end). Feet (x, y). */
export const DOORS: Record<CartoonId, { start: { x: number; y: number }; end: { x: number; y: number } }> =
  Object.fromEntries(SECTION_ORDER.map(id => [id, { start: { x: SECTIONS[id].x0 + 200, y: GY }, end: { x: SECTIONS[id].x1 - 250, y: GY } }])) as Record<CartoonId, { start: { x: number; y: number }; end: { x: number; y: number } }>;
// (back from the studio: in front of its door, in Sillyville Square)
DOORS.kiddie.end = { x: SECTIONS.kiddie.x0 + 13700, y: GY };
// (back from the White House: in front of the studio's projection screen, the way he went in behind it)
DOORS.studio.end = { x: SECTIONS.studio.x0 + 9560, y: GY };
/** The section before and after one (null: the land's start, the boss's arena). */
export const prevOf = (id: CartoonId): CartoonId | null => SECTION_ORDER[SECTION_ORDER.indexOf(id) - 1] ?? null;
export const nextOf = (id: CartoonId): CartoonId | null => SECTION_ORDER[SECTION_ORDER.indexOf(id) + 1] ?? null;
