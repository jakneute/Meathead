// The posse's stunt cars, drawn (crude first pass): a boxy 80s muscle car, extruded in fake 3D off its footprint on
// the floor, so it can turn in place (the yaw) for a drift: the faces toward the camera drawn (the hood and trunk's
// sides, the cabin's glass, the lit roof: standable reads standable), the headlights on its nose, the taillights on
// its back, a white racing stripe down the middle, the stunt driver's helmet through the glass. RED cars drive the
// floor and drift; BLUE cars jump the ramps through the hoops.

import { ZK } from './arena';

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

const mixed = (a: string, b: string, k: number) => {
  const p = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`;
};

/** The shadow under it, on the floor (wherever it is over it). */
export const drawCarShadow = (c: Ctx, x: number, floorY: number, z: number, yaw: number, height: number) => {
  const { hx, hz } = extents(yaw), k = Math.max(0.25, 1 - height / 400);
  c.fillStyle = `rgba(0, 0, 0, ${(0.35 * k).toFixed(2)})`;
  c.beginPath(); c.ellipse(Math.round(x), Math.round(floorY + z * ZK), hx * (0.8 + 0.2 * k), Math.max(4, hz * ZK * k + 3), 0, 0, Math.PI * 2); c.fill();
};

export const drawCar = (c: Ctx, car: CarPose) => {
  const P = PAINT[car.color];
  const cy = Math.cos(car.yaw), sy = Math.sin(car.yaw);
  const crumple = car.crumple ?? 0;
  const front = (CAR.L / 2) * (1 - crumple * 0.3);
  const ox = car.x, oy = car.y + car.z * ZK;
  // (a point on it: a along it, b across it, h up; to the screen, about its own middle)
  const pt = (a: number, b: number, h: number): [number, number] => [a * cy - b * sy, (a * sy + b * cy) * ZK - h];
  const quad = (pts: [number, number][], fill: string) => {
    c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath();
    c.fillStyle = fill; c.fill(); c.strokeStyle = INK; c.lineWidth = 1.5; c.stroke();
  };
  c.save();
  c.translate(Math.round(ox), Math.round(oy));
  if (car.pitch) { c.translate(0, -CAR.BODY / 2); c.rotate(car.pitch); c.translate(0, CAR.BODY / 2); }
  const box3 = (a0: number, a1: number, b: number, h0: number, h1: number, sides: string, top: string, glass = false) => {
    // (its four sides, the ones facing the camera, and its top)
    const faces: { nz: number; pts: [number, number][]; kind: 'front' | 'back' | 'side' }[] = [
      { nz: sy, kind: 'front', pts: [pt(a1, -b, h0), pt(a1, b, h0), pt(a1, b, h1), pt(a1, -b, h1)] },
      { nz: -sy, kind: 'back', pts: [pt(a0, -b, h0), pt(a0, b, h0), pt(a0, b, h1), pt(a0, -b, h1)] },
      { nz: cy, kind: 'side', pts: [pt(a0, b, h0), pt(a1, b, h0), pt(a1, b, h1), pt(a0, b, h1)] },
      { nz: -cy, kind: 'side', pts: [pt(a0, -b, h0), pt(a1, -b, h0), pt(a1, -b, h1), pt(a0, -b, h1)] },
    ];
    for (const fc of faces) {
      if (fc.nz <= 0.02) continue;
      quad(fc.pts, glass ? mixed('#38BDF8', '#0C4A6E', 1 - fc.nz) : mixed(sides, P.deep, 0.6 * (1 - fc.nz)));
    }
    quad([pt(a0, -b, h1), pt(a1, -b, h1), pt(a1, b, h1), pt(a0, b, h1)], top);
    return faces;
  };
  // The wheels (the ones on the near side), under it
  for (const a of [-0.62, 0.6]) for (const b of [-1, 1]) {
    if (b * cy < -0.02 && Math.abs(sy) < 0.9) continue;
    const [wx, wy] = pt(a * (CAR.L / 2), b * (CAR.W / 2), 8);
    c.fillStyle = INK; c.beginPath(); c.ellipse(wx, wy, 10 * Math.max(0.35, Math.abs(cy)) + 1, 11, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#27272A'; c.beginPath(); c.ellipse(wx, wy, 9 * Math.max(0.3, Math.abs(cy)), 9.5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#A1A1AA'; c.fillRect(Math.round(wx - 2), Math.round(wy - 2 + Math.sin(car.wheel ?? 0) * 2), 4, 4);
  }
  // The body (hood to trunk), its stripe, its lights
  const bodyFaces = box3(-CAR.L / 2, front, CAR.W / 2, CAR.CLEAR, CAR.BODY, P.body, P.lit);
  // (the stripe down the top)
  quad([pt(-CAR.L / 2, -5, CAR.BODY + 0.5), pt(front, -5, CAR.BODY + 0.5), pt(front, 5, CAR.BODY + 0.5), pt(-CAR.L / 2, 5, CAR.BODY + 0.5)], P.stripe);
  // (headlights on the nose, taillights on the back, the grille; a stripe along the side)
  for (const fc of bodyFaces) {
    if (fc.nz <= 0.02) continue;
    if (fc.kind === 'front') for (const b of [-0.7, 0.7]) { const [lx, ly] = pt(front, b * CAR.W / 2, 20); c.fillStyle = '#FEF08A'; c.fillRect(Math.round(lx - 4), Math.round(ly - 3), 8, 5); }
    if (fc.kind === 'back') for (const b of [-0.7, 0.7]) { const [lx, ly] = pt(-CAR.L / 2, b * CAR.W / 2, 20); c.fillStyle = '#EF4444'; c.fillRect(Math.round(lx - 4), Math.round(ly - 2), 8, 4); }
    if (fc.kind === 'side') {
      const b = cy > 0 ? CAR.W / 2 : -CAR.W / 2;
      const s0 = pt(-CAR.L / 2, b, 17), s1 = pt(front, b, 17), s2 = pt(front, b, 21), s3 = pt(-CAR.L / 2, b, 21);
      c.beginPath(); c.moveTo(...s0); c.lineTo(...s1); c.lineTo(...s2); c.lineTo(...s3); c.closePath(); c.fillStyle = P.stripe; c.fill();
    }
  }
  // The cabin: glass all round, the roof on it (lit along its edge: he can stand on it)
  const ca0 = CAB_A0 * CAR.L / 2, ca1 = Math.min(front - 10, CAB_A1 * CAR.L / 2), cb = CAR.W * CAB_B;
  box3(ca0, ca1, cb, CAR.BODY, CAR.CAB, P.body, P.body, true);
  const r0 = pt(ca0, -cb, CAR.CAB), r1 = pt(ca1, -cb, CAR.CAB), r2 = pt(ca1, cb, CAR.CAB), r3 = pt(ca0, cb, CAR.CAB);
  c.strokeStyle = P.lit; c.lineWidth = 2; c.beginPath(); c.moveTo(...r0); c.lineTo(...r1); c.lineTo(...r2); c.lineTo(...r3); c.closePath(); c.stroke();
  // (the stunt driver's white helmet, through the glass on the near side)
  if (car.driver !== false) {
    const [hx, hy] = pt(ca1 * 0.35, cy >= 0 ? cb * 0.4 : -cb * 0.4, CAR.BODY + 11);
    c.fillStyle = INK; c.beginPath(); c.arc(hx, hy, 6, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#F8FAFC'; c.beginPath(); c.arc(hx, hy, 5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#18181B'; c.fillRect(Math.round(hx + (cy >= 0 ? 0 : -5)), Math.round(hy - 2), 5, 3);
  }
  // Crumpled: the nose stoved in, steam
  if (crumple > 0) { const [fx, fy] = pt(front, 0, 18); c.fillStyle = '#3F3F46'; c.fillRect(Math.round(fx - 8), Math.round(fy - 6), 16, 12); }
  // Burnt black
  if (car.burnt) { c.fillStyle = `rgba(28, 25, 23, ${(0.75 * car.burnt).toFixed(2)})`; const { hx } = extents(car.yaw); c.fillRect(-hx - 4, -CAR.CAB - 8, hx * 2 + 8, CAR.CAB + 12); }
  // Frozen solid in a block of ice
  if (car.ice) {
    const { hx } = extents(car.yaw), k = car.ice;
    c.fillStyle = `rgba(186, 230, 253, ${(0.55 * k).toFixed(2)})`; c.fillRect(-hx - 8, -CAR.CAB - 14, hx * 2 + 16, CAR.CAB + 20);
    c.strokeStyle = `rgba(240, 249, 255, ${(0.9 * k).toFixed(2)})`; c.lineWidth = 2; c.strokeRect(-hx - 8, -CAR.CAB - 14, hx * 2 + 16, CAR.CAB + 20);
    c.fillStyle = '#FFFFFF'; c.fillRect(-hx, -CAR.CAB - 8, 10, 3); c.fillRect(hx - 22, -CAR.CAB + 4, 3, 10);
  }
  c.restore();
};
