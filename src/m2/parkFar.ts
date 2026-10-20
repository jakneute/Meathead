// The park on the horizon, as seen from inside a land: the neighboring lands' landmarks small and hazed past the
// trees, each painted by its own land's painter (so they can't drift from how the land itself has them now): Fairy
// Land's Great Pixie's castle on its crag (fantasy/monument.ts), Future Land's SPACE NEEDLE 2 (its shaft going on up
// into the sky) and the GIANT ATOM (space/square/sky.ts), the Wilderness's real Rockies (frontier/wilds/far.ts),
// Cartoon Land's water tower (cartoon/monument.ts), the ELEVATOR TO HELL's clock tower (walkAway/spookyTown.ts),
// THRONES OF THE STARS (hollywood/blvd/far.ts), the World Showcase's castle on its hill (foreign/backdrop.ts).
//
// Each's painted big into a canvas of its own and brought down to its far size in one go (an even average: no crawl,
// no seams), then washed toward the hour's haze. All of it's for painting into a backdrop's stamp (once an hour), never
// live. No volcanoes.

import { timeOfDay, skyAt, farTint, type TimeOfDay } from './timeOfDay';
import { mix, hash, box, checker, pixelBlob } from './intro/art/kit';
import { drawCastleAt } from './fantasy/monument';
import { drawNeedle, drawGiantAtom } from './space/square/sky';
import { paintRockies, MH as ROCKIES_H } from './frontier/wilds/far';
import { drawTowerAt } from './cartoon/monument';
import { drawTowerIntact } from './walkAway/spookyTown';
import { farCoaster, farCol } from './hollywood/blvd/far';
import { FAR_STILLS } from './foreign/backdrop';

type Ctx = CanvasRenderingContext2D;

const canvasOf = (w: number, h: number) => { const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.ceil(w)); cv.height = Math.max(1, Math.ceil(h)); return cv; };

/**
 * Something painted at its own size (`sw` × `sh`, by `paint` into a fresh canvas) and put down into `g` at (dx, dy),
 * `dw` × `dh`: brought down smoothed (an even average), then washed `k` of the way to `haze` (only where it's painted).
 */
export const shrunk = (g: Ctx, sw: number, sh: number, paint: (o: Ctx) => void, dx: number, dy: number, dw: number, dh: number, haze: string, k: number, fadeTop = 0) => {
  if (typeof document === 'undefined') return;
  const big = canvasOf(sw, sh), bg = big.getContext('2d')!;
  bg.imageSmoothingEnabled = false;
  paint(bg);
  // (down in halves first, each an even average: no single big jump that skips pixels)
  let src: HTMLCanvasElement = big, w = sw, h = sh;
  while (w / 2 > dw * 1.5 && h / 2 > dh * 1.5) {
    const half = canvasOf(w / 2, h / 2), hg = half.getContext('2d')!;
    hg.imageSmoothingEnabled = true; hg.imageSmoothingQuality = 'high';
    hg.drawImage(src, 0, 0, Math.ceil(w), Math.ceil(h), 0, 0, half.width, half.height);
    src = half; w = half.width; h = half.height;
  }
  const out = canvasOf(dw, dh), og = out.getContext('2d')!;
  og.imageSmoothingEnabled = true; og.imageSmoothingQuality = 'high';
  og.drawImage(src, 0, 0, src.width, src.height, 0, 0, out.width, out.height);
  if (k > 0) { og.globalCompositeOperation = 'source-atop'; og.globalAlpha = k; og.fillStyle = haze; og.fillRect(0, 0, out.width, out.height); }
  // (its top going off into the sky: in bands, each a step fainter, up to nothing)
  if (fadeTop > 0) {
    og.globalCompositeOperation = 'destination-out'; og.fillStyle = '#000';
    const n = 6, bh = Math.ceil(fadeTop / n);
    for (let i = 0; i < n; i++) { og.globalAlpha = 1 - i / n; og.fillRect(0, i * bh, out.width, bh); }
  }
  g.drawImage(out, Math.round(dx), Math.round(dy), out.width, out.height);
};

/** What can stand on a land's horizon. */
export type FarMark = 'fairyCastle' | 'needle' | 'atom' | 'rockies' | 'cartoonTower' | 'clockTower' | 'thrones' | 'showcase';

/**
 * A neighboring land's landmark, its foot's middle at (x, foot), `h` px tall (about), washed `k` toward the hour's haze.
 * (The needle's shaft goes on up out of the top of whatever it's in: it's an elevator to space.)
 */
export const farMark = (g: Ctx, id: FarMark, x: number, foot: number, h: number, k = 0.4, tod: TimeOfDay = timeOfDay()) => {
  const haze = skyAt(0.86, tod);
  switch (id) {
    case 'fairyCastle': { // (its crag and all: 360 × 476 at full size)
      const s = h / 476;
      shrunk(g, 360, 476, o => drawCastleAt(o, 180, 470, 1, 0), x - 180 * s, foot - 470 * s, 360 * s, 476 * s, haze, k);
      break;
    }
    case 'needle': { // (drawn at half size: 200 wide, the shaft up to the top)
      const s = h / 260;
      shrunk(g, 200, 520, o => drawNeedle(o, 100, 516, 0.6, 0, 2), x - 100 * s, foot - 516 * s, 200 * s, 520 * s, haze, k, 200 * s);
      break;
    }
    case 'atom': {
      // (at half size: its rings 210 across, the ball 70 down, the fins' feet at 242)
      const s = h / 250;
      shrunk(g, 240, 250, o => drawGiantAtom(o, 120, 70, 0.5, 0), x - 120 * s, foot - 244 * s, 240 * s, 250 * s, haze, k);
      break;
    }
    case 'rockies': { // (a stretch of the real range: h tall, 4.4 h wide)
      const s = h / ROCKIES_H;
      shrunk(g, 1024, ROCKIES_H, o => paintRockies(o, tod), x - 512 * s, foot - ROCKIES_H * s, 1024 * s, ROCKIES_H * s, haze, k);
      break;
    }
    case 'cartoonTower': {
      const s = h / 280;
      shrunk(g, 170, 290, o => drawTowerAt(o, 85, 280, 1, 0), x - 85 * s, foot - 280 * s, 170 * s, 290 * s, haze, k);
      break;
    }
    case 'clockTower': { // (painted at its far size by its own pen: it's pixel-snapped at any size)
      const ts = h / 474, w = 170 * ts;
      const o = canvasOf(w + 4, h + 4), og = o.getContext('2d')!;
      drawTowerIntact(og, Math.round(76 * ts) + 2, Math.round(h) + 2, ts, 0);
      if (k > 0) { og.globalCompositeOperation = 'source-atop'; og.globalAlpha = k; og.fillStyle = haze; og.fillRect(0, 0, o.width, o.height); }
      g.drawImage(o, Math.round(x - 76 * ts - 2), Math.round(foot - h - 2));
      break;
    }
    case 'thrones': {
      const s = h / 260;
      shrunk(g, 700, 300, o => farCoaster(o, 350, 290, 0.9, farCol(tod, 0.2)('#B91C1C')), x - 350 * s, foot - 290 * s, 700 * s, 300 * s, haze, k);
      break;
    }
    case 'showcase': { // (Germany's castle on its hill, the Alps behind)
      const S = FAR_STILLS.germany;
      if (!S) break;
      const s = h / S.h;
      shrunk(g, S.w, S.h, o => S.paint(o, farCol(tod, S.k * 0.5), tod), x - (S.w / 2) * s, foot - S.h * s, S.w * s, S.h * s, haze, k);
      break;
    }
  }
};

/** The park's own trees along the feet of whatever's on its horizon (x0..x1, their tops about `top`): crowns in steps,
 *  lit up their left, so nothing stands on air. `col` their color for the hour, hazed. */
export const farTreeline = (g: Ctx, x0: number, x1: number, top: number, col: string, seed = 0) => {
  const R = [mix(col, '#0A140C', 0.3), col, mix(col, '#E8F0D8', 0.16), mix(col, '#FFFFFF', 0.3)];
  box(g, x0, top + 6, x1 - x0, 10, R[0]);
  for (let x = x0; x < x1; x += 6) {
    const hh = 5 + hash(x * 0.17 + seed) * 7;
    pixelBlob(g, x + 3, top + 8 - hh * 0.4, 6, hh * 0.6, R[1]);
    pixelBlob(g, x + 1, top + 7 - hh * 0.55, 3, hh * 0.3, R[2]);
  }
  checker(g, x0, top + 14, x1 - x0, 2, R[0]);
};

/** The park's lit-up things after dark want a lamp color that reads through the haze. */
export const farLamp = (tod: TimeOfDay) => mix(farTint('#FFD27A', 0.4, tod), '#FFF0C0', 0.3);
