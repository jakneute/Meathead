// Truelling Tragons' own state (in Fairy Land's, under 'tragons'): the ride (where it's got to, how fast), the three
// trains, the holes in the track, what's on the track and what's flying, his hop, the camera, who's saying what.
// Rebuilt with the stage on every death (a checkpoint sets the ride up again where it was: ride.ts settle). What
// outlives a death (the rivals dead this visit) is kept here by landVisit(); the ride done, in state.stageMemo.

import type { GameState } from '../../../m1/game/core/state';
import type { Block, Enemy } from '../../../m1/types';
import type { Said } from '../section';
import { fantasyState, landVisit } from '../section';
import type { Lane } from './layout';

export type RivalId = 'blake' | 'rafael' | 'hank';

/** A train: its lane, its roof (world y) now and last frame, how it is ('ok'; 'fall' off a broken end; 'gone'; 'arrive'
 *  a spare coming down onto the track), frames in that, and its blocks (the roof, the dragon's head, its tail). */
export interface Train {
  lane: Lane; y: number; py: number;
  phase: 'ok' | 'fall' | 'gone' | 'arrive'; t: number;
  /** Going over the end (the fall): where, how fast down, how far tipped. */
  fx: number; fy: number; fvy: number; rot: number;
  roof: Block; head: Block; tail: Block;
  /** The spare coming in has Hank on it. */
  hank?: boolean;
}

/** A hole in a lane's track (from track position a to b), when it broke (frame), and whether he was told. */
export interface Gap { lane: Lane; a: number; b: number; at: number; safe?: Lane; spare?: 'hank'; called?: boolean; w?: number }

/** On the track: the duck ones (ring, icicles, arc), the jump ones (jet, bar, live rail), and what throws (the dragon
 *  tower, the snow cannon, the storm cloud): which lane, where, and who it's had already. */
export interface Obst {
  kind: 'ring' | 'icicles' | 'arc' | 'jet' | 'bar' | 'live' | 'tower' | 'cannon' | 'cloud';
  lane: Lane; s: number; len: number;
  /** (the throwers) How many it's let go, when last. */
  shots: number; lastShot: number;
  /** Who it's had (him, a rival), and which rivals have seen it coming (`d<id>`: ducked it or not, decided). */
  hit: Set<unknown>;
}

/** What's flying at a train: a fireball (lobbed onto its roof at tx), a lightning strike (on tx after the glow), a
 *  snowball (along the lane, at chest height). `t` frames so far of `dur`. */
export interface Shot {
  kind: 'fireball' | 'strike' | 'snowball';
  lane: Lane; tx: number; t: number; dur: number;
  /** (a fireball) where it was let go from (world); (a snowball) where along the track it is. */
  sx: number; sy: number; s: number;
  hit: Set<object>; dead?: boolean;
}

/** What a rival throws (world space, under gravity). */
export interface Thrown { item: 'shaker' | 'dumbbell' | 'turkey'; x: number; y: number; vx: number; vy: number; spin: number; from: Enemy; dead?: boolean }

/** His hop between cars: from where, to which lane, how far through. */
export interface Hop { fx: number; fy: number; to: Lane; t: number; dur: number; up: boolean }

export interface Tragons {
  phase: 'load' | 'dispatch' | 'ride' | 'arrive' | 'done';
  settled: boolean;
  dist: number; v: number;
  trains: Train[];
  gaps: Gap[]; obst: Obst[]; shots: Shot[]; thrown: Thrown[];
  /** The script's events gone off (by index). */
  fired: Set<number>;
  /** His car (the one he's on, or last was), his hop, frames till he can hop again. */
  lane: Lane; hop: Hop | null; hopCd: number;
  /** Frames on the station's dragon (it goes when he's been on it a moment); frames since it went. */
  boardT: number; goT: number;
  /** The camera: where it's looking (world), how far out, and how far it's handed over from the engine's (0..1). */
  cam: { fx: number; fy: number; k: number; on: number };
  /** The ride's PA (its spiel, or Piper): what's said, whose; a rival's or the cast's words over them. */
  pa: Said | null; paWho: 'spiel' | 'piper';
  barks: Map<Enemy, Said>;
  said: Record<string, boolean>;
  /** When he was last shocked by a live rail, last tried to shoot, last went down with a train. */
  shockAt: number; shotAt: number; downAt: number;
  /** Who's on the ride (the rivals, by id). */
  rivals: Partial<Record<RivalId, Enemy>>;
  /** The controls card: frames left of it. */
  tips: number;
  /** The alarm's last beep. */
  alarmAt: number;
}

export const tragonsOf = (state: GameState) => fantasyState<Tragons>(state, 'tragons', () => ({
  phase: 'load', settled: false, dist: 0, v: 0, trains: [], gaps: [], obst: [], shots: [], thrown: [], fired: new Set(),
  lane: 2, hop: null, hopCd: 0, boardT: 0, goT: 0, cam: { fx: 0, fy: 0, k: 1, on: 0 },
  pa: null, paWho: 'spiel', barks: new Map(), said: {}, shockAt: -999, shotAt: -999, downAt: -999, rivals: {}, tips: 0, alarmAt: -999,
}));

/** Outlives a death (this visit): which rivals are dead. */
const kept = { visit: -1, dead: new Set<RivalId>() };
export const keptDead = () => {
  if (kept.visit !== landVisit()) { kept.visit = landVisit(); kept.dead = new Set(); }
  return kept.dead;
};
