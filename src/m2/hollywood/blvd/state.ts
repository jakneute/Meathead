// The outdoors' own state (the boulevard's and the backlot's: one lot, kept per stage build, whichever of the two he's
// in): what's flying (the heroes' shields, the guides' megaphone blasts, the cowboys' lassos), what's been said (each
// once), who's saying what over their heads, and what the hustlers have lifted off him.

import type { GameState } from '../../../m1/game/core/state';
import type { Enemy, WeaponType } from '../../../m1/types';
import type { Said } from '../section';

/** Something thrown or fired: a hero's foam shield (out and back), a guide's megaphone blast, a cowboy's lasso. */
export interface Shot { x: number; y: number; vx: number; vy: number; kind: 'shield' | 'blast' | 'lasso'; t: number; from?: Enemy; back?: boolean }

export interface Outdoors {
  shots: Shot[];
  said: Record<string, boolean>;
  /** What the PA's saying, while it's said; it has a line going (or waiting); its last word (frame). */
  pa: Said | null; paBusy: boolean; paAt: number;
  /** Somebody's bark over their head, while it's said; the last bark (frame: not on top of each other). */
  barks: WeakMap<Enemy, Said>; barkAt: number;
  /** What a hustler's lifted off him (killed, it's dropped back). */
  loot: WeakMap<Enemy, { w: WeaponType; n: number }>;
  /** The ones carrying some (to see them die). */
  thieves: Enemy[];
  /** Camera flashes going off (world; frame it went). */
  flashes: { x: number; y: number; at: number }[];
}

const OUT = new WeakMap<object, Outdoors>();
export const outOf = (state: GameState): Outdoors => {
  const k = state.stage as object;
  let o = OUT.get(k);
  if (!o) { o = { shots: [], said: {}, pa: null, paBusy: false, paAt: -9999, barks: new WeakMap(), barkAt: -9999, loot: new WeakMap(), thieves: [], flashes: [] }; OUT.set(k, o); }
  return o;
};
