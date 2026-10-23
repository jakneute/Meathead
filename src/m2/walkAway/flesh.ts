// Meathead's limbs for the walk-away's big figure (meathead.ts from the front, meatheadBack.ts from behind): each arm and
// leg one continuous mass, not sticks and joints. A limb is a chain of round sections (a center and a radius each:
// the deltoid's cap, the biceps' belly, the elbow, the forearm's swell, the wrist) plus a few muscle bellies off to the
// sides; its silhouette is the union of the tapered capsules between them (one path), so the joints blend with no seams
// and the ink goes round the whole limb once. Shaded in SNES steps that follow the forms: the same sections shifted
// toward the light (the upper left) and shrunk, each a step lighter, clipped to the silhouette: a reflected-light rim
// down the shadow side, the core shadow, the midtone, the highlight on each bulge.
//
// Cost: ink + clip + four fills (rim, shadow, mid, highlight): six paths of ~8 capsules per limb, a few 1px strokes for
// the veins. No offscreen layers, no pixel work.

import { type Ctx, INK, box, poly } from './kit';
import { joint2, halfBone, type P2 } from '../art/limb';

const TAU = Math.PI * 2;
/** A round section: center x, y and radius. */
export type Node = [number, number, number];
/** A limb: the chain down it (capsules between each pair), muscle bellies off it, where its highlights peak. */
export interface Mass { chain: Node[]; blobs: Node[]; peaks: Node[] }

/** The capsule round two circles (their outer tangents), as a subpath; always wound the same way, so the union fills. */
const capsule = (c: Ctx, x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) => {
  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy);
  if (d <= Math.abs(r1 - r2) + 0.01) {
    const [x, y, r] = r1 >= r2 ? [x1, y1, r1] : [x2, y2, r2];
    c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU); return;
  }
  const th = Math.atan2(dy, dx), a = Math.acos((r1 - r2) / d);
  c.moveTo(x1 + Math.cos(th + a) * r1, y1 + Math.sin(th + a) * r1);
  c.arc(x1, y1, r1, th + a, th + TAU - a);
  c.arc(x2, y2, r2, th - a, th + a);
  c.closePath();
};

/** The limb's outline as the current path: shifted (ox, oy), its radii scaled by k and grown by `add`. */
const outline = (c: Ctx, m: Mass, ox: number, oy: number, k: number, add: number) => {
  c.beginPath();
  const ch = m.chain;
  for (let i = 0; i + 1 < ch.length; i++) {
    const a = ch[i], b = ch[i + 1];
    capsule(c, a[0] + ox, a[1] + oy, Math.max(0.5, a[2] * k + add), b[0] + ox, b[1] + oy, Math.max(0.5, b[2] * k + add));
  }
  for (const [x, y, r] of m.blobs) { const rr = Math.max(0.5, r * k + add); c.moveTo(x + ox + rr, y + oy); c.arc(x + ox, y + oy, rr, 0, TAU); }
};

/** Toward the light (the screen's upper left), a unit vector. */
const LX = -0.8, LY = -0.6;

/**
 * The limb, inked and shaded. `r`: its ramp (darkest first, five steps); `rim`: the light from behind on its shadow
 * edge (else a reflected half-step); `region`: only this much of it (a path; for redrawing a forearm over something);
 * `inside`: details drawn clipped to it (veins, the lines between muscles).
 */
export const flesh = (c: Ctx, m: Mass, r: string[], rim?: string, region?: (c: Ctx) => void, inside?: (c: Ctx) => void) => {
  c.save();
  if (region) { c.beginPath(); region(c); c.clip(); }
  outline(c, m, 0, 0, 1, 1); c.fillStyle = INK; c.fill();
  outline(c, m, 0, 0, 1, 0); c.clip();
  c.fillStyle = rim ?? r[2]; c.fill();
  const band = (s: number, k: number, col: string) => { outline(c, m, LX * s, LY * s, k, 0); c.fillStyle = col; c.fill(); };
  band(1.4, 1, r[1]);
  band(3.6, 0.88, r[2]);
  band(5.6, 0.55, r[3]);
  for (const [x, y, rr] of m.peaks) box(c, x + LX * rr * 0.62 - 1, y + LY * rr * 0.62, 2, 1, r[4]);
  inside?.(c);
  c.restore();
};

const lerp2 = (a: P2, b: P2, k: number): P2 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const nd = (p: P2, r: number): Node => [p[0], p[1], r];

/** An arm: shoulder, elbow, wrist, fist; the forearm's way (unit, elbow to fist); the flexor side's normal (unit, off
 * the upper arm toward the biceps); the mass. */
export interface Arm { side: number; S: P2; E: P2; W: P2; F: P2; dir: P2; flex: P2; mass: Mass }

/**
 * An arm from the shoulder joint `S` to the fist `F` (`side` +1: on the screen's right). The elbow is limb.ts's (bones
 * from the reach: a front-on arm is foreshortened), bent the way `hint` (the pose's elbow) says; straight-ish, out.
 */
export const armOf = (S: P2, F: P2, hint: P2, side: number): Arm => {
  const [sx, sy] = S, [fx, fy] = F;
  const bone = halfBone(sx, sy, fx, fy, 24, 1.01);
  const p = joint2(sx, sy, fx, fy, bone, bone, 1), q = joint2(sx, sy, fx, fy, bone, bone, -1);
  const cr = ([x, y]: P2) => (fx - sx) * (y - sy) - (fy - sy) * (x - sx);
  const d = Math.hypot(fx - sx, fy - sy) || 1, ch = cr(hint);
  const E = Math.abs(ch) / d < 1.5 ? ((p[0] - q[0]) * side >= 0 ? p : q) : Math.sign(cr(p)) === Math.sign(ch) ? p : q;
  let ux = fx - E[0], uy = fy - E[1]; const fl = Math.hypot(ux, uy) || 1; ux /= fl; uy /= fl;
  const W: P2 = [fx - ux * 6, fy - uy * 6];
  const ax = E[0] - sx, ay = E[1] - sy, al = Math.hypot(ax, ay) || 1;
  let nx = -ay / al, ny = ax / al;
  const toward = (fx - sx) * nx + (fy - sy) * ny;
  if (Math.abs(toward) < 3 ? nx * -side < 0 : toward < 0) { nx = -nx; ny = -ny; }
  const off = (pt: P2, k: number): P2 => [pt[0] + nx * k, pt[1] + ny * k];
  const D: Node = [sx - side, sy - 3, 12.5];
  const bicep = nd(off(lerp2(S, E, 0.5), 2.6), 8.6), tricep = nd(off(lerp2(S, E, 0.36), -2.6), 8.6);
  const swell = nd(off(lerp2(E, W, 0.28), -1.2), 8.6);
  return {
    side, S, E, W, F, dir: [ux, uy], flex: [nx, ny],
    mass: {
      chain: [D, nd(lerp2(S, E, 0.42), 10.4), nd(lerp2(S, E, 0.82), 8), nd(E, 7.2), swell, nd(lerp2(E, W, 0.66), 7), nd(W, 5.8)],
      blobs: [bicep, tricep],
      peaks: [D, bicep, swell],
    },
  };
};

/** The forearm's region (for drawing it again over something): round it and a bit, elbow to fist. */
export const foreRegion = (a: Arm) => (c: Ctx) => capsule(c, a.E[0], a.E[1], 11, a.F[0], a.F[1], 9);

/** A raised vein: a dark line, its lit edge beside it toward the light. */
const vein = (c: Ctx, pts: P2[], r: string[]) => {
  for (const [dx, dy, col] of [[0, 0, r[1]], [-1, -1, r[3]]] as const) {
    c.strokeStyle = col; c.lineWidth = 1; c.beginPath();
    pts.forEach(([x, y], i) => (i ? c.lineTo(x + dx, y + dy) : c.moveTo(x + dx, y + dy))); c.stroke();
  }
};

/** The upper arm's lines: the deltoid's edge; from the front a vein down the biceps, from behind the triceps' horseshoe. */
export const upperLines = (a: Arm, r: string[], back: boolean) => (c: Ctx) => {
  const [nx, ny] = a.flex, D = a.mass.chain[0];
  const th = Math.atan2(a.E[1] - D[1], a.E[0] - D[0]);
  c.strokeStyle = r[1]; c.lineWidth = 1;
  c.beginPath(); c.arc(D[0], D[1], D[2] - 1.5, th - 0.8, th + 0.8); c.stroke();
  const at = (k: number, o: number): P2 => { const p = lerp2(a.S, a.E, k); return [p[0] + nx * o, p[1] + ny * o]; };
  if (!back) vein(c, [at(0.32, 4.5), at(0.48, 6), at(0.6, 4.5), at(0.72, 5)], r);
  else {
    // (the triceps' horseshoe: the tendon's flat, a U down the back of the arm)
    const m = at(0.62, 0);
    c.strokeStyle = r[1]; c.beginPath(); const p1 = at(0.38, 5), p2 = at(0.38, -5);
    c.moveTo(p1[0], p1[1]); c.quadraticCurveTo(m[0] + (a.E[0] - a.S[0]) * 0.2, m[1] + (a.E[1] - a.S[1]) * 0.2, p2[0], p2[1]); c.stroke();
  }
};

/** The forearm's lines: veins down the inside of it (the outside, from behind: one, and the point of the elbow). */
export const foreLines = (a: Arm, r: string[], back: boolean) => (c: Ctx) => {
  const [nx, ny] = a.flex;
  const at = (k: number, o: number): P2 => { const p = lerp2(a.E, a.W, k); return [p[0] + nx * o, p[1] + ny * o]; };
  if (!back) {
    vein(c, [at(0.12, 3), at(0.35, 4.5), at(0.6, 3), at(0.88, 2.5)], r);
    vein(c, [at(0.3, -1), at(0.55, 0.5), at(0.8, -0.5)], r);
  } else {
    vein(c, [at(0.2, -2), at(0.5, -3), at(0.85, -2)], r);
    box(c, a.E[0] - 2, a.E[1] - 1, 4, 2, r[1]); box(c, a.E[0] - 1, a.E[1] - 1, 2, 1, r[3]);
  }
};

/** The wrist wrap: a band round the wrist, square to the forearm. `B`: its ramp. */
export const wristband = (c: Ctx, a: Arm, B: string[]) => {
  const [ux, uy] = a.dir, nx = -uy, ny = ux;
  const cx = a.W[0] - ux * 1.5, cy = a.W[1] - uy * 1.5, h = 2.6, w = 7.2;
  const q = [[cx - ux * h + nx * w, cy - uy * h + ny * w], [cx + ux * h + nx * w, cy + uy * h + ny * w], [cx + ux * h - nx * w, cy + uy * h - ny * w], [cx - ux * h - nx * w, cy - uy * h - ny * w]];
  poly(c, q, B[2]);
  c.lineWidth = 1;
  c.strokeStyle = B[4]; c.beginPath(); c.moveTo(q[0][0] + ux, q[0][1] + uy); c.lineTo(q[3][0] + ux, q[3][1] + uy); c.stroke();
  c.strokeStyle = B[0]; c.beginPath(); c.moveTo(q[1][0] - ux, q[1][1] - uy); c.lineTo(q[2][0] - ux, q[2][1] - uy); c.stroke();
};

/**
 * A leg from the front or behind, hip (hx, hy) to ankle (ax, ay), `side` +1 on the screen's right: the thigh's sweep,
 * the knee, the calf; in jeans the forms softer (the denim over them).
 */
export const legOf = (hx: number, hy: number, ax: number, ay: number, side: number, bare: boolean): Mass => {
  const H: P2 = [hx, hy + 3], A: P2 = [ax, ay];
  const out = (p: P2, o: number): P2 => [p[0] + side * o, p[1]];
  const thigh = nd(out(lerp2(H, A, 0.3), bare ? 1.2 : 0.6), bare ? 13.2 : 12.8);
  const calf = nd(out(lerp2(H, A, 0.74), bare ? 1.2 : 0.3), bare ? 10.8 : 10.3);
  return {
    chain: [nd(H, 12.5), thigh, nd(lerp2(H, A, 0.56), 10.4), calf, nd(A, 9.8)],
    blobs: bare ? [nd(out(lerp2(H, A, 0.42), -3), 9)] : [],
    peaks: bare ? [thigh, calf] : [thigh],
  };
};
