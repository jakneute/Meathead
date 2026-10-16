// The boulevard's ground, in fake 3D (one eye for the lot: kit.ts's view). Going back from the play plane: the curb's
// top, then the Walk of Fame (charcoal terrazzo squares, brass strips between them running away toward the eye, a coral
// star rimmed in brass in every other one, its nobody's name inlaid in brass beside it), the movie palace's forecourt
// of cement squares with the handprints of nobodies in them, a strip of concrete along the fronts' feet; behind the
// fronts, the lot their bracing stands in. The holes in it (the sinkhole in the star pavement, the road work's trench)
// going all the way back, their walls going down into the dark. At the play plane: the curb (its lit top: he walks on
// it), the gutter, the street under it (bent the SNES way so it fans out as he goes by), the holes' near walls hung
// under their lips.

import { CANVAS_WIDTH } from '../../../m1/constants';
import { bendFloor, BEND } from '../../intro/art/kit';
import { GY } from '../geometry';
import { X, SINK, TRENCH, TRAM, STAR_NAMES, STAR_STEP, GROUND } from './layout';
import {
  type Ctx, type View, INK, box, checker, mix, hash, poly, at, stamp, bandedGradient, hazeBands, timeOfDay, skyAt, signText, signW,
  FRONT_D, BACK_D, CHAR, CORAL, BRASS, CONCRETE, ASPHALT, LIP, PLY, SAND, STEVE, hour, plain, starPts,
} from './kit';

const W = CANVAS_WIDTH;
/** How far toward him the street under his feet comes. */
const BAND = 300;
/** The pavement's rows going back: the curb's top, the star row, the strip along the fronts. */
const CURB_D = 0.986, ROW_A = 0.979, ROW_B = 0.9, STAR_D = 0.94;
/** The movie palace's forecourt (instead of stars). */
const COURT = { a: X(2700), b: X(3450) };

export type PitKind = 'sink' | 'trench';
export interface Pit { a: number; b: number; kind: PitKind }
export const PITS: Pit[] = [{ a: X(SINK.a), b: X(SINK.b), kind: 'sink' }, { a: X(TRENCH.a), b: X(TRENCH.b), kind: 'trench' }];
const FLOOR: [number, number][] = GROUND.map(([a, b]) => [X(a), X(b)]);

/** A color going back (hazier the further). */
const tint = (col: string, d: number) => mix(hour(col, 0.15), skyAt(0.9, timeOfDay()), (1 - d) * 0.3);
const Q = (c: Ctx, eye: View['eye'], xa: number, xb: number, d0: number, d1: number, col: string) => poly(c, [at(eye, xa, GY, d0), at(eye, xb, GY, d0), at(eye, xb, GY, d1), at(eye, xa, GY, d1)], col);
const twoLines = (s: string) => {
  if (s.length <= 16) return [s];
  const mid = s.length / 2;
  let best = -1, score = 1e9;
  for (let i = 0; i < s.length; i++) if (s[i] === ' ') { const k = Math.abs(i - mid); if (k < score) { score = k; best = i; } }
  return best < 0 ? [s] : [s.slice(0, best), s.slice(best + 1)];
};

// ---------------------------------------------------------------------------------------------------------------
// Behind the fronts: the lot their bracing stands in

export const drawLotStrip = (c: Ctx, v: View) => {
  const eye = v.eye, x0 = v.cam.x - 20, x1 = v.cam.x + W + 20;
  const yAt = (d: number) => eye.y + (GY - eye.y) * d;
  const cols = ['#6E6258', '#62574E', '#584E46', '#4E453E'];
  for (let i = 0; i < 4; i++) {
    const d0 = FRONT_D - ((FRONT_D - BACK_D) * i) / 4, d1 = FRONT_D - ((FRONT_D - BACK_D) * (i + 1)) / 4;
    const ya = Math.round(yAt(d1)), yb = Math.round(yAt(d0)) + 1;
    box(c, x0, ya, x1 - x0, yb - ya, tint(cols[3 - i], d1));
    checker(c, x0, ya - 2, x1 - x0, 2, tint(cols[3 - i], d1));
  }
  // (gravel, cable runs snaking back, tire ruts)
  for (let k = 0; k < 3; k++) {
    const d = BACK_D + 0.025 + k * 0.035, y = Math.round(yAt(d)), step = 23 - k * 3;
    for (let x = Math.floor((x0 - eye.x) / d / step) * step + eye.x; x < eye.x + (x1 - eye.x) / d; x += step) {
      const [sx] = at(eye, x, GY, d), hh = hash(x * 0.37 + k);
      if (hh > 0.55) box(c, sx, y + (hh > 0.8 ? 1 : 0), 2, 1, tint(hh > 0.75 ? '#8A7E72' : '#3E3630', d));
    }
  }
  const yb = yAt(BACK_D);
  hazeBands(c, x0, Math.round(yb - 2), x1 - x0, Math.round(yAt(FRONT_D) - yb) + 2, skyAt(0.9, timeOfDay()), 0.18, 0, 3);
};

// ---------------------------------------------------------------------------------------------------------------
// The pavement going back

/** A Walk of Fame star lying in the pavement (projected): brass rim, coral, its emblem. */
const lyingStar = (c: Ctx, eye: View['eye'], x: number, d: number, r: number) => {
  const K = 0.00062;
  const P = (pts: [number, number][]) => pts.map(([px, py]) => at(eye, px, GY, d + (py - 0) * K)) as [number, number][];
  const S = (rr: number, dx = 0, dy = 0, inner = 0.42) => P(starPts(x + dx, dy, rr, 1, inner).map(([px, py]) => [px, py] as [number, number]));
  poly(c, S(r + 3, 1, 1.5), INK);
  poly(c, S(r + 2), tint(BRASS[2], d));
  poly(c, S(r + 1, -1, -1), tint(BRASS[4], d));
  poly(c, S(r - 2), tint(CORAL[3], d));
  poly(c, S(r * 0.5, -2, -2), tint(CORAL[4], d));
  const [ex, ey] = at(eye, x, GY, d);
  box(c, ex - 2, ey - 1, 4, 2, tint(BRASS[3], d)); box(c, ex - 1, ey - 2, 2, 1, tint(BRASS[5], d));
};

/** A handprint pressed in cement (screen space at its spot): a palm, four fingers and a thumb. */
const handprint = (c: Ctx, x: number, y: number, col: string, flip: boolean) => {
  const s = flip ? -1 : 1;
  box(c, x - 3, y, 7, 3, col);
  for (let k = 0; k < 4; k++) box(c, x - 3 + k * 2, y - 2 - (k === 1 || k === 2 ? 1 : 0), 1, 2 + (k === 1 || k === 2 ? 1 : 0), col);
  box(c, x + s * 4, y, 2, 1, col);
};

export const drawPavement = (c: Ctx, v: View) => {
  const eye = v.eye, f = timeOfDay();
  const L = eye.x - (eye.x - v.v0 + 260) / FRONT_D, R = eye.x + (v.v1 + 260 - eye.x) / FRONT_D;
  const runs: [number, number][] = FLOOR.map(([a, b]) => [Math.max(a, L), Math.min(b, R)] as [number, number]).filter(([a, b]) => b > a);
  for (const [a, b] of runs) {
    // (the curb's top, the brass strip, the star row in bands, the concrete along the fronts)
    Q(c, eye, a, b, 1, CURB_D, tint(CONCRETE[5], 1));
    Q(c, eye, a, b, CURB_D, ROW_A, tint(CONCRETE[3], CURB_D));
    Q(c, eye, a, b, ROW_A, ROW_A - 0.003, tint(BRASS[3], ROW_A));
    const bands = [CHAR[4], CHAR[3], CHAR[3], CHAR[2]];
    for (let i = 0; i < 4; i++) { const d0 = ROW_A - 0.003 - ((ROW_A - 0.003 - ROW_B) * i) / 4, d1 = ROW_A - 0.003 - ((ROW_A - 0.003 - ROW_B) * (i + 1)) / 4; Q(c, eye, a, b, d0, d1, tint(bands[i], d0)); }
    Q(c, eye, a, b, ROW_B, ROW_B - 0.003, tint(BRASS[2], ROW_B));
    Q(c, eye, a, b, ROW_B - 0.003, FRONT_D - 0.004, tint(CONCRETE[3], ROW_B));
    Q(c, eye, a, b, FRONT_D + 0.004, FRONT_D - 0.004, tint(CONCRETE[1], FRONT_D));
    // (the terrazzo's chips, scattered)
    for (let x = Math.floor(a / 7) * 7; x < b; x += 7) {
      const h1 = hash(x * 0.131), d = ROW_B + 0.004 + h1 * (ROW_A - ROW_B - 0.01);
      const [sx, sy] = at(eye, x + hash(x) * 6, GY, d);
      box(c, sx, sy, 1, 1, tint(h1 > 0.5 ? CHAR[5] : CORAL[2], d));
    }
    // (the concrete strip's joints toward the eye; the curb's)
    c.strokeStyle = tint(CONCRETE[1], 0.92); c.lineWidth = 1; c.beginPath();
    for (let x = Math.ceil(a / 100) * 100; x < b; x += 100) { const [p0, q0] = at(eye, x, GY, ROW_B - 0.003), [p1, q1] = at(eye, x, GY, FRONT_D); c.moveTo(p0, q0); c.lineTo(p1, q1); const [r0, s0] = at(eye, x + 50, GY, 1), [r1, s1] = at(eye, x + 50, GY, CURB_D); c.moveTo(r0, s0); c.lineTo(r1, s1); }
    c.stroke();
  }
  // The squares: brass strips between them, running back toward the eye; a star in every other one
  for (let k = 0, rx = 300; rx < 11000; rx += STAR_STEP, k++) {
    const sx0 = X(rx), sx1 = sx0 + 210;
    if (sx1 < L || sx0 > R) continue;
    const inPit = PITS.some(p => sx1 > p.a - 10 && sx0 < p.b + 10);
    for (const ex of [sx0, sx1]) {
      if (PITS.some(p => ex > p.a && ex < p.b)) continue;
      const [p0, q0] = at(eye, ex, GY, ROW_A - 0.003), [p1, q1] = at(eye, ex, GY, ROW_B);
      c.strokeStyle = tint(BRASS[4], 0.94); c.lineWidth = 1; c.beginPath(); c.moveTo(p0, q0); c.lineTo(p1, q1); c.stroke();
      c.strokeStyle = tint(BRASS[1], 0.94); c.beginPath(); c.moveTo(p0 + 1, q0); c.lineTo(p1 + 1, q1); c.stroke();
    }
    if (inPit || (sx1 > COURT.a && sx0 < COURT.b)) continue;
    // (the star's square a step lighter)
    Q(c, eye, sx0 + 2, sx1 - 2, ROW_A - 0.006, ROW_B + 0.004, tint(CHAR[3], STAR_D));
    Q(c, eye, sx0 + 2, sx1 - 2, ROW_A - 0.006, ROW_A - 0.012, tint(CHAR[4], ROW_A));
    lyingStar(c, eye, sx0 + 40, STAR_D, 30);
    // (the nobody's name, in brass beside it)
    const lines = twoLines(STAR_NAMES[k % STAR_NAMES.length]);
    const Lk = plain(1, 1, tint(BRASS[4], STAR_D), tint(CHAR[0], STAR_D));
    lines.forEach((ln, i) => {
      const d = lines.length > 1 ? (i ? 0.92 : 0.957) : 0.94, [nx, ny] = at(eye, sx0 + 136, GY, d);
      signText(c, ln, Math.round(nx), Math.round(ny + 4), Lk);
    });
  }
  // The forecourt: cement squares, the handprints of nobodies pressed in them, their names scratched under
  if (COURT.b > L && COURT.a < R) {
    const names = ['A GUY', 'BOB?', 'SOME LADY', 'THE TALL ONE'];
    for (let k = 0; k < 4; k++) {
      const a = COURT.a + 36 + k * 175, b = a + 160;
      Q(c, eye, a, b, ROW_A - 0.004, ROW_B + 0.004, tint(CONCRETE[5], 0.94));
      Q(c, eye, a, b, ROW_A - 0.004, ROW_A - 0.01, tint(CONCRETE[6], ROW_A));
      Q(c, eye, a, b, ROW_B + 0.01, ROW_B + 0.004, tint(CONCRETE[3], ROW_B));
      const prints = tint(CONCRETE[2], 0.95);
      for (const [hx, hd, fl] of [[a + 40, 0.962, false], [a + 64, 0.955, true], [a + 112, 0.963, false]] as const) { const [px, py] = at(eye, hx, GY, hd); handprint(c, Math.round(px), Math.round(py), prints, fl); }
      const [nx, ny] = at(eye, a + 80, GY, 0.918);
      signText(c, names[k], Math.round(nx), Math.round(ny + 4), plain(1, 1, tint(CONCRETE[1], 0.93)));
    }
  }
  void f; void signW;
};

// ---------------------------------------------------------------------------------------------------------------
// The holes going back

/** A face going back from the play plane at x = e, down from GY (a hole's wall), to the fronts' depth: in courses
 *  (dirt and broken pavement, or the trench's poured concrete), darker going back and the deeper. */
const wallBack = (c: Ctx, v: View, e: number, side: 1 | -1, kind: PitKind) => {
  const eye = v.eye, d = FRONT_D;
  if ((eye.x - e) * side <= 1) return;
  const bot = Math.min(GY + 1400, eye.y + (v.bot - eye.y) / d + 40);
  const pt = (k: number, y: number) => at(eye, e, y, 1 - (1 - d) * k);
  const R = kind === 'sink' ? ['#1E140E', '#2E2016', '#42301E', '#5A4228', '#745836', '#8E7048'] : CONCRETE;
  const dk = (col: string, y: number) => mix(col, '#000000', Math.min(1, Math.max(0, (y - GY - 10) / 360)));
  const q = (k0: number, y0: number, k1: number, y1: number, col: string) => poly(c, [pt(k0, y0), pt(k1, y0), pt(k1, y1), pt(k0, y1)], col);
  // (the pavement's edge, broken off: a band of the terrazzo, then what's under it)
  q(0, GY, 1, GY + 8, tint(kind === 'sink' ? CHAR[3] : CONCRETE[4], 0.94));
  q(0, GY + 8, 1, GY + 12, tint(CONCRETE[2], 0.94));
  for (let y = GY + 12, row = 0; y < bot; row++) {
    const rh = (kind === 'sink' ? 12 : 18) + row * 3;
    for (let j = 0; j < 4; j++) {
      const k0 = j / 4, k1 = (j + 1) / 4;
      q(k0, y, k1, Math.min(bot, y + rh), dk(tint(R[[3, 2, 2, 1][j] + (row % 2 && j < 2 ? 1 : 0)], 1 - k0 * (1 - d)), y));
      q(k0, y, k1, y + 1, dk(tint(R[1], 1), y));
    }
    y += rh;
  }
  if (kind === 'trench') { q(0, GY + 46, 1, GY + 54, tint('#4A4A58', 0.9)); q(0, GY + 46, 1, GY + 48, tint('#8A8A98', 0.9)); q(0, GY + 80, 1, GY + 86, tint('#B83C0C', 0.9)); }
  else { q(0, GY + 30, 1, GY + 36, tint('#3A6A8A', 0.9)); q(0, GY + 30, 1, GY + 31, tint('#7AA6C8', 0.9)); }
  const [x1, t1] = pt(1, GY);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(e, GY); c.lineTo(x1, t1); c.stroke();
};

/** A hole going back: the dark inside it (banded down to black), its far wall, what's at the bottom; then its walls. */
const pitBack = (c: Ctx, v: View, p: Pit) => {
  if (p.b < v.v0 - 300 || p.a > v.v1 + 300) return;
  const eye = v.eye, tod = timeOfDay(), haze = skyAt(0.9, tod), d = FRONT_D;
  const [ax, ay] = at(eye, p.a, GY, d), [bx] = at(eye, p.b, GY, d);
  c.save();
  c.beginPath(); c.moveTo(p.a, GY); c.lineTo(ax, ay); c.lineTo(bx, ay); c.lineTo(p.b, GY); c.lineTo(p.b, v.bot); c.lineTo(p.a, v.bot); c.closePath(); c.clip();
  const top = ay - 2, x0 = Math.min(p.a, ax) - 4, w = Math.max(p.b, bx) - x0 + 8;
  const deep = p.kind === 'sink' ? ['#3A2A1E', '#24180E', '#120A06', '#000000'] : ['#3A3A44', '#22222A', '#101014', '#000000'];
  bandedGradient(c, x0, top, w, Math.max(40, GY + 170 - top), [mix(deep[0], haze, 0.12), deep[1], deep[2], deep[3]], 7);
  box(c, x0, GY + 168, w, v.bot - GY, deep[3]);
  // (the far wall: a face at the fronts' depth going down, in courses)
  for (let y = ay, row = 0; y < ay + 220; row++) { const rh = 9 + row * 2; box(c, ax, y, bx - ax, 1, mix(deep[1], '#000000', row * 0.1)); y += rh; }
  if (p.kind === 'sink') {
    // (the sinkhole: slabs of the star pavement slid in, tipped; a star tile among them; a burst water main, dripping)
    const slab = (sx: number, sy: number, w2: number, a: number, star: boolean) => {
      c.save(); c.translate(sx, sy); c.rotate(a);
      box(c, -w2 / 2 - 1, -7, w2 + 2, 14, INK); box(c, -w2 / 2, -6, w2, 12, tint(CHAR[3], 0.9)); box(c, -w2 / 2, -6, w2, 2, tint(CHAR[5], 0.9)); box(c, -w2 / 2, 4, w2, 2, tint(CHAR[1], 0.9));
      if (star) poly(c, starPts(0, 0, 7, 0.6), tint(CORAL[3], 0.9));
      c.restore();
    };
    slab(p.a + 70, GY + 70, 70, 0.5, false); slab(p.b - 90, GY + 90, 80, -0.4, true); slab(p.a + 170, GY + 150, 60, 0.2, false);
    const px = p.a + (p.b - p.a) * 0.62;
    box(c, ax + 20, ay + 34, px - ax - 20, 6, '#2A3A48'); box(c, ax + 20, ay + 34, px - ax - 20, 1, '#5A7A90');
    const t = (v.f % 60) / 60;
    box(c, px - 2, ay + 40 + t * 120, 2, 4, '#7AB0D8');
    box(c, px - 6, ay + 38, 8, 4, '#1A2430');
  } else {
    // (the trench: pipes and conduits along its far wall, a work light caged, an old coffee cup, a 1994 hard hat)
    for (const [yy, col] of [[22, '#5A6A7A'], [40, '#7A2A1A'], [58, '#4A5A3A']] as const) { box(c, ax, ay + yy, bx - ax, 6, col); box(c, ax, ay + yy, bx - ax, 1, mix(col, '#FFFFFF', 0.3)); }
    for (let x = ax + 30; x < bx; x += 110) { box(c, x, ay + 10, 6, 6, '#2A2A30'); box(c, x + 1, ay + 11, 4, 4, tod.lamps > 0.3 ? '#FFE070' : '#C8A040'); }
    c.fillStyle = '#B88A10'; c.beginPath(); c.ellipse(p.a + (p.b - p.a) * 0.4, GY + 260, 12, 6, 0, Math.PI, 0); c.fill();
    box(c, p.a + (p.b - p.a) * 0.7, GY + 240, 5, 7, '#E8E0D0'); box(c, p.a + (p.b - p.a) * 0.7, GY + 240, 5, 1, '#B4243A');
  }
  hazeBands(c, p.a - 200, ay + 6, p.b - p.a + 400, 30, mix(haze, '#C8C0B0', 0.3), 0, 0.07, 4);
  c.restore();
  wallBack(c, v, p.a, 1, p.kind);
  wallBack(c, v, p.b, -1, p.kind);
};

export const drawPits = (c: Ctx, v: View) => { for (const p of PITS) pitBack(c, v, p); };

// ---------------------------------------------------------------------------------------------------------------
// The play plane: the curb, the gutter, the street

/** The street under him, painted flat (bent afterwards): the curb along the line (lit: he walks on it), the gutter
 *  and its drains, the asphalt in bands (lighter going away), its lines, cracks, patches, oil, gum and litter; a
 *  manhole; the tram's route painted along its stretch. */
const paintStreet = (g: Ctx, x0: number, w: number) => {
  const tod = timeOfDay(), s = Math.floor(x0);
  const A = ASPHALT.map(col => hour(col, 0.1)), C = CONCRETE.map(col => hour(col, 0.1));
  // (the asphalt: banded, darker nearer)
  bandedGradient(g, x0, GY + 20, w, BAND - 20, [A[5], A[4], A[4], A[3], A[3], A[2]], 8);
  // (the aggregate's speckle, a little worn crown)
  for (let i = 0; i < w * 0.9; i++) { const lx = x0 + hash(s + i * 0.613) * w, ly = GY + 22 + hash(s + i * 1.37) * (BAND - 24); box(g, lx, ly, 1 + (ly - GY) / 120, 1, i % 3 ? A[2] : A[5]); }
  // (patches: squares of newer, darker asphalt, their seams)
  for (let i = 0; i < w / 400; i++) { const px = x0 + hash(s + i * 9.1) * (w - 120), py = GY + 40 + hash(s + i * 3.9) * 120, pw = 60 + hash(i + s) * 80; box(g, px, py, pw, 26 + (py - GY) / 8, A[2]); box(g, px, py, pw, 1, A[1]); box(g, px, py, 1, 26 + (py - GY) / 8, A[4]); }
  // (the lines: the parking edge, a worn white; the double yellow far down)
  for (let x = Math.floor(x0 / 6) * 6; x < x0 + w; x += 6) if (hash(x * 0.21) > 0.15) box(g, x, GY + 36, 6, 2, C[5]);
  box(g, x0, GY + 150, w, 4, hour('#D8A020', 0.1)); box(g, x0, GY + 160, w, 4, hour('#D8A020', 0.1)); box(g, x0, GY + 150, w, 1, hour('#F2C850', 0.1)); box(g, x0, GY + 160, w, 1, hour('#F2C850', 0.1));
  // (the tram's route: its dashes, TRAM ONLY painted along it)
  const ta = X(TRAM.a), tb = X(TRAM.b);
  if (x0 + w > ta && x0 < tb) {
    for (let x = Math.max(x0, ta); x < Math.min(x0 + w, tb); x += 60) { box(g, x, GY + 62, 30, 4, hour('#E8B818', 0.1)); box(g, x, GY + 62, 30, 1, hour('#FFE070', 0.1)); }
    for (let x = ta + 200; x < tb - 100; x += 400) if (x > x0 - 100 && x < x0 + w + 100) signText(g, 'TRAM ONLY', x, GY + 98, plain(2, 3, hour('#E8E2D4', 0.1)));
  }
  // (cracks: zigzags spreading out)
  g.strokeStyle = A[0]; g.lineWidth = 1;
  for (let i = 0; i < w / 160; i++) {
    let cx = x0 + hash(s + i * 4.4) * w, cy = GY + 24 + hash(s + i * 2.2) * 100;
    g.beginPath(); g.moveTo(cx, cy);
    for (let k = 0; k < 6; k++) { cx += (hash(s + i * 7 + k) - 0.3) * 18; cy += 2 + hash(s + i * 5 + k) * 6; g.lineTo(cx, cy); }
    g.stroke();
  }
  // (oil stains, gum, litter: popcorn, ticket stubs, a dropped Steve flier, a crushed cup)
  for (let i = 0; i < w / 260; i++) { const ox = x0 + hash(s + i * 6.6) * w, oy = GY + 50 + hash(s + i * 1.4) * 140; g.fillStyle = 'rgba(8, 6, 12, 0.35)'; g.beginPath(); g.ellipse(ox, oy, 22 + hash(i) * 14, 5 + (oy - GY) / 40, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(90, 60, 120, 0.25)'; g.beginPath(); g.ellipse(ox - 4, oy - 1, 8, 2, 0, 0, Math.PI * 2); g.fill(); }
  for (let i = 0; i < w / 6; i++) { const lx = x0 + hash(s + i * 0.71) * w, ly = GY + 24 + hash(s + i * 1.93) * (BAND - 30), sc = 1 + (ly - GY) / 90; box(g, lx, ly, 2 * sc, Math.max(1, sc), ['#2A2228', '#3A3238', '#F4E8C0', '#2A2228', '#E8E0D0'][i % 5]); }
  for (let i = 0; i < w / 900; i++) {
    const fx = x0 + 80 + hash(s + i * 3.3) * (w - 160), fy = GY + 70 + hash(s + i * 8.1) * 60;
    g.save(); g.translate(fx, fy); g.rotate((hash(i + s) - 0.5) * 0.8);
    box(g, -9, -5, 18, 10, STEVE[2]); box(g, -8, -4, 16, 8, STEVE[4]); box(g, -6, -3, 6, 4, '#C89870'); box(g, 1, -2, 6, 1, STEVE[1]); box(g, 1, 0, 5, 1, STEVE[1]);
    g.restore();
  }
  // (a manhole now and then: iron, its rim lit)
  for (let mx = Math.floor(x0 / 830) * 830 + 300; mx < x0 + w; mx += 830) {
    if (mx < x0 - 40) continue;
    const my = GY + 108;
    g.fillStyle = INK; g.beginPath(); g.ellipse(mx, my, 28, 9, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = A[4]; g.beginPath(); g.ellipse(mx, my, 26, 8, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = A[2]; g.beginPath(); g.ellipse(mx + 1, my + 1, 22, 6, 0, 0, Math.PI * 2); g.fill();
    for (let k = -2; k <= 2; k++) box(g, mx - 18, my + k * 2.4, 36, 1, A[5]);
    box(g, mx - 24, my - 7, 18, 1, mix(A[5], '#FFFFFF', 0.2));
  }
  // (the gutter: concrete, darker, a grate now and then)
  box(g, x0, GY + 12, w, 10, C[2]); box(g, x0, GY + 20, w, 2, C[1]); checker(g, x0, GY + 12, w, 2, C[3], 0);
  for (let gx = Math.floor(x0 / 560) * 560 + 170; gx < x0 + w; gx += 560) { box(g, gx - 1, GY + 12, 32, 9, INK); for (let k = 0; k < 6; k++) box(g, gx + 1 + k * 5, GY + 13, 3, 7, C[1]); }
  // (the curb along the line: its face in steps under the lit top (where he walks), its joints)
  box(g, x0, GY, w, 12, C[4]); box(g, x0, GY + 8, w, 4, C[3]); checker(g, x0, GY + 6, w, 2, C[3], 0, 1);
  box(g, x0, GY, w, 3, LIP[2]); box(g, x0, GY, w, 1, LIP[3]);
  for (let x = Math.floor(x0 / 100) * 100 + 50; x < x0 + w; x += 100) { box(g, x, GY + 1, 1, 11, C[2]); box(g, x + 1, GY + 3, 1, 9, C[5]); }
  box(g, x0, GY + 11, w, 1, INK);
  // (a painted red curb along the tram's stretch: NO STOPPING)
  if (x0 + w > ta && x0 < tb) { const a = Math.max(x0, ta), b = Math.min(x0 + w, tb); box(g, a, GY + 3, b - a, 8, hour('#A82A2A', 0.1)); box(g, a, GY + 3, b - a, 2, hour('#D85050', 0.1)); }
  void tod;
};

/** A hole's near lip at the play plane: the street's edge (bent like the street) and the wall hung under it, darker
 *  the deeper (seen when he's looking at it). */
const nearBank = (c: Ctx, v: View, e: number, side: 1 | -1, kind: PitKind) => {
  const ex = v.eye.x;
  if ((ex - e) * side <= 1) return;
  const Y1 = GY + BAND + 120;
  const edge = (y: number) => ex + (e - ex) * (1 + (y - GY) * BEND);
  const N = 12, pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) { const y = GY + ((Y1 - GY) * i) / N; pts.push([edge(y), y]); }
  const R = kind === 'sink' ? ['#1E140E', '#2E2016', '#42301E', '#5A4228', '#745836', '#8E7048'] : CONCRETE;
  const dk = (col: string, s: number) => mix(col, '#000000', Math.min(1, 0.15 + Math.max(0, s - 20) / 300));
  for (let s0 = 0, row = 0; s0 < 560; row++) {
    const rh = (kind === 'sink' ? 12 : 18) + row * 4;
    for (let i = row % 2; i < N; i += 2) {
      const seg = pts.slice(i, Math.min(N, i + 2) + 1);
      poly(c, [...seg.map(([x, y]) => [x, y + s0] as [number, number]), ...seg.slice().reverse().map(([x, y]) => [x, y + s0 + rh] as [number, number])], dk(R[2 + ((row + i) % 2)], s0));
      poly(c, [...seg.map(([x, y]) => [x, y + s0] as [number, number]), ...seg.slice().reverse().map(([x, y]) => [x, y + s0 + 2] as [number, number])], dk(R[4], s0));
    }
    s0 += rh;
  }
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
};

/** The play plane: the street under him (bent), the holes' near walls, their broken lips. */
export const drawStreet = (c: Ctx, v: View) => {
  const CH = 512, tod = timeOfDay();
  for (const [a, b] of FLOOR) {
    for (let x = a, i = 0; x < b; x += CH, i++) {
      const w = Math.min(CH, b - x);
      if (x + w < v.v0 || x > v.v1) continue;
      stamp(c, `hb-street-${tod.key}-${a}-${i}`, x, GY - 2, w, BAND + 2, g => paintStreet(g, x, w));
    }
  }
  for (const [a, b] of FLOOR) if (b > v.v0 && a < v.v1 && v.bot > GY + BAND) box(c, Math.max(a, v.v0), GY + BAND - 1, Math.min(b, v.v1) - Math.max(a, v.v0), v.bot - GY - BAND + 1, hour(ASPHALT[2], 0.1));
  bendFloor(c, v.eye, GY, GY, GY + BAND, FLOOR[0][0], FLOOR[FLOOR.length - 1][1]);
  for (const p of PITS) {
    if (p.b < v.v0 - 100 || p.a > v.v1 + 100) continue;
    nearBank(c, v, p.a, 1, p.kind); nearBank(c, v, p.b, -1, p.kind);
    // (the broken lips: jagged chunks of the curb)
    for (const [ex, s] of [[p.a, 1], [p.b, -1]] as const) {
      poly(c, [[ex, GY], [ex + s * 22, GY], [ex + s * 12, GY + 7], [ex + s * 24, GY + 12], [ex + s * 6, GY + 20], [ex, GY + 16]], INK);
      poly(c, [[ex, GY + 1], [ex + s * 20, GY + 1], [ex + s * 10, GY + 7], [ex + s * 21, GY + 11], [ex + s * 5, GY + 18], [ex, GY + 14]], CONCRETE[3]);
      box(c, Math.min(ex, ex + s * 18), GY + 1, 18, 2, LIP[2]);
    }
  }
};

void PLY; void SAND;
