// The fairy wheel, drawn (the SNES pass: every material in a stepped ramp, lit from the upper left, inked; still parts
// painted once for the hour into stamps). The wheel itself is scenery (its A-frame of lattice trusses on their stone
// plinths, the rims laced between, the spokes, the pixie lights, the flower hub and its heart-shaped PA horn: dimmed,
// nothing on it's stood on); the gondolas are what's stood on (each one's floor a warm lit lip, bright against the
// wheel): a toadstool cap (stepped, spotted, frilled under) with gossamer fairy wings (veined, flapping) and fairy
// lights, the name of whoever's in it on a gilt plaque, a petal back, a tufted bench, the floor, a flower bowl under it
// with its stamens hung down. What's thrown; the plaza (far.ts the far off, fair.ts the midway, the crowds, the
// fountain and the paving; here the arch's sign, the ticket kiosk, the queue's velvet ropes, the flower beds), the
// rose gates.

import type { GameState } from '../../../m1/game/core/state';
import { signText } from '../../signLetters';
import { timeOfDay } from '../../timeOfDay';
import { box, mix, hash, checker, INK, gilt, storySign, onScreen, still, ballR, postR, polyF, snowCap, viewOf, rampH, ramp6, hour, lit, STONE, IRON, GOLD, SNOW, PINE, LIP, type Ctx } from '../kit';
import { GY } from '../geometry';
import { X, Y, HUB, R, N, HANG, FLOOR_W, x0, x1 } from './layout';
import type { Item } from './lines';
import { drawWheelFar } from './far';
import { drawFairBack, drawPaving } from './fair';

const CAPS = ['#F49AC8', '#9EE6C8', '#C8A8F4', '#FFC8A0'];
/** (the wheel's own colors, dimmed: it's scenery) */
const D6 = (col: string) => rampH(ramp6(col), true);
const H6 = (col: string) => rampH(ramp6(col));

// ---------------------------------------------------------------------------------------------------------------
// The sky and the far off (far.ts)

export const drawWheelBackdrop = (c: Ctx, state: GameState) => drawWheelFar(c, state);

// ---------------------------------------------------------------------------------------------------------------
// The wheel

const STEEL = '#B8A4DC';
/** A lattice truss from (ax, ay) to (bx, by), `w` wide: two chords, a zigzag web, rivets; stepped, inked. */
const truss = (g: Ctx, ax: number, ay: number, bx: number, by: number, w: number, S: string[]) => {
  const len = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / len, ny = (bx - ax) / len, hw = w / 2;
  const P = (t: number, s: number): [number, number] => [ax + (bx - ax) * t + nx * hw * s, ay + (by - ay) * t + ny * hw * s];
  const line = (p: [number, number], q: [number, number], lw: number, col: string) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); };
  const n = Math.max(4, Math.round(len / 34));
  for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n; line(P(t0, i % 2 ? 1 : -1), P(t1, i % 2 ? -1 : 1), 4, INK); line(P(t0, i % 2 ? 1 : -1), P(t1, i % 2 ? -1 : 1), 2, S[2]); }
  for (let i = 0; i <= n; i++) { const t = i / n; line(P(t, -1), P(t, 1), 3, INK); line(P(t, -1), P(t, 1), 1, S[1]); }
  for (const s of [-1, 1]) { line(P(0, s), P(1, s), 7, INK); line(P(0, s), P(1, s), 5, s < 0 ? S[3] : S[2]); line(P(0, s), P(1, s), 1, s < 0 ? S[5] : S[3]); }
  for (let i = 0; i <= n; i++) for (const s of [-1, 1]) { const [rx, ry] = P(i / n, s); box(g, rx - 1, ry - 1, 2, 2, S[4]); }
};
/** The A-frame (still): the trusses down to the plinths, the cross-girder, the bearing at the axle, the plinths'
 *  stonework with a gilt band and roses climbing them. Local to the hub's foot (hx, GY). */
const paintFrame = (g: Ctx) => {
  const S = D6(STEEL), St = rampH(STONE, true), Gd = rampH(GOLD, true), Sn = rampH(SNOW, true), P = rampH(PINE, true);
  const top = -HUB.h;
  for (const s of [-1, 1]) {
    truss(g, s * 470, -40, s * 34, top + 6, 26, S);
    truss(g, s * 380, -40, s * 24, top + 30, 16, S);
    // (the plinth: dressed stone in courses, a gilt band, a pink heart plaque, snow on top, roses up it)
    const px = s * 470 - 46;
    box(g, px - 1, -46, 94, 46, INK); box(g, px, -45, 92, 45, St[3]); box(g, px, -45, 92, 3, St[5]); box(g, px, -45, 3, 45, St[4]); box(g, px + 86, -45, 6, 45, St[1]);
    for (let y = -36; y < 0; y += 9) { box(g, px, y, 92, 1, St[2]); for (let x = px + ((y / 9) % 2 ? 10 : 24); x < px + 90; x += 28) box(g, x, y + 1, 1, 8, St[2]); }
    box(g, px, -28, 92, 4, Gd[3]); box(g, px, -28, 92, 1, Gd[5]);
    snowCap(g, px, -45, 92, 4, 11 + s, Sn, true);
    for (let k = 0; k < 9; k++) { const rx = px + 6 + hash(k * 3 + s) * 80, ry = -6 - hash(k * 5 + s) * 34; box(g, rx - 3, ry + 2, 7, 2, P[3]); ballR(g, rx, ry, 3, D6('#E11D48')); }
  }
  // (the cross-girder, two thirds of the way down)
  truss(g, -300, -HUB.h * 0.38, 300, -HUB.h * 0.38, 18, S);
  // (the axle's bearing: a drum with bolts round it, and the axle's stub)
  ballR(g, 0, top, 44, S);
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; ballR(g, Math.cos(a) * 36, top + Math.sin(a) * 36, 3, Gd); }
};
/** The wheel's frame, rim, spokes, lights and hub (behind the gondolas). `ang` the wheel's turn. */
export const drawWheel = (c: Ctx, state: GameState, ang: number) => {
  const hx = X(HUB.x), hy = Y(HUB.h), f = state.frame;
  if (!onScreen(state, hx - R - 200, hx + R + 200)) return;
  still(c, 'wh-frame', hx, GY, -560, -HUB.h - 60, 1120, HUB.h + 64, paintFrame);
  const S = D6(STEEL), Pk = D6('#F49AC8'), Mn = D6('#9EE6C8'), Lv = D6('#C8A8F4'), Gd = rampH(GOLD, true);
  const cy = state.camera.y, cx = state.camera.x;
  const near = (x: number, y: number, m = 40) => x > cx - m && x < cx + 800 + m && y > cy - m && y < cy + 600 + m;
  // (the spokes: pink and mint in turn, a lit edge up the upper side; in pairs out to the inner rim, braced)
  for (let k = 0; k < N; k++) {
    const a = ang + (k * Math.PI * 2) / N, ca = Math.cos(a), sa = Math.sin(a), ex = hx + ca * R, ey = hy + sa * R, M = k % 2 ? Pk : Mn;
    for (const [lw, col] of [[7, INK], [5, M[2]], [2, M[3]]] as const) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(hx + ca * 40, hy + sa * 40); c.lineTo(ex, ey); c.stroke(); }
    c.strokeStyle = M[5]; c.lineWidth = 1; c.beginPath(); c.moveTo(hx + ca * 40 - sa * 2, hy + sa * 40 + ca * -2); c.lineTo(ex - sa * 2, ey - ca * 2); c.stroke();
    // (a brace from the spoke's middle out to the rim, half way to the next one)
    const b = a + Math.PI / N, mx = hx + ca * R * 0.55, my = hy + sa * R * 0.55, bx = hx + Math.cos(b) * (R - 70), by = hy + Math.sin(b) * (R - 70);
    c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(mx, my); c.lineTo(bx, by); c.stroke(); c.strokeStyle = S[1]; c.lineWidth = 2; c.stroke();
    // (a gilt star boss where each spoke meets the rims)
    if (near(ex, ey)) { ballR(c, ex, ey, 7, Gd); const ix = hx + ca * (R - 70), iy = hy + sa * (R - 70); ballR(c, ix, iy, 5, Gd); }
  }
  // (the rims: a double ring, stepped (lit along the upper left, shaded lower right), laced between in a zigzag)
  for (const [r, w, M] of [[R, 12, Lv], [R - 70, 8, Lv]] as const) {
    c.strokeStyle = INK; c.lineWidth = w + 4; c.beginPath(); c.arc(hx, hy, r, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = M[2]; c.lineWidth = w; c.stroke();
    c.strokeStyle = M[4]; c.lineWidth = Math.max(2, w * 0.3); c.beginPath(); c.arc(hx, hy, r - w * 0.2, Math.PI * 0.85, Math.PI * 1.75); c.stroke();
    c.strokeStyle = M[1]; c.lineWidth = Math.max(2, w * 0.3); c.beginPath(); c.arc(hx, hy, r + w * 0.2, Math.PI * -0.15, Math.PI * 0.75); c.stroke();
    c.strokeStyle = M[5]; c.lineWidth = 1; c.beginPath(); c.arc(hx, hy, r - w / 2 + 1, Math.PI * 1.05, Math.PI * 1.55); c.stroke();
  }
  for (let k = 0; k < N * 4; k++) {
    const a0 = ang + (k * Math.PI) / (N * 2), a1 = a0 + Math.PI / (N * 2), r0 = k % 2 ? R - 70 : R, r1 = k % 2 ? R : R - 70;
    const p = [hx + Math.cos(a0) * r0, hy + Math.sin(a0) * r0], q = [hx + Math.cos(a1) * r1, hy + Math.sin(a1) * r1];
    if (!near(p[0], p[1], 80)) continue;
    c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke();
    c.strokeStyle = Pk[3]; c.lineWidth = 2; c.stroke();
  }
  // (the pixie lights round both rims: soft, twinkling in waves, a halo after dark)
  const cols = ['#FEF08A', '#A5F3FC', '#F9A8D4', '#FFFFFF', '#BBF7D0'], night = timeOfDay().lamps;
  for (const [r, n, sz] of [[R + 11, 120, 4], [R - 80, 72, 3]] as const) for (let k = 0; k < n; k++) {
    const a = ang + (k * Math.PI * 2) / n, lx = hx + Math.cos(a) * r, ly = hy + Math.sin(a) * r;
    if (!near(lx, ly)) continue;
    const on = (k * 7 + Math.floor(f / 8)) % 6 !== 0 && Math.sin(k * 0.3 - f * 0.05) > -0.7, col = cols[k % 5];
    if (on && night > 0.3) { c.globalAlpha = 0.25 * night; box(c, lx - sz, ly - sz, sz * 2, sz * 2, col); c.globalAlpha = 1; }
    box(c, lx - sz / 2 - 1, ly - sz / 2 - 1, sz + 2, sz + 2, INK);
    box(c, lx - sz / 2, ly - sz / 2, sz, sz, on ? col : mix(col, INK, 0.55));
    if (on) box(c, lx - sz / 2, ly - sz / 2, 1, 1, '#FFFFFF');
  }
  // (the hub: a big flower turning with it: eight outer petals, eight inner between them, the gilt middle, a heart
  // gem in it; the heart-shaped PA horn hung under it)
  if (near(hx, hy, 160)) {
    for (const [n, rr, len, wid, M, off] of [[8, 54, 40, 20, Pk, 0], [8, 34, 30, 15, D6('#F8C4E0'), Math.PI / 8]] as const) for (let k = 0; k < n; k++) {
      const a = ang + off + (k * Math.PI * 2) / n;
      c.save(); c.translate(hx + Math.cos(a) * rr, hy + Math.sin(a) * rr); c.rotate(a);
      c.fillStyle = INK; c.beginPath(); c.ellipse(0, 0, len + 2, wid + 2, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = M[1]; c.beginPath(); c.ellipse(0, 0, len, wid, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = M[3]; c.beginPath(); c.ellipse(-2, -2, len * 0.85, wid * 0.7, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = M[4]; c.beginPath(); c.ellipse(-len * 0.2, -wid * 0.3, len * 0.5, wid * 0.3, 0, 0, Math.PI * 2); c.fill();
      c.strokeStyle = M[1]; c.lineWidth = 1; c.beginPath(); c.moveTo(-len * 0.8, 0); c.lineTo(len * 0.8, 0); c.stroke();
      c.restore();
    }
    ballR(c, hx, hy, 32, Gd);
    for (let k = 0; k < 16; k++) { const a = ang + (k / 16) * Math.PI * 2; box(c, hx + Math.cos(a) * 26 - 1, hy + Math.sin(a) * 26 - 1, 3, 3, k % 2 ? Gd[5] : Gd[1]); }
    const hr = H6('#E0408A');
    c.fillStyle = INK; c.beginPath(); c.moveTo(hx, hy + 13); c.bezierCurveTo(hx - 19, hy, hx - 12, hy - 15, hx, hy - 5); c.bezierCurveTo(hx + 12, hy - 15, hx + 19, hy, hx, hy + 13); c.fill();
    c.fillStyle = hr[2]; c.beginPath(); c.moveTo(hx, hy + 10); c.bezierCurveTo(hx - 16, hy, hx - 10, hy - 12, hx, hy - 3); c.bezierCurveTo(hx + 10, hy - 12, hx + 16, hy, hx, hy + 10); c.fill();
    c.fillStyle = hr[4]; c.beginPath(); c.ellipse(hx - 6, hy - 5, 4, 3, -0.6, 0, Math.PI * 2); c.fill(); box(c, hx - 8, hy - 7, 2, 2, '#FFFFFF');
    drawHubHorn(c, hx, hy + 40, false, f);
  }
};

/** The PA horn under the hub: a brass horn out of a pink heart (stepped, a gilt rim, a grille); rings off it while she
 *  talks. */
export const drawHubHorn = (c: Ctx, x: number, y: number, talking: boolean, f: number) => {
  const j = talking && f % 4 < 2 ? 1 : 0, Pk = H6('#F472B6'), Br = H6('#D09A30');
  // (its bracket up to the hub)
  box(c, x - 3, y - 26, 6, 14, INK); box(c, x - 2, y - 26, 4, 14, Br[2]);
  const heart = (s: number, col: string, dy = 0) => { c.fillStyle = col; c.beginPath(); c.moveTo(x, y + 6 * s + dy); c.bezierCurveTo(x - 26 * s, y - 14 * s + dy, x - 14 * s, y - 30 * s + dy, x, y - 16 * s + dy); c.bezierCurveTo(x + 14 * s, y - 30 * s + dy, x + 26 * s, y - 14 * s + dy, x, y + 6 * s + dy); c.fill(); };
  heart(1.06, INK); heart(1, Pk[1]); heart(0.86, Pk[3], -1); heart(0.5, Pk[4], -6);
  box(c, x - 9, y - 22, 3, 3, '#FFFFFF');
  // (the horn: a flared bell out down to the left, banded brass, a dark mouth)
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 4, y - 2); c.lineTo(x - 34, y + 26 + j); c.lineTo(x - 14, y + 38 + j); c.lineTo(x + 6, y + 4); c.closePath(); c.fill();
  c.fillStyle = Br[3]; c.beginPath(); c.moveTo(x - 3, y); c.lineTo(x - 31, y + 26 + j); c.lineTo(x - 15, y + 35 + j); c.lineTo(x + 4, y + 5); c.closePath(); c.fill();
  c.fillStyle = Br[4]; c.beginPath(); c.moveTo(x - 3, y); c.lineTo(x - 31, y + 26 + j); c.lineTo(x - 26, y + 29 + j); c.lineTo(x, y + 3); c.closePath(); c.fill();
  c.fillStyle = INK; c.beginPath(); c.ellipse(x - 24, y + 32 + j, 12, 6, -2.6, 0, Math.PI * 2); c.fill();
  c.fillStyle = Br[2]; c.beginPath(); c.ellipse(x - 24, y + 32 + j, 10, 4.5, -2.6, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#2A1A0A'; c.beginPath(); c.ellipse(x - 25, y + 33 + j, 6, 2.5, -2.6, 0, Math.PI * 2); c.fill();
  for (let k = 0; k < 3; k++) box(c, x - 12 - k * 6, y + 10 + k * 6, 2, 2, Br[5]);
  if (talking) for (let k = 0; k < 3; k++) {
    const r = 8 + ((f * 1.5 + k * 12) % 36), a = Math.max(0, 1 - r / 44);
    c.globalAlpha = a; c.strokeStyle = '#F472B6'; c.lineWidth = 3; c.beginPath(); c.arc(x - 26, y + 34, r, 1.6, 3.2); c.stroke();
    c.strokeStyle = '#FFE4F2'; c.lineWidth = 1; c.stroke(); c.globalAlpha = 1;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The gondolas

/** A gondola's still back half, local to its floor's middle: the hanger and its pivot, the posts, the petal back, the
 *  bench, the toadstool cap (stepped, spotted, frilled under), the plaque. */
const paintCartBack = (g: Ctx, k: number, side: 1 | -1, name: string | null) => {
  const cap = CAPS[k % CAPS.length], Cp = H6(cap), Pt = H6(mix(cap, '#FFFFFF', 0.45)), Cr = H6('#FFF0D8'), Gd = rampH(GOLD), I = rampH(IRON), py = -HANG;
  // (the hanger off the rim: an iron rod, a gilt pivot boss)
  box(g, -3, py, 6, 24, INK); box(g, -2, py, 4, 24, I[3]); box(g, -2, py, 1, 24, I[5]);
  ballR(g, 0, py, 6, Gd); box(g, -1, py - 1, 2, 2, INK);
  // (the petal back: five petals overlapping, each stepped, a vein up each)
  for (const p of [-2, 2, -1, 1, 0]) {
    const px = p * 19, top = -54 - (2 - Math.abs(p)) * 6;
    g.fillStyle = INK; g.beginPath(); g.ellipse(px, top + 30, 18, 36, p * 0.12, Math.PI, Math.PI * 2); g.lineTo(px + 18, 0); g.lineTo(px - 18, 0); g.closePath(); g.fill();
    g.fillStyle = Pt[2]; g.beginPath(); g.ellipse(px, top + 30, 16, 34, p * 0.12, Math.PI, Math.PI * 2); g.lineTo(px + 16, -1); g.lineTo(px - 16, -1); g.closePath(); g.fill();
    g.fillStyle = Pt[3]; g.beginPath(); g.ellipse(px - 3, top + 32, 10, 30, p * 0.12, Math.PI, Math.PI * 2); g.lineTo(px + 7, -1); g.lineTo(px - 13, -1); g.closePath(); g.fill();
    g.fillStyle = Pt[4]; g.beginPath(); g.ellipse(px - 6, top + 22, 4, 16, p * 0.12, Math.PI, Math.PI * 2); g.fill();
    g.strokeStyle = Pt[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(px, -2); g.quadraticCurveTo(px + p * 2, top + 20, px + p, top + 2); g.stroke();
  }
  // (the posts: cream stalks, ringed)
  for (const s of [-1, 1]) { postR(g, s * 48, -92, 0, 6, Cr); for (let y = -80; y < 0; y += 18) box(g, s * 48 - 3, y, 6, 2, Cr[1]); }
  // (the bench at his end: a cushion, tufted, on a carved front)
  const bx = side * 28;
  box(g, bx - 19, -25, 38, 25, INK);
  box(g, bx - 18, -24, 36, 7, H6('#FFE4F2')[3]); box(g, bx - 18, -24, 36, 2, H6('#FFE4F2')[5]); for (let t = -12; t <= 12; t += 8) box(g, bx + t, -21, 2, 2, H6('#FFE4F2')[1]);
  box(g, bx - 18, -17, 36, 17, Cp[1]); box(g, bx - 18, -17, 36, 2, Cp[3]); box(g, bx - 12, -13, 24, 9, Cp[0]); box(g, bx - 11, -12, 22, 1, Cp[2]);
  // (the cap: a toadstool's, in bands (lit up top left, shaded down to the rim), spots stepped, the frilled gills under)
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, -90, 66, 30, 0, Math.PI, 0); g.fill();
  const band = (rx: number, ry: number, dx: number, dy: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(dx, -90 + dy, rx, ry, 0, Math.PI, 0); g.fill(); };
  band(64, 28, 0, 0, Cp[1]); band(60, 26, -2, -1, Cp[2]); band(54, 23, -5, -3, Cp[3]); band(40, 16, -10, -7, Cp[4]); band(18, 6, -18, -14, Cp[5]);
  checker(g, -64, -94, 128, 2, Cp[1], 0, 1);
  for (const [sx, sy, r] of [[-36, -100, 6], [-8, -111, 5], [22, -104, 7], [46, -96, 4], [-50, -92, 3], [6, -97, 3]] as const) {
    g.fillStyle = INK; g.beginPath(); g.ellipse(sx, sy, r + 1, (r + 1) * 0.7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#E8E0F0'; g.beginPath(); g.ellipse(sx, sy, r, r * 0.7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(sx - r * 0.25, sy - r * 0.2, r * 0.6, r * 0.4, 0, 0, Math.PI * 2); g.fill();
  }
  box(g, -64, -91, 128, 9, INK); box(g, -62, -90, 124, 7, Cr[2]);
  for (let x = -60; x < 60; x += 4) box(g, x, -89, 1, 6, Cr[1]);
  for (let x = -62; x < 62; x += 10) { g.fillStyle = Cp[0]; g.beginPath(); g.arc(x + 5, -83, 5, 0, Math.PI); g.fill(); }
  if (name) {
    box(g, -52, -78, 104, 15, INK); box(g, -51, -77, 102, 13, '#4A1A5A'); box(g, -51, -77, 102, 1, '#7A3A8A');
    box(g, -53, -72, 3, 3, Gd[4]); box(g, 50, -72, 3, 3, Gd[4]);
    signText(g, name, 0, -67, gilt(1));
  }
};
/** A gondola's back half (behind whoever's in it): the still part (a stamp), then its wings and its lights live.
 *  (fx, fy) the middle of its floor. `name`: the plaque under the cap. */
export const drawCartBack = (c: Ctx, f: number, k: number, fx: number, fy: number, side: 1 | -1, name: string | null) => {
  // (the wings, behind the cap either side: gossamer in steps, veined, flapping slow)
  const flap = Math.sin(f * 0.08 + k) * 0.22;
  for (const s of [-1, 1]) {
    c.save(); c.translate(Math.round(fx + s * 52), Math.round(fy - 96)); c.rotate(s * (-0.5 + flap)); c.scale(s, 1);
    for (const [ox, oy, rx, ry, rot] of [[18, -10, 24, 12, -0.4], [14, 6, 16, 8, 0.3]] as const) {
      c.fillStyle = 'rgba(26,16,40,0.85)'; c.beginPath(); c.ellipse(ox, oy, rx + 1.5, ry + 1.5, rot, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(196,184,240,0.85)'; c.beginPath(); c.ellipse(ox, oy, rx, ry, rot, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(228,220,255,0.85)'; c.beginPath(); c.ellipse(ox - 2, oy - 1, rx * 0.7, ry * 0.6, rot, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); c.ellipse(ox - 5, oy - 3, rx * 0.3, ry * 0.25, rot, 0, Math.PI * 2); c.fill();
      c.strokeStyle = 'rgba(140,120,200,0.9)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 0); c.lineTo(ox + Math.cos(rot) * rx * 0.9, oy + Math.sin(rot) * rx * 0.9); c.moveTo(ox * 0.5, oy * 0.5); c.lineTo(ox + Math.cos(rot + 0.6) * rx * 0.6, oy + Math.sin(rot + 0.6) * rx * 0.6); c.stroke();
    }
    c.restore();
  }
  still(c, `wh-cart-${k % CAPS.length}-${side}-${name ?? '-'}`, fx, fy, -84, -HANG - 10, 168, HANG + 14, g => paintCartBack(g, k, side, name));
  // (fairy lights along the cap's rim, twinkling round; a glow after dark)
  const night = lit();
  for (let i = 0; i < 8; i++) {
    const lx = Math.round(fx - 56 + i * 16), ly = Math.round(fy - 84), on = (i + Math.floor(f / 10) + k) % 4 !== 0, col = (i + k) % 3 ? '#FEF08A' : (i % 2 ? '#A5F3FC' : '#F9A8D4');
    if (on && night) { c.globalAlpha = 0.3; box(c, lx - 3, ly - 2, 8, 8, col); c.globalAlpha = 1; }
    box(c, lx - 1, ly, 4, 4, INK); box(c, lx, ly + 1, 2, 2, on ? col : mix(col, INK, 0.5));
  }
};

/** A gondola's floor and the flower bowl under it (in front of whoever's sat in it): the floor's top lit (it's stood on). */
const paintCartFloor = (g: Ctx, k: number) => {
  const cap = CAPS[k % CAPS.length], Cp = H6(cap), w = FLOOR_W, Gd = rampH(GOLD), Lf = rampH(PINE);
  // (the bowl: a ring of petals cupped under the floor, stepped, leaves at the sides, stamens hung down from the middle)
  for (const s of [-1, 1]) { g.fillStyle = INK; g.beginPath(); g.ellipse(s * (w / 2 - 4), 12, 14, 6, s * 0.5, 0, Math.PI * 2); g.fill(); g.fillStyle = Lf[3]; g.beginPath(); g.ellipse(s * (w / 2 - 4), 12, 12, 4, s * 0.5, 0, Math.PI * 2); g.fill(); g.fillStyle = Lf[4]; g.beginPath(); g.ellipse(s * (w / 2 - 6), 11, 6, 2, s * 0.5, 0, Math.PI * 2); g.fill(); }
  for (let i = 0; i < 3; i++) { const sx = -6 + i * 6, l = 14 + (i % 2) * 6; box(g, sx, 30, 2, l, Gd[2]); ballR(g, sx + 1, 30 + l, 2, Gd, false); }
  g.fillStyle = INK; g.beginPath(); g.moveTo(-w / 2 - 2, 6); g.quadraticCurveTo(0, 42, w / 2 + 2, 6); g.closePath(); g.fill();
  g.fillStyle = Cp[1]; g.beginPath(); g.moveTo(-w / 2, 7); g.quadraticCurveTo(0, 39, w / 2, 7); g.closePath(); g.fill();
  for (let p = -2; p <= 2; p++) {
    const px = p * 20, dy = 14 + (2 - Math.abs(p)) * 4;
    g.fillStyle = INK; g.beginPath(); g.ellipse(px, 8, 11, dy, 0, 0, Math.PI); g.fill();
    g.fillStyle = Cp[2]; g.beginPath(); g.ellipse(px, 8, 10, dy - 1, 0, 0, Math.PI); g.fill();
    g.fillStyle = Cp[3]; g.beginPath(); g.ellipse(px - 2, 8, 6, dy - 3, 0, 0, Math.PI); g.fill();
    g.fillStyle = Cp[4]; box(g, px - 5, 10, 2, Math.max(2, dy - 8), Cp[4]);
  }
  // (the floor: a slab, gilt along its face, its top a warm lit lip)
  box(g, -w / 2 - 1, -1, w + 2, 11, INK);
  box(g, -w / 2, 0, w, 9, '#A85A98'); box(g, -w / 2, 5, w, 1, Gd[3]); box(g, -w / 2, 7, w, 2, '#6E2A6E');
  for (let x = -w / 2 + 6; x < w / 2; x += 14) box(g, x, 5, 2, 2, Gd[5]);
  box(g, -w / 2, 0, w, 2, LIP[2]); box(g, -w / 2, 0, w, 1, LIP[3]); box(g, -w / 2, 2, w, 1, LIP[1]);
};
export const drawCartFloor = (c: Ctx, k: number, fx: number, fy: number) => {
  still(c, `wh-floor-${k % CAPS.length}`, fx, fy, -FLOOR_W / 2 - 20, -4, FLOOR_W + 40, 62, g => paintCartFloor(g, k));
};

// ---------------------------------------------------------------------------------------------------------------
// What they throw (stepped, inked)

export const drawItem = (c: Ctx, item: Item, x: number, y: number, rot: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(rot);
  const dot = (bx: number, by: number, r: number, R6: string[]) => ballR(c, bx, by, r, R6);
  switch (item) {
    case 'bouquet': {
      // (a cone of paper, roses stepped in it, leaves, a ribbon)
      polyF(c, [[-7, -2], [7, -2], [1, 16], [-1, 16]], INK); polyF(c, [[-6, -1], [6, -1], [1, 15], [-1, 15]], '#F4F0FA'); polyF(c, [[-6, -1], [-1, -1], [0, 15], [-1, 15]], '#FFFFFF'); box(c, -4, 6, 8, 2, '#E11D48');
      box(c, -9, -3, 4, 3, '#3A8A3A'); box(c, 5, -2, 4, 3, '#2A6A2A');
      for (const [bx, by, col] of [[-5, -4, '#E11D48'], [4, -4, '#F472B6'], [0, -9, '#E11D48'], [-1, -2, '#FB7185']] as [number, number, string][]) { dot(bx, by, 4.5, ramp6(col)); box(c, bx - 1, by - 1, 2, 1, mix(col, INK, 0.5)); }
      break;
    }
    case 'chocolates': {
      const Rd = ramp6('#DC2626');
      c.fillStyle = INK; c.beginPath(); c.moveTo(0, 11); c.bezierCurveTo(-17, -2, -11, -15, 0, -6); c.bezierCurveTo(11, -15, 17, -2, 0, 11); c.fill();
      c.fillStyle = Rd[2]; c.beginPath(); c.moveTo(0, 8); c.bezierCurveTo(-14, -2, -9, -12, 0, -4); c.bezierCurveTo(9, -12, 14, -2, 0, 8); c.fill();
      c.fillStyle = Rd[3]; c.beginPath(); c.ellipse(-4, -4, 5, 3.5, -0.5, 0, Math.PI * 2); c.fill(); box(c, -7, -6, 2, 2, Rd[5]);
      box(c, -1, -5, 2, 13, '#F6D365'); box(c, -4, -6, 8, 2, '#F6D365'); box(c, -1, -5, 1, 13, '#FFF6C8');
      break;
    }
    case 'horseshoe': {
      const St = ramp6('#B8B8C4');
      for (const [lw, col] of [[8, INK], [5, St[2]], [2, St[4]]] as const) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.arc(0, 0, 8, Math.PI * 0.1, Math.PI * 0.9, true); c.stroke(); }
      for (const a of [0.3, 0.6, 1.4, 1.7]) box(c, Math.cos(-a * 1.5) * 8 - 1, Math.sin(-a * 1.5) * 8 - 1, 2, 2, INK);
      box(c, -6, -6, 2, 2, '#FFFFFF');
      break;
    }
    case 'brick': {
      // (a brick in a love letter: the envelope, a heart seal, string round it)
      const Bk = ramp6('#B4472E');
      box(c, -12, -7, 24, 14, INK); box(c, -11, -6, 22, 12, Bk[3]); box(c, -11, -6, 22, 2, Bk[4]); box(c, -11, 4, 22, 2, Bk[1]);
      box(c, -8, -5, 16, 9, '#FFF8F0'); box(c, -8, -5, 16, 1, '#FFFFFF'); c.strokeStyle = '#C8B8A8'; c.lineWidth = 1; c.beginPath(); c.moveTo(-8, -5); c.lineTo(0, 1); c.lineTo(8, -5); c.stroke();
      c.fillStyle = '#E11D48'; c.beginPath(); c.arc(-1, 1, 2, 0, Math.PI * 2); c.arc(1, 1, 2, 0, Math.PI * 2); c.fill(); box(c, -2, 2, 4, 2, '#E11D48');
      box(c, -12, -1, 24, 2, '#C8A060');
      break;
    }
    case 'shaker': {
      // (a protein shaker: its blue lid and spout, the scoop of powder through the side)
      box(c, -7, -11, 14, 22, INK); box(c, -6, -7, 12, 17, '#E4E4E7'); box(c, -6, -7, 3, 17, '#FFFFFF'); box(c, 3, -7, 3, 17, '#B8B8C4');
      box(c, -6, 1, 12, 9, '#C4A882'); box(c, -6, 1, 12, 1, '#E0C8A4'); box(c, -6, -10, 12, 4, '#2A6ADC'); box(c, -6, -10, 12, 1, '#6A9AFA');
      box(c, -3, -14, 6, 4, INK); box(c, -2, -13, 4, 3, '#2A6ADC');
      for (let y = -4; y < 8; y += 3) box(c, 4, y, 2, 1, '#8A8A9A');
      break;
    }
    case 'wand': {
      for (const [lw, col] of [[5, INK], [3, '#6A4020'], [1, '#A87040']] as const) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(-11, 9); c.lineTo(8, -8); c.stroke(); }
      box(c, -8, 4, 4, 4, '#E0AE3A');
      c.fillStyle = INK; c.beginPath(); for (let i = 0; i < 10; i++) { const a = (i * Math.PI) / 5, r = i % 2 ? 4 : 8.5; c.lineTo(9 + Math.cos(a) * r, -9 + Math.sin(a) * r); } c.closePath(); c.fill();
      c.fillStyle = '#F6D365'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = (i * Math.PI) / 5, r = i % 2 ? 3 : 7; c.lineTo(9 + Math.cos(a) * r, -9 + Math.sin(a) * r); } c.closePath(); c.fill();
      box(c, 7, -12, 3, 3, '#FFF6C8');
      break;
    }
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The plaza, the gates

/** The ticket kiosk (still): a hexagonal storybook kiosk in pink and cream, its glass, the counter, a striped dome with
 *  a gilt finial, the board, and a card in the window. Local to its foot's middle. */
const paintKiosk = (g: Ctx) => {
  const P = D6('#F49AC8'), Cr = D6('#FFF4F8'), Mn = D6('#9EE6C8'), Gd = rampH(GOLD, true), night = lit();
  box(g, -56, -10, 112, 10, INK); box(g, -55, -9, 110, 9, rampH(STONE, true)[3]); box(g, -55, -9, 110, 2, rampH(STONE, true)[5]);
  box(g, -51, -112, 102, 102, INK);
  const panes: [number, number, string[]][] = [[-50, 22, P], [-28, 56, Cr], [28, 22, P]];
  for (const [px, pw, M] of panes) { box(g, px, -111, pw, 101, M[3]); box(g, px, -111, 2, 101, M[4]); box(g, px + pw - 3, -111, 3, 101, M[1]); }
  box(g, -26, -88, 52, 40, INK); box(g, -25, -87, 50, 38, night ? D6('#F0A83E')[3] : '#2A1A3A');
  box(g, -25, -87, 50, 4, night ? '#FFE9A8' : '#4A3A5A'); box(g, -1, -87, 2, 38, INK);
  box(g, -22, -70, 18, 12, D6('#FFF8E0')[4]); signText(g, 'ONE', -13, -65, { sx: 1, sy: 1, fill: '#4A1A5A' }); signText(g, 'EACH', -13, -59, { sx: 1, sy: 1, fill: '#4A1A5A' });
  box(g, -30, -50, 60, 6, INK); box(g, -29, -49, 58, 4, Gd[3]); box(g, -29, -49, 58, 1, Gd[5]);
  for (let k = 0; k < 4; k++) { box(g, -40 + k * 24, -40, 10, 26, P[1]); box(g, -40 + k * 24, -40, 2, 26, P[2]); }
  box(g, -54, -116, 108, 6, INK); box(g, -53, -115, 106, 4, Gd[3]); box(g, -53, -115, 106, 1, Gd[5]);
  // (the dome: striped, banded lighter up the left)
  for (let k = 0; k < 8; k++) {
    const a = -54 + k * 13.5, b = a + 13.5, M = k % 2 ? Mn : Cr;
    polyF(g, [[a, -116], [0, -168], [b, -116]], INK); polyF(g, [[a + 1, -117], [0, -166], [b - 1, -117]], M[k < 3 ? 4 : k < 6 ? 3 : 2]);
  }
  for (let k = 0; k < 8; k++) { g.fillStyle = k % 2 ? Mn[1] : P[2]; g.beginPath(); g.arc(-48 + k * 13.5, -116, 6.5, 0, Math.PI); g.fill(); }
  box(g, -1, -184, 2, 16, Gd[2]); ballR(g, 0, -170, 4, Gd);
  polyF(g, [[1, -184], [16, -180], [1, -176]], P[4]);
  snowCap(g, -24, -150, 48, 3, 4, rampH(SNOW, true), false);
  box(g, -42, -138, 84, 18, INK); box(g, -41, -137, 82, 16, '#4A1A5A'); box(g, -41, -137, 82, 1, '#7A3A8A');
  signText(g, 'TICKETS', 0, -125, gilt(1));
};
/** The queue (still): brass stanchions and pink velvet ropes, empty (everybody's up on the wheel). Local to the left. */
const paintQueue = (g: Ctx) => {
  const Gd = rampH(GOLD, true), Rp = D6('#C8508E');
  for (let rx = 0; rx <= 440; rx += 110) {
    box(g, rx - 9, -5, 18, 5, INK); box(g, rx - 8, -4, 16, 4, Gd[2]); box(g, rx - 8, -4, 16, 1, Gd[4]);
    postR(g, rx, -40, -4, 5, Gd); ballR(g, rx, -43, 4, Gd);
    if (rx < 440) {
      g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(rx, -36); g.quadraticCurveTo(rx + 55, -16, rx + 110, -36); g.stroke();
      g.strokeStyle = Rp[2]; g.lineWidth = 4; g.stroke(); g.strokeStyle = Rp[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(rx + 4, -38); g.quadraticCurveTo(rx + 55, -19, rx + 106, -38); g.stroke();
    }
  }
};
/** The flower beds round the wheel's feet (still): a stone kerb, the soil, flowers stepped in four colors, little
 *  toadstools between. Local to their left. */
const paintBeds = (g: Ctx) => {
  const St = rampH(STONE, true), Lf = rampH(PINE), F = ['#F472B6', '#FEF08A', '#A5F3FC', '#C8A8F4'];
  box(g, 0, -8, 1400, 8, INK); box(g, 1, -7, 1398, 7, St[3]); box(g, 1, -7, 1398, 1, St[5]);
  for (let x = 1; x < 1400; x += 22) box(g, x, -6, 1, 6, St[1]);
  for (let i = 0; i < 70; i++) {
    const fx = 8 + i * 20 + hash(i) * 6, h = 8 + hash(i * 2) * 8, col = ramp6(F[i % 4]);
    box(g, fx, -8 - h, 2, h, Lf[2]); box(g, fx - 3, -8 - h * 0.5, 3, 2, Lf[3]);
    ballR(g, fx + 1, -10 - h, 4, col.map(x => hour(x)));
    if (i % 9 === 4) { box(g, fx + 8, -14, 3, 6, '#FFF0D8'); g.fillStyle = INK; g.beginPath(); g.ellipse(fx + 9, -14, 6, 4, 0, Math.PI, 0); g.fill(); g.fillStyle = hour('#E11D48'); g.beginPath(); g.ellipse(fx + 9, -14, 5, 3, 0, Math.PI, 0); g.fill(); box(g, fx + 7, -16, 1, 1, '#FFFFFF'); }
  }
};

/** The ground and the plaza's things (behind everything). */
export const drawPlaza = (c: Ctx, state: GameState) => {
  const v = viewOf(state);
  drawFairBack(c, state, v, x0 - 600, x1 + 600);
  drawPaving(c, state, v, x0 - 600, x1 + 600);
  if (onScreen(state, X(2300), X(3700))) still(c, 'wh-beds', X(2300), GY, -4, -30, 1408, 34, paintBeds);
  // (the arch's sign; the ticket kiosk; the queue's ropes)
  if (onScreen(state, X(300), X(700))) storySign(c, X(500), GY, ['THE FAIRY WHEEL', 'TRIAL ONE'], { board: '#6E2A6E' });
  if (onScreen(state, X(820), X(1000))) still(c, 'wh-kiosk', X(900), GY, -62, -190, 124, 194, paintKiosk);
  if (onScreen(state, X(1080), X(1560))) still(c, 'wh-queue', X(1100), GY, -14, -52, 470, 56, paintQueue);
  // (past the far gate: the way on)
  if (onScreen(state, X(5000), X(5400))) storySign(c, X(5200), GY, ['THE ENCHANTED GLEN', 'THIS WAY >'], { board: '#2E5A3A' });
};

/** A gate post (still): dressed stone in courses, a gilt band, a carved heart finial; local to its foot's middle. */
const paintPost = (g: Ctx, Hh: number) => {
  const St = rampH(STONE), Gd = rampH(GOLD), Pk = H6('#F472B6'), S = rampH(SNOW);
  box(g, -17, -12, 34, 12, INK); box(g, -16, -11, 32, 11, St[2]); box(g, -16, -11, 32, 2, St[4]);
  box(g, -15, -Hh - 20, 30, Hh + 8, INK); box(g, -14, -Hh - 19, 28, Hh + 7, St[3]); box(g, -14, -Hh - 19, 5, Hh + 7, St[4]); box(g, 8, -Hh - 19, 6, Hh + 7, St[1]);
  for (let y = -Hh - 10; y < -12; y += 16) { box(g, -14, y, 28, 1, St[2]); box(g, (y / 16) % 2 ? -2 : 4, y - 15, 1, 15, St[2]); }
  box(g, -15, -Hh + 30, 30, 5, Gd[3]); box(g, -15, -Hh + 30, 30, 1, Gd[5]);
  box(g, -18, -Hh - 24, 36, 6, INK); box(g, -17, -Hh - 23, 34, 4, St[4]);
  const hy = -Hh - 36;
  g.fillStyle = INK; g.beginPath(); g.moveTo(0, hy + 14); g.bezierCurveTo(-20, hy, -13, hy - 16, 0, hy - 6); g.bezierCurveTo(13, hy - 16, 20, hy, 0, hy + 14); g.fill();
  g.fillStyle = Pk[2]; g.beginPath(); g.moveTo(0, hy + 11); g.bezierCurveTo(-17, hy, -11, hy - 13, 0, hy - 4); g.bezierCurveTo(11, hy - 13, 17, hy, 0, hy + 11); g.fill();
  g.fillStyle = Pk[4]; g.beginPath(); g.ellipse(-6, hy - 5, 4, 3, -0.6, 0, Math.PI * 2); g.fill(); box(g, -8, hy - 8, 2, 2, '#FFFFFF');
  snowCap(g, -17, -Hh - 23, 34, 3, Hh, S, true);
};
/** A gate: two stone posts with a heart on each, wrought-iron rose gates between them (shut: full height, thorny, and
 *  a pink shimmer of magic up into the sky over them; open: swung back flat against the posts). `open` 0..1. */
export const drawGate = (c: Ctx, state: GameState, rx: number, open: number) => {
  const gx = X(rx), f = state.frame;
  if (!onScreen(state, gx - 120, gx + 120)) return;
  const Hh = 300, W = 90, I = rampH(IRON), Lf = rampH(PINE);
  for (const s of [-1, 1]) still(c, 'wh-gatepost', gx + s * (W / 2 + 12), GY, -24, -Hh - 60, 48, Hh + 64, g => paintPost(g, Hh));
  // (the gates' leaves: shut, they meet in the middle; open, folded back)
  const leaf = (W / 2) * (1 - open * 0.85);
  for (const s of [-1, 1]) {
    const hinge = gx + s * (W / 2), a = hinge, b = hinge - s * leaf, l = Math.min(a, b), r = Math.max(a, b);
    for (let bx = l; bx <= r; bx += 9) { box(c, bx - 1, GY - Hh, 4, Hh, INK); box(c, bx, GY - Hh, 2, Hh, I[3]); box(c, bx, GY - Hh, 1, Hh, I[5]); }
    for (const yy of [GY - Hh, GY - Hh / 2, GY - 20]) { box(c, l, yy - 3, r - l, 6, INK); box(c, l, yy - 2, r - l, 4, I[2]); box(c, l, yy - 2, r - l, 1, I[4]); }
    // (scrolls between the top bars)
    if (r - l > 20) for (let k = 0; k < 2; k++) { const sx = l + (r - l) * (0.3 + k * 0.4), sy = GY - Hh * 0.75; c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.arc(sx, sy, 10, 0.3, Math.PI * 1.8); c.stroke(); c.strokeStyle = I[4]; c.lineWidth = 2; c.stroke(); }
    // (the thorny roses up them: a vine, leaves, roses stepped)
    c.strokeStyle = Lf[1]; c.lineWidth = 2; c.beginPath();
    for (let k = 0; k <= 14; k++) { const vx = l + (r - l) * (0.5 + 0.4 * Math.sin(k * 1.1 + s)), vy = GY - 10 - k * 20; k ? c.lineTo(vx, vy) : c.moveTo(vx, vy); } c.stroke();
    for (let k = 0; k < 9; k++) { const vx = l + (r - l) * (0.5 + 0.4 * Math.sin(k * 1.55 + s)), vy = GY - 26 - k * 32; box(c, vx - 6, vy + 4, 5, 3, Lf[3]); box(c, vx + 2, vy + 3, 5, 3, Lf[4]); ballR(c, vx, vy, 4, H6('#E11D48')); box(c, vx - 4, vy + 8, 2, 2, INK); }
    // (spikes along the top)
    for (let bx = l; bx <= r; bx += 9) { polyF(c, [[bx - 3, GY - Hh], [bx + 1, GY - Hh - 15], [bx + 5, GY - Hh]], INK); polyF(c, [[bx - 1, GY - Hh], [bx + 1, GY - Hh - 11], [bx + 3, GY - Hh]], I[4]); }
  }
  // (shut: the magic up over it, all the way into the sky: banded, sparkles rising)
  if (open < 0.5) {
    const a = 0.26 * (1 - open * 2), top = GY - Hh - 900;
    for (let i = 0; i < 9; i++) { c.globalAlpha = a * (i + 1) / 9; c.fillStyle = '#F472B6'; c.fillRect(gx - W / 2 - 20, top + i * 100, W + 40, 100); }
    c.globalAlpha = 1;
    for (let k = 0; k < 14; k++) { const sy = GY - Hh - ((f * 2 + k * 97) % 900), sx = gx - W / 2 + ((k * 37) % W); box(c, sx, sy, 2, 2, '#FFE4F2'); if (k % 3 === 0) { box(c, sx - 2, sy, 6, 1, '#FFFFFF'); box(c, sx, sy - 2, 1, 6, '#FFFFFF'); } }
  }
};
