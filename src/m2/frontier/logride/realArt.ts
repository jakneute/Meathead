// Out of the park, drawn (peak SNES): the REAL river (no bolts, no paint, no plywood, and it shows). The far bank: a
// real cutbank (dark soil over cobble and rock in the face, roots hanging out of it, a grass and sedge lip with
// wildflowers in it), real trees on it, every one different (firs and spruce in stepped tiers, an aspen, a leaning one, a
// dead gray snag), boulders, driftwood, and the real world's junk (a tire, a cooler, a plastic bag snagged in a bush, a
// lawn chair, beer cans). The water: its surface going back to the far bank (paler, the sky in it, glints riding
// downstream), its body at the play plane (cold, banded greener-browner deep, the current's foam lines running on, the
// rapids whiter), and over the log's foot its front (see-through, its lit line rippling); the near bank under it (real
// cobbles, mossy, sedge). The real waterfall: a granite ledge in wet stepped blocks, the curtain pouring off its glassy
// lip in falling streaks, white water boiling at its foot, the mist going up. Under the crew's clearing, its dirt bank.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../../m1/constants';
import {
  type Ctx, box, checker, mix, hash, stillAt, pine, clump, pixelBlob, INK, hr, bands, RIVER, GRANITE, DIRT, GRASS, NEEDLE, BARK, MOSS, OAK, STEEL,
} from './paint';
import { X, waterY, CHIPPER, CLEARING } from './layout';

const RA = 8470, RB = 11000;
/** The far bank's top (the water's at wy; the far bank's foot at wy - 22, where its surface going back meets it). */
const bankTop = (rx: number) => waterY(rx) - 64;
/** Where the river's flat (not the spillway, not the falls). */
const flat = (rx: number) => (rx >= 8640 && rx < 9860) || (rx >= 9990 && rx < 10780);

// ---------------------------------------------------------------------------------------------------------------
// The far bank

const BT = 128;
const paintCutbank = (g: Ctx, v: number) => {
  const D = hr('dirt', DIRT, 0.2), G = hr('granite', GRANITE, 0.2);
  bands(g, 0, 0, BT, BT, [D[3], D[2], D[2], D[1], D[2], D[1]]);
  // (cobble and rock in the face, lit on top; roots; dark seeps)
  for (let n = 0; n < 22; n++) {
    const x = hash(v * 11 + n) * BT, y = 10 + hash(v * 7 + n * 3) * (BT - 10), r = 2 + hash(n + v) * 6;
    g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, r + 1, r * 0.7 + 1, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = G[3 + (n % 2)]; g.beginPath(); g.ellipse(x, y, r, r * 0.7, 0, 0, Math.PI * 2); g.fill();
    box(g, x - r * 0.6, y - r * 0.6, r, 1, G[6]);
  }
  for (let n = 0; n < 4; n++) {
    let x = hash(v * 5 + n) * BT, y = 2;
    g.strokeStyle = D[0]; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y);
    for (let s = 0; s < 4; s++) { x += (hash(v + n * 3 + s) - 0.5) * 12; y += 6 + hash(n + s * 2) * 8; g.lineTo(x, y); }
    g.stroke(); g.strokeStyle = D[4]; g.lineWidth = 1; g.stroke();
  }
  g.fillStyle = 'rgba(0, 0, 0, 0.25)'; g.fillRect(hash(v) * 100, 20, 4, BT);
};

type BankThing = 'fir' | 'spruce' | 'aspen' | 'snag' | 'lean' | 'bush' | 'boulder' | 'drift' | 'tire' | 'cooler' | 'bag' | 'chair' | 'cans';
const THINGS: [number, BankThing][] = (() => {
  const out: [number, BankThing][] = [];
  const kinds: BankThing[] = ['fir', 'spruce', 'fir', 'bush', 'aspen', 'spruce', 'boulder', 'fir', 'lean', 'bush', 'snag', 'drift'];
  for (let rx = RA + 30; rx < RB; rx += 52 + Math.floor(hash(rx) * 50)) if (hash(rx * 1.7) > 0.25) out.push([rx, kinds[Math.floor(hash(rx * 3.1) * kinds.length)]]);
  out.push([8790, 'tire'], [9210, 'cooler'], [9490, 'bag'], [10130, 'cans'], [10310, 'chair']);
  return out.sort((p, q) => p[0] - q[0]);
})();

/** A real tree or thing on the bank, its foot at (0, 0). */
const paintThing = (g: Ctx, k: BankThing, seed: number) => {
  const N = hr('needle', NEEDLE, 0.2), B = hr('bark', BARK, 0.2), G = hr('granite', GRANITE, 0.2), O = hr('oak', OAK, 0.2);
  const spruce = N.map(col => mix(col, '#2A4A5A', 0.2)), fir = N.map(col => mix(col, '#0A1A0A', 0.12));
  const h = 150 + hash(seed) * 120;
  switch (k) {
    case 'fir': pine(g, 0, 0, h, h * 0.36, seed, fir, B); break;
    case 'spruce': pine(g, 0, 0, h * 0.9, h * 0.3, seed, spruce, B); break;
    case 'lean': g.save(); g.rotate(0.14 + hash(seed) * 0.1); pine(g, 0, 0, h * 0.85, h * 0.3, seed, N, B); g.restore(); break;
    case 'snag': {
      // (a dead snag: bare silver trunk, its top snapped, stubs of limbs, a woodpecker's holes)
      const sh = h * 0.7, S = ['#2A2824', '#4A4640', '#6E6860', '#8E887E', '#B0AAA0', '#D0CAC0'].map(col => mix(col, '#000000', 0.05));
      box(g, -5, -sh, 10, sh, INK); box(g, -4, -sh, 8, sh, S[3]); box(g, -4, -sh, 2, sh, S[5]); box(g, 2, -sh, 2, sh, S[1]);
      g.fillStyle = INK; g.beginPath(); g.moveTo(-5, -sh); g.lineTo(-2, -sh - 14); g.lineTo(1, -sh - 6); g.lineTo(5, -sh - 18); g.lineTo(5, -sh); g.closePath(); g.fill();
      for (let i = 0; i < 6; i++) { const y = -sh * 0.9 + i * sh * 0.13, s = i % 2 ? 1 : -1; box(g, s > 0 ? 4 : -14, y, 10, 3, INK); box(g, s > 0 ? 4 : -13, y + 1, 9, 1, S[4]); }
      for (let i = 0; i < 3; i++) box(g, -1, -sh * 0.5 + i * 8, 2, 2, INK);
      break;
    }
    case 'aspen': {
      // (an aspen: a white trunk with black eyes in its bark, a round crown of small leaves)
      const th = h * 0.75;
      box(g, -4, -th, 8, th, INK); box(g, -3, -th, 6, th, '#E8E4D8'); box(g, -3, -th, 2, th, '#FFFFFF'); box(g, 1, -th, 2, th, '#B8B2A4');
      for (let i = 0; i < 9; i++) box(g, -3 + (i % 2) * 2, -th + 10 + i * th / 10, 3, 2, '#2A2620');
      const L = O.map(col => mix(col, '#9AB040', 0.25));
      clump(g, 0, -th - 10, 34, 30, seed, L, 0); clump(g, -18, -th + 12, 22, 18, seed + 3, L, 1); clump(g, 16, -th + 8, 24, 18, seed + 5, L, 0);
      break;
    }
    case 'bush': clump(g, 0, -12, 26 + hash(seed) * 12, 16, seed, O.map(col => mix(col, '#1A2A1A', 0.25)), 0); break;
    case 'boulder': {
      g.fillStyle = INK; g.beginPath(); g.moveTo(-28, 1); g.lineTo(-24, -20); g.lineTo(-6, -32); g.lineTo(14, -28); g.lineTo(28, -12); g.lineTo(30, 1); g.closePath(); g.fill();
      g.fillStyle = G[3]; g.beginPath(); g.moveTo(-26, 0); g.lineTo(-22, -19); g.lineTo(-6, -30); g.lineTo(13, -26); g.lineTo(26, -11); g.lineTo(28, 0); g.closePath(); g.fill();
      g.fillStyle = G[5]; g.beginPath(); g.moveTo(-22, -19); g.lineTo(-6, -30); g.lineTo(2, -28); g.lineTo(-12, -14); g.closePath(); g.fill();
      g.fillStyle = G[1]; g.beginPath(); g.moveTo(13, -26); g.lineTo(26, -11); g.lineTo(28, 0); g.lineTo(10, 0); g.closePath(); g.fill();
      box(g, -4, -28, 10, 3, hr('moss', MOSS)[4]); box(g, 8, -18, 4, 3, '#C8C890');
      break;
    }
    case 'drift': {
      // (a bleached drift log, a root wad on its end)
      box(g, -40, -10, 80, 10, INK); box(g, -39, -9, 78, 8, '#A8A090'); box(g, -39, -9, 78, 2, '#D8D2C4'); box(g, -39, -3, 78, 2, '#7A7468');
      for (let i = 0; i < 6; i++) { g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(38, -5); g.lineTo(44 + hash(i) * 10, -16 + i * 5); g.stroke(); }
      break;
    }
    case 'tire': {
      g.fillStyle = INK; g.beginPath(); g.ellipse(0, -10, 16, 11, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#26262C'; g.beginPath(); g.ellipse(0, -10, 14, 9, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#5A4430'; g.beginPath(); g.ellipse(0, -10, 7, 4, 0, 0, Math.PI * 2); g.fill(); box(g, -10, -18, 6, 1, '#4A4A54');
      break;
    }
    case 'cooler': box(g, -14, -16, 28, 16, INK); box(g, -13, -15, 26, 14, '#E8E8E0'); box(g, -13, -15, 26, 4, '#2A6AC8'); box(g, -13, -11, 26, 1, '#1A4A98'); box(g, -6, -18, 12, 3, INK); box(g, -12, -4, 24, 3, '#B0B0A8'); break;
    case 'bag': {
      clump(g, 0, -12, 26, 16, seed, O.map(col => mix(col, '#1A2A1A', 0.25)), 0);
      g.fillStyle = INK; g.beginPath(); g.moveTo(-4, -26); g.lineTo(10, -30); g.lineTo(14, -18); g.lineTo(2, -14); g.closePath(); g.fill();
      g.fillStyle = '#E8ECEE'; g.beginPath(); g.moveTo(-3, -25); g.lineTo(9, -29); g.lineTo(13, -18); g.lineTo(3, -15); g.closePath(); g.fill(); box(g, 0, -24, 8, 1, '#FFFFFF'); box(g, 4, -20, 6, 1, '#B91C1C');
      break;
    }
    case 'chair': {
      // (an aluminum lawn chair, its webbing gone, on its back)
      const S = hr('steel', STEEL);
      g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(-16, 0); g.lineTo(-4, -14); g.lineTo(16, -14); g.moveTo(-10, 0); g.lineTo(4, -20); g.stroke();
      g.strokeStyle = S[5]; g.lineWidth = 1.5; g.stroke();
      for (let i = 0; i < 4; i++) box(g, -2 + i * 4, -16, 3, 3, i % 2 ? '#2EA86A' : '#F4F0E0');
      break;
    }
    case 'cans': for (let i = 0; i < 3; i++) { box(g, -10 + i * 8, -5, 7, 5, INK); box(g, -9 + i * 8, -4, 5, 3, ['#C8302A', '#E8E8F0', '#2A6AC8'][i]); box(g, -9 + i * 8, -4, 5, 1, '#FFFFFF'); } break;
  }
};
const thingBox = (k: BankThing): [number, number, number, number] => (k === 'fir' || k === 'spruce' || k === 'lean' ? [-80, -290, 170, 294] : k === 'snag' ? [-24, -220, 48, 224] : k === 'aspen' ? [-60, -250, 120, 254] : [-60, -50, 120, 54]);

export const drawRiverBack = (c: Ctx, state: GameState) => {
  const f = state.frame, Rv = hr('river', RIVER, 0.16), Gr = hr('grass', GRASS, 0.2);
  const cl = state.camera.x - 40, cr = state.camera.x + CANVAS_WIDTH + 40;
  const ra = Math.max(RA, Math.floor((cl - X(0)) / 16) * 16), rb = Math.min(RB, cr - X(0));
  if (rb <= ra) return;
  // ---- the things on the bank behind it (trees and all), their feet on its top
  for (const [rx, k] of THINGS) {
    const [bx, by, bw, bh] = thingBox(k);
    if (X(rx) + bx + bw < cl - 60 || X(rx) + bx > cr + 60) continue;
    stillAt(c, `lr-bank-${k}-${rx}`, X(rx), bankTop(rx) + 4, bx, by, bw, bh, g => paintThing(g, k, rx));
  }
  // ---- the far bank's face: a cutbank (tiles clipped between its top and its foot)
  c.save(); c.beginPath(); c.moveTo(X(ra), bankTop(ra));
  for (let rx = ra; rx <= rb + 16; rx += 16) c.lineTo(X(rx), bankTop(rx));
  for (let rx = rb + 16; rx >= ra; rx -= 16) c.lineTo(X(rx), waterY(rx) + 2);
  c.closePath(); c.clip();
  const ty0 = Math.floor(Math.max(state.camera.y - 20, Math.min(bankTop(ra), bankTop(rb)) - 4) / BT) * BT, ty1 = Math.min(state.camera.y + 640, Math.max(waterY(ra), waterY(rb)) + 4);
  for (let ix = Math.floor((X(ra) - X(0)) / BT); ix * BT + X(0) < X(rb) + 16; ix++) for (let ty = ty0; ty < ty1; ty += BT) {
    stillAt(c, `lr-cutbank-${((ix % 4) + 4) % 4}`, X(0) + ix * BT, ty, 0, 0, BT, BT, g => paintCutbank(g, ((ix % 4) + 4) % 4));
  }
  c.restore();
  // (its lip: grass and sedge, wildflowers now and then)
  for (let rx = ra; rx <= rb; rx += 16) {
    const y = bankTop(rx), y2 = bankTop(rx + 16), x = X(rx);
    if (Math.abs(y2 - y) > 2) { c.strokeStyle = Gr[4]; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 16, y2); c.stroke(); continue; }
    box(c, x, y - 1, 16, 1, INK); box(c, x, y, 16, 2, Gr[5]); box(c, x, y + 2, 16, 2, Gr[3]); checker(c, x, y + 4, 16, 2, Gr[2], (rx / 16) % 2);
    for (let k = 0; k < 3; k++) { const tx = x + hash(rx * 1.3 + k) * 16, th = 3 + hash(rx + k * 5) * 6; box(c, tx, y - th, 1, th, k % 2 ? Gr[4] : Gr[6]); }
    if (hash(rx * 2.7) > 0.86) { box(c, x + 6, y - 6, 3, 3, ['#F2D24A', '#E8E4F4', '#B85AC8'][Math.floor(hash(rx) * 3)]); box(c, x + 7, y - 3, 1, 3, Gr[3]); }
  }
  // ---- the water's surface going back to the far bank (paler, the sky in it) and its body at the play plane (cold,
  // banded): tiles along the flats; glints and the current's foam lines riding downstream over them
  for (const [a, b] of [[8640, 9860], [9990, 10780]] as const) {
    for (let rx = Math.max(a, Math.floor(ra / BT) * BT); rx < Math.min(b, rb); rx += BT) {
      const l = Math.max(rx, a), w = Math.min(BT, b - rx);
      c.save(); c.beginPath(); c.rect(X(l), waterY(a) - 24, X(rx) + w - X(l) + 0.5, 70); c.clip();
      stillAt(c, 'lr-riverwater', X(rx), waterY(a), 0, -22, BT, 58, g => { bands(g, 0, -22, BT, 20, [Rv[7], Rv[6], Rv[6], Rv[5]]); bands(g, 0, -4, BT, 40, [Rv[5], Rv[4], Rv[4], Rv[3], Rv[3]]); });
      c.restore();
    }
  }
  for (let rx = Math.floor(ra / 40) * 40; rx < rb; rx += 40) {
    if (!flat(rx)) continue;
    const wy = waterY(rx), x = X(rx);
    if (((rx - Math.floor(f * 2)) % 120 + 120) % 120 < 20) box(c, x + 8, wy - 16, 14, 1, Rv[8]);
    if (((rx * 3 - Math.floor(f * 1.4)) % 160 + 160) % 160 < 10) box(c, x + 20, wy - 10, 10, 1, '#FFFFFF');
    const fast = rx >= 9300 && rx < 9860;
    if (((rx - Math.floor(f * (fast ? 4 : 3))) % 90 + 90) % 90 < 16) { box(c, x + 6, wy - 3, 18, 2, '#E8F4F0'); box(c, x + 24, wy - 3, 8, 1, Rv[7]); }
    if (fast && ((rx * 7 - Math.floor(f * 4.4)) % 70 + 70) % 70 < 10) box(c, x + 14, wy + 4, 12, 2, 'rgba(236, 248, 244, 0.8)');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The real waterfall

export const drawFalls = (c: Ctx, state: GameState) => {
  if (!onScreenX(state, X(9800), X(10060))) return;
  const f = state.frame, top = waterY(9860), bot = waterY(9990), G = hr('granite', GRANITE, 0.16), Rv = hr('river', RIVER, 0.16), Ms = hr('moss', MOSS, 0.16);
  // ---- the ledge behind: granite in wet stepped blocks, moss in the cracks, darker where the spray keeps it wet
  stillAt(c, 'lr-ledge', X(9840), top, -10, -30, 190, bot - top + 110, g => {
    for (let y = -24, r = 0; y < bot - top + 70; y += 22, r++) for (let x = -8 + (r % 2) * 14; x < 176; x += 30 + (r * 7) % 12) {
      const k = hash(x * 3 + r), wet = y > (bot - top) * 0.3;
      const col = mix(k < 0.3 ? G[2] : k > 0.75 ? G[4] : G[3], '#0A1418', wet ? 0.3 : 0);
      box(g, x, y, 28, 20, INK); box(g, x + 1, y + 1, 26, 18, col); box(g, x + 1, y + 1, 26, 2, mix(col, '#FFFFFF', 0.18)); box(g, x + 1, y + 17, 26, 2, mix(col, INK, 0.3));
      if (k > 0.6) { box(g, x + 2, y + 18, 10, 2, Ms[4]); box(g, x + 4, y + 17, 4, 1, Ms[5]); }
    }
  });
  // ---- the curtain: off the lip down the face, banded, streaks falling
  const xa = X(9860), xb = X(9990);
  c.save(); c.beginPath(); c.moveTo(xa, top - 2); c.lineTo(xb, bot - 2); c.lineTo(xb, bot + 10); c.lineTo(xa, bot + 10); c.closePath(); c.clip();
  bands(c, xa, top - 4, xb - xa, bot - top + 16, [Rv[7], Rv[6], Rv[6], Rv[5], Rv[5], Rv[6], Rv[7]]);
  for (let k = 0; k < 18; k++) {
    const x = xa + 4 + k * 7, len = 14 + hash(k) * 20, y = top - 10 + ((f * 7 + k * 23) % (bot - top + 40));
    box(c, x, y, 3, len, k % 3 ? '#E8F4F0' : Rv[8]); box(c, x + 3, y + 4, 1, len * 0.6, Rv[6]);
  }
  c.restore();
  // (the lip: glassy, a smooth lit band where it goes over)
  box(c, xa - 30, top - 3, 32, 3, Rv[8]); box(c, xa - 30, top, 32, 2, Rv[7]);
  // ---- white water boiling at its foot, the mist going up off it (soft, stepped)
  for (let i = 0; i < 9; i++) { const px = xb - 50 + i * 14 + Math.sin(f * 0.2 + i) * 3, py = bot - 4 - Math.abs(Math.sin(f * 0.15 + i * 1.3)) * 6; pixelBlob(c, px, py, 9 + (i % 3) * 2, 5, i % 2 ? '#F4FAF8' : '#D8ECE6'); }
  for (let i = 0; i < 5; i++) {
    const t = ((f * 0.006 + i / 5) % 1);
    c.globalAlpha = 0.28 * (1 - t); pixelBlob(c, xb - 40 + i * 22 + Math.sin(t * 6 + i) * 8, bot - 10 - t * 90, 26 + t * 30, 14 + t * 14, '#EEF6F4'); c.globalAlpha = 1;
  }
};
const onScreenX = (state: GameState, a: number, b: number) => b > state.camera.x - 60 && a < state.camera.x + CANVAS_WIDTH + 60;

// ---------------------------------------------------------------------------------------------------------------
// The clearing's bank down to the river, under the chipper

export const drawClearingBank = (c: Ctx, state: GameState) => {
  if (!onScreenX(state, X(10880), X(11220))) return;
  stillAt(c, 'lr-clearbank', CHIPPER.x - 60, CHIPPER.ground, 0, -2, X(CLEARING.a) - CHIPPER.x + 70, 222, g => {
    const D = hr('dirt', DIRT, 0.18), G = hr('granite', GRANITE, 0.18), w = X(CLEARING.a) - CHIPPER.x + 70;
    bands(g, 0, 0, w, 220, [D[3], D[2], D[2], D[1], D[1], D[0]]);
    for (let n = 0; n < 24; n++) { const x = hash(n * 3.3) * w, y = 10 + hash(n * 1.9) * 200, r = 2 + hash(n) * 6; box(g, x - r, y - r * 0.6, r * 2, r * 1.2, INK); box(g, x - r + 1, y - r * 0.6 + 1, r * 2 - 2, r * 1.2 - 2, G[3]); box(g, x - r + 1, y - r * 0.6 + 1, r, 1, G[6]); }
    for (let n = 0; n < 5; n++) { let x = 10 + n * (w / 5), y = 2; g.strokeStyle = D[0]; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 5; s++) { x += (hash(n + s) - 0.5) * 12; y += 9; g.lineTo(x, y); } g.stroke(); }
  });
};

// ---------------------------------------------------------------------------------------------------------------
// In front: the water's front over the log's foot, the near bank

const paintNearBank = (g: Ctx, v: number) => {
  const G = hr('granite', GRANITE, 0.16), Ms = hr('moss', MOSS, 0.16), Gr = hr('grass', GRASS, 0.16), D = hr('dirt', DIRT, 0.16);
  bands(g, 0, 0, BT, 200, [mix(D[2], G[2], 0.5), D[1], D[1], D[0], D[0]]);
  // (cobbles and boulders, wet near the water, stepped, moss on their backs)
  for (let n = 0; n < 16; n++) {
    const x = hash(v * 13 + n * 1.3) * BT, y = 6 + hash(v * 5 + n * 2.1) * 60, rx = 6 + hash(n + v) * 12, ry = rx * 0.6;
    g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, rx + 1, ry + 1, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = G[2 + (n % 3)]; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = G[5]; g.beginPath(); g.ellipse(x - rx * 0.3, y - ry * 0.4, rx * 0.4, ry * 0.3, 0, 0, Math.PI * 2); g.fill();
    if (n % 3 === 0) box(g, x - rx * 0.5, y - ry, rx, 2, Ms[4]);
  }
  for (let n = 0; n < 7; n++) { const x = hash(v * 3 + n) * BT, h = 6 + hash(n * 7 + v) * 10; for (let k = -1; k <= 1; k++) box(g, x + k * 2, 70 - h + Math.abs(k) * 2, 1, h, k ? Gr[3] : Gr[5]); }
};

export const drawRiverFront = (c: Ctx, state: GameState) => {
  const f = state.frame, Rv = hr('river', RIVER, 0.16);
  const cl = state.camera.x - 40, cr = state.camera.x + CANVAS_WIDTH + 40;
  for (let rx = Math.max(8640, Math.floor((cl - X(0)) / 40) * 40); rx < Math.min(10780, cr - X(0)); rx += 40) {
    if (!flat(rx)) continue;
    const wy = waterY(rx), x = X(rx);
    // (the water over the log's foot: see-through, cold; its lit line rippling; foam flecks riding on)
    c.globalAlpha = 0.6; box(c, x, wy - 2, 41, 30, Rv[4]); c.globalAlpha = 1;
    for (let k = 0; k < 41; k += 8) { const lift = Math.round(Math.sin(f * 0.1 + (rx + k) * 0.06) * 1.5); box(c, x + k, wy - 2 + lift, 8, 1, Rv[7]); if (((rx + k - Math.floor(f * 3)) % 64 + 64) % 64 < 8) box(c, x + k, wy - 3 + lift, 8, 2, '#F0F8F4'); }
  }
  // (the near bank under it, real cobbles: tiles along the flats)
  for (const [a, b] of [[8640, 9860], [9990, 10780]] as const) {
    for (let rx = Math.max(a, Math.floor((cl - X(0)) / BT) * BT); rx < Math.min(b, cr - X(0)); rx += BT) {
      const w = Math.min(BT, b - rx), v = ((rx / BT) % 4 + 4) % 4;
      c.save(); c.beginPath(); c.rect(X(Math.max(rx, a)), waterY(a) + 20, w + 1, 260); c.clip();
      stillAt(c, `lr-nearbank-${v}`, X(rx), waterY(a) + 28, 0, -8, BT, 210, g => paintNearBank(g, v));
      c.restore();
    }
  }
  // (the falls' near side: wet granite down the face under the chute)
  if (onScreenX(state, X(9850), X(10000))) {
    const top = waterY(9860), bot = waterY(9990), G = hr('granite', GRANITE, 0.16);
    c.save(); c.beginPath(); c.moveTo(X(9858), top + 26); c.lineTo(X(9992), bot + 26); c.lineTo(X(9992), bot + 240); c.lineTo(X(9858), bot + 240); c.closePath(); c.clip();
    for (let y = top + 20, r = 0; y < bot + 240; y += 20, r++) for (let x = X(9850) + (r % 2) * 12; x < X(10000); x += 26) { const k = hash(x + r * 7); box(c, x, y, 25, 19, INK); box(c, x + 1, y + 1, 23, 17, k < 0.4 ? G[2] : G[3]); box(c, x + 1, y + 1, 23, 2, G[4]); }
    c.restore();
  }
  void STEEL; void BARK;
};
