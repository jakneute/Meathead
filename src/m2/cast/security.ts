// Happy Land's park security, in Meathead 2's own style (the cast kit): a sky-blue polo with the park's star on the
// chest, navy cargo pants, a ball cap, a radio on the shoulder, a lanyard and a pass, a flashlight and a nightstick on
// the belt. No gun. A mixed bunch, by where each was put (its seed): men and women, every skin, thin and heavy, bald,
// gray, ponytails, mustaches, beards, glasses. Feet at the origin, facing right; the engine turns them round.
// Fighting (e.melee: see copMelee): the nightstick off the belt, back over the head (the tell), down hard.

import type { Enemy } from '../../m1/types';
import { type Ctx, INK, dk, lt, blob, rect, dot, legs, torso, arm, head, eyes, mouth, nose, specs, walking, strideOf } from './kit';
import { stamp } from '../../m1/game/render/stamp';

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
