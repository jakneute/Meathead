// The ride, painted (the SNES pass): two looks of the one room, and the light between them (`k`: 0 the show, in the
// dark; 1 the work lights on, everything as it is).
//   the show       outer space and the future: the dome in banded violet, its painted nebulae, a starfield in three
//                  depths, blacklit planets (stamped), the narrated scenes of 2010 by the track, the chain lift (its
//                  chain crawling, its blue strobes), the props (a satellite in gold foil, Robo-Butler, the laser
//                  emitters, the cardboard Martians, the asteroid) dressed to look like the real thing in the dark
//   the warehouse  the same room with the lights on: corrugated walls, steel trusses, fluorescent tubes, pallet racks;
//                  the stars are Christmas lights on black tarp, the planets painted beach balls on strings, the scenes
//                  plywood cutouts on braces, a porta-potty, a guy's lunch. The show's props, plainly props (stamped
//                  in tiles, knocked back so nothing back there reads as somewhere to be)
//   the circuit    the load station at both ends (the same platform, the same line, the empty sleds parked): from the
//                  start, the track's last leg seen coming down into it (the brake run up top, STATION AHEAD, a sled
//                  easing down); at the end, ridden: the brake run, the brake box, the siren, the drop
// Every obstacle's cue: a glowing sign on a post a second ahead of it (an up arrow: jump; a down arrow: duck; a
// crosshair: blast), lit while what it's about is still to come. Its own lighting (rideLighting).

import type { GameState } from '../../../m1/game/core/state';
import type { Player } from '../../../m1/types';
import type { SceneLight, Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { INK, box, mix, hash, sign, slab, rampOf, lite, dark, stamp, checker, bandedGradient, hazeBands, pixelBlob, tilePattern, star } from '../../intro/art/kit';
import { GY } from '../geometry';
import { drawTableau, TABLEAUS, tinySled, meteor, OP_SEED, planet, CARPET } from '../atom/art';
import { drawAtomPerson } from '../atom/people';
import { cyl, sphere, neonBar, lamp, truss, rivets, hazard, screenGlass } from '../atom/snes';
import {
  R, RUNS, GAPS, OBS, CUES, CUE_XS, TABLEAU_XS, LIFT_X0, LIFT_X1, BREAKER_X, STATION_X0, STATION_X1, LOAD_X0, FINS_X0, FINS_X1,
  BRAKE_X, BRAKE_BOX_X, GANTRY_X, FRONT_AT, STATION_ROOF, WORKERS, STATION_FOLK, UNLOAD_OP, QUEUE, CONSOLE_OP_X, trackY, railLine, type Ob, type Verb,
  slopeAt,
} from './layout';
import { CLEAR, BEAM_CLEAR, HURDLE, halfW, trayReach, rockHeight, ROCK_R, obLive, cueLive, type Tricks } from './tricks';
import { drawSled, FRONT_SLED, type SledLook } from './sled';
import { lettering, letterSize } from '../square/lettering';
import { SPUR_X0, SPUR_X1, drawSpurBack, drawSpurRail, drawSpurFront, spurLights } from './spur';
import { plate, plateBoxAt, wallPlate, legs, cables, brackets } from '../atom/signs';

type Ctx = CanvasRenderingContext2D;

/** The ride building's floor, down under the track (out of sight below it nearly everywhere): every support, leg and
 *  jamb goes down to a footing on it. */
const FOOT_Y = GY + 380;
/** A concrete footing (a pier cap, its anchor bolts), centered on x, on the floor. */
const footing = (c: Ctx, x: number, w = 26, lit = false) => {
  const col = lit ? ['#57534E', '#78716C', '#A8A29E'] : ['#0F172A', '#1E293B', '#334155'];
  box(c, x - w / 2 - 1, FOOT_Y - 13, w + 2, 13, INK);
  box(c, x - w / 2, FOOT_Y - 12, w, 12, col[1]); box(c, x - w / 2, FOOT_Y - 12, w, 2, col[2]); box(c, x - w / 2, FOOT_Y - 3, w, 3, col[0]);
  box(c, x - 6, FOOT_Y - 15, 2, 3, col[2]); box(c, x + 4, FOOT_Y - 15, 2, 3, col[2]);
};
/** A steel column from `top` down to a footing on the floor. */
const column = (c: Ctx, x: number, top: number, w: number, col: string, lit: boolean) => {
  if (FOOT_Y - top <= 0) return;
  cyl(c, x - w / 2, top, w, FOOT_Y - 12 - top, col, 'y');
  footing(c, x, w + 16, lit);
};
/** A board stamped with its words, standing on legs down to `foot` (the girder, a deck, a roof). */
const postedPlate = (c: Ctx, key: string, x: number, y: number, foot: number, text: string, font: Parameters<typeof plate>[5], face: string, ink: string, pad = 6) => {
  const [x0, , x1, y1] = plateBoxAt(text, font, x, y, pad);
  legs(c, [x0 + 12, x1 - 12], y1 - 4, foot, '#52525B', 5);
  return plate(c, key, x, y, text, font, face, ink, pad);
};
/** Words stamped where they sit (a prop's label, a screen's): their middle at (x, y) (lines split on '\n'). */
const label = (c: Ctx, key: string, x: number, y: number, text: string, font: Parameters<typeof lettering>[4], ink: string, bg: string, w = 160, h = 24) => {
  const lines = text.split('\n'), lh = letterSize('A', font)[1] - 1;
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, `ride-label-${key}`, -w / 2, -h / 2, w, h, g => lines.forEach((l, i) => lettering(g, l, 0, Math.round((i - (lines.length - 1) / 2) * lh), font, ink, bg, true)));
  c.restore();
};
/** The PA's speaker poles along act 1 (none within reach of a cue's sign, a scene or a gap). */
const PA_POLES = [700, 1500, 2150, 3350, 3950, 4650, 5650, 6050].map(x => R + x).filter(x =>
  CUE_XS.every(q => Math.abs(q - x) > 70) && TABLEAU_XS.every(t => x < t - 70 || x > t + 300) && GAPS.every(([a, b]) => x < a - 160 || x > b + 30) && OBS.every(o => Math.abs(o.x - x) > 200) && trackY(x) !== null);
/** What holds things up, behind the track (drawn before it: the rail goes over it): the trackside decks (steel plate on
 *  legs down to the floor) the props beside the track stand on (Robo-Butler's, the forklift's, the brake attendant's
 *  booth); the crest gantry's legs; the breaker doorway's and the brake box alcove's jambs, on down to the floor. */
const drawSupports = (c: Ctx, cam: number, lit: boolean) => {
  const on = (a: number, b: number) => b > cam - 100 && a < cam + CANVAS_WIDTH + 100;
  if (on(GANTRY_X - 170, GANTRY_X + 170)) {
    const gy = (trackY(GANTRY_X) ?? GY) - 250;
    for (const lx of [GANTRY_X - 154, GANTRY_X + 146]) { truss(c, lx, gy, 14, FOOT_Y - 12 - gy, '#3F3F46', true); footing(c, lx + 7, 34, lit); }
  }
  if (on(BREAKER_X - 120, BREAKER_X + 120)) {
    const rail = trackY(BREAKER_X) ?? GY;
    for (const jx of [BREAKER_X - 110, BREAKER_X + 96]) { box(c, jx - 2, rail, 18, FOOT_Y - 12 - rail, INK); hazard(c, jx, rail, 14, FOOT_Y - 12 - rail, '#EAB308', '#3F3F46', 10); footing(c, jx + 7, 30, lit); }
  }
  if (on(BRAKE_BOX_X - 60, BRAKE_BOX_X + 60)) {
    const by = trackY(BRAKE_BOX_X) ?? GY;
    for (const jx of [BRAKE_BOX_X - 50, BRAKE_BOX_X + 36]) { box(c, jx - 2, by, 16, FOOT_Y - 12 - by, INK); hazard(c, jx, by, 12, FOOT_Y - 12 - by, '#EAB308', '#3F3F46', 8); footing(c, jx + 6, 28, lit); }
  }
  const decks: [number, number, number][] = [];
  for (const o of OBS) {
    if (o.kind === 'tray' || o.kind === 'trolley') decks.push([o.x - 164, o.x - 96, o.x]);
    if (o.kind === 'pallet') decks.push([o.x - 182, o.x - 58, o.x]);
  }
  decks.push([BRAKE_X - 128, BRAKE_X - 16, BRAKE_X]);
  for (const [d0, d1, ox] of decks) {
    const dx = [d0, d1];
    if (!on(d0, d1)) continue;
    // (level with the feet of what's on it: they're drawn at the rail's height at the obstacle)
    const y = trackY(ox) ?? railLine(ox);
    column(c, dx[0] + 12, y + 8, 6, '#3F3F46', lit); column(c, dx[1] - 12, y + 8, 6, '#3F3F46', lit);
    box(c, dx[0], y - 1, dx[1] - dx[0], 10, INK); box(c, dx[0] + 1, y, dx[1] - dx[0] - 2, 8, lit ? '#57534E' : '#1E293B'); box(c, dx[0] + 1, y, dx[1] - dx[0] - 2, 1, lit ? '#78716C' : '#334155');
    for (let x = dx[0] + 6; x < dx[1] - 4; x += 8) box(c, x, y + 3, 4, 2, lit ? '#44403C' : '#111827');
  }
};

/** What the painting needs to know of the ride. */
export interface RideLook {
  k: number; tricks: Tricks; breakerT: number; brakeT: number; boxT: number; sledX: number; sledY: number; speed: number;
  frontGone: boolean; flat: Set<number>; crashing: boolean;
  /** Who in the station's been flung (index.ts: q0.., unload, op); the runaway's off. */
  gone: Set<string>; lurched: boolean;
}

/** A control panel he's punched in (its face's box: x, y, w, h): the face caved in round a fist-sized crater, creased
 *  out to its bowed edges, a corner peeled up, the guts showing, wires hanging out of it, sparking, smoking. */
const crumpledPanel = (c: Ctx, x: number, y: number, w: number, h: number, face: string, f: number, seed: number) => {
  const r = rampOf(face), cx = x + w * 0.42, cy = y + h * 0.55;
  // (the face, bowed in: its edges pulled toward the crater)
  const edge: [number, number][] = [[x, y], [x + w * 0.5, y + 3], [x + w, y], [x + w - 3, y + h * 0.5], [x + w, y + h], [x + w * 0.5, y + h - 3], [x, y + h], [x + 3, y + h * 0.5]];
  c.fillStyle = INK; c.beginPath(); edge.forEach(([ex, ey], i) => (i ? c.lineTo(ex + (ex < cx ? -1 : 1), ey + (ey < cy ? -1 : 1)) : c.moveTo(ex - 1, ey - 1))); c.closePath(); c.fill();
  c.fillStyle = r[1]; c.beginPath(); edge.forEach(([ex, ey], i) => (i ? c.lineTo(ex, ey) : c.moveTo(ex, ey))); c.closePath(); c.fill();
  // (stepped shading round the dent: lit on the far lip, dark on the near)
  c.fillStyle = r[2]; c.beginPath(); c.moveTo(x + 4, y + 4); c.lineTo(cx, cy - 12); c.lineTo(x + w - 4, y + 4); c.closePath(); c.fill();
  c.fillStyle = r[3]; c.beginPath(); c.moveTo(cx + 4, cy - 10); c.lineTo(x + w - 5, y + h - 6); c.lineTo(cx + 12, cy + 4); c.closePath(); c.fill();
  c.fillStyle = r[0]; c.beginPath(); c.moveTo(x + 4, y + h - 4); c.lineTo(cx - 10, cy + 2); c.lineTo(cx - 2, cy + 10); c.closePath(); c.fill();
  // (the creases, out from the crater to the corners)
  c.strokeStyle = INK; c.lineWidth = 1;
  c.beginPath();
  for (const [ex, ey] of [[x + 2, y + 2], [x + w - 2, y + 2], [x + w - 2, y + h - 2], [x + 2, y + h - 2], [x + w * 0.5, y + 2], [x + 2, y + h * 0.5]]) { c.moveTo(cx, cy); c.lineTo((cx + ex) / 2 + (hash(ex + seed) - 0.5) * 6, (cy + ey) / 2 + (hash(ey + seed) - 0.5) * 6); c.lineTo(ex, ey); }
  c.stroke();
  // (the crater: the fist's shape punched in, its guts black, the lit lip along its bottom)
  pixelBlob(c, cx, cy, 12, 10, INK);
  box(c, cx - 9, cy - 7, 18, 14, '#0B0B12');
  box(c, cx - 8, cy + 6, 16, 2, r[4]); box(c, cx + 8, cy - 5, 2, 10, r[3]);
  for (let k = 0; k < 4; k++) box(c, cx - 7 + k * 4, cy - 6, 2, 3, r[0]);
  // (a corner peeled up off it)
  c.fillStyle = INK; c.beginPath(); c.moveTo(x + w - 1, y + h * 0.18); c.lineTo(x + w + 9, y + h * 0.05); c.lineTo(x + w + 4, y + h * 0.36); c.closePath(); c.fill();
  c.fillStyle = r[4]; c.beginPath(); c.moveTo(x + w, y + h * 0.2); c.lineTo(x + w + 7, y + h * 0.1); c.lineTo(x + w + 3, y + h * 0.32); c.closePath(); c.fill();
  // (wires hanging out of it, swaying)
  const sway = Math.sin(f * 0.15) * 2;
  ['#EF4444', '#FDE047', '#3B82F6'].forEach((col, k) => {
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(cx - 5 + k * 5, cy + 2); c.quadraticCurveTo(cx - 8 + k * 6, cy + 14, cx - 10 + k * 8 + sway, cy + 22 + k * 3); c.stroke();
    c.strokeStyle = col; c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx - 5 + k * 5, cy + 2); c.quadraticCurveTo(cx - 8 + k * 6, cy + 14, cx - 10 + k * 8 + sway, cy + 22 + k * 3); c.stroke();
  });
  // (sparking: in bursts, off the bared wire ends; a wisp of smoke up off it)
  if ((f + seed) % 23 < 6) {
    const k = hash(f * 1.7 + seed);
    box(c, cx - 10 + k * 18 + sway, cy + 22 + k * 6, 4, 4, '#FDE047'); box(c, cx - 9 + k * 18 + sway, cy + 23 + k * 6, 2, 2, '#FFFFFF');
    box(c, cx - 3 + hash(f * 3.1) * 8, cy - 4, 3, 3, '#FFFFFF');
  }
  for (let k = 0; k < 3; k++) {
    const t = ((f + k * 30 + seed) % 90) / 90;
    c.globalAlpha = 0.35 * (1 - t); pixelBlob(c, cx + Math.sin(t * 6 + k) * 6, cy - 14 - t * 50, 5 + t * 6, 4 + t * 5, '#71717A'); c.globalAlpha = 1;
  }
};

/** The fist going in (index.ts: the frames since, counting down from 8): a white flash, a stepped starburst, rings. */
export const drawPunchFlash = (c: Ctx, x: number, y: number, t: number) => {
  const k = t / 8, r = 10 + (1 - k) * 26;
  c.save(); c.translate(Math.round(x), Math.round(y));
  c.globalAlpha = 0.35 * k; c.fillStyle = '#FEF9C3'; c.beginPath(); c.arc(0, 0, r * 1.5, 0, Math.PI * 2); c.fill();
  c.globalAlpha = Math.min(1, k * 1.4);
  for (const [rr, col] of [[r, INK], [r - 3, '#FDE047'], [r * 0.6, '#FFFFFF']] as const) {
    c.fillStyle = col; c.beginPath();
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2 + 0.2, d = i % 2 ? rr * 0.45 : rr; i ? c.lineTo(Math.cos(a) * d, Math.sin(a) * d) : c.moveTo(Math.cos(a) * d, Math.sin(a) * d); }
    c.closePath(); c.fill();
  }
  c.restore();
};
const EMPTY_SLED: SledLook = { body: '#CBD5E1', stripe: '#64748B', num: 0 };

// ---------------------------------------------------------------------------------------------------------------
// The backdrop (screen space)

/** The moonscape flats on the dome's floor (a tile, MOON_W wide, its foot at MOON_H): jagged rims in stepped indigo,
 *  craters with lit lips, the blacklight paint glowing along every edge; row 0 the far one, dimmer. */
const MOON_W = 960, MOON_H = 120;
const paintMoonscape = (g: Ctx, row: number) => {
  const far = row === 0, body = far ? ['#0B0820', '#120C2C', '#1A1238'] : ['#120C2A', '#1C1440', '#2A1F58'];
  const glowA = far ? '#3F7A3A' : '#86EFAC', glowB = far ? '#7A2A5A' : '#F0ABFC';
  const pts: [number, number][] = [[0, MOON_H]];
  for (let x = 0, k = 0; x <= MOON_W; x += 24, k++) pts.push([x, MOON_H - 30 - (far ? 26 : 10) - Math.round(Math.abs(Math.sin(x * 0.011 + row * 2)) * 34 + hash(k * 3.1 + row) * 16)]);
  pts.push([MOON_W, MOON_H]);
  g.fillStyle = body[1]; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
  // (stepped shade down it, dithered)
  g.save(); g.clip();
  box(g, 0, MOON_H - 34, MOON_W, 34, body[0]); checker(g, 0, MOON_H - 38, MOON_W, 4, body[0], 0, 2);
  // (craters: a dark bowl, a lit far lip, the glow paint round the near one)
  for (let k = 0; k < 7; k++) {
    const cx = 60 + k * 132 + hash(k * 5.7 + row) * 50, cyy = MOON_H - 26 + hash(k * 2.3 + row) * 10, r = 16 + hash(k + row * 9) * 18;
    g.fillStyle = body[0]; g.beginPath(); g.ellipse(cx, cyy, r, r * 0.3, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = body[2]; g.beginPath(); g.ellipse(cx, cyy - r * 0.12, r, r * 0.18, 0, Math.PI, 0); g.fill();
    for (let a = 0.2; a < Math.PI - 0.2; a += 0.22) box(g, cx + Math.cos(a) * r - 1, cyy + Math.sin(a) * r * 0.3, 2, 1, k % 2 ? glowA : glowB);
  }
  for (let i = 0; i < 160; i++) box(g, hash(i * 1.9 + row) * MOON_W, MOON_H - 60 + hash(i * 3.3 + row) * 60, 1, 1, i % 4 ? body[2] : body[0]);
  g.restore();
  // (the glow paint along the rim's edge: a bright line, a dimmer one under it)
  for (let i = 1; i < pts.length - 2; i++) { const [ax, ay] = pts[i], [, by] = pts[i + 1]; for (let s = 0; s < 24; s += 2) { const yy = Math.round(ay + ((by - ay) * s) / 24); box(g, ax + s, yy, 2, 1, i % 5 === 0 ? glowB : glowA); box(g, ax + s, yy + 2, 2, 1, body[2]); } }
  // (the flag, cardboard on a dowel, stuck in the far rim)
  if (!far) { const fx = 600, fy = pts[26][1]; box(g, fx, fy - 40, 2, 40, '#94A3B8'); box(g, fx + 2, fy - 40, 22, 14, '#1E3A8A'); for (let s = 0; s < 4; s++) box(g, fx + 2, fy - 38 + s * 3, 22, 1, s % 2 ? '#F8FAFC' : '#B91C1C'); box(g, fx + 2, fy - 40, 9, 7, '#1E3A8A'); }
};

export const drawRideBackdrop = (c: Ctx, state: GameState, look: RideLook) => {
  const W = CANVAS_WIDTH, H = CANVAS_HEIGHT, f = state.frame, cam = state.camera.x, cy = state.camera.y;
  const k = look.k;
  if (k < 1) {
    bandedGradient(c, 0, 0, W, H, ['#04030C', '#0A0620', '#120A2C', '#0C0722', '#04030C'], 18);
    // (the dome's painted nebulae, way back)
    for (let j = -1; j < 3; j++) {
      const base = Math.floor(cam * 0.05 / 800) + j, nx = base * 800 - cam * 0.05 + 200 + hash(base * 2.1) * 300, ny = 160 + hash(base * 4.3) * 220 - cy * 0.03;
      c.globalAlpha = 0.12; pixelBlob(c, nx, ny, 210, 80, ['#7E22CE', '#0E7490', '#BE185D'][((base % 3) + 3) % 3], 4);
      c.globalAlpha = 0.1; pixelBlob(c, nx + 60, ny - 14, 120, 44, ['#C026D3', '#06B6D4', '#F472B6'][((base % 3) + 3) % 3], 4);
      c.globalAlpha = 1;
    }
    // (the stars, in three depths)
    for (let i = 0; i < 190; i++) {
      const depth = i % 3, sp = [0.05, 0.1, 0.16][depth];
      const sx = ((i * 211.7 - cam * sp) % W + W) % W, sy = (((i * 97.3 - cy * sp) % H) + H) % H;
      if (depth === 0) box(c, sx, sy, 1, 1, '#475569');
      else if (depth === 1) box(c, sx, sy, 2, 2, i % 6 ? '#94A3B8' : '#C4B5FD');
      else {
        const tw = (f + i * 13) % 80 < 6;
        box(c, sx, sy, 2, 2, '#F8FAFC');
        if (tw || i % 13 === 0) { box(c, sx - 2, sy, 6, 2, tw ? '#E0E7FF' : '#475569'); box(c, sx, sy - 2, 2, 6, tw ? '#E0E7FF' : '#475569'); box(c, sx, sy, 2, 2, '#FFFFFF'); }
      }
    }
    // (the planets: blacklit, but held back (the track's what has to read))
    for (let j = -1; j < 3; j++) {
      const base = Math.floor(cam * 0.2 / 700) + j, px = base * 700 - cam * 0.2 + 200 + hash(base) * 250, py = 140 + hash(base * 3) * 180 - cy * 0.05;
      const col = ['#DB2777', '#2563EB', '#16A34A', '#F59E0B'][((base % 4) + 4) % 4], r = 36 + hash(base * 7) * 40;
      planet(c, px, py, r, mix(col, '#03020A', 0.45), hash(base * 5) > 0.4);
    }
    // (the dome's own structure, way back in the dark: its ribs, its rings, the black paint just not hiding them)
    const rk = 0.06, roff = -((cam * rk) % 240);
    for (let x = roff - 240; x < W + 240; x += 240) {
      for (let s = 0; s < 22; s++) { const yy = s * 18 - cy * 0.03, bow = Math.round(Math.sin(s / 22 * Math.PI) * 14); box(c, x + bow, yy, 2, 18, '#160E30'); }
    }
    for (const ry of [70, 190]) box(c, 0, Math.round(ry - cy * 0.03), W, 2, '#160E30');
    // (the props hung in the dome on their wires (up into the dark): a rocket, a comet, a flying saucer)
    const hk = 0.25, hoff = Math.floor(cam * hk / 1100);
    for (let j = -1; j < 2; j++) {
      const base = hoff + j, hx = base * 1100 - cam * hk + 300 + hash(base * 9.1) * 400, hy = 120 + hash(base * 1.3) * 90 - cy * 0.06, kind = ((base % 3) + 3) % 3;
      if (hx < -160 || hx > W + 160) continue;
      c.save(); c.globalAlpha = 0.75;
      cables(c, [hx - 20, hx + 20], 0, hy - 10, '#1E1B3A');
      if (kind === 0) {
        // (the rocket: a silver body, red fins, portholes, a cardboard flame)
        cyl(c, hx - 44, hy - 9, 80, 18, '#94A3B8');
        c.fillStyle = INK; c.beginPath(); c.moveTo(hx + 36, hy - 10); c.lineTo(hx + 58, hy); c.lineTo(hx + 36, hy + 10); c.closePath(); c.fill();
        c.fillStyle = '#DC2626'; c.beginPath(); c.moveTo(hx + 37, hy - 8); c.lineTo(hx + 54, hy); c.lineTo(hx + 37, hy + 8); c.closePath(); c.fill();
        for (const sd of [-1, 1]) { box(c, hx - 46, hy + sd * 9 - (sd < 0 ? 10 : 0), 16, 10, INK); box(c, hx - 45, hy + sd * 9 - (sd < 0 ? 9 : 0), 14, 8, '#B91C1C'); }
        for (let q = 0; q < 3; q++) lamp(c, hx - 18 + q * 16, hy - 1, 3, '#7DD3FC', false, 0);
        for (let q = 0; q < 3; q++) box(c, hx - 60 - q * 6, hy - 4 + q * 3, 14 - q * 3, 3, ['#FDE047', '#F97316', '#B91C1C'][q]);
      } else if (kind === 1) {
        // (the comet: a lump with a stepped tail of tinsel)
        for (let q = 0; q < 5; q++) box(c, hx + 10 + q * 18, hy - 6 + q, 20, 12 - q * 2, ['#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8', '#0369A1'][q]);
        sphere(c, hx, hy, 11, '#CBD5E1');
      } else {
        // (the saucer: its dome, its rim of lamps)
        c.fillStyle = INK; c.beginPath(); c.ellipse(hx, hy, 40, 11, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#64748B'; c.beginPath(); c.ellipse(hx, hy, 38, 9, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#94A3B8'; c.beginPath(); c.ellipse(hx, hy - 3, 34, 5, 0, 0, Math.PI * 2); c.fill();
        c.save(); c.beginPath(); c.rect(hx - 20, hy - 26, 40, 22); c.clip(); sphere(c, hx, hy - 6, 16, '#22D3EE'); c.restore();
        for (let q = 0; q < 6; q++) box(c, hx - 30 + q * 12, hy + 3, 3, 2, (q + (f >> 3)) % 3 === 0 ? '#FDE047' : '#475569');
      }
      c.restore();
    }
    // (another stretch of the ride's track, way off across the dome, on its own supports down into the dark: the other
    // sleds going round on it)
    const tk = 0.3, farY = (sx: number) => Math.round(330 + Math.sin((sx + cam * tk) * 0.004) * 36 - cy * 0.08);
    c.save(); c.globalAlpha = 0.4;
    for (let sx = -((cam * tk) % 120) - 120; sx < W + 120; sx += 120) { const yy = farY(sx); box(c, sx - 2, yy + 2, 4, H - yy, '#120C26'); }
    for (let sx = -4; sx < W + 4; sx += 4) { const yy = farY(sx); box(c, sx, yy - 2, 4, 4, '#2A2050'); box(c, sx, yy - 2, 4, 1, '#4C3F80'); }
    for (let j = 0; j < 2; j++) { const sx = ((f * 1.6 + j * 900 - cam * tk) % 1800 + 1800) % 1800 - 300; tinySled(c, sx, farY(sx) - 2, 4100 + j * 31, f, 0.4); }
    c.restore();
    // (down on the dome's floor, under the track: the moonscape flats, plywood cut to crater rims and painted in
    // blacklight paint (their edges glowing green and pink), in two rows (stamped), a cardboard flag stuck in one)
    const mk = 0.42, base = Math.round(GY - cy + 168);
    if (base - MOON_H < H && base > 0) for (const [row, kk, dy] of [[0, mk * 0.8, -26], [1, mk, 0]] as const) {
      for (let x = -(((cam * kk) % MOON_W) + MOON_W) % MOON_W; x < W; x += MOON_W) {
        c.save(); c.translate(Math.round(x), base + dy - MOON_H);
        stamp(c, `ride-moonscape-${row}`, 0, 0, MOON_W, MOON_H, g => paintMoonscape(g, row));
        c.restore();
      }
    }
  }
  if (k > 0) {
    c.save(); c.globalAlpha = Math.min(1, k);
    drawWarehouseBack(c, cam, cy);
    c.restore();
  }
  return true;
};

/** The warehouse's corrugated steel, as a fill (a ridge lit, its valley shaded). */
const corrugated = (c: Ctx) => tilePattern(c, 'ride-corrugated', 24, 8, g => {
  const cols = ['#C3C8CF', '#AEB4BC', '#9CA3AF', '#9CA3AF', '#8B929C', '#7B828C'];
  cols.forEach((col, i) => { g.fillStyle = col; g.fillRect(i * 4, 0, 4, 8); });
});
/** One stretch of the warehouse's racks (pallet racking, its boxes; the porta-potty; the sign), stamped, from 0 for 900. */
const racks = (g: Ctx) => {
  for (let r = 0; r < 3; r++) {
    const by = 380 + r * 70;
    for (let b = 0; b < 4; b++) {
      const bx = 30 + b * 72, h = 30 + ((b * 7 + r * 3) % 3) * 5, col = ['#B45309', '#A16207', '#92400E'][(b + r) % 3];
      slab(g, bx, by - h, 60, h, col);
      box(g, bx + 26, by - h, 8, h, mix(col, '#FEF3C7', 0.35));
      // (stenciled in the park's letters, two lines to fit the box)
      if ((b + r) % 2) { lettering(g, 'THIS END', bx + 30, by - h / 2 - 5, 'small', '#451A03', col, true); lettering(g, 'UP', bx + 30, by - h / 2 + 5, 'small', '#451A03', col, true); }
    }
    cyl(g, 20, by, 300, 7, '#EA580C');
  }
  for (const ux of [20, 314]) { box(g, ux - 1, 330, 8, 280, INK); box(g, ux, 330, 6, 280, '#1D4ED8'); box(g, ux, 330, 2, 280, '#60A5FA'); for (let y = 340; y < 600; y += 14) box(g, ux + 2, y, 2, 4, '#1E3A8A'); }
  // (the porta-potty: its roof, its vents, its door, JOHNNY)
  slab(g, 420, 400, 60, 120, '#2563EB');
  box(g, 416, 392, 68, 10, INK); box(g, 417, 393, 66, 8, '#93C5FD'); box(g, 417, 393, 66, 2, '#DBEAFE');
  for (let v = 0; v < 4; v++) box(g, 434 + v * 8, 410, 4, 10, '#1E3A8A');
  box(g, 428, 426, 44, 88, '#1D4ED8'); box(g, 428, 426, 2, 88, '#3B82F6');
  box(g, 464, 466, 4, 10, '#F8FAFC'); box(g, 444, 438, 14, 6, '#DC2626'); lettering(g, 'JOHNNY', 450, 454, 'small', '#F8FAFC', '#1D4ED8');
  // (screwed to the wall on its brackets)
  brackets(g, 540, 770, 300); brackets(g, 540, 770, 318);
  sign(g, 540, 298, 230, 26, '#F8FAFC', '', '#B91C1C');
  lettering(g, 'EMPLOYEES MUST WASH HANDS', 655, 311, 'enamel', '#B91C1C', '#F8FAFC');
  // (the time clock and its card rack, beside it; a fire extinguisher on its hook)
  slab(g, 790, 330, 34, 44, '#D6D3D1'); box(g, 798, 338, 18, 12, '#1C1917'); box(g, 800, 340, 6, 3, '#F87171');
  for (let r = 0; r < 4; r++) { box(g, 832, 326 + r * 12, 30, 10, INK); for (let q = 0; q < 4; q++) box(g, 834 + q * 7, 322 + r * 12, 4, 12, '#F5F5F4'); }
  box(g, 806, 420, 4, 6, '#3F3F46'); cyl(g, 800, 426, 16, 40, '#DC2626', 'y'); box(g, 803, 418, 10, 8, INK);
  // (a guy's lunch, on a crate: a cooler, a thermos, a sandwich)
  slab(g, 600, 470, 70, 50, '#A16207');
  slab(g, 606, 446, 34, 24, '#DC2626'); box(g, 606, 446, 34, 6, '#F8FAFC');
  cyl(g, 646, 440, 10, 30, '#16A34A', 'y');
  box(g, 616, 466, 22, 6, '#FDE68A'); box(g, 616, 468, 22, 2, '#84CC16');
};
/** One stretch of the tarp and its Christmas lights (the stars), a beach ball planet on its string, stamped, 0..700. */
const tarp = (g: Ctx) => {
  slab(g, 60, 130, 420, 220, '#111827');
  for (let s = 0; s < 6; s++) box(g, 80 + s * 70, 136, 2, 210, '#1F2937');
  for (let j = 0; j < 7; j++) { box(g, 64 + j * 68, 132, 4, 4, '#9CA3AF'); }
  for (let j = 0; j < 34; j++) { const x = 70 + hash(j * 1.7) * 400, y = 140 + hash(j * 3.3) * 200; box(g, x - 1, y - 1, 5, 5, INK); box(g, x, y, 3, 3, ['#FDE047', '#F87171', '#4ADE80', '#60A5FA'][j % 4]); }
  // (the beach ball, on its string, with a hula hoop for a ring)
  box(g, 560, 40, 1, 144, '#E5E7EB');
  g.lineWidth = 4; g.strokeStyle = INK; g.beginPath(); g.ellipse(560, 210, 44, 9, -0.15, Math.PI, Math.PI * 2); g.stroke();
  g.lineWidth = 2; g.strokeStyle = '#A3E635'; g.stroke();
  sphere(g, 560, 210, 26, '#F472B6');
  g.save(); g.beginPath(); g.arc(560, 210, 26, 0, Math.PI * 2); g.clip();
  box(g, 534, 204, 52, 8, '#FDE047'); box(g, 552, 184, 8, 52, '#60A5FA'); box(g, 534, 204, 52, 2, '#FEF9C3');
  g.restore();
  g.lineWidth = 4; g.strokeStyle = INK; g.beginPath(); g.ellipse(560, 210, 44, 9, -0.15, 0, Math.PI); g.stroke();
  g.lineWidth = 2; g.strokeStyle = '#A3E635'; g.stroke();
};
/** The warehouse, seen with the lights on (screen space: its far wall, slow). */
const drawWarehouseBack = (c: Ctx, cam: number, cy: number) => {
  const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
  const off = -((cam * 0.3) % 24);
  c.save(); c.translate(Math.round(off), 0); c.fillStyle = corrugated(c); c.fillRect(-24, 0, W + 48, H); c.restore();
  hazeBands(c, 0, 0, W, 150, '#374151', 0.55, 0, 5);
  // (the tarp's hung on the wall: it goes with the wall, behind the trusses)
  const poff = -((cam * 0.3) % 700);
  for (let x = poff - 700; x < W + 700; x += 700) { c.save(); c.translate(Math.round(x), 0); stamp(c, 'ride-tarp', 50, 30, 560, 330, tarp); c.restore(); }
  const roff = -((cam * 0.3) % 900);
  for (let x = roff - 900; x < W + 900; x += 900) { c.save(); c.translate(Math.round(x), 0); stamp(c, 'ride-racks2', 10, 290, 870, 320, racks); c.restore(); }
  // (the roof trusses, nearer: the fluorescent fixtures under them on their chains, the duct run hung under them on
  // straps)
  const toff = -((cam * 0.35) % 260);
  const y = Math.round(36 - cy * 0.03);
  for (let x = toff - 260; x < W + 260; x += 260) {
    truss(c, x, y, 260, 22, '#52525B');
    box(c, x + 70, y + 54, 120, 8, INK); box(c, x + 71, y + 55, 118, 6, '#D4D4D8');
    neonBar(c, x + 74, y + 62, 112, 3, '#F8FAFC', true);
    box(c, x + 78, y + 22, 1, 32, '#3F3F46'); box(c, x + 182, y + 22, 1, 32, '#3F3F46');
    for (const sx of [x + 30, x + 226]) { box(c, sx - 1, y + 22, 4, 62, INK); box(c, sx, y + 22, 2, 62, '#71717A'); }
  }
  // (the duct: galvanized, its seams, banded down its round)
  cyl(c, -10, y + 82, W + 20, 20, '#A1A1AA');
  for (let x = toff - 260; x < W + 130; x += 130) { box(c, x, y + 82, 3, 20, '#71717A'); box(c, x + 3, y + 82, 1, 20, '#E4E4E7'); }
  box(c, 0, H - 20, W, 20, '#57534E'); box(c, 0, H - 20, W, 2, '#78716C');
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
  // the post, down to the rail (a steel tube, its foot plate)
  cyl(c, x - 4, cy + S, 8, rail - cy - S, '#52525B', 'y');
  box(c, x - 9, rail - 4, 18, 4, INK); box(c, x - 8, rail - 3, 16, 2, '#71717A');
  // the glow (stepped bands, pulsing in four steps while it's live)
  const pulse = live ? [0.5, 0.75, 1, 0.75][(f >> 3) % 4] : 0;
  if (live) for (let b = 3; b >= 1; b--) { c.globalAlpha = (0.16 + 0.1 * (3 - b)) * pulse; box(c, x - S - b * 9, cy - S - b * 9, (S + b * 9) * 2, (S + b * 9) * 2, col); }
  c.globalAlpha = 1;
  // the housing: an inked steel frame, beveled, the face dark glass
  const fr = rampOf('#52525B');
  box(c, x - S - 5, cy - S - 5, S * 2 + 10, S * 2 + 10, INK);
  box(c, x - S - 4, cy - S - 4, S * 2 + 8, S * 2 + 8, fr[2]); box(c, x - S - 4, cy - S - 4, S * 2 + 8, 1, fr[4]); box(c, x - S - 4, cy - S - 4, 1, S * 2 + 8, fr[3]);
  box(c, x - S - 4, cy + S + 3, S * 2 + 8, 1, fr[0]); box(c, x + S + 3, cy - S - 4, 1, S * 2 + 8, fr[1]);
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
    if (live) { c.fillStyle = mix(fg, '#FFFFFF', 0.5); c.fillRect(x - 3, cy - d * (S - 7), 6, 4); }
  }
  // (the glass's glint)
  box(c, x - S + 3, cy - S + 5, 6, 2, live ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.12)');
};
/** The lane lit on the rail from x0 to x1 (chevrons along its top: where it'll get you). */
const laneMark = (c: Ctx, x0: number, x1: number, col: string, on: boolean) => {
  for (let x = x0; x < x1; x += 12) {
    const y = trackY(x);
    if (y === null) continue;
    box(c, x, y - 4, 8, 5, INK); box(c, x + 1, y - 3, 6, 3, on ? col : mix(col, '#1C1917', 0.55));
    if (on) box(c, x + 1, y - 3, 6, 1, lite(col, 0.5));
  }
};
/** A wall to duck under: from y down to its bottom edge (y + h), hazard-striped between its steel edges, inked, the
 *  bottom edge bright. */
const hazardWall = (c: Ctx, x: number, y: number, w: number, h: number, dk = '#1C1917', bright = '#FACC15') => {
  box(c, x - 3, y, w + 6, h + 3, INK);
  hazard(c, x, y, w, h, bright, dk, 14);
  // (its edges: steel channel, lit on the left)
  box(c, x, y, 3, h, lite(bright, 0.4)); box(c, x + w - 3, y, 3, h, dark(dk, 0.2));
  box(c, x, y + h - 6, w, 6, '#FFFFFF'); box(c, x, y + h - 2, w, 2, '#E5E7EB');
};

/** The rail, from its run's ends; its supports down out of sight; its ties; at a gap, a buffer on each end, lit. */
const drawTrack = (c: Ctx, k: number, cam: number, f: number) => {
  const lit = k > 0.5;
  const x0v = cam - 100, x1v = cam + CANVAS_WIDTH + 100;
  // (at a gap in act 1: FUTURE: TBD, on legs stood on the girder (behind the rail: its feet under it, the lane lit over them))
  for (const [a] of GAPS) if (a < R + 6000 && a > x0v - 100 && a < x1v + 100) { const ya = trackY(a) ?? GY; postedPlate(c, 'tbd', a - 96, ya - 58, ya + 12, 'FUTURE: TBD', 'stencil', '#FDE047', '#1C1917', 5); }
  for (let i = 0; i < RUNS.length; i++) {
    const [a, b, ya, yb] = RUNS[i];
    if (b < x0v || a > x1v) continue;
    const yAt = (x: number) => ya + ((x - a) / (b - a)) * (yb - ya);
    // (its columns, down to their footings on the floor, one at each end of the run (a gap's rail ends sit on one) and
    // every 140 between; braced across in pairs)
    const cols = [a + 18, b - 18];
    for (let x = Math.ceil((a + 60) / 140) * 140; x < b - 60; x += 140) cols.push(x);
    // (not in the stations: the rail's on their floor there)
    const inStation = (x: number) => x < R + 60 || x > STATION_X0 - 60 || (x > SPUR_X0 + 10 && x < SPUR_X1);
    for (const x of cols) if (x > x0v && x < x1v && !inStation(x)) column(c, x, yAt(x) + 22, 8, lit ? '#6B7280' : '#1E293B', lit);
    for (const x of cols) if (x % 140 === 0 && x > x0v && x < x1v && x + 140 < b - 60 && !inStation(x) && !inStation(x + 140)) {
      // (an X brace to the next column, a little way under the girder)
      const t0 = yAt(x) + 60, t1 = yAt(x + 140) + 60;
      c.strokeStyle = lit ? '#52525B' : '#141B2E'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(x, t0); c.lineTo(x + 140, t1 + 70); c.moveTo(x, t0 + 70); c.lineTo(x + 140, t1); c.stroke();
    }
    // (the girder under the rail: two chords and the web between, square to it (the old spur has none: it's shored))
    for (const [g0, g1] of [[Math.max(a, x0v, R + 40), Math.min(b, x1v, SPUR_X0)], [Math.max(a, x0v, SPUR_X1), Math.min(b, x1v)]]) if (g1 > g0 + 12) {
    c.strokeStyle = INK; c.lineWidth = 4;
    c.beginPath(); c.moveTo(g0, yAt(g0) + 10); c.lineTo(g1, yAt(g1) + 10); c.moveTo(g0, yAt(g0) + 22); c.lineTo(g1, yAt(g1) + 22); c.stroke();
    c.strokeStyle = lit ? '#71717A' : '#1E293B'; c.lineWidth = 2; c.stroke();
    c.strokeStyle = lit ? '#52525B' : '#172033'; c.lineWidth = 2; c.beginPath();
    for (let x = Math.ceil(g0 / 24) * 24; x + 12 <= g1; x += 24) { c.moveTo(x, yAt(x) + 11); c.lineTo(x + 12, yAt(x + 12) + 21); c.lineTo(x + 24 > g1 ? x + 12 : x + 24, yAt(Math.min(g1, x + 24)) + 11); }
    c.stroke();
    }
    // (the ties under the rail)
    for (let x = Math.ceil(Math.max(a, cam - 100) / 20) * 20; x < Math.min(b, cam + CANVAS_WIDTH + 100); x += 20) { if (x > SPUR_X0 && x < SPUR_X1) continue; const y = ya + ((x - a) / (b - a)) * (yb - ya); box(c, x - 2, y + 4, 5, 6, lit ? '#52525B' : '#111827'); }
    c.strokeStyle = INK; c.lineWidth = 10; c.beginPath(); c.moveTo(a, ya + 3); c.lineTo(b, yb + 3); c.stroke();
    c.strokeStyle = lit ? '#71717A' : '#334155'; c.lineWidth = 6; c.beginPath(); c.moveTo(a, ya + 3); c.lineTo(b, yb + 3); c.stroke();
    c.strokeStyle = lit ? '#A1A1AA' : '#475569'; c.lineWidth = 3; c.beginPath(); c.moveTo(a, ya + 1); c.lineTo(b, yb + 1); c.stroke();
    c.strokeStyle = lit ? '#F4F4F5' : '#A5B4FC'; c.lineWidth = 1; c.beginPath(); c.moveTo(a, ya - 0.5); c.lineTo(b, yb - 0.5); c.stroke();
  }
  drawSpurRail(c, cam, lit);
  // (the lift's chain, crawling up the middle of it)
  if (LIFT_X1 > cam - 100 && LIFT_X0 < cam + CANVAS_WIDTH + 100) {
    const ya = trackY(LIFT_X0) ?? GY, yb = trackY(LIFT_X1 - 1) ?? GY;
    c.lineWidth = 3; c.strokeStyle = INK; c.beginPath(); c.moveTo(LIFT_X0, ya + 5); c.lineTo(LIFT_X1, yb + 5); c.stroke();
    c.setLineDash([4, 3]); c.lineDashOffset = -f * 1.3; c.lineWidth = 2; c.strokeStyle = lit ? '#A1A1AA' : '#64748B'; c.stroke();
    c.setLineDash([]); c.lineDashOffset = 0;
  }
  for (const [a, b] of GAPS) {
    if (b < cam - 200 || a > cam + CANVAS_WIDTH + 200) continue;
    const ya = trackY(a) ?? GY, yb = trackY(b) ?? GY, flash = (f >> 3) % 2 === 0;
    laneMark(c, a - 200, a - 4, '#22D3EE', flash);
    for (const [x, y, on] of [[a - 7, ya, flash], [b + 7, yb, !flash]] as const) {
      // (a striped buffer on the rail's end, its red lamp)
      box(c, x - 7, y - 16, 14, 16, INK);
      for (let j = 0; j < 2; j++) { box(c, x - 5, y - 14 + j * 7, 10, 6, j % 2 ? '#F8FAFC' : '#DC2626'); box(c, x - 5, y - 14 + j * 7, 10, 1, j % 2 ? '#FFFFFF' : '#F87171'); }
      lamp(c, x, y - 21, 4, '#EF4444', on, 3);
    }
    // (the hole itself: the rail's ends hanging off their last supports, a drop to nothing)

  }
};

// ---------------------------------------------------------------------------------------------------------------
// The obstacles

/** A satellite: a gold-foil body, two solar wings (their cells, a glint), a dish on top. Bottom edge at `bot`. */
const satellite = (c: Ctx, x: number, bot: number, lit: boolean) => {
  // (the wings)
  for (const sd of [-1, 1]) {
    const px = sd < 0 ? x - 78 : x + 24;
    box(c, px, bot - 38, 54, 30, INK);
    box(c, px + 2, bot - 36, 50, 26, '#1E3A8A');
    for (let q = 0; q < 4; q++) for (let r = 0; r < 2; r++) { box(c, px + 3 + q * 12, bot - 35 + r * 13, 11, 12, r ? '#1D4ED8' : '#2563EB'); box(c, px + 3 + q * 12, bot - 35 + r * 13, 11, 1, '#60A5FA'); }
    box(c, px + 4, bot - 34, 14, 2, '#DBEAFE');
    box(c, sd < 0 ? x - 24 : x + 18, bot - 26, 6, 4, '#A1A1AA');
  }
  // (the body: crinkled gold foil)
  slab(c, x - 22, bot - 48, 44, 48, '#CA8A04');
  checker(c, x - 18, bot - 44, 36, 40, '#FDE047');
  box(c, x - 18, bot - 26, 36, 2, '#A16207'); box(c, x - 4, bot - 44, 2, 40, '#A16207');
  // (the dish on top)
  box(c, x - 2, bot - 58, 4, 10, '#A1A1AA');
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, bot - 60, 16, 6, 0, Math.PI, 0); c.fill();
  c.fillStyle = '#F1F5F9'; c.beginPath(); c.ellipse(x, bot - 60, 14, 4.5, 0, Math.PI, 0); c.fill();
  box(c, x - 1, bot - 70, 2, 8, '#E2E8F0');
  // (lit: a shipping tag taped to the rig behind it, the joke on it)
  if (lit) { box(c, x - 1, bot - 96, 2, 12, '#E5E7EB'); plate(c, 'foam', x, bot - 78, 'FOAM? NO', 'small', '#F5F5F4', '#1C1917', 3, true, '#A8A29E'); }
};
/** Robo-Butler: a can on a post, its head, its eyes (flashing: the tell), a beacon. */
const robot = (c: Ctx, bx: number, rail: number, tell: boolean, f: number, lit: boolean) => {
  const flash = (f >> 3) % 2 === 0;
  cyl(c, bx - 18, rail - 110, 36, 110, '#CBD5E1', 'y');
  for (let y = rail - 96; y < rail - 10; y += 28) { box(c, bx - 18, y, 36, 2, '#64748B'); box(c, bx - 18, y + 2, 36, 1, '#F1F5F9'); }
  box(c, bx - 10, rail - 70, 20, 14, INK); box(c, bx - 9, rail - 69, 18, 12, '#334155');
  for (let k = 0; k < 3; k++) box(c, bx - 7 + k * 6, rail - 66, 3, 6, ((f >> 4) + k) % 3 === 0 ? '#4ADE80' : '#14532D');
  slab(c, bx - 16, rail - 142, 32, 32, '#E2E8F0');
  box(c, bx - 12, rail - 134, 24, 10, INK);
  const eye = tell ? (flash ? '#EF4444' : '#FCA5A5') : '#475569';
  lamp(c, bx - 6, rail - 129, 3, eye, tell, tell ? 2 : 0); lamp(c, bx + 6, rail - 129, 3, eye, tell, tell ? 2 : 0);
  box(c, bx - 6, rail - 117, 12, 2, '#64748B');
  box(c, bx - 2, rail - 150, 4, 8, INK);
  lamp(c, bx, rail - 154, 5, tell && flash ? '#FDE047' : '#B45309', tell && flash, 3);
  // (its name on a little board stood up on its head on two rods, off to the side (clear of what it swings out))
  legs(c, [bx - 14, bx - 6], rail - 168, rail - 142, '#94A3B8', 3);
  plate(c, `robo-${lit ? 1 : 0}`, bx - 22, rail - 176, 'ROBO-BUTLER', 'small', lit ? '#E2E8F0' : '#334155', lit ? '#1C1917' : '#CBD5E1', 3);
};

/** One obstacle, in the back layer (its beams and its bands go in front: drawObFront). */
const drawOb = (c: Ctx, o: Ob, i: number, look: RideLook, f: number) => {
  const rail = trackY(o.x) ?? railLine(o.x), lit = look.k > 0.5, hw = halfW(o), d = o.x - look.sledX, x = o.x;
  const hurt = look.tricks.hurtT[i] > 0 && (f >> 1) % 2 === 0;
  const bot = rail - CLEAR;
  switch (o.kind) {
    case 'sat': {
      // hung off a striped rig: a wall from the ceiling down to its bottom edge
      hazardWall(c, x - hw, bot - 900, hw * 2, 900);
      if (i === 9) {
        // (a space station's module: a big drum, portholes, its name)
        cyl(c, x - 60, bot - 54, 120, 54, '#CBD5E1');
        for (let p = -50; p < 60; p += 30) { box(c, x + p, bot - 54, 1, 54, '#94A3B8'); box(c, x + p + 1, bot - 54, 1, 54, '#F8FAFC'); }
        for (let q = 0; q < 4; q++) lamp(c, x - 39 + q * 28, bot - 31, 5, (f >> 4) % 4 === q ? '#FDE047' : '#3B82F6', (f >> 4) % 4 === q, 2);
        rivets(c, x - 56, x + 56, bot - 50, '#CBD5E1', 8); rivets(c, x - 56, x + 56, bot - 8, '#CBD5E1', 8);
        label(c, `liberty-${lit ? 1 : 0}`, x, bot - 45, 'LIBERTY', 'enamel', lit ? '#1E3A8A' : '#334155', '#CBD5E1', 90, 22);
      } else satellite(c, x, bot, lit);
      box(c, x - hw, bot - 3, hw * 2, 3, '#FDE047');
      break;
    }
    case 'beam': {
      // the emitter housing, a slab over the band, square to the track (slanted with it, up the hill): the band's in
      // front
      c.save(); c.translate(x, rail); c.rotate(slopeAt(x) ?? 0);
      hazardWall(c, -hw, -BEAM_CLEAR - 54 - 860, hw * 2, 860, '#14532D', '#86EFAC');
      c.restore();
      break;
    }
    case 'tray': {
      // Robo-Butler, beside the track (before it): its menu board swung out across the track on its arm, a wall up to
      // the ceiling, the tray at its bottom edge
      const rk = trayReach(d), bx = x - 130, tell = d < 900;
      robot(c, bx, rail, tell, f, lit);
      const cx = bx + 60 + rk * (x - bx - 60);
      for (const [lw, cl] of [[9, INK], [5, '#94A3B8'], [1, '#E2E8F0']] as const) { c.strokeStyle = cl; c.lineWidth = lw; c.beginPath(); c.moveTo(bx + 14, rail - 90 - (lw === 1 ? 2 : 0)); c.lineTo(cx, rail - 140 - (lw === 1 ? 2 : 0)); c.stroke(); }
      hazardWall(c, cx - hw, bot - 900, hw * 2, 900 - 54, '#7F1D1D', '#FCA5A5');
      slab(c, cx - 34, bot - 130, 68, 62, '#FEF3C7');
      box(c, cx - 30, bot - 126, 60, 10, '#7F1D1D');
      label(c, 'menu', cx, bot - 121, 'MENU', 'small', '#FEF3C7', '#7F1D1D', 40, 12);
      for (let q = 0; q < 3; q++) { label(c, 'pill', cx - 8, bot - 104 + q * 10, 'PILL', 'small', '#1C1917', '#FEF3C7', 30, 12); label(c, 'nine', cx + 19, bot - 104 + q * 10, '$9', 'small', '#7F1D1D', '#FEF3C7', 20, 12); }
      slab(c, cx - hw - 4, bot - 58, hw * 2 + 8, 58, '#E5E7EB');
      for (let j = 0; j < 4; j++) { box(c, cx - 31 + j * 16, bot - 41, 12, 12, INK); box(c, cx - 30 + j * 16, bot - 40, 10, 10, ['#F472B6', '#FDE047', '#4ADE80', '#60A5FA'][j]); box(c, cx - 30 + j * 16, bot - 40, 4, 3, '#FFFFFF'); }
      box(c, cx - hw - 1, bot - 3, hw * 2 + 2, 3, '#FDE047');
      break;
    }
    case 'trolley': {
      // Robo-Butler's meal trolley, shoved out onto the rail: a low hurdle sat on it
      robot(c, x - 130, rail, d < 900, f, lit);
      for (const [lw, cl] of [[7, INK], [3, '#94A3B8']] as const) { c.strokeStyle = cl; c.lineWidth = lw; c.beginPath(); c.moveTo(x - 116, rail - 80); c.lineTo(x - hw, rail - HURDLE + 4); c.stroke(); }
      box(c, x - hw - 3, rail - HURDLE - 3, hw * 2 + 6, HURDLE + 3, INK);
      box(c, x - hw, rail - HURDLE, hw * 2, 8, '#F8FAFC'); box(c, x - hw, rail - HURDLE, hw * 2, 2, '#FFFFFF'); box(c, x - hw, rail - HURDLE + 6, hw * 2, 2, '#CBD5E1');
      box(c, x - hw, rail - HURDLE + 8, hw * 2, HURDLE - 14, '#475569'); box(c, x - hw, rail - HURDLE + 8, 2, HURDLE - 14, '#64748B');
      for (let j = 0; j < 6; j++) box(c, x - hw + 2 + j * 7, rail - HURDLE + 9, 4, 4, j % 2 ? INK : '#FACC15');
      for (const wx of [x - hw + 6, x + hw - 6]) { c.fillStyle = INK; c.beginPath(); c.arc(wx, rail - 4, 5, 0, Math.PI * 2); c.fill(); box(c, wx - 1, rail - 6, 2, 2, '#A1A1AA'); }
      for (let j = 0; j < 3; j++) sphere(c, x - 12 + j * 12, rail - HURDLE - 5, 4, ['#F472B6', '#FDE047', '#4ADE80'][j]);
      break;
    }
    case 'wire': {
      // a laser tripwire's emitter, bolted across the rail (its beam's in front)
      slab(c, x - hw - 3, rail - 12, hw * 2 + 6, 12, lit ? '#71717A' : '#166534');
      cyl(c, x - hw - 3, rail - HURDLE - 6, 8, HURDLE + 6, '#3F3F46', 'y'); cyl(c, x + hw - 5, rail - HURDLE - 6, 8, HURDLE + 6, '#3F3F46', 'y');
      lamp(c, x - hw + 1, rail - HURDLE - 2, 2.5, '#4ADE80', !lit, 0); lamp(c, x + hw - 1, rail - HURDLE - 2, 2.5, '#4ADE80', !lit, 0);
      break;
    }
    case 'pallet': {
      // the forklift, beside the track before it, its forks out across the rail with the pallet on them
      const fx = x - 170;
      cyl(c, fx + 14, rail - 172, 6, 74, '#3F3F46', 'y'); cyl(c, fx + 90, rail - 172, 6, 74, '#3F3F46', 'y'); box(c, fx + 14, rail - 174, 82, 6, INK); box(c, fx + 15, rail - 173, 80, 4, '#52525B');
      slab(c, fx, rail - 110, 100, 90, '#F59E0B');
      box(c, fx + 10, rail - 100, 40, 40, INK); box(c, fx + 12, rail - 98, 36, 36, '#78350F');
      label(c, 'noriders', fx + 70, rail - 42, 'NO RIDERS', 'small', '#451A03', '#F59E0B', 60, 12);
      lamp(c, fx + 55, rail - 180, 6, (f >> 3) % 2 ? '#FDE047' : '#F97316', true, 2);
      cyl(c, fx + 98, rail - 160, 8, 150, '#27272A', 'y');
      for (const wx of [fx + 20, fx + 76]) { c.fillStyle = INK; c.beginPath(); c.arc(wx, rail - 14, 14, 0, Math.PI * 2); c.fill(); c.fillStyle = '#3F3F46'; c.beginPath(); c.arc(wx, rail - 14, 10, 0, Math.PI * 2); c.fill(); c.fillStyle = '#A1A1AA'; c.beginPath(); c.arc(wx - 1, rail - 15, 5, 0, Math.PI * 2); c.fill(); }
      c.save(); c.translate(fx + 52, rail - 22); drawAtomPerson(c, 'worker', { seed: 2207, f, pose: 'stand', md: 'ok' }); c.restore();
      // (it's off the track, behind: knocked back; only its forks come out onto the rail)
      c.fillStyle = 'rgba(30, 32, 40, 0.38)'; c.fillRect(fx - 4, rail - 190, 114, 190);
      box(c, fx + 104, rail - 7, x + hw - fx - 104, 5, INK); box(c, fx + 104, rail - 6, x + hw - fx - 104, 2, '#71717A');
      box(c, x - hw, rail - HURDLE, hw * 2, HURDLE - 6, INK);
      for (let j = 0; j < 2; j++) { slab(c, x - hw + 2 + j * 22, rail - HURDLE + 2, 20, HURDLE - 10, '#A16207', { ink: false }); box(c, x - hw + 2 + j * 22, rail - HURDLE + 2, 20, 3, '#FBBF24'); }
      break;
    }
    case 'martian': {
      // a cardboard Martian, life size and then some, on a plywood stand on the rail (printed shading: it's a photo)
      const sh = hurt ? '#FFFFFF' : null, g = rampOf('#22C55E');
      box(c, x - 26, rail - 14, 52, 14, INK); box(c, x - 24, rail - 12, 48, 10, '#A16207'); box(c, x - 24, rail - 12, 48, 2, '#CA8A04');
      box(c, x + 14, rail - 120, 6, 108, '#78350F'); box(c, x + 14, rail - 120, 2, 108, '#A16207');
      c.fillStyle = INK; c.beginPath(); c.ellipse(x, rail - 150, 34, 50, 0, 0, Math.PI * 2); c.fill();
      box(c, x - 24, rail - 112, 48, 100, INK);
      if (sh) { c.fillStyle = sh; c.beginPath(); c.ellipse(x, rail - 150, 31, 47, 0, 0, Math.PI * 2); c.fill(); box(c, x - 21, rail - 110, 42, 96, sh); }
      else {
        c.save(); c.beginPath(); c.ellipse(x, rail - 150, 31, 47, 0, 0, Math.PI * 2); c.clip();
        box(c, x - 32, rail - 198, 64, 96, g[1]); box(c, x - 28, rail - 196, 50, 90, g[2]); box(c, x - 24, rail - 192, 30, 40, g[3]); checker(c, x + 22, rail - 196, 4, 90, g[1]);
        box(c, x - 20, rail - 186, 10, 10, g[4]);
        c.restore();
        box(c, x - 21, rail - 110, 42, 96, g[1]); box(c, x - 21, rail - 110, 30, 96, g[2]); box(c, x - 21, rail - 110, 8, 96, g[3]); checker(c, x + 9, rail - 110, 2, 96, g[2]);
      }
      for (const sd of [-1, 1]) { box(c, x + sd * 12 - 7, rail - 162, 14, 18, INK); box(c, x + sd * 12 - 5, rail - 160, 10, 14, '#F8FAFC'); box(c, x + sd * 12 - 2, rail - 156, 5, 7, INK); box(c, x + sd * 12 - 4, rail - 159, 2, 2, '#FFFFFF'); }
      box(c, x - 10, rail - 128, 20, 5, INK); box(c, x - 8, rail - 127, 4, 3, '#F8FAFC'); box(c, x + 4, rail - 127, 4, 3, '#F8FAFC');
      for (const sd of [-1, 1]) { box(c, x + sd * 14 - 2, rail - 216, 4, 22, INK); sphere(c, x + sd * 14, rail - 218, 5, '#F43F5E'); }
      box(c, x - 41, rail - 105, 20, 10, INK); box(c, x - 40, rail - 104, 18, 8, g[2]); box(c, x + 21, rail - 105, 20, 10, INK); box(c, x + 22, rail - 104, 18, 8, g[2]);
      label(c, 'zorg', x, rail - 72, 'ZORG', 'enamel', '#F8FAFC', '#15803D', 50, 22);
      // (the corner of the cardboard: it's flat; its raw edge)
      box(c, x + 20, rail - 30, 4, 18, '#D6D3D1'); box(c, x + 22, rail - 112, 2, 100, '#A8A29E');
      break;
    }
    case 'rock': {
      // the asteroid prop, on its cable from the ceiling: lowered onto the track as he comes
      const h = rockHeight(d), cy = rail - h - ROCK_R;
      box(c, x - 2, rail - 900, 4, 900 - h - ROCK_R * 2 + 4, INK); box(c, x - 1, rail - 900, 2, 900 - h - ROCK_R * 2 + 4, '#CBD5E1');
      box(c, x - 6, cy - ROCK_R - 6, 12, 8, INK); box(c, x - 5, cy - ROCK_R - 5, 10, 6, '#71717A');
      if (hurt) { c.fillStyle = INK; c.beginPath(); c.arc(x, cy, ROCK_R + 4, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x, cy, ROCK_R + 2, 0, Math.PI * 2); c.fill(); }
      else meteor(c, x, cy, ROCK_R + 2, 3, lit);
      if (look.tricks.hp[i] < o.hp) { c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 30, cy - 10); c.lineTo(x - 6, cy + 4); c.lineTo(x + 4, cy - 18); c.lineTo(x + 28, cy + 10); c.stroke(); }
      if (h === 0) { box(c, x - ROCK_R, rail - 4, ROCK_R * 2, 4, '#7C2D12'); }
      break;
    }
    case 'crates': {
      // snack cases stacked on a pallet on the rail, up past where any jump gets him
      box(c, x - hw - 4, rail - 10, hw * 2 + 8, 10, INK); box(c, x - hw - 2, rail - 8, hw * 2 + 4, 6, '#A16207'); box(c, x - hw - 2, rail - 8, hw * 2 + 4, 1, '#CA8A04');
      for (let r = 0; r < 4; r++) for (let q = 0; q < 2; q++) {
        const bx = x - hw + q * hw, by = rail - 10 - (r + 1) * 50, col = r % 2 === q ? '#B45309' : '#A16207';
        if (hurt) { box(c, bx, by, hw, 50, INK); box(c, bx + 2, by + 2, hw - 4, 46, '#FFFFFF'); continue; }
        slab(c, bx, by, hw, 50, col);
        box(c, bx + hw / 2 - 3, by + 2, 6, 46, mix(col, '#FEF3C7', 0.3));
        label(c, `snacks-${col}`, bx + hw / 2, by + 24, 'SPACE\nSNACKS', 'small', '#FDE047', col, 44, 24);
      }
      if (look.tricks.hp[i] < o.hp) { c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 20, rail - 200); c.lineTo(x, rail - 150); c.lineTo(x - 10, rail - 90); c.stroke(); }
      break;
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The circuit: the load station (both ends), the track's last leg coming down into it

/** The load station, from x0 to x1 (the same at both ends): its wall (navy in bands, chrome fins, the cove neon), the
 *  sponsor's TVs, its carpet. The end's adds the line and the operator (drawStation). */
const stationShell = (c: Ctx, sx0: number, sx1: number, f: number, roofGone: boolean, avoid: [number, number] = [0, 0]) => {
  const y = GY, w = sx1 - sx0;
  stamp(c, `ride-station-${sx0}-${roofGone ? 1 : 0}`, sx0 - 2, STATION_ROOF - 302, w + 4, y - STATION_ROOF + 304, g => {
    if (roofGone) box(g, sx0, STATION_ROOF - 300, w, 300, '#020617');
    else { bandedGradient(g, sx0, STATION_ROOF - 300, w, 300, ['#0B1236', '#111A45', '#0B1236'], 5); for (let x = sx0 + 30; x < sx1; x += 120) truss(g, x, STATION_ROOF - 300, 18, 300, '#1E293B', true); }
    bandedGradient(g, sx0, STATION_ROOF, w, y - STATION_ROOF, ['#172554', '#1E3A8A', '#1E40AF', '#1E3A8A'], 8);
    for (let x = sx0 + 40; x < sx1; x += 150) { box(g, x - 1, STATION_ROOF + 20, 10, y - STATION_ROOF - 80, INK); box(g, x, STATION_ROOF + 20, 8, y - STATION_ROOF - 80, '#94A3B8'); box(g, x, STATION_ROOF + 20, 2, y - STATION_ROOF - 80, '#E2E8F0'); box(g, x + 6, STATION_ROOF + 20, 2, y - STATION_ROOF - 80, '#475569'); }
    for (let i = 0; i < w / 90; i++) star(g, sx0 + 50 + i * 90 + hash(i + sx0) * 30, STATION_ROOF + 60 + hash(i * 3.7 + sx0) * 120, 5, '#3B82F6');
    box(g, sx0, y - 60, w, 60, '#172554'); box(g, sx0, y - 60, w, 3, '#60A5FA');
    box(g, sx0, STATION_ROOF, w, 6, '#93C5FD'); box(g, sx0, STATION_ROOF + 6, w, 2, '#1E3A8A');
  });
  neonBar(c, sx0, STATION_ROOF + 10, w, 3, '#67E8F9', true);
  c.fillStyle = CARPET(c); c.fillRect(sx0, y, w, 600);
  hazeBands(c, sx0, y, w, 40, '#0B0820', 0.5, 0, 4);
  box(c, sx0, y, w, 2, '#7A7A88');
  for (let j = 0; j * 200 + 60 < w - 100; j++) {
    const tx = sx0 + 60 + j * 200, ad = (f + j * 40) % 240 < 120;
    // (none behind the SPARES sign: it's read)
    if (tx + 106 > avoid[0] && tx - 6 < avoid[1]) continue;
    box(c, tx + 46, y - 268, 8, 6, '#334155');
    screenGlass(c, tx, y - 262, 100, 50, ad ? '#0EA5E9' : '#F472B6', f + j * 9);
    label(c, `tv-${ad ? 1 : 0}`, tx + 50, y - 238, ad ? 'PROGRESSCO' : "WE'RE ON IT", 'small', '#0F172A', ad ? '#0EA5E9' : '#F472B6', 92, 14);
  }
};
/** The empty sleds, parked nose to tail on the siding at the back of the station (dimmed: they're behind). */
const parkedSleds = (c: Ctx, x: number, f: number) => {
  const y = GY - 96;
  box(c, x - 110, y, 380, 6, INK); box(c, x - 108, y + 1, 376, 3, '#475569'); box(c, x - 108, y + 1, 376, 1, '#94A3B8');
  postedPlate(c, 'spares', x - 70, y - 100, y, 'SPARES', 'stencil', '#334155', '#CBD5E1', 5);
  c.save(); c.translate(x, y); c.scale(0.7, 0.7);
  for (let j = 0; j < 2; j++) { drawSled(c, j * 220, 0, f, EMPTY_SLED, true, 0, true); drawSled(c, j * 220, 0, f, EMPTY_SLED, false, 0, true); }
  c.restore();
  c.fillStyle = 'rgba(15, 23, 42, 0.35)'; c.fillRect(x - 110, y - 70, 380, 76);
};

/** The track's last leg, seen from the start: up behind, along its top (STATION AHEAD), the drop down, the brake zone
 *  at the bottom of it, into the station. Dimmed: it's behind, nothing to stand on. A sled comes round now and then:
 *  along the top, down the drop, grabbed by the brakes at the bottom (sparks), a crawl on into the station. */
const RETURN_TOP = GY - 290, RETURN_X0 = R + 280, RETURN_X1 = R + 980, RETURN_FOOT = R - 20, RETURN_FINS = 130;
const drawReturnLeg = (c: Ctx, f: number) => {
  const ay = RETURN_TOP, bx = RETURN_X0, ax = RETURN_X1, foot = RETURN_FOOT;
  const leg = (x: number) => (x >= bx ? ay : ay + ((bx - x) / (bx - foot)) * (GY - 30 - ay));
  // supports, the rail
  for (let x = foot + 60; x < ax; x += 210) { cyl(c, x - 3, leg(x) + 2, 6, GY - 42 - leg(x), '#1E293B', 'y'); box(c, x - 8, GY - 44, 16, 5, INK); box(c, x - 7, GY - 43, 14, 3, '#1E293B'); }
  c.strokeStyle = '#0F172A'; c.lineWidth = 9; c.beginPath(); c.moveTo(ax, ay + 2); c.lineTo(bx, ay + 2); c.lineTo(foot, GY - 28); c.stroke();
  c.strokeStyle = '#475569'; c.lineWidth = 4; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, ay); c.lineTo(foot, GY - 30); c.stroke();
  c.strokeStyle = '#94A3B8'; c.lineWidth = 1; c.beginPath(); c.moveTo(ax, ay - 2); c.lineTo(bx, ay - 2); c.lineTo(foot, GY - 32); c.stroke();
  // (the lamps down it: amber, the brake zone's)
  for (let x = foot + 80; x < bx; x += 70) lamp(c, x, leg(x) - 12, 3, '#F59E0B', (f >> 4) % 2 === 1, 2);
  // the brake fins along the bottom of the drop, on into the station
  for (let x = foot + 24; x < foot + RETURN_FINS; x += 22) { const ly = leg(x); box(c, x - 2, ly - 12, 5, 12, INK); box(c, x - 1, ly - 11, 3, 11, '#64748B'); }
  // the signs: STATION AHEAD over the top, BRAKE ZONE by the fins
  postedPlate(c, 'ret-ahead', bx + 430, ay - 76, ay, 'STATION AHEAD', 'enamel', '#1E3A8A', '#BAE6FD', 4);
  const sx = foot + 190, sy = leg(sx);
  postedPlate(c, 'ret-brake', sx, sy - 52, sy, 'BRAKE ZONE 3 MPH', 'small', '#A16207', '#FEF3C7', 4);
  // a sled, round every so often (going the other way: it's the far side of the loop): along the top, down the drop,
  // and a crawl through the brakes at the bottom (sparks), on into the station
  const T = f % 600;
  let x = -1, y = ay;
  if (T < 120) x = ax - (T / 120) * (ax - bx);
  else if (T < 190) { const u = (T - 120) / 70; x = bx - u * u * (bx - foot - RETURN_FINS); y = leg(x); }
  else if (T < 330) { x = foot + RETURN_FINS - ((T - 190) / 140) * RETURN_FINS; y = leg(x); }
  if (x > foot) {
    const rot = x < bx ? Math.atan2(GY - 30 - ay, bx - foot) : 0;
    c.save(); c.translate(x, y); c.scale(-0.6, 0.6); drawSled(c, 0, 0, f, FRONT_SLED, true, rot, false); drawSled(c, 0, 0, f, FRONT_SLED, false, rot, false); c.restore();
    if (T >= 190 && T < 330 && f % 2 === 0) { box(c, x - 20 + (f % 7) * 5, y - 6, 3, 3, '#FDE047'); box(c, x + (f % 5) * 6, y - 10, 2, 2, '#FFFFFF'); }
  }
  // (knocked back: it's behind, in the dark)
  c.fillStyle = 'rgba(3, 2, 10, 0.15)'; c.fillRect(foot, ay - 100, ax - foot + 20, GY - ay + 100);
};

/** The station's UNLOAD end (STATION_X0..LOAD_X0), where the brake run brings the sleds in: UNLOAD hung over it, the
 *  platform's yellow edge, its row of exit gates (shut till a sled's stopped), the unload attendant behind them, PLEASE
 *  REMAIN SEATED on the wall, the EXIT door; the drive tires in the rail (they push the sleds along the platform: the
 *  brake control punched in, they spin up, flat out, and kick him off from a dead stop). Read at the crawl: he's plainly
 *  back where he started; calm, an ordinary ride ending, till he punches it. */
const drawUnload = (c: Ctx, look: RideLook, f: number) => {
  const y = GY, failed = look.boxT > 0, coming = look.crashing && failed && look.lurched;
  const alcove = (x: number, pad: number) => x > BRAKE_BOX_X - 50 - pad && x < BRAKE_BOX_X + 50 + pad;
  // UNLOAD, hung off the roof on cables (above the TVs)
  const ux = STATION_X0 + 130, [, u0] = plateBoxAt('UNLOAD', 'chrome2', ux, STATION_ROOF + 44, 6);
  cables(c, [ux - 34, ux + 30], STATION_ROOF + 8, u0 + 2, '#A1A1AA');
  plate(c, 'unload', ux, STATION_ROOF + 44, 'UNLOAD', 'chrome2', '#1E3A8A', '#BAE6FD', 6);
  // the EXIT door in the back wall (its lit sign over it, an arrow on)
  const ex = LOAD_X0 - 90;
  box(c, ex - 31, y - 172, 62, 112, INK); bandedGradient(c, ex - 29, y - 170, 58, 110, ['#0F172A', '#020617'], 3);
  box(c, ex - 29, y - 170, 58, 2, '#475569');
  plate(c, 'unload-exit', ex, y - 190, 'EXIT >', 'neon', '#450A0A', '#F87171', 4);
  // PLEASE REMAIN SEATED, on the wall between the brake box's alcove and the door
  wallPlate(c, 'unload-seated', BRAKE_BOX_X + 160, y - 150, 'PLEASE REMAIN\nSEATED UNTIL\nTHE SLED STOPS', 'small', '#FEF3C7', '#7F1D1D', 5);
  // the platform behind the track: its deck, the yellow edge along the rail
  box(c, STATION_X0, y - 22, LOAD_X0 - STATION_X0, 22, INK); box(c, STATION_X0, y - 21, LOAD_X0 - STATION_X0, 21, '#334155'); box(c, STATION_X0, y - 21, LOAD_X0 - STATION_X0, 2, '#64748B');
  box(c, STATION_X0, y - 4, LOAD_X0 - STATION_X0, 4, '#FACC15'); box(c, STATION_X0, y - 4, LOAD_X0 - STATION_X0, 1, '#FEF9C3');
  for (let x = STATION_X0 + 12; x < LOAD_X0; x += 24) box(c, x, y - 3, 12, 2, '#1C1917');
  // the unload attendant, behind the gates by the brake control, bored (wide-eyed once it's punched in; flung by the
  // runaway: index.ts draws him flying)
  if (!look.gone.has('unload')) { c.save(); c.translate(UNLOAD_OP.x, y - 22); drawAtomPerson(c, 'op', { seed: UNLOAD_OP.seed, f, pose: failed ? 'after' : 'stand', md: 'ok' }); c.restore(); }
  // the exit gates along the platform's edge, shut (posts, a chrome panel, a red top rail)
  for (let gx = STATION_X0 + 40; gx < LOAD_X0 - 30; gx += 84) {
    if (alcove(gx, 20) || alcove(gx + 60, 20)) continue;
    for (const px of [gx, gx + 60]) { box(c, px - 1, y - 64, 6, 44, INK); box(c, px, y - 63, 4, 42, '#94A3B8'); box(c, px, y - 63, 1, 42, '#E2E8F0'); }
    box(c, gx + 4, y - 54, 56, 26, INK); box(c, gx + 5, y - 53, 54, 24, '#CBD5E1'); box(c, gx + 5, y - 53, 54, 2, '#F8FAFC');
    box(c, gx + 4, y - 64, 56, 5, INK); box(c, gx + 5, y - 63, 54, 3, '#DC2626');
    lamp(c, gx + 32, y - 41, 3, failed ? '#EF4444' : '#22C55E', failed ? (f >> 3) % 2 === 0 : true, 1);
  }
  // the drive tires in the rail (past the fins): still, the brakes on; spun up flat out, the box gone
  for (let x = FINS_X1 + 30; x < LOAD_X0 - 10; x += 44) {
    const spin = coming ? (f + x) % 4 : 0;
    box(c, x - 7, y - 7, 14, 7, INK); box(c, x - 6, y - 6, 12, 6, '#27272A');
    box(c, x - 5 + spin * 3, y - 6, 2, 5, coming ? '#71717A' : '#52525B');
    if (coming && f % 3 === 0) box(c, x - 2 + spin * 2, y - 10 - spin * 2, 3, 3, 'rgba(212, 212, 216, 0.6)');
  }
};

/** The brake run (ridden, at the end, on the flat at the foot of the last drop): the gantry over its start (STATION
 *  AHEAD, BRAKE ZONE: BRAKE FAILURE, once he's done the box); the red lamps along it; the attendant's booth by the
 *  station's mouth; the fins along the rail, on into the station; the station's UNLOAD end (drawUnload); the brake box
 *  in its alcove there. Drawn over the station's shell. */
const drawBrakeRun = (c: Ctx, look: RideLook, f: number) => {
  const rail = trackY(BRAKE_X) ?? GY, failed = look.boxT > 0, flash = (f >> 3) % 2 === 0;
  drawUnload(c, look, f);
  // the attendant's booth, behind the track: teal, its window, its little roof
  slab(c, BRAKE_X - 120, rail - 130, 96, 130, '#0F766E');
  box(c, BRAKE_X - 126, rail - 138, 108, 10, INK); box(c, BRAKE_X - 125, rail - 137, 106, 8, '#E5E7EB'); box(c, BRAKE_X - 125, rail - 137, 106, 2, '#FFFFFF');
  box(c, BRAKE_X - 110, rail - 114, 76, 38, INK); bandedGradient(c, BRAKE_X - 108, rail - 112, 72, 34, ['#E0F2FE', '#BAE6FD', '#7DD3FC'], 3);
  c.save(); c.translate(BRAKE_X - 72, rail - 40); drawAtomPerson(c, 'op', { seed: 6610, f, pose: failed ? 'after' : 'stand', md: 'ok' }); c.restore();
  box(c, BRAKE_X - 117, rail - 46, 90, 46, '#115E59'); box(c, BRAKE_X - 117, rail - 46, 90, 2, '#2DD4BF');
  postedPlate(c, 'brakerun', BRAKE_X - 72, rail - 160, rail - 138, 'BRAKE RUN: 3 MPH', 'enamel', '#FDE047', '#1C1917', 5);
  // the fins along the rail (till they're torn off)
  if (!failed) for (let x = FINS_X0; x < FINS_X1; x += 26) { const y = trackY(x) ?? rail; box(c, x - 3, y - 16, 6, 16, INK); box(c, x - 2, y - 15, 4, 14, '#A1A1AA'); box(c, x - 2, y - 15, 1, 14, '#E4E4E7'); box(c, x - 2, y - 15, 4, 2, '#F4F4F5'); }
  else for (let x = FINS_X0; x < FINS_X1; x += 26) { const y = trackY(x) ?? rail; box(c, x - 3, y - 4, 6, 4, '#52525B'); if ((f + x) % 11 < 2) box(c, x - 1, y - 8, 2, 2, '#FDE047'); }
  // the brake box, in a narrow hazard-striped alcove right on the rail, a work lamp on it: plain as day (punched in: its
  // face caved in round his fist, sparking, smoking)
  const bx = BRAKE_BOX_X, by = trackY(bx) ?? rail;
  for (const jx of [bx - 50, bx + 36]) { box(c, jx - 2, by - 190, 16, 190, INK); hazard(c, jx, by - 188, 12, 188, '#EAB308', '#3F3F46', 8); }
  box(c, bx - 52, by - 200, 104, 14, INK); box(c, bx - 50, by - 198, 100, 10, '#52525B'); box(c, bx - 50, by - 198, 100, 2, '#A1A1AA');
  lamp(c, bx, by - 182, 4, '#FEF3C7', true, 3);
  box(c, bx - 4, by - 20, 8, 20, '#27272A');
  if (!failed) {
    slab(c, bx - 24, by - 104, 48, 86, '#991B1B');
    label(c, 'brakectl', bx, by - 82, 'BRAKE\nCONTROL', 'small', '#FEF3C7', '#991B1B', 46, 22);
    lamp(c, bx - 8, by - 60, 4, '#22C55E', true, 0); lamp(c, bx + 8, by - 60, 4, '#22C55E', false, 0);
    box(c, bx - 16, by - 46, 32, 16, INK); box(c, bx - 15, by - 45, 30, 14, '#27272A'); label(c, 'ok', bx, by - 38, 'OK', 'small', '#4ADE80', '#27272A', 20, 12);
  } else {
    crumpledPanel(c, bx - 24, by - 104, 48, 86, '#991B1B', f, 3);
    // (its label knocked crooked; its lamps red now, one smashed)
    c.save(); c.translate(bx - 2, by - 86); c.rotate(-0.18); label(c, 'brakectl', 0, 0, 'BRAKE\nCONTROL', 'small', '#FEF3C7', '#991B1B', 46, 22); c.restore();
    lamp(c, bx + 12, by - 32, 3, '#EF4444', flash, 0);
  }
  // the gantry over the start of it
  const gy = (trackY(GANTRY_X) ?? rail) - 250;
  // (its legs go down to the floor: drawn behind the track, drawSupports; the beam across their tops, the signs hung
  // off it on cables, the second off the first)
  truss(c, GANTRY_X - 156, gy - 14, 318, 16, '#52525B');
  const [, a0, , a1] = plateBoxAt('STATION AHEAD', 'chrome2', GANTRY_X, gy + 24, 6);
  cables(c, [GANTRY_X - 80, GANTRY_X + 76], gy + 2, a0 + 2, '#A1A1AA');
  plate(c, 'gantry-ahead', GANTRY_X, gy + 24, 'STATION AHEAD', 'chrome2', '#1E3A8A', '#BAE6FD', 6);
  const sub = failed ? 'BRAKE FAILURE' : 'BRAKE ZONE 3 MPH', [, b0] = plateBoxAt(sub, 'enamel', GANTRY_X, a1 + 22, 6);
  cables(c, [GANTRY_X - 50, GANTRY_X + 46], a1 - 2, b0 + 2, '#A1A1AA');
  if (!failed) plate(c, 'gantry-zone', GANTRY_X, a1 + 22, sub, 'enamel', '#A16207', '#FEF3C7', 6);
  else plate(c, `gantry-fail-${flash ? 1 : 0}`, GANTRY_X, a1 + 22, sub, 'enamel', flash ? '#DC2626' : '#7F1D1D', '#FFFFFF', 6);
  // the red lamps along it, up to the station's mouth (lit, the brakes gone; none in front of the booth)
  for (let x = GANTRY_X + 40; x < STATION_X0 - 60; x += 70) {
    if (x > BRAKE_X - 130 && x < BRAKE_X + 6) continue;
    const y = trackY(x) ?? GY;
    box(c, x - 1, y - 60, 3, 54, '#27272A');
    lamp(c, x, y - 64, 5, '#EF4444', failed && ((f >> 2) + x / 70) % 2 < 1, 3);
  }
};

/** Back in the station (the same as the one he left from): its shell, from the unload end on; at the load end, the
 *  line, the platform, the console, the empty sleds. */
const drawStation = (c: Ctx, state: GameState, look: RideLook) => {
  const f = state.frame, cam = state.camera.x;
  if (cam + CANVAS_WIDTH < STATION_X0 - 200) return;
  const y = GY;
  stationShell(c, STATION_X0 - 60, STATION_X1 + 200, f, look.frontGone, [LOAD_X0 + 196, LOAD_X0 + 274]);
  if (look.frontGone) for (let j = 0; j < 8; j++) { box(c, FRONT_AT - 121 + j * 30, STATION_ROOF - 21 + (j % 3) * 8, 28, 12, INK); box(c, FRONT_AT - 120 + j * 30, STATION_ROOF - 20 + (j % 3) * 8, 26, 10, '#1E3A8A'); box(c, FRONT_AT - 120 + j * 30, STATION_ROOF - 20 + (j % 3) * 8, 26, 2, '#60A5FA'); }
  stamp(c, 'ride-station-sign', LOAD_X0 + 116, STATION_ROOF + 26, 428, 38, g => {
    box(g, LOAD_X0 + 120, STATION_ROOF + 30, 420, 30, INK); box(g, LOAD_X0 + 122, STATION_ROOF + 32, 416, 26, '#9CA3AF'); box(g, LOAD_X0 + 122, STATION_ROOF + 32, 416, 1, '#F3F4F6');
    bandedGradient(g, LOAD_X0 + 125, STATION_ROOF + 35, 410, 20, ['#0F172A', '#020617'], 3);
    lettering(g, 'VOYAGE TO 2010 - PRESENTED BY PROGRESSCO', LOAD_X0 + 330, STATION_ROOF + 45, 'neon', '#67E8F9', '#0F172A', true);
  });
  parkedSleds(c, LOAD_X0 + 300, f);
  // (the line, behind its rail: the same people, still waiting; wide-eyed once it's coming, the nearest splattered)
  // (relaxed till he's punched the brake control; flung by the runaway: index.ts draws them flying)
  const coming = look.crashing && look.boxT > 0;
  QUEUE.forEach((q, j) => {
    if (look.gone.has(`q${j}`)) return;
    c.save(); c.translate(q.x, q.y); drawAtomPerson(c, 'guest', { seed: q.seed, f, pose: coming ? 'after' : 'stand', md: 'ok' }); c.restore();
  });
  box(c, LOAD_X0, y - 65, 560, 6, INK); box(c, LOAD_X0, y - 64, 560, 4, '#94A3B8'); box(c, LOAD_X0, y - 64, 560, 1, '#F8FAFC');
  box(c, LOAD_X0 + 560, y - 4, STATION_X1 - LOAD_X0 - 560, 4, '#FACC15'); box(c, LOAD_X0 + 560, y - 4, STATION_X1 - LOAD_X0 - 560, 1, '#FEF9C3');
  // (what's left on the platform of whoever was on the track)
  look.flat.forEach(i => { const x = STATION_FOLK[i].x + 10; box(c, x, y - 3, 90, 4, '#7F1D1D'); box(c, x + 20, y - 4, 40, 3, '#B91C1C'); box(c, x + 10, y - 60 - (i % 3) * 10, 6, 14, '#991B1B'); });
  // (the operator at her console)
  if (!look.gone.has('op')) { c.save(); c.translate(CONSOLE_OP_X, y); drawAtomPerson(c, 'op', { seed: OP_SEED, f, pose: look.frontGone || coming ? 'after' : 'stand', md: 'ok' }); c.restore(); }
  slab(c, LOAD_X0 + 630, y - 70, 60, 70, '#0F766E'); box(c, LOAD_X0 + 634, y - 66, 52, 4, '#5EEAD4');
  c.save(); c.beginPath(); c.rect(LOAD_X0 + 648, y - 90, 24, 18); c.clip(); sphere(c, LOAD_X0 + 660, y - 72, 8, '#22C55E'); c.restore();
};

/** The start: the station he's just left (behind him), the empty sleds; the track's last leg coming down into it. */
const drawStart = (c: Ctx, state: GameState) => {
  const f = state.frame;
  stationShell(c, R - 700, R + 40, f, false, [R - 624, R - 546]);
  parkedSleds(c, R - 520, f);
  wallPlate(c, 'start-name', R - 420, STATION_ROOF + 46, 'VOYAGE TO 2010 - PRESENTED BY PROGRESSCO', 'neon', '#0F172A', '#67E8F9', 8);
  // (the tunnel mouth out of it, into the dark: its neon frame)
  box(c, R + 30, STATION_ROOF, 20, GY - STATION_ROOF, INK);
  neonBar(c, R + 36, STATION_ROOF + 12, 6, GY - STATION_ROOF - 12, '#F0ABFC', true);
  drawReturnLeg(c, f);
};

export const drawRideBack = (c: Ctx, state: GameState, look: RideLook) => {
  const f = state.frame, cam = state.camera.x, k = look.k, lit = k > 0.5;
  const on = (x0: number, x1: number) => x1 > cam - 150 && x0 < cam + CANVAS_WIDTH + 150;
  if (on(R - 700, R + 1100)) drawStart(c, state);
  // The scenes of 2010, by the track (act 1), held back in the dark; lit, they're plywood on braces
  TABLEAU_XS.forEach((sx, i) => {
    const y = (trackY(sx) ?? GY) - 40;
    if (!on(sx - 50, sx + 300)) return;
    // (its stage up on scaffold legs, down to the floor, braced)
    for (const lx of [sx - 24, sx + 120, sx + 264]) column(c, lx, y + 17, 6, lit ? '#57534E' : '#1A1530', lit);
    c.strokeStyle = lit ? '#57534E' : '#1A1530'; c.lineWidth = 2; c.beginPath();
    for (const [p, q] of [[sx - 24, sx + 120], [sx + 120, sx + 264]]) { c.moveTo(p, y + 20); c.lineTo(q, y + 160); c.moveTo(p, y + 160); c.lineTo(q, y + 20); }
    c.stroke();
    // (held back in the dark, all but its words; lit, it's plainly a set: braces behind, stenciled)
    drawTableau(c, TABLEAUS[i], sx, y, f, lit ? 'rgba(55, 60, 72, 0.4)' : 'rgba(3, 2, 10, 0.5)');
    if (lit) for (let b = 0; b < 3; b++) for (const [lw, cl] of [[6, INK], [4, '#A16207'], [1, '#CA8A04']] as const) { c.strokeStyle = cl; c.lineWidth = lw; c.beginPath(); c.moveTo(sx + 30 + b * 90, y - 100); c.lineTo(sx + 60 + b * 90, y); c.stroke(); }
    if (lit) label(c, 'property', sx + 120, y + 10, 'PROPERTY OF PROGRESSCO', 'stencil', '#FDE68A', '#0B0B12', 200, 20);
  });
  // The lift: its blue strobes on posts along it, climbing
  // (the PA's speakers along act 1: a horn on a pole stood on the girder, its cable; where it's clear of a cue's sign and
  // a scene)
  for (const sx of PA_POLES) if (on(sx - 30, sx + 30)) {
    const y = trackY(sx) ?? railLine(sx), pc = lit ? '#52525B' : '#1E1B33';
    box(c, sx - 2, y - 150, 4, 162, INK); box(c, sx - 1, y - 150, 2, 162, pc);
    box(c, sx - 4, y - 160, 8, 12, INK); box(c, sx - 3, y - 159, 6, 10, lit ? '#71717A' : '#27243F');
    c.fillStyle = INK; c.beginPath(); c.moveTo(sx + 3, y - 160); c.lineTo(sx + 22, y - 168); c.lineTo(sx + 22, y - 140); c.lineTo(sx + 3, y - 148); c.closePath(); c.fill();
    c.fillStyle = lit ? '#A1A1AA' : '#3B3656'; c.beginPath(); c.moveTo(sx + 4, y - 158); c.lineTo(sx + 20, y - 165); c.lineTo(sx + 20, y - 143); c.lineTo(sx + 4, y - 150); c.closePath(); c.fill();
    box(c, sx + 19, y - 165, 2, 22, lit ? '#D4D4D8' : '#4C4670');
    box(c, sx + 2, y - 146, 1, 140, '#0B0B12');
  }
  drawSpurBack(c, cam, lit, f);
  drawSupports(c, cam, lit);
  if (on(LIFT_X0, LIFT_X1)) for (let x = LIFT_X0 + 40; x < LIFT_X1; x += 80) {
    const y = trackY(x) ?? GY;
    box(c, x - 1, y - 194, 3, 204, lit ? '#52525B' : '#1E293B');
    const strobe = !lit && (Math.floor(f / 6) - x / 80) % 8 < 1;
    lamp(c, x, y - 200, 5, lit ? '#9CA3AF' : '#60A5FA', strobe, 4);
  }
  drawTrack(c, k, cam, f);
  // The obstacles (the show's: not there with the power off on a second go), and their lanes lit on the rail
  OBS.forEach((o, i) => {
    if (!on(o.x - 200, o.x + 200) || !obLive(state, look.tricks, i)) return;
    drawOb(c, o, i, look, f);
    laneMark(c, o.x - halfW(o) - 4, o.x + halfW(o) + 4, CUE_COL[o.verb], (f >> 3) % 2 === 0);
  });
  drawSpurFront(c, cam, lit, f);
  // The cues, a second ahead of each
  CUES.forEach((q, i) => {
    const x = CUE_XS[i];
    if (!on(x - 60, x + 60)) return;
    // (the show's, dead with the power off on a second go: no cue)
    if (q.ob >= 0 && !look.tricks.broken.has(q.ob) && !obLive(state, look.tricks, q.ob)) return;
    cueSign(c, x, q.verb, cueLive(state, look.tricks, i, look.sledX), f);
  });
  // The MAIN BREAKER (till he's punched it going by: then its face caved in, sparking, smoking)
  if (on(BREAKER_X - 100, BREAKER_X + 100)) {
    const rail = trackY(BREAKER_X) ?? GY, gone = look.breakerT > 0, bx = BREAKER_X;
    // a narrow service doorway the track squeezes through (its jambs barely clear of the sled, hazard-striped), and the
    // main breaker panel hung in the back of it at the rider's height, DO NOT TOUCH: right where his fist goes by
    for (const jx of [bx - 110, bx + 96]) { box(c, jx - 2, rail - 260, 18, 260, INK); hazard(c, jx, rail - 258, 14, 258, '#EAB308', '#3F3F46', 10); box(c, jx, rail - 258, 2, 258, '#71717A'); }
    truss(c, bx - 112, rail - 272, 226, 16, '#52525B');
    cables(c, [bx - 50, bx + 46], rail - 256, rail - 248, '#A1A1AA');
    plate(c, 'mainbreaker', bx, rail - 236, 'MAIN BREAKER', 'stencil', '#FDE047', '#1C1917', 6);
    if (!gone) {
      box(c, bx - 3, rail - 226, 6, 100, INK); box(c, bx - 2, rail - 226, 4, 100, '#71717A'); box(c, bx - 2, rail - 226, 1, 100, '#A1A1AA');
      slab(c, bx - 40, rail - 128, 80, 88, '#9CA3AF');
      for (let v = 0; v < 3; v++) box(c, bx - 32, rail - 116 + v * 6, 18, 2, '#6B7280');
      box(c, bx - 7, rail - 113, 16, 38, INK); box(c, bx - 6, rail - 112, 14, 36, '#27272A');
      slab(c, bx - 11, rail - 122, 24, 12, '#DC2626');
      lamp(c, bx + 26, rail - 112, 3, '#EF4444', (f >> 3) % 2 === 0, 2);
      label(c, 'donottouch', bx, rail - 58, 'DO NOT TOUCH', 'small', '#7F1D1D', '#9CA3AF', 80, 12);
    } else {
      // (knocked crooked on its pole: the face caved in, the big switch gone, DO NOT TOUCH hanging off it)
      box(c, bx - 3, rail - 226, 6, 100, INK); box(c, bx - 2, rail - 226, 4, 100, '#71717A');
      c.save(); c.translate(bx, rail - 128); c.rotate(0.08); c.translate(-bx, -(rail - 128));
      crumpledPanel(c, bx - 40, rail - 128, 80, 88, '#9CA3AF', f, 11);
      c.restore();
      c.save(); c.translate(bx + 4, rail - 50); c.rotate(0.35); label(c, 'donottouch', 0, 0, 'DO NOT TOUCH', 'small', '#7F1D1D', '#9CA3AF', 80, 12); c.restore();
    }
  }
  drawStation(c, state, look);
  if (on(GANTRY_X - 200, LOAD_X0)) drawBrakeRun(c, look, f);
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
      c.globalAlpha = 0.18; box(c, -hw - 8, top - 6, hw * 2 + 16, bot - top + 12, '#22C55E'); c.globalAlpha = 1;
      box(c, -hw, top - 1, hw * 2, bot - top + 2, INK);
      box(c, -hw + 2, top + 1, hw * 2 - 4, bot - top - 2, 'rgba(34, 197, 94, 0.6)');
      for (let yy = top + 4; yy < bot - 2; yy += 8) { box(c, -hw + 2, yy + ((f >> 2) % 2), hw * 2 - 4, 2, '#DCFCE7'); box(c, -hw + 2, yy + 2 + ((f >> 2) % 2), hw * 2 - 4, 1, '#4ADE80'); }
      box(c, -hw, bot - 3, hw * 2, 3, '#FDE047');
      c.restore();
    } else if (o.kind === 'wire') {
      c.globalAlpha = 0.16; box(c, o.x - hw - 6, rail - HURDLE - 6, hw * 2 + 12, HURDLE + 2, '#22C55E'); c.globalAlpha = 1;
      box(c, o.x - hw, rail - HURDLE, hw * 2, HURDLE - 10, 'rgba(34, 197, 94, 0.55)');
      for (let yy = rail - HURDLE + 2; yy < rail - 10; yy += 5) box(c, o.x - hw, yy, hw * 2, 2, (f >> 2) % 2 ? '#DCFCE7' : '#86EFAC');
    }
  });
};

/** The space blaster's bolts, the flash at his gun, what's been blasted to bits. */
export const drawBlaster = (c: Ctx, state: GameState, tr: Tricks, p: Player) => {
  for (const b of tr.bits) { c.save(); c.translate(b.x, b.y); c.rotate(b.rot); box(c, -b.w / 2 - 1, -b.h / 2 - 1, b.w + 2, b.h + 2, INK); box(c, -b.w / 2, -b.h / 2, b.w, b.h, b.col); box(c, -b.w / 2, -b.h / 2, b.w, 1, lite(b.col, 0.4)); c.restore(); }
  for (const b of tr.bolts) {
    // (a green bolt: a long streak, a hot core, a stepped glow; along the way it was fired)
    c.save(); c.translate(b.x, b.y); c.rotate(b.ang);
    c.globalAlpha = 0.18; box(c, -48, -9, 76, 18, '#22C55E');
    c.globalAlpha = 0.3; box(c, -40, -7, 64, 14, '#22C55E');
    c.globalAlpha = 0.55; box(c, -30, -4, 54, 8, '#4ADE80');
    c.globalAlpha = 1; box(c, -22, -2, 46, 4, '#BBF7D0'); box(c, 6, -1, 18, 2, '#FFFFFF');
    c.restore();
  }
  if (tr.flash > 0 && p.cartSeat) {
    const mx = p.pos.x + p.width + 4, my = p.pos.y + 30, r = 4 + tr.flash * 2;
    c.globalAlpha = 0.25; box(c, mx - r * 1.6, my - r * 1.6, r * 3.2, r * 3.2, '#86EFAC');
    c.globalAlpha = 0.5; box(c, mx - r, my - r, r * 2, r * 2, '#86EFAC'); c.globalAlpha = 1;
    box(c, mx - r / 2, my - r / 2, r, r, '#F0FDF4');
  }
  void state;
};

// ---------------------------------------------------------------------------------------------------------------
// The lighting

export const rideLighting = (state: GameState, look: RideLook): SceneLight => {
  const cam = state.camera.x, f = state.frame, lights: Light[] = [];
  const near = (x: number) => x > cam - 300 && x < cam + CANVAS_WIDTH + 300;
  const dk = 0.62 * (1 - look.k);
  if (look.k < 1) {
    const spot = (x: number, up: number, r = 170, col = 'rgba(255, 247, 214, 0.12)', a = 0.95) => { if (near(x)) lights.push({ x, y: (trackY(x) ?? railLine(x)) - up, r, a, color: col }); };
    // (every obstacle has its own light: the dark's the show's, not something to hide them in)
    OBS.forEach((o, i) => { if (obLive(state, look.tricks, i)) spot(o.x, o.verb === 'duck' ? 80 : 60, 190); if (o.kind === 'beam' && obLive(state, look.tricks, i)) spot(o.x, 85, 140, 'rgba(74, 222, 128, 0.24)'); if (o.kind === 'wire' && obLive(state, look.tricks, i)) spot(o.x, 14, 90, 'rgba(74, 222, 128, 0.2)'); });
    // (the cues: lit up in their own color, full while they're live)
    const tint: Record<Verb, string> = { jump: 'rgba(34, 211, 238, 0.24)', duck: 'rgba(251, 191, 36, 0.24)', blast: 'rgba(244, 63, 94, 0.24)' };
    CUES.forEach((q, i) => { const live = cueLive(state, look.tricks, i, look.sledX); spot(CUE_XS[i], CUE_UP, live ? 130 : 70, tint[q.verb], live ? 1 : 0.6); });
    for (const [a, b] of GAPS) { spot(a - 10, 40, 150, 'rgba(239, 68, 68, 0.18)'); spot(b + 10, 40, 150, 'rgba(239, 68, 68, 0.18)'); }
    for (const x of TABLEAU_XS) if (near(x + 100)) lights.push({ x: x + 120, y: (trackY(x + 100) ?? GY) - 120, r: 260, a: 0.8, color: 'rgba(244, 114, 182, 0.12)' });
    for (const [x] of WORKERS) spot(x, 40, 120);
    // (the lift's strobes, as they fire)
    for (let x = LIFT_X0 + 40; x < LIFT_X1; x += 80) if (near(x) && (Math.floor(f / 6) - x / 80) % 8 < 1) lights.push({ x, y: (trackY(x) ?? GY) - 200, r: 150, a: 0.9, color: 'rgba(96, 165, 250, 0.24)' });
    if (near(BREAKER_X)) lights.push({ x: BREAKER_X, y: (trackY(BREAKER_X) ?? GY) - 100, r: 100, a: 0.7, color: 'rgba(239, 68, 68, 0.18)' });
    if (near(BRAKE_BOX_X)) lights.push({ x: BRAKE_BOX_X, y: (trackY(BRAKE_BOX_X) ?? GY) - 120, r: 110, a: 0.8, color: 'rgba(254, 243, 199, 0.18)' });
    if (near(R)) { for (let x = R - 600; x < R + 100; x += 200) lights.push({ x, y: GY - 300, r: 420, a: 0.85, cone: 200, color: 'rgba(224, 242, 254, 0.08)' }); lights.push({ x: R + 40, y: GY - 150, r: 150, a: 0.7, color: 'rgba(240, 171, 252, 0.14)' }); }
    // (the track's last leg, seen from the start: its signs and its brake zone lit, so it reads)
    if (near(RETURN_X0)) for (const [x, up, r] of [[RETURN_X0 + 430, 70, 150], [RETURN_FOOT + 190, 107, 150], [RETURN_FOOT + 80, -30, 120], [RETURN_X0 - 120, 0, 160]] as const) lights.push({ x, y: RETURN_TOP - up + (x < RETURN_X0 ? 150 : 0), r, a: 0.9, color: 'rgba(253, 230, 138, 0.1)' });
  }
  spurLights(cam, look.k, lights);
  if (look.boxT > 0) for (let x = GANTRY_X + 40; x < STATION_X0 - 60; x += 70) if (!(x > BRAKE_X - 130 && x < BRAKE_X + 6)) if (near(x) && ((f >> 2) + x / 70) % 2 < 1) lights.push({ x, y: (trackY(x) ?? GY) - 64, r: 110, a: 0.8, color: 'rgba(239, 68, 68, 0.2)' });
  for (const b of look.tricks.bolts) lights.push({ x: b.x, y: b.y, r: 90, a: 0.8, color: 'rgba(74, 222, 128, 0.25)' });
  if (STATION_X1 + 200 > cam - 300 && STATION_X0 < cam + CANVAS_WIDTH + 300) for (let x = STATION_X0; x < STATION_X1 + 200; x += 200) if (near(x)) { lights.push({ x, y: GY - 300, r: 480, a: 0.9, cone: 200, color: 'rgba(224, 242, 254, 0.08)' }); lights.push({ x, y: STATION_ROOF + 12, r: 130, a: 0.6, color: 'rgba(103, 232, 249, 0.1)' }); }
  // (the sled's headlamp, and enough round him that he's never lost)
  lights.push({ x: look.sledX, y: look.sledY - 50, r: 180, a: 0.6 });
  lights.push({ x: look.sledX + 180, y: look.sledY - 40, r: 160, a: 0.55, color: 'rgba(224, 242, 254, 0.08)' });
  if (look.k < 0.5) lights.push({ x: look.sledX, y: look.sledY - 16, r: 90, a: 0.5, color: 'rgba(103, 232, 249, 0.1)' });
  return { dark: dk, shade: [4, 3, 16], lights, rim: 0.5 };
};
