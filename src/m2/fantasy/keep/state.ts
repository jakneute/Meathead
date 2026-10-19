// The castle's base's own state (in Fairy Land's, under 'keep'): the staircases and the drawbridge as they swing, the
// toadstools' squash, what the new cast throw, who's barking what, what's been said, Piper over the PA, the boutique's
// suitors having their say, the runway's scene. Rebuilt with the stage on every death; what outlives a death this visit
// is kept by landVisit() (the boutique's said its piece); the runway's scene done, in state.stageMemo (RUNWAY_MEMO).

import type { GameState } from '../../../m1/game/core/state';
import type { Enemy, Block } from '../../../m1/types';
import type { Said } from '../section';
import type { Stair } from '../stairs';
import { fantasyState, landVisit } from '../section';

/** What the castle's new cast throw: a jester's juggling pin (lobbed, spinning), a lady-in-waiting's fan (out flat and
 *  back to her hand, like a boomerang). */
export interface KThrow {
  kind: 'pin' | 'fan';
  x: number; y: number; vx: number; vy: number; t: number;
  from: Enemy | null; dir: number; dead?: boolean;
}

/** A suitor on the runway: who, where, his broom's height, what he's saying, off and flying. */
export interface Flyer { id: string; x: number; y: number; said: Said | null; vx: number; vy: number; gone: boolean }

export interface RunwayScene {
  step: 'wait' | 'walk' | 'talk' | 'launch' | 'fade' | 'done';
  t: number; all: number; line: number;
  /** Who's saying what (Piper's over the horn; a suitor's over his head). */
  said: Said | null; who: string | null;
  fade: number; hearts: number;
  flyers: Flyer[];
  /** His broom: its ledge, mounted (he's on it), its lift. */
  broom: Block | null; mounted: boolean; lift: number;
  /** Who gets a line (in turn). */
  talkers: string[];
}

export interface Keep {
  stairs: Stair[];
  squash: number[];
  throws: KThrow[];
  barks: Map<Enemy, Said>; barkAt: number;
  said: Record<string, boolean>;
  piper: Said | null; piperX: number; piperY: number;
  /** The boutique: who's saying what over there. */
  shop: { said: Said | null; who: string | null; step: 'wait' | 'talk' | 'done' };
  roseAt: number;
  scene: RunwayScene;
}

export const keepOf = (state: GameState) => fantasyState<Keep>(state, 'keep', () => ({
  stairs: [], squash: [], throws: [], barks: new Map(), barkAt: -999, said: {}, piper: null, piperX: 0, piperY: 0,
  shop: { said: null, who: null, step: 'wait' }, roseAt: -999,
  scene: { step: 'wait', t: 0, all: 0, line: 0, said: null, who: null, fade: 0, hearts: 0, flyers: [], broom: null, mounted: false, lift: 0, talkers: [] },
}));

/** The broom port's scene run for good (kept across his deaths; a revisit's deck is empty, the brooms gone). */
export const RUNWAY_MEMO = 'fa-keep-runway';
/** Who flew off from the runway, for the broomstick deathmatch (job 6): ids, comma-separated (glen/rivals.ts's
 *  'blake' | 'rafael' | 'hank' that lived through the ride, and runway.ts's FASTPASS 'chet' | 'thaddeus' | 'dmitri'). */
export const ROSTER_MEMO = 'fa-broom-roster';
export const runwayDone = (state: GameState) => state.stageMemo[RUNWAY_MEMO] === '1';

/** Outlives a death (this visit): the boutique's suitors have had their say. */
const kept = { visit: -1, shop: false };
export const shopDone = () => { if (kept.visit !== landVisit()) { kept.visit = landVisit(); kept.shop = false; } return kept.shop; };
export const setShopDone = () => { shopDone(); kept.shop = true; };
