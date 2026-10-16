// Disaster: The Ride's staff, drawn (first pass: readable, on Spooky Land's person-in-a-costume drawer, costume.ts, so
// whoever's in the uniform shows: their skin, build, hair and face):
//   usher   the red vest over a white shirt, a black bow tie, black slacks, a red pillbox cap; the stanchion (a brass post
//           on its round foot, the velvet rope hanging off it) down at the side, hoisted overhead, swung out flat
//   tech    a black CREW tee, black cargo pants, a headset and its mic; the fog canister (white, a blue band, FOG on it,
//           the horn) at the hip, shaken (the tell), aimed (the spray)
//   twisty  TWISTY: a gray foam tornado over the body (wide at the shoulders, down to a point at the knees), stripes
//           swirling round it, googly eyes on top, the face in its hole, stubby arms out the sides, legs in gray tights
// Feet at the origin, facing right (the engine mirrors them). Each frame painted once into a stamp (putFrame).

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, px, limb, ball, dither,
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
const BOX: [number, number, number, number] = [-60, -124, 130, 128];
const face = (g: Ctx, B: Body, F: Frame, eyes: 'open' | 'angry' | 'wide' | 'tired' | 'smug', mouth: 'flat' | 'grin' | 'smile' | 'teeth' | 'o' | 'smirk') => {
  headShape(g, B, B.L.skin);
  faceOn(g, B, { skin: B.L.skin, eyes, mouth, md: F.md, blink: F.blink });
};

// ---------------------------------------------------------------------------------------------------------------
// The usher

/** The stanchion: the brass post (its foot at the bottom, its top knob), the velvet rope hanging off the top. */
const stanchion = (g: Ctx, x: number, y: number, ang: number) => {
  g.save(); g.translate(x, y); g.rotate(ang);
  // (held about a third of the way up: the knob end out ahead, the foot behind)
  limb(g, -14, 0, 34, 0, 3.4, '#CA8A04');
  ball(g, 36, 0, 3.4, '#FDE68A', 0.9);
  part(g, () => g.ellipse(-16, 0, 3, 8, 0, 0, Math.PI * 2), '#A16207', -19, -8, 6, 16, 1);
  // (the brass's glints down the post, its collar)
  px(g, -10, -2, 40, 1, '#FEF3C7'); px(g, 14, -3, 3, 6, '#A16207'); px(g, 14, -3, 1, 6, '#FDE68A');
  // (the rope, hanging off the knob end: velvet, a lit strand, the brass snap at its end)
  g.strokeStyle = INK; g.lineWidth = 3.4; g.beginPath(); g.moveTo(34, 2); g.quadraticCurveTo(36, 16, 30, 24); g.stroke();
  g.strokeStyle = '#991B1B'; g.lineWidth = 2; g.beginPath(); g.moveTo(34, 2); g.quadraticCurveTo(36, 16, 30, 24); g.stroke();
  g.strokeStyle = '#D84A5A'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(33.5, 3); g.quadraticCurveTo(35, 15, 29.5, 23); g.stroke();
  px(g, 28, 23, 4, 3, INK); px(g, 29, 23, 2, 2, '#FDE68A');
  g.restore();
};
const paintUsher = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const vest = pickOf(F.seed, 2, ['#B91C1C', '#991B1B', '#DC2626']);
  legs(g, B, { col: '#18181B', shoe: 'shoe', shoeCol: '#0C0A09' });
  const fl = flailHands(B, F.fr);
  const up = F.pose === 'tell', swing = F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : up ? [-4, B.shY - 16] : swing ? [B.w / 2 + 6, B.shY + 10] : [-B.w / 2 - 2, -30];
  const near: [number, number] = fl ? fl[1] : up ? [6, B.shY - 18] : swing ? [B.w / 2 + 14, B.shY + 8] : [B.w / 2 + 3, -32];
  arm(g, B, -1, far[0], far[1], { sleeve: '#F5F5F4', hand: L.skin });
  torso(g, B, '#F5F5F4');
  // (the vest, open down the middle; its buttons; the bow tie; the name tag)
  part(g, () => { g.moveTo(-B.w / 2, B.shY + 2); g.lineTo(-B.hipW / 2 - 1, B.hipY + 2); g.lineTo(-2, B.hipY + 2); g.lineTo(-2, B.shY + 6); g.closePath(); }, vest, -B.hipW / 2 - 1, B.shY + 2, B.w / 2, B.hipY - B.shY, 1);
  part(g, () => { g.moveTo(B.w / 2, B.shY + 2); g.lineTo(B.hipW / 2 + 1, B.hipY + 2); g.lineTo(3, B.hipY + 2); g.lineTo(3, B.shY + 6); g.closePath(); }, vest, 3, B.shY + 2, B.w / 2, B.hipY - B.shY, 1);
  // (the vest's gold piping down its fronts, its brass buttons lit)
  g.strokeStyle = '#CA8A04'; g.lineWidth = 1; g.beginPath(); g.moveTo(-2, B.shY + 6); g.lineTo(-2, B.hipY + 2); g.moveTo(3, B.shY + 6); g.lineTo(3, B.hipY + 2); g.stroke();
  for (let k = 0; k < 3; k++) { px(g, 4, B.shY + 9 + k * 6, 2, 2, '#A16207'); px(g, 4, B.shY + 9 + k * 6, 1, 1, '#FEF3C7'); }
  part(g, () => { g.moveTo(-5, B.shY + 1); g.lineTo(0, B.shY + 4); g.lineTo(5, B.shY + 1); g.lineTo(5, B.shY + 7); g.lineTo(0, B.shY + 4); g.lineTo(-5, B.shY + 7); g.closePath(); }, '#0C0A09', -5, B.shY + 1, 10, 6, 0.8);
  px(g, -9, B.shY + 9, 7, 3, '#FEF3C7');
  hairBack(g, B);
  face(g, B, F, up || swing ? 'angry' : 'smug', swing ? 'teeth' : up ? 'o' : 'flat');
  whiskers(g, B);
  hairTop(g, B);
  // (the pillbox cap, its gold band)
  part(g, () => g.roundRect(B.hx - 6, B.hy - 15, 13, 7, 1), vest, B.hx - 6, B.hy - 15, 13, 7, 1);
  px(g, B.hx - 6, B.hy - 10, 13, 2, '#CA8A04'); px(g, B.hx - 6, B.hy - 10, 13, 1, '#FDE68A');
  px(g, B.hx - 5, B.hy - 15, 11, 1, lt(vest, 0.35));
  // (its chin strap)
  g.strokeStyle = '#0C0A09'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(B.hx - 6, B.hy - 8); g.quadraticCurveTo(B.hx, B.hy + B.ry + 1, B.hx + 7, B.hy - 8); g.stroke();
  arm(g, B, 1, near[0], near[1], { sleeve: '#F5F5F4', hand: L.skin });
  if (!fl) stanchion(g, near[0], near[1], up ? -1.75 : swing ? 0.05 : 1.35);
};
export const drawUsher = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['hoist'], ['swing']));
  putFrame(c, 'hwd-usher', F, BOX, g => paintUsher(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The tech

const canister = (g: Ctx, x: number, y: number, aim: boolean, shake: number) => {
  g.save(); g.translate(x + shake, y);
  if (aim) g.rotate(-0.1);
  part(g, () => g.roundRect(-6, -9, 22, 15, 4), '#F8FAFC', -6, -9, 22, 15, 1.1);
  px(g, -4, -4, 18, 3, '#2563EB'); px(g, -4, -4, 18, 1, '#60A5FA'); px(g, -4, -2, 18, 1, '#1E3A8A');
  px(g, 0, -8, 6, 2, '#1E3A8A'); px(g, 0, -8, 2, 1, '#93C5FD');
  // (FOG on it: three stenciled blocks of navy, and the dents)
  px(g, -2, 1, 3, 3, '#1E3A8A'); px(g, 3, 1, 3, 3, '#1E3A8A'); px(g, 8, 1, 3, 3, '#1E3A8A'); px(g, 4, 2, 1, 1, '#F8FAFC');
  px(g, 12, -6, 2, 1, dk('#F8FAFC', 0.3));
  // (the horn)
  part(g, () => { g.moveTo(15, -4); g.lineTo(26, -8); g.lineTo(26, 3); g.lineTo(15, 0); g.closePath(); }, '#27272A', 15, -8, 11, 11, 1);
  g.restore();
};
const paintTech = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const tee = pickOf(F.seed, 3, ['#18181B', '#27272A', '#1C1917']);
  legs(g, B, { col: '#292524', shoe: 'boot', shoeCol: '#0C0A09' });
  const fl = flailHands(B, F.fr);
  const shake = F.pose === 'tell', spray = F.pose === 'strike';
  const jig = shake ? (F.v === 's1' ? 3 : -3) : 0;
  const far: [number, number] = fl ? fl[0] : shake || spray ? [B.w / 2 + 2, B.shY + 16] : [-B.w / 2 - 2, -30];
  const near: [number, number] = fl ? fl[1] : shake || spray ? [B.w / 2 + 10, B.shY + 14] : [B.w / 2 + 3, -32];
  arm(g, B, -1, far[0] + jig, far[1], { sleeve: tee, hand: L.skin, len: 0.45 });
  torso(g, B, tee);
  // (CREW on the chest, a tool belt, the walkie)
  px(g, -7, B.shY + 8, 14, 3, '#E7E5E4'); px(g, -7, B.shY + 8, 14, 1, '#FFFFFF');
  for (let k = 0; k < 4; k++) px(g, -6 + k * 4, B.shY + 9, 2, 1, tee);
  px(g, -B.hipW / 2, B.hipY - 3, B.hipW, 3, '#57534E'); px(g, -B.hipW / 2, B.hipY - 3, B.hipW, 1, '#8A8480');
  px(g, -1, B.hipY - 3, 3, 3, '#A8A29E');
  px(g, -B.hipW / 2 + 1, B.hipY - 8, 4, 7, '#3F3F46'); px(g, -B.hipW / 2 + 1, B.hipY - 8, 4, 1, '#71717A'); px(g, -B.hipW / 2 + 2, B.hipY - 11, 1, 3, '#27272A');
  // (a roll of gaffer on the belt, a cargo pocket on the near thigh)
  px(g, B.hipW / 2 - 4, B.hipY - 6, 5, 5, INK); px(g, B.hipW / 2 - 3, B.hipY - 5, 3, 3, '#52525B'); px(g, B.hipW / 2 - 2, B.hipY - 4, 1, 1, INK);
  px(g, 2, B.hipY + 10, 6, 6, dk('#292524', 0.2)); px(g, 2, B.hipY + 10, 6, 1, lt('#292524', 0.2));
  hairBack(g, B);
  face(g, B, F, spray ? 'angry' : shake ? 'wide' : 'tired', spray ? 'teeth' : 'flat');
  whiskers(g, B);
  hairTop(g, B);
  // (the headset: the band over, the cup, the mic round to the mouth)
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(B.hx, B.hy - 2, 9.5, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
  part(g, () => g.ellipse(B.hx - 7, B.hy, 3, 4, 0, 0, Math.PI * 2), '#27272A', B.hx - 10, B.hy - 4, 6, 8, 1);
  g.strokeStyle = '#27272A'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(B.hx - 6, B.hy + 3); g.quadraticCurveTo(B.hx, B.hy + 9, B.hx + 6, B.hy + 7); g.stroke();
  arm(g, B, 1, near[0] + jig, near[1], { sleeve: tee, hand: L.skin, len: 0.45 });
  if (!fl) canister(g, near[0] - 4, near[1] - 2, spray, jig);
};
export const drawTech = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const pose = poseOf(e, ['shake'], ['spray']);
  const F = frameFor(e, f, seed, pose, pose === 'tell' ? (Math.floor(f / 3) % 2 ? 's1' : 's0') : '');
  putFrame(c, 'hwd-tech', F, BOX, g => paintTech(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// Twisty

const FOAM = '#9CA3AF';
const paintTwisty = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose === 'strike' || F.pose === 'tell' ? 'stand' : F.pose, F.fr), L = B.L;
  const fl = flailHands(B, F.fr);
  const turn = F.v.startsWith('r') ? +F.v.slice(1) : 0;
  // (the legs, in gray tights, under the point of the cone)
  legs(g, B, { col: '#6B7280', shoe: 'sneaker', shoeCol: '#F5F5F4' });
  const top = B.hy - 24, bot = B.hipY + 12, wTop = 34, wBot = 9;
  // (the arms, stubby, out the sides: up and out spinning, flapping dizzy)
  const dizzy = F.v === 'dz0' || F.v === 'dz1';
  const flap = dizzy ? (F.v === 'dz1' ? -8 : 4) : 0;
  const far: [number, number] = fl ? fl[0] : turn ? [-30, B.shY - 4] : [-24, B.shY + 10 + flap];
  const near: [number, number] = fl ? fl[1] : turn ? [32, B.shY - 4] : [26, B.shY + 10 - flap];
  arm(g, B, -1, far[0], far[1], { sleeve: FOAM, hand: '#F5F5F4', len: 0.9 });
  // The cone: wide at the top, to a point at the knees; its stripes swirling round (turning when it spins)
  part(g, () => { g.moveTo(-wTop, top); g.quadraticCurveTo(0, top - 8, wTop, top); g.lineTo(wBot, bot); g.quadraticCurveTo(0, bot + 4, -wBot, bot); g.closePath(); }, FOAM, -wTop, top - 8, wTop * 2, bot - top + 12, 1.4);
  // (the foam's shade down its right, dithered in; the lit band up its left)
  g.save(); g.beginPath(); g.moveTo(-wTop, top); g.quadraticCurveTo(0, top - 8, wTop, top); g.lineTo(wBot, bot); g.quadraticCurveTo(0, bot + 4, -wBot, bot); g.closePath(); g.clip();
  g.fillStyle = dk(FOAM, 0.22); g.beginPath(); g.moveTo(wTop * 0.35, top - 8); g.lineTo(wTop + 2, top - 8); g.lineTo(wBot + 2, bot + 4); g.lineTo(wBot * 0.2, bot + 4); g.closePath(); g.fill();
  dither(g, wTop * 0.15, top - 8, wTop * 0.25, bot - top + 12, dk(FOAM, 0.22));
  g.fillStyle = lt(FOAM, 0.25); g.beginPath(); g.moveTo(-wTop, top - 8); g.lineTo(-wTop * 0.55, top - 8); g.lineTo(-wBot * 0.4, bot + 4); g.lineTo(-wBot - 2, bot + 4); g.closePath(); g.fill();
  g.restore();
  for (let k = 0; k < 5; k++) {
    const y = top + 10 + k * ((bot - top - 10) / 5), w = wTop - (wTop - wBot) * ((y - top) / (bot - top));
    const ph = ((k * 13 + turn * 9) % 24) - 12;
    g.strokeStyle = dk(FOAM, 0.3); g.lineWidth = 2;
    g.beginPath(); g.moveTo(-w + 2, y); g.quadraticCurveTo(ph, y + 6, w - 2, y - 2); g.stroke();
    px(g, -w + 3, y - 3, 4, 1, lt(FOAM, 0.4));
  }
  // (the face hole, the face in it)
  part(g, () => g.ellipse(B.hx + 1, B.hy + 1, B.rx + 2, B.ry + 2, 0, 0, Math.PI * 2), dk(FOAM, 0.45), B.hx - B.rx - 1, B.hy - B.ry - 1, B.rx * 2 + 4, B.ry * 2 + 4, 1);
  headShape(g, B, L.skin, false);
  faceOn(g, B, { skin: L.skin, eyes: dizzy ? 'tired' : turn ? 'wide' : 'open', mouth: turn ? 'o' : dizzy ? 'o' : 'grin', md: F.md, blink: F.blink });
  whiskers(g, B);
  // (the googly eyes on top, their pupils off wherever)
  for (const s of [-1, 1]) {
    ball(g, s * 11, top - 6, 6, '#FFFFFF', 1.2);
    const a = (turn + F.fr) * 1.3 + s;
    ball(g, s * 11 + Math.cos(a) * 2.5, top - 6 + Math.sin(a) * 2.5, 2.4, INK, 0.5);
  }
  arm(g, B, 1, near[0], near[1], { sleeve: FOAM, hand: '#F5F5F4', len: 0.9 });
  // (TWISTY on the front)
  px(g, -10, B.shY + 20, 20, 5, '#1E3A8A'); px(g, -8, B.shY + 21, 16, 3, '#FDE047');
  // (dizzy: the stars going round its head)
  if (dizzy) for (let k = 0; k < 3; k++) { const a = F.fr * 1.2 + k * 2.1; px(g, B.hx + Math.cos(a) * 14 - 1, top - 16 + Math.sin(a) * 4, 3, 3, '#FDE047'); }
};
export const drawTwisty = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = e.aiState ?? '';
  const pose: Pose = st === 'windup' ? 'tell' : st === 'spin' ? 'strike' : moving(e);
  const v = st === 'spin' ? `r${Math.floor(f / 2) % 4 + 1}` : st === 'windup' ? `r${Math.floor(f / 5) % 4 + 1}` : st === 'dizzy' ? (Math.floor(f / 8) % 2 ? 'dz1' : 'dz0') : '';
  const F = frameFor(e, f, seed, pose, v);
  putFrame(c, 'hwd-twisty', F, BOX, g => paintTwisty(g, F));
};
