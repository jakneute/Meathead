// The dino park's robot dinosaurs, drawn properly: animatronics (molded rubber skin in panels over a steel frame), every
// part shaded in a five-step ramp (lit rim upper left, shade lower right, a highlight along the top, an ink line round
// it), the joints bare servos, hydraulic rams down the legs, the eyes lamps (red and glowing hostile, blue friendly),
// and the more they're hurt the more of the machine shows (a scuffed panel, then one torn off: wires and a gear, sparking;
// then the skin off the snout down to the steel skull).
//
// Each is posed from a rig (where its hips, feet, head and jaw are for a pose and a frame of it): idle (breathing), walk,
// run (a bounding cycle, the body dropping at each footfall), the wind-up (squashed down), the attack (stretched out),
// the landing, a recoil when it's hit (a white flash), and dead (slack, eyes out). Each frame of each pose at each state of
// wear is painted once into a stamp (see m1 render/stamp) and put down after that with one drawImage; the eyes' glow,
// sparks, steam and dust go on live over it.
//
// Origin at the feet (the middle of its box's bottom), facing right; the caller flips it.

import type { Enemy } from '../../../../m1/types';
import { stamp, mix, INK, checker, steppedGlow, pixelBlob } from './kit';

type Ctx = CanvasRenderingContext2D;
type Ramp = string[];
type V = [number, number];

// ---------------------------------------------------------------------------------------------------------------
// Palettes (darkest first)

const R_SKIN = ['#18221A', '#2A3C2A', '#425A3E', '#5E7C54', '#88A478'];
const R_STRIPE = ['#121A12', '#1E2C1E', '#2C3E2A', '#3E5638', '#56704C'];
const BELLY = ['#463824', '#6A583A', '#927C56', '#B8A278', '#DACAA0'];
const METAL = ['#16191E', '#323842', '#545C68', '#868E9A', '#C2CAD4'];
const STEEL_DK = ['#0E1014', '#1E2228', '#323840', '#4C545E', '#727A86'];
const TOOTH = ['#7E786C', '#ACA696', '#D6D2C6', '#EEECE4', '#FFFFFF'];
const CLAW = ['#0E0E10', '#24242A', '#3E3E46', '#64646E', '#9A9AA4'];
const T_SKIN = ['#261E16', '#423626', '#625238', '#867252', '#AE9874'];
const FRILL = ['#44180C', '#722E14', '#A04A1C', '#CA7232', '#E89E58'];
const BONE = ['#665A48', '#968870', '#C4B89C', '#E2D8C0', '#F8F2E0'];
const BEAK = ['#121012', '#262226', '#3C363A', '#5C5458', '#867C80'];
const P_SKIN = ['#241A1E', '#423034', '#664A4C', '#8C6C66', '#B49686'];
const P_WING = ['#30181A', '#522C2C', '#7A443E', '#A2665A', '#C8907E'];
const CREST = ['#4A0C0C', '#7A1616', '#AE2A22', '#D44E3A', '#F07A5E'];

const flashOf = (r: Ramp): Ramp => r.map(c => mix(c, '#FFFFFF', 0.72));
const darker = (r: Ramp, k = 0.22): Ramp => r.map(c => mix(c, INK, k));

// ---------------------------------------------------------------------------------------------------------------
// Painting

const trace = (c: Ctx, p: number[], dx = 0, dy = 0) => { c.moveTo(p[0] + dx, p[1] + dy); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i] + dx, p[i + 1] + dy); c.closePath(); };
const bbox = (p: number[]) => { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (let i = 0; i < p.length; i += 2) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); y0 = Math.min(y0, p[i + 1]); y1 = Math.max(y1, p[i + 1]); } return { x0, y0, x1, y1 }; };

/**
 * A shaded part: its color, the belly of it (the lowest `belly` of it) a step down, dithered where they meet; a dark rim
 * down its lower right, a lit rim round its upper left, a highlight right along the top; an ink line round it.
 * `inside` paints detail clipped to it (seams, spots, wear).
 */
export const plate = (c: Ctx, p: number[], r: Ramp, belly = 0.3, inside?: () => void, line = 1.2) => {
  const b = bbox(p);
  c.save(); c.beginPath(); trace(c, p); c.clip();
  c.fillStyle = r[2]; c.fillRect(b.x0 - 2, b.y0 - 2, b.x1 - b.x0 + 4, b.y1 - b.y0 + 4);
  if (belly > 0) { const y = Math.round(b.y1 - (b.y1 - b.y0) * belly); c.fillStyle = r[1]; c.fillRect(b.x0 - 2, y, b.x1 - b.x0 + 4, b.y1 - y + 2); checker(c, Math.floor(b.x0 / 2) * 2 - 2, y - 2, b.x1 - b.x0 + 6, 2, r[1]); }
  inside?.();
  c.beginPath(); trace(c, p); trace(c, p, -1.5, -2.5); c.fillStyle = r[0]; c.fill('evenodd');
  c.beginPath(); trace(c, p); trace(c, p, 1.5, 2.5); c.fillStyle = r[3]; c.fill('evenodd');
  c.beginPath(); trace(c, p); trace(c, p, 0.4, 1); c.fillStyle = r[4]; c.fill('evenodd');
  c.restore();
  c.beginPath(); trace(c, p); c.strokeStyle = INK; c.lineWidth = line; c.lineJoin = 'round'; c.stroke();
};
/** A limb segment from a to b, w0 wide at a, w1 at b, as a plate. */
const seg = (a: V, b: V, w0: number, w1: number) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  return [a[0] + nx * w0 / 2, a[1] + ny * w0 / 2, b[0] + nx * w1 / 2, b[1] + ny * w1 / 2, b[0] - nx * w1 / 2, b[1] - ny * w1 / 2, a[0] - nx * w0 / 2, a[1] - ny * w0 / 2];
};
/** A servo at a joint: a steel disc, its rim lit, a hub bolt. */
export const servo = (c: Ctx, x: number, y: number, r: number, m: Ramp = METAL) => {
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + 1, 0, Math.PI * 2); c.fill();
  c.fillStyle = m[1]; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.fillStyle = m[2]; c.beginPath(); c.arc(x - r * 0.15, y - r * 0.15, r * 0.75, 0, Math.PI * 2); c.fill();
  c.fillStyle = m[3]; c.beginPath(); c.arc(x - r * 0.3, y - r * 0.3, r * 0.35, 0, Math.PI * 2); c.fill();
  c.fillStyle = INK; c.fillRect(x - 1, y - 1, 2, 2); c.fillStyle = m[4]; c.fillRect(x - 1, y - 1, 1, 1);
};
/** A hydraulic ram between two points: the sleeve, the polished rod. */
const ram = (c: Ctx, a: V, b: V, m: Ramp = METAL) => {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
  c.strokeStyle = m[3]; c.lineWidth = 2; c.beginPath(); c.moveTo(mx, my); c.lineTo(b[0], b[1]); c.stroke();
  c.strokeStyle = m[1]; c.lineWidth = 3; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(mx, my); c.stroke();
  c.strokeStyle = m[4]; c.lineWidth = 1; c.beginPath(); c.moveTo(mx, my - 0.5); c.lineTo(b[0], b[1] - 0.5); c.stroke();
  c.lineCap = 'butt';
};
/** A panel seam (a dark groove, its lower lip lit) and its rivets. */
const seam = (c: Ctx, a: V, b: V, r: Ramp, rivets = 0) => {
  c.strokeStyle = r[0]; c.lineWidth = 1; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
  c.strokeStyle = r[3]; c.beginPath(); c.moveTo(a[0] + 0.8, a[1] + 1); c.lineTo(b[0] + 0.8, b[1] + 1); c.stroke();
  for (let i = 1; i <= rivets; i++) { const k = i / (rivets + 1), x = a[0] + (b[0] - a[0]) * k + 2, y = a[1] + (b[1] - a[1]) * k; c.fillStyle = METAL[1]; c.fillRect(x, y, 2, 2); c.fillStyle = METAL[4]; c.fillRect(x, y, 1, 1); }
};
/** Where a panel's torn off: the dark inside, wires looping, a gear. */
const gash = (c: Ctx, x: number, y: number, w: number, h: number) => {
  c.fillStyle = INK; c.beginPath(); c.ellipse(x + w / 2, y + h / 2, w / 2 + 1, h / 2 + 1, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#0A0A0C'; c.beginPath(); c.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); c.fill();
  servo(c, x + w * 0.35, y + h * 0.45, Math.min(w, h) * 0.22, STEEL_DK);
  const W = ['#DC2626', '#2563EB', '#EAB308'];
  W.forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 2 + i * 2, y + 2); c.quadraticCurveTo(x + w * 0.6, y + h + 2 - i, x + w - 2, y + h * 0.3 + i * 2); c.stroke(); });
  // (the torn skin's edge, curled)
  c.strokeStyle = '#000000'; c.lineWidth = 1; c.beginPath(); c.ellipse(x + w / 2, y + h / 2, w / 2 + 1.5, h / 2 + 1.5, 0, 0.2, 2.6); c.stroke();
};
/** A scuffed patch: the skin worn through to the steel, scratches across it. */
const scuff = (c: Ctx, x: number, y: number, w: number, h: number) => {
  c.fillStyle = METAL[2]; c.fillRect(x, y, w, h); c.fillStyle = METAL[3]; c.fillRect(x, y, w, 1);
  c.strokeStyle = METAL[4]; c.lineWidth = 1; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(x + 1 + i * 3, y + h - 1); c.lineTo(x + 4 + i * 3, y + 1); c.stroke(); }
};
const rot = (p: V, a: number): V => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)];
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
/** Two-bone leg: the knee between hip and ankle (bent forward when `fwd` > 0). */
const knee = (hip: V, ank: V, l1: number, l2: number, fwd: number): V => {
  const dx = ank[0] - hip[0], dy = ank[1] - hip[1];
  const d = Math.min(l1 + l2 - 0.01, Math.max(0.01, Math.hypot(dx, dy)));
  const a = Math.atan2(dy, dx), cosB = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), b = Math.acos(Math.max(-1, Math.min(1, cosB)));
  const t = a - fwd * b;
  return [hip[0] + Math.cos(t) * l1, hip[1] + Math.sin(t) * l1];
};

/** An eye lamp (live): its glow, the lens, a hot spot. Off when dead. */
const eyeLamp = (c: Ctx, x: number, y: number, r: number, friendly: boolean, f: number, on = true, flicker = false) => {
  if (!on || (flicker && f % 23 < 3)) { c.fillStyle = '#18181B'; c.fillRect(Math.round(x - r), Math.round(y - r), Math.ceil(r * 2), Math.ceil(r * 2)); return; }
  const col = friendly ? '#60A5FA' : '#FF3B30';
  steppedGlow(c, x, y, r * 3.6, col, 0.32 + (friendly ? 0 : 0.08 * Math.sin(f * 0.3)), 0.02, 3);
  c.fillStyle = INK; c.fillRect(Math.round(x - r - 1), Math.round(y - r - 1), Math.ceil(r * 2 + 2), Math.ceil(r * 2 + 2));
  c.fillStyle = friendly ? '#2563EB' : '#B91C1C'; c.fillRect(Math.round(x - r), Math.round(y - r), Math.ceil(r * 2), Math.ceil(r * 2));
  c.fillStyle = friendly ? '#93C5FD' : '#FF6B5A'; c.fillRect(Math.round(x - r + 1), Math.round(y - r), Math.ceil(r * 2) - 1, Math.ceil(r * 1.2));
  c.fillStyle = '#FFFFFF'; c.fillRect(Math.round(x - r + 1), Math.round(y - r + 0.5), Math.max(1, Math.round(r * 0.8)), Math.max(1, Math.round(r * 0.8)));
};
/** Sparks off a torn panel (live, now and then). */
const sparks = (c: Ctx, x: number, y: number, f: number, seed: number) => {
  const t = (f + seed * 13) % 47;
  if (t > 5) return;
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.5 + seed, d = 2 + t * 2.4; c.fillStyle = i % 2 ? '#FFFFFF' : '#FDE047'; c.fillRect(Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d + t * t * 0.15), 2, 2); }
};

// ---------------------------------------------------------------------------------------------------------------
// What state it's in: pose, frame, wear, the hit flash

export type Mode = { friendly: boolean };
const hurtMemo = new WeakMap<Enemy, { hp: number; t: number }>();
/** Frames since it was last hit (big: not lately). */
const sinceHit = (e: Enemy, f: number) => {
  let m = hurtMemo.get(e);
  if (!m) { m = { hp: e.health, t: -999 }; hurtMemo.set(e, m); }
  if (e.health < m.hp - 0.5) m.t = f;
  m.hp = e.health;
  return f - m.t;
};
/** 0 fine .. 3 wrecked. */
const wearOf = (e: Enemy) => { const k = e.maxHealth > 0 ? e.health / e.maxHealth : 1; return k > 0.75 ? 0 : k > 0.45 ? 1 : k > 0.2 ? 2 : 3; };
const dead = (e: Enemy) => e.health <= 0 || !!e.isBlownAway;

// ---------------------------------------------------------------------------------------------------------------
// The raptor: a lean biped, a stiff tail out behind, the sickle claw up on each foot

interface RaptorRig { hip: V; tilt: number; feet: [V, V]; head: V; headA: number; jaw: number; tail: number; arm: number; dead?: boolean }
const raptorRig = (pose: string, k: number): RaptorRig => {
  const base: RaptorRig = { hip: [-2, -28], tilt: 0, feet: [[5, 0], [-9, 0]], head: [22, -22], headA: 0, jaw: 0, tail: 0, arm: 0 };
  switch (pose) {
    case 'idle': { const b = [0, 0.5, 1, 0.5][k]; return { ...base, hip: [-2, -28 + b], head: [22, -22 + b * 0.5], headA: [0, -0.05, 0, 0.05][k], tail: [0, 1, 2, 1][k] }; }
    case 'walk': case 'run': {
      const run = pose === 'run', p = k / 6, stride = run ? 13 : 8, lift = run ? 9 : 5;
      const foot = (q: number): V => q < 0.5 ? [stride - 2 * stride * (q / 0.5), 0] : [-stride + 2 * stride * ((q - 0.5) / 0.5), -lift * Math.sin(Math.PI * (q - 0.5) / 0.5)];
      const bob = (run ? 2.5 : 1) * Math.cos(4 * Math.PI * p);
      const fa = foot(p), fb = foot((p + 0.5) % 1);
      return { ...base, hip: [-2, -28 + bob], tilt: run ? 0.14 : 0.05, feet: [[fa[0] + 1, fa[1]], [fb[0] - 3, fb[1]]], head: [22, -21 + bob * 0.3], headA: run ? 0.12 : 0.03, tail: -bob * 1.5, jaw: run ? 0.15 : 0, arm: 0.2 };
    }
    case 'crouch': return { ...base, hip: [-4, -20 + k], tilt: 0.1, feet: [[8, 0], [-8, 0]], head: [20, -18], headA: 0.18, jaw: 0.45, tail: -7, arm: 0.4 };
    case 'pounce': return { ...base, hip: [0, -32 - k * 2], tilt: -0.3, feet: [[-14, -2], [-22, -6]], head: [23, -22], headA: -0.25, jaw: 1, tail: 4, arm: 1 };
    case 'recover': return { ...base, hip: [-2, -22 + k * 3], tilt: 0.12 - k * 0.06, feet: [[9, 0], [-9, 0]], head: [21, -20], headA: 0.1, jaw: 0.2 - k * 0.2, tail: -3 };
    case 'hurt': return { ...base, hip: [-4, -27], tilt: -0.22, feet: [[3, 0], [-10, 0]], head: [20, -24], headA: -0.45, jaw: 0.8, tail: 6, arm: 0.6 };
    case 'dead': return { ...base, hip: [-2, -24], tilt: 0.25, feet: [[10, -2], [-8, 0]], head: [21, -20], headA: 0.9, jaw: 1, tail: 5, arm: 0.9, dead: true };
  }
  return base;
};
const raptorPose = (e: Enemy, f: number): [string, number] => {
  if (dead(e)) return ['dead', 0];
  const st = e.aiState;
  if (st === 'crouch') return ['crouch', (f >> 2) % 2];
  if (st === 'pounce') return ['pounce', e.vel.y < 0 ? 0 : 1];
  if (st === 'recover') return ['recover', (e.aiTimer || 0) < 10 ? 0 : 1];
  if (Math.abs(e.vel.y) > 1.5 && st === 'stalk') return ['pounce', e.vel.y < 0 ? 0 : 1];
  const v = Math.abs(e.vel.x);
  if (v > 2.5) return ['run', Math.floor(f / 3) % 6];
  if (v > 0.4) return ['walk', Math.floor(f / 6) % 6];
  return ['idle', Math.floor(f / 12) % 4];
};
/** The point p in its head's space, where it lands. */
const raptorHeadPt = (g: RaptorRig, p: V): V => add(g.hip, rot(add(g.head, rot(p, g.headA)), g.tilt));

const paintRaptor = (c: Ctx, g: RaptorRig, wear: number, fl: boolean) => {
  const S = fl ? flashOf(R_SKIN) : R_SKIN, SF = darker(S, 0.28), B = fl ? flashOf(BELLY) : BELLY, M = fl ? flashOf(METAL) : METAL, ST = fl ? flashOf(R_STRIPE) : R_STRIPE;
  const leg = (foot: V, near: boolean) => {
    const sk = near ? S : SF, hip = add(g.hip, rot([0, 2], g.tilt));
    const ank: V = [foot[0] - 5, foot[1] - 9];
    const kn = knee(hip, ank, 14, 13, -1);
    plate(c, seg(hip, kn, 12, 7), sk, 0.35);
    plate(c, seg(kn, ank, 6, 4), sk, 0.2);
    ram(c, add(hip, [3, 3]), add(kn, [1, 4]), near ? M : darker(M));
    servo(c, kn[0], kn[1], 2.5, near ? M : darker(M));
    // (the foot: the metatarsal down, the toes forward, the sickle claw cocked up)
    plate(c, seg(ank, [foot[0] + 1, foot[1] - 2], 4, 4), sk, 0);
    plate(c, [foot[0] - 2, foot[1] - 4, foot[0] + 9, foot[1] - 3, foot[0] + 12, foot[1], foot[0] - 2, foot[1]], near ? M : darker(M), 0.3);
    plate(c, [foot[0] + 1, foot[1] - 4, foot[0] + 3, foot[1] - 10, foot[0] + 7, foot[1] - 11, foot[0] + 4, foot[1] - 8, foot[0] + 3, foot[1] - 4], CLAW, 0, undefined, 1);
    c.fillStyle = CLAW[4]; c.fillRect(foot[0] + 11, foot[1] - 2, 2, 1);
  };
  leg(g.feet[1], false);
  c.save(); c.translate(g.hip[0], g.hip[1]); c.rotate(g.tilt);
  // The far arm
  const arm = (near: boolean) => {
    const sh: V = [13, -4], el: V = [17 + g.arm * 4, 3 - g.arm * 3], hand: V = [22 + g.arm * 8, 4 - g.arm * 7];
    plate(c, seg(sh, el, 4, 3), near ? S : SF, 0); plate(c, seg(el, hand, 3, 2), near ? S : SF, 0);
    c.strokeStyle = CLAW[3]; c.lineWidth = 1; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(hand[0], hand[1]); c.lineTo(hand[0] + 3, hand[1] + 1 + i * 1.5); c.stroke(); }
  };
  arm(false);
  // The tail: tapering, stiff, banded, panel seams down it
  const tp: number[] = [], bt: number[] = [];
  for (let i = 0; i <= 8; i++) { const t = i / 8, x = -12 - 42 * t, y = -6 + g.tail * t * t - 2 * t, w = 9 * (1 - t) + 1.5; tp.push(x, y - w / 2); bt.unshift(x, y + w / 2); }
  plate(c, [...tp, ...bt], S, 0.4, () => {
    for (let i = 1; i < 6; i++) { const t = i / 7, x = -12 - 42 * t, y = -6 + g.tail * t * t - 2 * t; c.fillStyle = ST[2]; c.fillRect(x - 2, y - 5, 3, 5); seam(c, [x + 2, y - 5], [x + 2, y + 4], S); }
    if (wear >= 2) gash(c, -40, -6 + g.tail * 0.5, 7, 5);
  });
  // The body: the flank in panels, a stripe or two, the belly pale, the hip servo bare
  const body = [-18, -6, -10, -13, 4, -15, 15, -11, 20, -3, 15, 5, -2, 8, -14, 4];
  plate(c, body, S, 0, () => {
    c.fillStyle = B[2]; c.beginPath(); c.moveTo(-14, 3); c.quadraticCurveTo(2, 2, 20, -3); c.lineTo(16, 8); c.lineTo(-14, 8); c.closePath(); c.fill();
    c.fillStyle = B[1]; c.fillRect(-14, 5, 34, 4);
    for (const x of [-10, -4, 2, 8]) { c.fillStyle = ST[2]; c.beginPath(); c.moveTo(x, -13); c.lineTo(x + 3, -13); c.lineTo(x + 1, -4); c.closePath(); c.fill(); }
    seam(c, [-6, -14], [-6, 6], S, 2); seam(c, [9, -13], [10, 3], S, 1);
    if (wear >= 1) scuff(c, 2, -9, 7, 5);
    if (wear >= 2) gash(c, -12, -9, 10, 8);
  });
  servo(c, -1, 1, 4, M);
  // Neck and head (the jaw on a servo; the skull's skin off it, wrecked)
  plate(c, [10, -11, 17, -14, g.head[0] + 2, g.head[1] - 4, g.head[0] + 4, g.head[1] + 4, 16, -1], S, 0.3, () => { seam(c, [14, -12], [g.head[0] - 1, g.head[1] + 3], S); });
  c.save(); c.translate(g.head[0], g.head[1]); c.rotate(g.headA);
  const ja = g.jaw * 0.55;
  c.save(); c.translate(2, 2); c.rotate(ja);
  plate(c, [-1, -1, 19, 0, 19, 3, 1, 4], darker(S, 0.1), 0.3);
  c.fillStyle = TOOTH[3]; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(5 + i * 3, -0.5); c.lineTo(6 + i * 3, -3); c.lineTo(7 + i * 3, -0.5); c.fill(); }
  c.restore();
  if (g.jaw > 0.1) { c.fillStyle = '#5A1414'; c.beginPath(); c.moveTo(2, 2); c.lineTo(21, 1); c.lineTo(2 + Math.cos(ja) * 19, 2 + Math.sin(ja) * 19); c.closePath(); c.fill(); }
  const skull = [-3, -3, 4, -8, 14, -7, 22, -3, 23, 1, 2, 3, -3, 1];
  plate(c, skull, wear >= 3 ? M : S, 0.25, () => {
    c.fillStyle = ST[2]; c.fillRect(2, -7, 9, 2);
    seam(c, [12, -7], [13, 2], wear >= 3 ? M : S, 1);
    // (the eye socket, a ridge over it)
    c.fillStyle = INK; c.fillRect(7, -6, 5, 4); c.fillStyle = S[4]; c.fillRect(6, -8, 7, 1);
    c.fillStyle = INK; c.fillRect(20, -2, 1.5, 1);
  });
  c.fillStyle = TOOTH[3]; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(5 + i * 3, 2); c.lineTo(6 + i * 3, 5); c.lineTo(7 + i * 3, 2); c.fill(); }
  servo(c, 2, 2, 2.5, M);
  c.restore();
  arm(true);
  c.restore();
  leg(g.feet[0], true);
};

export const drawRaptorBot = (c: Ctx, e: Enemy, f: number, mode: Mode) => {
  const [pose0, k0] = raptorPose(e, f), hit = sinceHit(e, f);
  // (friendly: it stands about doing its bit; just hit: it recoils a moment)
  const [pose, k] = !dead(e) && hit < 10 ? ['hurt', 0] : mode.friendly && pose0 === 'idle' ? ['idle', Math.floor(f / 16) % 4] : [pose0, k0];
  const wear = wearOf(e), fl = hit < 4 && !dead(e);
  const g = raptorRig(pose, k);
  stamp(c, `m2rap:${pose}:${k}:${wear}:${fl ? 1 : 0}`, -72, -64, 132, 70, gg => paintRaptor(gg, g, wear, fl));
  const [ex, ey] = raptorHeadPt(g, [9.5, -4]);
  eyeLamp(c, ex, ey, 1.6, mode.friendly, f, !g.dead, wear >= 3);
  if (wear >= 2 && !g.dead) { const [sx, sy] = add(g.hip, rot([-7, -5], g.tilt)); sparks(c, sx, sy, f, e.pos.x % 7); }
  if (g.dead) sparks(c, g.hip[0], g.hip[1] - 6, f, 3);
};

// ---------------------------------------------------------------------------------------------------------------
// The triceratops: a barrel on four pillar legs, the frill, three horns (the two over its eyes long), a beak

interface TrikeRig { body: V; tilt: number; feet: [V, V, V, V]; headA: number; jaw: number; tail: number; dead?: boolean; braced?: boolean }
const trikeRig = (pose: string, k: number): TrikeRig => {
  const base: TrikeRig = { body: [-4, -34], tilt: 0, feet: [[-22, 0], [20, 0], [-28, 0], [14, 0]], headA: 0, jaw: 0, tail: 0 };
  const gait = (p: number, stride: number, lift: number) => {
    const foot = (q: number, x0: number): V => q < 0.5 ? [x0 + stride - 2 * stride * (q / 0.5), 0] : [x0 - stride + 2 * stride * ((q - 0.5) / 0.5), -lift * Math.sin(Math.PI * (q - 0.5) / 0.5)];
    return [foot(p, -22), foot((p + 0.5) % 1, 20), foot((p + 0.5) % 1, -28), foot(p, 14)] as [V, V, V, V];
  };
  switch (pose) {
    case 'idle': { const b = [0, 0.5, 1, 0.5][k]; return { ...base, body: [-4, -34 + b], headA: [0, 0.02, 0.04, 0.02][k], tail: [0, 2, 3, 2][k] }; }
    case 'walk': { const p = k / 6; return { ...base, feet: gait(p, 6, 4), body: [-4, -34 + Math.cos(4 * Math.PI * p)], tail: Math.sin(2 * Math.PI * p) * 3 }; }
    case 'paw': {
      // (the near front foot scraping back, the head going down)
      const sc = [0, -5, -9, -4][k];
      const feet = [...base.feet] as [V, V, V, V];
      feet[1] = [20 + sc, k === 1 || k === 2 ? -3 : 0];
      return { ...base, feet, body: [-4, -33], headA: 0.18 + k * 0.02, tilt: 0.03 };
    }
    case 'charge': { const p = k / 6, bob = 3 * Math.cos(4 * Math.PI * p); return { ...base, feet: gait(p, 13, 9), body: [-2, -32 + bob], tilt: 0.06, headA: 0.32, tail: -bob * 2, jaw: 0.2 }; }
    case 'skid': return { ...base, feet: [[-22, 0], [30, 0], [-28, 0], [24, 0]], body: [-8, -31], tilt: -0.08, headA: 0.25, braced: true, tail: 5 };
    case 'hurt': return { ...base, body: [-6, -35], tilt: -0.1, headA: -0.2, jaw: 0.8, tail: 6 };
    case 'dead': return { ...base, body: [-4, -26], tilt: 0.12, headA: 0.5, jaw: 1, feet: [[-22, 0], [22, -2], [-30, 0], [12, 0]], tail: 4, dead: true };
  }
  return base;
};
const trikePose = (e: Enemy, f: number): [string, number] => {
  if (dead(e)) return ['dead', 0];
  const st = e.aiState;
  if (st === 'paw') return ['paw', Math.floor(f / 6) % 4];
  if (st === 'charge') return ['charge', Math.floor(f / 3) % 6];
  if (st === 'skid' && Math.abs(e.vel.x) > 0.6) return ['skid', 0];
  if (Math.abs(e.vel.x) > 0.4) return ['walk', Math.floor(f / 6) % 6];
  return ['idle', Math.floor(f / 14) % 4];
};
/** The head's pivot (in the body's space) and a point in the head's space, where it lands. */
const T_NECK: V = [30, -2];
const trikeHeadPt = (g: TrikeRig, p: V): V => add(g.body, rot(add(T_NECK, rot(p, g.headA)), g.tilt));

const paintTrike = (c: Ctx, g: TrikeRig, wear: number, fl: boolean) => {
  const S = fl ? flashOf(T_SKIN) : T_SKIN, SF = darker(S, 0.28), M = fl ? flashOf(METAL) : METAL, FR = fl ? flashOf(FRILL) : FRILL, BN = fl ? flashOf(BONE) : BONE, BK = fl ? flashOf(BEAK) : BEAK;
  const shoulder = (i: number): V => add(g.body, rot([[-22, 8], [20, 8], [-28, 6], [14, 6]][i] as V, g.tilt));
  const leg = (i: number) => {
    const near = i < 2, sk = near ? S : SF, top = shoulder(i), foot = g.feet[i];
    const kn: V = [(top[0] + foot[0]) / 2 + (i % 2 ? -2 : 2), (top[1] + foot[1]) / 2];
    plate(c, seg(top, kn, 16, 12), sk, 0.3, () => { if (near && wear >= 1) scuff(c, top[0] - 4, top[1] + 2, 6, 5); });
    plate(c, seg(kn, [foot[0], foot[1] - 4], 11, 12), sk, 0.25);
    servo(c, kn[0], kn[1], 3, near ? M : darker(M));
    // (the foot: a round pad, three blunt toenails)
    plate(c, [foot[0] - 8, foot[1] - 6, foot[0] + 8, foot[1] - 6, foot[0] + 9, foot[1], foot[0] - 8, foot[1]], near ? darker(S, 0.1) : darker(SF, 0.1), 0.3);
    for (let t = 0; t < 3; t++) { c.fillStyle = BN[3]; c.fillRect(foot[0] - 5 + t * 5, foot[1] - 3, 3, 3); c.fillStyle = BN[1]; c.fillRect(foot[0] - 5 + t * 5, foot[1] - 1, 3, 1); }
  };
  leg(2); leg(3);
  c.save(); c.translate(g.body[0], g.body[1]); c.rotate(g.tilt);
  // Tail
  plate(c, [-36, -8, -58, -2 + g.tail, -60, 2 + g.tail, -36, 10], S, 0.4, () => seam(c, [-46, -6], [-46, 6], S));
  // The barrel: armored back plates (scutes), panel seams, a service hatch with its number
  const body = [-42, -2, -36, -16, -18, -22, 10, -22, 28, -14, 36, -2, 32, 12, -38, 12];
  plate(c, body, S, 0.28, () => {
    for (let x = -32; x < 28; x += 10) { c.fillStyle = S[1]; c.fillRect(x, -21 + Math.abs(x) * 0.08, 8, 4); c.fillStyle = S[4]; c.fillRect(x, -21 + Math.abs(x) * 0.08, 6, 1); }
    seam(c, [-22, -20], [-24, 11], S, 3); seam(c, [-2, -22], [-2, 11], S, 3); seam(c, [18, -19], [20, 11], S, 2);
    // (the hatch, and its stencil)
    c.fillStyle = S[1]; c.fillRect(-16, -8, 12, 10); c.fillStyle = S[3]; c.fillRect(-16, -8, 12, 1); c.fillStyle = M[3]; c.fillRect(-6, -4, 2, 2);
    c.fillStyle = '#E8DCC0'; c.font = '4px "Press Start 2P"'; c.fillText('T-3', -15, 0);
    if (wear >= 1) scuff(c, 6, -12, 8, 6);
    if (wear >= 2) gash(c, -34, -6, 12, 10);
    if (wear >= 3) gash(c, 8, -2, 12, 9);
  });
  c.restore();
  leg(0); leg(1);
  // The head: the frill behind (rimmed with spikes, bolted, its eye-spots), the skull, the beak, the horns
  c.save(); c.translate(g.body[0], g.body[1]); c.rotate(g.tilt); c.translate(T_NECK[0], T_NECK[1]); c.rotate(g.headA);
  const frill = [-2, 6, -6, -14, 0, -26, 10, -30, 16, -24, 14, 0, 8, 10];
  plate(c, frill, FR, 0.2, () => {
    for (const [x, y] of [[2, -18], [8, -22]]) { c.fillStyle = FR[0]; c.beginPath(); c.arc(x, y, 3, 0, Math.PI * 2); c.fill(); c.fillStyle = FR[4]; c.fillRect(x - 1, y - 1, 2, 2); }
    for (let i = 0; i < 5; i++) { c.fillStyle = M[2]; c.fillRect(-3 + i * 3, -10 + i * 3, 2, 2); }
  });
  for (let i = 0; i < 6; i++) { const a = -2.3 + i * 0.32, x = 6 + Math.cos(a) * 19, y = -10 + Math.sin(a) * 19; plate(c, [x - 2, y + 1, x + Math.cos(a) * 5, y + Math.sin(a) * 5, x + 2, y - 1], BN, 0, undefined, 0.8); }
  // (the lower jaw on its servo)
  c.save(); c.translate(12, 8); c.rotate(g.jaw * 0.4);
  plate(c, [0, -2, 18, 0, 22, 4, 2, 6], darker(S, 0.1), 0.3);
  c.restore();
  const skull = [6, -8, 18, -10, 28, -4, 34, 2, 30, 8, 10, 10, 4, 2];
  plate(c, skull, wear >= 3 ? M : S, 0.3, () => { seam(c, [20, -9], [20, 9], wear >= 3 ? M : S, 1); c.fillStyle = INK; c.fillRect(16, -4, 6, 4); c.fillStyle = S[4]; c.fillRect(15, -6, 8, 1); });
  plate(c, [28, -4, 38, 2, 34, 8, 28, 7], BK, 0.3);
  // (the horns: the nose one short, the brow pair long, swept forward, bone in steps)
  plate(c, [28, -3, 33, -10, 34, -3], BN, 0.2, undefined, 1);
  plate(c, [15, -8, 36, -24, 38, -22, 20, -5], BN, 0.35, undefined, 1);
  plate(c, [9, -8, 26, -27, 28, -25, 14, -5], darker(BN, 0.2), 0.35, undefined, 1);
  servo(c, 12, 8, 3, M);
  c.restore();
};

export const drawTrikeBot = (c: Ctx, e: Enemy, f: number, mode: Mode) => {
  const [pose0, k0] = trikePose(e, f), hit = sinceHit(e, f);
  const [pose, k] = !dead(e) && hit < 10 ? ['hurt', 0] : [pose0, k0];
  const wear = wearOf(e), fl = hit < 4 && !dead(e);
  const g = trikeRig(pose, k);
  stamp(c, `m2tri:${pose}:${k}:${wear}:${fl ? 1 : 0}`, -70, -76, 150, 82, gg => paintTrike(gg, g, wear, fl));
  const [ex, ey] = trikeHeadPt(g, [19, -2]);
  eyeLamp(c, ex, ey, 1.8, mode.friendly, f, !g.dead, wear >= 3);
  // (steam snorted out pawing; dust kicked up charging)
  if (pose === 'paw' && (f % 24) < 12) { const [nx, ny] = trikeHeadPt(g, [36, 4]), u = (f % 24) / 12; pixelBlob(c, nx + u * 8, ny + 2 - u * 4, 3 + u * 4, 2 + u * 3, `rgba(236, 236, 240, ${(0.7 * (1 - u)).toFixed(2)})`); }
  if (pose === 'charge') for (let i = 0; i < 3; i++) { const u = ((f + i * 5) % 15) / 15; pixelBlob(c, -30 - u * 30 - i * 8, -4 - u * 8, 4 + u * 6, 3 + u * 4, `rgba(150, 120, 90, ${(0.55 * (1 - u)).toFixed(2)})`); }
  if (pose === 'skid') for (let i = 0; i < 2; i++) pixelBlob(c, 30 + i * 6, -3, 6, 3, 'rgba(150, 120, 90, 0.5)');
  if (wear >= 2 && !g.dead) { const [sx, sy] = add(g.body, rot([-28, -6], g.tilt)); sparks(c, sx, sy, f, e.pos.x % 5); }
  if (g.dead) sparks(c, g.body[0], g.body[1], f, 1);
};

// ---------------------------------------------------------------------------------------------------------------
// The pterodactyl: a leathery membrane on a steel finger, a long beak, the crest

interface PteroRig { tilt: number; flap: number; fold: number; jaw: number; legs: number; dead?: boolean }
const pteroRig = (pose: string, k: number): PteroRig => {
  switch (pose) {
    case 'fly': return { tilt: 0, flap: Math.cos((k / 6) * Math.PI * 2), fold: 0, jaw: 0, legs: 0 };
    case 'climb': return { tilt: -0.25, flap: Math.cos((k / 6) * Math.PI * 2), fold: 0, jaw: 0, legs: 0.3 };
    case 'dive': return { tilt: 0.45, flap: -0.3, fold: 1, jaw: 1, legs: 1 };
    case 'hurt': return { tilt: -0.3, flap: 0.9, fold: 0.3, jaw: 0.8, legs: 0.5 };
    case 'dead': return { tilt: 0.9, flap: 0.6, fold: 0.6, jaw: 1, legs: 1, dead: true };
  }
  return { tilt: 0, flap: 0, fold: 0, jaw: 0, legs: 0 };
};
const pteroPose = (e: Enemy, f: number): [string, number] => {
  if (dead(e)) return ['dead', 0];
  if (e.aiState === 'dive') return ['dive', 0];
  if (e.aiState === 'climb') return ['climb', Math.floor(f / 2) % 6];
  return ['fly', Math.floor(f / 4) % 6];
};
const P_BODY: V = [0, -16];
const PS = 1.3;
const pteroPt = (g: PteroRig, p: V): V => add(P_BODY, rot([p[0] * PS, p[1] * PS], g.tilt));

const paintPtero = (c: Ctx, g: PteroRig, wear: number, fl: boolean) => {
  const S = fl ? flashOf(P_SKIN) : P_SKIN, W = fl ? flashOf(P_WING) : P_WING, M = fl ? flashOf(METAL) : METAL, CR = fl ? flashOf(CREST) : CREST, BK = fl ? flashOf(BEAK) : BEAK;
  c.save(); c.translate(P_BODY[0], P_BODY[1]); c.rotate(g.tilt); c.scale(PS, PS);
  // A wing: the arm up to the wrist, the long finger out to the tip, the membrane back to the hip; folded, swept back
  const wing = (near: boolean) => {
    const w = near ? W : darker(W, 0.3), m = near ? M : darker(M, 0.3), s = near ? 1 : 0.8;
    const sh: V = [4, -3];
    const up = g.flap * s, sweep = g.fold;
    const wr: V = [sh[0] - 6 - sweep * 6, sh[1] - 16 * up - 2 + sweep * 4];
    const tip: V = [wr[0] - (24 - 8 * Math.abs(up)) * (1 - sweep * 0.3) - sweep * 8, wr[1] - 22 * up * (1 - sweep * 0.6) + 4 + sweep * 6];
    const dx = tip[0] - sh[0], dy = tip[1] - sh[1], dl = Math.hypot(dx, dy) || 1;
    let nx = dy / dl, ny = -dx / dl;
    if (nx > 0 || (Math.abs(nx) < 0.05 && ny < 0)) { nx = -nx; ny = -ny; }
    const Wd = 15 * s * (1 - sweep * 0.5), at = (k: number, w: number) => [sh[0] + dx * k + nx * w, sh[1] + dy * k + ny * w];
    const mem = [sh[0], sh[1], wr[0], wr[1], tip[0], tip[1], ...at(0.92, 4), ...at(0.65, Wd), ...at(0.35, Wd * 0.95), -10, 4];
    plate(c, mem, w, 0.3, () => {
      for (let i = 1; i < 4; i++) { const k = i / 4; c.strokeStyle = w[1]; c.lineWidth = 1; c.beginPath(); c.moveTo(wr[0] + (tip[0] - wr[0]) * k, wr[1] + (tip[1] - wr[1]) * k); c.lineTo(-8 + i * 3, 3 + g.flap * 2); c.stroke(); }
      if (near && wear >= 2) { c.fillStyle = '#0A0A0C'; c.beginPath(); c.ellipse((wr[0] + tip[0]) / 2 + 4, (wr[1] + tip[1]) / 2 + 4, 4, 3, 0, 0, Math.PI * 2); c.fill(); }
    });
    // (the steel arm and finger along the leading edge, a servo at the wrist)
    c.lineCap = 'round';
    c.strokeStyle = INK; c.lineWidth = 3.4; c.beginPath(); c.moveTo(sh[0], sh[1]); c.lineTo(wr[0], wr[1]); c.lineTo(tip[0], tip[1]); c.stroke();
    c.strokeStyle = m[2]; c.lineWidth = 1.8; c.beginPath(); c.moveTo(sh[0], sh[1]); c.lineTo(wr[0], wr[1]); c.lineTo(tip[0], tip[1]); c.stroke();
    c.strokeStyle = m[4]; c.lineWidth = 0.8; c.beginPath(); c.moveTo(sh[0], sh[1] - 0.6); c.lineTo(wr[0], wr[1] - 0.6); c.stroke();
    c.lineCap = 'butt';
    servo(c, wr[0], wr[1], 2.2, m);
    // (the little clawed fingers at the wrist)
    c.strokeStyle = CLAW[3]; c.lineWidth = 1; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(wr[0], wr[1]); c.lineTo(wr[0] + 3, wr[1] + 2 + i); c.stroke(); }
  };
  wing(false);
  // Legs dangling (tucked up, or reaching, diving)
  for (const dx of [-6, -2]) { const ly = 5 + g.legs * 4; plate(c, seg([dx, 3], [dx - 2 + g.legs * 4, ly], 3, 2), darker(S, 0.15), 0); c.strokeStyle = CLAW[3]; c.lineWidth = 1; c.beginPath(); c.moveTo(dx - 2 + g.legs * 4, ly); c.lineTo(dx + g.legs * 4, ly + 3); c.stroke(); }
  // The body: a short torpedo, a seam, a vent
  plate(c, [-14, 0, -8, -5, 6, -6, 13, -3, 12, 3, 0, 6, -12, 4], wear >= 3 ? M : S, 0.35, () => {
    seam(c, [-2, -6], [-2, 5], S, 1);
    for (let i = 0; i < 3; i++) { c.fillStyle = S[0]; c.fillRect(-10 + i * 3, -2, 2, 3); }
    if (wear >= 1) scuff(c, 3, -4, 5, 4);
  });
  // Neck, head: the crest swept back, the long beak (open diving), the eye
  plate(c, [10, -4, 15, -7, 19, -6, 15, 0], S, 0.3);
  c.save(); c.translate(18, -6);
  plate(c, [-2, -2, -14, -10, -10, -11, 2, -5], CR, 0.3, () => seam(c, [-9, -9], [-4, -6], CR));
  c.save(); c.translate(3, 1); c.rotate(g.jaw * 0.35);
  plate(c, [0, 0, 20, 1, 0, 3], BK, 0.2, undefined, 1);
  c.restore();
  plate(c, [-3, -3, 4, -4, 24, -1, 22, 0, 3, 2, -3, 1], BK, 0.3, () => seam(c, [6, -4], [6, 1], BK));
  plate(c, [-3, -4, 5, -5, 6, 1, -2, 2], wear >= 2 ? M : S, 0.3, () => { c.fillStyle = INK; c.fillRect(0, -3, 3, 3); });
  servo(c, 2, 1, 1.6, M);
  c.restore();
  wing(true);
  c.restore();
};

export const drawPteroBot = (c: Ctx, e: Enemy, f: number, mode: Mode) => {
  const [pose0, k0] = pteroPose(e, f), hit = sinceHit(e, f);
  const [pose, k] = !dead(e) && hit < 10 ? ['hurt', 0] : [pose0, k0];
  const wear = wearOf(e), fl = hit < 4 && !dead(e);
  const g = pteroRig(pose, k);
  stamp(c, `m2pte:${pose}:${k}:${wear}:${fl ? 1 : 0}`, -66, -72, 124, 90, gg => paintPtero(gg, g, wear, fl));
  const [ex, ey] = pteroPt(g, [19.5, -7.5]);
  eyeLamp(c, ex, ey, 1.3, mode.friendly, f, !g.dead, wear >= 3);
  if (wear >= 2 && !g.dead) { const [sx, sy] = pteroPt(g, [-6, 0]); sparks(c, sx, sy, f, e.pos.x % 3); }
};
