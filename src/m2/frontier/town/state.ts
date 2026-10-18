// Sawdust Gulch's own state (in Wilderness Land's, under 'town'): the logs on the mill pond, what's flying, the clouds
// and the blasts, the prop pines, the mine's hazards as they are, the belts' logs, the two fights' gates, the barks
// and what's been said. Rebuilt with the stage on every death (what's done before the checkpoint he's back at is worked
// out from it: the saloon's brawl, the showdown).

import type { Enemy, Block } from '../../../m1/types';
import type { GameState } from '../../../m1/game/core/state';
import type { Mover } from '../../foreign/movers';
import type { Said } from '../section';
import { frontierState } from '../section';

/** A rolling log on the mill pond (the wilds' rules, logs.ts): `ladder` 0..1 up the jack ladder, `gone` frames off it. */
export interface PondLog {
  water: number; home: number; len: number;
  x: number; vx: number; spin: number; lean: number; lastVx: number; bumpCd: number;
  m: Mover;
  ladder: number; gone: number;
  /** The birler's log (he drives it while he's on it). */
  birler: Enemy | null;
}

/** Something thrown: a whiskey bottle, a tonic bottle (bursts into a cloud), a hot horseshoe (skids, glows), a
 *  hatchet (sticks), a stick of dynamite (lands, fizzes, blows). */
export interface Throw {
  kind: 'bottle' | 'tonic' | 'horseshoe' | 'hatchet' | 'dynamite';
  x: number; y: number; vx: number; vy: number; t: number;
  from?: Enemy;
  /** Landed: frames since (a horseshoe cooling, a hatchet stuck, a fuse burning). */
  rest?: number;
  dead?: boolean;
}

/** A cloud of miracle tonic, hanging where a bottle burst. */
export interface Cloud { x: number; y: number; t: number; life: number; from?: Enemy }
/** A blast going off (drawn a few frames). */
export interface Blast { x: number; y: number; r: number; t: number }

/** A prop pine: standing, being chopped, falling (its angle), down. */
export interface Pine { x: number; y: number; dir: -1 | 1; len: number; state: 'up' | 'chop' | 'fall' | 'down'; t: number; by: Enemy | null; water: boolean }

/** A cave-in: quiet, the tell (dust, creaking), coming down, rubble (clearing). */
export interface CaveIn { x: number; half: number; state: 'quiet' | 'tell' | 'fall' | 'rubble'; t: number; rocks: { x: number; y: number; vy: number; r: number }[] }
export interface Chute { x: number; state: 'quiet' | 'tell' | 'dump'; t: number; pile: number }
/** A runaway cart coming down the track (`warn`: frames of its warning left before it shows). */
export interface Runaway { x: number; warn: number; t: number; dead: number }
/** The ride cart over the chasm. */
export interface RideCart { m: Mover; x: number; v: number; at: 'a' | 'b' | 'go'; goal: number; hitCd: number }
/** The sawmill's logs on the belts. */
export interface BeltLog { belt: number; x: number; len: number; m: Mover; cut: number }

/** A fight that shuts its doors till it's done: waiting, on (its wave), done. */
export interface Gate { state: 'wait' | 'on' | 'done'; wave: number; foes: Set<Enemy>; walls: Block[]; t: number }

/** The saloon before the brawl: frames he's been in it calm (the bouncer loses patience), what's been said; the BRAWL!
 *  card's frames since it went up (0: not yet). */
export interface Brawl { calmT: number; pop: number; doneT: number }

/** The showdown's duel: waiting for him; the intro (a cutscene: the announcer, the sheriff, him walked to his mark);
 *  the duel itself (his: only his trigger finger; DRAW! at `drawAt`); won (the sheriff outdrawn); the posse (he shot
 *  before the DRAW: the sheriff's dead, his posse after him); lost (too slow: the face-hole death); done. */
export interface Duel {
  phase: 'wait' | 'intro' | 'duel' | 'won' | 'posse' | 'lost' | 'done';
  t: number;
  /** (the duel) When the DRAW! comes (frames into it), and how long he has after it. */
  drawAt: number;
  /** The sheriff (held to his mark till it's settled). */
  sheriff: Enemy | null;
  /** The intro's lines, in turn: which one it's waiting on (bumped by each one's end); the scene's token (a skip or a
   *  death turns stale callbacks away). */
  step: number; token: number;
  /** His trigger last frame (a fresh press is the shot). */
  wasShooting: boolean;
  /** The big card's words while it's up (DRAW!, TOO SLOW, NO DRAW!), and its frames. */
  card: string; cardT: number;
}

export interface Town {
  logs: PondLog[];
  throws: Throw[];
  clouds: Cloud[];
  blasts: Blast[];
  pines: Pine[];
  caves: CaveIn[];
  chutes: Chute[];
  runaways: Runaway[];
  runT: number;
  ride: RideCart | null;
  beltLogs: BeltLog[];
  beltT: number[];
  /** The TNT crates (their enemies) still about. */
  crates: Enemy[];
  /** The firedamp: there (0), or burned off (frames till it's back). */
  gasGone: number;
  saloon: Gate; showdown: Gate;
  brawl: Brawl; duel: Duel;
  /** The camera's pull-back (view.ts), eased toward where it wants to be. */
  zoom: number;
  /** Barks: who's saying what, the last one's frame. */
  barks: Map<Enemy, Said>;
  barkAt: number;
  /** The announcer's words, while they're said. */
  pa: Said | null;
  said: Record<string, boolean>;
  /** The crash's stretcher going by (frames), and the hit cooldowns for the hazards that touch him. */
  stretcherT: number;
  beamCd: number; sawCd: number; cloudCd: number;
}

const gate = (): Gate => ({ state: 'wait', wave: 0, foes: new Set(), walls: [], t: 0 });
export const townOf = (state: GameState) => frontierState<Town>(state, 'town', () => ({
  logs: [], throws: [], clouds: [], blasts: [], pines: [], caves: [], chutes: [], runaways: [], runT: 0, ride: null,
  beltLogs: [], beltT: [0, 60], crates: [], gasGone: 0, saloon: gate(), showdown: gate(),
  brawl: { calmT: 0, pop: 0, doneT: 0 },
  duel: { phase: 'wait', t: 0, drawAt: 0, sheriff: null, step: 0, token: 0, wasShooting: false, card: '', cardT: 0 },
  zoom: 0.8,
  barks: new Map(), barkAt: -999, pa: null, said: {}, stretcherT: 0, beamCd: 0, sawCd: 0, cloudCd: 0,
}));
