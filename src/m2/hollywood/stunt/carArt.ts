// The posse's stunt cars, drawn (the final pass: peak SNES). A boxy 80s muscle car extruded in fake 3D off its footprint
// on the floor (the stage's depth: arena.ts's ZK), so it turns in place (the yaw) for a drift. Every face in its own
// step of the paint's ramp by how square it is to the light (lit from the upper left), lit along its top edge and
// shaded down its foot; chrome bumpers, a grille and square headlights on the nose, taillights across the back, a body
// line and a black rocker down the sides, a door roundel with its number, twin white racing stripes over the hood, roof
// and trunk; the glass banded with the sky in it and a glint, the roll cage through it, the stunt driver's helmet. The
// roof (he can stand on it) lit along its edges in the warm lip every ledge in the land has. Under it, the chassis: the
// exhaust's pipe glowing at its tip; off the ground, its belly showing (the headers glowing hot, sparks off it): the
// side that comes down on him reads as the side that hurts. RED cars drive the floor and drift; BLUE cars jump the
// ramps through the hoops: the two stay as far apart as red and blue go.

import { ZK, GY } from './arena';
import { signText } from '../../signLetters';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

/** Its size: length, width, ground clearance, the body's top, the cabin's roof (px). */
export const CAR = { L: 150, W: 66, CLEAR: 8, BODY: 30, CAB: 50 };
/** The cabin's stretch along it (from the back, to the front: shares of half the length). */
const CAB_A0 = -0.62, CAB_A1 = 0.3, CAB_B = 0.42;

export const PAINT = {
  red: { body: '#DC2626', lit: '#F87171', dark: '#991B1B', deep: '#7F1D1D', stripe: '#FFFFFF' },
  blue: { body: '#2563EB', lit: '#60A5FA', dark: '#1E40AF', deep: '#1E3A8A', stripe: '#FFFFFF' },
} as const;
export type CarColor = keyof typeof PAINT;
/** Each paint's ramp, darkest first (deep, dark, shade, body, lit, highlight). */
const RAMP: Record<CarColor, string[]> = {
  red: ['#3A0606', '#7F1D1D', '#A81E1E', '#DC2626', '#F25A52', '#FCA5A0'],
  blue: ['#0B1236', '#1E3A8A', '#1E46B8', '#2563EB', '#5A8CF6', '#A8C8FC'],
};
const NUMBER: Record<CarColor, string> = { red: '7', blue: '3' };
const STEELR = ['#1A1C22', '#3A3E48', '#5E6470', '#8A92A0', '#BCC4D0', '#F2F6FA'];
const CHAR_R = ['#0A0807', '#141110', '#1E1A18', '#2A2522', '#38312C', '#4A413A'];
const LIPR = ['#5A4630', '#A08058', '#F2D79A', '#FFF6D8'];

export interface CarPose {
  color: CarColor;
  /** Its middle on the floor (x), the bottom of its wheels (y: the floor, or up in the air), its depth. */
  x: number; y: number; z: number;
  /** Which way its nose points (radians in the floor's plane: 0 +x, PI -x, PI/2 toward the camera). */
  yaw: number;
  /** Its nose up or down (in the air), screen radians. */
  pitch?: number;
  /** How far it's been smashed in at the front (0..1), frozen in ice (0..1), how burnt (0..1). */
  crumple?: number; ice?: number; burnt?: number;
  /** The driver in it. */
  driver?: boolean;
  /** The wheels' turn (for the hubs). */
  wheel?: number;
}

/** Its reach along the floor and in depth (half-extents), turned the way it is. */
export const extents = (yaw: number) => {
  const c = Math.abs(Math.cos(yaw)), s = Math.abs(Math.sin(yaw));
  return { hx: c * CAR.L / 2 + s * CAR.W / 2, hz: s * CAR.L / 2 + c * CAR.W / 2 };
};
/** ...and the cabin's (the roof he can stand on). */
export const roofExtent = (yaw: number) => {
  const c = Math.abs(Math.cos(yaw)), s = Math.abs(Math.sin(yaw));
  const half = ((CAB_A1 - CAB_A0) / 2) * (CAR.L / 2), mid = ((CAB_A1 + CAB_A0) / 2) * (CAR.L / 2);
  return { hx: c * half + s * CAR.W * CAB_B, mid: Math.cos(yaw) * mid };
};

const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixed = (a: string, b: string, k: number) => {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
};

/** The shadow under it, on the floor (wherever it is over it): stepped, a dark core in a lighter ring. */
export const drawCarShadow = (c: Ctx, x: number, floorY: number, z: number, yaw: number, height: number) => {
  const { hx, hz } = extents(yaw), k = Math.max(0.25, 1 - height / 400);
  const rx = hx * (0.8 + 0.2 * k), ry = Math.max(4, hz * ZK * k + 3), X = Math.round(x), Y = Math.round(floorY + z * ZK);
  c.fillStyle = `rgba(10, 6, 8, ${(0.22 * k).toFixed(2)})`;
  c.beginPath(); c.ellipse(X, Y, rx + 4, ry + 2, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = `rgba(10, 6, 8, ${(0.3 * k).toFixed(2)})`;
  c.beginPath(); c.ellipse(X, Y, rx * 0.86, ry * 0.8, 0, 0, Math.PI * 2); c.fill();
};

export const drawCar = (c: Ctx, car: CarPose) => {
  const burnt = car.burnt ?? 0;
  const R = burnt > 0 ? RAMP[car.color].map((col, i) => mixed(col, CHAR_R[Math.min(5, i)], Math.min(0.9, burnt * 0.85))) : RAMP[car.color];
  const S = burnt > 0 ? STEELR.map((col, i) => mixed(col, CHAR_R[i], burnt * 0.7)) : STEELR;
  const stripe = burnt > 0 ? mixed('#F8FAFC', '#2A2522', burnt * 0.85) : '#F8FAFC';
  const cy = Math.cos(car.yaw), sy = Math.sin(car.yaw);
  const crumple = car.crumple ?? 0;
  const front = (CAR.L / 2) * (1 - crumple * 0.3), back = -CAR.L / 2;
  const ox = car.x, oy = car.y + car.z * ZK;
  /** Off the ground (its belly shows: we're under it). */
  const air = Math.max(0, Math.min(1, (GY - 30 - car.y) / 90));
  // (a point on it: a along it, b across it, h up; to the screen, about its own middle)
  const pt = (a: number, b: number, h: number): [number, number] => [a * cy - b * sy, (a * sy + b * cy) * ZK - h];
  const quad = (pts: [number, number][], fill: string, ink = true) => {
    c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath();
    c.fillStyle = fill; c.fill();
    if (ink) { c.strokeStyle = INK; c.lineWidth = 1.5; c.stroke(); }
  };
  /** The ramp's step for a face this square to us (stepped, never smooth). */
  const step = (nz: number, lit: boolean) => (nz > 0.72 ? (lit ? 4 : 3) : nz > 0.4 ? (lit ? 3 : 2) : (lit ? 2 : 1));
  c.save();
  c.translate(Math.round(ox), Math.round(oy));
  if (car.pitch) { c.translate(0, -CAR.BODY / 2); c.rotate(car.pitch); c.translate(0, CAR.BODY / 2); }
  /** A box's faces toward us and its top, in steps (the lit band along each face's top, the shade along its foot). */
  const box3 = (a0: number, a1: number, b: number, h0: number, h1: number, top: string, glass = false) => {
    const faces: { nz: number; kind: 'front' | 'back' | 'side'; a: [number, number]; bb: [number, number] }[] = [
      { nz: sy, kind: 'front', a: [a1, a1], bb: [-b, b] },
      { nz: -sy, kind: 'back', a: [a0, a0], bb: [-b, b] },
      { nz: cy, kind: 'side', a: [a0, a1], bb: [b, b] },
      { nz: -cy, kind: 'side', a: [a0, a1], bb: [-b, -b] },
    ];
    for (const fc of faces) {
      if (fc.nz <= 0.02) continue;
      const P = (h: number): [number, number][] => [pt(fc.a[0], fc.bb[0], h), pt(fc.a[1], fc.bb[1], h)];
      const [p0, p1] = P(h0), [p2, p3] = P(h1);
      // (lit from the upper left: a face turned toward -x (the car's back going right, a side facing left) is lit)
      const faceX = fc.kind === 'front' ? cy : fc.kind === 'back' ? -cy : fc.bb[0] > 0 ? -sy : sy;
      const lit = faceX < 0.2;
      if (glass) {
        const G = ['#0C2A44', '#14466A', '#2A6E98', '#5A9EC4', '#A6D4EA'];
        quad([p0, p1, p3, p2], G[fc.nz > 0.6 ? 2 : 1]);
        // (the sky in it: a band across its top, a glint)
        const [q0, q1] = P(h1 - (h1 - h0) * 0.38);
        quad([q0, q1, p3, p2], G[fc.nz > 0.6 ? 3 : 2], false);
        const lerp = (p: [number, number], q: [number, number], u: number): [number, number] => [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u];
        const gb = lerp(p0, p1, 0.22), gt = lerp(p2, p3, 0.36);
        c.strokeStyle = G[4]; c.lineWidth = 2; c.beginPath(); c.moveTo(...gb); c.lineTo(...gt); c.stroke();
        c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(...p0); c.lineTo(...p1); c.lineTo(...p3); c.lineTo(...p2); c.closePath(); c.stroke();
      } else {
        const k = step(fc.nz, lit);
        quad([p0, p1, p3, p2], R[k]);
        // (the lit band along its top, the shade along its foot)
        const [t0, t1] = P(h1 - 3);
        quad([t0, t1, p3, p2], R[Math.min(5, k + 1)], false);
        const [f0, f1] = P(h0 + 4);
        quad([p0, p1, f1, f0], R[Math.max(0, k - 1)], false);
      }
    }
    quad([pt(a0, -b, h1), pt(a1, -b, h1), pt(a1, b, h1), pt(a0, b, h1)], top);
    return faces;
  };

  // The chassis under it: the floor pan's shadow, the exhaust down the near side, its tip glowing
  const nb = cy >= 0 ? 1 : -1;
  quad([pt(back + 10, nb * CAR.W * 0.36, 2), pt(front - 10, nb * CAR.W * 0.36, 2), pt(front - 10, nb * CAR.W * 0.36, CAR.CLEAR + 1), pt(back + 10, nb * CAR.W * 0.36, CAR.CLEAR + 1)], CHAR_R[1], false);
  {
    const [ex0, ey0] = pt(back - 4, nb * CAR.W * 0.28, 5), [ex1, ey1] = pt(front * 0.3, nb * CAR.W * 0.28, 5);
    c.lineCap = 'butt';
    c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(ex0, ey0); c.lineTo(ex1, ey1); c.stroke();
    c.strokeStyle = S[2]; c.lineWidth = 2; c.beginPath(); c.moveTo(ex0, ey0); c.lineTo(ex1, ey1); c.stroke();
    c.fillStyle = (car.wheel ?? 0) % 0.6 < 0.3 ? '#F97316' : '#DC2626'; c.fillRect(Math.round(ex0 - 2), Math.round(ey0 - 2), 4, 3);
  }

  // The wheels (the ones on the near side), under it: the tire, the chrome rim, the spokes turning
  const wheels = (near: boolean) => {
    for (const a of [-0.62, 0.6]) for (const b of [-1, 1]) {
      const isNear = !(b * cy < -0.02 && Math.abs(sy) < 0.9);
      if (isNear !== near) continue;
      const [wx, wy] = pt(a * (CAR.L / 2), b * (CAR.W / 2), 8);
      const sx = Math.max(0.3, Math.abs(cy));
      c.fillStyle = INK; c.beginPath(); c.ellipse(wx, wy, 10 * sx + 1.5, 11.5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#26262C'; c.beginPath(); c.ellipse(wx, wy, 9.5 * sx, 10, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#3A3A42'; c.beginPath(); c.ellipse(wx - sx, wy - 2, 8 * sx, 7, 0, Math.PI, Math.PI * 1.6); c.fill();
      if (sx > 0.45) {
        c.fillStyle = S[3]; c.beginPath(); c.ellipse(wx, wy, 5.5 * sx, 6, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = S[4]; c.beginPath(); c.ellipse(wx - sx, wy - 1, 3.5 * sx, 4, 0, 0, Math.PI * 2); c.fill();
        // (the spokes, turning)
        const w0 = car.wheel ?? 0;
        for (let k = 0; k < 5; k++) { const ang = w0 + (k * Math.PI * 2) / 5; c.fillStyle = S[1]; c.fillRect(Math.round(wx + Math.cos(ang) * 4 * sx - 1), Math.round(wy + Math.sin(ang) * 4.5 - 1), 2, 2); }
        c.fillStyle = S[5]; c.fillRect(Math.round(wx - 1), Math.round(wy - 1), 2, 2);
      }
    }
  };
  wheels(false); wheels(true);

  // The body (hood to trunk): stepped faces, the racing stripes, the body line, the lights, the bumpers
  const bodyFaces = box3(back, front, CAR.W / 2, CAR.CLEAR, CAR.BODY, R[4]);
  // (the top's lit edge toward us, its far edge dark)
  {
    const [a0, a1] = [pt(back, nb * CAR.W / 2, CAR.BODY), pt(front, nb * CAR.W / 2, CAR.BODY)];
    c.strokeStyle = R[5]; c.lineWidth = 1; c.beginPath(); c.moveTo(a0[0], a0[1] - 1); c.lineTo(a1[0], a1[1] - 1); c.stroke();
  }
  // (twin stripes over the hood and trunk)
  for (const sb of [-7, 3]) quad([pt(back, sb, CAR.BODY + 0.5), pt(front, sb, CAR.BODY + 0.5), pt(front, sb + 4, CAR.BODY + 0.5), pt(back, sb + 4, CAR.BODY + 0.5)], stripe, false);
  for (const fc of bodyFaces) {
    if (fc.nz <= 0.02) continue;
    if (fc.kind === 'front') {
      // (the grille: dark, its chrome bars; the square headlights, the amber signals; the chrome bumper under it)
      const g = [pt(front, -CAR.W * 0.3, 14), pt(front, CAR.W * 0.3, 14), pt(front, CAR.W * 0.3, 23), pt(front, -CAR.W * 0.3, 23)];
      quad(g, '#141418', false);
      for (const hh of [16, 19, 22]) { const [g0, g1] = [pt(front, -CAR.W * 0.28, hh), pt(front, CAR.W * 0.28, hh)]; c.strokeStyle = S[3]; c.lineWidth = 1; c.beginPath(); c.moveTo(...g0); c.lineTo(...g1); c.stroke(); }
      for (const b of [-0.7, 0.7]) {
        const [lx, ly] = pt(front, b * CAR.W / 2, 20);
        c.fillStyle = INK; c.fillRect(Math.round(lx - 5), Math.round(ly - 4), 10, 8);
        c.fillStyle = burnt > 0.5 ? '#3A3430' : '#FEF3C7'; c.fillRect(Math.round(lx - 4), Math.round(ly - 3), 8, 6);
        c.fillStyle = burnt > 0.5 ? '#2A2522' : '#FFFFFF'; c.fillRect(Math.round(lx - 3), Math.round(ly - 2), 3, 2);
        const [ax, ay] = pt(front, b * CAR.W * 0.48, 14);
        c.fillStyle = burnt > 0.5 ? '#2A2522' : '#F59E0B'; c.fillRect(Math.round(ax - 2), Math.round(ay - 1), 4, 3);
      }
      quad([pt(front + 2, -CAR.W / 2, 9), pt(front + 2, CAR.W / 2, 9), pt(front + 2, CAR.W / 2, 13), pt(front + 2, -CAR.W / 2, 13)], S[3]);
      const [b0, b1] = [pt(front + 2, -CAR.W / 2, 12), pt(front + 2, CAR.W / 2, 12)];
      c.strokeStyle = S[5]; c.lineWidth = 1; c.beginPath(); c.moveTo(...b0); c.lineTo(...b1); c.stroke();
    }
    if (fc.kind === 'back') {
      // (the taillights right across, lit in steps; the chrome bumper)
      const t = [pt(back, -CAR.W * 0.44, 18), pt(back, CAR.W * 0.44, 18), pt(back, CAR.W * 0.44, 23), pt(back, -CAR.W * 0.44, 23)];
      quad(t, burnt > 0.5 ? '#2A1A18' : '#991B1B');
      for (const b of [-0.6, 0.6]) { const [lx, ly] = pt(back, b * CAR.W / 2, 21); c.fillStyle = burnt > 0.5 ? '#2A2522' : '#F87171'; c.fillRect(Math.round(lx - 4), Math.round(ly - 2), 8, 2); }
      quad([pt(back - 2, -CAR.W / 2, 9), pt(back - 2, CAR.W / 2, 9), pt(back - 2, CAR.W / 2, 13), pt(back - 2, -CAR.W / 2, 13)], S[3]);
    }
    if (fc.kind === 'side') {
      const b = fc.bb[0];
      // (the black rocker along its foot, the body line along it, the stripe)
      quad([pt(back + 6, b, CAR.CLEAR), pt(front - 6, b, CAR.CLEAR), pt(front - 6, b, CAR.CLEAR + 4), pt(back + 6, b, CAR.CLEAR + 4)], '#18181C', false);
      const [l0, l1] = [pt(back, b, 21), pt(front, b, 21)];
      c.strokeStyle = R[5]; c.lineWidth = 1; c.beginPath(); c.moveTo(...l0); c.lineTo(...l1); c.stroke();
      quad([pt(back, b, 15), pt(front, b, 15), pt(front, b, 18), pt(back, b, 18)], stripe, false);
      // (the door roundel, its number, when it's side on enough to read)
      if (Math.abs(cy) > 0.55) {
        const [rx, ry] = pt(-CAR.L * 0.08, b, 22);
        const w = 9 * Math.abs(cy);
        c.fillStyle = INK; c.beginPath(); c.ellipse(rx, ry, w + 1, 7, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = stripe; c.beginPath(); c.ellipse(rx, ry, w, 6, 0, 0, Math.PI * 2); c.fill();
        if (Math.abs(cy) > 0.8) signText(c, NUMBER[car.color], Math.round(rx), Math.round(ry + 4), { sx: 1, sy: 1, fill: R[1] });
      }
    }
  }
  // The cabin: glass all round (the sky in it), the roll cage through it, the roof on it (lit round its edges: he can
  // stand on it)
  const ca0 = CAB_A0 * CAR.L / 2, ca1 = Math.min(front - 10, CAB_A1 * CAR.L / 2), cb = CAR.W * CAB_B;
  // (the roll cage and the driver, behind the glass: drawn first, the glass's frame over them)
  box3(ca0, ca1, cb, CAR.BODY, CAR.CAB, R[4], true);
  {
    const [k0, k1] = [pt(ca0 + 6, nb * cb * 0.9, CAR.BODY + 2), pt(ca0 + 6, nb * cb * 0.9, CAR.CAB - 2)], [k2] = [pt(ca1 - 6, nb * cb * 0.9, CAR.CAB - 2)];
    c.strokeStyle = '#2A2E36'; c.lineWidth = 2; c.beginPath(); c.moveTo(...k0); c.lineTo(...k1); c.lineTo(...k2); c.stroke();
  }
  if (car.driver !== false) {
    const [hx, hy] = pt(ca1 * 0.35, cy >= 0 ? cb * 0.4 : -cb * 0.4, CAR.BODY + 11);
    c.fillStyle = INK; c.beginPath(); c.arc(hx, hy, 6, 0, Math.PI * 2); c.fill();
    c.fillStyle = burnt > 0.5 ? '#3A3430' : '#E8ECF0'; c.beginPath(); c.arc(hx, hy, 5, 0, Math.PI * 2); c.fill();
    c.fillStyle = burnt > 0.5 ? '#4A413A' : '#FFFFFF'; c.fillRect(Math.round(hx - 3), Math.round(hy - 4), 3, 2);
    // (his helmet's stripe in the car's color, the visor)
    c.fillStyle = R[3]; c.fillRect(Math.round(hx - 1), Math.round(hy - 5), 2, 10);
    c.fillStyle = '#18181B'; c.fillRect(Math.round(hx + (cy >= 0 ? 0 : -5)), Math.round(hy - 1), 5, 3);
  }
  // (the roof: the lip round its edges, brightest along the near one)
  const r0 = pt(ca0, -cb, CAR.CAB), r1 = pt(ca1, -cb, CAR.CAB), r2 = pt(ca1, cb, CAR.CAB), r3 = pt(ca0, cb, CAR.CAB);
  for (const sb of [-7, 3]) quad([pt(ca0, sb, CAR.CAB + 0.5), pt(ca1, sb, CAR.CAB + 0.5), pt(ca1, sb + 4, CAR.CAB + 0.5), pt(ca0, sb + 4, CAR.CAB + 0.5)], stripe, false);
  c.lineJoin = 'miter';
  c.strokeStyle = LIPR[1]; c.lineWidth = 3; c.beginPath(); c.moveTo(...r0); c.lineTo(...r1); c.lineTo(...r2); c.lineTo(...r3); c.closePath(); c.stroke();
  c.strokeStyle = LIPR[2]; c.lineWidth = 1.5; c.stroke();
  const [n0, n1] = nb > 0 ? [r3, r2] : [r0, r1];
  c.strokeStyle = LIPR[3]; c.lineWidth = 1; c.beginPath(); c.moveTo(n0[0], n0[1] - 1); c.lineTo(n1[0], n1[1] - 1); c.stroke();

  // Off the ground: its belly (we're under it): the floor pan, the driveshaft, the headers and the exhaust glowing hot,
  // the oil pan; sparks and drips off it. The side that comes down on him.
  if (air > 0.05) {
    const dk = CAR.W * ZK * 0.75 * air;
    const n = nb * CAR.W / 2, fa = -nb * CAR.W / 2;
    const pA = pt(back + 4, n, CAR.CLEAR), pB = pt(front - 4, n, CAR.CLEAR);
    const pC: [number, number] = [pt(front - 4, fa, CAR.CLEAR)[0], pB[1] + dk], pD: [number, number] = [pt(back + 4, fa, CAR.CLEAR)[0], pA[1] + dk];
    quad([pA, pB, pC, pD], '#24242A');
    // (bands down it, the far half darker)
    quad([[pA[0], pA[1] + dk * 0.55], [pB[0], pB[1] + dk * 0.55], pC, pD], '#18181C', false);
    // (the driveshaft down the middle; the headers glowing hot at the front, the pipe back to the muffler)
    const mid = (u: number, v: number): [number, number] => [pA[0] + (pB[0] - pA[0]) * u, pA[1] + (pB[1] - pA[1]) * u + dk * v];
    const pulse = 0.5 + 0.5 * Math.sin((car.wheel ?? 0) * 3);
    c.lineCap = 'butt';
    c.strokeStyle = '#4A4E58'; c.lineWidth = 3; c.beginPath(); c.moveTo(...mid(0.12, 0.5)); c.lineTo(...mid(0.7, 0.5)); c.stroke();
    for (const v of [0.25, 0.75]) {
      c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(...mid(0.05, v)); c.lineTo(...mid(0.8, v)); c.stroke();
      c.strokeStyle = '#7A3A1A'; c.lineWidth = 2; c.beginPath(); c.moveTo(...mid(0.05, v)); c.lineTo(...mid(0.55, v)); c.stroke();
      c.strokeStyle = pulse > 0.5 ? '#F97316' : '#DC2626'; c.lineWidth = 2; c.beginPath(); c.moveTo(...mid(0.62, v)); c.lineTo(...mid(0.8, v)); c.stroke();
      const [hx, hy] = mid(0.72, v); c.fillStyle = '#FDE047'; c.fillRect(Math.round(hx - 1), Math.round(hy - 1), 3, 2);
    }
    const [ox2, oy2] = mid(0.68, 0.5); c.fillStyle = INK; c.fillRect(Math.round(ox2 - 7), Math.round(oy2 - 4), 14, 8); c.fillStyle = '#3A3E48'; c.fillRect(Math.round(ox2 - 6), Math.round(oy2 - 3), 12, 6); c.fillStyle = '#5E6470'; c.fillRect(Math.round(ox2 - 6), Math.round(oy2 - 3), 12, 1);
    // (sparks and drips off it)
    const t = car.wheel ?? 0;
    for (let k = 0; k < 4; k++) {
      const u = 0.2 + k * 0.2, ph = ((t * 7 + k * 1.7) % 1 + 1) % 1, [sx2, sy2] = mid(u, 0.9);
      c.fillStyle = k % 2 ? '#FDE047' : '#F97316'; c.fillRect(Math.round(sx2 + (k - 1.5) * 2 * ph), Math.round(sy2 + 3 + ph * 14), 2, 2);
    }
    // (its wheels, hanging under it)
    wheels(true);
  }

  // Crumpled: the nose stoved in (jagged, dark, the radiator's guts), steam off it
  if (crumple > 0) {
    const [fx, fy] = pt(front, 0, 18);
    c.fillStyle = INK; c.fillRect(Math.round(fx - 10), Math.round(fy - 8), 20, 16);
    c.fillStyle = '#3F3F46'; c.fillRect(Math.round(fx - 9), Math.round(fy - 7), 18, 14);
    c.fillStyle = R[1]; for (let k = 0; k < 4; k++) c.fillRect(Math.round(fx - 9 + k * 5), Math.round(fy - 7 + (k % 2) * 6), 4, 3);
    c.fillStyle = S[4]; c.fillRect(Math.round(fx - 6), Math.round(fy - 1), 10, 1);
    const tt = (car.wheel ?? 0) * 10;
    for (let k = 0; k < 3; k++) { const u = ((tt * 0.2 + k * 0.33) % 1 + 1) % 1, r = 3 + u * 6; c.fillStyle = `rgba(226, 232, 240, ${(0.45 * (1 - u)).toFixed(2)})`; c.fillRect(Math.round(fx - r + u * 8), Math.round(fy - 10 - u * 30), Math.round(r * 2), Math.round(r)); }
  }
  // Burnt: soot streaks up from the wheel wells, the paint blistered
  if (burnt > 0.3) {
    for (let k = 0; k < 6; k++) { const [bx, by] = pt(back + (k + 0.5) * (front - back) / 6, nb * CAR.W / 2, 12 + (k % 3) * 5); c.fillStyle = 'rgba(12, 10, 8, 0.55)'; c.fillRect(Math.round(bx - 3), Math.round(by - 6), 6, 8); }
  }
  // Frozen solid in a block of ice: stepped, its top lit, its facets, frost up its foot
  if (car.ice) {
    const { hx } = extents(car.yaw), k = car.ice;
    const L = -hx - 8, T = -CAR.CAB - 14, W = hx * 2 + 16, Hh = CAR.CAB + 20;
    c.fillStyle = `rgba(132, 174, 204, ${(0.45 * k).toFixed(2)})`; c.fillRect(L, T, W, Hh);
    c.fillStyle = `rgba(212, 234, 246, ${(0.35 * k).toFixed(2)})`; c.fillRect(L, T, W, 8); c.fillRect(L, T, 6, Hh);
    c.fillStyle = `rgba(58, 90, 120, ${(0.35 * k).toFixed(2)})`; c.fillRect(L + W - 6, T, 6, Hh); c.fillRect(L, T + Hh - 6, W, 6);
    c.strokeStyle = `rgba(244, 251, 255, ${(0.9 * k).toFixed(2)})`; c.lineWidth = 1;
    c.beginPath(); c.moveTo(L + W * 0.3, T); c.lineTo(L + W * 0.42, T + Hh * 0.6); c.lineTo(L + W * 0.36, T + Hh); c.moveTo(L + W * 0.72, T); c.lineTo(L + W * 0.64, T + Hh * 0.45); c.stroke();
    c.strokeStyle = `rgba(8, 40, 64, ${(0.8 * k).toFixed(2)})`; c.lineWidth = 2; c.strokeRect(L, T, W, Hh);
    c.fillStyle = '#FFFFFF'; c.fillRect(L + 4, T + 4, 10, 2); c.fillRect(L + W - 18, T + 10, 2, 8); c.fillRect(L + 8, T + 8, 2, 2);
  }
  c.restore();
};

void mixed;
