// Enemies that aren't in the scene yet: out of the world till he's near. A land builds every section's cast at once;
// left in the world, the ones far off (whole pavilions away, a stretch he's skipped by starting at a checkpoint) still
// fall, drown, get hit by a set piece he can't see, and die out of sight with all their noise. So the far ones sleep,
// held aside, and wake (put into the world as they were placed) as the camera comes up on them.

import type { GameState } from '../m1/game/core/state';
import type { Enemy } from '../m1/types';
import { isMidBoss } from '../m1/game/combat/midBoss';
import { CANVAS_WIDTH } from '../m1/constants';

/** How far past the screen's edges (each side) the cast are awake. */
const AWAKE = 700;
const POOLS = new WeakMap<object, Enemy[]>();

const near = (state: GameState, e: Enemy) => {
  const x = e.pos.x + e.width / 2, l = state.camera.x - AWAKE, r = state.camera.x + CANVAS_WIDTH + AWAKE;
  return x > l && x < r;
};
const keepsAwake = (e: Enemy) => e.type === 'boss' || isMidBoss(e) || !!e.innocent;

/** After the stage is built and he's put where he starts: everybody not near him goes to sleep. */
export const sleepFar = (state: GameState) => {
  if (!state.stage) return;
  const pool: Enemy[] = [];
  state.enemies = state.enemies.filter(e => { if (keepsAwake(e) || near(state, e)) return true; pool.push(e); return false; });
  POOLS.set(state.stage as object, pool);
};

/** Each frame: whoever's come near wakes, where they were placed. */
export const wakeNear = (state: GameState) => {
  const pool = state.stage ? POOLS.get(state.stage as object) : undefined;
  if (!pool || !pool.length) return;
  for (let i = pool.length - 1; i >= 0; i--) {
    const e = pool[i];
    if (!near(state, e)) continue;
    pool.splice(i, 1);
    if (e.health > 0 && !e.isBlownAway) state.enemies.push(e);
  }
};
