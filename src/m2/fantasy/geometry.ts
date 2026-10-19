// Fairy Land (land id `fantasy`), laid out: every section of the stage in its own stretch of the world, left to right,
// far from everything else (from FAX on, well clear of Wilderness Land's FRX). He walks from one into the next where the
// story walks (the town square into the fairy wheel's plaza); where it cuts (the loudspeaker's scene, the wheel's last
// suitor, the ride's unload, the broomstick in through the window) he's moved on to the next one's stretch.
//
// Budget (the user: every land about as long to play as Jungle Land, ~76500 px of play): the town square ~15000
// (platform heavy, the staircases: about a fifth of the land), the fairy wheel ~6000 (vertical: counted by time), the
// fantasy area ~14000, the Truelling Tragons ride ~14000 (a ride: counted by time), the castle's base and the runway
// ~12000, the broomstick deathmatch (its own behind-the-back view: by time), the bedroom and Piper's arena ~4000. See
// OWNERSHIP.md and fantasy-spec.md.
//
// The gaps between sections are generous on purpose (3000 each): each section's owner can grow theirs to the right
// (x1) without touching anybody else's. Vertical parts (the wheel, the castle's stairwells) go up in y from GY.
//
// Shared file (see OWNERSHIP.md): section owners may only append minimally (say, widen their own x1 into the gap after
// it), and must re-read it before editing.

import { GROUND_Y } from '../../m1/constants';

export const GY = GROUND_Y;
/** Where Fairy Land starts in the world. */
export const FAX = 800000;

/** The sections, in order: where each runs (world x). */
export const SECTIONS = {
  /** THE TOWN SQUARE: HOGSMEAT VILLAGE and the storybook square (the Wizarding World and Fantasyland, parodied); the
   *  land's new mechanic, the ENCHANTED STAIRCASES (stairs.ts), taught and built round; the cast members; at its end,
   *  the loudspeaker and PIPER THE PIXIE's voice. */
  square: { x0: FAX, x1: FAX + 15000 },
  /** THE FAIRY WHEEL (trial 1): a gigantic fairy-themed Ferris wheel, the beefy suitors in its carts throwing crap,
   *  jump to their carts, the QTEs, the kills. */
  wheel: { x0: FAX + 18000, x1: FAX + 24000 },
  /** THE ENCHANTED GLEN (the fantasy area after the wheel): escalating platforming and enemies. */
  glen: { x0: FAX + 27000, x1: FAX + 41000 },
  /** TRUELLING TRAGONS: the three-car coaster (fire, ice, lightning); no firing, hop cars with next/previous weapon. */
  tragons: { x0: FAX + 44000, x1: FAX + 58000 },
  /** THE GREAT PIXIE'S CASTLE: its base (standard platforming), out onto the runway for the final trial. */
  keep: { x0: FAX + 61000, x1: FAX + 73000 },
  /** THE BROOMSTICK DEATHMATCH (trial 3): behind-the-back, mode-7 style, as the Road Rash chase; in through the top
   *  window at the end. */
  broom: { x0: FAX + 76000, x1: FAX + 80000 },
  /** OUTSIDE THE GREAT PIXIE'S BEDROOM, the door kicked down, PIPER THE PIXIE's fight in her extra-wide chambers
   *  (bedroom/layout.ts: the hall x0..x0+1000, her room x0+1000..x0+3600). */
  bedroom: { x0: FAX + 83000, x1: FAX + 87000 },
} as const;
export type FantasyId = keyof typeof SECTIONS;
export const SECTION_ORDER: FantasyId[] = ['square', 'wheel', 'glen', 'tragons', 'keep', 'broom', 'bedroom'];

/** The ways between sections (each section's owner can move their own): where he's put coming into each one from the
 *  one before it (start), and coming back into it from the one after it (end). Feet (x, y). */
export const DOORS: Record<FantasyId, { start: { x: number; y: number }; end: { x: number; y: number } }> =
  Object.fromEntries(SECTION_ORDER.map(id => [id, { start: { x: SECTIONS[id].x0 + 200, y: GY }, end: { x: SECTIONS[id].x1 - 250, y: GY } }])) as Record<FantasyId, { start: { x: number; y: number }; end: { x: number; y: number } }>;
// (back from the wheel: past the bandstand, short of the way on)
DOORS.square.end = { x: SECTIONS.square.x1 - 120, y: GY };
/** The section before and after one (null: the land's start, the boss's arena). */
export const prevOf = (id: FantasyId): FantasyId | null => SECTION_ORDER[SECTION_ORDER.indexOf(id) - 1] ?? null;
export const nextOf = (id: FantasyId): FantasyId | null => SECTION_ORDER[SECTION_ORDER.indexOf(id) + 1] ?? null;
