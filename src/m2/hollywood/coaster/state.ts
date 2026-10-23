// Thrones of the Stars' own state (kept per stage build: state.stage is rebuilt every death; what has to outlive a
// death is in state.stageMemo: layout.ts's memos): the ride, the stops' waves, the queue's guests, what's flying (the
// janitors' plungers), what's been said, who's saying what.

import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import type { Said } from '../section';
import type { Track } from './track';
import type { Place } from './layout';
import type { Beat, RideName, Who } from './script';
import type { LeverThrow } from '../lever';

/** A thrown plunger (lobbed; stuck on his face, or upright on the floor where it landed). */
export interface Plunger { x: number; y: number; vx: number; vy: number; t: number; stuck: number; rot: number }
/** A guest in the queue: where (rx), their seed, shoved (frames left of the stumble, which way). */
export interface QGuest { rx: number; seed: number; shove: number; dir: number; mad: number }
/** A stop's staff coming out, wave by wave. */
export interface StopRun {
  phase: 'idle' | 'intro' | 'fight' | 'clear';
  wave: number; t: number; spawnT: number;
  /** Still to come out this wave; out and alive. */
  queue: [string, 'door' | 'upper'][]; out: Enemy[];
  /** The doors' swing (0 shut .. 1 open), for drawing; frames left of each held open (somebody coming out). */
  door: number; upper: number; doorT: number; upperT: number;
  /** The intro's done: on with the fight; how many have come out (their seeds). */
  go: boolean; n: number;
}
export interface Ride {
  /** On the train (riding; the launch's flight; the cut to the station), or not. */
  on: boolean; track: Track | null; s: number; v: number; t: number;
  /** Where the train's parked (the place he's at), or null while it's going. */
  at: Place | null;
  /** The launch's flight (off the end of the track): the train's middle, its speed, its spin. */
  fly: { x: number; y: number; vx: number; vy: number; rot: number; t: number } | null;
  /** The cut (a fade to black, or white for the launch): 0..1. */
  fade: number;
  /** Cues said this ride. */
  cued: Set<string>;
  /** The camera's look-ahead and its pull-back. */
  lx: number; ly: number; zoom: number;
  /** Where the camera's looking (world): the zoom's about it. */
  fx: number; fy: number;
  /** Its script (script.ts): which ride; the beats still to come; what's come up and is waiting its turn; a line being
   *  said (its number: a line from an earlier ride finishing doesn't count; 0 none); frames since the last one finished;
   *  what each beat said; frames held parked for the script (before it goes, at the end); the rides' count. */
  name: RideName; beats: Beat[]; waiting: { who: Who; text: string; at: string }[]; saying: number; quiet: number;
  said: Map<string, string>; held: number; n: number;
  /** It's gone (left the platform: the board beats said); the beat being said. */
  gone: boolean; sayingAt: string;
}
export interface Coaster {
  ride: Ride;
  stops: StopRun[];
  guests: QGuest[];
  plungers: Plunger[];
  /** His face, plungered (frames left). */
  faceStuck: number;
  said: Record<string, boolean>;
  /** Stop 3 on NORMAL: how many times he's argued his way off it (L.LEVER_FIRST in order; then he gives in). */
  normalNo: number;
  /** The PA (the ride's narrator, or the park's), while it's said; busy (a line going or waiting); last word. */
  pa: Said | null; paBusy: boolean; paAt: number;
  /** Whose: the ride's narrator (in the thrones' headrests) or the park's PA (the horn on the queue's arch). */
  paFrom: 'train' | 'horn';
  /** Somebody's bark over their head; the last one (frame). */
  barks: WeakMap<Enemy, Said>; barkAt: number;
  /** A guest's outrage over their head (which guest). */
  guestSaid: { i: number; s: Said } | null; guestAt: number;
  /** The sleeper's mumbling over the booth. */
  sleeper: Said | null; sleepAt: number;
  /** The fumes (stop 3): frames into the cycle. */
  fumeT: number; fumeHit: WeakSet<Enemy>;
  /** The lever's throw (0 NORMAL .. 1 EXPERIMENTAL), for drawing; up's been let go since the last press. */
  lever: number; upLatch: boolean;
  /** The lever being thrown (him hauling on it: ../lever.ts), or null. */
  pull: LeverThrow | null;
  /** Stop 2's track walker, being hit: frames since (0: not yet). */
  walkerT: number; walker: { x: number; y: number; vx: number; vy: number; rot: number } | null;
  /** The star toilets (thrones.ts): crouch held beside one (frames, which); sat on one, going (null: not). */
  squat: { i: number; t: number };
  sit: Sitting | null;
}
/** Sat on a star toilet: which; frames since he sat; where he hopped on from; when it blows (frames since he sat);
 *  the blowout going (frames since: no getting up now); the steam's going; what's been said this sit. */
export interface Sitting { i: number; t: number; from: { x: number; y: number }; blowAt: number; blow: number; steam: boolean; said: Record<string, boolean> }

const ALL = new WeakMap<object, Coaster>();
export const coasterOf = (state: GameState): Coaster => {
  const k = state.stage as object;
  let o = ALL.get(k);
  if (!o) {
    o = {
      ride: { on: false, track: null, s: 0, v: 0, t: 0, at: null, fly: null, fade: 0, cued: new Set(), lx: 0, ly: 0, zoom: 1, fx: 0, fy: 0, name: 'r1', beats: [], waiting: [], saying: 0, quiet: 0, said: new Map(), held: 0, n: 0, gone: false, sayingAt: '' },
      stops: [0, 1, 2].map(() => ({ phase: 'idle', wave: 0, t: 0, spawnT: 0, queue: [], out: [], door: 0, upper: 0, doorT: 0, upperT: 0, go: false, n: 0 })),
      guests: [], plungers: [], faceStuck: 0, said: {}, normalNo: 0,
      pa: null, paBusy: false, paAt: -9999, paFrom: 'train', barks: new WeakMap(), barkAt: -9999,
      guestSaid: null, guestAt: -9999, sleeper: null, sleepAt: -9999, fumeT: 0, fumeHit: new WeakSet(), lever: 0, upLatch: true, pull: null, walkerT: 0, walker: null, squat: { i: -1, t: 0 }, sit: null,
    };
    ALL.set(k, o);
  }
  return o;
};
