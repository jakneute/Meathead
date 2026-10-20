// Truelling Tragons' steel: a run of a lane's track at its depths about the scene's one eye. Real coaster steel: two
// running rails a gauge apart IN DEPTH (so from above or below the eye they open up and the ties show between them, and
// through a corkscrew or the helix they twist round the spine with the roll), the ties, the lane's box spine under them
// (inked, shaded in steps, its lane stripe lit along the top, running lights along it after dark), lattice supports
// down to the park at their own depth on concrete footings, the broken ends torn and sparking, the mountain's tunnel
// mouths. No lit tops: it's not to stand on.
//
// The supports are a lattice strip painted once per hour and haze band (an offscreen canvas) and put down cut to
// length: one drawImage a support, the lattice keeping its pitch at any depth.

import type { GameState } from '../../../m1/game/core/state';
import { timeOfDay } from '../../timeOfDay';
import { INK, mix, box, dimmed, type Ctx } from '../kit';
import { GY, LANE_COL, TUNNEL, type Lane } from './layout';
import { trackPt, spinAt, type Pt } from './track';
import type { Tragons } from './state';
import { fog } from './scene';

/** Under a dragon's roof: its wheels on the rail this far down. */
export const RAIL = 48;
/** The rails' gauge: apart in depth, and round the spine through a roll (px at depth 1). */
const DG = 0.024, GG = 5;
/** Between the points drawn. */
const STEP = 12;

// ---------------------------------------------------------------------------------------------------------------
// The supports' lattice strips

const STRIP_W = 26, STRIP_H = 1600, SRES = 2;
const strips = new Map<string, HTMLCanvasElement>();
const BANDS = [0.72, 0.86, 1, 1.24];
const bandOf = (d: number) => (d < 0.79 ? 0 : d < 0.93 ? 1 : d < 1.1 ? 2 : 3);
const strip = (band: number) => {
  if (typeof document === 'undefined') return null;
  const key = `${band}-${timeOfDay().key}`;
  let cv = strips.get(key);
  if (cv) return cv;
  if (strips.size > 24) strips.clear();
  cv = document.createElement('canvas'); cv.width = STRIP_W * SRES; cv.height = STRIP_H * SRES;
  const g = cv.getContext('2d')!;
  g.scale(SRES, SRES);
  const d = BANDS[band], S = ['#2A2C3C', '#3E4256', '#566078', '#7A86A0', '#A4B0C8'].map(c => fog(dimmed(c), d));
  // (two chords, lit on the left, shaded on the right; zigzag lacing; a batten every so often)
  box(g, 0, 0, 6, STRIP_H, S[0]); box(g, 1, 0, 4, STRIP_H, S[3]); box(g, 1, 0, 1, STRIP_H, S[4]);
  box(g, STRIP_W - 6, 0, 6, STRIP_H, S[0]); box(g, STRIP_W - 5, 0, 4, STRIP_H, S[2]); box(g, STRIP_W - 2, 0, 1, STRIP_H, S[1]);
  g.lineWidth = 2;
  for (let y = 0; y < STRIP_H; y += 28) {
    g.strokeStyle = S[0]; g.beginPath(); g.moveTo(5, y); g.lineTo(STRIP_W - 5, y + 14); g.lineTo(5, y + 28); g.stroke();
    g.strokeStyle = S[2]; g.lineWidth = 1; g.beginPath(); g.moveTo(5, y + 0.5); g.lineTo(STRIP_W - 5, y + 14.5); g.lineTo(5, y + 28.5); g.stroke(); g.lineWidth = 2;
    if (y % 112 === 0) { box(g, 4, y, STRIP_W - 8, 3, S[0]); box(g, 4, y, STRIP_W - 8, 1, S[3]); }
  }
  strips.set(key, cv);
  return cv;
};

/** A support from (x, top) down to the ground at gy, at depth d. */
const support = (c: Ctx, x: number, top: number, gy: number, d: number) => {
  const h = gy - top;
  if (h < 4) return;
  const w = STRIP_W * d, cv = strip(bandOf(d));
  if (cv) {
    const sh = Math.min(STRIP_H * SRES, (h / d) * SRES);
    const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = true;
    c.drawImage(cv, 0, 0, STRIP_W * SRES, sh, x - w / 2, top, w, Math.min(h, (STRIP_H * d)));
    c.imageSmoothingEnabled = sm;
  } else box(c, x - w / 2, top, w, h, fog('#4A5068', d));
  // (its cap plate, its concrete footing lit along the top)
  const C = ['#5A5650', '#8A847A', '#B4AEA2'].map(col => fog(dimmed(col), d));
  box(c, x - w * 0.6, top - 2 * d, w * 1.2, 5 * d, fog(dimmed('#3E4256'), d));
  box(c, x - w * 0.75 - 1, gy - 9 * d, w * 1.5 + 2, 9 * d + 1, INK); box(c, x - w * 0.75, gy - 8 * d, w * 1.5, 8 * d, C[1]); box(c, x - w * 0.75, gy - 8 * d, w * 1.5, 2 * d, C[2]); box(c, x + w * 0.4, gy - 6 * d, w * 0.35, 6 * d, C[0]);
};

// ---------------------------------------------------------------------------------------------------------------
// The track

const P: Pt = { x: 0, y: 0, d: 1, roll: 0 };
interface Q { x: number; y: number; d: number; roll: number }
const raw: Q[] = [];
/** Per point: the roof's spot, the spine, the two rails (near / far), whether it's in a hole. */
interface Pts { mx: number[]; my: number[]; sx: number[]; sy: number[]; nx: number[]; ny: number[]; ax: number[]; ay: number[]; bx: number[]; by: number[]; d: number[]; gone: boolean[]; flip: number }
const pts: Pts = { mx: [], my: [], sx: [], sy: [], nx: [], ny: [], ax: [], ay: [], bx: [], by: [], d: [], gone: [], flip: 1 };

/** A run of track on a lane (s0..s1), its depth the middle's (the caller sorts on it). */
export const drawSteel = (c: Ctx, state: GameState, t: Tragons, eye: { x: number; y: number }, lane: Lane, s0: number, s1: number) => {
  const [main, light, dark] = LANE_COL[lane];
  const n = Math.round((s1 - s0) / STEP);
  for (let k = -1; k <= n + 1; k++) { trackPt(t.spins, t.dist, lane, s0 + k * STEP, P); raw[k + 1] = { x: P.x, y: P.y, d: P.d, roll: P.roll }; }
  const gaps = t.gaps.filter(g => g.lane === lane && g.b > s0 - STEP && g.a < s1 + STEP);
  const ex = eye.x, ey = eye.y;
  for (let k = 0; k <= n; k++) {
    const q = raw[k + 1], p0 = raw[k], p1 = raw[k + 2];
    const mx = ex + (q.x - ex) * q.d, my = ey + (q.y - ey) * q.d;
    const ax0 = ex + (p0.x - ex) * p0.d, ay0 = ey + (p0.y - ey) * p0.d, ax1 = ex + (p1.x - ex) * p1.d, ay1 = ey + (p1.y - ey) * p1.d;
    const a = Math.atan2(ay1 - ay0, ax1 - ax0), nx = -Math.sin(a), ny = Math.cos(a);
    const cr = Math.cos(q.roll), sr = Math.sin(q.roll);
    const off = RAIL * q.d * cr;
    // (the rails: a gauge apart in depth, turned round the spine with the roll)
    const dn = q.d + DG * cr, df = q.d - DG * cr, side = GG * q.d * sr;
    pts.mx[k] = mx; pts.my[k] = my; pts.nx[k] = nx; pts.ny[k] = ny; pts.d[k] = q.d;
    pts.ax[k] = ex + (q.x - ex) * dn + nx * (off + side); pts.ay[k] = ey + (q.y - ey) * dn + ny * (off + side);
    pts.bx[k] = ex + (q.x - ex) * df + nx * (off - side); pts.by[k] = ey + (q.y - ey) * df + ny * (off - side);
    pts.sx[k] = mx + nx * (off + 9 * q.d * cr); pts.sy[k] = my + ny * (off + 9 * q.d * cr);
    const s = s0 + k * STEP;
    pts.gone[k] = gaps.some(g => s >= g.a && s < g.b);
  }
  const mid = Math.floor(n / 2), dm = pts.d[mid];
  pts.flip = Math.cos(raw[mid + 1].roll) >= 0 ? 1 : -1;

  // The supports: every 420 of track, down to the park at their depth (none under a hole or a loop)
  for (let s = Math.ceil(s0 / 420) * 420; s < s1; s += 420) {
    if (gaps.some(g => s >= g.a - 40 && s < g.b + 40) || spinAt(t.spins, lane, s)) continue;
    const k = Math.max(0, Math.min(n, Math.round((s - s0) / STEP)));
    const d = pts.d[k], gy = ey + (GY - ey) * d;
    if (pts.sy[k] > gy - 8) continue;
    support(c, pts.sx[k], pts.sy[k] + 5 * d, gy, d);
  }

  // The runs between the holes
  const runs: number[][] = [];
  let cur: number[] = [];
  for (let k = 0; k <= n; k++) { if (pts.gone[k]) { if (cur.length) runs.push(cur); cur = []; } else cur.push(k); }
  if (cur.length) runs.push(cur);
  const steel = ['#2E3242', '#4A5068', '#7A84A0', '#B8C2D8', '#E8EEF8'].map(col => fog(col, dm));
  const sp = [mix(dark, INK, 0.45), mix(dark, '#000000', 0.15), main, mix(main, light, 0.55)].map(col => fog(col, dm));
  const night = timeOfDay().lamps > 0.35;
  c.lineJoin = 'round'; c.lineCap = 'round';
  const path = (run: number[], X: number[], Y: number[], o = 0) => {
    c.beginPath();
    run.forEach((k, i) => { const x = X[k] - pts.nx[k] * o, y = Y[k] - pts.ny[k] * o; if (i) c.lineTo(x, y); else c.moveTo(x, y); });
  };
  for (const run of runs) {
    if (run.length < 2) continue;
    // (the far rail first, darker)
    const [FX, FY, NX, NY] = pts.flip > 0 ? [pts.bx, pts.by, pts.ax, pts.ay] : [pts.ax, pts.ay, pts.bx, pts.by];
    c.strokeStyle = INK; c.lineWidth = Math.max(1.5, 4 * dm); path(run, FX, FY); c.stroke();
    c.strokeStyle = steel[2]; c.lineWidth = Math.max(1, 2.2 * dm); c.stroke();
    // (the ties, rail to rail and down to the spine)
    c.strokeStyle = steel[0]; c.lineWidth = Math.max(1, 2.4 * dm); c.beginPath();
    for (const k of run) if (k % 2 === 0) { c.moveTo(pts.bx[k], pts.by[k]); c.lineTo(pts.ax[k], pts.ay[k]); c.moveTo((pts.bx[k] + pts.ax[k]) / 2, (pts.by[k] + pts.ay[k]) / 2); c.lineTo(pts.sx[k], pts.sy[k]); }
    c.stroke();
    // (the spine: inked, its side in shade, the lane's stripe lit along its top, a highlight)
    c.strokeStyle = INK; c.lineWidth = Math.max(2, 13 * dm); path(run, pts.sx, pts.sy); c.stroke();
    c.strokeStyle = sp[0]; c.lineWidth = Math.max(1.5, 10 * dm); c.stroke();
    c.strokeStyle = sp[1]; c.lineWidth = Math.max(1, 7 * dm); path(run, pts.sx, pts.sy, 0.8 * dm * pts.flip); c.stroke();
    c.strokeStyle = sp[2]; c.lineWidth = Math.max(1, 4.2 * dm); path(run, pts.sx, pts.sy, 1.8 * dm * pts.flip); c.stroke();
    c.strokeStyle = sp[3]; c.lineWidth = Math.max(0.8, 1.4 * dm); path(run, pts.sx, pts.sy, 3.4 * dm * pts.flip); c.stroke();
    // (the near rail, lit)
    c.strokeStyle = INK; c.lineWidth = Math.max(1.5, 4.4 * dm); path(run, NX, NY); c.stroke();
    c.strokeStyle = steel[3]; c.lineWidth = Math.max(1, 2.4 * dm); c.stroke();
    c.strokeStyle = steel[4]; c.lineWidth = Math.max(0.6, 0.9 * dm); path(run, NX, NY, 0.8 * dm); c.stroke();
    // (the running lights along the spine after dark: soft, in the lane's light)
    if (night) for (const k of run) if ((s0 / STEP + k) % 8 === 0) { box(c, pts.sx[k] - 1.5 * dm, pts.sy[k] - 1.5 * dm, 3 * dm, 3 * dm, light); c.globalAlpha = 0.25; box(c, pts.sx[k] - 4 * dm, pts.sy[k] - 4 * dm, 8 * dm, 8 * dm, light); c.globalAlpha = 1; }
  }
  c.lineCap = 'butt'; c.lineJoin = 'miter';

  // The broken ends: the spine torn and bent down, the rails curled off it, bolts out, sparking
  for (const g of gaps) for (const [s, dir] of [[g.a, 1], [g.b, -1]] as [number, number][]) {
    if (s < s0 || s >= s1) continue;
    const k = Math.max(0, Math.min(n, Math.round((s - s0) / STEP) - (dir > 0 ? 1 : 0)));
    const x = pts.sx[k], y = pts.sy[k], d = pts.d[k];
    c.strokeStyle = INK; c.lineWidth = 9 * d; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x - dir * 4 * d, y); c.lineTo(x + dir * 14 * d, y + 18 * d); c.lineTo(x + dir * 10 * d, y + 36 * d); c.stroke();
    c.strokeStyle = sp[1]; c.lineWidth = 6 * d; c.stroke();
    c.strokeStyle = sp[2]; c.lineWidth = 2 * d; c.stroke();
    for (const [X, Y] of [[pts.ax, pts.ay], [pts.bx, pts.by]] as const) {
      c.strokeStyle = steel[3]; c.lineWidth = 2 * d; c.beginPath(); c.moveTo(X[k], Y[k]); c.quadraticCurveTo(X[k] + dir * 16 * d, Y[k] - 6 * d, X[k] + dir * 20 * d, Y[k] + 10 * d); c.stroke();
    }
    c.lineCap = 'butt';
    for (let b = 0; b < 3; b++) box(c, x + dir * (6 + b * 5) * d, y + (6 + b * 9) * d, 2 * d, 2 * d, steel[1]);
    const f = state.frame;
    if (f % 10 < 4) for (let b = 0; b < 4; b++) box(c, x + dir * (10 + ((f * 3 + b * 7) % 14)) * d, y + (16 + ((f + b * 5) % 12)) * d, 2, 2, b % 2 ? '#FFFFFF' : '#FDE047');
  }

  // The mountain's tunnel mouths: rockwork portals round the dark the track goes into
  for (const s of [TUNNEL.a, TUNNEL.b]) {
    if (s < s0 || s >= s1 || t.phase === 'done') continue;
    const k = Math.max(0, Math.min(n, Math.round((s - s0) / STEP))), x = pts.mx[k], y = pts.my[k], d = pts.d[k];
    const R = ['#3A2E36', '#5A4A54', '#7A6A72', '#9A8A90'].map(col => fog(col, d));
    c.fillStyle = INK; c.beginPath(); c.ellipse(x, y - 24 * d, 74 * d, 116 * d, 0, Math.PI, 0); c.lineTo(x + 74 * d, y + 70 * d); c.lineTo(x - 74 * d, y + 70 * d); c.fill();
    c.fillStyle = R[1]; c.beginPath(); c.ellipse(x, y - 24 * d, 72 * d, 114 * d, 0, Math.PI, 0); c.lineTo(x + 72 * d, y + 68 * d); c.lineTo(x - 72 * d, y + 68 * d); c.fill();
    // (the rockwork: stepped boulders round the arch, lit up and left)
    for (let b = 0; b < 9; b++) {
      const a = Math.PI + (b / 8) * Math.PI, bx = x + Math.cos(a) * 64 * d, by = y - 24 * d + Math.sin(a) * 104 * d;
      c.fillStyle = R[b % 2 ? 2 : 1]; c.beginPath(); c.ellipse(bx, by, 14 * d, 11 * d, 0, 0, Math.PI * 2); c.fill();
      box(c, bx - 8 * d, by - 8 * d, 7 * d, 2 * d, R[3]);
    }
    c.fillStyle = '#0B0612'; c.beginPath(); c.ellipse(x, y - 20 * d, 52 * d, 96 * d, 0, Math.PI, 0); c.lineTo(x + 52 * d, y + 64 * d); c.lineTo(x - 52 * d, y + 64 * d); c.fill();
    c.fillStyle = '#1A1020'; c.beginPath(); c.ellipse(x, y - 20 * d, 52 * d, 96 * d, 0, Math.PI, Math.PI * 1.25); c.lineTo(x - 52 * d, y + 64 * d); c.fill();
  }
};
