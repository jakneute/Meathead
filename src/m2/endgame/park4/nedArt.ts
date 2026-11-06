// NED THE NECROMANCER, drawn: a demon, and a nobody. Short and soft (about 118 tall, a gut on him), round-shouldered,
// sweating. A Halloween-store wizard's robe in cheap purple polyester, too long (it drags; the fold creases from the
// bag still in it), a glow-in-the-dark skull printed on its chest, a $19.99 sticker still on the sleeve; a matching
// pointed hat with foil stars stuck on it, a hole cut in it for his one good horn (the other's snapped off and
// duct-taped back on, crooked). Liver-maroon skin going gray at the jowls, a comb-over, mismatched bulging eyes, a
// big wet nose, plastic vampire fangs over his own yellow teeth, a soul patch. His staff: a broom handle with a
// party-store plastic skull on top (its price tag swinging), the skull's eyes lit by two little bulbs when he casts. A
// fanny pack. Socks with his sandals. A stubby demon tail.
//
// Feet at the origin, facing right; every elbow and knee from art/limb.ts. Painted at boss grade in ramps (light,
// base, shade, deep, line: cartoon/amphi/paint.ts), stamped per pose and frame; the live bits (the skull's bulbs, the
// casting glow) over it. Also: his empty skin (his death: his own skeleton walked out of it) and the poof he comes and
// goes in.

import { stamp } from '../../../m1/game/render/stamp';
import { elbow, knee, reachTo } from '../../art/limb';
import { type Ramp, shape, shapeTop, limb as tube, ell, px, line, dith } from '../../cartoon/amphi/paint';

type Ctx = CanvasRenderingContext2D;
type P = [number, number];
const TAU = Math.PI * 2;

const SKIN: Ramp = ['#E8B0A4', '#C8867E', '#A86460', '#86484A', '#3A1418'];
const SKIN_F: Ramp = ['#C8908A', '#A86A66', '#88504E', '#6A3A3C', '#2A0C10'];
const ROBE: Ramp = ['#A884E0', '#7E58C0', '#62409E', '#482C7C', '#1E0E3A'];
const ROBE_F: Ramp = ['#8664C0', '#62409E', '#4A2E80', '#341E60', '#140828'];
const HAT: Ramp = ['#B494EC', '#8A64CC', '#6A48AA', '#4E3088', '#200E40'];
const HORN: Ramp = ['#FFF0D8', '#E0C8A0', '#B89C72', '#8A6E4A', '#3A2A18'];
const TAPE: Ramp = ['#F4F4F6', '#CFCFD6', '#A8A8B2', '#80808C', '#3A3A44'];
const STICK: Ramp = ['#D8A868', '#B08040', '#8A6030', '#684420', '#2A1808'];
const SKULLR: Ramp = ['#FFFFF4', '#ECE6D4', '#CCC4AC', '#A49C84', '#3A3428'];
const SOCK: Ramp = ['#FFFFFF', '#E6E6E6', '#C8C8C8', '#A0A0A0', '#3A3A3A'];
const SANDAL: Ramp = ['#9A7A5A', '#7A5A3A', '#5E422A', '#44301E', '#1A100A'];
const PACK: Ramp = ['#4A5A3A', '#344428', '#26321C', '#1A2414', '#080C04'];
const STAR = '#F2CC44', GLOW = '#86EFAC', TOOTH = '#E8D49A', FANG = '#FFFFFF', IRIS = '#D8C830';

export type NedPose = 'idle' | 'talk' | 'cast' | 'point' | 'hurt' | 'crouch' | 'bonk' | 'cower' | 'dying' | 'float';
export const NED_POSES: NedPose[] = ['idle', 'talk', 'cast', 'point', 'hurt', 'crouch', 'bonk', 'cower', 'dying', 'float'];
export interface NedOpts { pose: NedPose; q: number; mouth?: boolean }
export const NED_H = 118, NED_W = 40;

const UA = 22, FA = 22, TH = 22, SH = 22;

/** His skeleton for a pose: hip, shoulder, head, feet, hands (N near, F far), the staff's angle and hand. */
const rig = (o: NedOpts) => {
  const ph = (o.q / 8) * TAU, bob = Math.sin(ph) * 1.2;
  let hip: P = [0, -44], sh: P = [2, -78], head: P = [8, -92];
  let fN: P = [7, 0], fF: P = [-7, 0];
  let hN: P = [18, -48], hF: P = [-12, -50];
  let staff = 0.08; // (radians off upright, leaning forward)
  switch (o.pose) {
    case 'idle': case 'talk': sh = [2, -78 + bob * 0.4]; head = [8, -92 + bob * 0.6]; hN = [18, -50 + bob]; break;
    case 'float': hip = [0, -46 + bob * 2]; sh = [2, -80 + bob * 2]; head = [8, -94 + bob * 2]; fN = [5, -6 + bob * 2]; fF = [-6, -4 + bob * 2]; hN = [20, -64 + bob]; hF = [-20, -66 + bob]; break;
    case 'cast': sh = [0, -80]; head = [4, -96]; hN = [20, -92]; hF = [-24, -86]; staff = 0.1; break;
    case 'point': sh = [4, -78]; head = [12, -92]; hN = [16, -50]; hF = [36, -82]; break;
    case 'hurt': sh = [-6, -76]; head = [-4, -90]; hN = [10, -60]; hF = [-24, -84]; fN = [10, 0]; fF = [-10, -3]; staff = -0.4; break;
    case 'crouch': hip = [0, -30]; sh = [6, -60]; head = [14, -70]; fN = [12, 0]; fF = [-12, 0]; hN = [22, -34]; hF = [-14, -34]; break;
    case 'bonk': sh = [8, -78]; head = [16, -90]; hN = [30, -70]; hF = [-8, -56]; staff = 1.3; break;
    case 'cower': hip = [0, -34]; sh = [-8, -60]; head = [-4, -72]; fN = [10, 0]; fF = [-10, 0]; hN = [4, -78]; hF = [-14, -80]; staff = -0.6; break;
    case 'dying': sh = [0, -82]; head = [2, -98]; hN = [20, -112]; hF = [-22, -110]; staff = 0.9; fN = [8, 0]; fF = [-8, 0]; break;
  }
  return { hip, sh, head, fN, fF, hN, hF, staff };
};

/** A hand: pudgy, four sausage fingers, a ring with a plastic gem. */
const hand = (c: Ctx, h: P, ang: number, r: Ramp, grip = false) => {
  const ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux;
  for (const k of [-1, 0, 1, 2]) {
    const len = grip ? 3 : 5.5;
    const b0: P = [h[0] + ux * 2.5 + nx * k * 1.8, h[1] + uy * 2.5 + ny * k * 1.8], b1: P = [b0[0] + ux * len, b0[1] + uy * len];
    line(c, [b0[0], b0[1], b1[0], b1[1]], 3, r[4]); line(c, [b0[0], b0[1], b1[0], b1[1]], 2, r[1]);
  }
  ell(c, h[0] + ux * 2, h[1] + uy * 2, 4.6, 4, r[4], ang); ell(c, h[0] + ux * 2, h[1] + uy * 2, 3.8, 3.2, r[1], ang);
  px(c, h[0] + ux * 3 - 1, h[1] + uy * 3 - 1, 2, 2, '#DC2626');
};
/** An arm: the robe's bell sleeve (wide, too long), the pudgy hand out of it. */
const arm = (c: Ctx, s: P, hIn: P, near: boolean, grip = false) => {
  const h = reachTo(s[0], s[1], hIn[0], hIn[1], UA, FA), [ex, ey] = elbow(s[0], s[1], h[0], h[1], UA, FA, 1);
  const rb = near ? ROBE : ROBE_F, sk = near ? SKIN : SKIN_F;
  const fa = Math.atan2(h[1] - ey, h[0] - ex);
  tube(c, s[0], s[1], 6, ex, ey, 5.4, rb, 0, 1);
  // (the bell of the sleeve, flaring past the wrist)
  const cx = h[0] - Math.cos(fa) * 5, cy = h[1] - Math.sin(fa) * 5;
  tube(c, ex, ey, 5.4, cx, cy, 8, rb, 0, 1);
  if (near) { px(c, (s[0] + ex) / 2 - 3, (s[1] + ey) / 2 - 2, 7, 4, '#FDE047'); px(c, (s[0] + ex) / 2 - 2, (s[1] + ey) / 2 - 1, 5, 1, '#B91C1C'); }
  hand(c, h, fa, sk, grip);
  return h;
};
/** A leg (mostly under the robe): the hairy shin, the white tube sock, the sandal. */
const leg = (c: Ctx, hp: P, f: P, near: boolean) => {
  const an: P = [f[0], f[1] - 6];
  const [kx, ky] = knee(hp[0], hp[1], an[0], an[1], TH, SH, 1), end = reachTo(hp[0], hp[1], an[0], an[1], TH, SH);
  const sk = near ? SKIN : SKIN_F;
  tube(c, hp[0], hp[1], 6, kx, ky, 4.6, sk, 0, 1);
  tube(c, kx, ky, 4.4, end[0], end[1], 3.6, sk, 0, 1);
  // (the sock up to mid-shin, the stripe round it)
  tube(c, (kx + end[0]) / 2, (ky + end[1]) / 2, 3.8, end[0], end[1], 3.6, SOCK, 0, 1);
  px(c, (kx + end[0]) / 2 - 3, (ky + end[1]) / 2 + 1, 7, 1, '#2563EB');
  // (the sandal: a sole, two straps)
  const bx = end[0], by = f[1];
  shape(c, () => { c.moveTo(bx - 4, by - 6); c.quadraticCurveTo(bx + 12, by - 8, bx + 13, by - 3); c.lineTo(bx - 5, by - 3); c.closePath(); }, SOCK, bx - 5, bx + 13, 1);
  px(c, bx - 6, by - 3, 20, 3, SANDAL[3]); px(c, bx - 6, by - 3, 20, 1, SANDAL[1]);
  px(c, bx + 2, by - 7, 2, 4, SANDAL[2]); px(c, bx + 8, by - 6, 2, 3, SANDAL[2]);
};

/** The head: (hx, hy) its middle, facing right. */
const head = (c: Ctx, hx: number, hy: number, o: NedOpts) => {
  const ow = o.pose === 'hurt' || o.pose === 'cower' || o.pose === 'dying';
  const open = o.mouth || o.pose === 'cast' || o.pose === 'point' || ow;
  // (the jowls, the round soft face)
  shape(c, () => { c.moveTo(hx - 9, hy - 10); c.quadraticCurveTo(hx + 4, hy - 16, hx + 11, hy - 6); c.quadraticCurveTo(hx + 14, hy + 4, hx + 10, hy + 11); c.quadraticCurveTo(hx + 2, hy + 17, hx - 6, hy + 13); c.quadraticCurveTo(hx - 12, hy + 6, hx - 11, hy - 2); c.closePath(); }, SKIN, hx - 12, hx + 14, 1);
  ell(c, hx + 2, hy + 10, 6, 3, dith(c, SKIN[3]));
  // (the ear: pointed, droopy)
  shape(c, () => { c.moveTo(hx - 7, hy - 1); c.lineTo(hx - 15, hy - 6); c.lineTo(hx - 12, hy + 6); c.closePath(); }, SKIN, hx - 15, hx - 7, 1);
  // (the eyes: near huge, bulging, bloodshot yellow; far small, lazy)
  ell(c, hx + 7, hy - 3, 4.4, 4, '#FFF4C8'); ell(c, hx + 7, hy - 3, 4.4, 4, dith(c, '#F0B4AC'));
  ell(c, hx + 8, hy - 2.6, 1.8, 1.8, ow ? '#B91C1C' : IRIS); px(c, hx + 8, hy - 3, 1, 1, '#000');
  c.strokeStyle = '#3A1418'; c.lineWidth = 0.8; c.beginPath(); c.ellipse(hx + 7, hy - 3, 4.4, 4, 0, 0, TAU); c.stroke();
  ell(c, hx + 1, hy - 2, 2, 1.8, '#FFF4C8'); px(c, hx, hy - 2, 1, 1, '#000');
  // (bags, the brows (uneven, bushy))
  line(c, [hx + 3, hy + 2, hx + 7, hy + 3, hx + 11, hy + 1], 0.8, SKIN[3]);
  line(c, ow ? [hx + 3, hy - 9, hx + 11, hy - 7] : [hx + 3, hy - 8, hx + 11, hy - 9], 1.4, '#30261E');
  // (the nose: big, round, wet; the nostril, a hair out of it)
  ell(c, hx + 13, hy + 3, 4.6, 4, SKIN[4]); ell(c, hx + 13, hy + 2.6, 3.8, 3.2, SKIN[1]); px(c, hx + 12, hy + 1, 2, 1, SKIN[0]);
  ell(c, hx + 12, hy + 5, 1.2, 0.8, SKIN[4]); line(c, [hx + 12, hy + 5.5, hx + 12.5, hy + 7], 0.5, '#1E120A');
  // (the mouth: a smug little grin, or open; the plastic fangs over his yellow teeth)
  if (open) {
    const big = ow ? 1.6 : 1;
    ell(c, hx + 8, hy + 10, 4, 2.4 * big, '#3A0A14'); px(c, hx + 5, hy + 8.6, 6, 1, TOOTH);
    px(c, hx + 5, hy + 8.6, 1.4, 3, FANG); px(c, hx + 9.6, hy + 8.6, 1.4, 3, FANG);
  } else {
    line(c, [hx + 4, hy + 9, hx + 8, hy + 10, hx + 12, hy + 8.5], 1.4, SKIN[4]);
    px(c, hx + 5.4, hy + 9.4, 1.4, 2.4, FANG); px(c, hx + 9.4, hy + 9, 1.4, 2.4, FANG);
  }
  // (the soul patch, the cold sore)
  px(c, hx + 6, hy + 13, 3, 2, '#2A1A14'); ell(c, hx + 12, hy + 9, 1, 1, '#E89870');
  // (the comb-over: a few strands across the scalp, under the hat's brim)
  for (let k = 0; k < 4; k++) line(c, [hx - 10, hy - 6 + k, hx, hy - 11 + k, hx + 9, hy - 9 + k], 0.6, '#30261E');
  // (the sweat: a bead or two)
  px(c, hx - 3, hy - 4, 1, 2, '#F4FAFF'); px(c, hx + 4, hy + 4, 1, 2, '#F4FAFF');
  // (the hat: a brim, the cone (bent over at the tip), foil stars, the hole with his good horn out of it; the taped one)
  shape(c, () => { c.moveTo(hx - 16, hy - 9); c.lineTo(hx + 16, hy - 13); c.lineTo(hx + 14, hy - 9); c.lineTo(hx - 14, hy - 5); c.closePath(); }, HAT, hx - 16, hx + 16, 1);
  shape(c, () => { c.moveTo(hx - 10, hy - 8); c.lineTo(hx + 10, hy - 12); c.quadraticCurveTo(hx + 2, hy - 30, hx - 4, hy - 38); c.quadraticCurveTo(hx - 12, hy - 36, hx - 14, hy - 30); c.quadraticCurveTo(hx - 6, hy - 30, hx - 8, hy - 22); c.closePath(); }, HAT, hx - 14, hx + 10, 1);
  for (const [sx, sy] of [[hx - 2, hy - 18], [hx - 7, hy - 27], [hx + 4, hy - 13]] as const) { c.fillStyle = STAR; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? 1.2 : 2.8; c.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); } c.closePath(); c.fill(); }
  // (the good horn up through the hat's hole)
  shape(c, () => { c.moveTo(hx + 6, hy - 14); c.quadraticCurveTo(hx + 10, hy - 24, hx + 16, hy - 28); c.quadraticCurveTo(hx + 12, hy - 20, hx + 10, hy - 13); c.closePath(); }, HORN, hx + 6, hx + 16, 1);
  // (the snapped one, taped back on at the back, crooked)
  shape(c, () => { c.moveTo(hx - 12, hy - 8); c.lineTo(hx - 20, hy - 16); c.lineTo(hx - 22, hy - 24); c.lineTo(hx - 15, hy - 14); c.closePath(); }, HORN, hx - 22, hx - 12, 1);
  shape(c, () => { c.moveTo(hx - 17, hy - 13); c.lineTo(hx - 12, hy - 16); c.lineTo(hx - 10, hy - 12); c.lineTo(hx - 15, hy - 9); c.closePath(); }, TAPE, hx - 17, hx - 10, 0.6);
};

/** The torso: the robe (a bell from the shoulders to the floor, the gut pushing it out), the printed skull, the fanny
 *  pack, the tail out the back. */
const torso = (c: Ctx, hip: P, sh: P) => {
  // (the tail, stubby, out the back of the robe)
  line(c, [hip[0] - 14, hip[1] + 6, hip[0] - 24, hip[1] + 12, hip[0] - 28, hip[1] + 4], 4, SKIN[4]); line(c, [hip[0] - 14, hip[1] + 6, hip[0] - 24, hip[1] + 12, hip[0] - 28, hip[1] + 4], 2.6, SKIN[1]);
  c.fillStyle = SKIN[2]; c.beginPath(); c.moveTo(hip[0] - 28, hip[1]); c.lineTo(hip[0] - 33, hip[1] + 6); c.lineTo(hip[0] - 26, hip[1] + 7); c.closePath(); c.fill();
  // (the robe: shoulders round, the gut out in front, the hem dragging on the ground in folds)
  const hem = -6;
  shape(c, () => {
    c.moveTo(sh[0] - 10, sh[1] - 2); c.lineTo(sh[0] + 10, sh[1] - 2);
    c.quadraticCurveTo(hip[0] + 24, hip[1] - 8, hip[0] + 20, hem); c.lineTo(hip[0] + 22, hem + 4);
    for (let k = 0; k <= 6; k++) c.lineTo(hip[0] + 22 - k * 7.4, hem + 4 + (k % 2 ? 2 : 0));
    c.lineTo(hip[0] - 22, hem + 2); c.quadraticCurveTo(hip[0] - 18, hip[1] - 4, sh[0] - 10, sh[1] - 2); c.closePath();
  }, ROBE, hip[0] - 22, hip[0] + 24, 1);
  // (the gut, bulging the front of it)
  shapeTop(c, () => c.ellipse(hip[0] + 10, hip[1] - 6, 13, 15, 0, 0, TAU), ROBE, hip[1] - 21, hip[1] + 9, 0.8);
  // (the fold creases from the bag it came in, in a grid)
  for (let k = 0; k < 3; k++) { line(c, [hip[0] - 16, hip[1] - 20 + k * 16, hip[0] + 18, hip[1] - 22 + k * 16], 0.6, ROBE[0]); }
  line(c, [hip[0] + 2, sh[1] + 4, hip[0] + 2, hem], 0.6, ROBE[0]);
  // (the printed skull, glow-in-the-dark, cracked)
  const sx = (sh[0] + hip[0]) / 2 + 6, sy = (sh[1] + hip[1]) / 2 - 2;
  ell(c, sx, sy, 6, 5.4, GLOW); px(c, sx - 3.6, sy + 3, 7.2, 3, GLOW);
  px(c, sx - 3, sy - 1, 2.4, 2.4, '#1E4A22'); px(c, sx + 1, sy - 1, 2.4, 2.4, '#1E4A22'); px(c, sx - 0.5, sy + 2, 1, 1.4, '#1E4A22');
  line(c, [sx - 2, sy - 5, sx, sy - 2, sx + 2, sy - 4], 0.5, '#4A2E80');
  // (the fanny pack, under the gut, its zip and its little pentagram patch)
  shape(c, () => { c.moveTo(hip[0] - 2, hip[1] + 6); c.lineTo(hip[0] + 20, hip[1] + 4); c.lineTo(hip[0] + 21, hip[1] + 12); c.lineTo(hip[0], hip[1] + 14); c.closePath(); }, PACK, hip[0] - 2, hip[0] + 21, 0.8);
  line(c, [hip[0] + 1, hip[1] + 9, hip[0] + 19, hip[1] + 8], 0.6, '#9CA3AF');
  ell(c, hip[0] + 15, hip[1] + 11, 1.8, 1.8, '#B91C1C');
  // (the collar, up, a cheap felt one)
  shape(c, () => { c.moveTo(sh[0] - 12, sh[1]); c.lineTo(sh[0] - 8, sh[1] - 10); c.lineTo(sh[0] + 2, sh[1] - 6); c.lineTo(sh[0] + 10, sh[1] - 10); c.lineTo(sh[0] + 12, sh[1]); c.closePath(); }, ROBE_F, sh[0] - 12, sh[0] + 12, 1);
};

/** The staff: a broom handle, a plastic skull on top, its price tag; `h` the hand, `a` its lean (radians off upright,
 *  forward). The skull's eyes lit (bulbs) when `lit`. */
const staff = (c: Ctx, h: P, a: number, lit: boolean) => {
  const ux = Math.sin(a), uy = -Math.cos(a), len = 98, up = 60;
  const top: P = [h[0] + ux * up, h[1] + uy * up], bot: P = [h[0] - ux * (len - up), h[1] - uy * (len - up)];
  line(c, [bot[0], bot[1], top[0], top[1]], 4, STICK[4]); line(c, [bot[0], bot[1], top[0], top[1]], 2.6, STICK[1]);
  line(c, [bot[0] - 0.6, bot[1], top[0] - 0.6, top[1]], 0.8, STICK[0]);
  // (the skull: plastic, a seam down it, a cheap grin)
  const sx = top[0] + ux * 7, sy = top[1] + uy * 7;
  ell(c, sx, sy, 7.4, 7, SKULLR[4]); ell(c, sx, sy, 6.6, 6.2, SKULLR[1]); ell(c, sx - 2, sy - 2, 3, 2.6, SKULLR[0]);
  px(c, sx - 3.6, sy + 3, 7, 3, SKULLR[2]);
  ell(c, sx - 2.4, sy - 0.4, 1.8, 1.8, lit ? '#FDE047' : '#2A2418'); ell(c, sx + 2.4, sy - 0.4, 1.8, 1.8, lit ? '#FDE047' : '#2A2418');
  for (let k = 0; k < 4; k++) px(c, sx - 3 + k * 2, sy + 4, 1, 2, '#2A2418');
  // (the price tag on its string)
  line(c, [sx + 5, sy + 4, sx + 9, sy + 12], 0.6, '#F5F5F4'); px(c, sx + 7, sy + 11, 6, 4, '#F5F5F4'); px(c, sx + 8, sy + 12, 4, 1, '#DC2626');
};

/** Him, at the origin (his feet), facing right. */
export const paintNed = (g: Ctx, o: NedOpts) => {
  const r = rig(o);
  const lit = o.pose === 'cast' || o.pose === 'dying';
  // (far: the far arm (its hand out), the far leg; the body; the near leg, the head; the near arm with the staff)
  arm(g, [r.sh[0] - 6, r.sh[1] + 4], r.hF, false);
  leg(g, [r.hip[0] - 4, r.hip[1]], r.fF, false);
  leg(g, [r.hip[0] + 4, r.hip[1]], r.fN, true);
  torso(g, r.hip, r.sh);
  head(g, r.head[0], r.head[1], o);
  const h = reachTo(r.sh[0] + 6, r.sh[1] + 4, r.hN[0], r.hN[1], UA, FA);
  if (o.pose !== 'dying' && o.pose !== 'cower') staff(g, h, r.staff, lit);
  arm(g, [r.sh[0] + 6, r.sh[1] + 4], r.hN, true, o.pose !== 'dying' && o.pose !== 'cower');
  if (o.pose === 'dying' || o.pose === 'cower') staff(g, [r.hN[0] + 30, -4], 1.45, false);
};

/** His empty skin (his death: his skeleton walked off out of it): the robe in a heap, the skin flat in it like a
 *  deflated pool toy, the face sagging off the edge, the hat. */
export const paintNedSkin = (g: Ctx) => {
  shape(g, () => { g.moveTo(-40, 0); g.quadraticCurveTo(-30, -16, -6, -14); g.quadraticCurveTo(18, -20, 34, -8); g.lineTo(40, 0); g.closePath(); }, ROBE, -40, 40, 1);
  shape(g, () => { g.moveTo(-20, -8); g.quadraticCurveTo(-6, -14, 10, -10); g.lineTo(12, -4); g.lineTo(-18, -4); g.closePath(); }, SKIN, -20, 12, 1);
  // (the face, flat, sliding off: the eyes holes, the fangs fallen out beside it)
  shape(g, () => { g.moveTo(26, -4); g.quadraticCurveTo(38, -14, 50, -6); g.quadraticCurveTo(52, 0, 44, 0); g.lineTo(28, 0); g.closePath(); }, SKIN, 26, 52, 1);
  ell(g, 36, -6, 2, 1.4, '#2A0A0A'); ell(g, 42, -6, 1.4, 1, '#2A0A0A'); line(g, [34, -2, 44, -3], 1, '#3A0A14');
  px(g, 54, -3, 2, 3, '#FFFFFF'); px(g, 58, -2, 2, 2, '#FFFFFF');
  // (the hat, crumpled; the staff dropped)
  shape(g, () => { g.moveTo(-34, -10); g.lineTo(-14, -12); g.lineTo(-30, -32); g.closePath(); }, HAT, -34, -14, 1);
  line(g, [-60, -2, 10, -3], 2.6, STICK[1]);
  ell(g, -62, -6, 6, 5.6, SKULLR[1]);
};

/** Him in the world: (x, feet), facing, his pose; stamped; the live bits over. */
export const drawNed = (c: Ctx, x: number, feet: number, face: 1 | -1, o: NedOpts, f: number, alpha = 1, flash = false) => {
  c.save(); c.translate(Math.round(x), Math.round(feet));
  if (face < 0) c.scale(-1, 1);
  if (alpha < 1) c.globalAlpha = alpha;
  stamp(c, `wp4-ned-${o.pose}-${o.q}-${o.mouth ? 1 : 0}`, -80, -190, 160, 196, g => paintNed(g, o));
  // (casting: a green glow off his hands and the skull)
  if (o.pose === 'cast' || o.pose === 'dying') {
    const r = rig(o), k = 0.5 + 0.5 * Math.sin(f * 0.4);
    c.globalAlpha = alpha * (0.35 + 0.3 * k); c.fillStyle = GLOW;
    c.beginPath(); c.arc(r.hF[0], r.hF[1], 7 + k * 3, 0, TAU); c.fill();
    c.beginPath(); c.arc(r.hN[0] + Math.sin(r.staff) * 67, r.hN[1] - Math.cos(r.staff) * 67, 9 + k * 3, 0, TAU); c.fill();
    c.globalAlpha = alpha;
  }
  if (flash) { c.globalAlpha = 0.5 * alpha; c.fillStyle = '#FFFFFF'; c.fillRect(-24, -120, 48, 120); }
  c.restore();
};
export const drawNedSkin = (c: Ctx, x: number, feet: number, face: 1 | -1) => {
  c.save(); c.translate(Math.round(x), Math.round(feet)); if (face < 0) c.scale(-1, 1);
  stamp(c, 'wp4-ned-skin', -80, -40, 150, 44, g => paintNedSkin(g));
  c.restore();
};
/** The poof he comes and goes in: green-gray smoke, a few sparks; `k` 0..1 through it. */
export const drawPoof = (c: Ctx, x: number, feet: number, k: number) => {
  if (k <= 0 || k >= 1) return;
  c.save();
  const a = k < 0.3 ? k / 0.3 : 1 - (k - 0.3) / 0.7;
  for (let i = 0; i < 9; i++) {
    const ang = (i / 9) * TAU, d = 10 + k * 40, r = 14 + k * 16 - (i % 3) * 3;
    c.globalAlpha = a * 0.8; c.fillStyle = i % 2 ? '#6B7F6A' : '#9CB09A';
    c.beginPath(); c.arc(x + Math.cos(ang) * d, feet - 60 + Math.sin(ang) * d * 0.8, r, 0, TAU); c.fill();
  }
  c.globalAlpha = a; c.fillStyle = '#86EFAC';
  for (let i = 0; i < 6; i++) { const ang = i * 1.1 + k * 4; c.fillRect(Math.round(x + Math.cos(ang) * (20 + k * 50)), Math.round(feet - 60 + Math.sin(ang) * (16 + k * 40)), 3, 3); }
  c.restore();
};
