// The arena's world: where everything stands (shared by arena.ts's mode 7 and billboards and ground.ts's painted floor,
// so the two never disagree). World: x east, z north, alt up (units; a suitor's about 100 tall). The castle at (0, 0).

import { hash } from '../kit';

/** The view (400x300, blown up 2x onto the screen), where its horizon sits level, its focal length. */
export const W = 400, H = 300, HORIZON = 112, FOCAL = 230;
/** The park's magic wall; how low (skimming's fine) and how high he can go. */
export const WALL_R = 5000, MIN_ALT = 40, MAX_ALT = 2700;
/** The drained moat's ring. */
export const MOAT: readonly [number, number] = [600, 720];
/** The ring paths (the banner poles stand on the first), the park railway just inside the wall. */
export const RINGS = [960, 2450, 3550] as const, RAIL_R = 4560;

/** A point at a bearing (degrees, clockwise from north) and a distance out from the castle. */
export const at = (deg: number, r: number) => ({ x: Math.sin((deg * Math.PI) / 180) * r, z: Math.cos((deg * Math.PI) / 180) * r });

export const TOWERS = [[25, 2300], [85, 3100], [140, 2500], [235, 3200], [280, 2100], [330, 2900]].map(([d, r], i) => ({ ...at(d, r), i }));

/** The banner poles round the ring path. */
export const FLAGS = Array.from({ length: 12 }, (_, i) => ({ ...at(15 + i * 30, 960), i }));

/** The glen's forest (north-west: these bearings, these distances out). */
export const GLEN = { a0: -92, a1: -4, r0: 2500, r1: 5200 };

/** The glen's forest (north-west) and a few by the wall: storybook trees (scenery: he flies through them). `k` 0 a
 *  conifer (a frosted fairy pine or a spire tree), 1 a broadleaf (an oak or a blossom tree); `v` which of the two. */
export const TREES: { x: number; z: number; h: number; k: number; v: number }[] = (() => {
  const out: { x: number; z: number; h: number; k: number; v: number }[] = [];
  for (let i = 0; i < 48; i++) { const d = -84 + hash(i * 3.1) * 72, r = 2700 + hash(i * 5.7) * 2200; out.push({ ...at(d, r), h: 300 + hash(i * 2.3) * 220, k: hash(i * 7.9) < 0.7 ? 0 : 1, v: hash(i * 4.3) < 0.5 ? 0 : 1 }); }
  for (let i = 0; i < 14; i++) { const d = 20 + i * 24 + hash(i * 9.1) * 10, r = 4650 + hash(i * 4.4) * 250; if (d > 270) continue; out.push({ ...at(d, r), h: 280 + hash(i * 1.7) * 160, k: i % 3 === 0 ? 1 : 0, v: i % 2 }); }
  return out;
})();
