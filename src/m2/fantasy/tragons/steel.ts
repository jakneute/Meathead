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
import { INK, mix, box, dimmed, polyF, type Ctx } from '../kit';
import { GY, LANE_COL, TUNNEL, END_S, TL, type Lane } from './layout';
import { trackPt, spinAt } from './track';
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

interface Q { x: number; y: number; d: number; roll: number }
const raw: Q[] = [];
/** Per point: the roof's spot, the spine, the two rails (near / far), whether it's in a hole. */
interface Pts { mx: number[]; my: number[]; sx: number[]; sy: number[]; nx: number[]; ny: number[]; ax: number[]; ay: number[]; bx: number[]; by: number[]; d: number[]; gone: boolean[]; flip: number }
const pts: Pts = { mx: [], my: [], sx: [], sy: [], nx: [], ny: [], ax: [], ay: [], bx: [], by: [], d: [], gone: [], flip: 1 };

/** The steel's and each lane's spine's ramps into the haze at a depth (fog's own step: a thousandth), kept per lane
 *  while the depth holds. */
const STEEL = ['#2E3242', '#4A5068', '#7A84A0', '#B8C2D8', '#E8EEF8'];
const SPINE = LANE_COL.map(([main, light, dark]) => [mix(dark, INK, 0.45), mix(dark, '#000000', 0.15), main, mix(main, light, 0.55)]);
const ramps = [0, 1, 2].map(() => new Map<number, { steel: string[]; sp: string[] }>());
const rampsFor = (lane: Lane, d: number) => {
  const q = Math.round(d * 1000), m = ramps[lane];
  let r = m.get(q);
  if (!r) {
    if (m.size > 1024) m.clear();
    r = { steel: STEEL.map(col => fog(col, d)), sp: SPINE[lane].map(col => fog(col, d)) };
    m.set(q, r);
  }
  return r;
};

/** A run of track on a lane (s0..s1), its depth the middle's (the caller sorts on it). */
/** The end of the line: just past where the dragons' heads stop at the unload (buffer stops, under the decks). */
const LINE_END = END_S + TL + 36;

export const drawSteel = (c: Ctx, state: GameState, t: Tragons, eye: { x: number; y: number }, lane: Lane, s0: number, s1: number) => {
  // (nothing past the end of the line: no track running on across the yard)
  if (s0 >= LINE_END) return;
  const ends = s1 >= LINE_END;
  if (ends) s1 = LINE_END;
  const light = LANE_COL[lane][1];
  const n = Math.round((s1 - s0) / STEP);
  for (let k = -1; k <= n + 1; k++) { const r = (raw[k + 1] ??= { x: 0, y: 0, d: 1, roll: 0 }); trackPt(t.spins, t.dist, lane, s0 + k * STEP, r); }
  const gaps = t.gaps.filter(g => g.lane === lane && g.b > s0 - STEP && g.a < s1 + STEP);
  // (the holes in order along the track: one sweep marks the points in them, the furthest end reached so far)
  const byA = gaps.length > 1 ? [...gaps].sort((g, h) => g.a - h.a) : gaps;
  let gi = 0, gEnd = -Infinity;
  const ex = eye.x, ey = eye.y;
  for (let k = 0; k <= n; k++) {
    const q = raw[k + 1], p0 = raw[k], p1 = raw[k + 2];
    const mx = ex + (q.x - ex) * q.d, my = ey + (q.y - ey) * q.d;
    const ax0 = ex + (p0.x - ex) * p0.d, ay0 = ey + (p0.y - ey) * p0.d, ax1 = ex + (p1.x - ex) * p1.d, ay1 = ey + (p1.y - ey) * p1.d;
    // (the normal: the chord between the neighbors turned a quarter, unit length)
    const tx = ax1 - ax0, ty = ay1 - ay0, tl = Math.sqrt(tx * tx + ty * ty);
    const nx = tl > 0 ? -ty / tl : 0, ny = tl > 0 ? tx / tl : 1;
    const cr = Math.cos(q.roll), sr = Math.sin(q.roll);
    const off = RAIL * q.d * cr;
    // (the rails: a gauge apart in depth, turned round the spine with the roll)
    const dn = q.d + DG * cr, df = q.d - DG * cr, side = GG * q.d * sr;
    pts.mx[k] = mx; pts.my[k] = my; pts.nx[k] = nx; pts.ny[k] = ny; pts.d[k] = q.d;
    pts.ax[k] = ex + (q.x - ex) * dn + nx * (off + side); pts.ay[k] = ey + (q.y - ey) * dn + ny * (off + side);
    pts.bx[k] = ex + (q.x - ex) * df + nx * (off - side); pts.by[k] = ey + (q.y - ey) * df + ny * (off - side);
    pts.sx[k] = mx + nx * (off + 9 * q.d * cr); pts.sy[k] = my + ny * (off + 9 * q.d * cr);
    const s = s0 + k * STEP;
    while (gi < byA.length && byA[gi].a <= s) { if (byA[gi].b > gEnd) gEnd = byA[gi].b; gi++; }
    pts.gone[k] = s < gEnd;
  }
  const mid = Math.floor(n / 2), dm = pts.d[mid];
  pts.flip = Math.cos(raw[mid + 1].roll) >= 0 ? 1 : -1;

  // THE MOUNTAIN: the inside of it (the bore, the rock round it) is drawn behind everything (scenery.ts drawCaveInside),
  // the track through it as anywhere else; the dark's the lighting's (index.ts), never black, the dragons' lamps in it.
  // Here only the rock faces at its mouths (below), over the track going in.
  // The supports: every 420 of track, down to the park at their depth (none under a hole or a loop)
  for (let s = Math.ceil(s0 / 420) * 420; s < s1; s += 420) {
    if (gaps.some(g => s >= g.a - 40 && s < g.b + 40) || spinAt(t.spins, lane, s) || (t.phase !== 'done' && s > TUNNEL.a - 60 && s < TUNNEL.b + 60)) continue;
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
  const { steel, sp } = rampsFor(lane, dm);
  const night = timeOfDay().lamps > 0.35;
  c.lineJoin = 'round'; c.lineCap = 'round';
  const NXs = pts.nx, NYs = pts.ny;
  const path = (run: number[], X: number[], Y: number[], o = 0) => {
    c.beginPath();
    let k = run[0];
    c.moveTo(X[k] - NXs[k] * o, Y[k] - NYs[k] * o);
    for (let i = 1; i < run.length; i++) { k = run[i]; c.lineTo(X[k] - NXs[k] * o, Y[k] - NYs[k] * o); }
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

  // The end of the line: a buffer stop on the end of the spine (timber baulk, iron frame, red and white), a pier under it
  if (ends) {
    const x = pts.sx[n], y = pts.sy[n], d = pts.d[n], gy = ey + (GY - ey) * d;
    const Ir = steel, R = ['#7A1A1A', '#C42828', '#F2EAD0'].map(col => fog(dimmed(col), d));
    box(c, x - 14 * d, y - 6 * d, 18 * d, gy - y + 6 * d, INK); box(c, x - 13 * d, y - 5 * d, 16 * d, gy - y + 4 * d, fog(dimmed('#8A847A'), d));
    box(c, x - 13 * d, y - 5 * d, 4 * d, gy - y + 4 * d, fog(dimmed('#B4AEA2'), d));
    for (let yy = y + 16 * d; yy < gy - 4; yy += 18 * d) box(c, x - 13 * d, yy, 16 * d, Math.max(1, d), fog(dimmed('#5A5650'), d));
    box(c, x - 4 * d, y - 34 * d, 16 * d, 40 * d, INK); box(c, x - 3 * d, y - 33 * d, 14 * d, 38 * d, Ir[2]);
    box(c, x + 1 * d, y - 30 * d, 12 * d, 18 * d, INK); box(c, x + 2 * d, y - 29 * d, 10 * d, 16 * d, R[1]);
    for (let k = 0; k < 3; k++) box(c, x + 2 * d, y - 27 * d + k * 6 * d, 10 * d, 2 * d, R[2]);
    box(c, x - 3 * d, y - 33 * d, 14 * d, Math.max(1, d), Ir[4]);
  }

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

  // The mountain's mouths: the rock face the bore's cut into (its ragged edge going up into the slope and down under
  // the track, an overhang over the opening throwing its shadow in, snow along the lip, ferns hanging off it), lit up
  // and to the left, at the track's depth
  for (const [s, side] of [[TUNNEL.a, -1], [TUNNEL.b, 1]] as const) {
    if (s < s0 || s >= s1 || t.phase === 'done') continue;
    const k = Math.max(0, Math.min(n, Math.round((s - s0) / STEP))), x = pts.mx[k], y = pts.my[k], d = pts.d[k];
    const R = ['#2A2030', '#3A2E3E', '#4E3E50', '#665464', '#7E6C7A', '#9A8894'].map(col => fog(dimmed(col), d));
    const Sn = ['#C8D4EC', '#E8EEF8', '#FFFFFF'].map(col => fog(col, d)), Fn = ['#1E4A2A', '#2E6A3A', '#4A8A4A'].map(col => fog(dimmed(col), d));
    // (the face: from the ridge down past the bore to under the track, ragged, standing out a little from the bore)
    const o = side * 1, ex = x + o * 4 * d;
    // (above the opening and below it: the bore's left open between, its edge in shadow)
    const top: [number, number][] = [[ex - o * 8 * d, y - 176 * d], [ex + o * 26 * d, y - 168 * d], [ex + o * 18 * d, y - 148 * d], [ex + o * 34 * d, y - 128 * d], [ex + o * 14 * d, y - 118 * d], [ex - o * 8 * d, y - 120 * d]];
    const bot: [number, number][] = [[ex - o * 8 * d, y + 62 * d], [ex + o * 20 * d, y + 64 * d], [ex + o * 32 * d, y + 80 * d], [ex + o * 24 * d, y + 102 * d], [ex - o * 8 * d, y + 104 * d]];
    // (the three bores are one opening: the face over it is the top track's, under it the bottom's)
    if (lane === 2) {
      polyF(c, bot.map(([px, py]) => [px + o * 2, py + 1] as [number, number]), INK); polyF(c, bot, R[3]);
      polyF(c, [bot[0], bot[1], [ex + o * 10 * d, y + 74 * d]], R[4]);
      box(c, Math.min(ex, ex + o * 30 * d), y + 96 * d, 30 * d, 4 * d, Sn[0]);
    }
    if (lane !== 0) continue;
    polyF(c, top.map(([px, py]) => [px + o * 2, py + 1] as [number, number]), INK); polyF(c, top, R[3]);
    polyF(c, [top[0], top[1], top[2], [ex, y - 136 * d]], R[4]);
    box(c, Math.min(ex - o * 8 * d, ex + o * 14 * d), y - 120 * d, 22 * d, 3 * d, R[1]);
    // (the overhang over the opening: a lip of rock jutting out from the face over the track going in, its shadow down
    // over the mouth)
    const L = ex + o * 30 * d;
    polyF(c, [[L, y - 128 * d], [L + o * 40 * d, y - 134 * d], [L + o * 70 * d, y - 124 * d], [L + o * 46 * d, y - 114 * d], [L, y - 108 * d]], INK);
    polyF(c, [[L, y - 126 * d], [L + o * 40 * d, y - 132 * d], [L + o * 66 * d, y - 123 * d], [L + o * 44 * d, y - 116 * d], [L, y - 110 * d]], R[3]);
    box(c, Math.min(L, L + o * 60 * d), y - 132 * d, 60 * d, 2 * d, R[5]);
    c.globalAlpha = 0.35; polyF(c, [[L, y - 110 * d], [L + o * 44 * d, y - 115 * d], [L + o * 30 * d, y - 80 * d], [ex, y - 60 * d]], '#0B0612'); c.globalAlpha = 1;
    // (snow along the top of the lip and the face, a drift; ferns hanging off the lip)
    polyF(c, [[L, y - 133 * d], [L + o * 40 * d, y - 139 * d], [L + o * 66 * d, y - 128 * d], [L + o * 40 * d, y - 133 * d]], Sn[1]);
    polyF(c, [[ex - o * 6 * d, y - 174 * d], [ex + o * 26 * d, y - 168 * d], [ex + o * 30 * d, y - 160 * d], [ex, y - 164 * d]], Sn[2]);
    box(c, Math.min(L, L + o * 36 * d), y - 138 * d, 36 * d, 1, Sn[2]);
    for (let f = 0; f < 5; f++) {
      const fx = L + o * (6 + f * 12) * d, fy = y - 114 * d + (f % 2) * 3 * d, len = (10 + (f * 5) % 9) * d;
      c.strokeStyle = Fn[f % 2]; c.lineWidth = Math.max(1, 2 * d); c.beginPath(); c.moveTo(fx, fy); c.quadraticCurveTo(fx - o * 4 * d, fy + len * 0.6, fx + o * 2 * d, fy + len); c.stroke();
      box(c, fx + o * 2 * d - d, fy + len * 0.5, 2 * d, 2 * d, Fn[2]);
    }
  }
};
