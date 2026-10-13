// Space Needle 2's views out (screen space): what the windows show. The user wants this one pretty NOW, so it's painted
// properly, SNES style: the Earth below (oceans in bands, continents dithered at their coasts, cloud, the haze along the
// limb and the atmosphere over it in steps of blue), a starfield in two layers (the far one with the Milky Way's
// dithered band through it), the moon (cratered, lit from the side, a dithered terminator), the sun (a stepped glow).
//
// Painted once (each into a canvas of its own, at half the screen's pixels: an art pixel is two screen pixels), then
// put down every frame with a handful of drawImage calls: the Earth's surface in bands, each band panned at its own
// rate (nearer goes by faster: depth), the stars at theirs.
//
//   drawDeckView   out the deck's windows: `pan` is the bearing (world px round the ring) at the middle of the screen
//   drawAscent     out the lift's glass going up: `a` 0 (the ground) .. 1 (space)
//   drawOrbitBack  the shot from outside (the decompression): the stars, the sun, the Earth

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { timeOfDay, skyRamp } from '../../timeOfDay';

type Ctx = CanvasRenderingContext2D;
type RGB = [number, number, number];
const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
/** One art pixel, in screen pixels. */
const PX = 2;

// ---------------------------------------------------------------------------------------------------------------
// Little helpers

const rgb = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const hex = (v: number[]) => '#' + v.map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('');
export const mixHex = (a: string, b: string, k: number) => { const A = rgb(a), B = rgb(b); return hex(A.map((v, i) => v + (B[i] - v) * k)); };
const fract = (x: number) => x - Math.floor(x);
const h2 = (x: number, y: number) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453);
export const hash = (n: number) => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453);
const smooth = (t: number) => t * t * (3 - 2 * t);
/** Value noise, wrapping round every `P` cells across. */
const vnoise = (x: number, y: number, P: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), fx = smooth(x - xi), fy = smooth(y - yi);
  const w = (n: number) => ((n % P) + P) % P;
  const a = h2(w(xi), yi), b = h2(w(xi + 1), yi), c = h2(w(xi), yi + 1), d = h2(w(xi + 1), yi + 1);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
};
/** Fractal noise, wrapping every `P` cells across (each octave twice the cells, twice the wrap). */
const fbm = (x: number, y: number, P: number, oct = 5) => {
  let s = 0, amp = 0.5, tot = 0;
  for (let o = 0; o < oct; o++) { s += vnoise(x, y, P) * amp; tot += amp; x *= 2; y *= 2; P *= 2; amp *= 0.5; }
  return s / tot;
};
/** Clamp to 0..1. */
export const c01 = (v: number) => Math.max(0, Math.min(1, v));
export const smoothstep = (a: number, b: number, v: number) => smooth(c01((v - a) / (b - a)));
const canvas = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
/** A ramp picked by v (0..1) in steps, dithered between steps on a checker (`i`, `j` the pixel). */
const stepped = (ramp: string[], v: number, i: number, j: number) => {
  const f = c01(v) * (ramp.length - 1), k = Math.floor(f), r = f - k;
  return ramp[Math.min(ramp.length - 1, k + (r > 0.62 || (r > 0.38 && (i + j) % 2 === 0) ? 1 : 0))];
};

// ---------------------------------------------------------------------------------------------------------------
// The Earth: a strip of its surface (seen from up high, looking out at the horizon), wrapping across

/** The surface strip, in art px: across (wraps), and down from the limb. */
const EW = 768, EH = 124;
/** The limb's curve (screen px down from its middle, at screen x). */
const LIMB_R = 2600;
export const limbDip = (x: number) => ((x - W / 2) ** 2) / (2 * LIMB_R);
const OCEAN = ['#071848', '#0A2160', '#0E2C78', '#123A8F', '#1A4BA3', '#2560B5', '#3374C4'];
const LAND = ['#24481F', '#2E5E2A', '#3D7A33', '#55903A', '#7E9A48', '#A8955A', '#C4AE78'];
const CLOUD = ['#9FB3CC', '#C9D6E8', '#E6EEF8', '#FFFFFF'];
const HAZE = '#A5D8F5';
let earth: HTMLCanvasElement | null = null;
const paintEarth = () => {
  const c = canvas(EW, EH), g = c.getContext('2d')!, img = g.createImageData(EW, EH), d = img.data;
  const CELL = 120;
  for (let j = 0; j < EH; j++) {
    // (rows near the limb are further off: squashed up, wider across)
    const depth = 1 - j / EH, sx = 1 + 2.4 * depth * depth;
    const P = Math.max(1, Math.round((EW / CELL) * sx)), gy = 260 / (j + 9);
    const PC = Math.max(1, Math.round((EW / 52) * sx));
    for (let i = 0; i < EW; i++) {
      const nx = (i / EW) * P, n = fbm(nx, gy, P);
      const cn = fbm((i / EW) * PC + 31.7, gy * 2.4 + 17, PC, 4);
      let col: string;
      const coast = n - 0.56;
      if (coast > 0 || (coast > -0.012 && (i + j) % 2 === 0)) {
        // (land: greener low, browner and paler as it rises; the odd desert)
        const dry = fbm(nx * 1.7 + 9, gy * 1.7 + 4, P * 2, 3);
        col = stepped(LAND, c01(coast * 4 + (dry - 0.45) * 1.4), i, j);
      } else {
        // (sea: deeper off the coasts, paler toward the limb)
        col = stepped(OCEAN, c01(0.25 + (n - 0.3) * 1.1 + depth * 0.55), i, j);
      }
      // (cloud over it: swirls in bands)
      const cl = cn - 0.55;
      if (cl > 0 || (cl > -0.03 && (i + j) % 2 === 0)) col = stepped(CLOUD, c01(cl * 5 + 0.3), i, j);
      // (the haze, thick toward the limb)
      const hz = c01(1 - j / 20) ** 1.4;
      if (hz > 0.05) {
        const q = Math.floor(hz * 4 + ((i + j) % 2) * 0.5) / 4;
        col = mixHex(col, HAZE, q * 0.85);
      }
      const v = rgb(col), o = (j * EW + i) * 4;
      d[o] = v[0]; d[o + 1] = v[1]; d[o + 2] = v[2]; d[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return c;
};
/** The atmosphere over the limb, in steps of blue (painted the once: the limb's curve doesn't move). */
const ATMO_UP = 34, ATMO_DOWN = 4;
const ATMO = ['#F0F9FF', '#CFEFFF', '#9EDCFA', '#6CC5F2', '#3F9FE6', '#2A6FD0', '#2449A6', '#1E2F78', '#1A1F52', '#141436'];
let atmo: HTMLCanvasElement | null = null;
const paintAtmo = () => {
  const aw = W / PX, ah = ATMO_UP + ATMO_DOWN + 20;
  const c = canvas(aw, ah), g = c.getContext('2d')!, img = g.createImageData(aw, ah), d = img.data;
  for (let i = 0; i < aw; i++) {
    const limb = ATMO_UP + limbDip(i * PX) / PX;
    for (let j = 0; j < ah; j++) {
      const up = limb - j;
      if (up < -ATMO_DOWN || up > ATMO_UP) continue;
      // (a glowing rim right at the limb, then out through the blues to the dark)
      const k = up < 0 ? 0 : up / ATMO_UP;
      const f = k * (ATMO.length - 1), s = Math.floor(f), r = f - s;
      const idx = Math.min(ATMO.length - 1, s + (r > 0.5 && (i + j) % 2 === 0 ? 1 : 0));
      const v = rgb(ATMO[idx]), o = (j * aw + i) * 4;
      const a = up < 0 ? 0.55 : (1 - k) ** 1.1;
      d[o] = v[0]; d[o + 1] = v[1]; d[o + 2] = v[2]; d[o + 3] = Math.round(255 * Math.min(1, a * 1.1));
    }
  }
  g.putImageData(img, 0, 0);
  return c;
};
/** The limb's outline (screen px, from its middle at 0): the Earth's shape to clip its surface to. */
let limbPath: Path2D | null = null;
const getLimb = () => {
  if (limbPath) return limbPath;
  const p = new Path2D();
  p.moveTo(-10, limbDip(-10));
  for (let x = 0; x <= W + 10; x += 20) p.lineTo(x, limbDip(x));
  p.lineTo(W + 10, H + 400); p.lineTo(-10, H + 400); p.closePath();
  return (limbPath = p);
};
const ensureEarth = () => { earth ??= paintEarth(); atmo ??= paintAtmo(); };

/**
 * The Earth below, its limb's middle at screen y `L`, panned `pan` px (its nearest band; further ones less: depth).
 * The haze and atmosphere over its limb. `dim` darkens the lot (seen through tinted glass).
 */
export const drawEarth = (c: Ctx, L: number, pan: number) => {
  if (typeof document === 'undefined') return;
  ensureEarth();
  c.save();
  c.imageSmoothingEnabled = false;
  c.translate(0, Math.round(L));
  c.clip(getLimb());
  // (in bands down from the limb: each nearer one going by a little faster)
  const BANDS = 10, tile = EW * PX;
  for (let b = 0; b < BANDS; b++) {
    const j0 = Math.floor((b * EH) / BANDS), j1 = Math.floor(((b + 1) * EH) / BANDS);
    const rate = 0.42 + (b / (BANDS - 1)) * 0.9;
    let off = -(((pan * rate) % tile) + tile) % tile;
    off = Math.round(off / PX) * PX;
    // (the limb dips at the sides, so the strip's drawn from a little above its middle)
    for (let x = off; x < W; x += tile) c.drawImage(earth!, 0, j0, EW, j1 - j0, x, j0 * PX - 2, tile, (j1 - j0) * PX);
  }
  // (and past the strip's bottom, the deepest band carried on down)
  c.fillStyle = OCEAN[0]; c.fillRect(0, EH * PX - 2, W, H);
  c.restore();
  c.save(); c.imageSmoothingEnabled = false;
  c.drawImage(atmo!, 0, Math.round(L) - ATMO_UP * PX, W, atmo!.height * PX);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Stars

const STW = W / PX, STH = H / PX;
let starsFar: HTMLCanvasElement | null = null, starsNear: HTMLCanvasElement | null = null;
const paintStars = (near: boolean) => {
  const c = canvas(STW, STH), g = c.getContext('2d')!;
  if (!near) {
    // (the Milky Way: a wavy band of dithered haze across, its core brighter, dust lanes dark through it)
    const img = g.createImageData(STW, STH), d = img.data;
    for (let i = 0; i < STW; i++) {
      const mid = 70 + Math.sin((i / STW) * Math.PI * 2) * 22 + Math.sin((i / STW) * Math.PI * 6) * 6;
      for (let j = 0; j < STH; j++) {
        const t = 1 - Math.abs(j - mid) / 30;
        if (t <= 0) continue;
        const n = fbm((i / STW) * 12, j / 10, 12, 4), lane = fbm((i / STW) * 20 + 5, j / 6 + 3, 20, 3);
        let v = t * t * (0.35 + n * 0.9) - (lane > 0.6 ? 0.25 : 0);
        if (v < 0.12 || (v < 0.22 && (i + j) % 2)) continue;
        const col = rgb(v > 0.55 ? '#B9A8E6' : v > 0.38 ? '#7C6BC2' : v > 0.25 ? '#4A3F8A' : '#2C2860');
        const o = (j * STW + i) * 4;
        d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = Math.round(255 * Math.min(0.75, v + 0.15));
      }
    }
    g.putImageData(img, 0, 0);
  }
  // (the stars: pixels, a few bigger, a few with a cross on them)
  const n = near ? 70 : 260;
  for (let k = 0; k < n; k++) {
    const x = Math.floor(hash(k * 3 + (near ? 901 : 7)) * STW), y = Math.floor(hash(k * 5 + (near ? 77 : 3)) * STH);
    const b = hash(k * 11 + (near ? 5 : 1));
    if (near) {
      g.fillStyle = b > 0.7 ? '#FFFFFF' : b > 0.35 ? '#E0F2FE' : '#FDE68A';
      g.fillRect(x, y, 1, 1);
      if (b > 0.82) { g.fillStyle = 'rgba(224, 242, 254, 0.55)'; g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); }
    } else {
      g.fillStyle = b > 0.8 ? '#CBD5E1' : b > 0.5 ? '#94A3B8' : '#64748B';
      g.fillRect(x, y, 1, 1);
    }
  }
  return c;
};
const ensureStars = () => { starsFar ??= paintStars(false); starsNear ??= paintStars(true); };
/** Both layers of stars, panned (`pan`: screen px; the far ones go by slower), at `alpha`. */
export const drawStars = (c: Ctx, pan: number, f: number, alpha = 1, panY = 0) => {
  if (typeof document === 'undefined' || alpha <= 0) return;
  ensureStars();
  c.save(); c.imageSmoothingEnabled = false; c.globalAlpha = alpha;
  for (const [img, rate] of [[starsFar!, 0.3], [starsNear!, 0.55]] as const) {
    const off = Math.round(-((((pan * rate) % W) + W) % W) / PX) * PX;
    const oy = Math.round(-((((panY * rate) % H) + H) % H) / PX) * PX;
    for (let x = off; x < W; x += W) for (let y = oy; y < H; y += H) c.drawImage(img, x, y, W, H);
  }
  // (a few twinkling: flicked off and on, live)
  for (let k = 0; k < 14; k++) {
    if (fract(hash(k * 7) + f * 0.004 * (1 + (k % 3))) > 0.85) continue;
    const x = (((hash(k + 40) * W - pan * 0.55) % W) + W) % W, y = (((hash(k + 90) * H - panY * 0.55) % H) + H) % H;
    c.fillStyle = 'rgba(255, 255, 255, 0.9)';
    c.fillRect(Math.round(x / PX) * PX, Math.round(y / PX) * PX, PX, PX);
    c.fillStyle = 'rgba(186, 230, 253, 0.45)';
    c.fillRect(Math.round(x / PX) * PX - PX, Math.round(y / PX) * PX, PX * 3, PX);
    c.fillRect(Math.round(x / PX) * PX, Math.round(y / PX) * PX - PX, PX, PX * 3);
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The moon, the sun

const MOON_R = 30;
let moon: HTMLCanvasElement | null = null;
const paintMoon = () => {
  const S = MOON_R * 2 + 2, c = canvas(S, S), g = c.getContext('2d')!, img = g.createImageData(S, S), d = img.data;
  const craters: [number, number, number][] = [];
  for (let k = 0; k < 16; k++) craters.push([(hash(k + 3) - 0.5) * 1.6, (hash(k + 8) - 0.5) * 1.6, 0.06 + hash(k + 13) * 0.16]);
  const ramp = ['#2A2D3A', '#4B4F5E', '#6E7282', '#9497A4', '#BCBEC7', '#DEDFE4', '#F4F4F6'];
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
    const x = (i - S / 2 + 0.5) / MOON_R, y = (j - S / 2 + 0.5) / MOON_R, rr = x * x + y * y;
    if (rr > 1) continue;
    const z = Math.sqrt(1 - rr);
    // (lit from the left, a little above: dark on the far side, the terminator dithered)
    let l = c01((-x * 0.75 - y * 0.25 + z * 0.62) * 0.95 + 0.12);
    // (the seas: big dark blotches)
    const sea = fbm(x * 2.2 + 3, y * 2.2 + 3, 64, 3);
    if (sea > 0.56) l *= 0.72;
    for (const [cx, cy, cr] of craters) {
      const dd = Math.hypot(x - cx, y - cy) / cr;
      if (dd < 1) l *= dd < 0.75 ? 0.78 : 1.12;
    }
    const v = rgb(stepped(ramp, l, i, j)), o = (j * S + i) * 4;
    d[o] = v[0]; d[o + 1] = v[1]; d[o + 2] = v[2]; d[o + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
};
/** The moon, its middle at (x, y) (screen). */
export const drawMoonDisc = (c: Ctx, x: number, y: number, scale = 1) => {
  if (typeof document === 'undefined') return;
  moon ??= paintMoon();
  const s = moon.width * PX * scale;
  c.save(); c.imageSmoothingEnabled = false;
  // (a faint glow round it, in two steps)
  c.fillStyle = 'rgba(203, 213, 225, 0.06)'; c.beginPath(); c.arc(x, y, s * 0.68, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(203, 213, 225, 0.05)'; c.beginPath(); c.arc(x, y, s * 0.6, 0, Math.PI * 2); c.fill();
  c.drawImage(moon, Math.round(x - s / 2), Math.round(y - s / 2), s, s);
  c.restore();
};
let sun: HTMLCanvasElement | null = null;
const paintSun = () => {
  const S = 96, c = canvas(S, S), g = c.getContext('2d')!;
  const rings: [number, string][] = [[46, 'rgba(254, 249, 195, 0.05)'], [38, 'rgba(254, 249, 195, 0.07)'], [30, 'rgba(254, 240, 138, 0.1)'], [22, 'rgba(254, 249, 195, 0.16)'], [15, 'rgba(255, 255, 240, 0.3)'], [10, '#FFFBEB'], [8, '#FFFFFF']];
  for (const [r, col] of rings) { g.fillStyle = col; g.beginPath(); g.arc(S / 2, S / 2, r, 0, Math.PI * 2); g.fill(); }
  // (the streak across it, the lens's)
  g.fillStyle = 'rgba(255, 255, 255, 0.35)'; g.fillRect(0, S / 2 - 1, S, 2);
  g.fillStyle = 'rgba(255, 255, 255, 0.2)'; g.fillRect(S / 2 - 1, S / 2 - 26, 2, 52);
  return c;
};
export const drawSunDisc = (c: Ctx, x: number, y: number) => {
  if (typeof document === 'undefined') return;
  sun ??= paintSun();
  c.save(); c.imageSmoothingEnabled = false;
  c.drawImage(sun, Math.round(x - sun.width), Math.round(y - sun.height), sun.width * PX, sun.height * PX);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The views

/** Deep space, banded down toward the limb (the faintest blue over the Earth). */
const SPACE = ['#020208', '#03030C', '#050512', '#070818', '#090B20', '#0C0F2A', '#101536'];
const spaceBands = (c: Ctx, top: number, bottom: number, cols = SPACE) => {
  const n = cols.length, bh = (bottom - top) / n;
  for (let i = 0; i < n; i++) { c.fillStyle = cols[i]; c.fillRect(0, Math.floor(top + i * bh), W, Math.ceil(bh) + 1); }
};
/** The bearings round the ring (world px from the ring's start) the moon and the sun are at. */
export const MOON_AT = 700, SUN_AT = 2200;
/** The deck's view: the Earth's limb's middle at screen y. */
export const DECK_LIMB = 300;

/** Out of the deck's windows: `pan` the bearing at the middle of the screen (world px round the ring, `circ` all the
 *  way round). */
export const drawDeckView = (c: Ctx, state: GameState, pan: number, circ: number) => {
  spaceBands(c, 0, DECK_LIMB + 30);
  drawStars(c, pan, state.frame);
  const at = (u: number) => W / 2 + ((((u - pan) % circ) + circ * 1.5) % circ) - circ / 2;
  { const x = at(SUN_AT); if (x > -200 && x < W + 200) drawSunDisc(c, x, 150); }
  { const x = at(MOON_AT); if (x > -100 && x < W + 100) drawMoonDisc(c, x, 196); }
  drawEarth(c, DECK_LIMB, pan);
};

/** The ground's skyline at the foot of the needle (the park, far below, going away), screen space. */
const skyline = (c: Ctx, y: number, tod: ReturnType<typeof timeOfDay>) => {
  if (y > H + 10) return;
  const far = mixHex('#4C3F7A', tod.haze, 0.35), near = mixHex('#2E2552', tod.haze, 0.2);
  for (let k = 0; k < 18; k++) {
    const x = k * 50 - 20, h = 20 + hash(k + 4) * 50;
    c.fillStyle = far; c.fillRect(x, Math.round(y - h), 40, h + 4);
    if (k % 4 === 1) { c.fillRect(x + 16, Math.round(y - h - 30), 6, 30); c.beginPath(); c.arc(x + 19, y - h - 30, 9, 0, Math.PI * 2); c.fill(); }
  }
  c.fillStyle = near; c.fillRect(0, Math.round(y), W, H);
  c.fillStyle = '#5B4E8C'; c.fillRect(0, Math.round(y), W, 2);
};
/** A cloud: flat-bottomed puffs, lit on top, a shadow band under. */
const cloud = (c: Ctx, x: number, y: number, s: number, lit: string, mid: string, dark: string) => {
  const puffs: [number, number][] = [[-40, 16], [-14, 26], [16, 22], [40, 14], [58, 9]];
  c.fillStyle = dark; c.fillRect(Math.round(x - 52 * s), Math.round(y), Math.round(120 * s), Math.round(6 * s));
  for (const [dx, r] of puffs) { c.fillStyle = mid; c.beginPath(); c.arc(x + dx * s, y, r * s, Math.PI, 0); c.fill(); }
  for (const [dx, r] of puffs) { c.fillStyle = lit; c.beginPath(); c.arc(x + dx * s - 2 * s, y - 4 * s, r * s * 0.66, Math.PI, 0); c.fill(); }
};
/**
 * Out of the lift's glass, going up: `a` how far up (0 the ground, 1 space), `speed` how fast it's going (0..1, the
 * shaft's girders and streaks). The sky as the hour has it, darkening to space; the park dropping away; the clouds
 * coming down past; then the stars and the Earth's curve. The shaft's girders whipping down past behind the car.
 */
export const drawAscent = (c: Ctx, state: GameState, a: number, speed: number, climbed: number, shaft = true) => {
  const tod = timeOfDay();
  const day = skyRamp(['#3E6FD8', '#4C7BE0', '#5A88E6', '#6995EB', '#7AA3EF', '#8DB1F2', '#A1BFF4', '#B7CDF4'], tod);
  const dark = smoothstep(0.32, 0.86, a);
  const cols = day.map((col, i) => mixHex(col, SPACE[Math.min(SPACE.length - 1, i)], dark));
  spaceBands(c, 0, H, cols);
  drawStars(c, 0, state.frame, smoothstep(0.62, 0.95, a), -climbed * 0.02);
  if (a > 0.7) drawSunDisc(c, 640, 120 + (1 - a) * 300);
  // (the park far below, dropping away)
  skyline(c, 470 + a * a * 5200, tod);
  // (the clouds, coming down past: a layer of them, then the deck of them far below)
  const lit = mixHex('#FFFFFF', tod.cloud, 0.5), mid = mixHex('#DCE6F4', tod.cloud, 0.5), dk = mixHex('#A9B8D2', tod.cloud, 0.5);
  for (let k = 0; k < 9; k++) {
    const y = -200 + (a - 0.08 - k * 0.03) * 2600;
    if (y < -60 || y > H + 60) continue;
    cloud(c, (hash(k + 1) * 900 + k * 37) % 900 - 50, y, 0.9 + hash(k + 5) * 0.9, lit, mid, dk);
  }
  // (the Earth's curve, coming up from below once he's out of the air)
  const rise = smoothstep(0.5, 1, a);
  if (rise > 0) drawEarth(c, H + 40 - rise * (H + 40 - DECK_LIMB), climbed * 0.05);
  // (the shaft's girders, whipping down past behind him: speed lines with them when it's going fast)
  if (!shaft) return;
  const step = 150, off = (climbed % step + step) % step;
  for (let y = off - step; y < H; y += step) {
    c.fillStyle = '#1E293B'; c.fillRect(0, Math.round(y), W, 10);
    c.fillStyle = '#64748B'; c.fillRect(0, Math.round(y), W, 2);
    c.fillStyle = '#0F172A'; c.fillRect(0, Math.round(y) + 8, W, 2);
  }
  for (const x of [120, 680]) {
    c.fillStyle = '#1E293B'; c.fillRect(x - 10, 0, 20, H);
    c.fillStyle = '#94A3B8'; c.fillRect(x - 10, 0, 3, H);
    c.fillStyle = '#0F172A'; c.fillRect(x + 7, 0, 3, H);
  }
  if (speed > 0.35) for (let k = 0; k < 26; k++) {
    const x = Math.round(hash(k * 5) * W / PX) * PX, len = 60 + hash(k) * 160;
    const y = ((climbed * (0.6 + hash(k + 3) * 0.6) + k * 97) % (H + len)) - len;
    c.fillStyle = `rgba(255, 255, 255, ${((speed - 0.35) * (0.25 + hash(k + 9) * 0.35)).toFixed(3)})`;
    c.fillRect(x, Math.round(y), PX, Math.round(len));
  }
};

/** The shot from outside: the stars, the sun, the Earth a long way down (its limb at screen y `L`). */
export const drawOrbitBack = (c: Ctx, state: GameState, pan: number, L = 470) => {
  spaceBands(c, 0, L + 30);
  drawStars(c, pan, state.frame);
  drawSunDisc(c, 120, 110);
  drawMoonDisc(c, 700, 90, 0.7);
  drawEarth(c, L, pan * 0.6 + state.frame * 0.15);
};

/** Paints everything up front (the stage's build), so the first look out isn't a hitch. */
export const prewarmSky = () => {
  if (typeof document === 'undefined') return;
  ensureEarth(); ensureStars(); moon ??= paintMoon(); sun ??= paintSun();
};
