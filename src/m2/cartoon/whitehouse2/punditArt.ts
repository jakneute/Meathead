// The pundits, part two, drawn the show's way at the land bosses' grade (Stupid Dad's, Piper's, part one's Perot and
// Falwell: every material its own ramp, lit, itself, shade, deep, in stepped bands with dithered seams; over it the
// show's fat black outline, because it's a Saturday morning cartoon): big caricature heads on little bodies, played
// straight. Feet at the origin, facing right (in the fight the engine turns them round; the scene's and the reel's drawn
// in the world, turned here).
//
//   LIMBAUGH  a big round man in a navy double-breasted suit straining at its button, a loud paisley tie, gold
//             cufflinks, a pocket square; a round face with jowls and a double chin, slicked-back dark hair with a
//             shine, little eyes, a cigar in his teeth (smoke curling), studio headphones round his neck (their cord),
//             the golden EIB microphone in his fist (held up to his mouth: the mic's tell, ON AIR; the cigar puffed, a
//             smoke ring: the cigar's); winded after a heavy landing, sat on the floor, belly heaving, sweating
//   DOLE      a tall lean man in a gray suit (its crease, a flag pin, the red tie with its dots), a long face, a strong
//             chin with its cleft, the wry lopsided grin, gray hair combed flat, dark heavy brows; his right hand always
//             at his side closed round his pen; his left lobbing pineapples and flinging BOB DOLE buttons (held up first:
//             the tell); the pratfall flat on his face
//   NEWT      a stout man in a navy suit, a red tie, a big round face, round cheeks gone pink, little eyes, a puffy
//             helmet of white hair in curls; the rolled Contract with America under one arm (a red ribbon), the
//             Speaker's gavel in the other hand (banged on his palm, or the Contract held up: the tell); the tantrum on
//             his back, kicking, crying
// Reeling (his last words): spinning, stars round his head. The bits his costume's flung off in out of his puff, and
// what he throws.

import type { Ctx } from '../kit';
import { INK, mix } from '../kit';
import type { Pundit, PunditId, PunditThrow } from './state';
import type { PuffBit } from '../whitehouse1/state';
import { star } from '../whitehouse1/poof';
import { drawPuffBit as drawPuffBit1, toonPart as part, toonTop as partTop, toonFlat as flat, toonLimb as limb, toonRamp as rp, type Rp } from '../whitehouse1/punditArt';
import { dith } from '../amphi/paint';
import { signText } from '../../signLetters';

export interface SimView { x: number; y: number; vx: number; vy: number; air: boolean; facing: 1 | -1; kind: PunditThrow['kind'] | null }

const px = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const SKIN_L: Rp = ['#FFE0CC', '#F6C3AA', '#E0A088', '#C07A62'];
const SKIN_D: Rp = ['#FFE4CE', '#F2C4A4', '#D8A080', '#B47C60'];
const SKIN_N: Rp = ['#FFE2D6', '#F5BFA5', '#E09A84', '#BC765E'];
const NAVY_L: Rp = ['#4A5874', '#26324A', '#1A2438', '#10182A'];
const GRAY_D: Rp = rp('#7A808C');
const NAVY_N: Rp = ['#4A64B4', '#22408E', '#182E6A', '#0E1E4A'];
const SHIRT: Rp = ['#FFFFFF', '#F2F2F8', '#D6D6E4', '#ACACC2'];
const SHOE: Rp = ['#4A4E5E', '#22242E', '#16171E', '#0C0C12'];
const GOLD: Rp = ['#FFF0A8', '#F2C84A', '#C8961E', '#8A6410'];
const HAIR_L: Rp = ['#7C5A44', '#3F2A1E', '#2A1A12', '#1A100A'];
const HAIR_D: Rp = ['#F2F4F8', '#D1D5DB', '#A8AEB8', '#7E8490'];
const HAIR_N: Rp = ['#FFFFFF', '#F1F5F9', '#CBD5E1', '#94A3B8'];
const TIE_L: Rp = rp('#F59E0B');
const RED: Rp = rp('#C81E2E');
const PAPER: Rp = ['#FFFBEB', '#FEF3C7', '#E7D7A8', '#B8A478'];
const WOOD: Rp = ['#C27A3E', '#92400E', '#6E2E0A', '#4A1E06'];

const hand = (c: Ctx, x: number, y: number, r = 3.8, skin: Rp = SKIN_L) => { part(c, () => c.arc(x, y, r, 0, Math.PI * 2), skin, x - r, x + r, 1.8); px(c, x - r * 0.5, y - r * 0.6, 1.5, 1.5, skin[0]); };
const shoe = (c: Ctx, x: number, y: number, w = 12) => { partTop(c, () => c.roundRect(x - 3, y - 6, w, 6, [2, 3, 1, 1]), SHOE, y - 6, y, 1.8); px(c, x - 1, y - 5, 4, 1, '#8A8EA0'); };

type Pose = 'stand' | 'talk' | 'tell' | 'throw' | 'air' | 'reel' | 'flop';
const poseOf = (q: Pundit, s: SimView, reel: number): Pose => {
  if (reel > 0) return 'reel';
  if (q.act === 'flop') return 'flop';
  if (s.air) return 'air';
  if (q.act === 'wind' || q.act === 'second') return 'tell';
  if (q.act === 'after' && q.actT < 12) return 'throw';
  if (q.said) return 'talk';
  return 'stand';
};
const mouthOpen = (pose: Pose, f: number) => (pose === 'talk' ? [3, 7, 4, 8][(f >> 2) % 4] : pose === 'tell' || pose === 'throw' ? 6 : pose === 'reel' || pose === 'flop' ? 8 : 0);
const xEyes = (c: Ctx, x: number, y: number) => { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 3, y - 3); c.lineTo(x + 3, y + 3); c.moveTo(x + 3, y - 3); c.lineTo(x - 3, y + 3); c.stroke(); };
const eye = (c: Ctx, x: number, y: number, r = 3.2) => { flat(c, () => c.ellipse(x, y, r, r + 0.6, 0, 0, Math.PI * 2), '#FFFFFF', 1.6); px(c, x - r + 1, y + 1, r * 2 - 2, 1, '#D6D6E4'); c.fillStyle = INK; c.beginPath(); c.arc(x + 1, y, 1.6, 0, Math.PI * 2); c.fill(); px(c, x + 1, y - 1.5, 1, 1, '#FFFFFF'); };
const reelStars = (c: Ctx, f: number, y: number) => { for (let i = 0; i < 4; i++) { const a = f * 0.22 + (i / 4) * Math.PI * 2; star(c, Math.cos(a) * 30, y + Math.sin(a) * 6, 5, i % 2 ? '#FDE047' : '#FFFFFF'); } };
const sweat = (c: Ctx, x: number, y: number) => { flat(c, () => { c.moveTo(x, y - 4); c.quadraticCurveTo(x + 3, y + 1, x, y + 3); c.quadraticCurveTo(x - 3, y + 1, x, y - 4); c.closePath(); }, '#93C5FD', 1); px(c, x - 1, y - 1, 1, 2, '#FFFFFF'); };

// ---------------------------------------------------------------------------------------------------------------
// What they hold and throw

export const cigar = (c: Ctx, x: number, y: number, a: number, lit = true) => {
  c.save(); c.translate(x, y); c.rotate(a);
  partTop(c, () => c.roundRect(-10, -3, 20, 6, 3), ['#B07A44', '#7C4A1E', '#5A3212', '#3A200A'], -3, 3, 1.6);
  px(c, -5, -3, 4, 6, '#C8961E'); px(c, -4, -2, 2, 4, '#DC2626'); px(c, -5, -3, 4, 1, '#FFF0A8');
  if (lit) { px(c, 8, -2.5, 3, 5, '#9A9AA4'); px(c, 10, -2, 1.5, 4, '#F97316'); px(c, 10.5, -1, 1, 2, '#FDE047'); }
  c.restore();
};
export const goldMic = (c: Ctx, x: number, y: number, a: number) => {
  c.save(); c.translate(x, y); c.rotate(a);
  part(c, () => c.roundRect(-3, 0, 6, 17, 2), GOLD, -3, 3, 1.6);
  part(c, () => c.ellipse(0, -4, 7, 8.5, 0, 0, Math.PI * 2), GOLD, -7, 7, 2);
  c.save(); c.beginPath(); c.ellipse(0, -4, 6, 7.5, 0, 0, Math.PI * 2); c.clip();
  c.fillStyle = dith(c, GOLD[3]); c.fillRect(-7, -12, 14, 16);
  c.restore();
  c.strokeStyle = GOLD[3]; c.lineWidth = 0.8; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(-6, -4 + k * 2.6); c.lineTo(6, -4 + k * 2.6); c.stroke(); }
  px(c, -4, -10, 2, 3, '#FFFFFF');
  // (the EIB flag on it)
  part(c, () => c.rect(-7, 5, 14, 7), ['#5A84D8', '#1D4ED8', '#163CA8', '#0E2A78'], -7, 7, 1.2);
  signText(c, 'EIB', 0, 11, { sx: 1, sy: 1, fill: ['#FDE047', '#F59E0B'] });
  c.restore();
};
export const pineapple = (c: Ctx, x: number, y: number, a: number, s = 1) => {
  c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
  for (const [dx, h, r] of [[-5, 12, -0.5], [-2, 15, -0.2], [2, 16, 0.15], [5, 12, 0.5]] as [number, number, number][]) part(c, () => { c.moveTo(dx - 2, -8); c.lineTo(dx + Math.sin(r) * h, -8 - h); c.lineTo(dx + 2, -8); c.closePath(); }, ['#6CCC6A', '#22A040', '#16702E', '#0E4A1E'], dx - 3, dx + 3, 1.2);
  part(c, () => c.ellipse(0, 2, 8.5, 11.5, 0, 0, Math.PI * 2), ['#FCD34D', '#F59E0B', '#C2780A', '#8A4E06'], -9, 9, 2);
  c.save(); c.beginPath(); c.ellipse(0, 2, 8, 11, 0, 0, Math.PI * 2); c.clip();
  c.strokeStyle = '#8A4E06'; c.lineWidth = 1;
  for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(-7 + k * 3.4, -8); c.lineTo(k * 3.4 + 6, 12); c.stroke(); c.beginPath(); c.moveTo(7 + k * 3.4, -8); c.lineTo(k * 3.4 - 6, 12); c.stroke(); }
  for (let k = -2; k <= 2; k++) for (let j = -2; j <= 2; j++) px(c, k * 3.4 - 0.5 + (j % 2) * 1.7, 2 + j * 3.4, 1, 1, '#FFF0A8');
  c.restore();
  c.restore();
};
export const campaignButton = (c: Ctx, x: number, y: number, squash: number) => {
  c.save(); c.translate(x, y); c.scale(1, squash);
  part(c, () => c.arc(0, 0, 10, 0, Math.PI * 2), SHIRT, -10, 10, 2);
  c.fillStyle = '#1D4ED8'; c.beginPath(); c.arc(0, 0, 8.5, Math.PI, 0); c.fill();
  c.fillStyle = '#163CA8'; c.fillRect(2, -8, 7, 8);
  c.fillStyle = '#C81E2E'; c.fillRect(-8, 1, 16, 2); c.fillRect(-7, 5, 14, 2);
  for (const sx of [-5, 0, 5]) { c.fillStyle = '#FFFFFF'; c.fillRect(sx - 0.5, -6.5, 1.5, 1.5); }
  signText(c, 'DOLE', 0, -1, { sx: 1, sy: 1, fill: ['#FFFFFF'] });
  px(c, -7, -6, 2, 1, 'rgba(255,255,255,0.8)');
  c.restore();
};
export const contract = (c: Ctx, x: number, y: number, a: number, open = 0) => {
  c.save(); c.translate(x, y); c.rotate(a);
  if (open > 0) {
    // (unrolled: CONTRACT WITH AMERICA, its lines, the seal)
    partTop(c, () => c.rect(-13, -17 * open, 26, 34 * open), PAPER, -17 * open, 17 * open, 1.8);
    if (open > 0.6) { signText(c, 'CONTRACT', 0, -11 * open, { sx: 1, sy: 1, fill: ['#991B1B'] }); }
    c.fillStyle = '#92400E'; for (let k = 1; k < 6; k++) c.fillRect(-9, -13 * open + k * 4.5 * open, 18 - (k % 2) * 5, 1);
    part(c, () => c.arc(6, 12 * open, 3.6, 0, Math.PI * 2), RED, 2.4, 9.6, 1.2);
  }
  partTop(c, () => c.roundRect(-14, -4.5, 28, 9, 4.5), PAPER, -4.5, 4.5, 1.8);
  for (const sx of [-14, 14]) { c.fillStyle = PAPER[2]; c.beginPath(); c.ellipse(sx, 0, 2.5, 4, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke(); }
  part(c, () => c.rect(-2.5, -5.5, 5, 11), RED, -2.5, 2.5, 1);
  c.restore();
};
export const gavel = (c: Ctx, x: number, y: number, a: number) => {
  c.save(); c.translate(x, y); c.rotate(a);
  limb(c, 0, 0, 0, 18, 3.6, WOOD, 3);
  part(c, () => c.roundRect(-10, -6.5, 20, 10, 2.5), WOOD, -10, 10, 1.8);
  for (const sx of [-8, 6]) { px(c, sx, -6.5, 2, 10, '#E2B33C'); px(c, sx, -6.5, 1, 10, '#FFF0A8'); }
  px(c, -6, -5, 10, 1, '#C27A3E');
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Limbaugh

const limbaughHead = (c: Ctx, hx: number, hy: number, pose: Pose, f: number) => {
  const open = mouthOpen(pose, f);
  for (const s of [-1, 1]) part(c, () => c.ellipse(hx + s * 18, hy + 2, 4, 6, 0, 0, Math.PI * 2), SKIN_L, hx + s * 18 - 4, hx + s * 18 + 4, 1.8);
  // (a big round face, jowls, a double chin; stepped, the chin's fold dithered)
  const face = () => { c.moveTo(hx - 18, hy - 6); c.quadraticCurveTo(hx - 18, hy - 22, hx, hy - 22); c.quadraticCurveTo(hx + 19, hy - 22, hx + 18, hy - 6); c.quadraticCurveTo(hx + 23, hy + 18, hx + 4, hy + 23); c.quadraticCurveTo(hx - 14, hy + 24, hx - 19, hy + 10); c.closePath(); };
  part(c, face, SKIN_L, hx - 19, hx + 23, 2.6);
  c.save(); c.beginPath(); face(); c.clip();
  c.fillStyle = dith(c, SKIN_L[2]); c.fillRect(hx - 16, hy + 12, 36, 3);
  c.fillStyle = SKIN_L[2]; c.fillRect(hx - 16, hy + 17, 40, 8);
  c.fillStyle = '#F2A8A0'; c.globalAlpha = 0.55; c.beginPath(); c.ellipse(hx + 11, hy + 7, 4.5, 2.6, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.ellipse(hx - 8, hy + 7, 3.5, 2.2, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  c.restore();
  c.strokeStyle = SKIN_L[3]; c.lineWidth = 1.4; c.beginPath(); c.moveTo(hx - 12, hy + 15); c.quadraticCurveTo(hx + 2, hy + 21, hx + 15, hy + 14); c.stroke();
  // (slicked-back dark hair, the comb lines, a shine)
  const hair = () => { c.moveTo(hx - 18, hy - 4); c.quadraticCurveTo(hx - 21, hy - 27, hx + 2, hy - 27); c.quadraticCurveTo(hx + 19, hy - 27, hx + 17, hy - 12); c.quadraticCurveTo(hx + 4, hy - 19, hx - 10, hy - 14); c.closePath(); };
  partTop(c, hair, HAIR_L, hy - 27, hy - 6, 2);
  c.strokeStyle = HAIR_L[3]; c.lineWidth = 1; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(hx - 14 + k * 7, hy - 22); c.quadraticCurveTo(hx - 6 + k * 7, hy - 26, hx + 2 + k * 6, hy - 20); c.stroke(); }
  px(c, hx - 6, hy - 25, 12, 1.5, '#A88A70');
  if (pose === 'reel' || pose === 'flop') { xEyes(c, hx - 5, hy - 4); xEyes(c, hx + 8, hy - 4); }
  else { eye(c, hx - 5, hy - 4); eye(c, hx + 8, hy - 4); flat(c, () => c.roundRect(hx - 10, hy - 12, 9, 2.6, 1), HAIR_L[2], 0.6); flat(c, () => c.roundRect(hx + 4, hy - 13, 9, 2.6, 1), HAIR_L[2], 0.6); }
  part(c, () => c.ellipse(hx + 10, hy + 3, 5.2, 4.2, 0.2, 0, Math.PI * 2), ['#FFD2C0', '#EDA88E', '#D88A72', '#B86A58'], hx + 5, hx + 15, 1.8);
  px(c, hx + 8, hy + 1, 2, 1, '#FFFFFF');
  if (open) { flat(c, () => c.ellipse(hx + 4, hy + 12, 8, open / 2 + 1.5, 0, 0, Math.PI * 2), '#5A0E14', 1.8); px(c, hx - 2, hy + 10, 12, 1.6, '#FFFFFF'); px(c, hx, hy + 12 + open / 2, 7, 1.4, '#C8344A'); }
  else { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(hx + 4, hy + 8, 6, 0.25, Math.PI - 0.25); c.stroke(); }
};
const headphones = (c: Ctx, cx: number, cy: number) => {
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, 12, 0.2, Math.PI - 0.2); c.stroke();
  c.strokeStyle = '#5A5866'; c.lineWidth = 2; c.stroke();
  for (const sx of [-15, 9]) part(c, () => c.roundRect(cx + sx, cy - 2, 8, 10, 2.5), ['#5A5866', '#2A2830', '#1A1820', '#0C0B10'], cx + sx, cx + sx + 8, 1.4);
  c.strokeStyle = '#1A1820'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(cx + 13, cy + 8); c.quadraticCurveTo(cx + 18, cy + 30, cx + 8, cy + 42); c.stroke();
};
const paintLimbaugh = (c: Ctx, q: Pundit, s: SimView, f: number, reel: number) => {
  const pose = poseOf(q, s, reel), micTell = pose === 'tell' && s.kind === 'mic';
  if (pose === 'flop') {
    // (winded: sat on the floor, legs out, belly heaving, sweating, the mic dropped)
    const heave = Math.sin(f * 0.3) * 2;
    for (const lx of [10, 24]) { limb(c, 0, -14, lx + 8, -5, 11, NAVY_L, 10); shoe(c, lx + 8, 0, 11); }
    partTop(c, () => c.ellipse(-2, -30 - heave * 0.3, 26 + heave, 22, 0, 0, Math.PI * 2), NAVY_L, -52, -8, 2.6);
    flat(c, () => { c.moveTo(-5, -50); c.lineTo(6, -50); c.lineTo(0.5, -36); c.closePath(); }, SHIRT[1], 1.2);
    part(c, () => { c.moveTo(-2.5, -50); c.lineTo(3.5, -50); c.lineTo(5, -26); c.lineTo(0.5, -21); c.lineTo(-4, -26); c.closePath(); }, TIE_L, -4, 5, 1.2);
    limbaughHead(c, 0, -66, 'flop', f);
    for (const [dx, dy] of [[-20, -80], [22, -76], [-24, -66]]) sweat(c, dx, dy + ((f >> 3) % 4));
    goldMic(c, -32, -6, 1.4);
    return;
  }
  // (legs: navy trouser legs, the break over the shoe, black shoes)
  const lA = pose === 'air' ? [-8, -10] : [-9, 0], lB = pose === 'air' ? [10, -14] : [10, 0];
  for (const [lx, ly] of [lA, lB]) { limb(c, lx * 0.5, -32, lx, ly - 4, 11, NAVY_L, 10); shoe(c, lx, ly, 14); }
  // (the far arm: the cigar hand, a finger up talking)
  const far: [number, number] = pose === 'air' ? [-26, -72] : pose === 'tell' && !micTell ? [8, -84] : [-20, -46];
  limb(c, -10, -70, far[0], far[1], 10, [NAVY_L[1], NAVY_L[2], NAVY_L[3], '#080C18'], 8.5);
  px(c, far[0] - 3, far[1] - 5, 6, 2, SHIRT[1]); px(c, far[0] - 1, far[1] - 5, 2, 2, GOLD[1]);
  hand(c, far[0], far[1], 4.6);
  // (the body: a big round navy double-breasted suit straining at its button, the lapels, the pocket square, the shirt,
  // the loud paisley tie; the belly's shade dithered under)
  const body = () => { c.moveTo(-18, -30); c.quadraticCurveTo(-29, -54, -16, -76); c.quadraticCurveTo(0, -82, 16, -76); c.quadraticCurveTo(31, -52, 18, -30); c.closePath(); };
  part(c, body, NAVY_L, -29, 31, 2.6);
  c.fillStyle = dith(c, NAVY_L[3]); c.beginPath(); c.ellipse(2, -38, 20, 6, 0, 0, Math.PI); c.fill();
  flat(c, () => { c.moveTo(-6, -79); c.lineTo(7, -79); c.lineTo(0.5, -58); c.closePath(); }, SHIRT[1], 1.4);
  part(c, () => { c.moveTo(-2.5, -77); c.lineTo(3.5, -77); c.lineTo(5.5, -50); c.lineTo(0.5, -44); c.lineTo(-4.5, -50); c.closePath(); }, TIE_L, -4.5, 5.5, 1.2);
  for (const [dx, dy, col] of [[0, -70, '#DC2626'], [2, -63, '#7C3AED'], [-1, -57, '#DC2626'], [2, -51, '#16A34A']] as [number, number, string][]) { px(c, dx - 1, dy - 1, 3, 2, col); px(c, dx + 1, dy, 1, 2, col); }
  flat(c, () => { c.moveTo(-6, -79); c.lineTo(-13, -70); c.lineTo(-3, -56); c.closePath(); }, NAVY_L[0], 1);
  flat(c, () => { c.moveTo(7, -79); c.lineTo(14, -70); c.lineTo(4, -56); c.closePath(); }, NAVY_L[2], 1);
  for (const [bx, by] of [[-7, -48], [9, -48], [-7, -40], [9, -40]] as [number, number][]) flat(c, () => c.arc(bx, by, 1.4, 0, Math.PI * 2), GOLD[2], 0.6);
  c.strokeStyle = NAVY_L[0]; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-4, -44); c.lineTo(-10, -40); c.moveTo(6, -44); c.lineTo(12, -40); c.stroke();
  flat(c, () => { c.moveTo(-14, -66); c.lineTo(-9, -70); c.lineTo(-8, -65); c.closePath(); }, '#F59E0B', 0.8);
  headphones(c, 1, -80);
  limbaughHead(c, 2, -94, pose, f);
  // (the cigar in his teeth, smoke curling; puffed in the cigar's tell: a smoke ring)
  if (pose !== 'reel' && !micTell) {
    cigar(c, 20, -85, 0.15);
    for (let k = 0; k < 3; k++) { const t = ((f + k * 14) % 42) / 42, x = 31 + Math.sin(t * 6 + k) * 4, y = -88 - t * 30; c.strokeStyle = INK; c.lineWidth = 2.6; c.beginPath(); c.arc(x, y, 1.5 + t * 3, 0, Math.PI * 2); c.stroke(); c.strokeStyle = '#E5E7EB'; c.lineWidth = 1.4; c.stroke(); }
    if (pose === 'tell') { const t = (f % 30) / 30; c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.ellipse(34 + t * 16, -92 - t * 10, 4 + t * 6, 3 + t * 4, 0, 0, Math.PI * 2); c.stroke(); c.strokeStyle = '#F3F4F6'; c.lineWidth = 2.4; c.stroke(); }
  }
  // (the near arm: the golden mic; up at his mouth in the mic's tell, flung in the throw, wagged talking)
  const near: [number, number] = micTell ? [20, -92] : pose === 'throw' ? [32, -70] : pose === 'talk' ? [24, -60 + ((f >> 3) % 2) * 3] : pose === 'air' ? [26, -76] : [20, -46];
  limb(c, 10, -70, near[0], near[1], 10, NAVY_L, 8.5);
  px(c, near[0] - 3, near[1] - 5, 6, 2, SHIRT[1]); px(c, near[0] - 1, near[1] - 5, 2, 2, GOLD[1]);
  hand(c, near[0], near[1], 4.6);
  if (!q.throws.some(t => t.kind === 'mic') && (pose !== 'throw' || s.kind !== 'mic')) goldMic(c, near[0] + 2, near[1] - 12, micTell ? -0.3 : 0.1);
  if (micTell && f % 10 < 6) {
    flat(c, () => c.roundRect(-24, -136, 48, 14, 3), '#DC2626', 2);
    px(c, -22, -134, 44, 3, '#F87171');
    signText(c, 'ON AIR', 0, -125, { sx: 1, sy: 1, bold: true, fill: ['#FFFFFF', '#FEE2E2'] });
  }
  if (pose === 'reel') reelStars(c, f, -128);
};

// ---------------------------------------------------------------------------------------------------------------
// Dole

const doleHead = (c: Ctx, hx: number, hy: number, pose: Pose, f: number) => {
  const open = mouthOpen(pose, f);
  for (const s of [-1, 1]) part(c, () => c.ellipse(hx + s * 14, hy, 3.6, 5.6, 0, 0, Math.PI * 2), SKIN_D, hx + s * 14 - 4, hx + s * 14 + 4, 1.6);
  // (the long face, the strong chin with its cleft, the cheekbones; stepped)
  const face = () => { c.moveTo(hx - 13, hy - 8); c.quadraticCurveTo(hx - 14, hy - 22, hx, hy - 22); c.quadraticCurveTo(hx + 14, hy - 22, hx + 14, hy - 6); c.quadraticCurveTo(hx + 16, hy + 14, hx + 8, hy + 23); c.quadraticCurveTo(hx - 2, hy + 27, hx - 10, hy + 16); c.closePath(); };
  part(c, face, SKIN_D, hx - 14, hx + 16, 2.6);
  c.save(); c.beginPath(); face(); c.clip();
  c.fillStyle = dith(c, SKIN_D[2]); c.fillRect(hx + 6, hy - 2, 6, 12);
  c.fillStyle = SKIN_D[2]; c.fillRect(hx - 12, hy + 18, 30, 10);
  c.restore();
  c.strokeStyle = SKIN_D[3]; c.lineWidth = 1.2; c.beginPath(); c.moveTo(hx + 4, hy + 20); c.lineTo(hx + 5, hy + 24); c.stroke();
  c.beginPath(); c.moveTo(hx - 6, hy + 4); c.quadraticCurveTo(hx - 8, hy + 12, hx - 4, hy + 16); c.stroke();
  // (gray hair combed flat: stepped, the comb lines, a part)
  const hair = () => { c.moveTo(hx - 14, hy - 8); c.quadraticCurveTo(hx - 15, hy - 25, hx + 2, hy - 25); c.quadraticCurveTo(hx + 16, hy - 25, hx + 15, hy - 10); c.lineTo(hx + 8, hy - 16); c.quadraticCurveTo(hx - 2, hy - 18, hx - 14, hy - 8); c.closePath(); };
  partTop(c, hair, HAIR_D, hy - 25, hy - 8, 2);
  c.strokeStyle = HAIR_D[3]; c.lineWidth = 1; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(hx - 10 + k * 5, hy - 22); c.lineTo(hx - 5 + k * 6, hy - 16); c.stroke(); }
  px(c, hx - 8, hy - 24, 1, 6, HAIR_D[3]);
  // (the heavy dark brows, the eyes, the long nose)
  flat(c, () => c.roundRect(hx - 10, hy - 12, 10, 3.4, 1.4), '#2A2A36', 0.6); flat(c, () => c.roundRect(hx + 3, hy - 13, 10, 3.4, 1.4), '#2A2A36', 0.6);
  if (pose === 'reel') { xEyes(c, hx - 4, hy - 4); xEyes(c, hx + 8, hy - 4); } else { eye(c, hx - 4, hy - 4, 2.8); eye(c, hx + 8, hy - 4, 2.8); }
  part(c, () => { c.moveTo(hx + 9, hy - 5); c.lineTo(hx + 17, hy + 6); c.lineTo(hx + 10, hy + 8); c.closePath(); }, ['#FFD2C0', '#EDA88E', '#D88A72', '#B86A58'], hx + 9, hx + 17, 1.8);
  // (the wry lopsided grin, or the mouth open)
  if (open) { flat(c, () => c.roundRect(hx - 3, hy + 10, 14, open / 2 + 3, 3), '#5A0E14', 1.6); px(c, hx - 1, hy + 11, 10, 1.5, '#FFFFFF'); }
  else { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(hx - 2, hy + 12); c.quadraticCurveTo(hx + 5, hy + 14, hx + 11, hy + 9); c.stroke(); px(c, hx + 9, hy + 9, 3, 1, SKIN_D[3]); }
};
const paintDole = (c: Ctx, q: Pundit, s: SimView, f: number, reel: number) => {
  const pose = poseOf(q, s, reel);
  if (pose === 'flop') {
    // (the pratfall: flat on his face, the pen still in his right hand, stars)
    c.save(); c.translate(-30, -6);
    for (const lx of [0, 10]) limb(c, -16, lx * 0.2, -40 + lx, -2 + lx * 0.3, 8, GRAY_D, 7);
    shoe(c, -46, 2, 10); shoe(c, -36, 4, 10);
    partTop(c, () => c.roundRect(-20, -14, 44, 18, 8), GRAY_D, -14, 4, 2.4);
    limb(c, 16, -8, 36, 2, 7, GRAY_D, 6); hand(c, 36, 2, 3.8, SKIN_D);
    c.strokeStyle = INK; c.lineWidth = 3.4; c.beginPath(); c.moveTo(36, 2); c.lineTo(45, 0); c.stroke(); c.strokeStyle = '#1F2937'; c.lineWidth = 1.8; c.stroke(); px(c, 42, -1, 2, 2, GOLD[1]);
    part(c, () => c.ellipse(36, -14, 13, 11, 0.3, 0, Math.PI * 2), SKIN_D, 23, 49, 2.2);
    partTop(c, () => c.ellipse(32, -20, 12, 6, 0.3, Math.PI, 0), HAIR_D, -26, -18, 1.6);
    c.restore();
    reelStars(c, f, -40);
    return;
  }
  // (legs: long gray trouser legs, the crease lit, black shoes)
  const lA = pose === 'air' ? [-7, -10] : [-6, 0], lB = pose === 'air' ? [9, -16] : [7, 0];
  for (const [lx, ly] of [lA, lB]) { limb(c, lx * 0.4, -38, lx, ly - 4, 8, GRAY_D, 7); px(c, lx * 0.7 - 0.5, -34, 1, 26 + ly * 0.5, GRAY_D[0]); shoe(c, lx, ly, 12); }
  // (the far arm: his right, always at his side, the fist closed round his pen)
  limb(c, -8, -74, -12, -50, 7, [GRAY_D[1], GRAY_D[2], GRAY_D[3], mix(GRAY_D[3], INK, 0.3)], 6);
  px(c, -15, -54, 6, 2, SHIRT[1]);
  hand(c, -12, -48, 4, SKIN_D);
  c.strokeStyle = INK; c.lineWidth = 3.6; c.beginPath(); c.moveTo(-14, -51); c.lineTo(-9, -39); c.stroke(); c.strokeStyle = '#1F2937'; c.lineWidth = 2; c.stroke(); px(c, -13, -51, 2, 2, GOLD[1]);
  if (pose === 'tell' && f % 10 < 5) px(c, -11, -42, 2, 2, '#FFFFFF');
  // (the body: a tall gray suit in steps, the shirt, the red tie (its dots), the lapels, a flag pin)
  part(c, () => { c.moveTo(-12, -36); c.lineTo(-14, -78); c.quadraticCurveTo(0, -84, 14, -78); c.lineTo(12, -36); c.closePath(); }, GRAY_D, -14, 14, 2.4);
  flat(c, () => { c.moveTo(-4, -80); c.lineTo(5, -80); c.lineTo(0.5, -62); c.closePath(); }, SHIRT[1], 1.4);
  part(c, () => { c.moveTo(-1.5, -78); c.lineTo(2.5, -78); c.lineTo(3.5, -58); c.lineTo(0.5, -54); c.lineTo(-2.5, -58); c.closePath(); }, RED, -2.5, 3.5, 1.2);
  for (let k = 0; k < 4; k++) px(c, -1 + (k % 2) * 2, -74 + k * 5, 1, 1, '#FFFFFF');
  flat(c, () => { c.moveTo(-4, -80); c.lineTo(-9, -72); c.lineTo(-2, -60); c.closePath(); }, GRAY_D[0], 1);
  flat(c, () => { c.moveTo(5, -80); c.lineTo(10, -72); c.lineTo(3, -60); c.closePath(); }, GRAY_D[2], 1);
  px(c, -11, -72, 5, 3, '#1D4ED8'); px(c, -11, -69, 5, 1, '#DC2626'); px(c, -11, -70, 5, 1, '#FFFFFF'); px(c, -11, -72, 2, 1, '#FFFFFF');
  for (const by of [-52, -44]) flat(c, () => c.arc(1, by, 1.2, 0, Math.PI * 2), '#2A2A36', 0.6);
  px(c, -12, -40, 24, 2, GRAY_D[3]);
  doleHead(c, 2, -98, pose, f);
  // (the near arm, his left: the pineapple / the button up in the tell, flung in the throw, a thumb up talking)
  const near: [number, number] = pose === 'tell' ? [16, -112] : pose === 'throw' ? [30, -72] : pose === 'talk' ? [20, -76] : pose === 'air' ? [26, -80] : [16, -48];
  limb(c, 8, -74, near[0], near[1], 7, GRAY_D, 6);
  px(c, near[0] - 3, near[1] - 5, 6, 2, SHIRT[1]);
  hand(c, near[0], near[1], 4, SKIN_D);
  if (pose === 'tell') { if (s.kind === 'button') campaignButton(c, near[0], near[1] - 11, 1); else pineapple(c, near[0], near[1] - 13, 0.1); }
  if (pose === 'talk') { c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(near[0], near[1]); c.lineTo(near[0] + 1, near[1] - 8); c.stroke(); c.strokeStyle = SKIN_D[1]; c.lineWidth = 2; c.stroke(); c.lineCap = 'butt'; }
  if (pose === 'reel') reelStars(c, f, -132);
};

// ---------------------------------------------------------------------------------------------------------------
// Newt

const newtHead = (c: Ctx, hx: number, hy: number, pose: Pose, f: number) => {
  const open = mouthOpen(pose, f);
  // (a big round face in steps, the round cheeks pink, the jowls)
  const face = () => c.ellipse(hx, hy + 2, 19, 20, 0, 0, Math.PI * 2);
  part(c, face, SKIN_N, hx - 19, hx + 19, 2.6);
  c.save(); c.beginPath(); face(); c.clip();
  c.fillStyle = dith(c, SKIN_N[2]); c.fillRect(hx - 18, hy + 13, 36, 3);
  c.fillStyle = SKIN_N[2]; c.fillRect(hx - 18, hy + 16, 36, 8);
  c.fillStyle = '#F29A8A'; c.globalAlpha = 0.6; for (const s2 of [-1, 1]) { c.beginPath(); c.ellipse(hx + s2 * 10 + 2, hy + 7, 5.5, 3.6, 0, 0, Math.PI * 2); c.fill(); } c.globalAlpha = 1;
  c.restore();
  // (the white helmet of hair: puffed, in curls, stepped from above)
  const hair = () => { c.moveTo(hx - 20, hy + 2); c.quadraticCurveTo(hx - 27, hy - 27, hx, hy - 29); c.quadraticCurveTo(hx + 27, hy - 27, hx + 20, hy - 2); c.quadraticCurveTo(hx + 12, hy - 14, hx, hy - 14); c.quadraticCurveTo(hx - 14, hy - 14, hx - 20, hy + 2); c.closePath(); };
  partTop(c, hair, HAIR_N, hy - 29, hy, 2.4);
  c.strokeStyle = HAIR_N[3]; c.lineWidth = 1.2; for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(hx - 15 + k * 7.5, hy - 20 + Math.abs(k - 2) * 2, 4.5, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); }
  for (const s2 of [-1, 1]) { c.beginPath(); c.arc(hx + s2 * 18, hy - 6, 4, s2 < 0 ? Math.PI * 0.4 : -Math.PI * 0.4, s2 < 0 ? Math.PI * 1.4 : Math.PI * 0.6); c.stroke(); }
  px(c, hx - 8, hy - 27, 10, 1.5, '#FFFFFF');
  if (pose === 'reel') { xEyes(c, hx - 5, hy - 2); xEyes(c, hx + 8, hy - 2); }
  else { c.fillStyle = INK; c.beginPath(); c.arc(hx - 5, hy - 2, 2.1, 0, Math.PI * 2); c.arc(hx + 8, hy - 2, 2.1, 0, Math.PI * 2); c.fill(); px(c, hx - 5, hy - 3, 1, 1, '#FFFFFF'); px(c, hx + 8, hy - 3, 1, 1, '#FFFFFF'); flat(c, () => c.roundRect(hx - 9, hy - 8, 7, 2, 1), HAIR_N[3], 0.6); flat(c, () => c.roundRect(hx + 5, hy - 9, 7, 2, 1), HAIR_N[3], 0.6); }
  part(c, () => c.ellipse(hx + 3, hy + 4, 4.5, 3.8, 0, 0, Math.PI * 2), ['#FFD2C0', '#EFA48E', '#D88A72', '#B86A58'], hx - 2, hx + 8, 1.6);
  if (open) { flat(c, () => c.ellipse(hx + 2, hy + 12, 7, open / 2 + 1.5, 0, 0, Math.PI * 2), '#5A0E14', 1.6); px(c, hx - 3, hy + 10, 10, 1.5, '#FFFFFF'); px(c, hx - 1, hy + 12 + open / 2, 6, 1.2, '#C8344A'); }
  else { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(hx + 2, hy + 9, 5, 0.3, Math.PI - 0.3); c.stroke(); }
};
const paintNewt = (c: Ctx, q: Pundit, s: SimView, f: number, reel: number) => {
  const pose = poseOf(q, s, reel);
  if (pose === 'flop') {
    // (the tantrum: on his back, fists and feet going, tears squirting out sideways)
    const k = (f >> 2) % 2;
    c.save(); c.translate(0, -10);
    for (const [lx, up] of [[-26, k], [-14, 1 - k]] as [number, number][]) { limb(c, -6, -2, lx, -16 - up * 14, 9, NAVY_N, 8); shoe(c, lx - 4, -12 - up * 14, 10); }
    partTop(c, () => c.roundRect(-10, -14, 36, 18, 9), NAVY_N, -14, 4, 2.4);
    for (const [ax, up] of [[24, 1 - k], [10, k]] as [number, number][]) { limb(c, 16, -10, ax + 6, -24 - up * 14, 8, NAVY_N, 7); hand(c, ax + 6, -24 - up * 14, 4.2, SKIN_N); }
    part(c, () => c.ellipse(36, -8, 15, 14, 0, 0, Math.PI * 2), SKIN_N, 21, 51, 2.4);
    partTop(c, () => c.ellipse(45, -10, 9, 13, 0, 0, Math.PI * 2), HAIR_N, -23, 3, 2);
    flat(c, () => c.ellipse(32, -2, 6, 4 + k * 2, 0, 0, Math.PI * 2), '#5A0E14', 1.6); px(c, 28, -4, 8, 1.4, '#FFFFFF');
    c.strokeStyle = INK; c.lineWidth = 1.6; c.beginPath(); c.moveTo(30, -15); c.lineTo(35, -13); c.moveTo(38, -15); c.lineTo(42, -12); c.stroke();
    for (const s2 of [-1, 1]) for (let i = 0; i < 3; i++) { const t = ((f + i * 5) % 15) / 15, tx = 34 + s2 * (8 + t * 22), ty = -16 - t * 10 + t * t * 18; c.fillStyle = INK; c.beginPath(); c.arc(tx, ty, 3.3, 0, Math.PI * 2); c.fill(); c.fillStyle = '#7DD3FC'; c.beginPath(); c.arc(tx, ty, 2.3, 0, Math.PI * 2); c.fill(); px(c, tx - 1, ty - 1, 1, 1, '#FFFFFF'); }
    c.restore();
    return;
  }
  // (legs: stout navy trouser legs, black shoes)
  const lA = pose === 'air' ? [-8, -10] : [-8, 0], lB = pose === 'air' ? [10, -14] : [9, 0];
  for (const [lx, ly] of [lA, lB]) { limb(c, lx * 0.5, -32, lx, ly - 4, 10, NAVY_N, 9); shoe(c, lx, ly, 14); }
  // (the far arm: the Contract under it; held up in the contract's tell)
  const conTell = pose === 'tell' && s.kind === 'contract';
  const far: [number, number] = conTell ? [-6, -114] : pose === 'air' ? [-26, -70] : [-16, -48];
  if (!conTell && pose !== 'air' && pose !== 'reel') contract(c, -20, -56, -0.5);
  limb(c, -9, -68, far[0], far[1], 9, [NAVY_N[1], NAVY_N[2], NAVY_N[3], '#08122E'], 8);
  px(c, far[0] - 3, far[1] - 5, 6, 2, SHIRT[1]);
  hand(c, far[0], far[1], 4.4, SKIN_N);
  if (conTell) contract(c, far[0], far[1] - 15, 0, 1);
  // (the body: a round navy suit in steps, the lapels, the shirt, the red tie, a flag pin, the belly's shade)
  const body = () => { c.moveTo(-16, -30); c.quadraticCurveTo(-25, -52, -15, -72); c.quadraticCurveTo(0, -78, 15, -72); c.quadraticCurveTo(26, -50, 16, -30); c.closePath(); };
  part(c, body, NAVY_N, -25, 26, 2.6);
  c.fillStyle = dith(c, NAVY_N[3]); c.beginPath(); c.ellipse(2, -38, 16, 5, 0, 0, Math.PI); c.fill();
  flat(c, () => { c.moveTo(-5, -74); c.lineTo(6, -74); c.lineTo(0.5, -54); c.closePath(); }, SHIRT[1], 1.4);
  part(c, () => { c.moveTo(-2, -72); c.lineTo(3, -72); c.lineTo(4.5, -50); c.lineTo(0.5, -45); c.lineTo(-3.5, -50); c.closePath(); }, RED, -3.5, 4.5, 1.2);
  flat(c, () => { c.moveTo(-5, -74); c.lineTo(-11, -66); c.lineTo(-3, -54); c.closePath(); }, NAVY_N[0], 1);
  flat(c, () => { c.moveTo(6, -74); c.lineTo(12, -66); c.lineTo(4, -54); c.closePath(); }, NAVY_N[2], 1);
  px(c, -11, -66, 4, 3, '#1D4ED8'); px(c, -11, -64, 4, 1, '#DC2626');
  for (const by of [-48, -40]) flat(c, () => c.arc(1, by, 1.3, 0, Math.PI * 2), '#0E1E4A', 0.6);
  newtHead(c, 2, -94, pose, f);
  // (the near arm: the gavel; banged on his palm in the gavel's tell, flung in the throw, wagged talking)
  const bang = pose === 'tell' && !conTell ? ((f >> 3) % 2) * 10 : 0;
  const near: [number, number] = pose === 'tell' && !conTell ? [20, -96 + bang] : pose === 'throw' ? [32, -70] : pose === 'talk' ? [22, -98 + ((f >> 3) % 2) * 6] : pose === 'air' ? [26, -78] : [18, -46];
  limb(c, 9, -68, near[0], near[1], 9, NAVY_N, 8);
  px(c, near[0] - 3, near[1] - 5, 6, 2, SHIRT[1]);
  hand(c, near[0], near[1], 4.4, SKIN_N);
  if (pose !== 'throw' || s.kind !== 'gavel') gavel(c, near[0] + 2, near[1] - 2, pose === 'tell' ? -1.8 : -0.4);
  if (bang) for (let k = 0; k < 3; k++) { c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(30 + k * 4, -90 - k * 5); c.lineTo(36 + k * 5, -94 - k * 6); c.stroke(); }
  if (pose === 'reel') reelStars(c, f, -132);
};

/** A pundit, feet at the origin (facing right) in the fight; in the world (`world`: at his sim's feet, turned his way). */
export const drawPundit2 = (c: Ctx, id: PunditId, q: Pundit, s: SimView, f: number, reel: number, world = false) => {
  c.save();
  if (world) { c.translate(Math.round(s.x), Math.round(s.y)); c.scale(s.facing, 1); }
  // (a ground shadow under him, dithered, when he's on his feet)
  if (!s.air && world) { c.fillStyle = dith(c, INK); c.beginPath(); c.ellipse(2, 0, 22, 3, 0, 0, Math.PI * 2); c.fill(); }
  if (reel > 0) { c.translate(0, -50); c.rotate(Math.sin(f * 0.5) * 0.3 * reel); c.translate(0, 50); }
  if (q.flash > 0) c.filter = 'brightness(1.8)';
  if (id === 'limbaugh') paintLimbaugh(c, q, s, f, reel); else if (id === 'dole') paintDole(c, q, s, f, reel); else paintNewt(c, q, s, f, reel);
  c.restore();
};

/** What they throw (world). */
export const drawPunditThrow2 = (c: Ctx, t: PunditThrow) => {
  switch (t.kind) {
    case 'cigar': {
      for (let k = 1; k <= 3; k++) { const sx = t.x - t.vx * k * 2, sy = t.y - t.vy * k * 2; c.fillStyle = INK; c.beginPath(); c.arc(sx, sy, 3 + k, 0, Math.PI * 2); c.fill(); c.fillStyle = k === 1 ? '#F3F4F6' : '#D1D5DB'; c.beginPath(); c.arc(sx, sy, 2 + k, 0, Math.PI * 2); c.fill(); }
      cigar(c, t.x, t.y, t.spin);
      break;
    }
    case 'mic': {
      if (t.ox !== undefined && t.oy !== undefined) { c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(t.ox, t.oy); c.quadraticCurveTo((t.ox + t.x) / 2, Math.max(t.oy, t.y) + 16, t.x, t.y); c.stroke(); c.strokeStyle = '#3A3844'; c.lineWidth = 1.4; c.stroke(); }
      goldMic(c, t.x, t.y, t.spin);
      break;
    }
    case 'pineapple': pineapple(c, t.x, t.y, t.spin); break;
    case 'chunk': {
      c.save(); c.translate(t.x, t.y); c.rotate(t.spin);
      part(c, () => { c.moveTo(-6, 4); c.lineTo(0, -6); c.lineTo(6, 4); c.closePath(); }, ['#FFF0A8', '#FCD34D', '#E2A818', '#B47C0A'], -6, 6, 1.6);
      px(c, -5, 3, 10, 1.4, '#C2780A');
      c.restore(); break;
    }
    case 'button': campaignButton(c, t.x, t.y, 0.3 + Math.abs(Math.sin(t.spin)) * 0.7); break;
    case 'contract': contract(c, t.x, t.y, t.spin); break;
    case 'gavel': gavel(c, t.x, t.y, t.spin); break;
  }
};

/** A bit of a pundit's costume flung out of his puff (world): part two's, else part one's. */
export const drawPuffBit2 = (c: Ctx, b: PuffBit) => {
  c.save(); c.translate(b.x, b.y); c.rotate(b.rot);
  const holes = (skin: Rp) => { c.fillStyle = INK; c.fillRect(-9, -6, 6, 5); c.fillRect(4, -6, 6, 5); for (let k = -12; k < 12; k += 4) px(c, k, 17, 3, 2, skin[3]); };
  switch (b.what) {
    case 'rushhead': {
      part(c, () => c.ellipse(0, 0, 18, 19, 0, 0, Math.PI * 2), SKIN_L, -18, 18, 2.4);
      partTop(c, () => { c.moveTo(-18, -4); c.quadraticCurveTo(-19, -24, 2, -24); c.quadraticCurveTo(18, -24, 17, -10); c.quadraticCurveTo(0, -16, -18, -4); c.closePath(); }, HAIR_L, -24, -4, 2);
      holes(SKIN_L); flat(c, () => c.roundRect(-4, 8, 12, 4, 2), '#5A0E14', 1.4);
      break;
    }
    case 'headphones': headphones(c, 0, 4); break;
    case 'mic': goldMic(c, 0, 0, 0); break;
    case 'cigar': cigar(c, 0, 0, 0, false); break;
    case 'dolehead': {
      part(c, () => c.ellipse(0, 2, 14, 20, 0, 0, Math.PI * 2), SKIN_D, -14, 14, 2.4);
      partTop(c, () => { c.moveTo(-14, -6); c.quadraticCurveTo(-15, -22, 2, -22); c.quadraticCurveTo(16, -22, 15, -8); c.quadraticCurveTo(0, -14, -14, -6); c.closePath(); }, HAIR_D, -22, -6, 2);
      holes(SKIN_D);
      break;
    }
    case 'pen': c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(-10, 0); c.lineTo(10, 0); c.stroke(); c.strokeStyle = '#1F2937'; c.lineWidth = 2; c.stroke(); px(c, 6, -1, 3, 2, GOLD[1]); break;
    case 'pineapple': pineapple(c, 0, 0, 0); break;
    case 'button': campaignButton(c, 0, 0, 1); break;
    case 'newthead': { part(c, () => c.ellipse(0, 2, 18, 19, 0, 0, Math.PI * 2), SKIN_N, -18, 18, 2.4); holes(SKIN_N); flat(c, () => c.roundRect(-4, 9, 10, 4, 2), '#5A0E14', 1.4); break; }
    case 'wig': partTop(c, () => { c.moveTo(-20, 6); c.quadraticCurveTo(-26, -22, 0, -24); c.quadraticCurveTo(26, -22, 20, 6); c.quadraticCurveTo(12, -8, 0, -8); c.quadraticCurveTo(-12, -8, -20, 6); c.closePath(); }, HAIR_N, -24, 6, 2.4); c.strokeStyle = HAIR_N[3]; c.lineWidth = 1.2; for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(-11 + k * 7.5, -14, 4, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); } break;
    case 'gavel': gavel(c, 0, -6, 0); break;
    case 'contract': contract(c, 0, 0, 0, 1); break;
    default: c.restore(); drawPuffBit1(c, b); return;
  }
  c.restore();
};
