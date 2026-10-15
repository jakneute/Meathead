// The warehouse's own state (kept per stage build: state.stage is rebuilt every death; what has to outlive a death is in
// state.stageMemo: layout.ts's memos): the burst-in, what's flying (coffee, food), the set's hazards, the director's
// ACTION!, THE ENSEMBLE CAST's fight (who's on him, who's coming, the bodies), the bulldozer's ending, what's been said
// and who's saying what.

import type { GameState } from '../../../m1/game/core/state';
import type { Enemy, Block, Projectile } from '../../../m1/types';
import type { Said } from '../section';

/** Something thrown: a runner's coffee, craft services' food (the cast's props and silly string: no more). */
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
  /** On him (the dogpile): which hold (fight.ts SLOTS), frames since they jumped on, where they jumped from (off his
   *  feet's middle); null: off him. Off the engine's list while they're on him (fight.ts carries and draws them). */
  cling: { slot: number; t: number; fx: number; fy: number } | null;
  /** Frames gone off the engine's list in his grab (he's got hold of them). */
  heldT: number;
}
/** One on the way in: dropping from the rafters (a hero landing), or lowered on a wire. */
export interface Arrival {
  i: number; mode: 'drop' | 'wire';
  x: number; y: number; vy: number; t: number;
}
/** A body (they fall over where they stand and stay; never gibbed): where (feet's middle), which way it fell, how far
 *  over it's gone (0 stood .. 1 down), the pool under it, how high up the heap it lies. */
export interface Body {
  i: number; x: number; y: number; dir: 1 | -1; t: number; fall: number; pool: number; lift: number;
}

export interface Fight {
  /** 'intro': the first of them (always CAPTAIN AMERICANO) dropping in and saying his piece (a cutscene). */
  phase: 'wait' | 'intro' | 'on' | 'done';
  t: number;
  /** Who's in it this time, in the order they come (CAPTAIN AMERICANO first, the rest shuffled each attempt), and the
   *  next to come; frames till the next may come. */
  order: number[]; next: number; spawnT: number;
  arrivals: Arrival[];
  actors: Actor[];
  bodies: Body[];
  killed: number;
  /** The stage door down behind him (the lock), and how far it's come down (0..1). */
  door: Block | null; doorK: number;
  said: Record<string, boolean>;
  /** The last of the cast's barks (frame): they're kept sparse. */
  barkAt: number;
  /** Shaking them off: the move that last threw them (each charge once), the last shot that knocked one loose (frame),
   *  his shots already counted, his weapon's cooldown last frame (a shot that makes no projectile). */
  moveId: number; knockAt: number; seen: WeakSet<Projectile>; lastCd: number;
  /** The pile's had him (the crush). */
  crushed: boolean;
}

/** The studio executive (the ending): stood at the back of the stage by the script on his phone, well out of the
 *  bulldozer's way; the case goes over and he loses it; out in the lot after the pages, his rant; off after them. */
export interface Exec {
  mode: 'off' | 'stand' | 'lose' | 'out' | 'rant' | 'run';
  x: number; y: number; face: 1 | -1; t: number;
  /** What he's saying, while it's said; the rant's over. */
  said: Said | null; done: boolean;
}

export interface Ending {
  phase: 'off' | 'say' | 'cut' | 'drive' | 'lot' | 'done';
  t: number;
  /** The bulldozer's middle (world x), its speed. */
  dx: number; v: number;
  /** The heap (bodies, laid out round its middle): each body's place in it, relative. */
  heap: { i: number; ox: number; oy: number; dir: 1 | -1 }[];
  heapX: number;
  /** The black between the cuts (0..1). */
  fade: number;
  /** The bodies flying out of the hole into the dumpster (the lot's beat). */
  flying: { i: number; x: number; y: number; vx: number; vy: number; dir: 1 | -1; t: number; at: number; inBin: boolean }[];
  caseDown: boolean;
  /** Frames since the case went over (it topples, the pages go up). */
  caseT: number;
  /** The camera pushed in on the case as the pile hits it (0..1). */
  zoomK: number;
  /** Through the far wall; the white flash of the cut to outside (0..1); frames since it started; the line's done. */
  wallHit: boolean; white: number; all: number; said: boolean;
  ex: Exec;
}

/** The director in the burst-in (not an enemy: the scene's): where he stands, what he's doing, what he's saying. */
export interface Director {
  x: number; face: 1 | -1;
  mode: 'sit' | 'up' | 'think' | 'yell' | 'run' | 'gone';
  said: Said | null;
}
/** The producer, on the set before the crash (the scene's, not an enemy): laying down the law to the cast and crew;
 *  looking up at the noise; dead under the throne-train (and there for good). */
export interface Producer {
  mode: 'rant' | 'look' | 'dead';
  said: Said | null;
  /** When he died (frame: the blood spreading). */
  at: number;
}
/** The crew off the sets in the background (the burst-in's KILL THEM ALL): out over the fallen back wall at the public. */
export interface Runner { x: number; seed: number; t: number; at: number }

export interface Burst {
  on: boolean; t: number;
  /** b.t when the roof goes (the producer's had his say first; far off till then). */
  c0: number;
  /** The producer, under where it comes down. */
  prod: Producer;
  /** The walls' fall (0 up .. 1 flat); falling (frames since the creak, or -1). */
  fall: number; falling: number;
  /** The throne-train coming down through the roof: its middle, its height (feet), how fast it's falling, its tilt. */
  tx: number; ty: number; tv: number; tilt: number;
  /** Him: coming down with it; landed. */
  my: number; mv: number; landed: boolean;
  step: number;
  dir: Director;
  /** The crew off the sets, out at the public. */
  runners: Runner[];
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
  /** One of the cast saying something, by who (their index: on the way in, up, on him, or a body). */
  castSaid: Map<number, Said>;
  /** The far wall (solid till the bulldozer's through it). */
  farWall: Block | null;
}

const ALL = new WeakMap<object, Warehouse>();
export const whOf = (state: GameState): Warehouse => {
  const k = state.stage as object;
  let o = ALL.get(k);
  if (!o) {
    o = {
      shots: [], said: {}, barks: new WeakMap(), barkAt: -9999, ad: null, adBusy: false, crowd: null, action: new WeakMap(), stuck: 0,
      burst: { on: false, t: 0, c0: 0, prod: { mode: 'dead', said: null, at: -9999 }, fall: 1, falling: -1, tx: 0, ty: 0, tv: 0, tilt: 1, my: 0, mv: 0, landed: true, step: 0,
        dir: { x: 0, face: -1, mode: 'gone', said: null }, runners: [] },
      fight: { phase: 'wait', t: 0, order: [], next: 0, spawnT: 0, arrivals: [], actors: [], bodies: [], killed: 0, door: null, doorK: 0, said: {},
        barkAt: -9999, moveId: -1, knockAt: -9999, seen: new WeakSet(), lastCd: 0, crushed: false },
      ending: { phase: 'off', t: 0, dx: 0, v: 0, heap: [], heapX: 0, fade: 0, flying: [], caseDown: false, caseT: 0, zoomK: 0, wallHit: false, white: 0, all: 0, said: false,
        ex: { mode: 'off', x: 0, y: 0, face: -1, t: 0, said: null, done: false } },
      hz: { lights: [], pyroHit: [] },
      flashes: [], upLatch: true, castSaid: new Map(), farWall: null,
    };
    ALL.set(k, o);
  }
  return o;
};
