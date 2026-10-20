// The pebble cutscene's close-up: inside the maintenance booth (full screen, letterboxed), the pebble coming in its
// window and onto the DINOSAUR MODE switch. Painted at 340 x 220 and scaled up to the screen.
//
// The room: cinder block painted institutional green, a window out onto the pen (the hour's sky in it, the fence, a
// raptor standing about), the console under it (the DINOSAUR MODE panel, its big toggle, a beacon on top), the board
// counting DAYS WITHOUT INCIDENT, a 1997 calendar nobody's turned, a mini fridge, a coffee maker; him, sat at his desk
// in his swivel chair with his back to all of it, reading DIRT BIKE.

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../../m1/constants';
import { skyTint, farTint } from '../../../timeOfDay';
import { drawPerson } from '../../temple/people';
import { type Ctx, INK, box, text, sign, slab, pole, ball, rampOf, checker, steppedGlow, stamp, bandedGradient } from './kit';
import { signAt, signText, enamel, print, led } from '../../letters';
import { drawRaptorIdle } from './robots';

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
  // Him: sat at his desk in his swivel chair, his back to it all, reading DIRT BIKE
  stamp(c, 'dcut-chair', 92, 132, 52, 80, chair);
  c.save(); c.translate(110, 186); c.scale(-1.5, 1.5);
  drawPerson(c, { seed: 4242, outfit: 'maint', pose: 'sit', f, mood: 'bored', woman: false, talking: cut.talking });
  c.restore();
  stamp(c, 'dcut-desk', 34, 136, 66, 74, desk);
  // (the magazine, held up in front of him)
  slab(c, 74, 128, 22, 18, '#F8FAFC', { ink: true });
  box(c, 76, 130, 18, 5, '#DC2626'); text(c, 'DIRT', 85, 135, '#FFFFFF', 4, 'center', null);
  box(c, 77, 137, 16, 7, '#7A8A9A'); box(c, 80, 139, 8, 3, '#3A3A3A');
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

/** His swivel chair: the seat under him, its back behind him (he's facing left), the gas post, the five-star base on
 *  its casters on the floor. */
const chair = (c: Ctx) => {
  const r = rampOf('#3F3F46'), cu = rampOf('#7F1D1D');
  // (the base and casters, on the floor)
  box(c, 96, 202, 34, 4, INK); box(c, 97, 203, 32, 2, r[2]); box(c, 97, 203, 32, 1, r[3]);
  for (const x of [96, 111, 126]) { box(c, x, 205, 5, 5, INK); box(c, x + 1, 206, 3, 3, r[1]); }
  // (the post)
  box(c, 110, 176, 5, 27, INK); box(c, 111, 176, 3, 27, r[3]); box(c, 111, 176, 1, 27, r[4]);
  // (the back: up behind him, on its arm)
  box(c, 124, 168, 10, 4, INK); box(c, 125, 169, 8, 2, r[2]); box(c, 130, 166, 4, 8, INK); box(c, 131, 166, 2, 8, r[2]);
  box(c, 129, 132, 12, 38, INK); box(c, 130, 133, 10, 36, cu[2]); box(c, 130, 133, 3, 36, cu[3]); box(c, 138, 133, 2, 36, cu[1]);
  box(c, 131, 140, 6, 1, cu[1]); box(c, 131, 150, 6, 1, cu[1]); box(c, 131, 160, 6, 1, cu[1]);
  // (the seat, under him)
  box(c, 96, 172, 32, 7, INK); box(c, 97, 173, 30, 5, cu[2]); box(c, 97, 173, 30, 2, cu[3]); box(c, 97, 177, 30, 1, cu[1]);
};

/** His desk, in front of him: a steel desk, a drawer, his mug, a spike of work orders nobody's done. */
const desk = (c: Ctx) => {
  const r = rampOf('#6B7280');
  // (the top)
  box(c, 36, 154, 62, 6, INK); box(c, 37, 155, 60, 4, r[3]); box(c, 37, 155, 60, 1, r[4]);
  // (the pedestal, the drawers, the far leg)
  box(c, 38, 160, 24, 46, INK); box(c, 39, 160, 22, 45, r[2]); box(c, 39, 160, 2, 45, r[3]);
  for (const y of [166, 181, 194]) { box(c, 41, y, 18, 1, r[0]); box(c, 47, y + 5, 6, 2, '#D4D4D8'); }
  box(c, 92, 160, 4, 46, INK); box(c, 93, 160, 2, 46, r[1]);
  // (on it: a mug, the work orders on their spike)
  box(c, 42, 146, 8, 9, INK); box(c, 43, 147, 6, 7, '#F8FAFC'); box(c, 43, 147, 6, 2, '#1E3A8A'); box(c, 49, 149, 2, 3, INK);
  box(c, 58, 140, 1, 15, INK); box(c, 54, 152, 9, 2, INK);
  for (let i = 0; i < 4; i++) box(c, 54 + (i % 2), 143 + i * 2, 8, 2, i % 2 ? '#FDE68A' : '#F8FAFC');
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
  // (the jungle along the far side: crowns in two steps, a palm)
  for (let x = 14; x < 110; x += 9) { const h = 6 + ((x * 7) % 9); box(c, x, 82 - h, 10, h, farTint('#2E5A30', 0.55)); box(c, x + 1, 82 - h, 5, 2, farTint('#4E7A3E', 0.55)); }
  box(c, 30, 60, 2, 22, farTint('#5A4A36', 0.5)); for (const [dx, dy] of [[-8, 2], [6, 1], [-5, -2], [5, -3]]) box(c, 31 + Math.min(0, dx), 60 + dy, Math.abs(dx) + 1, 2, farTint('#3E7434', 0.5));
  // (the pen's dirt, banded, its prints)
  box(c, 18, 82, 88, 28, farTint('#7A5634', 0.35)); box(c, 18, 82, 88, 2, farTint('#946C44', 0.35)); box(c, 18, 96, 88, 14, farTint('#5C4026', 0.35));
  checker(c, 18, 94, 88, 2, farTint('#5C4026', 0.35));
  for (const [px, py] of [[30, 90], [60, 100], [90, 92]]) { box(c, px, py, 4, 2, farTint('#3E2A18', 0.35)); box(c, px - 2, py - 2, 2, 2, farTint('#3E2A18', 0.35)); box(c, px + 4, py - 2, 2, 2, farTint('#3E2A18', 0.35)); }
  // (a raptor in the pen, doing its friendly-mode bit; a second one further off)
  c.save(); c.translate(86, 92); c.scale(-0.26, 0.26); drawRaptorIdle(c, f + 40, { friendly: true }); c.restore();
  c.save(); c.translate(46, 106); c.scale(0.4, 0.4); drawRaptorIdle(c, f, { friendly: true }); c.restore();
  // (the pen's fence, between: steel posts, insulators, the wires)
  for (let x = 24; x < 106; x += 22) { box(c, x - 1, 62, 4, 48, INK); box(c, x, 62, 2, 48, '#6B7480'); box(c, x, 62, 1, 48, '#9AA4AE'); for (const wy of [66, 76, 86, 96]) box(c, x - 2, wy - 1, 6, 2, '#E8E0C8'); }
  for (const wy of [66, 76, 86, 96]) box(c, 18, wy, 88, 1, '#2A2E34');
  // (the glass: a glint across it, a smear)
  c.fillStyle = 'rgba(220, 236, 255, 0.16)'; c.beginPath(); c.moveTo(24, 110); c.lineTo(36, 110); c.lineTo(64, 38); c.lineTo(52, 38); c.closePath(); c.fill();
  c.fillStyle = 'rgba(220, 236, 255, 0.08)'; c.beginPath(); c.moveTo(70, 110); c.lineTo(76, 110); c.lineTo(100, 38); c.lineTo(94, 38); c.closePath(); c.fill();
  c.restore();
};

const paintRoom = (g: Ctx) => {
  const W = PIP.w;
  // (cinder block, painted institutional green: each block lit along its top, shaded along its foot, the mortar
  // dark; the wall darker in bands toward the floor and the corners, lighter where the window's light falls)
  const WALL = ['#4E6A52', '#5E7A62', '#6E8A72', '#7E9A80', '#90AC92', '#A4C0A4'];
  const lit = (x: number, y: number) => { const dx = (x - 60) / 140, dy = (y - 60) / 120; const k = 3.4 - Math.sqrt(dx * dx + dy * dy) * 1.6 - Math.max(0, (y - 120) / 60); return Math.max(1, Math.min(4, Math.round(k))); };
  for (let y = 0; y < 170; y += 12) for (let x = (y / 12) % 2 ? -12 : 0; x < W; x += 24) {
    const k = lit(x + 12, y + 6), bw = 23, bh = 11;
    box(g, x, y, bw, bh, WALL[k]); box(g, x, y, bw, 1, WALL[k + 1]); box(g, x, y + bh - 2, bw, 2, WALL[k - 1]); box(g, x + bw - 1, y, 1, bh, WALL[k - 1]);
    box(g, x + bw, y, 1, 12, WALL[0]); box(g, x, y + bh, 24, 1, WALL[0]);
    // (a chip, a scuff, here and there)
    if (((x * 7 + y * 13) & 31) === 5) box(g, x + 6, y + 4, 3, 2, WALL[k - 1]);
  }
  // (a skirting band of darker paint along the foot, scuffed by chair wheels)
  box(g, 0, 150, W, 18, WALL[1]); box(g, 0, 150, W, 1, WALL[3]); checker(g, 0, 148, W, 2, WALL[1]);
  for (let x = 60; x < 180; x += 14) box(g, x, 158, 8, 1, WALL[0]);
  // (the floor: linoleum checks in two tones, darker going toward us, the window's light lying on it, scuffs)
  const FL = ['#4A463E', '#6A665C', '#8A8478', '#A8A294', '#C4BEB0'];
  for (let y = 170; y < 220; y += 10) for (let x = 0; x < W; x += 10) {
    const odd = ((x + y) / 10) % 2 === 1, band = y < 190 ? 2 : y < 205 ? 1 : 1;
    box(g, x, y, 10, 10, odd ? FL[band - 1 < 0 ? 0 : band - 1] : FL[band]);
  }
  checker(g, 0, 188, W, 2, FL[1]);
  g.fillStyle = 'rgba(255, 246, 214, 0.16)'; g.beginPath(); g.moveTo(20, 170); g.lineTo(108, 170); g.lineTo(150, 220); g.lineTo(40, 220); g.closePath(); g.fill();
  box(g, 0, 168, W, 3, '#3A362E'); box(g, 0, 171, W, 1, FL[3]);
  for (const [sx, sy] of [[200, 196], [240, 184], [70, 206]]) box(g, sx, sy, 12, 1, FL[0]);
  // (a poster: SAFETY FIRST, a cartoon raptor in a hard hat; its corner curling)
  slab(g, 120, 46, 44, 58, '#F1EFEA');
  box(g, 122, 48, 40, 10, '#15803D'); signText(g, 'SAFETY', 142, 56, print(4, '#FFFFFF'));
  box(g, 128, 64, 22, 14, '#6ABA4A'); box(g, 146, 58, 12, 10, '#6ABA4A'); box(g, 154, 62, 4, 2, '#1A0B06'); box(g, 146, 56, 12, 4, '#F2C23A'); box(g, 148, 54, 8, 2, '#F2C23A');
  box(g, 132, 78, 3, 10, '#4A8A34'); box(g, 142, 78, 3, 10, '#4A8A34'); box(g, 122, 68, 8, 4, '#4A8A34');
  signText(g, 'FIRST', 142, 100, print(4, '#B91C1C'));
  box(g, 158, 98, 6, 6, '#C8C4B8'); box(g, 158, 98, 6, 1, '#8A8478');
  box(g, 121, 46, 2, 2, '#8A8E96'); box(g, 161, 46, 2, 2, '#8A8E96');
  // The window (its frame; the view's drawn live)
  slab(g, 12, 32, 100, 84, '#D6D3D1');
  box(g, 16, 36, 92, 76, INK);
  box(g, 10, 114, 104, 6, '#A8A29E');
  // The board: DAYS WITHOUT INCIDENT, number cards hung on hooks
  sign(g, 128, 8, 116, 30, '#F8FAFC', '', INK, 6, '#1E3A8A');
  signAt(g, 'DAYS WITHOUT', 186, 18, 5, enamel(5, '#1E3A8A'));
  signAt(g, 'AN INCIDENT', 186, 25, 5, enamel(5, '#1E3A8A'));
  for (let i = 0; i < 4; i++) { box(g, 162 + i * 13, 27, 11, 9, INK); box(g, 163 + i * 13, 28, 9, 7, '#FFFFFF'); signText(g, '4380'[i], 167 + i * 13, 35, print(5, '#B91C1C')); }
  // (a calendar, still on 1997)
  slab(g, 258, 6, 26, 30, '#F8FAFC'); box(g, 258, 6, 26, 8, '#B91C1C'); signText(g, '1997', 271, 14, print(4, '#FFFFFF'));
  for (let r = 0; r < 3; r++) for (let q = 0; q < 4; q++) box(g, 261 + q * 6, 17 + r * 6, 4, 4, '#D4D4D8');
  // The console: the DINOSAUR MODE panel, its labels, its buttons and screens (the switch and lamps are live)
  slab(g, 172, 56, 146, 104, '#52525B');
  slab(g, 180, 62, 130, 92, '#71717A');
  sign(g, 196, 66, 98, 12, '#18181B', 'DINOSAUR MODE', '#FDE047', 6, INK, led(6, '#FDE047', '#18181B'));
  signAt(g, 'FRIENDLY', 212, 148, 5, enamel(5, '#4ADE80', INK));
  signAt(g, 'HOSTILE', 280, 148, 5, enamel(5, '#F87171', INK));
  for (let i = 0; i < 5; i++) { box(g, 186 + i * 5, 86, 3, 3, ['#4ADE80', '#FDE047', '#4ADE80', '#60A5FA', '#4ADE80'][i]); }
  box(g, 270, 84, 34, 22, INK); box(g, 271, 85, 32, 20, '#0F2A1A'); for (let r = 0; r < 4; r++) box(g, 273, 88 + r * 4, 10 + ((r * 7) % 16), 1, '#4ADE80');
  // (a sticky note on it, in pen: DON'T TOUCH)
  box(g, 183, 94, 32, 18, '#FDE68A'); signText(g, "DON'T", 199, 103, print(4, '#1E3A8A')); signText(g, 'TOUCH', 199, 111, print(4, '#1E3A8A'));
  // The desk under it, a coffee maker, a mug, a mini fridge (a magnet: a T. rex)
  slab(g, 160, 156, 170, 12, '#8A6A44');
  slab(g, 300, 120, 20, 36, '#27272A'); box(g, 304, 140, 12, 12, '#7F1D1D'); box(g, 304, 140, 12, 3, '#B45309');
  slab(g, 6, 128, 40, 42, '#E7E5E4'); box(g, 8, 146, 36, 1, '#A8A29E'); box(g, 38, 132, 3, 10, '#A8A29E'); box(g, 14, 134, 6, 6, '#16A34A');
  // (the bucket his boots are up on)
  slab(g, 150, 176, 22, 22, '#71717A'); box(g, 150, 176, 22, 3, '#A1A1AA');
  pole(g, 330, 0, 6, 170, '#9CA3AF');
};
