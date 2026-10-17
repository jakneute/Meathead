// HELICOPTER HARRY, ripped (the land boss, drawn at the land bosses' grade: Steve's, Donnie's, Artie's): the flight
// jacket, the tie-dye and the helmet torn off, and under them twenty-two years of secret push-ups. Oiled and tanned:
// traps, delts, pecs with the shadow cut under them, a six-pack, serratus, the V down into his jeans, gray chest hair and
// a happy trail, veins up his forearms; a faded PEACE SIGN tattoo on his bicep from the old days; dog tags on a chain;
// a bandolier of M60 brass across him; a peace-sign belt buckle; the red bandana (its tails flying), still the gray
// ponytail, the Van Dyke and the round amber glasses; still the faded jeans, the white tube socks and the sandals. An M60
// (the polymer stock, the steel receiver and feed cover, the carry handle, the barrel and gas tube, the slotted flash
// hider, the folded bipod, a belt of brass hanging off it in a loop).
//
// Every material in its own five-step ramp, stepped bands with dithered seams, outlined in its own darkest tone, lit
// from the upper left (harry/heli harryArt.ts's painter and his head: the same man). Feet at the origin, facing right
// (`facing` -1 mirrors him), about 100 px tall at scale 1. `aim` is the gun's angle off level (down +), where a pose
// holds it. The gun's pivot and muzzle (muzzleAt) and his mouth (mouthAt) are where the fight's rounds and streams
// come from: unchanged.

import {
  head, hand, shapeR, tubeR, pxR, lineR, ellR, dith, sickR, mixHex, steamOff,
  SKIN_R, DENIM_R, GRAY_R, BAND_R, LEATHER_R, SOCK_R, BRASS_R, STEEL_R, TIEDYE, type Ramp, type Mood,
} from '../heli/harryArt';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

export type RamboPose =
  | 'stand' | 'walk' | 'fire' | 'leap' | 'cling' | 'rant' | 'command' | 'hurt' | 'sick' | 'barf' | 'fall' | 'spin' | 'dead' | 'flex';
export interface RamboLook {
  pose: RamboPose; f: number; facing?: 1 | -1; aim?: number; talking?: boolean;
  /** Airsick (0..1): green in the face and the skin. */
  green?: number;
  /** Her concrete on him (0..1: a splash to plastered), and set hard (gray to dark). */
  concrete?: number;
  /** Turned about his hips (the barf's lean back, the heave's hunch forward): radians, + leans forward. */
  lean?: number;
  rot?: number; scale?: number;
  /** The gun going off (a muzzle flash this frame). */
  flash?: boolean;
  /** Dead: the bandana down over his eyes, the seat of his jeans split (tie-dye underpants). */
  dead?: boolean;
}

/** Where his mouth is, from his feet, standing (facing right) and leaning `lean` about his hips. */
export const mouthAt = (lean = 0, scale = 1, facing: 1 | -1 = 1) => {
  const px = 0, py = -42, mx = 8, my = -84 - py;
  const c = Math.cos(lean), s = Math.sin(lean);
  return { x: (px + mx * c - my * s) * scale * facing, y: (py + mx * s + my * c) * scale };
};
/** Where the gun's muzzle is from his feet (standing, facing right), held at `aim`. */
export const muzzleAt = (pose: RamboPose, aim: number, scale = 1, facing: 1 | -1 = 1) => {
  const pv = pivotOf(pose);
  return { x: (pv.x + Math.cos(aim) * 56) * scale * facing, y: (pv.y + Math.sin(aim) * 56) * scale };
};
/** The gun's pivot (the rear grip) by pose. */
const pivotOf = (pose: RamboPose) => (pose === 'cling' ? { x: 10, y: -60 } : { x: 6, y: -46 });

// ---------------------------------------------------------------------------------------------------------------
// Materials

/** The M60: its polymer furniture, its parkerized steel, the brass. */
const POLY: Ramp = ['#646B58', '#353A2E', '#262A20', '#181B14', '#060805'];
const PARK: Ramp = ['#9AA1AC', '#4E5662', '#3A414B', '#232931', '#0A0D12'];
const TATTOO = '#2E6E7E';
const CONC_R: Ramp = ['#E7E5E2', '#B8B4AE', '#8E8A84', '#66625C', '#2C2925'];
const CONC_SET: Ramp = ['#A8A29E', '#78716C', '#5E5853', '#44403C', '#1C1917'];

/** His skin: tanned and oiled; green airsick; gray under her concrete. */
const skinOf = (L: RamboLook): Ramp => {
  let r = sickR(SKIN_R, L.green ?? 0);
  const k = L.concrete ?? 0;
  if (k > 0.5) r = r.map((c, i) => mixHex(c, CONC_R[i], Math.min(0.6, (k - 0.5) * 1.2))) as unknown as Ramp;
  return r;
};

// ---------------------------------------------------------------------------------------------------------------
// Arms

/** A two-bone arm from the shoulder to the hand (the elbow bent `bend` way, clockwise +1 / anticlockwise -1: the front
 *  arm's elbow goes OUT (forward) with +1, the back arm's with -1). Delt, bicep, forearm, veins, the fist; `tat`: the
 *  peace sign on its bicep. */
const arm = (c: Ctx, sx: number, sy: number, hx: number, hy: number, S: Ramp, bend = 1, fist = true, big = 1, tat = false, back = false) => {
  const a = 17 * big, b = 17 * big;
  let dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy) || 1;
  if (d > a + b - 0.5) { const k = (a + b - 0.5) / d; dx *= k; dy *= k; d = a + b - 0.5; hx = sx + dx; hy = sy + dy; }
  const base = Math.atan2(dy, dx), off = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
  const ang = base + off * bend, ex = sx + Math.cos(ang) * a, ey = sy + Math.sin(ang) * a;
  const R: Ramp = back ? [S[1], S[2], S[3], S[3], S[4]] : S;
  // (the forearm first, tapering to the wrist; the upper arm over it; the bicep's bulge on its inside; the delt's cap)
  tubeR(c, [ex, ey, hx, hy], [9 * big], [R]);
  const fa = Math.atan2(hy - ey, hx - ex), fl = Math.hypot(hx - ex, hy - ey);
  // (the forearm's swell near the elbow, its veins)
  shapeR(c, () => c.ellipse(ex + Math.cos(fa) * fl * 0.32, ey + Math.sin(fa) * fl * 0.32, fl * 0.3, 5.4 * big, fa, 0, Math.PI * 2), R, ex - 8, ex + 8, 0.9);
  const vx = -Math.sin(fa), vy = Math.cos(fa);
  lineR(c, [ex + Math.cos(fa) * 5 + vx * 1.6, ey + Math.sin(fa) * 5 + vy * 1.6, ex + Math.cos(fa) * 11 - vx * 0.6, ey + Math.sin(fa) * 11 - vy * 0.6, hx - Math.cos(fa) * 3, hy - Math.sin(fa) * 3], 0.7, R[3]);
  lineR(c, [ex + Math.cos(fa) * 11 - vx * 0.6, ey + Math.sin(fa) * 11 - vy * 0.6, ex + Math.cos(fa) * 14 + vx * 2, ey + Math.sin(fa) * 14 + vy * 2], 0.6, R[3]);
  tubeR(c, [sx, sy, ex, ey], [11 * big], [R]);
  const ua = Math.atan2(ey - sy, ex - sx), ul = Math.hypot(ex - sx, ey - sy);
  const inS = -bend, bx = sx + Math.cos(ua) * ul * 0.5 - Math.sin(ua) * inS * 2.4 * big, by = sy + Math.sin(ua) * ul * 0.5 + Math.cos(ua) * inS * 2.4 * big;
  shapeR(c, () => c.ellipse(bx, by, ul * 0.36, 6 * big, ua, 0, Math.PI * 2), R, bx - 9 * big, bx + 9 * big, 0.9);
  pxR(c, bx - 3 * big, by - 3 * big, 2.4 * big, 1.2, R[0]); pxR(c, bx - 2 * big, by - 3.6 * big, 1, 1, '#FFF4E2');
  shapeR(c, () => c.ellipse(sx, sy + 1, 6.6 * big, 6 * big, ua, 0, Math.PI * 2), R, sx - 6.6 * big, sx + 6.6 * big, 0.9);
  pxR(c, sx - 3 * big, sy - 3 * big, 2.6 * big, 1.2, R[0]);
  if (tat) {
    // (the peace sign from the old days, faded into his skin, a little ring of dots round it)
    const tx = bx + Math.sin(ua) * 1.4, ty = by - Math.cos(ua) * 1.4;
    c.strokeStyle = TATTOO; c.lineWidth = 1; c.beginPath(); c.arc(tx, ty, 3, 0, Math.PI * 2);
    c.moveTo(tx, ty - 3); c.lineTo(tx, ty + 3); c.moveTo(tx, ty); c.lineTo(tx - 2.2, ty + 2.2); c.moveTo(tx, ty); c.lineTo(tx + 2.2, ty + 2.2); c.stroke();
    for (let k = 0; k < 6; k++) { const q = (k / 6) * Math.PI * 2; pxR(c, tx + Math.cos(q) * 4.6 - 0.4, ty + Math.sin(q) * 4.6 - 0.4, 0.8, 0.8, dith(c, TATTOO)); }
  }
  hand(c, hx, hy, fist, R);
  return { ex, ey };
};

// ---------------------------------------------------------------------------------------------------------------
// The M60

/** The M60, in its own frame: the rear grip at the origin, pointing +x (the muzzle at 56, 0). */
const m60 = (c: Ctx, flash: boolean, f: number) => {
  // (the buttstock: polymer, stepped, its butt plate)
  shapeR(c, () => { c.moveTo(-20, -5); c.lineTo(-2, -5.6); c.lineTo(-2, 3); c.lineTo(-20, 7); c.closePath(); }, POLY, -20, -2, 1.1);
  pxR(c, -20, -5, 2, 12, POLY[3]); lineR(c, [-17, -2.6, -4, -3.2], 1, POLY[0]);
  // (the pistol grip and its checkering; the trigger guard and the trigger)
  shapeR(c, () => { c.moveTo(0.4, 3); c.lineTo(6.4, 3); c.lineTo(4.6, 11.6); c.lineTo(-0.4, 11.2); c.closePath(); }, POLY, -0.4, 6.4, 1);
  pxR(c, 1, 5, 4, 5, dith(c, POLY[3]));
  c.strokeStyle = PARK[4]; c.lineWidth = 1.4; c.beginPath(); c.moveTo(6.4, 3); c.quadraticCurveTo(10, 8.6, 13, 3); c.stroke();
  lineR(c, [8.6, 3, 9.2, 6], 1, PARK[1]);
  // (the receiver: parkerized steel in steps; the feed cover and its latch; the cocking handle; the ejection port)
  shapeR(c, () => c.rect(-2, -7, 26, 10.4), PARK, -2, 24, 1.1);
  pxR(c, -1, -6, 24, 1, PARK[0]);
  shapeR(c, () => c.rect(1.6, -10.4, 15, 3.6), PARK, 1.6, 16.6, 1);
  pxR(c, 2, -10, 14, 1, '#C3C9D2'); pxR(c, 14.6, -11.4, 2.4, 1.6, PARK[4]);
  pxR(c, 3, -2.6, 9, 2.6, PARK[4]); pxR(c, 3.4, -2.2, 8.2, 1, PARK[2]);
  pxR(c, 18, -1, 4, 3, PARK[4]); pxR(c, 18.6, -0.6, 2, 1, PARK[0]);
  // (the barrel and the gas cylinder under it; the carry handle; the front sight; the slotted flash hider)
  shapeR(c, () => c.rect(24, -4, 26.4, 4.6), PARK, 24, 50.4, 1);
  pxR(c, 24, -3.4, 26, 1, PARK[0]);
  shapeR(c, () => c.rect(24, 0.6, 20, 2.8), POLY, 24, 44, 0.9);
  for (let k = 0; k < 5; k++) pxR(c, 27 + k * 3.6, 1.2, 1.2, 1.6, POLY[4]);
  c.strokeStyle = PARK[4]; c.lineWidth = 2.4; c.beginPath(); c.moveTo(21, -4); c.quadraticCurveTo(26, -12, 33, -4); c.stroke();
  c.strokeStyle = PARK[1]; c.lineWidth = 1.2; c.stroke();
  shapeR(c, () => c.rect(45.4, -7.4, 2, 3.6), PARK, 45.4, 47.4, 0.8);
  shapeR(c, () => c.rect(50, -4.8, 6.4, 6.2), PARK, 50, 56.4, 1);
  for (let k = 0; k < 3; k++) pxR(c, 51 + k * 1.8, -3.6, 0.8, 4, PARK[4]);
  // (the bipod, folded back under the barrel)
  lineR(c, [43, 2.6, 30, 5.2], 2.2, PARK[4]); lineR(c, [43, 2.6, 30, 5.2], 1, PARK[1]);
  lineR(c, [43, 3.6, 31, 6.4], 2.2, PARK[4]); lineR(c, [43, 3.6, 31, 6.4], 1, PARK[2]);
  // (the belt off the feed tray in a hanging loop of brass, linked; its tips)
  for (let k = 0; k < 8; k++) {
    const t = k / 7, bx = 6 - t * 12 + Math.sin(f * 0.2 + k) * 0.6, by = 3.6 + Math.sin(t * Math.PI) * 15;
    pxR(c, bx - 2, by - 2.4, 4, 4.8, BRASS_R[4]);
    pxR(c, bx - 1.5, by - 2, 3, 4, BRASS_R[2]); pxR(c, bx - 1.5, by - 2, 1.2, 4, BRASS_R[0]); pxR(c, bx + 0.6, by - 2, 0.9, 4, BRASS_R[3]);
    pxR(c, bx - 1, by - 3.4, 2, 1.4, '#B87333');
    pxR(c, bx - 2.2, by + 0.2, 4.4, 1, PARK[3]);
  }
  if (flash) {
    // (the muzzle flash: a stepped star, red at its points, yellow, a white-hot heart; it changes every other frame)
    const k = (f >> 1) % 2, x = 57;
    const star = (s: number, col: string) => {
      c.fillStyle = col; c.beginPath();
      const pts = k ? [[0, -1], [12, -7], [8, -1.4], [20, 0], [8, 1.4], [12, 7], [0, 1]] : [[0, -1], [9, -9], [7, -1.6], [22, -0.4], [7, 1.6], [9, 9], [0, 1]];
      pts.forEach(([px, py], i) => (i ? c.lineTo(x + px * s, py * s) : c.moveTo(x + px * s, py * s))); c.closePath(); c.fill();
    };
    star(1.1, '#B91C1C'); star(0.9, '#F97316'); star(0.66, '#FDE047'); star(0.36, '#FFFBEB');
    ellR(c, x + 1, 0, 4.6 + k, 4.6 + k, '#FDE047'); ellR(c, x + 1, 0, 2.6, 2.6, '#FFFFFF');
  }
};

/** The gun held at `aim` off a pivot (the rear grip), both hands on it; the arms from the shoulders. */
const gunHeld = (c: Ctx, L: RamboLook, S: Ramp, pv: { x: number; y: number }, aim: number, shBack: [number, number], shFront: [number, number], oneHand = false) => {
  const ca = Math.cos(aim), sa = Math.sin(aim);
  const at = (x: number, y: number) => [pv.x + x * ca - y * sa, pv.y + x * sa + y * ca] as const;
  const [gx, gy] = at(2, 6), [fx, fy] = at(30, 3);
  arm(c, shBack[0], shBack[1], gx, gy, S, 1, true, 1, false, true);
  c.save(); c.translate(pv.x, pv.y); c.rotate(aim); m60(c, !!L.flash, L.f); c.restore();
  if (!oneHand) arm(c, shFront[0], shFront[1], fx, fy, S, 1, true, 1, true);
};

// ---------------------------------------------------------------------------------------------------------------
// The torso

const torsoPath = (c: Ctx) => { c.moveTo(-10, -40); c.lineTo(10, -40); c.lineTo(13, -52); c.quadraticCurveTo(21, -64, 18, -72); c.lineTo(-17, -72); c.quadraticCurveTo(-20, -62, -12, -52); c.closePath(); };

const torso = (c: Ctx, S: Ramp, f: number) => {
  // (the traps up to his neck, the neck's column: behind the chest's line)
  shapeR(c, () => { c.moveTo(-16, -71); c.quadraticCurveTo(-8, -76, -4, -79); c.lineTo(7, -79); c.quadraticCurveTo(12, -76, 17, -71); c.closePath(); }, S, -16, 17, 1);
  pxR(c, -4, -79, 3, 6, S[0]);
  // (the V: broad up top, narrow at the jeans, in steps)
  shapeR(c, () => torsoPath(c), S, -20, 21, 1.2);
  c.save(); c.beginPath(); torsoPath(c); c.clip();
  // (the pecs: two slabs, lit on top, the shadow cut deep under them (dithered into the abs); the sternum's groove)
  const pecL = () => { c.moveTo(-14, -71); c.quadraticCurveTo(-4, -72.6, 0.6, -66.6); c.quadraticCurveTo(-2, -59.4, -11, -60); c.quadraticCurveTo(-15.4, -63, -14, -71); c.closePath(); };
  const pecR = () => { c.moveTo(1.6, -66.6); c.quadraticCurveTo(7, -72.6, 17.6, -70); c.quadraticCurveTo(17, -59, 4, -59.4); c.closePath(); };
  shapeR(c, pecL, S, -15, 1, 0.9); shapeR(c, pecR, S, 1.6, 18, 0.9);
  pxR(c, -10, -69.6, 7, 1.6, S[0]); pxR(c, 4, -69.6, 7, 1.4, S[0]); pxR(c, -8, -70, 2, 1, '#FFF4E2'); pxR(c, 6, -70, 2, 1, '#FFF4E2');
  pxR(c, -12, -59.6, 11, 1.2, S[3]); pxR(c, 2, -59, 15, 1.2, S[3]); pxR(c, -12, -58.4, 28, 1.2, dith(c, S[2]));
  pxR(c, -7.6, -64.4, 1.4, 1.4, S[3]); pxR(c, 7, -64, 1.4, 1.4, S[3]);
  lineR(c, [0.8, -71, 0.8, -59], 0.8, S[3]);
  // (the abs: three rows of two, each lit along its top, the cuts between them dithered; the line down the middle)
  for (let r = 0; r < 3; r++) for (const s of [-1, 1]) {
    const ax = s > 0 ? 1.6 : -7.6, ay = -56.4 + r * 5.2;
    pxR(c, ax, ay, 6, 4.4, S[1]); pxR(c, ax, ay, 6, 1.2, S[0]); pxR(c, ax + (s > 0 ? 4.6 : 0), ay + 1, 1.4, 3.4, S[2]);
    pxR(c, ax, ay + 4.2, 6, 1, dith(c, S[3]));
  }
  lineR(c, [0.6, -58, 0.6, -42], 0.9, S[3]);
  // (the serratus down the near side, the obliques into the V, the navel)
  for (let k = 0; k < 3; k++) { lineR(c, [11.6 - k * 0.4, -64 + k * 3.4, 14 - k * 0.6, -62.6 + k * 3.4], 0.8, S[3]); pxR(c, 11.6 - k * 0.4, -64.6 + k * 3.4, 2, 0.6, S[0]); }
  lineR(c, [-11, -53, -7.6, -43], 0.9, S[3]); lineR(c, [11, -53, 7.6, -43], 0.9, S[3]);
  pxR(c, -0.4, -45.6, 1.6, 1.4, S[4]);
  // (gray chest hair on the sternum, the happy trail down to the belt)
  pxR(c, -4, -68, 9, 6, dith(c, GRAY_R[2])); pxR(c, -2, -62, 5, 3, dith(c, GRAY_R[2]));
  for (let k = 0; k < 5; k++) pxR(c, -0.2 + ((k * 3) % 2), -48 + k * 1.4, 1, 1, GRAY_R[3]);
  // (the oil's sheen)
  if ((f >> 4) % 3 !== 2) { pxR(c, -14, -66, 1, 1, '#FFF4E2'); pxR(c, 13, -66, 1, 1, '#FFF4E2'); }
  c.restore();
  // (the dog tags: a bead chain round his neck, two tags on his sternum)
  c.strokeStyle = STEEL_R[3]; c.lineWidth = 0.8; c.setLineDash([0.8, 0.8]); c.beginPath(); c.moveTo(-4, -77); c.quadraticCurveTo(-3, -67, 0.4, -64.4); c.quadraticCurveTo(4, -67, 6.4, -77); c.stroke(); c.setLineDash([]);
  shapeR(c, () => c.roundRect(-1.4, -64.6, 3.4, 5, 1), STEEL_R, -1.4, 2, 0.7); shapeR(c, () => c.roundRect(0.8, -63.6, 3.4, 5, 1), STEEL_R, 0.8, 4.2, 0.7);
  pxR(c, 1.2, -62.8, 2, 0.6, STEEL_R[3]); pxR(c, 1.2, -61.6, 2, 0.6, STEEL_R[3]);
  // (the bandolier: front shoulder to back hip, the strap in steps, the rounds in their links)
  lineR(c, [15, -71, -10, -42], 5.6, LEATHER_R[4]); lineR(c, [15, -71, -10, -42], 4, LEATHER_R[1]); lineR(c, [14.2, -71.6, -10.8, -42.6], 1.2, LEATHER_R[0]);
  for (let k = 0; k < 8; k++) {
    const t = (k + 0.5) / 8, bx = 15 - 25 * t, by = -71 + 29 * t;
    pxR(c, bx - 1.6, by - 3.8, 3.2, 5, BRASS_R[4]); pxR(c, bx - 1.1, by - 3.2, 2.2, 3.8, BRASS_R[2]); pxR(c, bx - 1.1, by - 3.2, 0.9, 3.8, BRASS_R[0]);
    pxR(c, bx - 0.8, by - 4.6, 1.6, 1.4, '#B87333'); pxR(c, bx - 0.8, by - 4.6, 0.6, 0.6, '#E8A86A');
  }
  // (the belt: tooled leather, its loops; the buckle: a peace sign in brass, from the old days)
  shapeR(c, () => c.rect(-11.4, -42.6, 23, 3.6), LEATHER_R, -11.4, 11.6, 1);
  for (const x of [-8, 7]) pxR(c, x, -42.6, 1.4, 3.6, LEATHER_R[3]);
  ellR(c, 2.6, -40.8, 3.2, 3.2, BRASS_R[4]); ellR(c, 2.6, -40.8, 2.6, 2.6, BRASS_R[1]); pxR(c, 1.4, -42.6, 1.2, 1, BRASS_R[0]);
  c.strokeStyle = BRASS_R[4]; c.lineWidth = 0.6; c.beginPath(); c.moveTo(2.6, -43); c.lineTo(2.6, -38.6); c.moveTo(2.6, -40.8); c.lineTo(1.2, -39.2); c.moveTo(2.6, -40.8); c.lineTo(4, -39.2); c.stroke();
};

// ---------------------------------------------------------------------------------------------------------------
// The legs: faded jeans, tube socks, sandals

const legs = (c: Ctx, L: RamboLook, S: Ramp) => {
  const { pose, f } = L;
  let a: [number, number, number, number, number, number], b: typeof a;
  if (pose === 'walk') {
    const s = Math.sin(f * 0.16) * 9, lift = (k: number) => Math.max(0, k) * 0.6;
    a = [-5, -40, -3 + s * 0.5, -21, -4 + s, -lift(s)]; b = [5, -40, 6 - s * 0.5, -21, 6 - s, -lift(-s)];
  } else if (pose === 'leap') {
    a = [-5, -40, 6, -30, -2, -18]; b = [5, -40, 14, -30, 8, -18];
  } else if (pose === 'fall' || pose === 'spin') {
    const k = Math.sin(f * 0.5) * 8;
    a = [-5, -40, -8, -22, -10 + k, -6]; b = [5, -40, 10, -24, 14 - k, -10];
  } else if (pose === 'cling') {
    a = [-5, -40, -14, -28, -16, -14]; b = [5, -40, 6, -21, 5, -3];
  } else if (pose === 'dead') {
    a = [-5, -40, -10, -21, -13, -2]; b = [5, -40, 11, -21, 14, -2];
  } else {
    a = [-5, -40, -6, -21, -7, -2]; b = [5, -40, 6, -21, 8, -2];
  }
  const backR: Ramp = [DENIM_R[1], DENIM_R[2], DENIM_R[3], DENIM_R[3], DENIM_R[4]];
  [a, b].forEach((g, i) => {
    const R = i ? DENIM_R : backR;
    tubeR(c, [g[0], g[1], g[2], g[3], g[4], g[5] - 2.6], [10.4, 9], [R, R]);
    // (the knee's fade, the whiskers at the hip, the hem's roll)
    pxR(c, g[2] - 2, g[3] - 1.6, 3.6, 3, dith(c, DENIM_R[0])); pxR(c, g[2] - 1.4, g[3] - 1, 1.6, 1.4, DENIM_R[0]);
    lineR(c, [g[0] + 1, g[1] + 4, g[0] + 3, g[1] + 5], 0.6, R[0]);
    const ha = Math.atan2(g[5] - g[3], g[4] - g[2]), nx = -Math.sin(ha), ny = Math.cos(ha), hx = g[4] - Math.cos(ha) * 3.4, hy = g[5] - 2.6 - Math.sin(ha) * 3.4;
    lineR(c, [hx - nx * 5.4, hy - ny * 5.4, hx + nx * 5.4, hy + ny * 5.4], 3, R[4], 'butt'); lineR(c, [hx - nx * 4.6, hy - ny * 4.6, hx + nx * 4.6, hy + ny * 4.6], 1.6, R[2], 'butt');
    // (the white tube sock and its two stripes; the sandal's sole and straps; his toes, a gray hair or two)
    const fx = g[4], fy = g[5];
    shapeR(c, () => c.rect(fx - 3.6, fy - 3.4, 7.2, 5.4), SOCK_R, fx - 3.6, fx + 3.6, 0.9);
    pxR(c, fx - 3.4, fy - 2.6, 6.8, 0.9, '#DC2626'); pxR(c, fx - 3.4, fy - 1.3, 6.8, 0.9, '#2563EB');
    shapeR(c, () => c.roundRect(fx - 3.8, fy + 1.6, 12.6, 3.2, 1.2), LEATHER_R, fx - 3.8, fx + 8.8, 0.9);
    pxR(c, fx - 3.4, fy + 3.8, 12, 0.8, LEATHER_R[3]);
    shapeR(c, () => c.rect(fx + 1, fy - 0.6, 2.4, 2.6), LEATHER_R, fx + 1, fx + 3.4, 0.6);
    for (let k = 0; k < 3; k++) { pxR(c, fx + 4.4 + k * 1.4, fy + 0.4, 1.3, 1.4, S[1]); pxR(c, fx + 4.4 + k * 1.4, fy + 0.4, 1.3, 0.5, S[0]); }
  });
  // (the seat: the jeans over his hips, the fly's seam and its rivets, a back pocket)
  const hips = () => { c.moveTo(-11.4, -43); c.lineTo(12.4, -43); c.lineTo(11.4, -33); c.lineTo(6, -29.6); c.lineTo(0.4, -31.6); c.lineTo(-5, -29.6); c.lineTo(-10.4, -33); c.closePath(); };
  shapeR(c, hips, DENIM_R, -11.4, 12.4, 1.1);
  lineR(c, [1.4, -39, 1.6, -31.6], 0.7, DENIM_R[4]); lineR(c, [1.4, -39, 3.6, -34], 0.6, '#E0A050');
  pxR(c, -9, -40.4, 1, 1, '#E8B060'); pxR(c, 10, -40.4, 1, 1, '#E8B060');
  lineR(c, [-10, -38, -5.6, -36], 0.6, DENIM_R[0]);
  // (dead: the seat of his jeans split, the tie-dye underpants out of the tear)
  if (L.dead) {
    const tear = () => { c.moveTo(-9.6, -40); c.lineTo(-6, -41.6); c.lineTo(-3, -39.6); c.lineTo(0, -41.4); c.lineTo(2, -38); c.lineTo(-1, -34.4); c.lineTo(-4.4, -36); c.lineTo(-7.6, -34.4); c.closePath(); };
    c.save(); c.beginPath(); tear(); c.clip();
    for (let i = 0; i < 6; i++) pxR(c, -10 + i * 2, -42, 2, 9, TIEDYE[i]);
    pxR(c, -10, -42, 12, 9, dith(c, 'rgba(255,255,255,0.25)'));
    c.restore();
    c.beginPath(); tear(); c.strokeStyle = DENIM_R[4]; c.lineWidth = 0.9; c.stroke();
    for (const [x, y] of [[-9.6, -40], [-6, -41.6], [0, -41.4], [2, -38], [-7.6, -34.4]] as const) pxR(c, x - 0.5, y - 0.5, 1.4, 1, '#E2E8F0');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Her concrete on him

const concreteCoat = (c: Ctx, k: number, f: number) => {
  if (k <= 0) return;
  // (wet, it's pale and runs; setting, it goes darker and stops)
  const set = Math.max(0, (k - 0.6) / 0.4), R: Ramp = set > 0.5 ? CONC_SET : CONC_R;
  c.globalAlpha = Math.min(1, 0.45 + k);
  const slop = () => { c.moveTo(-16, -74); c.quadraticCurveTo(-14, -104, 2, -106); c.quadraticCurveTo(18, -104, 19, -74); c.lineTo(14, -60 + k * 6); c.lineTo(8, -70); c.lineTo(2, -56 + k * 8); c.lineTo(-4, -70); c.lineTo(-10, -62 + k * 4); c.closePath(); };
  shapeR(c, slop, R, -16, 19, 1.1);
  // (its lumps and the grit in it; the lit crest; a drip off each tongue of it)
  c.save(); c.beginPath(); slop(); c.clip();
  pxR(c, -16, -106, 40, 50, dith(c, R[2]));
  for (const [x, y, r] of [[-6, -96, 4], [8, -92, 5], [-10, -80, 3.6], [12, -78, 3.4], [2, -84, 3]] as const) { ellR(c, x, y, r, r * 0.8, R[1]); pxR(c, x - r * 0.6, y - r * 0.6, r, 1, R[0]); }
  c.restore();
  pxR(c, -10, -103, 10, 2, R[0]); pxR(c, -14, -88, 2, 8, R[0]);
  if (set < 1) for (let i = 0; i < 4; i++) {
    const dx = -12 + i * 8, len = 6 + ((f * 0.2 + i * 7) % 10) * k * (1 - set);
    pxR(c, dx - 0.5, -64, 4, len + 1, R[4]); pxR(c, dx, -64, 3, len, R[1]); pxR(c, dx, -64, 1, len, R[0]);
    ellR(c, dx + 1.5, -63 + len, 2, 2, R[1]);
  }
  if (k > 0.6) {
    shapeR(c, () => c.ellipse(0, -2, 16, 5, 0, 0, Math.PI * 2), R, -16, 16, 1);
    shapeR(c, () => c.ellipse(-6, -24, 7, 10, 0, 0, Math.PI * 2), R, -13, 1, 1);
  }
  c.globalAlpha = 1;
};

// ---------------------------------------------------------------------------------------------------------------
// Him

/** His face by what he's at. */
const moodOf = (L: RamboLook): Mood => {
  switch (L.pose) {
    case 'fire': case 'leap': return 'yell';
    case 'cling': return L.flash ? 'yell' : 'mad';
    case 'rant': return L.talking ? 'yell' : 'mad';
    case 'command': return 'yell';
    case 'hurt': case 'fall': return 'ouch';
    case 'spin': return L.talking ? 'yell' : 'ouch';
    case 'sick': return 'queasy';
    case 'barf': return 'barf';
    case 'dead': return 'dead';
    case 'flex': return 'grin';
    default: return 'mad';
  }
};

export const drawRambo = (c: Ctx, x: number, y: number, L: RamboLook) => {
  const { pose, f } = L, S = skinOf(L), sc = L.scale ?? 1;
  c.save();
  c.translate(Math.round(x), Math.round(y));
  c.scale((L.facing ?? 1) * sc, sc);
  if (L.rot) { c.translate(0, -44); c.rotate(L.rot); c.translate(0, 44); }
  // (firing: the recoil shakes him)
  if (pose === 'fire' && L.flash) c.translate(-1 + (f % 2) * 0.6, (f % 3) * 0.3 - 0.3);
  const bob = pose === 'walk' ? Math.abs(Math.sin(f * 0.16)) * -1.5 : 0;
  c.translate(0, bob);
  legs(c, L, S);
  // (the upper body: leaning about his hips)
  c.save();
  if (L.lean) { c.translate(0, -42); c.rotate(L.lean); c.translate(0, 42); }
  const shB: [number, number] = [-13, -68], shF: [number, number] = [14, -68];
  const aim = L.aim ?? 0;
  // (the gun on its sling across his back, the barrel up over his shoulder)
  const slung = pose === 'rant' || pose === 'command' || pose === 'sick' || pose === 'barf' || pose === 'flex' || pose === 'dead';
  if (slung) { c.save(); c.translate(-12, -48); c.rotate(-1.15); m60(c, false, f); c.restore(); lineR(c, [-14, -46, 12, -72], 1.6, LEATHER_R[4]); }
  // Back arm (behind the torso)
  if (pose === 'flex') arm(c, shB[0], shB[1], -26, -84, S, -1, true, 1.15, false, true);
  else if (pose === 'sick' || pose === 'barf') arm(c, shB[0], shB[1], -4, -50, S, 1, true, 1, false, true);
  else if (pose === 'cling') arm(c, shB[0], shB[1], -10, -112, S, -1, true, 1, false, true);
  else if (pose === 'rant' || pose === 'command') arm(c, shB[0], shB[1], -16, -44, S, 1, true, 1, false, true);
  else if (pose === 'fall' || pose === 'spin' || pose === 'dead') arm(c, shB[0], shB[1], -28, pose === 'dead' ? -66 : -86, S, -1, false, 1, false, true);
  torso(c, S, f);
  head(c, f, true, !!L.talking, 1, -86, { bandana: true, green: L.green, mood: moodOf(L), slip: !!L.dead, gray: (L.concrete ?? 0) > 0.5 ? (L.concrete! - 0.5) : 0 });
  if (pose === 'rant' && L.talking) steamOff(c, f, 2, -104);
  // Front arm and the gun
  if (pose === 'stand' || pose === 'walk' || pose === 'fire' || pose === 'hurt' || pose === 'leap') {
    const a = pose === 'stand' ? 0.45 : pose === 'hurt' ? -0.6 : pose === 'leap' ? -0.25 : aim;
    gunHeld(c, L, S, pivotOf(pose), a, shB, shF);
  } else if (pose === 'cling') {
    // (one-handed, Rambo's way, the gun pointing wherever he's sweeping)
    const pv = pivotOf(pose);
    c.save(); c.translate(pv.x, pv.y); c.rotate(aim); m60(c, !!L.flash, f); c.restore();
    const ca = Math.cos(aim), sa = Math.sin(aim);
    arm(c, shF[0], shF[1], pv.x + 2 * ca - 6 * sa, pv.y + 2 * sa + 6 * ca, S, 1, true, 1, true);
  } else if (pose === 'spin') {
    gunHeld(c, L, S, { x: 6, y: -50 }, 0, shB, shF);
  } else if (pose === 'flex') arm(c, shF[0], shF[1], 26, -86, S, 1, true, 1.15, true);
  else if (pose === 'rant') { const s = Math.sin(f * 0.5) * 4; arm(c, shF[0], shF[1], 22, -96 + s, S, 1, true, 1, true); }
  else if (pose === 'command') { const s = Math.sin(f * 0.35) * 5; arm(c, shF[0], shF[1], 30, -78 + s, S, 1, false, 1, true); }
  else if (pose === 'sick') arm(c, shF[0], shF[1], 10, -50, S, 1, true, 1, true);
  else if (pose === 'barf') arm(c, shF[0], shF[1], 18, -44, S, 1, true, 1, true);
  else if (pose === 'fall' || pose === 'dead') arm(c, shF[0], shF[1], 28, pose === 'dead' ? -66 : -90, S, 1, false, 1, true);
  // (the flex: the veins up, a sparkle off the oil)
  if (pose === 'flex' && (f >> 3) % 4 === 0) { pxR(c, 29, -96, 1, 5, '#FFFFFF'); pxR(c, 27, -94, 5, 1, '#FFFFFF'); }
  concreteCoat(c, L.concrete ?? 0, f);
  c.restore();
  c.restore();
};

void BAND_R; void INK;
