// The White House, part one's own state (in Cartoon Land's, under 'whitehouse1'): the transformation scene, the
// hazards as they go (the vacuum, the chandelier, the bowling balls, the sprinklers), what the mean men throw, who's
// barking what, Chelsea, the pundits' fights, the puffs of smoke. Rebuilt with the stage on every death; what outlives
// a death is below (keyed by landVisit(): what he's said, what Chelsea's said) or in state.stageMemo (the memos).

import type { GameState } from '../../../m1/game/core/state';
import type { Enemy, Block } from '../../../m1/types';
import type { Said } from '../section';
import type { Tower } from '../sway';
import { cartoonState, landVisit } from '../section';

/** Been redrawn as the cat (the transformation's run: a later way in, a quick scribble back into the cat, no scene). */
export const CAT_MEMO = 'ct-wh-cat';
/** The pundits dead (never back once beaten). */
export const PEROT_MEMO = 'ct-wh-perot';
export const FALWELL_MEMO = 'ct-wh-falwell';
/** Job 4's: the projector's collapsed (after that the White House is the stage behind it, no cat). */
export const COLLAPSED_MEMO = 'ct-wh-collapsed';

/** Something the mean men threw: a lobbyist's money bag (lobbed, it bursts in bills), a pollster's clipboard (flung
 *  flat, spinning), the blimp's stink bomb (dropped: a green cloud where it lands, hurting a moment). */
export interface Throw {
  kind: 'moneybag' | 'clipboard' | 'stinkbomb' | 'cloud' | 'bills';
  x: number; y: number; vx: number; vy: number; t: number;
  from: Enemy | null; dead?: boolean;
}
/** A pundit's throw: a pie chart (lobbed, spinning, it splits in slices later on), a slice, a Bible (lobbed, heavy,
 *  end over end), a collection plate (flung flat, a coin spray). */
export interface PunditThrow {
  kind: 'pie' | 'slice' | 'bible' | 'plate';
  x: number; y: number; vx: number; vy: number; t: number; spin: number; dead?: boolean;
  /** (a pie) splits into slices at its peak. */
  split?: boolean;
}
/** A bowling ball: where, how fast, rolling. */
export interface Ball { x: number; y: number; vx: number; vy: number; spin: number; t: number; dead?: boolean }
/** A cartoon puff of smoke where something went: the cloud, stars, a twinkle; flying off out of it, what's left of
 *  them (a pundit's costume bits). */
export interface Puff { x: number; y: number; t: number; size: number; bits?: PuffBit[] }
export interface PuffBit { what: string; x: number; y: number; vx: number; vy: number; rot: number; spin: number }

export type PunditId = 'perot' | 'falwell';
export interface Pundit {
  id: PunditId;
  phase: 'wait' | 'intro' | 'on' | 'dying' | 'done';
  t: number;
  /** His health (his own: the enemy's just his body to the engine), its max, hit flash. */
  hp: number; max: number; flash: number;
  e: Enemy | null;
  walls: Block[];
  ledges: Block[];
  said: Said | null; barkAt: number; baffleAt: number;
  /** The intro's said (in turn). */
  introStep: number;
  /** His throws. */
  throws: PunditThrow[];
  /** What he's doing (his AI's own). */
  act: string; actT: number; nextAct: number; airborne: boolean; hops: number;
}

export interface Whitehouse {
  towers: Tower[];
  throws: Throw[];
  barks: Map<Enemy, Said>; barkAt: number;
  puffs: Puff[];
  /** The vacuum: where, which way, paused at an end (frames), the bag's puff. */
  vac: { x: number; dir: 1 | -1; pause: number; bag: number; hitAt: number };
  /** The chandelier's block (a one-way ledge kept where its top ring is), him on it. */
  chand: { b: Block | null; x: number; y: number; on: boolean };
  balls: Ball[]; ballT: number; ballTell: number;
  /** The transformation scene (null: not on). */
  scene: Scene | null;
  /** A quick scribble back into the cat (a later way in): frames left. */
  scribble: number;
  perot: Pundit; falwell: Pundit;
  /** Ride hits on the cast: frame each was last hit by a hazard. */
  hazHit: WeakMap<Enemy, number>;
  /** His health last frame (Chelsea's "ouch"). */
  lastHp: number;
}

export interface Scene {
  t: number; all: number; step: 'erase' | 'blank' | 'draw' | 'look' | 'chelsea' | 'done';
  line: number;
  /** How far through rubbing him out (0..1), drawing him back in (0..1). */
  erase: number; draw: number;
  /** Where he stands for it (his feet), the way he faces. */
  x: number; y: number;
}

const pundit = (id: PunditId, max: number): Pundit => ({
  id, phase: 'wait', t: 0, hp: max, max, flash: 0, e: null, walls: [], ledges: [], said: null, barkAt: -999, baffleAt: -999,
  introStep: 0, throws: [], act: 'idle', actT: 0, nextAct: 60, airborne: false, hops: 0,
});

export const PEROT_HP = 3900, FALWELL_HP = 5400;

export const whOf = (state: GameState) => cartoonState<Whitehouse>(state, 'whitehouse1', () => ({
  towers: [], throws: [], barks: new Map(), barkAt: -999, puffs: [],
  vac: { x: 0, dir: 1, pause: 0, bag: 0, hitAt: -999 },
  chand: { b: null, x: 0, y: 0, on: false },
  balls: [], ballT: 60, ballTell: 0,
  scene: null, scribble: 0,
  perot: pundit('perot', PEROT_HP), falwell: pundit('falwell', FALWELL_HP),
  hazHit: new WeakMap(), lastHp: 999,
}));

/** What he's said this visit (once each a visit: a death doesn't make him say it again). */
let saidVisit = -1;
const said = new Set<string>();
export const saidOnce = (k: string) => {
  if (saidVisit !== landVisit()) { saidVisit = landVisit(); said.clear(); }
  if (said.has(k)) return false;
  said.add(k);
  return true;
};
export const hasSaid = (k: string) => saidVisit === landVisit() && said.has(k);
