// Sawdust Gulch's far off (screen space; the backdrop). Back to front:
//
//   the wilds' far off itself (wilds/far.ts: the same banded western sky and its cumulus, the REAL Rockies past the
//     park, the park's painted plywood mountain flats, the two rows of pines, the lookout, the cell tower in its fake
//     boughs), its ground line set to where the zoomed street's ground going back ends;
//   nearer, the rest of the park's frontier over the roofs, a tile painted once for the hour: Timber Tumble's fiberglass
//     mountain with its flume coming down it on trestles and the splash at its foot (no fire on it: a mountain), the
//     white church and its steeple, a windmill on its lattice tower, the backs of the far side's false fronts (raw ply,
//     2x4 braces, PROPERTY OF stenciled), a water tank, the mill's stack, telegraph poles and their sagging wires,
//     pines between.
//
// Down the mine it's the rock: dark, banded, never black.
//
// No volcanoes anywhere.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { signText } from '../../signLetters';
import { drawFar } from '../wilds/far';
import { GY } from '../geometry';
import { type Ctx, box, checker, mix, hash, stamp, bandedGradient, hazeBands, INK, timeOfDay, farTint, skyAt, hourMix, FAR, MINE, PLY, STEEL, FIBER, NEEDLE } from './paint';
import { inMine, mineDepthOf } from './layout';
import { zoomOf, viewOf } from './view';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;

/** Where the ground going back ends on screen (the far layers stand on it). */
export const farLine = (state: GameState) => {
  const z = zoomOf(state);
  return 300 + (-48 + FAR * (GY - state.camera.y - 252)) * z;
};

const fontIn = () => (typeof document !== 'undefined' && document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n');
const tile = (c: Ctx, key: string, off: number, y: number, h: number, tw: number, paint: (g: Ctx) => void) => {
  for (let x = -((off % tw) + tw) % tw; x < W; x += tw) { c.save(); c.translate(Math.round(x), Math.round(y)); stamp(c, `${key}-${fontIn()}`, 0, 0, tw, h, paint); c.restore(); }
};
/** A far layer's color for the hour, then into the sky's haze by `k`. */
const farCol = (k: number) => {
  const tod = timeOfDay(), haze = skyAt(0.88, tod);
  return (c: string) => mix(farTint(hourMix(c, mix(c, '#8A5A48', 0.18), mix(c, '#141832', 0.45), tod), 1, tod), haze, k);
};

// ---------------------------------------------------------------------------------------------------------------
// The park over the roofs

const TW = 1700, TH = 260;
const paintSkyline = (g: Ctx) => {
  const T = farCol(0.3), Tn = farCol(0.2), tod = timeOfDay(), lamps = tod.lamps > 0.3;
  const F = FIBER.map(T), N = NEEDLE.map(T), P = PLY.map(Tn), S = STEEL.map(T);
  // ---- Timber Tumble's mountain: molded fiberglass crags, stepped, pines on its ledges, the flume down its face
  const mx = 980, base = TH;
  const crag: [number, number][] = [[mx - 330, base], [mx - 300, base - 70], [mx - 250, base - 96], [mx - 214, base - 150], [mx - 170, base - 168], [mx - 130, base - 212], [mx - 96, base - 226], [mx - 60, base - 214], [mx - 30, base - 236], [mx + 10, base - 224], [mx + 44, base - 190], [mx + 90, base - 178], [mx + 120, base - 140], [mx + 170, base - 120], [mx + 210, base - 76], [mx + 260, base - 58], [mx + 300, base]];
  g.fillStyle = INK; g.beginPath(); crag.forEach(([x, y], i) => (i ? g.lineTo(x, y - 1) : g.moveTo(x, y))); g.closePath(); g.fill();
  g.save(); g.beginPath(); crag.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
  bandedGradient(g, mx - 340, base - 240, 650, 240, [F[5], F[4], F[4], F[3], F[3], F[2]], 8);
  // (molded strata, each lit along its top; the shade down the right flank)
  for (let k = 0; k < 9; k++) { const y = base - 220 + k * 24 + (k % 2) * 5; for (let x = mx - 330 + (k % 3) * 20; x < mx + 300; x += 60 + (k * 13) % 30) { box(g, x, y, 40 + (k * 7) % 20, 2, F[5]); box(g, x, y + 2, 40 + (k * 7) % 20, 1, F[1]); } }
  g.fillStyle = F[1]; g.beginPath(); g.moveTo(mx - 30, base - 236); g.lineTo(mx + 300, base); g.lineTo(mx + 120, base); g.lineTo(mx + 30, base - 150); g.closePath(); g.fill();
  checker(g, mx + 10, base - 200, 60, 200, F[2], 0);
  // (a seam bolted down it: the park's)
  box(g, mx - 140, base - 200, 1, 200, F[1]); for (let y = base - 190; y < base; y += 22) box(g, mx - 141, y, 3, 2, S[4]);
  g.restore();
  // (pines on its ledges)
  for (const [px, py, h] of [[mx - 240, base - 92, 26], [mx - 200, base - 146, 22], [mx + 70, base - 176, 24], [mx + 160, base - 116, 28], [mx - 290, base - 66, 30], [mx + 230, base - 60, 26]] as const) {
    for (let t = 0; t < 3; t++) { const y0 = py - h + t * h * 0.3, half = 3 + t * 4; g.fillStyle = N[1]; g.beginPath(); g.moveTo(px, y0); g.lineTo(px + half, y0 + h * 0.42); g.lineTo(px - half, y0 + h * 0.42); g.closePath(); g.fill(); g.fillStyle = N[3]; g.beginPath(); g.moveTo(px, y0); g.lineTo(px - half, y0 + h * 0.42); g.lineTo(px - half * 0.2, y0 + h * 0.42); g.closePath(); g.fill(); }
  }
  // (the flume: a plank trough coming down the face on trestles, a log in it, the splash pool at the foot)
  const fl = (u: number): [number, number] => [mx - 60 + u * 360, base - 200 + u * u * 190];
  for (let u = 0.05; u < 1; u += 0.08) { const [x, y] = fl(u); box(g, x - 1, y + 4, 2, base - y - 4, P[1]); g.strokeStyle = P[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y + 8); g.lineTo(x + 26, base - 10); g.stroke(); }
  g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); for (let u = 0; u <= 1; u += 0.04) { const [x, y] = fl(u); u ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  g.strokeStyle = P[3]; g.lineWidth = 6; g.stroke();
  g.strokeStyle = P[5]; g.lineWidth = 1; g.beginPath(); for (let u = 0; u <= 1; u += 0.04) { const [x, y] = fl(u); u ? g.lineTo(x, y - 3) : g.moveTo(x, y - 3); } g.stroke();
  { const [lx, ly] = fl(0.55); box(g, lx - 9, ly - 8, 18, 6, INK); box(g, lx - 8, ly - 7, 16, 4, P[2]); box(g, lx - 8, ly - 7, 16, 1, P[4]); }
  g.fillStyle = T('#E6F2F4'); g.beginPath(); g.ellipse(mx + 300, base - 6, 34, 8, 0, Math.PI, 0); g.fill();
  for (let k = 0; k < 6; k++) box(g, mx + 274 + k * 9, base - 14 - (k % 3) * 6, 3, 8, T('#FFFFFF'));
  // ---- the church: white clapboard, its steeple and bell, a round window
  const cx = 300, cw = 120, ch = 90;
  box(g, cx - 1, base - ch - 1, cw + 2, ch + 1, INK); box(g, cx, base - ch, cw, ch, T('#D8D4C8'));
  for (let y = base - ch + 4; y < base; y += 5) box(g, cx, y, cw, 1, T('#A8A498'));
  g.fillStyle = INK; g.beginPath(); g.moveTo(cx - 8, base - ch); g.lineTo(cx + cw / 2, base - ch - 40); g.lineTo(cx + cw + 8, base - ch); g.closePath(); g.fill();
  g.fillStyle = T('#5A3A30'); g.beginPath(); g.moveTo(cx - 5, base - ch - 1); g.lineTo(cx + cw / 2, base - ch - 37); g.lineTo(cx + cw + 5, base - ch - 1); g.closePath(); g.fill();
  const sx = cx + cw / 2;
  box(g, sx - 15, base - ch - 84, 30, 60, INK); box(g, sx - 14, base - ch - 83, 28, 59, T('#E4E0D4')); box(g, sx + 6, base - ch - 83, 8, 59, T('#B4B0A4'));
  box(g, sx - 8, base - ch - 76, 16, 18, T('#2A2A30')); box(g, sx - 4, base - ch - 72, 8, 8, T('#B8902E'));
  g.fillStyle = INK; g.beginPath(); g.moveTo(sx - 18, base - ch - 84); g.lineTo(sx, base - ch - 150); g.lineTo(sx + 18, base - ch - 84); g.closePath(); g.fill();
  g.fillStyle = T('#5A3A30'); g.beginPath(); g.moveTo(sx - 15, base - ch - 85); g.lineTo(sx, base - ch - 146); g.lineTo(sx + 15, base - ch - 85); g.closePath(); g.fill();
  g.fillStyle = T('#7A5244'); g.beginPath(); g.moveTo(sx - 15, base - ch - 85); g.lineTo(sx, base - ch - 146); g.lineTo(sx - 4, base - ch - 85); g.closePath(); g.fill();
  box(g, sx - 1, base - ch - 160, 2, 14, T('#3A3A3A')); box(g, sx - 5, base - ch - 156, 10, 2, T('#3A3A3A'));
  for (const wx of [cx + 14, cx + cw - 30]) { box(g, wx, base - 60, 16, 30, INK); box(g, wx + 1, base - 59, 14, 28, lamps ? '#E8B05A' : T('#5A7A94')); }
  g.fillStyle = INK; g.beginPath(); g.arc(sx, base - ch + 20, 9, 0, Math.PI * 2); g.fill(); g.fillStyle = lamps ? '#F2C870' : T('#7A9AB4'); g.beginPath(); g.arc(sx, base - ch + 20, 7, 0, Math.PI * 2); g.fill();
  // ---- the windmill: a steel lattice tower, the fan of blades, the tail vane
  const wx = 560, wt = base - 180;
  g.strokeStyle = S[2]; g.lineWidth = 2; g.beginPath(); g.moveTo(wx - 22, base); g.lineTo(wx - 4, wt); g.moveTo(wx + 22, base); g.lineTo(wx + 4, wt); g.stroke();
  g.lineWidth = 1; g.beginPath(); for (let k = 0; k < 6; k++) { const y0 = base - k * 30, y1 = base - (k + 1) * 30, h0 = 22 - k * 3, h1 = 22 - (k + 1) * 3; g.moveTo(wx - h0, y0); g.lineTo(wx + h1, y1); g.moveTo(wx + h0, y0); g.lineTo(wx - h1, y1); } g.stroke();
  g.fillStyle = S[1]; for (let k = 0; k < 18; k++) { const a = (k / 18) * Math.PI * 2; g.beginPath(); g.moveTo(wx + Math.cos(a) * 6, wt + Math.sin(a) * 6); g.lineTo(wx + Math.cos(a + 0.12) * 30, wt + Math.sin(a + 0.12) * 30); g.lineTo(wx + Math.cos(a + 0.26) * 30, wt + Math.sin(a + 0.26) * 30); g.closePath(); g.fill(); }
  g.fillStyle = S[4]; for (let k = 0; k < 18; k += 2) { const a = (k / 18) * Math.PI * 2; g.beginPath(); g.moveTo(wx + Math.cos(a) * 8, wt + Math.sin(a) * 8); g.lineTo(wx + Math.cos(a + 0.12) * 28, wt + Math.sin(a + 0.12) * 28); g.lineTo(wx + Math.cos(a + 0.2) * 28, wt + Math.sin(a + 0.2) * 28); g.closePath(); g.fill(); }
  box(g, wx - 3, wt - 3, 6, 6, INK); box(g, wx, wt - 2, 34, 3, S[2]); g.fillStyle = S[3]; g.beginPath(); g.moveTo(wx + 30, wt - 12); g.lineTo(wx + 50, wt - 6); g.lineTo(wx + 50, wt + 6); g.lineTo(wx + 30, wt + 2); g.closePath(); g.fill();
  // ---- the backs of the far side's fronts: raw plywood, 2x4 braces, sandbags, a stencil (the park)
  const backs: [number, number, number][] = [[20, 120, 100], [150, 90, 120], [640, 130, 96], [790, 100, 112], [1330, 140, 104], [1490, 110, 124]];
  backs.forEach(([bx, bw, bh], i) => {
    box(g, bx - 1, base - bh - 1, bw + 2, bh + 1, INK); box(g, bx, base - bh, bw, bh, P[3]);
    for (let x = bx + 2; x < bx + bw; x += 24) { box(g, x, base - bh, 1, bh, P[2]); box(g, x + 1, base - bh, 1, bh, P[4]); }
    box(g, bx, base - bh, bw, 2, P[5]);
    box(g, bx + 12, base - bh - 18, bw - 24, 18, INK); box(g, bx + 13, base - bh - 17, bw - 26, 17, P[3]); box(g, bx + 13, base - bh - 17, bw - 26, 1, P[5]);
    // (its 2x4s: a stud frame on the back, braces down to sandbags)
    for (let x = bx + 10; x < bx + bw - 6; x += 30) box(g, x, base - bh + 4, 3, bh - 4, P[1]);
    box(g, bx + 4, base - bh * 0.55, bw - 8, 3, P[1]);
    for (const k of [0.25, 0.75]) { const x0 = bx + bw * k; g.strokeStyle = P[1]; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, base - bh * 0.6); g.lineTo(x0 + 26, base); g.stroke(); box(g, x0 + 18, base - 5, 14, 5, T('#8A7A5A')); }
    if (i % 2 === 0) signText(g, 'PROPERTY OF', bx + bw / 2, base - bh * 0.32, { sx: 1, sy: 1, fill: P[1] });
  });
  // ---- a water tank on stilts, the mill's stack (a column of smoke painted still), telegraph poles and wires
  const tx = 1220;
  for (const lx of [tx - 20, tx + 20]) box(g, lx - 1, base - 110, 3, 110, P[1]);
  g.strokeStyle = P[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(tx - 20, base - 100); g.lineTo(tx + 20, base - 20); g.moveTo(tx + 20, base - 100); g.lineTo(tx - 20, base - 20); g.stroke();
  box(g, tx - 28, base - 160, 56, 52, INK); box(g, tx - 27, base - 159, 54, 50, P[2]); for (let y = base - 150; y < base - 110; y += 12) box(g, tx - 27, y, 54, 2, S[2]);
  g.fillStyle = INK; g.beginPath(); g.moveTo(tx - 32, base - 159); g.lineTo(tx, base - 178); g.lineTo(tx + 32, base - 159); g.closePath(); g.fill();
  const stx = 1600;
  box(g, stx - 7, base - 200, 14, 200, INK); box(g, stx - 6, base - 200, 12, 200, T('#6A3A2A')); box(g, stx - 6, base - 200, 4, 200, T('#8A5240'));
  for (let y = base - 196; y < base; y += 8) box(g, stx - 6, y, 12, 1, T('#4A2A20'));
  const smoke = [T('#8A8A90'), T('#B4B4BA'), T('#D8D8DC')];
  for (let k = 0; k < 6; k++) { const r = 8 + k * 5; g.fillStyle = smoke[k % 3]; g.beginPath(); g.ellipse(stx - 6 - k * 20, base - 214 - k * 9, r, r * 0.7, 0, 0, Math.PI * 2); g.fill(); }
  const poles = [80, 470, 860, 1250, 1640];
  g.strokeStyle = T('#2A2018'); g.lineWidth = 1;
  for (let i = 0; i + 1 < poles.length; i++) { g.beginPath(); g.moveTo(poles[i], base - 116); g.quadraticCurveTo((poles[i] + poles[i + 1]) / 2, base - 100, poles[i + 1], base - 116); g.stroke(); }
  for (const px of poles) { box(g, px - 1, base - 124, 3, 124, P[1]); box(g, px - 10, base - 118, 21, 3, P[1]); }
  // ---- pines along the foot, between it all
  for (let x = 6, i = 0; x < TW; x += 18 + hash(i * 2.3) * 30, i++) {
    if ((x > 300 && x < 420) || (x > 540 && x < 580)) continue;
    const h = 30 + hash(i * 1.7) * 30;
    for (let t = 0; t < 3; t++) { const y0 = base - h + t * h * 0.28, half = 4 + t * 5; g.fillStyle = N[1]; g.beginPath(); g.moveTo(x, y0); g.lineTo(x + half, y0 + h * 0.4); g.lineTo(x - half, y0 + h * 0.4); g.closePath(); g.fill(); g.fillStyle = N[3]; g.beginPath(); g.moveTo(x, y0); g.lineTo(x - half, y0 + h * 0.4); g.lineTo(x - half * 0.3, y0 + h * 0.4); g.closePath(); g.fill(); }
  }
  box(g, 0, base - 8, TW, 8, N[1]); checker(g, 0, base - 10, TW, 2, N[1], 0);
  hazeBands(g, 0, base - 70, TW, 70, skyAt(0.94, tod), 0, 0.16, 4);
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
  // (the wilds' far off, its ground line at the street's)
  const gl = farLine(state);
  const fake = { ...state, camera: { ...state.camera, y: GY - 252 - (gl - 252) / 0.7 } } as GameState;
  drawFar(c, fake);
  // (the park over the roofs)
  const tod = timeOfDay();
  tile(c, `ft-skyline-${tod.key}`, state.camera.x * 0.3 + 300, gl - TH + 4, TH, TW, paintSkyline);
  if (m > 0) { c.save(); c.globalAlpha = m; rock(); c.restore(); }
  void hash; void inMine;
  return true;
};
