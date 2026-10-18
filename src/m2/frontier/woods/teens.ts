// The local kids on dirt bikes (outside the park: real teenagers, not staff): boys and girls, every skin, thin and
// heavy, hair of every sort, helmets or not, each one seeded (people.ts's drawer, its look kept young: no beards, no
// bald heads); and their bikes (crude: knobby tires, high fenders, a number plate, a color each). Job 6's TEENAGERS can
// draw theirs from here (drawDirtBike, drawTeen, teenOf).

import type { GameState } from '../../../m1/game/core/state';
import { drawPerson, type Pose } from '../../adventure/temple/people';
import { drawTucker, type TuckerOpts } from '../tucker';
import { box, INK, mix, type Ctx } from '../kit';
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

const wheel = (c: Ctx, x: number, y: number, r: number, spin: number) => {
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + 1, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#27272A'; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  // (the knobs round the tread, turning)
  c.fillStyle = '#3F3F46';
  for (let i = 0; i < 10; i++) { const a = spin + (i / 10) * Math.PI * 2; c.fillRect(x + Math.cos(a) * (r - 1) - 1, y + Math.sin(a) * (r - 1) - 1, 2, 2); }
  c.fillStyle = '#A1A1AA'; c.beginPath(); c.arc(x, y, r * 0.55, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#52525B'; c.lineWidth = 1;
  for (let i = 0; i < 3; i++) { const a = spin + (i / 3) * Math.PI; c.beginPath(); c.moveTo(x - Math.cos(a) * r * 0.5, y - Math.sin(a) * r * 0.5); c.lineTo(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5); c.stroke(); }
  c.fillStyle = '#D4D4D8'; c.fillRect(x - 1.5, y - 1.5, 3, 3);
};
const tube = (c: Ctx, pts: number[], w: number, col: string) => {
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.strokeStyle = INK; c.lineWidth = w + 2; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.stroke();
  c.lineCap = 'butt';
};

/**
 * A dirt bike, its ground point (between the wheels) at (x, y), facing 1 right / -1 left, `s` its size (a lane's),
 * `tilt` its front wheel up (negative), `spin` its wheels' turn. The seat's at (-11, -34) from there (times s).
 */
export const drawDirtBike = (c: Ctx, x: number, y: number, facing: number, s: number, tilt: number, spin: number, color: string, num: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(facing * s, s);
  // (a wheelie pivots on the back wheel)
  c.translate(-24, -11); c.rotate(tilt); c.translate(24, 11);
  const dk = mix(color, '#000000', 0.3), lt = mix(color, '#FFFFFF', 0.35);
  wheel(c, -24, -11, 11, spin); wheel(c, 24, -11, 11, spin);
  // (the swingarm, the frame, the forks)
  tube(c, [-24, -11, -4, -18], 3, '#52525B');
  tube(c, [-4, -18, -10, -30, 10, -34, 16, -44], 2.6, '#3F3F46');
  tube(c, [24, -11, 15, -45], 2.6, '#D4D4D8');
  // (the engine, the exhaust up and back)
  box(c, -7, -26, 15, 13, INK); box(c, -6, -25, 13, 11, '#52525B'); box(c, -6, -25, 13, 2, '#71717A');
  tube(c, [2, -16, -10, -22, -30, -27], 2.4, '#A1A1AA');
  box(c, -34, -30, 6, 5, INK); box(c, -33, -29, 4, 3, '#71717A');
  // (the rear fender up and back, the seat, the tank and its side panel)
  c.fillStyle = INK; c.beginPath(); c.moveTo(-6, -34); c.lineTo(-38, -32); c.lineTo(-37, -28); c.lineTo(-6, -29); c.closePath(); c.fill();
  c.fillStyle = color; c.beginPath(); c.moveTo(-6, -33); c.lineTo(-36, -31); c.lineTo(-35.6, -29); c.lineTo(-6, -30); c.closePath(); c.fill();
  box(c, -22, -37, 20, 5, INK); box(c, -21, -36, 18, 3, '#1C1917');
  c.fillStyle = INK; c.beginPath(); c.moveTo(-4, -38); c.lineTo(12, -40); c.lineTo(14, -32); c.lineTo(-2, -29); c.closePath(); c.fill();
  c.fillStyle = color; c.beginPath(); c.moveTo(-3, -37); c.lineTo(11, -39); c.lineTo(13, -33); c.lineTo(-2, -30); c.closePath(); c.fill();
  box(c, -1, -36, 10, 1, lt); box(c, 0, -32, 11, 1, dk);
  // (the high front fender, the number plate, the bars and their grips)
  c.fillStyle = INK; c.beginPath(); c.moveTo(14, -30); c.lineTo(36, -28); c.lineTo(34, -25); c.lineTo(16, -26); c.closePath(); c.fill();
  c.fillStyle = color; c.beginPath(); c.moveTo(15, -29); c.lineTo(34.4, -27.4); c.lineTo(33, -26); c.lineTo(16, -27); c.closePath(); c.fill();
  c.fillStyle = INK; c.beginPath(); c.ellipse(19, -40, 6, 5, -0.3, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#F8FAFC'; c.beginPath(); c.ellipse(19, -40, 5, 4, -0.3, 0, Math.PI * 2); c.fill();
  c.save(); c.translate(19, -38.5); c.scale(facing, 1);
  c.fillStyle = INK; c.font = '5px "Press Start 2P"'; c.textAlign = 'center'; c.fillText(String(num), 0, 0); c.textAlign = 'left';
  c.restore();
  tube(c, [16, -44, 12, -50, 7, -50], 1.8, '#3F3F46');
  box(c, 4, -52, 5, 4, INK); box(c, 5, -51, 3, 2, '#18181B');
  c.restore();
};

/** A kid's helmet over their head (head's middle at (hx, hy), facing right in the caller's space). */
const helmet = (c: Ctx, hx: number, hy: number, col: string) => {
  const dk = mix(col, '#000000', 0.35);
  c.fillStyle = INK; c.beginPath(); c.arc(hx, hy - 1, 11.4, Math.PI * 0.85, Math.PI * 2.2); c.closePath(); c.fill();
  c.fillStyle = col; c.beginPath(); c.arc(hx, hy - 1, 10.4, Math.PI * 0.85, Math.PI * 2.2); c.closePath(); c.fill();
  // (a stripe over the top; the peak out over the eyes; the chin bar)
  c.fillStyle = dk; c.fillRect(hx - 2, hy - 11, 4, 8);
  c.fillStyle = INK; c.beginPath(); c.moveTo(hx + 4, hy - 8); c.lineTo(hx + 16, hy - 6); c.lineTo(hx + 14, hy - 3); c.lineTo(hx + 4, hy - 4); c.closePath(); c.fill();
  c.fillStyle = col; c.beginPath(); c.moveTo(hx + 5, hy - 7); c.lineTo(hx + 14.6, hy - 5.6); c.lineTo(hx + 13.4, hy - 4); c.lineTo(hx + 5, hy - 5); c.closePath(); c.fill();
  c.fillStyle = INK; c.fillRect(hx + 5, hy + 5, 8, 4);
  c.fillStyle = dk; c.fillRect(hx + 5.5, hy + 5.5, 7, 3);
  // (goggles up on it, their strap)
  c.fillStyle = '#18181B'; c.fillRect(hx - 9, hy - 5, 18, 2.4);
  c.fillStyle = '#FBBF24'; c.fillRect(hx + 3, hy - 6, 5, 3.4);
};

/** A kid (not on a bike): their feet at the origin, facing right; the pose people.ts has. */
export const drawTeenPerson = (c: Ctx, k: Teen, f: number, pose: Pose, mood: Kid['mood'], talking: boolean, s = 1) => {
  c.save(); c.scale(s * 0.9, s * 0.9);
  drawPerson(c, { seed: k.seed, woman: k.woman, outfit: 'guest', f, pose, mood, talking, look: { face: k.seed % 4 === 3 ? 3 : 0, bald: false, kid: true } });
  if (k.helmet) helmet(c, 1, -66 + (pose === 'sit' ? 18 : 0), k.helmet);
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
  // (exhaust, ticking over)
  if (Math.abs(b.vx) > 0.5 || b.rev) {
    const ex = b.x - b.facing * 34 * s, ey = y - 27 * s;
    c.globalAlpha = 0.45; c.fillStyle = '#A8A29E';
    for (let i = 0; i < 3; i++) { const t = ((f * 0.07 + i / 3) % 1); c.beginPath(); c.arc(ex - b.facing * t * 26, ey - t * 10, (2 + t * 5) * s, 0, Math.PI * 2); c.fill(); }
    c.globalAlpha = 1;
  }
};
