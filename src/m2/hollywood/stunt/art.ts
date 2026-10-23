// STUNTMAN STEVE'S STUPENDOUS STUNTERY, drawn (the final pass: peak SNES; the kit: paint.ts). An open-air amphitheater,
// extra wide, under the sky by the hour (far.ts: the land's far off, the light towers and Steve's billboards round the
// outside). The stage, where the fight puts things (its depth straight up the screen):
//
// - the asphalt floor, painted once for the hour (banded darker going back, its aggregate, joints and patches, oil, the
//   old shows' skid marks, the lanes' worn paint, Steve's mark tape along his line, the big faded star, STEVE stenciled
//   at his marks), bent the SNES way in front of the line so it fans out as he goes by;
// - the street set along the back (painted once for the hour, dimmed: scenery): a pawnshop in brick, a diner in teal
//   enamel and chrome, a gas station under its canopy (pumps, price sign), a sandstone bank (columns, pediment, clock), a
//   liquor store; the posse's four garage bays cut into it (block portals, hazard jambs, the roll-up doors, the dark
//   inside, STUNT CREW ONLY, a signal over each, headlights waiting in the dark while it's on);
// - the truss over it all (box truss, PAR cans in their gels, their cones down to the floor after dark), the marquee on
//   top of it in bulbs, Steve's vinyl banner off it, STEVE-O-VISION hung on its chains with its speaker stacks;
// - the ramps on their dollies (diamond plate going back, the lightening holes, the hazard lip: not his to stand on),
//   the hula hoops on their trolleys (taped pink and white), the rings of fire (wick-wrapped steel, stepped flames), the
//   pyro jets set in the floor and their columns of fire; the crash mats lying flat (he comes down off the fling onto the left one).
//
// Round it, on the scene's one eye: the stands up both ends going back to the set (cut at the play plane: the stepped
// section, the tunnel through the left one, the way back out), their rows of seats in Steve's yellow and stunt red, half
// empty, the fans seeded (women and men, every skin, build and hair), on their feet when it's good; the tire walls along
// their feet. In front: the jersey barrier, Steve's plates on it, and the small crowd behind it from the back (hair, caps,
// hats, ponytails; arms up, phones up, foam fingers).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { bendFloor, BEND } from '../../intro/art/kit';
import { turned } from '../disaster/paint';
import { drawPerson } from '../../adventure/temple/people';
import { bricks, BRICK } from '../lot/paint';
import { print, enamel, marquee as marqueeLook } from '../blvd/paint';
import { ARENA_L, ARENA_R, ARENA_W, ARENA_MID, GY, ZK, BACK_Z, LANE_BACK, LANE_FRONT, FLOOR_BACK_Y, BARRIER_Y, DOORS_X, TRUSS_Y, STEVE_AT, MAT_X, MAT_HW, x0 } from './arena';
import { RAMP, hoopOf } from './cars';
import type { Ramp, Skid } from './state';
import { drawSteve } from './steve';
import { drawCar, onFloorX, CAR, type CarColor } from './carArt';
import { drawStuntFar } from './far';
import {
  type Ctx, type View, INK, box, checker, mix, hash, poly, at, atDepth, timeOfDay, words, board, deco, plain, ball, post, slab, glassOf,
  STEVE, STEEL, IRON, LIP, CONCRETE, ramp6, dimmed, hour, TRUSS, SHELL, tubeV, truss, chain, flame, hazard,
  RUBBER, MAT, STAND, SEAT_Y, SEAT_R, RED_R, near, scen, stillH, parCan, cone, sview, SET_D, EYE_Y, inView,
} from './paint';

const h01 = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** Painted once for the hour (big canvases: the set, the floor). */
const canvases = new Map<string, HTMLCanvasElement>();
const painted = (key: string, w: number, h: number, paint: (g: Ctx) => void) => {
  const k = `${key}-${timeOfDay().key}`;
  let cv = canvases.get(k);
  if (!cv) {
    for (const old of [...canvases.keys()]) if (old.startsWith(key + '-')) canvases.delete(old);
    cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const g = cv.getContext('2d')!; g.imageSmoothingEnabled = false;
    paint(g); canvases.set(k, cv);
  }
  return cv;
};

// ---------------------------------------------------------------------------------------------------------------
// Screen space: the far off (far.ts)

export const drawStuntBackdrop = (c: Ctx, state: GameState) => drawStuntFar(c, state);

// ---------------------------------------------------------------------------------------------------------------
// The floor (painted once for the hour; world-fixed: what's on it lines up with the cars)

const FX0 = x0 - 60, FX1 = ARENA_R + 120, FW = FX1 - FX0;
const FY0 = Math.floor(FLOOR_BACK_Y), FH = Math.ceil(BARRIER_Y + 44 - FY0);
const LINE = GY - FY0;

const paintFloor = (g: Ctx) => {
  const F = near('#4C4A52'), Fw = near('#D8D4CC'), Y = STEVE.map(c => hour(c, 0.08));
  // (banded: darker going back, lighter toward us; dithered seams)
  const backBands = [F[1], mix(F[1], F[2], 0.5), F[2], mix(F[2], F[3], 0.4), mix(F[2], F[3], 0.75)];
  const bh = LINE / backBands.length;
  backBands.forEach((col, i) => { box(g, 0, Math.round(i * bh), FW, Math.ceil(bh) + 1, col); if (i) checker(g, 0, Math.round(i * bh) - 2, FW, 2, col, i % 2); });
  const frontBands = [F[3], mix(F[3], F[4], 0.25), mix(F[3], F[4], 0.45)];
  const fh = (FH - LINE) / frontBands.length;
  frontBands.forEach((col, i) => { box(g, 0, Math.round(LINE + i * fh), FW, Math.ceil(fh) + 1, col); if (i) checker(g, 0, Math.round(LINE + i * fh) - 2, FW, 2, col, i % 2); });
  // (the aggregate: lighter and darker pixels, thicker toward us)
  for (let i = 0; i < FW * FH / 26; i++) {
    const x = Math.floor(h01(i * 1.31) * FW), y = Math.floor(h01(i * 2.77 + 5) * FH), t = h01(i * 0.53);
    box(g, x, y, y > LINE ? 2 : 1, 1, t > 0.62 ? F[4] : t > 0.3 ? F[1] : F[0]);
  }
  // (the concourse past the stands' ends: concrete slabs, their joints)
  const C = near('#8E8880');
  for (const [a, b] of [[0, ARENA_L - 30 - FX0], [ARENA_R + 30 - FX0, FW]] as const) {
    if (b <= a) continue;
    box(g, a, 0, b - a, FH, C[2]); box(g, a, LINE, b - a, FH - LINE, C[3]);
    for (let x = a; x < b; x += 64) { box(g, x, 0, 1, FH, C[1]); box(g, x + 1, 0, 1, FH, C[4]); }
    for (const y of [Math.round(LINE * 0.5), LINE + 30, LINE + 74]) { box(g, a, y, b - a, 1, C[1]); box(g, a, y + 1, b - a, 1, C[4]); }
    for (let i = 0; i < (b - a) * FH / 60; i++) box(g, a + h01(i * 3.3) * (b - a), h01(i * 1.9) * FH, 1, 1, h01(i) > 0.5 ? C[1] : C[4]);
  }
  const A0 = ARENA_L - FX0, A1 = ARENA_R - FX0;
  // (expansion joints across, and the slabs' seams going back: dark, a lit lip on the far side)
  for (const zz of [-110, -30, 40]) { const y = Math.round(LINE + zz * ZK); box(g, A0, y, A1 - A0, 1, F[0]); box(g, A0, y + 1, A1 - A0, 1, F[4]); }
  for (let x = A0 + 200; x < A1; x += 200) { box(g, x, 0, 1, FH, F[0]); box(g, x + 1, 0, 1, FH, F[3]); }
  // (patches: newer asphalt, darker, inked round, their edges cracked)
  for (let i = 0; i < 9; i++) {
    const w = 40 + h01(i * 7.7) * 90, h = 8 + h01(i * 3.1) * 20, x = A0 + 60 + h01(i * 5.3) * (A1 - A0 - 160), y = 8 + h01(i * 9.1) * (FH - 50);
    box(g, x - 1, y - 1, w + 2, h + 2, F[0]); box(g, x, y, w, h, F[1]); checker(g, x, y, w, 2, F[2], 0, 1);
    for (let k = 0; k < w; k += 3) if (h01(i + k) > 0.7) box(g, x + k, y + h, 2, 1, F[0]);
  }
  // (cracks: stepped, branching)
  for (let i = 0; i < 26; i++) {
    let x = A0 + h01(i * 4.9) * (A1 - A0), y = h01(i * 6.1) * FH;
    for (let k = 0; k < 14; k++) { box(g, x, y, 2, 1, F[0]); x += (h01(i * 3 + k) - 0.5) * 6 + 2; y += (h01(i * 5 + k) - 0.5) * 3; }
  }
  // (oil: stepped pools, a sheen)
  for (let i = 0; i < 16; i++) {
    const x = A0 + 40 + h01(i * 8.3) * (A1 - A0 - 80), y = 6 + h01(i * 2.2) * (FH - 20), r = 6 + h01(i * 1.1) * 14;
    g.fillStyle = F[1]; g.beginPath(); g.ellipse(x, y, r + 3, (r + 3) * ZK, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = F[0]; g.beginPath(); g.ellipse(x, y, r, r * ZK, 0, 0, Math.PI * 2); g.fill();
    box(g, x - r * 0.4, y - 1, 3, 1, '#4A3A6A'); box(g, x - r * 0.4 + 3, y - 1, 2, 1, '#2A4A5A');
  }
  // (the old shows' skid marks: arcs, each a pair of tire lines, fading at their ends)
  for (let i = 0; i < 22; i++) {
    const cx = A0 + 60 + h01(i * 2.9) * (A1 - A0 - 120), cy = 20 + h01(i * 4.7) * (FH - 40), r = 40 + h01(i * 3.7) * 120, a0 = h01(i * 5.5) * Math.PI * 2, span = 0.8 + h01(i * 6.6) * 1.8;
    for (let k = 0; k < 40; k++) {
      const u = k / 40, a = a0 + span * u, fade = Math.min(u, 1 - u) * 4;
      const col = fade > 0.6 ? F[0] : F[1];
      for (const o of [0, 9]) { const x = cx + Math.cos(a) * (r + o), y = cy + Math.sin(a) * (r + o) * ZK; if (fade > 0.25 || k % 2) box(g, x, y, 4, 2, col); }
    }
  }
  // (the lanes: dashed white, worn: chipped, lit along their top)
  for (const lz of [LANE_BACK, LANE_FRONT]) {
    const y = Math.round(LINE + lz * ZK);
    for (let x = A0 + 20; x < A1 - 20; x += 60) {
      box(g, x, y - 1, 30, 3, Fw[2]); box(g, x, y - 1, 30, 1, Fw[4]);
      for (let k = 0; k < 30; k += 2) if (h01(x * 0.7 + k) > 0.72) box(g, x + k, y - 1 + (k % 3), 2, 1, F[2]);
    }
  }
  // (the big star in the middle: faded yellow paint, its rim darker, worn through in a dither, tire marks over it)
  const stx = ARENA_MID - FX0, sty = LINE - 10;
  const star = (r: number, inner: number): [number, number][] => {
    const pts: [number, number][] = [];
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? inner : r; pts.push([stx + Math.cos(a) * rr, sty + Math.sin(a) * rr * ZK]); }
    return pts;
  };
  poly(g, star(156, 64), mix(Y[1], F[2], 0.35));
  poly(g, star(150, 60), mix(Y[2], F[3], 0.3));
  poly(g, star(118, 48), mix(Y[3], F[3], 0.3));
  poly(g, star(60, 24), mix(Y[4], F[3], 0.25));
  g.save(); g.beginPath(); star(156, 64).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
  for (let i = 0; i < 180; i++) { const x = stx - 160 + h01(i * 1.7) * 320, y = sty - 70 + h01(i * 2.3) * 140; box(g, x, y, 4 + h01(i) * 8, 2, F[3]); }
  checker(g, stx - 160, sty + 20, 320, 60, F[3], 0, 2);
  g.restore();
  // (Steve's mark tape along the line: his line, where he walks)
  for (let x = A0; x < A1; x += 2) {
    if (h01(x * 0.13) > 0.97) continue;
    box(g, x, LINE - 1, 2, 1, Y[4]); box(g, x, LINE, 2, 1, Y[3]); box(g, x, LINE + 1, 2, 1, Y[1]);
  }
  // (STEVE stenciled where he stands, an X of tape on his mark)
  for (const side of [-1, 1] as const) {
    const sx = STEVE_AT(side) - FX0, sy = Math.round(LINE - 4 + BACK_Z * ZK * 0.15);
    words(g, 'STEVE', sx, sy, { sx: 1, sy: 1, fill: mix(Y[3], F[3], 0.2), stencil: true, gap: 1 });
    for (let k = -4; k <= 4; k++) { box(g, sx + 26 + k, sy - 4 + Math.round(k * 0.4), 1, 1, Fw[3]); box(g, sx + 26 + k, sy - 4 - Math.round(k * 0.4), 1, 1, Fw[3]); }
  }
};

const drawFloor = (c: Ctx, state: GameState, v: View) => {
  const cv = painted('hst-floor', FW, FH, paintFloor);
  const sx = Math.max(0, Math.floor(state.camera.x - 60 - FX0)), sw = Math.min(FW - sx, CANVAS_WIDTH + 120);
  if (sw <= 0) return;
  c.drawImage(cv, sx, 0, sw, FH, FX0 + sx, FY0, sw, FH);
  // (in front of the line: bent, fanning out from where he's looking)
  bendFloor(c, v.eye, GY, GY, FY0 + FH, FX0, FX1);
};

// ---------------------------------------------------------------------------------------------------------------
// The street set along the back (painted once for the hour; scenery: dimmed), the garage bays in it

const SET_X = ARENA_L - 40, SET_W = ARENA_W + 80, SET_H = 250;
/** The bays (local x: their middles), the fronts between them. */
const BAYS = DOORS_X.map(d => d - SET_X);
const PORT = 115;

/** A false front's top: the plywood's edge (seen from over it: a strip, its 2x4 behind), inked. */
const plyTop = (g: Ctx, x: number, w: number, top: number) => {
  const P = scen('#A87A3E');
  box(g, x - 1, top - 5, w + 2, 6, INK); box(g, x, top - 4, w, 3, P[4]); box(g, x, top - 4, w, 1, P[5]); box(g, x, top - 1, w, 1, P[2]);
  for (let k = x + 20; k < x + w - 6; k += 48) box(g, k, top - 4, 4, 3, P[2]);
};
/** Window glass (by the hour), its frame, banded, a glint, maybe bars. */
const windowAt = (g: Ctx, x: number, y: number, w: number, h: number, frame: string[], bars = false) => {
  const G = glassOf().map(dimmed);
  box(g, x - 2, y - 2, w + 4, h + 4, INK); box(g, x - 1, y - 1, w + 2, h + 2, frame[3]); box(g, x - 1, y - 1, w + 2, 1, frame[4]);
  box(g, x, y, w, h, G[2]); box(g, x, y, w, Math.round(h * 0.4), G[3]); box(g, x, y, w, 2, G[4]); checker(g, x, y + Math.round(h * 0.4), w, 2, G[3], 0, 1);
  box(g, x, y + h - 4, w, 4, G[1]);
  for (let k = 0; k < Math.min(h, 14); k++) box(g, x + 4 + k, y + h - 6 - k, 2, 1, G[4]);
  if (bars) { const I = scen('#3A4442'); for (let k = x + 3; k < x + w; k += 6) { box(g, k, y, 2, h, I[1]); box(g, k, y, 1, h, I[3]); } }
};
const doorAt = (g: Ctx, x: number, base: number, w: number, h: number, col: string) => {
  const D = scen(col), G = glassOf().map(dimmed);
  box(g, x - 2, base - h - 2, w + 4, h + 2, INK); box(g, x, base - h, w, h, D[2]); box(g, x, base - h, 2, h, D[4]); box(g, x + w - 3, base - h, 3, h, D[1]);
  box(g, x + 5, base - h + 6, w - 10, Math.round(h * 0.4), G[2]); box(g, x + 5, base - h + 6, w - 10, 2, G[4]);
  box(g, x + w - 8, base - h / 2, 3, 3, scen('#C8962E')[4]);
};

const paintPawn = (g: Ctx, x: number, w: number, B: number) => {
  const top = B - 176, BR = BRICK.map(dimmed);
  bricks(g, x, top, w, B - top, BR, dimmed('#3A2420'), 3);
  box(g, x, top, 3, B - top, BR[4]); checker(g, x + w - 8, top, 4, B - top, BR[1], 0, 2); box(g, x + w - 4, top, 4, B - top, BR[1]);
  const S = scen('#B8A890'); box(g, x, top, w, 8, S[3]); box(g, x, top, w, 1, S[5]); box(g, x, top + 7, w, 1, S[1]);
  plyTop(g, x, w, top);
  board(g, x + w / 2 - 6, top + 26, ['PAWN'], { sx: 3, sy: 3, fill: [dimmed('#FFF6D8'), dimmed('#F2D79A'), dimmed('#E8C25A')], dither: true, shadow: dimmed('#1C1014'), gap: 1 }, dimmed('#1E3A5A'), scen('#C8962E'), 7);
  // (the three gold balls off their bracket)
  const bx = x + w - 14, I = scen('#3A4442');
  box(g, bx - 1, top + 50, 3, 14, I[2]); box(g, bx - 16, top + 50, 17, 3, I[2]);
  for (const [dx, dy] of [[-14, 0], [-6, 0], [-10, 10]]) { box(g, bx + dx, top + 52, 1, 6 + dy, I[1]); ball(g, bx + dx, top + 62 + dy, 5, dimmed('#E8C25A')); }
  windowAt(g, x + 14, top + 72, 80, 56, scen('#5A4A3A'), true);
  board(g, x + 54, top + 112, ['WE BUY GOLD'], { sx: 1, sy: 1, fill: dimmed('#B4243A') }, dimmed('#F4EEE2'), scen('#5A4A3A'), 3);
  doorAt(g, x + 106, B, 34, 66, '#3A2A1E');
};

const paintDiner = (g: Ctx, x: number, w: number, B: number) => {
  const top = B - 150, Tl = scen('#2A8A8A'), Ch = scen('#C8D0D8'), Cr = scen('#F2EAD8');
  slab(g, x, top + 30, w, B - top - 30, Tl);
  // (porcelain panels: seams; chrome bands across)
  for (let k = x + 30; k < x + w; k += 30) box(g, k, top + 30, 1, B - top - 30, Tl[2]);
  for (const y of [top + 38, top + 46, B - 22]) { box(g, x, y, w, 4, Ch[3]); box(g, x, y, w, 1, Ch[5]); box(g, x, y + 3, w, 1, Ch[1]); }
  plyTop(g, x, w, top + 30);
  // (the long band of windows, a pie in one)
  for (let k = 0; k < 5; k++) windowAt(g, x + 12 + k * 56, top + 58, 46, 40, Ch);
  ball(g, x + 40, top + 90, 6, dimmed('#C8803A'));
  // (the door, its porthole)
  const dx = x + w / 2 - 18;
  box(g, dx - 2, B - 66, 40, 66, INK); box(g, dx, B - 64, 36, 64, Ch[2]); box(g, dx, B - 64, 2, 64, Ch[4]);
  g.fillStyle = INK; g.beginPath(); g.arc(dx + 18, B - 44, 9, 0, Math.PI * 2); g.fill();
  g.fillStyle = glassOf().map(dimmed)[3]; g.beginPath(); g.arc(dx + 18, B - 44, 7, 0, Math.PI * 2); g.fill();
  // (the rooftop sign on its legs: DINER in red enamel on cream, a starburst off its end)
  const sy = top - 2, sw = 170, sx = x + w / 2 - sw / 2, I = scen('#5A5E66');
  for (const lx of [sx + 20, sx + sw - 24]) { box(g, lx - 1, sy, 4, 34, INK); box(g, lx, sy, 2, 34, I[3]); }
  board(g, x + w / 2, sy - 6, ['DINER'], { sx: 4, sy: 4, fill: [dimmed('#F25A52'), dimmed('#DC2626'), dimmed('#B42222')], dither: true, shadow: dimmed('#5A0A0A'), gap: 1 }, dimmed('#F2EAD8'), Ch, 7);
  const bx = sx + sw + 18, by = sy - 8;
  for (let k = 0; k < 12; k++) { const a = (k * Math.PI) / 6, r = k % 2 ? 9 : 16; box(g, bx + Math.cos(a) * r - 2, by + Math.sin(a) * r - 2, 4, 4, k % 2 ? dimmed('#F2D79A') : dimmed('#F25A52')); }
  ball(g, bx, by, 5, dimmed('#F2D79A'));
  // (EAT down a blade sign on its end)
  const ex = x + w - 18;
  box(g, ex - 11, top + 52, 22, 64, INK); box(g, ex - 10, top + 53, 20, 62, Cr[3]); box(g, ex - 10, top + 53, 20, 2, Cr[5]);
  ['E', 'A', 'T'].forEach((L, i) => words(g, L, ex, top + 72 + i * 19, { sx: 2, sy: 2, fill: dimmed('#B42222') }));
};

const paintGas = (g: Ctx, x: number, w: number, B: number) => {
  const Wt = scen('#E8E4DA'), Rd = scen('#C82828'), I = scen('#5A5E66');
  // (the office at the back: stucco, the red band, its window and door)
  const ox = x + 120, ow = w - 120, ot = B - 104;
  slab(g, ox, ot, ow, B - ot, Wt);
  box(g, ox, ot + 10, ow, 10, Rd[3]); box(g, ox, ot + 10, ow, 1, Rd[5]); box(g, ox, ot + 19, ow, 1, Rd[1]);
  windowAt(g, ox + 12, ot + 30, 56, 40, I);
  doorAt(g, ox + 80, B, 30, 62, '#5A5E66');
  board(g, ox + 95, ot + 30, ['OFFICE'], { sx: 1, sy: 1, fill: dimmed('#2A2228') }, dimmed('#F4EEE2'), I, 3);
  // (the price sign on its pole, out front: GAS and its price)
  const px = x + 200;
  post(g, px, B - 214, ot, 6, I);
  board(g, px, B - 194, ['GAS', '$0.89'], { sx: 2, sy: 2, fill: [dimmed('#FFF6D8'), dimmed('#F2D79A')], dither: true, shadow: dimmed('#1C1014'), gap: 1 }, dimmed('#B42222'), I, 6);
  // (the canopy: its roof seen from over it (going back), the red fascia with its stripe; its posts)
  const ct = B - 158, cw = w - 6;
  box(g, x + 2, ct - 1, cw + 2, 9, INK); box(g, x + 3, ct, cw, 7, Wt[2]); box(g, x + 3, ct, cw, 1, Wt[3]); checker(g, x + 3, ct + 5, cw, 2, Wt[1], 0, 1);
  box(g, x + 2, ct + 8, cw + 2, 16, INK); box(g, x + 3, ct + 9, cw, 14, Rd[3]); box(g, x + 3, ct + 9, cw, 2, Rd[4]); box(g, x + 3, ct + 20, cw, 3, Rd[1]);
  box(g, x + 3, ct + 15, cw, 2, Wt[4]);
  words(g, 'GAS', x + 60, ct + 21, { sx: 2, sy: 1, fill: [Wt[5], Wt[4]], shadow: Rd[0], gap: 1 });
  box(g, x + 3, ct + 24, cw, 2, I[0]);
  for (const lx of [x + 24, x + 112]) post(g, lx, ct + 24, B, 8, Wt);
  // (the pumps on their island: red bodies, white faces, globes on top, hoses)
  box(g, x + 40, B - 8, 58, 8, INK); box(g, x + 41, B - 7, 56, 7, scen('#9C968C')[3]); box(g, x + 41, B - 7, 56, 1, scen('#9C968C')[5]);
  for (const pxx of [x + 54, x + 84]) {
    box(g, pxx - 9, B - 58, 18, 50, INK); box(g, pxx - 8, B - 57, 16, 49, Rd[3]); box(g, pxx - 8, B - 57, 3, 49, Rd[4]); box(g, pxx + 5, B - 57, 3, 49, Rd[1]);
    box(g, pxx - 6, B - 50, 12, 12, Wt[4]); box(g, pxx - 4, B - 47, 8, 2, INK); box(g, pxx - 4, B - 43, 8, 2, INK);
    ball(g, pxx, B - 64, 6, dimmed('#F4EEE2'));
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(pxx + 8, B - 40); g.quadraticCurveTo(pxx + 14, B - 20, pxx + 9, B - 30); g.stroke();
  }
};

const paintBank = (g: Ctx, x: number, w: number, B: number) => {
  const top = B - 196, St = scen('#C8B08A'), Gd = scen('#C8962E');
  slab(g, x, top + 44, w, B - top - 44, St);
  for (let y = top + 52; y < B - 16; y += 12) { box(g, x, y, w, 1, St[2]); for (let k = x + ((y / 12) % 2 ? 0 : 20); k < x + w; k += 40) box(g, k, y, 1, 12, St[2]); }
  // (the pediment: a stepped triangle, its cornice bands; the clock in it)
  for (let k = 0; k < 20; k++) { const ww = w - k * (w / 22); box(g, x + (w - ww) / 2, top + 30 - k * 2, ww, 2, k === 0 ? St[5] : k % 4 === 0 ? St[4] : St[3]); }
  box(g, x - 4, top + 30, w + 8, 14, INK); box(g, x - 3, top + 31, w + 6, 12, St[3]); box(g, x - 3, top + 31, w + 6, 2, St[5]); box(g, x - 3, top + 41, w + 6, 2, St[1]);
  g.fillStyle = INK; g.beginPath(); g.arc(x + w / 2, top + 14, 11, 0, Math.PI * 2); g.fill();
  g.fillStyle = dimmed('#F4EEE2'); g.beginPath(); g.arc(x + w / 2, top + 14, 9, 0, Math.PI * 2); g.fill();
  box(g, x + w / 2, top + 7, 1, 7, INK); box(g, x + w / 2, top + 14, 5, 1, INK);
  // (BANK carved into the frieze)
  box(g, x + 20, top + 46, w - 40, 22, St[2]); box(g, x + 20, top + 46, w - 40, 1, St[1]); box(g, x + 20, top + 67, w - 40, 1, St[4]);
  words(g, 'FIRST BANK OF HAPPYWOOD', x + w / 2, top + 62, { sx: 1, sy: 2, fill: St[1], lip: St[4] });
  // (the columns: stepped round, fluted, their caps and bases)
  for (let k = 0; k < 4; k++) {
    const cx = x + 36 + k * ((w - 72) / 3);
    box(g, cx - 14, top + 70, 28, 6, St[4]); box(g, cx - 14, top + 70, 28, 1, St[5]);
    post(g, cx, top + 76, B - 18, 20, St);
    for (const fx of [-6, -2, 2, 6]) box(g, cx + fx, top + 78, 1, B - top - 98, St[2]);
    box(g, cx - 13, B - 18, 26, 6, St[3]); box(g, cx - 13, B - 18, 26, 1, St[5]);
  }
  // (barred windows between them; the doors in the middle in brass)
  for (const k of [0, 2]) windowAt(g, x + 56 + k * ((w - 72) / 3), top + 92, 40, 60, St, true);
  {
    const dl = x + w / 2 - 21, dt = B - 75;
    box(g, dl - 1, dt - 1, 44, 64, INK); box(g, dl, dt, 42, 63, Gd[2]); box(g, dl, dt, 42, 2, Gd[4]);
    // (the transom's bars over them; two leaves, each two panels in bevels, their pulls)
    box(g, dl, dt + 2, 42, 12, glassOf().map(dimmed)[2]); for (let k = dl + 4; k < dl + 42; k += 6) box(g, k, dt + 2, 1, 12, Gd[1]); box(g, dl, dt + 13, 42, 2, Gd[1]);
    for (const lx of [dl + 2, dl + 22]) for (const [py, ph] of [[dt + 18, 18], [dt + 40, 20]]) {
      box(g, lx, py, 18, ph, Gd[1]); box(g, lx + 1, py + 1, 16, ph - 2, Gd[3]); box(g, lx + 1, py + 1, 16, 1, Gd[5]); box(g, lx + 1, py + 1, 1, ph - 2, Gd[4]); box(g, lx + 15, py + 2, 2, ph - 3, Gd[2]);
    }
    box(g, dl + 20, dt + 15, 2, 48, Gd[0]);
    for (const hx of [dl + 17, dl + 23]) { box(g, hx, dt + 34, 2, 8, INK); box(g, hx, dt + 34, 1, 8, Gd[5]); }
  }
  // (the steps up to it)
  for (let k = 0; k < 3; k++) { box(g, x + 10 - k * 4, B - 12 + k * 4, w - 20 + k * 8, 4, St[4 - k]); box(g, x + 10 - k * 4, B - 12 + k * 4, w - 20 + k * 8, 1, St[5]); }
};

const paintLiquor = (g: Ctx, x: number, w: number, B: number) => {
  const top = B - 162, Gr = scen('#4D7C3A'), Wt = scen('#E8E4DA');
  slab(g, x, top, w, B - top, Gr);
  for (let i = 0; i < w * (B - top) / 40; i++) box(g, x + h01(i * 1.3) * w, top + h01(i * 2.1) * (B - top), 1, 1, h01(i) > 0.5 ? Gr[2] : Gr[4]);
  plyTop(g, x, w, top);
  board(g, x + w / 2, top + 26, ['LIQUOR'], { sx: 2, sy: 3, fill: [dimmed('#FFF6D8'), dimmed('#F2D79A')], dither: true, shadow: dimmed('#0E1A0A'), gap: 1 }, dimmed('#2A2228'), scen('#5A5E66'), 7);
  windowAt(g, x + 12, top + 60, 84, 56, Wt);
  board(g, x + 36, top + 78, ['COLD', 'BEER'], { sx: 1, sy: 1, fill: dimmed('#1E46B8') }, dimmed('#F4EEE2'), Wt, 3);
  board(g, x + 76, top + 98, ['LOTTO'], { sx: 1, sy: 1, fill: dimmed('#B42222') }, dimmed('#F2D79A'), Wt, 3);
  doorAt(g, x + 108, B, 32, 64, '#2A3A2A');
};

/** A garage bay: a block portal (block courses in steps), hazard-striped jambs, the red header, the roll-up door rolled
 *  up under its drum, the dark inside (banded, a shelf of tires, a pegboard), BAY n, STUNT CREW ONLY over it. */
const paintBay = (g: Ctx, dx: number, B: number, n: number) => {
  const l = dx - PORT, w = PORT * 2, top = B - 182, Cn = scen('#9A948C'), Rd = RED_R.map(dimmed), Sl = scen('#A2A8B2');
  box(g, l - 1, top - 1, w + 2, B - top + 1, INK);
  box(g, l, top, w, B - top, Cn[3]);
  for (let y = top, r = 0; y < B; y += 10, r++) { box(g, l, y, w, 1, Cn[2]); for (let k = l + (r % 2 ? 12 : 0); k < l + w; k += 24) box(g, k, y, 1, 10, Cn[2]); box(g, l, y + 1, w, 1, Cn[4]); }
  box(g, l, top, 3, B - top, Cn[4]); box(g, l + w - 4, top, 4, B - top, Cn[1]);
  box(g, l - 3, top - 4, w + 6, 6, INK); box(g, l - 2, top - 3, w + 4, 4, Cn[4]); box(g, l - 2, top - 3, w + 4, 1, Cn[5]);
  // (the inside: dark, banded, the far wall's pegboard and a stack of tires)
  const ol = dx - 100, ot = B - 128;
  box(g, ol - 10, ot - 12, 220, B - ot + 12, INK);
  const D = ['#060507', '#0C0A0E', '#141118', '#1C1820', '#24202A', '#2E2934'];
  D.slice(0, 4).forEach((col, i) => box(g, ol, ot + i * 30, 200, i === 3 ? B - ot - 90 : 31, col));
  // (the back wall's block courses, barely there in the dark)
  for (let y = ot + 40, r = 0; y < B - 24; y += 9, r++) { box(g, ol, y, 200, 1, D[0]); for (let k = ol + (r % 2 ? 11 : 0); k < ol + 200; k += 22) box(g, k, y, 1, 9, D[0]); }
  // (the floor going back: oil-stained concrete, lighter toward the door, a drain in the middle, the drip pan's stain)
  box(g, ol, B - 24, 200, 24, D[3]); box(g, ol, B - 24, 200, 1, D[0]); box(g, ol, B - 12, 200, 12, D[4]); checker(g, ol, B - 14, 200, 2, D[4], 0, 1);
  box(g, ol, B - 3, 200, 3, D[5]);
  g.fillStyle = D[1]; g.beginPath(); g.ellipse(dx, B - 10, 34, 5, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = D[0]; g.beginPath(); g.ellipse(dx + 4, B - 10, 18, 3, 0, 0, Math.PI * 2); g.fill();
  box(g, dx - 6, B - 19, 12, 3, D[0]); for (let k = -5; k < 6; k += 2) box(g, dx + k, B - 18, 1, 1, D[3]);
  // (the pegboard on the back wall, its tools hung in their outlines: a wrench, a hammer, pliers, a coil of rope)
  const pb = ol + 14, pt = ot + 40;
  box(g, pb - 1, pt - 1, 72, 34, INK); box(g, pb, pt, 70, 32, D[3]); box(g, pb, pt, 70, 1, D[5]);
  for (let k = 0; k < 7; k++) for (let j = 0; j < 4; j++) box(g, pb + 4 + k * 10, pt + 4 + j * 8, 1, 1, D[1]);
  box(g, pb + 6, pt + 6, 3, 20, D[0]); box(g, pb + 4, pt + 4, 7, 4, D[0]); box(g, pb + 7, pt + 6, 1, 18, D[5]);
  box(g, pb + 20, pt + 6, 2, 22, D[0]); box(g, pb + 16, pt + 4, 10, 5, D[0]); box(g, pb + 17, pt + 4, 8, 1, D[5]);
  box(g, pb + 34, pt + 8, 2, 18, D[0]); box(g, pb + 38, pt + 8, 2, 18, D[0]); box(g, pb + 33, pt + 6, 8, 4, D[0]);
  g.strokeStyle = D[0]; g.lineWidth = 2; g.beginPath(); g.ellipse(pb + 56, pt + 16, 8, 10, 0, 0, Math.PI * 2); g.stroke(); g.strokeStyle = D[5]; g.lineWidth = 1; g.beginPath(); g.ellipse(pb + 56, pt + 15, 7, 9, 0, Math.PI, Math.PI * 1.6); g.stroke();
  // (a workbench under it: its top lit along the front, a vise, a toolbox; a drum of oil by it)
  box(g, ol + 8, B - 46, 84, 6, INK); box(g, ol + 9, B - 45, 82, 4, D[4]); box(g, ol + 9, B - 45, 82, 1, D[5]);
  for (const lx of [ol + 12, ol + 84]) { box(g, lx - 1, B - 40, 5, 28, INK); box(g, lx, B - 40, 3, 28, D[3]); }
  box(g, ol + 40, B - 54, 22, 9, INK); box(g, ol + 41, B - 53, 20, 7, '#3A1414'); box(g, ol + 41, B - 53, 20, 1, '#5A2420'); box(g, ol + 48, B - 56, 6, 2, INK);
  box(g, ol + 18, B - 52, 10, 7, INK); box(g, ol + 19, B - 51, 8, 5, D[4]);
  box(g, ol + 98, B - 34, 20, 30, INK); box(g, ol + 99, B - 33, 18, 28, '#1A2430'); box(g, ol + 99, B - 33, 4, 28, '#26323E'); box(g, ol + 99, B - 25, 18, 1, INK); box(g, ol + 99, B - 15, 18, 1, INK); box(g, ol + 99, B - 33, 18, 1, '#34404C');
  // (the stack of spare tires on the right: each a tire's face, its tread, lit along its top)
  for (let k = 0; k < 4; k++) {
    const ty = B - 16 - k * 12;
    box(g, ol + 150, ty, 34, 11, INK); box(g, ol + 151, ty + 1, 32, 9, '#121114'); box(g, ol + 152, ty + 1, 30, 2, '#2A2830'); box(g, ol + 153, ty + 1, 8, 1, '#3A3842');
    for (let t = ol + 154; t < ol + 181; t += 4) box(g, t, ty + 5, 2, 1, '#060507');
    box(g, ol + 151, ty + 8, 32, 2, '#08080A');
  }
  // (the jambs: hazard stripes, the header beam, the roll-up door's drum, the door rolled up: slats in steps)
  hazard(g, ol - 10, ot - 12, 10, B - ot + 12, n * 5, dimmed('#FACC15'));
  hazard(g, ol + 200, ot - 12, 10, B - ot + 12, n * 5 + 8, dimmed('#FACC15'));
  box(g, ol - 12, ot - 16, 224, 10, INK); box(g, ol - 11, ot - 15, 222, 8, Rd[3]); box(g, ol - 11, ot - 15, 222, 1, Rd[5]); box(g, ol - 11, ot - 9, 222, 2, Rd[1]);
  box(g, ol - 2, ot - 6, 204, 8, INK); box(g, ol - 1, ot - 5, 202, 6, Sl[2]); box(g, ol - 1, ot - 5, 202, 1, Sl[4]);
  for (let y = ot + 2; y < ot + 32; y += 5) { box(g, ol, y, 200, 4, Sl[3]); box(g, ol, y, 200, 1, Sl[5]); box(g, ol, y + 3, 200, 1, Sl[1]); }
  box(g, ol, ot + 32, 200, 4, INK); box(g, ol, ot + 32, 200, 2, Sl[2]);
  box(g, dx - 1, ot + 36, 2, 20, scen('#C8B088')[2]);
  // (the signs: STUNT CREW ONLY over it, BAY n on the block)
  board(g, dx, top + 20, ['STUNT CREW ONLY'], { sx: 1, sy: 2, fill: INK, gap: 1 }, dimmed('#FACC15'), STEEL.map(dimmed), 6);
  words(g, `BAY ${n}`, l + 24, top + 30, { sx: 1, sy: 1, fill: dimmed('#F4EEE2'), stencil: true, gap: 1 });
};

/** Street furniture along the set's foot (dimmed): cast-iron lamps (fluted, a collar, an acorn head in steps), a
 *  hydrant, a mailbox (its arched top, the slot, legs), a newspaper box (its window, the coin slot, legs). */
const paintFurniture = (g: Ctx, B: number) => {
  const I = scen('#2E3A38'), on = lit(), Gl = on ? ['#FFFBEA', '#FFF2C0', '#F2D08A'] : [dimmed('#F4F0E2'), dimmed('#E2DCC8'), dimmed('#B8B0A0')];
  for (const lx of [140, 640, 1158, 1682]) {
    // (the base: flared in steps; the post fluted; a collar partway up)
    box(g, lx - 9, B - 6, 18, 6, INK); box(g, lx - 8, B - 5, 16, 5, I[3]); box(g, lx - 8, B - 5, 16, 1, I[5]); box(g, lx + 4, B - 5, 4, 5, I[1]);
    box(g, lx - 7, B - 14, 14, 9, INK); box(g, lx - 6, B - 13, 12, 8, I[3]); box(g, lx - 6, B - 13, 2, 8, I[4]); box(g, lx + 3, B - 13, 3, 8, I[1]);
    post(g, lx, B - 150, B - 14, 6, I);
    box(g, lx - 1, B - 146, 1, 128, I[2]);
    box(g, lx - 5, B - 84, 10, 5, INK); box(g, lx - 4, B - 83, 8, 3, I[4]); box(g, lx - 4, B - 83, 8, 1, I[5]);
    // (the head: a finial, the cap, the acorn globe in steps, its fitter)
    box(g, lx - 1, B - 178, 3, 5, INK); box(g, lx, B - 177, 1, 4, I[4]);
    box(g, lx - 8, B - 174, 16, 5, INK); box(g, lx - 7, B - 173, 14, 3, I[3]); box(g, lx - 7, B - 173, 14, 1, I[5]);
    box(g, lx - 7, B - 169, 14, 16, INK); box(g, lx - 6, B - 168, 12, 14, Gl[1]); box(g, lx - 5, B - 168, 4, 12, Gl[0]); box(g, lx + 3, B - 167, 3, 12, Gl[2]); checker(g, lx + 1, B - 167, 2, 12, Gl[2], 0, 1);
    box(g, lx - 5, B - 153, 10, 4, INK); box(g, lx - 4, B - 152, 8, 2, I[3]);
  }
  // (a hydrant: its bonnet, the nozzles, banded)
  const Hy = scen('#C82828');
  box(g, 584, B - 24, 16, 24, INK); box(g, 585, B - 23, 14, 23, Hy[3]); box(g, 585, B - 23, 3, 23, Hy[4]); box(g, 596, B - 23, 3, 23, Hy[1]);
  box(g, 581, B - 16, 22, 5, INK); box(g, 582, B - 15, 20, 3, Hy[3]); box(g, 582, B - 15, 20, 1, Hy[5]);
  box(g, 586, B - 30, 12, 7, INK); box(g, 587, B - 29, 10, 5, Hy[4]); box(g, 587, B - 29, 10, 1, Hy[5]); box(g, 590, B - 33, 4, 3, INK);
  box(g, 583, B - 4, 18, 4, INK); box(g, 584, B - 3, 16, 2, Hy[2]);
  // (a mailbox: blue, its arched top in steps, the slot's pull, its legs)
  const Mb = scen('#1E46B8'), mx = 1938;
  box(g, mx + 2, B - 48, 22, 4, INK); box(g, mx, B - 45, 26, 37, INK);
  box(g, mx + 3, B - 47, 20, 3, Mb[4]); box(g, mx + 1, B - 44, 24, 35, Mb[3]); box(g, mx + 1, B - 44, 4, 35, Mb[4]); box(g, mx + 20, B - 44, 5, 35, Mb[1]); checker(g, mx + 17, B - 44, 3, 35, Mb[2], 0, 1);
  box(g, mx + 5, B - 38, 16, 5, INK); box(g, mx + 6, B - 37, 14, 3, Mb[2]); box(g, mx + 6, B - 37, 14, 1, Mb[5]);
  box(g, mx + 7, B - 26, 12, 6, Mb[5]); box(g, mx + 8, B - 25, 10, 4, dimmed('#C82828'));
  for (const lx of [mx + 2, mx + 20]) { box(g, lx - 1, B - 9, 6, 9, INK); box(g, lx, B - 9, 4, 9, Mb[1]); }
  // (a newspaper box: yellow, its window with the day's paper behind it, the coin slot, legs)
  const Nb = scen('#D8B020'), nx = 398;
  box(g, nx, B - 38, 20, 30, INK); box(g, nx + 1, B - 37, 18, 28, Nb[3]); box(g, nx + 1, B - 37, 18, 2, Nb[5]); box(g, nx + 15, B - 35, 4, 26, Nb[1]);
  box(g, nx + 3, B - 33, 11, 12, INK); box(g, nx + 4, B - 32, 9, 10, dimmed('#E8E4DA')); for (let k = 0; k < 4; k++) box(g, nx + 5, B - 29 + k * 2, 7, 1, dimmed('#8A8478'));
  box(g, nx + 4, B - 32, 9, 2, dimmed('#2A2228'));
  box(g, nx + 15, B - 32, 3, 4, INK);
  for (const lx of [nx + 2, nx + 15]) { box(g, lx - 1, B - 9, 5, 9, INK); box(g, lx, B - 9, 3, 9, scen('#5A5E66')[2]); }
};

const paintSet = (g: Ctx) => {
  const B = SET_H;
  paintPawn(g, 0, BAYS[0] - PORT, B);
  paintDiner(g, BAYS[0] + PORT, BAYS[1] - PORT - (BAYS[0] + PORT), B);
  paintGas(g, BAYS[1] + PORT, BAYS[2] - PORT - (BAYS[1] + PORT), B);
  paintBank(g, BAYS[2] + PORT, BAYS[3] - PORT - (BAYS[2] + PORT), B);
  paintLiquor(g, BAYS[3] + PORT, SET_W - (BAYS[3] + PORT), B);
  BAYS.forEach((dx, i) => paintBay(g, dx, B, i + 1));
  paintFurniture(g, B);
  // (the sidewalk along their foot: its top going back a strip, the curb's face; dimmed, no lip)
  const Cn = scen('#9C968C');
  box(g, 0, B - 6, SET_W, 4, Cn[3]); box(g, 0, B - 6, SET_W, 1, Cn[4]); box(g, 0, B - 2, SET_W, 2, Cn[1]);
  for (const dx of BAYS) { box(g, dx - 100, B - 6, 200, 6, Cn[2]); box(g, dx - 100, B - 6, 200, 1, Cn[3]); }
};
const lit = () => timeOfDay().lamps > 0.35;

/** A bay's signal head (still: stamped): its arm off the block, the housing in painted steel, a hood over each lens. */
const paintSignal = (g: Ctx) => {
  const S = STEEL.map(dimmed);
  box(g, 7, 8, 7, 4, INK); box(g, 7, 9, 6, 2, S[3]);
  box(g, -7, 0, 14, 26, INK); box(g, -6, 1, 12, 24, '#1E1E24'); box(g, -6, 1, 12, 1, '#3A3A44'); box(g, -6, 1, 1, 24, '#2E2E36'); box(g, 4, 2, 2, 23, '#121216');
  for (const ly of [3, 14]) { box(g, -5, ly - 1, 10, 10, INK); box(g, -6, ly - 3, 12, 3, INK); box(g, -5, ly - 3, 10, 1, '#3A3A44'); }
  box(g, -3, 26, 6, 3, INK); box(g, -2, 26, 4, 2, S[2]);
};

/** The bays' live bits: the signal over each (red; green with the show on), the beacon, the headlights in the dark. */
/** A garage door in the fight: how far up it is; a car's tell on in it (about to come out). */
export interface BayLook { open: number; tell: boolean }
const drawBayLive = (c: Ctx, dx: number, base: number, on: boolean, f: number, bay?: BayLook) => {
  const sx = dx + PORT - 16, sy = base - 176, tell = !!bay?.tell;
  stillH(c, 'signal', sx, sy, -14, -6, 28, 36, paintSignal);
  const lens = (ly: number, col: string) => { box(c, sx - 4, ly, 8, 8, col); box(c, sx - 3, ly + 1, 2, 2, mix(col, '#FFFFFF', 0.55)); };
  lens(sy + 3, tell ? ((f >> 2) % 2 ? '#FBBF24' : '#7A4A08') : on ? '#3A0A0A' : (f >> 4) % 2 ? '#F05040' : '#8A1A14');
  lens(sy + 14, on ? ((f >> 3) % 2 ? '#7CF08A' : '#3AC85A') : '#0A2A12');
  if (on) {
    // (the beacon on the block, turning (fast, a car coming out))
    const bx = dx - PORT + 16, by = base - 190, k = (f >> (tell ? 1 : 2)) % 4;
    box(c, bx - 4, by - 1, 8, 1, INK); box(c, bx - 5, by, 10, 8, INK); box(c, bx - 4, by + 1, 8, 6, k < 2 ? '#F59E0B' : '#B45309'); box(c, bx - 3, by, 6, 1, k < 2 ? '#FCD34D' : '#D97706'); box(c, bx - 4 + k * 2, by + 2, 2, 3, '#FFF2B0');
    box(c, bx - 6, by + 7, 12, 4, INK); box(c, bx - 5, by + 8, 10, 2, '#3A3A44'); box(c, bx - 5, by + 8, 10, 1, '#5A5A66');
    // (two cars' headlights waiting in the dark)
    if (!bay) for (const s of [-1, 1]) { box(c, dx + s * 40 - 9, base - 42, 18, 8, '#3A2E10'); box(c, dx + s * 40 - 8, base - 41, 7, 6, '#FEF3C7'); box(c, dx + s * 40 + 1, base - 41, 7, 6, '#FEF3C7'); }
  }
  // The roll-up door (the fight's on): down over the bay, the dark under it; up for a car coming out or going in
  if (bay) {
    const drop = Math.round((1 - bay.open) * 66), y0 = base - 92, Sl = scen('#A2A8B2');
    if (drop > 2) {
      box(c, dx - 101, y0, 202, drop, INK);
      for (let y = y0; y < y0 + drop - 4; y += 5) { box(c, dx - 100, y, 200, 4, Sl[3]); box(c, dx - 100, y, 200, 1, Sl[5]); box(c, dx - 100, y + 3, 200, 1, Sl[1]); }
      box(c, dx - 101, y0 + drop - 5, 202, 5, INK); box(c, dx - 100, y0 + drop - 4, 200, 3, dimmed('#FACC15')); box(c, dx - 100, y0 + drop - 4, 200, 1, dimmed('#FFF08A'));
      box(c, dx - 7, y0 + drop - 10, 14, 4, INK); box(c, dx - 6, y0 + drop - 9, 12, 2, Sl[4]);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The tell: a car about to come out of its garage, its headlights flicked on in the dark, their beams out across the
// floor (warm for a red car, cold for a blue): cached beams, two lamps

const TELL_BASE = FLOOR_BACK_Y + 2;
const LAMP: Record<CarColor, { core: string; mid: string; halo: string; beam: [number, number, number]; hot: [number, number, number] }> = {
  red: { core: '#FFF2D6', mid: 'rgba(255, 170, 110, 0.55)', halo: 'rgba(255, 90, 60, 0.3)', beam: [255, 150, 90], hot: [255, 226, 180] },
  blue: { core: '#F0F8FF', mid: 'rgba(150, 200, 255, 0.55)', halo: 'rgba(70, 130, 255, 0.3)', beam: [120, 170, 255], hot: [220, 236, 255] },
};
const BEAM_W = 380, BEAM_H = 110;
const beams = new Map<CarColor, HTMLCanvasElement | null>();
const beamOf = (color: CarColor) => {
  if (beams.has(color)) return beams.get(color)!;
  if (typeof document === 'undefined') return null;
  const cv = document.createElement('canvas'); cv.width = BEAM_W * 2; cv.height = BEAM_H * 2;
  const g = cv.getContext('2d');
  if (!g) { beams.set(color, null); return null; }
  g.scale(2, 2);
  const L = LAMP[color], mid = BEAM_W / 2;
  // (stepped: bands of light going out, dimmer each; the two hot cores off the lamps)
  const wedge = (x0: number, x1: number, X0: number, X1: number, rgb: [number, number, number], alphas: number[]) => {
    g.save(); g.beginPath(); g.moveTo(x0, 0); g.lineTo(x1, 0); g.lineTo(X1, BEAM_H); g.lineTo(X0, BEAM_H); g.closePath(); g.clip();
    alphas.forEach((a, i) => { g.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`; g.fillRect(0, (i * BEAM_H) / alphas.length, BEAM_W, BEAM_H / alphas.length + 0.5); });
    g.restore();
  };
  wedge(mid - 34, mid + 34, 6, BEAM_W - 6, L.beam, [0.32, 0.22, 0.14, 0.08, 0.04]);
  for (const s of [-1, 1]) wedge(mid + s * 23 - 4, mid + s * 23 + 4, mid + s * 60 - 34, mid + s * 60 + 34, L.hot, [0.3, 0.2, 0.12, 0.06]);
  beams.set(color, cv);
  return cv;
};
/** The tells on now (fight.ts), behind everything on the floor. */
export const drawTells = (c: Ctx, tells: { x: number; color: CarColor; k: number }[], f: number) => {
  for (const t of tells) {
    // (flicked on: a stutter, then on)
    const on = t.k > 0.3 || (t.k > 0.1 && (f >> 1) % 3 !== 0);
    if (!on) continue;
    const I = Math.min(1, (t.k - 0.08) / 0.45), L = LAMP[t.color], ly = TELL_BASE - 20;
    c.save(); c.globalCompositeOperation = 'lighter';
    const bm = beamOf(t.color);
    if (bm) { c.globalAlpha = I; c.drawImage(bm, t.x - BEAM_W / 2, ly + 4, BEAM_W, BEAM_H); }
    c.globalAlpha = 0.6 + 0.4 * I;
    for (const s of [-1, 1]) { const lx = Math.round(t.x + s * 23); box(c, lx - 12, ly - 7, 24, 14, L.halo); box(c, lx - 8, ly - 5, 16, 10, L.mid); }
    c.restore();
    for (const s of [-1, 1]) { const lx = Math.round(t.x + s * 23); box(c, lx - 5, ly - 4, 10, 8, '#2A2A30'); box(c, lx - 4, ly - 3, 8, 6, L.core); box(c, lx - 3, ly - 2, 3, 2, '#FFFFFF'); }
  }
};

const drawSet = (c: Ctx, state: GameState, doorsLit: boolean, bays?: BayLook[]) => {
  const base = FLOOR_BACK_Y + 2;
  if (!inView(state, SET_X, SET_X + SET_W)) return;
  const cv = painted('hst-set', SET_W, SET_H, paintSet);
  const sx = Math.max(0, Math.floor(state.camera.x - SET_X - 60)), sw = Math.min(SET_W - sx, CANVAS_WIDTH + 120);
  if (sw > 0) c.drawImage(cv, sx, 0, sw, SET_H, SET_X + sx, base - SET_H, sw, SET_H);
  DOORS_X.forEach((dx, i) => { if (inView(state, dx - PORT, dx + PORT)) drawBayLive(c, dx, base, doorsLit, state.frame, bays?.[i]); });
};

// ---------------------------------------------------------------------------------------------------------------
// The stands up both ends (on the one eye), cut at the play plane

/** The stands' inner face (its tire wall) off the arena's end; the podium walk over it; the rows going up and out. */
const FACE = 30, POD = 170, POD_W = 30, RW = 40, RH = 24, ROWS = 9, RIM = 34, SEATS = 10;
const faceX = (s: -1 | 1) => (s < 0 ? ARENA_L - FACE : ARENA_R + FACE);
const rowX = (s: -1 | 1, i: number) => faceX(s) + s * (POD_W + i * RW);
const rowH = (i: number) => POD + i * RH;

/** An upright face across x = e (world, at the play plane), top..bottom, from depth d0 back to d1 in steps. */
const vface = (c: Ctx, eye: View['eye'], e: number, top: number, bottom: number, d0: number, d1: number, cols: string[]) => {
  const n = cols.length;
  for (let i = 0; i < n; i++) {
    const a = d0 - ((d0 - d1) * i) / n, b = d0 - ((d0 - d1) * (i + 1)) / n;
    poly(c, [at(eye, e, top, a), at(eye, e, top, b), at(eye, e, bottom, b), at(eye, e, bottom, a)], cols[i]);
  }
};
/** A level face (a tread) at height y from x = a..b, from depth d0 back to d1. */
const lface = (c: Ctx, eye: View['eye'], a: number, b: number, y: number, d0: number, d1: number, col: string) =>
  poly(c, [at(eye, a, y, d0), at(eye, b, y, d0), at(eye, b, y, d1), at(eye, a, y, d1)], col);
const iline = (c: Ctx, p: [number, number], q: [number, number], col = INK, w = 1) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(...p); c.lineTo(...q); c.stroke(); };

/** A fan on the stands: a person by seed (sat, or up cheering), turned toward the stage; painted once. */
const fanAt = (c: Ctx, x: number, y: number, seed: number, s: -1 | 1, up: boolean) => {
  const sd = seed % 28;
  stillH(c, `fan-${sd}-${up ? 'u' : 's'}-${s}`, x, y, -40, -110, 80, 124, g => {
    g.scale(-s * 0.82, 0.82);
    drawPerson(g, { seed: sd * 7 + 3, outfit: 'guest', f: 0, pose: up ? 'cheer' : 'sit', mood: 'happy', shorts: sd % 3 === 0 });
  });
};

const drawStand = (c: Ctx, v: View, s: -1 | 1, hype: number, f: number) => {
  const eye = v.eye, e = faceX(s), cam = v.cam.x;
  // (on screen at all: its back corner (the nearest the middle) or its cut)
  const [bx] = at(eye, e, GY, SET_D);
  if (s < 0 ? bx < cam - 40 && e < cam - 40 : bx > cam + CANVAS_WIDTH + 40 && e > cam + CANVAS_WIDTH + 40) return;
  const St = STAND.map(c2 => hour(c2, 0.1)), lit2 = s > 0;
  const shades = (k: number) => [St[Math.min(5, k)], St[Math.max(0, k - 1)], St[Math.max(0, k - 1)], St[Math.max(0, k - 2)]];
  const Sy = SEAT_Y.map(c2 => hour(c2, 0.1)), Sr = SEAT_R.map(c2 => hour(c2, 0.1));
  const dOf = (j: number) => 1 - ((1 - SET_D) * (j + 0.5)) / SEATS;
  // The rows, outermost first: each riser, its tread (when he can see it), its seats and fans back to front
  for (let i = ROWS - 1; i >= 0; i--) {
    const xr = rowX(s, i), xo = rowX(s, i + 1), y0 = GY - rowH(i), y1 = GY - rowH(i + 1);
    vface(c, eye, xr, y1, y0, 1, SET_D, shades(lit2 ? 4 : 3));
    iline(c, at(eye, xr, y1, 1), at(eye, xr, y1, SET_D), St[5]);
    if (EYE_ABOVE(y1)) lface(c, eye, Math.min(xr, xo), Math.max(xr, xo), y1, 1, SET_D, St[4]);
    for (let j = SEATS - 1; j >= 0; j--) {
      const d = dOf(j), sxw = xo - s * 8, [px] = at(eye, sxw, y1, d);
      if (px < cam - 60 || px > cam + CANVAS_WIDTH + 60) continue;
      const P = Math.floor(j / 3 + i / 3) % 2 ? Sy : Sr;
      atDepth(c, eye, d, () => {
        // (the seat: its back up behind, its pan)
        const dir = -s;
        box(c, sxw - 4, y1 - 16, 8, 16, INK); box(c, sxw - 3, y1 - 15, 6, 14, P[3]); box(c, sxw - 3, y1 - 15, 6, 2, P[4]); box(c, sxw + (dir > 0 ? 1 : -3), y1 - 15, 2, 14, P[1]);
        box(c, Math.min(sxw, sxw + dir * 14) - 1, y1 - 7, 16, 5, INK); box(c, Math.min(sxw, sxw + dir * 14), y1 - 6, 14, 3, P[2]); box(c, Math.min(sxw, sxw + dir * 14), y1 - 6, 14, 1, P[4]);
        const seed = i * 17 + j * 5 + (s > 0 ? 300 : 0);
        if (h01(seed * 1.3) < 0.5) return; // (half empty)
        const up = hype > 0.55 && h01(seed * 2.1) < 0.8, bob = up && ((f >> 3) + seed) % 2 ? -2 : 0;
        fanAt(c, sxw + dir * 10, y1 - 2 + bob, seed, s, up);
      });
    }
  }
  // The podium walk: its tread, its rail along the edge, the face under it (ad boards in Steve's yellow and stunt red)
  const x0r = rowX(s, 0), yp = GY - POD;
  lface(c, eye, Math.min(e, x0r), Math.max(e, x0r), yp, 1, SET_D, St[3]);
  vface(c, eye, e, yp, GY - 120, 1, SET_D, shades(lit2 ? 5 : 4));
  const Y = STEVE.map(c2 => hour(c2, 0.1));
  for (let k = 0; k < 6; k++) {
    const a = 1 - ((1 - SET_D) * k) / 6, b = 1 - ((1 - SET_D) * (k + 0.85)) / 6;
    poly(c, [at(eye, e, yp + 10, a), at(eye, e, yp + 10, b), at(eye, e, GY - 128, b), at(eye, e, GY - 128, a)], k % 2 ? Y[lit2 ? 4 : 3] : RED_R[lit2 ? 4 : 3]);
    iline(c, at(eye, e, yp + 10, a), at(eye, e, yp + 10, b), k % 2 ? Y[5] : RED_R[5]);
  }
  iline(c, at(eye, e, yp, 1), at(eye, e, yp, SET_D), St[5]);
  // (the rail: posts going back, the top rail; dim, a rail never a ledge)
  for (let k = 0; k <= 8; k++) { const d = 1 - ((1 - SET_D) * k) / 8; iline(c, at(eye, e, yp, d), at(eye, e, yp - 26, d), IRON[3], 1); }
  iline(c, at(eye, e, yp - 26, 1), at(eye, e, yp - 26, SET_D), INK, 3); iline(c, at(eye, e, yp - 26, 1), at(eye, e, yp - 26, SET_D), IRON[4], 1);
  // The tire wall along its foot: six tiers, the stacks' seams going back, every other top tire painted
  const T = 6, th = 20, Rb = RUBBER;
  for (let t = 0; t < T; t++) {
    const top = GY - 120 + t * th, bot = top + th;
    vface(c, eye, e, top, bot, 1, SET_D, [Rb[lit2 ? 3 : 2], Rb[2], Rb[2], Rb[1]]);
    iline(c, at(eye, e, top + 1, 1), at(eye, e, top + 1, SET_D), Rb[lit2 ? 5 : 4]);
    iline(c, at(eye, e, bot - 1, 1), at(eye, e, bot - 1, SET_D), Rb[0], 2);
  }
  for (let k = 0; k < 5; k++) {
    const a = 1 - ((1 - SET_D) * k) / 5, b = 1 - ((1 - SET_D) * (k + 1)) / 5;
    iline(c, at(eye, e, GY - 120, a), at(eye, e, GY, a), INK, 2);
    // (the top tire of every other stack in yellow and white)
    poly(c, [at(eye, e, GY - 114, a), at(eye, e, GY - 114, b), at(eye, e, GY - 106, b), at(eye, e, GY - 106, a)], k % 2 ? Y[3] : '#E8E4DA');
  }
  // The cut at the play plane: the stand's section (stepped), hatched, the tunnel through the left one
  const pts: [number, number][] = [[e, GY], [e, GY - POD], [x0r, GY - POD]];
  for (let i = 0; i < ROWS; i++) { pts.push([rowX(s, i), GY - rowH(i + 1)]); pts.push([rowX(s, i + 1), GY - rowH(i + 1)]); }
  const xr = rowX(s, ROWS), outer = xr + s * 14;
  pts.push([xr, GY - rowH(ROWS) - RIM], [outer, GY - rowH(ROWS) - RIM], [outer, GY]);
  const Sh = SHELL.map(c2 => hour(c2, 0.1));
  poly(c, pts, Sh[2]);
  c.save(); c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
  c.strokeStyle = Sh[1]; c.lineWidth = 1; c.beginPath();
  const lo = Math.min(e, outer), hi = Math.max(e, outer);
  for (let x = Math.floor(lo / 8) * 8 - 500; x < hi; x += 8) { c.moveTo(x, GY); c.lineTo(x + 500, GY - 500); }
  c.stroke();
  // (the tunnel: the way back out, through the left one)
  if (s < 0) {
    const ta = Math.max(outer, x0 - 220), tb = e - 6, tt = GY - 150;
    box(c, ta, tt, tb - ta, GY - tt, '#0C0A0E');
    box(c, ta, tt, tb - ta, 14, '#060508'); box(c, ta, tt + 14, tb - ta, 40, '#141118'); box(c, ta, tt + 54, tb - ta, 60, '#1C1820'); box(c, ta, GY - 36, tb - ta, 36, '#26212A');
    checker(c, ta, tt + 52, tb - ta, 4, '#1C1820', 0, 2); checker(c, ta, GY - 38, tb - ta, 4, '#26212A', 0, 2);
    for (let x = tb - 40; x > ta; x -= 70) { box(c, x - 10, tt + 14, 20, 4, INK); box(c, x - 9, tt + 15, 18, 2, '#FFF2C0'); cone(c, x, tt + 18, GY, 18, 70, '#FFF2C0', 0.06); }
    // (EXIT, hung at its mouth, lit red)
    box(c, tb - 72, tt + 18, 1, 8, IRON[3]); box(c, tb - 30, tt + 18, 1, 8, IRON[3]);
    box(c, tb - 80, tt + 26, 58, 18, INK); box(c, tb - 79, tt + 27, 56, 16, '#3A0A0A'); box(c, tb - 79, tt + 27, 56, 1, '#6A1A14');
    words(c, 'EXIT', tb - 51, tt + 40, { sx: 2, sy: 1, fill: '#FF5A4A' });
    box(c, ta, tt - 4, tb - ta, 4, INK);
  }
  c.restore();
  // (the cut's edge: inked, the steps' noses catching the light)
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  for (let i = 0; i < ROWS; i++) box(c, Math.min(rowX(s, i), rowX(s, i + 1)), GY - rowH(i + 1), RW, 1, Sh[4]);
  box(c, Math.min(e, x0r), GY - POD, POD_W, 1, Sh[4]);
};
/** He's looking down on a level at y (world). */
const EYE_ABOVE = (y: number) => y > EYE_Y + 1;

// ---------------------------------------------------------------------------------------------------------------
// The truss over the stage, the marquee on it, Steve's banner off it, STEVE-O-VISION

const GELS = ['#FCA526', '#F25A52', '#FDE047', '#F8FAFC'];
const PARS = Array.from({ length: Math.floor((ARENA_W + 40) / 120) }, (_, i) => ARENA_L + 40 + i * 120);

/** A leg of the truss (stamped; local: its left chord's x at 0, the truss at 0): two chords, laced in a zigzag, a strut at
 *  each node, a sleeve block where it meets the truss, its base plate bolted down with a ballast block on it. */
const paintTrussLeg = (g: Ctx) => {
  const R = TRUSS.map(c2 => hour(c2, 0.06)), H = GY - TRUSS_Y;
  for (const [w, col] of [[3, INK], [1, R[2]]] as const) {
    g.strokeStyle = col; g.lineWidth = w; g.beginPath();
    for (let y = 18, k = 0; y < H - 22; y += 14, k++) { g.moveTo(k % 2 ? 14 : 2, y); g.lineTo(k % 2 ? 2 : 14, Math.min(H - 22, y + 14)); }
    g.stroke();
  }
  tubeV(g, 0, 0, H, 4, R); tubeV(g, 12, 0, H, 4, R);
  for (let y = 18; y < H - 22; y += 28) { box(g, 0, y, 16, 2, R[1]); box(g, 0, y, 16, 1, R[4]); }
  // (the sleeve block up top)
  box(g, -3, 0, 22, 16, INK); box(g, -2, 1, 20, 14, R[3]); box(g, -2, 1, 20, 2, R[5]); box(g, 14, 1, 4, 14, R[1]);
  for (const bx of [1, 13]) { box(g, bx, 6, 2, 2, R[0]); box(g, bx, 6, 1, 1, R[5]); }
  // (the base: a plate, bolted, a ballast block on it in stunt red)
  box(g, -9, H - 4, 34, 5, INK); box(g, -8, H - 3, 32, 3, R[2]); box(g, -8, H - 3, 32, 1, R[4]);
  for (const bx of [-6, 21]) { box(g, bx, H - 3, 2, 2, R[0]); box(g, bx, H - 3, 1, 1, R[5]); }
  const Rd = RED_R.map(c2 => hour(c2, 0.08));
  box(g, -3, H - 22, 22, 18, INK); box(g, -2, H - 21, 20, 16, Rd[3]); box(g, -2, H - 21, 20, 2, Rd[4]); box(g, -2, H - 21, 2, 16, Rd[4]); box(g, 14, H - 19, 4, 14, Rd[1]); checker(g, -2, H - 9, 20, 2, Rd[2], 0, 1);
  hazard(g, -2, H - 15, 20, 4, 0);
};

const drawTruss = (c: Ctx, state: GameState) => {
  if (!inView(state, ARENA_L - 80, ARENA_R + 80)) return;
  const a = Math.floor(Math.max(ARENA_L - 60, state.camera.x - 60) / 28) * 28, b = Math.min(ARENA_R + 60, state.camera.x + CANVAS_WIDTH + 60);
  const R = TRUSS.map(c2 => hour(c2, 0.06)), on = lit();
  // (its legs at the ends, down behind the stands)
  for (const lx of [ARENA_L - 50, ARENA_R + 40]) if (inView(state, lx - 20, lx + 30)) stillH(c, 'tleg', lx, TRUSS_Y, -12, -2, 40, GY - TRUSS_Y + 4, paintTrussLeg);
  truss(c, a, b, TRUSS_Y, 22, R, 14);
  // (its underside, a shade under the bottom chord)
  box(c, a, TRUSS_Y + 22, b - a, 2, R[0]);
  for (const px of PARS) if (px > a - 20 && px < b + 20) parCan(c, px, TRUSS_Y + 22, GELS[(px / 120) % GELS.length | 0], on, (h01(px) - 0.5) * 0.4);
};
/** After dark: the PAR cans' cones down to the floor (behind everything on it). */
const drawCones = (c: Ctx, state: GameState) => {
  const L = timeOfDay().lamps;
  if (L < 0.35) return;
  for (const px of PARS) if (inView(state, px - 90, px + 90)) {
    const aim = (h01(px) - 0.5) * 0.4;
    cone(c, px, TRUSS_Y + 42, GY + 12, 8, 150, GELS[(px / 120) % GELS.length | 0], 0.045 * L, -aim * 420);
    const fx = px - aim * 420;
    c.fillStyle = `rgba(255, 240, 200, ${(0.06 * L).toFixed(3)})`; c.beginPath(); c.ellipse(fx, GY + 8, 76, 14, 0, 0, Math.PI * 2); c.fill();
  }
};

/** The marquee on top of the truss: a black box framed in steel, a chaser border of bulbs, the name in bulbs. */
const MARQ = "STUNTMAN STEVE'S STUPENDOUS STUNTERY";
const paintMarquee = (g: Ctx, on: boolean, phase: number) => {
  const w = 900, h = 56, S = STEEL.map(c2 => hour(c2, 0.06));
  box(g, 0, 0, w, h, INK);
  box(g, 2, 2, w - 4, h - 4, S[2]); box(g, 2, 2, w - 4, 1, S[5]); box(g, 2, h - 3, w - 4, 1, S[0]);
  box(g, 6, 6, w - 12, h - 12, '#0E0C10'); checker(g, 6, 6, w - 12, 4, '#1C1820', 0, 2);
  for (let k = 0; k < (w - 12) / 10; k++) {
    const x = 9 + k * 10, lit2 = on && (k + phase) % 3 !== 0;
    for (const y of [8, h - 12]) { box(g, x, y, 4, 4, INK); box(g, x, y, 3, 3, lit2 ? '#FFF2B0' : '#6A5A3A'); }
  }
  words(g, MARQ, w / 2, 41, marqueeLook(3, 3, '#FACC15', on));
};

/** Steve's banner off the truss: vinyl, yellow, its folds in steps, grommets and ropes; him on it, his name. */
const paintBanner = (g: Ctx) => {
  const w = 240, h = 210, Y = STEVE.map(c2 => hour(c2, 0.05)), Rd = RED_R.map(c2 => hour(c2, 0.05));
  box(g, 0, 0, w, h, INK);
  box(g, 2, 2, w - 4, h - 4, Y[3]);
  // (the folds: soft vertical bands, lit and shaded, dithered at their edges)
  for (let k = 0; k < 6; k++) { const fx = 14 + k * 38; box(g, fx, 2, 6, h - 4, Y[2]); checker(g, fx + 6, 2, 4, h - 4, Y[2], 0, 2); box(g, fx - 6, 2, 4, h - 4, Y[4]); }
  box(g, 2, 2, w - 4, 3, Y[5]); box(g, 2, h - 6, w - 4, 4, Y[1]);
  words(g, 'THE ONE. THE ONLY.', w / 2, 24, { sx: 1, sy: 2, fill: [Rd[2], Rd[1]], dither: true, gap: 1 });
  g.save(); g.translate(w / 2 - 6, 178); g.scale(1.5, 1.5); drawSteve(g, 0, 0, 1, 'thumb', 0, {}); g.restore();
  box(g, 2, h - 34, w - 4, 28, Rd[3]); box(g, 2, h - 34, w - 4, 2, Rd[4]); box(g, 2, h - 8, w - 4, 2, Rd[1]);
  words(g, 'STUNTMAN STEVE', w / 2, h - 12, enamel({ sx: 2, sy: 2 }, '#FEF08A', INK));
  // (grommets)
  for (const gx of [8, w / 2, w - 10]) for (const gy of [7, h - 40]) { box(g, gx - 2, gy - 2, 5, 5, INK); box(g, gx - 1, gy - 1, 3, 3, '#C8CDD4'); }
};

/** STEVE-O-VISION's still parts, painted once for the hour (local: its top middle at 0, 0): the chains and their
 *  shackles off a yoke, the speaker stacks either side (grille cloth, cones in stepped rings, steel corners), the case
 *  (bevelled steel, riveted, its bracket plates), the screen's well, the header in lit lettering, the louvers. */
const paintJumbo = (g: Ctx, top: number) => {
  const S = STEEL.map(c2 => hour(c2, 0.06)), Bk = ['#08080A', '#121216', '#1C1C22', '#28282F', '#36363E', '#4A4A54'], R = TRUSS.map(c2 => hour(c2, 0.06));
  // (the chains, the yoke they hang it by, shackles at both ends)
  for (const s of [-1, 1]) {
    chain(g, s * 100, top, -10, R);
    box(g, s * 100 - 3, top - 1, 7, 5, INK); box(g, s * 100 - 2, top, 5, 3, R[4]);
    box(g, s * 100 - 3, -14, 7, 6, INK); box(g, s * 100 - 2, -13, 5, 4, R[3]); box(g, s * 100 - 2, -13, 5, 1, R[5]);
  }
  box(g, -168, -9, 336, 6, INK); box(g, -167, -8, 334, 4, R[3]); box(g, -167, -8, 334, 1, R[5]); box(g, -167, -5, 334, 1, R[1]);
  for (let k = -160; k <= 160; k += 40) { box(g, k, -7, 2, 2, R[1]); box(g, k, -7, 1, 1, R[5]); }
  // (the speaker stacks: cabinets in black carpet, the grille cloth's weave, cones in steps, steel corners)
  for (const s of [-1, 1]) {
    const sx = s * 146 - 20;
    box(g, sx - 1, -1, 42, 132, INK);
    box(g, sx, 0, 40, 130, Bk[2]); box(g, sx, 0, 40, 2, Bk[5]); box(g, sx, 2, 2, 128, Bk[4]); box(g, sx + 36, 0, 4, 130, Bk[1]); checker(g, sx + 34, 2, 2, 128, Bk[1], 0, 1);
    box(g, sx, 128, 40, 2, Bk[0]);
    for (let k = 0; k < 3; k++) {
      const cy = 22 + k * 42, cx = sx + 20;
      box(g, sx + 2, cy - 19, 32, 1, Bk[0]); box(g, sx + 2, cy - 18, 32, 1, Bk[3]);
      // (the grille cloth: a weave of darker cells)
      checker(g, sx + 3, cy - 17, 30, 36, Bk[1], k, 2);
      const disc = (dx: number, dy: number, r: number, col: string) => { g.fillStyle = col; g.beginPath(); g.arc(cx + dx, cy + dy, r, 0, Math.PI * 2); g.fill(); };
      disc(0, 0, 15, INK); disc(0, 0, 13, Bk[4]); disc(1, 1, 12, Bk[3]); disc(1, 1, 10, Bk[2]); disc(1, 1, 8, Bk[1]); disc(2, 2, 6, Bk[0]);
      disc(0, 0, 4, Bk[3]); disc(-1, -1, 2, Bk[5]);
      box(g, cx - 9, cy - 9, 3, 1, Bk[5]); box(g, cx - 10, cy - 8, 1, 3, Bk[5]);
      for (const [bx, by] of [[-13, -13], [12, -13], [-13, 12], [12, 12]]) { box(g, cx + bx, cy + by, 2, 2, S[2]); box(g, cx + bx, cy + by, 1, 1, S[5]); }
    }
    for (const [cx, cy] of [[sx - 1, -1], [sx + 35, -1], [sx - 1, 125], [sx + 35, 125]]) { box(g, cx, cy, 6, 6, INK); box(g, cx + 1, cy + 1, 4, 4, S[3]); box(g, cx + 1, cy + 1, 4, 1, S[5]); box(g, cx + 2, cy + 2, 1, 1, S[6]); }
  }
  // (the case: steel, bevelled (lit along its top and left, shaded right and under), dithered into its face, riveted)
  box(g, -126, -6, 252, 154, INK);
  box(g, -125, -5, 250, 152, S[3]);
  box(g, -125, -5, 250, 2, S[5]); box(g, -125, -3, 250, 1, S[4]); box(g, -125, -5, 2, 152, S[5]); box(g, -123, -5, 1, 152, S[4]);
  box(g, -125, 140, 250, 7, S[2]); checker(g, -125, 138, 250, 2, S[2], 0, 1); box(g, -125, 146, 250, 1, S[0]);
  box(g, 121, -5, 4, 152, S[1]); checker(g, 119, -5, 2, 152, S[2], 0, 1);
  for (let k = -116; k <= 116; k += 16) for (const ry of [-3, 144]) { box(g, k, ry, 2, 2, S[1]); box(g, k, ry, 1, 1, S[6]); }
  for (let k = 6; k <= 126; k += 20) for (const rx of [-124, 122]) { box(g, rx, k, 2, 2, S[1]); box(g, rx, k, 1, 1, S[6]); }
  // (bracket plates at its corners, where the chains' yoke takes it)
  for (const s of [-1, 1]) { const px = s * 100 - 8; box(g, px - 1, -7, 18, 10, INK); box(g, px, -6, 16, 8, S[2]); box(g, px, -6, 16, 1, S[5]); box(g, px + 3, -3, 2, 2, INK); box(g, px + 11, -3, 2, 2, INK); }
  // (the screen's well: inked, a lip of shine along its top and left)
  box(g, -121, -1, 242, 132, INK); box(g, -120, 0, 240, 130, '#0B1020'); box(g, -117, 3, 234, 1, '#2A3450'); box(g, -117, 3, 1, 111, '#1E2840');
  // (the header strip: black, the name in lit lettering, bulbs either end)
  box(g, -120, 114, 240, 16, '#0E0E12'); box(g, -120, 114, 240, 1, S[1]); box(g, -120, 129, 240, 1, '#26262C');
  words(g, 'STEVE-O-VISION', 0, 127, { sx: 1, sy: 1, fill: ['#FFFBD8', '#FDE047', '#E8A60C'], glow: '#4A3206', gap: 1 });
  for (const bx of [-110, -100, 98, 108]) { box(g, bx - 1, 119, 5, 5, INK); box(g, bx, 120, 3, 3, '#FACC15'); box(g, bx, 120, 1, 1, '#FFFBD8'); }
  // (the louvers along its foot: slats, lit tops, the dark between)
  box(g, -118, 132, 236, 12, INK);
  for (let k = -116; k < 116; k += 8) { box(g, k, 133, 6, 10, S[2]); box(g, k, 133, 6, 1, S[5]); box(g, k + 5, 134, 1, 9, S[1]); }
};

/** STEVE-O-VISION, hung on its chains (the still parts: paintJumbo, stamped); what's on it live. */
const drawJumbotron = (c: Ctx, x: number, y: number, f: number, o: { replay: number; hurtFlash: number; cleared: boolean }) => {
  const top = TRUSS_Y + 24 - y;
  stillH(c, 'jumbo', x, y, -172, top - 4, 344, 156 - top, g => paintJumbo(g, top));
  c.save(); c.beginPath(); c.rect(x - 116, y + 4, 232, 110); c.clip();
  if (o.cleared) {
    // (NO SIGNAL over the color bars, snow over them)
    const bars = ['#C8C8C8', '#C8C800', '#00C8C8', '#00C800', '#C800C8', '#C80000', '#0000C8'];
    bars.forEach((col, i) => box(c, x - 116 + i * 33.2, y + 4, 34, 80, col));
    for (let i = 0; i < 7; i++) box(c, x - 116 + i * 33.2, y + 84, 34, 10, bars[6 - i]);
    box(c, x - 116, y + 94, 232, 20, '#141418');
    for (let i = 0; i < 90; i++) box(c, x - 116 + h01(i * 3.1 + f) * 232, y + 4 + h01(i * 1.7 + f * 0.3) * 110, 2, 1, i % 2 ? '#FFFFFF' : '#606068');
    box(c, x - 64, y + 46, 128, 22, INK); words(c, 'NO SIGNAL', x, y + 63, print({ sx: 2, sy: 2 }, '#E8ECF0'));
  } else if (o.replay > 0) {
    // (INSTANT REPLAY: him falling out of the sky, again and again, over the stands; REC blinking)
    const k = (o.replay % 90) / 90;
    ['#3A6AC8', '#5A8AE0', '#86AEEC', '#B6D0F4'].forEach((col, i) => box(c, x - 116, y + 4 + i * 20, 232, 21, col));
    for (let i = 0; i < 12; i++) box(c, x - 116 + i * 20, y + 76 - (i % 3) * 4, 20, 20, i % 2 ? '#5A524C' : '#6E6660');
    box(c, x - 116, y + 96, 232, 18, '#3A3638'); box(c, x - 116, y + 96, 232, 1, '#FACC15');
    const my = y + 10 + k * 84;
    c.save(); c.translate(x, my); c.rotate(k * 9);
    box(c, -7, -12, 14, 24, INK); box(c, -6, -11, 12, 11, '#E0A27A'); box(c, -6, -11, 4, 11, '#F3BE90'); box(c, -6, 0, 12, 11, '#1E46B8'); box(c, -4, -14, 8, 3, '#5A3A1E');
    c.restore();
    words(c, 'INSTANT REPLAY', x, y + 22, print({ sx: 1, sy: 2 }, '#FFFFFF', INK));
    if ((f >> 4) % 2) { box(c, x + 82, y + 10, 6, 6, '#F02A2A'); words(c, 'REC', x + 102, y + 16, print(1, '#FFFFFF')); }
  } else if (o.hurtFlash > 0) {
    // (OUCH, on a starburst)
    box(c, x - 116, y + 4, 232, 110, '#5A0A0A');
    for (let i = 0; i < 16; i++) { const a = (i * Math.PI) / 8 + f * 0.05; c.fillStyle = i % 2 ? '#8E1616' : '#BC2222'; c.beginPath(); c.moveTo(x, y + 60); c.lineTo(x + Math.cos(a) * 160, y + 60 + Math.sin(a) * 160); c.lineTo(x + Math.cos(a + 0.39) * 160, y + 60 + Math.sin(a + 0.39) * 160); c.closePath(); c.fill(); }
    words(c, 'OUCH', x, y + 76, { sx: 4, sy: 4, fill: ['#FFF2B0', '#FDE047', '#FACC15'], dither: true, shadow: INK, drop: 2, gap: 1 });
  } else {
    // (his two seconds, FILM 1986: a sepia street, a red car tearing by; for a beat, there he is behind it; then gone)
    const t = f % 240;
    ['#7A6450', '#947A60', '#AE9270', '#C4A882'].forEach((col, i) => box(c, x - 116, y + 4 + i * 15, 232, 16, col));
    for (let i = 0; i < 6; i++) { const bx = x - 116 + i * 42, bh = 22 + (i % 3) * 10; box(c, bx, y + 80 - bh, 38, bh, i % 2 ? '#5A4636' : '#6A5442'); for (let k = 0; k < 3; k++) box(c, bx + 6 + k * 10, y + 86 - bh, 5, 5, '#3A2C22'); }
    box(c, x - 116, y + 80, 232, 34, '#4A3E34'); box(c, x - 116, y + 80, 232, 1, '#7A6A58'); for (let k = 0; k < 232; k += 24) box(c, x - 116 + k, y + 96, 12, 2, '#A89070');
    if (t > 60 && t < 130) { c.save(); c.translate(x + 20, y + 100); c.scale(0.62, 0.62); drawSteve(c, 0, 0, -1, 'sidestep', f, {}); c.restore(); }
    const cx = x - 160 + ((t * 4) % 440);
    box(c, cx - 41, y + 75, 82, 24, INK); box(c, cx - 40, y + 76, 80, 22, '#B42222'); box(c, cx - 40, y + 76, 80, 3, '#E05048'); box(c, cx - 20, y + 63, 44, 14, INK); box(c, cx - 19, y + 64, 42, 12, '#8E1616'); box(c, cx - 14, y + 66, 30, 6, '#4A6A88');
    for (const wx of [cx - 26, cx + 24]) { box(c, wx - 7, y + 94, 14, 10, INK); box(c, wx - 4, y + 96, 8, 6, '#5E6470'); }
    for (let k = 0; k < 3; k++) box(c, cx - 70 - k * 14, y + 82 + k * 5, 18, 1, '#E8DCC8');
    if (t > 60 && t < 130) words(c, "THAT'S HIM!", x + 20, y + 22, print({ sx: 1, sy: 2 }, '#FACC15', INK));
    // (the film: grain, a scratch, the frame's edge)
    for (let i = 0; i < 26; i++) box(c, x - 116 + h01(i * 2.7 + f) * 232, y + 4 + h01(i * 3.9 + f * 0.7) * 110, 1, 1, i % 2 ? '#FFF6E0' : '#2A2018');
    if ((f >> 3) % 5 === 0) box(c, x - 60 + (f % 7) * 18, y + 4, 1, 110, '#E8DCC8');
    words(c, 'FILM 1986', x + 80, y + 110, print(1, '#E7E5E4'));
  }
  // (scanlines)
  c.fillStyle = 'rgba(0, 0, 0, 0.18)'; for (let yy = y + 4; yy < y + 114; yy += 3) c.fillRect(x - 116, yy, 232, 1);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------

/** The stage behind everything that moves (the cars, ramps, hoops: fight.ts draws those over it). */
export const drawStage = (c: Ctx, state: GameState, opts: { cleared: boolean; hype: number; replay: number; hurtFlash: number; doorsLit: boolean; bays?: BayLook[] }) => {
  const v = sview(state), f = state.frame;
  drawFloor(c, state, v);
  drawSet(c, state, opts.doorsLit, opts.bays);
  // The stands up both ends, going back to the set (over its ends, the floor's edges)
  drawStand(c, v, -1, opts.hype, f);
  drawStand(c, v, 1, opts.hype, f);
  // The truss, the marquee on top of it, the banner off it, the jumbotron
  drawTruss(c, state);
  const mq = ARENA_MID;
  if (inView(state, mq - 460, mq + 460)) {
    const on = !opts.cleared;
    const phase = on ? (f >> 3) % 3 : 0;
    for (const s of [-420, 420]) { tubeV(c, mq + s, TRUSS_Y - 12, TRUSS_Y, 4, TRUSS); }
    stillH(c, `marq-${on ? phase : 'x'}`, mq - 450, TRUSS_Y - 66, 0, 0, 900, 56, g => paintMarquee(g, on, phase));
    if (opts.cleared) {
      // (SHOW CANCELED, taped over it crooked)
      // (crooked: turned on a whole pixel, so the live paint doesn't crawl)
      turned(c, mq, TRUSS_Y - 38, -0.06, () => {
        c.translate(mq, TRUSS_Y - 38);
        box(c, -172, -21, 344, 42, INK); box(c, -170, -19, 340, 38, '#F4F1EA'); box(c, -170, -19, 340, 2, '#FFFFFF'); box(c, -170, 16, 340, 3, '#D8D2C6');
        for (const tx of [-176, 156]) { box(c, tx, -22, 20, 10, 'rgba(232, 220, 180, 0.85)'); box(c, tx, 12, 20, 10, 'rgba(232, 220, 180, 0.85)'); }
        words(c, 'SHOW CANCELED', 0, 10, { sx: 3, sy: 3, fill: ['#DC2626', '#B42222'], dither: true, gap: 1 });
      });
    }
  }
  const bx = ARENA_L + 520;
  if (inView(state, bx - 130, bx + 130)) {
    for (const s of [-1, 0, 1]) { const rx = bx + s * 112; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(rx, TRUSS_Y + 22); c.lineTo(rx + s * 4, TRUSS_Y + 52); c.stroke(); c.strokeStyle = '#D6B98C'; c.lineWidth = 1; c.stroke(); }
    stillH(c, 'banner', bx - 120, TRUSS_Y + 46, 0, 0, 240, 210, paintBanner);
  }
  const jx = ARENA_R - 560;
  if (inView(state, jx - 180, jx + 180)) drawJumbotron(c, jx, TRUSS_Y + 60, f, opts);
  drawCones(c, state);
  // The crash mats by Steve's two ends, lying flat on the floor: vinyl, piped round, stitched, handles and CRASH MAT
  // along the front face. He comes down off the fling onto the left one's middle: nothing stands on either or in front
  // of it (no pyro jets set under them: PYRO_X).
  for (const side of [-1, 1] as const) {
    const mx = MAT_X(side), hw = MAT_HW;
    if (!inView(state, mx - hw - 20, mx + hw + 20)) continue;
    const M = MAT.map(c2 => hour(c2, 0.1)), H = 7;
    const back = Math.round(GY - 44 * ZK) - H, front = Math.round(GY + 22 * ZK) - H, foot = front + H;
    // (its front half lies on the bent floor in front of the line: its front edge fanned out from the eye as the floor
    // under it is (a flat box, its sides straight down the screen, it slid about on the floor as the camera went by);
    // its back edge, behind the line, as it was. Each end's thickness shows down its side when the eye's past it)
    const ex = v.eye.x, kf = 1 + (foot - GY) * BEND, fx = (x: number) => ex + (x - ex) * kf;
    const L0 = mx - hw, R0 = mx + hw, L1 = fx(L0), R1 = fx(R0), seeL = ex < L0 - 1, seeR = ex > R0 + 1;
    const lerp = (x: number, t: number) => x + (fx(x) - x) * t, tb = 0.4, yb = back + Math.round((front - back) * tb);
    c.fillStyle = 'rgba(10, 8, 14, 0.35)'; c.fillRect(L1 - 3, foot - 1, R1 - L1 + 8, 4);
    poly(c, [[L0 - 1, back - 1], [R0 + 1, back - 1], ...(seeR ? [[R0 + 1, back + H]] as [number, number][] : [[R1 + 1, front]] as [number, number][]), [R1 + 1, foot + 1], [L1 - 1, foot + 1], ...(seeL ? [[L0 - 1, back + H]] as [number, number][] : [[L1 - 1, front]] as [number, number][])], INK);
    if (seeL) poly(c, [[L0, back], [L1, front], [L1, foot], [L0, back + H]], M[2]);
    if (seeR) poly(c, [[R0, back], [R1, front], [R1, foot], [R0, back + H]], M[1]);
    // (the top, going back: lit at the front, a shade darker going back, dithered between; piped round)
    const top: [number, number][] = [[L0, back], [R0, back], [R1, front], [L1, front]];
    poly(c, top, M[3]);
    poly(c, [[L0, back], [R0, back], [lerp(R0, tb), yb], [lerp(L0, tb), yb]], M[2]);
    c.save(); c.beginPath(); top.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
    checker(c, Math.min(L0, L1), yb, Math.max(R0, R1) - Math.min(L0, L1), 2, M[2], 0, 1);
    c.restore();
    box(c, L0, back, hw * 2, 1, M[4]); box(c, L1, front - 1, R1 - L1, 1, M[5]);
    c.lineWidth = 1;
    c.strokeStyle = M[4]; c.beginPath(); c.moveTo(L0 + 0.5, back); c.lineTo(L1 + 0.5, front); c.stroke();
    c.strokeStyle = M[1]; c.beginPath(); c.moveTo(R0 - 0.5, back); c.lineTo(R1 - 0.5, front); c.stroke();
    // (the stitched seams across it, front to back)
    for (let k = mx - hw + 35; k < mx + hw - 10; k += 35) {
      c.strokeStyle = M[1]; c.beginPath(); c.moveTo(k + 0.5, back + 2); c.lineTo(lerp(k, 0.97) + 0.5, front - 1); c.stroke();
      c.strokeStyle = M[4]; c.beginPath(); c.moveTo(k + 1.5, back + 2); c.lineTo(lerp(k, 0.97) + 1.5, front - 1); c.stroke();
    }
    // (the front face: its handles, CRASH MAT on it)
    box(c, L1, front, R1 - L1, H, M[2]); box(c, L1, foot - 1, R1 - L1, 1, M[0]);
    for (const hx of [fx(mx - hw + 10), fx(mx + hw - 20)]) { box(c, hx, front + 2, 10, 3, INK); box(c, hx + 1, front + 3, 8, 1, M[1]); }
    words(c, 'CRASH MAT', Math.round(fx(mx)), foot - 1, { sx: 1, sy: 1, fill: M[5], stencil: true, gap: 1 });
  }
  // (an old wreck or two lying about, after)
  if (opts.cleared) {
    const wrecks: [number, 'red' | 'blue', number][] = [[ARENA_L + 640, 'red', 0.4], [ARENA_L + 1320, 'blue', 2.6]];
    for (const [wx, col, yaw] of wrecks) if (inView(state, wx - 100, wx + 100)) drawCar(c, { color: col, x: wx, y: GY, z: -40, yaw, crumple: 0.9, burnt: 1, driver: false });
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The floor's marks, the ramps, the hoops, the rings of fire, the pyro

/** The skid marks being laid down: a pair of them (its two back tires), two tones of rubber, a little smoke-gray at
 *  their edge; on the bent floor where it's bent (`ex` the eye). */
export const drawSkids = (c: Ctx, skids: Skid[], ex: number) => {
  const B = CAR.W * 0.42;
  for (const [col, dy, h] of [['rgba(10, 8, 8, 0.6)', -1, 2], ['rgba(40, 36, 36, 0.45)', 1, 1]] as const) {
    c.fillStyle = col; c.beginPath();
    for (const s of skids) for (const sb of [-1, 1]) {
      const yaw = s.yaw ?? 0, z = s.z + Math.cos(yaw) * sb * B, x = onFloorX(s.x - Math.sin(yaw) * sb * B, z, ex);
      c.rect(Math.round(x - 3), Math.round(GY + z * ZK + dy), 6, h);
    }
    c.fill();
  }
};

/** A ramp on its dolly in the back lane (going back across it: its deck in diamond plate, its near side's steel with
 *  the lightening holes, the hazard paint on its lip, the casters): dimmed, no lip: not his to stand on. */
export const drawRamp = (c: Ctx, r: Ramp, f: number) => {
  const half = 30, foot = r.x - r.dir * RAMP.LEN, H = RAMP.H;
  const yN = GY + (LANE_BACK + half) * ZK, yF = GY + (LANE_BACK - half) * ZK;
  const St = scen('#8A92A0'), Dk = scen('#5E6470'), Y = scen('#FACC15');
  // (the far side's casters peeking out)
  for (const wx of [foot + r.dir * 18, r.x - r.dir * 14]) { box(c, wx - 5, yF - 2, 10, 7, INK); box(c, wx - 3, yF - 1, 6, 4, RUBBER[2]); }
  // (the deck: going back in bands, the diamond plate's studs)
  const nF: [number, number] = [foot, yN], nL: [number, number] = [r.x, yN - H], fL: [number, number] = [r.x, yF - H], fF: [number, number] = [foot, yF];
  poly(c, [[nF[0], nF[1] + 1], [nL[0], nL[1] + 1], [fL[0], fL[1] - 1], [fF[0], fF[1] - 1]], INK);
  const band = (u0: number, u1: number, col: string) => poly(c, [[foot, yN - (yN - yF) * u0], [r.x, yN - H - (yN - yF) * u0], [r.x, yN - H - (yN - yF) * u1], [foot, yN - (yN - yF) * u1]], col);
  band(0, 0.34, Dk[4]); band(0.34, 0.68, Dk[3]); band(0.68, 1, Dk[2]);
  for (let k = 1; k < 12; k++) for (let j = 0; j < 4; j++) {
    const u = k / 12, w = (j + 0.5) / 4, px = foot + (r.x - foot) * u, py = yN - H * u - (yN - yF) * w;
    box(c, px - 1, py, 2, 1, (k + j) % 2 ? Dk[5] : Dk[1]);
  }
  // (the hazard band across its lip)
  const lipU = 0.9;
  poly(c, [[foot + (r.x - foot) * lipU, yN - H * lipU], [r.x, yN - H], [r.x, yF - H], [foot + (r.x - foot) * lipU, yF - H * lipU]], Y[3]);
  for (let j = 0; j < 6; j++) { const w0 = j / 6, w1 = (j + 0.5) / 6; poly(c, [[foot + (r.x - foot) * lipU, yN - H * lipU - (yN - yF) * w0], [r.x, yN - H - (yN - yF) * w0], [r.x, yN - H - (yN - yF) * w1], [foot + (r.x - foot) * lipU, yN - H * lipU - (yN - yF) * w1]], INK); }
  // (the near side: steel plate in steps, lightening holes, hazard stripes along its foot)
  poly(c, [[foot - r.dir * 2, yN + 2], [r.x + r.dir * 2, yN + 2], [r.x + r.dir * 2, yN - H - 3]], INK);
  poly(c, [[foot, yN], [r.x, yN], [r.x, yN - H]], St[3]);
  poly(c, [[foot + (r.x - foot) * 0.55, yN], [r.x, yN], [r.x, yN - H], [foot + (r.x - foot) * 0.55, yN - H * 0.55]], St[2]);
  c.strokeStyle = St[5]; c.lineWidth = 1; c.beginPath(); c.moveTo(foot, yN - 1); c.lineTo(r.x, yN - H - 1); c.stroke();
  for (let k = 0; k < 3; k++) {
    const u = 0.42 + k * 0.18, hx = foot + (r.x - foot) * u, hh = H * u * 0.45;
    if (hh < 6) continue;
    c.fillStyle = INK; c.beginPath(); c.ellipse(hx, yN - hh * 0.8, 4, Math.min(6, hh * 0.5), 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = St[0]; c.beginPath(); c.ellipse(hx + 0.5, yN - hh * 0.8 + 0.5, 3, Math.min(5, hh * 0.5 - 1), 0, 0, Math.PI * 2); c.fill();
  }
  c.save(); c.beginPath(); c.moveTo(foot, yN); c.lineTo(r.x, yN); c.lineTo(r.x, yN - H); c.closePath(); c.clip();
  for (let x = Math.min(foot, r.x) - 10; x < Math.max(foot, r.x) + 10; x += 12) { c.fillStyle = Y[3]; c.beginPath(); c.moveTo(x, yN); c.lineTo(x + 6, yN); c.lineTo(x + 12, yN - 6); c.lineTo(x + 6, yN - 6); c.closePath(); c.fill(); }
  c.restore();
  box(c, Math.min(foot, r.x), yN - 6, Math.abs(r.x - foot), 1, INK);
  // (the near casters, turning as it creeps)
  for (const wx of [foot + r.dir * 20, r.x - r.dir * 14]) {
    box(c, wx - 7, yN - 1, 14, 9, INK); box(c, wx - 5, yN, 10, 6, f % 8 < 4 ? RUBBER[2] : RUBBER[3]); box(c, wx - 1, yN + 2, 2, 2, STEEL[4]);
  }
};

/** A ramp's hoop (on its trolley on the truss, over the top of the jump): half of it (`front`: the near half): a hula
 *  hoop taped pink and white, lit along its top; hot, flames up off it. */
export const drawHoop = (c: Ctx, r: Ramp, front: boolean, hot: boolean, f: number) => {
  const h = hoopOf(r), x = h.x, y = h.y + h.z * ZK, rx = 16, ry = 62;
  if (!front) {
    // (the trolley on the truss's bottom chord, its wheels; the cables down to the hoop)
    const S = STEEL;
    box(c, x - 19, TRUSS_Y + 13, 38, 12, INK); box(c, x - 18, TRUSS_Y + 14, 36, 10, S[2]); box(c, x - 18, TRUSS_Y + 14, 36, 1, S[4]);
    for (const wx of [x - 12, x + 8]) { box(c, wx, TRUSS_Y + 10, 5, 5, INK); box(c, wx + 1, TRUSS_Y + 11, 3, 3, S[4]); }
    box(c, x - 4, TRUSS_Y + 24, 8, 6, INK); box(c, x - 3, TRUSS_Y + 25, 6, 4, '#FACC15');
    for (const s of [-1, 1]) { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(x + s * 3, TRUSS_Y + 30); c.lineTo(x, y - ry); c.stroke(); c.strokeStyle = S[4]; c.lineWidth = 1; c.stroke(); }
  }
  const a0 = front ? -Math.PI / 2 : Math.PI / 2, a1 = front ? Math.PI / 2 : Math.PI * 1.5;
  c.lineWidth = 9; c.strokeStyle = INK; c.beginPath(); c.ellipse(x, y, rx, ry, 0, a0, a1); c.stroke();
  // (the tape: pink and white in turns)
  const n = 10, cols = front ? ['#F472B6', '#FDF2F8'] : ['#BE185D', '#D8B4C8'];
  c.lineWidth = 6;
  for (let i = 0; i < n; i++) { c.strokeStyle = cols[i % 2]; c.beginPath(); c.ellipse(x, y, rx, ry, 0, a0 + ((a1 - a0) * i) / n, a0 + ((a1 - a0) * (i + 1)) / n); c.stroke(); }
  if (front) { c.lineWidth = 1; c.strokeStyle = '#FFFFFF'; c.beginPath(); c.ellipse(x - 1, y - 1, rx - 2, ry - 2, 0, -Math.PI / 2, -Math.PI * 0.1); c.stroke(); c.strokeStyle = '#831843'; c.beginPath(); c.ellipse(x + 1, y + 1, rx + 1, ry + 1, 0, Math.PI * 0.1, Math.PI / 2); c.stroke(); }
  // (hot: on fire, the flames licking up off it)
  if (hot) for (let i = 0; i < 6; i++) {
    const a = a0 + ((a1 - a0) * (i + 0.5)) / 6, fx = x + Math.cos(a) * rx, fy = y + Math.sin(a) * ry;
    flame(c, fx, fy + 2, front ? 12 : 9, front ? 20 : 14, f, i * 7 + (front ? 0 : 50) + Math.round(r.x / 50));
  }
};

/** The ring of fire over his end of the stage: hung off the truss, wick-wrapped steel, flames round it (`front`: the
 *  near half). */
export const RING_UP = 330, RING_R = 48;
export const ringAt = (side: 1 | -1) => ({ x: STEVE_AT(side) + side * 10, y: GY - RING_UP });
export const drawRing = (c: Ctx, side: 1 | -1, front: boolean, lit3: boolean, f: number, tilt = 0) => {
  const { x, y } = ringAt(side), rx = RING_R, ry = RING_R * 0.85;
  if (!front) for (const s of [-1, 1]) { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(x + s * rx * 0.7, y - ry * 0.7); c.lineTo(x + s * 8, TRUSS_Y + 24); c.stroke(); c.strokeStyle = STEEL[4]; c.lineWidth = 1; c.stroke(); }
  c.save(); c.translate(x, y); c.rotate(tilt);
  const a0 = front ? 0 : Math.PI, a1 = front ? Math.PI : Math.PI * 2;
  c.lineWidth = 10; c.strokeStyle = INK; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, a0, a1); c.stroke();
  c.lineWidth = 7; c.strokeStyle = front ? STEEL[3] : STEEL[2]; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, a0, a1); c.stroke();
  c.lineWidth = 2; c.strokeStyle = front ? STEEL[5] : STEEL[3]; c.beginPath(); c.ellipse(0, -2, rx, ry, 0, a0, a1); c.stroke();
  // (the wick wrapped round it: dark bands, scorched)
  c.lineWidth = 8;
  for (let i = 0; i < 12; i++) { const a = a0 + ((a1 - a0) * (i + 0.5)) / 12; c.strokeStyle = lit3 ? '#2A1A12' : '#3A2E26'; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, a - 0.06, a + 0.06); c.stroke(); }
  if (lit3) for (let i = 0; i < 9; i++) {
    const a = a0 + ((a1 - a0) * (i + 0.5)) / 9, fx = Math.cos(a) * rx, fy = Math.sin(a) * ry;
    flame(c, fx, fy + 2, front ? 14 : 10, front ? 24 : 16, f, i * 5 + (front ? 0 : 40) + (side > 0 ? 100 : 0));
  }
  c.restore();
};

/** The pyro jets along the front of the stage (set into the floor: steel, grilled, an armed lamp), and their columns of
 *  fire when they go off (stepped tongues, a white core, the glow on the floor). */
export const PYRO_X = Array.from({ length: Math.floor(ARENA_W / 130) }, (_, i) => ARENA_L + 65 + i * 130)
  .filter(px => Math.abs(px - MAT_X(-1)) > MAT_HW + 20 && Math.abs(px - MAT_X(1)) > MAT_HW + 20);
/** A pyro jet's still parts (stamped): the floor plate it's set in (diamond plate, bolted at the corners, hazard paint
 *  round its front), the nozzle's grille in slots lit along their lips, the armed lamp's housing, the cable going back. */
const paintPyroJet = (g: Ctx) => {
  const S = STEEL.map(c2 => hour(c2, 0.08));
  // (the cable back to the board, taped down)
  box(g, 12, -7, 10, 2, INK); box(g, 12, -7, 10, 1, '#3A3A44'); box(g, 16, -8, 3, 4, '#B8A060');
  // (the plate: inked, lit along its back edge, diamond plate studs, a bolt at each corner)
  box(g, -20, -6, 40, 13, INK); box(g, -19, -5, 38, 11, S[2]); box(g, -19, -5, 38, 1, S[4]); box(g, -19, 5, 38, 1, S[1]);
  for (let k = -17; k < 18; k += 4) for (const yy of [-3, 1]) box(g, k + (yy > 0 ? 2 : 0), yy, 2, 1, (k / 4 + yy) % 2 ? S[4] : S[1]);
  for (const [bx, by] of [[-18, -4], [16, -4], [-18, 3], [16, 3]]) { box(g, bx, by, 2, 2, S[0]); box(g, bx, by, 1, 1, S[5]); }
  hazard(g, -19, 4, 38, 2, 0);
  // (the nozzle: a raised steel box, its grille's slots, scorched round them)
  box(g, -12, -5, 24, 9, INK); box(g, -11, -4, 22, 7, S[3]); box(g, -11, -4, 22, 1, S[5]); box(g, 9, -4, 2, 7, S[1]);
  box(g, -10, -3, 20, 5, '#2A2220');
  for (let k = -8; k <= 6; k += 4) { box(g, k, -2, 2, 4, '#0A0A0C'); box(g, k, 1, 2, 1, S[4]); }
  // (the armed lamp's cage)
  box(g, 8, -8, 5, 5, INK);
};
export const drawPyro = (c: Ctx, state: GameState, fire: Map<number, number>) => {
  const f = state.frame;
  for (const px of PYRO_X) {
    if (!inView(state, px - 40, px + 40)) continue;
    const y = GY + 30 * ZK;
    const t = fire.get(px) ?? 0;
    stillH(c, 'pyro', px, y, -24, -10, 48, 20, paintPyroJet);
    box(c, px + 9, y - 6, 3, 3, t > 0 ? '#FDE047' : (f >> 4) % 2 ? '#F02A2A' : '#7A1414');
    if (t <= 0) continue;
    const k = Math.min(1, t / 10), h = 180 * k + Math.sin(f * 0.7 + px) * 12;
    c.fillStyle = `rgba(252, 165, 38, ${(0.18 * k).toFixed(2)})`; c.beginPath(); c.ellipse(px, y, 60, 14, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = `rgba(253, 230, 138, ${(0.2 * k).toFixed(2)})`; c.beginPath(); c.ellipse(px, y, 30, 7, 0, 0, Math.PI * 2); c.fill();
    flame(c, px - 6, y, 30 * k + 6, h * 0.8, f, px + 3);
    flame(c, px + 6, y, 30 * k + 6, h * 0.86, f, px + 11);
    flame(c, px, y, 40 * k + 6, h, f, px);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// In front of him: the barrier, the crowd behind it (from the back)

const SKINS = ['#F3C9A8', '#E0A27A', '#C68642', '#A0663A', '#8D5524', '#5C3A21', '#F1C27D'];
const HAIRS = ['#14100E', '#2A1A10', '#5A3418', '#8A5A2A', '#D8B060', '#A83A1A', '#A8A29E', '#E8E4DA'];
const SHIRTS = ['#C82828', '#2A5AC8', '#2A8A4A', '#F4F0E8', '#7A3AA8', '#E87A1A', '#2A2A30', '#3A8AA8'];

/** A fan from behind: their build, their hair (long, a ponytail, a bun, short, bald, a mullet, a cap, a cowboy hat),
 *  the shirt (a yellow STEVE one now and then), shading in steps; arms up when it's good, a phone, a foam finger. */
const fanBack = (c: Ctx, px: number, py: number, n: number, hype: number, f: number) => {
  const woman = h01(n * 13.1) < 0.45, w = Math.round(26 + h01(n * 11.3) * 12) + (woman ? -2 : 0);
  const skin = SKINS[Math.floor(h01(n * 3.7) * SKINS.length)], hair = HAIRS[Math.floor(h01(n * 5.9) * HAIRS.length)];
  const steveShirt = h01(n * 17.7) < 0.22, shirt = steveShirt ? '#EAB516' : SHIRTS[n % SHIRTS.length];
  const Sh = ramp6(shirt), Sk = ramp6(skin), Hr = ramp6(hair);
  const up = hype > 0.55, wave = up ? Math.round(Math.sin(f * 0.25 + n) * 2) : 0;
  const l = Math.round(px - w / 2);
  // (raised arms, behind the head: sleeves, forearms, hands)
  if (up) for (const s of [-1, 1]) {
    const ax = s < 0 ? l - 3 : l + w - 3, top = py - 34 + (s > 0 ? wave : -wave);
    box(c, ax - 1, top - 1, 8, 40, INK); box(c, ax, top + 14, 6, 25, Sh[3]); box(c, ax, top, 6, 14, Sk[3]); box(c, ax, top, 2, 14, Sk[4]);
    box(c, ax - 1, top - 6, 8, 7, INK); box(c, ax, top - 5, 6, 5, Sk[3]);
  }
  // (the shoulders and back: rounded, lit down the left, shaded right, dithered)
  box(c, l - 1, py + 3, w + 2, 60, INK); box(c, l + 2, py, w - 4, 4, INK);
  box(c, l, py + 4, w, 60, Sh[3]); box(c, l + 3, py + 1, w - 6, 4, Sh[3]);
  box(c, l, py + 4, 4, 60, Sh[4]); box(c, l + w - 6, py + 4, 6, 60, Sh[2]); checker(c, l + w - 10, py + 4, 4, 60, Sh[2], 0, 1);
  box(c, l + w / 2 - 1, py + 12, 2, 50, Sh[2]);
  if (steveShirt) words(c, 'STEVE', px, py + 22, { sx: 1, sy: 1, fill: '#7A1A0A' });
  // (the neck, the head from behind, the ears)
  const hw = woman ? 16 : 18, hx = Math.round(px - hw / 2), hy = py - 20;
  box(c, px - 4, py - 4, 8, 6, Sk[2]);
  box(c, hx - 2, hy + 6, 3, 6, Sk[3]); box(c, hx + hw - 1, hy + 6, 3, 6, Sk[2]);
  box(c, hx - 1, hy - 1, hw + 2, 20, INK); box(c, hx, hy, hw, 18, Sk[3]);
  const style = woman ? Math.floor(h01(n * 7.1) * 4) : Math.floor(h01(n * 7.1) * 6);
  const cap = !woman && style === 4, hat = !woman && style === 5, bald = !woman && style === 3 && h01(n * 2.3) < 0.6;
  if (!bald) {
    // (the hair over the back of the head, in steps, lit up top-left)
    box(c, hx, hy, hw, 16, Hr[3]); box(c, hx + 2, hy, hw - 6, 3, Hr[4]); box(c, hx + hw - 4, hy + 2, 4, 14, Hr[2]); checker(c, hx, hy + 12, hw, 4, Hr[2], 0, 1);
    if (woman && style === 0) { box(c, hx - 2, hy + 8, hw + 4, 26, INK); box(c, hx - 1, hy + 8, hw + 2, 25, Hr[3]); box(c, hx - 1, hy + 8, 3, 25, Hr[4]); box(c, hx + hw - 3, hy + 8, 4, 25, Hr[2]); }
    if (woman && style === 1) { box(c, px - 3, hy + 14, 6, 18, INK); box(c, px - 2, hy + 14, 4, 17, Hr[3]); box(c, px - 2, hy + 14, 1, 17, Hr[4]); box(c, px - 3, hy + 12, 6, 3, '#E84A8A'); }
    if (woman && style === 2) { box(c, px - 6, hy - 7, 12, 9, INK); box(c, px - 5, hy - 6, 10, 7, Hr[3]); box(c, px - 4, hy - 6, 4, 2, Hr[4]); }
    if (!woman && style === 2) { box(c, hx - 1, hy + 12, hw + 2, 12, INK); box(c, hx, hy + 12, hw, 11, Hr[3]); box(c, hx, hy + 18, hw, 5, Hr[2]); }
  } else { box(c, hx + 3, hy + 2, 5, 3, Sk[5]); box(c, hx, hy + 9, hw, 6, Hr[3]); }
  if (cap) { const Cp = ramp6(['#C82828', '#2A5AC8', '#2A2A30', '#EAB516'][n % 4]); box(c, hx - 1, hy - 3, hw + 2, 9, INK); box(c, hx, hy - 2, hw, 7, Cp[3]); box(c, hx + 1, hy - 2, hw - 6, 2, Cp[4]); box(c, px - 4, hy + 4, 8, 2, Sk[2]); box(c, px - 3, hy + 4, 6, 1, Cp[1]); }
  if (hat) { const Ht = ramp6('#8A6A3A'); box(c, hx - 7, hy + 2, hw + 14, 4, INK); box(c, hx - 6, hy + 2, hw + 12, 3, Ht[3]); box(c, hx - 1, hy - 8, hw + 2, 11, INK); box(c, hx, hy - 7, hw, 10, Ht[3]); box(c, hx, hy - 7, hw, 2, Ht[4]); box(c, hx, hy - 1, hw, 2, Ht[1]); }
  // (not on their feet: a phone up (the stage on its screen), or a foam finger)
  if (!up && n % 4 === 1) {
    const fx = l + w - 2, fy = py - 34;
    box(c, fx, fy + 12, 6, 24, Sh[3]); box(c, fx, fy + 8, 6, 6, Sk[3]);
    box(c, fx - 4, fy - 6, 14, 18, INK); box(c, fx - 3, fy - 5, 12, 16, '#1E2A3A'); box(c, fx - 2, fy - 4, 10, 6, '#86AEEC'); box(c, fx - 2, fy + 2, 10, 4, '#4A4850'); box(c, fx + 2, fy, 3, 3, '#EAB516');
    if (f % 50 < 3) box(c, fx - 3, fy - 5, 12, 16, '#FFFFFF');
  } else if (n % 5 === 2 && hype > 0.3) {
    const fx = l - 4, fy = py - 46 + wave;
    box(c, fx, fy + 18, 6, 26, Sh[3]);
    box(c, fx - 4, fy - 1, 14, 22, INK); box(c, fx - 3, fy, 12, 20, '#EAB516'); box(c, fx - 3, fy, 3, 20, '#FAD43A');
    box(c, fx + 1, fy - 14, 5, 15, INK); box(c, fx + 2, fy - 13, 3, 14, '#EAB516');
  }
};

export const drawCrowd = (c: Ctx, state: GameState, hype: number) => {
  // (it stands at the front edge of the floor, where the floor's bent furthest out: it goes by as fast as the floor at
  // its foot does (it went by at the play line's speed, slower than the floor behind it: it skated, reading as further
  // back than what it hides). Same size, just slid along: its pattern (joints, plates, fans, the hazard paint) laid out
  // that much further from the eye)
  const v = sview(state), k = 1 + (BARRIER_Y + 40 - GY) * BEND, ox = (1 - k) * v.eye.x;
  c.save(); c.translate(ox, 0);
  const a = Math.max(x0 - 100 + ox, state.camera.x - 40) - ox, b = state.camera.x + CANVAS_WIDTH + 40 - ox;
  const C = CONCRETE.map(c2 => hour(c2, 0.06)), f = state.frame;
  // (the jersey barrier: its cap seen from over it, the face under it banded, the joints between its sections, the
  // hazard paint along its foot)
  box(c, a, BARRIER_Y - 1, b - a, 42, INK);
  box(c, a, BARRIER_Y, b - a, 4, C[5]); box(c, a, BARRIER_Y, b - a, 1, C[6]);
  box(c, a, BARRIER_Y + 4, b - a, 4, C[3]);
  box(c, a, BARRIER_Y + 8, b - a, 32, C[4]); box(c, a, BARRIER_Y + 8, b - a, 2, C[2]); checker(c, a, BARRIER_Y + 10, b - a, 2, C[3], 0, 2);
  box(c, a, BARRIER_Y + 30, b - a, 10, C[3]); checker(c, a, BARRIER_Y + 28, b - a, 2, C[3], 1, 2);
  for (let x = Math.floor(a / 120) * 120; x < b; x += 120) { box(c, x, BARRIER_Y, 1, 40, C[1]); box(c, x + 1, BARRIER_Y, 1, 40, C[5]); }
  // (its stripes laid from a whole stripe in the world (from the screen's edge they stood still on the screen while the
  // barrier went by under them))
  hazard(c, a, BARRIER_Y + 34, b - a, 6, -a);
  // (Steve's plates on it: yellow, bolted up, his name)
  const plates: number[] = [];
  for (let x = Math.floor(a / 640) * 640 + 200; x < b + 100; x += 640) {
    plates.push(x);
    box(c, x - 82, BARRIER_Y + 7, 164, 26, INK);
    box(c, x - 81, BARRIER_Y + 8, 162, 24, STEVE[3]); box(c, x - 81, BARRIER_Y + 8, 162, 2, STEVE[5]); box(c, x - 81, BARRIER_Y + 28, 162, 4, STEVE[2]);
    for (const bx2 of [x - 77, x + 75]) { box(c, bx2, BARRIER_Y + 18, 3, 3, STEVE[1]); box(c, bx2, BARRIER_Y + 18, 1, 1, STEVE[5]); }
    words(c, 'STUNTMAN STEVE', x, BARRIER_Y + 26, { sx: 1, sy: 2, fill: ['#2A1408', '#18181B'], gap: 1 });
  }
  // (the crowd: a small one, from the back; bouncing when it's good)
  for (let x = Math.floor(a / 46) * 46; x < b; x += 46) {
    const n = Math.round(x / 46);
    if (h01(n) < 0.35) continue;
    const px = x + h01(n * 7) * 20;
    if (plates.some(p => Math.abs(px - p) < 104)) continue;
    const bob = hype > 0.3 ? Math.round(Math.abs(Math.sin(f * 0.25 + n)) * 6 * hype) : 0;
    fanBack(c, px, BARRIER_Y + 34 - bob, n, hype, f);
  }
  c.restore();
};

void LIP; void slab; void deco; void plain; void mix; void hash; void BACK_Z; void glassOf; void SET_D; void post;
