// The park's flume (peak SNES): a plank trough on timber trestles, the station to the fault line and on past it (the
// way the ride was meant to go), drawn piece by piece along the track, each piece turned to its slope (the lift hill,
// the big drop) and painted once for the hour in tiles (train/paint still(): cached under the tilt). Behind the log:
// the trough's back wall (planks on studs, a capped rail lit along its top, iron straps, nail heads) and the water in it
// (pool-blue, banded, foam along the wall, the current's streaks running on with the flow); in front: the water's front
// over the log's foot (see-through, its lit line rippling) and the near wall (lit cap, planks, straps). Trestles stand
// straight down under it (vertical posts, cross-braced, footed on concrete); the lift hill's chain clanks up the middle.
// Over the fault line, once it breaks: both ends splintered and sagging into the chasm, the water pouring off them.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { GY } from '../geometry';
import { onScreen } from '../kit';
import { type Ctx, box, checker, mix, hash, still, INK, hr, PLANK, STEEL, CONCRETE, POOL } from './paint';
import { X, Y, waterY, TRACK, PLATFORM_END, CHASM } from './layout';
import { rideOf } from './state';

/** (hazards.ts's beat: the flume over the crack goes at BREAK_AT frames after the giant saw lets go) */
export const BREAK_AT = 50;
/** How far on the flume's drawn past the fault line (the way the ride was meant to go). */
export const FLUME_END = 6400;

/** The flume's waterline at x: the ride's own (TRACK) up to the fault line, and past it where the ride was meant to go
 *  on (on the level, behind the chasm). */
export const flumeY = (rx: number) => (rx < CHASM.a ? waterY(rx) : Y(-60));
/** The flume's gone over the chasm, once the ground's broken under it. */
const broken = (state: GameState) => rideOf(state).cutT >= BREAK_AT;
const GAP_A = CHASM.a - 20, GAP_B = CHASM.b + 10;

/** The pieces: straight runs [from, to] (x from the section's start). */
const PIECES: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (const [a, b] of TRACK) { if (b <= PLATFORM_END || a >= CHASM.a) continue; out.push([Math.max(a, PLATFORM_END), Math.min(b, CHASM.a)]); }
  out.push([CHASM.a, FLUME_END]);
  return out;
})();

const T = 120;

/** The back wall and the water seen in the trough (local: the waterline along y 0, the piece's x along x). */
const paintBack = (g: Ctx, v: number) => {
  const P = hr('plank', PLANK, 0.16), S = hr('steel', STEEL, 0.16), Wt = hr('pool', POOL, 0.12);
  // (the wall: planks laid along on studs, darker (its inside face, in the trough's shade))
  box(g, 0, -37, T, 41, INK);
  for (let y = -34, i = 0; y < 4; y += 8, i++) {
    box(g, 0, y, T, 8, i % 2 ? P[2] : P[3]); box(g, 0, y, T, 1, P[4]); box(g, 0, y + 7, T, 1, P[1]);
    for (let j = 0; j < 3; j++) box(g, hash(v * 9 + i * 5 + j) * T, y + 3, 10 + hash(v + i + j * 3) * 26, 1, P[1]);
    const joint = (i * 53 + v * 37) % T; box(g, joint, y, 1, 8, P[0]);
  }
  for (let x = 6; x < T; x += 40) { box(g, x, -34, 5, 34, P[1]); box(g, x, -34, 1, 34, P[3]); for (let y = -30; y < 0; y += 8) box(g, x + 2, y, 1, 1, S[5]); }
  // (the cap rail along its top, lit)
  box(g, 0, -37, T, 4, P[4]); box(g, 0, -37, T, 1, P[6]); box(g, 0, -34, T, 1, P[2]);
  // (an iron strap down it)
  box(g, 60 + (v % 2) * 20, -34, 4, 36, S[2]); box(g, 60 + (v % 2) * 20, -34, 1, 36, S[4]);
  // (the water inside: banded, pale at its top where the light gets in, the foam line along the wall)
  const W = [Wt[6], Wt[5], Wt[4], Wt[4], Wt[3]];
  for (let i = 0; i < W.length; i++) { box(g, 0, -4 + i * 2.6, T, 3, W[i]); if (i) checker(g, 0, -4 + i * 2.6 - 1, T, 2, W[i - 1], i % 2); }
  for (let x = 0; x < T; x += 6) box(g, x + hash(v + x) * 3, -5, 4, 1, Wt[8]);
};

/** The near wall (local: its top just under the waterline). */
const paintFront = (g: Ctx, v: number) => {
  const P = hr('plank', PLANK, 0.16), S = hr('steel', STEEL, 0.16);
  box(g, 0, 2, T, 24, INK);
  for (let y = 6, i = 0; y < 25; y += 6, i++) {
    box(g, 0, y, T, 6, i % 2 ? P[4] : P[3]); box(g, 0, y, T, 1, P[5]); box(g, 0, y + 5, T, 1, P[2]);
    for (let j = 0; j < 3; j++) box(g, hash(v * 7 + i * 3 + j) * T, y + 2, 8 + hash(v + i * 2 + j) * 24, 1, P[2]);
    const joint = (i * 41 + v * 29 + 17) % T; box(g, joint, y, 1, 6, P[1]);
  }
  // (the cap: a lit top rail over the planks)
  box(g, 0, 3, T, 4, P[5]); box(g, 0, 3, T, 1, P[6]); box(g, 0, 6, T, 1, P[2]);
  // (the foot shaded, iron straps with their bolts)
  box(g, 0, 23, T, 2, P[1]); checker(g, 0, 21, T, 2, P[2], v % 2);
  for (const sx of [24, 84]) { box(g, sx, 3, 5, 22, S[2]); box(g, sx, 3, 1, 22, S[5]); box(g, sx + 4, 3, 1, 22, S[1]); box(g, sx + 2, 9, 1, 1, S[6]); box(g, sx + 2, 19, 1, 1, S[6]); }
};

/** For each piece on screen: its frame (origin at its start's waterline, turned to its slope) and the run of it on
 *  screen (u from..to along it). */
const eachPiece = (state: GameState, fn: (a: number, b: number, len: number, ang: number, u0: number, u1: number) => void) => {
  const cl = state.camera.x - 120, cr = state.camera.x + CANVAS_WIDTH + 120;
  for (const [a, b] of PIECES) {
    const xa = X(a), xb = X(b);
    if (xb + 40 < cl || xa - 40 > cr) continue;
    const ya = flumeY(a), yb = flumeY(b - 0.01), ang = Math.atan2(yb - ya, xb - xa), len = Math.hypot(xb - xa, yb - ya), k = Math.cos(ang);
    // (each piece runs on a little past its ends, under the next: no wedge open at the bends)
    const s = a === PLATFORM_END ? 0 : -JOIN, e = b === FLUME_END ? len : len + JOIN;
    const u0 = Math.max(s, (cl - xa) / k), u1 = Math.min(e, (cr - xa) / k);
    if (u1 <= u0) continue;
    c0.save(); fn(a, b, len, ang, u0, u1); c0.restore();
  }
};
const JOIN = 30;
/** The tiles over u0..u1 (each clipped to the run). */
const tiles = (c: Ctx, a: number, u0: number, u1: number, draw: (v: number) => void) => {
  for (let u = Math.floor(u0 / T) * T; u < u1; u += T) {
    const v = ((Math.floor((a + u) / T) % 3) + 3) % 3, l = Math.max(u, u0), r = Math.min(u + T, u1);
    c.save(); c.beginPath(); c.rect(l, -80, r - l + 0.5, 160); c.clip(); c.translate(u, 0); draw(v); c.restore();
  }
};
let c0: Ctx;

/** The broken gap, local to a piece (u range), if it's in it. */
const gapIn = (a: number, ang: number): [number, number] | null => (a === CHASM.a ? [(X(GAP_A) - X(a)) / Math.cos(ang), (X(GAP_B) - X(a)) / Math.cos(ang)] : null);
/** Clip out the broken gap (local), if it's gone. */
const clipGap = (c: Ctx, state: GameState, a: number, ang: number) => {
  const gp = gapIn(a, ang);
  if (!gp || !broken(state)) return;
  c.beginPath(); c.rect(-200, -600, 3000, 1200); c.rect(gp[0], -600, gp[1] - gp[0], 1200); c.clip('evenodd');
};

export const drawFlumeBack = (c: Ctx, state: GameState) => {
  c0 = c;
  const f = state.frame, Wt = hr('pool', POOL, 0.12), S = hr('steel', STEEL, 0.16), P = hr('plank', PLANK, 0.16), Cn = hr('concrete', CONCRETE, 0.16);
  // ---- the trestles, straight down under it where it's up off the ground (behind the trough)
  for (let rx = Math.max(PLATFORM_END, Math.floor((state.camera.x - 120 - X(0)) / 80) * 80); rx < Math.min(FLUME_END, state.camera.x + CANVAS_WIDTH + 120 - X(0)); rx += 80) {
    const wy = flumeY(rx);
    if (wy >= GY - 30 || (broken(state) && rx >= GAP_A && rx < GAP_B)) continue;
    const x = X(rx), top = wy + 22, ny = Math.min(GY, flumeY(rx + 80) + 90);
    // (a pair of posts, a cross-brace to the next bent, ledger boards, a concrete footing)
    for (const dx of [-7, 5]) { box(c, x + dx - 1, top, 6, GY - top, INK); box(c, x + dx, top, 4, GY - top, P[3]); box(c, x + dx, top, 1, GY - top, P[5]); box(c, x + dx + 3, top, 1, GY - top, P[1]); }
    for (let y = top + 30; y < GY - 20; y += 70) { box(c, x - 10, y, 22, 4, INK); box(c, x - 9, y + 1, 20, 2, P[4]); }
    c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(x, top + 10); c.lineTo(x + 80, ny); c.stroke();
    c.strokeStyle = P[2]; c.lineWidth = 2; c.stroke();
    box(c, x - 11, GY - 8, 24, 8, INK); box(c, x - 10, GY - 7, 22, 7, Cn[4]); box(c, x - 10, GY - 7, 22, 1, Cn[6]);
  }
  // ---- the trough's back wall and its water, piece by piece
  eachPiece(state, (a, b, _len, ang, u0, u1) => {
    c.translate(X(a), flumeY(a)); c.rotate(ang);
    clipGap(c, state, a, ang);
    tiles(c, a, u0, u1, v => still(c, `lr-flumeB-${v}`, 0, -38, T, 50, g => paintBack(g, v)));
    // (the current's streaks running on with the flow, glints)
    for (let u = Math.max(0, u0); u < u1; u += 20) {
      const k = (u + a * 3 + Math.floor(f * 2.4)) % 70;
      if (k < 12) box(c, u + 3, -3, 12, 1, Wt[7]);
      if ((u * 3 + a + Math.floor(f * 1.8)) % 90 < 6) box(c, u + 9, 1, 6, 1, Wt[8]);
    }
    // (the lift hill's chain up the middle, clanking)
    if (a >= 2500 && b <= 3000) for (let u = Math.max(0, u0) - ((f * 1.4) % 14); u < u1; u += 14) { box(c, u, 3, 9, 4, INK); box(c, u + 1, 4, 7, 2, S[4]); box(c, u + 1, 4, 3, 1, S[6]); }
  });
  // ---- broken over the fault line: both ends splintered and sagging into the chasm, the water pouring off them
  if (broken(state) && onScreen(state, X(CHASM.a) - 60, X(CHASM.b) + 60)) {
    const wy = Y(-60);
    for (const [ex, dir] of [[GAP_A, 1], [GAP_B, -1]] as const) {
      for (let k = 0; k < 4; k++) {
        c.save(); c.translate(X(ex) + dir * k * 5, wy - 30); c.rotate(dir * (0.3 + k * 0.15));
        box(c, -3, 0, 7, 42 + k * 6, INK); box(c, -2, 0, 5, 42 + k * 6, P[3]); box(c, -2, 0, 1, 42 + k * 6, P[5]);
        for (let s = 0; s < 3; s++) box(c, -3 + s * 2, 40 + k * 6, 1, 4 + s, P[4]);
        c.restore();
      }
      for (let k = 0; k < 7; k++) { const y = wy + 4 + ((f * 6 + k * 13) % 110); box(c, X(ex) + dir * (8 + k * 3), y, 4, 9, k % 2 ? Wt[7] : Wt[6]); box(c, X(ex) + dir * (8 + k * 3), y, 4, 2, Wt[8]); }
    }
  }
};

export const drawFlumeFront = (c: Ctx, state: GameState) => {
  c0 = c;
  const f = state.frame, Wt = hr('pool', POOL, 0.12);
  eachPiece(state, (a, _b, _len, ang, u0, u1) => {
    c.translate(X(a), flumeY(a)); c.rotate(ang);
    clipGap(c, state, a, ang);
    // (the water over the log's foot: see-through, its lit line rippling)
    const w0 = Math.floor(u0 / 6) * 6;
    c.globalAlpha = 0.5; box(c, w0, -3, u1 - w0, 6, Wt[4]); c.globalAlpha = 1;
    for (let u = w0; u < u1; u += 6) { const lift = Math.round(Math.sin(f * 0.12 + (a + u) * 0.05)); box(c, u, -3 + lift, 6, 1, Wt[7]); if (((a + u - Math.floor(f * 2.4)) % 54 + 54) % 54 < 6) box(c, u, -3 + lift, 6, 1, Wt[8]); }
    tiles(c, a, u0, u1, v => still(c, `lr-flumeF-${v}`, 0, 1, T, 26, g => paintFront(g, v)));
  });
  void mix;
};
