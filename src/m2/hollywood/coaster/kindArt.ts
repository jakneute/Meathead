// Thrones of the Stars' staff, drawn (first pass: readable, on Spooky Land's person-in-a-costume drawer, costume.ts, so
// whoever's in the uniform shows: their skin, build, hair and face):
//   rideop   the ride's purple polo (a gold crown on the chest, a name tag), khaki shorts, a purple visor, the whistle on
//            its lanyard (in the mouth for the tell); both hands out for the body check
//   janitor  gray coveralls, yellow rubber gloves, a cap; the plunger (a red cup on a stick) wound back, thrown, swung
//   docent   a tweed blazer over a white shirt, a red bow tie, glasses, white gloves; the brass pointer out in front
//            (up for the tell, thrust for the lunge)
//   guard    THRONE SECURITY: a black jacket with the yellow band, a cap with a badge; the flashlight in one hand (lit
//            while it's aimed), the baton in the other (up, then down)
// Feet at the origin, facing right (the engine mirrors them). Each frame painted once into a stamp (putFrame).

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, px, limb, ball,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, hairTop, hairBack, frameOf, putFrame, pickOf, moodOf, reaction,
} from '../../spooky/costume';

type Ctx = CanvasRenderingContext2D;

const moving = (e: Enemy, min = 0.3): Pose => (Math.abs(e.vel.x) > min ? 'walk' : 'stand');
const poseOf = (e: Enemy, tells: string[], strikes: string[]): Pose =>
  tells.includes(e.aiState ?? '') ? 'tell' : strikes.includes(e.aiState ?? '') ? 'strike' : moving(e);
const frameFor = (e: Enemy, f: number, seed: number, pose: Pose, v = '') => {
  const r = reaction(e);
  return frameOf(seed, f, r?.pose ?? pose, r?.md ?? moodOf(e), 0, undefined, v);
};
const BOX: [number, number, number, number] = [-56, -120, 124, 124];
const face = (g: Ctx, B: Body, F: Frame, eyes: 'open' | 'angry' | 'wide' | 'tired' | 'smug', mouth: 'flat' | 'grin' | 'smile' | 'teeth' | 'o' | 'smirk') => {
  headShape(g, B, B.L.skin);
  faceOn(g, B, { skin: B.L.skin, eyes, mouth, md: F.md, blink: F.blink });
};
/** A cap's peak and crown over their own hair (a visor's just the peak and the band). */
const cap = (g: Ctx, B: Body, col: string, visor = false) => {
  const { hx, hy } = B;
  if (!visor) part(g, () => { g.moveTo(hx - 9, hy - 3); g.quadraticCurveTo(hx - 8, hy - 15, hx + 1, hy - 14); g.quadraticCurveTo(hx + 10, hy - 13, hx + 10, hy - 4); g.closePath(); }, col, hx - 9, hy - 15, 19, 12, 1);
  else part(g, () => g.rect(hx - 9, hy - 9, 19, 4), col, hx - 9, hy - 9, 19, 4, 0.8);
  part(g, () => g.roundRect(hx + 4, hy - 6, 13, 3, 1), dk(col, 0.2), hx + 4, hy - 6, 13, 3, 0.8);
};

// ---------------------------------------------------------------------------------------------------------------
// The ride op

const paintRideop = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const polo = pickOf(F.seed, 2, ['#6D28D9', '#7C3AED', '#5B21B6']);
  legs(g, B, { col: '#C8B88A', shoe: 'sneaker', shoeCol: '#F5F5F4', bareBelow: true });
  const fl = flailHands(B, F.fr);
  const tell = F.pose === 'tell', shove = F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : shove ? [B.w / 2 + 10, B.shY + 14] : [-B.w / 2 - 2, -30];
  const near: [number, number] = fl ? fl[1] : shove ? [B.w / 2 + 16, B.shY + 8] : tell ? [B.hx + 7, B.hy + 8] : [B.w / 2 + 2, -31];
  arm(g, B, -1, far[0], far[1], { sleeve: polo, hand: L.skin, len: 0.45 });
  torso(g, B, polo);
  // (the collar, the crown on the chest, the name tag, the lanyard down to the whistle)
  px(g, -5, B.shY, 11, 3, lt(polo, 0.3));
  for (const [x, y] of [[-6, 0], [-3, -2], [0, 0], [3, -2], [6, 0]]) px(g, -6 + x * 0.6, B.shY + 9 + y, 2, 3, '#FACC15');
  px(g, -7, B.shY + 12, 9, 2, '#FACC15');
  px(g, 3, B.shY + 8, 7, 4, '#F8FAFC');
  if (!tell) { px(g, -1, B.shY + 1, 1, 14, '#A1A1AA'); px(g, -2, B.shY + 15, 4, 3, '#D4D4D8'); }
  hairBack(g, B);
  face(g, B, F, shove ? 'angry' : 'open', tell ? 'o' : shove ? 'teeth' : 'flat');
  whiskers(g, B);
  hairTop(g, B);
  cap(g, B, polo, true);
  arm(g, B, 1, near[0], near[1], { sleeve: polo, hand: L.skin, len: 0.45 });
  // (the whistle, in the mouth)
  if (tell && !fl) { px(g, B.hx + 9, B.hy + 5, 5, 3, '#D4D4D8'); px(g, B.hx + 13, B.hy + 4, 2, 2, '#71717A'); }
};
export const drawRideop = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['whistle'], ['shove']));
  putFrame(c, 'hwc-rideop', F, BOX, g => paintRideop(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The janitor

const plunger = (g: Ctx, x: number, y: number, ang: number) => {
  g.save(); g.translate(x, y); g.rotate(ang);
  limb(g, 0, 4, 0, -30, 3, '#A16207');
  part(g, () => { g.moveTo(-8, -28); g.quadraticCurveTo(0, -42, 8, -28); g.closePath(); }, '#B91C1C', -8, -40, 16, 12, 1);
  g.restore();
};
const paintJanitor = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr);
  const suit = pickOf(F.seed, 3, ['#64748B', '#57534E', '#4D7C0F']), glove = '#FACC15';
  legs(g, B, { col: suit, shoe: 'boot', shoeCol: '#1C1917' });
  const fl = flailHands(B, F.fr);
  const up = F.pose === 'tell', thrown = F.v === 'thrown';
  const far: [number, number] = fl ? fl[0] : [-B.w / 2 - 2, -31];
  const near: [number, number] = fl ? fl[1] : up ? [-2, B.shY - 14] : F.pose === 'strike' ? [B.w / 2 + 14, B.shY + 10] : [B.w / 2 + 3, -33];
  arm(g, B, -1, far[0], far[1], { sleeve: suit, hand: glove });
  torso(g, B, suit);
  // (the bib's pocket, a rag hanging out of it, the name patch)
  px(g, -6, B.shY + 8, 10, 7, dk(suit, 0.2)); px(g, -4, B.shY + 4, 3, 6, '#F8FAFC');
  px(g, 4, B.shY + 6, 6, 3, '#F8FAFC');
  hairBack(g, B);
  face(g, B, F, up ? 'angry' : 'tired', up ? 'teeth' : 'flat');
  whiskers(g, B);
  hairTop(g, B);
  cap(g, B, dk(suit, 0.15));
  arm(g, B, 1, near[0], near[1], { sleeve: suit, hand: glove });
  if (!fl && !thrown) plunger(g, near[0], near[1], up ? -2.2 : F.pose === 'strike' ? 1.4 : 0.2);
};
export const drawJanitor = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const thrown = e.aiState === 'thrown';
  const F = frameFor(e, f, seed, poseOf(e, ['windup', 'raise'], ['thrown']), thrown ? 'thrown' : '');
  putFrame(c, 'hwc-janitor', F, BOX, g => paintJanitor(g, F));
};
/** A plunger on its own (thrown, stuck on the floor, stuck on his face), world. */
export const drawPlunger = (c: Ctx, x: number, y: number, rot: number) => {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.fillStyle = INK; c.fillRect(-2, -16, 5, 26);
  c.fillStyle = '#A16207'; c.fillRect(-1, -15, 3, 24);
  c.fillStyle = INK; c.beginPath(); c.moveTo(-10, 12); c.quadraticCurveTo(0, -2, 10, 12); c.closePath(); c.fill();
  c.fillStyle = '#B91C1C'; c.beginPath(); c.moveTo(-8, 11); c.quadraticCurveTo(0, 0, 8, 11); c.closePath(); c.fill();
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The docent

const paintDocent = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr);
  const tweed = pickOf(F.seed, 4, ['#7C5A3A', '#6B6B3A', '#7A4B3A']), glove = '#F8FAFC';
  legs(g, B, { col: dk(tweed, 0.3), shoe: 'shoe', shoeCol: '#3F2A14' });
  const fl = flailHands(B, F.fr);
  const tell = F.pose === 'tell', lunge = F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : lunge ? [-B.w / 2 - 10, B.shY + 2] : [-B.w / 2 - 1, B.hipY - 2];
  const near: [number, number] = fl ? fl[1] : lunge ? [B.w / 2 + 18, B.shY + 10] : tell ? [B.w / 2 + 2, B.shY - 6] : [B.w / 2 + 8, B.shY + 18];
  arm(g, B, -1, far[0], far[1], { sleeve: tweed, hand: glove });
  torso(g, B, '#F5F5F4');
  // (the blazer open over the shirt, flecked; the bow tie)
  part(g, () => { g.moveTo(-B.w / 2, B.shY + 2); g.lineTo(-B.hipW / 2 - 2, B.hipY + 4); g.lineTo(-3, B.hipY + 4); g.lineTo(-3, B.shY + 2); g.closePath(); }, tweed, -B.hipW / 2 - 2, B.shY + 2, B.w / 2 + 2, B.hipY - B.shY + 2, 1);
  part(g, () => { g.moveTo(B.w / 2, B.shY + 2); g.lineTo(B.hipW / 2 + 2, B.hipY + 4); g.lineTo(4, B.hipY + 4); g.lineTo(4, B.shY + 2); g.closePath(); }, tweed, 4, B.shY + 2, B.w / 2 + 2, B.hipY - B.shY + 2, 1);
  for (let k = 0; k < 8; k++) px(g, -B.w / 2 + 2 + ((k * 7) % (B.w - 4)), B.shY + 6 + ((k * 5) % 18), 1, 1, lt(tweed, 0.3));
  part(g, () => { g.moveTo(-5, B.shY + 1); g.lineTo(0, B.shY + 4); g.lineTo(5, B.shY + 1); g.lineTo(5, B.shY + 7); g.lineTo(0, B.shY + 4); g.lineTo(-5, B.shY + 7); g.closePath(); }, '#B91C1C', -5, B.shY + 1, 10, 6, 0.8);
  hairBack(g, B);
  face(g, B, F, tell ? 'smug' : lunge ? 'angry' : 'open', tell ? 'o' : lunge ? 'teeth' : 'smirk');
  whiskers(g, B);
  // (glasses, always: half-moons)
  for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 1.6; g.strokeRect(B.hx + 2.5 + s * 3.6 - 2.8, B.hy - 2, 5.6, 3.4); }
  hairTop(g, B);
  arm(g, B, 1, near[0], near[1], { sleeve: tweed, hand: glove });
  // (the brass pointer, out in front: up for the AHEM, thrust for the lunge)
  if (!fl) {
    const a = tell ? -1.2 : lunge ? 0.05 : 0.2;
    g.save(); g.translate(near[0], near[1]); g.rotate(a);
    part(g, () => g.rect(-2, -2, 38, 4), '#CA8A04', -2, -2, 38, 4, 0.9);
    ball(g, 37, 0, 2.6, '#FDE68A', 0.8);
    g.restore();
  }
};
export const drawDocent = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['ahem'], ['lunge']));
  putFrame(c, 'hwc-docent', F, BOX, g => paintDocent(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// Security

const paintGuard = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const jacket = '#1F2937';
  legs(g, B, { col: '#27272A', shoe: 'boot', shoeCol: '#0C0A09' });
  const fl = flailHands(B, F.fr);
  const aim = F.v === 'aim', up = F.v === 'up', down = F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : aim ? [B.w / 2 + 14, B.shY + 8] : [-B.w / 2 - 3, -30];
  const near: [number, number] = fl ? fl[1] : up ? [B.w / 2 - 4, B.shY - 12] : down ? [B.w / 2 + 16, B.shY + 14] : [B.w / 2 + 4, -33];
  arm(g, B, -1, far[0], far[1], { sleeve: jacket, hand: L.skin });
  // (the flashlight, in the far hand)
  if (!fl) { part(g, () => g.rect(far[0] - 2, far[1] - 4, 14, 7), '#3F3F46', far[0] - 2, far[1] - 4, 14, 7, 1); px(g, far[0] + 11, far[1] - 3, 3, 5, aim ? '#FEF9C3' : '#A1A1AA'); }
  torso(g, B, jacket, B.shY, B.hipY + 2, 3);
  // (the yellow band, the badge)
  px(g, -B.w / 2 - 1, B.shY + 14, B.w + 4, 4, '#EAB308');
  px(g, 4, B.shY + 5, 4, 5, '#FBBF24'); px(g, 5, B.shY + 6, 2, 2, '#FEF3C7');
  hairBack(g, B);
  face(g, B, F, 'angry', down ? 'teeth' : 'flat');
  whiskers(g, B);
  hairTop(g, B);
  cap(g, B, '#111827');
  px(g, B.hx + 1, B.hy - 12, 4, 4, '#FBBF24');
  arm(g, B, 1, near[0], near[1], { sleeve: jacket, hand: L.skin });
  // (the baton)
  if (!fl) {
    const a = up ? -2.0 : down ? 0.8 : 1.3;
    g.save(); g.translate(near[0], near[1]); g.rotate(a);
    part(g, () => g.roundRect(-2, -3, 30, 5, 2), '#18181B', -2, -3, 30, 5, 1);
    g.restore();
  }
};
export const drawGuard = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = e.aiState ?? '';
  const v = st === 'aim' ? 'aim' : st === 'swing' && (e.aiTimer ?? 0) < 16 ? 'up' : '';
  const pose: Pose = st === 'aim' || v === 'up' ? 'tell' : st === 'swing' ? 'strike' : moving(e);
  const F = frameFor(e, f, seed, pose, v);
  putFrame(c, 'hwc-guard', F, BOX, g => paintGuard(g, F));
};
