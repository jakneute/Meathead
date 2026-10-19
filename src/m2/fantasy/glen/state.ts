// The enchanted glen's own state (in Fairy Land's, under 'glen'): the staircases as they swing, the toadstools' squash,
// what the cast throw (and the witches' potion puddles), who's barking what, what's been said, Piper over the PA, the
// rivals in the queue. Rebuilt with the stage on every death; the rivals gone in for good is state.stageMemo's
// (RIVALS_MEMO).

import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import type { Said } from '../section';
import type { Stair } from '../stairs';
import { fantasyState } from '../section';

/** What the glen's cast throw: a huntsman's crossbow bolt (straight, fast), a witch's potion (lobbed: it smashes into a
 *  fizzing puddle), the puddle (on the ground a while), a dwarf's rock (lobbed, a bounce). */
export interface GThrow {
  kind: 'bolt' | 'potion' | 'fizz' | 'rock';
  x: number; y: number; vx: number; vy: number; t: number;
  from: Enemy | null; bounces: number; dead?: boolean;
}

/** A rival in the queue: where he is, what he's doing, what he's saying. */
export interface Rival { x: number; face: 1 | -1; said: Said | null; walk: boolean; gone: boolean }

export interface Glen {
  stairs: Stair[];
  /** Each toadstool's squash (frames left of it, after a bounce). */
  squash: number[];
  throws: GThrow[];
  barks: Map<Enemy, Said>; barkAt: number;
  said: Record<string, boolean>;
  /** Piper over the PA: what's said, which horn (world x), when. */
  piper: Said | null; piperX: number; piperAt: number;
  /** The queue's scene: 'wait' (not yet), 'talk' (their taunts, his, hers, in turn), 'in' (walking in), 'done'. */
  queue: 'wait' | 'talk' | 'in' | 'done'; queueT: number;
  rivals: Rival[];
  /** When he was last hurt by the thorns (they throw him up; one hurt per landing in them). */
  briarAt: number;
}

export const RIVALS_MEMO = 'fa-glen-rivals';

export const glenOf = (state: GameState) => fantasyState<Glen>(state, 'glen', () => ({
  stairs: [], squash: [], throws: [], barks: new Map(), barkAt: -999, said: {}, piper: null, piperX: 0, piperAt: 0,
  queue: 'wait', queueT: 0, rivals: [], briarAt: -999,
}));
