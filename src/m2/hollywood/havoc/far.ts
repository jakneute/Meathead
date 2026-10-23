// The havoc's far off (screen space; the backdrop): the backlot's own far layers by the hour (blvd/far.ts and lot/far.ts:
// the mountains, the HAPPYWOOD hill, the foothills, the city, the studio lot, the palms, the backlot's soundstages
// nearest), each on its own ground where the one eye puts it and dropping away under him as he climbs, by how near it
// is; under the real disasters' sky (the lot's: gone red with ash). The HAPPYWOOD hill far off burning (the quake's
// fissure across it glowing, brush fires raging across its slopes, smoke going up off them, the letters on fire) till he's up
// on it (it sinks away behind the city as he climbs); the city burning (the lot's smoke); the backlot's soundstages
// wrecked (farWreck.ts: roofs holed, a corner fallen in, a wall caved, doors and windows blown, soot, rubble; fire along
// them, smoke columns leaning off, smoldering spots). The storm's clouds rolling over in
// two banks, dark, lit red from under, painted once for the hour and slid along. The weather: ash all over; snow on the
// hill and after; the blizzard down the hill (banded whiteout, driving snow); lightning now and then (a stepped bolt with
// its glow, the sky lit in bands). Spent (the revisit): a gray ash sky, the fires out, the smoke thin, a little ash.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky, type TimeOfDay } from '../../timeOfDay';
import { mist } from '../../adventure/farArt';
import { FAR, tile, farCol, paintMountains, paintFoothills, drawHill, paintCity, paintLot, paintPalms, HILL, hillY } from '../blvd/far';
import { smoke, STAGES, roadUnder } from '../lot/far';
import { paintWrecked, wreckFires } from './farWreck';
import { HWX, GY } from '../geometry';
import { type Ctx, INK, box, checker, mix, hash, hazeBands as hazeBandsOf, bandedGradient as bandedOf, pixelBlob, steppedGlow, timeOfDay, skyAt } from '../blvd/kit';
import { FIRE } from '../disaster/paint';
import { R, DOWNHILL, CLIMB } from './layout';
import { spent } from './hazards';
import { flame } from './paint';
import { drawHwSky, drawHwHorizon, drawHwLandmarks } from '../landmarks';

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
// The backlot's soundstages, wrecked (farWreck.ts: the damage follows each building; the fires and smolder live)

const { SW, SH, SG } = STAGES;
const smokeWisp = (c: Ctx, x: number, y: number, f: number, seed: number) => {
  for (let k = 0; k < 4; k++) { const t = ((f * 0.3 + k * 50 + seed * 31) % 200) / 200, r = 3 + t * 12; c.fillStyle = `rgba(90, 86, 84, ${(0.28 * (1 - t)).toFixed(2)})`; c.fillRect(Math.round(x - r + t * 30), Math.round(y - t * 120), Math.round(r * 2), Math.round(r)); }
};

// ---------------------------------------------------------------------------------------------------------------
// The HAPPYWOOD hill burning

const { HW, HHT } = HILL;
/** The letters' row (blvd/far.ts's: 22 apart, centered). */
const LSTEP = 22, LLEFT = HW * 0.5 - (LSTEP * 9) / 2;
/** The quake's fissure across the hillside, under the letters: tile x's, its y down from the crest. */
const FISSURE: [number, number][] = [0.16, 0.22, 0.27, 0.33, 0.38, 0.45, 0.51, 0.57, 0.62, 0.68, 0.74, 0.8].map((u, i) => {
  const x = HW * u; return [x, hillY(x) + 64 + (i % 2 ? 7 : -3) + Math.max(0, Math.abs(u - 0.48) - 0.18) * 160];
});
/** The brush fires: fronts burning across the slopes (tile x from, to; how far down from the crest). */
const FRONTS: [number, number, number][] = [[HW * 0.1, HW * 0.3, 40], [HW * 0.24, HW * 0.4, 96], [HW * 0.58, HW * 0.76, 30], [HW * 0.66, HW * 0.86, 84], [HW * 0.44, HW * 0.56, 118]];
/** The letters on fire (their index). */
const BURNING = [0, 3, 5, 8];
const hillFire = (c: Ctx, hx: number, foot: number, f: number) => {
  const ox = hx - HW / 2, oy = foot - HHT;
  // (the fissure: the hillside split, black, the fire glowing in it, stepped; heat shimmering up off it)
  c.lineJoin = 'miter';
  for (const [w, col] of [[6, INK], [3, FIRE[1]], [1, FIRE[4]]] as const) {
    c.strokeStyle = col; c.lineWidth = w; c.beginPath();
    FISSURE.forEach(([x, y], i) => (i ? c.lineTo(Math.round(ox + x), Math.round(oy + y)) : c.moveTo(Math.round(ox + x), Math.round(oy + y)))); c.stroke();
  }
  for (let i = 1; i < FISSURE.length - 1; i += 2) {
    const [x, y] = FISSURE[i], p = Math.sin(f * 0.12 + i) > 0.3;
    steppedGlow(c, ox + x, oy + y, 14, '#F97316', p ? 0.32 : 0.22, 0, 3);
    box(c, Math.round(ox + x) - 1, Math.round(oy + y) - 1, 3, 2, p ? FIRE[5] : FIRE[4]);
  }
  // (the brush fires: a charred band behind each front, the flames along it, low and ragged; smoke going up off it)
  FRONTS.forEach(([a, b, d], k) => {
    for (let x = a; x < b; x += 4) { const y = Math.round(oy + hillY(x) + d); box(c, Math.round(ox + x), y - 6, 4, 6, 'rgba(24, 14, 12, 0.55)'); }
    for (let x = a, j = 0; x < b; x += 7, j++) flame(c, ox + x, oy + hillY(x) + d + 1, 6 + hash(k * 9 + j) * 3, 8 + hash(j * 3 + k) * 8, f, k * 13 + j);
    smoke(c, ox + (a + b) / 2, oy + hillY((a + b) / 2) + d - 4, f, k + 3);
  });
  // (the letters burning: fire up their faces, black smoke off the tops)
  for (const i of BURNING) {
    const lx = LLEFT + i * LSTEP + LSTEP / 2, base = Math.max(hillY(lx - 8), hillY(lx + 8)) + 46;
    const fx = ox + lx, fy = oy + base;
    flame(c, fx - 4, fy, 7, 18, f, i * 7); flame(c, fx + 4, fy - 4, 6, 22, f, i * 7 + 3);
  }
  smokeWisp(c, ox + LLEFT + 3 * LSTEP, oy + hillY(LLEFT + 3 * LSTEP) + 20, f, 4);
};
/** Spent: the slopes burned black in bands, the fissure dark, smoke thin. */
const hillBurnt = (c: Ctx, hx: number, foot: number, f: number) => {
  const ox = hx - HW / 2, oy = foot - HHT;
  c.strokeStyle = INK; c.lineWidth = 4; c.lineJoin = 'miter'; c.beginPath();
  FISSURE.forEach(([x, y], i) => (i ? c.lineTo(Math.round(ox + x), Math.round(oy + y)) : c.moveTo(Math.round(ox + x), Math.round(oy + y)))); c.stroke();
  FRONTS.forEach(([a, b, d], k) => {
    for (let x = a; x < b; x += 4) { const y = Math.round(oy + hillY(x) + d); box(c, Math.round(ox + x), y - 8, 4, 9, 'rgba(24, 14, 12, 0.6)'); }
    if (k % 2 === 0) smokeWisp(c, ox + (a + b) / 2, oy + hillY((a + b) / 2) + d - 4, f, k);
  });
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
  // (a news helicopter circling it all)
  drawHwSky(c, state, hz, 'real', false);
  tile(c, `hb-mtn-${tod.key}`, cam * K.mtn + 300, groundAt(K.mtn) - FAR.MH + 10 + drop(K.mtn), FAR.MH, FAR.TW, g => paintMountains(g, tod));
  // (the park's horizon past the hill, Space Needle 2's shaft lost up in the storm)
  drawHwHorizon(c, state, groundAt(0.0035) + 4 + drop(0.0035), 150);
  // (the HAPPYWOOD hill, burning, till he's up on it: it sinks away behind the city as he climbs)
  const sink = Math.max(0, Math.min(1, (rx - 6000) / 2200)) * 330;
  if (sink < 330) {
    const hx = 560 - (cam - HWX) * K.hill, foot = groundAt(K.hill) + 6 + drop(K.hill) + sink;
    drawHill(c, hx, foot, f);
    if (!done) hillFire(c, hx, foot, f);
    else hillBurnt(c, hx, foot, f);
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
  // (the land's attractions round it: Disaster: The Ride and Thrones back the way he came, the Stuntery ahead)
  drawHwLandmarks(c, state, groundAt(0.03) + drop(0.03));
  tile(c, `hb-lot-${tod.key}`, cam * K.lot + 1000, groundAt(K.lot) - (FAR.SH - FAR.SG) + drop(K.lot), FAR.SH, FAR.LW, g => paintLot(g, tod));
  under(groundAt(K.lot) + FAR.SG + drop(K.lot), 0.2, '#6A6466');
  tile(c, `hb-palms-${tod.key}`, cam * K.palms + 900, groundAt(K.palms) - (FAR.PH - FAR.PG) + drop(K.palms), FAR.PH, FAR.PW, g => paintPalms(g, tod));
  under(groundAt(K.palms) + FAR.PG + drop(K.palms), 0.12, '#6E6668');
  // (the backlot's soundstages nearest: scorched, holed, burning)
  const sTop = groundAt(K.stages) - (SH - SG) + drop(K.stages), sOff = cam * K.stages + 300;
  tile(c, `hh-wreck-${tod.key}-${done ? 1 : 0}`, sOff, sTop, SH, SW, g => paintWrecked(g, tod, done));
  wreckFires(c, sOff, sTop, f, done);
  roadUnder(c, tod, sOff, groundAt(K.stages) + SG + drop(K.stages), true);
  mist(c, W, Math.round(groundAt(K.stages) + drop(K.stages) - 40), 40, skyAt(0.9, tod), 0, 0.1, 3);
  // (the whole far off reddened, in bands, heavier up top; spent, grayed)
  hazeBandsOf(c, 0, 0, W, Math.round(groundAt(K.stages) + drop(K.stages)), done ? '#3A3634' : '#7F1D1D', done ? 0.22 : 0.3, 0.1, 6);
  // The weather, the lightning
  weather(c, f, cam, rx, done);
  if (!done) lightning(c, f, hz + drop(K.city));
  void FIRE; void INK; void checker;
  return true;
};
