// The walk-away from PIPER THE PIXIE (Fairy Land's boss): a PLACEHOLDER (the skeleton's: replace it with the boss job,
// the way walkAway/donnie.ts is done). Down the cobbled lane out of the village toward the camera at whatever hour it
// is now (timeOfDay.ts): snowy verges, lamp posts, the storybook cottages; THE GREAT PIXIE'S CASTLE behind him on its
// crag (fantasy/monument.ts), Piper's window at the top of it smashed in (no pink glow: dark, a hole). His new toy:
// the SPELLBOOK (its walk-away act: walkAway/acts.ts).

import { type Ctx, type Prop, type SceneDef, HOR, box } from './kit';
import { timeOfDay } from '../timeOfDay';
import { bookShut } from './toys';
import { drawCastleAt, PIPER_WINDOW } from '../fantasy/monument';

const ground = (g: Ctx, w: number, h: number) => {
  box(g, 0, 0, w, h, '#DCE4F2');
  box(g, w / 2 - 40, 0, 80, h, '#8A8098');
  for (let y = 0; y < h; y += 8) for (let x = w / 2 - 40 + ((y / 8) % 2) * 6; x < w / 2 + 36; x += 12) { box(g, x, y, 10, 6, '#A49AB2'); box(g, x, y, 10, 1, '#BCB2CA'); }
};

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay();
  // (the snowy hills, the castle on its crag behind him, her window smashed: dark, the frame broken)
  c.fillStyle = tod.lamps > 0.5 ? '#2A2E48' : '#7C86B4';
  c.beginPath(); c.moveTo(0, HOR); for (let i = 0; i <= 20; i++) c.lineTo(i * 20, HOR - 10 - Math.sin(i * 0.7) * 8); c.lineTo(400, HOR); c.fill();
  const x = Math.round(300 + sway * 0.4), k = 0.24;
  drawCastleAt(c, x, HOR + 4, k, t);
  const wx = x + PIPER_WINDOW.x * k, wy = HOR + 4 + PIPER_WINDOW.y * k;
  box(c, wx - 2, wy - 3, 4, 6, '#120A1E'); box(c, wx - 2, wy - 3, 1, 2, '#FFD0E8');
};

const lamp = (g: Ctx, w: number, h: number) => {
  box(g, w / 2 - 1, 6, 2, h - 6, '#2E2A3A');
  box(g, w / 2 - 4, 0, 8, 8, '#2E2A3A'); box(g, w / 2 - 3, 1, 6, 6, timeOfDay().lamps > 0.3 ? '#FFE9A8' : '#C8C0D8');
};

const props = (): Prop[] => {
  const out: Prop[] = [];
  for (let k = 0; k < 10; k++) out.push({ id: 'wa-pp-lamp', x: (k % 2 ? 1 : -1) * 2.6, z: 3 + k * 4, w: 0.6, h: 2.6, ppm: 24, paint: lamp });
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
