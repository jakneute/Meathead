// The woods' far off (screen space; the backdrop), each layer painted once for the hour into a tile and slid along.
// The REAL thing, straight on from the log ride's real river (logride/far.ts realFar: the same sky, the same Rockies,
// the same ridge with the crew's clear-cut bitten out of it, the same ragged real pines): and far behind him, back the
// way he came, the PARK from the outside, sliding away as he walks on: its back fence along a berm (chain-link, three
// strands of barbed wire, a gap torn in it, a sun-bleached sign wired on), and over the trees the BACKS of its painted
// mountains (raw plywood, the 2x4 lattice bracing them, sandbags, PROP 7 stenciled on), the log ride's lift hill (a
// timber trestle, the trough and its chain), a light tower. No volcanoes anywhere.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky, cloudTint, type TimeOfDay } from '../../timeOfDay';
import { type RangeLook, range, mist, snap2, wave, jag, fillUnder, wrapAt } from '../../adventure/farArt';
import { stamp } from '../../intro/art/kit';
import { signText } from '../../signLetters';
import { groundLine, drawBirds } from '../wilds/far';
import { drawTeases } from '../teases';
import { FRX } from '../geometry';
import { type Ctx, box, checker, mix, hash, bandedGradient, hazeBands, pixelBlob, INK, timeOfDay, farTint, skyAt, hourMix, NEEDLE, PLY, STEEL, stenciled } from './paint';
import { x0 } from './layout';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;

const fontIn = () => (typeof document !== 'undefined' && document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n');
/** A tile `tw` wide (painted once for the hour), slid along by `off`, its top at y. */
const tile = (c: Ctx, key: string, off: number, y: number, h: number, tw: number, paint: (g: Ctx) => void) => {
  for (let x = -((off % tw) + tw) % tw; x < W; x += tw) { c.save(); c.translate(Math.round(x), Math.round(y)); stamp(c, `wd-${key}-${fontIn()}`, 0, 0, tw, h, paint); c.restore(); }
};
/** A far layer's color for the hour, then into the sky's haze by `k` (the log ride's real far's). */
const farCol = (tod: TimeOfDay, k: number) => (c: string) => mix(farTint(hourMix(c, mix(c, '#8A5A48', 0.18), mix(c, '#141832', 0.45), tod), 1, tod), skyAt(0.88, tod), k);
const lookOf = (T: (c: string) => string, base: string): RangeLook => ({ body: T(base), lit: T(mix(base, '#F4ECD8', 0.28)), hi: T(mix(base, '#FFFFFF', 0.45)), shade: T(mix(base, '#141A30', 0.22)), deep: T(mix(base, '#141A30', 0.38)) });

// (the log ride's real sky)
const SKY = ['#163E9C', '#2458B8', '#3E78CC', '#6C9CDC', '#A8C8E8', '#DCE6E8'];

export const CW = 1200, CH = 140;
export const paintClouds = (g: Ctx, tod: TimeOfDay) => {
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

// (the real Rockies: the log ride's real peaks, the same skyline)
export const RW = 1100, RH = 260;
const peakY = (x: number) => snap2(RH - 170 + wave(x, RW, 3.7) * 60 + jag(x, RW, 6, 5) * 14 - Math.max(0, wave(x, RW, 6.3, 2)) * 36);
export const paintPeaks = (g: Ctx, tod: TimeOfDay) => {
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

// (the ridge of real forest, the crew's clear-cut bitten out of it: the log ride's, seen from further down the valley)
export const FW = 1300, FH = 200;
const ridgeY = (x: number) => snap2(FH - 120 + wave(x, FW, 1.9) * 26 + wave(x, FW, 5.3, 2) * 10);
export const paintForestRidge = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.22), N = [T('#0C1A12'), T('#14261A'), T('#1E3626'), T('#2A4632'), T('#3A5A40')];
  fillUnder(g, FW, ridgeY, FH, N[2]);
  for (let x = 0; x < FW; x += 5) {
    const y = ridgeY(x), h = 6 + hash(x * 0.7) * 10;
    g.fillStyle = N[1]; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + 4, y + 2); g.lineTo(x - 4, y + 2); g.closePath(); g.fill();
    box(g, x - 1, y - h * 0.6, 1, h * 0.5, N[3]);
  }
  for (let r = 0; r < 14; r++) for (let x = (r % 2) * 4; x < FW; x += 8) { const y = ridgeY(x) + 6 + r * 9; if (y > FH) break; box(g, x, y, 5, 3, (x + r * 3) % 24 < 8 ? N[3] : N[1]); box(g, x, y, 2, 1, N[4]); }
  // (aspen stands turned gold, patches down the slope)
  const Au = [T('#7A5A14'), T('#A47A1C'), T('#C89A2E')];
  for (let i = 0; i < 9; i++) {
    const ax = hash(i * 7.7) * FW, ay = ridgeY(ax) + 20 + hash(i * 3.1) * 60;
    for (let k = 0; k < 14; k++) { const px = ax + (hash(i * 13 + k) - 0.5) * 50, py = ay + (hash(i * 5 + k * 2) - 0.5) * 18; box(g, px, py, 4, 3, Au[k % 3]); box(g, px, py, 2, 1, Au[2]); }
  }
  const ca = 420, cb = 700;
  const D = [T('#5A4430'), T('#7A5E40'), T('#9A7C56'), T('#BCA078')];
  g.save(); g.beginPath(); g.moveTo(ca, FH); for (let x = ca; x <= cb; x += 10) g.lineTo(x, ridgeY(x) + 14 + Math.sin(x * 0.07) * 6); g.lineTo(cb + 40, FH); g.closePath(); g.clip();
  bandedGradient(g, ca, ridgeY(ca) - 10, cb - ca + 40, FH - ridgeY(ca) + 10, [D[2], D[1], D[2], D[1], D[0]], 5);
  for (let i = 0; i < 90; i++) { const sx = ca + hash(i * 3.3) * (cb - ca + 40), sy = ridgeY(sx) + 20 + hash(i * 7.1) * 100; box(g, sx, sy, 2, 2, D[3]); box(g, sx, sy + 2, 2, 1, D[0]); }
  for (let r = 0; r < 6; r++) { const y0 = ridgeY(ca) + 30 + r * 16; g.strokeStyle = D[0]; g.lineWidth = 2; g.beginPath(); g.moveTo(ca + 10, y0); g.lineTo(cb + 20, y0 + 10); g.stroke(); }
  g.strokeStyle = D[3]; g.lineWidth = 3; g.beginPath(); g.moveTo(ca + 30, FH); g.lineTo(cb - 20, FH - 30); g.lineTo(ca + 60, FH - 54); g.lineTo(cb - 40, FH - 80); g.stroke();
  g.restore();
  // (power line towers marching over the far ridge: the real world's)
  const Ts = T('#5A606A');
  for (let i = 0; i < 4; i++) {
    const tx = 120 + i * 300, ty = ridgeY(tx);
    g.strokeStyle = Ts; g.lineWidth = 1; g.beginPath(); g.moveTo(tx - 5, ty + 4); g.lineTo(tx, ty - 26); g.lineTo(tx + 5, ty + 4); g.moveTo(tx - 7, ty - 20); g.lineTo(tx + 7, ty - 20); g.moveTo(tx - 4, ty - 8); g.lineTo(tx + 4, ty - 14); g.stroke();
    if (i < 3) { const nx = tx + 300, ny = ridgeY(nx); g.beginPath(); g.moveTo(tx + 7, ty - 20); g.quadraticCurveTo(tx + 150, (ty + ny) / 2 - 8, nx - 7, ny - 20); g.stroke(); }
  }
  mist(g, FW, FH - 50, 50, skyAt(0.92, tod), 0, 0.32, 5);
};

// (the nearer ridge of real pines, ragged, every one different, snags among them: the log ride's)
export const NW = 1000, NH = 190;
export const paintNearPines = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.1), R = [T(NEEDLE[0]), T(NEEDLE[1]), T(NEEDLE[2]), T(NEEDLE[4])];
  const Au = [T('#6A4A10'), T('#9A6E18'), T('#C8962A')];
  for (let x = -20, i = 0; x < NW + 20; x += 9 + hash(i * 1.9) * 16, i++) {
    const h = 70 + hash(i * 2.3) * 100, w = h * (0.22 + hash(i) * 0.12), snag = hash(i * 5.7) < 0.07, aspen = hash(i * 3.9) < 0.12;
    wrapAt(NW, x, xx => {
      if (snag) {
        box(g, xx - 2, NH - h * 0.8, 4, h * 0.8, T('#6A645C')); box(g, xx - 2, NH - h * 0.8, 1, h * 0.8, T('#9A948A'));
        for (let k = 0; k < 5; k++) box(g, xx + (k % 2 ? 2 : -7), NH - h * 0.7 + k * 12, 5, 1, T('#6A645C'));
        return;
      }
      if (aspen) {
        // (an aspen turned gold among the pines: a pale trunk, a round crown)
        box(g, xx - 1, NH - h * 0.6, 3, h * 0.6, T('#C8C4B8'));
        pixelBlob(g, xx, NH - h * 0.66, w * 0.7, h * 0.22, Au[0]); pixelBlob(g, xx - 2, NH - h * 0.7, w * 0.55, h * 0.16, Au[1]); pixelBlob(g, xx - 4, NH - h * 0.74, w * 0.25, h * 0.08, Au[2]);
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

// ---------------------------------------------------------------------------------------------------------------
// The park from the outside (behind him, back the way he came)

const PW = 760, PH = 280;
const paintParkBack = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.3), P = PLY.map(T), S = STEEL.map(T), Wd = ['#2A1A0E', '#46301C', '#64462A', '#82603C', '#A07C52'].map(T);
  const base = PH - 40;
  // ---- the backs of two mountain flats: raw plywood sheets in courses (their seams, the grain, a water stain), the
  // outline the front's peaks cut, a 2x4 lattice bracing them, kickers down to sandbags; PROP 7 / PROP 12 stenciled
  const flats: [number, number, number, string][] = [[20, 300, 210, '7'], [250, 240, 160, '12']];
  for (const [fx, fw, fh, n] of flats) {
    const pts: [number, number][] = [[fx, base], [fx + fw * 0.08, base - fh * 0.5], [fx + fw * 0.3, base - fh], [fx + fw * 0.42, base - fh * 0.74], [fx + fw * 0.62, base - fh * 0.92], [fx + fw * 0.82, base - fh * 0.48], [fx + fw, base]];
    g.fillStyle = INK; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y - 1) : g.moveTo(x - 1, y))); g.closePath(); g.fill();
    g.save(); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
    for (let r = 0, y = base - fh; y < base; y += 48, r++) for (let x = fx - (r % 2) * 48; x < fx + fw; x += 96) {
      const k = hash(fx + r * 7 + x);
      box(g, x, y, 96, 48, k < 0.3 ? P[3] : k > 0.75 ? P[4] : P[3]);
      for (let gy = y + 4; gy < y + 46; gy += 5) box(g, x + 4 + hash(x + gy) * 30, gy, 30 + hash(gy) * 40, 1, P[2]);
      box(g, x, y, 1, 48, P[1]); box(g, x, y, 96, 1, P[1]);
      if (k > 0.85) { g.globalAlpha = 0.5; pixelBlob(g, x + 40, y + 30, 18, 10, P[1]); g.globalAlpha = 1; }
    }
    // (the front's paint lapped round the cut edge: a blue lip)
    g.restore();
    g.strokeStyle = T('#4A5A9A'); g.lineWidth = 2; g.beginPath(); pts.slice(1, -1).forEach(([x, y], i) => (i ? g.lineTo(x, y + 1) : g.moveTo(x, y + 1))); g.stroke();
    // (the lattice: uprights, rails, diagonals; kickers out to sandbags)
    const stud = (xa: number, ya: number, xb: number, yb: number) => { g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(xa, ya); g.lineTo(xb, yb); g.stroke(); g.strokeStyle = Wd[3]; g.lineWidth = 3; g.stroke(); g.strokeStyle = Wd[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(xa - 1, ya); g.lineTo(xb - 1, yb); g.stroke(); };
    for (let k = 1; k < 5; k++) { const ux = fx + (fw * k) / 5, top = base - fh * (0.4 + 0.45 * Math.sin((k / 5) * Math.PI)); stud(ux, base, ux, top); }
    for (const yy of [base - fh * 0.25, base - fh * 0.5]) stud(fx + fw * 0.1, yy, fx + fw * 0.9, yy);
    for (let k = 1; k < 4; k++) stud(fx + (fw * k) / 5, base - fh * 0.25, fx + (fw * (k + 1)) / 5, base - fh * 0.5);
    for (const kx of [fx + fw * 0.3, fx + fw * 0.7]) {
      stud(kx, base - fh * 0.5, kx + 40, base);
      box(g, kx + 30, base - 9, 24, 9, INK); box(g, kx + 31, base - 8, 22, 8, T('#7A6A50')); box(g, kx + 31, base - 8, 22, 3, T('#9C8C6E')); box(g, kx + 40, base - 8, 1, 8, T('#5A4C38'));
    }
    signText(g, `PROP ${n}`, fx + fw * 0.5, base - 24, stenciled(T('#1E1E1E'), 2));
  }
  // ---- the log ride's lift hill: a timber trestle climbing right, the trough on it, the chain's glint
  const lx0 = 470, lx1 = 640, ly0 = base - 20, ly1 = base - 150;
  for (let k = 0; k <= 8; k++) {
    const x = lx0 + ((lx1 - lx0) * k) / 8, y = ly0 + ((ly1 - ly0) * k) / 8;
    box(g, x - 2, y + 8, 4, base - y - 8, INK); box(g, x - 1, y + 8, 2, base - y - 8, Wd[2]); box(g, x - 1, y + 8, 1, base - y - 8, Wd[4]);
    if (k < 8) { const nx = lx0 + ((lx1 - lx0) * (k + 1)) / 8, ny = ly0 + ((ly1 - ly0) * (k + 1)) / 8; g.strokeStyle = Wd[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(x, base); g.lineTo(nx, ny + 12); g.moveTo(x, y + 12); g.lineTo(nx, base); g.stroke(); }
    for (let yy = y + 30; yy < base; yy += 28) box(g, x - 2, yy, (lx1 - lx0) / 8 + 4, 2, Wd[1]);
  }
  g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.moveTo(lx0 - 20, ly0 + 8); g.lineTo(lx1 + 10, ly1 - 4); g.stroke();
  g.strokeStyle = Wd[2]; g.lineWidth = 9; g.stroke();
  g.strokeStyle = Wd[4]; g.lineWidth = 2; g.beginPath(); g.moveTo(lx0 - 20, ly0 + 4); g.lineTo(lx1 + 10, ly1 - 8); g.stroke();
  for (let k = 0; k < 16; k++) { const u = k / 16; box(g, lx0 - 20 + (lx1 - lx0 + 30) * u, ly0 + 2 + (ly1 - ly0 - 12) * u, 2, 1, S[5]); }
  // ---- a light tower (caged lamps, lit after dark)
  const tx = 700;
  box(g, tx - 1, base - 210, 3, 210, S[2]); box(g, tx - 1, base - 210, 1, 210, S[5]);
  for (let y = base - 200; y < base; y += 18) { g.strokeStyle = S[2]; g.lineWidth = 1; g.beginPath(); g.moveTo(tx - 6, y); g.lineTo(tx + 6, y + 18); g.stroke(); }
  box(g, tx - 16, base - 216, 34, 3, S[3]);
  for (const hx of [tx - 15, tx - 4, tx + 7]) { box(g, hx, base - 226, 9, 10, INK); box(g, hx + 1, base - 225, 7, 8, tod.lamps > 0.3 ? '#FFF0B0' : S[2]); }
  // ---- the back fence along its berm: chain-link (the diamond weave), posts, three strands of barbed wire on the
  // arms, a gap torn in it and peeled back, a sun-bleached sign wired on
  const fb = PH - 8, ft = fb - 26;
  g.fillStyle = T('#2E3A22'); g.beginPath(); g.moveTo(0, PH); g.lineTo(0, fb - 2); for (let x = 0; x <= PW; x += 20) g.lineTo(x, fb - 2 - Math.sin(x * 0.02) * 2); g.lineTo(PW, PH); g.closePath(); g.fill();
  const gapA = 380, gapB = 410;
  g.strokeStyle = S[4]; g.lineWidth = 1;
  for (let x = 0; x < PW; x += 4) {
    if (x > gapA && x < gapB) continue;
    g.beginPath(); g.moveTo(x, fb); g.lineTo(x + 4, ft); g.moveTo(x + 4, fb); g.lineTo(x, ft); g.stroke();
  }
  // (the torn flap, rolled back)
  g.beginPath(); g.moveTo(gapA, ft); g.quadraticCurveTo(gapA - 10, ft + 14, gapA + 4, fb); g.moveTo(gapB, ft + 6); g.quadraticCurveTo(gapB + 14, ft + 10, gapB + 6, fb); g.stroke();
  for (let x = 0; x <= PW; x += 60) { box(g, x, ft - 8, 3, fb - ft + 8, INK); box(g, x, ft - 8, 2, fb - ft + 8, S[3]); box(g, x, ft - 8, 8, 2, S[3]); }
  for (let s = 0; s < 3; s++) { g.strokeStyle = S[2]; g.beginPath(); for (let x = 0; x <= PW; x += 6) g.lineTo(x + 4, ft - 3 - s * 3 + ((x / 6) % 2)); g.stroke(); }
  box(g, gapA - 70, ft + 4, 40, 16, INK); box(g, gapA - 69, ft + 5, 38, 14, T('#D8D4C4')); box(g, gapA - 69, ft + 5, 38, 4, T('#B03A2E'));
  for (let i = 0; i < 3; i++) box(g, gapA - 64 + i * 10, ft + 12, 7, 2, T('#5A5A5A'));
  mist(g, PW, PH - 70, 70, skyAt(0.92, tod), 0, 0.18, 4);
};

// ---------------------------------------------------------------------------------------------------------------

export const drawWoodsFar = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), cam = state.camera.x, f = state.frame, gl = Math.round(groundLine(state)), dy = gl - 461;
  drawTodSky(c, 0, 0, W, H, SKY, { bands: 16, horizon: gl - 70, sun: [620, 100], moon: [160, 80], t: f, scroll: cam * 0.01 });
  tile(c, `clouds-${tod.key}`, cam * 0.012 + f * 0.04, 20 + dy * 0.15, CH, CW, g => paintClouds(g, tod));
  hazeBands(c, 0, gl - 250, W, 160, hourMix('#E2DCC8', '#E8A878', '#2A2E4A', tod), 0, 0.2, 6);
  drawBirds(c, f, cam, 70 + dy * 0.2);
  tile(c, `peaks-${tod.key}`, cam * 0.03 + 700, gl - RH - 61 - dy * 0.4, RH, RW, g => paintPeaks(g, tod));
  // (the park back the way he came, where its things stand on the land's map, seen from outside: Timber Tumble's
  // back (the plywood and the armature), the neighbors' landmarks; the ridge in front of their feet)
  const prog = cam + W / 2 - FRX, tf = gl + 30 - dy * 0.3;
  drawTeases(c, prog, tf, f, 'far', { outside: true });
  drawTeases(c, prog, tf, f, 'near', { outside: true });
  tile(c, `ridge-${tod.key}`, cam * 0.08 + 900, gl - FH - 11 - dy * 0.25, FH, FW, g => paintForestRidge(g, tod));
  hazeBands(c, 0, gl - 90, W, 80, skyAt(0.94, tod), 0, 0.22, 4);
  tile(c, `near-${tod.key}`, cam * 0.16 + 90, gl - NH + 6, NH, NW, g => paintNearPines(g, tod));
  // (the park, back the way he came, nearer than that ridge: sliding off to the left as he walks on)
  const px = 40 - (cam - x0) * 0.22;
  if (px > -PW) { c.save(); c.translate(Math.round(px), Math.round(gl - PH + 6)); stamp(c, `wd-park-${tod.key}-${fontIn()}`, 0, 0, PW, PH, g => paintParkBack(g, tod)); c.restore(); }
  const T = farCol(tod, 0.06);
  if (gl + 2 < H) bandedGradient(c, 0, gl + 2, W, H - gl - 2, [T('#14261A'), T('#102014'), T('#0C1A10'), T('#08140C')], 5);
  return true;
};
