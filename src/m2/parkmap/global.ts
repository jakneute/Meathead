// The park map's big pieces round the lands: the hub plaza (its eight portals in a ring, the fountain), America USA's
// street (shops, flags), the front gate and the ticket booths, security, the parking garage and the lot, the water
// park (coming soon-ish), the cast-only lot (not on map), the monorail round it all, the woods; the trees scattered
// through every land; the brochure's own bits on the paper: the title, the compass, the legend.

import { LANDS } from '../hub/lands';
import { signText, rampDown, tone } from '../signLetters';
import { type Ctx, R, px, hl, vl, dith, line, ell, block, windows, spire, flag, tree, ramp, mix, hash, type TreeKind } from './paint';
import { MAP_W, HC, RX, RY, Q_HUB, SECTORS, AMERICA, fromPolar, polar, edgeQ, sectorAt } from './geo';
import { ATTRACTIONS } from './data';
import { attractionAt, WALKS, POOLS, RIVERS } from './terrain';
import { LANDMARKS, guests } from './landmarks';

/** The hub plaza: the ring of portals (each its land's swirl), the HAPPY fountain in the middle. */
const hubPlaza = (g: Ctx) => {
  SECTORS.forEach(s => {
    const p = fromPolar(s.mid, Q_HUB - 0.035), x = Math.round(p.x), y = Math.round(p.y);
    if (s.land === null) { block(g, x - 6, y + 4, 12, 6, 2, '#1E3A8A', '#DC2626'); return; }
    const sw = LANDS[s.land].swirl;
    // (an arch, its swirl inside)
    R(g, x - 5, y - 10, 10, 12, ramp('#E7D9BC').base); hl(g, x - 5, y - 10, 10, ramp('#E7D9BC').lit);
    ell(g, x, y - 4, 3, 5, sw[0], false); ell(g, x, y - 4, 2, 3, sw[1], false); px(g, x, y - 4, sw[2]);
    hl(g, x - 6, y - 11, 12, '#3B2A14'); vl(g, x - 6, y - 10, 12, '#3B2A14'); vl(g, x + 5, y - 10, 12, '#3B2A14');
  });
  // (the fountain: a basin, a jet, the HAPPY statue)
  ell(g, HC.x, HC.y + 4, 22, 11, ramp('#D6C096'));
  ell(g, HC.x, HC.y + 3, 18, 8, ramp('#3A92D4'));
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; px(g, Math.round(HC.x + Math.cos(a) * 12), Math.round(HC.y + 3 + Math.sin(a) * 5), '#BDE6FA'); }
  R(g, HC.x - 3, HC.y - 14, 6, 16, ramp('#F5F0E1').base); vl(g, HC.x + 2, HC.y - 14, 16, ramp('#F5F0E1').shade);
  ell(g, HC.x, HC.y - 18, 6, 6, ramp('#FACC15'));
  px(g, HC.x - 2, HC.y - 19, '#1C1917'); px(g, HC.x + 2, HC.y - 19, '#1C1917'); hl(g, HC.x - 2, HC.y - 16, 5, '#1C1917');
};

/** America USA: its street down through the gap, a run of shopfronts down each side, flags out. */
const americaStreet = (g: Ctx) => {
  const top = Math.round(fromPolar(Math.PI / 2, Q_HUB + 0.05).y), foot = 790;
  R(g, HC.x - 7, top, 14, foot - top, '#E8DCC0'); vl(g, HC.x - 8, top, foot - top, '#B8A884'); vl(g, HC.x + 7, top, foot - top, '#B8A884');
  for (let y = top + 4; y < foot; y += 14) hl(g, HC.x - 1, y, 2, '#D4C49C');
  const shops = ['#B5463A', '#3E6A9A', '#C9A04A', '#4E7A4A', '#8A4A7A', '#C26A3A'];
  // (its shopfronts start below the gate and the ticket booths at its top: America USA's the way up to them)
  for (let y = top + 58, k = 0; y < foot - 8; y += 16, k++) {
    const half = (y - HC.y) * Math.tan((AMERICA.a1 - AMERICA.a0) / 2) * 0.95;
    for (const side of [-1, 1]) {
      const w = Math.max(10, Math.min(30, half - 9)), x0 = side < 0 ? HC.x - 9 - w : HC.x + 9;
      const c = shops[(k + (side > 0 ? 3 : 0)) % shops.length];
      block(g, x0, y + 10, w, 8, 4, c, mix(c, '#3B2A14', 0.45));
      windows(g, x0 + 1, y + 5, w - 2, Math.max(2, Math.floor(w / 5)), '#FDE68A');
      // (an awning, striped)
      for (let i = 0; i < w; i++) px(g, x0 + i, y + 3, (i >> 1) % 2 ? '#F5F5F4' : c);
      if (k % 2 === 0) flag(g, side < 0 ? x0 + w - 1 : x0, y - 1, k % 4 ? '#DC2626' : '#1E3A8A', 7);
    }
  }
};

/** Where the gate stands: at the top of America USA, right on the hub (in through it, he's on the hub). */
export const GATE_Y = Math.round(fromPolar(Math.PI / 2, Q_HUB + 0.05).y) + 4;
/** The way in, from the bottom: the lot, the parking garage, security, America USA's street up, and at its top end the
 *  ticket booths and the gate, straight onto the hub. */
const wayIn = (g: Ctx) => {
  // (the gate: an arch across the top of the street, the park's name over it; the ticket booths just below it)
  const G = GATE_Y;
  vl(g, HC.x - 24, G + 2, 20, '#7F1D1D'); vl(g, HC.x + 23, G + 2, 20, '#7F1D1D');
  R(g, HC.x - 26, G, 52, 6, '#EC4899'); hl(g, HC.x - 26, G, 52, '#F9A8D4'); hl(g, HC.x - 26, G + 5, 52, '#9D174D');
  for (let k = -2; k <= 2; k++) { block(g, HC.x + k * 12 - 4, G + 32, 8, 7, 3, '#F5F0E1', '#DC2626'); px(g, HC.x + k * 12, G + 28, '#1C1917'); }
  // (security: a row of detector arches, a little booth)
  for (let k = -3; k <= 3; k++) { const x = HC.x + k * 10; vl(g, x - 3, 826, 8, '#94A3B8'); vl(g, x + 3, 826, 8, '#94A3B8'); hl(g, x - 3, 826, 7, '#94A3B8'); }
  block(g, HC.x + 46, 840, 12, 8, 3, '#1E3A8A', '#172554');
  // (the garage: a fat concrete stack, ramps, its levels' stripes)
  block(g, HC.x - 60, 896, 120, 30, 10, '#A8A29E', '#78716C');
  for (let k = 0; k < 4; k++) hl(g, HC.x - 60, 870 + k * 7, 120, '#57534E');
  windows(g, HC.x - 58, 873, 116, 20, '#1C1917', '#44403C', 3, 3);
  line(g, HC.x + 60, 905, HC.x + 76, 890, '#78716C', 3);
  // (the lot past it: rows of cars)
  for (let row = 0; row < 3; row++) for (let i = 0; i < 26; i++) {
    const x = 284 + i * 14, y = 914 + row * 14;
    if (Math.abs(x - HC.x) < 70 && row < 1) continue;
    if (hash(i, row) < 0.25) continue;
    const c = ['#DC2626', '#2563EB', '#F5F5F4', '#1C1917', '#A3A3A3', '#16A34A', '#F59E0B'][Math.floor(hash(i, row, 2) * 7)];
    R(g, x, y, 8, 5, c); hl(g, x + 1, y + 1, 6, mix(c, '#BAE6FD', 0.6)); hl(g, x, y + 5, 8, '#27272A');
  }
};

/** The water park: slides down into its pools, a sign half up. */
const waterPark = (g: Ctx) => {
  const slides: [number, number, string][] = [[64, 820, '#F97316'], [80, 816, '#FDE047'], [96, 822, '#22C55E']];
  for (const [x, y, c] of slides) { vl(g, x, y, 22, '#94A3B8'); for (let t = 0; t < 20; t++) R(g, x + Math.round(Math.sin(t * 0.5) * 6) + t, y + t * 1.6, 3, 2, c); }
  block(g, 170, 836, 26, 10, 3, '#F5F5F4', '#38BDF8');
  // (the sign: one leg up, one down)
  vl(g, 214, 832, 14, '#78716C'); line(g, 236, 846, 238, 838, '#78716C'); line(g, 212, 830, 238, 840, '#E5E7EB', 3);
};

/** The cast-only lot, top middle: trailers, a dumpster, the staff room's door. */
const castLot = (g: Ctx) => {
  for (let k = 0; k < 3; k++) block(g, 392 + k * 30, 40, 22, 9, 3, '#E5E7EB', '#9CA3AF');
  R(g, 486, 30, 10, 6, '#166534'); hl(g, 486, 30, 10, '#22C55E');
  block(g, 444, 58, 12, 10, 2, '#6B7280', '#4B5563'); R(g, 448, 52, 4, 6, '#374151');
};

/** The monorail: a beam all the way round outside the lands, on pylons; a train somewhere on it. */
const monorail = (g: Ctx) => {
  const q = 1.07, pts: { x: number; y: number }[] = [];
  for (let t = 0; t < 900; t++) { const a = (t / 900) * Math.PI * 2; pts.push(fromPolar(a, q * edgeQ(a) * 0.99 + 0.012)); }
  pts.forEach((p, i) => {
    const x = Math.round(p.x), y = Math.round(p.y);
    if (y > 770 && Math.abs(x - HC.x) < 60) return;
    R(g, x, y + 1, 1, 1, '#475569'); R(g, x, y, 1, 1, '#E5E7EB');
    if (i % 30 === 0) vl(g, x, y + 2, 4, '#94A3B8');
  });
  // (the train, top right)
  const k = 70;
  for (let c = 0; c < 4; c++) { const p = pts[k + c * 5]; R(g, Math.round(p.x) - 2, Math.round(p.y) - 3, 5, 3, c === 0 ? '#EF4444' : '#F5F5F4'); px(g, Math.round(p.x), Math.round(p.y) - 2, '#38BDF8'); }
};

/** Every land's trees, scattered wherever there's nothing: its own kind of tree. */
const TREES: Record<string, TreeKind[]> = {
  space: ['round', 'round'], frontier: ['pine', 'pine', 'round'], spooky: ['dead', 'cypress', 'dead'], cartoon: ['candy', 'round'],
  hollywood: ['palm', 'palm'], fantasy: ['round', 'cypress', 'mushroom'], adventure: ['palm', 'round', 'palm'], foreign: ['cypress', 'round'],
};
const scatterTrees = (g: Ctx) => {
  const spots = ATTRACTIONS.map(attractionAt);
  const pts: { x: number; y: number; k: TreeKind }[] = [];
  for (let n = 0; n < 2600; n++) {
    const x = Math.round(hash(n, 1, 9) * MAP_W), y = Math.round(hash(n, 2, 9) * 820);
    const { q, ang } = polar(x, y);
    if (q < 0.28 || q > edgeQ(ang) - 0.03) continue;
    const s = sectorAt(ang);
    if (s.land === null) continue;
    if (spots.some(p => Math.abs(p.x - x) < 30 && y > p.y - 46 && y < p.y + 14)) continue;
    if (WALKS.some(w => x > w.minX - 4 && x < w.maxX + 4 && y > w.minY - 4 && y < w.maxY + 4 && near(w, x, y) < w.w + 4)) continue;
    if (POOLS.some(p => Math.hypot((x - p.cx) / (p.rx + 6), (y - p.cy) / (p.ry + 6)) < 1)) continue;
    if (RIVERS.some(r => r.segs.some(w => near(w, x, y) < w.w + 5))) continue;
    if (pts.some(p => Math.abs(p.x - x) < 7 && Math.abs(p.y - y) < 6)) continue;
    const kinds = TREES[LANDS[s.land].id];
    pts.push({ x, y, k: kinds[n % kinds.length] });
  }
  pts.sort((a, b) => a.y - b.y).forEach(p => tree(g, p.x, p.y, p.k));
};
const near = (w: { a: { x: number; y: number }; b: { x: number; y: number } }, x: number, y: number) => {
  const vx = w.b.x - w.a.x, vy = w.b.y - w.a.y, l2 = vx * vx + vy * vy || 1;
  const t = Math.max(0, Math.min(1, ((x - w.a.x) * vx + (y - w.a.y) * vy) / l2));
  return Math.hypot(x - (w.a.x + vx * t), y - (w.a.y + vy * t));
};

// ---- the brochure's own bits
const BROCHURE_INK = '#3B2A14';
/** The title cartouche, top left: HAPPY LAND in big ramped letters on a ribbon. */
const title = (g: Ctx) => {
  const x = 22, y = 18, w = 232, h = 76;
  R(g, x + 3, y + 3, w, h, 'rgba(59,42,20,0.35)');
  R(g, x, y, w, h, '#FFF7E0'); dith(g, x, y + h - 10, w, 10, '#F3E2B8');
  for (const [i, c] of [[0, '#EC4899'], [1, '#FDE047'], [2, '#22D3EE']] as [number, string][]) hl(g, x, y + 2 + i * 2, w, c);
  hl(g, x - 1, y - 1, w + 2, BROCHURE_INK); hl(g, x - 1, y + h, w + 2, BROCHURE_INK); vl(g, x - 1, y, h, BROCHURE_INK); vl(g, x + w, y, h, BROCHURE_INK);
  signText(g, 'HAPPY LAND', x + w / 2, y + 40, { sx: 3, sy: 4, bold: true, fill: rampDown('#EC4899', 0.4), dither: true, ink: '#5A0F33', shadow: '#3B2A14', drop: 2 });
  R(g, x + 30, y + 48, w - 60, 12, '#DC2626'); hl(g, x + 30, y + 48, w - 60, '#F87171'); hl(g, x + 30, y + 59, w - 60, '#7F1D1D');
  signText(g, 'OFFICIAL PARK GUIDE', x + w / 2, y + 57, { sx: 1, sy: 1, fill: '#FFFFFF', shadow: '#7F1D1D' });
  signText(g, 'THE HAPPIEST LAND IN THE LAND', x + w / 2, y + 71, { sx: 1, sy: 1, fill: '#7C2D12' });
};
/** The compass: a star, N on top (and a small print correction). */
const compass = (g: Ctx) => {
  const x = 848, y = 54;
  ell(g, x, y, 22, 22, ramp('#FFF7E0'));
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 - Math.PI / 2;
    for (let t = 0; t < 18; t++) { const w = Math.round((1 - t / 18) * 4); const cx = x + Math.cos(a) * t, cy = y + Math.sin(a) * t; R(g, cx - w / 2, cy - w / 2, w + 1, w + 1, k === 0 ? '#DC2626' : '#3B2A14'); }
  }
  ell(g, x, y, 3, 3, ramp('#FACC15'));
  signText(g, 'N', x, y - 26, { sx: 2, sy: 2, bold: true, fill: '#DC2626', shadow: '#3B2A14' });
};
/** The legend, bottom right: what the little icons mean. */
export const LEGEND = { x: 692, y: 814, w: 196, h: 136 };
const legend = (g: Ctx) => {
  const { x, y, w, h } = LEGEND;
  R(g, x + 3, y + 3, w, h, 'rgba(59,42,20,0.35)');
  R(g, x, y, w, h, '#FFF7E0'); dith(g, x, y + h - 8, w, 8, '#F3E2B8');
  hl(g, x - 1, y - 1, w + 2, BROCHURE_INK); hl(g, x - 1, y + h, w + 2, BROCHURE_INK); vl(g, x - 1, y, h, BROCHURE_INK); vl(g, x + w, y, h, BROCHURE_INK);
  R(g, x, y, w, 14, '#1E3A8A');
  signText(g, 'LEGEND', x + w / 2, y + 11, { sx: 1, sy: 1, bold: true, fill: '#FFFFFF' });
  const rows: [string, (gx: number, gy: number) => void][] = [
    ['RESTROOMS', (a, b) => ICONS.restroom(g, a, b)],
    ['FIRST AID', (a, b) => ICONS.aid(g, a, b)],
    ['FOOD + DRINK', (a, b) => ICONS.food(g, a, b)],
    ['GIFT SHOP', (a, b) => ICONS.shop(g, a, b)],
    ['ATTRACTION', (a, b) => numberBadge(g, a, b, 7)],
    ['MONORAIL', (a, b) => { hl(g, a - 5, b, 11, '#E5E7EB'); hl(g, a - 5, b + 1, 11, '#475569'); }],
    ['YOU ARE HERE', (a, b) => { ell(g, a, b - 1, 3, 3, ramp('#DC2626')); vl(g, a, b + 2, 3, '#7F1D1D'); }],
  ];
  rows.forEach(([label, icon], i) => { const ry = y + 26 + i * 15; icon(x + 14, ry - 3); signText(g, label, x + 28, ry, { sx: 1, sy: 1, fill: BROCHURE_INK }, 'left'); });
};

/** The little service icons (screen-size, drawn with the labels: render.ts). */
export const ICONS: Record<'restroom' | 'aid' | 'food' | 'shop', (g: Ctx, x: number, y: number) => void> = {
  restroom: (g, x, y) => { R(g, x - 5, y - 5, 11, 11, '#1D4ED8'); hl(g, x - 5, y - 5, 11, '#60A5FA'); R(g, x - 3, y - 3, 2, 2, '#FFFFFF'); R(g, x - 4, y - 1, 4, 4, '#FFFFFF'); R(g, x + 2, y - 3, 2, 2, '#FFFFFF'); R(g, x + 1, y - 1, 4, 3, '#FFFFFF'); px(g, x + 1, y + 2, '#FFFFFF'); px(g, x + 4, y + 2, '#FFFFFF'); },
  aid: (g, x, y) => { R(g, x - 5, y - 5, 11, 11, '#FFFFFF'); R(g, x - 1, y - 4, 3, 9, '#DC2626'); R(g, x - 4, y - 1, 9, 3, '#DC2626'); hl(g, x - 5, y - 5, 11, '#A3A3A3'); hl(g, x - 5, y + 5, 11, '#A3A3A3'); },
  food: (g, x, y) => { R(g, x - 5, y - 5, 11, 11, '#EA580C'); hl(g, x - 5, y - 5, 11, '#FDBA74'); R(g, x - 3, y - 2, 7, 2, '#FDE68A'); R(g, x - 3, y, 7, 1, '#7C2D12'); R(g, x - 3, y + 1, 7, 2, '#FDE68A'); },
  shop: (g, x, y) => { R(g, x - 5, y - 5, 11, 11, '#7C3AED'); hl(g, x - 5, y - 5, 11, '#C4B5FD'); R(g, x - 3, y - 1, 7, 5, '#FFFFFF'); hl(g, x - 2, y - 3, 5, '#FFFFFF'); px(g, x - 2, y - 2, '#FFFFFF'); px(g, x + 2, y - 2, '#FFFFFF'); },
};
/** An attraction's number on the brochure: a white disc, red rim, the number. */
export const numberBadge = (g: Ctx, x: number, y: number, n: number) => {
  ell(g, x, y, 6, 6, ramp('#DC2626'));
  ell(g, x, y, 4, 4, '#FFFFFF', false);
  signText(g, String(n), x + (n >= 10 ? 0 : 1), y + 4, { sx: 1, sy: 1, fill: '#7F1D1D', gap: 0 });
};

/** The base art (the ground's painted under it): everything that's the map at any zoom. */
export const paintFeatures = (g: Ctx) => { for (const t of featureTasks(g)) t(); };
/** paintFeatures in its pieces, in order (so it can be painted a piece per idle moment during play). */
export const featureTasks = (g: Ctx): (() => void)[] => [
  () => monorail(g), () => scatterTrees(g), () => hubPlaza(g), () => americaStreet(g), () => wayIn(g), () => waterPark(g), () => castLot(g),
  // (the landmarks, back to front)
  ...[...ATTRACTIONS].map(a => ({ a, p: attractionAt(a) })).sort((m, n) => m.p.y - n.p.y).map(({ a, p }) => () => LANDMARKS[a.art]?.(g, p.x, p.y)),
  () => { title(g); compass(g); legend(g); },
];

/** The details: guests on the walks, benches and lamps (only up close). */
export const paintDetails = (g: Ctx) => {
  WALKS.forEach((w, i) => {
    if (i % 2) return;
    const t = hash(i, 4), x = Math.round(w.a.x + (w.b.x - w.a.x) * t), y = Math.round(w.a.y + (w.b.y - w.a.y) * t);
    guests(g, x, y, 2 + (i % 3), i);
    // (a lamp post beside it)
    vl(g, x + 6, y - 6, 6, '#1C1917'); px(g, x + 6, y - 7, '#FDE047');
  });
  // (the hub's crowd)
  for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2, p = fromPolar(a, Q_HUB * 0.7); guests(g, Math.round(p.x), Math.round(p.y), 2, k); }
  // (America USA's: shoulder to shoulder)
  for (let y = GATE_Y + 56; y < 780; y += 12) guests(g, HC.x, y, 3, y);
  // (the line at the ticket booths, out round the plaza)
  for (let k = 0; k < 18; k++) guests(g, HC.x - 34 + (k % 6) * 12, GATE_Y + 40 + Math.floor(k / 6) * 5 + (k % 2), 1, k);
  void line; void spire;
};

void RX; void RY; void tone;
