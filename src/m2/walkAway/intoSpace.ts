// The walk into Space Land (portalWalk.ts): a PLACEHOLDER (crude; the square's owner can bring the square's own
// painting into it later, the way intoSpooky.ts does the town's). Out of the portal and up a tacky retro-futurist
// street: pale concrete with a pink-and-teal stripe up the middle, googie pylons (boomerang tops, starbursts) either
// side, a monorail beam running alongside, and far off at the end of it, over everything, the giant atom (a ball and
// its three orbits, turning slow). The sky by whatever hour it is (timeOfDay.ts).

import { type Ctx, type Prop, type PortalDef, HOR, box, hash } from './kit';
import { timeOfDay, hourMix } from '../timeOfDay';

// ---------------------------------------------------------------------------------------------------------------
// The ground: pale concrete slabs, the stripe up the middle

const ground = (g: Ctx, w: number, h: number) => {
  box(g, 0, 0, w, h, '#94A3B8');
  for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) box(g, x, y, 31, 31, hash(x * 0.3 + y * 1.7) > 0.5 ? '#A3B1C4' : '#9AA8BB');
  box(g, w / 2 - 14, 0, 28, h, '#F472B6');
  box(g, w / 2 - 6, 0, 12, h, '#2DD4BF');
};

// ---------------------------------------------------------------------------------------------------------------
// The far off: the giant atom over the end of the street, a low skyline of domes and fins

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay();
  const sx = Math.round(sway * 0.3);
  // (the skyline: domes, a fin, a saucer on a stalk)
  const far = hourMix('#64748B', '#7C3A5A', '#1E1B3A');
  for (let i = 0; i < 9; i++) { const x = sx + i * 48 - 10, h = 10 + Math.round(hash(i * 3.1) * 16); box(c, x, HOR - h, 40, h, far); c.fillStyle = far; c.beginPath(); c.arc(x + 20, HOR - h, 14, Math.PI, 0); c.fill(); }
  // (the giant atom: its stalk, its nucleus, its three orbits turning)
  const ax = 200 + Math.round(sway * 0.4), ay = HOR - 52;
  box(c, ax - 3, ay, 6, HOR - ay, hourMix('#475569', '#4C2A3A', '#1E1B3A'));
  c.lineWidth = 3; c.strokeStyle = tod.lamps > 0.3 ? '#A5B4FC' : '#CBD5E1';
  for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(ax, ay, 46, 14, (k * Math.PI) / 3 + t * 0.003, 0, Math.PI * 2); c.stroke(); }
  c.fillStyle = tod.lamps > 0.3 ? '#F0ABFC' : '#E0E7FF'; c.beginPath(); c.arc(ax, ay, 12, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(ax - 4, ay - 4, 4, 0, Math.PI * 2); c.fill();
};

// ---------------------------------------------------------------------------------------------------------------
// Along the way: googie pylons either side, a monorail beam on its legs

const pylon = (seed: number) => (g: Ctx, w: number, h: number) => {
  box(g, w / 2 - 3, 18, 6, h - 18, '#64748B'); box(g, w / 2 - 3, 18, 2, h - 18, '#CBD5E1');
  // (a boomerang top, or a starburst)
  if (seed % 2) { g.fillStyle = '#F472B6'; g.beginPath(); g.moveTo(0, 18); g.lineTo(w / 2, 4); g.lineTo(w, 18); g.lineTo(w / 2, 12); g.fill(); }
  else { g.strokeStyle = '#FDE047'; g.lineWidth = 2; for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; g.beginPath(); g.moveTo(w / 2, 10); g.lineTo(w / 2 + Math.cos(a) * 9, 10 + Math.sin(a) * 9); g.stroke(); } }
};
const monorail = (g: Ctx, w: number, h: number) => {
  box(g, 0, 0, w, 10, '#E2E8F0'); box(g, 0, 8, w, 3, '#64748B');
  for (let x = 6; x < w; x += 40) box(g, x, 10, 6, h - 10, '#94A3B8');
};

const props = (): Prop[] => {
  const out: Prop[] = [];
  for (let i = 0; i < 10; i++) { const side = i % 2 ? 1 : -1; out.push({ id: `pw-spc-pylon${i % 2}`, x: side * 3.6, z: 2 + i * 2.4, w: 1.4, h: 3.6, ppm: 20, paint: pylon(i % 2) }); }
  for (let k = 0; k < 4; k++) out.push({ id: 'pw-spc-mono', x: -8.5, z: 3 + k * 6, w: 6, h: 4.5, ppm: 16, paint: monorail });
  return out;
};

export const INTO_SPACE: PortalDef = {
  land: 'SPACE LAND',
  lines: ['THE FUTURE, AS IMAGINED IN 1962. STILL LOADING.', 'FIRST STOP: FUTURELAND SQUARE.'],
  haze: '#A5B4FC',
  ground, back, props,
  rim: () => hourMix('#E0E7FF', '#F59E0B', '#A5B4FC'),
};
