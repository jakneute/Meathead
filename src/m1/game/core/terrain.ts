// Ground that isn't flat. A stage can describe its ground as a profile: runs of
// straight lines (flat, uphill, downhill) with gaps between runs for pits. The
// profile is drawn as smooth hills, but for collision it's turned into narrow
// columns (fine steps), so everything that already collides with terrain
// blocks (Meathead, bullets, boulders, pickups, blood) works on slopes as is.

import { Block } from '../../types';

/** One straight run of ground surface, from (x1, y1) to (x2, y2). Gaps between runs are pits. */
export interface GroundRun {
  /** The gap after this run is drawn by the stage itself (a sea of cloud, open water), not as a dark crevasse. */
  pitAfter?: 'clouds' | 'water';
  /** The stage draws this ground itself (sand, road, boardwalk...) rather than the stage's usual material. */
  surface?: string;
  /** Drawn as stairs: how many steps, and whether each tread sits halfway along its stretch of the slope (otherwise at its top end). */
  steps?: { n: number; mid?: boolean };
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** How deep the ground under a run goes (it only needs to be deeper than anything falls). */
export const GROUND_DEPTH = 1400;
/** Width of the collision steps a slope is cut into. */
const COLUMN_W = 10;

/** Is this box (feet at its bottom) standing on an indoor floor? (Icy stages are only icy outdoors.) */
export const standingIndoors = (blocks: Block[], box: { x: number; y: number; w: number; h: number }) =>
  blocks.some(b => b.indoor && box.x + box.w > b.x && box.x < b.x + b.w && Math.abs(box.y + box.h - b.y) <= 3);

/** Surface height of a run at x. */
export const runYAt = (r: GroundRun, x: number) => r.x2 === r.x1 ? r.y1 : r.y1 + ((x - r.x1) / (r.x2 - r.x1)) * (r.y2 - r.y1);

/** Collision blocks for a ground profile: one block per flat run, fine steps for slopes. */
export const groundBlocks = (runs: GroundRun[]): Block[] => {
  const blocks: Block[] = [];
  for (const r of runs) {
    if (r.y1 === r.y2) {
      blocks.push({ x: r.x1, y: r.y1, w: r.x2 - r.x1, h: GROUND_DEPTH, type: 'ground', hidden: true });
      continue;
    }
    for (let x = r.x1; x < r.x2; x += COLUMN_W) {
      const w = Math.min(COLUMN_W, r.x2 - x);
      // Each step sits at the surface height in its middle
      const y = Math.round(runYAt(r, x + w / 2));
      blocks.push({ x, y, w, h: GROUND_DEPTH + Math.abs(r.y2 - r.y1), type: 'ground', hidden: true });
    }
  }
  return blocks;
};

/** Surface height of the profile at x (undefined over a pit). */
export const profileYAt = (runs: GroundRun[], x: number): number | undefined => {
  for (const r of runs) if (x >= r.x1 && x <= r.x2) return runYAt(r, x);
  return undefined;
};

/** The run under x (trying `near` first: the run under one foot is nearly always the one under the other). */
export const runAt = (runs: GroundRun[], x: number, near?: GroundRun) =>
  near && x >= near.x1 && x <= near.x2 ? near : runs.find(r => x >= r.x1 && x <= r.x2);

/** Where a foot goes down at x on a run: the tread it's drawn with, if it's drawn as stairs (the slope itself otherwise). */
export const treadYAt = (r: GroundRun, x: number) => {
  if (!r.steps) return runYAt(r, x);
  const n = r.steps.n, k = Math.max(0, Math.min(n - 1, Math.floor(((x - r.x1) / (r.x2 - r.x1)) * n)));
  return r.y1 + ((r.steps.mid ? k + 0.5 : r.y2 < r.y1 ? k + 1 : k) / n) * (r.y2 - r.y1);
};

/** How far either side of his middle Meathead's feet are, stood still. */
export const STANCE = 7;
/**
 * Stood on a slope or stairs: how far below his feet (the bottom of his box, which rests on the highest bit of ground
 * under it) the slope is either side of his middle, left (l) and right (r). Undefined on the flat, over a pit, or up on
 * something else (a crate, a ledge) that isn't the ground. One look along the profile.
 */
export const stanceGround = (runs: GroundRun[], x: number, w: number, feetY: number): { l: number; r: number } | undefined => {
  const cx = x + w / 2;
  // (the box rests on a collision column, which can stick out past its side by up to half a column)
  const x0 = x - COLUMN_W / 2, x1 = x + w + COLUMN_W / 2;
  let top = Infinity, l: number | undefined, r: number | undefined;
  for (const run of runs) {
    if (run.x2 < x0 || run.x1 > x1) continue;
    const runTop = Math.min(runYAt(run, Math.max(x0, run.x1)), runYAt(run, Math.min(x1, run.x2)));
    // (a run well down under him isn't what he's stood on: a floor a level below, under the one he's on)
    if (runTop - feetY > COLUMN_W * 2) continue;
    top = Math.min(top, runTop);
    if (cx - STANCE >= run.x1 && cx - STANCE <= run.x2) l = runYAt(run, cx - STANCE) - feetY;
    if (cx + STANCE >= run.x1 && cx + STANCE <= run.x2) r = runYAt(run, cx + STANCE) - feetY;
  }
  if (l === undefined || r === undefined || (Math.abs(l) < 0.5 && Math.abs(r) < 0.5)) return undefined;
  // (the top of it has to be what he's stood on: not well below him, nor over his feet)
  if (feetY - top < -1.5 || feetY - top > COLUMN_W * 2) return undefined;
  return { l: Math.max(0, l), r: Math.max(0, r) };
};

/** How much higher than the other the uphill foot can go, its knee bent, before the downhill one's left reaching. */
const KNEE_TAKES = 10;
/**
 * How far to drop him down onto the slope from the bottom of his box: stood or walking (`legs`), down onto his
 * downhill foot, his uphill knee bent to take the difference; in any other pose, only onto the higher foot (so
 * nothing of him sinks into the ground on the uphill side).
 */
export const stanceDrop = (s: { l: number; r: number } | undefined, legs: boolean) =>
  !s ? 0 : legs ? Math.min(Math.max(s.l, s.r), Math.min(s.l, s.r) + KNEE_TAKES) : Math.min(s.l, s.r);

const standable = (b: Block) => b.type !== 'pit' && b.type !== 'door';

/**
 * The top of the nearest solid thing under x, at or below `feetY` (anything up
 * to `reach` above the feet counts, so enemies walk up steps and slopes).
 * Null if there's nothing under x at all (a pit).
 */
export const floorTopAt = (blocks: Block[], x: number, feetY: number, reach = 26): number | null => {
  let best: number | null = null;
  for (const b of blocks) {
    if (!standable(b) || x < b.x || x > b.x + b.w || b.y < feetY - reach) continue;
    if (best === null || b.y < best) best = b.y;
  }
  return best;
};

/**
 * floorTopAt for a lot of lookups against the same blocks (a frame's particles): the blocks sorted into columns by x
 * the first time it's asked, then each lookup only looks at the blocks in its column. The same answers: a stage laid
 * as slopes is thousands of narrow column blocks, and a few hundred sparks and drops each scanning all of them was
 * most of a frame (the Voyage's brake run, its flying bodies bleeding).
 */
const FLOOR_COL = 128;
export const floorFinder = (blocks: Block[]) => {
  let cols: Map<number, Block[]> | null = null;
  const wide: Block[] = [];
  return (x: number, feetY: number, reach = 26): number | null => {
    if (!Number.isFinite(x)) return floorTopAt(blocks, x, feetY, reach);
    if (!cols) {
      cols = new Map();
      for (const b of blocks) {
        if (!standable(b)) continue;
        const c0 = Math.floor(b.x / FLOOR_COL), c1 = Math.floor((b.x + b.w) / FLOOR_COL);
        if (!Number.isFinite(c0) || !Number.isFinite(c1) || c1 - c0 > 32) { wide.push(b); continue; }
        for (let k = c0; k <= c1; k++) { const l = cols.get(k); if (l) l.push(b); else cols.set(k, [b]); }
      }
    }
    let best: number | null = null;
    const top = feetY - reach;
    for (const list of [cols.get(Math.floor(x / FLOOR_COL)), wide]) {
      if (list) for (const b of list) {
        if (x < b.x || x > b.x + b.w || b.y < top) continue;
        if (best === null || b.y < best) best = b.y;
      }
    }
    return best;
  };
};

/**
 * Height of the ground line at x, cheaply (for particles): the stage's profile
 * if it has one (Infinity over a pit), otherwise the usual flat floor.
 */
export const groundLineAt = (runs: GroundRun[], x: number, flatFloor = 550) =>
  runs.length ? profileYAt(runs, x) ?? Infinity : flatFloor;
