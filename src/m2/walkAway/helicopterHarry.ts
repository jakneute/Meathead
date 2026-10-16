// The walk-away from HELICOPTER HARRY (Foreign Lands' boss): a PLACEHOLDER (the first job's: replace it with the
// fight, the way walkAway/stuntmanSteve.ts is done). Back down the lagoon promenade toward the camera at whatever hour
// it is now (timeOfDay.ts): pale pavers, the railing and the lagoon off to one side, a few crude pavilion fronts in
// their colors along the other, the helicopter's smoke far off behind him. His new toy: the SOUVENIR launcher (its
// walk-away act: walkAway/acts.ts).

import { type Ctx, type Prop, type SceneDef, HOR, box } from './kit';
import { timeOfDay } from '../timeOfDay';
import { souvenir } from './toys';

const ground = (g: Ctx, w: number, h: number) => {
  box(g, 0, 0, w, h, '#D6CBB4');
  for (let y = 0; y < h; y += 24) box(g, 0, y, w, 1, '#B8AC94');
  for (let x = 0; x < w; x += 32) box(g, x, 0, 1, h, '#C4B8A0');
  box(g, 0, 0, 40, h, '#1E3A8A');
};

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay(), x = Math.round(300 + sway * 0.4);
  // (the helicopter's smoke, going up far off)
  for (let k = 0; k < 6; k++) { c.fillStyle = tod.lamps > 0.5 ? '#3F3F46' : '#78716C'; c.beginPath(); c.arc(x + Math.sin(t * 0.02 + k) * 4 + k * 3, HOR - 10 - k * 12, 6 + k * 2, 0, Math.PI * 2); c.fill(); }
};

const front = (k: number) => (g: Ctx, w: number, h: number) => {
  const col = ['#EC4899', '#DC2626', '#F59E0B', '#14B8A6', '#E5E7EB'][k % 5];
  box(g, 0, 0, w, h, col); box(g, 0, 0, w, 3, '#FFFFFF');
  box(g, w / 2 - 6, h - 16, 12, 16, '#1C1917');
};

const props = (): Prop[] => {
  const out: Prop[] = [];
  for (let i = 0; i < 8; i++) out.push({ id: `wa-hh-front${i % 5}`, x: 6, z: 4 + i * 6, w: 3, h: 3.5, ppm: 16, paint: front(i) });
  return out;
};

export const HELICOPTER_HARRY: SceneDef = {
  land: 'FOREIGN LANDS',
  weapon: 'SOUVENIR',
  sky: ['#1E3A8A', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#FDE68A', '#FEF3C7'],
  haze: '#BFDBFE',
  ground, back, props,
  drawWeapon: (c: Ctx, t: number) => souvenir(c, t),
  grip: [[0, 0], [26, -14]],
  rim: '#FDE68A',
};
