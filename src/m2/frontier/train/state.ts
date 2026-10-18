// The train's own state (in Wilderness Land's, under 'train'): the cars as they are (their blocks; which are gone off
// the back), the cut Tucker's making, how fast the world's going by and how far it's gone, what's coming by, what's
// flying, the wrecks going over behind, the dark of a tunnel, the grade, the waterfall's soaking, who's out of the world
// in a car he isn't in, what's been said, and the engine's scene. Rebuilt with the stage on every death: which cars are
// still on is worked out from the checkpoint (a car cut loose before it stays gone; one cut loose after it is back on,
// the way it was).

import type { GameState } from '../../../m1/game/core/state';
import type { Block, Enemy } from '../../../m1/types';
import type { Said } from '../section';
import { frontierState } from '../section';
import type { CarKind } from './layout';

export interface Car { i: number; blocks: Block[]; gone: boolean }

/** A coupling being cut: the tell (sparks, the clank, the shudder), the drift back (everything from `k` back), then the
 *  wreck: the points of a switch it's dropped back onto thrown under it (`sw`: the switch's world x, `thrown` once its
 *  target's gone red), and it goes off the line. */
export interface Cut { k: number; phase: 'tell' | 'drift'; t: number; tell: number; v: number; off: number; sw?: number; thrown?: boolean }

/** Something the train goes by (world x of its near edge, its width): a low bridge, a water tower, a tunnel, a waterfall
 *  over the line, a grade (`amp`), a sign by the line; the buffer stop at the end of the line. */
export interface Passer { kind: 'bridge' | 'tower' | 'tunnel' | 'bumper' | 'falls' | 'hill' | 'sign'; x: number; len: number; t: number; amp?: number; text?: string[] }

/** Things flying (thrown by the cast, off the stack): a suitcase, a cleaver, a lump of coal (it rolls when it lands),
 *  a cinder (falling where its mark is). `room`: the car it was thrown in (it can't go out through the walls), or -1. */
export interface Shot { kind: 'suitcase' | 'cleaver' | 'coal' | 'cinder'; x: number; y: number; vx: number; vy: number; t: number; rolling?: boolean; from?: Enemy; mark?: number; dead?: number; room?: number }

/** A cut car going off the line: sliding off the rails down the near bank, going over on its side, then left there
 *  (scrolling away with the ground). */
export interface Wreck { x: number; y: number; vx: number; rot: number; tip: number; kind: CarKind; len: number; t: number; seed: number }

/** A horse with nobody on it any more (its robber boarded, or shot off it): galloping off. */
export interface LooseHorse { x: number; vx: number; t: number; seed: number }

/** A robber on his horse in the near lane, or leaping off it (the playtest's: NOT one of the cast yet: a foreground
 *  thing the train runs itself, out of his reach; he becomes one of the cast when he lands on the train). `x`: his
 *  middle (world); `ix`, `variant`: who he is (the enemy he lands as gets them, so he looks the same). */
export interface Rider {
  x: number; t: number; shots: number; st: 'ride' | 'rideAim' | 'leap' | 'off'; stT: number;
  facing: 1 | -1; ix: number; variant: number; seed: number;
  leap?: { x0: number; y0: number; x1: number; y1: number; t: number };
}

/** Somebody out of the world because they're in a car he isn't in (they come back as he goes in). */
export interface Stashed { e: Enemy; car: number }

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
  /** The robbers riding up in the near lane (not the cast till they land on the train). */
  riders: Rider[];
  /** How dark it is (a tunnel), 0..1. */
  dark: number;
  /** The grade under him now (radians, uphill above zero) and the view's tilt easing to it; how far the line's climbed. */
  grade: number; tilt: number; climb: number;
  /** The waterfall on him: how soaked (frames under it, outside), the roar's clock. */
  soak: number; roarT: number;
  /** Who's in a car he isn't in (out of the world till he goes in). */
  stash: Stashed[];
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
  phase: 'intro', settled: false, cars: [], rear: 0, cut: null, cutsDone: new Set(), dist: 0, v: 0, vTarget: 0, passers: [], fired: new Set(), shots: [], wrecks: [], horses: [], riders: [],
  dark: 0, grade: 0, tilt: 0, climb: 0, soak: 0, roarT: 0, stash: [],
  introT: 0, hopT: 0, tube: null, tubeBusy: false, ledgerT: 0, said: {}, cinderT: 0, hitCd: 0, shudder: 0,
}));
