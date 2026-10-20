// Truelling Tragons' own state (in Fairy Land's, under 'tragons'): the ride (where it's got to, how fast), the three
// trains (their cars' places as drawn), the holes in the track, the loops spun on it, what's on the track and what's
// flying, his hop, his hold through a loop, the camera and the eye, who's saying what. Rebuilt with the stage on every
// death (a checkpoint sets the ride up again where it was: ride.ts settle); the ride done, in state.stageMemo.

import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import type { Said } from '../section';
import { fantasyState } from '../section';
import type { Lane } from './layout';
import type { Spin, Eye } from './track';

/** A car as it's drawn now: its roof's middle (projected: where it is on screen in the world), which way it's
 *  pointing (radians), its depth, how far it's rolled, and the track position of its middle. */
export interface Car { x: number; y: number; a: number; d: number; roll: number; s: number }

/** A train: its lane, its cars (rear first), how it is ('ok'; 'fall' off a broken end; 'gone'; 'arrive' a spare
 *  coming down onto the track), frames in that, and its blocks (the roof under him, the dragon's head, its tail). */
export interface Train {
  lane: Lane; cars: Car[];
  phase: 'ok' | 'fall' | 'gone' | 'arrive'; t: number;
  /** Going over the end (the fall): its middle, how fast down, how far tipped, its depth. */
  fx: number; fy: number; fvy: number; rot: number; fd: number;
  roof: Block; head: Block; tail: Block;
}

/** A hole in a lane's track (from track position a to b), when it broke (frame), its warning's length (frames). */
export interface Gap { lane: Lane; a: number; b: number; at: number; safe?: Lane; w?: number }

/** On the track: the duck ones (ring, icicles, arc), the jump ones (jet, bar, live rail), and what throws (the dragon
 *  tower, the snow cannon, the storm cloud): which lane, where, and whether it's had him. */
export interface Obst {
  kind: 'ring' | 'icicles' | 'arc' | 'jet' | 'bar' | 'live' | 'tower' | 'cannon' | 'cloud';
  lane: Lane; s: number; len: number;
  shots: number; lastShot: number;
  hit: boolean;
}

/** What's flying at a train: a fireball (lobbed onto its roof at tx), a lightning strike (on tx after the glow), a
 *  snowball (along the lane, at chest height). `t` frames so far of `dur`. */
export interface Shot {
  kind: 'fireball' | 'strike' | 'snowball';
  lane: Lane; tx: number; t: number; dur: number;
  sx: number; sy: number; s: number;
  /** (a fireball, a strike) the roof's height where it comes down, now. */
  ty?: number;
  hit: boolean; dead?: boolean;
}

/** His hop between cars: from where, to which lane, how far through. */
export interface Hop { fx: number; fy: number; to: Lane; t: number; dur: number; up: boolean }

/** Locked in on a car through a loop (or a steep drop: braced): how far along the train he is (0 rear .. 1 front),
 *  whether it's a loop (hold down or he's flung) or a drop, frames into it, frames he's not been holding, his body's
 *  swing round the rail (and how fast). */
export interface Lock { u: number; loop: boolean; t: number; off: number; hang: number; hv: number }

/** A set piece of breath: the dragons' heads breathing across his train at a near miss: who's breathing, when it
 *  started (frames), whether it's had him. */
export interface Breath { from: Lane[]; at: number; to: Lane; hit: boolean }

export interface Tragons {
  phase: 'load' | 'dispatch' | 'ride' | 'arrive' | 'done';
  settled: boolean;
  dist: number; v: number;
  trains: Train[];
  gaps: Gap[]; spins: Spin[]; obst: Obst[]; shots: Shot[]; breath: Breath | null;
  /** The script's events gone off (by index). */
  fired: Set<number>;
  /** The last ONLY ONE SAFE's whole lane (a loop `on: 'safe'` is put on it). */
  lastSafe: Lane | null;
  /** His car (the one he's on, or last was), his hop, frames till he can hop again, his lock. */
  lane: Lane; hop: Hop | null; hopCd: number; lock: Lock | null;
  /** Flung off a loop (all the way down: the camera with him). */
  flung: boolean;
  /** Frames on a station's dragon (it goes when he's been on it a moment); frames since it went. */
  boardT: number; goT: number;
  /** The camera: where it's looking (world), how far out, and how far it's handed over from the engine's (0..1); a
   *  kick (the drops, the loops). The eye (the trains' middle, eased). */
  cam: { fx: number; fy: number; k: number; on: number; kick: number };
  eye: Eye;
  /** The ride's PA (its spiel, or Piper): what's said, whose. */
  pa: Said | null; paWho: 'spiel' | 'piper';
  said: Record<string, boolean>;
  /** When he last tried to shoot, last went down with a train, last was shocked by a live rail, the alarm's last beep,
   *  the splash's spray. */
  shotAt: number; downAt: number; shockAt: number; alarmAt: number; splashAt: number;
  /** The controls card: frames left of it. */
  tips: number;
  /** The rivals at the unload (glimpsed: off the train ahead of his, out the exit): how far they've walked, who's said
   *  their piece, what's being said over whom. */
  unload: { t: number; walk: number; said: number; talk: Record<string, Said | null> };
}

export const tragonsOf = (state: GameState) => fantasyState<Tragons>(state, 'tragons', () => ({
  phase: 'load', settled: false, dist: 0, v: 0, trains: [], gaps: [], spins: [], obst: [], shots: [], breath: null, fired: new Set(),
  lastSafe: null, lane: 2, hop: null, hopCd: 0, lock: null, flung: false, boardT: 0, goT: 0,
  cam: { fx: 0, fy: 0, k: 1, on: 0, kick: 0 }, eye: { x: 0, y: 0 },
  pa: null, paWho: 'spiel', said: {}, shotAt: -999, downAt: -999, shockAt: -999, alarmAt: -999, splashAt: -999, tips: 0,
  unload: { t: 0, walk: 0, said: 0, talk: {} },
}));
