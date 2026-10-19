// The fairy wheel's own state (in Fairy Land's, under 'wheel'), rebuilt with the stage on every death; and what
// outlives a death (who's dead and how: a checkpoint puts the world back as the run left it), kept here by landVisit();
// and what outlives the visit (the trial won: WHEEL_MEMO in state.stageMemo).

import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import type { Said } from '../section';
import { fantasyState, landVisit } from '../section';
import type { Item, KillKind } from './lines';
import type { Qte } from './qte';
import type { Kill } from './kills';

/** The trial's won for good (a revisit: the wheel's empty, both gates open). */
export const WHEEL_MEMO = 'fantasy-wheel-done';
export const wheelDone = (state: GameState) => state.stageMemo[WHEEL_MEMO] === '1';

/** How a dead suitor was left: in his cart (smashed, legs up through the floor, choked on roses), or on the ground
 *  under the wheel where he came down (thrown, flung). */
export interface Corpse { how: KillKind; groundX?: number }

/** Outlives a death (this visit): who's dead and how; the trial won this visit (the gate back stays shut). */
const kept = { visit: -1, dead: new Map<number, Corpse>(), wonHere: false };
export const keptDead = () => {
  if (kept.visit !== landVisit()) { kept.visit = landVisit(); kept.dead = new Map(); kept.wonHere = false; }
  return kept;
};

/** A gondola: its floor's ledge (moved round every frame), where its floor is now (the middle of it). */
export interface Cart { k: number; b: Block; fx: number; fy: number; dx: number; dy: number }

/** A suitor in his cart, alive: throwing (its tell: wound up), dazed (hit by a rival's throw, a body), who he's at. */
export interface Live {
  i: number;
  /** Frames to his next throw; his throw's wind-up (frames left: the item in his hand, the tell). */
  next: number; wind: number; item: Item; at: 'him' | number;
  /** Dazed (frames left); hurt (a flinch, frames left); a bruise or two. */
  daze: number; flinch: number; bruises: number;
  /** No QTE in his cart for this long (just knocked Meathead out). */
  cool: number;
}

/** Something thrown: who threw it, what, where it's going; at him or a rival. */
export interface Throw { item: Item; from: number; x: number; y: number; vx: number; vy: number; t: number; spin: number; dead?: boolean }

/** A body flying (thrown off, flung): ballistic, spinning, screaming; who's in it, where it's going (a cart's suitor). */
export interface Body { i: number; x: number; y: number; vx: number; vy: number; rot: number; spin: number; target: number | null; how: KillKind; done?: boolean }

export interface Wheel {
  /** Frames since the stage was built (the wheel's turn). */
  t: number; ang: number;
  carts: Cart[];
  live: Map<number, Live>;
  throws: Throw[];
  bodies: Body[];
  /** The trial: not yet, on, won. */
  trial: 'wait' | 'on' | 'won';
  /** The gates' walls. */
  walls: { l: Block; r: Block };
  qte: Qte | null;
  kill: Kill | null;
  /** The last throw at him (frame), the last bark (frame), the last bounce line (frame). */
  lastAtHim: number; lastBark: number; lastBounce: number;
  /** Piper's line up (over the hub's horn), a suitor's bark (by roster index). */
  piper: Said | null; barks: Map<number, Said>;
  /** Falling: the highest his feet were since he left something to stand on; knocked out of a cart (frame). */
  fallFrom: number | null; knockedAt: number;
  /** Thrown out of a cart (a QTE lost): falling clean through the gondolas' floors till he's down on the plaza. */
  thrown: boolean;
  /** A suitor's QTE beats already won (by roster index): losing doesn't take them back; next time in his cart, only the rest (the user's). */
  qteDone: Map<number, number>;
  /** Which kill's next (they go round, shuffled). */
  killBag: KillKind[];
  /** The gate's opening (frames since), sparkles. */
  opened: number;
  said: Record<string, boolean>;
}

export const wheelOf = (state: GameState) => fantasyState<Wheel>(state, 'wheel', () => ({
  t: 0, ang: Math.PI / 2, carts: [], live: new Map(), throws: [], bodies: [], trial: 'wait',
  walls: { l: null as unknown as Block, r: null as unknown as Block },
  qte: null, kill: null, lastAtHim: -999, lastBark: -999, lastBounce: -9999, piper: null, barks: new Map(),
  fallFrom: null, knockedAt: -9999, thrown: false, qteDone: new Map(), killBag: [], opened: -1, said: {},
}));
