// THE ARENA: the castle grounds as a free-range sky (the user's "free range", not a track), and the mode-7 trickery
// that draws it. One eye: the camera behind him, everything projected through it (the ground plane, the castle, the
// towers, the suitors, the shots), culled by what that eye really sees.
//
// World: x east, z north, alt up (units; a suitor's about 100 tall). The GREAT PIXIE'S CASTLE stands in the middle at
// (0, 0), Piper's window lit up its spire (monument.ts PIPER_WINDOW): the goal, sealed till the last suitor's dead.
// Round it, out to the park's edge: the drained moat, the ring path and the avenues, the royal gardens (hedges, roses,
// fountains), the broom port's deck, the glen's forest (north-west), six watchtowers, banner poles, Piper's hot-air
// balloons drifting. At WALL_R the park's MAGIC WALL (a pink shimmer: it turns him back). Past it, the park beyond:
// Hogsmeat's snowy roofs, Truelling Tragons' three tracks, the fairy wheel, the lake. No volcanoes.
//
// The ground's ONE TEXTURE (1024 px, 12 units a texel), painted once for the hour (its colors multiplied by the hour's
// light), with two smaller copies (averaged) for the far rows so they don't shimmer; sampled a scanline at a time into
// a 400x300 image (the mode 7 way: each row's distance from the eye's height and the row's drop under the horizon),
// blown up 2x onto the screen. The sky: a banded gradient, a ring of far hills and clouds that wraps with his heading,
// slid up and down with the horizon as he climbs and dives.

import { timeOfDay, multiply, skyAt, drawTodSky, cloudTint, type TimeOfDay } from '../../timeOfDay';
import { mix, hash } from '../kit';
import { drawCastleAt, PIPER_WINDOW } from '../monument';

type Ctx = CanvasRenderingContext2D;

export const W = 400, H = 300, HORIZON = 112, FOCAL = 230;
/** The camera: behind him and above. */
export const CAM_BACK = 240, CAM_UP = 62;
/** The park's magic wall; how low (skimming's fine) and how high he can go. */
export const WALL_R = 5000, MIN_ALT = 40, MAX_ALT = 2700;
/** The drained moat's ring. */
export const MOAT: readonly [number, number] = [600, 720];
/** Castle art px to world units (monument.ts paints it ~470 px tall: ~1700 units here). */
export const CASTLE_U = 3.6;
/** Piper's window, in the world: up the spire (the castle's a billboard: it always faces him). */
export const WINDOW = { alt: -PIPER_WINDOW.y * CASTLE_U, side: PIPER_WINDOW.x * CASTLE_U, w: 16 * CASTLE_U, h: 26 * CASTLE_U };

const TS = 1024, TEXEL = 12, HALF = (TS * TEXEL) / 2;
const FAR = 10000;

// ---------------------------------------------------------------------------------------------------------------
// What stands in the arena

/** Something solid (the castle, a tower): its middle, and its profile up (each [top alt, radius], lowest first). */
export interface Solid { x: number; z: number; prof: [number, number][]; kind: 'castle' | 'tower'; i: number }
const at = (deg: number, r: number) => ({ x: Math.sin((deg * Math.PI) / 180) * r, z: Math.cos((deg * Math.PI) / 180) * r });

export const TOWERS = [[25, 2300], [85, 3100], [140, 2500], [235, 3200], [280, 2100], [330, 2900]].map(([d, r], i) => ({ ...at(d, r), i }));
export const SOLIDS: Solid[] = [
  { x: 0, z: 0, prof: [[480, 560], [1180, 300], [1650, 90]], kind: 'castle', i: -1 },
  ...TOWERS.map(t => ({ x: t.x, z: t.z, prof: [[900, 110], [1250, 60]] as [number, number][], kind: 'tower' as const, i: t.i })),
];
/** How wide a solid is at that height (0: over it). */
export const radiusAt = (s: Solid, alt: number) => { for (const [top, r] of s.prof) if (alt < top) return r; return 0; };
export const topOf = (s: Solid) => s.prof[s.prof.length - 1][0];
/** The solid he'd be inside at (x, z, alt), padded. */
export const solidAt = (x: number, z: number, alt: number, pad = 0): Solid | null => {
  for (const s of SOLIDS) {
    const r = radiusAt(s, alt);
    if (r <= 0) continue;
    const dx = x - s.x, dz = z - s.z;
    if (dx * dx + dz * dz < (r + pad) * (r + pad)) return s;
  }
  return null;
};

/** The banner poles round the ring path. */
export const FLAGS = Array.from({ length: 12 }, (_, i) => ({ ...at(15 + i * 30, 960), i }));
/** Piper's hot-air balloons: round and round, slow, at their heights. */
export const BALLOONS = [
  { r: 1700, a0: 0.4, w: 0.0005, alt: 1150 }, { r: 3200, a0: 2.1, w: -0.0003, alt: 1650 }, { r: 2600, a0: 3.9, w: 0.0004, alt: 900 },
  { r: 4100, a0: 5.0, w: 0.00025, alt: 1900 }, { r: 3600, a0: 1.2, w: -0.00035, alt: 1350 },
];
export const balloonAt = (b: (typeof BALLOONS)[number], f: number) => { const a = b.a0 + f * b.w; return { x: Math.sin(a) * b.r, z: Math.cos(a) * b.r, alt: b.alt + Math.sin(f * 0.01 + b.a0) * 40 }; };
/** The glen's forest (north-west) and a few by the wall: fairy pines and round trees (scenery: he flies through them). */
export const TREES: { x: number; z: number; h: number; k: number }[] = (() => {
  const out: { x: number; z: number; h: number; k: number }[] = [];
  for (let i = 0; i < 48; i++) { const d = -84 + hash(i * 3.1) * 72, r = 2700 + hash(i * 5.7) * 2200; out.push({ ...at(d, r), h: 300 + hash(i * 2.3) * 220, k: hash(i * 7.9) < 0.7 ? 0 : 1 }); }
  for (let i = 0; i < 14; i++) { const d = 20 + i * 24 + hash(i * 9.1) * 10, r = 4650 + hash(i * 4.4) * 250; if (d > 270) continue; out.push({ ...at(d, r), h: 280 + hash(i * 1.7) * 160, k: i % 3 === 0 ? 1 : 0 }); }
  return out;
})();

// ---------------------------------------------------------------------------------------------------------------
// The eye

export interface View { cx: number; cz: number; calt: number; fx: number; fz: number; rx: number; rz: number; hy: number; F: number }
export const view: View = { cx: 0, cz: 0, calt: 100, fx: 0, fz: 1, rx: 1, rz: 0, hy: HORIZON, F: FOCAL };
/** The eye at (x, z, alt) looking along `yaw`, the horizon at `hy`, focal length F. */
export const setView = (x: number, z: number, alt: number, yaw: number, hy: number, F: number) => {
  view.cx = x; view.cz = z; view.calt = alt; view.fx = Math.sin(yaw); view.fz = Math.cos(yaw); view.rx = Math.cos(yaw); view.rz = -Math.sin(yaw); view.hy = hy; view.F = F;
};
/** Where a point lands on the 400x300 view: x, y, the scale (px a unit), depth; ok false behind the eye. */
export interface Proj { ok: boolean; sx: number; sy: number; s: number; d: number }
export const project = (x: number, z: number, alt: number, out: Proj): Proj => {
  const dx = x - view.cx, dz = z - view.cz, d = dx * view.fx + dz * view.fz;
  if (d < 14) { out.ok = false; out.d = d; out.sx = W / 2 + (dx * view.rx + dz * view.rz > 0 ? 1e4 : -1e4); out.sy = H; out.s = 0; return out; }
  const s = view.F / d;
  out.ok = true; out.d = d; out.s = s;
  out.sx = W / 2 + (dx * view.rx + dz * view.rz) * s;
  out.sy = view.hy + (view.calt - alt) * s;
  return out;
};
/** On the view (with a margin), for culling by what the eye really sees. */
export const seen = (p: Proj, halfW: number, up: number, down = 0) => p.ok && p.sx + halfW > -8 && p.sx - halfW < W + 8 && p.sy + down > -8 && p.sy - up < H + 8;

// ---------------------------------------------------------------------------------------------------------------
// The ground texture

const T = (x: number, z: number): [number, number] => [(x + HALF) / TEXEL, (HALF - z) / TEXEL];
const R = (r: number) => r / TEXEL;

const paintGround = (g: Ctx) => {
  const C = (cx: number, cz: number, r: number, col: string) => { const [u, v] = T(cx, cz); g.fillStyle = col; g.beginPath(); g.arc(u, v, R(r), 0, Math.PI * 2); g.fill(); };
  const E = (cx: number, cz: number, rx: number, rz: number, col: string) => { const [u, v] = T(cx, cz); g.fillStyle = col; g.beginPath(); g.ellipse(u, v, R(rx), R(rz), 0, 0, Math.PI * 2); g.fill(); };
  const rect = (cx: number, cz: number, w: number, h: number, col: string) => { const [u, v] = T(cx - w / 2, cz + h / 2); g.fillStyle = col; g.fillRect(Math.round(u), Math.round(v), Math.max(1, Math.round(R(w))), Math.max(1, Math.round(R(h)))); };
  const ring = (r: number, w: number, col: string) => { const [u, v] = T(0, 0); g.strokeStyle = col; g.lineWidth = R(w); g.beginPath(); g.arc(u, v, R(r), 0, Math.PI * 2); g.stroke(); };
  // THE PARK BEYOND (under everything): darker, snowier ground
  g.fillStyle = '#3C6634'; g.fillRect(0, 0, TS, TS);
  for (let i = 0; i < 2600; i++) { const u = hash(i * 1.37) * TS, v = hash(i * 2.11) * TS; g.fillStyle = i % 3 ? '#E8EEF6' : '#C8D4E4'; g.fillRect(Math.round(u), Math.round(v), 2, 1); }
  // (the lake to the north, beyond the wall)
  E(-400, 5800, 1500, 380, '#2E5E9A'); E(-400, 5800, 1400, 300, '#3E78B8'); E(-700, 5850, 500, 80, '#7AAEDC');
  // (Hogsmeat's roofs, south-west: snowy, crooked, chimneys)
  for (let i = 0; i < 70; i++) {
    const a = 196 + hash(i * 3.3) * 50, r = 5250 + hash(i * 1.9) * 850, p = at(a, r), w = 90 + hash(i * 4.1) * 110, h = 70 + hash(i * 6.3) * 80;
    rect(p.x + 14, p.z - 14, w, h, '#22301E'); rect(p.x, p.z, w, h, i % 4 ? '#F2F6FC' : '#7A4A2E'); rect(p.x - w / 4, p.z, w / 2, h, i % 4 ? '#D2DCEC' : '#5A3420');
    if (i % 3 === 0) rect(p.x + w / 3, p.z + h / 3, 20, 20, '#6A3A2A');
  }
  // (Truelling Tragons' three tracks, east: never crossing; the fairy wheel south-east, its long shadow)
  const cols = ['#FACC15', '#EF4444', '#60A5FA'];
  cols.forEach((col, k) => {
    g.strokeStyle = '#1A1028'; g.lineWidth = 4; g.beginPath();
    for (let s = 0; s <= 60; s++) { const z = -1400 + s * 60, x = 5500 + k * 170 + Math.sin(s * 0.3 + k) * 140; const [u, v] = T(x, z); if (s) g.lineTo(u, v); else g.moveTo(u, v); }
    g.stroke(); g.strokeStyle = col; g.lineWidth = 2; g.stroke();
  });
  E(4300, -4400, 520, 90, '#2A4626'); rect(4300, -4400, 1100, 40, '#E8A8D8'); C(4300, -4400, 70, '#F6D365');
  // THE ARENA: a disc of mown lawn in stripes
  const [ou, ov] = T(0, 0);
  g.save(); g.beginPath(); g.arc(ou, ov, R(WALL_R), 0, Math.PI * 2); g.clip();
  g.fillStyle = '#4C8A3A'; g.fillRect(0, 0, TS, TS);
  for (let u = 0; u < TS; u += 12) { g.fillStyle = '#56963F'; g.fillRect(u, 0, 6, TS); }
  // (the glen's forest, north-west: canopy on canopy, toadstools in its clearings)
  for (let i = 0; i < 900; i++) {
    const a = -92 + hash(i * 2.7) * 88, r = 2500 + hash(i * 1.3) * 2700, p = at(a, r), rr = 60 + hash(i * 5.1) * 90;
    C(p.x + 20, p.z - 20, rr, '#1E3A1E'); C(p.x, p.z, rr, i % 2 ? '#2A5428' : '#346A30'); C(p.x - rr * 0.3, p.z + rr * 0.3, rr * 0.4, '#4A8A3E');
  }
  for (let i = 0; i < 40; i++) { const p = at(-80 + hash(i * 8.1) * 70, 2700 + hash(i * 3.9) * 2000); C(p.x, p.z, 26, '#D8302A'); C(p.x - 6, p.z + 6, 8, '#FFFFFF'); }
  // (the avenues, out from the moat to the wall; the ring paths)
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4, [u0, v0] = T(Math.sin(a) * 730, Math.cos(a) * 730), [u1, v1] = T(Math.sin(a) * WALL_R, Math.cos(a) * WALL_R);
    if (k === 7) continue;
    g.strokeStyle = '#A8905E'; g.lineWidth = R(110); g.beginPath(); g.moveTo(u0, v0); g.lineTo(u1, v1); g.stroke();
    g.strokeStyle = '#D8C08A'; g.lineWidth = R(80); g.stroke();
  }
  ring(960, 120, '#A8905E'); ring(960, 90, '#D8C08A'); ring(2450, 90, '#A8905E'); ring(2450, 64, '#D2BA84');
  // (the royal gardens between the rings: hedges in rows, roses along them, topiaries, fountains)
  for (let k = 0; k < 8; k++) {
    if (k === 6 || k === 7) continue;
    const a0 = (k * 45 + 22.5) * Math.PI / 180;
    for (let row = 0; row < 5; row++) {
      const r = 1250 + row * 230;
      for (let s = -2; s <= 2; s++) {
        const a = a0 + s * 0.09, x = Math.sin(a) * r, z = Math.cos(a) * r;
        rect(x + 10, z - 10, 150, 60, '#1E3A1A'); rect(x, z, 150, 60, '#2E6A2A'); rect(x - 40, z + 10, 60, 20, '#4A8A3A');
        for (let n = 0; n < 4; n++) C(x - 60 + n * 40, z - 40, 16, n % 2 ? '#F472B6' : '#DC2626');
      }
    }
    const f = at(k * 45 + 22.5, 1800);
    C(f.x, f.z, 170, '#8A8494'); C(f.x, f.z, 140, '#3E78B8'); C(f.x - 30, f.z + 30, 50, '#7AAEDC'); C(f.x, f.z, 30, '#E8EEF6');
  }
  // (the broom port's deck, south: planks, the red carpet, the stands)
  rect(0, -2750, 760, 420, '#5A4030'); rect(0, -2750, 720, 380, '#8A6A48');
  for (let z = -2930; z < -2570; z += 40) rect(0, z, 720, 6, '#6A5038');
  rect(0, -2750, 120, 380, '#B91C1C'); rect(0, -2750, 90, 380, '#DC2626');
  rect(-430, -2750, 80, 380, '#6A6070'); rect(430, -2750, 80, 380, '#6A6070');
  // (the watchtowers' feet)
  for (const t of TOWERS) { C(t.x + 30, t.z - 30, 150, '#2A3A24'); C(t.x, t.z, 130, '#8A8098'); C(t.x, t.z, 100, '#BCAED6'); }
  // THE MOAT (drained for cleaning): mud, puddles, a cleaning cart
  ring((MOAT[0] + MOAT[1]) / 2, MOAT[1] - MOAT[0] + 20, '#5A4428'); ring((MOAT[0] + MOAT[1]) / 2, MOAT[1] - MOAT[0] - 20, '#6E5434');
  for (let i = 0; i < 30; i++) { const p = at(i * 12 + hash(i) * 8, 640 + hash(i * 2.2) * 60); E(p.x, p.z, 40 + hash(i * 3) * 30, 20, '#4A6A8A'); }
  rect(at(130, 660).x, at(130, 660).z, 60, 40, '#F2C84A');
  // THE CASTLE'S FOOT: the crag, the curtain wall's ring, the courtyard, its towers' roofs from above, the keep
  C(40, -40, 620, '#2A2438'); C(0, 0, 600, '#76748E'); C(-60, 60, 400, '#9A98B0');
  ring(540, 60, '#DCD2EC'); ring(540, 30, '#F4EEFA');
  C(0, 0, 470, '#BCAED6');
  for (let k = 0; k < 6; k++) { const p = at(k * 60 + 30, 520); C(p.x, p.z, 80, '#2E52A8'); C(p.x - 15, p.z + 15, 40, '#7AA8F0'); C(p.x, p.z, 12, '#F2C84A'); }
  rect(0, 0, 320, 320, '#9484B4'); rect(-20, 20, 280, 280, '#DCD2EC'); C(0, 0, 90, '#2E52A8'); C(-20, 20, 45, '#7AA8F0'); C(0, 0, 14, '#F2C84A');
  g.restore();
  // THE MAGIC WALL: a pink ring round the lot, glowing
  g.globalAlpha = 0.35; ring(WALL_R, 260, '#F9A8D4'); g.globalAlpha = 1;
  ring(WALL_R, 70, '#F472B6'); ring(WALL_R, 24, '#FFE4F2');
};

/** The texture and its two smaller copies, multiplied by the hour's light. */
interface Ground { key: string; mips: Uint32Array[]; out: number; far: number }
let ground: Ground | null = null;
const pack = (hex: string) => { const n = parseInt(hex.slice(1), 16); return (0xff << 24) | ((n & 0xff) << 16) | (n & 0xff00) | (n >> 16); };
const shrink = (src: Uint32Array, n: number) => {
  const m = n >> 1, out = new Uint32Array(m * m);
  for (let y = 0; y < m; y++) for (let x = 0; x < m; x++) {
    let r = 0, gg = 0, b = 0;
    for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { const p = src[(y * 2 + dy) * n + x * 2 + dx]; r += p & 0xff; gg += (p >> 8) & 0xff; b += (p >> 16) & 0xff; }
    out[y * m + x] = (0xff << 24) | (((b >> 2) & 0xff) << 16) | (((gg >> 2) & 0xff) << 8) | ((r >> 2) & 0xff);
  }
  return out;
};
const groundFor = (tod: TimeOfDay): Ground => {
  if (ground && ground.key === tod.key) return ground;
  const cv = document.createElement('canvas'); cv.width = TS; cv.height = TS;
  const g = cv.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  paintGround(g);
  // (the hour's light over it: multiplied in)
  if (tod.mul && tod.mul.toUpperCase() !== '#FFFFFF') { g.globalCompositeOperation = 'multiply'; g.fillStyle = tod.mul; g.fillRect(0, 0, TS, TS); g.globalCompositeOperation = 'source-over'; }
  const m0 = new Uint32Array(g.getImageData(0, 0, TS, TS).data.buffer.slice(0));
  const m1 = shrink(m0, TS), m2 = shrink(m1, TS >> 1);
  ground = { key: tod.key, mips: [m0, m1, m2], out: pack(multiply('#3C6634', tod.mul)), far: pack(mix(multiply('#4A6A44', tod.mul), skyAt(0.95, tod), 0.55)) };
  return ground;
};

// ---------------------------------------------------------------------------------------------------------------
// The mode 7 floor

let gcv: HTMLCanvasElement | null = null, gimg: ImageData | null = null, out32: Uint32Array | null = null;
/** The ground onto `g` (the view), row by row under the horizon, then the haze stepped in toward it. */
export const drawGround = (g: Ctx) => {
  const tod = timeOfDay(), G = groundFor(tod);
  if (!gcv) { gcv = document.createElement('canvas'); gcv.width = W; gcv.height = H; gimg = gcv.getContext('2d')!.createImageData(W, H); out32 = new Uint32Array(gimg.data.buffer); }
  const o = out32!, { cx, cz, calt, fx, fz, rx, rz, hy, F } = view;
  const y0 = Math.max(0, Math.min(H, Math.floor(hy) + 1));
  o.fill(0, 0, y0 * W);
  for (let y = y0; y < H; y++) {
    const dy = y + 0.5 - hy, d = (calt * F) / dy;
    let i = y * W;
    if (d > FAR) { o.fill(G.far, i, i + W); continue; }
    const k = d / F, lvl = k > TEXEL * 2.6 ? 2 : k > TEXEL * 1.3 ? 1 : 0;
    const tex = G.mips[lvl], ts = TS >> lvl, inv = 1 / (TEXEL << lvl);
    const wx = cx + fx * d - rx * k * (W / 2), wz = cz + fz * d - rz * k * (W / 2);
    let u = (wx + HALF) * inv, v = (HALF - wz) * inv;
    const du = rx * k * inv, dv = -rz * k * inv;
    for (let x = 0; x < W; x++) {
      o[i++] = u >= 0 && v >= 0 && u < ts && v < ts ? tex[(v | 0) * ts + (u | 0)] : G.out;
      u += du; v += dv;
    }
  }
  gcv.getContext('2d')!.putImageData(gimg!, 0, 0);
  g.drawImage(gcv, 0, 0);
  // (the haze, in steps toward the horizon: SNES bands)
  const haze = skyAt(0.95, tod);
  g.fillStyle = haze;
  const steps = [[2600, 0.12], [3800, 0.22], [5200, 0.34], [7000, 0.48], [FAR, 0.62]] as const;
  for (let n = 0; n < steps.length; n++) {
    const dNear = steps[n][0], dFar = n + 1 < steps.length ? steps[n + 1][0] : 1e9;
    const ya = Math.max(y0, hy + (calt * F) / dFar), yb = Math.min(H, hy + (calt * F) / dNear);
    if (yb <= ya) continue;
    g.globalAlpha = steps[n][1]; g.fillRect(0, Math.floor(ya), W, Math.ceil(yb - Math.floor(ya)));
  }
  g.globalAlpha = 1;
};

// ---------------------------------------------------------------------------------------------------------------
// The sky: banded, the far hills and the clouds round the whole horizon (they wrap with his heading)

/** The ring's width: 360 degrees at this focal length. */
const LW = Math.round((W * Math.PI * 2) / (2 * Math.atan(W / 2 / FOCAL)));
const SKY_H = 700, SKY_HZ = 470;
const layers = new Map<string, HTMLCanvasElement>();
const layer = (key: string, w: number, h: number, paint: (g: Ctx, tod: TimeOfDay) => void) => {
  const tod = timeOfDay(), k = key + tod.key;
  let cv = layers.get(k);
  if (!cv) { cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d')!; g.imageSmoothingEnabled = false; paint(g, tod); layers.set(k, cv); }
  return cv;
};
const paintHills = (g: Ctx, tod: TimeOfDay) => {
  const T2 = (c: string, k: number) => mix(multiply(c, tod.mul), skyAt(0.92, tod), k);
  const hh = 90;
  // (far snowy hills, two ranks, snow along their tops; the park's far spires and the fairy wheel's ring, tiny)
  for (const [k, base, amp, col] of [[0.55, 60, 22, '#7C86B4'], [0.35, 74, 14, '#4A5A7A']] as const) {
    g.fillStyle = T2(col, k); g.beginPath(); g.moveTo(0, hh);
    for (let x = 0; x <= LW; x += 8) g.lineTo(x, base - Math.abs(Math.sin(x * 0.011 + base)) * amp - Math.sin(x * 0.037) * 5);
    g.lineTo(LW, hh); g.closePath(); g.fill();
    g.fillStyle = T2('#EEF2FA', k * 0.8);
    for (let x = 0; x < LW; x += 8) { const y = base - Math.abs(Math.sin(x * 0.011 + base)) * amp - Math.sin(x * 0.037) * 5; if (y < base - amp * 0.4) g.fillRect(x, Math.round(y), 8, 2); }
  }
  const wx = Math.round(LW * 0.62), wy = 58;
  g.strokeStyle = T2('#E8A8D8', 0.45); g.lineWidth = 2; g.beginPath(); g.arc(wx, wy, 16, 0, Math.PI * 2); g.stroke();
  g.fillStyle = T2('#E8A8D8', 0.45); g.fillRect(wx - 1, wy, 2, 20);
  for (let i = 0; i < 6; i++) { const sx = Math.round(LW * 0.38) + i * 9; g.fillStyle = T2('#5A4A6A', 0.4); g.fillRect(sx, 62 - (i % 3) * 6, 6, 20); g.fillRect(sx + 2, 56 - (i % 3) * 6, 2, 6); }
  // (the near treeline round the park, dark)
  g.fillStyle = T2('#1E3424', 0.2);
  g.beginPath(); g.moveTo(0, hh);
  for (let x = 0; x <= LW; x += 4) g.lineTo(x, 84 - (x % 12 === 0 ? 6 : x % 8 === 0 ? 3 : 0) - Math.sin(x * 0.05) * 2);
  g.lineTo(LW, hh); g.closePath(); g.fill();
};
const paintClouds = (g: Ctx, tod: TimeOfDay) => {
  const C = ['#B8C0DC', '#E4E8F4', '#FFFFFF'].map(c => cloudTint(c, tod));
  for (let i = 0; i < 9; i++) {
    const cx = (i + 0.5) * (LW / 9) + hash(i * 3.1) * 40, cy = 40 + hash(i * 5.3) * 40, w = 50 + hash(i * 7.7) * 70;
    for (let k = 0; k < 6; k++) { const u = (k + 0.5) / 6, r = (0.5 + Math.sin(u * Math.PI) * 0.7) * w * 0.2; g.fillStyle = C[0]; g.beginPath(); g.ellipse(cx - w / 2 + u * w, cy, r, r * 0.7, 0, 0, Math.PI * 2); g.fill(); }
    for (let k = 0; k < 6; k++) { const u = (k + 0.5) / 6, r = (0.5 + Math.sin(u * Math.PI) * 0.7) * w * 0.15; g.fillStyle = C[1]; g.beginPath(); g.ellipse(cx - w / 2 + u * w - 2, cy - r * 0.5, r, r * 0.6, 0, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = C[2]; g.fillRect(Math.round(cx - w * 0.2), Math.round(cy - w * 0.12), Math.round(w * 0.2), 2);
  }
};
const wrapX = (yaw: number) => (((yaw / (Math.PI * 2)) * LW) % LW + LW) % LW;
const wrap = (g: Ctx, cv: HTMLCanvasElement, off: number, y: number) => { const x = -Math.round(off); g.drawImage(cv, x, Math.round(y)); g.drawImage(cv, x + LW, Math.round(y)); };

/** The sky, its clouds and the far hills (the horizon at view.hy, his heading `yaw`). */
export const drawSky = (g: Ctx, yaw: number) => {
  const sky = layer('fa-bb-sky', W, SKY_H, gg => drawTodSky(gg, 0, 0, W, SKY_H, ['#23307A', '#3A55B4', '#6E8EDC', '#A8C4F0', '#E8D4F0', '#F8C8D8'], { horizon: SKY_HZ, bands: 18 }));
  g.drawImage(sky, 0, Math.round(view.hy - SKY_HZ));
  const off = wrapX(yaw);
  wrap(g, layer('fa-bb-clouds', LW, 120, paintClouds), off, view.hy - 190);
  wrap(g, layer('fa-bb-hills', LW, 90, paintHills), off, view.hy - 88);
};

// ---------------------------------------------------------------------------------------------------------------
// The billboards (painted once for the hour; each faces the eye, scaled by its depth)

/** The castle: monument.ts's painter at twice its size (`CASTLE_K`), its foot at (CX, CY) on the canvas. */
export const CASTLE_K = 2, CASTLE_CX = 360, CASTLE_CY = 960;
export const castleCanvas = () => layer('fa-bb-castle', 720, 966, g => drawCastleAt(g, CASTLE_CX, CASTLE_CY, CASTLE_K, 0));

/** A watchtower: 1 px 4 units (50 wide, 900 of stone, the cone roof), its foot at the bottom middle. */
export const TOWER_PX = 4;
export const towerCanvas = () => layer('fa-bb-tower', 64, 330, (g, tod) => {
  const M = (c: string) => multiply(c, tod.mul), cx = 32, foot = 328, w = 52, h = 225, top = foot - h;
  const S = ['#F4EEFA', '#DCD2EC', '#BCAED6', '#9484B4', '#6A5A8C'].map(M);
  g.fillStyle = '#1A1028'; g.fillRect(cx - w / 2 - 1, top - 1, w + 2, h + 1);
  g.fillStyle = S[1]; g.fillRect(cx - w / 2, top, w, h); g.fillStyle = S[0]; g.fillRect(cx - w / 2, top, 11, h);
  g.fillStyle = S[2]; g.fillRect(cx + 8, top, 10, h); g.fillStyle = S[3]; g.fillRect(cx + 18, top, w / 2 - 18, h);
  for (let y = top + 8; y < foot; y += 9) { g.fillStyle = S[2]; g.fillRect(cx - w / 2, y, w, 1); }
  for (const wy of [top + 30, top + 100, top + 170]) { g.fillStyle = '#1A1028'; g.fillRect(cx - 5, wy - 1, 10, 22); g.fillStyle = M(tod.lamps > 0.3 ? '#FFE9A8' : '#3A3060'); g.fillRect(cx - 4, wy, 8, 20); }
  // (crenellations, the cone roof in steps, gold bands, a pink pennant)
  for (let x = cx - w / 2; x < cx + w / 2; x += 9) { g.fillStyle = '#1A1028'; g.fillRect(x - 1, top - 8, 7, 8); g.fillStyle = S[0]; g.fillRect(x, top - 7, 5, 7); }
  const rw = w / 2 + 6, rb = top - 8, rh = 82;
  const tri = (col: string, a: number, b: number) => { g.fillStyle = col; g.beginPath(); g.moveTo(cx + a, rb); g.lineTo(cx, rb - rh); g.lineTo(cx + b, rb); g.closePath(); g.fill(); };
  tri('#1A1028', -rw - 1, rw + 1); tri(M('#4A78D4'), -rw, rw); tri(M('#7AA8F0'), -rw, -rw * 0.4); tri(M('#2E52A8'), rw * 0.35, rw);
  for (const k of [0.3, 0.62]) { const yb = rb - rh * k, hw = rw * (1 - k); g.fillStyle = M('#F2C84A'); g.fillRect(cx - hw, yb, hw * 2, 2); }
  g.fillStyle = M('#C8962A'); g.fillRect(cx - 1, rb - rh - 8, 2, 8);
  g.fillStyle = M('#F49AC8'); g.beginPath(); g.moveTo(cx + 1, rb - rh - 9); g.lineTo(cx + 16, rb - rh - 5); g.lineTo(cx + 1, rb - rh - 1); g.closePath(); g.fill();
});

/** A tree: 1 px 4 units, its foot at the bottom middle (k 0 a snowy fairy pine, 1 a round tree with a toadstool). */
export const treeCanvas = (k: number) => layer(`fa-bb-tree${k}`, 64, 140, (g, tod) => {
  const M = (c: string) => multiply(c, tod.mul), cx = 32, foot = 138;
  g.fillStyle = M('#4A2E1A'); g.fillRect(cx - 3, foot - 30, 6, 30);
  if (k === 0) {
    for (let t = 0; t < 5; t++) {
      const y0 = foot - 130 + t * 20, half = 9 + t * 5;
      g.fillStyle = '#10200F'; g.beginPath(); g.moveTo(cx, y0 - 2); g.lineTo(cx + half + 1, y0 + 28); g.lineTo(cx - half - 1, y0 + 28); g.closePath(); g.fill();
      g.fillStyle = M(t % 2 ? '#1E4224' : '#285430'); g.beginPath(); g.moveTo(cx, y0); g.lineTo(cx + half, y0 + 26); g.lineTo(cx - half, y0 + 26); g.closePath(); g.fill();
      g.fillStyle = M('#EEF2FA'); g.fillRect(cx - half + 2, y0 + 24, half * 2 - 4, 2);
    }
  } else {
    g.fillStyle = '#10200F'; g.beginPath(); g.ellipse(cx, foot - 70, 30, 40, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = M('#2E6A2A'); g.beginPath(); g.ellipse(cx, foot - 70, 28, 38, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = M('#4A8A3A'); g.beginPath(); g.ellipse(cx - 8, foot - 82, 14, 16, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = M('#D8302A'); g.beginPath(); g.ellipse(cx + 14, foot - 8, 10, 6, 0, Math.PI, 0); g.fill();
    g.fillStyle = M('#F4F4F5'); g.fillRect(cx + 12, foot - 8, 4, 8);
  }
});

/** A banner pole: 1 px 4 units, its foot at the bottom middle; the pennant in two frames (it flaps). */
export const flagCanvas = (frame: number) => layer(`fa-bb-flag${frame}`, 40, 170, (g, tod) => {
  const M = (c: string) => multiply(c, tod.mul), cx = 6, foot = 168;
  g.fillStyle = '#1A1028'; g.fillRect(cx - 2, foot - 160, 4, 160); g.fillStyle = M('#C8962A'); g.fillRect(cx - 1, foot - 160, 2, 160);
  g.fillStyle = M('#F2C84A'); g.beginPath(); g.arc(cx, foot - 162, 3, 0, Math.PI * 2); g.fill();
  const flap = frame ? 3 : -3;
  g.fillStyle = '#1A1028'; g.beginPath(); g.moveTo(cx + 1, foot - 156); g.lineTo(cx + 34, foot - 146 + flap); g.lineTo(cx + 1, foot - 122); g.closePath(); g.fill();
  g.fillStyle = M('#F472B6'); g.beginPath(); g.moveTo(cx + 2, foot - 154); g.lineTo(cx + 31, foot - 146 + flap); g.lineTo(cx + 2, foot - 124); g.closePath(); g.fill();
  g.fillStyle = M('#FFD0E8'); g.fillRect(cx + 4, foot - 146, 8, 2);
});

/** A hot-air balloon: 1 px 4 units (pink and white gores, a heart on it, the basket), its middle at (40, 46). */
export const balloonCanvas = () => layer('fa-bb-balloon', 80, 120, (g, tod) => {
  const M = (c: string) => multiply(c, tod.mul), cx = 40, cy = 46;
  g.fillStyle = '#1A1028'; g.beginPath(); g.ellipse(cx, cy, 39, 44, 0, 0, Math.PI * 2); g.fill();
  for (let k = -3; k <= 3; k++) { g.fillStyle = M(k % 2 ? '#FFFFFF' : '#F472B6'); g.beginPath(); g.ellipse(cx + k * 9, cy, Math.max(2, 38 - Math.abs(k) * 9), 43, 0, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = M('#F49AC8'); g.beginPath(); g.ellipse(cx, cy, 10, 43, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = M('#D8306E'); g.beginPath(); g.arc(cx - 5, cy - 4, 6, 0, Math.PI * 2); g.arc(cx + 5, cy - 4, 6, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(cx - 11, cy - 1); g.lineTo(cx, cy + 12); g.lineTo(cx + 11, cy - 1); g.closePath(); g.fill();
  g.strokeStyle = '#1A1028'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx - 14, cy + 40); g.lineTo(cx - 7, cy + 62); g.moveTo(cx + 14, cy + 40); g.lineTo(cx + 7, cy + 62); g.stroke();
  g.fillStyle = '#1A1028'; g.fillRect(cx - 9, cy + 61, 18, 13); g.fillStyle = M('#8A5A30'); g.fillRect(cx - 8, cy + 62, 16, 11); g.fillStyle = M('#B8864A'); g.fillRect(cx - 8, cy + 62, 16, 2);
});
