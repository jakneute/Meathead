// STEVE'S STUNT DOUBLE, drawn: CON-FUCK-TIOUS's practice dummy up the water tower (benTower.ts's m2:hw_double), on Spooky
// Land's person-in-a-costume drawer (costume.ts: whoever's under it shows, their skin, build and face). The union's
// cheapest double for Stuntman Steve: his yellow stunt suit with the red stripe down it (baggy, off the rack), white
// stunt boots, black knee and elbow pads; Steve's look done cheap: a mullet wig (the netting showing at the temple),
// gold aviators, a stick-on horseshoe mustache, the neck brace; a target taped on the chest and a DOUBLE name patch.
// Feet at the origin, facing right (the engine mirrors him). Each frame painted once into a stamp (putFrame).

import type { Enemy } from '../../../m1/types';
import {
  type Frame, type Body, INK, dk, lt, part, px, bodyOf, flailHands, legs, torso, arm, headShape, faceOn, hairBack, frameOf,
  putFrame, moodOf, reaction,
} from '../../spooky/costume';

type Ctx = CanvasRenderingContext2D;
const BOX: [number, number, number, number] = [-60, -128, 132, 132];
const SUIT = '#EAB516', STRIPE = '#DC2626', PAD = '#27272A', WIG = '#8A4A18';

const head = (g: Ctx, F: Frame, B: Body) => {
  const { hx, hy } = B;
  // (the mullet wig: short on top, long down the back of the neck, its netting showing at the temple)
  hairBack(g, B, WIG, 20);
  headShape(g, B, B.L.skin);
  faceOn(g, B, { skin: B.L.skin, eyes: F.pose === 'tell' ? 'angry' : 'open', mouth: F.md === 'hurt' ? 'o' : 'flat', md: F.md, blink: F.blink, skipEyes: true });
  part(g, () => { g.moveTo(hx - 10, hy - 4); g.quadraticCurveTo(hx - 9, hy - 15, hx + 1, hy - 14); g.quadraticCurveTo(hx + 10, hy - 13, hx + 9, hy - 7); g.lineTo(hx + 2, hy - 9); g.lineTo(hx - 4, hy - 6); g.closePath(); }, WIG, hx - 10, hy - 15, 20, 11, 1);
  for (let k = 0; k < 3; k++) px(g, hx - 7 + k * 2, hy - 5 + (k % 2), 1, 1, '#D8C8A8');
  // (the gold aviators, the stick-on horseshoe mustache, one end peeling)
  px(g, hx - 2, hy - 4, 13, 1, '#CA8A04');
  part(g, () => g.roundRect(hx - 1, hy - 4, 5, 4, 1.5), '#2A2A30', hx - 1, hy - 4, 5, 4, 0.8); part(g, () => g.roundRect(hx + 5, hy - 4, 5, 4, 1.5), '#2A2A30', hx + 5, hy - 4, 5, 4, 0.8);
  px(g, hx, hy - 3, 1, 1, '#FDE68A'); px(g, hx + 6, hy - 3, 1, 1, '#FDE68A');
  px(g, hx + 1, hy + 3, 9, 2, '#5A2E0E'); px(g, hx + 1, hy + 3, 2, 5, '#5A2E0E'); px(g, hx + 8, hy + 3, 2, 4, '#5A2E0E'); px(g, hx + 9, hy + 7, 2, 1, '#5A2E0E');
  // (the neck brace: white foam, its strap)
  part(g, () => g.roundRect(hx - 8, hy + 8, 17, 6, 2), '#F1F5F9', hx - 8, hy + 8, 17, 6, 1);
  px(g, hx - 6, hy + 10, 13, 1, '#CBD5E1');
};

const paintDouble = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr, false), L = B.L;
  legs(g, B, { col: SUIT, shoe: 'boot', shoeCol: '#F5F5F4', stripe: STRIPE, detail: (gg, _h, k, ft, near) => {
    // (the knee pads, the boots' buckles)
    part(gg, () => gg.ellipse(k[0] + 1, k[1], 4.6, 4, 0, 0, Math.PI * 2), near ? PAD : dk(PAD, 0.2), k[0] - 4, k[1] - 4, 10, 8, 0.8);
    px(gg, k[0] - 1, k[1] - 2, 3, 1, '#52525B');
    px(gg, ft[0] - 3, ft[1] - 8, 7, 1, '#A1A1AA');
  } });
  const fl = flailHands(B, F.fr);
  const far: [number, number] = fl ? fl[0] : [-B.w / 2 - 2, -30];
  // (the near hand: a thumbs up, like the poster)
  const near: [number, number] = fl ? fl[1] : [B.w / 2 + 6, B.shY + 6];
  arm(g, B, -1, far[0], far[1], { sleeve: dk(SUIT, 0.1), hand: L.skin, len: 0.85 });
  torso(g, B, SUIT);
  // (the red stripe down the middle, the zip, the target taped on the chest, the DOUBLE patch, the belt)
  px(g, -2, B.shY + 1, 4, B.hipY - B.shY, STRIPE); px(g, -2, B.shY + 1, 1, B.hipY - B.shY, lt(STRIPE, 0.3));
  const tx = 5, ty = B.shY + 12;
  for (const [r, col] of [[6, '#F8FAFC'], [4.4, STRIPE], [2.8, '#F8FAFC'], [1.3, STRIPE]] as const) { g.fillStyle = INK; g.beginPath(); g.arc(tx, ty, r + 0.7, 0, Math.PI * 2); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(tx, ty, r, 0, Math.PI * 2); g.fill(); }
  px(g, tx - 7, ty - 7, 4, 2, '#A1A1AA'); px(g, tx + 4, ty + 5, 4, 2, '#A1A1AA');
  px(g, -B.w / 2 + 2, B.shY + 6, 8, 4, '#F8FAFC'); px(g, -B.w / 2 + 3, B.shY + 7, 6, 1, STRIPE); px(g, -B.w / 2 + 3, B.shY + 9, 4, 1, '#52525B');
  px(g, -B.hipW / 2, B.hipY - 2, B.hipW, 3, '#1C1917'); px(g, -2, B.hipY - 2, 4, 3, '#D4D4D8');
  head(g, F, B);
  arm(g, B, 1, near[0], near[1], { sleeve: SUIT, hand: L.skin, len: 0.85 });
  // (the elbow pads; the thumb up)
  if (!fl) { px(g, near[0] - 2, near[1] - 6, 3, 5, L.skin); px(g, near[0] - 2, near[1] - 6, 3, 1, lt(L.skin, 0.3)); }
};

export const drawDouble = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const r = reaction(e);
  const F = frameOf(seed, f, r?.pose ?? (Math.abs(e.vel.x) > 0.3 ? 'walk' : 'stand'), r?.md ?? moodOf(e), 0, false);
  putFrame(c, 'hw-double1', F, BOX, g => paintDouble(g, F));
};
