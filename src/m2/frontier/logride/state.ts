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
  /** Where (its middle, x from the section's start), how fast, how much his brake or paddle has it at (0.38..1.75). */
  rx: number; v: number; push: number;
  /** Him in it: how far up out of it he's jumped, and how fast he's going up or down. */
  up: number; vy: number;
  /** Him along it: how far ahead of (+) or behind (-) the log's middle he is (a hop forward or back: the log follows
   *  him, catching up under him), and how fast a hop's carrying him along it. */
  off: number; hopV: number;
  /** The log riding the water: its gentle bob (px). */
  float: number;
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
  /** The saw out of the sky: how far down it's dropped (0..1); through the station's roof yet, the booth's. */
  sawK: number; roof?: boolean; booth?: boolean;
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
  /** Somebody thrown in (frames of red out the chute left); the crew's sore-about-it bark said. */
  gore: number; madSaid: boolean;
  /** Which of the crew's saying it (their words go over them). */
  crewBy?: Enemy | null;
}

/** A big wave splash at the bottom of a drop (world: where, and frames since). */
export interface Wave { x: number; y: number; t: number; /** how big (1: a drop's; the biggest 1.2) */ s: number; /** drifting on with the log */ vx: number }
/** A drop of a big splash's spray: up, out and raining back down onto the water (world). */
export interface Spray { x: number; y: number; vx: number; vy: number; floor: number; life: number; s: number; sewer: boolean }

export interface Ride {
  log: Log;
  saws: Saw[];
  props: Prop[];
  rocks: Rock[];
  /** The busted pipe sections across the sewer's channel (as the rocks). */
  junk: Rock[];
  /** The big splashes going; frames of water left running down the screen. */
  waves: Wave[]; lens: number;
  /** The big splashes' spray, raining back down. */
  spray: Spray[];
  /** The cutter at the break: frames since it slammed down (0: not yet). */
  cutT: number;
  /** The logging crew (enemies of the clearing's). */
  crew: Enemy[];
  scene: Scene;
  chip: Chipper;
  /** The ride's PA: what's being said (over the top of the screen). */
  pa: Said | null;
  /** The operator's bark (outside the scene). */
  bark: Said | null;
  said: Record<string, boolean>;
  /** The photo's flash (frames left). */
  flash: number;
  /** The woodchipper's gore: the bits, the pools, its bloody mouth (chipperGore.ts; the visit's). */
  gore?: import('./chipperGore').Gore;
  /** Hit cooldowns for the things that touch him. */
  pipeCd: number; gushCd: number; branchCd: number;
}

export const rideOf = (state: GameState) => frontierState<Ride>(state, 'logride', () => ({
  log: { mode: 'off', rx: 0, v: 0, push: 1, up: 0, vy: 0, off: 0, hopV: 0, float: 0, bob: 0, bobV: 0, splash: 0, t: 0, camY: 0 },
  saws: [], props: [], rocks: [], junk: [], waves: [], lens: 0, spray: [], cutT: 0, crew: [],
  scene: { step: 'wait', t: 0, all: 0, busy: false, tucker: null, op: null, tuckerTalking: false, opTalking: false, tx: 0, ox: 0, oy: 0, ovx: 0, ovy: 0, opDown: false, sawK: 0, k: 0 },
  chip: { state: 'idle', t: 0, lx0: 0, ly0: 0, lk: 0, chips: [], crew: null, crewSaid: false, gore: 0, madSaid: false },
  pa: null, bark: null, said: {}, flash: 0, pipeCd: 0, gushCd: 0, branchCd: 0,
}));
