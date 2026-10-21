// The backlot's ground, in fake 3D (the boulevard's one eye: blvd/kit.ts). Going back from the play plane to the fronts
// (FRONT_D), stretch by stretch: the service road out of the warehouse (asphalt, its fire lane, the bulldozer's tread
// marks from the hole to the dumpster, the rubble it dragged); NEW YORK STREET's sidewalk (concrete slabs, their joints
// toward the eye, steel cellar doors, gum); the flood tank's apron (poured slabs, KEEP BACK in yellow, drains); the
// western town's dirt street (wagon ruts, hoofprints) up to the boardwalk along the false fronts; the fake suburb's lawns
// (mower stripes) between the sidewalk and the flower beds; the gift shop's plaza (terracotta pavers). Behind the
// fronts, the lot strip their bracing stands in (blvd/ground.ts). The holes going all the way back (MAIN STREET
// COLLAPSE's dirt and broken boardwalk, the foundation pit's poured walls and its forms, rebar, a mixer, a puddle).
// At the play plane: the street under him, stretch by stretch (bent the SNES way, run by run, so it fans out as he goes
// by), its edge lit where he walks; the holes' near walls hung under their broken lips.

import { CANVAS_WIDTH } from '../../../m1/constants';
import { bendFloor } from '../../intro/art/kit';
import { GY } from '../geometry';
import { X, GROUND, PIT1, PIT2, DUMP, BREAK, TANK } from './layout';
import {
  type Ctx, type View, INK, box, checker, mix, hash, poly, at, stamp, bandedGradient, hazeBands, timeOfDay, skyAt, signText,
  FRONT_D, CONCRETE, ASPHALT, LIP, STEVE, hour, plain,
} from '../blvd/kit';
import { BAND, tint, wallBack, nearBank } from '../blvd/ground';
import { DIRT, BOARD, LAWN, BRICK, ZONES, type Zone } from './paint';

const W = CANVAS_WIDTH;
const FLOOR: [number, number][] = GROUND.map(([a, b]) => [X(a), X(b)]);
/** The curb's top (the first row going back), and the boardwalk's front edge (the western town's). */
const CURB_D = 0.986, WALK_D = 0.905;

const Q = (c: Ctx, eye: View['eye'], xa: number, xb: number, d0: number, d1: number, col: string) => poly(c, [at(eye, xa, GY, d0), at(eye, xb, GY, d0), at(eye, xb, GY, d1), at(eye, xa, GY, d1)], col);
/** Bands from d0 back to d1 in the colors given (nearest first). */
const rows = (c: Ctx, eye: View['eye'], a: number, b: number, d0: number, d1: number, cols: string[]) => {
  cols.forEach((col, i) => { const p = d0 - ((d0 - d1) * i) / cols.length, q = d0 - ((d0 - d1) * (i + 1)) / cols.length; Q(c, eye, a, b, p, q, tint(col, p)); });
};
/** A line on the ground going back toward the eye from d0 to d1 at world x. */
const joint = (c: Ctx, eye: View['eye'], x: number, d0: number, d1: number, col: string) => {
  const [p0, q0] = at(eye, x, GY, d0), [p1, q1] = at(eye, x, GY, d1);
  c.strokeStyle = col; c.lineWidth = 1; c.beginPath(); c.moveTo(p0, q0); c.lineTo(p1, q1); c.stroke();
};
/** A dab lying on the ground at world x, depth d (w by h at the play plane's scale, squashed going back). */
const dab = (c: Ctx, x: number, d: number, eye: View['eye'], w: number, h: number, col: string) => {
  const [sx, sy] = at(eye, x, GY, d);
  box(c, Math.round(sx - (w * d) / 2), Math.round(sy), Math.max(1, Math.round(w * d)), Math.max(1, Math.round(h * d * 0.5)), col);
};

// ---------------------------------------------------------------------------------------------------------------
// The ground going back, stretch by stretch

const pave = (c: Ctx, v: View, a: number, b: number, z: Zone) => {
  const eye = v.eye, C = CONCRETE, A = ASPHALT;
  const step = (n: number, k: number) => Math.ceil(a / n) * n + k;
  if (z === 'lot') {
    // (the service road: the curb's top, asphalt in bands, a fire lane's red stripe at the back)
    Q(c, eye, a, b, 1, CURB_D, tint(C[4], 1));
    rows(c, eye, a, b, CURB_D, FRONT_D + 0.012, [A[4], A[4], A[3], A[3], A[2]]);
    Q(c, eye, a, b, FRONT_D + 0.012, FRONT_D, tint('#8A3A34', FRONT_D));
    Q(c, eye, a, b, FRONT_D + 0.012, FRONT_D + 0.009, tint('#B85A50', FRONT_D));
    for (let x = step(37, 0); x < b; x += 37) { const h = hash(x * 0.17), d = CURB_D - 0.01 - h * 0.08; if (h > 0.4) dab(c, x, d, eye, 2, 2, tint(h > 0.75 ? A[5] : A[1], d)); }
    // (the bulldozer's tread marks, out of the hole to the dumpster: two tracks of cleats; the rubble it dragged)
    const t0 = Math.max(a, X(BREAK.b) - 20), t1 = Math.min(b, X(DUMP.a) - 60);
    for (const d of [0.968, 0.93]) for (let x = Math.ceil(t0 / 9) * 9; x < t1; x += 9) { const [sx, sy] = at(eye, x, GY, d); box(c, sx, sy - 1, Math.max(2, Math.round(5 * d)), Math.round(3 * d), tint(A[1], d)); box(c, sx, sy - 1, Math.max(2, Math.round(5 * d)), 1, tint(A[5], d)); }
    for (let k = 0; k < 26; k++) { const x = X(BREAK.b) + 10 + k * 19 + hash(k) * 12; if (x < a || x > b) continue; const d = 0.9 + hash(k * 3.3) * 0.08, s = 4 + hash(k * 1.9) * 8, [sx, sy] = at(eye, x, GY, d); box(c, sx - 1, sy - s * 0.5 - 1, s + 2, s * 0.5 + 2, INK); box(c, sx, sy - s * 0.5, s, s * 0.5, tint(k % 3 ? '#8A848C' : '#B4ACB4', d)); box(c, sx, sy - s * 0.5, s, 1, tint('#D8D0D8', d)); }
    // (FIRE LANE stenciled along it)
    for (let x = step(700, 260); x < b; x += 700) { const [nx, ny] = at(eye, x, GY, 0.905); signText(c, 'FIRE LANE', Math.round(nx), Math.round(ny + 3), plain(1, 1, tint('#D8D0C8', 0.9))); }
  } else if (z === 'ny') {
    // (the sidewalk: the curb's top, slabs in bands, the strip along the fronts' feet; joints going back)
    Q(c, eye, a, b, 1, CURB_D, tint(C[5], 1));
    rows(c, eye, a, b, CURB_D, FRONT_D + 0.006, [C[4], C[4], C[3], C[3]]);
    Q(c, eye, a, b, FRONT_D + 0.006, FRONT_D, tint(C[1], FRONT_D));
    Q(c, eye, a, b, 0.935, 0.933, tint(C[2], 0.935));
    for (let x = step(64, 0); x < b; x += 64) joint(c, eye, x, CURB_D, FRONT_D + 0.006, tint(C[2], 0.94));
    for (let x = step(64, 32); x < b; x += 64) joint(c, eye, x, 1, CURB_D, tint(C[3], 1));
    // (gum, stains, a steel cellar door in the sidewalk now and then: diamond plate, its hinges)
    for (let x = step(11, 0); x < b; x += 11) { const h = hash(x * 0.29), d = 0.9 + h * 0.08; if (h > 0.6) dab(c, x + h * 7, d, eye, 2, 2, tint(h > 0.85 ? '#3A3438' : C[2], d)); }
    for (let x = step(520, 140); x < b - 80; x += 520) {
      Q(c, eye, x, x + 70, 0.925, 0.895, tint('#4A4E54', 0.91)); Q(c, eye, x + 34, x + 36, 0.925, 0.895, tint(INK, 0.91));
      for (let k = 0; k < 6; k++) dab(c, x + 6 + k * 11, 0.91, eye, 3, 2, tint('#7A8088', 0.91));
      Q(c, eye, x, x + 70, 0.925, 0.922, tint('#8A9098', 0.925));
    }
  } else if (z === 'apron') {
    // (the tank's apron: poured slabs, expansion joints, KEEP BACK in yellow round the tank, drains, wet)
    Q(c, eye, a, b, 1, CURB_D, tint(C[5], 1));
    rows(c, eye, a, b, CURB_D, FRONT_D, [C[4], C[3], C[3], C[2]]);
    for (let x = step(120, 0); x < b; x += 120) joint(c, eye, x, CURB_D, FRONT_D, tint(C[1], 0.94));
    Q(c, eye, a, b, 0.94, 0.938, tint(C[1], 0.94));
    for (let x = step(40, 0); x < b; x += 40) { const near = Math.min(Math.abs(x - X(TANK.a)), Math.abs(x - X(TANK.b))); if (near < 260) { Q(c, eye, x, x + 20, 0.982, 0.975, tint('#E8B818', 0.98)); Q(c, eye, x + 20, x + 40, 0.982, 0.975, tint('#2A2228', 0.98)); } }
    for (let x = step(300, 90); x < b; x += 300) { const [gx, gy] = at(eye, x, GY, 0.95); box(c, gx - 12, gy - 2, 24, 4, INK); for (let k = 0; k < 5; k++) box(c, gx - 10 + k * 4, gy - 1, 2, 2, tint(C[1], 0.95)); }
    for (let k = 0; k < 8; k++) { const x = X(TANK.a) - 400 + k * 260 + hash(k) * 80; if (x < a || x > b) continue; const [sx, sy] = at(eye, x, GY, 0.96); c.fillStyle = 'rgba(40, 30, 20, 0.25)'; c.fillRect(Math.round(sx - 30), Math.round(sy - 2), 60, 4); c.fillRect(Math.round(sx - 18), Math.round(sy - 4), 36, 2); }
  } else if (z === 'west') {
    // (the dirt street going back, banded; the boardwalk along the fronts: planks along it, its face down to the dirt)
    Q(c, eye, a, b, 1, CURB_D, tint(DIRT[4], 1));
    rows(c, eye, a, b, CURB_D, WALK_D, [DIRT[4], DIRT[3], DIRT[3], DIRT[3], DIRT[2]]);
    for (const [d, w] of [[0.972, 0.006], [0.948, 0.005]] as const) { Q(c, eye, a, b, d, d - w, tint(DIRT[2], d)); Q(c, eye, a, b, d - w, d - w - 0.002, tint(DIRT[5], d)); }
    for (let x = step(13, 0); x < b; x += 13) { const h = hash(x * 0.21), d = WALK_D + 0.005 + h * 0.075; if (h > 0.45) dab(c, x + h * 9, d, eye, h > 0.8 ? 4 : 2, 2, tint(h > 0.7 ? DIRT[1] : DIRT[5], d)); }
    // (hoofprints, wandering)
    for (let x = step(29, 0); x < b; x += 29) { const d = 0.96 + Math.sin(x * 0.013) * 0.012; dab(c, x, d, eye, 4, 3, tint(DIRT[1], d)); dab(c, x + 1, d - 0.002, eye, 2, 1, tint(DIRT[2], d)); }
    // (the boardwalk: its face (the dirt kicked up its foot), then the planks going back)
    const [, fy] = at(eye, a, GY, WALK_D), fh = 8;
    const [fa] = at(eye, a, GY, WALK_D), [fb] = at(eye, b, GY, WALK_D);
    box(c, fa, fy - fh, fb - fa, fh, tint(BOARD[2], WALK_D)); box(c, fa, fy - 2, fb - fa, 2, tint(DIRT[2], WALK_D)); box(c, fa, fy - fh, fb - fa, 1, tint(BOARD[4], WALK_D));
    for (let x = step(40, 0); x < b; x += 40) { const [px] = at(eye, x, GY, WALK_D); box(c, px, fy - fh, 2, fh, tint(BOARD[1], WALK_D)); }
    const top = (d: number) => at(eye, 0, GY - fh / WALK_D, d)[1];
    const bandsW = [BOARD[3], BOARD[4], BOARD[3], BOARD[2]];
    for (let i = 0; i < 4; i++) {
      const p = WALK_D - ((WALK_D - FRONT_D) * i) / 4, q = WALK_D - ((WALK_D - FRONT_D) * (i + 1)) / 4;
      poly(c, [[at(eye, a, 0, p)[0], top(p)], [at(eye, b, 0, p)[0], top(p)], [at(eye, b, 0, q)[0], top(q)], [at(eye, a, 0, q)[0], top(q)]], tint(bandsW[i], p));
    }
    for (let x = step(90, 0); x < b; x += 90) { const [p0] = at(eye, x, 0, WALK_D), [p1] = at(eye, x, 0, FRONT_D); c.strokeStyle = tint(BOARD[1], 0.89); c.lineWidth = 1; c.beginPath(); c.moveTo(p0, top(WALK_D)); c.lineTo(p1, top(FRONT_D)); c.stroke(); }
  } else if (z === 'burb') {
    // (the sidewalk, then the lawns going back in mower stripes, then the flower beds along the houses' feet)
    Q(c, eye, a, b, 1, CURB_D, tint(C[5], 1));
    rows(c, eye, a, b, CURB_D, 0.962, [C[4], C[4], C[3]]);
    for (let x = step(60, 0); x < b; x += 60) joint(c, eye, x, CURB_D, 0.962, tint(C[2], 0.97));
    Q(c, eye, a, b, 0.962, 0.958, tint(C[2], 0.96));
    for (let x = Math.floor(a / 40) * 40, k = Math.floor(a / 40); x < b; x += 40, k++) {
      const xa = Math.max(a, x), xb = Math.min(b, x + 40);
      rows(c, eye, xa, xb, 0.958, 0.896, k % 2 ? [LAWN[4], LAWN[4], LAWN[3]] : [LAWN[3], LAWN[3], LAWN[2]]);
    }
    for (let x = step(9, 0); x < b; x += 9) { const h = hash(x * 0.37), d = 0.9 + h * 0.055; if (h > 0.5) dab(c, x, d, eye, 1, 3, tint(h > 0.8 ? LAWN[5] : LAWN[1], d)); }
    rows(c, eye, a, b, 0.896, FRONT_D, ['#4A3020', '#3A2418']);
    for (let x = step(17, 0); x < b; x += 17) { const h = hash(x * 0.53), [sx, sy] = at(eye, x, GY, 0.89); box(c, sx - 2, sy - 4, 5, 3, tint(LAWN[2], 0.89)); if (h > 0.4) box(c, sx, sy - 5, 2, 2, tint(['#E84A6A', '#F2C24A', '#F4F0E8', '#B85AE8'][Math.floor(h * 13) % 4], 0.89)); }
  } else {
    // (the gift shop's plaza: terracotta pavers in a basket weave, a border of dark ones)
    Q(c, eye, a, b, 1, CURB_D, tint(C[5], 1));
    const P = ['#5A2A1A', '#7A3A22', '#9A4E2E', '#B4643E', '#C87C52'];
    for (let i = 0; i < 6; i++) {
      const p = CURB_D - ((CURB_D - FRONT_D) * i) / 6, q = CURB_D - ((CURB_D - FRONT_D) * (i + 1)) / 6;
      for (let x = Math.floor(a / 24) * 24, k = 0; x < b; x += 24, k++) { const xa = Math.max(a, x), xb = Math.min(b, x + 23); Q(c, eye, xa, xb, p, q, tint(P[1 + ((Math.floor(x / 24) + i) % 2) + (hash(x + i) > 0.8 ? 1 : 0)], p)); }
    }
    Q(c, eye, a, b, CURB_D, CURB_D - 0.004, tint(P[0], CURB_D)); Q(c, eye, a, b, FRONT_D + 0.004, FRONT_D, tint(P[0], FRONT_D));
  }
  void LIP; void BRICK; void STEVE;
};

export const drawLotPavement = (c: Ctx, v: View) => {
  const eye = v.eye;
  const L = eye.x - (eye.x - v.v0 + 260) / FRONT_D, R = eye.x + (v.v1 + 260 - eye.x) / FRONT_D;
  for (const [fa, fb] of FLOOR) for (const [za, zb, z] of ZONES) {
    const a = Math.max(fa, X(za), L), b = Math.min(fb, X(zb), R);
    if (b > a) pave(c, v, a, b, z);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The holes going back

/** A hole going back from the play plane to the fronts' depth: the dark down it, banded, its far wall in courses, what's
 *  in the bottom (`dress`, in screen terms: the far wall's top-left, its right); then its walls. */
const holeBack = (c: Ctx, v: View, a: number, b: number, kind: 'sink' | 'trench', deep: string[], dress: (ax: number, ay: number, bx: number) => void) => {
  if (b < v.v0 - 300 || a > v.v1 + 300) return;
  const eye = v.eye, haze = skyAt(0.9, timeOfDay());
  const [ax, ay] = at(eye, a, GY, FRONT_D), [bx] = at(eye, b, GY, FRONT_D);
  c.save();
  c.beginPath(); c.moveTo(a, GY); c.lineTo(ax, ay); c.lineTo(bx, ay); c.lineTo(b, GY); c.lineTo(b, v.bot); c.lineTo(a, v.bot); c.closePath(); c.clip();
  const top = ay - 2, x0 = Math.min(a, ax) - 4, w = Math.max(b, bx) - x0 + 8;
  bandedGradient(c, x0, top, w, Math.max(40, GY + 170 - top), [mix(deep[0], haze, 0.12), deep[1], deep[2], deep[3]], 7);
  box(c, x0, GY + 168, w, v.bot - GY, deep[3]);
  for (let y = ay, row = 0; y < ay + 220; row++) { const rh = 9 + row * 2; box(c, ax, y, bx - ax, 1, mix(deep[1], '#000000', row * 0.1)); y += rh; }
  dress(ax, ay, bx);
  hazeBands(c, a - 200, ay + 6, b - a + 400, 30, mix(haze, '#C8C0B0', 0.3), 0, 0.07, 4);
  c.restore();
  wallBack(c, v, a, 1, kind);
  wallBack(c, v, b, -1, kind);
};

export const drawLotHoles = (c: Ctx, v: View) => {
  // MAIN STREET COLLAPSE: dirt, the boardwalk's planks fallen in, a wagon wheel, a stagecoach on its side down there
  holeBack(c, v, X(PIT1.a), X(PIT1.b), 'sink', ['#3A2A1E', '#24180E', '#120A06', '#000000'], (ax, ay, bx) => {
    const plank = (x: number, y: number, w: number, a2: number) => { c.save(); c.translate(x, y); c.rotate(a2); box(c, -w / 2 - 1, -4, w + 2, 8, INK); box(c, -w / 2, -3, w, 6, BOARD[2]); box(c, -w / 2, -3, w, 1, BOARD[4]); box(c, -w / 2 + 6, 0, 10, 1, BOARD[1]); c.restore(); };
    plank(ax + 60, ay + 40, 90, 0.4); plank(bx - 70, ay + 60, 110, -0.5); plank(ax + 160, ay + 110, 70, 0.15); plank(bx - 140, ay + 150, 80, 0.7);
    // (the stagecoach, on its side, its wheel up, turning slowly in the dark)
    const sx = (ax + bx) / 2 + 30, sy = ay + 200;
    box(c, sx - 61, sy - 31, 122, 52, INK); box(c, sx - 60, sy - 30, 120, 50, '#3A1A0E'); box(c, sx - 60, sy - 30, 120, 3, '#5A2E18'); box(c, sx - 40, sy - 20, 30, 20, '#120A06'); box(c, sx + 10, sy - 20, 30, 20, '#120A06');
    c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.arc(sx - 30, sy - 42, 18, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = '#6A4020'; c.lineWidth = 2; c.beginPath(); c.arc(sx - 30, sy - 42, 18, 0, Math.PI * 2);
    for (let k = 0; k < 6; k++) { const an = (k * Math.PI) / 3 + v.f * 0.01; c.moveTo(sx - 30, sy - 42); c.lineTo(sx - 30 + Math.cos(an) * 17, sy - 42 + Math.sin(an) * 17); }
    c.stroke();
  });
  // The foundation pit: poured walls, the forms and their stakes, rebar up out of a footing, a mixer, a puddle
  holeBack(c, v, X(PIT2.a), X(PIT2.b), 'trench', ['#3A3A44', '#22222A', '#101014', '#000000'], (ax, ay, bx) => {
    for (let x = ax + 20; x < bx - 10; x += 34) { box(c, x, ay + 40, 2, 30, '#7A3A1A'); box(c, x, ay + 40, 1, 30, '#A85A2A'); }
    box(c, ax + 10, ay + 68, bx - ax - 20, 6, '#5A5A62'); box(c, ax + 10, ay + 68, bx - ax - 20, 1, '#8A8A92');
    for (let x = ax + 40; x < bx - 40; x += 120) { box(c, x, ay + 10, 40, 30, '#6A4A2A'); box(c, x, ay + 10, 40, 2, '#8A6A3A'); box(c, x + 18, ay + 10, 2, 30, '#4A3018'); }
    const mx = ax + (bx - ax) * 0.68, my = ay + 230;
    c.fillStyle = INK; c.beginPath(); c.ellipse(mx, my, 34, 22, -0.4, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#8A2A1A'; c.beginPath(); c.ellipse(mx, my, 32, 20, -0.4, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#B4442A'; c.beginPath(); c.ellipse(mx - 6, my - 6, 18, 9, -0.4, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 3; k++) box(c, mx - 24 + k * 16, my - 4 + k * 4, 2, 10, '#5A1A0E');
    box(c, ax + 30, ay + 270, 120, 4, 'rgba(90, 120, 150, 0.45)'); box(c, ax + 40, ay + 270, 60, 1, 'rgba(200, 220, 240, 0.4)');
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The play plane: the street under him, stretch by stretch

const paintStreet = (g: Ctx, x0: number, w: number, z: Zone) => {
  const s = Math.floor(x0), A = ASPHALT.map(col => hour(col, 0.1)), C = CONCRETE.map(col => hour(col, 0.1));
  const D = DIRT.map(col => hour(col, 0.1));
  const asphalt = () => {
    bandedGradient(g, x0, GY + 20, w, BAND - 20, [A[5], A[4], A[4], A[3], A[3], A[2]], 8);
    for (let i = 0; i < w * 0.9; i++) { const lx = x0 + hash(s + i * 0.613) * w, ly = GY + 22 + hash(s + i * 1.37) * (BAND - 24); box(g, lx, ly, 1 + (ly - GY) / 120, 1, i % 3 ? A[2] : A[5]); }
    g.strokeStyle = A[0]; g.lineWidth = 1;
    for (let i = 0; i < w / 180; i++) { let cx = x0 + hash(s + i * 4.4) * w, cy = GY + 24 + hash(s + i * 2.2) * 100; g.beginPath(); g.moveTo(cx, cy); for (let k = 0; k < 6; k++) { cx += (hash(s + i * 7 + k) - 0.3) * 18; cy += 2 + hash(s + i * 5 + k) * 6; g.lineTo(cx, cy); } g.stroke(); }
    for (let i = 0; i < w / 300; i++) { const ox = x0 + hash(s + i * 6.6) * w, oy = GY + 50 + hash(s + i * 1.4) * 140; g.fillStyle = 'rgba(8, 6, 12, 0.35)'; g.beginPath(); g.ellipse(ox, oy, 22 + hash(i) * 14, 5 + (oy - GY) / 40, 0, 0, Math.PI * 2); g.fill(); }
  };
  const curb = () => {
    box(g, x0, GY + 12, w, 10, C[2]); box(g, x0, GY + 20, w, 2, C[1]); checker(g, x0, GY + 12, w, 2, C[3], 0);
    box(g, x0, GY, w, 12, C[4]); box(g, x0, GY + 8, w, 4, C[3]); checker(g, x0, GY + 6, w, 2, C[3], 0, 1);
    for (let x = Math.floor(x0 / 100) * 100 + 50; x < x0 + w; x += 100) { box(g, x, GY + 1, 1, 11, C[2]); box(g, x + 1, GY + 3, 1, 9, C[5]); }
  };
  if (z === 'lot') {
    asphalt();
    // (the bulldozer's tracks coming on out toward us (it swung round), cleats in rows; a cable ramp across it)
    for (let x = Math.floor(x0 / 10) * 10; x < x0 + w; x += 10) { const ty = GY + 40 + Math.sin(x * 0.004) * 6; box(g, x, ty, 6, 5, A[1]); box(g, x, ty, 6, 1, A[5]); box(g, x, ty + 26, 6, 5, A[1]); box(g, x, ty + 26, 6, 1, A[5]); }
    for (let cx = Math.floor(x0 / 640) * 640 + 380; cx < x0 + w; cx += 640) { box(g, cx - 1, GY + 12, 22, BAND - 12, INK); box(g, cx, GY + 12, 20, BAND - 12, '#E8B818'); for (let y = GY + 16; y < GY + BAND; y += 16) box(g, cx, y, 20, 8, '#2A2228'); box(g, cx, GY + 12, 4, BAND - 12, '#FFE070'); }
    box(g, x0, GY + 12, w, 8, C[2]); box(g, x0, GY + 12, w, 2, C[4]); box(g, x0, GY, w, 12, C[3]); checker(g, x0, GY + 8, w, 2, C[2], 0, 1);
  } else if (z === 'ny') {
    asphalt();
    // (the old trolley tracks showing through, the cobbles round them; a crosswalk; a manhole; the lane line)
    for (const ty of [GY + 90, GY + 118]) { box(g, x0, ty - 1, w, 5, A[1]); box(g, x0, ty, w, 2, C[4]); box(g, x0, ty, w, 1, C[6]); }
    for (let x = Math.floor(x0 / 10) * 10; x < x0 + w; x += 10) for (let y = GY + 94; y < GY + 116; y += 7) { const t = hash(x * 0.7 + y); box(g, x + ((y / 7) % 2) * 5, y, 8, 5, t > 0.5 ? A[3] : A[4]); box(g, x + ((y / 7) % 2) * 5, y, 8, 1, A[5]); }
    for (let cx = Math.floor(x0 / 800) * 800 + 560; cx < x0 + w; cx += 800) for (let k = 0; k < 6; k++) { const y = GY + 26 + k * 28 + k * k * 2; box(g, cx - 40 - k * 4, y, 80 + k * 8, 8 + k * 2, C[5]); box(g, cx - 40 - k * 4, y, 80 + k * 8, 1, C[6]); }
    for (let mx = Math.floor(x0 / 700) * 700 + 260; mx < x0 + w; mx += 700) { const my = GY + 180; g.fillStyle = INK; g.beginPath(); g.ellipse(mx, my, 32, 11, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = A[4]; g.beginPath(); g.ellipse(mx, my, 30, 10, 0, 0, Math.PI * 2); g.fill(); for (let k = -2; k <= 2; k++) box(g, mx - 22, my + k * 3, 44, 1, A[5]); }
    for (let x = Math.floor(x0 / 60) * 60; x < x0 + w; x += 60) { box(g, x, GY + 220, 30, 4, hour('#D8A020', 0.1)); box(g, x, GY + 220, 30, 1, hour('#F2C850', 0.1)); }
    curb();
  } else if (z === 'apron') {
    bandedGradient(g, x0, GY + 12, w, BAND - 12, [C[5], C[4], C[4], C[3], C[3]], 6);
    for (let x = Math.floor(x0 / 120) * 120; x < x0 + w; x += 120) { box(g, x, GY + 12, 1, BAND, C[2]); box(g, x + 1, GY + 12, 1, BAND, C[5]); }
    for (let y = GY + 60; y < GY + BAND; y += 70 + (y - GY) / 3) box(g, x0, y, w, 1, C[2]);
    for (let i = 0; i < w * 0.5; i++) { const lx = x0 + hash(s + i * 0.71) * w, ly = GY + 14 + hash(s + i * 1.93) * (BAND - 16); box(g, lx, ly, 1, 1, i % 2 ? C[3] : C[5]); }
    // (the hazard stripe round the tank's edge, wet streaks running off toward the drains)
    for (let x = Math.floor(x0 / 20) * 20; x < x0 + w; x += 20) { box(g, x, GY + 14, 10, 6, hour('#E8B818', 0.1)); box(g, x + 10, GY + 14, 10, 6, hour('#2A2228', 0.1)); }
    for (let i = 0; i < w / 160; i++) { const wx = x0 + hash(s + i * 3.1) * w; g.fillStyle = 'rgba(40, 30, 20, 0.2)'; g.fillRect(Math.round(wx), GY + 22, 30, BAND - 22); }
    box(g, x0, GY, w, 12, C[4]); box(g, x0, GY + 9, w, 3, C[2]);
  } else if (z === 'west') {
    // (the dirt: banded, ruts running along it, hoofprints, pebbles, a horse's leavings, a tumbleweed)
    bandedGradient(g, x0, GY + 8, w, BAND - 8, [D[5], D[4], D[4], D[3], D[3], D[2]], 8);
    for (const ry of [GY + 60, GY + 92, GY + 170, GY + 214]) { box(g, x0, ry, w, 6 + (ry - GY) / 40, D[2]); box(g, x0, ry, w, 1, D[1]); box(g, x0, ry + 6 + (ry - GY) / 40, w, 1, D[5]); }
    for (let i = 0; i < w * 0.7; i++) { const lx = x0 + hash(s + i * 0.613) * w, ly = GY + 10 + hash(s + i * 1.37) * (BAND - 12), sc = 1 + (ly - GY) / 100; box(g, lx, ly, sc * (i % 4 === 0 ? 3 : 1), Math.max(1, sc), i % 3 ? D[2] : D[5]); }
    for (let i = 0; i < w / 18; i++) { const hx = x0 + i * 18 + hash(s + i) * 6, hy = GY + 120 + Math.sin(hx * 0.01) * 30, sc = 1 + (hy - GY) / 120; box(g, hx, hy, 5 * sc, 4 * sc, D[1]); box(g, hx + 1, hy, 3 * sc, 1, D[0]); }
    for (let i = 0; i < w / 700; i++) { const px = x0 + 100 + hash(s + i * 9.1) * (w - 200), py = GY + 150 + hash(s + i * 2.7) * 60; for (const [dx, dy, r] of [[0, 0, 5], [7, 1, 4], [3, -4, 4]] as const) { g.fillStyle = INK; g.beginPath(); g.arc(px + dx, py + dy, r + 1, 0, Math.PI * 2); g.fill(); g.fillStyle = '#5A3A1A'; g.beginPath(); g.arc(px + dx, py + dy, r, 0, Math.PI * 2); g.fill(); box(g, px + dx - 2, py + dy - 3, 2, 1, '#8A6A3A'); } }
    // (pebbles, inked, lit on top, bigger nearer; dry grass in tufts along the boardwalk's foot and here and there; a
    // wheel's ruts cut deeper where the stagecoach turned, a dropped horseshoe)
    for (let i = 0; i < w / 14; i++) {
      const px = x0 + hash(s + i * 3.37) * w, py = GY + 14 + hash(s + i * 5.11) * (BAND - 20), r = 1 + (py - GY) / 70 + hash(i + s) * 1.5;
      box(g, px - r - 1, py - r * 0.6, r * 2 + 2, r * 1.3 + 1, D[0]); box(g, px - r, py - r * 0.6, r * 2, r * 1.2, D[3]); box(g, px - r, py - r * 0.6, r * 1.2, Math.max(1, r * 0.4), D[5]);
    }
    for (let i = 0; i < w / 40; i++) {
      const tx = x0 + hash(s + i * 7.9) * w, ty = i % 3 ? GY + 12 + hash(s + i) * 6 : GY + 30 + hash(s + i * 2.2) * 150, n = 4 + (i % 3);
      for (let k = 0; k < n; k++) { const lx = tx + k * 2 - n, hh = 3 + ((k * 5 + i) % 4) * 2 + (ty - GY) / 50; box(g, lx, ty - hh, 1, hh, k % 2 ? hour('#A89048', 0.1) : hour('#C8B060', 0.1)); }
    }
    for (let cx = Math.floor(x0 / 1100) * 1100 + 640; cx < x0 + w; cx += 1100) { const hy = GY + 130; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.ellipse(cx, hy, 8, 4, 0, Math.PI * 0.2, Math.PI * 0.8, true); g.stroke(); g.strokeStyle = '#8A8A92'; g.lineWidth = 2; g.stroke(); box(g, cx - 4, hy - 7, 2, 1, '#D8D8E0'); }
    box(g, x0, GY, w, 8, D[3]); checker(g, x0, GY + 6, w, 2, D[2], 0, 1);
  } else if (z === 'burb') {
    asphalt();
    // (chalk on the street: a hopscotch, a sun; skid marks; the storm drain in the curb)
    for (let cx = Math.floor(x0 / 900) * 900 + 300; cx < x0 + w; cx += 900) {
      for (let k = 0; k < 6; k++) { const bx = cx + k * 28, by = GY + 60 + (k % 2) * 4; g.strokeStyle = 'rgba(240, 236, 228, 0.7)'; g.lineWidth = 2; g.strokeRect(bx, by, 26, 22); signText(g, String(k + 1), bx + 13, by + 16, plain(1, 1, 'rgba(240,236,228,0.8)')); }
      g.strokeStyle = 'rgba(250, 210, 80, 0.7)'; g.lineWidth = 2; g.beginPath(); g.arc(cx + 230, GY + 80, 14, 0, Math.PI * 2); g.stroke(); for (let k = 0; k < 8; k++) { const an = (k * Math.PI) / 4; g.beginPath(); g.moveTo(cx + 230 + Math.cos(an) * 18, GY + 80 + Math.sin(an) * 18); g.lineTo(cx + 230 + Math.cos(an) * 26, GY + 80 + Math.sin(an) * 26); g.stroke(); }
    }
    for (let i = 0; i < w / 500; i++) { const sx = x0 + hash(s + i * 4.1) * w; box(g, sx, GY + 150, 140, 4, A[1]); box(g, sx + 10, GY + 166, 130, 4, A[1]); }
    curb();
    for (let gx = Math.floor(x0 / 600) * 600 + 200; gx < x0 + w; gx += 600) { box(g, gx - 1, GY + 2, 42, 9, INK); for (let k = 0; k < 8; k++) box(g, gx + 1 + k * 5, GY + 3, 3, 7, C[1]); }
  } else {
    // (the plaza's pavers coming on toward us)
    const P = ['#5A2A1A', '#7A3A22', '#9A4E2E', '#B4643E', '#C87C52'].map(col => hour(col, 0.1));
    for (let y = GY + 8, r = 0; y < GY + BAND; r++) { const rh = 8 + r * 2; for (let x = Math.floor(x0 / 30) * 30 - (r % 2) * 15; x < x0 + w; x += 30) { const t = hash(x * 0.3 + r * 7.1); box(g, x, y, 29, rh - 1, P[t > 0.7 ? 3 : t > 0.3 ? 2 : 1]); box(g, x, y, 29, 1, P[4]); } y += rh; }
    box(g, x0, GY, w, 8, C[4]); box(g, x0, GY + 6, w, 2, C[2]);
  }
  // (the edge he walks along: lit)
  box(g, x0, GY, w, 3, LIP[2]); box(g, x0, GY, w, 1, LIP[3]);
  box(g, x0, GY + 3, w, 1, INK);
};

const PITS: [number, number, 'sink' | 'trench'][] = [[X(PIT1.a), X(PIT1.b), 'sink'], [X(PIT2.a), X(PIT2.b), 'trench'], [X(TANK.a), X(TANK.b), 'trench']];

export const drawLotStreet = (c: Ctx, v: View) => {
  const CH = 512, tod = timeOfDay();
  for (const [fa, fb] of FLOOR) {
    for (const [za, zb, z] of ZONES) {
      const a = Math.max(fa, X(za)), b = Math.min(fb, X(zb));
      for (let x = a, i = 0; x < b; x += CH, i++) {
        const w = Math.min(CH, b - x);
        if (x + w < v.v0 || x > v.v1) continue;
        stamp(c, `hl-street-${tod.key}-${z}-${a}-${i}`, x, GY - 2, w, BAND + 2, g => paintStreet(g, x, w, z));
      }
    }
    if (fb > v.v0 && fa < v.v1 && v.bot > GY + BAND) box(c, Math.max(fa, v.v0), GY + BAND - 1, Math.min(fb, v.v1) - Math.max(fa, v.v0), v.bot - GY - BAND + 1, hour(ASPHALT[2], 0.1));
    if (fb > v.v0 && fa < v.v1) bendFloor(c, v.eye, GY, GY, GY + BAND, fa, fb);
  }
  for (const [a, b, kind] of PITS) {
    if (b < v.v0 - 100 || a > v.v1 + 100) continue;
    nearBank(c, v, a, 1, kind); nearBank(c, v, b, -1, kind);
    for (const [ex, s] of [[a, 1], [b, -1]] as const) {
      poly(c, [[ex, GY], [ex + s * 22, GY], [ex + s * 12, GY + 7], [ex + s * 24, GY + 12], [ex + s * 6, GY + 20], [ex, GY + 16]], INK);
      poly(c, [[ex, GY + 1], [ex + s * 20, GY + 1], [ex + s * 10, GY + 7], [ex + s * 21, GY + 11], [ex + s * 5, GY + 18], [ex, GY + 14]], CONCRETE[3]);
      box(c, Math.min(ex, ex + s * 18), GY + 1, 18, 2, LIP[2]);
    }
  }
  void W;
};
