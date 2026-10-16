// HELICOPTER HARRY, ripped (the land boss, drawn in full): the flight jacket, the tie-dye and the helmet torn off, and
// under them twenty-two years of secret push-ups. Bare chest (pecs, abs, a V, gray chest hair), a PEACE SIGN tattoo on
// his bicep from the old days, a bandolier of brass across him, the red bandana (its tails flying), still the gray
// ponytail, the goatee and the round amber glasses, still the faded jeans and the socks and sandals. An M60 on a sling.
// The head and the pieces are heli/harryArt.ts's (the same man).
//
// Feet at the origin, facing right (`facing` -1 mirrors him), about 100 px tall at scale 1. Inked, lit from the upper
// left in flat steps. `aim` is the gun's angle off level (down +), where a pose holds it.

import { head, fill, rect, limb, hand, SKIN, DENIM, GRAY, TIEDYE, mixHex } from '../heli/harryArt';

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

const SK = (green: number) => (green > 0 ? SKIN.map(c => mixHex(c, '#84CC16', green * 0.5)) : SKIN);

/** A two-bone arm from the shoulder to the hand (the elbow bent bend way, clockwise +1 / anticlockwise -1: the front
 *  arm's elbow goes OUT (forward) with +1, the back arm's with -1; the other way it folds in over his head). */
const arm = (c: Ctx, sx: number, sy: number, hx: number, hy: number, S: string[], bend = 1, fist = true, big = 1) => {
  const a = 17 * big, b = 17 * big;
  let dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy) || 1;
  if (d > a + b - 0.5) { const k = (a + b - 0.5) / d; dx *= k; dy *= k; d = a + b - 0.5; hx = sx + dx; hy = sy + dy; }
  const base = Math.atan2(dy, dx), off = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
  const ang = base + off * bend, ex = sx + Math.cos(ang) * a, ey = sy + Math.sin(ang) * a;
  // (the upper arm: a fat bicep, then the forearm)
  limb(c, sx, sy, ex, ey, 11 * big, S[1], S[3]);
  // (the bicep's bulge)
  fill(c, S[2], () => c.ellipse((sx + ex) / 2, (sy + ey) / 2 - 1, 7 * big, 5 * big, base + off * bend, 0, Math.PI * 2), 1.1);
  limb(c, ex, ey, hx, hy, 9 * big, S[2], S[3]);
  hand(c, hx, hy, fist);
  return { ex, ey };
};

/** The peace sign on his bicep (from the hippie days). */
const tattoo = (c: Ctx, x: number, y: number) => {
  c.strokeStyle = '#1E3A8A'; c.lineWidth = 1; c.beginPath(); c.arc(x, y, 3, 0, Math.PI * 2);
  c.moveTo(x, y - 3); c.lineTo(x, y + 3); c.moveTo(x, y); c.lineTo(x - 2.2, y + 2.2); c.moveTo(x, y); c.lineTo(x + 2.2, y + 2.2); c.stroke();
};

/** The M60, in its own frame: the rear grip at the origin, pointing +x (the muzzle at 56, 0). */
const m60 = (c: Ctx, flash: boolean, f: number) => {
  // (the stock, the receiver, the feed cover, the barrel and its jacket, the folded bipod, the carry handle)
  fill(c, '#27272A', () => { c.moveTo(-18, -4); c.lineTo(-2, -5); c.lineTo(-2, 3); c.lineTo(-18, 6); c.closePath(); }, 1.2);
  rect(c, -17, -3, 14, 2, '#52525B');
  fill(c, '#18181B', () => c.rect(-2, -7, 26, 10), 1.2);
  rect(c, 0, -6, 22, 2, '#52525B'); rect(c, 2, -9, 14, 3, '#3F3F46');
  fill(c, '#3F3F46', () => c.rect(24, -4, 26, 5), 1);
  for (let k = 0; k < 5; k++) rect(c, 26 + k * 4, -3, 2, 3, '#18181B');
  rect(c, 50, -3, 6, 3, '#18181B');
  c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(34, 2); c.lineTo(46, 4); c.moveTo(36, 2); c.lineTo(48, 2); c.stroke();
  c.strokeStyle = '#52525B'; c.lineWidth = 2; c.beginPath(); c.moveTo(8, -9); c.quadraticCurveTo(13, -14, 18, -9); c.stroke();
  // (the pistol grip, and the ammo belt hanging off the feed in a loop of brass)
  fill(c, '#27272A', () => { c.moveTo(1, 3); c.lineTo(6, 3); c.lineTo(4, 11); c.lineTo(0, 11); c.closePath(); }, 1);
  for (let k = 0; k < 7; k++) {
    const t = k / 6, bx = 6 - t * 10 + Math.sin(f * 0.2 + k) * 0.6, by = 3 + Math.sin(t * Math.PI) * 14;
    rect(c, bx - 1.5, by - 2, 3, 4, '#B45309'); rect(c, bx - 1.5, by - 2, 3, 1.5, '#FDE047');
  }
  if (flash) {
    const k = (f >> 1) % 2;
    c.fillStyle = '#F97316'; c.beginPath(); c.moveTo(56, -1); c.lineTo(70 + k * 6, -8); c.lineTo(66, -1); c.lineTo(72 + k * 4, 6); c.closePath(); c.fill();
    c.fillStyle = '#FDE047'; c.beginPath(); c.arc(58, -1, 5 + k, 0, Math.PI * 2); c.fill();
    rect(c, 56, -2, 4, 3, '#FFFFFF');
  }
};

/** The gun held at `aim` off a pivot (the rear grip), both hands on it; the arms from the shoulders. */
const gunHeld = (c: Ctx, L: RamboLook, S: string[], pv: { x: number; y: number }, aim: number, shBack: [number, number], shFront: [number, number], oneHand = false) => {
  const ca = Math.cos(aim), sa = Math.sin(aim);
  const at = (x: number, y: number) => [pv.x + x * ca - y * sa, pv.y + x * sa + y * ca] as const;
  const [gx, gy] = at(2, 6), [fx, fy] = at(30, 3);
  // (the back arm behind the gun to its grip)
  arm(c, shBack[0], shBack[1], gx, gy, S, 1);
  c.save(); c.translate(pv.x, pv.y); c.rotate(aim); m60(c, !!L.flash, L.f); c.restore();
  if (!oneHand) arm(c, shFront[0], shFront[1], fx, fy, S, 1);
};

const torso = (c: Ctx, S: string[], L: RamboLook) => {
  // (the V: broad up top, narrow at the jeans)
  const path = () => { c.moveTo(-10, -40); c.lineTo(10, -40); c.lineTo(13, -52); c.quadraticCurveTo(21, -64, 18, -72); c.lineTo(-17, -72); c.quadraticCurveTo(-20, -62, -12, -52); c.closePath(); };
  fill(c, S[2], path, 1.6);
  // (the shading: the far side in shade, the lit edge)
  c.save(); c.beginPath(); path(); c.clip();
  rect(c, -20, -74, 7, 36, S[1]); rect(c, 12, -74, 9, 36, S[3]);
  // (the pecs: two slabs, the line under them)
  fill(c, S[3], () => { c.moveTo(-12, -70); c.quadraticCurveTo(-3, -71, 1, -66); c.quadraticCurveTo(-2, -59, -11, -60); c.closePath(); }, 1);
  fill(c, S[3], () => { c.moveTo(2, -66); c.quadraticCurveTo(7, -71, 16, -69); c.quadraticCurveTo(15, -59, 4, -59); c.closePath(); }, 1);
  rect(c, -9, -68, 4, 2, SKIN[3]); rect(c, 5, -68, 4, 2, SKIN[3]);
  // (the abs: three rows of two, the line down the middle)
  for (let r = 0; r < 3; r++) for (const s of [-1, 1]) { fill(c, S[2], () => c.roundRect(s > 0 ? 1.5 : -7.5, -56 + r * 5.2, 6, 4.4, 1.5), 0.9); rect(c, s > 0 ? 2.5 : -6.5, -55.5 + r * 5.2, 3, 1, S[3]); }
  // (gray chest hair)
  c.fillStyle = GRAY[2]; for (let i = 0; i < 14; i++) c.fillRect(-5 + ((i * 7) % 11), -67 + ((i * 5) % 8), 1, 1);
  c.restore();
  // (the bandolier: front shoulder to back hip, brass rounds)
  c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(15, -71); c.lineTo(-10, -42); c.stroke();
  c.strokeStyle = '#78350F'; c.lineWidth = 3.4; c.stroke();
  for (let k = 0; k < 7; k++) { const t = (k + 0.5) / 7, bx = 15 - 25 * t, by = -71 + 29 * t; rect(c, bx - 1, by - 3, 2.4, 4, '#D97706'); rect(c, bx - 1, by - 3, 2.4, 1.4, '#FDE047'); }
  // (the belt over the jeans)
  rect(c, -11, -42, 22, 3, '#3F2A1C'); rect(c, 1, -42, 4, 3, '#CBD5E1');
  void L;
};

const legs = (c: Ctx, L: RamboLook) => {
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
    // (one foot back against the wall, the other hanging)
    a = [-5, -40, -14, -28, -16, -14]; b = [5, -40, 6, -21, 5, -3];
  } else if (pose === 'dead') {
    a = [-5, -40, -10, -21, -13, -2]; b = [5, -40, 11, -21, 14, -2];
  } else {
    a = [-5, -40, -6, -21, -7, -2]; b = [5, -40, 6, -21, 8, -2];
  }
  [a, b].forEach((g, i) => {
    limb(c, g[0], g[1], g[2], g[3], 10, DENIM[i ? 2 : 1], DENIM[3]);
    limb(c, g[2], g[3], g[4], g[5], 9, DENIM[i ? 2 : 1], DENIM[3]);
    // (white socks, brown sandals)
    fill(c, '#F8FAFC', () => c.rect(g[4] - 3.5, g[5] - 2, 7, 4), 1);
    fill(c, '#92400E', () => c.rect(g[4] - 3.5, g[5] + 1.5, 12, 3), 1);
  });
  // (dead: the seat of his jeans split, tie-dye underpants)
  if (L.dead) for (let i = 0; i < 4; i++) rect(c, -9 + i * 3, -42, 3, 5, TIEDYE[i]);
};

/** The concrete on him (her guts): gray slopped over his head and shoulders, running down, setting. */
const concreteCoat = (c: Ctx, k: number, f: number) => {
  if (k <= 0) return;
  const col = ['#57534E', '#78716C', '#A8A29E', '#D6D3D1'];
  c.globalAlpha = Math.min(1, 0.4 + k);
  fill(c, col[2], () => { c.moveTo(-16, -74); c.quadraticCurveTo(-14, -104, 2, -106); c.quadraticCurveTo(18, -104, 19, -74); c.lineTo(14, -60 + k * 6); c.lineTo(8, -70); c.lineTo(2, -56 + k * 8); c.lineTo(-4, -70); c.lineTo(-10, -62 + k * 4); c.closePath(); }, 1.2);
  rect(c, -10, -102, 10, 3, col[3]); rect(c, -14, -86, 3, 8, col[3]);
  for (let i = 0; i < 4; i++) { const dx = -12 + i * 8, len = 6 + ((f * 0.2 + i * 7) % 10) * k; rect(c, dx, -64, 3, len, col[1]); }
  if (k > 0.6) { fill(c, col[2], () => c.ellipse(0, -2, 16, 5, 0, 0, Math.PI * 2), 1); fill(c, col[1], () => c.ellipse(-6, -24, 7, 10, 0, 0, Math.PI * 2), 1); }
  c.globalAlpha = 1;
};

export const drawRambo = (c: Ctx, x: number, y: number, L: RamboLook) => {
  const { pose, f } = L, S = SK(L.green ?? 0), sc = L.scale ?? 1;
  c.save();
  c.translate(Math.round(x), Math.round(y));
  c.scale((L.facing ?? 1) * sc, sc);
  if (L.rot) { c.translate(0, -44); c.rotate(L.rot); c.translate(0, 44); }
  // (firing: the recoil shakes him)
  if (pose === 'fire' && L.flash) c.translate(-1 + (f % 2) * 0.6, (f % 3) * 0.3 - 0.3);
  const bob = pose === 'walk' ? Math.abs(Math.sin(f * 0.16)) * -1.5 : 0;
  c.translate(0, bob);
  legs(c, L);
  // (the upper body: leaning about his hips)
  c.save();
  if (L.lean) { c.translate(0, -42); c.rotate(L.lean); c.translate(0, 42); }
  const shB: [number, number] = [-13, -68], shF: [number, number] = [14, -68];
  const aim = L.aim ?? 0;
  // (the back arm and the gun behind him, where it's slung)
  const slung = pose === 'rant' || pose === 'command' || pose === 'sick' || pose === 'barf' || pose === 'flex' || pose === 'dead';
  if (slung) {
    // (on its sling across his back: the barrel up over his shoulder)
    c.save(); c.translate(-12, -48); c.rotate(-1.15); m60(c, false, f); c.restore();
  }
  // Back arm (behind the torso)
  if (pose === 'flex') arm(c, shB[0], shB[1], -26, -84, S, -1, true, 1.15);
  else if (pose === 'sick' || pose === 'barf') arm(c, shB[0], shB[1], -4, -50, S, 1);
  else if (pose === 'cling') arm(c, shB[0], shB[1], -10, -112, S, -1, true);
  else if (pose === 'rant' || pose === 'command') arm(c, shB[0], shB[1], -16, -44, S, 1);
  else if (pose === 'fall' || pose === 'spin' || pose === 'dead') arm(c, shB[0], shB[1], -28, pose === 'dead' ? -66 : -86, S, -1, false);
  torso(c, S, L);
  tattoo(c, 19, -60);
  head(c, f, true, !!L.talking, 1, -86, { bandana: true, green: L.green });
  // (dead: the bandana slipped down over his eyes)
  if (L.dead) { fill(c, '#B91C1C', () => c.rect(-9, -92, 21, 6), 1); rect(c, -7, -91, 17, 1.5, '#EF4444'); }
  // Front arm and the gun
  if (pose === 'stand' || pose === 'walk' || pose === 'fire' || pose === 'hurt' || pose === 'leap') {
    const a = pose === 'stand' ? 0.45 : pose === 'hurt' ? -0.6 : pose === 'leap' ? -0.25 : aim;
    gunHeld(c, L, S, pivotOf(pose), a, shB, shF);
  } else if (pose === 'cling') {
    // (one-handed, Rambo's way, the gun pointing wherever he's sweeping)
    const pv = pivotOf(pose);
    c.save(); c.translate(pv.x, pv.y); c.rotate(aim); m60(c, !!L.flash, f); c.restore();
    const ca = Math.cos(aim), sa = Math.sin(aim);
    arm(c, shF[0], shF[1], pv.x + 2 * ca - 6 * sa, pv.y + 2 * sa + 6 * ca, S, 1);
  } else if (pose === 'spin') {
    // (on his back, the gun still going straight up out of his hands)
    gunHeld(c, L, S, { x: 6, y: -50 }, 0, shB, shF);
  } else if (pose === 'flex') arm(c, shF[0], shF[1], 26, -86, S, 1, true, 1.15);
  else if (pose === 'rant') { const s = Math.sin(f * 0.5) * 4; arm(c, shF[0], shF[1], 22, -96 + s, S, 1, true); }
  else if (pose === 'command') { const s = Math.sin(f * 0.35) * 5; arm(c, shF[0], shF[1], 30, -78 + s, S, 1, false); }
  else if (pose === 'sick') arm(c, shF[0], shF[1], 10, -50, S, 1);
  else if (pose === 'barf') arm(c, shF[0], shF[1], 18, -44, S, 1);
  else if (pose === 'fall' || pose === 'dead') arm(c, shF[0], shF[1], 28, pose === 'dead' ? -66 : -90, S, 1, false);
  concreteCoat(c, L.concrete ?? 0, f);
  c.restore();
  c.restore();
};
