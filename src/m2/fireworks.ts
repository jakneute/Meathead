// THE NEVERENDING FIREWORKS SHOW (the owner's, 2026-11-03: "when the hour happens to be 9, make fireworks go in the
// sky ... all outdoor areas will light up and show fireworks ... some way to celebrate getting everything ...
// reloading a save and running around will show fire works in all outdoor areas").
//
// At the day's last hour (dayProgress() 1: all eight bosses and all 24 hidden finds; or the cheat menu's hour 9), a
// steady show that never stops, far off over the park: shells going up from behind the skyline on a spark, bursting
// (peonies, two-tone rings, gold willows hanging and falling, crackle rings that pop into white flecks, a smiley, now
// and then a dick), at random, now and then a volley of them. Each burst flashes the sky round it its color (a
// stepped glow, painted once), puts the faintest wash of it over the outdoor picture, and is heard a moment later
// (far off: the flash first, then a soft thump; the crackles after), quietly, on sounds of its own (no gameplay sound's
// voices taken).
//
// Where: it hangs off the shared night sky (timeOfDay.ts drawStars): every outdoor sky that draws its stars draws the
// show in with them, at the stars' depth, behind everything else the sky has (the moon, the clouds, the skylines, the
// landmarks). Indoors there are no stars, so no show, and nothing's heard (the show only goes on while a sky's drawn
// it lately). Art painted once that has stars in it (a baked sky) never gets it: only the screen's canvas (and the
// walk screens' picture, marked live) does. Not in boss fights (bossQuiet.ts), nor while paused.
//
// Cheap: a fixed pool of sparks (a hard cap), nothing painted per pixel, the sparks and glows small sprites painted
// once each (a color's worth on first use) and drawn with drawImage and alpha.

import type { GameState } from '../m1/game/core/state';
import { playSound } from '../m1/game/platform/audio';
import { dayProgress } from './timeOfDay';
import { inBossFight } from './bossQuiet';
import { gamePaused } from './minigamePause';

type Ctx = CanvasRenderingContext2D;

/** The show's on at all: the last hour. */
// (dev, the perf build: ?nofw, the show off, to measure it against)
const OFF = import.meta.env.DEV && typeof location !== 'undefined' && new URLSearchParams(location.search).has('nofw');
export const fireworksHour = () => !OFF && dayProgress() >= 0.999;

// ---------------------------------------------------------------------------------------------------------------
// Where it can be drawn: the screen's canvas (in the page), and canvases drawn fresh each frame (the walk screens')

const live = new WeakSet<object>();
export const markFireworksCanvas = (cv: HTMLCanvasElement) => { live.add(cv); };
const isLive = (c: Ctx) => { const cv = c.canvas as HTMLCanvasElement | undefined; return !!cv && (live.has(cv) || cv.isConnected === true); };

// ---------------------------------------------------------------------------------------------------------------
// What holds it back: a boss fight; the hub's announcement (held till the PA gets to it)

let lastState: GameState | null = null;
/** (App.tsx's frame hook, each frame of play) */
export const noteFireworksState = (state: GameState) => { lastState = state; };
let held = false;
/** Hold the show (no new shells) / let it go. */
export const holdFireworks = (on: boolean) => { held = on; };
let volleyDue = false;
/** A volley, right now (the PA's announced it). */
export const fireworksVolley = () => { volleyDue = true; nextIn = 0; };

// ---------------------------------------------------------------------------------------------------------------
// The sparks: one pool

const MAX = 360;
const COLORS = ['#FF5A7A', '#FFE066', '#6AE0FF', '#A8FF7A', '#FFFFFF', '#FF9A3A', '#C08AFF', '#FFD27A'];
const GOLD = 7, WHITE = 4;
// (each spark: offset from its burst (game px), velocity, life, color, kind 0 spark / 1 willow / 2 crackle / 3 fleck)
const px = new Float32Array(MAX), py = new Float32Array(MAX), vx = new Float32Array(MAX), vy = new Float32Array(MAX);
const life = new Int16Array(MAX), maxL = new Int16Array(MAX), col = new Uint8Array(MAX), kind = new Uint8Array(MAX), drag = new Float32Array(MAX), grav = new Float32Array(MAX);
/** Which burst it's from (its anchor in the sky: 0..1 across, 0..1 down the sky box). */
const bu = new Float32Array(MAX), bv = new Float32Array(MAX);
const on = new Uint8Array(MAX);
const free: number[] = Array.from({ length: MAX }, (_, i) => MAX - 1 - i);
let alive = 0;

const spawn = (u: number, v: number, x: number, y: number, sx: number, sy: number, c: number, k: number, l: number, d: number, g: number) => {
  const i = free.pop();
  if (i === undefined) return;
  on[i] = 1; alive++;
  px[i] = x; py[i] = y; vx[i] = sx; vy[i] = sy; life[i] = 0; maxL[i] = l; col[i] = c; kind[i] = k; drag[i] = d; grav[i] = g; bu[i] = u; bv[i] = v;
};
const kill = (i: number) => { on[i] = 0; alive--; free.push(i); };

interface Shell { u: number; v: number; to: number; t: number; len: number; type: number; c: number; c2: number }
const shells: Shell[] = [];
interface Flash { u: number; v: number; c: number; t: number; r: number }
const flashes: Flash[] = [];
/** Sounds still on their way (frames to go). */
const sounds: { in: number; type: 'fwpop' | 'fwcrackle'; vol: number }[] = [];

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pickColor = () => Math.floor(Math.random() * 7);

/** A burst's sparks at (u, v): its kind's shape. */
const burst = (s: Shell) => {
  const { u, c, c2 } = s, v = s.to;
  const room = free.length;
  const ring = (n: number, sp: number, cc: number, k = 0, l = 64, d = 0.955, g = 0.035) => {
    const a0 = Math.random() * Math.PI;
    for (let j = 0; j < n; j++) { const a = a0 + (j / n) * Math.PI * 2, q = sp * 1.3 * rnd(0.88, 1.08); spawn(u, v, 0, 0, Math.cos(a) * q, Math.sin(a) * q, cc, k, Math.round(l * rnd(0.85, 1.15)), d, g); }
  };
  const shape = (pts: [number, number][], sp: number, cc: number, rot = 0) => {
    const cs = Math.cos(rot), sn = Math.sin(rot);
    for (const [x, y] of pts) spawn(u, v, 0, 0, (x * cs - y * sn) * sp * 1.3, (x * sn + y * cs) * sp * 1.3, cc, 0, Math.round(rnd(66, 80)), 0.93, 0.008);
  };
  const scale = Math.min(1, room / 48);
  let r = 44;
  switch (s.type) {
    case 0: ring(Math.round(40 * scale), 2.2, c); break;
    case 1: ring(Math.round(30 * scale), 2.5, c); ring(Math.round(14 * scale), 1.2, c2); break;
    case 2: ring(Math.round(30 * scale), 1.7, GOLD, 1, 130, 0.972, 0.022); r = 52; break;
    case 3: ring(Math.round(24 * scale), 2.0, c, 2, 44); sounds.push({ in: Math.round(rnd(60, 80)), type: 'fwcrackle', vol: 0.5 }); break;
    case 4: {
      // (a smiley: its face, its eyes, its grin)
      const pts: [number, number][] = [];
      for (let j = 0; j < 20; j++) { const a = (j / 20) * Math.PI * 2; pts.push([Math.cos(a), Math.sin(a)]); }
      pts.push([-0.36, -0.3], [-0.36, -0.42], [0.36, -0.3], [0.36, -0.42]);
      for (let j = 0; j <= 7; j++) { const a = Math.PI * (0.18 + 0.64 * (j / 7)); pts.push([Math.cos(a) * 0.56, Math.sin(a) * 0.56 - 0.02]); }
      shape(pts, 2.3, 1); r = 36;
      break;
    }
    default: {
      // (the crude one: a dick and balls, the park's pyro guy's idea of a joke)
      const pts: [number, number][] = [];
      for (const bx of [-0.3, 0.3]) for (let j = 0; j < 9; j++) { const a = (j / 9) * Math.PI * 2; pts.push([bx + Math.cos(a) * 0.3, 0.62 + Math.sin(a) * 0.3]); }
      for (const sx of [-0.17, 0.17]) for (let j = 0; j < 5; j++) pts.push([sx, 0.32 - j * 0.24]);
      for (let j = 0; j <= 5; j++) { const a = Math.PI + Math.PI * (j / 5); pts.push([Math.cos(a) * 0.2, -0.7 + Math.sin(a) * 0.22]); }
      shape(pts, 2.2, 0, rnd(-0.4, 0.4)); r = 36;
    }
  }
  flashes.push({ u, v, c: s.type === 2 ? GOLD : c, t: 0, r: r * 1.3 });
  if (flashes.length > 6) flashes.shift();
  // (heard a moment after it's seen: far off)
  sounds.push({ in: Math.round(rnd(20, 44)), type: 'fwpop', vol: rnd(0.5, 1) });
};

let nextIn = 30, volleyLeft = 0;
const launch = () => {
  const roll = Math.random();
  const type = roll < 0.04 ? 5 : roll < 0.1 ? 4 : roll < 0.3 ? 2 : roll < 0.48 ? 3 : roll < 0.72 ? 1 : 0;
  let c = pickColor(), c2 = pickColor();
  if (c2 === c) c2 = (c + 3) % 7;
  if (type === 5) c = 0;
  const to = rnd(0.12, 0.5), len = Math.round(rnd(30, 44));
  shells.push({ u: rnd(0.08, 0.92), v: 1.02, to, t: 0, len, type, c, c2 });
};

/** Frames since a sky last drew it (the show only goes on outdoors). */
let sinceSky = 1e9, noWash = false;
/** When the screen's own sky last drew it (ms): the wash is only for a frame it did. */
let mainAt = -1e9;

const step = () => {
  sinceSky++;
  const outdoors = sinceSky < 20;
  const quiet = !!lastState && inBossFight(lastState);
  // (new shells: at random, a volley now and then)
  if (outdoors && !held && !quiet && fireworksHour()) {
    if (--nextIn <= 0) {
      launch();
      if (volleyDue) { volleyDue = false; volleyLeft = 5; }
      else if (volleyLeft <= 0 && Math.random() < 0.1) volleyLeft = Math.floor(rnd(3, 7));
      if (volleyLeft > 0) { volleyLeft--; nextIn = Math.round(rnd(6, 14)); } else nextIn = Math.round(rnd(26, 84));
    }
  }
  for (let i = shells.length - 1; i >= 0; i--) {
    const s = shells[i];
    if (++s.t >= s.len) { shells.splice(i, 1); burst(s); }
  }
  for (let i = 0; i < MAX; i++) {
    if (!on[i]) continue;
    vx[i] *= drag[i]; vy[i] = vy[i] * drag[i] + grav[i];
    px[i] += vx[i]; py[i] += vy[i];
    if (++life[i] >= maxL[i]) {
      // (a crackle ring's sparks pop into flecks)
      if (kind[i] === 2) for (let k = 0; k < 2; k++) spawn(bu[i], bv[i], px[i], py[i], rnd(-0.7, 0.7), rnd(-0.7, 0.7), WHITE, 3, 9, 0.9, 0.02);
      kill(i);
    }
  }
  for (let i = flashes.length - 1; i >= 0; i--) if (++flashes[i].t > 26) flashes.splice(i, 1);
  for (let i = sounds.length - 1; i >= 0; i--) {
    const s = sounds[i];
    if (--s.in > 0) continue;
    sounds.splice(i, 1);
    if (outdoors) playSound(s.type, s.type === 'fwpop' ? 0.16 * s.vol : 0.12 * s.vol, 0);
  }
};

// (stepped by the clock, 60 a second, whoever draws it: a frame drawn twice doesn't run it twice)
let lastNow = 0, acc = 0;
const advance = () => {
  const now = performance.now();
  if (!lastNow) lastNow = now;
  acc += Math.min(100, now - lastNow); lastNow = now;
  if (gamePaused()) { acc = 0; return; }
  let n = 0;
  while (acc >= 1000 / 60 - 1 && n < 4) { acc -= 1000 / 60; n++; step(); }
  if (n === 4) acc = 0;
};

// ---------------------------------------------------------------------------------------------------------------
// The sprites (painted once a color, on first use)

const canvasOf = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const sparks: HTMLCanvasElement[] = [], glows: HTMLCanvasElement[] = [];
const rgb = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
/** A spark: 3x3, the white-hot middle, its color round it. */
const sparkOf = (c: number) => {
  let s = sparks[c];
  if (!s) {
    s = canvasOf(3, 3); const g = s.getContext('2d')!;
    g.fillStyle = COLORS[c]; g.fillRect(0, 0, 3, 3);
    const [r, gg, b] = rgb(COLORS[c]);
    g.fillStyle = `rgb(${(r * 0.55) | 0},${(gg * 0.55) | 0},${(b * 0.55) | 0})`; g.fillRect(0, 0, 1, 1); g.fillRect(2, 0, 1, 1); g.fillRect(0, 2, 1, 1); g.fillRect(2, 2, 1, 1);
    g.fillStyle = '#FFFFFF'; g.fillRect(1, 1, 1, 1);
    sparks[c] = s;
  }
  return s;
};
/** The flash round a burst: stepped rings of its color, see-through, fading out (SNES: steps, no blur). */
const glowOf = (c: number) => {
  let s = glows[c];
  if (!s) {
    const R = 32;
    s = canvasOf(R * 2, R * 2); const g = s.getContext('2d')!;
    const [r, gg, b] = rgb(COLORS[c]);
    for (let k = 5; k >= 1; k--) { g.fillStyle = `rgba(${r},${gg},${b},${(0.1 * (6 - k) / 5 + 0.04).toFixed(3)})`; g.beginPath(); g.arc(R, R, (R * k) / 5, 0, Math.PI * 2); g.fill(); }
    glows[c] = s;
  }
  return s;
};
/** Paint the sprites ahead, a few at a time, when the browser's idle (the show's hour reached). */
let warmed = false;
const warm = () => {
  if (warmed || typeof document === 'undefined') return;
  warmed = true;
  let i = 0;
  const idle = (cb: () => void) => (typeof requestIdleCallback === 'function' ? requestIdleCallback(cb, { timeout: 200 }) : setTimeout(cb, 16));
  const next = () => { if (i >= COLORS.length) return; sparkOf(i); glowOf(i); i++; idle(next); };
  idle(next);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/**
 * The show over a sky box (screen space: x, y, w, h, the box the stars are in), its sparks `pxSize` px a game pixel
 * (2: the screen's own; 1: the walk screens' half-size picture). timeOfDay.ts drawStars calls it.
 */
export const drawFireworks = (c: Ctx, x: number, y: number, w: number, h: number, pxSize = 2) => {
  if (!fireworksHour() || typeof document === 'undefined' || !isLive(c) || h <= 4) return;
  warm();
  advance();
  sinceSky = 0;
  if ((c.canvas as HTMLCanvasElement).isConnected) mainAt = performance.now();
  const sc = pxSize / 2;
  c.save();
  c.imageSmoothingEnabled = false;
  c.beginPath(); c.rect(x, y, w, h); c.clip();
  // The flashes: the sky round each lit up its color, stepped, fading
  for (const f of flashes) {
    const k = f.t < 3 ? 1 : Math.max(0, 1 - (f.t - 3) / 23);
    if (k <= 0) continue;
    const cx = x + f.u * w, cy = y + f.v * h, r = f.r * 2.6 * sc * (0.8 + 0.2 * Math.min(1, f.t / 6));
    c.globalAlpha = k * 0.9;
    c.drawImage(glowOf(f.c), Math.round(cx - r), Math.round(cy - r), Math.round(r * 2), Math.round(r * 2));
  }
  // The shells going up: a spark and a short fading trail
  for (const s of shells) {
    const k = s.t / s.len, e = 1 - (1 - k) * (1 - k);
    const v = s.v + (s.to - s.v) * e, sx = x + s.u * w + Math.sin(s.t * 0.7) * 0.6 * sc, sy = y + v * h;
    const sz = Math.max(1, Math.round(2 * sc));
    for (let j = 3; j >= 1; j--) { c.globalAlpha = 0.18 * (4 - j); c.drawImage(sparkOf(GOLD), Math.round(sx), Math.round(sy + j * 3 * sc), sz, sz); }
    c.globalAlpha = 1;
    c.drawImage(sparkOf(GOLD), Math.round(sx), Math.round(sy), sz, sz);
  }
  // The sparks
  const big = Math.max(2, Math.round(4 * sc)), small = Math.max(1, Math.round(3 * sc));
  for (let i = 0; i < MAX; i++) {
    if (!on[i]) continue;
    const k = 1 - life[i] / maxL[i];
    // (going out: twinkling, then gone)
    if (k < 0.3 && (life[i] + i) % 4 < 2) continue;
    const X = x + bu[i] * w + px[i] * sc, Y = y + bv[i] * h + py[i] * sc;
    if (X < x - 4 || X > x + w + 4 || Y < y - 4 || Y > y + h + 4) continue;
    const sp = sparkOf(col[i]);
    c.globalAlpha = k > 0.5 ? 1 : 0.45 + k;
    const sz = kind[i] === 3 ? small : k > 0.55 ? big : small;
    c.drawImage(sp, Math.round(X), Math.round(Y), sz, sz);
    // (a willow's: a tail hanging off it)
    if (kind[i] === 1) { c.globalAlpha *= 0.5; c.drawImage(sp, Math.round(X - vx[i] * 3 * sc), Math.round(Y - vy[i] * 3 * sc - small), small, small * 2); }
  }
  c.restore();
};

/** The walk screen's up over it all this frame: no wash over its bars. */
export const skipFireworksWash = () => { noWash = true; };

/**
 * The faintest wash of the bursts' colors over the outdoor picture (screen space, over the world, under the HUD):
 * only on a frame a sky on the screen drew the show. world.ts's screen overlay (upgrades/apply.ts) calls it.
 */
export const drawFireworksWash = (c: Ctx) => {
  const skip = noWash; noWash = false;
  if (skip || performance.now() - mainAt > 30 || !flashes.length || !fireworksHour()) return;
  let best: Flash | null = null, bk = 0;
  for (const f of flashes) { const k = f.t < 3 ? 1 : Math.max(0, 1 - (f.t - 3) / 23); if (k > bk) { bk = k; best = f; } }
  if (!best || bk < 0.05) return;
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.globalAlpha = 0.045 * bk;
  c.fillStyle = COLORS[best.c];
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillRect(0, 0, c.canvas.width, c.canvas.height);
  c.restore();
};

/** (dev: what's going) */
export const fireworksStats = () => ({ alive, shells: shells.length, flashes: flashes.length });
if (import.meta.env.DEV && typeof window !== 'undefined') (window as unknown as { __fw: typeof fireworksStats }).__fw = fireworksStats;
