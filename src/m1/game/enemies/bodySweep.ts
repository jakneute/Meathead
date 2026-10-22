// A body moved by a hit (shoved, thrown, knocked flying, a corpse sent tumbling): moved through the level in small
// steps, sideways then up or down each step, so however fast it's going it can't skip a thin wall or come out the far
// side of a ledge. It stops against the side of anything solid (a wall, a ledge's face, a shut door), lands on a top
// (a jump-through's too, coming down onto it), and bonks the underside of a ceiling: what it hit is handed back for the
// caller to make something of (a splat, a thud, the hurt). One that's ended up inside something solid anyway (put
// down in it) is pushed out to the nearest free side rather than left to fall out of the world.

import type { GameState } from '../core/state';
import type { Block, Enemy } from '../../types';

const doorShut = (state: GameState) => state.doorState !== 'opening' && state.doorState !== 'open' && state.doorState !== 'closing';
/** Solid to a body from the side or from below: not a pit, a jump-through, open grating, or an open door. */
const hard = (state: GameState, b: Block) => b.type !== 'pit' && !b.oneWay && !b.grating && (b.type !== 'door' || doorShut(state));

export interface BodyHit {
  /** The side of something, and which way it was going into it. */
  side?: { b: Block; dir: 1 | -1 };
  ceil?: Block;
  floor?: Block;
}

/** How far it goes in one step at most (well under the thinnest wall). */
const STEP = 8;

/**
 * Moves `e` by dx, dy without going through anything solid. `step`: a lip this low it goes up onto rather than stopping
 * against (and a top it's this far into, coming down, it's put on); `head`: a ceiling's underside this far over its head
 * doesn't stop it going sideways.
 */
export const sweepBody = (state: GameState, e: Enemy, dx: number, dy: number, step = 10, head = 6): BodyHit => {
  const hit: BodyHit = {};
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / STEP));
  let mx = dx / n, my = dy / n;
  for (let i = 0; i < n && (mx || my); i++) {
    if (mx) {
      const nx = e.pos.x + mx, mid = e.pos.x + e.width / 2, top = e.pos.y, feet = top + e.height;
      let best: Block | null = null;
      for (const b of state.blocks) {
        if (!hard(state, b) || nx >= b.x + b.w || nx + e.width <= b.x) continue;
        if (top + head >= b.y + b.h || feet - step <= b.y) continue;
        // (only a face it's coming at: one its middle's already past, it's inside of, and that's pushOut's)
        if (mx > 0 ? mid > b.x : mid < b.x + b.w) continue;
        if (!best || (mx > 0 ? b.x < best.x : b.x + b.w > best.x + best.w)) best = b;
      }
      if (best) {
        e.pos.x = mx > 0 ? best.x - e.width : best.x + best.w;
        hit.side = { b: best, dir: mx > 0 ? 1 : -1 };
        mx = 0;
      } else e.pos.x = nx;
    }
    if (my) {
      const ny = e.pos.y + my, l = e.pos.x + 1, r = e.pos.x + e.width - 1;
      let best: Block | null = null;
      if (my > 0) {
        const feet = e.pos.y + e.height;
        for (const b of state.blocks) {
          if (b.type === 'pit' || b.type === 'door' || l >= b.x + b.w || r <= b.x) continue;
          const tol = b.oneWay || b.grating ? 2 : step;
          if (feet > b.y + tol || ny + e.height <= b.y) continue;
          if (!best || b.y < best.y) best = b;
        }
        if (best) { e.pos.y = best.y - e.height; hit.floor = best; my = 0; } else e.pos.y = ny;
      } else {
        for (const b of state.blocks) {
          if (!hard(state, b) || l >= b.x + b.w || r <= b.x) continue;
          if (e.pos.y < b.y + b.h - head || ny >= b.y + b.h) continue;
          if (!best || b.y + b.h > best.y + best.h) best = b;
        }
        if (best) { e.pos.y = best.y + best.h; hit.ceil = best; my = 0; } else e.pos.y = ny;
      }
    }
  }
  return hit;
};

/** Its middle inside something solid (not just a foot in a step, or its back against a wall). */
const solidAtMid = (state: GameState, x: number, y: number, w: number, h: number) => {
  const cx = x + w / 2, cy = y + h / 2;
  return state.blocks.find(b => hard(state, b) && b.type !== 'door' && cx > b.x && cx < b.x + b.w && cy > b.y && cy < b.y + b.h);
};

/**
 * Inside something solid (its middle in it): out the nearest free side of it (left, right, or up on top; down out the
 * bottom only if that's nearer by far). True if it was moved.
 */
export const pushOutOfSolid = (state: GameState, e: Enemy): boolean => {
  const b = solidAtMid(state, e.pos.x, e.pos.y, e.width, e.height);
  if (!b) return false;
  const opts = [
    { x: b.x - e.width, y: e.pos.y, d: e.pos.x + e.width - b.x },
    { x: b.x + b.w, y: e.pos.y, d: b.x + b.w - e.pos.x },
    { x: e.pos.x, y: b.y - e.height, d: e.pos.y + e.height - b.y },
    { x: e.pos.x, y: b.y + b.h, d: (b.y + b.h - e.pos.y) * 2 },
  ].sort((p, q) => p.d - q.d);
  const to = opts.find(o => !solidAtMid(state, o.x, o.y, e.width, e.height)) ?? opts[0];
  // (not on into it again: out of it, it's stopped going that way)
  if (to.x < e.pos.x && e.vel.x > 0) e.vel.x = 0;
  if (to.x > e.pos.x && e.vel.x < 0) e.vel.x = 0;
  if (to.y < e.pos.y && e.vel.y > 0) e.vel.y = 0;
  if (to.y > e.pos.y && e.vel.y < 0) e.vel.y = 0;
  e.pos.x = to.x; e.pos.y = to.y;
  return true;
};
