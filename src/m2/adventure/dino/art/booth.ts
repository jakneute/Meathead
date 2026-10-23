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
import { signAt, signText, enamel, print, led, type Look } from '../../letters';
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

/** The poster on the wall by the window: a vintage workplace-safety print, SAFETY FIRST over a sunburst, the park's
 *  grinning raptor mascot in its yellow hard hat with a worker's legs kicking out of its jaws (one boot already off,
 *  his own orange hat in the dirt, a puddle), FIRST under it. Sun-faded from the top down, its top-right corner folded
 *  over, the bottom-left torn away (a scrap left under the tack), taped at one corner, nailed at two, the nails
 *  rusting down it and down the wall, foxed, grimy where hands have been. Flat on the back wall (the room's straight on). */
const safetyPoster = (g: Ctx) => {
  const X0 = 120, Y0 = 46, W = 44, H = 58;
  // (the paper's outline: the bottom-left torn away in steps, the top-right folded down)
  const TEAR = [1, 2, 2, 4, 5, 5, 7, 8];
  const left = (y: number) => (y >= H - 8 ? TEAR[y - (H - 8)] : 0);
  const right = (y: number) => (y < 4 ? W - 3 + y : W);
  const inPaper = (x: number, y: number) => y >= 0 && y < H && x >= left(y) && x < right(y);
  // (its shadow on the block, down and to the right)
  for (let y = 0; y < H; y++) box(g, X0 + left(y) + 1, Y0 + y + 1, right(y) - left(y), 1, 'rgba(20, 34, 22, 0.32)');
  // (the paper: sun-faded toward the top, banded in three tones, a dithered row at each seam; foxed here and there)
  const P = ['#F4EEDC', '#EBE2C8', '#DFD4B4'];
  for (let y = 0; y < H; y++) {
    const band = y < 22 ? 0 : y < 42 ? 1 : 2, seam = y === 22 || y === 42;
    box(g, X0 + left(y), Y0 + y, right(y) - left(y), 1, P[band]);
    if (seam) for (let x = left(y); x < right(y); x++) if ((x + y) % 2) box(g, X0 + x, Y0 + y, 1, 1, P[band - 1]);
  }
  // (the torn edge: white fibers along it, and the stepped edge's shadow)
  for (let y = H - 8; y < H; y++) { box(g, X0 + left(y), Y0 + y, 1, 1, '#FFFFFA'); }
  box(g, X0, Y0 + H - 8, 1, 1, '#C4B794');
  // (the paper's edge, a shade darker where it's curled off the wall)
  box(g, X0 + W - 1, Y0 + 4, 1, H - 4, '#CFC3A2');
  for (let x = left(H - 1); x < W; x++) box(g, X0 + x, Y0 + H - 1, 1, 1, '#CFC3A2');

  // The masthead: a green band, cream rules inset, SAFETY in fat sunshine letters with a drop shadow
  const BX = 122, BY = 48, BW = 40, BH = 18;
  const GR = ['#0E4A24', '#17693A', '#1E7F45', '#2E9656', '#5DB27A'];
  box(g, BX, BY, BW, BH, GR[2]); box(g, BX, BY, BW, 1, GR[3]); box(g, BX, BY + BH - 2, BW, 2, GR[1]); box(g, BX, BY + BH - 1, BW, 1, GR[0]);
  checker(g, BX, BY + 1, BW, 1, GR[3], 0, 1); checker(g, BX, BY + BH - 3, BW, 1, GR[1], 1, 1);
  // (sun-bleached: the band's top paler, dithered into it)
  checker(g, BX, BY + 1, BW, 3, GR[4], 1, 1); checker(g, BX, BY + 4, BW, 1, GR[3], 0, 1);
  box(g, BX + 1, BY + 1, BW - 2, 1, '#E8DFC0'); box(g, BX + 1, BY + BH - 2, BW - 2, 1, '#C8BE9A');
  box(g, BX + 1, BY + 1, 1, BH - 2, '#E8DFC0'); box(g, BX + BW - 2, BY + 1, 1, BH - 2, '#C8BE9A');
  const sunny: Look = { sx: 1, sy: 2, fill: ['#FFFDF0', '#FFF0A8', '#FBD54A', '#F2B42A', '#C8861A'], dither: true, shadow: '#082E16', drop: 1 };
  signText(g, 'SAFETY', 142, 64, sunny);

  // The picture: a frame, a rising sun's rays behind (two tones, banded), the ground
  const AX = 123, AY = 68, AW = 38, AH = 19;
  box(g, AX - 1, AY - 1, AW + 2, AH + 2, '#5A4426');
  const RAY = ['#F9E3AA', '#F3C77C'];
  for (let y = 0; y < AH; y++) for (let x = 0; x < AW; x++) {
    const dx = x - 17, dy = y - 19, r = Math.hypot(dx, dy);
    const a = Math.atan2(dy, dx), ray = Math.floor(((a + Math.PI) / Math.PI) * 14) % 2;
    let col = r < 7 ? '#FBD66A' : r < 8.5 ? ((x + y) % 2 ? '#FBD66A' : RAY[ray]) : RAY[ray];
    if (y < 3 && (x + y) % 2) col = '#FAEBC4';
    box(g, AX + x, AY + y, 1, 1, col);
  }
  box(g, AX, AY + AH - 2, AW, 2, '#B08A56'); box(g, AX, AY + AH - 2, AW, 1, '#C8A46A'); checker(g, AX, AY + AH - 3, AW, 1, '#C8A46A', 0, 1);
  const p = (x: number, y: number, w: number, h: number, col: string) => box(g, AX + x, AY + y, w, h, col);
  const RG = ['#2C5E22', '#3E7E2E', '#5FAF45', '#8FD46A', '#C4EE9A'];
  const JN = ['#243C66', '#3A5E96', '#5A82BE'];
  // (the blood: run off the jaw and pooled under it, dark at the rim)
  p(4, 17, 16, 1, '#7A0E0E'); p(6, 16, 12, 1, '#B81818'); p(7, 16, 8, 1, '#D42A22'); p(9, 16, 2, 1, '#FF8A7A');
  // (his own hard hat, knocked off: on its side by the tail)
  p(31, 14, 7, 4, INK); p(32, 14, 5, 3, '#F07A1A'); p(32, 14, 2, 1, '#FFB070'); p(35, 16, 2, 1, '#B0500E'); p(30, 17, 8, 1, INK);
  // (the far leg, behind: in the dark ramp)
  p(28, 12, 4, 4, INK); p(29, 13, 2, 2, RG[0]); p(28, 15, 3, 3, INK); p(29, 15, 1, 2, RG[0]); p(26, 17, 7, 1, INK);
  // (the tail, out behind, tapering; lit along its top)
  p(29, 6, 6, 5, INK); p(30, 7, 5, 3, RG[2]); p(30, 7, 5, 1, RG[3]); p(30, 9, 5, 1, RG[1]);
  p(34, 6, 4, 3, INK); p(35, 7, 3, 1, RG[2]); p(37, 5, 1, 2, INK);
  // (the body: the ramp down it, a dithered seam, the belly cream)
  p(18, 6, 13, 9, INK); p(19, 7, 11, 7, RG[2]); p(19, 7, 11, 1, RG[3]); p(20, 7, 4, 1, RG[4]);
  p(19, 12, 11, 2, RG[1]); checker(g, AX + 19, AY + 11, 11, 1, RG[1], 1, 1);
  p(20, 10, 7, 3, '#E6DCA0'); p(20, 10, 7, 1, '#F4ECC0'); p(20, 12, 7, 1, '#C8BC7E');
  for (const sx of [22, 25, 28]) p(sx, 8, 1, 1, RG[1]);
  // (the near leg: a fat thigh, the shin, the foot's claws in the dirt)
  p(21, 11, 7, 5, INK); p(22, 12, 5, 3, RG[2]); p(22, 12, 5, 1, RG[3]); p(22, 14, 5, 1, RG[1]);
  p(22, 15, 3, 3, INK); p(23, 15, 1, 2, RG[1]); p(19, 17, 8, 1, INK); p(19, 16, 1, 1, '#F4F0E0'); p(26, 16, 1, 1, '#F4F0E0');
  // (the neck, up and forward)
  p(14, 4, 7, 7, INK); p(15, 5, 5, 5, RG[2]); p(15, 5, 5, 1, RG[3]); p(19, 6, 1, 4, RG[1]);
  // (the head, in profile facing left: the snout, the grin, the wink)
  p(4, 2, 14, 8, INK); p(5, 3, 12, 6, RG[2]); p(5, 3, 12, 1, RG[3]); p(6, 3, 5, 1, RG[4]); p(3, 4, 1, 4, INK);
  p(6, 5, 1, 1, RG[0]); // (the nostril)
  p(13, 4, 1, 1, INK); p(14, 3, 2, 1, INK); p(16, 4, 1, 1, INK); // (the wink: shut, a happy ^)
  p(15, 6, 2, 1, '#F08080'); // (a rosy cheek)
  // (the jaws: clamped round a worker's middle; the mouth's red, the teeth, the lower jaw in shade)
  p(4, 7, 12, 1, '#7A1010'); p(4, 8, 13, 1, RG[1]); p(4, 9, 13, 1, INK);
  for (const tx of [5, 8, 11, 14]) p(tx, 6, 1, 1, '#FFFFFF');
  // (a stubby arm, up: a claw's thumbs-up)
  p(16, 9, 3, 3, INK); p(17, 10, 1, 1, RG[2]); p(15, 7, 2, 3, INK); p(15, 8, 1, 1, RG[3]);
  // (his legs: out of the jaws, kicking; jeans, a belt, one work boot, one sock)
  p(5, 7, 4, 7, INK); p(6, 8, 2, 6, JN[1]); p(6, 8, 1, 6, JN[2]); p(7, 9, 1, 4, JN[0]);
  p(2, 12, 6, 4, INK); p(3, 13, 4, 2, '#6A4424'); p(3, 13, 2, 1, '#8A5E34'); p(2, 15, 6, 1, '#2A1A0E');
  p(9, 7, 4, 6, INK); p(10, 8, 2, 4, JN[1]); p(10, 8, 1, 4, JN[2]);
  p(9, 12, 5, 3, INK); p(10, 12, 3, 2, '#F4F2EA'); p(12, 13, 1, 1, '#E8A888'); // (the sock; a toe through it)
  p(4, 7, 9, 1, '#4A2E14'); p(8, 7, 1, 1, '#D8B040'); // (the belt, its buckle)
  for (const tx of [6, 10]) p(tx, 8, 1, 1, '#FFFFFF'); // (the lower teeth, in over the jeans)
  p(4, 9, 1, 2, '#C81E1E'); p(4, 11, 1, 1, '#E83A2E'); // (a drip off the jaw)
  // (motion lines by the kicking feet)
  p(0, 11, 2, 1, '#8A6A3A'); p(1, 13, 1, 1, '#8A6A3A'); p(14, 11, 2, 1, '#8A6A3A');
  // (the yellow hard hat, on the mascot: a dome, ramped, a ridge down it, the brim)
  p(8, -2, 7, 1, INK); p(7, -1, 9, 3, INK); p(8, -1, 7, 2, '#F2C23A'); p(8, -1, 3, 1, '#FFE680'); p(11, -1, 1, 2, '#C08A1A'); p(14, 0, 1, 1, '#D0981E');
  p(5, 1, 13, 2, INK); p(6, 1, 11, 1, '#E0A82A'); p(6, 1, 3, 1, '#FFD860');

  // FIRST, under it: fat red letters, a dark drop shadow
  const red: Look = { sx: 1, sy: 2, bold: true, fill: ['#F86A54', '#E2382A', '#C42420', '#9A1414', '#6A0A0A'], dither: true, shadow: '#3A0A08', drop: 1 };
  signText(g, 'FIRST', 143, 102, red);

  // Weathering: the sun's fade washed down from the top, dithered out; foxing; grime along the foot; a thumb smudge
  for (let y = 0; y < 20; y++) {
    const a = y < 10 ? 0.16 : 0.08;
    g.fillStyle = `rgba(255, 250, 232, ${a})`;
    for (let x = left(y); x < right(y); x++) if (y < 10 || (x + y) % 2) g.fillRect(X0 + x, Y0 + y, 1, 1);
  }
  const clearOf = (x: number, y: number) => !((y >= 3 && y <= 19 && x >= 2 && x < 42) || (y >= 41 && y <= 57 && x >= 6 && x < 40));
  for (let i = 0; i < 26; i++) {
    const x = (i * 37 + 11) % W, y = (i * 23 + 5) % H;
    if (inPaper(x, y) && clearOf(x, y)) box(g, X0 + x, Y0 + y, 1, 1, i % 3 ? '#CFC09A' : '#B8A57C');
  }
  g.fillStyle = 'rgba(96, 76, 44, 0.22)';
  for (let y = H - 2; y < H; y++) for (let x = left(y); x < W; x++) if ((x + y) % 2 || y === H - 1) g.fillRect(X0 + x, Y0 + y, 1, 1);
  g.fillStyle = 'rgba(70, 58, 36, 0.16)'; g.fillRect(X0 + W - 4, Y0 + 30, 3, 4); g.fillRect(X0 + W - 3, Y0 + 29, 2, 1); g.fillRect(X0 + W - 5, Y0 + 32, 1, 2);
  // (a water ring, half off the bottom-right)
  for (const [rx, ry] of [[39, 55], [40, 54], [41, 54], [42, 55], [38, 56]]) if (inPaper(rx, ry) && clearOf(rx, ry)) box(g, X0 + rx, Y0 + ry, 1, 1, '#C4AE80');

  // The top-right corner, folded down over itself: the paper's back, greyer, lit along the fold, its shadow under
  for (let y = 1; y < 4; y++) {
    box(g, X0 + W - 3, Y0 + y, y, 1, '#C9C0A6');
    box(g, X0 + W - 3 + y - 1, Y0 + y, 1, 1, '#ECE6D2');
  }
  box(g, X0 + W - 3, Y0 + 4, 3, 1, 'rgba(60, 50, 30, 0.3)'); box(g, X0 + W - 4, Y0 + 1, 1, 3, 'rgba(60, 50, 30, 0.18)');
  // (tape across the top-left corner: yellowed, its edges darker)
  for (let k = 0; k < 6; k++) {
    box(g, X0 - 3 + k, Y0 + 2 - k, 5, 1, 'rgba(236, 220, 160, 0.55)');
    box(g, X0 - 3 + k, Y0 + 2 - k, 1, 1, 'rgba(160, 140, 80, 0.5)'); box(g, X0 + 1 + k, Y0 + 2 - k, 1, 1, 'rgba(160, 140, 80, 0.5)');
  }
  // (a scrap of the torn corner still on the wall under its tack)
  box(g, X0, Y0 + H - 3, 3, 3, '#DFD4B4'); box(g, X0, Y0 + H - 3, 1, 1, '#FFFFFA'); box(g, X0 + 1, Y0 + H - 2, 1, 1, '#8A8E96');
  // (the nails, their heads lit, the rust run down from them: down the margin, and off the foot down the wall)
  const nail = (x: number, y: number) => { box(g, x, y, 2, 2, '#3A3A40'); box(g, x, y, 1, 1, '#9AA0A8'); };
  nail(X0, Y0 + 26);
  box(g, X0, Y0 + 28, 1, 7, '#9A5A2A'); box(g, X0 + 1, Y0 + 28, 1, 3, '#B8703A'); box(g, X0, Y0 + 36, 1, 1, '#9A5A2A'); box(g, X0, Y0 + 38, 1, 1, '#B8703A'); box(g, X0 + 1, Y0 + 32, 1, 1, '#C88A50');
  nail(X0 + W - 2, Y0 + H - 3);
  box(g, X0 + W - 2, Y0 + H - 1, 1, 9, 'rgba(140, 74, 30, 0.75)'); box(g, X0 + W - 1, Y0 + H, 1, 4, 'rgba(170, 96, 44, 0.6)');
  box(g, X0 + W - 2, Y0 + H + 10, 1, 1, 'rgba(140, 74, 30, 0.5)'); box(g, X0 + W - 2, Y0 + H + 13, 1, 1, 'rgba(140, 74, 30, 0.35)');
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
  safetyPoster(g);
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
