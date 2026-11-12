// TUCKER's place in hell (GREED): HELL'S WILDERNESS. He sold the whole forest to a logging company for a raise. Now he
// walks it forever, blind and lost: nothing but stumps with SOLD tags on them and dead snags, his timber company's
// signs, and heaps of gold all over that he walks straight past and never sees. A gold coin for a moon. Cold blue-black,
// gold glints, embers far off. Painted once (the stills kept per hour; the sky and its tiles baked); live: the far
// layers slid by the camera, the ash coming down.
//
//   - the sky (screen space, the land's far off hidden): blue-black down to an ember glow along the horizon, the coin
//     moon (IN GREED WE TRUST round its rim), smoke; two far layers slid by: a ridge of dead forest (snag spikes, fires
//     here and there), then a nearer one with the timber company's mill on it (stacks, a lit window, its sign);
//   - the woods behind the glade (frontier/arena/art.ts ARENA_HOOKS.trees, in place of the land's): the back rank a
//     tile of dead snags and stumps (three of them, so it doesn't repeat), then the things stood back on the ground,
//     each at its own depth (one eye, deepest first): snags with SOLD tags nailed on, fresh-cut stumps, gold heaps,
//     a chest spilling over, the company's signs on their posts;
//   - the sign before the glade (ARENA_HOOKS.sign): YOU ARE IN GREED COUNTRY, routed, a SOLD sticker slapped on it.

import type { GameState } from '../../../../m1/game/core/state';
import type { HellPlace } from '../defs';
import type { View } from '../../../frontier/wilds/paint';
import { atDepth, seen as seenAt, still } from '../../../frontier/wilds/paint';
import { GY, ARENA_L } from '../../../frontier/arena/layout';
import { pixelBlob, pixelRidge } from '../../../../m1/game/render/pixelArt';
import {
  type Ctx, type Look, W, H, INK, h01, box, poly, line, mix, bake, strip, sign,
  bandedGradient, hazeBands, steppedGlow, checker, signText, motes,
} from './kitPA';

/** Dead wood, cold (darkest first). */
const DEAD = ['#04060A', '#0A0E16', '#121824', '#1C2434', '#2A3448', '#3E4C64'];
/** The cut tops of stumps: pale, fresh. */
const CUT = ['#2A2016', '#4A3A26', '#6E5A3C', '#92805A', '#B4A27A', '#D2C49C'];
const GOLDR = ['#3A2404', '#6A4608', '#9A6E10', '#C8981C', '#E8C03A', '#FFE680'];
const TAG = ['#4A1404', '#7A2408', '#B03A0C', '#E05A14', '#F8883A', '#FFC08A'];
const BOARD = ['#120C06', '#20160C', '#342414', '#4A361E', '#62492A', '#7E6038'];
const EMBER = ['#FFE08A', '#F8A030', '#C8501A', '#6A2010'];

// ---------------------------------------------------------------------------------------------------------------
// The sky and the far layers (screen space)

const HZ = 372;
const paintSky = (g: Ctx) => {
  bandedGradient(g, 0, 0, W, HZ, ['#010205', '#03050A', '#060A12', '#0A101C', '#101828', '#182032', '#261E28', '#3E2420', '#64301A', '#8A4218'], 16);
  box(g, 0, HZ, W, H - HZ, '#07090E');
  // (the moon: a gold coin, IN GREED WE TRUST round it, a profile struck on it: his)
  const mx = 560, my = 92, r = 42;
  steppedGlow(g, mx, my, 120, '#C8981C', 0.16, 0, 6);
  g.fillStyle = INK; g.beginPath(); g.arc(mx, my, r + 2, 0, Math.PI * 2); g.fill();
  g.fillStyle = GOLDR[2]; g.beginPath(); g.arc(mx, my, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = GOLDR[3]; g.beginPath(); g.arc(mx - 2, my - 2, r - 3, 0, Math.PI * 2); g.fill();
  g.fillStyle = GOLDR[4]; g.beginPath(); g.arc(mx - 5, my - 5, r - 12, 0, Math.PI * 2); g.fill();
  checker(g, mx - r, my + 6, r * 2, 2, GOLDR[3], 0, 2);
  // (the reeded rim)
  for (let k = 0; k < 48; k++) { const a = (k / 48) * Math.PI * 2; box(g, mx + Math.cos(a) * (r - 1), my + Math.sin(a) * (r - 1), 1, 1, k % 2 ? GOLDR[1] : GOLDR[5]); }
  g.strokeStyle = GOLDR[2]; g.lineWidth = 1; g.beginPath(); g.arc(mx, my, r - 9, 0, Math.PI * 2); g.stroke();
  // (the profile: a conductor's cap, a big nose, a chin, struck in relief)
  poly(g, [[mx - 12, my - 16], [mx + 10, my - 16], [mx + 14, my - 10], [mx - 14, my - 10]], GOLDR[1]);
  poly(g, [[mx - 10, my - 10], [mx + 6, my - 10], [mx + 8, my - 2], [mx + 15, my + 2], [mx + 8, my + 5], [mx + 8, my + 10], [mx + 2, my + 16], [mx - 10, my + 16]], GOLDR[1]);
  poly(g, [[mx - 9, my - 9], [mx + 5, my - 9], [mx + 7, my - 2], [mx + 13, my + 2], [mx + 7, my + 4], [mx + 7, my + 9], [mx + 1, my + 14], [mx - 9, my + 14]], GOLDR[5]);
  box(g, mx + 1, my - 4, 3, 1, GOLDR[1]);
  const ring: Look = { sx: 1, sy: 1, fill: GOLDR[1], gap: 1 };
  const words = 'IN GREED WE TRUST';
  for (let i = 0; i < words.length; i++) {
    const a = -Math.PI * 0.92 + (i / (words.length - 1)) * Math.PI * 0.84;
    signText(g, words[i], Math.round(mx + Math.cos(a) * (r - 5)), Math.round(my + Math.sin(a) * (r - 5) + 3), ring);
  }
  // (smoke banks: blue-black, ember under the low ones)
  for (let k = 0; k < 24; k++) {
    const x = h01(k * 4.1) * (W + 200) - 100, y = 20 + h01(k * 2.3) * 250, rw = 60 + h01(k * 6.1) * 120, rh = 5 + h01(k * 1.7) * 9;
    if (Math.abs(x - mx) < 80 && Math.abs(y - my) < 50) continue;
    pixelBlob(g, x, y + 3, rw, rh, y > 200 ? '#3A2420' : '#0E1422');
    pixelBlob(g, x + 6, y, rw * 0.92, rh * 0.8, y > 200 ? '#140E14' : '#060912');
  }
  // (a few stars, cold)
  for (let k = 0; k < 40; k++) { const x = h01(k * 9.7) * W, y = h01(k * 3.3) * 180; if (Math.hypot(x - mx, y - my) > 60) box(g, x, y, 1, 1, k % 4 ? '#5A6A8A' : '#AAB8D8'); }
};

/** The far ridge: dead forest along it, snag spikes up off it, fires here and there (a tile W wide, 160 tall). */
const RIDGE_H = 160;
const ridgeAt = (x: number, a: number, b: number, s: number) => a + Math.sin(x * 0.011 + s) * b + Math.sin(x * 0.027 + s * 2) * b * 0.4;
const paintFarRidge = (g: Ctx) => {
  const top = (x: number) => ridgeAt(x, 92, 14, 1);
  const wrapTop = (x: number) => top(((x % W) + W) % W) * (1 - Math.max(0, (x % W) - (W - 60)) / 60) + top(0) * (Math.max(0, (x % W) - (W - 60)) / 60);
  pixelRidge(g, 0, W, RIDGE_H, wrapTop, 0, { fill: '#0C1220', rim: '#1A2438', lit: '#22304A' }, 1, 2);
  // (snags up off it, thin and black; the odd one burning)
  for (let k = 0; k < 70; k++) {
    const x = Math.round(h01(k * 3.9) * W), y0 = wrapTop(x), h = 8 + h01(k * 7.1) * 22;
    box(g, x, y0 - h, 1 + (k % 3 === 0 ? 1 : 0), h, '#0C1220');
    if (k % 4 === 0) box(g, x + (k % 2 ? 1 : -2), y0 - h * 0.6, 3, 1, '#0C1220');
    if (k % 13 === 0) { steppedGlow(g, x, y0 - 2, 14, '#C8501A', 0.3, 0, 3); box(g, x - 1, y0 - 5, 3, 4, EMBER[2]); box(g, x, y0 - 6, 1, 3, EMBER[1]); }
  }
  hazeBands(g, 0, RIDGE_H - 40, W, 40, '#3A2420', 0, 0.55, 5, 2);
};
/** The nearer ridge: blacker, its snags bigger, the timber company's mill on it (a tile W wide, 200 tall). */
const MID_H = 200;
const paintMidRidge = (g: Ctx) => {
  const top = (x: number) => {
    const xx = ((x % W) + W) % W, k = Math.max(0, xx - (W - 80)) / 80;
    return ridgeAt(xx, 128, 18, 4) * (1 - k) + ridgeAt(0, 128, 18, 4) * k;
  };
  pixelRidge(g, 0, W, MID_H, top, 0, { fill: '#070A12', rim: '#121A2A', lit: '#18223A' }, 1, 2);
  for (let k = 0; k < 40; k++) {
    const x = Math.round(h01(k * 5.3 + 2) * W), y0 = top(x), h = 14 + h01(k * 2.9) * 36;
    if (x > 300 && x < 470) continue;
    poly(g, [[x - 1, y0], [x, y0 - h], [x + 2, y0]], '#070A12');
    if (k % 3 === 0) line(g, [[x, y0 - h * 0.55], [x + (k % 2 ? 6 : -6), y0 - h * 0.7]], '#070A12', 1);
  }
  // (the mill: a long shed, two stacks, the saw's shed lit, its sign on the roof)
  const mx = 330, my = top(380) + 4;
  box(g, mx, my - 30, 130, 30, '#070A12'); poly(g, [[mx - 4, my - 30], [mx + 65, my - 46], [mx + 134, my - 30]], '#070A12');
  box(g, mx + 2, my - 29, 126, 1, '#18223A');
  for (const [sx, sh] of [[mx + 20, 70], [mx + 104, 56]] as const) { box(g, sx, my - 30 - sh, 8, sh, '#070A12'); box(g, sx, my - 30 - sh, 1, sh, '#18223A'); box(g, sx - 1, my - 32 - sh, 10, 3, '#070A12'); }
  for (let k = 0; k < 5; k++) { box(g, mx + 14 + k * 22, my - 20, 8, 6, k === 2 ? EMBER[1] : '#5A3418'); box(g, mx + 14 + k * 22, my - 20, 8, 1, k === 2 ? EMBER[0] : '#8A4A1E'); }
  steppedGlow(g, mx + 62, my - 16, 30, '#C8501A', 0.22, 0, 4);
  box(g, mx + 22, my - 62, 88, 12, '#070A12');
  signText(g, 'TUCKER TIMBER', mx + 66, my - 53, { sx: 1, sy: 1, fill: EMBER[1], gap: 1 });
  // (the stacks' smoke, drifting off right)
  for (const [sx, sh] of [[mx + 24, 70], [mx + 108, 56]] as const) for (let k = 0; k < 6; k++) pixelBlob(g, sx + k * 9, my - 36 - sh - k * 6, 6 + k * 2, 3 + k, k < 2 ? '#1A1A24' : '#121620');
  hazeBands(g, 0, MID_H - 34, W, 34, '#1A1418', 0, 0.6, 5, 2);
};

const skyLive = (c: Ctx, state: GameState) => {
  const cam = state.camera.x, f = state.frame;
  strip(c, bake('rf4-fr-far', W, RIDGE_H, paintFarRidge), cam * 0.04, HZ - RIDGE_H + 12);
  strip(c, bake('rf4-fr-mid', W, MID_H, paintMidRidge), cam * 0.1 + 260, HZ - MID_H + 40);
  // (ash coming down, gray; an ember or two going up)
  motes(c, f, 22, ['#4A5262', '#6A7282', '#3A404E'], true, 0.6);
  motes(c, f + 300, 5, [EMBER[1], EMBER[2]], false, 0.8);
};

export const frontierPlace: HellPlace = {
  light: { dark: 0.38, shade: [6, 10, 26], grade: '#C4CCE8' },
  sky: { paint: paintSky, alpha: 1 },
  skyLive,
};

// ---------------------------------------------------------------------------------------------------------------
// The woods behind the glade (world space, each at its depth; feet at (0, 0) in each painter)

/** A SOLD tag nailed up (its middle at x, y): orange card, a nail, the word. */
const soldTag = (g: Ctx, x: number, y: number, s = 1, tilt = 0) => {
  const w = Math.round(22 * s), h = Math.round(11 * s), x0 = Math.round(x - w / 2), y0 = Math.round(y - h / 2) + tilt;
  box(g, x0 - 1, y0 - 1, w + 2, h + 2, INK);
  box(g, x0, y0, w, h, TAG[3]); box(g, x0, y0, w, 1, TAG[5]); box(g, x0, y0 + h - 2, w, 2, TAG[2]); box(g, x0 + w - 1, y0, 1, h, TAG[1]);
  box(g, x0 + 2, y0 + 2, 1, 1, TAG[0]);
  signText(g, 'SOLD', x0 + w / 2 + 1, y0 + h - 2, { sx: 1, sy: 1, fill: '#FFF2E0', gap: 1 });
};

/** A dead snag, `h` tall: charred and cold, plates of bark, stubs of limbs, the top snapped; a SOLD tag on some. */
const paintSnag = (g: Ctx, seed: number, h: number) => {
  const w = 12 + Math.round(h01(seed) * 10), R = DEAD;
  // (the trunk, tapering, a lean)
  const lean = (h01(seed * 2.3) - 0.5) * 16;
  const L = (y: number) => -w / 2 + (lean * -y) / h + (w * 0.3 * -y) / h, Rr = (y: number) => w / 2 + (lean * -y) / h - (w * 0.3 * -y) / h;
  const pts: [number, number][] = [];
  for (let y = 0; y >= -h; y -= 6) pts.push([L(y), y]);
  const tx = (lean * h) / h;
  pts.push([tx - 2, -h - 6], [tx + 1, -h + 4], [tx + 4, -h - 3]);
  for (let y = -h; y <= 0; y += 6) pts.push([Rr(y), y]);
  g.save(); g.translate(0, 0);
  poly(g, pts.map(([x, y]) => [x - 1, y]), INK); poly(g, pts.map(([x, y]) => [x + 1, y]), INK);
  poly(g, pts, R[2]);
  // (lit down its left (the coin moon's off left), shaded right; the bark's plates)
  for (let y = 0; y > -h; y -= 2) { const a = L(y), b = Rr(y); box(g, a, y, 2, 2, R[4]); box(g, a + 2, y, 1, 2, R[3]); box(g, b - 3, y, 3, 2, R[1]); }
  for (let k = 0; k < h / 9; k++) { const y = -4 - h01(seed + k) * (h - 10), a = L(y), b = Rr(y), x = a + 3 + h01(seed * 3 + k) * (b - a - 6); box(g, x, y, 1, 4 + (k % 3) * 2, R[1]); if (k % 2) box(g, x + 1, y, 1, 2, R[3]); }
  // (stubs of limbs, broken off: up and out)
  for (let k = 0; k < 4; k++) {
    const y = -h * (0.35 + k * 0.15), side = (k + seed) % 2 ? 1 : -1, x = side > 0 ? Rr(y) : L(y), len = 10 + h01(seed + k * 5) * 18;
    g.lineCap = 'round';
    line(g, [[x, y], [x + side * len, y - len * 0.6]], INK, 5); line(g, [[x, y], [x + side * len, y - len * 0.6]], R[2], 3);
    line(g, [[x, y - 1], [x + side * len, y - len * 0.6 - 1]], R[4], 1);
    if (k === 1) { line(g, [[x + side * len * 0.6, y - len * 0.36], [x + side * len * 0.9, y - len * 0.9]], INK, 3); line(g, [[x + side * len * 0.6, y - len * 0.36], [x + side * len * 0.9, y - len * 0.9]], R[3], 1); }
  }
  // (scorch: black at the foot, ember still in a crack)
  box(g, L(0) - 2, -8, w + 4, 8, R[0]); checker(g, L(0) - 2, -14, w + 4, 6, R[0], seed & 1, 2);
  if (seed % 3 === 0) { box(g, -1, -18, 2, 6, EMBER[2]); box(g, -1, -16, 1, 2, EMBER[1]); }
  // (roots into the ground)
  for (const s of [-1, 1]) poly(g, [[s * w * 0.3, -6], [s * (w * 0.5 + 10), 0], [s * w * 0.2, 0]], R[1]);
  if (seed % 2 === 0) soldTag(g, (L(-h * 0.3) + Rr(-h * 0.3)) / 2, -h * 0.3, 1, 0);
  g.restore();
};

/** A stump, fresh cut (the rings on its pale top), axe bites in its side; a SOLD tag on a stake, a flag. */
const paintStump = (g: Ctx, seed: number) => {
  const w = 34 + Math.round(h01(seed) * 26), h = 18 + Math.round(h01(seed * 1.7) * 18), R = DEAD, C = CUT;
  box(g, -w / 2 - 1, -h - 1, w + 2, h + 1, INK);
  box(g, -w / 2, -h, w, h, R[2]); box(g, -w / 2, -h, 3, h, R[4]); box(g, w / 2 - 4, -h, 4, h, R[1]);
  for (let k = 0; k < w / 5; k++) box(g, -w / 2 + 4 + k * 5, -h + 4 + (k % 3) * 2, 1, h - 6 - (k % 2) * 3, R[1]);
  // (the axe's bite: a wedge out of its side)
  poly(g, [[w / 2, -h + 6], [w / 2 - 9, -h + 10], [w / 2, -h + 14]], INK);
  // (the top: cut flat, its rings, the bark round it)
  const ty = -h, rx = w / 2 + 1, ry = 5;
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, ty, rx + 1, ry + 1, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = C[3]; g.beginPath(); g.ellipse(0, ty, rx - 1, ry - 1, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = C[2]; g.lineWidth = 1;
  for (let k = 1; k < 4; k++) { g.beginPath(); g.ellipse(1, ty, (rx - 1) * (k / 4), (ry - 1) * (k / 4), 0, 0, Math.PI * 2); g.stroke(); }
  box(g, -rx + 3, ty - 2, rx * 0.8, 1, C[5]); box(g, 0, ty, 2, 1, C[1]);
  // (roots)
  for (const s of [-1, 1]) poly(g, [[s * w * 0.36, -5], [s * (w * 0.5 + 9), 0], [s * w * 0.3, 0]], R[1]);
  // (the stake, its tag)
  const sx = w / 2 + 10;
  box(g, sx - 1, -34, 3, 34, INK); box(g, sx, -34, 1, 34, BOARD[4]);
  soldTag(g, sx + 1, -30, 1, 0);
};

/** Gold, heaped up where he can't see it: coins in a mound, a bar or two, coins spilled off it. */
const paintGold = (g: Ctx, seed: number) => {
  const w = 40 + h01(seed) * 40, h = 14 + h01(seed * 2.1) * 14, G = GOLDR;
  pixelBlob(g, 0, -h * 0.5, w / 2 + 2, h / 2 + 2, INK, 2);
  pixelBlob(g, 0, -h * 0.5, w / 2, h / 2, G[2], 2);
  pixelBlob(g, -w * 0.08, -h * 0.62, w * 0.4, h * 0.38, G[3], 2);
  pixelBlob(g, -w * 0.16, -h * 0.72, w * 0.22, h * 0.2, G[4], 2);
  box(g, -w / 2, -2, w, 2, G[1]);
  // (the coins' edges in rows, their glints)
  for (let k = 0; k < w * h / 40; k++) {
    const x = (h01(seed + k * 1.3) - 0.5) * w * 0.85, y = -2 - h01(seed * 3 + k * 2.1) * h * 0.85;
    const inMound = (x * x) / ((w / 2) * (w / 2)) + ((y + h * 0.5) * (y + h * 0.5)) / ((h / 2) * (h / 2)) < 0.9;
    if (!inMound) continue;
    box(g, x - 2, y, 4, 1, G[1]); box(g, x - 2, y - 1, 3, 1, G[4]);
    if (k % 6 === 0) { box(g, x - 1, y - 3, 1, 5, G[5]); box(g, x - 3, y - 1, 5, 1, G[5]); }
  }
  // (a bar on top, two spilled coins)
  const bx = -6 + (seed % 3) * 6, by = -h - 2;
  box(g, bx - 9, by - 5, 18, 7, INK); box(g, bx - 8, by - 4, 16, 5, G[3]); box(g, bx - 6, by - 4, 12, 1, G[5]); box(g, bx - 8, by, 16, 1, G[1]);
  for (const cx of [w / 2 + 6, -w / 2 - 8]) { box(g, cx - 3, -3, 7, 3, INK); box(g, cx - 2, -3, 5, 2, G[4]); box(g, cx - 2, -3, 3, 1, G[5]); }
};

/** A chest, burst open, gold over its lip. */
const paintChest = (g: Ctx) => {
  const B = BOARD, G = GOLDR;
  box(g, -27, -28, 54, 28, INK); box(g, -26, -27, 52, 27, B[3]); box(g, -26, -27, 52, 2, B[5]); box(g, 22, -27, 4, 27, B[1]);
  for (const x of [-18, 14]) { box(g, x, -27, 4, 27, '#2A2A30'); box(g, x, -27, 1, 27, '#6A6A74'); }
  box(g, -3, -20, 6, 7, INK); box(g, -2, -19, 4, 5, G[3]);
  // (the lid, thrown back)
  poly(g, [[-27, -28], [-20, -50], [22, -52], [27, -28]], INK); poly(g, [[-25, -29], [-19, -48], [21, -50], [25, -29]], B[2]); line(g, [[-19, -47], [21, -49]], B[4], 1);
  // (the gold over it)
  pixelBlob(g, 0, -30, 24, 8, G[2], 2); pixelBlob(g, -4, -32, 16, 5, G[4], 2);
  for (let k = 0; k < 9; k++) box(g, -18 + k * 4, -32 + (k % 3), 3, 1, G[5]);
  for (let k = 0; k < 5; k++) { const x = 28 + k * 6, y = -2 - (k % 2) * 2; box(g, x - 1, y - 1, 5, 3, INK); box(g, x, y, 3, 1, G[4]); }
};

/** One of his company's signs on its posts: a board, the words routed and painted. */
const paintBoard = (g: Ctx, lines: string[], tagged: boolean) => {
  const B = BOARD;
  for (const px of [-30, 26]) { box(g, px - 1, -70, 7, 70, INK); box(g, px, -70, 5, 70, B[3]); box(g, px, -70, 1, 70, B[5]); box(g, px + 4, -70, 1, 70, B[1]); }
  const cut: Look = { sx: 1, sy: 2, fill: ['#E8D8A8', '#C8B07A'], gap: 1, shadow: INK };
  sign(g, 0, -56, lines.map(t => [t, cut] as [string, Look]), B[2], B, 5);
  if (tagged) soldTag(g, 29, -22, 1, 0);
};

/** The sign before the glade, his: YOU ARE IN GREED COUNTRY (routed, Forest Service brown, gone charred), a SOLD
 *  sticker slapped across its corner, TRAIL LOST. SO ARE YOU. on the plate under it. Feet at (0, 0), as the bear sign's. */
const paintGreedSign = (g: Ctx) => {
  const B = BOARD;
  for (const px of [-40, 34]) {
    box(g, px - 1, -132, 8, 132, INK); box(g, px, -132, 6, 132, B[3]); box(g, px, -132, 2, 132, B[5]); box(g, px + 4, -132, 2, 132, B[1]);
    for (let y = -124; y < -6; y += 11) box(g, px + 2, y, 1, 5, B[1]);
    box(g, px - 4, -3, 14, 3, DEAD[1]);
  }
  const routed: Look = { sx: 1, sy: 2, fill: ['#F0E2B8', '#D2BE8A'], gap: 1, shadow: INK };
  sign(g, 0, -100, [['YOU ARE IN', routed], ['GREED', { sx: 2, sy: 3, fill: [GOLDR[5], GOLDR[4], GOLDR[3]], gap: 1, shadow: INK }], ['COUNTRY', routed]], B[2], B, 6);
  // (scorched at its foot)
  checker(g, -58, -78, 116, 4, DEAD[0], 0, 2);
  sign(g, 0, -50, [['TRAIL LOST.', { sx: 1, sy: 1, fill: INK, gap: 1 }], ['SO ARE YOU.', { sx: 1, sy: 1, fill: INK, gap: 1 }]], '#C8A818', DEAD, 4);
  // (the sticker, crooked across the corner)
  soldTag(g, 50, -131, 1.3, 1);
};

/** The back rank (a tile TW wide; three of them): a wall of dead snags and stumps stood back in the cold, its foot
 *  hazed, a fire or two burning low in it. */
const TW = 640;
const paintRank = (g: Ctx, n: number) => {
  const dim = (R: string[], k: number) => R.map(c => mix(c, '#0A0E18', k));
  const far = dim(DEAD, 0.5), near = dim(DEAD, 0.28);
  // (the deep ones: a crowd of snags, thin)
  for (let i = 0; i < 26; i++) {
    const x = i * 25 + h01(i * 1.7 + n * 9) * 18, h = 150 + h01(i * 2.9 + n * 5) * 210;
    for (const xx of [x, x - TW, x + TW]) if (xx > -40 && xx < TW + 40) {
      const w = 5 + h01(i + n) * 6;
      poly(g, [[xx - w / 2, 0], [xx - 1, -h], [xx + 1, -h + 6], [xx + w / 2, 0]], far[2]);
      box(g, xx - w / 2 + 1, -h * 0.7, 1, h * 0.7, far[3]);
      for (let k = 0; k < 3; k++) { const y = -h * (0.4 + k * 0.17), s = (i + k) % 2 ? 1 : -1; line(g, [[xx, y], [xx + s * (8 + k * 3), y - 9]], far[2], 2); }
    }
  }
  hazeBands(g, 0, -120, TW, 120, '#141A28', 0, 0.7, 6, 2);
  // (the nearer row: thicker, lit down their left; stumps between)
  for (let i = 0; i < 11; i++) {
    const x = 20 + i * 58 + h01(i * 3.1 + n * 7) * 26, h = 120 + h01(i * 4.3 + n * 3) * 170, w = 9 + h01(i * 5 + n) * 7;
    for (const xx of [x, x - TW, x + TW]) if (xx > -40 && xx < TW + 40) {
      poly(g, [[xx - w / 2 - 1, 0], [xx - 2, -h - 1], [xx + 2, -h + 7], [xx + w / 2 + 1, 0]], INK);
      poly(g, [[xx - w / 2, 0], [xx - 1, -h], [xx + 1, -h + 6], [xx + w / 2, 0]], near[2]);
      for (let y = -2; y > -h; y -= 2) box(g, xx - w / 2 + (w * -y) / (2.2 * h), y, 1, 2, near[4]);
      for (let k = 0; k < 3; k++) { const y = -h * (0.45 + k * 0.15), s = (i + k + n) % 2 ? 1 : -1; line(g, [[xx, y], [xx + s * (12 + k * 4), y - 10]], INK, 3); line(g, [[xx, y], [xx + s * (12 + k * 4), y - 10]], near[3], 1); }
    }
  }
  for (let i = 0; i < 9; i++) {
    const x = 34 + i * 70 + h01(i * 6.1 + n) * 30, w = 18 + h01(i + n * 2) * 16, h = 8 + h01(i * 2 + n) * 10;
    box(g, x - w / 2 - 1, -h - 1, w + 2, h + 1, INK); box(g, x - w / 2, -h, w, h, near[2]); box(g, x - w / 2, -h - 1, w, 2, mix(CUT[3], '#0A0E18', 0.4));
  }
  // (a fire or two, low among them: ember glows (the flames are no more than a lick at this distance))
  for (let k = 0; k < 2; k++) {
    const x = 120 + k * 300 + h01(n * 11 + k) * 120;
    steppedGlow(g, x, -6, 34, '#C8501A', 0.25, 0, 4);
    box(g, x - 4, -9, 8, 6, EMBER[3]); box(g, x - 3, -11, 5, 5, EMBER[2]); box(g, x - 1, -14, 2, 5, EMBER[1]); box(g, x, -12, 1, 2, EMBER[0]);
  }
  hazeBands(g, 0, -40, TW, 40, '#1A1A26', 0, 0.55, 5, 2);
};

// (the things stood back on the ground, each its own depth: rx off the arena's left wall)
type Prop = { rx: number; d: number; k: 'snag' | 'stump' | 'gold' | 'chest' | 'board'; h?: number; text?: string[]; tagged?: boolean };
const PROPS: Prop[] = ([
  { rx: -760, d: 0.8, k: 'snag', h: 250 }, { rx: -620, d: 0.9, k: 'stump' }, { rx: -470, d: 0.84, k: 'board', text: ['PROPERTY OF', 'TUCKER TIMBER CO.', 'KEEP OUT'] },
  { rx: -330, d: 0.78, k: 'snag', h: 300 }, { rx: -60, d: 0.88, k: 'gold' },
  { rx: 40, d: 0.82, k: 'stump' }, { rx: 150, d: 0.76, k: 'snag', h: 330 }, { rx: 260, d: 0.9, k: 'gold' }, { rx: 380, d: 0.86, k: 'stump' },
  { rx: 520, d: 0.8, k: 'snag', h: 270 }, { rx: 640, d: 0.92, k: 'chest' }, { rx: 760, d: 0.84, k: 'stump' },
  { rx: 880, d: 0.78, k: 'board', text: ['FOREST FOR SALE', 'ALL OF IT'], tagged: true }, { rx: 980, d: 0.9, k: 'gold' }, { rx: 1080, d: 0.8, k: 'snag', h: 360 },
  { rx: 1240, d: 0.86, k: 'stump' }, { rx: 1340, d: 0.92, k: 'gold' }, { rx: 1450, d: 0.77, k: 'snag', h: 290 }, { rx: 1560, d: 0.88, k: 'stump' },
  { rx: 1700, d: 0.82, k: 'board', text: ['THANK YOU FOR', 'YOUR PURCHASE'] }, { rx: 1850, d: 0.79, k: 'snag', h: 240 }, { rx: 1990, d: 0.9, k: 'gold' },
  { rx: 2120, d: 0.85, k: 'stump' }, { rx: 2260, d: 0.78, k: 'snag', h: 310 },
] as Prop[]).sort((a, b) => a.d - b.d);
const BOX: Record<Prop['k'], [number, number, number, number]> = {
  snag: [-60, -420, 120, 424], stump: [-40, -40, 100, 44], gold: [-50, -40, 110, 44], chest: [-30, -56, 90, 60], board: [-60, -100, 120, 104],
};

const drawWoods = (c: Ctx, v: View, dMin: number, dMax: number) => {
  const FAR = 0.7;
  if (dMin <= FAR) atDepth(c, v.eye, FAR, () => {
    for (let tx = Math.floor((v.v0 - 400) / TW) * TW; tx < v.v1 + 400; tx += TW) {
      if (!seenAt(v, tx - 60, tx + TW + 60, FAR)) continue;
      const n = ((Math.round(tx / TW) % 3) + 3) % 3;
      still(c, `rf4-fr-rank-${n}`, tx, GY, -40, -380, TW + 80, 384, g => { g.translate(40, 0); paintRank(g, n); });
    }
  });
  for (const p of PROPS) {
    if (p.d < dMin || p.d >= dMax) continue;
    const wx = ARENA_L + p.rx, [bx, by, bw, bh] = BOX[p.k];
    if (!seenAt(v, wx + bx - 20, wx + bx + bw + 20, p.d)) continue;
    atDepth(c, v.eye, p.d, () => still(c, `rf4-fr-${p.k}-${p.rx}`, wx, GY, bx, by, bw, bh, g => {
      const seed = Math.abs(p.rx) * 0.013 + 3;
      if (p.k === 'snag') paintSnag(g, Math.round(seed * 7), p.h ?? 260);
      else if (p.k === 'stump') paintStump(g, seed);
      else if (p.k === 'gold') paintGold(g, seed);
      else if (p.k === 'chest') paintChest(g);
      else paintBoard(g, p.text ?? [], !!p.tagged);
    }));
  }
};

/** (frontier/arena/art.ts ARENA_HOOKS, set by rf/frontier.ts: only while his refight's on) */
export const frontierWoods = (c: Ctx, v: View, dMin: number, dMax: number) => { drawWoods(c, v, dMin, dMax); return true; };
export const frontierSign = () => ({ key: 'rf4-fr-greedsign', paint: paintGreedSign });

// (dev: the set pieces on a sheet)
export const frontierSheet = (g: Ctx) => {
  g.fillStyle = '#20283A'; g.fillRect(0, 0, 1200, 520);
  const at = (x: number, y: number, fn: () => void) => { g.save(); g.translate(x, y); fn(); g.restore(); };
  at(60, 470, () => { g.translate(-0, 0); paintRank(g, 0); });
  at(760, 300, () => paintSnag(g, 4, 260)); at(860, 300, () => paintSnag(g, 7, 200)); at(980, 300, () => paintStump(g, 3.2));
  at(1100, 300, () => paintGold(g, 5)); at(760, 470, () => paintChest(g)); at(900, 470, () => paintBoard(g, ['FOREST FOR SALE', 'ALL OF IT'], true));
  at(1090, 470, () => paintGreedSign(g));
};
