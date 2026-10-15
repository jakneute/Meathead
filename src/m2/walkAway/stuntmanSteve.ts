// The walk-away from STUNTMAN STEVE (Hollywood Land's boss): a PLACEHOLDER (the skeleton's: replace it, the way
// walkAway/donnie.ts is done). Back down the backlot toward the camera at whatever hour it is now (timeOfDay.ts):
// gray pavement, a few crude plywood facades along it, the HAPPYWOOD hill far off behind him. His new toy: the STUNT
// CAR (its walk-away act is the clapperboard: walkAway/acts.ts).

import { type Ctx, type Prop, type SceneDef, HOR, box } from './kit';
import { timeOfDay } from '../timeOfDay';
import { slate } from './toys';

const ground = (g: Ctx, w: number, h: number) => {
  box(g, 0, 0, w, h, '#52525B');
  box(g, w / 2 - 40, 0, 80, h, '#71717A');
  for (let y = 0; y < h; y += 32) box(g, w / 2 - 2, y, 4, 16, '#FACC15');
};

const back = (c: Ctx, _t: number, sway: number) => {
  const tod = timeOfDay();
  // (the hill, far off, its letters (one fallen))
  const x = Math.round(300 + sway * 0.4);
  c.fillStyle = tod.lamps > 0.5 ? '#3F2A14' : '#A16207'; c.beginPath(); c.moveTo(x - 80, HOR); c.quadraticCurveTo(x, HOR - 60, x + 80, HOR); c.fill();
  for (let i = 0; i < 9; i++) { if (i === 7) continue; const lx = x - 36 + i * 8, tt = (lx - x + 80) / 160; box(c, lx, HOR - 120 * tt * (1 - tt) - 8, 5, 7, '#F5F5F4'); }
};

const facade = (g: Ctx, w: number, h: number) => {
  box(g, 0, 0, w, h, '#B91C1C');
  box(g, 0, 0, w, 3, '#FECACA');
  box(g, w / 2 - 6, h - 16, 12, 16, '#18181B');
};

const props = (): Prop[] => {
  const out: Prop[] = [];
  for (let i = 0; i < 8; i++) out.push({ id: 'wa-sts-facade', x: (i % 2 ? 1 : -1) * 6, z: 4 + i * 6, w: 3, h: 3.5, ppm: 16, paint: facade });
  return out;
};

export const STUNTMAN_STEVE: SceneDef = {
  land: 'HOLLYWOOD LAND',
  weapon: 'STUNT_CAR',
  sky: ['#1E3A8A', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#FDE68A', '#FEF3C7'],
  haze: '#FDE68A',
  ground, back, props,
  drawWeapon: (c: Ctx, t: number) => slate(c, t, 0),
  grip: [[0, 0], [0, -14]],
  rim: '#FDE68A',
};
