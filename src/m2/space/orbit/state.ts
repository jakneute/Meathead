// The orbit's own state (made fresh every time the stage is built: a death starts the shooter over from the checkpoint;
// what has to outlive a death, the saucer beaten, the lines said once a run, is in state.stageMemo: MEMO).

import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import type { Said } from '../section';
import { spaceState } from '../section';

/** Kept across his deaths (state.stageMemo). */
export const MEMO = {
  /** The saucer's down: never back. */
  ufo: 'm2:orbit:ufo',
  /** He's said his piece coming out into space, and why the gun's rapid (once a run each). */
  hi: 'm2:orbit:hi',
  rapid: 'm2:orbit:rapid',
  /** The widow's said who she is (once a run). */
  met: 'm2:orbit:met',
  /** Down out of the sky in the saucer's wreck: the crater's for it (on foot, the suit gone). */
  crashed: 'm2:orbit:crashed',
} as const;

/** A rock or a piece of junk drifting through (world space, its middle). Rocks break up when shot; junk with an `hp`
 *  breaks up too (into scrap: `scrap`'s its color), the fuel tanks going off as they do; junk with Infinity just takes it. */
export interface Rock {
  x: number; y: number; vx: number; vy: number;
  r: number; rot: number; spin: number; seed: number;
  hp: number; flash: number;
  junk?: { w: number; h: number; what: number };
  /** Its health to start with (the sign crumbles by it). */
  max?: number;
  /** A bit of scrap off something broken (its color); frames since it came off (it can't hurt him for a moment). */
  scrap?: string; age?: number;
  /** The gun pods bolted on it (they go with it). */
  riders?: Enemy[];
}
/** Fighters coming up from behind him: the warning at the screen's left first (its screen y, frames left). */
export interface Warn { sy: number; t: number }
/** A blast going off: its look, and (the first frame) its hurt. */
export interface Boom { x: number; y: number; r: number; t: number; big: boolean }
/** Somebody out here saying something (the words over them while it's said). */
export interface Bark { e: Enemy; said: Said }

export interface Saucer {
  e: Enemy;
  /** Its fight: coming on, at it, pissed (the beam), him going up, inside, blown up, the fall, done. */
  st: 'enter' | 'fight' | 'pissed' | 'beam' | 'inside' | 'boom' | 'fall' | 'factory' | 'gone';
  t: number; total: number;
  hp: number; max: number;
  /** Where it's sat (world, its feet: the bottom middle), where it's going. */
  x: number; y: number; tx: number; ty: number;
  /** What it's doing: its attack, how far into it. */
  move: 'idle' | 'ring' | 'aim' | 'drones' | 'ray' | 'ram';
  mt: number; next: number; last: string;
  /** Its hatch open a moment (frames left). */
  mt2: number;
  /** The ray: aimed down its line (the warning), firing. */
  ray: 0 | 1 | 2;
  /** Quarters gone (its hurt lines). */
  hurtAt: number;
  said: Said | null;
  talkAt: number;
  /** The scene from pissed on: who's said what (no talk-over: each line waits for the last). */
  asked: boolean; done: boolean;
  /** Pulled up its beam: how far (0..1); from where. */
  lift: number; fromX: number; fromY: number;
  open: number; red: number; flash: number;
  /** The fall (screen space, the cutaway): its zoom, the ground coming up, the flash. */
  zoom: number; white: number;
}

export interface Orbit {
  /** Flying (the shooter's running, or he's back out here in the quiet after). */
  on: boolean;
  /** The camera's x (the scroll), and how fast it's going now. */
  scroll: number; sv: number;
  /** His flying: his own velocity (the engine's is for his pose); the knock he last took. */
  vx: number; vy: number; pb: number;
  /** The next wave to come on (waves.ts). */
  wave: number;
  rocks: Rock[]; booms: Boom[]; barks: Bark[];
  /** Everybody the shooter's put out here (to take out once they're off the screen, to set off a shot mine). */
  tracked: Enemy[];
  /** Who's still to come out (of the saucer's hatch, one after another): when (state.frame), and how. */
  pending: { at: number; go: () => void }[];
  /** Warnings up at the left edge (fighters coming up from behind him). */
  warns: Warn[];
  /** The checkpoint as it was last frame (a new one: the saucer's health kept). */
  cpSeen: number;
  lastBark: number;
  saucer: Saucer | null;
  /** Back out here after the saucer's gone (from the crater): nothing about, no scroll. */
  quiet: boolean;
  /** The refill before the saucer's out. */
  refill: boolean;
  /** The gun (gun.ts): its level, the levels it's announced, the flash going up one, the beam on, its words. */
  level: number; levelSaid: number[]; flashUp: number; beam: boolean; gun: { text: string } | null;
  /** The camera's ours (cameraOverride): let go of it when he's out of here. */
  cam: boolean;
}

export const orbitOf = (state: GameState) => spaceState<Orbit>(state, 'orbit', () => ({
  on: false, scroll: 0, sv: 0, vx: 0, vy: 0, pb: 0, wave: 0, rocks: [], booms: [], barks: [], tracked: [], pending: [], warns: [], cpSeen: -1, lastBark: -9999,
  saucer: null, quiet: false, refill: false, cam: false, level: 0, levelSaid: [], flashUp: 0, beam: false, gun: null,
}));
