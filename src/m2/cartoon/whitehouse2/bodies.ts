// The real stage's dead (the user's: "you see tons of dead bodies in the aftermath"): behind the projection, every
// cartoon puff was a real person dying the way a cartoon kill would really end one. Static, brutal, gory (blood's back
// once the screen's down), drawn plainly: no cartoon ink, real colors under the work lights.
//
//   NEWT      (every player sees him: the Oval Office, where the screen falls) the actor FLAYED: the cat's claws took
//             the skin off him in strips. On his back in front of the desk: the face a lidless, lipless red mask of
//             muscle, the teeth bare; the chest and arms raw, striped with muscle, the ribs showing white; the suit in
//             shreds; the skin in curling strips all round him; the white helmet wig and the rubber Newt face peeled off
//             beside him; a lake of blood, claw gouges in the floor.
//   PEROT     (back in part one's press room) face down over the podium box; the rubber ears torn off and his own ears
//             with them (two holes, blood down his neck), the jug ears lying on the floor with his real ones still glued
//             on; the pointer stick snapped off in his back; blood down the podium's front.
//   FALWELL   (part one's Lincoln Bedroom) on his back on the bed: choked on hairballs, his mouth and throat crammed
//             with wads of black fur, cheeks bulging, face blue, eyes bulging red; his hands at his throat; more
//             hairballs on the bed and the floor; the Bible on his gut.
//   LIMBAUGH  (part two's Roosevelt Room) hanged by his own microphone's cord off the studio's boom over his desk, his
//             feet off it, his face purple, his tongue out, the golden mic still in his fist; the ON AIR light lit; his
//             cigar on the desk, still smoking; blood off the claw slashes dripping onto the desk.
//   DOLE      (part two's Cabinet Room) on his back across the cabinet table, a pineapple split into his skull to the
//             crown, campaign buttons pinned into his chest, the pen still in his right hand hanging off the edge, blood
//             across the table and down its front.
// And the mean men's actors (where he killed them): on their backs or their faces, in their costumes, in their blood,
// claw marks; a crashed spy blimp (it bleeds: the drones always do).

import type { Enemy } from '../../../m1/types';
import { drawGoon, drawLobbyist, drawPollster, drawBlimp } from '../whitehouse1/kindArt';
import { paintDeadNew } from './kindArt';
import { cigar, goldMic, pineapple, campaignButton, contract, gavel } from './punditArt';
import { shape, shapeTop, rampOf, limb } from '../amphi/paint';
import { stamp } from '../kit';
import { signText } from '../../signLetters';

type Ctx = CanvasRenderingContext2D;

const BLOOD = ['#3F0606', '#5B0A0A', '#7F1010', '#9B1515'];
const MUSCLE = '#9F1D2A', FASCIA = '#E9C9BD', FAT = '#E8C987';
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** A pool of blood on the floor (its middle at x, the floor y), w wide: lumpy, dark at the middle, a wet shine. */
export const bloodPool = (c: Ctx, x: number, y: number, w: number, seed = 0) => {
  c.save(); c.translate(x, y);
  const lumps = 7;
  c.fillStyle = BLOOD[0];
  c.beginPath(); c.ellipse(0, 1, w / 2 + 3, 6, 0, 0, Math.PI * 2); c.fill();
  for (let k = 0; k < lumps; k++) { const dx = (k / (lumps - 1) - 0.5) * w * 0.9, r = 6 + hash(seed + k) * 9; c.beginPath(); c.ellipse(dx, 1 + hash(seed + k * 3) * 2, r + 3, 4 + hash(k + seed) * 2, 0, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = BLOOD[1]; c.beginPath(); c.ellipse(0, 0, w / 2, 4.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = BLOOD[2]; c.beginPath(); c.ellipse(-w * 0.08, -0.5, w * 0.32, 2.6, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(255,220,220,0.35)'; c.fillRect(-w * 0.2, -2, w * 0.18, 1); c.fillRect(w * 0.08, -1, w * 0.1, 1);
  c.restore();
};
/** Drips running down a face (from top y to bottom y, at x..x+w). */
const drips = (c: Ctx, x: number, top: number, bottom: number, w: number, n: number, seed: number) => {
  for (let k = 0; k < n; k++) {
    const dx = x + hash(seed + k) * w, len = (bottom - top) * (0.3 + hash(seed + k * 7) * 0.7);
    c.fillStyle = BLOOD[1]; c.fillRect(Math.round(dx), Math.round(top), 3, Math.round(len));
    c.fillStyle = BLOOD[2]; c.fillRect(Math.round(dx), Math.round(top), 1, Math.round(len));
    c.fillStyle = BLOOD[1]; c.beginPath(); c.arc(dx + 1.5, top + len, 2.4, 0, Math.PI * 2); c.fill();
  }
};
/** Splatter: a spray of drops off a point toward a side. */
const splatter = (c: Ctx, x: number, y: number, r: number, n: number, seed: number) => {
  for (let k = 0; k < n; k++) {
    const a = hash(seed + k) * Math.PI * 2, d = hash(seed + k * 5) * r, s = 1 + hash(seed + k * 11) * 2.5;
    c.fillStyle = BLOOD[1 + (k % 3)]; c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.5, s, 0, Math.PI * 2); c.fill();
  }
};
/** Claw gouges: three parallel slashes (on the floor, or on a body), angled. */
export const clawMarks = (c: Ctx, x: number, y: number, len: number, a: number, col = BLOOD[2]) => {
  c.save(); c.translate(x, y); c.rotate(a);
  for (let k = -1; k <= 1; k++) {
    c.strokeStyle = BLOOD[0]; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(-len / 2, k * 5); c.quadraticCurveTo(0, k * 5 - 2, len / 2, k * 5 + 1); c.stroke();
    c.strokeStyle = col; c.lineWidth = 1.4; c.stroke();
  }
  c.lineCap = 'butt';
  c.restore();
};
/** A strip of flayed skin lying curled on the floor. */
const skinStrip = (c: Ctx, x: number, y: number, len: number, a: number, skin: string) => {
  c.save(); c.translate(x, y); c.rotate(a);
  c.fillStyle = skin; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * 0.5, -5, len, -1); c.lineTo(len, 2); c.quadraticCurveTo(len * 0.5, -1, 0, 3); c.closePath(); c.fill();
  c.fillStyle = FAT; c.fillRect(0, 2, len * 0.8, 1);
  c.fillStyle = BLOOD[2]; c.fillRect(len * 0.2, 1, len * 0.5, 1);
  // (curled at one end)
  c.strokeStyle = skin; c.lineWidth = 2; c.beginPath(); c.arc(len, -4, 3, Math.PI * 0.5, Math.PI * 1.8); c.stroke();
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Newt, flayed

/** The Newt actor, flayed, on his back on the floor (feet y), his head at x (left), his feet off to the right. Part
 *  two's SNES pass, painted once (a stamp): the lake of blood with the claws' gouges through it and the drag of him; the
 *  skin in curled strips all round (its fat side yellow, its edges red); the rubber Newt face and the white helmet wig
 *  peeled off and dropped, the Contract soaked through, the gavel; the shirt's collar and the red tie still knotted
 *  round his bare neck; the chest skinned (the pectorals in their grain, the ribs white between the intercostals, the
 *  belly's six rows), the arms flung out skinned to the finger bones, the trousers in ribbons over raw shins, a shoe off,
 *  a sock; the head a lidless, lipless red mask (the cheek muscles' grain, the eyes staring out of their sockets, the
 *  teeth bare in both rows, the nose a black hole, the ears gone, the skull white at the crown). */
export const drawNewtBody = (c: Ctx, x: number, y: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, 'wh2-body-newt', -130, -64, 340, 76, paintNewtBody);
  c.restore();
};
const MUSC = rampOf('#A8222E'), FAT_R = rampOf('#E8C987'), BONE_R = rampOf('#EDE6D6'), SKIN_R = rampOf('#E9B9A0'), NAVYS = rampOf('#1E3A8A');
const paintNewtBody = (c: Ctx) => {
  bloodPool(c, 44, 0, 200, 11); bloodPool(c, -60, 0, 60, 19);
  // (the drag: smears back toward the desk, the claws' gouges through the blood)
  c.fillStyle = BLOOD[1]; for (let k = 0; k < 4; k++) c.fillRect(-100 + k * 6, -2 + k, 50, 1.5);
  clawMarks(c, -40, 3, 44, 0.08); clawMarks(c, 120, 4, 38, -0.1); clawMarks(c, 64, 5, 30, 0.05, BLOOD[3]);
  // (the skin in curled strips everywhere round him)
  for (let k = 0; k < 12; k++) skinStrip(c, -64 + k * 20 + hash(k) * 10, -1 - hash(k * 3) * 3, 10 + hash(k * 5) * 12, (hash(k * 7) - 0.5) * 1.4, SKIN_R[1]);
  // (the rubber Newt face peeled off and dropped: its eyeholes, its grin; the white helmet wig in its curls)
  c.save(); c.translate(-74, -8); c.rotate(-0.3);
  shapeTop(c, () => c.ellipse(0, 0, 15, 9, 0, 0, Math.PI * 2), rampOf('#F5BFA5'), -9, 9);
  c.fillStyle = '#2A1A16'; c.fillRect(-8, -3, 5, 3); c.fillRect(3, -3, 5, 3); c.fillRect(-4, 3, 9, 2);
  c.fillStyle = BLOOD[2]; c.fillRect(-14, 3, 10, 2); c.fillStyle = '#F2A08A'; c.fillRect(-10, -6, 6, 2);
  c.restore();
  c.save(); c.translate(160, -9); c.rotate(0.4);
  shapeTop(c, () => c.ellipse(0, 0, 16, 9, 0, Math.PI, 0), rampOf('#F1F5F9'), -9, 0);
  c.strokeStyle = '#94A3B8'; c.lineWidth = 1; for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(-9 + k * 6, -4, 3, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
  c.fillStyle = BLOOD[1]; c.fillRect(-8, -2, 12, 2);
  c.restore();
  // (the Contract, soaked through; the gavel)
  c.save(); c.translate(-100, -5); c.rotate(0.15); shapeTop(c, () => c.rect(-14, -4, 28, 6), rampOf('#FEF3C7'), -4, 2); c.fillStyle = BLOOD[2]; c.fillRect(-4, -4, 18, 6); c.fillStyle = BLOOD[1]; c.fillRect(2, -3, 8, 3); c.restore();
  c.save(); c.translate(196, -6); c.rotate(-0.5); c.fillStyle = '#6E2E0A'; c.fillRect(-1.5, 0, 3, 16); shape(c, () => c.roundRect(-9, -6, 18, 8, 2), rampOf('#92400E'), -9, 9); c.restore();
  // (the legs: the trousers in ribbons, the shins skinned, a knee's bone, a shoe off, the sock)
  limb(c, 70, -12, 6, 128, -8, 5, MUSC, 1); limb(c, 70, -8, 6, 124, -3, 5, MUSC, 1);
  for (const [lx, ly] of [[100, -12], [96, -6]]) { c.strokeStyle = MUSC[0]; c.lineWidth = 1; c.beginPath(); c.moveTo(lx, ly - 2); c.lineTo(lx + 22, ly); c.stroke(); }
  shape(c, () => c.ellipse(108, -10, 4, 3, 0, 0, Math.PI * 2), BONE_R, 104, 112);
  shapeTop(c, () => c.rect(64, -20, 36, 20), NAVYS, -20, 0);
  for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? NAVYS[1] : NAVYS[2]; c.beginPath(); c.moveTo(98 + k * 2, -20 + k * 3.4); c.lineTo(112 + hash(k) * 10, -18 + k * 3.4); c.lineTo(98 + k * 2, -16 + k * 3.4); c.fill(); }
  shapeTop(c, () => c.roundRect(122, -15, 13, 8, [2, 4, 1, 1]), rampOf('#1F2430'), -15, -7);
  shapeTop(c, () => c.roundRect(122, -6, 10, 6, 2), rampOf('#E2E6EE'), -6, 0);
  c.fillStyle = BLOOD[2]; c.fillRect(124, -3, 6, 2);
  // (the torso: skinned; the pectorals' grain, the ribs white between the intercostals, the belly's rows; fat at the
  // cut edges; the suit's rags either side; the collar and the red tie knotted round the bare neck)
  shapeTop(c, () => c.ellipse(40, -14, 35, 16, 0, 0, Math.PI * 2), MUSC, -30, 2);
  c.save(); c.beginPath(); c.ellipse(40, -14, 33, 14, 0, 0, Math.PI * 2); c.clip();
  for (let k = 0; k < 7; k++) { const rx = 16 + k * 7.5; shape(c, () => { c.moveTo(rx, -27); c.quadraticCurveTo(rx + 4, -15, rx, -3); c.lineTo(rx + 2.4, -3); c.quadraticCurveTo(rx + 6.4, -15, rx + 2.4, -27); c.closePath(); }, BONE_R, rx, rx + 6); }
  for (let k = 0; k < 6; k++) { const rx = 20 + k * 7.5; c.strokeStyle = MUSC[0]; c.lineWidth = 1; c.beginPath(); c.moveTo(rx, -24); c.lineTo(rx + 1, -6); c.stroke(); }
  for (let r = 0; r < 3; r++) for (let k = 0; k < 2; k++) shapeTop(c, () => c.roundRect(58 + k * 8, -24 + r * 7, 7, 6, 2), MUSC, -24 + r * 7, -18 + r * 7);
  c.restore();
  c.fillStyle = FAT_R[1]; c.fillRect(6, -27, 6, 2); c.fillRect(70, -22, 3, 12); c.fillRect(12, -4, 50, 1.5);
  c.fillStyle = FAT_R[0]; c.fillRect(6, -27, 6, 1);
  for (const [px, py, s] of [[10, -4, 1], [70, -2, -1]] as [number, number, number][]) { c.fillStyle = NAVYS[2]; c.beginPath(); c.moveTo(px, py); c.lineTo(px + s * 8, py - 26); c.lineTo(px + s * 14, py - 18); c.lineTo(px + s * 10, py); c.closePath(); c.fill(); c.fillStyle = NAVYS[0]; c.fillRect(px + s * 6 - 1, py - 22, 2, 14); }
  c.fillStyle = '#F2F2F8'; c.beginPath(); c.moveTo(8, -24); c.lineTo(16, -30); c.lineTo(16, -18); c.closePath(); c.fill(); c.beginPath(); c.moveTo(8, -6); c.lineTo(16, 0); c.lineTo(16, -12); c.closePath(); c.fill();
  shape(c, () => { c.moveTo(14, -16); c.lineTo(40, -2); c.lineTo(36, 0); c.lineTo(12, -12); c.closePath(); }, rampOf('#C81E2E'), 12, 40);
  shape(c, () => c.roundRect(10, -18, 7, 8, 2), rampOf('#C81E2E'), 10, 17);
  // (the arms flung out, skinned to the finger bones)
  limb(c, 18, -22, 5, -4, -38, 4, MUSC, 1); limb(c, 60, -22, 5, 82, -34, 4, MUSC, 1);
  for (const [hx0, hy0, s] of [[-6, -40, -1], [84, -36, 1]] as [number, number, number][]) {
    shapeTop(c, () => c.arc(hx0, hy0, 4.6, 0, Math.PI * 2), MUSC, hy0 - 5, hy0 + 5);
    for (let k = 0; k < 4; k++) { c.fillStyle = BONE_R[1]; c.fillRect(hx0 + s * 3 + (k - 1.5) * 2.2 - 0.7, hy0 - 9 - (k % 2), 1.5, 6); c.fillStyle = BONE_R[0]; c.fillRect(hx0 + s * 3 + (k - 1.5) * 2.2 - 0.7, hy0 - 10 - (k % 2), 1.5, 1.4); }
    c.strokeStyle = FASCIA; c.lineWidth = 1.2; c.beginPath(); c.moveTo(hx0 - s * 10, hy0 + s * 6); c.lineTo(hx0 - s * 3, hy0 + s * 2); c.stroke();
  }
  // (the head: the face a red mask, its grain; the eyes staring out of their sockets; the teeth bare in both rows; the
  // nose a black hole; the ears gone; the skull white at the crown)
  const hx = 0, hy = -14;
  shapeTop(c, () => c.ellipse(hx, hy, 15.5, 14.5, 0, 0, Math.PI * 2), MUSC, hy - 15, hy + 15);
  c.strokeStyle = MUSC[0]; c.lineWidth = 1; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(hx - 11, hy + k * 4); c.quadraticCurveTo(hx - 2, hy + k * 4 - 2, hx + 7, hy + k * 4); c.stroke(); }
  shape(c, () => c.ellipse(hx - 11, hy, 4.5, 7, 0, 0, Math.PI * 2), BONE_R, hx - 15, hx - 7);
  c.fillStyle = BLOOD[0]; c.beginPath(); c.ellipse(hx - 11, hy, 2, 3.5, 0, 0, Math.PI * 2); c.fill();
  for (const ey of [-5, 5]) { c.fillStyle = BLOOD[0]; c.beginPath(); c.arc(hx - 3, hy + ey, 4.8, 0, Math.PI * 2); c.fill(); shape(c, () => c.arc(hx - 3, hy + ey, 3.8, 0, Math.PI * 2), rampOf('#F8F4EC'), hx - 7, hx + 1); c.fillStyle = '#5A3A1A'; c.beginPath(); c.arc(hx - 4, hy + ey, 1.6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#111'; c.fillRect(hx - 4.5, hy + ey - 0.5, 1, 1); c.strokeStyle = '#C2410C'; c.lineWidth = 0.6; c.beginPath(); c.arc(hx - 3, hy + ey, 3.4, 0.2, 1.4); c.stroke(); }
  c.fillStyle = '#1A0404'; c.beginPath(); c.moveTo(hx + 2, hy - 2); c.lineTo(hx + 5, hy); c.lineTo(hx + 2, hy + 2); c.closePath(); c.fill();
  c.fillStyle = BLOOD[0]; c.fillRect(hx + 6, hy - 8, 6, 16);
  for (let k = 0; k < 6; k++) { c.fillStyle = BONE_R[k % 2 ? 1 : 0]; c.fillRect(hx + 6.5, hy - 7.5 + k * 2.6, 2.4, 2.2); c.fillRect(hx + 9.3, hy - 7.5 + k * 2.6, 2.4, 2.2); }
  c.fillStyle = MUSC[3]; c.fillRect(hx + 8.9, hy - 8, 0.6, 16);
  splatter(c, hx - 14, hy + 6, 18, 12, 41);
};

// ---------------------------------------------------------------------------------------------------------------
// Perot, over the podium

/** The Perot actor, face down over the podium box (its left edge a, right edge b, top y), the floor at fy. Part one's
 *  SNES pass: the gray suit in steps slashed through to the red, the shirt's tail out, the pointer stick snapped off
 *  in his back, the rubber caricature head torn half off him (the actor's own face under it, slack, his own hair
 *  sweated flat), both ears gone (the rubber jugs ripped off with his real ones still glued in them: two holes, blood
 *  down his neck), blood down the podium's front in runs, his pie chart dropped in it, a shoe off. */
export const drawPerotBody = (c: Ctx, a: number, b: number, top: number, fy: number) => {
  const SUIT = rampOf('#8B929C'), SKIN = rampOf('#E8BC9E'), RUB = rampOf('#F6C9A8'), EARS = rampOf('#F5B7A0');
  bloodPool(c, b + 12, fy, 70, 3); bloodPool(c, a - 20, fy, 40, 9);
  drips(c, b - 10, top + 4, fy - 4, 10, 4, 5); drips(c, a + 6, top + 6, top + 40, 30, 3, 9); drips(c, a + 30, top + 8, fy - 20, 20, 3, 13);
  // (the pie chart he dropped, face up in the blood, a bloody handprint on it)
  c.save(); c.translate(a - 34, fy - 2); c.scale(1, 0.3);
  c.fillStyle = '#C8C8D6'; c.beginPath(); c.arc(0, 0, 14, 0, Math.PI * 2); c.fill();
  for (const [s0, s1, col] of [[0, 2.4, '#C83A3A'], [2.4, 3.9, '#2A62C6'], [3.9, 5.2, '#D8A808'], [5.2, 6.3, '#16A04A']] as [number, number, string][]) { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 12, s0, s1); c.closePath(); c.fillStyle = col; c.fill(); }
  c.fillStyle = BLOOD[1]; c.beginPath(); c.ellipse(4, 2, 6, 7, 0, 0, Math.PI * 2); c.fill();
  c.restore();
  // (the legs hanging down the near side to the floor, the trousers' crease lit, one shoe off, the sock)
  for (const [lx, ex] of [[a + 6, a - 10], [a + 14, a - 2]] as [number, number][]) {
    c.lineCap = 'round';
    c.strokeStyle = SUIT[4]; c.lineWidth = 9; c.beginPath(); c.moveTo(lx, top + 6); c.quadraticCurveTo(lx - 10, top + 30, ex, fy - 6); c.stroke();
    c.strokeStyle = SUIT[2]; c.lineWidth = 7; c.stroke();
    c.strokeStyle = SUIT[1]; c.lineWidth = 3; c.beginPath(); c.moveTo(lx - 1, top + 6); c.quadraticCurveTo(lx - 11, top + 30, ex - 1, fy - 6); c.stroke();
  }
  c.lineCap = 'butt';
  shapeTop(c, () => c.roundRect(a - 18, fy - 7, 14, 7, [2, 4, 1, 1]), rampOf('#1F2430'), fy - 7, fy);
  shape(c, () => c.roundRect(a - 5, fy - 7, 10, 6, 2), rampOf('#3A3A48'), a - 5, a + 5);
  shapeTop(c, () => c.roundRect(a - 64, fy - 6, 13, 6, [2, 4, 1, 1]), rampOf('#1F2430'), fy - 6, fy);
  // (the body draped over the top, face down: the jacket in steps, slashed through, the shirt tail out)
  const back = () => { c.moveTo(a + 2, top + 8); c.quadraticCurveTo(a + 30, top - 14, b - 4, top - 2); c.lineTo(b + 4, top + 14); c.quadraticCurveTo(a + 30, top + 4, a + 2, top + 16); c.closePath(); };
  shapeTop(c, back, SUIT, top - 12, top + 16);
  c.fillStyle = '#F2F2F8'; c.beginPath(); c.moveTo(a + 4, top + 10); c.lineTo(a + 18, top + 4); c.lineTo(a + 14, top + 14); c.closePath(); c.fill();
  for (const [sx, sy, len, ang] of [[a + 22, top - 4, 22, -0.4], [a + 48, top - 6, 18, -0.2]] as [number, number, number, number][]) {
    c.save(); c.translate(sx, sy); c.rotate(ang);
    for (let k = -1; k <= 1; k++) { c.fillStyle = BLOOD[0]; c.fillRect(-len / 2, k * 4 - 1.5, len, 3); c.fillStyle = MUSCLE; c.fillRect(-len / 2 + 2, k * 4 - 0.5, len - 4, 1.5); c.fillStyle = SUIT[0]; c.fillRect(-len / 2, k * 4 - 2.5, len, 1); }
    c.restore();
  }
  // (the pointer stick snapped off in his back: the splintered end, the blood round where it went in)
  c.fillStyle = BLOOD[1]; c.beginPath(); c.ellipse(a + 34, top - 6, 7, 3.5, 0, 0, Math.PI * 2); c.fill();
  c.lineCap = 'round'; c.strokeStyle = '#6A4A2A'; c.lineWidth = 4; c.beginPath(); c.moveTo(a + 34, top - 7); c.lineTo(a + 44, top - 34); c.stroke();
  c.strokeStyle = '#D6A86A'; c.lineWidth = 2.4; c.stroke(); c.lineCap = 'butt';
  c.fillStyle = '#F2EBDD'; c.beginPath(); c.moveTo(a + 42, top - 34); c.lineTo(a + 44, top - 41); c.lineTo(a + 46, top - 35); c.lineTo(a + 47, top - 39); c.lineTo(a + 47, top - 33); c.closePath(); c.fill();
  // (the snapped-off rest of it on the floor)
  c.strokeStyle = '#D6A86A'; c.lineWidth = 2; c.beginPath(); c.moveTo(b + 70, fy - 2); c.lineTo(b + 92, fy - 4); c.stroke();
  // (the arms dangling down the far side, the cuffs, the hands gone gray)
  c.lineCap = 'round';
  for (const [x0, x1, y1] of [[b - 2, b + 6, top + 44], [b - 8, b - 4, top + 48]] as [number, number, number][]) { c.strokeStyle = SUIT[4]; c.lineWidth = 8; c.beginPath(); c.moveTo(x0, top + 4); c.lineTo(x1, y1); c.stroke(); c.strokeStyle = SUIT[2]; c.lineWidth = 6; c.stroke(); c.strokeStyle = SUIT[1]; c.lineWidth = 2; c.beginPath(); c.moveTo(x0 - 1.5, top + 4); c.lineTo(x1 - 1.5, y1); c.stroke(); }
  c.lineCap = 'butt';
  for (const [hx0, hy0] of [[b + 6, top + 47], [b - 4, top + 51]]) { c.fillStyle = '#F2F2F8'; c.fillRect(hx0 - 3, hy0 - 6, 6, 2); shape(c, () => c.arc(hx0, hy0, 3.6, 0, Math.PI * 2), rampOf('#D8B0A0'), hx0 - 4, hx0 + 4); }
  // (the head hanging over the far edge: the rubber caricature head torn half off (its grin upside down, empty), the
  // actor's own face under it, slack, his own hair sweated flat, his ears gone: two holes, blood down the neck)
  const hx = b + 6, hy = top + 18;
  shape(c, () => c.ellipse(hx, hy, 10, 12, 0.2, 0, Math.PI * 2), SKIN, hx - 10, hx + 10);
  c.fillStyle = '#4A3424'; c.beginPath(); c.ellipse(hx, hy + 9, 8, 4, 0.2, 0, Math.PI); c.fill();
  c.fillStyle = '#2A1A12'; c.fillRect(hx + 2, hy - 4, 3, 1.4); c.fillRect(hx + 2, hy + 1, 3, 1.4);
  c.fillStyle = '#7A3A3A'; c.fillRect(hx + 4, hy - 1, 2, 2);
  for (const ex of [-9, 9]) { c.fillStyle = '#3F0606'; c.beginPath(); c.ellipse(hx + ex, hy, 3, 4.5, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = MUSCLE; c.beginPath(); c.ellipse(hx + ex, hy - 1, 1.6, 2.4, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = BLOOD[2]; c.fillRect(hx + ex - 1, hy + 3, 2, 12 + (ex > 0 ? 6 : 0)); }
  c.save(); c.translate(hx - 8, hy - 6); c.rotate(2.6);
  shape(c, () => c.roundRect(-12, -14, 24, 28, [10, 10, 8, 8]), RUB, -12, 12);
  c.fillStyle = '#5A0E14'; c.fillRect(-7, 6, 14, 4); c.fillStyle = '#FFFFFF'; c.fillRect(-6, 6, 12, 2);
  c.fillStyle = '#1A1A22'; c.fillRect(-7, -4, 4, 3); c.fillRect(3, -4, 4, 3);
  c.fillStyle = '#8A909E'; c.fillRect(-11, -12, 4, 8); c.fillRect(7, -12, 4, 8);
  for (let k = -10; k < 10; k += 4) { c.fillStyle = RUB[3]; c.fillRect(k, 13, 3, 3); }
  c.restore();
  // (the jug ears on the floor, his real ones still glued inside them, torn edges bloody)
  for (const [ex, flip] of [[b + 36, 1], [b + 56, -1]] as [number, number][]) {
    c.save(); c.translate(ex, fy - 7); c.scale(flip, 1); c.rotate(0.6);
    shape(c, () => c.ellipse(0, 0, 9, 12, 0, 0, Math.PI * 2), EARS, -9, 9);
    c.fillStyle = '#E28A78'; c.beginPath(); c.ellipse(0, 1, 5, 8, 0, 0, Math.PI * 2); c.fill();
    shape(c, () => c.ellipse(1, 2, 3, 5, 0, 0, Math.PI * 2), SKIN, -2, 4);
    c.fillStyle = BLOOD[2]; c.fillRect(-3, 4, 7, 4); c.fillStyle = BLOOD[0]; c.fillRect(-2, 7, 5, 2);
    c.restore();
  }
  bloodPool(c, b + 46, fy, 40, 17);
  splatter(c, b + 20, fy - 30, 30, 14, 71);
};

// ---------------------------------------------------------------------------------------------------------------
// Falwell, choked

/** The Falwell actor on his back on the bed (its left a, right b, top y), the floor fy: choked on hairballs. */
export const drawFalwellBody = (c: Ctx, a: number, b: number, top: number, fy: number) => {
  // (part one's SNES pass: the navy three-piece in steps, slashed; the hands clawed at his own throat; the head gone blue
  // and puffed, the silver wig knocked askew off the actor's own thin brown hair, the eyes bulging and shot with blood
  // behind cracked glasses, the mouth jammed open full of wads of black fur, more spilling out down his chin; the
  // Bible on his gut; hairballs on the bed and the floor, a trail of bile down the bed's end, a cracked lens off)
  const SUIT = rampOf('#2A3650'), FACE = rampOf('#7C8DB5'), SHOE = rampOf('#1A1C26'), SKINH = rampOf('#C8A0A8');
  const hairball = (x: number, y: number, r: number) => {
    c.fillStyle = '#060508'; c.beginPath(); c.ellipse(x, y, r + 1, r * 0.7 + 1, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#16131A'; c.beginPath(); c.ellipse(x, y, r, r * 0.7, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#26232E'; c.beginPath(); c.ellipse(x - r * 0.25, y - r * 0.2, r * 0.6, r * 0.4, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#3D3849'; c.lineWidth = 1; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x - r, y - r * 0.3 + k * 2); c.quadraticCurveTo(x, y - r + k * 3, x + r, y - r * 0.2 + k * 2); c.stroke(); }
    c.fillStyle = 'rgba(220,240,250,0.5)'; c.fillRect(x - r * 0.5, y - r * 0.45, Math.max(1, r * 0.3), 1);
    c.fillStyle = '#5B4A2E'; c.fillRect(x - r * 0.4, y + r * 0.3, r * 0.8, 1);
    // (loose hairs off it)
    c.strokeStyle = '#26232E'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(x + r, y); c.quadraticCurveTo(x + r + 3, y - 3, x + r + 5, y + 1); c.stroke();
  };
  // (the legs along the bed in steps, the shoes up, a sock showing)
  shapeTop(c, () => c.roundRect(a + 70, top - 15, 80, 13, 4), SUIT, top - 15, top - 2);
  for (const [sx, sy, sh] of [[b - 12, top - 26, 14], [b - 24, top - 22, 12]] as [number, number, number][]) { shape(c, () => c.roundRect(sx, sy, 8, sh, 2), SHOE, sx, sx + 8); c.fillStyle = '#E2E6EE'; c.fillRect(sx - 3, sy + sh - 2, 4, 3); }
  // (the big round body in steps, the vest, the shirt, the red tie askew, the Bible on the gut, claw slashes)
  shapeTop(c, () => c.ellipse(a + 56, top - 18, 34, 20, 0, 0, Math.PI * 2), SUIT, top - 38, top + 2);
  c.fillStyle = '#F8FAFC'; c.beginPath(); c.moveTo(a + 32, top - 24); c.lineTo(a + 48, top - 30); c.lineTo(a + 44, top - 16); c.closePath(); c.fill();
  c.fillStyle = '#DC2626'; c.beginPath(); c.moveTo(a + 38, top - 26); c.lineTo(a + 60, top - 34); c.lineTo(a + 62, top - 30); c.lineTo(a + 42, top - 22); c.closePath(); c.fill();
  c.strokeStyle = '#E8C040'; c.lineWidth = 1; c.beginPath(); c.moveTo(a + 46, top - 10); c.quadraticCurveTo(a + 56, top - 4, a + 68, top - 12); c.stroke();
  c.save(); c.translate(a + 66, top - 38); c.rotate(-0.2);
  shape(c, () => c.rect(-9, -6, 18, 12), rampOf('#22222C'), -9, 9);
  c.fillStyle = '#F2D06A'; c.fillRect(7, -5, 2, 10); c.fillStyle = '#EAB308'; c.fillRect(-1, -4, 2, 8); c.fillRect(-4, -1, 8, 2);
  c.fillStyle = '#DC2626'; c.fillRect(-4, 6, 2, 5);
  c.restore();
  clawMarks(c, a + 52, top - 20, 30, 0.5); clawMarks(c, a + 76, top - 12, 22, -0.3); clawMarks(c, a + 36, top - 8, 18, 0.1);
  // (the hands at his throat, clawing: the knuckles white, his own nails' scratches on his neck)
  c.lineCap = 'round';
  for (const [x0, y0, x1, y1] of [[a + 46, top - 30, a + 28, top - 30], [a + 50, top - 18, a + 34, top - 22]] as [number, number, number, number][]) { c.strokeStyle = SUIT[4]; c.lineWidth = 10; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.strokeStyle = SUIT[1]; c.lineWidth = 8; c.stroke(); c.strokeStyle = SUIT[0]; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, y0 - 2.5); c.lineTo(x1, y1 - 2.5); c.stroke(); }
  c.lineCap = 'butt';
  for (const [hx0, hy0] of [[a + 26, top - 30], [a + 32, top - 24]]) { shape(c, () => c.arc(hx0, hy0, 4.6, 0, Math.PI * 2), rampOf('#E8B8A8'), hx0 - 5, hx0 + 5); for (let k = -1; k <= 1; k++) c.fillRect(hx0 - 4, hy0 + k * 2, 2, 1); }
  c.fillStyle = BLOOD[2]; for (let k = 0; k < 3; k++) c.fillRect(a + 20 + k * 3, top - 22 + k, 1, 5);
  // (the head: blue, puffed, eyes bulging bloodshot behind cracked glasses, the wig askew off his own hair, the mouth
  // jammed open full of black fur, more spilling out)
  const hx = a + 12, hy = top - 22;
  shape(c, () => c.ellipse(hx, hy, 15, 16, 0, 0, Math.PI * 2), FACE, hx - 15, hx + 15);
  c.fillStyle = FACE[2]; c.beginPath(); c.ellipse(hx + 4, hy + 6, 10, 8, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#8A5A8A'; c.beginPath(); c.ellipse(hx - 9, hy + 2, 4, 3, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#5A3A26'; c.beginPath(); c.ellipse(hx + 2, hy - 13, 11, 4, 0, Math.PI, 0); c.fill();
  c.save(); c.translate(hx - 12, hy - 14); c.rotate(-0.6);
  shapeTop(c, () => { c.moveTo(-12, 4); c.quadraticCurveTo(-14, -10, 2, -10); c.quadraticCurveTo(14, -10, 12, 2); c.quadraticCurveTo(0, -2, -12, 4); c.closePath(); }, rampOf('#E5E7EB'), -10, 4);
  c.fillStyle = '#C4C8D2'; c.fillRect(-8, -2, 14, 1); c.fillStyle = '#B8A890'; c.fillRect(-10, 3, 20, 2);
  c.restore();
  for (const ex of [-6, 6]) { c.fillStyle = '#FBE8E8'; c.beginPath(); c.arc(hx + ex, hy - 4, 4.4, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#DC2626'; c.lineWidth = 0.7; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(hx + ex - 4, hy - 6 + k * 1.4); c.lineTo(hx + ex, hy - 4); c.stroke(); } c.fillStyle = '#111'; c.beginPath(); c.arc(hx + ex + 0.5, hy - 3.5, 1.4, 0, Math.PI * 2); c.fill(); }
  c.strokeStyle = '#2A2A36'; c.lineWidth = 1.6; c.strokeRect(hx - 10, hy - 8, 8, 7); c.strokeRect(hx + 2, hy - 8, 8, 7);
  c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(hx + 3, hy - 7); c.lineTo(hx + 7, hy - 3); c.lineTo(hx + 5, hy - 1); c.moveTo(hx + 7, hy - 3); c.lineTo(hx + 9, hy - 6); c.stroke();
  c.fillStyle = '#3F0606'; c.beginPath(); c.ellipse(hx, hy + 7, 8, 6, 0, 0, Math.PI * 2); c.fill();
  hairball(hx, hy + 7, 6); hairball(hx - 10, hy + 12, 5); hairball(hx - 6, hy + 18, 4);
  c.fillStyle = '#A3A04A'; c.fillRect(hx - 2, hy + 12, 2, 8);
  // (the lens popped out of the glasses on the floor; hairballs on the bed and the floor, a trail of bile)
  c.fillStyle = 'rgba(219,234,254,0.8)'; c.fillRect(a - 70, fy - 3, 8, 3); c.fillStyle = '#FFFFFF'; c.fillRect(a - 69, fy - 3, 2, 1);
  for (const [dx, dy, r] of [[-26, -2, 6], [-38, 6, 5], [-60, fy - top - 4, 7], [-40, fy - top - 3, 5], [100, -4, 5], [-82, fy - top - 3, 4], [116, -6, 4]] as [number, number, number][]) hairball(a + dx + 20, top + dy, r);
  c.fillStyle = '#A3A04A'; c.beginPath(); c.ellipse(a - 6, top + 2, 12, 3, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#C8C460'; c.fillRect(a - 12, top + 1, 6, 1);
  drips(c, a - 2, top + 2, fy - 2, 8, 3, 21);
  c.fillStyle = '#8F8A3A'; c.beginPath(); c.ellipse(a - 8, fy, 18, 3, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#B8B050'; c.beginPath(); c.ellipse(a - 12, fy - 1, 8, 1.4, 0, 0, Math.PI * 2); c.fill();
  void SKINH;
};

// ---------------------------------------------------------------------------------------------------------------
// Limbaugh, hanged

/** The Limbaugh actor hanged off his studio's boom by the mic cord over his desk (its left a, right b, top y); the boom's
 *  stand on the floor fy. The ON AIR light (lit) over it. */
export const drawLimbaughBody = (c: Ctx, a: number, b: number, top: number, fy: number, f: number) => {
  const w = Math.round(b - a), yt = Math.round(top - fy), mx = w / 2;
  c.save(); c.translate(Math.round(a), Math.round(fy));
  stamp(c, `wh2-body-limbaugh-${w}-${yt}`, -40, yt - 290, w + 170, -yt + 296, g => paintLimbaugh(g, w, yt));
  // (live: the cigar still smoking in the ashtray; a drip off his shoe now and then; the ON AIR light's buzz)
  for (let k = 0; k < 4; k++) { const t = ((f + k * 17) % 68) / 68; c.fillStyle = `rgba(200,196,206,${0.55 * (1 - t)})`; c.beginPath(); c.arc(30 + Math.sin(t * 5 + k) * 4, yt - 8 - t * 50, 1.5 + t * 4, 0, Math.PI * 2); c.fill(); }
  const dt = (f % 70) / 70; if (dt < 0.5) { c.fillStyle = BLOOD[2]; c.fillRect(mx + 9, yt - 34 + dt * 60, 2, 3); }
  if (f % 240 < 3) { c.fillStyle = 'rgba(10,8,12,0.7)'; c.fillRect(w + 44, yt - 192, 58, 22); }
  c.restore();
};
/** (local: x from the desk's left, the floor at 0; the desk top at yt) Part two's SNES pass: the studio's boom stand
 *  behind the desk (a tripod, the counterweight, the arm out over it), his own mic cord knotted off its end and round
 *  his neck; the ON AIR light clamped to the stand, lit; him hanging, feet off the desk: the fat suit slashed through to
 *  its yellow foam and to him, blood down the trousers and off the shoes onto the desk; the arms hanging, the golden mic
 *  still in his fist; the headphones tangled in the cord; the head lolled, purple, the tongue out, the eyes bulging half
 *  shut, the cord biting in; on the desk his rubber caricature head (empty, its grin), the cigar in the ashtray, a DITTO
 *  mug knocked over. */
const paintLimbaugh = (c: Ctx, w: number, yt: number) => {
  const SUIT = rampOf('#26324A'), FOAM = rampOf('#E8C860'), PURP = rampOf('#8E5A86'), STEEL = rampOf('#3F3F46'), mx = w / 2;
  // (the boom stand: the tripod, the pole, the arm, the counterweight)
  for (const s of [-1, 0, 1]) { c.strokeStyle = STEEL[4]; c.lineWidth = 5; c.beginPath(); c.moveTo(w + 30, -40); c.lineTo(w + 30 + s * 22, 0); c.stroke(); c.strokeStyle = STEEL[1]; c.lineWidth = 2.5; c.stroke(); }
  c.strokeStyle = STEEL[4]; c.lineWidth = 6; c.beginPath(); c.moveTo(w + 30, 0); c.lineTo(w + 30, yt - 200); c.lineTo(mx, yt - 226); c.stroke();
  c.strokeStyle = STEEL[1]; c.lineWidth = 3; c.stroke(); c.strokeStyle = STEEL[0]; c.lineWidth = 1; c.beginPath(); c.moveTo(w + 29, -2); c.lineTo(w + 29, yt - 200); c.stroke();
  c.strokeStyle = STEEL[4]; c.lineWidth = 5; c.beginPath(); c.moveTo(w + 30, yt - 200); c.lineTo(w + 70, yt - 186); c.stroke(); shape(c, () => c.roundRect(w + 64, yt - 194, 16, 18, 3), STEEL, w + 64, w + 80);
  shape(c, () => c.roundRect(w + 24, yt - 206, 12, 12, 2), STEEL, w + 24, w + 36);
  // (the ON AIR light clamped to the pole: its box, the letters lit red, the glow round it)
  c.fillStyle = 'rgba(220,38,38,0.22)'; c.beginPath(); c.ellipse(w + 73, yt - 181, 46, 22, 0, 0, Math.PI * 2); c.fill();
  shape(c, () => c.rect(w + 40, yt - 196, 66, 30), rampOf('#2A2830'), w + 40, w + 106);
  c.fillStyle = '#B91C1C'; c.fillRect(w + 44, yt - 192, 58, 22); c.fillStyle = '#DC2626'; c.fillRect(w + 44, yt - 192, 58, 6); c.fillStyle = '#F87171'; c.fillRect(w + 44, yt - 192, 58, 2);
  signText(c, 'ON AIR', w + 73, yt - 175, { sx: 1, sy: 1, bold: true, fill: ['#FFFFFF', '#FEE2E2'] });
  c.fillStyle = STEEL[3]; c.fillRect(w + 32, yt - 186, 8, 6);
  // (on the desk: the blood off him, the ashtray and the cigar, the rubber head, the knocked-over mug)
  bloodPool(c, mx + 10, yt, 64, 31);
  drips(c, mx - 10, yt + 2, yt + 40, 36, 4, 33); drips(c, w - 18, yt + 2, -6, 10, 2, 37);
  shapeTop(c, () => c.ellipse(28, yt - 2, 12, 3.5, 0, 0, Math.PI * 2), rampOf('#9CA3AF'), yt - 5, yt + 1);
  cigar(c, 30, yt - 5, -0.1, true);
  c.save(); c.translate(w - 14, yt - 13); c.rotate(0.6);
  shape(c, () => c.ellipse(0, 0, 15, 14, 0, 0, Math.PI * 2), rampOf('#F6C3AA'), -15, 15);
  shapeTop(c, () => { c.moveTo(-15, -2); c.quadraticCurveTo(-16, -18, 2, -18); c.quadraticCurveTo(16, -18, 14, -6); c.quadraticCurveTo(0, -10, -15, -2); c.closePath(); }, rampOf('#3F2A1E'), -18, -2);
  c.fillStyle = '#1A1010'; c.fillRect(-8, -4, 5, 4); c.fillRect(4, -4, 5, 4); c.fillStyle = '#5A0E14'; c.fillRect(-4, 5, 11, 4); c.fillStyle = '#FFFFFF'; c.fillRect(-3, 5, 9, 1.4);
  c.restore();
  c.save(); c.translate(52, yt - 4); c.rotate(1.57); shape(c, () => c.roundRect(-5, -6, 10, 12, 2), rampOf('#F8F8F0'), -5, 5); c.fillStyle = '#DC2626'; c.fillRect(-4, -2, 8, 3); c.restore();
  c.fillStyle = '#5A3A1A'; c.beginPath(); c.ellipse(64, yt - 1, 8, 1.6, 0, 0, Math.PI * 2); c.fill();
  // (him: hanging, the feet off the desk, the trousers bloody, the shoes dangling)
  const ny = yt - 154;
  limb(c, mx - 7, ny + 74, 6, mx - 9, ny + 114, 5, SUIT, 0, 1); limb(c, mx + 8, ny + 74, 6, mx + 10, ny + 116, 5, SUIT, 0, 1);
  c.fillStyle = BLOOD[1]; c.fillRect(mx + 6, ny + 92, 5, 24); c.fillRect(mx - 11, ny + 100, 3, 14);
  shapeTop(c, () => c.roundRect(mx - 16, ny + 110, 13, 8, [2, 4, 1, 1]), rampOf('#1F2430'), ny + 110, ny + 118);
  shapeTop(c, () => c.roundRect(mx + 5, ny + 112, 13, 8, [2, 4, 1, 1]), rampOf('#1F2430'), ny + 112, ny + 120);
  // (the fat suit, slashed through: the foam bulging out yellow, him under it bleeding)
  shape(c, () => c.ellipse(mx, ny + 46, 25, 33, 0, 0, Math.PI * 2), SUIT, mx - 25, mx + 25);
  c.fillStyle = '#F2F2F8'; c.beginPath(); c.moveTo(mx - 5, ny + 15); c.lineTo(mx + 6, ny + 15); c.lineTo(mx, ny + 34); c.closePath(); c.fill();
  shape(c, () => { c.moveTo(mx - 2.5, ny + 17); c.lineTo(mx + 3, ny + 17); c.lineTo(mx + 4, ny + 44); c.lineTo(mx, ny + 48); c.lineTo(mx - 4, ny + 44); c.closePath(); }, rampOf('#F59E0B'), mx - 4, mx + 4);
  for (const [sx, sy, len, ang] of [[mx - 8, ny + 52, 30, 0.9], [mx + 10, ny + 36, 24, -0.7], [mx - 2, ny + 66, 20, 0.3]] as [number, number, number, number][]) {
    c.save(); c.translate(sx, sy); c.rotate(ang);
    for (let k = -1; k <= 1; k++) { c.fillStyle = BLOOD[0]; c.fillRect(-len / 2, k * 5 - 2, len, 4); shapeTop(c, () => c.ellipse(0, k * 5, len / 2 - 2, 2.2, 0, 0, Math.PI * 2), FOAM, k * 5 - 2, k * 5 + 2); c.fillStyle = BLOOD[2]; c.fillRect(-len / 4, k * 5 + 1, len / 2, 1); }
    c.restore();
  }
  drips(c, mx - 18, ny + 50, ny + 90, 30, 4, 39);
  // (the arms hanging, the golden mic still in his fist)
  limb(c, mx - 20, ny + 26, 5, mx - 26, ny + 70, 4.5, SUIT, 0, 1); limb(c, mx + 20, ny + 26, 5, mx + 26, ny + 70, 4.5, SUIT, 0, 1);
  for (const hx0 of [mx - 26, mx + 26]) { c.fillStyle = '#F2F2F8'; c.fillRect(hx0 - 3, ny + 66, 6, 3); shape(c, () => c.arc(hx0, ny + 74, 4.6, 0, Math.PI * 2), rampOf('#C8A0A8'), hx0 - 5, hx0 + 5); }
  goldMic(c, mx + 28, ny + 84, 2.8);
  // (the cord: off the boom's end, knotted, round his neck; the headphones tangled in it)
  c.strokeStyle = '#0C0B10'; c.lineWidth = 3; c.beginPath(); c.moveTo(mx, yt - 226); c.lineTo(mx + 1, ny + 6); c.stroke();
  for (let k = 0; k < 4; k++) { c.fillStyle = '#18181B'; c.beginPath(); c.ellipse(mx + 1, yt - 222 + k * 5, 3.5, 2.5, 0, 0, Math.PI * 2); c.fill(); }
  c.strokeStyle = '#2A2830'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(mx + 26, ny + 80); c.quadraticCurveTo(mx + 40, ny + 40, mx + 6, ny + 14); c.stroke();
  c.strokeStyle = '#0C0B10'; c.lineWidth = 3; c.beginPath(); c.arc(mx - 4, ny + 20, 11, Math.PI * 1.2, Math.PI * 1.9); c.stroke();
  shape(c, () => c.roundRect(mx - 18, ny + 12, 7, 10, 2), rampOf('#2A2830'), mx - 18, mx - 11);
  // (the head: lolled over, purple, the tongue out, the eyes bulging half shut, the cord biting into the neck)
  c.save(); c.translate(mx + 6, ny - 2); c.rotate(0.45);
  shape(c, () => c.ellipse(0, 0, 15, 16, 0, 0, Math.PI * 2), PURP, -15, 15);
  shapeTop(c, () => c.ellipse(-2, -10, 14, 7, 0, Math.PI, 0), rampOf('#3F2A1E'), -17, -10);
  for (const ex of [-5, 6]) { c.fillStyle = '#F2E2E2'; c.beginPath(); c.ellipse(ex, -3, 3.4, 2.6, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#C81E2E'; c.fillRect(ex - 3, -3, 6, 0.8); c.fillStyle = PURP[3]; c.fillRect(ex - 4, -6, 8, 2.6); c.fillStyle = '#111'; c.fillRect(ex, -2, 1.5, 1.5); }
  shape(c, () => c.ellipse(3, 11, 4.5, 7, 0.2, 0, Math.PI * 2), rampOf('#B5677A'), -1, 8);
  c.fillStyle = '#3A1A2A'; c.fillRect(-4, 6, 12, 2);
  c.restore();
  c.strokeStyle = '#0C0B10'; c.lineWidth = 3.4; c.beginPath(); c.ellipse(mx + 2, ny + 12, 12, 4, 0, 0, Math.PI * 2); c.stroke();
  c.fillStyle = BLOOD[2]; c.fillRect(mx - 6, ny + 14, 2, 9); c.fillRect(mx + 9, ny + 15, 1.5, 6);
};

// ---------------------------------------------------------------------------------------------------------------
// Dole, on the cabinet table

/** The Dole actor on his back across the cabinet table (its left a, right b, top y), the floor fy. */
export const drawDoleBody = (c: Ctx, a: number, b: number, top: number, fy: number) => {
  const w = Math.round(b - a), yt = Math.round(top - fy);
  c.save(); c.translate(Math.round(a), Math.round(fy));
  stamp(c, `wh2-body-dole-${w}-${yt}`, -80, yt - 60, w + 150, -yt + 70, g => paintDole(g, w, yt));
  c.restore();
};
/** (local: x from the table's left, the floor at 0; the table's top at yt) Part two's SNES pass: on his back across the
 *  table, his head off the near end: the pineapple split down into his skull to the crown (the bone's edges white, the
 *  brain showing, juice and blood), the gray wig knocked half off his own thin hair, the rubber chin peeled and hanging;
 *  the suit slashed; BOB DOLE buttons pinned into his chest (each bleeding through the shirt); the right arm hanging off
 *  the edge, the pen still in his fist; the legs over the far end; the blood across the table and down its front in
 *  sheets, a pool on the floor, pineapple chunks in it, a button rolled off. */
const paintDole = (c: Ctx, w: number, yt: number) => {
  const SUIT = rampOf('#7A808C'), SKIN = rampOf('#E2B496'), mx = w / 2;
  bloodPool(c, mx - 40, yt, 170, 41);
  drips(c, 20, yt + 2, -4, 120, 7, 43); drips(c, 160, yt + 2, yt + 40, 60, 3, 45);
  bloodPool(c, mx - 50, 0, 150, 47);
  // (the legs over the far end, the shoes; a sock)
  limb(c, mx + 40, yt - 10, 5, w + 10, yt - 4, 4.5, SUIT, 0, 1); limb(c, w + 10, yt - 4, 4.5, w + 18, yt + 30, 4, SUIT, 0, 1);
  limb(c, mx + 40, yt - 6, 5, w - 4, yt - 2, 4.5, SUIT, 0, 1);
  shapeTop(c, () => c.roundRect(w + 11, yt + 28, 14, 7, [2, 4, 1, 1]), rampOf('#1F2430'), yt + 28, yt + 35);
  shape(c, () => c.roundRect(w - 7, yt - 9, 8, 13, 2), rampOf('#1F2430'), w - 7, w + 1);
  // (the long body in steps, slashed; the shirt open, the tie askew; the buttons pinned in, each bleeding)
  shapeTop(c, () => c.ellipse(mx + 6, yt - 12, 41, 13.5, 0, 0, Math.PI * 2), SUIT, yt - 26, yt + 2);
  c.fillStyle = '#F2F2F8'; c.beginPath(); c.moveTo(mx - 28, yt - 18); c.lineTo(mx - 4, yt - 23); c.lineTo(mx - 12, yt - 8); c.closePath(); c.fill();
  c.fillStyle = BLOOD[2]; c.fillRect(mx - 20, yt - 20, 8, 6);
  shape(c, () => { c.moveTo(mx - 26, yt - 16); c.lineTo(mx - 2, yt - 18); c.lineTo(mx - 2, yt - 14); c.lineTo(mx - 24, yt - 12); c.closePath(); }, rampOf('#B91C1C'), mx - 26, mx - 2);
  for (const [dx, dy] of [[-6, -19], [10, -15], [24, -21], [36, -14]] as [number, number][]) { c.fillStyle = BLOOD[1]; c.beginPath(); c.ellipse(mx + dx, yt + dy + 4, 4, 2.6, 0, 0, Math.PI * 2); c.fill(); campaignButton(c, mx + dx, yt + dy, 0.6); c.fillStyle = '#9CA3AF'; c.fillRect(mx + dx + 6, yt + dy - 1, 4, 1); c.fillStyle = BLOOD[2]; c.fillRect(mx + dx - 1, yt + dy + 3, 2, 7); }
  for (const [sx, sy, len, ang] of [[mx + 4, yt - 9, 36, 0.15], [mx + 30, yt - 18, 22, -0.3]] as [number, number, number, number][]) { c.save(); c.translate(sx, sy); c.rotate(ang); for (let k = -1; k <= 1; k++) { c.fillStyle = BLOOD[0]; c.fillRect(-len / 2, k * 4 - 1.5, len, 3); c.fillStyle = MUSCLE; c.fillRect(-len / 2 + 2, k * 4 - 0.5, len - 4, 1.4); c.fillStyle = SUIT[0]; c.fillRect(-len / 2, k * 4 - 2.5, len, 1); } c.restore(); }
  // (the right arm off the near edge, the pen still in his fist)
  limb(c, mx - 22, yt - 6, 4.5, mx - 26, yt + 30, 4, SUIT, 0, 1);
  c.fillStyle = '#F2F2F8'; c.fillRect(mx - 29, yt + 27, 6, 3);
  shape(c, () => c.arc(mx - 26, yt + 34, 4.2, 0, Math.PI * 2), SKIN, mx - 31, mx - 21);
  c.strokeStyle = '#0C0B10'; c.lineWidth = 3.4; c.beginPath(); c.moveTo(mx - 29, yt + 31); c.lineTo(mx - 21, yt + 44); c.stroke(); c.strokeStyle = '#2A2830'; c.lineWidth = 1.6; c.stroke(); c.fillStyle = '#C8961E'; c.fillRect(mx - 28, yt + 31, 2, 2);
  // (the head off the near end: the face up, the skull split by the pineapple wedged in it (bone white at the edges, the
  // brain gray-pink, juice in the blood), the gray wig knocked half off his own thin hair, the rubber chin peeled)
  const hx = 10, hy = yt - 8;
  shape(c, () => c.ellipse(hx, hy, 14.5, 13.5, 0, 0, Math.PI * 2), SKIN, hx - 15, hx + 15);
  c.fillStyle = '#5A4A3A'; c.beginPath(); c.ellipse(hx - 9, hy - 2, 6, 9, 0, 0, Math.PI * 2); c.fill();
  c.save(); c.translate(hx - 20, hy - 14); c.rotate(-0.9);
  shapeTop(c, () => { c.moveTo(-12, 4); c.quadraticCurveTo(-14, -10, 2, -10); c.quadraticCurveTo(14, -10, 12, 2); c.quadraticCurveTo(0, -2, -12, 4); c.closePath(); }, rampOf('#C8CCD4'), -10, 4);
  c.fillStyle = '#9CA3AF'; c.fillRect(-8, -3, 14, 1); c.fillStyle = BLOOD[1]; c.fillRect(-2, 0, 8, 3);
  c.restore();
  c.fillStyle = BLOOD[0]; c.beginPath(); c.moveTo(hx - 13, hy - 11); c.lineTo(hx + 2, hy + 3); c.lineTo(hx + 13, hy - 13); c.closePath(); c.fill();
  c.fillStyle = '#C8A0A0'; c.beginPath(); c.moveTo(hx - 9, hy - 10); c.lineTo(hx + 1, hy - 1); c.lineTo(hx + 9, hy - 11); c.closePath(); c.fill();
  c.fillStyle = '#A88080'; for (let k = 0; k < 3; k++) c.fillRect(hx - 6 + k * 4, hy - 8 + (k % 2), 3, 1);
  for (const [bx, by] of [[-12, -10], [10, -12], [-6, -12], [6, -13]] as [number, number][]) { c.fillStyle = '#EDE6D6'; c.fillRect(hx + bx, hy + by, 3, 2); c.fillStyle = '#FFFFFF'; c.fillRect(hx + bx, hy + by, 1, 1); }
  pineapple(c, hx, hy - 14, -0.15, 1.15);
  c.fillStyle = 'rgba(252,211,77,0.55)'; c.beginPath(); c.ellipse(hx + 2, hy - 2, 7, 3, 0, 0, Math.PI * 2); c.fill();
  for (const ex of [-6, 4]) { c.fillStyle = '#F8F4EC'; c.beginPath(); c.arc(hx + ex, hy + 3, 2.8, 0, Math.PI * 2); c.fill(); c.fillStyle = '#C81E2E'; c.fillRect(hx + ex - 2, hy + 2, 4, 0.7); c.fillStyle = '#111'; c.fillRect(hx + ex - 0.5, hy + 2.5, 1.5, 1.5); }
  c.fillStyle = '#3A0A0A'; c.beginPath(); c.ellipse(hx - 1, hy + 9, 4, 2.4, 0, 0, Math.PI * 2); c.fill();
  c.save(); c.translate(hx + 6, hy + 14); c.rotate(0.5); shapeTop(c, () => c.roundRect(-6, 0, 12, 14, [2, 2, 6, 6]), rampOf('#F2C4A4'), 0, 14); c.fillStyle = BLOOD[2]; c.fillRect(-6, 0, 12, 2); c.restore();
  splatter(c, hx, hy - 8, 34, 20, 53);
  drips(c, hx - 10, yt + 2, -2, 16, 4, 57);
  // (on the floor: pineapple chunks in the blood, a button rolled off, the spare pineapple)
  for (let k = 0; k < 5; k++) { const cx = -60 + k * 22 + hash(k) * 10; c.fillStyle = '#E2A818'; c.beginPath(); c.moveTo(cx - 4, -1); c.lineTo(cx, -7); c.lineTo(cx + 4, -1); c.closePath(); c.fill(); c.fillStyle = '#FFF0A8'; c.fillRect(cx - 1, -5, 1, 2); }
  campaignButton(c, -40, -4, 0.3); pineapple(c, w + 50, -10, 1.4, 0.8);
};

// ---------------------------------------------------------------------------------------------------------------
// The mean men's actors

const fake = { vel: { x: 0, y: 0 }, health: 0, aiState: '', hitFlash: 0, pauseTimer: 0 } as unknown as Enemy;
/** One of the mean men's actors as he left them: lying where he killed them (x, the floor y), by kind, the seed (who). */
export const drawDeadActor = (c: Ctx, kind: string, seed: number, x: number, fy: number, flip: boolean, f: number) => {
  if (kind === 'm2:ct_blimp') {
    // (the spy blimp, crashed: the envelope crumpled on its side, the gondola cracked, bleeding anyway)
    bloodPool(c, x, fy, 60, seed);
    c.save(); c.translate(x, fy - 12); c.rotate(0.25); c.scale(1, 0.75);
    drawBlimp(c, { ...fake, aiState: '', hitFlash: 0 } as Enemy, 0);
    c.restore();
    return;
  }
  const back = hash(seed) < 0.6;
  bloodPool(c, x + (flip ? -10 : 10), fy, 70 + hash(seed * 3) * 30, seed);
  // (on his back, head one way; or on his face, head the other)
  c.save(); c.translate(x, fy - 11); c.scale(flip ? -1 : 1, 1); c.rotate(back ? -Math.PI / 2 : Math.PI / 2);
  if (kind === 'm2:ct_goon') drawGoon(c, fake, f, seed);
  else if (kind === 'm2:ct_lobbyist') drawLobbyist(c, fake, f, seed);
  else if (kind === 'm2:ct_pollster') drawPollster(c, fake, f, seed);
  else paintDeadNew(c, kind, seed);
  c.restore();
  clawMarks(c, x + (flip ? 8 : -8), fy - 10, 26, (hash(seed * 5) - 0.5) * 1.2);
  splatter(c, x + (flip ? -30 : 30), fy - 6, 22, 8, seed);
  // (part one's SNES pass: what each of the mean men's actors dropped where he died, in his blood; a throat opened by the
  // claws, where his head is)
  const hx = x + (back ? -66 : 66) * (flip ? -1 : 1), s = flip ? -1 : 1;
  c.fillStyle = BLOOD[0]; c.beginPath(); c.ellipse(hx * 0.6 + x * 0.4, fy - 4, 10, 3, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = MUSCLE; c.fillRect(hx * 0.6 + x * 0.4 - 4, fy - 6, 8, 2);
  if (kind === 'm2:ct_goon') {
    // (the dark glasses snapped at the bridge, a lens out; the earpiece's coil torn out of his collar)
    c.fillStyle = '#0A0A0E'; c.fillRect(hx + s * 20, fy - 3, 9, 3); c.fillRect(hx + s * 32, fy - 4, 8, 3); c.fillStyle = '#9CA3AF'; c.fillRect(hx + s * 21, fy - 3, 2, 1);
    c.strokeStyle = '#E5E7EB'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(hx - s * 6, fy - 4); for (let k = 0; k < 5; k++) c.quadraticCurveTo(hx - s * (8 + k * 4), fy - 8, hx - s * (10 + k * 4), fy - 3); c.stroke();
  } else if (kind === 'm2:ct_lobbyist') {
    // (the briefcase burst open, its bills soaked through red, scattered)
    const bx = x + s * 44;
    c.fillStyle = '#5A3416'; c.fillRect(bx - 12, fy - 10, 24, 10); c.fillStyle = '#7C4A1E'; c.fillRect(bx - 12, fy - 10, 24, 2); c.fillStyle = '#FACC15'; c.fillRect(bx - 9, fy - 6, 2, 2); c.fillRect(bx + 7, fy - 6, 2, 2);
    c.fillStyle = '#4A2A10'; c.fillRect(bx - 12, fy - 22, 24, 12);
    for (let k = 0; k < 9; k++) { const ux = x + (hash(seed + k * 7) - 0.3) * 120 * s, red = k % 3 !== 0; c.fillStyle = red ? '#7A3A2A' : '#86EFAC'; c.fillRect(ux, fy - 2 - (k % 2), 9, 3); c.fillStyle = red ? BLOOD[1] : '#166534'; c.fillRect(ux + 3, fy - 2 - (k % 2), 3, 3); }
  } else if (kind === 'm2:ct_pollster') {
    // (the clipboard snapped, its tally soaked; the glasses crushed; the pencil)
    c.save(); c.translate(x + s * 40, fy - 3); c.rotate(0.1 * s);
    c.fillStyle = '#A16207'; c.fillRect(-8, -3, 7, 3); c.fillRect(1, -3, 7, 3); c.fillStyle = '#F8FAFC'; c.fillRect(-6, -3, 5, 2); c.fillStyle = BLOOD[2]; c.fillRect(1, -3, 5, 2);
    c.restore();
    c.strokeStyle = '#1A1028'; c.lineWidth = 1.2; c.beginPath(); c.arc(hx + s * 14, fy - 3, 2.6, 0, Math.PI); c.arc(hx + s * 21, fy - 3, 2.6, Math.PI * 0.2, Math.PI * 1.1); c.stroke();
    c.fillStyle = '#FACC15'; c.fillRect(hx - s * 18, fy - 2, 9, 2); c.fillStyle = '#1A1028'; c.fillRect(hx - s * 18 + (s > 0 ? 0 : 8), fy - 2, 1, 2);
  } else if (kind === 'm2:ct_spindoc') {
    // (the head mirror cracked on the floor, the press releases soaked red round him, his pens)
    c.fillStyle = '#9AA4B4'; c.beginPath(); c.arc(hx + s * 20, fy - 3, 4, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#3A3A48'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(hx + s * 18, fy - 6); c.lineTo(hx + s * 21, fy - 3); c.lineTo(hx + s * 19, fy); c.stroke();
    for (let k = 0; k < 6; k++) { const ux = x + (hash(seed + k * 5) - 0.4) * 110 * s, red = k % 2 === 0; c.fillStyle = red ? '#C8A0A0' : '#F8F8F0'; c.fillRect(ux, fy - 2, 11, 3); c.fillStyle = red ? BLOOD[1] : '#6A6A7A'; c.fillRect(ux + 2, fy - 2, red ? 6 : 7, 1); }
    c.fillStyle = '#DC2626'; c.fillRect(x + s * 36, fy - 2, 8, 1.6); c.fillStyle = '#2563EB'; c.fillRect(x + s * 46, fy - 1, 7, 1.6);
  } else if (kind === 'm2:ct_ditto') {
    // (the transistor radio smashed, its batteries out, its antenna bent; the red cap)
    const rx = x + s * 42;
    c.fillStyle = '#8A94A4'; c.fillRect(rx - 10, fy - 9, 20, 9); c.fillStyle = '#C0C6CF'; c.fillRect(rx - 10, fy - 9, 20, 2); c.fillStyle = '#3A4250'; c.fillRect(rx - 8, fy - 6, 8, 5);
    c.strokeStyle = '#E5E7EB'; c.lineWidth = 1; c.beginPath(); c.moveTo(rx + 8, fy - 9); c.lineTo(rx + 14, fy - 16); c.lineTo(rx + 22, fy - 14); c.stroke();
    for (let k = 0; k < 2; k++) { c.fillStyle = '#1A1A22'; c.fillRect(rx - 26 + k * 9, fy - 3, 7, 3); c.fillStyle = '#D8B040'; c.fillRect(rx - 26 + k * 9, fy - 3, 2, 3); }
    c.fillStyle = '#B91C1C'; c.beginPath(); c.ellipse(hx - s * 20, fy - 3, 8, 4, 0, Math.PI, 0); c.fill(); c.fillStyle = '#991B1B'; c.fillRect(hx - s * 20 + (s > 0 ? 4 : -12), fy - 2, 8, 2);
  }
};

/** The Chelsea actress's wig and her mess (a later visit: she's gone). */
export const drawWigAndMess = (c: Ctx, x: number, fy: number) => {
  // (her mess dried at the edges, banded, chunks in it; the wig dropped in it, its curls stepped, the wig cap's mesh;
  // the pink headband; a Mary Jane kicked off; the costume's white collar torn off)
  c.fillStyle = '#7A6A2A'; c.beginPath(); c.ellipse(x + 20, fy + 1, 37, 5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#B9A548'; c.beginPath(); c.ellipse(x + 20, fy, 34, 4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#CFC066'; c.beginPath(); c.ellipse(x + 14, fy - 1, 20, 2.5, 0, 0, Math.PI * 2); c.fill();
  for (let k = 0; k < 5; k++) { c.fillStyle = k % 2 ? '#8A6A2A' : '#E8D88A'; c.fillRect(x + 4 + k * 9, fy - 1 + (k % 2), 3, 2); }
  c.fillStyle = '#D8D0C0'; c.fillRect(x - 14, fy - 1, 14, 2); for (let k = 0; k < 6; k++) c.fillRect(x - 14 + k * 2, fy - 2, 1, 1);
  for (const [dx, dy, r] of [[-12, -6, 5], [-6, -9, 5.5], [1, -7, 5], [-9, -3, 4.5], [5, -4, 4], [-16, -2, 4]] as [number, number, number][]) { c.fillStyle = '#8A4A1E'; c.beginPath(); c.arc(x + dx - 20, fy + dy + 1, r + 1, 0, Math.PI * 2); c.fill(); c.fillStyle = '#C9793A'; c.beginPath(); c.arc(x + dx - 20, fy + dy, r, 0, Math.PI * 2); c.fill(); c.fillStyle = '#E8A15C'; c.beginPath(); c.arc(x + dx - 21, fy + dy - 1, r * 0.65, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FFD2A0'; c.fillRect(x + dx - 23, fy + dy - 3, 2, 1); }
  c.fillStyle = '#D9468E'; c.fillRect(x - 31, fy - 13, 18, 3); c.fillStyle = '#F9A8D4'; c.fillRect(x - 30, fy - 13, 10, 1);
  c.fillStyle = '#1A1A24'; c.fillRect(x - 60, fy - 5, 12, 5); c.fillStyle = '#3A3A48'; c.fillRect(x - 58, fy - 5, 5, 1); c.fillRect(x - 54, fy - 7, 1, 3);
  c.fillStyle = '#F8FAFC'; c.beginPath(); c.moveTo(x + 52, fy); c.quadraticCurveTo(x + 60, fy - 6, x + 70, fy); c.closePath(); c.fill();
};
export { contract, gavel };
