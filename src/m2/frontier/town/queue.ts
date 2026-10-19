// Timber Tumble's queue and station front (the final pass: peak SNES). The line sold as LONG: switchbacks three rows
// deep on a plank deck stepping up and back from the ground (every row on it, nothing in the air), its pipe rails and
// posts and the U-turns at alternate ends, packed with bored guests (seeded, static by design: the whole lot painted
// once for the hour into a layer and that put down: the playtest's, drawing them every frame slowed the game right
// down). WAIT FROM HERE boards up on their posts along the rows (the park's planks); the velvet rope at its mouth; the
// flume behind on its trestles (back, hazy) with a log coming down its drop; the station's front: a log lodge (stacked
// logs, their ends round at the corners), its shingled gable, the marquee with its bulbs chasing, the dark way in.

import type { GameState } from '../../../m1/game/core/state';
import { signText } from '../../signLetters';
import { burned, painted, parkSign } from '../kit';
import { GY } from '../geometry';
import { type Ctx, type TownView, box, checker, mix, hash, at, still, sideBack, topBack, INK, timeOfDay, hr, hr7, back7, BARK, SHINGLE, STEEL, BRASS, TIMBER, TOPLIP, western, signPaint, lampsOn } from './paint';
import { QUEUE, STATION, X, Y } from './layout';
import { drawGuest } from './people';

// ---------------------------------------------------------------------------------------------------------------
// The flume behind (back, hazy)

const fy = (x: number) => (x < X(15000) ? GY - 300 - (x - X(14700)) * 0.25 : x < X(15250) ? GY - 375 : GY - 375 + (x - X(15250)) * 1.2);
const drawFlume = (c: Ctx, f: number) => {
  const T = back7(TIMBER[4], 0.2), P = back7('#8A6038', 0.2), W = back7('#5AA8C8', 0.2);
  for (let x = X(14700); x < X(15500); x += 50) {
    const y = fy(x);
    box(c, x - 3, y, 6, GY - 76 - y, T[2]); box(c, x - 3, y, 2, GY - 76 - y, T[4]);
    c.strokeStyle = T[1]; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y + 20); c.lineTo(x + 50, GY - 100); c.stroke();
  }
  c.strokeStyle = INK; c.lineWidth = 20; c.beginPath(); for (let x = X(14700); x <= X(15500); x += 20) { const y = fy(x); if (x === X(14700)) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke();
  c.strokeStyle = P[2]; c.lineWidth = 16; c.stroke();
  c.strokeStyle = P[4]; c.lineWidth = 4; c.beginPath(); for (let x = X(14700); x <= X(15500); x += 20) { const y = fy(x) - 6; if (x === X(14700)) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke();
  c.strokeStyle = W[4]; c.lineWidth = 3; c.beginPath(); for (let x = X(14700); x <= X(15500); x += 20) { const y = fy(x) - 2; if (x === X(14700)) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke();
  // (a log coming down its drop, the splash at the foot)
  const lt = (f % 240) / 240, lx = X(14700) + lt * 800;
  if (lx < X(15500)) {
    const B = back7(BARK[3], 0.2);
    c.save(); c.translate(lx, fy(lx) - 10); c.rotate(lx > X(15250) ? 0.88 : lx < X(15000) ? -0.24 : 0);
    box(c, -23, -8, 46, 16, INK); box(c, -22, -7, 44, 14, B[3]); box(c, -22, -7, 44, 3, B[5]); box(c, 18, -7, 4, 14, back7('#C8A070', 0.2)[3]);
    c.restore();
    if (lx > X(15420)) for (let k = 0; k < 6; k++) box(c, X(15480) + k * 8 - 20, GY - 90 - (k % 3) * 8 - (lx - X(15420)) * 0.3, 4, 6, back7('#F2FAFC', 0.1)[3]);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The rows (the layer)

let queueLayer: HTMLCanvasElement | null = null, queueKey = '';
const ROWS: [number, number][] = [[GY - 78, 0.58], [GY - 52, 0.7], [GY - 26, 0.84], [GY, 1]];

/** The deck, the rails and posts, the turns, the guests, into the layer. */
const queueRows = (c: Ctx, a: number, b: number) => {
  // (dimmed a step: the queue's deck isn't his to stand on)
  const P = back7('#7A5634', 0.16), S = hr('steel', STEEL);
  // (the deck: planks stepping up and back, three tiers, on posts)
  for (let r = 3; r >= 1; r--) {
    const y = GY - r * 26;
    box(c, a - 11, y - 1, b - a + 22, r * 26 + 1, INK); box(c, a - 10, y, b - a + 20, r * 26, P[2]);
    box(c, a - 10, y, b - a + 20, 2, P[3]); box(c, a - 10, y + 2, b - a + 20, 1, P[1]);
    for (let x = a; x < b; x += 30) { box(c, x, y + 4, 1, r * 26 - 4, P[1]); box(c, x + 1, y + 4, 1, r * 26 - 4, P[3]); }
    for (let x = a + 8; x < b; x += 60) { box(c, x, y + 8, 2, 2, INK); }
  }
  ROWS.forEach(([y, s], r) => {
    // (the pipe rails, lit along their tops; the posts)
    for (const ry of [y - 40 * s, y - 22 * s]) { box(c, a, ry - 1, b - a, Math.max(2, 3 * s) + 2, INK); box(c, a, ry, b - a, Math.max(2, 3 * s), S[3]); box(c, a, ry, b - a, 1, S[6]); }
    for (let x = a; x <= b; x += 46) { box(c, x - 1, y - 42 * s - 1, Math.max(2, 4 * s) + 2, 42 * s + 1, INK); box(c, x, y - 42 * s, Math.max(2, 4 * s), 42 * s, S[2]); box(c, x, y - 42 * s, 1, 42 * s, S[5]); }
    if (r < 3) { const ex = r % 2 ? a - 6 : b + 2; box(c, ex - 1, y - 42 * s - 1, 6, 42 * s + 27, INK); box(c, ex, y - 42 * s, 4, 42 * s + 26, S[3]); box(c, ex, y - 42 * s, 1, 42 * s + 26, S[6]); }
    // (the guests, smaller further back; a few gaps in the front row)
    const n = Math.floor((b - a) / (34 * s));
    for (let k = 0; k < n; k++) {
      const seed = 101 + r * 53 + k * 17;
      if (r === 3 && hash(seed) < 0.45) continue;
      const gx = a + 14 + k * 34 * s + hash(seed) * 8;
      const pose = hash(seed + 1) < 0.12 ? 'photo' : hash(seed + 2) < 0.1 ? 'point' : 'stand';
      drawGuest(c, gx, y - 2, { seed, f: 0, pose, mood: hash(seed + 3) < 0.15 ? 'happy' : 'bored', facing: hash(seed + 4) < 0.5 ? 1 : -1, scale: s });
    }
  });
};

const drawQueueFront = (c: Ctx, state: GameState, v: TownView) => {
  const f = state.frame, a = QUEUE.a, b = QUEUE.b, B = BRASS;
  // ---- the velvet rope at the line's mouth, sagging between brass posts
  for (let x = a - 60; x < a; x += 30) { box(c, x - 1, GY - 35, 6, 35, INK); box(c, x, GY - 34, 4, 34, B[3]); box(c, x, GY - 34, 1, 34, B[5]); box(c, x - 2, GY - 37, 8, 4, B[4]); }
  c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); for (let x = a - 60; x < a - 30; x += 30) { c.moveTo(x + 2, GY - 32); c.quadraticCurveTo(x + 17, GY - 22, x + 32, GY - 32); } c.stroke();
  c.strokeStyle = '#991B1B'; c.lineWidth = 3; c.stroke();
  // ---- WAIT FROM HERE, all the way along (the park's planks, each up on its posts on its row's deck)
  parkSign(c, a + 40, GY, ['90 MIN', 'WAIT FROM HERE'], { seed: 90, tall: 118 });
  parkSign(c, a + 380, GY - 26, ['75 MIN', 'FROM HERE'], { seed: 75, tall: 110 });
  parkSign(c, b - 80, GY - 52, ['60 MIN', 'FROM HERE'], { seed: 60, tall: 102 });
  parkSign(c, a + 260, GY - 78, ['45 MIN', 'HANG IN THERE'], { seed: 45, tall: 96 });
  // ---- the station's front: a log lodge, its gable, the marquee, the way in
  const sa = STATION.a, sb = STATION.b, top = Y(300);
  const Lg = hr('bark', BARK), Sh = hr('shingle', SHINGLE);
  still(c, 'station', sa, GY, -30, Y(392) - GY, sb - sa + 60, GY - Y(392) + 2, g => {
    const w = sb - sa, t = top - GY;
    // (stacked logs, banded in bark, their round ends at the corners, the chinking between)
    box(g, -1, t - 1, w + 2, -t + 1, INK);
    for (let y = t, r = 0; y < 0; y += 18, r++) {
      box(g, 0, y, w, 18, Lg[3]); box(g, 0, y, w, 4, Lg[5]); box(g, 0, y + 4, w, 3, Lg[4]); box(g, 0, y + 13, w, 3, Lg[2]); box(g, 0, y + 16, w, 2, mix('#D8C8A0', Lg[2], 0.5));
      for (let x = (r * 37) % 60; x < w; x += 60) box(g, x, y + 7, 14, 1, Lg[1]);
      for (const ex of [-6, w - 10]) { g.fillStyle = INK; g.beginPath(); g.arc(ex + 8, y + 9, 10, 0, Math.PI * 2); g.fill(); g.fillStyle = '#C8A070'; g.beginPath(); g.arc(ex + 8, y + 9, 9, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#9A7448'; g.lineWidth = 1; g.beginPath(); g.arc(ex + 8, y + 9, 5, 0, Math.PI * 2); g.stroke(); box(g, ex + 7, y + 8, 2, 2, '#7A5430'); }
    }
    // (the gable: shingled, steep, its bargeboards)
    g.fillStyle = INK; g.beginPath(); g.moveTo(-26, t + 2); g.lineTo(w / 2, t - 86); g.lineTo(w + 26, t + 2); g.closePath(); g.fill();
    g.fillStyle = Sh[3]; g.beginPath(); g.moveTo(-20, t); g.lineTo(w / 2, t - 80); g.lineTo(w + 20, t); g.closePath(); g.fill();
    g.save(); g.beginPath(); g.moveTo(-20, t); g.lineTo(w / 2, t - 80); g.lineTo(w + 20, t); g.closePath(); g.clip();
    for (let r = 0; r < 10; r++) for (let x = -20 + (r % 2) * 6; x < w + 20; x += 12) { box(g, x, t - 8 - r * 8, 11, 7, Sh[2 + ((x / 12 + r) & 1)]); box(g, x, t - 2 - r * 8, 11, 1, Sh[5]); }
    g.fillStyle = Sh[4]; g.beginPath(); g.moveTo(-20, t); g.lineTo(w / 2, t - 80); g.lineTo(w / 2, t - 70); g.lineTo(-6, t); g.closePath(); g.fill();
    g.restore();
    g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(-24, t + 2); g.lineTo(w / 2, t - 84); g.lineTo(w + 24, t + 2); g.stroke();
    g.strokeStyle = hr('timber', TIMBER)[4]; g.lineWidth = 5; g.stroke();
    // (the way in: dark, its posts and lintel, the sign over it)
    const mx = w / 2;
    box(g, mx - 53, -123, 106, 123, INK); box(g, mx - 50, -120, 100, 120, '#120C08');
    for (let k = 0; k < 4; k++) { g.globalAlpha = 0.25 - k * 0.05; box(g, mx - 50, -120 + k * 30, 100, 30, '#2A4A5A'); } g.globalAlpha = 1;
    for (const px of [mx - 56, mx + 46]) { box(g, px - 1, -126, 12, 126, INK); box(g, px, -125, 10, 125, Lg[3]); box(g, px, -125, 3, 125, Lg[5]); }
    box(g, mx - 60, -134, 120, 12, INK); box(g, mx - 59, -133, 118, 10, Lg[3]); box(g, mx - 59, -133, 118, 2, Lg[5]);
    box(g, mx - 101, -160, 202, 22, INK); box(g, mx - 100, -159, 200, 20, '#7F1D1D'); box(g, mx - 100, -159, 200, 2, '#B83A2A');
    signText(g, 'RIDE TIME: 11 MIN. YOU WILL GET WET.', mx, -144, { ...painted(1, '#FEF3C7', '#3A0A06') });
  });
  // ---- the marquee (bulbs chasing), live
  const mx = (sa + sb) / 2, my = Y(250);
  still(c, 'marquee', mx, my, -144, -44, 288, 88, g => {
    const P = hr7('#A0703C');
    box(g, -141, -41, 282, 82, INK); box(g, -138, -38, 276, 76, P[3]); box(g, -138, -38, 276, 3, P[5]); box(g, -138, 35, 276, 3, P[1]);
    for (let y = -32; y < 34; y += 5) box(g, -134 + ((y * 7) % 23), y, 120, 1, P[2]);
    signText(g, 'TIMBER TUMBLE', 0, -4, burned(3, 4));
    signText(g, 'THE LONGEST LOG RIDE IN THE WEST', 0, 20, signPaint(1, '#FEF3C7', P[1]));
  });
  const on = lampsOn();
  for (let k = 0; k < 20; k++) {
    const bxk = mx - 132 + k * 14, lit = (k + Math.floor(f / 6)) % 3 === 0;
    for (const by of [my - 34, my + 34]) { c.fillStyle = INK; c.beginPath(); c.arc(bxk, by, 3.5, 0, Math.PI * 2); c.fill(); c.fillStyle = lit ? '#FFF4B0' : on ? '#E8B030' : '#A8822A'; c.beginPath(); c.arc(bxk, by, 2.5, 0, Math.PI * 2); c.fill(); if (lit) box(c, bxk - 1, by - 2, 1, 1, '#FFFFFF'); }
  }
  void topBack; void at; void checker; void western; void timeOfDay;
};

/** The log ride's queue: the flume behind, the rows (one layer for the hour), the boards, the station's front. */
export const drawQueue = (c: Ctx, state: GameState, v: TownView) => {
  const a = QUEUE.a, b = QUEUE.b;
  drawFlume(c, state.frame);
  // (the station's sides going back, before the rows: the queue's front rows are nearer (its left side used to be
  // drawn over the end of the line))
  const Lg = hr('bark', BARK), st = Y(300);
  sideBack(c, v.eye, STATION.a, -1, st, GY, 1, 0.84, Lg, 4);
  sideBack(c, v.eye, STATION.b, 1, st, GY, 1, 0.84, Lg, 4);
  const top = GY - 180, key = `${a}:${b}:${timeOfDay().key}`;
  if (typeof document !== 'undefined' && (!queueLayer || queueKey !== key)) {
    queueKey = key;
    queueLayer = document.createElement('canvas');
    queueLayer.width = Math.ceil(b - a + 40); queueLayer.height = GY + 6 - top;
    const q = queueLayer.getContext('2d')!;
    q.translate(-(a - 20), -top);
    queueRows(q, a, b);
  }
  if (queueLayer) c.drawImage(queueLayer, a - 20, top);
  drawQueueFront(c, state, v);
  void TOPLIP;
};
