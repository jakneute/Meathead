// The boulevard's hustlers, drawn (first pass: readable, on Spooky Land's person-in-a-costume drawer, costume.ts, so
// whoever's in the costume shows: their skin, build and face; the wig and the suit over them):
//   marilyn   a platinum wig of curls, a beauty mark, red lips, the white halter dress (it blows up round her for the
//             attack: her hands holding it down), white heels
//   elvis     the black pompadour and sideburns, gold aviators, the white jumpsuit with the high collar, rhinestones and
//             the big gold belt; the hips going for the tell
//   hero      a padded muscle suit (painted-on abs), a domino mask, a cape, the round foam shield on the arm (gone while
//             it's thrown); three color schemes, all knock-offs of nothing in particular
//   pirate    a tricorn over a bandana, beads in the hair, a red frock coat, a cutlass out in front (pointy)
//   statue    a living statue: all of them gold (skin, suit, top hat), stock still in a salute till it moves
// Feet at the origin, facing right (the engine mirrors them). Each frame painted once into a stamp (putFrame).

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, px, limb, ball,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, glasses, hairTop, hairBack, frameOf, putFrame, pickOf,
  moodOf, reaction,
} from '../../spooky/costume';

type Ctx = CanvasRenderingContext2D;

const moving = (e: Enemy, min = 0.3): Pose => (Math.abs(e.vel.x) > min ? 'walk' : 'stand');
const poseOf = (e: Enemy, tells: string[], strikes: string[]): Pose =>
  tells.includes(e.aiState ?? '') ? 'tell' : strikes.includes(e.aiState ?? '') ? 'strike' : moving(e);
const frameFor = (e: Enemy, f: number, seed: number, pose: Pose, woman?: boolean, v = '') => {
  const r = reaction(e);
  return frameOf(seed, f, r?.pose ?? pose, r?.md ?? moodOf(e), 0, woman, v);
};
const BOX: [number, number, number, number] = [-52, -116, 116, 120];
const ownFace = (g: Ctx, B: Body, F: Frame, skin: string, eyes: 'open' | 'angry' | 'wide' | 'tired' | 'smug', mouth: 'flat' | 'grin' | 'smile' | 'teeth' | 'o' | 'smirk') => {
  headShape(g, B, skin);
  faceOn(g, B, { skin, eyes, mouth, md: F.md, blink: F.blink });
};

// ---------------------------------------------------------------------------------------------------------------
// Marilyn

const paintMarilyn = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr, true), L = B.L;
  const up = F.v === 'up';
  legs(g, B, { col: L.skin, shoe: 'pointy', shoeCol: '#F8FAFC' });
  const fl = flailHands(B, F.fr);
  // (the dress: a halter top, a pleated skirt; blown up, a white bell round her waist, her hands pushing it down)
  const hip = B.hipY + 2;
  if (up) {
    part(g, () => { g.moveTo(-B.hipW / 2, hip); g.quadraticCurveTo(-34, hip - 18, -30, hip - 34); g.lineTo(30, hip - 34); g.quadraticCurveTo(34, hip - 18, B.hipW / 2, hip); g.closePath(); }, '#F8FAFC', -34, hip - 34, 68, 34, 1.2);
    for (let k = -3; k <= 3; k++) px(g, k * 8, hip - 30, 1, 22, '#D4D4D8');
  } else {
    part(g, () => { g.moveTo(-B.hipW / 2 + 1, hip - 4); g.lineTo(-B.hipW / 2 - 6, hip + 18); g.lineTo(B.hipW / 2 + 6, hip + 18); g.lineTo(B.hipW / 2 - 1, hip - 4); g.closePath(); }, '#F8FAFC', -B.hipW / 2 - 6, hip - 4, B.hipW + 12, 22, 1.2);
    for (let k = -2; k <= 2; k++) px(g, k * 5, hip + 2, 1, 15, '#D4D4D8');
  }
  const far: [number, number] = fl ? fl[0] : up ? [-14, hip - 6] : F.pose === 'tell' ? [-10, hip + 2] : [-B.w / 2 - 2, -30];
  const near: [number, number] = fl ? fl[1] : up ? [14, hip - 6] : F.pose === 'tell' ? [10, hip + 2] : [B.w / 2 + 3, B.shY + 14];
  arm(g, B, -1, far[0], far[1], { sleeve: L.skin, hand: L.skin });
  torso(g, B, '#F8FAFC');
  // (the halter's neckline: skin in a V)
  part(g, () => { g.moveTo(-5, B.shY); g.lineTo(0, B.shY + 12); g.lineTo(6, B.shY); g.closePath(); }, L.skin, -5, B.shY, 11, 12, 0.6);
  // (the platinum curls: a puffed wig, the beauty mark, red lips)
  const wig = '#FDF4C4';
  hairBack(g, B, wig, 10);
  ownFace(g, B, F, L.skin, F.pose === 'tell' ? 'smug' : 'open', 'smile');
  px(g, B.hx + 3.5, B.hy + 6, 4, 1.5, '#DC2626');
  px(g, B.hx + 7, B.hy + 3.5, 1, 1, INK);
  for (const [dx, dy] of [[-7, -7], [-2, -10], [4, -10], [8, -6], [-9, -1]]) ball(g, B.hx + dx, B.hy + dy, 4.2, wig, 0.9);
  arm(g, B, 1, near[0], near[1], { sleeve: L.skin, hand: L.skin });
  // (her camera, up for the photo)
  if (F.pose === 'tell' && !up && !fl) { part(g, () => g.rect(near[0] - 4, near[1] - 18, 12, 9), '#27272A', near[0] - 4, near[1] - 18, 12, 9, 1); px(g, near[0] + 2, near[1] - 15, 3, 3, '#93C5FD'); }
};
export const drawMarilyn = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const up = e.aiState === 'gust';
  const F = frameFor(e, f, seed, up ? 'strike' : poseOf(e, ['pose', 'billow'], []), true, up ? 'up' : '');
  putFrame(c, 'hw-marilyn', F, BOX, g => paintMarilyn(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// Elvis

const paintElvis = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr, false), L = B.L;
  const suit = '#F8FAFC', gold = '#EAB308';
  // (the hips, going: the body swung side to side for the tell)
  const sway = F.pose === 'tell' ? (F.fr % 2 ? 3 : -3) : 0;
  g.translate(sway, 0);
  legs(g, B, { col: suit, shoe: 'boot', shoeCol: '#F8FAFC', detail: (gg, _h, k, ft) => { px(gg, (k[0] + ft[0]) / 2 - 4, ft[1] - 8, 9, 3, gold); } });
  const fl = flailHands(B, F.fr);
  const kick = F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : F.pose === 'tell' ? [-B.w / 2 - 8, B.shY - 4] : [-B.w / 2 - 2, -30];
  const near: [number, number] = fl ? fl[1] : kick ? [B.w / 2 + 16, B.shY + 2] : F.pose === 'tell' ? [B.w / 2 + 6, B.shY + 20] : [B.w / 2 + 2, -31];
  arm(g, B, -1, far[0], far[1], { sleeve: suit, hand: L.skin });
  torso(g, B, suit);
  // (the rhinestones, the deep V, the big gold belt)
  part(g, () => { g.moveTo(-4, B.shY); g.lineTo(1, B.shY + 14); g.lineTo(6, B.shY); g.closePath(); }, L.skin, -4, B.shY, 10, 14, 0.6);
  part(g, () => g.rect(-B.hipW / 2, B.hipY - 4, B.hipW + 2, 6), gold, -B.hipW / 2, B.hipY - 4, B.hipW + 2, 6, 1);
  for (let k = 0; k < 6; k++) px(g, -8 + (k % 3) * 8, B.shY + 6 + Math.floor(k / 3) * 8, 2, 2, (k + F.fr) % 2 ? '#FDE68A' : '#60A5FA');
  // (the high collar)
  part(g, () => { g.moveTo(-10, B.shY + 2); g.lineTo(-12, B.shY - 8); g.lineTo(-4, B.shY - 2); g.closePath(); }, suit, -12, B.shY - 8, 8, 10, 0.8);
  // (the pompadour and the sideburns: black, whatever's under it; gold aviators)
  const hair = '#111827';
  ownFace(g, B, F, L.skin, F.pose === 'tell' ? 'smug' : 'open', F.pose === 'tell' ? 'smirk' : 'flat');
  part(g, () => { g.moveTo(B.hx - 9, B.hy - 1); g.quadraticCurveTo(B.hx - 9, B.hy - 15, B.hx + 3, B.hy - 17); g.quadraticCurveTo(B.hx + 15, B.hy - 17, B.hx + 13, B.hy - 9); g.quadraticCurveTo(B.hx + 6, B.hy - 9, B.hx + 2, B.hy - 7); g.quadraticCurveTo(B.hx - 4, B.hy - 5, B.hx - 6, B.hy + 3); g.closePath(); }, hair, B.hx - 9, B.hy - 17, 24, 20, 1);
  px(g, B.hx - 6, B.hy - 1, 3, 9, hair);
  part(g, () => g.roundRect(B.hx, B.hy - 3, 11, 4, 1), gold, B.hx, B.hy - 3, 11, 4, 0.8);
  arm(g, B, 1, near[0], near[1], { sleeve: suit, hand: L.skin });
  void glasses; void whiskers;
};
export const drawElvis = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['pose', 'shake'], ['kick']), false);
  putFrame(c, 'hw-elvis', F, BOX, g => paintElvis(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The caped hero

const HERO_SCHEMES: [string, string, string][] = [['#1D4ED8', '#DC2626', '#FACC15'], ['#15803D', '#CA8A04', '#F8FAFC'], ['#7E22CE', '#18181B', '#22D3EE']];
const paintHero = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const [suit, cape, trim] = pickOf(F.seed, 3, HERO_SCHEMES);
  // (the cape behind, hanging or flapping)
  const flap = F.pose === 'walk' ? Math.sin(F.fr) * 4 : 0;
  part(g, () => { g.moveTo(-B.w / 2 + 2, B.shY + 2); g.lineTo(-B.w / 2 - 12 + flap, -6); g.lineTo(B.w / 2 - 6, -10); g.lineTo(B.w / 2 - 2, B.shY + 2); g.closePath(); }, cape, -B.w / 2 - 12, B.shY + 2, B.w + 12, -B.shY - 8, 1.2);
  legs(g, B, { col: suit, shoe: 'boot', shoeCol: cape });
  const fl = flailHands(B, F.fr);
  const shield = F.v !== 'thrown';
  const far: [number, number] = fl ? fl[0] : F.pose === 'tell' ? [-B.w / 2 - 4, B.shY + 10] : [-B.w / 2 + 2, B.hipY - 4];
  // (the shield held up square in front of him, chest high: a proper guard; cocked back to throw for the tell)
  const near: [number, number] = fl ? fl[1] : F.pose === 'tell' ? [B.w / 2 + 12, B.shY + 2] : F.v === 'thrown' ? [B.w / 2 - 2, B.hipY - 4] : [B.w / 2 + 6, B.shY + 16];
  arm(g, B, -1, far[0], far[1], { sleeve: suit, hand: trim });
  torso(g, B, suit, B.shY, B.hipY + 2, 4);
  // (painted-on abs and pecs; the trunks; the emblem)
  for (let k = 0; k < 3; k++) { px(g, -5, B.shY + 14 + k * 5, 4, 1, dk(suit, 0.35)); px(g, 3, B.shY + 14 + k * 5, 4, 1, dk(suit, 0.35)); }
  px(g, -8, B.shY + 9, 16, 1, dk(suit, 0.35));
  part(g, () => g.rect(-B.hipW / 2 - 2, B.hipY - 3, B.hipW + 6, 7), cape, -B.hipW / 2 - 2, B.hipY - 3, B.hipW + 6, 7, 1);
  part(g, () => { g.moveTo(0, B.shY + 2); g.lineTo(6, B.shY + 7); g.lineTo(0, B.shY + 12); g.lineTo(-6, B.shY + 7); g.closePath(); }, trim, -6, B.shY + 2, 12, 10, 0.8);
  hairBack(g, B);
  ownFace(g, B, F, L.skin, 'angry', F.pose === 'tell' ? 'teeth' : 'smirk');
  // (the domino mask)
  part(g, () => g.roundRect(B.hx - 4, B.hy - 4, 14, 5, 2), INK, B.hx - 4, B.hy - 4, 14, 5, 0.6);
  px(g, B.hx - 1, B.hy - 3, 2, 2, '#F8FAFC'); px(g, B.hx + 5, B.hy - 3, 2, 2, '#F8FAFC');
  hairTop(g, B);
  arm(g, B, 1, near[0], near[1], { sleeve: suit, hand: trim });
  if (shield && !fl) {
    // (the round shield: big, rings and a star; side on in front of him (an oval), flat on cocked back to throw)
    const sx = F.pose === 'tell' ? near[0] + 3 : near[0] + 6, sy = near[1] - 2, guard = F.pose !== 'tell';
    for (const [r, col] of [[17, '#1A0B06'], [16, '#DC2626'], [12, '#F8FAFC'], [8, '#DC2626'], [5, '#2563EB']] as const)
      part(g, () => g.ellipse(sx, sy, guard ? r * 0.42 : r, r, 0, 0, Math.PI * 2), col, sx - r, sy - r, r * 2, r * 2, r === 17 ? 1.2 : 0.5);
    px(g, sx - 1, sy - 1, 2, 2, '#F8FAFC');
    if (guard) px(g, sx + 4, sy - 14, 2, 26, lt('#DC2626', 0.4));
  }
};
export const drawHero = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['pose', 'aim'], ['thrown']), undefined, e.isShieldActive === false ? 'thrown' : '');
  putFrame(c, 'hw-hero', F, BOX, g => paintHero(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The pirate captain

const paintPirate = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const coat = pickOf(F.seed, 5, ['#991B1B', '#1E3A8A', '#4C1D95']);
  // (a drunk's lean)
  g.rotate(Math.sin(F.fr * 0.9 + F.seed) * 0.04);
  legs(g, B, { col: '#57534E', shoe: 'boot', shoeCol: '#292524' });
  const fl = flailHands(B, F.fr);
  const far: [number, number] = fl ? fl[0] : [-B.w / 2 - 4, B.shY + 18];
  const near: [number, number] = fl ? fl[1] : F.pose === 'tell' ? [B.w / 2 - 4, B.shY - 10] : F.pose === 'strike' ? [B.w / 2 + 18, B.shY + 14] : [B.w / 2 + 8, B.shY + 20];
  arm(g, B, -1, far[0], far[1], { sleeve: coat, hand: L.skin });
  // (the bottle in the far hand)
  if (!fl) { part(g, () => g.roundRect(far[0] - 3, far[1] - 12, 6, 12, 2), '#166534', far[0] - 3, far[1] - 12, 6, 12, 0.8); }
  torso(g, B, '#F5F5F4');
  // (the coat open over the shirt, a sash)
  part(g, () => { g.moveTo(-B.w / 2, B.shY + 2); g.lineTo(-B.hipW / 2 - 4, B.hipY + 10); g.lineTo(-4, B.hipY + 10); g.lineTo(-3, B.shY + 2); g.closePath(); }, coat, -B.hipW / 2 - 4, B.shY + 2, B.w / 2 + 4, B.hipY - B.shY + 8, 1);
  part(g, () => { g.moveTo(B.w / 2, B.shY + 2); g.lineTo(B.hipW / 2 + 4, B.hipY + 10); g.lineTo(5, B.hipY + 10); g.lineTo(4, B.shY + 2); g.closePath(); }, coat, 4, B.shY + 2, B.w / 2 + 4, B.hipY - B.shY + 8, 1);
  px(g, -B.hipW / 2, B.hipY - 4, B.hipW, 4, '#B91C1C');
  hairBack(g, B, B.L.hair, 18);
  ownFace(g, B, F, L.skin, F.pose === 'tell' ? 'angry' : 'tired', F.pose === 'strike' ? 'teeth' : 'smirk');
  whiskers(g, B);
  // (eyeliner; the bandana and the tricorn; beads)
  px(g, B.hx + 1, B.hy - 3, 8, 1, INK);
  part(g, () => g.rect(B.hx - 9, B.hy - 9, 19, 4), '#B91C1C', B.hx - 9, B.hy - 9, 19, 4, 0.8);
  part(g, () => { g.moveTo(B.hx - 16, B.hy - 9); g.quadraticCurveTo(B.hx, B.hy - 26, B.hx + 17, B.hy - 9); g.quadraticCurveTo(B.hx, B.hy - 14, B.hx - 16, B.hy - 9); g.closePath(); }, '#1C1917', B.hx - 16, B.hy - 22, 33, 14, 1);
  px(g, B.hx - 10, B.hy + 4, 2, 2, '#F59E0B'); px(g, B.hx - 11, B.hy + 9, 2, 2, '#38BDF8');
  arm(g, B, 1, near[0], near[1], { sleeve: coat, hand: L.skin });
  // (the cutlass: out in front, up for the windup, swept down for the slash)
  if (!fl) {
    const a = F.pose === 'tell' ? -1.9 : F.pose === 'strike' ? 0.35 : -0.25;
    g.save(); g.translate(near[0], near[1]); g.rotate(a);
    part(g, () => g.rect(-2, -3, 6, 6), '#CA8A04', -2, -3, 6, 6, 0.8);
    part(g, () => { g.moveTo(4, -2); g.lineTo(30, -4); g.quadraticCurveTo(36, -2, 32, 2); g.lineTo(4, 2); g.closePath(); }, '#D4D4D8', 4, -4, 32, 6, 1);
    px(g, 6, -1, 24, 1, lt('#D4D4D8', 0.6));
    g.restore();
  }
};
export const drawPirate = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['pose', 'wind'], ['slash']));
  putFrame(c, 'hw-pirate', F, BOX, g => paintPirate(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The living statue

const GOLD = '#D4A017';
const paintStatue = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), still = F.v === 'still';
  legs(g, B, { col: GOLD, shoe: 'shoe', shoeCol: dk(GOLD, 0.2), skin: GOLD });
  const fl = flailHands(B, F.fr);
  // (the salute, frozen; moving, it's a hustler like the rest)
  const far: [number, number] = fl ? fl[0] : still ? [-B.w / 2 - 2, B.hipY - 2] : [-B.w / 2 - 2, -30];
  const near: [number, number] = fl ? fl[1] : still ? [B.hx + 6, B.hy - 6] : F.pose === 'tell' ? [B.w / 2 + 8, B.shY + 4] : [B.w / 2 + 2, -31];
  arm(g, B, -1, far[0], far[1], { sleeve: GOLD, hand: GOLD });
  torso(g, B, GOLD);
  px(g, -2, B.shY + 4, 3, B.hipY - B.shY - 6, dk(GOLD, 0.3));
  ownFace(g, { ...B }, F, lt(GOLD, 0.15), still ? 'tired' : 'angry', still ? 'flat' : 'grin');
  // (the top hat, gold)
  part(g, () => g.rect(B.hx - 7, B.hy - 24, 15, 14), GOLD, B.hx - 7, B.hy - 24, 15, 14, 1);
  part(g, () => g.rect(B.hx - 11, B.hy - 11, 23, 3), GOLD, B.hx - 11, B.hy - 11, 23, 3, 1);
  arm(g, B, 1, near[0], near[1], { sleeve: GOLD, hand: GOLD });
  // (the gold's shine: a few glints)
  for (const [x, y] of [[-6, B.shY + 8], [4, B.hipY - 10], [B.hx - 3, B.hy - 20]]) px(g, x, y, 2, 1, '#FEF3C7');
};
export const drawStatue = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const still = (e.aiState ?? 'still') === 'still' && e.health > 0;
  // (still: one frame, no blink, no breathing)
  const F = still ? frameOf(seed, 0, 'stand', 'ok', 0, undefined, 'still') : frameFor(e, f, seed, poseOf(e, ['pose'], []));
  if (still) F.blink = false;
  putFrame(c, 'hw-statue', F, BOX, g => paintStatue(g, F));
};
void limb;
