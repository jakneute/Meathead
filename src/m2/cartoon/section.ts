// Cartoon Land's sections: Adventure Land's Section (adventure/section.ts), with Cartoon Land's ids, and the bits every
// Cartoon Land section uses. Everything in adventure/section.ts (lay, solid, ledge, teleport, hands, meatheadSays, speak,
// saidOver, box, label...) works here as it is: import it from here or from there. The crude placeholder drawing
// helpers are Hollywood Land's (postSign, wallSign, groundBox, ledgeBox, layOwn), re-exported.
//
// Shared file (see OWNERSHIP.md): section owners may only append minimally, and must re-read it before editing.

import type { GameState } from '../../m1/game/core/state';
import type { Section, Adv } from '../adventure/section';
import { sectionState as advSectionState, teleport } from '../adventure/section';
import { isShat, isNude } from '../../m1/game/player/gut';
import { SECTIONS, DOORS, prevOf, nextOf, type CartoonId } from './geometry';
import type { ByPants } from './talk';

export * from '../adventure/section';
export { postSign, wallSign, doorway, groundBox, ledgeBox, layOwn } from '../hollywood/section';
export type { CartoonId } from './geometry';

/** A section of Cartoon Land: Adventure Land's Section with Cartoon Land's ids. */
export type CartoonSection = Section<CartoonId>;
/** Cartoon Land's own state (state.stage): which section he's in, each section's own state by its id. */
export type Cartoon = Adv<CartoonId>;
export const getCartoon = (state: GameState) => state.stage as Cartoon | null;
/** A section's own state, made the first time it's asked for. */
export const cartoonState = <T>(state: GameState, id: CartoonId, make: () => T): T => advSectionState<T, CartoonId>(state, id, make);

/** The pool for the state of him: clean, shat, or naked. */
export const pantsOf = (state: GameState): keyof ByPants => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
export const byPants = (state: GameState, r: ByPants) => r[pantsOf(state)];

// ---------------------------------------------------------------------------------------------------------------
// Visits: state.stage is rebuilt every time he dies; anything that has to outlive a death keeps it in its module, and
// starts over on a fresh way into the land (index.ts bumps this then), never on a respawn.

let visit = 0;
export const landVisit = () => visit;
/** (index.ts's: a fresh way into the land) */
export const newLandVisit = () => { visit++; };

// ---------------------------------------------------------------------------------------------------------------
// The crude placeholder ways between sections (each owner swaps theirs for the real thing)

export interface Exit { x0: number; x1: number; yTop: number; yBot: number; to: { x: number; y: number } }
/** The crude way on at a section's right end and back at its left end (on the ground), to the next and last sections'
 *  DOORS. `right` / `left` false: not that end. */
export const endExits = (id: CartoonId, ends: { left?: boolean; right?: boolean } = {}): Exit[] => {
  const { x0, x1 } = SECTIONS[id], prev = prevOf(id), next = nextOf(id), out: Exit[] = [];
  if (next && ends.right !== false) out.push({ x0: x1 - 60, x1, yTop: DOORS[id].end.y - 40, yBot: DOORS[id].end.y + 2, to: DOORS[next].start });
  if (prev && ends.left !== false) out.push({ x0, x1: x0 + 60, yTop: DOORS[id].start.y - 40, yBot: DOORS[id].start.y + 2, to: DOORS[prev].end });
  return out;
};
/** Walls at a section's two ends (no walking off either), from far up to well under the ground. */
export const endWalls = (state: GameState, id: CartoonId, ends: { left?: boolean; right?: boolean } = {}) => {
  const { x0, x1 } = SECTIONS[id];
  if (ends.left !== false) state.blocks.push({ x: x0 - 40, y: -6000, w: 40, h: 8000, type: 'wall', hidden: true, tag: `${id}-start` });
  if (ends.right !== false) state.blocks.push({ x: x1, y: -6000, w: 40, h: 8000, type: 'wall', hidden: true, tag: `${id}-end` });
};
/** Through any exit he's in; true if he went through one. */
export const runExits = (state: GameState, exits: Exit[]) => {
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  for (const e of exits) if (cx >= e.x0 && cx <= e.x1 && feet >= e.yTop && feet <= e.yBot) { teleport(state, e.to.x, e.to.y); return true; }
  return false;
};
