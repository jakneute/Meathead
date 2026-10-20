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
import { shape, shapeTop, rampOf } from '../amphi/paint';

type Ctx = CanvasRenderingContext2D;

const BLOOD = ['#3F0606', '#5B0A0A', '#7F1010', '#9B1515'];
const MUSCLE = '#9F1D2A', MUSCLE_DK = '#6B0F1A', MUSCLE_LT = '#C23B45', FASCIA = '#E9C9BD', FAT = '#E8C987', BONE = '#EDE6D6';
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
const muscleLimb = (c: Ctx, ax: number, ay: number, bx: number, by: number, w: number) => {
  c.lineCap = 'round';
  c.strokeStyle = MUSCLE_DK; c.lineWidth = w + 2; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
  c.strokeStyle = MUSCLE; c.lineWidth = w; c.stroke();
  // (the muscle's grain along it, a tendon at the end)
  c.strokeStyle = MUSCLE_LT; c.lineWidth = 1;
  const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  for (const o of [-w * 0.25, w * 0.15]) { c.beginPath(); c.moveTo(ax + nx * o, ay + ny * o); c.lineTo(bx + nx * o * 0.6, by + ny * o * 0.6); c.stroke(); }
  c.strokeStyle = FASCIA; c.lineWidth = 1.4; c.beginPath(); c.moveTo(ax + dx * 0.75, ay + dy * 0.75); c.lineTo(bx, by); c.stroke();
  c.lineCap = 'butt';
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

/** The Newt actor, flayed, on his back on the floor (feet y), his head at x (left), his feet off to the right. */
export const drawNewtBody = (c: Ctx, x: number, y: number) => {
  const SKIN = '#E9B9A0';
  bloodPool(c, x + 44, y, 170, 11);
  clawMarks(c, x - 40, y + 3, 40, 0.08); clawMarks(c, x + 120, y + 4, 34, -0.1);
  // (strips of his skin everywhere round him)
  for (let k = 0; k < 9; k++) skinStrip(c, x - 50 + k * 22 + hash(k) * 10, y - 1 - hash(k * 3) * 3, 10 + hash(k * 5) * 10, (hash(k * 7) - 0.5) * 1.4, SKIN);
  // (the rubber Newt face, peeled off and dropped, and the white helmet wig)
  c.save(); c.translate(x - 62, y - 7); c.rotate(-0.3);
  c.fillStyle = '#F5BFA5'; c.beginPath(); c.ellipse(0, 0, 13, 8, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#2A1A16'; c.fillRect(-7, -3, 4, 3); c.fillRect(3, -3, 4, 3); c.fillRect(-3, 3, 7, 2);
  c.fillStyle = BLOOD[2]; c.fillRect(-12, 3, 8, 2);
  c.restore();
  c.save(); c.translate(x + 154, y - 8); c.rotate(0.4);
  c.fillStyle = '#F1F5F9'; c.beginPath(); c.ellipse(0, 0, 14, 8, 0, Math.PI, 0); c.fill(); c.fillStyle = '#CBD5E1'; c.fillRect(-12, -2, 24, 2);
  c.fillStyle = BLOOD[1]; c.fillRect(-6, -1, 9, 2);
  c.restore();
  // (the legs: the trousers shredded, raw shins showing, a shoe off)
  muscleLimb(c, x + 70, y - 12, x + 128, y - 8, 10); muscleLimb(c, x + 70, y - 8, x + 124, y - 3, 10);
  c.fillStyle = '#1E2A4A'; c.fillRect(x + 66, y - 18, 34, 18);
  for (let k = 0; k < 5; k++) { c.fillStyle = '#1E2A4A'; c.beginPath(); c.moveTo(x + 98 + k * 2, y - 18 + k * 4); c.lineTo(x + 110 + hash(k) * 8, y - 16 + k * 4); c.lineTo(x + 98 + k * 2, y - 14 + k * 4); c.fill(); }
  c.fillStyle = '#0B0B0F'; c.fillRect(x + 124, y - 14, 10, 7);
  c.fillStyle = BONE; c.fillRect(x + 120, y - 4, 7, 4);
  // (the torso: the suit jacket torn open and in rags, the chest skinned: muscle, the ribs white through it)
  c.fillStyle = MUSCLE_DK; c.beginPath(); c.ellipse(x + 40, y - 14, 34, 15, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = MUSCLE; c.beginPath(); c.ellipse(x + 40, y - 15, 31, 12, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = BONE; c.lineWidth = 2;
  for (let k = 0; k < 6; k++) { const rx = x + 20 + k * 7; c.beginPath(); c.moveTo(rx, y - 24); c.quadraticCurveTo(rx + 3, y - 15, rx, y - 7); c.stroke(); }
  c.strokeStyle = MUSCLE_LT; c.lineWidth = 1; for (let k = 0; k < 6; k++) { const rx = x + 23 + k * 7; c.beginPath(); c.moveTo(rx, y - 22); c.lineTo(rx + 1, y - 9); c.stroke(); }
  c.fillStyle = FAT; c.fillRect(x + 8, y - 26, 4, 2); c.fillRect(x + 66, y - 22, 3, 10);
  // (the suit's rags, either side, the tie hanging off him)
  c.fillStyle = '#1E3A8A';
  c.beginPath(); c.moveTo(x + 8, y - 4); c.lineTo(x + 16, y - 28); c.lineTo(x + 22, y - 20); c.lineTo(x + 18, y - 4); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(x + 60, y - 2); c.lineTo(x + 70, y - 26); c.lineTo(x + 74, y - 4); c.closePath(); c.fill();
  c.fillStyle = '#DC2626'; c.beginPath(); c.moveTo(x + 30, y - 26); c.lineTo(x + 50, y - 2); c.lineTo(x + 44, y - 1); c.lineTo(x + 26, y - 24); c.closePath(); c.fill();
  // (the arms, flung out, skinned to the wrists)
  muscleLimb(c, x + 18, y - 22, x - 4, y - 38, 8); muscleLimb(c, x + 60, y - 22, x + 82, y - 34, 8);
  c.fillStyle = MUSCLE; c.beginPath(); c.arc(x - 6, y - 40, 4.5, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(x + 84, y - 36, 4.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = BONE; for (let k = 0; k < 4; k++) { c.fillRect(x - 12 + k * 2, y - 46 + (k % 2), 1.5, 5); c.fillRect(x + 86 + k * 2, y - 42 + (k % 2), 1.5, 5); }
  // (the head: lidless, lipless, the face a red mask, the teeth bare in a grin, the eyes staring; the scalp raw)
  const hx = x, hy = y - 14;
  c.fillStyle = MUSCLE_DK; c.beginPath(); c.ellipse(hx, hy, 15, 14, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = MUSCLE; c.beginPath(); c.ellipse(hx, hy - 1, 13.5, 12.5, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = MUSCLE_LT; c.lineWidth = 1; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(hx - 10, hy + k * 4); c.quadraticCurveTo(hx, hy + k * 4 - 2, hx + 10, hy + k * 4); c.stroke(); }
  for (const ey of [-5, 5]) { c.fillStyle = '#F8F4EC'; c.beginPath(); c.arc(hx - 4, hy + ey, 3.6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#3B2A1A'; c.beginPath(); c.arc(hx - 5, hy + ey, 1.4, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#C2410C'; c.lineWidth = 0.6; c.beginPath(); c.arc(hx - 4, hy + ey, 3.2, 0.2, 1.4); c.stroke(); }
  c.fillStyle = BONE; c.fillRect(hx + 6, hy - 6, 4, 12);
  c.fillStyle = MUSCLE_DK; for (let k = 0; k < 5; k++) c.fillRect(hx + 6, hy - 5 + k * 2.5, 4, 0.8);
  c.fillStyle = '#3F0606'; c.beginPath(); c.ellipse(hx + 1, hy, 1.5, 2.6, 0, 0, Math.PI * 2); c.fill();
  splatter(c, hx - 14, hy + 6, 16, 10, 41);
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
  const SUIT = '#1E2A4A', mx = (a + b) / 2;
  // (the boom: a stand behind the desk, the arm out over it)
  c.strokeStyle = '#3F3F46'; c.lineWidth = 5; c.beginPath(); c.moveTo(b + 20, fy); c.lineTo(b + 20, top - 200); c.lineTo(mx, top - 220); c.stroke();
  c.strokeStyle = '#71717A'; c.lineWidth = 2; c.stroke();
  c.fillStyle = '#27272A'; c.fillRect(b + 6, fy - 4, 30, 4);
  // (the cord down to his neck)
  c.strokeStyle = '#18181B'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(mx, top - 220); c.lineTo(mx + 2, top - 154); c.stroke();
  // (the cigar on the desk still smoking; blood dripped on the desk)
  cigar(c, a + 18, top - 3, 0, true);
  c.strokeStyle = 'rgba(214,211,209,0.6)'; c.lineWidth = 1.5; for (let k = 0; k < 3; k++) { const t = ((f + k * 20) % 60) / 60; c.beginPath(); c.arc(a + 28 + Math.sin(t * 5) * 3, top - 8 - t * 40, 1.5 + t * 3, 0, Math.PI * 2); c.stroke(); }
  bloodPool(c, mx + 6, top, 50, 31);
  drips(c, b - 30, top + 2, top + 30, 26, 3, 33);
  // (him: the big body hanging limp, feet off the desk, the shoes dangling)
  const ny = top - 152;
  c.strokeStyle = SUIT; c.lineWidth = 10; c.lineCap = 'round';
  c.beginPath(); c.moveTo(mx - 6, ny + 74); c.lineTo(mx - 8, ny + 112); c.stroke(); c.beginPath(); c.moveTo(mx + 8, ny + 74); c.lineTo(mx + 10, ny + 114); c.stroke();
  c.lineCap = 'butt';
  c.fillStyle = '#0B0B0F'; c.fillRect(mx - 14, ny + 110, 12, 7); c.fillRect(mx + 6, ny + 112, 12, 7);
  c.fillStyle = SUIT; c.beginPath(); c.ellipse(mx, ny + 46, 24, 32, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#F8FAFC'; c.beginPath(); c.moveTo(mx - 5, ny + 16); c.lineTo(mx + 6, ny + 16); c.lineTo(mx, ny + 34); c.closePath(); c.fill();
  c.fillStyle = '#F59E0B'; c.fillRect(mx - 2, ny + 18, 5, 26);
  clawMarks(c, mx - 6, ny + 50, 30, 0.9); clawMarks(c, mx + 8, ny + 34, 22, -0.7);
  // (the arms hanging, the golden mic still in his fist)
  c.strokeStyle = SUIT; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(mx - 20, ny + 26); c.lineTo(mx - 26, ny + 70); c.stroke(); c.beginPath(); c.moveTo(mx + 20, ny + 26); c.lineTo(mx + 26, ny + 70); c.stroke(); c.lineCap = 'butt';
  c.fillStyle = '#E8BC9E'; c.beginPath(); c.arc(mx - 26, ny + 73, 4.4, 0, Math.PI * 2); c.arc(mx + 26, ny + 73, 4.4, 0, Math.PI * 2); c.fill();
  goldMic(c, mx + 28, ny + 82, 2.8);
  // (the head: lolled over, purple, the tongue out, the eyes half shut, the cord biting into the neck)
  const hx = mx + 6, hy = ny - 2;
  c.save(); c.translate(hx, hy); c.rotate(0.45);
  c.fillStyle = '#8E5A86'; c.beginPath(); c.ellipse(0, 0, 15, 16, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#3F2A1E'; c.beginPath(); c.ellipse(-2, -12, 14, 6, 0, Math.PI, 0); c.fill();
  c.fillStyle = '#5E3A58'; c.fillRect(-6, -4, 5, 2); c.fillRect(4, -4, 5, 2);
  c.fillStyle = '#B5677A'; c.beginPath(); c.ellipse(3, 10, 4, 6, 0.2, 0, Math.PI * 2); c.fill();
  c.restore();
  c.strokeStyle = '#18181B'; c.lineWidth = 3; c.beginPath(); c.ellipse(mx + 2, ny + 12, 12, 4, 0, 0, Math.PI * 2); c.stroke();
  c.fillStyle = BLOOD[2]; c.fillRect(mx - 6, ny + 14, 2, 8);
};

// ---------------------------------------------------------------------------------------------------------------
// Dole, on the cabinet table

/** The Dole actor on his back across the cabinet table (its left a, right b, top y), the floor fy. */
export const drawDoleBody = (c: Ctx, a: number, b: number, top: number, fy: number) => {
  const SUIT = '#6B7280', mx = (a + b) / 2;
  bloodPool(c, mx - 30, top, 150, 41);
  drips(c, a + 40, top + 2, fy - 4, 120, 6, 43);
  bloodPool(c, mx - 10, fy, 120, 47);
  // (the legs over the far end, the shoes)
  c.strokeStyle = SUIT; c.lineWidth = 8; c.lineCap = 'round';
  c.beginPath(); c.moveTo(mx + 40, top - 10); c.lineTo(b + 10, top - 4); c.lineTo(b + 18, top + 30); c.stroke();
  c.beginPath(); c.moveTo(mx + 40, top - 6); c.lineTo(b - 4, top - 2); c.stroke();
  c.lineCap = 'butt';
  c.fillStyle = '#111827'; c.fillRect(b + 12, top + 28, 12, 7); c.fillRect(b - 6, top - 8, 7, 12);
  // (the long body, the buttons pinned into his chest, blood at each)
  c.fillStyle = SUIT; c.beginPath(); c.ellipse(mx + 6, top - 12, 40, 13, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#F8FAFC'; c.beginPath(); c.moveTo(mx - 26, top - 18); c.lineTo(mx - 6, top - 22); c.lineTo(mx - 12, top - 10); c.closePath(); c.fill();
  c.fillStyle = '#B91C1C'; c.fillRect(mx - 24, top - 16, 22, 3);
  for (const [dx, dy] of [[-6, -18], [10, -14], [24, -20]] as [number, number][]) { campaignButton(c, mx + dx, top + dy, 0.6); c.fillStyle = BLOOD[2]; c.fillRect(mx + dx - 1, top + dy + 3, 2, 6); }
  clawMarks(c, mx + 4, top - 10, 34, 0.15);
  // (the right arm off the near edge, the pen still in the hand)
  c.strokeStyle = SUIT; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(mx - 20, top - 6); c.lineTo(mx - 24, top + 30); c.stroke(); c.lineCap = 'butt';
  c.fillStyle = '#E8BC9E'; c.beginPath(); c.arc(mx - 24, top + 33, 4, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#1F2937'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(mx - 26, top + 31); c.lineTo(mx - 20, top + 42); c.stroke();
  // (the head off the near end of the table, the pineapple split down into the skull, the crown up out of it)
  const hx = a + 10, hy = top - 8;
  c.fillStyle = '#E8BC9E'; c.beginPath(); c.ellipse(hx, hy, 14, 13, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#D1D5DB'; c.beginPath(); c.ellipse(hx + 4, hy - 4, 10, 9, 0, Math.PI * 1.1, Math.PI * 1.9); c.fill();
  c.fillStyle = '#3F0606'; c.beginPath(); c.moveTo(hx - 12, hy - 10); c.lineTo(hx + 2, hy + 2); c.lineTo(hx + 12, hy - 12); c.closePath(); c.fill();
  pineapple(c, hx, hy - 12, -0.15, 1.1);
  c.fillStyle = '#EDE6D6'; c.fillRect(hx - 9, hy - 6, 3, 2); c.fillRect(hx + 7, hy - 7, 3, 2);
  c.fillStyle = '#F8F4EC'; c.beginPath(); c.arc(hx - 6, hy + 3, 2.6, 0, Math.PI * 2); c.arc(hx + 4, hy + 3, 2.6, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#111'; c.fillRect(hx - 6.5, hy + 2.5, 1.5, 1.5); c.fillRect(hx + 4, hy + 3, 1.5, 1.5);
  splatter(c, hx, hy - 8, 30, 16, 53);
  drips(c, hx - 10, top + 2, fy - 2, 14, 3, 57);
  // (a pineapple's chunks on the floor, a button rolled off)
  campaignButton(c, a - 30, fy - 4, 0.3); pineapple(c, b + 40, fy - 10, 1.4, 0.8);
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
  }
};

/** The Chelsea actress's wig and her mess (a later visit: she's gone). */
export const drawWigAndMess = (c: Ctx, x: number, fy: number) => {
  c.fillStyle = '#B9A548'; c.beginPath(); c.ellipse(x + 20, fy, 34, 4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#CFC066'; c.beginPath(); c.ellipse(x + 14, fy - 1, 20, 2.5, 0, 0, Math.PI * 2); c.fill();
  for (const [dx, dy, r] of [[-12, -6, 5], [-6, -9, 5.5], [1, -7, 5], [-9, -3, 4.5], [5, -4, 4]] as [number, number, number][]) { c.fillStyle = '#C9793A'; c.beginPath(); c.arc(x + dx - 20, fy + dy, r, 0, Math.PI * 2); c.fill(); c.fillStyle = '#E8A15C'; c.beginPath(); c.arc(x + dx - 21, fy + dy - 1, r * 0.6, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = '#F472B6'; c.fillRect(x - 30, fy - 12, 16, 3);
};
export { contract, gavel };
