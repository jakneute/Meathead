// The ride, painted (crude first pass): two looks of the one room, and the light between them (`k`: 0 the show, in
// the dark; 1 the work lights on, everything as it is).
//   the show       outer space and the future: a starfield all round, neon planets, the narrated scenes of 2010 by the
//                  track, the chain lift's blue strobes, the props (a satellite, Robo-Butler, the laser emitters, the
//                  meteors, the rockets) dressed to look like the real thing in the dark
//   the warehouse  the same room with the lights on: corrugated walls, steel trusses, fluorescent tubes, pallet racks;
//                  the stars are Christmas lights on black tarp, the planets painted beach balls on strings, the scenes
//                  plywood cutouts on braces, a porta-potty, a guy's lunch. The show's props, plainly props
//   the station    back where it started (the same platform, the same line): the sled in front, loading
// Its own lighting (rideLighting).

import type { GameState } from '../../../m1/game/core/state';
import type { SceneLight, Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { INK, box, text, mix, hash, sign } from '../../intro/art/kit';
import { GY } from '../geometry';
import { drawTableau, TABLEAUS, meteor, tinySled, OP_SEED } from '../atom/art';
import { drawAtomPerson } from '../atom/people';
import {
  R, RUNS, LIFT_X0, LIFT_X1, BREAKER_X, STATION_X0, STATION_X1, BRAKE_X, FRONT_AT, STATION_ROOF, SATELLITES, BUTLERS,
  LASERS, METEORS, ROCKETS, FORKLIFT_X, PA_CUES, trackY,
} from './layout';
import {
  SAT_CLEAR, butlerReach, trayBand, laserBand, laserAt, rocketAt, ROCKET_TOP, EXHAUST_W, meteorAt, MET_R, PALLET, type Tricks,
} from './tricks';

type Ctx = CanvasRenderingContext2D;

/** What the painting needs to know of the ride. */
export interface RideLook { k: number; tricks: Tricks; breakerT: number; brakeT: number; sledX: number; sledY: number; frontGone: boolean }

// ---------------------------------------------------------------------------------------------------------------
// The backdrop (screen space)

export const drawRideBackdrop = (c: Ctx, state: GameState, look: RideLook) => {
  const W = CANVAS_WIDTH, H = CANVAS_HEIGHT, f = state.frame, cam = state.camera.x, cy = state.camera.y;
  const k = look.k;
  if (k < 1) {
    c.fillStyle = '#03020A'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 180; i++) {
      const sx = ((i * 211.7 - cam * 0.1) % W + W) % W, sy = (((i * 97.3 - cy * 0.1) % H) + H) % H;
      const tw = (f + i * 13) % 80 < 5;
      box(c, sx, sy, tw ? 3 : 2, tw ? 3 : 2, i % 6 ? '#94A3B8' : '#F8FAFC');
    }
    for (let j = -1; j < 3; j++) {
      const base = Math.floor(cam * 0.2 / 700) + j, px = base * 700 - cam * 0.2 + 200 + hash(base) * 250, py = 140 + hash(base * 3) * 180 - cy * 0.05;
      const col = ['#DB2777', '#2563EB', '#16A34A', '#F59E0B'][((base % 4) + 4) % 4], r = 36 + hash(base * 7) * 40;
      c.fillStyle = mix(col, '#03020A', 0.3); c.beginPath(); c.arc(px, py, r, 0, Math.PI * 2); c.fill();
      c.fillStyle = mix(col, '#FFFFFF', 0.2); c.beginPath(); c.arc(px - r * 0.3, py - r * 0.3, r * 0.4, 0, Math.PI * 2); c.fill();
      if (hash(base * 5) > 0.4) { c.strokeStyle = mix(col, '#FFFFFF', 0.4); c.lineWidth = 3; c.beginPath(); c.ellipse(px, py, r * 1.7, r * 0.35, -0.2, 0, Math.PI * 2); c.stroke(); }
    }
    // (other sleds going round, way off)
    for (let j = 0; j < 2; j++) { const sx = ((f * 1.6 + j * 900 - cam * 0.3) % 1800 + 1800) % 1800 - 300; tinySled(c, sx, 470 - j * 160, 4100 + j * 31, f, 0.4); }
  }
  if (k > 0) {
    c.save(); c.globalAlpha = Math.min(1, k);
    drawWarehouseBack(c, cam, cy, f);
    c.restore();
  }
  return true;
};

/** The warehouse, seen with the lights on (screen space: its far wall, slow). */
const drawWarehouseBack = (c: Ctx, cam: number, cy: number, f: number) => {
  const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
  c.fillStyle = '#9CA3AF'; c.fillRect(0, 0, W, H);
  // (corrugated sheet, its ribs)
  const off = -((cam * 0.3) % 24);
  for (let x = off; x < W; x += 24) { box(c, x, 0, 3, H, '#8B929C'); box(c, x + 3, 0, 1, H, '#B4BAC2'); }
  // (the trusses up top, the tubes hung off them)
  const toff = -((cam * 0.35) % 260);
  for (let x = toff - 260; x < W + 260; x += 260) {
    box(c, x, 40 - cy * 0.03, 260, 8, '#52525B');
    c.strokeStyle = '#52525B'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, 48); c.lineTo(x + 130, 90); c.lineTo(x + 260, 48); c.stroke();
    box(c, x + 70, 96, 120, 6, '#F8FAFC'); box(c, x + 70, 102, 120, 2, '#CBD5E1');
  }
  // (black tarp hung where the stars were, Christmas lights stapled on; the planets: beach balls on strings)
  const poff = -((cam * 0.2) % 700);
  for (let x = poff - 700; x < W + 700; x += 700) {
    box(c, x + 60, 130, 420, 220, '#111827');
    for (let j = 0; j < 30; j++) box(c, x + 70 + hash(j + x * 0.001) * 400, 140 + hash(j * 3.3) * 200, 3, 3, ['#FDE047', '#F87171', '#4ADE80', '#60A5FA'][j % 4]);
    c.strokeStyle = '#E5E7EB'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 560, 40); c.lineTo(x + 560, 190); c.stroke();
    c.fillStyle = '#F472B6'; c.beginPath(); c.arc(x + 560, 210, 26, 0, Math.PI * 2); c.fill();
    box(c, x + 534, 206, 52, 6, '#FDE047'); box(c, x + 552, 186, 6, 46, '#60A5FA');
  }
  // (pallet racks along the floor, far off; a porta-potty; the sign)
  const roff = -((cam * 0.3) % 900);
  for (let x = roff - 900; x < W + 900; x += 900) {
    for (let r = 0; r < 3; r++) { box(c, x + 20, 380 + r * 70, 300, 6, '#EA580C'); for (let b = 0; b < 4; b++) box(c, x + 30 + b * 72, 386 + r * 70 - 40, 60, 40, '#A16207'); }
    box(c, x + 20, 340, 6, 260, '#1E3A8A'); box(c, x + 314, 340, 6, 260, '#1E3A8A');
    box(c, x + 420, 400, 60, 120, '#2563EB'); box(c, x + 424, 404, 52, 10, '#93C5FD'); text(c, 'JOHNNY', x + 450, 440, '#F8FAFC', 5);
    sign(c, x + 540, 300, 230, 22, '#F8FAFC', 'EMPLOYEES MUST WASH HANDS', '#B91C1C', 6);
  }
  box(c, 0, H - 20, W, 20, '#57534E');
  void f;
};

// ---------------------------------------------------------------------------------------------------------------
// The world: the track, the scenes, the props

/** The rail, from its run's ends; its supports down out of sight; the gaps' red ends. */
const drawTrack = (c: Ctx, k: number, cam: number) => {
  const lit = k > 0.5;
  for (let i = 0; i < RUNS.length; i++) {
    const [a, b, ya, yb] = RUNS[i];
    if (b < cam - 100 || a > cam + CANVAS_WIDTH + 100) continue;
    // (the supports: every so far, straight down)
    for (let x = Math.ceil(a / 140) * 140; x < b; x += 140) {
      const y = ya + ((x - a) / (b - a)) * (yb - ya);
      box(c, x - 4, y, 8, 900, lit ? '#6B7280' : '#111827');
    }
    c.strokeStyle = INK; c.lineWidth = 10; c.beginPath(); c.moveTo(a, ya + 3); c.lineTo(b, yb + 3); c.stroke();
    c.strokeStyle = lit ? '#A1A1AA' : '#475569'; c.lineWidth = 6; c.beginPath(); c.moveTo(a, ya + 2); c.lineTo(b, yb + 2); c.stroke();
    c.strokeStyle = lit ? '#E5E7EB' : '#94A3B8'; c.lineWidth = 2; c.beginPath(); c.moveTo(a, ya); c.lineTo(b, yb); c.stroke();
    // (a gap after it: a red lamp at either side, a sign)
    const nx = RUNS[i + 1];
    if (nx && nx[0] - b > 20) {
      box(c, b - 10, yb - 30, 8, 30, '#3F3F46'); box(c, b - 12, yb - 38, 12, 10, '#EF4444');
      box(c, nx[0] + 2, nx[2] - 30, 8, 30, '#3F3F46'); box(c, nx[0], nx[2] - 38, 12, 10, '#EF4444');
      if (b < R + 6000) sign(c, b - 70, yb - 100, 130, 18, '#FDE047', 'FUTURE: TBD', '#1C1917', 6);
    }
  }
};

export const drawRideBack = (c: Ctx, state: GameState, look: RideLook) => {
  const f = state.frame, cam = state.camera.x, k = look.k, lit = k > 0.5;
  const on = (x0: number, x1: number) => x1 > cam - 150 && x0 < cam + CANVAS_WIDTH + 150;
  // The scenes of 2010, by the track (act 1): lit, they're plywood on braces
  PA_CUES.slice(1, 5).forEach(([, x], i) => {
    const sx = x + 200, y = (trackY(sx) ?? GY) - 40;
    if (!on(sx - 50, sx + 300)) return;
    drawTableau(c, TABLEAUS[i], sx, y, f);
    if (lit) { for (let b = 0; b < 3; b++) { c.strokeStyle = '#A16207'; c.lineWidth = 4; c.beginPath(); c.moveTo(sx + 30 + b * 90, y - 100); c.lineTo(sx + 60 + b * 90, y + 30); c.stroke(); } text(c, 'PROPERTY OF PROGRESSCO', sx + 120, y + 14, '#78350F', 5, 'center', null); }
  });
  // The lift: the chain up the middle, blue strobes along it
  if (on(LIFT_X0, LIFT_X1)) for (let x = LIFT_X0 + 40; x < LIFT_X1; x += 80) {
    const y = trackY(x) ?? GY;
    box(c, x - 4, y - 160, 8, 8, lit ? '#9CA3AF' : (Math.floor(f / 6) - x / 80) % 8 < 1 ? '#93C5FD' : '#1E3A8A');
  }
  drawTrack(c, k, cam);
  // Satellites (the last: a ladder, a worker up it; the warehouse's)
  SATELLITES.forEach((x, i) => {
    if (!on(x - 60, x + 60)) return;
    const rail = trackY(x) ?? GY, bot = rail - SAT_CLEAR;
    // (what it hangs off: a solid rig, a wall down to the gap under it, its bottom edge striped: duck under it)
    box(c, x - 30, bot - 520, 60, 520, INK); box(c, x - 28, bot - 518, 56, 516, lit ? '#71717A' : '#1E293B');
    for (let yy = bot - 500; yy < bot - 20; yy += 40) { c.strokeStyle = lit ? '#52525B' : '#0F172A'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 26, yy); c.lineTo(x + 26, yy + 40); c.stroke(); }
    for (let j = 0; j < 6; j++) box(c, x - 28 + j * 10, bot - 8, 5, 8, '#FACC15');
    if (i === SATELLITES.length - 1) {
      box(c, x - 50, bot - 6, 100, 8, '#EAB308'); box(c, x - 52, bot - 200, 8, 200 + SAT_CLEAR, '#CA8A04'); box(c, x + 44, bot - 200, 8, 200 + SAT_CLEAR, '#CA8A04');
      for (let r = 1; r < 6; r++) box(c, x - 48, bot - r * 34, 96, 4, '#EAB308');
      return;
    }
    box(c, x - 1, bot - 600, 2, 560, lit ? '#E5E7EB' : '#334155');
    box(c, x - 18, bot - 40, 36, 40, INK); box(c, x - 16, bot - 38, 32, 36, lit ? '#D4D4D8' : '#94A3B8');
    for (const s of [-1, 1]) { box(c, x + s * 18 + (s < 0 ? -50 : 0), bot - 30, 50, 20, INK); box(c, x + s * 18 + (s < 0 ? -48 : 2), bot - 28, 46, 16, lit ? '#3B82F6' : '#1D4ED8'); }
    box(c, x - 26, bot - 4, 52, 4, '#FACC15');
    if (lit) text(c, 'FOAM? NO', x, bot - 46, '#1C1917', 5, 'center', null);
  });
  // Robo-Butler, beside the track
  BUTLERS.forEach((b, i) => {
    if (!on(b.x - 120, b.x + 120)) return;
    const rail = trackY(b.x) ?? GY, rk = butlerReach(look.tricks.butler[i]), [top, bot] = trayBand(b.high);
    const bx = b.x + 70;
    box(c, bx - 18, rail - 110, 36, 110, INK); box(c, bx - 16, rail - 108, 32, 106, '#94A3B8'); box(c, bx - 16, rail - 108, 6, 106, '#CBD5E1');
    box(c, bx - 14, rail - 138, 28, 26, INK); box(c, bx - 12, rail - 136, 24, 22, '#CBD5E1');
    const eyes = look.tricks.butler[i] > 0 && !lit ? '#F87171' : '#475569';
    box(c, bx - 8, rail - 130, 5, 5, eyes); box(c, bx + 3, rail - 130, 5, 5, eyes);
    const tx = bx - 20 - rk * 90, ty = rail - (top + bot) / 2;
    c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(bx - 10, rail - 80); c.lineTo(tx, ty); c.stroke();
    c.strokeStyle = '#A1A1AA'; c.lineWidth = 3; c.beginPath(); c.moveTo(bx - 10, rail - 80); c.lineTo(tx, ty); c.stroke();
    box(c, tx - 42, ty - 4, 84, 8, INK); box(c, tx - 40, ty - 3, 80, 6, '#E5E7EB');
    for (let j = 0; j < 3; j++) box(c, tx - 20 + j * 14, ty - 9, 8, 6, ['#F472B6', '#FDE047', '#4ADE80'][j]);
    text(c, 'ROBO-BUTLER', bx, rail - 144, lit ? '#1C1917' : '#CBD5E1', 5, 'center', null);
  });
  // The laser emitters (the beams are drawn in front)
  for (const l of LASERS) if (on(l.x - 40, l.x + 40)) {
    const rail = trackY(l.x) ?? GY, [top] = laserBand(l.kind);
    box(c, l.x - 6, rail - top - 30, 12, 26, INK); box(c, l.x - 5, rail - top - 29, 10, 24, lit ? '#71717A' : '#3F3F46');
    box(c, l.x - 1, rail - top - 600, 2, 570, lit ? '#9CA3AF' : '#1E293B');
  }
  // The rockets, hung nose-up over the track
  for (const r of ROCKETS) if (on(r.x - 60, r.x + 60)) {
    const rail = trackY(r.x) ?? GY, ny = rail - ROCKET_TOP;
    box(c, r.x - 1, ny - 600, 2, 420, '#64748B');
    box(c, r.x - 24, ny - 170, 48, 160, INK); box(c, r.x - 22, ny - 168, 44, 156, lit ? '#D4D4D8' : '#E5E7EB'); box(c, r.x - 22, ny - 168, 10, 156, '#F8FAFC');
    c.fillStyle = '#DC2626'; c.beginPath(); c.moveTo(r.x - 24, ny - 170); c.lineTo(r.x, ny - 220); c.lineTo(r.x + 24, ny - 170); c.closePath(); c.fill();
    box(c, r.x - 14, ny - 12, 28, 14, '#52525B');
    for (const s of [-1, 1]) { c.fillStyle = '#DC2626'; c.beginPath(); c.moveTo(r.x + s * 22, ny - 60); c.lineTo(r.x + s * 44, ny); c.lineTo(r.x + s * 22, ny - 10); c.closePath(); c.fill(); }
    if (lit) text(c, 'NOT FOR FLIGHT', r.x, ny - 90, '#1C1917', 5, 'center', null);
  }
  // The meteors (on their cables)
  METEORS.forEach((x, i) => {
    if (!on(x - 60, x + 60) || look.tricks.smashed.has(i)) return;
    const rail = trackY(x) ?? GY, m = meteorAt(look.tricks.meteor[i]), cyy = rail - m.h - MET_R;
    box(c, x - 1, rail - 700, 2, 700 - m.h - MET_R * 2 + 4, '#94A3B8');
    if (i === METEORS.length - 1) { box(c, x - 20, rail - 720, 40, 30, '#CA8A04'); text(c, 'HAND HOIST', x, rail - 728, '#1C1917', 5, 'center', null); }
    meteor(c, x + (m.tell ? Math.sin(f * 2) * 2 : 0), cyy, MET_R, i, lit);
    if (m.tell || m.falling) box(c, x - MET_R, rail - 3, MET_R * 2, 3, '#EF4444');
  });
  // The forklift, its pallet across the track
  if (on(FORKLIFT_X - 150, FORKLIFT_X + 200)) {
    const rail = trackY(FORKLIFT_X) ?? GY;
    box(c, FORKLIFT_X + 40, rail - 110, 100, 90, INK); box(c, FORKLIFT_X + 42, rail - 108, 96, 86, '#F59E0B');
    box(c, FORKLIFT_X + 44, rail - 170, 6, 70, '#3F3F46'); box(c, FORKLIFT_X + 120, rail - 170, 6, 70, '#3F3F46'); box(c, FORKLIFT_X + 44, rail - 172, 82, 6, '#3F3F46');
    box(c, FORKLIFT_X + 36, rail - 160, 8, 150, '#27272A');
    for (const wx of [FORKLIFT_X + 64, FORKLIFT_X + 120]) { c.fillStyle = INK; c.beginPath(); c.arc(wx, rail - 14, 14, 0, Math.PI * 2); c.fill(); }
    c.save(); c.translate(FORKLIFT_X + 88, rail - 22); drawAtomPerson(c, 'worker', { seed: 2207, f, pose: 'stand', md: 'ok' }); c.restore();
  }
  // The MAIN BREAKER (till it's smashed: then its door hanging off, sparking)
  if (on(BREAKER_X - 100, BREAKER_X + 100)) {
    const rail = trackY(BREAKER_X) ?? GY, gone = look.breakerT > 0;
    box(c, BREAKER_X + 30, rail - 200, 10, 200, '#52525B');
    box(c, BREAKER_X - 30, rail - 150, 70, 100, INK); box(c, BREAKER_X - 28, rail - 148, 66, 96, '#9CA3AF');
    sign(c, BREAKER_X - 60, rail - 190, 130, 22, '#FDE047', 'MAIN BREAKER', '#1C1917', 6);
    if (!gone) { box(c, BREAKER_X - 6, rail - 120, 14, 36, '#27272A'); box(c, BREAKER_X - 10, rail - 128, 22, 10, '#DC2626'); text(c, 'DO NOT TOUCH', BREAKER_X + 5, rail - 60, '#7F1D1D', 5, 'center', null); }
    else { box(c, BREAKER_X - 28, rail - 148, 66, 96, '#1F2937'); if (f % 8 < 3) box(c, BREAKER_X - 10 + hash(f) * 30, rail - 130 + hash(f * 3) * 60, 4, 4, '#FDE047'); }
  }
  // The brake run's booth (till he's through it)
  if (on(BRAKE_X - 120, BRAKE_X + 120)) {
    const rail = trackY(BRAKE_X) ?? GY;
    if (look.brakeT === 0) {
      box(c, BRAKE_X - 40, rail - 120, 90, 120, INK); box(c, BRAKE_X - 38, rail - 118, 86, 116, '#0F766E');
      box(c, BRAKE_X - 30, rail - 104, 70, 30, '#BAE6FD');
      sign(c, BRAKE_X - 70, rail - 160, 150, 20, '#FDE047', 'BRAKE RUN: 3 MPH', '#1C1917', 6);
    } else {
      box(c, BRAKE_X - 40, rail - 30, 90, 30, '#134E4A');
      sign(c, BRAKE_X - 70, rail - 60, 150, 20, '#FDE047', 'BRAKE RUN: 3 MPH', '#1C1917', 6);
    }
  }
  drawStation(c, state, look);
};

/** Back in the station (the same as the one he left from): the line, the platform, the console, the sled in front. */
const drawStation = (c: Ctx, state: GameState, look: RideLook) => {
  const f = state.frame, cam = state.camera.x;
  if (cam + CANVAS_WIDTH < STATION_X0 - 200) return;
  const y = GY;
  // (the roof, unless they've gone through it)
  box(c, STATION_X0 - 100, STATION_ROOF - 300, STATION_X1 - STATION_X0 + 300, 300, look.frontGone ? '#020617' : '#1E3A8A');
  if (look.frontGone) for (let j = 0; j < 8; j++) box(c, FRONT_AT - 120 + j * 30, STATION_ROOF - 20 + (j % 3) * 8, 26, 10, '#1E3A8A');
  box(c, STATION_X0 - 100, STATION_ROOF, STATION_X1 - STATION_X0 + 300, y - STATION_ROOF, '#1E3A8A');
  // (its floor: the platform, down to the ground)
  box(c, STATION_X0 - 100, y, STATION_X1 - STATION_X0 + 300, 600, '#1C1B22'); box(c, STATION_X0 - 100, y, STATION_X1 - STATION_X0 + 300, 3, '#52525B');
  box(c, STATION_X0 - 100, STATION_ROOF, STATION_X1 - STATION_X0 + 300, 6, '#93C5FD');
  sign(c, STATION_X0 + 120, STATION_ROOF + 30, 420, 30, '#0F172A', 'VOYAGE TO 2010  -  PRESENTED BY PROGRESSCO', '#67E8F9', 8);
  for (let j = 0; j < 3; j++) { const tx = STATION_X0 + 60 + j * 200; box(c, tx, y - 330 + 120, 100, 70, INK); box(c, tx + 4, y - 326 + 120, 92, 62, (f + j * 40) % 240 < 120 ? '#0EA5E9' : '#F472B6'); text(c, 'PROGRESSCO', tx + 50, y - 168, '#0F172A', 6, 'center', null); }
  // (the line, behind its rail: the same people, still waiting)
  for (let j = 0; j < 16; j++) {
    const qx = STATION_X0 + 20 + j * 34, seed = 4001 + j * 337;
    c.save(); c.translate(qx, y - 20 - (j % 2) * 14); drawAtomPerson(c, 'guest', { seed, f, pose: 'stand', md: 'ok' }); c.restore();
  }
  box(c, STATION_X0, y - 64, 560, 4, '#CBD5E1');
  box(c, STATION_X0 + 560, y - 4, STATION_X1 - STATION_X0 - 560, 4, '#FACC15');
  // (the operator at her console)
  c.save(); c.translate(STATION_X0 + 600, y); drawAtomPerson(c, 'op', { seed: OP_SEED, f, pose: look.frontGone ? 'after' : 'stand', md: 'ok' }); c.restore();
  box(c, STATION_X0 + 630, y - 70, 60, 70, INK); box(c, STATION_X0 + 632, y - 68, 56, 66, '#0F766E');
};

/** In front: the beams, the exhaust. */
export const drawRideFront = (c: Ctx, state: GameState, look: RideLook) => {
  const f = state.frame, cam = state.camera.x;
  if (look.k >= 1) return;
  const on = (x: number) => x > cam - 100 && x < cam + CANVAS_WIDTH + 100;
  for (const l of LASERS) if (on(l.x)) {
    const rail = trackY(l.x) ?? GY, [top, bot] = laserBand(l.kind), st = laserAt(l.kind, f, l.phase);
    if (st.on) for (let yy = rail - top + 4; yy < rail - bot; yy += 10) { box(c, l.x - 4, yy, 8, 3, 'rgba(34, 197, 94, 0.4)'); box(c, l.x - 1, yy, 2, 3, '#BBF7D0'); }
    else if (st.tell > 0 && (f >> 1) % 2) for (let yy = rail - top + 4; yy < rail - bot; yy += 20) box(c, l.x - 1, yy, 2, 2, '#4ADE80');
  }
  for (const r of ROCKETS) if (on(r.x)) {
    const rail = trackY(r.x) ?? GY, st = rocketAt(f, r.phase);
    if (!st.on) continue;
    const wob = Math.sin(f * 1.3) * 4, top = rail - ROCKET_TOP;
    c.fillStyle = '#F97316'; c.beginPath(); c.moveTo(r.x - EXHAUST_W / 2, top); c.lineTo(r.x + wob, rail); c.lineTo(r.x + EXHAUST_W / 2, top); c.closePath(); c.fill();
    box(c, r.x - EXHAUST_W, rail - 20, EXHAUST_W * 2, 20, '#F97316');
    c.fillStyle = '#FDE047'; c.beginPath(); c.moveTo(r.x - EXHAUST_W / 3, top); c.lineTo(r.x + wob, rail - 30); c.lineTo(r.x + EXHAUST_W / 3, top); c.closePath(); c.fill();
  }
  void PALLET;
};
/** The forklift's pallet (in front of the sled's wheels: it's across the track). */
export const drawPallet = (c: Ctx, state: GameState) => {
  const cam = state.camera.x;
  if (FORKLIFT_X < cam - 150 || FORKLIFT_X > cam + CANVAS_WIDTH + 150) return;
  const rail = trackY(FORKLIFT_X) ?? GY;
  box(c, FORKLIFT_X - 46, rail - PALLET[1] - 4, 92, 6, '#3F3F46');
  box(c, FORKLIFT_X - 44, rail - PALLET[0], 88, PALLET[0] - PALLET[1] - 4, INK);
  for (let j = 0; j < 3; j++) { box(c, FORKLIFT_X - 42 + j * 29, rail - PALLET[0] + 2, 26, PALLET[0] - PALLET[1] - 8, '#A16207'); box(c, FORKLIFT_X - 42 + j * 29, rail - PALLET[0] + 2, 26, 3, '#FBBF24'); }
};

// ---------------------------------------------------------------------------------------------------------------
// The lighting

export const rideLighting = (state: GameState, look: RideLook): SceneLight => {
  const f = state.frame, cam = state.camera.x, lights: Light[] = [];
  const near = (x: number) => x > cam - 300 && x < cam + CANVAS_WIDTH + 300;
  // (the work lights: on, it's lit as bright as a warehouse is)
  const dark = 0.62 * (1 - look.k);
  if (look.k < 1) {
    for (const l of LASERS) if (near(l.x) && laserAt(l.kind, f, l.phase).on) lights.push({ x: l.x, y: (trackY(l.x) ?? GY) - 60, r: 120, a: 0.8, color: 'rgba(74, 222, 128, 0.18)' });
    for (const r of ROCKETS) if (near(r.x) && rocketAt(f, r.phase).on) lights.push({ x: r.x, y: (trackY(r.x) ?? GY) - 60, r: 280, a: 1, color: 'rgba(251, 146, 60, 0.25)' });
    for (const [, x] of PA_CUES.slice(1, 5)) if (near(x + 300)) lights.push({ x: x + 320, y: (trackY(x + 300) ?? GY) - 120, r: 260, a: 0.8, color: 'rgba(244, 114, 182, 0.1)' });
    if (near(BREAKER_X)) lights.push({ x: BREAKER_X, y: (trackY(BREAKER_X) ?? GY) - 100, r: 90, a: 0.6, color: 'rgba(239, 68, 68, 0.15)' });
    if (near(STATION_X0) || near(STATION_X1)) for (let x = STATION_X0; x < STATION_X1 + 200; x += 200) lights.push({ x, y: GY - 300, r: 480, a: 0.9, cone: 200, color: 'rgba(224, 242, 254, 0.08)' });
  }
  // (the sled's headlamp, and enough round him that he's never lost)
  lights.push({ x: look.sledX, y: look.sledY - 50, r: 180, a: 0.6 });
  lights.push({ x: look.sledX + 180, y: look.sledY - 40, r: 160, a: 0.55, color: 'rgba(224, 242, 254, 0.08)' });
  return { dark, shade: [4, 3, 16], lights, rim: 0.5 };
};
