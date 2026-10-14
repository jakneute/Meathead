// The walk-away from the queen alien (Space Land's boss): a PLACEHOLDER (the skeleton's: replace it, the way
// walkAway/donnie.ts is done). Back down Futureland's main drag toward the camera at whatever hour it is now
// (timeOfDay.ts): flat pavement, a few crude googie pylons along it, the giant atom far off behind him. His new toy:
// the OTHERWORLDLY SPAWNER.

import { type Ctx, type Prop, type SceneDef, HOR, box } from './kit';
import { timeOfDay } from '../timeOfDay';

const ground = (g: Ctx, w: number, h: number) => {
  box(g, 0, 0, w, h, '#475569');
  box(g, w / 2 - 40, 0, 80, h, '#64748B');
  for (let y = 0; y < h; y += 32) box(g, w / 2 - 2, y, 4, 16, '#E2E8F0');
};

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay();
  // (the giant atom, far off: a ball and its three orbits)
  const x = Math.round(300 + sway * 0.4), y = HOR - 34;
  c.strokeStyle = tod.lamps > 0.3 ? '#A5B4FC' : '#94A3B8'; c.lineWidth = 2;
  for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(x, y, 30, 10, (k * Math.PI) / 3 + t * 0.002, 0, Math.PI * 2); c.stroke(); }
  c.fillStyle = '#E0E7FF'; c.beginPath(); c.arc(x, y, 8, 0, Math.PI * 2); c.fill();
  box(c, x - 2, y + 8, 4, HOR - y - 8, '#64748B');
};

const pylon = (g: Ctx, w: number, h: number) => {
  box(g, w / 2 - 3, 10, 6, h - 10, '#94A3B8');
  box(g, 0, 0, w, 10, '#F472B6');
  box(g, 0, 0, w, 3, '#FBCFE8');
};

const props = (): Prop[] => {
  const out: Prop[] = [];
  for (let i = 0; i < 8; i++) out.push({ id: `wa-spq-pylon`, x: (i % 2 ? 1 : -1) * 5.5, z: 4 + i * 6, w: 1.6, h: 4, ppm: 16, paint: pylon });
  return out;
};

/** The spawner, crude: a fleshy pod on a gun's grip. */
const spawner = (c: Ctx) => {
  box(c, -20, -8, 40, 16, '#1F1B24');
  box(c, -19, -7, 38, 14, '#65A30D');
  box(c, -19, -7, 38, 3, '#A3E635');
  box(c, 18, -4, 10, 8, '#3F3F46');
  box(c, -14, 6, 8, 12, '#3F3F46');
};

export const SPACE_QUEEN: SceneDef = {
  land: 'FUTURE LAND',
  weapon: 'SPAWNER',
  sky: ['#1E1B4B', '#312E81', '#3730A3', '#4338CA', '#6366F1', '#818CF8', '#A5B4FC'],
  haze: '#6366F1',
  ground, back, props,
  drawWeapon: spawner,
  grip: [[-10, 8], [16, 0]],
  rim: '#A5B4FC',
};
