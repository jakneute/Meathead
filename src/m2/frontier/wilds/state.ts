// The wilds' own state (in Wilderness Land's, under 'wilds'): the rolling logs as they float, the hazards as they are
// (the traps, the pines' cones, the loose ledges, the bees, the log pile's logs), what he's said, and the station's
// scene. Rebuilt with the stage on every death (the station's done-ness outlives it: STATION_MEMO, state.stageMemo).

import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import type { Mover } from '../../foreign/movers';
import type { Said } from '../section';
import { frontierState } from '../section';

/** A rolling log, as it floats: its left end, its speed, how far it's turned, its bob and lurch, its ledge. */
export interface LogRun {
  water: number; len: number;
  x: number; vx: number; spin: number;
  /** A lurch up off a submerged rock (px, easing back down), and the frames before the next. */
  lurch: number; lurchCd: number;
  /** His wobble on it (-1..1) and its speed last frame (for the wobble off a change). */
  lean: number; lastVx: number;
  /** Frames since it last bumped into something (the thunk's not every frame it's against it). */
  bumpCd: number;
  /** Tied up at the near (left) bank, where he comes to it: the current doesn't take it off downstream till he's on
   *  it (or he's come at it from the far side). */
  moored: boolean;
  /** Where it's tied up to start (a fresh one's there after it's gone over the falls). */
  home: number;
  /** Over the snag at the river's end: the current has it (he can't steer it; his feet are his again). */
  taken: boolean;
  /** Frames it's hung teetering on the falls' lip before it goes. */
  teeter: number;
  /** Going over the falls: where it is, its speed, its turn end over end, frames since; `plume`: frames since it hit
   *  the bottom (the spray coming up). */
  over: { x: number; y: number; vx: number; vy: number; ang: number; t: number; plume: number } | null;
  m: Mover;
}

/** A porcupine's quill, sprayed up off its back (flying, then gone). */
export interface Quill { x: number; y: number; vx: number; vy: number; t: number; from: Enemy }

/** A bear trap: open (armed), shut on him (holding: frames left), shut on an animal (holding it), or sprung (shut,
 *  re-arming). `latch`: he's still stood in it after it let go (it doesn't snap again till he's off it). */
export interface Trap { x: number; y: number; state: 'open' | 'him' | 'animal' | 'sprung'; t: number; hold: number; victim: Enemy | null; latch: boolean }

/** A pine's cone: hanging, the tree shaking (the tell), falling, gone (growing back). */
export interface Pine { x: number; coneY: number; groundY: number; state: 'ready' | 'shake' | 'fall' | 'gone'; t: number; cy: number; vy: number; bounced: boolean }

/** A loose ledge: solid, shaking under him (the tell), fallen (its block away), coming back. */
export interface Loose { a: number; b: number; y: number; state: 'solid' | 'shake' | 'fallen'; t: number; drop: number; block: import('../../../m1/types').Block }

/** The bees out of a knocked-down hive: going for whoever's nearest; nothing kills them; after a while they lose
 *  interest and drift off up out of it (`gone`: how far they've drifted). */
export interface Swarm { x: number; y: number; t: number; tx: number; ty: number; stingCd: Map<object, number>; gone: number }

/** A log off the pile, rolling down the hill. */
export interface Roller { x: number; y: number; vx: number; spin: number; dead: number }

export interface Wilds {
  logs: LogRun[];
  traps: Trap[];
  pines: Pine[];
  loose: Loose[];
  swarms: Swarm[];
  rollers: Roller[];
  quills: Quill[];
  /** The leeches on him (leeches.ts): how many, frames he's been under, frames to the next drain, the next latch, and
   *  the ones he's just shaken off (flying, then gone). */
  leech: { n: number; under: number; drainT: number; latchT: number; sayCd: number; off: { x: number; y: number; vx: number; vy: number; t: number; a: number }[] };
  pileT: number;
  /** The hives (their enemies), where each was last seen (to let the swarm out where it fell). */
  hives: { e: Enemy; x: number; y: number; out: boolean }[];
  said: Record<string, boolean>;
  /** The controls last frame (the trap's mashing counts presses). */
  lastPress: { left: boolean; right: boolean; jump: boolean };
  /** The low branches' hit (frames before it can hit again). */
  branchCd: number;
  /** Who's saying what over whose head (Tucker's lines in the station's scene). */
  tuckerSaid: Said | null;
}

export const wildsOf = (state: GameState) => frontierState<Wilds>(state, 'wilds', () => ({
  logs: [], traps: [], pines: [], loose: [], swarms: [], rollers: [], quills: [], leech: { n: 0, under: 0, drainT: 0, latchT: 0, sayCd: 0, off: [] }, pileT: 0, hives: [], said: {},
  lastPress: { left: false, right: false, jump: false }, branchCd: 0, tuckerSaid: null,
}));
