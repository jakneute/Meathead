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
  LASERS, METEORS, ROCKETS, FORKLIFT_X, PA_CUES, WORKERS, trackY,
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
      c.fillStyle = mix(col, '#03020A', 0.62); c.beginPath(); c.arc(px, py, r, 0, Math.PI * 2); c.fill();
      c.fillStyle = mix(col, '#03020A', 0.45); c.beginPath(); c.arc(px - r * 0.3, py - r * 0.3, r * 0.4, 0, Math.PI * 2); c.fill();
      if (hash(base * 5) > 0.4) { c.strokeStyle = mix(col, '#03020A', 0.4); c.lineWidth = 3; c.beginPath(); c.ellipse(px, py, r * 1.7, r * 0.35, -0.2, 0, Math.PI * 2); c.stroke(); }
    }
    // (other sleds going round, way off)
    c.save(); c.globalAlpha = 0.35;
    for (let j = 0; j < 2; j++) { const sx = ((f * 1.6 + j * 900 - cam * 0.3) % 1800 + 1800) % 1800 - 300; tinySled(c, sx, 300 - j * 140, 4100 + j * 31, f, 0.4); }
    c.restore();
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
  // (all of it knocked back: set dressing, not anything on the track)
  c.fillStyle = 'rgba(55, 60, 72, 0.42)'; c.fillRect(0, 0, W, H);
  void f;
};

// ---------------------------------------------------------------------------------------------------------------
// The world: the track, the scenes, the props

// ---------------------------------------------------------------------------------------------------------------
// Readability: every obstacle shows itself well before it's there, and shows how it's beaten

/** Every obstacle along the track (and every gap's edge), in order. */
const OBSTACLE_XS = [...SATELLITES, ...BUTLERS.map(b => b.x), ...LASERS.map(l => l.x), ...METEORS, ...ROCKETS.map(r => r.x), FORKLIFT_X,
  ...RUNS.filter((r, i) => RUNS[i + 1] && RUNS[i + 1][0] - r[1] > 20).map(r => r[1])].sort((a, b) => a - b);
/** Where an obstacle's sign goes: well before it, but never back past the one before it (signs in the order they come). */
const signX = (x: number) => {
  let prev = -Infinity; for (const o of OBSTACLE_XS) { if (o >= x - 1) break; prev = o; }
  const sx = Math.max(x - 380, prev + (prev === FORKLIFT_X ? 210 : 90));
  return trackY(sx) === null ? (RUNS.find(r => r[0] > sx) ?? RUNS[0])[0] + 24 : sx;
};
/** (the frame the track's being drawn on: its lamps flash) */
let frameNow = 0;
/** A sign on a pole beside the track, well before what it's about: the word, an arrow, a lamp on top (flashing when
 *  `live`). Its board's bright, inked hard; the arrow says which: up (jump), down (duck), stop (wait). */
const warnSign = (c: Ctx, x: number, word: string, arrow: 'up' | 'down' | 'stop', live: boolean) => {
  // (never over a gap: just past it, if that's where it'd go)
  if (trackY(x) === null) x = (RUNS.find(r => r[0] > x) ?? RUNS[0])[0] + 24;
  const rail = trackY(x);
  if (rail === null) return;
  const top = rail - 150, w = Math.max(64, word.length * 10 + 30), flash = live && (frameNow >> 3) % 2 === 0;
  box(c, x - 4, top, 8, 150, INK); box(c, x - 2, top, 4, 150, '#71717A');
  box(c, x - w / 2 - 3, top - 3, w + 6, 32, INK); box(c, x - w / 2, top, w, 26, flash ? '#FEF08A' : '#FACC15');
  text(c, word, x + 8, top + 18, '#1C1917', 8, 'center', null);
  const ax = x - w / 2 + 10, ay = top + 13;
  c.fillStyle = INK; c.beginPath();
  if (arrow === 'up') { c.moveTo(ax - 6, ay + 5); c.lineTo(ax, ay - 7); c.lineTo(ax + 6, ay + 5); }
  else if (arrow === 'down') { c.moveTo(ax - 6, ay - 5); c.lineTo(ax, ay + 7); c.lineTo(ax + 6, ay - 5); }
  else c.rect(ax - 5, ay - 5, 10, 10);
  c.closePath(); c.fill();
  box(c, x - 7, top - 15, 14, 12, INK); box(c, x - 5, top - 13, 10, 8, flash ? '#EF4444' : '#7F1D1D');
};
/** The lane lit on the rail from x0 to x1 (chevrons along its top: where it'll get you). */
const laneMark = (c: Ctx, x0: number, x1: number, col: string, on: boolean) => {
  for (let x = x0; x < x1; x += 12) {
    const y = trackY(x);
    if (y === null) continue;
    box(c, x, y - 4, 8, 5, INK); box(c, x + 1, y - 3, 6, 3, on ? col : mix(col, '#1C1917', 0.55));
  }
};
/** A striped barricade on the rail's end (a gap after it), its lamp. */
const barricade = (c: Ctx, x: number, rail: number, flash: boolean) => {
  box(c, x - 12, rail - 46, 24, 46, INK);
  for (let j = 0; j < 4; j++) box(c, x - 9, rail - 43 + j * 10, 18, 9, j % 2 ? '#F8FAFC' : '#DC2626');
  box(c, x - 8, rail - 60, 16, 14, INK); box(c, x - 6, rail - 58, 12, 10, flash ? '#FCA5A5' : '#B91C1C');
};
/** A wall to duck under: from y down to its bottom edge (y + h), hazard-striped, inked, the bottom edge bright. */
const hazardWall = (c: Ctx, x: number, y: number, w: number, h: number, dark = '#1C1917', bright = '#FACC15') => {
  box(c, x - 3, y, w + 6, h + 3, INK);
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  box(c, x, y, w, h, dark);
  c.fillStyle = bright;
  for (let yy = y + h - 30; yy > y - w; yy -= 36) { c.beginPath(); c.moveTo(x, yy); c.lineTo(x + w, yy - w * 0.6); c.lineTo(x + w, yy - w * 0.6 + 14); c.lineTo(x, yy + 14); c.closePath(); c.fill(); }
  c.restore();
  box(c, x, y + h - 6, w, 6, '#FFFFFF');
};

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
      // (the rail's end: a striped barricade on it, a lamp, the lane lit up to it; the far side's the same; a sign well
      // before: JUMP)
      const flash = (Math.floor(frameNow / 8) % 2) === 0;
      laneMark(c, b - 260, b - 4, '#FACC15', true);
      barricade(c, b - 6, yb, flash);
      barricade(c, nx[0] + 6, nx[2], !flash);
      warnSign(c, signX(b), 'JUMP', 'up', true);
      if (b < R + 6000) sign(c, b - 150, yb - 150, 130, 18, '#FDE047', 'FUTURE: TBD', '#1C1917', 6);
    }
  }
};

export const drawRideBack = (c: Ctx, state: GameState, look: RideLook) => {
  const f = state.frame, cam = state.camera.x, k = look.k, lit = k > 0.5;
  frameNow = f;
  const on = (x0: number, x1: number) => x1 > cam - 150 && x0 < cam + CANVAS_WIDTH + 150;
  // The scenes of 2010, by the track (act 1): lit, they're plywood on braces
  PA_CUES.slice(1, 5).forEach(([, x], i) => {
    const sx = x + 200, y = (trackY(sx) ?? GY) - 40;
    if (!on(sx - 50, sx + 300)) return;
    c.save(); c.globalAlpha = 0.5; drawTableau(c, TABLEAUS[i], sx, y, f); c.restore();
    if (lit) { for (let b = 0; b < 3; b++) { c.strokeStyle = '#A16207'; c.lineWidth = 4; c.beginPath(); c.moveTo(sx + 30 + b * 90, y - 100); c.lineTo(sx + 60 + b * 90, y + 30); c.stroke(); } text(c, 'PROPERTY OF PROGRESSCO', sx + 120, y + 14, '#78350F', 5, 'center', null); }
  });
  // The lift: the chain up the middle, blue strobes along it
  if (on(LIFT_X0, LIFT_X1)) for (let x = LIFT_X0 + 40; x < LIFT_X1; x += 80) {
    const y = trackY(x) ?? GY;
    box(c, x - 4, y - 160, 8, 8, lit ? '#9CA3AF' : (Math.floor(f / 6) - x / 80) % 8 < 1 ? '#93C5FD' : '#1E3A8A');
  }
  drawTrack(c, k, cam);
  const show = k < 1, flash = (f >> 3) % 2 === 0;
  // Satellites (the last: a ladder, the warehouse's): hung off a striped rig, a wall down to the gap under it; the
  // lane lit under it, DUCK on a sign well before
  SATELLITES.forEach((x, i) => {
    if (!on(x - 420, x + 80)) return;
    const rail = trackY(x) ?? GY, bot = rail - SAT_CLEAR;
    warnSign(c, signX(x), 'DUCK', 'down', true);
    laneMark(c, x - 40, x + 40, '#F97316', flash);
    if (!on(x - 80, x + 80)) return;
    hazardWall(c, x - 32, bot - 560, 64, 560);
    if (i === SATELLITES.length - 1) {
      box(c, x - 54, bot - 202, 12, 202 + SAT_CLEAR, INK); box(c, x + 42, bot - 202, 12, 202 + SAT_CLEAR, INK);
      box(c, x - 52, bot - 200, 8, 200 + SAT_CLEAR, '#EAB308'); box(c, x + 44, bot - 200, 8, 200 + SAT_CLEAR, '#EAB308');
      for (let r = 1; r < 6; r++) { box(c, x - 50, bot - r * 34 - 1, 100, 6, INK); box(c, x - 48, bot - r * 34, 96, 4, '#FDE047'); }
      return;
    }
    // (the satellite itself, on the bottom of it: big, white, its panels out either side)
    box(c, x - 22, bot - 46, 44, 46, INK); box(c, x - 19, bot - 43, 38, 40, '#F1F5F9'); box(c, x - 19, bot - 43, 38, 6, '#FFFFFF');
    for (const sd of [-1, 1]) { const px = sd < 0 ? x - 76 : x + 22; box(c, px, bot - 36, 54, 26, INK); box(c, px + 2, bot - 34, 50, 22, '#2563EB'); for (let q = 1; q < 4; q++) box(c, px + 2 + q * 12, bot - 34, 2, 22, '#93C5FD'); }
    if (lit) text(c, 'FOAM? NO', x, bot - 52, '#1C1917', 5, 'center', null);
  });
  // Robo-Butler, beside the track: once cued its eyes and beacon flash, and out it swings across the track. Rim-high,
  // a meal-pill trolley shoved out onto the rail (jump it); head-high, a big tray with its menu board on top, a wall up
  // to the ceiling (duck)
  BUTLERS.forEach((b, i) => {
    if (!on(b.x - 420, b.x + 180)) return;
    const rail = trackY(b.x) ?? GY, t = look.tricks.butler[i], rk = butlerReach(t), [top, bot] = trayBand(b.high);
    const tell = show && t > 0;
    if (show) { warnSign(c, signX(b.x), b.high ? 'DUCK' : 'JUMP', b.high ? 'down' : 'up', tell); laneMark(c, b.x - 44, b.x + 44, '#F97316', tell && flash); }
    if (!on(b.x - 180, b.x + 180)) return;
    const bx = b.x + 150;
    // (the robot: a can on a post, its head, the eyes; a beacon on top)
    box(c, bx - 20, rail - 112, 40, 112, INK); box(c, bx - 17, rail - 109, 34, 106, '#CBD5E1'); box(c, bx - 17, rail - 109, 8, 106, '#F1F5F9');
    box(c, bx - 16, rail - 142, 32, 32, INK); box(c, bx - 13, rail - 139, 26, 26, '#E2E8F0');
    const eye = tell ? (flash ? '#EF4444' : '#FCA5A5') : '#475569';
    box(c, bx - 9, rail - 131, 7, 7, eye); box(c, bx + 3, rail - 131, 7, 7, eye);
    box(c, bx - 6, rail - 154, 12, 12, INK); box(c, bx - 4, rail - 152, 8, 8, tell && flash ? '#FDE047' : '#7C2D12');
    text(c, 'ROBO-BUTLER', bx, rail - 162, lit ? '#1C1917' : '#94A3B8', 5, 'center', null);
    // (what it holds out: tucked in by it, swung out across the track as it reaches)
    const cx = bx - 66 + rk * (b.x - (bx - 66));
    c.strokeStyle = INK; c.lineWidth = 8; c.beginPath(); c.moveTo(bx - 14, rail - 80); c.lineTo(cx + 34, rail - (top + bot) / 2); c.stroke();
    c.strokeStyle = '#94A3B8'; c.lineWidth = 4; c.beginPath(); c.moveTo(bx - 14, rail - 80); c.lineTo(cx + 34, rail - (top + bot) / 2); c.stroke();
    if (b.high) {
      hazardWall(c, cx - 42, rail - top - 420, 84, 418, '#7F1D1D', '#FCA5A5');
      box(c, cx - 36, rail - top - 120, 72, 70, INK); box(c, cx - 33, rail - top - 117, 66, 64, '#FEF3C7');
      text(c, 'MENU', cx, rail - top - 100, '#7F1D1D', 6, 'center', null);
      for (let q = 0; q < 3; q++) text(c, 'PILL', cx, rail - top - 84 + q * 10, '#1C1917', 5, 'center', null);
      box(c, cx - 46, rail - top - 2, 92, top - bot + 4, INK); box(c, cx - 43, rail - top + 1, 86, top - bot - 2, '#E5E7EB'); box(c, cx - 43, rail - top + 1, 86, 5, '#FFFFFF');
      for (let j = 0; j < 4; j++) box(c, cx - 30 + j * 16, rail - top + 12, 10, 10, ['#F472B6', '#FDE047', '#4ADE80', '#60A5FA'][j]);
    } else {
      // (the trolley: its top at the band, its frame down to its wheels on the rail: a hurdle sat on the track)
      box(c, cx - 46, rail - top - 2, 92, top + 2, INK);
      box(c, cx - 43, rail - top + 1, 86, top - bot - 2, '#E5E7EB'); box(c, cx - 43, rail - top + 1, 86, 5, '#FFFFFF');
      box(c, cx - 43, rail - bot - 1, 86, bot - 2, '#475569');
      box(c, cx - 40, rail - bot, 6, bot - 8, '#CBD5E1'); box(c, cx + 34, rail - bot, 6, bot - 8, '#CBD5E1'); box(c, cx - 40, rail - 14, 80, 5, '#CBD5E1');
      for (const wx of [cx - 34, cx + 34]) { c.fillStyle = INK; c.beginPath(); c.arc(wx, rail - 5, 6, 0, Math.PI * 2); c.fill(); }
      for (let j = 0; j < 4; j++) box(c, cx - 30 + j * 16, rail - top - 10, 10, 10, ['#F472B6', '#FDE047', '#4ADE80', '#60A5FA'][j]);
      for (let j = 0; j < 8; j++) box(c, cx - 43 + j * 11, rail - bot - 4, 6, 4, j % 2 ? INK : '#FACC15');
    }
  });
  // The laser emitters (the beams are drawn in front): a head-high band hangs off a striped housing that's a wall up to
  // the ceiling (duck); a rim-high one's emitter bar sits on the track (jump); a full curtain's frame stands over the
  // track from the rail up (time it). The frame's sides glow so its lane reads even while it's off
  for (const l of LASERS) if (on(l.x - 420, l.x + 60)) {
    const rail = trackY(l.x) ?? GY, [top, bot] = laserBand(l.kind), st = laserAt(l.kind, f, l.phase);
    if (show) {
      warnSign(c, signX(l.x), l.kind === 'high' ? 'DUCK' : l.kind === 'low' ? 'JUMP' : 'WAIT', l.kind === 'high' ? 'down' : l.kind === 'low' ? 'up' : 'stop', l.kind !== 'full' || st.on || st.tell > 0);
      laneMark(c, l.x - 30, l.x + 30, '#22C55E', l.kind !== 'full' ? flash : st.on || (st.tell > 0 && flash));
    }
    if (!on(l.x - 60, l.x + 60)) continue;
    const body = lit ? '#71717A' : '#166534';
    if (l.kind === 'high') hazardWall(c, l.x - 24, rail - top - 420, 48, 420, '#14532D', '#86EFAC');
    else { box(c, l.x - 24, rail - top - 26, 48, 26, INK); box(c, l.x - 21, rail - top - 23, 42, 20, body); box(c, l.x - 3, rail - top - 420, 6, 394, '#1F2937'); }
    if (l.kind === 'low') { box(c, l.x - 24, rail - bot - 2, 48, bot + 2, INK); box(c, l.x - 21, rail - bot + 1, 42, bot - 4, body); }
    if (l.kind === 'full') { box(c, l.x - 24, rail - 8, 48, 8, INK); box(c, l.x - 21, rail - 6, 42, 4, body); }
    box(c, l.x - 26, rail - top, 4, top - bot, INK); box(c, l.x + 22, rail - top, 4, top - bot, INK);
    box(c, l.x - 25, rail - top, 2, top - bot, show ? '#4ADE80' : '#52525B'); box(c, l.x + 23, rail - top, 2, top - bot, show ? '#4ADE80' : '#52525B');
  }
  // The rockets, hung nose-up over the track: the nozzle sputters (the tell), the lane under it flashes; while it's off
  // the column it blasts down is marked out, dashed (time it)
  for (const r of ROCKETS) if (on(r.x - 420, r.x + 80)) {
    const rail = trackY(r.x) ?? GY, ny = rail - ROCKET_TOP, st = rocketAt(f, r.phase);
    if (show) { warnSign(c, signX(r.x), 'WAIT', 'stop', st.on || st.tell > 0); laneMark(c, r.x - EXHAUST_W / 2, r.x + EXHAUST_W / 2, '#F97316', st.on || (st.tell > 0 && flash)); }
    if (!on(r.x - 80, r.x + 80)) continue;
    box(c, r.x - 1, ny - 600, 2, 420, '#64748B');
    box(c, r.x - 26, ny - 172, 52, 164, INK); box(c, r.x - 23, ny - 169, 46, 158, '#F1F5F9'); box(c, r.x - 23, ny - 169, 10, 158, '#FFFFFF');
    c.fillStyle = INK; c.beginPath(); c.moveTo(r.x - 27, ny - 170); c.lineTo(r.x, ny - 226); c.lineTo(r.x + 27, ny - 170); c.closePath(); c.fill();
    c.fillStyle = '#DC2626'; c.beginPath(); c.moveTo(r.x - 23, ny - 171); c.lineTo(r.x, ny - 220); c.lineTo(r.x + 23, ny - 171); c.closePath(); c.fill();
    for (const sd of [-1, 1]) {
      c.fillStyle = INK; c.beginPath(); c.moveTo(r.x + sd * 22, ny - 64); c.lineTo(r.x + sd * 48, ny + 2); c.lineTo(r.x + sd * 22, ny - 6); c.closePath(); c.fill();
      c.fillStyle = '#DC2626'; c.beginPath(); c.moveTo(r.x + sd * 23, ny - 58); c.lineTo(r.x + sd * 43, ny - 2); c.lineTo(r.x + sd * 23, ny - 10); c.closePath(); c.fill();
    }
    box(c, r.x - 17, ny - 12, 34, 16, INK); box(c, r.x - 14, ny - 10, 28, 12, show && st.tell > 0 ? (flash ? '#FDE047' : '#F97316') : '#52525B');
    if (show && !st.on) for (let yy = ny + 8; yy < rail - 6; yy += 16) {
      const col = st.tell > 0 && flash ? '#FDBA74' : '#9A3412';
      box(c, r.x - EXHAUST_W / 2, yy, 4, 8, col); box(c, r.x + EXHAUST_W / 2 - 4, yy, 4, 8, col);
    }
    if (lit) text(c, 'NOT FOR FLIGHT', r.x, ny - 90, '#1C1917', 5, 'center', null);
  }
  // The meteors, on their cables: inked hard and lit; a target on the rail where it'll come down (flashing as it's cued,
  // lit while it's sat there), LOOK UP well before
  METEORS.forEach((x, i) => {
    if (!on(x - 420, x + 60) || look.tricks.smashed.has(i) || (!show && i < 3)) return;
    const rail = trackY(x) ?? GY, t = look.tricks.meteor[i], m = meteorAt(t), cyy = rail - m.h - MET_R;
    warnSign(c, signX(x), 'LOOK UP', 'up', t > 0);
    laneMark(c, x - MET_R - 6, x + MET_R + 6, '#EF4444', m.tell > 0 || m.falling ? flash : m.down);
    if (!on(x - 60, x + 60)) return;
    box(c, x - 2, rail - 700, 4, 700 - m.h - MET_R * 2 + 4, INK); box(c, x - 1, rail - 700, 2, 700 - m.h - MET_R * 2 + 4, '#CBD5E1');
    if (i === METEORS.length - 1) { box(c, x - 20, rail - 720, 40, 30, '#CA8A04'); text(c, 'HAND HOIST', x, rail - 728, '#1C1917', 5, 'center', null); }
    c.fillStyle = INK; c.beginPath(); c.arc(x, cyy, MET_R + 4, 0, Math.PI * 2); c.fill();
    meteor(c, x + (m.tell ? Math.sin(f * 2) * 2 : 0), cyy, MET_R + 2, i, lit);
  });
  // The forklift, its pallet across the track (the pallet itself is in front: drawPallet); its beacon going round
  if (on(FORKLIFT_X - 420, FORKLIFT_X + 200)) {
    const rail = trackY(FORKLIFT_X) ?? GY;
    warnSign(c, signX(FORKLIFT_X), 'JUMP', 'up', true);
    laneMark(c, FORKLIFT_X - 46, FORKLIFT_X + 46, '#FACC15', flash);
    box(c, FORKLIFT_X + 40, rail - 110, 100, 90, INK); box(c, FORKLIFT_X + 42, rail - 108, 96, 86, '#F59E0B');
    box(c, FORKLIFT_X + 44, rail - 170, 6, 70, '#3F3F46'); box(c, FORKLIFT_X + 120, rail - 170, 6, 70, '#3F3F46'); box(c, FORKLIFT_X + 44, rail - 172, 82, 6, '#3F3F46');
    box(c, FORKLIFT_X + 78, rail - 186, 14, 14, INK); box(c, FORKLIFT_X + 80, rail - 184, 10, 10, flash ? '#FDE047' : '#F97316');
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
    if (st.on) {
      // (a sheet of beams across its whole lane: a glowing slab, inked, the beams bright in it)
      box(c, l.x - 22, rail - top - 1, 44, top - bot + 2, INK);
      box(c, l.x - 20, rail - top + 1, 40, top - bot - 2, 'rgba(34, 197, 94, 0.55)');
      for (let yy = rail - top + 4; yy < rail - bot - 2; yy += 8) box(c, l.x - 20, yy, 40, 2, '#DCFCE7');
    } else if (st.tell > 0 && (f >> 2) % 2) {
      // (coming on: its lane outlined, flashing)
      c.strokeStyle = '#4ADE80'; c.lineWidth = 3; c.setLineDash([6, 6]); c.strokeRect(l.x - 20, rail - top + 1, 40, top - bot - 2); c.setLineDash([]);
    }
  }
  for (const r of ROCKETS) if (on(r.x)) {
    const rail = trackY(r.x) ?? GY, st = rocketAt(f, r.phase);
    if (!st.on) continue;
    const wob = Math.sin(f * 1.3) * 4, top = rail - ROCKET_TOP;
    box(c, r.x - EXHAUST_W / 2 - 3, top, EXHAUST_W + 6, rail - top, INK);
    box(c, r.x - EXHAUST_W / 2, top, EXHAUST_W, rail - top, '#EA580C');
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
  // (hazard tape along it, and the forks' legs down to the rail: it's sat on the track)
  for (let j = 0; j < 11; j++) box(c, FORKLIFT_X - 44 + j * 8, rail - PALLET[1] - 10, 4, 4, j % 2 ? INK : '#FACC15');
  box(c, FORKLIFT_X - 40, rail - PALLET[1], 6, PALLET[1], INK); box(c, FORKLIFT_X + 34, rail - PALLET[1], 6, PALLET[1], INK);
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
    // (every obstacle has its own light: the dark's the show's, not something to hide them in)
    const spot = (x: number, up: number, r = 170, col = 'rgba(255, 247, 214, 0.12)') => { if (near(x)) lights.push({ x, y: (trackY(x) ?? GY) - up, r, a: 0.95, color: col }); };
    for (const x of SATELLITES) { spot(x, 90, 190); spot(signX(x), 110, 110); }
    for (const b of BUTLERS) { spot(b.x + 30, 80, 200); spot(signX(b.x), 110, 110); }
    for (const l of LASERS) spot(signX(l.x), 110, 110);
    for (const r of ROCKETS) { spot(r.x, 120, 200); spot(signX(r.x), 110, 110); }
    for (const x of METEORS) { spot(x, 60, 170); spot(signX(x), 110, 110); }
    for (let i = 0; i + 1 < RUNS.length; i++) if (RUNS[i + 1][0] - RUNS[i][1] > 20) { spot(RUNS[i][1] - 10, 40, 150, 'rgba(239, 68, 68, 0.16)'); spot(RUNS[i + 1][0] + 10, 40, 150, 'rgba(239, 68, 68, 0.16)'); spot(signX(RUNS[i][1]), 110, 110); }
    for (const [x] of WORKERS) spot(x, 40, 120);
    if (near(BREAKER_X)) lights.push({ x: BREAKER_X, y: (trackY(BREAKER_X) ?? GY) - 100, r: 90, a: 0.6, color: 'rgba(239, 68, 68, 0.15)' });
    if (near(STATION_X0) || near(STATION_X1)) for (let x = STATION_X0; x < STATION_X1 + 200; x += 200) lights.push({ x, y: GY - 300, r: 480, a: 0.9, cone: 200, color: 'rgba(224, 242, 254, 0.08)' });
  }
  // (the sled's headlamp, and enough round him that he's never lost)
  lights.push({ x: look.sledX, y: look.sledY - 50, r: 180, a: 0.6 });
  lights.push({ x: look.sledX + 180, y: look.sledY - 40, r: 160, a: 0.55, color: 'rgba(224, 242, 254, 0.08)' });
  return { dark, shade: [4, 3, 16], lights, rim: 0.5 };
};
