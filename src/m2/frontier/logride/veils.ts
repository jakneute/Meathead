// What's shut away from the view, put back over it (the playtest's: no insides seen through walls, nothing showing
// where it shouldn't): drawn in front of everything but the splashes, each faded by where he is (no pop).
//
//   the station: its outside (a log lodge: stacked logs with their ringed ends at the corners, the shingled eave, the
//     dark portal the flume runs out of) over its insides (the queue, the booth, Tucker's body) once he's out on the
//     ride; gone again the moment he's back in it
//   the Old Sawmill's shed: its outside (weathered boards on girts, a shingled roof, THE OLD SAWMILL painted big, the
//     dark doors the flume runs through) over its insides (the drops, the wheel, the belts) till the log's in it
//   the sewer: the earth over the tunnel (its bricks, its sludge, its pipes and outfalls, the rats) till the view's gone
//     down the chasm after him; the chasm's own column left open (he falls through it)

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { signText } from '../../signLetters';
import { GY } from '../geometry';
import { onScreen } from '../kit';
import { type Ctx, box, checker, mix, hash, stillAt, INK, hr, asIs, BARK, RINGS, PLANK } from './paint';
import { X, x0, waterY, CHASM } from './layout';
import { rideOf } from './state';
import { earthPatch, SLAM_AT } from './parkArt';

/** Where he is along the ride (the log's place riding, his own on foot). */
const hereRx = (state: GameState) => {
  const L = rideOf(state).log;
  return L.mode === 'ride' || L.mode === 'scene' || L.mode === 'chipper' ? L.rx : state.player.pos.x + state.player.width / 2 - x0;
};
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// ---------------------------------------------------------------------------------------------------------------
// The station's outside

const ST_A = -300, ST_B = 905, ST_TOP = GY - 302;
const paintLodge = (g: Ctx, i: number, w: number) => {
  const B = hr('bark', BARK), Rg = hr('rings', RINGS), h = GY + 40 - ST_TOP;
  box(g, 0, 0, w, h, INK);
  for (let y = 26, r = 0; y < h; y += 18, r++) {
    box(g, 0, y, w, 18, B[3]); box(g, 0, y, w, 4, B[5]); box(g, 0, y + 4, w, 3, B[4]); box(g, 0, y + 13, w, 3, B[2]); box(g, 0, y + 16, w, 2, mix('#D8C8A0', B[2], 0.5));
    for (let x = (r * 37 + i * 11) % 60; x < w; x += 60) box(g, x, y + 7, 14, 1, B[1]);
  }
  // (the eave: shingles in two rows, lit along their feet)
  for (let r = 0; r < 3; r++) for (let x = (r % 2) * 6 - 6; x < w; x += 12) { box(g, x, r * 8, 11, 8, INK); box(g, x + 1, r * 8, 9, 7, hr('bark', BARK)[2 + ((x / 12 + r) & 1)]); box(g, x + 1, r * 8 + 6, 9, 1, B[5]); }
  void Rg;
};

const drawStationVeil = (c: Ctx, state: GameState, k: number) => {
  if (k <= 0 || !onScreen(state, X(ST_A), X(ST_B))) return;
  c.globalAlpha = k;
  for (let x = X(ST_A), i = 0; x < X(ST_B); x += 300, i++) { const w = Math.min(300, X(ST_B) - x); if (onScreen(state, x, x + w)) stillAt(c, `lr-lodge-${i}-${w}`, x, ST_TOP, 0, 0, w, GY + 40 - ST_TOP, g => paintLodge(g, i, w)); }
  // (the corner's log ends, ringed; the portal the flume comes out of, dark, its timber frame)
  const Rg = hr('rings', RINGS), B = hr('bark', BARK);
  for (let y = ST_TOP + 26; y < GY + 40; y += 18) { c.fillStyle = INK; c.beginPath(); c.arc(X(ST_B) - 2, y + 9, 10, 0, Math.PI * 2); c.fill(); c.fillStyle = Rg[3]; c.beginPath(); c.arc(X(ST_B) - 2, y + 9, 9, 0, Math.PI * 2); c.fill(); c.strokeStyle = Rg[1]; c.lineWidth = 1; c.beginPath(); c.arc(X(ST_B) - 2, y + 9, 5, 0, Math.PI * 2); c.stroke(); }
  const px = X(760), pw = 130, pt = GY - 150;
  box(c, px - 2, pt - 2, pw + 4, GY + 40 - pt, INK); box(c, px, pt, pw, GY + 40 - pt, '#0C0806');
  for (let k2 = 0; k2 < 4; k2++) { c.globalAlpha = k * (0.25 - k2 * 0.05); box(c, px, pt + k2 * 30, pw, 30, '#1E3A4A'); } c.globalAlpha = k;
  for (const fx of [px - 10, px + pw]) { box(c, fx - 1, pt - 10, 12, GY + 50 - pt, INK); box(c, fx, pt - 9, 10, GY + 49 - pt, B[3]); box(c, fx, pt - 9, 3, GY + 49 - pt, B[5]); }
  box(c, px - 12, pt - 20, pw + 24, 12, INK); box(c, px - 11, pt - 19, pw + 22, 10, B[3]); box(c, px - 11, pt - 19, pw + 22, 2, B[5]);
  c.globalAlpha = 1;
};

// ---------------------------------------------------------------------------------------------------------------
// The Old Sawmill's outside

const SH_A = 3000, SH_B = 3900;
const paintShedOut = (g: Ctx, i: number, w: number, h: number) => {
  const P = hr('plank', PLANK), B = hr('bark', BARK);
  for (let x = 0, j = 0; x < w; x += 16, j++) {
    const col = mix(hash(i * 13 + j) < 0.3 ? P[2] : P[3], '#5A524A', 0.3);
    box(g, x, 0, 16, h, col); box(g, x, 0, 1, h, mix(col, INK, 0.5)); box(g, x + 1, 0, 1, h, mix(col, '#FFFFFF', 0.1));
    for (let y = 30 + hash(j + i) * 40; y < h; y += 60 + hash(j * 3 + y) * 40) box(g, x + 5, y, 4, 2, mix(col, INK, 0.35));
  }
  for (const y of [90, 200]) { box(g, 0, y, w, 6, INK); box(g, 0, y + 1, w, 4, B[3]); box(g, 0, y + 1, w, 1, B[5]); }
  checker(g, 0, h - 8, w, 8, mix(P[1], INK, 0.3), 0);
};
const drawShedVeil = (c: Ctx, state: GameState, k: number) => {
  if (k <= 0 || !onScreen(state, X(SH_A) - 30, X(SH_B) + 30)) return;
  const wy = waterY(3400), top = wy - 290, h = wy + 30 - top;
  c.globalAlpha = k;
  for (let i = 0; i < 3; i++) { const x = X(SH_A) + i * 300; if (onScreen(state, x, x + 300)) stillAt(c, `lr-shedout-${i}`, x, top, 0, 0, 300, h, g => paintShedOut(g, i, 300, h)); }
  // (the roof: shingles over the top, its eave lit)
  const B = hr('bark', BARK);
  for (let r = 0; r < 3; r++) for (let x = X(SH_A) - 16 + (r % 2) * 7; x < X(SH_B) + 16; x += 14) { if (x < state.camera.x - 20 || x > state.camera.x + CANVAS_WIDTH + 20) continue; box(c, x, top - 24 + r * 8, 13, 9, INK); box(c, x + 1, top - 24 + r * 8, 11, 8, B[2 + ((((x - X(SH_A)) / 14) | 0) + r & 1)]); box(c, x + 1, top - 17 + r * 8, 11, 1, B[5]); }
  // (THE OLD SAWMILL painted big along it)
  stillAt(c, 'lr-shedout-name', X(3450), top + 60, -200, -24, 400, 44, g => signText(g, 'THE OLD SAWMILL', 0, 10, { sx: 3, sy: 3, fill: ['#F4ECD0', '#E8DCB0', '#E8DCB0', '#B8A880'], dither: true, shadow: '#2A1E14', worn: 0.08, wornCol: '#6A5A4A' }));
  // (the doors the flume runs through, dark)
  for (const dx of [SH_A, SH_B - 70]) { box(c, X(dx) - 2, wy - 92, 74, 124, INK); box(c, X(dx), wy - 90, 70, 120, '#0C0806'); box(c, X(dx), wy - 90, 70, 4, B[2]); }
  c.globalAlpha = 1;
};

// ---------------------------------------------------------------------------------------------------------------
// The earth over the sewer

const drawSewerVeil = (c: Ctx, state: GameState, k: number) => {
  if (k <= 0 || !onScreen(state, X(5640), X(8460))) return;
  const top = waterY(5840) - 244, bot = waterY(8400) + 220, open = rideOf(state).cutT >= SLAM_AT + 20;
  c.save(); c.globalAlpha = k;
  c.beginPath(); c.rect(X(5640), top, X(8440) - X(5640), bot - top);
  if (open) c.rect(X(CHASM.a), top, X(CHASM.b) - X(CHASM.a), bot - top);
  c.clip('evenodd');
  earthPatch(c, state, Math.max(X(5640), state.camera.x - 20), Math.min(X(8440), state.camera.x + CANVAS_WIDTH + 20), top, bot);
  c.restore();
};

export const drawVeils = (c: Ctx, state: GameState) => {
  const rx = hereRx(state);
  drawStationVeil(c, state, clamp01((rx - 905) / 70));
  drawShedVeil(c, state, rx < 3300 ? clamp01((2990 - rx) / 50) : clamp01((rx - 3905) / 50));
  // (the sewer: by how far down the view's gone)
  drawSewerVeil(c, state, clamp01((GY + 60 - state.camera.y) / 220));
  void asIs;
};
