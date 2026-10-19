// The rest of THRONES OF THE STARS, going back (world space, one eye: paint.ts's view): the park's plaza under the
// coaster going back from the play plane (concrete pavers, their joints running away toward the eye, the hazier the
// further), a planter wall and its hedge along the far side of it (palms, lamps, the coaster's NO CLIMBING signs), and
// on the plaza, in two rows going back, the rest of the monstrosity: lattice towers up out of sight, track looping round
// them (a lift hill and its drop, loops, a top hat, a corkscrew going back, the INSANITY LOOPS in a row, a cluster of
// towers with a ribbon of track weaving between their tops). Set back into the haze (silhouettes, no lit lips: none of
// it's for standing on), each row on the plaza at its own depth; drawn by where it lands on screen (no pop-in).

import type { GameState } from '../../../m1/game/core/state';
import { GY } from '../geometry';
import { x0, x1, X } from './layout';
import { type Ctx, type CView, INK, cview, spanAt, yAt, far, pal, CRIMSON, pier } from './paint';
import { box, checker, mix, hash, poly, at, atDepth, still, timeOfDay, STEEL, BRASS, CONCRETE, hour, ramp6, signText, plain, board } from '../blvd/kit';
import { streetPalm } from '../blvd/far';

/** The far side of the plaza (the planter wall, the hedge). */
export const HEDGE_D = 0.56;
/** The structure's two rows going back: one past the hedge, one on the plaza (both behind the track he rides, which
 *  comes and goes between about 0.62 and 1.46: track.ts DEPTH; the near row that was at 0.79 crowded it). */
const ROWS = [{ d: 0.47, seed: 7 }, { d: 0.6, seed: 3 }] as const;

// ---------------------------------------------------------------------------------------------------------------
// The monstrosity's parts (world, laid out once)

interface Elem { a: number; b: number; top: number; legs: [number, number, number][]; runs: [number, number][][]; back: [number, number][][] }
const H = (h: number) => GY - h;
const circle = (cx: number, ch: number, r: number, n = 40): [number, number][] => {
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; out.push([cx + Math.cos(a) * r, H(ch + Math.sin(a) * r)]); }
  return out;
};
const hump = (cx: number, ch: number, r: number, n = 16): [number, number][] => {
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) { const a = Math.PI - (i / n) * Math.PI; out.push([cx + Math.cos(a) * r, H(ch + Math.sin(a) * r)]); }
  return out;
};
const build = (seed: number): Elem[] => {
  const out: Elem[] = [];
  let x = x0 - 900, i = 0;
  while (x < x1 + 900) {
    const r = (k: number) => hash(seed * 31 + i * 7.7 + k * 3.3);
    const kind = Math.floor(r(1) * 6), hb = 260 + r(2) * 700;
    const e: Elem = { a: x, b: x, top: GY, legs: [], runs: [], back: [] };
    const leg = (lx: number, h: number, w = 26) => e.legs.push([lx, H(h), w]);
    if (kind === 0) {
      // a run and a big loop on it
      const R = 180 + r(3) * 120, w = 2 * R + 500;
      e.runs.push([[x, H(hb)], [x + w, H(hb)]], circle(x + w / 2, hb + R, R));
      for (let lx = x + 60; lx < x + w; lx += 130) leg(lx, hb);
      e.b = x + w;
    } else if (kind === 1) {
      // a lift hill and its drop
      const top = 1500 + r(3) * 1000, up = top * 0.42, down = top * 0.3;
      e.runs.push([[x, H(180)], [x + up, H(top)]], hump(x + up + 40, top - 40 + 40, 40), [[x + up + 80, H(top)], [x + up + 80 + down, H(160)], [x + up + 160 + down, H(140)]]);
      for (let k = 1; k < 10; k++) { const t = k / 10; leg(x + up * t, 180 + (top - 180) * t, 24 + t * 10); }
      for (let k = 1; k < 6; k++) { const t = k / 6; leg(x + up + 80 + down * t, top - (top - 160) * t, 30); }
      e.b = x + up + 160 + down;
    } else if (kind === 2) {
      // THE INSANITY LOOPS: ten, each smaller, along a run
      let lx = x + 60;
      const radii = [200, 162, 130, 104, 82, 64, 50, 38, 28, 20].map(v => v * (0.8 + r(3) * 0.4));
      for (const R of radii) { e.runs.push(circle(lx + R, hb + R, R, Math.max(18, Math.round(R / 4)))); leg(lx + R, hb, 22); lx += 2 * R + 30; }
      e.runs.push([[x, H(hb)], [lx + 60, H(hb)]]);
      for (let k = x + 100; k < lx; k += 260) leg(k, hb);
      e.b = lx + 60;
    } else if (kind === 3) {
      // a top hat: straight up, over, straight down; its towers alongside
      const top = 1800 + r(3) * 900;
      e.runs.push([[x, H(hb)], [x + 120, H(hb)], [x + 160, H(hb + 60)], [x + 160, H(top)]], hump(x + 260, top, 100), [[x + 360, H(top)], [x + 360, H(hb + 60)], [x + 400, H(hb)], [x + 560, H(hb)]]);
      leg(x + 130, top - 80, 44); leg(x + 390, top - 80, 44);
      for (const lx of [x + 40, x + 480]) leg(lx, hb);
      e.b = x + 560;
    } else if (kind === 4) {
      // a corkscrew going back, its back strands in shade
      const len = 700 + r(3) * 300, ch = hb + 260, amp = 90, turns = 4;
      let cur: [number, number][] = [], side = 0;
      for (let k = 0; k <= 160; k++) {
        const t = k / 160, px = x + 80 + len * t, a = t * Math.PI * 2 * turns, py = H(ch + Math.sin(a) * amp), s = Math.cos(a) < 0 ? 1 : 0;
        if (k && s !== side) { (side ? e.back : e.runs).push(cur); cur = [cur[cur.length - 1]]; }
        side = s; cur.push([px, py]);
      }
      (side ? e.back : e.runs).push(cur);
      e.runs.push([[x, H(ch)], [x + 80, H(ch)]], [[x + 80 + len, H(ch)], [x + 160 + len, H(ch)]]);
      for (let lx = x + 60; lx < x + 160 + len; lx += 175) leg(lx, ch - amp - 20, 30);
      e.b = x + 160 + len;
    } else {
      // a cluster of towers, a ribbon of track weaving between their tops
      const n = 3 + Math.floor(r(3) * 3), tops: number[] = [];
      for (let k = 0; k < n; k++) { const t = 1400 + r(4 + k) * 1300; tops.push(t); leg(x + 80 + k * 220, t - 30, 48); }
      const pts: [number, number][] = [];
      for (let k = 0; k <= n * 12; k++) { const t = k / 12, px = x + 80 + t * 220, i0 = Math.min(n - 1, Math.floor(t)), i1 = Math.min(n - 1, i0 + 1), u = t - Math.floor(t); pts.push([px - 40, H(tops[i0] + (tops[i1] - tops[i0]) * (u * u * (3 - 2 * u)) + Math.sin(t * Math.PI * 2) * 60)]); }
      e.runs.push(pts);
      e.b = x + 80 + (n - 1) * 220 + 120;
    }
    for (const run of [...e.runs, ...e.back]) for (const [, py] of run) e.top = Math.min(e.top, py - 20);
    for (const [, ly] of e.legs) e.top = Math.min(e.top, ly);
    out.push(e);
    // (breathing room between them: the ride's own track is the show)
    x = e.b + 560 + r(9) * 800; i++;
  }
  return out;
};
let rows: Elem[][] | null = null;
const rowsOf = () => (rows ??= ROWS.map(r => build(r.seed)));

// ---------------------------------------------------------------------------------------------------------------
// Drawing

interface RowPal { key: string; steel: string[]; spine: string[]; gold: string[]; shade: string[]; concrete: string[] }
const rowPals = new Map<number, RowPal>();
const rowPal = (d: number): RowPal => {
  const key = timeOfDay().key;
  let p = rowPals.get(d);
  if (p && p.key === key) return p;
  const k = 0.95;
  p = { key, steel: STEEL.map(c => far(c, d, k)), spine: CRIMSON.map(c => far(c, d, k)), gold: BRASS.map(c => far(c, d, k)), shade: STEEL.map(c => far(mix(c, '#1A1830', 0.3), d, k)), concrete: CONCRETE.map(c => far(c, d, k)) };
  rowPals.set(d, p);
  return p;
};
/** A tower of the structure, set back (chords, a zigzag, a strut every other bay), between what's on screen. */
const tower = (c: Ctx, x: number, top: number, foot: number, w: number, R: string[], lo: number, hi: number) => {
  const t = Math.max(top, lo), b = Math.min(foot, hi);
  if (b <= t) return;
  const ch = Math.max(3, Math.round(w * 0.16)), xl = x - w / 2, xr = x + w / 2 - ch, bay = Math.max(40, w * 1.7);
  box(c, xl - 1, t, w + 2, b - t, INK);
  box(c, xl, t, w, b - t, R[1]);
  box(c, xl, t, ch, b - t, R[3]); box(c, xl, t, Math.max(1, ch * 0.4), b - t, R[4]); box(c, xr, t, ch, b - t, R[2]);
  const y0 = top + Math.max(0, Math.ceil((t - top) / bay)) * bay;
  c.strokeStyle = R[2]; c.lineWidth = Math.max(2, ch * 0.6); c.beginPath();
  for (let y = y0; y < b; y += bay) { c.moveTo(xl + ch, y); c.lineTo(xr, y + bay / 2); c.lineTo(xl + ch, y + bay); }
  c.stroke();
  for (let y = y0, k = 0; y < b; y += bay, k++) if (k % 2 === 0) { box(c, xl, y - 1, w, 3, INK); box(c, xl, y, w, 1, R[3]); }
  if (top < t) return;
  box(c, xl - 3, top - 3, w + 6, 6, INK); box(c, xl - 2, top - 2, w + 4, 4, R[3]);
};
/** A run of track, set back: the spine, the rails along its top. */
const ribbon = (c: Ctx, pts: [number, number][], P: RowPal, shade = false) => {
  if (pts.length < 2) return;
  const path = () => { c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); };
  const S = shade ? P.spine.map(col => mix(col, '#1A1830', 0.3)) : P.spine;
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.strokeStyle = INK; c.lineWidth = 14; c.beginPath(); path(); c.stroke();
  c.strokeStyle = S[2]; c.lineWidth = 11; c.beginPath(); path(); c.stroke();
  c.save(); c.translate(0, 3); c.strokeStyle = S[1]; c.lineWidth = 4; c.beginPath(); path(); c.stroke(); c.restore();
  c.save(); c.translate(0, -5); c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); path(); c.stroke();
  c.strokeStyle = shade ? P.gold[2] : P.gold[3]; c.lineWidth = 3; c.beginPath(); path(); c.stroke();
  c.restore();
  c.lineCap = 'butt';
};

const drawRow = (c: Ctx, v: CView, ri: number) => {
  const { d } = ROWS[ri], P = rowPal(d), [lo, hi] = spanAt(v, d, 160);
  const vTop = v.eye.y + (v.vy - 60 - v.eye.y) / d, vBot = v.eye.y + (v.vy + v.vh + 60 - v.eye.y) / d;
  const els = rowsOf()[ri].filter(e => e.b > lo && e.a < hi && e.top < vBot && GY > vTop);
  if (!els.length) return;
  atDepth(c, v.eye, d, () => {
    for (const e of els) {
      for (const st of e.back) ribbon(c, st, P, true);
      for (const [lx, ly, w] of e.legs) { tower(c, lx, ly, GY - 10, w, P.steel, vTop, vBot); if (GY - 14 < vBot && GY > vTop) pier(c, lx, GY, w + 14, P.steel, P.concrete); }
      for (const st of e.runs) ribbon(c, st, P);
    }
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The plaza going back, the planter wall and hedge on its far side

const PAVERS = ['#7A746E', '#86807A', '#8E8882', '#99938C', '#A29C94'];
const drawPlaza = (c: Ctx, v: CView) => {
  const eye = v.eye, yb = yAt(v, GY, 1), yh = yAt(v, GY, HEDGE_D);
  if (yh > v.vy + v.vh + 40 || yb < v.vy - 40) return;
  const l = v.vx - 40, r = v.vx + v.vw + 40, n = PAVERS.length;
  // (bands of pavers, lighter nearer, dithered where they meet)
  for (let i = 0; i < n; i++) {
    const d0 = HEDGE_D + ((1 - HEDGE_D) * i) / n, d1 = HEDGE_D + ((1 - HEDGE_D) * (i + 1)) / n;
    const ya = Math.round(yAt(v, GY, d0)), yb2 = Math.round(yAt(v, GY, d1)) + 1;
    const col = far(PAVERS[i], d0, 0.6);
    box(c, l, ya, r - l, yb2 - ya, col);
    if (i) checker(c, l, ya - 2, r - l, 2, col, i % 2);
  }
  // (the joints: rows across, and the lines running back toward the eye)
  const K = pal().concrete;
  for (let k = 1; k < 9; k++) { const d = HEDGE_D + ((1 - HEDGE_D) * k * k) / 81, y = Math.round(yAt(v, GY, d)); box(c, l, y, r - l, 1, far(K[2], d, 0.6)); }
  c.strokeStyle = far(K[2], 0.8, 0.6); c.lineWidth = 1; c.beginPath();
  const step = 96, xa = Math.floor((l - eye.x) / step) * step + eye.x - step * 3;
  for (let x = Math.floor(xa / step) * step; x < r + step * 3; x += step) { const [ax, ay] = at(eye, x, GY, 1), [bx, by] = at(eye, x, GY, HEDGE_D); c.moveTo(ax, ay); c.lineTo(bx, by); }
  c.stroke();
  // (oil stains and gum, here and there)
  const [s0, s1] = spanAt(v, 0.8);
  for (let x = Math.floor(s0 / 140) * 140; x < s1; x += 140) { const h = hash(x * 0.013); if (h < 0.6) continue; const d = 0.66 + h * 0.3, [sx, sy] = at(eye, x + h * 60, GY, d); box(c, sx, sy, 6 * d, 2, far('#4A4440', d, 0.6)); }
};

/** The planter wall and hedge along the far side (a stretch of it, 800 wide: painted once for the hour, stamped). */
const SEG = 800;
const paintHedge = (g: Ctx, seg: number) => {
  const K = ramp6(hour('#B8A890')), Hd = ['#1E2E1A', '#2E4622', '#466A30', '#68904A', '#8EB466'].map(col => hour(col));
  // (the wall: stucco, a cap along it, weep holes)
  box(g, -2, -44, SEG + 4, 46, INK);
  box(g, 0, -42, SEG, 42, K[3]); box(g, 0, -42, SEG, 2, K[4]); checker(g, 0, -10, SEG, 2, K[2], 0, 2); box(g, 0, -8, SEG, 8, K[2]);
  box(g, -2, -48, SEG + 4, 6, INK); box(g, 0, -47, SEG, 4, K[4]); box(g, 0, -47, SEG, 1, K[5]);
  for (let x = 30; x < SEG; x += 90) box(g, x, -14, 4, 3, K[1]);
  // (the hedge on it: lumps, lit up top, its shade underneath)
  for (let x = 0; x < SEG; x += 12) {
    const h = 26 + hash(seg * 13 + x * 0.7) * 10;
    g.fillStyle = INK; g.beginPath(); g.ellipse(x + 6, -48 - h / 2, 10, h / 2 + 1, 0, 0, Math.PI * 2); g.fill();
  }
  for (let x = 0; x < SEG; x += 12) {
    const h = 26 + hash(seg * 13 + x * 0.7) * 10;
    g.fillStyle = Hd[1]; g.beginPath(); g.ellipse(x + 6, -48 - h / 2, 9, h / 2, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = Hd[2]; g.beginPath(); g.ellipse(x + 4, -50 - h * 0.6, 6, h * 0.3, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = Hd[3]; g.beginPath(); g.ellipse(x + 3, -51 - h * 0.75, 3, h * 0.14, 0, 0, Math.PI * 2); g.fill();
  }
  checker(g, 0, -52, SEG, 4, Hd[0], 1, 2);
  // (a palm, a lamp, a sign: NO CLIMBING ON THE COASTER)
  const T = (col: string) => hour(col);
  streetPalm(g, 200 + (seg % 3) * 120, -48, 210 + (seg % 2) * 40, (seg % 2 ? 1 : -1) * 8, T, seg);
  const lx = 560;
  const I = ['#0A0C0C', '#161A1A', '#222828', '#323A38', '#465250', '#62706C'].map(T);
  box(g, lx - 3, -160, 6, 116, INK); box(g, lx - 2, -160, 4, 116, I[3]); box(g, lx - 2, -160, 1, 116, I[5]);
  box(g, lx - 7, -176, 14, 16, INK); box(g, lx - 6, -175, 12, 14, '#F4ECD0'); box(g, lx - 6, -175, 4, 14, '#FFFFFF');
  if (seg % 2 === 0) board(g, 380, -80, ['NO CLIMBING', 'ON THE COASTER'], plain(1, 1, '#18181B'), '#F8FAFC', STEEL.map(T), 5);
};
const drawHedge = (c: Ctx, v: CView) => {
  const y = yAt(v, GY, HEDGE_D);
  if (y - 300 * HEDGE_D > v.vy + v.vh + 40 || y < v.vy - 40) return;
  const [lo, hi] = spanAt(v, HEDGE_D, 200);
  atDepth(c, v.eye, HEDGE_D, () => {
    for (let k = Math.floor(lo / SEG); k * SEG < hi; k++) still(c, `hwc-hedge-${((k % 4) + 4) % 4}`, k * SEG, GY, -2, -300, SEG + 4, 302, g => paintHedge(g, ((k % 4) + 4) % 4));
  });
};

// ---------------------------------------------------------------------------------------------------------------

/** Everything going back, back to front: the far row (past the hedge), the plaza, the hedge, the row on the plaza. */
export const drawStructureBack = (c: Ctx, state: GameState) => {
  const v = cview(state);
  drawRow(c, v, 0);
  drawPlaza(c, v);
  drawHedge(c, v);
  drawRow(c, v, 1);
};
/** At the play plane: the park's floor under it all (its face down from GY; along the queue's way in, its lit curb). */
export const drawFloor = (c: Ctx, state: GameState) => {
  const v = cview(state);
  if (v.vy + v.vh < GY - 4) return;
  const K = pal().concrete, l = v.vx - 40, r = v.vx + v.vw + 40;
  box(c, l, GY, r - l, Math.max(0, v.vy + v.vh - GY + 40), K[1]);
  box(c, l, GY, r - l, 6, K[3]); checker(c, l, GY + 6, r - l, 2, K[2], 0, 2); box(c, l, GY + 10, r - l, 2, K[0]);
  for (let x = Math.floor(l / 64) * 64; x < r; x += 64) box(c, x, GY + 12, 1, 30, K[0]);
  // (the queue's way in is walked on: its curb lit)
  const a = Math.max(l, X(-200)), b = Math.min(r, X(700));
  if (b > a) { box(c, a, GY - 1, b - a, 3, pal().lip[2]); box(c, a, GY - 1, b - a, 1, pal().lip[3]); }
  void CONCRETE; void poly; void signText;
};
