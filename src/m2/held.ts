// How an enemy's being held while it's drawn (Meathead 2's grab: pinned on its back under him, held up by the neck, or
// up in his fist to be pitched), for drawers that pose it for that (arms up guarding its face, clawing at his hands,
// legs kicking) rather than in whatever it was doing when he took hold of it. Set round the one draw call.

import type { Enemy } from '../m1/types';

export type HeldHow = 'pinned' | 'neck' | 'pitch';

let held: Enemy | null = null, how: HeldHow | null = null;

/** Draws `e` (with `draw`) as held `h`. */
export const drawingHeld = (e: Enemy, h: HeldHow | undefined, draw: () => void) => {
  if (!h) { draw(); return; }
  const pe = held, ph = how;
  held = e; how = h;
  try { draw(); } finally { held = pe; how = ph; }
};

/** How `e` is held, if it's being drawn held just now. */
export const heldHow = (e: Enemy): HeldHow | null => (held === e ? how : null);
