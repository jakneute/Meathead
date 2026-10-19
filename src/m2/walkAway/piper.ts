// The walk-away from PIPER THE PIXIE (Fairy Land's boss): down the cobbled lane out of the village toward the camera at
// whatever hour it is now (timeOfDay.ts): snowy verges, lamp posts; THE GREAT PIXIE'S CASTLE behind him on its crag
// (fantasy/monument.ts), Piper's window at the top of it smashed in (no pink glow: dark, a hole). How she went shows:
// the cork (her usual death) a hole punched up through the castle's roof over her chambers, steam still blowing out of
// it, a glint of fairy dust; the deflated balloon (her weakness, the flintlock) a long greasy streak of her (fat and
// gore) down the castle from her window, and the lane strewn with drips of it. Rose petals blow down the lane either
// way. His new toy: the SPELLBOOK (its walk-away act: walkAway/acts.ts).

import { type Ctx, type Prop, type SceneDef, HOR, box, hash } from './kit';
import { timeOfDay } from '../timeOfDay';
import { bookShut } from './toys';
import { drawCastleAt, PIPER_WINDOW } from '../fantasy/monument';

const ground = (g: Ctx, w: number, h: number) => {
  box(g, 0, 0, w, h, '#DCE4F2');
  box(g, w / 2 - 40, 0, 80, h, '#8A8098');
  for (let y = 0; y < h; y += 8) for (let x = w / 2 - 40 + ((y / 8) % 2) * 6; x < w / 2 + 36; x += 12) { box(g, x, y, 10, 6, '#A49AB2'); box(g, x, y, 10, 1, '#BCB2CA'); }
};

const back = (c: Ctx, t: number, sway: number, weakness: boolean) => {
  const tod = timeOfDay();
  // (the snowy hills, the castle on its crag behind him, her window smashed: dark, the frame broken)
  c.fillStyle = tod.lamps > 0.5 ? '#2A2E48' : '#7C86B4';
  c.beginPath(); c.moveTo(0, HOR); for (let i = 0; i <= 20; i++) c.lineTo(i * 20, HOR - 10 - Math.sin(i * 0.7) * 8); c.lineTo(400, HOR); c.fill();
  const x = Math.round(300 + sway * 0.4), k = 0.24;
  drawCastleAt(c, x, HOR + 4, k, t);
  const wx = x + PIPER_WINDOW.x * k, wy = HOR + 4 + PIPER_WINDOW.y * k;
  box(c, wx - 2, wy - 3, 4, 6, '#120A1E'); box(c, wx - 2, wy - 3, 1, 2, '#FFD0E8');
  if (weakness) {
    // (her, down the castle wall from her window: a greasy streak, red and yellow, in drips)
    for (let y = wy + 3; y < HOR - 4; y += 1) { const w = 1 + Math.round(hash(y * 0.7) * 1.4); box(c, wx - 1 + Math.round(Math.sin(y * 0.3)), y, w, 1, y % 3 ? '#7F1D1D' : '#C8A848'); }
  } else {
    // (the hole up through the roof over her chambers, steam blowing off it, a glint of fairy dust)
    box(c, wx - 3, wy - 10, 6, 4, '#120A1E'); box(c, wx - 4, wy - 11, 8, 1, '#5A4A6A');
    for (let i = 0; i < 4; i++) { const u = ((t * 0.4 + i * 9) % 36) / 36; c.globalAlpha = 0.5 * (1 - u); box(c, wx - 2 + u * 12, wy - 14 - u * 16, 3 + u * 4, 2 + u * 2, '#F4F4F8'); c.globalAlpha = 1; }
    if (t % 30 < 6) box(c, wx + 3, wy - 20 - (t % 30), 1, 1, '#FDE68A');
  }
};

const lamp = (g: Ctx, w: number, h: number) => {
  box(g, w / 2 - 1, 6, 2, h - 6, '#2E2A3A');
  box(g, w / 2 - 4, 0, 8, 8, '#2E2A3A'); box(g, w / 2 - 3, 1, 6, 6, timeOfDay().lamps > 0.3 ? '#FFE9A8' : '#C8C0D8');
};
const petal = (g: Ctx, w: number, h: number) => { box(g, 1, h - 3, w - 2, 2, '#F43F6E'); box(g, 2, h - 3, 2, 1, '#FF8AAE'); };
const gravy = (g: Ctx, w: number, h: number) => { box(g, 0, h - 3, w, 3, '#7F1D1D'); box(g, 2, h - 3, w - 5, 1, '#E8D490'); };

const props = (weakness: boolean): Prop[] => {
  const out: Prop[] = [];
  for (let k = 0; k < 10; k++) out.push({ id: 'wa-pp-lamp', x: (k % 2 ? 1 : -1) * 2.6, z: 3 + k * 4, w: 0.6, h: 2.6, ppm: 24, paint: lamp });
  for (let k = 0; k < 14; k++) out.push({ id: 'wa-pp-petal', x: (hash(k * 2.1) - 0.5) * 3.4, z: 2 + k * 3, w: 0.2, h: 0.1, ppm: 40, paint: petal, wrap: true });
  if (weakness) for (let k = 0; k < 8; k++) out.push({ id: 'wa-pp-gravy', x: (hash(k * 5.3) - 0.5) * 1.6, z: 4 + k * 5, w: 0.5, h: 0.12, ppm: 32, paint: gravy, wrap: true });
  return out;
};

export const PIPER: SceneDef = {
  land: 'FAIRY LAND',
  weapon: 'SPELLBOOK',
  sky: ['#23307A', '#3A55B4', '#6E8EDC', '#A8C4F0', '#E8D4F0', '#F8C8D8', '#FFE4F2'],
  haze: '#E8D4F0',
  ground, back, props,
  drawWeapon: (c: Ctx, t: number) => { c.translate(-12, 0); bookShut(c, t); },
  grip: [[-4, 2], [16, 2]],
  rim: '#F9A8D4',
};
