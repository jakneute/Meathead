// The walk into Foreign Lands (portalWalk.ts): a PLACEHOLDER (crude; the streets' owner can bring the pavilions' own
// painting into it later, the way intoHollywood.ts does the boulevard's). Out of the portal and down the lagoon
// promenade: pale pavers, the lagoon off to the left with the fireworks barge far out on it, flags of every country
// (and some that aren't) on poles down both sides, the pavilions' fronts along the right (a stepped pyramid, a stave
// church's peaks, a pagoda's eaves, a castle's turret), and far off at the end of it, across the water, the theater's
// blue dome. The sky by whatever hour it is (timeOfDay.ts).

import { type Ctx, type Prop, type PortalDef, HOR, box, hash } from './kit';
import { timeOfDay, hourMix } from '../timeOfDay';

// ---------------------------------------------------------------------------------------------------------------
// The ground: the promenade's pavers, the lagoon down the left

const ground = (g: Ctx, w: number, h: number) => {
  box(g, 0, 0, w, h, '#D6CBB4');
  for (let y = 0; y < h; y += 24) for (let x = 0; x < w; x += 32) box(g, x + ((y / 24) % 2) * 16, y, 31, 23, hash(x * 0.3 + y * 1.7) > 0.5 ? '#DDD2BC' : '#CFC4AC');
  // (the lagoon: off the path's left)
  box(g, 0, 0, w / 2 - 110, h, '#1D4ED8');
  for (let i = 0; i < 80; i++) box(g, hash(i * 3.1) * (w / 2 - 120), hash(i * 7.7) * h, 8, 1, '#60A5FA');
  box(g, w / 2 - 112, 0, 4, h, '#44403C');
};

// ---------------------------------------------------------------------------------------------------------------
// The far off: the theater's dome across the water, the barge

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay(), sx = Math.round(sway * 0.4);
  const far = hourMix('#1E3A8A', '#4C1D95', '#0F172A');
  c.fillStyle = far; c.beginPath(); c.arc(240 + sx, HOR - 6, 34, Math.PI, 0); c.fill();
  box(c, 200 + sx, HOR - 8, 80, 8, hourMix('#E5E7EB', '#C4B5FD', '#334155'));
  // (the barge, and after dark a burst over it now and then)
  box(c, 110 + sx, HOR - 4, 50, 4, '#1F2937');
  if (tod.lamps > 0.3 && t % 120 < 40) { const r = (t % 120) * 0.6, k = (t / 120) | 0; for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; box(c, 135 + sx + Math.cos(a) * r, HOR - 60 + Math.sin(a) * r, 2, 2, ['#F87171', '#FDE047', '#60A5FA'][k % 3]); } }
};

// ---------------------------------------------------------------------------------------------------------------
// Along the way: flags on poles, the pavilions' fronts

const FLAGS = [['#16A34A', '#F8FAFC', '#DC2626'], ['#DC2626', '#F8FAFC', '#1E40AF'], ['#DC2626', '#FCD34D', '#DC2626'], ['#1C1917', '#DC2626', '#FCD34D'], ['#16A34A', '#F8FAFC', '#DC2626']];
const flag = (k: number) => (g: Ctx, w: number, h: number) => {
  box(g, w / 2 - 1, 0, 2, h, '#A8A29E');
  FLAGS[k % FLAGS.length].forEach((col, i) => box(g, w / 2 + 1, 2 + i * 4, 14, 4, col));
};
const front = (k: number) => (g: Ctx, w: number, h: number) => {
  const cols = ['#B8A27A', '#7C2D12', '#DC2626', '#E7E5E4', '#F59E0B'];
  box(g, 0, h * 0.4, w, h * 0.6, cols[k % 5]);
  if (k % 5 === 0) for (let i = 0; i < 4; i++) box(g, i * w * 0.1, h * (0.4 - i * 0.1), w * (1 - i * 0.2), h * 0.1, '#A8926A');
  else if (k % 5 === 1) { for (const x of [0.2, 0.5, 0.8]) { g.fillStyle = '#451A03'; g.beginPath(); g.moveTo(w * x - w * 0.12, h * 0.4); g.lineTo(w * x, h * 0.05); g.lineTo(w * x + w * 0.12, h * 0.4); g.fill(); } }
  else if (k % 5 === 2) for (let i = 0; i < 3; i++) box(g, -w * 0.05 + i * w * 0.1, h * (0.38 - i * 0.12), w * (1.1 - i * 0.2), h * 0.04, '#14532D');
  else if (k % 5 === 3) { box(g, w * 0.7, 0, w * 0.2, h * 0.4, '#E7E5E4'); g.fillStyle = '#1E40AF'; g.beginPath(); g.moveTo(w * 0.68, h * 0.1); g.lineTo(w * 0.8, -h * 0.1); g.lineTo(w * 0.92, h * 0.1); g.fill(); }
  box(g, w / 2 - 6, h - 16, 12, 16, '#1C1917');
};

const props = (): Prop[] => {
  const out: Prop[] = [];
  for (let i = 0; i < 12; i++) out.push({ id: `pw-fl-flag${i % 5}`, x: (i % 2 ? 1 : -1) * 2.6, z: 2 + i * 2.2, w: 1.2, h: 4, ppm: 16, paint: flag(i) });
  for (let k = 0; k < 6; k++) out.push({ id: `pw-fl-front${k % 5}`, x: 8.5, z: 3 + k * 4.5, w: 6, h: 5, ppm: 16, paint: front(k) });
  return out;
};

export const INTO_FOREIGN: PortalDef = {
  land: 'FOREIGN LANDS',
  lines: ['THE WHOLE WORLD, FIXED. NO PASSPORT NEEDED.', 'NO PASSPORT ALLOWED.'],
  haze: '#BFDBFE',
  ground, back, props,
  rim: () => hourMix('#E0F2FE', '#F59E0B', '#BFDBFE'),
};
