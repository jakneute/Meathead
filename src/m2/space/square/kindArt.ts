// The outdoors' enemies, drawn (the first pass: readable, on Spooky Land's one person drawer, costume.ts, so whoever's
// in the costume shows: their skin at the hands and the face, their build, their hair). Futureland's cast:
//   cadet     a silver jumpsuit with a lightning bolt on the chest, fins on the shoulders, a fishbowl helmet, a red
//             plastic toy ray gun
//   robot     a cardboard robot suit sprayed silver (taped at the seams), dryer-hose arms, a face window, an antenna
//             with a live spark ball on top (don't dive kick it)
//   guard     park security: a navy shirt and a FUTURE SECURITY cap, on the HOVER-PATROL (a two-wheel scooter in a
//             skirt: the wheels show), a stun baton out in front
//   jetpack   a show performer in gold lame with a big two-tank jetpack, legs dangling, a brick of astronaut ice cream
//   rover     ROVER-1, the robot dog from the old show, got loose: a chrome box on legs, antenna ears, one red eye
// Feet at the origin, facing right (the engine mirrors them). Each frame's painted once into a stamp (putFrame).

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Mood, type Body, type Frame, INK, dk, lt, mix, part, partTop, px, limb, ball, dither,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, glasses, hairTop, hairBack, frameOf, putFrame, pickOf,
  moodOf, reaction, isHeldPose,
} from '../../spooky/costume';

type Ctx = CanvasRenderingContext2D;

const moving = (e: Enemy, min = 0.3): Pose => (Math.abs(e.vel.x) > min ? 'walk' : 'stand');
const as = (e: Enemy, pose: Pose): { pose: Pose; md: Mood } => reaction(e) ?? { pose, md: moodOf(e) };

/** Their own head (hair, head, face, whiskers, glasses). */
const ownHead = (g: Ctx, B: Body, F: Frame, eyes: 'open' | 'angry' | 'wide' | 'tired', mouth: 'flat' | 'frown' | 'teeth' | 'grin' | 'o' | 'smile') => {
  hairBack(g, B);
  headShape(g, B, B.L.skin);
  faceOn(g, B, { skin: B.L.skin, eyes, mouth, md: F.md, blink: F.blink });
  whiskers(g, B); glasses(g, B);
  hairTop(g, B);
};
const angry = (p: Pose) => p === 'tell' || p === 'strike';

// ---------------------------------------------------------------------------------------------------------------
// The space cadet

const SUITS = ['#C9D1DB', '#D9D2E9', '#CDE3E0', '#E2D6C2'];
const STRIPES = ['#DC2626', '#2563EB', '#DB2777', '#EA580C'];
/** A toy ray gun (red plastic, a yellow ring nozzle), its grip at (x, y), pointing right. */
export const toyGun = (g: Ctx, x: number, y: number, glow = 0) => {
  part(g, () => g.roundRect(x - 2, y - 6, 15, 7, 3), '#DC2626', x - 2, y - 6, 15, 7, 1);
  part(g, () => g.rect(x - 1, y - 1, 4, 7), '#B91C1C', x - 1, y - 1, 4, 7, 1);
  for (let k = 0; k < 3; k++) part(g, () => g.ellipse(x + 15 + k * 3, y - 2.5, 1.6, 3.6 - k * 0.6, 0, 0, Math.PI * 2), '#FACC15', x + 13 + k * 3, y - 6, 4, 7, 0.8);
  if (glow > 0) { g.fillStyle = `rgba(167, 243, 208, ${0.4 + glow * 0.5})`; g.beginPath(); g.arc(x + 22, y - 2.5, 3 + glow * 4, 0, Math.PI * 2); g.fill(); }
};
const paintCadet = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const suit = pickOf(F.seed, 2, SUITS), stripe = pickOf(F.seed, 4, STRIPES);
  legs(g, B, { col: suit, shoe: 'boot', shoeCol: '#F5F5F4' });
  const fl = flailHands(B, F.fr);
  const aim = F.pose === 'tell' || F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : aim ? [B.w / 2 + 6, B.shY + 10] : [-B.w / 2 - 2, -30];
  const near: [number, number] = fl ? fl[1] : aim ? [B.w / 2 + 16, B.shY + 6] : F.pose === 'walk' ? [B.w / 2 + 3, -33] : [B.w / 2 + 2, -31];
  arm(g, B, -1, far[0], far[1], { sleeve: dk(suit, 0.1), hand: '#F5F5F4' });
  torso(g, B, suit);
  // (the belt, the lightning bolt on the chest)
  px(g, -B.hipW / 2, B.hipY - 2, B.hipW + 2, 3, '#27272A');
  part(g, () => g.rect(-3, B.hipY - 3, 6, 5), '#FACC15', -3, B.hipY - 3, 6, 5, 0.7);
  part(g, () => { g.moveTo(1, B.shY + 4); g.lineTo(-4, B.shY + 13); g.lineTo(1, B.shY + 12); g.lineTo(-2, B.shY + 21); g.lineTo(6, B.shY + 9); g.lineTo(1, B.shY + 10); g.lineTo(4, B.shY + 4); g.closePath(); }, stripe, -4, B.shY + 4, 10, 17, 0.8);
  // (a zip down the front)
  for (let y = B.shY + 3; y < B.hipY - 3; y += 3) px(g, 5, y, 1, 1, dk(suit, 0.3));
  // (the fins on the shoulders)
  for (const s of [-1, 1]) part(g, () => { const x = s * (B.w / 2 - 2); g.moveTo(x - 4, B.shY + 2); g.lineTo(x + s * 2, B.shY - 9); g.lineTo(x + 5 * s + 2, B.shY + 3); g.closePath(); }, stripe, s * (B.w / 2) - 6, B.shY - 9, 12, 12, 0.9);
  ownHead(g, B, F, angry(F.pose) ? 'angry' : 'open', F.pose === 'strike' ? 'teeth' : 'flat');
  // (the fishbowl: a glass ball round the head, a collar ring, the glint)
  const { hx, hy } = B, R = B.rx + 5.5;
  // (the glass: tinted, a deeper tint round its lower rim (dithered), the sky's glint up top, a second little one)
  g.fillStyle = 'rgba(186, 230, 253, 0.26)'; g.beginPath(); g.arc(hx, hy - 1, R, 0, Math.PI * 2); g.fill();
  g.save(); g.beginPath(); g.arc(hx, hy - 1, R, 0, Math.PI * 2); g.clip();
  dither(g, hx - R, hy + R * 0.25, R * 2, R, 'rgba(125, 211, 252, 0.55)');
  g.fillStyle = 'rgba(125, 211, 252, 0.3)'; g.beginPath(); g.arc(hx + R * 0.35, hy + R * 0.3, R * 0.7, 0, Math.PI * 2); g.fill();
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.arc(hx, hy - 1, R, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = '#F0F9FF'; g.lineWidth = 1.6; g.beginPath(); g.arc(hx, hy - 1, R - 3, Math.PI * 1.1, Math.PI * 1.45); g.stroke();
  g.strokeStyle = '#BAE6FD'; g.lineWidth = 1; g.beginPath(); g.arc(hx, hy - 1, R - 2, Math.PI * 0.15, Math.PI * 0.4); g.stroke();
  px(g, hx - 5, hy - R + 4, 2, 2, '#FFFFFF'); px(g, hx + R * 0.5, hy - R * 0.4, 1, 1, '#FFFFFF');
  // (the collar ring, a little antenna off it, its bulb)
  part(g, () => g.roundRect(hx - R + 2, hy + R - 6, R * 2 - 4, 5, 2), '#9CA3AF', hx - R + 2, hy + R - 6, R * 2 - 4, 5, 1);
  limb(g, hx - R + 5, hy + R - 6, hx - R + 1, hy - R + 2, 1.2, '#71717A');
  ball(g, hx - R + 1, hy - R + 1, 1.8, F.fr % 2 ? '#F87171' : '#FCA5A5', 0.6);
  arm(g, B, 1, near[0], near[1], { sleeve: suit, hand: '#F5F5F4' });
  if (!fl) toyGun(g, near[0] - 1, near[1] + 2, F.pose === 'tell' ? F.t : F.pose === 'strike' ? 1 : 0);
  void L;
};
export const drawCadet = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = as(e, e.aiState === 'aim' ? 'tell' : e.aiState === 'fire' ? 'strike' : moving(e));
  const F = frameOf(seed, f, st.pose, st.md, st.pose === 'tell' ? (e.aiTimer || 0) / 28 : 0, undefined, 'c');
  putFrame(c, 'spc-cadet', F, [-44, -100, 100, 104], g => paintCadet(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The cardboard robot

const BOXES = ['#A8B0BA', '#B5ADA0', '#9FB0B5'];
const hose = (g: Ctx, x1: number, y1: number, x2: number, y2: number, col: string) => {
  limb(g, x1, y1, x2, y2, 8, col);
  const n = 6;
  g.strokeStyle = dk(col, 0.35); g.lineWidth = 1;
  for (let k = 1; k < n; k++) { const x = x1 + ((x2 - x1) * k) / n, y = y1 + ((y2 - y1) * k) / n, d = Math.hypot(x2 - x1, y2 - y1) || 1, nx = -(y2 - y1) / d, ny = (x2 - x1) / d; g.beginPath(); g.moveTo(x - nx * 4, y - ny * 4); g.lineTo(x + nx * 4, y + ny * 4); g.stroke(); }
};
const paintRobot = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose === 'strike' ? 'tell' : F.pose, F.fr), L = B.L;
  g.scale(1.12, 1.12); g.translate(0, -5);
  const card = pickOf(F.seed, 2, BOXES);
  legs(g, B, { col: '#94A3B8', shoe: 'platform', shoeCol: '#E5E7EB' });
  const fl = flailHands(B, F.fr);
  // (the arms: up for the tell, windmilling for the strike (by frame), else hanging stiff)
  const spinA = F.fr * 1.3 + F.t * 6;
  const hands: [number, number][] = fl ? fl
    : F.pose === 'tell' ? [[-18, B.shY - 26], [20, B.shY - 28]]
      : F.pose === 'strike' ? [[Math.cos(spinA) * 30, B.shY + 4 + Math.sin(spinA) * 30], [Math.cos(spinA + Math.PI) * 32, B.shY + 4 + Math.sin(spinA + Math.PI) * 30]]
        : [[-20, -34 + (F.fr % 2)], [22, -34 - (F.fr % 2)]];
  const sh = (s: -1 | 1) => [s * 16, B.shY + 6] as const;
  hose(g, sh(-1)[0], sh(-1)[1], hands[0][0], hands[0][1], '#B8BEC6');
  ball(g, hands[0][0], hands[0][1], 5, '#71717A', 1.1);
  // (the box: the body, taped at the seams; the dials and a vent on the front)
  const top = B.shY - 4, bot = B.hipY + 6;
  part(g, () => g.rect(-19, top, 38, bot - top), card, -19, top, 38, bot - top, 1.4);
  px(g, -19, top + (bot - top) / 2, 38, 3, '#D6C9A3'); px(g, -19, top + (bot - top) / 2, 38, 1, '#EDE3C4');
  // (more tape: down the corners, an X over a dent; ROBOT in marker, the spray paint gone thin at the foot)
  px(g, -19, top, 3, bot - top, '#D6C9A3'); px(g, 16, top, 3, bot - top, '#C2B48C');
  g.strokeStyle = '#D6C9A3'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(8, bot - 12); g.lineTo(15, bot - 4); g.moveTo(15, bot - 12); g.lineTo(8, bot - 4); g.stroke();
  dither(g, -17, bot - 6, 32, 5, '#B8A880');
  g.strokeStyle = '#1E3A8A'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-14, bot - 9); g.lineTo(-12, bot - 13); g.lineTo(-10, bot - 9); g.moveTo(-8, bot - 13); g.lineTo(-8, bot - 9); g.lineTo(-6, bot - 9); g.stroke();
  for (let k = 0; k < 3; k++) ball(g, -9 + k * 9, top + 9, 3, ['#DC2626', '#FACC15', '#22C55E'][k], 0.8);
  for (let k = 0; k < 4; k++) px(g, -10, top + 18 + k * 3, 20, 1, dk(card, 0.4));
  part(g, () => g.rect(-12, top + 31, 24, 4), '#3F3F46', -12, top + 31, 24, 4, 0.8);
  // (the head box, its face window: who's in there)
  const hx = B.hx, hy = B.hy - 2;
  part(g, () => g.rect(hx - 15, hy - 14, 30, 26), card, hx - 15, hy - 14, 30, 26, 1.4);
  g.save(); g.beginPath(); g.rect(hx - 9, hy - 8, 18, 14); g.clip();
  g.fillStyle = L.skin; g.fillRect(hx - 9, hy - 8, 18, 14);
  faceOn(g, { ...B, hy: hy - 1 }, { skin: L.skin, eyes: angry(F.pose) ? 'angry' : 'tired', mouth: F.pose === 'strike' ? 'teeth' : 'flat', md: F.md, blink: F.blink });
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 1.2; g.strokeRect(hx - 9, hy - 8, 18, 14);
  // (the window's foil trim, a strip of tape across the top of the head)
  g.strokeStyle = '#E5E7EB'; g.lineWidth = 1; g.strokeRect(hx - 10.5, hy - 9.5, 21, 17);
  px(g, hx - 15, hy - 14, 30, 3, '#D6C9A3'); px(g, hx - 15, hy - 14, 30, 1, '#EDE3C4');
  // (the antenna: a spring, the live ball on top)
  g.strokeStyle = '#52525B'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(hx, hy - 14); for (let k = 0; k < 5; k++) g.lineTo(hx + (k % 2 ? 3 : -3), hy - 16 - k * 3); g.lineTo(hx, hy - 31); g.stroke();
  ball(g, hx, hy - 33, 4, '#FDE047', 1);
  g.strokeStyle = '#FEF9C3'; g.lineWidth = 1;
  for (let k = 0; k < 4; k++) { const a = k * 1.57 + F.fr; g.beginPath(); g.moveTo(hx + Math.cos(a) * 5, hy - 33 + Math.sin(a) * 5); g.lineTo(hx + Math.cos(a) * 9, hy - 33 + Math.sin(a) * 9); g.stroke(); }
  hose(g, sh(1)[0], sh(1)[1], hands[1][0], hands[1][1], '#C8CED6');
  ball(g, hands[1][0], hands[1][1], 5.5, '#71717A', 1.1);
};
export const drawRobot = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = as(e, e.aiState === 'raise' ? 'tell' : e.aiState === 'spin' ? 'strike' : moving(e, 0.2));
  const F = frameOf(seed, f, st.pose, st.md, 0, undefined, 'r');
  // (the windmill turns by the frame, not the pose's own clock)
  if (st.pose === 'strike') F.fr = Math.floor(f / 3) % 5;
  putFrame(c, 'spc-robot', F, [-56, -128, 116, 132], g => paintRobot(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// Park security, on the HOVER-PATROL

const paintGuard = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, isHeldPose(F.pose) ? F.pose : 'stand', F.fr), L = B.L;
  const riding = !B.held;
  // (stood on the scooter's deck: lifted up off the ground)
  if (riding) g.translate(0, -12);
  legs(g, B, { col: '#1E293B', shoe: 'shoe', shoeCol: '#111827' });
  const fl = flailHands(B, F.fr);
  const rush = F.pose === 'strike', tell = F.pose === 'tell';
  // (both hands on the handlebar; the near one has the baton out front when it's coming)
  const bar: [number, number] = [B.w / 2 + 10, B.shY + 12];
  arm(g, B, -1, fl ? fl[0][0] : bar[0] - 2, fl ? fl[0][1] : bar[1], { sleeve: '#1E3A8A', hand: L.skin, len: 0.55 });
  torso(g, B, '#1E3A8A');
  px(g, -B.hipW / 2, B.hipY - 2, B.hipW + 2, 3, '#111827');
  ball(g, 4, B.shY + 9, 2.4, '#FACC15', 0.8);
  px(g, -6, B.shY + 7, 6, 2, '#E5E7EB');
  ownHead(g, B, F, tell || rush ? 'angry' : 'open', rush ? 'teeth' : tell ? 'o' : 'flat');
  // (the cap: FUTURE SECURITY, a little rocket on the badge)
  const { hx, hy } = B;
  partTop(g, () => g.roundRect(hx - 9, hy - 13, 18, 8, [4, 4, 0, 0]), '#1E3A8A', hx - 9, hy - 13, 18, 8, 1.1);
  part(g, () => g.roundRect(hx + 4, hy - 7, 10, 3, 1), '#111827', hx + 4, hy - 7, 10, 3, 0.9);
  px(g, hx - 1, hy - 11, 3, 3, '#FACC15');
  const nh: [number, number] = fl ? fl[1] : rush ? [B.w / 2 + 18, B.shY + 8] : bar;
  arm(g, B, 1, nh[0], nh[1], { sleeve: '#1E3A8A', hand: L.skin, len: 0.55 });
  if (!fl && (rush || tell)) {
    // (the stun baton, out in front: the tip crackling when it's coming)
    limb(g, nh[0] - 2, nh[1], nh[0] + 24, nh[1] - 2, 3.2, '#27272A');
    ball(g, nh[0] + 25, nh[1] - 2, 2.6, rush ? '#A5F3FC' : '#71717A', 0.8);
    if (rush) { g.strokeStyle = '#E0F2FE'; g.lineWidth = 1; for (let k = 0; k < 3; k++) { const a = k * 2.1 + F.fr; g.beginPath(); g.moveTo(nh[0] + 25, nh[1] - 2); g.lineTo(nh[0] + 25 + Math.cos(a) * 7, nh[1] - 2 + Math.sin(a) * 7); g.stroke(); } }
  }
  if (riding) {
    g.translate(0, 12);
    // (the scooter: a deck, a skirt with HOVER on it (the wheels show under it anyway), the stem, the bar, the light)
    part(g, () => g.roundRect(-22, -16, 46, 8, 3), '#E5E7EB', -22, -16, 46, 8, 1.2);
    part(g, () => { g.moveTo(-24, -10); g.lineTo(26, -10); g.lineTo(22, -3); g.lineTo(-20, -3); g.closePath(); }, '#F472B6', -24, -10, 50, 7, 1.1);
    g.font = '5px "Press Start 2P"'; g.fillStyle = '#FFFFFF'; g.textAlign = 'center'; g.fillText('HOVER', 1, -4); g.textAlign = 'left';
    for (const wx of [-14, 16]) { ball(g, wx, -3, 3.4, '#27272A', 1); px(g, wx - 1, -4, 2, 2, '#71717A'); }
    limb(g, 18, -16, bar[0] + 2, bar[1] - 12 + 12, 3, '#9CA3AF');
    part(g, () => g.roundRect(bar[0] - 3, bar[1] - 2 + 0, 8, 3, 1), '#27272A', bar[0] - 3, bar[1] - 2, 8, 3, 0.8);
    // (the siren light on the stem: flashing for the tell and the rush)
    const on = (tell || rush) && F.fr % 2 === 0;
    ball(g, 20, B.shY + 24 + 12 - 12, 3, on ? '#F87171' : '#7F1D1D', 0.9);
  }
};
export const drawGuard = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = as(e, e.aiState === 'siren' ? 'tell' : e.aiState === 'rush' ? 'strike' : 'stand');
  const F = frameOf(seed, f, st.pose, st.md, 0, undefined, 'g');
  if (st.pose === 'tell' || st.pose === 'strike') F.fr = Math.floor(f / 6) % 2;
  putFrame(c, 'spc-guard', F, [-44, -110, 104, 114], g => paintGuard(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The jetpacker

const paintJetpack = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, isHeldPose(F.pose) ? F.pose : 'stand', F.fr);
  const suit = '#D4A72C';
  // (the jetpack, behind: two tanks, a fin)
  for (const k of [0, 1]) part(g, () => g.roundRect(-B.w / 2 - 10 + k * 7, B.shY - 4, 9, 30, 4), '#9CA3AF', -B.w / 2 - 10 + k * 7, B.shY - 4, 9, 30, 1.2);
  part(g, () => { g.moveTo(-B.w / 2 - 12, B.shY + 26); g.lineTo(-B.w / 2 - 16, B.shY + 34); g.lineTo(-B.w / 2 - 4, B.shY + 26); g.closePath(); }, '#DC2626', -B.w / 2 - 16, B.shY + 26, 12, 8, 1);
  // (the tanks' bands and caps; the nozzles under them)
  for (const k of [0, 1]) { const tx = -B.w / 2 - 10 + k * 7; px(g, tx + 1, B.shY + 6, 7, 2, '#DC2626'); px(g, tx + 1, B.shY + 18, 7, 2, '#DC2626'); ball(g, tx + 4.5, B.shY - 4, 2.5, '#E5E7EB', 0.7); part(g, () => { g.moveTo(tx + 1, B.shY + 26); g.lineTo(tx + 8, B.shY + 26); g.lineTo(tx + 9, B.shY + 30); g.lineTo(tx, B.shY + 30); g.closePath(); }, '#52525B', tx, B.shY + 26, 9, 4, 0.8); }
  // (legs dangling, toes down)
  if (!B.held) { B.feet = [-3, 4]; B.lift = [3 + (F.fr % 2), 1 + ((F.fr + 1) % 2)]; }
  legs(g, B, { col: suit, shoe: 'boot', shoeCol: '#F5F5F4' });
  const fl = flailHands(B, F.fr), tell = F.pose === 'tell';
  arm(g, B, -1, fl ? fl[0][0] : -B.w / 2 + 2, fl ? fl[0][1] : B.shY + 18, { sleeve: dk(suit, 0.1), hand: '#F5F5F4' });
  torso(g, B, suit);
  // (the harness straps, the chest box with its two buttons)
  px(g, -B.w / 2 + 3, B.shY + 1, 3, 22, '#27272A'); px(g, B.w / 2 - 6, B.shY + 1, 3, 22, '#27272A');
  part(g, () => g.rect(-5, B.shY + 8, 11, 8), '#52525B', -5, B.shY + 8, 11, 8, 0.9);
  ball(g, -2, B.shY + 12, 1.3, '#EF4444', 0.5); ball(g, 3, B.shY + 12, 1.3, '#22C55E', 0.5);
  ownHead(g, B, F, tell ? 'angry' : 'open', tell ? 'grin' : 'smile');
  // (the goggles up on the forehead, a leather cap)
  const { hx, hy } = B;
  partTop(g, () => g.roundRect(hx - 9.5, hy - 12, 19, 9, [5, 5, 1, 1]), '#78350F', hx - 9.5, hy - 12, 19, 9, 1.1);
  for (const s of [-1, 1]) ball(g, hx + 2 + s * 4, hy - 7, 2.6, '#7DD3FC', 0.9);
  // (the near hand: the ice cream brick, up over the shoulder for the throw)
  const nh: [number, number] = fl ? fl[1] : tell ? [B.hx - 4, B.hy - 16] : [B.w / 2 + 6, B.shY + 16];
  arm(g, B, 1, nh[0], nh[1], { sleeve: suit, hand: '#F5F5F4' });
  if (!fl) iceCream(g, nh[0] + 2, nh[1] - 5);
};
/** A brick of freeze-dried astronaut ice cream (pink, white, brown: the foil peeled back). */
export const iceCream = (g: Ctx, x: number, y: number) => {
  px(g, x - 5, y - 3, 10, 7, INK);
  px(g, x - 4, y - 2, 3, 5, '#F9A8D4'); px(g, x - 1, y - 2, 3, 5, '#FEF3C7'); px(g, x + 2, y - 2, 2, 5, '#92400E');
  px(g, x - 5, y + 2, 10, 3, '#CBD5E1');
};
export const drawJetpack = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = as(e, e.aiState === 'windup' ? 'tell' : 'fly');
  const F = frameOf(seed, f, st.pose, st.md, 0, undefined, 'j');
  putFrame(c, 'spc-jetpack', F, [-44, -100, 100, 104], g => paintJetpack(g, F));
  // (the thrust under it, live: flickering)
  if (e.health > 0 && !e.isBlownAway) {
    // (the thrust: flickering, in stepped bands: an orange shell, yellow, a white core; a puff of smoke now and then)
    const fl = 10 + ((f >> 1) % 3) * 5;
    for (const [k, col] of [[1, '#EA580C'], [0.75, '#FB9440'], [0.5, '#FDE68A'], [0.25, '#FFFFFF']] as const) {
      c.fillStyle = col; c.beginPath(); c.moveTo(-16 - 6 * k, -40); c.lineTo(-16, -40 + (fl + 8) * k + 2); c.lineTo(-16 + 6 * k, -40); c.fill();
    }
    if ((f >> 3) % 4 === 0) { c.fillStyle = 'rgba(203, 213, 225, 0.5)'; c.fillRect(-19, -40 + 24 + (f % 8), 6, 4); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// ROVER-1, the robot dog

const paintRover = (g: Ctx, fr: number, md: Mood, yap: boolean) => {
  const steel = '#CBD5E1';
  // (legs: four stiff struts, trotting)
  for (const [x, k] of [[-10, 0], [-4, 1], [6, 1], [12, 0]] as const) { const fx = x + ((fr + k) % 2 ? 2 : -2); limb(g, x, -10, fx, -1, 2.6, k ? '#475569' : '#64748B'); px(g, fx - 2, -2, 4, 2, '#27272A'); ball(g, x, -10, 1.6, '#94A3B8', 0.5); }
  // (the body: a chrome box, a tail aerial)
  part(g, () => g.roundRect(-15, -20, 30, 12, 3), steel, -15, -20, 30, 12, 1.2);
  px(g, -10, -15, 18, 1, dk(steel, 0.3));
  // (its panel: rivets, a red decal stripe, grime dithered along its belly)
  for (const rx of [-13, -6, 1, 8]) px(g, rx, -19, 1, 1, dk(steel, 0.45));
  px(g, -12, -13, 10, 2, '#DC2626'); px(g, -12, -13, 10, 1, '#F87171');
  dither(g, -14, -11, 28, 2, dk(steel, 0.35));
  g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-14, -18); g.lineTo(-20, -26 + (fr % 2) * 2); g.stroke();
  ball(g, -20, -27 + (fr % 2) * 2, 1.6, '#EF4444', 0.6);
  // (the head: a round bucket, antenna ears, the red eye, the mouth grille: open for a yap)
  part(g, () => g.roundRect(9, -28, 15, 13, 4), lt(steel, 0.1), 9, -28, 15, 13, 1.2);
  for (const x of [11, 19]) { g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(x, -28); g.lineTo(x - 1, -33); g.stroke(); ball(g, x - 1, -34, 1.3, '#94A3B8', 0.5); }
  if (md !== 'dead') { g.fillStyle = 'rgba(239, 68, 68, 0.25)'; g.beginPath(); g.arc(19, -23, 5, 0, Math.PI * 2); g.fill(); }
  ball(g, 19, -23, 2.3, md === 'dead' ? '#3F3F46' : '#EF4444', 0.8);
  px(g, 15, yap ? -18 : -17, 8, yap ? 3 : 1.4, INK);
  void mix;
};
export const drawRover = (c: Ctx, e: Enemy, f: number) => {
  const md = moodOf(e), fr = Math.abs(e.vel.x) > 0.3 ? Math.floor(f / 4) % 2 : 0, yap = e.aiState === 'yap' && (f >> 2) % 2 === 0;
  c.save(); c.translate(0, 0);
  // (small and cheap: drawn live)
  paintRover(c, fr, md, yap);
  c.restore();
};
