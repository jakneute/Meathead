// The film crew, drawn (first pass: readable, on Spooky Land's person-in-a-costume drawer, costume.ts, so whoever's
// in the crew blacks shows: their skin, build, hair and face):
//   grip      a black tee, cargo shorts, work gloves, a tool belt; the C-stand (three legs, a pole, the arm) up over
//             the head for the tell, down on him for the strike
//   boom      crew blacks, headphones; the boom pole out front, its fuzzy mic on the end (up, then swung down)
//   runner    a hoodie, a headset with its mic, a walkie on the belt, the lanyard; the coffee cup up for the tell
//   director  a vest over a striped shirt, a scarf, a cap on backwards; the megaphone (up to the mouth for ACTION!)
//   craft     a white apron, a hairnet; a tray, the food in the throwing hand
//   mocap     the black mocap suit with its white dots, the dotted cap, the face camera on its little boom
//   stuntco   a black STUNTS vest, a headset, knee pads, gloves; crouched to set, flat out for the tackle, prone after
// Feet at the origin, facing right (the engine mirrors them). Each frame painted once into a stamp (putFrame).

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, px, limb, ball,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, hairTop, hairBack, glasses, frameOf, putFrame, pickOf, moodOf, reaction,
} from '../../spooky/costume';

type Ctx = CanvasRenderingContext2D;

const moving = (e: Enemy, min = 0.3): Pose => (Math.abs(e.vel.x) > min ? 'walk' : 'stand');
const poseOf = (e: Enemy, tells: string[], strikes: string[]): Pose =>
  tells.includes(e.aiState ?? '') ? 'tell' : strikes.includes(e.aiState ?? '') ? 'strike' : moving(e);
const frameFor = (e: Enemy, f: number, seed: number, pose: Pose, v = '') => {
  const r = reaction(e);
  return frameOf(seed, f, r?.pose ?? pose, r?.md ?? moodOf(e), 0, undefined, v);
};
const BOX: [number, number, number, number] = [-60, -124, 132, 128];
type Eyes = 'open' | 'angry' | 'wide' | 'tired' | 'smug';
type Mouth = 'flat' | 'grin' | 'smile' | 'teeth' | 'o' | 'smirk';
const face = (g: Ctx, B: Body, F: Frame, eyes: Eyes, mouth: Mouth) => {
  headShape(g, B, B.L.skin);
  faceOn(g, B, { skin: B.L.skin, eyes, mouth, md: F.md, blink: F.blink });
};
/** A cap (forward, or on backwards: the peak behind). */
const cap = (g: Ctx, B: Body, col: string, back = false) => {
  const { hx, hy } = B;
  part(g, () => { g.moveTo(hx - 9, hy - 3); g.quadraticCurveTo(hx - 8, hy - 15, hx + 1, hy - 14); g.quadraticCurveTo(hx + 10, hy - 13, hx + 10, hy - 4); g.closePath(); }, col, hx - 9, hy - 15, 19, 12, 1);
  if (back) part(g, () => g.roundRect(hx - 15, hy - 6, 9, 3, 1), dk(col, 0.2), hx - 15, hy - 6, 9, 3, 0.8);
  else part(g, () => g.roundRect(hx + 4, hy - 6, 13, 3, 1), dk(col, 0.2), hx + 4, hy - 6, 13, 3, 0.8);
};
/** A headset: the band over the head, an ear cup, the mic out to the mouth. */
const headset = (g: Ctx, B: Body) => {
  const { hx, hy } = B;
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(hx, hy - 1, 10, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
  ball(g, hx - 8, hy + 1, 3.2, '#27272A', 1);
  g.strokeStyle = '#3F3F46'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(hx - 7, hy + 3); g.quadraticCurveTo(hx - 1, hy + 10, hx + 6, hy + 8); g.stroke();
  px(g, hx + 5, hy + 7, 3, 2, '#18181B');
};
/** The person's own head and hair round a face. */
const head = (g: Ctx, B: Body, F: Frame, eyes: Eyes, mouth: Mouth, hairOn = true) => {
  hairBack(g, B);
  face(g, B, F, eyes, mouth);
  whiskers(g, B);
  glasses(g, B);
  if (hairOn) hairTop(g, B);
};

// ---------------------------------------------------------------------------------------------------------------
// The grip

const cStand = (g: Ctx, x: number, y: number, ang: number) => {
  g.save(); g.translate(x, y); g.rotate(ang);
  limb(g, 0, 10, 0, -40, 2.6, '#A1A1AA');
  // (the legs, folded together at the bottom; the arm off the top, the knuckle)
  for (const s of [-1, 0, 1]) limb(g, 0, 10, s * 7, 22, 2, '#71717A');
  limb(g, 0, -40, 20, -46, 2, '#A1A1AA');
  ball(g, 0, -40, 2.6, '#3F3F46', 0.8);
  g.restore();
};
const paintGrip = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const tee = pickOf(F.seed, 2, ['#18181B', '#27272A', '#1F2937']), glove = '#78716C';
  legs(g, B, { col: '#57534E', shoe: 'boot', shoeCol: '#3F2A14', bareBelow: true });
  const fl = flailHands(B, F.fr);
  const up = F.pose === 'tell', down = F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : up ? [-2, B.shY - 16] : down ? [B.w / 2 + 12, B.shY + 12] : [-B.w / 2 - 2, -31];
  const near: [number, number] = fl ? fl[1] : up ? [4, B.shY - 18] : down ? [B.w / 2 + 16, B.shY + 8] : [B.w / 2 + 3, -33];
  arm(g, B, -1, far[0], far[1], { sleeve: tee, hand: glove, len: 0.4 });
  torso(g, B, tee);
  // (the tool belt: pouches, a roll of tape, the crew tee's name)
  px(g, -B.hipW / 2 - 1, B.hipY - 4, B.hipW + 2, 5, '#78350F');
  px(g, -B.hipW / 2 + 2, B.hipY - 2, 5, 7, '#92400E'); px(g, B.hipW / 2 - 6, B.hipY - 2, 5, 7, '#92400E');
  ball(g, 2, B.hipY, 2.6, '#D6D3D1', 0.7);
  px(g, -4, B.shY + 8, 9, 2, lt(tee, 0.4));
  head(g, B, F, up || down ? 'angry' : 'tired', down ? 'teeth' : 'flat');
  arm(g, B, 1, near[0], near[1], { sleeve: tee, hand: glove, len: 0.4 });
  if (!fl) cStand(g, near[0], near[1], up ? -0.2 : down ? 1.5 : 0.25);
  void L;
};
export const drawGrip = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['raise'], ['slam']));
  putFrame(c, 'hww-grip', F, BOX, g => paintGrip(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The boom op

const BOOM_BOX: [number, number, number, number] = [-60, -200, 320, 204];
const paintBoom = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const blacks = '#18181B';
  legs(g, B, { col: '#27272A', shoe: 'sneaker', shoeCol: '#18181B' });
  const fl = flailHands(B, F.fr);
  const up = F.pose === 'tell', down = F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : [B.w / 2 - 2, B.shY - (up ? 18 : 8)];
  const near: [number, number] = fl ? fl[1] : [B.w / 2 + 10, B.shY - (up ? 10 : 0)];
  arm(g, B, -1, far[0], far[1], { sleeve: blacks, hand: L.skin });
  torso(g, B, blacks);
  head(g, B, F, down ? 'angry' : 'open', up ? 'o' : 'flat');
  // (the headphones: big cans)
  g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.arc(B.hx, B.hy - 1, 10.5, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  ball(g, B.hx - 9, B.hy + 1, 4, '#3F3F46', 1);
  arm(g, B, 1, near[0], near[1], { sleeve: blacks, hand: L.skin });
  if (!fl) {
    // (the pole, out ahead: up for the tell, swung down on the strike; the fuzzy mic on its end)
    const a = up ? -1.05 : down ? 0.2 : -0.55, len = 190;
    const ex = near[0] + Math.cos(a) * len, ey = near[1] + Math.sin(a) * len;
    limb(g, far[0] - 6, far[1] + 2, ex, ey, 2.4, '#A1A1AA');
    part(g, () => g.ellipse(ex + 6, ey + 6, 14, 7, a + 0.3, 0, Math.PI * 2), '#71717A', ex - 8, ey - 2, 28, 16, 1);
    for (let k = 0; k < 6; k++) px(g, ex - 4 + k * 4, ey + 1 + (k % 2) * 6, 1, 3, '#A8A29E');
  }
};
export const drawBoom = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['raise'], ['swing']));
  putFrame(c, 'hww-boom', F, BOOM_BOX, g => paintBoom(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The runner (a PA)

const paintRunner = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const hoodie = pickOf(F.seed, 3, ['#1E3A8A', '#7F1D1D', '#3F6212', '#52525B', '#9D174D']);
  legs(g, B, { col: '#1E293B', shoe: 'sneaker', shoeCol: '#E5E7EB' });
  const fl = flailHands(B, F.fr);
  const aim = F.pose === 'tell';
  const far: [number, number] = fl ? fl[0] : [-B.w / 2 - 2, -30];
  const near: [number, number] = fl ? fl[1] : aim ? [-4, B.shY - 14] : F.pose === 'strike' ? [B.w / 2 + 14, B.shY + 4] : [B.w / 2 + 6, B.shY + 16];
  arm(g, B, -1, far[0], far[1], { sleeve: hoodie, hand: L.skin });
  torso(g, B, hoodie);
  // (the hoodie's pocket and strings; the lanyard and its badge; the walkie on the belt)
  px(g, -6, B.hipY - 10, 12, 6, dk(hoodie, 0.2)); px(g, -2, B.shY + 2, 1, 6, '#F5F5F4'); px(g, 2, B.shY + 2, 1, 6, '#F5F5F4');
  px(g, 4, B.shY + 1, 1, 12, '#DC2626'); px(g, 3, B.shY + 12, 5, 6, '#F8FAFC');
  part(g, () => g.roundRect(B.hipW / 2 - 3, B.hipY - 10, 6, 11, 1), '#18181B', B.hipW / 2 - 3, B.hipY - 10, 6, 11, 0.8);
  px(g, B.hipW / 2 - 1, B.hipY - 16, 1, 6, '#18181B');
  head(g, B, F, aim ? 'angry' : 'wide', aim ? 'teeth' : 'o');
  headset(g, B);
  arm(g, B, 1, near[0], near[1], { sleeve: hoodie, hand: L.skin });
  // (the coffee: a white cup, its lid, its sleeve)
  if (!fl && F.v !== 'thrown') { part(g, () => g.roundRect(near[0] - 3, near[1] - 12, 8, 11, 1), '#F5F5F4', near[0] - 3, near[1] - 12, 8, 11, 0.9); px(g, near[0] - 4, near[1] - 13, 10, 2, '#18181B'); px(g, near[0] - 3, near[1] - 8, 8, 3, '#A16207'); }
};
export const drawRunner = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const thrown = e.aiState === 'thrown';
  const F = frameFor(e, f, seed, poseOf(e, ['aim'], ['thrown']), thrown ? 'thrown' : '');
  putFrame(c, 'hww-runner', F, BOX, g => paintRunner(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The director

const megaphone = (g: Ctx, x: number, y: number, ang: number) => {
  g.save(); g.translate(x, y); g.rotate(ang);
  part(g, () => { g.moveTo(0, -3); g.lineTo(16, -9); g.lineTo(16, 9); g.lineTo(0, 3); g.closePath(); }, '#F8FAFC', 0, -9, 16, 18, 1);
  px(g, 13, -8, 3, 16, '#DC2626'); px(g, -3, -2, 5, 6, '#3F3F46');
  g.restore();
};
const paintDirector = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const vest = pickOf(F.seed, 2, ['#78350F', '#3F6212', '#1F2937']), scarf = pickOf(F.seed, 5, ['#DC2626', '#7C3AED', '#F59E0B']);
  legs(g, B, { col: '#44403C', shoe: 'shoe', shoeCol: '#1C1917' });
  const fl = flailHands(B, F.fr);
  const yell = F.pose === 'tell', whack = F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : [-B.w / 2 - 2, -30];
  const near: [number, number] = fl ? fl[1] : yell ? [B.hx + 6, B.hy + 7] : whack ? [B.w / 2 + 14, B.shY + 2] : [B.w / 2 + 4, B.shY + 18];
  arm(g, B, -1, far[0], far[1], { sleeve: '#F8FAFC', hand: L.skin });
  torso(g, B, '#F8FAFC');
  for (let y = B.shY + 3; y < B.hipY; y += 4) px(g, -B.w / 2 + 2, y, B.w - 4, 1, '#93C5FD');
  part(g, () => { g.moveTo(-B.w / 2, B.shY + 2); g.lineTo(-B.hipW / 2 - 1, B.hipY + 2); g.lineTo(-3, B.hipY + 2); g.lineTo(-3, B.shY + 2); g.closePath(); }, vest, -B.hipW / 2 - 1, B.shY + 2, B.w / 2 + 2, B.hipY - B.shY, 1);
  part(g, () => { g.moveTo(B.w / 2, B.shY + 2); g.lineTo(B.hipW / 2 + 1, B.hipY + 2); g.lineTo(4, B.hipY + 2); g.lineTo(4, B.shY + 2); g.closePath(); }, vest, 4, B.shY + 2, B.w / 2, B.hipY - B.shY, 1);
  part(g, () => g.roundRect(-7, B.shY - 2, 14, 5, 2), scarf, -7, B.shY - 2, 14, 5, 1); px(g, -5, B.shY + 2, 4, 10, scarf);
  head(g, B, F, yell ? 'angry' : 'smug', yell ? 'o' : whack ? 'teeth' : 'smirk', false);
  cap(g, B, '#18181B', true);
  arm(g, B, 1, near[0], near[1], { sleeve: '#F8FAFC', hand: L.skin });
  if (!fl) megaphone(g, near[0], near[1], yell ? 0 : whack ? 0.6 : 1.3);
};
export const drawDirector = (c: Ctx, e: Enemy, f: number, seed: number, boosting: boolean) => {
  const F = frameFor(e, f, seed, poseOf(e, ['action'], ['whack']));
  putFrame(c, 'hww-director', F, BOX, g => paintDirector(g, F));
  void boosting;
};

// ---------------------------------------------------------------------------------------------------------------
// Craft services

const food = (g: Ctx, x: number, y: number, look: number) => {
  if (look === 0) { ball(g, x, y, 5, '#F9A8D4', 1); ball(g, x, y, 1.6, '#92400E', 0.6); }
  else if (look === 1) { part(g, () => g.roundRect(x - 7, y - 3, 14, 6, 3), '#E7C27D', x - 7, y - 3, 14, 6, 1); }
  else { part(g, () => g.rect(x - 6, y - 4, 12, 8), '#FEF3C7', x - 6, y - 4, 12, 8, 1); px(g, x - 6, y - 4, 12, 2, '#F472B6'); }
};
const paintCraft = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const shirt = pickOf(F.seed, 4, ['#0F766E', '#B91C1C', '#1E3A8A']);
  legs(g, B, { col: '#27272A', shoe: 'shoe', shoeCol: '#18181B' });
  const fl = flailHands(B, F.fr);
  const wind = F.pose === 'tell';
  const far: [number, number] = fl ? fl[0] : [B.w / 2 + 4, B.shY + 12];
  const near: [number, number] = fl ? fl[1] : wind ? [-B.w / 2 - 8, B.shY - 10] : F.pose === 'strike' ? [B.w / 2 + 14, B.shY - 2] : [B.w / 2 + 8, B.shY + 10];
  arm(g, B, -1, far[0], far[1], { sleeve: shirt, hand: L.skin, len: 0.45 });
  // (the tray, in the far hand: a stack of donuts on it)
  if (!fl) { part(g, () => g.rect(far[0] - 4, far[1] - 2, 22, 3), '#D4D4D8', far[0] - 4, far[1] - 2, 22, 3, 0.8); for (let k = 0; k < 3; k++) ball(g, far[0] + 1 + k * 6, far[1] - 5, 2.8, '#F9A8D4', 0.6); }
  torso(g, B, shirt);
  part(g, () => g.roundRect(-B.w / 2 + 2, B.shY + 4, B.w - 4, B.hipY - B.shY + 8, 2), '#F8FAFC', -B.w / 2 + 2, B.shY + 4, B.w - 4, B.hipY - B.shY + 8, 1);
  px(g, -4, B.shY + 14, 8, 1, '#E7E5E4');
  head(g, B, F, wind ? 'angry' : 'tired', wind ? 'teeth' : 'flat', false);
  // (the hairnet over their hair)
  if (!B.L.bald) hairTop(g, B);
  g.fillStyle = 'rgba(255,255,255,0.35)';
  for (let k = -8; k <= 9; k += 3) g.fillRect(Math.round(B.hx + k), Math.round(B.hy - 11), 1, 8);
  arm(g, B, 1, near[0], near[1], { sleeve: shirt, hand: L.skin, len: 0.45 });
  if (!fl && F.v !== 'thrown') food(g, near[0] + 2, near[1] - 4, F.seed % 3);
};
export const drawCraft = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const thrown = e.aiState === 'thrown';
  const F = frameFor(e, f, seed, poseOf(e, ['windup'], ['thrown']), thrown ? 'thrown' : '');
  putFrame(c, 'hww-craft', F, BOX, g => paintCraft(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The mocap double

const DOTS: [number, number][] = [[-6, -50], [6, -48], [0, -42], [-8, -36], [8, -36], [0, -32], [-4, -24], [5, -22], [-6, -12], [6, -10], [-5, -3], [6, -3]];
const paintMocap = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const suit = '#111827';
  const flip = F.v === 'air';
  if (flip) { g.translate(0, -36); g.rotate(-0.9 - (F.fr % 4) * 0.6); g.translate(0, 36); }
  legs(g, B, { col: suit, shoe: 'sneaker', shoeCol: '#18181B' });
  const fl = flailHands(B, F.fr);
  const crouch = F.pose === 'tell', kick = F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : crouch ? [-B.w / 2 - 6, -14] : flip ? [-B.w / 2 - 10, B.shY - 10] : [-B.w / 2 - 2, -30];
  const near: [number, number] = fl ? fl[1] : crouch ? [B.w / 2 + 6, -16] : kick ? [B.w / 2 + 16, B.shY + 6] : flip ? [B.w / 2 + 10, B.shY - 12] : [B.w / 2 + 3, -32];
  arm(g, B, -1, far[0], far[1], { sleeve: suit, hand: suit });
  torso(g, B, suit);
  for (const [x, y] of DOTS) ball(g, x * (B.w / 23), B.shY + 3 + ((y + 52) / 49) * (B.hipY - B.shY - 2), 1.4, '#F8FAFC', 0.4);
  face(g, B, F, kick || crouch ? 'angry' : 'open', kick ? 'teeth' : 'flat');
  // (the dotted cap, over the hair; the face camera on its boom off the forehead)
  part(g, () => { g.moveTo(B.hx - 9.5, B.hy - 1); g.quadraticCurveTo(B.hx - 8, B.hy - 13, B.hx + 1, B.hy - 12); g.quadraticCurveTo(B.hx + 10, B.hy - 12, B.hx + 10, B.hy - 3); g.closePath(); }, suit, B.hx - 9.5, B.hy - 13, 20, 12, 1);
  for (const [dx, dy] of [[-5, -9], [1, -11], [7, -7]]) ball(g, B.hx + dx, B.hy + dy, 1.2, '#F8FAFC', 0.3);
  limb(g, B.hx + 6, B.hy - 9, B.hx + 18, B.hy - 2, 1.4, '#71717A');
  part(g, () => g.rect(B.hx + 16, B.hy - 4, 5, 4), '#27272A', B.hx + 16, B.hy - 4, 5, 4, 0.8);
  arm(g, B, 1, near[0], near[1], { sleeve: suit, hand: suit });
  void L;
};
export const drawMocap = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const air = e.aiState === 'flip' && e.vel.y !== 0;
  const F = frameFor(e, f, seed, air ? 'walk' : poseOf(e, ['crouch'], ['kick']), air ? 'air' : '');
  putFrame(c, 'hww-mocap', F, BOX, g => paintMocap(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The stunt coordinator

const paintStuntco = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const tee = pickOf(F.seed, 6, ['#7F1D1D', '#1E3A8A', '#3F3F46']);
  const dive = F.v === 'dive', prone = F.v === 'prone';
  if (dive || prone) { g.translate(0, prone ? -8 : -26); g.rotate(Math.PI / 2 - 0.12); g.translate(0, 36); }
  legs(g, B, { col: '#1C1917', shoe: 'boot', shoeCol: '#18181B', detail: (gg, _h, knee) => { part(gg, () => gg.roundRect(knee[0] - 4, knee[1] - 4, 8, 8, 2), '#18181B', knee[0] - 4, knee[1] - 4, 8, 8, 0.8); } });
  const fl = flailHands(B, F.fr);
  const set = F.pose === 'tell', hit = F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : dive ? [B.w / 2 + 12, B.shY - 14] : set ? [-B.w / 2 - 2, -20] : [-B.w / 2 - 2, -30];
  const near: [number, number] = fl ? fl[1] : dive ? [B.w / 2 + 16, B.shY - 8] : hit ? [B.w / 2 + 16, B.shY + 6] : set ? [B.w / 2 + 4, -22] : [B.w / 2 + 3, -33];
  arm(g, B, -1, far[0], far[1], { sleeve: tee, hand: '#27272A', len: 0.4 });
  torso(g, B, tee);
  // (the STUNTS vest: black, a stripe of tape across it)
  part(g, () => g.roundRect(-B.w / 2 + 1, B.shY + 2, B.w - 2, B.hipY - B.shY - 2, 2), '#18181B', -B.w / 2 + 1, B.shY + 2, B.w - 2, B.hipY - B.shY - 2, 1);
  px(g, -B.w / 2 + 2, B.shY + 10, B.w - 4, 3, '#FACC15');
  head(g, B, F, set || hit || dive ? 'angry' : 'smug', set ? 'o' : dive || hit ? 'teeth' : 'smirk');
  headset(g, B);
  arm(g, B, 1, near[0], near[1], { sleeve: tee, hand: '#27272A', len: 0.4 });
  void L;
};
export const drawStuntco = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = e.aiState ?? '';
  const v = st === 'tackle' ? 'dive' : st === 'prone' ? 'prone' : '';
  const F = frameFor(e, f, seed, poseOf(e, ['set'], ['punch']), v);
  putFrame(c, 'hww-stuntco', F, BOX, g => paintStuntco(g, F));
};
