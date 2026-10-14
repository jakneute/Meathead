// The ride, painted (crude first pass): two looks of the one room, and the light between them (`k`: 0 the show, in
// the dark; 1 the work lights on, everything as it is).
//   the show       outer space and the future: a starfield all round, neon planets, the narrated scenes of 2010 by the
//                  track, the chain lift's blue strobes, the props (a satellite, Robo-Butler, the laser emitters, the
//                  cardboard Martians, the asteroid) dressed to look like the real thing in the dark
//   the warehouse  the same room with the lights on: corrugated walls, steel trusses, fluorescent tubes, pallet racks;
//                  the stars are Christmas lights on black tarp, the planets painted beach balls on strings, the scenes
//                  plywood cutouts on braces, a porta-potty, a guy's lunch. The show's props, plainly props
//   the circuit    the load station at both ends (the same platform, the same line, the empty sleds parked): from the
//                  start, the track's last leg seen coming down into it (the brake run up top, STATION AHEAD, a sled
//                  easing down); at the end, ridden: the brake run, the brake box, the siren, the drop
// Every obstacle's cue: a glowing sign on a post a second ahead of it (an up arrow: jump; a down arrow: duck; a
// crosshair: blast), lit while what it's about is still to come. Its own lighting (rideLighting).

import type { GameState } from '../../../m1/game/core/state';
import type { Player } from '../../../m1/types';
import type { SceneLight, Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { INK, box, text, mix, hash, sign } from '../../intro/art/kit';
import { GY } from '../geometry';
import { drawTableau, TABLEAUS, tinySled, meteor, OP_SEED } from '../atom/art';
import { drawAtomPerson } from '../atom/people';
import {
  R, RUNS, GAPS, OBS, CUES, CUE_XS, TABLEAU_XS, LIFT_X0, LIFT_X1, BREAKER_X, STATION_X0, STATION_X1, FINS_X0, FINS_X1, BRAKE_X,
  CREST_X, FRONT_AT, STATION_ROOF, WORKERS, STATION_FOLK, trackY, railLine, type Ob, type Verb,
  slopeAt,
} from './layout';
import { CLEAR, BEAM_CLEAR, HURDLE, halfW, trayReach, rockHeight, ROCK_R, obLive, cueLive, type Tricks } from './tricks';
import { drawSled, FRONT_SLED, type SledLook } from './sled';

type Ctx = CanvasRenderingContext2D;

/** What the painting needs to know of the ride. */
export interface RideLook {
  k: number; tricks: Tricks; breakerT: number; brakeT: number; boxT: number; sledX: number; sledY: number; speed: number;
  frontGone: boolean; flat: Set<number>; crashing: boolean;
}
/** The brake box, beside the brake run (he blasts it). */
export const BRAKE_BOX_X = R + 14860;
const EMPTY_SLED: SledLook = { body: '#CBD5E1', stripe: '#64748B', num: 0 };

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
    drawWarehouseBack(c, cam, cy);
    c.restore();
  }
  return true;
};

/** The warehouse, seen with the lights on (screen space: its far wall, slow). */
const drawWarehouseBack = (c: Ctx, cam: number, cy: number) => {
  const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
  c.fillStyle = '#9CA3AF'; c.fillRect(0, 0, W, H);
  const off = -((cam * 0.3) % 24);
  for (let x = off; x < W; x += 24) { box(c, x, 0, 3, H, '#8B929C'); box(c, x + 3, 0, 1, H, '#B4BAC2'); }
  const toff = -((cam * 0.35) % 260);
  for (let x = toff - 260; x < W + 260; x += 260) {
    box(c, x, 40 - cy * 0.03, 260, 8, '#52525B');
    c.strokeStyle = '#52525B'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, 48); c.lineTo(x + 130, 90); c.lineTo(x + 260, 48); c.stroke();
    box(c, x + 70, 96, 120, 6, '#F8FAFC'); box(c, x + 70, 102, 120, 2, '#CBD5E1');
  }
  const poff = -((cam * 0.2) % 700);
  for (let x = poff - 700; x < W + 700; x += 700) {
    box(c, x + 60, 130, 420, 220, '#111827');
    for (let j = 0; j < 30; j++) box(c, x + 70 + hash(j + x * 0.001) * 400, 140 + hash(j * 3.3) * 200, 3, 3, ['#FDE047', '#F87171', '#4ADE80', '#60A5FA'][j % 4]);
    c.strokeStyle = '#E5E7EB'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 560, 40); c.lineTo(x + 560, 190); c.stroke();
    c.fillStyle = '#F472B6'; c.beginPath(); c.arc(x + 560, 210, 26, 0, Math.PI * 2); c.fill();
    box(c, x + 534, 206, 52, 6, '#FDE047'); box(c, x + 552, 186, 6, 46, '#60A5FA');
  }
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
};

// ---------------------------------------------------------------------------------------------------------------
// The cues: a glowing sign on a post, about a second ahead of what it's about

const CUE_COL: Record<Verb, string> = { jump: '#22D3EE', duck: '#FBBF24', blast: '#F43F5E' };
/** How high the cue's sign stands over the rail (its middle), and its size. */
const CUE_UP = 128, CUE_S = 30;
/** The cue: an up arrow (jump), a down arrow (duck), a crosshair (blast); bright and pulsing while `live`. */
const cueSign = (c: Ctx, x: number, verb: Verb, live: boolean, f: number) => {
  const rail = trackY(x);
  if (rail === null) return;
  const cy = rail - CUE_UP, col = CUE_COL[verb], S = CUE_S;
  // the post, down to the rail
  box(c, x - 4, cy + S, 8, rail - cy - S, INK); box(c, x - 2, cy + S, 4, rail - cy - S, '#52525B');
  // the glow (stepped bands, pulsing in four steps while it's live)
  const pulse = live ? [0.5, 0.75, 1, 0.75][(f >> 3) % 4] : 0;
  if (live) for (let b = 3; b >= 1; b--) { c.globalAlpha = (0.16 + 0.1 * (3 - b)) * pulse; box(c, x - S - b * 9, cy - S - b * 9, (S + b * 9) * 2, (S + b * 9) * 2, col); }
  c.globalAlpha = 1;
  // the housing
  box(c, x - S - 4, cy - S - 4, S * 2 + 8, S * 2 + 8, INK);
  box(c, x - S, cy - S, S * 2, S * 2, live ? '#0B1120' : '#18181B');
  box(c, x - S, cy - S, S * 2, 3, live ? mix(col, '#FFFFFF', 0.3) : '#3F3F46');
  const fg = live ? (pulse > 0.9 ? mix(col, '#FFFFFF', 0.45) : col) : mix(col, '#18181B', 0.72);
  c.fillStyle = fg;
  if (verb === 'blast') {
    c.strokeStyle = fg; c.lineWidth = 5;
    c.beginPath(); c.arc(x, cy, S - 9, 0, Math.PI * 2); c.stroke();
    box(c, x - 2.5, cy - S + 3, 5, 14, fg); box(c, x - 2.5, cy + S - 17, 5, 14, fg);
    box(c, x - S + 3, cy - 2.5, 14, 5, fg); box(c, x + S - 17, cy - 2.5, 14, 5, fg);
    box(c, x - 3, cy - 3, 6, 6, fg);
  } else {
    const d = verb === 'jump' ? -1 : 1;
    c.beginPath();
    c.moveTo(x, cy + d * (S - 4)); c.lineTo(x - S + 5, cy + d * 2); c.lineTo(x - 9, cy + d * 2); c.lineTo(x - 9, cy - d * (S - 5));
    c.lineTo(x + 9, cy - d * (S - 5)); c.lineTo(x + 9, cy + d * 2); c.lineTo(x + S - 5, cy + d * 2); c.closePath(); c.fill();
    if (live) { c.fillStyle = mix(fg, '#FFFFFF', 0.5); c.fillRect(x - 3, cy - d * (S - 7) - (d > 0 ? 0 : 0), 6, 4); }
  }
};
/** The lane lit on the rail from x0 to x1 (chevrons along its top: where it'll get you). */
const laneMark = (c: Ctx, x0: number, x1: number, col: string, on: boolean) => {
  for (let x = x0; x < x1; x += 12) {
    const y = trackY(x);
    if (y === null) continue;
    box(c, x, y - 4, 8, 5, INK); box(c, x + 1, y - 3, 6, 3, on ? col : mix(col, '#1C1917', 0.55));
  }
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

/** The rail, from its run's ends; its supports down out of sight; at a gap, a buffer on each end, lit. */
const drawTrack = (c: Ctx, k: number, cam: number, f: number) => {
  const lit = k > 0.5;
  for (let i = 0; i < RUNS.length; i++) {
    const [a, b, ya, yb] = RUNS[i];
    if (b < cam - 100 || a > cam + CANVAS_WIDTH + 100) continue;
    for (let x = Math.ceil(a / 140) * 140; x < b; x += 140) {
      const y = ya + ((x - a) / (b - a)) * (yb - ya);
      box(c, x - 4, y, 8, 900, lit ? '#6B7280' : '#111827');
    }
    c.strokeStyle = INK; c.lineWidth = 10; c.beginPath(); c.moveTo(a, ya + 3); c.lineTo(b, yb + 3); c.stroke();
    c.strokeStyle = lit ? '#A1A1AA' : '#475569'; c.lineWidth = 6; c.beginPath(); c.moveTo(a, ya + 2); c.lineTo(b, yb + 2); c.stroke();
    c.strokeStyle = lit ? '#E5E7EB' : '#94A3B8'; c.lineWidth = 2; c.beginPath(); c.moveTo(a, ya); c.lineTo(b, yb); c.stroke();
  }
  for (const [a, b] of GAPS) {
    if (b < cam - 200 || a > cam + CANVAS_WIDTH + 200) continue;
    const ya = trackY(a) ?? GY, yb = trackY(b) ?? GY, flash = (f >> 3) % 2 === 0;
    laneMark(c, a - 200, a - 4, '#22D3EE', flash);
    for (const [x, y, on] of [[a - 7, ya, flash], [b + 7, yb, !flash]] as const) {
      // (a striped buffer on the rail's end, its red lamp)
      box(c, x - 7, y - 16, 14, 16, INK);
      for (let j = 0; j < 2; j++) box(c, x - 5, y - 14 + j * 7, 10, 6, j % 2 ? '#F8FAFC' : '#DC2626');
      box(c, x - 5, y - 26, 10, 10, INK); box(c, x - 3, y - 24, 6, 6, on ? '#FCA5A5' : '#B91C1C');
    }
    // (the hole itself: the rail's ends hanging off their last supports, a drop to nothing)
    if (a < R + 6000) sign(c, a - 150, ya - 64, 110, 16, '#FDE047', 'FUTURE: TBD', '#1C1917', 5);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The obstacles

/** One obstacle, in the back layer (its beams and its bands go in front: drawObFront). */
const drawOb = (c: Ctx, o: Ob, i: number, look: RideLook, f: number) => {
  const rail = trackY(o.x) ?? railLine(o.x), lit = look.k > 0.5, hw = halfW(o), d = o.x - look.sledX, x = o.x;
  const hurt = look.tricks.hurtT[i] > 0 && (f >> 1) % 2 === 0;
  const bot = rail - CLEAR;
  switch (o.kind) {
    case 'sat': {
      // hung off a striped rig: a wall from the ceiling down to its bottom edge
      hazardWall(c, x - hw, bot - 600, hw * 2, 600);
      if (i === 9) {
        // (a space station's module: a big drum, portholes)
        box(c, x - 60, bot - 54, 120, 54, INK); box(c, x - 57, bot - 51, 114, 48, '#CBD5E1'); box(c, x - 57, bot - 51, 114, 8, '#F1F5F9'); box(c, x - 57, bot - 12, 114, 9, '#94A3B8');
        for (let q = 0; q < 4; q++) { box(c, x - 46 + q * 28, bot - 38, 14, 14, INK); box(c, x - 44 + q * 28, bot - 36, 10, 10, (f >> 4) % 4 === q ? '#FDE047' : '#1E3A8A'); }
        text(c, 'SPACE STATION LIBERTY', x, bot - 58, lit ? '#1C1917' : '#94A3B8', 5, 'center', null);
      } else {
        box(c, x - 22, bot - 46, 44, 46, INK); box(c, x - 19, bot - 43, 38, 40, '#F1F5F9'); box(c, x - 19, bot - 43, 38, 6, '#FFFFFF');
        for (const sd of [-1, 1]) { const px = sd < 0 ? x - 76 : x + 22; box(c, px, bot - 36, 54, 26, INK); box(c, px + 2, bot - 34, 50, 22, '#2563EB'); for (let q = 1; q < 4; q++) box(c, px + 2 + q * 12, bot - 34, 2, 22, '#93C5FD'); }
        if (lit) text(c, 'FOAM? NO', x, bot - 52, '#1C1917', 5, 'center', null);
      }
      box(c, x - hw, bot - 3, hw * 2, 3, '#FDE047');
      break;
    }
    case 'beam': {
      // the emitter housing, a slab over the band, square to the track (slanted with it, up the hill): the band's in
      // front
      c.save(); c.translate(x, rail); c.rotate(slopeAt(x) ?? 0);
      hazardWall(c, -hw, -BEAM_CLEAR - 54 - 420, hw * 2, 420, '#14532D', '#86EFAC');
      c.restore();
      break;
    }
    case 'tray': {
      // Robo-Butler, beside the track (before it): its menu board swung out across the track on its arm, a wall up to
      // the ceiling, the tray at its bottom edge
      const rk = trayReach(d), bx = x - 130, tell = d < 900;
      robot(c, bx, rail, tell, f, lit);
      const cx = bx + 60 + rk * (x - bx - 60);
      c.strokeStyle = INK; c.lineWidth = 8; c.beginPath(); c.moveTo(bx + 14, rail - 90); c.lineTo(cx, rail - 140); c.stroke();
      c.strokeStyle = '#94A3B8'; c.lineWidth = 4; c.beginPath(); c.moveTo(bx + 14, rail - 90); c.lineTo(cx, rail - 140); c.stroke();
      hazardWall(c, cx - hw, bot - 600, hw * 2, 600 - 54, '#7F1D1D', '#FCA5A5');
      box(c, cx - 34, bot - 130, 68, 62, INK); box(c, cx - 31, bot - 127, 62, 56, '#FEF3C7');
      text(c, 'MENU', cx, bot - 112, '#7F1D1D', 6, 'center', null);
      for (let q = 0; q < 3; q++) text(c, 'PILL', cx, bot - 98 + q * 9, '#1C1917', 5, 'center', null);
      box(c, cx - hw - 4, bot - 58, hw * 2 + 8, 58, INK); box(c, cx - hw - 1, bot - 55, hw * 2 + 2, 52, '#E5E7EB'); box(c, cx - hw - 1, bot - 55, hw * 2 + 2, 5, '#FFFFFF');
      for (let j = 0; j < 4; j++) box(c, cx - 30 + j * 16, bot - 40, 10, 10, ['#F472B6', '#FDE047', '#4ADE80', '#60A5FA'][j]);
      box(c, cx - hw - 1, bot - 3, hw * 2 + 2, 3, '#FDE047');
      break;
    }
    case 'trolley': {
      // Robo-Butler's meal trolley, shoved out onto the rail: a low hurdle sat on it
      robot(c, x - 130, rail, d < 900, f, lit);
      c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(x - 116, rail - 80); c.lineTo(x - hw, rail - HURDLE + 4); c.stroke();
      box(c, x - hw - 3, rail - HURDLE - 3, hw * 2 + 6, HURDLE + 3, INK);
      box(c, x - hw, rail - HURDLE, hw * 2, 8, '#F8FAFC'); box(c, x - hw, rail - HURDLE + 8, hw * 2, HURDLE - 14, '#475569');
      for (let j = 0; j < 6; j++) box(c, x - hw + 2 + j * 7, rail - HURDLE + 9, 4, 4, j % 2 ? INK : '#FACC15');
      for (const wx of [x - hw + 6, x + hw - 6]) { c.fillStyle = INK; c.beginPath(); c.arc(wx, rail - 4, 5, 0, Math.PI * 2); c.fill(); }
      for (let j = 0; j < 3; j++) { c.fillStyle = ['#F472B6', '#FDE047', '#4ADE80'][j]; c.beginPath(); c.arc(x - 12 + j * 12, rail - HURDLE - 5, 4, 0, Math.PI * 2); c.fill(); }
      break;
    }
    case 'wire': {
      // a laser tripwire's emitter, bolted across the rail (its beam's in front)
      box(c, x - hw - 3, rail - 12, hw * 2 + 6, 12, INK); box(c, x - hw, rail - 10, hw * 2, 8, lit ? '#71717A' : '#166534');
      box(c, x - hw - 3, rail - HURDLE - 6, 8, HURDLE + 6, INK); box(c, x + hw - 5, rail - HURDLE - 6, 8, HURDLE + 6, INK);
      box(c, x - hw - 1, rail - HURDLE - 4, 4, 4, '#4ADE80'); box(c, x + hw - 3, rail - HURDLE - 4, 4, 4, '#4ADE80');
      break;
    }
    case 'pallet': {
      // the forklift, beside the track before it, its forks out across the rail with the pallet on them
      const fx = x - 170;
      box(c, fx, rail - 110, 100, 90, INK); box(c, fx + 2, rail - 108, 96, 86, '#F59E0B'); box(c, fx + 2, rail - 108, 96, 6, '#FCD34D');
      box(c, fx + 14, rail - 170, 6, 70, '#3F3F46'); box(c, fx + 90, rail - 170, 6, 70, '#3F3F46'); box(c, fx + 14, rail - 172, 82, 6, '#3F3F46');
      box(c, fx + 48, rail - 186, 14, 14, INK); box(c, fx + 50, rail - 184, 10, 10, (f >> 3) % 2 ? '#FDE047' : '#F97316');
      box(c, fx + 98, rail - 160, 8, 150, '#27272A');
      for (const wx of [fx + 20, fx + 76]) { c.fillStyle = INK; c.beginPath(); c.arc(wx, rail - 14, 14, 0, Math.PI * 2); c.fill(); }
      c.save(); c.translate(fx + 52, rail - 22); drawAtomPerson(c, 'worker', { seed: 2207, f, pose: 'stand', md: 'ok' }); c.restore();
      // (it's off the track, behind: knocked back; only its forks come out onto the rail)
      c.fillStyle = 'rgba(30, 32, 40, 0.38)'; c.fillRect(fx - 4, rail - 190, 114, 190);
      box(c, fx + 104, rail - 6, x + hw - fx - 104, 4, '#3F3F46');
      box(c, x - hw, rail - HURDLE, hw * 2, HURDLE - 6, INK);
      for (let j = 0; j < 2; j++) { box(c, x - hw + 2 + j * 22, rail - HURDLE + 2, 20, HURDLE - 10, '#A16207'); box(c, x - hw + 2 + j * 22, rail - HURDLE + 2, 20, 3, '#FBBF24'); }
      break;
    }
    case 'martian': {
      // a cardboard Martian, life size and then some, on a plywood stand on the rail
      const sh = hurt ? '#FFFFFF' : null;
      box(c, x - 26, rail - 14, 52, 14, INK); box(c, x - 24, rail - 12, 48, 10, '#A16207');
      box(c, x + 14, rail - 120, 6, 108, '#78350F');
      c.fillStyle = INK; c.beginPath(); c.ellipse(x, rail - 150, 34, 50, 0, 0, Math.PI * 2); c.fill();
      box(c, x - 24, rail - 112, 48, 100, INK);
      c.fillStyle = sh ?? '#22C55E'; c.beginPath(); c.ellipse(x, rail - 150, 31, 47, 0, 0, Math.PI * 2); c.fill();
      box(c, x - 21, rail - 110, 42, 96, sh ?? '#16A34A'); box(c, x - 21, rail - 110, 8, 96, sh ?? '#4ADE80');
      for (const sd of [-1, 1]) { box(c, x + sd * 12 - 7, rail - 162, 14, 18, INK); box(c, x + sd * 12 - 5, rail - 160, 10, 14, '#F8FAFC'); box(c, x + sd * 12 - 2, rail - 156, 5, 7, INK); }
      box(c, x - 10, rail - 128, 20, 5, INK);
      for (const sd of [-1, 1]) { box(c, x + sd * 14 - 2, rail - 216, 4, 22, INK); c.fillStyle = '#F43F5E'; c.beginPath(); c.arc(x + sd * 14, rail - 218, 5, 0, Math.PI * 2); c.fill(); }
      box(c, x - 40, rail - 104, 18, 8, '#16A34A'); box(c, x + 22, rail - 104, 18, 8, '#16A34A');
      text(c, 'ZORG', x, rail - 70, '#F8FAFC', 6, 'center', INK);
      // (the corner of the cardboard: it's flat)
      box(c, x + 20, rail - 30, 4, 18, '#D6D3D1');
      break;
    }
    case 'rock': {
      // the asteroid prop, on its cable from the ceiling: lowered onto the track as he comes
      const h = rockHeight(d), cy = rail - h - ROCK_R;
      box(c, x - 2, rail - 900, 4, 900 - h - ROCK_R * 2 + 4, INK); box(c, x - 1, rail - 900, 2, 900 - h - ROCK_R * 2 + 4, '#CBD5E1');
      c.fillStyle = INK; c.beginPath(); c.arc(x, cy, ROCK_R + 4, 0, Math.PI * 2); c.fill();
      if (hurt) { c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x, cy, ROCK_R + 2, 0, Math.PI * 2); c.fill(); }
      else meteor(c, x, cy, ROCK_R + 2, 3, lit);
      if (look.tricks.hp[i] < o.hp) { c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 30, cy - 10); c.lineTo(x - 6, cy + 4); c.lineTo(x + 4, cy - 18); c.lineTo(x + 28, cy + 10); c.stroke(); }
      if (h === 0) { box(c, x - ROCK_R, rail - 4, ROCK_R * 2, 4, '#7C2D12'); }
      break;
    }
    case 'crates': {
      // snack cases stacked on a pallet on the rail, up past where any jump gets him
      box(c, x - hw - 4, rail - 10, hw * 2 + 8, 10, INK); box(c, x - hw - 2, rail - 8, hw * 2 + 4, 6, '#A16207');
      for (let r = 0; r < 4; r++) for (let q = 0; q < 2; q++) {
        const bx = x - hw + q * hw, by = rail - 10 - (r + 1) * 50;
        box(c, bx, by, hw, 50, INK); box(c, bx + 2, by + 2, hw - 4, 46, hurt ? '#FFFFFF' : r % 2 === q ? '#B45309' : '#A16207'); box(c, bx + 2, by + 2, hw - 4, 4, '#FBBF24');
        text(c, 'SPACE', bx + hw / 2, by + 22, '#FDE047', 5, 'center', null); text(c, 'SNACKS', bx + hw / 2, by + 32, '#FDE047', 5, 'center', null);
      }
      if (look.tricks.hp[i] < o.hp) { c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 20, rail - 200); c.lineTo(x, rail - 150); c.lineTo(x - 10, rail - 90); c.stroke(); }
      break;
    }
  }
};
/** Robo-Butler: a can on a post, its head, its eyes (flashing: the tell), a beacon. */
const robot = (c: Ctx, bx: number, rail: number, tell: boolean, f: number, lit: boolean) => {
  const flash = (f >> 3) % 2 === 0;
  box(c, bx - 20, rail - 112, 40, 112, INK); box(c, bx - 17, rail - 109, 34, 106, '#CBD5E1'); box(c, bx - 17, rail - 109, 8, 106, '#F1F5F9');
  box(c, bx - 16, rail - 142, 32, 32, INK); box(c, bx - 13, rail - 139, 26, 26, '#E2E8F0');
  const eye = tell ? (flash ? '#EF4444' : '#FCA5A5') : '#475569';
  box(c, bx - 9, rail - 131, 7, 7, eye); box(c, bx + 3, rail - 131, 7, 7, eye);
  box(c, bx - 6, rail - 154, 12, 12, INK); box(c, bx - 4, rail - 152, 8, 8, tell && flash ? '#FDE047' : '#7C2D12');
  text(c, 'ROBO-BUTLER', bx, rail - 162, lit ? '#1C1917' : '#94A3B8', 5, 'center', null);
};

// ---------------------------------------------------------------------------------------------------------------
// The circuit: the load station (both ends), the track's last leg coming down into it

/** The load station, from x0 to x1 (the same at both ends): its wall, the sponsor's TVs, the empty sleds parked on
 *  their siding. The end's adds the line and the operator (drawStation). */
const stationShell = (c: Ctx, sx0: number, sx1: number, f: number, roofGone: boolean) => {
  const y = GY;
  box(c, sx0, STATION_ROOF - 300, sx1 - sx0, 300, roofGone ? '#020617' : '#1E3A8A');
  box(c, sx0, STATION_ROOF, sx1 - sx0, y - STATION_ROOF, '#1E3A8A');
  for (let x = sx0; x < sx1; x += 48) box(c, x, STATION_ROOF, 2, y - STATION_ROOF, '#1D3580');
  box(c, sx0, y, sx1 - sx0, 600, '#1C1B22'); box(c, sx0, y, sx1 - sx0, 3, '#52525B');
  box(c, sx0, STATION_ROOF, sx1 - sx0, 6, '#93C5FD');
  for (let j = 0; j * 200 + 60 < sx1 - sx0 - 100; j++) { const tx = sx0 + 60 + j * 200; box(c, tx, y - 210, 100, 70, INK); box(c, tx + 4, y - 206, 92, 62, (f + j * 40) % 240 < 120 ? '#0EA5E9' : '#F472B6'); text(c, 'PROGRESSCO', tx + 50, y - 168, '#0F172A', 6, 'center', null); }
};
/** The empty sleds, parked nose to tail on the siding at the back of the station (dimmed: they're behind). */
const parkedSleds = (c: Ctx, x: number, f: number) => {
  const y = GY - 96;
  box(c, x - 110, y, 380, 6, INK); box(c, x - 108, y + 1, 376, 3, '#475569');
  sign(c, x - 100, y - 104, 70, 14, '#334155', 'SPARES', '#CBD5E1', 5);
  c.save(); c.translate(x, y); c.scale(0.7, 0.7);
  for (let j = 0; j < 2; j++) { drawSled(c, j * 220, 0, f, EMPTY_SLED, true, 0, true); drawSled(c, j * 220, 0, f, EMPTY_SLED, false, 0, true); }
  c.restore();
  c.fillStyle = 'rgba(15, 23, 42, 0.35)'; c.fillRect(x - 110, y - 70, 380, 76);
};

/** The track's last leg, seen from the start: up behind, the brake run along its top, the drop down into the station
 *  (STATION AHEAD, BRAKE ZONE). Dimmed: it's behind, nothing to stand on. A sled comes round now and then: it stops in
 *  the brakes, sparks, and eases down into the station. */
const RETURN_TOP = GY - 290, RETURN_X0 = R + 280, RETURN_X1 = R + 980, RETURN_FOOT = R - 20;
const drawReturnLeg = (c: Ctx, f: number) => {
  const ay = RETURN_TOP, bx = RETURN_X0, ax = RETURN_X1, foot = RETURN_FOOT;
  const leg = (x: number) => (x >= bx ? ay : ay + ((bx - x) / (bx - foot)) * (GY - 30 - ay));
  // supports, the rail
  for (let x = foot + 60; x < ax; x += 210) box(c, x - 3, leg(x), 6, GY - 40 - leg(x), '#1E293B');
  c.strokeStyle = '#0F172A'; c.lineWidth = 9; c.beginPath(); c.moveTo(ax, ay + 2); c.lineTo(bx, ay + 2); c.lineTo(foot, GY - 28); c.stroke();
  c.strokeStyle = '#64748B'; c.lineWidth = 4; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, ay); c.lineTo(foot, GY - 30); c.stroke();
  // (the lamps down it: amber, the brake zone's)
  for (let x = foot + 80; x < bx; x += 70) { box(c, x - 3, leg(x) - 14, 6, 6, (f >> 4) % 2 ? '#F59E0B' : '#78350F'); }
  // the brake fins along the top, the brake box beside them
  for (let x = bx + 40; x < bx + 300; x += 26) box(c, x - 2, ay - 12, 4, 12, '#64748B');
  box(c, bx + 320, ay - 70, 34, 60, '#7F1D1D'); box(c, bx + 326, ay - 62, 22, 10, (f >> 4) % 2 ? '#22C55E' : '#14532D');
  // the signs: STATION AHEAD on a gantry over the crest, BRAKE ZONE by the fins
  box(c, bx + 420, ay - 64, 6, 64, '#334155'); sign(c, bx + 360, ay - 84, 140, 20, '#1E3A8A', 'STATION AHEAD', '#BAE6FD', 6);
  sign(c, bx + 110, ay - 58, 130, 16, '#A16207', 'BRAKE ZONE 3 MPH', '#FEF3C7', 5);
  // a sled, round every so often (going the other way: it's the far side of the loop): along the top, a crawl
  // through the brakes (sparks), and an easy roll down into the station
  const T = f % 600;
  let x = -1, y = ay;
  if (T < 120) x = ax - (T / 120) * (ax - bx - 300);
  else if (T < 220) x = bx + 300 - ((T - 120) / 100) * 300;
  else if (T < 360) { x = bx - ((T - 220) / 140) * (bx - foot); y = leg(x); }
  if (x > foot) {
    const rot = x < bx ? Math.atan2(GY - 30 - ay, bx - foot) : 0;
    c.save(); c.translate(x, y); c.scale(-0.6, 0.6); drawSled(c, 0, 0, f, FRONT_SLED, true, rot, false); drawSled(c, 0, 0, f, FRONT_SLED, false, rot, false); c.restore();
    if (T >= 120 && T < 220 && f % 2 === 0) { box(c, x - 20 + (f % 7) * 5, y - 6, 3, 3, '#FDE047'); box(c, x + (f % 5) * 6, y - 10, 2, 2, '#FFFFFF'); }
  }
  // (knocked back: it's behind, in the dark)
  c.fillStyle = 'rgba(3, 2, 10, 0.15)'; c.fillRect(foot, ay - 100, ax - foot + 20, GY - ay + 100);
};

/** The brake run (ridden, at the end): the fins along the rail, the attendant's booth, the brake box; the gantry over
 *  the crest (STATION AHEAD, BRAKE ZONE: BRAKE FAILURE, once he's done the box); the red lamps down the drop. */
const drawBrakeRun = (c: Ctx, look: RideLook, f: number) => {
  const rail = trackY(BRAKE_X) ?? GY, failed = look.boxT > 0, flash = (f >> 3) % 2 === 0;
  // the attendant's booth, behind the track
  box(c, BRAKE_X - 120, rail - 130, 96, 130, INK); box(c, BRAKE_X - 117, rail - 127, 90, 124, '#0F766E'); box(c, BRAKE_X - 108, rail - 112, 72, 34, '#BAE6FD');
  c.save(); c.translate(BRAKE_X - 72, rail - 40); drawAtomPerson(c, 'op', { seed: 6610, f, pose: failed ? 'after' : 'stand', md: 'ok' }); c.restore();
  box(c, BRAKE_X - 117, rail - 46, 90, 46, '#115E59');
  sign(c, BRAKE_X - 150, rail - 160, 150, 20, '#FDE047', 'BRAKE RUN: 3 MPH', '#1C1917', 6);
  // the fins along the rail (till they're torn off)
  if (!failed) for (let x = FINS_X0; x < FINS_X1; x += 26) { const y = trackY(x) ?? rail; box(c, x - 3, y - 16, 6, 16, INK); box(c, x - 2, y - 15, 4, 14, '#A1A1AA'); box(c, x - 2, y - 15, 4, 2, '#F4F4F5'); }
  else for (let x = FINS_X0; x < FINS_X1; x += 26) { const y = trackY(x) ?? rail; box(c, x - 3, y - 4, 6, 4, '#52525B'); if ((f + x) % 11 < 2) box(c, x - 1, y - 8, 2, 2, '#FDE047'); }
  // the brake box, beside the rail (blasted: its door off, its guts sparking)
  const bx = BRAKE_BOX_X, by = trackY(bx) ?? rail;
  box(c, bx - 4, by - 20, 8, 20, '#27272A');
  if (!failed) {
    box(c, bx - 24, by - 104, 48, 86, INK); box(c, bx - 21, by - 101, 42, 80, '#991B1B'); box(c, bx - 21, by - 101, 42, 5, '#DC2626');
    text(c, 'BRAKE', bx, by - 84, '#FEF3C7', 5, 'center', null); text(c, 'CONTROL', bx, by - 76, '#FEF3C7', 5, 'center', null);
    box(c, bx - 14, by - 66, 12, 12, INK); box(c, bx - 12, by - 64, 8, 8, '#22C55E'); box(c, bx + 2, by - 66, 12, 12, INK); box(c, bx + 4, by - 64, 8, 8, '#14532D');
    box(c, bx - 16, by - 46, 32, 16, '#27272A'); text(c, 'OK', bx, by - 34, '#4ADE80', 5, 'center', null);
  } else {
    box(c, bx - 24, by - 64, 48, 46, INK); box(c, bx - 21, by - 61, 42, 40, '#1F2937');
    for (let j = 0; j < 4; j++) box(c, bx - 16 + j * 9, by - 58 + (j % 2) * 6, 3, 30, ['#EF4444', '#FDE047', '#3B82F6', '#22C55E'][j]);
    if (f % 6 < 3) { box(c, bx - 6 + hash(f) * 16, by - 70 + hash(f * 3) * 30, 4, 4, '#FDE047'); box(c, bx + hash(f * 7) * 10, by - 60, 3, 3, '#FFFFFF'); }
  }
  // the gantry over the crest
  const gy = (trackY(CREST_X) ?? rail) - 250;
  box(c, CREST_X - 150, gy, 8, 250, INK); box(c, CREST_X + 150, gy, 8, 250, INK); box(c, CREST_X - 150, gy - 8, 308, 10, INK);
  sign(c, CREST_X - 110, gy + 6, 220, 24, '#1E3A8A', 'STATION AHEAD', '#BAE6FD', 8);
  if (!failed) sign(c, CREST_X - 90, gy + 38, 180, 20, '#A16207', 'BRAKE ZONE 3 MPH', '#FEF3C7', 6);
  else sign(c, CREST_X - 100, gy + 38, 200, 24, flash ? '#DC2626' : '#7F1D1D', 'BRAKE FAILURE', '#FFFFFF', 8);
  // the red lamps down the drop (lit, the brakes gone)
  for (let x = CREST_X + 40; x < STATION_X0; x += 70) {
    const y = trackY(x) ?? GY;
    box(c, x - 1, y - 60, 3, 54, '#27272A'); box(c, x - 5, y - 70, 10, 10, INK);
    box(c, x - 3, y - 68, 6, 6, failed ? ((f >> 2) + x / 70) % 2 < 1 ? '#EF4444' : '#7F1D1D' : '#451A03');
  }
};

/** Back in the station (the same as the one he left from): the line, the platform, the console, the empty sleds. */
const drawStation = (c: Ctx, state: GameState, look: RideLook) => {
  const f = state.frame, cam = state.camera.x;
  if (cam + CANVAS_WIDTH < STATION_X0 - 200) return;
  const y = GY;
  stationShell(c, STATION_X0 - 60, STATION_X1 + 200, f, look.frontGone);
  if (look.frontGone) for (let j = 0; j < 8; j++) box(c, FRONT_AT - 120 + j * 30, STATION_ROOF - 20 + (j % 3) * 8, 26, 10, '#1E3A8A');
  sign(c, STATION_X0 + 120, STATION_ROOF + 30, 420, 30, '#0F172A', 'VOYAGE TO 2010  -  PRESENTED BY PROGRESSCO', '#67E8F9', 8);
  parkedSleds(c, STATION_X0 + 300, f);
  // (the line, behind its rail: the same people, still waiting; wide-eyed once it's coming, the nearest splattered)
  const coming = look.crashing && look.boxT > 0;
  for (let j = 0; j < 16; j++) {
    const qx = STATION_X0 + 20 + j * 34, seed = 4001 + j * 337;
    c.save(); c.translate(qx, y - 20 - (j % 2) * 14); drawAtomPerson(c, 'guest', { seed, f, pose: coming ? 'after' : 'stand', md: 'ok' }); c.restore();
  }
  box(c, STATION_X0, y - 64, 560, 4, '#CBD5E1');
  box(c, STATION_X0 + 560, y - 4, STATION_X1 - STATION_X0 - 560, 4, '#FACC15');
  // (what's left on the platform of whoever was on the track)
  look.flat.forEach(i => { const x = STATION_FOLK[i].x + 10; box(c, x, y - 3, 90, 4, '#7F1D1D'); box(c, x + 20, y - 4, 40, 3, '#B91C1C'); box(c, x + 10, y - 60 - (i % 3) * 10, 6, 14, '#991B1B'); });
  // (the operator at her console)
  c.save(); c.translate(STATION_X0 + 600, y); drawAtomPerson(c, 'op', { seed: OP_SEED, f, pose: look.frontGone || coming ? 'after' : 'stand', md: 'ok' }); c.restore();
  box(c, STATION_X0 + 630, y - 70, 60, 70, INK); box(c, STATION_X0 + 632, y - 68, 56, 66, '#0F766E');
};

/** The start: the station he's just left (behind him), the empty sleds; the track's last leg coming down into it. */
const drawStart = (c: Ctx, state: GameState) => {
  const f = state.frame;
  stationShell(c, R - 700, R + 40, f, false);
  parkedSleds(c, R - 520, f);
  sign(c, R - 600, STATION_ROOF + 30, 360, 26, '#0F172A', 'VOYAGE TO 2010  -  PRESENTED BY PROGRESSCO', '#67E8F9', 7);
  // (the tunnel mouth out of it, into the dark)
  box(c, R + 30, STATION_ROOF, 20, GY - STATION_ROOF, INK);
  drawReturnLeg(c, f);
};

export const drawRideBack = (c: Ctx, state: GameState, look: RideLook) => {
  const f = state.frame, cam = state.camera.x, k = look.k, lit = k > 0.5;
  const on = (x0: number, x1: number) => x1 > cam - 150 && x0 < cam + CANVAS_WIDTH + 150;
  if (on(R - 700, R + 1100)) drawStart(c, state);
  // The scenes of 2010, by the track (act 1): lit, they're plywood on braces
  TABLEAU_XS.forEach((sx, i) => {
    const y = (trackY(sx) ?? GY) - 40;
    if (!on(sx - 50, sx + 300)) return;
    c.save(); c.globalAlpha = 0.5; drawTableau(c, TABLEAUS[i], sx, y, f); c.restore();
    if (lit) { for (let b = 0; b < 3; b++) { c.strokeStyle = '#A16207'; c.lineWidth = 4; c.beginPath(); c.moveTo(sx + 30 + b * 90, y - 100); c.lineTo(sx + 60 + b * 90, y + 30); c.stroke(); } text(c, 'PROPERTY OF PROGRESSCO', sx + 120, y + 14, '#78350F', 5, 'center', null); }
  });
  // The lift: the chain up the middle, blue strobes along it
  if (on(LIFT_X0, LIFT_X1)) for (let x = LIFT_X0 + 40; x < LIFT_X1; x += 80) {
    const y = trackY(x) ?? GY;
    box(c, x - 4, y - 200, 8, 8, lit ? '#9CA3AF' : (Math.floor(f / 6) - x / 80) % 8 < 1 ? '#93C5FD' : '#1E3A8A');
  }
  drawTrack(c, k, cam, f);
  // The obstacles (the show's: not there with the power off on a second go), and their lanes lit on the rail
  OBS.forEach((o, i) => {
    if (!on(o.x - 200, o.x + 200) || !obLive(state, look.tricks, i)) return;
    drawOb(c, o, i, look, f);
    laneMark(c, o.x - halfW(o) - 4, o.x + halfW(o) + 4, CUE_COL[o.verb], (f >> 3) % 2 === 0);
  });
  // The cues, a second ahead of each
  CUES.forEach((q, i) => {
    const x = CUE_XS[i];
    if (!on(x - 60, x + 60)) return;
    // (the show's, dead with the power off on a second go: no cue)
    if (q.ob >= 0 && !look.tricks.broken.has(q.ob) && !obLive(state, look.tricks, q.ob)) return;
    cueSign(c, x, q.verb, cueLive(state, look.tricks, i, look.sledX), f);
  });
  // The MAIN BREAKER (till it's smashed: then its door hanging off, sparking)
  if (on(BREAKER_X - 100, BREAKER_X + 100)) {
    const rail = trackY(BREAKER_X) ?? GY, gone = look.breakerT > 0;
    box(c, BREAKER_X + 30, rail - 200, 10, 200, '#52525B');
    box(c, BREAKER_X - 30, rail - 150, 70, 100, INK); box(c, BREAKER_X - 28, rail - 148, 66, 96, '#9CA3AF');
    sign(c, BREAKER_X - 60, rail - 190, 130, 22, '#FDE047', 'MAIN BREAKER', '#1C1917', 6);
    if (!gone) { box(c, BREAKER_X - 6, rail - 120, 14, 36, '#27272A'); box(c, BREAKER_X - 10, rail - 128, 22, 10, '#DC2626'); text(c, 'DO NOT TOUCH', BREAKER_X + 5, rail - 60, '#7F1D1D', 5, 'center', null); }
    else { box(c, BREAKER_X - 28, rail - 148, 66, 96, '#1F2937'); if (f % 8 < 3) box(c, BREAKER_X - 10 + hash(f) * 30, rail - 130 + hash(f * 3) * 60, 4, 4, '#FDE047'); }
  }
  if (on(BRAKE_X - 300, STATION_X0 + 100)) drawBrakeRun(c, look, f);
  drawStation(c, state, look);
};

/** In front: the laser bands, the tripwires' beams. */
export const drawRideFront = (c: Ctx, state: GameState, look: RideLook) => {
  const f = state.frame, cam = state.camera.x;
  OBS.forEach((o, i) => {
    if (o.x < cam - 100 || o.x > cam + CANVAS_WIDTH + 100 || !obLive(state, look.tricks, i)) return;
    const rail = trackY(o.x) ?? GY, hw = halfW(o);
    if (o.kind === 'beam') {
      // (a slab of beams from the housing down to its bottom edge: a glowing band, inked, the beams bright in it)
      // (square to the track: slanted with it up the hill; its bottom edge well up off the rail, plainly over him ducked)
      c.save(); c.translate(o.x, rail); c.rotate(slopeAt(o.x) ?? 0);
      const top = -BEAM_CLEAR - 54, bot = -BEAM_CLEAR;
      box(c, -hw, top - 1, hw * 2, bot - top + 2, INK);
      box(c, -hw + 2, top + 1, hw * 2 - 4, bot - top - 2, 'rgba(34, 197, 94, 0.6)');
      for (let yy = top + 4; yy < bot - 2; yy += 8) box(c, -hw + 2, yy + ((f >> 2) % 2), hw * 2 - 4, 2, '#DCFCE7');
      box(c, -hw, bot - 3, hw * 2, 3, '#FDE047');
      c.restore();
    } else if (o.kind === 'wire') {
      box(c, o.x - hw, rail - HURDLE, hw * 2, HURDLE - 10, 'rgba(34, 197, 94, 0.55)');
      for (let yy = rail - HURDLE + 2; yy < rail - 10; yy += 5) box(c, o.x - hw, yy, hw * 2, 2, (f >> 2) % 2 ? '#DCFCE7' : '#86EFAC');
    }
  });
};

/** The space blaster's bolts, the flash at his gun, what's been blasted to bits. */
export const drawBlaster = (c: Ctx, state: GameState, tr: Tricks, p: Player) => {
  for (const b of tr.bits) { c.save(); c.translate(b.x, b.y); c.rotate(b.rot); box(c, -b.w / 2 - 1, -b.h / 2 - 1, b.w + 2, b.h + 2, INK); box(c, -b.w / 2, -b.h / 2, b.w, b.h, b.col); c.restore(); }
  for (const b of tr.bolts) {
    // (a green bolt: a long streak, a hot core, a stepped glow; along the way it was fired)
    c.save(); c.translate(b.x, b.y); c.rotate(b.ang);
    c.globalAlpha = 0.25; box(c, -40, -7, 64, 14, '#22C55E');
    c.globalAlpha = 0.5; box(c, -30, -4, 54, 8, '#4ADE80');
    c.globalAlpha = 1; box(c, -22, -2, 46, 4, '#BBF7D0'); box(c, 6, -1, 18, 2, '#FFFFFF');
    c.restore();
  }
  if (tr.flash > 0 && p.cartSeat) {
    const mx = p.pos.x + p.width + 4, my = p.pos.y + 30, r = 4 + tr.flash * 2;
    c.globalAlpha = 0.5; box(c, mx - r, my - r, r * 2, r * 2, '#86EFAC'); c.globalAlpha = 1;
    box(c, mx - r / 2, my - r / 2, r, r, '#F0FDF4');
  }
  void state;
};

// ---------------------------------------------------------------------------------------------------------------
// The lighting

export const rideLighting = (state: GameState, look: RideLook): SceneLight => {
  const cam = state.camera.x, lights: Light[] = [];
  const near = (x: number) => x > cam - 300 && x < cam + CANVAS_WIDTH + 300;
  const dark = 0.62 * (1 - look.k);
  if (look.k < 1) {
    const spot = (x: number, up: number, r = 170, col = 'rgba(255, 247, 214, 0.12)', a = 0.95) => { if (near(x)) lights.push({ x, y: (trackY(x) ?? railLine(x)) - up, r, a, color: col }); };
    // (every obstacle has its own light: the dark's the show's, not something to hide them in)
    OBS.forEach((o, i) => { if (obLive(state, look.tricks, i)) spot(o.x, o.verb === 'duck' ? 80 : 60, 190); if (o.kind === 'beam' && obLive(state, look.tricks, i)) spot(o.x, 85, 130, 'rgba(74, 222, 128, 0.2)'); });
    // (the cues: lit up in their own color, full while they're live)
    const tint: Record<Verb, string> = { jump: 'rgba(34, 211, 238, 0.22)', duck: 'rgba(251, 191, 36, 0.22)', blast: 'rgba(244, 63, 94, 0.22)' };
    CUES.forEach((q, i) => { const live = cueLive(state, look.tricks, i, look.sledX); spot(CUE_XS[i], CUE_UP, live ? 120 : 70, tint[q.verb], live ? 1 : 0.6); });
    for (const [a, b] of GAPS) { spot(a - 10, 40, 150, 'rgba(239, 68, 68, 0.16)'); spot(b + 10, 40, 150, 'rgba(239, 68, 68, 0.16)'); }
    for (const x of TABLEAU_XS) if (near(x + 100)) lights.push({ x: x + 120, y: (trackY(x + 100) ?? GY) - 120, r: 260, a: 0.8, color: 'rgba(244, 114, 182, 0.1)' });
    for (const [x] of WORKERS) spot(x, 40, 120);
    if (near(BREAKER_X)) lights.push({ x: BREAKER_X, y: (trackY(BREAKER_X) ?? GY) - 100, r: 90, a: 0.6, color: 'rgba(239, 68, 68, 0.15)' });
    if (near(R)) for (let x = R - 600; x < R + 100; x += 200) lights.push({ x, y: GY - 300, r: 420, a: 0.85, cone: 200, color: 'rgba(224, 242, 254, 0.08)' });
    // (the track's last leg, seen from the start: its signs and its brake zone lit, so it reads)
    if (near(RETURN_X0)) for (const [x, up, r] of [[RETURN_X0 + 430, 70, 150], [RETURN_X0 + 175, 50, 150], [RETURN_X0 + 337, 40, 90], [RETURN_X0 - 120, 0, 160]] as const) lights.push({ x, y: RETURN_TOP - up + (x < RETURN_X0 ? 150 : 0), r, a: 0.9, color: 'rgba(253, 230, 138, 0.1)' });
  }
  for (const b of look.tricks.bolts) lights.push({ x: b.x, y: b.y, r: 90, a: 0.8, color: 'rgba(74, 222, 128, 0.25)' });
  if (near(STATION_X0) || near(STATION_X1)) for (let x = STATION_X0; x < STATION_X1 + 200; x += 200) lights.push({ x, y: GY - 300, r: 480, a: 0.9, cone: 200, color: 'rgba(224, 242, 254, 0.08)' });
  // (the sled's headlamp, and enough round him that he's never lost)
  lights.push({ x: look.sledX, y: look.sledY - 50, r: 180, a: 0.6 });
  lights.push({ x: look.sledX + 180, y: look.sledY - 40, r: 160, a: 0.55, color: 'rgba(224, 242, 254, 0.08)' });
  return { dark, shade: [4, 3, 16], lights, rim: 0.5 };
};
