// The film crew, drawn (peak SNES, on Spooky Land's person-in-a-costume drawer, costume.ts, so whoever's in the crew
// blacks shows: their skin, build, hair and face, man or woman; the work clothes over them, every material in steps,
// inked round). Each is seeded: no two the same (the hat or not, the hair through it, the gear hung off them).
//   grip      a black tee or a work shirt, cargo shorts (their pockets), leather work gloves, the tool belt (pouches, a
//             roll of gaffer tape, a tape measure, carabiners), a cap backwards, a beanie or a bandana, shades up on
//             some; the C-stand (chrome: three legs, the riser, the knuckle, the arm) up for the tell, down on him
//   boom      crew blacks, the big cans; the mixer bag on its harness; the boom pole out front, its blimp in its furry
//             dead cat (up, then swung down); a beanie or a ponytail
//   runner    a hoodie (its pocket, its strings), the headset and its mic, the walkie on the belt, the lanyard, a fanny
//             pack on some; the coffee (its lid, its sleeve) up for the tell
//   director  a vest over a striped shirt, a scarf, a cap on backwards (or a beret), the director's viewfinder on its
//             lanyard, shades on some; the megaphone (up to the mouth for ACTION!)
//   craft     a white apron (stained) over their shirt, a hairnet, a name tag; a tray, the food in the throwing hand
//   mocap     the black mocap suit with its white dots (seeded patterns), the velcro straps, the dotted cap, the face
//             camera on its little boom, its light
//   stuntco   a black STUNTS vest (tape across it, a radio on it), a headset, knee and elbow pads, taped wrists, gloves;
//             crouched to set, flat out for the tackle, prone after
// Feet at the origin, facing right (the engine mirrors them). Each frame painted once into a stamp (putFrame).

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, partTop, px, limb, ball, dither,
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
const BOX: [number, number, number, number] = [-60, -128, 132, 132];
type Eyes = 'open' | 'angry' | 'wide' | 'tired' | 'smug';
type Mouth = 'flat' | 'grin' | 'smile' | 'teeth' | 'o' | 'smirk';
const face = (g: Ctx, B: Body, F: Frame, eyes: Eyes, mouth: Mouth) => {
  headShape(g, B, B.L.skin);
  faceOn(g, B, { skin: B.L.skin, eyes, mouth, md: F.md, blink: F.blink });
};
/** A cap (forward, or on backwards: the peak behind), its button, the band's shade. */
const cap = (g: Ctx, B: Body, col: string, back = false) => {
  const { hx, hy } = B;
  partTop(g, () => { g.moveTo(hx - 9, hy - 3); g.quadraticCurveTo(hx - 8, hy - 15, hx + 1, hy - 14); g.quadraticCurveTo(hx + 10, hy - 13, hx + 10, hy - 4); g.closePath(); }, col, hx - 9, hy - 15, 19, 12, 1);
  px(g, hx, hy - 15, 2, 1, lt(col, 0.3)); px(g, hx - 8, hy - 5, 18, 1, dk(col, 0.25));
  if (back) part(g, () => g.roundRect(hx - 15, hy - 6, 9, 3, 1), dk(col, 0.2), hx - 15, hy - 6, 9, 3, 0.8);
  else { part(g, () => g.roundRect(hx + 4, hy - 6, 13, 3, 1), dk(col, 0.2), hx + 4, hy - 6, 13, 3, 0.8); px(g, hx + 5, hy - 6, 10, 1, lt(col, 0.15)); }
};
/** A knit beanie (its ribbed cuff, a bobble on some). */
const beanie = (g: Ctx, B: Body, col: string, bobble: boolean) => {
  const { hx, hy } = B;
  partTop(g, () => { g.moveTo(hx - 9.5, hy - 2); g.quadraticCurveTo(hx - 9, hy - 16, hx + 1, hy - 15); g.quadraticCurveTo(hx + 10, hy - 15, hx + 10, hy - 3); g.closePath(); }, col, hx - 9.5, hy - 16, 20, 14, 1);
  part(g, () => g.rect(hx - 10, hy - 6, 21, 4), dk(col, 0.15), hx - 10, hy - 6, 21, 4, 0.9);
  for (let k = -8; k < 10; k += 3) px(g, hx + k, hy - 6, 1, 4, dk(col, 0.35));
  if (bobble) ball(g, hx, hy - 16, 2.6, lt(col, 0.25), 0.8);
};
/** A bandana tied round the head, its knot behind. */
const bandana = (g: Ctx, B: Body, col: string) => {
  const { hx, hy } = B;
  partTop(g, () => { g.moveTo(hx - 9, hy - 2); g.quadraticCurveTo(hx - 8, hy - 13, hx + 1, hy - 12); g.quadraticCurveTo(hx + 10, hy - 11, hx + 10, hy - 4); g.lineTo(hx - 9, hy - 3); g.closePath(); }, col, hx - 9, hy - 13, 19, 11, 1);
  part(g, () => { g.moveTo(hx - 9, hy - 5); g.lineTo(hx - 15, hy - 2); g.lineTo(hx - 13, hy + 2); g.closePath(); }, col, hx - 15, hy - 5, 6, 7, 0.8);
  for (let k = 0; k < 3; k++) px(g, hx - 5 + k * 5, hy - 9, 1, 1, '#FFFFFF');
};
/** Shades pushed up on the head (or on the face: `on`). */
const shades = (g: Ctx, B: Body, on: boolean) => {
  const { hx, hy } = B, y = on ? hy - 2 : hy - 10;
  px(g, hx - 2, y, 13, 1, INK);
  part(g, () => g.roundRect(hx - 1, y, 5, 3, 1), '#1C1C24', hx - 1, y, 5, 3, 0.8); part(g, () => g.roundRect(hx + 5, y, 5, 3, 1), '#1C1C24', hx + 5, y, 5, 3, 0.8);
  px(g, hx, y + 1, 1, 1, '#9AB0D0'); px(g, hx + 6, y + 1, 1, 1, '#9AB0D0');
};
/** A ponytail out the back, a scrunchie on it. */
const ponytail = (g: Ctx, B: Body, tie: string) => {
  if (B.L.bald) return;
  const { hx, hy } = B, col = B.L.hair;
  part(g, () => { g.moveTo(hx - 7, hy - 7); g.quadraticCurveTo(hx - 17, hy - 6, hx - 15, hy + 9); g.lineTo(hx - 11, hy + 8); g.quadraticCurveTo(hx - 12, hy - 2, hx - 6, hy - 3); g.closePath(); }, col, hx - 17, hy - 8, 12, 18, 1);
  part(g, () => g.roundRect(hx - 11, hy - 8, 5, 4, 1), tie, hx - 11, hy - 8, 5, 4, 0.8);
};
/** A headset: the band over the head, an ear cup, the mic out to the mouth. */
const headset = (g: Ctx, B: Body) => {
  const { hx, hy } = B;
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(hx, hy - 1, 10, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
  g.strokeStyle = '#4A4A54'; g.lineWidth = 0.8; g.beginPath(); g.arc(hx, hy - 1, 10, Math.PI * 1.15, Math.PI * 1.5); g.stroke();
  ball(g, hx - 8, hy + 1, 3.2, '#27272A', 1);
  g.strokeStyle = '#3F3F46'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(hx - 7, hy + 3); g.quadraticCurveTo(hx - 1, hy + 10, hx + 6, hy + 8); g.stroke();
  px(g, hx + 5, hy + 7, 3, 2, '#18181B'); px(g, hx + 5, hy + 7, 1, 1, '#5A5A64');
};
/** A walkie on the belt (its antenna, its green light). */
const walkie = (g: Ctx, x: number, y: number) => {
  part(g, () => g.roundRect(x, y, 6, 11, 1), '#18181B', x, y, 6, 11, 0.8);
  px(g, x + 1, y - 6, 1, 6, '#18181B'); px(g, x + 1, y + 2, 4, 2, '#3A3A44'); px(g, x + 4, y + 1, 1, 1, '#4ADE80');
};
/** The person's own head and hair round a face (hair under a hat when `hatted`). */
const head = (g: Ctx, B: Body, F: Frame, eyes: Eyes, mouth: Mouth, hairOn = true) => {
  hairBack(g, B);
  face(g, B, F, eyes, mouth);
  whiskers(g, B);
  glasses(g, B);
  if (hairOn) hairTop(g, B);
};
/** Seeded headgear for the crew: 0 nothing, 1 a cap backwards, 2 a beanie, 3 a bandana, 4 a cap forward. */
const crewHat = (g: Ctx, B: Body, seed: number, col: string) => {
  const k = seed % 5;
  if (k === 1) cap(g, B, col, true);
  else if (k === 2) beanie(g, B, pickOf(seed, 3, ['#27272A', '#7F1D1D', '#1E3A8A', '#3F6212']), seed % 2 === 0);
  else if (k === 3) bandana(g, B, pickOf(seed, 4, ['#B91C1C', '#1D4ED8', '#27272A']));
  else if (k === 4) cap(g, B, col);
  return k;
};

// ---------------------------------------------------------------------------------------------------------------
// The grip

const cStand = (g: Ctx, x: number, y: number, ang: number) => {
  g.save(); g.translate(x, y); g.rotate(ang);
  limb(g, 0, 10, 0, -40, 2.8, '#B4BCC8');
  px(g, -1, -38, 1, 46, '#E2E8F0');
  ball(g, 0, -14, 2, '#3F3F46', 0.8);
  // (the legs, folded together at the bottom; the arm off the top, its knuckle and grip head)
  for (const s of [-1, 0, 1]) limb(g, 0, 10, s * 7, 22, 2, '#8890A0');
  limb(g, 0, -40, 22, -46, 2.2, '#B4BCC8');
  ball(g, 0, -40, 3, '#3F3F46', 0.8); px(g, -1, -42, 1, 1, '#8A8A94');
  part(g, () => g.rect(20, -50, 6, 8), '#3F3F46', 20, -50, 6, 8, 0.8);
  g.restore();
};
const paintGrip = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const work = F.seed % 3 === 2, tee = work ? pickOf(F.seed, 2, ['#3A4A5A', '#5A4A3A', '#2A3A2A']) : pickOf(F.seed, 2, ['#18181B', '#27272A', '#1F2937']);
  const glove = '#9A7048', shorts = pickOf(F.seed, 5, ['#57534E', '#6A5E48', '#3A3A3A']);
  legs(g, B, {
    col: shorts, shoe: 'boot', shoeCol: '#3F2A14', bareBelow: true,
    detail: (gg, hip, k) => { part(gg, () => gg.rect((hip[0] + k[0]) / 2 - 2, (hip[1] + k[1]) / 2 + 1, 5, 5), dk(shorts, 0.1), (hip[0] + k[0]) / 2 - 2, (hip[1] + k[1]) / 2 + 1, 5, 5, 0.6); },
  });
  const fl = flailHands(B, F.fr);
  const up = F.pose === 'tell', down = F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : up ? [-2, B.shY - 16] : down ? [B.w / 2 + 12, B.shY + 12] : [-B.w / 2 - 2, -31];
  const near: [number, number] = fl ? fl[1] : up ? [4, B.shY - 18] : down ? [B.w / 2 + 16, B.shY + 8] : [B.w / 2 + 3, -33];
  arm(g, B, -1, far[0], far[1], { sleeve: tee, hand: glove, len: work ? 0.8 : 0.4 });
  torso(g, B, tee);
  if (work) { px(g, -1, B.shY + 1, 1, B.hipY - B.shY - 1, dk(tee, 0.3)); for (let y = B.shY + 4; y < B.hipY - 2; y += 6) px(g, 1, y, 1, 1, '#D4D4D8'); part(g, () => g.rect(-B.w / 2 + 3, B.shY + 6, 7, 6), dk(tee, 0.1), -B.w / 2 + 3, B.shY + 6, 7, 6, 0.6); }
  else { px(g, -4, B.shY + 8, 9, 2, lt(tee, 0.4)); px(g, -3, B.shY + 11, 7, 1, lt(tee, 0.25)); }
  // (the tool belt: leather, its pouches, a roll of gaffer tape, the tape measure, a carabiner of keys)
  part(g, () => g.rect(-B.hipW / 2 - 1, B.hipY - 4, B.hipW + 2, 5), '#6A4420', -B.hipW / 2 - 1, B.hipY - 4, B.hipW + 2, 5, 0.9);
  px(g, -1, B.hipY - 4, 3, 5, '#C8A040');
  part(g, () => g.rect(-B.hipW / 2 + 1, B.hipY - 2, 6, 8), '#8A5A2A', -B.hipW / 2 + 1, B.hipY - 2, 6, 8, 0.8);
  part(g, () => g.rect(B.hipW / 2 - 7, B.hipY - 2, 6, 8), '#8A5A2A', B.hipW / 2 - 7, B.hipY - 2, 6, 8, 0.8);
  ball(g, 3, B.hipY + 1, 2.8, pickOf(F.seed, 6, ['#F472B6', '#FACC15', '#D6D3D1', '#60A5FA']), 0.7); px(g, 2, B.hipY, 2, 2, '#1C1C24');
  part(g, () => g.rect(B.hipW / 2 - 3, B.hipY - 8, 5, 5), '#EAB308', B.hipW / 2 - 3, B.hipY - 8, 5, 5, 0.6);
  px(g, -B.hipW / 2 - 2, B.hipY + 1, 2, 4, '#A8A8B0');
  const hat = F.seed % 5;
  head(g, B, F, up || down ? 'angry' : 'tired', down ? 'teeth' : 'flat', hat === 0 || hat === 1 || hat === 4);
  crewHat(g, B, F.seed, '#18181B');
  if (F.seed % 4 === 1 && hat !== 2) shades(g, B, false);
  arm(g, B, 1, near[0], near[1], { sleeve: tee, hand: glove, len: work ? 0.8 : 0.4 });
  if (!fl) cStand(g, near[0], near[1], up ? -0.2 : down ? 1.5 : 0.25);
  void L;
};
export const drawGrip = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['raise'], ['slam']));
  putFrame(c, 'hww-grip2', F, BOX, g => paintGrip(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The boom op

const BOOM_BOX: [number, number, number, number] = [-60, -204, 324, 208];
const paintBoom = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const blacks = '#18181B';
  legs(g, B, { col: '#27272A', shoe: 'sneaker', shoeCol: '#18181B', detail: (gg, _h, k, ft) => px(gg, (k[0] + ft[0]) / 2 - 1, (k[1] + ft[1]) / 2 - 2, 1, 6, '#3A3A44') });
  const fl = flailHands(B, F.fr);
  const up = F.pose === 'tell', down = F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : [B.w / 2 - 2, B.shY - (up ? 18 : 8)];
  const near: [number, number] = fl ? fl[1] : [B.w / 2 + 10, B.shY - (up ? 10 : 0)];
  arm(g, B, -1, far[0], far[1], { sleeve: blacks, hand: L.skin });
  torso(g, B, blacks);
  // (the mixer bag on its harness: the straps over the shoulders, the bag at the belly, its meters)
  px(g, -B.w / 2 + 3, B.shY + 1, 3, B.hipY - B.shY - 8, '#3A3A44'); px(g, B.w / 2 - 6, B.shY + 1, 3, B.hipY - B.shY - 8, '#3A3A44');
  part(g, () => g.roundRect(-9, B.hipY - 14, 18, 11, 1), '#2A2A30', -9, B.hipY - 14, 18, 11, 0.9);
  px(g, -6, B.hipY - 12, 5, 3, '#0A0A0E'); px(g, -5, B.hipY - 11, 2, 1, '#4ADE80'); px(g, -3, B.hipY - 11, 1, 1, '#FACC15'); px(g, 2, B.hipY - 12, 2, 2, '#A8A8B0'); px(g, 5, B.hipY - 12, 2, 2, '#A8A8B0');
  const hat = F.seed % 3;
  if (hat === 1) ponytail(g, B, '#3A3A44');
  head(g, B, F, down ? 'angry' : 'open', up ? 'o' : 'flat', hat !== 2);
  if (hat === 2) beanie(g, B, pickOf(F.seed, 5, ['#27272A', '#5A1A1A', '#1A2A4A']), false);
  // (the cans: big, padded)
  g.strokeStyle = INK; g.lineWidth = 2.6; g.beginPath(); g.arc(B.hx, B.hy - 1, 10.5, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  g.strokeStyle = '#4A4A54'; g.lineWidth = 1; g.beginPath(); g.arc(B.hx, B.hy - 1, 10.5, Math.PI * 1.1, Math.PI * 1.45); g.stroke();
  ball(g, B.hx - 9, B.hy + 1, 4.4, '#3F3F46', 1); px(g, B.hx - 11, B.hy - 1, 2, 2, '#6A6A74');
  arm(g, B, 1, near[0], near[1], { sleeve: blacks, hand: L.skin });
  if (!fl) {
    // (the pole, out ahead: up for the tell, swung down on the strike; its sections; the blimp in its dead cat)
    const a = up ? -1.05 : down ? 0.2 : -0.55, len = 190;
    const ex = near[0] + Math.cos(a) * len, ey = near[1] + Math.sin(a) * len;
    limb(g, far[0] - 6, far[1] + 2, ex, ey, 2.6, '#A1A1AA');
    for (const t of [0.35, 0.65]) { const sx = far[0] - 6 + (ex - far[0] + 6) * t, sy = far[1] + 2 + (ey - far[1] - 2) * t; ball(g, sx, sy, 2, '#52525B', 0.6); }
    g.save(); g.translate(ex + 6, ey + 6); g.rotate(a + 0.3);
    part(g, () => g.ellipse(0, 0, 16, 8, 0, 0, Math.PI * 2), '#8A8A92', -16, -8, 32, 16, 1);
    for (let k = -14; k <= 14; k += 3) { px(g, k, -9 - (k % 2 ? 1 : 0), 1, 3, '#A8A8B0'); px(g, k + 1, 7, 1, 3, '#5A5A62'); }
    px(g, -10, -4, 6, 2, '#C8C8D0');
    g.restore();
  }
};
export const drawBoom = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['raise'], ['swing']));
  putFrame(c, 'hww-boom2', F, BOOM_BOX, g => paintBoom(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The runner (a PA)

const paintRunner = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const hoodie = pickOf(F.seed, 3, ['#1E3A8A', '#7F1D1D', '#3F6212', '#52525B', '#9D174D', '#C2410C']);
  const jeans = pickOf(F.seed, 4, ['#1E293B', '#2A3A5A', '#3A3A44']);
  legs(g, B, { col: jeans, shoe: 'sneaker', shoeCol: '#E5E7EB', detail: (gg, _h, k, ft) => px(gg, (k[0] + ft[0]) / 2, (k[1] + ft[1]) / 2 - 3, 1, 5, lt(jeans, 0.2)) });
  const fl = flailHands(B, F.fr);
  const aim = F.pose === 'tell';
  const far: [number, number] = fl ? fl[0] : [-B.w / 2 - 2, -30];
  const near: [number, number] = fl ? fl[1] : aim ? [-4, B.shY - 14] : F.pose === 'strike' ? [B.w / 2 + 14, B.shY + 4] : [B.w / 2 + 6, B.shY + 16];
  arm(g, B, -1, far[0], far[1], { sleeve: hoodie, hand: L.skin });
  // (the hood down behind the neck)
  part(g, () => g.ellipse(B.hx - 5, B.shY + 1, 8, 4, 0, 0, Math.PI * 2), dk(hoodie, 0.12), B.hx - 13, B.shY - 3, 16, 8, 0.9);
  torso(g, B, hoodie);
  // (the hoodie's pocket and strings, its cuff band; the lanyard and its badge; the walkie on the belt)
  part(g, () => g.rect(-7, B.hipY - 11, 14, 7), dk(hoodie, 0.18), -7, B.hipY - 11, 14, 7, 0.7);
  px(g, -B.w / 2 + 1, B.hipY - 1, B.w - 2, 3, dk(hoodie, 0.25));
  px(g, -2, B.shY + 2, 1, 7, '#F5F5F4'); px(g, 2, B.shY + 2, 1, 7, '#F5F5F4'); px(g, -2, B.shY + 9, 1, 1, '#A8A8B0'); px(g, 2, B.shY + 9, 1, 1, '#A8A8B0');
  px(g, 4, B.shY + 1, 1, 12, '#DC2626'); part(g, () => g.rect(3, B.shY + 12, 6, 7), '#F8FAFC', 3, B.shY + 12, 6, 7, 0.6); px(g, 4, B.shY + 13, 4, 1, '#1E3A8A'); px(g, 4, B.shY + 16, 3, 1, '#3F3F46');
  walkie(g, B.hipW / 2 - 3, B.hipY - 10);
  if (F.seed % 3 === 1) { part(g, () => g.roundRect(-B.hipW / 2 - 2, B.hipY - 3, 9, 6, 2), '#27272A', -B.hipW / 2 - 2, B.hipY - 3, 9, 6, 0.7); px(g, -B.hipW / 2, B.hipY - 1, 5, 1, '#A8A8B0'); }
  const hat = F.seed % 4;
  head(g, B, F, aim ? 'angry' : 'wide', aim ? 'teeth' : 'o', hat !== 2);
  if (hat === 1) cap(g, B, pickOf(F.seed, 6, ['#18181B', '#1E3A8A', '#7F1D1D']), true);
  else if (hat === 2) beanie(g, B, pickOf(F.seed, 7, ['#27272A', '#3F6212', '#7F1D1D']), true);
  headset(g, B);
  arm(g, B, 1, near[0], near[1], { sleeve: hoodie, hand: L.skin });
  // (the coffee: a white cup, its lid, its sleeve)
  if (!fl && F.v !== 'thrown') {
    part(g, () => g.roundRect(near[0] - 3, near[1] - 12, 8, 11, 1), '#F5F5F4', near[0] - 3, near[1] - 12, 8, 11, 0.9);
    px(g, near[0] - 4, near[1] - 13, 10, 2, '#18181B'); px(g, near[0] - 3, near[1] - 14, 4, 1, '#3F3F46');
    px(g, near[0] - 3, near[1] - 8, 8, 3, '#A16207'); px(g, near[0] - 3, near[1] - 8, 8, 1, '#CA8A04');
  }
};
export const drawRunner = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const thrown = e.aiState === 'thrown';
  const F = frameFor(e, f, seed, poseOf(e, ['aim'], ['thrown']), thrown ? 'thrown' : '');
  putFrame(c, 'hww-runner2', F, BOX, g => paintRunner(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The director

const megaphone = (g: Ctx, x: number, y: number, ang: number) => {
  g.save(); g.translate(x, y); g.rotate(ang);
  part(g, () => { g.moveTo(0, -3); g.lineTo(16, -9); g.lineTo(16, 9); g.lineTo(0, 3); g.closePath(); }, '#F8FAFC', 0, -9, 16, 18, 1);
  px(g, 13, -8, 3, 16, '#DC2626'); px(g, 13, -8, 1, 16, '#F87171');
  part(g, () => g.rect(-3, -2, 5, 6), '#3F3F46', -3, -2, 5, 6, 0.8);
  part(g, () => g.rect(2, 2, 3, 6), '#27272A', 2, 2, 3, 6, 0.7);
  g.restore();
};
const paintDirector = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const vest = pickOf(F.seed, 2, ['#78350F', '#3F6212', '#1F2937']), scarf = pickOf(F.seed, 5, ['#DC2626', '#7C3AED', '#F59E0B']);
  legs(g, B, { col: '#44403C', shoe: 'shoe', shoeCol: '#1C1917', detail: (gg, _h, k, ft) => px(gg, (k[0] + ft[0]) / 2, (k[1] + ft[1]) / 2 - 2, 1, 5, '#2A2624') });
  const fl = flailHands(B, F.fr);
  const yell = F.pose === 'tell', whack = F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : [-B.w / 2 - 2, -30];
  const near: [number, number] = fl ? fl[1] : yell ? [B.hx + 6, B.hy + 7] : whack ? [B.w / 2 + 14, B.shY + 2] : [B.w / 2 + 4, B.shY + 18];
  arm(g, B, -1, far[0], far[1], { sleeve: '#F8FAFC', hand: L.skin });
  torso(g, B, '#F8FAFC');
  for (let y = B.shY + 3; y < B.hipY; y += 4) px(g, -B.w / 2 + 2, y, B.w - 4, 1, '#93C5FD');
  // (the vest: its pockets, flecked; the scarf; the viewfinder on its lanyard)
  part(g, () => { g.moveTo(-B.w / 2, B.shY + 2); g.lineTo(-B.hipW / 2 - 1, B.hipY + 2); g.lineTo(-3, B.hipY + 2); g.lineTo(-3, B.shY + 2); g.closePath(); }, vest, -B.hipW / 2 - 1, B.shY + 2, B.w / 2 + 2, B.hipY - B.shY, 1);
  part(g, () => { g.moveTo(B.w / 2, B.shY + 2); g.lineTo(B.hipW / 2 + 1, B.hipY + 2); g.lineTo(4, B.hipY + 2); g.lineTo(4, B.shY + 2); g.closePath(); }, vest, 4, B.shY + 2, B.w / 2, B.hipY - B.shY, 1);
  for (const px2 of [-B.w / 2 + 3, 6]) { px(g, px2, B.shY + 12, 5, 4, dk(vest, 0.2)); px(g, px2, B.shY + 12, 5, 1, lt(vest, 0.2)); }
  dither(g, -B.w / 2, B.hipY - 3, B.w, 3, dk(vest, 0.2));
  part(g, () => g.roundRect(-7, B.shY - 2, 14, 5, 2), scarf, -7, B.shY - 2, 14, 5, 1); px(g, -5, B.shY + 2, 4, 10, scarf); px(g, -5, B.shY + 2, 1, 10, lt(scarf, 0.3));
  if (F.seed % 2 === 0) { px(g, 1, B.shY + 2, 1, 12, '#18181B'); part(g, () => g.rect(-1, B.shY + 13, 5, 7), '#27272A', -1, B.shY + 13, 5, 7, 0.7); px(g, 0, B.shY + 19, 3, 2, '#6A7AA0'); }
  const beret = F.seed % 3 === 2;
  head(g, B, F, yell ? 'angry' : 'smug', yell ? 'o' : whack ? 'teeth' : 'smirk', false);
  if (beret) { partTop(g, () => g.ellipse(B.hx - 1, B.hy - 9, 11, 5, -0.15, 0, Math.PI * 2), '#18181B', B.hx - 12, B.hy - 14, 22, 10, 1); px(g, B.hx - 1, B.hy - 15, 1, 2, '#18181B'); }
  else cap(g, B, '#18181B', true);
  if (F.seed % 4 === 1) shades(g, B, true);
  arm(g, B, 1, near[0], near[1], { sleeve: '#F8FAFC', hand: L.skin });
  if (!fl) megaphone(g, near[0], near[1], yell ? 0 : whack ? 0.6 : 1.3);
};
export const drawDirector = (c: Ctx, e: Enemy, f: number, seed: number, boosting: boolean) => {
  const F = frameFor(e, f, seed, poseOf(e, ['action'], ['whack']));
  putFrame(c, 'hww-director2', F, BOX, g => paintDirector(g, F));
  void boosting;
};

// ---------------------------------------------------------------------------------------------------------------
// Craft services

const food = (g: Ctx, x: number, y: number, look: number) => {
  if (look === 0) { ball(g, x, y, 5, '#F9A8D4', 1); ball(g, x, y, 1.6, '#92400E', 0.6); px(g, x - 3, y - 3, 1, 1, '#FFFFFF'); px(g, x + 2, y - 2, 1, 1, '#FACC15'); }
  else if (look === 1) { part(g, () => g.roundRect(x - 7, y - 3, 14, 6, 3), '#E7C27D', x - 7, y - 3, 14, 6, 1); px(g, x - 5, y - 1, 10, 1, '#A16207'); }
  else { part(g, () => g.rect(x - 6, y - 4, 12, 8), '#FEF3C7', x - 6, y - 4, 12, 8, 1); px(g, x - 6, y - 4, 12, 2, '#F472B6'); px(g, x - 1, y - 7, 2, 3, '#DC2626'); }
};
const paintCraft = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const shirt = pickOf(F.seed, 4, ['#0F766E', '#B91C1C', '#1E3A8A', '#6D28D9']);
  legs(g, B, { col: '#27272A', shoe: 'shoe', shoeCol: '#18181B' });
  const fl = flailHands(B, F.fr);
  const wind = F.pose === 'tell';
  const far: [number, number] = fl ? fl[0] : [B.w / 2 + 4, B.shY + 12];
  const near: [number, number] = fl ? fl[1] : wind ? [-B.w / 2 - 8, B.shY - 10] : F.pose === 'strike' ? [B.w / 2 + 14, B.shY - 2] : [B.w / 2 + 8, B.shY + 10];
  arm(g, B, -1, far[0], far[1], { sleeve: shirt, hand: L.skin, len: 0.45 });
  // (the tray, in the far hand: a stack of donuts on it)
  if (!fl) { part(g, () => g.rect(far[0] - 4, far[1] - 2, 22, 3), '#D4D4D8', far[0] - 4, far[1] - 2, 22, 3, 0.8); px(g, far[0] - 4, far[1] - 2, 22, 1, '#F4F4F6'); for (let k = 0; k < 3; k++) ball(g, far[0] + 1 + k * 6, far[1] - 5, 2.8, k === 1 ? '#8A4A1A' : '#F9A8D4', 0.6); }
  torso(g, B, shirt);
  // (the apron: white, its strings, the stains; the name tag on it)
  part(g, () => g.roundRect(-B.w / 2 + 2, B.shY + 4, B.w - 4, B.hipY - B.shY + 8, 2), '#F8FAFC', -B.w / 2 + 2, B.shY + 4, B.w - 4, B.hipY - B.shY + 8, 1);
  px(g, -4, B.shY + 14, 8, 1, '#E7E5E4'); px(g, -B.w / 2 + 2, B.hipY - 4, 3, 1, '#E7E5E4'); px(g, B.w / 2 - 5, B.hipY - 4, 3, 1, '#E7E5E4');
  px(g, -3, B.hipY - 2, 3, 2, '#C8946A'); px(g, 3, B.shY + 18, 2, 2, '#F472B6'); px(g, -6, B.shY + 20, 2, 1, '#A16207');
  part(g, () => g.rect(2, B.shY + 7, 7, 4), '#F4F4F0', 2, B.shY + 7, 7, 4, 0.6); px(g, 3, B.shY + 8, 5, 1, shirt);
  head(g, B, F, wind ? 'angry' : 'tired', wind ? 'teeth' : 'flat', false);
  // (the hairnet over their hair)
  if (!B.L.bald) hairTop(g, B);
  g.fillStyle = 'rgba(255,255,255,0.35)';
  for (let k = -8; k <= 9; k += 3) g.fillRect(Math.round(B.hx + k), Math.round(B.hy - 11), 1, 8);
  for (let y = -11; y <= -5; y += 3) g.fillRect(Math.round(B.hx - 8), Math.round(B.hy + y), 17, 1);
  arm(g, B, 1, near[0], near[1], { sleeve: shirt, hand: L.skin, len: 0.45 });
  if (!fl && F.v !== 'thrown') food(g, near[0] + 2, near[1] - 4, F.seed % 3);
};
export const drawCraft = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const thrown = e.aiState === 'thrown';
  const F = frameFor(e, f, seed, poseOf(e, ['windup'], ['thrown']), thrown ? 'thrown' : '');
  putFrame(c, 'hww-craft2', F, BOX, g => paintCraft(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The mocap double

const DOTS: [number, number][] = [[-6, -50], [6, -48], [0, -42], [-8, -36], [8, -36], [0, -32], [-4, -24], [5, -22], [-6, -12], [6, -10], [-5, -3], [6, -3]];
const paintMocap = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const suit = '#111827', dotC = F.seed % 3 === 1 ? '#C8F07A' : '#F8FAFC';
  const flip = F.v === 'air';
  if (flip) { g.translate(0, -36); g.rotate(-0.9 - (F.fr % 4) * 0.6); g.translate(0, 36); }
  legs(g, B, { col: suit, shoe: 'sneaker', shoeCol: '#18181B', detail: (gg, hip, k, ft) => { ball(gg, k[0], k[1], 1.3, dotC, 0.3); ball(gg, (k[0] + ft[0]) / 2, (k[1] + ft[1]) / 2 + 2, 1.1, dotC, 0.3); px(gg, (hip[0] + k[0]) / 2 - 3, (hip[1] + k[1]) / 2, 6, 1, '#3A3A44'); } });
  const fl = flailHands(B, F.fr);
  const crouch = F.pose === 'tell', kick = F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : crouch ? [-B.w / 2 - 6, -14] : flip ? [-B.w / 2 - 10, B.shY - 10] : [-B.w / 2 - 2, -30];
  const near: [number, number] = fl ? fl[1] : crouch ? [B.w / 2 + 6, -16] : kick ? [B.w / 2 + 16, B.shY + 6] : flip ? [B.w / 2 + 10, B.shY - 12] : [B.w / 2 + 3, -32];
  arm(g, B, -1, far[0], far[1], { sleeve: suit, hand: suit });
  torso(g, B, suit);
  // (the velcro straps, the dots on them (seeded: a shuffle of the pattern), the belt pack)
  px(g, -B.w / 2 + 1, B.shY + 14, B.w - 2, 2, '#2A2A34'); px(g, -B.hipW / 2, B.hipY - 3, B.hipW, 3, '#2A2A34');
  DOTS.forEach(([x, y], i) => { if ((i + F.seed) % 7 === 0) return; ball(g, x * (B.w / 23) + ((i * F.seed) % 3) - 1, B.shY + 3 + ((y + 52) / 49) * (B.hipY - B.shY - 2), 1.4, dotC, 0.4); });
  part(g, () => g.rect(-4, B.hipY - 6, 8, 5), '#27272A', -4, B.hipY - 6, 8, 5, 0.7); px(g, -2, B.hipY - 5, 1, 1, '#EF4444');
  face(g, B, F, kick || crouch ? 'angry' : 'open', kick ? 'teeth' : 'flat');
  // (dots on the face: the markers; the dotted cap, over the hair; the face camera on its boom off the forehead, its light)
  for (const [dx, dy] of [[0, 2], [6, 4], [3, -4]] as const) px(g, B.hx + dx, B.hy + dy, 1, 1, '#F8FAFC');
  partTop(g, () => { g.moveTo(B.hx - 9.5, B.hy - 1); g.quadraticCurveTo(B.hx - 8, B.hy - 13, B.hx + 1, B.hy - 12); g.quadraticCurveTo(B.hx + 10, B.hy - 12, B.hx + 10, B.hy - 3); g.closePath(); }, suit, B.hx - 9.5, B.hy - 13, 20, 12, 1);
  for (const [dx, dy] of [[-5, -9], [1, -11], [7, -7], [-8, -4]]) ball(g, B.hx + dx, B.hy + dy, 1.2, dotC, 0.3);
  limb(g, B.hx + 6, B.hy - 9, B.hx + 18, B.hy - 2, 1.4, '#71717A');
  part(g, () => g.rect(B.hx + 16, B.hy - 4, 5, 4), '#27272A', B.hx + 16, B.hy - 4, 5, 4, 0.8);
  px(g, B.hx + 19, B.hy - 3, 1, 1, '#EF4444'); px(g, B.hx + 16, B.hy, 5, 1, '#BFDBFE');
  arm(g, B, 1, near[0], near[1], { sleeve: suit, hand: suit });
  void L;
};
export const drawMocap = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const air = e.aiState === 'flip' && e.vel.y !== 0;
  const F = frameFor(e, f, seed, air ? 'walk' : poseOf(e, ['crouch'], ['kick']), air ? 'air' : '');
  putFrame(c, 'hww-mocap2', F, BOX, g => paintMocap(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The stunt coordinator

const paintStuntco = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const tee = pickOf(F.seed, 6, ['#7F1D1D', '#1E3A8A', '#3F3F46', '#3F6212']);
  const dive = F.v === 'dive', prone = F.v === 'prone';
  if (dive || prone) { g.translate(0, prone ? -8 : -26); g.rotate(Math.PI / 2 - 0.12); g.translate(0, 36); }
  legs(g, B, { col: '#1C1917', shoe: 'boot', shoeCol: '#18181B', detail: (gg, _h, knee) => { part(gg, () => gg.roundRect(knee[0] - 4, knee[1] - 4, 8, 8, 2), '#18181B', knee[0] - 4, knee[1] - 4, 8, 8, 0.8); px(gg, knee[0] - 3, knee[1] - 3, 3, 1, '#3A3A44'); } });
  const fl = flailHands(B, F.fr);
  const set = F.pose === 'tell', hit = F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : dive ? [B.w / 2 + 12, B.shY - 14] : set ? [-B.w / 2 - 2, -20] : [-B.w / 2 - 2, -30];
  const near: [number, number] = fl ? fl[1] : dive ? [B.w / 2 + 16, B.shY - 8] : hit ? [B.w / 2 + 16, B.shY + 6] : set ? [B.w / 2 + 4, -22] : [B.w / 2 + 3, -33];
  const a1 = arm(g, B, -1, far[0], far[1], { sleeve: tee, hand: '#27272A', len: 0.4 });
  part(g, () => g.roundRect(a1.ex - 3.5, a1.ey - 3.5, 7, 7, 2), '#18181B', a1.ex - 3.5, a1.ey - 3.5, 7, 7, 0.7);
  torso(g, B, tee);
  // (the STUNTS vest: black, a stripe of tape across it, STUNTS in it; the radio clipped on)
  part(g, () => g.roundRect(-B.w / 2 + 1, B.shY + 2, B.w - 2, B.hipY - B.shY - 2, 2), '#18181B', -B.w / 2 + 1, B.shY + 2, B.w - 2, B.hipY - B.shY - 2, 1);
  px(g, -B.w / 2 + 2, B.shY + 10, B.w - 4, 4, '#FACC15'); px(g, -B.w / 2 + 2, B.shY + 10, B.w - 4, 1, '#FEF08A');
  for (let k = 0; k < 5; k++) px(g, -7 + k * 3, B.shY + 11, 2, 2, '#18181B');
  px(g, -1, B.shY + 3, 1, B.hipY - B.shY - 5, '#3A3A44');
  walkie(g, -B.w / 2 + 2, B.shY + 16);
  const hat = F.seed % 3;
  head(g, B, F, set || hit || dive ? 'angry' : 'smug', set ? 'o' : dive || hit ? 'teeth' : 'smirk', hat !== 1);
  if (hat === 1) bandana(g, B, '#27272A');
  headset(g, B);
  const a2 = arm(g, B, 1, near[0], near[1], { sleeve: tee, hand: '#27272A', len: 0.4 });
  part(g, () => g.roundRect(a2.ex - 3.5, a2.ey - 3.5, 7, 7, 2), '#18181B', a2.ex - 3.5, a2.ey - 3.5, 7, 7, 0.7);
  px(g, near[0] - 3, near[1] + 2, 5, 2, '#F4F0E8');
  void L;
};
export const drawStuntco = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = e.aiState ?? '';
  const v = st === 'tackle' ? 'dive' : st === 'prone' ? 'prone' : '';
  const F = frameFor(e, f, seed, poseOf(e, ['set'], ['punch']), v);
  putFrame(c, 'hww-stuntco2', F, BOX, g => paintStuntco(g, F));
};
