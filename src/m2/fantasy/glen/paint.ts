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

/** A leaf clump in stepped masses (the SNES pass): a dark mass under it all, lumps over it (each shaded under, its body,
 *  lit up and left), leaf flecks catching the light, gaps of shadow through it, the underside dithered off. `R` any
 *  ramp, darkest first (four steps or more). */
export const leafMass = (g: Ctx, x: number, y: number, r: number, R: string[], seed: number) => {
  const t = (k: number) => R[Math.round((k * (R.length - 1)) / 4)];
  const n = 5 + Math.floor(hash(seed) * 3), lumps: [number, number, number][] = [];
  for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2 + seed * 0.7, d = 0.42 + hash(seed + k * 2.3) * 0.18; lumps.push([x + Math.cos(a) * r * d, y + Math.sin(a) * r * d * 0.62, r * (0.42 + hash(seed * 3 + k) * 0.16)]); }
  lumps.push([x - r * 0.1, y - r * 0.22, r * 0.5]);
  lumps.sort((a, b) => a[1] - b[1]);
  pixelBlob(g, x, y + r * 0.1, r, r * 0.74, t(0));
  for (const [lx, ly, lr] of lumps) pixelBlob(g, lx, ly + 2, lr, lr * 0.8, t(0));
  for (const [lx, ly, lr] of lumps) {
    pixelBlob(g, lx, ly, lr * 0.92, lr * 0.74, t(1));
    pixelBlob(g, lx - lr * 0.18, ly - lr * 0.2, lr * 0.62, lr * 0.46, t(2));
    if (lx - x + (ly - y) * 1.4 < r * 0.15) pixelBlob(g, lx - lr * 0.3, ly - lr * 0.34, lr * 0.32, lr * 0.2, t(3));
  }
  // (leaves: little V's in the light up top, darker ones down the shaded side)
  const m = Math.round(r * 0.9);
  for (let k = 0; k < m; k++) {
    const fx = x + (hash(seed * 5 + k) - 0.5) * r * 1.6, fy = y + (hash(seed * 7 + k) - 0.55) * r * 1.1, up = fx - x + (fy - y) * 1.5 < 0;
    box(g, fx, fy, 1, 1, up ? t(4) : t(2)); box(g, fx + 1, fy - 1, 1, 1, up ? t(3) : t(1));
  }
  for (let k = 0; k < 3 + Math.floor(r / 14); k++) box(g, x + (hash(seed * 11 + k) - 0.4) * r * 1.1, y + hash(seed * 13 + k) * r * 0.45, 2, 2, t(0));
  checker(g, x - r * 0.8, y + r * 0.52, r * 1.6, 2, t(0), 0, 1);
};

/** A limb along a path (P: 0 at its root, 1 at its tip), thick at the root, tapering to the tip: inked, its bark, shade
 *  under it, light along its top. `R` a six-step ramp. */
export const limb = (g: Ctx, P: (t: number) => [number, number], w0: number, w1: number, R: string[], ink = INK, n = 12) => {
  g.lineCap = 'round';
  for (let pass = 0; pass < 4; pass++) {
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n, w = w0 + (w1 - w0) * (t0 + t1) / 2, [ax, ay] = P(t0), [bx, by] = P(t1);
      if (pass > 1 && w < 2.5) continue;
      const col = pass === 0 ? ink : pass === 1 ? R[2] : pass === 2 ? R[1] : R[4];
      const lw = pass === 0 ? w + 2.5 : pass === 1 ? w : Math.max(1, w * (pass === 2 ? 0.3 : 0.26));
      const dy = pass === 2 ? w * 0.3 : pass === 3 ? -w * 0.28 : 0;
      g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(ax, ay + dy); g.lineTo(bx, by + dy); g.stroke();
    }
  }
  g.lineCap = 'butt';
};
/** A quadratic path (for limb). */
export const quad = (ax: number, ay: number, cx: number, cy: number, bx: number, by: number) => (t: number): [number, number] =>
  [(1 - t) * (1 - t) * ax + 2 * (1 - t) * t * cx + t * t * bx, (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * cy + t * t * by];
/** A knot in the bark: the swelling round it shaded, its lip lit up and left, the hole dark. */
export const knot = (g: Ctx, kx: number, ky: number, r: number, R: string[]) => {
  const e = (dx: number, dy: number, rx: number, ry: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(Math.round(kx + dx), Math.round(ky + dy), rx, ry, 0, 0, Math.PI * 2); g.fill(); };
  e(1, 1, r + 2, r * 1.4 + 2, R[1]); e(-1, -1, r + 1, r * 1.4, R[4]); e(0, 0, r, r * 1.3, R[2]); e(0.5, 0.8, r * 0.55, r * 0.85, R[0]);
  box(g, kx - r * 0.5, ky - r * 1.1, 2, 1, R[5]);
};

/** Bark down a trunk (x0..x0+w, y0..y1): stepped across (lit left, its core shadow, light thrown back up off the forest
 *  floor down its right, dithered seams), grooves and the cracks across the plates, knots (birch: its black marks). */
const bark = (g: Ctx, x: number, w: number, y0: number, y1: number, R: string[], seed: number, birch: boolean) => {
  const h = y1 - y0, q = (f: number) => Math.round(w * f);
  box(g, x - 1, y0, w + 2, h, INK);
  box(g, x, y0, w, h, R[3]); box(g, x, y0, q(0.22), h, R[4]); box(g, x + 2, y0, 1, h, R[5]);
  box(g, x + q(0.6), y0, q(0.14), h, R[2]); box(g, x + q(0.74), y0, q(0.14), h, R[1]); box(g, x + q(0.88), y0, w - q(0.88) - 1, h, R[2]); box(g, x + w - 1, y0, 1, h, R[0]);
  checker(g, x + q(0.22), y0, 2, h, R[4], 0, 1); checker(g, x + q(0.58), y0, 2, h, R[2], 1, 1); checker(g, x + q(0.72), y0, 2, h, R[1], 0, 1); checker(g, x + q(0.86), y0, 2, h, R[2], 1, 1);
  if (birch) {
    for (let y = y0 + 4; y < y1 - 2; y += 6 + Math.floor(hash(y * 0.7 + seed) * 10)) { const bx = x + hash(y + seed) * (w - 10); box(g, bx, y, 4 + hash(y * 2) * 8, 2, R[0]); box(g, bx + 1, y + 2, 3, 1, R[1]); }
    // (the black chevrons where twigs were, curls of bark peeling)
    for (let k = 0; k < Math.floor(h / 120); k++) { const cy = y0 + 40 + hash(seed + k * 5) * (h - 80), cx = x + w * (0.3 + hash(seed * 3 + k) * 0.3); for (let i = 0; i < 5; i++) { box(g, cx - i * 2, cy + i, 2, 1, R[0]); box(g, cx + i * 2, cy + i, 2, 1, R[0]); } box(g, cx - 1, cy + 1, 2, 4, R[1]); }
    for (let k = 0; k < Math.floor(h / 90); k++) { const py = y0 + 20 + hash(seed * 7 + k) * (h - 40), px = x + w * (0.1 + hash(seed + k * 9) * 0.5); box(g, px, py, 6, 2, R[5]); box(g, px + 1, py + 2, 4, 1, R[2]); }
    return;
  }
  for (let k = 0; k < Math.floor(w / 7); k++) {
    const gx = x + 4 + k * 7 + Math.round(hash(seed + k) * 2);
    for (let y = y0; y < y1; y += 4) {
      const wob = Math.round(Math.sin((y + k * 13 + seed) * 0.06) * 1.5), r = hash(y * 0.13 + k + seed);
      box(g, gx + wob, y, 1, 4, k * 7 < w * 0.6 ? R[2] : R[1]);
      if (r > 0.86) box(g, gx + wob + 1, y, 2, 2, R[k * 7 < w * 0.3 ? 5 : 4]);
      else if (r < 0.05 && k * 7 + 9 < w) { box(g, gx + wob + 1, y, 5, 1, R[1]); box(g, gx + wob + 1, y + 1, 5, 1, R[k * 7 < w * 0.5 ? 4 : 2]); }
    }
  }
  if (h >= 200) for (let k = 0; k < 2; k++) if (hash(seed * 17 + k) > 0.35) knot(g, x + w * (0.25 + hash(seed * 19 + k) * 0.4), y0 + 30 + hash(seed * 23 + k) * (h - 60), 3 + hash(seed + k) * 3, R);
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

/** A bough off a giant (its root on the trunk's side at 0, 0, out `s` side): a crooked limb tapering out to its tip, a
 *  fork up off it and a twig down, each into a clump of leaves in stepped masses; a lantern hung off some. */
export const paintBough = (g: Ctx, s: 1 | -1, len: number, R: string[], seed: number, scenery = true) => {
  const L = rampH(LEAF, scenery), ex = s * len, ey = -30 - hash(seed) * 30;
  const main = quad(0, 20, s * len * 0.4, -10, ex, ey);
  const [fx, fy] = main(0.58), [tx, ty] = main(0.3);
  const fork = quad(fx, fy, s * len * 0.75, -50, s * len * 0.7, -80);
  const twig = quad(tx, ty, tx + s * len * 0.12, ty + 4, tx + s * len * 0.2, ty - 14);
  limb(g, twig, 5, 1.5, R, INK, 6);
  limb(g, fork, 8, 2, R, INK, 8);
  limb(g, main, 16, 3, R, INK, 12);
  // (the bark's grooves along it, a knot where it forks)
  for (let k = 1; k < 9; k++) { const [px, py] = main(k / 10); box(g, px - 1, py - 1, 3, 1, R[1]); }
  knot(g, fx - s * 2, fy + 1, 2, R);
  if (seed % 4 === 0) {
    // (a lantern hung off it on a chain)
    const [lx, ly] = main(0.72), G = warmGlass(), I = rampH(ramp6('#36344E'), scenery);
    for (let y = ly + 4; y < ly + 26; y += 3) box(g, lx, y, 1, 2, I[3]);
    polyF(g, [[lx - 6, ly + 27], [lx + 7, ly + 27], [lx + 4, ly + 23], [lx - 3, ly + 23]], I[2]);
    box(g, lx - 6, ly + 27, 13, 15, INK); for (let i = 0; i < 3; i++) box(g, lx - 5, ly + 28 + i * 4, 11, 4, G[5 - i]); box(g, lx, ly + 28, 1, 13, I[3]); box(g, lx - 7, ly + 41, 15, 3, I[2]);
  }
  leafMass(g, tx + s * len * 0.2, ty - 22, 22, L, seed + 4);
  leafMass(g, s * len * 0.7, -90, 30, L, seed + 2);
  leafMass(g, ex, ey - 12, 42, L, seed);
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
