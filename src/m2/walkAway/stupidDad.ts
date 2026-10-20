// The walk-away from STUPID DAD (Cartoon Land's boss). Down the candy path out of the amphitheater toward the camera at
// whatever hour it is now (timeOfDay.ts): pink cobbles, puff-ball trees and curly lamp posts either side; far behind
// him, THE UBX AMPHITHEATER's band shell (cream and blue, a sunburst of panels, the red STUPID DAD LIVE! banner hung in
// it, the bulbs round its lip) and THE CARTOON LAND WATER TOWER on the hill (cartoon/monument.ts). Down the path: his
// crushed cans of SWILL LITE (the show's real beer), a plastic beer cup, a foam finger somebody dropped (#1). His new
// toy: the MALLET (its walk-away act: walkAway/acts.ts's MALLET).
//
// STUPID DAD's fight isn't designed yet (the user's, later), and so neither are his two deaths: how he went won't show
// here till they are (the `weakness` flag's unused till then).

import { type Ctx, type Prop, type SceneDef, HOR, box, hash } from './kit';
import { timeOfDay, hourMix } from '../timeOfDay';
import { mallet } from './toys';
import { drawTowerAt } from '../cartoon/monument';

const lit = () => timeOfDay().lamps > 0.3;

const ground = (g: Ctx, w: number, h: number) => {
  box(g, 0, 0, w, h, '#4ADE80');
  for (let i = 0; i < 40; i++) { const x = hash(i * 3.3) * w, y = hash(i * 5.9) * h; box(g, x, y, 2, 2, ['#F472B6', '#FDE047', '#FFFFFF'][i % 3]); }
  box(g, w / 2 - 44, 0, 88, h, '#F9A8D4');
  for (let y = 0; y < h; y += 8) for (let x = w / 2 - 44 + ((y / 8) % 2) * 6; x < w / 2 + 40; x += 12) { box(g, x, y, 10, 6, '#F472B6'); box(g, x, y, 10, 1, '#FBCFE8'); }
};

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay();
  // (the rolling hills)
  c.fillStyle = hourMix('#86C17A', '#7A8A6A', '#1E2E2A', tod);
  c.beginPath(); c.moveTo(0, HOR); for (let i = 0; i <= 20; i++) c.lineTo(i * 20, HOR - 8 - Math.sin(i * 0.6 + 1) * 7); c.lineTo(400, HOR); c.fill();
  // (the amphitheater's band shell: banded half-dome, the bulbs round its lip, the red banner in it)
  const x = Math.round(140 + sway * 0.4), r = 26;
  const bands = [hourMix('#F3E9D2', '#E8C8B0', '#3A3A48', tod), hourMix('#7DB7E8', '#8A90C8', '#22304A', tod)];
  for (let k = 0; k < 5; k++) { c.fillStyle = bands[k % 2]; c.beginPath(); c.arc(x, HOR, r * (1 - k * 0.18), Math.PI, 0); c.fill(); }
  c.fillStyle = '#1A1028'; c.fillRect(x - r - 1, HOR - 1, r * 2 + 2, 2);
  for (let k = 0; k <= 12; k++) { const a = Math.PI + (k / 12) * Math.PI, on = (k + Math.floor(t / 8)) % 3 === 0; box(c, x + Math.cos(a) * r, HOR + Math.sin(a) * r, 1, 1, on || lit() ? '#FEF3C7' : '#B45309'); }
  box(c, x - 10, HOR - 18, 20, 5, '#B91C1C'); box(c, x - 9, HOR - 17, 18, 1, '#FDE047');
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
  box(g, w / 2 - 4, 0, 8, 8, '#1A1028'); box(g, w / 2 - 3, 1, 6, 6, lit() ? '#FEF3C7' : '#FDE68A');
};
/** A crushed can of SWILL LITE, lying on its side. */
const crushed = (g: Ctx, w: number, h: number) => { box(g, 0, h - 3, w, 3, '#5A0612'); box(g, 1, h - 3, w - 2, 2, '#C8102E'); box(g, Math.floor(w / 2) - 1, h - 3, 2, 2, '#F4F1E8'); box(g, w - 1, h - 3, 1, 2, '#C9CDD4'); };
/** A plastic beer cup, tipped over. */
const cup = (g: Ctx, w: number, h: number) => { box(g, 0, h - 3, w, 3, '#E5E7EB'); box(g, 0, h - 2, 2, 1, '#F2B33D'); box(g, w - 1, h - 3, 1, 3, '#FFFFFF'); };
/** A dropped foam finger (#1). */
const finger = (g: Ctx, w: number, h: number) => { box(g, 0, h - 4, w, 4, '#1A1028'); box(g, 1, h - 3, w - 2, 2, '#FDE047'); box(g, w - 3, h - 6, 2, 3, '#FDE047'); box(g, 2, h - 3, 2, 1, '#1E3A8A'); };

const props = (): Prop[] => {
  const out: Prop[] = [];
  for (let k = 0; k < 12; k++) out.push({ id: `wa-sd-tree${k % 3}`, x: (k % 2 ? 1 : -1) * (4.4 + (k % 3) * 0.8), z: 3 + k * 3.4, w: 1.8 + (k % 3) * 0.1, h: 3.2, ppm: 20, paint: tree });
  for (let k = 0; k < 10; k++) out.push({ id: 'wa-sd-lamp', x: (k % 2 ? -1 : 1) * 2.5, z: 3 + k * 4, w: 0.6, h: 2.6, ppm: 24, paint: lamp });
  for (let k = 0; k < 12; k++) out.push({ id: 'wa-sd-can', x: (hash(k * 2.7) - 0.5) * 3, z: 2 + k * 3.1, w: 0.22, h: 0.1, ppm: 40, paint: crushed, wrap: true });
  for (let k = 0; k < 4; k++) out.push({ id: 'wa-sd-cup', x: (hash(k * 4.1) - 0.5) * 3.4, z: 5 + k * 8.3, w: 0.18, h: 0.08, ppm: 40, paint: cup, wrap: true });
  out.push({ id: 'wa-sd-finger', x: -1.7, z: 9, w: 0.34, h: 0.14, ppm: 40, paint: finger });
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
