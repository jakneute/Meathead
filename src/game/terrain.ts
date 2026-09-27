// Ground that isn't flat. A stage can describe its ground as a profile: runs of
// straight lines (flat, uphill, downhill) with gaps between runs for pits. The
// profile is drawn as smooth hills, but for collision it's turned into narrow
// columns (fine steps), so everything that already collides with terrain
// blocks (Meathead, bullets, boulders, pickups, blood) works on slopes as is.

import { Block } from '../types';

/** One straight run of ground surface, from (x1, y1) to (x2, y2). Gaps between runs are pits. */
export interface GroundRun {
  /** The gap after this run is drawn by the stage itself (a sea of cloud), not as a dark crevasse. */
  pitAfter?: 'clouds';
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
 * Height of the ground line at x, cheaply (for particles): the stage's profile
 * if it has one (Infinity over a pit), otherwise the usual flat floor.
 */
export const groundLineAt = (runs: GroundRun[], x: number, flatFloor = 550) =>
  runs.length ? profileYAt(runs, x) ?? Infinity : flatFloor;
