// The catch-up and the arena, drawn (the final pass: peak SNES). Straight on from the woods' and the chase's side view:
// the same REAL woods past the park, the same kit (woods/paint.ts: the log ride's real side's ramps for the hour, its
// firs, spruce, gold aspens and snags), the same far off (woods/far.ts: the real sky, the Rockies, the clear-cut ridge).
// One eye for the scene: the forest floor going back from the trail, banded darker and hazier, opening out into a dry
// autumn meadow round the clearing and the glade; the woods' back rank as a cached tile; the trees between (every one
// different, deepest first, culled by where they're drawn), thinned out where it opens up; the big ones by the trail;
// a real Forest Service sign before the glade (YOU ARE IN GRIZZLY COUNTRY, and the county's lion notice under it). The
// trail coming toward him, stamped and bent within its own ground, peters out into the clearing's grass, its lit lip
// all along. At the play plane: THE OAK (a giant bur oak gone russet and gold, its bark in deep plates, its roots
// spread), its pointed branch (tucker.ts's bough), the stolen bike wrecked under it; the axe tree (a tall fir, the axe
// in it; the stump, the cut, the trunk down along the ground: scenery, nothing to stand on); the granite boulder (a
// ledge, its lit lip). No park lettering out here.

import type { GameState } from '../../../m1/game/core/state';
import { signText, signW } from '../../signLetters';
import { bendFloor } from '../../intro/art/kit';
import { drawWoodsFar } from '../woods/far';
import {
  type Ctx, type View, type TreeKind, box, checker, mix, hash, bands, hr, INK, timeOfDay, skyAt, viewOf, at, atDepth, seen,
  paintTree, treeBox, bush, clump, pine, poly, pixelBlob, leafAt, firOf, printed, FAR, ASPEN, SNAG,
  DIRT, DUFF, LIP, GOLD, BROWN, GRANITE, BARK, NEEDLE, MOSS, GRASS, RINGS, STEEL, OAK,
} from '../woods/paint';
import { still as put, fern, rampOf, extrude } from '../wilds/paint';
import { onScreen } from '../kit';
import { drawBough, drawTuckerCap } from '../tucker';
import { drawDirtBike } from '../woods/teens';
import { x0, x1, X, GY, TREE_X, TRUNK_W, ROOT, PIERCE, TIP, branchY, branchR, TUCK_BIKE, AXE_TREE_X, AXE_TR, CUT_H, LOG_LEN, LOG_X, MH_CHOP_X, ARENA_L, ARENA_R, ROCK_X, ROCK_HW, ROCK_H } from './layout';
import type { Arena } from './state';

// ---------------------------------------------------------------------------------------------------------------
// The section's own materials (darkest first)

/** Bur oak bark: gray-brown, deep furrows. */
const OAKB = ['#100C08', '#1E1812', '#2E261C', '#403628', '#544838', '#6C5E4A', '#887A62', '#A69A80'];
/** The oak's leaves turned russet. */
const RUSSET = ['#1E0804', '#3A1206', '#5C1E0A', '#80300E', '#A44616', '#C46224', '#DE843A', '#F2A85A'];
/** Dry autumn meadow grass (the clearing, the glade). */
const STRAW = ['#1E1A0A', '#342C12', '#4E421C', '#6A5A28', '#887436', '#A69048', '#C4AE62', '#E0CC84'];
/** Blood, dark to wet. */
const BLOOD = ['#2A0404', '#4A0808', '#6E0E0E', '#921616', '#B82020', '#DC3A3A'];
/** Forest Service brown (the routed signs). */
const FS = ['#1A0E06', '#2E1A0C', '#442814', '#5C381E', '#74492A'];

/** Where it opens up (world): the clearing round the oak and the glade past it, one run of open ground. */
const OPEN_A = TREE_X - 520, OPEN_B = ARENA_R + 60;
const isOpen = (wx: number) => wx > OPEN_A && wx < OPEN_B;
/** The section's ground (world). */
const GA = x0 - 200, GB = x1 + 200;

// ---------------------------------------------------------------------------------------------------------------
// The backdrop (screen space): the woods' far off (the real sky, the Rockies, the clear-cut ridge, the ragged pines)

export const drawArenaBackdrop = (c: Ctx, state: GameState) => drawWoodsFar(c, state);

// ---------------------------------------------------------------------------------------------------------------
// Going back

/** The forest floor going back to the back rank: duff banded darker and hazier the further, the clearing's dry grass
 *  where it opens up (its edges ragged), what's lying on it. Each band where its depth puts it (one eye). */
const drawGoingBack = (c: Ctx, v: View) => {
  const tod = timeOfDay(), haze = skyAt(0.9, tod), eye = v.eye;
  const pt = (x: number, d: number) => at(eye, x, GY, d);
  const xa = Math.max(GA, v.v0 - 300), xb = Math.min(GB, v.v1 + 300);
  if (xb <= xa) return;
  const Df = hr('duff', DUFF, 0.4), St = hr('straw', STRAW, 0.4);
  const N = 6, oa = Math.max(xa, OPEN_A), ob = Math.min(xb, OPEN_B);
  for (let i = 0; i < N; i++) {
    const d0 = 1 - ((1 - FAR) * i) / N, d1 = 1 - ((1 - FAR) * (i + 1)) / N, hz = i * 0.055;
    const duff = mix([Df[4], Df[4], Df[3], Df[3], Df[2], Df[2]][i], haze, hz), grass = mix([St[4], St[4], St[3], St[3], St[2], St[2]][i], haze, hz);
    poly(c, [pt(xa, d0), pt(xb, d0), pt(xb, d1), pt(xa, d1)], duff);
    if (ob > oa) poly(c, [pt(oa, d0), pt(ob, d0), pt(ob, d1), pt(oa, d1)], grass);
    const [lx, ly] = pt(xa, d1), [rx] = pt(xb, d1);
    checker(c, lx, ly - 1, rx - lx, 2, mix([Df[3], Df[3], Df[2], Df[2], Df[1], Df[1]][i], haze, hz + 0.05), i % 2);
  }
  // (the open ground's ragged edges going back: tongues of duff into the grass)
  for (const ex of [OPEN_A, OPEN_B]) {
    if (ex < v.v0 - 300 || ex > v.v1 + 300) continue;
    for (let k = 0; k < 14; k++) {
      const d = 1 - (1 - FAR) * (k + 0.5) / 14, [sx, sy] = pt(ex + (hash(k * 3.3 + ex) - 0.5) * 60, d), wd = (16 + hash(k + ex) * 22) * d;
      box(c, Math.round(sx - wd / 2), Math.round(sy), Math.round(wd), 2, mix(Df[3], haze, (1 - d) * 0.5));
      box(c, Math.round(sx - wd / 3), Math.round(sy) + 2, Math.round(wd * 0.6), 1, mix(St[5], haze, (1 - d) * 0.5));
    }
  }
  // ---- what's lying on it: turned leaves, stones, cones, sticks, mushrooms under the trees; in the open, tufts of dry
  // grass, asters gone to seed and goldenrod
  const G = hr('gold', GOLD, 0.5), Br = hr('brown', BROWN, 0.5), Gr = hr('granite', GRANITE, 0.5), B = hr('bark', BARK, 0.5);
  for (let gx = Math.floor(Math.max(GA, v.v0 - 300) / 36) * 36; gx < Math.min(GB, v.v1 + 300); gx += 36) for (let row = 0; row < 6; row++) {
    const hs = gx * 0.019 + row * 5.7, wx = gx + hash(hs) * 32;
    const d = 1 - (1 - FAR) * ((row + 0.2 + hash(hs * 1.7) * 0.6) / 6), [sx0, sy0] = pt(wx, d), k = hash(hs * 2.3), fade = (1 - d) * 0.55;
    const sx = Math.round(sx0), sy = Math.round(sy0), s = (n: number) => Math.max(1, Math.round(n * d));
    const T = (col: string) => mix(col, haze, fade);
    if (isOpen(wx)) {
      if (k < 0.34) { for (let t = 0; t < 4; t++) box(c, sx + (t - 2) * s(2), sy - s(3 + (t % 2) * 3), 1, s(3 + (t % 2) * 3), T(St[4 + (t % 3)])); }
      else if (k < 0.44) { box(c, sx, sy - s(7), 1, s(7), T(St[3])); box(c, sx - 1, sy - s(8), 3, s(2), T('#E8D040')); box(c, sx - 1, sy - s(8), 1, 1, T('#FFF0A0')); }
      else if (k < 0.52) { box(c, sx, sy - s(5), 1, s(5), T(St[3])); box(c, sx - 1, sy - s(6), 3, 2, T('#9A86C8')); box(c, sx, sy - s(6), 1, 1, T('#F0E060')); }
      else if (k < 0.66) { box(c, sx, sy, s(3), 1, T(k < 0.6 ? G[4] : hr('russet', RUSSET, 0.5)[5])); box(c, sx + s(4), sy + 1, s(2), 1, T(G[5])); }
      else if (k < 0.71) { box(c, sx, sy - s(3), s(6), s(3), T(Gr[3])); box(c, sx, sy - s(3), s(3), 1, T(Gr[6])); }
      continue;
    }
    if (k < 0.42) { box(c, sx, sy, s(3), s(2), T(k < 0.22 ? G[4] : Br[4])); box(c, sx + s(5), sy + 1, s(3), 1, T(G[5])); }
    else if (k < 0.55) { c.fillStyle = T(Df[5]); c.beginPath(); c.ellipse(sx, sy, (8 + k * 10) * d, 1.6 * d, 0, 0, Math.PI * 2); c.fill(); }
    else if (k < 0.62) { box(c, sx, sy - s(3), s(6), s(3), T(Gr[3])); box(c, sx, sy - s(3), s(3), 1, T(Gr[6])); }
    else if (k < 0.67) { box(c, sx - s(8), sy, s(16), s(2), T(B[2])); box(c, sx - s(8), sy, s(16), 1, T(B[4])); }
    else if (k < 0.71) { box(c, sx, sy - s(3), s(3), s(4), T(B[3])); box(c, sx, sy - s(3), 1, s(4), T(B[5])); }
    else if (k < 0.735) {
      // (a fly agaric: red cap, white warts, the stalk)
      box(c, sx, sy - s(4), s(2), s(4), T('#E8E0CC')); box(c, sx - s(3), sy - s(6), s(8), s(3), T('#B81C10')); box(c, sx - s(2), sy - s(7), s(6), 1, T('#E03A20'));
      box(c, sx - s(1), sy - s(6), 1, 1, T('#FFFFFF')); box(c, sx + s(2), sy - s(5), 1, 1, T('#FFFFFF'));
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The trees

/** The woods' back rank (a tile, the same all along, cut to the ground): a wall of real firs and spruce, gold aspens,
 *  a snag, the undergrowth along its foot, dimmed into the hazy air. */
const TW = 640;
const paintBackRank = (g: Ctx) => {
  const tod = timeOfDay(), haze = skyAt(0.9, tod);
  const dim = (R: string[], k = 0.3) => R.map(col => mix(mix(col, '#1A2430', 0.14), haze, k));
  const N = dim(hr('needle', NEEDLE, 0.4)), B = dim(hr('bark', BARK, 0.4));
  const fir = firOf(N), spr = N.map(col => mix(col, '#2A4A5A', 0.2)), Au = dim(hr('gold', GOLD, 0.4), 0.26), Ru = dim(hr('russet', RUSSET, 0.4), 0.3);
  // (the deep ones behind: a ragged crest of real firs, darker and flatter in the haze (low contrast, the same tiers))
  const back = N.map(col => mix(col, '#0A1410', 0.35)), backFar = back.map((col, i) => mix(col, back[Math.min(3, Math.max(1, i))], 0.55)), backB = B.map(col => mix(col, '#0A1410', 0.45));
  for (let i = 0; i < 18; i++) {
    const x = i * 36 + hash(i * 1.3 + 9) * 20, h = 210 + hash(i * 2.7 + 9) * 120;
    for (const xx of [x, x - TW, x + TW]) if (xx > -80 && xx < TW + 80) pine(g, xx, -20, h - 20, (h - 20) * 0.3, i * 23 + 101, backFar, backB);
  }
  // (their feet: the deep shade under them, banded down, dithered up into the boughs)
  bands(g, -80, -40, TW + 160, 40, [back[2], back[1], back[1], back[0]]);
  checker(g, -80, -42, TW + 160, 2, back[2], 0, 1); checker(g, -80, -26, TW + 160, 2, back[1], 1, 1);
  // (the rank: firs, spruce, an aspen stand gone gold, a scrub oak gone russet, a snag)
  const A = dim(ASPEN, 0.3), S = dim(SNAG), Rg = dim(hr('rings', RINGS, 0.4));
  const kinds: ('fir' | 'spruce' | 'aspen' | 'snag' | 'oak')[] = ['spruce', 'fir', 'aspen', 'fir', 'spruce', 'oak', 'fir', 'snag', 'spruce', 'fir', 'aspen', 'spruce'];
  for (let i = 0; i < kinds.length; i++) {
    const x = 26 + i * (TW / kinds.length) + hash(i * 4.4 + 2) * 30, h = 180 + hash(i * 3.9 + 2) * 110, k = kinds[i];
    for (const xx of [x, x - TW, x + TW]) {
      if (xx < -120 || xx > TW + 120) continue;
      if (k === 'fir' || k === 'spruce') pine(g, xx, 0, h, h * (k === 'fir' ? 0.36 : 0.3), i * 17 + 3, k === 'fir' ? fir : spr, B);
      else if (k === 'aspen') {
        // (a clump of three chalky trunks, lit left, black eyes in the bark, a round gold crown each)
        for (const [ox, sc] of [[-9, 0.82], [8, 0.74], [0, 1]] as const) {
          const th = h * 0.7 * sc, tx = xx + ox;
          box(g, tx - 3, -th, 7, th, INK); box(g, tx - 2, -th, 5, th, A[4]); box(g, tx - 2, -th, 1, th, A[6]); box(g, tx + 2, -th, 1, th, A[2]);
          checker(g, tx + 1, -th, 1, th, A[3], 0, 1);
          for (let e = 0; e < 7; e++) { const ey = -th + 8 + e * th / 8; box(g, tx - 2 + (e % 2) * 2, ey, 2, 1, A[0]); box(g, tx - 1 + (e % 2) * 2, ey + 1, 1, 1, A[1]); }
          clump(g, tx, -th - 6, 26 * sc + 4, 22 * sc + 4, i * 7 + ox, Au, ox > 0 ? 1 : 0);
        }
        clump(g, xx - 16, -h * 0.5, 18, 14, i * 7 + 3, Au, 1);
      } else if (k === 'oak') {
        // (a scrub oak: a short forked trunk, stepped across, its plates; a russet crown in lobes)
        const th = h * 0.45;
        box(g, xx - 5, -th, 10, th, INK); box(g, xx - 4, -th, 8, th, B[3]); box(g, xx - 4, -th, 2, th, B[5]); box(g, xx + 2, -th, 2, th, B[1]);
        for (let y = -th + 6; y < -4; y += 7) { box(g, xx - 2 + ((y * 3) & 3), y, 1, 4, B[1]); box(g, xx - 3 + ((y * 3) & 3), y, 1, 4, B[4]); }
        g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(xx, -th + 4); g.lineTo(xx - 16, -th - 18); g.moveTo(xx, -th + 4); g.lineTo(xx + 14, -th - 14); g.stroke();
        g.strokeStyle = B[3]; g.lineWidth = 3; g.stroke();
        clump(g, xx - 4, -th - 24, 44, 30, i * 9, Ru, 1); clump(g, xx + 12, -th - 6, 30, 20, i * 9 + 4, Ru, 0); clump(g, xx - 18, -th - 4, 22, 16, i * 9 + 6, Ru, 0);
      } else {
        // (a snag: silver deadwood, its top snapped in a jag, limb stubs, a woodpecker's holes)
        const sh = h * 0.6;
        box(g, xx - 5, -sh, 10, sh, INK); box(g, xx - 4, -sh, 8, sh, S[3]); box(g, xx - 4, -sh, 2, sh, S[5]); box(g, xx + 2, -sh, 2, sh, S[1]);
        for (let y = -sh + 8; y < -4; y += 7) box(g, xx - 2 + ((y * 3) & 3), y, 1, 4, S[2]);
        g.fillStyle = INK; g.beginPath(); g.moveTo(xx - 5, -sh); g.lineTo(xx - 2, -sh - 14); g.lineTo(xx + 1, -sh - 5); g.lineTo(xx + 5, -sh - 18); g.lineTo(xx + 5, -sh); g.closePath(); g.fill();
        g.fillStyle = S[2]; g.beginPath(); g.moveTo(xx - 3, -sh); g.lineTo(xx - 2, -sh - 10); g.lineTo(xx + 1, -sh - 2); g.lineTo(xx + 3, -sh - 13); g.lineTo(xx + 3, -sh); g.closePath(); g.fill();
        for (let e = 0; e < 5; e++) { const ey = -sh * 0.85 + e * sh * 0.14, r = e % 2; box(g, r ? xx + 4 : xx - 12, ey, 8, 3, INK); box(g, r ? xx + 4 : xx - 11, ey + 1, 7, 1, S[4]); }
        for (let e = 0; e < 3; e++) box(g, xx - 1, -sh * 0.5 + e * 7, 2, 2, INK);
      }
    }
  }
  // (the undergrowth along its foot: bushes, ferns, a deadfall log)
  const O = dim(hr('oak', OAK, 0.4)).map(col => mix(col, '#2A2A10', 0.3)), Gs = dim(hr('grass', GRASS, 0.4)), Ms = dim(hr('moss', MOSS, 0.4));
  for (let i = 0; i < 16; i++) { const x = i * 40 + hash(i * 1.9 + 5) * 20; for (const xx of [x, x - TW, x + TW]) if (xx > -40 && xx < TW + 40) clump(g, xx, -12, 22 + hash(i + 5) * 12, 14, i * 5 + 11, i % 3 ? O : Ru, 1); }
  // (the deadfall: a peeled log, banded round (lit on top), its bark in plates, moss on its back, the sawn end's rings)
  box(g, 380, -13, 96, 11, INK); bands(g, 381, -12, 94, 9, [B[5], B[4], B[3], B[3], B[2], B[1]]);
  for (let x = 384; x < 466; x += 9) { box(g, x + ((x * 3) & 3), -9, 5, 1, B[1]); box(g, x + ((x * 3) & 3), -10, 5, 1, B[5]); }
  for (let x = 386; x < 460; x += 6) if (hash(x * 0.9) > 0.45) { box(g, x, -13, 5, 2, Ms[4]); box(g, x + 1, -14, 3, 1, Ms[6]); }
  g.fillStyle = INK; g.beginPath(); g.ellipse(475, -7.5, 4, 6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = Rg[4]; g.beginPath(); g.ellipse(475, -7.5, 3, 5, 0, 0, Math.PI * 2); g.fill();
  box(g, 474, -10, 2, 5, Rg[2]); box(g, 473, -11, 1, 1, Rg[5]);
  for (let i = 0; i < 14; i++) fern(g, i * 46 + hash(i * 5.3 + 1) * 20, 0, 14 + hash(i + 1) * 10, i * 3 + 7, 0, Gs, 3);
};

/** A tree stood back: [x from the section's start, kind, height, depth]. */
interface Tree { rx: number; k: TreeKind; h: number; d: number; brush: boolean }
const TREES: Tree[] = (() => {
  const out: Tree[] = [];
  const mid: TreeKind[] = ['fir', 'spruce', 'gold', 'fir', 'snag', 'spruce', 'aspen', 'fir', 'lean', 'gold', 'spruce', 'fir'];
  // (between the rank and the trail; few where it opens up, and those stood well back at the glade's edge)
  for (let rx = -180; rx < 4200; rx += 58 + Math.floor(hash(rx * 0.7 + 3) * 52)) {
    const open = isOpen(X(rx));
    if (open && hash(rx + 2.5) < 0.62) continue;
    out.push({ rx, k: mid[Math.floor(hash(rx * 3.1 + 1) * mid.length)], h: 170 + hash(rx + 1.5) * 110, d: open ? 0.74 + hash(rx * 1.7) * 0.03 : 0.78 + hash(rx * 1.7) * 0.07, brush: false });
  }
  // (the big ones by the trail, their crowns up out of the frame; none where it opens up)
  for (let rx = 40; rx < 4200; rx += 150 + Math.floor(hash(rx * 2.3) * 70)) {
    if (X(rx) > OPEN_A - 90 && X(rx) < OPEN_B + 90) continue;
    const k: TreeKind = hash(rx + 5) > 0.72 ? 'gold' : hash(rx + 5) > 0.36 ? 'fir' : 'spruce';
    out.push({ rx, k, h: 300 + hash(rx + 4) * 80, d: 0.9 + hash(rx * 2.9) * 0.05, brush: true });
  }
  // (the glade's edge: a few stood back framing it, under the rank)
  for (const rx of [1180, 1330, 2090, 2770, 3420, 3610]) out.push({ rx, k: hash(rx) > 0.5 ? 'fir' : 'spruce', h: 260 + hash(rx + 1) * 60, d: 0.82 + hash(rx + 2) * 0.03, brush: true });
  return out.sort((p, q) => p.d - q.d);
})();

/** The back rank and the trees, deepest first, from depth `dMin` up to `dMax`. */
const drawTrees = (c: Ctx, v: View, dMin: number, dMax: number) => {
  const eye = v.eye;
  if (dMin <= FAR) atDepth(c, eye, FAR, () => {
    for (let tx = Math.floor((v.v0 - 400) / TW) * TW; tx < v.v1 + 400; tx += TW) {
      if (!seen(v, tx - 120, tx + TW + 120, FAR)) continue;
      put(c, 'ar-backrank', tx, GY, -120, -420, TW + 240, 422, paintBackRank);
    }
  });
  for (const t of TREES) {
    if (t.d < dMin || t.d >= dMax) continue;
    const wx = X(t.rx), [bx, by, bw, bh] = treeBox(t.k, t.h);
    if (!seen(v, wx + bx - 40, wx + bx + bw + 40, t.d)) continue;
    atDepth(c, eye, t.d, () => {
      put(c, `ar-tree-${t.k}-${t.rx}-${Math.round(t.h)}`, wx, GY, bx, by, bw, bh, g => paintTree(g, t.k, t.rx, t.h));
      if (t.brush) put(c, `ar-brush-${t.rx}`, wx + 26, GY, -72, -68, 144, 72, g => bush(g, 0, 0, 56, 34, t.rx + 7));
    });
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The sign before the glade: the Forest Service's routed brown board on two 4x4s (YOU ARE IN GRIZZLY COUNTRY, a bear
// routed in), the county's yellow lion notice screwed on under it, a hunter's orange tape round one post

const SIGN_X = ARENA_L - 205, SIGN_D = 0.93;
export const paintBearSign = (g: Ctx) => {
  const Wd = ['#1A120A', '#2E2214', '#46341E', '#5E482A', '#786038'], S = hr('steel', STEEL, 0.2);
  // (the posts: rough-sawn 4x4s, lit down the left, checked; sunk in a ring of dirt)
  for (const px of [-40, 34]) {
    box(g, px - 1, -132, 8, 132, INK); box(g, px, -132, 6, 132, Wd[3]); box(g, px, -132, 2, 132, Wd[4]); box(g, px + 4, -132, 2, 132, Wd[1]);
    for (let y = -124; y < -6; y += 11) box(g, px + 2, y, 1, 5, Wd[1]);
    box(g, px - 4, -3, 14, 3, '#3A2A18'); box(g, px - 3, -4, 12, 1, '#5A4428');
  }
  // (the routed board: FS brown, its edge chamfered light, the letters cut in and painted cream)
  // (sized so its words fit beside the routed bear (the playtest: they ran off it): the board as wide as its stamp
  // allows, the big words kept bold but narrowed to a single cell wide if they still won't fit)
  const bw = 124, top = -132, bh = 64, textL = -bw / 2 + 36, textR = bw / 2 - 5, avail = textR - textL, tx = (textL + textR) / 2;
  box(g, -bw / 2 - 1, top - 1, bw + 2, bh + 2, INK);
  box(g, -bw / 2, top, bw, bh, FS[3]); box(g, -bw / 2, top, bw, 2, FS[4]); box(g, -bw / 2, top, 2, bh, FS[4]); box(g, -bw / 2, top + bh - 2, bw, 2, FS[1]); box(g, bw / 2 - 2, top, 2, bh, FS[1]);
  for (let y = top + 5; y < top + bh - 4; y += 4) box(g, -bw / 2 + 4 + hash(y) * 30, y, 30 + hash(y + 1) * 40, 1, FS[2]);
  const cut = printed('#E8DCB0', 1, FS[0]), big0 = printed('#E8DCB0', 2, FS[0]);
  const big = Math.max(signW('GRIZZLY', big0), signW('COUNTRY', big0)) <= avail ? big0 : { ...big0, sx: 1 };
  signText(g, 'YOU ARE IN', tx, top + 14, cut);
  signText(g, 'GRIZZLY', tx, top + 34, big);
  signText(g, 'COUNTRY', tx, top + 54, big);
  // (a grizzly routed in at the left: the hump, the dished face)
  const bx = -bw / 2 + 8, by = top + 38;
  g.fillStyle = FS[0]; g.beginPath(); g.moveTo(bx, by + 6); g.lineTo(bx + 2, by - 4); g.lineTo(bx + 8, by - 9); g.lineTo(bx + 14, by - 7); g.lineTo(bx + 18, by - 3); g.lineTo(bx + 21, by - 2); g.lineTo(bx + 20, by + 1); g.lineTo(bx + 17, by + 1); g.lineTo(bx + 16, by + 6); g.lineTo(bx + 13, by + 6); g.lineTo(bx + 12, by + 2); g.lineTo(bx + 6, by + 2); g.lineTo(bx + 5, by + 6); g.closePath(); g.fill();
  g.fillStyle = '#E8DCB0'; g.save(); g.translate(0, -1); g.fill(); g.restore();
  box(g, bx + 18, by - 3, 1, 1, FS[1]);
  // (bolts, a wasp nest's papery stub under the top edge)
  for (const nx of [-bw / 2 + 3, bw / 2 - 6]) for (const ny of [6, bh - 9]) { box(g, nx, top + ny, 3, 3, INK); box(g, nx, top + ny, 2, 2, S[5]); }
  box(g, 20, top + bh + 1, 6, 4, '#A89C88'); box(g, 21, top + bh + 1, 4, 1, '#C8BCA8');
  // (the county's notice under it: yellow, black letters, its corner bent; a hunter's orange tape on the far post)
  const nt = top + bh + 8, nw = 92, nh = 34;
  box(g, -nw / 2 - 1, nt - 1, nw + 2, nh + 2, INK); box(g, -nw / 2, nt, nw, nh, '#E8C21E'); box(g, -nw / 2, nt, nw, 1, '#F8E060'); box(g, -nw / 2, nt + nh - 1, nw, 1, '#B08E10');
  box(g, -nw / 2 + 2, nt + 2, nw - 4, nh - 4, '#141414'); box(g, -nw / 2 + 3, nt + 3, nw - 6, nh - 6, '#E8C21E');
  // (sun-faded along its top, dithered down into the yellow; its four screws in the margin, rust bled round them)
  box(g, -nw / 2 + 3, nt + 3, nw - 6, 1, '#F4DC70'); checker(g, -nw / 2 + 3, nt + 4, nw - 6, 1, '#F4DC70', 0, 1);
  for (const sx of [-nw / 2, nw / 2 - 2]) for (const sy of [nt, nt + nh - 2]) { box(g, sx, sy, 2, 2, '#8A5A1E'); box(g, sx, sy, 1, 1, S[5]); }
  // (and a hunter's been at the Forest Service's board: two bullet holes under the bear, the paint starred round them)
  for (const [hx, hy] of [[-bw / 2 + 12, top + 51], [-bw / 2 + 23, top + 57]] as const) {
    box(g, hx - 2, hy, 5, 1, FS[4]); box(g, hx, hy - 2, 1, 5, FS[4]); box(g, hx - 1, hy - 1, 3, 3, FS[1]); box(g, hx, hy, 1, 1, INK); box(g, hx - 1, hy - 1, 1, 1, '#C8BCA8');
  }
  signText(g, 'MOUNTAIN LIONS', 0, nt + 12, printed('#141414'));
  signText(g, 'ACTIVE IN AREA', 0, nt + 21, printed('#141414'));
  // (the hint: what brings them out)
  signText(g, 'DRAWN TO BLOOD', 0, nt + 30, printed('#8A1010'));
  g.fillStyle = INK; g.beginPath(); g.moveTo(nw / 2 + 1, nt + nh - 9); g.lineTo(nw / 2 + 1, nt + nh + 1); g.lineTo(nw / 2 - 9, nt + nh + 1); g.closePath(); g.fill();
  g.fillStyle = '#C8B060'; g.beginPath(); g.moveTo(nw / 2 - 1, nt + nh - 7); g.lineTo(nw / 2 - 7, nt + nh - 1); g.lineTo(nw / 2 - 3, nt + nh - 3); g.closePath(); g.fill();
  box(g, 33, -24, 8, 4, '#F2601A'); box(g, 33, -24, 8, 1, '#FF9A50'); box(g, 41, -23, 6, 2, '#F2601A'); box(g, 46, -22, 3, 9, '#E2500E');
};

// ---------------------------------------------------------------------------------------------------------------
// The trail coming toward him (and the clearing's grass, where it peters out)

/** How far toward him the floor under his feet comes (bent); under that, the earth. */
const BAND = 160, SOIL = 420, CHUNK = 512;
/** 1 on the trail, 0 out in the open ground (a 140 px blend at its edges). */
const trailK = (wx: number) => Math.max(0, Math.min(1, Math.max((OPEN_A + 70 - wx) / 140, (wx - OPEN_B + 70) / 140)));

const paintFloor = (g: Ctx, wx: number, w: number) => {
  const D = hr('dirt', DIRT, 0.2), Df = hr('duff', DUFF, 0.2), L = hr('lip', LIP, 0.2), G = hr('gold', GOLD, 0.2), Br = hr('brown', BROWN, 0.2), R = hr('granite', GRANITE, 0.2), B = hr('bark', BARK, 0.2), Ms = hr('moss', MOSS, 0.2), St = hr('straw', STRAW, 0.2);
  // (the earth: packed dirt banded down into the dark soil)
  bands(g, 0, 0, w, BAND, [D[4], D[4], D[3], D[3], D[3], D[2]]);
  bands(g, 0, BAND, w, SOIL - BAND, [D[2], D[1], D[1], D[0], D[0]]);
  // (out in the open: the meadow's sod over it, dry grass in stepped rows, thatch, the dirt showing through in patches)
  for (let x = 0; x < w; x += 2) {
    const k = 1 - trailK(wx + x);
    if (k <= 0) { const q = hash((wx + x) * 0.37); box(g, x, 0, 2, 5 + q * 8, q > 0.6 ? Df[4] : Df[3]); if (q > 0.8) box(g, x, 5 + q * 8, 2, 2, Df[2]); continue; }
    const deep = (BAND - 20) * k;
    for (let y = 0; y < deep; y += 8) {
      const q = hash((wx + x) * 0.31 + y * 0.77);
      if (k < 1 && q > k * 1.2) continue;
      box(g, x, y, 2, 8, q > 0.7 ? St[4] : q > 0.35 ? St[3] : St[2]);
      if (q > 0.86) box(g, x, y + 2, 2, 2, St[5]);
      else if (q < 0.08) box(g, x, y + 3, 2, 3, D[3]);
    }
  }
  // (two ruts worn down the trail, lit along their far lips, the knobbies' tread pressed in them; fading out into the
  // grass, and a bike's single track on into the clearing)
  for (const [ry, rh] of [[30, 7], [74, 9]] as const) for (let x = 0; x < w; x += 2) {
    const k = trailK(wx + x);
    if (k < hash((wx + x) * 0.11 + ry)) continue;
    box(g, x, ry, 2, rh, D[2]); box(g, x, ry, 2, 1, D[1]); box(g, x, ry + rh, 2, 1, D[5]);
    if ((x + ry) % 4 === 0) box(g, x, ry + rh - 2, 2, 1, D[3]);
    if ((wx + x + ry) % 6 < 2) box(g, x, ry + 2, 2, 2, D[1]);
  }
  for (let x = 0; x < w; x += 2) {
    const ax = wx + x;
    if (trailK(ax) > 0.5 || ax > TREE_X + 40) continue;
    box(g, x, 52, 2, 3, D[2]); box(g, x, 55, 2, 1, St[5]); if (ax % 6 < 2) box(g, x, 53, 2, 1, D[1]);
  }
  // (stones, a root across the trail, leaves and needles on it, moss at its edge)
  for (let n = 0; n < w / 7; n++) {
    const x = hash(wx * 0.01 + n * 1.3) * w, y = 8 + hash(wx * 0.02 + n * 2.9) * (BAND + 60), r = 1 + hash(n + wx) * 4;
    if (trailK(wx + x) < 0.4 && hash(n * 3.1 + wx) < 0.6) continue;
    box(g, x - r, y - r * 0.6, r * 2, r * 1.2, INK); box(g, x - r + 1, y - r * 0.6 + 1, r * 2 - 2, r * 1.2 - 2, R[3 + (n % 2)]); box(g, x - r + 1, y - r * 0.6 + 1, r, 1, R[6]);
  }
  for (let n = 0; n < w / 90; n++) {
    const x = hash(wx + n * 7.1) * w, y = 4 + hash(n * 3.7 + wx) * 30;
    if (trailK(wx + x) < 0.9) continue;
    g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 30, y + 20); g.quadraticCurveTo(x, y - 4, x + 34, y + 16); g.stroke();
    g.strokeStyle = B[3]; g.lineWidth = 3; g.stroke(); g.strokeStyle = B[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 28, y + 18); g.quadraticCurveTo(x, y - 5, x + 32, y + 14); g.stroke();
  }
  for (let n = 0; n < w / 4; n++) {
    const x = hash(wx * 0.03 + n * 0.71) * w, y = 2 + hash(n * 1.37 + wx * 0.05) * 136, k = hash(n * 4.9 + wx);
    if (k < 0.5) { box(g, x, y, 3, 2, k < 0.2 ? G[4] : k < 0.34 ? hr('russet', RUSSET, 0.2)[5] : Br[4]); box(g, x, y, 1, 1, G[6]); } else if (k < 0.7) box(g, x, y, 4, 1, Df[5]);
  }
  for (let n = 0; n < w / 60; n++) { const x = hash(wx + n * 11.1) * w; if (trailK(wx + x) > 0.5) { box(g, x, 2, 8, 2, Ms[4]); box(g, x + 2, 1, 4, 1, Ms[5]); } }
  // (the lit lip along the top: his to stand on, tufts up over it: dry grass out in the open)
  for (let x = 0; x < w; x += 2) {
    box(g, x, -1, 2, 1, INK); box(g, x, 0, 2, 3, L[1]); box(g, x, 0, 2, 2, L[2]); box(g, x, 0, 2, 1, L[3]);
    const k = hash((wx + x) * 0.71), open = trailK(wx + x) < 0.5;
    if (k > (open ? 0.42 : 0.62)) { const gh = 3 + hash(x + wx) * (open ? 9 : 6); box(g, x, -gh, 1, gh, open ? (k > 0.8 ? St[6] : St[4]) : k > 0.85 ? G[5] : L[2]); box(g, x + 1, -gh + 2, 1, gh - 2, open ? St[3] : L[1]); }
  }
};

const drawPlayFloor = (c: Ctx, v: View) => {
  for (let x = GA, i = 0; x < GB; x += CHUNK, i++) {
    const w = Math.min(CHUNK, GB - x);
    if (x + w < v.v0 || x > v.v1) continue;
    put(c, `ar-floor-${i}`, x, GY, 0, -12, w, SOIL + 12, g => paintFloor(g, x, w));
  }
  bendFloor(c, v.eye, GY, GY, GY + BAND, Math.max(GA, v.v0 - 40), Math.min(GB, v.v1 + 40));
};

// ---------------------------------------------------------------------------------------------------------------
// The world, behind the cast

export const drawArenaBack = (c: Ctx, state: GameState) => {
  const v = viewOf(state);
  // (deepest first: nothing stood back is drawn over anything nearer)
  drawGoingBack(c, v);
  drawTrees(c, v, 0, SIGN_D);
  if (seen(v, SIGN_X - 70, SIGN_X + 70, SIGN_D)) atDepth(c, v.eye, SIGN_D, () => put(c, 'ar-bearsign', SIGN_X, GY, -66, -140, 132, 144, paintBearSign));
  drawTrees(c, v, SIGN_D, 1.01);
  // ---- the trail coming toward him; the oak at the play plane, over it (its roots aren't bent with the floor)
  drawPlayFloor(c, v);
  if (onScreen(state, TREE_X - 300, TREE_X + 300)) put(c, 'ar-oak', TREE_X, GY, -300, -510, 600, 520, paintOak);
};

// ---------------------------------------------------------------------------------------------------------------
// THE OAK: a giant old bur oak, gone russet and gold, at the play plane (its trunk's left face where the branch roots)

export const paintOak = (g: Ctx) => {
  const B = hr('oakb', OAKB, 0.2), Gd = hr('gold', GOLD, 0.2), Ru = hr('russet', RUSSET, 0.2), Br = hr('brown', BROWN, 0.2), Ms = hr('moss', MOSS, 0.2);
  const w = TRUNK_W;
  const Bn = Br.map(col => mix(col, '#5A3010', 0.2)).concat([mix(Br[5], '#E0A060', 0.4)]);
  // ---- the crown, behind the trunk: big, lumpy, turning (the back lobes darker, the front lit)
  const crown: [number, number, number, number, string[], number][] = [
    [-160, -258, 62, 44, Ru, 1], [168, -250, 60, 44, Gd, 1], [0, -418, 104, 60, Gd, 1], [-96, -388, 84, 56, Ru, 1], [104, -382, 84, 56, Bn, 1],
    [-120, -330, 92, 62, Ru, 0], [118, -322, 90, 60, Gd, 0], [0, -372, 104, 64, Ru, 0], [-58, -282, 82, 54, Gd, 0], [70, -272, 86, 56, Ru, 0],
    [-182, -262, 54, 40, Bn, 0], [186, -252, 52, 38, Gd, 0], [8, -310, 74, 50, Gd, 0], [-30, -440, 60, 36, Ru, 0], [46, -436, 56, 34, Gd, 0],
  ];
  // (the limbs up into it first, so the leaves lap over them)
  const limb = (pts: number[], lw: number) => {
    const path = () => { g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); };
    g.lineCap = 'round'; g.lineJoin = 'round';
    path(); g.strokeStyle = INK; g.lineWidth = lw + 3; g.stroke();
    path(); g.strokeStyle = B[2]; g.lineWidth = lw; g.stroke();
    g.save(); g.translate(-lw * 0.18, -lw * 0.18); path(); g.strokeStyle = B[4]; g.lineWidth = lw * 0.45; g.stroke(); g.restore();
    g.save(); g.translate(-lw * 0.3, -lw * 0.3); path(); g.strokeStyle = B[6]; g.lineWidth = Math.max(1, lw * 0.12); g.stroke(); g.restore();
    g.lineCap = 'butt';
  };
  limb([0, -170, -40, -230, -110, -270, -170, -262], 18);
  limb([0, -190, 46, -240, 100, -290, 160, -262], 16);
  limb([-4, -220, -18, -300, -10, -380], 13);
  limb([-40, -230, -70, -320, -96, -380], 9);
  limb([46, -240, 70, -330, 100, -372], 9);
  limb([-110, -270, -150, -300], 6); limb([100, -290, 140, -320], 6);
  crown.forEach(([dx, dy, rw, rh, R, sh], i) => clump(g, dx, dy, rw, rh, 41 + i * 13, R, sh));
  // (twigs poking out through it, bare where the leaves have gone)
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI * (0.1 + i * 0.1), r = 200 + hash(i * 5.1) * 30, sx = Math.cos(a) * r * 0.95, sy = -300 + Math.sin(a) * r * 0.62;
    g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.moveTo(sx * 0.86, sy * 0.96 + 6); g.lineTo(sx, sy); g.lineTo(sx + 6, sy - 6); g.stroke();
    g.strokeStyle = B[3]; g.lineWidth = 1; g.stroke();
  }
  // ---- the trunk: thick, flaring into its roots; bur oak bark in deep, corky furrows and plates; lit down its left
  const outline = (e: number) => { g.beginPath(); g.moveTo(-w - 26 - e, 2); g.quadraticCurveTo(-w - 2 - e, -12, -w - 1 - e, -60); g.lineTo(-w + 6 - e, -232); g.lineTo(w - 4 + e, -232); g.lineTo(w + 1 + e, -60); g.quadraticCurveTo(w + 2 + e, -12, w + 28 + e, 2); g.closePath(); };
  outline(1.5); g.fillStyle = INK; g.fill();
  g.save(); outline(0); g.clip();
  // (banded across: lit left, the body, the shade, the deep at the right edge; dithered seams)
  const cols: [number, number, string][] = [[-60, -w + 4, B[5]], [-w + 4, -w + 12, B[4]], [-w + 12, w - 18, B[3]], [w - 18, w - 8, B[2]], [w - 8, 60, B[1]]];
  for (const [a, b, col] of cols) box(g, a, -240, b - a, 244, col);
  checker(g, -w + 2, -240, 4, 244, B[4], 0, 1); checker(g, -w + 10, -240, 4, 244, B[3], 1, 1); checker(g, w - 20, -240, 4, 244, B[2], 0, 1); checker(g, w - 10, -240, 4, 244, B[1], 1, 1);
  box(g, -w + 3, -240, 2, 244, B[6]);
  // (the furrows: deep dark channels wandering down, corky ridges between, each ridge lit on its left, broken into plates)
  for (let k = 0; k < 9; k++) {
    let fx = -w + 6 + k * ((2 * w - 8) / 9);
    for (let y = -230; y < 0; y += 6) {
      fx += (hash(k * 31 + y * 0.7) - 0.5) * 2.4;
      const deep = hash(k * 7 + y * 0.31) > 0.18;
      if (deep) { box(g, Math.round(fx), y, 2, 7, B[0]); box(g, Math.round(fx) - 1, y, 1, 7, fx < 0 ? B[6] : B[4]); }
      if (hash(k * 13 + y) > 0.86) box(g, Math.round(fx) - 4, y + 3, 6, 1, B[0]);
    }
  }
  // (the root flare: each root a ridge running out, lit along its top)
  for (const [rx, dir] of [[-w - 10, -1], [-w + 4, -1], [w - 4, 1], [w + 12, 1], [2, 0]] as const) {
    g.strokeStyle = B[1]; g.lineWidth = 4; g.beginPath(); g.moveTo(rx * 0.6, -40); g.quadraticCurveTo(rx, -12, rx + dir * 20, 1); g.stroke();
    g.strokeStyle = B[5]; g.lineWidth = 1.5; g.beginPath(); g.moveTo(rx * 0.6 - 2, -40); g.quadraticCurveTo(rx - 2, -13, rx + dir * 20 - 2, -1); g.stroke();
  }
  // (moss up its north side from the ground, lichen spots)
  for (let y = -70; y < 0; y += 3) { const mw = 4 + (y + 70) * 0.18 + hash(y) * 4; box(g, w - mw - 2, y, mw, 3, hash(y * 3) > 0.5 ? Ms[3] : Ms[4]); if (hash(y * 7) > 0.7) box(g, w - mw - 1, y, 2, 1, Ms[6]); }
  for (let n = 0; n < 14; n++) { const lx = -w + 8 + hash(n * 2.3) * (2 * w - 20), ly = -220 + hash(n * 4.1) * 160; box(g, lx, ly, 3, 2, '#9AA884'); box(g, lx + 1, ly, 1, 1, '#C8D0A8'); }
  g.restore();
  // ---- the hollow (a knothole, its lip of callus rolled in, dark inside) and an old limb's scar higher up
  const hol = (x: number, y: number, rx: number, ry: number) => {
    g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, rx + 3, ry + 3, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = B[5]; g.beginPath(); g.ellipse(x - 1, y - 1, rx + 2, ry + 2, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = B[2]; g.beginPath(); g.ellipse(x + 1, y + 1, rx + 1, ry + 1, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#0A0604'; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
    box(g, x - 1, y + ry - 3, 3, 2, '#1E140C');
  };
  hol(6, -150, 6, 11);
  g.fillStyle = INK; g.beginPath(); g.ellipse(-8, -196, 7, 5, 0.3, 0, Math.PI * 2); g.fill();
  g.fillStyle = B[4]; g.beginPath(); g.ellipse(-8, -196, 5.6, 3.6, 0.3, 0, Math.PI * 2); g.fill();
  g.fillStyle = hr('rings', RINGS, 0.2)[2]; g.beginPath(); g.ellipse(-8, -196, 3, 1.8, 0.3, 0, Math.PI * 2); g.fill();
  // ---- the leaves fallen round its foot (a skirt of russet and gold over the ground's lip), an acorn or two
  for (let i = 0; i < 70; i++) {
    const lx = -w - 70 + hash(i * 1.7 + 3) * (2 * w + 140), ly = -1 + hash(i * 2.9) * 6, R = [Ru, Gd, Br][i % 3];
    leafAt(g, lx, ly, 2.4 + hash(i) * 1.6, hash(i * 3.3) * 3, R);
  }
  for (const [ax, ay] of [[-46, 2], [38, 3], [-12, 4]] as const) { box(g, ax - 2, ay - 3, 5, 5, INK); box(g, ax - 1, ay - 2, 3, 3, '#7A5428'); box(g, ax - 2, ay - 3, 5, 2, '#5A5030'); box(g, ax - 1, ay - 2, 1, 1, '#A8784A'); }
};

/** The oak's pointed branch: whole (before), on into his chest (him hung on it: from where it goes into him to the
 *  trunk), or snapped off short at the trunk (he took the rest with him). World; drawn over him when he's on it. */
export const drawOakBranch = (c: Ctx, how: 'whole' | 'him' | 'snapped') => {
  const B = hr('oakb', OAKB, 0.2), Rg = hr('rings', RINGS, 0.2);
  if (how === 'snapped') {
    drawBough(c, ROOT.x - 14, ROOT.x + 6, branchY, branchR, { jag: false, step: 1, seed: 21 });
    // (the break: raw pale wood, its heart darker, splinters sticking out, inked)
    const y = branchY(ROOT.x - 14), r = branchR(ROOT.x - 14);
    const brk = () => { c.beginPath(); c.moveTo(ROOT.x - 14, y - r); c.lineTo(ROOT.x - 24, y - r * 0.5); c.lineTo(ROOT.x - 17, y - r * 0.1); c.lineTo(ROOT.x - 25, y + r * 0.4); c.lineTo(ROOT.x - 18, y + r * 0.7); c.lineTo(ROOT.x - 14, y + r); c.closePath(); };
    brk(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke(); c.fillStyle = Rg[4]; c.fill();
    box(c, ROOT.x - 18, y - r * 0.4, 4, 2, Rg[2]); box(c, ROOT.x - 22, y - r * 0.5, 3, 1, Rg[5]); box(c, ROOT.x - 20, y + r * 0.3, 4, 1, Rg[1]);
    // (the bark's torn edge round it, and the scar weeping sap)
    box(c, ROOT.x - 15, y - r - 1, 2, 2 * r + 2, B[1]); box(c, ROOT.x - 12, y + r, 1, 5, '#8A5A1A');
    return;
  }
  const from = how === 'him' ? PIERCE.x - 3 : TIP.x;
  drawBough(c, from, ROOT.x + 8, branchY, branchR, { step: 1, seed: 21, bloodTo: how === 'him' ? PIERCE.x + 5 : undefined });
  // (a twig off it, a few last leaves on it, stepped)
  const tx = PIERCE.x + 22, ty = branchY(tx) - branchR(tx);
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx - 4, ty - 12); c.lineTo(tx - 10, ty - 16); c.stroke();
  c.strokeStyle = B[3]; c.lineWidth = 1.4; c.stroke();
  c.strokeStyle = B[5]; c.lineWidth = 0.6; c.beginPath(); c.moveTo(tx - 0.6, ty - 1); c.lineTo(tx - 4.6, ty - 12); c.stroke();
  c.lineCap = 'butt';
  leafAt(c, tx - 10, ty - 17, 3.4, -0.4, hr('gold', GOLD, 0.2)); leafAt(c, tx - 4, ty - 13, 3, 0.6, hr('russet', RUSSET, 0.2));
  // (blood down the branch to the trunk, dripping off it into the leaves under him: a pool in stepped rings)
  if (how === 'him') {
    const px = PIERCE.x + 6;
    c.fillStyle = BLOOD[1]; c.beginPath(); c.ellipse(px, GY + 1, 20, 3.4, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = BLOOD[2]; c.beginPath(); c.ellipse(px - 2, GY + 0.6, 14, 2.4, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = BLOOD[3]; c.beginPath(); c.ellipse(px - 4, GY, 7, 1.4, 0, 0, Math.PI * 2); c.fill();
    box(c, px - 7, GY - 1, 3, 1, BLOOD[5]);
    for (const [dx, dy] of [[-12, 2], [14, 1], [22, 3]] as const) box(c, px + dx, GY + dy, 2, 1, BLOOD[2]);
  }
};

/** The bike Tucker stole, nosed into the oak and wrecked: on its tail against the trunk, the front wheel folded, the
 *  back one turning still, smoking; gas soaking into the leaves, the bark skinned where it hit. */
export const drawWreck = (c: Ctx, state: GameState) => {
  const f = state.frame, bx = TREE_X - TRUNK_W - 28, Rg = hr('rings', RINGS, 0.2);
  // (the bark skinned off where it hit: pale wood, splinters)
  box(c, TREE_X - TRUNK_W - 1, GY - 58, 6, 22, INK); box(c, TREE_X - TRUNK_W, GY - 57, 5, 20, Rg[4]); box(c, TREE_X - TRUNK_W, GY - 57, 2, 20, Rg[5]); box(c, TREE_X - TRUNK_W + 3, GY - 50, 2, 6, Rg[2]);
  // (the gas soaked into the leaves under it: dark, a rainbow sheen on it)
  c.fillStyle = '#1A1410'; c.beginPath(); c.ellipse(bx + 6, GY + 1, 24, 3.4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#2A2018'; c.beginPath(); c.ellipse(bx + 3, GY + 0.6, 16, 2.2, 0, 0, Math.PI * 2); c.fill();
  const sh = Math.floor(f / 12) % 4;
  for (let i = 0; i < 5; i++) box(c, bx - 8 + i * 4 + sh, GY, 3, 1, ['#7A4AB8', '#3A8AC8', '#4AB87A', '#C8B83A', '#C86A3A'][(i + sh) % 5]);
  c.save(); c.translate(bx, GY - 2); c.rotate(-0.55);
  drawDirtBike(c, 0, 0, 1, 1, 0, f * 0.05, TUCK_BIKE, 66);
  c.restore();
  // (busted plastic in the leaves: a shard of its fender, the number plate)
  box(c, bx - 30, GY - 3, 9, 3, INK); box(c, bx - 29, GY - 2, 7, 1, '#2563EB'); box(c, bx - 29, GY - 2, 3, 1, '#7AA8F8');
  box(c, bx + 26, GY - 4, 8, 4, INK); box(c, bx + 27, GY - 3, 6, 2, '#ECEAE2'); box(c, bx + 29, GY - 3, 2, 2, '#141414');
  // (its smoke, puffing off the engine: stepped puffs, lit on top, thinning in steps as they rise)
  for (let i = 0; i < 4; i++) {
    const t = (f * 0.012 + i / 4) % 1, k = Math.floor(t * 4) / 4;
    const px = Math.round(bx + 18 + Math.sin(t * 5 + i) * 6), py = Math.round(GY - 30 - t * 74), r = 5 + t * 12;
    c.globalAlpha = 0.62 - k * 0.5;
    pixelBlob(c, px, py, r, r * 0.8, '#4A4644'); pixelBlob(c, px - r * 0.25, py - r * 0.25, r * 0.66, r * 0.5, '#6E6A66'); pixelBlob(c, px - r * 0.4, py - r * 0.4, r * 0.3, r * 0.24, '#928C88');
  }
  c.globalAlpha = 1;
};

/** A revisit once he's dead: where it happened, his cap in the leaves and a dark stain gone brown, leaves blown over it. */
export const drawRemainsMark = (c: Ctx, state: GameState) => {
  const x = ARENA_L + 760;
  if (!onScreen(state, x - 80, x + 80)) return;
  put(c, 'ar-stain', x, GY, -64, -6, 128, 12, g => {
    const S = ['#1E0806', '#2E0E0A', '#40160E', '#562014'];
    g.fillStyle = S[0]; g.beginPath(); g.ellipse(0, 1, 56, 4.6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = S[1]; g.beginPath(); g.ellipse(-4, 0.8, 44, 3.6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = S[2]; g.beginPath(); g.ellipse(-10, 0.4, 26, 2.4, 0, 0, Math.PI * 2); g.fill();
    checker(g, -56, 0, 112, 2, S[1], 0);
    for (const [dx, dy] of [[-60, 2], [-52, 4], [58, 3], [50, 1], [64, 2]] as const) box(g, dx, dy, 2, 1, S[1]);
    for (let i = 0; i < 12; i++) leafAt(g, -50 + hash(i * 3.7) * 100, -1 + hash(i * 1.3) * 5, 2.4 + hash(i) * 1.4, hash(i * 2.2) * 3, [hr('gold', GOLD, 0.2), hr('brown', BROWN, 0.2), hr('russet', RUSSET, 0.2)][i % 3]);
  });
  drawTuckerCap(c, x + 30, GY - 4, 0.35);
};

/** The fight's boulder: real granite (gray, lichen, moss in its crack), its flat top a ledge (lit along its lip). Its
 *  bulk going back (the shared eye's: its top lit, the side he's looking at shaded) live (a few polygons), then its
 *  front, painted once. */
export const drawBoulder = (c: Ctx, state: GameState) => {
  if (!onScreen(state, ROCK_X - ROCK_HW - 30, ROCK_X + ROCK_HW + 30)) return;
  const Gr = hr('granite', GRANITE, 0.2);
  extrude(c, viewOf(state).eye, ROCK_PTS.map(([x, y]) => [ROCK_X + x, GY + y] as [number, number]), 0.94, Gr[5], Gr[1]);
  put(c, 'ar-boulder', ROCK_X, GY, -ROCK_HW - 30, -ROCK_H - 8, 2 * ROCK_HW + 62, ROCK_H + 14, paintBoulder);
};
/** The boulder's outline (about its foot's middle, convex: up its left, across its top, down its right). */
const ROCK_PTS: [number, number][] = (() => {
  const w = ROCK_HW, top = -ROCK_H, out: [number, number][] = [];
  const q = (p0: number[], p1: number[], p2: number[]) => { for (let i = 0; i <= 6; i++) { const t = i / 6, u = 1 - t; out.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]); } };
  q([-w - 18, 2], [-w - 14, top + 14], [-w + 4, top]);
  q([w - 2, top], [w + 16, top + 10], [w + 22, 2]);
  return out;
})();
const paintBoulder = (g: Ctx) => {
  const Gr = hr('granite', GRANITE, 0.2), Ms = hr('moss', MOSS, 0.2), L = hr('lip', LIP, 0.2), St = hr('straw', STRAW, 0.2);
  const w = ROCK_HW, h = ROCK_H, top = -h;
  const path = () => { g.beginPath(); ROCK_PTS.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };
  for (const [ox, oy] of [[0, -1], [-1, 0], [1, 0]] as const) { g.save(); g.translate(ox, oy); path(); g.fillStyle = INK; g.fill(); g.restore(); }
  g.save(); path(); g.clip();
  // (the body in facets, the way granite breaks: a lit shoulder up and left, the face, a lower shelf, the flank turned
  // away in shade; dithered where the light turns)
  box(g, -w - 30, top - 4, 2 * w + 62, h + 10, Gr[4]);
  const facet = (pts: number[], col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0], top + pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], top + pts[i + 1]); g.closePath(); g.fill(); };
  facet([-w - 24, -4, w - 10, -4, w - 18, 7, -6, 12, -w - 4, 20, -w - 24, 26], Gr[5]);
  facet([-w - 24, -4, 6, -4, -10, 4, -w - 2, 9, -w - 24, 14], Gr[6]);
  facet([-w - 24, h * 0.62, -20, h * 0.56, 30, h * 0.6, w + 30, h * 0.66, w + 30, h + 6, -w - 24, h + 6], Gr[3]);
  facet([w - 18, 7, w + 30, 6, w + 30, h + 6, w - 4, h + 6, w - 10, h * 0.6, w - 20, h * 0.3], Gr[2]);
  facet([w + 4, 12, w + 30, 12, w + 30, h + 6, w + 10, h + 6], Gr[1]);
  checker(g, -w - 24, top + 10, 2 * w + 10, 2, Gr[5], 0, 1); checker(g, -w - 24, top + 20, w + 16, 2, Gr[4], 1, 1);
  checker(g, w - 24, top + 10, 6, h, Gr[3], 0, 1); checker(g, w - 2, top + 14, 4, h, Gr[2], 1, 1);
  checker(g, -w - 24, top + h * 0.56, 2 * w + 40, 2, Gr[3], 0, 1);
  // (the joints between facets: a dark line, lit along its upper side)
  const joint = (pts: number[]) => {
    g.lineWidth = 1;
    g.strokeStyle = Gr[7]; g.beginPath(); g.moveTo(pts[0], top + pts[1] - 1); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], top + pts[i + 1] - 1); g.stroke();
    g.strokeStyle = Gr[0]; g.beginPath(); g.moveTo(pts[0], top + pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], top + pts[i + 1]); g.stroke();
  };
  joint([-w - 4, 20, -6, 12, w - 18, 7]);
  joint([-w - 24, h * 0.62 + 0.5, -20, h * 0.56 + 0.5, 30, h * 0.6 + 0.5, w - 10, h * 0.64]);
  // (exfoliation sheets: thin slabs peeling along its face, each a lit top over a shadowed underside)
  for (const [x0, x1, y] of [[-w - 10, -18, 30], [12, w - 14, 38], [-40, 4, 46]] as const) {
    box(g, x0, top + y, x1 - x0, 1, Gr[6]); box(g, x0 + 2, top + y + 1, x1 - x0 - 4, 1, Gr[1]); checker(g, x0 + 2, top + y + 2, x1 - x0 - 4, 2, Gr[2], 0, 1);
  }
  // (the granite's grain: pink feldspar and white quartz crystals, dark mica flecks)
  for (let n = 0; n < 120; n++) {
    const fx = Math.round(-w - 14 + hash(n * 2.1 + 0.3) * (2 * w + 32)), fy = Math.round(top + 3 + hash(n * 3.7 + 0.9) * (h - 8)), k = n % 5;
    if (k === 0) { box(g, fx, fy, 2, 1, '#C8A494'); box(g, fx, fy, 1, 1, '#E4C4B4'); }
    else if (k === 1) box(g, fx, fy, 1, 1, '#E4DED4');
    else box(g, fx, fy, k === 2 ? 2 : 1, 1, Gr[1]);
  }
  // (the quartz vein, lit along its top)
  g.lineWidth = 2; g.strokeStyle = Gr[1]; g.beginPath(); g.moveTo(-w - 8, top + 33); g.lineTo(-20, top + 42); g.lineTo(22, top + 37); g.stroke();
  g.lineWidth = 1.2; g.strokeStyle = '#E4DED4'; g.beginPath(); g.moveTo(-w - 8, top + 31.6); g.lineTo(-20, top + 40.6); g.lineTo(22, top + 35.6); g.stroke();
  // (the crack, moss down it in stepped cushions)
  g.lineWidth = 2; g.strokeStyle = Gr[0]; g.beginPath(); g.moveTo(6, top + 2); g.lineTo(12, top + 20); g.lineTo(6, top + 34); g.lineTo(10, 0); g.stroke();
  g.lineWidth = 1; g.strokeStyle = Gr[6]; g.beginPath(); g.moveTo(4, top + 3); g.lineTo(10, top + 20); g.lineTo(4, top + 34); g.stroke();
  for (const [mx, my, mr] of [[11, 19, 4], [7, 31, 4], [9, 45, 3]] as const) { pixelBlob(g, mx, top + my, mr, mr * 0.7, Ms[2], 1); pixelBlob(g, mx - 1, top + my - 1, mr * 0.7, mr * 0.45, Ms[4], 1); box(g, mx - 2, top + my - 2, 2, 1, Ms[6]); }
  // (lichen in rosettes, stepped rings: a dark rim, the body, a pale middle, crumbs round it)
  for (const [lx, ly, r, col] of [[-30, 18, 7, '#9AAA6A'], [24, 30, 8, '#C8B858'], [-8, 40, 5, '#9AAA6A'], [-44, 10, 4, '#D8C878'], [36, 12, 5, '#9AAA6A'], [-58, 30, 4, '#C8B858']] as const) {
    pixelBlob(g, lx, top + ly, r, r * 0.6, mix(col, '#000000', 0.35), 1);
    pixelBlob(g, lx, top + ly, r - 1, r * 0.6 - 1, col, 1);
    pixelBlob(g, lx - 1, top + ly - 1, r * 0.45, r * 0.28, mix(col, '#FFFFFF', 0.35), 1);
    for (let k = 0; k < 4; k++) box(g, Math.round(lx + Math.cos(k * 1.7) * (r + 1)), Math.round(top + ly + Math.sin(k * 1.7) * (r + 1) * 0.6), 1, 1, col);
  }
  // (its foot: the ground's shade on it, dithered up into the stone)
  bands(g, -w - 30, -10, 2 * w + 62, 12, [Gr[2], Gr[1], Gr[1], Gr[0]]); checker(g, -w - 30, -12, 2 * w + 62, 2, Gr[2], 0, 1);
  g.restore();
  // (moss heaped against it in cushions, dry grass up round it)
  for (let x = -w - 14; x < w + 18; x += 7) if (hash(x * 1.1) > 0.4) {
    const mh = 4 + hash(x * 3) * 5;
    pixelBlob(g, x, -mh * 0.5, 5, mh * 0.6, INK, 1); pixelBlob(g, x, -mh * 0.5, 4, mh * 0.6 - 1, Ms[3], 1); pixelBlob(g, x - 1, -mh * 0.7, 2.5, mh * 0.3, Ms[5], 1);
  }
  for (let x = -w - 24; x < w + 28; x += 3) if (hash(x * 0.77 + 4) > 0.55) { const gh = 3 + hash(x * 2.3) * 7; box(g, x, -gh + 2, 1, gh, St[hash(x) > 0.6 ? 5 : 4]); box(g, x + 1, -gh + 4, 1, gh - 2, St[2]); }
  // (the lit lip: it's a ledge)
  box(g, -w + 4, top - 1, 2 * w - 6, 1, INK); box(g, -w + 4, top, 2 * w - 6, 1, L[3]); box(g, -w + 4, top + 1, 2 * w - 6, 1, L[2]); box(g, -w + 6, top + 2, 2 * w - 10, 1, L[1]);
  for (let x = -w + 8; x < w - 6; x += 6) if (hash(x * 1.3) > 0.5) { box(g, x, top - 3, 1, 3, St[5]); box(g, x + 1, top - 2, 1, 2, St[3]); }
};

// ---------------------------------------------------------------------------------------------------------------
// The axe tree (the arena entry): a tall fir past the oak, a lumberjack's axe stuck in its near side; the stump once
// it's chopped through, the trunk coming down, then down along the ground (scenery: nothing to stand on); the axe
// planted in the stump after (scenery, not a pickup)

/** The fir above the cut, in its own frame: its butt's middle at the origin, up along -y `len` long. Bark banded across
 *  (lit left), its plates; the boughs in stepped tiers from a third of the way up to the spire. */
const pineTrunk = (g: Ctx, len: number, tr: number, seed: number) => {
  const B = hr('bark', BARK, 0.2), N = firOf(hr('needle', NEEDLE, 0.2));
  const strip = (u0: number, u1: number, col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(u0 * tr, 0); g.lineTo(u0 * 2, -len); g.lineTo(u1 * 2, -len); g.lineTo(u1 * tr, 0); g.closePath(); g.fill(); };
  g.fillStyle = INK; g.beginPath(); g.moveTo(-tr - 1, 1); g.lineTo(-3, -len); g.lineTo(3, -len); g.lineTo(tr + 1, 1); g.closePath(); g.fill();
  strip(-1, 1, B[3]); strip(-1, -0.55, B[4]); strip(-0.92, -0.74, B[5]); strip(0.45, 1, B[2]); strip(0.78, 1, B[1]);
  // (its bark in plates: dark furrows between, each plate's top catching the light)
  for (let y = -6; y > -len * 0.72; y -= 7) {
    const wy = tr + (2 - tr) * (-y / len);
    for (let k = 0; k < 3; k++) { const px = -wy * 0.7 + ((k * wy * 0.6 + (y * 13) % 5 + 5) % (wy * 1.4)); box(g, Math.round(px), y, 3, 1, B[1]); box(g, Math.round(px), y - 1, 3, 1, px < 0 ? B[6] : B[4]); }
  }
  // (the boughs: from the bottom tier (widest, darkest) up to the spire)
  const tiers = 7;
  for (let k = tiers - 1; k >= 0; k--) {
    const t = k / (tiers - 1), ty = -len + 6 + t * len * 0.58, half = 6 + t * len * 0.2 * (0.9 + hash(seed + k) * 0.2), th = len * 0.13 + t * 6;
    const droop = th * 0.25, jag = (i: number) => (hash(seed + k * 13 + i) - 0.5) * 4;
    const edge: [number, number][] = [];
    for (let i = 0; i <= 8; i++) { const u = i / 8; edge.push([-half + u * half * 2 + jag(i), ty + th - Math.sin(u * Math.PI) * droop * 0.4 + (i % 2) * 3]); }
    const shape = () => { g.moveTo(0, ty - 2); g.lineTo(half * 0.5, ty + th * 0.45); for (let i = edge.length - 1; i >= 0; i--) g.lineTo(edge[i][0], edge[i][1]); g.lineTo(-half * 0.5, ty + th * 0.45); g.closePath(); };
    g.save(); g.fillStyle = INK; g.translate(0, 1.5); g.beginPath(); shape(); g.fill(); g.restore();
    g.fillStyle = N[2]; g.beginPath(); shape(); g.fill();
    g.save(); g.beginPath(); shape(); g.clip();
    box(g, -half - 2, ty + th * 0.55, half * 2 + 4, th, N[1]);
    g.fillStyle = N[3]; g.beginPath(); g.moveTo(0, ty); g.lineTo(-half - 2, ty + th + 4); g.lineTo(half * 0.2, ty + th + 4); g.closePath(); g.fill();
    g.fillStyle = N[4]; g.beginPath(); g.moveTo(-1, ty); g.lineTo(-half - 2, ty + th * 0.9); g.lineTo(-half * 0.4, ty + th * 0.9); g.closePath(); g.fill();
    checker(g, -half, ty + th * 0.55, half * 1.2, 2, N[3], k % 2);
    for (let i = 0; i < half / 3; i++) { const nx = -half + hash(seed + k * 7 + i) * half * 1.6, ny = ty + 4 + hash(seed + k * 3 + i * 1.7) * th * 0.7; box(g, nx, ny, 2, 3, nx < 0 ? N[5] : N[2]); }
    g.restore();
    for (let i = 0; i < edge.length; i += 2) box(g, edge[i][0] - 1, edge[i][1] - 1, 2, 3, edge[i][0] < 0 ? N[4] : N[1]);
  }
  g.fillStyle = INK; g.beginPath(); g.moveTo(0, -len - 4); g.lineTo(5, -len + 12); g.lineTo(-5, -len + 12); g.closePath(); g.fill();
  g.fillStyle = N[4]; g.beginPath(); g.moveTo(0, -len - 2); g.lineTo(3, -len + 10); g.lineTo(-3, -len + 10); g.closePath(); g.fill();
};

/** The stump (the trunk's foot below the cut), its roots spread, in its own frame (its foot's middle at the origin). */
const paintStump = (g: Ctx, cut: boolean) => {
  const B = hr('bark', BARK, 0.2), Rg = hr('rings', RINGS, 0.2), Ms = hr('moss', MOSS, 0.2), w = AXE_TR, top = -CUT_H;
  const path = (e: number) => { g.beginPath(); g.moveTo(-w - 12 - e, 2); g.quadraticCurveTo(-w - 1 - e, -6, -w - 1 - e, top - (e ? 1 : 0)); g.lineTo(w + 1 + e, top - (e ? 1 : 0)); g.quadraticCurveTo(w + 1 + e, -6, w + 12 + e, 2); g.closePath(); };
  path(1); g.fillStyle = INK; g.fill();
  g.save(); path(0); g.clip();
  box(g, -w - 14, top, 2 * w + 28, CUT_H + 4, B[3]); box(g, -w - 14, top, w * 0.5 + 14, CUT_H + 4, B[4]); box(g, -w + 1, top, 2, CUT_H + 4, B[5]); box(g, w - 4, top, 20, CUT_H + 4, B[2]); box(g, w + 2, top, 20, CUT_H + 4, B[1]);
  checker(g, -w + 3, top, 4, CUT_H + 4, B[4], 0, 1); checker(g, w - 6, top, 4, CUT_H + 4, B[3], 1, 1);
  // (its bark in plates (the trunk's above): dark furrows between, each plate's top catching the light)
  for (let y = top + 3; y < -6; y += 6) for (let k = 0; k < 3; k++) {
    const px = -w + 2 + ((k * 8 + ((y * 13) & 7)) % (2 * w - 4));
    box(g, px, y, 4, 1, B[1]); box(g, px, y - 1, 4, 1, px < 0 ? B[6] : B[4]); box(g, px + 4, y - 3, 1, 4, B[1]);
  }
  // (the root flare: ridges running out each side, lit along their tops)
  for (const [rx, dir] of [[-w + 2, -1], [-w + 7, -1], [w - 6, 1], [w - 2, 1]] as const) {
    g.strokeStyle = B[1]; g.lineWidth = 3; g.beginPath(); g.moveTo(rx, -14); g.quadraticCurveTo(rx + dir * 2, -3, rx + dir * 12, 2); g.stroke();
    g.strokeStyle = dir < 0 ? B[5] : B[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(rx - 1, -14); g.quadraticCurveTo(rx + dir * 2 - 1, -4, rx + dir * 12 - 1, 0); g.stroke();
  }
  g.restore();
  // (moss up round its foot in stepped cushions, lit on top)
  for (let x = -w - 10; x < w + 12; x += 5) if (hash(x * 1.9) > 0.5) { const mh = 3 + hash(x) * 4; pixelBlob(g, x, -mh * 0.5, 3.5, mh * 0.6, Ms[2], 1); pixelBlob(g, x - 1, -mh * 0.7, 2, mh * 0.3, Ms[4], 1); box(g, x - 1, -mh, 1, 1, Ms[6]); }
  if (!cut) return;
  // (the cut's face: pale, its rings, the heart darker, the splintered hinge on the far side where it broke)
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, top, w + 1, 4, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = Rg[4]; g.beginPath(); g.ellipse(0, top, w, 3, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = Rg[5]; g.beginPath(); g.ellipse(-2, top - 0.6, w * 0.6, 1.6, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = Rg[2]; g.lineWidth = 0.8; for (const r of [3, 6, 9]) { g.beginPath(); g.ellipse(0, top, Math.min(r, w - 1), Math.min(r, w - 1) * 0.27, 0, 0, Math.PI * 2); g.stroke(); }
  box(g, -1, top - 1, 2, 2, Rg[1]);
  g.fillStyle = INK; g.beginPath(); g.moveTo(w - 6, top); g.lineTo(w - 3, top - 8); g.lineTo(w - 1, top - 3); g.lineTo(w + 1, top - 7); g.lineTo(w + 1, top); g.closePath(); g.fill();
  g.fillStyle = Rg[3]; g.beginPath(); g.moveTo(w - 5, top - 0.5); g.lineTo(w - 3, top - 6); g.lineTo(w - 1.5, top - 2); g.lineTo(w, top - 5); g.lineTo(w, top - 0.5); g.closePath(); g.fill();
  // (the chips thrown round it)
  for (let i = 0; i < 9; i++) { const cx = -w - 26 + hash(i * 4.3) * (2 * w + 52), cy = -1 + hash(i * 2.1) * 4; box(g, cx, cy, 3, 2, INK); box(g, cx, cy, 2, 1, Rg[4]); }
};

/** Where the trunk's butt is (world): on the cut, sliding off the stump to the ground as it lands (`drop` 0..1). */
const buttAt = (drop: number) => ({ x: AXE_TREE_X + (LOG_X - AXE_TREE_X) * drop, y: GY - CUT_H + (CUT_H - AXE_TR) * drop * drop });

/** The trunk above the cut, tipped `th` (radians from upright, toward the right) about its butt (live: it's moving). */
const trunkAt = (c: Ctx, th: number, drop: number, clipGround: boolean) => {
  const b = buttAt(drop);
  c.save();
  if (clipGround) { c.beginPath(); c.rect(b.x - 400, GY - 900, 1200, 900 + 3); c.clip(); }
  c.translate(b.x, b.y); c.rotate(th);
  pineTrunk(c, LOG_LEN, AXE_TR, 77);
  c.restore();
};

/** The trunk down along the ground (its butt at the origin, lying to the right; cut to the ground): turned over in
 *  the paint (cached once), its boughs crushed under it, needles shaken off round it, a long shadow under it. Its top
 *  kept in the bark's middle tones, never a lit lip (it's no ledge). */
const paintLog = (g: Ctx) => {
  const N = firOf(hr('needle', NEEDLE, 0.2)), Df = hr('duff', DUFF, 0.2);
  const B = hr('bark', BARK, 0.2), Rg = hr('rings', RINGS, 0.2), St = hr('straw', STRAW, 0.2);
  // (its shadow along the ground, under it: banded, dithered out at its edges, thinning toward the spire)
  box(g, -6, AXE_TR - 2, LOG_LEN * 0.6, 3, Df[0]); box(g, LOG_LEN * 0.6 - 6, AXE_TR - 2, LOG_LEN * 0.4 + 36, 2, Df[1]);
  checker(g, -6, AXE_TR - 4, LOG_LEN + 30, 2, Df[1], 0, 1); checker(g, -6, AXE_TR + 1, LOG_LEN * 0.6, 2, Df[1], 1, 1);
  // (the meadow grass it came down on, crushed flat and splayed out under it)
  for (let x = -4; x < LOG_LEN + 20; x += 4) if (hash(x * 0.61 + 3) > 0.5) { box(g, x, AXE_TR, 4, 1, St[hash(x) > 0.5 ? 4 : 3]); box(g, x + 3, AXE_TR - 1, 3, 1, St[2]); }
  g.save(); g.beginPath(); g.rect(-60, -400, LOG_LEN + 200, 400 + AXE_TR + 2); g.clip();
  g.rotate(Math.PI / 2);
  pineTrunk(g, LOG_LEN, AXE_TR, 77);
  g.restore();
  // (the top dulled: no light along it (it isn't somewhere to stand))
  g.save(); g.globalAlpha = 0.45; box(g, 0, -AXE_TR - 1, LOG_LEN * 0.4, 4, hr('bark', BARK, 0.2)[2]); g.restore();
  // (the butt's axe-cut end, toward him: pale wood in rings, the heart darker, the hinge's splinters torn out of it)
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, 0, 4, AXE_TR + 1, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = Rg[3]; g.beginPath(); g.ellipse(0, 0, 3, AXE_TR, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = Rg[5]; g.beginPath(); g.ellipse(-1, -2, 1.6, AXE_TR * 0.6, 0, 0, Math.PI * 2); g.fill();
  for (const ry of [-7, -4, 4, 7]) box(g, -1, ry, 2, 1, Rg[2]);
  box(g, -1, -1, 2, 2, Rg[1]);
  for (const [sy, sl] of [[-AXE_TR + 2, 7], [-3, 5], [4, 8]] as const) { g.fillStyle = INK; g.beginPath(); g.moveTo(-2, sy - 1); g.lineTo(-2 - sl, sy + 1); g.lineTo(-2, sy + 3); g.closePath(); g.fill(); g.fillStyle = Rg[4]; g.beginPath(); g.moveTo(-2, sy); g.lineTo(-sl + 1, sy + 1); g.lineTo(-2, sy + 2); g.closePath(); g.fill(); }
  // (chips and sawdust round the butt)
  for (let i = 0; i < 10; i++) { const cx = -26 + hash(i * 4.7 + 1) * 40, cy = AXE_TR - 2 + hash(i * 2.3 + 1) * 3; box(g, cx, cy, 3, 2, INK); box(g, cx, cy, 2, 1, Rg[4 + (i % 2)]); }
  // (needles shaken off round it)
  for (let i = 0; i < 40; i++) { const nx = LOG_LEN * 0.3 + hash(i * 1.9) * LOG_LEN * 0.8, ny = AXE_TR - 1 + hash(i * 3.1) * 3; box(g, nx, ny, 3, 1, N[2 + (i % 3)]); }
  // (a bough snapped off in the fall, lying by it: stepped bark, its spray of needles in tufts, lit up and left)
  const sx = LOG_LEN * 0.5, sy = AXE_TR;
  g.lineCap = 'round';
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + 30, sy - 2); g.moveTo(sx + 14, sy - 1); g.lineTo(sx + 22, sy - 7); g.stroke();
  g.strokeStyle = B[3]; g.lineWidth = 2; g.stroke();
  g.strokeStyle = B[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(sx, sy - 1); g.lineTo(sx + 30, sy - 3); g.stroke();
  g.lineCap = 'butt';
  box(g, sx - 2, sy - 2, 3, 3, INK); box(g, sx - 1, sy - 1, 1, 1, Rg[4]);
  for (const [tx, ty, tr] of [[sx + 32, sy - 3, 6], [sx + 24, sy - 8, 5], [sx + 20, sy - 1, 4]] as const) {
    pixelBlob(g, tx, ty, tr + 1, tr * 0.6 + 1, INK, 1); pixelBlob(g, tx, ty, tr, tr * 0.6, N[2], 1); pixelBlob(g, tx - 1, ty - 1, tr * 0.6, tr * 0.35, N[4], 1);
    for (let k = 0; k < 5; k++) box(g, Math.round(tx - tr + hash(tx + k) * tr * 2), Math.round(ty - tr * 0.5 + hash(ty + k * 1.7) * tr), 2, 1, k % 2 ? N[5] : N[1]);
  }
};

/** A lumberjack's axe, its head at (hx, hy), the handle back from it along angle `a` (butt to head): hickory, the head
 *  painted red, the bit ground bright; `buried`: its bit's in the wood (not drawn). Its handle's 33 long. */
const axeAt = (c: Ctx, hx: number, hy: number, a: number, buried: boolean) => {
  const dx = Math.cos(a), dy = Math.sin(a), bx = hx - dx * 33, by = hy - dy * 33, nx = -dy, ny = dx;
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(bx, by); c.lineTo(hx, hy); c.stroke();
  c.strokeStyle = '#7A4E24'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(bx, by); c.lineTo(hx, hy); c.stroke();
  c.strokeStyle = '#C08A4A'; c.lineWidth = 1; c.beginPath(); c.moveTo(bx + nx * 0.7, by + ny * 0.7); c.lineTo(hx + nx * 0.7, hy + ny * 0.7); c.stroke();
  // (the knob at its butt, a grip worn dark)
  c.strokeStyle = '#4A2E14'; c.lineWidth = 3; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + dx * 7, by + dy * 7); c.stroke();
  c.lineCap = 'butt';
  c.save(); c.translate(hx, hy); c.rotate(a);
  const poly2 = (pts: number[], col: string) => { c.fillStyle = col; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fill(); };
  const reach = buried ? 3 : 10;
  poly2([-3.6, -6.2, 3.6, -6.2, 3.6, Math.min(2.2, reach), -3.6, Math.min(2.2, reach)], INK);
  poly2([-2.6, -5.2, 2.6, -5.2, 2.6, Math.min(2.2, reach), -2.6, Math.min(2.2, reach)], '#A81C1C');
  poly2([-2.6, -5.2, -1, -5.2, -1, Math.min(2.2, reach), -2.6, Math.min(2.2, reach)], '#D83A2A');
  c.fillStyle = '#5A0E0E'; c.fillRect(1.4, -5.2, 1.2, Math.min(7.4, reach + 5.2));
  c.fillStyle = '#C8CCD2'; c.fillRect(-2.6, -6, 5.2, 1);
  if (!buried) {
    poly2([-3.6, 2, 3.6, 2, 5.8, 10.2, -5.8, 10.2], INK); poly2([-2.6, 2.2, 2.6, 2.2, 4.6, 9, -4.6, 9], '#A81C1C');
    poly2([-4.2, 6.4, 4.2, 6.4, 4.6, 9, -4.6, 9], '#A8ACB4'); poly2([-4.4, 8, 4.4, 8, 4.6, 9, -4.6, 9], '#EEF2F6');
  }
  c.restore();
};

/** The axe tree in the world (behind the cast): standing with the axe in it; the stump once it's chopped (the axe planted
 *  in it after); the trunk down along the ground. (Coming down it's drawn in front: drawFallingTree.) */
export const drawAxeTree = (c: Ctx, state: GameState, s: Arena) => {
  if (!onScreen(state, AXE_TREE_X - 200, LOG_X + LOG_LEN + 120)) return;
  const x = AXE_TREE_X, w = AXE_TR, top = GY - CUT_H;
  if (s.tree === 'up') {
    put(c, 'ar-axetree', x, GY, -80, -CUT_H - LOG_LEN - 8, 160, CUT_H + LOG_LEN + 12, g => {
      paintStump(g, false);
      g.save(); g.translate(0, -CUT_H); pineTrunk(g, LOG_LEN, AXE_TR, 77); g.restore();
      // (a few old chops round where it'll be cut: pale wedges in the bark)
      const Rg = hr('rings', RINGS, 0.2);
      for (const dy of [-14, 9]) { g.fillStyle = INK; g.beginPath(); g.moveTo(-w - 1, -CUT_H + dy - 4); g.lineTo(-w + 6, -CUT_H + dy); g.lineTo(-w - 1, -CUT_H + dy + 3); g.closePath(); g.fill(); g.fillStyle = Rg[4]; g.beginPath(); g.moveTo(-w, -CUT_H + dy - 3); g.lineTo(-w + 5, -CUT_H + dy); g.lineTo(-w, -CUT_H + dy + 2); g.closePath(); g.fill(); }
    });
    if (s.axe === 'tree') axeAt(c, MH_CHOP_X + 34.8, GY - 54.2, -0.7, true);
    return;
  }
  // ---- chopped through: the stump and its cut face
  put(c, 'ar-stump', x, GY, -60, -CUT_H - 12, 120, CUT_H + 16, g => paintStump(g, true));
  if (s.tree === 'down') put(c, 'ar-log', LOG_X, GY - AXE_TR, -40, -AXE_TR - 120, LOG_LEN + 120, 2 * AXE_TR + 125, paintLog);
  if (s.axe === 'stump') axeAt(c, x + 2, top + 1, 0.93, true);
};

/** The trunk coming down (in front of everybody: it comes down on his head). */
export const drawFallingTree = (c: Ctx, s: Arena) => {
  if (s.tree === 'falling') trunkAt(c, s.treeTh, s.treeDrop, s.treeDrop > 0);
};

/** The leaves (shaken off the oak, burst off the branch), in front: stepped, turning as they fall. */
const LEAF_RAMPS = new Map<string, string[]>();
const leafRamp = (col: string) => { let r = LEAF_RAMPS.get(col); if (!r) { r = rampOf(col); LEAF_RAMPS.set(col, r); } return r; };
export const drawLeaves = (c: Ctx, s: Arena) => {
  for (const l of s.leaves) leafAt(c, l.x, l.y, 3.6, l.rot, leafRamp(l.col));
};
export const tickLeaves = (s: Arena) => {
  for (const l of s.leaves) { l.vy = Math.min(1.4, l.vy + 0.16); l.vx *= 0.97; l.x += l.vx + Math.sin(l.life * 0.1) * 0.4; l.y += l.vy; l.rot += l.vr; l.life--; if (l.y > GY + 2) { l.y = GY + 2; l.vx = 0; l.vr = 0; } }
  s.leaves = s.leaves.filter(l => l.life > 0);
};
export const leafBurst = (s: Arena, x: number, y: number, n: number, up = 6, spread = 80) => {
  for (let i = 0; i < n; i++) s.leaves.push({ x: x + (Math.random() - 0.5) * spread, y: y - Math.random() * 30, vx: (Math.random() - 0.5) * 6, vy: -Math.random() * up, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, col: ['#B45309', '#D97706', '#92400E', '#CA8A04', '#7C2D12'][i % 5], life: 200 + Math.random() * 90 });
};
