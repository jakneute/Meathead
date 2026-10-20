// STUPID DAD, drawn (Cartoon Land's boss: everybody draws him from here). At Meathead 2's boss grade, on par with Piper,
// Tucker, Donnie and Artie: color ramps (light, base, shade, deep, line) in stepped bands with a dithered seam between
// them, every material its own darkest tone for an outline (paint.ts).
//
// Who he is (the user's): LYLE BRISCOE, the man who voiced the dad on STUPID DAD (UBX, 1995), the only one of the
// principal cast still alive (the rest drank themselves to death or died drunk behind the wheel), in his seventies now
// and a drunk too. He does the show live in the park's amphitheater twice a day in the dad's own look from the poster
// (bigkid/art.ts dadArt): the stained white tank top, the striped boxers, the black socks pulled up, the slippers, the
// three-hair comb-over (gone white). On him it's no costume: the belly's real, so's the beer (a can of SWILL LITE), so's
// the nose (a drinker's: purple, swollen, veined). Liver spots on the dome and the arms, white stubble, jowls, eyes
// bloodshot and half shut, a faded Navy anchor on his forearm, a skin-colored headset mic taped along his cheek (it's a
// live show).
//
// drawDad(c, x, feetY, pose, frame, opts): his feet's point (seated: the floor under the couch's front), facing left
// (opts.facing 1: right). drawDadCloseup(c, cx, cy, scale, frame, opts): his face at close-up size (the intro: he
// squints at Meathead and thinks it's the Boy). drawCouch(c, x, floorY, frame, opts): the show's couch (orange plaid,
// sagging, the dent he's worn in it), his seat on it at DAD_SEAT.

import { mix } from '../kit';
import type { DadPose } from './state';
import { type Ctx, type Ramp, shape, shapeTop, ell, px, line, limb, fill, dith } from './paint';

/** His size: the drawing's units to world px (stood up he's about 104 tall: a head and a half over Meathead). */
export const DAD_K = 0.8;
/** How tall he is (world px), stood and sat, for words over his head. */
export const DAD_H = 106, DAD_SIT_H = 90;

// ---------------------------------------------------------------------------------------------------------------
// Ramps

const SKIN: Ramp = ['#FCE0CF', '#EFBFA6', '#D59B82', '#B27461', '#5E3026'];
const FLUSH: Ramp = ['#F7A3B0', '#DE6178', '#BE4260', '#932C49', '#4A0F20'];
const TANK: Ramp = ['#FFFFFF', '#EEEBE2', '#D2CDBF', '#ABA596', '#5A564C'];
const BOXER: Ramp = ['#EAF2FC', '#C7DCF3', '#9CBAE0', '#7393BE', '#2C3E66'];
const SOCK: Ramp = ['#55555E', '#2E2E35', '#1F1F24', '#141418', '#000000'];
const SLIPPER: Ramp = ['#C49466', '#9A6A40', '#7A4F2C', '#58361C', '#24140A'];
const HAIR: Ramp = ['#FFFFFF', '#E8E8E8', '#C4C4C4', '#9A9A9A', '#545454'];
const CAN: Ramp = ['#F25A6E', '#C8102E', '#9E0C24', '#760819', '#38030B'];
const STRIPE = '#3B6FB6', STAIN = '#DCC67C', MUSTARD = '#C99A2E', SPOT = '#C99474', VEIN = '#8A92C4', TAT = '#5B7A9C';
const EYE_W = '#F5E4DC', EYE_RED = '#E0707A', IRIS = '#7EA4C8', BAG = '#B98478', MIC = '#E3C2A2', TEETH = '#E8DCAE';

// ---------------------------------------------------------------------------------------------------------------
// His parts (facing left, in his units, about his feet)

export type DadFace = 'bleary' | 'sip' | 'yell' | 'squint' | 'angry' | 'burp' | 'strain' | 'out';

/** A can of SWILL LITE (its middle at (x, y), tipped by `ang` (0 upright), crushed 0..1). */
export const can = (c: Ctx, x: number, y: number, ang: number, crushed = 0, open = true) => {
  c.save(); c.translate(x, y); c.rotate(ang);
  const h = 15 - crushed * 9, w = 7 + crushed * 2;
  shape(c, () => { c.moveTo(-w / 2, -h / 2); c.lineTo(w / 2, -h / 2); c.lineTo(w / 2 - crushed, 0); c.lineTo(w / 2, h / 2); c.lineTo(-w / 2, h / 2); c.lineTo(-w / 2 + crushed, 0); c.closePath(); }, CAN, -w / 2, w / 2, 0.8);
  px(c, -w / 2 + 0.5, -h / 2 + 3, w - 1, 3, '#F4F1E8');
  px(c, -w / 2 + 1.5, -h / 2 + 4, w - 3, 1, '#C8102E');
  px(c, -w / 2, -h / 2 - 1, w, 1.4, '#C9CDD4'); px(c, -w / 2, h / 2 - 0.4, w, 1.4, '#9AA0A8');
  if (open && !crushed) px(c, -1, -h / 2 - 1.6, 2, 0.8, '#3A3A3A');
  if (crushed > 0.3) { line(c, [-w / 2 + 1, -2, w / 2 - 1, 1], 0.6, '#5A0612'); line(c, [-w / 2 + 1, 2, w / 2 - 1, -1], 0.6, '#F7B3BD'); }
  c.restore();
};

/** His head (the middle of his skull at (hx, hy)): `dir` -1 three-quarters left, 1 right; `tilt` back (sipping). */
const head = (c: Ctx, hx: number, hy: number, face: DadFace, f: number, dir: number, tilt = 0, talking = false) => {
  c.save(); c.translate(hx, hy); c.rotate(tilt * -dir); if (dir > 0) c.scale(-1, 1);
  // (the far ear, the fringe round the back: white, thin, sticking out)
  shape(c, () => c.ellipse(9, 2, 4, 6, 0.2, 0, Math.PI * 2), SKIN, 5, 13);
  ell(c, 9.5, 2, 1.6, 3.2, SKIN[3]);
  px(c, 8, -1, 1, 2, HAIR[1]); px(c, 10, -2, 1, 3, HAIR[1]);
  // (the jowls and the double chin, under the skull)
  shapeTop(c, () => { c.moveTo(-14, 2); c.quadraticCurveTo(-16, 14, -6, 16); c.quadraticCurveTo(4, 18, 9, 9); c.lineTo(8, 0); c.closePath(); }, face === 'strain' || face === 'angry' ? FLUSH : SKIN, 0, 18);
  // (the skull: bald, a dome, liver spots, a sheen)
  shape(c, () => c.ellipse(-2, -4, 14, 15, 0, 0, Math.PI * 2), face === 'strain' ? [SKIN[0], mix(SKIN[1], FLUSH[1], 0.4), mix(SKIN[2], FLUSH[2], 0.4), SKIN[3], SKIN[4]] : SKIN, -16, 12);
  for (const [sx, sy, r] of [[-6, -13, 1.6], [2, -15, 1.1], [5, -9, 1.4], [-10, -7, 0.9]] as const) ell(c, sx, sy, r, r * 0.8, SPOT);
  px(c, -9, -16, 4, 1.4, '#FFFFFF'); px(c, -11, -14, 2, 1, '#FFF4EC');
  // (the fringe over the ear, the comb-over: three white strands from over the ear across the dome)
  fill(c, HAIR[2], () => { c.moveTo(4, -6); c.quadraticCurveTo(12, -8, 12, 4); c.lineTo(8, 6); c.quadraticCurveTo(8, -2, 4, -4); c.closePath(); });
  px(c, 11, -3, 2, 1, HAIR[1]); px(c, 12, 1, 2, 1, HAIR[1]);
  for (let k = 0; k < 3; k++) line(c, [6, -7 + k * 1.4, -1, -15 + k * 1.2, -11, -12 + k * 2], 0.9, k === 1 ? HAIR[0] : HAIR[2]);
  // (the near ear: big, a tuft out of it)
  shape(c, () => c.ellipse(4, 1, 3.4, 5.2, 0.1, 0, Math.PI * 2), SKIN, 0.6, 7.4);
  ell(c, 4.4, 1.4, 1.3, 2.8, SKIN[3]); px(c, 4, -1, 2, 1, HAIR[1]);
  // (the brows: grey, wild)
  const brow = face === 'angry' || face === 'squint' ? 1.6 : face === 'yell' || face === 'strain' ? -0.6 : 0;
  line(c, [-15, -7 + brow * 0.3, -10, -8 + brow], 2, HAIR[3]); line(c, [-6, -8 + brow, -1, -7.5 + brow * 0.2], 2, HAIR[3]);
  line(c, [-14, -8 + brow * 0.3, -10, -9 + brow], 0.8, HAIR[1]); line(c, [-5, -9 + brow, -2, -8.6], 0.8, HAIR[1]);
  // (the eyes: bloodshot, half shut under heavy lids, bags under them)
  const eye = (ex: number, w: number) => {
    ell(c, ex, -2.4, w * 0.62, 1.6, BAG);
    if (face === 'sip' || face === 'out' || face === 'yell' || face === 'strain' || face === 'burp') { line(c, [ex - w / 2, -4, ex + w / 2, -3.6], 1, SKIN[4]); if (face === 'burp') { ell(c, ex, -5.4, w / 2.4, 1.2, EYE_W); px(c, ex - 0.6, -6.6, 1.2, 1, IRIS); } return; }
    const open = face === 'squint' ? 0.8 : face === 'angry' ? 1.6 : 1.3;
    ell(c, ex, -4, w / 2, open + 0.6, EYE_W);
    px(c, ex - w / 2 + 0.6, -4.2, 1.2, 0.5, EYE_RED); px(c, ex + w / 2 - 1.6, -3.8, 1.2, 0.5, EYE_RED);
    ell(c, ex - 0.8, -3.7, 1.2, Math.min(1.2, open), IRIS); px(c, ex - 1.2, -4, 0.8, 0.8, '#1A1A1A');
    // (the lid: heavy, down over half of it)
    fill(c, SKIN[2], () => { c.moveTo(ex - w / 2 - 0.6, -4); c.quadraticCurveTo(ex, -7.6 + (face === 'angry' ? 1.6 : 0), ex + w / 2 + 0.6, -4.2); c.lineTo(ex + w / 2 + 0.6, -5.8); c.quadraticCurveTo(ex, -8.2, ex - w / 2 - 0.6, -5.6); c.closePath(); });
    line(c, [ex - w / 2, -4, ex + w / 2, -4.2], 0.7, SKIN[4]);
  };
  eye(-12.5, 5); eye(-4, 5.4);
  // (the nose: a drinker's, swollen, purple-red, veins on it)
  shape(c, () => { c.moveTo(-10, -4); c.quadraticCurveTo(-14, -2, -18, 1); c.quadraticCurveTo(-22, 4, -18, 6.5); c.quadraticCurveTo(-14, 8, -10, 5); c.closePath(); }, FLUSH, -22, -9);
  line(c, [-17, 1, -15, 3, -16, 5], 0.5, FLUSH[3]); px(c, -19, 1.4, 1.4, 1, FLUSH[0]);
  ell(c, -15, 6, 1.3, 0.8, FLUSH[4]);
  // (the cheeks flushed, broken veins; white stubble over the jowls)
  ell(c, -8, 3, 3.6, 2.2, dith(c, FLUSH[1]));
  px(c, -7, 2, 2, 0.5, FLUSH[2]);
  for (let k = 0; k < 18; k++) px(c, -14 + ((k * 7) % 20), 7 + ((k * 3) % 8), 0.7, 0.7, '#F4F4F0');
  // (the mouth)
  const flap = talking ? (Math.floor(f / 4) % 3) : 0;
  if (face === 'yell' || face === 'burp' || flap === 2) { fill(c, '#5A1020', () => c.ellipse(-12, 10.5, 3.4, face === 'yell' || face === 'burp' ? 3.6 : 2.4, 0, 0, Math.PI * 2)); px(c, -14, 8, 4, 1, TEETH); ell(c, -12, 12.4, 2, 1, '#C24A5A'); }
  else if (face === 'sip') { ell(c, -13, 9.6, 2.2, 1.8, SKIN[3]); }
  else if (face === 'strain' || face === 'angry') { px(c, -16, 9, 8, 2.4, TEETH); line(c, [-16, 9, -8, 9], 0.6, SKIN[4]); line(c, [-16, 11.4, -8, 11.4], 0.6, SKIN[4]); px(c, -12.6, 9, 0.6, 2.4, SKIN[4]); }
  else if (flap === 1) { ell(c, -12, 10, 3, 1.6, '#5A1020'); px(c, -14, 9, 3, 0.8, TEETH); }
  else { line(c, [-16, 10, -12, 10.8, -8, 9.8], 1, SKIN[4]); if (face === 'bleary' || face === 'out') line(c, [-15, 11.6, -11, 12], 0.6, SKIN[3]); }
  // (the headset mic, taped along his cheek: the boom, the foam ball by his mouth)
  line(c, [5, 3, -2, 8, -8, 10], 1.1, MIC); px(c, -2, 7, 2, 2, '#EDE3D2');
  ell(c, -9, 10.4, 1.4, 1.4, '#222222');
  // (sweat on the dome, now and then)
  if ((f + 13) % 90 < 40) { ell(c, -13, -12 + ((f + 13) % 90) * 0.12, 0.8, 1.2, '#E8F4FF'); }
  c.restore();
};

/** The belly, the tank top over it (stained, a cigarette hole, riding up), its middle at (bx, by). */
const belly = (c: Ctx, bx: number, by: number, rx: number, ry: number) => {
  // (the gut showing under the hem: pale, hairy, the navel)
  shapeTop(c, () => c.ellipse(bx, by + 4, rx, ry - 2, 0, 0, Math.PI * 2), SKIN, by - ry, by + ry + 2);
  ell(c, bx - rx * 0.2, by + ry * 0.62, 1.6, 1.1, SKIN[4]);
  for (let k = 0; k < 7; k++) px(c, bx - rx * 0.5 + k * rx * 0.16, by + ry * 0.48 + (k % 2) * 3, 0.7, 1.6, SKIN[3]);
  // (the tank top: up over most of it, riding up off the bottom)
  const hem = by + ry * 0.4;
  c.save(); c.beginPath(); c.ellipse(bx, by, rx + 1, ry + 1, 0, 0, Math.PI * 2); c.rect(bx - rx - 2, by - ry - 30, rx * 2 + 4, ry + 30); c.clip();
  shape(c, () => { c.moveTo(bx - rx - 1, by - ry - 26); c.lineTo(bx + rx + 1, by - ry - 26); c.lineTo(bx + rx + 1, hem - 3); c.quadraticCurveTo(bx, hem + 4, bx - rx - 1, hem); c.closePath(); }, TANK, bx - rx, bx + rx);
  // (the ribbing, the stains: yellow under the arm, a mustard drip, a cigarette hole, a beer ring)
  for (let k = -rx + 4; k < rx; k += 4) line(c, [bx + k, by - ry - 20, bx + k * 1.05, hem], 0.4, TANK[2]);
  ell(c, bx - rx * 0.45, by - ry * 0.1, 7, 5, dith(c, STAIN));
  ell(c, bx + rx * 0.2, by - ry * 0.35, 2.4, 3.6, MUSTARD); px(c, bx + rx * 0.2 - 0.6, by - ry * 0.35 + 3, 1.2, 3, MUSTARD);
  ell(c, bx + rx * 0.45, by + ry * 0.05, 1.6, 1.4, '#3A2A20'); ell(c, bx + rx * 0.45, by + ry * 0.05, 2.4, 2.2, dith(c, '#8A6A40'));
  c.strokeStyle = 'rgba(160,120,60,0.45)'; c.lineWidth = 0.8; c.beginPath(); c.ellipse(bx - rx * 0.1, by + ry * 0.12, 4, 3, 0, 0, Math.PI * 2); c.stroke();
  c.restore();
  c.beginPath(); c.ellipse(bx, by, rx, ry, 0, 0, Math.PI * 2); c.strokeStyle = TANK[4]; c.lineWidth = 1; c.stroke();
};

/** A leg from the hip to the knee to the foot: boxer leg, then the bare shin (veins), the sock, the slipper. */
const leg = (c: Ctx, hip: number[], knee: number[], foot: number[], near: boolean, sag = 0) => {
  const dim = (r: Ramp): Ramp => (near ? r : [r[1], r[2], r[3], r[3], r[4]]);
  // (the boxer leg: baggy, striped)
  limb(c, hip[0], hip[1], 8, knee[0], knee[1], 6.4, dim(BOXER));
  c.save(); c.beginPath(); c.moveTo(hip[0], hip[1] - 8); c.lineTo(knee[0], knee[1] - 6); c.lineTo(knee[0], knee[1] + 6); c.lineTo(hip[0], hip[1] + 8); c.closePath(); c.clip();
  for (let k = -12; k <= 12; k += 4) line(c, [hip[0] + k, hip[1] - 10, knee[0] + k, knee[1] - 8, knee[0] + k, knee[1] + 8], 1, near ? STRIPE : mix(STRIPE, '#000000', 0.2));
  c.restore();
  // (the shin: thin, pale, a varicose vein; the black sock pulled up (the near one's slid down))
  const ankle = [foot[0] + 2, foot[1] - 4];
  limb(c, knee[0], knee[1], 4.2, ankle[0], ankle[1], 3, dim(SKIN));
  line(c, [knee[0] - 1, knee[1] + 4, (knee[0] + ankle[0]) / 2 - 1.5, (knee[1] + ankle[1]) / 2, ankle[0] - 1, ankle[1] - 6], 0.6, VEIN);
  const sockTop = 0.45 + (near ? sag : 0);
  limb(c, knee[0] + (ankle[0] - knee[0]) * sockTop, knee[1] + (ankle[1] - knee[1]) * sockTop, 3.6, ankle[0], ankle[1], 3.3, SOCK);
  if (near && sag > 0) line(c, [knee[0] + (ankle[0] - knee[0]) * sockTop - 3.4, knee[1] + (ankle[1] - knee[1]) * sockTop + 1, knee[0] + (ankle[0] - knee[0]) * sockTop + 3.4, knee[1] + (ankle[1] - knee[1]) * sockTop + 2], 0.8, SOCK[0]);
  // (the slipper: brown terry, flattened at the heel)
  shape(c, () => { c.moveTo(foot[0] + 6, foot[1]); c.lineTo(foot[0] + 6, foot[1] - 4); c.quadraticCurveTo(foot[0] - 2, foot[1] - 7, foot[0] - 10, foot[1] - 3.6); c.quadraticCurveTo(foot[0] - 13, foot[1], foot[0] - 9, foot[1]); c.closePath(); }, dim(SLIPPER), foot[0] - 13, foot[0] + 6);
  px(c, foot[0] - 9, foot[1] - 4.6, 8, 1, SLIPPER[0]);
};

/** An arm from the shoulder to the hand: flabby, liver-spotted, the Navy anchor (the near one), a fat hand. */
const arm = (c: Ctx, sh: number[], hand: number[], near: boolean, fist = false) => {
  const r: Ramp = near ? SKIN : [SKIN[1], SKIN[2], SKIN[3], SKIN[3], SKIN[4]];
  const dx = hand[0] - sh[0], dy = hand[1] - sh[1], d = Math.hypot(dx, dy) || 1;
  const el = [sh[0] + dx * 0.5 + (dy / d) * 4, sh[1] + dy * 0.5 - (dx / d) * 4 + 3];
  limb(c, sh[0], sh[1], 6.6, el[0], el[1], 5.2, r, 2.4);
  limb(c, el[0], el[1], 5, hand[0], hand[1], 3.8, r);
  ell(c, (sh[0] + el[0]) / 2 + 1, (sh[1] + el[1]) / 2 - 1, 1.2, 0.9, SPOT);
  if (near) {
    // (the anchor, faded, on the forearm)
    const ax = (el[0] + hand[0]) / 2, ay = (el[1] + hand[1]) / 2;
    line(c, [ax, ay - 2.4, ax, ay + 2], 0.7, TAT); line(c, [ax - 1.8, ay + 1, ax, ay + 2.4, ax + 1.8, ay + 1], 0.7, TAT); px(c, ax - 1.2, ay - 1.6, 2.4, 0.6, TAT);
    ell(c, ax + 2, ay - 2, 0.9, 0.7, SPOT);
  }
  shape(c, () => c.ellipse(hand[0], hand[1], fist ? 4.4 : 4, fist ? 4 : 3.4, 0, 0, Math.PI * 2), r, hand[0] - 4.4, hand[0] + 4.4, 0.8);
  if (!fist) for (let k = 0; k < 3; k++) px(c, hand[0] - 3 + k * 2, hand[1] - 3.6, 0.7, 2, r[3]);
};

// ---------------------------------------------------------------------------------------------------------------
// Him, whole

export interface DadOpts {
  facing?: -1 | 1; t?: number; talking?: boolean; face?: DadFace;
  /** Holding the can (and it's got beer in it: tipped right back when not); crushed 0..1; gone (dropped). */
  can?: 'near' | 'far' | null; canFull?: boolean; crushed?: number;
  /** Swaying (stood up: drunk). */
  sway?: number;
}

/** Him, his feet's point at (x, feetY): `pose` what he's doing; `opts.t` how far through it (0..1). */
export const drawDad = (c: Ctx, x: number, feetY: number, pose: DadPose, f: number, o: DadOpts = {}) => {
  if (pose === 'gone') return;
  const t = Math.max(0, Math.min(1, o.t ?? 0)), talking = !!o.talking;
  // (he faces left in his own units; mirrored for the right)
  c.save(); c.translate(Math.round(x), Math.round(feetY)); c.scale(DAD_K * (o.facing === 1 ? -1 : 1), DAD_K);
  const sat = pose === 'sit' || pose === 'sip' || pose === 'call' || pose === 'reach' || pose === 'tv' || pose === 'squint';
  // (getting up: from sat (u 0) to stood (u 1), hands on his knees, rocking twice first)
  const up = pose === 'rise' ? Math.max(0, (t - 0.45) / 0.55) : sat ? 0 : 1;
  const rock = pose === 'rise' && t < 0.45 ? Math.sin(t * 14) * 4 : 0;
  const L = (a: number, b: number) => a + (b - a) * up;
  const sway = (o.sway ?? (sat ? 0 : Math.sin(f * 0.04) * 2.4)) * (sat ? 0 : 1);
  const breathe = Math.sin(f * 0.05) * 0.8;
  // The skeleton: sat (the couch's seat at -30) to stood
  const hip = [L(8, 0) + rock * 0.3, L(-32, -44)];
  const kneeN = [L(-18, -4 + sway * 0.3), L(-30, -24)], kneeF = [L(-8, 6 + sway * 0.3), L(-32, -24)];
  const step = pose === 'shuffle' ? Math.sin(f * 0.2) * 5 : 0;
  const footN = [L(-22, -6 + step), 0], footF = [L(-12, 8 - step), L(-1, 0)];
  const bx = L(-4, -6) + sway * 0.5 + rock, by = L(-50, -66) + breathe, brx = 31, bry = L(25, 27);
  const lean = pose === 'rise' && t < 0.6 ? 10 * (1 - up) : 0;
  const shN = [L(-20, -22) + sway + rock - lean, L(-76, -96) + breathe + lean * 0.6], shF = [L(16, 12) + sway + rock - lean, L(-80, -100) + breathe + lean * 0.6];
  let hx = L(-8, -10) + sway * 1.2 + rock - lean * 1.2, hy = L(-98, -118) + breathe + lean;
  let tilt = 0, hdir = -1;
  let face: DadFace = o.face ?? 'bleary';
  // The hands, by pose
  let handN = [L(-14, -24) + sway, L(-50, -78)], handF = [34, -70];
  let canAt: number[] | null = null, canAng = 0;
  const holding = o.can === undefined ? 'near' : o.can;
  switch (pose) {
    case 'sit': handN = [-16 + Math.sin(f * 0.02), -50]; handF = [34, -72]; break;
    case 'sip': handN = [-22, -94]; handF = [34, -72]; tilt = 0.28; face = o.face ?? 'sip'; break;
    case 'call': handN = [-16, -50]; handF = [12, -96]; hdir = 1; tilt = 0.12; face = o.face ?? (talking ? 'yell' : 'bleary'); break;
    case 'reach': handN = [-16, -50]; handF = [46 + t * 18, -58]; hdir = 1; break;
    case 'tv': handN = [-46 + Math.sin(f * 0.5) * 3, -84 + Math.cos(f * 0.5) * 2]; handF = [34, -72]; face = o.face ?? (talking ? 'yell' : 'angry'); break;
    case 'squint': handN = [-16, -50]; handF = [34, -72]; hx -= 3; hy += 2; face = o.face ?? 'squint'; break;
    case 'rise': handN = [L(kneeN[0] + 2, -24), L(kneeN[1] - 6, -78)]; handF = [L(kneeF[0] + 4, 14), L(kneeF[1] - 6, -64)]; face = o.face ?? 'strain'; break;
    case 'stand': handN = [-24 + sway, -80]; handF = [16 + sway, -60]; break;
    case 'shuffle': handN = [-24 + sway, -78]; handF = [18 + sway, -58]; break;
    case 'crush': { const k = Math.min(1, t * 2.2); handN = [-24 - 6 * k + sway, -80 - 42 * k]; handF = [16, -60]; tilt = -0.12 * k; face = o.face ?? (t > 0.5 ? 'angry' : 'strain'); break; }
  }
  if (holding === 'near') {
    canAt = pose === 'sip' ? [handN[0] - 3, handN[1] - 2] : pose === 'crush' ? [hx - 15, hy - 5] : [handN[0] - 1, handN[1] - 6];
    canAng = pose === 'sip' ? (o.canFull === false ? 2.4 : 1.85) : pose === 'tv' ? -0.3 : 0;
  } else if (holding === 'far') { canAt = [handF[0] + 1, handF[1] - 6]; canAng = 0.1; }
  // Drawing, back to front: the far arm, the far leg, the near leg, the belly, the near arm, the head, the can
  arm(c, shF, handF, false, pose === 'call');
  if (holding === 'far' && canAt) can(c, canAt[0], canAt[1], canAng, o.crushed ?? 0);
  leg(c, [hip[0] + 6, hip[1]], kneeF, footF, false);
  leg(c, [hip[0] - 6, hip[1] + 1], kneeN, footN, true, 0.2);
  // (the boxers' seat under the belly)
  shape(c, () => c.ellipse(hip[0], hip[1] - 2, 20, 10, 0, 0, Math.PI * 2), BOXER, hip[0] - 20, hip[0] + 20);
  c.save(); c.beginPath(); c.ellipse(hip[0], hip[1] - 2, 20, 10, 0, 0, Math.PI * 2); c.clip();
  for (let k = -22; k < 22; k += 4) px(c, hip[0] + k, hip[1] - 12, 1.2, 20, STRIPE);
  c.restore();
  // (the shoulders and the chest behind the belly: the tank top's straps, grey chest hair over its neckline)
  shape(c, () => { c.moveTo(shN[0] - 4, shN[1] + 6); c.quadraticCurveTo(shN[0], shN[1] - 4, (shN[0] + shF[0]) / 2, shN[1] - 3); c.quadraticCurveTo(shF[0], shF[1] - 4, shF[0] + 6, shF[1] + 6); c.lineTo(bx + brx * 0.6, by - bry * 0.4); c.lineTo(bx - brx * 0.7, by - bry * 0.4); c.closePath(); }, SKIN, shN[0] - 6, shF[0] + 6);
  belly(c, bx, by, brx, bry);
  // (the tank top's neckline and straps up over the shoulders, a tuft of white chest hair)
  const nx = (shN[0] + shF[0]) / 2 - 2, ny = Math.min(shN[1], shF[1]) + 6;
  shape(c, () => { c.moveTo(shN[0] + 2, shN[1] - 1); c.lineTo(shN[0] + 7, shN[1] - 2); c.quadraticCurveTo(nx, ny + 10, shF[0] - 5, shF[1] - 1); c.lineTo(shF[0], shF[1]); c.lineTo(shF[0] + 2, by - bry + 6); c.lineTo(shN[0] - 2, by - bry + 6); c.closePath(); }, TANK, shN[0], shF[0]);
  for (let k = 0; k < 6; k++) line(c, [nx - 5 + k * 2, ny + 3 + (k % 2), nx - 6 + k * 2.2, ny + 1], 0.6, HAIR[1]);
  // (the neck rolls)
  shapeTop(c, () => c.ellipse(hx + 4, hy + 15, 13, 6, 0, 0, Math.PI * 2), SKIN, hy + 9, hy + 21);
  line(c, [hx - 6, hy + 16, hx + 10, hy + 17], 0.6, SKIN[3]);
  arm(c, shN, handN, true, pose === 'tv' || pose === 'crush');
  head(c, hx, hy, face, f, hdir, tilt, talking);
  if (holding === 'near' && canAt) can(c, canAt[0], canAt[1], canAng, o.crushed ?? 0);
  // (crushing it on his forehead: the thumb over the top of it)
  if (pose === 'crush' && canAt) ell(c, canAt[0] + 3, canAt[1] - 2, 3, 2.4, SKIN[1]);
  c.restore();
};

/** Where his head is (world), for words over it. */
export const dadHeadAt = (x: number, feetY: number, sat: boolean) => ({ x, y: feetY - (sat ? DAD_SIT_H : DAD_H) });

// ---------------------------------------------------------------------------------------------------------------
// The couch (the show's: the orange plaid one off the poster, gone saggy; his dent in it, the stuffing out of one arm)

const COUCH_R: Ramp = ['#F7A15A', '#E0752E', '#B9561A', '#8E3F12', '#3E1606'];
const COUCH_DK: Ramp = ['#D9773A', '#B95A20', '#943F12', '#6C2C0A', '#2E1004'];
export const drawCouch = (c: Ctx, x: number, floorY: number, f: number, o: { empty?: boolean; dim?: number } = {}) => {
  void f;
  c.save(); c.translate(Math.round(x), Math.round(floorY)); c.scale(DAD_K, DAD_K);
  const W = 190, back = -74, seat = -30;
  const plaid = (x0: number, y0: number, w: number, h: number) => {
    c.save(); c.beginPath(); c.rect(x0, y0, w, h); c.clip();
    for (let k = x0 + 6; k < x0 + w; k += 14) { px(c, k, y0, 3, h, 'rgba(120,40,10,0.35)'); px(c, k + 5, y0, 1, h, 'rgba(255,220,160,0.3)'); }
    for (let k = y0 + 5; k < y0 + h; k += 12) { px(c, x0, k, w, 3, 'rgba(120,40,10,0.3)'); px(c, x0, k + 4, w, 1, 'rgba(255,220,160,0.25)'); }
    c.restore();
  };
  // (the back: a long low hump, sagging in the middle)
  shapeTop(c, () => { c.moveTo(-W / 2, seat); c.lineTo(-W / 2 + 4, back + 6); c.quadraticCurveTo(-W / 4, back - 4, 0, back + 4); c.quadraticCurveTo(W / 4, back - 4, W / 2 - 4, back + 6); c.lineTo(W / 2, seat); c.closePath(); }, COUCH_DK, back - 4, seat);
  plaid(-W / 2, back - 6, W, seat - back + 6);
  // (the two seat cushions: his on the right sunk deep, the stain where he sits)
  for (const [cx, sink] of [[-W / 4 + 2, 1], [W / 4 - 2, o.empty ? 6 : 2]] as const) {
    shapeTop(c, () => c.roundRect(cx - W / 4 + 4, seat - 10 + sink, W / 2 - 8, 16 - sink, 5), COUCH_R, seat - 10 + sink, seat + 6);
    plaid(cx - W / 4 + 4, seat - 10 + sink, W / 2 - 8, 16 - sink);
  }
  if (o.empty) { ell(c, W / 4 - 2, seat - 2, 22, 4, dith(c, '#7A3A10')); ell(c, W / 4 + 6, seat - 4, 6, 2.4, 'rgba(200,170,90,0.5)'); }
  // (the front skirt, the stubby wooden feet)
  shape(c, () => c.rect(-W / 2, seat + 4, W, 22), COUCH_DK, -W / 2, W / 2);
  plaid(-W / 2, seat + 4, W, 22);
  for (const fx of [-W / 2 + 8, W / 2 - 14]) shape(c, () => c.rect(fx, -4, 6, 4), ['#9A6A40', '#6E4526', '#58361C', '#3E2410', '#1E1008'], fx, fx + 6);
  // (the arms: fat rolls; the left one split, the stuffing out of it)
  for (const s of [-1, 1]) shape(c, () => c.roundRect(s < 0 ? -W / 2 - 14 : W / 2 - 10, seat - 22, 24, 48, 9), COUCH_R, s < 0 ? -W / 2 - 14 : W / 2 - 10, s < 0 ? -W / 2 + 10 : W / 2 + 14);
  ell(c, -W / 2 - 2, seat - 18, 5, 3, '#F4EFE2'); ell(c, -W / 2 + 2, seat - 20, 3, 2, '#FFFFFF');
  // (a crocheted afghan thrown over the back, the remote between the cushions, empties along the back)
  fill(c, '#3F7A4A', () => { c.moveTo(-W / 2 + 10, back + 4); c.lineTo(-W / 2 + 50, back); c.lineTo(-W / 2 + 46, seat - 6); c.lineTo(-W / 2 + 14, seat - 4); c.closePath(); });
  for (let k = 0; k < 4; k++) px(c, -W / 2 + 16 + k * 8, back + 6 + k * 6, 6, 2, k % 2 ? '#E5C46A' : '#B8443A');
  px(c, -4, seat - 6, 10, 4, '#2A2A2A'); px(c, -2, seat - 6, 2, 1, '#DC2626');
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The close-up (screen space): the intro's, him squinting at Meathead, the can at his lips

/** His face close up, the middle of it at (cx, cy), `s` px a unit (the head's 60 units across). */
export const drawDadCloseup = (c: Ctx, cx: number, cy: number, s: number, f: number, o: { face?: DadFace; talking?: boolean } = {}) => {
  const face = o.face ?? 'squint', talking = !!o.talking;
  const flap = talking ? Math.floor(f / 4) % 3 : 0;
  c.save(); c.translate(cx, cy); c.scale(s, s);
  // (the far shoulder and the tank top's strap; the neck rolls)
  shape(c, () => { c.moveTo(-70, 70); c.quadraticCurveTo(-60, 30, -20, 34); c.lineTo(40, 34); c.quadraticCurveTo(76, 36, 80, 70); c.closePath(); }, SKIN, -70, 80, 0.6);
  shape(c, () => { c.moveTo(-40, 70); c.lineTo(-34, 40); c.lineTo(-26, 40); c.lineTo(-30, 70); c.closePath(); }, TANK, -40, -26, 0.6);
  shape(c, () => { c.moveTo(34, 70); c.lineTo(30, 40); c.lineTo(38, 40); c.lineTo(44, 70); c.closePath(); }, TANK, 30, 44, 0.6);
  for (let k = 0; k < 10; k++) line(c, [-16 + k * 4, 62 + (k % 3), -18 + k * 4.4, 56], 0.5, HAIR[1]);
  shapeTop(c, () => c.ellipse(2, 34, 34, 12, 0, 0, Math.PI * 2), SKIN, 22, 46, 0.6);
  // (the ears: big, red-rimmed, white hair out of them)
  for (const sx of [-34, 36]) {
    shape(c, () => c.ellipse(sx, -2, 7, 12, sx < 0 ? -0.15 : 0.15, 0, Math.PI * 2), SKIN, sx - 7, sx + 7, 0.6);
    ell(c, sx + (sx < 0 ? 1 : -1), -1, 3, 7, SKIN[3]);
    for (let k = 0; k < 3; k++) line(c, [sx + (sx < 0 ? 2 : -2), -2 + k, sx + (sx < 0 ? 6 : -6) + k, -6 + k * 2], 0.4, HAIR[0]);
  }
  // (the jowls and chins)
  shapeTop(c, () => { c.moveTo(-30, 6); c.quadraticCurveTo(-34, 30, -12, 34); c.quadraticCurveTo(2, 38, 16, 34); c.quadraticCurveTo(36, 30, 32, 6); c.closePath(); }, face === 'angry' ? FLUSH : SKIN, 6, 36, 0.6);
  line(c, [-16, 31, 0, 34, 18, 31], 0.5, SKIN[3]);
  // (the skull: the dome, its sheen, the liver spots)
  shape(c, () => c.ellipse(0, -10, 32, 32, 0, 0, Math.PI * 2), SKIN, -32, 32, 0.6);
  ell(c, -12, -32, 8, 4, dith(c, '#FFFFFF'), -0.3); ell(c, -14, -33, 4, 2, '#FFFFFF', -0.3);
  for (const [sx, sy, r] of [[8, -30, 3], [-4, -24, 2], [18, -18, 2.4], [-20, -14, 1.6], [12, -36, 1.4]] as const) { ell(c, sx, sy, r, r * 0.8, SPOT); ell(c, sx - 0.4, sy - 0.4, r * 0.5, r * 0.4, mix(SPOT, '#FFFFFF', 0.25)); }
  // (the fringe round the sides, white; the comb-over, three strands, sweat-plastered, one come loose and standing up)
  for (const sx of [-1, 1]) fill(c, HAIR[2], () => { c.moveTo(sx * 26, -18); c.quadraticCurveTo(sx * 34, -10, sx * 32, 6); c.lineTo(sx * 28, 6); c.quadraticCurveTo(sx * 28, -6, sx * 22, -14); c.closePath(); });
  for (const sx of [-1, 1]) for (let k = 0; k < 5; k++) line(c, [sx * (24 + k), -14 + k * 3, sx * (30 + k), -12 + k * 3.4], 0.4, HAIR[0]);
  for (let k = 0; k < 3; k++) line(c, [26, -16 + k * 2, 8, -34 + k * 2, -16, -30 + k * 3.4], 1, k === 1 ? HAIR[0] : HAIR[2]);
  line(c, [-2, -36, -6, -46 + Math.sin(f * 0.1) * 1.5, -2, -50], 0.7, HAIR[1]);
  // (the brows: big, grey, wiry)
  const b = face === 'angry' || face === 'squint' ? 3 : 0;
  for (const sx of [-1, 1]) { fill(c, HAIR[3], () => { c.moveTo(sx * 4, -16 + b * (sx < 0 ? 1 : 0.3)); c.quadraticCurveTo(sx * 13, -22 + b * 0.2, sx * 22, -16); c.lineTo(sx * 20, -13); c.quadraticCurveTo(sx * 13, -17, sx * 5, -12 + b); c.closePath(); }); for (let k = 0; k < 4; k++) line(c, [sx * (8 + k * 3.4), -18, sx * (10 + k * 3.4), -22 + (k % 2) * 2], 0.4, HAIR[1]); }
  // (the eyes: bloodshot, watery, the lids heavy; the squint shuts one; bags, purple, sagging)
  for (const sx of [-1, 1]) {
    const ex = sx * 13, ey = -6;
    fill(c, BAG, () => c.ellipse(ex, ey + 6, 9, 4, 0, 0, Math.PI));
    line(c, [ex - 8, ey + 7, ex, ey + 10, ex + 8, ey + 7], 0.5, SKIN[4]);
    const shut = face === 'out' || face === 'sip' || face === 'burp' || (face === 'squint' && sx < 0);
    if (shut) { line(c, [ex - 7, ey, ex, ey + 1.6, ex + 7, ey], 1, SKIN[4]); line(c, [ex - 6, ey - 1.6, ex + 6, ey - 1.6], 0.5, SKIN[3]); continue; }
    const open = face === 'squint' ? 2.6 : face === 'angry' ? 3.6 : 3.4;
    ell(c, ex, ey, 7, open, EYE_W);
    for (let k = 0; k < 4; k++) line(c, [ex - 7 + (k > 1 ? 11 : 0), ey + (k % 2) - 0.5, ex - 4 + (k > 1 ? 9 : 0), ey + (k % 2 ? 1 : -1)], 0.35, EYE_RED);
    ell(c, ex - sx * 1.5, ey + 0.4, 2.8, Math.min(2.8, open), IRIS); ell(c, ex - sx * 1.5, ey + 0.4, 1.2, Math.min(1.2, open), '#141414'); px(c, ex - sx * 1.5 - 1.4, ey - 1.2, 1, 1, '#FFFFFF');
    // (the heavy lid, a watery glint on the lower rim)
    fill(c, SKIN[2], () => { c.moveTo(ex - 8, ey + 0.4); c.quadraticCurveTo(ex, ey - open * 2.6 + (face === 'angry' ? 1.6 : 0), ex + 8, ey + 0.4); c.lineTo(ex + 8, ey - 2.6); c.quadraticCurveTo(ex, ey - 9, ex - 8, ey - 2.6); c.closePath(); });
    line(c, [ex - 7, ey + 0.2, ex, ey - open + 0.6 + (face === 'angry' ? 1.6 : 0), ex + 7, ey + 0.2], 0.7, SKIN[4]);
    px(c, ex - 3, ey + open - 0.4, 6, 0.5, '#E8F4FF');
  }
  // (the nose: the drinker's, big, bulbous, bumpy, purple at the tip, the veins on it)
  shape(c, () => { c.moveTo(-5, -10); c.quadraticCurveTo(-8, 0, -12, 6); c.quadraticCurveTo(-16, 14, -6, 16); c.quadraticCurveTo(0, 18, 6, 16); c.quadraticCurveTo(16, 14, 12, 6); c.quadraticCurveTo(8, 0, 5, -10); c.closePath(); }, FLUSH, -14, 14, 0.6);
  ell(c, 0, 10, 8, 5, dith(c, FLUSH[2]));
  for (const [vx, vy] of [[-6, 4], [4, 2], [0, 12], [7, 10]] as const) line(c, [vx, vy, vx + 2, vy + 1.4, vx + 1, vy + 3], 0.35, FLUSH[3]);
  for (const [bx, by] of [[-8, 10], [6, 6], [9, 12]] as const) ell(c, bx, by, 1.4, 1.2, FLUSH[0]);
  ell(c, -4, 14, 2, 1.2, FLUSH[4]); ell(c, 4, 14, 2, 1.2, FLUSH[4]); ell(c, -3, 4, 2, 1.4, '#FFD6DC');
  // (the cheeks, flushed with broken veins)
  for (const sx of [-1, 1]) { ell(c, sx * 20, 8, 7, 4, dith(c, FLUSH[1])); for (let k = 0; k < 3; k++) line(c, [sx * (16 + k * 3), 6 + k, sx * (18 + k * 3), 8 + k], 0.35, FLUSH[2]); }
  // (white stubble, everywhere under the nose)
  for (let k = 0; k < 90; k++) { const a = (k * 2.39996) % (Math.PI * 2), r = 10 + ((k * 7) % 20); const sx = Math.cos(a) * r * 1.05, sy = 22 + Math.sin(a) * r * 0.45; if (sy > 14 && Math.abs(sx) < 28) px(c, sx, sy, 0.6, 0.6, k % 3 ? '#F4F4EE' : '#C9C9C2'); }
  // (the mouth: slack, the bottom lip hanging; teeth gone yellow, one missing; foam on the lip)
  if (face === 'yell' || face === 'burp' || flap === 2) {
    fill(c, '#4A0E1A', () => c.ellipse(0, 25, 10, face === 'burp' ? 8 : 6.4, 0, 0, Math.PI * 2));
    px(c, -8, 19.4, 16, 2.4, TEETH); px(c, -2, 19.4, 2.4, 2.4, '#4A0E1A'); ell(c, 0, 29, 6, 2.4, '#C24A5A');
  } else if (face === 'angry') {
    px(c, -10, 22, 20, 4.4, TEETH); px(c, 3, 22, 2.4, 4.4, '#4A0E1A'); line(c, [-10, 22, 10, 22], 0.6, SKIN[4]); line(c, [-10, 26.4, 10, 26.4], 0.6, SKIN[4]);
    for (let k = -6; k <= 6; k += 4) line(c, [k, 22, k, 26.4], 0.35, '#A89A6A');
  } else if (flap === 1) {
    fill(c, '#4A0E1A', () => c.ellipse(0, 24, 8, 3, 0, 0, Math.PI * 2)); px(c, -6, 21.6, 12, 1.4, TEETH);
  } else {
    line(c, [-10, 22, -3, 24, 4, 23.4, 10, 21], 1, SKIN[4]);
    shapeTop(c, () => c.ellipse(1, 26, 8, 2.6, 0, 0, Math.PI * 2), FLUSH, 23.4, 28.6, 0.5);
  }
  for (let k = 0; k < 4; k++) ell(c, -6 + k * 3.6, 23 + (k % 2) * 0.6, 1.4, 0.8, '#FFFDF2');
  // (the headset mic: the boom along his cheek from the ear, the foam ball at the corner of his mouth, tape on it)
  line(c, [34, 2, 20, 14, 12, 22], 1.6, MIC); px(c, 24, 9, 5, 3, '#EDE3D2'); ell(c, 10, 23, 3, 3, '#1E1E1E'); ell(c, 9, 22, 1, 1, '#4A4A4A');
  // (sweat beading on the dome)
  for (let k = 0; k < 3; k++) { const u = ((f * 0.5 + k * 40) % 120) / 120; ell(c, -18 + k * 16, -36 + k * 6 + u * 20, 1.2, 1.8, '#E8F4FF'); px(c, -18.4 + k * 16, -37 + k * 6 + u * 20, 0.6, 0.6, '#FFFFFF'); }
  c.restore();
};
