// The new mean men, drawn (a first pass, on Spooky Land's person drawer, costume.ts, the way part one's are: whoever's in
// the suit shows, man or woman, every skin and build; seeded). Feet at the origin, facing right (the engine mirrors
// them). Each frame painted once into a stamp; the spin's whirl drawn live.
//
//   spindoc   THE SPIN DOCTOR: a white lab coat over a pinstripe suit, a red tie, a stethoscope, a SPIN name badge,
//             slicked hair; turning on the spot faster and faster (the tell), then a whirlwind of coat tails and arms
//             across the floor (the spin), dizzy after (stars, swaying); up close, a slap (a wind up)
//   ditto     THE DITTOHEAD: a red EIB ball cap, a white T-shirt with DITTOS across it, khakis, sneakers, a silver transistor
//             radio: the antenna pulled up, the dial cranked (the tell), the radio thrust out (the blast); up close, a
//             shove with it
// And their bodies as the real stage leaves them (deadActor: whoever played one, dead where he killed them).

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, px, ball, flat,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, hairTop, hairBack, frameOf, putFrame, pickOf,
  moodOf, reaction,
} from '../../spooky/costume';
import { star } from '../whitehouse1/poof';

type Ctx = CanvasRenderingContext2D;

const moving = (e: Enemy, min = 0.3): Pose => (Math.abs(e.vel.x) > min ? 'walk' : 'stand');
const poseOf = (e: Enemy, tells: string[], strikes: string[]): Pose =>
  tells.includes(e.aiState ?? '') ? 'tell' : strikes.includes(e.aiState ?? '') ? 'strike' : moving(e);
const frameFor = (e: Enemy, f: number, seed: number, pose: Pose, v = '') => {
  const r = reaction(e);
  return frameOf(seed, f, r?.pose ?? pose, r?.md ?? moodOf(e), 0, undefined, v);
};
const BOX: [number, number, number, number] = [-84, -170, 178, 174];
const handsAt = (B: Body, F: Frame, far: [number, number], near: [number, number]) => {
  const fl = flailHands(B, F.fr);
  return fl ? { far: fl[0], near: fl[1], held: true } : { far, near, held: false };
};

// ---------------------------------------------------------------------------------------------------------------
// The spin doctor

const SUITS = ['#1F2A44', '#2B2B35', '#3A2E2A'];
const COAT = '#F4F6F8';
const paintSpindoc = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, S = pickOf(F.seed, 4, SUITS);
  const wind = F.v === 'wind', slapBack = F.v === 'slapWind', slap = F.v === 'slap', dizzy = F.v === 'dizzy';
  // (the tell: arms out, turning; the coat flaring)
  legs(g, B, { col: S, shoe: 'shoe', shoeCol: '#111827' });
  const H = handsAt(B, F,
    wind ? [-B.w / 2 - 16, B.shY + 4] : dizzy ? [-B.w / 2 - 6, B.shY + 26] : [-B.w / 2 - 2, B.shY + 20],
    wind ? [B.w / 2 + 16, B.shY + 4] : slapBack ? [B.hx - 6, B.hy - 18] : slap ? [B.w / 2 + 22, B.shY + 8] : dizzy ? [B.w / 2 + 6, B.shY + 26] : [B.w / 2 + 4, B.shY + 20]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: COAT, hand: L.skin });
  // (the lab coat: long, past the hips, flaring out in the tell)
  const flare = wind ? 7 : 0;
  part(g, () => { g.moveTo(-B.w / 2 - 1, B.shY + 1); g.lineTo(B.w / 2 + 1, B.shY + 1); g.lineTo(B.w / 2 + 4 + flare, B.hipY + 14); g.lineTo(-B.w / 2 - 4 - flare, B.hipY + 14); g.closePath(); }, COAT, -B.w / 2 - 4 - flare, B.shY, B.w + 8 + flare * 2, B.hipY - B.shY + 14, 1.1);
  // (the suit showing down the front, the shirt, the red tie, the stethoscope, the badge)
  flat(g, () => { g.moveTo(-5, B.shY + 1); g.lineTo(6, B.shY + 1); g.lineTo(4, B.hipY + 2); g.lineTo(-3, B.hipY + 2); g.closePath(); }, S, 0.8);
  flat(g, () => { g.moveTo(-3, B.shY + 1); g.lineTo(4, B.shY + 1); g.lineTo(0.5, B.shY + 10); g.closePath(); }, '#F8FAFC', 0.6);
  flat(g, () => { g.moveTo(-1, B.shY + 3); g.lineTo(2, B.shY + 3); g.lineTo(2.5, B.shY + 15); g.lineTo(0.5, B.shY + 17); g.lineTo(-1.5, B.shY + 15); g.closePath(); }, '#DC2626', 0.6);
  g.strokeStyle = '#374151'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-6, B.shY + 2); g.quadraticCurveTo(-8, B.shY + 14, -2, B.shY + 18); g.stroke();
  ball(g, -2, B.shY + 18, 1.8, '#9CA3AF', 0.6);
  px(g, 5, B.shY + 6, 6, 4, '#FDE047'); px(g, 6, B.shY + 7, 4, 1, '#B91C1C');
  hairBack(g, B);
  headShape(g, B, L.skin);
  faceOn(g, B, { skin: L.skin, eyes: dizzy ? 'tired' : wind ? 'wide' : slap || slapBack ? 'angry' : 'smug', mouth: wind ? 'teeth' : slap ? 'teeth' : dizzy ? 'o' : 'grin', md: F.md, blink: F.blink });
  whiskers(g, B);
  // (slicked back hair, a shine on it)
  hairTop(g, B); if (!L.bald) px(g, B.hx - 5, B.hy - 9, 8, 1, lt(L.hair, 0.5));
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: COAT, hand: L.skin });
};
export const drawSpindoc = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = e.aiState ?? '';
  if (st === 'spin' && e.health > 0) { whirl(c, e, f, seed); return; }
  const v = st === 'wind' ? 'wind' : st === 'slapWind' ? 'slapWind' : st === 'slap' ? 'slap' : st === 'dizzy' ? 'dizzy' : '';
  const F0 = frameFor(e, f, seed, poseOf(e, ['wind', 'slapWind'], ['slap']), v);
  const F = F0.pose === 'tell' ? { ...F0, fr: (f >> 2) % 6 } : F0;
  // (turning in the tell: squashed side to side, faster as it goes)
  if (st === 'wind' && e.health > 0) {
    const sp = 0.2 + Math.min(1, (e.aiTimer ?? 0) / 34) * 0.7;
    c.save(); c.scale(Math.max(0.25, Math.abs(Math.cos(f * sp))) * (Math.cos(f * sp) < 0 ? -1 : 1), 1);
    putFrame(c, 'ct-spindoc', F, BOX, g => paintSpindoc(g, F));
    c.restore();
    return;
  }
  putFrame(c, 'ct-spindoc', F, BOX, g => paintSpindoc(g, F));
  if (st === 'dizzy' && e.health > 0) for (let i = 0; i < 3; i++) { const a = f * 0.2 + (i / 3) * Math.PI * 2; star(c, Math.cos(a) * 14, -84 + Math.sin(a) * 4, 4, i % 2 ? '#FDE047' : '#FFFFFF'); }
};
/** The spin: a cartoon whirlwind of white coat, arms and legs, his head bobbing up out of the top. */
const whirl = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const L = bodyOf(seed, 'stand', 0).L, S = pickOf(seed, 4, SUITS);
  // (the funnel: stacked ellipses, inked, wobbling)
  for (let k = 0; k < 6; k++) {
    const y = -6 - k * 12, w = 10 + k * 4.5, dx = Math.sin(f * 0.9 + k) * 3;
    c.beginPath(); c.ellipse(dx, y, w + 2, 7, 0, 0, Math.PI * 2); c.fillStyle = INK; c.fill();
    c.beginPath(); c.ellipse(dx, y, w, 5.5, 0, 0, Math.PI * 2); c.fillStyle = k % 2 ? COAT : '#DDE3EA'; c.fill();
    // (bits of him going round: the suit, an arm, the tie)
    const a = f * 0.8 + k * 1.3, bx = dx + Math.cos(a) * w * 0.8;
    c.fillStyle = [S, L.skin, '#DC2626'][k % 3]; c.fillRect(Math.round(bx) - 2, Math.round(y - 2), 5, 4);
  }
  // (speed lines off it)
  c.strokeStyle = INK; c.lineWidth = 1.5;
  for (let k = 0; k < 3; k++) { const y = -18 - k * 20; c.beginPath(); c.moveTo(-30 - (f % 6), y); c.lineTo(-44 - (f % 6), y); c.stroke(); }
  // (his head up out of it, spinning: face, back of the head, face)
  const hy = -84, face = Math.cos(f * 0.9) > 0;
  c.beginPath(); c.arc(0, hy, 10.5, 0, Math.PI * 2); c.fillStyle = INK; c.fill();
  c.beginPath(); c.arc(0, hy, 9, 0, Math.PI * 2); c.fillStyle = face ? L.skin : L.hair; c.fill();
  if (face) { c.fillStyle = INK; c.fillRect(-4, hy - 3, 2, 2); c.fillRect(2, hy - 3, 2, 2); c.fillRect(-3, hy + 3, 6, 2); }
  void e;
};

// ---------------------------------------------------------------------------------------------------------------
// The dittohead

const TEES = ['#F8FAFC', '#F1F5F9', '#FEF3C7'];
const radio = (g: Ctx, x: number, y: number, a: number, up: boolean, f: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => g.roundRect(-9, -7, 18, 13, 2), '#C0C6CF', -9, -7, 18, 13, 1);
  px(g, -7, -5, 8, 8, '#4B5563'); for (let k = 0; k < 3; k++) px(g, -6, -4 + k * 2.5, 6, 1, '#9CA3AF');
  ball(g, 4.5, -1, 2.4, '#1F2937', 0.8); px(g, 4, -2.5, 1, 2, '#FDE047');
  // (the antenna: down, or up and wagging, a spark of static off it)
  g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.moveTo(7, -7);
  if (up) g.lineTo(13 + Math.sin(f * 0.8) * 2, -26); else g.lineTo(11, -12);
  g.stroke(); g.strokeStyle = '#E5E7EB'; g.lineWidth = 0.7; g.stroke();
  if (up && f % 4 < 2) { px(g, 12, -30, 2, 2, '#FDE047'); px(g, 16, -27, 2, 2, '#FDE047'); }
  g.restore();
};
const paintDitto = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, T = pickOf(F.seed, 5, TEES);
  const tune = F.v === 'tune', blast = F.v === 'blast', shoveBack = F.v === 'shoveWind', shove = F.v === 'shove';
  legs(g, B, { col: '#C8B48A', shoe: 'sneaker', shoeCol: '#F8FAFC' });
  const H = handsAt(B, F,
    tune ? [B.hx + 4, B.hy + 2] : [-B.w / 2 - 2, B.shY + 20],
    tune ? [B.hx + 12, B.hy - 4] : blast ? [B.w / 2 + 22, B.shY + 4] : shoveBack ? [B.hx - 4, B.hy - 14] : shove ? [B.w / 2 + 22, B.shY + 10] : [B.w / 2 + 6, B.shY + 18]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: L.skin, hand: L.skin, len: 0.3 });
  torso(g, B, T, B.shY, B.hipY + 2, 2);
  // (DITTOS across the T-shirt, red; a little gut on the heavy ones)
  px(g, -8, B.shY + 8, 17, 4, '#DC2626'); for (let k = 0; k < 4; k++) px(g, -7 + k * 4, B.shY + 9, 2, 2, '#FFFFFF');
  px(g, -B.w / 2 + 2, B.hipY - 2, B.w - 4, 2, '#7C6A44');
  hairBack(g, B);
  headShape(g, B, L.skin);
  faceOn(g, B, { skin: L.skin, eyes: tune || blast ? 'wide' : shove ? 'angry' : 'open', mouth: tune || blast ? 'teeth' : 'grin', md: F.md, blink: F.blink });
  whiskers(g, B);
  // (the red EIB cap, bill forward)
  part(g, () => { g.moveTo(B.hx - 9, B.hy - 3); g.quadraticCurveTo(B.hx - 9, B.hy - 13, B.hx + 1, B.hy - 13); g.quadraticCurveTo(B.hx + 10, B.hy - 13, B.hx + 9, B.hy - 3); g.closePath(); }, '#B91C1C', B.hx - 9, B.hy - 13, 18, 10, 1);
  part(g, () => g.roundRect(B.hx + 3, B.hy - 5, 11, 3, 1), '#991B1B', B.hx + 3, B.hy - 5, 11, 3, 0.8);
  px(g, B.hx - 4, B.hy - 10, 8, 3, '#FDE047'); px(g, B.hx - 3, B.hy - 9, 1, 1, '#B91C1C'); px(g, B.hx, B.hy - 9, 1, 1, '#B91C1C'); px(g, B.hx + 2, B.hy - 9, 1, 1, '#B91C1C');
  if (L.long && !L.bald) px(g, B.hx - 9, B.hy - 2, 3, 10, L.hair);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: L.skin, hand: L.skin, len: 0.3 });
  if (!H.held) radio(g, H.near[0] + 2, H.near[1] - 2, tune ? -0.3 : blast ? 0 : shoveBack ? -1.8 : shove ? 0.6 : 0.1, tune || blast, F.fr);
};
export const drawDitto = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = e.aiState ?? '';
  const v = st === 'tune' ? 'tune' : st === 'blast' ? 'blast' : st === 'shoveWind' ? 'shoveWind' : st === 'shove' ? 'shove' : '';
  const F0 = frameFor(e, f, seed, poseOf(e, ['tune', 'shoveWind'], ['blast', 'shove']), v);
  const F = F0.pose === 'tell' ? { ...F0, fr: (f >> 2) % 6 } : F0;
  putFrame(c, 'ct-ditto', F, BOX, g => paintDitto(g, F));
  // (cranking it: music notes and static out of it)
  if (st === 'tune' && e.health > 0) {
    for (let k = 0; k < 3; k++) {
      const t = ((f + k * 9) % 27) / 27, x = 22 + t * 18, y = -98 - t * 22;
      c.fillStyle = INK; c.fillRect(Math.round(x), Math.round(y), 4, 3); c.fillRect(Math.round(x) + 3, Math.round(y) - 8, 1.5, 9);
      c.fillStyle = k % 2 ? '#F87171' : '#FDE047'; c.fillRect(Math.round(x) + 0.5, Math.round(y) + 0.5, 3, 2);
    }
  }
};

/** A sound wave off a dittohead's radio (world): three arcs rolling along, red-orange-yellow, a wobble. */
export const drawWave = (c: Ctx, x: number, y: number, dir: number, t: number) => {
  c.save(); c.translate(x, y); c.scale(dir, 1);
  for (let k = 0; k < 3; k++) {
    const r = 10 + k * 7 + Math.sin(t * 0.5 + k) * 1.5;
    c.lineCap = 'round';
    c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.arc(-k * 6, 0, r, -0.9, 0.9); c.stroke();
    c.strokeStyle = ['#FDE047', '#FB923C', '#EF4444'][k]; c.lineWidth = 3; c.stroke();
  }
  c.lineCap = 'butt';
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Dead, on the real stage (whoever played one, as he left them)

/** One of the new mean men's actors, dead (the engine's limp body drawing), feet at the origin, facing right, upright:
 *  the caller lays it down. */
export const paintDeadNew = (c: Ctx, kind: string, seed: number) => {
  const F = frameOf(seed, 0, 'limp', 'dead');
  if (kind === 'm2:ct_spindoc') putFrame(c, 'ct-spindoc', F, BOX, g => paintSpindoc(g, F));
  else putFrame(c, 'ct-ditto', F, BOX, g => paintDitto(g, F));
};
void dk;
