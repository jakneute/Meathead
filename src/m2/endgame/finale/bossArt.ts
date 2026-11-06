// THE KAIJU FINALE's two bosses, drawn: SATAN (his own painting from Spooky Land's hell, spooky/hell/satanArt.ts, from
// the horns to the chest, baked once small into a canvas of its own so he can be drawn turned as he's thrown; under it
// his belly, a loincloth, legs to black hooves, a tail, and arms posed for every move, all in his skin's ramp, lit
// from under) and ZARBLAX, the widow (Zorblax's wife and sister, out of her saucer and embiggened: her people's green
// hide and cinder-block jaw, the under-bite's pegs, lipstick past the lines, the cigarette, her ONE big eye in blue
// shadow, the tiny cranium in curlers under a hairnet, the pink bow, the quilted pink housecoat, pearls sunk in the
// neck rolls, fuzzy slippers). Every elbow and knee off art/limb.ts. Drawn about their feet, facing right; the caller
// turns them.
//
// Both about two and a half Meatheads tall: kaiju to his kaiju (the park's a miniature under all three).

import { paintSatan, drawSatanFace } from '../../spooky/hell/satanArt';
import { elbow, knee, reachTo, elbowFront, kneeFront } from '../../art/limb';
const INK = '#0B0A10';

type Ctx = CanvasRenderingContext2D;
type P = [number, number];

// ---------------------------------------------------------------------------------------------------------------
// Satan

/** His painting's scale here, where it's cut (above its folded arms), and his height. */
export const SATAN_S = 0.17, SATAN_H = 168;
const CUT_Y = 372, PAINT_TOP = 90;
const UPPER_H = (CUT_Y + PAINT_TOP) * SATAN_S;
/** Where the painting's top sits (from his feet) and its local origin (the top of his head) on him. */
const UP_TOP = -SATAN_H, HEAD0 = UP_TOP + PAINT_TOP * SATAN_S;
const SK = ['#260404', '#4A0A08', '#721410', '#982018', '#BE3424', '#DE5838'];
const HOOF = '#120C0C';

let upper: HTMLCanvasElement | null = null;
/** His painting, baked the once (2 to the world pixel, the screen's), cut above the folded arms. Heavy: painted in the
 *  opening cutscene's first quiet moment (warmSatan), never mid-fight. */
export const satanUpper = () => {
  if (upper) return upper;
  const S2 = SATAN_S * 2;
  const cv = document.createElement('canvas'); cv.width = Math.ceil(880 * S2); cv.height = Math.ceil(UPPER_H * 2);
  const g = cv.getContext('2d')!;
  g.save(); g.beginPath(); g.rect(0, 0, cv.width, cv.height); g.clip();
  g.scale(S2, S2); g.translate(440, PAINT_TOP); paintSatan(g);
  g.restore();
  upper = cv;
  return cv;
};
export const warmSatan = () => { satanUpper(); };

export type SatanPose = 'idle' | 'walk' | 'crouch' | 'air' | 'land' | 'inhale' | 'breath' | 'lob' | 'clawTell' | 'claw' | 'rain' | 'dazed' | 'held' | 'thrown' | 'talk';
export const SATAN_POSES: SatanPose[] = ['idle', 'walk', 'crouch', 'air', 'land', 'inhale', 'breath', 'lob', 'clawTell', 'claw', 'rain', 'dazed', 'held', 'thrown', 'talk'];

const SH: P = [-38, -118], SH2: P = [38, -118];
const HIP: P = [-11, -62], HIP2: P = [11, -62];
const ARM = 34, LEG = 32;

const limb = (c: Ctx, a: P, j: P, b: P, w: number, col: string, lit: string) => {
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (const [cc, ww] of [[INK, w + 2], [col, w], [lit, Math.max(1, w * 0.3)]] as [string, number][]) {
    c.strokeStyle = cc; c.lineWidth = ww; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(j[0], j[1]); c.lineTo(b[0], b[1]); c.stroke();
  }
  c.lineCap = 'butt'; c.lineJoin = 'miter';
};
const claw = (c: Ctx, at: P, dir: number) => {
  c.fillStyle = INK; c.beginPath(); c.arc(at[0], at[1], 5, 0, Math.PI * 2); c.fill();
  c.fillStyle = SK[3]; c.beginPath(); c.arc(at[0], at[1], 4, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#2A2422'; c.lineWidth = 1.5;
  for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(at[0] + dir * 3, at[1] + k * 2); c.lineTo(at[0] + dir * 8, at[1] + k * 3 + 2); c.stroke(); }
};

/** Satan: feet at the origin, facing right. `t` a frame count (the walk, the breath), `talk` his mouth going. */
export const drawSatanBody = (c: Ctx, pose: SatanPose, t: number, talk = false, flash = 0) => {
  // (hit: a jolt)
  if (flash > 0) c.translate(flash % 2 ? 2 : -2, 0);
  const walk = pose === 'walk' ? Math.sin(t * 0.18) : 0;
  const crouch = pose === 'crouch' || pose === 'land' ? 16 : pose === 'dazed' ? 34 : pose === 'inhale' ? 4 : 0;
  const lean = pose === 'breath' ? 0.12 : pose === 'inhale' ? -0.1 : pose === 'claw' ? 0.18 : pose === 'clawTell' ? -0.12 : 0;
  c.save();
  c.translate(0, crouch);
  // (the tail, behind: a lazy S to the arrowhead)
  const tw = Math.sin(t * 0.08) * 6;
  c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(-6, -58); c.quadraticCurveTo(-46, -40 + tw, -54, -12); c.stroke();
  c.strokeStyle = SK[2]; c.lineWidth = 4; c.stroke();
  c.fillStyle = INK; c.beginPath(); c.moveTo(-54, -20); c.lineTo(-62, -4); c.lineTo(-46, -8); c.closePath(); c.fill();
  // (the legs: the far one darker; knees forward)
  const feet: [P, P] = pose === 'air' ? [[-14, -18], [16, -10]] : pose === 'dazed' ? [[24, -crouch + 2], [40, -crouch + 2]] : [[-12 + walk * 12, -crouch], [12 - walk * 12, -crouch]];
  const hips: [P, P] = [HIP, HIP2];
  for (let k = 0; k < 2; k++) {
    // (he's front-on, his painting: the knees out to the sides, a wrestler's)
    const h = hips[k], f = reachTo(h[0], h[1], feet[k][0], feet[k][1], LEG, LEG), kn = kneeFront(h[0], h[1], f[0], f[1], LEG, LEG, k ? 1 : -1);
    limb(c, h, kn, f, k ? 13 : 12, k ? SK[3] : SK[2], k ? SK[5] : SK[4]);
    c.fillStyle = INK; c.fillRect(f[0] - 7, f[1] - 4, 14, 6); c.fillStyle = HOOF; c.fillRect(f[0] - 6, f[1] - 3, 12, 4); c.fillStyle = '#3A2A2A'; c.fillRect(f[0] - 6, f[1] - 3, 12, 1);
  }
  c.rotate(lean);
  // (the belly under the painting's cut, its abs; the loincloth)
  c.fillStyle = INK; c.beginPath(); c.moveTo(-30, -90); c.lineTo(30, -90); c.lineTo(20, -58); c.lineTo(-20, -58); c.closePath(); c.fill();
  c.fillStyle = SK[3]; c.beginPath(); c.moveTo(-29, -89); c.lineTo(29, -89); c.lineTo(19, -59); c.lineTo(-19, -59); c.closePath(); c.fill();
  c.fillStyle = SK[4]; for (let r = 0; r < 2; r++) for (const s of [-1, 1]) c.fillRect(s < 0 ? -11 : 2, -86 + r * 9, 9, 7);
  c.fillStyle = SK[1]; c.fillRect(-1, -88, 2, 26);
  c.fillStyle = INK; c.fillRect(-22, -64, 44, 12); c.fillStyle = '#2A0A0A'; c.fillRect(-21, -63, 42, 10); c.fillStyle = '#4A1410'; c.fillRect(-21, -63, 42, 2);
  c.fillStyle = '#E8C44A'; c.fillRect(-3, -63, 6, 4);
  const arms = satanArms(pose, t);
  // (the painting: horns to chest, wings and all)
  const up = satanUpper();
  c.drawImage(up, -440 * SATAN_S, UP_TOP, 880 * SATAN_S, UPPER_H);
  c.save(); c.translate(0, HEAD0); c.scale(SATAN_S, SATAN_S); drawSatanFace(c, t, talk); c.restore();
  if (pose === 'dazed') drawStars(c, 0, HEAD0 - 4, t);
  // (both arms over him (front-on: out from the painting's shoulders), every elbow out to its side)
  for (let k = 0; k < 2; k++) {
    const s = k ? SH2 : SH, hd = reachTo(s[0], s[1], arms[k][0], arms[k][1], ARM, ARM), el = elbowFront(s[0], s[1], hd[0], hd[1], ARM, ARM, k ? 1 : -1);
    limb(c, s, el, hd, 12, k ? SK[3] : SK[2], k ? SK[5] : SK[4]); claw(c, hd, k ? 1 : -1);
  }
  // (the breath's inhale: his cheeks' smoke)
  if (pose === 'inhale') { c.fillStyle = 'rgba(90, 80, 80, 0.5)'; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(16 + k * 4, HEAD0 + 60 - k * 5 - (t % 20), 4 + k, 0, Math.PI * 2); c.fill(); } }
  c.restore();
};
/** Where his hands go, by pose (from his feet, facing right): the far arm, the near. */
const satanArms = (pose: SatanPose, t: number): [P, P] => {
  const sw = Math.sin(t * 0.18) * 8;
  switch (pose) {
    case 'walk': return [[-46 + sw, -80], [46 - sw, -80]];
    case 'crouch': return [[-54, -66], [54, -70]];
    case 'air': return [[-62, -150], [62, -152]];
    case 'land': return [[-60, -60], [60, -60]];
    case 'inhale': return [[-26, -100], [26, -100]];
    case 'breath': return [[-48, -84], [68, -120]];
    case 'lob': return [[-48, -80], [46, -180]];
    case 'clawTell': return [[-48, -80], [34, -172]];
    case 'claw': return [[-48, -82], [86, -98]];
    case 'rain': return [[-46, -182], [46, -184]];
    case 'dazed': return [[-54, -50], [54, -50]];
    case 'held': return [[-62, -140 + sw], [64, -136 - sw]];
    case 'thrown': return [[-68, -150], [68, -150]];
    case 'talk': return [[-48, -80], [58, -120]];
    default: return [[-48, -80], [48, -80]];
  }
};
/** Stars and birdies round a dazed head. */
export const drawStars = (c: Ctx, x: number, y: number, t: number) => {
  for (let k = 0; k < 5; k++) {
    const a = t * 0.08 + (k / 5) * Math.PI * 2, sx = x + Math.cos(a) * 26, sy = y + Math.sin(a) * 7;
    c.fillStyle = INK; c.fillRect(Math.round(sx) - 3, Math.round(sy) - 3, 7, 7);
    c.fillStyle = k % 2 ? '#FDE047' : '#F8FAFC'; c.fillRect(Math.round(sx) - 2, Math.round(sy) - 1, 5, 3); c.fillRect(Math.round(sx) - 1, Math.round(sy) - 2, 3, 5);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Zarblax, the widow

export const WIDOW_H = 150;
const HIDE = ['#203214', '#385424', '#527236', '#6E8E4A', '#8AA860', '#A8C27A'];
const COAT = ['#480C30', '#86285E', '#BC4A88', '#E070AA', '#F49AC6', '#FCC0DC'];
const CURLER = ['#6A9CF4', '#F472B6'];
export type WidowPose = 'idle' | 'walk' | 'squat' | 'air' | 'eye' | 'laser' | 'lowlaser' | 'call' | 'flick' | 'dazed' | 'held' | 'thrown' | 'talk';
export const WIDOW_POSES: WidowPose[] = ['idle', 'walk', 'squat', 'air', 'eye', 'laser', 'lowlaser', 'call', 'flick', 'dazed', 'held', 'thrown', 'talk'];
const WSH: P = [-14, -98], WSH2: P = [16, -98];
const WHIP: P = [-8, -40], WHIP2: P = [8, -40];

const widowArms = (pose: WidowPose, t: number): [P, P] => {
  const sw = Math.sin(t * 0.2) * 7;
  switch (pose) {
    case 'walk': return [[-22 + sw, -62], [24 - sw, -62]];
    case 'squat': return [[-30, -54], [34, -56]];
    case 'air': return [[-36, -120], [40, -122]];
    case 'eye': return [[-20, -64], [30, -128]];
    case 'laser': case 'lowlaser': return [[-24, -66], [14, -126]];
    case 'call': return [[-22, -64], [24, -150 + sw]];
    case 'flick': return [[-22, -64], [44, -108]];
    case 'dazed': return [[-30, -34], [30, -34]];
    case 'held': return [[-36, -112 - sw], [40, -110 + sw]];
    case 'thrown': return [[-40, -128], [40, -128]];
    case 'talk': return [[-22, -62], [34, -96]];
    default: return [[-22, -62], [24, -62]];
  }
};

/** The widow: feet at the origin, facing right. */
export const drawWidowBody = (c: Ctx, pose: WidowPose, t: number, talk = false, flash = 0) => {
  if (flash > 0) c.translate(flash % 2 ? 2 : -2, 0);
  const walk = pose === 'walk' ? Math.sin(t * 0.2) : 0;
  const drop = pose === 'squat' ? 18 : pose === 'dazed' ? 30 : pose === 'lowlaser' ? 22 : 0;
  c.save(); c.translate(0, drop);
  // (the legs: short, green, knees forward; fuzzy pink slippers)
  const feet: [P, P] = pose === 'air' ? [[-12, -14], [14, -8]] : pose === 'dazed' ? [[22, -drop + 2], [36, -drop + 2]] : [[-10 + walk * 10, -drop], [10 - walk * 10, -drop]];
  for (let k = 0; k < 2; k++) {
    const h = k ? WHIP2 : WHIP, f = reachTo(h[0], h[1], feet[k][0], feet[k][1], 21, 21), kn = knee(h[0], h[1], f[0], f[1], 21, 21, 1);
    limb(c, h, kn, f, 9, k ? HIDE[3] : HIDE[2], HIDE[4]);
    c.fillStyle = INK; c.beginPath(); c.ellipse(f[0] + 3, f[1] - 2, 9, 4, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#F9A8D4'; c.beginPath(); c.ellipse(f[0] + 3, f[1] - 2, 8, 3, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FBCFE8'; c.fillRect(f[0] - 2, f[1] - 5, 8, 2);
  }
  const arms = widowArms(pose, t);
  const lean = pose === 'lowlaser' ? 0.5 : pose === 'flick' ? 0.1 : 0;
  c.save(); c.translate(0, -40); c.rotate(lean); c.translate(0, 40);
  // (the far arm)
  {
    const s = WSH, hd = reachTo(s[0], s[1], arms[0][0], arms[0][1], 24, 24), el = elbow(s[0], s[1], hd[0], hd[1], 24, 24, 1);
    limb(c, s, el, hd, 8, HIDE[2], HIDE[4]); hand(c, hd);
  }
  // (the housecoat: quilted, belted, the hem down past the knees)
  c.fillStyle = INK; c.beginPath(); c.moveTo(-22, -104); c.lineTo(24, -104); c.lineTo(32, -30); c.lineTo(-30, -30); c.closePath(); c.fill();
  for (let i = 0; i < 5; i++) { c.fillStyle = COAT[5 - i]; const y0 = -103 + i * 14.6; c.beginPath(); c.moveTo(-21 - i * 1.6, y0); c.lineTo(23 + i * 1.6, y0); c.lineTo(24 + (i + 1) * 1.6, y0 + 15); c.lineTo(-22 - (i + 1) * 1.6, y0 + 15); c.closePath(); c.fill(); }
  // (the quilting: kept inside the coat)
  c.save(); c.beginPath(); c.moveTo(-21, -103); c.lineTo(23, -103); c.lineTo(31, -31); c.lineTo(-29, -31); c.closePath(); c.clip();
  c.strokeStyle = COAT[1]; c.lineWidth = 1;
  for (let k = -4; k <= 4; k++) { c.beginPath(); c.moveTo(k * 10 - 14, -102); c.lineTo(k * 10 + 18, -32); c.moveTo(k * 10 + 14, -102); c.lineTo(k * 10 - 18, -32); c.stroke(); }
  c.restore();
  c.fillStyle = COAT[0]; c.fillRect(-26, -66, 54, 4); c.fillStyle = COAT[5]; c.fillRect(-26, -66, 54, 1);
  // (the neck: rolls, the pearls sunk in them)
  for (let k = 0; k < 3; k++) { c.fillStyle = INK; c.beginPath(); c.ellipse(2, -106 - k * 4, 16 - k, 4, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = HIDE[3 + (k % 2)]; c.beginPath(); c.ellipse(2, -106 - k * 4, 15 - k, 3, 0, 0, Math.PI * 2); c.fill(); }
  for (let k = 0; k < 7; k++) { c.fillStyle = '#F8F4EC'; c.fillRect(-10 + k * 4, -108 + Math.abs(k - 3), 3, 3); c.fillStyle = '#C8BEAE'; c.fillRect(-10 + k * 4, -106 + Math.abs(k - 3), 3, 1); }
  drawWidowHead(c, pose, t, talk);
  if (pose === 'dazed') drawStars(c, 0, -152, t);
  // (the near arm)
  {
    const s = WSH2, hd = reachTo(s[0], s[1], arms[1][0], arms[1][1], 24, 24), el = elbow(s[0], s[1], hd[0], hd[1], 24, 24, 1);
    limb(c, s, el, hd, 9, HIDE[3], HIDE[5]); hand(c, hd);
    if (pose === 'flick') { c.fillStyle = '#F8F4EC'; c.fillRect(hd[0] + 2, hd[1] - 2, 8, 3); c.fillStyle = '#F97316'; c.fillRect(hd[0] + 9, hd[1] - 2, 2, 3); }
  }
  c.restore();
  c.restore();
};
const hand = (c: Ctx, at: P) => {
  c.fillStyle = INK; c.beginPath(); c.arc(at[0], at[1], 5, 0, Math.PI * 2); c.fill();
  c.fillStyle = HIDE[3]; c.beginPath(); c.arc(at[0], at[1], 4, 0, Math.PI * 2); c.fill();
  c.fillStyle = HIDE[1]; for (let k = -1; k <= 1; k++) c.fillRect(Math.round(at[0] + 3), Math.round(at[1] + k * 2.5), 4, 2);
};
/** Her head: the block of a jaw out front, the pegs up over the lip, the lipstick, the cigarette; the one big eye; the
 *  tiny cranium on the back in its curlers and net, the bow; the wart, the rouge, the hoop. */
export const drawWidowHead = (c: Ctx, pose: WidowPose, t: number, talk: boolean) => {
  const open = talk && (t >> 3) % 2 === 0, glow = pose === 'eye' || pose === 'laser' || pose === 'lowlaser';
  // (the cranium: small, perched on the back; curlers in rows, the net over them, the bow)
  c.fillStyle = INK; c.beginPath(); c.ellipse(-6, -142, 14, 11, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = HIDE[3]; c.beginPath(); c.ellipse(-6, -142, 13, 10, 0, 0, Math.PI * 2); c.fill();
  for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) { const x = -16 + k * 6 + r * 3, y = -150 + r * 6; c.fillStyle = INK; c.fillRect(x - 1, y - 1, 6, 5); c.fillStyle = CURLER[(k + r) % 2]; c.fillRect(x, y, 4, 3); c.fillStyle = '#FFFFFF'; c.fillRect(x, y, 4, 1); }
  c.strokeStyle = 'rgba(40, 30, 50, 0.5)'; c.lineWidth = 1; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-20 + k * 7, -154); c.lineTo(-14 + k * 7, -136); c.stroke(); }
  c.fillStyle = INK; c.beginPath(); c.moveTo(-18, -152); c.lineTo(-30, -160); c.lineTo(-30, -146); c.closePath(); c.fill(); c.beginPath(); c.moveTo(-18, -152); c.lineTo(-6, -162); c.lineTo(-6, -148); c.closePath(); c.fill();
  c.fillStyle = '#F25BAA'; c.beginPath(); c.moveTo(-18, -152); c.lineTo(-29, -158); c.lineTo(-29, -147); c.closePath(); c.fill(); c.beginPath(); c.moveTo(-18, -152); c.lineTo(-7, -160); c.lineTo(-7, -149); c.closePath(); c.fill();
  c.fillStyle = '#D02E86'; c.fillRect(-20, -154, 5, 5);
  // (the face: the eye's socket up front of the cranium)
  c.fillStyle = INK; c.beginPath(); c.ellipse(8, -134, 16, 12, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = HIDE[4]; c.beginPath(); c.ellipse(8, -134, 15, 11, 0, 0, Math.PI * 2); c.fill();
  // (the ONE eye: caked in blue shadow up to the curlers, the false lashes, a purple iris drifting)
  c.fillStyle = '#3A6CD4'; c.beginPath(); c.ellipse(10, -138, 11, 8, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = glow ? '#FDE047' : '#F8FAFC'; c.beginPath(); c.ellipse(11, -136, 8, 6, 0, 0, Math.PI * 2); c.fill();
  const drift = Math.round(Math.sin(t * 0.05) * 2);
  c.fillStyle = glow ? '#EF4444' : '#8C5ADC'; c.beginPath(); c.arc(13 + drift, -136, 3.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = INK; c.fillRect(12 + drift, -137, 2, 2);
  c.strokeStyle = INK; c.lineWidth = 1.2; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(4 + k * 3.5, -142); c.lineTo(2 + k * 4, -147); c.stroke(); }
  c.strokeStyle = '#2A2028'; c.beginPath(); c.moveTo(3, -151); c.quadraticCurveTo(10, -156, 19, -150); c.stroke();
  // (the cinder-block jaw, jutting out past everything; the pegs up over the lip; the lipstick slathered past the lines)
  const jy = open ? 4 : 0;
  c.fillStyle = INK; c.fillRect(-4, -127 + jy, 36, 20); c.fillStyle = HIDE[3]; c.fillRect(-3, -126 + jy, 34, 18); c.fillStyle = HIDE[5]; c.fillRect(-3, -126 + jy, 34, 2); c.fillStyle = HIDE[1]; c.fillRect(-3, -110 + jy, 34, 2);
  if (open) { c.fillStyle = '#360412'; c.fillRect(4, -128, 26, 5); }
  c.fillStyle = '#D2245C'; c.fillRect(2, -128 + jy, 30, 3); c.fillStyle = '#F4467C'; c.fillRect(4, -129 + jy, 24, 1);
  for (let k = 0; k < 5; k++) { c.fillStyle = INK; c.fillRect(6 + k * 5, -133 + jy, 4, 6); c.fillStyle = k === 2 ? '#F2C444' : '#E0CE94'; c.fillRect(7 + k * 5, -132 + jy, 2, 5); c.fillStyle = '#806434'; c.fillRect(7 + k * 5, -128 + jy, 2, 1); }
  // (the rouge, the wart and its hairs, the hoop at the jaw's back)
  c.fillStyle = 'rgba(244, 70, 124, 0.55)'; c.beginPath(); c.arc(0, -124 + jy, 4, 0, Math.PI * 2); c.fill();
  c.fillStyle = HIDE[1]; c.beginPath(); c.arc(24, -110 + jy, 2, 0, Math.PI * 2); c.fill(); c.strokeStyle = INK; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(24, -110 + jy); c.lineTo(22 + k * 2, -106 + jy); c.stroke(); }
  c.strokeStyle = '#F2C444'; c.lineWidth = 1.5; c.beginPath(); c.arc(-4, -114 + jy, 3, 0, Math.PI * 2); c.stroke();
  // (the cigarette in the slot's corner, its ash long and bent; dangling off the lip when she talks)
  if (pose !== 'flick') {
    const cx = 30, cy = open ? -122 : -127;
    c.save(); c.translate(cx, cy); c.rotate(open ? 0.6 : 0.15);
    c.fillStyle = INK; c.fillRect(-1, -2, 13, 4); c.fillStyle = '#F8F4EC'; c.fillRect(0, -1, 11, 2); c.fillStyle = '#F4467C'; c.fillRect(0, -1, 2, 2); c.fillStyle = '#9A9AA0'; c.fillRect(9, -1, 3, 2);
    c.fillStyle = (t >> 3) % 2 ? '#F97316' : '#FDBA74'; c.fillRect(12, -1, 1, 2);
    c.restore();
  }
};
