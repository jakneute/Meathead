// The enchanted glen's painting helpers (the SNES pass): its depths (one eye over the whole scene: kit.ts's view), its
// materials in six-step ramps, the forest floor going back, and the storybook trees (a giant's foot, roots and all,
// and its trunk going on up out of the picture, painted once for the hour; the round-crowned ones at the meadow's
// edge). Everything here's scenery (dimmed: none of it reads as somewhere to stand).

import { pixelBlob } from '../../intro/art/kit';
import { type Ctx, type View, INK, box, mix, hash, checker, at, polyF, ramp6, rampH, warmGlass } from '../kit';
import { GY } from '../geometry';
import { X, x0, x1, GAP1, GAP2, QUEUE } from './layout';

/** The depths: the back row of giant trees, the undergrowth in front of them, the props along the path, a gorge's far
 *  end, the meadow's far edge, the lair's back wall, the mine's hill, the head frame. */
export const ROW_D = 0.8, UNDER_D = 0.85, PROP_D = 0.93, GORGE_D = 0.7, MEADOW_D = 0.62, LAIR_D = 0.74, MINE_D = 0.9, HEAD_D = 0.84;

/** The stretches (x from the section's start). */
export const MEADOW = { a: GAP2.b, b: 11080 }, LAIR = { a: 11080, b: 13060 }, MINE = { a: 7440, b: GAP2.a }, RIDE = { a: QUEUE.a - 40, b: QUEUE.b + 260 };
export const END = x1 - x0 + 600;
/** Is x (from the section's start) over one of the gorges (with a margin)? */
export const overGap = (rx: number, m = 0) => (rx > GAP1.a - m && rx < GAP1.b + m) || (rx > GAP2.a - m && rx < GAP2.b + m);

/** The glen's materials. */
export const MOSS = ramp6('#4E7E3A'), GRASS = ramp6('#5E9A44'), SOIL = ramp6('#5A3E2C'), PATH = ramp6('#94744E');
export const ROCKG = ramp6('#6E7864'), FIBER = ramp6('#6E6476'), BONE = ramp6('#E2D8BE'), CAPRED = ramp6('#C42828');
export const BARKS = {
  oak: ['#1C120C', '#30201A', '#463024', '#5E4432', '#7C5E46', '#9C7E60'],
  beech: ['#26262E', '#3C3C48', '#545462', '#6E6E7E', '#8E8EA0', '#B2B2C4'],
  birch: ['#34343A', '#646466', '#A4A29A', '#C8C6BC', '#E4E2D8', '#FAF8F0'],
};
export type TreeKind = keyof typeof BARKS;
export const LEAF = ['#122A1E', '#1C3C28', '#285234', '#386C40', '#4E8A50', '#74AA66'];
export const BULB = ['#FFE9A8', '#FFB0D8', '#A8E8FF', '#C8FFB8', '#E8C8FF'];

/** A strip of ground between two depths (world x a..b at height y). */
export const Q = (c: Ctx, v: View, a: number, b: number, d0: number, d1: number, col: string, y = GY) =>
  polyF(c, [at(v.eye, a, y, d0), at(v.eye, b, y, d0), at(v.eye, b, y, d1), at(v.eye, a, y, d1)], col);
/** The world x range of a..b that's on screen at depth d (so nothing off it is drawn). */
export const clipAt = (v: View, a: number, b: number, d: number, m = 60): [number, number] => {
  const L = v.eye.x + (v.cam.x - m - v.eye.x) / d, R = v.eye.x + (v.cam.x + 800 + m - v.eye.x) / d;
  return [Math.max(a, L), Math.min(b, R)];
};

/** A round leafy crown in steps (pixel blobs: shade under, body, lit up and left, a highlight, dithered under). */
export const leafy = (g: Ctx, x: number, y: number, r: number, R: string[], seed: number) => {
  const lumps = 4 + Math.floor(hash(seed) * 3);
  for (let k = 0; k < lumps; k++) { const a = (k / lumps) * Math.PI * 2 + seed; pixelBlob(g, x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.32 + 3, r * 0.62, r * 0.5, R[0]); }
  pixelBlob(g, x, y + 3, r, r * 0.78, R[1]);
  for (let k = 0; k < lumps; k++) { const a = (k / lumps) * Math.PI * 2 + seed; pixelBlob(g, x + Math.cos(a) * r * 0.45 - r * 0.08, y + Math.sin(a) * r * 0.3 - r * 0.1, r * 0.48, r * 0.36, R[2]); }
  pixelBlob(g, x - r * 0.25, y - r * 0.26, r * 0.55, r * 0.4, R[3]);
  pixelBlob(g, x - r * 0.38, y - r * 0.4, r * 0.28, r * 0.18, R[4]);
  for (let k = 0; k < 6; k++) box(g, x - r * 0.6 + hash(seed + k) * r * 1.1, y - r * 0.5 + hash(seed * 3 + k) * r * 0.6, 2, 1, R[5]);
  checker(g, x - r * 0.9, y + r * 0.42, r * 1.8, 2, R[0], 0, 1);
};

/** Bark down a trunk (x0..x0+w, y0..y1): stepped across (lit left, shaded right, dithered seams), grooves, knots. */
const bark = (g: Ctx, x: number, w: number, y0: number, y1: number, R: string[], seed: number, birch: boolean) => {
  const h = y1 - y0;
  box(g, x - 1, y0, w + 2, h, INK);
  box(g, x, y0, w, h, R[3]); box(g, x, y0, Math.round(w * 0.22), h, R[4]); box(g, x + 2, y0, 1, h, R[5]);
  box(g, x + Math.round(w * 0.64), y0, Math.round(w * 0.36), h, R[2]); box(g, x + Math.round(w * 0.82), y0, Math.round(w * 0.18), h, R[1]); box(g, x + w - 2, y0, 2, h, R[0]);
  checker(g, x + Math.round(w * 0.22), y0, 2, h, R[4], 0, 1); checker(g, x + Math.round(w * 0.62), y0, 2, h, R[2], 1, 1); checker(g, x + Math.round(w * 0.8), y0, 2, h, R[1], 0, 1);
  if (birch) {
    for (let y = y0 + 4; y < y1 - 2; y += 6 + Math.floor(hash(y * 0.7 + seed) * 10)) { const bx = x + hash(y + seed) * (w - 10); box(g, bx, y, 4 + hash(y * 2) * 8, 2, R[0]); box(g, bx + 1, y + 2, 3, 1, R[1]); }
    return;
  }
  for (let k = 0; k < Math.floor(w / 7); k++) {
    const gx = x + 4 + k * 7 + Math.round(hash(seed + k) * 2);
    for (let y = y0; y < y1; y += 4) { const wob = Math.round(Math.sin((y + k * 13 + seed) * 0.06) * 1.5); box(g, gx + wob, y, 1, 4, k * 7 < w * 0.6 ? R[2] : R[1]); if (hash(y * 0.13 + k + seed) > 0.86) box(g, gx + wob + 1, y, 2, 2, R[k * 7 < w * 0.3 ? 5 : 4]); }
  }
};

/** A giant tree's foot (its x the trunk's middle, the ground at 0; up to -420): the flare and the roots over the moss,
 *  the bark, moss up the shaded side, ivy on some, bracket fungi, and one of: a fairy door (lit inside), a hollow with
 *  an owl's eyes in it, a carved heart; toadstools and ferns at its roots. `R` its bark's ramp (for the hour). */
export const paintTreeFoot = (g: Ctx, w: number, kind: TreeKind, seed: number, R: string[], M: string[], scenery = true) => {
  const L = rampH(LEAF, scenery), Cap = rampH(CAPRED, scenery), birch = kind === 'birch', half = w / 2;
  // (the flare and the roots, out over the ground)
  const flare: [number, number][] = [[-half, -90], [half, -90], [half + 10, -40], [half + 30, -12], [half + 52, 0], [-half - 52, 0], [-half - 30, -12], [-half - 10, -40]];
  polyF(g, flare.map(([x, y]) => [x + (x < 0 ? -1 : 1), y - 1] as [number, number]), INK);
  polyF(g, flare, R[3]);
  polyF(g, [[-half, -90], [-half + w * 0.25, -90], [-half - 6, -14], [-half - 46, 0], [-half - 52, 0], [-half - 30, -12], [-half - 10, -40]], R[4]);
  polyF(g, [[half - w * 0.3, -90], [half, -90], [half + 10, -40], [half + 30, -12], [half + 52, 0], [half - 4, 0]], R[2]);
  for (const [rx, rl, s] of [[-half - 20, 40, -1], [half + 16, 46, 1], [-6, 30, 1]] as const) {
    g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(rx, -10); g.quadraticCurveTo(rx + s * rl * 0.5, -14, rx + s * rl, 0); g.stroke();
    g.strokeStyle = R[3]; g.lineWidth = 6; g.stroke(); g.strokeStyle = R[4]; g.lineWidth = 1.5; g.beginPath(); g.moveTo(rx, -13); g.quadraticCurveTo(rx + s * rl * 0.5, -17, rx + s * rl, -3); g.stroke();
  }
  bark(g, -half, w, -420, -88, R, seed, birch);
  // (moss up the shaded side, dithered off)
  if (!birch) { box(g, half - w * 0.3, -200, w * 0.3, 112, M[2]); checker(g, half - w * 0.38, -200, w * 0.1, 112, M[2], 0, 1); box(g, half - w * 0.3, -200, w * 0.3, 2, M[3]); for (let k = 0; k < 6; k++) box(g, half - w * 0.28 + hash(seed + k) * w * 0.24, -196 + k * 18, 3, 2, M[4]); }
  // (ivy up some)
  if (seed % 3 === 1) for (let y = -60; y > -420; y -= 6) { const ix = Math.sin(y * 0.05 + seed) * half * 0.6; box(g, ix - 2, y, 4, 4, L[2]); box(g, ix - 2, y, 2, 2, L[4]); if (Math.floor(-y / 6) % 4 === 0) box(g, ix + 3, y + 2, 3, 3, L[3]); }
  // (bracket fungi off the side)
  for (let k = 0; k < 3; k++) {
    const fy = -150 - hash(seed + k * 7) * 230, fx = k % 2 ? -half - 8 : half - 6, fw = 16 + hash(seed * 2 + k) * 10;
    polyF(g, [[fx, fy], [fx + fw, fy], [fx + fw - 3, fy + 5], [fx + 3, fy + 5]], INK);
    box(g, fx + 1, fy + 1, fw - 2, 3, scenery ? rampH(ramp6('#D8B888'), true)[3] : '#D8B888'); box(g, fx + 1, fy + 1, fw - 2, 1, rampH(ramp6('#D8B888'), scenery)[5]); box(g, fx + 3, fy + 4, fw - 6, 1, rampH(ramp6('#D8B888'), scenery)[1]);
  }
  // (the feature)
  const feat = seed % 4;
  if (feat === 0 && w > 70) {
    // (a fairy door: an arched door in a painted frame, its round window lit, a step of pebbles, a lantern on a hook)
    const D = rampH(ramp6(['#8A2A5A', '#2A6A6A', '#6A3A8A', '#2A4A8A'][((Math.floor(seed) % 4) + 4) % 4]), scenery), G = warmGlass();
    const dx = -6, dy = -92, dw = 26, dh = 40;
    g.fillStyle = INK; g.beginPath(); g.moveTo(dx - dw / 2 - 3, dy); g.lineTo(dx - dw / 2 - 3, dy - dh + dw / 2); g.arc(dx, dy - dh + dw / 2, dw / 2 + 3, Math.PI, 0); g.lineTo(dx + dw / 2 + 3, dy); g.closePath(); g.fill();
    g.fillStyle = R[1]; g.beginPath(); g.moveTo(dx - dw / 2 - 2, dy); g.lineTo(dx - dw / 2 - 2, dy - dh + dw / 2); g.arc(dx, dy - dh + dw / 2, dw / 2 + 2, Math.PI, 0); g.lineTo(dx + dw / 2 + 2, dy); g.closePath(); g.fill();
    g.fillStyle = D[3]; g.beginPath(); g.moveTo(dx - dw / 2, dy); g.lineTo(dx - dw / 2, dy - dh + dw / 2); g.arc(dx, dy - dh + dw / 2, dw / 2, Math.PI, 0); g.lineTo(dx + dw / 2, dy); g.closePath(); g.fill();
    box(g, dx - dw / 2, dy - dh + 6, 3, dh - 6, D[4]); box(g, dx + dw / 2 - 4, dy - dh + 6, 4, dh - 6, D[2]);
    for (let k = 1; k < 3; k++) box(g, dx - dw / 2, dy - k * 12, dw, 1, D[1]);
    g.fillStyle = INK; g.beginPath(); g.arc(dx, dy - dh + 12, 6, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 3; i++) { g.fillStyle = G[3 + i]; g.beginPath(); g.arc(dx - i * 0.6, dy - dh + 12 - i * 0.6, 5 - i * 1.5, 0, Math.PI * 2); g.fill(); }
    box(g, dx - 1, dy - dh + 7, 1, 10, INK); box(g, dx - 5, dy - dh + 12, 10, 1, INK);
    box(g, dx + 7, dy - 18, 2, 2, rampH(ramp6('#E0AE3A'), scenery)[4]);
    for (let k = 0; k < 4; k++) { box(g, dx - 14 + k * 8, dy - 2, 7, 3, INK); box(g, dx - 13 + k * 8, dy - 1, 5, 2, rampH(ramp6('#9A94AE'), scenery)[3 + (k % 2)]); }
    box(g, dx + dw / 2 + 6, dy - 34, 6, 1, INK); box(g, dx + dw / 2 + 10, dy - 33, 1, 4, INK);
    box(g, dx + dw / 2 + 7, dy - 29, 7, 9, INK); box(g, dx + dw / 2 + 8, dy - 28, 5, 7, G[4]); box(g, dx + dw / 2 + 8, dy - 28, 5, 2, G[5]);
  } else if (feat === 1 && !birch) {
    // (a hollow: dark, its lip rounded, an owl's eyes in it)
    const hy = -200 - (seed % 3) * 30;
    g.fillStyle = INK; g.beginPath(); g.ellipse(-4, hy, 15, 22, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = R[1]; g.beginPath(); g.ellipse(-4, hy, 13, 20, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = R[0]; g.beginPath(); g.ellipse(-3, hy + 2, 10, 17, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#0A0608'; g.beginPath(); g.ellipse(-2, hy + 3, 8, 14, 0, 0, Math.PI * 2); g.fill();
    box(g, -10, hy - 20, 10, 2, R[4]);
    for (const ox of [-6, 2]) { box(g, ox, hy - 2, 4, 4, '#F2D24A'); box(g, ox + 1, hy - 1, 2, 2, INK); }
    box(g, -3, hy + 3, 2, 2, '#C8964A');
  } else if (feat === 2 && !birch) {
    // (a heart carved in the bark)
    const hx = -4, hy = -170;
    g.strokeStyle = R[0]; g.lineWidth = 2; g.beginPath(); g.moveTo(hx, hy + 9); g.bezierCurveTo(hx - 14, hy, hx - 7, hy - 11, hx, hy - 4); g.bezierCurveTo(hx + 7, hy - 11, hx + 14, hy, hx, hy + 9); g.stroke();
    g.strokeStyle = R[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(hx, hy + 10); g.bezierCurveTo(hx - 14, hy + 1, hx - 7, hy - 10, hx, hy - 3); g.stroke();
    box(g, hx - 1, hy - 1, 2, 5, R[0]);
  }
  // (toadstools and ferns round its roots)
  for (let k = 0; k < 3; k++) {
    const mx = (k - 1) * (half + 18) + hash(seed + k * 3) * 12, s = 0.7 + hash(seed * 5 + k) * 0.6;
    if (hash(seed * 7 + k) > 0.45) {
      box(g, mx - 3 * s, -11 * s, 6 * s, 11 * s, INK); box(g, mx - 2 * s, -11 * s, 4 * s, 11 * s, rampH(ramp6('#EAE0C6'), scenery)[3]);
      g.fillStyle = INK; g.beginPath(); g.ellipse(mx, -11 * s, 10 * s, 7 * s, 0, Math.PI, 0); g.fill();
      g.fillStyle = Cap[3]; g.beginPath(); g.ellipse(mx, -11 * s - 0.5, 9 * s, 6 * s, 0, Math.PI, 0); g.fill();
      g.fillStyle = Cap[4]; g.beginPath(); g.ellipse(mx - 3 * s, -14 * s, 4 * s, 2.5 * s, 0, 0, Math.PI * 2); g.fill();
      box(g, mx + 2 * s, -14 * s, 2, 2, '#FFF2E0'); box(g, mx - 5 * s, -13 * s, 2, 2, '#FFF2E0');
    } else for (let f = -2; f <= 2; f++) polyF(g, [[mx, 0], [mx + f * 8, -16 + Math.abs(f) * 4], [mx + f * 6 + 2, 0]], L[2 + (f & 1)]);
  }
};

/** A stretch of a giant's trunk (300 tall, its foot at 0) to go on up over the foot, stamp over stamp. */
export const paintTrunk = (g: Ctx, w: number, kind: TreeKind, seed: number, R: string[], scenery = true) => {
  bark(g, -w / 2, w, -300, 0, R, seed, kind === 'birch');
  const L = rampH(LEAF, scenery);
  if (seed % 3 === 1) for (let y = 0; y > -300; y -= 6) { const ix = Math.sin(y * 0.05 + seed) * w * 0.3; box(g, ix - 2, y, 4, 4, L[2]); box(g, ix - 2, y, 2, 2, L[4]); }
};

/** A bough off a giant (its root on the trunk's side at 0, 0, out `s` side): a crooked limb, leaves on it. */
export const paintBough = (g: Ctx, s: 1 | -1, len: number, R: string[], seed: number, scenery = true) => {
  const L = rampH(LEAF, scenery), ex = s * len, ey = -30 - hash(seed) * 30;
  g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.moveTo(0, 20); g.quadraticCurveTo(s * len * 0.4, -10, ex, ey); g.stroke();
  g.strokeStyle = R[2]; g.lineWidth = 13; g.stroke();
  g.strokeStyle = R[4]; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 14); g.quadraticCurveTo(s * len * 0.4, -16, ex, ey - 4); g.stroke();
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(s * len * 0.6, -12); g.quadraticCurveTo(s * len * 0.75, -50, s * len * 0.7, -80); g.stroke();
  g.strokeStyle = R[3]; g.lineWidth = 4; g.stroke();
  leafy(g, ex, ey - 10, 42, L, seed);
  leafy(g, s * len * 0.7, -86, 30, L, seed + 2);
  leafy(g, s * len * 0.35, -30, 24, L, seed + 4);
};

/** A round-crowned tree at the meadow's edge (its foot at 0): a short trunk, a big crown, blossom on some. */
export const paintRoundTree = (g: Ctx, seed: number, scenery = true) => {
  const R = rampH(BARKS.oak, scenery), blossom = seed % 3 === 0;
  const L = rampH(blossom ? ramp6('#C27AA4') : seed % 3 === 1 ? LEAF : ramp6('#4E8A3A'), scenery);
  bark(g, -9, 18, -150, 0, R, seed, false);
  polyF(g, [[-9, -30], [9, -30], [22, 0], [-22, 0]], R[2]);
  leafy(g, -36, -150, 46, L, seed); leafy(g, 34, -150, 48, L, seed + 1); leafy(g, 0, -196, 62, L, seed + 2);
  if (blossom) for (let k = 0; k < 18; k++) box(g, -70 + hash(seed + k) * 140, -240 + hash(seed * 2 + k) * 110, 2, 2, mix(L[5], '#FFFFFF', 0.4));
};

/** The back row's giants: where they stand (x from the section's start), how wide, which, and a bough off some. */
export interface Giant { rx: number; w: number; kind: TreeKind; seed: number; bough: 0 | 1 | -1 }
export const GIANTS: Giant[] = (() => {
  const out: Giant[] = [];
  for (let rx = -200, i = 0; rx < END; i++) {
    const s = i * 7 + 11, t = hash(s);
    const kind: TreeKind = t > 0.8 ? 'birch' : t > 0.5 ? 'beech' : 'oak';
    const w = kind === 'birch' ? 44 + hash(s * 2) * 16 : 74 + hash(s * 2) * 46;
    const skip = overGap(rx, 120) || (rx > MEADOW.a - 60 && rx < MEADOW.b) || (rx > LAIR.a - 40 && rx < LAIR.b + 60);
    if (!skip) out.push({ rx, w, kind, seed: s, bough: hash(s * 9) > 0.55 ? (hash(s * 4) > 0.5 ? 1 : -1) : 0 });
    rx += 250 + hash(s * 3) * 150;
  }
  return out;
})();
export const giantX = (t: Giant) => X(t.rx);
