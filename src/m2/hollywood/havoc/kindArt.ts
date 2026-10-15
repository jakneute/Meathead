// The havoc's people, drawn (first pass: readable, on Spooky Land's person-in-a-costume drawer, costume.ts, so whoever
// it is shows: their skin, build, hair and face):
//   looter  a guest (their own tee, shorts or jeans, a fanny pack, ash on them), a gift-shop bag in one hand, the other
//           arm full of loot (a REVENGERS plush, a snow globe); the loot up over the head (the tell), thrown (the lob)
//   crew    STORM CREW: a yellow slicker, the hood up round the face, rubber boots, the leaf blower's engine on the back
//           and its tube out in front (smoking as it revs, aimed as it blows)
//   poppy   POPPY: a red-and-white striped foam popcorn bucket from the shoulders to the knees, popcorn heaped round
//           the face hole on top, the face in it, white gloves, red tights; squashed down crouching (the tell), arms up
//           leaping, flat-footed dazed
// Feet at the origin, facing right (the engine mirrors them). Each frame painted once into a stamp (putFrame).

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, px, limb, ball,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, glasses, hairTop, hairBack, frameOf, putFrame, pickOf, moodOf, reaction,
} from '../../spooky/costume';

type Ctx = CanvasRenderingContext2D;

const moving = (e: Enemy, min = 0.3): Pose => (Math.abs(e.vel.x) > min ? 'walk' : 'stand');
const poseOf = (e: Enemy, tells: string[], strikes: string[]): Pose =>
  tells.includes(e.aiState ?? '') ? 'tell' : strikes.includes(e.aiState ?? '') ? 'strike' : moving(e);
const frameFor = (e: Enemy, f: number, seed: number, pose: Pose, v = '') => {
  const r = reaction(e);
  return frameOf(seed, f, r?.pose ?? pose, r?.md ?? moodOf(e), 0, undefined, v);
};
const BOX: [number, number, number, number] = [-64, -132, 136, 136];
const face = (g: Ctx, B: Body, F: Frame, eyes: 'open' | 'angry' | 'wide' | 'tired' | 'smug', mouth: 'flat' | 'grin' | 'smile' | 'teeth' | 'o' | 'smirk') => {
  headShape(g, B, B.L.skin);
  faceOn(g, B, { skin: B.L.skin, eyes, mouth, md: F.md, blink: F.blink });
};

// ---------------------------------------------------------------------------------------------------------------
// The looter

/** A bit of loot (its middle at x, y). */
const loot = (g: Ctx, x: number, y: number, kind: number) => {
  if (kind === 0) {
    // (a snow globe: the glass ball, the snow, the base)
    ball(g, x, y - 3, 6, '#BAE6FD', 1);
    px(g, x - 3, y - 5, 2, 2, '#FFFFFF'); px(g, x + 1, y - 2, 1, 1, '#FFFFFF');
    part(g, () => g.rect(x - 6, y + 2, 12, 4), '#7C2D12', x - 6, y + 2, 12, 4, 1);
  } else if (kind === 1) {
    // (a REVENGERS mug)
    part(g, () => g.rect(x - 5, y - 6, 10, 12), '#1D4ED8', x - 5, y - 6, 10, 12, 1);
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(x + 6, y, 3, -1.4, 1.4); g.stroke();
    px(g, x - 3, y - 2, 6, 2, '#FACC15');
  } else {
    // (a REVENGERS plush: a stubby caped hero)
    ball(g, x, y - 6, 5, '#F6DCC8', 1);
    part(g, () => g.roundRect(x - 6, y - 2, 12, 12, 3), '#DC2626', x - 6, y - 2, 12, 12, 1);
    px(g, x - 2, y + 1, 4, 3, '#FACC15');
  }
};
const paintLooter = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const tee = pickOf(F.seed, 2, ['#F97316', '#22C55E', '#EC4899', '#0EA5E9', '#FACC15', '#A855F7']);
  const shorts = F.seed % 3 === 0;
  legs(g, B, { col: shorts ? '#A39264' : '#1E3A8A', shoe: 'sneaker', shoeCol: '#F5F5F4', bareBelow: shorts });
  const fl = flailHands(B, F.fr);
  const up = F.pose === 'tell', toss = F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : [-B.w / 2 - 3, -28];
  const near: [number, number] = fl ? fl[1] : up ? [B.hx - 2, B.hy - 18] : toss ? [B.w / 2 + 18, B.shY - 4] : [B.w / 2 + 2, B.shY + 16];
  arm(g, B, -1, far[0], far[1], { sleeve: tee, hand: L.skin, len: 0.4 });
  // (the gift-shop bag in the far hand: HAPPYWOOD on it)
  if (!fl) { part(g, () => g.rect(far[0] - 8, far[1], 14, 16), '#F8FAFC', far[0] - 8, far[1], 14, 16, 1); px(g, far[0] - 6, far[1] + 6, 10, 2, '#DC2626'); }
  torso(g, B, tee);
  // (the ash on them, the fanny pack)
  px(g, -4, B.shY + 6, 3, 2, '#78716C'); px(g, 5, B.shY + 14, 2, 2, '#78716C');
  part(g, () => g.roundRect(-B.hipW / 2 + 2, B.hipY - 6, B.hipW - 2, 7, 3), '#18181B', -B.hipW / 2 + 2, B.hipY - 6, B.hipW - 2, 7, 1);
  hairBack(g, B);
  face(g, B, F, up || toss ? 'angry' : 'wide', toss ? 'teeth' : up ? 'grin' : 'o');
  whiskers(g, B); glasses(g, B);
  hairTop(g, B);
  arm(g, B, 1, near[0], near[1], { sleeve: tee, hand: L.skin, len: 0.4 });
  // (the loot: an armful at the chest; one up over the head for the tell; gone from the hand on the toss)
  if (!fl) {
    loot(g, 6, B.shY + 10, (F.seed + 2) % 3);
    if (up) loot(g, near[0], near[1] - 6, F.seed % 3);
  }
};
export const drawLooter = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['wind'], ['toss']));
  putFrame(c, 'hwh-looter', F, BOX, g => paintLooter(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The storm crew

const SLICKER = '#FACC15';
const paintCrew = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr);
  legs(g, B, { col: '#CA8A04', shoe: 'boot', shoeCol: '#15803D' });
  const fl = flailHands(B, F.fr);
  const rev = F.pose === 'tell', blow = F.pose === 'strike';
  const jig = rev ? (F.v === 's1' ? 1 : -1) : 0;
  // (the engine on the back: a red box, its pull cord, its exhaust)
  part(g, () => g.roundRect(-B.w / 2 - 12, B.shY + 2 + jig, 14, 22, 3), '#DC2626', -B.w / 2 - 12, B.shY + 2, 14, 22, 1.2);
  px(g, -B.w / 2 - 10, B.shY + 6 + jig, 10, 3, '#27272A');
  const far: [number, number] = fl ? fl[0] : [B.w / 2 + 6, B.shY + 18];
  const near: [number, number] = fl ? fl[1] : rev || blow ? [B.w / 2 + 14, B.shY + 14] : [B.w / 2 + 6, B.shY + 20];
  arm(g, B, -1, far[0], far[1] + jig, { sleeve: SLICKER, hand: '#1F2937' });
  torso(g, B, SLICKER, B.shY, B.hipY + 8, 3);
  // (the slicker's snaps, its reflective band, STORM CREW tag)
  for (let k = 0; k < 3; k++) px(g, 2, B.shY + 8 + k * 7, 2, 2, '#A16207');
  px(g, -B.w / 2 - 1, B.hipY - 4, B.w + 4, 3, '#E5E7EB');
  // (the hood up round the face)
  part(g, () => g.ellipse(B.hx, B.hy - 1, B.rx + 4, B.ry + 4, 0, 0, Math.PI * 2), SLICKER, B.hx - B.rx - 4, B.hy - B.ry - 5, (B.rx + 4) * 2, (B.ry + 4) * 2, 1.2);
  face(g, B, F, blow ? 'angry' : rev ? 'wide' : 'tired', blow ? 'teeth' : 'flat');
  whiskers(g, B);
  px(g, B.hx - B.rx - 2, B.hy - B.ry - 3, (B.rx + 2) * 2, 3, dk(SLICKER, 0.2));
  arm(g, B, 1, near[0], near[1] + jig, { sleeve: SLICKER, hand: '#1F2937' });
  // (the blower's tube: from the engine round under the arm and out in front, its nozzle)
  if (!fl) {
    limb(g, -B.w / 2 - 4, B.shY + 20, near[0] - 2, near[1] + 2 + jig, 5, '#3F3F46');
    limb(g, near[0] - 2, near[1] + 2 + jig, near[0] + 26, near[1] + 4 + jig, 6, '#F97316');
    part(g, () => g.rect(near[0] + 24, near[1] + jig, 6, 8), '#27272A', near[0] + 24, near[1] + jig, 6, 8, 1);
  }
  void hairTop; void hairBack; void lt;
};
export const drawCrew = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const pose = poseOf(e, ['rev'], ['blow']);
  const F = frameFor(e, f, seed, pose, pose === 'tell' ? (Math.floor(f / 2) % 2 ? 's1' : 's0') : '');
  putFrame(c, 'hwh-crew', F, BOX, g => paintCrew(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// Poppy

const paintPoppy = (g: Ctx, F: Frame) => {
  const squat = F.v === 'crouch', leap = F.v === 'leap', dazed = F.v === 'dz0' || F.v === 'dz1';
  const B = bodyOf(F.seed, squat || leap || dazed ? 'stand' : F.pose, F.fr), L = B.L;
  const sq = squat ? 10 : 0;
  g.save(); g.translate(0, sq * 0.4);
  legs(g, B, { col: '#DC2626', shoe: 'sneaker', shoeCol: '#F5F5F4' });
  const fl = flailHands(B, F.fr);
  const top = B.shY - 16 + sq, bot = B.hipY + 14, wTop = 30, wBot = 21;
  const far: [number, number] = fl ? fl[0] : leap ? [-28, top - 18] : dazed ? [-26, B.shY + 26] : [-26, B.shY + 14 + sq];
  const near: [number, number] = fl ? fl[1] : leap ? [28, top - 20] : dazed ? [26, B.shY + 26] : [27, B.shY + 12 + sq];
  arm(g, B, -1, far[0], far[1], { sleeve: '#F8FAFC', hand: '#F8FAFC', len: 1 });
  // The bucket: wider at the top, its red and white stripes
  part(g, () => { g.moveTo(-wTop, top); g.lineTo(wTop, top); g.lineTo(wBot, bot); g.lineTo(-wBot, bot); g.closePath(); }, '#F8FAFC', -wTop, top, wTop * 2, bot - top, 1.4);
  for (let k = -2; k <= 2; k += 2) {
    const xt = (k / 3) * wTop, xb = (k / 3) * wBot;
    g.fillStyle = '#DC2626'; g.beginPath(); g.moveTo(xt - 5, top + 1); g.lineTo(xt + 5, top + 1); g.lineTo(xb + 4, bot - 1); g.lineTo(xb - 4, bot - 1); g.closePath(); g.fill();
  }
  px(g, -wTop + 2, top + 2, wTop * 2 - 4, 2, lt('#F8FAFC', 0.3));
  // (POPPY on the front)
  px(g, -12, B.hipY - 8, 24, 7, '#FACC15'); px(g, -10, B.hipY - 6, 20, 3, '#DC2626');
  // (the popcorn heaped round the face hole; the face in it)
  for (let k = 0; k < 9; k++) ball(g, -wTop + 4 + k * ((wTop * 2 - 8) / 8), top - 3 - (k % 2) * 3, 5, k % 3 ? '#FEF9C3' : '#FDE68A', 0.8);
  headShape(g, B, L.skin, false);
  faceOn(g, B, { skin: L.skin, eyes: dazed ? 'tired' : squat || leap ? 'wide' : 'open', mouth: leap ? 'teeth' : dazed ? 'o' : 'grin', md: F.md, blink: F.blink });
  whiskers(g, B);
  arm(g, B, 1, near[0], near[1], { sleeve: '#F8FAFC', hand: '#F8FAFC', len: 1 });
  // (dazed: kernels going round its head)
  if (dazed) for (let k = 0; k < 3; k++) { const a = F.fr * 1.2 + k * 2.1; px(g, B.hx + Math.cos(a) * 14 - 1, top - 14 + Math.sin(a) * 4, 3, 3, '#FEF9C3'); }
  g.restore();
};
export const drawPoppy = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = e.aiState ?? '';
  const pose: Pose = st === 'crouch' ? 'tell' : st === 'leap' ? 'strike' : moving(e);
  const v = st === 'crouch' ? 'crouch' : st === 'leap' ? 'leap' : st === 'dazed' ? (Math.floor(f / 8) % 2 ? 'dz1' : 'dz0') : '';
  const F = frameFor(e, f, seed, pose, v);
  putFrame(c, 'hwh-poppy', F, BOX, g => paintPoppy(g, F));
};
