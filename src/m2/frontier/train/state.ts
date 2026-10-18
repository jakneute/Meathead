// The train's own state (in Wilderness Land's, under 'train'): the cars as they are (their blocks; which are gone off
// the back), the cut Tucker's making, how fast the world's going by and how far it's gone, what's coming by, what's
// flying, the wrecks tumbling away behind, the dark of a tunnel, what's been said, and the engine's scene. Rebuilt with
// the stage on every death: which cars are still on is worked out from the checkpoint (a car cut loose before it stays
// gone; one cut loose after it is back on, the way it was).

import type { GameState } from '../../../m1/game/core/state';
import type { Block, Enemy } from '../../../m1/types';
import type { Said } from '../section';
import { frontierState } from '../section';
import type { CarKind } from './layout';

export interface Car { i: number; blocks: Block[]; gone: boolean }

/** A coupling being cut: the tell (sparks, the clank, the shudder), then the drift back (everything from `k` back). */
export interface Cut { k: number; phase: 'tell' | 'drift'; t: number; tell: number; v: number; off: number }

/** Something the train goes by (world x of its near edge, its width): a low bridge, a water tower, a tunnel; the
 *  buffer stop at the end of the line. `warn`: frames it's been warned of. */
export interface Passer { kind: 'bridge' | 'tower' | 'tunnel' | 'bumper'; x: number; len: number; t: number }

/** Things flying (thrown by the cast, off the stack): a suitcase, a cleaver, a lump of coal (it rolls when it lands),
 *  a cinder (falling where its mark is). */
export interface Shot { kind: 'suitcase' | 'cleaver' | 'coal' | 'cinder'; x: number; y: number; vx: number; vy: number; t: number; rolling?: boolean; from?: Enemy; mark?: number; dead?: number }

/** A cut car, derailed: tumbling away off the back. */
export interface Wreck { x: number; y: number; vx: number; vy: number; rot: number; vr: number; kind: CarKind; len: number; t: number }

/** A horse with nobody on it any more (its robber boarded, or shot off it): galloping off. */
export interface LooseHorse { x: number; vx: number; t: number; seed: number }

export type Phase = 'intro' | 'ride' | 'still';

export interface Train {
  phase: Phase;
  /** Its first frame's been run (where he starts is known then: the train set up for it). */
  settled: boolean;
  cars: Car[];
  /** The rearmost car still on. */
  rear: number;
  cut: Cut | null;
  /** The cuts made (by car), this life. */
  cutsDone: Set<number>;
  /** How far the world's gone by, its speed now and the speed it's going to. */
  dist: number; v: number; vTarget: number;
  passers: Passer[];
  /** The events set off (by index). */
  fired: Set<number>;
  shots: Shot[];
  wrecks: Wreck[];
  horses: LooseHorse[];
  /** How dark it is (a tunnel), 0..1. */
  dark: number;
  /** The run for the caboose (frames into it; frames he's holding the jump). */
  introT: number; hopT: number;
  /** Tucker's words on the speaking tube, while they're said. */
  tube: Said | null;
  tubeBusy: boolean;
  ledgerT: number;
  said: Record<string, boolean>;
  cinderT: number;
  /** A bridge, a tower, the GY's hit (frames before it can hit him again). */
  hitCd: number;
  /** A shudder on the cut car (px). */
  shudder: number;
}

export const trainOf = (state: GameState) => frontierState<Train>(state, 'train', () => ({
  phase: 'intro', settled: false, cars: [], rear: 0, cut: null, cutsDone: new Set(), dist: 0, v: 0, vTarget: 0, passers: [], fired: new Set(), shots: [], wrecks: [], horses: [],
  dark: 0, introT: 0, hopT: 0, tube: null, tubeBusy: false, ledgerT: 0, said: {}, cinderT: 0, hitCd: 0, shudder: 0,
}));
