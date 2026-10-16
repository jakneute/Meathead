// The boulevard's hustlers, drawn (peak SNES, on Spooky Land's person-in-a-costume drawer, costume.ts, so whoever's in
// the costume shows: their skin, build and face, man or woman; the wig and the suit over them, every material in
// steps, inked round). Each is seeded: no two on the street quite the same.
//   marilyn   a wig of curls (platinum, champagne, a cheap yellow), a beauty mark, red lips, pearls; the halter dress
//             (white, blush, a knock-off sky blue) that blows up round her for the attack (her hands holding it down),
//             white heels
//   elvis     the black pompadour and sideburns, gold aviators, the jumpsuit (white, black, gold lame, powder blue)
//             with the high collar, rhinestones, the big gold belt, a scarf; a cape on some; PHOTOS $20 hung off the
//             belt on some; the hips going for the tell
//   hero      a padded muscle suit (painted-on abs), a domino mask or a cowl, a cape, an emblem (a star, a bolt, a
//             diamond, a ring); the round foam shield on the arm (gone while it's thrown); five schemes, all knock-offs
//             of nothing in particular
//   pirate    a tricorn (a plume on some) over a bandana, beads and braids in the hair, an eye patch on some, a frock
//             coat, a cutlass out in front (pointy), a bottle; a parrot on the shoulder of the odd one
//   statue    a living statue: all of it one metal (gold, silver, bronze), stock still in a pose (a salute, pointing to
//             the sky, the thinker) till it moves; a top hat, a laurel or a crown; the paint flaking at the hems
// Feet at the origin, facing right (the engine mirrors them). Each frame painted once into a stamp (putFrame).

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, partTop, px, limb, ball, dither,
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
const BOX: [number, number, number, number] = [-56, -124, 124, 128];
const ownFace = (g: Ctx, B: Body, F: Frame, skin: string, eyes: 'open' | 'angry' | 'wide' | 'tired' | 'smug', mouth: 'flat' | 'grin' | 'smile' | 'teeth' | 'o' | 'smirk') => {
  headShape(g, B, skin);
  faceOn(g, B, { skin, eyes, mouth, md: F.md, blink: F.blink });
};
/** A cape behind the shoulders, hanging or flapping, its lining showing at the edge. */
const cape = (g: Ctx, B: Body, F: Frame, col: string, lining: string, len = -6) => {
  const flap = F.pose === 'walk' ? Math.sin(F.fr) * 4 : F.pose === 'thrown' ? -8 : 0;
  part(g, () => { g.moveTo(-B.w / 2 + 2, B.shY + 2); g.lineTo(-B.w / 2 - 12 + flap, len); g.lineTo(B.w / 2 - 6, len - 4); g.lineTo(B.w / 2 - 2, B.shY + 2); g.closePath(); }, col, -B.w / 2 - 12, B.shY + 2, B.w + 12, len - B.shY - 2, 1.2);
  part(g, () => { g.moveTo(-B.w / 2 - 12 + flap, len); g.lineTo(-B.w / 2 - 6 + flap, len); g.lineTo(-B.w / 2 + 2, B.shY + 8); g.lineTo(-B.w / 2 + 1, B.shY + 4); g.closePath(); }, lining, -B.w / 2 - 12, B.shY + 4, 14, len - B.shY - 4, 0.6);
};

// ---------------------------------------------------------------------------------------------------------------
// Marilyn

const WIGS = ['#FDF4C4', '#F2E2A0', '#FFF8E8', '#EED46A'];
const DRESSES = ['#F8FAFC', '#F8FAFC', '#FBD5DC', '#CFE6F8'];
const paintMarilyn = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr, true), L = B.L;
  const up = F.v === 'up', wig = pickOf(F.seed, 2, WIGS), dress = pickOf(F.seed, 4, DRESSES), pleat = dk(dress, 0.18);
  legs(g, B, { col: L.skin, shoe: 'pointy', shoeCol: lt(dress, 0.3) });
  const fl = flailHands(B, F.fr);
  // (the dress: a halter top, a pleated skirt; blown up, a bell round her waist, her hands pushing it down)
  const hip = B.hipY + 2;
  if (up) {
    part(g, () => { g.moveTo(-B.hipW / 2, hip); g.quadraticCurveTo(-36, hip - 18, -32, hip - 36); g.lineTo(32, hip - 36); g.quadraticCurveTo(36, hip - 18, B.hipW / 2, hip); g.closePath(); }, dress, -36, hip - 36, 72, 36, 1.2);
    for (let k = -3; k <= 3; k++) px(g, k * 8, hip - 32, 1, 24, pleat);
    px(g, -30, hip - 36, 60, 2, lt(dress, 0.5));
  } else {
    part(g, () => { g.moveTo(-B.hipW / 2 + 1, hip - 4); g.lineTo(-B.hipW / 2 - 7, hip + 18); g.lineTo(B.hipW / 2 + 7, hip + 18); g.lineTo(B.hipW / 2 - 1, hip - 4); g.closePath(); }, dress, -B.hipW / 2 - 7, hip - 4, B.hipW + 14, 22, 1.2);
    for (let k = -2; k <= 2; k++) px(g, k * 5, hip + 2, 1, 15, pleat);
    dither(g, -B.hipW / 2 - 4, hip + 12, B.hipW + 8, 5, pleat);
  }
  const far: [number, number] = fl ? fl[0] : up ? [-14, hip - 6] : F.pose === 'tell' ? [-10, hip + 2] : [-B.w / 2 - 2, -30];
  const near: [number, number] = fl ? fl[1] : up ? [14, hip - 6] : F.pose === 'tell' ? [10, hip + 2] : [B.w / 2 + 3, B.shY + 14];
  arm(g, B, -1, far[0], far[1], { sleeve: L.skin, hand: L.skin });
  torso(g, B, dress);
  // (the halter's neckline: skin in a V, the straps up round the neck; a belt at the waist; pearls)
  part(g, () => { g.moveTo(-5, B.shY); g.lineTo(0, B.shY + 13); g.lineTo(6, B.shY); g.closePath(); }, L.skin, -5, B.shY, 11, 13, 0.6);
  px(g, -B.hipW / 2, B.hipY - 3, B.hipW, 2, pleat);
  for (let k = 0; k < 5; k++) px(g, -4 + k * 2, B.shY + 1 + Math.abs(k - 2) * 0.6, 1.5, 1.5, '#FFFFFF');
  // (the curls: a puffed wig, stepped; the beauty mark, red lips, a pearl earring)
  hairBack(g, B, wig, 10);
  ownFace(g, B, F, L.skin, F.pose === 'tell' ? 'smug' : 'open', 'smile');
  px(g, B.hx + 3.5, B.hy + 6, 4, 1.5, '#DC2626'); px(g, B.hx + 4, B.hy + 7, 3, 1, '#9B1C1C');
  px(g, B.hx + (F.seed % 2 ? 7 : 0), B.hy + 3.5, 1, 1, INK);
  px(g, B.hx - 8, B.hy + 4, 2, 2, '#FFFFFF');
  for (const [dx, dy] of [[-7, -7], [-2, -10], [4, -10], [8, -6], [-9, -1], [1, -12]]) ball(g, B.hx + dx, B.hy + dy, 4.2, wig, 0.9);
  for (const [dx, dy] of [[-6, -9], [-1, -12], [5, -12]]) px(g, B.hx + dx, B.hy + dy, 2, 1, lt(wig, 0.6));
  arm(g, B, 1, near[0], near[1], { sleeve: L.skin, hand: L.skin });
  // (her camera, up for the photo)
  if (F.pose === 'tell' && !up && !fl) { part(g, () => g.rect(near[0] - 4, near[1] - 18, 12, 9), '#27272A', near[0] - 4, near[1] - 18, 12, 9, 1); px(g, near[0] + 2, near[1] - 15, 3, 3, '#93C5FD'); px(g, near[0] - 3, near[1] - 17, 2, 1, '#E5E7EB'); }
};
export const drawMarilyn = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const up = e.aiState === 'gust';
  const F = frameFor(e, f, seed, up ? 'strike' : poseOf(e, ['pose', 'billow'], []), true, up ? 'up' : '');
  putFrame(c, 'hw-marilyn2', F, BOX, g => paintMarilyn(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// Elvis

const SUITS = ['#F8FAFC', '#F8FAFC', '#1C1A22', '#E8C25A', '#B8D4EE'];
const paintElvis = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr, false), L = B.L;
  const suit = pickOf(F.seed, 3, SUITS), gold = '#EAB308', dark = suit === '#1C1A22', trim = dark ? '#E8C25A' : '#C8962E';
  const scarf = pickOf(F.seed, 5, ['#DC2626', '#2563EB', '#F8FAFC', '#7E22CE']), caped = F.seed % 3 === 0, card = F.seed % 4 === 1;
  // (the hips, going: the body swung side to side for the tell)
  const sway = F.pose === 'tell' ? (F.fr % 2 ? 3 : -3) : 0;
  g.translate(sway, 0);
  if (caped) cape(g, B, F, suit, dk(scarf, 0.1), -14);
  legs(g, B, { col: suit, shoe: 'boot', shoeCol: dark ? '#1C1A22' : '#F8FAFC', detail: (gg, _h, k, ft) => { px(gg, (k[0] + ft[0]) / 2 - 4, ft[1] - 8, 9, 3, gold); px(gg, (k[0] + ft[0]) / 2 - 3, ft[1] - 8, 3, 1, lt(gold, 0.5)); } });
  const fl = flailHands(B, F.fr);
  const kick = F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : F.pose === 'tell' ? [-B.w / 2 - 8, B.shY - 4] : [-B.w / 2 - 2, -30];
  const near: [number, number] = fl ? fl[1] : kick ? [B.w / 2 + 16, B.shY + 2] : F.pose === 'tell' ? [B.w / 2 + 6, B.shY + 20] : [B.w / 2 + 2, -31];
  arm(g, B, -1, far[0], far[1], { sleeve: suit, hand: L.skin });
  torso(g, B, suit);
  // (the deep V, the rhinestones (catching the light by frame), the big gold belt and its buckle)
  part(g, () => { g.moveTo(-4, B.shY); g.lineTo(1, B.shY + 15); g.lineTo(6, B.shY); g.closePath(); }, L.skin, -4, B.shY, 10, 15, 0.6);
  part(g, () => g.rect(-B.hipW / 2, B.hipY - 5, B.hipW + 2, 7), gold, -B.hipW / 2, B.hipY - 5, B.hipW + 2, 7, 1);
  part(g, () => g.roundRect(-4, B.hipY - 7, 9, 10, 2), lt(gold, 0.2), -4, B.hipY - 7, 9, 10, 0.8);
  px(g, -1, B.hipY - 4, 3, 3, '#DC2626');
  for (let k = 0; k < 8; k++) px(g, -9 + (k % 4) * 6, B.shY + 6 + Math.floor(k / 4) * 8, 2, 2, (k + F.fr) % 3 ? trim : '#FFFFFF');
  for (let k = 0; k < 4; k++) px(g, -B.w / 2 + 2, B.shY + 6 + k * 6, 1, 2, trim);
  // (the scarf round his neck, its ends hanging)
  part(g, () => { g.moveTo(-8, B.shY - 1); g.lineTo(8, B.shY - 1); g.lineTo(6, B.shY + 3); g.lineTo(-6, B.shY + 3); g.closePath(); }, scarf, -8, B.shY - 1, 16, 4, 0.8);
  part(g, () => { g.moveTo(-6, B.shY + 2); g.lineTo(-9, B.shY + 14); g.lineTo(-5, B.shY + 13); g.lineTo(-3, B.shY + 3); g.closePath(); }, scarf, -9, B.shY + 2, 6, 12, 0.8);
  // (the high collar)
  part(g, () => { g.moveTo(-10, B.shY + 2); g.lineTo(-13, B.shY - 9); g.lineTo(-4, B.shY - 2); g.closePath(); }, suit, -13, B.shY - 9, 9, 11, 0.8);
  // (the pompadour, stepped, a shine along it; the sideburns; gold aviators)
  const hair = '#111827';
  ownFace(g, B, F, L.skin, F.pose === 'tell' ? 'smug' : 'open', F.pose === 'tell' ? 'smirk' : 'flat');
  part(g, () => { g.moveTo(B.hx - 9, B.hy - 1); g.quadraticCurveTo(B.hx - 9, B.hy - 16, B.hx + 3, B.hy - 18); g.quadraticCurveTo(B.hx + 16, B.hy - 18, B.hx + 14, B.hy - 9); g.quadraticCurveTo(B.hx + 6, B.hy - 9, B.hx + 2, B.hy - 7); g.quadraticCurveTo(B.hx - 4, B.hy - 5, B.hx - 6, B.hy + 3); g.closePath(); }, hair, B.hx - 9, B.hy - 18, 25, 21, 1);
  px(g, B.hx - 4, B.hy - 16, 9, 1, '#4B5563'); px(g, B.hx + 5, B.hy - 15, 5, 1, '#374151');
  px(g, B.hx - 6, B.hy - 1, 3, 10, hair); px(g, B.hx + 7, B.hy - 2, 2, 7, hair);
  part(g, () => g.roundRect(B.hx, B.hy - 3, 11, 4, 1), gold, B.hx, B.hy - 3, 11, 4, 0.8);
  px(g, B.hx + 1, B.hy - 2, 2, 1, '#FFFFFF');
  // (PHOTOS $20 on a card off his belt)
  if (card && !fl) { part(g, () => g.rect(B.hipW / 2 - 4, B.hipY - 2, 14, 10), '#D8B080', B.hipW / 2 - 4, B.hipY - 2, 14, 10, 0.8); px(g, B.hipW / 2 - 2, B.hipY + 1, 10, 1, '#3A2408'); px(g, B.hipW / 2 - 1, B.hipY + 4, 7, 1, '#B4243A'); }
  arm(g, B, 1, near[0], near[1], { sleeve: suit, hand: L.skin });
  void glasses; void whiskers;
};
export const drawElvis = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['pose', 'shake'], ['kick']), false);
  putFrame(c, 'hw-elvis2', F, BOX, g => paintElvis(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The caped hero

const HERO_SCHEMES: [string, string, string][] = [
  ['#1D4ED8', '#DC2626', '#FACC15'], ['#15803D', '#CA8A04', '#F8FAFC'], ['#7E22CE', '#18181B', '#22D3EE'],
  ['#B91C1C', '#1E3A8A', '#F8FAFC'], ['#0F766E', '#F97316', '#FDE047'],
];
const paintHero = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const [suit, capeCol, trim] = pickOf(F.seed, 3, HERO_SCHEMES), cowl = F.seed % 3 === 1, emblem = F.seed % 4;
  cape(g, B, F, capeCol, dk(capeCol, 0.3));
  legs(g, B, { col: suit, shoe: 'boot', shoeCol: capeCol, detail: (gg, _h, k, ft) => px(gg, (k[0] + ft[0]) / 2 - 4, ft[1] - 9, 9, 2, dk(capeCol, 0.2)) });
  const fl = flailHands(B, F.fr);
  const shield = F.v !== 'thrown';
  const far: [number, number] = fl ? fl[0] : F.pose === 'tell' ? [-B.w / 2 - 4, B.shY + 10] : [-B.w / 2 + 2, B.hipY - 4];
  // (the shield held up square in front of him, chest high: a proper guard; cocked back to throw for the tell)
  const near: [number, number] = fl ? fl[1] : F.pose === 'tell' ? [B.w / 2 + 12, B.shY + 2] : F.v === 'thrown' ? [B.w / 2 - 2, B.hipY - 4] : [B.w / 2 + 6, B.shY + 16];
  arm(g, B, -1, far[0], far[1], { sleeve: suit, hand: trim });
  torso(g, B, suit, B.shY, B.hipY + 2, 4);
  // (the padding: painted-on pecs and abs, the shading under them; the trunks; the belt; the emblem)
  for (let k = 0; k < 3; k++) { px(g, -5, B.shY + 15 + k * 5, 4, 1, dk(suit, 0.35)); px(g, 3, B.shY + 15 + k * 5, 4, 1, dk(suit, 0.35)); px(g, -5, B.shY + 16 + k * 5, 4, 1, lt(suit, 0.2)); }
  px(g, -9, B.shY + 10, 18, 1, dk(suit, 0.35)); px(g, 0, B.shY + 10, 1, 4, dk(suit, 0.35));
  part(g, () => g.rect(-B.hipW / 2 - 2, B.hipY - 3, B.hipW + 6, 7), capeCol, -B.hipW / 2 - 2, B.hipY - 3, B.hipW + 6, 7, 1);
  px(g, -B.hipW / 2 - 2, B.hipY - 4, B.hipW + 6, 2, trim);
  const ey = B.shY + 6;
  if (emblem === 0) part(g, () => { g.moveTo(0, ey - 4); g.lineTo(6, ey + 1); g.lineTo(0, ey + 6); g.lineTo(-6, ey + 1); g.closePath(); }, trim, -6, ey - 4, 12, 10, 0.8);
  else if (emblem === 1) part(g, () => { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 2.4 : 6; g.lineTo(Math.cos(a) * r, ey + 1 + Math.sin(a) * r); } g.closePath(); }, trim, -6, ey - 5, 12, 12, 0.8);
  else if (emblem === 2) part(g, () => { g.moveTo(2, ey - 5); g.lineTo(-4, ey + 1); g.lineTo(0, ey + 1); g.lineTo(-2, ey + 7); g.lineTo(5, ey - 1); g.lineTo(1, ey - 1); g.closePath(); }, trim, -4, ey - 5, 9, 12, 0.8);
  else part(g, () => g.arc(0, ey + 1, 5.5, 0, Math.PI * 2), trim, -5.5, ey - 4.5, 11, 11, 0.8);
  hairBack(g, B);
  ownFace(g, B, F, L.skin, 'angry', F.pose === 'tell' ? 'teeth' : 'smirk');
  if (cowl) {
    // (a cowl over the head: its little ears, the eye holes; the jaw his own)
    part(g, () => { g.moveTo(B.hx - B.rx - 1, B.hy + 3); g.lineTo(B.hx - B.rx - 1, B.hy - 6); g.lineTo(B.hx - 6, B.hy - B.ry - 6); g.lineTo(B.hx - 3, B.hy - B.ry - 1); g.lineTo(B.hx + 4, B.hy - B.ry - 1); g.lineTo(B.hx + 7, B.hy - B.ry - 6); g.lineTo(B.hx + B.rx + 1, B.hy - 6); g.lineTo(B.hx + B.rx + 1, B.hy - 1); g.lineTo(B.hx - 2, B.hy + 1); g.closePath(); }, capeCol, B.hx - B.rx - 1, B.hy - B.ry - 6, B.rx * 2 + 2, B.ry + 9, 1);
    px(g, B.hx - 1, B.hy - 3, 3, 2, '#F8FAFC'); px(g, B.hx + 5, B.hy - 3, 3, 2, '#F8FAFC');
  } else {
    // (the domino mask)
    part(g, () => g.roundRect(B.hx - 4, B.hy - 4, 14, 5, 2), INK, B.hx - 4, B.hy - 4, 14, 5, 0.6);
    px(g, B.hx - 1, B.hy - 3, 2, 2, '#F8FAFC'); px(g, B.hx + 5, B.hy - 3, 2, 2, '#F8FAFC');
    hairTop(g, B);
  }
  arm(g, B, 1, near[0], near[1], { sleeve: suit, hand: trim });
  if (shield && !fl) {
    // (the round shield: big, rings and a star, stepped; side on in front of him (an oval), flat on cocked back to throw)
    const sx = F.pose === 'tell' ? near[0] + 3 : near[0] + 6, sy = near[1] - 2, guard = F.pose !== 'tell';
    for (const [r, col] of [[17, '#1A0B06'], [16, '#DC2626'], [12, '#F8FAFC'], [8, '#DC2626'], [5, '#2563EB']] as const)
      part(g, () => g.ellipse(sx, sy, guard ? r * 0.42 : r, r, 0, 0, Math.PI * 2), col, sx - r, sy - r, r * 2, r * 2, r === 17 ? 1.2 : 0.5);
    if (!guard) part(g, () => { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 1.6 : 4; g.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); } g.closePath(); }, '#F8FAFC', sx - 4, sy - 4, 8, 8, 0.4);
    else px(g, sx - 1, sy - 1, 2, 2, '#F8FAFC');
    if (guard) { px(g, sx + 4, sy - 14, 2, 26, lt('#DC2626', 0.4)); px(g, sx - 5, sy - 10, 1, 18, dk('#DC2626', 0.4)); }
  }
};
export const drawHero = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['pose', 'aim'], ['thrown']), undefined, e.isShieldActive === false ? 'thrown' : '');
  putFrame(c, 'hw-hero2', F, BOX, g => paintHero(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The pirate captain

const paintPirate = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const coat = pickOf(F.seed, 5, ['#991B1B', '#1E3A8A', '#4C1D95', '#14532D']), patch = F.seed % 3 === 2, plume = F.seed % 2 === 0, parrot = F.seed % 5 === 3;
  // (a drunk's lean)
  g.rotate(Math.sin(F.fr * 0.9 + F.seed) * 0.04);
  legs(g, B, { col: '#57534E', shoe: 'boot', shoeCol: '#292524', detail: (gg, _h, k, ft) => { px(gg, (k[0] + ft[0]) / 2 - 5, ft[1] - 14, 11, 4, '#3A2A1A'); px(gg, (k[0] + ft[0]) / 2 - 5, ft[1] - 14, 11, 1, '#5A4A3A'); } });
  const fl = flailHands(B, F.fr);
  const far: [number, number] = fl ? fl[0] : [-B.w / 2 - 4, B.shY + 18];
  const near: [number, number] = fl ? fl[1] : F.pose === 'tell' ? [B.w / 2 - 4, B.shY - 10] : F.pose === 'strike' ? [B.w / 2 + 18, B.shY + 14] : [B.w / 2 + 8, B.shY + 20];
  arm(g, B, -1, far[0], far[1], { sleeve: coat, hand: L.skin });
  // (the bottle in the far hand: green glass, a highlight, its cork)
  if (!fl) { part(g, () => g.roundRect(far[0] - 3, far[1] - 13, 6, 13, 2), '#166534', far[0] - 3, far[1] - 13, 6, 13, 0.8); px(g, far[0] - 2, far[1] - 11, 1, 8, '#4ADE80'); px(g, far[0] - 1, far[1] - 16, 2, 3, '#A16207'); }
  torso(g, B, '#F5F5F4');
  // (the shirt's ruffle; the coat open over it with its gold buttons and cuffs; a sash)
  for (let k = 0; k < 4; k++) px(g, -2 + (k % 2), B.shY + 3 + k * 4, 3, 2, '#E7E5E4');
  part(g, () => { g.moveTo(-B.w / 2, B.shY + 2); g.lineTo(-B.hipW / 2 - 5, B.hipY + 12); g.lineTo(-4, B.hipY + 12); g.lineTo(-3, B.shY + 2); g.closePath(); }, coat, -B.hipW / 2 - 5, B.shY + 2, B.w / 2 + 5, B.hipY - B.shY + 10, 1);
  part(g, () => { g.moveTo(B.w / 2, B.shY + 2); g.lineTo(B.hipW / 2 + 5, B.hipY + 12); g.lineTo(5, B.hipY + 12); g.lineTo(4, B.shY + 2); g.closePath(); }, coat, 4, B.shY + 2, B.w / 2 + 5, B.hipY - B.shY + 10, 1);
  for (let k = 0; k < 3; k++) { px(g, -5, B.shY + 8 + k * 7, 2, 2, '#EAB308'); px(g, 6, B.shY + 8 + k * 7, 2, 2, '#EAB308'); }
  px(g, -B.hipW / 2, B.hipY - 4, B.hipW, 4, '#B91C1C'); px(g, -B.hipW / 2, B.hipY - 4, B.hipW, 1, '#EF4444'); px(g, -B.hipW / 2 + 2, B.hipY, 3, 7, '#B91C1C');
  hairBack(g, B, B.L.hair, 18);
  ownFace(g, B, F, L.skin, F.pose === 'tell' ? 'angry' : 'tired', F.pose === 'strike' ? 'teeth' : 'smirk');
  whiskers(g, B);
  // (eyeliner or the patch; the bandana and the tricorn (a plume on some); beads and a braid; a gold tooth)
  if (patch) { part(g, () => g.ellipse(B.hx + 3, B.hy - 1, 3, 2.6, 0, 0, Math.PI * 2), INK, B.hx, B.hy - 4, 6, 6, 0.4); px(g, B.hx - 8, B.hy - 4, 16, 1, INK); }
  else px(g, B.hx + 1, B.hy - 3, 8, 1, INK);
  if (F.pose === 'strike' || F.pose === 'tell') px(g, B.hx + 4, B.hy + 6, 1, 1, '#FACC15');
  part(g, () => g.rect(B.hx - 9, B.hy - 9, 19, 4), '#B91C1C', B.hx - 9, B.hy - 9, 19, 4, 0.8);
  partTop(g, () => { g.moveTo(B.hx - 17, B.hy - 9); g.quadraticCurveTo(B.hx, B.hy - 27, B.hx + 18, B.hy - 9); g.quadraticCurveTo(B.hx, B.hy - 14, B.hx - 17, B.hy - 9); g.closePath(); }, '#1C1917', B.hx - 17, B.hy - 23, 35, 15, 1);
  px(g, B.hx - 12, B.hy - 11, 25, 1, '#CA8A04');
  if (plume) part(g, () => { g.moveTo(B.hx - 4, B.hy - 19); g.quadraticCurveTo(B.hx - 16, B.hy - 34, B.hx - 26, B.hy - 26); g.quadraticCurveTo(B.hx - 14, B.hy - 26, B.hx - 2, B.hy - 16); g.closePath(); }, pickOf(F.seed, 7, ['#F8FAFC', '#DC2626', '#22C55E']), B.hx - 26, B.hy - 34, 24, 18, 0.8);
  px(g, B.hx - 10, B.hy + 4, 2, 2, '#F59E0B'); px(g, B.hx - 11, B.hy + 9, 2, 2, '#38BDF8'); px(g, B.hx - 10, B.hy + 13, 2, 2, '#F59E0B');
  // (a parrot on his shoulder, the odd one: green, a red head, beak)
  if (parrot && !fl) { const ppx = -B.w / 2 + 4, ppy = B.shY - 2; part(g, () => g.ellipse(ppx, ppy - 6, 4, 7, 0.3, 0, Math.PI * 2), '#16A34A', ppx - 4, ppy - 13, 8, 14, 0.8); ball(g, ppx + 1, ppy - 14, 3.2, '#DC2626', 0.8); px(g, ppx + 3, ppy - 14, 3, 2, '#FACC15'); px(g, ppx + 1, ppy - 15, 1, 1, INK); part(g, () => { g.moveTo(ppx - 3, ppy); g.lineTo(ppx - 6, ppy + 8); g.lineTo(ppx - 1, ppy + 1); g.closePath(); }, '#2563EB', ppx - 6, ppy, 5, 8, 0.6); }
  arm(g, B, 1, near[0], near[1], { sleeve: coat, hand: L.skin });
  // (the cutlass: out in front, up for the windup, swept down for the slash: its guard, the blade in steps)
  if (!fl) {
    const a = F.pose === 'tell' ? -1.9 : F.pose === 'strike' ? 0.35 : -0.25;
    g.save(); g.translate(near[0], near[1]); g.rotate(a);
    part(g, () => { g.moveTo(-2, -5); g.quadraticCurveTo(4, -7, 5, 0); g.quadraticCurveTo(4, 5, -2, 4); g.closePath(); }, '#CA8A04', -2, -7, 7, 12, 0.8);
    part(g, () => { g.moveTo(4, -2); g.lineTo(30, -4); g.quadraticCurveTo(37, -2, 32, 2); g.lineTo(4, 2); g.closePath(); }, '#D4D4D8', 4, -4, 33, 6, 1);
    px(g, 6, -1, 24, 1, lt('#D4D4D8', 0.6)); px(g, 6, 1, 24, 1, dk('#D4D4D8', 0.3));
    g.restore();
  }
};
export const drawPirate = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['pose', 'wind'], ['slash']));
  putFrame(c, 'hw-pirate2', F, BOX, g => paintPirate(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The living statue

const METALS = ['#D4A017', '#D4A017', '#A8B0B8', '#A86A34'];
const paintStatue = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), still = F.v === 'still';
  const M = pickOf(F.seed, 2, METALS), hat = F.seed % 3, stance = F.seed % 3;
  legs(g, B, { col: M, shoe: 'shoe', shoeCol: dk(M, 0.2), skin: M, detail: (gg, _h, k, ft) => px(gg, (k[0] + ft[0]) / 2 - 3, ft[1] - 5, 7, 1, dk(M, 0.35)) });
  const fl = flailHands(B, F.fr);
  // (the pose, frozen: a salute, pointing to the sky, the thinker; moving, it's a hustler like the rest)
  const farStill: [number, number] = stance === 2 ? [B.w / 2 - 2, B.hipY - 6] : [-B.w / 2 - 2, B.hipY - 2];
  const nearStill: [number, number] = stance === 0 ? [B.hx + 6, B.hy - 6] : stance === 1 ? [B.w / 2 + 8, B.shY - 26] : [B.hx + 7, B.hy + 9];
  const far: [number, number] = fl ? fl[0] : still ? farStill : [-B.w / 2 - 2, -30];
  const near: [number, number] = fl ? fl[1] : still ? nearStill : F.pose === 'tell' ? [B.w / 2 + 8, B.shY + 4] : [B.w / 2 + 2, -31];
  arm(g, B, -1, far[0], far[1], { sleeve: M, hand: M });
  torso(g, B, M);
  // (a tailcoat's lapels and buttons, sculpted; the paint flaking at the hems: the person's own shirt showing)
  px(g, -2, B.shY + 4, 3, B.hipY - B.shY - 6, dk(M, 0.3));
  for (let k = 0; k < 3; k++) px(g, 3, B.shY + 8 + k * 6, 2, 2, lt(M, 0.35));
  part(g, () => { g.moveTo(-6, B.shY); g.lineTo(-1, B.shY + 12); g.lineTo(-8, B.shY + 4); g.closePath(); }, dk(M, 0.12), -8, B.shY, 7, 12, 0.6);
  px(g, -B.hipW / 2 + 2, B.hipY - 1, 3, 2, B.L.shirt); px(g, B.hipW / 2 - 4, B.hipY, 2, 2, B.L.shirt);
  ownFace(g, { ...B }, F, lt(M, 0.15), still ? 'tired' : 'angry', still ? 'flat' : 'grin');
  // (the hat: a top hat, a laurel, a crown)
  if (hat === 0) {
    partTop(g, () => g.rect(B.hx - 7, B.hy - 25, 15, 15), M, B.hx - 7, B.hy - 25, 15, 15, 1);
    part(g, () => g.rect(B.hx - 11, B.hy - 11, 23, 3), M, B.hx - 11, B.hy - 11, 23, 3, 1);
    px(g, B.hx - 7, B.hy - 15, 15, 2, dk(M, 0.3));
  } else if (hat === 1) {
    for (let k = 0; k < 7; k++) { const a = Math.PI + (k / 6) * Math.PI; part(g, () => g.ellipse(B.hx + Math.cos(a) * 9, B.hy - 3 + Math.sin(a) * 9, 2.4, 1.4, a + 1.2, 0, Math.PI * 2), lt(M, 0.1), B.hx + Math.cos(a) * 9 - 3, B.hy - 3 + Math.sin(a) * 9 - 2, 6, 4, 0.5); }
    hairTop(g, B, M);
  } else {
    part(g, () => { g.moveTo(B.hx - 8, B.hy - 8); g.lineTo(B.hx - 8, B.hy - 16); g.lineTo(B.hx - 4, B.hy - 12); g.lineTo(B.hx, B.hy - 19); g.lineTo(B.hx + 4, B.hy - 12); g.lineTo(B.hx + 9, B.hy - 16); g.lineTo(B.hx + 9, B.hy - 8); g.closePath(); }, M, B.hx - 8, B.hy - 19, 17, 11, 1);
    px(g, B.hx - 1, B.hy - 12, 2, 2, '#DC2626');
  }
  arm(g, B, 1, near[0], near[1], { sleeve: M, hand: M });
  // (the metal's shine: glints that don't move, a stepped streak down the near side)
  for (const [x, y] of [[-6, B.shY + 8], [4, B.hipY - 10], [B.hx - 3, B.hy - 4], [B.w / 2 - 3, B.shY + 4]]) px(g, x, y, 2, 1, lt(M, 0.7));
  px(g, B.w / 2 - 5, B.shY + 6, 1, B.hipY - B.shY - 8, lt(M, 0.25));
};
export const drawStatue = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const still = (e.aiState ?? 'still') === 'still' && e.health > 0;
  // (still: one frame, no blink, no breathing)
  const F = still ? frameOf(seed, 0, 'stand', 'ok', 0, undefined, 'still') : frameFor(e, f, seed, poseOf(e, ['pose'], []));
  if (still) F.blink = false;
  putFrame(c, 'hw-statue2', F, BOX, g => paintStatue(g, F));
};
void limb;
