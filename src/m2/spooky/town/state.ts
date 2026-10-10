// The town's own state (in Spooky Land's, under 'town'): what's been thrown that's still in the air, and what he's said
// already (each once).

import type { GameState } from '../../../m1/game/core/state';
import { spookyState } from '../section';

/** Something lobbed at him: a witch's potion, a skeleton's plastic bone. */
export interface Lobbed { x: number; y: number; vx: number; vy: number; kind: 'potion' | 'bone'; t: number }

export interface Town {
  thrown: Lobbed[];
  said: Record<string, boolean>;
}

export const townOf = (state: GameState) => spookyState<Town>(state, 'town', () => ({ thrown: [], said: {} }));
