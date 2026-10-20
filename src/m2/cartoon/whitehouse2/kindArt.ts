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
  // (the coat's pinstriped suit under it, its lapels stepped, the breast pocket full of pens, the hip pockets, the
  // buttons, the vent up the back of the tails)
  g.strokeStyle = lt(S, 0.2); g.lineWidth = 0.5; for (const k of [-3, 0, 3]) { g.beginPath(); g.moveTo(k, B.shY + 2); g.lineTo(k * 0.6, B.hipY); g.stroke(); }
  flat(g, () => { g.moveTo(-5, B.shY + 1); g.lineTo(-9, B.shY + 8); g.lineTo(-3, B.shY + 16); g.closePath(); }, '#FFFFFF', 0.6);
  flat(g, () => { g.moveTo(6, B.shY + 1); g.lineTo(10, B.shY + 8); g.lineTo(4, B.shY + 16); g.closePath(); }, '#D8DEE6', 0.6);
  px(g, -10, B.shY + 9, 6, 1, '#9AA4B4'); px(g, -9, B.shY + 6, 1, 4, '#2563EB'); px(g, -7, B.shY + 5, 1, 5, '#DC2626'); px(g, -9, B.shY + 5, 1, 1, '#E5E7EB');
  for (const sx of [-B.w / 2 + 1, B.w / 2 - 6]) { px(g, sx, B.hipY - 2, 6, 1, '#9AA4B4'); px(g, sx, B.hipY + 4, 6, 1, '#C8D0DA'); }
  for (const by of [B.shY + 18, B.shY + 24]) px(g, 5, by, 1.6, 1.6, '#9AA4B4');
  px(g, B.w / 2 + flare - 2, B.hipY + 4, 1, 10, '#C8D0DA');
  hairBack(g, B);
  headShape(g, B, L.skin);
  faceOn(g, B, { skin: L.skin, eyes: dizzy ? 'tired' : wind ? 'wide' : slap || slapBack ? 'angry' : 'smug', mouth: wind ? 'teeth' : slap ? 'teeth' : dizzy ? 'o' : 'grin', md: F.md, blink: F.blink });
  whiskers(g, B);
  // (slicked back hair, a shine on it)
  hairTop(g, B); if (!L.bald) px(g, B.hx - 5, B.hy - 9, 8, 1, lt(L.hair, 0.5));
  // (the head mirror on its band: the doctor's reflector, a glint)
  g.strokeStyle = '#3A3A48'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(B.hx - B.rx, B.hy - 6); g.lineTo(B.hx + B.rx - 1, B.hy - 8); g.stroke();
  ball(g, B.hx + 1, B.hy - 10, 3.6, '#C8D0DA', 0.9); px(g, B.hx, B.hy - 12, 1.4, 1.4, '#FFFFFF'); px(g, B.hx + 1, B.hy - 10, 1, 1, '#3A3A48');
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: COAT, hand: L.skin });
  // (the cuffs' pinstripe showing at the wrists)
  if (!H.held) { px(g, H.near[0] - 3, H.near[1] - 5, 5, 1.4, S); px(g, H.far[0] - 3, H.far[1] - 5, 5, 1.4, S); }
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
  // (the funnel: stacked ellipses, inked, wobbling, each stepped: lit along its top, shaded under, a dithered seam)
  for (let k = 0; k < 6; k++) {
    const y = -6 - k * 12, w = 10 + k * 4.5, dx = Math.sin(f * 0.9 + k) * 3, base = k % 2 ? COAT : '#DDE3EA';
    c.beginPath(); c.ellipse(dx, y, w + 2, 7, 0, 0, Math.PI * 2); c.fillStyle = INK; c.fill();
    c.beginPath(); c.ellipse(dx, y, w, 5.5, 0, 0, Math.PI * 2); c.fillStyle = dk(base, 0.18); c.fill();
    c.beginPath(); c.ellipse(dx, y - 1, w - 1, 3.6, 0, 0, Math.PI * 2); c.fillStyle = base; c.fill();
    c.fillStyle = '#FFFFFF'; c.fillRect(Math.round(dx - w * 0.6), Math.round(y - 4), Math.round(w * 0.5), 1);
    for (let j = 0; j < w * 2; j += 2) c.fillRect(Math.round(dx - w + j), Math.round(y + 2), 1, 1);
    // (bits of him going round: the suit, an arm, the tie, a pen)
    const a = f * 0.8 + k * 1.3, bx = dx + Math.cos(a) * w * 0.8;
    c.fillStyle = INK; c.fillRect(Math.round(bx) - 3, Math.round(y - 3), 7, 6);
    c.fillStyle = [S, L.skin, '#DC2626'][k % 3]; c.fillRect(Math.round(bx) - 2, Math.round(y - 2), 5, 4);
  }
  // (press releases whirled up round it, the speed lines off it)
  for (let k = 0; k < 4; k++) { const a = f * 0.35 + k * 1.57, r = 26 + (k % 2) * 6, sx = Math.cos(a) * r, sy = -40 + Math.sin(a) * 30; c.fillStyle = INK; c.fillRect(Math.round(sx) - 4, Math.round(sy) - 3, 9, 7); c.fillStyle = '#F8F8F0'; c.fillRect(Math.round(sx) - 3, Math.round(sy) - 2, 7, 5); c.fillStyle = '#6A6A7A'; c.fillRect(Math.round(sx) - 2, Math.round(sy) - 1, 5, 1); c.fillRect(Math.round(sx) - 2, Math.round(sy) + 1, 4, 1); }
  c.lineCap = 'round';
  for (let k = 0; k < 3; k++) { const y = -18 - k * 20, o = f % 6; c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-30 - o, y); c.lineTo(-46 - o, y); c.stroke(); c.strokeStyle = '#FFFFFF'; c.lineWidth = 1; c.stroke(); }
  c.lineCap = 'butt';
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
  part(g, () => g.roundRect(-10, -7, 20, 14, 2.5), '#C0C6CF', -10, -7, 20, 14, 1);
  // (the speaker's grille: holes in rows; the dial's window, its needle; the tuning knob; the brand)
  px(g, -8, -5, 9, 9, '#3A4250'); for (let k = 0; k < 3; k++) for (let j = 0; j < 3; j++) px(g, -7 + j * 3, -4 + k * 3, 1.4, 1.4, '#8A94A4');
  px(g, 2, -5, 6, 3, '#FDE68A'); px(g, 4 + (up ? 2 : 0), -5, 1, 3, '#DC2626');
  ball(g, 5, 2, 2.4, '#1F2937', 0.8); px(g, 4.5, 0.5, 1, 2, '#FDE047');
  px(g, -10, 6, 20, 1, '#8A94A4'); px(g, -9, -6, 8, 1, '#E8ECF2');
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
  // (DITTOS across the T-shirt: a red band, the letters knocked out in white, a gold mic under; the ringer collar; the
  // khakis' belt and its buckle)
  px(g, -9, B.shY + 7, 19, 6, '#B91C1C'); px(g, -9, B.shY + 7, 19, 1, '#EF4444');
  for (let k = 0; k < 6; k++) { px(g, -8 + k * 3, B.shY + 8, 2, 4, '#FFFFFF'); if (k % 2) px(g, -8 + k * 3, B.shY + 9, 1, 2, '#B91C1C'); }
  px(g, 0, B.shY + 15, 2, 3, '#F2C84A'); px(g, -0.5, B.shY + 14, 3, 2, '#F2C84A'); px(g, 0, B.shY + 14, 1, 1, '#FFF0A8');
  px(g, -4, B.shY - 1, 9, 2, '#B91C1C');
  px(g, -B.w / 2 + 2, B.hipY - 2, B.w - 4, 2, '#5A4A2A'); px(g, -2, B.hipY - 2.5, 4, 3, '#D8B040'); px(g, -1, B.hipY - 2, 1, 1, '#FFF0A8');
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
  // (a faint glow ahead of it; three arcs, each inked and stepped (a lit inner edge); notes and static thrown off it)
  c.fillStyle = 'rgba(253,224,71,0.18)'; c.beginPath(); c.ellipse(8, 0, 26, 20, 0, -1.2, 1.2); c.fill();
  c.lineCap = 'round';
  for (let k = 0; k < 3; k++) {
    const r = 10 + k * 7 + Math.sin(t * 0.5 + k) * 1.5, col = ['#FDE047', '#FB923C', '#EF4444'][k];
    c.strokeStyle = INK; c.lineWidth = 6.5; c.beginPath(); c.arc(-k * 6, 0, r, -0.9, 0.9); c.stroke();
    c.strokeStyle = dk(col, 0.2); c.lineWidth = 3.6; c.stroke();
    c.strokeStyle = col; c.lineWidth = 2.2; c.beginPath(); c.arc(-k * 6, 0, r - 0.6, -0.85, 0.85); c.stroke();
    c.strokeStyle = lt(col, 0.6); c.lineWidth = 1; c.beginPath(); c.arc(-k * 6, -0.5, r - 1, -0.8, -0.2); c.stroke();
  }
  c.lineCap = 'butt';
  for (let k = 0; k < 2; k++) { const nx = -14 - k * 10 - (t % 10), ny = -14 - k * 6 + Math.sin(t * 0.3 + k) * 3; c.fillStyle = INK; c.fillRect(Math.round(nx), Math.round(ny), 4, 3); c.fillRect(Math.round(nx) + 3, Math.round(ny) - 7, 1.4, 8); c.fillStyle = k ? '#FDE047' : '#F87171'; c.fillRect(Math.round(nx) + 0.5, Math.round(ny) + 0.5, 3, 2); }
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
