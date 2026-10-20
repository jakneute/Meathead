// The walk-away from STUPID DAD (Cartoon Land's boss): a PLACEHOLDER (the skeleton's: replace it with the boss job, the
// way walkAway/donnie.ts is done). Down the candy path out of the amphitheater toward the camera at whatever hour it is
// now (timeOfDay.ts): pink cobbles, puff-ball trees and curly lamp posts either side; far behind him, the amphitheater's
// shell and THE CARTOON LAND WATER TOWER on the hill (cartoon/monument.ts). His new toy: the MALLET (its walk-away act:
// walkAway/acts.ts's MALLET).

import { type Ctx, type Prop, type SceneDef, HOR, box, hash } from './kit';
import { timeOfDay, hourMix } from '../timeOfDay';
import { mallet } from './toys';
import { drawTowerAt } from '../cartoon/monument';

const ground = (g: Ctx, w: number, h: number) => {
  box(g, 0, 0, w, h, '#4ADE80');
  for (let i = 0; i < 40; i++) { const x = hash(i * 3.3) * w, y = hash(i * 5.9) * h; box(g, x, y, 2, 2, ['#F472B6', '#FDE047', '#FFFFFF'][i % 3]); }
  box(g, w / 2 - 44, 0, 88, h, '#F9A8D4');
  for (let y = 0; y < h; y += 8) for (let x = w / 2 - 44 + ((y / 8) % 2) * 6; x < w / 2 + 40; x += 12) { box(g, x, y, 10, 6, '#F472B6'); box(g, x, y, 10, 1, '#FBCFE8'); }
};

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay();
  // (the rolling hills, the amphitheater's shell, the water tower on the hill)
  c.fillStyle = hourMix('#86C17A', '#7A8A6A', '#1E2E2A', tod);
  c.beginPath(); c.moveTo(0, HOR); for (let i = 0; i <= 20; i++) c.lineTo(i * 20, HOR - 8 - Math.sin(i * 0.6 + 1) * 7); c.lineTo(400, HOR); c.fill();
  const x = Math.round(140 + sway * 0.4);
  c.fillStyle = hourMix('#F5F5F4', '#E7C9B0', '#3A3A48', tod); c.beginPath(); c.arc(x, HOR, 22, Math.PI, 0); c.fill();
  c.fillStyle = hourMix('#B45309', '#8A3A10', '#2A1408', tod); c.beginPath(); c.arc(x, HOR, 16, Math.PI, 0); c.fill();
  drawTowerAt(c, Math.round(290 + sway * 0.45), HOR + 2, 0.17, t);
};

const tree = (g: Ctx, w: number, h: number) => {
  box(g, w / 2 - 1, h * 0.4, 3, h * 0.6, '#FFF7E8');
  for (let y = h * 0.42; y < h; y += 6) box(g, w / 2 - 1, y, 3, 3, '#F472B6');
  g.fillStyle = '#1A1028'; g.beginPath(); g.arc(w / 2, h * 0.3, w * 0.42 + 1, 0, Math.PI * 2); g.fill();
  g.fillStyle = ['#F472B6', '#FDE047', '#A78BFA'][Math.floor(w) % 3]; g.beginPath(); g.arc(w / 2, h * 0.3, w * 0.42, 0, Math.PI * 2); g.fill();
};
const lamp = (g: Ctx, w: number, h: number) => {
  box(g, w / 2 - 1, 6, 2, h - 6, '#7C3AED');
  box(g, w / 2 - 4, 0, 8, 8, '#1A1028'); box(g, w / 2 - 3, 1, 6, 6, timeOfDay().lamps > 0.3 ? '#FEF3C7' : '#FDE68A');
};

const props = (): Prop[] => {
  const out: Prop[] = [];
  for (let k = 0; k < 12; k++) out.push({ id: `wa-sd-tree${k % 3}`, x: (k % 2 ? 1 : -1) * (4.4 + (k % 3) * 0.8), z: 3 + k * 3.4, w: 1.8 + (k % 3) * 0.1, h: 3.2, ppm: 20, paint: tree });
  for (let k = 0; k < 10; k++) out.push({ id: 'wa-sd-lamp', x: (k % 2 ? -1 : 1) * 2.5, z: 3 + k * 4, w: 0.6, h: 2.6, ppm: 24, paint: lamp });
  return out;
};

export const STUPID_DAD: SceneDef = {
  land: 'CARTOON LAND',
  weapon: 'MALLET',
  sky: ['#0EA5E9', '#38BDF8', '#60C8FA', '#8ED8FB', '#BDE8FD', '#E0F4FE', '#FDF2F8'],
  haze: '#FDF2F8',
  ground, back, props,
  drawWeapon: (c: Ctx) => { c.scale(0.7, 0.7); mallet(c); },
  grip: [[0, 0], [24, 0]],
  rim: '#F9A8D4',
};
