// The hole to hell in the dance floor (fight.ts's f.circle: 0 shut, 1 wide open; its timing, the lines and all that
// goes on round it are the fight's: this is only the look of it). A set piece in SNES steps, on the hell demon's lava
// pool (hell/demonPool.ts: the same ramps and ink):
//   the floor cracks open, glowing seams racing out across the tiles; tiles tip and drop in; the hole's throat a molten
//   core, white-hot down in it, banding (dithered) through orange to deep red, swirling, ringed by a jagged black
//   crust split by glowing seams; stepped tongues of flame roaring up round the rim and out of the middle (a far half
//   behind, a near half in front), each a stamped flicker cycle; embers, heat shimmer, smoke rising and rolling out
//   along the ceiling, lit red from under; a column of light up out of it that Satan stands in, backlit (fight.ts
//   draws him between the back and the front of it). Closing: the flames sucked down and in, the crust slamming shut
//   in steps, and what's left a scorched scar, its seams cooling, smoking.
// Stamped: the hole's body (by size step and churn frame), the flame tongues (by size and flicker frame), the smoke
// puffs, the scar. Live: a few fills (the cracks, the tiles falling, the column, the shimmer).

import type { GameState } from '../../../m1/game/core/state';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { GY } from '../geometry';
import { INK, box, checker, hazeBands, stamp, hash, CEIL } from '../control/paint';
import { LAVA, BASALT } from '../hell/paint';
import { CIRCLE_X } from './arena';

type Ctx = CanvasRenderingContext2D;

/** Wide open: its half-width and half-height (the same as it always was), where it sits on the floor. */
const RX = 110, RY = 16, CY = GY - 4;
/** Churn frames for the throat's swirl, game frames each; flicker frames for the tongues, game frames each. */
const CHURN = 6, CHURN_EVERY = 5, FLICK = 8, FLICK_EVERY = 3;
/** Size steps it opens and shuts in. */
const STEPS = 10;
/** After it's shut: the seams cooling, the smoke off it (frames). */
const COOL_T = 160, SMOKE_T = 320;

/** What it's done so far (the fight's own, from startFight: a fresh one each fight). */
export interface Pit { prev: number; age: number; closing: boolean; shut: number; scar: boolean }
export const newPit = (): Pit => ({ prev: 0, age: 0, closing: false, shut: -1, scar: false });

// ---------------------------------------------------------------------------------------------------------------
// Stamps

/** The hole, centred on (0, 0), cell by cell (2 px): the crust rim, its seams, the throat banding down to the core. */
const paintHole = (g: Ctx, rx: number, ry: number, k: number) => {
  const turn = (Math.PI * 2) * (k / CHURN);
  for (let iy = -ry; iy < ry; iy += 2) for (let ix = -rx; ix < rx; ix += 2) {
    const nx = (ix + 1) / rx, ny = (iy + 1) / ry, ang = Math.atan2(ny, nx);
    // (the rim jagged: broken tiles round it)
    const n = Math.hypot(nx, ny) * (1 + 0.1 * (hash(Math.floor((ang + 4) * 7)) - 0.5));
    if (n > 1) continue;
    const odd = ((ix + iy) >> 1) & 1;
    let col: string;
    if (n > 0.92) col = INK;
    else if (n > 0.72) {
      // (the crust: black-red plates, split by glowing seams; its inner lip lit from the fire under it)
      const s = (ang + Math.PI) / (Math.PI * 2) * 13, si = Math.floor(s), fr = s - si + (hash(si * 3.1) - 0.5) * 0.3;
      if (fr < 0.09 || fr > 0.95) col = n < 0.84 ? LAVA[6] : LAVA[4];
      else if (n < 0.76) col = odd ? LAVA[3] : BASALT[3];
      else col = BASALT[(hash(ix * 0.31 + iy * 1.7) > 0.75 ? 3 : 2) - (n > 0.88 ? 1 : 0)];
    } else {
      // (the throat: looked down into from the front, the core down low in it; the far wall's dark streaks)
      let v = 1 - Math.hypot(nx, (ny - 0.3) * 1.2) / 0.78;
      const sw = Math.sin(ang * 5 + v * 9 - turn);
      if (sw > 0.72) v += 0.14; else if (sw < -0.85) v -= 0.08;
      if (ny < -0.15 && hash(Math.floor(ix / 6) * 1.3) > 0.68) v -= 0.12;
      const idx = Math.max(0, Math.min(7, 0.6 + v * 7.2)), i = Math.floor(idx);
      col = LAVA[Math.min(7, idx - i > 0.5 && odd ? i + 1 : i)];
    }
    box(g, ix, iy, 2, 2, col);
  }
};
const hole = (c: Ctx, k: number, ch: number) => {
  const step = Math.max(1, Math.round(k * STEPS)), q = step / STEPS;
  const rx = Math.max(4, Math.round(RX * q / 2) * 2), ry = Math.max(2, Math.round(RY * q / 2) * 2);
  c.save(); c.translate(Math.round(CIRCLE_X), CY);
  stamp(c, `ballpit-hole-${step}-${ch}`, -rx - 2, -ry - 2, rx * 2 + 4, ry * 2 + 4, g => paintHole(g, rx, ry, ch));
  c.restore();
};

/** A tongue of flame, its foot at (0, 0): stepped bands inked round, swaying up to a broken-off tip (flicker frame k). */
const TONGUE_H = [30, 46, 66, 96];
const paintTongue = (g: Ctx, v: number, k: number) => {
  const ph = (k / FLICK) * Math.PI * 2 + v * 1.3, H = TONGUE_H[v] * (0.84 + 0.16 * Math.sin(ph)), W = 8 + v * 2;
  const rows: [number, number, number][] = [];
  for (let y = 0; y < H; y += 2) {
    const u = y / H, w = Math.max(1, Math.round(W * Math.pow(1 - u, 0.75)));
    const sx = Math.round(Math.sin(u * 3.2 + ph) * u * 5 + Math.sin(u * 8 + ph * 2) * u * 1.5);
    rows.push([y, w, sx]);
  }
  for (const [y, w, sx] of rows) box(g, sx - w - 2, -y - 2, w * 2 + 4, 4, INK);
  for (const [y, w, sx] of rows) {
    const u = y / H;
    box(g, sx - w, -y - 2, w * 2, 2, u > 0.8 ? LAVA[2] : LAVA[3]);
    if (u < 0.82) { const w2 = Math.max(1, Math.round(w * 0.68)); box(g, sx - w2, -y - 2, w2 * 2, 2, u > 0.6 ? LAVA[4] : LAVA[5]); }
    if (u < 0.58) { const w3 = Math.max(1, Math.round(w * 0.42)); box(g, sx - w3, -y - 2, w3 * 2, 2, LAVA[6]); }
    if (u < 0.3) { const w4 = Math.max(1, Math.round(w * 0.2)); box(g, sx - w4, -y - 2, w4 * 2, 2, LAVA[7]); }
  }
  // (the tip, broken off and going up on its own)
  if (k % 3 !== 2) {
    const ty = Math.round(H + 6 + (k % 3) * 5), tx = Math.round(Math.sin(ph + 2) * 5);
    box(g, tx - 4, -ty - 4, 8, 8, INK); box(g, tx - 2, -ty - 2, 4, 4, k % 3 ? LAVA[4] : LAVA[5]);
  }
};
/** Put down unscaled (so it stays a stamp); `sink` px of it down under the rim (cut off there): how it grows up out
 *  of the hole, and how it's sucked back down into it. */
const tongue = (c: Ctx, x: number, y: number, v: number, k: number, sink: number) => {
  const H = TONGUE_H[v] + 26, W = 14 + v * 2, X = Math.round(x), Y = Math.round(y);
  if (sink >= H - 4) return;
  c.save();
  if (sink > 0) { c.beginPath(); c.rect(X - W - 8, Y - H - 4, W * 2 + 16, H + 4); c.clip(); }
  c.translate(X, Y + Math.round(sink / 2) * 2);
  stamp(c, `ballpit-tongue-${v}-${k}`, -W - 6, -H, W * 2 + 12, H + 4, g => paintTongue(g, v, k));
  c.restore();
};

/** A puff of smoke (stepped: dark round, a lighter top, a dither edge); variant v. */
const PUFF = [[26, 12], [34, 15], [44, 18], [56, 22]];
const paintPuff = (g: Ctx, v: number) => {
  const [rw, rh] = PUFF[v];
  for (let iy = -rh; iy < rh; iy += 2) for (let ix = -rw; ix < rw; ix += 2) {
    const nx = (ix + 1) / rw, ny = (iy + 1) / rh, a = Math.atan2(ny, nx);
    const n = Math.hypot(nx, ny) * (1 + 0.22 * (hash(Math.floor((a + 4) * 3) + v * 7) - 0.5));
    if (n > 1) continue;
    const odd = ((ix + iy) >> 1) & 1;
    if (n > 0.86 && odd) continue;
    // (lit red from under; a cooler gray up on its top)
    const col = ny > 0.45 ? (odd ? '#4A1A1A' : '#3A1416') : ny < -0.35 && n < 0.8 ? '#3D3440' : '#2A2028';
    box(g, ix, iy, 2, 2, col);
  }
};
const puff = (c: Ctx, x: number, y: number, v: number, a: number) => {
  if (a <= 0.01) return;
  const [rw, rh] = PUFF[v];
  // (its alpha in steps: the stamps are keyed by it)
  c.save(); c.globalAlpha = Math.max(1, Math.round(Math.min(1, a) * 8)) / 8; c.translate(Math.round(x / 2) * 2, Math.round(y / 2) * 2);
  stamp(c, `ballpit-puff-${v}`, -rw, -rh, rw * 2, rh * 2, g => paintPuff(g, v));
  c.restore();
};

/** What's left: a scorched scar in the tiles, black in the middle, broken tile and soot round it, crazed. */
const paintScar = (g: Ctx, rx: number, ry: number) => {
  for (let iy = -ry; iy < ry; iy += 2) for (let ix = -rx; ix < rx; ix += 2) {
    const nx = (ix + 1) / rx, ny = (iy + 1) / ry, ang = Math.atan2(ny, nx);
    const n = Math.hypot(nx, ny) * (1 + 0.16 * (hash(Math.floor((ang + 4) * 6) + 5) - 0.5));
    if (n > 1) continue;
    const odd = ((ix + iy) >> 1) & 1, h = hash(ix * 0.37 + iy * 1.9);
    if (n > 0.82 && odd) continue;
    let col = n > 0.66 ? '#1C0E14' : odd ? BASALT[1] : BASALT[0];
    if (n < 0.66 && h > 0.88) col = BASALT[3];
    if (n > 0.6 && n < 0.7 && odd) col = '#2E1065';
    box(g, ix, iy, 2, 2, col);
  }
  // (the crust's seam where it slammed shut, and its cracks across it)
  box(g, -Math.round(rx * 0.7 / 2) * 2, 0, Math.round(rx * 0.7 / 2) * 4, 2, INK);
  for (let i = 0; i < 6; i++) {
    const x0 = Math.round((hash(i * 4.1) - 0.5) * rx * 1.3 / 2) * 2, y0 = Math.round((hash(i * 2.3) - 0.5) * ry * 1.2 / 2) * 2;
    box(g, x0, y0, 6 + Math.round(hash(i) * 10) * 2, 2, INK);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Live

/** The cracks: racing out from it over the tiles every way, jagged, sampled every 4 px (out to `far` 1). */
const CRACKS = Array.from({ length: 12 }, (_, i) => {
  const a0 = (i / 12) * Math.PI * 2 + (hash(i * 2.7) - 0.5) * 0.4, len = 0.45 + hash(i * 1.3) * 0.6, pts: [number, number, number][] = [];
  let a = a0, r = 0.9;
  while (r < 1 + len) {
    const px = Math.cos(a) * RX * r, py = Math.sin(a) * RY * r * 1.6;
    pts.push([Math.round(px / 2) * 2, Math.round(Math.max(-30, Math.min(22, py)) / 2) * 2, (r - 0.9) / (len + 0.1)]);
    r += 4 / Math.max(8, Math.abs(Math.cos(a)) * RX + 4); a += (hash(i * 31 + pts.length) - 0.5) * 0.08;
  }
  return pts;
});
const cracks = (c: Ctx, grow: number, heat: number) => {
  for (const k of CRACKS) {
    const n = Math.floor(k.length * grow);
    for (let s = 0; s < n; s++) box(c, CIRCLE_X + k[s][0] - 2, CY + k[s][1] - 2, 6, 4, INK);
    if (heat <= 0) continue;
    for (let s = 0; s < n; s++) {
      const far = k[s][2];
      const col = heat > 0.75 ? (far < 0.35 ? LAVA[7] : far < 0.7 ? LAVA[6] : LAVA[4]) : heat > 0.4 ? (far < 0.5 ? LAVA[5] : LAVA[3]) : far < 0.5 ? LAVA[2] : LAVA[1];
      box(c, CIRCLE_X + k[s][0] - 1, CY + k[s][1] - 1, 4, 2, col);
    }
  }
};

/** Tiles of the dance floor tipping in off the rim and dropping, while it opens. */
const TILES = Array.from({ length: 11 }, (_, i) => ({
  t0: i * 5 + Math.floor(hash(i * 5.3) * 6), a: (i / 11) * Math.PI * 2 + hash(i) * 0.5, r0: 1.04 + hash(i * 1.9) * 0.22,
  col: hash(i * 7.7) > 0.8 ? ['#F472B6', '#60A5FA', '#FDE047', '#A78BFA'][i % 4] : i % 2 ? '#2E1065' : '#4C1D95', spin: hash(i * 3.3) > 0.5 ? 1 : -1,
}));
const tiles = (c: Ctx, age: number, k: number) => {
  for (const T of TILES) {
    const u = (age - T.t0) / 26;
    if (u < 0 || u >= 1) continue;
    const r = T.r0 - u * 0.6, drop = u > 0.35 ? (u - 0.35) * (u - 0.35) * 140 : 0;
    const x = CIRCLE_X + Math.cos(T.a) * RX * k * r, y = CY + Math.sin(T.a) * RY * k * r + drop;
    c.save();
    // (in over the rim: only what's still above the hole shows)
    if (r < 0.92) { c.beginPath(); c.ellipse(CIRCLE_X, CY, RX * k * 0.9, RY * k * 0.9, 0, 0, Math.PI * 2); c.clip(); }
    c.translate(Math.round(x), Math.round(y)); c.rotate(T.spin * u * 2.2);
    box(c, -7, -5, 14, 10, INK); box(c, -6, -4, 12, 8, T.col); box(c, -6, -4, 12, 2, '#C4B5FD'); box(c, -6, 2, 12, 2, LAVA[4]);
    c.restore();
  }
};

/** The column of light up out of it: stepped bands, dithered edges, flickering. */
const column = (c: Ctx, k: number, fr: number, top: number) => {
  const fl = 0.85 + 0.15 * Math.sin(fr * 0.31) * Math.sin(fr * 0.11 + 1);
  for (const [wk, col, a] of [[1.5, LAVA[2], 0.1], [1.05, LAVA[4], 0.09], [0.6, LAVA[6], 0.08]] as [number, string, number][]) {
    const w = Math.round(RX * k * wk / 2) * 2, l = CIRCLE_X - w, h = CY - top;
    hazeBands(c, l, top, w * 2, h, col, 0, a * k * fl * 1.6, 6);
    checker(c, l - 2, top + h * 0.4, 2, h * 0.6, col);
    checker(c, l + w * 2, top + h * 0.4, 2, h * 0.6, col, 1);
  }
};

/** Behind Satan's halo: a stepped ring of hot light round his head and shoulders (him a shadow against it). */
const halo = (c: Ctx, x: number, y: number, k: number, fr: number) => {
  const a = k * (0.8 + 0.2 * Math.sin(fr * 0.09));
  for (const [r, col, al] of [[150, LAVA[3], 0.1], [110, LAVA[4], 0.12], [72, LAVA[6], 0.14]] as [number, string, number][]) {
    c.globalAlpha = al * a; c.fillStyle = col;
    c.beginPath(); c.ellipse(x, y, r, r * 0.85, 0, 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
};

/** Smoke: a few puffs rising off it, and rolling out along the ceiling both ways (`s` how much of it there is). */
const smoke = (c: Ctx, s: number, spread: number, fr: number, top: number, from: number) => {
  if (s <= 0.01) return;
  const h = from - top - 20;
  for (let i = 0; i < 5; i++) {
    const u = ((fr * 0.6 + i * (h / 5)) % h) / h, x = CIRCLE_X + Math.sin(fr * 0.02 + i * 2.1) * 14 * (1 + u * 2);
    puff(c, x, from - u * h, Math.min(3, Math.floor(u * 3) + (i % 2)), s * 0.45 * Math.min(1, u * 4));
  }
  for (let i = 0; i < 14; i++) {
    const side = i % 2 ? 1 : -1, d = (20 + (i >> 1) * 48) * spread, wob = Math.sin(fr * 0.012 + i * 1.7) * 12;
    puff(c, CIRCLE_X + side * d + wob, top + 22 + hash(i * 3.9) * 28 + Math.sin(fr * 0.02 + i) * 3, 1 + (i % 3), s * (0.62 - (i >> 1) * 0.05));
  }
};

/** The heat over it: a glow, wavering lines rising. */
const shimmer = (c: Ctx, k: number, fr: number) => {
  hazeBands(c, Math.round(CIRCLE_X - RX * k), CY - 90, Math.round(RX * k * 2), 84, LAVA[5], 0, 0.12 * k, 4);
  c.globalAlpha = 0.22 * k;
  for (let i = 0; i < 5; i++) {
    const y = CY - 18 - ((fr * 1.4 + i * 19) % 90), wob = Math.round(Math.sin(fr * 0.15 + i * 2 + y * 0.1) * 6);
    box(c, Math.round(CIRCLE_X - 50 * k + i * 22 * k + wob), Math.round(y), 22, 2, LAVA[6]);
  }
  c.globalAlpha = 1;
};

// ---------------------------------------------------------------------------------------------------------------

/** The tongues round the rim (angle, size, phase); the roaring ones out of the middle. */
const RIM = Array.from({ length: 20 }, (_, i) => ({ a: (i / 20) * Math.PI * 2 + hash(i * 2.2) * 0.2, v: hash(i * 4.4) > 0.6 ? 2 : hash(i * 4.4) > 0.25 ? 1 : 0, ph: i * 3 }));
const CORE = [{ dx: -0.32, v: 3, ph: 1 }, { dx: 0.3, v: 3, ph: 5 }, { dx: 0, v: 3, ph: 3 }, { dx: -0.12, v: 2, ph: 6 }, { dx: 0.15, v: 2, ph: 2 }];

/** How tall the flames are (sucked down fast as it shuts), how far they lean in. */
const flameOf = (p: Pit, k: number) => (p.closing ? k * k * 0.8 : Math.min(1, p.age / 30) * Math.min(1, k * 1.2));

/** Behind Satan: the light up out of it, the smoke rising, the hot halo where he'll be. `top`: the view's top. */
export const drawPitBack = (c: Ctx, k: number, fr: number, top: number, haloX: number, haloY: number) => {
  if (k <= 0) return;
  column(c, k, fr, top);
  if (k > 0.5) halo(c, haloX, haloY, (k - 0.5) * 2, fr);
};

/** In front of Satan: the cracks, the hole and its flames, the tiles going in, the ceiling smoke, the shimmer; or once
 *  shut, the scar. */
export const drawPitFront = (c: Ctx, p: Pit, k: number, fr: number, top: number) => {
  const smokeTop = Math.max(CEIL + 16, top + 8);
  if (k <= 0) {
    if (!p.scar) return;
    const age = p.shut < 0 ? 9999 : p.shut;
    const heat = Math.max(0, 0.7 - age / COOL_T);
    cracks(c, 1, heat);
    c.save(); c.translate(CIRCLE_X, CY);
    stamp(c, 'ballpit-scar', -RX - 2, -RY - 2, RX * 2 + 4, RY * 2 + 4, g => paintScar(g, RX - 8, RY - 2));
    c.restore();
    // (the seam it slammed shut on, still glowing; the flash as it went)
    if (age < 8) { box(c, CIRCLE_X - RX * 0.8, CY - 2, RX * 1.6, 4, LAVA[7]); box(c, CIRCLE_X - RX * 0.5, CY - 6, RX, 2, LAVA[6]); }
    else if (heat > 0) box(c, CIRCLE_X - Math.round(RX * 0.35), CY, Math.round(RX * 0.7), 2, heat > 0.45 ? LAVA[6] : heat > 0.2 ? LAVA[4] : LAVA[2]);
    if (age < SMOKE_T) smoke(c, 1 - age / SMOKE_T, 1, fr, smokeTop, CY - 10);
    return;
  }
  const flick = Math.floor(fr / FLICK_EVERY), fh = flameOf(p, k);
  const heat = p.closing ? k : 1;
  cracks(c, Math.min(1, p.age / 22), heat);
  // (the far half of the rim's tongues, then the hole, the roar out of the middle, the near half)
  const rim = (back: boolean) => {
    for (const T of RIM) {
      const s = Math.sin(T.a);
      if ((s < 0) !== back) continue;
      // (closing: drawn in toward the middle as they go down)
      const pull = p.closing ? 1 - (1 - k) * 0.5 : 1;
      const v = fh > 0.7 ? T.v : Math.min(T.v, 1), H = TONGUE_H[v] + 26;
      tongue(c, CIRCLE_X + Math.cos(T.a) * RX * k * 0.86 * pull, CY + s * RY * k * 0.8, v, (flick + T.ph) % FLICK, (1 - fh * (back ? 1 : 0.85)) * H);
    }
  };
  rim(true);
  hole(c, k, Math.floor(fr / CHURN_EVERY) % CHURN);
  if (k > 0.35) {
    const ck = fh * Math.min(1, (k - 0.35) * 2.2);
    for (const T of CORE) tongue(c, CIRCLE_X + T.dx * RX * k, CY - 2, T.v, (flick + T.ph) % FLICK, (1 - ck) * (TONGUE_H[T.v] + 26));
  }
  rim(false);
  if (!p.closing && p.age < 90) tiles(c, p.age, k);
  smoke(c, Math.min(1, p.age / 60) * (p.closing ? 1 : Math.min(1, k * 1.5)), Math.min(1, p.age / 140), fr, smokeTop, CY - 30);
  shimmer(c, k, fr);
};

/** Each frame, from the fight's update (before it's drawn): what it's doing, and its embers, sparks and smoke. */
export const pitTick = (state: GameState, p: Pit, k: number) => {
  const P = state.particles;
  if (k > 0) {
    if (p.prev <= 0) { p.age = 0; p.closing = false; }
    p.age++; p.shut = -1;
    if (k < p.prev) p.closing = true; else if (k > p.prev) p.closing = false;
    // (embers up out of it; sparks off the crust as it splits)
    if (state.frame % 2 === 0) P.push({ pos: { x: CIRCLE_X + (Math.random() - 0.5) * RX * 1.4 * k, y: CY - 6 }, vel: { x: (Math.random() - 0.5) * 1.4, y: -2 - Math.random() * 3 * k }, life: 40 + Math.random() * 30, color: LAVA[5 + Math.floor(Math.random() * 3)], size: 2 });
    if (!p.closing && p.age < 50 && p.age % 5 === 0) {
      const a = Math.random() * Math.PI * 2;
      P.push({ pos: { x: CIRCLE_X + Math.cos(a) * RX * k, y: CY + Math.sin(a) * RY * k }, vel: { x: Math.cos(a) * 2, y: -3 - Math.random() * 3 }, life: 26, color: LAVA[7], size: 2, grav: 0.3, chunk: true });
    }
    if (p.closing && state.frame % 3 === 0) {
      // (sucked in: embers drawn back down into it)
      const a = Math.random() * Math.PI * 2, r = 1.3 + Math.random() * 0.6;
      P.push({ pos: { x: CIRCLE_X + Math.cos(a) * RX * r, y: CY - 20 - Math.random() * 50 }, vel: { x: -Math.cos(a) * 3, y: 2 }, life: 14, color: LAVA[6], size: 2 });
    }
  } else if (p.prev > 0) {
    // (slammed shut: a puff of soot out of the seam, sparks; skipped past, just the scar, cold)
    const shutting = p.closing;
    p.shut = shutting ? 0 : SMOKE_T; p.scar = true; p.closing = false; p.prev = 0;
    if (!shutting) return;
    shakeScreen(state, 5, 3); playSound('crumble', 0.5, -6);
    for (let i = 0; i < 10; i++) P.push({ pos: { x: CIRCLE_X + (Math.random() - 0.5) * RX * 1.4, y: CY - 4 }, vel: { x: (Math.random() - 0.5) * 3, y: -0.6 - Math.random() * 1.2 }, life: 50, color: Math.random() < 0.5 ? '#57534E' : '#3F3A3A', size: 6 + Math.random() * 4 });
    for (let i = 0; i < 8; i++) P.push({ pos: { x: CIRCLE_X + (Math.random() - 0.5) * RX, y: CY - 4 }, vel: { x: (Math.random() - 0.5) * 5, y: -3 - Math.random() * 3 }, life: 24, color: LAVA[6 + (i % 2)], size: 2, grav: 0.3, chunk: true });
  } else if (p.shut >= 0) {
    p.shut++;
    if (p.shut < SMOKE_T && p.shut % 7 === 0) P.push({ pos: { x: CIRCLE_X + (Math.random() - 0.5) * RX * 1.2, y: CY - 4 }, vel: { x: (Math.random() - 0.5) * 0.5, y: -0.6 - Math.random() * 0.8 }, life: 60, color: Math.random() < 0.5 ? '#44403C' : '#57534E', size: 5 + Math.random() * 4 });
  }
  p.prev = k;
};

/** Its light, for the scene's lighting: hot and flickering over the room while it's open, a glow off the seams as it
 *  cools. */
export const pitLights = (k: number, fr: number) => {
  if (k <= 0) return [];
  const fl = 0.86 + 0.14 * Math.sin(fr * 0.37) * Math.sin(fr * 0.13 + 1);
  return [
    { x: CIRCLE_X, y: GY - 60, r: (220 + 230 * k) * fl, a: Math.min(1, 0.95 * k), color: `rgba(234, 88, 12, ${(0.15 * k * fl).toFixed(3)})` },
    { x: CIRCLE_X, y: GY - 12, r: 90 + 70 * k * fl, a: 0.85 * k, color: `rgba(253, 224, 71, ${(0.12 * k).toFixed(3)})` },
    { x: CIRCLE_X, y: GY - 380, r: 160 * k, a: 0.5 * k, color: `rgba(220, 38, 38, ${(0.08 * k).toFixed(3)})` },
  ];
};
