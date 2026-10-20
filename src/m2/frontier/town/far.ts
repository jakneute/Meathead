// Sawdust Gulch's far off (screen space; the backdrop). Back to front:
//
//   the wilds' far off itself (wilds/far.ts: the same banded western sky and its cumulus, the hawks, the REAL Rockies
//     past the park, the neighbors past the park's edge, the park's painted plywood mountain flats, the land's other
//     attractions where they stand on its map (teases.ts: Timber Tumble's mountain and its big drop ahead, the
//     railroad's trestle back the way the train came), the two rows of pines, the lookout, the cell tower in its fake
//     boughs), its ground line set to where the zoomed street's ground going back ends;
//   nearer, the rest of the town over the roofs, in three stretches painted once for the hour, laid end to end so none
//     comes round twice in the town's length: the backs of the far side's false fronts (raw ply, 2x4 braces, PROPERTY
//     OF stenciled), the white church and its steeple, a windmill on its lattice tower, a red livery barn and its hay
//     hood, the water tank, the sawmill's shed and its brick stack (the smoke's live), the schoolhouse and its bell
//     cupola, the firehouse's hose tower, telegraph poles and their sagging wires, pines between.
//
// Down the mine it's the rock: dark, banded, never black.
//
// No volcanoes anywhere.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { signText } from '../../signLetters';
import { drawFar } from '../wilds/far';
import { GY, FRX } from '../geometry';
import { type Ctx, box, checker, mix, hash, stamp, bandedGradient, hazeBands, pixelBlob, INK, timeOfDay, farTint, skyAt, hourMix, FAR, MINE, PLY, STEEL, NEEDLE } from './paint';
import { mineDepthOf } from './layout';
import { zoomOf, viewOf } from './view';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;

/** Where the ground going back ends on screen (the far layers stand on it). */
export const farLine = (state: GameState) => {
  const z = zoomOf(state);
  return 300 + (-48 + FAR * (GY - state.camera.y - 252)) * z;
};

const fontIn = () => (typeof document !== 'undefined' && document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n');
/** A far layer's color for the hour, then into the sky's haze by `k`. */
const farCol = (k: number) => {
  const tod = timeOfDay(), haze = skyAt(0.88, tod);
  return (c: string) => mix(farTint(hourMix(c, mix(c, '#8A5A48', 0.18), mix(c, '#141832', 0.45), tod), 1, tod), haze, k);
};

// ---------------------------------------------------------------------------------------------------------------
// The town over the roofs (three stretches, TW each, the ground at TH)

const TW = 1700, TH = 260;
type T = (c: string) => string;
interface Pal { T: T; P: string[]; S: string[]; N: string[]; lamps: boolean }

/** The backs of the far side's fronts: raw plywood, a stud frame, braces down to sandbags, a stencil on some. */
const backs = (g: Ctx, K: Pal, list: [number, number, number][]) => {
  const { T, P } = K, base = TH;
  list.forEach(([bx, bw, bh], i) => {
    box(g, bx - 1, base - bh - 1, bw + 2, bh + 1, INK); box(g, bx, base - bh, bw, bh, P[3]);
    for (let x = bx + 2; x < bx + bw; x += 24) { box(g, x, base - bh, 1, bh, P[2]); box(g, x + 1, base - bh, 1, bh, P[4]); }
    box(g, bx, base - bh, bw, 2, P[5]);
    box(g, bx + 12, base - bh - 18, bw - 24, 18, INK); box(g, bx + 13, base - bh - 17, bw - 26, 17, P[3]); box(g, bx + 13, base - bh - 17, bw - 26, 1, P[5]);
    for (let x = bx + 10; x < bx + bw - 6; x += 30) box(g, x, base - bh + 4, 3, bh - 4, P[1]);
    box(g, bx + 4, base - bh * 0.55, bw - 8, 3, P[1]);
    for (const k of [0.25, 0.75]) { const x0 = bx + bw * k; g.strokeStyle = P[1]; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, base - bh * 0.6); g.lineTo(x0 + 26, base); g.stroke(); box(g, x0 + 18, base - 5, 14, 5, T('#8A7A5A')); box(g, x0 + 18, base - 5, 14, 1, T('#A89A78')); }
    if (i % 2 === 0) signText(g, 'PROPERTY OF', bx + bw / 2, base - bh * 0.32, { sx: 1, sy: 1, fill: P[1] });
  });
};
/** The white church: clapboard, its roof, the steeple with its bell and cross, a round window. */
const church = (g: Ctx, K: Pal, cx: number) => {
  const { T, lamps } = K, base = TH, cw = 120, ch = 90;
  const Wh = [T('#A8A498'), T('#C4C0B4'), T('#D8D4C8'), T('#E8E4D8'), T('#F6F2E8')], Rf = [T('#3A2420'), T('#5A3A30'), T('#7A5244')];
  box(g, cx - 1, base - ch - 1, cw + 2, ch + 1, INK); box(g, cx, base - ch, cw, ch, Wh[2]); box(g, cx, base - ch, 6, ch, Wh[4]); box(g, cx + cw - 12, base - ch, 12, ch, Wh[1]);
  for (let y = base - ch + 4; y < base; y += 5) box(g, cx, y, cw, 1, Wh[0]);
  g.fillStyle = INK; g.beginPath(); g.moveTo(cx - 8, base - ch); g.lineTo(cx + cw / 2, base - ch - 40); g.lineTo(cx + cw + 8, base - ch); g.closePath(); g.fill();
  g.fillStyle = Rf[1]; g.beginPath(); g.moveTo(cx - 5, base - ch - 1); g.lineTo(cx + cw / 2, base - ch - 37); g.lineTo(cx + cw + 5, base - ch - 1); g.closePath(); g.fill();
  g.fillStyle = Rf[2]; g.beginPath(); g.moveTo(cx - 5, base - ch - 1); g.lineTo(cx + cw / 2, base - ch - 37); g.lineTo(cx + cw / 2 - 8, base - ch - 1); g.closePath(); g.fill();
  for (let y = base - ch - 30; y < base - ch; y += 6) checker(g, cx + cw / 2 - (y - (base - ch - 37)) * 1.6, y, (y - (base - ch - 37)) * 3.2, 1, Rf[0]);
  const sx = cx + cw / 2;
  box(g, sx - 15, base - ch - 84, 30, 60, INK); box(g, sx - 14, base - ch - 83, 28, 59, Wh[3]); box(g, sx + 6, base - ch - 83, 8, 59, Wh[1]); box(g, sx - 14, base - ch - 83, 3, 59, Wh[4]);
  box(g, sx - 8, base - ch - 76, 16, 18, T('#2A2A30')); box(g, sx - 4, base - ch - 72, 8, 8, T('#B8902E')); box(g, sx - 4, base - ch - 72, 3, 3, T('#E8C25A'));
  g.fillStyle = INK; g.beginPath(); g.moveTo(sx - 18, base - ch - 84); g.lineTo(sx, base - ch - 150); g.lineTo(sx + 18, base - ch - 84); g.closePath(); g.fill();
  g.fillStyle = Rf[1]; g.beginPath(); g.moveTo(sx - 15, base - ch - 85); g.lineTo(sx, base - ch - 146); g.lineTo(sx + 15, base - ch - 85); g.closePath(); g.fill();
  g.fillStyle = Rf[2]; g.beginPath(); g.moveTo(sx - 15, base - ch - 85); g.lineTo(sx, base - ch - 146); g.lineTo(sx - 4, base - ch - 85); g.closePath(); g.fill();
  box(g, sx - 1, base - ch - 160, 2, 14, T('#3A3A3A')); box(g, sx - 5, base - ch - 156, 10, 2, T('#3A3A3A'));
  for (const wx of [cx + 14, cx + cw - 30]) { box(g, wx, base - 60, 16, 30, INK); box(g, wx + 1, base - 59, 14, 28, lamps ? '#E8B05A' : T('#5A7A94')); box(g, wx + 1, base - 59, 14, 4, lamps ? '#F4D08A' : T('#7A9AB4')); box(g, wx + 7, base - 59, 2, 28, INK); }
  g.fillStyle = INK; g.beginPath(); g.arc(sx, base - ch + 20, 9, 0, Math.PI * 2); g.fill(); g.fillStyle = lamps ? '#F2C870' : T('#7A9AB4'); g.beginPath(); g.arc(sx, base - ch + 20, 7, 0, Math.PI * 2); g.fill();
};
/** A windmill: the steel lattice tower, the fan of blades, the tail vane. */
const windmill = (g: Ctx, K: Pal, wx: number, ht = 180) => {
  const { S } = K, base = TH, wt = base - ht;
  g.strokeStyle = S[2]; g.lineWidth = 2; g.beginPath(); g.moveTo(wx - 22, base); g.lineTo(wx - 4, wt); g.moveTo(wx + 22, base); g.lineTo(wx + 4, wt); g.stroke();
  g.lineWidth = 1; g.beginPath(); for (let k = 0; k < 6; k++) { const s = ht / 6, y0 = base - k * s, y1 = base - (k + 1) * s, h0 = 22 - k * 3, h1 = 22 - (k + 1) * 3; g.moveTo(wx - h0, y0); g.lineTo(wx + h1, y1); g.moveTo(wx + h0, y0); g.lineTo(wx - h1, y1); } g.stroke();
  g.fillStyle = S[1]; for (let k = 0; k < 18; k++) { const a = (k / 18) * Math.PI * 2; g.beginPath(); g.moveTo(wx + Math.cos(a) * 6, wt + Math.sin(a) * 6); g.lineTo(wx + Math.cos(a + 0.12) * 30, wt + Math.sin(a + 0.12) * 30); g.lineTo(wx + Math.cos(a + 0.26) * 30, wt + Math.sin(a + 0.26) * 30); g.closePath(); g.fill(); }
  g.fillStyle = S[4]; for (let k = 0; k < 18; k += 2) { const a = (k / 18) * Math.PI * 2; g.beginPath(); g.moveTo(wx + Math.cos(a) * 8, wt + Math.sin(a) * 8); g.lineTo(wx + Math.cos(a + 0.12) * 28, wt + Math.sin(a + 0.12) * 28); g.lineTo(wx + Math.cos(a + 0.2) * 28, wt + Math.sin(a + 0.2) * 28); g.closePath(); g.fill(); }
  box(g, wx - 3, wt - 3, 6, 6, INK); box(g, wx, wt - 2, 34, 3, S[2]); g.fillStyle = S[3]; g.beginPath(); g.moveTo(wx + 30, wt - 12); g.lineTo(wx + 50, wt - 6); g.lineTo(wx + 50, wt + 6); g.lineTo(wx + 30, wt + 2); g.closePath(); g.fill();
};
/** The water tank on its stilts: staves and hoops, the cone roof. */
const tank = (g: Ctx, K: Pal, tx: number) => {
  const { P, S } = K, base = TH;
  for (const lx of [tx - 20, tx + 20]) { box(g, lx - 1, base - 110, 3, 110, P[1]); box(g, lx - 1, base - 110, 1, 110, P[3]); }
  g.strokeStyle = P[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(tx - 20, base - 100); g.lineTo(tx + 20, base - 20); g.moveTo(tx + 20, base - 100); g.lineTo(tx - 20, base - 20); g.stroke();
  box(g, tx - 28, base - 160, 56, 52, INK);
  for (let x = tx - 27; x < tx + 27; x += 2) { const u = (x - tx + 27) / 54; box(g, x, base - 159, 2, 50, P[u < 0.18 ? 4 : u < 0.5 ? 3 : u < 0.82 ? 2 : 1]); }
  for (let y = base - 150; y < base - 110; y += 12) { box(g, tx - 27, y, 54, 2, S[2]); box(g, tx - 27, y, 54, 1, S[4]); }
  g.fillStyle = INK; g.beginPath(); g.moveTo(tx - 32, base - 159); g.lineTo(tx, base - 178); g.lineTo(tx + 32, base - 159); g.closePath(); g.fill();
  g.fillStyle = P[1]; g.beginPath(); g.moveTo(tx - 30, base - 160); g.lineTo(tx, base - 176); g.lineTo(tx + 30, base - 160); g.closePath(); g.fill();
  g.fillStyle = P[2]; g.beginPath(); g.moveTo(tx - 30, base - 160); g.lineTo(tx, base - 176); g.lineTo(tx - 6, base - 160); g.closePath(); g.fill();
};
/** The sawmill: its long shed, a log ramp up into it, the brick stack (its smoke drawn live). */
const STACK_X = 1040, STACK_TOP = TH - 200;
const sawmill = (g: Ctx, K: Pal) => {
  const { T, P, S } = K, base = TH, stx = STACK_X;
  const Bk = [T('#4A2A20'), T('#6A3A2A'), T('#8A5240'), T('#A86A54')];
  box(g, stx - 7, STACK_TOP, 14, base - STACK_TOP, INK); for (let x = stx - 6; x < stx + 6; x += 2) box(g, x, STACK_TOP, 2, base - STACK_TOP, Bk[x < stx - 3 ? 3 : x < stx + 2 ? 2 : 1]);
  for (let y = STACK_TOP + 4; y < base; y += 8) checker(g, stx - 6, y, 12, 1, Bk[0]);
  box(g, stx - 9, STACK_TOP - 5, 18, 6, INK); box(g, stx - 8, STACK_TOP - 4, 16, 4, Bk[3]);
  // (the shed: board and batten, the sawdust blower's pipe, a hip roof in tar paper)
  const sx = stx - 180, sw = 220, sh = 80;
  box(g, sx - 1, base - sh - 1, sw + 2, sh + 1, INK); box(g, sx, base - sh, sw, sh, P[2]);
  for (let x = sx + 4; x < sx + sw; x += 10) { box(g, x, base - sh, 2, sh, P[3]); box(g, x + 2, base - sh, 1, sh, P[1]); }
  g.fillStyle = INK; g.beginPath(); g.moveTo(sx - 8, base - sh); g.lineTo(sx + 20, base - sh - 30); g.lineTo(sx + sw - 20, base - sh - 30); g.lineTo(sx + sw + 8, base - sh); g.closePath(); g.fill();
  bandedGradient(g, sx - 5, base - sh - 28, sw + 10, 27, [T('#4A4A52'), T('#3A3A42'), T('#2E2E36')], 3);
  for (let wx = sx + 16; wx < sx + sw - 20; wx += 34) { box(g, wx, base - sh + 16, 16, 12, INK); box(g, wx + 1, base - sh + 17, 14, 10, K.lamps ? '#E8B05A' : T('#3A4A5A')); }
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(sx + 60, base - sh - 26); g.quadraticCurveTo(sx + 60, base - sh - 70, sx + 110, base - sh - 74); g.stroke();
  g.strokeStyle = S[3]; g.lineWidth = 4; g.stroke();
  // (the log ramp up into its end, logs on it)
  g.strokeStyle = P[1]; g.lineWidth = 4; g.beginPath(); g.moveTo(sx - 90, base); g.lineTo(sx, base - 40); g.stroke();
  for (let k = 0; k < 4; k++) { const lx = sx - 80 + k * 20, ly = base - 6 - k * 9; box(g, lx - 9, ly - 6, 18, 7, INK); box(g, lx - 8, ly - 5, 16, 5, T('#7A4A24')); box(g, lx + 6, ly - 5, 3, 5, T('#C8A070')); }
};
/** A red livery barn: gambrel roof, the hay hood, the big doors' X braces. */
const barn = (g: Ctx, K: Pal, bx: number) => {
  const { T } = K, base = TH, bw = 150, bh = 70;
  const R = [T('#44120E'), T('#621A14'), T('#80261C'), T('#9C3626'), T('#B84E38')], Wt = T('#E8E0D0');
  box(g, bx - 1, base - bh - 1, bw + 2, bh + 1, INK); box(g, bx, base - bh, bw, bh, R[2]); box(g, bx, base - bh, 6, bh, R[3]); box(g, bx + bw - 10, base - bh, 10, bh, R[1]);
  for (let x = bx + 8; x < bx + bw; x += 8) box(g, x, base - bh, 1, bh, R[1]);
  const pts: [number, number][] = [[bx - 8, base - bh], [bx + 14, base - bh - 34], [bx + bw / 2, base - bh - 56], [bx + bw - 14, base - bh - 34], [bx + bw + 8, base - bh]];
  g.fillStyle = INK; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y - 2) : g.moveTo(x - 2, y))); g.closePath(); g.fill();
  g.fillStyle = T('#3A3A40'); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
  g.fillStyle = T('#54545C'); g.beginPath(); g.moveTo(bx - 8, base - bh); g.lineTo(bx + 14, base - bh - 34); g.lineTo(bx + bw / 2, base - bh - 56); g.lineTo(bx + bw / 2 - 10, base - bh - 50); g.lineTo(bx + 14, base - bh - 30); g.closePath(); g.fill();
  const hx = bx + bw / 2;
  box(g, hx - 14, base - bh - 26, 28, 24, INK); box(g, hx - 13, base - bh - 25, 26, 22, R[1]); box(g, hx - 10, base - bh - 22, 20, 18, T('#2A1A10'));
  for (const hy of [base - bh - 8, base - bh - 4]) box(g, hx - 9, hy, 18, 2, T('#C8A440'));
  box(g, hx - 2, base - bh - 34, 4, 8, T('#3A3A3A'));
  for (const dx of [bx + 30, bx + 82]) { box(g, dx - 1, base - 52, 40, 52, INK); box(g, dx, base - 51, 38, 51, R[2]); box(g, dx, base - 51, 38, 2, Wt); box(g, dx, base - 51, 2, 51, Wt); box(g, dx + 36, base - 51, 2, 51, Wt); g.strokeStyle = Wt; g.lineWidth = 2; g.beginPath(); g.moveTo(dx, base - 49); g.lineTo(dx + 38, base); g.moveTo(dx + 38, base - 49); g.lineTo(dx, base); g.stroke(); }
  signText(g, 'LIVERY', hx, base - bh + 12, { sx: 1, sy: 1, fill: Wt });
};
/** The schoolhouse: clapboard, its bell in an open cupola, two tall windows. */
const school = (g: Ctx, K: Pal, sx: number) => {
  const { T, lamps } = K, base = TH, sw = 100, sh = 64;
  const Wh = [T('#9A6A4A'), T('#B88A62'), T('#C89C70'), T('#DCB48A')], Rf = [T('#2A1E18'), T('#3E2E26'), T('#5A4438')];
  box(g, sx - 1, base - sh - 1, sw + 2, sh + 1, INK); box(g, sx, base - sh, sw, sh, Wh[2]); box(g, sx, base - sh, 5, sh, Wh[3]); box(g, sx + sw - 8, base - sh, 8, sh, Wh[1]);
  for (let y = base - sh + 3; y < base; y += 4) box(g, sx, y, sw, 1, Wh[0]);
  g.fillStyle = INK; g.beginPath(); g.moveTo(sx - 6, base - sh); g.lineTo(sx + sw / 2, base - sh - 30); g.lineTo(sx + sw + 6, base - sh); g.closePath(); g.fill();
  g.fillStyle = Rf[1]; g.beginPath(); g.moveTo(sx - 4, base - sh - 1); g.lineTo(sx + sw / 2, base - sh - 28); g.lineTo(sx + sw + 4, base - sh - 1); g.closePath(); g.fill();
  g.fillStyle = Rf[2]; g.beginPath(); g.moveTo(sx - 4, base - sh - 1); g.lineTo(sx + sw / 2, base - sh - 28); g.lineTo(sx + sw / 2 - 6, base - sh - 1); g.closePath(); g.fill();
  const cx = sx + sw / 2;
  box(g, cx - 9, base - sh - 52, 18, 26, INK); box(g, cx - 8, base - sh - 51, 2, 24, Wh[3]); box(g, cx + 6, base - sh - 51, 2, 24, Wh[1]);
  box(g, cx - 4, base - sh - 46, 8, 7, T('#B8902E')); box(g, cx - 4, base - sh - 46, 3, 2, T('#E8C25A'));
  g.fillStyle = INK; g.beginPath(); g.moveTo(cx - 12, base - sh - 51); g.lineTo(cx, base - sh - 66); g.lineTo(cx + 12, base - sh - 51); g.closePath(); g.fill();
  g.fillStyle = Rf[2]; g.beginPath(); g.moveTo(cx - 10, base - sh - 52); g.lineTo(cx, base - sh - 64); g.lineTo(cx + 10, base - sh - 52); g.closePath(); g.fill();
  for (const wx of [sx + 16, sx + sw - 30]) { box(g, wx, base - 50, 14, 30, INK); box(g, wx + 1, base - 49, 12, 28, lamps ? '#E8B05A' : T('#5A7A94')); box(g, wx + 1, base - 36, 12, 2, INK); }
  signText(g, 'SCHOOL', cx, base - sh + 12, { sx: 1, sy: 1, fill: T('#3A2414') });
};
/** The firehouse's hose tower: tall and narrow, louvered at the top, its pyramid cap and a flag. */
const hoseTower = (g: Ctx, K: Pal, hx: number) => {
  const { T } = K, base = TH, ht = 190, w = 34;
  const B = [T('#46180E'), T('#622416'), T('#7E3220'), T('#98442C'), T('#B25C40')];
  box(g, hx - 1, base - ht - 1, w + 2, ht + 1, INK); for (let x = hx; x < hx + w; x += 2) box(g, x, base - ht, 2, ht, B[x < hx + 6 ? 4 : x < hx + 18 ? 3 : x < hx + 28 ? 2 : 1]);
  for (let y = base - ht + 6; y < base; y += 6) checker(g, hx, y, w, 1, B[0]);
  for (let y = base - ht + 8; y < base - ht + 40; y += 5) { box(g, hx + 6, y, w - 12, 3, T('#2A1A14')); box(g, hx + 6, y, w - 12, 1, B[4]); }
  g.fillStyle = INK; g.beginPath(); g.moveTo(hx - 4, base - ht); g.lineTo(hx + w / 2, base - ht - 24); g.lineTo(hx + w + 4, base - ht); g.closePath(); g.fill();
  g.fillStyle = T('#3A3A42'); g.beginPath(); g.moveTo(hx - 2, base - ht - 1); g.lineTo(hx + w / 2, base - ht - 22); g.lineTo(hx + w + 2, base - ht - 1); g.closePath(); g.fill();
  box(g, hx + w / 2 - 1, base - ht - 44, 2, 22, T('#3A3A3A'));
  g.fillStyle = T('#B91C1C'); g.beginPath(); g.moveTo(hx + w / 2 + 1, base - ht - 44); g.lineTo(hx + w / 2 + 16, base - ht - 40); g.lineTo(hx + w / 2 + 1, base - ht - 36); g.closePath(); g.fill();
  box(g, hx + 8, base - 60, w - 16, 60, T('#2A1A14')); box(g, hx + 8, base - 60, w - 16, 2, B[4]);
};
/** Telegraph poles and their sagging wires; pines along the foot (not in front of `skip`), the haze. */
const footOf = (g: Ctx, K: Pal, poles: number[], skip: [number, number][]) => {
  const { T, P, N } = K, base = TH, tod = timeOfDay();
  g.strokeStyle = T('#2A2018'); g.lineWidth = 1;
  for (let i = 0; i + 1 < poles.length; i++) { g.beginPath(); g.moveTo(poles[i], base - 116); g.quadraticCurveTo((poles[i] + poles[i + 1]) / 2, base - 100, poles[i + 1], base - 116); g.stroke(); }
  for (const px of poles) { box(g, px - 1, base - 124, 3, 124, P[1]); box(g, px - 10, base - 118, 21, 3, P[1]); box(g, px - 8, base - 120, 2, 2, T('#7AA8A0')); box(g, px + 6, base - 120, 2, 2, T('#7AA8A0')); }
  for (let x = 6, i = 0; x < TW; x += 18 + hash(i * 2.3) * 30, i++) {
    if (skip.some(([a, b]) => x > a && x < b)) continue;
    const h = 30 + hash(i * 1.7) * 30;
    for (let t = 0; t < 3; t++) { const y0 = base - h + t * h * 0.28, half = 4 + t * 5; g.fillStyle = N[1]; g.beginPath(); g.moveTo(x, y0); g.lineTo(x + half, y0 + h * 0.4); g.lineTo(x - half, y0 + h * 0.4); g.closePath(); g.fill(); g.fillStyle = N[3]; g.beginPath(); g.moveTo(x, y0); g.lineTo(x - half, y0 + h * 0.4); g.lineTo(x - half * 0.3, y0 + h * 0.4); g.closePath(); g.fill(); }
  }
  box(g, 0, base - 8, TW, 8, N[1]); checker(g, 0, base - 10, TW, 2, N[1], 0);
  hazeBands(g, 0, base - 70, TW, 70, skyAt(0.94, tod), 0, 0.16, 4);
};
const paintStretch = (n: number) => (g: Ctx) => {
  const T = farCol(0.3), Tn = farCol(0.2), tod = timeOfDay();
  const K: Pal = { T, P: PLY.map(Tn), S: STEEL.map(T), N: NEEDLE.map(T), lamps: tod.lamps > 0.3 };
  if (n === 0) {
    backs(g, K, [[20, 120, 100], [150, 90, 120]]); church(g, K, 300); windmill(g, K, 560);
    backs(g, K, [[640, 130, 96], [790, 100, 112]]); barn(g, K, 1000); backs(g, K, [[1330, 140, 104], [1490, 110, 124]]);
    footOf(g, K, [80, 470, 860, 1250, 1640], [[300, 420], [540, 580], [990, 1160]]);
  } else if (n === 1) {
    backs(g, K, [[30, 110, 110]]); tank(g, K, 230); backs(g, K, [[330, 120, 98], [470, 100, 118]]);
    sawmill(g, K); backs(g, K, [[1200, 120, 100], [1340, 90, 116]]); windmill(g, K, 1580, 150);
    footOf(g, K, [60, 450, 840, 1230, 1620], [[180, 280], [850, 1080], [1560, 1600]]);
  } else {
    backs(g, K, [[10, 130, 120]]); hoseTower(g, K, 190); backs(g, K, [[260, 110, 96], [400, 140, 112]]);
    school(g, K, 640); backs(g, K, [[800, 120, 104], [950, 100, 122]]); tank(g, K, 1160); backs(g, K, [[1260, 140, 98], [1430, 120, 110]]);
    footOf(g, K, [100, 490, 880, 1270, 1660], [[180, 230], [630, 750], [1130, 1190]]);
  }
};

// ---------------------------------------------------------------------------------------------------------------

export const drawTownBackdrop = (c: Ctx, state: GameState) => {
  const v = viewOf(state), cx = v.x + v.w / 2, cy = v.y + v.h / 2;
  // (down the mine: the rock, banded darker going down, strata, never black; faded in over the sky by how far down the
  // view is (the playtest's: coming up out of the mine the sky popped in all at once), sky alone up top)
  const m = mineDepthOf(cx, cy, -100, 300);
  const rock = () => {
    const R = MINE;
    bandedGradient(c, 0, 0, W, H, [R[3], R[2], R[2], R[1], R[1], R[2]], 8);
    const off = -((state.camera.x * 0.3) % 160);
    for (let y = 30; y < H; y += 46) for (let x = off - 160; x < W; x += 160) { box(c, x + ((y * 7) % 60), y, 70, 2, R[3]); box(c, x + ((y * 7) % 60), y + 2, 70, 1, R[0]); }
  };
  if (m >= 1) { rock(); return true; }
  // (the wilds' far off, its ground line at the street's; the teases where they stand from the middle of the view)
  const gl = farLine(state);
  const fake = { ...state, camera: { ...state.camera, y: GY - 252 - (gl - 252) / 0.7 } } as GameState;
  drawFar(c, fake, cx - FRX);
  // (the town over the roofs: its three stretches end to end (one after another along the town, never the same one
  // twice in its length), the sawmill's smoke live over its stack)
  const tod = timeOfDay(), f = state.frame, off = state.camera.x * 0.3 + 300, top = Math.round(gl - TH + 4);
  for (let n = Math.floor(off / TW), x = n * TW - off; x < W; n++, x += TW) {
    if (x + TW < 0) continue;
    const k = ((n % 3) + 3) % 3, x0 = Math.round(x);
    c.save(); c.translate(x0, top); stamp(c, `ft-town${k}-${tod.key}-${fontIn()}`, 0, 0, TW, TH, paintStretch(k)); c.restore();
    if (k === 1 && x0 + STACK_X > -80 && x0 + STACK_X < W + 40) {
      const T = farCol(0.3), Sm = [T('#8A8A90'), T('#B4B4BA'), T('#D8D8DC')];
      for (let i = 0; i < 8; i++) {
        const age = (f * 0.4 + i * 15) % 120, r = 7 + age * 0.16;
        c.globalAlpha = Math.max(0, 0.9 - age / 130);
        pixelBlob(c, x0 + STACK_X - 4 - age * 0.9, top + STACK_TOP - 10 - age * 0.55, r, r * 0.72, Sm[age < 36 ? 0 : age < 80 ? 1 : 2]);
      }
      c.globalAlpha = 1;
    }
  }
  if (m > 0) { c.save(); c.globalAlpha = m; rock(); c.restore(); }
  return true;
};
