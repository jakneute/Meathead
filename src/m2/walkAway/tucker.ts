// The walk-away from TUCKER THE TRAIN CONDUCTOR (Wilderness Land's boss): a PLACEHOLDER (the skeleton's: replace it,
// the way walkAway/donnie.ts is done). Down a dirt road out of the real woods toward the camera at whatever hour it is
// now (timeOfDay.ts): ruts, pines along it, the park's perimeter fence busted open far behind him. His new toy: the
// FLINTLOCK (its walk-away act: walkAway/acts.ts). The user's spin: the title's HEADING BACK TO PARK, and after it he
// starts from the intro's parking lot and walks back in (arena/index.ts `leave`; intro/index.ts's walk back).

import { type Ctx, type Prop, type SceneDef, HOR, box } from './kit';
import { timeOfDay } from '../timeOfDay';
import { flintlock } from './toys';

const ground = (g: Ctx, w: number, h: number) => {
  box(g, 0, 0, w, h, '#4A6A2A');
  box(g, w / 2 - 40, 0, 80, h, '#8A6A42');
  for (let y = 0; y < h; y += 24) { box(g, w / 2 - 26, y, 6, 14, '#6B4E2E'); box(g, w / 2 + 20, y + 8, 6, 14, '#6B4E2E'); }
};

const back = (c: Ctx, _t: number, sway: number) => {
  const tod = timeOfDay();
  const x = Math.round(300 + sway * 0.4);
  // (the ridge, the pines on it)
  c.fillStyle = tod.lamps > 0.5 ? '#14281A' : '#2F4A2A';
  c.beginPath(); c.moveTo(0, HOR); for (let i = 0; i <= 20; i++) c.lineTo(i * 32, HOR - 10 - ((i * 7) % 5) * 4); c.lineTo(640, HOR); c.fill();
  // (the busted fence, far off: two posts and the chain-link peeled back)
  box(c, x - 30, HOR - 14, 2, 14, '#A1A1AA'); box(c, x + 28, HOR - 14, 2, 14, '#A1A1AA');
  c.strokeStyle = '#D4D4D8'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 28, HOR - 12); c.lineTo(x - 10, HOR - 4); c.moveTo(x + 28, HOR - 12); c.lineTo(x + 14, HOR - 2); c.stroke();
};

const pine = (g: Ctx, w: number, h: number) => {
  box(g, w / 2 - 2, h - 10, 4, 10, '#5A3A1E');
  g.fillStyle = '#1F4A2A';
  for (let k = 0; k < 4; k++) { const y = 4 + k * (h - 14) / 4, half = 4 + k * (w / 2 - 4) / 3; g.beginPath(); g.moveTo(w / 2, y - 6); g.lineTo(w / 2 + half, y + (h - 14) / 4); g.lineTo(w / 2 - half, y + (h - 14) / 4); g.fill(); }
};

const props = (): Prop[] => {
  const out: Prop[] = [];
  for (let i = 0; i < 12; i++) out.push({ id: 'wa-tk-pine', x: (i % 2 ? 1 : -1) * (5 + (i % 3)), z: 3 + i * 4, w: 3, h: 6, ppm: 16, paint: pine });
  return out;
};

export const TUCKER: SceneDef = {
  land: 'WILDERNESS LAND',
  weapon: 'FLINTLOCK',
  title: 'HEADING BACK TO PARK',
  sky: ['#1E40AF', '#2563EB', '#3B82F6', '#7DB8F0', '#BFE0F8', '#F2E6C4', '#F8D9A0'],
  haze: '#F2E6C4',
  ground, back, props,
  drawWeapon: (c: Ctx, t: number) => flintlock(c, t),
  grip: [[-2, 2], [28, -10]],
  rim: '#F8D9A0',
};
