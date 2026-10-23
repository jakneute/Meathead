// DAD MAN, drawn (Cartoon Land's boss: everybody draws him from here). At Meathead 2's boss grade, on par with Piper,
// Tucker, Donnie and Artie: color ramps (light, base, shade, deep, line) in stepped bands with a dithered seam between
// them, every material its own darkest tone for an outline (paint.ts).
//
// Who he is (the user's): HONK AZORIA, the man who voiced the dad on DAD MAN (UBX, 1995), the only one of the
// principal cast still alive (the rest drank themselves to death or died drunk behind the wheel), in his seventies now
// and a drunk too. A voice actor doing his old cartoon character in person: DAD MAN LIVE! is the cartoon recreated as
// live action on a sitcom set, and he does it in the park's amphitheater twice a day in the dad's own look from the poster
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
import { elbow as elbowAt, knee as kneeAt, reachTo } from '../../art/limb';
import { drawDadGross } from './dadGross';
import type { DadPose } from './state';
import { type Ctx, type Ramp, shape, shapeTop, ell, px, line, limb, fill, dith } from './paint';

/** His size: the drawing's units to world px (stood up he's about 104 tall: a head and a half over Meathead). */
export const DAD_K = 0.8;
/** How tall he is (world px), stood and sat, for words over his head. */
export const DAD_H = 106, DAD_SIT_H = 90;

// ---------------------------------------------------------------------------------------------------------------
// Ramps

export const SKIN: Ramp = ['#FCE0CF', '#EFBFA6', '#D59B82', '#B27461', '#5E3026'];
export const FLUSH: Ramp = ['#F7A3B0', '#DE6178', '#BE4260', '#932C49', '#4A0F20'];
export const TANK: Ramp = ['#FFFFFF', '#EEEBE2', '#D2CDBF', '#ABA596', '#5A564C'];
export const BOXER: Ramp = ['#EAF2FC', '#C7DCF3', '#9CBAE0', '#7393BE', '#2C3E66'];
export const SOCK: Ramp = ['#55555E', '#2E2E35', '#1F1F24', '#141418', '#000000'];
export const SLIPPER: Ramp = ['#C49466', '#9A6A40', '#7A4F2C', '#58361C', '#24140A'];
export const HAIR: Ramp = ['#FFFFFF', '#E8E8E8', '#C4C4C4', '#9A9A9A', '#545454'];
export const CAN: Ramp = ['#F25A6E', '#C8102E', '#9E0C24', '#760819', '#38030B'];
export const STRIPE = '#3B6FB6', STAIN = '#DCC67C', MUSTARD = '#C99A2E', SPOT = '#C99474', VEIN = '#8A92C4', TAT = '#5B7A9C';
export const EYE_W = '#F5E4DC', EYE_RED = '#E0707A', IRIS = '#7EA4C8', BAG = '#B98478', MIC = '#E3C2A2', TEETH = '#E8DCAE';

// ---------------------------------------------------------------------------------------------------------------
// His parts (facing left, in his units, about his feet)

export type DadFace = 'bleary' | 'sip' | 'yell' | 'squint' | 'angry' | 'burp' | 'strain' | 'out' | 'puke' | 'wide';

/** A can of SWILL LITE (its middle at (x, y), tipped by `ang` (0 upright), crushed 0..1). */
export const can = (c: Ctx, x: number, y: number, ang: number, crushed = 0, open = true) => {
  c.save(); c.translate(x, y); c.rotate(ang);
  const h = 15 - crushed * 9, w = 7 + crushed * 2;
  shape(c, () => { c.moveTo(-w / 2, -h / 2); c.lineTo(w / 2, -h / 2); c.lineTo(w / 2 - crushed, 0); c.lineTo(w / 2, h / 2); c.lineTo(-w / 2, h / 2); c.lineTo(-w / 2 + crushed, 0); c.closePath(); }, CAN, -w / 2, w / 2, 0.8);
  // (the label: the white band with SWILL's red bar across it, the blue crown, a cold sweat on the can)
  px(c, -w / 2 + 0.5, -h / 2 + 3, w - 1, 3.4, '#F4F1E8'); px(c, w / 2 - 2, -h / 2 + 3, 1.5, 3.4, '#D8D2C2');
  px(c, -w / 2 + 1.5, -h / 2 + 4.2, w - 3, 1, '#C8102E');
  px(c, -0.6, -h / 2 + 7.4, 1.4, 1.2, '#2A4AA8'); px(c, -1.2, -h / 2 + 7, 0.6, 0.6, '#2A4AA8'); px(c, 0.8, -h / 2 + 7, 0.6, 0.6, '#2A4AA8');
  if (!crushed) { px(c, -w / 2 + 1, h / 2 - 4, 0.6, 1.2, '#FFD6DC'); px(c, w / 2 - 2.4, h / 2 - 6, 0.6, 1, '#FFD6DC'); }
  px(c, -w / 2, -h / 2 - 1, w, 1.4, '#C9CDD4'); px(c, -w / 2, -h / 2 - 1, w * 0.4, 0.6, '#F4F6FA'); px(c, -w / 2, h / 2 - 0.4, w, 1.4, '#9AA0A8');
  if (open && !crushed) { px(c, -1, -h / 2 - 1.6, 2, 0.8, '#3A3A3A'); px(c, 0.6, -h / 2 - 2.2, 1.6, 0.6, '#B4BAC4'); }
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
  const brow = face === 'angry' || face === 'squint' ? 1.6 : face === 'yell' || face === 'strain' ? -0.6 : face === 'wide' ? -1.8 : face === 'puke' ? 1 : 0;
  line(c, [-15, -7 + brow * 0.3, -10, -8 + brow], 2, HAIR[3]); line(c, [-6, -8 + brow, -1, -7.5 + brow * 0.2], 2, HAIR[3]);
  line(c, [-14, -8 + brow * 0.3, -10, -9 + brow], 0.8, HAIR[1]); line(c, [-5, -9 + brow, -2, -8.6], 0.8, HAIR[1]);
  // (the eyes: bloodshot, half shut under heavy lids, bags under them)
  const eye = (ex: number, w: number) => {
    ell(c, ex, -2.4, w * 0.62, 1.6, BAG);
    if (face === 'sip' || face === 'out' || face === 'yell' || face === 'strain' || face === 'burp' || face === 'puke') { line(c, [ex - w / 2, -4, ex + w / 2, -3.6], 1, SKIN[4]); if (face === 'burp') { ell(c, ex, -5.4, w / 2.4, 1.2, EYE_W); px(c, ex - 0.6, -6.6, 1.2, 1, IRIS); } return; }
    // (wide: baffled, the lids gone up for once, pinprick pupils)
    if (face === 'wide') { ell(c, ex, -4.4, w / 2 + 0.4, 2.6, EYE_W); px(c, ex - w / 2 + 0.6, -4.6, 1.2, 0.5, EYE_RED); px(c, ex - 1.1, -4.8, 1.2, 1.2, '#1A1A1A'); line(c, [ex - w / 2 - 0.4, -7.2, ex + w / 2 + 0.4, -7.4], 0.7, SKIN[3]); return; }
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
  if (face === 'puke') {
    // (puking: the jaw dropped as far as it goes, the cheeks gone green, the lot coming up)
    ell(c, -8, 3, 4.4, 3, dith(c, '#8FB43A'));
    fill(c, '#5A1020', () => c.ellipse(-12.5, 11.5, 4.6, 5.2, 0, 0, Math.PI * 2)); px(c, -15, 7.4, 5, 1, TEETH);
    ell(c, -13, 11, 3.4, 3.6, '#B8C43A'); ell(c, -14, 10, 1.6, 1.4, '#E2E87A');
  } else if (face === 'yell' || face === 'burp' || flap === 2) { fill(c, '#5A1020', () => c.ellipse(-12, 10.5, 3.4, face === 'yell' || face === 'burp' ? 3.6 : 2.4, 0, 0, Math.PI * 2)); px(c, -14, 8, 4, 1, TEETH); ell(c, -12, 12.4, 2, 1, '#C24A5A'); }
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
  c.save(); c.beginPath(); c.ellipse(bx, by, rx + 1, ry + 1, 0, 0, Math.PI * 2); c.clip();
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

/** His upper arm and forearm (units): every pose's hand is put within their reach, and the elbow worked out from it. */
export const UPPER_ARM = 25, FOREARM = 25;
/** The elbow for a hand (limb.ts: the hand pulled in to his reach first): he faces left in his own units, so the forearm
 *  folds toward the front of the upper arm the way it does for any figure facing -x, whatever the pose. */
export const elbowOf = (sh: readonly number[], hand: readonly number[]) => {
  const h2 = reachTo(sh[0], sh[1], hand[0], hand[1], UPPER_ARM, FOREARM);
  const el = elbowAt(sh[0], sh[1], h2[0], h2[1], UPPER_ARM, FOREARM, -1);
  return { el: [el[0], el[1]], hand: [h2[0], h2[1]] };
};

/** A tube's outline (paint.ts limb's path: tapered from r1 to r2, `sag` flab off whichever side faces down). */
const tubePath = (c: Ctx, x1: number, y1: number, r1: number, x2: number, y2: number, r2: number, sag = 0) => () => {
  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
  let nx = -uy, ny = ux;
  if (ny < 0 || (ny === 0 && nx < 0)) { nx = -nx; ny = -ny; }
  const upA = Math.atan2(-ny, -nx), dnA = Math.atan2(ny, nx), ccw = !(ny * ux - nx * uy > 0), rm = (r1 + r2) / 2;
  c.moveTo(x1 - nx * r1, y1 - ny * r1);
  c.lineTo(x2 - nx * r2, y2 - ny * r2);
  c.arc(x2, y2, r2, upA, dnA, ccw);
  c.quadraticCurveTo((x1 + x2) / 2 + nx * (rm + sag * 1.5), (y1 + y2) / 2 + ny * (rm + sag * 1.5), x1 + nx * r1, y1 + ny * r1);
  c.arc(x1, y1, r1, dnA, upA, ccw);
  c.closePath();
};
/** Several pieces of one limb as ONE silhouette: the ink round the lot first (a little outside each piece), then every
 *  piece's stepped fill over it, so no seam shows where they overlap (an elbow, a shoulder: no sausage links). */
const fused = (c: Ctx, parts: { path: () => void; x0: number; x1: number }[], r: Ramp, ink = 1.5) => {
  c.strokeStyle = r[4]; c.lineWidth = ink; c.lineJoin = 'round';
  for (const p of parts) { c.beginPath(); p.path(); c.stroke(); }
  for (const p of parts) shape(c, p.path, r, p.x0, p.x1, 0.001);
};
const hairTicks = (c: Ctx, a: readonly number[], b: readonly number[], off: number, n: number, col: string) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
  let nx = -dy / d, ny = dx / d; if (ny > 0) { nx = -nx; ny = -ny; }
  for (let k = 0; k < n; k++) {
    const t = (k + 0.5) / n, x = a[0] + dx * t + nx * off, y = a[1] + dy * t + ny * off;
    line(c, [x, y, x + nx * 1.4 + (dx / d) * 0.8, y + ny * 1.4 + (dy / d) * 0.8], 0.5, col);
  }
};

/** A meaty hand at (hx, hy), the forearm coming in along (ux, uy): an open paw (four sausage fingers, the thumb on its
 *  upper side) or a fist (the knuckles, the thumb over them). */
const paw = (c: Ctx, hx: number, hy: number, ux: number, uy: number, r: Ramp, fist: boolean) => {
  const a = Math.atan2(uy, ux);
  // (the thumb on whichever side faces up and forward on screen)
  const s = 0.6 * Math.sin(a) - 0.8 * Math.cos(a) >= 0 ? 1 : -1;
  c.save(); c.translate(hx, hy); c.rotate(a);
  if (fist) {
    shape(c, () => c.ellipse(0.4, 0, 6.2, 5.6, 0, 0, Math.PI * 2), r, -6, 6.6, 0.8);
    for (let k = 0; k < 4; k++) { const y = (k - 1.5) * 2.5; ell(c, 5, y, 1.6, 1.2, r[0]); if (k) line(c, [3.2, y - 1.25, 6.4, y - 1.25], 0.5, r[3]); }
    limb(c, -1, s * 4.6, 2, 3.6, s * 1.6, 1.7, r, 0, 0.6);
  } else {
    // (the fingers first, the palm's back over their roots: knuckles)
    for (let k = 0; k < 4; k++) { const y = (k - 1.5) * 2.4, len = 9.4 - Math.abs(k - 1.5) * 1.2; limb(c, 3, y, 1.75, len, y + 0.6, 1.45, r, 0, 0.6); px(c, len - 0.4, y - 0.2, 1, 0.8, '#E8D8A8'); }
    shape(c, () => c.ellipse(0.6, 0, 5.8, 5.2, 0, 0, Math.PI * 2), r, -5.2, 6.4, 0.8);
    limb(c, -0.6, s * 4, 2, 4.4, s * 6, 1.6, r, 0, 0.6);
  }
  // (liver spots on the back of it, a few white hairs)
  ell(c, -1, -1, 0.9, 0.7, SPOT); ell(c, 1.6, 1.4, 0.7, 0.55, SPOT);
  for (let k = 0; k < 3; k++) px(c, -3.4 + k * 1.6, -2.6 + (k % 2), 0.5, 1.2, HAIR[2]);
  c.restore();
};

/** Fingers wrapped round something thin he's holding at `hold` (its middle) tipped `ang` (its long axis along local
 *  y), his hand at `hand`: three fat fingers across the front of it where his hand is. `half`: how far up and down it
 *  goes (the fingers kept on it), `w` its half width. */
const wrap = (c: Ctx, hold: readonly number[], ang: number, hand: readonly number[], half: number, w: number, near: boolean) => {
  const r: Ramp = near ? SKIN : [SKIN[1], SKIN[2], SKIN[3], SKIN[3], SKIN[4]];
  const dx = hand[0] - hold[0], dy = hand[1] - hold[1], ca = Math.cos(-ang), sa = Math.sin(-ang);
  const ly = Math.max(-half + 3, Math.min(half - 3, dx * sa + dy * ca));
  c.save(); c.translate(hold[0], hold[1]); c.rotate(ang);
  for (let k = -1; k <= 1; k++) limb(c, -w - 1.6, ly + k * 2.3, 1.35, w - 0.4, ly + k * 2.3 + 0.4, 1.2, r, 0, 0.55);
  c.restore();
};

/** An arm from the shoulder to the hand, a fat old man's: the round of the shoulder, the big soft upper arm (the bingo
 *  wing hanging off it), the elbow (a wrinkled knob), the thick forearm (liver spots, white hair, the Navy anchor on the
 *  near one), a meaty paw. Shoulder, upper arm and forearm are one silhouette (no seams). Returns where the hand ended
 *  up (pulled in to his reach). */
const arm = (c: Ctx, sh: number[], handIn: number[], near: boolean, fist = false) => {
  const r: Ramp = near ? SKIN : [SKIN[1], SKIN[2], SKIN[3], SKIN[3], SKIN[4]];
  const { el, hand } = elbowOf(sh, handIn);
  const fx = hand[0] - el[0], fy = hand[1] - el[1], fd = Math.hypot(fx, fy) || 1, ux = fx / fd, uy = fy / fd;
  const wrist = [hand[0] - ux * 4.4, hand[1] - uy * 4.4];
  const R1 = 10.5, R2 = 7.2, R3 = 6.8, R4 = 5.2;
  const box = (x0: number, x1: number, rr: number) => ({ x0: Math.min(x0, x1) - rr, x1: Math.max(x0, x1) + rr });
  fused(c, [
    { path: () => c.ellipse(sh[0], sh[1] + 1, 11, 10, 0, 0, Math.PI * 2), ...box(sh[0], sh[0], 11) },
    { path: tubePath(c, sh[0], sh[1] + 1, R1, el[0], el[1], R2, 3.4), ...box(sh[0], el[0], R1) },
    { path: tubePath(c, el[0], el[1], R3, wrist[0], wrist[1], R4, 1.2), ...box(el[0], wrist[0], R3) },
  ], r);
  // (the elbow: the knob on its outside, wrinkled; the crease on the inside of the bend)
  {
    const ex = el[0] - sh[0], ey = el[1] - sh[1], ed = Math.hypot(ex, ey) || 1;
    const ox = ex / ed - ux, oy = ey / ed - uy, ol = Math.hypot(ox, oy);
    if (ol > 0.15) {
      const kx = ox / ol, ky = oy / ol;
      ell(c, el[0] + kx * 3.4, el[1] + ky * 3.4, 3.6, 3, r[2]);
      for (let k = -1; k <= 1; k++) line(c, [el[0] + kx * 3.6 - ky * k * 1.6, el[1] + ky * 3.6 + kx * k * 1.6, el[0] + kx * 5.6 - ky * k * 1.9, el[1] + ky * 5.6 + kx * k * 1.9], 0.45, r[3]);
      line(c, [el[0] - kx * 3.4 - ky * 2.2, el[1] - ky * 3.4 + kx * 2.2, el[0] - kx * 4.8, el[1] - ky * 4.8, el[0] - kx * 3.4 + ky * 2.2, el[1] - ky * 3.4 - kx * 2.2], 0.6, r[3]);
    }
  }
  // (liver spots on the upper arm, white hair on the forearm's top)
  ell(c, (sh[0] + el[0]) / 2 + 1, (sh[1] + el[1]) / 2 - 2, 1.4, 1, SPOT); ell(c, sh[0] * 0.3 + el[0] * 0.7 - 2, sh[1] * 0.3 + el[1] * 0.7 + 1, 0.9, 0.7, SPOT);
  hairTicks(c, el, wrist, 4.6, 5, HAIR[2]);
  if (near) {
    // (the anchor, faded, on the forearm)
    const ax = el[0] + (wrist[0] - el[0]) * 0.5, ay = el[1] + (wrist[1] - el[1]) * 0.5;
    line(c, [ax, ay - 2.8, ax, ay + 2.4], 0.8, TAT); line(c, [ax - 2.2, ay + 1.2, ax, ay + 2.8, ax + 2.2, ay + 1.2], 0.8, TAT); px(c, ax - 1.4, ay - 1.9, 2.8, 0.7, TAT);
    ell(c, ax + 2.6, ay - 2.4, 0.9, 0.7, SPOT);
  }
  paw(c, hand[0], hand[1], ux, uy, r, fist);
  return hand;
};

const dimR = (r: Ramp, near: boolean): Ramp => (near ? r : [r[1], r[2], r[3], r[3], r[4]]);
/** A knee: the bare kneecap (a big knob, lit on top, the wrinkles round it, a liver spot), the thigh's skin above it out
 *  of the boxers' cuff. Drawn with the leg, and again over the belly when he's sat (his knees stick out past the gut). */
const kneecap = (c: Ctx, hip: number[], knee: number[], near: boolean) => {
  const r = dimR(SKIN, near);
  const dx = knee[0] - hip[0], dy = knee[1] - hip[1], d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
  shape(c, () => c.ellipse(knee[0] + ux * 0.8, knee[1] + uy * 0.8 - 0.4, 5.9, 5.2, Math.atan2(uy, ux), 0, Math.PI * 2), r, knee[0] - 5.9, knee[0] + 5.9, 0.8);
  ell(c, knee[0] + ux * 1.4 - 1.2, knee[1] + uy * 1.4 - 2.4, 2.6, 1.5, r[0]);
  line(c, [knee[0] - uy * 3.8 + ux * 3.4, knee[1] + ux * 3.8 + uy * 3.4, knee[0] + ux * 4.6, knee[1] + uy * 4.6 + 0.8, knee[0] + uy * 3.8 + ux * 3.4, knee[1] - ux * 3.8 + uy * 3.4], 0.55, r[3]);
  line(c, [knee[0] - uy * 3 - ux * 2.8, knee[1] + ux * 3 - uy * 2.8, knee[0] - ux * 3.8, knee[1] - uy * 3.8 + 0.5], 0.5, r[2]);
  ell(c, knee[0] - ux * 0.4 + 1.8, knee[1] - uy * 0.4 - 0.8, 0.9, 0.7, SPOT);
};

/** A leg from the hip to the knee to the foot (the knee from limb.ts, worked out in drawDad): the baggy boxer leg over a
 *  fat thigh (the cuff above the knee), the bare knee, the hairy shin with a calf on it (veins), the sock, the slipper. */
const leg = (c: Ctx, hip: number[], knee: number[], foot: number[], near: boolean, sag = 0) => {
  const dim = (r: Ramp): Ramp => dimR(r, near);
  const dx = knee[0] - hip[0], dy = knee[1] - hip[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
  const cuff = [hip[0] + dx * 0.72, hip[1] + dy * 0.72];
  // (the shin first (its top under the knee): thick at the calf, thin at the ankle, hair and a varicose vein; the black
  // sock pulled up (the near one's slid down))
  const ankle = [foot[0] + 2, foot[1] - 4];
  limb(c, knee[0], knee[1], 5, ankle[0], ankle[1], 3.7, dim(SKIN), 1.6);
  line(c, [knee[0] - 1.4, knee[1] + 5, (knee[0] + ankle[0]) / 2 - 2, (knee[1] + ankle[1]) / 2, ankle[0] - 1.4, ankle[1] - 7], 0.6, VEIN);
  hairTicks(c, knee, ankle, 4.4, 4, HAIR[3]);
  const sockTop = 0.45 + (near ? sag : 0), st = [knee[0] + (ankle[0] - knee[0]) * sockTop, knee[1] + (ankle[1] - knee[1]) * sockTop];
  limb(c, st[0], st[1], 4.5, ankle[0], ankle[1], 4, SOCK);
  if (near && sag > 0) line(c, [st[0] - 4.2, st[1] + 1, st[0] + 4.2, st[1] + 2], 0.8, SOCK[0]);
  // (the bare fat thigh between the cuff and the knee, then the boxer leg over it: baggy, striped, wide where it meets
  // him, the cuff a little short of the knee)
  limb(c, cuff[0], cuff[1], 8.4, knee[0], knee[1], 6.4, dim(SKIN), 1);
  limb(c, hip[0], hip[1], 12, cuff[0], cuff[1], 9.6, dim(BOXER), 1.4);
  c.save(); c.beginPath(); c.moveTo(hip[0] + nx * 14, hip[1] + ny * 14); c.lineTo(cuff[0] + nx * 12, cuff[1] + ny * 12); c.lineTo(cuff[0] - nx * 12, cuff[1] - ny * 12); c.lineTo(hip[0] - nx * 14, hip[1] - ny * 14); c.closePath(); c.clip();
  for (let k = -16; k <= 16; k += 4) line(c, [hip[0] + k, hip[1] - 14, cuff[0] + k, cuff[1] - 12, cuff[0] + k, cuff[1] + 12], 1, near ? STRIPE : mix(STRIPE, '#000000', 0.2));
  c.restore();
  // (the cuff's hem: a dark fold across the end of the boxer leg)
  line(c, [cuff[0] + nx * 9.4, cuff[1] + ny * 9.4, cuff[0] - nx * 9.4, cuff[1] - ny * 9.4], 1.2, dim(BOXER)[3]);
  kneecap(c, hip, knee, near);
  // (the slipper: brown terry (its loops), flattened at the heel, the sole worn through at the toe)
  shape(c, () => { c.moveTo(foot[0] + 6.5, foot[1]); c.lineTo(foot[0] + 6.5, foot[1] - 4.6); c.quadraticCurveTo(foot[0] - 2, foot[1] - 8, foot[0] - 11, foot[1] - 4); c.quadraticCurveTo(foot[0] - 14.5, foot[1], foot[0] - 10, foot[1]); c.closePath(); }, dim(SLIPPER), foot[0] - 14.5, foot[0] + 6.5);
  px(c, foot[0] - 10, foot[1] - 5.2, 9, 1, SLIPPER[0]);
  for (let k = 0; k < 5; k++) px(c, foot[0] - 10 + k * 2.8, foot[1] - 3.2 + (k % 2) * 1.2, 0.8, 0.8, near ? SLIPPER[2] : SLIPPER[3]);
  px(c, foot[0] - 13, foot[1] - 1, 4, 1, SLIPPER[4]); px(c, foot[0] - 12, foot[1] - 1.6, 1.6, 0.8, SKIN[1]);
};

// ---------------------------------------------------------------------------------------------------------------
// The mallet in his hands (the fight's hits are worked out from these, so they land where it's drawn)

/** The mallet (fightArt drawMallet, in his units): the head's middle this far up the handle from the grip, its half
 *  length along the handle and across it. */
export const MALLET_HEAD = { off: 88, along: 17, across: 28 };
const lerp2 = (a: readonly number[], b: readonly number[], k: number) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
/** The Donkey Kong hammer, both fists on the handle (k 0: up over his head, tipped back; 1: slammed down onto the deck
 *  out in front): the near hand (the mallet's grip), the far one up the handle, the mallet's angle. */
export const hammerGrip = (k: number) => {
  const g = lerp2([-14, -130], [-44, -80], k), ang = 0.3 + (-2.3 - 0.3) * k;
  const ux = Math.sin(ang), uy = -Math.cos(ang);
  return { near: g, far: [g[0] - ux * 9, g[1] - uy * 9], ang };
};
/** The swat from the couch (t 0: grabbing it up off the couch's arm .. 0.35 wound back over his shoulder .. 1 swung
 *  through, out in front and down): his hand round the grip, the mallet's angle. The arc's about his shoulder. */
export const swatGrip = (t: number) => {
  const sh = [-20, -76];
  if (t < 0.35) {
    const e = t / 0.35, k = e * e * (3 - 2 * e);
    const back = [sh[0] + Math.cos(-0.9) * 40, sh[1] + Math.sin(-0.9) * 40];
    return { near: lerp2([-30, -58], back, k), ang: -0.3 + (0.67 + 0.3) * k };
  }
  // (the arc's a touch short of his full reach, the head driven down into the deck at the end: the user's "slightly
  // reduce the smacking range of the mallet when close": about 15% less reach out in front than it had)
  const e = Math.min(1, (t - 0.35) / 0.65), k = 1 - (1 - e) * (1 - e);
  const phi = -0.9 - 2.44 * k, r = 40 - 6 * k;
  return { near: [sh[0] + Math.cos(phi) * r, sh[1] + Math.sin(phi) * r], ang: phi + Math.PI / 2 - 0.55 * k };
};
/** Where the mallet's head is (his units): its middle and its half-size each way (a box round it, a touch inside the
 *  corners: it's a barrel). */
export const malletHead = (grip: readonly number[], ang: number) => {
  const ux = Math.sin(ang), uy = -Math.cos(ang), M = MALLET_HEAD;
  return {
    x: grip[0] + ux * M.off, y: grip[1] + uy * M.off,
    hx: (M.along * Math.abs(ux) + M.across * Math.abs(uy)) * 0.85, hy: (M.along * Math.abs(uy) + M.across * Math.abs(ux)) * 0.85,
  };
};

// ---------------------------------------------------------------------------------------------------------------
// Him, whole

export interface DadOpts {
  facing?: -1 | 1; t?: number; talking?: boolean; face?: DadFace;
  /** Holding the can (and it's got beer in it: tipped right back when not); crushed 0..1; gone (dropped). */
  can?: 'near' | 'far' | null; canFull?: boolean; crushed?: number;
  /** Swaying (stood up: drunk). */
  sway?: number;
  /** Something in his hands (the mallet, a bottle), drawn in his own units over the near arm: his near and far hands. */
  held?: (c: Ctx, near: number[], far: number[]) => void;
  /** Stood up: his knees bent (0..1), the tell before a hop and the give as he lands. */
  crouch?: number;
}

/** Him, his feet's point at (x, feetY): `pose` what he's doing; `opts.t` how far through it (0..1). */
export const drawDad = (c: Ctx, x: number, feetY: number, pose: DadPose, f: number, o: DadOpts = {}) => {
  if (pose === 'gone') return;
  const t = Math.max(0, Math.min(1, o.t ?? 0)), talking = !!o.talking;
  // (he faces left in his own units; mirrored for the right)
  c.save(); c.translate(Math.round(x), Math.round(feetY)); c.scale(DAD_K * (o.facing === 1 ? -1 : 1), DAD_K);
  const sat = pose === 'sit' || pose === 'sip' || pose === 'call' || pose === 'reach' || pose === 'tv' || pose === 'squint'
    || pose === 'swat' || pose === 'catch' || pose === 'puke' || pose === 'baffled';
  // (getting up: from sat (u 0) to stood (u 1), hands on his knees, rocking twice first)
  const up = pose === 'rise' ? Math.max(0, (t - 0.45) / 0.55) : sat ? 0 : 1;
  const rock = pose === 'rise' && t < 0.45 ? Math.sin(t * 14) * 4 : 0;
  const L = (a: number, b: number) => a + (b - a) * up;
  const sway = (o.sway ?? (sat ? 0 : Math.sin(f * 0.04) * 2.4)) * (sat ? 0 : 1);
  const breathe = Math.sin(f * 0.05) * 0.8;
  // (stood: the knees bent, everything over them down with it)
  const cr = up < 1 ? 0 : Math.max(0, Math.min(1, o.crouch ?? 0)), dropY = cr * 11;
  // The skeleton: sat (the couch's seat at -30; the knees out past the gut) to stood
  const hip = [L(8, 0) + rock * 0.3, L(-32, -44) + dropY];
  const step = pose === 'shuffle' ? Math.sin(f * 0.2) * 5 : 0;
  const footN = [L(-38, -6 + step), 0], footF = [L(-29, 8 - step), L(-1, 0)];
  // (the knees from limb.ts, facing left: sat, the fat thighs out level from under the gut, the knees past it, the shins
  // down to the slippers planted under them; stood, all but straight; crouched, they come forward. The bones longer sat: the thigh's seen end on less)
  const hipN = [hip[0] - 6, hip[1] + 1], hipF = [hip[0] + 6, hip[1]];
  const thighL = L(42, 20.4), shinL = L(27.5, 20.4);
  const kneeOf = (h: number[], ft: number[]) => { const k = kneeAt(h[0], h[1], ft[0] + 2, ft[1] - 4, thighL, shinL, -1); return [k[0], k[1]]; };
  const kneeN = kneeOf(hipN, footN), kneeF = kneeOf(hipF, footF);
  const bx = L(-4, -6) + sway * 0.5 + rock, by = L(-50, -66) + breathe + dropY, brx = 31, bry = L(25, 27);
  const lean = pose === 'rise' && t < 0.6 ? 10 * (1 - up) : pose === 'heave' ? 16 + Math.sin(f * 0.3) * 2 : pose === 'drag' ? -6 : pose === 'hammer' ? 7 * Math.min(1, t) : 0;
  const shN = [L(-20, -22) + sway + rock - lean, L(-76, -96) + breathe + lean * 0.6 + dropY], shF = [L(16, 12) + sway + rock - lean, L(-80, -100) + breathe + lean * 0.6 + dropY];
  let hx = L(-8, -10) + sway * 1.2 + rock - lean * 1.2, hy = L(-98, -118) + breathe + lean + dropY;
  let tilt = 0, hdir = -1;
  let face: DadFace = o.face ?? 'bleary';
  // The hands, by pose (sat, his far hand planted on the cushion beside him, past the gut where it shows)
  const SEAT_HAND = [34, -42];
  let handN = [L(-14, -24) + sway, L(-50, -78)], handF = [34, -70];
  let canAt: number[] | null = null, canAng = 0;
  const holding = o.can === undefined ? 'near' : o.can;
  switch (pose) {
    case 'sit': handN = [-38 + Math.sin(f * 0.02), -41]; handF = SEAT_HAND.slice(); break;
    case 'sip': handN = [-22, -94]; handF = SEAT_HAND.slice(); tilt = 0.28; face = o.face ?? 'sip'; break;
    case 'call': handN = [-38, -41]; handF = [12, -96]; hdir = 1; tilt = 0.12; face = o.face ?? (talking ? 'yell' : 'bleary'); break;
    case 'reach': handN = [-38, -41]; handF = [46 + t * 18, -58]; hdir = 1; break;
    case 'tv': handN = [-46 + Math.sin(f * 0.5) * 3, -84 + Math.cos(f * 0.5) * 2]; handF = SEAT_HAND.slice(); face = o.face ?? (talking ? 'yell' : 'angry'); break;
    case 'squint': handN = [-38, -41]; handF = SEAT_HAND.slice(); hx -= 3; hy += 2; face = o.face ?? 'squint'; break;
    case 'rise': handN = [L(kneeN[0] + 2, -24), L(kneeN[1] - 6, -78)]; handF = [L(kneeF[0] + 4, 14), L(kneeF[1] - 6, -64)]; face = o.face ?? 'strain'; break;
    case 'stand': handN = [-30 + sway, -50]; handF = [16 + sway, -52]; break;
    case 'shuffle': handN = [-30 + sway + step * 0.6, -50]; handF = [16 + sway - step * 0.6, -52]; break;
    case 'crush': { const k = Math.min(1, t * 2.2); handN = [-24 - 6 * k + sway, -80 - 42 * k]; handF = [16, -60]; tilt = -0.12 * k; face = o.face ?? (t > 0.5 ? 'angry' : 'strain'); break; }
    // (the fight's)
    case 'swat': {
      // (grabbed up, wound back over his shoulder, swung through round it and down out in front: swatGrip)
      handN = swatGrip(t).near; handF = SEAT_HAND.slice();
      face = o.face ?? (t < 0.4 ? 'angry' : 'yell'); break;
    }
    case 'catch': handN = [-14, -124]; handF = SEAT_HAND.slice(); tilt = -0.1; face = o.face ?? 'yell'; break;
    case 'puke': hx -= 7; hy += 7; handN = [-8, -56]; handF = SEAT_HAND.slice(); face = 'puke'; break;
    case 'baffled': handN = [hx - 7, hy - 15]; handF = [hx + 9, hy - 17]; face = o.face ?? 'wide'; break;
    case 'drag': handN = [26 + sway, -70]; handF = [34 + sway, -66]; face = o.face ?? 'strain'; break;
    case 'hammer': {
      // (the Donkey Kong hammer: both fists on the handle, up over his head (t 0), slammed down out in front (t 1),
      // leaning into it: hammerGrip)
      const g = hammerGrip(Math.min(1, t));
      handN = [g.near[0], g.near[1] + dropY]; handF = [g.far[0], g.far[1] + dropY]; face = o.face ?? (talking ? 'yell' : 'angry'); break;
    }
    case 'cower': handN = [hx - 16, hy - 26]; handF = [hx + 6, hy - 30]; face = o.face ?? 'wide'; break;
    case 'stagger': handN = [-46 + Math.sin(f * 0.21) * 8, -104 + Math.cos(f * 0.17) * 6]; handF = [36 + Math.cos(f * 0.19) * 8, -114 + Math.sin(f * 0.23) * 6]; face = o.face ?? 'bleary'; break;
    case 'heave': handN = [-30, -16]; handF = [-20, -14]; face = o.face ?? 'strain'; break;
    case 'fridge': handN = [-44, -86]; handF = [16 + sway, -60]; face = o.face ?? 'bleary'; break;
  }
  if (holding === 'near') {
    canAt = pose === 'sip' ? [handN[0] - 3, handN[1] - 2] : pose === 'crush' ? [hx - 15, hy - 5] : [handN[0] - 1, handN[1] - 6];
    canAng = pose === 'sip' ? (o.canFull === false ? 2.4 : 1.85) : pose === 'tv' ? -0.3 : 0;
  } else if (holding === 'far') { canAt = [handF[0] + 1, handF[1] - 6]; canAng = 0.1; }
  // Drawing, back to front: the far arm, the far leg, the near leg, the belly (sat: the knees over it), the near arm,
  // the head, the can
  handF = arm(c, shF, handF, false, pose === 'call');
  if (holding === 'far' && canAt) { can(c, canAt[0], canAt[1], canAng, o.crushed ?? 0); wrap(c, canAt, canAng, handF, (15 - (o.crushed ?? 0) * 9) / 2, (7 + (o.crushed ?? 0) * 2) / 2, false); }
  leg(c, [hip[0] + 6, hip[1]], kneeF, footF, false);
  leg(c, [hip[0] - 6, hip[1] + 1], kneeN, footN, true, 0.2);
  // (the boxers' seat under the belly: the stripes, the fly's gap and its button, the waistband rolled under the gut;
  // the headset's beltpack clipped on it, its wire up his back)
  shape(c, () => c.ellipse(hip[0], hip[1] - 2, 20, 10, 0, 0, Math.PI * 2), BOXER, hip[0] - 20, hip[0] + 20);
  c.save(); c.beginPath(); c.ellipse(hip[0], hip[1] - 2, 20, 10, 0, 0, Math.PI * 2); c.clip();
  for (let k = -22; k < 22; k += 4) { px(c, hip[0] + k, hip[1] - 12, 1.2, 20, STRIPE); px(c, hip[0] + k + 1.2, hip[1] - 12, 0.6, 20, BOXER[0]); }
  px(c, hip[0] - 22, hip[1] + 3, 44, 6, BOXER[3]);
  c.restore();
  line(c, [hip[0] - 4, hip[1] - 6, hip[0] - 5, hip[1] + 2], 0.8, BOXER[4]); ell(c, hip[0] - 3.4, hip[1] - 4, 0.9, 0.9, '#F4F1E8');
  shape(c, () => c.roundRect(hip[0] + 12, hip[1] - 12, 7, 9, 1.4), ['#4A4A52', '#2A2A30', '#1E1E24', '#141418', '#000000'], hip[0] + 12, hip[0] + 19, 0.6);
  px(c, hip[0] + 13, hip[1] - 11, 2, 1, '#22C55E'); line(c, [hip[0] + 18, hip[1] - 12, hip[0] + 21, hip[1] - 18], 0.6, '#1A1A1A');
  // (the shoulders and the chest behind the belly: the tank top's straps, grey chest hair over its neckline)
  shape(c, () => { c.moveTo(shN[0] - 4, shN[1] + 6); c.quadraticCurveTo(shN[0], shN[1] - 4, (shN[0] + shF[0]) / 2, shN[1] - 3); c.quadraticCurveTo(shF[0], shF[1] - 4, shF[0] + 6, shF[1] + 6); c.lineTo(bx + brx * 0.6, by - bry * 0.4); c.lineTo(bx - brx * 0.7, by - bry * 0.4); c.closePath(); }, SKIN, shN[0] - 6, shF[0] + 6);
  belly(c, bx, by, brx, bry);
  // (sat (or getting up), his near knee sticks out past the gut: its kneecap over the belly's edge (the far one's behind
  // the near thigh))
  if (up < 0.6) kneecap(c, hipN, kneeN, true);
  // (the tank top's neckline and straps up over the shoulders, a tuft of white chest hair)
  const nx = (shN[0] + shF[0]) / 2 - 2, ny = Math.min(shN[1], shF[1]) + 6;
  shape(c, () => { c.moveTo(shN[0] + 2, shN[1] - 1); c.lineTo(shN[0] + 7, shN[1] - 2); c.quadraticCurveTo(nx, ny + 10, shF[0] - 5, shF[1] - 1); c.lineTo(shF[0], shF[1]); c.lineTo(shF[0] + 2, by - bry + 6); c.lineTo(shN[0] - 2, by - bry + 6); c.closePath(); }, TANK, shN[0], shF[0]);
  for (let k = 0; k < 6; k++) line(c, [nx - 5 + k * 2, ny + 3 + (k % 2), nx - 6 + k * 2.2, ny + 1], 0.6, HAIR[1]);
  // (the straps gone yellow at the armholes; white hair tufting off the shoulders)
  ell(c, shN[0] + 4, shN[1] + 9, 4, 6, dith(c, STAIN)); ell(c, shF[0] - 3, shF[1] + 9, 3.4, 5, dith(c, STAIN));
  for (const [sx, sy] of [shN, shF]) for (let k = 0; k < 4; k++) line(c, [sx - 3 + k * 2, sy - 1, sx - 4 + k * 2.4, sy - 3.4 - (k % 2)], 0.5, HAIR[0]);
  // (the neck rolls)
  shapeTop(c, () => c.ellipse(hx + 4, hy + 15, 13, 6, 0, 0, Math.PI * 2), SKIN, hy + 9, hy + 21);
  line(c, [hx - 6, hy + 16, hx + 10, hy + 17], 0.6, SKIN[3]);
  handN = arm(c, shN, handN, true, pose === 'tv' || pose === 'crush' || pose === 'hammer');
  head(c, hx, hy, face, f, hdir, tilt, talking);
  if (holding === 'near' && canAt) { can(c, canAt[0], canAt[1], canAng, o.crushed ?? 0); if (pose !== 'crush') wrap(c, canAt, canAng, handN, (15 - (o.crushed ?? 0) * 9) / 2, (7 + (o.crushed ?? 0) * 2) / 2, true); }
  // (crushing it on his forehead: the thumb over the top of it)
  if (pose === 'crush' && canAt) ell(c, canAt[0] + 3, canAt[1] - 2, 3, 2.4, SKIN[1]);
  o.held?.(c, handN, handF);
  // (his fists round the mallet's handle (the angles the fight puts it at: dad.ts swatGrip / hammerGrip))
  if (o.held) {
    const ang = pose === 'swat' ? swatGrip(t).ang : pose === 'hammer' ? hammerGrip(Math.min(1, t)).ang : pose === 'stagger' ? 2.1 : pose === 'heave' ? -1.7 : null;
    if (ang !== null) { wrap(c, handN, ang, handN, 9, 3, true); if (pose === 'hammer') wrap(c, handF, ang, handF, 9, 3, true); }
  }
  c.restore();
};

/** Where his head is (world), for words over it. */
export const dadHeadAt = (x: number, feetY: number, sat: boolean) => ({ x, y: feetY - (sat ? DAD_SIT_H : DAD_H) });

// ---------------------------------------------------------------------------------------------------------------
// The couch (the show's: the orange plaid one off the poster, gone saggy; his dent in it, the stuffing out of one arm)

const COUCH_R: Ramp = ['#F7A15A', '#E0752E', '#B9561A', '#8E3F12', '#3E1606'];
const COUCH_DK: Ramp = ['#D9773A', '#B95A20', '#943F12', '#6C2C0A', '#2E1004'];
export const drawCouch = (c: Ctx, x: number, floorY: number, f: number, o: { empty?: boolean; dim?: number; w?: number } = {}) => {
  c.save(); c.translate(Math.round(x), Math.round(floorY)); c.scale(DAD_K, DAD_K);
  const W = o.w ?? 190, back = -74, seat = -30;
  const plaid = (x0: number, y0: number, w: number, h: number) => {
    c.save(); c.beginPath(); c.rect(x0, y0, w, h); c.clip();
    // (the plaid: brown bars both ways, their crossings darker, a cream pinstripe, a dither where they fade)
    for (let k = x0 + 6; k < x0 + w; k += 14) { px(c, k, y0, 3, h, 'rgba(120,40,10,0.35)'); px(c, k + 5, y0, 1, h, 'rgba(255,220,160,0.3)'); px(c, k + 9, y0, 0.6, h, 'rgba(60,110,40,0.35)'); }
    for (let k = y0 + 5; k < y0 + h; k += 12) { px(c, x0, k, w, 3, 'rgba(120,40,10,0.3)'); px(c, x0, k + 4, w, 1, 'rgba(255,220,160,0.25)'); for (let j = x0 + 6; j < x0 + w; j += 14) px(c, j, k, 3, 3, 'rgba(70,20,4,0.35)'); }
    c.restore();
  };
  // (the back: a long low hump, sagging in the middle)
  shapeTop(c, () => { c.moveTo(-W / 2, seat); c.lineTo(-W / 2 + 4, back + 6); c.quadraticCurveTo(-W / 4, back - 4, 0, back + 4); c.quadraticCurveTo(W / 4, back - 4, W / 2 - 4, back + 6); c.lineTo(W / 2, seat); c.closePath(); }, COUCH_DK, back - 4, seat);
  plaid(-W / 2, back - 6, W, seat - back + 6);
  // (the back's buttons, tufted in; the dark where his head's rested for twenty years)
  const nb = Math.max(2, Math.round((W - 44) / 29) + 1);
  for (let k = 0; k < nb; k++) { const bx = -W / 2 + 22 + k * ((W - 44) / (nb - 1)), by = back + 18 + (k % 2) * 6; ell(c, bx, by, 2.4, 1.8, COUCH_DK[3]); ell(c, bx - 0.6, by - 0.6, 1, 0.8, COUCH_DK[0]); line(c, [bx - 6, by - 4, bx, by, bx + 6, by - 4], 0.5, COUCH_DK[2]); }
  ell(c, W / 4 + 4, back + 14, 16, 8, dith(c, '#6A2E0C'));
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
  shape(c, () => { c.moveTo(-W / 2 + 10, back + 4); c.lineTo(-W / 2 + 50, back); c.lineTo(-W / 2 + 46, seat - 6); c.lineTo(-W / 2 + 14, seat - 4); c.closePath(); }, ['#6AA874', '#3F7A4A', '#2E6038', '#1E4628', '#0A2410'], -W / 2 + 10, -W / 2 + 50, 0.6);
  // (its granny squares, zigzag rows, the fringe hanging off it)
  for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { const sx = -W / 2 + 14 + k * 8 - r * 0.6, sy = back + 6 + r * 7 - k * 0.6; px(c, sx, sy, 6, 5, ['#E5C46A', '#B8443A', '#F4EEDC', '#7A3A6A'][(r + k) % 4]); px(c, sx + 1.5, sy + 1.5, 3, 2, ['#B8443A', '#F4EEDC', '#3F7A4A', '#E5C46A'][(r + k) % 4]); }
  for (let k = 0; k < 9; k++) line(c, [-W / 2 + 15 + k * 3.6, seat - 4, -W / 2 + 15 + k * 3.6, seat + 1 + (k % 2)], 0.6, '#E5C46A');
  px(c, -4, seat - 6, 10, 4, '#2A2A2A'); px(c, -2, seat - 6, 2, 1, '#DC2626'); for (let k = 0; k < 3; k++) px(c, 2 + k * 2, seat - 5, 1, 1, '#6A6A72');
  // (a cigarette burn in the near cushion; the ashtray on the arm (a butt smoking), the TV GUIDE under it)
  ell(c, -W / 4 + 12, seat - 3, 2.4, 1.2, '#2A1206'); ell(c, -W / 4 + 12, seat - 3, 3.6, 1.8, dith(c, '#5A2A0C'));
  px(c, W / 2 - 8, seat - 25, 18, 4, '#E8E4D8'); px(c, W / 2 - 8, seat - 25, 18, 1, '#FFFFFF'); px(c, W / 2 - 6, seat - 24, 6, 1, '#C8102E');
  shape(c, () => c.ellipse(W / 2 + 1, seat - 27, 7, 2.4, 0, 0, Math.PI * 2), ['#C8D8E8', '#9AB4CC', '#7A94AC', '#5A7490', '#1E2E40'], W / 2 - 6, W / 2 + 8, 0.6);
  px(c, W / 2 - 2, seat - 29, 6, 1.4, '#F4F0E4'); px(c, W / 2 + 3, seat - 29.4, 1.4, 1.4, '#E06030');
  if (!o.empty) for (let k = 0; k < 3; k++) { const u = ((f * 0.4 + k * 20) % 60) / 60; c.globalAlpha = 0.4 * (1 - u); px(c, W / 2 + 4 + Math.sin(u * 6 + k) * 2, seat - 32 - u * 18, 1.4, 1.4, '#D8DCE8'); c.globalAlpha = 1; }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The signs (the posters, the billboard, the gate, the store, the mural, the portrait on the set: bigkid/art.ts dadArt
// calls this): him as the fight draws him, on a short couch, yelling for a beer with the can up

const signCache = new Map<string, HTMLCanvasElement>();
/** Him on the couch for a sign, in its units: the couch's foot-middle at (0, 0), about 90 tall, facing right (his
 *  mouth at the speech balloon); `fade` pulls it toward the paper (the sun, the years). Painted off to one side at the
 *  sign's own resolution, faded there, then laid on. */
export const drawDadSign = (g: Ctx, fade: number, paper: string) => {
  const S = 0.79 / DAD_K, X0 = -70, Y0 = -132, W = 140, H = 138;
  const tf = g.getTransform(), ds = Math.min(6, Math.max(0.5, Math.hypot(tf.a, tf.b) || 1));
  const key = `${ds.toFixed(2)}|${fade.toFixed(3)}|${paper}`;
  let cv = signCache.get(key);
  if (!cv) {
    if (typeof document === 'undefined') return;
    cv = document.createElement('canvas'); cv.width = Math.ceil(W * ds); cv.height = Math.ceil(H * ds);
    const o = cv.getContext('2d')!;
    o.scale(ds, ds); o.translate(-X0, -Y0);
    o.save(); o.translate(-15, 0); o.scale(-S, S);
    drawCouch(o, -15.2, 0, 0, { w: 106 });
    drawDad(o, 0, 0, 'tv', 0, { face: 'yell', can: 'near', canFull: true });
    o.restore();
    if (fade > 0) { o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'source-atop'; o.globalAlpha = Math.min(1, fade); o.fillStyle = paper; o.fillRect(0, 0, cv.width, cv.height); }
    if (signCache.size > 40) signCache.clear();
    signCache.set(key, cv);
  }
  g.drawImage(cv, X0, Y0, W, H);
};

// ---------------------------------------------------------------------------------------------------------------
// The close-up (screen space): the intro's, him squinting at Meathead: a gross-up, Ren & Stimpy style (dadGross.ts)

/** His face close up, the middle of it about (cx, cy), `s` 3.6 the hold (the screen all face), more as it lurches in;
 *  'squint' one eye screwed shut, peering at Meathead; anything else bleary (`talking`: his mouth going). */
export const drawDadCloseup = (c: Ctx, cx: number, cy: number, s: number, f: number, o: { face?: DadFace; talking?: boolean } = {}) =>
  drawDadGross(c, cx, cy - 52, s / 3.6, f, (o.face ?? 'squint') === 'squint', !!o.talking);
