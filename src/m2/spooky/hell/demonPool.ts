// Brathazar's way out: beaten, he sinks away into a lava puddle that opens under him (demon.ts's 'sink'; its timing,
// SINK frames, is his: this is only the look of it). A set piece in SNES steps:
//   the floor cracks from his feet, lit from under; the puddle opens out of it: a molten pool, white-hot in the middle,
//   banding out (dithered) through orange to deep red and a black crusted rim, crust plates slowly churning round;
//   a crown of lava splashes up round him as he goes in (the back half behind him, the front half in front), droplets
//   flung; a whirlpool turns in it as he goes down, rings of heat spreading out over the floor, steam and smoke off him,
//   bubbles swelling and popping, a shimmer and a few embers over it; it seethes brighter as the last of him goes under,
//   and a last gulp of it throws up a column of lava and rock. Then it crusts over and cools to a scorch mark.
// The pool's body is a stamp (8 churn frames × hot/cooling): one drawImage a frame; everything over it is a few fills.

import type { GameState } from '../../../m1/game/core/state';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { hazeBands } from '../../../m1/game/render/pixelArt';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { GY } from '../geometry';
import { type Ctx, INK, box, hash, stamp, LAVA, BASALT } from './paint';

/** The pool's half-width and half-height (it straddles the floor line). */
const RX = 84, RY = 11;
/** Churn frames (the plates come round to where they started after all of them), and game frames each. */
const CHURN = 8, CHURN_EVERY = 7;
/** The splash crown's life; the cooling (after he's gone) till it's a scorch mark. */
const CROWN_T = 28, GULP_T = 18, COOL_T = 150;

// ---------------------------------------------------------------------------------------------------------------
// The pool (stamped)

/**
 * The pool, centred on (0, 0), painted cell by cell (2 px) the once: bands by how far in (dithered across each step),
 * the crust plates (dark, their seams white-hot) where they've drifted to at churn frame `k`. `hot`: seething (all of it
 * a step hotter, the seams white). `cool` 0..3: crusting over (the plates grown, the heat down).
 */
const paintPool = (g: Ctx, rx: number, ry: number, k: number, hot: boolean, cool: number) => {
  const turn = (Math.PI * 2 / 6) * (k / CHURN);
  const plates: [number, number, number][] = [];
  // (six round the outside, turning one way; three in nearer, the other way: they loop with the churn)
  for (let j = 0; j < 6; j++) {
    const a = j * Math.PI / 3 + turn + hash(j) * 0.4, r = 0.6 + hash(j + 9) * 0.12;
    plates.push([Math.cos(a) * r, Math.sin(a) * r, (0.15 + hash(j + 3) * 0.06) * (1 + cool * 0.5)]);
  }
  for (let j = 0; j < 3; j++) {
    const a = j * Math.PI * 2 / 3 - turn * 2 + 0.5;
    plates.push([Math.cos(a) * 0.32, Math.sin(a) * 0.32, 0.08 + cool * 0.07]);
  }
  for (let iy = -ry; iy < ry; iy += 2) for (let ix = -rx; ix < rx; ix += 2) {
    const nx = (ix + 1) / rx, ny = (iy + 1) / ry, ang = Math.atan2(ny, nx);
    // (the rim ragged: lumps of crust round it)
    const n = Math.hypot(nx, ny) * (1 + 0.07 * (hash(Math.floor((ang + 4) * 6)) - 0.5));
    if (n > 1) continue;
    const odd = ((ix + iy) >> 1) & 1;
    let col: string;
    if (n > 0.93) col = INK;
    else if (n > 0.82) col = odd && n < 0.87 ? LAVA[cool > 1 ? 1 : 2] : BASALT[2 + (hash(ix * 0.3 + iy) > 0.7 ? 1 : 0)];
    else {
      let pd = 9;
      for (const [px, py, ps] of plates) pd = Math.min(pd, Math.hypot(nx - px, (ny - py) * 0.8) / ps);
      if (pd < 1) col = pd > 0.72 ? LAVA[0] : odd && pd > 0.5 ? LAVA[0] : BASALT[2 + (odd && pd < 0.3 ? 1 : 0)];
      else if (pd < 1.28) col = cool >= 2 ? LAVA[2] : cool ? LAVA[4] : hot ? LAVA[7] : LAVA[6];
      else {
        // (0 at the crust, 1 in the middle; the core a hair up: it's lit from above)
        let v = 1 - Math.hypot(nx, (ny + 0.15) * 1.1) / 0.84;
        v = v * (1 - cool * 0.25) + (hot ? 0.2 : 0) - cool * 0.12;
        const idx = Math.max(1, Math.min(7, 1 + v * 6.6)), i = Math.floor(idx);
        col = LAVA[Math.min(7, idx - i > 0.5 && odd ? i + 1 : i)];
      }
    }
    box(g, ix, iy, 2, 2, col);
  }
};

/** What's left: a black crusted scorch, the odd ember in it still. */
const paintScorch = (g: Ctx, rx: number, ry: number) => {
  for (let iy = -ry; iy < ry; iy += 2) for (let ix = -rx; ix < rx; ix += 2) {
    const nx = (ix + 1) / rx, ny = (iy + 1) / ry, ang = Math.atan2(ny, nx);
    const n = Math.hypot(nx, ny) * (1 + 0.12 * (hash(Math.floor((ang + 4) * 5) + 3) - 0.5));
    if (n > 1) continue;
    const odd = ((ix + iy) >> 1) & 1, h = hash(ix * 0.37 + iy * 1.9);
    if (n > 0.86 && odd) continue;
    let col = n > 0.7 ? BASALT[1] : odd ? BASALT[2] : BASALT[1];
    if (n < 0.7 && h > 0.86) col = BASALT[3];
    if (n < 0.5 && h > 0.975) col = LAVA[1];
    if (n < 0.35 && h > 0.99) col = LAVA[3];
    box(g, ix, iy, 2, 2, col);
  }
  // (its cracks, crazed across it)
  for (let i = 0; i < 5; i++) {
    const x0 = Math.round((hash(i * 4.1) - 0.5) * rx * 1.2 / 2) * 2, y0 = Math.round((hash(i * 2.3) - 0.5) * ry / 2) * 2;
    box(g, x0, y0, 6 + Math.round(hash(i) * 8) * 2, 2, INK);
  }
};

const pool = (c: Ctx, x: number, k: number, hot: boolean, cool: number, open: number) => {
  const rx = RX - cool * 6, ry = RY - cool;
  c.save(); c.translate(Math.round(x), GY);
  if (open < 1) { c.beginPath(); c.ellipse(0, 0, rx * open + 1, ry * open + 1, 0, 0, Math.PI * 2); c.clip(); }
  stamp(c, `demon-pool-${k}-${hot ? 1 : 0}-${cool}`, -rx - 2, -ry - 2, rx * 2 + 4, ry * 2 + 4, g => paintPool(g, rx, ry, k, hot, cool));
  c.restore();
};
const scorch = (c: Ctx, x: number) => {
  const rx = RX - 14, ry = RY - 3;
  c.save(); c.translate(Math.round(x), GY);
  stamp(c, 'demon-pool-scorch', -rx - 2, -ry - 2, rx * 2 + 4, ry * 2 + 4, g => paintScorch(g, rx, ry));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Live over it (a few fills each)

/** The cracks: out from the pool both ways across the floor's face, jagged, lit from under. */
const CRACKS = Array.from({ length: 6 }, (_, i) => {
  const dir = i % 2 ? 1 : -1, n = 8 + Math.floor(hash(i * 1.7) * 10), y0 = GY + 2 + Math.floor(hash(i + 5) * 5) * 2;
  const ys: number[] = [];
  let y = y0;
  for (let s = 0; s < n; s++) { y += Math.round((hash(i * 11 + s) - 0.5) * 3) * 2; y = Math.max(GY + 2, Math.min(GY + 16, y)); ys.push(y); }
  return { dir, ys, x0: RX * (0.72 + hash(i + 2) * 0.1) };
});
const cracks = (c: Ctx, x: number, grow: number, heat: number) => {
  for (const k of CRACKS) {
    const n = Math.floor(k.ys.length * grow);
    for (let s = 0; s < n; s++) {
      const xx = Math.round(x + k.dir * (k.x0 + s * 8)) - (k.dir < 0 ? 8 : 0), y = k.ys[s], far = s / k.ys.length;
      box(c, xx, y - 2, 8, 6, INK);
      if (heat <= 0) continue;
      const col = heat > 0.8 ? (far < 0.4 ? LAVA[7] : far < 0.75 ? LAVA[6] : LAVA[4]) : heat > 0.4 ? (far < 0.5 ? LAVA[5] : LAVA[3]) : LAVA[1 + (far < 0.5 ? 1 : 0)];
      box(c, xx, y, 8, 2, col);
    }
  }
};

/** The crown splashed up round him as he goes in: spikes of lava round the rim, rising and falling, a drop flung off
 *  each one's top. `back`: the far half (behind him). */
const crown = (c: Ctx, x: number, t: number, back: boolean) => {
  if (t >= CROWN_T) return;
  const u = t / CROWN_T, rise = Math.sin(Math.PI * Math.min(1, u * 1.25));
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + 0.2, s = Math.sin(a);
    if ((s < 0) !== back) continue;
    const bx = Math.round(x + Math.cos(a) * RX * 0.78), by = Math.round(GY + s * RY * 0.7);
    const h = Math.round((28 + hash(i * 3.3) * 36) * rise * (back ? 1.2 : 0.85)), lean = Math.cos(a) * 0.4;
    if (h >= 4) {
      for (let y = 0; y < h; y += 4) { const w = Math.max(2, Math.round((10 - 8 * y / h) / 2) * 2); box(c, bx + Math.round(lean * y) - w / 2 - 2, by - y - 6, w + 4, 6, INK); }
      for (let y = 0; y < h; y += 4) {
        const k = y / h, w = Math.max(2, Math.round((10 - 8 * k) / 2) * 2);
        box(c, bx + Math.round(lean * y) - w / 2, by - y - 4, w, 4, k < 0.3 ? LAVA[4] : k < 0.65 ? LAVA[6] : LAVA[7]);
      }
    }
    if (u > 0.4) {
      const dy = (28 + hash(i * 3.3) * 36) * 0.8 + (u - 0.4) * 50 - (u - 0.4) * (u - 0.4) * 160, dx = lean * 60 * (u - 0.2);
      box(c, Math.round(bx + dx) - 3, Math.round(by - dy) - 3, 6, 6, INK); box(c, Math.round(bx + dx) - 2, Math.round(by - dy) - 2, 4, 4, LAVA[6]);
    }
  }
};

/** The whirlpool as he goes down: three bright arms turning in, a dark eye where he is. */
const whirl = (c: Ctx, x: number, t: number) => {
  const k = Math.max(0, Math.min(1, (t - 14) / 30));
  if (k <= 0) return;
  const rot = -t * 0.13;
  for (let arm = 0; arm < 3; arm++) for (let s = 0; s < 9 * k; s++) {
    const r = 0.14 + s * 0.085, a = rot + arm * 2.094 + s * 0.55;
    const px = Math.round((x + Math.cos(a) * r * RX) / 2) * 2, py = GY + Math.round(Math.sin(a) * r * RY / 2) * 2;
    box(c, px - 2, py + 2, 6, 2, LAVA[1]);
    box(c, px - 2, py, 6, 2, s < 3 ? LAVA[7] : s % 2 ? LAVA[6] : LAVA[5]);
  }
  c.fillStyle = LAVA[1]; c.beginPath(); c.ellipse(Math.round(x), GY, 16 * k, 4 * k, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = INK; c.beginPath(); c.ellipse(Math.round(x), GY, 9 * k, 2 * k, 0, 0, Math.PI * 2); c.fill();
};

/** Rings of heat spreading out over the floor from it. */
const RING_AT = [8, 30, 52, 74, 96];
const rings = (c: Ctx, x: number, t: number) => {
  c.lineWidth = 2;
  for (const s of RING_AT) {
    const age = t - s;
    if (age < 0 || age >= 30) continue;
    const rx = RX + 4 + age * 3.4, ry = RY + age * 0.45;
    c.globalAlpha = 0.7 * (1 - age / 30);
    c.strokeStyle = LAVA[5]; c.beginPath(); c.ellipse(Math.round(x), GY, rx, ry, 0, 0, Math.PI * 2); c.stroke();
    if (age < 12) { c.strokeStyle = LAVA[7]; c.beginPath(); c.ellipse(Math.round(x), GY, rx - 4, ry - 1, 0, 0, Math.PI * 2); c.stroke(); }
  }
  c.globalAlpha = 1;
};

/** Bubbles swelling up out of it and popping, a little spatter off each. */
const bubbles = (c: Ctx, x: number, f: number, n: number) => {
  for (let i = 0; i < n; i++) {
    const P = 34 + i * 9, ft = f + i * 13, cyc = Math.floor(ft / P), u = (ft % P) / P;
    const bx = Math.round((x + (hash(i * 7 + cyc) - 0.5) * RX * 1.2) / 2) * 2, by = GY - 2 + Math.round((hash(i * 3 + cyc * 1.7) - 0.5) * RY * 0.8 / 2) * 2;
    if (u < 0.78) {
      const r = 1 + Math.round(u / 0.78 * 4);
      for (let row = 0; row <= r; row++) {
        const w = Math.max(1, Math.round(Math.sqrt(r * r - row * row)));
        box(c, bx - w * 2 - 2, by - row * 2 - 2, w * 4 + 4, 4, INK);
      }
      for (let row = 0; row < r; row++) {
        const w = Math.max(1, Math.round(Math.sqrt(r * r - row * row)));
        box(c, bx - w * 2, by - row * 2 - 2, w * 4, 2, row > r * 0.6 ? LAVA[6] : LAVA[4]);
      }
      box(c, bx - r, by - r * 2, 2, 2, LAVA[7]);
    } else {
      const v = (u - 0.78) / 0.22;
      if (v < 0.3) box(c, bx - 6, by - 2, 12, 2, LAVA[7]);
      for (const [dx, up] of [[-1, 1], [1, 1.2], [-0.5, 1.7], [0.6, 1.5]] as [number, number][]) {
        box(c, Math.round(bx + dx * (4 + v * 12)) - 1, Math.round(by - up * v * 14 + v * v * 18) - 1, 2, 2, v < 0.5 ? LAVA[7] : LAVA[5]);
      }
    }
  }
};

/** The heat over it: a shimmer of glow, a few wavering lines rising. */
const shimmer = (c: Ctx, x: number, f: number, k: number) => {
  hazeBands(c, Math.round(x - RX), GY - 70, RX * 2, 62, LAVA[5], 0, 0.1 * k, 4);
  c.globalAlpha = 0.2 * k;
  for (let i = 0; i < 4; i++) {
    const y = GY - 14 - ((f * 1.3 + i * 17) % 64), wob = Math.round(Math.sin(f * 0.15 + i * 2 + y * 0.1) * 6);
    box(c, Math.round(x - 30 + i * 14 + wob), Math.round(y), 22, 2, LAVA[6]);
  }
  c.globalAlpha = 1;
};

/** A column of lava thrown up (the last gulp): banded, white at the core, wobbling. */
const column = (c: Ctx, x: number, age: number, f: number) => {
  const h = Math.round(120 * Math.sin(Math.PI * age / GULP_T)), top = GY - h;
  for (const [ww, col] of [[34, INK], [30, LAVA[2]], [22, LAVA[4]], [14, LAVA[6]], [6, LAVA[7]]] as [number, string][]) {
    for (let y = Math.floor(top / 6) * 6; y < GY; y += 6) {
      const k = (y - top) / Math.max(1, h), w = Math.round(ww * (0.55 + 0.45 * k) / 2) * 2, wob = Math.round(Math.sin(f * 0.6 + y * 0.08) * 2);
      box(c, Math.round(x) - w / 2 + wob, y, w, 6, col);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------

/** How hot it's running, as the last of him goes under: 0 (just a pool), 1 (seething). */
const seethe = (t: number, sinkT: number) => Math.max(0, Math.min(1, (t - sinkT * 0.55) / (sinkT * 0.3)));

/** Behind him, while he sinks: the glow up off it (him against it, backlit), the crown's far half. */
export const drawSinkBack = (c: Ctx, x: number, t: number, sinkT: number) => {
  const open = Math.min(1, t / 10), s = seethe(t, sinkT);
  hazeBands(c, Math.round(x - 74), GY - 220, 148, 220, LAVA[5], 0, (0.1 + 0.12 * s) * open, 6);
  hazeBands(c, Math.round(x - 40), GY - 120, 80, 120, LAVA[6], 0, (0.08 + 0.1 * s) * open, 4);
  crown(c, x, t, true);
};

/** In front of him, while he sinks: the cracks, the rings, the pool, the whirlpool, bubbles, the crown's near half. */
export const drawSinkFront = (c: Ctx, x: number, t: number, f: number, sinkT: number) => {
  const open = Math.min(1, t / 10), ease = 1 - (1 - open) ** 3, s = seethe(t, sinkT);
  cracks(c, x, Math.min(1, t / 9), t < 30 ? 1 : 0.5 + 0.5 * s);
  rings(c, x, t);
  const hot = s >= 1 || (s > 0 && (f >> 2) % 2 === 0);
  pool(c, x, Math.floor(f / (hot ? 4 : CHURN_EVERY)) % CHURN, hot, 0, 0.25 + 0.75 * ease);
  whirl(c, x, t);
  bubbles(c, x, f, 3 + Math.round(s * 2));
  crown(c, x, t, false);
  shimmer(c, x, f, 0.6 + 0.4 * s);
};

/** After he's gone (`age` frames since): the last gulp, the pool crusting over and cooling, then the scorch it leaves. */
export const drawSunk = (c: Ctx, state: GameState, x: number, age: number) => {
  if (x < state.camera.x - 300 || x > state.camera.x + CANVAS_WIDTH + 300) return;
  const f = state.frame;
  if (age < 0 || age >= COOL_T) { cracks(c, x, 1, 0); scorch(c, x); return; }
  const cool = Math.min(3, Math.floor(age / (COOL_T / 4)));
  cracks(c, x, 1, Math.max(0, 0.6 - age / COOL_T));
  pool(c, x, Math.floor(f / (CHURN_EVERY * (1 + cool))) % CHURN, age < GULP_T, cool, 1);
  if (age < 50) bubbles(c, x, f, 2);
  if (age < GULP_T) column(c, x, age, f);
  shimmer(c, x, f, Math.max(0, 1 - age / COOL_T));
};

/** His sinking's own bits each frame (t: frames into it): the splash flung up, steam and smoke off him, embers. */
export const sinkFx = (state: GameState, x: number, t: number) => {
  const P = state.particles;
  if (t === 2) {
    playSound('splash', 1, -6); shakeScreen(state, 6, 4);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      P.push({ pos: { x: x + Math.cos(a) * RX * 0.7, y: GY - 6 }, vel: { x: Math.cos(a) * (2 + Math.random() * 3), y: -6 - Math.random() * 6 }, life: 40, color: LAVA[5 + (i % 3)], size: 3 + Math.random() * 2, grav: 0.45, chunk: true });
    }
  }
  if (t > 6 && t % 3 === 0) P.push({ pos: { x: x + (Math.random() - 0.5) * 70, y: GY - 10 - Math.random() * 20 }, vel: { x: (Math.random() - 0.5) * 0.8, y: -1 - Math.random() * 1.2 }, life: 46, color: Math.random() < 0.5 ? '#57534E' : '#78716C', size: 6 + Math.random() * 4 });
  if (t % 5 === 0) P.push({ pos: { x: x + (Math.random() - 0.5) * RX * 1.4, y: GY - 4 }, vel: { x: (Math.random() - 0.5) * 1.5, y: -2 - Math.random() * 2.5 }, life: 30, color: Math.random() < 0.5 ? LAVA[6] : LAVA[7], size: 2 });
};
/** The last gulp, as the last of him goes under: lava and rock thrown up. */
export const sinkGulp = (state: GameState, x: number) => {
  const P = state.particles;
  playSound('splash', 0.9, -8); shakeScreen(state, 8, 5);
  for (let i = 0; i < 14; i++) P.push({ pos: { x: x + (Math.random() - 0.5) * 20, y: GY - 20 - Math.random() * 60 }, vel: { x: (Math.random() - 0.5) * 7, y: -5 - Math.random() * 7 }, life: 44, color: LAVA[4 + (i % 4)], size: 3 + Math.random() * 3, grav: 0.45, chunk: true });
  for (let i = 0; i < 6; i++) P.push({ pos: { x: x + (Math.random() - 0.5) * 16, y: GY - 30 }, vel: { x: (Math.random() - 0.5) * 8, y: -6 - Math.random() * 5 }, life: 60, color: BASALT[3 + (i % 3)], size: 4 + Math.random() * 3, grav: 0.5, chunk: true });
};
