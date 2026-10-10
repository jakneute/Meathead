// The pebble cutscene's close-up: inside the maintenance booth (full screen, letterboxed), the pebble coming in its
// window and onto the DINOSAUR MODE switch. Painted at 340 x 220 and scaled up to the screen.
//
// The room: cinder block painted institutional green, a window out onto the pen (the hour's sky in it, the fence, a
// raptor standing about), the console under it (the DINOSAUR MODE panel, its big toggle, a beacon on top), the board
// counting DAYS WITHOUT INCIDENT, a 1997 calendar nobody's turned, a mini fridge, a coffee maker; him, sat with his back
// to all of it, boots up on an upturned bucket, reading DIRT BIKE.

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../../m1/constants';
import { skyTint, farTint } from '../../../timeOfDay';
import { drawPerson } from '../../temple/people';
import { type Ctx, INK, box, text, sign, slab, pole, ball, rampOf, checker, steppedGlow, stamp, bandedGradient } from './kit';

export const PIP = { w: 340, h: 220 };
const CUT_SCALE = CANVAS_WIDTH / PIP.w;

export interface CutNow { k: number; pt: number; clicked: boolean; inAt: number; hitAt: number; talking: boolean }

export const drawBoothCut = (c: Ctx, f: number, cut: CutNow, after: (c: Ctx) => void) => {
  const k = cut.k;
  box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#000000');
  if (k < 0.5) return;
  const h = PIP.h * CUT_SCALE, y = (CANVAS_HEIGHT - h) / 2;
  c.save(); c.beginPath(); c.rect(0, y, CANVAS_WIDTH, h); c.clip(); c.translate(0, y); c.scale(CUT_SCALE, CUT_SCALE);
  stamp(c, 'dcut-room', 0, 0, PIP.w, PIP.h, paintRoom);
  windowView(c, f);
  // The switch: over the moment it's hit
  const flip = cut.clicked ? Math.min(1, (cut.pt - cut.hitAt) / 5) : 0;
  c.save(); c.translate(245, 124); c.rotate(-0.6 + 1.2 * flip);
  box(c, -3, -27, 6, 27, INK); box(c, -2, -26, 4, 26, '#D4D4D8'); box(c, -2, -26, 1, 26, '#FFFFFF');
  ball(c, 0, -30, 5, '#DC2626');
  c.restore();
  box(c, 233, 120, 24, 10, INK); box(c, 234, 121, 22, 8, '#3F3F46'); box(c, 234, 121, 22, 2, '#71717A');
  // The mode lamps on the panel (the one it's on lit), and the beacon up on the console: still, then going round
  const hostile = cut.clicked && flip >= 1;
  lamp(c, 212, 132, !hostile, '#4ADE80');
  lamp(c, 280, 132, hostile, '#F87171');
  const lit = cut.clicked, turn = (f * 0.25) % (Math.PI * 2);
  box(c, 290, 36, 16, 4, '#27272A');
  c.fillStyle = INK; c.beginPath(); c.arc(298, 34, 8, Math.PI, 0); c.fill();
  c.fillStyle = lit ? '#EF4444' : '#5A1010'; c.beginPath(); c.arc(298, 34, 7, Math.PI, 0); c.fill();
  if (lit) {
    c.fillStyle = '#FFB0A0'; c.beginPath(); c.arc(298 + Math.cos(turn) * 3, 31, 2, 0, Math.PI * 2); c.fill();
    // (the beam sweeping the room: a wedge of red across the walls)
    c.fillStyle = 'rgba(239, 68, 68, 0.14)'; c.beginPath(); c.moveTo(298, 32); c.lineTo(298 + Math.cos(turn) * 400, 32 + Math.sin(turn) * 140); c.lineTo(298 + Math.cos(turn + 0.35) * 400, 32 + Math.sin(turn + 0.35) * 140); c.closePath(); c.fill();
    steppedGlow(c, 298, 32, 22, '#EF4444', 0.3, 0.04, 3);
  }
  // Him: sat with his back to it all, boots up, the magazine
  c.save(); c.translate(110, 196); c.scale(-1.5, 1.5);
  drawPerson(c, { seed: 4242, outfit: 'maint', pose: 'sit', f, mood: 'bored', woman: false, talking: cut.talking });
  c.restore();
  slab(c, 50, 116, 28, 22, '#F8FAFC', { ink: true });
  box(c, 52, 118, 24, 6, '#DC2626'); text(c, 'DIRT', 64, 124, '#FFFFFF', 4, 'center', null);
  box(c, 54, 126, 20, 9, '#7A8A9A'); box(c, 58, 128, 10, 4, '#3A3A3A');
  // The pebble: in through the window, onto the switch's knob, and off it to the floor
  const t = cut.pt;
  if (t >= cut.inAt) {
    let px: number, py: number;
    if (t <= cut.hitAt) { const u = (t - cut.inAt) / (cut.hitAt - cut.inAt); px = 30 + u * 215; py = 70 - Math.sin(u * Math.PI) * 40 + u * 26; }
    else { const u = Math.min(1, (t - cut.hitAt) / 24); px = 250 + u * 30; py = 96 + u * 74 - Math.sin(u * Math.PI) * 20; }
    box(c, px - 4, py - 3, 8, 7, INK); box(c, px - 3, py - 2, 6, 5, '#A8A29E'); box(c, px - 3, py - 2, 2, 2, '#D6D3D1');
    // (the hit: a spark off the knob)
    if (t > cut.hitAt && t < cut.hitAt + 6) {
      const s = 4 + (t - cut.hitAt) * 2;
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; box(c, 245 + Math.cos(a) * s - 1, 94 + Math.sin(a) * s - 1, 2, 2, i % 2 ? '#FFFFFF' : '#FDE047'); }
    }
  }
  after(c);
  c.restore();
  // (fading in from black, and out to it)
  if (k < 1) { c.fillStyle = `rgba(0, 0, 0, ${((1 - k) * 2).toFixed(2)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
};

const lamp = (c: Ctx, x: number, y: number, on: boolean, col: string) => {
  box(c, x - 6, y - 6, 12, 8, INK);
  box(c, x - 5, y - 5, 10, 6, on ? col : rampOf(col)[0]);
  if (on) { box(c, x - 4, y - 4, 3, 2, '#FFFFFF'); steppedGlow(c, x, y - 2, 12, col, 0.3, 0.04, 3); }
};

/** Out the window: the hour's sky, the pen's fence, a raptor standing about, the volcano far off steaming. */
const windowView = (c: Ctx, f: number) => {
  c.save(); c.beginPath(); c.rect(18, 38, 88, 72); c.clip();
  bandedGradient(c, 18, 38, 88, 50, [skyTint('#4690DC', 0.2), skyTint('#84BCEA', 0.6), skyTint('#C6E0EC', 0.9)], 6);
  c.fillStyle = farTint('#6A5A48', 0.8); c.beginPath(); c.moveTo(60, 88); c.lineTo(84, 62); c.lineTo(92, 62); c.lineTo(112, 88); c.closePath(); c.fill();
  box(c, 84, 60, 8, 3, '#F88A1A');
  for (let i = 0; i < 2; i++) { const kk = ((f * 0.5 + i * 30) % 60) / 60; c.fillStyle = `rgba(240,240,244,${(0.5 * (1 - kk)).toFixed(2)})`; c.fillRect(86 + kk * 4, 56 - kk * 16, 4 + kk * 6, 3 + kk * 3); }
  box(c, 18, 82, 88, 28, farTint('#4F6A2A', 0.4));
  box(c, 18, 82, 88, 2, farTint('#6E8A3A', 0.4));
  // (the fence: posts and wires)
  for (let x = 22; x < 106; x += 18) box(c, x, 70, 2, 30, '#4A525C');
  for (const wy of [74, 82, 90]) box(c, 18, wy, 88, 1, '#3A3E44');
  // (a raptor in the pen, doing its friendly-mode bob)
  const b = Math.round(Math.sin(f * 0.08) * 1);
  box(c, 34, 92 + b, 18, 7, '#5B6E58'); box(c, 50, 86 + b, 8, 5, '#5B6E58'); box(c, 28, 94 + b, 8, 3, '#3F4F3D');
  box(c, 38, 99, 2, 8, '#3F4F3D'); box(c, 46, 99, 2, 8, '#3F4F3D'); box(c, 55, 87 + b, 1, 1, '#60A5FA');
  c.restore();
};

const paintRoom = (g: Ctx) => {
  const W = PIP.w;
  // (cinder block, painted green, the courses in steps)
  box(g, 0, 0, W, 170, '#7E9A80');
  for (let y = 0; y < 170; y += 12) { box(g, 0, y, W, 1, '#6A866C'); for (let x = (y / 12) % 2 ? 0 : 12; x < W; x += 24) box(g, x, y, 1, 12, '#6A866C'); box(g, 0, y + 1, W, 1, '#90AC92'); }
  checker(g, 0, 0, W, 2, '#6A866C');
  // (the floor: linoleum checks, scuffed)
  box(g, 0, 170, W, 50, '#8A8478');
  for (let y = 170; y < 220; y += 10) for (let x = (y / 10) % 2 ? 0 : 10; x < W; x += 20) box(g, x, y, 10, 10, '#6A665C');
  box(g, 0, 168, W, 3, '#4A463E');
  // The window (its frame; the view's drawn live)
  slab(g, 12, 32, 100, 84, '#D6D3D1');
  box(g, 16, 36, 92, 76, INK);
  box(g, 10, 114, 104, 6, '#A8A29E');
  // The board: DAYS WITHOUT INCIDENT, number cards hung on hooks
  sign(g, 128, 8, 116, 30, '#F8FAFC', '', INK, 6, '#1E3A8A');
  text(g, 'DAYS WITHOUT', 186, 18, '#1E3A8A', 5, 'center', null);
  text(g, 'AN INCIDENT', 186, 25, '#1E3A8A', 5, 'center', null);
  for (let i = 0; i < 4; i++) { box(g, 162 + i * 13, 27, 11, 9, INK); box(g, 163 + i * 13, 28, 9, 7, '#FFFFFF'); text(g, '4380'[i], 167 + i * 13, 35, '#B91C1C', 5, 'center', null); }
  // (a calendar, still on 1997)
  slab(g, 258, 6, 26, 30, '#F8FAFC'); box(g, 258, 6, 26, 8, '#B91C1C'); text(g, '1997', 271, 13, '#FFFFFF', 4, 'center', null);
  for (let r = 0; r < 3; r++) for (let q = 0; q < 4; q++) box(g, 261 + q * 6, 17 + r * 6, 4, 4, '#D4D4D8');
  // The console: the DINOSAUR MODE panel, its labels, its buttons and screens (the switch and lamps are live)
  slab(g, 172, 56, 146, 104, '#52525B');
  slab(g, 180, 62, 130, 92, '#71717A');
  sign(g, 196, 66, 98, 12, '#18181B', 'DINOSAUR MODE', '#FDE047', 6);
  text(g, 'FRIENDLY', 212, 148, '#4ADE80', 5, 'center', INK);
  text(g, 'HOSTILE', 280, 148, '#F87171', 5, 'center', INK);
  for (let i = 0; i < 5; i++) { box(g, 186 + i * 5, 86, 3, 3, ['#4ADE80', '#FDE047', '#4ADE80', '#60A5FA', '#4ADE80'][i]); }
  box(g, 270, 84, 34, 22, INK); box(g, 271, 85, 32, 20, '#0F2A1A'); for (let r = 0; r < 4; r++) box(g, 273, 88 + r * 4, 10 + ((r * 7) % 16), 1, '#4ADE80');
  // (a sticky note on it, in pen: DON'T TOUCH)
  box(g, 186, 94, 26, 18, '#FDE68A'); text(g, "DON'T", 199, 102, '#1E3A8A', 4, 'center', null); text(g, 'TOUCH', 199, 109, '#1E3A8A', 4, 'center', null);
  // The desk under it, a coffee maker, a mug, a mini fridge (a magnet: a T. rex)
  slab(g, 160, 156, 170, 12, '#8A6A44');
  slab(g, 300, 120, 20, 36, '#27272A'); box(g, 304, 140, 12, 12, '#7F1D1D'); box(g, 304, 140, 12, 3, '#B45309');
  slab(g, 6, 128, 40, 42, '#E7E5E4'); box(g, 8, 146, 36, 1, '#A8A29E'); box(g, 38, 132, 3, 10, '#A8A29E'); box(g, 14, 134, 6, 6, '#16A34A');
  // (the bucket his boots are up on)
  slab(g, 150, 176, 22, 22, '#71717A'); box(g, 150, 176, 22, 3, '#A1A1AA');
  pole(g, 330, 0, 6, 170, '#9CA3AF');
};
