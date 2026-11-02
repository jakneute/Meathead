// Nobody stuck inside the level (the owner's: "make sure enemies cannot spawn inside geometry and nudge them upwards or
// sideways until they 'fit' if they happen to be alive and inside the geometry"). Every M2 kind that walks (kinds.ts's
// wrapper round its AI) is checked the first time its AI runs (wherever it was put: a spawn table, a wave, an ambush,
// a robber's landing, woken from dormant.ts: before it's ever drawn), then every CHECK_EVERY frames after. Its body
// (not its feet in a step or a slope's columns, not the top of its head under a ceiling) inside anything solid (a
// wall, the ground, a solid block, a car's body on the moving train) and it's moved to the nearest place it fits:
// up first, stood on top of what it's in; then sideways, the nearer side first, with a floor under it. Nowhere near
// fits: it's quietly gone (despawn isn't a kill: no callout, no credit, no drop, no lines).
//
// Left be: the dead and flung (bodies have their own pushing out: bodySweep.ts), bosses and mid-bosses and fixtures
// (their wrapper doesn't call this), whatever flies or isn't stopped by walls (its kind's `solid: false`), anybody a
// scene or a move is holding or moving (puppet, a swimmer's water, knocked about: pauseTimer,
// dropping, frozen), and anybody whose AI moved it itself this frame (vehicles, emerging, climbing: it's put where it
// is on purpose).
//
// Cheap: one pass over the blocks near it every CHECK_EVERY frames (staggered, so not all on one frame), and only the
// blocks it's in or near tried as places to go.

import type { GameState } from '../m1/game/core/state';
import type { Block, Enemy } from '../m1/types';

/** How often a live one's checked after its first (frames). */
const CHECK_EVERY = 12;
/** How far up (onto the top of what it's in) and sideways it's looked for room (px). */
const MAX_UP = 190, MAX_SIDE = 150;
/** A floor this far under a sideways spot (px) or it isn't one (it'd only drop off something: off the train). */
const FLOOR_UNDER = 48;

const NEXT = new WeakMap<Enemy, number>();
let stagger = 0;

/** Solid to a body: not a jump-through, open grating, a pit, a door (the doors' own code), or a block put away. */
const hard = (b: Block) => (b.type === 'wall' || b.type === 'ground' || b.type === 'platform') && !b.oneWay && !b.grating && b.y > -1000;

/** Its body: in from its sides a little, its head's top off, and its feet's step (slopes, a lip) off. */
const core = (e: Enemy, x: number, y: number) => {
  const sx = Math.min(6, e.width * 0.15), top = Math.min(6, e.height * 0.1), foot = Math.min(26, e.height * 0.35);
  return { l: x + sx, r: x + e.width - sx, t: y + top, b: y + e.height - foot };
};
const inside = (c: { l: number; r: number; t: number; b: number }, b: Block) => c.l < b.x + b.w && c.r > b.x && c.t < b.y + b.h && c.b > b.y;
const fits = (near: Block[], e: Enemy, x: number, y: number) => { const c = core(e, x, y); return !near.some(b => inside(c, b)); };
const floorUnder = (floors: Block[], e: Enemy, x: number, y: number) => {
  const cx = x + e.width / 2, feet = y + e.height;
  return floors.some(b => cx >= b.x && cx <= b.x + b.w && b.y >= feet - 2 && b.y <= feet + FLOOR_UNDER);
};

const exempt = (e: Enemy) => e.type === 'boss' || e.health <= 0 || !!e.isBlownAway || !!e.poofed || !!e.puppet
  || !!e.swimBox || !!e.dropping || (e.pauseTimer ?? 0) > 0 || (e.frozenTimer ?? 0) > 0
  || e.enemyType === 'flyer' || e.enemyType === 'drone' || e.behavior === 'fly' || e.behavior === 'hover';

/** Quietly out of the world: off the list this frame, not drawn, dead to whatever holds on to it. Never a kill. */
const despawn = (e: Enemy) => {
  e.seen = true; e.health = 0; e.poofed = true; e.vel.x = 0; e.vel.y = 0;
  if (import.meta.env?.DEV) console.warn(`[unstick] ${e.kind} stuck in the level at ${Math.round(e.pos.x)},${Math.round(e.pos.y)}: nowhere near fits, despawned`);
};

const moveTo = (e: Enemy, x: number, y: number) => {
  const dx = x - e.pos.x, dy = y - e.pos.y;
  e.pos.x = x; e.pos.y = y;
  if (dy < 0 && e.vel.y > 0) e.vel.y = 0;
  if (dx) e.vel.x = 0;
  if (e.homeX !== undefined) e.homeX += dx;
  if (e.homeY !== undefined) e.homeY += dy;
  if (!e.seen && e.spawnPos) e.spawnPos = { x: e.pos.x, y: e.pos.y };
  if (import.meta.env?.DEV) console.info(`[unstick] ${e.kind} was inside the level: moved ${Math.round(dx)},${Math.round(dy)}`);
};

/**
 * kinds.ts, after a walking M2 kind's AI (`movedItself`: its AI put it where it is, not the engine). True if it's been
 * despawned (the caller needn't do anything with that: it's off the list this frame).
 */
export const unstick = (state: GameState, e: Enemy, movedItself: boolean): boolean => {
  const due = NEXT.get(e);
  if (due !== undefined && state.frame < due) return false;
  if (movedItself || exempt(e)) return false;
  NEXT.set(e, state.frame + CHECK_EVERY + (due === undefined ? (stagger++ % CHECK_EVERY) : 0));
  // (what it's in, and what's near enough to matter for where it goes)
  const c = core(e, e.pos.x, e.pos.y);
  let stuck = false;
  const nl = e.pos.x - MAX_SIDE - e.width, nr = e.pos.x + e.width + MAX_SIDE, nt = e.pos.y - MAX_UP - e.height, nb = e.pos.y + e.height + FLOOR_UNDER;
  const near: Block[] = [], floors: Block[] = [];
  for (const b of state.blocks) {
    if (b.x >= nr || b.x + b.w <= nl || b.y >= nb || b.y + b.h <= nt || b.y < -1000) continue;
    if (b.type !== 'pit' && b.type !== 'door') floors.push(b);
    if (!hard(b)) continue;
    near.push(b);
    if (!stuck && inside(c, b)) stuck = true;
  }
  if (!stuck) return false;
  // Up first: stood on the top of something solid it overlaps across (the nearest top up), and fitting there
  // (only a top under its middle: one it'd hang half off would only drop it back in)
  const cx = e.pos.x + e.width / 2;
  const ups = near.filter(b => cx >= b.x && cx <= b.x + b.w && b.y - e.height < e.pos.y && b.y - e.height >= e.pos.y - MAX_UP)
    .map(b => b.y - e.height).sort((a, b) => b - a);
  for (const y of ups) if (fits(near, e, e.pos.x, y)) { moveTo(e, e.pos.x, y); return false; }
  // Then sideways: just off the side of each thing it's up against, the nearer first, with a floor under it
  const sides: number[] = [];
  for (const b of near) sides.push(b.x - e.width - 1, b.x + b.w + 1);
  const xs = sides.filter(x => Math.abs(x - e.pos.x) <= MAX_SIDE).sort((a, b) => Math.abs(a - e.pos.x) - Math.abs(b - e.pos.x));
  for (const x of xs) if (fits(near, e, x, e.pos.y) && floorUnder(floors, e, x, e.pos.y)) { moveTo(e, x, e.pos.y); return false; }
  despawn(e);
  return true;
};
