// The woods' ground and its trees, in fake 3D (one eye for the scene: the wilds' and the jungle's way). Back to front:
// the river at the left end (the dead end: no way back to the crew's clearing, the bank drops into the water and a
// thicket closes it off), the forest floor going back from the trail (duff, needles and turned leaves, banded darker
// and hazier the further; the kids' lot open packed dirt), the woods' back rank at its far edge (a wall of real firs,
// spruce, gold aspens, snags and undergrowth, the log ride's real bank's trees), the trees between (every one
// different), the big ones by the trail; then at the play plane the trail itself coming toward him (packed dirt, ruts,
// roots across it, stones, needles at its edges: bent the SNES way, kept to its own ground) with its lit lip.

import { GY } from '../geometry';
import { fern } from '../wilds/paint';
import { bendFloor } from '../../intro/art/kit';
import {
  type Ctx, type View, box, checker, mix, hash, stillAt, at, atDepth, poly, clump, bands, pine, INK, hr, timeOfDay, skyAt, FAR,
  DIRT, GRASS, GRANITE, MOSS, RIVER, OAK, LIP, BARK, NEEDLE, DUFF, GOLD, BROWN, paintTree, treeBox, bush, type TreeKind,
} from './paint';
import { x0, x1, X, CP_LOT, SIGN_TREE } from './layout';

/** How far toward him the floor under his feet comes (bent); under that, the earth, not bent. */
const BAND = 160, SOIL = 420;
/** The lot's open dirt (world x). */
const LOT_A = X(CP_LOT) + 40, LOT_B = x1 + 200;
/** The river at the dead end: its surface a little under the ground. */
const RIVER_Y = GY + 26;

/** Is the world point at depth d on screen (by where it's drawn)? */
const seenAt = (v: View, a: number, b: number, d: number, pad = 80) => {
  const [sa] = at(v.eye, a, GY, d), [sb] = at(v.eye, b, GY, d);
  return sb > v.cam.x - pad && sa < v.cam.x + 800 + pad;
};

// ---------------------------------------------------------------------------------------------------------------
// Going back

/** The river at the left end, the forest floor going back, what's lying on it; the bank's cut down to the water. */
export const drawGoingBack = (c: Ctx, v: View) => {
  const tod = timeOfDay(), eye = v.eye, haze = skyAt(0.9, tod), f = v.f;
  const pt = (x: number, y: number, d: number) => at(eye, x, y, d);
  const xa = Math.max(x0, v.v0 - 200), xb = Math.min(LOT_B, v.v1 + 200);
  // ---- the river past the dead end (only while the left end's near): its surface going back, banded, glints riding by
  if (v.cam.x < x0 + 400) {
    const Rv = hr('river', RIVER, 0.16);
    for (let i = 0; i < 5; i++) {
      const d0 = 1 - ((1 - FAR) * i) / 5, d1 = 1 - ((1 - FAR) * (i + 1)) / 5;
      poly(c, [pt(x0 - 800, RIVER_Y, d0), pt(x0, RIVER_Y, d0), pt(x0, RIVER_Y, d1), pt(x0 - 800, RIVER_Y, d1)], mix(Rv[5 - Math.min(3, i)], haze, i * 0.05));
    }
    for (let k = 0; k < 10; k++) {
      const d = 1 - (1 - FAR) * ((k % 5) + 0.5) / 5, wx = x0 - 30 - (((k * 53 + f * 0.8) % 300));
      const [sx, sy] = pt(wx, RIVER_Y, d);
      box(c, Math.round(sx), Math.round(sy), Math.round(12 * d), 1, k % 3 ? Rv[7] : '#F0F8F4');
    }
  }
  // ---- the forest floor: banded going back (duff and needles; the lot packed dirt), hazier the further
  const Df = hr('duff', DUFF, 0.4), Dl = hr('dirt', DIRT, 0.4);
  for (let i = 0; i < 5; i++) {
    const d0 = 1 - ((1 - FAR) * i) / 5, d1 = 1 - ((1 - FAR) * (i + 1)) / 5;
    const duff = mix([Df[4], Df[3], Df[3], Df[2], Df[2]][i], haze, i * 0.05), dirt = mix([Dl[5], Dl[4], Dl[4], Dl[3], Dl[3]][i], haze, i * 0.05);
    const a = xa, l = Math.min(xb, LOT_A), r = xb;
    if (l > a) poly(c, [pt(a, GY, d0), pt(l, GY, d0), pt(l, GY, d1), pt(a, GY, d1)], duff);
    if (r > LOT_A && LOT_A < xb) poly(c, [pt(Math.max(a, LOT_A), GY, d0), pt(r, GY, d0), pt(r, GY, d1), pt(Math.max(a, LOT_A), GY, d1)], dirt);
    const [lx, ly] = pt(a, GY, d1), [rx] = pt(r, GY, d1);
    checker(c, lx, ly, rx - lx, 2, mix([Df[3], Df[3], Df[2], Df[2], Df[1]][i], haze, (i + 1) * 0.05));
  }
  // (the lot's edge: a ragged seam of duff into the dirt, going back)
  if (LOT_A > v.v0 - 300 && LOT_A < v.v1 + 300) for (let k = 0; k < 12; k++) {
    const d = 1 - (1 - FAR) * (k + 0.5) / 12, [sx, sy] = pt(LOT_A + (hash(k * 3.3) - 0.5) * 40, GY, d);
    box(c, Math.round(sx - 10 * d), Math.round(sy), Math.round((14 + hash(k) * 16) * d), 2, mix(Df[3], haze, (1 - d) * 0.4));
  }
  // ---- what's lying on it: turned leaves, needles in drifts, stones, a fern; tire ruts going back across the lot
  const G = hr('gold', GOLD, 0.5), Br = hr('brown', BROWN, 0.5), Gr = hr('granite', GRANITE, 0.5), Gs = hr('grass', GRASS, 0.5);
  for (let gx = Math.floor((Math.max(x0, v.v0 - 300)) / 40) * 40; gx < v.v1 + 300; gx += 40) for (let row = 0; row < 5; row++) {
    const hs = gx * 0.017 + row * 6.3, wx = gx + hash(hs) * 36;
    if (wx < x0 + 4) continue;
    const d = 1 - (1 - FAR) * ((row + 0.25 + hash(hs * 1.7) * 0.5) / 5), [sx, sy] = pt(wx, GY, d), k = hash(hs * 2.3), fade = (1 - d) * 0.5;
    const lot = wx > LOT_A;
    if (lot) {
      if (k < 0.5) { box(c, Math.round(sx), Math.round(sy), Math.round((18 + k * 30) * d), 1, mix(Dl[2], haze, fade)); box(c, Math.round(sx), Math.round(sy) + 1, Math.round((18 + k * 30) * d), 1, mix(Dl[6], haze, fade)); }
      else if (k < 0.62) { box(c, Math.round(sx), Math.round(sy - 2 * d), Math.max(2, Math.round(4 * d)), Math.max(1, Math.round(2 * d)), mix(Gr[4], haze, fade)); }
      continue;
    }
    if (k < 0.45) { box(c, Math.round(sx), Math.round(sy), Math.max(2, Math.round(3 * d)), Math.max(1, Math.round(2 * d)), mix(k < 0.25 ? G[4] : Br[4], haze, fade)); box(c, Math.round(sx + 5 * d), Math.round(sy + 1), Math.max(2, Math.round(3 * d)), 1, mix(G[5], haze, fade)); }
    else if (k < 0.6) { c.fillStyle = mix(Df[5], haze, fade); c.beginPath(); c.ellipse(Math.round(sx), Math.round(sy), (8 + k * 10) * d, 1.6 * d, 0, 0, Math.PI * 2); c.fill(); }
    else if (k < 0.68) { box(c, Math.round(sx), Math.round(sy - 3 * d), Math.max(2, Math.round(6 * d)), Math.max(2, Math.round(3 * d)), mix(Gr[3], haze, fade)); box(c, Math.round(sx), Math.round(sy - 3 * d), Math.max(1, Math.round(3 * d)), 1, mix(Gr[6], haze, fade)); }
    else if (k < 0.74) { for (let t = 0; t < 3; t++) box(c, Math.round(sx + (t - 1) * 2 * d), Math.round(sy - (4 + t % 2 * 2) * d), 1, Math.max(2, Math.round((4 + t % 2 * 2) * d)), mix(Gs[3 + (t % 2)], haze, fade)); }
  }
  // ---- the bank at the dead end: its cut going back down to the water (dirt over cobbles, roots hanging out of it)
  if (eye.x > x0 + 1 && v.cam.x < x0 + 500) {
    const D = hr('dirt', DIRT, 0.3), R = hr('granite', GRANITE, 0.3), L = hr('lip', LIP, 0.3);
    const q = (k0: number, y0: number, k1: number, y1: number, col: string) => poly(c, [pt(x0, y0, 1 - (1 - FAR) * k0), pt(x0, y0, 1 - (1 - FAR) * k1), pt(x0, y1, 1 - (1 - FAR) * k1), pt(x0, y1, 1 - (1 - FAR) * k0)], col);
    for (let j = 0; j < 6; j++) {
      const k0 = j / 6, k1 = (j + 1) / 6, hz = (col: string) => mix(col, haze, k0 * 0.25);
      q(k0, GY, k1, GY + 12, hz(D[3])); q(k0, GY + 12, k1, RIVER_Y, hz(R[2 + (j % 2)])); q(k0, GY, k1, GY + 2, hz(L[2]));
      const [rx, ry] = pt(x0, GY + 4, 1 - (1 - FAR) * (k0 + 0.08));
      box(c, Math.round(rx - 1), Math.round(ry), 1, 8, hz(D[1]));
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The trees

/** The woods' back rank (a tile, the same all along, cut to the ground): a wall of real firs and spruce, gold aspens,
 *  a snag, and the undergrowth along its foot (bushes, ferns, a deadfall), dimmed into the hazy air. */
const TW = 640;
const paintBackRank = (g: Ctx) => {
  const tod = timeOfDay(), haze = skyAt(0.9, tod);
  const dim = (R: string[], k = 0.3) => R.map(col => mix(mix(col, '#1A2430', 0.14), haze, k));
  const N = dim(hr('needle', NEEDLE, 0.4)), B = dim(hr('bark', BARK, 0.4));
  const fir = N.map(col => mix(col, '#0A1A0A', 0.12)), spr = N.map(col => mix(col, '#2A4A5A', 0.2)), Au = dim(hr('gold', GOLD, 0.4), 0.26);
  // (the deep ones behind: a ragged crest, darker)
  const back = N.map(col => mix(col, '#0A1410', 0.35));
  for (let i = 0; i < 18; i++) { const x = i * 36 + hash(i * 1.3) * 20, h = 210 + hash(i * 2.7) * 120; for (const xx of [x, x - TW, x + TW]) if (xx > -80 && xx < TW + 80) { g.fillStyle = back[1]; g.beginPath(); g.moveTo(xx, -h); g.lineTo(xx + h * 0.16, -20); g.lineTo(xx - h * 0.16, -20); g.closePath(); g.fill(); g.fillStyle = back[2]; g.beginPath(); g.moveTo(xx, -h); g.lineTo(xx - h * 0.16, -20); g.lineTo(xx - h * 0.05, -20); g.closePath(); g.fill(); } }
  box(g, -80, -40, TW + 160, 40, back[1]);
  // (the rank: firs, spruce, an aspen stand gone gold, a snag)
  const kinds: ('fir' | 'spruce' | 'aspen' | 'snag')[] = ['fir', 'spruce', 'fir', 'aspen', 'spruce', 'fir', 'snag', 'spruce', 'aspen', 'fir', 'fir', 'spruce'];
  for (let i = 0; i < kinds.length; i++) {
    const x = 20 + i * (TW / kinds.length) + hash(i * 4.4) * 30, h = 180 + hash(i * 3.9) * 110, k = kinds[i];
    for (const xx of [x, x - TW, x + TW]) {
      if (xx < -120 || xx > TW + 120) continue;
      if (k === 'fir' || k === 'spruce') pineIn(g, xx, h, h * (k === 'fir' ? 0.36 : 0.3), i * 13, k === 'fir' ? fir : spr, B);
      else if (k === 'aspen') { const th = h * 0.7; box(g, xx - 3, -th, 6, th, INK); box(g, xx - 2, -th, 4, th, mix('#D8D4C8', haze, 0.3)); for (let e = 0; e < 7; e++) box(g, xx - 2 + (e % 2) * 2, -th + 8 + e * th / 8, 2, 1, mix('#2A2620', haze, 0.3)); clump(g, xx, -th - 6, 30, 26, i * 7, Au, 0); clump(g, xx - 16, -th + 14, 18, 14, i * 7 + 3, Au, 1); }
      else { const sh = h * 0.6, S = dim(['#2A2824', '#4A4640', '#6E6860', '#8E887E', '#B0AAA0', '#D0CAC0']); box(g, xx - 4, -sh, 8, sh, INK); box(g, xx - 3, -sh, 6, sh, S[3]); box(g, xx - 3, -sh, 2, sh, S[5]); for (let e = 0; e < 5; e++) box(g, e % 2 ? xx + 3 : xx - 11, -sh * 0.85 + e * sh * 0.14, 8, 2, S[2]); }
    }
  }
  // (the undergrowth along its foot: bushes, ferns, a deadfall log)
  const O = dim(hr('oak', OAK, 0.4)).map(col => mix(col, '#1A2A1A', 0.25)), Gs = dim(hr('grass', GRASS, 0.4));
  for (let i = 0; i < 16; i++) { const x = i * 40 + hash(i * 1.9) * 20; for (const xx of [x, x - TW, x + TW]) if (xx > -40 && xx < TW + 40) clump(g, xx, -12, 22 + hash(i) * 12, 14, i * 5 + 1, O, 1); }
  box(g, 210, -12, 90, 9, INK); box(g, 211, -11, 88, 7, B[3]); box(g, 211, -11, 88, 2, B[5]); box(g, 296, -12, 6, 9, mix('#C8A070', haze, 0.3));
  for (let i = 0; i < 14; i++) fern(g, i * 46 + hash(i * 5.3) * 20, 0, 14 + hash(i) * 10, i * 3 + 1, 0, Gs, 3);
};
/** A pine painted in a tile (the shared painter, its foot at (x, 0)). */
const pineIn = (g: Ctx, x: number, h: number, w: number, seed: number, N: string[], B: string[]) => pine(g, x, 0, h, w, seed, N, B);

/** A tree stood back between the rank and the trail: [x from the section's start, kind, height, depth]. */
interface Tree { rx: number; k: TreeKind; h: number; d: number }
const TREES: Tree[] = (() => {
  const out: Tree[] = [];
  const mid: TreeKind[] = ['fir', 'spruce', 'gold', 'fir', 'snag', 'spruce', 'aspen', 'fir', 'lean', 'gold', 'spruce', 'fir'];
  for (let rx = 30; rx < 3150; rx += 70 + Math.floor(hash(rx) * 60)) {
    if (rx > CP_LOT + 300 && rx < 3000 && hash(rx + 2) < 0.55) continue;
    out.push({ rx, k: mid[Math.floor(hash(rx * 3.1) * mid.length)], h: 170 + hash(rx + 1) * 110, d: 0.78 + hash(rx * 1.7) * 0.06 });
  }
  // (the big ones by the trail, their crowns up out of the frame; none on the lot, none on the sign's tree)
  for (let rx = 60; rx < 3150; rx += 140 + Math.floor(hash(rx * 2.3) * 60)) {
    if (rx > CP_LOT - 40 && rx < 2950) continue;
    if (Math.abs(rx - SIGN_TREE) < 90) continue;
    const k: TreeKind = hash(rx + 5) > 0.72 ? 'gold' : hash(rx + 5) > 0.36 ? 'fir' : 'spruce';
    out.push({ rx, k, h: 300 + hash(rx + 4) * 80, d: 0.9 + hash(rx * 2.9) * 0.04 });
  }
  return out.sort((p, q) => p.d - q.d);
})();

/** The back rank and the trees, deepest first, up to depth `dMax` (the poles and the lot's props go in among them). */
export const drawTrees = (c: Ctx, v: View, dMin: number, dMax: number) => {
  const eye = v.eye;
  if (dMin <= FAR) atDepth(c, eye, FAR, () => {
    c.save(); c.beginPath(); c.rect(x0, GY - 420, x1 - x0 + 400, 422); c.clip();
    for (let tx = Math.floor((v.v0 - 400) / TW) * TW; tx < v.v1 + 400; tx += TW) {
      if (!seenAt(v, tx - 120, tx + TW + 120, FAR)) continue;
      stillAt(c, 'wd-backrank', tx, GY, -120, -420, TW + 240, 422, paintBackRank);
    }
    c.restore();
  });
  for (const t of TREES) {
    if (t.d < dMin || t.d >= dMax) continue;
    const [bx, , bw] = treeBox(t.k, t.h);
    if (!seenAt(v, X(t.rx) + bx, X(t.rx) + bx + bw, t.d)) continue;
    atDepth(c, eye, t.d, () => { const [tbx, tby, tbw, tbh] = treeBox(t.k, t.h); stillAt(c, `wd-tree-${t.k}-${t.rx}`, X(t.rx), GY, tbx, tby, tbw, tbh, g => paintTree(g, t.k, t.rx, t.h)); });
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The trail coming toward him

const CHUNK = 512;
const paintFloor = (g: Ctx, wx: number, w: number) => {
  const D = hr('dirt', DIRT, 0.2), Df = hr('duff', DUFF, 0.2), L = hr('lip', LIP, 0.2), G = hr('gold', GOLD, 0.2), Br = hr('brown', BROWN, 0.2), R = hr('granite', GRANITE, 0.2), B = hr('bark', BARK, 0.2), Ms = hr('moss', MOSS, 0.2);
  // (the earth: the trail's packed dirt banded down into the dark soil)
  bands(g, 0, 0, w, BAND, [D[4], D[4], D[3], D[3], D[3], D[2]]);
  bands(g, 0, BAND, w, SOIL - BAND, [D[2], D[1], D[1], D[0], D[0]]);
  for (let x = 0; x < w; x += 2) {
    const lot = wx + x > LOT_A;
    // (the duff over the trail's edges: needles and leaves drifted in, the lot bare)
    if (!lot) { const k = hash((wx + x) * 0.37); box(g, x, 0, 2, 6 + k * 8, k > 0.6 ? Df[4] : Df[3]); if (k > 0.8) box(g, x, 6 + k * 8, 2, 2, Df[2]); }
  }
  // (two ruts worn down the trail (the lot's tire tracks across it), lit along their far lips)
  for (const [ry, rh] of [[22, 6], [52, 8], [96, 10]] as const) {
    box(g, 0, ry, w, rh, D[2]); box(g, 0, ry, w, 1, D[1]); box(g, 0, ry + rh, w, 1, D[5]);
    checker(g, 0, ry + rh - 2, w, 2, D[3], ry % 2);
  }
  // (knobby tread marks on the lot)
  for (let x = 0; x < w; x += 6) if (wx + x > LOT_A) { box(g, x, 24, 3, 2, D[1]); box(g, x + 2, 55, 3, 2, D[1]); box(g, x + 1, 99, 4, 3, D[1]); }
  // (stones, pebbles, a root across the trail, leaves and needles on it)
  for (let n = 0; n < w / 7; n++) {
    const x = hash(wx * 0.01 + n * 1.3) * w, y = 8 + hash(wx * 0.02 + n * 2.9) * (BAND + 80), r = 1 + hash(n + wx) * 4;
    box(g, x - r, y - r * 0.6, r * 2, r * 1.2, INK); box(g, x - r + 1, y - r * 0.6 + 1, r * 2 - 2, r * 1.2 - 2, R[3 + (n % 2)]); box(g, x - r + 1, y - r * 0.6 + 1, r, 1, R[6]);
  }
  for (let n = 0; n < w / 40; n++) {
    if (wx + n * 40 > LOT_A) break;
    const x = hash(wx + n * 7.1) * w, y = 4 + hash(n * 3.7 + wx) * 30;
    g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 30, y + 20); g.quadraticCurveTo(x, y - 4, x + 34, y + 16); g.stroke();
    g.strokeStyle = B[3]; g.lineWidth = 3; g.stroke(); g.strokeStyle = B[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 28, y + 18); g.quadraticCurveTo(x, y - 5, x + 32, y + 14); g.stroke();
  }
  for (let n = 0; n < w / 5; n++) {
    const x = hash(wx * 0.03 + n * 0.71) * w, y = 2 + hash(n * 1.37 + wx * 0.05) * 140, k = hash(n * 4.9 + wx);
    if (wx + x > LOT_A && k < 0.8) continue;
    if (k < 0.5) { box(g, x, y, 3, 2, k < 0.28 ? G[4] : Br[4]); box(g, x, y, 1, 1, G[6]); }
    else box(g, x, y, 4, 1, Df[5]);
  }
  for (let n = 0; n < w / 60; n++) { const x = hash(wx + n * 11.1) * w; if (wx + x < LOT_A) { box(g, x, 2, 8, 2, Ms[4]); box(g, x + 2, 1, 4, 1, Ms[5]); } }
  // (the lit lip along the top: his to stand on: duff and grass catching the light, tufts up over it)
  for (let x = 0; x < w; x += 2) {
    box(g, x, -1, 2, 1, INK); box(g, x, 0, 2, 3, L[1]); box(g, x, 0, 2, 2, L[2]); box(g, x, 0, 2, 1, L[3]);
    const k = hash((wx + x) * 0.71);
    if (wx + x < LOT_A && k > 0.62) { const gh = 3 + hash(x + wx) * 6; box(g, x, -gh, 1, gh, k > 0.85 ? G[5] : L[2]); box(g, x + 1, -gh + 2, 1, gh - 2, L[1]); }
  }
};

/** The trail under his feet: stamped in chunks, then bent (kept to the woods' own ground: none past its left end). */
export const drawPlayFloor = (c: Ctx, v: View) => {
  for (let x = x0, i = 0; x < x1 + 200; x += CHUNK, i++) {
    const w = Math.min(CHUNK, x1 + 200 - x);
    if (x + w < v.v0 || x > v.v1) continue;
    stillAt(c, `wd-floor-${i}`, x, GY, 0, -10, w, SOIL + 10, g => paintFloor(g, x, w));
  }
  bendFloor(c, v.eye, GY, GY, GY + BAND, Math.max(x0, v.v0 - 40), Math.min(x1 + 200, v.v1 + 40));
};

// ---------------------------------------------------------------------------------------------------------------
// The dead end (the left end: no way back)

/** Behind him: the thicket on the bank at the left end (willow and alder over a tangle of brush and deadfall, so thick
 *  nothing gets through), the river showing past it. */
export const drawDeadEndBack = (c: Ctx, v: View) => {
  if (v.cam.x > x0 + 300) return;
  atDepth(c, v.eye, 0.86, () => stillAt(c, 'wd-deadend-back', x0, GY, -160, -260, 300, 262, g => {
    const B = hr('bark', BARK, 0.24);
    // (willow and alder stems up out of it, a leaning dead alder)
    for (let i = 0; i < 9; i++) { const sx = -140 + i * 26 + hash(i) * 10, sh = 150 + hash(i * 3) * 90; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(sx, 0); g.quadraticCurveTo(sx + 10, -sh * 0.5, sx + (hash(i * 7) - 0.3) * 40, -sh); g.stroke(); g.strokeStyle = B[3 + (i % 2)]; g.lineWidth = 2; g.stroke(); }
    for (let i = 0; i < 7; i++) bush(g, -130 + i * 34, -110 - hash(i * 2) * 70, 30, 34, i * 9 + 2, 0.15);
    for (let i = 0; i < 8; i++) bush(g, -150 + i * 34, 0, 36, 60, i * 5 + 7, 0.3);
  }));
};
/** In front of him: the brush he walks into at the very end (thick, up past his head: it reads as a wall). */
export const drawDeadEndFront = (c: Ctx, v: View) => {
  if (v.cam.x > x0 + 120) return;
  stillAt(c, 'wd-deadend-front', x0, GY, -90, -190, 150, 196, g => {
    const B = hr('bark', BARK, 0.2);
    // (a deadfall jammed in it, root wad and all; stems; leaves in tiers up past his head)
    for (let i = 0; i < 6; i++) { const sx = -70 + i * 16, sh = 120 + hash(i * 5) * 60; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(sx, 4); g.lineTo(sx + (hash(i) - 0.5) * 30, -sh); g.stroke(); g.strokeStyle = B[3]; g.lineWidth = 2; g.stroke(); }
    bush(g, -40, -120, 70, 70, 41, 0.1); bush(g, -10, -70, 60, 64, 43, 0.15); bush(g, -50, -40, 70, 60, 47, 0.2); bush(g, 10, 4, 54, 46, 49, 0.25);
    g.save(); g.translate(-10, -18); g.rotate(-0.5);
    box(g, -10, -6, 90, 12, INK); box(g, -9, -5, 88, 10, B[3]); box(g, -9, -5, 88, 3, B[5]); box(g, -9, 3, 88, 2, B[1]);
    g.restore();
  });
};
