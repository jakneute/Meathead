// The backlot's people, drawn (first pass, on costume.ts's person drawer: whoever's in the uniform shows):
//   guide      khaki shirt and shorts, a lanyard, a visor, a red megaphone (up to the mouth for the tell)
//   cart       backlot security (a navy shirt, a cap) sat in a white golf cart, the light on its roof going
//   legionary  a centurion extra: a cardboard breastplate sprayed gold, a red plume on the helmet, a red skirt, sandals,
//              the spear out in front (drawn back for the tell)
//   cowboy     a cowboy extra: a ten-gallon hat, a vest, chaps, the lasso (whirling overhead for the tell)
// Feet at the origin, facing right (the engine mirrors them). Each frame painted once into a stamp (putFrame).

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Frame, INK, dk, part, px, limb, ball,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, glasses, hairTop, hairBack, frameOf, putFrame, pickOf,
  moodOf, reaction,
} from '../../spooky/costume';

type Ctx = CanvasRenderingContext2D;
const moving = (e: Enemy, min = 0.3): Pose => (Math.abs(e.vel.x) > min ? 'walk' : 'stand');
const poseOf = (e: Enemy, tells: string[], strikes: string[]): Pose =>
  tells.includes(e.aiState ?? '') ? 'tell' : strikes.includes(e.aiState ?? '') ? 'strike' : moving(e);
const frameFor = (e: Enemy, f: number, seed: number, pose: Pose, v = '') => {
  const r = reaction(e);
  return frameOf(seed, f, r?.pose ?? pose, r?.md ?? moodOf(e), 0, undefined, v);
};
const BOX: [number, number, number, number] = [-60, -120, 132, 124];

const ownHead = (g: Ctx, F: Frame, B: ReturnType<typeof bodyOf>, eyes: 'open' | 'angry' | 'tired', mouth: 'flat' | 'teeth' | 'o' | 'frown') => {
  hairBack(g, B);
  headShape(g, B, B.L.skin);
  faceOn(g, B, { skin: B.L.skin, eyes, mouth, md: F.md, blink: F.blink });
  whiskers(g, B); glasses(g, B);
};

const paintGuide = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  legs(g, B, { col: '#A39264', shoe: 'sneaker', shoeCol: '#F5F5F4', bareBelow: true });
  const fl = flailHands(B, F.fr);
  const up = F.pose === 'tell' || F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : [-B.w / 2 - 2, -30];
  const near: [number, number] = fl ? fl[1] : up ? [B.hx + 8, B.hy + 6] : [B.w / 2 + 3, B.shY + 18];
  arm(g, B, -1, far[0], far[1], { sleeve: '#C8B88A', hand: L.skin, len: 0.4 });
  torso(g, B, '#C8B88A');
  // (the lanyard, the badge, the name tag)
  limb(g, -4, B.shY + 1, 0, B.shY + 16, 1.4, '#1D4ED8', false); limb(g, 6, B.shY + 1, 0, B.shY + 16, 1.4, '#1D4ED8', false);
  px(g, -3, B.shY + 16, 7, 9, '#F8FAFC'); px(g, -2, B.shY + 18, 5, 2, '#DC2626');
  ownHead(g, F, B, up ? 'angry' : 'open', F.pose === 'strike' ? 'o' : 'flat');
  hairTop(g, B);
  // (the visor)
  part(g, () => { g.moveTo(B.hx - 9, B.hy - 6); g.lineTo(B.hx + 9, B.hy - 6); g.lineTo(B.hx + 16, B.hy - 3); g.lineTo(B.hx - 9, B.hy - 3); g.closePath(); }, '#15803D', B.hx - 9, B.hy - 6, 25, 4, 0.9);
  arm(g, B, 1, near[0], near[1], { sleeve: '#C8B88A', hand: L.skin, len: 0.4 });
  // (the megaphone: at the hip, or up at the mouth)
  if (!fl) {
    const mx = up ? B.hx + 10 : near[0], my = up ? B.hy + 4 : near[1] - 4;
    part(g, () => { g.moveTo(mx, my - 3); g.lineTo(mx + 18, my - 9); g.lineTo(mx + 18, my + 9); g.lineTo(mx, my + 3); g.closePath(); }, '#DC2626', mx, my - 9, 18, 18, 1);
    px(g, mx + 16, my - 8, 2, 16, '#F8FAFC');
  }
};
export const drawGuide = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['raise'], ['blast']));
  putFrame(c, 'hw-guide', F, BOX, g => paintGuide(g, F));
};

const paintCart = (g: Ctx, F: Frame) => {
  // (the cart: a white tub on four small wheels, a canopy on posts, the light on the roof; the guard sat in it)
  const B = bodyOf(F.seed, 'stand', 0), L = B.L;
  const dead = F.md === 'dead';
  // (the seat's back, behind him: its cushion up from the tub's rim)
  part(g, () => g.roundRect(-34, -64, 12, 28, 3), '#27272A', -34, -64, 12, 28, 1);
  // (the guard: sat on the bench, his seat at the tub's rim, so the side of the cart hides him from the waist down;
  // head and shoulders up under the canopy, behind the wheel. Translated so his shoulders are ~60 up off the ground
  // and his head (~72 up) sits where the kind says it is)
  const sx = -10, sy = -6;
  g.save(); g.translate(sx, sy);
  torso(g, B, '#1E3A8A');
  px(g, -4, B.shY + 8, 8, 6, '#FACC15');
  hairBack(g, B);
  headShape(g, B, L.skin);
  faceOn(g, B, { skin: L.skin, eyes: F.pose === 'tell' || F.pose === 'strike' ? 'angry' : 'tired', mouth: F.pose === 'strike' ? 'teeth' : 'flat', md: F.md, blink: F.blink });
  whiskers(g, B);
  part(g, () => g.roundRect(B.hx - 9, B.hy - 11, 18, 6, 2), '#1E3A8A', B.hx - 9, B.hy - 11, 18, 6, 0.9);
  px(g, B.hx + 6, B.hy - 7, 9, 2, '#1E3A8A');
  g.restore();
  // (the cart's side, in front of his lap and legs; the wheels under it)
  for (const wx of [-30, 30]) { ball(g, wx, -9, 9, '#18181B', 1.2); ball(g, wx, -9, 4, '#A1A1AA', 0.8); }
  part(g, () => g.roundRect(-42, -40, 84, 28, 5), '#F8FAFC', -42, -40, 84, 28, 1.4);
  px(g, -40, -24, 80, 3, '#1D4ED8');
  // (the dash at the front, up to the wheel; the column, the wheel; his near arm out to it, fist on the rim)
  part(g, () => g.roundRect(26, -50, 16, 12, 3), '#E4E4E7', 26, -50, 16, 12, 1);
  limb(g, 30, -46, 22, -62, 2.5, '#27272A');
  part(g, () => g.ellipse(21, -64, 3, 7, 0.35, 0, Math.PI * 2), '#27272A', 17, -71, 8, 14, 0.9);
  g.save(); g.translate(sx, sy);
  arm(g, B, 1, 21 - sx, -66 - sy, { sleeve: '#1E3A8A', hand: L.skin });
  g.restore();
  // (the canopy's posts, the canopy, the light)
  px(g, -40, -96, 4, 56, '#71717A'); px(g, 34, -96, 4, 56, '#71717A');
  part(g, () => g.rect(-44, -102, 88, 8), '#F8FAFC', -44, -102, 88, 8, 1.2);
  const lit = (F.pose === 'tell' || F.pose === 'strike') && F.fr % 2 === 0;
  part(g, () => g.roundRect(-6, -112, 12, 10, 3), lit ? '#EF4444' : '#7F1D1D', -6, -112, 12, 10, 1);
  if (lit) { g.fillStyle = 'rgba(239, 68, 68, 0.3)'; g.beginPath(); g.arc(0, -107, 16, 0, Math.PI * 2); g.fill(); }
  // (SECURITY on its side)
  px(g, -30, -36, 50, 8, '#1E3A8A'); px(g, -28, -34, 46, 4, '#F8FAFC');
  if (dead) px(g, -42, -40, 84, 2, INK);
};
export const drawCart = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = e.aiState === 'siren' ? 'tell' : e.aiState === 'rush' ? 'strike' : 'stand';
  const F = frameOf(seed, f, st as Pose, moodOf(e), 0, undefined, `c${Math.floor(f / 8) % 2}`);
  F.fr = Math.floor(f / 8) % 2;
  putFrame(c, 'hw-cart', F, [-60, -130, 120, 134], g => paintCart(g, F));
};

const paintLegionary = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const gold = '#CA8A04', red = '#B91C1C';
  legs(g, B, { col: L.skin, shoe: 'sandal', shoeCol: '#78350F' });
  const fl = flailHands(B, F.fr);
  const back = F.pose === 'tell', thrust = F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : back ? [-B.w / 2 - 14, B.shY + 14] : thrust ? [B.w / 2 + 8, B.shY + 12] : [-B.w / 2 + 2, B.shY + 18];
  const near: [number, number] = fl ? fl[1] : back ? [-B.w / 2 + 4, B.shY + 12] : thrust ? [B.w / 2 + 24, B.shY + 12] : [B.w / 2 + 8, B.shY + 14];
  arm(g, B, -1, far[0], far[1], { sleeve: L.skin, hand: L.skin });
  // (the red tunic skirt, the cardboard breastplate, its tape)
  part(g, () => g.rect(-B.hipW / 2 - 2, B.hipY - 4, B.hipW + 4, 12), red, -B.hipW / 2 - 2, B.hipY - 4, B.hipW + 4, 12, 1);
  for (let k = 0; k < 5; k++) px(g, -B.hipW / 2 + k * 5, B.hipY + 1, 3, 8, dk(red, 0.3));
  torso(g, B, gold);
  px(g, -B.w / 2 + 2, B.shY + 12, B.w - 4, 2, dk(gold, 0.35)); px(g, -B.w / 2 + 2, B.shY + 20, B.w - 4, 2, dk(gold, 0.35));
  px(g, 4, B.shY + 4, 6, 3, '#D6C9A3');
  ownHead(g, F, B, back || thrust ? 'angry' : 'open', thrust ? 'teeth' : 'flat');
  // (the helmet, the plume)
  part(g, () => { g.moveTo(B.hx - 10, B.hy - 1); g.quadraticCurveTo(B.hx - 9, B.hy - 14, B.hx + 1, B.hy - 13); g.quadraticCurveTo(B.hx + 11, B.hy - 13, B.hx + 10, B.hy - 1); g.lineTo(B.hx + 6, B.hy - 4); g.lineTo(B.hx - 6, B.hy - 4); g.closePath(); }, gold, B.hx - 10, B.hy - 14, 21, 14, 1);
  part(g, () => g.roundRect(B.hx - 11, B.hy - 22, 20, 8, 4), red, B.hx - 11, B.hy - 22, 20, 8, 1);
  arm(g, B, 1, near[0], near[1], { sleeve: L.skin, hand: L.skin });
  // (the spear: level, out in front, through both hands)
  if (!fl) {
    const sx = Math.min(far[0], near[0]) - 18, ex = Math.max(far[0], near[0]) + 50 + (thrust ? 10 : 0), y = near[1] - 1;
    limb(g, sx, y, ex, y, 3, '#92400E');
    part(g, () => { g.moveTo(ex, y - 5); g.lineTo(ex + 14, y); g.lineTo(ex, y + 5); g.closePath(); }, '#D4D4D8', ex, y - 5, 14, 10, 1);
  }
};
export const drawLegionary = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['draw'], ['thrust']));
  putFrame(c, 'hw-legion', F, BOX, g => paintLegionary(g, F));
};

const paintCowboy = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const vest = pickOf(F.seed, 3, ['#78350F', '#1C1917', '#7F1D1D']), shirt = pickOf(F.seed, 4, ['#DBEAFE', '#FEF3C7', '#FCA5A5']);
  legs(g, B, { col: '#1E3A8A', shoe: 'boot', shoeCol: '#78350F', detail: (gg, h, k) => { limb(gg, h[0], h[1] + 2, k[0], k[1], B.legW + 1, '#92400E'); } });
  const fl = flailHands(B, F.fr);
  const whirl = F.pose === 'tell', toss = F.pose === 'strike';
  const a = F.fr * 1.6;
  const far: [number, number] = fl ? fl[0] : [-B.w / 2 - 2, B.hipY - 2];
  const near: [number, number] = fl ? fl[1] : whirl ? [B.hx + 4, B.hy - 22] : toss ? [B.w / 2 + 20, B.shY + 2] : [B.w / 2 + 3, B.shY + 18];
  arm(g, B, -1, far[0], far[1], { sleeve: shirt, hand: L.skin });
  torso(g, B, shirt);
  part(g, () => g.rect(-B.w / 2, B.shY + 1, 8, B.hipY - B.shY), vest, -B.w / 2, B.shY + 1, 8, B.hipY - B.shY, 1);
  part(g, () => g.rect(B.w / 2 - 8, B.shY + 1, 8, B.hipY - B.shY), vest, B.w / 2 - 8, B.shY + 1, 8, B.hipY - B.shY, 1);
  px(g, -B.hipW / 2, B.hipY - 3, B.hipW + 2, 4, '#451A03'); px(g, -3, B.hipY - 4, 7, 6, '#EAB308');
  ownHead(g, F, B, whirl ? 'angry' : 'open', toss ? 'teeth' : 'flat');
  // (the ten-gallon hat)
  part(g, () => g.roundRect(B.hx - 16, B.hy - 11, 33, 5, 2), '#A16207', B.hx - 16, B.hy - 11, 33, 5, 1);
  part(g, () => g.roundRect(B.hx - 8, B.hy - 22, 17, 12, 4), '#A16207', B.hx - 8, B.hy - 22, 17, 12, 1);
  px(g, B.hx - 8, B.hy - 13, 17, 2, '#451A03');
  arm(g, B, 1, near[0], near[1], { sleeve: shirt, hand: L.skin });
  // (the lasso: a coil at the hip, or a loop whirling over the head)
  if (!fl && !toss) {
    g.strokeStyle = INK; g.lineWidth = 3.5;
    if (whirl) { g.beginPath(); g.ellipse(near[0] + Math.cos(a) * 6, near[1] - 6, 22, 6, 0, 0, Math.PI * 2); g.stroke(); g.strokeStyle = '#CA8A04'; g.lineWidth = 2; g.beginPath(); g.ellipse(near[0] + Math.cos(a) * 6, near[1] - 6, 22, 6, 0, 0, Math.PI * 2); g.stroke(); }
    else { g.beginPath(); g.arc(far[0] + 2, far[1] - 6, 8, 0, Math.PI * 2); g.stroke(); g.strokeStyle = '#CA8A04'; g.lineWidth = 2; g.beginPath(); g.arc(far[0] + 2, far[1] - 6, 8, 0, Math.PI * 2); g.stroke(); }
  }
  void hairTop;
};
export const drawCowboy = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['swing'], ['throw']));
  putFrame(c, 'hw-cowboy', F, BOX, g => paintCowboy(g, F));
};
