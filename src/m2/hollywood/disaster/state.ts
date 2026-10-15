// Disaster: The Ride's own state (kept per stage build: state.stage is rebuilt every death; what outlives a death is
// in state.stageMemo: the lever, REAL_DISASTERS_MEMO (section.ts), and the once-a-run lines): the show's loop, the
// queue's guests, who's saying what, the booth, and REAL DISASTERS going.

import type { GameState } from '../../../m1/game/core/state';
import type { Block, Enemy } from '../../../m1/types';
import type { Said } from '../section';
import type { LeverThrow } from '../lever';

/** A guest in the queue: where (rx), their seed, shoved (frames left of the stumble, which way), mad (frames). */
export interface QGuest { rx: number; seed: number; shove: number; dir: number; mad: number }

/** The show's loop: which disaster's on (0 quake .. 5 wildfire), frames into it; the first time round. */
export interface Show { beat: number; t: number; on: number; loops: number; squirt: { x: number; y: number; vx: number; vy: number; t: number }[] }

/** REAL DISASTERS, going: the step, frames into it, its line done; how far each thing's gone (0..1, drawn). */
export interface Real {
  phase: 'off' | 'on' | 'done';
  step: number; t: number; all: number; done: boolean;
  /** The cut to the wide shot (0..1 black). */
  fade: number;
  shake: number;
  crack: number; fire: number; frost: number; flood: number; wall: number; truss: number;
  /** The desk fan and the cow, torn loose and flying (world; spin). */
  fan: { x: number; y: number; vx: number; vy: number; rot: number } | null;
  cow: { x: number; y: number; vx: number; vy: number; rot: number } | null;
  /** The sleeper's done for. */
  squashed: boolean;
}

export interface Dz {
  said: Record<string, boolean>;
  /** The PA (the park's horn) while it's said; busy (going or waiting); its last word (frame). */
  pa: Said | null; paBusy: boolean; paAt: number;
  /** The narrator (the theater's speakers) while it's said; the host (the pre-show's TV). */
  narr: Said | null; host: Said | null; hostAt: number; hostI: number;
  /** Somebody's bark over their head; the last (frame). */
  barks: WeakMap<Enemy, Said>; barkAt: number;
  /** A guest's say over their head (where), the last one (frame). */
  guestSaid: { x: number; y: number; s: Said } | null; guestAt: number;
  guests: QGuest[];
  /** The sleeper's mumbling; the last (frame). */
  sleeper: Said | null; sleepAt: number;
  show: Show;
  real: Real;
  /** The lever's throw (0 SIMULATED .. 1 REAL), for drawing; up let go since the last press. */
  lever: number; upLatch: boolean;
  /** The lever being hauled over (../lever.ts), till he's let go of it. */
  pull: LeverThrow | null;
  /** The far wall's block (till it's gone). */
  wall: Block | null;
  /** The real fire's last hit on each (frame). */
  burnt: WeakMap<Enemy, number>;
  /** The theater doors' swing (0..1), the pre-show's. */
  doorL: number; doorT: number;
}

const ALL = new WeakMap<object, Dz>();
export const dzOf = (state: GameState): Dz => {
  const k = state.stage as object;
  let o = ALL.get(k);
  if (!o) {
    o = {
      said: {}, pa: null, paBusy: false, paAt: -9999, narr: null, host: null, hostAt: -9999, hostI: 0,
      barks: new WeakMap(), barkAt: -9999, guestSaid: null, guestAt: -9999, guests: [], sleeper: null, sleepAt: -9999,
      show: { beat: 0, t: -1, on: 0, loops: 0, squirt: [] },
      real: { phase: 'off', step: 0, t: 0, all: 0, done: false, fade: 0, shake: 0, crack: 0, fire: 0, frost: 0, flood: 0, wall: 0, truss: 0, fan: null, cow: null, squashed: false },
      lever: 0, upLatch: true, pull: null, wall: null, burnt: new WeakMap(), doorL: 0, doorT: 0,
    };
    ALL.set(k, o);
  }
  return o;
};
