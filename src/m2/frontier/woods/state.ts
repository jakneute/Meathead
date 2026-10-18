// The woods' own state (in Wilderness Land's, under 'woods'): the kids and their bikes, the bounty scene as it is, the
// leaf pile, the real hazards (the ivy, the trap), the leaves flying. Rebuilt with the stage on every death (the scene
// done is BOUNTY_MEMO in state.stageMemo: it outlives everything).

import type { GameState } from '../../../m1/game/core/state';
import { frontierState } from '../section';
import type { Bike, Kid } from './teens';

export type Step = 'wait' | 'pull' | 'hi' | 'kick' | 'mine' | 'mount' | 'down' | 'rustle' | 'pop' | 'ambush' | 'sorry' | 'gather' | 'offer' | 'yes' | 'back' | 'go' | 'done';

export interface Scene {
  step: Step; t: number; all: number;
  /** A line's being said (the step waits on it). */
  busy: boolean;
  /** Who's saying what (drawn over them while it's said). */
  talk: { who: 'a' | 'b' | 'teen' | 'tucker'; text: string } | null;
  /** The kid he kicks off (A) and his bike; the kid Tucker tackles off (B) and his; the one who says yes. */
  kidA: Kid | null; bikeA: Bike | null; kidB: Kid | null; bikeB: Bike | null; yes: Bike | null;
  /** Tucker: where (world feet), how he's going, what he's doing (in the pile, up out of it, in the air, on the bike). */
  tucker: { x: number; y: number; vy: number; k: number; fx: number; fy: number; mode: 'hid' | 'up' | 'air' | 'bike'; talking: boolean };
  /** His hop onto the bike: from where. */
  hopFrom: number;
  /** The fade to black at the end (0..1). */
  fade: number;
}

export interface Leaf { x: number; y: number; vx: number; vy: number; rot: number; vr: number; col: string; life: number }
export interface Trap { state: 'open' | 'him' | 'sprung'; t: number; hold: number; latch: boolean; lastPress: { left: boolean; right: boolean; jump: boolean } }

export interface Woods {
  scene: Scene;
  /** The lot's riders (before the bounty), and every bike in the scene. */
  bikes: Bike[];
  kids: Kid[];
  leaves: Leaf[];
  /** The leaf pile: whole, shivering (frames), burst (scattered). */
  pile: { burst: boolean; shiver: number };
  trap: Trap;
  /** In the ivy: frames till it gets him again; the itch after (frames left), till its next tick. */
  ivyCd: number; itch: number; itchCd: number;
  /** The kicked-off kid's sulk (after): what he's saying, and whether he'll say it again when Meathead comes back by. */
  sulk: { text: string } | null; sulkArmed: boolean;
  /** The engines' buzz (frames till the next). */
  buzz: number;
  /** The first frame since the build (the checkpoint-skip cheat's world state). */
  first: boolean;
}

export const woodsOf = (state: GameState) => frontierState<Woods>(state, 'woods', () => ({
  scene: {
    step: 'wait', t: 0, all: 0, busy: false, talk: null, kidA: null, bikeA: null, kidB: null, bikeB: null, yes: null,
    tucker: { x: 0, y: 0, vy: 0, k: 0, fx: 0, fy: 0, mode: 'hid', talking: false }, hopFrom: 0, fade: 0,
  },
  bikes: [], kids: [], leaves: [], pile: { burst: false, shiver: 0 },
  trap: { state: 'open', t: 0, hold: 0, latch: false, lastPress: { left: false, right: false, jump: false } },
  ivyCd: 0, itch: 0, itchCd: 0, sulk: null, sulkArmed: true, buzz: 0, first: true,
}));
