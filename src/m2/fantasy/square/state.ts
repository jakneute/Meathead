// The town square's own state (in Fairy Land's, under 'square'): the staircases as they swing, the roofs' snow, the
// butter brew keg, what the cast throw, who's barking what, what he's said, the loudspeaker's scene. Rebuilt with the
// stage on every death (the scene's done-ness outlives it: SPEAKER_MEMO, state.stageMemo).

import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import type { Said } from '../section';
import type { Stair } from '../stairs';
import { fantasyState } from '../section';

/** A roof's snow: building up (idle), the trickle and the creak (tell), the slab falling, the heap it leaves. */
export interface Snow { x: number; eave: number; phase: number; state: 'idle' | 'tell' | 'fall' | 'heap'; t: number; y: number; vy: number }

/** Something the cast threw: a clerk's sparkler bolt, a princess's glass slipper, a bro's broomball, a troll's
 *  shockwave along the ground, a dragon's flame (a cone that stays a moment in front of it). */
export interface Throw {
  kind: 'spark' | 'slipper' | 'ball' | 'wave' | 'flame';
  x: number; y: number; vx: number; vy: number; t: number;
  from: Enemy; bounces: number; dead?: boolean;
}

export interface Square {
  stairs: Stair[];
  snows: Snow[];
  throws: Throw[];
  /** The keg: whole, or burst (frames since: the geyser). */
  keg: { e: Enemy | null; burst: number };
  /** Who's saying what over whose head; the last bark (frame). */
  barks: Map<Enemy, Said>; barkAt: number;
  said: Record<string, boolean>;
  /** The loudspeaker's scene (speaker.ts). */
  scene: import('./speaker').Scene;
}

export const squareOf = (state: GameState) => fantasyState<Square>(state, 'square', () => ({
  stairs: [], snows: [], throws: [], keg: { e: null, burst: -1 }, barks: new Map(), barkAt: -999, said: {},
  scene: { step: 'wait', t: 0, all: 0, line: 0, said: null, who: null, fade: 0, hearts: 0, suitors: [] },
}));
