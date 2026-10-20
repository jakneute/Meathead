// The park map's ground, pixel by pixel (painted once into a canvas): the hub plaza's banded paving, the ring walk, each
// land's own ground (dithered, its edge shaded in stepped bands), the hedges between the lands, the berm of trees round
// the park, the walks out to every attraction, the water (a river, a lagoon, a moat: banded deep to shallow, a sand
// lip), and the world outside: grass, the front gate's plaza, the parking, the water park that isn't, the woods.

import { LANDS } from '../hub/lands';
import { ATTRACTIONS, type Attraction } from './data';
import { MAP_W, MAP_H, HC, RX, RY, Q_HUB, Q_RING, SECTORS, AMERICA, edgeQ, polar, wrapNear, sectorAt, inLand, fromPolar } from './geo';
import { rgb } from './paint';

type P = { x: number; y: number };
type RGB = number[];
const C = (h: string): RGB => rgb(h);

/** A walk: a run of segments, its width (px). */
interface Seg { a: P; b: P; w: number; minX: number; maxX: number; minY: number; maxY: number }
const seg = (a: P, b: P, w: number): Seg => ({ a, b, w, minX: Math.min(a.x, b.x) - w, maxX: Math.max(a.x, b.x) + w, minY: Math.min(a.y, b.y) - w, maxY: Math.max(a.y, b.y) + w });
const segDist = (s: Seg, x: number, y: number) => {
  const vx = s.b.x - s.a.x, vy = s.b.y - s.a.y, l2 = vx * vx + vy * vy || 1;
  const t = Math.max(0, Math.min(1, ((x - s.a.x) * vx + (y - s.a.y) * vy) / l2));
  return Math.hypot(x - (s.a.x + vx * t), y - (s.a.y + vy * t));
};
/** A polyline as segments. */
const run = (pts: P[], w: number) => pts.slice(1).map((p, i) => seg(pts[i], p, w));

/** Where an attraction sits on the paper. */
export const attractionAt = (a: Attraction): P => {
  if (a.x !== undefined && a.y !== undefined) return { x: a.x, y: a.y };
  const li = LANDS.findIndex(l => l.id === a.land);
  return inLand(li, a.u ?? 0, a.v ?? 0.5);
};
/** A land's little entry plaza, just in off the ring walk. */
export const landGate = (li: number) => inLand(li, 0, 0.06);

/** Every walk: the hub's spokes out to each land's plaza, then a spanning tree of walks from there out to each of its
 *  attractions (each to the nearest one already joined: how walks get worn in). */
export const WALKS: Seg[] = (() => {
  const out: Seg[] = [];
  LANDS.forEach((land, li) => {
    const s = SECTORS.find(x => x.land === li)!;
    const ring = fromPolar(s.mid, Q_RING - 0.01);
    const gate = landGate(li);
    out.push(seg(ring, gate, 4.5));
    const joined: P[] = [gate];
    const left = ATTRACTIONS.filter(a => a.land === land.id && (a.v ?? 0) <= 1).map(attractionAt);
    while (left.length) {
      let bi = 0, bj = 0, bd = Infinity;
      left.forEach((p, i) => joined.forEach((q, j) => { const d = Math.hypot(p.x - q.x, p.y - q.y); if (d < bd) { bd = d; bi = i; bj = j; } }));
      const p = left.splice(bi, 1)[0], q = joined[bj];
      // (a kink in it, so it isn't ruled)
      const m = { x: (p.x + q.x) / 2 + (p.y - q.y) * 0.12, y: (p.y + q.y) / 2 - (p.x - q.x) * 0.12 };
      out.push(...run([q, m, p], 3));
      joined.push(p);
    }
  });
  return out;
})();

/** Water: rivers (polylines) and pools (ellipses), each with its own color family. */
interface Pool { cx: number; cy: number; rx: number; ry: number; kind: Water }
type Water = 'river' | 'moat' | 'mud' | 'lagoon' | 'pool' | 'slime';
const L = (id: string) => LANDS.findIndex(l => l.id === id);
const land = (id: string, pts: [number, number][]) => pts.map(([u, v]) => inLand(L(id), u, v));
export const RIVERS: { segs: Seg[]; kind: Water }[] = [
  // (the Jungle Cruise's river, in from the hedge and round to the far edge)
  { segs: run(land('adventure', [[-0.5, 0.42], [-0.2, 0.4], [0.02, 0.4], [0.1, 0.5], [0.0, 0.72], [-0.12, 0.8], [-0.22, 1.02]]), 6), kind: 'river' },
  // (Wilderness Land's river, the log flume's splashdown at the end of it)
  { segs: run(land('frontier', [[0.5, 0.5], [0.22, 0.5], [0.1, 0.62], [-0.08, 0.72], [-0.12, 0.98]]), 5), kind: 'river' },
];
export const POOLS: Pool[] = [
  { ...ctr('foreign', 0, 0.44), rx: 46, ry: 30, kind: 'lagoon' },
  { ...ctr('spooky', -0.1, 0.52), rx: 30, ry: 20, kind: 'moat' },
  { ...ctr('fantasy', 0.15, 0.88), rx: 30, ry: 18, kind: 'mud' },
  { ...ctr('space', -0.08, 0.2), rx: 14, ry: 6, kind: 'pool' },
  { ...ctr('cartoon', 0.05, 0.62), rx: 12, ry: 7, kind: 'slime' },
  // (the water park, off in its own corner: coming soon-ish)
  { cx: 120, cy: 862, rx: 62, ry: 36, kind: 'pool' }, { cx: 196, cy: 900, rx: 30, ry: 18, kind: 'pool' }, { cx: 70, cy: 920, rx: 22, ry: 12, kind: 'pool' },
];
function ctr(id: string, u: number, v: number) { const p = inLand(L(id), u, v); return { cx: p.x, cy: p.y }; }

// ---- palettes (each a few tones the dither picks between)
const WATER: Record<Water, RGB[]> = {
  river: ['#1E5A8A', '#2A78B0', '#3E96CC', '#7FC4E8'].map(C),
  lagoon: ['#1A4F86', '#2468A8', '#3884C4', '#86C8EC'].map(C),
  pool: ['#1F6FB0', '#3A92D4', '#5CB4EC', '#BDE6FA'].map(C),
  moat: ['#1E3A2E', '#2A4E3A', '#3A6448', '#6E9A6A'].map(C),
  mud: ['#4A3420', '#5E4228', '#745434', '#9A7A52'].map(C),
  slime: ['#3F7A14', '#5EA01E', '#84CC16', '#C6F06A'].map(C),
};
const SAND = C('#E8D7A0'), SAND_D = C('#C9B47C');
const GROUND: Record<string, RGB[]> = {
  space: ['#C3CDD6', '#D3DCE4', '#AEB9C4', '#7FD8D0'].map(C),
  frontier: ['#C9A564', '#D6B577', '#B08A4C', '#7E9A4A'].map(C),
  spooky: ['#57506E', '#635B7C', '#4A4360', '#3A6448'].map(C),
  cartoon: ['#9EE6A8', '#B4F0BC', '#86D492', '#FDE68A'].map(C),
  hollywood: ['#9A98A2', '#ACAAB4', '#86848E', '#FDE047'].map(C),
  fantasy: ['#6CC04A', '#82D45E', '#58A83C', '#F9A8D4'].map(C),
  adventure: ['#2F6B2A', '#3E8236', '#245822', '#6AA83A'].map(C),
  foreign: ['#E2D2AE', '#ECDFBF', '#CCBA92', '#C2564A'].map(C),
  america: ['#D8B08A', '#E4C29E', '#C49A74', '#B23A3A'].map(C),
};
const GRASS = ['#7CB65A', '#8CC466', '#6CA44E'].map(C);
const BERM = ['#2C5E2E', '#3A7238', '#22482A', '#4E8A44'].map(C);
const WOODS = ['#1E4A2A', '#2A5C32', '#173A22'].map(C);
const HEDGE = C('#1F4A26'), HEDGE_L = C('#2E6434');
const WALK = C('#F2E6C8'), WALK_E = C('#CDBB90');
const HUB_A = C('#F0DEB8'), HUB_B = C('#E2C898'), HUB_C2 = C('#D4B07A');
const ASPHALT = C('#5E6068'), ASPHALT_L = C('#6E7078'), PAINT = C('#F4F4F5');
const PLAZA = C('#E8D6B0'), PLAZA_D = C('#D6C096');
const CAST = C('#9CA3AF'), CAST_D = C('#7B828E');

const AV_R = (RX + RY) / 2;

/** The ground, painted once. */
export const paintTerrain = (): HTMLCanvasElement => {
  const cv = document.createElement('canvas'); cv.width = MAP_W; cv.height = MAP_H;
  const g = cv.getContext('2d')!;
  const img = g.createImageData(MAP_W, MAP_H), d = img.data;
  const walks = WALKS, rivers = RIVERS.flatMap(r => r.segs.map(s => ({ s, kind: r.kind })));
  const frontier = SECTORS.find(s => s.land === L('frontier'))!;
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
    const { q, ang } = polar(x, y);
    const e = edgeQ(ang), chk = (x + y) & 1, h = hashI(x, y);
    let c: RGB = GRASS[0];
    const inPark = q < e;
    if (q < Q_HUB) {
      // The hub plaza: paving in rings, a darker band every few, dithered seams
      const r = q * AV_R, band = Math.floor(r / 6);
      const t = r - band * 6;
      c = band % 3 === 2 ? HUB_C2 : band % 2 ? HUB_B : HUB_A;
      if (t < 1 && chk) c = HUB_C2;
      if (q > Q_HUB - 0.008) c = WALK_E;
    } else if (q < Q_RING) {
      c = (q < Q_HUB + 0.006 || q > Q_RING - 0.006) ? WALK_E : WALK;
    } else if (inPark) {
      const s = sectorAt(ang);
      const id = s.land === null ? 'america' : LANDS[s.land].id;
      const P = GROUND[id];
      // (the land's ground: its tone, speckled, a few patches of its accent)
      c = h < 0.18 ? P[1] : h > 0.86 ? P[2] : P[0];
      const blob = noise(x * 0.06, y * 0.06);
      if (blob > 0.72) c = P[2];
      if (id === 'space' && ((x % 12 === 0) || (y % 12 === 0))) c = P[2];
      if (id === 'space' && blob > 0.8 && chk) c = P[3];
      if (id === 'hollywood' && (x % 16 === 0 || y % 20 === 0)) c = P[1];
      if (id === 'foreign' && ((x + (y >> 3)) % 9 === 0)) c = P[2];
      if (id === 'america' && ((y % 5 === 0) || ((x + (Math.floor(y / 5) % 2) * 5) % 10 === 0))) c = P[2];
      if (id === 'cartoon' && ((x % 14 - 7) ** 2 + (y % 14 - 7) ** 2 < 4)) c = P[3];
      if (id === 'fantasy' && h > 0.985) c = P[3];
      if (id === 'adventure' && blob > 0.55 && chk) c = P[2];
      if (id === 'adventure' && blob < 0.25) c = P[3];
      if (id === 'frontier' && blob < 0.28 && chk) c = P[3];
      if (id === 'spooky' && blob < 0.25 && chk) c = P[3];
      // (the edge: two stepped bands in, dithered between)
      const ed = (e - q) * AV_R;
      if (ed < 2) c = shade(c, 0.6); else if (ed < 4) c = shade(c, 0.78); else if (ed < 5 && chk) c = shade(c, 0.78);
      // (the hedges between lands: along each slice's edges; America USA's has a wall)
      const a0 = wrapNear(ang, s.a0) - s.a0, a1 = s.a1 - wrapNear(ang, s.a1);
      const hd = Math.min(Math.abs(a0), Math.abs(a1)) * q * AV_R;
      if (hd < 2.5) c = s.land === null || sectorAt(ang + (a0 < a1 ? -0.05 : 0.05)).land === null ? C('#8A5A44') : (h < 0.3 ? HEDGE_L : HEDGE);
      else if (hd < 3.5 && chk) c = HEDGE;
    } else if (q < e + 0.04 && !(Math.abs(wrapNear(ang, AMERICA.mid) - AMERICA.mid) < 0.05 && y > HC.y)) {
      // The berm round the park: trees, dithered
      const b = noise(x * 0.18, y * 0.18);
      c = b > 0.62 ? BERM[3] : b > 0.4 ? BERM[1] : chk ? BERM[0] : BERM[2];
    } else {
      // Outside the park
      const b = noise(x * 0.05, y * 0.05);
      c = h < 0.2 ? GRASS[1] : b > 0.66 ? GRASS[2] : GRASS[0];
      // (the woods past Wilderness Land, off park property)
      const fa = wrapNear(ang, frontier.mid);
      if (fa > frontier.a0 - 0.15 && fa < frontier.a1 + 0.08 && x > 600) { const w = noise(x * 0.2, y * 0.2); c = w > 0.6 ? WOODS[1] : chk ? WOODS[0] : WOODS[2]; }
      // (the cast-only lot, top middle: gray, hatched)
      if (Math.abs(x - 450) < 70 && y < 62) c = (x + y) % 6 < 2 ? CAST_D : CAST;
      // (the front gate's plaza and the parking, under America USA)
      if (y > 790 && Math.abs(x - HC.x) < 90 - (y - 790) * 0.0 && y < 852) c = (y % 6 === 0 || (x + 3) % 12 === 0) ? PLAZA_D : PLAZA;
      if (y >= 852 && x > 270 && x < 640) { c = (h < 0.2 ? ASPHALT_L : ASPHALT); if (y > 906 && (x % 14 === 0) && y % 30 < 18) c = PAINT; }
      // (the water park's deck)
      if (((x - 128) / 132) ** 2 + ((y - 885) / 74) ** 2 < 1) c = (x + y) % 8 < 1 ? C('#E5D3A6') : C('#F1E2BC');
    }
    // The walks
    if (inPark && q > Q_RING - 0.02) {
      for (const s of walks) {
        if (x < s.minX || x > s.maxX || y < s.minY || y > s.maxY) continue;
        const dd = segDist(s, x, y);
        if (dd < s.w) { c = dd > s.w - 1 ? WALK_E : WALK; break; }
      }
    }
    // The water
    let wd = Infinity, wk: Water | null = null, wr = 1;
    for (const r of rivers) {
      const s = r.s;
      if (x < s.minX - 3 || x > s.maxX + 3 || y < s.minY - 3 || y > s.maxY + 3) continue;
      const dd = segDist(s, x, y) / s.w;
      if (dd < wd) { wd = dd; wk = r.kind; wr = s.w; }
    }
    for (const p of POOLS) {
      const dd = Math.hypot((x - p.cx) / p.rx, (y - p.cy) / p.ry);
      if (dd < wd) { wd = dd; wk = p.kind; wr = Math.min(p.rx, p.ry); }
    }
    if (wk && wd < 1 + 2 / wr) {
      const P = WATER[wk];
      const dpx = (1 - wd) * wr;
      if (wd >= 1) c = chk ? SAND : SAND_D;
      else if (dpx < 1.2) c = P[3];
      else if (dpx < 2.5) c = P[2];
      else if (dpx < 3.5) c = chk ? P[2] : P[1];
      else if (dpx < 6) c = P[1];
      else c = chk && dpx < 7 ? P[1] : P[0];
      // (glints)
      if (wd < 0.8 && hashI(x >> 1, y) > 0.985) c = P[3];
    }
    const o = (y * MAP_W + x) * 4;
    d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return cv;
};

const shade = (c: RGB, k: number): RGB => [c[0] * k + 20 * (1 - k), c[1] * k + 14 * (1 - k), c[2] * k + 40 * (1 - k)];
const hashI = (x: number, y: number) => { let n = (x * 374761393 + y * 668265263) | 0; n = (n ^ (n >>> 13)) * 1274126177 | 0; return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
/** Smooth value noise (0..1). */
const noise = (x: number, y: number) => {
  const X = Math.floor(x), Y = Math.floor(y), fx = x - X, fy = y - Y;
  const s = (t: number) => t * t * (3 - 2 * t);
  const a = hashI(X, Y), b = hashI(X + 1, Y), c = hashI(X, Y + 1), d = hashI(X + 1, Y + 1);
  const u = s(fx), v = s(fy);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
export { hashI };
