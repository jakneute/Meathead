// Where landed blood can lie. A drop that hits the floor is a splat on that floor only: it runs on along the top as far
// as the top goes on (up and down a slope, over a little step), and stops at an edge, a gap or a wall coming up out
// of it, so none of it hangs off a ledge into the air or is painted up a wall. Worked out once, as it lands.

import { Block, Particle } from '../../types';
import { GameState } from './state';
import { GroundRun, runYAt, GROUND_DEPTH } from './terrain';

/** The pixel grid splats are drawn on (world units). */
const PIX = 2;
/** How far either side of where it came down a floor splat can run. */
const REACH = 64;
/** The biggest step up or down a floor splat carries on over. */
const STEP = 6;

const solid = (b: Block) => b.type !== 'pit' && b.type !== 'door';
/** A ground profile's own collision column (the profile itself, drawn smooth, is the surface there). */
const isRunBlock = (b: Block) => b.type === 'ground' && !!b.hidden && !b.tag;
/** Somewhere blood can lie: solid, not grating, not drawn by the stage as something that might move off (a tram, a log). */
const landable = (b: Block) => solid(b) && !b.grating && !b.tag && !b.hidden;
/** Liquids: blood sinks into them. */
const isLiquid = (r: GroundRun) => r.surface === 'lava' || r.surface === 'muck';

const nearBlocks = (blocks: Block[], x1: number, y1: number, x2: number, y2: number) =>
  blocks.filter(b => solid(b) && b.x < x2 && b.x + b.w > x1 && b.y < y2 && b.y + b.h > y1);

/** The top of the floor at x close to `t` (the top the splat's come along), or null where it stops: an edge, a gap, a wall. */
const topAt = (runs: GroundRun[], near: Block[], x: number, t: number, own?: Block): number | null => {
  let best: number | null = null;
  for (const r of runs) {
    if (x < r.x1 || x > r.x2) continue;
    const y = runYAt(r, x);
    // (ground rising up out of it: a cliff, a wall)
    if (y < t - STEP && y + GROUND_DEPTH > t) return null;
    if (Math.abs(y - t) <= STEP && !isLiquid(r) && (best === null || y < best)) best = y;
  }
  for (const b of near) {
    if (x < b.x || x > b.x + b.w || isRunBlock(b)) continue;
    if (!b.oneWay && b.y < t - STEP && b.y + b.h > t - 1) return null;
    if ((b === own || landable(b)) && Math.abs(b.y - t) <= STEP && (best === null || b.y < best)) best = b.y;
  }
  return best;
};

/**
 * The floor a drop's come down on at x, its top at `top`: the top's height at each column either side, as far as the
 * splat could run (null if there's no floor there for it to lie on: it's come down inside a wall).
 */
export const floorColumns = (state: GameState, x: number, top: number, own?: Block): { x0: number; cols: number[] } | null => {
  const near = nearBlocks(state.blocks, x - REACH - PIX, top - 200, x + REACH + PIX, top + STEP + 1);
  const cx = Math.round(x / PIX) * PIX;
  const t0 = topAt(state.groundRuns, near, cx + PIX / 2, top, own);
  if (t0 === null) return null;
  const left: number[] = [], right: number[] = [];
  for (let t = t0, k = 1; k * PIX <= REACH; k++) { const f = topAt(state.groundRuns, near, cx - k * PIX + PIX / 2, t, own); if (f === null) break; left.push(f); t = f; }
  for (let t = t0, k = 1; k * PIX <= REACH; k++) { const f = topAt(state.groundRuns, near, cx + k * PIX + PIX / 2, t, own); if (f === null) break; right.push(f); t = f; }
  return { x0: cx - left.length * PIX, cols: [...left.reverse(), t0, ...right] };
};

/** Has a drop come down into something it sinks in (water, muck, lava) rather than splatting on? */
export const sinksAt = (state: GameState, x: number, top: number, waterAt?: (s: GameState, x: number, y: number) => { surface: number } | null) => {
  for (const r of state.groundRuns) if (x >= r.x1 && x <= r.x2 && isLiquid(r) && Math.abs(runYAt(r, x) - top) < 2) return true;
  const w = waterAt?.(state, x, top - 2);
  return !!w && top >= w.surface - 2;
};

/** Blood come down on a floor (top at `top`): lies there as a splat on that floor, or (no floor there for it) is gone. */
export const landOnFloor = (state: GameState, p: Particle, top: number, waterAt?: (s: GameState, x: number, y: number) => { surface: number } | null) => {
  const x = p.pos.x + p.size / 2;
  const floor = sinksAt(state, x, top, waterAt) ? null : floorColumns(state, x, top);
  if (!floor) { p.life = 0; return false; }
  p.splatOn = { face: 'floor', vx: p.vel.x, vy: p.vel.y, x0: floor.x0, cols: floor.cols };
  p.isSplat = true;
  p.pos.y = top - 2 - p.size / 2;
  p.vel = { x: 0, y: 0 };
  return true;
};
