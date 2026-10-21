// The park map, put together: the base art (the ground and every landmark, painted once at the paper's own px), the
// details (guests, lamps: only up close), and per zoom level a finished canvas with that level's labels set at screen
// size on it (level of detail: far out just the lands' names; nearer the attractions' numbers; nearer still their
// names and the service icons; right up close the small print). Each level's painted the first time it's wanted and
// kept. The YOU ARE HERE marker and the picked land's outline go on live, over the top.

import { LANDS } from '../hub/lands';
import { signText, signW, rampDown, type Look } from '../signLetters';
import { MAP_W, MAP_H, HC, RX, RY, SECTORS, inLand, edgeQ, fromPolar, Q_RING, sectorOfLand, landMid, wrapNear } from './geo';
import { ATTRACTIONS, NUMBERS, attractionOfZone, landIndex } from './data';
import { paintTerrain, terrainJob, attractionAt } from './terrain';
import { paintFeatures, featureTasks, paintDetails, ICONS, numberBadge, LEGEND } from './global';
import { R, hl, vl, ell, ramp, type Ctx } from './paint';

/** The map's window on screen (game px). */
export const VIEW_W = 468, VIEW_H = 516;
export const FIT = Math.min(VIEW_W / MAP_W, VIEW_H / MAP_H);
/** The zoom steps: the whole park, then nearer. */
export const ZOOMS = [FIT, 0.75, 1, 2];

let base: HTMLCanvasElement | null = null, details: HTMLCanvasElement | null = null;
const levels: (HTMLCanvasElement | null)[] = ZOOMS.map(() => null);

const canvas = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; };

/** The ground being painted ahead of time, a slice per idle moment (prewarmParkMap); finished at once if the map's
 *  opened before it's done. */
let job: ReturnType<typeof terrainJob> | null = null;
/** The landmarks still to paint onto the prewarmed ground (null: not started). */
let tasks: (() => void)[] | null = null;
const baseArt = () => {
  if (base) return base;
  if (job) {
    job.step(Infinity);
    const g = job.cv.getContext('2d')!;
    g.imageSmoothingEnabled = false;
    for (const t of tasks ?? featureTasks(g)) t();
    base = job.cv; job = null; tasks = null;
    return base;
  }
  const c = paintTerrain();
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  paintFeatures(g);
  base = c;
  return c;
};
const detailArt = () => {
  if (details) return details;
  const c = canvas(MAP_W, MAP_H), g = c.getContext('2d')!;
  paintDetails(g);
  details = c;
  return c;
};

// ---- labels
interface Box { x: number; y: number; w: number; h: number }
const hits = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const INK = '#3B2A14';

/** A plate's size for a label of one or more lines. */
const LINE_GAP = 2;
const plateSize = (lines: string[], L: Look, pad: number) => ({
  w: Math.max(...lines.map(t => signW(t, L))) + pad * 2 + 2,
  h: lines.length * 7 * (L.sy ?? 1) + (lines.length - 1) * LINE_GAP + pad * 2 + 1,
});
/** A label on a plate (a line, or a few stacked), centered on (x, y) (screen px of the level), unless it'd sit on one
 *  already placed. */
const plate = (g: Ctx, placed: Box[], text: string | string[], x: number, y: number, L: Look, bg: string, edge: string, pad = 2, force = false): boolean => {
  const lines = typeof text === 'string' ? [text] : text;
  const { w, h } = plateSize(lines, L, pad);
  const box = { x: Math.round(x - w / 2), y: Math.round(y - h / 2), w, h };
  if (!force && placed.some(b => hits(b, box))) return false;
  placed.push(box);
  R(g, box.x + 1, box.y + 1, w, h, 'rgba(40,24,8,0.35)');
  R(g, box.x, box.y, w, h, bg);
  hl(g, box.x, box.y, w, edge); hl(g, box.x, box.y + h - 1, w, edge); vl(g, box.x, box.y, h, edge); vl(g, box.x + w - 1, box.y, h, edge);
  const lh = 7 * (L.sy ?? 1);
  lines.forEach((t, k) => signText(g, t, box.x + w / 2, box.y + pad + 1 + lh + k * (lh + LINE_GAP), L));
  return true;
};

// ---- keeping a label in its own land
/** Whether a paper point's inside a land's slice, at least m paper px in from its sides, the ring walk and its outer
 *  edge (`past`: an off-the-map bit past the edge: out to beyond it, still between the land's sides). */
const inSlice = (li: number, x: number, y: number, m: number, past = false) => {
  const s = sectorOfLand(li), dx = x - HC.x, dy = y - HC.y;
  const a = wrapNear(Math.atan2(dy / RY, dx / RX), s.mid);
  if (a < s.a0 || a > s.a1) return false;
  const side = (ang: number) => { const ux = Math.cos(ang) * RX, uy = Math.sin(ang) * RY; return Math.abs(dx * uy - dy * ux) / Math.hypot(ux, uy); };
  if (side(s.a0) < m || side(s.a1) < m) return false;
  const q = Math.hypot(dx / RX, dy / RY), qm = m / RY;
  if (q < Q_RING + qm) return false;
  return past ? q < 1.3 : q < edgeQ(a) - qm;
};
/** Whether a box (screen px of a level at scale s) sits wholly inside a land (its rim walked every few px). */
const boxInLand = (li: number, b: Box, s: number, m: number, past = false) => {
  const step = 3;
  for (let x = b.x; ; x = Math.min(b.x + b.w, x + step)) {
    if (!inSlice(li, x / s, b.y / s, m, past) || !inSlice(li, x / s, (b.y + b.h) / s, m, past)) return false;
    if (x >= b.x + b.w) break;
  }
  for (let y = b.y; ; y = Math.min(b.y + b.h, y + step)) {
    if (!inSlice(li, b.x / s, y / s, m, past) || !inSlice(li, (b.x + b.w) / s, y / s, m, past)) return false;
    if (y >= b.y + b.h) break;
  }
  return true;
};
/** A name's ways of setting: on one line, then broken onto two (the most even breaks first; a number stays with its
 *  first word). */
const wraps = (text: string, L: Look): string[][] => {
  const words = text.split(' '), two: string[][] = [];
  for (let k = 1; k < words.length; k++) {
    const a = words.slice(0, k).join(' '), b = words.slice(k).join(' ');
    if (/^\d+\.$/.test(a)) continue;
    two.push([a, b]);
  }
  two.sort((p, q) => Math.max(...p.map(t => signW(t, L))) - Math.max(...q.map(t => signW(t, L))));
  return [[text], ...two.slice(0, 2)];
};
interface Spot { lines: string[]; x: number; y: number; cost: number }
/** Every place a label might go round its landmark at (px, py) (screen px), cheapest first: under it, nudged across,
 *  further under, over it, beside it; on one line, then on two. */
const spotsFor = (text: string, L: Look, pad: number, px: number, py: number, s: number): Spot[] => {
  const out: Spot[] = [];
  wraps(text, L).forEach((lines, wi) => {
    const { w, h } = plateSize(lines, L, pad), wc = wi ? 14 : 0;
    const dxs = [0]; for (let d = 6; d <= 96; d += 6) dxs.push(d, -d);
    for (const dx of dxs) {
      for (let k = 0; k <= 8; k++) out.push({ lines, x: px + dx, y: py + 4 * s + h / 2 + k * 4, cost: Math.abs(dx) + k * 5 + wc });
      for (let k = 0; k <= 4; k++) out.push({ lines, x: px + dx, y: py - 24 * s - h / 2 - k * 4, cost: 18 + Math.abs(dx) + k * 5 + wc });
    }
    for (const side of [-1, 1]) for (let k = 0; k <= 4; k++) for (const dy of [0, -6, 6, -12, 12])
      out.push({ lines, x: px + side * (14 * s + w / 2 + k * 4), y: py - 8 * s + dy, cost: 24 + k * 5 + Math.abs(dy) + wc });
  });
  return out.sort((a, b) => a.cost - b.cost);
};
/** The best spot for a label inside its land (clear of the labels down already, then of the landmarks too where
 *  it can be), or null. */
const findSpot = (spots: Spot[], L: Look, pad: number, li: number, s: number, placed: Box[], art: Box[], past: boolean, mustFit: boolean) => {
  const W = MAP_W * s, H = MAP_H * s, m = 3 / s + 1;
  const boxOf = (sp: Spot): Box => { const { w, h } = plateSize(sp.lines, L, pad); return { x: Math.round(sp.x - w / 2), y: Math.round(sp.y - h / 2), w, h }; };
  const fits = (b: Box, mm: number) => b.x >= 2 && b.y >= 2 && b.x + b.w <= W - 2 && b.y + b.h <= H - 2 && boxInLand(li, b, s, mm, past);
  for (const sp of spots) { const b = boxOf(sp); if (!placed.some(o => hits(o, b)) && !art.some(o => hits(o, b)) && fits(b, m)) return sp; }
  for (const sp of spots) { const b = boxOf(sp); if (!placed.some(o => hits(o, b)) && fits(b, m)) return sp; }
  if (!mustFit) return null;
  for (const sp of spots) { const b = boxOf(sp); if (fits(b, 0.5)) return sp; }
  return spots[0];
};

/** The landmarks' rough boxes (screen px of a level at scale s): labels keep off them where they can. */
const artBoxes = (s: number): Box[] => ATTRACTIONS.filter(a => a.land !== 'hub').map(a => { const p = attractionAt(a); return { x: (p.x - 13) * s, y: (p.y - 22) * s, w: 26 * s, h: 24 * s }; });

/** Every attraction's name (its brochure number first), each on a plate by its landmark, kept inside its own land. */
const attractionLabels = (g: Ctx, placed: Box[], s: number) => {
  const L: Look = { ...SMALL, fill: INK, bold: s >= 2 }, pad = 2;
  const list = ATTRACTIONS.filter(a => a.land !== 'hub');
  // (the landmarks themselves: a label keeps off them where it can)
  const art = artBoxes(s);
  // (the big ones first, the longest names first: they've the fewest places to go)
  const order = [...list].sort((a, b) => Number(!!a.minor) - Number(!!b.minor) || b.name.length - a.name.length);
  for (const a of order) {
    const p = attractionAt(a), n = NUMBERS[a.id], text = n ? `${n}. ${a.name}` : a.name;
    const li = landIndex(a.land), past = (a.v ?? 0) > 1;
    const sp = findSpot(spotsFor(text, L, pad, p.x * s, p.y * s, s), L, pad, li, s, placed, art, past, true)!;
    plate(g, placed, sp.lines, sp.x, sp.y, L, a.minor ? '#F3E8D0' : '#FFFBEB', INK, pad, true);
  }
};

/** The service icons round each land and the hub. */
const SERVICES: { kind: keyof typeof ICONS; x: number; y: number }[] = (() => {
  const out: { kind: keyof typeof ICONS; x: number; y: number }[] = [];
  LANDS.forEach((_, li) => {
    const add = (kind: keyof typeof ICONS, u: number, v: number) => { const p = inLand(li, u, v); out.push({ kind, x: p.x, y: p.y }); };
    add('restroom', -0.4, 0.1); add('food', 0.4, 0.1); add('aid', 0.42, 0.74); add('shop', -0.42, 0.74);
  });
  const hub = (kind: keyof typeof ICONS, a: number, q: number) => { const p = fromPolar(a, q); out.push({ kind, x: Math.round(p.x), y: Math.round(p.y) }); };
  hub('aid', -2.3, Q_RING - 0.025); hub('restroom', -0.8, Q_RING - 0.025); hub('food', 0.6, Q_RING - 0.025);
  out.push({ kind: 'restroom', x: HC.x + 30, y: 760 }, { kind: 'shop', x: HC.x - 30, y: 640 }, { kind: 'food', x: HC.x + 30, y: 600 });
  return out;
})();

/** The small print, right up close. */
const GAGS: { t: string; x: number; y: number; li?: number }[] = [
  { t: 'LOST CHILDREN', x: HC.x - 46, y: HC.y - 56 }, { t: 'LOST ADULTS', x: HC.x + 46, y: HC.y - 56 },
  { t: 'OVERFLOW PARKING: NEXT STATE >', x: 556, y: 958 }, { t: 'COMING SOON-ISH', x: 128, y: 950 },
  { t: 'STAR-SPANGLED SPLASH ZONE: OPENS 2031', x: 150, y: 806 }, { t: 'CAST ONLY · NOT ON MAP', x: 450, y: 22 },
  { t: 'OUTER SPACE (NOT TO SCALE) ^', x: 640, y: 30 }, { t: 'PARK PROPERTY ENDS', x: 790, y: 200 },
  { t: 'NOT RESPONSIBLE PAST HERE', x: 800, y: 212 }, { t: 'RESTROOMS: 2.4 MILES', x: 300, y: 940 },
  { t: 'MONORAIL TO THE OTHER MONORAIL', x: 140, y: 300 }, { t: 'FREEDOM WALKING ONLY', x: HC.x + 58, y: 560 },
  { t: 'ONE WAY. NO RE-ENTRY.', x: HC.x - 62, y: 790 }, { t: 'REMEMBER WHERE YOU PARKED', x: HC.x, y: 862 },
  { t: '1 INCH = 1 MILE (APPROX.)', x: LEGEND.x + LEGEND.w / 2, y: LEGEND.y + LEGEND.h + 8 },
  ...['MEXICO', 'NORWAY', 'CHINA', 'GERMANY', 'ITALY', 'JAPAN', 'MOROCCO', 'FRANCE', 'UK', 'CANADA'].map((t, k) => {
    const off: [number, number][] = [[-46, 6], [-40, -14], [-26, -28], [-6, -34], [14, -33], [32, -26], [44, -10], [46, 10], [-26, 22], [26, 22]];
    const p = inLand(landIndex('foreign'), 0, 0.42);
    return { t, x: p.x + off[k][0], y: p.y + off[k][1] + 7, li: landIndex('foreign') };
  }),
  ...gagsIn('adventure', [['DO NOT LICK THE DINOSAUR', -0.25, 0.72], ['THE BACKSIDE OF WATER', -0.12, 0.9], ['MOUNT KABOOMA (FIBERGLASS)', -0.18, 0.52]]),
  ...gagsIn('spooky', [['BOTTOMLESS MOAT', -0.1, 0.62], ['MUST BE THIS SHORT', 0.2, 0.26], ['CLOCK TOWER: STAFF ONLY', 0.3, 0.72]]),
  ...gagsIn('space', [['MONORAIL', 0.1, 0.24], ['IMPACT SITE (NEW!)', 0.38, 0.94], ['ICE CREAM $14', -0.32, 0.22]]),
  ...gagsIn('hollywood', [['HAPPYWOOD (O FELL OVER)', 0.0, 0.98], ['CRAFT SERVICES', 0.12, 0.7], ['SAFE TORNADO LAUNCHING ZONE', -0.32, 0.92]]),
  ...gagsIn('frontier', [['THE LOGS GOT OUT', 0.12, 0.94], ['SARSAPARILLA', -0.2, 0.7], ['BEAR TRAPS ARE AUTHENTIC', -0.3, 0.3]]),
  ...gagsIn('fantasy', [['MOAT DRAINED FOR CLEANING', 0.15, 0.98], ['PLATFORM 7 5/8', -0.12, 0.26], ['THE MUSHROOMS ARE LISTENING', 0.3, 0.52]]),
  ...gagsIn('cartoon', [['UPDATED 1994', 0.1, 0.26], ['GLOPPY', 0.05, 0.7], ['BEER GARDEN', 0.36, 0.95]]),
  ...gagsIn('foreign', [['THE WAITER IS IGNORING YOU', 0.3, 0.62], ['CUSTOMS', 0.0, 0.14]]),
];
function gagsIn(id: string, list: [string, number, number][]) { return list.map(([t, u, v]) => ({ t, ...inLand(landIndex(id), u, v), li: landIndex(id) })); }

const SMALL: Look = { sx: 1, sy: 1, fill: INK };
const landLook = (li: number, big: boolean): Look => ({ sx: 1, sy: big ? 2 : 1, bold: true, fill: rampDown(LANDS[li].swirl[2], 0.35), dither: true, ink: LANDS[li].sign, shadow: '#1C1206', drop: 1 });
/** Where a land's name sits. */
export const landLabelAt = (li: number) => inLand(li, 0, 1.0);

/** A zoom level's finished canvas. */
export const levelCanvas = (i: number): HTMLCanvasElement => {
  const have = levels[i];
  if (have) return have;
  const s = ZOOMS[i], c = canvas(MAP_W * s, MAP_H * s), g = c.getContext('2d')!;
  g.imageSmoothingEnabled = s < 1;
  g.imageSmoothingQuality = 'high';
  g.drawImage(baseArt(), 0, 0, MAP_W * s, MAP_H * s);
  if (s >= 1) g.drawImage(detailArt(), 0, 0, MAP_W * s, MAP_H * s);
  g.imageSmoothingEnabled = false;
  const placed: Box[] = [];
  const at = (p: { x: number; y: number }) => ({ x: p.x * s, y: p.y * s });
  // The lands' names (every level but the closest: there, the panels say where you are)
  if (s <= 1) LANDS.forEach((land, li) => {
    const p = at(landLabelAt(li));
    plate(g, placed, land.name, p.x, p.y, landLook(li, s >= 0.75), land.sign, '#1C1206', s >= 0.75 ? 3 : 2, true);
  });
  // (the way in, named once there's room)
  if (s >= 0.75) {
    const tag = (t: string, x: number, y: number) => plate(g, placed, t, x * s, y * s, { ...SMALL, fill: '#FFFFFF', bold: s >= 1 }, '#1E3A8A', '#0F172A');
    tag('AMERICA USA', HC.x, 720); tag('TICKETS + GATE', HC.x - 66, 806); tag('SECURITY', HC.x + 76, 832); tag('PARKING P1-P47', HC.x, 950); tag('WATER PARK', 128, 830);
    tag('THE HAPPY HUB', HC.x, HC.y + 40);
  }
  // Attractions: their numbers (nearer), their names (nearer still; every one named, each kept inside its own land)
  if (s >= 1) attractionLabels(g, placed, s);
  else if (s >= 0.75) for (const a of ATTRACTIONS) {
    if (a.land === 'hub') continue;
    const p = at(attractionAt(a)), n = NUMBERS[a.id];
    if (n) { numberBadge(g, Math.round(p.x), Math.round(p.y + 5), n); placed.push({ x: p.x - 7, y: p.y - 2, w: 14, h: 14 }); }
  }
  // Services (up close)
  if (s >= 1) for (const sv of SERVICES) { const p = at(sv); const box = { x: p.x - 6, y: p.y - 6, w: 12, h: 12 }; if (placed.some(b => hits(b, box))) continue; placed.push(box); ICONS[sv.kind](g, Math.round(p.x), Math.round(p.y)); }
  // The small print (right up close)
  // (a land's own small print stays in it: nudged in, or left off)
  if (s >= 2) for (const gg of GAGS) {
    const L: Look = { ...SMALL, fill: '#57534E' }, x = gg.x * s, y = gg.y * s;
    if (gg.li === undefined) { plate(g, placed, gg.t, x, y, L, 'rgba(255,251,235,0.9)', '#A8A29E', 1); continue; }
    const spots: Spot[] = [];
    for (let dx = -60; dx <= 60; dx += 6) for (let dy = -24; dy <= 24; dy += 4) spots.push({ lines: [gg.t], x: x + dx, y: y + dy, cost: Math.abs(dx) + Math.abs(dy) * 2 });
    spots.sort((a, b) => a.cost - b.cost);
    const sp = findSpot(spots, L, 1, gg.li, s, placed, artBoxes(s), false, false);
    if (sp) plate(g, placed, sp.lines, sp.x, sp.y, L, 'rgba(255,251,235,0.9)', '#A8A29E', 1, true);
  }
  levels[i] = c;
  return c;
};

/** Paints the base and the far level ahead of time (an idle moment after the game's up), so the map comes up at once. */
// (the ground a few rows at a time in each idle moment (never more than a few ms: no hitch in play), then the
// landmarks, then the far level, each in an idle moment of its own)
export const prewarmParkMap = () => {
  type Idle = (f: (d?: { timeRemaining(): number }) => void) => void;
  const idle: Idle = (window as unknown as { requestIdleCallback?: Idle }).requestIdleCallback ?? (h => setTimeout(() => h(), 50));
  if (base || job) return;
  job = terrainJob();
  const slice = (d?: { timeRemaining(): number }) => {
    if (base || !job) return;
    const until = performance.now() + Math.min(4, Math.max(1, (d?.timeRemaining() ?? 4) - 1));
    if (!job.step(until)) { idle(slice); return; }
    // (then the landmarks, a few per idle moment, each one whole)
    if (!tasks) { const g = job.cv.getContext('2d')!; g.imageSmoothingEnabled = false; tasks = featureTasks(g); }
    do { tasks.shift()?.(); } while (tasks.length && performance.now() < until);
    if (tasks.length) { idle(slice); return; }
    base = job.cv; job = null; tasks = null;
    // (then the far level; then the up-close details and the 1:1 level the hub's portal card shows (painted the moment
    // a card came up, they stalled it), each in an idle moment of its own)
    const one = ZOOMS.indexOf(1);
    idle(() => { levelCanvas(0); idle(() => { detailArt(); if (one >= 0) idle(() => { levelCanvas(one); }); }); });
  };
  idle(slice);
};

// ---- where he is
export interface Here { place: string; zone: string | null }
/** His rough spot on the paper (the attraction his zone's in, else the middle of his land, else the hub). */
export const herePoint = (h: Here): { x: number; y: number } => {
  const a = attractionOfZone(h.zone);
  if (h.place === 'staff') return { x: 450, y: 52 };
  // (the hub's own stage is the hub: a zone left over from the way in (the gates) doesn't count)
  if (h.place === 'hub') return { x: HC.x, y: HC.y + 26 };
  if (a &&(a.land === h.place || a.land === 'hub')) return attractionAt(a);
  const li = landIndex(h.place);
  if (li >= 0) return landMid(li);
  if (h.place === 'intro') return { x: HC.x, y: 840 };
  return { x: HC.x, y: HC.y + 26 };
};
/** The land he's in (its index), or -1. */
export const hereLand = (h: Here) => landIndex(h.place);

/** The marker, live: a red pin bobbing over his spot, a dashed ring round it (it's rough), the words. */
export const drawMarker = (g: Ctx, x: number, y: number, t: number) => {
  const bob = Math.round(Math.abs(Math.sin(t / 220)) * -5);
  const blink = Math.floor(t / 400) % 2 === 0;
  g.save();
  g.strokeStyle = blink ? '#DC2626' : '#FDE047'; g.lineWidth = 2; g.setLineDash([3, 3]);
  g.beginPath(); g.ellipse(x, y, 16, 9, 0, 0, Math.PI * 2); g.stroke();
  g.restore();
  ell(g, x, y - 14 + bob, 5, 5, ramp('#DC2626'));
  R(g, x - 1, y - 9 + bob, 3, 8, '#7F1D1D'); R(g, x - 1, y - 16 + bob, 2, 2, '#FCA5A5');
  const L: Look = { sx: 1, sy: 1, bold: true, fill: '#FFFFFF' };
  const text = 'YOU ARE HERE', w = signW(text, L) + 8;
  const lx = Math.round(x - w / 2), ly = Math.round(y - 34 + bob);
  R(g, lx + 1, ly + 1, w, 13, 'rgba(0,0,0,0.4)');
  R(g, lx, ly, w, 13, blink ? '#DC2626' : '#B91C1C'); hl(g, lx, ly, w, '#FCA5A5'); hl(g, lx, ly + 12, w, '#7F1D1D');
  signText(g, text, x, ly + 10, L);
  signText(g, '(ROUGHLY)', x, y + 18, { sx: 1, sy: 1, fill: '#7F1D1D', shadow: '#FFFBEB' });
};

/** A land's outline (its slice of the ring), in paper px. */
export const landOutline = (li: number): { x: number; y: number }[] => {
  const s = sectorOfLand(li), pts: { x: number; y: number }[] = [];
  const N = 24;
  for (let k = 0; k <= N; k++) { const a = s.a0 + (s.a1 - s.a0) * (k / N); pts.push(fromPolar(a, edgeQ(a))); }
  for (let k = N; k >= 0; k--) { const a = s.a0 + (s.a1 - s.a0) * (k / N); pts.push(fromPolar(a, Q_RING)); }
  return pts;
};
/** Which land a paper point's in (by its slice, inside the edge), or -1 (the hub, America USA, outside). */
export const landAtPoint = (x: number, y: number) => {
  const dx = (x - HC.x), dy = (y - HC.y);
  for (const s of SECTORS) {
    if (s.land === null) continue;
    let a = Math.atan2(dy / RY, dx / RX);
    while (a < s.a0) a += Math.PI * 2;
    while (a >= s.a0 + Math.PI * 2) a -= Math.PI * 2;
    if (a < s.a1) { const q = Math.hypot(dx / RX, dy / RY); return q > Q_RING && q < edgeQ(a) + 0.02 ? s.land : -1; }
  }
  return -1;
};
