// The warehouse's own state (kept per stage build: state.stage is rebuilt every death; what has to outlive a death is in
// state.stageMemo: layout.ts's memos): the burst-in, what's flying (coffee, food, the cast's props), the set's hazards,
// the director's ACTION!, THE ENSEMBLE CAST's fight and its bodies, the bulldozer's ending, what's been said and who's
// saying what.

import type { GameState } from '../../../m1/game/core/state';
import type { Enemy, Block } from '../../../m1/types';
import type { Said } from '../section';

/** Something thrown: a runner's coffee, craft services' food, a cast member's prop, Spider-Teen's silly string. */
export interface Shot {
  x: number; y: number; vx: number; vy: number; t: number; rot: number;
  kind: 'coffee' | 'food' | 'prop' | 'string';
  /** What it looks like (the food's: donut, burrito, cake; a prop's: whose). */
  look: number;
  /** Arcs (gravity), or flies flat. */
  lob: boolean;
  from?: Enemy;
}

/** One of the cast, in the fight: who (cast.ts's index), their own health (the engine's never runs out), the enemy. */
export interface Actor {
  i: number; hp: number; max: number;
  e: Enemy | null;
  /** Where they last were (feet), for the body if the engine took them off somewhere. */
  lx: number; ly: number;
  flash: number;
}
/** One on the way in: dropping from the rafters (a hero landing), down on a wire, a wire not hooked up, walking on. */
export interface Arrival {
  i: number; mode: 'drop' | 'wire' | 'unhooked' | 'walk';
  x: number; y: number; vy: number; t: number;
  /** Their entrance line's to be said (the wave's first). */
  speaks: boolean;
}
/** A body (they fall over where they stand and stay; never gibbed): where (feet's middle), which way it fell, how far
 *  over it's gone (0 stood .. 1 down), the pool under it, how high up the heap it lies. */
export interface Body {
  i: number; x: number; y: number; dir: 1 | -1; t: number; fall: number; pool: number; lift: number;
}

export interface Fight {
  phase: 'wait' | 'on' | 'done';
  t: number;
  wave: number; waveT: number;
  queue: Arrival[]; arrivals: Arrival[];
  actors: Actor[];
  bodies: Body[];
  killed: number;
  /** The stage door down behind him (the lock), and how far it's come down (0..1). */
  door: Block | null; doorK: number;
  said: Record<string, boolean>;
}

/** The studio executive (the ending): on his phone, over the pile and the bulldozer without a glance; off the back;
 *  the pages fly and he loses it, chasing it out through the wall; out in the lot, his rant; off after the pages. */
export interface Exec {
  mode: 'off' | 'walk' | 'stand' | 'chase' | 'out' | 'rant' | 'run';
  x: number; y: number; face: 1 | -1; t: number;
  /** What he's saying, while it's said; the rant's over. */
  said: Said | null; done: boolean;
}

export interface Ending {
  phase: 'off' | 'say' | 'cut' | 'drive' | 'lot' | 'done';
  t: number;
  /** The bulldozer's middle (world x), its speed; the blade's front. */
  dx: number; v: number;
  /** The heap (bodies, laid out round its middle): each body's place in it, relative. */
  heap: { i: number; ox: number; oy: number; dir: 1 | -1 }[];
  heapX: number;
  /** The black between the cuts (0..1). */
  fade: number;
  /** The bodies flying out of the hole into the dumpster (the lot's beat). */
  flying: { i: number; x: number; y: number; vx: number; vy: number; dir: 1 | -1; t: number; at: number; inBin: boolean }[];
  caseDown: boolean;
  /** Through the far wall; the white flash of the cut to outside (0..1); frames since it started; the line's done. */
  wallHit: boolean; white: number; all: number; said: boolean;
  ex: Exec;
}

export interface Burst {
  on: boolean; t: number;
  /** The walls' fall (0 up .. 1 flat). */
  fall: number;
  /** The throne-train's wreck sliding to a stop (world x of its middle, its speed, its tilt). */
  tx: number; tv: number; tilt: number;
  step: number;
}

export interface Hazards {
  lights: { y: number; vy: number; down: number; hit: WeakSet<Enemy>; hitHim: boolean }[];
  pyroHit: WeakSet<Enemy>[];
}

export interface Warehouse {
  shots: Shot[];
  said: Record<string, boolean>;
  /** Somebody's bark over their head; the last bark (frame). */
  barks: WeakMap<Enemy, Said>; barkAt: number;
  /** The AD on the bullhorn, while it's said; busy. */
  ad: Said | null; adBusy: boolean;
  /** Somebody in the crowd (at the fallen walls), while it's said; where. */
  crowd: { s: Said; x: number } | null;
  /** The director's ACTION!: who's sped up, till when (frame). */
  action: WeakMap<Enemy, number>;
  /** Silly string on him: frames left. */
  stuck: number;
  burst: Burst;
  fight: Fight;
  ending: Ending;
  hz: Hazards;
  /** Phones flashing in the crowd (world; frame). */
  flashes: { x: number; y: number; at: number }[];
  upLatch: boolean;
  /** One of the cast saying something, by who (their index: on the way in, up, or a body). */
  castSaid: Map<number, Said>;
  /** The far wall (solid till the bulldozer's through it). */
  farWall: Block | null;
  /** The script's laser grid's alarm (frames left of it going). */
  alarm: number;
}

const ALL = new WeakMap<object, Warehouse>();
export const whOf = (state: GameState): Warehouse => {
  const k = state.stage as object;
  let o = ALL.get(k);
  if (!o) {
    o = {
      shots: [], said: {}, barks: new WeakMap(), barkAt: -9999, ad: null, adBusy: false, crowd: null, action: new WeakMap(), stuck: 0,
      burst: { on: false, t: 0, fall: 1, tx: 0, tv: 0, tilt: 0, step: 0 },
      fight: { phase: 'wait', t: 0, wave: -1, waveT: 0, queue: [], arrivals: [], actors: [], bodies: [], killed: 0, door: null, doorK: 0, said: {} },
      ending: { phase: 'off', t: 0, dx: 0, v: 0, heap: [], heapX: 0, fade: 0, flying: [], caseDown: false, wallHit: false, white: 0, all: 0, said: false,
        ex: { mode: 'off', x: 0, y: 0, face: -1, t: 0, said: null, done: false } },
      hz: { lights: [], pyroHit: [] },
      flashes: [], upLatch: true, castSaid: new Map(), farWall: null, alarm: 0,
    };
    ALL.set(k, o);
  }
  return o;
};
