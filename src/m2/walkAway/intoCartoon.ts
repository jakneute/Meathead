// The walk into Cartoon Land (portalWalk.ts): crude-but-clean (the kiddie square's owner can bring its painting into it
// later). Out of the portal and up a candy-striped path into SILLYVILLE SQUARE: puff-ball trees on curly striped trunks,
// curly lamp posts, toadstools, wobbly candy-colored houses with drooping onion domes either side; far off at the end of
// it, the rolling hills and THE CARTOON LAND WATER TOWER (cartoon/monument.ts: the smallest it ever is), its propeller
// turning. The sky by the hour.

import { type Ctx, type Prop, type PortalDef, HOR, box, hash } from './kit';
import { timeOfDay, hourMix } from '../timeOfDay';
import { drawTowerAt } from '../cartoon/monument';

const INK = '#1A1028';
const lit = () => timeOfDay().lamps > 0.3;

const ground = (g: Ctx, w: number, h: number) => {
  // (the lawn, flowers in it; the path: pink cobbles, candy-striped curbs)
  box(g, 0, 0, w, h, '#4ADE80');
  for (let i = 0; i < 60; i++) { const x = hash(i * 3.7) * w, y = hash(i * 9.1) * h; box(g, x, y, 2, 2, ['#F472B6', '#FDE047', '#FFFFFF', '#C084FC'][i % 4]); }
  const cx = w / 2, half = 46;
  box(g, cx - half, 0, half * 2, h, '#F9A8D4');
  for (let y = 0, r = 0; y < h; y += 7, r++) for (let x = cx - half + (r % 2) * 5; x < cx + half - 2; x += 10) { box(g, x, y, 9, 6, '#F472B6'); box(g, x, y, 9, 1, '#FBCFE8'); }
  for (let y = 0; y < h; y += 6) { const c = (y / 6) % 2 ? '#FFFFFF' : '#EF4444'; box(g, cx - half - 3, y, 3, 6, c); box(g, cx + half, y, 3, 6, c); }
};

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay();
  c.fillStyle = hourMix('#A7D8A0', '#9A9A8A', '#1E2E34', tod);
  c.beginPath(); c.moveTo(0, HOR); for (let i = 0; i <= 20; i++) c.lineTo(i * 20, HOR - 10 - Math.sin(i * 0.5) * 9); c.lineTo(400, HOR); c.fill();
  drawTowerAt(c, Math.round(200 + sway * 0.45), HOR - 2, 0.16, t);
  c.fillStyle = hourMix('#6CC07A', '#6A7A60', '#14241E', tod);
  c.beginPath(); c.moveTo(0, HOR + 2); for (let i = 0; i <= 20; i++) c.lineTo(i * 20, HOR - 3 - Math.sin(i * 0.9 + 2) * 4); c.lineTo(400, HOR + 2); c.fill();
};

const tree = (col: string) => (g: Ctx, w: number, h: number) => {
  // (a curly striped trunk up to a puff-ball)
  g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(w / 2, h); g.bezierCurveTo(w * 0.2, h * 0.7, w * 0.8, h * 0.5, w / 2, h * 0.32); g.stroke();
  g.strokeStyle = '#FFF7E8'; g.lineWidth = 3.5; g.stroke(); g.setLineDash([3, 3]); g.strokeStyle = '#F472B6'; g.stroke(); g.setLineDash([]);
  g.fillStyle = INK; g.beginPath(); g.arc(w / 2, h * 0.24, w * 0.4 + 2, 0, Math.PI * 2); g.fill();
  g.fillStyle = col; g.beginPath(); g.arc(w / 2, h * 0.24, w * 0.4, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.arc(w * 0.38, h * 0.18, w * 0.12, 0, Math.PI * 2); g.fill();
};
const house = (wall: string, roof: string, seed: number) => (g: Ctx, w: number, h: number) => {
  // (a wobbly house: bulging walls, a round door and windows, a drooping onion dome)
  const rh = h * 0.42;
  g.fillStyle = INK; g.beginPath(); g.moveTo(w * 0.1, h); g.quadraticCurveTo(-2, h * 0.7, w * 0.12, rh); g.lineTo(w * 0.88, rh); g.quadraticCurveTo(w + 2, h * 0.7, w * 0.9, h); g.closePath(); g.fill();
  g.fillStyle = wall; g.beginPath(); g.moveTo(w * 0.12, h - 1); g.quadraticCurveTo(1, h * 0.7, w * 0.14, rh + 2); g.lineTo(w * 0.86, rh + 2); g.quadraticCurveTo(w - 1, h * 0.7, w * 0.88, h - 1); g.closePath(); g.fill();
  g.fillStyle = INK; g.beginPath(); g.ellipse(w / 2, h, w * 0.12, h * 0.18, 0, Math.PI, 0); g.fill();
  for (const wx of [w * 0.28, w * 0.72]) { g.fillStyle = INK; g.beginPath(); g.arc(wx, h * 0.62, w * 0.08, 0, Math.PI * 2); g.fill(); g.fillStyle = lit() ? '#FDE68A' : '#BAE6FD'; g.beginPath(); g.arc(wx, h * 0.62, w * 0.06, 0, Math.PI * 2); g.fill(); }
  const lean = (hash(seed) - 0.5) * w * 0.4;
  g.fillStyle = INK; g.beginPath(); g.moveTo(w * 0.06, rh + 3); g.bezierCurveTo(w * 0.02, rh * 0.3, w / 2 + lean, rh * 0.5, w / 2 + lean, 0); g.bezierCurveTo(w / 2 + lean, rh * 0.5, w * 0.98, rh * 0.3, w * 0.94, rh + 3); g.closePath(); g.fill();
  g.fillStyle = roof; g.beginPath(); g.moveTo(w * 0.09, rh + 1); g.bezierCurveTo(w * 0.06, rh * 0.32, w / 2 + lean, rh * 0.55, w / 2 + lean, 3); g.bezierCurveTo(w / 2 + lean, rh * 0.55, w * 0.94, rh * 0.32, w * 0.91, rh + 1); g.closePath(); g.fill();
};
const lamp = (g: Ctx, w: number, h: number) => {
  g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(w / 2, h); g.bezierCurveTo(w * 0.2, h * 0.6, w * 0.8, h * 0.4, w / 2, h * 0.12); g.stroke();
  g.strokeStyle = '#7C3AED'; g.lineWidth = 2; g.stroke();
  box(g, w / 2 - 4, 0, 8, 8, INK); box(g, w / 2 - 3, 1, 6, 6, lit() ? '#FEF3C7' : '#FDE68A');
};
const toad = (g: Ctx, w: number, h: number) => {
  box(g, w * 0.36, h * 0.4, w * 0.28, h * 0.6, INK); box(g, w * 0.38, h * 0.42, w * 0.24, h * 0.58, '#FEF3C7');
  g.fillStyle = INK; g.beginPath(); g.ellipse(w / 2, h * 0.4, w / 2, h * 0.3, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#EF4444'; g.beginPath(); g.ellipse(w / 2, h * 0.4, w / 2 - 1, h * 0.3 - 1, 0, Math.PI, 0); g.fill();
  for (const sx of [0.3, 0.6]) box(g, w * sx, h * 0.22, 2, 2, '#FFFFFF');
};

const props = (): Prop[] => {
  const out: Prop[] = [];
  const walls = ['#FDE68A', '#FBCFE8', '#BFDBFE', '#BBF7D0'], roofs = ['#EC4899', '#8B5CF6', '#14B8A6', '#F97316'];
  for (let i = 0; i < 10; i++) { const side = i % 2 ? 1 : -1, k = i % 4; out.push({ id: `pw-ct-house${k}`, x: side * (5.4 + (i % 3) * 0.6), z: 4 + i * 3.2, w: 3.2, h: 4.4, ppm: 18, paint: house(walls[k], roofs[(k + 1) % 4], k) }); }
  for (let k = 0; k < 10; k++) out.push({ id: `pw-ct-tree${k % 4}`, x: (k % 2 ? -1 : 1) * (3.6 + (k % 3) * 0.5), z: 3 + k * 3.6, w: 1.6, h: 3, ppm: 20, paint: tree(['#F472B6', '#FDE047', '#A78BFA', '#FB923C'][k % 4]) });
  for (let k = 0; k < 8; k++) out.push({ id: 'pw-ct-lamp', x: (k % 2 ? 1 : -1) * 2.4, z: 3 + k * 4, w: 0.6, h: 2.6, ppm: 24, paint: lamp });
  for (let k = 0; k < 4; k++) out.push({ id: 'pw-ct-toad', x: (k % 2 ? -1 : 1) * 3.0, z: 5 + k * 6, w: 0.9, h: 0.8, ppm: 24, paint: toad });
  return out;
};

export const INTO_CARTOON: PortalDef = {
  land: 'CARTOON LAND',
  lines: ['EVERYTHING IS SOFT. NOTHING CAN HURT YOU. PROBABLY.', 'KIDDIE RIDES, CARTOONS AND A 1994 MASTERPIECE.'],
  haze: '#FDF2F8',
  ground, back, props,
  rim: () => hourMix('#FDF2F8', '#F9A8D4', '#C4B5FD'),
};
