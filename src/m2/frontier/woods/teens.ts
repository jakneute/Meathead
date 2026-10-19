// The local kids on dirt bikes (outside the park: real teenagers, not staff): boys and girls, every skin, thin and
// heavy, hair of every sort, helmets or not (a ball cap on backwards, a beanie), each one seeded (people.ts's drawer, its
// look kept young: no beards, no bald heads); the helmeted ones in moto jerseys. And their bikes (peak SNES: the frame,
// the swingarm and its shock, the engine's fins and cases, the header curling under and the silencer up the back, the
// shrouds and tank in the bike's color, a ribbed seat, gold fork tubes, the high fender, number plates, bars and
// levers, mud on all of it; the wheels live: knobby tires turning, spoked rims, a disc up front). The body's cached per
// color, number and facing (still()); the wheels spin over it. Job 6's TEENAGERS draw theirs from here (drawDirtBike,
// drawTeenPerson, teenOf).

import type { GameState } from '../../../m1/game/core/state';
import { drawPerson, type Pose } from '../../adventure/temple/people';
import { drawTucker, type TuckerOpts } from '../tucker';
import { signText } from '../../signLetters';
import { box, INK, mix, type Ctx } from '../kit';
import { still, checker, pixelBlob, printed } from './paint';
import { LANES, MOUNDS, X } from './layout';
import { TEEN_VOICES } from './lines';

export interface Teen {
  seed: number; woman: boolean;
  /** Their helmet's color, or none. */
  helmet: string | null;
  voice: string;
}
const HELMETS = ['#DC2626', '#F8FAFC', '#111827', '#F59E0B', '#2563EB', '#16A34A', '#EC4899'];
const BIKES = ['#DC2626', '#F59E0B', '#16A34A', '#2563EB', '#EA580C', '#7C3AED', '#E5E7EB', '#FACC15'];
/** Moto jerseys (the helmeted kids'), and the helmetless ones' headgear. */
const JERSEYS = ['#1E3A8A', '#B91C1C', '#111827', '#F97316', '#0F766E', '#7C3AED', '#E5E7EB', '#65A30D'];
const CAPS = ['#1F2937', '#B91C1C', '#1D4ED8', '#166534', '#F5F5F4', '#9A3412'];

/** A kid from a seed (the same kid every time). */
export const teenOf = (seed: number): Teen => {
  const s = Math.abs(Math.round(seed)), woman = Math.floor(s / 4) % 5 < 2;
  return {
    seed: s, woman,
    helmet: s % 3 === 0 ? null : HELMETS[Math.floor(s / 3) % HELMETS.length],
    voice: (woman ? TEEN_VOICES.girl : TEEN_VOICES.boy)[Math.floor(s / 2) % 2],
  };
};
/** A bike's color from a seed. */
export const bikeColor = (seed: number) => BIKES[Math.abs(Math.round(seed * 7)) % BIKES.length];

/** A kid off their bike: flying (kicked or tackled off), sat in the dirt, or stood. World feet (x, y). */
export interface Kid extends Teen {
  x: number; y: number; vx: number; vy: number; rot: number; lane: number;
  mode: 'fly' | 'sit' | 'stand';
  facing: number; mood: 'bored' | 'angry' | 'scared' | 'happy' | 'shocked';
}
/** A bike, and who's on it (a kid, him, Tucker, or nobody). World x of its middle, on its lane's ground. */
export interface Bike {
  x: number; lane: number; facing: number; vx: number;
  color: string; num: number;
  rider: Teen | 'meathead' | 'tucker' | null;
  /** Up in the air off a jump, and how fast; the front wheel up (a wheelie: negative). */
  hop: number; hopV: number; tilt: number;
  /** Laps (the lot's riders before the bounty): turning round at a and b. */
  loop?: { a: number; b: number };
  /** Where it's riding to (the bounty's gathering), and revving there. */
  to?: number; rev: boolean;
  /** Its wheels' turn. */
  spin: number;
  t: number;
}

export const makeBike = (seed: number, x: number, lane: number, facing: number, rider: Bike['rider']): Bike => ({
  x, lane, facing, vx: 0, color: bikeColor(seed), num: 2 + (Math.abs(seed * 13) % 97), rider, hop: 0, hopV: 0, tilt: 0, rev: false, spin: 0, t: Math.abs(seed) % 60,
});

/** A frame of a bike: its laps, its run to where it's going, its hops over the lot's jumps, its revving. */
export const rideBike = (b: Bike) => {
  b.t++;
  if (b.loop) {
    b.vx += (b.facing * 4.2 - b.vx) * 0.08;
    if (b.x > b.loop.b && b.facing > 0) b.facing = -1;
    if (b.x < b.loop.a && b.facing < 0) b.facing = 1;
  } else if (b.to !== undefined) {
    const d = b.to - b.x;
    if (Math.abs(d) < 3) { b.vx = 0; b.x = b.to; }
    else { b.vx = Math.sign(d) * Math.min(6, Math.abs(d) * 0.08 + 1); b.facing = Math.sign(d); }
  }
  b.x += b.vx;
  b.spin += b.vx * 0.12;
  // (over a jump in the lot's back lane: up off it)
  if (b.lane > 0 && b.hop === 0 && Math.abs(b.vx) > 2.5) for (const m of MOUNDS) if (Math.abs(b.x - X(m)) < 4) b.hopV = -4.6;
  if (b.hopV !== 0 || b.hop < 0) { b.hopV += 0.3; b.hop += b.hopV; if (b.hop >= 0) { b.hop = 0; b.hopV = 0; } }
  // (revving: the front wheel lifting and dropping)
  const want = b.rev ? -0.18 - Math.max(0, Math.sin(b.t * 0.21)) * 0.22 : b.hop < 0 ? -0.12 : 0;
  b.tilt += (want - b.tilt) * 0.2;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** A five-step ramp round a color (darkest first). */
const rampOf = (col: string) => [mix(col, INK, 0.62), mix(col, INK, 0.38), mix(col, INK, 0.16), col, mix(col, '#FFFFFF', 0.28), mix(col, '#FFFFFF', 0.55)];
const ALU = ['#2A2E34', '#4A5058', '#6E767E', '#949CA4', '#BCC2C8', '#E4E8EC'];
const BLK = ['#08080A', '#141418', '#202026', '#2E2E36', '#42424C', '#5A5A66'];
const GOLDF = ['#4A3008', '#7A520E', '#A8761A', '#D29E2E', '#ECC452', '#FFE68A'];
const MUD = ['#2E2214', '#4A3820', '#6A5232'];

/** A wheel, live (its knobs and spokes turn): tire stepped, the rim, spokes, the hub; a brake disc up front. */
const wheel = (c: Ctx, x: number, y: number, r: number, spin: number, front: boolean) => {
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + 1.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = BLK[2]; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.fillStyle = BLK[4]; c.beginPath(); c.arc(x - 0.8, y - 0.8, r - 1.5, Math.PI * 0.95, Math.PI * 1.65); c.lineTo(x, y); c.fill();
  // (the knobs round the tread, turning)
  for (let i = 0; i < 14; i++) { const a = spin + (i / 14) * Math.PI * 2; c.fillStyle = i % 2 ? BLK[3] : INK; c.fillRect(Math.round(x + Math.cos(a) * (r + 0.5) - 1), Math.round(y + Math.sin(a) * (r + 0.5) - 1), 2, 2); }
  c.fillStyle = MUD[1]; c.beginPath(); c.arc(x, y, r - 0.5, Math.PI * 0.2, Math.PI * 0.6); c.lineTo(x, y); c.fill();
  c.fillStyle = BLK[1]; c.beginPath(); c.arc(x, y, r * 0.66, 0, Math.PI * 2); c.fill();
  // (the rim, lit up top)
  c.strokeStyle = ALU[2]; c.lineWidth = 1.6; c.beginPath(); c.arc(x, y, r * 0.62, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = ALU[4]; c.lineWidth = 1; c.beginPath(); c.arc(x, y, r * 0.62, Math.PI * 1.05, Math.PI * 1.6); c.stroke();
  // (spokes, turning)
  c.strokeStyle = ALU[3]; c.lineWidth = 0.6;
  for (let i = 0; i < 12; i++) { const a = spin * 1 + (i / 12) * Math.PI * 2; c.beginPath(); c.moveTo(x + Math.cos(a + 0.3) * 1.6, y + Math.sin(a + 0.3) * 1.6); c.lineTo(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6); c.stroke(); }
  if (front) { c.fillStyle = ALU[1]; c.beginPath(); c.arc(x, y, r * 0.34, 0, Math.PI * 2); c.fill(); c.strokeStyle = ALU[4]; c.lineWidth = 0.8; c.beginPath(); c.arc(x, y, r * 0.3, Math.PI, Math.PI * 1.5); c.stroke(); }
  c.fillStyle = INK; c.fillRect(x - 2, y - 2, 4, 4); c.fillStyle = ALU[4]; c.fillRect(x - 1.5, y - 1.5, 2, 2);
};

/** A tube: inked, then its color, a lit line along it. */
const tube = (c: Ctx, pts: number[], w: number, col: string, lit?: string) => {
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.strokeStyle = INK; c.lineWidth = w + 2; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.stroke();
  if (lit) { c.strokeStyle = lit; c.lineWidth = Math.max(0.6, w * 0.3); c.beginPath(); c.moveTo(pts[0], pts[1] - w * 0.25); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1] - w * 0.25); c.stroke(); }
  c.lineCap = 'butt';
};
/** A filled shape, inked round. */
const shape = (c: Ctx, pts: [number, number][], col: string, ink = true) => {
  if (ink) { c.fillStyle = INK; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke(); }
  c.fillStyle = col; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill();
};
/** A number plate's number, set the right way round whichever way the bike faces. */
const plateNum = (g: Ctx, x: number, y: number, num: number, facing: number) => {
  g.save(); g.translate(x, y); g.scale(facing, 1); signText(g, String(num), 0, 3, printed('#141414')); g.restore();
};

/** The bike's body (everything but the wheels), facing right in its own space, its ground point at (0, 0). */
const paintBike = (g: Ctx, color: string, num: number, facing: number) => {
  const C = rampOf(color), plate = color === '#E5E7EB' || color === '#FACC15' ? '#1E1E24' : '#F4F4F0', plateHi = plate === '#F4F4F0' ? '#FFFFFF' : '#3A3A44';
  // (the chain: top run and bottom, sprocket to sprocket)
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(-24, -16); g.lineTo(-3, -20); g.moveTo(-24, -6); g.lineTo(-3, -14); g.stroke();
  g.strokeStyle = ALU[2]; g.lineWidth = 1; g.beginPath(); g.moveTo(-24, -16); g.lineTo(-3, -20); g.stroke();
  // (the swingarm: cast aluminum, a chain slider; the rear shock's spring)
  shape(g, [[-27, -13], [-4, -21], [-2, -16], [-25, -8]], ALU[3]);
  shape(g, [[-25, -12], [-5, -20], [-4, -19], [-25, -11]], ALU[5], false);
  box(g, -18, -15, 10, 2, BLK[2]);
  tube(g, [-14, -18, -9, -31], 3, GOLDF[2]);
  for (let k = 0; k < 5; k++) { const t = k / 5, sx = -13.5 + t * 4, sy = -19 - t * 11; box(g, sx - 3, sy, 6, 1, k % 2 ? C[3] : C[4]); }
  // (the frame: steel tubes, the downtube and the cradle, the subframe out under the seat)
  tube(g, [15, -45, 6, -30, -1, -15, -8, -15, -10, -24], 2.6, BLK[3], BLK[5]);
  tube(g, [15, -45, 0, -38, -10, -33, -34, -30], 2.2, BLK[3], BLK[5]);
  tube(g, [-10, -24, -26, -31], 1.8, BLK[3]);
  // (the engine: cases, the clutch cover, the cylinder and its fins)
  shape(g, [[-9, -25], [8, -27], [10, -14], [-8, -11]], ALU[2]);
  box(g, -8, -24, 16, 2, ALU[4]); box(g, -7, -15, 16, 2, ALU[0]);
  g.fillStyle = INK; g.beginPath(); g.arc(1, -19, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = ALU[3]; g.beginPath(); g.arc(1, -19, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = ALU[5]; g.beginPath(); g.arc(0, -20, 1.5, 0, Math.PI * 2); g.fill();
  for (const [bx, by] of [[-2, -22], [4, -22], [-2, -16], [4, -16]] as const) box(g, bx, by, 1, 1, ALU[0]);
  shape(g, [[0, -36], [9, -37], [10, -26], [1, -25]], BLK[3]);
  for (let k = 0; k < 5; k++) { box(g, 0, -35 + k * 2, 10, 1, BLK[5]); box(g, 0, -34 + k * 2, 10, 1, BLK[1]); }
  // (the exhaust: the header out the front, curling under, back up the right side into the silencer)
  tube(g, [9, -31, 14, -24, 11, -16, 2, -10, -10, -16, -18, -26], 2.4, ALU[3], ALU[5]);
  shape(g, [[-18, -29], [-37, -33], [-38, -27], [-19, -24]], ALU[3]);
  box(g, -36, -32, 17, 1, ALU[5]); box(g, -36, -28, 17, 1, ALU[1]);
  shape(g, [[-38, -33], [-41, -32], [-41, -28], [-38, -27]], BLK[1]);
  box(g, -41, -31, 2, 2, INK);
  // (the rear fender up and back; the side plate with the number)
  shape(g, [[-6, -37], [-42, -36], [-41, -32], [-6, -32]], C[3]);
  box(g, -40, -36, 34, 1, C[5]); box(g, -40, -33, 34, 1, C[1]);
  shape(g, [[-24, -36], [-8, -36], [-6, -27], [-20, -26]], plate);
  box(g, -22, -35, 13, 1, plateHi);
  plateNum(g, -14, -30, num, facing);
  // (the seat: ribbed, a seam)
  shape(g, [[-26, -38], [2, -42], [3, -38], [-26, -35]], BLK[2]);
  for (let k = 0; k < 6; k++) box(g, -22 + k * 4, -40 + k * -0.5, 1, 3, BLK[4]);
  box(g, -24, -38, 24, 1, BLK[5]);
  // (the tank and the radiator shroud in the bike's color, a graphic slash, the radiator's fins behind)
  box(g, 4, -36, 9, 9, INK); box(g, 5, -35, 7, 7, BLK[3]); for (let k = 0; k < 3; k++) box(g, 5, -34 + k * 2, 7, 1, BLK[5]);
  shape(g, [[0, -41], [14, -44], [17, -34], [12, -26], [4, -29], [1, -35]], C[3]);
  shape(g, [[1, -40], [13, -43], [14, -40], [2, -37]], C[4], false);
  box(g, 2, -41, 9, 1, C[5]);
  shape(g, [[6, -32], [15, -38], [16, -35], [9, -29]], mix(color, '#FFFFFF', 0.85), false);
  box(g, 12, -28, 4, 2, C[1]);
  // (the forks: gold tubes into the lowers, a guard, the axle)
  tube(g, [16, -46, 21, -26], 3.4, GOLDF[3], GOLDF[5]);
  tube(g, [21, -26, 24, -12], 3.8, BLK[3], BLK[5]);
  shape(g, [[19, -27], [24, -27], [26, -16], [22, -16]], C[3]);
  // (the high front fender, the bars (a pad on the crossbar), grips, a lever)
  shape(g, [[14, -32], [38, -30], [36, -26], [16, -28]], C[3]);
  box(g, 16, -31, 20, 1, C[5]); box(g, 17, -28, 18, 1, C[1]);
  tube(g, [16, -46, 13, -52, 6, -52], 1.8, BLK[4]);
  box(g, 10, -52, 6, 3, INK); box(g, 11, -51, 4, 1, C[3]);
  box(g, 3, -54, 5, 4, INK); box(g, 4, -53, 3, 2, BLK[2]);
  g.strokeStyle = ALU[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(9, -52); g.lineTo(3, -49); g.stroke();
  // (the front plate, the number)
  shape(g, [[13, -46], [24, -48], [26, -36], [15, -34]], plate);
  box(g, 15, -46, 8, 1, plateHi);
  plateNum(g, 19.5, -41, num, facing);
  // (mud flung up it)
  for (let k = 0; k < 18; k++) { const mx = -36 + ((k * 37) % 72), my = -12 - ((k * 13) % 18); box(g, mx, my, 2, 1, MUD[k % 3]); }
  checker(g, 15, -30, 18, 2, MUD[1], 0, 3);
};

/**
 * A dirt bike, its ground point (between the wheels) at (x, y), facing 1 right / -1 left, `s` its size (a lane's),
 * `tilt` its front wheel up (negative), `spin` its wheels' turn. The seat's at (-11, -34) from there (times s).
 */
export const drawDirtBike = (c: Ctx, x: number, y: number, facing: number, s: number, tilt: number, spin: number, color: string, num: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  // (its shadow on the ground, under the tilt)
  c.globalAlpha = 0.28; c.fillStyle = '#000000'; c.beginPath(); c.ellipse(0, 0, 36 * s, 3 * s, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  c.scale(facing * s, s);
  // (a wheelie pivots on the back wheel)
  c.translate(-24, -11); c.rotate(tilt); c.translate(24, 11);
  wheel(c, -24, -11, 11, spin, false); wheel(c, 24, -11, 11, spin, true);
  still(c, `wd-bike-${color}-${num}-${facing > 0 ? 1 : -1}`, -44, -58, 86, 52, g => paintBike(g, color, num, facing > 0 ? 1 : -1));
  c.restore();
};

/** A kid's moto helmet over their head (head's middle at (hx, hy), facing right in the caller's space): the shell
 *  stepped, a stripe, the peak out over the eyes, the chin bar, goggles up on it with their strap. */
const helmet = (c: Ctx, hx: number, hy: number, col: string) => {
  const H = rampOf(col);
  c.fillStyle = INK; c.beginPath(); c.arc(hx, hy - 1, 11.6, Math.PI * 0.8, Math.PI * 2.25); c.closePath(); c.fill();
  c.fillStyle = H[2]; c.beginPath(); c.arc(hx, hy - 1, 10.4, Math.PI * 0.8, Math.PI * 2.25); c.closePath(); c.fill();
  c.fillStyle = H[3]; c.beginPath(); c.arc(hx - 1, hy - 2, 9, Math.PI * 0.9, Math.PI * 2.1); c.closePath(); c.fill();
  c.fillStyle = H[4]; c.beginPath(); c.arc(hx - 3, hy - 4, 5, Math.PI, Math.PI * 1.7); c.lineTo(hx - 3, hy - 4); c.fill();
  c.fillStyle = H[5]; c.fillRect(hx - 6, hy - 9, 3, 1);
  // (a stripe over the top in a contrast color)
  const stripe = col === '#F8FAFC' ? '#DC2626' : '#F8FAFC';
  c.fillStyle = stripe; c.fillRect(hx - 3, hy - 11, 3, 9); c.fillStyle = mix(stripe, '#000000', 0.25); c.fillRect(hx, hy - 11, 1, 9);
  // (the peak out over the eyes)
  c.fillStyle = INK; c.beginPath(); c.moveTo(hx + 3, hy - 9); c.lineTo(hx + 17, hy - 7); c.lineTo(hx + 15, hy - 3); c.lineTo(hx + 3, hy - 4); c.closePath(); c.fill();
  c.fillStyle = H[3]; c.beginPath(); c.moveTo(hx + 4, hy - 8); c.lineTo(hx + 15.6, hy - 6.4); c.lineTo(hx + 14.2, hy - 4); c.lineTo(hx + 4, hy - 5); c.closePath(); c.fill();
  c.fillStyle = H[5]; c.fillRect(hx + 5, hy - 8, 9, 1);
  // (the chin bar, its vents)
  c.fillStyle = INK; c.fillRect(hx + 4, hy + 4, 10, 6);
  c.fillStyle = H[2]; c.fillRect(hx + 5, hy + 5, 8, 4); c.fillStyle = H[4]; c.fillRect(hx + 5, hy + 5, 8, 1);
  c.fillStyle = BLK[1]; c.fillRect(hx + 10, hy + 6, 1, 2); c.fillRect(hx + 12, hy + 6, 1, 2);
  // (goggles up on it: the strap, the frame, the lens catching the sky)
  c.fillStyle = BLK[2]; c.fillRect(hx - 10, hy - 6, 19, 3);
  c.fillStyle = INK; c.fillRect(hx + 2, hy - 8, 8, 5);
  c.fillStyle = '#F59E0B'; c.fillRect(hx + 3, hy - 7, 6, 3); c.fillStyle = '#FDE68A'; c.fillRect(hx + 3, hy - 7, 3, 1); c.fillStyle = '#B45309'; c.fillRect(hx + 3, hy - 5, 6, 1);
};
/** A helmetless kid's headgear, by the seed: a ball cap on backwards, a beanie, or just their hair. */
const headgear = (c: Ctx, hx: number, hy: number, seed: number) => {
  const kind = Math.floor(seed / 5) % 3, col = CAPS[Math.floor(seed / 7) % CAPS.length], R = rampOf(col);
  if (kind === 0) {
    c.fillStyle = INK; c.beginPath(); c.arc(hx, hy - 3, 9.6, Math.PI, Math.PI * 2); c.closePath(); c.fill();
    c.fillStyle = R[3]; c.beginPath(); c.arc(hx, hy - 3, 8.6, Math.PI, Math.PI * 2); c.closePath(); c.fill();
    c.fillStyle = R[4]; c.fillRect(hx - 6, hy - 10, 5, 2);
    c.fillStyle = INK; c.fillRect(hx - 15, hy - 5, 9, 3); c.fillStyle = R[2]; c.fillRect(hx - 14, hy - 4, 8, 1);
    c.fillStyle = R[1]; c.fillRect(hx - 9, hy - 3, 4, 1);
  } else if (kind === 1) {
    c.fillStyle = INK; c.beginPath(); c.arc(hx, hy - 2, 10, Math.PI * 1.02, Math.PI * 1.98); c.lineTo(hx + 10, hy - 1); c.lineTo(hx - 10, hy - 1); c.closePath(); c.fill();
    c.fillStyle = R[3]; c.beginPath(); c.arc(hx, hy - 2, 9, Math.PI * 1.02, Math.PI * 1.98); c.lineTo(hx + 9, hy - 2); c.lineTo(hx - 9, hy - 2); c.closePath(); c.fill();
    c.fillStyle = R[2]; c.fillRect(hx - 9, hy - 4, 18, 2); c.fillStyle = R[4]; for (let k = 0; k < 6; k++) c.fillRect(hx - 8 + k * 3, hy - 9, 1, 4);
  }
};

/** A kid (not on a bike): their feet at the origin, facing right; the pose people.ts has. */
export const drawTeenPerson = (c: Ctx, k: Teen, f: number, pose: Pose, mood: Kid['mood'], talking: boolean, s = 1) => {
  c.save(); c.scale(s * 0.9, s * 0.9);
  const look = { face: k.seed % 4 === 3 ? 3 : 0, bald: false, kid: true, ...(k.helmet ? { shirt: JERSEYS[Math.floor(k.seed / 2) % JERSEYS.length] } : {}) };
  drawPerson(c, { seed: k.seed, woman: k.woman, outfit: 'guest', f, pose, mood, talking, look });
  const hy = -66 + (pose === 'sit' ? 18 : 0);
  if (k.helmet) helmet(c, 1, hy, k.helmet); else headgear(c, 1, hy, k.seed);
  c.restore();
};

/** A kid off their bike, in the world. */
export const drawKid = (c: Ctx, k: Kid, f: number, talking: boolean) => {
  c.save(); c.translate(Math.round(k.x), Math.round(k.y)); c.scale(k.facing, 1);
  if (k.mode === 'fly') { c.translate(0, -30); c.rotate(k.rot); c.translate(0, 30); }
  drawTeenPerson(c, k, f, k.mode === 'fly' ? 'fly' : k.mode === 'sit' ? 'sit' : 'stand', k.mood, talking, LANES[k.lane].s);
  c.restore();
};

/** A bike and whoever's on it (him: the engine draws him; this is only his bike). `tuck`: how to draw Tucker on it. */
export const drawBike = (c: Ctx, state: GameState, b: Bike, talking: boolean, tuck?: { pose: 'ride' | 'ridepoint'; opts: TuckerOpts }) => {
  // (under him: a touch lower, for his seated pose's seat)
  const L = LANES[b.lane], s = L.s, y = L.y + b.hop + (b.rider === 'meathead' ? 4 : 0), f = state.frame;
  drawDirtBike(c, b.x, y, b.facing, s, b.tilt, b.spin, b.color, b.num);
  if (b.rider && b.rider !== 'meathead') {
    c.save(); c.translate(Math.round(b.x), Math.round(y)); c.scale(b.facing, 1);
    c.translate(-24 * s, -11 * s); c.rotate(b.tilt); c.translate(24 * s, 11 * s);
    if (b.rider === 'tucker') {
      drawTucker(c, -11 * s, -4 * s, 1, f, tuck?.pose ?? 'ride', tuck?.opts);
    } else {
      c.save(); c.translate(-9 * s, -22 * s);
      drawTeenPerson(c, b.rider, f + b.t, 'sit', 'happy', talking, s);
      c.restore();
    }
    c.restore();
  }
  // (exhaust, ticking over: stepped puffs off the silencer)
  if (Math.abs(b.vx) > 0.5 || b.rev) {
    const ex = b.x - b.facing * 40 * s, ey = y - 30 * s;
    for (let i = 0; i < 3; i++) {
      const t = ((f * 0.07 + i / 3) % 1);
      c.globalAlpha = 0.5 * (1 - t); pixelBlob(c, ex - b.facing * t * 26, ey - t * 10, (2 + t * 5) * s, (1.6 + t * 4) * s, t < 0.3 ? '#8A8680' : '#BEBAB2'); c.globalAlpha = 1;
    }
  }
};
