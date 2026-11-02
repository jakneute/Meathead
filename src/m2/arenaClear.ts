// The land's own enemies out of a locked fight (the user's: "when fighting the ensemble and rush limbaugh, there are
// regular enemies at the edges who try to attack me despite being barricaded from me. make sure they go away and are
// inactive during sub boss fights"). Every boss and sub-boss fight with a locked room says so as it marks itself
// (bossQuiet.ts markBossFight's `arena`); each frame (dormant.ts's wakeNear: every land, every frame) this:
//
//   - knows who's the land's own: the cast placed at the build (dormant.ts's sleepFar notes them), and anybody else
//     about a while (half a second) before a fight came on (a spawner's, a tent's).
//   - while one's on: any of the land's own outside the room is gone: out of the world, marked dead so nothing waits
//     on it, never a kill (no callout, no credit, no drop, no gore: the despawn-isn't-a-kill rule, as spawnSafe.ts).
//     Anybody new as the fight comes on, or since, is the fight's (its boss, its cast, its adds, lions and stampedes
//     coming in from off the side) and left be; so are mid-bosses, innocents, the harmless (a boss's hit boxes), anybody
//     a scene's holding, and the dead.
//   - as it comes on: the enemy shots outside the room go too (nobody's left out there to have fired them).
//   - and nobody asleep outside the room wakes while it's on (dormant.ts holds them in its pool).
// The gone stay gone (a checkpoint's rebuild puts the cast back as placed, as ever).

import type { GameState } from '../m1/game/core/state';
import type { Enemy } from '../m1/types';
import { isMidBoss } from '../m1/game/combat/midBoss';
import { bossArena, type BossArena } from './bossQuiet';

/** How long before a fight came on somebody has to have been about to be the land's, not the fight's (frames). */
const SETTLED = 30;
/** Placed at the build: the land's, however long ago. */
const CAST = -1e9;

interface Clear { since: WeakMap<Enemy, number>; onAt: number | null }
const CLEARS = new WeakMap<object, Clear>();

const clearOf = (state: GameState) => {
  let c = CLEARS.get(state.stage as object);
  if (!c) { c = { since: new WeakMap(), onAt: null }; CLEARS.set(state.stage as object, c); }
  return c;
};

const spared = (e: Enemy) => e.type === 'boss' || isMidBoss(e) || !!e.innocent || !!e.harmless || !!e.puppet || e.health <= 0 || !!e.isBlownAway;

/** dormant.ts's sleepFar: the stage's cast as placed (awake and asleep), the land's own. */
export const noteCast = (state: GameState, cast: Enemy[]) => {
  if (!state.stage) return;
  const c = clearOf(state);
  for (const e of cast) c.since.set(e, CAST);
};

/** dormant.ts's wakeNear, every frame. The locked room while its fight's on (nobody outside it wakes), else null. */
export const tickArenaClear = (state: GameState): BossArena | null => {
  if (!state.stage) return null;
  const c = clearOf(state), A = bossArena(state);
  if (!A) {
    c.onAt = null;
    for (const e of state.enemies) if (!c.since.has(e)) c.since.set(e, state.frame);
    return null;
  }
  const first = c.onAt === null;
  if (first) c.onAt = state.frame;
  const before = c.onAt! - SETTLED, since = c.since;
  const outside = (x: number) => x < A.l || x > A.r;
  const out: string[] = [];
  state.enemies = state.enemies.filter(e => {
    const t = since.get(e);
    if (t === undefined || t > before || spared(e) || !outside(e.pos.x + e.width / 2)) return true;
    e.health = 0; e.vel.x = 0; e.vel.y = 0;
    out.push(e.kind ?? e.enemyType ?? '?');
    return false;
  });
  if (first) state.projectiles = state.projectiles.filter(p => p.owner !== 'enemy' || !!p.visualOnly || !outside(p.pos.x + p.width / 2));
  if (import.meta.env?.DEV && out.length) console.info(`[arenaClear] out of the fight: ${out.join(', ')}`);
  return A;
};
