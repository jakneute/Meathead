// The posse's stunt cars, drawn (the final pass: peak SNES, up to the clapperboard's stunt car). A boxy 80s muscle car
// extruded in fake 3D off its footprint on the floor (the stage's depth: arena.ts's ZK), so it turns in place (the yaw)
// for a drift. Every face in its own step of the paint's ramp by how square it is to the light (lit from the upper
// left), lit along its top and shaded down its foot; a chamfered shoulder between the sides and the top catching the
// clear coat's highlight, glints streaked across the hood and down the lit side. The decoration's painted flat onto each
// face in that face's own plane (so it turns with the car): on the sides the black rocker, the side pipe, the yellow
// racing stripe pinstriped in black, the door seams and handle, the fuel cap, the marker lights, the number on a yellow
// roundel, Steve's sponsor decals, the wheel arches' flares (cut through: the wheels turn in them); on the nose the
// grille and its chrome bars, Steve's star badge, quad headlights in chrome bezels, the signals, the chrome bumper; on the
// tail the taillights, a STEVE plate, the bumper, the twin pipes; over the top twin yellow stripes, the hood's seam and
// pins, a shaker scoop, the rear wing on its struts, the whip antenna and its pennant. The greenhouse slopes in to the
// roof: the tinted glass (the sky banded in it, a glint), the roll cage through it, the stunt driver in his yellow
// firesuit and helmet (the car's color down it, the visor down) at the wheel; the roof (he can stand on it) carries its
// number and is lit round its edges in the warm lip every ledge in the land has. Off the ground its belly shows (the
// headers glowing hot): the side that comes down on him reads as the side that hurts. Smashed: the nose stoved in, the
// hood buckled, dents down the side, the windshield cracked, the bumper hanging. Burnt: charred, blistered, the glass
// gone, soot up out of the wheel wells.
//
// The body's painted the once per paint / turn (32 of them round) / damage / belly into a sprite of its own, put down with
// one drawImage (rotated as it is for a pitch, never repainted). Only what moves is live: the wheels (tread, rim and
// spokes turning, the yellow pinstripe on the sidewall), the exhaust's flames, tire smoke, sparks, steam, fire, the ice.
//
// RED cars drive the floor and drift; BLUE cars jump the ramps through the hoops: the two stay as far apart as red and
// blue go.

import { ZK, GY } from './arena';
import { BEND } from '../../intro/art/kit';

type Ctx = CanvasRenderingContext2D;
type P2 = [number, number];
const INK = '#1A0B06';

/** Its size: length, width, ground clearance, the body's top, the cabin's roof (px). */
export const CAR = { L: 150, W: 66, CLEAR: 8, BODY: 30, CAB: 50 };
/** The cabin's roof along it (from the back, to the front: shares of half the length), and across it (of the width). */
const CAB_A0 = -0.62, CAB_A1 = 0.3, CAB_B = 0.42;
/** The greenhouse's foot (it slopes in to the roof from here). */
const GH_A0 = -0.74, GH_A1 = 0.5, GH_B = 0.44;
/** The wheels: their radius, where they are along it (shares of half the length), across it (of half the width). */
const TIRE_R = 10, WHEEL_A = [-0.62, 0.6], WHEEL_B = 0.9, ARCH_R = 12.6;

export const PAINT = {
  red: { body: '#DC2626', lit: '#F87171', dark: '#991B1B', deep: '#7F1D1D', stripe: '#FAD43A' },
  blue: { body: '#2563EB', lit: '#60A5FA', dark: '#1E40AF', deep: '#1E3A8A', stripe: '#FAD43A' },
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
/** Steve's yellow (his branding: the stripes, the decals, the crew's firesuits). */
const YEL = ['#5A3A04', '#8A5E08', '#C08A10', '#EAB516', '#FAD43A', '#FFF08A'];
const CHROME = ['#FFFFFF', '#E2E6EC', '#AEB5BF', '#6B7380', '#2E333B'];

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
  /** Its tires smoking (a drift, a slide: 0..1); sparks off it (scraping); the suspension squashed (a landing: 0..1);
   *  on the gas (the exhaust's flames: 0..1); on fire (0..1); the frame (the live bits' flicker). */
  smoke?: number; sparks?: boolean; squash?: number; throttle?: number; fire?: number; f?: number;
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

/** Where something on the floor at depth z shows along it: in front of the line the floor's bent (fanned out from the
 *  eye: art.ts's bendFloor), so whatever sits on it goes with it. */
export const onFloorX = (x: number, z: number, eyeX: number) => (z > 0 ? eyeX + (x - eyeX) * (1 + z * ZK * BEND) : x);

const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixed = (a: string, b: string, k: number) => {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
};
const lerpP = (p: P2, q: P2, t: number): P2 => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
const h01 = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** A 3x5 pixel font for the decals (only what they say). */
const GLYPH: Record<string, string> = {
  '3': '111001111001111', '7': '111001010010010',
  S: '111100111001111', T: '111010010010010', E: '111100110100111', V: '101101101101010', N: '110101101101101', U: '101101101101111',
};
const pixText = (g: Ctx, s: string, x: number, y: number, cell: number, col: string) => {
  g.fillStyle = col;
  for (let i = 0; i < s.length; i++) {
    const gl = GLYPH[s[i]]; if (!gl) continue;
    for (let k = 0; k < 15; k++) if (gl[k] === '1') g.fillRect(x + i * cell * 4 + (k % 3) * cell, y + Math.floor(k / 3) * cell, cell + 0.05, cell + 0.05);
  }
};
const textW = (s: string, cell: number) => s.length * cell * 4 - cell;

/** The shadow under it, on the floor (wherever it is over it): stepped, a dark core in a lighter ring. */
export const drawCarShadow = (c: Ctx, x: number, floorY: number, z: number, yaw: number, height: number) => {
  const { hx, hz } = extents(yaw), k = Math.max(0.25, 1 - height / 400);
  const rx = hx * (0.8 + 0.2 * k), ry = Math.max(4, hz * ZK * k + 3), X = Math.round(x), Y = Math.round(floorY + z * ZK);
  c.fillStyle = `rgba(10, 6, 8, ${(0.22 * k).toFixed(2)})`;
  c.beginPath(); c.ellipse(X, Y, rx + 4, ry + 2, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = `rgba(10, 6, 8, ${(0.3 * k).toFixed(2)})`;
  c.beginPath(); c.ellipse(X, Y, rx * 0.86, ry * 0.8, 0, 0, Math.PI * 2); c.fill();
};

// ---------------------------------------------------------------------------------------------------------------
// Its geometry, turned

interface Geo { cy: number; sy: number; pt: (a: number, b: number, h: number) => P2 }
const geo = (yaw: number): Geo => {
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  return { cy, sy, pt: (a, b, h) => [a * cy - b * sy, (a * sy + b * cy) * ZK - h] };
};
/** Onto a side (at b): u along it left to right as we see it (a = s u), v down it (h = -v). */
const sideFrame = (g: Ctx, G: Geo, b: number) => { const s = G.cy >= 0 ? 1 : -1, [ox, oy] = G.pt(0, b, 0); g.transform(s * G.cy, s * G.sy * ZK, 0, 1, ox, oy); return s; };
/** Onto an end (at a): u across it left to right as we see it (b = s u), v down it. */
const endFrame = (g: Ctx, G: Geo, a: number) => { const s = -G.sy >= 0 ? 1 : -1, [ox, oy] = G.pt(a, 0, 0); g.transform(-s * G.sy, s * G.cy * ZK, 0, 1, ox, oy); return s; };
/** Onto a level (at h): (a, b) as they are. */
const topFrame = (g: Ctx, G: Geo, h: number) => { const [ox, oy] = G.pt(0, 0, h); g.transform(G.cy, G.sy * ZK, -G.sy, G.cy * ZK, ox, oy); };
/** ...and turned so text on it reads left to right, upright, whichever way the car's pointing. */
const readable = (g: Ctx, G: Geo) => {
  if (Math.abs(G.cy) >= Math.abs(G.sy)) { const s = G.cy >= 0 ? 1 : -1; g.transform(s, 0, 0, s, 0, 0); }
  else { const s = G.sy >= 0 ? 1 : -1; g.transform(0, -s, s, 0, 0, 0); }
};

type Kind = 'front' | 'back' | 'side';
interface Face { kind: Kind; nz: number; lit: boolean; b: number; b0: P2; b1: P2; t0: P2; t1: P2 }
/** A frustum's faces toward us (its foot [a0, a1] x [-b, b] at h0, its top [a0t, a1t] x [-bt, bt] at h1). */
const frustum = (G: Geo, a0: number, a1: number, b: number, h0: number, a0t: number, a1t: number, bt: number, h1: number): Face[] => {
  const { cy, sy, pt } = G, out: Face[] = [];
  const add = (kind: Kind, nz: number, fx: number, side: number, bA: [number, number][], tA: [number, number][]) => {
    if (nz <= 0.02) return;
    out.push({ kind, nz, lit: fx < 0.2, b: side, b0: pt(bA[0][0], bA[0][1], h0), b1: pt(bA[1][0], bA[1][1], h0), t0: pt(tA[0][0], tA[0][1], h1), t1: pt(tA[1][0], tA[1][1], h1) });
  };
  add('front', sy, cy, 0, [[a1, -b], [a1, b]], [[a1t, -bt], [a1t, bt]]);
  add('back', -sy, -cy, 0, [[a0, -b], [a0, b]], [[a0t, -bt], [a0t, bt]]);
  add('side', cy, -sy, 1, [[a0, b], [a1, b]], [[a0t, bt], [a1t, bt]]);
  add('side', -cy, sy, -1, [[a0, -b], [a1, -b]], [[a0t, -bt], [a1t, -bt]]);
  return out;
};

const quad = (g: Ctx, pts: P2[], fill: string, ink = 0) => {
  g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
  g.fillStyle = fill; g.fill();
  if (ink) { g.strokeStyle = INK; g.lineWidth = ink; g.lineJoin = 'round'; g.stroke(); }
};
const seg = (g: Ctx, p: P2, q: P2, col: string, w = 1) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); };
const disc = (g: Ctx, x: number, y: number, r: number, col: string) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, Math.max(0.01, r), 0, Math.PI * 2); g.fill(); };
/** A band across a face, from u0 to u1 of the way up it. */
const band = (g: Ctx, f: Face, u0: number, u1: number, col: string) => quad(g, [lerpP(f.b0, f.t0, u0), lerpP(f.b1, f.t1, u0), lerpP(f.b1, f.t1, u1), lerpP(f.b0, f.t0, u1)], col);
/** A chrome bar (bands: sky, a hard horizon, the ground's dark), outlined: in a face's frame. */
const chromeBar = (g: Ctx, x: number, y: number, w: number, h: number) => {
  g.fillStyle = INK; g.fillRect(x - 0.7, y - 0.7, w + 1.4, h + 1.4);
  g.fillStyle = CHROME[0]; g.fillRect(x, y, w, h * 0.3); g.fillStyle = CHROME[1]; g.fillRect(x, y + h * 0.3, w, h * 0.2);
  g.fillStyle = CHROME[4]; g.fillRect(x, y + h * 0.5, w, h * 0.14); g.fillStyle = CHROME[2]; g.fillRect(x, y + h * 0.64, w, h * 0.36);
  g.fillStyle = CHROME[3]; g.fillRect(x, y + h * 0.86, w, h * 0.14);
};
const star = (g: Ctx, x: number, y: number, r: number, col: string) => {
  g.beginPath();
  for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; if (k) g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  g.closePath(); g.fillStyle = col; g.fill();
};

// ---------------------------------------------------------------------------------------------------------------
// The body, painted the once per look (a sprite)

interface Look { color: CarColor; yaw: number; crumple: number; burnt: number; driver: boolean; air: number }

const paintCar = (g: Ctx, o: Look) => {
  const G = geo(o.yaw), { cy, sy, pt } = G;
  const burnt = o.burnt, crumple = o.crumple;
  const char = (ramp: string[], k: number) => (burnt > 0 ? ramp.map((col, i) => mixed(col, CHAR_R[Math.min(5, i)], Math.min(0.9, burnt * k))) : ramp);
  const R = char(RAMP[o.color], 0.85), S = char(STEELR, 0.7), Y = char(YEL, 0.8);
  const front = (CAR.L / 2) * (1 - crumple * 0.3), back = -CAR.L / 2, hw = CAR.W / 2, H1 = CAR.BODY - 4;
  const nb = cy >= 0 ? 1 : -1;
  const step = (nz: number, lit: boolean) => (nz > 0.72 ? (lit ? 4 : 3) : nz > 0.4 ? (lit ? 3 : 2) : (lit ? 2 : 1));
  const dark = burnt > 0.5;

  // The chassis under it: the floor pan's shadow, the exhaust pipe down the near side
  quad(g, [pt(back + 10, nb * CAR.W * 0.36, 2), pt(front - 10, nb * CAR.W * 0.36, 2), pt(front - 10, nb * CAR.W * 0.36, CAR.CLEAR + 1), pt(back + 10, nb * CAR.W * 0.36, CAR.CLEAR + 1)], CHAR_R[1]);
  {
    const p0 = pt(back - 2, nb * CAR.W * 0.28, 5), p1 = pt(front * 0.3, nb * CAR.W * 0.28, 5);
    g.lineCap = 'butt'; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(...p0); g.lineTo(...p1); g.stroke();
    g.strokeStyle = S[2]; g.lineWidth = 2; g.beginPath(); g.moveTo(...p0); g.lineTo(...p1); g.stroke();
  }

  // The body's lower faces, each decorated in its own plane
  for (const f of frustum(G, back, front, hw, CAR.CLEAR, back, front, hw, H1)) {
    const k = step(f.nz, f.lit);
    quad(g, [f.b0, f.b1, f.t1, f.t0], R[k], 1.5);
    band(g, f, 0.86, 1, R[Math.min(5, k + 1)]);
    band(g, f, 0, 0.16, R[Math.max(0, k - 1)]);
    g.save();
    if (f.kind === 'side') {
      const b = f.b * hw, s = sideFrame(g, G, b);
      const rA = (a0: number, a1: number, h0: number, h1: number, col: string) => { g.fillStyle = col; g.fillRect(Math.min(s * a0, s * a1), -h1, Math.abs(a1 - a0), h1 - h0); };
      const at = (a: number) => s * a;
      // (the rocker; the side pipe (the near side's); the stripe pinstriped; the crease, its shadow under it)
      rA(back + 4, front - 4, CAR.CLEAR, CAR.CLEAR + 3, '#18181C'); rA(back + 4, front - 4, CAR.CLEAR + 3, CAR.CLEAR + 3.6, '#3A3A42');
      rA(back, front, 17.4, 21.6, INK); rA(back, front, 18, 21, Y[4]); rA(back, front, 18, 18.8, Y[2]); rA(back, front, 20.4, 21, Y[5]);
      rA(back, front, 23.6, 24.4, R[5]); rA(back, front, 22.8, 23.6, R[Math.max(0, k - 1)]);
      // (the door: its seams (a lit edge by each), the handle, the contingency decals; the fuel cap; the marker lights)
      for (const a of [12, -30]) { rA(a, a + 1, CAR.CLEAR + 4, H1, R[1]); rA(a + 1, a + 1.6, CAR.CLEAR + 4, H1, R[Math.min(5, k + 1)]); }
      rA(-27.5, -22, 23.6, 25.8, INK); rA(-27, -22.5, 24, 25.4, CHROME[1]); rA(-27, -22.5, 24, 24.5, CHROME[0]);
      rA(-28.6, -18.6, 12.2, 16, INK); rA(-28.2, -24, 12.6, 15.6, '#22C55E'); rA(-23.6, -19, 12.6, 15.6, '#F97316');
      { g.fillStyle = INK; g.beginPath(); g.ellipse(at(-58), -25, 2.6, 2.4, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = CHROME[2]; g.beginPath(); g.ellipse(at(-58), -25, 1.9, 1.7, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = CHROME[0]; g.fillRect(at(-58) - 1, -26.2, 1, 0.8); }
      rA(front - 6, front - 2.5, 13, 15.4, dark ? CHAR_R[3] : '#F59E0B'); rA(back + 2.5, back + 6, 13, 15.4, dark ? CHAR_R[3] : '#DC2626');
      if (f.b === nb) { rA(-22, 14, 8.2, 11.4, INK); rA(-21.5, 13.5, 8.6, 11, CHROME[2]); rA(-21.5, 13.5, 8.6, 9.4, CHROME[0]); rA(-21.5, 13.5, 10.2, 11, CHROME[3]); }
      // (the number on its yellow roundel, on the door)
      { const rx = at(-9), ry = -19.5; disc(g, rx, ry, 7, INK); disc(g, rx, ry, 6.2, Y[4]); disc(g, rx + 0.8, ry + 0.8, 5.2, Y[3]); disc(g, rx - 0.3, ry - 0.3, 5.2, Y[4]); g.fillStyle = Y[5]; g.fillRect(rx - 4, ry - 3.6, 2, 1);
        const n = NUMBER[o.color], cell = 1.7; pixText(g, n, rx - textW(n, cell) / 2, ry - 4.25, cell, INK); }
      // (STEVE on the front fender, black on yellow)
      { const cx = at(22), w = textW('STEVE', 0.9) + 3; g.fillStyle = INK; g.fillRect(cx - w / 2 - 0.6, -16.6, w + 1.2, 6.8); g.fillStyle = Y[4]; g.fillRect(cx - w / 2, -16, w, 5.6); g.fillStyle = Y[5]; g.fillRect(cx - w / 2, -16, w, 0.7); pixText(g, 'STEVE', cx - textW('STEVE', 0.9) / 2, -15.2, 0.9, INK); }
      // (the clear coat's glints down the lit side: two streaks, a hot pixel)
      if (f.lit && !dark) {
        const u = at(-40) + 6;
        g.fillStyle = R[5]; g.beginPath(); g.moveTo(u, -25); g.lineTo(u + 3.4, -25); g.lineTo(u - 4, -12); g.lineTo(u - 7.4, -12); g.closePath(); g.fill();
        g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(u + 5, -25); g.lineTo(u + 6.2, -25); g.lineTo(u - 1.2, -12); g.lineTo(u - 2.4, -12); g.closePath(); g.fill();
        g.fillRect(at(36) - 1, -25.2, 2, 1);
      }
      // (smashed: the front end crushed in folds, dents down it)
      if (crumple > 0.3) {
        g.strokeStyle = R[0]; g.lineWidth = 1.2; g.beginPath(); g.moveTo(at(front - 14), -H1); g.lineTo(at(front - 8), -19); g.lineTo(at(front - 15), -14); g.lineTo(at(front - 7), -9); g.stroke();
        g.strokeStyle = R[5]; g.lineWidth = 0.7; g.beginPath(); g.moveTo(at(front - 13), -H1); g.lineTo(at(front - 7), -19.6); g.lineTo(at(front - 14), -14.6); g.stroke();
        for (const [da, dh, r] of [[-12, 13, 4.4], [30, 20, 3.6], [-44, 22, 3]] as const) {
          g.fillStyle = R[Math.max(0, k - 1)]; g.beginPath(); g.ellipse(at(da), -dh, r, r * 0.6, 0, 0, Math.PI * 2); g.fill();
          g.fillStyle = R[Math.max(0, k - 2)]; g.beginPath(); g.ellipse(at(da) - 0.6, -dh - 0.6, r * 0.6, r * 0.32, 0, 0, Math.PI * 2); g.fill();
          g.strokeStyle = R[5]; g.lineWidth = 0.6; g.beginPath(); g.ellipse(at(da), -dh, r + 0.6, r * 0.6 + 0.6, 0, Math.PI * 0.05, Math.PI * 0.8); g.stroke();
        }
        g.fillStyle = '#9CA3AF'; g.fillRect(at(-48) - 3, -12, 6, 1.6); g.fillRect(at(4) - 4, -11, 8, 1.2);
      }
      // (burnt: blisters, the soot up out of the wheel wells)
      if (burnt > 0.3) {
        for (let i = 0; i < 10; i++) { g.fillStyle = mixed(R[3], '#FFFFFF', 0.25); g.fillRect(at(back + 6 + h01(i * 3.7) * (front - back - 12)), -(CAR.CLEAR + 4 + h01(i * 1.9) * 16), 1.2, 1.2); }
        for (const wa of WHEEL_A) { g.fillStyle = 'rgba(12, 10, 8, 0.6)'; g.beginPath(); g.ellipse(at(wa * CAR.L / 2), -24, 9, 6, 0, 0, Math.PI * 2); g.fill(); g.fillRect(at(wa * CAR.L / 2) - 5, -H1, 10, 6); }
      }
      // (the wheel arches: the flare, its lit lip; cut through so the wheels turn in them)
      for (const wa0 of WHEEL_A) {
        const wa = wa0 * CAR.L / 2;
        if (wa + ARCH_R > front - 1) continue;
        g.lineCap = 'butt';
        g.strokeStyle = INK; g.lineWidth = 3.6; g.beginPath(); g.arc(at(wa), -TIRE_R, ARCH_R + 1.4, Math.PI, Math.PI * 2); g.stroke();
        g.strokeStyle = R[Math.max(0, k - 1)]; g.lineWidth = 2; g.beginPath(); g.arc(at(wa), -TIRE_R, ARCH_R + 1.4, Math.PI, Math.PI * 2); g.stroke();
        g.strokeStyle = R[5]; g.lineWidth = 0.8; g.beginPath(); g.arc(at(wa), -TIRE_R, ARCH_R + 2.6, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
        g.globalCompositeOperation = 'destination-out';
        disc(g, at(wa), -TIRE_R, ARCH_R, '#000000');
        g.globalCompositeOperation = 'source-over';
      }
    } else if (f.kind === 'front') {
      endFrame(g, G, front);
      // (the chin spoiler; the grille, its chrome bars and surround, Steve's star badge)
      g.fillStyle = '#18181C'; g.fillRect(-hw + 2, -CAR.CLEAR - 1.4, CAR.W - 4, 1.6);
      g.fillStyle = INK; g.fillRect(-20.6, -23, 41.2, 10.6); g.fillStyle = CHROME[dark ? 3 : 2]; g.fillRect(-20, -22.4, 40, 9.4);
      g.fillStyle = '#0E0E12'; g.fillRect(-19, -21.4, 38, 7.4);
      for (let u = -17; u <= 17; u += 3) { g.fillStyle = S[3]; g.fillRect(u, -21.4, 1, 7.4); g.fillStyle = S[5]; g.fillRect(u, -21.4, 0.5, 2); }
      disc(g, 0, -17.8, 3.6, INK); star(g, 0, -17.8, 3, Y[4]); g.fillStyle = Y[5]; g.fillRect(-0.6, -19.8, 1, 1);
      // (the quad headlights in their chrome bezels; the amber signals under them)
      for (const u0 of [-1, 1]) {
        for (const du of [-4.6, 4.6]) {
          const u = u0 * 25 + du, smashed = crumple > 0.5 && u0 > 0;
          g.fillStyle = INK; g.fillRect(u - 4.4, -22.6, 8.8, 8); g.fillStyle = CHROME[2]; g.fillRect(u - 3.8, -22, 7.6, 6.8); g.fillStyle = CHROME[0]; g.fillRect(u - 3.8, -22, 7.6, 1);
          g.fillStyle = dark || smashed ? '#2A2522' : '#FEF3C7'; g.fillRect(u - 2.8, -21, 5.6, 4.8);
          if (!dark && !smashed) { g.fillStyle = '#FFFFFF'; g.fillRect(u - 2.4, -20.6, 2.4, 1.6); g.fillStyle = '#F2D79A'; g.fillRect(u - 2.8, -16.8, 5.6, 0.6); }
          if (smashed) { g.strokeStyle = '#E2E8F0'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(u - 2.6, -21); g.lineTo(u + 2.6, -16.4); g.moveTo(u + 2.4, -20.8); g.lineTo(u - 1, -17); g.stroke(); }
        }
        g.fillStyle = INK; g.fillRect(u0 * 29 - 2.6, -13.4, 5.2, 3.2); g.fillStyle = dark ? '#2A2522' : '#F59E0B'; g.fillRect(u0 * 29 - 2, -12.8, 4, 2); g.fillStyle = dark ? '#2A2522' : '#FDE68A'; g.fillRect(u0 * 29 - 2, -12.8, 1.6, 0.8);
      }
      // (the hood's lip, lit)
      g.fillStyle = R[5]; g.fillRect(-hw, -H1 + 0.2, CAR.W, 0.8);
      // (the chrome bumper, its rubber guards; or, smashed, the nose stoved in and the bumper hanging off it)
      if (crumple > 0.3) {
        g.fillStyle = INK; g.beginPath(); g.moveTo(-15, -24); g.lineTo(-6, -26); g.lineTo(2, -22); g.lineTo(11, -25.4); g.lineTo(17, -20); g.lineTo(14, -9); g.lineTo(3, -11); g.lineTo(-8, -8); g.lineTo(-17, -12); g.closePath(); g.fill();
        g.fillStyle = '#3F3F46'; g.beginPath(); g.moveTo(-13.6, -23); g.lineTo(-6, -24.8); g.lineTo(2, -21); g.lineTo(10.6, -24); g.lineTo(15.6, -19.6); g.lineTo(13, -10); g.lineTo(3, -12); g.lineTo(-8, -9.2); g.lineTo(-15.6, -12.6); g.closePath(); g.fill();
        for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? '#6B7380' : '#27272A'; g.fillRect(-11 + i * 3.4, -21 + (i % 3), 1.4, 9); }
        g.fillStyle = R[1]; for (let i = 0; i < 4; i++) g.fillRect(-14 + i * 8, -25 + (i % 2) * 13, 5, 2.4);
        g.save(); g.translate(-hw + 6, -10); g.rotate(0.28); chromeBar(g, 0, 0, CAR.W - 14, 4.2); g.restore();
      } else {
        chromeBar(g, -hw - 1, -13, CAR.W + 2, 4.6);
        g.fillStyle = '#18181C'; g.fillRect(-13, -12.6, 3.4, 4); g.fillRect(9.6, -12.6, 3.4, 4);
      }
    } else {
      const s = endFrame(g, G, back);
      void s;
      // (the taillights in two banks, lit in steps; the STEVE plate between them)
      for (const u0 of [-1, 1]) {
        const x0 = u0 < 0 ? -29.4 : 11.6;
        g.fillStyle = INK; g.fillRect(x0 - 0.6, -23.6, 18.4, 6.2); g.fillStyle = dark ? '#2A1A18' : '#7F1D1D'; g.fillRect(x0, -23, 17.2, 5);
        if (!dark) for (let i = 0; i < 3; i++) { g.fillStyle = '#EF4444'; g.fillRect(x0 + 0.8 + i * 5.6, -22.4, 4.6, 3.8); g.fillStyle = '#FCA5A5'; g.fillRect(x0 + 0.8 + i * 5.6, -22.4, 4.6, 0.9); }
      }
      { const w = textW('STEVE', 0.9) + 3; g.fillStyle = INK; g.fillRect(-w / 2 - 0.6, -23.4, w + 1.2, 7.6); g.fillStyle = dark ? CHAR_R[4] : Y[4]; g.fillRect(-w / 2, -22.8, w, 6.4); g.fillStyle = dark ? CHAR_R[5] : Y[5]; g.fillRect(-w / 2, -22.8, w, 0.8); pixText(g, 'STEVE', -textW('STEVE', 0.9) / 2, -21.6, 0.9, INK); }
      g.fillStyle = R[5]; g.fillRect(-hw, -H1 + 0.2, CAR.W, 0.8);
      chromeBar(g, -hw - 1, -13, CAR.W + 2, 4.6);
      // (the twin pipes out under it)
      for (const u of [-18, 18]) { disc(g, u, -6, 2.8, INK); disc(g, u, -6, 2.1, CHROME[dark ? 3 : 2]); disc(g, u - 0.4, -6.4, 1.2, CHROME[0]); disc(g, u + 0.2, -5.8, 1.2, '#0A0A0C'); }
    }
    g.restore();
  }

  // The shoulder: chamfered in to the top, a step lighter (the clear coat catching the light along its crease)
  for (const f of frustum(G, back, front, hw, H1, back + 3, front - 4, hw - 3, CAR.BODY)) {
    const k = Math.min(5, step(f.nz, f.lit) + 1);
    quad(g, [f.b0, f.b1, f.t1, f.t0], R[k]);
    if (f.lit && !dark) seg(g, lerpP(f.b0, f.t0, 0.3), lerpP(f.b1, f.t1, 0.3), R[5], 1);
    seg(g, f.b0, f.b1, R[Math.max(0, k - 2)], 0.6);
  }
  // The top (hood, deck): lit; seams, pins, the stripes, a sheen across it; smashed, the hood buckled
  const top = [pt(back + 3, -hw + 3, CAR.BODY), pt(front - 4, -hw + 3, CAR.BODY), pt(front - 4, hw - 3, CAR.BODY), pt(back + 3, hw - 3, CAR.BODY)] as P2[];
  quad(g, top, R[4], 1.5);
  const ga0 = GH_A0 * CAR.L / 2, ga1 = Math.min(front - 8, GH_A1 * CAR.L / 2), gb = CAR.W * GH_B;
  const ca0 = CAB_A0 * CAR.L / 2, ca1 = Math.min(front - 10, CAB_A1 * CAR.L / 2), cb = CAR.W * CAB_B;
  g.save(); topFrame(g, G, CAR.BODY);
  g.fillStyle = R[2]; g.fillRect(ga1 + 3, -hw + 4, 1, CAR.W - 8); g.fillRect(back + 20, -hw + 4, 1, CAR.W - 8);
  for (const sb of [-9.6, 3.6]) { g.fillStyle = INK; g.fillRect(back + 3, sb - 0.6, front - back - 7, 7.2); g.fillStyle = Y[4]; g.fillRect(back + 3, sb, front - back - 7, 6); g.fillStyle = Y[5]; g.fillRect(back + 3, sb, front - back - 7, 1); g.fillStyle = Y[2]; g.fillRect(back + 3, sb + 5, front - back - 7, 1); }
  if (!dark) {
    g.fillStyle = R[5]; g.beginPath(); g.moveTo(front - 30, -hw + 4); g.lineTo(front - 22, -hw + 4); g.lineTo(front - 36, hw - 4); g.lineTo(front - 44, hw - 4); g.closePath(); g.fill();
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(front - 19, -hw + 4); g.lineTo(front - 17, -hw + 4); g.lineTo(front - 31, hw - 4); g.lineTo(front - 33, hw - 4); g.closePath(); g.fill();
    g.fillStyle = R[5]; g.fillRect(back + 6, -hw + 5, 10, 2);
  }
  for (const sb of [-1, 1]) { disc(g, front - 9, sb * (hw - 9), 1.6, INK); disc(g, front - 9, sb * (hw - 9), 1.1, CHROME[1]); }
  if (crumple > 0.3) {
    for (let i = 0; i < 4; i++) { const a = front - 6 - i * 5; g.fillStyle = i % 2 ? R[5] : R[1]; g.beginPath(); g.moveTo(a, -hw + 3); g.lineTo(a - 2.4, -8); g.lineTo(a + 1.6, 6); g.lineTo(a - 1.6, hw - 3); g.lineTo(a - 3.4, hw - 3); g.lineTo(a - 0.6, 6); g.lineTo(a - 4.4, -8); g.lineTo(a - 2, -hw + 3); g.closePath(); g.fill(); }
  }
  if (burnt > 0.3) for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(12, 10, 8, 0.55)'; g.beginPath(); g.ellipse(back + 10 + h01(i * 5.1) * (front - back - 20), (h01(i * 2.3) - 0.5) * CAR.W * 0.7, 8, 5, 0, 0, Math.PI * 2); g.fill(); }
  g.restore();

  // The low things on the top (the scoop at the front, the wing at the back): drawn behind the cabin or in front of it,
  // whichever end's toward us
  const scoop = () => {
    if (crumple > 0.5) return;
    const a0 = ga1 + 6, a1 = Math.min(front - 10, a0 + 18);
    if (a1 - a0 < 8) return;
    for (const f of frustum(G, a0, a1, 10, CAR.BODY, a0 + 2, a1, 9, CAR.BODY + 5)) {
      quad(g, [f.b0, f.b1, f.t1, f.t0], R[step(f.nz, f.lit)], 1);
      if (f.kind === 'front') { quad(g, [lerpP(f.b0, f.t0, 0.25), lerpP(f.b1, f.t1, 0.25), lerpP(f.b1, f.t1, 0.85), lerpP(f.b0, f.t0, 0.85)], '#0A0A0C'); seg(g, lerpP(f.b0, f.t0, 0.9), lerpP(f.b1, f.t1, 0.9), CHROME[1], 0.8); }
    }
    quad(g, [pt(a0 + 2, -9, CAR.BODY + 5), pt(a1, -9, CAR.BODY + 5), pt(a1, 9, CAR.BODY + 5), pt(a0 + 2, 9, CAR.BODY + 5)], R[5], 1);
  };
  const wing = () => {
    const wa0 = back + 2, wa1 = back + 13, wh = CAR.BODY + 10;
    for (const sb of [-1, 1]) { const p = pt(back + 9, sb * hw * 0.62, CAR.BODY), q = pt(back + 7, sb * hw * 0.62, wh); seg(g, p, q, INK, 3); seg(g, p, q, S[2], 1.4); }
    for (const f of frustum(G, wa0, wa1, hw + 1, wh, wa0, wa1, hw + 1, wh + 2.4)) quad(g, [f.b0, f.b1, f.t1, f.t0], f.kind === 'side' ? Y[3] : R[2], 1);
    quad(g, [pt(wa0, -hw - 1, wh + 2.4), pt(wa1, -hw - 1, wh + 2.4), pt(wa1, hw + 1, wh + 2.4), pt(wa0, hw + 1, wh + 2.4)], R[4], 1);
    seg(g, pt(wa1, -hw, wh + 2.4), pt(wa1, hw, wh + 2.4), R[5], 0.8);
  };
  // (the whip antenna off the far back corner, Steve's pennant on it)
  {
    const p = pt(back + 10, -nb * hw * 0.7, CAR.BODY), q: P2 = [p[0] - 3, p[1] - 34];
    seg(g, p, q, INK, 1.6); seg(g, p, q, S[3], 0.8);
    g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(q[0] + 9, q[1] + 3); g.lineTo(q[0] + 0.4, q[1] + 6); g.closePath(); g.fillStyle = INK; g.fill();
    g.beginPath(); g.moveTo(q[0] + 0.6, q[1] + 0.8); g.lineTo(q[0] + 7.4, q[1] + 3); g.lineTo(q[0] + 0.8, q[1] + 5); g.closePath(); g.fillStyle = Y[4]; g.fill();
  }
  if (sy < 0) scoop(); else wing();

  // The cabin: the dark inside, the roll cage and the driver in it, the tinted glass over them, the pillars, the roof
  const cab = frustum(G, ga0, ga1, gb, CAR.BODY, ca0, ca1, cb, CAR.CAB);
  for (const f of cab) quad(g, [f.b0, f.b1, f.t1, f.t0], dark ? '#060504' : '#0B0D12');
  g.save();
  g.beginPath(); for (const f of cab) { g.moveTo(...f.b0); g.lineTo(...f.b1); g.lineTo(...f.t1); g.lineTo(...f.t0); g.closePath(); } g.clip();
  {
    const cage = (p: P2, q: P2) => { seg(g, p, q, '#202228', 2.6); seg(g, p, q, dark ? '#3A3430' : '#8A92A0', 0.8); };
    const hoop = ca0 + 7;
    cage(pt(hoop, -cb + 2, CAR.BODY), pt(hoop, -cb + 2, CAR.CAB - 2)); cage(pt(hoop, -cb + 2, CAR.CAB - 2), pt(hoop, cb - 2, CAR.CAB - 2)); cage(pt(hoop, cb - 2, CAR.CAB - 2), pt(hoop, cb - 2, CAR.BODY));
    cage(pt(hoop, -cb + 2, CAR.CAB - 2), pt(hoop, cb - 2, CAR.BODY + 2));
    for (const sb of [-1, 1]) { cage(pt(hoop, sb * (cb - 2), CAR.CAB - 2), pt(ca1 - 4, sb * (cb - 2), CAR.CAB - 2)); cage(pt(ca1 - 4, sb * (cb - 2), CAR.CAB - 2), pt(ga1 - 6, sb * (gb - 3), CAR.BODY + 2)); }
    // (the seat's back; the driver: his yellow firesuit, the harness, the helmet (white, the car's color down it, the visor
    // down), his gloves on the wheel)
    const dA = -4, dB = nb * cb * 0.42;
    quad(g, [pt(dA - 7, dB - 7, CAR.BODY), pt(dA - 7, dB + 7, CAR.BODY), pt(dA - 7, dB + 7, CAR.BODY + 16), pt(dA - 7, dB - 7, CAR.BODY + 16)], '#26262C');
    if (o.driver && !dark) {
      const [sx, sy2] = pt(dA, dB, CAR.BODY + 5);
      g.fillStyle = INK; g.beginPath(); g.ellipse(sx, sy2, 8.6, 5.2, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = Y[3]; g.beginPath(); g.ellipse(sx, sy2, 7.8, 4.4, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = Y[4]; g.beginPath(); g.ellipse(sx - 1.6, sy2 - 1.4, 5, 2.4, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#18181B'; g.fillRect(sx - 4, sy2 - 4, 1.6, 8); g.fillRect(sx + 2.4, sy2 - 4, 1.6, 8);
      const [wx, wy] = pt(dA + 13, dB, CAR.BODY + 9);
      g.strokeStyle = '#121216'; g.lineWidth = 1.8; g.beginPath(); g.ellipse(wx, wy, 3.4 * Math.max(0.35, Math.abs(sy)) + 0.6, 3.8, 0, 0, Math.PI * 2); g.stroke();
      disc(g, wx - 2, wy - 2.6, 1.4, '#27272A'); disc(g, wx + 2, wy - 2.6, 1.4, '#27272A');
      const [hx, hy] = pt(dA, dB, CAR.BODY + 14);
      disc(g, hx, hy, 6.4, INK); disc(g, hx, hy, 5.6, '#E2E8F0'); disc(g, hx - 1, hy - 1, 4, '#F8FAFC');
      g.save(); g.beginPath(); g.arc(hx, hy, 5.6, 0, Math.PI * 2); g.clip();
      g.fillStyle = R[3]; g.fillRect(hx - 1.2, hy - 6, 2.4, 12); g.fillStyle = R[5]; g.fillRect(hx - 1.2, hy - 6, 0.8, 12);
      if (sy > -0.75) { const vx = hx + cy * 3.4, vy = hy + 0.4; g.fillStyle = '#0F172A'; g.fillRect(vx - 3.2, vy - 1.8, 6.4, 3.6); g.fillStyle = '#7DD3FC'; g.fillRect(vx - 2.4, vy - 1.4, 2.4, 0.8); }
      g.restore();
      g.fillStyle = '#FFFFFF'; g.fillRect(hx - 3, hy - 4.2, 2, 1.2);
    }
    // (the near door's bars: an X, in front of him)
    cage(pt(hoop, nb * (cb - 1), CAR.BODY + 3), pt(ga1 - 9, nb * (gb - 2), CAR.BODY + 9));
    cage(pt(hoop, nb * (cb - 1), CAR.BODY + 9), pt(ga1 - 9, nb * (gb - 2), CAR.BODY + 3));
  }
  g.restore();
  // (the glass: tinted, the sky banded in it, a glint across; blown out if it's burnt (shards round its frame); a smash
  // cracks the windshield)
  for (const f of cab) {
    if (dark) {
      for (const [p, q] of [[f.b0, f.t0], [f.b1, f.t1]] as [P2, P2][]) { const m = lerpP(p, q, 0.3); quad(g, [p, lerpP(p, q, 0.5), [m[0] + (f.b1[0] - f.b0[0]) * 0.16, m[1]]], '#9EC6DA'); }
      continue;
    }
    g.globalAlpha = 0.55; quad(g, [f.b0, f.b1, f.t1, f.t0], '#123A5C');
    g.globalAlpha = 0.6; band(g, f, 0.6, 1, '#7EC0E4');
    g.globalAlpha = 0.85; seg(g, lerpP(f.b0, f.t0, 0.6), lerpP(f.b1, f.t1, 0.6), '#C6E8F6', 0.8);
    g.globalAlpha = 0.7;
    const gl = (u0: number, u1: number) => quad(g, [lerpP(f.b0, f.b1, u0), lerpP(f.b0, f.b1, u1), lerpP(f.t0, f.t1, u1 + 0.12), lerpP(f.t0, f.t1, u0 + 0.12)], '#FFFFFF');
    gl(0.18, 0.26); gl(0.32, 0.35);
    g.globalAlpha = 1;
    if (crumple > 0.5 && f.kind === 'front') {
      const m = lerpP(lerpP(f.b0, f.b1, 0.62), lerpP(f.t0, f.t1, 0.62), 0.45);
      for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.3, r = 6 + h01(i) * 6; seg(g, m, [m[0] + Math.cos(a) * r, m[1] + Math.sin(a) * r * 0.7], '#F8FAFC', 0.5); }
    }
  }
  // (the pillars up its corners, the chrome beltline round its foot)
  for (const f of cab) {
    const k = step(f.nz, f.lit);
    for (const [p, q] of [[f.b0, f.t0], [f.b1, f.t1]] as [P2, P2][]) { seg(g, p, q, INK, 4.4); seg(g, p, q, R[k], 2.8); seg(g, p, q, R[Math.min(5, k + 1)], 0.8); }
    seg(g, f.b0, f.b1, INK, 2); seg(g, f.b0, f.b1, CHROME[dark ? 3 : 1], 0.9);
  }
  // (the roof: its number on a roundel, the stripes; the lip round its edges, brightest along the near one)
  const r0 = pt(ca0, -cb, CAR.CAB), r1 = pt(ca1, -cb, CAR.CAB), r2 = pt(ca1, cb, CAR.CAB), r3 = pt(ca0, cb, CAR.CAB);
  quad(g, [r0, r1, r2, r3], R[4]);
  g.save(); topFrame(g, G, CAR.CAB);
  for (const sb of [-9.6, 3.6]) { g.fillStyle = Y[4]; g.fillRect(ca0, sb, ca1 - ca0, 6); g.fillStyle = Y[5]; g.fillRect(ca0, sb, ca1 - ca0, 1); }
  const rm = (ca0 + ca1) / 2;
  disc(g, rm, 0, 12.4, INK); disc(g, rm, 0, 11.4, '#F8FAFC'); disc(g, rm + 1, 1, 9.6, '#E2E8F0'); disc(g, rm - 0.4, -0.4, 9.6, '#F8FAFC');
  g.translate(rm, 0); readable(g, G);
  { const n = NUMBER[o.color], cell = 3; pixText(g, n, -textW(n, cell) / 2, -7.5, cell, dark ? CHAR_R[2] : INK); }
  g.restore();
  g.lineJoin = 'miter';
  g.strokeStyle = LIPR[1]; g.lineWidth = 3; g.beginPath(); g.moveTo(...r0); g.lineTo(...r1); g.lineTo(...r2); g.lineTo(...r3); g.closePath(); g.stroke();
  g.strokeStyle = LIPR[2]; g.lineWidth = 1.5; g.stroke();
  const [n0, n1] = nb > 0 ? [r3, r2] : [r0, r1];
  g.strokeStyle = LIPR[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(n0[0], n0[1] - 1); g.lineTo(n1[0], n1[1] - 1); g.stroke();

  if (sy < 0) wing(); else scoop();

  // Off the ground: its belly (we're under it): the floor pan, the driveshaft, the headers and the exhaust glowing hot,
  // the muffler. The side that comes down on him.
  if (o.air > 0.05) {
    const dk = CAR.W * ZK * 0.75 * o.air;
    const n = nb * CAR.W / 2, fa = -nb * CAR.W / 2;
    const pA = pt(back + 4, n, CAR.CLEAR), pB = pt(front - 4, n, CAR.CLEAR);
    const pC: P2 = [pt(front - 4, fa, CAR.CLEAR)[0], pB[1] + dk], pD: P2 = [pt(back + 4, fa, CAR.CLEAR)[0], pA[1] + dk];
    quad(g, [pA, pB, pC, pD], '#24242A', 1.5);
    quad(g, [[pA[0], pA[1] + dk * 0.55], [pB[0], pB[1] + dk * 0.55], pC, pD], '#18181C');
    const mid = (u: number, v: number): P2 => [pA[0] + (pB[0] - pA[0]) * u, pA[1] + (pB[1] - pA[1]) * u + dk * v];
    g.lineCap = 'butt';
    seg(g, mid(0.12, 0.5), mid(0.7, 0.5), '#4A4E58', 3); seg(g, mid(0.12, 0.42), mid(0.7, 0.42), '#8A92A0', 0.8);
    for (const v of [0.25, 0.75]) {
      seg(g, mid(0.05, v), mid(0.8, v), INK, 4); seg(g, mid(0.05, v), mid(0.55, v), '#7A3A1A', 2); seg(g, mid(0.62, v), mid(0.8, v), '#F97316', 2);
      const [hx, hy] = mid(0.72, v); g.fillStyle = '#FDE047'; g.fillRect(Math.round(hx - 1), Math.round(hy - 1), 3, 2);
    }
    const [ox2, oy2] = mid(0.68, 0.5); g.fillStyle = INK; g.fillRect(Math.round(ox2 - 7), Math.round(oy2 - 4), 14, 8); g.fillStyle = '#3A3E48'; g.fillRect(Math.round(ox2 - 6), Math.round(oy2 - 3), 12, 6); g.fillStyle = '#5E6470'; g.fillRect(Math.round(ox2 - 6), Math.round(oy2 - 3), 12, 1);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The sprites

const RES = 2, YAWS = 32, CAP = 120;
interface Spr { cv: HTMLCanvasElement; x: number; y: number }
const sprites = new Map<string, Spr | null>();
const spriteOf = (o: Look, key: string): Spr | null => {
  const hit = sprites.get(key);
  if (hit !== undefined) { sprites.delete(key); sprites.set(key, hit); return hit; }
  if (typeof document === 'undefined') return null;
  const { hx, hz } = extents(o.yaw);
  const x = Math.floor(-hx - 18), y = Math.floor(-CAR.CAB - 30 - hz * ZK), w = Math.ceil(hx * 2 + 36), h = Math.ceil(CAR.CAB + 30 + hz * ZK * 2 + 34);
  const cv = document.createElement('canvas'); cv.width = w * RES; cv.height = h * RES;
  const g = cv.getContext('2d');
  let s: Spr | null = null;
  if (g) { g.setTransform(RES, 0, 0, RES, -x * RES, -y * RES); paintCar(g, o); s = { cv, x, y }; }
  sprites.set(key, s);
  if (sprites.size > CAP) { const first = sprites.keys().next().value; if (first !== undefined) sprites.delete(first); }
  return s;
};

// ---------------------------------------------------------------------------------------------------------------
// The live bits

/** A point round a wheel (its middle at C, in the side's plane): angle t. */
const rimPt = (G: Geo, C: P2, r: number, t: number): P2 => [C[0] + r * Math.cos(t) * G.cy, C[1] + r * (Math.cos(t) * G.sy * ZK - Math.sin(t))];

/** A wheel: the tire (a cylinder: its tread's lugs going round toward us), the sidewall with Steve's yellow pinstripe,
 *  the chrome mag and its five spokes turning; burnt, charred to a rusty rim. */
const drawWheel = (c: Ctx, G: Geo, a: number, b: number, hC: number, spin: number, burnt: number) => {
  const sb = Math.sign(b) || 1, bo = b, bi = b - sb * 10;
  const outerNear = bo * G.cy >= bi * G.cy;
  const bF = outerNear ? bi : bo, bN = outerNear ? bo : bi;
  const CF = G.pt(a, bF, hC), CN = G.pt(a, bN, hC);
  const d: P2 = [CN[0] - CF[0], CN[1] - CF[1]];
  const ux = G.cy, uy = G.sy * ZK, cu = ux * d[1] - uy * d[0], cv = 0 * d[1] - (-1) * d[0];
  const t1 = Math.atan2(cv, cu);
  const away = (() => { const m = rimPt(G, CF, 1, t1 + Math.PI / 2); return (m[0] - CF[0]) * d[0] + (m[1] - CF[1]) * d[1] < 0; })();
  const s0 = away ? t1 : t1 + Math.PI;
  const tire = burnt > 0.5 ? '#141110' : '#24242A';
  // (the cylinder: the far rim's half away from us, the near rim's half round the other way)
  c.beginPath();
  for (let i = 0; i <= 10; i++) { const p = rimPt(G, CF, TIRE_R, s0 + (i / 10) * Math.PI); if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); }
  for (let i = 0; i <= 10; i++) { const p = rimPt(G, CN, TIRE_R, s0 + Math.PI + (i / 10) * Math.PI); c.lineTo(p[0], p[1]); }
  c.closePath(); c.fillStyle = tire; c.fill(); c.strokeStyle = INK; c.lineWidth = 1.4; c.stroke();
  // (the lugs across the tread, where it's toward us)
  if (Math.abs(G.sy) > 0.25) {
    c.strokeStyle = '#0C0C10'; c.lineWidth = 1.3; c.beginPath();
    for (let k = 0; k < 14; k++) {
      const t = spin + (k * Math.PI * 2) / 14;
      if (Math.cos(t) * G.sy <= 0.1) continue;
      const p = rimPt(G, CF, TIRE_R, t), q = rimPt(G, CN, TIRE_R, t);
      c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]);
    }
    c.stroke();
  }
  // (the near face: the outside's sidewall and mag, or the inside's dark)
  if (Math.abs(G.cy) < 0.2) return;
  c.save(); c.transform(G.cy, G.sy * ZK, 0, 1, CN[0], CN[1]);
  disc(c, 0, 0, TIRE_R, INK); disc(c, 0, 0, TIRE_R - 0.8, burnt > 0.5 ? '#1A1614' : '#2E2E36');
  c.fillStyle = burnt > 0.5 ? '#1A1614' : '#3A3A44'; c.beginPath(); c.arc(-0.6, -0.6, TIRE_R - 1.6, Math.PI, Math.PI * 1.5); c.lineTo(-0.6, -0.6); c.fill();
  // (the tread's notches round its edge)
  c.strokeStyle = '#0C0C10'; c.lineWidth = 1.4; c.beginPath();
  for (let k = 0; k < 12; k++) { const t = spin + (k * Math.PI * 2) / 12; c.moveTo(Math.cos(t) * (TIRE_R - 1.6), -Math.sin(t) * (TIRE_R - 1.6)); c.lineTo(Math.cos(t) * TIRE_R, -Math.sin(t) * TIRE_R); }
  c.stroke();
  if (outerNear) {
    if (burnt <= 0.5) { c.strokeStyle = YEL[4]; c.lineWidth = 0.8; c.beginPath(); c.arc(0, 0, 7.8, 0, Math.PI * 2); c.stroke(); }
    disc(c, 0, 0, 6.6, INK); disc(c, 0, 0, 6, burnt > 0.5 ? '#5A3A2A' : CHROME[2]); disc(c, -0.8, -0.8, 4.4, burnt > 0.5 ? '#6B4A3A' : CHROME[1]);
    c.lineCap = 'butt';
    for (let k = 0; k < 5; k++) {
      const t = spin + (k * Math.PI * 2) / 5, ex = Math.cos(t) * 5.6, ey = -Math.sin(t) * 5.6;
      c.strokeStyle = burnt > 0.5 ? '#3A2A20' : CHROME[3]; c.lineWidth = 1.8; c.beginPath(); c.moveTo(0, 0); c.lineTo(ex, ey); c.stroke();
      if (burnt <= 0.5) { c.strokeStyle = CHROME[0]; c.lineWidth = 0.6; c.beginPath(); c.moveTo(0, 0); c.lineTo(ex * 0.9, ey * 0.9); c.stroke(); }
    }
    disc(c, 0, 0, 1.8, INK); disc(c, -0.3, -0.3, 1.2, burnt > 0.5 ? '#4A3A30' : CHROME[0]);
  } else disc(c, 0, 0, 4, '#141418');
  c.restore();
};

/** Stepped flames (three colors, flickering) up off a point. */
const flame = (c: Ctx, x: number, y: number, h: number, w: number) => {
  const tri = (k: number, col: string) => { c.fillStyle = col; c.beginPath(); c.moveTo(x - w * k, y); c.lineTo(x - w * k * 0.4, y - h * k * 0.6); c.lineTo(x, y - h * k); c.lineTo(x + w * k * 0.5, y - h * k * 0.55); c.lineTo(x + w * k, y); c.closePath(); c.fill(); };
  tri(1, '#DC2626'); tri(0.74, '#F97316'); tri(0.44, '#FDE047');
};

export const drawCar = (c: Ctx, car: CarPose) => {
  const yq = ((Math.round((car.yaw / (Math.PI * 2)) * YAWS) % YAWS) + YAWS) % YAWS, yaw = (yq * Math.PI * 2) / YAWS;
  const G = geo(yaw), { cy, sy, pt } = G;
  const crumple = Math.round((car.crumple ?? 0) * 10) / 10, burnt = Math.round((car.burnt ?? 0) * 5) / 5;
  const air = Math.round(Math.max(0, Math.min(1, (GY - 30 - car.y) / 90)) * 3) / 3;
  const driver = car.driver !== false;
  const look: Look = { color: car.color, yaw, crumple, burnt, driver, air };
  const spr = spriteOf(look, `${car.color}|${yq}|${crumple}|${burnt}|${driver ? 1 : 0}|${air}`);
  const f = car.f ?? 0, spin = car.wheel ?? 0, front = (CAR.L / 2) * (1 - crumple * 0.3), back = -CAR.L / 2, hw = CAR.W / 2;
  const nb = cy >= 0 ? 1 : -1, sq = Math.round((car.squash ?? 0) * 4), hang = air > 0 ? 3 : 0;
  c.save();
  c.translate(Math.round(car.x), Math.round(car.y + car.z * ZK));
  if (car.pitch) { c.translate(0, -CAR.BODY / 2); c.rotate(car.pitch); c.translate(0, CAR.BODY / 2); }

  // The wheels under it: the far side's, then the near side's in their wells (the arches are cut through the body)
  const wheels = (near: boolean, wells = true) => {
    for (const wa0 of WHEEL_A) for (const sb of [-1, 1]) {
      const isNear = sb * cy > 0.02;
      if (isNear !== near) continue;
      const a = wa0 * CAR.L / 2, b = sb * hw * WHEEL_B;
      if (near && wells && Math.abs(cy) > 0.05 && a + ARCH_R <= front - 1) {
        const C = pt(a, sb * hw, TIRE_R - sq);
        c.save(); c.transform(cy, sy * ZK, 0, 1, C[0], C[1]); disc(c, 0, 0, ARCH_R, '#08080A'); c.restore();
      }
      drawWheel(c, G, a, b, TIRE_R - hang, nb * spin, burnt);
    }
  };
  wheels(false); wheels(true);

  if (spr) {
    const sm = c.imageSmoothingEnabled;
    c.imageSmoothingEnabled = !!car.pitch;
    c.drawImage(spr.cv, spr.x, spr.y + sq, spr.cv.width / RES, spr.cv.height / RES);
    c.imageSmoothingEnabled = sm;
  }
  if (sq) c.translate(0, sq);

  // The exhaust: the tips glowing; on the gas, now and then a backfire's flames out of them
  if (burnt < 0.5 && sy < 0.2) {
    const thr = car.throttle ?? 0, dir: P2 = [-cy, -sy * ZK], dl = Math.hypot(dir[0], dir[1]) || 1;
    const fire = thr > 0 && ((f >> 2) % 11 === 0 || (thr >= 1 && (f >> 1) % 3 !== 0));
    for (const ub of [-18, 18]) {
      const [tx, ty] = pt(back - 1, ub, 6);
      c.fillStyle = (f >> 3) % 2 ? '#F97316' : '#DC2626'; c.fillRect(Math.round(tx - 1), Math.round(ty - 1), 2, 2);
      if (fire) {
        const L = (7 + ((f * 7 + ub) % 5) * 1.6) * (0.6 + thr * 0.4), nx = dir[0] / dl, ny = dir[1] / dl, px = -ny, py = nx;
        for (const [k, col] of [[1, '#EA580C'], [0.66, '#FDE047'], [0.3, '#FFFFFF']] as const) {
          c.fillStyle = col; c.beginPath(); c.moveTo(tx + px * 2.2 * k, ty + py * 2.2 * k); c.lineTo(tx + nx * L * k, ty + ny * L * k); c.lineTo(tx - px * 2.2 * k, ty - py * 2.2 * k); c.closePath(); c.fill();
        }
      }
    }
  }
  // Off the ground: the near wheels hanging under its belly; sparks and drips off it
  if (air > 0.05) {
    c.translate(0, -sq); wheels(true, false); c.translate(0, sq);
    const dk = CAR.W * ZK * 0.75 * air, pA = pt(back + 4, nb * hw, CAR.CLEAR), pB = pt(front - 4, nb * hw, CAR.CLEAR);
    for (let k = 0; k < 4; k++) {
      const u = 0.2 + k * 0.2, ph = ((spin * 7 + k * 1.7) % 1 + 1) % 1, sx2 = pA[0] + (pB[0] - pA[0]) * u, sy2 = pA[1] + (pB[1] - pA[1]) * u + dk * 0.9;
      c.fillStyle = k % 2 ? '#FDE047' : '#F97316'; c.fillRect(Math.round(sx2 + (k - 1.5) * 2 * ph), Math.round(sy2 + 3 + ph * 14), 2, 2);
    }
  }
  // Scraping: sparks off its foot, streaming back off it
  if (car.sparks) {
    const [bx, by] = pt(front * 0.7, nb * hw, 1), dir: P2 = [-cy, -sy * ZK];
    for (let k = 0; k < 9; k++) {
      const u = ((f * 0.13 + k * 0.37) % 1), L = 4 + h01(k + (f >> 2)) * 6, x = bx + dir[0] * u * 60 + (h01(k * 3.1 + f) - 0.5) * 8, y = by - u * 14 + u * u * 22;
      c.strokeStyle = k % 3 === 0 ? '#FFFFFF' : k % 3 === 1 ? '#FDE047' : '#F97316'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x - dir[0] * L, y - dir[1] * L + 1.5); c.stroke();
    }
  }
  // The tires smoking (a drift, a slide): stepped puffs boiling off the back wheels, rolling up and back
  const smoke = car.smoke ?? 0;
  if (smoke > 0.05) {
    for (const sb of [-1, 1]) {
      const [wx, wy] = pt(WHEEL_A[0] * CAR.L / 2, sb * hw, 3);
      for (let k = 0; k < 4; k++) {
        const u = ((f * 0.045 + k * 0.25 + (sb > 0 ? 0.12 : 0)) % 1), r = (5 + u * 11) * (0.5 + smoke * 0.5), a = (1 - u) * 0.6 * smoke;
        const px = wx - cy * u * 34 + Math.sin(f * 0.1 + k) * 3, py = wy - sy * ZK * u * 34 - u * 24;
        c.fillStyle = `rgba(168, 162, 158, ${a.toFixed(2)})`; c.beginPath(); c.ellipse(px, py, r, r * 0.78, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = `rgba(245, 245, 244, ${(a * 0.85).toFixed(2)})`; c.beginPath(); c.ellipse(px - r * 0.22, py - r * 0.22, r * 0.62, r * 0.48, 0, 0, Math.PI * 2); c.fill();
      }
    }
  }
  // Smashed: steam off the nose
  if (crumple > 0) {
    const [fx, fy] = pt(front, 0, 20);
    for (let k = 0; k < 3; k++) { const u = (((f * 0.02) + k * 0.33) % 1 + 1) % 1, r = 3 + u * 6; c.fillStyle = `rgba(226, 232, 240, ${(0.45 * (1 - u)).toFixed(2)})`; c.fillRect(Math.round(fx - r + u * 8), Math.round(fy - 10 - u * 30), Math.round(r * 2), Math.round(r)); }
  }
  // On fire: flames up out of the engine bay and the wheel wells, flickering, embers off them
  const fireK = car.fire ?? 0;
  if (fireK > 0.02) {
    const spots: [number, number, number][] = [[front - 22, -8, CAR.BODY], [front - 32, 8, CAR.BODY], [front - 14, 0, CAR.BODY], [WHEEL_A[1] * CAR.L / 2, nb * hw, 20], [WHEEL_A[0] * CAR.L / 2, nb * hw, 20], [-20, 0, CAR.CAB - 2]];
    spots.forEach(([a, b, h], k) => {
      if (k >= 3 && fireK < 0.4) return;
      const [x, y] = pt(a, b, h), fl = (f * 3 + k * 17) % 11;
      flame(c, x + Math.sin(f * 0.3 + k) * 1.5, y, (10 + fl * 1.4) * (0.5 + fireK * 0.7), 5 + fireK * 2);
      if ((f + k * 5) % 9 < 3) { c.fillStyle = '#FDE047'; c.fillRect(Math.round(x + (h01(k + (f >> 3)) - 0.5) * 12), Math.round(y - 20 - ((f * 2 + k * 7) % 18)), 2, 2); }
    });
  }
  // Frozen solid in a block of ice: stepped, its top lit, its facets, frost up its foot
  if (car.ice) {
    const { hx } = extents(yaw), k = car.ice;
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
