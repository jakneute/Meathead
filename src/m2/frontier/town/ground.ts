// Sawdust Gulch's ground and water, in fake 3D (the wilds' way, one eye for the scene):
//
//   going back (behind him, from the play plane back to FAR): the street's dirt banded darker and hazier the further,
//     its wagon ruts running along at their depths, hoofprints, straw, the odd thing a guest dropped; the mill's
//     sawdust and chips; the queue's stamped concrete (scored and stained brown to pass for boards and dirt: the park);
//     the mill pond's surface going back to its far bank (a timber crib wall, pilings, reeds, lily pads), the island's
//     top;
//   coming toward him (the floor under his feet, bent the SNES way so it fans out as he goes by): the street's packed
//     dirt with its ruts and hoofprints and straw, a popcorn box, a horseshoe; the mill's sawdust, chips and bark; the
//     queue's concrete with its gum; the earth under it; the lip along the line lit (he stands on it);
//   the near banks where the floor stops (down to the pond, down the mine's shafts), the island's face;
//   the water's body at the play plane (banded, caustics, the bed's silt and what's sunk in it: logs and a rusted saw
//   blade in the pond; ore carts, timbers and a lantern in the flooded shaft), its steps out (lit lips), and over
//   whoever's in it the water's front.

import type { GameState } from '../../../m1/game/core/state';
import { GY } from '../geometry';
import { bendFloor, BEND } from '../../intro/art/kit';
import { type Ctx, type TownView, box, checker, mix, hash, PIX, at, poly, stamp, bandedGradient, hazeBands, pixelBlob, atDepth, INK, timeOfDay, farTint, skyAt, FAR, MINE_BK, STREET, SAWDUST, CONC, STONE, GRASS, DIRT, PLANK, POND, SUMP, TOPLIP, BRASS, STEEL, BARK, TIMBER } from './paint';
import { GROUND, WATERS, SHAFTS, X, Y, type Water } from './layout';
import { onScreen, viewOf } from './view';

/** How far toward him the floor comes (bent), the earth under it. */
export const BAND = 160;
const SOIL = 420;

type Zone = 'street' | 'mill' | 'queue';
/** The ground he walks at the ground line (not the beds, not the mine's): world x, its zone. */
interface Run { a: number; b: number; rx: number; zone: Zone }
const RUNS: Run[] = GROUND.filter(([, , h1, h2]) => h1 === 0 && h2 === 0).map(([a, b]) => ({ a: X(a), b: X(b), rx: a, zone: a >= 14000 ? 'queue' : a >= 9000 ? 'mill' : 'street' }));
/** The island in pond B's middle (the feller's): world x, its top. */
const ISLE = { a: X(8800), b: X(8900), top: Y(20) };
/** How far back the island goes (the pond carries on behind it). */
const ISLE_D = 0.82;

const zoneR = (z: Zone) => (z === 'mill' ? SAWDUST : z === 'queue' ? CONC : STREET);
/** Ramps for the hour, made once per hour. */
const MEMO = new Map<string, string[]>();
const memo = (name: string, make: () => string[]) => { const key = `${name}-${timeOfDay().key}`; let r = MEMO.get(key); if (!r) { r = make(); MEMO.set(key, r); } return r; };
const nr = (name: string, R: string[], k = 0.2) => memo(name, () => { const tod = timeOfDay(); return R.map(c => farTint(c, k, tod)); });

// ---------------------------------------------------------------------------------------------------------------
// Going back

/** The far bank of the pond (a tile: a timber crib wall, the bank's grass over it, pilings, reeds, cattails). */
const paintFarBank = (g: Ctx) => {
  const tod = timeOfDay(), haze = skyAt(0.9, tod), T = (c: string) => mix(farTint(c, 0.7, tod), haze, 0.18);
  const G = GRASS.map(T), Tm = TIMBER.map(T), D = DIRT.map(T);
  // (the crib wall: squared timbers laid along, their ends showing, wet and dark at the waterline)
  for (let r = 0; r < 3; r++) { const y = -10 - r * 8; box(g, 0, y, 420, 8, Tm[3 - (r % 2)]); box(g, 0, y, 420, 1, Tm[5]); box(g, 0, y + 7, 420, 1, Tm[1]); for (let x = (r * 37) % 70; x < 420; x += 70) { box(g, x, y, 8, 8, Tm[4]); box(g, x + 2, y + 2, 4, 4, Tm[2]); } }
  box(g, 0, -4, 420, 4, mix(Tm[1], '#0A1A20', 0.4));
  box(g, 0, -36, 420, 4, G[3]); box(g, 0, -36, 420, 1, G[5]); checker(g, 0, -33, 420, 2, D[3], 0);
  // (pilings, a few lily pads, reeds and cattails)
  for (const px of [60, 200, 330]) { box(g, px - 4, -48, 8, 48, INK); box(g, px - 3, -48, 6, 48, Tm[3]); box(g, px - 3, -48, 2, 48, Tm[5]); box(g, px - 4, -50, 8, 3, Tm[4]); }
  for (let i = 0; i < 24; i++) {
    const x = i * 18 + hash(i * 3.3) * 10, h = 12 + hash(i * 1.7) * 18;
    for (let k = -1; k <= 1; k++) { const lean = k * (2 + hash(i + k) * 3); g.strokeStyle = k < 0 ? G[5] : G[3]; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x + k * 2, -34); g.quadraticCurveTo(x + k * 2 + lean * 0.3, -34 - h * 0.6, x + k * 2 + lean, -34 - h); g.stroke(); }
    if (hash(i * 5.1) > 0.6) { box(g, x - 1, -34 - h - 8, 3, 8, D[2]); box(g, x - 1, -34 - h - 8, 1, 8, D[4]); }
  }
};

/** The ground behind him going back (each run's strip, banded, its ruts and prints), the island's top, the pond's
 *  surface and far bank. */
export const drawGroundBack = (c: Ctx, v: TownView) => {
  const tod = timeOfDay(), eye = v.eye, haze = skyAt(0.9, tod), f = v.f;
  const pt = (x: number, y: number, d: number) => at(eye, x, y, d);
  if (eye.y < GY - 2) for (const r of RUNS) {
    if (r.b < v.v0 - 300 || r.a > v.v1 + 300) continue;
    const R = nr(`gz-${r.zone}`, zoneR(r.zone), 0.5);
    const cols = [R[5], R[4], R[4], R[3], R[3], R[2]], N = cols.length;
    for (let i = 0; i < N; i++) {
      const d0 = 1 - ((1 - FAR) * i) / N, d1 = 1 - ((1 - FAR) * (i + 1)) / N;
      const col = mix(cols[i], haze, i * 0.04);
      poly(c, [pt(r.a, GY, d0), pt(r.b, GY, d0), pt(r.b, GY, d1), pt(r.a, GY, d1)], col);
      const [lx, ly] = pt(r.a, GY, d1), [rx] = pt(r.b, GY, d1);
      checker(c, lx, ly, rx - lx, PIX, mix(cols[Math.min(N - 1, i + 1)], haze, (i + 1) * 0.04), i % 2);
    }
    const a = Math.max(r.a, v.v0 - 200), b = Math.min(r.b, v.v1 + 200);
    if (r.zone === 'street') {
      // (the wagon ruts running along the street at their depths: a dark groove, its far lip lit)
      for (const d of [0.965, 0.945, 0.83, 0.805]) { const [ra, ry] = pt(a, GY, d), [rb] = pt(b, GY, d); box(c, ra, ry, rb - ra, 2, mix(R[1], haze, (1 - d) * 0.4)); box(c, ra, ry - 1, rb - ra, 1, mix(R[6], haze, (1 - d) * 0.4)); }
    } else if (r.zone === 'queue') {
      // (the concrete scored into "boards" going back, its brown stain patchy)
      for (let k = 1; k < 7; k++) { const d = 1 - (1 - FAR) * (k / 7), [ra, ry] = pt(a, GY, d), [rb] = pt(b, GY, d); box(c, ra, ry, rb - ra, 1, mix(R[1], haze, (1 - d) * 0.4)); }
    }
    // (on it: hoofprints, straw, pebbles, sawdust drifts, gum; smaller and hazier the further)
    for (let gx = Math.floor(a / 40) * 40; gx < b; gx += 40) for (let row = 0; row < 4; row++) {
      const hs = gx * 0.017 + row * 5.3, wx = gx + hash(hs) * 36, d = 1 - (1 - FAR) * ((row + 0.3 + hash(hs * 1.7) * 0.5) / 4);
      const [sx, sy] = pt(wx, GY, d), k = hash(hs * 2.9);
      const col = (cc: string) => mix(farTint(cc, 0.5, tod), haze, (1 - d) * 0.45);
      if (r.zone === 'street') {
        if (k < 0.3) { box(c, sx, sy, 4 * d, 1, col(R[1])); box(c, sx + 5 * d, sy, 4 * d, 1, col(R[1])); }
        else if (k < 0.55) box(c, sx, sy, 6 * d, 1, col('#D8B860'));
        else if (k < 0.7) box(c, sx, sy, 2, 1, col(R[6]));
      } else if (r.zone === 'mill') {
        c.fillStyle = col(k < 0.5 ? R[5] : R[2]); c.beginPath(); c.ellipse(Math.round(sx), Math.round(sy), (8 + hash(hs * 3.1) * 12) * d, 1.5 * d, 0, 0, Math.PI * 2); c.fill();
      } else if (k < 0.25) box(c, sx, sy, 3 * d, 1, col('#2A2624'));
    }
  }
  // Behind the mine's shafts: the ground carrying on past their back walls (the shafts are holes, not trenches to the
  // horizon: the far off used to show through them)
  if (eye.y < GY - 2) for (const [sa, sb] of SHAFTS) {
    const a = X(sa), b = X(sb);
    if (b < v.v0 - 300 || a > v.v1 + 300) continue;
    const R = nr(`gz-${sa < 12000 ? 'mill' : 'queue'}`, zoneR(sa < 12000 ? 'mill' : 'queue'), 0.5);
    const cols = [R[5], R[4], R[4], R[3], R[3], R[2]], N = cols.length;
    for (let i = 0; i < N; i++) {
      const d0 = Math.min(MINE_BK, 1 - ((1 - FAR) * i) / N), d1 = 1 - ((1 - FAR) * (i + 1)) / N;
      if (d1 >= MINE_BK) continue;
      poly(c, [pt(a, GY, d0), pt(b, GY, d0), pt(b, GY, d1), pt(a, GY, d1)], mix(cols[i], haze, i * 0.04));
    }
  }
  // The pond's surface going back, to its far bank
  for (const w of WATERS) {
    if (w.mine || w.b < v.v0 - 300 || w.a > v.v1 + 300 || eye.y > w.surface - 2) continue;
    const R = nr('pond', POND, 0.25), s = w.surface;
    const p2 = (x: number, d: number) => at(eye, x, s, d);
    const cols = [R[4], R[5], R[5], mix(R[6], haze, 0.2), mix(R[6], haze, 0.4), mix(R[7], haze, 0.4)], N = cols.length;
    for (let i = 0; i < N; i++) {
      const d0 = 1 - ((1 - FAR) * i) / N, d1 = 1 - ((1 - FAR) * (i + 1)) / N;
      poly(c, [p2(w.a, d0), p2(w.b, d0), p2(w.b, d1), p2(w.a, d1)], cols[i]);
      const [lx, sy] = p2(w.a, d1), [rx] = p2(w.b, d1);
      checker(c, lx, sy, rx - lx, PIX, cols[Math.min(N - 1, i + 1)], i % 2);
    }
    // (the water carrying on behind the island, between the two ponds (it's an island: there was a hole back there))
    if (w.b === ISLE.a) for (let i = 0; i < N; i++) {
      const d0 = Math.min(ISLE_D, 1 - ((1 - FAR) * i) / N), d1 = 1 - ((1 - FAR) * (i + 1)) / N;
      if (d1 >= ISLE_D) continue;
      poly(c, [p2(ISLE.a - 1, d0), p2(ISLE.b + 1, d0), p2(ISLE.b + 1, d1), p2(ISLE.a - 1, d1)], cols[i]);
    }
    // (the banks either side going back: the street's dirt down to the water (where a pond meets the island, the
    // island's own sides, below))
    const D = nr('pondbank', STREET, 0.4);
    for (const [e, side] of [[w.a, 1], [w.b, -1]] as const) {
      if ((eye.x - e) * side <= 1 || e === ISLE.a || e === ISLE.b) continue;
      poly(c, [pt(e, GY, 1), pt(e, GY, FAR), pt(e, s, FAR), pt(e, s, 1)], D[2]);
      const [x1, y1] = pt(e, GY, FAR);
      c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(e, GY); c.lineTo(x1, y1); c.stroke();
    }
    // (glints riding it, lily pads, bigger nearer)
    for (let k = 0; k < (w.b - w.a) / 26; k++) {
      const d = FAR + (1 - FAR) * hash(k * 3.7 + w.a), len = (6 + hash(k * 1.3) * 12) * d;
      const x = w.a + ((hash(k * 7.1 + w.a) * (w.b - w.a) + f * 0.15 * d) % (w.b - w.a));
      const [sx, sy] = p2(x, d);
      if ((f + k * 13) % 90 < 70) box(c, sx, sy, len, 1, mix(R[8], haze, (1 - d) * 0.5));
      if (hash(k * 9.1 + w.a) > 0.82) { const [lx, ly] = p2(w.a + hash(k * 4.3) * (w.b - w.a), d); c.fillStyle = mix(farTint('#3E6A2E', 0.4, tod), haze, (1 - d) * 0.4); c.beginPath(); c.ellipse(lx, ly, 6 * d, 1.6 * d, 0, 0, Math.PI * 2); c.fill(); }
    }
    // (the far bank, stamped, cut to the water)
    atDepth(c, eye, FAR, () => {
      const wb = w.b === ISLE.a ? ISLE.b : w.b;
      c.save(); c.beginPath(); c.rect(w.a, s - 90, wb - w.a, 92); c.clip();
      for (let tx = Math.floor(w.a / 420) * 420; tx < wb; tx += 420) { c.save(); c.translate(tx, s); stamp(c, `ft-farbank-${tod.key}`, -10, -86, 440, 88, paintFarBank); c.restore(); }
      c.restore();
    });
  }
  // The island going back, over the water behind it: its sides (dirt down to the water, on the side he's looking at),
  // its top (grass, banded darker going back; its edges straight back to the eye: they used to zigzag band to band)
  if (ISLE.b > v.v0 - 100 && ISLE.a < v.v1 + 100) {
    const s = WATERS[0].surface, D = nr('pondbank', STREET, 0.4);
    for (const [e, side] of [[ISLE.a, -1], [ISLE.b, 1]] as const) {
      if ((eye.x - e) * side <= 1) continue;
      poly(c, [pt(e, ISLE.top, 1), pt(e, ISLE.top, ISLE_D), pt(e, s, ISLE_D), pt(e, s, 1)], D[2]);
      const [x1, y1] = pt(e, ISLE.top, ISLE_D), [, y2] = pt(e, s, ISLE_D);
      c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(e, ISLE.top); c.lineTo(x1, y1); c.lineTo(x1, y2); c.stroke();
    }
    if (eye.y < ISLE.top - 2) {
      const G = nr('isle-g', GRASS, 0.4), cols = [G[5], G[4], G[4], G[3]];
      for (let i = 0; i < 4; i++) { const d0 = 1 - ((1 - ISLE_D) * i) / 4, d1 = 1 - ((1 - ISLE_D) * Math.min(4, i + 1.25)) / 4; poly(c, [pt(ISLE.a, ISLE.top, d0), pt(ISLE.b, ISLE.top, d0), pt(ISLE.b, ISLE.top, d1), pt(ISLE.a, ISLE.top, d1)], cols[i]); }
      const [ax, ay] = pt(ISLE.a, ISLE.top, ISLE_D), [bx, by] = pt(ISLE.b, ISLE.top, ISLE_D);
      c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The floor coming toward him

/** The floor under him, painted flat (bent afterwards), by zone; the earth under it (not bent); the lip lit. */
const paintFloor = (g: Ctx, x0: number, w: number, zone: Zone) => {
  const tod = timeOfDay(), s = Math.floor(x0);
  const R = zoneR(zone).map(col => farTint(col, 0.2, tod)), D = DIRT.map(col => farTint(col, 0.2, tod)), S = STONE.map(col => farTint(col, 0.2, tod));
  const L = TOPLIP.map(col => farTint(col, 0.2, tod));
  // (the earth under it)
  bandedGradient(g, x0, GY + BAND, w, SOIL - BAND, [D[2], D[1], D[1], D[0]], 5);
  for (let i = 0; i < w / 60; i++) { const rx = x0 + hash(s + i * 2.9) * w, ry = GY + BAND + 20 + hash(s + i * 3.7) * 200; pixelBlob(g, rx, ry, 10 + hash(i) * 8, 5 + hash(i * 2) * 3, S[2]); box(g, rx - 6, ry - 4, 8, 1, S[4]); }
  // (the floor: banded darker nearer)
  bandedGradient(g, x0, GY, w, BAND, [R[6], R[5], R[5], R[4], R[4], R[3], R[3], R[2]], 8);
  if (zone === 'street') {
    // (two pairs of wagon ruts along it (a groove, its far lip lit, its near side shaded), packed dirt between)
    for (const ry of [GY + 14, GY + 30, GY + 78, GY + 104]) { const k = (ry - GY) / BAND, wdt = 3 + k * 6; box(g, x0, ry, w, wdt, R[2]); box(g, x0, ry - 1, w, 1, R[7]); box(g, x0, ry + wdt, w, 1, R[1]); checker(g, x0, ry + 1, w, 2, R[1], 0); }
    // (hoofprints, in pairs, bigger nearer)
    for (let i = 0; i < w / 26; i++) {
      const hx = x0 + hash(s + i * 0.91) * w, hy = GY + 6 + hash(s + i * 1.77) * (BAND - 20), sc = 1 + (hy - GY) / 70;
      g.fillStyle = R[2]; g.beginPath(); g.ellipse(hx, hy, 3 * sc, 1.6 * sc, 0, 0, Math.PI * 2); g.fill();
      box(g, hx - 3 * sc, hy - 2 * sc, 6 * sc, 1, R[6]);
    }
    // (straw, pebbles, a horse apple)
    for (let i = 0; i < w / 5; i++) { const px = x0 + hash(s + i * 0.71) * w, py = GY + 3 + hash(s + i * 1.93) * (BAND - 6), sc = 1 + (py - GY) / 80; box(g, px, py, (hash(s + i * 3.1) > 0.6 ? 5 : 2) * sc, 1, hash(s + i * 3.1) > 0.6 ? farTint('#D8B860', 0.2, tod) : hash(s + i) > 0.5 ? R[7] : R[1]); }
    for (let i = 0; i < w / 300; i++) { const ax = x0 + hash(s + i * 7.7) * w, ay = GY + 40 + hash(s + i * 8.1) * 100; pixelBlob(g, ax, ay, 5, 3, farTint('#4A3418', 0.2, tod)); box(g, ax - 3, ay - 2, 3, 1, farTint('#6A4E28', 0.2, tod)); }
  } else if (zone === 'mill') {
    // (sawdust in drifts, chips, strips of bark)
    for (let i = 0; i < w / 4; i++) { const px = x0 + hash(s + i * 0.53) * w, py = GY + 3 + hash(s + i * 1.37) * (BAND - 6), sc = 1 + (py - GY) / 70; box(g, px, py, 2 * sc, 1, hash(s + i * 2.3) > 0.5 ? R[6] : R[2]); }
    for (let i = 0; i < w / 40; i++) { const px = x0 + hash(s + i * 2.1) * w, py = GY + 10 + hash(s + i * 2.9) * (BAND - 20), sc = 1 + (py - GY) / 60; box(g, px, py, 8 * sc, 3 * sc, R[5]); box(g, px, py, 8 * sc, 1, R[7]); box(g, px + 8 * sc, py, 1, 3 * sc, R[2]); }
    const B = BARK.map(col => farTint(col, 0.2, tod));
    for (let i = 0; i < w / 90; i++) { const px = x0 + hash(s + i * 5.1) * w, py = GY + 20 + hash(s + i * 4.3) * (BAND - 40); box(g, px, py, 16, 3, B[2]); box(g, px, py, 16, 1, B[4]); }
  } else {
    // (stamped concrete, scored into planks and stained brown; gum spots; a dropped pacifier)
    for (let ry = GY + 10, k = 0; ry < GY + BAND; ry += 10 + k * 2, k++) { box(g, x0, ry, w, 1, R[1]); box(g, x0, ry + 1, w, 1, R[5]); for (let jx = x0 + ((k * 53 + s) % 90); jx < x0 + w; jx += 90 + k * 8) box(g, jx, ry - 10 - k * 2 + 2, 1, 10 + k * 2 - 2, R[1]); }
    for (let i = 0; i < w / 22; i++) { const px = x0 + hash(s + i * 1.1) * w, py = GY + 6 + hash(s + i * 2.2) * (BAND - 12); box(g, px, py, 3, 2, R[1]); box(g, px, py, 1, 1, R[2]); }
  }
  // (a few things the guests dropped: a popcorn box, a ticket stub, a souvenir map; a horseshoe)
  if (zone !== 'mill') for (let i = 0; i < w / 240; i++) {
    const px = x0 + 30 + hash(s + i * 9.3) * (w - 60), py = GY + 30 + hash(s + i * 6.1) * (BAND - 60), k = hash(s + i * 3.9);
    if (k < 0.3) { box(g, px - 1, py - 9, 10, 10, INK); box(g, px, py - 8, 8, 9, '#F2ECE0'); for (let j = 0; j < 8; j += 2) box(g, px + j, py - 8, 1, 9, '#D83A2A'); box(g, px - 1, py - 12, 10, 4, '#F4E08A'); box(g, px + 2, py - 13, 2, 2, '#FFF8C0'); }
    else if (k < 0.55) { box(g, px, py, 12, 5, INK); box(g, px + 1, py + 1, 10, 3, '#E8B030'); box(g, px + 3, py + 2, 5, 1, '#7A3A1A'); }
    else if (k < 0.8) { box(g, px, py, 16, 9, INK); box(g, px + 1, py + 1, 14, 7, '#E8DCB0'); box(g, px + 3, py + 3, 4, 3, '#5A8A4A'); box(g, px + 8, py + 2, 5, 1, '#C83A2A'); box(g, px + 8, py + 5, 4, 1, '#3A6AA8'); }
    else { g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(px, py, 5, Math.PI * 0.1, Math.PI * 0.9, true); g.stroke(); g.strokeStyle = farTint('#8A8A92', 0.2, tod); g.lineWidth = 2; g.stroke(); }
  }
  // (the lip: lit, the dust along it, pebbles sticking up)
  box(g, x0, GY - 1, w, 1, INK);
  box(g, x0, GY, w, 4, L[1]); box(g, x0, GY, w, 2, L[2]); box(g, x0, GY, w, 1, L[3]);
  checker(g, x0, GY + 4, w, PIX, L[1]);
  for (let i = 0; i < w / 14; i++) { const gx = x0 + i * 14 + hash(s + i) * 8; box(g, gx, GY - 1, 2, 1, R[6]); }
};

/** The floor under him (stamped in chunks, flat, then bent), the near banks, the island's face. */
export const drawGroundFloor = (c: Ctx, v: TownView) => {
  const tod = timeOfDay();
  const CH = 512;
  for (const r of RUNS) {
    if (r.b < v.v0 - 200 || r.a > v.v1 + 200) continue;
    for (let x = r.a, i = 0; x < r.b; x += CH, i++) {
      const w = Math.min(CH, r.b - x);
      if (x + w < v.v0 || x > v.v1) continue;
      stamp(c, `ft-floor-${r.rx}-${i}-${tod.key}`, x, GY - 10, w, SOIL + 10, g => paintFloor(g, x, w, r.zone));
    }
    // (bent within its own ends: it used to fan out past them over the mine's shafts (over their landings, the playtest's
    // ledges clipping in as he came up to them) and over the ponds; the near bank shows where it's cut, from its open
    // side)
    bendFloor(c, v.eye, GY, GY, GY + BAND, Math.max(r.a, v.v0 - 40), Math.min(r.b, v.v1 + 40));
  }
  // (the near banks: down to the pond's surface, down the mine's shafts into the dark)
  for (let i = 0; i + 1 < RUNS.length; i++) {
    const l = RUNS[i], r = RUNS[i + 1];
    if (l.b > v.v0 - 300 && l.b < v.v1 + 300) nearBank(c, v, l.b, 1, l.rx < 9000);
    if (r.a > v.v0 - 300 && r.a < v.v1 + 300) nearBank(c, v, r.a, -1, r.rx < 9700);
  }
  // (the island: its face, dirt over rock down into the water; its lip lit)
  if (ISLE.b > v.v0 && ISLE.a < v.v1) {
    stamp(c, `ft-isle-${tod.key}`, ISLE.a - 4, ISLE.top - 8, ISLE.b - ISLE.a + 8, Y(-170) - ISLE.top + 8, g => {
      const D = STREET.map(col => farTint(col, 0.2, tod)), S = STONE.map(col => farTint(col, 0.2, tod)), G = GRASS.map(col => farTint(col, 0.2, tod));
      const w = ISLE.b - ISLE.a, bot = Y(-170);
      box(g, ISLE.a - 1, ISLE.top - 1, w + 2, bot - ISLE.top + 1, INK);
      bandedGradient(g, ISLE.a, ISLE.top, w, 40, [D[4], D[3], D[3], D[2]], 4);
      for (let y = ISLE.top + 40, row = 0; y < bot; y += 22, row++) for (let x = ISLE.a + (row % 2) * 14; x < ISLE.b; x += 30) { box(g, x, y, 28, 20, S[2 + ((row + x) & 1)]); box(g, x, y, 28, 2, S[5]); box(g, x + 27, y, 1, 20, S[0]); }
      box(g, ISLE.a, ISLE.top, w, 3, G[5]); box(g, ISLE.a, ISLE.top, w, 1, G[6]);
      for (let x = ISLE.a; x < ISLE.b; x += 4) { const h = 2 + hash(x) * 6; box(g, x, ISLE.top - h, 1, h, G[4]); box(g, x + 1, ISLE.top - h + 2, 1, h - 2, G[6]); }
    });
  }
};

/** A near bank: the floor's edge (bent like the floor) and the earth under it; down to the water (`water`) or into the
 *  dark. */
const nearBank = (c: Ctx, v: TownView, e: number, side: 1 | -1, water: boolean) => {
  const ex = v.eye.x;
  if ((ex - e) * side <= 1) return;
  const Y1 = GY + BAND + 60;
  const edge = (y: number) => ex + (e - ex) * (1 + (y - GY) * BEND);
  const N = 12, pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) { const y = GY + ((Y1 - GY) * i) / N; pts.push([edge(y), y]); }
  const band = (s0: number, s1: number, col: string) => poly(c, [...pts.map(([x, y]) => [x, y + s0] as [number, number]), ...pts.slice().reverse().map(([x, y]) => [x, y + s1] as [number, number])], col);
  const D = nr('nbank', STREET, 0.2), R = nr('nstone', STONE, 0.2), L = nr('nlip', TOPLIP, 0.2);
  const depth = water ? 26 : 480;
  // (the pond past where the floor pulls back: the floor's bent only within its own ends, so between its edge here and
  // the pond's end the flat street was left showing under the bank, cut straight down at the pond's end (a vertical line
  // on the bent ground); the pond's body carries on in there instead, its edge going back to the eye with the floor's)
  const wb = water ? WATERS.find(w => !w.mine && e > w.a - 3 && e < w.b + 3) : undefined;
  if (wb) {
    const xa = Math.min(e, edge(Y1)), xb = Math.max(e, edge(Y1));
    c.save(); c.beginPath(); c.moveTo(e, GY + depth); pts.forEach(([x, y]) => c.lineTo(x, y + depth)); c.lineTo(e, Y1 + depth); c.closePath(); c.clip();
    paintBody(c, wb, Math.floor(xa) - 2, Math.ceil(xb - xa) + 4);
    c.restore();
  }
  band(0, 3, L[2]); band(3, Math.min(depth, 16), D[4]);
  if (depth > 16) band(16, Math.min(depth, 30), D[3]);
  if (!water) {
    const dk = (col: string, sdown: number) => mix(col, '#040302', Math.min(0.92, 0.35 + Math.max(0, sdown - 30) / 220));
    for (let s0 = 30, row = 0; s0 < depth; row++) {
      const rh = 24 + hash(e * 0.01 + row * 2.9) * 28, st = 1 + Math.floor(hash(e + row * 1.3) * 3);
      for (let i = row % 2; i < N; i += st) {
        const seg = pts.slice(i, Math.min(N, i + st) + 1);
        poly(c, [...seg.map(([x, y]) => [x, y + s0] as [number, number]), ...seg.slice().reverse().map(([x, y]) => [x, y + s0 + rh] as [number, number])], dk(R[1 + Math.floor(hash(e + row * 3 + i) * 3)], s0));
        poly(c, [...seg.map(([x, y]) => [x, y + s0] as [number, number]), ...seg.slice().reverse().map(([x, y]) => [x, y + s0 + 3] as [number, number])], dk(R[5], s0));
      }
      s0 += rh;
    }
  }
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
};

// ---------------------------------------------------------------------------------------------------------------
// The water's body

const waterR = (w: Water) => (w.mine ? nr('sump', SUMP, 0.1) : nr('pondb', POND, 0.25));

/** The water's body at the play plane, its bed and what's sunk in it (painted once per hour per water, in chunks). */
const paintBody = (g: Ctx, w: Water, x0: number, cw: number) => {
  const R = waterR(w), s = w.surface, depth = w.bed - s, tod = timeOfDay();
  const S = STONE.map(c => farTint(c, 0.25, tod));
  const bands = [R[5], R[4], R[4], R[3], R[3], R[2], R[2], R[1]];
  for (let i = 0; i < bands.length; i++) {
    const y = s + (i * depth) / bands.length;
    box(g, x0, y, cw, depth / bands.length + 1, bands[i]);
    if (i) checker(g, x0, y - 1, cw, PIX, bands[i - 1], i % 2);
  }
  // (the bed: silt and gravel, stones lit on top)
  box(g, x0, w.bed, cw, 300, mix(S[1], DIRT[1], 0.5));
  box(g, x0, w.bed - 6, cw, 8, mix(R[1], S[2], 0.5));
  for (let x = Math.floor(x0 / 6) * 6; x < x0 + cw; x += 6) box(g, x + hash(x * 1.7) * 4, w.bed - 4 + hash(x) * 3, 2, 2, hash(x * 3.1) > 0.5 ? mix(S[4], R[2], 0.5) : mix(S[2], R[1], 0.5));
  for (let x = Math.floor(x0 / 46) * 46; x < x0 + cw; x += 46) {
    const sx = x + hash(x * 2.3) * 30, rw = 6 + hash(x * 4.1) * 8;
    g.fillStyle = mix(INK, R[1], 0.4); g.beginPath(); g.ellipse(sx, w.bed - 2, rw + 1, rw * 0.55 + 1, 0, Math.PI, 0); g.fill();
    g.fillStyle = mix(S[3], R[2], 0.45); g.beginPath(); g.ellipse(sx, w.bed - 2, rw, rw * 0.55, 0, Math.PI, 0); g.fill();
    box(g, sx - rw * 0.5, w.bed - 2 - rw * 0.45, rw * 0.6, 1, mix(S[5], R[3], 0.4));
  }
  const m = (col: string) => mix(farTint(col, 0.25, tod), R[2], w.mine ? 0.55 : 0.35);
  if (!w.mine) {
    // (weed up off the bed; a sunk log, waterlogged; a rusted saw blade half in the silt)
    for (let x = Math.floor(x0 / 60) * 60 + 20; x < x0 + cw; x += 60) { const h = 14 + hash(x) * 26; for (let y = 0; y < h; y += 2) box(g, x + Math.sin(y * 0.2 + x) * 2, w.bed - 4 - y, 2, 2, mix(GRASS[2], R[2], 0.4)); }
    const lx = w.a + (w.b - w.a) * 0.35;
    if (lx > x0 - 140 && lx < x0 + cw + 20) { box(g, lx - 1, w.bed - 20, 122, 18, INK); box(g, lx, w.bed - 19, 120, 16, m(BARK[3])); box(g, lx, w.bed - 19, 120, 3, m(BARK[5])); for (let k = 8; k < 120; k += 14) box(g, lx + k, w.bed - 15, 6, 2, m(BARK[1])); box(g, lx + 114, w.bed - 19, 6, 16, m('#B08A5A')); }
    const bx = w.a + (w.b - w.a) * 0.7;
    if (bx > x0 - 30 && bx < x0 + cw + 30) { g.save(); g.beginPath(); g.rect(bx - 30, w.bed - 40, 60, 38); g.clip(); g.fillStyle = INK; g.beginPath(); g.arc(bx, w.bed + 2, 26, 0, Math.PI * 2); g.fill(); g.fillStyle = m('#8A5A3A'); g.beginPath(); g.arc(bx, w.bed + 2, 24, 0, Math.PI * 2); g.fill(); for (let k = 0; k < 12; k++) { const a = Math.PI + k * 0.26; box(g, bx + Math.cos(a) * 25, w.bed + 2 + Math.sin(a) * 25, 3, 3, m('#5A3A22')); } g.restore(); }
  } else {
    // (the flooded shaft: sunk ore carts, timbers, a lantern, a lunch pail; drowned rails along the bed)
    box(g, x0, w.bed - 6, cw, 3, m(STEEL[3]));
    for (const k of [0.12, 0.55, 0.8]) {
      const x = w.a + (w.b - w.a) * k;
      if (x < x0 - 180 || x > x0 + cw + 20) continue;
      box(g, x - 1, w.bed - 41, 62, 36, INK); box(g, x, w.bed - 40, 60, 34, m(STEEL[3])); box(g, x, w.bed - 40, 60, 3, m(STEEL[5])); for (let j = 6; j < 60; j += 12) box(g, x + j, w.bed - 32, 2, 2, m(STEEL[6]));
      for (const wx of [x + 12, x + 48]) { g.fillStyle = INK; g.beginPath(); g.arc(wx, w.bed - 6, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = m(STEEL[2]); g.beginPath(); g.arc(wx, w.bed - 6, 5, 0, Math.PI * 2); g.fill(); }
      box(g, x + 80, w.bed - 10, 90, 9, INK); box(g, x + 81, w.bed - 9, 88, 7, m(TIMBER[3])); box(g, x + 81, w.bed - 9, 88, 1, m(TIMBER[5]));
    }
    const lx = w.a + (w.b - w.a) * 0.33;
    if (lx > x0 - 20 && lx < x0 + cw + 20) { box(g, lx - 6, w.bed - 16, 12, 14, INK); box(g, lx - 5, w.bed - 15, 10, 12, m(BRASS[2])); box(g, lx - 3, w.bed - 12, 6, 7, m('#6A8A6A')); }
  }
};

/** Behind everything at the play plane: the water's body (stamped), its steps out (lit lips: standable). */
export const drawWaterBack = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), L = nr('wlip', TOPLIP, 0.25), D = nr('wstep', STONE, 0.25);
  for (const w of WATERS) {
    if (!onScreen(state, w.a, w.b)) continue;
    for (let x = w.a, i = 0; x < w.b; x += 512, i++) {
      const cw = Math.min(512, w.b - x);
      if (!onScreen(state, x, x + cw)) continue;
      stamp(c, `ft-water-${w.key}-${i}-${tod.key}`, x, w.surface - 2, cw, w.bed + 300 - w.surface + 2, g => paintBody(g, w, x, cw));
    }
    // (the steps out: a stone ledge just under the surface, its lip lit)
    for (const x of [w.a, w.b - 50]) { box(c, x, w.surface + 25, 50, 1, INK); box(c, x, w.surface + 26, 50, 8, D[3]); box(c, x, w.surface + 34, 50, 4, D[2]); box(c, x, w.surface + 26, 50, 2, L[2]); box(c, x, w.surface + 28, 50, 1, L[1]); }
  }
};

/** Over whoever's in it: the water's front, see-through, caustics wavering, its surface line lit and rippling. */
export const drawWaterFront = (c: Ctx, state: GameState) => {
  const f = state.frame, v = viewOf(state);
  for (const w of WATERS) {
    if (!onScreen(state, w.a, w.b)) continue;
    const s = w.surface, R = waterR(w);
    const xa = Math.max(w.a, v.x - 40), xb = Math.min(w.b, v.x + v.w + 40);
    c.globalAlpha = w.mine ? 0.55 : 0.42; box(c, xa, s + 6, xb - xa, 30, R[4]);
    c.globalAlpha = w.mine ? 0.7 : 0.55; box(c, xa, s + 36, xb - xa, w.bed - s - 36, R[2]);
    c.globalAlpha = w.mine ? 0.1 : 0.18;
    for (let x = Math.floor(xa / 16) * 16; x < xb; x += 16) {
      const k = Math.sin(f * 0.05 + x * 0.07) + Math.sin(f * 0.031 - x * 0.11);
      if (k > 0.6) box(c, x, s + 8 + (k - 0.6) * 10, 8, 40 + k * 20, R[7]);
    }
    c.globalAlpha = 1;
    for (let x = Math.floor((xa - w.a) / 4) * 4 + w.a; x < xb; x += 4) {
      const lift = Math.sin(f * 0.07 + x * 0.04) * 1.5 + Math.sin(f * 0.11 + x * 0.13) * 0.5, y = Math.round(s - lift);
      box(c, x, y - 1, 4, 1, INK);
      box(c, x, y, 4, 2, R[7]); box(c, x, y + 2, 4, 2, R[6]); box(c, x, y + 4, 4, 2, R[5]);
      const drift = (x - w.a - f * 0.2) / 4;
      if (((Math.floor(drift) % 13) + 13) % 13 === 0) box(c, x, y, 4, 1, R[8]);
    }
  }
  void hazeBands; void PLANK;
};
