// Timber Tumble's own state (in Wilderness Land's, under 'logride'): the log and him in it, the saws as they are, the
// shredded props, the sewer's and the river's hazards, the scene at the booth, the woodchipper, and what's been said.
// Rebuilt with the stage on every death (a checkpoint puts him straight back in a log where it was).

import type { Enemy } from '../../../m1/types';
import type { GameState } from '../../../m1/game/core/state';
import type { Said } from '../section';
import { frontierState } from '../section';
import type { SawType, PropKind } from './layout';

/** The log he's in. `mode`: not in one (walking: the station, the clearing), riding, the woodchipper's end. */
export interface Log {
  mode: 'off' | 'scene' | 'ride' | 'chipper' | 'leap' | 'done';
  /** Where (its middle, x from the section's start), how fast, how much his brake or paddle has it at (0.55..1.4). */
  rx: number; v: number; push: number;
  /** Him in it: how far up out of it he's jumped, and how fast he's going up or down. */
  up: number; vy: number;
  /** The log's own buck (a rock under it, a splashdown): how far up, how fast. */
  bob: number; bobV: number;
  /** (frames since it last splashed down: the spray) */
  splash: number;
  t: number;
  /** The camera's height, eased. */
  camY: number;
}

export interface Saw {
  type: SawType; x: number; phase: number;
  /** Where its middle is right now (world), its radius, its spin. */
  cx: number; cy: number; r: number; spin: number;
  /** 0..1: a rising saw's way up, a drop's way down, a rail saw's run; frames into its business. */
  k: number; t: number;
  /** Set going (as the log comes), done (gone past, or run off). */
  live: boolean; done: boolean;
  /** Shot to bits: jammed (frames since: it smokes, it doesn't spin, it doesn't cut). */
  jam: number; hits: number;
}

export interface Prop { x: number; kind: PropKind; t: number; shred: boolean }
export interface Rock { x: number; hit: boolean }
export interface Gusher { x: number; phase: number }

export type SceneStep = 'wait' | 'burst' | 'shove' | 'engage' | 'press' | 'drop' | 'close' | 'last' | 'fall' | 'after' | 'go' | 'done';
export interface Scene {
  step: SceneStep; t: number; all: number;
  /** Is a line being said (the step waits on it). */
  busy: boolean;
  tucker: Said | null; op: Said | null; tuckerTalking: boolean; opTalking: boolean;
  /** Where Tucker is in the booth (world x), the operator (world x, and her pose's frames). */
  tx: number; ox: number; oy: number; ovx: number; ovy: number; opDown: boolean;
  /** The saw over the console: how far down it's dropped (0..1). */
  sawK: number;
  /** The close-up's wound (0..1). */
  k: number;
}

export interface Chipper {
  /** The JUMP window: open, taken (he's leaping), missed (in he goes). */
  state: 'idle' | 'ready' | 'open' | 'leap' | 'mulch' | 'safe';
  t: number;
  /** The leap: from (world), to, 0..1. */
  lx0: number; ly0: number; lk: number;
  /** The mulch: frames in, the chips and the bits out the chute. */
  chips: { x: number; y: number; vx: number; vy: number; c: string; s: number; life: number }[];
  crew: Said | null; crewSaid: boolean;
}

export interface Ride {
  log: Log;
  saws: Saw[];
  props: Prop[];
  rocks: Rock[];
  /** The cutter at the break: frames since it came across (0: not yet). */
  cutT: number;
  rats: Enemy[];
  scene: Scene;
  chip: Chipper;
  /** The ride's PA: what's being said (over the top of the screen). */
  pa: Said | null;
  /** The operator's bark (outside the scene). */
  bark: Said | null;
  said: Record<string, boolean>;
  /** The photo's flash (frames left). */
  flash: number;
  /** Hit cooldowns for the things that touch him. */
  pipeCd: number; gushCd: number; branchCd: number;
}

export const rideOf = (state: GameState) => frontierState<Ride>(state, 'logride', () => ({
  log: { mode: 'off', rx: 0, v: 0, push: 1, up: 0, vy: 0, bob: 0, bobV: 0, splash: 0, t: 0, camY: 0 },
  saws: [], props: [], rocks: [], cutT: 0, rats: [],
  scene: { step: 'wait', t: 0, all: 0, busy: false, tucker: null, op: null, tuckerTalking: false, opTalking: false, tx: 0, ox: 0, oy: 0, ovx: 0, ovy: 0, opDown: false, sawK: 0, k: 0 },
  chip: { state: 'idle', t: 0, lx0: 0, ly0: 0, lk: 0, chips: [], crew: null, crewSaid: false },
  pa: null, bark: null, said: {}, flash: 0, pipeCd: 0, gushCd: 0, branchCd: 0,
}));
