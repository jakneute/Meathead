// The wilds' ground, in fake 3D (the jungle's way, one eye for the scene): the meadow at the play plane going back (a
// strip of it behind where he walks, banded darker and hazier the further back, brush and fake rocks along its far
// edge) and coming toward him (the floor under his feet: the park's groomed trail, then grass, bent the SNES way so it
// fans out as he goes by); the raised ground's faces (the park's fiberglass bluffs with their seams and bolts; the
// meadow's hill in dirt over real rock), their tops going back and their ends' sides; the ravine cut deep through the
// bluffs (its walls going down in real rock, mist lying in it); the near banks where the floor stops at the water and
// the ravine. Everything he stands on has a lit lip. (The station's platform is station.ts's; the water's water.ts's.)

import type { View } from './paint';
import { type Ctx, box, checker, mix, hash, PIX, at, poly, stamp, bandedGradient, hazeBands, pixelBlob, atDepth, fiberglass, fern, timeOfDay, farTint, skyAt, INK, FAR, FIBER, STONE, STEEL, DIRT, GRASS, NEEDLE, LIP, FIBER_LIP } from './paint';
import { pine } from './paint';
import { bendFloor, BEND } from '../../intro/art/kit';
import { GY } from '../geometry';
import { GROUND, WATERS, BED, X, Y } from './layout';

/** How far toward him the floor under his feet comes (bent); under that, the earth, not bent. */
const BAND = 160, SOIL = 420;
/** Deep (the bottom of everything that goes all the way down). */
const DEEP = GY + 1400;
/** The station's ground (its platform's station.ts's: no going-back strip or face here). */
const STATION_RX = 19440;

export interface Run { a: number; b: number; ya: number; yb: number; rx: number; fiber: boolean }
/** The ground he stands on (not the water's beds): world x, the top's y at each end. The park's fiberglass where it's
 *  a cliff (the bluffs, the islands, the cliff past the falls); dirt over rock where it's the meadow's hill. */
export const RUNS: Run[] = GROUND.filter(([, , h1, h2]) => h1 >= 0 && h2 >= 0).map(([a, b, h1, h2]) => ({ a: X(a), b: X(b), ya: Y(h1), yb: Y(h2), rx: a, fiber: (a >= 6900 && a < 7100) || (a >= 8160 && a < 9400) || (a >= 11650 && a < 11800) || (a >= 17580 && a < 17900) }));
const raised = (r: Run) => r.ya < GY - 0.5 || r.yb < GY - 0.5;
/** The floor at the ground line coming toward him: under every run (raised ones stand on it). */
export const FLOOR: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (const r of RUNS) { const l = out[out.length - 1]; if (l && r.a - l[1] < 1) l[1] = Math.max(l[1], r.b); else out.push([r.a, r.b]); }
  return out;
})();
/** The gaps between the floor's stretches: the water (its surface under), the ravine and the falls (all the way down). */
export const GAPS = FLOOR.slice(0, -1).map(([, b], i) => {
  const a2 = FLOOR[i + 1][0], water = WATERS.some(w => w.a < a2 && w.b > b && w.a >= b - 2);
  const L = RUNS.find(r => Math.abs(r.b - b) < 1)!, R = RUNS.find(r => Math.abs(r.a - a2) < 1)!;
  return { a: b, b: a2, ya: L.yb, yb: R.ya, water };
});

/** The faces going back: at every run's end where the ground steps or stops, seen from its open side. */
interface Face { e: number; side: 1 | -1; top: number; bottom: number; fiber: boolean }
const FACES: Face[] = (() => {
  const out: Face[] = [];
  for (let i = 0; i + 1 < RUNS.length; i++) {
    const l = RUNS[i], r = RUNS[i + 1];
    if (l.rx >= STATION_RX) continue;
    if (Math.abs(l.b - r.a) < 1) {
      if (Math.abs(l.yb - r.ya) < 1) continue;
      if (l.yb < r.ya) out.push({ e: l.b, side: 1, top: l.yb, bottom: r.ya, fiber: l.fiber });
      else out.push({ e: r.a, side: -1, top: r.ya, bottom: l.yb, fiber: r.fiber });
    } else {
      const g = GAPS.find(q => Math.abs(q.a - l.b) < 1);
      const bottom = g?.water ? GY + BED : DEEP;
      out.push({ e: l.b, side: 1, top: l.yb, bottom, fiber: l.fiber });
      out.push({ e: r.a, side: -1, top: r.ya, bottom, fiber: r.fiber });
    }
  }
  return out;
})();

/** Ramps for the hour, made once per hour. */
const RAMPS = new Map<string, string[]>();
const memo = (name: string, make: () => string[]) => {
  const key = `${name}-${timeOfDay().key}`;
  let r = RAMPS.get(key);
  if (!r) { r = make(); RAMPS.set(key, r); }
  return r;
};
const hr = (name: string, R: string[], k = 0.2) => memo(name, () => { const tod = timeOfDay(); return R.map(c => farTint(c, k, tod)); });

// ---------------------------------------------------------------------------------------------------------------
// Going back

/** The brush along the far edge of the ground (a tile, the same all along, stamped, cut to the run): fake rocks, ferns,
 *  young pines, a stump, bushes. */
const paintBrush = (g: Ctx, tod: ReturnType<typeof timeOfDay>) => {
  const haze = skyAt(0.9, tod);
  const N = NEEDLE.map(c => mix(farTint(c, 0.7, tod), haze, 0.2)), G = GRASS.map(c => mix(farTint(c, 0.7, tod), haze, 0.2));
  const F = FIBER.map(c => mix(farTint(c, 0.7, tod), haze, 0.22)), B = DIRT.map(c => mix(farTint(c, 0.7, tod), haze, 0.22));
  // (young pines, back)
  for (let i = 0; i < 6; i++) pine(g, 30 + i * 96 + hash(i * 3.3) * 40, 0, 50 + hash(i) * 40, 26 + hash(i * 2) * 12, i * 11 + 4, N, B);
  // (bushes: rounded, stepped)
  for (let i = 0; i < 14; i++) {
    const x = i * 42 + hash(i * 1.9) * 20, r = 10 + hash(i * 4.1) * 10;
    pixelBlob(g, x, -r * 0.6, r + 1, r * 0.7 + 1, G[0]); pixelBlob(g, x, -r * 0.6, r, r * 0.7, G[2]); pixelBlob(g, x - r * 0.25, -r * 0.8, r * 0.6, r * 0.4, G[3]); pixelBlob(g, x - r * 0.35, -r * 0.95, r * 0.25, r * 0.16, G[5]);
  }
  // (a fake rock or two: molded, a seam)
  for (const [x, w, h] of [[120, 46, 24], [400, 60, 30]] as const) {
    g.fillStyle = F[0]; g.beginPath(); g.ellipse(x, 0, w / 2 + 1, h + 1, 0, Math.PI, 0); g.fill();
    g.fillStyle = F[3]; g.beginPath(); g.ellipse(x, 0, w / 2, h, 0, Math.PI, 0); g.fill();
    g.fillStyle = F[4]; g.beginPath(); g.ellipse(x - w * 0.12, -h * 0.3, w * 0.3, h * 0.55, 0, Math.PI, 0); g.fill();
    box(g, x + w * 0.1, -h + 4, 1, h - 4, F[1]);
  }
  // (a stump, cut flat, its rings)
  box(g, 262, -14, 18, 14, B[3]); box(g, 262, -14, 4, 14, B[4]); g.fillStyle = B[5]; g.beginPath(); g.ellipse(271, -14, 9, 3, 0, 0, Math.PI * 2); g.fill();
  // (ferns in front)
  for (let i = 0; i < 16; i++) fern(g, i * 36 + hash(i * 5.3) * 20, 0, 12 + hash(i) * 10, i * 3 + 1, 0, G, 3);
};

/** The ravine going back (its back walls, dark, mist), the ground strips going back with what's on them, the faces. */
export const drawGoingBack = (c: Ctx, v: View) => {
  const tod = timeOfDay(), eye = v.eye, haze = skyAt(0.9, tod);
  const pt = (x: number, y: number, d: number) => at(eye, x, y, d);
  // The ravine (and the falls' drop) going back: dark between their rims, mist in layers
  for (const p of GAPS) {
    if (p.water || p.b < v.v0 - 300 || p.a > v.v1 + 300) continue;
    const [ax, ay] = pt(p.a, p.ya, FAR), [bx, by] = pt(p.b, p.yb, FAR);
    const topY = Math.min(ay, by, p.ya, p.yb);
    c.save();
    c.beginPath(); c.moveTo(p.a, v.bot); c.lineTo(p.a, p.ya); c.lineTo(ax, ay); c.lineTo(bx, by); c.lineTo(p.b, p.yb); c.lineTo(p.b, v.bot); c.closePath(); c.clip();
    const R = ['#2A2620', '#1E1C18', '#141310', '#0C0B0A', '#060505'].map(col => farTint(col, 0.4, tod));
    bandedGradient(c, Math.min(p.a, ax) - 4, topY - 2, Math.max(p.b, bx) - Math.min(p.a, ax) + 8, Math.max(40, v.bot - topY + 4), [mix(R[0], haze, 0.14), R[1], R[2], R[3], R[4], R[4]], 12);
    // (the back wall's strata, going across)
    for (let k = 1; k < 9; k++) { const y = topY + k * 26 + k * k * 2; box(c, Math.min(p.a, ax), y, Math.max(p.b, bx) - Math.min(p.a, ax), 1, mix(R[0], '#000000', 0.2 + k * 0.06)); }
    for (let k = 0; k < 3; k++) hazeBands(c, p.a - 200, GY + 20 + k * 80, p.b - p.a + 400, 34, mix(haze, '#FFFFFF', 0.2), 0, 0.1 - k * 0.025, 4);
    c.restore();
  }
  // The ground behind him, going back: bands, darker and hazier the further; what's lying on it; the brush at its edge
  const MC = [GRASS[3], GRASS[4], DIRT[4], GRASS[2], GRASS[5], DIRT[3]];
  // (the strip's surface colors by row going back, made once per hour: MC's, then two flowers')
  const surfCols = (row: number) => memo(`surf${row}`, () => [...MC, '#F4E06A', '#E8E4F4'].map(col => mix(farTint(col, 0.6, tod), haze, (row + 0.5) / 5 * (1 - FAR) * 0.45)));
  for (const r of RUNS) {
    if (r.rx >= STATION_RX || r.b < v.v0 - 400 || r.a > v.v1 + 400 || eye.y > Math.max(r.ya, r.yb) - 2) continue;
    const cols = r.fiber ? [FIBER[4], FIBER[3], FIBER[3], FIBER[2], FIBER[2]] : [GRASS[4], GRASS[3], GRASS[3], GRASS[2], GRASS[2]], steps = 5;
    for (let i = 0; i < steps; i++) {
      const d0 = 1 - ((1 - FAR) * i) / steps, d1 = 1 - ((1 - FAR) * (i + 1)) / steps;
      const col = mix(farTint(cols[i], 0.6, tod), haze, i * 0.05);
      poly(c, [pt(r.a, r.ya, d0), pt(r.b, r.yb, d0), pt(r.b, r.yb, d1), pt(r.a, r.ya, d1)], col);
      const [lx, ly] = pt(r.a, r.ya, d1), [rx, ry] = pt(r.b, r.yb, d1);
      if (Math.abs(ly - ry) < 1) checker(c, lx, ly, rx - lx, PIX, mix(farTint(cols[Math.min(4, i + 1)], 0.6, tod), haze, (i + 1) * 0.05));
    }
    // (its surface: grass in drifts, dirt patches, going back with it, smaller and hazier the further)
    if (!r.fiber) for (let gx = Math.floor((v.v0 - 300) / 48) * 48; gx < v.v1 + 300; gx += 48) for (let row = 0; row < 5; row++) {
      const hs = gx * 0.013 + row * 7.1, wx = gx + hash(hs) * 44;
      if (wx < r.a + 6 || wx > r.b - 6) continue;
      const d = 1 - (1 - FAR) * ((row + 0.3 + hash(hs * 1.7) * 0.5) / 5);
      const y = r.ya + (r.yb - r.ya) * ((wx - r.a) / Math.max(1, r.b - r.a));
      const [sx, sy] = pt(wx, y, d);
      const T = surfCols(row);
      c.fillStyle = T[Math.floor(hash(hs * 2.3) * MC.length)];
      c.beginPath(); c.ellipse(Math.round(sx), Math.round(sy), (10 + hash(hs * 3.1) * 14) * d, (1.5 + hash(hs * 4.3) * 2) * d, 0, 0, Math.PI * 2); c.fill();
      // (a flower or two in the grass: the park seeded it)
      if (hash(hs * 6.1) > 0.8) box(c, Math.round(sx + 4 * d), Math.round(sy - 2), 2, 2, T[hash(hs) > 0.5 ? 6 : 7]);
    }
    else for (let k = 0; k < (r.b - r.a) / 60; k++) {
      // (the fiberglass's top: molded lumps going back, a bolt)
      const wx = r.a + 20 + hash(r.a + k * 2.3) * (r.b - r.a - 40), d = FAR + 0.05 + hash(r.a + k * 4.1) * (1 - FAR - 0.1);
      const y = r.ya + (r.yb - r.ya) * ((wx - r.a) / Math.max(1, r.b - r.a));
      const [sx, sy] = pt(wx, y, d);
      box(c, sx, sy, 14 * d, 2, mix(farTint(FIBER[5], 0.6, tod), haze, (1 - d) * 0.4));
      box(c, sx, sy + 2, 14 * d, 1, mix(farTint(FIBER[1], 0.6, tod), haze, (1 - d) * 0.4));
    }
    // (the brush along the far edge, on the meadow only)
    if (!r.fiber && Math.abs(r.ya - r.yb) < 1) atDepth(c, eye, FAR, () => {
      c.save(); c.beginPath(); c.rect(r.a, r.ya - 140, r.b - r.a, 142); c.clip();
      for (let tx = Math.floor((r.a - 60) / 560) * 560; tx < r.b + 60; tx += 560) {
        const ex = eye.x + (tx - eye.x) * FAR;
        if (ex + 600 * FAR < v.v0 - 100 || ex > v.v1 + 100) continue;
        c.save(); c.translate(tx, r.ya); stamp(c, `fw-brush-${tod.key}`, -60, -120, 680, 122, g => paintBrush(g, tod)); c.restore();
      }
      c.restore();
    });
  }
  // The faces going back
  for (const fc of FACES) if (fc.e > v.v0 - 500 && fc.e < v.v1 + 500) bankFace(c, v, fc);
};

/**
 * A face going back from the play plane at x = e (a bluff's end, the hill's foot, a bank down to the water, the
 * ravine's wall), seen only from its side: fiberglass in molded courses with a seam (the park's cliffs), or a skin of
 * dirt then real rock in blocks (the meadow's), darker the further back and the further down; roots off a dirt top.
 */
const bankFace = (c: Ctx, v: View, fc: Face) => {
  const { e, side, top, bottom, fiber } = fc, eye = v.eye;
  if ((eye.x - e) * side <= 1) return;
  const tod = timeOfDay(), haze = skyAt(0.9, tod);
  const pt = (k: number, y: number) => at(eye, e, y, 1 - (1 - FAR) * k);
  const q = (k0: number, y0: number, k1: number, y1: number, col: string) => poly(c, [pt(k0, y0), pt(k1, y0), pt(k1, y1), pt(k0, y1)], col);
  const bot = Math.min(bottom, eye.y + (v.bot - eye.y) / FAR + 40);
  const shade = (col: string, k: number, y: number) => mix(mix(farTint(col, 0.3, tod), haze, k * 0.25), '#050404', Math.min(0.85, Math.max(0, (y - Math.max(top, GY - 40) - 60) / 480)));
  if (fiber) {
    // (molded courses: each a band lit along its top; a seam going back with its bolts)
    let y = top, row = 0;
    while (y < bot) {
      const rh = 18 + hash(e * 0.01 + row * 3.7) * 22;
      for (let j = 0; j < 4; j++) { q(j / 4, y, (j + 1) / 4, Math.min(bot, y + rh), shade(FIBER[2 + ((row + j) % 2)], j / 4, y)); q(j / 4, y, (j + 1) / 4, y + 2, shade(FIBER[5], j / 4, y)); }
      y += rh; row++;
    }
    const [s0x, s0y] = pt(0.5, top), [, s1y] = pt(0.5, Math.min(bot, top + 260));
    box(c, s0x, s0y, 1, s1y - s0y, shade(FIBER[1], 0.5, top));
    for (let by = top + 16; by < Math.min(bot, top + 260); by += 30) { const [bx, byy] = pt(0.5, by); box(c, bx - 1, byy, 3, 3, shade(STONE[5], 0.5, by)); }
  } else {
    const soil = 34;
    for (let j = 0; j < 4; j++) { q(j / 4, top, (j + 1) / 4, top + soil, shade(DIRT[3 - (j >> 1)], j / 4, top)); q(j / 4, top, (j + 1) / 4, top + 3, shade(GRASS[4], j / 4, top)); }
    let y = top + soil, row = 0;
    while (y < bot) {
      const rh = 22 + hash(e * 0.01 + row * 3.7) * 50;
      const split = [0, 0.1 + hash(e + row) * 0.3, 0.45 + hash(e + row * 2) * 0.2, 0.7 + hash(e + row * 3) * 0.25, 1];
      for (let j = 0; j < 4; j++) {
        const k0 = split[j], k1 = split[j + 1];
        q(k0, y, k1, Math.min(bot, y + rh), shade(STONE[2 + Math.floor(hash(e + row * 5 + j) * 3)], (k0 + k1) / 2, y));
        q(k0, y, k1, y + 3, shade(STONE[5], (k0 + k1) / 2, y));
        const [sx0, sy0] = pt(k0, y), [, sy1] = pt(k0, Math.min(bot, y + rh));
        box(c, sx0, sy0, 1, sy1 - sy0, 'rgba(10, 8, 6, 0.6)');
      }
      y += rh; row++;
    }
    for (let k = 0; k < 4; k++) {
      const d = 1 - (1 - FAR) * ((k + 0.5) / 4), [rx, ry] = at(eye, e, top, d), len = (12 + hash(e + k) * 30) * d;
      c.strokeStyle = mix(farTint(DIRT[2], 0.4, tod), haze, (1 - d) * 0.4); c.lineWidth = 2;
      c.beginPath(); c.moveTo(rx, ry + 4); c.quadraticCurveTo(rx + side * 4, ry + len * 0.5, rx + side, ry + len); c.stroke();
    }
  }
  const [x1, t1] = pt(1, top);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(e, top); c.lineTo(x1, t1); c.stroke();
};

// ---------------------------------------------------------------------------------------------------------------
// The play plane

/** The floor under him, painted flat (bent afterwards): the park's groomed trail along the line (edged, raked, a
 *  boot print, pebbles), then the meadow coming toward him (tufts, flowers, stones, a pine cone, needles); the lip lit;
 *  and the earth under all of it (not bent). */
const paintFloor = (g: Ctx, x0: number, w: number) => {
  const tod = timeOfDay();
  const D = DIRT.map(col => farTint(col, 0.2, tod)), G = GRASS.map(col => farTint(col, 0.2, tod)), L = LIP.map(col => farTint(col, 0.2, tod));
  const s = Math.floor(x0);
  // (the earth under it, banded darker going down, real rock in it)
  bandedGradient(g, x0, GY + BAND, w, SOIL - BAND, [D[2], D[1], D[1], D[0]], 5);
  for (let i = 0; i < w / 50; i++) { const rx = x0 + hash(s + i * 2.9) * w, ry = GY + BAND + 20 + hash(s + i * 3.7) * 200; pixelBlob(g, rx, ry, 10 + hash(i) * 8, 5 + hash(i * 2) * 3, STONE[2]); box(g, rx - 6, ry - 4, 8, 1, STONE[4]); }
  // (the trail: packed dirt, lighter where it's walked, banded)
  bandedGradient(g, x0, GY, w, 30, [D[5], D[4], D[4], D[3]], 4);
  // (the meadow coming toward him: banded darker nearer)
  bandedGradient(g, x0, GY + 30, w, BAND - 30, [G[4], G[3], G[3], G[2], G[2], G[1]], 7);
  // (the trail's ragged edge: tufts creeping in, dithered)
  checker(g, x0, GY + 28, w, 4, G[3], 0);
  for (let i = 0; i < w / 9; i++) { const tx = x0 + i * 9 + hash(s + i) * 6, th = 2 + hash(s + i * 1.3) * 4; box(g, tx, GY + 30 - th, 1, th, G[4]); box(g, tx + 1, GY + 30 - th + 1, 1, th - 1, G[5]); }
  // (on the trail: pebbles, rake lines, a boot print now and then)
  for (let i = 0; i < w / 6; i++) { const px = x0 + hash(s + i * 0.71) * w, py = GY + 4 + hash(s + i * 1.93) * 22; box(g, px, py, 2, 1, hash(s + i * 3.1) > 0.5 ? D[6] : D[2]); }
  for (let i = 0; i < w / 120; i++) { const bx = x0 + hash(s + i * 5.5) * w, by = GY + 8 + hash(s + i * 6.6) * 14; box(g, bx, by, 6, 3, D[2]); box(g, bx + 1, by + 3, 4, 1, D[2]); box(g, bx + 9, by + 1, 6, 3, D[2]); }
  // (the meadow: tufts (bigger nearer), flowers, stones, a cone, needles)
  for (let i = 0; i < w / 5; i++) {
    const tx = x0 + hash(s + i * 0.53) * w, ty = GY + 34 + hash(s + i * 1.37) ** 1.2 * (BAND - 38), sc = 1 + (ty - GY) / 60;
    const col = hash(s + i * 2.9) > 0.5 ? G[4] : G[5];
    box(g, tx, ty - 3 * sc, 1, 3 * sc, G[2]); box(g, tx + 1, ty - 4 * sc, 1, 4 * sc, col); box(g, tx + 2, ty - 2 * sc, 1, 2 * sc, G[3]);
  }
  const FL = ['#F4E06A', '#F2F0FA', '#C88ADC', '#F49A5A'];
  for (let i = 0; i < w / 30; i++) { const fx = x0 + hash(s + i * 4.1) * w, fy = GY + 36 + hash(s + i * 4.9) * (BAND - 44), sc = 1 + (fy - GY) / 70; box(g, fx, fy, 2 * sc, 2 * sc, farTint(FL[Math.floor(hash(s + i) * 4)], 0.2, tod)); box(g, fx + sc * 0.5, fy + sc * 2, 1, 2 * sc, G[2]); }
  for (let i = 0; i < w / 110; i++) {
    const sx = x0 + hash(s + i * 5.9) * w, sy = GY + 40 + hash(s + i * 7.3) * (BAND - 50), sc = 0.7 + (sy - GY) / 60;
    g.fillStyle = INK; g.beginPath(); g.ellipse(sx, sy, 8 * sc + 1, 4 * sc + 1, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = STONE[3]; g.beginPath(); g.ellipse(sx, sy, 8 * sc, 4 * sc, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = STONE[5]; g.beginPath(); g.ellipse(sx - 2 * sc, sy - 1.5 * sc, 4 * sc, 2 * sc, 0, 0, Math.PI * 2); g.fill();
    if (hash(s + i * 2.2) > 0.6) { box(g, sx + 10 * sc, sy - 3 * sc, 4 * sc, 6 * sc, D[3]); for (let k = 0; k < 3; k++) box(g, sx + 10 * sc, sy - 3 * sc + k * 2 * sc, 4 * sc, 1, D[5]); }
  }
  for (let i = 0; i < w / 4; i++) { const nx = x0 + hash(s + i * 0.31) * w, ny = GY + 32 + hash(s + i * 0.77) * (BAND - 34); box(g, nx, ny, 2, 1, hash(s + i) > 0.5 ? D[4] : G[1]); }
  // (the lip: grass along the line, lit, blades sticking up out of it)
  box(g, x0, GY, w, 4, L[1]); box(g, x0, GY, w, 2, L[2]); box(g, x0, GY, w, 1, L[3]);
  checker(g, x0, GY + 4, w, PIX, L[1]);
  for (let i = 0; i < w / 6; i++) { const gx = x0 + i * 6 + hash(s + i) * 4, gh = 3 + hash(s + i * 1.7) * 6; box(g, gx, GY - gh, 1, gh, G[4]); box(g, gx + 1, GY - gh + 2, 1, gh - 2, L[2]); }
};

/** A raised run's face at the play plane, painted into its chunk (clipped to the run's top line): the lip (grass, or
 *  the fiberglass's worn paint), and under it fiberglass in molded courses with seams and bolts, or dirt over rock. */
const paintFace = (g: Ctx, r: Run, x0: number, w: number, top: number) => {
  const tod = timeOfDay(), seed = Math.floor(x0 * 0.37);
  const yAt = (x: number) => r.ya + (r.yb - r.ya) * ((x - r.a) / Math.max(1, r.b - r.a));
  g.save(); g.beginPath(); g.moveTo(x0, yAt(x0)); g.lineTo(x0 + w, yAt(x0 + w)); g.lineTo(x0 + w, GY + 2); g.lineTo(x0, GY + 2); g.closePath(); g.clip();
  if (r.fiber) {
    fiberglass(g, x0, top, w, GY + 2 - top, FIBER.map(col => farTint(col, 0.2, tod)), seed);
    hazeBands(g, x0, top + (GY - top) * 0.55, w, (GY - top) * 0.45, '#0A0806', 0, 0.35, 5);
  } else {
    const D = DIRT.map(col => farTint(col, 0.2, tod)), S = STONE.map(col => farTint(col, 0.2, tod));
    box(g, x0, top, w, GY + 2 - top, D[3]);
    // (dirt in strata following the slope, stones bedded in it, roots)
    for (let k = 0; k < 12; k++) {
      g.fillStyle = k % 2 ? D[2] : D[4];
      g.beginPath(); g.moveTo(x0, yAt(x0) + 14 + k * 22); g.lineTo(x0 + w, yAt(x0 + w) + 14 + k * 22); g.lineTo(x0 + w, yAt(x0 + w) + 18 + k * 22); g.lineTo(x0, yAt(x0) + 18 + k * 22); g.closePath(); g.fill();
    }
    for (let i = 0; i < w / 30; i++) {
      const sx = x0 + hash(seed + i * 1.3) * w, sy = yAt(sx) + 20 + hash(seed + i * 2.7) * (GY - yAt(sx) - 24), rw = 6 + hash(seed + i) * 10;
      if (sy > GY - 6) continue;
      g.fillStyle = INK; g.beginPath(); g.ellipse(sx, sy, rw + 1, rw * 0.6 + 1, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = S[3]; g.beginPath(); g.ellipse(sx, sy, rw, rw * 0.6, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = S[5]; g.beginPath(); g.ellipse(sx - rw * 0.3, sy - rw * 0.2, rw * 0.45, rw * 0.25, 0, 0, Math.PI * 2); g.fill();
    }
    for (let i = 0; i < w / 50; i++) { const rx = x0 + hash(seed + i * 4.4) * w, ry = yAt(rx) + 6, len = 10 + hash(seed + i * 5.5) * 26; for (let y = 0; y < len; y += 2) box(g, rx + Math.sin(y * 0.3 + i) * 2, ry + y, 2, 2, D[1]); }
    hazeBands(g, x0, top + 30, w, GY - top - 30, '#0A0604', 0, 0.3, 5);
  }
  g.restore();
  // (the lip along its top: lit; tufts on the meadow's, the paint worn pale on the fiberglass)
  const L = (r.fiber ? FIBER_LIP : LIP).map(col => farTint(col, 0.2, tod)), G = GRASS.map(col => farTint(col, 0.2, tod));
  for (let x = x0; x < x0 + w; x += 2) {
    const y = Math.round(yAt(x));
    box(g, x, y - 1, 2, 1, INK); box(g, x, y, 2, 4, L[1]); box(g, x, y, 2, 2, L[2]); box(g, x, y, 2, 1, L[3]);
    if (!r.fiber && hash(seed + x * 0.7) > 0.55) { const gh = 3 + hash(x) * 5; box(g, x, y - gh, 1, gh, G[4]); box(g, x + 1, y - gh + 2, 1, gh - 2, L[2]); }
  }
};

export const drawPlayPlane = (c: Ctx, v: View) => {
  const tod = timeOfDay();
  // The floor under him (stamped in chunks, flat, then bent: each stretch on its own, kept to its own ends: it used
  // to fan out past them over the water and the ravine, under the logs, the swimmers and what's down there (the
  // playtest's perspective notes); the near bank shows where it's cut, from the open side)
  const CH = 512;
  for (const [a, b] of FLOOR) {
    if (b < v.v0 - 200 || a > v.v1 + 200) continue;
    for (let x = a, i = 0; x < b; x += CH, i++) {
      const w = Math.min(CH, b - x);
      if (x + w < v.v0 || x > v.v1) continue;
      stamp(c, `fw-floor-${a}-${i}-${tod.key}`, x, GY - 10, w, SOIL + 10, g => paintFloor(g, x, w));
    }
    bendFloor(c, v.eye, GY, GY, GY + BAND, Math.max(a, v.v0 - 40), Math.min(b, v.v1 + 40));
  }
  // The raised ground's faces (stamped in chunks: the bluffs, the islands, the hill, the cliff past the falls)
  for (const r of RUNS) {
    if (!raised(r) || r.rx >= STATION_RX || r.b < v.v0 || r.a > v.v1) continue;
    const top = Math.min(r.ya, r.yb);
    for (let x = r.a, i = 0; x < r.b; x += 256, i++) {
      const w = Math.min(256, r.b - x);
      if (x + w < v.v0 || x > v.v1) continue;
      stamp(c, `fw-face-${r.rx}-${i}-${tod.key}`, x, top - 12, w, GY - top + 16, g => paintFace(g, r, x, w, top));
    }
  }
  // The near banks: where the floor coming toward him stops (the water, the ravine), its edge going down
  for (const p of GAPS) {
    if (p.b < v.v0 - 300 || p.a > v.v1 + 300) continue;
    nearBank(c, v, p.a, 1, p.water);
    nearBank(c, v, p.b, -1, p.water);
    if (!p.water) {
      const mist = mix(skyAt(0.9, tod), '#FFFFFF', 0.3);
      c.save(); c.beginPath(); c.rect(p.a, v.top, p.b - p.a, v.bot - v.top); c.clip();
      hazeBands(c, p.a, GY - 70, p.b - p.a, 90, mist, 0, 0.12, 5);
      c.restore();
    }
  }
};

/** A near bank: the floor's edge (bent like the floor) and the earth and rock under it; down to the water's surface
 *  (it's under there) or into the dark. */
const nearBank = (c: Ctx, v: View, e: number, side: 1 | -1, water: boolean) => {
  const ex = v.eye.x;
  if ((ex - e) * side <= 1) return;
  const Y1 = GY + BAND + 60;
  const edge = (y: number) => ex + (e - ex) * (1 + (y - GY) * BEND);
  const N = 12, pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) { const y = GY + ((Y1 - GY) * i) / N; pts.push([edge(y), y]); }
  const band = (s0: number, s1: number, col: string) => poly(c, [...pts.map(([x, y]) => [x, y + s0] as [number, number]), ...pts.slice().reverse().map(([x, y]) => [x, y + s1] as [number, number])], col);
  const tod = timeOfDay();
  const D = DIRT.map(col => farTint(col, 0.2, tod)), R = STONE.map(col => farTint(col, 0.2, tod)), L = LIP.map(col => farTint(col, 0.2, tod));
  const depth = water ? 26 : 480;
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
  // (grass hanging over the edge)
  for (let k = 0; k < 8; k++) { const y = GY + 6 + hash(e + k * 1.7) * (BAND - 20), x = edge(y); box(c, x + side * 1, y, 2, 4 + hash(e + k) * 5, L[1]); }
};

/** The railroad tracks from the last mile on (the play plane: the rails lie along it; the ties going back a little
 *  under them, on the ballast). */
export const drawTracks = (c: Ctx, v: View, xa: number, xb: number) => {
  const tod = timeOfDay(), eye = v.eye, y = GY;
  if (xb < v.v0 || xa > v.v1) return;
  const a = Math.max(xa, v.v0), b = Math.min(xb, v.v1);
  const P = hr('tie', ['#1E1008', '#3A2412', '#56381E', '#704C2A', '#8C6236']), S = hr('steel', STEEL);
  // (the ballast: gravel along the bed, going back)
  const [ga, gay] = at(eye, a, y, 0.9), [gb] = at(eye, b, y, 0.9);
  poly(c, [[a, y], [b, y], [gb, gay], [ga, gay]], farTint('#6A6258', 0.3, tod));
  for (let x = Math.floor(a / 8) * 8; x < b; x += 8) { const d = 0.9 + hash(x * 0.3) * 0.1, [sx, sy] = at(eye, x + hash(x) * 6, y, d); box(c, sx, sy, 2, 1, hash(x * 1.7) > 0.5 ? farTint('#8E867A', 0.3, tod) : farTint('#4A443C', 0.3, tod)); }
  // (the ties: going back from the play plane, each lit along its top)
  for (let x = Math.ceil(a / 22) * 22; x < b; x += 22) {
    poly(c, [at(eye, x, y, 1), at(eye, x + 12, y, 1), at(eye, x + 12, y, 0.91), at(eye, x, y, 0.91)], P[2]);
    const [lx, ly] = at(eye, x, y, 0.995), [rx] = at(eye, x + 12, y, 0.995);
    box(c, lx, ly - 1, rx - lx, 1, P[4]);
    box(c, x, y - 1, 12, 2, P[1]);
  }
  // (the rails: the far one, then the near one; their heads lit)
  for (const d of [0.93, 0.985]) {
    const [ra, ry] = at(eye, a, y, d), [rb] = at(eye, b, y, d);
    box(c, ra, ry - 5, rb - ra, 5, S[2]); box(c, ra, ry - 5, rb - ra, 2, S[5]); box(c, ra, ry - 5, rb - ra, 1, S[6]); box(c, ra, ry, rb - ra, 1, INK);
    for (let x = Math.ceil(a / 22) * 22 + 6; x < b; x += 22) { const [sx, sy] = at(eye, x, y, d); box(c, sx - 1, sy - 1, 3, 2, S[1]); }
  }
};
