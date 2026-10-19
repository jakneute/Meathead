// The flood climb and the hill, drawn (fake 3D on the one eye).
//
// THE CLIMB: behind, three more soundstages (corrugated, their numbers in circles) coming down as the water comes up past
// them (their tops broken off jagged, rebar, the dust); the HOTEL HAPPYWOOD behind the first shaft (brick, its windows
// lit or blown out, fire escapes painted on, its name in bulbs on a frame on its roof, its side and roof going back);
// STAGE 14 and STAGE 15 at the play plane (ribbed siding lit rib by rib, the names painted big, the elephant door, their
// sides going back into the shafts, their roofs going back, lit along their front edges: stood on); each shaft's
// scaffold frame at the back (standards on base plates, ledgers, braces: dim) and its platforms clamped to it at the
// play plane (punched steel planks or rotten boards, their decks going back, transoms back to the frame, a lit lip; the
// crumbly ones cracked, their lip warning orange); the tower crane on STAGE 15's roof (its lattice mast, the cab, the
// jib out over STAGE 14 and its trolley, the counter-jib's weights, the A-frame and its pendants, the tip's light: dim,
// not a ledge); the HAPPYWOOD water tower, its four legs braced all the way down to the street on their footings. The
// flood: the water behind everything at each depth it's come up past (stacked: the farther, the more water in front of
// it), its surface going back. As the surge first comes in, the hotel's lobby arches and lowest windows burst.
//
// THE HILL: the hill's flank over the third shaft; the hillside rising behind the road (snow in bands, firs under snow,
// rocks), the HAPPYWOOD sign's letters along the ridge on their scaffold legs (the W and the second O gone: bare legs),
// the road down it (packed snow, ruts going back, ash), its front edge lit where he walks, the rock face under it in
// strata (snow on the ledges, icicles); the lava trench (fed down the hillside, out over the face in a fall); the
// bunkers dug in (their insides, the slab, the hazard stripes, the sign before each); the snow banked where the
// avalanches went.

import type { GameState } from '../../../m1/game/core/state';
import { GY } from '../geometry';
import {
  X, Y, R, RUNS, LAVA, LAVA_DOWN, LEDGES, BALL, BUILDINGS, SHAFTS, CLIMB, COVERS, ROOF, DOWNHILL, groundH,
} from './layout';
import type { Hv } from './state';
import { coverRoof } from './chase';
import {
  type Ctx, type View, INK, box, checker, mix, hash, poly, at, atDepth, still, stillAt, seen, signText, STEEL, BRASS, CONCRETE, LIP,
  ramp6, hour, dimmed, rampH, lit, slab, ball, board, bulbs, plain, sideBack, topBack, underBack,
} from '../blvd/kit';
import { gate, hillside } from '../../hub/letters';
import { levelQ, sideQ, truss, tubeH } from '../disaster/paint';
import { bricks, corrugated, CAT, SIDING, BOARD } from '../lot/paint';
import {
  SCAF_D, HOTEL_D, STAGE_BACK_D, BACKS_D, ROAD_D, SLOPE_D, RISE, LETTER_D, BUNK_D, SIGN_D, SNOW, ROCK, LAVA_R, BASALT, ASHY,
  flame, smokeUp, slopeLip, hazard, lip,
} from './paint';
import { win, soot } from './fronts';
import { lavaBack } from './ground';
import { surgeOf } from './effects';
import { hillDetail, BURIED, BURIED_BOX, paintBuried, farDrifts, snowpack, glints, bunkerMouth, bunkerFrost, blowFar, ICICLE, type Buried } from './snowzone';

// ---------------------------------------------------------------------------------------------------------------
// The flood behind things

/** The water at depth d: everything there under the surface tinted, banded deeper; its surface line. */
const waterAt = (c: Ctx, v: View, hv: Hv, d: number) => {
  const fd = hv.flood;
  if (!fd.on) return;
  const sy = Y(fd.h), eye = v.eye;
  const [ax, ay] = at(eye, X(CLIMB.a) - 900, sy, d), [bx] = at(eye, X(CLIMB.b), sy, d);
  if (ay > v.bot) return;
  const l = Math.max(ax, v.v0), r = Math.min(bx, v.v1);
  if (r <= l) return;
  c.fillStyle = 'rgba(28, 50, 78, 0.34)'; c.fillRect(l, ay, r - l, v.bot - ay);
  c.fillStyle = 'rgba(14, 26, 44, 0.2)'; c.fillRect(l, ay + 40 * d, r - l, v.bot - ay);
  box(c, l, ay, r - l, 2, 'rgba(170, 196, 224, 0.55)');
  for (let x = Math.ceil(l / 24) * 24; x < r; x += 24) box(c, x + ((v.f * 0.4 + x) % 10), ay + 3, 8, 1, 'rgba(226, 232, 240, 0.4)');
};
/** Its surface going back from the play plane (looking down on it), the red sky in it, ripples. */
const waterTop = (c: Ctx, v: View, hv: Hv) => {
  const fd = hv.flood;
  if (!fd.on) return;
  const sy = Y(fd.h), eye = v.eye;
  if (eye.y >= sy - 1) return;
  const a = Math.max(X(CLIMB.a) - 900, v.v0 - 200), b = Math.min(X(CLIMB.b), v.v1 + 200);
  if (b <= a) return;
  const cols = ['rgba(60, 74, 100, 0.85)', 'rgba(96, 60, 64, 0.8)', 'rgba(52, 66, 92, 0.8)', 'rgba(120, 70, 60, 0.75)'];
  for (let i = 0; i < 4; i++) levelQ(c, eye, a, b, sy, 1 - 0.0125 * i, 1 - 0.0125 * (i + 1), cols[i]);
  for (let x = Math.ceil(a / 40) * 40; x < b; x += 40) { const [px, py] = at(eye, x + ((v.f * 0.6 + x) % 20), sy, 0.985 - hash(x) * 0.03); box(c, px, py, 12, 1, 'rgba(226, 232, 240, 0.6)'); }
};

/** As the surge comes in (looks only): the HOTEL HAPPYWOOD's lobby arches bursting, the water shoving up inside them and
 *  gushing out over the sills onto the street in a fan, and the lowest windows blowing out (the glass first), the water
 *  pouring out of them down the brick. Drawn at the hotel's depth, as if at the play plane (hotel-local x from hx). */
const SURGE_MURK = ['#121A1C', '#1C2A2C', '#2A3C3A', '#3E5046', '#5A6856', '#7C8870'];
const SURGE_FOAM = ['#7E8A84', '#A8B2AC', '#CCD4CE', '#E8EDE9', '#FFFFFF'];
const hotelBursts = (c: Ctx, hx: number, w: number, wave: number, E: number, f: number) => {
  const M = SURGE_MURK, F = SURGE_FOAM;
  const foam = (x: number, y: number, r: number) => { box(c, x - r, y - r * 0.5, r * 2, r, F[1]); box(c, x - r * 0.7, y - r * 0.75, r * 1.3, r * 0.8, F[2]); box(c, x - r * 0.4, y - r * 0.85, r * 0.7, r * 0.4, F[3]); };
  // (the lowest windows: the glass out first, then the water pouring out of them down the brick)
  for (let k = 0, x = 30; x < w - 40; x += 80, k++) {
    if (hash(k * 5.3 + 1) < 0.45) continue;
    const st = 12 + k * 3, t = wave - st;
    if (t < 0) continue;
    const I = Math.min(1, t / 8) * E, wx = hx + x, cx = wx + 17, sill = GY - 96;
    if (t < 16) for (let n = 0; n < 7; n++) { const u = t / 16, px = cx + (n - 3) * u * 12, py = GY - 120 - u * 14 + u * u * 50 + (n % 3) * 4; box(c, px, py, 2 + (n % 2), 2, n % 2 ? '#C8E0F0' : '#88A8C0'); }
    box(c, wx + 2, GY - 134 + (1 - I) * 26, 30, 36 - (1 - I) * 26, M[2]); box(c, wx + 2, GY - 134 + (1 - I) * 26, 30, 3, F[2]);
    const half = 8 + 5 * I;
    poly(c, [[cx - 12 * I - 3, sill], [cx + 12 * I + 3, sill], [cx + half + 4 * I, GY], [cx - half - 4 * I, GY]], M[3]);
    poly(c, [[cx - 5 * I, sill], [cx + 5 * I, sill], [cx + half * 0.5, GY], [cx - half * 0.5, GY]], M[4]);
    for (let n = 0; n < 5; n++) { const y = sill + ((f * 6 + n * 19) % 96); box(c, cx - half * 0.6 + n * half * 0.3, y, 2, 6, n % 2 ? F[2] : M[5]); }
    box(c, cx - 14 * I, sill - 1, 28 * I, 2, F[3]);
    for (let n = 0; n < 3; n++) foam(cx - 10 + n * 10 + Math.sin(f * 0.4 + n) * 2, GY - 2, (5 + (n % 2) * 3) * I);
  }
  // (the lobby arches: the water shoved up in them, its crown churning; out over the sills toward us in a fan)
  for (let j = 0, x = 20; x < w - 70; x += 110, j++) {
    const st = 6 + j * 4, t = wave - st;
    if (t < 0) continue;
    const I = Math.min(1, t / 10) * E, ax = hx + x, top = GY - 30 - 66 * I;
    c.save(); c.beginPath(); c.rect(ax, GY - 64, 70, 64); c.arc(ax + 35, GY - 64, 35, Math.PI, 0); c.clip();
    box(c, ax, top, 70, 6, M[5]); box(c, ax, top + 6, 70, 14, M[4]); box(c, ax, top + 20, 70, GY - top - 20, M[3]);
    checker(c, ax, top + 18, 70, 2, M[4], 0);
    for (let n = 0; n < 6; n++) foam(ax + 6 + n * 12 + Math.sin(f * 0.5 + n + j) * 3, top + 2, 5 + ((n + j) % 3) * 2);
    c.restore();
    const out = 26 * I, lip = GY - 28 * I;
    poly(c, [[ax + 2, lip], [ax + 68, lip], [ax + 70 + out, GY + 4], [ax - out, GY + 4]], M[3]);
    poly(c, [[ax + 12, lip], [ax + 58, lip], [ax + 62 + out * 0.5, GY + 4], [ax + 8 - out * 0.5, GY + 4]], M[4]);
    box(c, ax + 2, lip - 1, 66, 2, F[3]);
    for (let n = 0; n < 7; n++) { const u = ((f * 0.12 + n * 0.37) % 1), px = ax + 6 + n * 10 + (n - 3) * u * 6, py = lip + u * (GY - lip); box(c, px, py, 2, 5, n % 2 ? F[2] : M[5]); }
    for (let n = 0; n < 6; n++) foam(ax - out + n * ((70 + out * 2) / 5) + Math.sin(f * 0.45 + n) * 2, GY + 2, (6 + (n % 3) * 3) * I);
    // (spray thrown up off the burst)
    for (let n = 0; n < 6; n++) { const u = ((f * 0.05 + n * 0.21 + j * 0.13) % 1), px = ax + 10 + n * 10 + (n - 2.5) * u * 18, py = top - u * 22 + u * u * 40; box(c, px, py, 2, 2, u < 0.5 ? F[4] : F[2]); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The climb's buildings

const BACKS: [number, number, number, number, string][] = [[6200, 380, 760, 300, '9'], [6900, 420, 1100, 700, '6'], [7550, 420, 1480, 1100, '3']];
const paintBackStage = (g: Ctx, w: number, h: number, n: string) => {
  const S = SIDING.map(dimmed), T = (col: string) => dimmed(col);
  box(g, -1, -h - 1, w + 2, h + 1, INK);
  corrugated(g, 0, -h, w, h, S);
  for (let y = -h + 80; y < -40; y += 120) { box(g, 0, y, w, 2, S[0]); box(g, 0, y + 2, w, 1, S[4]); }
  // (its number in a circle, STAGE over it)
  const cx = w * 0.3, cy = -h + 70;
  g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, 32, 0, Math.PI * 2); g.fill();
  g.fillStyle = T('#F4EEE2'); g.beginPath(); g.arc(cx, cy, 31, 0, Math.PI * 2); g.fill();
  g.fillStyle = T('#D8D0C2'); g.beginPath(); g.arc(cx + 3, cy + 3, 26, 0, Math.PI * 2); g.fill();
  g.fillStyle = T('#F4EEE2'); g.beginPath(); g.arc(cx - 1, cy - 1, 25, 0, Math.PI * 2); g.fill();
  signText(g, n, cx, cy + 12, plain(4, 4, T('#2A2228')));
  signText(g, 'STAGE', cx, cy - 38, plain(2, 2, T('#F4EEE2'), T('#2A2228')));
  // (high windows, a fire escape painted on, the elephant door)
  for (let y = -h + 140; y < -180; y += 90) for (let k = 0; k < 4; k++) win(g, w * 0.5 + k * 34, y, 18, 22, S, w + y + k);
  const dw = Math.min(110, w * 0.3), dx = w * 0.55;
  box(g, dx - 2, -150, dw + 4, 150, INK); box(g, dx, -148, dw, 148, S[1]); for (let y = -146; y < 0; y += 5) box(g, dx, y, dw, 1, S[0]);
  for (let k = 0; k < 4; k++) soot(g, w * (0.2 + k * 0.2), -h + 10 + hash(k + w) * 200, 60, 20);
};
const paintHotel = (g: Ctx, w: number, h: number) => {
  const Br = rampH('#6B4F3A', true), S = rampH('#C8BCA4', true), I = STEEL.map(dimmed);
  box(g, -2, -h - 2, w + 4, h + 2, INK);
  bricks(g, 0, -h, w, h, Br, dimmed('#2A1A16'), 6300);
  for (let y = -h + 4, k = 0; y < -10; y += 12, k++) for (const qx of [0, w - (k % 2 ? 14 : 20)]) { box(g, qx, y, k % 2 ? 14 : 20, 11, S[3]); box(g, qx, y, k % 2 ? 14 : 20, 1, S[5]); }
  // (the cornice, the belt courses; the windows in rows, some lit, some blown out)
  box(g, -8, -h - 12, w + 16, 14, INK); box(g, -7, -h - 11, w + 14, 5, S[2]); box(g, -5, -h - 6, w + 10, 4, S[3]); for (let x = -4; x < w + 4; x += 6) box(g, x, -h - 3, 3, 3, S[4]);
  for (let y = -h + 40, r = 0; y < -90; y += 64, r++) {
    box(g, 0, y + 50, w, 3, S[2]); box(g, 0, y + 50, w, 1, S[4]);
    for (let x = 30, k = 0; x < w - 40; x += 80, k++) win(g, x, y, 34, 40, Br, 6300 + r * 17 + k * 5);
  }
  // (the fire escapes painted on the brick: dim, not to stand on)
  for (const ex of [w * 0.28, w * 0.7]) for (let y = -h + 92; y < -100; y += 128) {
    box(g, ex - 40, y, 80, 3, I[1]); box(g, ex - 40, y - 24, 80, 2, I[1]);
    for (let x = ex - 40; x <= ex + 40; x += 8) box(g, x, y - 24, 1, 24, I[1]);
    g.strokeStyle = I[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(ex + 30, y); g.lineTo(ex - 30, y + 128); g.stroke();
  }
  // (the lobby: arches at the street, dark)
  for (let x = 20; x < w - 70; x += 110) { box(g, x - 2, -100, 74, 100, INK); g.fillStyle = INK; g.beginPath(); g.arc(x + 35, -64, 37, Math.PI, 0); g.fill(); g.fillStyle = '#1A1214'; g.beginPath(); g.arc(x + 35, -64, 35, Math.PI, 0); g.fill(); box(g, x, -64, 70, 64, '#1A1214'); }
  // (its name on a steel frame on the roof, in bulbs)
  for (let x = w / 2 - 170; x <= w / 2 + 170; x += 34) { box(g, x - 1, -h - 92, 4, 82, INK); box(g, x, -h - 92, 2, 82, I[4]); }
  g.strokeStyle = I[2]; g.lineWidth = 1; g.beginPath(); for (let x = w / 2 - 170; x < w / 2 + 170; x += 34) { g.moveTo(x, -h - 12); g.lineTo(x + 34, -h - 90); } g.stroke();
  box(g, w / 2 - 176, -h - 94, 352, 4, INK); box(g, w / 2 - 175, -h - 93, 350, 2, I[3]);
  signText(g, 'HOTEL HAPPYWOOD', w / 2, -h - 32, bulbs(3, 4, '#FDE68A'));
  for (let k = 0; k < 5; k++) soot(g, 60 + k * 140, -h + 60 + hash(k) * 300, 80, 26);
};
const paintStageFace = (g: Ctx, w: number, h: number, name: string) => {
  const S = ramp6(hour('#A8A29E')), T = (col: string) => hour(col);
  box(g, -1, -h, w + 2, h, INK);
  // (the ribbed siding: each rib lit down its left, shaded right; the girts across)
  for (let x = 0; x < w; x += 24) { box(g, x, -h, 24, h, S[3]); box(g, x, -h, 3, h, S[4]); box(g, x + 3, -h, 1, h, S[5]); box(g, x + 18, -h, 6, h, S[2]); box(g, x + 22, -h, 2, h, S[1]); }
  for (let y = -h + 110; y < -20; y += 150) { box(g, 0, y, w, 3, S[1]); box(g, 0, y + 3, w, 1, S[5]); }
  checker(g, 0, -40, w, 8, S[1], 1, 2); box(g, 0, -32, w, 32, S[2]); checker(g, 0, -12, w, 12, S[1], 0, 2);
  // (its name painted big)
  signText(g, name, w / 2, -h + 116, { sx: 6, sy: 7, fill: [T('#9A1E1E'), T('#7F1D1D'), T('#7F1D1D'), T('#5A1010')], dither: true, shadow: T('#3A0A0A'), drop: 2, gap: 2, worn: 0.08, wornCol: S[3] });
  // (the elephant door at the street, its man door; a SHOOTING lamp over it, dead)
  const dw = 150, dx = w / 2 - dw / 2, dh = Math.min(200, h - 160);
  box(g, dx - 3, -dh - 3, dw + 6, dh + 3, INK); box(g, dx - 2, -dh - 2, dw + 4, dh + 2, S[4]);
  box(g, dx, -dh, dw, dh, S[1]); for (let y = -dh + 3; y < 0; y += 5) { box(g, dx, y, dw, 1, S[0]); box(g, dx, y + 1, dw, 1, S[2]); }
  box(g, dx + dw - 30, -44, 22, 44, INK); box(g, dx + dw - 29, -43, 20, 43, S[2]);
  box(g, w / 2 - 10, -dh - 18, 20, 11, INK); box(g, w / 2 - 9, -dh - 17, 18, 9, T('#6A2A2A'));
  // (soot from the roof's edge, scorch)
  for (let k = 0; k < 3; k++) for (let r = 0; r < 70; r += 3) { g.fillStyle = `rgba(16, 10, 10, ${(0.4 * (1 - r / 70)).toFixed(2)})`; g.fillRect(w * (0.2 + k * 0.3) - 14 - r * 0.2, -h + r, 28 + r * 0.4, 3); }
  // (its roof's front edge: the coping, lit: he stands on it)
  box(g, -2, -h, w + 4, 8, INK); box(g, -1, -h + 1, w + 2, 6, S[2]); box(g, -1, -h + 5, w + 2, 2, S[1]);
  lip(g, -1, -h, w + 2);
};

// ---------------------------------------------------------------------------------------------------------------
// The scaffolds, the ledges

const FRAME_D = SCAF_D;
const frame = (c: Ctx, v: View, s: typeof SHAFTS[number]) => {
  const I = STEEL.map(dimmed), a = X(s.a) + 14, b = X(s.b) - 14, floor = Y(s.floor), top = Y(s.top) - 50;
  if (!seen(v, a, b, FRAME_D)) return;
  atDepth(c, v.eye, FRAME_D, () => {
    const n = Math.max(2, Math.round((b - a) / 110));
    const xs = Array.from({ length: n + 1 }, (_, k) => a + ((b - a) * k) / n);
    for (let y = floor - 90, k = 0; y > top; y -= 90, k++) {
      for (let j = 0; j < n; j++) if ((j + k) % 2 === 0) { c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(xs[j], y + 90); c.lineTo(xs[j + 1], y); c.stroke(); c.strokeStyle = I[2]; c.lineWidth = 1; c.stroke(); }
      tubeH(c, a, b, y, 3, I);
    }
    for (const x of xs) { box(c, x - 2, top, 5, floor - top, INK); box(c, x - 1, top, 3, floor - top, I[3]); box(c, x - 1, top, 1, floor - top, I[5]); box(c, x - 6, floor - 3, 13, 3, INK); box(c, x - 5, floor - 2, 11, 2, I[2]); }
  });
};
const CRUMBLE_LIP = ['#5A3A20', '#C8783A', '#FDBA74', '#FFE8C8'];
const paintLedge = (g: Ctx, w: number, rotten: boolean, spent: boolean) => {
  if (rotten) {
    const B = BOARD.map(c2 => hour(mix(c2, '#4A3A30', 0.25)));
    box(g, -1, -1, w + 2, 16, INK); box(g, 0, 0, w, 14, B[2]);
    for (let x = 0; x < w; x += 22) { box(g, x, 0, 21, 14, B[(x / 22) % 2 ? 2 : 3]); box(g, x + 21, 0, 1, 14, B[0]); box(g, x + 4, 5, 10, 1, B[1]); }
    // (cracked through)
    g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(w * 0.3, 1); g.lineTo(w * 0.38, 8); g.lineTo(w * 0.34, 14); g.moveTo(w * 0.7, 2); g.lineTo(w * 0.64, 9); g.stroke();
    const L = spent ? LIP : CRUMBLE_LIP;
    box(g, -1, -1, w + 2, 1, INK); box(g, 0, 0, w, 3, L[2]); box(g, 0, 0, w, 1, L[3]); box(g, 0, 3, w, 1, L[0]);
    return;
  }
  const S = STEEL.map(c2 => hour(c2));
  box(g, -1, -1, w + 2, 16, INK); box(g, 0, 0, w, 14, S[3]); box(g, 0, 10, w, 4, S[1]);
  for (let x = 6; x < w - 4; x += 10) { box(g, x, 5, 4, 3, S[0]); box(g, x, 5, 4, 1, INK); }
  for (let x = 0; x < w; x += 48) box(g, x, 0, 1, 14, S[1]);
  lip(g, 0, 0, w);
};
const ledges = (c: Ctx, v: View, hv: Hv, f: number, done: boolean) => {
  const eye = v.eye, S = STEEL.map(c2 => hour(c2));
  LEDGES.forEach(([rx, h, w, crumbles], i) => {
    const x = X(rx), y = Y(h);
    if (!seen(v, x - 60, x + w + 60)) return;
    const cr = hv.crumbs.find(q => q.i === i);
    const rotten = crumbles;
    if (cr?.gone) {
      if (cr.fallY < 600) { c.save(); c.globalAlpha = Math.max(0, 1 - cr.fallY / 600); c.translate(x, y + cr.fallY); c.rotate(Math.min(0.5, cr.fallY / 400) * (i % 2 ? 1 : -1)); paintLedge(c, w, true, done); c.restore(); }
      return;
    }
    const jig = cr && cr.shake > 0 ? (f % 4 < 2 ? -2 : 2) : 0;
    // (the transoms back to the frame; the deck going back)
    for (const bx of [x + 8, x + w - 10]) { const [px, py] = at(eye, bx, y + 28, FRAME_D); c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(bx + jig, y + 13); c.lineTo(px, py); c.stroke(); c.strokeStyle = S[2]; c.lineWidth = 2; c.stroke(); }
    const R2 = rotten ? BOARD.map(c2 => hour(mix(c2, '#4A3A30', 0.25))) : S;
    if (!topBack(c, eye, x + jig, x + w + jig, y, 1, FRAME_D + 0.004, R2, 3)) underBack(c, eye, x + jig, x + w + jig, y + 14, 1, FRAME_D + 0.004, R2, 3);
    if (eye.y < y && !rotten) for (let k = x + 6; k < x + w; k += 10) { const [p0, q0] = at(eye, k + jig, y, 0.996), [p1, q1] = at(eye, k + jig, y, FRAME_D + 0.008); c.strokeStyle = S[1]; c.lineWidth = 1; c.beginPath(); c.moveTo(p0, q0); c.lineTo(p1, q1); c.stroke(); }
    still(c, `hh-ledge-${w}-${rotten ? 1 : 0}-${done ? 1 : 0}`, x + jig, y, -4, -4, w + 8, 22, g => paintLedge(g, w, rotten, done));
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The crane, the water tower

const crane = (c: Ctx, v: View, f: number, done: boolean) => {
  if (!(X(7820) > v.v0 && X(7270) < v.v1 && Y(1410) < v.bot && Y(1040) > v.top)) return;
  const Ct = CAT.map(dimmed), S = STEEL.map(dimmed), mx = X(7640), mw = 18, jy = Y(BALL.ph);
  // (the mast: a lattice column on its base on the roof)
  box(c, mx - 6, Y(1040) - 8, mw + 12, 8, INK); box(c, mx - 5, Y(1040) - 7, mw + 10, 7, S[2]);
  for (const lx of [mx, mx + mw - 3]) { box(c, lx - 1, Y(1362), 5, Y(1040) - Y(1362) - 8, INK); box(c, lx, Y(1362), 3, Y(1040) - Y(1362) - 8, Ct[3]); box(c, lx, Y(1362), 1, Y(1040) - Y(1362) - 8, Ct[4]); }
  c.strokeStyle = Ct[2]; c.lineWidth = 2; c.beginPath(); for (let y = Y(1040) - 8; y > Y(1362); y -= 18) { c.moveTo(mx + 2, y); c.lineTo(mx + mw - 2, y - 9); c.lineTo(mx + 2, y - 18); } c.stroke();
  // (the jib out over STAGE 14, the counter-jib with its weights)
  truss(c, X(7280), mx + mw, jy - 14, 14, Ct, 12);
  truss(c, mx, X(7800), jy - 14, 12, Ct, 12);
  for (const wx of [X(7752), X(7776)]) { box(c, wx - 1, jy - 2, 24, 30, INK); box(c, wx, jy - 1, 22, 28, dimmed(CONCRETE[3])); box(c, wx, jy - 1, 22, 2, dimmed(CONCRETE[5])); box(c, wx + 18, jy - 1, 4, 28, dimmed(CONCRETE[1])); }
  // (the trolley at the jib's end, its sheaves: the cable goes down to the ball from here)
  box(c, X(BALL.px) - 12, jy - 2, 24, 8, INK); box(c, X(BALL.px) - 11, jy - 1, 22, 6, Ct[2]); ball(c, X(BALL.px), jy + 3, 4, '#57534E', true);
  // (the cab under the jib, its glass)
  box(c, mx - 30, jy, 30, 26, INK); box(c, mx - 29, jy + 1, 28, 24, Ct[3]); box(c, mx - 27, jy + 4, 18, 12, dimmed('#4A6888')); box(c, mx - 27, jy + 4, 18, 3, dimmed('#A8C0D0'));
  // (the A-frame on top, the pendants out to the tips)
  const ax = mx + mw / 2, ay = Y(1405);
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(mx, jy - 14); c.lineTo(ax, ay); c.lineTo(mx + mw, jy - 14); c.stroke();
  c.strokeStyle = Ct[3]; c.lineWidth = 2; c.stroke();
  c.strokeStyle = S[1]; c.lineWidth = 1; c.beginPath(); c.moveTo(ax, ay); c.lineTo(X(7290), jy - 14); c.moveTo(ax, ay); c.lineTo(X(7795), jy - 14); c.stroke();
  // (DEMOLITION on a board on the counter-jib's rail; the tip light)
  board(c, X(7720), jy - 21, ['HAPPYWOOD DEMOLITION'], plain(1, 1, '#18181B'), dimmed('#E8B820'), S, 3);
  if (!done && (f >> 4) % 2 === 0) box(c, X(7282), jy - 18, 4, 4, '#FF4A4A');
};
const waterTower = (c: Ctx, v: View, f: number) => {
  if (!(X(8160) > v.v0 && X(7960) < v.v1)) return;
  const S = STEEL.map(dimmed), Wt = rampH('#8A949E', true), eye = v.eye;
  const top = Y(1700), base = Y(1580), l = X(7990), r = X(8130);
  // (the back legs, going back; the front ones braced down to their footings on the street)
  for (const lx of [l, r]) { const [px, py] = at(eye, lx + 6, base, 0.95), [, qy] = at(eye, lx + 6, GY, 0.95); box(c, px - 2, py, 5, qy - py, INK); box(c, px - 1, py, 3, qy - py, S[1]); }
  for (const lx of [l, r]) { box(c, lx - 1, base, 8, GY - base, INK); box(c, lx, base, 6, GY - base, S[3]); box(c, lx, base, 2, GY - base, S[5]); box(c, lx + 5, base, 1, GY - base, S[1]); box(c, lx - 6, GY - 10, 18, 10, INK); box(c, lx - 5, GY - 9, 16, 9, dimmed(CONCRETE[4])); box(c, lx - 5, GY - 9, 16, 2, dimmed(CONCRETE[5])); }
  for (let y = base + 40; y < GY - 60; y += 180) {
    c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(l + 3, y); c.lineTo(r + 3, y + 180); c.moveTo(r + 3, y); c.lineTo(l + 3, y + 180); c.stroke();
    c.strokeStyle = S[2]; c.lineWidth = 2; c.stroke();
    box(c, l, y - 2, r - l + 6, 5, INK); box(c, l, y - 1, r - l + 6, 3, S[3]); box(c, l, y - 1, r - l + 6, 1, S[5]);
  }
  // (the ladder up the near leg)
  for (const lx of [r + 8, r + 18]) box(c, lx, base, 2, GY - base - 10, S[2]);
  for (let y = base + 6; y < GY - 14; y += 12) box(c, r + 8, y, 12, 1, S[3]);
  // (the tank: riveted staves in steps, its hoops; the cone and its finial; HAPPYWOOD on it)
  const tx = X(7980), tw = 160, th = base - top;
  box(c, tx - 1, top - 1, tw + 2, th + 2, INK);
  for (let k = 0; k < tw; k += 2) { const u = k / tw; box(c, tx + k, top, 2, th, Wt[u < 0.1 ? 2 : u < 0.32 ? 4 : u < 0.55 ? 3 : u < 0.82 ? 2 : 1]); }
  for (let yy = top + 16; yy < base; yy += 24) { box(c, tx, yy, tw, 2, Wt[1]); box(c, tx, yy - 1, tw, 1, Wt[5]); for (let k = 6; k < tw; k += 10) box(c, tx + k, yy + 3, 1, 1, Wt[0]); }
  const cx = tx + tw / 2;
  poly(c, [[tx - 8, top + 1], [cx, top - 52], [tx + tw + 8, top + 1]], INK);
  poly(c, [[tx - 6, top], [cx, top - 50], [cx, top]], Wt[3]); poly(c, [[cx, top - 50], [tx + tw + 6, top], [cx, top]], Wt[1]);
  box(c, cx - 2, top - 64, 4, 14, INK); box(c, cx - 1, top - 64, 2, 14, S[4]); ball(c, cx, top - 66, 3, '#8A949E', true);
  signText(c, 'HAPPYWOOD', cx, top + 62, gate({ sx: 2, sy: 2 }, dimmed('#3B6AC8'), dimmed('#14306A')));
  // (the catwalk ring round its foot: dim, no lip; not a ledge)
  box(c, tx - 8, base - 1, tw + 16, 5, INK); box(c, tx - 7, base, tw + 14, 3, S[1]);
  for (let px = tx - 6; px <= tx + tw + 6; px += 14) box(c, px, base - 22, 1, 22, S[1]);
  box(c, tx - 7, base - 22, tw + 14, 1, S[1]);
  if ((f >> 5) % 2 === 0) box(c, cx - 2, top - 72, 4, 3, '#C83A3A');
};

// ---------------------------------------------------------------------------------------------------------------

/** The climb (behind him): the soundstages coming down, the hotel, STAGE 14 and 15, the hill's flank, the frames, the
 *  crane and the water tower, the platforms, the water at each depth. */
export const drawClimb = (c: Ctx, v: View, state: GameState, hv: Hv, done: boolean, part: 'far' | 'near') => {
  if (!(X(CLIMB.b) + 200 > v.v0 - 200 && X(CLIMB.a) - 400 < v.v1 + 200)) return;
  const eye = v.eye, f = state.frame, flood = hv.flood;
  if (part === 'near') { climbNear(c, v, state, hv, done); return; }
  // Behind: the soundstages coming down as the water comes up past them
  BACKS.forEach(([bx, bw, bh, at0, n], i) => {
    const x0 = X(bx);
    if (!seen(v, x0, x0 + bw, BACKS_D)) return;
    const gone = done ? bh * 0.7 : Math.max(0, Math.min(bh * 0.7, (flood.h - at0) * 2.2)), keep = bh - gone;
    atDepth(c, eye, BACKS_D, () => {
      c.save(); c.beginPath(); c.moveTo(x0 - 6, GY + 10);
      const n2 = 10;
      for (let k = 0; k <= n2; k++) c.lineTo(x0 - 6 + ((bw + 12) * k) / n2, Y(keep) + (gone > 0 && k > 0 && k < n2 ? (hash(k * 3.1 + i) - 0.5) * 30 : 0));
      c.lineTo(x0 + bw + 6, GY + 10); c.closePath(); c.clip();
      still(c, `hh-back-${i}`, x0, GY, -10, -bh - 20, bw + 20, bh + 22, g => paintBackStage(g, bw, bh, n));
      c.restore();
      if (gone > 0) {
        for (let k = 0; k < 5; k++) { c.strokeStyle = '#4A2A1A'; c.lineWidth = 2; c.beginPath(); const rx2 = x0 + 30 + k * (bw / 5); c.moveTo(rx2, Y(keep) + 6); c.lineTo(rx2 + 6, Y(keep) - 12 - (k % 3) * 6); c.stroke(); }
        if (!done && gone < bh * 0.7) for (let k = 0; k < 3; k++) { const t = ((f + k * 20) % 40) / 40; c.fillStyle = `rgba(168, 162, 158, ${(0.5 * (1 - t)).toFixed(2)})`; c.fillRect(x0 + 30 + k * 120 - 30 - t * 20, Y(keep) - 10 - t * 40, 60 + t * 40, 22); }
      }
    });
  });
  waterAt(c, v, hv, BACKS_D);
};
const climbNear = (c: Ctx, v: View, state: GameState, hv: Hv, done: boolean) => {
  const eye = v.eye, f = state.frame;
  // The HOTEL HAPPYWOOD behind the first shaft (its side, its roof going back)
  const s1 = SHAFTS[0], hx = X(s1.a), hw = s1.b - s1.a, HH = 560, HR = rampH('#6B4F3A', true);
  if (seen(v, hx - 40, hx + hw + 40, HOTEL_D)) {
    sideBack(c, eye, hx, -1, Y(HH), GY, HOTEL_D, BACKS_D + 0.03, HR, 3);
    topBack(c, eye, hx, X(s1.b), Y(HH), HOTEL_D, BACKS_D + 0.03, ramp6(dimmed('#4A4440')), 3);
    atDepth(c, eye, HOTEL_D, () => still(c, 'hh-hotel', hx, GY, -12, -HH - 100, hw + 24, HH + 102, g => paintHotel(g, hw, HH)));
    if (!done) atDepth(c, eye, HOTEL_D, () => { for (let k = 0; k < 2; k++) flame(c, hx + 120 + k * 360, Y(HH) + 2, 26, 40, f, 50 + k); });
    const s = surgeOf(state, hv);
    if (!done && s.on && s.E > 0.02) atDepth(c, eye, HOTEL_D, () => hotelBursts(c, hx, hw, s.wave, s.E, f));
  }
  waterAt(c, v, hv, HOTEL_D);
  // STAGE 14, STAGE 15: their sides into the shafts, their roofs going back, their faces
  const SR = ramp6(hour('#8A847E')), RR = ramp6(hour('#4A4440'));
  for (const [bx, bw, bh, name] of BUILDINGS) {
    const x0 = X(bx);
    if (!(x0 + bw > v.v0 - 300 && x0 < v.v1 + 300)) continue;
    const below = BUILDINGS.find(q => q[0] + q[1] === bx);
    sideBack(c, eye, x0, -1, Y(bh), below ? Y(below[2]) : GY, 1, STAGE_BACK_D, SR, 4);
    if (topBack(c, eye, x0, x0 + bw, Y(bh), 1, STAGE_BACK_D, RR, 4)) {
      // (the roof: gravel, a hatch, a vent going back)
      for (let k = 0; k < 6; k++) { const d = 0.9 + hash(k + bx) * 0.08, [px, py] = at(eye, x0 + 40 + k * (bw / 6), Y(bh), d); box(c, px, py - 1, 3, 1, hour('#6A625C')); }
      const [hxp, hyp] = at(eye, x0 + bw * 0.7, Y(bh), 0.88); box(c, hxp - 12, hyp - 8, 24, 8, INK); box(c, hxp - 11, hyp - 7, 22, 6, hour('#5A544E'));
    }
    still(c, `hh-stage-${bx}`, x0, Y(0), -4, -bh - 4, bw + 8, bh + 6, g => paintStageFace(g, bw, bh, name));
  }
  // The hill's flank over the third shaft (rock going back; the hillside's top along it)
  const fx = X(CLIMB.b);
  if (eye.x < fx - 1 && seen(v, fx - 300, fx + 40)) {
    const N = 5;
    for (let i = 0; i < N; i++) {
      const d0 = 1 - ((1 - SLOPE_D) * i) / N, d1 = 1 - ((1 - SLOPE_D) * (i + 1)) / N;
      poly(c, [at(eye, fx, hillTop(R(fx) + 1, d0), d0), at(eye, fx, hillTop(R(fx) + 1, d1), d1), at(eye, fx, Y(1040), d1), at(eye, fx, Y(1040), d0)], [ROCK[3], ROCK[2], ROCK[2], ROCK[1], ROCK[1]][i]);
    }
    for (let h = 1080; h < 1500; h += 60) { const [p, q] = at(eye, fx, Y(h), 1), [p2, q2] = at(eye, fx, Y(h), SLOPE_D); c.strokeStyle = ROCK[0]; c.lineWidth = 1; c.beginPath(); c.moveTo(p, q); c.lineTo(p2, q2); c.stroke(); }
    const [p, q] = at(eye, fx, Y(1500), 1), [p2, q2] = at(eye, fx, hillTop(R(fx) + 1, SLOPE_D), SLOPE_D); c.strokeStyle = SNOW[4]; c.lineWidth = 3; c.beginPath(); c.moveTo(p, q); c.lineTo(p2, q2); c.stroke();
  }
  // The frames at the back of the shafts
  for (const s of SHAFTS) frame(c, v, s);
  waterAt(c, v, hv, FRAME_D);
  waterTop(c, v, hv);
  // The crane on STAGE 15's roof, the water tower
  crane(c, v, f, done);
  waterTower(c, v, f);
  // The platforms
  ledges(c, v, hv, f, done);
  void LAVA; void RUNS;
};

// ---------------------------------------------------------------------------------------------------------------
// The hill

/** The road's height (world y) at rx, across the lava trench too (straight between its banks). */
const roadY = (rx: number) => {
  const h = groundH(rx);
  if (h !== null) return Y(h);
  const l = LAVA.find(q => rx >= q.a && rx <= q.b);
  return l ? Y(l.hl + ((l.hr - l.hl) * (rx - l.a)) / (l.b - l.a)) : GY;
};
/** How high the hillside rises behind the road (tapering out at the hill's foot). */
const riseAt = (rx: number) => RISE * Math.max(0, Math.min(1, (DOWNHILL.b - rx) / 700));
/** The hillside's height (world y, as at the play plane) at rx, depth d (between the road's far edge and SLOPE_D). */
export const hillTop = (rx: number, d: number) => {
  const k = Math.max(0, Math.min(1, (ROAD_D - d) / (ROAD_D - SLOPE_D)));
  return roadY(rx) - riseAt(rx) * Math.pow(k, 1.3);
};

const paintFir = (g: Ctx, h: number, seed: number) => {
  const G = ['#0E1A16', '#16261E', '#22362A', '#2E4636'].map(dimmed), S = SNOW.map(dimmed);
  box(g, -3, -14, 6, 14, INK); box(g, -2, -14, 4, 14, dimmed('#3A2A1E'));
  for (let k = 0; k < 5; k++) {
    const y = -14 - k * (h / 6), hw = (h * 0.32) * (1 - k / 6);
    poly(g, [[-hw - 1, y + 1], [0, y - h / 4 - 1], [hw + 1, y + 1]], INK);
    poly(g, [[-hw, y], [0, y - h / 4], [hw, y]], G[1 + (k % 2)]);
    poly(g, [[-hw, y], [0, y - h / 4], [-hw * 0.2, y]], G[3]);
    // (the snow along each tier's top)
    poly(g, [[-hw * 0.8, y - 2], [0, y - h / 4], [hw * 0.5, y - 4], [hw * 0.2, y - 1]], S[4]);
    box(g, -hw * 0.6, y - 2, hw * 0.9, 2, S[5]);
  }
  void seed;
};
const paintRock = (g: Ctx, w: number) => {
  const Rk = ROCK.map(dimmed), S = SNOW.map(dimmed);
  poly(g, [[-w / 2 - 1, 1], [-w / 2 + 3, -w * 0.4], [-w * 0.1, -w * 0.6 - 1], [w * 0.3, -w * 0.45], [w / 2 + 1, 1]], INK);
  poly(g, [[-w / 2, 0], [-w / 2 + 3, -w * 0.4], [-w * 0.1, -w * 0.6], [w * 0.3, -w * 0.45], [w / 2, 0]], Rk[3]);
  poly(g, [[-w * 0.1, -w * 0.6], [w * 0.3, -w * 0.45], [w / 2, 0], [w * 0.1, 0]], Rk[2]);
  poly(g, [[-w / 2 + 3, -w * 0.4], [-w * 0.1, -w * 0.6], [w * 0.1, -w * 0.5], [-w * 0.2, -w * 0.36]], S[4]);
};
const paintLetter = (g: Ctx, ch: string | null) => {
  const S = STEEL.map(dimmed);
  // (the legs and the frame behind: the letter's scaffold)
  for (const dx of [-14, 0, 14]) { box(g, dx - 2, -140, 4, 140, INK); box(g, dx - 1, -140, 2, 140, S[2]); }
  for (const y of [-50, -100]) { box(g, -18, y, 36, 3, INK); box(g, -17, y + 1, 34, 1, S[3]); }
  g.strokeStyle = S[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(-14, -10); g.lineTo(14, -50); g.moveTo(14, -10); g.lineTo(-14, -50); g.stroke();
  if (!ch) { for (const dx of [-14, 0, 14]) { poly(g, [[dx - 2, -140], [dx + 3, -148], [dx + 2, -136]], S[3]); } return; }
  signText(g, ch, 0, -40, hillside({ sx: 7, sy: 14 }, dimmed('#F5F5F4'), dimmed('#A8A29E')));
  box(g, -18, -40, 36, 3, dimmed('#6A6460'));
  // (snow along its top, scorch up its face)
  box(g, -17, -140, 34, 4, SNOW.map(dimmed)[4]);
  for (let r = 0; r < 40; r += 3) { g.fillStyle = `rgba(20, 12, 10, ${(0.3 * (1 - r / 40)).toFixed(2)})`; g.fillRect(-10 - r * 0.2, -40 - r - 3, 20 + r * 0.4, 3); }
};

/** The bunker k (behind him): its inside dug back into the hill, the posts, the slab (its lit top: stood on). */
const bunker = (c: Ctx, v: View, k: number, f: number, done: boolean) => {
  const cv = COVERS[k], r = coverRoof(k), under = r.y + r.h, floorY = under + ROOF, eye = v.eye;
  if (!(r.x + r.w + 200 > v.v0 && r.x - 200 < v.v1)) return;
  const C = ramp6(hour('#8A847E')), Cd = ramp6(hour('#4A4440'));
  const L = r.x + 10, Rr = r.x + r.w - 10;
  // (the outsides going back, the berm of snow and earth heaped up them)
  sideBack(c, eye, r.x, -1, r.y, floorY, 1, BUNK_D, C, 3);
  sideBack(c, eye, r.x + r.w, 1, r.y, floorY, 1, BUNK_D, C, 3);
  // (inside: the back wall, the floor, the ceiling's underside, the inner walls he can see)
  poly(c, [at(eye, L, under, BUNK_D), at(eye, Rr, under, BUNK_D), at(eye, Rr, floorY, BUNK_D), at(eye, L, floorY, BUNK_D)], '#1C1917');
  for (let y = under + 22; y < floorY - 4; y += 22) { const [p, q] = at(eye, L, y, BUNK_D), [p2] = at(eye, Rr, y, BUNK_D); box(c, p, q, p2 - p, 2, '#292524'); }
  levelQ(c, eye, L, Rr, floorY, 1, BUNK_D, Cd[2]);
  if (eye.y > under) levelQ(c, eye, L, Rr, under, 1, BUNK_D, Cd[0]);
  if (eye.x > L) sideQ(c, eye, L, under, floorY, 1, BUNK_D, Cd[1]);
  if (eye.x < Rr) sideQ(c, eye, Rr, under, floorY, 1, BUNK_D, Cd[1]);
  atDepth(c, eye, BUNK_D, () => {
    const mx = (L + Rr) / 2;
    signText(c, cv.name, mx, under + 40, { sx: 1, sy: 2, fill: '#FACC15', stencil: true, gap: 1 });
    // (sandbags along the back, a bench, a first aid box)
    for (let x = L + 4; x < Rr - 26; x += 26) { box(c, x - 1, floorY - 15, 26, 15, INK); box(c, x, floorY - 14, 24, 14, '#A8A29E'); box(c, x + 2, floorY - 14, 20, 3, '#D6D3D1'); }
    box(c, Rr - 40, floorY - 50, 26, 18, INK); box(c, Rr - 39, floorY - 49, 24, 16, '#F8FAFC'); box(c, Rr - 29, floorY - 47, 4, 12, '#DC2626'); box(c, Rr - 33, floorY - 43, 12, 4, '#DC2626');
    // (the caged bulb, its glow; it flickers)
    const on = done || f % 90 > 3;
    if (on) { c.fillStyle = 'rgba(253, 230, 138, 0.14)'; c.fillRect(mx - 60, under, 120, 50); c.fillStyle = 'rgba(253, 230, 138, 0.1)'; c.fillRect(mx - 90, under, 180, 80); }
    box(c, mx - 1, under, 2, 8, '#18181B'); box(c, mx - 5, under + 8, 10, 10, on ? '#FEF3C7' : '#57534E');
    c.strokeStyle = '#18181B'; c.lineWidth = 1; c.strokeRect(mx - 6, under + 7, 12, 12);
  });
  // (it reads as cover: the bulb's light on the floor, TAKE COVER on its plate in the mouth: snowzone.ts)
  bunkerMouth(c, v, L, Rr, under, floorY, f, done || f % 90 > 3);
  // (the corner posts, concrete, at the front)
  for (const px of [r.x, r.x + r.w - 10]) { box(c, px - 1, under, 12, ROOF, INK); box(c, px, under, 10, ROOF, C[3]); box(c, px, under, 3, ROOF, C[4]); box(c, px + 8, under, 2, ROOF, C[1]); }
  // (the slab: its top going back (snow heaped at its back), its face with the hazard stripes, the lit lip)
  if (topBack(c, eye, r.x - 2, r.x + r.w + 2, r.y, 1, BUNK_D, C, 3)) {
    for (let x = r.x + 4; x < r.x + r.w; x += 22) { const [p, q] = at(eye, x, r.y, BUNK_D + 0.02); box(c, p - 2, q - 5, 20, 6, SNOW[3]); box(c, p, q - 5, 14, 2, SNOW[4]); }
  }
  box(c, r.x - 4, r.y - 2, r.w + 8, r.h + 4, INK); box(c, r.x - 3, r.y - 1, r.w + 6, r.h + 2, C[3]); box(c, r.x - 3, r.y + r.h - 3, r.w + 6, 2, C[1]);
  hazard(c, r.x - 3, r.y + 6, r.w + 6, 9, 0);
  lip(c, r.x - 3, r.y - 1, r.w + 6);
  // (icicles off the slab, frost up the posts, the drifts heaped against its outsides)
  bunkerFrost(c, r.x, r.y, r.w, r.h, under, floorY, f);
};
/** The sign before a bunker: AVALANCHE ZONE (the avalanche on it), BUNKER AHEAD >, on two posts. */
const paintAvalancheSign = (g: Ctx) => {
  const S = STEEL.map(c2 => hour(c2));
  for (const px of [-70, 70]) { box(g, px - 3, -110, 6, 110, INK); box(g, px - 2, -110, 4, 110, S[3]); box(g, px - 2, -110, 1, 110, S[5]); }
  box(g, -94, -168, 188, 66, INK); box(g, -92, -166, 184, 62, '#B91C1C'); box(g, -88, -162, 176, 54, '#F8FAFC'); box(g, -86, -160, 172, 50, '#B91C1C');
  // (the pictogram: a slope, the snow coming down it, a little man running)
  poly(g, [[-82, -112], [-50, -156], [-50, -112]], '#F8FAFC'); for (let k = 0; k < 4; k++) box(g, -76 + k * 7, -130 + k * 4, 6, 4, '#E2E8F0');
  box(g, -44, -128, 4, 8, '#F8FAFC'); box(g, -46, -120, 3, 6, '#F8FAFC'); box(g, -41, -120, 3, 6, '#F8FAFC'); box(g, -44, -134, 4, 4, '#F8FAFC');
  signText(g, 'AVALANCHE ZONE', 18, -140, gate({ sx: 1, sy: 2 }, '#F8FAFC', '#7F1D1D'));
  signText(g, 'BUNKER AHEAD >', 18, -120, plain(1, 1, '#FEF3C7'));
  for (const sx of [-88, 84]) box(g, sx, -164, 3, 3, '#A1A1AA');
  // (snow loaded along its top, overhanging, icicles off its bottom edge, frost up the posts, drifts at their feet)
  box(g, -96, -170, 192, 6, INK); box(g, -95, -171, 190, 5, SNOW[4]); box(g, -93, -172, 150, 2, SNOW[5]); box(g, -95, -166, 190, 1, SNOW[2]);
  for (let x = -90; x < 90; x += 6) { const l = 3 + Math.floor(hash(x * 0.61) * 9); box(g, x, -102, 3, Math.ceil(l / 2), ICICLE[2]); box(g, x + 1, -102 + Math.ceil(l / 2), 1, Math.floor(l / 2), ICICLE[2]); box(g, x, -102, 1, Math.ceil(l / 2), ICICLE[4]); }
  for (const px of [-70, 70]) { for (let k = 0; k < 6; k++) box(g, px - 2 + (k % 2) * 2, -96 + k * 15, 2, 1, ICICLE[4]); box(g, px - 12, -8, 24, 8, SNOW[4]); box(g, px - 9, -10, 16, 3, SNOW[5]); }
};

export const drawHill = (c: Ctx, v: View, state: GameState, hv: Hv, done: boolean, part: 'back' | 'near') => {
  const a = X(DOWNHILL.a), b = X(DOWNHILL.b), eye = v.eye, f = state.frame;
  if (!(b + 200 > v.v0 && a - 200 < v.v1)) return;
  const hl = LAVA.find(l => l.hl > 0);
  const hillRuns = RUNS.filter(r => r[0] >= DOWNHILL.a && r[1] <= DOWNHILL.b);
  if (part === 'near') { hillNear(c, v, hv, f, done, hl, hillRuns); return; }
  const x0 = Math.max(a, Math.floor((eye.x + (v.v0 - 160 - eye.x) / SLOPE_D) / 20) * 20), x1 = Math.min(b, eye.x + (v.v1 + 160 - eye.x) / SLOPE_D);
  // The hillside rising behind the road: snow in bands, lighter up top
  const NB = 5, Sn = SNOW.map(col => mix(col, '#A8B4C8', 0.12));
  for (let i = NB - 1; i >= 0; i--) {
    const d0 = ROAD_D - ((ROAD_D - SLOPE_D) * i) / NB, d1 = ROAD_D - ((ROAD_D - SLOPE_D) * (i + 1)) / NB;
    const col = [Sn[3], Sn[3], Sn[4], Sn[4], Sn[5]][i];
    const pts: [number, number][] = [];
    for (let x = x0; x <= x1 + 20; x += 20) pts.push(at(eye, x, hillTop(R(x), d1), d1));
    for (let x = Math.min(x1 + 20, b); x >= x0; x -= 20) pts.push(at(eye, x, hillTop(R(x), d0), d0));
    poly(c, pts, col);
  }
  // (its top edge against the sky, a darker band of rock showing through under the snow's lip)
  c.strokeStyle = Sn[2]; c.lineWidth = 2; c.beginPath();
  for (let x = x0, k = 0; x <= x1; x += 20, k++) { const [p, q] = at(eye, x, hillTop(R(x), SLOPE_D), SLOPE_D); k ? c.lineTo(p, q) : c.moveTo(p, q); }
  c.stroke();
  for (let x = x0, k = 0; x <= x1; x += 4, k++) { const [p, q] = at(eye, x, hillTop(R(x), SLOPE_D), SLOPE_D); box(c, p, q + 1, 4, 1, Sn[5]); if (k % 2) box(c, p, q + 3, 2, 1, Sn[2]); }
  // (drift ridges, the bands dithered into each other, the wind-scoured crust: snowzone.ts)
  if (!done) hillDetail(c, v, x0, x1, ROAD_D, SLOPE_D, hillTop, Sn);
  // (firs under snow and rocks on it, and what the snow's buried poking out of it, the farthest first)
  const things: { x: number; d: number; kind: number; what?: Buried }[] = [];
  for (let rx = Math.floor(R(x0) / 90) * 90; rx < R(x1); rx += 90) { const hh = hash(rx * 0.013); if (hh < 0.45) continue; things.push({ x: X(rx) + hash(rx) * 50, d: SLOPE_D + 0.02 + hash(rx * 0.7) * 0.11, kind: hh > 0.8 ? 1 : 0 }); }
  for (const [rx, d, what] of BURIED) things.push({ x: X(rx), d, kind: 2, what });
  things.sort((p, q) => p.d - q.d);
  for (const t of things) {
    if (!seen(v, t.x - 80, t.x + 80, t.d)) continue;
    const gy = hillTop(R(t.x), t.d);
    if (t.kind === 0) stillAt(c, v, t.d, `hh-fir-${Math.round(t.x) % 3}`, t.x, gy, -40, -110, 80, 112, g => paintFir(g, 90 + (Math.round(t.x) % 3) * 8, 0));
    else if (t.kind === 1) stillAt(c, v, t.d, 'hh-rock', t.x, gy, -26, -24, 52, 26, g => paintRock(g, 44));
    else { const w = t.what!, [bx, by, bw, bh] = BURIED_BOX[w]; stillAt(c, v, t.d, `hh-buried-${w}`, t.x, gy + 2, bx, by, bw, bh, g => paintBuried(g, w)); }
  }
  // The HAPPYWOOD sign along the ridge (the W and the second O gone down the hill: bare legs)
  const word = 'HAPPYWOOD';
  for (let i = 0; i < word.length; i++) {
    const lx = X(8230 + i * 52), gone = i === 5 || i === 7;
    if (!seen(v, lx - 30, lx + 30, LETTER_D)) continue;
    const gy = hillTop(R(lx), LETTER_D) + 6;
    atDepth(c, eye, LETTER_D, () => { c.save(); c.translate(lx, gy); c.rotate(((i * 7) % 5 - 2) * 0.02); still(c, `hh-letter-${gone ? '_' : word[i]}`, 0, 0, -30, -150, 60, 152, g => paintLetter(g, gone ? null : word[i])); c.restore(); });
  }
  // The lava coming down the hillside into the trench
  if (hl && !done) {
    const la = X(hl.a) + 20, lb = X(hl.b) - 20;
    for (let i = 0; i < 8; i++) {
      const d0 = ROAD_D - ((ROAD_D - SLOPE_D) * i) / 8, d1 = ROAD_D - ((ROAD_D - SLOPE_D) * (i + 1)) / 8, w2 = 1 - i * 0.07;
      const m = (la + lb) / 2, hw2 = ((lb - la) / 2) * w2;
      poly(c, [at(eye, m - hw2, hillTop(R(m), d0), d0), at(eye, m + hw2, hillTop(R(m), d0), d0), at(eye, m + hw2 * 0.9, hillTop(R(m), d1), d1), at(eye, m - hw2 * 0.9, hillTop(R(m), d1), d1)], ((i + Math.floor(f / 6)) % 3) ? LAVA_R[3] : LAVA_R[4]);
    }
  } else if (hl) {
    const la = X(hl.a) + 20, lb = X(hl.b) - 20, m = (la + lb) / 2;
    poly(c, [at(eye, la, hillTop(R(m), ROAD_D), ROAD_D), at(eye, lb, hillTop(R(m), ROAD_D), ROAD_D), at(eye, m + 20, hillTop(R(m), SLOPE_D), SLOPE_D), at(eye, m - 20, hillTop(R(m), SLOPE_D), SLOPE_D)], BASALT[2]);
  }
  // (the snow blowing far back over the hillside: snowzone.ts)
  if (!done) blowFar(c, state);
  // The road down it: packed snow going back, its ruts, ash on it
  for (const [ra, rb, h1, h2] of hillRuns) {
    const xa = X(ra), xb = X(rb), ya = Y(h1), yb = Y(h2);
    if (xb < v.v0 - 200 || xa > v.v1 + 200) continue;
    const cols = [SNOW[4], SNOW[4], SNOW[3], SNOW[3]];
    for (let i = 0; i < 4; i++) { const p = 1 - ((1 - ROAD_D) * i) / 4, q = 1 - ((1 - ROAD_D) * (i + 1)) / 4; poly(c, [at(eye, xa, ya, p), at(eye, xb, yb, p), at(eye, xb, yb, q), at(eye, xa, ya, q)], cols[i]); }
    for (const d of [0.986, 0.966]) { const [p0, q0] = at(eye, xa, ya, d), [p1, q1] = at(eye, xb, yb, d); c.strokeStyle = SNOW[2]; c.lineWidth = 2; c.beginPath(); c.moveTo(p0, q0); c.lineTo(p1, q1); c.stroke(); c.strokeStyle = SNOW[1]; c.lineWidth = 1; c.beginPath(); c.moveTo(p0, q0 + 1); c.lineTo(p1, q1 + 1); c.stroke(); }
    for (let x = Math.ceil(xa / 13) * 13; x < xb; x += 13) { const hh = hash(x * 0.37), d = ROAD_D + 0.004 + hh * 0.04, y = ya + ((yb - ya) * (x - xa)) / (xb - xa); if (hh > 0.55) { const [px, py] = at(eye, x, y, d); box(c, px, py, 3, 1, hh > 0.85 ? ASHY[2] : SNOW[2]); } }
    // (the drifts the wind's sculpted along its far edge)
    farDrifts(c, v, xa, ya, xb, yb, ROAD_D + 0.003);
  }
  // The lava trench across the road
  if (hl) lavaBack(c, v, hl, done, f, ROAD_D, true);
};
const hillNear = (c: Ctx, v: View, hv: Hv, f: number, done: boolean, hl: typeof LAVA[number] | undefined, hillRuns: typeof RUNS) => {
  const eye = v.eye;
  // The bunkers, the signs before them, the snow banked
  COVERS.forEach((cv, k) => {
    bunker(c, v, k, f, done);
    const sx = X(cv.a - 360);
    if (!done && seen(v, sx - 100, sx + 100, SIGN_D)) stillAt(c, v, SIGN_D, 'hh-avsign', sx, Y(groundH(cv.a - 360) ?? 0), -100, -172, 200, 174, paintAvalancheSign);
  });
  const mounds = (ra: number, rb: number, d: number) => {
    for (let x = Math.max(X(ra), v.v0 - 60); x < Math.min(X(rb), v.v1 + 60); x += 40) {
      const gy = roadY(R(x)), [px, py] = at(eye, x, gy, d), hgt = 10 + ((x / 40) % 3) * 3;
      for (const [k, col] of [[1, SNOW[3]], [0.75, SNOW[4]], [0.4, SNOW[5]]] as const) { const hw = 30 * k * d, hh = hgt * k; c.fillStyle = col; c.fillRect(Math.round(px - hw), Math.round(py - hh - (1 - k) * 2), Math.round(hw * 2), Math.round(hh)); }
    }
  };
  for (const [ra, rb] of hv.banks) mounds(ra, rb, 0.965);
  if (done) mounds(8600, DOWNHILL.b + 600, 0.962);
  // The rock face under the road (toward us): strata following it, snow on the ledges, icicles under the lip
  for (const [ra, rb, h1, h2] of hillRuns) {
    const xa = X(ra), xb = X(rb), ya = Y(h1), yb = Y(h2);
    if (xb < v.v0 - 60 || xa > v.v1 + 60) continue;
    poly(c, [[xa, ya], [xb, yb], [xb, v.bot + 40], [xa, v.bot + 40]], ROCK[3]);
    for (let s = 0, k = 0; s < 900; s += 30 + k * 6, k++) {
      const col = [ROCK[4], ROCK[3], ROCK[2], ROCK[3], ROCK[2], ROCK[1]][k % 6];
      poly(c, [[xa, ya + s], [xb, yb + s], [xb, yb + s + 26 + k * 6], [xa, ya + s + 26 + k * 6]], mix(col, '#000000', Math.min(0.6, s / 1400)));
      if (k % 2 === 1) { c.strokeStyle = SNOW[3]; c.lineWidth = 2; c.beginPath(); c.moveTo(xa, ya + s); c.lineTo(xb, yb + s); c.stroke(); }
    }
    // (the snowpack in cross-section over the edge, icicles off it: snowzone.ts; the lit lip over it, frost twinkling
    // just over that)
    snowpack(c, xa, ya, xb, yb, done ? 0 : f);
    slopeLip(c, xa, ya, xb, yb);
    if (!done) glints(c, xa, ya, xb, yb, f);
  }
  // (the lava over the face in a fall, out of the trench's mouth; spent, frozen black)
  if (hl) {
    const la = X(hl.a), lb = X(hl.b), surf = Y(Math.min(hl.hl, hl.hr)) + LAVA_DOWN, top = done ? Y((hl.hl + hl.hr) / 2) : surf - 2;
    if (lb > v.v0 && la < v.v1) {
      // (spent: the crust's front, flush across the trench at its level, lit along its top: he walks on it)
      const fall = done ? surf + 30 : top;
      for (let y = fall; y < v.bot + 20; y += 6) {
        const k = ((y + f * (done ? 0 : 4)) % 36) / 36;
        box(c, la + 4, y, lb - la - 8, 6, done ? (k < 0.5 ? BASALT[2] : BASALT[3]) : k < 0.3 ? LAVA_R[5] : k < 0.7 ? LAVA_R[4] : LAVA_R[3]);
      }
      box(c, la, fall, 4, v.bot - fall + 20, done ? BASALT[1] : LAVA_R[1]); box(c, lb - 4, fall, 4, v.bot - fall + 20, done ? BASALT[1] : LAVA_R[1]);
      if (done) { box(c, la, top, lb - la, surf + 30 - top, BASALT[2]); box(c, la, top + 6, lb - la, 2, BASALT[3]); lip(c, la, top, lb - la); }
      if (!done) for (let k = 0; k < 5; k++) { const t = ((f + k * 17) % 50) / 50; box(c, la + 10 + hash(k) * (lb - la - 20), top + t * 200, 3, 3, LAVA_R[6]); }
    }
  }
  void BRASS; void CONCRETE; void lit; void slab; void dimmed; void checker; void poly; void smokeUp; void ball;
};
