// A safe start at a checkpoint (the user: "make sure no enemies or hazards spawn at checkpoints. if there is normally
// an enemy there, make sure there isn't one", "they don't spawn if you spawn near it, they do spawn otherwise").
// Every M2 land starts him at a checkpoint the same way (its build: the cast placed, him put on the checkpoint, then
// dormant.ts's sleepFar; each frame after, wakeNear), so this hangs off those two and covers every land, every way in:
// a death, the checkpoint-skip cheat, a save, a fresh way into the land.
//
//   At the start: anybody placed within the safe box round the spot isn't there this life (out of the world, marked
//   dead so nothing waits on them; never a kill: no callout, no credit, no drop). Bosses, mid-bosses (sub-bosses must
//   die: never taken out), innocents, the harmless and anybody a scene is holding (puppet) are left be. Enemy shots in
//   the box go too.
//   For the grace after: anybody new in the box (a spawner, a wave, a dormant one woken) is gone the same way;
//   anybody already about who gets pushed or flies into it is put back out at its edge; enemy shots in it go; and
//   while he's still on the spot, nothing hurts him (player.untouchable: a moving hazard sweeping through it the
//   moment he's back doesn't get him; moves/grab.ts keeps it set).
// Walking through a spot without starting there, everybody's there as placed: only the start is cleared. Once he's
// started and walked off, whoever was cleared stays gone for that life (nobody pops up behind him).

import type { GameState } from '../m1/game/core/state';
import type { Enemy } from '../m1/types';
import { isMidBoss } from '../m1/game/combat/midBoss';
import { hazardOwnersIn } from './hazardHit';

/** The safe box round the spot: either side (about half a screen: nobody touching him, nobody on him the moment he's
 *  back), and up/down from his middle (the floors above and below a tower's stay as they are). */
export const SAFE_X = 360, SAFE_Y = 260;
/** How long the grace lasts (frames: 2 s at 60). */
export const SAFE_GRACE = 120;
/** How near the spot he has to stay for nothing to hurt him in the grace (step off it and he's fair game). */
const SHIELD_X = 120;

interface Safe { x: number; y: number; t: number; known: WeakSet<Enemy>; checked: boolean }
const SAFES = new WeakMap<object, Safe>();

const spared = (e: Enemy) => e.type === 'boss' || isMidBoss(e) || !!e.innocent || !!e.harmless || !!e.puppet;
const inBox = (s: Safe, x: number, y: number) => Math.abs(x - s.x) < SAFE_X && Math.abs(y - s.y) < SAFE_Y;
const midOf = (e: { pos: { x: number; y: number }; width: number; height: number }) => [e.pos.x + e.width / 2, e.pos.y + e.height / 2] as const;
/** Out of this life: off the list, and dead to anything holding on to it (so nothing waits on it to die). */
const gone = (e: Enemy) => { e.health = 0; e.vel.x = 0; e.vel.y = 0; };

const clearShots = (state: GameState, s: Safe) => {
  state.projectiles = state.projectiles.filter(p => p.owner !== 'enemy' || !!p.visualOnly || !inBox(s, ...midOf(p)));
};

/** dormant.ts's sleepFar: he's just been put at his checkpoint. Clear round him and start the grace. */
export const startSafe = (state: GameState) => {
  if (!state.stage) return;
  const p = state.player;
  const s: Safe = { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2, t: SAFE_GRACE, known: new WeakSet(), checked: false };
  const out: string[] = [];
  state.enemies = state.enemies.filter(e => {
    if (spared(e) || e.health <= 0 || !inBox(s, ...midOf(e))) return true;
    gone(e); out.push(e.kind ?? e.enemyType ?? '?');
    return false;
  });
  for (const e of state.enemies) s.known.add(e);
  clearShots(state, s);
  SAFES.set(state.stage as object, s);
  if (import.meta.env?.DEV && out.length) console.info(`[spawnSafe] cp ${state.checkpoint}: left out ${out.join(', ')}`);
};

/** dormant.ts's wakeNear, every frame: the grace. */
export const tickSafe = (state: GameState) => {
  const s = state.stage ? SAFES.get(state.stage as object) : undefined;
  if (!s || s.t <= 0) return;
  s.t--;
  const p = state.player;
  state.enemies = state.enemies.filter(e => {
    if (spared(e) || e.health <= 0 || e.isBlownAway) { s.known.add(e); return true; }
    const [cx, cy] = midOf(e);
    if (!inBox(s, cx, cy)) { s.known.add(e); return true; }
    // (new, and in the box: not this life)
    if (!s.known.has(e)) { gone(e); return false; }
    // (already about, and come in: back out at the edge, its side)
    const side = cx < s.x ? -1 : 1;
    e.pos.x = s.x + side * SAFE_X - e.width / 2 + side * 2;
    e.vel.x = 0;
    return true;
  });
  clearShots(state, s);
  if (spawnShielded(state)) p.untouchable = true;
  // (dev: a checkpoint must never sit in a standing hazard: a hazard zone on the spot a few frames in says one does)
  if (import.meta.env?.DEV && !s.checked && s.t === SAFE_GRACE - 20) {
    s.checked = true;
    const who = hazardOwnersIn(state, s.x - p.width / 2, s.y - p.height / 2, p.width, p.height);
    if (who.length) console.warn(`[spawnSafe] cp ${state.checkpoint}: a hazard on the spot: ${who.join(', ')}`);
  }
};

/** Still in the grace, on the spot: nothing hurts him (moves/grab.ts sets player.untouchable from this every frame). */
export const spawnShielded = (state: GameState) => {
  const s = state.stage ? SAFES.get(state.stage as object) : undefined;
  if (!s || s.t <= 0) return false;
  const p = state.player;
  return p.health > 0 && Math.abs(p.pos.x + p.width / 2 - s.x) < SHIELD_X && Math.abs(p.pos.y + p.height / 2 - s.y) < SAFE_Y;
};
