// THE LAZY RIVER's own cast, drawn (a crude first pass, readable: flat colors in a few steps, inked, every elbow and
// knee from art/limb.ts). Feet at the origin, facing right; stamped per look, pose and frame.
//
//   THE BURNOUTS  his crew: goth stoner kids, men and women, all skin tones, builds and hair (seeded): a black hoodie or a
//                 long coat, a band tee, ripped black jeans or a skirt and fishnets, big boots; eyeliner, a lip ring,
//                 a lighter and a joint. Slouched. Poses: stand, walk, flick (the tell: the lighter up, clicked), throw,
//                 inhale (the tell: the joint at the lips, cheeks puffing), blow, hurt.
//   THE IMPS      little fire devils up out of the river: a red pot belly, bat wings, stubby horns, a flame for hair,
//                 a spade-tipped tail. Poses: fly, tell (flaring up white-hot, arms up), throw, dive, hurt.

import { stamp } from '../../../m1/game/render/stamp';
import { elbow, knee, reachTo } from '../../art/limb';
import { mix } from '../../intro/art/kit';
import { FIRE } from './fire';

type Ctx = CanvasRenderingContext2D;
type P = [number, number];
const INK = '#0A0806';
const rnd = (n: number) => { const s = Math.sin(n * 91.7 + 13.1) * 43758.5453; return s - Math.floor(s); };
const lineP = (c: Ctx, a: P, b: P, w: number, col: string) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); };
/** A limb in two bones, inked: (root, joint, end), its color and its width. */
const bone2 = (c: Ctx, a: P, j: P, e: P, w: number, col: string) => {
  for (const [ww, cc] of [[w + 2, INK], [w, col]] as const) { c.strokeStyle = cc; c.lineWidth = ww; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(j[0], j[1]); c.lineTo(e[0], e[1]); c.stroke(); }
  c.strokeStyle = mix(col, '#FFFFFF', 0.25); c.lineWidth = Math.max(1, w * 0.3); c.beginPath(); c.moveTo(a[0] - 1, a[1]); c.lineTo(j[0] - 1, j[1]); c.stroke();
};
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string, rot = 0) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2); c.fill(); };
const rect = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };

// ---------------------------------------------------------------------------------------------------------------
// The burnouts

export interface BurnLook { woman: boolean; skin: string; hair: string; hairStyle: 0 | 1 | 2; coat: boolean; top: string; build: number; lip: boolean }
const SKINS = ['#F2E2D6', '#E8CDB8', '#C99A74', '#9A6A48', '#6E4A32', '#4A3022'];
const HAIRS = ['#0E0A10', '#1A1020', '#5B21B6', '#0E0A10', '#E8E2D0', '#166534', '#9F1239'];
export const burnLook = (seed: number): BurnLook => ({
  woman: rnd(seed) < 0.45, skin: SKINS[Math.floor(rnd(seed + 1) * SKINS.length)], hair: HAIRS[Math.floor(rnd(seed + 2) * HAIRS.length)],
  hairStyle: Math.floor(rnd(seed + 3) * 3) as 0 | 1 | 2, coat: rnd(seed + 4) < 0.45, top: rnd(seed + 5) < 0.5 ? '#18161C' : '#2A1630', build: 0.9 + rnd(seed + 6) * 0.25, lip: rnd(seed + 7) < 0.5,
});
export type BurnPose = 'stand' | 'walk' | 'flick' | 'throw' | 'inhale' | 'blow' | 'hurt';

const paintBurnout = (c: Ctx, L: BurnLook, pose: BurnPose, q: number) => {
  const ph = (q / 8) * Math.PI * 2, w = L.build;
  // (the skeleton: slouched, the head forward of the hips)
  let lean = 4, bob = 0, fN: P = [7, 0], fF: P = [-7, 0], hN: P = [12, -30], hF: P = [-8, -32];
  switch (pose) {
    case 'walk': fN = [Math.sin(ph) * 10, -Math.max(0, Math.sin(ph)) * 5]; fF = [-Math.sin(ph) * 10, -Math.max(0, -Math.sin(ph)) * 5]; hN = [10 - Math.sin(ph) * 6, -30]; hF = [-6 + Math.sin(ph) * 6, -32]; bob = -Math.abs(Math.sin(ph)) * 2; break;
    case 'flick': hN = [16, -62]; lean = 2; break;
    case 'throw': hN = [30, -52]; lean = 8; fN = [12, 0]; fF = [-10, 0]; break;
    case 'inhale': hN = [10, -57]; lean = -1; break;
    case 'blow': hN = [14, -40]; lean = 10; break;
    case 'hurt': lean = -8; hN = [-4, -48]; hF = [-18, -44]; break;
    default: break;
  }
  const hip: P = [0, -36 + bob], sh: P = [lean, -58 + bob], head: P = [lean + 4, -68 + bob];
  const jeans = L.woman && L.hairStyle === 2 ? '#141216' : '#1E1C24';
  // (the far leg, the far arm: darker)
  const leg = (f: P, near: boolean) => {
    const hp: P = [hip[0] + (near ? 3 : -3), hip[1]], an: P = [f[0], f[1] - 6];
    const kn = knee(hp[0], hp[1], an[0], an[1], 17, 17, 1), end = reachTo(hp[0], hp[1], an[0], an[1], 17, 17);
    const col = near ? jeans : mix(jeans, INK, 0.4);
    if (L.woman && L.hairStyle !== 0) {
      // (a skirt's legs: fishnets over the skin)
      bone2(c, hp, kn, end, 5 * w, mix(L.skin, INK, near ? 0.2 : 0.45));
      c.strokeStyle = 'rgba(10,8,6,0.6)'; c.lineWidth = 1; c.setLineDash([1, 2]); c.beginPath(); c.moveTo(hp[0], hp[1]); c.lineTo(kn[0], kn[1]); c.lineTo(end[0], end[1]); c.stroke(); c.setLineDash([]);
    } else bone2(c, hp, kn, end, 6 * w, col);
    // (the boot: big, laced, a thick sole)
    const bx = end[0], by = end[1] + 6;
    rect(c, bx - 5, by - 9, 12, 9, INK); rect(c, bx - 4, by - 8, 10, 6, near ? '#2A2630' : '#1A1820'); rect(c, bx - 6, by - 3, 15, 3, INK); rect(c, bx - 2, by - 8, 1, 5, '#6A6470');
  };
  const arm = (h: P, near: boolean, holding: boolean) => {
    const s: P = [sh[0] + (near ? 4 : -3), sh[1] + 2];
    const e = elbow(s[0], s[1], h[0], h[1], 13, 13, 1), end = reachTo(s[0], s[1], h[0], h[1], 13, 13);
    bone2(c, s, e, end, 5 * w, near ? (L.coat ? '#141218' : L.top) : mix(L.coat ? '#141218' : L.top, INK, 0.4));
    ell(c, end[0], end[1], 2.6, 2.6, INK); ell(c, end[0], end[1], 2, 2, mix(L.skin, INK, near ? 0 : 0.3));
    // (the black nails; the joint or the lighter in the near hand)
    if (holding && near) {
      if (pose === 'flick') { rect(c, end[0] - 1, end[1] - 6, 3, 6, '#DC2626'); rect(c, end[0] - 1, end[1] - 6, 3, 1, '#E5E7EB'); }
      else if (pose !== 'throw') { lineP(c, [end[0], end[1] - 1], [end[0] + 5, end[1] - 3], 2, '#F5F0E6'); rect(c, end[0] + 5, end[1] - 4, 2, 2, FIRE[3]); }
    }
  };
  leg(fF, false); arm(hF, false, false);
  // (the body: the coat (long, to the knee, open) or the hoodie; the band tee under)
  c.fillStyle = INK; c.beginPath(); c.moveTo(sh[0] - 9 * w, sh[1] - 1); c.lineTo(sh[0] + 9 * w, sh[1] - 1); c.lineTo(hip[0] + 9 * w, hip[1] + (L.coat ? 18 : 3)); c.lineTo(hip[0] - 10 * w, hip[1] + (L.coat ? 18 : 3)); c.closePath(); c.fill();
  c.fillStyle = L.coat ? '#1A1820' : L.top; c.beginPath(); c.moveTo(sh[0] - 8 * w, sh[1]); c.lineTo(sh[0] + 8 * w, sh[1]); c.lineTo(hip[0] + 8 * w, hip[1] + (L.coat ? 17 : 2)); c.lineTo(hip[0] - 9 * w, hip[1] + (L.coat ? 17 : 2)); c.closePath(); c.fill();
  // (the tee showing: a skull print, gray on black)
  rect(c, sh[0] - 3, sh[1] + 4, 8, 14, '#26242A');
  ell(c, sh[0] + 1, sh[1] + 9, 2.6, 2.4, '#9A94A4'); rect(c, sh[0] - 0.5, sh[1] + 9, 1, 1, INK); rect(c, sh[0] + 1.5, sh[1] + 9, 1, 1, INK);
  if (!L.coat) { rect(c, sh[0] - 7, sh[1] + 2, 2, 18, '#3A3644'); rect(c, sh[0] + 5, sh[1] + 2, 2, 18, '#3A3644'); }
  else { rect(c, sh[0] - 8 * w, sh[1] + 1, 2, 30, '#34303C'); }
  // (a studded belt)
  rect(c, hip[0] - 8, hip[1] - 1, 16, 3, INK); for (let k = 0; k < 4; k++) rect(c, hip[0] - 6 + k * 4, hip[1], 1, 1, '#C8C8D0');
  leg(fN, true);
  // (the head: pale-ish of its own skin, eyeliner raccoon rings, the half-lidded eyes, the hair over one eye)
  const [hx, hy] = head;
  ell(c, hx, hy, 8.5, 9.5, INK); ell(c, hx, hy, 7.5, 8.5, L.skin);
  ell(c, hx + 2, hy + 3, 5, 4, mix(L.skin, INK, 0.12));
  // (the eye: ringed black, a lid half down; the mouth: a flat line, the lip ring)
  ell(c, hx + 4, hy - 1, 2.8, 2.2, INK); rect(c, hx + 3, hy - 1, 3, 1, '#E8E2D8'); rect(c, hx + 4, hy - 1, 1, 1, '#4A2A5A');
  rect(c, hx + 2, hy - 3, 5, 1, mix(L.skin, INK, 0.35));
  if (pose === 'inhale') { ell(c, hx + 6, hy + 4, 2.4, 2, mix(L.skin, '#DC2626', 0.2)); }
  else if (pose === 'blow') { ell(c, hx + 7, hy + 4, 1.6, 1.6, INK); }
  else rect(c, hx + 3, hy + 4, 4, 1, '#3A1A2A');
  if (L.lip) { c.strokeStyle = '#C8C8D0'; c.lineWidth = 1; c.beginPath(); c.arc(hx + 5, hy + 5.5, 1.2, 0, Math.PI); c.stroke(); }
  if (pose === 'hurt') { rect(c, hx + 2, hy - 2, 5, 1, INK); ell(c, hx + 5, hy + 4, 2, 2.4, '#3A1A2A'); }
  // (the hair: dyed; straight down over one eye, a side shave, or a teased-up nest)
  c.fillStyle = L.hair;
  if (L.hairStyle === 0) { c.beginPath(); c.moveTo(hx - 8, hy + 6); c.quadraticCurveTo(hx - 9, hy - 10, hx + 2, hy - 10); c.quadraticCurveTo(hx + 10, hy - 9, hx + 8, hy + 2); c.lineTo(hx + 5, hy - 2); c.lineTo(hx + 2, hy + 3); c.lineTo(hx - 2, hy - 4); c.lineTo(hx - 6, hy + 10); c.closePath(); c.fill(); }
  else if (L.hairStyle === 1) { c.beginPath(); c.moveTo(hx - 7, hy - 2); c.quadraticCurveTo(hx - 4, hy - 13, hx + 6, hy - 10); c.lineTo(hx + 9, hy - 3); c.lineTo(hx + 3, hy - 6); c.lineTo(hx - 3, hy - 5); c.closePath(); c.fill(); rect(c, hx - 7, hy - 3, 2, 6, mix(L.hair, L.skin, 0.6)); }
  else { for (let k = 0; k < 7; k++) { const a = Math.PI + (k / 6) * Math.PI; ell(c, hx + Math.cos(a) * 7, hy - 4 + Math.sin(a) * 7, 4, 4, L.hair); } ell(c, hx - 7, hy + 4, 3, 6, L.hair); }
  // (the hood up over it, on a hoodie with the nest down)
  if (!L.coat && L.hairStyle === 1) { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(hx - 1, hy - 1, 10, Math.PI * 0.75, Math.PI * 1.9); c.stroke(); c.strokeStyle = L.top; c.lineWidth = 1.4; c.stroke(); }
  arm(hN, true, true);
};
const BURN_W = 34, BURN_H = 72;
export const drawBurnout = (c: Ctx, seed: number, L: BurnLook, pose: BurnPose, f: number) => {
  const q = pose === 'walk' ? Math.floor(f / 6) % 8 : 0;
  stamp(c, `wp2-burn-${seed % 64}-${pose}-${q}`, -BURN_W, -BURN_H - 16, BURN_W * 2 + 10, BURN_H + 22, g => paintBurnout(g, L, pose, q));
  // (live: the joint's cherry glowing on the inhale; a curl of smoke off it)
  if (pose === 'inhale') { c.fillStyle = f % 6 < 3 ? FIRE[4] : FIRE[3]; c.fillRect(17, -61, 3, 3); }
};

// ---------------------------------------------------------------------------------------------------------------
// The imps

export type ImpPose = 'fly' | 'tell' | 'throw' | 'dive' | 'hurt';
const IMP = ['#3A0A06', '#7F1D1D', '#B91C1C', '#DC2626', '#F87171'];
const paintImp = (c: Ctx, pose: ImpPose, q: number) => {
  const flap = Math.sin((q / 4) * Math.PI * 2), hot = pose === 'tell';
  const body = hot ? ['#7C2D12', '#C2410C', '#EA580C', '#FB923C', '#FED7AA'] : IMP;
  // (the wings: bat wings, flapping, the far one darker, behind)
  const wing = (s: number, col: string, line: string) => {
    const tipY = -30 - flap * 10 * s;
    c.fillStyle = line; c.beginPath(); c.moveTo(-2, -20); c.lineTo(-16, tipY - 2); c.lineTo(-22, -16 - flap * 4); c.lineTo(-14, -14); c.lineTo(-8, -10); c.closePath(); c.fill();
    c.fillStyle = col; c.beginPath(); c.moveTo(-3, -19); c.lineTo(-15, tipY); c.lineTo(-19, -16 - flap * 4); c.lineTo(-13, -15); c.lineTo(-7, -11); c.closePath(); c.fill();
  };
  wing(1, '#4A0E0A', INK);
  // (the tail: a curl off the back, spade-tipped)
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-6, -6); c.quadraticCurveTo(-18, 2, -16, -10); c.stroke(); c.strokeStyle = body[2]; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = INK; c.beginPath(); c.moveTo(-16, -10); c.lineTo(-20, -15); c.lineTo(-12, -14); c.closePath(); c.fill();
  // (the legs: little ones, clawed, tucked or trailing)
  const legP = (x: number, near: boolean) => { const h: P = [x, -6], f: P = pose === 'dive' ? [x - 6, 2] : [x + 2, 2]; const k = knee(h[0], h[1], f[0], f[1], 5, 5, 1); bone2(c, h, k, reachTo(h[0], h[1], f[0], f[1], 5, 5), 2.4, near ? body[2] : body[1]); };
  legP(-3, false); legP(3, true);
  // (the pot belly, the chest)
  ell(c, 0, -12, 11, 11, INK); ell(c, 0, -12, 10, 10, body[2]); ell(c, 2, -9, 6, 6, body[3]); ell(c, -3, -16, 3, 2.5, body[4]);
  // (the arms: up for the tell, flung forward on the throw, back on the dive)
  const armP = (s: P, h: P, near: boolean) => { const e = elbow(s[0], s[1], h[0], h[1], 6, 6, 1); bone2(c, s, e, reachTo(s[0], s[1], h[0], h[1], 6, 6), 2.6, near ? body[2] : body[1]); };
  const hN: P = pose === 'tell' ? [6, -32] : pose === 'throw' ? [16, -20] : pose === 'dive' ? [-6, -20] : pose === 'hurt' ? [-2, -30] : [9, -10];
  armP([-4, -18], pose === 'tell' ? [-6, -32] : [-8, -8], false);
  // (the head: horns, a wide grin of little teeth, yellow slit eyes; the flame for hair)
  ell(c, 3, -26, 8, 7, INK); ell(c, 3, -26, 7, 6, body[2]);
  c.fillStyle = INK; c.beginPath(); c.moveTo(-1, -30); c.lineTo(-4, -38); c.lineTo(2, -32); c.closePath(); c.fill(); c.beginPath(); c.moveTo(5, -31); c.lineTo(8, -39); c.lineTo(9, -31); c.closePath(); c.fill();
  rect(c, 4, -28, 3, 2, '#FDE047'); rect(c, 5, -28, 1, 2, INK);
  rect(c, 2, -23, 7, 2, INK); for (let k = 0; k < 3; k++) rect(c, 3 + k * 2, -23, 1, 1, '#FFF7D6');
  if (pose === 'hurt') { rect(c, 4, -28, 3, 1, INK); }
  wing(-0.7, '#7F1D1D', INK);
  armP([5, -18], hN, true);
  // (a fireball in hand on the tell: glowing up)
  if (pose === 'tell') { ell(c, hN[0], hN[1] - 3, 5, 5, FIRE[2]); ell(c, hN[0], hN[1] - 3, 3, 3, FIRE[4]); }
};
export const drawImp = (c: Ctx, pose: ImpPose, f: number) => {
  const q = Math.floor(f / 4) % 4;
  stamp(c, `wp2-imp-${pose}-${q}`, -26, -44, 52, 50, g => paintImp(g, pose, q));
  // (its hair: a live flame, flickering, flaring white-hot on the tell)
  const big = pose === 'tell' ? 1.6 : 1;
  c.fillStyle = FIRE[2]; c.beginPath(); c.moveTo(-1, -31); c.quadraticCurveTo(3, -42 * big - (f % 6), 7, -31); c.closePath(); c.fill();
  c.fillStyle = FIRE[4]; c.beginPath(); c.moveTo(1, -31); c.quadraticCurveTo(3, -37 * big - (f % 4), 5, -31); c.closePath(); c.fill();
};
