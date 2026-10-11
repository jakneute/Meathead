// Adventure Land, laid out: every section of the stage in its own stretch of the world, left to right, far from
// everything else (from AX on). He walks (or swims, or rides) from one into the next; where the story cuts (into the
// river, out of the storm drain, the cart ride, up through the roof) he's moved on to the next one's stretch.
//
// The stage is long: two to three times a Meathead 1 stage. It's linear, but open-linear (Mega Man X): side routes,
// high ways, hidden nooks with upgrades in them.

import { GROUND_Y } from '../../m1/constants';

export const GY = GROUND_Y;
/** Where Adventure Land starts in the world. */
export const AX = 100000;

/** The sections, in order: where each runs (world x). */
export const SECTIONS = {
  /** A real jungle: vines to swing on and climb, real jungle animals (monkeys among them). */
  jungle: { x0: AX, x1: AX + 12000 },
  /** The Jungle Cruise's queue (he goes round it: the back way, the extra fast pass) and its dock. */
  queue: { x0: AX + 13000, x1: AX + 15000 },
  /** The river: the boat ride with Safari Artie (on the surface), and under it, the swim (down to the storm drain). */
  river: { x0: AX + 16000, x1: AX + 30000 },
  /** Out of the storm drain into the raptor pen of the fake Jurassic zoo; the robot dinosaurs; the temple's back door. */
  dino: { x0: AX + 32000, x1: AX + 44000 },
  /** Inside the temple ride, backstage: the traps and the smoke and mirrors; the loading station. */
  temple: { x0: AX + 46000, x1: AX + 52000 },
  /** The mine cart, the unfriendly track (the ride's tricks, from the guests' side, set to real), Safari Artie after him. */
  cart: { x0: AX + 54000, x1: AX + 78000 },
  /** Up through the temple's roof: it's coming down; slide off down its left side. */
  roof: { x0: AX + 80000, x1: AX + 82500 },
  /** The jungle clearing: the boss door, the trees going down like dominoes, Safari Artie. */
  clearing: { x0: AX + 84000, x1: AX + 88000 },
} as const;
export type SectionId = keyof typeof SECTIONS;
export const SECTION_ORDER: SectionId[] = ['jungle', 'queue', 'river', 'dino', 'temple', 'cart', 'roof', 'clearing'];
