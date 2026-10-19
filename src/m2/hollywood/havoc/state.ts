// The havoc's own state (kept per stage build: state.stage is rebuilt every death; what outlives a death is in
// state.stageMemo: the facades down, the fling done; and in index.ts's module: died to the tornado).

import type { GameState } from '../../../m1/game/core/state';
import type { Block, Enemy } from '../../../m1/types';
import type { Said } from '../section';
import { landVisit } from '../section';

/** Something coming down (a brick, a studio light, a chunk of a building): its warning first (frames left), then it
 *  falls till it lands at `land` (world y). */
export interface Drop { x: number; y: number; vy: number; warn: number; land: number; kind: 'brick' | 'light' | 'chunk' | 'letter'; rot: number; done: number }
/** Something the wind's throwing along the street (right to left), or a Steve flier (harmless). */
export interface Blown { x: number; y: number; vx: number; vy: number; kind: 'can' | 'sheet' | 'door' | 'flier'; rot: number; hit: boolean }
/** Something the tornado's thrown ahead of him (an arc to a mark on the ground). */
export interface Thrown { x: number; y: number; vx: number; vy: number; kind: 'cow' | 'letter' | 'potty' | 'standee' | 'cart'; ch: string; tx: number; ty: number; t: number; landed: number; rot: number }
/** A looter's loot, lobbed. */
export interface Lob { x: number; y: number; vx: number; vy: number; kind: 'globe' | 'mug' | 'plush'; rot: number; dead: boolean }
/** A facade (or the billboard) coming down: 0 standing, then the creak (t counting), then down (fallen). */
export interface Fall { i: number; phase: 'up' | 'creak' | 'falling' | 'down'; t: number; block: Block | null }
/** A crumbling ledge: its block, how long it's been shaking (0 not yet), gone. */
export interface Crumb { i: number; block: Block | null; shake: number; gone: boolean; fallY: number }

export interface Tornado {
  /** Out (it's come down), where (world x), how fast (px a frame), how long since it last lost ground (frames). */
  on: boolean; x: number; v: number; ramp: number;
  /** Holding still (frames left): it's just come down, or the avalanche has smothered it. */
  hold: number;
  /** Smothered a moment ago (frames since), for the look (thin, choking on snow). */
  choked: number;
  /** The last thing it threw (frame). */
  threwAt: number;
  /** The final surge (past SURGE_AT): it's coming fast and it gets him. */
  surge: boolean;
  /** Frames since it came down (it reaches down out of the clouds first). */
  formT: number;
}
/** A bunker's avalanche (the downhill's): the rumble (the tell), then the wall of snow down the hill (front: world x
 *  of its leading edge; its body AV_LEN behind that), then done. */
export interface Avalanche { k: number; phase: 'idle' | 'tell' | 'run' | 'done'; t: number; front: number; from: number; to: number; hitHim: boolean }
/** A snow slide (the chase's lesser avalanche): low, rolling along the street after him; its warning first. */
export interface Slide { x: number; warn: number; hit: boolean }
/** Something the tornado's torn loose (a board off a facade, a standee, a lamppost, a guest): round the funnel and up
 *  (orbit frames), then thrown out. Looks only. */
export interface Debris { x: number; y: number; vx: number; vy: number; rot: number; w: number; h: number; col: string; orbit: number; ang: number; r: number; t: number; guest: boolean; gk?: number }

export type FlingStep = 'off' | 'caught' | 'spin' | 'flung' | 'cut' | 'done';
export interface Fling { step: FlingStep; t: number; all: number; lineDone: boolean; fade: number; cx: number; cy: number; ang: number; r: number }

export interface Hv {
  said: Record<string, boolean>;
  /** The narrator (on the park's horns now, still deadpan) while it's said; the PA's in the outdoors' own state. */
  narr: Said | null;
  barkAt: number;
  /** The flood: started, its height (over GY), drowning (frames his head's been under), draining (the tornado's
   *  drinking it). */
  flood: { on: boolean; h: number; under: number; drain: boolean; wait: number; wave: number };
  falls: Fall[];
  crumbs: Crumb[];
  drops: Drop[];
  blown: Blown[];
  thrown: Thrown[];
  lobs: Lob[];
  tornado: Tornado;
  avalanches: Avalanche[];
  fling: Fling;
  /** The quake's next spots (picked at its tell), the hail's last hit on him (frame). */
  quakeSpots: number[];
  /** Hazards' last hit on each enemy (frame), so a lingering one isn't every frame. */
  hitAt: WeakMap<Enemy, number>;
  /** The lava crusts (walkable rock) laid over the rivers once it's spent. */
  crusts: Block[];
  /** Up let go since the last press. */
  upLatch: boolean;
  /** The snow banked up where each avalanche went (rx from, to), for the look. */
  banks: [number, number][];
  /** In the water (he hit it just now), for the splash's sound once. */
  wet: boolean;
  /** The chase's snow slides, and when the last one came (frame). */
  slides: Slide[];
  slideAt: number;
  /** What the tornado's torn loose (the guests it's taken among it: civilians.ts keeps who's gone). */
  debris: Debris[];
}

const ALL = new WeakMap<object, Hv>();
export const hvOf = (state: GameState): Hv => {
  const k = state.stage as object;
  let o = ALL.get(k);
  if (!o) {
    o = {
      said: {}, narr: null, barkAt: -9999,
      flood: { on: false, h: -200, under: 0, drain: false, wait: 0, wave: 0 },
      falls: [], crumbs: [], drops: [], blown: [], thrown: [], lobs: [],
      tornado: { on: false, x: 0, v: 0, ramp: 0, hold: 0, choked: 999, threwAt: 0, surge: false, formT: 999 },
      avalanches: [],
      fling: { step: 'off', t: 0, all: 0, lineDone: false, fade: 0, cx: 0, cy: 0, ang: 0, r: 0 },
      quakeSpots: [], hitAt: new WeakMap(), crusts: [], upLatch: true, banks: [], wet: false,
      slides: [], slideAt: 0, debris: [],
    };
    ALL.set(k, o);
  }
  return o;
};

/** The fling's done (the tornado's spent): kept across his deaths, and the way back's sane from then on. */
export const FLUNG_MEMO = 'hollywood-havoc-flung';
/** A facade's down (kept across deaths: checkpoints restore the world as he left it). */
export const FALL_MEMO = (i: number) => `hollywood-havoc-fall-${i}`;
/** Something the tornado's blown away (a facade, a standee, a PA pole: by its key; kept across deaths). */
export const TORN_MEMO = (key: string) => `hollywood-havoc-torn-${key}`;

// ---------------------------------------------------------------------------------------------------------------
// Died to the tornado: kept here, not on the stage (state.stage is rebuilt every death), so it outlives the death;
// it starts over on a fresh way into the land (section.ts's landVisit), never on a respawn.

let tornadoVisit = -1, tornadoDeaths = 0;
/** He just died to the tornado (call it from the kill). */
export const noteTornadoDeath = () => { if (tornadoVisit !== landVisit()) { tornadoVisit = landVisit(); tornadoDeaths = 0; } tornadoDeaths++; };
/** Has the tornado killed him on this visit to the land? (the fling's fourth-wall line) */
export const diedToTornado = () => tornadoVisit === landVisit() && tornadoDeaths > 0;
