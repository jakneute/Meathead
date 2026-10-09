// The jungle's own state (in Adventure Land's, under 'jungle'): its vines as they swing, his hold on one, what the
// monkeys have thrown that's still in the air, and what he's said already.

import type { GameState } from '../../../m1/game/core/state';
import { sectionState } from '../section';

/** A vine, as it is this frame: its angle off straight down (radians, + swung right) and how fast that's changing. */
export interface VineRun { th: number; om: number }

/** His hold on a vine (or none), and the business round letting go. */
export interface Hold {
  /** Which vine he's on (-1: none). */
  on: number;
  /** How far down it his hands are, from where it hangs. */
  s: number;
  /** Zipping up it (-1, the quick climb) or down it (1, the quick slide). */
  zip: 0 | 1 | -1;
  /** The last vine he let go of, and how long before he can take hold of it again (any other, a moment). */
  last: number; cd: number; anyCd: number;
  /** The buttons held when he took hold or let go: not passed on to him again till they're let go of. */
  jumpLatch: boolean; specialLatch: boolean;
  /** The swing he let go with, kept up a while (the air would otherwise eat it at once). */
  fling: { vx: number; t: number } | null;
  lastX: number;
  hurtWas: number;
  /** Stood at the top of one, how long he's held down (it takes a deliberate hold to go back down it), and down held
   *  from climbing off the top (let go of it first). */
  downT: number; downLatch: boolean;
  /** The zip's an attack (charge + up: the aggressive ascent, hitting like an uppercut; + down: the aggressive descent,
   *  like a dive kick); and, after one, the way it went held: no going off the end of the vine on it till it's let go. */
  aggro: boolean; held: 0 | 1 | -1;
}

/** Something a monkey's thrown. */
export interface Thrown { x: number; y: number; vx: number; vy: number; kind: 'poo' | 'fruit'; fruit: number; t: number }

export interface Jungle {
  vines: VineRun[];
  hold: Hold;
  thrown: Thrown[];
  said: Record<string, boolean>;
}

export const jungleOf = (state: GameState) => sectionState<Jungle>(state, 'jungle', () => ({
  vines: [],
  hold: { on: -1, s: 0, zip: 0, last: -1, cd: 0, anyCd: 0, jumpLatch: false, specialLatch: false, fling: null, lastX: 0, hurtWas: 0, downT: 0, downLatch: false, aggro: false, held: 0 },
  thrown: [],
  said: {},
}));
