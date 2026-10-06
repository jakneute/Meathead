// The wide shot out of the VIP lounge, painted: Hilo at night. A sky in bands, stars, the moon and its light down the
// clouds; Mauna Kea far off with a cap of snow; the volcano itself (stepped rock, strata ringing it, gullies, old black
// flows, rain forest dark on its lower slopes, three channels of lava glowing down it, one of them on into the sea in a
// cloud of steam, a plume of smoke lit from under); Club Caldera dug into the top of it (a neon ring round the crater,
// searchlights, lasers, rows of lit windows, its name in neon, and the VIP lounge's window, the one the shot pulls
// out from, with its balcony and its sign); the town along the shore, the bay with the moon and the lava in it in
// broken bands, and palms and brush in the foreground.
//
// It's seen from 12x in to 1x out, so it's drawn in its own units (a screen's worth at 1x) with the pixel size set by
// the zoom: a "pixel" stays two or three screen pixels the whole way, and what's near the window is drawn fine enough
// to hold up close. Everything in steps: bands dithered at the seams, rings for glows, an ink line round the near
// things; no gradients, no blur.

import { pixelBlob, pixelRidge } from '../../render/pixelArt';
import { ramp } from '../../render/backdrops/core';
import { INK, dark, lite } from '../../render/npc/kit';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
/** Smooth noise along a line (0..1). */
const noise = (x: number, seed: number) => {
  const i = Math.floor(x), k = x - i, s = k * k * (3 - 2 * k);
  return hash(i + seed * 101) * (1 - s) + hash(i + 1 + seed * 101) * s;
};

/** The volcano: the crater's middle and its rim, the foot of it, half its width there, the crater's half-width. */
export const WIDE = { cx: 400, top: 232, base: 474, half: 450, crater: 50 };
const { cx: CX, top: TOP, base: BASE, half: HALF, crater: CR } = WIDE;
/** The shore line (the town along it) and the bay below. */
const SHORE = 486;
const MOON = { x: 132, y: 104, r: 22 };

/** What's in view (in the scene's units), and how big a "pixel" is at this zoom. */
export interface WideView { x0: number; x1: number; y0: number; y1: number; zoom: number; px: number }

/** The pixel size at a zoom: two-ish screen pixels, in steps of a power of two. */
export const widePx = (zoom: number) => (zoom >= 7 ? 0.25 : zoom >= 3.5 ? 0.5 : zoom >= 1.7 ? 1 : 2);

// ---------------------------------------------------------------------------
// Steps and dithers at any pixel size
// ---------------------------------------------------------------------------

const pats = new Map<string, CanvasPattern>();
/** A checkerboard of `c` over (x, y, w, h), its cells `px` square (any size, fractions too). */
const dither = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string, px: number, phase = 0) => {
  if (typeof document === 'undefined' || w <= 0 || h <= 0) return;
  const key = c + '|' + phase;
  let p = pats.get(key);
  if (!p) {
    const cv = document.createElement('canvas'); cv.width = 2; cv.height = 2;
    const g = cv.getContext('2d')!; g.fillStyle = c; g.fillRect(phase, 0, 1, 1); g.fillRect(1 - phase, 1, 1, 1);
    p = ctx.createPattern(cv, 'repeat')!; pats.set(key, p);
  }
  p.setTransform?.(new DOMMatrix([px, 0, 0, px, 0, 0]));
  ctx.fillStyle = p; ctx.fillRect(x, y, w, h);
};
/** Top-to-bottom bands through `stops`, each seam dithered a row either side. */
const bands = (ctx: Ctx, x: number, y: number, w: number, h: number, stops: string[], n: number, px: number) => {
  const bh = h / n;
  for (let b = 0; b < n; b++) { ctx.fillStyle = ramp(stops, b / (n - 1)); ctx.fillRect(x, y + b * bh, w, bh + 0.5); }
  for (let b = 1; b < n; b++) {
    const ys = Math.round((y + b * bh) / px) * px;
    dither(ctx, x, ys - px, w, px, ramp(stops, b / (n - 1)), px, 0);
    dither(ctx, x, ys, w, px, ramp(stops, (b - 1) / (n - 1)), px, 1);
  }
};
/** Rings of light (flat discs, stepped). */
const rings = (ctx: Ctx, x: number, y: number, r: number, rgb: string, a0: number, a1: number, n: number, sy = 1) => {
  for (let i = n - 1; i >= 0; i--) {
    const k = i / Math.max(1, n - 1);
    ctx.fillStyle = `rgba(${rgb}, ${(a0 + (a1 - a0) * k).toFixed(3)})`;
    ctx.beginPath(); ctx.ellipse(x, y, r * (0.25 + 0.75 * k), r * (0.25 + 0.75 * k) * sy, 0, 0, Math.PI * 2); ctx.fill();
  }
};
const snapTo = (v: number, px: number) => Math.floor(v / px) * px;

// ---------------------------------------------------------------------------
// The volcano's shape
// ---------------------------------------------------------------------------

/** Its outline at x: flat (ragged) across the crater, steep below the rim and flaring out at the foot. */
export const wideProfile = (x: number) => {
  const d = Math.abs(x - CX);
  if (d < CR) return TOP + (noise(x * 0.4, 3) - 0.5) * 3 + (d > CR - 8 ? -1.5 : 0);
  const t = Math.min(1, (d - CR) / (HALF - CR));
  return TOP + (BASE - TOP) * (1 - Math.pow(1 - t, 1.7)) + (noise(x * 0.08, 7) - 0.5) * 6 * Math.sin(t * Math.PI) + (noise(x * 0.5, 9) - 0.5) * 1.5;
};
/** Half its width at height y (the smooth cone, without the rough edge). */
const halfAt = (y: number) => {
  const v = Math.max(0, Math.min(1, (y - TOP) / (BASE - TOP)));
  return CR + (HALF - CR) * (1 - Math.pow(1 - v, 1 / 1.7));
};
const conePath = (ctx: Ctx, v: WideView) => {
  const step = Math.max(0.5, v.px);
  const x0 = Math.max(-40, snapTo(v.x0, step) - step), x1 = Math.min(840, v.x1 + step);
  ctx.beginPath(); ctx.moveTo(x0, BASE + 40);
  for (let x = x0; x <= x1; x += step) ctx.lineTo(x, wideProfile(x));
  ctx.lineTo(x1, BASE + 40); ctx.closePath();
};

/** The lava channels down its flanks (points top to bottom); the second runs on across the plain into the bay. */
const CHANNELS: { pts: [number, number][]; w: number }[] = [
  { pts: [[378, 233], [366, 256], [357, 284], [350, 314], [334, 344], [318, 372], [304, 404], [284, 436], [262, 474]], w: 3.2 },
  { pts: [[430, 233], [446, 254], [462, 276], [474, 300], [490, 330], [508, 366], [528, 404], [550, 442], [566, 474], [578, 484], [586, 492]], w: 3.6 },
  { pts: [[398, 233], [396, 252], [390, 276], [384, 300], [376, 324], [370, 342]], w: 2.2 },
];
/** A channel's points smoothed (each leg split, nudged by a little wander). */
const channelLine = (c: { pts: [number, number][] }, i: number) => {
  const out: [number, number][] = [];
  for (let k = 0; k < c.pts.length - 1; k++) {
    const [ax, ay] = c.pts[k], [bx, by] = c.pts[k + 1];
    for (let j = 0; j < 4; j++) {
      const t = j / 4, w = k === 0 && j === 0 ? 0 : (hash(i * 50 + k * 4 + j) - 0.5) * 2.4;
      out.push([ax + (bx - ax) * t + w, ay + (by - ay) * t]);
    }
  }
  out.push(c.pts[c.pts.length - 1]);
  return out;
};
const LINES = CHANNELS.map(channelLine);
const strokeLine = (ctx: Ctx, pts: [number, number][]) => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]); };

// ---------------------------------------------------------------------------
// The scene
// ---------------------------------------------------------------------------

/**
 * Everything in the wide shot but the VIP window's party and the blast. `wx, wy`: the window (kept clear, framed);
 * `flash`: the blast's light (0..1) on the mountain and the water; `wrecked`: the lounge has gone up.
 */
export const drawWideScene = (ctx: Ctx, v: WideView, f: number, wx: number, wy: number, flash: number, wrecked: boolean) => {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  drawSky(ctx, v, f);
  drawFarIsland(ctx, v);
  drawPlume(ctx, v, f);
  drawCone(ctx, v, f, flash);
  drawClubFace(ctx, v, f, wx, wy, wrecked);
  drawShore(ctx, v, f);
  drawBay(ctx, v, f, wx, flash);
  drawForeground(ctx, v, f);
  ctx.restore();
};

/** Night: bands from near black up top to a bruised purple at the horizon, warm round the volcano; stars; the moon; clouds. */
const drawSky = (ctx: Ctx, v: WideView, f: number) => {
  const px = v.px, x0 = Math.max(-40, v.x0 - 4), x1 = Math.min(840, v.x1 + 4), w = x1 - x0;
  ctx.fillStyle = '#05040F'; ctx.fillRect(x0, -40, w, 80);
  bands(ctx, x0, 20, w, 470, ['#05040F', '#0A0820', '#120D2E', '#1D1238', '#2C163E', '#40193E', '#58203A'], 14, px);
  // (the glow off the crater on the sky over it, in rings)
  rings(ctx, CX, TOP - 10, 230, '234, 88, 12', 0.13, 0.02, 6, 0.8);
  // Stars: specks, a few bigger with a cross, twinkling; thinner low down and none over the glow
  for (let i = 0; i < 170; i++) {
    const x = hash(i * 3.1) * 820 - 10, y = 30 + Math.pow(hash(i * 7.7), 1.4) * 360;
    if (x < v.x0 - 4 || x > v.x1 + 4 || y < v.y0 - 4 || y > v.y1 + 4) continue;
    if (Math.hypot(x - CX, (y - TOP) * 1.2) < 120) continue;
    const tw = Math.sin(f * (0.05 + hash(i) * 0.08) + i) > 0.6;
    const big = i % 23 === 0, sz = Math.max(px, big ? 1.5 : 1) * (v.zoom > 2 ? 0.5 * Math.min(2, v.zoom / 2) : 1);
    ctx.fillStyle = tw ? '#FFFFFF' : i % 5 === 0 ? '#BFDBFE' : i % 7 === 0 ? '#FDE68A' : 'rgba(226, 232, 240, 0.7)';
    ctx.fillRect(x, y, sz, sz);
    if (big) { ctx.fillStyle = 'rgba(191, 219, 254, 0.5)'; ctx.fillRect(x - sz, y, sz * 3, sz); ctx.fillRect(x, y - sz, sz, sz * 3); }
  }
  // The moon: its halo in rings, the disc lit from the upper right in steps, the maria dark, an ink edge
  const { x: mx, y: my, r } = MOON;
  rings(ctx, mx, my, r * 3.2, '191, 219, 254', 0.12, 0.02, 5);
  ctx.save(); ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#C7CCE0'; ctx.fillRect(mx - r, my - r, r * 2, r * 2);
  ctx.fillStyle = '#E6E9F5'; ctx.beginPath(); ctx.arc(mx + r * 0.25, my - r * 0.2, r * 0.85, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FBFCFF'; ctx.beginPath(); ctx.arc(mx + r * 0.4, my - r * 0.35, r * 0.5, 0, Math.PI * 2); ctx.fill();
  dither(ctx, mx - r, my - r, r * 2, r * 2, 'rgba(160, 168, 196, 0.5)', px, 0);
  ctx.fillStyle = '#C7CCE0'; ctx.beginPath(); ctx.arc(mx + r * 0.4, my - r * 0.35, r * 0.32, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#E6E9F5'; ctx.beginPath(); ctx.arc(mx + r * 0.45, my - r * 0.4, r * 0.24, 0, Math.PI * 2); ctx.fill();
  for (const [ox, oy, rr] of [[-0.35, -0.2, 0.28], [0.05, 0.35, 0.22], [0.35, 0.05, 0.14], [-0.1, -0.5, 0.12]]) {
    ctx.fillStyle = '#9EA5C2'; ctx.beginPath(); ctx.arc(mx + ox * r, my + oy * r, rr * r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#B4BAD4'; ctx.beginPath(); ctx.arc(mx + ox * r + rr * r * 0.25, my + oy * r - rr * r * 0.25, rr * r * 0.6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#8A90AD'; ctx.fillRect(mx - r, my + r * 0.55, r * 2, r);
  dither(ctx, mx - r, my + r * 0.35, r * 2, r * 0.2, '#8A90AD', px);
  ctx.restore();
  ctx.strokeStyle = '#2A2C4A'; ctx.lineWidth = Math.max(0.5, px * 0.75); ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2); ctx.stroke();
  // Clouds: banks of them drifting, puffs heaped on a flat bottom; lit silver along the tops by the moon, warm
  // underneath where the volcano's glow catches them
  const drift = f * 0.03;
  for (let i = 0; i < 6; i++) {
    const y = 84 + i * 40 + hash(i + 3) * 16, len = 50 + hash(i) * 60;
    const x = ((hash(i * 9) * 900 + drift * (0.5 + hash(i + 1))) % 980) - 90;
    // (none in front of the crater's glow: the plume's there)
    if (Math.abs(x - CX) < 150 + len) continue;
    if (x + len * 1.4 < v.x0 || x - len * 1.4 > v.x1 || y < v.y0 - 40 || y > v.y1 + 30) continue;
    const near = 1 - Math.min(1, Math.abs(x - CX) / 320);
    const under = `rgb(${Math.round(40 + near * 80)}, ${Math.round(22 + near * 18)}, ${Math.round(48 - near * 14)})`;
    pixelBlob(ctx, x, y + 2, len * 1.3, 6, under, px);
    for (let k = 0; k < 4; k++) {
      const ox = (k - 1.5) * len * 0.5 + (hash(i * 5 + k) - 0.5) * 10, r = len * (0.28 + hash(i * 7 + k) * 0.18);
      pixelBlob(ctx, x + ox, y - r * 0.3, r, r * 0.55, '#1B1636', px);
      pixelBlob(ctx, x + ox - r * 0.25, y - r * 0.62, r * 0.55, r * 0.22, '#3C3F6E', px);
    }
    pixelBlob(ctx, x, y + 1, len * 1.2, 3, '#1B1636', px);
  }
};

/** Far off behind it: Mauna Kea (a cap of snow, moonlit) and the long shoulder of Mauna Loa, hazed into the sky. */
const drawFarIsland = (ctx: Ctx, v: WideView) => {
  const px = Math.max(1, v.px), x0 = Math.max(-40, v.x0 - 4), x1 = Math.min(840, v.x1 + 4);
  if (v.y1 < 360) return;
  const kea = (x: number) => 452 - 70 * Math.exp(-Math.pow((x - 700) / 150, 2)) - 46 * Math.exp(-Math.pow((x - 90) / 230, 2)) + (noise(x * 0.06, 21) - 0.5) * 5;
  pixelRidge(ctx, x0, x1, 500, kea, 0, { fill: '#1E1838', rim: '#4A4A78', lit: '#2A2550', shade: '#171230' }, -1, px);
  // (snow on the top of Mauna Kea, in the moonlight)
  for (let x = snapTo(Math.max(x0, 640), px); x < Math.min(x1, 760); x += px) {
    const y = snapTo(kea(x), px), d = Math.abs(x - 700);
    const h = Math.max(0, 9 - d * 0.14 + (noise(x * 0.3, 5) - 0.5) * 6);
    if (h <= 0) continue;
    ctx.fillStyle = '#9BA3C9'; ctx.fillRect(x, y, px, h);
    ctx.fillStyle = '#C9CFE8'; ctx.fillRect(x, y, px, Math.min(h, px * 1.5));
  }
  // (and the haze between)
  for (let i = 0; i < 4; i++) { ctx.fillStyle = `rgba(88, 32, 58, ${(0.08 + i * 0.07).toFixed(2)})`; ctx.fillRect(x0, 420 + i * 12, x1 - x0, 12); }
};

/** The plume: rolling up out of the crater and leaning off to the right on the wind; lit orange from under near the top
 * of the mountain, going to cold grey higher up, its edges ragged. */
const drawPlume = (ctx: Ctx, v: WideView, f: number) => {
  const px = Math.max(0.5, v.px);
  for (let i = 0; i < 16; i++) {
    const t = ((f * 0.25 + i * 22) % 352) / 352;
    const r = 14 + t * 54;
    const x = CX + Math.sin(t * 4 + i) * 8 + t * t * 260, y = TOP - 6 - t * 230;
    if (x + r < v.x0 || x - r > v.x1 || y + r < v.y0 || y - r > v.y1) continue;
    const warm = Math.max(0, 1 - t * 2.2);
    const a = 0.75 * (1 - t * 0.7);
    pixelBlob(ctx, x, y + r * 0.15, r, r * 0.8, `rgba(${Math.round(120 + warm * 110)}, ${Math.round(50 + warm * 40)}, ${Math.round(40 + warm * 10)}, ${(a * 0.7).toFixed(2)})`, px);
    pixelBlob(ctx, x - r * 0.08, y - r * 0.05, r * 0.88, r * 0.7, `rgba(${Math.round(46 + t * 30)}, ${Math.round(36 + t * 30)}, ${Math.round(48 + t * 34)}, ${a.toFixed(2)})`, px);
    pixelBlob(ctx, x - r * 0.3, y - r * 0.35, r * 0.4, r * 0.25, `rgba(130, 136, 176, ${(a * 0.35 * t).toFixed(2)})`, px);
  }
};

/** Rock tones across the cone, shadow to lit (the moon's up to the left). */
const ROCK = ['#100B15', '#17111E', '#1F1727', '#2A1F31', '#36293C', '#44334A'];
const FOREST = ['#060D0B', '#0A1511', '#0F1D16', '#16281D', '#1E3524'];

const drawCone = (ctx: Ctx, v: WideView, f: number, flash: number) => {
  const px = v.px;
  const x0 = Math.max(-40, v.x0 - 4), x1 = Math.min(840, v.x1 + 4);
  // (the crater's light behind the rim: a dome of it)
  rings(ctx, CX, TOP + 2, CR * 1.9, '249, 115, 22', 0.6, 0.05, 5, 0.75);
  rings(ctx, CX, TOP + 2, CR * 0.95, '254, 240, 138', 0.75, 0.25, 3, 0.5);
  ctx.save();
  conePath(ctx, v); ctx.clip();
  // The rock: in wedges fanning down from over the crater (the way the light falls round a cone), each a flat step of
  // tone, lit round the moon's side; where the tone steps, a wedge of dither between
  const AX = CX, AY = TOP - 70, n = 36, foot = BASE + 40;
  const toneAt = (u: number) => Math.max(0, Math.min(ROCK.length - 1, Math.round((0.66 - (u + 0.3) * 0.5 - Math.abs(u + 0.3) * 0.3) * (ROCK.length - 1))));
  const footX = (i: number) => CX - HALF * 1.1 + (i / n) * HALF * 2.2;
  const wedge = (xa: number, xb: number) => { ctx.beginPath(); ctx.moveTo(AX, AY); ctx.lineTo(xa, foot); ctx.lineTo(xb, foot); ctx.closePath(); };
  let prev = -1;
  for (let i = 0; i < n; i++) {
    const xa = footX(i), xb = footX(i + 1), tone = toneAt(((xa + xb) / 2 - CX) / HALF);
    wedge(xa, xb + 0.6); ctx.fillStyle = ROCK[tone]; ctx.fill();
    if (prev >= 0 && prev !== tone) {
      const w = (xb - xa) * 0.35;
      ctx.save(); wedge(xa - w, xa + w); ctx.clip();
      dither(ctx, Math.min(AX, xa - w) - 1, AY, Math.abs(xa - AX) + w * 2 + 2, foot - AY, ROCK[Math.max(prev, tone)], px);
      ctx.restore();
    }
    prev = tone;
  }
  // (darker up under the rim, where it's steep and in its own shadow; warm along the lip from the crater)
  bands(ctx, x0, TOP - 4, x1 - x0, 36, ['rgba(110, 44, 26, 0.55)', 'rgba(60, 24, 24, 0.3)', 'rgba(16, 10, 20, 0)'], 4, px);
  // Strata: the layers of old eruptions ringing it, bowing down across the front, wavering, broken here and there:
  // each a dark seam with a lit ledge under it
  for (let s = 0; s < 9; s++) {
    const y = TOP + 16 + s * s * 1.6 + s * 9 + hash(s) * 4;
    if (y > BASE - 40) break;
    const hw = halfAt(y), bow = hw * 0.1;
    if (y + bow < v.y0 - 4 || y - 4 > v.y1) continue;
    const seg = 26;
    for (let j = 0; j < seg; j++) {
      if (hash(s * 40 + j) < 0.4) continue;
      const pts: [number, number][] = [];
      for (let q = 0; q <= 3; q++) {
        const a = Math.PI * ((j + q * 0.22) / seg), xx = CX - Math.cos(a) * hw;
        pts.push([xx, y + Math.sin(a) * bow + (noise(xx * 0.15, s + 60) - 0.5) * 3]);
      }
      if (Math.max(pts[0][0], pts[3][0]) < x0 || Math.min(pts[0][0], pts[3][0]) > x1) continue;
      const th = 0.6 + hash(s * 9 + j) * 0.9;
      strokeLine(ctx, pts); ctx.strokeStyle = 'rgba(8, 4, 10, 0.45)'; ctx.lineWidth = th; ctx.stroke();
      ctx.save(); ctx.translate(0, th * 0.5 + 0.4); strokeLine(ctx, pts); ctx.restore();
      ctx.strokeStyle = pts[0][0] < CX ? 'rgba(104, 90, 130, 0.35)' : 'rgba(80, 56, 72, 0.25)'; ctx.lineWidth = 0.45; ctx.stroke();
    }
  }
  // Gullies down from the rim: a dark groove, its left lip lit
  for (let g = 0; g < 9; g++) {
    const u = -0.9 + g * 0.225 + (hash(g) - 0.5) * 0.08;
    const xa = CX + u * CR * 0.95, xb = CX + u * HALF * (0.9 + hash(g + 3) * 0.12), mx = (xa + xb) / 2 + (hash(g + 7) - 0.5) * 30;
    if (Math.max(xa, xb, mx) < x0 - 10 || Math.min(xa, xb, mx) > x1 + 10) continue;
    const ya = TOP + 3, yb = BASE - 4 - hash(g + 11) * 50;
    const path = (dx: number) => { ctx.beginPath(); ctx.moveTo(xa + dx, ya); ctx.quadraticCurveTo(mx + dx, TOP + (yb - TOP) * 0.45, xb + dx, yb); };
    path(0); ctx.strokeStyle = 'rgba(6, 3, 8, 0.4)'; ctx.lineWidth = 1.8; ctx.stroke();
    path(-1.2); ctx.strokeStyle = u < 0.1 ? 'rgba(110, 92, 132, 0.3)' : 'rgba(84, 56, 70, 0.22)'; ctx.lineWidth = 0.6; ctx.stroke();
  }
  // Scree and rough rock all over it: chips, each lit along its top on the moon's side, a shadow under
  for (let i = 0; i < 900; i++) {
    const y = TOP + 4 + hash(i * 1.31) * (BASE - TOP - 40);
    const x = CX + (hash(i * 2.77) * 2 - 1) * halfAt(y) * 0.97;
    if (x < v.x0 - 2 || x > v.x1 + 2 || y < v.y0 - 2 || y > v.y1 + 2) continue;
    const sz = 0.6 + hash(i * 3.9) * 1.2;
    ctx.fillStyle = 'rgba(6, 3, 8, 0.5)'; ctx.fillRect(x, y + sz * 0.3, sz, sz * 0.7);
    ctx.fillStyle = x < CX + 20 ? 'rgba(116, 100, 146, 0.4)' : 'rgba(100, 60, 80, 0.3)'; ctx.fillRect(x, y, sz, Math.max(0.25, sz * 0.3));
  }
  // Old flows, cooled black, in tongues down the flanks (a sheen of moonlight along their left edges)
  for (const [sx, ex, ey, wd] of [[352, 170, 460, 16], [452, 660, 468, 20], [404, 430, 420, 10]] as [number, number, number, number][]) {
    const path = () => {
      ctx.beginPath(); ctx.moveTo(sx - 4, TOP + 30);
      ctx.quadraticCurveTo((sx + ex) / 2 - wd, (TOP + ey) / 2, ex - wd, ey);
      ctx.quadraticCurveTo(ex, ey + wd * 0.6, ex + wd, ey);
      ctx.quadraticCurveTo((sx + ex) / 2 + wd, (TOP + ey) / 2, sx + 4, TOP + 30); ctx.closePath();
    };
    path(); ctx.fillStyle = 'rgba(6, 4, 8, 0.6)'; ctx.fill();
    ctx.save(); path(); ctx.clip(); dither(ctx, Math.min(sx, ex) - wd, TOP, Math.abs(ex - sx) + wd * 2, ey - TOP + wd, 'rgba(60, 54, 84, 0.35)', px); ctx.restore();
  }
  // Rain forest on the lower slopes (Hilo's the wet side): its top edge ragged with treetops, lit along it from the left
  const fy = (x: number) => { const y = wideProfile(x), d = Math.abs(x - CX); return Math.max(y + 6, BASE - 70 + d * 0.06 + (noise(x * 0.09, 31) - 0.5) * 22 + (noise(x * 0.6, 33) - 0.5) * 5); };
  const fstep = Math.max(px, 1);
  for (let x = snapTo(x0, fstep); x < x1; x += fstep) {
    const y = snapTo(fy(x), px), u = (x - CX) / HALF;
    const k = Math.max(0, Math.min(0.999, 0.6 - u * 0.5));
    ctx.fillStyle = ramp(FOREST, k * 0.6); ctx.fillRect(x, y, fstep, BASE + 40 - y);
    ctx.fillStyle = ramp(FOREST, k); ctx.fillRect(x, y, fstep, Math.max(px, 2));
    if (Math.floor(x / fstep) % 3 === 0) { ctx.fillStyle = ramp(FOREST, Math.min(0.999, k + 0.2)); ctx.fillRect(x, y, fstep, px); }
  }
  // (a dither where the trees thin out into the rock above)
  for (let x = snapTo(x0, fstep * 2); x < x1; x += fstep * 2) { const y = snapTo(fy(x), px); dither(ctx, x, y - px * 2, fstep * 2, px * 2, FOREST[1], px, 1); }
  // Lava glowing down it: a glow either side in steps, the dark crust at its edges, the molten middle, a white-hot thread
  const pulse = 0.85 + 0.15 * Math.sin(f * 0.06);
  LINES.forEach((pts, i) => {
    const w = CHANNELS[i].w;
    strokeLine(ctx, pts);
    ctx.strokeStyle = 'rgba(234, 88, 12, 0.08)'; ctx.lineWidth = w * 7; ctx.stroke();
    ctx.strokeStyle = 'rgba(234, 88, 12, 0.14)'; ctx.lineWidth = w * 4; ctx.stroke();
    ctx.strokeStyle = '#3B0D0A'; ctx.lineWidth = w * 1.6; ctx.stroke();
    ctx.strokeStyle = '#9A2412'; ctx.lineWidth = w * 1.15; ctx.stroke();
    ctx.strokeStyle = `rgba(249, 115, 22, ${pulse.toFixed(2)})`; ctx.lineWidth = w * 0.8; ctx.stroke();
    ctx.strokeStyle = '#FDE047'; ctx.lineWidth = w * 0.32; ctx.stroke();
    // (brighter clots riding down it)
    ctx.setLineDash([w * 0.9, w * 5]); ctx.lineDashOffset = -f * 0.25 - i * 7;
    ctx.strokeStyle = '#FFFBEB'; ctx.lineWidth = w * 0.4; ctx.stroke();
    ctx.setLineDash([]);
    // (where it ends cooling (the short one): the last of it crusted over, glowing through cracks)
    if (i === 2) { const [ex, ey] = pts[pts.length - 1]; rings(ctx, ex, ey, 6, '249, 115, 22', 0.4, 0.05, 3); ctx.fillStyle = '#3B0D0A'; ctx.beginPath(); ctx.ellipse(ex, ey + 1, 3.5, 2.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#F97316'; ctx.fillRect(ex - 1, ey, 1, 1); ctx.fillRect(ex + 1, ey + 1, 0.8, 0.8); }
  });
  // The blast's light on the face of it
  if (flash > 0) rings(ctx, 440, 296, 170, '251, 146, 60', 0.45 * flash, 0.03 * flash, 6, 0.9);
  ctx.restore();
  // The crater's rim, lit by what's in it: a ragged lip of light
  const rx0 = Math.max(CX - CR - 2, snapTo(x0, px)), rx1 = Math.min(CX + CR + 2, x1);
  for (let x = rx0; x < rx1; x += Math.max(px, 0.5)) {
    const y = wideProfile(x), e = 1 - Math.abs(x - CX) / (CR + 2);
    ctx.fillStyle = e > 0.6 ? '#FDE68A' : e > 0.3 ? '#FB923C' : '#C2410C'; ctx.fillRect(x, y, Math.max(px, 0.5), Math.max(px, 0.75));
  }
  // Now and then it spits: bombs arcing up out of the crater
  for (let i = 0; i < 3; i++) {
    const t = ((f + i * 70) % 210) / 60;
    if (t > 1) continue;
    const bx = CX + (i - 1) * 40 * t * 2.6, by = TOP - Math.sin(t * Math.PI) * 90;
    ctx.fillStyle = '#7C2D12'; ctx.fillRect(bx - 2, by - 2, 4, 4);
    ctx.fillStyle = '#FB923C'; ctx.fillRect(bx - 1.5, by - 1.5, 3, 3); ctx.fillStyle = '#FEF08A'; ctx.fillRect(bx - 1, by - 1, 1.5, 1.5);
  }
};

const NEON = ['#F472B6', '#22D3EE', '#A78BFA', '#FB923C'];
/** A neon line (stroked along the current path): a halo in two steps, the tube, its hot core. */
const neonPath = (ctx: Ctx, c: string, w: number) => {
  ctx.strokeStyle = c;
  ctx.globalAlpha = 0.14; ctx.lineWidth = w * 5; ctx.stroke();
  ctx.globalAlpha = 0.3; ctx.lineWidth = w * 2.6; ctx.stroke();
  ctx.globalAlpha = 1; ctx.lineWidth = w; ctx.stroke();
  ctx.strokeStyle = lite(c, 0.6); ctx.lineWidth = w * 0.35; ctx.stroke();
};

/** Neon lettering at any size: a halo in two steps round the tube, an ink-dark edge, the hot core; off, a dead tube. */
const neonLabel = (ctx: Ctx, text: string, x: number, y: number, size: number, tube: string, core: string, on: boolean) => {
  ctx.save();
  ctx.font = `bold ${size}px "Press Start 2P"`; ctx.textAlign = 'center';
  const ring = (r: number, c: string) => { ctx.fillStyle = c; for (const [dx, dy] of [[-r, 0], [r, 0], [0, -r], [0, r], [-r, -r], [r, -r], [-r, r], [r, r]]) ctx.fillText(text, x + dx, y + dy); };
  if (on) {
    ctx.globalAlpha = 0.16; ring(size * 0.24, tube);
    ctx.globalAlpha = 0.32; ring(size * 0.12, tube);
    ctx.globalAlpha = 1; ring(size * 0.06, dark(tube, 0.35));
    ctx.fillStyle = core; ctx.fillText(text, x, y);
  } else { ring(size * 0.06, INK); ctx.fillStyle = dark(tube, 0.55); ctx.fillText(text, x, y); }
  ctx.restore();
};

/** Club Caldera, in the mountain: searchlights, lasers, the neon ring, the windows, its sign, and the VIP lounge's window. */
const drawClubFace = (ctx: Ctx, v: WideView, f: number, wx: number, wy: number, wrecked: boolean) => {
  const px = v.px, beat = Math.floor(f / 30);
  // Searchlights sweeping up out of the crater (each a beam in three widths, fading off in steps along it)
  for (let i = 0; i < 3; i++) {
    const ang = -Math.PI / 2 + Math.sin(f * 0.012 + i * 2.1) * 0.55, ox = CX + (i - 1) * CR * 0.5;
    const col = i === 1 ? '254, 240, 138' : i === 0 ? '244, 114, 182' : '34, 211, 238';
    for (let seg = 0; seg < 3; seg++) for (const [spread, a] of [[0.07, 0.05], [0.045, 0.06], [0.02, 0.08]]) {
      const l0 = seg * 160, l1 = (seg + 1) * 160, fade = 1 - seg * 0.3;
      ctx.fillStyle = `rgba(${col}, ${(a * fade).toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(ox + Math.cos(ang - spread) * l0, TOP + Math.sin(ang - spread) * l0);
      ctx.lineTo(ox + Math.cos(ang - spread) * l1, TOP + Math.sin(ang - spread) * l1);
      ctx.lineTo(ox + Math.cos(ang + spread) * l1, TOP + Math.sin(ang + spread) * l1);
      ctx.lineTo(ox + Math.cos(ang + spread) * l0, TOP + Math.sin(ang + spread) * l0);
      ctx.closePath(); ctx.fill();
    }
  }
  // Lasers fanned out over the rim, on the beat
  if (beat % 2 === 0) {
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.45)'; ctx.lineWidth = 0.9;
    for (let i = 0; i < 5; i++) { const a = -Math.PI * (0.15 + i * 0.175) + Math.sin(f * 0.05) * 0.1; ctx.beginPath(); ctx.moveTo(CX, TOP - 4); ctx.lineTo(CX + Math.cos(a) * 240, TOP - 4 + Math.sin(a) * 240); ctx.stroke(); }
  }
  // The neon ring round the rim
  ctx.beginPath(); ctx.ellipse(CX, TOP + 2, CR * 1.06, 4.5, 0, 0, Math.PI * 2); neonPath(ctx, '#F472B6', 1.4);
  // Rows of lit windows dug in round the top of it (on the curve of the mountain: narrower toward its sides), colors
  // chasing on the beat; a figure in some of them, close to
  for (let r = 0; r < 7; r++) {
    const y = TOP + 18 + r * 15, hw = halfAt(y) * 0.8, bow = hw * 0.1;
    if (y + bow + 4 < v.y0 || y - 4 > v.y1) continue;
    const n = 6 + r * 2;
    for (let k = 0; k < n; k++) {
      const a = Math.PI * ((k + 0.5) / n), x = CX - Math.cos(a) * hw, yy = y + Math.sin(a) * bow;
      if (x < v.x0 - 6 || x > v.x1 + 6) continue;
      if (Math.hypot(x - wx, (yy - wy) * 1.3) < 26) continue;
      if (hash(r * 31 + k) < 0.3) continue;
      const ww = 4.2 * Math.max(0.35, Math.sin(a)), wh = 2.8;
      const out = wrecked && Math.hypot(x - wx, yy - wy) < 60 && hash(r * 5 + k * 3) < 0.7;
      const lit = !out && (k + r + beat) % 5 !== 0, c = NEON[(k + r * 2 + beat) % 4];
      ctx.fillStyle = INK; ctx.fillRect(x - ww / 2 - 0.5, yy - wh / 2 - 0.5, ww + 1, wh + 1);
      ctx.fillStyle = lit ? c : '#24131C'; ctx.fillRect(x - ww / 2, yy - wh / 2, ww, wh);
      if (lit) {
        ctx.fillStyle = lite(c, 0.5); ctx.fillRect(x - ww / 2, yy - wh / 2, ww, 0.6);
        if (v.zoom > 2.5 && hash(r * 7 + k) > 0.5) { const sx = x - ww / 2 + ((f * 0.03 + k) % ww); ctx.fillStyle = 'rgba(20, 6, 30, 0.7)'; ctx.fillRect(Math.min(sx, x + ww / 2 - 0.8), yy - 0.6, 0.8, wh / 2 + 0.6); ctx.fillRect(Math.min(sx, x + ww / 2 - 0.8) + 0.05, yy - 1.2, 0.7, 0.7); }
        ctx.fillStyle = `rgba(${c === '#FB923C' ? '251,146,60' : '244,114,182'}, 0.12)`; ctx.fillRect(x - ww / 2 - 1, yy + wh / 2 + 0.5, ww + 2, 2);
      }
    }
  }
  // CLUB CALDERA down the flank in neon, buzzing; a neon cocktail glass on the other side
  const on = hash(Math.floor(f / 6) * 7.3) > 0.05;
  neonLabel(ctx, 'CLUB', 232, 370, 13, '#FB923C', '#FED7AA', on);
  neonLabel(ctx, 'CALDERA', 232, 388, 13, '#FB923C', '#FED7AA', on);
  const gx = 588, gy = 380;
  ctx.beginPath(); ctx.moveTo(gx - 13, gy - 13); ctx.lineTo(gx + 13, gy - 13); ctx.lineTo(gx, gy + 2); ctx.closePath();
  ctx.moveTo(gx, gy + 2); ctx.lineTo(gx, gy + 15); ctx.moveTo(gx - 7, gy + 15); ctx.lineTo(gx + 7, gy + 15);
  neonPath(ctx, beat % 2 ? '#22D3EE' : '#67E8F9', 1.6);
  ctx.beginPath(); ctx.arc(gx + 7, gy - 15, 3, 0, Math.PI * 2); neonPath(ctx, '#A3E635', 1.2);
  // The VIP lounge: its window (drawn with the party in it by the caller) set in a gold-trimmed bay, neon round it, a
  // little balcony under it, its sign over it, a porthole either side, light spilling down the rock
  if (wx > v.x0 - 40 && wx < v.x1 + 40 && wy > v.y0 - 40 && wy < v.y1 + 40) drawVipBay(ctx, v, f, wx, wy, wrecked);
  // The front door at the foot: a neon arch, the red carpet out of it
  const dx = 300, dy = BASE + 4;
  ctx.fillStyle = '#0A0406'; ctx.fillRect(dx - 9, dy - 16, 18, 16);
  ctx.beginPath(); ctx.moveTo(dx - 9, dy); ctx.lineTo(dx - 9, dy - 9); ctx.arc(dx, dy - 9, 9, Math.PI, 0); ctx.lineTo(dx + 9, dy); neonPath(ctx, '#F472B6', 1.1);
  ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.moveTo(dx - 5, dy); ctx.lineTo(dx + 5, dy); ctx.lineTo(dx + 10, dy + 6); ctx.lineTo(dx - 10, dy + 6); ctx.closePath(); ctx.fill();
  void px;
};

/** Close to, round the VIP lounge's window: the rock (chips and cracks, lit by the window), the bay it's set in. */
const drawVipBay = (ctx: Ctx, v: WideView, f: number, wx: number, wy: number, wrecked: boolean) => {
  // (the window's light down the rock under it; afterwards, the fire's)
  if (wrecked) rings(ctx, wx, wy, 26, '249, 115, 22', 0.25 + 0.05 * Math.sin(f * 0.3), 0.03, 4, 0.9);
  else rings(ctx, wx, wy + 8, 22, '236, 72, 153', 0.22, 0.03, 4, 0.8);
  // The rock round it close up: chips lit on top, cracks
  if (v.zoom > 2) {
    for (let i = 0; i < 140; i++) {
      const x = wx - 40 + hash(i * 1.7) * 80, y = wy - 26 + hash(i * 2.9) * 52;
      if (Math.abs(x - wx) < 10 && Math.abs(y - wy) < 9) continue;
      const s = 0.5 + hash(i + 5) * 1.3;
      ctx.fillStyle = 'rgba(8, 4, 10, 0.55)'; ctx.fillRect(x, y + s * 0.4, s, s * 0.6);
      ctx.fillStyle = x < wx ? 'rgba(110, 96, 140, 0.45)' : 'rgba(150, 70, 110, 0.4)'; ctx.fillRect(x, y, s, s * 0.35);
    }
    ctx.strokeStyle = 'rgba(8, 4, 10, 0.6)'; ctx.lineWidth = 0.3;
    for (let i = 0; i < 9; i++) {
      let x = wx - 34 + hash(i * 4.1) * 68, y = wy - 22 + hash(i * 6.3) * 44;
      if (Math.abs(x - wx) < 12 && Math.abs(y - wy) < 10) continue;
      ctx.beginPath(); ctx.moveTo(x, y);
      for (let k = 0; k < 4; k++) { x += (hash(i * 9 + k) - 0.5) * 4; y += 1 + hash(i * 3 + k) * 2.5; ctx.lineTo(x, y); }
      ctx.stroke();
    }
  }
  if (wrecked) {
    // Afterwards: the bay blown out, soot streaked up the rock over it, the balcony hanging off by one end, the sign
    // dead and crooked, the portholes gone, little fires in the rubble
    for (let i = 0; i < 7; i++) {
      const sx = wx - 9 + i * 3 + (hash(i) - 0.5) * 2, h = 10 + hash(i + 3) * 16;
      ctx.fillStyle = 'rgba(10, 6, 8, 0.6)'; ctx.beginPath(); ctx.moveTo(sx - 2.5, wy - 6); ctx.lineTo(sx + (hash(i + 9) - 0.5) * 6, wy - 6 - h); ctx.lineTo(sx + 2.5, wy - 6); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = 'rgba(10, 6, 8, 0.5)'; ctx.beginPath(); ctx.ellipse(wx, wy, 16, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.translate(wx + 10, wy + 7); ctx.rotate(0.55);
    ctx.fillStyle = INK; ctx.fillRect(-21, -0.2, 21, 2); ctx.fillStyle = '#3F2A30'; ctx.fillRect(-20.6, 0.1, 20.2, 1.3);
    ctx.fillStyle = '#7C5A12'; for (let x = -20; x <= -1; x += 2.5) ctx.fillRect(x, -2.6, 0.35, 2.6); ctx.fillRect(-20, -2.8, 20, 0.45);
    ctx.restore();
    ctx.save(); ctx.translate(wx - 2, wy - 11); ctx.rotate(-0.3); neonLabel(ctx, 'VIP', 0, 0, 4, '#FACC15', '#FEF9C3', Math.floor(f / 3) % 17 === 0); ctx.restore();
    for (const ox of [-17, 17]) {
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(wx + ox, wy - 1, 3.3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#F97316'; ctx.lineWidth = 0.4; ctx.beginPath(); ctx.arc(wx + ox, wy - 1, 2.6, 0, Math.PI * 2); ctx.stroke();
    }
    for (let i = 0; i < 5; i++) {
      const fx = wx - 12 + i * 6 + hash(i) * 2, fy = wy + 7 - (i % 2) * 2, h = 2 + Math.abs(Math.sin(f * 0.4 + i * 2)) * 2.5;
      ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.moveTo(fx - 1.4, fy); ctx.lineTo(fx, fy - h - 1); ctx.lineTo(fx + 1.4, fy); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#FB923C'; ctx.beginPath(); ctx.moveTo(fx - 0.9, fy); ctx.lineTo(fx + 0.2, fy - h); ctx.lineTo(fx + 0.9, fy); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#FEF08A'; ctx.fillRect(fx - 0.3, fy - 1, 0.6, 0.8);
    }
    return;
  }
  // The bay: a recess cut in the rock, trimmed in gold
  ctx.fillStyle = INK; ctx.fillRect(wx - 10, wy - 9, 20, 17);
  ctx.fillStyle = '#1A0C14'; ctx.fillRect(wx - 9.5, wy - 8.5, 19, 16);
  ctx.fillStyle = '#2A1420'; ctx.fillRect(wx - 9.5, wy - 8.5, 19, 1.5);
  ctx.fillStyle = '#A16207'; ctx.fillRect(wx - 10, wy - 9.5, 20, 0.75); ctx.fillStyle = '#FACC15'; ctx.fillRect(wx - 10, wy - 9.5, 20, 0.3);
  // (neon round the window, in pink)
  ctx.beginPath(); ctx.rect(wx - 7.6, wy - 6.6, 15.2, 13.2); neonPath(ctx, '#EC4899', 0.45);
  // Its sign over it
  neonLabel(ctx, 'VIP', wx, wy - 11, 4, '#FACC15', '#FEF9C3', hash(Math.floor(f / 5)) > 0.06);
  // The balcony under it: a gold rail on posts, the slab inked
  ctx.fillStyle = INK; ctx.fillRect(wx - 11, wy + 6.5, 22, 2.2);
  ctx.fillStyle = '#3F2A30'; ctx.fillRect(wx - 10.6, wy + 6.8, 21.2, 1.4); ctx.fillStyle = '#5A4048'; ctx.fillRect(wx - 10.6, wy + 6.8, 21.2, 0.4);
  ctx.fillStyle = '#CA8A04';
  for (let x = wx - 10; x <= wx + 10; x += 2.5) ctx.fillRect(x, wy + 4.2, 0.35, 2.6);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(wx - 10.2, wy + 4, 20.4, 0.45);
  // Portholes either side: round, brass, a guest's head in each
  for (const ox of [-17, 17]) {
    const px0 = wx + ox, py0 = wy - 1;
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(px0, py0, 3.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#B45309'; ctx.beginPath(); ctx.arc(px0, py0, 2.9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F59E0B'; ctx.beginPath(); ctx.arc(px0, py0, 2.9, Math.PI * 1.05, Math.PI * 1.6); ctx.lineTo(px0, py0); ctx.fill();
    ctx.fillStyle = (Math.floor(f / 20) + ox) % 2 ? '#C026D3' : '#A855F7'; ctx.beginPath(); ctx.arc(px0, py0, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(15, 5, 20, 0.75)'; const hx = px0 - 1 + Math.sin(f * 0.05 + ox) * 0.8; ctx.beginPath(); ctx.arc(hx, py0 + 0.2, 0.7, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(hx - 0.8, py0 + 0.9, 1.6, 1.5);
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(px0 - 1.4, py0 - 1.6, 0.6, 0.6);
  }
};

/** Along the shore at the foot of it: the coast, the town's lights (Hilo), a pier, the lava going into the sea in steam. */
const drawShore = (ctx: Ctx, v: WideView, f: number) => {
  const px = Math.max(0.5, v.px), x0 = Math.max(-40, v.x0 - 4), x1 = Math.min(840, v.x1 + 4);
  if (v.y1 < BASE - 10) return;
  const coast = (x: number) => SHORE - 4 + (noise(x * 0.05, 41) - 0.5) * 6 + Math.max(0, (x - 600) * 0.02);
  // (the coastal plain: dark, a dim rim where the town's glow catches it)
  for (let x = snapTo(x0, px); x < x1; x += px) {
    const c = coast(x), y = snapTo(c - 7 - noise(x * 0.2, 43) * 3, px);
    ctx.fillStyle = '#0A0912'; ctx.fillRect(x, y, px, c - y + 1);
    ctx.fillStyle = '#1C1528'; ctx.fillRect(x, y, px, px);
  }
  // The town: lights in clusters along the shore, warm, some flickering; a few in lines (the streets) up from it
  for (let i = 0; i < 120; i++) {
    const cluster = Math.floor(hash(i * 1.3) * 6), cxl = 90 + cluster * 120 + hash(cluster + 50) * 40;
    const x = cxl + (hash(i * 4.7) - 0.5) * 90, y = coast(x) - 2 - hash(i * 2.3) * 9;
    if (x < x0 || x > x1 || Math.abs(x - 586) < 12) continue;
    const c = i % 9 === 0 ? '#FFFFFF' : i % 4 === 0 ? '#FDBA74' : i % 7 === 0 ? '#93C5FD' : '#FDE68A';
    if (i % 13 === 0 && Math.floor(f / 25 + i) % 3 === 0) continue;
    ctx.fillStyle = c; ctx.fillRect(x, y, 1, 0.9);
    if (i % 6 === 0) { ctx.fillStyle = 'rgba(253, 230, 138, 0.25)'; ctx.fillRect(x - 1, y - 0.5, 3, 2); }
  }
  // (a radio mast, its light blinking red)
  ctx.fillStyle = '#1A1426'; ctx.fillRect(676, coast(676) - 22, 0.8, 22);
  if (Math.floor(f / 40) % 2 === 0) { ctx.fillStyle = '#EF4444'; ctx.fillRect(675.6, coast(676) - 23, 1.6, 1.6); }
  // The pier: out over the water on posts, its lamps
  const py = coast(170) + 2;
  ctx.fillStyle = INK; ctx.fillRect(150, py, 60, 1.6);
  for (let x = 152; x < 210; x += 6) ctx.fillRect(x, py, 0.8, 5);
  for (let x = 160; x < 210; x += 16) { ctx.fillStyle = '#FDE68A'; ctx.fillRect(x, py - 2, 1, 1); }
  // The lava into the sea: a glowing fan where it meets the water, and steam going up off it, lit from under
  const ex = 586, ey = SHORE + 6;
  rings(ctx, ex, ey, 18, '249, 115, 22', 0.35, 0.04, 4, 0.4);
  for (let i = 0; i < 9; i++) {
    const t = ((f * 0.35 + i * 17) % 150) / 150, r = 4 + t * 16;
    const x = ex + Math.sin(i + t * 3) * 4 + t * 26, y = ey - 2 - t * 70;
    if (x + r < v.x0 || x - r > v.x1 || y + r < v.y0 || y - r > v.y1) continue;
    const warm = Math.max(0, 1 - t * 2.5);
    pixelBlob(ctx, x, y + r * 0.2, r, r * 0.75, `rgba(${Math.round(150 + warm * 100)}, ${Math.round(110 + warm * 20)}, ${Math.round(130 - warm * 60)}, ${(0.4 * (1 - t)).toFixed(2)})`, px);
    pixelBlob(ctx, x - r * 0.2, y - r * 0.2, r * 0.7, r * 0.5, `rgba(200, 200, 225, ${(0.35 * (1 - t)).toFixed(2)})`, px);
  }
};

/** Hilo Bay: dark water in bands, ripples, the moon's path in it in broken silver, the lava's and the town's in orange. */
const drawBay = (ctx: Ctx, v: WideView, f: number, wx: number, flash: number) => {
  const px = Math.max(0.5, v.px), x0 = Math.max(-40, v.x0 - 4), x1 = Math.min(840, v.x1 + 4);
  if (v.y1 < SHORE - 4) return;
  const coast = (x: number) => SHORE - 4 + (noise(x * 0.05, 41) - 0.5) * 6 + Math.max(0, (x - 600) * 0.02);
  // (under the coast line: the water)
  ctx.save();
  ctx.beginPath(); ctx.moveTo(x0, 620);
  for (let x = snapTo(x0, 2); x <= x1 + 2; x += 2) ctx.lineTo(x, coast(x) + 1);
  ctx.lineTo(x1 + 2, 620); ctx.closePath(); ctx.clip();
  bands(ctx, x0, SHORE - 14, x1 - x0, 90, ['#1C1430', '#141236', '#0E0F30', '#0A0C26', '#070820'], 6, px);
  // (a band of the glow off the volcano and the town along the near edge of the water)
  ctx.fillStyle = 'rgba(234, 88, 12, 0.12)'; ctx.fillRect(x0, SHORE - 10, x1 - x0, 8);
  dither(ctx, x0, SHORE - 2, x1 - x0, px * 2, 'rgba(234, 88, 12, 0.12)', px);
  // Ripples: short lit dashes, longer the nearer, drifting
  for (let i = 0; i < 110; i++) {
    const row = hash(i * 2.1), y = SHORE + 2 + row * row * 70, len = 2 + row * 10;
    const x = ((hash(i * 5.3) * 860 + f * (0.1 + row * 0.2)) % 880) - 40;
    if (x + len < x0 || x > x1) continue;
    ctx.fillStyle = row > 0.5 ? 'rgba(80, 88, 150, 0.45)' : 'rgba(60, 60, 120, 0.4)'; ctx.fillRect(x, y, len, Math.max(px * 0.5, 0.6));
  }
  // The moon's path: broken bars of silver, wider and further apart the nearer, wobbling
  const reflect = (cxr: number, c0: string, c1: string, w0: number, w1: number, n: number, seed: number) => {
    for (let k = 0; k < n; k++) {
      const t = k / n, y = SHORE + 1 + t * t * 72;
      const w = w0 + (w1 - w0) * t, wob = Math.sin(f * 0.07 + k * 1.9 + seed) * (1 + t * 4);
      for (let j = 0; j < 3; j++) {
        if (hash(k * 7 + j + seed) < 0.3) continue;
        const bx = cxr + wob + (j - 1) * w * 0.55 + (hash(k * 3 + j + seed) - 0.5) * w * 0.4, bw = w * (0.2 + hash(k + j * 11 + seed) * 0.35);
        ctx.fillStyle = j === 1 ? c0 : c1; ctx.fillRect(bx - bw / 2, y, bw, Math.max(0.8, 0.8 + t * 1.6));
      }
    }
  };
  reflect(MOON.x + 10, 'rgba(226, 232, 255, 0.7)', 'rgba(160, 170, 220, 0.45)', 6, 40, 22, 0);
  // (the lava, where it meets the sea and off the crater's glow)
  reflect(586, 'rgba(253, 186, 116, 0.75)', 'rgba(234, 88, 12, 0.5)', 4, 26, 16, 5);
  reflect(262, 'rgba(251, 146, 60, 0.45)', 'rgba(194, 65, 12, 0.35)', 3, 16, 12, 9);
  reflect(CX, 'rgba(251, 146, 60, 0.3)', 'rgba(194, 65, 12, 0.2)', 6, 30, 14, 13);
  // (the town's lights, in short streaks under them)
  for (let i = 0; i < 26; i++) {
    const x = 90 + hash(i * 8.1) * 620; if (x < x0 || x > x1 || Math.abs(x - 586) < 20) continue;
    ctx.fillStyle = 'rgba(253, 230, 138, 0.35)'; ctx.fillRect(x, SHORE + 2 + hash(i) * 4, 0.8, 3 + hash(i + 2) * 5);
  }
  // The blast's light across the water
  if (flash > 0) reflect(wx, `rgba(254, 215, 170, ${(0.9 * flash).toFixed(2)})`, `rgba(251, 146, 60, ${(0.7 * flash).toFixed(2)})`, 10, 70, 20, 17);
  ctx.restore();
};

/** In front: a palm either side (leaning in, its fronds catching the volcano's light along their tops) and the brush
 * and rocks of the near shore along the bottom, black against it all. */
const drawForeground = (ctx: Ctx, v: WideView, f: number) => {
  if (v.x0 > 120 && v.x1 < 680 && v.y1 < 520) return;
  const px = Math.max(0.5, v.px);
  // Near shore: rocks and brush, a rim of warm light along their tops
  const near = (x: number) => 548 - 10 * noise(x * 0.04, 51) - 14 * Math.exp(-Math.pow((x - 60) / 90, 2)) - 18 * Math.exp(-Math.pow((x - 760) / 80, 2)) - 4 * noise(x * 0.3, 53);
  pixelRidge(ctx, Math.max(-40, v.x0 - 4), Math.min(840, v.x1 + 4), 620, near, 0, { fill: '#05030A', rim: '#3A1A1E', lit: '#160C14', shade: '#020105' }, 1, px);
  for (let i = 0; i < 16; i++) {
    const x = hash(i * 3.7) * 820 - 10, y = near(x), r = 6 + hash(i) * 10;
    if (x + r < v.x0 || x - r > v.x1) continue;
    pixelBlob(ctx, x, y, r, r * 0.7, '#05030A', px);
    pixelBlob(ctx, x - r * 0.2, y - r * 0.55, r * 0.5, 1.2, '#2E1418', px);
  }
  palm(ctx, -18, 600, 52, 196, 1, f);
  palm(ctx, 836, 600, 742, 236, -1, f);
  palm(ctx, 800, 600, 786, 346, -0.6, f);
};

/** A palm: a ringed trunk curving up to its crown, fronds hanging off it in serrated leaves; black, lit along the top
 * edges warm (the volcano's light) and cool on the moon's side. `s` its size and which way it leans (negative: left). */
const palm = (ctx: Ctx, bx: number, by: number, tx: number, ty: number, s: number, f: number) => {
  const sz = Math.abs(s), dir = Math.sign(s);
  const sway = Math.sin(f * 0.02 + bx) * 2 * sz;
  const mx = bx + (tx - bx) * 0.2 + dir * 20 * sz, my = by + (ty - by) * 0.55;
  const at = (t: number): [number, number] => {
    const a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t;
    return [a * bx + b * mx + c * (tx + sway), a * by + b * my + c * ty];
  };
  // Trunk: segments tapering up, each ring a step lighter at its top edge
  const segs = 18;
  for (let i = 0; i < segs; i++) {
    const [x0, y0] = at(i / segs), [x1, y1] = at((i + 1) / segs);
    const w0 = (11 - (i / segs) * 5) * sz, w1 = (11 - ((i + 1) / segs) * 5) * sz;
    ctx.fillStyle = '#06040A';
    ctx.beginPath(); ctx.moveTo(x0 - w0 / 2, y0); ctx.lineTo(x1 - w1 / 2, y1 - 0.5); ctx.lineTo(x1 + w1 / 2, y1 - 0.5); ctx.lineTo(x0 + w0 / 2, y0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1C1222'; ctx.fillRect(x1 - w1 / 2, y1, w1, 1);
    // (the side toward the volcano lit warm)
    ctx.fillStyle = 'rgba(122, 45, 28, 0.6)'; ctx.fillRect(dir > 0 ? x1 + w1 / 2 - 1.5 : x1 - w1 / 2, y1, 1.5, Math.max(1, Math.abs(y0 - y1)));
  }
  const [cx, cy] = at(1);
  // Coconuts
  for (const [ox, oy] of [[-3, 4], [2, 5], [5, 2]]) { ctx.fillStyle = '#06040A'; ctx.beginPath(); ctx.arc(cx + ox * sz, cy + oy * sz, 3 * sz, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#2A1A16'; ctx.fillRect(cx + ox * sz - sz, cy + oy * sz - 2 * sz, 1.5 * sz, 1); }
  // Fronds: out and drooping, each a spine with leaflets hanging off it
  const fronds = [-2.7, -2.2, -1.75, -1.3, -0.85, -0.4, 0.05, 0.5, 2.95];
  fronds.forEach((a0, i) => {
    const a = dir > 0 ? a0 : Math.PI - a0;
    const len = (70 + hash(i + bx) * 30) * sz, droop = (0.6 + hash(i * 3 + bx) * 0.5) * (Math.abs(Math.cos(a)) + 0.2);
    const flutter = Math.sin(f * 0.05 + i * 1.3 + bx) * 0.04;
    const pt = (t: number): [number, number] => [cx + Math.cos(a + flutter) * len * t, cy + Math.sin(a + flutter) * len * t + droop * len * t * t];
    // the leaflets: a zigzag either side of the spine, longer at the middle
    const n = 14;
    const up: [number, number][] = [], dn: [number, number][] = [];
    for (let k = 0; k <= n; k++) {
      const t = k / n, [x, y] = pt(t), [x2, y2] = pt(Math.min(1, t + 0.02));
      const ang = Math.atan2(y2 - y, x2 - x), w = (k % 2 ? 1 : 0.35) * Math.sin(t * Math.PI) * 12 * sz;
      up.push([x + Math.cos(ang - 1.2) * w, y + Math.sin(ang - 1.2) * w + w * 0.5]);
      dn.push([x + Math.cos(ang + 1.9) * w, y + Math.sin(ang + 1.9) * w + w * 0.4]);
    }
    ctx.beginPath(); ctx.moveTo(cx, cy);
    for (const p of up) ctx.lineTo(p[0], p[1]);
    for (let k = dn.length - 1; k >= 0; k--) ctx.lineTo(dn[k][0], dn[k][1]);
    ctx.closePath(); ctx.fillStyle = '#05040A'; ctx.fill();
    // (the spine, lit along its top: warm toward the volcano, cool toward the moon)
    ctx.beginPath(); ctx.moveTo(cx, cy - 0.8); for (let k = 1; k <= n; k++) { const [x, y] = pt(k / n); ctx.lineTo(x, y - 0.8); }
    ctx.strokeStyle = (Math.cos(a) > 0) === (dir > 0) ? 'rgba(150, 60, 34, 0.75)' : 'rgba(70, 76, 120, 0.7)'; ctx.lineWidth = 1 * sz; ctx.stroke();
  });
  void dark;
};
