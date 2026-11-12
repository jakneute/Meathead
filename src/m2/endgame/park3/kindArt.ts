// THE MAINTENANCE TUNNELS' own cast, drawn: the SNES pass (every material in its steps, lit from the upper left, the
// seams between the steps dithered, inked round every part: Spooky Land's costume kit, spooky/costume.ts, as level 1's
// cast is). Every elbow and knee from art/limb.ts (the hand or the foot clamped to the bones' reach with reachTo, so
// it's drawn where the limb ends). Feet at the origin, facing right; stamped per look, pose and frame (painted once
// each: no per-frame pixel work); the live bits (the prod's crackle, the fuse's spark, the grub's drip, the eel's lure)
// drawn over the stamp.
//
//   THE STAFF      janitors and technicians, men and women, every skin tone, build and hair (seeded: short, long, a
//                  ponytail, bald or a bun, curls; beards, mustaches, glasses, earrings), possessed by the aliens as
//                  the water park's guests are (park1's 'alien' look: the skin gone grey-green toward its own tone,
//                  green veins, lumps on the skull and the jaw where something's moved in, the jaw hanging, green drool,
//                  a feeler out of an ear, the eyes lit green). Dressed for not caring: the janitor in a stained coverall
//                  (its zip, a name patch, rolled sleeves, knee patches, a rag in the back pocket), a ring of keys, a
//                  cap, his mop (and the bucket, by its bail, to throw: set down by his heel while he swings the mop);
//                  the technician in a hi-vis vest over a polo (its reflective stripes, a badge on a lanyard), a hard
//                  hat on backward, a tool belt (a pouch, a screwdriver, a tape), a cattle prod (held out crackling, the
//                  tell) and a fuse to throw. Poses: stand, walk, raise (the tell: the mop up / the prod out), strike,
//                  wind (the tell: the bucket swung back / the fuse up, sparking), throw, hurt.
//   THE GRUBS      alien larvae clinging to the ceilings: fat, ringed, wet, green, a round mouth of hooks, stub feet.
//                  Poses: cling, quiver (the tell: wriggling, dripping), drop, crawl.
//   THE EELS       space eels in the flooded pipes: long, banded green and purple, a fin down the back, a glowing
//                  lure, a jaw of needles. Poses: swim, coil (the tell: wound up, the lure bright), lunge.

import { stamp } from '../../../m1/game/render/stamp';
import { elbow, knee, reachTo } from '../../art/limb';
import { part, partTop, ball, jointed, dither, px, flat, mix, dk, lt, INK } from '../../spooky/costume';

type Ctx = CanvasRenderingContext2D;
type P = [number, number];
const rnd = (n: number) => { const s = Math.sin(n * 91.7 + 13.1) * 43758.5453; return s - Math.floor(s); };
/** A stroke along points, inked under (a strap, a handle, a feeler). */
const cord = (g: Ctx, pts: P[], w: number, col: string, ink = 1.4) => {
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (const [ww, cc] of (ink > 0 ? [[w + ink, INK], [w, col]] : [[w, col]]) as [number, string][]) { g.strokeStyle = cc; g.lineWidth = ww; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const q of pts.slice(1)) g.lineTo(q[0], q[1]); g.stroke(); }
  g.lineCap = 'butt';
};
const poly = (g: Ctx, pts: P[]) => { g.moveTo(pts[0][0], pts[0][1]); for (const q of pts.slice(1)) g.lineTo(q[0], q[1]); g.closePath(); };

// ---------------------------------------------------------------------------------------------------------------
// The staff

export type StaffKind = 'janitor' | 'tech';
export interface StaffLook {
  woman: boolean; skin: string; hair: string; style: 0 | 1 | 2 | 3 | 4; build: number; belly: boolean; beard: boolean; tall: number;
  /** (the rest of who they are: a mustache, glasses, an earring, which coverall, what's down the front of it) */
  stache: boolean; specs: boolean; ring: boolean; suit: number; mess: number;
}
const SKINS = ['#F2DCCB', '#E2C0A2', '#C99A74', '#9A6A48', '#6E4A32', '#4A3022'];
const HAIRS = ['#1A1410', '#3A2414', '#6A4A2A', '#B89A6A', '#8A8A8A', '#E8E4DC', '#7A2A14'];
export const staffLook = (seed: number): StaffLook => {
  const woman = rnd(seed) < 0.45, beard = rnd(seed + 6) < 0.35;
  return {
    woman, skin: SKINS[Math.floor(rnd(seed + 1) * SKINS.length)], hair: HAIRS[Math.floor(rnd(seed + 2) * HAIRS.length)],
    style: Math.floor(rnd(seed + 3) * 5) as 0 | 1 | 2 | 3 | 4, build: 0.9 + rnd(seed + 4) * 0.3, belly: rnd(seed + 5) < 0.45, beard, tall: rnd(seed + 7) * 6 - 2,
    stache: !woman && !beard && rnd(seed + 8) < 0.4, specs: rnd(seed + 9) < 0.28, ring: rnd(seed + 10) < (woman ? 0.6 : 0.15), suit: Math.floor(rnd(seed + 11) * 3), mess: Math.floor(rnd(seed + 12) * 4),
  };
};
export type StaffPose = 'stand' | 'walk' | 'raise' | 'strike' | 'wind' | 'throw' | 'hurt';
export const STAFF_POSES: StaffPose[] = ['stand', 'walk', 'raise', 'strike', 'wind', 'throw', 'hurt'];

/** The alien's hold on them: the skin toward a grey-green. */
const possessed = (skin: string) => mix(skin, '#8AA28A', 0.42);
const COVERALL = ['#5E6670', '#56664E', '#4E5E78'];
const POLO = '#2E3F66', WORK = '#343A48', VEST = '#D4E82A', BOOT = '#6A4A2C', WOOD = '#B8925A', PAIL = '#D8B020', PROD = '#E8C020', STEEL = '#A8B0BC';
const SLIME = '#7CFC5A', SLIME_L = '#E9FFE0', VEIN = '#2F7A12';
const ARM = 13;

/** Where everything is for a pose (frame q of 8 for the walk): the hips, the shoulders, the head, the feet, the hands as
 *  the arms reach them, and the ends of what's in the near hand (the mop: butt and head; the prod: grip and prongs). */
const rigOf = (kind: StaffKind, L: StaffLook, pose: StaffPose, q: number) => {
  const ph = (q / 8) * Math.PI * 2, T = L.tall, jan = kind === 'janitor';
  let lean = 2, bob = 0, fN: P = [7, 0], fF: P = [-7, 0];
  // (where the hands go: the near one holds the mop / the prod; the far one the bucket / the fuse)
  let hN: P = [14, -34], hF: P = [-6, -30];
  switch (pose) {
    case 'walk': fN = [Math.sin(ph) * 10, -Math.max(0, Math.sin(ph)) * 5]; fF = [-Math.sin(ph) * 10, -Math.max(0, -Math.sin(ph)) * 5]; hN = [12, -34 + Math.sin(ph) * 2]; hF = [-4 + Math.sin(ph) * 6, -30]; bob = -Math.abs(Math.sin(ph)) * 2; break;
    case 'raise': hN = jan ? [6, -78 - T] : [24, -46]; hF = jan ? [-2, -76 - T] : [-6, -30]; lean = jan ? -2 : 4; break;
    case 'strike': hN = jan ? [26, -36] : [32, -42]; hF = jan ? [20, -40] : [-8, -30]; lean = 9; fN = [12, 0]; fF = [-10, 0]; break;
    case 'wind': hF = [-22, -46]; hN = [10, -36]; lean = -5; break;
    case 'throw': hF = [26, -54]; hN = [10, -32]; lean = 8; fN = [12, 0]; fF = [-10, 0]; break;
    case 'hurt': lean = -9; hN = [-2, -50]; hF = [-18, -46]; break;
    default: break;
  }
  const hipY = -36 - T * 0.4 + bob, shY = -60 - T + bob;
  const hip: P = [0, hipY], sh: P = [lean, shY], head: P = [lean + 3, shY - 10];
  const sN: P = [sh[0] + 4, sh[1] + 3], sF: P = [sh[0] - 3, sh[1] + 3];
  const handN = reachTo(sN[0], sN[1], hN[0], hN[1], ARM, ARM), handF = reachTo(sF[0], sF[1], hF[0], hF[1], ARM, ARM);
  const [mx, my] = handN, up = pose === 'raise', out = pose === 'raise' || pose === 'strike';
  // (the mop: its handle through the near hand; the prod: gripped at its butt, the prongs out ahead)
  const tip: P = jan ? (up ? [mx - 4, my - 34] : pose === 'strike' ? [mx + 46, my + 26] : [mx + 6, my + 34]) : [mx + (out ? 24 : 6), my + (out ? -4 : 18)];
  const butt: P = jan ? (up ? [mx + 3, my + 22] : pose === 'strike' ? [mx - 16, my - 12] : [mx - 3, my - 26]) : [mx - 4, my];
  return { T, jan, lean, hip, sh, head, fN, fF, sN, sF, handN, handF, tip, butt, up, out };
};

const paintStaff = (g: Ctx, kind: StaffKind, L: StaffLook, pose: StaffPose, q: number) => {
  const K = rigOf(kind, L, pose, q), { T, jan, hip, sh, head } = K, w = L.build;
  const skin = possessed(L.skin), skinF = dk(skin, 0.2);
  const top = jan ? COVERALL[L.suit] : POLO, topF = dk(top, 0.24), pants = jan ? top : WORK, pantsF = dk(pants, 0.24);
  // ---- the legs: the coverall's (a patch on the knee) / work pants (a cargo pocket); scuffed boots, their soles
  const leg = (f: P, near: boolean) => {
    const hp: P = [hip[0] + (near ? 3 : -3), hip[1]], B = 16 + T * 0.2;
    const end = reachTo(hp[0], hp[1], f[0], f[1] - 6, B, B), kn = knee(hp[0], hp[1], end[0], end[1], B, B, 1);
    const col = near ? pants : pantsF;
    jointed(g, [hp, kn, end], [7.5 * w, 6.5 * w], [col, col]);
    if (jan) { px(g, kn[0] - 2, kn[1] - 2, 4, 4, dk(col, 0.2)); px(g, kn[0] - 2, kn[1] - 2, 4, 1, lt(col, 0.2)); px(g, kn[0] + 1, kn[1], 1, 1, lt(col, 0.35)); }
    else { const cx = (hp[0] + kn[0]) / 2, cy = (hp[1] + kn[1]) / 2; px(g, cx, cy - 2, 4, 5, dk(col, 0.28)); px(g, cx, cy - 2, 4, 1, lt(col, 0.2)); }
    const bx = end[0], by = end[1] + 6, bc = near ? BOOT : dk(BOOT, 0.28);
    part(g, () => { g.moveTo(bx - 4, by - 10); g.lineTo(bx + 3, by - 10); g.lineTo(bx + 4, by - 6); g.quadraticCurveTo(bx + 9, by - 6, bx + 9, by - 2); g.lineTo(bx - 4, by - 2); g.closePath(); }, bc, bx - 4, by - 10, 13, 8, 1);
    px(g, bx - 5, by - 2, 15, 2, INK); px(g, bx - 4, by - 2, 13, 1, near ? '#8A8478' : '#5E5A52');
    px(g, bx, by - 8, 3, 1, lt(bc, 0.5)); px(g, bx + 1, by - 6, 3, 1, lt(bc, 0.5)); px(g, bx + 6, by - 4, 2, 1, lt(bc, 0.3));
    // (the hem, turned up)
    px(g, end[0] - 3, end[1] - 4, 7, 1, dk(col, 0.35));
  };
  // ---- the arms: the janitor's sleeve rolled to the elbow, the tech's polo short; the forearm bare, a green vein up it
  const arm = (near: boolean) => {
    const s = near ? K.sN : K.sF, end = near ? K.handN : K.handF, e = elbow(s[0], s[1], end[0], end[1], ARM, ARM, 1);
    const sl = near ? top : topF, sk = near ? skin : skinF;
    if (jan) { jointed(g, [s, e, end], [6.6 * w, 5 * w], [sl, sk]); ball(g, e[0], e[1], 3.5 * w, lt(sl, 0.12), 0.8); }
    else { jointed(g, [s, e, end], [5.4 * w, 5 * w], [sk, sk]); const m: P = [s[0] + (e[0] - s[0]) * 0.55, s[1] + (e[1] - s[1]) * 0.55]; jointed(g, [s, m], [6.8 * w], [sl]); px(g, m[0] - 3, m[1] - 1, 6, 1, lt(sl, 0.35)); }
    if (near) { g.strokeStyle = VEIN; g.lineWidth = 1; g.beginPath(); g.moveTo(e[0] + (end[0] - e[0]) * 0.2, e[1] + (end[1] - e[1]) * 0.2 + 1); g.lineTo((e[0] + end[0]) / 2 + 1, (e[1] + end[1]) / 2 - 1); g.lineTo(end[0] - 1, end[1] - 1); g.stroke(); }
    ball(g, end[0], end[1], 3.2, sk, 1);
    return end;
  };
  /** The bucket, its bail's top at (x, y): yellow, dented, the wringer on its rim, mop water in it, a hazard band. */
  const bucket = (x: number, y: number) => {
    g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x - 8, y + 9); g.quadraticCurveTo(x, y - 3, x + 8, y + 9); g.stroke();
    g.strokeStyle = STEEL; g.lineWidth = 1; g.stroke();
    partTop(g, () => poly(g, [[x - 9, y + 8], [x + 9, y + 8], [x + 7, y + 23], [x - 7, y + 23]]), PAIL, x - 9, y + 8, 18, 15, 1.2);
    flat(g, () => g.ellipse(x, y + 8, 9, 2.4, 0, 0, Math.PI * 2), '#4A4A38', 1); px(g, x - 6, y + 7, 8, 1, '#7A8A5A'); px(g, x - 2, y + 8, 3, 1, SLIME);
    px(g, x - 8, y + 15, 16, 3, INK); for (let k = 0; k < 4; k++) px(g, x - 7 + k * 4, y + 15, 2, 3, PAIL);
    px(g, x - 7, y + 10, 2, 4, lt(PAIL, 0.55)); px(g, x + 4, y + 19, 3, 2, dk(PAIL, 0.4));
    px(g, x + 5, y + 4, 5, 4, INK); px(g, x + 6, y + 5, 3, 2, '#C02A2A');
  };
  leg(K.fF, false);
  const farHand = arm(false);
  // (the far hand's thing: the bucket by its bail, the fuse)
  if (jan) { if (pose !== 'throw' && !K.out) bucket(farHand[0], farHand[1] + 1); }
  else if (pose === 'wind' || pose === 'stand' || pose === 'walk') {
    // (a cartridge fuse: ceramic, brass caps, its blown window)
    const [fx, fy] = farHand;
    part(g, () => g.rect(fx - 2, fy - 9, 5, 12), '#E5E7EB', fx - 2, fy - 9, 5, 12, 1);
    px(g, fx - 2, fy - 9, 5, 2, '#C8922A'); px(g, fx - 2, fy - 9, 2, 1, '#FCE08A'); px(g, fx - 2, fy + 1, 5, 2, '#A8741A'); px(g, fx, fy - 5, 2, 3, '#3A2A1A');
    ball(g, fx + 1, fy, 2.6, skinF, 0.8);
  }
  // (the bucket set down by his heel, the mop in both hands)
  if (jan && K.out) bucket(-20, -24);
  // (the hair down the back, behind the head and the shoulders: long, a ponytail)
  const [hx, hy] = head, hair = L.hair;
  if (L.style === 1) part(g, () => { g.moveTo(hx - 6, hy - 7); g.quadraticCurveTo(hx - 13, hy, hx - 10, hy + 15); g.lineTo(hx - 3, hy + 13); g.quadraticCurveTo(hx - 5, hy + 4, hx - 1, hy - 2); g.closePath(); }, hair, hx - 13, hy - 7, 12, 22, 1);
  if (L.style === 2) { part(g, () => { g.moveTo(hx - 7, hy - 5); g.quadraticCurveTo(hx - 16, hy - 2, hx - 13, hy + 11); g.quadraticCurveTo(hx - 9, hy + 4, hx - 5, hy - 1); g.closePath(); }, hair, hx - 16, hy - 5, 11, 16, 1); px(g, hx - 9, hy - 5, 3, 3, '#D03A6A'); px(g, hx - 9, hy - 5, 1, 1, '#FFB0C8'); }
  // ---- the body: the coverall (a belly under it, or not) / the polo and the hi-vis vest
  const bw = (L.woman ? 8 : 9) * w, belly = L.belly ? 4 : 0, midY = (sh[1] + hip[1]) / 2;
  const torso = () => { g.moveTo(sh[0] - bw, sh[1]); g.lineTo(sh[0] + bw, sh[1]); g.quadraticCurveTo(hip[0] + bw + belly + 2, midY + 4, hip[0] + bw, hip[1] + 3); g.lineTo(hip[0] - bw, hip[1] + 3); g.quadraticCurveTo(hip[0] - bw - (L.woman ? -1.5 : 0.5), midY, sh[0] - bw, sh[1]); g.closePath(); };
  part(g, torso, top, Math.min(sh[0], hip[0]) - bw - 1, sh[1], bw * 2 + belly + 4 + Math.abs(sh[0] - hip[0]), hip[1] - sh[1] + 3, 1.2);
  g.save(); g.beginPath(); torso(); g.clip();
  const at = (u: number, v: number): P => [sh[0] + (hip[0] - sh[0]) * v + u, sh[1] + (hip[1] - sh[1]) * v];
  if (jan) {
    // (the collar, the zip and its pull, the name patch (it says nothing), a chest pocket, what's down the front, the belt)
    const [zx, zy] = at(2, 0.08), [zx2, zy2] = at(2, 1);
    g.strokeStyle = dk(top, 0.45); g.lineWidth = 1; g.beginPath(); g.moveTo(zx, zy); g.lineTo(zx2, zy2); g.stroke();
    for (let k = 0; k < 5; k++) { const [x, y] = at(2, 0.14 + k * 0.17); px(g, x, y, 1, 1, '#C8CCD4'); }
    px(g, zx - 1, zy + 3, 2, 3, '#C8CCD4'); px(g, zx - 1, zy + 3, 1, 1, '#FFFFFF');
    const [cx, cy] = at(0, 0); flat(g, () => poly(g, [[cx - 3, cy], [cx + 2, cy + 5], [cx + 2, cy]]), lt(top, 0.22), 0.8); flat(g, () => poly(g, [[cx + 7, cy], [cx + 2, cy + 5], [cx + 2, cy]]), lt(top, 0.1), 0.8);
    const [nx, ny] = at(-bw + 2, 0.24); px(g, nx - 1, ny - 1, 8, 5, INK); px(g, nx, ny, 6, 3, '#E5E7EB'); px(g, nx + 1, ny + 1, 4, 1, '#C02A2A');
    const [qx, qy] = at(4, 0.3); px(g, qx, qy, 5, 5, dk(top, 0.22)); px(g, qx, qy, 5, 1, lt(top, 0.25)); px(g, qx + 3, qy - 2, 1, 3, '#2A4AD0');
    const [s1x, s1y] = at(3, 0.62), [s2x, s2y] = at(-4, 0.8);
    dither(g, s1x - 4, s1y - 3, 8, 6, L.mess % 2 ? '#3A6A2A' : '#4A3A22'); dither(g, s2x - 3, s2y - 2, 6, 5, L.mess > 1 ? '#3A6A2A' : '#4A3A22', 1);
    if (L.mess === 3) { px(g, s1x - 1, s1y - 1, 2, 6, SLIME); px(g, s1x - 1, s1y - 1, 1, 2, SLIME_L); }
    const [bx, by] = at(0, 0.93); px(g, bx - bw - 2, by, bw * 2 + belly + 6, 3, dk(top, 0.4)); px(g, bx - bw - 2, by, bw * 2 + belly + 6, 1, dk(top, 0.15));
    if (L.woman) { g.strokeStyle = dk(top, 0.32); g.lineWidth = 1; g.beginPath(); g.moveTo(sh[0] - 2, sh[1] + 9); g.quadraticCurveTo(sh[0] + 4, sh[1] + 13, sh[0] + bw - 1, sh[1] + 9); g.stroke(); }
  } else {
    // (the polo's collar and placket; the vest: hi-vis, in its steps, open down the front, its silver stripes; the badge)
    const h = hip[1] - sh[1];
    for (const [u0, u1, c2] of [[-bw + 1, -1, dk(VEST, 0.08)], [4, bw + belly, VEST]] as [number, number, string][]) {
      const [ax, ay] = at(u0, 0.02), [dx, dy] = at(u0 + (u0 > 0 ? belly * 0.4 : 0), 0.96), [ex, ey] = at(u1 + (u0 > 0 ? belly * 0.4 : 0), 0.96), [fx, fy] = at(u1, 0.02);
      part(g, () => poly(g, [[ax, ay], [fx, fy], [ex, ey], [dx, dy]]), c2, Math.min(ax, dx), ay, Math.max(fx, ex) - Math.min(ax, dx), dy - ay, 0.9);
    }
    for (const v of [0.42, 0.68]) { const [x, y] = at(-bw, v); px(g, x, y, bw - 1, 3, '#9AA2AE'); px(g, x, y, bw - 1, 1, '#F1F5F9'); const [x2, y2] = at(4, v); px(g, x2, y2, bw + belly + 2, 3, '#B8C0CC'); px(g, x2, y2, bw + belly + 2, 1, '#FFFFFF'); dither(g, x2, y2 + 2, bw + belly + 2, 1, '#7A828E'); }
    const [cx, cy] = at(0, 0); flat(g, () => poly(g, [[cx - 2, cy], [cx + 2, cy + 5], [cx + 2, cy]]), lt(POLO, 0.25), 0.8); flat(g, () => poly(g, [[cx + 7, cy], [cx + 2, cy + 5], [cx + 2, cy]]), lt(POLO, 0.12), 0.8);
    px(g, cx + 2, cy + 6, 1, 1, '#E5E7EB'); px(g, cx + 2, cy + 9, 1, 1, '#E5E7EB');
    g.strokeStyle = '#C02A2A'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx - 1, cy + 1); g.lineTo(cx + 5, cy + h * 0.34); g.lineTo(cx + 7, cy + 1); g.stroke();
    px(g, cx + 3, cy + h * 0.34, 5, 6, INK); px(g, cx + 4, cy + h * 0.34 + 1, 3, 4, '#F1F5F9'); px(g, cx + 4, cy + h * 0.34 + 1, 3, 1, '#2A5AD0'); px(g, cx + 5, cy + h * 0.34 + 3, 1, 1, skin);
    if (L.woman) { g.strokeStyle = dk(VEST, 0.4); g.lineWidth = 1; g.beginPath(); g.moveTo(sh[0] + 3, sh[1] + 9); g.quadraticCurveTo(sh[0] + 7, sh[1] + 12, sh[0] + bw - 1, sh[1] + 9); g.stroke(); }
  }
  g.restore();
  if (jan) {
    // (the keys on the belt loop: the ring, three keys; a rag out of the back pocket)
    const kx = hip[0] + bw - 2, ky = hip[1] + 3;
    g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.arc(kx, ky, 2.6, 0, Math.PI * 2); g.stroke(); g.strokeStyle = '#D8DCE4'; g.lineWidth = 1; g.stroke();
    for (const [dx, col] of [[-2, '#D8B43A'], [0, '#C8CCD4'], [2, '#B87A3A']] as [number, string][]) { px(g, kx + dx - 1, ky + 2, 2, 5, INK); px(g, kx + dx, ky + 3, 1, 3, col); }
    px(g, hip[0] - bw - 2, hip[1] - 2, 4, 8, INK); px(g, hip[0] - bw - 1, hip[1] - 1, 2, 6, '#C03A3A'); px(g, hip[0] - bw - 1, hip[1] - 1, 1, 2, '#F08A8A');
  } else {
    // (the tool belt: its leather, the buckle, a pouch, a screwdriver, a tape)
    part(g, () => g.rect(hip[0] - bw - 1, hip[1] - 2, bw * 2 + belly + 3, 4), '#7A5228', hip[0] - bw - 1, hip[1] - 2, bw * 2 + belly + 3, 4, 1);
    px(g, hip[0] + 2, hip[1] - 2, 3, 4, '#D8B43A'); px(g, hip[0] + 2, hip[1] - 2, 1, 1, '#FFF0A0');
    part(g, () => g.rect(hip[0] + bw - 5, hip[1] - 1, 7, 9), '#8A5E2E', hip[0] + bw - 5, hip[1] - 1, 7, 9, 1); px(g, hip[0] + bw - 4, hip[1] + 2, 5, 1, dk('#8A5E2E', 0.4)); px(g, hip[0] + bw - 2, hip[1] + 3, 1, 1, '#D8B43A');
    px(g, hip[0] - bw + 1, hip[1] - 4, 4, 5, INK); px(g, hip[0] - bw + 2, hip[1] - 3, 2, 3, '#DC2626'); px(g, hip[0] - bw + 2, hip[1] - 3, 1, 1, '#FCA5A5'); px(g, hip[0] - bw + 2, hip[1] + 1, 2, 8, INK); px(g, hip[0] - bw + 2, hip[1] + 1, 1, 7, '#C8CCD4');
    px(g, hip[0] - 4, hip[1] + 1, 6, 6, INK); px(g, hip[0] - 3, hip[1] + 2, 4, 4, '#F2C83A'); px(g, hip[0] - 3, hip[1] + 2, 4, 1, '#FFF0A0'); px(g, hip[0] - 2, hip[1] + 4, 2, 1, INK);
  }
  leg(K.fN, true);
  // ---- the head: possessed (the grey-green, the lumps, the hanging jaw, the drool, the feeler, the eyes lit)
  part(g, () => g.rect(hx - 4, hy + 5, 6, sh[1] - hy - 3), skinF, hx - 4, hy + 5, 6, sh[1] - hy - 2, 1);
  part(g, () => g.ellipse(hx, hy, 7.6, 8.6, 0, 0, Math.PI * 2), skin, hx - 8, hy - 9, 16, 18, 1.2);
  ball(g, hx - 3, hy + 1, 2.3, skinF, 0.8); px(g, hx - 4, hy + 1, 1, 1, dk(skin, 0.45));
  ball(g, hx + 7.4, hy + 1.5, 1.9, skin, 0.8);
  // (the lumps: on the skull, on the jaw's hinge, something under them; veins over the cheek)
  ball(g, hx - 4, hy - 8, 3.4, mix(skin, '#9BF25E', 0.18), 0.8); ball(g, hx - 5, hy + 5, 2.2, mix(skin, '#9BF25E', 0.18), 0.8);
  g.strokeStyle = VEIN; g.lineWidth = 1; g.beginPath(); g.moveTo(hx - 6, hy - 6); g.lineTo(hx - 2, hy - 2); g.lineTo(hx - 3, hy + 3); g.moveTo(hx - 2, hy - 2); g.lineTo(hx + 1, hy - 1); g.stroke();
  // (the eye: its socket, lit green; the brow; the lashes; the glasses)
  px(g, hx + 1, hy - 4, 7, 4, dk(skin, 0.5)); px(g, hx + 2, hy - 3, 6, 3, INK); px(g, hx + 3, hy - 2, 4, 2, SLIME); px(g, hx + 5, hy - 2, 1, 1, SLIME_L);
  px(g, hx + 1, hy - 6, 7, L.woman ? 1 : 2, dk(hair === '#E8E4DC' ? '#8A8A8A' : hair, 0.1));
  if (L.woman) { px(g, hx + 7, hy - 4, 2, 1, INK); px(g, hx + 8, hy - 5, 1, 1, INK); }
  if (L.specs) { g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(hx + 1.5, hy - 4.5, 6, 5); px(g, hx - 5, hy - 3, 7, 1, INK); px(g, hx + 2, hy - 4, 2, 1, '#BFE8FF'); }
  // (the jaw hanging: the dark of the mouth, the teeth, the tongue; the drool off it)
  const jaw = pose === 'strike' || pose === 'throw' ? 5 : pose === 'hurt' ? 4 : 2;
  px(g, hx + 1, hy + 2, 8, 3 + jaw, INK); px(g, hx + 2, hy + 3, 6, 1 + jaw, '#3A0A14'); px(g, hx + 2, hy + 3, 6, 1, '#E8E0C8'); px(g, hx + 4, hy + 3, 1, 1, '#3A0A14');
  if (jaw > 2) { px(g, hx + 3, hy + 2 + jaw, 4, 2, '#9A3A4A'); px(g, hx + 3, hy + 2 + jaw, 2, 1, '#D06A7A'); }
  if (L.woman) px(g, hx + 2, hy + 2, 6, 1, '#A83A5A');
  px(g, hx + 5, hy + 4 + jaw, 2, 3 + (pose === 'stand' ? 2 : 0), SLIME); px(g, hx + 5, hy + 4 + jaw, 1, 2, SLIME_L);
  // (the feeler out of the ear, curling up)
  g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.moveTo(hx - 3, hy + 1); g.quadraticCurveTo(hx - 11, hy - 3, hx - 9, hy - 13); g.stroke();
  g.strokeStyle = '#4A9A3A'; g.lineWidth = 1.2; g.stroke(); g.lineCap = 'butt'; ball(g, hx - 9, hy - 14, 1.7, '#9AFC7A', 0.6);
  if (L.ring) { px(g, hx - 4, hy + 3, 2, 3, INK); px(g, hx - 4, hy + 4, 1, 1, '#FCE08A'); }
  // ---- the hair; the janitor's cap, the tech's hard hat (backward)
  const cap = () => { g.moveTo(hx - 8, hy + 1); g.quadraticCurveTo(hx - 8.5, hy - 10.5, hx + 2, hy - 10); g.quadraticCurveTo(hx + 9, hy - 9, hx + 8.4, hy - 4); g.lineTo(hx + 2, hy - 6.5); g.quadraticCurveTo(hx - 3, hy - 6, hx - 5, hy + 1); g.closePath(); };
  if (L.style === 3 && !L.woman) { px(g, hx - 2, hy - 8, 4, 1, lt(skin, 0.4)); px(g, hx - 3, hy - 7, 2, 1, lt(skin, 0.25)); dither(g, hx - 8, hy - 2, 4, 5, dk(hair, 0.1)); }
  else if (L.style === 4) for (let k = 0; k < 7; k++) { const a = Math.PI * (0.95 + k * 0.17); ball(g, hx + Math.cos(a) * 7, hy - 3 + Math.sin(a) * 7.5, 3.1, hair, 0.8); }
  else { partTop(g, cap, hair, hx - 9, hy - 11, 18, 13, 1); if (L.style === 3) ball(g, hx - 4, hy - 11, 3.6, hair, 1); }
  if (L.beard && !L.woman) partTop(g, () => { g.moveTo(hx - 4, hy + 3); g.quadraticCurveTo(hx + 1, hy + 12, hx + 8, hy + 8 + jaw); g.lineTo(hx + 9, hy + 5 + jaw); g.lineTo(hx + 1, hy + 6 + jaw); g.closePath(); }, hair, hx - 4, hy + 3, 13, 9 + jaw, 0.8);
  if (L.stache) { px(g, hx + 2, hy + 1, 7, 2, INK); px(g, hx + 3, hy + 1, 5, 1, hair); }
  if (jan && L.style !== 1) {
    partTop(g, () => { g.moveTo(hx - 8.5, hy - 5); g.quadraticCurveTo(hx - 8, hy - 13, hx + 1, hy - 12.5); g.quadraticCurveTo(hx + 8, hy - 12, hx + 8.5, hy - 6); g.closePath(); }, '#2A4A6A', hx - 9, hy - 13, 18, 8, 1);
    part(g, () => poly(g, [[hx + 5, hy - 8], [hx + 14, hy - 6.5], [hx + 13, hy - 5], [hx + 5, hy - 5]]), '#223C58', hx + 5, hy - 8, 9, 3, 0.9);
    px(g, hx, hy - 10, 3, 3, '#E5E7EB'); px(g, hx + 1, hy - 9, 1, 1, '#2A5AD0'); px(g, hx - 7, hy - 6, 13, 1, dk('#2A4A6A', 0.4));
  }
  if (!jan) {
    // (the hard hat, on backward: its shell and ridge, the brim out behind, a sticker, a scuff)
    part(g, () => poly(g, [[hx - 15, hy - 7], [hx - 6, hy - 9], [hx - 6, hy - 6], [hx - 14, hy - 5]]), '#D98A0A', hx - 15, hy - 9, 9, 4, 0.9);
    partTop(g, () => { g.moveTo(hx - 10, hy - 6); g.quadraticCurveTo(hx - 10, hy - 14.5, hx - 1, hy - 14.5); g.quadraticCurveTo(hx + 8.5, hy - 14.5, hx + 9, hy - 6); g.closePath(); }, '#F59E0B', hx - 10, hy - 15, 19, 9, 1.1);
    px(g, hx - 3, hy - 15, 4, 2, '#FDE08A'); px(g, hx - 2, hy - 15, 2, 8, dk('#F59E0B', 0.12)); px(g, hx - 9, hy - 7, 17, 1, dk('#F59E0B', 0.35));
    px(g, hx + 3, hy - 11, 4, 3, '#F1F5F9'); px(g, hx + 4, hy - 10, 2, 1, '#DC2626'); px(g, hx - 7, hy - 11, 2, 1, '#8A5A0A');
  }
  // ---- the near arm (over the body), its thing: the mop, the prod; the fist shut round it
  const near = arm(true), { tip, butt } = K;
  if (jan) {
    // (the mop: its wooden handle through the near hand, the ferrule, the head (gray strings, wet, slimed) at the end)
    cord(g, [butt, tip], 2.6, WOOD, 1.6);
    g.strokeStyle = lt(WOOD, 0.4); g.lineWidth = 0.8; g.beginPath(); g.moveTo(butt[0] - 0.6, butt[1] - 0.6); g.lineTo(tip[0] - 0.6, tip[1] - 0.6); g.stroke();
    const d = K.up ? -1 : 1, ux = (tip[0] - butt[0]), uy = (tip[1] - butt[1]), ul = Math.hypot(ux, uy) || 1;
    const fan = pose === 'strike' ? 1 : 0;
    const str = (k: number): P => [tip[0] + k * 2.6 + (K.up ? 0 : 2) + fan * 6, tip[1] + d * (11 - Math.abs(k)) + fan * (k * 1.5 - 4)];
    g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 4.6; for (let k = -3; k <= 3; k++) { const e = str(k); g.beginPath(); g.moveTo(tip[0], tip[1]); g.quadraticCurveTo(tip[0] + k * 2.4, tip[1] + d * 4, e[0], e[1]); g.stroke(); }
    for (let k = -3; k <= 3; k++) { const e = str(k); g.strokeStyle = ['#8A8A7A', '#B4B4A4', '#9E9E8E', '#CECEBE'][(k + 3) % 4]; g.lineWidth = 2.6; g.beginPath(); g.moveTo(tip[0], tip[1]); g.quadraticCurveTo(tip[0] + k * 2.4, tip[1] + d * 4, e[0], e[1]); g.stroke(); px(g, e[0] - 1, e[1] - (d > 0 ? 1 : 0), 2, 2, k % 2 ? '#5E5E50' : '#4A6A3A'); }
    g.lineCap = 'butt';
    px(g, str(-1)[0], str(-1)[1] - d * 4, 1, 1, '#F0F0E0'); px(g, str(2)[0], str(2)[1] - d * 6, 1, 1, '#F0F0E0'); if (!K.up) { px(g, str(1)[0], str(1)[1] + 1, 1, 3, SLIME); }
    const fx = tip[0] - (ux / ul) * 3, fy = tip[1] - (uy / ul) * 3; ball(g, fx, fy, 2.6, STEEL, 0.9);
  } else {
    // (the cattle prod: its yellow shaft, the black grip under the hand, a red trigger, the collar, two steel prongs)
    const ux = tip[0] - butt[0], uy = tip[1] - butt[1], ul = Math.hypot(ux, uy) || 1, dx = ux / ul, dy = uy / ul, nx = -dy, ny = dx;
    cord(g, [butt, tip], 3.4, PROD, 1.8);
    g.strokeStyle = lt(PROD, 0.5); g.lineWidth = 0.9; g.beginPath(); g.moveTo(butt[0] + nx * -1, butt[1] + ny * -1); g.lineTo(tip[0] + nx * -1, tip[1] + ny * -1); g.stroke();
    g.strokeStyle = dk(PROD, 0.35); g.beginPath(); g.moveTo(butt[0] + nx, butt[1] + ny); g.lineTo(tip[0] + nx, tip[1] + ny); g.stroke();
    cord(g, [butt, [butt[0] + dx * 9, butt[1] + dy * 9]], 3.8, '#26282E', 1.8); for (let k = 2; k < 9; k += 3) px(g, butt[0] + dx * k - 1, butt[1] + dy * k - 1, 1, 2, '#5A5E68');
    px(g, butt[0] + dx * 10 + nx * 2 - 1, butt[1] + dy * 10 + ny * 2 - 1, 2, 2, '#DC2626');
    const cx = tip[0] - dx * 2, cy = tip[1] - dy * 2; ball(g, cx, cy, 2.8, '#3A3E48', 0.9);
    for (const s of [-1.6, 1.6]) { cord(g, [[cx + nx * s, cy + ny * s], [tip[0] + dx * 5 + nx * s, tip[1] + dy * 5 + ny * s]], 1.2, STEEL, 1.2); px(g, tip[0] + dx * 5 + nx * s - 0.5, tip[1] + dy * 5 + ny * s - 0.5, 1, 1, '#FFFFFF'); }
  }
  // (the fist over the handle: the knuckles)
  ball(g, near[0], near[1], 3.3, skin, 1); px(g, near[0] + 1, near[1] - 2, 1, 4, dk(skin, 0.4)); px(g, near[0] - 2, near[1] - 2, 2, 1, lt(skin, 0.3));
  if (jan && K.out) { const [x, y] = K.handF; ball(g, x, y, 3, skinF, 1); px(g, x + 1, y - 1, 1, 3, dk(skinF, 0.4)); }
};
const SB = { x: -52, y: -134, w: 136, h: 142 };
export const drawStaff = (c: Ctx, kind: StaffKind, seed: number, pose: StaffPose, f: number) => {
  const q = pose === 'walk' ? Math.floor(f / 6) % 8 : 0, L = staffLook(seed);
  stamp(c, `wp3-st2-${kind}-${seed % 48}-${pose}-${q}`, SB.x, SB.y, SB.w, SB.h, g => paintStaff(g, kind, L, pose, q));
  if (kind !== 'tech') return;
  // (live: the prod's crackle off its prongs in its tell and its jab; the fuse's spark in the wind-up)
  const K = rigOf(kind, L, pose, q);
  if (K.out) {
    const [tx, ty] = K.tip;
    c.fillStyle = f % 4 < 2 ? '#BFDBFE' : '#FFFFFF'; c.fillRect(Math.round(tx + 5 + (f % 3)), Math.round(ty - 3 + ((f * 7) % 6)), 3, 3); c.fillRect(Math.round(tx + 3), Math.round(ty - 4 - ((f * 3) % 5)), 2, 2);
    c.fillStyle = '#7DD3FC'; c.fillRect(Math.round(tx + 8 - (f % 4)), Math.round(ty + 2 - ((f * 5) % 7)), 1, 3);
  }
  if (pose === 'wind') { const [fx, fy] = K.handF; c.fillStyle = f % 4 < 2 ? '#FDE047' : '#FFFFFF'; c.fillRect(Math.round(fx - 1 + (f % 3)), Math.round(fy - 14 - ((f * 5) % 6)), 3, 3); c.fillRect(Math.round(fx + 2 - (f % 2) * 4), Math.round(fy - 11), 1, 1); }
};
/** (the contact sheet's) */
export const paintStaffPose = paintStaff;

// ---------------------------------------------------------------------------------------------------------------
// The grubs

export type GrubPose = 'cling' | 'quiver' | 'drop' | 'crawl';
export const GRUB_POSES: GrubPose[] = ['cling', 'quiver', 'drop', 'crawl'];
const GRUB = '#3E9A30', GRUB_B = '#B8D878';
const paintGrub = (g: Ctx, pose: GrubPose, q: number) => {
  // (a fat ringed larva: hung off the ceiling its feet are up on the rock (s = 1: it hangs down below the origin), on the
  // floor the right way up; lit from the upper left either way)
  const s = pose === 'cling' || pose === 'quiver' ? 1 : -1;
  const wig = pose === 'quiver' ? Math.sin(q * 1.6) * 3 : pose === 'crawl' ? Math.sin(q * 0.8) * 2 : 0;
  const seg = (k: number) => {
    const x = -14 + k * 7 + (k % 2 ? wig : -wig) * 0.5, hump = Math.abs(Math.sin(k + q * 0.4)) * (pose === 'crawl' ? 2 : 0), r = 8 - Math.abs(k - 2) * 0.8;
    return { x, y: s * (9 + hump), r };
  };
  // (the stub feet (suckers), gripping what it's on; the tail's two spines)
  for (let k = 0; k < 5; k++) { const { x } = seg(k); px(g, x - 2, s > 0 ? 0 : -3, 4, 3, INK); px(g, x - 1, s > 0 ? 0 : -2, 2, 2, GRUB_B); }
  const t0 = seg(0); for (const dy of [-3, 2]) { g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.moveTo(t0.x - 5, t0.y + dy); g.lineTo(t0.x - 12, t0.y + dy * 2); g.stroke(); g.strokeStyle = '#E8E0B0'; g.lineWidth = 1; g.stroke(); }
  // (the rings, back to front: each in its steps, the pale belly toward the feet, a wet light on its back, a breathing
  // hole in its side, a bristle)
  for (let k = 0; k <= 4; k++) {
    const { x, y, r } = seg(k), col = k % 2 ? GRUB : lt(GRUB, 0.14);
    ball(g, x, y, r, col, 1.2);
    g.save(); g.beginPath(); g.arc(x, y, r - 0.6, 0, Math.PI * 2); g.clip();
    px(g, x - r, s > 0 ? y - r : y + r * 0.45, r * 2, r * 0.55, GRUB_B); dither(g, x - r, s > 0 ? y - r * 0.45 : y + r * 0.2, r * 2, 2, GRUB_B);
    px(g, x + r - 2, y - r, 2, r * 2, dk(col, 0.45));
    g.restore();
    px(g, x - r * 0.45, y - r * 0.55 + (s > 0 ? 3 : 0), 3, 1, '#E8FFD0'); px(g, x - r * 0.45, y - r * 0.55 + 1 + (s > 0 ? 3 : 0), 1, 1, '#E8FFD0');
    px(g, x + 1, y, 2, 2, dk(GRUB, 0.55)); px(g, x + 1, y, 1, 1, '#C04A6A');
    px(g, x - 1, y - s * (r + 2), 1, 2, INK);
  }
  // (the mouth: the head's dark ring, a throat of rings going down, hooks all round it)
  const h = seg(4), mx = h.x + 6, my = h.y;
  ball(g, mx, my, 6, dk(GRUB, 0.3), 1.2); flat(g, () => g.arc(mx + 0.5, my, 4.4, 0, Math.PI * 2), '#5A1A2A', 0.8);
  flat(g, () => g.arc(mx + 1, my, 2.4, 0, Math.PI * 2), '#2A060E', 0); px(g, mx - 2, my - 3, 2, 1, '#A84A5A');
  for (let k = 0; k < 7; k++) { const a = k * 0.9 + 0.2, x = mx + 0.5 + Math.cos(a) * 4.2, y = my + Math.sin(a) * 4.2; flat(g, () => poly(g, [[x - 1, y - 1], [x + 1, y - 1], [mx + 0.5 + Math.cos(a) * 1.6, my + Math.sin(a) * 1.6]]), '#F0E8D0', 0.5); }
  px(g, mx - 3, my - 7, 2, 2, INK); px(g, mx - 3, my - 7, 1, 1, '#F4E86A'); px(g, mx - 3, my + 5, 2, 2, INK); px(g, mx - 3, my + 5, 1, 1, '#F4E86A');
  // (wet: a drip gathering under it)
  if (pose !== 'crawl') { const d = seg(2); flat(g, () => g.ellipse(d.x + 2, s > 0 ? d.y + d.r + 2 : -2, 1.8, 3, 0, 0, Math.PI * 2), '#C8F59A', 0.8); px(g, d.x + 1, s > 0 ? d.y + d.r : -4, 1, 1, '#FFFFFF'); }
};
export const drawGrub = (c: Ctx, pose: GrubPose, f: number) => {
  const q = pose === 'quiver' || pose === 'crawl' ? Math.floor(f / 3) % 8 : 0;
  stamp(c, `wp3-grub2-${pose}-${q}`, -30, -26, 60, 52, g => paintGrub(g, pose, q));
  if (pose === 'quiver' && f % 18 < 9) { c.fillStyle = '#7AD04A'; c.fillRect(-1, 22 + (f % 9) * 2, 3, 4); c.fillStyle = '#E8FFD0'; c.fillRect(-1, 22 + (f % 9) * 2, 1, 1); }
};

// ---------------------------------------------------------------------------------------------------------------
// The eels (their middle 11 up from the origin: the middle of what can be hit)

export type EelPose = 'swim' | 'coil' | 'lunge';
export const EEL_POSES: EelPose[] = ['swim', 'coil', 'lunge'];
const EEL_G = '#2E8A52', EEL_P = '#5A2E7E', EEL_B = '#B8E0B0', EEL_Y = -11;
const eelSegs = (pose: EelPose, q: number): P[] => {
  const n = 9, segs: P[] = [];
  for (let k = 0; k < n; k++) {
    const x = pose === 'coil' ? 8 - k * 4 : 10 - k * 7, amp = pose === 'lunge' ? 1.5 : pose === 'coil' ? 9 : 5;
    segs.push([x, EEL_Y + Math.sin(k * (pose === 'coil' ? 1.3 : 0.8) - q * 0.8) * amp * (k / n + 0.2)]);
  }
  return segs;
};
const paintEel = (g: Ctx, pose: EelPose, q: number) => {
  // (its body: a chain of segments behind the head, waving; coiled: an S bunched up; lunging: straight out)
  const segs = eelSegs(pose, q), n = segs.length, rad = (k: number) => 6 - k * 0.45;
  // (the tail's fin; the fin down its back: a membrane on spines, under the body's rings)
  const [tx, ty] = segs[n - 1];
  part(g, () => poly(g, [[tx + 1, ty - 2], [tx - 9, ty - 6], [tx - 6, ty], [tx - 9, ty + 6], [tx + 1, ty + 2]]), '#7A4AA0', tx - 9, ty - 6, 10, 12, 1);
  px(g, tx - 6, ty - 3, 4, 1, '#B88AD8'); px(g, tx - 6, ty + 3, 4, 1, dk('#7A4AA0', 0.3));
  g.beginPath(); g.moveTo(segs[n - 2][0], segs[n - 2][1] - rad(n - 2));
  for (let k = n - 2; k >= 1; k--) g.lineTo(segs[k][0] + 2, segs[k][1] - rad(k) - (k % 2 ? 6 : 3.5));
  g.lineTo(segs[1][0] + 5, segs[1][1] - rad(1)); g.closePath();
  g.fillStyle = '#7A4AA0'; g.fill(); g.strokeStyle = INK; g.lineWidth = 1.2; g.lineJoin = 'round'; g.stroke();
  for (let k = 1; k < n - 1; k++) { const [x, y] = segs[k]; g.strokeStyle = k % 2 ? '#C8A0E8' : '#4A2468'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 1, y - rad(k)); g.lineTo(x + 2, y - rad(k) - (k % 2 ? 5 : 3)); g.stroke(); }
  // (the rings, tail to head: banded green and purple, each in its steps, the belly pale, a wet light along the back)
  for (let k = n - 1; k >= 0; k--) {
    const [x, y] = segs[k], r = rad(k), col = k % 3 === 1 ? EEL_P : k % 3 === 2 ? dk(EEL_G, 0.12) : EEL_G;
    ball(g, x, y, r, col, 1.2);
    g.save(); g.beginPath(); g.arc(x, y, r - 0.6, 0, Math.PI * 2); g.clip();
    px(g, x - r, y + r * 0.45, r * 2, r, EEL_B); dither(g, x - r, y + r * 0.45 - 2, r * 2, 2, EEL_B);
    g.restore();
    px(g, x - r * 0.5, y - r * 0.6, 2, 1, '#C8FFE0');
    if (k % 3 === 0 && k) { px(g, x, y - 1, 2, 2, '#F4E86A'); px(g, x, y - 1, 1, 1, '#FFFBD0'); }
  }
  // (the head: the skull, the gill slits behind it, the jaws (wide open lunging: the red of the mouth, the needles top
  // and bottom), the eye, the lure on its stalk)
  const [hx, hy] = segs[0], open = pose === 'lunge' ? 7 : pose === 'coil' ? 3.5 : 1.5;
  if (open > 2) flat(g, () => poly(g, [[hx + 6, hy - 1], [hx + 18, hy - 2], [hx + 17, hy + open + 1], [hx + 6, hy + 3]]), '#5A1A2A', 0);
  part(g, () => poly(g, [[hx + 2, hy + 2], [hx + 17, hy + open], [hx + 16, hy + open + 3], [hx + 8, hy + open + 4], [hx, hy + 5]]), lt(EEL_B, 0.1), hx, hy + 2, 17, open + 2, 1);
  if (open > 2) { px(g, hx + 7, hy + open - 1, 6, 2, '#C04A5A'); px(g, hx + 7, hy + open - 1, 3, 1, '#F08A9A'); }
  partTop(g, () => { g.moveTo(hx - 3, hy + 3); g.quadraticCurveTo(hx - 4, hy - 8, hx + 6, hy - 7.5); g.quadraticCurveTo(hx + 15, hy - 6, hx + 18.5, hy - 1.5); g.lineTo(hx + 17, hy + 1); g.lineTo(hx + 6, hy + 2.5); g.closePath(); }, EEL_G, hx - 4, hy - 8, 23, 11, 1.2);
  for (let k = 0; k < 5; k++) { const x = hx + 8 + k * 2; flat(g, () => poly(g, [[x, hy + 0.5], [x + 1.4, hy + 0.5], [x + 0.7, hy + 3.5]]), '#F4EED8', 0.4); flat(g, () => poly(g, [[x + 0.6, hy + open + 0.5], [x + 2, hy + open + 0.5], [x + 1.3, hy + open - 2.5]]), '#F4EED8', 0.4); }
  for (let k = 0; k < 3; k++) { px(g, hx - 1 + k * 2, hy - 3, 1, 5, dk(EEL_G, 0.55)); px(g, hx + k * 2, hy - 2, 1, 3, '#C04A6A'); }
  px(g, hx + 14, hy - 4, 2, 1, dk(EEL_G, 0.6)); px(g, hx + 3, hy - 7, 6, 1, '#8AE0A8');
  ball(g, hx + 9, hy - 3.5, 2.6, '#F4E040', 1); px(g, hx + 9, hy - 5, 1, 4, INK); px(g, hx + 8, hy - 5, 1, 1, '#FFFBD0'); px(g, hx + 6, hy - 6, 6, 1, dk(EEL_G, 0.5));
  g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 2.6; g.beginPath(); g.moveTo(hx + 4, hy - 6); g.quadraticCurveTo(hx + 8, hy - 17, hx + 16, hy - 13); g.stroke();
  g.strokeStyle = EEL_G; g.lineWidth = 1.3; g.stroke(); g.lineCap = 'butt';
  ball(g, hx + 16, hy - 13, 2.6, '#A7F3D0', 0.9); px(g, hx + 15, hy - 14, 1, 1, '#FFFFFF');
};
export const drawEel = (c: Ctx, pose: EelPose, f: number) => {
  const q = Math.floor(f / 5) % 8;
  stamp(c, `wp3-eel2-${pose}-${q}`, -64, -40, 96, 52, g => paintEel(g, pose, q));
  // (the lure: glowing (bright in the tell))
  const [hx, hy] = eelSegs(pose, q)[0], on = pose === 'coil';
  c.globalAlpha = on ? 0.5 : 0.3; c.fillStyle = '#A7F3D0'; c.beginPath(); c.arc(hx + 16, hy - 13, on ? 7 : 4.5, 0, Math.PI * 2); c.fill();
  c.globalAlpha = on ? 0.9 : 0.6; c.fillStyle = '#E8FFF4'; c.fillRect(Math.round(hx + 15), Math.round(hy - 14), on && f % 6 < 3 ? 3 : 2, 2); c.globalAlpha = 1;
};
