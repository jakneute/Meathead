// Ned's skeletons, drawn (park4/skeletons.ts): weak, cheap, and they know it. A man's bones, yellowed, a little too
// thin, held together by nothing; the skull's jaw hangs (it rattles). The ARCHER: a bow (a bent stick and a string,
// a quiver of three arrows on its back), a leather scrap of a helmet. The MAGE: a moth-eaten pointed hood, a stick
// for a wand; the hand it casts from lit (red for fire, pale blue for ice). The DOG: a dog's bones, a wagging tail,
// sat down mostly. Each rises up out of the ground (clipped at the ground line as it comes up). Every elbow and knee
// from art/limb.ts. Feet at the origin, facing right, about 74 tall; stamped per pose.

import { stamp } from '../../../m1/game/render/stamp';
import { elbow, knee, reachTo } from '../../art/limb';
import { ell, px, line } from '../../cartoon/amphi/paint';

type Ctx = CanvasRenderingContext2D;
type P = [number, number];
export type SkelKind = 'archer' | 'mage' | 'plain' | 'dog';
export type SkelPose = 'stand' | 'draw' | 'shoot' | 'cast' | 'walk' | 'bark';
export const SKEL_H = 74, SKEL_W = 26;

const BONE = '#E4D8B8', BONE_D = '#B4A47E', BONE_L = '#FFF8E4', INK = '#3A2E1A';

const bone = (c: Ctx, a: P, b: P, w = 2.6) => {
  line(c, [a[0], a[1], b[0], b[1]], w + 1.6, INK); line(c, [a[0], a[1], b[0], b[1]], w, BONE);
  line(c, [a[0] - 0.6, a[1] - 0.4, b[0] - 0.6, b[1] - 0.4], 0.8, BONE_L);
  for (const q of [a, b]) { ell(c, q[0], q[1], w * 0.9, w * 0.9, INK); ell(c, q[0], q[1], w * 0.7, w * 0.7, BONE); }
};
const UA = 15, FA = 15, TH = 16, SH = 16;

/** A skeleton: archer, mage or plain, in a pose, `q` 0..7 its sway. `fire`: the mage's cast is fire (else ice). */
export const paintSkel = (g: Ctx, kind: Exclude<SkelKind, 'dog'>, pose: SkelPose, q: number, fire = true) => {
  const sway = Math.sin((q / 8) * Math.PI * 2) * 1.2;
  const hip: P = [0, -36], sh: P = [2 + sway, -60], hd: P = [5 + sway, -68];
  let hN: P = [8, -36], hF: P = [-6, -36];
  if (kind === 'archer' && (pose === 'draw' || pose === 'shoot')) { hN = [24, -58]; hF = pose === 'draw' ? [2, -58] : [10, -58]; }
  if (kind === 'mage' && pose === 'cast') { hN = [20, -74]; hF = [-10, -46]; }
  // (the far leg and arm)
  const leg = (hp: P, f: P) => { const e = reachTo(hp[0], hp[1], f[0], f[1] - 2, TH, SH), k = knee(hp[0], hp[1], e[0], e[1], TH, SH, 1); bone(g, hp, k); bone(g, k, e, 2.2); px(g, e[0] - 2, f[1] - 3, 8, 3, BONE_D); };
  const arm = (s: P, h: P) => { const e = reachTo(s[0], s[1], h[0], h[1], UA, FA), el = elbow(s[0], s[1], e[0], e[1], UA, FA, 1); bone(g, s, el, 2.2); bone(g, el, e, 1.8); ell(g, e[0], e[1], 2.4, 2, BONE); return e; };
  if (kind === 'archer') {
    // (the quiver on its back, three arrows)
    px(g, sh[0] - 12, sh[1] - 4, 6, 20, '#6A4A2A'); for (let k = 0; k < 3; k++) line(g, [sh[0] - 10 + k * 2, sh[1] - 4, sh[0] - 12 + k * 2, sh[1] - 12], 1, '#A88A5A');
  }
  arm([sh[0] - 3, sh[1] + 2], hF);
  leg([hip[0] - 3, hip[1]], [-7, 0]);
  // (the spine, the ribs, the pelvis)
  bone(g, hip, sh, 2.4);
  for (let k = 0; k < 4; k++) { const y = sh[1] + 4 + k * 4.6; line(g, [sh[0] - 7 + k * 0.4, y + 1, sh[0] + 7 - k * 0.6, y], 3, INK); line(g, [sh[0] - 7 + k * 0.4, y + 1, sh[0] + 7 - k * 0.6, y], 1.8, BONE); }
  ell(g, hip[0], hip[1] + 1, 7, 4, INK); ell(g, hip[0], hip[1] + 1, 6, 3, BONE); ell(g, hip[0], hip[1] + 1.4, 2.4, 1.4, INK);
  leg([hip[0] + 3, hip[1]], [8, 0]);
  // (the skull: the jaw hanging; the eye holes; the archer's leather cap, the mage's hood)
  if (kind === 'mage') { g.fillStyle = '#3A2A5A'; g.beginPath(); g.moveTo(hd[0] - 10, hd[1] + 8); g.lineTo(hd[0] - 4, hd[1] - 20); g.lineTo(hd[0] + 10, hd[1] + 6); g.closePath(); g.fill(); px(g, sh[0] - 8, sh[1] - 2, 16, 4, '#3A2A5A'); }
  ell(g, hd[0], hd[1], 7, 6.6, INK); ell(g, hd[0], hd[1], 6, 5.6, BONE); ell(g, hd[0] - 1.6, hd[1] - 1.6, 2.6, 2, BONE_L);
  ell(g, hd[0] + 2, hd[1], 1.8, 2, INK); ell(g, hd[0] - 2.4, hd[1], 1.6, 1.8, INK); px(g, hd[0] + 3.6, hd[1] + 2.6, 1, 1.4, INK);
  const jaw = pose === 'bark' || pose === 'cast' ? 3 : 1.4 + Math.abs(sway);
  px(g, hd[0] - 2, hd[1] + 4 + jaw, 8, 2.4, BONE_D); for (let k = 0; k < 4; k++) px(g, hd[0] - 1 + k * 2, hd[1] + 4, 1, 1.6, BONE_L);
  if (kind === 'archer') { g.fillStyle = '#7A5A3A'; g.beginPath(); g.ellipse(hd[0], hd[1] - 3, 7, 4, 0, Math.PI, 0); g.fill(); }
  const h = arm([sh[0] + 3, sh[1] + 2], hN);
  if (kind === 'archer') {
    // (the bow, held out front; the string, drawn back to the far hand on a draw; an arrow on it)
    const bx = (pose === 'draw' || pose === 'shoot') ? h[0] : h[0] + 2, by = (pose === 'draw' || pose === 'shoot') ? h[1] : h[1] - 4;
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(bx - 8, by, 14, -1.1, 1.1); g.stroke();
    g.strokeStyle = '#8A6A3A'; g.lineWidth = 1.8; g.beginPath(); g.arc(bx - 8, by, 14, -1.1, 1.1); g.stroke();
    const sx = pose === 'draw' ? hF[0] + 2 : bx - 2;
    line(g, [bx - 2, by - 12.4, sx, by, bx - 2, by + 12.4], 0.6, '#F5F5F4');
    if (pose === 'draw') { line(g, [sx, by, bx + 8, by], 1.2, '#A88A5A'); px(g, bx + 7, by - 1.5, 3, 3, '#9CA3AF'); }
  } else if (kind === 'mage') {
    // (the stick for a wand; the hand lit)
    line(g, [h[0], h[1], h[0] + 6, h[1] - 8], 1.6, '#6A4A2A');
    if (pose === 'cast') { ell(g, h[0] + 6, h[1] - 10, 5, 5, fire ? '#F97316' : '#7DD3FC'); ell(g, h[0] + 6, h[1] - 10, 2.4, 2.4, fire ? '#FDE047' : '#F0F9FF'); }
  }
};

/** The dog: a dog's bones, sat (or trotting), the tail going. */
export const paintDog = (g: Ctx, pose: SkelPose, q: number) => {
  const tr = pose === 'walk', ph = (q / 8) * Math.PI * 2;
  const back: P = [-14, tr ? -26 : -18], front: P = [10, -28];
  const leg = (hp: P, f: P) => { const e = reachTo(hp[0], hp[1], f[0], f[1], 9, 9), k = knee(hp[0], hp[1], e[0], e[1], 9, 9, -1); bone(g, hp, k, 2); bone(g, k, e, 1.8); };
  // (the tail, wagging)
  const tw = Math.sin(ph * 2) * 5;
  line(g, [back[0], back[1], back[0] - 8, back[1] - 8 + tw, back[0] - 12, back[1] - 14 + tw], 2.6, INK); line(g, [back[0], back[1], back[0] - 8, back[1] - 8 + tw, back[0] - 12, back[1] - 14 + tw], 1.4, BONE);
  leg(back, tr ? [-18 + Math.sin(ph) * 5, 0] : [-6, 0]);
  leg(front, [8 + (tr ? Math.sin(ph + Math.PI) * 5 : 0), 0]);
  bone(g, back, front, 2.4);
  for (let k = 0; k < 4; k++) { const x = back[0] + 6 + k * 5, y = back[1] + (front[1] - back[1]) * ((k + 1) / 5); line(g, [x, y, x + 1, y + 9], 2.4, INK); line(g, [x, y, x + 1, y + 9], 1.4, BONE); }
  leg([back[0] + 2, back[1] + 1], tr ? [-14 + Math.sin(ph + Math.PI) * 5, 0] : [-2, 0]);
  leg([front[0] - 2, front[1] + 1], [12 + (tr ? Math.sin(ph) * 5 : 0), 0]);
  // (the skull: long snout, the jaw open on a bark)
  const hx = front[0] + 8, hy = front[1] - 6;
  ell(g, hx, hy, 6, 5, INK); ell(g, hx, hy, 5, 4, BONE); px(g, hx + 2, hy - 1, 9, 4, BONE); px(g, hx + 2, hy - 1, 9, 1, INK);
  px(g, hx + 2, hy + (pose === 'bark' ? 5 : 3), 8, 2, BONE_D);
  ell(g, hx + 1, hy - 1, 1.4, 1.4, INK);
  g.fillStyle = BONE; g.beginPath(); g.moveTo(hx - 4, hy - 3); g.lineTo(hx - 2, hy - 9); g.lineTo(hx + 1, hy - 4); g.closePath(); g.fill();
};

/** One in the world: (x, feet), facing, rising `rise` 0..1 (clipped at the ground till it's up). */
export const drawSkel = (c: Ctx, kind: SkelKind, x: number, feet: number, face: 1 | -1, pose: SkelPose, q: number, rise = 1, fire = true) => {
  c.save(); c.translate(Math.round(x), Math.round(feet));
  if (rise < 1) { c.beginPath(); c.rect(-60, -200, 120, 200); c.clip(); c.translate(0, Math.round((1 - rise) * (kind === 'dog' ? 40 : SKEL_H + 6))); }
  if (face < 0) c.scale(-1, 1);
  if (kind === 'dog') stamp(c, `wp4-dog-${pose}-${q}`, -40, -50, 80, 54, g => paintDog(g, pose, q));
  else stamp(c, `wp4-skel-${kind}-${pose}-${q}-${fire ? 1 : 0}`, -40, -100, 80, 104, g => paintSkel(g, kind, pose, q, fire));
  c.restore();
  // (the dirt it's coming up through)
  if (rise < 1) { c.fillStyle = '#5A4A3A'; for (let i = 0; i < 5; i++) c.fillRect(Math.round(x - 14 + i * 7), Math.round(feet - 3 - ((i * 3) % 4)), 5, 3); }
};
