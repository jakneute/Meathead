// The park map's geometry: the brochure's paper (MAP_W x MAP_H, its own px), the hub plaza in the middle, the lands
// round it as slices of an ellipse in the same order their portals go round the hub (lands.ts MAP_SPOTS: America USA's
// narrow street in at the bottom), and where a spot in a land sits on the paper.

import { SPOTS } from '../hub/lands';

export const MAP_W = 900, MAP_H = 960;
/** The hub's middle, and the lands' outer edge (an ellipse: a brochure's three-quarter tilt). */
export const HC = { x: 450, y: 440 } as const;
export const RX = 410, RY = 360;
/** The hub plaza's edge, the ring walk round it, as a share of the ellipse (q: 1 is the lands' outer edge). */
export const Q_HUB = 0.17, Q_RING = 0.215;

/** The spots round the map, clockwise from the top: the lands, and America USA's street (the staff door's not on it). */
const RING = SPOTS.filter(s => s.kind !== 'staff');
/** America USA's slice is narrow (a street); the lands share the rest. */
const AMERICA_DEG = 22;
const LAND_DEG = (360 - AMERICA_DEG) / (RING.length - 1);

export interface Sector { a0: number; a1: number; mid: number; land: number | null }
/** Each slice's angles (radians, canvas: 0 east, clockwise), America USA centered straight down. */
export const SECTORS: Sector[] = (() => {
  const am = RING.findIndex(s => s.kind === 'america');
  const out: Sector[] = [];
  // (walk round from America USA's slice, centered at 90 degrees)
  let a = 90 - AMERICA_DEG / 2 - am * LAND_DEG;
  for (const s of RING) {
    const w = s.kind === 'america' ? AMERICA_DEG : LAND_DEG;
    const a0 = (a * Math.PI) / 180, a1 = ((a + w) * Math.PI) / 180;
    out.push({ a0, a1, mid: (a0 + a1) / 2, land: s.kind === 'land' ? s.land : null });
    a += w;
  }
  return out;
})();
export const AMERICA = SECTORS.find(s => s.land === null)!;
export const sectorOfLand = (land: number) => SECTORS.find(s => s.land === land)!;

/** The lands' outer edge at an angle (q), wobbly like a hand-drawn berm. */
export const edgeQ = (ang: number) => 1 + Math.sin(ang * 7 + 1.3) * 0.018 + Math.sin(ang * 17 + 0.4) * 0.01;

/** Normalized ellipse coordinates of a paper point: q (0 the hub's middle, 1 the lands' edge) and its angle. */
export const polar = (x: number, y: number) => {
  const dx = (x - HC.x) / RX, dy = (y - HC.y) / RY;
  return { q: Math.hypot(dx, dy), ang: Math.atan2(dy, dx) };
};
export const fromPolar = (ang: number, q: number) => ({ x: HC.x + Math.cos(ang) * q * RX, y: HC.y + Math.sin(ang) * q * RY });

/** Normalize an angle into [a0 - pi, a0 + pi) around a reference. */
export const wrapNear = (ang: number, ref: number) => { let a = ang; while (a < ref - Math.PI) a += Math.PI * 2; while (a >= ref + Math.PI) a -= Math.PI * 2; return a; };

/** Which slice a paper point's in (by angle), or null. */
export const sectorAt = (ang: number): Sector => {
  for (const s of SECTORS) { const a = wrapNear(ang, s.mid); if (a >= s.a0 && a < s.a1) return s; }
  return SECTORS[0];
};

/** A spot in a land: u across it (-0.5 one edge .. 0.5 the other, clockwise), v out from the ring walk (0) to its
 *  outer edge (1). */
export const inLand = (land: number, u: number, v: number) => {
  const s = sectorOfLand(land);
  const ang = s.mid + u * (s.a1 - s.a0);
  const q = Q_RING + 0.03 + v * (edgeQ(ang) - Q_RING - 0.05);
  const p = fromPolar(ang, q);
  return { x: Math.round(p.x), y: Math.round(p.y) };
};
/** A land's middle on the paper (where the map centers to show it). */
export const landMid = (land: number) => inLand(land, 0, 0.52);
