// The eight stage backdrops, each set in its boss's city.
// Layers paint at half resolution (LW x LH = 400 x 300 on screen, tiles
// TILE_W wide); live effects draw at full resolution in screen space.

import type { Backdrop, View } from './index';
import {
  G, LayerSpec, LH, LW, PX, TILE_W, rng, hash, mix, paintBandedSky, makeRidge, fillRidge, pine, palm, PalmTones, wrapDraw, tileToScreenX,
} from './core';
import { pixelBlob, hazeBands, steppedGlow, bandedGradient, checker } from '../pixelArt';
import { drawFire } from '../fx/fire';

const W = LW * PX, H = LH * PX; // screen size

// ---------------------------------------------------------------------------
// Shared live effects
// ---------------------------------------------------------------------------

/** Chunky particles falling (or rising, with negative speed) through the screen, with their own parallax. */
const weather = (ctx: G, v: View, o: {
  count: number; seed: number; size: number; speedY: number; speedX: number; parallax: number; color: string | ((i: number) => string); wobble?: number;
}) => {
  for (let i = 0; i < o.count; i++) {
    const sx = hash(i + o.seed) * (W + 40);
    const sy = hash(i * 7.3 + o.seed) * (H + 40);
    let x = (sx + v.frame * o.speedX - v.camX * o.parallax + (o.wobble ? Math.sin(v.frame * 0.03 + i) * o.wobble : 0)) % (W + 40);
    let y = (sy + v.frame * o.speedY) % (H + 40);
    if (x < 0) x += W + 40;
    if (y < 0) y += H + 40;
    ctx.fillStyle = typeof o.color === 'function' ? o.color(i) : o.color;
    ctx.fillRect(Math.round(x - 20), Math.round(y - 20), o.size, o.size);
  }
};

/** Draws something pinned to scenery in a layer at every place its tile repeats on screen. */
const pinned = (tileX: number, spec: LayerSpec, v: View, draw: (screenX: number) => void) => {
  const x = tileToScreenX(tileX, spec, v.camX, v.frame);
  for (const sx of [x, x + TILE_W * PX]) if (sx > -300 && sx < W + 300) draw(sx);
};

const sky = (key: string, stops: string[], bands = 16, extra?: (g: G, w: number, h: number) => void): LayerSpec => ({
  key, parallax: 0,
  paint: (g, w, h) => { paintBandedSky(g, w, h, stops, bands); extra?.(g, w, h); },
});

const stars = (g: G, w: number, h: number, seed: number, count: number, maxY: number) => {
  const r = rng(seed);
  for (let i = 0; i < count; i++) {
    const b = r();
    g.fillStyle = b > 0.9 ? '#FFFFFF' : b > 0.6 ? '#BFD4FF' : '#6E7FA8';
    g.fillRect(Math.floor(r() * w), Math.floor(r() * maxY), 1, 1);
  }
};

// ===========================================================================
// 1. ARTIE AVALANCHE: Anchorage, Alaska. Aurora over snowy peaks and pines.
// ===========================================================================

/**
 * Rock faces down a ridge, painted once: under the crest, each column toned by which way that bit of slope faces (lit
 * facing the light, a step darker turned away), `depth` deep and dithered off into the body below, and streaks of
 * `streak` (snow down the gullies, scree) slanting down the fall line here and there.
 */
const ridgeFaces = (g: G, w: number, ridge: (x: number) => number, depth: number, lit: string, shade: string, streak?: string, below = 0) => {
  for (let x = 0; x < w; x++) {
    const y = Math.floor(ridge(x)) + below, slope = (ridge(x + 6) - ridge(x - 6)) / 2;
    g.fillStyle = slope < -0.4 ? lit : shade;
    const d = Math.floor(depth * (0.6 + Math.min(1, Math.abs(slope) * 0.3)));
    g.fillRect(x, y, 1, d);
    if ((x + y) % 2) g.fillRect(x, y + d, 1, 2);
    if ((x + y) % 2 === 0) g.fillRect(x, y + d + 3, 1, 1);
  }
  if (!streak) return;
  for (let x = 3; x < w; x += 5) {
    if (hash(x * 0.61) < 0.6) continue;
    const y0 = ridge(x), slope = (ridge(x + 6) - ridge(x - 6)) / 2;
    if (Math.abs(slope) < 0.5) continue;
    // (a streak: wide at its head, thinning, broken off at its foot)
    const len = 4 + Math.floor(hash(x) * depth * 0.5), dir = slope < 0 ? -1 : 1;
    g.fillStyle = streak;
    for (let k = 0; k < len; k++) { if (k > len * 0.7 && k % 2) continue; g.fillRect((((x + Math.round(k * 0.4 * dir)) % w) + w) % w, Math.floor(y0 + below + 2 + k), k < len * 0.35 ? 2 : 1, 1); }
  }
};

const artieFarPeaks: LayerSpec = {
  key: 'artie-far', parallax: 0.06, vertical: 0.03,
  paint: (g, w, h) => {
    const ridge = makeRidge(11, w, 175, 95, 0);
    fillRidge(g, w, h, ridge, '#2B4166');
    // (the rock faces under the snow: lit and shaded flanks, snow down the gullies)
    ridgeFaces(g, w, ridge, 40, '#3A5680', '#24385A', '#8FA9CF', 6);
    // Snowcaps on everything high, shaded on one side
    for (let x = 0; x < w; x++) {
      const y = ridge(x);
      if (y > 150) continue;
      const depth = Math.floor((150 - y) * 0.55);
      // Lit on the slopes facing left, shadowed on the others (judged over a few pixels, not per pixel)
      const slope = ridge(x + 4) - ridge(x - 4);
      g.fillStyle = slope > 0 ? '#E8F1FF' : '#A9C0E0';
      g.fillRect(x, Math.floor(y), 1, depth);
    }
    // (the air between here and there: their feet fade into the sky)
    hazeBands(g, 0, 150, w, 70, '#1E4776', 0, 0.45, 5, 1);
  },
};
const artieMidPeaks: LayerSpec = {
  key: 'artie-mid', parallax: 0.16, vertical: 0.08,
  paint: (g, w, h) => {
    const ridge = makeRidge(23, w, 222, 55, 0.05);
    fillRidge(g, w, h, ridge, '#1B2C47', '#C8DBF5');
    ridgeFaces(g, w, ridge, 26, '#26395A', '#152238', '#6E88AE', 4);
    for (let x = 0; x < w; x++) {
      const y = ridge(x);
      if (y > 200) continue;
      g.fillStyle = ridge(x + 4) > ridge(x - 4) ? '#DCE8FA' : '#8FA9CF';
      g.fillRect(x, Math.floor(y), 1, Math.floor((200 - y) * 0.4 + 2));
    }
    // A cabin with warm windows
    // (log walls, the ends of the logs lit; a roof heavy with snow, its eave hanging over; a chimney; the windows' warm
    // light spilling out onto the snow)
    const cx = 410, cy = Math.floor(ridge(410)) + 4;
    g.fillStyle = '#1A2234'; g.fillRect(cx - 7, cy - 6, 14, 8);
    g.fillStyle = '#0E1624'; for (let ly = cy - 5; ly < cy + 2; ly += 2) g.fillRect(cx - 7, ly, 14, 1);
    g.fillStyle = '#3A4458'; for (let ly = cy - 6; ly < cy + 2; ly += 2) { g.fillRect(cx - 8, ly, 1, 1); g.fillRect(cx + 7, ly, 1, 1); }
    g.fillStyle = '#0E1624'; g.fillRect(cx + 3, cy - 13, 3, 5); g.fillStyle = '#E8F1FF'; g.fillRect(cx + 3, cy - 14, 3, 1);
    g.fillStyle = '#A9C0E0'; g.fillRect(cx - 10, cy - 8, 20, 2); g.fillStyle = '#E8F1FF'; g.fillRect(cx - 9, cy - 10, 18, 2); g.fillRect(cx - 7, cy - 11, 14, 1);
    g.fillStyle = '#C8DBF5'; g.fillRect(cx - 10, cy - 6, 1, 2); g.fillRect(cx + 9, cy - 6, 1, 1);
    g.fillStyle = '#FCD34D'; g.fillRect(cx - 4, cy - 4, 2, 3); g.fillRect(cx + 2, cy - 4, 2, 3);
    g.fillStyle = '#FFF3C4'; g.fillRect(cx - 4, cy - 4, 1, 1); g.fillRect(cx + 2, cy - 4, 1, 1);
    checker(g, cx - 6, cy + 2, 12, 2, '#FCD34D', 0, 1);
    hazeBands(g, 0, 212, w, 40, '#2C5F8F', 0, 0.3, 4, 1);
  },
};
const artieForest = (key: string, seed: number, parallax: number, base: number, size: number, color: string, snow: string, ground: string): LayerSpec => ({
  // Up the mountain, the tree line drops away below
  key, parallax, vertical: parallax * 0.6,
  paint: (g, w, h) => {
    const r = rng(seed);
    const ridge = makeRidge(seed, w, base, 6, 0);
    fillRidge(g, w, h, ridge, ground);
    for (let x = 0; x < w; x += 4 + Math.floor(r() * 7)) {
      const th = size * (0.6 + r() * 0.6);
      wrapDraw(w, x, 20, xx => pine(g, xx, ridge(x) + 2, th, color, snow));
    }
  },
});
const artieNear = artieForest('artie-near', 41, 0.34, 262, 38, '#0F1B2E', '#D6E4F7', '#E3EEFB');

/** Aurora: rippling curtains of green and violet, colours cycling. */
const aurora = (ctx: G, v: View) => {
  ctx.globalCompositeOperation = 'lighter';
  for (let band = 0; band < 3; band++) {
    const baseY = 70 + band * 34;
    for (let x = 0; x < W; x += 6) {
      const wx = x + v.camX * 0.03;
      const y = baseY + Math.sin(wx * 0.008 + v.frame * 0.012 + band) * 22 + Math.sin(wx * 0.021 - v.frame * 0.02) * 8;
      const cyc = (Math.sin(wx * 0.01 + v.frame * 0.02 + band * 2) + 1) / 2;
      const col = band === 1 ? mix('#22C55E', '#A855F7', cyc) : mix('#10B981', '#38BDF8', cyc);
      const len = 50 + Math.sin(wx * 0.013 + v.frame * 0.015) * 25;
      for (let s = 0; s < len; s += 6) {
        ctx.globalAlpha = 0.16 * (1 - s / len);
        ctx.fillStyle = col;
        ctx.fillRect(x, Math.round(y + s), 6, 6);
      }
    }
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
};

const artie: Backdrop = {
  layers: [
    sky('artie-sky', ['#040714', '#0A1530', '#122A52', '#1E4776', '#2C5F8F'], 16, (g, w) => stars(g, w, LH, 5, 220, 170)),
    aurora,
    artieFarPeaks,
    artieMidPeaks,
    artieForest('artie-forest', 31, 0.24, 250, 24, '#16263D', '#B8CDEB', '#C9DAF0'),
    artieNear,
  ],
  front: (ctx, v) => {
    weather(ctx, v, { count: 70, seed: 1, size: 2, speedY: 1.2, speedX: -0.4, parallax: 0.5, color: 'rgba(230, 240, 255, 0.7)', wobble: 12 });
    weather(ctx, v, { count: 28, seed: 2, size: 4, speedY: 2.6, speedX: -1, parallax: 1.2, color: 'rgba(255, 255, 255, 0.9)', wobble: 18 });
  },
};

// ===========================================================================
// 2. VICTOR VOLCANO: Hilo, Hawaii. A volcano erupting over lava fields and palms.
// ===========================================================================

const VOLCANO_X = 300;
const victorVolcano: LayerSpec = {
  key: 'victor-volcano', parallax: 0.05,
  paint: (g, w, h) => {
    const far = makeRidge(7, w, 215, 40, 0.1);
    fillRidge(g, w, h, far, '#3A120C');
    // The big cone
    for (let x = VOLCANO_X - 150; x <= VOLCANO_X + 150; x++) {
      const d = Math.abs(x - VOLCANO_X);
      const top = d < 18 ? 92 + (18 - d) * 0.3 : 92 + (d - 18) * 0.95 + Math.sin(d * 0.3) * 2;
      wrapDraw(w, x, 1, xx => {
        g.fillStyle = x < VOLCANO_X ? '#4A170E' : '#361008';
        g.fillRect(xx, Math.floor(top), 1, h - Math.floor(top));
      });
    }
    // Lava running down it, glowing crater
    const r = rng(9);
    for (let s = 0; s < 5; s++) {
      let x = VOLCANO_X + (r() - 0.5) * 24, y = 96;
      const drift = (r() - 0.5) * 0.9;
      for (let i = 0; i < 100; i++) {
        x += drift + (r() - 0.5) * 0.8; y += 1;
        g.fillStyle = i < 30 ? '#FDE047' : i < 65 ? '#F97316' : '#B91C1C';
        g.fillRect(Math.floor(x), Math.floor(y), 2, 1);
      }
    }
    g.fillStyle = '#FDBA74'; g.fillRect(VOLCANO_X - 16, 90, 32, 3);
    g.fillStyle = '#FEF3C7'; g.fillRect(VOLCANO_X - 9, 89, 18, 2);
  },
};
const victorLavaFields: LayerSpec = {
  key: 'victor-fields', parallax: 0.18,
  paint: (g, w, h) => {
    const ridge = makeRidge(19, w, 235, 30, 0.25);
    fillRidge(g, w, h, ridge, '#1F0906', '#5A1A0C');
    // (the crust in layers, a dithered strip under the lit edge)
    for (let x = 0; x < w; x += 2) { const y = Math.floor(ridge(x)); g.fillStyle = '#3A1210'; g.fillRect(x + (y % 2), y + 2, 1, 1); g.fillRect(x + ((y + 1) % 2), y + 4, 1, 1); }
    const r = rng(20);
    // Rivers of lava winding across
    for (let k = 0; k < 4; k++) {
      let x = r() * w, y = ridge(x) + 8 + r() * 20;
      for (let i = 0; i < 220; i++) {
        x += 1; y += Math.sin(i * 0.05 + k) * 0.6;
        const xx = ((Math.floor(x) % w) + w) % w;
        if (y < ridge(xx) + 3) continue;
        g.fillStyle = i % 9 < 2 ? '#FDE047' : '#F97316';
        g.fillRect(xx, Math.floor(y), 1, 2);
        g.fillStyle = '#7C2D12';
        g.fillRect(xx, Math.floor(y) + 2, 1, 1);
      }
    }
  },
  // Heat haze shimmering over the lava
  raster: { from: 200, wobble: (row, f) => Math.sin(row * 0.45 + f * 0.12) * 1.2 },
};
const victorPalms: LayerSpec = {
  key: 'victor-palms', parallax: 0.36,
  paint: (g, w, h) => {
    const r = rng(33);
    g.fillStyle = '#120404';
    const ridge = makeRidge(34, w, 272, 8, 0);
    fillRidge(g, w, h, ridge, '#120404');
    for (let x = 10; x < w; x += 40 + Math.floor(r() * 60)) {
      const hh = 45 + r() * 35;
      wrapDraw(w, x, 40, xx => palm(g, xx, ridge(x) + 1, hh, '#120404', (r() - 0.5) * 1.2));
    }
  },
};

/** The eruption: a smoke column and lava bombs arcing out of the crater. */
const eruption = (ctx: G, v: View) => {
  pinned(VOLCANO_X, victorVolcano, v, sx => {
    const cy = 90 * PX;
    for (let i = 0; i < 12; i++) {
      const t = ((v.frame * 0.6 + i * 23) % 200) / 200;
      ctx.fillStyle = `rgba(60, 30, 25, ${0.55 * (1 - t)})`;
      const r = 10 + t * 40;
      ctx.fillRect(Math.round(sx + Math.sin(i * 2 + t * 3) * 12 * t - r / 2 + t * 30), Math.round(cy - t * 170 - r / 2), r, r);
    }
    for (let i = 0; i < 8; i++) {
      const period = 70 + i * 9;
      const t = ((v.frame + i * 37) % period) / period;
      const vx = (hash(i) - 0.5) * 3.2, vy = -5 - hash(i + 3) * 2.5;
      const x = sx + vx * t * period, y = cy + vy * t * period + 0.09 * (t * period) ** 2;
      ctx.fillStyle = t < 0.5 ? '#FDE047' : '#F97316';
      ctx.fillRect(Math.round(x), Math.round(y), 4, 4);
    }
    steppedGlow(ctx, sx, cy, 90, '#FDBA74', 0.35 + 0.1 * Math.sin(v.frame * 0.2), 0, 5);
  });
};

const victor: Backdrop = {
  layers: [
    sky('victor-sky', ['#12030A', '#2E0710', '#5C1111', '#9A2A10', '#D9570F', '#F59E0B'], 16),
    victorVolcano,
    eruption,
    victorLavaFields,
    victorPalms,
  ],
  front: (ctx, v) => {
    weather(ctx, v, { count: 40, seed: 3, size: 2, speedY: -1.1, speedX: 0.3, parallax: 0.8, color: i => (i % 3 ? '#F97316' : '#FDE047'), wobble: 10 });
    weather(ctx, v, { count: 25, seed: 4, size: 3, speedY: 0.6, speedX: -0.3, parallax: 0.6, color: 'rgba(120, 110, 110, 0.6)', wobble: 6 });
  },
};

// ===========================================================================
// 3. ERNIE EARTHQUAKE: San Francisco. The Golden Gate in the fog, painted ladies on the hills.
// ===========================================================================

const ernieBay: LayerSpec = {
  key: 'ernie-bay', parallax: 0.05,
  paint: (g, w, h) => {
    // Headlands and the bay
    fillRidge(g, w, h, makeRidge(51, w, 200, 25, 0.1), '#4B3D5A');
    g.fillStyle = '#2E4A6B';
    g.fillRect(0, 205, w, h - 205);
    for (let y = 205; y < h; y += 3) { g.fillStyle = y % 6 ? '#3B5B80' : '#294461'; for (let x = (y * 7) % 11; x < w; x += 11) g.fillRect(x, y, 4, 1); }
    // The Golden Gate Bridge
    const deck = 188, t1 = 170, t2 = 470;
    const red = '#C0392B', dark = '#8E2A20';
    for (const tx of [t1, t2]) { g.fillStyle = red; g.fillRect(tx - 3, deck - 70, 6, 90); g.fillStyle = dark; g.fillRect(tx + 1, deck - 70, 2, 90); g.fillStyle = red; for (const cy of [deck - 60, deck - 40, deck - 18]) g.fillRect(tx - 5, cy, 10, 2); }
    g.fillStyle = red;
    g.fillRect(t1 - 140, deck, (t2 - t1) + 280, 3);
    const cable = (x0: number, x1: number, sag: number) => {
      for (let x = x0; x < x1; x++) {
        const k = (x - x0) / (x1 - x0);
        const y = deck - 70 + 4 * sag * k * (1 - k);
        g.fillRect(x, Math.floor(y), 1, 1);
        if (x % 6 === 0) { g.fillStyle = '#A93226'; g.fillRect(x, Math.floor(y), 1, deck - Math.floor(y)); g.fillStyle = red; }
      }
    };
    cable(t1, t2, 60);
    cable(t1 - 140, t1, -0.001); cable(t2, t2 + 140, -0.001);
    // (the headlands and the bridge's feet in the haze off the bay)
    hazeBands(g, 0, 186, w, 40, '#E98B55', 0, 0.35, 5, 1);
  },
  raster: { from: 206, wobble: (row, f) => Math.sin(row * 0.8 + f * 0.08) * 1.5 },
};
const ernieFog: LayerSpec = {
  key: 'ernie-fog', parallax: 0.08, drift: 0.12,
  paint: (g, w) => {
    const r = rng(60);
    // (banks of it, ragged at the edges, thicker where they overlap)
    for (let i = 0; i < 40; i++) {
      const x = r() * w, y = 160 + r() * 50, rw = 40 + r() * 70, rh = 8 + r() * 10;
      wrapDraw(w, x, rw, xx => {
        pixelBlob(g, xx + rw / 2, y, rw / 2, rh, 'rgba(235, 235, 245, 0.16)', 1);
        pixelBlob(g, xx + rw * (0.35 + hash(i) * 0.3), y - rh * 0.3, rw * 0.3, rh * 0.7, 'rgba(235, 235, 245, 0.14)', 1);
      });
    }
  },
};
const ernieHills: LayerSpec = {
  key: 'ernie-hills', parallax: 0.2,
  paint: (g, w, h) => {
    const ridge = makeRidge(71, w, 236, 34, 0);
    fillRidge(g, w, h, ridge, '#3D2E3F', '#6A4A5E');
    // (the hill's crest rounded off into it, a dither of shade under the rim)
    for (let x = 0; x < w; x += 2) { const y = Math.floor(ridge(x)); g.fillStyle = '#4A3850'; g.fillRect(x + (y % 2), y + 1, 1, 1); g.fillRect(x + ((y + 1) % 2), y + 3, 1, 1); }
    // (the rest of the city packed down the hill below them: rooftops in rows, dimmer the further down, the odd window lit)
    const rr = rng(73);
    for (let row = 0; row < 3; row++) for (let x = (row * 5) % 9; x < w; x += 8 + Math.floor(rr() * 4)) {
      const y = Math.floor(ridge(x + 4)) + 12 + row * 7 + Math.floor(rr() * 3), bw = 6 + Math.floor(rr() * 3), tone = ['#56425A', '#4C3A50', '#433446'][row];
      g.fillStyle = tone; g.fillRect(x, y, bw, h - y); g.fillStyle = mix(tone, '#F6C27A', 0.16); g.fillRect(x, y, 1, h - y);
      g.fillStyle = mix(tone, '#000000', 0.3); g.fillRect(x + bw - 1, y + 1, 1, h - y);
      if (rr() > 0.55) { g.fillStyle = '#E8C77A'; g.fillRect(x + 2, y + 3, 1, 2); }
    }
    const r = rng(72);
    const colors = ['#F4A6B5', '#9FD8CB', '#F7D08A', '#B6A4E0', '#F2B880', '#A8D5F2'];
    // The painted ladies up the hill: each lit down its left by the sunset, its right side in shade, a gable roof lit on
    // its sunny slope, a white cornice, a bay window jutting out with its own lit and shaded sides, the stoop up to the door
    for (let x = 0; x < w; x += 12) {
      const base = ridge(x + 6);
      const hh = 14 + Math.floor(r() * 8);
      const c = colors[Math.floor(r() * colors.length)];
      const top = Math.floor(base - hh), lit = mix(c, '#FFF1E0', 0.35), shade = mix(c, '#2A1A30', 0.38), deep = mix(c, '#2A1A30', 0.55);
      g.fillStyle = c; g.fillRect(x + 1, top, 10, hh + 6);
      g.fillStyle = lit; g.fillRect(x + 1, top, 1, hh + 6);
      g.fillStyle = shade; g.fillRect(x + 8, top, 3, hh + 6); g.fillStyle = deep; g.fillRect(x + 10, top, 1, hh + 6);
      // (the gable: a row narrower each step up, the left half lit, the right dark, the ridge capped)
      for (let k = 0; k < 5; k++) { const hw = 6 - k; g.fillStyle = '#6E5A70'; g.fillRect(x + 6 - hw, top - 1 - k, hw, 1); g.fillStyle = '#4A3A50'; g.fillRect(x + 6, top - 1 - k, hw, 1); }
      g.fillStyle = '#F8F1E8'; g.fillRect(x, top, 12, 1); g.fillStyle = mix(c, '#2A1A30', 0.25); g.fillRect(x + 1, top + 1, 10, 1);
      // (the bay window: a box jutting out over the stoop, lit left, shaded right, its three panes)
      g.fillStyle = mix(c, '#FFFFFF', 0.12); g.fillRect(x + 2, top + 3, 6, 7);
      g.fillStyle = lit; g.fillRect(x + 2, top + 3, 1, 7); g.fillStyle = shade; g.fillRect(x + 7, top + 3, 1, 7);
      g.fillStyle = '#F8F1E8'; g.fillRect(x + 2, top + 2, 6, 1); g.fillStyle = deep; g.fillRect(x + 2, top + 10, 6, 1);
      const on = hash(x) > 0.4;
      g.fillStyle = on ? '#FDE68A' : '#2A2230'; g.fillRect(x + 3, top + 4, 1, 4); g.fillRect(x + 6, top + 4, 1, 4);
      g.fillStyle = on ? '#FFF7D6' : '#3A3044'; g.fillRect(x + 4, top + 4, 2, 4);
      // (a window up under the gable, and the door at the top of its stoop)
      g.fillStyle = hash(x + 5) > 0.5 ? '#FDE68A' : '#2A2230'; g.fillRect(x + 5, top - 3, 2, 2);
      g.fillStyle = deep; g.fillRect(x + 8, top + 11, 2, 4); g.fillStyle = '#F8F1E8'; g.fillRect(x + 7, top + 15, 4, 1);
      g.fillStyle = mix(c, '#2A1A30', 0.3); g.fillRect(x + 7, top + 16, 4, 1);
    }
    hazeBands(g, 0, 236, w, 30, '#C4524A', 0, 0.3, 4, 1);
  },
};
const ernieStreet: LayerSpec = {
  key: 'ernie-street', parallax: 0.36,
  paint: (g, w, h) => {
    g.fillStyle = '#1E1A22'; g.fillRect(0, 262, w, h - 262);
    // Power poles leaning after the quake, sagging wires
    const r = rng(80);
    const poles: [number, number][] = [];
    for (let x = 20; x < w; x += 90 + Math.floor(r() * 40)) {
      const lean = (r() - 0.5) * 0.5;
      poles.push([x, lean]);
      for (let i = 0; i < 70; i++) { g.fillStyle = '#17131A'; g.fillRect(Math.round(x + lean * i), 262 - i, 3, 1); }
      g.fillRect(Math.round(x + lean * 64 - 8), 262 - 64, 19, 2);
    }
    g.fillStyle = '#17131A';
    for (let i = 0; i < poles.length; i++) {
      const [x0, l0] = poles[i]; const [x1raw, l1] = poles[(i + 1) % poles.length];
      const x1 = x1raw + (i + 1 === poles.length ? w : 0);
      const ax = x0 + l0 * 64, bx = x1 + l1 * 64;
      for (let x = ax; x < bx; x++) { const k = (x - ax) / (bx - ax); g.fillRect(((Math.floor(x) % w) + w) % w, Math.floor(262 - 63 + 14 * 4 * k * (1 - k)), 1, 1); }
    }
    // Cracks in the street
    g.fillStyle = '#0B090D';
    for (let c = 0; c < 8; c++) { let x = r() * w, y = 266; for (let i = 0; i < 20; i++) { x += (r() - 0.5) * 4; y += 1; g.fillRect(Math.floor(x), y, 1, 1); } }
  },
};

const seagulls = (ctx: G, v: View) => {
  ctx.fillStyle = '#EDEDED';
  for (let i = 0; i < 5; i++) {
    const x = ((hash(i) * W + v.frame * (0.6 + hash(i + 1) * 0.5) - v.camX * 0.1) % (W + 100) + W + 100) % (W + 100) - 50;
    const y = 120 + hash(i + 2) * 120 + Math.sin(v.frame * 0.05 + i) * 6;
    const flap = Math.floor(v.frame / 8 + i) % 2 ? 2 : 0;
    ctx.fillRect(x - 6, y - flap, 6, 2); ctx.fillRect(x, y, 2, 2); ctx.fillRect(x + 2, y - flap, 6, 2);
  }
};

const ernie: Backdrop = {
  layers: [
    sky('ernie-sky', ['#231833', '#472547', '#86354B', '#C4524A', '#E98B55', '#F6C27A'], 16),
    ernieBay,
    ernieFog,
    seagulls,
    ernieHills,
    ernieStreet,
  ],
  front: (ctx, v) => weather(ctx, v, { count: 18, seed: 5, size: 2, speedY: 0.5, speedX: 0.2, parallax: 0.7, color: 'rgba(200, 190, 180, 0.5)', wobble: 4 }),
};

// ===========================================================================
// 4. HECTOR HURRICANE: Miami. Art deco hotels, a raging sea and palms bent flat.
// ===========================================================================

const hectorClouds = (key: string, parallax: number, drift: number, base: number, color: string, seed: number, count = 26, size = 1): LayerSpec => ({
  key, parallax, drift,
  paint: (g, w) => {
    const r = rng(seed);
    const lit = mix(color, '#FFFFFF', 0.16), dark = mix(color, '#000000', 0.25);
    for (let i = 0; i < count; i++) {
      const x = r() * w, y = base + r() * 40, rw = (50 + r() * 90) * size, rh = (12 + r() * 16) * size;
      wrapDraw(w, x, rw, xx => {
        // A bank of cloud: a long body with lumps heaped along its top, lit along the top edge, dark underneath,
        // ragged all round
        pixelBlob(g, xx + rw / 2, y, rw / 2, rh, color, 1);
        for (let k = 0; k < 3; k++) pixelBlob(g, xx + rw * (0.25 + k * 0.25), y - rh * 0.45, rw * (0.16 + hash(i * 3 + k) * 0.08), rh * 0.75, color, 1);
        for (let k = 0; k < 3; k++) pixelBlob(g, xx + rw * (0.25 + k * 0.25), y - rh * 0.6, rw * 0.12, rh * 0.3, lit, 1);
        pixelBlob(g, xx + rw / 2, y + rh * 0.5, rw / 2.2, rh * 0.45, dark, 1);
      });
    }
  },
});
/** How a row of Miami Beach's deco hotels looks: their pastel bodies, what their shadows go toward, the glass, the neon. */
interface DecoLook { bodies: string[]; shadow: string; light: string; glass: string; lit: string; litOdds: number; neonGlow: boolean; storm: number }

/** The little far palms along the shore under the hotels (sunny, and in the storm: bent over, nearly black). */
const HECTOR_FAR_PALM: PalmTones = { trunk: '#9A8466', trunkLit: '#BCA684', ring: '#7C6A52', frond: '#4F8A52', frondLit: '#7DB07A', frondDark: '#36643E' };
const HECTOR_FAR_PALM_STORM: PalmTones = { trunk: '#1A2236', trunkLit: '#26314C', ring: '#141A2A', frond: '#151C2E', frondLit: '#253049', frondDark: '#0E1322' };

/**
 * Miami Beach's deco hotels along the far shore, painted once: each a pastel box lit down its right side (where the
 * sun is), its shadowed left return dithered into the face, an eyebrow ledge over every row of windows, glass with a
 * glint of sky in it; crowned in steps with a spire, a finned pylon with its neon up it, a streamline curve with ribbon
 * windows, or a rooftop sign frame. Tiny palms at their feet along the shore. (The same buildings in the same places
 * sunny or stormy: the storm fades in over the sun.)
 */
const decoHotels = (g: G, w: number, o: DecoLook) => {
  const r = rng(90);
  const neon = ['#FF4FD8', '#2EE6D6', '#FFD166'];
  const base = 232;
  let x = 0;
  while (x < w) {
    const bw = 26 + Math.floor(r() * 30), bh = 50 + Math.floor(r() * 70);
    const top = base - bh;
    const body = o.bodies[Math.floor(r() * 4)];
    const n = neon[Math.floor(r() * 3)];
    const style = Math.floor(hash(x * 1.31 + bh) * 4);
    // (the body's ramp: lit, the face, the shade, the deep shadow)
    const lit = mix(body, o.light, 0.3), mid = body, shade = mix(body, o.shadow, 0.28), deep = mix(body, o.shadow, 0.5);
    const box = (bx: number, by: number, ww: number, hh: number) => {
      g.fillStyle = mid; g.fillRect(bx, by, ww, hh);
      // (the left return in shadow, dithered into the face; the right edge catching the light)
      g.fillStyle = deep; g.fillRect(bx, by, 2, hh);
      checker(g, bx + 2, by, 2, hh, shade, 0, 1);
      g.fillStyle = lit; g.fillRect(bx + ww - 2, by, 2, hh);
      checker(g, bx + ww - 4, by, 2, hh, lit, 0, 1);
      // (its top in the face's own tone, a shade under it: no bright lip, so it never reads as somewhere to stand)
      g.fillStyle = shade; g.fillRect(bx + 2, by + 1, ww - 4, 1);
    };
    // The crown
    const cx = x + Math.floor(bw / 2);
    if (style === 0) {
      // (a ziggurat in three steps, a spire up out of it with a ball on top)
      box(x + 3, top - 5, bw - 6, 5); box(x + 7, top - 9, bw - 14, 4); box(cx - 4, top - 12, 8, 3);
      g.fillStyle = deep; g.fillRect(cx, top - 24, 1, 12); g.fillStyle = lit; g.fillRect(cx + 1, top - 22, 1, 10);
      g.fillStyle = o.neonGlow ? n : lit; g.fillRect(cx - 1, top - 26, 3, 2);
    } else if (style === 1) {
      // (streamline: a low parapet, a little drum on the roof)
      box(x + 2, top - 3, bw - 4, 3); box(x + bw - 14, top - 9, 10, 6);
    } else if (style === 2) {
      // (a pylon fin up the middle, past the roof, its neon up it)
      box(x + 3, top - 5, bw - 6, 5); box(cx - 3, top - 22, 6, 22 + Math.floor(bh * 0.6));
      g.fillStyle = o.neonGlow ? mix(n, mid, 0.5) : shade; g.fillRect(cx - 1, top - 20, 3, Math.floor(bh * 0.6) + 18);
      g.fillStyle = o.neonGlow ? n : mix(n, mid, 0.55); g.fillRect(cx, top - 20, 1, Math.floor(bh * 0.6) + 18);
    } else {
      // (a sign frame up on the roof: posts and a lattice, its letters neon in the storm)
      box(x + 3, top - 4, bw - 6, 4);
      g.fillStyle = deep; for (let px = x + 5; px < x + bw - 5; px += 6) g.fillRect(px, top - 14, 1, 10);
      g.fillRect(x + 5, top - 14, bw - 10, 1); g.fillRect(x + 5, top - 9, bw - 10, 1);
      g.fillStyle = o.neonGlow ? n : mix(n, mid, 0.4);
      for (let lx = x + 7; lx < x + bw - 8; lx += 4) g.fillRect(lx, top - 13, 2, 3);
    }
    // The body
    box(x, top, bw, base - top + 2);
    // (the neon trim line under the cornice, a halo round it when it's lit)
    if (o.neonGlow) { g.fillStyle = mix(n, mid, 0.55); g.fillRect(x + 2, top + 5, bw - 4, 3); }
    g.fillStyle = o.neonGlow ? n : mix(n, mid, 0.35); g.fillRect(x + 2, top + 6, bw - 4, 1);
    // Windows: a row a floor, an eyebrow ledge over each (lit along its top, its shadow under it)
    const round = style === 1;
    for (let wy = top + 12; wy < base - 3; wy += 7) {
      g.fillStyle = mix(mid, o.light, 0.18); g.fillRect(x + 2, wy - 2, bw - 4, 1);
      g.fillStyle = shade; g.fillRect(x + 2, wy - 1, bw - 4, 1);
      if (round) {
        // (ribbon windows: a band of glass with mullions)
        g.fillStyle = o.glass; g.fillRect(x + 4, wy, bw - 9, 3);
        g.fillStyle = mix(o.glass, o.light, 0.4); g.fillRect(x + 4, wy, bw - 9, 1);
        g.fillStyle = shade; for (let mx = x + 7; mx < x + bw - 6; mx += 5) g.fillRect(mx, wy, 1, 3);
        if (hash(wy * 3.1 + x) < o.litOdds) { g.fillStyle = o.lit; g.fillRect(x + 8 + Math.floor(hash(wy + x) * (bw - 18)), wy + 1, 4, 2); }
      } else for (let wx = x + 4; wx < x + bw - 4; wx += 5) {
        const on = hash(wx * 3 + wy) < o.litOdds;
        g.fillStyle = on ? o.lit : o.glass; g.fillRect(wx, wy, 2, 3);
        g.fillStyle = on ? mix(o.lit, '#FFFFFF', 0.4) : mix(o.glass, o.light, 0.45); g.fillRect(wx, wy, 1, 1);
      }
    }
    if (round) {
      // (the streamline curve on its right corner: the light rolling round it in bands)
      g.fillStyle = mix(body, o.light, 0.45); g.fillRect(x + bw - 5, top, 2, base - top);
      g.fillStyle = mix(body, o.light, 0.15); g.fillRect(x + bw - 3, top, 1, base - top);
      g.fillStyle = shade; g.fillRect(x + bw - 2, top, 2, base - top);
    }
    x += bw + 2;
  }
  // The shore under them: a strip of sand, and little palms along it
  g.fillStyle = mix(o.bodies[2], o.shadow, 0.25); g.fillRect(0, base - 2, w, 4);
  const pr = rng(91);
  for (let px = 6; px < w; px += 18 + Math.floor(pr() * 30)) {
    const ph = 12 + pr() * 9, lean = -0.2 + pr() * 0.1 - o.storm * 0.6;
    wrapDraw(w, px, 14, xx => palm(g, xx, base, ph, o.storm ? HECTOR_FAR_PALM_STORM : HECTOR_FAR_PALM, lean));
  }
};

const hectorDeco: LayerSpec = {
  key: 'hector-deco', parallax: 0.16,
  paint: (g, w) => {
    decoHotels(g, w, {
      bodies: ['#C7B7D9', '#A8D8D1', '#E8C8B0', '#B9C6E6'].map(c => mix(c, '#1B2440', 0.55)),
      shadow: '#070B17', light: '#8A9CC8', glass: '#141B30', lit: '#FFE9A8', litOdds: 0.45, neonGlow: true, storm: 1,
    });
    // (the storm's spray and murk over their feet)
    hazeBands(g, 0, 196, w, 36, '#33436A', 0, 0.4, 5, 1);
  },
};

/**
 * The sea, painted once: the colour going down in bands to the near water, a glare along the horizon, and swells in
 * rows that get bigger and further apart the nearer they are, each lit along its crest with its trough dark under it;
 * glints riding them (and whitecaps, in the storm, their foam dithered off at the edges).
 */
const seaPaint = (g: G, w: number, h: number, seed: number, stops: string[], o: { horizon: string; crest: string; trough: string; glint: string; glints: number; foam?: string }) => {
  g.fillStyle = stops[stops.length - 1]; g.fillRect(0, 232, w, h - 232);
  bandedGradient(g, 0, 232, w, 44, stops, 6, 1);
  g.fillStyle = o.horizon; g.fillRect(0, 232, w, 1);
  checker(g, 0, 233, w, 1, o.horizon, 0, 1);
  const r = rng(seed);
  for (let y = 235; y < h;) {
    const depth = (y - 232) / 70, len = Math.round(4 + depth * 14), gap = Math.round(6 + depth * 16);
    for (let x = Math.floor(r() * gap); x < w; x += len + gap + Math.floor(r() * gap)) {
      const l = Math.max(3, Math.round(len * (0.6 + r() * 0.6))), foam = !!o.foam && depth > 0.25 && r() < 0.35;
      wrapDraw(w, x, l, xx => {
        g.fillStyle = o.trough; g.fillRect(xx, y + 1, l, 1 + Math.floor(depth * 1.5));
        g.fillStyle = o.crest; g.fillRect(xx + 1, y, l - 2, 1);
        if (foam) { g.fillStyle = o.foam!; g.fillRect(xx + 2, y - 1, Math.max(2, l - 5), 1); checker(g, xx, y - 2, l, 1, o.foam!, 0, 1); }
      });
    }
    y += Math.max(2, Math.round(2 + depth * 5));
  }
  for (let i = 0; i < o.glints; i++) {
    const x = Math.floor(r() * w), y = 234 + Math.floor(r() * r() * 40);
    g.fillStyle = o.glint; g.fillRect(x, y, 1 + Math.floor(r() * 3), 1);
  }
};
const hectorSea: LayerSpec = {
  key: 'hector-sea', parallax: 0.26,
  paint: (g, w, h) => seaPaint(g, w, h, 95, ['#1D3B5A', '#17304A', '#12263A', '#0C1B2C'], { horizon: '#4A5B82', crest: '#3E6A95', trough: '#091523', glint: '#7FB2D9', glints: 60, foam: '#C8DDF0' }),
  raster: { from: 232, wobble: (row, f) => Math.sin(row * 0.6 + f * 0.25) * 2.5 },
};
/** The strip of beach the near palms stand on: sand in bands, darker going down, dithered one into the next (no lit lip). */
const beachStrip = (g: G, w: number, h: number, stops: string[], seed: number, fleck: string) => {
  bandedGradient(g, 0, 268, w, h - 268, stops, 4, 1);
  const r = rng(seed);
  g.fillStyle = fleck; for (let i = 0; i < 90; i++) g.fillRect(Math.floor(r() * w), 270 + Math.floor(r() * (h - 272)), 1 + Math.floor(r() * 2), 1);
};
const hectorPalms: LayerSpec = {
  key: 'hector-palms', parallax: 0.4,
  paint: (g, w, h) => beachStrip(g, w, h, ['#151B2C', '#0F1424', '#0B0F1C'], 98, '#1E2638'),
};
/** Where the palms stand along the shore (tile x) and how tall they are. */
const HECTOR_PALM_TREES = (() => {
  const r = rng(99);
  const trees: { x: number; h: number; phase: number }[] = [];
  for (let x = 15; x < TILE_W; x += 55 + Math.floor(r() * 50)) trees.push({ x, h: 50 + r() * 30, phase: r() * Math.PI * 2 });
  return trees;
})();
/** The near palms in the hurricane: silhouettes against the murk, a faint rim of storm light along them. */
const HECTOR_PALM_STORM: PalmTones = { trunk: '#0B0F1C', trunkLit: '#1B2338', ring: '#070A14', frond: '#0B0F1C', frondLit: '#202A44', frondDark: '#05070E', nut: '#05070E' };
/** And in the sun: a ringed grey-brown trunk, green fronds lit along the top, coconuts. */
const HECTOR_PALM_SUNNY: PalmTones = { trunk: '#8A6E4C', trunkLit: '#B8976A', ring: '#5E4A34', frond: '#3F7A1E', frondLit: '#79B83A', frondDark: '#24501A', nut: '#5A3A1A' };
/**
 * The palms, whipping in the hurricane: bent hard away from the wind, rocking
 * with each gust, fronds thrashing. Every so often a big gust bends them all flat.
 */
const swayingPalms = (ctx: G, v: View) => {
  const gust = Math.max(0, Math.sin(v.frame * 0.013)) ** 6; // an occasional big one
  ctx.save();
  ctx.scale(PX, PX);
  for (const t of HECTOR_PALM_TREES) {
    pinned(t.x, hectorPalms, v, sx => {
      const rock = Math.sin(v.frame * 0.09 + t.phase) * 0.22 + Math.sin(v.frame * 0.23 + t.phase * 2) * 0.08;
      const lean = -1.25 + rock - gust * 0.45;
      palm(ctx, Math.round(sx / PX), 269, t.h, HECTOR_PALM_STORM, lean, 0.6 + gust * 0.4, v.frame * 0.25 + t.phase);
    });
  }
  ctx.restore();
};

/** Lightning: every few seconds a bolt forks down and the whole sky flashes (the bolt in a stepped halo, white-hot down its middle). */
const lightning = (ctx: G, v: View) => {
  const cycle = 260, t = v.frame % cycle;
  const strike = Math.floor(v.frame / cycle);
  if (t > 14) return;
  const flash = t < 3 ? 0.55 : t < 6 ? 0.1 : t < 9 ? 0.35 : 0.05;
  ctx.fillStyle = `rgba(220, 230, 255, ${flash})`;
  ctx.fillRect(0, 0, W, H);
  if (t > 9) return;
  ctx.lineJoin = 'miter';
  ctx.beginPath();
  let x = 150 + hash(strike) * 500, y = 0;
  ctx.moveTo(x, y);
  for (let i = 0; i < 9; i++) {
    x += (hash(strike * 10 + i) - 0.5) * 60; y += 30 + hash(strike + i) * 15; ctx.lineTo(x, y);
    // (a fork off it now and then, short, the same zigzag)
    if (hash(strike * 7 + i) > 0.7) { const fx = x + (hash(i + strike) - 0.5) * 50; ctx.lineTo(fx, y + 26); ctx.lineTo(fx + (hash(i * 3) - 0.5) * 20, y + 44); ctx.moveTo(x, y); }
  }
  for (const [lw, c] of [[14, 'rgba(165, 180, 252, 0.18)'], [8, 'rgba(191, 219, 254, 0.35)'], [4, '#BFDBFE'], [2, '#FFFFFF']] as const) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.stroke(); }
};

const hector: Backdrop = {
  layers: [
    sky('hector-sky', ['#070B17', '#131B33', '#1F2B4C', '#33436A', '#4A5B82'], 14),
    hectorClouds('hector-clouds-far', 0.04, 0.35, 40, '#27324F', 111),
    lightning,
    hectorClouds('hector-clouds-near', 0.08, 0.8, 90, '#1A2238', 112),
    hectorDeco,
    hectorSea,
    hectorPalms,
    swayingPalms,
  ],
  front: (ctx, v) => {
    ctx.strokeStyle = 'rgba(190, 210, 240, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 90; i++) {
      const x = ((hash(i) * (W + 200) - v.frame * 9 - v.camX * 1.1) % (W + 200) + W + 200) % (W + 200) - 100;
      const y = ((hash(i + 50) * (H + 100) + v.frame * 18) % (H + 100)) - 50;
      ctx.moveTo(x, y); ctx.lineTo(x - 10, y + 22);
    }
    ctx.stroke();
  },
};

/**
 * Hector's stage before the storm hits (and after it's gone): a clear blue
 * Miami sky, a hot sun, pastel deco hotels and a sparkling calm sea, palms
 * standing straight. The stage fades the hurricane backdrop in over this.
 */
const sunnyDeco: LayerSpec = {
  key: 'hector-sunny-deco', parallax: 0.16,
  paint: (g, w) => {
    decoHotels(g, w, { bodies: ['#F5D0E6', '#BDEFE8', '#FCE7C8', '#D6DDF7'], shadow: '#5A6E9A', light: '#FFFFFF', glass: '#4D7FA8', lit: '#BAE6FD', litOdds: 0.25, neonGlow: false, storm: 0 });
    // (the sea air over their feet)
    hazeBands(g, 0, 200, w, 32, '#B2DEF7', 0, 0.3, 4, 1);
  },
};
const sunnySea: LayerSpec = {
  key: 'hector-sunny-sea', parallax: 0.26,
  paint: (g, w, h) => seaPaint(g, w, h, 96, ['#38BDF8', '#2AA6DC', '#1C8FBE', '#0E7490'], { horizon: '#D6F0FC', crest: '#7DD3FC', trough: '#0B6380', glint: '#F0F9FF', glints: 140 }),
  raster: { from: 232, wobble: (row, f) => Math.sin(row * 0.5 + f * 0.08) * 1 },
};
const sunnyPalms: LayerSpec = {
  key: 'hector-sunny-palms', parallax: 0.4,
  paint: (g, w, h) => {
    beachStrip(g, w, h, ['#E9D5A1', '#DCC48C', '#CDB37A'], 97, '#F3E5BE');
    for (const t of HECTOR_PALM_TREES) wrapDraw(w, t.x, 40, xx => palm(g, xx, 269, t.h, HECTOR_PALM_SUNNY, -0.15, 0.1, t.phase));
  },
};
/** The sun as a pixel disc, painted the once: a pale rim, the face, a white-hot heart up toward its top left. */
let sunDisc: HTMLCanvasElement | null = null;
const SUN_R = 34;
const getSunDisc = () => {
  if (sunDisc || typeof document === 'undefined') return sunDisc;
  const c = document.createElement('canvas'); c.width = c.height = SUN_R * 2;
  const g = c.getContext('2d')!;
  const disc = (cx: number, cy: number, r: number, col: string) => {
    g.fillStyle = col;
    for (let y = -r; y < r; y += 2) { const hw = Math.round(Math.sqrt(Math.max(0, r * r - (y + 1) * (y + 1))) / 2) * 2; g.fillRect(cx - hw, cy + y, hw * 2, 2); }
  };
  disc(SUN_R, SUN_R, SUN_R, '#FDE68A');
  disc(SUN_R, SUN_R, SUN_R - 4, '#FFF3BF');
  disc(SUN_R - 6, SUN_R - 6, SUN_R - 14, '#FFFBEA');
  disc(SUN_R - 9, SUN_R - 9, 8, '#FFFFFF');
  sunDisc = c;
  return c;
};
const sunPos = (v: View) => ({ x: Math.round((W * 0.78 - v.camX * 0.01 % 40) / 2) * 2, y: Math.round((90 - Math.max(-60, Math.min(60, v.camY * 0.02))) / 2) * 2 });
const sun = (ctx: G, v: View) => {
  const { x, y } = sunPos(v);
  steppedGlow(ctx, x, y, 120, '#FFF4C4', 0.7, 0, 6);
  const d = getSunDisc();
  if (d) ctx.drawImage(d, x - SUN_R, y - SUN_R);
};
/** The sun's road across the sea under it: flecks of light, flickering. */
const sunGlitter = (ctx: G, v: View) => {
  const { x } = sunPos(v);
  ctx.fillStyle = 'rgba(255, 251, 234, 0.85)';
  const f = Math.floor(v.frame / 6);
  for (let i = 0; i < 26; i++) {
    if (hash(i * 3.7 + f) > 0.55) continue;
    const k = hash(i * 1.9), y = 466 + Math.floor(k * k * 70 / 2) * 2, spread = 14 + k * 60;
    ctx.fillRect(Math.round((x + (hash(i + f * 0.37) - 0.5) * spread) / 2) * 2, y, 4 + Math.floor(k * 4) * 2, 2);
  }
};
// The beach at the start: not a cloud in the sky, near enough (a few little wisps)
const hectorSunny: Backdrop = {
  layers: [
    sky('hector-sunny-sky', ['#1D8FE0', '#3BA3EA', '#5FB8F0', '#86CBF4', '#B2DEF7'], 12),
    sun,
    hectorClouds('hector-sunny-clouds', 0.05, 0.2, 50, '#F8FAFC', 211, 4, 0.55),
    sunnyDeco,
    sunnySea,
    sunGlitter,
    sunnyPalms,
  ],
};
// The storm's just passed: a paler, washed-out blue, the sun back out through a haze, broken grey-white cloud,
// and the tail of the storm's dark clouds drifting off
const hazySun = (ctx: G, v: View) => {
  sun(ctx, v);
  ctx.fillStyle = 'rgba(226, 232, 240, 0.25)'; ctx.fillRect(0, 0, W, 200);
};
const hectorAfter: Backdrop = {
  layers: [
    sky('hector-after-sky', ['#4F86B8', '#6B9CC6', '#8DB3D2', '#AFC8DC', '#CBD8E3'], 12),
    hazySun,
    hectorClouds('hector-after-clouds-far', 0.03, 0.15, 24, '#8A9BB0', 311, 5, 1.05),
    hectorClouds('hector-after-clouds', 0.06, 0.3, 80, '#EEF2F7', 312, 11, 0.9),
    sunnyDeco,
    sunnySea,
    sunGlitter,
    sunnyPalms,
  ],
};

// ===========================================================================
// 5. TOXIC TOMMY: Flint, Michigan. Rust, smokestacks and a glowing toxic river.
// ===========================================================================

const TOWER_X = 120;
const STACKS = [300, 330, 520];
const tommyFar: LayerSpec = {
  key: 'tommy-far', parallax: 0.07,
  paint: (g, w, h) => {
    fillRidge(g, w, h, makeRidge(121, w, 225, 18, 0.1), '#142014');
    // Water tower
    g.fillStyle = '#2B3A2B';
    g.fillRect(TOWER_X - 22, 120, 44, 26); g.fillRect(TOWER_X - 18, 116, 36, 4); g.fillRect(TOWER_X - 10, 112, 20, 4);
    for (const lx of [-18, -6, 6, 18]) g.fillRect(TOWER_X + lx, 146, 2, 80);
    g.fillRect(TOWER_X - 20, 170, 40, 2); g.fillRect(TOWER_X - 20, 196, 40, 2);
    g.fillStyle = '#9ACD32'; g.font = 'bold 9px monospace'; g.textAlign = 'center'; g.fillText('FLINT', TOWER_X, 137);
    g.fillStyle = '#6B8E23'; g.fillRect(TOWER_X + 8, 140, 2, 6); g.fillRect(TOWER_X - 12, 141, 2, 4); // drips
    // Smokestacks and a factory block
    g.fillStyle = '#231A14'; g.fillRect(280, 175, 280, 60);
    for (const sx of STACKS) { g.fillStyle = '#3A2A20'; g.fillRect(sx - 5, 110, 10, 70); g.fillStyle = '#7F1D1D'; g.fillRect(sx - 5, 118, 10, 3); g.fillRect(sx - 5, 128, 10, 3); }
    for (let x = 290; x < 550; x += 9) { g.fillStyle = hash(x) > 0.5 ? '#9ACD32' : '#1A140F'; g.fillRect(x, 195, 4, 5); }
    // (the smog over the plant: its feet fade into the sky)
    hazeBands(g, 0, 200, w, 34, '#3C5E1C', 0, 0.4, 5, 1);
  },
};
const tommyPipes: LayerSpec = {
  key: 'tommy-pipes', parallax: 0.2,
  paint: (g, w, h) => {
    const r = rng(130);
    g.fillStyle = '#1B1510'; g.fillRect(0, 240, w, h - 240);
    for (let x = 0; x < w; x += 30 + Math.floor(r() * 40)) {
      const bh = 20 + r() * 40;
      g.fillStyle = '#2C2118'; g.fillRect(x, 240 - bh, 26, bh);
      g.fillStyle = '#4A3322'; g.fillRect(x, 240 - bh, 26, 2);
      g.fillStyle = r() > 0.4 ? '#7CFC00' : '#241A12'; g.fillRect(x + 5, 240 - bh + 6, 5, 4);
    }
    // Big rusty pipes crossing
    for (const py of [214, 228]) {
      g.fillStyle = '#6B3A1E'; g.fillRect(0, py, w, 5);
      g.fillStyle = '#8B4A26'; g.fillRect(0, py, w, 1);
      for (let x = 0; x < w; x += 48) { g.fillStyle = '#4A2814'; g.fillRect(x, py - 1, 3, 7); }
    }
    hazeBands(g, 0, 226, w, 16, '#23421A', 0, 0.25, 3, 1);
  },
};
const tommyRiver: LayerSpec = {
  key: 'tommy-river', parallax: 0.34,
  paint: (g, w, h) => {
    g.fillStyle = '#18330A'; g.fillRect(0, 250, w, h - 250);
    bandedGradient(g, 0, 250, w, 44, ['#3F7F16', '#336612', '#26500E', '#18330A'], 6, 1);
    const r = rng(140);
    for (let i = 0; i < 200; i++) { g.fillStyle = r() > 0.6 ? '#ADFF2F' : '#5DA11F'; g.fillRect(Math.floor(r() * w), 252 + Math.floor(r() * 45), 2 + Math.floor(r() * 4), 1); }
    // Leaking drums on the bank
    for (let x = 30; x < w; x += 110 + Math.floor(r() * 60)) {
      g.fillStyle = '#B45309'; g.fillRect(x, 238, 9, 12); g.fillStyle = '#FACC15'; g.fillRect(x, 242, 9, 2); g.fillStyle = '#ADFF2F'; g.fillRect(x + 8, 246, 3, 5);
    }
    g.fillStyle = '#120E0A'; g.fillRect(0, 246, w, 4);
  },
  raster: { from: 250, wobble: (row, f) => Math.sin(row * 0.5 + f * 0.1) * 2 },
};

const smoke = (ctx: G, v: View) => {
  for (const sx0 of STACKS) pinned(sx0, tommyFar, v, sx => {
    for (let i = 0; i < 10; i++) {
      const t = ((v.frame * 0.5 + i * 20 + sx0) % 200) / 200;
      const r = 8 + t * 30;
      ctx.fillStyle = `rgba(70, 80, 60, ${0.5 * (1 - t)})`;
      ctx.fillRect(Math.round(sx + t * 60 - r / 2), Math.round(110 * PX - t * 180 - r / 2), r, r);
    }
  });
};
const toxicBubbles = (ctx: G, v: View) => {
  for (let i = 0; i < 14; i++) {
    const t = ((v.frame + i * 17) % 50) / 50;
    const x = ((hash(i) * W - v.camX * 0.34) % W + W) % W;
    const y = 262 * PX + hash(i + 7) * 60;
    ctx.strokeStyle = `rgba(173, 255, 47, ${1 - t})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(Math.round(x - t * 5), Math.round(y - t * 5), Math.round(t * 10), Math.round(t * 10));
  }
};

const tommy: Backdrop = {
  layers: [
    sky('tommy-sky', ['#050A06', '#0B170C', '#142A14', '#23421A', '#3C5E1C'], 14, (g, w) => stars(g, w, LH, 12, 60, 120)),
    tommyFar,
    smoke,
    tommyPipes,
    tommyRiver,
    toxicBubbles,
  ],
  front: (ctx, v) => {
    weather(ctx, v, { count: 30, seed: 6, size: 3, speedY: -0.5, speedX: 0.2, parallax: 0.8, color: 'rgba(173, 255, 47, 0.35)', wobble: 8 });
    ctx.fillStyle = 'rgba(80, 140, 40, 0.08)';
    ctx.fillRect(0, H - 120, W, 120);
  },
};

// ===========================================================================
// 6. BLACKOUT BARRY: New York City at night, rolling blackouts across the skyline.
// ===========================================================================

const skyline = (key: string, parallax: number, seed: number, base: number, minH: number, maxH: number, body: string, lit: string, empire = false, haze?: string): LayerSpec => ({
  key, parallax,
  paint: (g, w, h) => {
    const r = rng(seed);
    // (the blacked-out copy is the same city with every light out: the same buildings, the same unlit glass)
    const on = lit !== body;
    // (the moon's up to the left: a cold rim down each building's left edge, its right side a step darker)
    const rim = mix(body, '#8A9CC8', 0.22), shade = mix(body, '#000000', 0.35), glass = mix(body, '#2A3A5E', 0.3), sill = mix(body, '#000000', 0.2);
    let x = 0;
    while (x < w) {
      const bw = 14 + Math.floor(r() * 26);
      const bh = minH + Math.floor(r() * (maxH - minH));
      const top = base - bh;
      g.fillStyle = body; g.fillRect(x, top, bw, h - top);
      g.fillStyle = shade; g.fillRect(x + bw - 2, top, 2, h - top);
      checker(g, x + bw - 4, top, 2, h - top, shade, 0, 1);
      g.fillStyle = rim; g.fillRect(x, top, 1, h - top);
      // (a cornice: a shadow line under the roof, nothing bright on top)
      g.fillStyle = sill; g.fillRect(x + 1, top + 2, bw - 3, 1);
      const style = hash(x * 0.37 + seed);
      if (r() > 0.6) {
        // (an antenna, its red light lit)
        g.fillStyle = body; g.fillRect(x + Math.floor(bw / 2) - 1, top - 8, 2, 8);
        g.fillStyle = rim; g.fillRect(x + Math.floor(bw / 2) - 1, top - 8, 1, 8);
        if (on) { g.fillStyle = '#EF4444'; g.fillRect(x + Math.floor(bw / 2) - 1, top - 9, 2, 1); }
      }
      if (r() > 0.7) {
        // (a setback on the roof)
        g.fillStyle = body; g.fillRect(x + 2, top - 4, bw - 4, 4);
        g.fillStyle = rim; g.fillRect(x + 2, top - 4, 1, 4); g.fillStyle = shade; g.fillRect(x + bw - 4, top - 4, 2, 4);
      } else if (style > 0.55 && bw > 18) {
        // (a water tower up on the roof, on its stilts, a pointed cap)
        const tx = x + 4 + Math.floor(style * 6);
        g.fillStyle = shade; g.fillRect(tx + 1, top - 3, 1, 3); g.fillRect(tx + 6, top - 3, 1, 3);
        g.fillStyle = body; g.fillRect(tx, top - 9, 8, 6); g.fillRect(tx + 1, top - 11, 6, 2); g.fillRect(tx + 3, top - 12, 2, 1);
        g.fillStyle = rim; g.fillRect(tx, top - 9, 1, 6); g.fillRect(tx + 1, top - 11, 1, 2);
        g.fillStyle = shade; g.fillRect(tx + 6, top - 9, 2, 6); g.fillRect(tx, top - 7, 8, 1);
      }
      // (pilasters up the face of some)
      if (style < 0.3) { g.fillStyle = sill; for (let px = x + 4; px < x + bw - 4; px += 6) g.fillRect(px, top + 3, 1, base - top - 3); }
      // Windows: a grid of unlit glass, the lit ones warm (the odd one TV-blue, the odd one brighter)
      for (let wy = top + 4; wy < base; wy += 4) for (let wx = x + 2; wx < x + bw - 2; wx += 3) {
        const q = hash(wx * 13 + wy * 7 + seed);
        if (q > 0.62 && on) { g.fillStyle = q > 0.97 ? '#8FB8FF' : q > 0.92 ? mix(lit, '#FFFFFF', 0.45) : lit; g.fillRect(wx, wy, 1, 2); }
        else if (q > 0.3) { g.fillStyle = glass; g.fillRect(wx, wy, 1, 2); }
      }
      x += bw + 1;
    }
    if (empire) {
      // The Empire State: its setbacks in tiers, each rimmed and shaded, the mast up top; its crown floodlit
      const ex = 260, top = base - 150;
      const tier = (tx: number, ty: number, tw: number, th: number) => {
        g.fillStyle = body; g.fillRect(tx, ty, tw, th);
        g.fillStyle = rim; g.fillRect(tx, ty, 1, th); g.fillStyle = shade; g.fillRect(tx + tw - 2, ty, 2, th);
      };
      tier(ex - 18, top + 70, 36, 150); tier(ex - 14, top + 40, 28, 150); tier(ex - 11, top + 26, 22, 16); tier(ex - 9, top + 18, 18, 10); tier(ex - 5, top + 6, 10, 14); tier(ex - 1, top - 14, 2, 22);
      if (on) {
        // (the floodlights on the crown: the tiers lit gold going up to white, the mast lit)
        g.fillStyle = '#5E5238'; g.fillRect(ex - 9, top + 20, 16, 6); checker(g, ex - 9, top + 26, 18, 4, '#3A3428', 0, 1);
        g.fillStyle = '#9C8A5C'; g.fillRect(ex - 5, top + 8, 8, 10); g.fillStyle = '#6E6142'; g.fillRect(ex + 3, top + 8, 2, 10);
        g.fillStyle = '#E8D7A8'; g.fillRect(ex - 5, top + 6, 10, 2); g.fillStyle = '#B9A468'; g.fillRect(ex - 9, top + 18, 18, 2);
        g.fillStyle = '#CBD5E1'; g.fillRect(ex - 1, top - 14, 1, 20); g.fillStyle = '#EF4444'; g.fillRect(ex - 1, top - 15, 2, 1);
      }
      for (let wy = top + 44; wy < base; wy += 4) for (let wx = ex - 12; wx < ex + 12; wx += 3) { const q = hash(wx + wy); if (q > 0.5 && on) { g.fillStyle = lit; g.fillRect(wx, wy, 1, 2); } else if (q > 0.25) { g.fillStyle = glass; g.fillRect(wx, wy, 1, 2); } }
    }
    // (the night's haze over the streets at their feet)
    if (haze) hazeBands(g, 0, base - 44, w, 44, haze, 0, 0.42, 5, 1);
  },
});
const barryFar = skyline('barry-far', 0.06, 150, 240, 40, 110, '#0C1224', '#46557A', true, '#1C2A4F');
const barryMid = skyline('barry-mid', 0.18, 151, 255, 50, 140, '#060A16', '#FCD978', false, '#121E3D');
/** The same skylines with every light out (Barry's stage draws these over the lit ones where the blackout's rolled through). */
export const BARRY_SKYLINES_DARK: LayerSpec[] = [
  skyline('barry-far-dark', 0.06, 150, 240, 40, 110, '#0C1224', '#0C1224', true, '#1C2A4F'),
  skyline('barry-mid-dark', 0.18, 151, 255, 50, 140, '#060A16', '#060A16', false, '#121E3D'),
];

/** The rolling blackout: a wave of darkness sweeps across the skyline, windows sputtering at its edges. */
const blackoutWave = (ctx: G, v: View) => {
  const span = 520, speed = 2.2;
  const x0 = ((v.frame * speed) % (W + span * 2)) - span;
  const grad = ctx.createLinearGradient(x0, 0, x0 + span, 0);
  grad.addColorStop(0, 'rgba(0, 0, 8, 0)');
  grad.addColorStop(0.2, 'rgba(0, 0, 8, 0.82)');
  grad.addColorStop(0.8, 'rgba(0, 0, 8, 0.82)');
  grad.addColorStop(1, 'rgba(0, 0, 8, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(x0, 0, span, 262 * PX);
  // Windows sputtering back on and off along its edges
  ctx.fillStyle = 'rgba(252, 217, 120, 0.8)';
  for (let i = 0; i < 18; i++) {
    if (hash(i + Math.floor(v.frame / 4)) > 0.5) continue;
    const edge = i % 2 ? x0 + span * 0.12 : x0 + span * 0.88;
    ctx.fillRect(Math.round(edge + (hash(i * 3) - 0.5) * 60), Math.round(250 + hash(i * 7) * 250), 2, 4);
  }
};
const barryLines: LayerSpec = {
  key: 'barry-lines', parallax: 0.38,
  paint: (g, w, h) => {
    g.fillStyle = '#04060D'; g.fillRect(0, 264, w, h - 264);
    for (let x = 40; x < w; x += 160) {
      g.fillStyle = '#0A0D16'; g.fillRect(x, 170, 4, 96); g.fillRect(x - 14, 176, 32, 3); g.fillRect(x - 10, 186, 24, 2);
      g.fillStyle = '#20283A'; g.fillRect(x + 6, 180, 8, 10); // transformer
    }
    g.fillStyle = '#0A0D16';
    for (let x = 40; x < w + 40; x += 160) for (const [dy, sag] of [[176, 18], [186, 14]] as const) {
      for (let i = 0; i < 160; i++) { const k = i / 160; g.fillRect((x + i) % w, Math.floor(dy + sag * 4 * k * (1 - k)), 1, 1); }
    }
  },
};
const sparks = (ctx: G, v: View) => {
  for (let x0 = 40; x0 < TILE_W; x0 += 160) pinned(x0 + 10, barryLines, v, sx => {
    if ((v.frame + x0) % 90 > 12) return;
    ctx.fillStyle = v.frame % 2 ? '#E0F2FE' : '#38BDF8';
    for (let i = 0; i < 6; i++) ctx.fillRect(Math.round(sx + (hash(i + v.frame) - 0.5) * 30), Math.round(184 * PX + (hash(i * 3 + v.frame) - 0.5) * 30), 3, 3);
  });
};

const barry: Backdrop = {
  layers: [
    sky('barry-sky', ['#010208', '#040915', '#0A1328', '#121E3D', '#1C2A4F'], 14, (g, w) => {
      stars(g, w, LH, 20, 90, 140);
      // The moon: a pixel disc, a dithered ring of glow round it, the side away from the light a step greyer, its seas
      const disc = (cx: number, cy: number, rr: number, col: string) => { g.fillStyle = col; for (let y = -rr; y <= rr; y++) { const hw = Math.round(Math.sqrt(Math.max(0, rr * rr - y * y))); g.fillRect(cx - hw, cy + y, hw * 2, 1); } };
      disc(90, 50, 14, '#1A2747'); g.fillStyle = '#1A2747'; for (let y = -16; y <= 16; y++) for (let x = -16; x <= 16; x++) { const d = x * x + y * y; if (d > 196 && d <= 272 && (x + y) % 2 === 0) g.fillRect(90 + x, 50 + y, 1, 1); }
      disc(90, 50, 12, '#CBD5E1'); disc(88, 48, 10, '#E2E8F0'); disc(87, 47, 6, '#F8FAFC');
      checker(g, 92, 39, 10, 22, '#CBD5E1', 0, 1);
      for (const [mx, my, mr] of [[85, 46, 2], [93, 53, 3], [90, 43, 1], [84, 55, 1]] as const) { disc(mx, my, mr, '#AEB9C9'); g.fillStyle = '#F8FAFC'; g.fillRect(mx - mr, my + mr, mr * 2, 1); }
    }),
    barryFar,
    barryMid,
    blackoutWave,
    barryLines,
    sparks,
  ],
};

// ===========================================================================
// 7. OILY OSCAR: Houston. A refinery at smoggy dusk: flare stacks, tanks and pumpjacks.
// ===========================================================================

const FLARES = [140, 470];
const oscarRefinery: LayerSpec = {
  key: 'oscar-refinery', parallax: 0.08,
  paint: (g, w, h) => {
    g.fillStyle = '#20120C'; g.fillRect(0, 225, w, h - 225);
    const r = rng(170);
    for (let x = 0; x < w; x += 18 + Math.floor(r() * 30)) {
      const th = 30 + r() * 80, cw = 6 + Math.floor(r() * 5);
      // (each column lit down its left side by the dusk, dark down the right, a cap on top)
      g.fillStyle = '#26160E'; g.fillRect(x, 225 - th, cw, th);
      g.fillStyle = '#3C2416'; g.fillRect(x, 225 - th, 2, th);
      g.fillStyle = '#1A0E08'; g.fillRect(x + cw - 2, 225 - th, 2, th);
      g.fillStyle = '#3A2214'; for (let y = 225 - th + 6; y < 225; y += 10) g.fillRect(x - 1, y, cw + 3, 1); // catwalk rings
      g.fillStyle = '#4A2E1C'; g.fillRect(x - 1, 225 - th - 2, cw + 2, 2);
      if (r() > 0.6) { g.fillStyle = '#1A0E08'; g.fillRect(x + cw, 225 - th + 10, 6, 1); g.fillRect(x + cw + 5, 225 - th + 10, 1, 8); } // a pipe off it
    }
    for (const fx of FLARES) { g.fillStyle = '#2E1A10'; g.fillRect(fx - 2, 95, 4, 130); g.fillStyle = '#3C2416'; g.fillRect(fx - 2, 95, 1, 130); }
    // (the smog over the refinery: its feet fade into the dusk)
    hazeBands(g, 0, 190, w, 36, '#9A4A18', 0, 0.4, 5, 1);
  },
};
const oscarTanks: LayerSpec = {
  key: 'oscar-tanks', parallax: 0.22,
  paint: (g, w, h) => {
    bandedGradient(g, 0, 250, w, h - 250, ['#21130C', '#1A0F09', '#150C08'], 3, 1);
    const r = rng(180);
    // The storage tanks: steel drums lit down their left by the dusk (and the flares), round into shadow on the right in
    // steps dithered one into the next; plate seams round them, a shallow roof with a railing, a stair spiralling up,
    // oil streaked down from the top
    const TONES = ['#4A3C30', '#B49A78', '#927A5E', '#6E5A46', '#4E4034', '#2E2620'];
    const EDGES = [0.06, 0.28, 0.44, 0.72, 0.88, 1.01];
    for (let x = 10; x < w; x += 70 + Math.floor(r() * 50)) {
      const tw = Math.floor(40 + r() * 25), th = Math.floor(24 + r() * 16);
      const top = 250 - th;
      for (let c = 0; c < tw; c++) {
        const u = (c + 0.5) / tw;
        const i = EDGES.findIndex(e => u < e);
        g.fillStyle = TONES[i]; g.fillRect(x + c, top, 1, th);
        // (dithered into the next tone over for a column either side of each step)
        const next = EDGES[i] - u < 1 / tw ? TONES[i + 1] : u - (EDGES[i - 1] ?? -1) < 1 / tw ? TONES[i - 1] : null;
        if (next) checker(g, x + c, top, 1, th, next, c & 1, 1);
      }
      // (plate seams: a dark line, the plate under it catching a little light)
      for (let yy = top + 8; yy < 250; yy += 8) { g.fillStyle = '#3A3027'; g.fillRect(x + 1, yy, tw - 2, 1); g.fillStyle = 'rgba(255, 220, 180, 0.08)'; g.fillRect(x + 1, yy + 1, tw - 2, 1); }
      // (oil run down from the top here and there)
      for (let k = 0; k < 3; k++) { const sx = x + 4 + Math.floor(hash(x * 3 + k) * (tw - 8)), sl = 4 + Math.floor(hash(x + k * 7) * th * 0.6); g.fillStyle = '#2A2018'; g.fillRect(sx, top + 1, 1, sl); g.fillRect(sx, top + sl, 2, 2); }
      // (the roof: a shallow cone in rows, lit on the left, dull: nothing to stand on, from here)
      for (let k = 0; k < 4; k++) {
        const hw = Math.floor((tw / 2) * (1 - k * 0.22)), cx = x + Math.floor(tw / 2);
        g.fillStyle = '#6E5E4E'; g.fillRect(cx - hw, top - k - 1, hw * 2, 1);
        g.fillStyle = '#7F6E5C'; g.fillRect(cx - hw, top - k - 1, Math.floor(hw * 0.7), 1);
      }
      // (the railing round its edge: a rail and posts)
      g.fillStyle = '#2E241C'; g.fillRect(x, top - 4, tw, 1); for (let px = x; px < x + tw; px += 5) g.fillRect(px, top - 4, 1, 4);
      // (the stair up its side: treads in a dark run, a lit handrail over them)
      for (let i = 0; i < th; i++) { const sx = Math.floor(x + 4 + i * 0.6); g.fillStyle = '#231A12'; g.fillRect(sx, top + i, i % 3 ? 1 : 3, 1); g.fillStyle = '#B49C80'; if (i > 2) g.fillRect(sx + 1, top + i - 3, 1, 1); }
      // (its foot: a concrete ring, then the pipe along the ground, lit along its top)
      g.fillStyle = '#2A1E16'; g.fillRect(x - 1, 248, tw + 2, 2);
      g.fillStyle = '#3F2A1A'; g.fillRect(x - 8, 244, 90, 3); g.fillStyle = '#5A3C26'; g.fillRect(x - 8, 244, 90, 1); g.fillStyle = '#24170E'; g.fillRect(x - 8, 247, 90, 1);
    }
    hazeBands(g, 0, 232, w, 20, '#9A4A18', 0, 0.3, 4, 1);
  },
};
const PUMPJACKS = [80, 300, 520];
const oscarField: LayerSpec = {
  key: 'oscar-field', parallax: 0.38,
  paint: (g, w, h) => {
    // The near field: dirt in dark bands (no lip to it), gravel, black puddles of crude with the dusk shining in them
    bandedGradient(g, 0, 268, w, h - 268, ['#1A100B', '#130B07', '#0D0705'], 4, 1);
    const r = rng(181);
    for (let i = 0; i < 140; i++) { g.fillStyle = r() > 0.6 ? '#2A1C14' : '#070403'; g.fillRect(Math.floor(r() * w), 269 + Math.floor(r() * (h - 270)), 1 + Math.floor(r() * 2), 1); }
    for (let i = 0; i < 9; i++) {
      const px = Math.floor(r() * w), py = 272 + Math.floor(r() * 20), pw = 10 + Math.floor(r() * 18);
      wrapDraw(w, px, pw, xx => {
        g.fillStyle = '#050302'; g.fillRect(xx + 2, py, pw - 4, 1); g.fillRect(xx, py + 1, pw, 2); g.fillRect(xx + 2, py + 3, pw - 4, 1);
        g.fillStyle = '#9A4A18'; g.fillRect(xx + 3, py + 1, Math.floor(pw * 0.4), 1);
        g.fillStyle = '#5A2A12'; g.fillRect(xx + 3 + Math.floor(pw * 0.4), py + 1, Math.floor(pw * 0.25), 1);
      });
    }
  },
};

const flares = (ctx: G, v: View) => {
  for (const fx of FLARES) pinned(fx, oscarRefinery, v, sx => {
    const y = 95 * PX;
    // (the stack it's on: up from the refinery's ground, guyed, a ladder up it, the tip scorched)
    ctx.fillStyle = '#26160E'; ctx.fillRect(Math.round(sx - 4), y, 8, 225 * PX - y);
    ctx.fillStyle = '#3C2416'; ctx.fillRect(Math.round(sx - 4), y, 2, 225 * PX - y);
    ctx.fillStyle = '#1A0E08'; for (let ly = y + 8; ly < 225 * PX; ly += 6) ctx.fillRect(Math.round(sx + 4), ly, 3, 1);
    ctx.fillStyle = '#4A2E1C'; ctx.fillRect(Math.round(sx - 6), y, 12, 3); ctx.fillStyle = '#0C0705'; ctx.fillRect(Math.round(sx - 5), y - 2, 10, 2);
    ctx.strokeStyle = 'rgba(26, 14, 8, 0.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(sx, y + 40); ctx.lineTo(sx - 46, 225 * PX); ctx.moveTo(sx, y + 40); ctx.lineTo(sx + 46, 225 * PX); ctx.stroke();
    steppedGlow(ctx, sx, y - 20, 70, '#FB923C', 0.35, 0, 5);
    drawFire(ctx, sx, y + 2, 16, 46, v.frame, { seed: fx, glow: 0 });
  });
  // Blinking red aviation lights on the columns
  if (v.frame % 60 < 30) for (let i = 0; i < 6; i++) pinned(40 + i * 100, oscarRefinery, v, sx => { ctx.fillStyle = '#EF4444'; ctx.fillRect(sx, 150 + (i % 3) * 24, 4, 4); });
};
/**
 * Pumpjacks nodding away in the foreground field: dark iron against the dusk, rimmed along their tops by its glow; the
 * beam rocking on its A-frame, the horsehead and the bridle going up and down the well, the crank and its counterweight
 * going round behind, the pitman arm working the beam's tail.
 */
const pumpjacks = (ctx: G, v: View) => {
  const BODY = '#241710', RIM = '#5A3220', MID = '#30201A', DARK = '#120A06';
  for (const px of PUMPJACKS) pinned(px, oscarField, v, sx0 => {
    const sx = Math.round(sx0 / 2) * 2, base = 268 * PX, th = v.frame * 0.05 + px, a = Math.sin(th) * 0.35;
    // (the skid it's all bolted to)
    ctx.fillStyle = BODY; ctx.fillRect(sx - 30, base - 8, 70, 8);
    ctx.fillStyle = MID; ctx.fillRect(sx - 30, base - 8, 70, 2); ctx.fillStyle = DARK; ctx.fillRect(sx - 30, base - 2, 70, 2);
    // (the A-frame: the back leg in shadow, the front one rimmed down its edge; stepped, a pixel row at a time)
    for (const [dx, col, rim] of [[12, DARK, null], [-12, BODY, RIM]] as const) {
      for (let y = base - 60; y < base - 8; y += 2) { const k = (y - (base - 60)) / 52, x = Math.round((sx + dx * k - 2) / 2) * 2; ctx.fillStyle = col; ctx.fillRect(x, y, 4, 2); if (rim) { ctx.fillStyle = rim; ctx.fillRect(x, y, 2, 2); } }
    }
    // (the crank going round behind the gearbox, its counterweight swinging, the pitman arm up to the beam's tail)
    const cx = sx + 37, cy = base - 22, pin = { x: cx + Math.cos(th) * 9, y: cy + Math.sin(th) * 9 };
    ctx.fillStyle = MID; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, 13, th - 0.9 + Math.PI, th + 0.9 + Math.PI); ctx.closePath(); ctx.fill();
    ctx.fillStyle = RIM; ctx.beginPath(); ctx.arc(cx, cy, 13, th - 0.9 + Math.PI, th - 0.3 + Math.PI); ctx.lineTo(cx, cy); ctx.fill();
    const tail = { x: sx + Math.cos(a) * 40, y: base - 60 + Math.sin(a) * 40 };
    ctx.strokeStyle = BODY; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(tail.x, tail.y); ctx.lineTo(pin.x, pin.y); ctx.stroke();
    ctx.fillStyle = BODY; ctx.fillRect(sx + 30, base - 30, 14, 22);
    ctx.fillStyle = RIM; ctx.fillRect(sx + 30, base - 30, 14, 2); ctx.fillRect(sx + 30, base - 30, 2, 22);
    ctx.fillStyle = DARK; ctx.fillRect(sx + 42, base - 28, 2, 20);
    // (the walking beam: rimmed along its top, dark under, the horsehead on its nose rimmed round its curve)
    ctx.save(); ctx.translate(sx, base - 60); ctx.rotate(a);
    ctx.fillStyle = BODY; ctx.fillRect(-56, -5, 100, 9);
    ctx.fillStyle = RIM; ctx.fillRect(-56, -5, 100, 2); ctx.fillStyle = DARK; ctx.fillRect(-56, 2, 100, 2);
    ctx.fillStyle = BODY; ctx.beginPath(); ctx.moveTo(-52, -10); ctx.lineTo(-60, -10); ctx.quadraticCurveTo(-70, 6, -64, 26); ctx.lineTo(-54, 26); ctx.lineTo(-52, -10); ctx.fill();
    ctx.strokeStyle = RIM; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-52, -9); ctx.lineTo(-60, -9); ctx.quadraticCurveTo(-69, 6, -63, 25); ctx.stroke();
    ctx.fillStyle = MID; ctx.fillRect(-4, -8, 8, 6); ctx.fillStyle = RIM; ctx.fillRect(-4, -8, 8, 2);
    ctx.restore();
    // (the bridle down the well: two cables and the carrier bar, the polished rod, the wellhead at its foot)
    const hx = Math.round(sx - Math.cos(a) * 64), hy = base - 60 - Math.sin(a) * 64;
    const rodTop = Math.round(hy + 26);
    ctx.fillStyle = DARK; ctx.fillRect(hx - 2, rodTop, 1, Math.max(0, base - 26 - rodTop)); ctx.fillRect(hx + 2, rodTop, 1, Math.max(0, base - 26 - rodTop));
    ctx.fillStyle = MID; ctx.fillRect(hx - 4, Math.min(base - 26, rodTop + 14), 9, 2);
    ctx.fillStyle = '#6B4A30'; ctx.fillRect(hx, Math.min(base - 26, rodTop + 14), 1, Math.max(0, base - 10 - Math.min(base - 26, rodTop + 14)));
    ctx.fillStyle = BODY; ctx.fillRect(hx - 5, base - 14, 11, 6); ctx.fillStyle = RIM; ctx.fillRect(hx - 5, base - 14, 11, 2);
  });
};

/**
 * The field going up (when the stage says it is: v.burn): fires stood on each layer's own ground, pinned to it so they
 * go by with it, smaller and dimmer the farther back; each on a heap of black wreck, its light on the ground round it,
 * its smoke going up. Between the layers, so the nearer ones stand in front of them.
 */
const fieldFires = (spec: LayerSpec, ground: number, xs: number[], scale: number) => (ctx: G, v: View) => {
  const k = v.burn ?? 0;
  if (k <= 0) return;
  xs.forEach((tx, i) => {
    // (more of them going the more of it's burning)
    if (i / xs.length > k + 0.15) return;
    pinned(tx, spec, v, sx => {
      const y = ground * PX, w = (34 + (i % 3) * 14) * scale, h = (30 + ((i * 7) % 4) * 10) * scale;
      steppedGlow(ctx, sx, y - h * 0.2, w * 1.3, '#FB923C', 0.3 * k, 0, 4);
      // (the wreck it's burning on: a black heap, twisted bits of it sticking up)
      pixelBlob(ctx, sx - w * 0.1, y, w * 0.3, 4 * scale, '#0C0705'); pixelBlob(ctx, sx + w * 0.18, y, w * 0.2, 3 * scale, '#0C0705');
      ctx.fillStyle = '#0C0705'; ctx.fillRect(Math.round(sx - w * 0.25), Math.round(y - 12 * scale), Math.max(2, Math.round(3 * scale)), Math.round(12 * scale)); ctx.fillRect(Math.round(sx + w * 0.15), Math.round(y - 8 * scale), Math.max(2, Math.round(2 * scale)), Math.round(8 * scale));
      drawFire(ctx, sx, y + 1, w, h, v.frame, { seed: tx + i * 7, glow: 0, sparks: scale > 0.7, k: Math.min(1, 0.5 + k) });
      // (its smoke, leaning off with the wind, going up into the pall)
      for (let s = 0; s < 3; s++) { const q = ((v.frame * 0.5 + s * 40 + i * 17) % 120) / 120; pixelBlob(ctx, sx + q * 40 * scale, y - h - q * 200 * scale, (10 + q * 34) * scale, (8 + q * 26) * scale, `rgba(28, 25, 23, ${(0.55 * k * (1 - q * 0.6)).toFixed(3)})`, 4); }
    });
  });
};

const oscar: Backdrop = {
  layers: [
    sky('oscar-sky', ['#140A08', '#2E160E', '#5A2A12', '#9A4A18', '#D07A2A', '#E9AC52'], 16),
    oscarRefinery,
    flares,
    fieldFires(oscarRefinery, 225, [60, 210, 330, 420, 560], 0.45),
    oscarTanks,
    fieldFires(oscarTanks, 250, [30, 170, 290, 400, 520, 610], 0.6),
    oscarField,
    pumpjacks,
  ],
  front: (ctx, v) => {
    ctx.fillStyle = 'rgba(90, 50, 20, 0.12)';
    for (let i = 0; i < 4; i++) ctx.fillRect(0, 380 + i * 40 + Math.sin(v.frame * 0.02 + i) * 8, W, 30);
    weather(ctx, v, { count: 20, seed: 7, size: 3, speedY: 0.4, speedX: -0.5, parallax: 0.9, color: 'rgba(40, 30, 25, 0.5)', wobble: 5 });
  },
};

// ===========================================================================
// 8. DRUG TRADE DALE: Albuquerque. Desert twilight, mesas, balloons and a certain RV.
// ===========================================================================

const daleSandias: LayerSpec = {
  key: 'dale-sandias', parallax: 0.05,
  paint: (g, w, h) => {
    const ridge = makeRidge(201, w, 205, 55, 0.035);
    // The range in the last of the sun (it's setting off to the left): the flanks facing it watermelon pink, a glow
    // along the crest, the flanks turned away in shadow, a band of cliffs under the crest, gullies down it
    const BODY = '#7A3E5E', LIT = '#9A4B6A', SHADE = '#6A3552', GLOW = '#C0617A';
    for (let x = 0; x < w; x++) {
      const y = Math.floor(ridge(x)), slope = (ridge(x + 8) - ridge(x - 8)) / 2.6;
      g.fillStyle = BODY; g.fillRect(x, y, 1, h - y);
      // (lit flanks a band of pink under a glowing crest; the others a band of shade under a dull one; each dithered off
      // into the body)
      const lit = slope < -0.5, d = lit ? Math.min(30, 12 + Math.floor(-slope * 4)) : 16;
      g.fillStyle = lit ? LIT : SHADE; g.fillRect(x, y, 1, d);
      if ((x + y) % 2) g.fillRect(x, y + d, 1, 2);
      if ((x + y) % 2 === 0) g.fillRect(x, y + d + 3, 1, 1);
      g.fillStyle = lit ? GLOW : LIT; g.fillRect(x, y, 1, lit ? 2 : 1);
    }
    // Gullies down the lit flanks: dark grooves slanting down the slope, a lit lip beside each, every few columns
    for (let x = 0; x < w; x += 7) {
      const y = ridge(x), slope = (ridge(x + 8) - ridge(x - 8)) / 2.6;
      if (y > 196 || slope > -0.5 || hash(x * 0.37) < 0.35) continue;
      const len = 8 + Math.floor(hash(x) * 14), dir = slope < 0 ? -1 : 1;
      for (let k = 0; k < len; k++) {
        const xx = (((x + Math.round(k * 0.35 * dir)) % w) + w) % w, yy = Math.floor(y + 5 + k);
        g.fillStyle = SHADE; g.fillRect(xx, yy, 1, 1);
        if (k % 2 === 0) { g.fillStyle = GLOW; g.fillRect((xx + w - dir) % w, yy, 1, 1); }
      }
    }
    // (the dusk's haze over the valley at their feet)
    hazeBands(g, 0, 190, w, 50, '#E0666A', 0, 0.45, 5, 1);
  },
};
const daleMesas: LayerSpec = {
  key: 'dale-mesas', parallax: 0.16,
  paint: (g, w, h) => {
    bandedGradient(g, 0, 238, w, h - 238, ['#4E2A3B', '#462436', '#3E2030'], 3, 1);
    const r = rng(210);
    // The mesas: flat caprock over cliffs in strata, the face turned to the sunset lit, the other in shadow, the cliffs
    // fluted by erosion, a fan of scree down round their feet
    const CAP = '#8A4A4F', CAP_SHADE = '#5E3442', FACE = '#5E3444', LIT = '#7A4452', SHADE = '#43233A', DEEP = '#331A2A', STRATA = '#4E2A3B';
    for (let x = 0; x < w; x += 80 + Math.floor(r() * 80)) {
      const mw = 50 + r() * 70, mh = 25 + r() * 30;
      wrapDraw(w, x, mw + 20, xx => {
        const x0 = Math.floor(xx), top = Math.floor(240 - mh), capL = x0 + 12, capR = Math.floor(xx + 12 + mw);
        for (let c = x0; c < x0 + mw + 24; c++) {
          // (the slope at each end: the left one sunlit, the right one shadowed; the face in between)
          const yTop = c < capL ? Math.floor(240 - mh * ((c - x0) / 12)) : c > capR ? Math.floor(240 - mh * (1 - (c - capR) / 12)) : top;
          if (yTop >= 240) continue;
          const col = c < capL + 3 ? LIT : c > capR - 4 ? SHADE : FACE;
          g.fillStyle = col; g.fillRect(c, yTop, 1, 240 - yTop);
          // (the lower cliffs a step darker, dithered into the upper)
          const low = top + Math.floor(mh * 0.55);
          if (low > yTop) { g.fillStyle = c > capR - 4 ? DEEP : c < capL + 3 ? FACE : STRATA; g.fillRect(c, low + 2, 1, 240 - low - 2); if (c % 2) g.fillRect(c, low, 1, 2); }
          // (strata across the face, every few rows, broken up by the flutes)
          g.fillStyle = c > capR - 4 ? DEEP : c < capL + 3 ? FACE : SHADE;
          for (let s = 6; s < mh; s += 7) { const sy = top + s + ((c >> 3) % 2); if (sy > yTop + 1 && (c + s) % 9 > 1) g.fillRect(c, sy, 1, 1); }
          // (flutes: vertical grooves down the cliff)
          if (c > capL + 3 && c < capR - 4 && hash(c * 1.7 + x) > 0.86) { g.fillStyle = SHADE; g.fillRect(c, top + 3, 1, Math.floor(mh * (0.4 + hash(c) * 0.4))); }
        }
        // (the caprock: a lit band, its underside dark, overhanging a pixel)
        g.fillStyle = CAP_SHADE; g.fillRect(capL - 1, top + 2, capR - capL + 2, 2);
        g.fillStyle = CAP; g.fillRect(capL - 1, top, capR - capL + 2, 2);
        // (the scree fan: dithered lighter rubble round its foot)
        checker(g, x0 + 4, 236, mw + 16, 2, LIT, 0, 1); checker(g, x0, 238, mw + 24, 2, FACE, 1, 1);
      });
    }
    hazeBands(g, 0, 224, w, 18, '#A8406E', 0, 0.3, 3, 1);
  },
};
const RV_X = 360;
/** Desert plants in silhouette, rimmed by the last of the light from the left: saguaros, chollas, yuccas, creosote. */
const desertPlant = (g: G, x: number, base: number, hh: number, kind: number, dark: string, rim: string) => {
  const col = (cx: number, cy: number, cw: number, ch: number) => { g.fillStyle = dark; g.fillRect(cx, cy + 1, cw, ch - 1); g.fillRect(cx + 1, cy, cw - 2, 1); g.fillStyle = rim; g.fillRect(cx, cy + 1, 1, ch - 1); };
  if (kind === 0) {
    // (a saguaro: a fat trunk, an arm or two crooked up off it)
    col(x, base - hh, 3, hh);
    const a1 = Math.floor(hh * 0.45), a2 = Math.floor(hh * 0.6);
    g.fillStyle = dark; g.fillRect(x - 4, base - a1, 4, 2); col(x - 5, base - a1 - 6, 2, 8);
    if (hh > 14) { g.fillStyle = dark; g.fillRect(x + 3, base - a2, 3, 2); col(x + 5, base - a2 - 5, 2, 7); }
  } else if (kind === 1) {
    // (a yucca: a spray of spikes off a short stem, a flower stalk up out of it)
    g.fillStyle = dark; g.fillRect(x, base - 3, 2, 3);
    for (let k = -3; k <= 3; k++) { const len = 5 - Math.abs(k) * 0.5; for (let s = 0; s < len; s++) g.fillRect(x + Math.round(k * s * 0.45), base - 3 - s, 1, 1); }
    g.fillStyle = rim; g.fillRect(x - 2, base - 6, 1, 1); g.fillRect(x, base - 8, 1, 1);
    g.fillStyle = dark; g.fillRect(x + 1, base - hh, 1, hh - 6); g.fillStyle = rim; for (let s = 0; s < 4; s++) g.fillRect(x + 1 + (s % 2 ? 1 : -1), base - hh + s * 2, 1, 1);
  } else if (kind === 2) {
    // (a cholla: a knotted little tree of short joints)
    col(x, base - hh * 0.6, 2, hh * 0.6);
    for (const [dx, dy, l] of [[-3, 0.55, 4], [2, 0.7, 5], [-2, 0.85, 3]] as const) { g.fillStyle = dark; g.fillRect(x + (dx < 0 ? dx : 2), Math.floor(base - hh * dy), Math.abs(dx), 1); col(x + dx, Math.floor(base - hh * dy - l), 2, l); }
  } else {
    // (creosote: a low clump, lumpy along its top)
    for (let k = 0; k < 8; k++) { const ch = 2 + Math.round(Math.sin(k * 1.3) * 1.5 + 2); g.fillStyle = dark; g.fillRect(x - 4 + k, base - ch, 1, ch); g.fillStyle = rim; if (k < 4) g.fillRect(x - 4 + k, base - ch, 1, 1); }
  }
};
const daleDesert: LayerSpec = {
  key: 'dale-desert', parallax: 0.36,
  paint: (g, w, h) => {
    g.fillStyle = '#2A1620'; g.fillRect(0, 258, w, h - 258);
    bandedGradient(g, 0, 258, w, 44, ['#5B3140', '#4A2834', '#3A1F2A', '#2A1620'], 6, 1);
    const r = rng(220);
    // (pebbles and the odd tuft across the flats)
    const pr = rng(221);
    for (let i = 0; i < 120; i++) { const y = 262 + Math.floor(pr() * pr() * 36); g.fillStyle = pr() > 0.5 ? '#6A3A4A' : '#24121A'; g.fillRect(Math.floor(pr() * w), y, 1 + Math.floor(pr() * 2), 1); }
    // Saguaros, yuccas, chollas, creosote
    for (let x = 10; x < w; x += 25 + Math.floor(r() * 40)) {
      const hh = 8 + r() * 16;
      const kind = Math.floor(hash(x * 0.71) * 4);
      r(); r();
      wrapDraw(w, x, 12, xx => desertPlant(g, Math.floor(xx), 262, Math.floor(hh) + 4, kind, '#1A0E14', '#7E4256'));
    }
    // The RV, parked in the middle of nowhere: cream and brown, lit along its roof by the sunset, its windows catching
    // the sky, a door, the awning rolled up, its shadow on the sand under it
    g.fillStyle = 'rgba(20, 8, 14, 0.5)'; g.fillRect(RV_X - 2, 260, 48, 3);
    g.fillStyle = '#E8DCC2'; g.fillRect(RV_X, 244, 42, 16);
    g.fillStyle = '#F6EEDB'; g.fillRect(RV_X, 244, 42, 1); g.fillRect(RV_X, 244, 1, 15);
    g.fillStyle = '#C9B99A'; g.fillRect(RV_X + 41, 245, 1, 15); g.fillRect(RV_X + 1, 252, 40, 2);
    g.fillStyle = '#7C5A3A'; g.fillRect(RV_X, 256, 42, 2); g.fillStyle = '#5A3E26'; g.fillRect(RV_X, 258, 42, 1);
    // (the cab's nose, the awning rolled along the side)
    g.fillStyle = '#D8CAAD'; g.fillRect(RV_X + 36, 241, 6, 3); g.fillStyle = '#B9A889'; g.fillRect(RV_X + 4, 245, 26, 1);
    for (const [wx, ww] of [[RV_X + 30, 10], [RV_X + 6, 7], [RV_X + 16, 7]] as const) {
      g.fillStyle = '#2A3A4A'; g.fillRect(wx, 246, ww, ww > 8 ? 5 : 4);
      g.fillStyle = '#E0666A'; g.fillRect(wx, 246, ww, 1); g.fillStyle = '#F4A261'; g.fillRect(wx, 246, 2, 1);
    }
    g.fillStyle = '#B9A889'; g.fillRect(RV_X + 25, 247, 4, 10); g.fillStyle = '#7C5A3A'; g.fillRect(RV_X + 28, 252, 1, 1);
    for (const wx of [RV_X + 6, RV_X + 30]) { g.fillStyle = '#111111'; g.fillRect(wx, 258, 6, 5); g.fillRect(wx + 1, 257, 4, 1); g.fillStyle = '#6B6B6B'; g.fillRect(wx + 2, 259, 2, 2); }
  },
};
/** Albuquerque's hot air balloons, drifting slowly across the sky. */
const balloons = (ctx: G, v: View) => {
  const stripes = [['#EF4444', '#FDE047'], ['#3B82F6', '#F8FAFC'], ['#22C55E', '#F97316'], ['#A855F7', '#FDE047'], ['#F43F5E', '#38BDF8']];
  for (let i = 0; i < 5; i++) {
    const x = ((hash(i + 40) * (W + 200) + v.frame * (0.15 + i * 0.05) - v.camX * (0.08 + i * 0.02)) % (W + 200) + W + 200) % (W + 200) - 100;
    const y = 70 + hash(i + 41) * 150 + Math.sin(v.frame * 0.02 + i) * 8;
    const r = 12 + i * 3;
    const [a, b] = stripes[i];
    // The envelope, with vertical gores in two colours and a shaded side
    ctx.save();
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 1.15, 0, 0, Math.PI * 2);
    ctx.moveTo(x - r * 0.75, y + r * 0.7); ctx.lineTo(x, y + r * 1.4); ctx.lineTo(x + r * 0.75, y + r * 0.7);
    ctx.clip();
    for (let s = -3; s <= 3; s++) { ctx.fillStyle = (s + 3) % 2 ? a : b; ctx.fillRect(x + s * r * 0.3 - r * 0.15, y - r * 1.3, r * 0.3 + 1, r * 3); }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'; ctx.fillRect(x + r * 0.35, y - r * 1.3, r, r * 3);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'; ctx.fillRect(x - r * 0.7, y - r * 0.8, r * 0.25, r * 0.9);
    ctx.restore();
    ctx.fillStyle = '#5B3A1E'; ctx.fillRect(Math.round(x - 4), Math.round(y + r * 1.4), 8, 6);
    ctx.fillStyle = '#2A1A0E'; ctx.fillRect(Math.round(x - 4), Math.round(y + r * 1.05), 1, Math.round(r * 0.4)); ctx.fillRect(Math.round(x + 3), Math.round(y + r * 1.05), 1, Math.round(r * 0.4));
    if ((v.frame + i * 40) % 160 < 12) { ctx.fillStyle = '#FDE047'; ctx.fillRect(Math.round(x - 2), Math.round(y + r * 1.1), 4, 5); } // burner
  }
};
const dale: Backdrop = {
  layers: [
    sky('dale-sky', ['#140C2E', '#2E1A55', '#5C2A6E', '#A8406E', '#E0666A', '#F4A261', '#F9D28B'], 18),
    balloons,
    daleSandias,
    daleMesas,
    daleDesert,
  ],
};

export const STAGE_BACKDROPS: Record<string, Backdrop> = {
  'Artie Avalanche': artie,
  'Victor Volcano': victor,
  'Ernie Earthquake': ernie,
  'Hector Hurricane': hector,
  // (not a stage: the sunny beach Hector's stage starts on, before his storm rolls in)
  'Hector Sunny': hectorSunny,
  'Hector After': hectorAfter,
  'Toxic Tommy': tommy,
  'Blackout Barry': barry,
  'Oily Oscar': oscar,
  'Drug Trade Dale': dale,
};
