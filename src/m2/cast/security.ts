// Happy Land's park security, in Meathead 2's own style (the cast kit): a sky-blue polo with the park's star on the
// chest, navy cargo pants, a ball cap, a radio on the shoulder, a lanyard and a pass, a flashlight and a nightstick on
// the belt. No gun. A mixed bunch, by where each was put (its seed): men and women, every skin, thin and heavy, bald,
// gray, ponytails, mustaches, beards, glasses. Feet at the origin, facing right; the engine turns them round.
// Fighting (e.melee: see copMelee): the nightstick off the belt, back over the head (the tell), down hard.

import type { Enemy } from '../../m1/types';
import { type Ctx, INK, dk, lt, blob, rect, dot, legs, torso, arm, head, eyes, mouth, nose, specs, walking, strideOf } from './kit';
import { stamp } from '../../m1/game/render/stamp';
import { elbow, knee } from '../art/limb';

const SKINS = ['#F6DCC8', '#F0C8A2', '#D9A877', '#A86B43', '#6E4426', '#F4C2B0'];
const HAIR = ['#1F1611', '#4A2E1A', '#A16207', '#D6D3D1', '#7F1D1D', '#111827'];
const POLO = '#60A5FA', PANTS = '#1E293B', CAP = '#1E3A8A';

const star = (c: Ctx, x: number, y: number, r: number, col: string) => {
  c.fillStyle = col; c.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  c.closePath(); c.fill();
};

/** Who this one is, from the seed: the same every time it's drawn. */
const lookOf = (seed: number) => ({
  woman: Math.floor(seed / 4) % 5 < 2,
  skin: SKINS[((Math.floor(seed) % SKINS.length) + SKINS.length) % SKINS.length],
  hair: HAIR[((Math.floor(seed / 7) % HAIR.length) + HAIR.length) % HAIR.length],
  heavy: seed % 3 === 0,
  face: Math.floor(seed / 3) % 4, // 0 plain, 1 mustache, 2 beard, 3 glasses
  bald: Math.floor(seed / 11) % 6 === 0,
});

/** Is this one a woman (for her voice)? */
export const isWomanGuard = (e: Enemy) => lookOf(Math.abs(Math.round(e.homeX || 0))).woman;

export const drawSecurity = (c: Ctx, e: Enemy, f: number) => {
  // (the walk out at closing time: sat on a folding chair, bored stiff, waiting for everybody to go: drawSeated)
  if ((e as Enemy & { seated?: boolean }).seated && e.health > 0 && !e.isBlownAway && !e.melee) { drawSeated(c, e, f); return; }
  // (on the move, the stride kept to how far they've actually gone: strolling their beat, or coming at him)
  const st = strideOf(e, e.pos.x, f, e.health > 0 && !e.isBlownAway && Math.abs(e.vel.y) < 0.5);
  if (st.amt <= 0 || e.melee) { walking(c, st.ph, e.melee ? 0 : st.amt, () => guard(c, e, f, true)); return; }
  // (walking: the frames stamped, an eighth of a stride apiece, by who it is and the mood they're in)
  const seed = Math.abs(Math.round(e.homeX || 0)), k = ((Math.round(st.ph / (Math.PI / 4)) % 8) + 8) % 8, amt = Math.round(st.amt * 4) / 4;
  stamp(c, `m2sec-${seed}-${e.puppet ? 1 : 0}-${amt}-${k}`, -36, -100, 80, 110, g => walking(g, k * (Math.PI / 4), amt, () => guard(g, e, 0, false)));
};
const guard = (c: Ctx, e: Enemy, f: number, stood: boolean) => {
  const seed = Math.abs(Math.round(e.homeX || 0));
  const L = lookOf(seed);
  const w = L.heavy && !L.woman ? 30 : L.woman ? 20 : 24, hipW = L.heavy && !L.woman ? 26 : L.woman ? 20 : 20;
  // Legs: navy cargo pants (a pocket on each, stood), black work shoes, striding when he walks
  legs(c, -30, 4.5, 7, PANTS, L.skin, '#111827', 'pants', 10);
  if (stood) for (const s of [-1, 1]) dot(c, s * 4.5 - 2.5, -20, 5, 4, dk(PANTS, 0.3));
  // The far arm, the body (a belly on some), the belt
  arm(c, -w / 2 + 3, -52, -w / 2, -32, POLO, L.skin, 0.4, 6);
  torso(c, -30, -56, w, hipW + (L.heavy && !L.woman ? 6 : 0), POLO);
  if (L.heavy && !L.woman) blob(c, () => c.ellipse(4, -38, 13, 9, 0, 0, Math.PI * 2), POLO, -9, 17);
  dot(c, -1, -56, 2, 8, dk(POLO, 0.3));
  // (the collar, the park's star on the chest, the lanyard and the pass)
  blob(c, () => { c.moveTo(-6, -56); c.lineTo(0, -52); c.lineTo(6, -56); c.lineTo(3, -57); c.lineTo(0, -55); c.lineTo(-3, -57); c.closePath(); }, lt(POLO, 0.2), -6, 6, 1);
  star(c, 6, -47, 2.8, '#FACC15');
  c.strokeStyle = '#DC2626'; c.lineWidth = 1; c.beginPath(); c.moveTo(-3, -55); c.lineTo(-1, -44); c.lineTo(2, -55); c.stroke();
  rect(c, -3, -45, 5, 6, '#F8FAFC', 1); dot(c, -2, -44, 3, 1.2, '#1E3A8A');
  rect(c, -w / 2 - 1, -32, w + 2, 4, '#111827', 1); dot(c, -1.5, -31.5, 3, 3, '#CBD5E1');
  // (the radio on his shoulder, its aerial)
  rect(c, -w / 2 + 1, -57, 4, 7, '#18181B', 1); dot(c, -w / 2 + 2, -61, 1, 4, '#4B5563');
  // The head: the face by the look, the cap
  const hy = -66;
  if (L.woman && !L.bald) blob(c, () => { c.moveTo(-6, hy - 4); c.quadraticCurveTo(-15, hy + 2, -11, hy + 14); c.quadraticCurveTo(-8, hy + 5, -4, hy); c.closePath(); }, L.hair, -15, -4);
  head(c, 1, hy, 8.5, 9.5, L.skin);
  if (!L.bald) dot(c, -7, hy - 3, 3, L.woman ? 8 : 4, L.hair);
  eyes(c, 2.5, hy - 1, 3.6, e.puppet ? 'smug' : 'angry', f, 0.6, 2.2, dk(L.skin, 0.1));
  if (L.face === 3) specs(c, 2.5, hy - 1, 3.6, 2.8, '#18181B', 'square');
  nose(c, 6, hy + 2.5, 2.2, L.skin);
  if (!L.woman && L.face === 1) blob(c, () => c.roundRect(2, hy + 4.4, 8, 2.4, 1), L.hair === '#D6D3D1' ? '#9CA3AF' : L.hair, 2, 10, 1);
  if (!L.woman && L.face === 2) blob(c, () => { c.moveTo(-5, hy + 2); c.quadraticCurveTo(2, hy + 14, 9, hy + 3); c.lineTo(8, hy + 6); c.quadraticCurveTo(2, hy + 10, -3, hy + 5); c.closePath(); }, L.hair, -5, 9, 1);
  mouth(c, 4, hy + 6.5, 5, e.puppet ? 'flat' : 'frown', f);
  if (L.woman) dot(c, 2.5, hy + 6, 3, 1, '#DC2626');
  // (the cap, the star on it, the bill out front)
  blob(c, () => { c.moveTo(-8, hy - 4); c.quadraticCurveTo(-7, hy - 13, 1, hy - 13); c.quadraticCurveTo(9, hy - 13, 9.5, hy - 4); c.closePath(); }, CAP, -8, 9.5);
  blob(c, () => { c.moveTo(4, hy - 4.6); c.lineTo(15, hy - 4.6); c.quadraticCurveTo(16, hy - 2.6, 12, hy - 2.2); c.lineTo(4, hy - 3); c.closePath(); }, dk(CAP, 0.3), 4, 16, 1);
  star(c, 3, hy - 8.5, 2.4, '#FACC15');
  // The near arm: hand on the nightstick at his hip, or the nightstick out and swinging
  if (e.melee) {
    const m = e.melee;
    const a = m.state === 'windup' ? -0.6 - Math.min(1, m.t / 10) * 1.7 : m.state === 'strike' ? -2.3 + Math.min(1, m.t / 3) * 3.1 : 0.9;
    c.save(); c.translate(w / 2 - 4, -51); c.rotate(a);
    arm(c, 0, 0, 11, 0, POLO, L.skin, 0.4, 6);
    rect(c, 10, -2.2, 22, 4.4, '#111827', 1.5); dot(c, 12, -1.6, 18, 0.8, '#4B5563');
    c.restore();
    if (m.state === 'strike' && m.t < 5) { c.strokeStyle = 'rgba(255, 255, 255, 0.5)'; c.lineWidth = 4; c.beginPath(); c.arc(w / 2 - 4, -51, 30, -1.9, 0.6); c.stroke(); }
    return;
  }
  rect(c, w / 2 - 3, -32, 3.4, 17, '#111827', 1.2);
  arm(c, w / 2 - 3, -52, w / 2, -32, POLO, L.skin, 0.4, 6);
  void INK;
};

// ---------------------------------------------------------------------------------------------------------------
// Sat down (the prologue of the epilogue: the park closing, the walk out to his truck, intro/walkOut.ts): on a folding
// chair at their post, bored, waiting on everybody to leave so they can go home. Three ways to wait, by the seed: chin
// on a fist (elbow on the knee), on the phone (head down, its glow on the face), slumped back (arms hanging, head back).
// Now and then a yawn. Feet at the origin, facing right, like the rest; the knees and elbows from art/limb.ts.

export type SeatPose = 'chin' | 'phone' | 'slump';
export const seatPoseOf = (e: Enemy): SeatPose => (['chin', 'phone', 'slump'] as const)[Math.abs(Math.round(e.homeX || 0)) % 3];
/** A guard's yawn: on for a second now and then, different for each. */
const yawning = (seed: number, f: number) => (f + seed * 37) % 900 < 50;

const drawSeated = (c: Ctx, e: Enemy, f: number) => {
  const seed = Math.abs(Math.round(e.homeX || 0)), pose = seatPoseOf(e), yawn = yawning(seed, f) ? 1 : 0;
  // (the phone's screen flickering a frame or two, as it scrolls)
  const glow = pose === 'phone' && ((f + seed) >> 4) % 4 === 0 ? 1 : 0;
  stamp(c, `m2sec-sit-${seed}-${pose}-${yawn}-${glow}`, -36, -92, 80, 98, g => seated(g, seed, pose, !!yawn, !!glow));
};
/** (the contact sheet) A sat guard drawn straight, no stamp. */
export const drawSeatedGuard = (c: Ctx, seed: number, pose: SeatPose, yawn = false) => seated(c, seed, pose, yawn, false);

/** A limb as an inked, filled segment (a thigh, a shin, an upper arm, a forearm), round ends. */
const bone = (c: Ctx, x0: number, y0: number, x1: number, y1: number, col: string, w: number) => {
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = w + 2.4; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  c.lineCap = 'butt';
};

/** The folding chair: its back behind him (first), or its legs crossed under the seat and the seat. Side on. */
const chair = (c: Ctx, back: boolean) => {
  const STEEL = '#64748B', SEAT = '#334155';
  // (steel tube, lit along one side; the seat and the back a molded slab, lit along the top, a shadow under, a scuff)
  const tube = (x0: number, y0: number, x1: number, y1: number) => { bone(c, x0, y0, x1, y1, STEEL, 2.2); c.strokeStyle = lt(STEEL, 0.45); c.lineWidth = 0.8; c.beginPath(); c.moveTo(x0 - 0.6, y0); c.lineTo(x1 - 0.6, y1); c.stroke(); };
  if (back) {
    tube(-12, -20, -15, -48);
    rect(c, -19, -52, 7, 16, SEAT, 1.5);
    dot(c, -18.5, -51.5, 6, 1.2, lt(SEAT, 0.35)); dot(c, -14, -50, 1.4, 12, dk(SEAT, 0.3));
    return;
  }
  tube(-12, -19, 8, -1); tube(6, -19, -12, -1);
  dot(c, -14, -1, 4, 1.2, dk(STEEL, 0.4)); dot(c, 5, -1, 4, 1.2, dk(STEEL, 0.4));
  rect(c, -14, -23, 24, 4, SEAT, 1.5);
  dot(c, -13, -23, 22, 1, lt(SEAT, 0.3)); dot(c, -13, -20, 22, 1, dk(SEAT, 0.35)); dot(c, 2, -22, 3, 1, lt(SEAT, 0.5));
};

const seated = (c: Ctx, seed: number, pose: SeatPose, yawn: boolean, glow: boolean) => {
  const L = lookOf(seed);
  const w = L.heavy && !L.woman ? 30 : L.woman ? 20 : 24;
  chair(c, true);
  // The legs: off the seat at the hip, the knee forward (limb.ts), the shin down to the shoe on the floor; the far one
  // a shade darker and a touch back
  const hipY = -22, thigh = 18, shin = 19;
  const leg = (s: number) => {
    const hx = -6 + (s < 0 ? -1 : 0), fx = (pose === 'slump' ? 24 : 18) + (s < 0 ? -4 : 0), fy = -3;
    const [kx, ky] = knee(hx, hipY, fx, fy, thigh, shin, 1);
    const col = s < 0 ? dk(PANTS, 0.12) : PANTS;
    bone(c, hx, hipY, kx, ky, col, 8); bone(c, kx, ky, fx, fy, col, 7);
    blob(c, () => c.roundRect(fx - 4, fy - 2, 10, 5, [2, 3, 1, 1]), '#111827', fx - 4, fx + 6);
  };
  leg(-1);
  chair(c, false);
  const tilt = pose === 'slump' ? -0.14 : pose === 'phone' ? 0.1 : 0.12;
  // The body off the hips: hunched over (the phone, the fist) or leant back (slumped)
  c.save(); c.translate(-2, hipY); c.rotate(tilt);
  const shY = -26;
  const sh = { x: -w / 2 + 5, y: shY + 4 }, nsh = { x: w / 2 - 5, y: shY + 4 };
  const UP = 11, FORE = 11;
  // (where each hand is: under the chin, holding the phone in the lap, or hanging down by the seat)
  const hand = (near: boolean): [number, number] =>
    pose === 'chin' ? (near ? [10, shY - 4] : [12, -1]) :
    pose === 'phone' ? (near ? [14, -10] : [12, -8]) :
    (near ? [w / 2 + 3, 5] : [-w / 2 + 1, 6]);
  const armAt = (from: { x: number; y: number }, near: boolean) => {
    const [hx, hy] = hand(near);
    const [ex, ey] = elbow(from.x, from.y, hx, hy, UP, FORE, 1);
    bone(c, from.x, from.y, ex, ey, near ? POLO : dk(POLO, 0.14), 6);
    bone(c, ex, ey, hx, hy, near ? L.skin : dk(L.skin, 0.12), 5);
    blob(c, () => c.arc(hx, hy, 3.2, 0, Math.PI * 2), L.skin, hx - 3, hx + 3, 1);
  };
  armAt(sh, false);
  torso(c, 0, shY, w, w - 4 + (L.heavy && !L.woman ? 6 : 0), POLO);
  if (L.heavy && !L.woman) blob(c, () => c.ellipse(5, -9, 13, 9, 0, 0, Math.PI * 2), POLO, -8, 18);
  star(c, 6, shY + 9, 2.8, '#FACC15');
  rect(c, -w / 2 - 1, -3, w + 2, 4, '#111827', 1);
  rect(c, -w / 2 + 1, shY - 1, 4, 7, '#18181B', 1);
  // (the near thigh's over the front of the body, sat side on: out of the body's turn for it, then back in)
  c.restore(); leg(1); c.save(); c.translate(-2, hipY); c.rotate(tilt);
  // The head: down over the phone, back with the mouth hanging open, or propped on the fist
  const hx = pose === 'phone' ? 4 : 2, hy = shY - 9 + (pose === 'phone' ? 2 : 0);
  c.save(); c.translate(hx, hy); c.rotate(pose === 'phone' ? 0.32 : pose === 'slump' ? -0.3 : 0.06);
  if (L.woman && !L.bald) blob(c, () => { c.moveTo(-6, -4); c.quadraticCurveTo(-15, 2, -11, 14); c.quadraticCurveTo(-8, 5, -4, 0); c.closePath(); }, L.hair, -15, -4);
  head(c, 0, 0, 8.5, 9.5, L.skin);
  if (!L.bald) dot(c, -8, -3, 3, L.woman ? 8 : 4, L.hair);
  eyes(c, 1.5, -1, 3.6, yawn ? 'closed' : pose === 'phone' ? 'tired' : 'droopy', 0, pose === 'phone' ? 0.6 : 0.3, 2.2, dk(L.skin, 0.1));
  if (L.face === 3) specs(c, 1.5, -1, 3.6, 2.8, '#18181B', 'square');
  nose(c, 5, 2.5, 2.2, L.skin);
  if (!L.woman && L.face === 1) blob(c, () => c.roundRect(1, 4.4, 8, 2.4, 1), L.hair === '#D6D3D1' ? '#9CA3AF' : L.hair, 1, 9, 1);
  if (!L.woman && L.face === 2) blob(c, () => { c.moveTo(-6, 2); c.quadraticCurveTo(1, 14, 8, 3); c.lineTo(7, 6); c.quadraticCurveTo(1, 10, -4, 5); c.closePath(); }, L.hair, -6, 8, 1);
  if (yawn) { c.fillStyle = '#4A1D1D'; c.beginPath(); c.ellipse(3.5, 7, 2.6, 3.4, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = INK; c.lineWidth = 1.2; c.stroke(); }
  else mouth(c, 3, 6.5, 5, pose === 'slump' ? 'o' : 'flat', 0);
  if (L.woman) dot(c, 1.5, 6, 3, 1, '#DC2626');
  blob(c, () => { c.moveTo(-9, -4); c.quadraticCurveTo(-8, -13, 0, -13); c.quadraticCurveTo(8, -13, 8.5, -4); c.closePath(); }, CAP, -9, 8.5);
  blob(c, () => { c.moveTo(3, -4.6); c.lineTo(14, -4.6); c.quadraticCurveTo(15, -2.6, 11, -2.2); c.lineTo(3, -3); c.closePath(); }, dk(CAP, 0.3), 3, 15, 1);
  star(c, 2, -8.5, 2.4, '#FACC15');
  c.restore();
  // The near arm over it all; the phone in the near hand, its screen lit
  armAt(nsh, true);
  if (pose === 'phone') {
    const [px, py] = hand(true);
    rect(c, px - 3, py - 8, 6, 9, '#0F172A', 1);
    dot(c, px - 2, py - 7, 4, 6, glow ? '#E0F2FE' : '#7DD3FC');
  }
  c.restore();
};
