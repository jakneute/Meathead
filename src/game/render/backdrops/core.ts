// The backdrop engine: parallax layers painted once into seamless, tiling
// half-resolution canvases and blitted up at 2x with no smoothing (chunky
// 16-bit pixels), banded + dithered sky gradients, per-scanline "raster"
// wobble (heat haze, water), and helpers for drawing scenery.

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';

/** Backdrop art is drawn at half resolution and scaled up 2x. */
export const PX = 2;
/** Half-res size of the screen. */
export const LW = CANVAS_WIDTH / PX;   // 400
export const LH = CANVAS_HEIGHT / PX;  // 300
/** Layer tiles repeat every this many half-res pixels (3 screens' worth of world at 1x). */
export const TILE_W = 640;

export type G = CanvasRenderingContext2D;

// ---------------------------------------------------------------------------
// Randomness and colour
// ---------------------------------------------------------------------------

/** A small seeded RNG (mulberry32), so every layer paints the same every time. */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Deterministic 0..1 noise from a number. */
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const toRgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
export const mix = (a: string, b: string, t: number) => {
  const pa = toRgb(a), pb = toRgb(b);
  const k = Math.max(0, Math.min(1, t));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * k).toString(16).padStart(2, '0')).join('');
};

/** A colour picked along a list of stops (0..1). */
export const ramp = (stops: string[], t: number) => {
  const k = Math.max(0, Math.min(0.9999, t)) * (stops.length - 1);
  const i = Math.floor(k);
  return mix(stops[i], stops[i + 1], k - i);
};

// ---------------------------------------------------------------------------
// Skies: posterized bands with a checkerboard dither between them
// ---------------------------------------------------------------------------

/**
 * Paints a 16-bit style sky onto a half-res canvas: `bands` flat stripes of
 * colour stepping down the ramp, each boundary softened by a 2-row dither.
 */
export const paintBandedSky = (g: G, w: number, h: number, stops: string[], bands = 14) => {
  const bandH = h / bands;
  for (let b = 0; b < bands; b++) {
    g.fillStyle = ramp(stops, b / (bands - 1));
    g.fillRect(0, Math.floor(b * bandH), w, Math.ceil(bandH) + 1);
  }
  // Dither the seams
  for (let b = 1; b < bands; b++) {
    const y = Math.floor(b * bandH);
    g.fillStyle = ramp(stops, b / (bands - 1));
    for (let x = 0; x < w; x += 2) g.fillRect(x + ((y / 1) % 2), y - 1, 1, 1);
    g.fillStyle = ramp(stops, (b - 1) / (bands - 1));
    for (let x = 1; x < w; x += 2) g.fillRect(x - ((y / 1) % 2), y, 1, 1);
  }
};

// ---------------------------------------------------------------------------
// Seamless ridgelines, skylines and silhouettes (all wrap at TILE_W)
// ---------------------------------------------------------------------------

/**
 * A ridge height at x that wraps seamlessly every `w` pixels: a sum of sine
 * waves with whole-number frequencies over the tile, plus a jagged edge.
 */
export const makeRidge = (seed: number, w: number, base: number, amp: number, jag = 0.15) => {
  const r = rng(seed);
  const waves = [1, 2, 3, 5, 8, 13].map((k, i) => ({ k, a: (1 / (i + 1.2)) * (0.6 + r() * 0.8), p: r() * Math.PI * 2 }));
  const total = waves.reduce((s, w2) => s + w2.a, 0);
  return (x: number) => {
    let y = 0;
    for (const wv of waves) y += wv.a * Math.sin((x / w) * Math.PI * 2 * wv.k + wv.p);
    const jagged = jag > 0 ? (hash(Math.floor(x) % w + seed) - 0.5) * jag : 0;
    return base - (y / total + jagged) * amp;
  };
};

/** Fill everything below a ridge (with an optional lit edge along the top). */
export const fillRidge = (g: G, w: number, h: number, ridge: (x: number) => number, color: string, edge?: string) => {
  g.fillStyle = color;
  for (let x = 0; x < w; x++) {
    const y = Math.floor(ridge(x));
    g.fillRect(x, y, 1, h - y);
  }
  if (edge) {
    g.fillStyle = edge;
    for (let x = 0; x < w; x++) g.fillRect(x, Math.floor(ridge(x)), 1, 1);
  }
};

const shadeCache = new Map<string, string>();
const shadeOf = (c: string) => { let s = shadeCache.get(c); if (!s) { s = mix(c, '#000000', 0.35); shadeCache.set(c, s); } return s; };

/** A pixel pine tree, base centred on (x, y). */
export const pine = (g: G, x: number, y: number, h: number, color: string, snow?: string) => {
  // Three or four overlapping triangular tiers, widest at the bottom, each dusted with snow
  const tiers = h > 20 ? 4 : 3;
  const tierH = (h * 0.85) / tiers * 1.35;
  for (let i = 0; i < tiers; i++) {
    const top = y - h + (i * h * 0.85) / tiers;
    const half = (h * 0.16) * (0.55 + i * 0.3);
    for (let r = 0; r < tierH; r++) {
      const w = Math.max(1, Math.round((r / tierH) * half * 2));
      g.fillStyle = color;
      g.fillRect(Math.round(x - w / 2), Math.round(top + r), w, 1);
      // (the side away from the light a step darker, the boughs' undersides darker still)
      if (w > 2) { g.fillStyle = shadeOf(color); g.fillRect(Math.round(x + w / 2 - w * 0.35), Math.round(top + r), Math.max(1, Math.round(w * 0.35)), 1); }
      if (r > tierH * 0.8 && w > 3) { g.fillStyle = shadeOf(color); g.fillRect(Math.round(x - w / 2), Math.round(top + r), w, 1); }
      if (snow && r > 1 && r < tierH * 0.35) { g.fillStyle = snow; g.fillRect(Math.round(x - w / 2), Math.round(top + r), Math.max(1, Math.round(w * 0.45)), 1); }
    }
  }
  g.fillStyle = color;
  g.fillRect(Math.round(x - 1), Math.round(y - h * 0.15), 2, Math.round(h * 0.15));
};

/** A palm's colours: the trunk (lit down one side, ringed), the fronds (lit along the top, dark leaflet tips), the nuts. */
export interface PalmTones { trunk: string; trunkLit: string; ring: string; frond: string; frondLit: string; frondDark: string; nut?: string }

/** Rects gathered by colour and filled a colour at a time (one path each), in the order the colours were first named. */
const rectBatch = (order: string[]) => {
  const m = new Map<string, number[]>(order.map(c => [c, []]));
  return {
    r: (c: string, x: number, y: number, w: number, h: number) => { m.get(c)?.push(Math.round(x), Math.round(y), w, h); },
    flush: (g: G) => { for (const [c, a] of m) { if (!a.length) continue; g.fillStyle = c; g.beginPath(); for (let i = 0; i < a.length; i += 4) g.rect(a[i], a[i + 1], a[i + 2], a[i + 3]); g.fill(); } },
  };
};

/**
 * A pixel palm tree, trunk base at (x, y), bent by `lean` (-1..1). `flutter`
 * (0..1) and `phase` ruffle each frond separately, for trees swaying in the wind.
 * Given tones (not a flat colour) it comes out 16-bit: a tapering ringed trunk lit
 * down its right side, feathery fronds with leaflets hanging off them, lit along
 * their tops, and a cluster of nuts; drawn a colour at a time, so it's cheap
 * enough to sway live.
 */
export const palm = (g: G, x: number, y: number, h: number, color: string | PalmTones, lean = 0.3, flutter = 0, phase = 0) => {
  const t: PalmTones = typeof color === 'string' ? { trunk: color, trunkLit: color, ring: color, frond: color, frondLit: color, frondDark: color } : color;
  const b = rectBatch([t.frondDark, t.trunk, t.ring, t.trunkLit, t.frond, t.frondLit, t.nut ?? t.frondDark]);
  let tx = x, ty = y;
  // (the trunk: run by run of rows that sit at the same x, wide at the foot tapering up, a ring every few rows)
  let runX = NaN, runW = 0, runY = y;
  const flushRun = (endY: number) => { if (runY > endY) { b.r(t.trunk, runX, endY + 1, runW, runY - endY); if (runW > 1) b.r(t.trunkLit, runX + runW - 1, endY + 1, 1, runY - endY); } };
  for (let i = 0; i < h; i++) {
    const k = i / h;
    tx = x + lean * k * k * h * 0.4;
    ty = y - i;
    const cx = Math.round(tx), w = h < 30 ? (k > 0.5 ? 1 : 2) : k > 0.6 ? 3 : 4;
    if (cx !== runX || w !== runW) { flushRun(ty); runX = cx; runW = w; runY = ty; }
    if (i % 3 === 2 && w > 2) b.r(t.ring, cx, ty, w - 1, 1);
  }
  flushRun(Math.round(ty) - 1);
  const n = 7;
  for (let f = 0; f < n; f++) {
    const a = -Math.PI / 2 + (f - (n - 1) / 2) * 0.5 + lean * 0.5 + flutter * Math.sin(phase * 1.7 + f * 1.3) * 0.35;
    const len = h * 0.45 * (0.82 + 0.3 * Math.abs(Math.sin(f * 2.3)));
    for (let s = 1; s < len; s++) {
      const q = s / len, droop = q * q * len * 0.55;
      const px = tx + Math.cos(a) * s, py = ty + Math.sin(a) * s + droop;
      b.r(t.frond, px, py, 2, 1);
      if (q < 0.7) b.r(t.frondLit, px, py, 1, 1);
      // (a leaflet hanging off every other step, long and short by turns, longest mid-frond, slanting off outward and
      // going into the dark tone toward its tip)
      if (s % 2 === 0 && s > 2) {
        const ll = Math.max(1, Math.round((1 + 4 * Math.sin(Math.PI * q)) * (s % 4 === 0 ? 1 : 0.6)));
        const dir = Math.cos(a) > 0 ? 1 : -1, up = Math.ceil(ll / 2);
        b.r(t.frond, px + (dir > 0 ? 1 : 0), py + 1, 1, up);
        if (ll > 1) b.r(t.frondDark, px + (dir > 0 ? 2 : -1), py + 1 + up, 1, ll - up);
      }
    }
  }
  if (t.nut) { b.r(t.nut, tx - 1, ty + 1, 2, 2); b.r(t.nut, tx + 1, ty + 2, 2, 2); b.r(t.nut, tx - 2, ty + 3, 2, 2); }
  b.flush(g);
};

/** Something tiled that wraps: call draw at x, and again one tile over when it pokes past the edge. */
export const wrapDraw = (w: number, x: number, width: number, draw: (x: number) => void) => {
  draw(x);
  if (x + width > w) draw(x - w);
  if (x < 0) draw(x + w);
};

// ---------------------------------------------------------------------------
// Layers: painted once, blitted every frame with parallax
// ---------------------------------------------------------------------------

export interface LayerSpec {
  /** Unique cache key. */
  key: string;
  /** How much it moves with the camera (0 = fixed to the screen, 1 = moves with the world). */
  parallax: number;
  /** Paints the tile: a half-res canvas TILE_W x LH, transparent where there's nothing. */
  paint: (g: G, w: number, h: number) => void;
  /** Per-row horizontal wobble (half-res px) for rows at or below `from` (heat haze, water). */
  raster?: { from: number; wobble: (row: number, frame: number) => number };
  /** Drift sideways on its own (clouds, fog), in half-res px per frame. */
  drift?: number;
  /** Also moves up and down with the camera (Tommy's open-topped arena follows jumps). */
  vertical?: number;
}

const tileCache = new Map<string, HTMLCanvasElement>();

const getTile = (spec: LayerSpec) => {
  let c = tileCache.get(spec.key);
  if (!c) {
    c = document.createElement('canvas');
    c.width = TILE_W;
    c.height = LH;
    const g = c.getContext('2d')!;
    g.imageSmoothingEnabled = false;
    spec.paint(g, TILE_W, LH);
    tileCache.set(spec.key, c);
  }
  return c;
};

/** Draws one parallax layer across the whole screen (screen space). */
export const blitLayer = (ctx: G, spec: LayerSpec, camX: number, camY: number, frame: number) => {
  const tile = getTile(spec);
  const scroll = (camX * spec.parallax) / PX + (spec.drift ? frame * spec.drift : 0);
  const off = ((scroll % TILE_W) + TILE_W) % TILE_W;
  // (clamped: high up a mountain the low layers sink out of view, rather than off into nothing)
  const dy = spec.vertical ? Math.max(-60 * PX, Math.min(LH * PX, -camY * spec.vertical)) : 0;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  const blitRows = (sy: number, rows: number, shift: number) => {
    // Up to two pieces so the tile wraps seamlessly
    let sx = ((off + shift) % TILE_W + TILE_W) % TILE_W;
    let dx = 0;
    while (dx < LW) {
      const w = Math.min(TILE_W - sx, LW - dx);
      ctx.drawImage(tile, sx, sy, w, rows, dx * PX, sy * PX + dy, w * PX, rows * PX);
      dx += w;
      sx = 0;
    }
  };
  if (spec.raster) {
    const from = spec.raster.from;
    blitRows(0, from, 0);
    for (let row = from; row < LH; row++) blitRows(row, 1, Math.round(spec.raster.wobble(row, frame)));
  } else {
    blitRows(0, LH, 0);
  }
  ctx.restore();
};

/** Where something painted at tile x ends up on screen this frame (for live effects pinned to scenery). */
export const tileToScreenX = (tileX: number, spec: LayerSpec, camX: number, frame: number) => {
  const scroll = (camX * spec.parallax) / PX + (spec.drift ? frame * spec.drift : 0);
  const off = ((scroll % TILE_W) + TILE_W) % TILE_W;
  let x = tileX - off;
  while (x < -TILE_W / 2) x += TILE_W;
  return x * PX;
};
