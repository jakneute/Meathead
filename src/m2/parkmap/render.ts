// The park map, put together: the base art (the ground and every landmark, painted once at the paper's own px), the
// details (guests, lamps: only up close), and per zoom level a finished canvas with that level's labels set at screen
// size on it (level of detail: far out just the lands' names; nearer the attractions' numbers; nearer still their
// names and the service icons; right up close the small print). Each level's painted the first time it's wanted and
// kept. The YOU ARE HERE marker and the picked land's outline go on live, over the top.

import { LANDS } from '../hub/lands';
import { signText, signW, rampDown, type Look } from '../signLetters';
import { MAP_W, MAP_H, HC, RX, RY, SECTORS, inLand, edgeQ, fromPolar, Q_RING, sectorOfLand, landMid } from './geo';
import { ATTRACTIONS, NUMBERS, attractionOfZone, landIndex } from './data';
import { paintTerrain, attractionAt } from './terrain';
import { paintFeatures, paintDetails, ICONS, numberBadge, LEGEND } from './global';
import { R, hl, vl, ell, ramp, type Ctx } from './paint';

/** The map's window on screen (game px). */
export const VIEW_W = 468, VIEW_H = 516;
export const FIT = Math.min(VIEW_W / MAP_W, VIEW_H / MAP_H);
/** The zoom steps: the whole park, then nearer. */
export const ZOOMS = [FIT, 0.75, 1, 2];

let base: HTMLCanvasElement | null = null, details: HTMLCanvasElement | null = null;
const levels: (HTMLCanvasElement | null)[] = ZOOMS.map(() => null);

const canvas = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; };

const baseArt = () => {
  if (base) return base;
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

/** A label on a plate, centered on (x, y) (screen px of the level), unless it'd sit on one already placed. */
const plate = (g: Ctx, placed: Box[], text: string, x: number, y: number, L: Look, bg: string, edge: string, pad = 2, force = false): boolean => {
  const w = signW(text, L) + pad * 2 + 2, h = 7 * (L.sy ?? 1) + pad * 2 + 1;
  const box = { x: Math.round(x - w / 2), y: Math.round(y - h / 2), w, h };
  if (!force && placed.some(b => hits(b, box))) return false;
  placed.push(box);
  R(g, box.x + 1, box.y + 1, w, h, 'rgba(40,24,8,0.35)');
  R(g, box.x, box.y, w, h, bg);
  hl(g, box.x, box.y, w, edge); hl(g, box.x, box.y + h - 1, w, edge); vl(g, box.x, box.y, h, edge); vl(g, box.x + w - 1, box.y, h, edge);
  signText(g, text, box.x + w / 2, box.y + pad + 1 + 7 * (L.sy ?? 1), L);
  return true;
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
const GAGS: { t: string; x: number; y: number }[] = [
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
    return { t, x: p.x + off[k][0], y: p.y + off[k][1] + 7 };
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
function gagsIn(id: string, list: [string, number, number][]) { return list.map(([t, u, v]) => ({ t, ...inLand(landIndex(id), u, v) })); }

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
    tag('AMERICA USA', HC.x + 66, 690); tag('TICKETS + GATE', HC.x - 66, 806); tag('SECURITY', HC.x + 76, 832); tag('PARKING P1-P47', HC.x, 950); tag('WATER PARK', 128, 830);
    tag('THE HAPPY HUB', HC.x, HC.y + 40);
  }
  // Attractions: their numbers (nearer), their names (nearer still)
  if (s >= 0.75) for (const a of ATTRACTIONS) {
    if (a.land === 'hub') continue;
    const p = at(attractionAt(a)), n = NUMBERS[a.id];
    if (s >= 1) {
      const L = { ...SMALL, fill: INK, bold: s >= 2 };
      const ok = plate(g, placed, n ? `${n}. ${a.name}` : a.name, p.x, p.y + 10 * Math.max(1, s * 0.75), L, a.minor ? '#F3E8D0' : '#FFFBEB', INK);
      if (!ok && n) numberBadge(g, Math.round(p.x), Math.round(p.y + 6 * s), n);
    } else if (n) { numberBadge(g, Math.round(p.x), Math.round(p.y + 5), n); placed.push({ x: p.x - 7, y: p.y - 2, w: 14, h: 14 }); }
  }
  // Services (up close)
  if (s >= 1) for (const sv of SERVICES) { const p = at(sv); const box = { x: p.x - 6, y: p.y - 6, w: 12, h: 12 }; if (placed.some(b => hits(b, box))) continue; placed.push(box); ICONS[sv.kind](g, Math.round(p.x), Math.round(p.y)); }
  // The small print (right up close)
  if (s >= 2) for (const gg of GAGS) plate(g, placed, gg.t, gg.x * s, gg.y * s, { ...SMALL, fill: '#57534E' }, 'rgba(255,251,235,0.9)', '#A8A29E', 1);
  levels[i] = c;
  return c;
};

/** Paints the base and the far level ahead of time (an idle moment after the game's up), so the map comes up at once. */
export const prewarmParkMap = () => {
  const idle = (f: () => void) => ((window as unknown as { requestIdleCallback?: (f: () => void) => void }).requestIdleCallback ?? ((h: () => void) => setTimeout(h, 50)))(f);
  idle(() => { baseArt(); idle(() => { levelCanvas(0); }); });
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
