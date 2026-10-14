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
import { timeOfDay, skyRamp, farTint, type TimeOfDay } from '../../timeOfDay';
import { bandedGradient, hazeBands, checker, steppedGlow } from '../../../m1/game/render/pixelArt';

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
      const cl = cn - 0.6;
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
export const drawEarth = (c: Ctx, L: number, pan: number, glint?: number) => {
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
  // (the sun's glint off the sea under it: a squashed stepped glow, out near the limb)
  if (glint !== undefined) {
    c.save(); c.translate(Math.round(glint), 30); c.scale(1, 0.28);
    steppedGlow(c, 0, 0, 150, '#FFF6D8', 0.42, 0.04, 5);
    c.restore();
  }
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
// Nebulae: two clouds of glowing gas (a magenta one, a teal one) in stepped ramps, their edges dithered, dark dust
// lanes cut through them, a few young stars burning in the thick of them. Painted once into a wide tile (art px) that
// wraps across; put down with a couple of drawImage calls, parallaxed very slowly (they're the furthest thing there is).

const NW = 900, NH = 300;
const NEB_A = ['#160A26', '#24103E', '#381656', '#521C6C', '#72247E', '#963088', '#BC4A92', '#E07AAE', '#FBB8D2'];
const NEB_B = ['#06121F', '#0A2034', '#0E304A', '#124462', '#185C78', '#22788C', '#3A98A2', '#6CBCBC', '#B2E6DA'];
let nebula: HTMLCanvasElement | null = null;
const paintNebula = () => {
  const c = canvas(NW, NH), g = c.getContext('2d')!, img = g.createImageData(NW, NH), d = img.data;
  const P = 9;
  for (let j = 0; j < NH; j++) {
    // (the clouds sit in a band across the middle of the tile, thinning top and bottom)
    const vy = j / NH, band = 1 - Math.abs(vy - 0.5 + Math.sin(vy * 7) * 0.04) * 1.9;
    for (let i = 0; i < NW; i++) {
      const u = (i / NW) * P;
      const a = fbm(u, vy * 3.2, P, 5), b = fbm(u * 1.3 + 4.7, vy * 4 + 9.1, Math.round(P * 1.3), 4);
      const lane = fbm(u * 2.2 + 11, vy * 7 + 2, Math.round(P * 2.2), 3);
      // (where each cloud is thick: the magenta in long swirls, the teal in clumps under and over it)
      const da = (a - 0.55) * 2.6 * band - Math.max(0, lane - 0.58) * 3.2;
      const db = (b - 0.6) * 2.6 * (band * 0.8 + 0.2) - Math.max(0, lane - 0.6) * 2.4;
      // (the teal's glow is under the magenta where they cross: the brighter wins)
      const o = (j * NW + i) * 4;
      const dith = (i + j) % 2;
      // (a step under the cloud's edge: dithered in, so it fades out in a checker, never a hard line)
      if (da < 0.02 && db < 0.02) { if (Math.max(da, db) > -0.04 && dith) { const col = rgb(da > db ? NEB_A[0] : NEB_B[0]); d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 200; } continue; }
      let col: string;
      // (dim gas, mostly: the ramps' bright ends only in the thick of it, so nothing that flies over it is lost in it)
      if (da >= db) col = stepped(NEB_A, c01(da * 0.7), i, j);
      else col = stepped(NEB_B, c01(db * 0.7), i, j);
      // (the bright core where they're both thick)
      if (da > 0.55 && db > 0.3) col = stepped(NEB_A, c01(da * 0.7 + 0.12), i, j);
      const v = rgb(col);
      d[o] = v[0]; d[o + 1] = v[1]; d[o + 2] = v[2]; d[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  // (young stars in the thick of it: bright, a cross of light on the biggest)
  for (let k = 0; k < 40; k++) {
    const x = Math.floor(hash(k * 13 + 5) * NW), y = Math.floor(NH * (0.25 + hash(k * 7 + 1) * 0.5));
    const big = hash(k * 3 + 2) > 0.8;
    g.fillStyle = big ? '#FFFFFF' : hash(k) > 0.5 ? '#FDE7F3' : '#D9F7F2';
    g.fillRect(x, y, 1, 1);
    if (big) { g.fillStyle = 'rgba(255, 220, 240, 0.55)'; g.fillRect(x - 2, y, 5, 1); g.fillRect(x, y - 2, 1, 5); }
  }
  return c;
};
/** The nebulae, `pan` screen px across (their own slow drift already put in: pass the camera's), at `alpha`, the
 *  tile's middle at screen y `cy`. */
export const drawNebula = (c: Ctx, pan: number, cy = H * 0.42, alpha = 1) => {
  if (typeof document === 'undefined' || alpha <= 0) return;
  nebula ??= paintNebula();
  const tile = NW * PX;
  const off = Math.round(-((((pan * 0.12) % tile) + tile) % tile) / PX) * PX;
  c.save(); c.imageSmoothingEnabled = false; c.globalAlpha = alpha;
  const y = Math.round((cy - NH) / PX) * PX;
  for (let x = off; x < W; x += tile) c.drawImage(nebula, x, y, tile, NH * PX);
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
export const spaceBands = (c: Ctx, top: number, bottom: number, cols = SPACE) => {
  // (HDMA-style: flat bands, each seam dithered)
  bandedGradient(c, 0, top, W, bottom - top, cols, Math.max(2, cols.length * 2 - 1), PX);
};
/** The bearings round the ring (world px from the ring's start) the moon and the sun are at. */
export const MOON_AT = 700, SUN_AT = 2200;
/** The deck's view: the Earth's limb's middle at screen y. */
export const DECK_LIMB = 300;

/** Out of the deck's windows: `pan` the bearing at the middle of the screen (world px round the ring, `circ` all the
 *  way round). */
export const drawDeckView = (c: Ctx, state: GameState, pan: number, circ: number) => {
  spaceBands(c, 0, DECK_LIMB + 30);
  drawNebula(c, pan, 170);
  drawStars(c, pan, state.frame);
  const at = (u: number) => W / 2 + ((((u - pan) % circ) + circ * 1.5) % circ) - circ / 2;
  const sx = at(SUN_AT), sunIn = sx > -200 && sx < W + 200;
  if (sunIn) drawSunDisc(c, sx, 150);
  { const x = at(MOON_AT); if (x > -100 && x < W + 100) drawMoonDisc(c, x, 196); }
  drawEarth(c, DECK_LIMB, pan, sunIn ? sx : undefined);
};

// ---------------------------------------------------------------------------------------------------------------
// The way up: the park dropping away under the lift, the clouds coming down past

/** The park far below (screen px tall), painted once an hour: its rides and towers in stepped tones, the haze. */
const PARK_H = 200;
let park: { key: string; c: HTMLCanvasElement } | null = null;
const paintPark = (tod: TimeOfDay) => {
  const c = canvas(W, PARK_H), g = c.getContext('2d')!;
  const B = PARK_H - 40;
  const R = (x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const T = (col: string, k = 1) => farTint(col, k, tod);
  // (the far hills, hazed; then the park on its flat)
  for (let x = 0; x < W; x += PX) {
    const h = 30 + Math.sin(x * 0.011) * 10 + Math.sin(x * 0.031 + 2) * 6;
    R(x, B - h, PX, h, T('#5E6E9A', 1.6)); R(x, B - h, PX, PX, T('#8494C0', 1.6));
  }
  hazeBands(g, 0, B - 46, W, 46, tod.haze, 0.05, 0.6, 5, PX);
  // (the buildings: towers, a dome, the giant atom, Googie pylons; lit down their left, a darker right, inked tops)
  const tower = (x: number, w: number, h: number, col: string, k = 1) => {
    const r = [T(col, k), T(mixHex(col, '#000000', 0.25), k), T(mixHex(col, '#FFFFFF', 0.3), k)];
    R(x, B - h, w, h, r[0]); R(x + w * 0.62, B - h, w * 0.38, h, r[1]); R(x, B - h, PX, h, r[2]); R(x, B - h, w, PX, r[2]);
    for (let wy = B - h + 6; wy < B - 6; wy += 8) for (let wx = x + 4; wx < x + w - 4; wx += 6) if (hash(wx * 3 + wy) > 0.4) R(wx, wy, 2, 2, T('#F8E7A8', k));
  };
  for (let k = 0; k < 16; k++) tower(k * 54 - 14 + hash(k) * 16, 22 + hash(k + 3) * 18, 24 + hash(k + 9) * 46, k % 3 ? '#7C88B4' : '#9A86B0', 1.2);
  // (the geodesic ball: a sphere in steps, its facets dithered)
  const bx = 150, by = B - 36, br = 30;
  for (let j = -br; j < br; j += PX) for (let i = -br; i < br; i += PX) {
    const rr = (i * i + j * j) / (br * br); if (rr > 1 || j > 26) continue;
    const l = c01(0.65 - i / br * 0.4 - j / br * 0.5);
    const tone = ['#5C6890', '#7E8CB4', '#A4B2D4', '#CED8EE', '#F0F4FC'][Math.min(4, Math.floor(l * 4 + (((i + j) / PX) & 1 ? 0.4 : 0)))];
    R(bx + i, by + j, PX, PX, T(tone, 0.8));
  }
  for (let i = -br; i < br; i += 8) R(bx + i, by - Math.sqrt(Math.max(0, br * br - i * i)), 1, 2 * Math.sqrt(Math.max(0, br * br - i * i)), T('#5C6890', 0.8));
  // (the giant atom: its ball on a stem, the rings round it)
  const ax = 560, ay = B - 70;
  R(ax - 3, ay, 6, 70, T('#8E9AC0', 0.8)); R(ax - 3, ay, 2, 70, T('#C6D0EA', 0.8));
  g.lineWidth = 2;
  for (const rot of [0.5, -0.5, 1.57]) { g.strokeStyle = T('#B8C4E4', 0.8); g.beginPath(); g.ellipse(ax, ay, 34, 10, rot, 0, Math.PI * 2); g.stroke(); }
  for (let j = -12; j < 12; j += PX) for (let i = -12; i < 12; i += PX) { if (i * i + j * j > 144) continue; R(ax + i, ay + j, PX, PX, T(i + j < -6 ? '#F4F6FC' : i + j < 6 ? '#C6D0EA' : '#8E9AC0', 0.8)); }
  // (the monorail's beam across, a train on it)
  R(0, B - 22, W, 4, T('#DCE2F0', 0.9)); R(0, B - 18, W, 2, T('#6A7498', 0.9));
  for (let x = 30; x < W; x += 70) R(x, B - 18, 4, 18, T('#7A84A8', 0.9));
  R(300, B - 30, 70, 8, T('#F2F4FA', 0.9)); R(300, B - 30, 70, 2, T('#FFFFFF', 0.9)); R(306, B - 28, 58, 2, T('#3C4A78', 0.9));
  // (the ground: the park's paths and lawns, banded to the bottom, under its own haze)
  bandedGradient(g, 0, B, W, PARK_H - B, [T('#6A8A5A', 1.1), T('#557848', 1), T('#466A3C', 0.9)], 4, PX);
  for (let x = 0; x < W; x += 46) R(x + hash(x) * 20, B + 4 + hash(x + 1) * 24, 18, 2, T('#D8CCA8', 1));
  hazeBands(g, 0, B - 6, W, 18, tod.haze, 0.45, 0.05, 4, PX);
  return c;
};
const skyline = (c: Ctx, y: number, tod: TimeOfDay) => {
  if (y > H + PARK_H) return;
  if (!park || park.key !== tod.key) park = { key: tod.key, c: paintPark(tod) };
  c.save(); c.imageSmoothingEnabled = false;
  const top = Math.round((y - (PARK_H - 40)) / PX) * PX;
  c.drawImage(park.c, 0, top);
  // (and under the painting, the ground carried on down)
  if (top + PARK_H < H) { c.fillStyle = farTint('#466A3C', 0.9, tod); c.fillRect(0, top + PARK_H, W, H - top - PARK_H); }
  c.restore();
};

/** A cumulus, painted once (art px): puffs on a flat base, lit from the upper left in four steps, its belly in shadow,
 *  every edge broken up in a checker. */
const CUMULUS = ['#7C8AA8', '#A6B4CC', '#CCD6E6', '#EEF2F8', '#FFFFFF'];
const clouds = new Map<string, HTMLCanvasElement>();
const paintCloud = (seed: number, tod: TimeOfDay) => {
  const cw = 96, ch = 48, base = 42;
  const c = canvas(cw, ch), g = c.getContext('2d')!;
  const puffs: [number, number, number][] = [];
  const n = 4 + Math.floor(hash(seed) * 3);
  for (let k = 0; k < n; k++) {
    const t = (k + 0.5) / n, r = 7 + Math.sin(t * Math.PI) * (10 + hash(seed + k) * 7);
    puffs.push([10 + t * (cw - 20), base - r * 0.5, r]);
  }
  const ramp = CUMULUS.map(col => mixHex(col, tod.cloud, 0.45));
  for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
    if (j > base) continue;
    // (the puff nearest the viewer here, the one whose top is highest: its slope gives the light)
    let found = false, top = 0, nx = 0, ny = 0, edge = 1;
    for (const [px, py, r] of puffs) {
      const dx = i - px, dy = j - py, d = Math.hypot(dx, dy);
      if (d >= r) continue;
      if (!found || py - r < top) { found = true; top = py - r; nx = dx / r; ny = dy / r; }
      edge = Math.min(edge, d / r);
    }
    if (!found) continue;
    if (edge > 0.9 && (i + j) % 2) continue;
    let l = 0.58 - nx * 0.3 - ny * 0.5;
    if (j > base - 5) l -= 0.3; // (the flat belly in shadow)
    g.fillStyle = stepped(ramp, c01(l), i, j);
    g.fillRect(i, j, 1, 1);
  }
  return c;
};
export const drawCloud = (c: Ctx, x: number, y: number, s: number, seed: number, tod: TimeOfDay, alpha = 1) => {
  const key = `${seed}|${tod.key}`;
  let img = clouds.get(key);
  if (!img) { img = paintCloud(seed, tod); clouds.set(key, img); }
  const w = Math.round(img.width * PX * s / PX) * PX, h = Math.round(img.height * PX * s / PX) * PX;
  c.save(); c.imageSmoothingEnabled = false; c.globalAlpha = alpha;
  c.drawImage(img, Math.round((x - w / 2) / PX) * PX, Math.round((y - h) / PX) * PX, w, h);
  c.restore();
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
  drawNebula(c, 0, 200 - (1 - a) * 400, smoothstep(0.78, 1, a));
  drawStars(c, 0, state.frame, smoothstep(0.62, 0.95, a), -climbed * 0.02);
  if (a > 0.7) drawSunDisc(c, 640, 120 + (1 - a) * 300);
  // (the high cirrus, far off: what's seen from the ground, dropping away slowly, gone into the dark)
  const hi = 1 - smoothstep(0.35, 0.6, a);
  if (hi > 0) for (let k = 0; k < 5; k++) drawCloud(c, (k * 211 + 60) % (W + 160) - 80, 70 + k * 34 + a * 900, 0.55 + hash(k + 20) * 0.3, 20 + k, tod, hi * 0.85);
  // (the park far below, dropping away)
  skyline(c, 470 + a * a * 5200, tod);
  // (the clouds, coming down past: a layer of them, then the deck of them far below)
  for (let k = 0; k < 9; k++) {
    const y = -200 + (a - 0.08 - k * 0.03) * 2600;
    if (y < -60 || y > H + 90) continue;
    drawCloud(c, (hash(k + 1) * 900 + k * 37) % 900 - 50, y + 20, 0.9 + hash(k + 5) * 0.9, k, tod);
  }
  // (the Earth's curve, coming up from below once he's out of the air)
  const rise = smoothstep(0.5, 1, a);
  if (rise > 0) drawEarth(c, H + 40 - rise * (H + 40 - DECK_LIMB), climbed * 0.05, a > 0.7 ? 640 : undefined);
  // (the shaft's girders, whipping down past behind him: speed lines with them when it's going fast)
  if (!shaft) return;
  drawShaft(c, climbed);
  if (speed > 0.35) for (let k = 0; k < 26; k++) {
    const x = Math.round(hash(k * 5) * W / PX) * PX, len = 60 + hash(k) * 160;
    const y = ((climbed * (0.6 + hash(k + 3) * 0.6) + k * 97) % (H + len)) - len;
    c.fillStyle = `rgba(255, 255, 255, ${((speed - 0.35) * (0.25 + hash(k + 9) * 0.35)).toFixed(3)})`;
    c.fillRect(x, Math.round(y), PX, Math.round(len));
  }
};
/** The lift shaft's open frame round the car: two chrome masts, cross girders with a lattice, rivets. */
const MAST = ['#0F1626', '#1E293B', '#334155', '#4E5E78', '#7A8BA6', '#B4C2D6'];
const drawShaft = (c: Ctx, climbed: number) => {
  const step = 150, off = (climbed % step + step) % step;
  for (let y = off - step; y < H; y += step) {
    const Y = Math.round(y / PX) * PX;
    c.fillStyle = MAST[0]; c.fillRect(0, Y - 2, W, 14);
    c.fillStyle = MAST[2]; c.fillRect(0, Y, W, 10);
    c.fillStyle = MAST[4]; c.fillRect(0, Y, W, 2);
    c.fillStyle = MAST[3]; c.fillRect(0, Y + 2, W, 2);
    c.fillStyle = MAST[1]; c.fillRect(0, Y + 8, W, 2);
    checker(c, 0, Y + 6, W, 2, MAST[1], 0, PX);
    for (let x = 6; x < W; x += 24) { c.fillStyle = MAST[5]; c.fillRect(x, Y + 4, 2, 2); }
  }
  for (const x of [120, 680]) {
    const cols = [MAST[3], MAST[5], MAST[4], MAST[3], MAST[2], MAST[1], MAST[1], MAST[0]];
    for (let i = 0; i < cols.length; i++) { c.fillStyle = cols[i]; c.fillRect(x - 10 + Math.round(i * 20 / cols.length), 0, Math.ceil(20 / cols.length) + 1, H); }
    c.fillStyle = MAST[0]; c.fillRect(x - 12, 0, 2, H); c.fillRect(x + 10, 0, 2, H);
  }
};

/** The shot from outside: the stars, the sun, the Earth a long way down (its limb at screen y `L`). */
export const drawOrbitBack = (c: Ctx, state: GameState, pan: number, L = 470) => {
  spaceBands(c, 0, L + 30);
  drawNebula(c, pan * 2, L * 0.45);
  drawStars(c, pan, state.frame);
  drawSunDisc(c, 120, 110);
  // (the moon kept down out of the corner the skip prompt's in)
  drawMoonDisc(c, 690, 175, 0.7);
  drawEarth(c, L, pan * 0.6 + state.frame * 0.15, 140);
};

/** Paints everything up front (the stage's build), so the first look out isn't a hitch. */
export const prewarmSky = () => {
  if (typeof document === 'undefined') return;
  ensureEarth(); ensureStars(); moon ??= paintMoon(); sun ??= paintSun(); nebula ??= paintNebula();
};
