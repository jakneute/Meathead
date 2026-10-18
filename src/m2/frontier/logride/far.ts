// Timber Tumble's far off (screen space; the backdrop), each layer painted once for the hour into a tile and slid along.
//
// In the PARK (up to the culvert): the wilds' far off itself (wilds/far.ts: the banded western sky and its cumulus, the
// real Rockies past the fence, the park's plywood mountain flats, the pines, the lookout, the cell tower in its fake
// boughs), then nearer, the ride's own mountain: Timber Tumble's molded fiberglass crags going by (strata lit along
// their tops, the panel seams bolted down them, a maintenance catwalk and a light tower on one, plywood pine cutouts on
// their 2x4 braces along its ledges, another flume's chute down its face with a log in it and the white water at its
// foot).
//
// Out of the culvert, the REAL thing (and it shows): a big clean sky, the real Rockies close now (snow, gullies,
// timber), a ridge of real forest with the logging crew's clear-cut bitten out of it (stumps, slash, a switchback skid
// road, a log deck, a landing with a yarder's spar), a nearer ridge of ragged real pines, every one different, the
// valley's mist over the river. No plywood, no bolts, no paint.
//
// Indoors (the station, the shed) and down the sewer the world draws its own walls; this just fills behind them.
// No volcanoes anywhere.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky, cloudTint, type TimeOfDay } from '../../timeOfDay';
import { type RangeLook, range, mist, snap2, wave, jag, fillUnder, wrapAt } from '../../adventure/farArt';
import { drawFar, groundLine } from '../wilds/far';
import { GY } from '../geometry';
import { type Ctx, box, checker, mix, hash, bandedGradient, hazeBands, pixelBlob, stillAt, INK, timeOfDay, farTint, skyAt, hourMix, FIBER, PLY, STEEL, NEEDLE, POOL } from './paint';
import { zoneAt, inSewer, indoorsAt, realAt, x0 } from './layout';
import { stamp } from '../../intro/art/kit';
import { rideOf } from './state';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;

const fontIn = () => (typeof document !== 'undefined' && document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n');
/** A tile `tw` wide (painted once for the hour), slid along by `off`, its top at y. */
const tile = (c: Ctx, key: string, off: number, y: number, h: number, tw: number, paint: (g: Ctx) => void) => {
  for (let x = -((off % tw) + tw) % tw; x < W; x += tw) { c.save(); c.translate(Math.round(x), Math.round(y)); stamp(c, `lr-${key}-${fontIn()}`, 0, 0, tw, h, paint); c.restore(); }
};
/** A far layer's color for the hour, then into the sky's haze by `k`. */
const farCol = (tod: TimeOfDay, k: number) => (c: string) => mix(farTint(hourMix(c, mix(c, '#8A5A48', 0.18), mix(c, '#141832', 0.45), tod), 1, tod), skyAt(0.88, tod), k);
const lookOf = (T: (c: string) => string, base: string): RangeLook => ({ body: T(base), lit: T(mix(base, '#F4ECD8', 0.28)), hi: T(mix(base, '#FFFFFF', 0.45)), shade: T(mix(base, '#141A30', 0.22)), deep: T(mix(base, '#141A30', 0.38)) });

/** Where the camera's looking (x from the section's start). */
const camRx = (state: GameState) => state.camera.x + CANVAS_WIDTH / 2 - x0;

export const drawRideBackdrop = (c: Ctx, state: GameState): boolean => {
  const rx = camRx(state), z = zoneAt(rx);
  // (the sewer's dark; around the break, only once the view's gone down the chasm after him)
  const nearBreak = z === 'brk' || (rx >= 5700 && rx < 6300);
  if (nearBreak ? state.camera.y > GY - 100 : inSewer(rx)) { bandedGradient(c, 0, 0, W, H, ['#0C0A06', '#120E08', '#16120A', '#120E08'], 8); return true; }
  // (indoors only while he's in there: from out on the ride the station and the shed are their outsides (veils.ts))
  const L = rideOf(state).log, here = L.mode === 'ride' || L.mode === 'scene' ? L.rx : state.player.pos.x + state.player.width / 2 - x0;
  if (indoorsAt(rx) && indoorsAt(here)) { bandedGradient(c, 0, 0, W, H, ['#1A120A', '#22180E', '#2A1E12', '#22180E'], 8); return true; }
  if (realAt(rx)) return realFar(c, state);
  return parkFar(c, state);
};

// ---------------------------------------------------------------------------------------------------------------
// The park: the wilds' far off, and the ride's own fiberglass mountain going by

const MW = 1500, MH = 250;
const paintRideMountain = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.26), Tn = farCol(tod, 0.18);
  const F = FIBER.map(T), P = PLY.map(Tn), S = STEEL.map(T), N = NEEDLE.map(Tn), Wt = POOL.map(T);
  // ---- two runs of molded crags (stepped, strata lit along their tops, a seam bolted down each)
  const crags: [number, number, number][] = [[40, 640, 230], [760, 600, 200]];
  for (const [cx, cw, ch] of crags) {
    const pts: [number, number][] = [[cx, MH]];
    for (let i = 1; i < 14; i++) { const u = i / 14, peak = Math.sin(u * Math.PI) * (0.55 + hash(cx + i) * 0.45); pts.push([snap2(cx + u * cw), snap2(MH - ch * (0.3 + peak * 0.7) + (i % 3 === 0 ? 18 : 0))]); }
    pts.push([cx + cw, MH]);
    g.fillStyle = INK; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y - 1) : g.moveTo(x, y))); g.closePath(); g.fill();
    g.save(); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
    bandedGradient(g, cx, MH - ch - 4, cw, ch + 4, [F[5], F[4], F[4], F[3], F[3], F[2]], 8);
    for (let k = 0; k < 10; k++) {
      const y = MH - ch + 10 + k * 22 + (k % 2) * 5;
      for (let x = cx + (k % 3) * 18; x < cx + cw; x += 56 + (k * 13) % 30) { const lw = 36 + (k * 7 + x) % 22; box(g, x, y, lw, 2, F[5]); box(g, x, y + 2, lw, 6, F[2]); box(g, x, y + 8, lw, 1, F[1]); checker(g, x, y + 6, lw, 2, F[3], k % 2); }
    }
    // (the shade down the right of each peak)
    for (let i = 1; i < pts.length - 1; i++) if (pts[i - 1][1] > pts[i][1] && pts[i + 1][1] > pts[i][1]) { g.fillStyle = F[1]; g.beginPath(); g.moveTo(pts[i][0], pts[i][1]); g.lineTo(pts[i][0] + 60, MH); g.lineTo(pts[i][0] + 10, MH); g.closePath(); g.fill(); checker(g, pts[i][0] + 2, pts[i][1] + 10, 24, MH - pts[i][1], F[2], 0, 2); }
    // (the seams, bolted)
    for (let sx = cx + 90; sx < cx + cw - 40; sx += 150) { box(g, sx, MH - ch, 1, ch, F[1]); box(g, sx + 1, MH - ch, 1, ch, F[5]); for (let by = MH - ch + 30; by < MH; by += 22) box(g, sx - 1, by, 3, 3, S[4]); }
    g.restore();
    // (plywood pine cutouts along a ledge, too even, braced behind with 2x4s)
    for (let px = cx + 30; px < cx + cw - 30; px += 46 + (px % 17)) {
      const foot = MH - 16 - ((px * 7) % 30), th = 30 + (px % 13);
      g.strokeStyle = P[2]; g.lineWidth = 2; g.beginPath(); g.moveTo(px + 2, foot - th * 0.5); g.lineTo(px + 12, foot); g.stroke();
      g.fillStyle = INK; g.beginPath(); g.moveTo(px, foot - th - 1); g.lineTo(px + 9, foot + 1); g.lineTo(px - 9, foot + 1); g.closePath(); g.fill();
      g.fillStyle = N[3]; g.beginPath(); g.moveTo(px, foot - th); g.lineTo(px + 8, foot); g.lineTo(px - 8, foot); g.closePath(); g.fill();
      g.fillStyle = N[5]; g.beginPath(); g.moveTo(px, foot - th); g.lineTo(px - 8, foot); g.lineTo(px - 3, foot); g.closePath(); g.fill();
      box(g, px + 8, foot - th * 0.6, 1, th * 0.6, P[4]);
    }
  }
  // ---- a maintenance catwalk on the first crag and a light tower on the second (lit after dark)
  const cw0 = 300;
  box(g, cw0, MH - 160, 140, 3, S[3]); box(g, cw0, MH - 170, 140, 1, S[5]);
  for (let x = cw0; x <= cw0 + 140; x += 14) box(g, x, MH - 170, 1, 10, S[4]);
  for (const lx of [cw0 + 10, cw0 + 130]) box(g, lx, MH - 157, 2, 157, S[2]);
  const tx = 1180;
  box(g, tx, MH - 230, 3, 230, S[2]); box(g, tx, MH - 230, 1, 230, S[5]);
  for (let y = MH - 220; y < MH; y += 16) { g.strokeStyle = S[2]; g.lineWidth = 1; g.beginPath(); g.moveTo(tx - 8, y); g.lineTo(tx + 10, y + 16); g.stroke(); }
  box(g, tx - 14, MH - 236, 32, 3, S[3]);
  for (const hx of [tx - 14, tx + 8]) { box(g, hx, MH - 246, 10, 10, INK); box(g, hx + 1, MH - 245, 8, 8, tod.lamps > 0.3 ? '#FFF0B0' : S[2]); }
  // ---- another flume chute down the second crag: plank trough on trestles, a log in it, white water at its foot
  const fx0 = 860, fy0 = MH - 170, fx1 = 1060, fy1 = MH - 20;
  for (let k = 0; k <= 6; k++) { const x = fx0 + ((fx1 - fx0) * k) / 6, y = fy0 + ((fy1 - fy0) * k) / 6; box(g, x - 1, y + 6, 3, MH - y - 6, P[1]); box(g, x - 1, y + 6, 1, MH - y - 6, P[3]); }
  g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.moveTo(fx0, fy0); g.lineTo(fx1, fy1); g.stroke();
  g.strokeStyle = P[2]; g.lineWidth = 9; g.stroke();
  g.strokeStyle = P[4]; g.lineWidth = 2; g.beginPath(); g.moveTo(fx0, fy0 - 4); g.lineTo(fx1, fy1 - 4); g.stroke();
  g.strokeStyle = Wt[5]; g.lineWidth = 3; g.beginPath(); g.moveTo(fx0, fy0 - 1); g.lineTo(fx1, fy1 - 1); g.stroke();
  for (let k = 0; k < 8; k++) pixelBlob(g, fx1 + 4 + k * 6 - 20, fy1 - 4 - (k % 3) * 5, 6, 4, k % 2 ? Wt[8] : Wt[7]);
  g.save(); g.translate(fx0 + 70, fy0 + 48); g.rotate(Math.atan2(fy1 - fy0, fx1 - fx0));
  box(g, -15, -9, 30, 9, INK); box(g, -14, -8, 28, 7, T('#7A4A24')); box(g, -14, -8, 28, 2, T('#A06A38')); box(g, 11, -8, 3, 7, T('#C8A070'));
  g.restore();
  mist(g, MW, MH - 40, 40, skyAt(0.92, tod), 0, 0.3, 4);
};

const parkFar = (c: Ctx, state: GameState) => {
  drawFar(c, state);
  const tod = timeOfDay(), gl = Math.round(groundLine(state));
  tile(c, `ridemtn-${tod.key}`, state.camera.x * 0.3 + 300, gl - MH + 30, MH, MW, g => paintRideMountain(g, tod));
  const T = farCol(tod, 0.08);
  if (gl + 30 < H) bandedGradient(c, 0, gl + 30, W, H - gl - 30, [T('#1C3418'), T('#182C14'), T('#142412'), T('#101C0E')], 5);
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// The real thing: past the park's fence

const SKY = ['#163E9C', '#2458B8', '#3E78CC', '#6C9CDC', '#A8C8E8', '#DCE6E8'];
const HORIZON = 330;

const CW = 1200, CH = 140;
const paintClouds = (g: Ctx, tod: TimeOfDay) => {
  const C = ['#9AA8C0', '#C2CCDC', '#E4EAF2', '#FFFFFF'].map(col => cloudTint(col, tod));
  for (let i = 0; i < 5; i++) {
    const cx = 100 + i * (CW / 5) + hash(i * 4.1) * 80, base = 60 + hash(i * 2.9) * 60, w = 120 + hash(i * 1.3) * 160;
    wrapAt(CW, cx, x => {
      const n = 6 + Math.floor(hash(i + 3) * 3);
      for (let k = 0; k < n; k++) { const u = (k + 0.5) / n, r = (0.5 + Math.sin(u * Math.PI) * 0.8) * w * 0.17; pixelBlob(g, x - w / 2 + u * w, base - r * 0.6, r, r * 0.8, C[1]); }
      for (let k = 0; k < n; k++) { const u = (k + 0.5) / n, r = (0.5 + Math.sin(u * Math.PI) * 0.8) * w * 0.17; pixelBlob(g, x - w / 2 + u * w - r * 0.2, base - r * 0.8, r * 0.75, r * 0.6, C[2]); pixelBlob(g, x - w / 2 + u * w - r * 0.35, base - r, r * 0.36, r * 0.28, C[3]); }
      box(g, x - w / 2, base - 4, w, 6, C[0]); checker(g, x - w / 2, base - 6, w, 2, C[0]);
    }, 240);
  }
};

// (the real Rockies, close now: bigger, sharper, more snow)
const RW = 1100, RH = 260;
const peakY = (x: number) => snap2(RH - 170 + wave(x, RW, 3.7) * 60 + jag(x, RW, 6, 5) * 14 - Math.max(0, wave(x, RW, 6.3, 2)) * 36);
const paintPeaks = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.42), L = lookOf(T, '#76809E');
  range(g, RW, peakY, RH, L, 11, { gullies: 40, d: 16, forest: [T('#2E4C48'), T('#44625A')], forestY: x => RH - 70 + wave(x, RW, 2.4, 2) * 14 });
  const S = [T('#9AA8C8'), T('#C8D2E6'), T('#F4F8FE')], snowLine = RH - 130;
  for (let x = 0; x < RW; x += 2) {
    const y = peakY(x);
    if (y >= snowLine) continue;
    const foot = snowLine - 6 + jag(x, RW, 5, 13) * 30 + wave(x, RW, 8.1, 3) * 12;
    if (foot <= y) continue;
    const lit = peakY(x + 4) < y || (peakY(x + 4) === y && peakY(x - 4) > y);
    box(g, x, y, 2, foot - y, lit ? S[2] : S[0]);
    if (lit) box(g, x, y + (foot - y) * 0.6, 2, (foot - y) * 0.4, S[1]);
    if ((x >> 1) % 3 === 0) box(g, x, foot, 2, 4 + hash(x) * 10, S[0]);
  }
  mist(g, RW, RH - 80, 80, skyAt(0.92, tod), 0, 0.5, 6);
};

// (a ridge of real forest, the crew's clear-cut bitten out of it)
const FW = 1300, FH = 200;
const ridgeY = (x: number) => snap2(FH - 120 + wave(x, FW, 1.9) * 26 + wave(x, FW, 5.3, 2) * 10);
const paintForestRidge = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.22), N = [T('#0C1A12'), T('#14261A'), T('#1E3626'), T('#2A4632'), T('#3A5A40')];
  fillUnder(g, FW, ridgeY, FH, N[2]);
  // (the forest's texture: a ragged crest of spires, then rows of crowns down the slope, lit on their left)
  for (let x = 0; x < FW; x += 5) {
    const y = ridgeY(x), h = 6 + hash(x * 0.7) * 10;
    g.fillStyle = N[1]; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + 4, y + 2); g.lineTo(x - 4, y + 2); g.closePath(); g.fill();
    box(g, x - 1, y - h * 0.6, 1, h * 0.5, N[3]);
  }
  for (let r = 0; r < 14; r++) for (let x = (r % 2) * 4; x < FW; x += 8) { const y = ridgeY(x) + 6 + r * 9; if (y > FH) break; box(g, x, y, 5, 3, (x + r * 3) % 24 < 8 ? N[3] : N[1]); box(g, x, y, 2, 1, N[4]); }
  // (the clear-cut: a raw tan scar down the slope, stumps dotted on it, slash in rows, the switchback skid road, a log
  // deck at the landing, the yarder's spar with its guy lines)
  const ca = 420, cb = 700;
  const D = [T('#5A4430'), T('#7A5E40'), T('#9A7C56'), T('#BCA078')];
  g.save(); g.beginPath(); g.moveTo(ca, FH); for (let x = ca; x <= cb; x += 10) g.lineTo(x, ridgeY(x) + 14 + Math.sin(x * 0.07) * 6); g.lineTo(cb + 40, FH); g.closePath(); g.clip();
  bandedGradient(g, ca, ridgeY(ca) - 10, cb - ca + 40, FH - ridgeY(ca) + 10, [D[2], D[1], D[2], D[1], D[0]], 5);
  for (let i = 0; i < 90; i++) { const sx = ca + hash(i * 3.3) * (cb - ca + 40), sy = ridgeY(sx) + 20 + hash(i * 7.1) * 100; box(g, sx, sy, 2, 2, D[3]); box(g, sx, sy + 2, 2, 1, D[0]); }
  for (let r = 0; r < 6; r++) { const y0 = ridgeY(ca) + 30 + r * 16; g.strokeStyle = D[0]; g.lineWidth = 2; g.beginPath(); g.moveTo(ca + 10, y0); g.lineTo(cb + 20, y0 + 10); g.stroke(); }
  g.strokeStyle = D[3]; g.lineWidth = 3; g.beginPath(); g.moveTo(ca + 30, FH); g.lineTo(cb - 20, FH - 30); g.lineTo(ca + 60, FH - 54); g.lineTo(cb - 40, FH - 80); g.stroke();
  g.restore();
  const lx = cb - 40, ly = FH - 82;
  for (let k = 0; k < 5; k++) box(g, lx - 30 + k * 2, ly - k * 3, 40 - k * 4, 3, k % 2 ? D[3] : D[2]);
  box(g, lx + 20, ly - 50, 2, 50, T('#3A2C22')); g.strokeStyle = T('#5A5048'); g.lineWidth = 1; g.beginPath(); g.moveTo(lx + 21, ly - 50); g.lineTo(lx - 10, ly); g.moveTo(lx + 21, ly - 50); g.lineTo(lx + 52, ly + 4); g.moveTo(lx + 21, ly - 46); g.lineTo(ca + 80, ridgeY(ca + 80) + 30); g.stroke();
  box(g, lx + 6, ly - 8, 18, 8, T('#C8962E')); box(g, lx + 6, ly - 8, 18, 2, T('#E8C25A'));
  mist(g, FW, FH - 50, 50, skyAt(0.92, tod), 0, 0.32, 5);
};

// (a nearer ridge of real pines, ragged, every one different: dead snags among them)
const NW = 1000, NH = 190;
const paintNearPines = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.1), R = [T(NEEDLE[0]), T(NEEDLE[1]), T(NEEDLE[2]), T(NEEDLE[4])];
  for (let x = -20, i = 0; x < NW + 20; x += 9 + hash(i * 1.9) * 16, i++) {
    const h = 70 + hash(i * 2.3) * 100, w = h * (0.22 + hash(i) * 0.12), snag = hash(i * 5.7) < 0.07;
    wrapAt(NW, x, xx => {
      if (snag) {
        // (a dead snag: bare gray trunk, broken top, stubs of limbs)
        box(g, xx - 2, NH - h * 0.8, 4, h * 0.8, T('#6A645C')); box(g, xx - 2, NH - h * 0.8, 1, h * 0.8, T('#9A948A'));
        for (let k = 0; k < 5; k++) box(g, xx + (k % 2 ? 2 : -7), NH - h * 0.7 + k * 12, 5, 1, T('#6A645C'));
        return;
      }
      const tiers = Math.max(4, Math.round(h / 11));
      for (let k = 0; k < tiers; k++) {
        const t = (k + 1) / tiers, y0 = NH - h + (k * h * 0.88) / tiers, y1 = y0 + h / tiers + 5, half = 2 + w * 0.5 * t * (0.75 + hash(i + k) * 0.5);
        g.fillStyle = R[0]; g.beginPath(); g.moveTo(xx, y0 - 1); g.lineTo(xx + half + 1, y1 + 1); g.lineTo(xx - half - 1, y1 + 1); g.closePath(); g.fill();
        g.fillStyle = R[1]; g.beginPath(); g.moveTo(xx, y0); g.lineTo(xx + half, y1); g.lineTo(xx - half, y1); g.closePath(); g.fill();
        g.fillStyle = R[2]; g.beginPath(); g.moveTo(xx, y0); g.lineTo(xx - half, y1); g.lineTo(xx - half * 0.3, y1); g.closePath(); g.fill();
        if (half > 5) { checker(g, xx - half * 0.7, y1 - 3, half * 0.6, 2, R[2], k % 2); box(g, xx - half * 0.8, y1 - 2, 2, 1, R[3]); }
      }
    }, 50);
  }
  fillUnder(g, NW, () => NH - 6, NH, R[0]);
  mist(g, NW, NH - 40, 40, skyAt(0.94, tod), 0, 0.18, 4);
};

const realFar = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), cam = state.camera.x, f = state.frame;
  drawTodSky(c, 0, 0, W, H, SKY, { bands: 16, horizon: HORIZON + 60, sun: [620, 100], moon: [160, 80], t: f, scroll: cam * 0.01 });
  tile(c, `rclouds-${tod.key}`, cam * 0.012 + f * 0.04, 20, CH, CW, g => paintClouds(g, tod));
  hazeBands(c, 0, HORIZON - 120, W, 160, hourMix('#E2DCC8', '#E8A878', '#2A2E4A', tod), 0, 0.2, 6);
  tile(c, `rpeaks-${tod.key}`, cam * 0.03 + 400, HORIZON - RH + 70, RH, RW, g => paintPeaks(g, tod));
  tile(c, `rridge-${tod.key}`, cam * 0.08 + 200, HORIZON - FH + 120, FH, FW, g => paintForestRidge(g, tod));
  hazeBands(c, 0, HORIZON + 40, W, 80, skyAt(0.94, tod), 0, 0.22, 4);
  tile(c, `rnear-${tod.key}`, cam * 0.16 + 90, HORIZON - NH + 190, NH, NW, g => paintNearPines(g, tod));
  const T = farCol(tod, 0.06);
  bandedGradient(c, 0, HORIZON + 186, W, H - HORIZON - 186, [T('#14261A'), T('#102014'), T('#0C1A10'), T('#08140C')], 5);
  void stillAt; void PLY;
  return true;
};
