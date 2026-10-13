// The outdoors' own state (the square's and the drag's: kept in Space Land's state under 'square', whichever of the
// two he's in): what's been fired or thrown that's still in the air (the cadets' toy bolts, the jetpackers' astronaut
// ice cream), what's been said already (each once), and who's barking what.

import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import type { Said } from '../section';
import { spaceState } from '../section';

/** A cadet's toy bolt (straight, slow) or a jetpacker's brick of astronaut ice cream (lobbed). */
export interface Shot { x: number; y: number; vx: number; vy: number; kind: 'bolt' | 'icecream'; t: number }

export interface Outdoors {
  shots: Shot[];
  said: Record<string, boolean>;
  /** What the PA's saying (the square's horn speakers), while it's said. */
  pa: Said | null;
  /** A guard's bark over his scooter, while it's said. */
  barks: WeakMap<Enemy, Said>;
  /** The PA has a line going (or waiting its turn): he holds his till it's done. */
  paBusy: boolean;
  /** The PA's last word (frame): not on top of itself. */
  paAt: number;
}

export const outOf = (state: GameState) => spaceState<Outdoors>(state, 'square', () => ({ shots: [], said: {}, pa: null, paBusy: false, barks: new WeakMap(), paAt: -9999 }));
