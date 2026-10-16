// Thrones of the Stars' staff, drawn (peak SNES, on Spooky Land's person-in-a-costume drawer, costume.ts, so whoever's
// in the uniform shows: their skin, build, hair and face, man or woman; the uniform over them, every material in steps,
// inked round). Each is seeded: no two the same (the hat or not, the hair through it, the pockets' contents, the gear).
//   rideop   the ride's purple polo (gold piping, a gold crown on the chest, a name tag), khaki shorts or slacks, white
//            socks, a visor, a cap or a ponytail; the whistle on its lanyard (in the mouth for the tell), a walkie on
//            the belt of some; both hands out for the body check
//   janitor  coveralls (gray, slate, olive) with the bib's pocket (a rag), a name patch, the key ring and a spray bottle
//            on the belt, long yellow rubber gloves; a cap, a bandana or neither; the plunger wound back, thrown, swung
//   docent   a tweed blazer (flecked) over a white shirt, a bow tie or a silk scarf, a pocket square, a gold star pin,
//            the DOCENT badge on its lanyard, half-moon glasses, white gloves; the brass pointer out in front (up for
//            the tell, thrust for the lunge)
//   guard    THRONE SECURITY: a black or navy jacket with the yellow band, epaulettes, the radio on the shoulder (its
//            cord), the badge, a duty belt (cuffs); a cap with a badge; mirrored aviators on some; the flashlight in one
//            hand (lit while it's aimed), the baton in the other (up, then down)
// Feet at the origin, facing right (the engine mirrors them). Each frame painted once into a stamp (putFrame).

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, partTop, px, limb, ball, dither,
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
const BOX: [number, number, number, number] = [-56, -124, 124, 128];
const face = (g: Ctx, B: Body, F: Frame, eyes: 'open' | 'angry' | 'wide' | 'tired' | 'smug', mouth: 'flat' | 'grin' | 'smile' | 'teeth' | 'o' | 'smirk') => {
  headShape(g, B, B.L.skin);
  faceOn(g, B, { skin: B.L.skin, eyes, mouth, md: F.md, blink: F.blink });
};
/** A cap's peak and crown over their own hair (a visor's just the peak and the band), a button on top. */
const cap = (g: Ctx, B: Body, col: string, visor = false) => {
  const { hx, hy } = B;
  if (!visor) {
    partTop(g, () => { g.moveTo(hx - 9, hy - 3); g.quadraticCurveTo(hx - 8, hy - 15, hx + 1, hy - 14); g.quadraticCurveTo(hx + 10, hy - 13, hx + 10, hy - 4); g.closePath(); }, col, hx - 9, hy - 15, 19, 12, 1);
    px(g, hx, hy - 15, 2, 1, lt(col, 0.3));
    px(g, hx - 8, hy - 5, 18, 1, dk(col, 0.25));
  } else part(g, () => g.rect(hx - 9, hy - 9, 19, 4), col, hx - 9, hy - 9, 19, 4, 0.8);
  part(g, () => g.roundRect(hx + 4, hy - 6, 13, 3, 1), dk(col, 0.2), hx + 4, hy - 6, 13, 3, 0.8);
  px(g, hx + 5, hy - 6, 10, 1, lt(col, 0.15));
};
/** A ponytail out the back (through the visor's gap, or tied up), a scrunchie on it. */
const ponytail = (g: Ctx, B: Body, tie: string) => {
  if (B.L.bald) return;
  const { hx, hy } = B, col = B.L.hair;
  part(g, () => { g.moveTo(hx - 7, hy - 7); g.quadraticCurveTo(hx - 17, hy - 6, hx - 15, hy + 9); g.lineTo(hx - 11, hy + 8); g.quadraticCurveTo(hx - 12, hy - 2, hx - 6, hy - 3); g.closePath(); }, col, hx - 17, hy - 8, 12, 18, 1);
  part(g, () => g.roundRect(hx - 11, hy - 8, 5, 4, 1), tie, hx - 11, hy - 8, 5, 4, 0.8);
};
/** A name tag (white, a colored stripe, a scribble of a name). */
const nameTag = (g: Ctx, x: number, y: number, stripe: string) => {
  part(g, () => g.rect(x, y, 8, 5), '#F4F4F0', x, y, 8, 5, 0.8);
  px(g, x + 1, y + 1, 6, 1, stripe); px(g, x + 1, y + 3, 4, 1, '#3F3F46');
};

// ---------------------------------------------------------------------------------------------------------------
// The ride op

const paintRideop = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const polo = pickOf(F.seed, 2, ['#6D28D9', '#7C3AED', '#5B21B6', '#6B21A8']), gold = '#EAB308';
  const hat = F.seed % 3, slacks = F.seed % 4 === 1, walkie = F.seed % 2 === 0;
  const tan = pickOf(F.seed, 5, ['#C8B88A', '#B8A478', '#D2C49A']);
  legs(g, B, {
    col: tan, shoe: 'sneaker', shoeCol: '#F5F5F4', bareBelow: !slacks,
    detail: (gg, _h, k, ft, near) => { if (!slacks) px(gg, ft[0] - 3, ft[1] - 7, B.legW - 1, 3, near ? '#F8FAFC' : '#D4D4D8'); else px(gg, (k[0] + ft[0]) / 2 - 1, (k[1] + ft[1]) / 2, 1, 6, dk(tan, 0.2)); },
  });
  const fl = flailHands(B, F.fr);
  const tell = F.pose === 'tell', shove = F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : shove ? [B.w / 2 + 10, B.shY + 14] : [-B.w / 2 - 2, -30];
  const near: [number, number] = fl ? fl[1] : shove ? [B.w / 2 + 16, B.shY + 8] : tell ? [B.hx + 7, B.hy + 8] : [B.w / 2 + 2, -31];
  arm(g, B, -1, far[0], far[1], { sleeve: polo, hand: L.skin, len: 0.45 });
  torso(g, B, polo);
  // (the belt, the walkie on it; the collar and its gold piping; the crown on the chest; the name tag)
  px(g, -B.hipW / 2, B.hipY - 1, B.hipW, 3, '#2A2420'); px(g, -2, B.hipY - 1, 4, 3, '#A1A1AA');
  if (walkie) { part(g, () => g.rect(-B.hipW / 2 - 2, B.hipY - 6, 5, 9), '#27272A', -B.hipW / 2 - 2, B.hipY - 6, 5, 9, 0.8); px(g, -B.hipW / 2 - 1, B.hipY - 12, 1, 6, '#18181B'); px(g, -B.hipW / 2 - 1, B.hipY - 4, 3, 1, '#4ADE80'); }
  part(g, () => { g.moveTo(-6, B.shY); g.lineTo(0, B.shY + 5); g.lineTo(6, B.shY); g.lineTo(5, B.shY + 2); g.lineTo(0, B.shY + 7); g.lineTo(-5, B.shY + 2); g.closePath(); }, lt(polo, 0.25), -6, B.shY, 12, 7, 0.8);
  px(g, -6, B.shY, 12, 1, gold);
  px(g, -B.w / 2 + 1, B.shY + 9, 4, 1, gold); px(g, B.w / 2 - 5, B.shY + 9, 4, 1, gold);
  for (const [x, y] of [[-6, 0], [-3, -2], [0, 0], [3, -2], [6, 0]]) px(g, -6 + x * 0.6, B.shY + 9 + y, 2, 3, gold);
  px(g, -7, B.shY + 12, 9, 2, gold); px(g, -7, B.shY + 12, 9, 1, '#FDE68A');
  nameTag(g, 3, B.shY + 8, polo);
  if (!tell) { px(g, -1, B.shY + 1, 1, 14, '#B91C1C'); ball(g, -0.5, B.shY + 16, 1.8, '#D4D4D8', 0.7); }
  if (hat === 2) ponytail(g, B, gold); else hairBack(g, B);
  face(g, B, F, shove ? 'angry' : 'open', tell ? 'o' : shove ? 'teeth' : 'flat');
  whiskers(g, B);
  if (hat !== 1) hairTop(g, B);
  if (hat === 0) cap(g, B, polo, true);
  else if (hat === 1) { cap(g, B, polo); px(g, B.hx - 1, B.hy - 11, 4, 3, gold); }
  arm(g, B, 1, near[0], near[1], { sleeve: polo, hand: L.skin, len: 0.45 });
  // (the whistle, in the mouth)
  if (tell && !fl) { px(g, B.hx + 9, B.hy + 5, 5, 3, '#D4D4D8'); px(g, B.hx + 13, B.hy + 4, 2, 2, '#71717A'); px(g, B.hx + 9, B.hy + 5, 5, 1, '#FFFFFF'); }
};
export const drawRideop = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['whistle'], ['shove']));
  putFrame(c, 'hwc-rideop2', F, BOX, g => paintRideop(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The janitor

const plunger = (g: Ctx, x: number, y: number, ang: number) => {
  g.save(); g.translate(x, y); g.rotate(ang);
  limb(g, 0, 4, 0, -30, 3, '#A16207');
  px(g, -1, -28, 1, 30, '#D4A040');
  part(g, () => { g.moveTo(-8, -28); g.quadraticCurveTo(0, -42, 8, -28); g.closePath(); }, '#B91C1C', -8, -40, 16, 12, 1);
  px(g, -4, -33, 3, 1, '#F87171');
  g.restore();
};
const paintJanitor = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr);
  const suit = pickOf(F.seed, 3, ['#64748B', '#57534E', '#4D7C0F', '#475569']), glove = '#FACC15';
  const hat = F.seed % 3, spray = F.seed % 2 === 1;
  legs(g, B, { col: suit, shoe: 'boot', shoeCol: '#1C1917', detail: (gg, _h, k, ft) => px(gg, (k[0] + ft[0]) / 2 - B.legW / 2 + 1, (k[1] + ft[1]) / 2 + 2, B.legW - 2, 1, dk(suit, 0.25)) });
  const fl = flailHands(B, F.fr);
  const up = F.pose === 'tell', thrown = F.v === 'thrown';
  const far: [number, number] = fl ? fl[0] : [-B.w / 2 - 2, -31];
  const near: [number, number] = fl ? fl[1] : up ? [-2, B.shY - 14] : F.pose === 'strike' ? [B.w / 2 + 14, B.shY + 10] : [B.w / 2 + 3, -33];
  arm(g, B, -1, far[0], far[1], { sleeve: suit, hand: glove, len: 0.5 });
  torso(g, B, suit);
  // (the bib and its straps, its pocket (a rag hanging out), the name patch; the belt, its keys, the spray bottle)
  part(g, () => g.rect(-7, B.shY + 4, 13, 12), dk(suit, 0.12), -7, B.shY + 4, 13, 12, 0.8);
  px(g, -B.w / 2 + 3, B.shY, 3, 6, dk(suit, 0.2)); px(g, B.w / 2 - 6, B.shY, 3, 6, dk(suit, 0.2));
  px(g, -B.w / 2 + 4, B.shY + 5, 2, 2, '#D4D4D8'); px(g, B.w / 2 - 5, B.shY + 5, 2, 2, '#D4D4D8');
  px(g, -5, B.shY + 7, 4, 7, '#E2E8F0'); px(g, -5, B.shY + 7, 4, 1, '#FFFFFF'); px(g, -4, B.shY + 14, 2, 3, '#CBD5E1');
  part(g, () => g.ellipse(4, B.shY + 9, 3.5, 2.2, 0, 0, Math.PI * 2), '#F8FAFC', 0.5, B.shY + 7, 7, 4.4, 0.7); px(g, 2, B.shY + 9, 4, 1, '#B91C1C');
  px(g, -B.hipW / 2, B.hipY - 2, B.hipW + 1, 3, '#27272A');
  for (let k = 0; k < 3; k++) px(g, B.hipW / 2 - 6 + k * 2, B.hipY + 1 + (k % 2), 1, 3, '#EAB308');
  ball(g, B.hipW / 2 - 4, B.hipY + 1, 1.6, '#A1A1AA', 0.6);
  if (spray) { part(g, () => g.roundRect(-B.hipW / 2 - 4, B.hipY - 3, 5, 10, 1), '#38BDF8', -B.hipW / 2 - 4, B.hipY - 3, 5, 10, 0.8); part(g, () => g.rect(-B.hipW / 2 - 4, B.hipY - 7, 4, 4), '#F8FAFC', -B.hipW / 2 - 4, B.hipY - 7, 4, 4, 0.7); }
  hairBack(g, B);
  face(g, B, F, up ? 'angry' : 'tired', up ? 'teeth' : 'flat');
  whiskers(g, B);
  if (hat !== 0) hairTop(g, B);
  if (hat === 0) cap(g, B, dk(suit, 0.15));
  else if (hat === 1) {
    // (a bandana tied round the head, its knot at the back)
    const ban = pickOf(F.seed, 6, ['#B91C1C', '#1D4ED8', '#15803D']);
    partTop(g, () => { g.moveTo(B.hx - 9, B.hy - 2); g.quadraticCurveTo(B.hx - 8, B.hy - 13, B.hx + 1, B.hy - 12); g.quadraticCurveTo(B.hx + 10, B.hy - 11, B.hx + 10, B.hy - 4); g.lineTo(B.hx - 9, B.hy - 3); g.closePath(); }, ban, B.hx - 9, B.hy - 13, 19, 11, 1);
    part(g, () => { g.moveTo(B.hx - 9, B.hy - 5); g.lineTo(B.hx - 15, B.hy - 2); g.lineTo(B.hx - 13, B.hy + 2); g.closePath(); }, ban, B.hx - 15, B.hy - 5, 6, 7, 0.8);
    for (let k = 0; k < 3; k++) px(g, B.hx - 5 + k * 5, B.hy - 9, 1, 1, '#FFFFFF');
  }
  arm(g, B, 1, near[0], near[1], { sleeve: suit, hand: glove, len: 0.5 });
  if (!fl && !thrown) plunger(g, near[0], near[1], up ? -2.2 : F.pose === 'strike' ? 1.4 : 0.2);
};
export const drawJanitor = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const thrown = e.aiState === 'thrown';
  const F = frameFor(e, f, seed, poseOf(e, ['windup', 'raise'], ['thrown']), thrown ? 'thrown' : '');
  putFrame(c, 'hwc-janitor2', F, BOX, g => paintJanitor(g, F));
};
/** A plunger on its own (thrown, stuck on the floor, stuck on his face), world. */
export const drawPlunger = (c: Ctx, x: number, y: number, rot: number) => {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.fillStyle = INK; c.fillRect(-2, -16, 5, 26);
  c.fillStyle = '#A16207'; c.fillRect(-1, -15, 3, 24);
  c.fillStyle = '#D4A040'; c.fillRect(-1, -15, 1, 24);
  c.fillStyle = INK; c.beginPath(); c.moveTo(-10, 12); c.quadraticCurveTo(0, -2, 10, 12); c.closePath(); c.fill();
  c.fillStyle = '#B91C1C'; c.beginPath(); c.moveTo(-8, 11); c.quadraticCurveTo(0, 0, 8, 11); c.closePath(); c.fill();
  c.fillStyle = '#7F1D1D'; c.fillRect(2, 6, 5, 4);
  c.fillStyle = '#F87171'; c.fillRect(-5, 6, 3, 1);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The docent

const paintDocent = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr);
  const tweed = pickOf(F.seed, 4, ['#7C5A3A', '#6B6B3A', '#7A4B3A', '#5A5A6A']), glove = '#F8FAFC';
  const scarf = B.L.woman && F.seed % 2 === 0, sq = pickOf(F.seed, 5, ['#B91C1C', '#1D4ED8', '#CA8A04']);
  legs(g, B, { col: dk(tweed, 0.3), shoe: B.L.woman ? 'pointy' : 'shoe', shoeCol: '#3F2A14', detail: (gg, _h, k, ft) => px(gg, (k[0] + ft[0]) / 2, (k[1] + ft[1]) / 2 - 2, 1, 5, dk(tweed, 0.45)) });
  const fl = flailHands(B, F.fr);
  const tell = F.pose === 'tell', lunge = F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : lunge ? [-B.w / 2 - 10, B.shY + 2] : [-B.w / 2 - 1, B.hipY - 2];
  const near: [number, number] = fl ? fl[1] : lunge ? [B.w / 2 + 18, B.shY + 10] : tell ? [B.w / 2 + 2, B.shY - 6] : [B.w / 2 + 8, B.shY + 18];
  arm(g, B, -1, far[0], far[1], { sleeve: tweed, hand: glove });
  torso(g, B, '#F5F5F4');
  // (the blazer open over the shirt, flecked; its lapels; a pocket square; a gold star pin)
  part(g, () => { g.moveTo(-B.w / 2, B.shY + 2); g.lineTo(-B.hipW / 2 - 2, B.hipY + 4); g.lineTo(-3, B.hipY + 4); g.lineTo(-3, B.shY + 2); g.closePath(); }, tweed, -B.hipW / 2 - 2, B.shY + 2, B.w / 2 + 2, B.hipY - B.shY + 2, 1);
  part(g, () => { g.moveTo(B.w / 2, B.shY + 2); g.lineTo(B.hipW / 2 + 2, B.hipY + 4); g.lineTo(4, B.hipY + 4); g.lineTo(4, B.shY + 2); g.closePath(); }, tweed, 4, B.shY + 2, B.w / 2 + 2, B.hipY - B.shY + 2, 1);
  for (let k = 0; k < 12; k++) px(g, -B.w / 2 + 2 + ((k * 7) % (B.w - 4)), B.shY + 6 + ((k * 5) % 20), 1, 1, k % 3 ? lt(tweed, 0.3) : dk(tweed, 0.3));
  px(g, -4, B.shY + 2, 2, 9, dk(tweed, 0.25)); px(g, 5, B.shY + 2, 2, 9, dk(tweed, 0.25));
  px(g, 6, B.shY + 9, 4, 2, sq); px(g, 7, B.shY + 8, 2, 1, lt(sq, 0.4));
  px(g, -7, B.shY + 7, 3, 3, '#EAB308'); px(g, -7, B.shY + 7, 1, 1, '#FEF08A');
  dither(g, -B.w / 2, B.hipY - 2, B.w, 4, dk(tweed, 0.2));
  // (the bow tie, or the silk scarf; the DOCENT badge on its red lanyard)
  if (scarf) { part(g, () => { g.moveTo(-6, B.shY); g.lineTo(6, B.shY); g.lineTo(3, B.shY + 4); g.lineTo(5, B.shY + 12); g.lineTo(1, B.shY + 11); g.lineTo(-1, B.shY + 4); g.closePath(); }, sq, -6, B.shY, 12, 12, 0.8); }
  else part(g, () => { g.moveTo(-5, B.shY + 1); g.lineTo(0, B.shY + 4); g.lineTo(5, B.shY + 1); g.lineTo(5, B.shY + 7); g.lineTo(0, B.shY + 4); g.lineTo(-5, B.shY + 7); g.closePath(); }, '#B91C1C', -5, B.shY + 1, 10, 6, 0.8);
  px(g, -2, B.shY + 6, 1, 9, '#B91C1C'); px(g, 2, B.shY + 6, 1, 9, '#B91C1C');
  part(g, () => g.rect(-3, B.shY + 14, 7, 9), '#F8FAFC', -3, B.shY + 14, 7, 9, 0.8); px(g, -2, B.shY + 15, 5, 2, '#7F1D1D'); px(g, -2, B.shY + 18, 4, 1, '#3F3F46'); px(g, -2, B.shY + 20, 5, 1, '#3F3F46');
  hairBack(g, B);
  face(g, B, F, tell ? 'smug' : lunge ? 'angry' : 'open', tell ? 'o' : lunge ? 'teeth' : 'smirk');
  whiskers(g, B);
  // (glasses, always: half-moons, on a chain)
  for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(B.hx + 2.5 + s * 3.6 - 2.8, B.hy - 0.5); g.lineTo(B.hx + 2.5 + s * 3.6 - 2.8, B.hy + 1.5); g.lineTo(B.hx + 2.5 + s * 3.6 + 2.8, B.hy + 1.5); g.lineTo(B.hx + 2.5 + s * 3.6 + 2.8, B.hy - 0.5); g.stroke(); }
  px(g, B.hx - 4, B.hy + 1, 1, 6, '#CA8A04');
  hairTop(g, B);
  arm(g, B, 1, near[0], near[1], { sleeve: tweed, hand: glove });
  // (the brass pointer, out in front: up for the AHEM, thrust for the lunge)
  if (!fl) {
    const a = tell ? -1.2 : lunge ? 0.05 : 0.2;
    g.save(); g.translate(near[0], near[1]); g.rotate(a);
    part(g, () => g.rect(-2, -2, 38, 4), '#CA8A04', -2, -2, 38, 4, 0.9);
    px(g, 0, -1, 34, 1, '#FDE68A');
    ball(g, 37, 0, 2.6, '#FDE68A', 0.8);
    g.restore();
  }
};
export const drawDocent = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['ahem'], ['lunge']));
  putFrame(c, 'hwc-docent2', F, BOX, g => paintDocent(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// Security

const paintGuard = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const jacket = pickOf(F.seed, 2, ['#1F2937', '#1E293B', '#18181B']), shades = F.seed % 3 === 0;
  legs(g, B, { col: '#27272A', shoe: 'boot', shoeCol: '#0C0A09', detail: (gg, _h, k, ft, near) => { if (near) px(gg, (k[0] + ft[0]) / 2 + 1, (k[1] + ft[1]) / 2 - 3, 1, 8, '#3F3F46'); } });
  const fl = flailHands(B, F.fr);
  const aim = F.v === 'aim', up = F.v === 'up', down = F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : aim ? [B.w / 2 + 14, B.shY + 8] : [-B.w / 2 - 3, -30];
  const near: [number, number] = fl ? fl[1] : up ? [B.w / 2 - 4, B.shY - 12] : down ? [B.w / 2 + 16, B.shY + 14] : [B.w / 2 + 4, -33];
  arm(g, B, -1, far[0], far[1], { sleeve: jacket, hand: L.skin });
  // (the flashlight, in the far hand: its lens lit while it's aimed)
  if (!fl) { part(g, () => g.rect(far[0] - 2, far[1] - 4, 14, 7), '#3F3F46', far[0] - 2, far[1] - 4, 14, 7, 1); px(g, far[0], far[1] - 3, 9, 1, '#71717A'); px(g, far[0] + 11, far[1] - 3, 3, 5, aim ? '#FEF9C3' : '#A1A1AA'); if (aim) px(g, far[0] + 12, far[1] - 2, 2, 2, '#FFFFFF'); }
  torso(g, B, jacket, B.shY, B.hipY + 2, 3);
  // (the yellow band, the epaulettes, the badge (stepped), the radio on the shoulder and its cord; the duty belt, cuffs)
  px(g, -B.w / 2 - 1, B.shY + 14, B.w + 4, 4, '#EAB308'); px(g, -B.w / 2 - 1, B.shY + 14, B.w + 4, 1, '#FDE047'); px(g, -B.w / 2 - 1, B.shY + 17, B.w + 4, 1, '#A16207');
  px(g, -B.w / 2 + 1, B.shY, 6, 2, '#3F3F46'); px(g, B.w / 2 - 6, B.shY, 6, 2, '#3F3F46');
  part(g, () => { g.moveTo(4, B.shY + 4); g.lineTo(9, B.shY + 4); g.lineTo(9, B.shY + 9); g.lineTo(6.5, B.shY + 11); g.lineTo(4, B.shY + 9); g.closePath(); }, '#FBBF24', 4, B.shY + 4, 5, 7, 0.8);
  px(g, 5, B.shY + 5, 2, 2, '#FEF3C7');
  part(g, () => g.rect(-B.w / 2 + 2, B.shY + 2, 5, 7), '#18181B', -B.w / 2 + 2, B.shY + 2, 5, 7, 0.8); px(g, -B.w / 2 + 3, B.shY - 3, 1, 5, '#18181B'); px(g, -B.w / 2 + 3, B.shY + 4, 3, 1, '#EF4444');
  g.strokeStyle = '#18181B'; g.lineWidth = 1; g.beginPath(); g.moveTo(-B.w / 2 + 4, B.shY + 9); g.quadraticCurveTo(-B.w / 2 + 1, B.shY + 16, -B.w / 2 + 4, B.shY + 22); g.stroke();
  px(g, -B.hipW / 2 - 1, B.hipY - 2, B.hipW + 3, 4, '#0C0A09'); px(g, -2, B.hipY - 2, 4, 4, '#A1A1AA');
  ball(g, B.hipW / 2 - 3, B.hipY + 1, 2, '#D4D4D8', 0.7); ball(g, B.hipW / 2 + 1, B.hipY + 1, 2, '#D4D4D8', 0.7);
  hairBack(g, B);
  face(g, B, F, 'angry', down ? 'teeth' : 'flat');
  whiskers(g, B);
  // (mirrored aviators on some)
  if (shades) { part(g, () => g.roundRect(B.hx, B.hy - 3, 11, 4, 1.5), '#64748B', B.hx, B.hy - 3, 11, 4, 0.9); px(g, B.hx + 1, B.hy - 2, 3, 1, '#E0F2FE'); px(g, B.hx + 6, B.hy - 2, 3, 1, '#E0F2FE'); }
  hairTop(g, B);
  cap(g, B, '#111827');
  part(g, () => g.rect(B.hx, B.hy - 13, 5, 5), '#FBBF24', B.hx, B.hy - 13, 5, 5, 0.7);
  arm(g, B, 1, near[0], near[1], { sleeve: jacket, hand: L.skin });
  // (the baton)
  if (!fl) {
    const a = up ? -2.0 : down ? 0.8 : 1.3;
    g.save(); g.translate(near[0], near[1]); g.rotate(a);
    part(g, () => g.roundRect(-2, -3, 30, 5, 2), '#18181B', -2, -3, 30, 5, 1);
    px(g, 0, -2, 26, 1, '#52525B'); px(g, 6, -4, 2, 7, '#27272A');
    g.restore();
  }
};
export const drawGuard = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = e.aiState ?? '';
  const v = st === 'aim' ? 'aim' : st === 'swing' && (e.aiTimer ?? 0) < 16 ? 'up' : '';
  const pose: Pose = st === 'aim' || v === 'up' ? 'tell' : st === 'swing' ? 'strike' : moving(e);
  const F = frameFor(e, f, seed, pose, v);
  putFrame(c, 'hwc-guard2', F, BOX, g => paintGuard(g, F));
};
