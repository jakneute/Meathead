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
type Water = 'river' | 'moat' | 'mud' | 'lagoon' | 'pool' | 'slime' | 'ice';
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
  // (the Great Pixie's castle's drained moat: mud, partly frozen over, skaters' ice in patches)
  { ...ctr('fantasy', 0.15, 0.88), rx: 30, ry: 18, kind: 'ice' },
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
  ice: ['#7A9CC0', '#9ABCDA', '#BCD6EC', '#E4F0F8'].map(C),
};
const SAND = C('#E8D7A0'), SAND_D = C('#C9B47C');
const GROUND: Record<string, RGB[]> = {
  space: ['#C3CDD6', '#D3DCE4', '#AEB9C4', '#7FD8D0'].map(C),
  frontier: ['#C9A564', '#D6B577', '#B08A4C', '#7E9A4A'].map(C),
  spooky: ['#57506E', '#635B7C', '#4A4360', '#3A6448'].map(C),
  cartoon: ['#9EE6A8', '#B4F0BC', '#86D492', '#FDE68A'].map(C),
  hollywood: ['#9A98A2', '#ACAAB4', '#86848E', '#FDE047'].map(C),
  // (Fairy Land's under snow: white, its drifts' shadows stepped down into blue-gray)
  fantasy: ['#E6ECF4', '#F6F9FC', '#C6D2E2', '#9FB0C8'].map(C),
  adventure: ['#2F6B2A', '#3E8236', '#245822', '#6AA83A'].map(C),
  foreign: ['#E2D2AE', '#ECDFBF', '#CCBA92', '#C2564A'].map(C),
  america: ['#D8B08A', '#E4C29E', '#C49A74', '#B23A3A'].map(C),
};
/** Wilderness Land's pine woods: round the trailhead's wilds, and out past the gulch and the mine (the log flume's
 *  hills, the woods off the map); desert scrub between (the flats, the town, the railroad). 0 desert .. 1 woods, with a
 *  band between the dither crosses. */
const WILDS = (() => { const a = ATTRACTIONS.find(t => t.id === 'wilds')!; return attractionAt(a); })();
export const frontierWoods = (x: number, y: number, dq: number) =>
  Math.max(Math.min(1, Math.max(0, (dq - 0.66) / 0.08)), Math.min(1, Math.max(0, (1.15 - Math.hypot((x - WILDS.x) / 46, (y - WILDS.y + 4) / 28)) / 0.15)));
const FOREST = ['#3E5A2E', '#4A6A36', '#2E4824', '#6A5A3A'].map(C);
/** Hollywood Land's Happywood hills (its outer edge): dry grass in contour bands, scrub on them. */
const HILLS = ['#B09A64', '#C2AE78', '#94804E', '#6A7A3A'].map(C);
const STARWALK = C('#C9B4B0'), STARWALK_D = C('#A8949A');
/** Spooky Land's graveyard ground and its headstones. */
const GRAVE = ['#3E4A48', '#48564E', '#323C3C'].map(C), STONE = C('#A8A4B4'), STONE_D = C('#5E5A6C');
/** The White House's lawn, mown in stripes. */
const LAWN = ['#4CC85E', '#6ADC74'].map(C);
/** Future Land's crater (Xenoscare's new neighbor): scorched. */
const SCORCH = ['#5E5A56', '#44403C', '#7A746C'].map(C);
/** Foreign Lands' ground round each pavilion: the regions' own (base, shade), in the lagoon art's pavilion order. */
const REGION: { dx: number; dy: number; c: RGB[]; kind: 'plain' | 'cobble' | 'raked' | 'lawn' }[] = [
  { dx: -46, dy: 6, c: ['#D9A066', '#C08650'].map(C), kind: 'plain' },   // Mexico: terracotta
  { dx: -40, dy: -14, c: ['#7E9A5E', '#66824A'].map(C), kind: 'lawn' },  // Norway: turf
  { dx: -26, dy: -28, c: ['#CDB98E', '#B09C72'].map(C), kind: 'cobble' }, // China: stone court
  { dx: -6, dy: -34, c: ['#B8AC98', '#9A8E7A'].map(C), kind: 'cobble' },  // Germany: cobbles
  { dx: 14, dy: -33, c: ['#DCC8A0', '#C2AC82'].map(C), kind: 'cobble' },  // Italy: piazza
  { dx: 32, dy: -26, c: ['#D8D2C2', '#B8B2A2'].map(C), kind: 'raked' },  // Japan: raked gravel
  { dx: 44, dy: -10, c: ['#E2B87A', '#C89C5E'].map(C), kind: 'plain' },  // Morocco: sand
  { dx: 46, dy: 10, c: ['#C8BCA2', '#ACA086'].map(C), kind: 'raked' },   // France: gravel allees
  { dx: -26, dy: 22, c: ['#7FA85A', '#668E46'].map(C), kind: 'lawn' },   // UK: lawn
  { dx: 26, dy: 22, c: ['#5E7E4A', '#4A6838'].map(C), kind: 'lawn' },    // Canada: forest floor
];
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

/** The ground, painted in row bands: `step(until)` paints rows till performance.now() passes `until` (true once it's
 *  all down, on `cv`). So it can be done a slice at a time in idle moments during play (no hitch), or all at once. */
export const terrainJob = () => {
  const cv = document.createElement('canvas'); cv.width = MAP_W; cv.height = MAP_H;
  const g = cv.getContext('2d')!;
  const img = g.createImageData(MAP_W, MAP_H), d = img.data;
  const walks = WALKS, rivers = RIVERS.flatMap(r => r.segs.map(s => ({ s, kind: r.kind })));
  const frontier = SECTORS.find(s => s.land === L('frontier'))!;
  const lagoon = POOLS.find(p => p.kind === 'lagoon')!;
  const regAng = REGION.map(r => Math.atan2(r.dy, r.dx));
  const wh = attractionAt(ATTRACTIONS.find(a => a.id === 'whitehouse')!);
  const xs = attractionAt(ATTRACTIONS.find(a => a.id === 'xenoscare')!), crater = { x: xs.x + 20, y: xs.y - 1 };
  let row = 0, done = false;
  const step = (until: number): boolean => {
  if (done) return true;
  for (; row < MAP_H; row++) {
  if ((row & 7) === 0 && performance.now() > until) return false;
  const y = row;
  for (let x = 0; x < MAP_W; x++) {
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
      // (how far out into the land, 0 at the ring walk .. 1 at its edge)
      const dq = (q - Q_RING) / (e - Q_RING);
      const a0 = wrapNear(ang, s.a0) - s.a0, a1 = s.a1 - wrapNear(ang, s.a1);
      // (the land's ground: its tone, speckled, a few patches of its accent)
      c = h < 0.18 ? P[1] : h > 0.86 ? P[2] : P[0];
      const blob = noise(x * 0.06, y * 0.06);
      if (blob > 0.72) c = P[2];
      if (id === 'space' && ((x % 12 === 0) || (y % 12 === 0))) c = P[2];
      if (id === 'space' && blob > 0.8 && chk) c = P[3];
      if (id === 'america' && ((y % 5 === 0) || ((x + (Math.floor(y / 5) % 2) * 5) % 10 === 0))) c = P[2];
      if (id === 'cartoon' && ((x % 14 - 7) ** 2 + (y % 14 - 7) ** 2 < 4)) c = P[3];
      if (id === 'adventure' && blob > 0.55 && chk) c = P[2];
      if (id === 'adventure' && blob < 0.25) c = P[3];
      if (id === 'frontier' && blob < 0.28 && chk) c = P[3];
      if (id === 'spooky' && blob < 0.25 && chk) c = P[3];
      if (id === 'fantasy') {
        // (snow: sunlit crust, then the drifts' shadows in stepped bands, dithered between; a sparkle here and there)
        c = blob < 0.3 || h < 0.14 ? P[1] : P[0];
        if (blob > 0.6 && chk) c = P[2];
        if (blob > 0.66) c = P[2];
        if (blob > 0.78 && chk) c = P[3];
        if (blob > 0.84) c = P[3];
        if (h > 0.992) c = [255, 255, 255];
      }
      const woods = id === 'frontier' ? frontierWoods(x, y, dq) : 0;
      if (woods > 0) {
        // (the pine woods: needle floor, dithered into the desert scrub where they meet)
        const f = h < 0.2 ? FOREST[1] : blob > 0.66 ? FOREST[2] : FOREST[0];
        if (woods >= 1 || (woods > 0.5 ? chk || h < woods : chk && h < woods)) c = blob < 0.22 && chk ? FOREST[3] : f;
      }
      if (id === 'hollywood' && (x % 16 === 0 || y % 20 === 0)) c = P[1];
      if (id === 'hollywood' && dq > 0.8) {
        // (the Happywood hills along its back: contour bands, scrub on them)
        const band = Math.floor((dq - 0.8) * AV_R * 0.32 + blob * 3);
        c = band % 3 === 0 ? HILLS[1] : band % 3 === 1 ? HILLS[0] : HILLS[2];
        if (h > 0.9 || (blob > 0.6 && chk && h > 0.6)) c = HILLS[3];
        if (dq < 0.84 && chk) c = P[0];
      }
      if (id === 'hollywood' && dq < 0.3) {
        // (the blvd's walk of fame either side of the street in: pink terrazzo, a gold star every few steps)
        const off = Math.abs(wrapNear(ang, s.mid) - s.mid) * q * AV_R;
        if (off < 9) { c = (x + y) % 5 === 0 ? STARWALK_D : STARWALK; if (y % 7 === 0 && x % 3 === 1) c = P[3]; }
      }
      if (id === 'spooky' && noise(x * 0.035 + 40, y * 0.035 + 7) > 0.64) {
        // (the graveyard: dank turf, headstones in crooked rows)
        c = h < 0.2 ? GRAVE[1] : chk && blob > 0.6 ? GRAVE[2] : GRAVE[0];
        const col = Math.floor(x / 5), rowI = Math.floor(y / 6), jx = x - col * 5, jy = y - rowI * 6;
        if (hashI(col, rowI) > 0.35) { if (jx === 2 && (jy === 1 || jy === 2)) c = STONE; else if (jx === 2 && jy === 3) c = STONE_D; }
      }
      if (id === 'cartoon') {
        // (the White House's lawn, mown in stripes)
        const ld = Math.hypot((x - wh.x) / 34, (y - wh.y + 4) / 18);
        if (ld < 1) c = Math.floor((x + y * 0.5) / 4) % 2 ? LAWN[0] : LAWN[1];
      }
      if (id === 'space') {
        // (the crater: scorched in rings out from it)
        const cd = Math.hypot((x - crater.x) / 20, (y - crater.y) / 10);
        if (cd < 1 && (cd < 0.7 || chk)) c = cd < 0.45 ? SCORCH[1] : h < 0.25 ? SCORCH[2] : SCORCH[0];
      }
      if (id === 'foreign') {
        // (each pavilion's region round the lagoon its own ground: by which pavilion it's nearest round the shore)
        const pa = Math.atan2(y - lagoon.cy, x - lagoon.cx);
        let bi = 0, bd = Infinity;
        regAng.forEach((ra, i) => { const dd = Math.abs(wrapNear(pa, ra) - ra); if (dd < bd) { bd = dd; bi = i; } });
        const rg = REGION[bi], Rc = rg.c;
        c = h < 0.12 ? Rc[1] : Rc[0];
        if (rg.kind === 'cobble' && (x % 4 === 0 || (y + ((x >> 2) & 1) * 2) % 3 === 0)) c = Rc[1];
        if (rg.kind === 'raked' && y % 3 === 0) c = Rc[1];
        if (rg.kind === 'lawn' && blob > 0.6 && chk) c = Rc[1];
      }
      // (the edge: two stepped bands in, dithered between)
      const ed = (e - q) * AV_R;
      if (ed < 2) c = shade(c, 0.6); else if (ed < 4) c = shade(c, 0.78); else if (ed < 5 && chk) c = shade(c, 0.78);
      // (the hedges between lands: along each slice's edges; America USA's has a wall)
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
      const P = wk === 'ice' && noise(x * 0.22, y * 0.22) < 0.4 ? WATER.mud : WATER[wk];
      const dpx = (1 - wd) * wr;
      if (wd >= 1) c = wk === 'ice' ? (chk ? GROUND.fantasy[2] : GROUND.fantasy[0]) : chk ? SAND : SAND_D;
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
  }
  g.putImageData(img, 0, 0);
  done = true;
  return true;
  };
  return { cv, step };
};
/** The ground, painted once (all at once). */
export const paintTerrain = (): HTMLCanvasElement => { const j = terrainJob(); j.step(Infinity); return j.cv; };

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
