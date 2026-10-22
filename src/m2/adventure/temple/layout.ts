// The temple's layout and its tricks' timing: where everything is (shared by the section's running, index.ts, and its
// painting, art.ts).

import type { GameState } from '../../../m1/game/core/state';
import type { Said } from '../section';
import { SECTIONS, GY } from '../geometry';

export const { x0, x1 } = SECTIONS.temple;
export const T = x0;

export const CATAPULT_X = T + 1500, DART_WALL = T + 2700, DART_TOP = GY - 200, SNAKE_WALL = T + 3900, SNAKE_TOP = GY - 340;
export const SNAKE_Y = GY - 268, SNAKE_REACH = 230;
export const STATION_X = T + 4400, CART_X = T + 5300, BOOTH_X = T + 5470, SCENE_AT = T + 5130;
/** The end of the station (past the cart, the track goes on through a wall). */
export const END_WALL = T + 5800;
/** Smoke and mirrors: the ghost pane, the fog machine. */
export const GHOST_X = T + 3300, FOG_X = T + 3420;
/** The stagehands' posts, by which trick they run (`variant`). */
export const POSTS: [number, number, 1 | -1][] = [[1, T + 1600, -1], [2, T + 2810, -1], [3, T + 4020, -1], [3, T + 4070, -1]];

export const LEDGES: [number, number, number][] = [
  // over the catapult's run
  [T + 650, GY - 120, 160], [T + 950, GY - 200, 160], [T + 1250, GY - 120, 140],
  // up the dart wall
  [T + 2560, GY - 110, 120],
  // the snake's scaffold (this side), and down the far side
  [T + 3560, GY - 115, 140], [T + 3760, GY - 230, 140], [T + 3970, GY - 230, 110], [T + 4100, GY - 115, 120],
  // the queue's rail, by the station
  [T + 4600, GY - 110, 200],
];
export const SOLIDS: [number, number, number][] = [
  [T - 60, GY - 700, 70], [DART_WALL, DART_TOP, 40], [SNAKE_WALL, SNAKE_TOP, 50],
  [END_WALL, GY - 700, 200],
];
/** The warriors: [x, the floor under them]. None out in the boulders' or the darts' run, none within the safe start's
 *  reach of a checkpoint (spawnSafe.ts): up on the scaffold over the boulders, high and low (the low one comes down
 *  after him into the boulders' run: knock him into a boulder), up on the dart wall's ledge (over the darts), by the
 *  fog at the foot of the snake's scaffold, up on the queue's rail by the station (down on him from there). */
export const ACTORS: [number, number][] = [[T + 1010, GY - 200], [T + 1320, GY - 120], [T + 2600, GY - 110], [T + 3460, GY], [T + 4700, GY - 110]];
/** One of Safari Artie's junior guides (guides.ts), sent round the back after him: up on the snake scaffold's first
 *  step over the warrior by the fog. The spear doesn't take a shoulder charge, the spiked hat doesn't take a dive kick:
 *  the two counters side by side. Out of the snake's reach (but knock him up into it). */
export const GUIDES: [number, number][] = [[T + 3630, GY - 115]];

// ---------------------------------------------------------------------------------------------------------------
// Its state

export interface Boulder { x: number; y: number; vx: number; vy: number; r: number; rolling: boolean; t: number }
export interface Dart { x: number; y: number }
export interface Flyer { seed: number; woman: boolean; x: number; y: number; vx: number; vy: number; rot: number }
export interface Loading {
  step: number; t: number; walked: boolean;
  kicked: number; flying: Flyer[];
  /** The boot on its way out (frames since it started; 0: not kicking). */
  boot: number;
  said: { who: string; s: Said } | null; busy: boolean;
  rolling: number;
}
export interface Temple {
  boulders: Boulder[]; catapultT: number;
  darts: Dart[]; dartT: number; dartHigh: boolean;
  snakeT: number;
  /** First visit: the loading scene's been (a revisit would skip it). */
  loadingSeen: boolean;
  loading: Loading | null;
  fog: { x: number; y: number; r: number; t: number; vx: number }[];
}

/** Is the stagehand running this trick still at it? */
export const crewed = (state: GameState, post: number) => state.enemies.some(e => e.kind === 'm2:stagehand' && e.variant === post && e.health > 0 && !e.isBlownAway);

export const DART_EVERY = 75, DART_TELL = 18, DART_SPEED = 9;
export const dartY = (high: boolean) => (high ? GY - 52 : GY - 16);

export const SNAKE_CYCLE = 150, SNAKE_WIND = 40, SNAKE_OUT = 10, SNAKE_HOLD = 24;
/** How far out the snake's head is (0..1), and whether it's rearing back (the tell). */
export const snakeOut = (t: number) => {
  const c = t % SNAKE_CYCLE;
  if (c < SNAKE_WIND) return { k: -0.12 * (c / SNAKE_WIND), rear: true };
  if (c < SNAKE_WIND + SNAKE_OUT) return { k: (c - SNAKE_WIND) / SNAKE_OUT, rear: false };
  if (c < SNAKE_WIND + SNAKE_OUT + SNAKE_HOLD) return { k: 1, rear: false };
  return { k: Math.max(0, 1 - (c - SNAKE_WIND - SNAKE_OUT - SNAKE_HOLD) / 40), rear: false };
};

/** The guests in the cart at the station (first visit), and where they sit from its middle. */
export const GUESTS = [{ seed: 7101, woman: false }, { seed: 3317, woman: true }, { seed: 5523, woman: true }];
export const SEAT = [-34, -6, 22];
