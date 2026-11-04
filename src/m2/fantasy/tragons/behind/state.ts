// The ride from behind's own state (in Truelling Tragons' (state.ts), under `bv`: there while the ride's seen from
// behind, from the dispatch's cut to the arrival's). Rebuilt with the stage on every death; a checkpoint sets it up
// again that far along (ride.ts settleBehind).

import type { Lane } from '../layout';
import type { Gap } from '../state';
import type { Roll, Cam } from './geom';

/** A dragon (three cars): riding its track ('ok'), going over a broken end ('fall': dropped `fy` so far), gone, or a
 *  spare coming down onto the track on bat wings ('arrive'). */
export interface BvTrain { lane: Lane; phase: 'ok' | 'fall' | 'gone' | 'arrive'; t: number; fy: number; fvy: number }

/** On a track: a ring of fire (FIRE: jump through it), a gantry of icicles (ICE: duck), a frozen bar (ICE: jump). */
export interface BvObst { kind: 'ring' | 'icicles' | 'bar'; lane: Lane; s: number; done: boolean; hit: boolean }

/** His grip through a roll: frames DOWN's been let go, how far he's slipping (leaning the wrong way, or not at all),
 *  one hand off (the warning), which way he's leaning and which way the roll wants him to. */
export interface BvLock { down: number; slip: number; oneOff: boolean; lean: -1 | 0 | 1; want: -1 | 0 | 1; roll: Roll; t: number }

export interface Bv {
  trains: BvTrain[];
  gaps: Gap[]; rolls: Roll[]; obst: BvObst[];
  /** The FIRE track's burning stretches (track positions). */
  burns: { a: number; b: number }[];
  /** The LIGHTNING dragon going live: the tell, then live; frames in; the last shock. */
  zap: { phase: 'tell' | 'live'; t: number; shockAt: number } | null;
  fired: Set<number>;
  lastSafe: Lane | null;
  /** His hop: from, to, frames in, how long; frames till he can again. */
  hop: { from: Lane; to: Lane; t: number; dur: number } | null; hopCd: number;
  /** His jump (height over his car, speed), his duck, the jump button last frame. */
  jy: number; jv: number; duck: boolean; jumpHeld: boolean;
  lock: BvLock | null;
  /** Thrown off a roll (screen space: where, how fast, how turned, frames). */
  fling: { t: number; x: number; y: number; vx: number; vy: number; rot: number; src: string } | null;
  /** His dragon over a broken end with him on it (frames: then the death). */
  fall: { t: number; lane: Lane } | null;
  /** Dead: the death's camera (a side shot), and how: off a broken end, the long fall, or anything else. */
  dead: null | 'track' | 'splat' | 'other';
  deadLane: Lane;
  cam: Cam;
  /** The camera's sideways lean toward the middle track (eased), the bank (eased), the horizon (eased). */
  camOx: number; bank: number; hy: number;
  /** His feet on screen (before the view's turned: on his car) and how big he's drawn. */
  me: { x: number; y: number; k: number };
  /** In from the station: frames of the fade in. Out at the unload: frames of the fade out (0: not yet). */
  fadeIn: number; out: number;
  /** The first time each obstacle's come at his track (the cards). */
  taught: Record<string, number>;
  /** Hurt: frames of his flash. */
  hurtT: number;
}
