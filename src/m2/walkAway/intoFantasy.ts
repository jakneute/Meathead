// The walk into Fairy Land (portalWalk.ts): a first pass (crude; the town square's owner can bring the village's own
// painting into it later, the way intoSpooky.ts does the town's). Out of the portal and up a cobbled lane between
// crooked storybook cottages (timber frames, snow heaped on their roofs, a lit window), wrought-iron lamp posts, snowy
// pines; far off at the end of it, on its crag, THE GREAT PIXIE'S CASTLE (fantasy/monument.ts: the land's monument, the
// smallest it ever is), Piper's window glowing at its top. The sky by the hour.

import { type Ctx, type Prop, type PortalDef, HOR, box, hash } from './kit';
import { timeOfDay, hourMix } from '../timeOfDay';
import { drawCastleAt } from '../fantasy/monument';

const ground = (g: Ctx, w: number, h: number) => {
  // (snowy verges, the lane's cobbles down the middle, their joints)
  box(g, 0, 0, w, h, '#DCE4F2');
  for (let y = 0; y < h; y += 12) for (let x = 0; x < w; x += 12) if (hash(x * 0.9 + y * 1.7) > 0.75) box(g, x + 3, y + 3, 4, 2, '#C4CCE4');
  box(g, w / 2 - 44, 0, 88, h, '#8A8098');
  for (let y = 0; y < h; y += 8) for (let x = w / 2 - 44 + ((y / 8) % 2) * 6; x < w / 2 + 40; x += 12) { box(g, x, y, 10, 6, '#A49AB2'); box(g, x, y, 10, 1, '#BCB2CA'); }
};

const back = (c: Ctx, t: number, sway: number) => {
  // (the far snowy hills)
  c.fillStyle = hourMix('#7C86B4', '#7A6A9A', '#2A2E48');
  c.beginPath(); c.moveTo(0, HOR); for (let i = 0; i <= 20; i++) c.lineTo(i * 20 + sway * 0.2, HOR - 12 - Math.sin(i * 0.8) * 8); c.lineTo(400, HOR); c.fill();
  // (the castle on its crag at the lane's end)
  drawCastleAt(c, Math.round(200 + sway * 0.45), HOR + 2, 0.17, t);
};

const cottage = (wall: string, roof: string) => (g: Ctx, w: number, h: number) => {
  // (crooked: the roof leans; a timber frame on plaster; a lit window; snow on the roof)
  const rh = h * 0.42;
  box(g, 2, rh, w - 4, h - rh, wall);
  box(g, 2, rh, 3, h - rh, '#4A3420'); box(g, w - 5, rh, 3, h - rh, '#4A3420'); box(g, 2, rh + (h - rh) / 2, w - 4, 2, '#4A3420');
  g.fillStyle = roof; g.beginPath(); g.moveTo(0, rh + 2); g.lineTo(w * 0.42, 0); g.lineTo(w, rh + 4); g.closePath(); g.fill();
  g.fillStyle = '#F4F8FF'; g.beginPath(); g.moveTo(0, rh + 2); g.lineTo(w * 0.42, 0); g.lineTo(w, rh + 4); g.lineTo(w, rh - 1); g.lineTo(w * 0.42, -3); g.lineTo(0, rh - 2); g.closePath(); g.fill();
  const lit = timeOfDay().lamps > 0.3;
  box(g, w * 0.3, rh + 8, w * 0.22, h * 0.18, lit ? '#FFD87A' : '#3A3060'); box(g, w * 0.3 + w * 0.1, rh + 8, 1, h * 0.18, '#4A3420');
  box(g, w * 0.62, h - h * 0.3, w * 0.18, h * 0.3, '#6A3A1E');
};
const lamp = (g: Ctx, w: number, h: number) => {
  box(g, w / 2 - 1, 6, 2, h - 6, '#2E2A3A');
  box(g, w / 2 - 4, 0, 8, 8, '#2E2A3A'); box(g, w / 2 - 3, 1, 6, 6, timeOfDay().lamps > 0.3 ? '#FFE9A8' : '#C8C0D8');
  box(g, w / 2 - 4, h - 3, 8, 3, '#2E2A3A');
};
const pine = (g: Ctx, w: number, h: number) => {
  box(g, w / 2 - 2, h - 10, 4, 10, '#4A3420');
  for (let k = 0; k < 4; k++) {
    const y = 4 + k * (h - 14) / 4, half = 4 + k * (w / 2 - 4) / 3;
    g.fillStyle = '#24463E'; g.beginPath(); g.moveTo(w / 2, y - 6); g.lineTo(w / 2 + half, y + (h - 14) / 4); g.lineTo(w / 2 - half, y + (h - 14) / 4); g.fill();
    box(g, w / 2 - half * 0.6, y + (h - 14) / 4 - 2, half * 1.2, 2, '#EEF2FA');
  }
};

const props = (): Prop[] => {
  const out: Prop[] = [];
  const walls = ['#E8D8B8', '#D8C8E8', '#F0D0C0', '#D0E0D0'], roofs = ['#4A78D4', '#8A3A5A', '#5A6A8A', '#6A4A8A'];
  for (let i = 0; i < 10; i++) { const side = i % 2 ? 1 : -1; out.push({ id: `pw-fa-cot${i % 4}`, x: side * (5.2 + (i % 3) * 0.6), z: 4 + i * 3.2, w: 3.4, h: 3.6, ppm: 16, paint: cottage(walls[i % 4], roofs[(i + 1) % 4]) }); }
  for (let k = 0; k < 8; k++) out.push({ id: 'pw-fa-lamp', x: (k % 2 ? 1 : -1) * 2.4, z: 3 + k * 4, w: 0.6, h: 2.6, ppm: 24, paint: lamp });
  for (let k = 0; k < 8; k++) out.push({ id: 'pw-fa-pine', x: (k % 2 ? -1 : 1) * (8 + (k % 3)), z: 6 + k * 4.5, w: 2.6, h: 6, ppm: 16, paint: pine });
  return out;
};

export const INTO_FANTASY: PortalDef = {
  land: 'FAIRY LAND',
  lines: ['WIZARDS, CASTLES, A $14 BUTTER DRINK.', 'ONCE UPON A TIME, FOR A LIMITED TIME.'],
  haze: '#E8D4F0',
  ground, back, props,
  rim: () => hourMix('#FFE4F2', '#F9A8D4', '#C4B5FD'),
};
