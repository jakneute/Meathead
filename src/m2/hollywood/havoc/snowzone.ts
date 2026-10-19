// The blizzard down the hill, the detail (the user's: "make the snowy avalanche zone parts look more detailed"). Drawing
// only: every collision, cover, timing and hit area is chase.ts's and layout.ts's, untouched.
//
//   THE HILLSIDE    drift ridges across it going back (a lit crest, a dithered blue shadow under each), the bands'
//                   edges dithered into each other, wind-scoured crust (sastrugi: short lit streaks, shade under).
//   BURIED THINGS   poking out of the hillside, frosted (scenery: dimmed, so none of it reads as somewhere to stand):
//                   a car to its windows (ticket on the windshield, the antenna's pennant), a parking meter (EXPIRED),
//                   a fake Christmas tree (too-regular tiers, ornaments, tinsel, its star askew), the park's plywood
//                   SKI CHALET (a facade: its 2x4 bracing showing round the side, snow loaded on its eaves, icicles).
//   THE ROAD        wind-sculpted drifts along its far edge; its near edge a cross-section of the snowpack (layers
//                   banded blue-white over a seam of ice, dithered into the rock), icicles stepped and tapering off it
//                   (lit down one side, a drip off the tip); frost twinkling over the lit lip (never on it).
//   THE BLOWING     snow at three depths going by at their own speeds (parallax): fine and hazy far back, veils
//                   driven across the hillside, big wet clumps in front of everything; frost rimed in the bottom
//                   corners of the view, frosted fir tips at the very front.
//   THE BUNKERS     read as cover: TAKE COVER on a plate hung in the mouth, icicles off the slab's front, frost on
//                   the posts, drifts heaped against their outsides, the bulb's warm light pooled on the floor.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { X, R, DOWNHILL } from './layout';
import { type Ctx, type View, INK, box, poly, mix, hash, at, atDepth, signText, plain, still, dimmed, PLY, STEEL, SNOW, ROCK } from './paint';
import { gate } from '../../hub/letters';

/** Ice (icicles, the snowpack's seam), darkest first. */
export const ICICLE = ['#5E7C9E', '#7C9CC0', '#A6C4E0', '#CFE2F2', '#F2F8FF'];
const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
const mod = (a: number, m: number) => ((a % m) + m) % m;

/** How deep into the blizzard the view is (0 off the hill, 1 on it; eased in and out at its ends). */
export const blizzardOf = (state: GameState) => {
  const rx = R(state.camera.x + W / 2);
  return Math.max(0, Math.min(1, (rx - (DOWNHILL.a - 300)) / 300, (DOWNHILL.b + 300 - rx) / 300));
};

// ---------------------------------------------------------------------------------------------------------------
// The hillside

/** Drift ridges across the hillside going back, the bands' edges dithered, wind-scoured crust. `top(rx, d)`: the
 *  hillside's world y at rx, depth d. `x0..x1`: what of it's in view (world, at the play plane). */
export const hillDetail = (c: Ctx, v: View, x0: number, x1: number, d0: number, d1: number, top: (rx: number, d: number) => number, Sn: string[]) => {
  const eye = v.eye;
  /** What's in view at depth d (world x at the play plane), on a step. */
  const span = (d: number, step: number): [number, number] => [Math.floor(Math.max(x0, eye.x + (v.v0 - eye.x) / d) / step) * step, Math.min(x1, eye.x + (v.v1 - eye.x) / d)];
  // (the bands' edges, dithered into each other: the lighter one's pixels down into the darker)
  for (const [d, col] of [[d0 - (d0 - d1) * 0.4, Sn[4]], [d0 - (d0 - d1) * 0.8, Sn[5]]] as const) {
    const [a, b] = span(d, 4);
    for (let x = a, k = 0; x < b; x += 4, k++) {
      const [px, py] = at(eye, x, top(R(x), d), d);
      box(c, px, py + (k % 2) * 2, 2, 2, col);
    }
  }
  // (drift ridges: a lit crest, the shadow dithered under it, undulating)
  for (let i = 0; i < 5; i++) {
    const d = d0 - 0.012 - (d0 - d1 - 0.03) * (i / 4.4), [a, b] = span(d, 6);
    for (let x = a, k = 0; x < b; x += 6, k++) {
      const wob = Math.sin(x * 0.011 + i * 2.1) * 4 + Math.sin(x * 0.037 + i) * 1.5;
      const [px, py] = at(eye, x, top(R(x), d) + wob, d);
      box(c, px, py, 6, 1, Sn[5]);
      box(c, px + (k % 2) * 3, py + 2 + (k % 2), 3, 1, Sn[2]);
    }
  }
  // (sastrugi: the wind's scoured streaks in the crust)
  for (let rx = Math.floor(R(x0) / 29) * 29; rx < R(x1); rx += 29) {
    const h1 = hash(rx * 0.31);
    if (h1 < 0.35) continue;
    const d = d1 + 0.01 + hash(rx * 0.77) * (d0 - d1 - 0.02), x = X(rx);
    const [px, py] = at(eye, x, top(rx, d) + 4 + hash(rx) * 8, d), l = Math.round((8 + h1 * 22) * d);
    box(c, px, py, l, 1, Sn[5]); box(c, px + 2, py + 1, l - 3, 1, Sn[2]);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Buried things (stills: painted once for the hour; scenery, dimmed)

export type Buried = 'car' | 'meter' | 'tree' | 'chalet';
/** Poking out of the hillside: [rx, depth, what]. */
export const BURIED: [number, number, Buried][] = [
  [8790, 0.905, 'car'], [9070, 0.93, 'meter'], [9930, 0.87, 'chalet'], [10180, 0.925, 'tree'], [10830, 0.915, 'meter'],
  [11720, 0.885, 'car'], [12020, 0.925, 'tree'], [12960, 0.86, 'chalet'], [13260, 0.93, 'meter'], [13980, 0.9, 'tree'],
];
/** Its box (local, about its foot in the snow). */
export const BURIED_BOX: Record<Buried, [number, number, number, number]> = {
  car: [-56, -54, 112, 58], meter: [-18, -52, 36, 56], tree: [-38, -100, 76, 104], chalet: [-78, -128, 156, 132],
};

/** Snow heaped over something's foot, banded, its lit top lumpy (local, at y 0). */
const heap = (g: Ctx, x0: number, x1: number, h: number, seed: number) => {
  const S = SNOW.map(dimmed);
  for (let x = x0; x < x1; x += 4) {
    const u = (x - x0) / (x1 - x0), hh = h * Math.sin(Math.PI * u) * (0.8 + hash(seed + x * 0.1) * 0.3) + 2;
    box(g, x, -hh, 4, hh + 2, S[3]); box(g, x, -hh, 4, 2, S[5]); if (u > 0.55) box(g, x, -hh + 2, 4, 2, S[2]);
  }
};
/** Icicles off an edge (local), stepped and tapering. */
const iciclesOff = (g: Ctx, x0: number, x1: number, y: number, seed: number, dim = true) => {
  const I = dim ? ICICLE.map(dimmed) : ICICLE;
  for (let x = x0; x < x1; x += 5) {
    const l = 3 + Math.floor(hash(seed + x * 0.7) * 9);
    box(g, x, y, 3, Math.ceil(l * 0.5), I[2]); box(g, x + 1, y + Math.ceil(l * 0.5), 1, Math.floor(l * 0.5), I[2]); box(g, x, y, 1, Math.ceil(l * 0.5), I[4]);
  }
};

const paintCar = (g: Ctx) => {
  const B = ['#3A1418', '#5E1E24', '#8A2C30', '#B23C3C', '#D86A60'].map(dimmed), G = ['#1E2A3A', '#33465C', '#56708C', '#9AB4CC'].map(dimmed), S = SNOW.map(dimmed);
  // (the roof and its pillars over the snow, the glass)
  poly(g, [[-46, 0], [-36, -34], [30, -34], [44, 0]], INK);
  poly(g, [[-44, 0], [-35, -32], [29, -32], [42, 0]], B[2]);
  poly(g, [[-38, -2], [-31, -27], [-4, -27], [-4, -2]], G[1]); poly(g, [[0, -2], [0, -27], [25, -27], [36, -2]], G[1]);
  poly(g, [[-36, -4], [-31, -24], [-24, -24], [-30, -4]], G[3]); poly(g, [[4, -6], [4, -24], [9, -24], [9, -6]], G[2]);
  box(g, -35, -33, 64, 2, B[4]); box(g, -4, -28, 4, 28, B[1]);
  // (the ticket under the wiper; the side mirror; the antenna and its pennant)
  box(g, 12, -10, 8, 5, '#F8FAFC'); box(g, 13, -9, 6, 1, '#DC2626');
  box(g, 42, -12, 6, 4, INK); box(g, 43, -11, 4, 2, B[3]);
  box(g, -30, -52, 1, 20, STEEL.map(dimmed)[4]); poly(g, [[-29, -52], [-16, -48], [-29, -44]], dimmed('#FACC15'));
  // (the snow loaded on the roof, frosted glass, the drift up its sides)
  poly(g, [[-38, -32], [-30, -40], [-8, -42], [18, -40], [31, -32]], S[4]); box(g, -28, -40, 40, 2, S[5]);
  iciclesOff(g, -34, 30, -31, 3);
  for (let k = 0; k < 9; k++) box(g, -34 + hash(k + 2) * 64, -26 + hash(k + 9) * 20, 2, 2, S[5]);
  heap(g, -56, 56, 14, 11);
};
const paintMeter = (g: Ctx) => {
  const St = STEEL.map(dimmed), S = SNOW.map(dimmed);
  box(g, -3, -30, 6, 30, INK); box(g, -2, -30, 4, 30, St[3]); box(g, -2, -30, 1, 30, St[5]);
  // (the head: its dome, the dial's window, EXPIRED up in red)
  box(g, -10, -48, 20, 20, INK); box(g, -9, -47, 18, 18, St[2]); box(g, -9, -47, 18, 4, St[4]);
  box(g, -6, -42, 12, 8, '#0E1418'); box(g, -5, -41, 10, 6, dimmed('#E8E0C8')); box(g, -5, -41, 10, 3, dimmed('#DC2626'));
  box(g, -1, -32, 2, 3, INK);
  // (the snow capping it, an icicle, the drift)
  poly(g, [[-12, -47], [-8, -52], [6, -53], [12, -47]], S[5]); iciclesOff(g, -9, 9, -29, 7);
  heap(g, -18, 18, 12, 4);
};
const paintTree = (g: Ctx) => {
  const G = ['#0C2418', '#14382A', '#1E4E3A', '#2E6A4E'].map(dimmed), S = SNOW.map(dimmed);
  // (a plastic one, its tiers too even, buried to its lower boughs)
  for (let k = 0; k < 4; k++) {
    const y = -8 - k * 20, hw = 32 - k * 7;
    poly(g, [[-hw - 1, y + 1], [0, y - 26], [hw + 1, y + 1]], INK);
    poly(g, [[-hw, y], [0, y - 25], [hw, y]], G[2]); poly(g, [[-hw, y], [0, y - 25], [-hw * 0.3, y]], G[3]);
    for (let x = -hw + 3; x < hw - 2; x += 6) box(g, x, y - 2, 3, 3, G[1]);
    // (snow along the tier, the tinsel garland swagged across, ornaments)
    poly(g, [[-hw * 0.9, y - 2], [0, y - 25], [hw * 0.4, y - 5]], S[4]);
    for (let x = -hw + 4; x < hw - 4; x += 3) box(g, x, y - 9 + Math.round(Math.sin((x + k * 5) * 0.25) * 2), 2, 1, dimmed('#E5E7EB'));
    for (let j = 0; j < 3; j++) { const ox = -hw * 0.6 + j * hw * 0.6, col = dimmed(['#DC2626', '#FACC15', '#3B82F6'][(j + k) % 3]); box(g, ox - 2, y - 5, 4, 4, INK); box(g, ox - 1, y - 4, 2, 2, col); }
  }
  // (the star, askew)
  g.save(); g.translate(2, -92); g.rotate(0.35); poly(g, [[0, -7], [2, -2], [7, -2], [3, 1], [5, 6], [0, 3], [-5, 6], [-3, 1], [-7, -2], [-2, -2]], dimmed('#FACC15')); g.restore();
  heap(g, -38, 38, 12, 8);
};
const paintChalet = (g: Ctx) => {
  const P = PLY.map(dimmed), S = SNOW.map(dimmed);
  // (round the side: the 2x4s bracing it up: it's a facade)
  for (const [x0, y0, x1, y1] of [[40, -8, 64, -70], [52, -8, 64, -40], [36, -60, 66, -70]] as const) { g.strokeStyle = P[1]; g.lineWidth = 4; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = P[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y0 - 1); g.lineTo(x1, y1 - 1); g.stroke(); }
  // (the face: an A-frame in painted plywood, timbers painted on, windows painted on, buried to its sills)
  poly(g, [[-58, 0], [-58, -60], [0, -112], [58, -60], [58, 0]], INK);
  poly(g, [[-56, 0], [-56, -59], [0, -109], [56, -59], [56, 0]], P[3]);
  for (let x = -50; x < 56; x += 12) box(g, x, -58, 1, 58, P[2]);
  box(g, -56, -62, 112, 4, P[1]); poly(g, [[-4, -104], [4, -104], [4, -62], [-4, -62]], P[1]);
  for (const wx of [-40, 18]) { box(g, wx - 1, -46, 24, 22, INK); box(g, wx, -45, 22, 20, dimmed('#2A3A4A')); box(g, wx, -45, 22, 2, dimmed('#5A7088')); box(g, wx + 10, -45, 2, 20, P[1]); box(g, wx, -36, 22, 2, P[1]); }
  signText(g, 'SKI CHALET', 0, -76, gate({ sx: 1, sy: 1 }, dimmed('#F8FAFC'), dimmed('#7F1D1D')));
  // (the eaves loaded with snow, overhanging, icicles under; frost up the face)
  poly(g, [[-66, -56], [0, -118], [66, -56], [60, -50], [0, -110], [-60, -50]], S[4]);
  poly(g, [[-66, -56], [0, -118], [0, -114], [-62, -54]], S[5]);
  iciclesOff(g, -60, -6, -52, 21); iciclesOff(g, 6, 60, -52, 31);
  for (let k = 0; k < 16; k++) box(g, -54 + hash(k + 40) * 108, -50 + hash(k + 60) * 46, 2, 1, S[5]);
  heap(g, -78, 78, 22, 17);
};
export const paintBuried = (g: Ctx, what: Buried) => {
  if (what === 'car') paintCar(g); else if (what === 'meter') paintMeter(g); else if (what === 'tree') paintTree(g); else paintChalet(g);
};

// ---------------------------------------------------------------------------------------------------------------
// The road

/** Wind-sculpted drifts along the road's far edge (at depth d), its run from (xa, ya) to (xb, yb). */
export const farDrifts = (c: Ctx, v: View, xa: number, ya: number, xb: number, yb: number, d: number) => {
  const eye = v.eye, a = Math.max(xa, v.v0 - 40), b = Math.min(xb, v.v1 + 40);
  for (let x = Math.floor(a / 6) * 6; x < b; x += 6) {
    const y = ya + ((yb - ya) * (x - xa)) / (xb - xa), u = x * 0.017;
    const hh = 6 + Math.sin(u) * 4 + Math.sin(u * 2.7 + 1) * 3 + hash(Math.floor(x / 60)) * 4;
    const [px, py] = at(eye, x, y, d), w = Math.ceil(6 * d) + 1, hd = hh * d;
    box(c, px, py - hd, w, hd + 1, SNOW[4]);
    // (the crest lit on its windward side, the lee in shade)
    const lee = Math.cos(u) + Math.cos(u * 2.7 + 1) * 0.6 < 0;
    box(c, px, py - hd, w, 2, lee ? SNOW[4] : SNOW[5]);
    if (lee) box(c, px, py - hd + 2, w, Math.max(1, hd * 0.5), SNOW[3]);
  }
};

/** The road's near edge in cross-section (the snowpack's layers over a seam of ice, dithered into the rock), the
 *  icicles off it, frost twinkling over the lit lip (drawn before the lip; the twinkles after it, with `glints`). */
export const snowpack = (c: Ctx, xa: number, ya: number, xb: number, yb: number, f: number) => {
  const band = (o1: number, o2: number, col: string) => poly(c, [[xa, ya + o1], [xb, yb + o1], [xb, yb + o2], [xa, ya + o2]], col);
  band(0, 7, SNOW[5]); band(5, 10, SNOW[4]); band(10, 15, SNOW[3]); band(15, 18, ICICLE[1]); band(18, 19, ICICLE[0]); band(19, 23, SNOW[2]);
  // (the layers' seams, and the bottom one dithered into the rock under it)
  for (let x = Math.ceil(xa / 4) * 4, k = 0; x < xb; x += 4, k++) {
    const y = ya + ((yb - ya) * (x - xa)) / (xb - xa);
    if (k % 3 === 0) box(c, x, y + 9, 3, 1, SNOW[3]);
    box(c, x, y + 23 + (k % 2) * 2, 2, 2, SNOW[2]);
    if (k % 5 === 2) box(c, x + 1, y + 16, 2, 1, ICICLE[4]);
  }
  // (icicles: stepped and tapering, lit down the left, a drip off the tip now and then)
  for (let x = Math.ceil(xa / 11) * 11; x < xb - 4; x += 11) {
    const hh = hash(x * 0.913);
    if (hh < 0.18) continue;
    const y = ya + ((yb - ya) * (x - xa)) / (xb - xa) + 19, l = 6 + Math.floor(hh * 18);
    const s1 = Math.ceil(l * 0.35), s2 = Math.ceil(l * 0.35), s3 = l - s1 - s2;
    box(c, x - 1, y, 6, s1, INK); box(c, x, y, 4, s1, ICICLE[2]); box(c, x, y, 1, s1, ICICLE[4]); box(c, x + 3, y, 1, s1, ICICLE[1]);
    box(c, x, y + s1, 4, s2 + 1, INK); box(c, x + 1, y + s1, 2, s2, ICICLE[2]); box(c, x + 1, y + s1, 1, s2, ICICLE[4]);
    box(c, x + 1, y + s1 + s2, 2, s3 + 1, INK); box(c, x + 1, y + s1 + s2, 1, s3, ICICLE[3]);
    const dt = mod(f + hh * 97, 70);
    if (dt < 14) box(c, x + 1, y + l + 1 + dt, 1, 2, ICICLE[4]);
  }
};
/** Frost twinkling just over the road's lit lip (never on it). */
export const glints = (c: Ctx, xa: number, ya: number, xb: number, yb: number, f: number) => {
  for (let x = Math.ceil(xa / 23) * 23; x < xb; x += 23) {
    const hh = hash(x * 0.57);
    if (mod((f >> 3) + Math.floor(hh * 9), 9) !== 0) continue;
    const y = ya + ((yb - ya) * (x - xa)) / (xb - xa) - 4;
    box(c, x - 2, y, 5, 1, '#FFFFFF'); box(c, x, y - 2, 1, 5, '#FFFFFF');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The bunkers, as cover (round chase.ts's slab and posts, drawing only)

/** In front of the bunker's back wall (before its posts and slab): the bulb's light pooled on the floor, TAKE COVER on
 *  its plate hung in the mouth. */
export const bunkerMouth = (c: Ctx, v: View, L: number, Rr: number, under: number, floorY: number, f: number, on: boolean) => {
  const mx = (L + Rr) / 2;
  if (on) for (const [w, a] of [[150, 0.1], [100, 0.12], [56, 0.14]] as const) box(c, mx - w / 2, floorY - 3, w, 3, `rgba(253, 230, 138, ${a})`);
  atDepth(c, v.eye, 0.975, () => {
    const sway = Math.round(Math.sin(f * 0.05) * 1);
    for (const cx of [mx - 24, mx + 24]) { box(c, cx, under, 1, 9, '#3F3F46'); box(c, cx + 1, under + 2, 1, 2, '#71717A'); }
    box(c, mx - 37 + sway, under + 9, 74, 16, INK); box(c, mx - 36 + sway, under + 10, 72, 14, '#FACC15'); box(c, mx - 36 + sway, under + 10, 72, 2, '#FEF08A');
    signText(c, 'TAKE COVER', mx + sway, under + 17, plain(1, 1, '#18181B'));
    box(c, mx - 34 + sway, under + 10, 30, 1, '#FFFFFF');
  });
};
/** Over the bunker's front: icicles off the slab, frost up the posts, drifts heaped against its outsides. */
export const bunkerFrost = (c: Ctx, rx: number, ry: number, rw: number, rh: number, under: number, floorY: number, f: number) => {
  iciclesOff(c, rx + 2, rx + rw - 2, ry + rh, Math.round(rx), false);
  for (const px of [rx, rx + rw - 10]) for (let k = 0; k < 7; k++) box(c, px + 1 + hash(px + k) * 8, under + 6 + hash(px * 2 + k) * (floorY - under - 12), 2, 1, ICICLE[4]);
  // (the drifts against its outsides)
  for (const [x0, dir] of [[rx - 2, -1], [rx + rw + 2, 1]] as const) {
    for (let i = 0; i < 7; i++) {
      const x = x0 + dir * i * 5, hh = 13 - i * 1.7 + Math.sin(i + rx);
      box(c, dir < 0 ? x - 5 : x, floorY - hh, 5, hh, SNOW[4]); box(c, dir < 0 ? x - 5 : x, floorY - hh, 5, 2, SNOW[5]);
      if (dir > 0) box(c, x, floorY - hh + 2, 5, 3, SNOW[3]);
    }
  }
  void f;
};

// ---------------------------------------------------------------------------------------------------------------
// The blowing snow (parallax: each layer at its own depth goes by at its own speed), the frost in front

/** A layer of snow going by at depth d (`n` flakes, `s` their size): world space, wrapped to the real view. */
const flakes = (c: Ctx, state: GameState, d: number, n: number, s: number, spd: number, fall: number, cols: string[], seed: number) => {
  const cam = state.camera, f = state.frame;
  for (let k = 0; k < n; k++) {
    const sx = mod(k * 137 + seed + f * (spd + (k % 3) * 0.6) - cam.x * d + Math.sin(f * 0.03 + k) * 10, W + 80) - 40;
    const sy = mod(k * 211 + seed * 3 + f * (fall + (k % 2) * 0.5) - cam.y * d, H + 80) - 40;
    const sz = s + (k % 4 === 0 ? 1 : 0);
    box(c, cam.x + sx, cam.y + sy, sz, sz, cols[k % cols.length]);
    if (s >= 3 && k % 2 === 0) box(c, cam.x + sx + sz, cam.y + sy + 1, Math.ceil(sz / 2), Math.ceil(sz / 2), cols[(k + 1) % cols.length]);
  }
};
/** Veils of snow driven across (banded: a stack of thin translucent rows), at depth d. */
const veils = (c: Ctx, state: GameState, d: number, a: number, seed: number) => {
  const cam = state.camera, f = state.frame;
  for (let j = 0; j < 3; j++) {
    const len = 260 + j * 90, sx = mod(seed + j * 377 + f * (6 + j) - cam.x * d, W + len + 200) - len - 100;
    const sy = mod(seed * 2 + j * 173 - cam.y * d * 0.6, H - 120) + 40;
    for (let r = 0; r < 4; r++) { c.fillStyle = `rgba(240, 246, 255, ${(a * (1 - r / 4)).toFixed(3)})`; c.fillRect(Math.round(cam.x + sx + r * 22), Math.round(cam.y + sy + r * 5 - 10), Math.round(len - r * 44), 5); }
  }
};
/** The blowing snow far back over the hillside (fine, hazy) and its veils. */
export const blowFar = (c: Ctx, state: GameState) => {
  const k = blizzardOf(state);
  if (k <= 0) return;
  c.save(); c.globalAlpha = k;
  veils(c, state, 0.84, 0.1, 41);
  flakes(c, state, 0.84, 50, 1, 3.2, 1.6, ['#E2E8F0', '#CBD5E1'], 7);
  c.restore();
};
/** Nearer, over the road (between him and the hillside). */
export const blowMid = (c: Ctx, state: GameState) => {
  const k = blizzardOf(state);
  if (k <= 0) return;
  c.save(); c.globalAlpha = k;
  flakes(c, state, 0.97, 36, 2, 4.6, 2.2, ['#F8FAFC', '#DCE6F2', '#F8FAFC'], 19);
  c.restore();
};
/** In front of everything: big wet clumps going by fast, a veil now and then, frosted fir tips at the very front, rime
 *  in the bottom corners of the view. */
export const blowNear = (c: Ctx, state: GameState) => {
  const k = blizzardOf(state);
  if (k <= 0) return;
  const cam = state.camera, f = state.frame;
  c.save(); c.globalAlpha = k;
  flakes(c, state, 1.2, 12, 4, 8, 3, ['#FFFFFF', '#DCE6F2', '#B6C6DE'], 61);
  veils(c, state, 1.25, 0.06, 97);
  // (fir tips poking up at the very front, frosted, dark with the near haze)
  const d = 1.22, eye = { x: cam.x + W / 2 }, sp = 640;
  const wx0 = eye.x + (cam.x - 120 - eye.x) / d, wx1 = eye.x + (cam.x + W + 120 - eye.x) / d;
  for (let wx = Math.floor(wx0 / sp) * sp; wx < wx1; wx += sp) {
    const hh = hash(wx * 0.0031);
    if (hh < 0.4) continue;
    const sx = eye.x + (wx + hh * 200 - eye.x) * d, base = cam.y + H + 6, th = 40 + hh * 40;
    for (let t = 0; t < 3; t++) {
      const y = base - t * (th / 3), hw = 26 - t * 7;
      poly(c, [[sx - hw, y], [sx, y - th / 2.4], [sx + hw, y]], '#0A1210');
      poly(c, [[sx - hw * 0.8, y - 3], [sx, y - th / 2.4], [sx + hw * 0.3, y - 5]], '#C8D4E4');
      box(c, sx - hw * 0.6, y - 4, hw * 0.8, 2, '#F6FAFF');
    }
  }
  // (rime in the bottom corners)
  for (const side of [-1, 1] as const) {
    const x = side < 0 ? cam.x : cam.x + W;
    still(c, `hh-rime-${side}`, x, cam.y + H, side < 0 ? 0 : -110, -80, 110, 80, g => paintRime(g, side));
  }
  c.restore();
  void f;
};
/** Frost crystals grown in from a bottom corner (local: the corner at 0, 0; growing up and in). */
const paintRime = (g: Ctx, side: 1 | -1) => {
  const s = -side;
  const branch = (x: number, y: number, a: number, l: number, depth: number) => {
    let px = x, py = y;
    for (let i = 0; i < l; i += 3) {
      px += Math.cos(a) * 3; py += Math.sin(a) * 3;
      g.fillStyle = `rgba(226, 238, 252, ${(0.5 - i / (l * 2.4)).toFixed(3)})`; g.fillRect(Math.round(px), Math.round(py), 2, 2);
      if (depth > 0 && i % 9 === 6) { branch(px, py, a - 0.9, l * 0.4, depth - 1); branch(px, py, a + 0.9, l * 0.4, depth - 1); }
    }
  };
  for (let k = 0; k < 6; k++) branch(0, -2 - k * 4, -Math.PI / 2 + s * (0.25 + k * 0.22), 36 + (k % 3) * 18, 2);
  for (let y = -40; y < 0; y += 4) for (let x = 0; x < 30 + y * 0.6 + 30; x += 4) if (((x + y) >> 2) % 2 === 0) { g.fillStyle = 'rgba(226, 238, 252, 0.16)'; g.fillRect(s > 0 ? x : -x - 2, y, 2, 2); }
};

void ROCK; void mix;
