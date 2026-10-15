// Adventure Land's far scenery kit: what the outdoor backdrops' far layers are painted with (the jungle's, the queue's
// and the river's, the dino park's, the temple roof's view, the clearing's), so they all come out of a piece. The look
// is Spooky Land's far pass's: ridges snapped to the art's 2 px grid, their flanks lit up the left (a band and a row of
// dither under it), shaded down the right; rock seams; jungle in stepped crowns (shade, body, lit, a highlight);
// palms in banded trunks and drooping fronds; mist over what's painted only (never over the clear sky), in bands.
// Everything here's painted into tiles `tw` wide that meet round the tile (waves in whole cycles across it, anything
// near an edge painted again a tile over), once per hour (a stamp), and slid along. Nothing here is lit along a top:
// none of it's to stand on.

import { type Ctx, box, mix, hash, checker, hazeBands, pixelBlob } from '../intro/art/kit';

export { type Ctx, box, mix, hash, checker, hazeBands, pixelBlob };

/** Snapped to the art's 2 px grid. */
export const snap2 = (v: number) => Math.round(v / 2) * 2;
/** A wave round a tile `tw` wide (whole cycles across it, so its ends meet): -1..1. `n` more cycles for a busier one. */
export const wave = (x: number, tw: number, seed: number, n = 1) => {
  const a = (x / tw) * Math.PI * 2;
  return Math.sin(a * 3 * n + seed) * 0.5 + Math.sin(a * 7 * n + seed * 2.3) * 0.3 + Math.sin(a * 17 * n + seed * 4.1) * 0.2;
};
/** A jag (-0.5..0.5), in steps of `step` px, the same either end of the tile. */
export const jag = (x: number, tw: number, step: number, seed: number) => hash(Math.floor((((x % tw) + tw) % tw) / step) + seed) - 0.5;
/** Something at tile x, and again a tile either side if it's near an edge (so what's cut off one end carries on at the other). */
export const wrapAt = (tw: number, x: number, draw: (x: number) => void, reach = 260) => { draw(x); if (x < reach) draw(x + tw); if (x > tw - reach) draw(x - tw); };

/** A polygon, filled. */
export const poly = (g: Ctx, pts: [number, number][], col: string) => {
  g.fillStyle = col; g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath(); g.fill();
};
/** Fills under a ridge line (sampled every `step` px, stepped) down to `bottom`. */
export const fillUnder = (g: Ctx, tw: number, yAt: (x: number) => number, bottom: number, col: string, step = 4) => {
  g.fillStyle = col; g.beginPath(); g.moveTo(0, bottom);
  for (let x = 0; x <= tw; x += step) { g.lineTo(x, yAt(x)); g.lineTo(x + step, yAt(x)); }
  g.lineTo(tw, bottom); g.closePath(); g.fill();
};
/** A ridge's flanks: those facing the light (rising to the right: the upper left lit) a band of `lit` under the line and
 *  a row of dither under that; those facing away a deeper band of `shade`, dithered off. */
export const flanks = (g: Ctx, tw: number, yAt: (x: number) => number, lit: string, shade: string, d: number, step = 4) => {
  for (let x = 0; x < tw; x += step) {
    const y = yAt(x), yn = yAt(x + step);
    if (yn < y) { box(g, x, y, step, d * 0.5, lit); checker(g, x, y + d * 0.5, step, 2, lit); }
    else if (yn > y) { box(g, x, y + 2, step, d, shade); checker(g, x, y + 2 + d, step, 2, shade, 1); }
  }
};
/** Haze over what's painted (none on the clear sky round it): in bands, dithered between. */
export const mist = (g: Ctx, tw: number, y: number, h: number, col: string, a0: number, a1: number, n: number) => {
  g.save(); g.globalCompositeOperation = 'source-atop'; hazeBands(g, 0, y, tw, h, col, a0, a1, n); g.restore();
};
/** Bands going down a layer (each darker, its top dithered up into the one over it), from y, every `step` px. */
export const banded = (g: Ctx, tw: number, y: number, step: number, cols: string[], bottom: number) => {
  cols.forEach((col, i) => {
    const yy = y + i * step;
    if (yy >= bottom) return;
    g.save(); g.globalCompositeOperation = 'source-atop';
    box(g, 0, yy, tw, bottom - yy, col); checker(g, 0, yy - 2, tw, 2, col, i % 2);
    g.restore();
  });
};

// ---------------------------------------------------------------------------------------------------------------
// Ranges

export interface RangeLook { body: string; lit: string; hi: string; shade: string; deep: string }
/**
 * A mountain range along `yAt`: its body down to `bottom`, the flanks facing the light lit (and the crests catching it
 * brighter), those facing away in shade; gullies streaked down from the peaks; jungle creeping up its lower slopes
 * (`forest`: its color, or none) in stepped lumps.
 */
export const range = (g: Ctx, tw: number, yAt: (x: number) => number, bottom: number, L: RangeLook, seed: number, opts: { gullies?: number; d?: number; forest?: [string, string] | null; forestY?: (x: number) => number } = {}) => {
  const d = opts.d ?? 18;
  fillUnder(g, tw, yAt, bottom, L.body);
  flanks(g, tw, yAt, L.lit, L.shade, d);
  // (the crests: a pixel of the brightest along the lit ones)
  for (let x = 0; x < tw; x += 4) { const y = yAt(x), yn = yAt(x + 4); if (yn < y) box(g, x, y, 4, 2, L.hi); }
  // (gullies: streaks of shade down from the peaks, a lit edge on their left)
  const n = opts.gullies ?? 22;
  for (let i = 0; i < n; i++) {
    const x = snap2(i * (tw / n) + hash(seed + i * 3.7) * (tw / n) * 0.6), y = yAt(x), len = 14 + hash(seed + i) * 30;
    for (let k = 0; k < len; k += 2) {
      const gx = x + Math.round(Math.sin(k * 0.2 + i) * 2);
      box(g, gx, y + 6 + k, 2, 2, L.deep);
      if (k % 4 === 0) box(g, gx - 2, y + 6 + k, 2, 2, L.lit);
    }
  }
  // (the jungle up its lower slopes: a ragged edge of lumps, lit at their upper left)
  if (opts.forest) {
    const [fb, fl] = opts.forest, fy = opts.forestY ?? (x => Math.max(yAt(x) + 20, bottom - 40 + wave(x, tw, seed + 9, 2) * 14));
    fillUnder(g, tw, x => snap2(fy(x)) + 4, bottom, fb);
    for (let x = 0; x < tw; x += 8) {
      const y = snap2(fy(x)), r = 5 + hash(seed + x * 0.13) * 4;
      pixelBlob(g, x, y + r * 0.5, r, r * 0.7, fb);
      pixelBlob(g, x - 2, y + r * 0.3, r * 0.55, r * 0.4, fl);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Jungle

/** A crown of jungle (a clump of canopy): stepped, darkest at the lower right, lit at the upper left, a highlight. */
export const crown = (g: Ctx, x: number, y: number, r: number, R: string[]) => {
  pixelBlob(g, x + r * 0.15, y + r * 0.12, r, r * 0.8, R[0]);
  pixelBlob(g, x, y, r * 0.92, r * 0.72, R[1]);
  pixelBlob(g, x - r * 0.2, y - r * 0.18, r * 0.62, r * 0.46, R[2]);
  if (r > 7) pixelBlob(g, x - r * 0.34, y - r * 0.32, r * 0.3, r * 0.2, R[3]);
};
/**
 * The canopy along a line: crowns shoulder to shoulder along `yAt` (the bumpy top), filled solid under, the hollows
 * between them in shade going down (banded). `R`: shade, body, lit, highlight.
 */
export const canopy = (g: Ctx, tw: number, yAt: (x: number) => number, bottom: number, R: string[], r: number, seed: number) => {
  fillUnder(g, tw, x => snap2(yAt(x) + r * 0.6), bottom, R[0]);
  const step = r * 1.15;
  const n = Math.round(tw / step);
  for (let i = 0; i < n; i++) {
    const x = (i * tw) / n + (hash(seed + i * 1.7) - 0.5) * r * 0.5, s = 0.75 + hash(seed + i * 2.9) * 0.5;
    wrapAt(tw, x, xx => crown(g, xx, yAt(xx) + r * 0.4, r * s, R), r * 2);
  }
  // (a second row lower down, in the shade of the first: the canopy's depth)
  for (let i = 0; i < n; i++) {
    const x = ((i + 0.5) * tw) / n + (hash(seed + i * 4.3) - 0.5) * r * 0.6;
    wrapAt(tw, x, xx => { const y = yAt(xx) + r * 1.5; pixelBlob(g, xx, y, r * 0.8, r * 0.5, R[1]); pixelBlob(g, xx - r * 0.2, y - r * 0.15, r * 0.45, r * 0.3, R[2]); }, r * 2);
  }
};
/** A palm: its trunk in rings (lit down the left), leaning; its fronds drooping off the top, each a spine of leaflets,
 *  lit along the upper ones. `T`: the trunk's [shade, lit]; `F`: the fronds' [shade, body, lit]. */
export const palm = (g: Ctx, x: number, foot: number, h: number, lean: number, T: [string, string], F: [string, string, string], seed = 0) => {
  const w = h > 60 ? 4 : 2;
  for (let k = 0; k < h; k += 2) {
    const t = k / h, px = Math.round(x + lean * t * t);
    box(g, px, foot - k - 2, w, 2, (k >> 1) % 3 === 0 ? T[0] : T[1]);
    if (w > 2) box(g, px + w - 1, foot - k - 2, 1, 2, T[0]);
  }
  const tx = Math.round(x + lean) + w / 2, ty = foot - h;
  const L = h * 0.42;
  const fronds: [number, number, number][] = [[-1, 0.25, 1], [1, 0.2, 1], [-0.75, -0.45, 0.8], [0.8, -0.4, 0.8], [-0.1, -0.8, 0.55], [-1, 0.7, 0.75], [1, 0.75, 0.7]];
  fronds.forEach(([dx, dy, len], i) => {
    const fl = L * len * (0.85 + hash(seed + i) * 0.3);
    for (let s = 0; s < fl; s += 2) {
      const k = s / fl, xx = Math.round(tx + dx * s), yy = Math.round(ty + dy * s + k * k * fl * 0.5);
      const top = dy < 0 || k < 0.3;
      box(g, xx - 1, yy, 3, 2, top ? F[2] : F[1]);
      // (the leaflets hanging off under the spine)
      if (s % 4 === 0 && k > 0.15) box(g, xx + (dx > 0 ? -1 : 1), yy + 2, 2, 2 + Math.round(k * 3), F[0]);
    }
  });
  box(g, tx - 2, ty - 1, 4, 4, T[0]);
};

// ---------------------------------------------------------------------------------------------------------------
// Set pieces far off

/** A waterfall painted down a cliff (still: the shimmer's drawn live over it): the notch it's cut, the pour in streaks
 *  (lit at its left), the pool's spray and the mist off it. `C`: rock dark, water, water lit, spray. */
export const falls = (g: Ctx, x: number, top: number, bottom: number, w: number, C: { rock: string; water: string; lit: string; spray: string }) => {
  poly(g, [[x - w / 2 - 6, bottom], [x - w / 2 - 2, top - 2], [x + w / 2 + 2, top - 2], [x + w / 2 + 8, bottom]], C.rock);
  box(g, x - w / 2, top, w, bottom - top, C.water);
  for (let sx = x - w / 2; sx < x + w / 2; sx += 2) {
    const k = (sx - (x - w / 2)) / w;
    for (let y = top + Math.round(hash(sx) * 8); y < bottom; y += 10 + Math.round(hash(sx + y) * 8)) box(g, sx, y, 1, 4 + Math.round(hash(sx * 3 + y) * 6), k < 0.4 ? C.lit : C.spray);
  }
  box(g, x - w / 2, top, 2, bottom - top, C.lit);
  box(g, x - w / 2 - 2, top - 2, w + 4, 2, C.lit);
  pixelBlob(g, x, bottom - 2, w * 1.6 + 6, 6, C.water);
  pixelBlob(g, x - 2, bottom - 4, w * 1.1 + 4, 4, C.spray);
  pixelBlob(g, x + w, bottom - 10, w * 1.2, 5, C.spray);
};

export interface KaboomaLook { body: string; lit: string; hi: string; shade: string; deep: string; lava: string; lavaHi: string; steam: string[] }
/**
 * MOUNT KABOOMA far off (the dino park's fiberglass volcano: from out here, the real thing): its cone stepped across
 * (lit up the left), ridges down it, the crater's broken lip, the fake lava down a gully (brighter after dark: `glow`),
 * and its steam going up and off to the right in stepped puffs. (cx, base) its foot; w its foot's width, h its height.
 */
export const kabooma = (g: Ctx, cx: number, base: number, w: number, h: number, K: KaboomaLook, glow: number) => {
  const top = base - h, cw = w * 0.13;
  // (the steam first: behind the cone's top)
  for (let i = 0; i < 7; i++) {
    const t = i / 6, px = cx + t * w * 0.5 + Math.sin(i * 1.7) * 6, py = top - 8 - t * h * 0.5, r = 7 + t * 14;
    pixelBlob(g, px + r * 0.15, py + r * 0.15, r, r * 0.65, K.steam[0]);
    pixelBlob(g, px, py, r * 0.86, r * 0.55, K.steam[1]);
    pixelBlob(g, px - r * 0.25, py - r * 0.2, r * 0.45, r * 0.3, K.steam[2]);
  }
  // (the cone: its flanks concave, in five steps across, lit at the left)
  const cols = [K.lit, K.body, K.body, K.shade, K.deep];
  const edge = (u: number, v: number): [number, number] => {
    // u: -1 left foot .. 1 right foot; v: 0 foot .. 1 the lip
    const half = cw + (w / 2 - cw) * Math.pow(1 - v, 1.6);
    return [cx + u * half, base - v * h];
  };
  for (let i = 0; i < cols.length; i++) {
    const u0 = -1 + (2 * i) / cols.length, u1 = -1 + (2 * (i + 1)) / cols.length, pts: [number, number][] = [];
    for (let v = 0; v <= 1.0001; v += 0.1) pts.push(edge(u0, v));
    for (let v = 1; v >= -0.0001; v -= 0.1) pts.push(edge(u1, v));
    poly(g, pts, cols[i]);
  }
  // (the steps dithered into each other, down the cone)
  for (let i = 1; i < cols.length; i++) for (let v = 0.05; v < 1; v += 0.05) { const [ex, ey] = edge(-1 + (2 * i) / cols.length, v); checker(g, Math.round(ex) - 2, Math.round(ey), 2, 4, cols[i], 0); }
  // (ridges down it: a lit line beside a shaded one)
  for (let k = 0; k < 7; k++) {
    const u = -0.85 + k * 0.27 + (hash(k * 3.3) - 0.5) * 0.08;
    for (let v = 0.92; v > 0.05; v -= 0.035) { const [rx, ry] = edge(u, v); box(g, Math.round(rx), Math.round(ry), 2, 3, u < 0.1 ? K.hi : K.shade); box(g, Math.round(rx) + 2, Math.round(ry), 2, 3, K.deep); }
  }
  // (the crater's lip: broken, dark inside)
  box(g, cx - cw, top, cw * 2, 4, K.deep);
  for (let k = 0; k < 6; k++) box(g, cx - cw + (k * cw) / 3, top - 2 - (k % 2) * 2, cw / 3, 4, k < 2 ? K.hi : K.shade);
  // (the lava down a gully: zigzagging, glowing more after dark)
  const lava = mix(K.lava, K.lavaHi, glow * 0.5);
  let lx = cx + cw * 0.3;
  for (let v = 0.98; v > 0.35; v -= 0.03) {
    const [, ly] = edge(0, v);
    lx += Math.sin(v * 17) * 1.4;
    box(g, Math.round(lx), Math.round(ly), 3, 4, lava);
    if (glow > 0.2 && (Math.round(v * 100) % 6 === 0)) box(g, Math.round(lx) - 2, Math.round(ly), 7, 2, mix(lava, K.body, 0.5));
  }
  box(g, cx - cw + 2, top + 1, cw * 2 - 4, 2, lava);
};
