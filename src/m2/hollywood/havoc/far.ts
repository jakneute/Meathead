// The havoc's far off (screen space; the backdrop): the backlot's own far layers by the hour (blvd/far.ts and lot/far.ts:
// the mountains, the HAPPYWOOD hill, the foothills, the city, the studio lot, the palms, the backlot's soundstages
// nearest), each on its own ground where the one eye puts it and dropping away under him as he climbs, by how near it
// is; under the real disasters' sky (the lot's: gone red with ash). The HAPPYWOOD hill far off erupting (the crater's
// stepped glow, lava down its shoulders a cell at a time, the plume going up in stepped puffs, bombs arcing) till he's up
// on it (it sinks away behind the city as he climbs); the city burning (the lot's smoke); the backlot's soundstages
// burning (scorched, their roofs holed, fire along them, smoke columns leaning off). The storm's clouds rolling over in
// two banks, dark, lit red from under, painted once for the hour and slid along. The weather: ash all over; snow on the
// hill and after; the blizzard down the hill (banded whiteout, driving snow); lightning now and then (a stepped bolt with
// its glow, the sky lit in bands). Spent (the revisit): a gray ash sky, the fires out, the smoke thin, a little ash.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky, type TimeOfDay } from '../../timeOfDay';
import { mist } from '../../adventure/farArt';
import { FAR, tile, farCol, paintMountains, paintFoothills, drawHill, paintCity, paintLot, paintPalms, HILL, hillY } from '../blvd/far';
import { paintStages, smoke, stageRoofs, STAGES } from '../lot/far';
import { HWX, GY } from '../geometry';
import { type Ctx, INK, box, checker, mix, hash, hazeBands as hazeBandsOf, bandedGradient as bandedOf, pixelBlob, steppedGlow, timeOfDay, skyAt } from '../blvd/kit';
import { FIRE } from '../disaster/paint';
import { R, DOWNHILL, CLIMB } from './layout';
import { spent } from './hazards';
import { LAVA_R, flame } from './paint';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
/** The camera's rest (y), the eye's line on screen at rest, how far the play plane's ground is under it. */
const CAM_REST = GY - 550, EYE = 252, REST = 298;
const groundAt = (k: number) => EYE + REST * k;
/** How far each layer sits back (the lot's own). */
const K = { mtn: 0.003, hill: 0.004, foot: 0.008, city: 0.022, lot: 0.055, palms: 0.11, stages: 0.3 } as const;

/** The real disasters' sky (the lot's), top to horizon; spent, gray with ash. */
const RED_SKY = ['#2A0808', '#4A0E0C', '#74180E', '#A02C10', '#C84A16', '#E07A34'];
const ASH_SKY = ['#1E1C1E', '#322E2E', '#48423E', '#5E5852', '#78726A', '#948C82'];

// ---------------------------------------------------------------------------------------------------------------
// The storm's clouds (a tile painted once for the hour)

const CW = 1024, CHT = 190;
const paintClouds = (g: Ctx, tod: TimeOfDay, ash: boolean, seed: number) => {
  const T = farCol(tod, 0.05);
  const body = ash ? ['#1E1C1E', '#2C2828', '#3C3634', '#524A46'] : ['#1A0C0C', '#2A1412', '#3E1C16', '#5A2618'];
  const under = ash ? ['#5A524C', '#7A706A'] : ['#9A3414', '#D45A1C'];
  for (let i = 0; i < 26; i++) {
    const cx = hash(seed + i * 1.37) * CW, cy = 40 + hash(seed + i * 2.11) * 90, rw = 60 + hash(seed + i * 3.3) * 90, rh = 18 + hash(seed + i * 4.7) * 22;
    for (const ox of [0, CW, -CW]) {
      const x = cx + ox;
      if (x + rw < -10 || x - rw > CW + 10) continue;
      // (lit from under by the fires: the underside first, then the body over it, the top's dark)
      pixelBlob(g, x, cy + rh * 0.45, rw * 0.92, rh * 0.7, T(under[0]));
      pixelBlob(g, x - rw * 0.08, cy + rh * 0.52, rw * 0.6, rh * 0.4, T(under[1]));
      pixelBlob(g, x, cy, rw, rh, T(body[1]));
      pixelBlob(g, x + rw * 0.1, cy - rh * 0.25, rw * 0.7, rh * 0.6, T(body[2]));
      pixelBlob(g, x - rw * 0.2, cy - rh * 0.45, rw * 0.4, rh * 0.35, T(body[3]));
      pixelBlob(g, x + rw * 0.3, cy + rh * 0.1, rw * 0.5, rh * 0.5, T(body[0]));
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The backlot's soundstages, burning (the lot's tile, scorched)

const { SW, SH, SG } = STAGES;
const ROOFS = stageRoofs();
const burning = (i: number) => hash(i * 5.5 + 2) > 0.3;
const paintBurnt = (g: Ctx, tod: TimeOfDay, done: boolean) => {
  paintStages(g, tod);
  const T = farCol(tod, 0.1), f = SH - SG, soot = T('#140C0A'), soot2 = T('#2A1C18');
  for (const s of ROOFS) {
    const { x, w, h } = s;
    // (soot up the walls from the doors and windows: stepped plumes, dithered at their edges)
    for (let k = 0; k < 4; k++) {
      const sx = x + w * (0.2 + k * 0.2), base = f - 12 - hash(s.i * 3 + k) * (h - 50), ph = 30 + hash(s.i + k * 7) * 50;
      for (let r = 0; r < ph; r += 4) { const hw = 6 + r * 0.35; box(g, sx - hw, base - r, hw * 2, 4, r < ph * 0.6 ? soot2 : soot); }
      checker(g, sx - 20, base - ph - 6, 40, 8, soot2, 0, 2);
    }
    // (the roof holed where it's burnt through: jagged, dark, its rafters showing)
    if (burning(s.i) || done) {
      const hx = x + w * (0.3 + hash(s.i * 9) * 0.3), hw2 = 30 + hash(s.i * 4) * 30;
      const roofY = (px: number) => f - h - 24 * (1 - Math.abs(px - (x + w / 2)) / (w / 2));
      g.fillStyle = soot; g.beginPath(); g.moveTo(hx, roofY(hx) + 1);
      for (let k = 0; k <= 6; k++) { const px = hx + (hw2 * k) / 6; g.lineTo(px, roofY(px) + 2 + (k % 2 ? 7 : 2) + hash(k + s.i) * 4); }
      g.lineTo(hx + hw2, roofY(hx + hw2) + 1); g.closePath(); g.fill();
      for (let k = 6; k < hw2; k += 9) box(g, hx + k, roofY(hx + k) - 1, 2, 9, T('#3A2A22'));
    }
    // (the windows blown out: dark)
    for (let k = 0; k < 4; k++) if (hash(s.i * 7 + k) > 0.4) box(g, x + w * 0.46 + k * 16, f - h + 10, 8, 6, soot);
  }
  void INK;
};

/** Where each burning roof is (screen), for the fires and smoke live over the tile. */
const stageFires = (c: Ctx, off: number, top: number, f: number, done: boolean) => {
  const base = -((((off) % SW) + SW) % SW);
  for (let tx = base; tx < W; tx += SW) for (const s of ROOFS) {
    if (!burning(s.i)) continue;
    const x0 = tx + s.x, eave = top + SH - SG - s.h;
    if (x0 + s.w < -60 || x0 > W + 60) continue;
    const roofY = (px: number) => eave - 24 * (1 - Math.abs(px - (x0 + s.w / 2)) / (s.w / 2));
    if (done) { smokeWisp(c, x0 + s.w * 0.45, roofY(x0 + s.w * 0.45), f, s.i); continue; }
    // (smoke going up off it, leaning off with the wind; the fire along the roof)
    smoke(c, x0 + s.w * 0.5, roofY(x0 + s.w * 0.5) - 6, f, s.i + 3);
    const n = 3 + (s.i % 3);
    for (let j = 0; j < n; j++) {
      const px = x0 + s.w * (0.18 + (j / n) * 0.66) + (hash(s.i * 3 + j) - 0.5) * 20;
      flame(c, px, roofY(px) + 2, 12 + hash(s.i + j) * 10, 16 + hash(j * 2 + s.i) * 18, f, s.i * 11 + j);
    }
    // (out of a window or the elephant door)
    flame(c, x0 + s.w * 0.58, eave + 16, 10, 14, f, s.i + 40);
  }
};
const smokeWisp = (c: Ctx, x: number, y: number, f: number, seed: number) => {
  for (let k = 0; k < 4; k++) { const t = ((f * 0.3 + k * 50 + seed * 31) % 200) / 200, r = 3 + t * 12; c.fillStyle = `rgba(90, 86, 84, ${(0.28 * (1 - t)).toFixed(2)})`; c.fillRect(Math.round(x - r + t * 30), Math.round(y - t * 120), Math.round(r * 2), Math.round(r)); }
};

// ---------------------------------------------------------------------------------------------------------------
// The HAPPYWOOD hill erupting

const { HW, HHT } = HILL;
/** The crater (on the summit, by the mast) and the flows down its shoulders, along the crest then down: tile x's. */
const SUMMIT = HW * 0.42;
const flowPath = (dir: 1 | -1) => {
  const pts: [number, number][] = [];
  const end = dir < 0 ? HW * 0.08 : HW * 0.9;
  for (let x = SUMMIT; dir < 0 ? x > end : x < end; x += dir * 4) {
    const u = Math.abs(x - SUMMIT) / Math.abs(end - SUMMIT);
    // (along the crest to past the letters, then down the shoulder to the foot)
    const crest = hillY(x) + 3, down = Math.max(0, (u - 0.55) / 0.45);
    pts.push([x, crest + down * down * (HHT - crest - 10)]);
  }
  return pts;
};
const FLOWS = [flowPath(-1), flowPath(1)];
const eruption = (c: Ctx, hx: number, foot: number, f: number) => {
  const ox = hx - HW / 2, oy = foot - HHT, sx = ox + SUMMIT, sy = oy + hillY(SUMMIT);
  // (the crater's glow, stepped)
  steppedGlow(c, sx, sy - 4, 46 + Math.sin(f * 0.1) * 4, '#F97316', 0.55, 0, 5);
  // (the plume: stepped puffs boiling up, lit orange from under at its foot, going gray as it climbs and spreads)
  for (let k = 0; k < 12; k++) {
    const t = ((f * 0.35 + k * 17) % 204) / 204, r = 8 + t * 46;
    const px = sx + Math.sin(t * 5 + k) * 8 + t * t * 90, py = sy - 10 - t * 230;
    const a = 0.78 * (1 - t * 0.7);
    c.fillStyle = `rgba(30, 22, 22, ${a.toFixed(2)})`; c.fillRect(Math.round(px - r), Math.round(py - r * 0.6), Math.round(r * 2), Math.round(r * 1.2));
    c.fillStyle = `rgba(62, 48, 46, ${(a * 0.9).toFixed(2)})`; c.fillRect(Math.round(px - r * 0.75), Math.round(py - r * 0.6), Math.round(r * 1.3), Math.round(r * 0.5));
    if (t < 0.35) { c.fillStyle = `rgba(232, 96, 30, ${(0.5 * (1 - t / 0.35)).toFixed(2)})`; c.fillRect(Math.round(px - r * 0.8), Math.round(py + r * 0.2), Math.round(r * 1.6), Math.max(2, Math.round(r * 0.35))); }
  }
  // (the lava down its shoulders: a cell at a time, the crust at its edges, hot in its middle, a pulse running down)
  for (const path of FLOWS) {
    const n = path.length;
    for (let i = 0; i < n; i++) {
      const [px, py] = path[i], X0 = Math.round(ox + px), Y0 = Math.round(oy + py), w = i < n * 0.5 ? 3 : 4;
      box(c, X0 - 1, Y0 - 1, 5, w + 2, LAVA_R[1]);
      const hot = Math.sin(i * 0.35 - f * 0.18) > 0.6;
      box(c, X0, Y0, 3, w, hot ? LAVA_R[5] : LAVA_R[3]);
      if (i % 3 === 0) box(c, X0 + 1, Y0, 1, 1, LAVA_R[6]);
    }
  }
  // (bombs arcing out of the crater)
  for (let k = 0; k < 5; k++) {
    const t = ((f * 0.9 + k * 41) % 90) / 90, dir = k % 2 ? 1 : -1, vx = dir * (20 + k * 9);
    const bx = sx + vx * t * 2, by = sy - 70 * Math.sin(Math.PI * t) - 0 * t;
    box(c, bx - 1, by - 1, 4, 4, LAVA_R[2]); box(c, bx, by, 2, 2, LAVA_R[5]);
    box(c, bx - dir * 3, by + 1, 2, 1, `rgba(60, 40, 40, ${(0.5 * (1 - t)).toFixed(2)})`);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The weather

const lightning = (c: Ctx, f: number, hz: number) => {
  const lt = f % 260, cyc = Math.floor(f / 260);
  if (lt >= 7 || (cyc * 7) % 3 === 0) return;
  // (the sky lit, in bands: brighter up top, the first frames whiter)
  hazeBandsOf(c, 0, 0, W, Math.round(hz), '#FFF4E8', lt < 2 ? 0.42 : 0.18, lt < 2 ? 0.12 : 0.04, 5);
  if (lt > 4) return;
  // (the bolt: jagged, stepped, its branches; a wide dim glow, a bright body, a white core)
  const pts: [number, number][] = [];
  let bx = 120 + ((cyc * 211) % 560), by = 0;
  pts.push([bx, by]);
  while (by < hz - 80) { bx += ((((by * 13 + cyc * 7) % 50) + 50) % 50) - 25; by += 22 + ((by + cyc) % 3) * 8; pts.push([bx, by]); }
  const branch: [number, number][] = [];
  const mid = pts[Math.floor(pts.length * 0.4)];
  if (mid) { let x = mid[0], y = mid[1]; branch.push([x, y]); for (let k = 0; k < 4; k++) { x += 14 + k * 3; y += 20; branch.push([x, y]); } }
  for (const [w, col] of [[9, 'rgba(255, 210, 160, 0.22)'], [5, 'rgba(255, 236, 210, 0.55)'], [2, '#FFFFFF']] as const) {
    c.strokeStyle = col; c.lineWidth = w; c.lineJoin = 'miter'; c.lineCap = 'square';
    for (const line of [pts, branch]) { if (line.length < 2) continue; c.beginPath(); line.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); }
  }
  c.lineCap = 'butt';
};

const weather = (c: Ctx, f: number, cam: number, rx: number, done: boolean) => {
  const snow = rx > CLIMB.b - 200, ash = rx < CLIMB.b + 800 || rx > DOWNHILL.b + 200 || done;
  const bliz = !done && rx > DOWNHILL.a - 200 && rx < DOWNHILL.b + 200;
  // (ash: stepped flakes, drifting, a darker pixel off each fifth)
  if (ash) {
    const n = done ? 16 : 44;
    for (let k = 0; k < n; k++) {
      const ax = ((k * 97 + f * (0.6 + (k % 3) * 0.4) + Math.sin(f * 0.02 + k) * 20 - cam * 0.3) % 820 + 820) % 820 - 10, ay = ((k * 151 + f * (0.9 + (k % 4) * 0.2)) % 620) - 10;
      box(c, ax, ay, 2, 2, k % 3 ? '#B8B0A8' : '#E8E2DA');
      if (k % 5 === 0) box(c, ax + 2, ay + 1, 1, 1, '#8A827C');
    }
  }
  // (the blizzard: the far off whited out in bands, thick at the horizon)
  if (bliz) { hazeBandsOf(c, 0, 0, W, H, '#E2E8F0', 0.12, 0.42, 6); }
  if (snow && !done) {
    const m = bliz ? 120 : 50, drift = bliz ? 5 : 1.5;
    for (let k = 0; k < m; k++) {
      const sx = ((k * 131 + f * (drift + (k % 3)) - cam * 0.5) % 820 + 820) % 820 - 10, sy = ((k * 211 + f * (2 + (k % 2))) % 620) - 10, s = k % 4 === 0 ? 3 : 2;
      box(c, sx, sy, s, s, k % 5 ? '#F8FAFC' : '#C8D4E4');
    }
    if (bliz) { c.strokeStyle = 'rgba(248, 250, 252, 0.4)'; c.lineWidth = 1; c.beginPath(); for (let k = 0; k < 24; k++) { const sx = ((k * 173 + f * 9) % 860) - 30, sy = (k * 97 + f * 3) % 600; c.moveTo(sx, sy); c.lineTo(sx + 26, sy + 8); } c.stroke(); }
  }
};

// ---------------------------------------------------------------------------------------------------------------

export const drawHavocFar = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), cam = state.camera.x, f = state.frame, done = spent(state);
  const rx = R(cam + W / 2);
  const up = CAM_REST - state.camera.y;
  const drop = (k: number) => Math.round(up * k);
  const hz = EYE - 8 + Math.round(up * 0.002);
  drawTodSky(c, 0, 0, W, H, done ? ASH_SKY : RED_SKY, { bands: 16, horizon: hz + 20, sun: [620, 90], moon: [160, 70], t: f, scroll: cam * 0.02 });
  hazeBandsOf(c, 0, Math.round(hz - 150), W, 160, done ? '#8A8278' : '#C84A16', 0, 0.3, 7);
  // (the storm's clouds: two banks rolling over, the far one slower)
  const ck = done ? 'a' : 'r';
  tile(c, `hh-clouds1-${tod.key}-${ck}`, cam * 0.02 + f * 0.25, -20, CHT, CW, g => paintClouds(g, tod, done, 3));
  tile(c, `hh-clouds2-${tod.key}-${ck}`, cam * 0.05 + f * 0.6 + 400, 40, CHT, CW, g => paintClouds(g, tod, done, 17));
  const under = (y: number, k: number, base: string) => {
    if (y >= H) return;
    const T2 = farCol(tod, k);
    bandedOf(c, 0, Math.round(y), W, H - Math.round(y), [T2(base), T2(mix(base, '#3A3236', 0.18)), T2(mix(base, '#3A3236', 0.32))], 4);
  };
  tile(c, `hb-mtn-${tod.key}`, cam * K.mtn + 300, groundAt(K.mtn) - FAR.MH + 10 + drop(K.mtn), FAR.MH, FAR.TW, g => paintMountains(g, tod));
  // (the HAPPYWOOD hill, erupting, till he's up on it: it sinks away behind the city as he climbs)
  const sink = Math.max(0, Math.min(1, (rx - 6000) / 2200)) * 330;
  if (sink < 330) {
    const hx = 560 - (cam - HWX) * K.hill, foot = groundAt(K.hill) + 6 + drop(K.hill) + sink;
    drawHill(c, hx, foot, f);
    if (!done) eruption(c, hx, foot, f);
    else smokeWisp(c, hx - HW / 2 + SUMMIT, foot - HHT + hillY(SUMMIT) - 6, f, 9);
  }
  tile(c, `hb-foot-${tod.key}`, cam * K.foot + 140, groundAt(K.foot) - FAR.FH + 26 + drop(K.foot), FAR.FH, FAR.TW, g => paintFoothills(g, tod));
  under(groundAt(K.foot) + 26 + drop(K.foot), 0.34, '#8A8A6A');
  const cityY = groundAt(K.city) - (FAR.CH - FAR.CG) + drop(K.city);
  tile(c, `hb-city-${tod.key}`, cam * K.city + 520, cityY, FAR.CH, FAR.TW, g => paintCity(g, tod));
  under(groundAt(K.city) + FAR.CG + drop(K.city), 0.42, '#8A8070');
  // (the city burning: smoke going up off it in stepped puffs, the horizon glowing; spent, wisps)
  for (let k = 0; k < 5; k++) {
    const sx = ((k * 211 + 90 - cam * K.city) % 900 + 900) % 900 - 50, sy = groundAt(K.city) + drop(K.city);
    if (done) smokeWisp(c, sx, sy, f, k); else smoke(c, sx, sy, f, k);
  }
  tile(c, `hb-lot-${tod.key}`, cam * K.lot + 1000, groundAt(K.lot) - (FAR.SH - FAR.SG) + drop(K.lot), FAR.SH, FAR.LW, g => paintLot(g, tod));
  under(groundAt(K.lot) + FAR.SG + drop(K.lot), 0.2, '#6A6466');
  tile(c, `hb-palms-${tod.key}`, cam * K.palms + 900, groundAt(K.palms) - (FAR.PH - FAR.PG) + drop(K.palms), FAR.PH, FAR.PW, g => paintPalms(g, tod));
  under(groundAt(K.palms) + FAR.PG + drop(K.palms), 0.12, '#6E6668');
  // (the backlot's soundstages nearest: scorched, holed, burning)
  const sTop = groundAt(K.stages) - (SH - SG) + drop(K.stages), sOff = cam * K.stages + 300;
  tile(c, `hh-stages-${tod.key}-${done ? 1 : 0}`, sOff, sTop, SH, SW, g => paintBurnt(g, tod, done));
  stageFires(c, sOff, sTop, f, done);
  under(groundAt(K.stages) + SG + drop(K.stages), 0.05, '#58525A');
  mist(c, W, Math.round(groundAt(K.stages) + drop(K.stages) - 40), 40, skyAt(0.9, tod), 0, 0.1, 3);
  // (the whole far off reddened, in bands, heavier up top; spent, grayed)
  hazeBandsOf(c, 0, 0, W, Math.round(groundAt(K.stages) + drop(K.stages)), done ? '#3A3634' : '#7F1D1D', done ? 0.22 : 0.3, 0.1, 6);
  // The weather, the lightning
  weather(c, f, cam, rx, done);
  if (!done) lightning(c, f, hz + drop(K.city));
  void FIRE; void INK; void checker;
  return true;
};
