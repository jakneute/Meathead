// The walk into Wilderness Land (portalWalk.ts): a PLACEHOLDER (crude; the wilds' owner can bring the frontier's own
// painting into it later, the way intoSpooky.ts does the town's). Out of the portal and up a dirt trail between
// split-rail fences, pines either side and the park's fiberglass boulders (a bolt showing here and there), a wagon
// wheel leant on a post, the trail's wooden mileposts; far off at the end of it, the land's log gate under the park's
// painted mountain flats (snowcapped, the plywood's raw edge and its bracing showing). The sky by the hour.

import { type Ctx, type Prop, type PortalDef, HOR, box, hash } from './kit';
import { timeOfDay, hourMix } from '../timeOfDay';

const ground = (g: Ctx, w: number, h: number) => {
  box(g, 0, 0, w, h, '#5A7A32');
  for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) if (hash(x * 0.7 + y * 1.3) > 0.7) box(g, x + 4, y + 4, 3, 5, '#6E8E3E');
  // (the trail: packed dirt, wheel ruts)
  box(g, w / 2 - 48, 0, 96, h, '#9A7A4A');
  for (let y = 0; y < h; y += 8) { box(g, w / 2 - 30, y, 5, 6, '#7C5E36'); box(g, w / 2 + 25, y + 3, 5, 6, '#7C5E36'); }
  for (let y = 0; y < h; y += 20) if (hash(y * 3.1) > 0.4) box(g, w / 2 - 40 + hash(y) * 80, y, 3, 2, '#B8986A');
};

const back = (c: Ctx, _t: number, sway: number) => {
  const tod = timeOfDay();
  const sx = Math.round(sway * 0.3);
  // (the painted mountain flats: snowcaps painted on, the raw plywood edge at the right end, its 2x4 brace)
  c.fillStyle = hourMix('#7C8CA8', '#6A6A8A', '#232838');
  c.beginPath(); c.moveTo(40 + sx, HOR); c.lineTo(110 + sx, HOR - 50); c.lineTo(150 + sx, HOR - 34); c.lineTo(210 + sx, HOR - 66); c.lineTo(290 + sx, HOR - 30); c.lineTo(340 + sx, HOR); c.fill();
  c.fillStyle = hourMix('#F1F5F9', '#E9D5C0', '#94A3B8'); c.beginPath(); c.moveTo(196 + sx, HOR - 56); c.lineTo(210 + sx, HOR - 66); c.lineTo(226 + sx, HOR - 56); c.fill();
  box(c, 338 + sx, HOR - 34, 2, 34, '#C8A070');
  c.strokeStyle = '#8A6A40'; c.lineWidth = 1; c.beginPath(); c.moveTo(340 + sx, HOR - 30); c.lineTo(356 + sx, HOR); c.stroke();
  // (the log gate at the end of the trail: two posts, the crossbar, the burned name board)
  const gx = 200 + Math.round(sway * 0.45);
  box(c, gx - 22, HOR - 26, 4, 26, '#6B4423'); box(c, gx + 18, HOR - 26, 4, 26, '#6B4423');
  box(c, gx - 26, HOR - 28, 52, 4, '#8A5A30'); box(c, gx - 18, HOR - 24, 36, 7, tod.lamps > 0.5 ? '#5A3A1E' : '#A0703C');
  for (let i = 0; i < 9; i++) box(c, gx - 15 + i * 3.4, HOR - 22, 2, 3, '#2A1608');
};

const pine = (g: Ctx, w: number, h: number) => {
  box(g, w / 2 - 2, h - 10, 4, 10, '#5A3A1E');
  g.fillStyle = '#24502E';
  for (let k = 0; k < 4; k++) { const y = 4 + k * (h - 14) / 4, half = 4 + k * (w / 2 - 4) / 3; g.beginPath(); g.moveTo(w / 2, y - 6); g.lineTo(w / 2 + half, y + (h - 14) / 4); g.lineTo(w / 2 - half, y + (h - 14) / 4); g.fill(); }
  box(g, w / 2 - 1, 0, 2, 3, '#3A6A40');
};
const fence = (g: Ctx, w: number, h: number) => {
  box(g, 1, 0, 3, h, '#6B4423'); box(g, w - 4, 0, 3, h, '#6B4423');
  box(g, 0, 3, w, 3, '#8A5A30'); box(g, 0, h / 2, w, 3, '#8A5A30');
};
const boulder = (g: Ctx, w: number, h: number) => {
  g.fillStyle = '#8A8478'; g.beginPath(); g.ellipse(w / 2, h * 0.6, w / 2, h * 0.45, 0, Math.PI, 0); g.lineTo(w, h); g.lineTo(0, h); g.fill();
  box(g, 3, h * 0.4, w * 0.3, 2, '#A8A296');
  box(g, w * 0.6, h * 0.55, 2, 2, '#52525B');
};

const props = (): Prop[] => {
  const out: Prop[] = [];
  for (let i = 0; i < 12; i++) { const side = i % 2 ? 1 : -1; out.push({ id: 'pw-fr-pine', x: side * (6 + (i % 3)), z: 3 + i * 2.6, w: 2.6, h: 6, ppm: 16, paint: pine }); }
  for (let k = 0; k < 10; k++) out.push({ id: 'pw-fr-fence', x: (k % 2 ? 1 : -1) * 3.6, z: 2 + Math.floor(k / 2) * 3, w: 2.4, h: 1.1, ppm: 16, paint: fence });
  for (let k = 0; k < 4; k++) out.push({ id: 'pw-fr-rock', x: (k % 2 ? -1 : 1) * 4.8, z: 6 + k * 5, w: 1.8, h: 1.2, ppm: 16, paint: boulder });
  return out;
};

export const INTO_FRONTIER: PortalDef = {
  land: 'WILDERNESS LAND',
  lines: ['OLD AMERICA. LOG FLUMES. DYSENTERY (SIMULATED).', 'THE FRONTIER, AS GOD AND THE PARK INTENDED.'],
  haze: '#F2E6C4',
  ground, back, props,
  rim: () => hourMix('#FEF3C7', '#F59E0B', '#FDE68A'),
};
