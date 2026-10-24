// The backlot's far off (screen space; the backdrop): the boulevard's own far layers by the hour (blvd/far.ts: the smoggy
// sky banded down into LA's brown, the mountains, the HAPPYWOOD hill with its fallen O on its foothills, the city in the
// haze, the studio lot's sheds and water tower, the palms along the studio's fence and their billboards), each on its own
// ground where the one eye puts it (warehouse/far.ts's way: a layer at depth k lands its ground at the eye's line plus
// k of the way down to the play plane), and nearest, the backlot's own soundstages across the lot from the fronts: big
// corrugated barns under low gables, their numbers painted big in circles, the elephant doors with the red SHOOTING lamp
// over them, the stairs up their sides, the AC units; between them the light towers, the tour's tram parked, the golf
// carts, the PROPS and COMMISSARY sheds; its asphalt going on down to the lot strip behind the fronts. Each layer is
// painted once for the hour into a tile and slid along; each drops as he climbs, by how near it is.
//
// Once the real disasters are on: the sky gone red with ash, the city burning (smoke going up off it in stepped puffs,
// the horizon glowing), the ash coming down.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky, timeOfDay, skyAt, hourMix, type TimeOfDay } from '../../timeOfDay';
import { mist } from '../../adventure/farArt';
import { type Ctx, INK, box, checker, mix, hash, poly, hazeBands, bandedGradient, signText, plain } from '../blvd/kit';
import { FAR, tile, farCol, rampF, paintMountains, paintFoothills, drawHill, paintCity, paintLot, paintPalms } from '../blvd/far';
import { HWX, GY } from '../geometry';
import { steveBoard, boardFrame } from '../posters';
import { realDisastersOn } from '../section';
import { drawHwSky, drawHwHorizon, drawHwLandmarks } from '../landmarks';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
/** The camera's rest (y), the eye's line on screen at rest, and how far the play plane's ground is under it. */
const CAM_REST = GY - 550, EYE = 252, REST = 298;
/** Where a layer's ground lands at depth k (the eye's perspective), at rest. */
const groundAt = (k: number) => EYE + REST * k;

/** The sky once the real disasters are on: gone red with ash, top to horizon. */
const RED_SKY = ['#2A0808', '#4A0E0C', '#74180E', '#A02C10', '#C84A16', '#E07A34'];

// ---------------------------------------------------------------------------------------------------------------
// The backlot's own soundstages, across the lot from the fronts

const SW = 1600, SH = 270, SG = 16;
type T = (c: string) => string;

/** A soundstage, near: a corrugated barn under a low gable (lit up its left slope, its ridge vents), its walls ribbed in
 *  steps (lit down the left, shaded right, grimy at the foot, dithered), its number in a big painted circle with STAGE
 *  over it, the elephant door (ribbed, its man door, the red SHOOTING lamp over it), a stair up its side to a landing
 *  door, AC units and a QUIET PLEASE bell light. Returns its width. */
const stage = (g: Ctx, T: T, tod: TimeOfDay, x: number, f: number, w: number, h: number, n: number, col: string, i: number) => {
  const R = rampF(T, col), lamps = tod.lamps > 0.3;
  // (the roof)
  poly(g, [[x - 6, f - h + 1], [x + w / 2, f - h - 26], [x + w + 6, f - h + 1]], INK);
  poly(g, [[x - 4, f - h], [x + w / 2, f - h - 24], [x + w / 2, f - h]], R[3]);
  poly(g, [[x + w / 2, f - h - 24], [x + w + 4, f - h], [x + w / 2, f - h]], R[1]);
  for (let k = 0; k < w / 2; k += 6) { const y0 = f - h - 24 + (k / (w / 2)) * 24; box(g, x + w / 2 - k - 1, y0 + 1, 1, f - h - y0, R[2]); box(g, x + w / 2 + k, y0 + 1, 1, f - h - y0, R[0]); }
  box(g, x - 4, f - h - 1, w + 8, 2, R[4]);
  for (let k = 0; k < 5; k++) { const vx = x + w * 0.16 + k * w * 0.16, vy = f - h - 8 - Math.min(k, 4 - k) * 7; box(g, vx - 1, vy - 1, 12, 8, INK); box(g, vx, vy, 10, 6, R[1]); box(g, vx, vy, 10, 1, R[3]); box(g, vx + 2, vy + 2, 6, 1, R[0]); }
  // (the AC units on the roof, their fans)
  for (const ax of [x + w * 0.66, x + w * 0.8]) { const ay = f - h - 24 + ((ax - x - w / 2) / (w / 2)) * 24 - 10; box(g, ax - 1, ay - 1, 22, 14, INK); box(g, ax, ay, 20, 12, T('#A8ACB0')); box(g, ax, ay, 20, 2, T('#D0D4D8')); box(g, ax + 15, ay, 5, 12, T('#787C80')); for (let k = 0; k < 4; k++) box(g, ax + 3, ay + 3 + k * 2, 10, 1, T('#5A5E62')); }
  // (the walls: ribs, banded)
  box(g, x - 1, f - h, w + 2, h, INK);
  box(g, x, f - h, w, h, R[2]);
  for (let rx = x + 2; rx < x + w - 1; rx += 5) { box(g, rx, f - h, 2, h, R[1]); box(g, rx + 2, f - h, 1, h, R[3]); }
  box(g, x, f - h, 6, h, R[3]); checker(g, x + 6, f - h, 4, h, R[3], 0, 2); box(g, x, f - h, 2, h, R[4]);
  box(g, x + w - 8, f - h, 8, h, R[1]); checker(g, x + w - 12, f - h, 4, h, R[1], 0, 2); box(g, x + w - 2, f - h, 2, h, R[0]);
  box(g, x, f - h, w, 2, R[4]); box(g, x, f - h + 2, w, 2, R[0]);
  box(g, x, f - 12, w, 12, R[1]); checker(g, x, f - 18, w, 6, R[1], 1, 2); box(g, x, f - 4, w, 4, R[0]);
  // (STAGE over its number, painted big in a circle)
  const cx = x + w * 0.26, cy = f - h + 44;
  g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, 24, 0, Math.PI * 2); g.fill();
  g.fillStyle = T('#F4EEE2'); g.beginPath(); g.arc(cx, cy, 23, 0, Math.PI * 2); g.fill();
  g.fillStyle = T('#D8D0C2'); g.beginPath(); g.arc(cx + 3, cy + 3, 19, 0, Math.PI * 2); g.fill();
  g.fillStyle = T('#F4EEE2'); g.beginPath(); g.arc(cx - 1, cy - 1, 18, 0, Math.PI * 2); g.fill();
  signText(g, String(n), cx, cy + 9, plain(3, 3, T('#2A2228')));
  signText(g, 'STAGE', cx, cy - 28, plain(1, 1, T('#F4EEE2'), T('#2A2228')));
  // (high windows, lit after dark)
  for (let k = 0; k < 4; k++) { const wx = x + w * 0.46 + k * 16; box(g, wx - 1, f - h + 9, 10, 8, INK); box(g, wx, f - h + 10, 8, 6, lamps && hash(i * 5 + k) > 0.35 ? '#FFD88A' : T('#3A4258')); box(g, wx, f - h + 10, 8, 1, T('#7A8AA0')); }
  // (the elephant door: tall, ribbed across, its frame, a man door cut in it; the lamp over it)
  const dw = Math.min(90, w * 0.34), dx = x + w * 0.5, dh = Math.min(h - 30, 120);
  box(g, dx - 3, f - dh - 3, dw + 6, dh + 3, INK); box(g, dx - 2, f - dh - 2, dw + 4, dh + 2, R[3]);
  box(g, dx, f - dh, dw, dh, R[1]);
  for (let y = f - dh + 3; y < f; y += 5) { box(g, dx, y, dw, 1, R[0]); box(g, dx, y + 1, dw, 1, R[2]); }
  box(g, dx + dw - 20, f - 32, 14, 32, INK); box(g, dx + dw - 19, f - 31, 12, 31, R[2]); box(g, dx + dw - 10, f - 17, 2, 2, T('#C8A040'));
  const shoot = hash(i * 9.9) > 0.45;
  box(g, dx + dw / 2 - 8, f - dh - 14, 16, 9, INK); box(g, dx + dw / 2 - 7, f - dh - 13, 14, 7, shoot ? '#E84A4A' : T('#6A2A2A')); box(g, dx + dw / 2 - 7, f - dh - 13, 14, 2, shoot ? '#FF9A8A' : T('#8A4A4A'));
  signText(g, 'SHOOTING', dx + dw / 2, f - dh - 17, plain(1, 1, T('#E8E0D0'), T('#2A2228')));
  // (a QUIET PLEASE sign by the man door)
  box(g, dx - 50, f - 52, 40, 18, INK); box(g, dx - 49, f - 51, 38, 16, T('#B4243A')); box(g, dx - 49, f - 51, 38, 2, T('#D85060'));
  signText(g, 'QUIET', dx - 30, f - 42, plain(1, 1, T('#F4EEE2'))); signText(g, 'PLEASE', dx - 30, f - 36, plain(1, 1, T('#F4EEE2')));
  // (the stair up its far end: flights zigzagging, landings, a door up top)
  const sx = x + w - 34;
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath();
  for (let k = 0; k < 3; k++) { const y0 = f - k * 34; g.moveTo(sx + (k % 2 ? 22 : 0), y0); g.lineTo(sx + (k % 2 ? 0 : 22), y0 - 34); }
  g.stroke();
  g.strokeStyle = T('#5A5E68'); g.lineWidth = 1; g.beginPath();
  for (let k = 0; k < 3; k++) { const y0 = f - k * 34; g.moveTo(sx + (k % 2 ? 22 : 0), y0 - 1); g.lineTo(sx + (k % 2 ? 0 : 22), y0 - 35); }
  g.stroke();
  for (let k = 1; k < 4; k++) { box(g, sx - 3, f - k * 34 - 1, 28, 3, INK); box(g, sx - 2, f - k * 34, 26, 1, T('#8A8E98')); }
  box(g, sx + 4, f - 3 * 34 - 22, 12, 21, INK); box(g, sx + 5, f - 3 * 34 - 21, 10, 20, R[0]);
  if (lamps) box(g, sx + 8, f - 3 * 34 - 28, 4, 3, '#FFE8A8');
  return w;
};
/** A wheel: its tire inked, the hub lit up its upper left; `r` its radius, middle at (x, y). */
const wheel = (g: Ctx, T: T, x: number, y: number, r: number) => {
  g.fillStyle = INK; g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fill();
  g.fillStyle = T('#26262C'); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  const hr = Math.max(1.5, r * 0.5);
  g.fillStyle = T('#8A8E96'); g.beginPath(); g.arc(x, y, hr, 0, Math.PI * 2); g.fill();
  box(g, x - hr + 1, y - hr + 1, Math.max(1, hr * 0.6), Math.max(1, hr * 0.6), T('#D2D6DC')); box(g, x - 1, y - 1, 2, 2, T('#4A4E56'));
};
/** A light tower: its trailer (the outriggers down on their pads, the engine box louvered, hazard stripes), the mast in
 *  lattice (two chords, the zigzag), its bank of lamps up top in their rims (lit after dark), the cable down it. */
const lightTower = (g: Ctx, T: T, tod: TimeOfDay, x: number, f: number, h: number) => {
  const Y = rampF(T, '#C8A020'), S = rampF(T, '#6A6E78');
  for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(x, f - 8); g.lineTo(x + s * 26, f - 2); g.stroke(); box(g, x + s * 26 - 3, f - 2, 7, 2, T('#3A3438')); }
  box(g, x - 16, f - 14, 34, 11, INK); box(g, x - 15, f - 13, 32, 9, Y[2]); box(g, x - 15, f - 13, 32, 1, Y[4]); box(g, x - 15, f - 5, 32, 1, Y[1]);
  for (let k = 0; k < 4; k++) box(g, x + 4 + k * 3, f - 11, 1, 5, Y[0]);
  g.save(); g.beginPath(); g.rect(x - 14, f - 9, 14, 3); g.clip(); for (let k = 0; k < 5; k++) poly(g, [[x - 16 + k * 4, f - 9], [x - 14 + k * 4, f - 9], [x - 16 + k * 4, f - 6], [x - 18 + k * 4, f - 6]], INK); g.restore();
  wheel(g, T, x - 8, f - 3, 3); wheel(g, T, x + 10, f - 3, 3);
  // (the mast)
  box(g, x - 3, f - h, 1, h - 14, INK); box(g, x + 3, f - h, 1, h - 14, INK); box(g, x - 2, f - h, 1, h - 14, S[4]); box(g, x + 2, f - h, 1, h - 14, S[2]);
  g.strokeStyle = S[3]; g.lineWidth = 1; g.beginPath(); for (let y = f - h + 2; y < f - 16; y += 6) { g.moveTo(x - 1, y); g.lineTo(x + 2, y + 6); } g.stroke();
  box(g, x + 4, f - h + 10, 1, h - 24, T('#2A2A30'));
  // (the lamp bank: its frame, eight heads in their rims)
  box(g, x - 14, f - h - 16, 30, 16, INK); box(g, x - 13, f - h - 15, 28, 1, S[3]);
  for (let k = 0; k < 4; k++) for (let r = 0; r < 2; r++) {
    const lx = x - 13 + k * 7, ly = f - h - 14 + r * 7;
    box(g, lx, ly, 6, 6, S[1]); box(g, lx + 1, ly + 1, 4, 4, tod.lamps > 0.3 ? '#FFF2C8' : T(r ? '#A8A898' : '#C8C8B8')); box(g, lx + 1, ly + 1, 2, 1, tod.lamps > 0.3 ? '#FFFFFF' : T('#ECECE0'));
  }
  box(g, x - 15, f - h - 1, 32, 1, S[1]);
};
/** The studio tour's tram, parked: the tug (its windshield, the roof on its posts, the headlight, the bumper) and two open
 *  cars under striped canopies (lit along their tops, the valances' hems), the bench seats' backs in rows (blue vinyl),
 *  the couplings, the wheels; HAPPYWOOD TOURS down its side. */
const tram = (g: Ctx, T: T, x: number, f: number) => {
  const C = rampF(T, '#E8E2D4'), Sr = rampF(T, '#B4243A'), S = rampF(T, '#6A6E78'), Se = rampF(T, '#3A6AB8');
  // (the tug)
  box(g, x - 1, f - 31, 42, 23, INK); box(g, x, f - 30, 40, 21, C[2]); box(g, x, f - 30, 40, 2, C[4]); box(g, x, f - 28, 40, 1, C[3]); box(g, x, f - 30, 2, 21, C[3]); box(g, x + 37, f - 30, 3, 21, C[1]);
  box(g, x, f - 15, 40, 3, Sr[2]); box(g, x, f - 15, 40, 1, Sr[3]);
  box(g, x + 4, f - 27, 16, 10, INK); box(g, x + 5, f - 26, 14, 8, T('#4A6888')); box(g, x + 5, f - 26, 14, 3, T('#A8C0D0')); box(g, x + 15, f - 25, 1, 5, T('#D8E8F0'));
  box(g, x + 4, f - 44, 2, 14, S[2]); box(g, x + 30, f - 44, 2, 14, S[2]); box(g, x + 1, f - 47, 36, 4, INK); box(g, x + 2, f - 46, 34, 2, C[3]);
  box(g, x - 2, f - 21, 3, 3, T('#FFF2C0')); box(g, x - 3, f - 11, 8, 3, INK); box(g, x - 2, f - 10, 6, 1, S[4]);
  // (the cars)
  for (let k = 0; k < 2; k++) {
    const cx = x + 48 + k * 76;
    box(g, cx - 7, f - 13, 8, 2, INK);
    box(g, cx - 1, f - 21, 72, 13, INK); box(g, cx, f - 20, 70, 11, C[2]); box(g, cx, f - 20, 70, 2, C[4]); box(g, cx, f - 13, 70, 3, Sr[2]); box(g, cx, f - 13, 70, 1, Sr[3]);
    for (let s = 0; s < 4; s++) { box(g, cx + 3 + s * 17, f - 30, 14, 10, INK); box(g, cx + 4 + s * 17, f - 29, 12, 9, Se[2]); box(g, cx + 4 + s * 17, f - 29, 12, 1, Se[4]); box(g, cx + 4 + s * 17, f - 29, 1, 9, Se[3]); box(g, cx + 4 + s * 17, f - 25, 12, 1, Se[1]); }
    for (const px of [cx + 2, cx + 66]) { box(g, px - 1, f - 44, 4, 24, INK); box(g, px, f - 44, 2, 24, S[3]); box(g, px, f - 44, 1, 24, S[4]); }
    box(g, cx - 3, f - 50, 76, 7, INK);
    for (let s = 0; s < 74; s += 6) { const red = (s / 6) % 2 === 0, sw = Math.min(6, 74 - s); box(g, cx - 2 + s, f - 49, sw, 5, red ? Sr[3] : C[3]); box(g, cx - 2 + s, f - 49, sw, 1, red ? Sr[4] : C[4]); box(g, cx - 2 + s, f - 45, sw, 1, red ? Sr[1] : C[1]); }
    for (const wx of [cx + 10, cx + 58]) wheel(g, T, wx, f - 4, 4);
  }
  for (const wx of [x + 9, x + 31]) wheel(g, T, wx, f - 4, 4);
  signText(g, 'HAPPYWOOD TOURS', x + 124, f - 13, plain(1, 1, T('#F4EEE2'), Sr[0]));
};
/** A golf cart parked (the backlot security's): its body lit up top, the seat, the steering wheel, the windshield, the
 *  canopy on its posts, SECURITY down its side, the light bar on the roof, the wheels. */
const cart = (g: Ctx, T: T, x: number, f: number) => {
  const C = rampF(T, '#F0EEE8'), S = rampF(T, '#6A6E78'), B = rampF(T, '#1E3A8A');
  box(g, x - 1, f - 19, 38, 12, INK); box(g, x, f - 18, 36, 10, C[2]); box(g, x, f - 18, 36, 2, C[4]); box(g, x, f - 18, 2, 10, C[3]); box(g, x + 34, f - 18, 2, 10, C[1]);
  box(g, x, f - 10, 36, 2, B[2]); box(g, x, f - 10, 36, 1, B[3]);
  box(g, x + 10, f - 26, 14, 8, INK); box(g, x + 11, f - 25, 12, 6, T('#2A2A30')); box(g, x + 11, f - 25, 12, 1, T('#4A4A54'));
  box(g, x + 27, f - 26, 2, 8, INK); box(g, x + 25, f - 27, 6, 2, INK);
  for (const px of [x + 2, x + 32]) { box(g, px - 1, f - 38, 4, 20, INK); box(g, px, f - 38, 2, 20, S[3]); box(g, px, f - 38, 1, 20, S[4]); }
  box(g, x + 31, f - 37, 2, 14, T('#9AB8D0'));
  box(g, x - 2, f - 41, 40, 4, INK); box(g, x - 1, f - 40, 38, 2, C[3]); box(g, x - 1, f - 40, 38, 1, C[4]);
  box(g, x + 14, f - 45, 10, 4, INK); box(g, x + 15, f - 44, 4, 2, T('#B4243A')); box(g, x + 19, f - 44, 4, 2, T('#3A6AF8'));
  signText(g, 'SECURITY', x + 18, f - 11, plain(1, 1, B[1]));
  for (const wx of [x + 7, x + 29]) wheel(g, T, wx, f - 4, 4);
};
/** A shed (PROPS, COMMISSARY): a stucco box under a tile edge, a roll-up door, its name on a board. */
const shed = (g: Ctx, T: T, tod: TimeOfDay, x: number, f: number, w: number, h: number, name: string, col: string) => {
  const R = rampF(T, col), Rr = rampF(T, '#B8603E');
  box(g, x - 1, f - h - 1, w + 2, h + 1, INK);
  box(g, x, f - h, w, h, R[2]); box(g, x, f - h, 4, h, R[3]); box(g, x + w - 5, f - h, 5, h, R[1]); checker(g, x, f - 10, w, 6, R[1], 1, 2);
  for (let i = 0; i < w * h / 70; i++) box(g, x + hash(i * 1.7 + x) * w, f - h + hash(i * 2.3 + x) * h, 1, 1, i % 2 ? R[1] : R[3]);
  box(g, x - 4, f - h - 6, w + 8, 7, INK); for (let k = x - 3; k < x + w + 3; k += 4) { box(g, k, f - h - 5, 3, 5, Rr[2]); box(g, k, f - h - 5, 3, 1, Rr[3]); }
  const dw = Math.min(60, w * 0.4), dx = x + w * 0.12;
  box(g, dx - 1, f - 50, dw + 2, 50, INK); box(g, dx, f - 49, dw, 49, R[1]); for (let y = f - 47; y < f; y += 4) box(g, dx, y, dw, 1, R[0]);
  for (let k = 0; k < 3; k++) { const wx = x + w * 0.6 + k * 16; if (wx + 10 > x + w - 6) break; box(g, wx - 1, f - h + 14, 12, 12, INK); box(g, wx, f - h + 15, 10, 10, tod.lamps > 0.3 ? '#FFD88A' : T('#3A4258')); box(g, wx, f - h + 15, 10, 2, T('#7A8AA0')); }
  const bw = name.length * 6 + 12;
  box(g, x + w / 2 - bw / 2 - 1, f - h - 22, bw + 2, 14, INK); box(g, x + w / 2 - bw / 2, f - h - 21, bw, 12, T('#1C1014'));
  signText(g, name, x + w / 2, f - h - 12, plain(1, 1, T('#E8C25A')));
  for (const px of [x + w / 2 - bw / 2 + 6, x + w / 2 + bw / 2 - 8]) box(g, px, f - h - 8, 2, 3, T('#3A3438'));
};

const paintStages = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.1), f = SH - SG;
  const cols = ['#C8BCA8', '#B8B0A4', '#D2C4AA', '#BEB4A0'];
  // (back to front along it: stages and the sheds and the parked things between them)
  let x = 10, i = 0;
  const NUMS = [11, 12, 15, 16, 19, 21];
  const after: ((x: number) => number)[] = [
    (x) => { lightTower(g, T, tod, x + 16, f, 150); return 40; },
    (x) => { shed(g, T, tod, x, f, 130, 70, 'PROPS', '#D8C8A8'); return 136; },
    (x) => { tram(g, T, x, f); return 210; },
    (x) => { cart(g, T, x, f); cart(g, T, x + 44, f); lightTower(g, T, tod, x + 104, f, 140); return 130; },
    (x) => { shed(g, T, tod, x, f, 150, 80, 'COMMISSARY', '#E2D2B4'); return 156; },
    (x) => { lightTower(g, T, tod, x + 16, f, 160); return 40; },
  ];
  while (x < SW - 300 && i < NUMS.length) {
    const w = 270 + Math.round(hash(i * 2.2) * 60), h = 170 + Math.round(hash(i * 3.3) * 40);
    x += stage(g, T, tod, x, f, w, h, NUMS[i], cols[i % cols.length], i) + 14;
    if (x < SW - 120) x += after[i % after.length](x) + 14;
    i++;
  }
  // (Steve's billboard on the end of one: he's everywhere (posters.ts; LIVE! down its right, where the havoc tears it))
  boardFrame(g, T, 561, f - 181, 58, 38, 5);
  steveBoard(g, T, 561, f - 181, 58, 38, [['STEVE', 1, '#2A1408']], { him: true, band: 'LIVE!', seed: 5 });
  // (its asphalt: banded, the parking lines, a fire lane's red curb along the front)
  box(g, 0, f, SW, SG, T('#5E585A')); box(g, 0, f, SW, 1, T('#7E787A')); checker(g, 0, f + 6, SW, 2, T('#4E4A4C'));
  for (let k = 0; k < SW; k += 40) box(g, k, f + 3, 14, 1, T('#9A948A'));
  box(g, 0, f + SG - 3, SW, 3, T('#8A3A34')); box(g, 0, f + SG - 3, SW, 1, T('#B85A50'));
  mist(g, SW, 0, f, skyAt(0.9, tod), 0.22, 0.04, 5);
};

/** Where paintStages put each soundstage (tile x, width, height; its eaves at SH - SG - h, its ridge 24 over them):
 *  the havoc sets their roofs burning. The same steps as paintStages' loop. */
export const stageRoofs = () => {
  const out: { x: number; w: number; h: number; i: number }[] = [];
  const AFTER = [40, 136, 210, 130, 156, 40];
  let x = 10, i = 0;
  while (x < SW - 300 && i < 6) {
    const w = 270 + Math.round(hash(i * 2.2) * 60), h = 170 + Math.round(hash(i * 3.3) * 40);
    out.push({ x, w, h, i });
    x += w + 14;
    if (x < SW - 120) x += AFTER[i % AFTER.length] + 14;
    i++;
  }
  return out;
};
export const STAGES = { SW, SH, SG } as const;

/** The lot's road across from the soundstages (a tile, painted once for the hour, slid with the stages): the curb
 *  along the stages' feet (its fire-lane red, lit along its top), the asphalt in bands darker nearer (dithered where
 *  they meet), the tram lane's dashes, a crosswalk, manholes, oil stains, tar-sealed cracks, tire marks. */
const RW = 1200, RH = 150;
const paintRoad = (g: Ctx, tod: TimeOfDay, scorched: boolean) => {
  const T = farCol(tod, 0.05), A = ['#625C62', '#58525A', '#4E4850', '#454048', '#3C383E'].map(T);
  const bandH = [10, 18, 28, 40, 54];
  for (let i = 0, y = 8; i < A.length; y += bandH[i], i++) { box(g, 0, y, RW, (bandH[i] ?? 60) + 60, A[i]); if (i) checker(g, 0, y - 2, RW, 2, A[i], 0, 2); }
  // (the curb: concrete, lit along its top; its fire-lane red face)
  box(g, 0, 0, RW, 4, T('#A8A29A')); box(g, 0, 0, RW, 1, T('#D8D2C8')); box(g, 0, 4, RW, 4, T('#9A2A20')); box(g, 0, 7, RW, 1, T('#5A1810'));
  for (let x = 0; x < RW; x += 48) box(g, x, 0, 1, 8, T('#6A645E'));
  // (the asphalt's grain: a fine stipple, lighter flecks, darker pits)
  for (let i = 0; i < 900; i++) { const x = hash(i * 1.37) * RW, y = 10 + hash(i * 2.71) * (RH - 12); box(g, x, y, 1 + (i % 3 === 0 ? 1 : 0), 1, i % 2 ? T('#787278') : T('#2E2A30')); }
  // (the tram lane's dashes, squashed going back: wider nearer)
  for (let x = 20; x < RW; x += 90) { box(g, x, 30, 34, 2, T('#C8A43A')); box(g, x + 4, 68, 46, 3, T('#D8B440')); }
  // (a crosswalk, white bars foreshortened)
  for (let k = 0; k < 7; k++) { const y0 = 12 + k * k * 2.6, hh = 2 + k; box(g, 520, y0, 120 + k * 6, hh, T('#C8C4BC')); box(g, 520, y0 + hh - 1, 120 + k * 6, 1, T('#8A867E')); }
  // (manholes and drain grates, squashed ellipses)
  for (const [mx, my, r] of [[230, 46, 12], [880, 84, 16], [1110, 36, 10]] as const) {
    g.fillStyle = T('#26222A'); g.beginPath(); g.ellipse(mx, my, r + 2, (r + 2) * 0.32, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = T('#5A545C'); g.beginPath(); g.ellipse(mx, my, r, r * 0.3, 0, 0, Math.PI * 2); g.fill();
    for (let k = -2; k <= 2; k++) box(g, mx + k * r * 0.35 - 1, my - 1, 2, 1, T('#2E2A30'));
    box(g, mx - r * 0.5, my - r * 0.25, r * 0.6, 1, T('#7A747C'));
  }
  // (oil stains: dark blots in steps; tire marks curving; tar seams over the cracks)
  for (let k = 0; k < 7; k++) { const ox = 60 + hash(k * 9.3) * (RW - 120), oy = 40 + hash(k * 4.1) * 90; g.fillStyle = T('#34303A'); g.beginPath(); g.ellipse(ox, oy, 18 + k % 3 * 6, 4 + (oy - 40) * 0.04, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = T('#2A262E'); g.beginPath(); g.ellipse(ox + 2, oy, 8, 2, 0, 0, Math.PI * 2); g.fill(); }
  for (let k = 0; k < 3; k++) { const x0 = 100 + k * 380; for (let s = 0; s < 140; s += 2) { const yy = 50 + k * 18 + Math.sin(s * 0.03 + k) * 10; box(g, x0 + s, yy, 2, 1, T('#3A363E')); box(g, x0 + s + 8, yy + 6, 2, 1, T('#3A363E')); } }
  for (let k = 0; k < 6; k++) { let x = 40 + hash(k * 3.9) * (RW - 80), y = 14 + hash(k * 5.1) * 60; for (let s = 0; s < 30; s++) { box(g, x, y, 2, 1, T('#24202A')); x += 2; y += (hash(k * 11 + s) - 0.45) * 3; } }
  // (scorched: soot blown across it, the odd burning bit of debris left dark)
  if (scorched) for (let k = 0; k < 10; k++) { const sx = hash(k * 7.7) * RW, sy = 20 + hash(k * 2.3) * 100; g.fillStyle = 'rgba(20, 12, 10, 0.35)'; g.beginPath(); g.ellipse(sx, sy, 40, 6, 0, 0, Math.PI * 2); g.fill(); box(g, sx - 6, sy - 2, 10, 3, T('#2A1E1A')); }
};
/** The lot's road under the soundstages' feet, then the rest of the far ground banded down as before. */
export const roadUnder = (c: Ctx, tod: TimeOfDay, off: number, y: number, scorched = false) => {
  if (y >= H) return;
  tile(c, `hl-road-${tod.key}-${scorched ? 1 : 0}`, off, Math.round(y), RH, RW, g => paintRoad(g, tod, scorched));
  const T2 = farCol(tod, 0.05), y2 = Math.round(y) + RH;
  if (y2 < H) bandedGradient(c, 0, y2, W, H - y2, [T2('#3C383E'), T2('#34303A')], 2);
};
export { paintStages, smoke };

// ---------------------------------------------------------------------------------------------------------------

/** How far each layer sits back (its slide across, and how far it drops as he climbs: the nearer, the more). */
const K = { mtn: 0.003, hill: 0.004, foot: 0.008, city: 0.022, lot: 0.055, palms: 0.11, stages: 0.3 } as const;

/** Smoke going up off the burning city (the real disasters): stepped puffs, rising, spreading, thinning. */
const smoke = (c: Ctx, x: number, base: number, f: number, seed: number) => {
  for (let k = 0; k < 9; k++) {
    const t = ((f * 0.4 + k * 22 + seed * 13) % 200) / 200, y = base - t * 210, r = 6 + t * 26, sx = x + Math.sin(t * 5 + seed) * 8 + t * 40;
    const a = 0.55 * (1 - t);
    c.fillStyle = `rgba(40, 24, 22, ${a.toFixed(2)})`; c.fillRect(Math.round(sx - r), Math.round(y - r * 0.6), Math.round(r * 2), Math.round(r * 1.2));
    c.fillStyle = `rgba(90, 52, 40, ${(a * 0.7).toFixed(2)})`; c.fillRect(Math.round(sx - r * 0.6), Math.round(y - r * 0.6), Math.round(r * 1.1), Math.round(r * 0.5));
  }
  c.fillStyle = 'rgba(255, 140, 40, 0.5)'; c.fillRect(Math.round(x - 8), Math.round(base - 4), 16, 4);
  c.fillStyle = 'rgba(255, 220, 120, 0.6)'; c.fillRect(Math.round(x - 3), Math.round(base - 6), 6, 3);
};

export const drawLotFar = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), cam = state.camera.x, f = state.frame, real = realDisastersOn(state);
  const up = CAM_REST - state.camera.y;
  const drop = (k: number) => Math.round(up * k);
  const hz = EYE - 8 + Math.round(up * 0.002);
  drawTodSky(c, 0, 0, W, H, real ? RED_SKY : FAR.SKY, { bands: 16, horizon: hz + 20, sun: [620, 90], moon: [160, 70], t: f, scroll: cam * 0.02 });
  hazeBands(c, 0, Math.round(hz - 150), W, 160, real ? '#C84A16' : hourMix('#B89A72', '#C88A62', '#2E2C44', tod), 0, 0.3, 7);
  const under = (y: number, k: number, base: string) => {
    if (y >= H) return;
    const T2 = farCol(tod, k);
    bandedGradient(c, 0, Math.round(y), W, H - Math.round(y), [T2(base), T2(mix(base, '#3A3236', 0.18)), T2(mix(base, '#3A3236', 0.32))], 4);
  };
  drawHwSky(c, state, hz, real ? 'real' : 'calm');
  tile(c, `hb-mtn-${tod.key}`, cam * K.mtn + 300, groundAt(K.mtn) - FAR.MH + 10 + drop(K.mtn), FAR.MH, FAR.TW, g => paintMountains(g, tod));
  drawHwHorizon(c, state, groundAt(0.0035) + 4 + drop(0.0035));
  drawHill(c, 560 - (cam - HWX) * K.hill, groundAt(K.hill) + 6 + drop(K.hill), f);
  tile(c, `hb-foot-${tod.key}`, cam * K.foot + 140, groundAt(K.foot) - FAR.FH + 26 + drop(K.foot), FAR.FH, FAR.TW, g => paintFoothills(g, tod));
  under(groundAt(K.foot) + 26 + drop(K.foot), 0.34, '#8A8A6A');
  const cityY = groundAt(K.city) - (FAR.CH - FAR.CG) + drop(K.city);
  tile(c, `hb-city-${tod.key}`, cam * K.city + 520, cityY, FAR.CH, FAR.TW, g => paintCity(g, tod));
  under(groundAt(K.city) + FAR.CG + drop(K.city), 0.42, '#8A8070');
  if (real) for (let k = 0; k < 5; k++) { const sx = ((k * 211 + 90 - cam * K.city) % 900 + 900) % 900 - 50; smoke(c, sx, groundAt(K.city) + drop(K.city), f, k); }
  // (the land's other attractions over the soundstages' roofs: Thrones of the Stars behind, the Stuntery ahead)
  drawHwLandmarks(c, state, groundAt(0.03) + drop(0.03));
  tile(c, `hb-lot-${tod.key}`, cam * K.lot + 1000, groundAt(K.lot) - (FAR.SH - FAR.SG) + drop(K.lot), FAR.SH, FAR.LW, g => paintLot(g, tod));
  under(groundAt(K.lot) + FAR.SG + drop(K.lot), 0.2, '#6A6466');
  tile(c, `hb-palms-${tod.key}`, cam * K.palms + 900, groundAt(K.palms) - (FAR.PH - FAR.PG) + drop(K.palms), FAR.PH, FAR.PW, g => paintPalms(g, tod));
  under(groundAt(K.palms) + FAR.PG + drop(K.palms), 0.12, '#6E6668');
  tile(c, `hl-stages-${tod.key}`, cam * K.stages + 300, groundAt(K.stages) - (SH - SG) + drop(K.stages), SH, SW, g => paintStages(g, tod));
  roadUnder(c, tod, cam * K.stages + 300, groundAt(K.stages) + SG + drop(K.stages));
  if (real) {
    // (the weather: the whole far off reddened, in bands, heavier up top)
    hazeBands(c, 0, 0, W, Math.round(groundAt(K.stages)), '#7F1D1D', 0.3, 0.1, 6);
    // (ash coming down: stepped flakes, drifting)
    for (let k = 0; k < 46; k++) {
      const ax = ((k * 97 + f * (0.6 + (k % 3) * 0.4) + Math.sin(f * 0.02 + k) * 20) % 820 + 820) % 820 - 10, ay = ((k * 151 + f * (0.9 + (k % 4) * 0.2)) % 620) - 10;
      box(c, ax, ay, 2, 2, k % 3 ? '#B8B0A8' : '#E8E2DA');
      if (k % 5 === 0) box(c, ax + 2, ay + 1, 1, 1, '#8A827C');
    }
  }
  void INK;
};
