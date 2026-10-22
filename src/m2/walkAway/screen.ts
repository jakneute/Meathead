// The walk screens' shared machinery (the walk-away after a boss, walkAway.ts; the walk into a land through its portal,
// portalWalk.ts): the low-res picture and its blit up to the screen, the Mode-7 ground, the banded sky, the scaled
// sprites (fogged in steps), the stepped vignette, the heat wobble, the stamped title, the letterbox bars, the stink.
// Everything painted once is kept (keyed by the hour: timeOfDay.ts); nothing's made per frame.

import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../../m1/constants';
import { type Ctx, type Prop, LW, LH, TOP, BOT, HOR, F, CAM_H, INK, stipple } from './kit';
import { timeOfDay, multiply } from '../timeOfDay';
import { takeSun, drawSunGhosts } from '../sunFlare';
import { mix } from '../../m1/game/render/backdrops/core';

/** What the shared painting needs of a scene: its far haze, and its ground's tile (16 m square, 16 px a meter). */
export interface Look {
  haze: string;
  ground: (g: Ctx, w: number, h: number) => void;
}

export const canvas = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

let lo: HTMLCanvasElement | null = null, loC: Ctx | null = null;
/** The picture (LW x LH): one, shared (only one walk screen's ever up at once). */
export const lowRes = () => {
  if (!lo) { lo = canvas(LW, LH); loC = lo.getContext('2d', { willReadFrequently: true })!; }
  return { cv: lo, c: loC! };
};

let tmp: HTMLCanvasElement | null = null;
let groundImg: ImageData | null = null;
// (each keyed by the scene and the hour: timeOfDay.ts)
const tiles = new Map<Look['ground'], Map<string, Uint32Array>>();
const skies = new Map<string, HTMLCanvasElement>();
const sprites = new Map<string, HTMLCanvasElement[]>();
let vignette: HTMLCanvasElement | null = null;
const TILE = 256, TPM = 16;
export const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export const hexRgb = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));

/** The hour's light over the picture (timeOfDay.ts): its multiply, eased (the scene's own art carries some of it). */
export const gradeOf = () => mix('#FFFFFF', timeOfDay().mul, 0.8);
/** The far haze: the hour's (the scene's own at sundown, where it was painted). */
export const hazeOf = (look: Look) => mix(timeOfDay().haze, look.haze, 0.35);

const tileOf = (look: Look) => {
  const key = timeOfDay().key;
  let m = tiles.get(look.ground);
  if (!m) { m = new Map(); tiles.set(look.ground, m); }
  let t = m.get(key);
  if (!t) {
    // (read back once, right after: a canvas kept in memory, not on the GPU (the read back off the GPU stalled the frame))
    const c = canvas(TILE, TILE), g = c.getContext('2d', { willReadFrequently: true })!;
    look.ground(g, TILE, TILE);
    // (lit by the hour)
    g.globalCompositeOperation = 'multiply'; g.fillStyle = gradeOf(); g.fillRect(0, 0, TILE, TILE); g.globalCompositeOperation = 'source-over';
    t = new Uint32Array(g.getImageData(0, 0, TILE, TILE).data.buffer.slice(0));
    m.set(key, t);
  }
  return t;
};

/** The ground's tile painted ahead of time (walkAway.ts prewarmWalkAway). */
export const warmGround = (look: Look) => { tileOf(look); };

/** The hour's sky, top to the horizon, banded (flat steps, a dithered row where each meets the next). */
export const skyOf = () => {
  const tod = timeOfDay(), key = tod.key;
  let s = skies.get(key);
  if (!s) {
    const sky = tod.sky.map(c => multiply(c, gradeOf()));
    s = canvas(LW, HOR + 2);
    const g = s.getContext('2d')!;
    const n = 22, bh = (HOR + 2) / n;
    const at = (k: number) => {
      const f = Math.min(0.9999, k) * (sky.length - 1), i = Math.floor(f), m = f - i;
      const a = hexRgb(sky[i]), b = hexRgb(sky[i + 1]);
      return `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * m)).join(',')})`;
    };
    for (let i = 0; i < n; i++) {
      const y0 = Math.floor(i * bh), y1 = Math.floor((i + 1) * bh);
      g.fillStyle = at(i / (n - 1)); g.fillRect(0, y0, LW, y1 - y0);
      if (i < n - 1) { g.fillStyle = stipple(g, at((i + 1) / (n - 1))); g.fillRect(0, y1 - 1, LW, 1); }
    }
    skies.set(key, s);
  }
  return s;
};

/** A prop's picture at a fog level (0..3: the haze laid over it in steps, a palette swap's worth). */
export const spriteOf = (look: Look, p: Prop, fog: number) => {
  const key = `${p.id}|${p.w}|${p.h}|${timeOfDay().key}`;
  let arr = sprites.get(key);
  if (!arr) {
    const ppm = p.ppm ?? 20, w = Math.max(2, Math.round(p.w * ppm)), h = Math.max(2, Math.round(p.h * ppm));
    const base = canvas(w, h);
    const g = base.getContext('2d')!;
    p.paint!(g, w, h);
    // (lit by the hour: multiplied, then cut back to its own shape)
    const lit = canvas(w, h), lg = lit.getContext('2d')!;
    lg.drawImage(base, 0, 0);
    lg.globalCompositeOperation = 'multiply'; lg.fillStyle = gradeOf(); lg.fillRect(0, 0, w, h);
    lg.globalCompositeOperation = 'destination-in'; lg.drawImage(base, 0, 0);
    arr = [lit];
    for (let f = 1; f <= 3; f++) {
      const c = canvas(w, h), cg = c.getContext('2d')!;
      cg.drawImage(lit, 0, 0);
      cg.globalCompositeOperation = 'source-atop'; cg.globalAlpha = 0.16 * f; cg.fillStyle = hazeOf(look); cg.fillRect(0, 0, w, h);
      arr.push(c);
    }
    sprites.set(key, arr);
  }
  return arr[fog];
};

/** The fog step for something at d meters off. */
export const fogAt = (d: number) => (d < 8 ? 0 : d < 16 ? 1 : d < 30 ? 2 : 3);

export const vignetteOf = () => {
  if (!vignette) {
    vignette = canvas(LW, LH);
    const g = vignette.getContext('2d')!, img = g.createImageData(LW, LH), d = img.data;
    for (let y = 0; y < LH; y++) for (let x = 0; x < LW; x++) {
      const dx = (x - LW / 2) / (LW / 2), dy = (y - LH * 0.48) / (LH * 0.62);
      const r = Math.sqrt(dx * dx * 0.8 + dy * dy);
      const f = Math.max(0, (r - 0.72) / 0.5) * 4 + BAYER[(y & 3) * 4 + (x & 3)] / 16;
      const lvl = Math.min(4, Math.floor(f));
      const i = (y * LW + x) * 4;
      d[i + 3] = [0, 46, 84, 120, 160][lvl];
    }
    g.putImageData(img, 0, 0);
  }
  return vignette;
};

/**
 * The ground, the SNES's Mode 7 way: a row at a time, each row the tile at its distance, fogged in dithered steps.
 * `travel`: how far the ground's gone by (meters; + it goes off away, - it comes on at the eye); `vpX`: where it runs
 * off to (picture x); `meX`: where the path's middle is (meters across).
 */
export const drawGround = (c: Ctx, look: Look, travel: number, sway: number, vpX: number, meX: number) => {
  const rows = LH - HOR;
  if (!groundImg || groundImg.height !== rows) groundImg = c.createImageData(LW, rows);
  const out = new Uint32Array(groundImg.data.buffer);
  const tile = tileOf(look), mask = TILE - 1;
  const [hr, hg, hb] = hexRgb(hazeOf(look));
  for (let r = 0; r < rows; r++) {
    const dy = r + 0.5, d = (F * CAM_H) / dy;
    const z = d - travel;
    const v = (Math.floor(z * TPM) & mask) * TILE;
    const fogF = Math.min(1, Math.max(0, (d - 5) / 45)) ** 0.75 * 4;
    const k = d / F;
    for (let x = 0; x < LW; x++) {
      const wx = (x + 0.5 - vpX - sway) * k;
      const u = Math.floor((wx - meX) * TPM + TILE / 2) & mask;
      let px = tile[v + u];
      const lvl = Math.min(4, Math.floor(fogF + BAYER[(r & 3) * 4 + (x & 3)] / 16));
      if (lvl > 0) {
        const pr = px & 255, pg = (px >> 8) & 255, pb = (px >> 16) & 255;
        const a = 4 - lvl;
        px = (255 << 24) | (((pb * a + hb * lvl) >> 2) << 16) | (((pg * a + hg * lvl) >> 2) << 8) | ((pr * a + hr * lvl) >> 2);
      }
      out[r * LW + x] = px;
    }
  }
  c.putImageData(groundImg, 0, HOR);
};

/** The heat over the fires: rows shifted a pixel this way and that, rippling up (the SNES's raster trick). */
export const wobble = (c: Ctx, x0: number, y0: number, w: number, h: number, t: number, amp: number) => {
  x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0));
  w = Math.min(LW - x0, Math.ceil(w)); h = Math.min(LH - y0, Math.ceil(h));
  if (w < 2 || h < 2) return;
  if (!tmp) tmp = canvas(LW, LH);
  const g = tmp.getContext('2d')!;
  g.clearRect(0, 0, w, h); g.drawImage(c.canvas, x0, y0, w, h, 0, 0, w, h);
  for (let y = 0; y < h; y++) {
    const off = Math.round(Math.sin((y0 + y) * 0.45 + t * 0.16) * amp * (0.4 + 0.6 * Math.sin((y0 + y) * 0.11 - t * 0.05) ** 2));
    if (off) c.drawImage(tmp, 0, y, w, 1, x0 + off, y0 + y, w, 1);
  }
};

/** Shitty pants: the flies round him, the wavy green lines up off him (`x`, `feet`: him in the picture; `s`: his size). */
export const drawStink = (c: Ctx, x: number, feet: number, t: number, s = 1) => {
  for (let i = 0; i < 7; i++) { const a = t * (0.1 + i * 0.013) + i * 1.9; c.fillStyle = INK; c.fillRect(Math.round(x + Math.cos(a) * (24 + i * 3) * s), Math.round(feet - 70 * s + Math.sin(a * 1.6) * 14 * s), 1, 1); }
  for (let i = 0; i < 3; i++) for (let y = 0; y < 18; y += 2) { const yy = feet - 82 * s - y - ((t * 0.4 + i * 9) % 12); c.fillStyle = '#7E9434'; c.fillRect(Math.round(x + (-30 + i * 30) * s + Math.sin(yy * 0.5 + t * 0.1) * 2), Math.round(yy), 1, 2); }
};

// ---------------------------------------------------------------------------------------------------------------
// The words, the bars

const TS = 20;
let titleFill: HTMLCanvasElement | null = null;
export const font = (px: number) => `${px}px "Press Start 2P"`;
const TITLE_BANDS = ['#FEF9C3', '#FDE047', '#FACC15', '#EAB308', '#CA8A04'];

/** The title across the top bar: each letter dropping in, one after another, bouncing and settling; banded gold, a shine
 * sweeping over it every few seconds, inked and shadowed. */
export const drawTitle = (c: Ctx, t: number, title: string) => {
  const cy = 36;
  c.save();
  c.font = font(TS); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  const total = c.measureText(title).width, x0 = Math.round(W / 2 - total / 2);
  let x = x0;
  const at = (i: number) => {
    const u = t - 14 - i * 2;
    if (u < 0) return null;
    const k = Math.min(1, u / 10);
    const dy = u < 10 ? -40 * (1 - k) * (1 - k) : u < 16 ? -Math.sin(((u - 10) / 6) * Math.PI) * 4 : 0;
    return Math.round(dy);
  };
  // The fill (in its own canvas: banded gold, the shine swept over it)
  if (!titleFill) titleFill = canvas(W, TOP);
  const g = titleFill.getContext('2d')!;
  g.clearRect(0, 0, W, TOP);
  g.font = font(TS); g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  for (let i = 0; i < title.length; i++) {
    const ch = title[i], cw = c.measureText(ch).width;
    const dy = at(i);
    if (dy !== null && ch !== ' ') {
      for (let b = 0; b < TITLE_BANDS.length; b++) {
        g.save(); g.beginPath(); g.rect(x - 2, cy - TS + dy + (b * TS) / TITLE_BANDS.length, TS + 4, TS / TITLE_BANDS.length + 0.5); g.clip();
        g.fillStyle = TITLE_BANDS[b]; g.fillText(ch, x, cy + dy); g.restore();
      }
      // (the shadow and the ink outline, under the fill)
      c.fillStyle = '#000000'; c.fillText(ch, x + 3, cy + dy + 3);
      c.lineJoin = 'round'; c.strokeStyle = INK; c.lineWidth = 5; c.strokeText(ch, x, cy + dy);
      c.strokeStyle = '#7C2D12'; c.lineWidth = 2; c.strokeText(ch, x, cy + dy);
    }
    x += cw;
  }
  // (the shine: a bright bar sweeping across, every few seconds)
  const sweep = (t - 70) % 200;
  if (t > 70 && sweep < 50) {
    const sx = x0 - 60 + (sweep / 50) * (total + 120);
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(sx, cy - TS - 4); g.lineTo(sx + 14, cy - TS - 4); g.lineTo(sx + 2, cy + 4); g.lineTo(sx - 12, cy + 4); g.fill();
    g.fillStyle = '#FFFBEB'; g.beginPath(); g.moveTo(sx + 20, cy - TS - 4); g.lineTo(sx + 24, cy - TS - 4); g.lineTo(sx + 12, cy + 4); g.lineTo(sx + 8, cy + 4); g.fill();
    g.globalCompositeOperation = 'source-over';
  }
  c.drawImage(titleFill, 0, 0);
  c.restore();
};

/** A letterbox bar: banded dark to darker, a gold rule along the picture's edge, a dithered row off it. */
export const bar = (c: Ctx, y: number, h: number, ruleAt: number) => {
  c.fillStyle = '#05030A'; c.fillRect(0, y, W, h);
  const bands = ['#0C0816', '#0A0612', '#08050E'];
  for (let i = 0; i < bands.length; i++) { c.fillStyle = bands[i]; c.fillRect(0, ruleAt < y + h / 2 ? y + 3 + i * 6 : y + h - 9 - i * 6, W, 6); }
  c.fillStyle = '#CA8A04'; c.fillRect(0, ruleAt, W, 2);
  c.fillStyle = '#FDE047'; c.fillRect(0, ruleAt + (ruleAt < y + h / 2 ? 0 : 1), W, 1);
  c.fillStyle = stipple(c, '#7C5A05'); c.fillRect(0, ruleAt < y + h / 2 ? ruleAt + 2 : ruleAt - 2, W, 2);
};

/**
 * Puts the picture up: the canvas set to the 800 x 600 screen (scaled to whatever size the game canvas is), the
 * picture 2x between the bars, the lens's ghosts if the scene noted its sun (sunFlare.ts), the bars. Leaves `c` in
 * screen units (saved: restore it after the words).
 */
export const blitPicture = (c: Ctx, pic: HTMLCanvasElement) => {
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.scale(c.canvas.width / W, c.canvas.height / H);
  c.imageSmoothingEnabled = false;
  c.drawImage(pic, 0, TOP, LW * 2, LH * 2);
  const sun = takeSun();
  if (sun) drawSunGhosts(c, sun.x, TOP + sun.y, sun.k * sun.ghosts, { x: 0, y: TOP, w: W, h: BOT - TOP });
  bar(c, 0, TOP, TOP - 2);
  bar(c, BOT, H - BOT, BOT);
};

/**
 * An iris (the SNES's HDMA window: a circle cut row by row, every row a black span either side, so its edge is
 * stepped): black outside a circle of radius `r` about (cx, cy), in whatever units `c` is in, `row` px a row.
 */
export const iris = (c: Ctx, cx: number, cy: number, r: number, x0: number, y0: number, w: number, h: number, row = 2) => {
  c.fillStyle = '#000';
  if (r <= 0) { c.fillRect(x0, y0, w, h); return; }
  for (let y = y0; y < y0 + h; y += row) {
    const dy = y + row / 2 - cy;
    const half = Math.abs(dy) < r ? Math.round(Math.sqrt(r * r - dy * dy) / row) * row : -1;
    if (half < 0) { c.fillRect(x0, y, w, row); continue; }
    const l = Math.round(cx - half), rr = Math.round(cx + half);
    if (l > x0) c.fillRect(x0, y, l - x0, row);
    if (rr < x0 + w) c.fillRect(rr, y, x0 + w - rr, row);
  }
};

let mosaicCv: HTMLCanvasElement | null = null;
/**
 * The SNES's mosaic: the picture in `c` (its whole canvas) gone to blocks `n` device px across. One scratch canvas,
 * kept; two blits.
 */
export const mosaic = (c: Ctx, n: number) => {
  if (n <= 1 || typeof document === 'undefined') return;
  const cw = c.canvas.width, ch = c.canvas.height, sw = Math.max(1, Math.ceil(cw / n)), sh = Math.max(1, Math.ceil(ch / n));
  if (!mosaicCv) mosaicCv = canvas(cw, ch);
  if (mosaicCv.width < cw || mosaicCv.height < ch) { mosaicCv.width = cw; mosaicCv.height = ch; }
  const g = mosaicCv.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, sw, sh);
  g.drawImage(c.canvas, 0, 0, cw, ch, 0, 0, sw, sh);
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0); c.imageSmoothingEnabled = false;
  c.drawImage(mosaicCv, 0, 0, sw, sh, 0, 0, sw * n, sh * n);
  c.restore();
};
