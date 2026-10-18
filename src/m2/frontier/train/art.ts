// The train and what goes by it, drawn (the final pass: peak SNES; the cars' own drawing is carArt.ts, the far off
// far.ts). Here: the trackside behind the train (the embankment going by, the telegraph poles whipping past with their
// glass insulators and sagging wires, the inside of a tunnel (passers.ts), the ballast, the ties, the rails the wheels
// sit on), each frame's cars (opened up if he's inside one; the ones he only crosses; their trucks on the rails; the
// lamps swinging), the cut's warning and the switch stand it goes off the line at, the wrecks, the cars' lights.
//
// The cars (big, the playtest's): every floor, roof, load, step and fitting he can stand on has its lit top lip
// (standable reads standable). The grades tilt the whole view (index.ts worldTilt): the train stays on its rails.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { playSound } from '../../../m1/game/platform/audio';
import { label } from '../section';
import { GY } from '../geometry';
import { type Ctx, box, checker, mix, hash, INK, still, stillAt, N, post, STEEL, DIRT, GRASS, STONE, PLANK, BRASS, near, skyAt, timeOfDay, puff } from './paint';
import { trainOf } from './state';
import { CARS, CAR_X, RAIL, DECK, ROOF, CEIL, COUPLER, END, TOP, ENTERABLE, ENGINE } from './layout';
import { carXNow, insideCar, offOf } from './where';
import { drawTunnelInside, BERM_Y } from './passers';
import { viewOf, inView } from './view';
import { WR, windows, WIN_T, WIN_H, truck, drawBase, drawExt, drawInt, drawTop, drawCarLive, drawLamp, drawWreckCar } from './carArt';

export { drawScenery } from './far';

// ---------------------------------------------------------------------------------------------------------------
// Behind the train: the far embankment, the telegraph poles, the inside of a tunnel, the ballast, the ties, the rails

/** The embankment behind the line (a tile, slid along by how far the world's gone): dirt and cinders in bands, darker
 *  down toward the rails, stones and tufts, grass along its top (stood back, dimmed: not somewhere to stand). */
const BW = 280;
const paintBerm = (g: Ctx) => {
  const tod = timeOfDay(), haze = skyAt(0.9, tod), h = GY - BERM_Y;
  const D = near(DIRT).map(c => mix(c, haze, 0.1)), G = near(GRASS).map(c => mix(c, haze, 0.14)), S = near(STONE).map(c => mix(c, haze, 0.1));
  const bands = [D[4], D[3], D[3], D[2], D[2], D[1]];
  bands.forEach((col, i) => box(g, 0, (i * h) / bands.length, BW, h / bands.length + 1, col));
  for (let i = 1; i < bands.length; i++) checker(g, 0, (i * h) / bands.length - 1, BW, 2, bands[i - 1], i % 2);
  for (let i = 0; i < 26; i++) { const x = hash(i * 3.1) * BW, y = 10 + hash(i * 7.7) * (h - 16), r = 2 + hash(i) * 3; box(g, x - 1, y - 1, r * 2 + 2, r + 2, D[0]); box(g, x, y, r * 2, r, S[4]); box(g, x, y, r, 1, S[6]); }
  for (let i = 0; i < 40; i++) box(g, hash(i * 1.9) * BW, 6 + hash(i * 5.3) * (h - 10), 2, 1, D[5]);
  // (the grass along its top, tufts hanging over)
  box(g, 0, -4, BW, 8, G[2]); box(g, 0, -4, BW, 2, G[3]);
  for (let x = 0; x < BW; x += 5) { const th = 3 + hash(x * 0.7) * 6; box(g, x, -4 - th, 2, th, x % 10 ? G[3] : G[4]); box(g, x + 1, 4, 1, 2 + (x % 4), G[2]); }
};

/** A telegraph pole (cedar, weathered, its crossarm and green glass insulators on their pins), its foot at BERM_Y. */
const PTOP = ROOF - 150;
const paintPole = (g: Ctx) => {
  const P = near(['#1E140C', '#2E2014', '#40301E', '#56422A', '#6E5838', '#8A7250', '#A88E6A']);
  post(g, 3, 0, BERM_Y - PTOP, 7, P);
  for (let y = 30; y < BERM_Y - PTOP - 20; y += 26) box(g, 1, y, 4, 1, P[1]);
  box(g, -24, 7, 54, 7, INK); box(g, -23, 8, 52, 5, P[3]); box(g, -23, 8, 52, 1, P[5]); box(g, -23, 12, 52, 1, P[1]);
  for (const ix of [-20, -8, 14, 26]) { box(g, ix, 2, 2, 6, P[2]); box(g, ix - 2, -3, 6, 6, INK); box(g, ix - 1, -2, 4, 4, '#3A8A6A'); box(g, ix - 1, -2, 1, 2, '#9AE8C8'); }
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(-10, 13); g.lineTo(3, 24); g.lineTo(16, 13); g.stroke();
};

/** The ballast and the ties, a tile 144 wide (four ties: grained, their ends lit, the spikes), the cinders between. */
const TW = 144;
const paintTies = (g: Ctx) => {
  const S = near(STONE), P = near(['#1A120C', '#2A1E14', '#3C2C1E', '#4E3A28', '#624A34', '#7A5E44']);
  box(g, 0, 0, TW, 18, S[2]);
  for (let i = 0; i < 70; i++) { const x = hash(i * 2.3) * TW, y = hash(i * 4.1) * 16; box(g, x, y, 2, 2, i % 3 ? S[3] : S[5]); box(g, x, y + 2, 2, 1, S[1]); }
  for (let k = 0; k < 4; k++) {
    const tx = k * 36 + 2;
    box(g, tx - 1, 1, 14, 12, INK); box(g, tx, 2, 12, 10, P[3]); box(g, tx, 2, 12, 2, P[5]); box(g, tx + 10, 2, 2, 10, P[1]);
    for (let y = 5; y < 11; y += 3) box(g, tx + 2 + ((y + k) % 4), y, 5, 1, P[2]);
    box(g, tx + 2, 2, 2, 2, '#26262C'); box(g, tx + 8, 2, 2, 2, '#26262C');
  }
};

export const drawTrackside = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), v = viewOf(state), a = v.x - 220, b = v.x + v.w + 220;
  // (the embankment)
  for (let x = Math.floor((a + tr.dist) / BW) * BW - tr.dist; x < b; x += BW) stillAt(c, 'tr-berm', x, BERM_Y, 0, -14, BW, GY - BERM_Y + 16, paintBerm);
  // (the telegraph poles whipping by, their wires sagging between)
  const P = 560, sp = tr.dist * 0.9;
  const xs: number[] = [];
  for (let x = Math.floor((a - P + sp) / P) * P - sp; x < b + P; x += P) xs.push(x);
  c.strokeStyle = 'rgba(28, 18, 9, 0.7)'; c.lineWidth = 1;
  for (const dy of [-1, 1]) for (let k = 0; k + 1 < xs.length; k++) {
    for (const ix of dy < 0 ? [-19, -7] : [15, 27]) { c.beginPath(); c.moveTo(xs[k] + ix, PTOP - 2); c.quadraticCurveTo((xs[k] + xs[k + 1]) / 2 + ix, PTOP + 22, xs[k + 1] + ix, PTOP - 2); c.stroke(); }
  }
  for (const x of xs) stillAt(c, 'tr-pole', x, PTOP, -28, -6, 64, BERM_Y - PTOP + 8, paintPole);
  // (a tunnel over the far side)
  drawTunnelInside(c, state);
  // (the ballast and the ties, blurring past; the rails the wheels sit on)
  for (let x = Math.floor((a + tr.dist) / TW) * TW - tr.dist; x < b; x += TW) stillAt(c, 'tr-ties', x, GY - 6, 0, 0, TW, 18, paintTies);
  const S = N(STEEL);
  box(c, a, RAIL - 1, b - a, 6, INK); box(c, a, RAIL, b - a, 4, S[3]); box(c, a, RAIL, b - a, 1, S[6]); box(c, a, RAIL + 1, b - a, 1, S[5]); box(c, a, RAIL + 3, b - a, 1, S[1]);
  for (let x = Math.floor((a + tr.dist) / 72) * 72 - tr.dist; x < b; x += 72) { box(c, x, RAIL + 1, 6, 3, S[2]); box(c, x + 1, RAIL + 1, 1, 1, S[5]); }
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame's cars

/** A car's hanging lamps (where they hang now, swinging). */
const lamps = (i: number, x: number, f: number): [number, number][] => {
  const d = CARS[i];
  return [0.25, 0.5, 0.75].map((k, n) => { const s = Math.sin(f * 0.05 + i + n * 1.3) * 5; return [x + d.len * k + s, CEIL + 46 - Math.abs(s) * 0.3]; });
};

/** Behind everybody: the cars (opened up if he's inside one; the ones he only crosses), their trucks on the rails. */
export const drawCarsBack = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), f = state.frame, roll = tr.dist / WR;
  for (let i = tr.rear; i < CARS.length; i++) {
    if (i === ENGINE || tr.cars[i]?.gone) continue;
    const x = carXNow(tr, i) + (tr.cut && tr.cut.phase === 'tell' && i === tr.cut.k ? tr.shudder : 0), d = CARS[i];
    if (!inView(state, x - COUPLER, x + d.len + COUPLER, 100)) continue;
    for (const tx of [x + 70, x + d.len - 70]) truck(c, tx, roll + i);
    drawBase(c, d.kind, d.len, x);
    const inside = ENTERABLE.includes(d.kind) && insideCar(state, tr, i);
    if (ENTERABLE.includes(d.kind)) {
      if (inside) { drawInt(c, d.kind, d.len, x); for (const [lx, ly] of lamps(i, x, f)) drawLamp(c, lx, ly, f); }
    } else drawTop(c, d.kind, d.len, x);
    drawCarLive(c, d.kind, d.len, x, f, inside);
  }
};

/** In front of the cast: the sides of the cars he isn't in (whoever's in there out of sight); the cut's warning over the
 *  coupling; the switch it'll go off the line at. */
export const drawCarsFront = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), f = state.frame;
  for (let i = tr.rear; i < CARS.length; i++) {
    const d = CARS[i];
    if (!ENTERABLE.includes(d.kind) || tr.cars[i]?.gone) continue;
    const x = carXNow(tr, i) + (tr.cut && tr.cut.phase === 'tell' && i === tr.cut.k ? tr.shudder : 0);
    if (!inView(state, x, x + d.len, 60) || insideCar(state, tr, i)) continue;
    drawExt(c, d.kind, d.len, x);
  }
  // (the cut: a red ! over the coupling, UNCOUPLING!, then JUMP! as it goes)
  const cut = tr.cut;
  if (cut) {
    const cx = CAR_X[cut.k] + CARS[cut.k].len + COUPLER / 2 + offOf(tr, cut.k), y = DECK - 90;
    if (f % 12 < 8 && (cut.phase === 'tell' || cut.off > -260)) {
      c.fillStyle = INK; c.beginPath(); c.arc(cx, y, 15, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#DC2626'; c.beginPath(); c.arc(cx, y, 13, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#F87171'; c.beginPath(); c.arc(cx - 3, y - 4, 6, 0, Math.PI * 2); c.fill();
      label(c, '!', cx + 1, y + 6, '#FEF3C7', 14);
      label(c, cut.phase === 'tell' ? 'UNCOUPLING!' : 'JUMP!', cx, y - 24, '#FDE047', 8);
    }
    // (the switch stand by the line: its lever, its target disc on the mast (green: the main line; red: thrown), the
    // lamp, the points)
    if (cut.sw !== undefined) {
      const sx = cut.sw, red = !!cut.thrown, S = N(STEEL);
      box(c, sx - 40, RAIL, 80, 4, INK); box(c, sx - 40, RAIL + 1, 80, 2, red ? S[6] : S[3]);
      stillAt(c, 'tr-switch', sx + 53, GY, -20, -76, 40, 78, g => {
        box(g, -14, -6, 28, 6, INK); box(g, -13, -5, 26, 5, S[2]); box(g, -13, -5, 26, 1, S[4]);
        box(g, -4, -52, 8, 48, INK); box(g, -3, -52, 6, 48, S[3]); box(g, -3, -52, 2, 48, S[5]);
        box(g, -9, -24, 18, 6, INK); box(g, -8, -23, 16, 4, S[2]);
        box(g, -5, -76, 10, 10, INK); box(g, -4, -75, 8, 8, BRASS[3]); box(g, -2, -73, 4, 4, '#F2D27A');
      });
      c.fillStyle = INK; c.beginPath(); c.arc(sx + 53, GY - 58, 13, 0, Math.PI * 2); c.fill();
      c.fillStyle = red ? '#B91C1C' : '#15803D'; c.beginPath(); c.arc(sx + 53, GY - 58, 11, 0, Math.PI * 2); c.fill();
      c.fillStyle = red ? '#F87171' : '#4ADE80'; c.beginPath(); c.arc(sx + 50, GY - 61, 5, 0, Math.PI * 2); c.fill();
      c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(sx + 53, GY - 14); c.lineTo(sx + 53 + (red ? -16 : 16), GY - 30); c.stroke();
      c.strokeStyle = S[4]; c.lineWidth = 3; c.stroke();
    }
  }
};

/** The wrecks: each cut car slews off the rails at the switch, slides down the near bank and goes over on its side
 *  (wheels up), dust and planks; then left there burning, going by with the ground. */
export const stepWrecks = (state: GameState) => {
  const tr = trainOf(state), v = viewOf(state);
  for (const w of tr.wrecks) {
    w.t++;
    w.vx += (-tr.v - w.vx) * (w.t > 0 ? 0.05 : 0.01);
    w.x += w.vx;
    if (w.t <= 0) continue;
    const k = Math.min(1, w.t / 40);
    w.y = 70 * k * k; w.rot = 0.22 * Math.sin(Math.min(1, w.t / 30) * Math.PI);
    w.tip = Math.min(1, Math.max(0, (w.t - 10) / 34));
    if (w.t < 46 && w.t % 3 === 0) for (let n = 0; n < 3; n++) state.particles.push({ pos: { x: w.x + Math.random() * w.len, y: GY + w.y - 10 }, vel: { x: (Math.random() - 0.5) * 4 - 2, y: -1 - Math.random() * 3 }, life: 30, color: n % 2 ? '#A8977A' : '#8A5A30', size: 3 + Math.random() * 3 });
    if (w.t === 22) playSound('crash', 0.7, -16);
  }
  tr.wrecks = tr.wrecks.filter(w => w.x + w.len > v.x - 300 && w.t < 2000);
};
export const drawWrecks = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), f = state.frame;
  for (const w of tr.wrecks) {
    const top = ENTERABLE.includes(w.kind) ? ROOF - 44 : (TOP[w.kind] ?? DECK - 100) - 20;
    const H = GY - top, flip = Math.cos(w.tip * Math.PI);
    c.save();
    c.translate(w.x + w.len / 2, GY + w.y - H / 2 - 4);
    c.rotate(w.rot);
    c.scale(1, Math.abs(flip) < 0.02 ? 0.02 * Math.sign(flip || 1) : flip);
    c.translate(-w.len / 2, H / 2 - GY);
    drawWreckCar(c, w.kind, w.len, w.t + f * 0, w.seed);
    c.restore();
    // (the smoke off it, rising straight up (it's stopped), drifting back)
    if (w.t > 0) for (let k = 0; k < 4; k++) {
      const t = ((f * 0.012 + k / 4 + w.seed * 0.1) % 1), sx = w.x + w.len * (0.25 + 0.5 * hash(w.seed + k)) - t * 40;
      puff(c, sx, GY + w.y - 120 - t * 200, 10 + t * 26, ['#2A2622', '#3E3832', '#5A524A'], 0.6 * (1 - t));
    }
  }
};

/** The lights in the cars (world), for the lighting (the playtest: muted, no spotlights): the car he's in lit right
 *  through (a soft fill; its lamps' warmth), the others only a dim glow at their windows; the caboose's marker. */
export const carLamps = (state: GameState): Light[] => {
  const tr = trainOf(state), f = state.frame, out: Light[] = [];
  for (let i = tr.rear; i < CARS.length; i++) {
    const d = CARS[i];
    if (tr.cars[i]?.gone || !ENTERABLE.includes(d.kind)) continue;
    const x = carXNow(tr, i);
    if (!inView(state, x, x + d.len, 200)) continue;
    if (insideCar(state, tr, i)) {
      for (let lx = x + END + 60; lx < x + d.len - END - 30; lx += 110) out.push({ x: lx, y: CEIL + 160, r: 200, a: 0.95 });
      for (const [lx, ly] of lamps(i, x, f)) out.push({ x: lx, y: ly, r: 110, a: 0.3, color: '#4A3818' });
    } else {
      for (const wx of windows(i)) out.push({ x: x + wx, y: WIN_T + WIN_H / 2, r: 44, a: 0.3, color: '#3A2C12' });
    }
    if (d.kind === 'caboose') out.push({ x: x + END - 6, y: CEIL + 106, r: 50, a: 0.35, color: '#5A1A1A' });
  }
  return out;
};
void still; void PLANK;
