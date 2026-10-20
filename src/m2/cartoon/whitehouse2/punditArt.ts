// The pundits, part two, drawn the show's way (Saturday morning caricatures: big heads on little bodies, flat bright
// color, fat black outlines): the impersonators' costumes, played straight. Feet at the origin, facing right (in the
// fight the engine turns them round; the scene's and the reel's drawn in the world, turned here).
//
//   LIMBAUGH  a big round man in a navy suit, a loud tie, a round face with jowls, slicked-back dark hair, a cigar in his
//             teeth (smoke curling), studio headphones round his neck, the golden EIB microphone in his fist (held up to
//             his mouth: the mic's tell; the cigar puffed, a smoke ring: the cigar's); winded after a heavy landing, sat
//             on the floor, belly heaving
//   DOLE      a tall lean man in a gray suit, a red tie, a flag pin, a long face, gray hair combed flat, dark brows, a
//             strong chin; his right hand always at his side holding his pen; his left lobbing pineapples and flinging
//             campaign buttons (held up first: the tell); the pratfall flat on his face
//   NEWT      a stout man in a navy suit, a red tie, a big round face, a puffy helmet of white hair, little eyes, round
//             cheeks; the rolled-up Contract with America under one arm, the Speaker's gavel in the other hand (banged on
//             his palm, or the Contract held up: the tell); the tantrum on his back, kicking, crying
// Reeling (his last words): spinning, stars round his head. The bits his costume's flung off in out of his puff, and
// what he throws.

import type { Ctx } from '../kit';
import { INK } from '../kit';
import type { Pundit, PunditId, PunditThrow } from './state';
import type { PuffBit } from '../whitehouse1/state';
import { star } from '../whitehouse1/poof';
import { drawPuffBit as drawPuffBit1 } from '../whitehouse1/punditArt';

export interface SimView { x: number; y: number; vx: number; vy: number; air: boolean; facing: 1 | -1; kind: PunditThrow['kind'] | null }

const ink = (c: Ctx, path: () => void, fill: string, w = 2.4) => { c.beginPath(); path(); c.fillStyle = fill; c.fill(); c.lineJoin = 'round'; c.strokeStyle = INK; c.lineWidth = w; c.stroke(); };
const limb = (c: Ctx, ax: number, ay: number, bx: number, by: number, w: number, col: string) => {
  c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = w + 3; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.stroke(); c.lineCap = 'butt';
};
const SKIN = '#F6C9A8';
const hand = (c: Ctx, x: number, y: number, r = 3.8) => ink(c, () => c.arc(x, y, r, 0, Math.PI * 2), SKIN, 1.8);

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
const dotEye = (c: Ctx, x: number, y: number, r = 3.4) => { ink(c, () => c.ellipse(x, y, r, r + 0.6, 0, 0, Math.PI * 2), '#FFFFFF', 1.6); c.fillStyle = INK; c.beginPath(); c.arc(x + 1, y, 1.6, 0, Math.PI * 2); c.fill(); };
const reelStars = (c: Ctx, f: number, y: number) => { for (let i = 0; i < 4; i++) { const a = f * 0.22 + (i / 4) * Math.PI * 2; star(c, Math.cos(a) * 30, y + Math.sin(a) * 6, 5, i % 2 ? '#FDE047' : '#FFFFFF'); } };

// ---------------------------------------------------------------------------------------------------------------
// What they hold and throw

export const cigar = (c: Ctx, x: number, y: number, a: number, lit = true) => {
  c.save(); c.translate(x, y); c.rotate(a);
  ink(c, () => c.roundRect(-9, -2.5, 18, 5, 2.5), '#7C4A1E', 1.6);
  c.fillStyle = '#A16207'; c.fillRect(-4, -2.5, 3, 5);
  c.fillStyle = '#DC2626'; c.fillRect(-4, -2, 2, 4);
  if (lit) { c.fillStyle = '#F97316'; c.fillRect(8, -2, 2, 4); c.fillStyle = '#FDE047'; c.fillRect(9, -1, 1.5, 2); }
  c.restore();
};
export const goldMic = (c: Ctx, x: number, y: number, a: number) => {
  c.save(); c.translate(x, y); c.rotate(a);
  ink(c, () => c.roundRect(-3, 0, 6, 16, 2), '#B8860B', 1.6);
  ink(c, () => c.ellipse(0, -4, 7, 8, 0, 0, Math.PI * 2), '#FACC15', 2);
  c.strokeStyle = '#A16207'; c.lineWidth = 1; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(-6, -4 + k * 2.5); c.lineTo(6, -4 + k * 2.5); c.stroke(); }
  c.fillStyle = '#FFFFFF'; c.fillRect(-4, -9, 2, 3);
  // (the EIB flag on it)
  ink(c, () => c.rect(-6, 5, 12, 6), '#1D4ED8', 1.2);
  c.fillStyle = '#FDE047'; c.font = '4px "Press Start 2P"'; c.fillText('EIB', -5.5, 10);
  c.restore();
};
export const pineapple = (c: Ctx, x: number, y: number, a: number, s = 1) => {
  c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
  // (the crown, the body crosshatched)
  for (const [dx, h, r] of [[-4, 12, -0.4], [0, 15, 0], [4, 12, 0.4]] as [number, number, number][]) ink(c, () => { c.moveTo(dx - 2, -8); c.lineTo(dx + Math.sin(r) * h, -8 - h); c.lineTo(dx + 2, -8); c.closePath(); }, '#16A34A', 1.4);
  ink(c, () => c.ellipse(0, 2, 8, 11, 0, 0, Math.PI * 2), '#F59E0B', 2);
  c.strokeStyle = '#B45309'; c.lineWidth = 1;
  for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(-7 + k * 3, -6); c.lineTo(k * 3 + 5, 11); c.stroke(); c.beginPath(); c.moveTo(7 + k * 3, -6); c.lineTo(k * 3 - 5, 11); c.stroke(); }
  c.restore();
};
export const campaignButton = (c: Ctx, x: number, y: number, squash: number) => {
  c.save(); c.translate(x, y); c.scale(1, squash);
  ink(c, () => c.arc(0, 0, 10, 0, Math.PI * 2), '#F8FAFC', 2);
  c.fillStyle = '#1D4ED8'; c.beginPath(); c.arc(0, 0, 8.5, Math.PI, 0); c.fill();
  c.fillStyle = '#DC2626'; c.fillRect(-8, 1, 16, 2); c.fillRect(-7, 5, 14, 2);
  c.fillStyle = '#FFFFFF'; c.font = '4px "Press Start 2P"'; c.fillText('DOLE', -7.5, -2);
  c.restore();
};
export const contract = (c: Ctx, x: number, y: number, a: number, open = 0) => {
  c.save(); c.translate(x, y); c.rotate(a);
  if (open > 0) {
    // (unrolled: the Contract, the seal, a few lines)
    ink(c, () => c.rect(-12, -16 * open, 24, 32 * open), '#FEF3C7', 1.8);
    c.fillStyle = '#92400E'; for (let k = 0; k < 6; k++) c.fillRect(-9, -13 * open + k * 4.5 * open, 18 - (k % 2) * 5, 1);
    ink(c, () => c.arc(6, 11 * open, 3.5, 0, Math.PI * 2), '#DC2626', 1.2);
  }
  ink(c, () => c.roundRect(-13, -4, 26, 8, 4), '#FEF3C7', 1.8);
  c.fillStyle = '#E7D7A8'; c.fillRect(-11, 0, 22, 2);
  ink(c, () => c.rect(-2, -5, 4, 10), '#DC2626', 1);
  c.restore();
};
export const gavel = (c: Ctx, x: number, y: number, a: number) => {
  c.save(); c.translate(x, y); c.rotate(a);
  limb(c, 0, 0, 0, 18, 3, '#92400E');
  ink(c, () => c.roundRect(-9, -6, 18, 9, 2), '#7C2D12', 1.8);
  c.fillStyle = '#FACC15'; c.fillRect(-7, -6, 2, 9); c.fillRect(5, -6, 2, 9);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Limbaugh

const paintLimbaugh = (c: Ctx, q: Pundit, s: SimView, f: number, reel: number) => {
  const pose = poseOf(q, s, reel), SUIT = '#1E2A4A', micTell = pose === 'tell' && s.kind === 'mic';
  if (pose === 'flop') {
    // (winded: sat on the floor, legs out, belly heaving, sweating, the mic on the floor)
    const heave = Math.sin(f * 0.3) * 2;
    for (const lx of [10, 24]) { limb(c, 0, -14, lx + 8, -4, 10, SUIT); ink(c, () => c.roundRect(lx + 6, -10, 9, 10, 2), '#111827', 1.6); }
    ink(c, () => c.ellipse(-2, -30 - heave * 0.3, 26 + heave, 22, 0, 0, Math.PI * 2), SUIT, 2.6);
    ink(c, () => { c.moveTo(-3, -50); c.lineTo(4, -50); c.lineTo(3, -22); c.lineTo(-1, -18); c.lineTo(-4, -22); c.closePath(); }, '#F59E0B', 1.2);
    head(c, 'limbaugh', 0, -66, 'flop', f);
    c.fillStyle = '#93C5FD'; for (const [dx, dy] of [[-18, -78], [20, -74]]) { c.beginPath(); c.ellipse(dx, dy + (f >> 3) % 4, 2, 3, 0, 0, Math.PI * 2); c.fill(); }
    goldMic(c, -30, -6, 1.4);
    return;
  }
  // (legs: navy trouser legs, black shoes)
  const lA = pose === 'air' ? [-8, -10] : [-9, 0], lB = pose === 'air' ? [10, -14] : [10, 0];
  for (const [lx, ly] of [lA, lB]) { limb(c, lx * 0.5, -32, lx, ly - 4, 10, SUIT); ink(c, () => c.roundRect(lx - 4, ly - 6, 14, 6, [2, 3, 1, 1]), '#0B0B0F', 1.6); }
  // (the far arm: the cigar hand, a finger up talking)
  const far: [number, number] = pose === 'air' ? [-26, -72] : pose === 'tell' && !micTell ? [8, -84] : [-20, -46];
  limb(c, -10, -70, far[0], far[1], 9, SUIT); hand(c, far[0], far[1], 4.4);
  // (the body: a big round navy suit, the shirt, a loud tie (paisley dots), the belly over the belt)
  ink(c, () => { c.moveTo(-18, -30); c.quadraticCurveTo(-28, -54, -16, -76); c.quadraticCurveTo(0, -82, 16, -76); c.quadraticCurveTo(30, -52, 18, -30); c.closePath(); }, SUIT, 2.6);
  ink(c, () => { c.moveTo(-5, -78); c.lineTo(6, -78); c.lineTo(0.5, -58); c.closePath(); }, '#FFFFFF', 1.4);
  ink(c, () => { c.moveTo(-2.5, -76); c.lineTo(3.5, -76); c.lineTo(5, -52); c.lineTo(0.5, -47); c.lineTo(-4, -52); c.closePath(); }, '#F59E0B', 1.2);
  c.fillStyle = '#DC2626'; for (const [dx, dy] of [[0, -70], [2, -62], [-1, -56]]) { c.beginPath(); c.arc(dx, dy, 1.4, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = '#2B3A63'; c.beginPath(); c.ellipse(2, -42, 18, 5, 0, 0, Math.PI); c.fill();
  // (the headphones round his neck)
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.arc(1, -80, 12, 0.2, Math.PI - 0.2); c.stroke();
  ink(c, () => c.roundRect(-14, -82, 7, 9, 2), '#27272A', 1.4); ink(c, () => c.roundRect(10, -82, 7, 9, 2), '#27272A', 1.4);
  head(c, 'limbaugh', 2, -94, pose, f);
  // (the cigar in his teeth, smoke curling; puffed in the cigar's tell: a smoke ring)
  if (pose !== 'reel' && !micTell) {
    cigar(c, 20, -85, 0.15);
    c.strokeStyle = 'rgba(229,231,235,0.85)'; c.lineWidth = 1.5;
    for (let k = 0; k < 3; k++) { const t = ((f + k * 14) % 42) / 42, x = 30 + Math.sin(t * 6 + k) * 4, y = -88 - t * 30; c.beginPath(); c.arc(x, y, 1.5 + t * 3, 0, Math.PI * 2); c.stroke(); }
    if (pose === 'tell') { const t = (f % 30) / 30; c.lineWidth = 2.5; c.beginPath(); c.ellipse(34 + t * 16, -92 - t * 10, 4 + t * 6, 3 + t * 4, 0, 0, Math.PI * 2); c.stroke(); }
  }
  // (the near arm: the golden mic; up at his mouth in the mic's tell, flung in the throw)
  const near: [number, number] = micTell ? [20, -92] : pose === 'throw' ? [32, -70] : pose === 'talk' ? [24, -60 + ((f >> 3) % 2) * 3] : pose === 'air' ? [26, -76] : [20, -46];
  limb(c, 10, -70, near[0], near[1], 9, SUIT); hand(c, near[0], near[1], 4.4);
  if (!q.throws.some(t => t.kind === 'mic') && (pose !== 'throw' || s.kind !== 'mic')) goldMic(c, near[0] + 2, near[1] - 12, micTell ? -0.3 : 0.1);
  if (micTell && f % 10 < 5) { c.fillStyle = '#DC2626'; c.font = '6px "Press Start 2P"'; c.fillText('ON AIR', -20, -126); }
  if (pose === 'reel') reelStars(c, f, -128);
};

// ---------------------------------------------------------------------------------------------------------------
// Dole

const paintDole = (c: Ctx, q: Pundit, s: SimView, f: number, reel: number) => {
  const pose = poseOf(q, s, reel), SUIT = '#6B7280';
  if (pose === 'flop') {
    // (the pratfall: flat on his face, the pen still in his right hand, stars)
    c.save(); c.translate(-30, -6);
    for (const lx of [0, 10]) limb(c, -16, lx * 0.2, -40 + lx, -2 + lx * 0.3, 8, SUIT);
    ink(c, () => c.roundRect(-20, -14, 44, 18, 8), SUIT, 2.4);
    limb(c, 16, -8, 36, 2, 7, SUIT); hand(c, 36, 2);
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(36, 2); c.lineTo(44, 0); c.stroke(); c.strokeStyle = '#1F2937'; c.lineWidth = 1.5; c.stroke();
    ink(c, () => c.ellipse(36, -14, 13, 11, 0.3, 0, Math.PI * 2), SKIN, 2.2);
    ink(c, () => c.ellipse(32, -20, 12, 6, 0.3, Math.PI, 0), '#D1D5DB', 1.6);
    c.restore();
    reelStars(c, f, -40);
    return;
  }
  // (legs: long gray trouser legs, black shoes)
  const lA = pose === 'air' ? [-7, -10] : [-6, 0], lB = pose === 'air' ? [9, -16] : [7, 0];
  for (const [lx, ly] of [lA, lB]) { limb(c, lx * 0.4, -38, lx, ly - 4, 7, SUIT); ink(c, () => c.roundRect(lx - 3, ly - 6, 12, 6, [2, 3, 1, 1]), '#111827', 1.6); }
  // (the far arm: his right, always at his side, the pen in it)
  limb(c, -8, -74, -12, -50, 6.5, SUIT); hand(c, -12, -48, 3.8);
  c.strokeStyle = INK; c.lineWidth = 3.4; c.beginPath(); c.moveTo(-14, -50); c.lineTo(-10, -40); c.stroke(); c.strokeStyle = '#1F2937'; c.lineWidth = 1.8; c.stroke();
  if (pose === 'tell' && f % 10 < 5) { c.fillStyle = '#FFFFFF'; c.fillRect(-11, -42, 2, 2); }
  // (the body: a tall gray suit, the shirt, the red tie, a flag pin)
  ink(c, () => { c.moveTo(-12, -36); c.lineTo(-14, -78); c.quadraticCurveTo(0, -84, 14, -78); c.lineTo(12, -36); c.closePath(); }, SUIT, 2.4);
  ink(c, () => { c.moveTo(-4, -80); c.lineTo(5, -80); c.lineTo(0.5, -62); c.closePath(); }, '#FFFFFF', 1.4);
  ink(c, () => { c.moveTo(-1.5, -78); c.lineTo(2.5, -78); c.lineTo(3.5, -58); c.lineTo(0.5, -54); c.lineTo(-2.5, -58); c.closePath(); }, '#B91C1C', 1.2);
  c.fillStyle = '#1D4ED8'; c.fillRect(-11, -72, 5, 3); c.fillStyle = '#DC2626'; c.fillRect(-11, -69, 5, 1); c.fillStyle = '#FFFFFF'; c.fillRect(-11, -70, 5, 1);
  // (the head: long, a strong chin, gray hair combed flat, dark brows)
  const hx = 2, hy = -98, open = mouthOpen(pose, f);
  ink(c, () => { c.moveTo(hx - 13, hy - 8); c.quadraticCurveTo(hx - 14, hy - 22, hx, hy - 22); c.quadraticCurveTo(hx + 14, hy - 22, hx + 14, hy - 6); c.quadraticCurveTo(hx + 16, hy + 14, hx + 8, hy + 22); c.quadraticCurveTo(hx - 2, hy + 26, hx - 10, hy + 16); c.closePath(); }, SKIN, 2.6);
  for (const s2 of [-1, 1]) ink(c, () => c.ellipse(hx + s2 * 14, hy, 3.5, 5.5, 0, 0, Math.PI * 2), '#F2B9A0', 1.6);
  ink(c, () => { c.moveTo(hx - 14, hy - 8); c.quadraticCurveTo(hx - 15, hy - 24, hx + 2, hy - 24); c.quadraticCurveTo(hx + 16, hy - 24, hx + 15, hy - 10); c.lineTo(hx + 8, hy - 16); c.quadraticCurveTo(hx - 2, hy - 18, hx - 14, hy - 8); c.closePath(); }, '#D1D5DB', 2);
  c.strokeStyle = '#9CA3AF'; c.lineWidth = 1; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(hx - 10 + k * 5, hy - 21); c.lineTo(hx - 6 + k * 6, hy - 16); c.stroke(); }
  c.fillStyle = '#1F2937'; c.fillRect(hx - 9, hy - 11, 9, 3); c.fillRect(hx + 3, hy - 12, 9, 3);
  if (pose === 'reel') { xEyes(c, hx - 4, hy - 4); xEyes(c, hx + 8, hy - 4); } else { dotEye(c, hx - 4, hy - 4, 3); dotEye(c, hx + 8, hy - 4, 3); }
  ink(c, () => { c.moveTo(hx + 10, hy - 4); c.lineTo(hx + 16, hy + 6); c.lineTo(hx + 10, hy + 7); c.closePath(); }, '#F2B08E', 1.8);
  if (open) { ink(c, () => c.roundRect(hx - 3, hy + 10, 14, open / 2 + 3, 3), '#7F1D1D', 1.6); c.fillStyle = '#FFFFFF'; c.fillRect(hx - 1, hy + 11, 10, 1.5); }
  else { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(hx - 2, hy + 12); c.quadraticCurveTo(hx + 5, hy + 15, hx + 11, hy + 11); c.stroke(); }
  c.strokeStyle = '#D9927A'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(hx + 1, hy + 19); c.quadraticCurveTo(hx + 5, hy + 21, hx + 9, hy + 18); c.stroke();
  // (the near arm, his left: the pineapple / the button up in the tell, flung in the throw, a thumb up talking)
  const near: [number, number] = pose === 'tell' ? [16, -112] : pose === 'throw' ? [30, -72] : pose === 'talk' ? [20, -76] : pose === 'air' ? [26, -80] : [16, -48];
  limb(c, 8, -74, near[0], near[1], 6.5, SUIT); hand(c, near[0], near[1], 3.8);
  if (pose === 'tell') { if (s.kind === 'button') campaignButton(c, near[0], near[1] - 10, 1); else pineapple(c, near[0], near[1] - 12, 0.1); }
  if (pose === 'talk') { c.strokeStyle = INK; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(near[0], near[1]); c.lineTo(near[0] + 1, near[1] - 8); c.stroke(); c.strokeStyle = SKIN; c.lineWidth = 2; c.stroke(); c.lineCap = 'butt'; }
  if (pose === 'reel') reelStars(c, f, -132);
};

// ---------------------------------------------------------------------------------------------------------------
// Newt

const paintNewt = (c: Ctx, q: Pundit, s: SimView, f: number, reel: number) => {
  const pose = poseOf(q, s, reel), SUIT = '#1E3A8A';
  if (pose === 'flop') {
    // (the tantrum: on his back, fists and feet going, tears squirting out sideways)
    const k = (f >> 2) % 2;
    c.save(); c.translate(0, -10);
    for (const [lx, up] of [[-26, k], [-14, 1 - k]] as [number, number][]) limb(c, -6, -2, lx, -16 - up * 14, 8, SUIT);
    ink(c, () => c.roundRect(-10, -14, 36, 18, 9), SUIT, 2.4);
    for (const [ax, up] of [[24, 1 - k], [10, k]] as [number, number][]) { limb(c, 16, -10, ax + 6, -24 - up * 14, 7, SUIT); hand(c, ax + 6, -24 - up * 14); }
    ink(c, () => c.ellipse(36, -8, 15, 14, 0, 0, Math.PI * 2), '#F5BFA5', 2.4);
    ink(c, () => c.ellipse(44, -10, 9, 13, 0, 0, Math.PI * 2), '#F1F5F9', 2);
    ink(c, () => c.ellipse(32, -2, 6, 4 + k * 2, 0, 0, Math.PI * 2), '#7F1D1D', 1.6);
    c.fillStyle = '#7DD3FC'; for (const s2 of [-1, 1]) for (let i = 0; i < 3; i++) { const t = ((f + i * 5) % 15) / 15; c.beginPath(); c.arc(30 + s2 * (8 + t * 22), -16 - t * 10 + t * t * 18, 2.5, 0, Math.PI * 2); c.fill(); }
    c.restore();
    return;
  }
  // (legs: stout navy trouser legs, black shoes)
  const lA = pose === 'air' ? [-8, -10] : [-8, 0], lB = pose === 'air' ? [10, -14] : [9, 0];
  for (const [lx, ly] of [lA, lB]) { limb(c, lx * 0.5, -32, lx, ly - 4, 9, SUIT); ink(c, () => c.roundRect(lx - 4, ly - 6, 14, 6, [2, 3, 1, 1]), '#0B0B0F', 1.6); }
  // (the far arm: the Contract under it; held up in the contract's tell)
  const conTell = pose === 'tell' && s.kind === 'contract';
  const far: [number, number] = conTell ? [-6, -114] : pose === 'air' ? [-26, -70] : [-16, -48];
  if (!conTell && pose !== 'air' && pose !== 'reel') contract(c, -20, -56, -0.5);
  limb(c, -9, -68, far[0], far[1], 8, SUIT); hand(c, far[0], far[1], 4.2);
  if (conTell) contract(c, far[0], far[1] - 14, 0, 1);
  // (the body: a round navy suit, the shirt, the red tie)
  ink(c, () => { c.moveTo(-16, -30); c.quadraticCurveTo(-24, -52, -15, -72); c.quadraticCurveTo(0, -78, 15, -72); c.quadraticCurveTo(25, -50, 16, -30); c.closePath(); }, SUIT, 2.6);
  ink(c, () => { c.moveTo(-5, -74); c.lineTo(6, -74); c.lineTo(0.5, -54); c.closePath(); }, '#FFFFFF', 1.4);
  ink(c, () => { c.moveTo(-2, -72); c.lineTo(3, -72); c.lineTo(4, -50); c.lineTo(0.5, -46); c.lineTo(-3, -50); c.closePath(); }, '#DC2626', 1.2);
  // (the head: a big round face, round cheeks, little eyes; the puffy white helmet of hair)
  const hx = 2, hy = -94, open = mouthOpen(pose, f);
  ink(c, () => c.ellipse(hx, hy + 2, 19, 20, 0, 0, Math.PI * 2), '#F5BFA5', 2.6);
  c.fillStyle = '#EFA48E'; for (const s2 of [-1, 1]) { c.beginPath(); c.ellipse(hx + s2 * 10 + 2, hy + 7, 5, 3.5, 0, 0, Math.PI * 2); c.fill(); }
  ink(c, () => { c.moveTo(hx - 20, hy + 2); c.quadraticCurveTo(hx - 26, hy - 26, hx, hy - 28); c.quadraticCurveTo(hx + 26, hy - 26, hx + 20, hy - 2); c.quadraticCurveTo(hx + 12, hy - 14, hx, hy - 14); c.quadraticCurveTo(hx - 14, hy - 14, hx - 20, hy + 2); c.closePath(); }, '#F1F5F9', 2.4);
  c.strokeStyle = '#CBD5E1'; c.lineWidth = 1.2; for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(hx - 12 + k * 8, hy - 20, 5, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
  if (pose === 'reel') { xEyes(c, hx - 5, hy - 2); xEyes(c, hx + 8, hy - 2); } else { c.fillStyle = INK; c.beginPath(); c.arc(hx - 5, hy - 2, 2, 0, Math.PI * 2); c.arc(hx + 8, hy - 2, 2, 0, Math.PI * 2); c.fill(); c.fillRect(hx - 8, hy - 7, 6, 1.5); c.fillRect(hx + 5, hy - 8, 6, 1.5); }
  ink(c, () => c.ellipse(hx + 3, hy + 4, 4, 3.5, 0, 0, Math.PI * 2), '#EFA48E', 1.6);
  if (open) { ink(c, () => c.ellipse(hx + 2, hy + 12, 7, open / 2 + 1.5, 0, 0, Math.PI * 2), '#7F1D1D', 1.6); c.fillStyle = '#FFFFFF'; c.fillRect(hx - 3, hy + 10, 10, 1.5); }
  else { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(hx + 2, hy + 9, 5, 0.3, Math.PI - 0.3); c.stroke(); }
  // (the near arm: the gavel; banged on his palm in the gavel's tell, flung in the throw, wagged talking)
  const bang = pose === 'tell' && !conTell ? ((f >> 3) % 2) * 10 : 0;
  const near: [number, number] = pose === 'tell' && !conTell ? [20, -96 + bang] : pose === 'throw' ? [32, -70] : pose === 'talk' ? [22, -98 + ((f >> 3) % 2) * 6] : pose === 'air' ? [26, -78] : [18, -46];
  limb(c, 9, -68, near[0], near[1], 8, SUIT); hand(c, near[0], near[1], 4.2);
  if (pose !== 'throw' || s.kind !== 'gavel') gavel(c, near[0] + 2, near[1] - 2, pose === 'tell' ? -1.8 : -0.4);
  if (pose === 'reel') reelStars(c, f, -132);
};

// ---------------------------------------------------------------------------------------------------------------
// Heads (the flop's sat-down Limbaugh uses his here too)

const head = (c: Ctx, who: 'limbaugh', hx: number, hy: number, pose: Pose, f: number) => {
  void who;
  const open = mouthOpen(pose, f);
  for (const s2 of [-1, 1]) ink(c, () => c.ellipse(hx + s2 * 18, hy + 2, 4, 6, 0, 0, Math.PI * 2), '#F2B9A0', 1.8);
  // (a big round face, jowls, a double chin)
  ink(c, () => { c.moveTo(hx - 18, hy - 6); c.quadraticCurveTo(hx - 18, hy - 22, hx, hy - 22); c.quadraticCurveTo(hx + 19, hy - 22, hx + 18, hy - 6); c.quadraticCurveTo(hx + 22, hy + 18, hx + 4, hy + 22); c.quadraticCurveTo(hx - 14, hy + 23, hx - 19, hy + 10); c.closePath(); }, '#F6C3AA', 2.6);
  c.strokeStyle = '#D9927A'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(hx - 12, hy + 14); c.quadraticCurveTo(hx + 2, hy + 20, hx + 15, hy + 13); c.stroke();
  // (slicked-back dark hair, a shine)
  ink(c, () => { c.moveTo(hx - 18, hy - 4); c.quadraticCurveTo(hx - 20, hy - 26, hx + 2, hy - 26); c.quadraticCurveTo(hx + 18, hy - 26, hx + 17, hy - 12); c.quadraticCurveTo(hx + 4, hy - 18, hx - 10, hy - 14); c.closePath(); }, '#3F2A1E', 2);
  c.fillStyle = '#7C5A44'; c.fillRect(hx - 6, hy - 23, 12, 2);
  if (pose === 'reel' || pose === 'flop') { xEyes(c, hx - 5, hy - 4); xEyes(c, hx + 8, hy - 4); }
  else { dotEye(c, hx - 5, hy - 4); dotEye(c, hx + 8, hy - 4); c.fillStyle = '#3F2A1E'; c.fillRect(hx - 10, hy - 11, 9, 2.5); c.fillRect(hx + 4, hy - 12, 9, 2.5); }
  ink(c, () => c.ellipse(hx + 10, hy + 3, 5, 4, 0.2, 0, Math.PI * 2), '#EDA88E', 1.8);
  if (open) { ink(c, () => c.ellipse(hx + 4, hy + 12, 8, open / 2 + 1.5, 0, 0, Math.PI * 2), '#7F1D1D', 1.8); c.fillStyle = '#FFFFFF'; c.fillRect(hx - 2, hy + 10, 12, 1.6); }
  else { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(hx + 4, hy + 8, 6, 0.25, Math.PI - 0.25); c.stroke(); }
};

/** A pundit, feet at the origin (facing right) in the fight; in the world (`world`: at his sim's feet, turned his way). */
export const drawPundit2 = (c: Ctx, id: PunditId, q: Pundit, s: SimView, f: number, reel: number, world = false) => {
  c.save();
  if (world) { c.translate(Math.round(s.x), Math.round(s.y)); c.scale(s.facing, 1); }
  if (reel > 0) { c.translate(0, -50); c.rotate(Math.sin(f * 0.5) * 0.3 * reel); c.translate(0, 50); }
  if (q.flash > 0) c.filter = 'brightness(1.8)';
  if (id === 'limbaugh') paintLimbaugh(c, q, s, f, reel); else if (id === 'dole') paintDole(c, q, s, f, reel); else paintNewt(c, q, s, f, reel);
  c.restore();
};

/** What they throw (world). `hand`: (the mic) the hand it's on the end of a cord from. */
export const drawPunditThrow2 = (c: Ctx, t: PunditThrow) => {
  switch (t.kind) {
    case 'cigar': {
      cigar(c, t.x, t.y, t.spin);
      c.fillStyle = 'rgba(229,231,235,0.6)'; for (let k = 1; k <= 3; k++) { c.beginPath(); c.arc(t.x - t.vx * k * 2, t.y - t.vy * k * 2, 2 + k, 0, Math.PI * 2); c.fill(); }
      break;
    }
    case 'mic': {
      if (t.ox !== undefined && t.oy !== undefined) { c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.moveTo(t.ox, t.oy); c.quadraticCurveTo((t.ox + t.x) / 2, Math.max(t.oy, t.y) + 16, t.x, t.y); c.stroke(); c.strokeStyle = '#27272A'; c.lineWidth = 1.2; c.stroke(); }
      goldMic(c, t.x, t.y, t.spin);
      break;
    }
    case 'pineapple': pineapple(c, t.x, t.y, t.spin); break;
    case 'chunk': {
      c.save(); c.translate(t.x, t.y); c.rotate(t.spin);
      ink(c, () => { c.moveTo(-6, 4); c.lineTo(0, -6); c.lineTo(6, 4); c.closePath(); }, '#FCD34D', 1.6);
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
  switch (b.what) {
    case 'rushhead': {
      ink(c, () => c.ellipse(0, 0, 18, 19, 0, 0, Math.PI * 2), '#F6C3AA', 2.4);
      ink(c, () => { c.moveTo(-18, -4); c.quadraticCurveTo(-19, -24, 2, -24); c.quadraticCurveTo(18, -24, 17, -10); c.quadraticCurveTo(0, -16, -18, -4); c.closePath(); }, '#3F2A1E', 2);
      c.fillStyle = INK; c.fillRect(-10, -6, 6, 5); c.fillRect(4, -6, 6, 5); c.fillRect(-4, 8, 12, 4);
      break;
    }
    case 'headphones': c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.arc(0, 4, 12, Math.PI, 0); c.stroke(); ink(c, () => c.roundRect(-16, 0, 8, 10, 2), '#27272A', 1.4); ink(c, () => c.roundRect(8, 0, 8, 10, 2), '#27272A', 1.4); break;
    case 'mic': goldMic(c, 0, 0, 0); break;
    case 'cigar': cigar(c, 0, 0, 0, false); break;
    case 'dolehead': {
      ink(c, () => c.ellipse(0, 2, 14, 20, 0, 0, Math.PI * 2), SKIN, 2.4);
      ink(c, () => { c.moveTo(-14, -6); c.quadraticCurveTo(-15, -22, 2, -22); c.quadraticCurveTo(16, -22, 15, -8); c.quadraticCurveTo(0, -14, -14, -6); c.closePath(); }, '#D1D5DB', 2);
      c.fillStyle = INK; c.fillRect(-8, -4, 5, 4); c.fillRect(4, -4, 5, 4);
      break;
    }
    case 'pen': c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(-10, 0); c.lineTo(10, 0); c.stroke(); c.strokeStyle = '#1F2937'; c.lineWidth = 2; c.stroke(); c.fillStyle = '#FACC15'; c.fillRect(6, -1, 3, 2); break;
    case 'pineapple': pineapple(c, 0, 0, 0); break;
    case 'button': campaignButton(c, 0, 0, 1); break;
    case 'newthead': {
      ink(c, () => c.ellipse(0, 2, 18, 19, 0, 0, Math.PI * 2), '#F5BFA5', 2.4);
      c.fillStyle = INK; c.fillRect(-8, -3, 5, 4); c.fillRect(4, -3, 5, 4); c.fillRect(-4, 9, 10, 4);
      break;
    }
    case 'wig': ink(c, () => { c.moveTo(-20, 6); c.quadraticCurveTo(-26, -22, 0, -24); c.quadraticCurveTo(26, -22, 20, 6); c.quadraticCurveTo(12, -8, 0, -8); c.quadraticCurveTo(-12, -8, -20, 6); c.closePath(); }, '#F1F5F9', 2.4); break;
    case 'gavel': gavel(c, 0, -6, 0); break;
    case 'contract': contract(c, 0, 0, 0, 1); break;
    default: c.restore(); drawPuffBit1(c, b); return;
  }
  c.restore();
};
