// The havoc's ground, in fake 3D (the boulevard's one eye). Going back from the play plane to the fronts (FRONT_D),
// stretch by stretch: the backlot's service road out of the ride (asphalt, its fire lane), PARIS STREET (pale limestone
// flags, cobbles along the fronts' feet), the city blocks (concrete slabs, their joints toward the eye, steel cellar
// doors), the western town (dirt, the boardwalk), the flood canyon's wet apron (drains, DRAINS TO OCEAN), MAIN STREET
// along the foot of the hill (brick pavers, snow drifted along the fronts); ash lying over all of it, scorch. Behind the
// fronts, the lot strip their bracing stands in (blvd/ground.ts). At the play plane: the street under him, stretch by
// stretch, painted once for the hour and bent the SNES way (asphalt cracked and scorched, ash, fallen bricks, the
// canyon's wet sheen, the snow along Main Street, PARIS's cobbles, the western dirt), the curb's lit top where he walks.
// The lava rivers cut across it all: each a channel going back to the fronts on the one eye (its far wall in courses
// with the glow cast up it, the lava pouring in down it out of a gash in its lip as a glowing fall, crusting at its
// edges, pulses and clots running down it, splashing where it hits; its side walls glowing up from their feet), and
// toward us between the street's bent edges (hung walls lit from the lava, the lava down there). The molten top banded
// and carried on toward us, bright ripples on it, dark crust plates drifting on it (their seams near-white yellow going
// red, cooled black on top) cracking open as they come, bubbles swelling and popping with spatter; over it the heat
// (stepped glow, the air shimmering, smoke, embers going up). Spent: crusted black, the plates' seams, a few cracks still
// faintly glowing, walkable (a lit lip along it).

import { CANVAS_WIDTH } from '../../../m1/constants';
import { bendFloor, BEND } from '../../intro/art/kit';
import { drawLotStrip, BAND, tint } from '../blvd/ground';
import { X, Y, RUNS, LAVA, LAVA_DOWN, DECOR, PUDDLES, DOWNHILL } from './layout';
import {
  type Ctx, type View, INK, box, checker, mix, hash, poly, at, stamp, timeOfDay, signText, bandedGradient, FRONT_D, BACK_D, CONCRETE,
  ASPHALT, LIP, hour, plain,
} from '../blvd/kit';
import { levelQ, sideQ } from '../disaster/paint';
import { BOARD as BOARD_R, DIRT as DIRT_R } from '../lot/paint';
import { GY } from '../geometry';
import { LAVA_R, BASALT, ROCK, ASHY, SNOW, smokeUp } from './paint';

const W = CANVAS_WIDTH;
const CURB_D = 0.986, WALK_D = 0.905;

type HZ = 'lot' | 'paris' | 'city' | 'west' | 'canyon' | 'main';
const HZONES: [number, number, HZ][] = [[-700, 1480, 'lot'], [1480, 2700, 'paris'], [2700, 5640, 'city'], [5640, 6250, 'west'], [6250, 8400, 'canyon'], [14000, 22600, 'main']];
/** The flat runs of street (world x). */
export const FLOOR: [number, number][] = RUNS.filter(r => r[2] === 0 && r[3] === 0).map(([a, b]) => [X(a), X(b)]);
/** The street's lava rivers (the hill's is the hill's). */
export const STREET_LAVA = LAVA.filter(l => l.hl === 0 && l.hr === 0);

const Q = (c: Ctx, eye: View['eye'], xa: number, xb: number, d0: number, d1: number, col: string) => poly(c, [at(eye, xa, GY, d0), at(eye, xb, GY, d0), at(eye, xb, GY, d1), at(eye, xa, GY, d1)], col);
const rows = (c: Ctx, eye: View['eye'], a: number, b: number, d0: number, d1: number, cols: string[]) => {
  cols.forEach((col, i) => { const p = d0 - ((d0 - d1) * i) / cols.length, q = d0 - ((d0 - d1) * (i + 1)) / cols.length; Q(c, eye, a, b, p, q, tint(col, p)); });
};
const joint = (c: Ctx, eye: View['eye'], x: number, d0: number, d1: number, col: string) => {
  const [p0, q0] = at(eye, x, GY, d0), [p1, q1] = at(eye, x, GY, d1);
  c.strokeStyle = col; c.lineWidth = 1; c.beginPath(); c.moveTo(p0, q0); c.lineTo(p1, q1); c.stroke();
};
const dab = (c: Ctx, x: number, d: number, eye: View['eye'], w: number, h: number, col: string) => {
  const [sx, sy] = at(eye, x, GY, d);
  box(c, Math.round(sx - (w * d) / 2), Math.round(sy), Math.max(1, Math.round(w * d)), Math.max(1, Math.round(h * d * 0.5)), col);
};

// ---------------------------------------------------------------------------------------------------------------
// The ground going back

const pave = (c: Ctx, v: View, a: number, b: number, z: HZ, done: boolean) => {
  const eye = v.eye, C = CONCRETE, A = ASPHALT;
  const step = (n: number, k: number) => Math.ceil(a / n) * n + k;
  Q(c, eye, a, b, 1, CURB_D, tint(C[5], 1));
  if (z === 'lot') {
    rows(c, eye, a, b, CURB_D, FRONT_D + 0.012, [A[4], A[4], A[3], A[3], A[2]]);
    Q(c, eye, a, b, FRONT_D + 0.012, FRONT_D, tint('#8A3A34', FRONT_D));
    Q(c, eye, a, b, FRONT_D + 0.012, FRONT_D + 0.009, tint('#B85A50', FRONT_D));
    for (let x = step(37, 0); x < b; x += 37) { const h = hash(x * 0.17), d = CURB_D - 0.01 - h * 0.08; if (h > 0.4) dab(c, x, d, eye, 2, 2, tint(h > 0.75 ? A[5] : A[1], d)); }
    for (let x = step(700, 260); x < b; x += 700) { const [nx, ny] = at(eye, x, GY, 0.905); signText(c, 'FIRE LANE', Math.round(nx), Math.round(ny + 3), plain(1, 1, tint('#D8D0C8', 0.9))); }
  } else if (z === 'paris') {
    // (the trottoir: pale limestone flags in bands, their joints going back; cobbles along the fronts' feet)
    const P = ['#5E584E', '#7A7266', '#9A9282', '#B8B0A0', '#D2CABA'];
    rows(c, eye, a, b, CURB_D, 0.912, [P[3], P[3], P[2], P[2]]);
    for (let x = step(52, 0); x < b; x += 52) joint(c, eye, x, CURB_D, 0.912, tint(P[1], 0.95));
    Q(c, eye, a, b, 0.95, 0.948, tint(P[1], 0.95));
    rows(c, eye, a, b, 0.912, FRONT_D, [P[1], P[0]]);
    for (let x = step(7, 0); x < b; x += 7) for (const d of [0.909, 0.9, 0.891, 0.883]) { const h = hash(x * 0.31 + d * 97); dab(c, x + (d * 100 % 2) * 3, d, eye, 5, 3, tint(h > 0.6 ? P[3] : P[2], d)); }
  } else if (z === 'city') {
    rows(c, eye, a, b, CURB_D, FRONT_D + 0.006, [C[4], C[4], C[3], C[3]]);
    Q(c, eye, a, b, FRONT_D + 0.006, FRONT_D, tint(C[1], FRONT_D));
    Q(c, eye, a, b, 0.935, 0.933, tint(C[2], 0.935));
    for (let x = step(64, 0); x < b; x += 64) joint(c, eye, x, CURB_D, FRONT_D + 0.006, tint(C[2], 0.94));
    for (let x = step(11, 0); x < b; x += 11) { const h = hash(x * 0.29), d = 0.9 + h * 0.08; if (h > 0.6) dab(c, x + h * 7, d, eye, 2, 2, tint(h > 0.85 ? '#3A3438' : C[2], d)); }
    for (let x = step(520, 140); x < b - 80; x += 520) {
      Q(c, eye, x, x + 70, 0.925, 0.895, tint('#4A4E54', 0.91)); Q(c, eye, x + 34, x + 36, 0.925, 0.895, tint(INK, 0.91));
      for (let k = 0; k < 6; k++) dab(c, x + 6 + k * 11, 0.91, eye, 3, 2, tint('#7A8088', 0.91));
      Q(c, eye, x, x + 70, 0.925, 0.922, tint('#8A9098', 0.925));
    }
  } else if (z === 'west') {
    const D = DIRT_R;
    rows(c, eye, a, b, CURB_D, WALK_D, [D[4], D[3], D[3], D[3], D[2]]);
    for (let x = step(13, 0); x < b; x += 13) { const h = hash(x * 0.21), d = WALK_D + 0.005 + h * 0.075; if (h > 0.45) dab(c, x + h * 9, d, eye, h > 0.8 ? 4 : 2, 2, tint(h > 0.7 ? D[1] : D[5], d)); }
    const [, fy] = at(eye, a, GY, WALK_D), fh = 8, [fa] = at(eye, a, GY, WALK_D), [fb] = at(eye, b, GY, WALK_D);
    box(c, fa, fy - fh, fb - fa, fh, tint(BOARD_R[2], WALK_D)); box(c, fa, fy - 2, fb - fa, 2, tint(D[2], WALK_D)); box(c, fa, fy - fh, fb - fa, 1, tint(BOARD_R[4], WALK_D));
    for (let x = step(40, 0); x < b; x += 40) { const [px] = at(eye, x, GY, WALK_D); box(c, px, fy - fh, 2, fh, tint(BOARD_R[1], WALK_D)); }
    const top = (d: number) => at(eye, 0, GY - fh / WALK_D, d)[1];
    const bandsW = [BOARD_R[3], BOARD_R[4], BOARD_R[3], BOARD_R[2]];
    for (let i = 0; i < 4; i++) {
      const p = WALK_D - ((WALK_D - FRONT_D) * i) / 4, q = WALK_D - ((WALK_D - FRONT_D) * (i + 1)) / 4;
      poly(c, [[at(eye, a, 0, p)[0], top(p)], [at(eye, b, 0, p)[0], top(p)], [at(eye, b, 0, q)[0], top(q)], [at(eye, a, 0, q)[0], top(q)]], tint(bandsW[i], p));
    }
    for (let x = step(90, 0); x < b; x += 90) { const [p0] = at(eye, x, 0, WALK_D), [p1] = at(eye, x, 0, FRONT_D); c.strokeStyle = tint(BOARD_R[1], 0.89); c.lineWidth = 1; c.beginPath(); c.moveTo(p0, top(WALK_D)); c.lineTo(p1, top(FRONT_D)); c.stroke(); }
  } else if (z === 'canyon') {
    // (the canyon's apron: poured slabs, darker and wet toward the back, drains, DRAINS TO OCEAN stenciled)
    rows(c, eye, a, b, CURB_D, FRONT_D, [C[3], C[3], C[2], C[2], C[1]]);
    for (let x = step(120, 0); x < b; x += 120) joint(c, eye, x, CURB_D, FRONT_D, tint(C[1], 0.94));
    for (let x = step(300, 90); x < b; x += 300) { const [gx, gy] = at(eye, x, GY, 0.95); box(c, gx - 12, gy - 2, 24, 4, INK); for (let k = 0; k < 5; k++) box(c, gx - 10 + k * 4, gy - 1, 2, 2, tint(C[1], 0.95)); }
    for (let x = step(600, 200); x < b; x += 600) { const [nx, ny] = at(eye, x, GY, 0.925); signText(c, 'DRAINS TO OCEAN', Math.round(nx), Math.round(ny + 3), plain(1, 1, tint('#9AC0D8', 0.92))); }
    for (let x = step(90, 30); x < b; x += 90) { const [sx, sy] = at(eye, x, GY, 0.96 - hash(x) * 0.05); c.fillStyle = 'rgba(70, 100, 130, 0.3)'; c.fillRect(Math.round(sx - 24), Math.round(sy - 1), 48, 2); }
  } else {
    // (Main Street: brick pavers going back between concrete bands; snow drifted along the fronts' feet)
    const Bk = ['#3A1A14', '#5A2A1E', '#7A3A2A', '#9A4E38', '#B46A4E'];
    rows(c, eye, a, b, CURB_D, 0.955, [C[4], C[3]]);
    for (let i = 0; i < 4; i++) {
      const p = 0.955 - ((0.955 - 0.905) * i) / 4, q = 0.955 - ((0.955 - 0.905) * (i + 1)) / 4;
      for (let x = Math.floor(a / 18) * 18 - (i % 2) * 9; x < b; x += 18) { const xa = Math.max(a, x), xb = Math.min(b, x + 17); if (xb > xa) Q(c, eye, xa, xb, p, q, tint(Bk[1 + ((Math.floor(x / 18) + i) % 2) + (hash(x + i) > 0.82 ? 1 : 0)], p)); }
    }
    rows(c, eye, a, b, 0.905, FRONT_D, [C[3], C[2]]);
    {
      // (the drift along the fronts: mounded, its top lit, blue in its hollows)
      for (let x = step(24, 0); x < b; x += 24) {
        const h = hash(x * 0.13), d0 = FRONT_D + 0.006 + h * 0.012;
        Q(c, eye, x, Math.min(b, x + 26), d0, FRONT_D, tint(h > 0.5 ? SNOW[4] : SNOW[3], d0));
        Q(c, eye, x + 2, Math.min(b, x + 22), d0, d0 - 0.003, tint(SNOW[5], d0));
      }
      for (let x = step(9, 0); x < b; x += 9) { const h = hash(x * 0.41), d = 0.9 + h * 0.08; if (h > 0.55) dab(c, x, d, eye, 3, 2, tint(h > 0.8 ? SNOW[5] : SNOW[4], d)); }
    }
  }
  // (ash lying over all of it, scorch here and there)
  for (let x = step(17, 3); x < b; x += 17) { const h = hash(x * 0.77 + 3), d = FRONT_D + 0.01 + h * 0.09; if (h > (done ? 0.6 : 0.4)) dab(c, x + h * 9, d, eye, 3 + (h > 0.9 ? 3 : 0), 2, tint(h > 0.75 ? ASHY[4] : ASHY[2], d)); }
  for (let x = step(410, 170); x < b; x += 410) { const d = 0.93 + hash(x) * 0.04, [sx, sy] = at(eye, x, GY, d); c.fillStyle = 'rgba(20, 12, 10, 0.4)'; c.fillRect(Math.round(sx - 30 * d), Math.round(sy - 2), Math.round(60 * d), 3); c.fillRect(Math.round(sx - 18 * d), Math.round(sy - 3), Math.round(36 * d), 5); }
  void W; void BACK_D;
};

/** The lot strip behind the fronts, the ground going back to them: each flat run of street, each stretch's own. */
export const drawHavocPavement = (c: Ctx, v: View, done: boolean) => {
  const eye = v.eye, yAt = (d: number) => eye.y + (GY - eye.y) * d;
  if (yAt(BACK_D) > v.bot || GY < v.top) return;
  if (yAt(BACK_D) < v.bot && yAt(FRONT_D) > v.top && FLOOR.some(([a, b]) => b > v.v0 - 300 && a < v.v1 + 300)) drawLotStrip(c, v);
  const L = eye.x - (eye.x - v.v0 + 260) / FRONT_D, R2 = eye.x + (v.v1 + 260 - eye.x) / FRONT_D;
  for (const [fa, fb] of FLOOR) for (const [za, zb, z] of HZONES) {
    const a = Math.max(fa, X(za), L), b = Math.min(fb, X(zb), R2);
    if (b > a) pave(c, v, a, b, z, done);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The play plane: the street under him

const paintStreet = (g: Ctx, x0: number, w: number, z: HZ) => {
  const s = Math.floor(x0), A = ASPHALT.map(col => hour(col, 0.1)), C = CONCRETE.map(col => hour(col, 0.1)), Ash = ASHY.map(col => hour(col, 0.1));
  const asphalt = (wet = false) => {
    const bands = wet ? [A[4], A[3], A[3], A[2], A[2], A[1]] : [A[5], A[4], A[4], A[3], A[3], A[2]];
    bandedGradient(g, x0, GY + 20, w, BAND - 20, bands, 8);
    for (let i = 0; i < w * 0.9; i++) { const lx = x0 + hash(s + i * 0.613) * w, ly = GY + 22 + hash(s + i * 1.37) * (BAND - 24); box(g, lx, ly, 1 + (ly - GY) / 120, 1, i % 3 ? A[2] : A[5]); }
    // (cracks: the quake's, wide, zigzagging, lit along their upper edge)
    for (let i = 0; i < w / 150; i++) {
      let cx = x0 + hash(s + i * 4.4) * w, cy = GY + 24 + hash(s + i * 2.2) * 90;
      const pts: [number, number][] = [[cx, cy]];
      for (let k = 0; k < 7; k++) { cx += (hash(s + i * 7 + k) - 0.35) * 26; cy += 3 + hash(s + i * 5 + k) * 9; pts.push([cx, cy]); }
      for (const [dw, col] of [[3, A[0]], [1, A[5]]] as const) { g.strokeStyle = col; g.lineWidth = dw; g.beginPath(); pts.forEach(([px, py], k) => (k ? g.lineTo(px, py - (dw === 1 ? 2 : 0)) : g.moveTo(px, py - (dw === 1 ? 2 : 0)))); g.stroke(); }
    }
    // (scorch: blackened blots, stepped, a sooty ring round each)
    for (let i = 0; i < w / 340; i++) {
      const ox = x0 + hash(s + i * 6.6) * w, oy = GY + 50 + hash(s + i * 1.4) * 150, r = 18 + hash(i + s) * 18, sy2 = 0.3 + (oy - GY) / 600;
      for (const [k, col] of [[1.4, 'rgba(10, 6, 6, 0.25)'], [1, 'rgba(10, 6, 6, 0.45)'], [0.55, 'rgba(4, 2, 2, 0.6)']] as const) { g.fillStyle = col; g.fillRect(Math.round(ox - r * k), Math.round(oy - r * k * sy2), Math.round(r * k * 2), Math.max(2, Math.round(r * k * sy2 * 2))); }
    }
    if (wet) for (let i = 0; i < w / 60; i++) { const wx = x0 + hash(s + i * 3.1) * w, wy = GY + 30 + hash(s + i * 1.9) * 200; box(g, wx, wy, 30 + (wy - GY) / 6, 1, hour('#7A9AB4', 0.1)); }
  };
  const curb = () => {
    box(g, x0, GY + 12, w, 10, C[2]); box(g, x0, GY + 20, w, 2, C[1]); checker(g, x0, GY + 12, w, 2, C[3], 0);
    box(g, x0, GY, w, 12, C[4]); box(g, x0, GY + 8, w, 4, C[3]); checker(g, x0, GY + 6, w, 2, C[3], 0, 1);
    for (let x = Math.floor(x0 / 100) * 100 + 50; x < x0 + w; x += 100) { box(g, x, GY + 1, 1, 11, C[2]); box(g, x + 1, GY + 3, 1, 9, C[5]); }
  };
  if (z === 'paris') {
    // (cobbles: rows of rounded setts coming on toward us, bigger the nearer, each lit on its upper left)
    const P = ['#2A2622', '#3E3832', '#544C44', '#6A6056', '#82786A'].map(col => hour(col, 0.1));
    box(g, x0, GY + 12, w, BAND - 12, P[0]);
    for (let y = GY + 14, r = 0; y < GY + BAND; r++) {
      const rh = 6 + r * 1.2, cw = 10 + r * 1.6;
      for (let x = Math.floor(x0 / cw) * cw - (r % 2) * cw * 0.5; x < x0 + w; x += cw) {
        const t = hash(x * 0.3 + r * 7.1);
        box(g, x + 1, y + 1, cw - 2, rh - 2, P[t > 0.7 ? 3 : 2]); box(g, x + 1, y + 1, cw - 3, 1, P[4]); box(g, x + 1, y + 1, 1, rh - 3, P[4]); box(g, x + 2, y + rh - 2, cw - 3, 1, P[1]);
      }
      y += rh;
    }
    box(g, x0, GY + 12, w, 4, P[1]);
  } else if (z === 'west') {
    const D = DIRT_R.map(col => hour(col, 0.1));
    bandedGradient(g, x0, GY + 8, w, BAND - 8, [D[5], D[4], D[4], D[3], D[3], D[2]], 8);
    for (const ry of [GY + 60, GY + 92, GY + 170, GY + 214]) { box(g, x0, ry, w, 6 + (ry - GY) / 40, D[2]); box(g, x0, ry, w, 1, D[1]); box(g, x0, ry + 6 + (ry - GY) / 40, w, 1, D[5]); }
    for (let i = 0; i < w * 0.7; i++) { const lx = x0 + hash(s + i * 0.613) * w, ly = GY + 10 + hash(s + i * 1.37) * (BAND - 12), sc = 1 + (ly - GY) / 100; box(g, lx, ly, sc * (i % 4 === 0 ? 3 : 1), Math.max(1, sc), i % 3 ? D[2] : D[5]); }
  } else asphalt(z === 'canyon');
  if (z === 'main') {
    // (Main Street: the trolley tracks, a crosswalk, the snow blown along it in streaks and drifted at the curb)
    for (const ty of [GY + 96, GY + 124]) { box(g, x0, ty - 1, w, 5, A[1]); box(g, x0, ty, w, 2, C[4]); box(g, x0, ty, w, 1, C[6]); }
    for (let cx = Math.floor(x0 / 900) * 900 + 640; cx < x0 + w + 200; cx += 900) for (let k = 0; k < 6; k++) { const y = GY + 26 + k * 28 + k * k * 2; box(g, cx - 40 - k * 4, y, 80 + k * 8, 8 + k * 2, C[5]); box(g, cx - 40 - k * 4, y, 80 + k * 8, 1, C[6]); }
    const Sn = SNOW.map(col => hour(col, 0.06));
    for (let i = 0; i < w / 40; i++) { const sx = x0 + hash(s + i * 2.3) * w, sy = GY + 30 + hash(s + i * 4.1) * 230, sc = 1 + (sy - GY) / 120; box(g, sx, sy, (20 + hash(i) * 40) * sc, Math.max(1, sc), i % 3 ? Sn[4] : Sn[5]); }
    for (let x = Math.floor(x0 / 30) * 30; x < x0 + w; x += 30) { const h = 4 + hash(x * 0.7) * 6; box(g, x, GY + 22, 31, h, Sn[4]); box(g, x, GY + 22, 31, 1, Sn[5]); box(g, x, GY + 22 + h, 31, 1, Sn[2]); }
  } else if (z !== 'paris' && z !== 'west') {
    // (the lane lines, worn; the double yellow far down)
    for (let x = Math.floor(x0 / 6) * 6; x < x0 + w; x += 6) if (hash(x * 0.21) > 0.2) box(g, x, GY + 36, 6, 2, C[5]);
    box(g, x0, GY + 150, w, 4, hour('#D8A020', 0.1)); box(g, x0, GY + 160, w, 4, hour('#D8A020', 0.1));
  }
  // (fallen bricks and chunks, broken glass glinting, the ash over everything)
  for (let i = 0; i < w / 120; i++) {
    const bx = x0 + hash(s + i * 8.3) * w, by = GY + 26 + hash(s + i * 5.7) * 200, sc = 1 + (by - GY) / 110;
    box(g, bx - 1, by - 1, 9 * sc + 2, 4 * sc + 2, INK); box(g, bx, by, 9 * sc, 4 * sc, hour(i % 3 ? '#8A3E2C' : '#7A7270', 0.1)); box(g, bx, by, 9 * sc, 1, hour(i % 3 ? '#B4604A' : '#A8A098', 0.1));
  }
  for (let i = 0; i < w / 50; i++) { const gx = x0 + hash(s + i * 1.9) * w, gy = GY + 24 + hash(s + i * 7.7) * 220; box(g, gx, gy, 2, 1, hour('#C8E0F0', 0.05)); }
  for (let i = 0; i < w / 5; i++) { const lx = x0 + hash(s + i * 0.91) * w, ly = GY + 22 + hash(s + i * 2.13) * (BAND - 26), sc = 1 + (ly - GY) / 100; box(g, lx, ly, 2 * sc, Math.max(1, sc * 0.7), i % 4 ? Ash[3] : Ash[5]); }
  if (z !== 'west') curb(); else { box(g, x0, GY, w, 8, DIRT_R.map(col => hour(col, 0.1))[3]); }
  // (the edge he walks along: lit)
  box(g, x0, GY, w, 3, LIP[2]); box(g, x0, GY, w, 1, LIP[3]);
  box(g, x0, GY + 3, w, 1, INK);
};

/** The street under him (bent), each flat run; `decals` paints what's live on it (the zone's marks, the puddles)
 *  before it's bent. */
export const drawHavocStreet = (c: Ctx, v: View, decals: (c: Ctx, a: number, b: number) => void) => {
  const CH = 512, tod = timeOfDay();
  // (what's either side of the street's runs under the play plane, first, so the bend never pulls the sky in at their
  // ends: the lava down in its rivers, the hill's rock at its foot and its flank)
  if (v.bot > GY) {
    const fill = (xa: number, xb: number, col: string) => { const l = Math.max(xa, v.v0), r = Math.min(xb, v.v1); if (r > l) box(c, l, GY, r - l, v.bot - GY, col); };
    for (const l of STREET_LAVA) fill(X(l.a), X(l.b), LAVA_R[3]);
    fill(X(DOWNHILL.b) - 900, X(DOWNHILL.b), ROCK[3]);
    fill(X(DOWNHILL.a), X(DOWNHILL.a) + 600, ROCK[3]);
  }
  for (const [fa, fb] of FLOOR) {
    if (fb < v.v0 - 40 || fa > v.v1 + 40 || v.bot < GY - 10 || v.top > GY + BAND) continue;
    for (const [za, zb, z] of HZONES) {
      const a = Math.max(fa, X(za)), b = Math.min(fb, X(zb));
      for (let x = a, i = 0; x < b; x += CH, i++) {
        const w = Math.min(CH, b - x);
        if (x + w < v.v0 || x > v.v1) continue;
        stamp(c, `hh-street-${tod.key}-${z}-${Math.round(a)}-${i}`, x, GY - 2, w, BAND + 2, g => paintStreet(g, x, w, z));
      }
    }
    if (v.bot > GY + BAND) box(c, Math.max(fa, v.v0), GY + BAND - 1, Math.min(fb, v.v1) - Math.max(fa, v.v0), v.bot - GY - BAND + 1, hour(ASPHALT[2], 0.1));
    decals(c, fa, fb);
    bendFloor(c, v.eye, GY, GY, GY + BAND, fa, fb);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The lava rivers

/** Where the lava pours in (the part of the channel's far wall a front isn't standing over). */
export const pourAt = (l: typeof LAVA[number]) => {
  for (const [rx, w] of DECOR) if (rx < l.b && rx + w > l.a) {
    const left = rx - l.a, right = l.b - (rx + w);
    if (left >= right && left > 30) return (l.a + rx) / 2;
    if (right > 30) return (rx + w + l.b) / 2;
  }
  return (l.a + l.b) / 2;
};

/** A point on a lava top: world x, t along the flow (0 its far end, 1 nearest us) to screen x, y and the scale there. */
type Proj = (x: number, t: number) => [number, number, number];

/** A crust plate's outline (round its middle, x across, t along the flow), jittered per plate. */
const PLATE: [number, number][] = [[-1, -0.3], [-0.45, -1], [0.55, -0.9], [1, 0.15], [0.5, 1], [-0.6, 0.85]];
/** One crust plate on the molten: the seam round it near-white yellow going red, the crust black-red, cooled black on top
 *  with a lit middle, cracks opening across it as it comes on (stepped: red round orange round a white-hot core). */
const plate = (c: Ctx, proj: Proj, x: number, t: number, pw: number, pt: number, seed: number) => {
  const [cx, cy, s] = proj(x, t);
  if (s * pw < 4) return;
  const pts = PLATE.map(([u, w], i): [number, number] => { const j = 0.72 + hash(seed + i * 1.3) * 0.45, [px, py] = proj(x + (u * j * pw) / 2, t + (w * j * pt) / 2); return [px, py]; });
  const k = (m: number, dy = 0) => pts.map(([px, py]): [number, number] => [cx + (px - cx) * m, cy + (py - cy) * m + dy]);
  poly(c, k(1.28), LAVA_R[5]);
  poly(c, k(1.12), LAVA_R[2]);
  poly(c, pts, LAVA_R[0]);
  poly(c, k(0.74, -s * 0.5), BASALT[2]);
  poly(c, k(0.34, -s), BASALT[4]);
  // (the cracks: through its middle corner to corner, a branch as it opens up)
  const open = Math.min(1, t * 1.5), i0 = Math.floor(hash(seed * 1.7) * 6), mid: [number, number] = [cx + (hash(seed + 5) - 0.5) * pw * 0.22 * s, cy];
  const paths: [number, number][][] = [[pts[i0], mid, pts[(i0 + 3) % 6]]];
  if (open > 0.5) paths.push([mid, pts[(i0 + 1) % 6]]);
  for (const p of paths) {
    const line = (w: number, col: string) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); p.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.stroke(); };
    if (open > 0.25) line(Math.max(1, 3 * open * Math.min(1.4, s)), LAVA_R[2]);
    line(Math.max(1, 1.6 * open * Math.min(1.4, s)), LAVA_R[4]);
    if (open > 0.6) line(1, LAVA_R[6]);
  }
};
/** A bubble: swelling (a stepped dome, a glint, its skin going dark just before), then popping: a ring, spatter thrown up
 *  and falling back. `u` its life, 0..1. */
const bubble = (c: Ctx, proj: Proj, x: number, t: number, u: number) => {
  const [bx, by, s] = proj(x, t);
  if (u < 0.78) {
    const g = u / 0.78, r = (1.5 + g * 6) * s, h = Math.max(1, r * (0.5 + g * 0.5));
    box(c, bx - r - s, by - h * 0.25, r * 2 + s * 2, Math.max(1, h * 0.45), LAVA_R[2]);
    box(c, bx - r, by - h, r * 2, h, LAVA_R[4]);
    box(c, bx - r * 0.7, by - h * 1.1, r * 1.4, h * 0.6, g > 0.8 ? LAVA_R[3] : LAVA_R[5]);
    box(c, bx - r * 0.35, by - h * 1.05, Math.max(1, r * 0.4), Math.max(1, h * 0.3), LAVA_R[6]);
  } else {
    const g = (u - 0.78) / 0.22, rr = (5 + g * 8) * s;
    box(c, bx - rr, by - s, rr * 2, Math.max(1, s), LAVA_R[5]); box(c, bx - rr * 0.6, by, rr * 1.2, Math.max(1, s), LAVA_R[2]);
    for (let n = 0; n < 6; n++) {
      const dx = (n - 2.5) * 4.2 * s * g, dy = ((14 + (n % 3) * 7) * g - g * g * 24) * s, sz = Math.max(1, Math.round(2 * s * (1 - g * 0.5)));
      box(c, bx + dx, by - dy, sz, sz, g < 0.45 ? LAVA_R[6] : g < 0.75 ? LAVA_R[5] : LAVA_R[3]);
    }
  }
};
/** On the molten (its bands drawn by the caller): the flow's bright ripples carried on toward us, crust plates drifting
 *  on toward us (the farther first) and cracking open as they come, bubbles swelling and popping. `pt`: t per px of a
 *  plate's width (how deep a plate is, along the flow). */
const lavaTop = (c: Ctx, proj: Proj, a: number, b: number, f: number, seed: number, pt: number) => {
  const w = b - a;
  for (let k = 0; k < Math.ceil(w / 12); k++) {
    const t = (f * 0.0016 + hash(k * 2.3 + seed)) % 1, x = a + 6 + hash(k * 7.1 + seed) * (w - 12), [sx, sy, s] = proj(x, t);
    box(c, sx - 4 * s, sy, 8 * s, Math.max(1, s * 0.6), k % 3 ? LAVA_R[5] : LAVA_R[6]); box(c, sx - 3 * s, sy + Math.max(1, s * 0.6), 7 * s, 1, LAVA_R[2]);
  }
  const plates: { k: number; t: number; pw: number; x: number }[] = [];
  for (let k = 0; k < Math.max(6, Math.round(w / 18)); k++) {
    const t = (f * 0.0011 + hash(k * 1.9 + seed)) % 1, pw = 14 + hash(k * 4.3 + seed) * 22;
    plates.push({ k, t, pw, x: a + pw * 0.6 + hash(k * 3.7 + seed) * Math.max(1, w - pw * 1.2) + Math.sin(f * 0.01 + k) * 3 });
  }
  plates.sort((p, q) => p.t - q.t);
  for (const p of plates) plate(c, proj, p.x, p.t, p.pw, pt * p.pw, seed + p.k * 13);
  for (let k = 0; k < Math.max(3, Math.round(w / 40)); k++) {
    const per = 64 + (k % 3) * 14, ph = hash(k * 5.5 + seed) * per, cyc = Math.floor((f + ph) / per), u = ((f + ph) % per) / per;
    bubble(c, proj, a + 10 + hash(k * 9.1 + seed + cyc * 3.3) * (w - 20), 0.08 + hash(k * 2.9 + seed + cyc * 1.7) * 0.85, u);
  }
};
/** A glowing crack in the cooled crust (spent): stepped, dark red round a dim orange core, slowly breathing. */
const coldCrack = (c: Ctx, pts: [number, number][], br: number) => {
  for (const [w, col] of [[3, 'rgba(70, 14, 6, 0.55)'], [1, `rgba(226, 104, 36, ${(0.22 + 0.2 * br).toFixed(3)})`]] as const) {
    c.strokeStyle = col; c.lineWidth = w; c.beginPath(); pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.stroke();
  }
};

/** A lava river's channel going back from the play plane to depth D (its far wall, the pour, the lava, its side walls). */
export const lavaBack = (c: Ctx, v: View, l: typeof LAVA[number], done: boolean, f: number, D: number, notch = false) => {
  const a = X(l.a), b = X(l.b), ya = Y(l.hl), yb = Y(l.hr);
  if (b < v.v0 - 200 || a > v.v1 + 200) return;
  const eye = v.eye, lo = Math.min(l.hl, l.hr), surf = Y(lo) + LAVA_DOWN;
  if (done) {
    // (crusted over: black basalt flush with the banks going back, its plates' seams, a few cracks still faintly glowing)
    const yc = Y((l.hl + l.hr) / 2);
    for (let i = 0; i < 4; i++) { const p = 1 - ((1 - D) * i) / 4, q = 1 - ((1 - D) * (i + 1)) / 4; levelQ(c, eye, a, b, yc, p, q, [BASALT[3], BASALT[2], BASALT[2], BASALT[1]][i]); }
    c.strokeStyle = BASALT[0]; c.lineWidth = 1; c.beginPath();
    for (let x = a + 20; x < b - 14; x += 38) { const [p0, q0] = at(eye, x, yc, 0.995), [p1, q1] = at(eye, x + 8 + hash(x) * 10, yc, D + 0.01); c.moveTo(p0, q0); c.lineTo(p1, q1); }
    for (const d of [0.975, 0.945, 0.915]) if (d > D) { const [p0, q0] = at(eye, a + 4, yc, d), [p1, q1] = at(eye, b - 4, yc, d - 0.004); c.moveTo(p0, q0); c.lineTo(p1, q1); }
    c.stroke();
    const br = 0.5 + 0.5 * Math.sin(f * 0.025 + l.a), n = Math.max(2, Math.round((b - a) / 140));
    for (let k = 0; k < n; k++) {
      const x0c = a + ((k + 0.5) * (b - a)) / n + (hash(k * 3.1 + l.a) - 0.5) * 20, pts: [number, number][] = [];
      for (let j = 0; j <= 5; j++) pts.push(at(eye, x0c + (hash(k * 7 + j + l.a) - 0.5) * 22, yc, 0.995 - (j * (0.995 - D - 0.015)) / 5));
      coldCrack(c, pts, br);
    }
    return;
  }
  c.save();
  const A1 = at(eye, a, ya, D), B1 = at(eye, b, yb, D);
  // (its opening going back; on the hill, the notch it cuts down through the rock face at the front too)
  c.beginPath(); if (notch) c.moveTo(a, surf + 2); else c.moveTo(a, ya);
  c.lineTo(a, ya); c.lineTo(A1[0], A1[1]); c.lineTo(B1[0], B1[1]); c.lineTo(b, yb); if (notch) c.lineTo(b, surf + 2); c.closePath(); c.clip();
  const fl = 0.5 + 0.5 * Math.sin(f * 0.09 + l.a) * Math.sin(f * 0.031 + 1);
  // (the far wall: rock in courses, the glow cast up it from the lava, stepped, flickering)
  const fw = (y0: number, y1: number, col: string) => poly(c, [at(eye, a, y0, D), at(eye, b, y0 + (yb - ya), D), at(eye, b, y1 + (yb - ya), D), at(eye, a, y1, D)], col);
  const span = surf - ya;
  const WALL = [ROCK[2], ROCK[1], ROCK[2], mix(ROCK[3], LAVA_R[1], 0.35), mix(ROCK[3], LAVA_R[2], 0.45 + fl * 0.2), LAVA_R[2], LAVA_R[3]];
  WALL.forEach((col, i) => fw(ya + (span * i) / WALL.length, ya + (span * (i + 1)) / WALL.length + 1, col));
  for (let i = 1; i < 5; i++) fw(ya + (span * i) / WALL.length, ya + (span * i) / WALL.length + 1, ROCK[0]);
  // (the surface: molten, banded going back, the bands carried on toward us)
  const NB = 12, MOLT = [LAVA_R[3], LAVA_R[4], LAVA_R[4], LAVA_R[3], LAVA_R[2], LAVA_R[3]];
  for (let i = 0; i < NB; i++) {
    const p = 1.6 - ((1.6 - D) * i) / NB, q = 1.6 - ((1.6 - D) * (i + 1)) / NB;
    levelQ(c, eye, a, b, surf, p, q, MOLT[(i + Math.floor(f / 10)) % MOLT.length]);
  }
  // (hotter where it's poured in: a stepped pool of brighter round the pour's foot)
  const px = X(pourAt(l)), bank = ya + ((yb - ya) * (px - a)) / Math.max(1, b - a);
  for (const [hw, dd, col] of [[60, 0.05, LAVA_R[4]], [36, 0.03, LAVA_R[5]], [16, 0.014, LAVA_R[6]]] as const) levelQ(c, eye, px - hw, px + hw, surf, D + dd, D, col);
  // (the flow, its crust plates, its bubbles)
  const projB: Proj = (x, t) => { const d = D + 0.012 + t * (1.3 - D), [sx, sy] = at(eye, x, surf, d); return [sx, sy, d]; };
  lavaTop(c, projB, a, b, f, l.a, 0.0009 / (1.3 - D));
  // (the pour: a glowing fall down the far wall out of a gash in its lip, crusting at its edges, pulses and clots running
  // down it, white-hot down its middle; splashing where it hits)
  const gash: [number, number][] = [[-18, -1], [-7, -6], [4, -3], [16, -6], [20, 3], [-15, 4]];
  poly(c, gash.map(([gx, gy]) => at(eye, px + gx, bank + gy, D)), INK);
  poly(c, gash.map(([gx, gy]) => at(eye, px + gx * 0.7, bank + gy * 0.6 + 1, D)), LAVA_R[5]);
  poly(c, gash.map(([gx, gy]) => at(eye, px + gx * 0.35, bank + gy * 0.3 + 1, D)), LAVA_R[6]);
  const pulse = f * 2.4;
  for (let y = bank - 2; y < surf; y += 2) {
    const [sx, sy] = at(eye, px + Math.sin(y * 0.15 + f * 0.05) * 2, y, D), u = (y - bank) / Math.max(1, surf - bank), wv = (12 + u * 10) * D;
    const band = (((y - pulse) % 16) + 16) % 16;
    box(c, sx - wv / 2 - 1, sy, wv + 2, 2, LAVA_R[1]); box(c, sx - wv / 2, sy, wv, 2, LAVA_R[3]);
    box(c, sx - wv * 0.35, sy, wv * 0.7, 2, band < 6 ? LAVA_R[5] : LAVA_R[4]);
    box(c, sx - wv * 0.12, sy, Math.max(1, wv * 0.24), 2, band < 3 ? '#FFFFFF' : LAVA_R[6]);
    if (hash(Math.floor((y - pulse) / 6) * 1.37) > 0.82) box(c, sx + (hash(Math.floor((y - pulse) / 6)) - 0.5) * wv * 0.6, sy, 3 * D, 2, LAVA_R[0]);
  }
  const [fx, fy] = at(eye, px, surf, D + 0.008);
  box(c, fx - 18, fy - 2, 36, 4, LAVA_R[5]); box(c, fx - 9, fy - 3, 18, 3, LAVA_R[6]);
  for (let k = 0; k < 3; k++) { const t = ((f + k * 14) % 42) / 42, rw = 14 + t * 46; box(c, fx - rw, fy + 1 + t * 3, rw * 2, 1, t < 0.5 ? LAVA_R[2] : LAVA_R[1]); }
  for (let k = 0; k < 7; k++) {
    const t = ((f * 1.3 + k * 9) % 30) / 30, dx = (k - 3) * 5 * t * D, dy = (18 + (k % 3) * 8) * t - t * t * 30;
    box(c, fx + dx, fy - dy * D, 2, 2, t < 0.4 ? LAVA_R[6] : t < 0.75 ? LAVA_R[5] : LAVA_R[3]);
  }
  // (the side walls, the ones he's looking at: rock, the glow up them from their feet (stepped, flickering), splashes
  // glowing along the foot)
  const wall = (e: number, ye: number, side: 1 | -1) => {
    if ((eye.x - e) * side <= 1) return;
    const sp = surf - ye, SW = [ROCK[3], ROCK[2], ROCK[2], mix(ROCK[3], LAVA_R[1], 0.4), mix(ROCK[2], LAVA_R[2], 0.4 + fl * 0.2), LAVA_R[1], LAVA_R[2]];
    SW.forEach((col, i) => sideQ(c, eye, e, ye + (sp * i) / SW.length, ye + (sp * (i + 1)) / SW.length + 1, 1, D, col));
    for (let k = 0; k < 6; k++) { const d = D + ((k + 0.5) * (1 - D)) / 6, [sx, sy] = at(eye, e, surf - 3 - hash(k + e) * 6, d); if (((f >> 3) + k) % 4) box(c, sx - 1, sy, 2, 2, LAVA_R[(k % 2) + 4]); }
  };
  wall(a, ya, 1); wall(b, yb, -1);
  c.restore();
};

/** The lava toward us (under the play plane, between the street's bent edges): the near walls hung under the broken
 *  curb, the lava down there (banded toward us, its plates and bubbles); crusted, spent (a lit lip along it: walkable). */
export const lavaNear = (c: Ctx, v: View, l: typeof LAVA[number], done: boolean, f: number) => {
  const a = X(l.a), b = X(l.b);
  if (b < v.v0 - 100 || a > v.v1 + 100 || v.bot < GY) return;
  const ex = v.eye.x, Y1 = Math.min(v.bot + 20, GY + BAND + 200);
  const edge = (e: number, y: number) => ex + (e - ex) * (1 + (y - GY) * BEND);
  const N = 10, A: [number, number][] = [], B: [number, number][] = [], Af: [number, number][] = [], Bf: [number, number][] = [];
  for (let i = 0; i <= N; i++) { const y = GY + ((Y1 - GY) * i) / N; A.push([edge(a, y), y]); B.push([edge(b, y), y]); Af.push([Math.min(a, edge(a, y)), y]); Bf.push([Math.max(b, edge(b, y)), y]); }
  if (done) {
    // (crusted: basalt banded toward us, its plates' seams, a few cracks still faintly glowing)
    const cols = [BASALT[3], BASALT[2], BASALT[2], BASALT[1], BASALT[1]];
    for (let i = 0; i < N; i++) poly(c, [Af[i], Bf[i], Bf[i + 1], Af[i + 1]], cols[i % cols.length]);
    c.strokeStyle = BASALT[0]; c.lineWidth = 1; c.beginPath();
    for (let x = a + 16; x < b - 10; x += 34) { c.moveTo(edge(x, GY + 6), GY + 6); c.lineTo(edge(x + 6 + hash(x) * 8, GY + 70), GY + 70); }
    for (const y of [GY + 30, GY + 74, GY + 130]) { c.moveTo(edge(a + 4, y), y); c.lineTo(edge(b - 4, y + 3), y + 3); }
    c.stroke();
    const br = 0.5 + 0.5 * Math.sin(f * 0.025 + l.b), n = Math.max(2, Math.round((b - a) / 140));
    for (let k = 0; k < n; k++) {
      const x0c = a + ((k + 0.5) * (b - a)) / n + (hash(k * 4.3 + l.b) - 0.5) * 20, pts: [number, number][] = [];
      for (let j = 0; j <= 5; j++) { const y = GY + 6 + j * 24; pts.push([edge(x0c + (hash(k * 9 + j + l.b) - 0.5) * 22, y), y]); }
      coldCrack(c, pts, br);
    }
    box(c, a, GY - 1, b - a, 1, INK); box(c, a, GY, b - a, 3, LIP[2]); box(c, a, GY, b - a, 1, LIP[3]);
    return;
  }
  // (the lava between them: banded toward us, the bands carried on toward us, dithered where they meet; on it the flow,
  // the crust plates, the bubbles)
  c.save(); c.beginPath(); [...Af, ...[...Bf].reverse()].forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.closePath(); c.clip();
  const xl = Af[N][0] - 4, xr = Bf[N][0] + 4, NB = 14, rh = (Y1 - GY) / NB, MOLT = [LAVA_R[3], LAVA_R[4], LAVA_R[4], LAVA_R[3], LAVA_R[2], LAVA_R[3]];
  let prev = '';
  for (let i = 0; i < NB; i++) {
    const col = MOLT[(((i - Math.floor(f / 10)) % MOLT.length) + MOLT.length) % MOLT.length], y = GY + i * rh;
    box(c, xl, y, xr - xl, rh + 1, col);
    if (prev && prev !== col) checker(c, Math.round(xl / 2) * 2, Math.round(y / 2) * 2, xr - xl, 2, prev, 0);
    prev = col;
  }
  const projN: Proj = (x, t) => { const y = GY + 4 + t * (Y1 - GY), s = 1 + (y - GY) * BEND; return [edge(x, y), y, s]; };
  lavaTop(c, projN, a, b, f, l.b, 0.45 / Math.max(60, Y1 - GY));
  c.restore();
  // (the near walls: hung from the broken edge, the one facing him rock, the glow up them from the lava, flickering)
  const fl = 0.5 + 0.5 * Math.sin(f * 0.09 + l.a) * Math.sin(f * 0.031 + 1);
  for (const [P, s, e] of [[A, 1, a], [B, -1, b]] as const) {
    if ((ex - e) * s <= 1) continue;
    for (let i = 0; i < N; i++) {
      const th = 10 + i * 4;
      poly(c, [P[i], P[i + 1], [P[i + 1][0] + s * th, P[i + 1][1] + th * 0.4], [P[i][0] + s * th, P[i][1] + th * 0.4]], i % 2 ? ROCK[2] : ROCK[3]);
      poly(c, [[P[i][0] + s * th * 0.55, P[i][1] + th * 0.22], [P[i + 1][0] + s * th * 0.55, P[i + 1][1] + th * 0.22], [P[i + 1][0] + s * th * 0.7, P[i + 1][1] + th * 0.28], [P[i][0] + s * th * 0.7, P[i][1] + th * 0.28]], mix(ROCK[3], LAVA_R[2], 0.4 + fl * 0.2));
      poly(c, [[P[i][0] + s * th * 0.7, P[i][1] + th * 0.28], [P[i + 1][0] + s * th * 0.7, P[i + 1][1] + th * 0.28], [P[i + 1][0] + s * th, P[i + 1][1] + th * 0.4], [P[i][0] + s * th, P[i][1] + th * 0.4]], LAVA_R[2]);
      poly(c, [[P[i][0] + s * th * 0.92, P[i][1] + th * 0.37], [P[i + 1][0] + s * th * 0.92, P[i + 1][1] + th * 0.37], [P[i + 1][0] + s * th, P[i + 1][1] + th * 0.4], [P[i][0] + s * th, P[i][1] + th * 0.4]], LAVA_R[4]);
    }
  }
  // (the broken lips: jagged chunks of the curb, lit from under by the lava)
  for (const [e, s] of [[a, 1], [b, -1]] as const) {
    poly(c, [[e, GY], [e + s * 22, GY], [e + s * 12, GY + 7], [e + s * 24, GY + 12], [e + s * 6, GY + 20], [e, GY + 16]], INK);
    poly(c, [[e, GY + 1], [e + s * 20, GY + 1], [e + s * 10, GY + 7], [e + s * 21, GY + 11], [e + s * 5, GY + 18], [e, GY + 14]], CONCRETE[3]);
    poly(c, [[e + s * 21, GY + 11], [e + s * 5, GY + 18], [e + s * 8, GY + 15], [e + s * 18, GY + 11]], mix(CONCRETE[2], LAVA_R[3], 0.5));
    box(c, Math.min(e, e + s * 18), GY + 1, 18, 2, LIP[2]);
  }
  void W;
};

/** The heat off a lava river (live, after what stands behind it; at the play plane): the glow up over it in stepped
 *  bands, flickering; the air over it shimmering (rows wavering side to side); smoke curling up thin; embers going up,
 *  winking, cooling as they go (white-yellow, orange, red). */
export const lavaGlow = (c: Ctx, v: View, l: typeof LAVA[number], f: number) => {
  const a = X(l.a), b = X(l.b), top = Y(Math.max(l.hl, l.hr));
  if (b < v.v0 - 100 || a > v.v1 + 100) return;
  const fl = 0.85 + 0.15 * Math.sin(f * 0.11 + l.a) * Math.sin(f * 0.037);
  for (let k = 0; k < 6; k++) { c.fillStyle = `rgba(249, 115, 22, ${((0.03 + k * 0.028) * fl).toFixed(3)})`; c.fillRect(Math.round(a - 14 + k * 2), top - 108 + k * 18, Math.round(b - a + 28 - k * 4), 18); }
  for (let y = top - 96, i = 0; y < top - 4; y += 2, i++) {
    if (i % 2) continue;
    const off = Math.sin(y * 0.35 + f * 0.3) * 3 + Math.sin(y * 0.13 - f * 0.17) * 2, k = 1 - (top - y) / 96;
    c.fillStyle = `rgba(255, 214, 150, ${(0.04 + 0.07 * k).toFixed(3)})`; c.fillRect(Math.round(a + 8 + off), y, Math.round(b - a - 16), 1);
    c.fillStyle = `rgba(120, 30, 10, ${(0.03 + 0.05 * k).toFixed(3)})`; c.fillRect(Math.round(a + 8 - off), y + 1, Math.round(b - a - 16), 1);
  }
  for (let k = 0; k < Math.max(1, Math.round((b - a) / 120)); k++) smokeUp(c, a + 20 + hash(k * 4.1 + l.a) * (b - a - 40), top - 2, f, k + (l.a % 7), 0.55, 0.26, 5);
  const n = 10 + Math.round((b - a) / 30);
  for (let k = 0; k < n; k++) {
    const per = 70 + (k % 4) * 20, t = ((f + k * 23) % per) / per;
    if (t > 0.5 && ((f + k * 5) >> 2) % 7 === 0) continue;
    const x = a + 8 + hash(k * 3.3 + l.a) * (b - a - 16) + Math.sin(f * 0.08 + k) * 6 * t, y = top - 4 - t * (90 + (k % 3) * 30);
    const sz = t < 0.5 ? 2 : 1;
    box(c, x, y, sz, sz, t < 0.25 ? LAVA_R[6] : t < 0.55 ? LAVA_R[5] : t < 0.8 ? LAVA_R[4] : LAVA_R[2]);
  }
};

/** The chase's puddles: the water going back over the pavement (ripples, the red sky in it), and on the near street
 *  (before the bend). */
export const puddlesBack = (c: Ctx, v: View, f: number) => {
  for (const [ra, rb] of PUDDLES) {
    const a = X(ra), b = X(rb);
    if (b < v.v0 - 60 || a > v.v1 + 60) continue;
    const eye = v.eye;
    for (let i = 0; i < 3; i++) { const p = 1 - 0.012 * i, q = 1 - 0.012 * (i + 1); poly(c, [at(eye, a + 10 + i * 8, GY, p), at(eye, b - 10 - i * 6, GY, p), at(eye, b - 18 - i * 8, GY, q), at(eye, a + 18 + i * 6, GY, q)], ['rgba(60, 78, 100, 0.85)', 'rgba(90, 60, 70, 0.8)', 'rgba(70, 86, 110, 0.75)'][i]); }
    for (let x = a + 16; x < b - 16; x += 30) { const [sx, sy] = at(eye, x + ((f * 0.4 + x) % 12), GY, 0.982); box(c, sx, sy, 8, 1, 'rgba(203, 213, 225, 0.8)'); }
  }
};
export const puddlesNear = (c: Ctx, a: number, b: number, f: number) => {
  for (const [ra, rb] of PUDDLES) {
    const x0 = Math.max(a, X(ra)), x1 = Math.min(b, X(rb));
    if (x1 <= x0) continue;
    for (let r = 0; r < 4; r++) { const inset = 6 + r * 10; box(c, x0 + inset, GY + 2 + r * 5, x1 - x0 - inset * 2, 5, r ? 'rgba(52, 66, 86, 0.85)' : 'rgba(110, 70, 70, 0.8)'); }
    box(c, x0 + 6, GY + 2, x1 - x0 - 12, 1, 'rgba(226, 232, 240, 0.7)');
    for (let x = x0 + 14; x < x1 - 14; x += 26) box(c, x + ((f * 0.5 + x) % 10), GY + 8 + ((x / 26) % 3) * 4, 10, 1, '#CBD5E1');
  }
};

void DOWNHILL; void mix; void ASHY; void Y;
