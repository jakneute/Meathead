// The giant atom (backstage), painted (crude first pass: readable shapes, flat colors, the real look later):
//   the backdrop   the dark ride itself, through the gaps in the flats: a starfield, neon planets, the narrated
//                  tableaus of 2010, the VOYAGE TO 2010 sign, and the ride's track with the star sleds gliding along it
//                  (full of people: every look, by seed)
//   the back       the backs of the sets (raw plywood flats, braces, stenciled numbers), the catwalks, the rigs and
//                  their consoles, the signs; then the line, the load platform and the sled
//   the front      what glows (the flames, the lasers, the fog), the air cannon's blast, what's said
// Indoors, dark: its own lighting (atomLighting).

import type { GameState } from '../../../m1/game/core/state';
import type { SceneLight, Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { INK, box, text, rampOf, dark, lite, mix, stamp, hash, sign } from '../../intro/art/kit';
import { lookOf } from '../../adventure/temple/people';
import { saidOver } from '../section';
import { GY } from '../geometry';
import {
  A, x1, THRUSTERS, thrustAt, flameBox, ROCKET_BODY, SWINGS, swingBall, SHOWER, showerAt, AIRLOCKS, AIRLOCK_TOP, airlockAt,
  AIRLOCK_POST, CANNON, cannonAt, FLOOR_LASER, floorLaserAt, SWEEP_LASER, sweepSpot, sweepState, LASER_POST, FOG_XS, BLACKLIGHT,
  QUEUE_DOOR, LINE_X0, LINE_X1, PLATFORM_X, CONSOLE_X, SLED_X, TUNNEL_X, QUEUE, LEDGES, SOLIDS, POSTS,
} from './layout';
import { crewed } from './rigs';
import { drawAtomPerson } from './people';
import { drawSled, seatedIn, HIS_SLED, FRONT_SLED, SEATS } from '../ride/sled';
import type { Hijack } from './hijack';

type Ctx = CanvasRenderingContext2D;

const PLY = '#5B4632', PLY_DARK = '#3B2D20', FLOOR = '#1C1B22';

// ---------------------------------------------------------------------------------------------------------------
// The dark ride, through the gaps (screen space, parallax)

/** A rider's head and shoulders (tiny: in a sled way back in the ride), by seed. */
export const tinyRider = (c: Ctx, x: number, y: number, seed: number, k = 1) => {
  const L = lookOf(seed);
  box(c, x - 5 * k, y - 4 * k, 10 * k, 8 * k, L.shirt);
  box(c, x - 3.5 * k, y - 12 * k, 7 * k, 8 * k, L.skin);
  if (!L.bald) box(c, x - 4 * k, y - 13 * k, 8 * k, 3 * k, L.hair);
  if (L.long && !L.bald) box(c, x - 4 * k, y - 11 * k, 2 * k, 7 * k, L.hair);
};
/** A far star sled (the ride's own, going round), its two riders, at screen (x, y). */
export const tinySled = (c: Ctx, x: number, y: number, seed: number, f: number, k = 0.5) => {
  tinyRider(c, x + 8 * k, y - 22 * k, seed, k * 1.6); tinyRider(c, x - 22 * k, y - 22 * k, seed * 7 + 3, k * 1.6);
  box(c, x - 70 * k, y - 22 * k, 150 * k, 14 * k, '#CBD5E1');
  box(c, x - 70 * k, y - 16 * k, 150 * k, 4 * k, '#DC2626');
  for (let i = 0; i < 4; i++) box(c, x - 60 * k + i * 36 * k, y - 9 * k, 4 * k, 3 * k, (Math.floor(f / 4) + i) % 4 === 0 ? '#67E8F9' : '#334155');
};

/** The ride's scenes, way back (the parallax layer's), one after another and round again: what's painted on each. */
export const TABLEAUS = ['home', 'office', 'cars', 'moon'] as const;
export const drawTableau = (c: Ctx, kind: typeof TABLEAUS[number], x: number, y: number, f: number) => {
  switch (kind) {
    case 'home': {
      // the home of 2010: a ranch house cut away, a family on the couch, the robot butler with a tray of pills
      box(c, x, y - 120, 220, 120, '#1E1B4B'); box(c, x + 4, y - 116, 212, 112, '#312E81');
      c.fillStyle = '#1E1B4B'; c.beginPath(); c.moveTo(x - 10, y - 120); c.lineTo(x + 110, y - 170); c.lineTo(x + 230, y - 120); c.closePath(); c.fill();
      box(c, x + 20, y - 40, 90, 22, '#9D174D');
      for (const [i, s] of [[0, 711], [1, 822], [2, 933]] as const) tinyRider(c, x + 36 + i * 26, y - 40, s, 1.2);
      // (the robot butler: a can on wheels, its tray out)
      box(c, x + 150, y - 70, 30, 52, '#94A3B8'); box(c, x + 155, y - 88, 20, 18, '#CBD5E1');
      box(c, x + 158, y - 82, 5, 4, f % 50 < 40 ? '#F87171' : '#7F1D1D'); box(c, x + 167, y - 82, 5, 4, f % 50 < 40 ? '#F87171' : '#7F1D1D');
      box(c, x + 180, y - 58 + Math.sin(f * 0.05) * 3, 28, 4, '#E5E7EB'); for (let k = 0; k < 3; k++) box(c, x + 184 + k * 7, y - 62 + Math.sin(f * 0.05) * 3, 4, 4, ['#F472B6', '#FDE047', '#4ADE80'][k]);
      text(c, 'HOME, 2010', x + 110, y - 132, '#F9A8D4', 8);
      break;
    }
    case 'office': {
      // the paperless office: desks, a man with a fax machine on his belt, a wall-sized TV screen
      box(c, x, y - 130, 240, 130, '#0C4A6E'); box(c, x + 4, y - 126, 232, 122, '#075985');
      box(c, x + 70, y - 116, 110, 56, '#0F172A'); box(c, x + 74, y - 112, 102, 48, f % 120 < 60 ? '#22D3EE' : '#0891B2');
      text(c, 'PROFITS', x + 125, y - 86, '#0F172A', 6);
      for (const dx of [20, 150]) { box(c, x + dx, y - 34, 70, 8, '#E2E8F0'); box(c, x + dx + 6, y - 26, 4, 26, '#94A3B8'); box(c, x + dx + 58, y - 26, 4, 26, '#94A3B8'); }
      tinyRider(c, x + 50, y - 34, 1404, 1.2); tinyRider(c, x + 186, y - 34, 1707, 1.2);
      text(c, 'OFFICE, 2010: NO PAPER!', x + 120, y - 142, '#67E8F9', 8);
      break;
    }
    case 'cars': {
      // traffic, 2010: flying cars on wires over a city of domes
      for (let k = 0; k < 4; k++) { const dx = 20 + k * 52; box(c, x + dx, y - 40 - k * 10, 40, 40 + k * 10, '#3B0764'); c.fillStyle = '#581C87'; c.beginPath(); c.arc(x + dx + 20, y - 40 - k * 10, 20, Math.PI, 0); c.fill(); }
      for (let k = 0; k < 3; k++) {
        const cx = x + ((f * (1 + k * 0.4) + k * 90) % 240), cy = y - 150 + k * 28;
        box(c, cx, cy - 12, 1, 12 - 200, '#475569');
        box(c, cx - 18, cy, 36, 10, ['#F43F5E', '#FACC15', '#22D3EE'][k]); box(c, cx - 10, cy - 7, 20, 7, '#BAE6FD');
      }
      text(c, 'TRAFFIC? NOT IN 2010!', x + 120, y - 186, '#D8B4FE', 8);
      break;
    }
    case 'moon': {
      // the moon base (theirs, and ours, bigger): domes on a gray moon, two flags
      c.fillStyle = '#334155'; c.beginPath(); c.ellipse(x + 120, y, 150, 40, 0, Math.PI, 0); c.fill();
      for (const [dx, r] of [[60, 34], [150, 46]] as const) { c.fillStyle = '#94A3B8'; c.beginPath(); c.arc(x + dx, y - 26, r, Math.PI, 0); c.fill(); box(c, x + dx - r * 0.5, y - 26 - r * 0.6, r * 0.3, r * 0.2, '#BAE6FD'); }
      box(c, x + 20, y - 110, 2, 70, '#E2E8F0'); box(c, x + 22, y - 110, 28, 18, '#DC2626'); text(c, 'CCCP', x + 36, y - 98, '#FDE047', 5);
      box(c, x + 210, y - 130, 2, 90, '#E2E8F0'); box(c, x + 212, y - 130, 36, 22, '#F8FAFC'); box(c, x + 212, y - 130, 14, 12, '#1D4ED8'); for (let k = 0; k < 3; k++) box(c, x + 212, y - 122 + k * 6, 36, 2, '#DC2626');
      text(c, 'THE MOON, 2010', x + 120, y - 150, '#E2E8F0', 8);
      break;
    }
  }
};

/** Which scene's through which gap (the sixth's the traffic: the air cannon stands in front of it, and the office's
 *  PROFITS screen was behind the cannon). */
const GAP_SCENES: typeof TABLEAUS[number][] = ['home', 'office', 'cars', 'moon', 'home', 'cars', 'moon'];
/** Screen space: the dark ride, way back (through the gaps in the flats). */
export const drawRideBackdrop = (c: Ctx, state: GameState) => {
  const W = CANVAS_WIDTH, H = CANVAS_HEIGHT, f = state.frame, cam = state.camera.x;
  c.fillStyle = '#04030C'; c.fillRect(0, 0, W, H);
  // (the starfield, painted on the black: slow)
  for (let i = 0; i < 150; i++) {
    const sx = ((i * 211.7 - cam * 0.12) % W + W) % W, sy = (i * 97.3) % (H - 120);
    const tw = (f + i * 13) % 90 < 6;
    box(c, sx, sy, tw ? 3 : 2, tw ? 3 : 2, i % 7 ? '#94A3B8' : '#F8FAFC');
  }
  // (the planets, neon, hung way up)
  const pk = 0.22;
  for (let k = -1; k < 3; k++) {
    const base = Math.floor(cam * pk / 900) + k, px = base * 900 - cam * pk + 300 + hash(base) * 300, py = 110 + hash(base * 3) * 80;
    const col = ['#DB2777', '#2563EB', '#16A34A', '#F59E0B'][((base % 4) + 4) % 4], r = 40 + hash(base * 7) * 30;
    c.fillStyle = mix(col, '#04030C', 0.35); c.beginPath(); c.arc(px, py, r, 0, Math.PI * 2); c.fill();
    c.fillStyle = mix(col, '#FFFFFF', 0.15); c.beginPath(); c.arc(px - r * 0.3, py - r * 0.3, r * 0.45, 0, Math.PI * 2); c.fill();
    if (hash(base * 5) > 0.4) { c.strokeStyle = lite(col, 0.45); c.lineWidth = 3; c.beginPath(); c.ellipse(px, py, r * 1.7, r * 0.35, -0.2, 0, Math.PI * 2); c.stroke(); }
  }
  // (the tableaus, along the ride's track, and the track with the sleds going round)
  // (one in each gap in the flats, held near its middle (drifting a little the far way: it's way back), so its words
  // are never cut off by the flats either side of the gap)
  const tk = 0.4, ty = 420;
  const inGaps: { i: number; mid: number }[] = [];
  GAPS.forEach(([gx, gw], i) => { const mid = gx + gw / 2 - cam; if (mid > -gw && mid < W + gw) inGaps.push({ i, mid }); });
  // (where the airlocks' ceiling crosses a gap, its scene's sat lower: its words came out under the ceiling)
  for (const g of inGaps) {
    const [gx, gw] = GAPS[g.i], low = gx + gw > A + 3900 && gx < A + 4860 ? 52 : 0;
    drawTableau(c, GAP_SCENES[g.i % GAP_SCENES.length], g.mid - 120 - (g.mid - W / 2) * 0.1, ty - 24 + low, f);
  }
  box(c, 0, ty - 6, W, 4, '#1E293B'); box(c, 0, ty - 6, W, 1, '#475569');
  for (let k = 0; k < 12; k++) { const sx = ((k * 90 - cam * tk) % W + W) % W; box(c, sx, ty - 2, 4, 80, '#0F172A'); }
  for (let k = 0; k < 4; k++) {
    const wx = ((f * 1.3 + k * 380) % 1600) - cam * tk;
    const sx = ((wx % 1600) + 1600) % 1600 - 200;
    tinySled(c, sx, ty - 6, 3001 + k * 97, f, 0.5);
  }
  // (the VOYAGE TO 2010 sign, in neon, over it all)
  // (in each gap, over its scene, like the scenes: never cut off by the flats; up clear of the scenes' own words, the
  // airlock sign and the meteor rig's beam)
  const flick = (f % 200) < 3;
  for (const g of inGaps) {
    const nx = g.mid - 110 - (g.mid - W / 2) * 0.06;
    box(c, nx - 4, 98, 228, 34, '#0B0B1E');
    text(c, 'VOYAGE TO 2010', nx + 110, 121, flick ? '#3B0764' : '#F0ABFC', 12, 'center', '#701A75');
  }
  // (the floor of it, down past the track: dark)
  box(c, 0, ty + 70, W, H - ty - 70, '#020108');
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// The backstage (world space)

/** The flats' gaps (the dark ride shows through): [x, w]. */
export const GAPS: [number, number][] = [];
for (let x = A + 280; x < QUEUE_DOOR - 300; x += 880) GAPS.push([x, 300]);
const FLAT_TOP = GY - 460;

/** One stretch of flats (the backs of the sets: plywood on a frame, braced, stenciled), from x for w. Stamped. */
const drawFlats = (c: Ctx, x: number, w: number) => {
  stamp(c, `atom-flats-${Math.round(w)}-${Math.round(x) % 7}`, x, FLAT_TOP - 10, w, GY - FLAT_TOP + 10, g => {
    box(g, x, FLAT_TOP, w, GY - FLAT_TOP, PLY);
    for (let k = 0; k < w; k += 120) {
      box(g, x + k, FLAT_TOP, 2, GY - FLAT_TOP, PLY_DARK);
      // (the frame's rails and its diagonal brace)
      box(g, x + k, FLAT_TOP + 90, Math.min(120, w - k), 6, '#6B5440');
      box(g, x + k, GY - 130, Math.min(120, w - k), 6, '#6B5440');
      g.strokeStyle = '#4A3826'; g.lineWidth = 5; g.beginPath(); g.moveTo(x + k + 6, GY - 10); g.lineTo(x + k + Math.min(110, w - k), FLAT_TOP + 100); g.stroke();
      if (hash(x + k) > 0.55) text(g, ['SET 4B', 'THIS SIDE UP', 'MOON 2', 'HOME OF 2010 (L)', 'DO NOT PAINT'][Math.floor(hash(x * 3 + k) * 5)], x + k + 60, FLAT_TOP + 112, '#2A2016', 6, 'center', null);
    }
    box(g, x, FLAT_TOP, w, 4, PLY_DARK);
  });
};

/** A rig's console: a desk of buttons and lamps on legs (its lamps on while it's crewed). */
const console_ = (c: Ctx, x: number, feet: number, on: boolean, f: number) => {
  box(c, x - 26, feet - 46, 52, 30, INK); box(c, x - 25, feet - 45, 50, 28, '#3F3F46'); box(c, x - 25, feet - 45, 50, 3, '#71717A');
  for (let k = 0; k < 5; k++) box(c, x - 20 + k * 9, feet - 38, 5, 4, on ? ((f >> 3) + k) % 3 ? '#4ADE80' : '#F87171' : '#52525B');
  box(c, x - 20, feet - 16, 4, 16, '#27272A'); box(c, x + 16, feet - 16, 4, 16, '#27272A');
};

/** A rocket, crude (a prop: plywood fins, a garbage-can nose), drawn about its nozzle's mouth, `dir` the way it fires. */
const rocketProp = (c: Ctx, x: number, y: number, dir: 'left' | 'down', len: number, col: string) => {
  c.save(); c.translate(x, y); c.rotate(dir === 'left' ? 0 : -Math.PI / 2);
  // (drawn firing left: the nozzle at the origin, the body off to the right)
  const r = rampOf(col);
  box(c, 0, -14, 16, 28, INK); box(c, 1, -13, 14, 26, '#52525B'); box(c, 1, -13, 14, 3, '#A1A1AA');
  box(c, 14, -30, len - 50, 60, INK); box(c, 15, -29, len - 52, 58, r[2]); box(c, 15, -29, len - 52, 10, r[3]); box(c, 15, 19, len - 52, 10, r[1]);
  c.fillStyle = INK; c.beginPath(); c.moveTo(len - 37, -30); c.lineTo(len, 0); c.lineTo(len - 37, 30); c.closePath(); c.fill();
  c.fillStyle = '#DC2626'; c.beginPath(); c.moveTo(len - 36, -28); c.lineTo(len - 3, 0); c.lineTo(len - 36, 28); c.closePath(); c.fill();
  for (const s of [-1, 1]) { c.fillStyle = INK; c.beginPath(); c.moveTo(16, s * 28); c.lineTo(4, s * 54); c.lineTo(50, s * 28); c.closePath(); c.fill(); c.fillStyle = '#DC2626'; c.beginPath(); c.moveTo(18, s * 29); c.lineTo(8, s * 50); c.lineTo(46, s * 29); c.closePath(); c.fill(); }
  box(c, 40, -6, 60, 12, '#1E3A8A'); text(c, 'USA', 70, 4, '#F8FAFC', 6);
  c.restore();
};

/** A prop meteor (a lump of concrete painted to look like foam: it isn't), at (x, y). */
export const meteor = (c: Ctx, x: number, y: number, r: number, rot: number, warehouse = false) => {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.fillStyle = INK; c.beginPath();
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2, rr = r * (0.82 + hash(i * 7.3) * 0.25) + 1.5; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  c.closePath(); c.fill();
  const col = warehouse ? '#A8A29E' : '#7C2D12';
  c.fillStyle = col; c.beginPath();
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2, rr = r * (0.82 + hash(i * 7.3) * 0.25); c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  c.closePath(); c.fill();
  c.fillStyle = lite(col, 0.25); c.beginPath(); c.arc(-r * 0.3, -r * 0.3, r * 0.4, 0, Math.PI * 2); c.fill();
  for (const [cx, cy, cr] of [[0.3, 0.2, 0.22], [-0.25, 0.35, 0.15], [0.4, -0.35, 0.12]]) { c.fillStyle = dark(col, 0.35); c.beginPath(); c.arc(cx * r, cy * r, cr * r, 0, Math.PI * 2); c.fill(); }
  if (!warehouse) { c.fillStyle = '#F97316'; c.beginPath(); c.arc(r * 0.1, -r * 0.05, r * 0.12, 0, Math.PI * 2); c.fill(); }
  c.restore();
};

export const drawAtomBack = (c: Ctx, state: GameState, hj: Hijack) => {
  const f = state.frame, cam = state.camera.x;
  const on = (x0: number, x1_: number) => x1_ > cam - 100 && x0 < cam + CANVAS_WIDTH + 100;
  // The flats, with the gaps in them
  let fx = A - 200;
  for (const [gx, gw] of GAPS) { if (on(fx, gx)) drawFlats(c, fx, gx - fx); fx = gx + gw; }
  if (on(fx, QUEUE_DOOR)) drawFlats(c, fx, QUEUE_DOOR - fx);
  for (const [gx, gw] of GAPS) if (on(gx, gx + gw)) {
    // (the gap's edges: the flats' raw ends; a rope across: KEEP OUT OF SHOW)
    box(c, gx - 4, FLAT_TOP, 6, GY - FLAT_TOP, PLY_DARK); box(c, gx + gw - 2, FLAT_TOP, 6, GY - FLAT_TOP, PLY_DARK);
    box(c, gx, GY - 70, gw, 3, '#B91C1C');
    text(c, 'SHOW SIDE', gx + gw / 2, GY - 80, '#FCA5A5', 6);
  }
  // (the floor: black-painted concrete, gaffer-taped)
  box(c, Math.max(A - 200, cam - 50), GY, CANVAS_WIDTH + 100, 400, FLOOR);
  box(c, Math.max(A - 200, cam - 50), GY, CANVAS_WIDTH + 100, 3, '#52525B');
  for (let x = Math.floor((cam - 50) / 160) * 160; x < cam + CANVAS_WIDTH + 50; x += 160) box(c, x, GY + 6, 40, 3, '#CA8A04');
  // The stage door (the way back out to the square)
  if (on(A - 100, A + 200)) {
    box(c, A + 10, GY - 150, 80, 150, INK); box(c, A + 14, GY - 146, 72, 146, '#334155');
    sign(c, A + 4, GY - 186, 92, 22, '#FDE047', 'CAST ONLY', '#1C1917', 7);
  }
  // Catwalks and crates (lit top lips: you can stand on them)
  for (const [x, y, w] of LEDGES) if (on(x, x + w)) {
    box(c, x, y, w, 12, INK); box(c, x + 1, y + 1, w - 2, 10, '#52525B'); box(c, x + 1, y + 1, w - 2, 3, '#D4D4D8');
    for (let k = 8; k < w; k += 30) box(c, x + k, y + 12, 3, GY - y - 12, '#27272A');
  }
  for (const [x, top, w] of SOLIDS) if (on(x, x + w) && x !== ROCKET_BODY.x && x < TUNNEL_X) {
    box(c, x, top, w, GY - top, INK); box(c, x + 1, top + 1, w - 2, GY - top - 1, '#92400E'); box(c, x + 1, top + 1, w - 2, 3, '#FBBF24');
    text(c, 'FRAGILE', x + w / 2, top + 30, '#451A03', 5, 'center', null);
  }
  // THE THRUSTERS
  if (on(A + 600, A + 2150)) {
    sign(c, A + 620, GY - 330, 220, 24, '#FDE047', 'THRUSTER TEST: EARS!', '#1C1917', 7);
    const t0 = THRUSTERS[0];
    // (the test stand: the rocket lying on it, its nozzle toward the door)
    box(c, ROCKET_BODY.x + 20, GY - 12, 12, 12, '#3F3F46'); box(c, ROCKET_BODY.x + ROCKET_BODY.w - 40, GY - 12, 12, 12, '#3F3F46');
    rocketProp(c, t0.x, t0.y - 2, 'left', ROCKET_BODY.w + 20, '#E5E7EB');
    box(c, ROCKET_BODY.x, ROCKET_BODY.y, ROCKET_BODY.w, 3, '#F8FAFC');
    // (the gantry: two uprights, a beam across the top, the two hung off it nose-up)
    box(c, A + 1540, GY - 520, 14, 520, '#57534E'); box(c, A + 1980, GY - 520, 14, 520, '#57534E');
    box(c, A + 1540, GY - 530, 454, 16, '#78716C');
    for (const t of THRUSTERS.slice(1)) { box(c, t.x - 2, GY - 514, 4, 84, '#A1A1AA'); rocketProp(c, t.x, t.y, 'down', 170, '#CBD5E1'); }
  }
  // THE METEORS
  if (on(A + 2300, A + 3700)) {
    sign(c, A + 2380, GY - 440, 250, 22, '#F97316', 'METEOR RIG: HARD HATS!', '#1C1917', 7);
    box(c, A + 2420, GY - 410, 940, 14, '#57534E');
    for (const s of SWINGS) {
      const b = swingBall(s, f);
      c.strokeStyle = '#A1A1AA'; c.lineWidth = 2; c.beginPath(); c.moveTo(s.x, s.y); c.lineTo(b.x, b.y); c.stroke();
      box(c, s.x - 6, s.y - 6, 12, 12, '#27272A');
      meteor(c, b.x, b.y, s.r, b.a * 0.6);
    }
    // the shower: its trolley, the cables, the meteors (sat on the floor, or on their way)
    box(c, SHOWER.xs[0] - 40, SHOWER.top - 70, SHOWER.xs[2] - SHOWER.xs[0] + 80, 16, '#57534E');
    text(c, 'METEOR SHOWER', SHOWER.x, SHOWER.top - 76, '#FDBA74', 6);
    const winched = crewed(state, SHOWER.post);
    SHOWER.xs.forEach((x, k) => {
      const s = winched ? showerAt(k, f) : { y: SHOWER.top, tell: 0, falling: false, down: false };
      const cy = s.y - SHOWER.r + (s.tell ? Math.sin(f * 1.7) * 2 : 0);
      c.strokeStyle = '#A1A1AA'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, SHOWER.top - 54); c.lineTo(x, cy - SHOWER.r + 2); c.stroke();
      meteor(c, x + (s.tell ? Math.sin(f * 2.3) * 2 : 0), cy, SHOWER.r, k);
      // (its mark on the floor: where it comes down)
      box(c, x - SHOWER.r, GY - 2, SHOWER.r * 2, 2, s.tell || s.falling ? '#EF4444' : '#7F1D1D');
    });
  }
  // THE AIRLOCKS
  if (on(A + 3750, A + 4900)) {
    sign(c, A + 3800, GY - 400, 240, 22, '#E5E7EB', 'AIRLOCK FX: KEEP CLEAR', '#B91C1C', 7);
    const locked = crewed(state, AIRLOCK_POST);
    // (the space station set's ceiling, the doors' housings)
    box(c, A + 3900, AIRLOCK_TOP - 70, 960, 70, '#334155'); box(c, A + 3900, AIRLOCK_TOP - 4, 960, 4, '#64748B');
    for (const d of AIRLOCKS) {
      const s = airlockAt(d, f, locked), bottom = AIRLOCK_TOP + (GY - AIRLOCK_TOP) * s.down;
      // (the frame, the warning light over it, the slab and its hazard stripes)
      box(c, d.x - 10, AIRLOCK_TOP - 10, 6, GY - AIRLOCK_TOP + 10, '#475569'); box(c, d.x + d.w + 4, AIRLOCK_TOP - 10, 6, GY - AIRLOCK_TOP + 10, '#475569');
      box(c, d.x + d.w / 2 - 8, AIRLOCK_TOP - 40, 16, 12, s.warn > 0 && (f >> 2) % 2 ? '#EF4444' : '#450A0A');
      const top = bottom - (GY - AIRLOCK_TOP);
      c.save(); c.beginPath(); c.rect(d.x - 2, AIRLOCK_TOP - 2, d.w + 4, GY - AIRLOCK_TOP + 2); c.clip();
      box(c, d.x, top, d.w, GY - AIRLOCK_TOP, INK); box(c, d.x + 1, top + 1, d.w - 2, GY - AIRLOCK_TOP - 2, '#94A3B8');
      box(c, d.x + 1, top + 1, 6, GY - AIRLOCK_TOP - 2, '#CBD5E1');
      for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? '#FACC15' : '#1C1917'; c.beginPath(); c.moveTo(d.x + k * 10, bottom - 1); c.lineTo(d.x + k * 10 + 10, bottom - 1); c.lineTo(d.x + k * 10 + 20, bottom - 16); c.lineTo(d.x + k * 10 + 10, bottom - 16); c.closePath(); c.fill(); }
      c.restore();
    }
    // (the air cannon: a big barrel on a stand, its mouth toward the door)
    const cn = cannonAt(f, locked);
    box(c, CANNON.x - 60, GY - 200, 90, 120, INK); box(c, CANNON.x - 58, GY - 198, 86, 116, '#475569');
    c.fillStyle = '#0F172A'; c.beginPath(); c.ellipse(CANNON.x - 60, GY - 140, 14, 56, 0, 0, Math.PI * 2); c.fill();
    if (cn.tell > 0 || cn.blow > 0) { c.strokeStyle = '#94A3B8'; c.lineWidth = 2; const a = f * (0.3 + cn.blow * 0.5); for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(CANNON.x - 60, GY - 140); c.lineTo(CANNON.x - 60 + Math.cos(a + k * 2.1) * 6, GY - 140 + Math.sin(a + k * 2.1) * 48); c.stroke(); } }
    box(c, CANNON.x - 30, GY - 80, 30, 80, '#27272A');
    text(c, 'DECOMPRESSION FX', CANNON.x - 15, GY - 210, '#CBD5E1', 6);
  }
  // THE LASER SHOW: the emitters (the fog machines are drawn with the fog)
  if (on(BLACKLIGHT.x0 - 100, BLACKLIGHT.x1 + 100)) {
    sign(c, A + 5040, GY - 400, 330, 22, '#A855F7', 'CLASS IV LASERS: DON\'T LOOK WITH REMAINING EYE', '#F5F3FF', 6);
    box(c, FLOOR_LASER.x - 6, GY - 90, 26, 90, '#27272A'); box(c, FLOOR_LASER.x - 10, FLOOR_LASER.high - 10, 30, 64, INK); box(c, FLOOR_LASER.x - 8, FLOOR_LASER.high - 8, 26, 60, '#3F3F46');
    box(c, SWEEP_LASER.x - 20, SWEEP_LASER.y - 30, 40, 30, '#3F3F46'); box(c, SWEEP_LASER.x - 3, SWEEP_LASER.y - 200, 6, 170, '#27272A');
    for (const x of FOG_XS) { box(c, x - 22, GY - 26, 44, 26, INK); box(c, x - 21, GY - 25, 42, 24, '#1E293B'); text(c, 'FOG', x, GY - 9, '#64748B', 5, 'center', null); }
  }
  // The posts' consoles
  for (const [post, x, feet] of POSTS) if (on(x - 50, x + 50)) console_(c, x + 30, feet, crewed(state, post), f);
  // THE LINE (and the platform)
  drawQueueBack(c, state, hj);
};

/** The queue's last stretch (out the backstage door into it), the load platform, the operator's console, the sled. */
const drawQueueBack = (c: Ctx, state: GameState, hj: Hijack) => {
  const f = state.frame, cam = state.camera.x;
  if (cam + CANVAS_WIDTH < QUEUE_DOOR - 100) return;
  // (the queue's back wall: carpet-blue, a row of TVs showing the sponsor's ad, the ride's logo)
  box(c, QUEUE_DOOR - 20, GY - 460, TUNNEL_X - QUEUE_DOOR + 260, 460, '#1E3A8A');
  box(c, QUEUE_DOOR - 20, GY - 460, TUNNEL_X - QUEUE_DOOR + 260, 6, '#93C5FD');
  for (let k = 0; k < 5; k++) {
    const tx = LINE_X0 + 40 + k * 150;
    box(c, tx, GY - 340, 100, 70, INK); box(c, tx + 4, GY - 336, 92, 62, (f + k * 40) % 240 < 120 ? '#0EA5E9' : '#F472B6');
    text(c, (f + k * 40) % 240 < 120 ? 'PROGRESSCO' : "WE'RE ON IT", tx + 50, GY - 300, '#0F172A', 6, 'center', null);
  }
  sign(c, LINE_X0 + 130, GY - 420, 420, 30, '#0F172A', 'VOYAGE TO 2010  -  PRESENTED BY PROGRESSCO', '#67E8F9', 8);
  sign(c, LINE_X0 + 20, GY - 220, 170, 20, '#FDE047', 'WAIT FROM HERE: 2 HRS', '#1C1917', 6);
  // (the backstage door he came out of)
  box(c, QUEUE_DOOR - 10, GY - 150, 70, 150, INK); box(c, QUEUE_DOOR - 6, GY - 146, 62, 146, '#3F3F46');
  text(c, 'CAST ONLY', QUEUE_DOOR + 25, GY - 156, '#FDE047', 5);
  // the people in line: the back row, the front row, behind the rail (the one he's thrown into them knocks a few down)
  for (const row of [0, 1] as const) {
    for (const q of QUEUE) {
      if (q.row !== row || q.x < cam - 60 || q.x > cam + CANVAS_WIDTH + 60) continue;
      const down = hj.knocked.has(q.seed);
      c.save(); c.translate(q.x, GY - 6 - (row ? 0 : 14));
      if (down) { c.rotate(-1.4 * (q.seed % 2 ? 1 : -1)); c.translate(0, 10); }
      const near = Math.abs(q.x - (state.player.pos.x + state.player.width / 2)) < 120;
      c.scale(q.seed % 3 ? 1 : -1, 1);
      drawAtomPerson(c, 'guest', { seed: q.seed, f, pose: down ? 'limp' : 'stand', md: down ? 'hurt' : 'ok', talk: hj.barking === q.seed && near });
      c.restore();
    }
    // (the switchback's rails: chrome, between the rows and in front)
    box(c, LINE_X0 - 10, GY - 50 - (row ? 0 : 14), LINE_X1 - LINE_X0 + 20, 4, '#CBD5E1');
  }
  for (let x = LINE_X0; x <= LINE_X1; x += 80) box(c, x, GY - 50, 4, 50, '#94A3B8');
  // The platform: its edge, the yellow line, the console and its big green button
  box(c, PLATFORM_X, GY - 4, TUNNEL_X - PLATFORM_X + 40, 4, '#FACC15');
  box(c, CONSOLE_X - 30, GY - 70, 60, 70, INK); box(c, CONSOLE_X - 28, GY - 68, 56, 66, '#0F766E'); box(c, CONSOLE_X - 28, GY - 68, 56, 4, '#5EEAD4');
  c.fillStyle = INK; c.beginPath(); c.arc(CONSOLE_X + 10, GY - 74, 9, Math.PI, 0); c.fill();
  c.fillStyle = hj.pressT > 0 && hj.pressT < 20 ? '#14532D' : '#22C55E'; c.beginPath(); c.arc(CONSOLE_X + 10, GY - 72 + (hj.pressT > 0 && hj.pressT < 20 ? 3 : 0), 8, Math.PI, 0); c.fill();
  box(c, CONSOLE_X - 20, GY - 60, 10, 6, '#F87171');
  text(c, 'DISPATCH', CONSOLE_X, GY - 40, '#CCFBF1', 5, 'center', null);
  // (the tunnel's mouth past the sled, its sign)
  box(c, TUNNEL_X, GY - 300, 300, 300, '#020617');
  box(c, TUNNEL_X - 10, GY - 320, 24, 320, '#64748B');
  sign(c, TUNNEL_X - 120, GY - 360, 240, 24, '#0F172A', 'TO THE FUTURE  >>', '#F0ABFC', 8);
  // (the operator, at her console, unless the scene's moving her)
  if (!hj.opHidden) {
    c.save(); c.translate(CONSOLE_X - 50, GY);
    drawAtomPerson(c, 'op', { seed: OP_SEED, f, pose: hj.opPose, md: 'ok', talk: hj.said?.who === 'op' });
    c.restore();
  }
};
/** The operator: who she is. */
export const OP_SEED = 5126;

/** The sled at the platform (and the one in front pulling out, and the guests in it, and him), behind and in front. */
export const drawPlatformSleds = (c: Ctx, state: GameState, hj: Hijack, back: boolean) => {
  const f = state.frame;
  if (state.camera.x + CANVAS_WIDTH < PLATFORM_X - 200) return;
  c.save(); c.beginPath(); c.rect(PLATFORM_X - 400, GY - 600, TUNNEL_X + 20 - PLATFORM_X + 400, 700); c.clip();
  // (the one in front, pulling out into the tunnel as he comes up: full of people)
  if (hj.frontX < TUNNEL_X + 200) {
    drawSled(c, hj.frontX, GY, f, FRONT_SLED, true);
    if (!back) {
      for (const [i, s] of [[0, 8811], [1, 9922]] as const) seatedIn(c, hj.frontX + SEATS[i], GY, g => drawAtomPerson(g, 'guest', { seed: s, f, pose: 'stand', md: 'ok' }));
      drawSled(c, hj.frontX, GY, f, FRONT_SLED, false);
    }
  }
  const sx = SLED_X + hj.rolling;
  // (in front of him (the front pass), only the seat backs of the seats guests are still sat in: his seat's back stays
  // behind him, drawn in the back pass)
  drawSled(c, sx, GY, f, HIS_SLED, true, 0, false, back ? [0, 1] : [hj.frontOut ? -1 : 0, hj.backOut ? -1 : 1].filter(i => i >= 0));
  if (!back) {
    // (the guests in it, till they're out)
    if (!hj.frontOut) seatedIn(c, sx + SEATS[0], GY, g => drawAtomPerson(g, 'guest', { seed: GUEST_SEEDS[0], f, pose: 'stand', md: 'ok', talk: hj.said?.who === 'g0' }));
    if (!hj.backOut) seatedIn(c, sx + SEATS[1], GY, g => drawAtomPerson(g, 'guest', { seed: GUEST_SEEDS[1], f, pose: 'stand', md: 'ok', talk: hj.said?.who === 'g1' }));
    drawSled(c, sx, GY, f, HIS_SLED, false);
  }
  c.restore();
  if (!back) {
    // (the thrown one, over the rail; the one walking off)
    for (const g of hj.flying) { c.save(); c.translate(g.x, g.y); c.rotate(g.rot); drawAtomPerson(c, 'guest', { seed: g.seed, f, pose: g.landed ? 'limp' : 'thrown', md: 'hurt', talk: hj.said?.who === 'g0' }); c.restore(); }
    if (hj.walker) { c.save(); c.translate(hj.walker.x, GY); c.scale(-1, 1); drawAtomPerson(c, 'guest', { seed: GUEST_SEEDS[1], f, pose: 'walk', md: 'ok', talk: hj.said?.who === 'g1' }); c.restore(); }
  }
};
export const GUEST_SEEDS = [6402, 7313] as const;

// ---------------------------------------------------------------------------------------------------------------
// The front: what glows

/** The fog (the laser show's machines): puffs drifting, kept here (just the look). */
const fog: { x: number; y: number; r: number; t: number; vx: number }[] = [];
export const drawAtomFront = (c: Ctx, state: GameState, hj: Hijack) => {
  const f = state.frame, cam = state.camera.x;
  const on = (x0: number, x1_: number) => x1_ > cam - 100 && x0 < cam + CANVAS_WIDTH + 100;
  // The flames
  for (const t of THRUSTERS) {
    if (!crewed(state, t.post) || !on(t.x - t.len, t.x + t.len)) continue;
    const s = thrustAt(t, f);
    if (!s.fire) continue;
    const fb = flameBox(t);
    const wob = Math.sin(f * 1.3) * 4;
    if (t.dir === 'left') {
      c.fillStyle = '#F97316'; c.beginPath(); c.moveTo(t.x, t.y - fb.h / 2); c.lineTo(fb.x + wob, t.y); c.lineTo(t.x, t.y + fb.h / 2); c.closePath(); c.fill();
      c.fillStyle = '#FDE047'; c.beginPath(); c.moveTo(t.x, t.y - fb.h / 3); c.lineTo(fb.x + fb.w * 0.35 + wob, t.y); c.lineTo(t.x, t.y + fb.h / 3); c.closePath(); c.fill();
      c.fillStyle = '#FFFBEB'; c.beginPath(); c.moveTo(t.x, t.y - 6); c.lineTo(t.x - 60, t.y); c.lineTo(t.x, t.y + 6); c.closePath(); c.fill();
    } else {
      c.fillStyle = '#F97316'; c.beginPath(); c.moveTo(t.x - fb.w / 2, t.y); c.lineTo(t.x + wob, t.y + fb.h); c.lineTo(t.x + fb.w / 2, t.y); c.closePath(); c.fill();
      box(c, t.x - fb.w / 2 - 20, GY - 24, fb.w + 40, 24, '#F97316');
      c.fillStyle = '#FDE047'; c.beginPath(); c.moveTo(t.x - fb.w / 3, t.y); c.lineTo(t.x + wob, t.y + fb.h * 0.8); c.lineTo(t.x + fb.w / 3, t.y); c.closePath(); c.fill();
    }
  }
  // The lasers
  const lit = crewed(state, LASER_POST);
  if (lit && on(FLOOR_LASER.from, FLOOR_LASER.x)) {
    const s = floorLaserAt(f, lit), y = s.high ? FLOOR_LASER.high : FLOOR_LASER.low;
    if (s.on) { box(c, FLOOR_LASER.from, y - 3, FLOOR_LASER.x - FLOOR_LASER.from, 6, 'rgba(34, 197, 94, 0.35)'); box(c, FLOOR_LASER.from, y - 1, FLOOR_LASER.x - FLOOR_LASER.from, 2, '#BBF7D0'); }
    else if (s.tell > 0) for (let x = FLOOR_LASER.x - 8; x > FLOOR_LASER.from; x -= 14) if ((x + f * 3) % 28 < 14) box(c, x, y - 1, 6, 1, '#4ADE80');
    box(c, FLOOR_LASER.x - 8, y - 4, 8, 8, s.on || s.tell > 0 ? '#86EFAC' : '#14532D');
  }
  if (lit && on(SWEEP_LASER.x0 - 100, SWEEP_LASER.x + 50)) {
    const sx = sweepSpot(f), sw = sweepState(f);
    // (on the blink: dead, just the emitter's dull red eye; sputtering, a thin flicker of it, a tell; live, the beam)
    if (!sw.live) {
      if (sw.sputter) { c.strokeStyle = 'rgba(254, 202, 202, 0.55)'; c.lineWidth = 1; c.setLineDash([6, 10]); c.lineDashOffset = -f * 3; c.beginPath(); c.moveTo(SWEEP_LASER.x, SWEEP_LASER.y); c.lineTo(sx, GY); c.stroke(); c.setLineDash([]); }
      box(c, SWEEP_LASER.x - 4, SWEEP_LASER.y - 2, 8, 4, sw.sputter ? '#FCA5A5' : '#7F1D1D');
    } else {
    c.strokeStyle = 'rgba(239, 68, 68, 0.35)'; c.lineWidth = 6; c.beginPath(); c.moveTo(SWEEP_LASER.x, SWEEP_LASER.y); c.lineTo(sx, GY); c.stroke();
    c.strokeStyle = '#FECACA'; c.lineWidth = 2; c.beginPath(); c.moveTo(SWEEP_LASER.x, SWEEP_LASER.y); c.lineTo(sx, GY); c.stroke();
    box(c, sx - 10, GY - 3, 20, 3, '#FCA5A5');
    }
  }
  // The fog (it's what the lasers show up in)
  if (on(BLACKLIGHT.x0 - 200, BLACKLIGHT.x1 + 200)) {
    if (f % 10 === 0) for (const x of FOG_XS) fog.push({ x, y: GY - 16, r: 12, t: 0, vx: 0.4 + hash(f + x) * 0.8 });
  }
  for (let i = fog.length - 1; i >= 0; i--) {
    const p = fog[i]; p.t++; p.x += p.vx; p.y -= 0.05; p.r += 0.22;
    if (p.t > 300) { fog.splice(i, 1); continue; }
    if (!on(p.x - p.r, p.x + p.r)) continue;
    c.fillStyle = `rgba(196, 181, 253, ${0.12 * (1 - p.t / 300)})`; c.beginPath(); c.arc(p.x, p.y, p.r, 0, Math.PI * 2); c.fill();
  }
  // The air cannon's blast
  const cn = cannonAt(f, crewed(state, AIRLOCK_POST));
  if (cn.blow > 0 && on(CANNON.from, CANNON.x)) for (let k = 0; k < 10; k++) {
    const y = GY - 20 - hash(k * 3.1) * 220, x = CANNON.x - 60 - ((f * 22 + k * 97) % (CANNON.x - CANNON.from));
    box(c, x, y, 40 + hash(k) * 30, 2, `rgba(226, 232, 240, ${0.35 * cn.blow})`);
  }
  // (the queue's front rail: in front of the line, behind him)
  if (on(LINE_X0, LINE_X1)) box(c, LINE_X0 - 10, GY - 34, LINE_X1 - LINE_X0 + 20, 4, '#E2E8F0');
  // What's being said in the scene
  if (hj.said) saidOver(c, hj.said.s.text, hj.said.x, hj.said.y, hj.said.who === 'op' ? '#99F6E4' : '#FDE68A');
};

// ---------------------------------------------------------------------------------------------------------------
// The lighting: dark backstage, work lamps over each rig, what glows; the queue lit up

export const atomLighting = (state: GameState): SceneLight => {
  const f = state.frame, cam = state.camera.x, lights: Light[] = [];
  const near = (x: number) => x > cam - 300 && x < cam + CANVAS_WIDTH + 300;
  // (work lamps: a cone down off the grid every so often, and over each rig)
  for (let x = A + 200; x < QUEUE_DOOR; x += 420) if (near(x)) lights.push({ x, y: GY - 440, r: 420, a: 0.55, cone: 120, color: 'rgba(191, 219, 254, 0.06)' });
  for (const t of THRUSTERS) if (near(t.x) && crewed(state, t.post)) {
    const s = thrustAt(t, f), fb = flameBox(t);
    if (s.fire) lights.push({ x: fb.x + fb.w / 2, y: fb.y + fb.h / 2, r: 320, a: 1, color: 'rgba(251, 146, 60, 0.25)' });
    else if (s.tell > 0) lights.push({ x: t.x, y: t.y, r: 90, a: 0.6 * s.tell, color: 'rgba(253, 224, 71, 0.2)' });
  }
  for (const d of AIRLOCKS) if (near(d.x)) { const s = airlockAt(d, f, crewed(state, AIRLOCK_POST)); if (s.warn > 0) lights.push({ x: d.x + d.w / 2, y: AIRLOCK_TOP - 34, r: 160, a: (f >> 2) % 2 ? 0.9 : 0.3, color: 'rgba(239, 68, 68, 0.2)' }); }
  if (near(BLACKLIGHT.x0) || near(BLACKLIGHT.x1)) {
    for (let x = BLACKLIGHT.x0 + 100; x < BLACKLIGHT.x1; x += 260) lights.push({ x, y: GY - 300, r: 340, a: 0.7, color: 'rgba(147, 51, 234, 0.16)' });
    if (crewed(state, LASER_POST)) {
      const s = floorLaserAt(f, true);
      if (s.on) for (let x = FLOOR_LASER.from; x < FLOOR_LASER.x; x += 110) lights.push({ x, y: s.high ? FLOOR_LASER.high : FLOOR_LASER.low, r: 70, a: 0.8, color: 'rgba(74, 222, 128, 0.2)' });
      if (sweepState(f).live) lights.push({ x: sweepSpot(f), y: GY - 10, r: 80, a: 0.9, color: 'rgba(248, 113, 113, 0.25)' });
    }
  }
  for (const [post, x, feet] of POSTS) if (near(x)) lights.push({ x: x + 30, y: feet - 40, r: 110, a: crewed(state, post) ? 0.7 : 0.3, color: 'rgba(74, 222, 128, 0.08)' });
  // (the queue: lit for the guests)
  if (near(QUEUE_DOOR) || near(TUNNEL_X)) for (let x = LINE_X0; x < TUNNEL_X + 100; x += 200) lights.push({ x, y: GY - 400, r: 520, a: 0.9, cone: 220, color: 'rgba(224, 242, 254, 0.08)' });
  // (the queue's signs lit up: up over the downlights, they were black on black)
  if (near(LINE_X0 + 340)) lights.push({ x: LINE_X0 + 340, y: GY - 405, r: 300, a: 0.85, color: 'rgba(103, 232, 249, 0.08)' });
  if (near(TUNNEL_X)) lights.push({ x: TUNNEL_X, y: GY - 348, r: 200, a: 0.85, color: 'rgba(240, 171, 252, 0.08)' });
  // (enough round him that he's never lost in it)
  const p = state.player;
  lights.push({ x: p.pos.x + p.width / 2, y: p.pos.y + 20, r: 200, a: 0.6 });
  return { dark: 0.6, shade: [6, 4, 18], lights, rim: 0.5 };
};

export { x1 as ATOM_X1 };
