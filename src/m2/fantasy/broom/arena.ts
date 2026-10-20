// THE ARENA: the castle grounds as a free-range sky (the user's "free range", not a track), and the mode-7 trickery
// that draws it. One eye: the camera behind him, everything projected through it (the ground plane, the castle, the
// towers, the suitors, the shots), culled by what that eye really sees.
//
// World (world.ts): x east, z north, alt up (units; a suitor's about 100 tall). The GREAT PIXIE'S CASTLE stands in the
// middle at (0, 0), Piper's window lit up its spire (monument.ts PIPER_WINDOW): the goal, sealed till the last suitor's
// dead. Round it, out to the park's edge: the drained moat, the ring paths and the avenues, the gardens, the broom
// port, the park's lands, the glen's forest (north-west), six watchtowers, banner poles, Piper's hot-air balloons
// drifting. At WALL_R the park's MAGIC WALL (a pink shimmer: it turns him back). Past it, the park beyond in winter.
//
// The ground's ONE TEXTURE (ground.ts: 2048 px, 6 units a texel), painted once for the hour, with four smaller copies
// (averaged) for the farther rows so they never shimmer, and past its edge the park beyond's tile (repeating, with its
// own copies); sampled a scanline at a time into a 400x300 image (the mode 7 way: each row's distance from the eye's
// height and the row's drop under the horizon), blown up 2x onto the screen. The sky (sky.ts) and the billboards
// (sprites.ts: each with its own chain of copies) are their own files.

import { timeOfDay, multiply, skyAt, type TimeOfDay } from '../../timeOfDay';
import { mix, hash } from '../kit';
import { PIPER_WINDOW } from '../monument';
import { W, H, FOCAL, TOWERS } from './world';
import { TS, TEXEL, HALF, OS, paintGroundSteps, outsideFor, outsideRaw } from './ground';
import { drawSky as skyDraw } from './sky';
import { Mode7 } from '../../gl/mode7';

export { W, H, HORIZON, FOCAL, WALL_R, MIN_ALT, MAX_ALT, MOAT, TOWERS, FLAGS, TREES } from './world';
export { castleSprite, towerSprite, treeSprite, flagSprite, balloonSprite, drawSprite, drawMipped, CASTLE_K, CASTLE_CX, CASTLE_CY, TOWER_PX, BALLOON_AX, BALLOON_AY } from './sprites';

type Ctx = CanvasRenderingContext2D;

/** The camera: behind him and above. */
export const CAM_BACK = 240, CAM_UP = 62;
/** Castle art px to world units (monument.ts paints it ~470 px tall: ~1700 units here). */
export const CASTLE_U = 3.6;
/** Piper's window, in the world: up the spire (the castle's a billboard: it always faces him). */
export const WINDOW = { alt: -PIPER_WINDOW.y * CASTLE_U, side: PIPER_WINDOW.x * CASTLE_U, w: 16 * CASTLE_U, h: 26 * CASTLE_U };

const FAR = 10000, LEVELS = 5;

// ---------------------------------------------------------------------------------------------------------------
// What stands in the arena

/** Something solid (the castle, a tower): its middle, and its profile up (each [top alt, radius], lowest first). */
export interface Solid { x: number; z: number; prof: [number, number][]; kind: 'castle' | 'tower'; i: number }

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

/** Piper's hot-air balloons: round and round, slow, at their heights. */
export const BALLOONS = [
  { r: 1700, a0: 0.4, w: 0.0005, alt: 1150 }, { r: 3200, a0: 2.1, w: -0.0003, alt: 1650 }, { r: 2600, a0: 3.9, w: 0.0004, alt: 900 },
  { r: 4100, a0: 5.0, w: 0.00025, alt: 1900 }, { r: 3600, a0: 1.2, w: -0.00035, alt: 1350 },
];
export const balloonAt = (b: (typeof BALLOONS)[number], f: number) => { const a = b.a0 + f * b.w; return { x: Math.sin(a) * b.r, z: Math.cos(a) * b.r, alt: b.alt + Math.sin(f * 0.01 + b.a0) * 40 }; };

// ---------------------------------------------------------------------------------------------------------------
// The eye

export interface View { cx: number; cz: number; calt: number; fx: number; fz: number; rx: number; rz: number; hy: number; F: number }
export const view: View = { cx: 0, cz: 0, calt: 100, fx: 0, fz: 1, rx: 1, rz: 0, hy: 112, F: FOCAL };
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

/** The sky, its clouds, the Alps, the far park; the sun, birds or fireworks (sky.ts) for the eye as it is. */
export const drawSky = (g: Ctx, yaw: number, f = 0) => skyDraw(g, yaw, view.hy, f);

// ---------------------------------------------------------------------------------------------------------------
// The blood on the ground: a BIG SPLATTER under each dead suitor (the user's: "big blood splatter on the ground with
// the dead bodies"), baked into the ground texture (not sprites: it costs nothing to draw however many pile up). A
// starburst: a wet core, spikes all round, long streaks and drops thrown the way he was going when he hit, gore bits.
// Big enough to read from altitude (the core ~250 units across, the spikes out to ~400, the streaks ~800 ahead).

const T = (x: number, z: number): [number, number] => [(x + HALF) / TEXEL, (HALF - z) / TEXEL];
const R = (r: number) => r / TEXEL;

/** A splatter on the ground: where, the way he was going when he hit (a yaw), in the moat's mud or not, its seed. */
export interface Splat { x: number; z: number; dir: number; mud: boolean; seed: number }
let splats: Splat[] = [];
let splatKey = '';
const keyOf = (l: Splat[]) => l.map(s => `${Math.round(s.x)},${Math.round(s.z)};`).join('');
/** The splatters that should be on the ground now (the fight's, oldest first: new ones are only ever added on). */
export const setSplats = (list: Splat[]) => { const k = keyOf(list); if (k !== splatKey) { splatKey = k; splats = list.slice(); } };

const paintSplat = (g: Ctx, s: Splat, tod: TimeOfDay): [number, number, number, number] => {
  const [u, v] = T(s.x, s.z), dv = -Math.cos(s.dir), du = Math.sin(s.dir), rot = Math.atan2(dv, du);
  const M = (c: string) => multiply(c, tod.mul);
  const core = R(115 + hash(s.seed * 1.7) * 30);
  const passes: [string, number][] = s.mud
    ? [[M('#2A0C06'), 1.18], [M('#4A140A'), 1], [M('#6E1A0E'), 0.55]]
    : [[M('#3A0404'), 1.18], [M('#7A0C0C'), 1], [M('#A81414'), 0.55]];
  for (const [col, sc] of passes) {
    let n = s.seed * 97 + 13;
    const r = () => { n = (n * 16807 + 11) % 2147483647; return n / 2147483647; };
    g.fillStyle = col;
    // (the core: a lumpy blob)
    for (let i = 0; i < 8; i++) { const a = r() * Math.PI * 2, d = r() * core * 0.5; g.beginPath(); g.arc(u + Math.cos(a) * d, v + Math.sin(a) * d, core * (0.45 + r() * 0.35) * sc, 0, Math.PI * 2); g.fill(); }
    // (spikes all round: longer the way he was going)
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + r() * 0.3, fwd = Math.max(0, Math.cos(a - rot)), len = core * (1.2 + r() * 1.3 + fwd * 1.6) * (sc > 1 ? 1.04 : sc < 1 ? 0.7 : 1), w = core * (0.12 + r() * 0.1) * sc;
      const ca = Math.cos(a), sa = Math.sin(a);
      g.beginPath(); g.moveTo(u - sa * w, v + ca * w); g.lineTo(u + ca * len, v + sa * len); g.lineTo(u + sa * w, v - ca * w); g.closePath(); g.fill();
      g.beginPath(); g.arc(u + ca * len * 0.96, v + sa * len * 0.96, w * 0.5, 0, Math.PI * 2); g.fill();
    }
    // (the long streaks thrown ahead, and the drops along them)
    for (let i = 0; i < 5; i++) {
      const a = rot + (r() - 0.5) * 0.7, d = core * (1.4 + r() * 1.6), L = core * (0.9 + r() * 0.9);
      g.beginPath(); g.ellipse(u + Math.cos(a) * d, v + Math.sin(a) * d, L * sc, core * (0.14 + r() * 0.08) * sc, a, 0, Math.PI * 2); g.fill();
      for (let k = 0; k < 4; k++) { const dd = d + L + core * (0.3 + k * 0.45 + r() * 0.2); g.beginPath(); g.arc(u + Math.cos(a) * dd, v + Math.sin(a) * dd, core * (0.12 - k * 0.02) * sc, 0, Math.PI * 2); g.fill(); }
    }
    // (spatter all round)
    for (let i = 0; i < 26; i++) { const a = r() * Math.PI * 2, d = core * (1 + r() * 2.4) * (1 + Math.max(0, Math.cos(a - rot))), rr = core * (0.04 + r() * 0.08) * sc; g.beginPath(); g.arc(u + Math.cos(a) * d, v + Math.sin(a) * d, Math.max(0.5, rr), 0, Math.PI * 2); g.fill(); }
  }
  // (a wet glint on the core, stepped)
  g.fillStyle = M(s.mud ? '#8A3A22' : '#D83A3A');
  for (let i = 0; i < 5; i++) g.fillRect(Math.round(u - core * 0.3 + i), Math.round(v - core * 0.35 - (i % 2)), 1, 1);
  // (gore: bits of him, and bone)
  let n = s.seed * 31 + 7;
  const r = () => { n = (n * 16807 + 11) % 2147483647; return n / 2147483647; };
  for (let i = 0; i < 14; i++) {
    const a = rot + (r() - 0.5) * 2.4, d = core * (0.3 + r() * 1.8), x = u + Math.cos(a) * d, y = v + Math.sin(a) * d, w = 1 + Math.round(r() * 3);
    g.fillStyle = M(i % 3 === 0 ? '#EEE6D6' : i % 3 === 1 ? '#C86A6A' : '#5A0808'); g.fillRect(Math.round(x), Math.round(y), w, Math.max(1, w - 1));
  }
  const ext = core * 7.5;
  return [u - ext, v - ext, u + ext, v + ext];
};

/** The texture and its smaller copies, multiplied by the hour's light (the splatters painted on it as they come), and
 *  the park beyond's tile and its copies. */
interface Ground { key: string; mips: Uint32Array[]; omips: Uint32Array[]; far: number; g: Ctx; splatKey: string; nSplats: number; n: number; on: number; dirty: [number, number, number, number][] }
let ground: Ground | null = null;
let rawTile: HTMLCanvasElement | null = null;
const avg4 = (s: Uint32Array, n: number, x: number, y: number) => {
  let r = 0, gg = 0, b = 0;
  for (let k = 0; k < 4; k++) { const p = s[(y * 2 + (k >> 1)) * n + x * 2 + (k & 1)]; r += p & 0xff; gg += (p >> 8) & 0xff; b += (p >> 16) & 0xff; }
  return (0xff << 24) | (((b >> 2) & 0xff) << 16) | (((gg >> 2) & 0xff) << 8) | ((r >> 2) & 0xff);
};
/** Copy a region of the painted texture back into the top copy and remake the smaller ones over it. */
const refresh = (G: Ground, x0: number, y0: number, x1: number, y1: number) => {
  const al = (1 << LEVELS) - 1;
  const ax = Math.max(0, Math.floor(x0) & ~al), ay = Math.max(0, Math.floor(y0) & ~al), bx = Math.min(TS, (Math.ceil(x1) + al) & ~al), by = Math.min(TS, (Math.ceil(y1) + al) & ~al);
  if (bx <= ax || by <= ay) return;
  // (the patch, for the GPU's copy: gl/mode7.ts sends just it up)
  G.dirty.push([ax, ay, bx, by]);
  const w = bx - ax, h = by - ay, src = new Uint32Array(G.g.getImageData(ax, ay, w, h).data.buffer.slice(0)), m0 = G.mips[0];
  for (let y = 0; y < h; y++) m0.set(src.subarray(y * w, y * w + w), (ay + y) * TS + ax);
  for (let lvl = 1; lvl < LEVELS; lvl++) {
    const n = TS >> (lvl - 1), m = n >> 1, s = G.mips[lvl - 1], d = G.mips[lvl];
    for (let y = ay >> lvl; y < by >> lvl; y++) for (let x = ax >> lvl; x < bx >> lvl; x++) d[y * m + x] = avg4(s, n, x, y);
  }
};
const pack = (hex: string) => { const n = parseInt(hex.slice(1), 16); return (0xff << 24) | ((n & 0xff) << 16) | (n & 0xff00) | (n >> 16); };
const shrink = (src: Uint32Array, n: number) => {
  const m = n >> 1, out = new Uint32Array(m * m);
  for (let y = 0; y < m; y++) for (let x = 0; x < m; x++) out[y * m + x] = avg4(src, n, x, y);
  return out;
};
const chain = (m0: Uint32Array, n: number) => { const out = [m0]; for (let i = 1; i < LEVELS; i++) out.push(shrink(out[i - 1], n >> (i - 1))); return out; };
/** The texture and its copies for the hour, a step at a time (no splatters yet: they go on after, as new ones do). */
function* buildSteps(tod: TimeOfDay): Generator<void, Ground> {
  if (!rawTile) { rawTile = outsideRaw(); yield; }
  const cv = document.createElement('canvas'); cv.width = TS; cv.height = TS;
  const g = cv.getContext('2d', { willReadFrequently: true })!;
  g.imageSmoothingEnabled = false;
  yield* paintGroundSteps(g, rawTile, tod);
  const m0 = new Uint32Array(g.getImageData(0, 0, TS, TS).data.buffer.slice(0));
  yield;
  const mips = [m0];
  for (let i = 1; i < LEVELS; i++) { mips.push(shrink(mips[i - 1], TS >> (i - 1))); if (i < 3) yield; }
  const tile = outsideFor(tod), o0 = new Uint32Array(tile.getContext('2d')!.getImageData(0, 0, OS, OS).data.buffer.slice(0));
  return { key: tod.key, mips, omips: chain(o0, OS), far: pack(mix(multiply('#B8C4E0', tod.mul), skyAt(0.95, tod), 0.55)), g, splatKey: '', nSplats: 0, n: TS, on: OS, dirty: [] };
}
/** A build under way ahead of the fight (primeGround), for the hour it was started at. */
let job: { key: string; it: Generator<void, Ground> } | null = null;
/** Paint the ground's texture a few milliseconds at a time before it's needed (the runway calls this every frame on
 *  the way to the deathmatch), so taking off doesn't hitch on painting it all at once. */
export const primeGround = (budgetMs = 3) => {
  const tod = timeOfDay();
  // (built: its GPU copy sent up now too, rather than on the first frame of the fight)
  if (ground && ground.key === tod.key) { m7.sync(ground); return; }
  if (!job || job.key !== tod.key) job = { key: tod.key, it: buildSteps(tod) };
  const t0 = performance.now();
  while (performance.now() - t0 < budgetMs) { const r = job.it.next(); if (r.done) { ground = r.value; splatsOn(ground, tod); job = null; return; } }
};
/** The floor on the GPU (gl/mode7.ts), the view's size; the software sampler below if it can't. */
const m7 = new Mode7(W, H, TEXEL, FAR);
/** New splatters since: painted on, and just their patch of the copies remade. */
const splatsOn = (G: Ground, tod: TimeOfDay) => {
  if (G.splatKey === splatKey) return;
  for (let i = G.nSplats; i < splats.length; i++) { const [a, b, c, d] = paintSplat(G.g, splats[i], tod); refresh(G, a, b, c, d); }
  G.nSplats = splats.length; G.splatKey = splatKey;
};
const groundFor = (tod: TimeOfDay): Ground => {
  if (ground && ground.key === tod.key && (ground.splatKey === splatKey || splatKey.startsWith(ground.splatKey))) { splatsOn(ground, tod); return ground; }
  // (a fresh build: the one under way for this hour finished, or one straight through; then every splatter on it)
  if (!job || job.key !== tod.key) job = { key: tod.key, it: buildSteps(tod) };
  let r = job.it.next();
  while (!r.done) r = job.it.next();
  job = null;
  ground = r.value;
  splatsOn(ground, tod);
  return ground;
};

// ---------------------------------------------------------------------------------------------------------------
// The mode 7 floor

let gcv: HTMLCanvasElement | null = null, gimg: ImageData | null = null, out32: Uint32Array | null = null;
/** The ground onto `g` (the view), row by row under the horizon, then the haze stepped in toward it. */
export const drawGround = (g: Ctx) => {
  const tod = timeOfDay(), G = groundFor(tod);
  if (m7.draw(g, G, view)) { haze(g, tod); return; }
  if (!gcv) { gcv = document.createElement('canvas'); gcv.width = W; gcv.height = H; gimg = gcv.getContext('2d')!.createImageData(W, H); out32 = new Uint32Array(gimg.data.buffer); }
  const o = out32!, { cx, cz, calt, fx, fz, rx, rz, hy, F } = view;
  const y0 = Math.max(0, Math.min(H, Math.floor(hy) + 1));
  o.fill(0, 0, y0 * W);
  for (let y = y0; y < H; y++) {
    const dy = y + 0.5 - hy, d = (calt * F) / dy;
    let i = y * W;
    if (d > FAR) { o.fill(G.far, i, i + W); continue; }
    const k = d / F;
    let lvl = 0;
    while (lvl < LEVELS - 1 && k > TEXEL * 1.3 * (1 << lvl)) lvl++;
    const tex = G.mips[lvl], ts = TS >> lvl, inv = 1 / (TEXEL << lvl), otex = G.omips[lvl], os = OS >> lvl, om = os - 1;
    const wx = cx + fx * d - rx * k * (W / 2), wz = cz + fz * d - rz * k * (W / 2);
    let u = (wx + HALF) * inv, v = (HALF - wz) * inv;
    const du = rx * k * inv, dv = -rz * k * inv;
    for (let x = 0; x < W; x++) {
      o[i++] = u >= 0 && v >= 0 && u < ts && v < ts ? tex[(v | 0) * ts + (u | 0)] : otex[((v | 0) & om) * os + ((u | 0) & om)];
      u += du; v += dv;
    }
  }
  gcv.getContext('2d')!.putImageData(gimg!, 0, 0);
  g.drawImage(gcv, 0, 0);
  haze(g, tod);
};
/** The haze over the floor, in steps toward the horizon: SNES bands, a dithered row at each step. */
const haze = (g: Ctx, tod: TimeOfDay) => {
  const { calt, hy, F } = view, y0 = Math.max(0, Math.min(H, Math.floor(hy) + 1));
  g.fillStyle = skyAt(0.95, tod);
  const steps = [[2600, 0.1], [3800, 0.2], [5200, 0.32], [7000, 0.46], [FAR, 0.62]] as const;
  for (let n = 0; n < steps.length; n++) {
    const dNear = steps[n][0], dFar = n + 1 < steps.length ? steps[n + 1][0] : 1e9;
    const ya = Math.max(y0, hy + (calt * F) / dFar), yb = Math.min(H, hy + (calt * F) / dNear);
    if (yb <= ya) continue;
    g.globalAlpha = steps[n][1]; g.fillRect(0, Math.floor(ya), W, Math.ceil(yb - Math.floor(ya)));
    if (n > 0 && yb - ya > 2) { g.globalAlpha = (steps[n][1] - steps[n - 1][1]) * 0.6; for (let x = (Math.floor(yb) & 1); x < W; x += 2) g.fillRect(x, Math.floor(yb), 1, 1); }
  }
  g.globalAlpha = 1;
};
