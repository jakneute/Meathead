// The catch-up and Tucker's arena: its own state (state.stage's 'arena' slot: rebuilt on every death), and the memos
// that outlive a death (state.stageMemo).

import type { GameState } from '../../../m1/game/core/state';
import { frontierState, landVisit } from '../section';
import type { Victory } from '../../victory';
import type { WalkAway } from '../../walkAway';
import type { TuckerPose, TuckerFace } from '../tucker';

/** The branch is through him (tucker.ts's `branch`, from here on): the catch-up's been. */
export const BRANCH_MEMO = 'frontier-tucker-branch';
/** He's popped up off it (the fake-out's been): the fight's ground from here on (checkpoint 60). */
export const UP_MEMO = 'frontier-arena-up';
/** The arena entry's been: the felled tree drove the saw down, his face split to the nose, blind (tucker.ts's `split`,
 *  from here on). */
export const SPLIT_MEMO = 'frontier-tucker-split';

/** Seen the fake-out this visit (a retry from the checkpoint gets the entrance beat instead). */
let introVisit = -1;
export const introSeen = () => introVisit === landVisit();
export const markIntroSeen = () => { introVisit = landVisit(); };

export type Phase = 'wait' | 'catchup' | 'body' | 'fakeout' | 'entry' | 'entrance' | 'up' | 'won';
/** The axe tree: standing, coming down (chopped through), down along the ground. */
export type TreeMode = 'up' | 'falling' | 'down';
/** Where Tucker is and what he's doing (world feet). */
export type TMode = 'gone' | 'ride' | 'stand' | 'hop' | 'impaled' | 'flat' | 'pop' | 'up';

export interface Leaf { x: number; y: number; vx: number; vy: number; rot: number; vr: number; col: string; life: number }

export interface Arena {
  phase: Phase;
  /** The first frame in the section since the rebuild (the chase's handoff is taken then). */
  first: boolean;
  /** The scene's step, frames in it, frames in the scene; waiting on a line; the fade to/from black. */
  step: string; t: number; all: number; busy: boolean; fade: number;
  /** Tucker's words up while they're said; his mouth going. */
  said: string | null; talking: boolean;
  // ---- Tucker
  tMode: TMode; tx: number; ty: number; tvx: number; tvy: number; tFacing: 1 | -1;
  /** How he's drawn now (the scenes set it), and his face if not the pose's own. */
  pose: TuckerPose; face: TuckerFace | undefined;
  /** The scenes' camera (world x of the screen's left). */
  camX: number;
  /** A hop (off the bike, back on): from, to, how far through. */
  hop: { fx: number; tx: number; k: number } | null;
  // ---- his bike: where, how fast, its front wheel up, its wheels' turn; wrecked against the oak
  bx: number; bvx: number; btilt: number; bspin: number; wreck: boolean;
  // ---- the kid's bike (his): under him in the scene; parked, after (null: not anywhere yet)
  mx: number | null; mspin: number; mtilt: number; riding: boolean; hopFrom: number;
  /** The close-up of the branch going through him: 0..1. */
  closeK: number;
  /** The oak's branch snapped off (he took it with him). */
  snapped: boolean;
  leaves: Leaf[];
  /** A retry's entrance beat: frames left. */
  entrance: number;
  // ---- the arena entry: the axe tree (how far over it's tipped, radians from upright toward the right, how fast; the
  // butt's slide off the stump to the ground 0..1), where the axe is, him split and blind, squashed by the blow, the
  // close-up of it 0..1; the felled trunk's ledge laid
  tree: TreeMode; treeTh: number; treeVth: number; treeDrop: number;
  axe: 'tree' | 'held' | 'stump';
  split: boolean; squash: number; splitK: number; logLaid: boolean;
  victory: Victory | null; walk: WalkAway | null; wonAt: number;
}

export const arenaOf = (state: GameState) => frontierState<Arena>(state, 'arena', () => ({
  phase: 'wait', first: true, step: '', t: 0, all: 0, busy: false, fade: 0, said: null, talking: false,
  tMode: 'gone', tx: 0, ty: 0, tvx: 0, tvy: 0, tFacing: -1, hop: null, pose: 'stand', face: undefined, camX: 0,
  bx: 0, bvx: 0, btilt: 0, bspin: 0, wreck: false,
  mx: null, mspin: 0, mtilt: 0, riding: false, hopFrom: 0,
  closeK: 0, snapped: false, leaves: [], entrance: 0,
  tree: 'up', treeTh: 0, treeVth: 0, treeDrop: 0, axe: 'tree', split: false, squash: 0, splitK: 0, logLaid: false,
  victory: null, walk: null, wonAt: 0,
}));

export const next = (s: Arena, step: string) => { s.step = step; s.t = 0; };
