// The town's own state (in Spooky Land's, under 'town'): what's been thrown that's still in the air, the kiddie rides
// as they run (rides.ts), the jack-o'-lanterns rolling down the stairs, and what he's said already (each once).

import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import { spookyState } from '../section';

/** Something lobbed at him: a witch's potion, a skeleton's plastic bone. */
export interface Lobbed { x: number; y: number; vx: number; vy: number; kind: 'potion' | 'bone'; t: number }
/** A jack-o'-lantern rolling down the stairs (x, how far round it's turned). */
export interface Pumpkin { x: number; y: number; vx: number; spin: number; t: number }

export interface Rides {
  cups: Block[];
  seats: Block[];
  train: { x: number; dir: 1 | -1; mode: 'wait' | 'go'; t: number; roof: Block };
  drop: { h: number; mode: 'rest' | 'up' | 'hold' | 'drop'; t: number; ring: Block };
  pony: { on: number; cd: number; buck: number; saddle: Block };
}

export interface Town {
  thrown: Lobbed[];
  pumpkins: Pumpkin[];
  rides: Rides | null;
  said: Record<string, boolean>;
}

export const townOf = (state: GameState) => spookyState<Town>(state, 'town', () => ({ thrown: [], pumpkins: [], rides: null, said: {} }));
