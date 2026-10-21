// Meathead 2's title screen picture, made the way Meathead 1's is (src/m1/game/scenes/titleArt.ts): SNES pixel art on a
// 400 x 300 canvas (scaled up 2x with no smoothing), Meathead up close doing a double-biceps in the middle of it and the
// logo on its plate over his chest. Where Meathead 1 has a sunset over a city, here it's dusk at Happy Land's front
// gate: a banded twilight sky, the sun just down behind the castle, cloud banks lit pink from under, a crescent moon,
// stars coming out, searchlights sweeping it and fireworks going off; the castle right behind him, its spires up round
// his head; the roller coaster off on the left, its lift hill, its drop and its loop; the Ferris wheel off on the right,
// whole, on its A-frame, turning, its bulbs chasing round the rim and out along the spokes, its loading deck under it
// with a queue on it, and its ticket booth; Main Street's rooftops strung with bulbs; the park's banners flying; the
// parking lot under it all, rows of cars, a crowd heading in, the sodium lamps; confetti coming down; and the plate a
// marquee, its bulbs chasing, MEATHEAD 2 on it, a glint going across it. Everything that doesn't move is painted once
// and kept (ramps in hard steps, dithered where they meet, inked round); the wheel's redrawn only when it's turned a
// step.
//
// It comes up with an intro on the theme's opening (the user's: "make the title screen punchier"): the park's pieces
// slammed down one at a time, each on a hit, with a squash, a bounce, dust and a shake; him popping up behind the
// marquee, dumb, blinking, grinning; MEATHEAD stamped on a letter at a time, the 2 last and hardest; the bulbs on.
// Perspective: the park's pieces are cutouts standing on the horizon (the lot's on its ground), so they only drop
// straight down (nothing slides across the scene's one eye) and squash on their own ground line; the letters fly in
// along the line to the eye (scaled about it); the draw order never changes, so nothing nearer is ever behind
// something further. The painted pieces stay cached: the intro only moves them.
//
// The Ferris wheel stands whole off to the right, on its base, with nothing of it under the title's letters (the
// user's: "make sure there's a base to it on the bottom. i just don't want the wheel running under the logo"): its
// rim, cars and all, ends above the logo's top, the deck and booth it stands on are right of the logo's end.

import { drawTitleMeathead, blinkTitleMeathead, prewarmTitleMeathead, ART_W, ART_H, type TitleMood } from './meathead';
import { bayer, hash2, noise, rgbOf, type RGB } from '../../m1/game/scenes/art/raster';

type Ctx = CanvasRenderingContext2D;

export const TITLE_W = 400;
export const TITLE_H = 300;
/** Where the sky meets the parking lot (behind the logo's plate). */
const HORIZON = 150;
/** Where his close-up goes. */
const BUST_X = (TITLE_W - ART_W) / 2, BUST_Y = 2;
/** The scene's middle: its one eye (the lot's stall lines run to it, the logo's letters fly in along the line to it). */
const CX = 200;
/** The Ferris wheel: its hub and its rims (outer, inner), right of him, whole. Its lowest car's floor is on the deck
 *  (DECK_Y), above the logo's top (y 111 at its inked edge); the deck and the booth under it are right of the logo's
 *  end (x 348 at its inked edge). */
const WX = 361, WY = 57, WR = 33, WR_IN = 27;
/** Its loading deck (the top's y, the ends), and the ticket booth under it (from its left wall on to the deck's end). */
const DECK_Y = 101, DECK_X0 = 338, DECK_X1 = 398, HOUSE_X0 = 351;

const pack = ([r, g, b]: RGB) => ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
const mix = (a: RGB, b: RGB, k: number): RGB => [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * k)) as RGB;
const hexOf = (c: RGB) => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
const canvas = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const R = (g: Ctx, x: number, y: number, w: number, h: number, c: string) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
/** A ramp's step for `v` (0..1), dithered where two steps meet. */
const rampAt = <T>(ramp: T[], v: number, x: number, y: number, d = 0.9): T => ramp[Math.max(0, Math.min(ramp.length - 1, Math.round(v * (ramp.length - 1) + bayer(x, y) * d)))];
const INK = '#12041a';

// ---------------------------------------------------------------------------
// The sky and the parking lot (painted once)
// ---------------------------------------------------------------------------

/** Night at the top down through violet and magenta to the last of the sunset on the skyline, in hard steps. */
const SKY = ['#05031a', '#08052a', '#0d0838', '#140b46', '#1e0e52', '#2a115c', '#3a1464', '#4e1868', '#661c6c', '#80226c', '#9c2a6a', '#ba3866', '#d44c5e', '#ea6a56', '#f69456', '#fcc070', '#fde0a0'].map(rgbOf);
/** The lot under it: asphalt in the dusk, going to black at the bottom. */
const GROUND = ['#2c1838', '#26142f', '#1f1028', '#190d22', '#130a1c', '#0e0716', '#09040f', '#050208', '#000000'].map(rgbOf);
/** The sodium lamps' pools on the asphalt. */
const LAMP_POOL = rgbOf('#8a5a3a');
const LAMPS: [number, number, number][] = [[24, 296, 70], [376, 296, 70], [74, 176, 34], [326, 176, 34]];
/** Oil stains on the lot. */
const STAINS: [number, number, number][] = [[118, 204, 3], [272, 226, 4], [58, 252, 3], [334, 268, 4], [182, 284, 3], [226, 196, 2]];
/** The moon, a crescent up in the night on the left (lit from the sun gone down, low on the right). */
const MOON_X = 30, MOON_Y = 15, MOON_R = 7;
const MOON = ['#a27a5c', '#d0ac80', '#eed6a6', '#fff6dc'].map(rgbOf);
/** The cloud banks' undersides (lit by the sunset), their bodies, their tops. */
const CL_LIT = rgbOf('#ffc89a'), CL_DARK = rgbOf('#1a0a34'), CL_TOP = rgbOf('#6a3a8a');

const buildSky = () => {
  const c = canvas(TITLE_W, TITLE_H), g = c.getContext('2d')!;
  const img = g.createImageData(TITLE_W, TITLE_H), px = new Uint32Array(img.data.buffer);
  const n = SKY.length - 1, W = TITLE_W;
  // (the sky's band at a pixel: down the sky, and brighter low in the middle, where the sun's gone down)
  const bandF = (x: number, y: number) => {
    const glow = Math.max(0, 1 - Math.abs(x - CX) / 240) ** 1.6 * Math.max(0, (y - 64) / 86) * 2.4;
    return Math.min(n, (y / (HORIZON - 1)) ** 1.3 * n + glow);
  };
  const skyAt = (x: number, y: number, dk = 0) => SKY[Math.max(0, Math.min(n, Math.round(bandF(x, y) + bayer(x, y) * 0.9) + dk))];
  // The cloud banks: long thin streaks in four layers, broken up into banks
  const LAYERS: [number, number, number][] = [[44, 4, 0.55], [70, 5, 0.7], [96, 5, 0.8], [117, 4, 0.85]];
  const cl = new Uint8Array(W * HORIZON);
  for (let y = 0; y < HORIZON; y++) for (let x = 0; x < W; x++) {
    let v = 0;
    for (const [ly, th, k] of LAYERS) {
      const dy = (y - ly - Math.sin(x * 0.019 + ly) * 3) / th;
      if (Math.abs(dy) >= 1.5) continue;
      const bank = noise(x, ly * 5, 44, ly) * 1.6 - 0.45;
      v = Math.max(v, (noise(x * 0.3, y, 3, ly + 1) * 0.7 + 0.3) * k * bank * (1 - (dy * dy) / 2.25));
    }
    if (v + bayer(x, y) * 0.1 > 0.3) cl[y * W + x] = 1;
  }
  const shX = MOON_X - 3, shY = MOON_Y - 2.5;
  for (let y = 0; y < TITLE_H; y++) for (let x = 0; x < W; x++) {
    const d = bayer(x, y), i = y * W + x;
    let col: RGB;
    if (y < HORIZON) {
      col = skyAt(x, y);
      if (cl[i]) {
        // (lit along their undersides in two steps, dark in their bodies, a rim along their tops)
        const b1 = y + 1 < HORIZON && cl[i + W], b2 = y + 2 < HORIZON && cl[i + 2 * W], above = y > 0 && cl[i - W];
        const lit = mix(skyAt(x, y, 3), CL_LIT, 0.25 + 0.35 * (y / HORIZON));
        const body = mix(skyAt(x, y, -1), CL_DARK, 0.3);
        if (!b1) col = lit;
        else if (!b2) col = d > -0.1 ? lit : body;
        else if (!above) col = mix(skyAt(x, y, 1), CL_TOP, 0.3);
        else col = body;
      }
      // The moon: the crescent lit in steps (darker at its limb and its craters), the rest of it in earthshine, a
      // dithered halo round it
      const md = Math.hypot(x - MOON_X, y - MOON_Y);
      if (md <= MOON_R + 0.3) {
        const e = Math.hypot(x - shX, y - shY) - (MOON_R - 0.5);
        if (e < 0) col = mix(col, rgbOf('#3a2c6a'), 0.55);
        else {
          let k = Math.round(Math.min(1, e / 4) * 3 + d * 0.9);
          if (md > MOON_R - 0.8) k = Math.min(k, 1);
          if (hash2(x, y + 3) < 0.14 && k > 1) k--;
          col = MOON[Math.max(0, Math.min(3, k))];
        }
      } else if (md < MOON_R + 5 && d > 0.05 + (md - MOON_R) * 0.08) col = mix(col, rgbOf('#b8a0f0'), 0.14);
    } else {
      const v = Math.min(1, (y - HORIZON) / 140);
      col = GROUND[Math.max(0, Math.min(GROUND.length - 1, Math.round(v * (GROUND.length - 1) + d * 0.9)))];
      // (the asphalt's grit, its stains)
      if (hash2(x, y) < 0.03) col = mix(col, rgbOf('#7a6088'), 0.3);
      else if (hash2(x + 7, y) < 0.02) col = mix(col, rgbOf('#000000'), 0.35);
      for (const [sx, sy, sr] of STAINS) if (Math.hypot((x - sx) / 2.2, y - sy) + d * 1.5 < sr) col = mix(col, rgbOf('#05020a'), 0.3);
      // (the lamps' pools: stepped rings, dithered at their edges)
      for (const [lx, ly, lr] of LAMPS) {
        const dist = Math.hypot((x - lx) / 1.9, y - ly) + d * 10;
        if (dist < lr) col = mix(col, LAMP_POOL, dist < lr * 0.45 ? 0.5 : dist < lr * 0.75 ? 0.3 : 0.14);
      }
    }
    px[i] = pack(col);
  }
  g.putImageData(img, 0, 0);
  // The parking lot's lines going back to the gate (the stalls' lines on the vanishing point, the rows across), worn
  for (let k = -9; k <= 9; k++) {
    const xb = CX + k * 52;
    for (let y = HORIZON + 6; y < TITLE_H; y++) {
      const x = Math.round(CX + (xb - CX) * (y - HORIZON) / (TITLE_H - HORIZON));
      if (x >= 0 && x < TITLE_W && ((y >> 1) + k) % 7 !== 0 && hash2(x, y) > 0.08) R(g, x, y, 1, 1, y > 230 ? '#4a3a58' : '#3a2c4a');
    }
  }
  for (const y of [158, 170, 188, 216, 258]) for (let x = 0; x < TITLE_W; x++) if (hash2(x, y + 1) > 0.1) R(g, x, y, 1, 1, y > 200 ? '#3c2e4a' : '#30243e');
  // (the crosswalk up to the gate, its stripes widening toward us)
  for (let y = HORIZON + 1; y < HORIZON + 11; y++) {
    const s = 1 + (y - HORIZON) * 0.04;
    for (let k = -4; k <= 4; k++) {
      const x0 = Math.round(CX + (k * 7 - 2) * s), x1 = Math.round(CX + (k * 7 + 2) * s);
      R(g, x0, y, x1 - x0, 1, y < HORIZON + 5 ? '#3e3050' : '#4a3a5c');
    }
  }
  return c;
};

// ---------------------------------------------------------------------------
// The park against the sky, and the cars, the crowd and the lamps in the lot (painted once)
// ---------------------------------------------------------------------------

/** Where Main Street's rooftop bulbs are (drawn twinkling each frame), and which stretch of rooftops each is on. */
const BULBS: [number, number, number][] = [];
/** The castle's bulbs along its curtain wall (drawn twinkling each frame). */
const CASTLE_BULBS: [number, number][] = [];
/** Main Street's rooftops come down in three stretches (the intro): left, middle, right. */
const roofChunk = (x: number) => (x < 133 ? 0 : x < 267 ? 1 : 2);

/** The park, a canvas a piece (each drops in on its own in the intro; drawn in this order, back to front). */
interface Park { trees: HTMLCanvasElement; roofs: HTMLCanvasElement[]; castle: HTMLCanvasElement; coaster: HTMLCanvasElement; lotFar: HTMLCanvasElement; lotNear: HTMLCanvasElement; lamps: HTMLCanvasElement }

/** The castle's stone, darkest to lightest (lit from the left), its roofs' slate, gold trim. */
const WALL = ['#1e0c32', '#2c1442', '#3c1e56', '#4e2a6a', '#62367e', '#7a4894', '#9460ac', '#b07cc4'];
const SLATE = ['#0c1240', '#141e5a', '#1e2c78', '#2a3e96', '#3a54b4', '#5070cc', '#6e90e0', '#9ab4f0'];
const GOLD = ['#5a3a08', '#a06c10', '#e0a820', '#fcd850', '#fff4b0'];
/** The coaster's steel and its supports. */
const RAIL = ['#5a0a34', '#a01c5a', '#ec4f8a', '#ffb0d0'];
const SUP = ['#1e0a2a', '#36163e', '#4a2058', '#6a3478'];
/** The cars in the lot. */
const CARS = ['#b02a3a', '#2a5ab0', '#d8d0c0', '#2a8a5a', '#c8a020', '#5a3a8a', '#404048', '#a85020'].map(rgbOf);
/** The roller coaster's track's height at x (left of him: the lift hill rising from behind his arm, the crest, the
 *  drop, round the loop). */
const trackY = (x: number) => {
  if (x > 88) return HORIZON - 8;
  if (x > 50) return HORIZON - 8 - ((88 - x) / 38) * 74;
  if (x > 40) return HORIZON - 82 + ((50 - x) / 10) ** 2 * 6;
  return Math.min(HORIZON - 8, HORIZON - 76 + ((40 - x) / 30) * 68);
};
const LOOP_X = 20, LOOP_Y = HORIZON - 26, LOOP_RX = 13, LOOP_RY = 17;

const line = (g: Ctx, x0: number, y0: number, x1: number, y1: number, c: string, w = 1) => {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  g.fillStyle = c;
  for (let i = 0; i <= n; i++) g.fillRect(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), w, w);
};

const buildPark = (): Park => {
  const mk = () => canvas(TITLE_W, TITLE_H);
  const P: Park = { trees: mk(), roofs: [mk(), mk(), mk()], castle: mk(), coaster: mk(), lotFar: mk(), lotNear: mk(), lamps: mk() };
  let g = P.trees.getContext('2d')!;
  BULBS.length = 0; CASTLE_BULBS.length = 0;
  // The far trees in the haze along the horizon (lit along their tops by the sunset), then nearer clumps, rounded,
  // stepped and dithered
  for (let x = 0; x < TITLE_W; x++) {
    const h = 9 + Math.round(Math.sin(x * 0.07) * 3 + Math.sin(x * 0.19 + 1) * 2 + hash2(x, 4) * 2);
    for (let y = HORIZON - h; y < HORIZON; y++) R(g, x, y, 1, 1, rampAt(['#3a1450', '#4a1a5c', '#5a2064'], 1 - (y - HORIZON + h) / h, x, y));
    R(g, x, HORIZON - h, 1, 1, '#9a3a72');
  }
  const TREE = ['#1a0828', '#2a0e3a', '#3c1450', '#56206a', '#7a3480'];
  for (let i = 0; i < 40; i++) {
    const cx = Math.round(i * 10.4 + hash2(i, 51) * 8), r = 3 + Math.round(hash2(i, 52) * 3), cy = HORIZON - 3 - Math.round(hash2(i, 53) * 3);
    for (let y = cy - r; y <= HORIZON; y++) for (let x = cx - r; x <= cx + r; x++) {
      const dx = x - cx, dy = Math.min(0, y - cy), dd = Math.hypot(dx, dy);
      if (dd > r + 0.3) continue;
      // (lit on its top left, a lighter rim along its top)
      const v = 0.55 - (dx + dy) / (r * 2.6) - (y - cy) / (r * 3);
      R(g, x, y, 1, 1, dd > r - 0.8 && dy < -r * 0.5 ? '#a04a86' : rampAt(TREE, v, x, y));
    }
  }

  // Main Street's rooftops, right along: shopfronts with false fronts and gables, cornices, windows lit in their
  // frames, awnings, bulbs along the eaves
  for (let x = -2, i = 0; x < TITLE_W; i++) {
    const w = 12 + Math.round(hash2(i, 21) * 14), h = 7 + Math.round(hash2(i, 23) * 9), top = HORIZON - h;
    const chunk = roofChunk(x + w / 2);
    g = P.roofs[chunk].getContext('2d')!;
    const tone = [['#3c1446', '#2a0c34', '#1a0622'], ['#44164a', '#320e3a', '#200828'], ['#361240', '#260a30', '#16061e']][i % 3];
    for (let yy = top; yy < HORIZON; yy++) for (let xx = x; xx < x + w; xx++) R(g, xx, yy, 1, 1, xx === x ? tone[0] : xx === x + w - 1 ? tone[2] : yy > HORIZON - 3 && bayer(xx, yy) > 0 ? tone[2] : tone[1]);
    if (hash2(i, 25) < 0.45) { // a gable
      for (let k = 1; k < w - 1; k++) { const hh = Math.floor(Math.min(k, w - 1 - k) / 2); R(g, x + k, top - hh, 1, hh, tone[1]); R(g, x + k, top - hh, 1, 1, k < w / 2 ? '#c05080' : '#80305e'); }
    }
    R(g, x - 1, top, w + 2, 1, '#c05080'); R(g, x - 1, top + 1, w + 2, 1, '#5a1a4a');
    for (let wy = top + 3; wy < HORIZON - 5; wy += 4) for (let wx = x + 2; wx < x + w - 2; wx += 4) {
      if (hash2(wx, wy) < 0.5) { R(g, wx - 1, wy - 1, 4, 4, '#14041a'); R(g, wx, wy, 2, 2, hash2(wy, wx) < 0.3 ? '#fff0a0' : '#f8b040'); R(g, wx, wy, 1, 1, '#fffbe0'); }
    }
    if (i % 2) for (let xx = x + 1; xx < x + w - 1; xx++) { R(g, xx, HORIZON - 5, 1, 2, (xx >> 1) % 2 ? '#8a2a5a' : '#a89088'); if (xx % 2) R(g, xx, HORIZON - 3, 1, 1, '#5a1a40'); }
    for (let bx = x + 1; bx < x + w - 1; bx += 3) BULBS.push([bx, top - 1, chunk]);
    x += w + 1;
  }

  // The castle, right behind him: its keep, its towers and their spires up round his head, flags on top, its windows
  // lit, its curtain wall along the front, the gate in it
  g = P.castle.getContext('2d')!;
  /** A stretch of stone: lit on its left in steps, its courses and their joints, inked down its sides. */
  const stone = (x0: number, x1: number, top: number, bottom: number) => {
    for (let y = top; y < bottom; y++) for (let x = x0; x < x1; x++) {
      const u = (x - x0) / Math.max(1, x1 - x0 - 1), dn = (y - top) / Math.max(1, bottom - top);
      let v = 0.78 - u * 0.5 - dn * 0.18;
      const row = (y - top) >> 2;
      if ((y - top) % 4 === 3 || (x + (row % 2) * 3) % 6 === 0 && (y - top) % 4 !== 0) v -= 0.14;
      R(g, x, y, 1, 1, rampAt(WALL, v, x, y));
    }
    R(g, x0, top, 1, bottom - top, WALL[7]); R(g, x1 - 1, top, 1, bottom - top, WALL[1]);
    R(g, x0 - 1, top, 1, bottom - top, INK); R(g, x1, top, 1, bottom - top, INK);
  };
  /** Battlements along a wall's top. */
  const battlements = (x0: number, x1: number, top: number) => {
    R(g, x0 - 1, top - 1, x1 - x0 + 2, 1, INK);
    for (let x = x0; x < x1 - 1; x += 4) { R(g, x - 1, top - 4, 4, 3, INK); R(g, x, top - 3, 2, 3, WALL[5]); R(g, x, top - 3, 1, 3, WALL[7]); R(g, x + 1, top - 1, 1, 1, WALL[3]); }
  };
  /** An arched window, lit. */
  const win = (x: number, y: number, w: number, h: number) => {
    R(g, x - 1, y, w + 2, h + 1, INK); R(g, x, y - 1, w, 1, INK);
    for (let k = 0; k < h; k++) R(g, x, y + k, w, 1, k === 0 ? '#fffbe0' : k < h / 2 ? '#fde68a' : '#f8b040');
    if (w > 2) R(g, x + (w >> 1), y + 1, 1, h - 1, '#a8501c');
    R(g, x - 1, y + h, w + 2, 1, WALL[6]);
  };
  const tower = (x: number, w: number, top: number, spire: number) => {
    const m = x + Math.floor(w / 2);
    stone(x, x + w, top, HORIZON);
    for (let wy = top + 5; wy < HORIZON - 10; wy += 11) win(m - (w > 16 ? 1 : 0) - 1, wy, w > 16 ? 4 : 2, 5);
    // (the corbelled band the roof sits on: gold, lit left)
    for (let xx = x - 2; xx < x + w + 2; xx++) { R(g, xx, top - 2, 1, 1, rampAt(GOLD, 1 - (xx - x + 2) / (w + 4) * 0.8, xx, top)); R(g, xx, top - 1, 1, 1, xx % 2 ? GOLD[1] : '#2a0a30'); }
    R(g, x - 3, top - 2, 1, 2, INK); R(g, x + w + 2, top - 2, 1, 2, INK);
    // (the cone: slate in hard steps lit on its left, its shingle courses, inked down its edges)
    const base = top - 3, half0 = w / 2 + 2;
    for (let y = spire; y <= base; y++) {
      const half = Math.max(0.5, ((y - spire) / Math.max(1, base - spire)) ** 0.85 * half0);
      const l = Math.round(m - half), r = Math.round(m + half);
      for (let xx = l; xx <= r; xx++) {
        const u = (xx - l) / Math.max(1, r - l);
        let v = 0.92 - u * 0.75;
        if ((y - spire) % 3 === 2) v -= 0.16;
        R(g, xx, y, 1, 1, xx === l || xx === r ? SLATE[0] : rampAt(SLATE, v, xx, y));
      }
    }
    // (the finial: a pole, a gold ball, a pennant)
    R(g, m, spire - 8, 1, 8, '#c8b8e0'); R(g, m - 1, spire - 2, 3, 2, GOLD[2]); R(g, m - 1, spire - 2, 1, 1, GOLD[4]);
    R(g, m + 1, spire - 8, 5, 1, '#f9a8d4'); R(g, m + 1, spire - 7, 4, 1, '#ec4899'); R(g, m + 1, spire - 6, 2, 1, '#a8206a');
  };
  // (the keep behind)
  stone(148, 252, 70, HORIZON); battlements(148, 252, 70);
  for (let wx = 156; wx < 248; wx += 12) if (Math.abs(wx + 1 - CX) > 14) { win(wx, 80, 2, 6); win(wx, 98, 2, 6); }
  tower(186, 28, 38, 8);
  tower(164, 14, 52, 26); tower(222, 14, 52, 26);
  // (the curtain wall along the front, the gate in it, bulbs along its top)
  stone(114, 286, 100, HORIZON); battlements(114, 286, 100);
  for (let x = 116; x < 285; x += 4) CASTLE_BULBS.push([x, 102]);
  R(g, CX - 14, 116, 28, 34, INK);
  for (let y = 117; y < HORIZON; y++) {
    const hw = y < 125 ? Math.round(Math.sqrt(Math.max(0, 144 - (125 - y) ** 2 * 1.6))) : 12;
    if (hw <= 0) continue;
    R(g, CX - hw, y, hw * 2, 1, y < 121 ? '#fde68a' : '#f8b040');
    // (the portcullis)
    for (let x = CX - hw; x < CX + hw; x++) if ((x - CX) % 4 === 0 || (y - 117) % 5 === 0) R(g, x, y, 1, 1, '#3a1a20');
  }
  tower(116, 20, 50, 14); tower(264, 20, 50, 14);

  // The roller coaster, on the left: the lift hill up from behind his arm, the crest, the drop, the loop; pink steel
  // on its lattice towers, the chain up the lift, a train on the crest, arms up
  g = P.coaster.getContext('2d')!;
  for (let x = 2; x < 98; x += 6) {
    const y = Math.round(trackY(x));
    R(g, x, y + 3, 1, HORIZON - y - 3, SUP[2]); R(g, x - 1, y + 3, 1, HORIZON - y - 3, SUP[0]);
    const y2 = Math.round(trackY(x + 6));
    if (x + 6 < 98 && Math.max(y, y2) < HORIZON - 16) for (let yy = Math.max(y, y2) + 5; yy < HORIZON - 6; yy += 8) {
      line(g, x, yy, x + 6, yy + 6, SUP[1]); line(g, x + 6, yy, x, yy + 6, SUP[1]); R(g, x, yy, 7, 1, SUP[3]);
    }
  }
  // (the loop: two rails, the near half lit, ties between, a tower under it)
  R(g, LOOP_X - 1, LOOP_Y + LOOP_RY, 3, HORIZON - LOOP_Y - LOOP_RY, SUP[2]);
  for (let a = 0; a < Math.PI * 2; a += 0.012) {
    const up = Math.sin(a) < 0;
    R(g, Math.round(LOOP_X + Math.cos(a) * LOOP_RX), Math.round(LOOP_Y + Math.sin(a) * LOOP_RY), 1, 1, up ? RAIL[3] : RAIL[2]);
    R(g, Math.round(LOOP_X + Math.cos(a) * (LOOP_RX - 2)), Math.round(LOOP_Y + Math.sin(a) * (LOOP_RY - 2)), 1, 1, up ? RAIL[2] : RAIL[1]);
  }
  for (let a = 0; a < Math.PI * 2; a += 0.3) R(g, Math.round(LOOP_X + Math.cos(a) * (LOOP_RX - 1)), Math.round(LOOP_Y + Math.sin(a) * (LOOP_RY - 1)), 1, 1, RAIL[0]);
  // (the track: three rows of steel, the ties under, the chain up the lift)
  for (let x = 0; x < 100; x++) {
    const y = Math.round(trackY(x));
    R(g, x, y - 1, 1, 1, INK); R(g, x, y, 1, 1, RAIL[3]); R(g, x, y + 1, 1, 1, RAIL[2]); R(g, x, y + 2, 1, 1, RAIL[1]);
    if (x % 2) R(g, x, y + 3, 1, 1, RAIL[0]);
    if (x > 50 && x < 89 && x % 2 === 0) R(g, x, y + 1, 1, 1, '#2a0a20');
  }
  // (the train cresting the lift: three cars, riders' heads and arms up)
  const TRAIN = [['#fff6b0', '#fde047', '#a07a10'], ['#c0f0ff', '#38bdf8', '#1a5a98'], ['#fff6b0', '#fde047', '#a07a10']];
  const SKIN = ['#f4c49c', '#c8906c', '#8a5a3c', '#e8b088', '#5a3a28'];
  for (let k = 0; k < 3; k++) {
    const x = 50 + k * 6, y = Math.round(trackY(x + 2)) - 4, [hi, mid, dk] = TRAIN[k];
    R(g, x - 1, y - 1, 7, 5, INK);
    R(g, x, y, 5, 1, hi); R(g, x, y + 1, 5, 1, mid); R(g, x, y + 2, 5, 1, dk);
    R(g, x + 1, y - 2, 1, 1, SKIN[k]); R(g, x + 3, y - 2, 1, 1, SKIN[(k + 2) % 5]);
    if (k !== 1) { R(g, x + 1, y - 4, 1, 2, SKIN[k]); R(g, x + 3, y - 4, 1, 2, SKIN[(k + 2) % 5]); }
  }

  // The lot: a row of cars nosed in by the gate, another nearer at the sides; the lamp posts
  g = P.lotFar.getContext('2d')!;
  for (let x = 2, i = 0; x < TITLE_W - 8; i++) {
    const col = CARS[Math.floor(hash2(i, 31) * CARS.length)];
    if (hash2(i, 33) > 0.18) {
      R(g, x, HORIZON + 1, 9, 5, '#0a0610');
      R(g, x + 2, HORIZON - 1, 5, 2, hexOf(mix(col, [0, 0, 0], 0.3))); R(g, x + 3, HORIZON - 1, 3, 1, '#9ab4d0');
      R(g, x + 1, HORIZON + 1, 7, 1, hexOf(mix(col, [255, 255, 240], 0.35)));
      R(g, x + 1, HORIZON + 2, 7, 1, hexOf(col));
      R(g, x + 1, HORIZON + 3, 7, 1, hexOf(mix(col, [0, 0, 0], 0.4)));
      R(g, x + 1, HORIZON + 2, 1, 1, '#ff3a3a'); R(g, x + 7, HORIZON + 2, 1, 1, '#ff3a3a');
      R(g, x + 2, HORIZON + 4, 1, 1, '#000000'); R(g, x + 6, HORIZON + 4, 1, 1, '#000000');
    }
    x += 11;
  }
  g = P.lotNear.getContext('2d')!;
  for (const side of [0, 1]) for (let k = 0; k < 4; k++) {
    const x = side ? TITLE_W - 18 - k * 20 : 4 + k * 20, col = CARS[(k * 3 + side * 5) % CARS.length];
    const hi = hexOf(mix(col, [255, 250, 230], 0.45)), mid = hexOf(col), dk = hexOf(mix(col, [0, 0, 0], 0.35)), dd = hexOf(mix(col, [0, 0, 0], 0.65));
    // (its shadow, dithered at the ends)
    for (let xx = x - 1; xx < x + 18; xx++) for (let yy = 169; yy < 172; yy++) if (xx > x && xx < x + 16 || bayer(xx, yy) > 0) R(g, xx, yy, 1, 1, '#06030a');
    // (the cabin: the roof, the windshield with the dusk in it, the pillars)
    R(g, x + 2, 158, 12, 1, INK);
    R(g, x + 3, 159, 10, 1, hi);
    for (let yy = 160; yy < 163; yy++) R(g, x + 3, yy, 10, 1, ['#d8a8c8', '#7a7ab0', '#3a3a6a'][yy - 160]);
    R(g, x + 4, 160, 2, 1, '#fff0f8');
    R(g, x + 2, 159, 1, 4, dk); R(g, x + 13, 159, 1, 4, dk);
    // (the body: the hood lit, the side, the sill; the headlights on, the grille, the chrome bumper, the tires)
    R(g, x, 163, 16, 1, INK); R(g, x - 1, 164, 1, 5, INK); R(g, x + 16, 164, 1, 5, INK);
    R(g, x + 1, 163, 14, 1, hi);
    R(g, x, 164, 16, 1, hi); R(g, x, 165, 16, 2, mid); R(g, x, 167, 16, 1, dk);
    R(g, x, 164, 1, 3, hi); R(g, x + 15, 164, 1, 4, dd);
    R(g, x + 1, 165, 3, 1, '#fff2c0'); R(g, x + 12, 165, 3, 1, '#fff2c0'); R(g, x + 2, 165, 1, 1, '#ffffff'); R(g, x + 13, 165, 1, 1, '#ffffff');
    R(g, x + 5, 165, 6, 2, '#1a1020'); for (let gx = x + 5; gx < x + 11; gx += 2) R(g, gx, 165, 1, 1, '#8a8098');
    R(g, x, 168, 16, 1, '#c8c0d8'); R(g, x, 168, 4, 1, '#ffffff');
    R(g, x + 1, 169, 3, 2, '#08040c'); R(g, x + 12, 169, 3, 2, '#08040c'); R(g, x + 2, 169, 1, 1, '#6a6078'); R(g, x + 13, 169, 1, 1, '#6a6078');
  }
  /** A sodium lamp post: a flared foot, the pole lit on its left with collars, a crossbar head, its lights and their
   *  glow. */
  const pole = (x: number, top: number, bottom: number, big: boolean) => {
    const pw = big ? 3 : 2;
    R(g, x - 1, top, pw + 2, bottom - top, INK);
    R(g, x, top, pw, bottom - top, '#4a4058'); R(g, x, top, 1, bottom - top, '#8a80a0'); if (big) R(g, x + 2, top, 1, bottom - top, '#2a2438');
    for (let y = top + 10; y < bottom - 8; y += 14) { R(g, x - 1, y, pw + 2, 2, '#6a6078'); R(g, x - 1, y, pw + 2, 1, '#b0a8c8'); }
    R(g, x - 2, bottom - 6, pw + 4, 6, '#3a3448'); R(g, x - 2, bottom - 6, pw + 4, 1, '#8a80a0'); R(g, x - 2, bottom - 6, 1, 6, '#6a6078');
    const hw = big ? 11 : 7;
    for (let k = 3; k <= 6; k++) for (let xx = x - hw - 2; xx < x + hw + 4; xx++) {
      const y = top + (big ? 4 : 3) + k;
      if (bayer(xx, y) > 0.1 + k * 0.08 && Math.abs(xx - x) < hw - k + 4) R(g, xx, y, 1, 1, '#c88a40');
    }
    R(g, x - hw + 1, top - 3, hw * 2 + 2, (big ? 4 : 3) + 2, INK);
    R(g, x - hw + 2, top - 2, hw * 2, 1, '#6a6078'); R(g, x - hw + 2, top - 1, hw * 2, big ? 2 : 1, '#3a3448');
    R(g, x - hw + 3, top + (big ? 1 : 0), hw * 2 - 2, 1, '#ffd27a');
    R(g, x - hw + 4, top + (big ? 2 : 1), hw * 2 - 4, 1, '#fff2c0');
    R(g, x - 1, top - 5, pw + 2, 2, '#3a3448'); R(g, x, top - 6, pw, 1, '#8a80a0');
  };
  pole(74, 132, 177, false); pole(326, 132, 177, false);
  g = P.lamps.getContext('2d')!;
  pole(23, 186, TITLE_H, true); pole(375, 186, TITLE_H, true);
  return P;
};

/** The crowd heading in to the gate under the marquee (drawn each frame: a kid hopping, balloons bobbing, a wave). */
interface Guest { x: number; shirt: string; skin: string; hair: string; kid: boolean; balloon: string | null; ph: number }
const SHIRTS = ['#ec4899', '#38bdf8', '#fde047', '#4ade80', '#f97316', '#a78bfa', '#f4f0e8', '#d02a3a'];
const GUEST_SKIN = ['#f4c49c', '#c8906c', '#8a5a3c', '#e8b088', '#5a3a28'];
const GUEST_HAIR = ['#1a1010', '#5a3418', '#c89040', '#2a1a10', '#8a2a10', '#d8d0c0'];
const BALLOONS = ['#ff4f6a', '#fde047', '#38bdf8', '#4ade80', '#ff82c0'];
const CROWD: Guest[] = Array.from({ length: 19 }, (_, i) => ({
  x: 94 + Math.round(i * 11.4 + hash2(i, 41) * 5),
  shirt: SHIRTS[Math.floor(hash2(i, 42) * SHIRTS.length)], skin: GUEST_SKIN[Math.floor(hash2(i, 43) * GUEST_SKIN.length)],
  hair: GUEST_HAIR[Math.floor(hash2(i, 44) * GUEST_HAIR.length)], kid: hash2(i, 45) < 0.28,
  balloon: hash2(i, 46) < 0.32 ? BALLOONS[Math.floor(hash2(i, 47) * BALLOONS.length)] : null, ph: Math.floor(hash2(i, 48) * 120),
}));
const drawGuest = (g: Ctx, p: Guest, feet: number, t: number) => {
  const hop = p.kid && (t + p.ph) % 70 < 6 ? 1 : 0;
  const top = feet - (p.kid ? 5 : 7) - hop, x = p.x;
  R(g, x - 1, top - 1, 4, (p.kid ? 5 : 7) + 2, '#0a0410');
  R(g, x, top, 2, 1, p.hair); R(g, x, top + 1, 2, 1, p.skin);
  R(g, x, top + 2, 2, p.kid ? 1 : 2, p.shirt); R(g, x, top + 2, 1, 1, '#fffbe0');
  R(g, x, feet - 2 - hop, 1, 2, '#2a2a4a'); R(g, x + 1, feet - 2 - hop, 1, 2, '#1a1a30');
  // (a wave now and then)
  if (!p.balloon && (t + p.ph * 3) % 200 < 30) R(g, x + 2, top - ((t >> 3) & 1), 1, 2, p.skin);
  if (p.balloon) {
    const by = top - 8 + Math.round(Math.sin((t + p.ph) * 0.05));
    R(g, x + 2, by + 3, 1, top + 2 - by - 3, '#c8c0d8');
    R(g, x + 1, by - 1, 3, 1, INK); R(g, x, by, 1, 3, INK); R(g, x + 4, by, 1, 3, INK);
    R(g, x + 1, by, 3, 3, p.balloon); R(g, x + 1, by, 1, 1, '#ffffff'); R(g, x + 3, by + 2, 1, 1, '#00000060');
  }
};

// ---------------------------------------------------------------------------
// The Ferris wheel (the wheel redrawn when it's turned a step; the A-frame, the deck and the booth painted once)
// ---------------------------------------------------------------------------

const WHEEL_STEPS = 720, SPOKES = 12, CARS_ON = 12, RIM_BULBS = 24;
/** Its steel, darkest to lightest. */
const STEEL = ['#1e1230', '#3a2858', '#5a4280', '#7e62a8', '#a68ad0', '#d0bcf0', '#f4ecff'];
/** The cars' paint: light, flat, shaded, inked. */
const CAB = [['#ffb0d8', '#ec4899', '#a8206a', '#4a0a30'], ['#fff6b0', '#fde047', '#c89a10', '#5a3a04'], ['#c0f0ff', '#38bdf8', '#1a74b8', '#0a2a50'], ['#c0ffd0', '#4ade80', '#1a9a4a', '#0a3a1a'], ['#ffd0a0', '#f97316', '#b0480c', '#4a1a04'], ['#e4d8ff', '#a78bfa', '#6a4ad0', '#2a1460']];
/** Light off the upper left: how lit a rim facing angle `a` is (0..1). */
const litAt = (a: number) => (Math.cos(a + Math.PI * 0.75) + 1) / 2;

const ringAt = (g: Ctx, cx: number, cy: number, r: number, col: (a: number) => string) => {
  const n = Math.ceil(r * Math.PI * 2.4);
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; g.fillStyle = col(a); g.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1); }
};

/** A car hanging from its pivot (px, py): the scalloped canopy, the posts, the riders, the tub in its paint (lit
 *  left, a cream band round it), inked. */
const paintCar = (g: Ctx, px: number, py: number, i: number, sw: number) => {
  const [hi, base, dk, ink] = CAB[i % CAB.length], x = px + sw;
  R(g, px, py, 1, 2, STEEL[2]);
  R(g, x - 4, py + 1, 9, 1, ink);
  R(g, x - 3, py + 2, 7, 1, hi);
  R(g, x - 5, py + 3, 1, 1, ink); R(g, x + 5, py + 3, 1, 1, ink);
  R(g, x - 4, py + 3, 9, 1, base);
  R(g, x - 2, py + 4, 5, 2, '#1a1030');
  R(g, x - 1, py + 5, 1, 1, GUEST_SKIN[i % 5]); R(g, x + 1, py + 5, 1, 1, GUEST_SKIN[(i + 2) % 5]);
  for (let k = -4; k <= 4; k += 2) R(g, x + k, py + 4, 1, 1, dk);
  R(g, x - 3, py + 4, 1, 2, STEEL[4]); R(g, x + 3, py + 4, 1, 2, STEEL[2]);
  R(g, x - 4, py + 6, 1, 4, ink); R(g, x + 4, py + 6, 1, 4, ink);
  R(g, x - 3, py + 6, 7, 1, hi);
  R(g, x - 3, py + 7, 7, 1, base); R(g, x - 3, py + 8, 7, 1, '#fff2d0'); R(g, x - 3, py + 9, 7, 1, dk);
  R(g, x - 3, py + 7, 1, 1, hi); R(g, x + 3, py + 7, 1, 3, dk);
  R(g, x - 2, py + 10, 5, 1, ink);
};

const paintWheel = (g: Ctx, rot: number) => {
  g.clearRect(WX - WR - 10, WY - WR - 10, WR * 2 + 20, WR * 2 + 26);
  const a0 = (rot / WHEEL_STEPS) * Math.PI * 2, step = (Math.PI * 2) / SPOKES;
  // The far side's spokes and rims (a pixel back), in the shade
  for (let i = 0; i < SPOKES; i++) {
    const a = a0 + i * step + step / 2;
    line(g, WX + 1 + Math.cos(a) * 5, WY + Math.sin(a) * 5, WX + 1 + Math.cos(a) * WR_IN, WY + Math.sin(a) * WR_IN, STEEL[1]);
  }
  ringAt(g, WX + 1, WY, WR, () => STEEL[1]); ringAt(g, WX + 1, WY, WR_IN, () => STEEL[1]);
  // The truss between the rims: a zigzag round
  for (let i = 0; i < SPOKES * 2; i++) {
    const a = a0 + (i * step) / 2, b = a + step / 2;
    line(g, WX + Math.cos(a) * (WR_IN + 1), WY + Math.sin(a) * (WR_IN + 1), WX + Math.cos(b) * (WR - 1), WY + Math.sin(b) * (WR - 1), STEEL[2]);
  }
  // The near spokes, lit on their upper sides
  for (let i = 0; i < SPOKES; i++) {
    const a = a0 + i * step;
    line(g, WX + Math.cos(a) * 5, WY + Math.sin(a) * 5, WX + Math.cos(a) * WR_IN, WY + Math.sin(a) * WR_IN, STEEL[3]);
    line(g, WX + Math.cos(a) * 9, WY + Math.sin(a) * 9 - 1, WX + Math.cos(a) * (WR_IN - 3), WY + Math.sin(a) * (WR_IN - 3) - 1, litAt(a + Math.PI / 2) > 0.5 ? STEEL[4] : STEEL[2]);
  }
  // The rims: the outer one two pixels thick, lit off the upper left in steps; the inner one
  const lit = (lo: number, hi: number) => (a: number) => STEEL[Math.round(lo + litAt(a) * (hi - lo))];
  ringAt(g, WX, WY, WR, lit(2, 6)); ringAt(g, WX, WY, WR - 1, lit(1, 4));
  ringAt(g, WX, WY, WR_IN, (a: number) => STEEL[Math.round(2 + (1 - litAt(a)) * 3)]);
  // The hub: a drum in steps, its bolts going round with it
  for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) {
    const d = Math.hypot(x, y);
    if (d > 6.3) continue;
    R(g, WX + x, WY + y, 1, 1, d > 5.4 ? STEEL[0] : rampAt(STEEL, 0.55 - (x + y) / 16, WX + x, WY + y));
  }
  for (let k = 0; k < 6; k++) { const a = a0 + (k / 6) * Math.PI * 2; R(g, Math.round(WX + Math.cos(a) * 4), Math.round(WY + Math.sin(a) * 4), 1, 1, STEEL[6]); }
  // The cars, hanging straight down off the rim, swinging a touch
  for (let i = 0; i < CARS_ON; i++) {
    const a = a0 + ((i + 0.5) / CARS_ON) * Math.PI * 2;
    paintCar(g, Math.round(WX + Math.cos(a) * WR), Math.round(WY + Math.sin(a) * WR), i, Math.round(Math.sin(a * 3 + i)));
  }
};

/** Where the A-frame's near legs come down onto the deck. */
const LEG_L = WX - 22, LEG_R = WX + 21;
/** The queue on the deck. */
const QUEUE = [370, 375, 381, 386, 391];
const buildWheelBase = () => {
  const back = canvas(TITLE_W, TITLE_H), front = canvas(TITLE_W, TITLE_H);
  let g = back.getContext('2d')!;
  // The far legs, in the shade behind the wheel, and their brace
  line(g, WX + 2, WY - 1, LEG_L + 4, DECK_Y, STEEL[1], 2); line(g, WX + 2, WY - 1, LEG_R + 4, DECK_Y, STEEL[1], 2);
  line(g, LEG_L + 10, 86, LEG_R - 2, 86, STEEL[1]);
  g = front.getContext('2d')!;
  // The near legs: girders, inked, lit down their left edges, braced across and crosswise between them
  const legX = (x1: number, y: number) => WX + (x1 - WX) * (y - WY) / (DECK_Y - WY);
  for (const x1 of [LEG_L, LEG_R]) {
    line(g, WX - 1, WY, x1 - 1, DECK_Y, INK, 4);
    line(g, WX, WY, x1, DECK_Y, STEEL[3], 2);
    line(g, WX, WY, x1, DECK_Y, STEEL[5]);
    line(g, WX + 1, WY + 1, x1 + 1, DECK_Y, STEEL[1]);
    // (rivets down it)
    for (let y = WY + 10; y < DECK_Y - 2; y += 6) R(g, Math.round(legX(x1, y)) + 1, y, 1, 1, STEEL[6]);
  }
  for (const y of [80, 93]) {
    const l = Math.round(legX(LEG_L, y)) + 3, r = Math.round(legX(LEG_R, y)) - 1;
    R(g, l, y - 1, r - l, 3, INK); R(g, l, y, r - l, 1, STEEL[4]); R(g, l, y + 1, r - l, 1, STEEL[2]);
  }
  line(g, legX(LEG_L, 81) + 3, 81, legX(LEG_R, 92) - 2, 92, STEEL[2]); line(g, legX(LEG_R, 81) - 2, 81, legX(LEG_L, 92) + 3, 92, STEEL[2]);
  // (the axle's cap over the hub, the hub's light)
  for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) { const d = Math.hypot(x, y); if (d <= 3.2) R(g, WX + x, WY + y, 1, 1, d > 2.4 ? INK : rampAt(STEEL, 0.75 - (x + y) / 8, WX + x, WY + y)); }
  // The booth under the deck: candy-striped boards, lit on their left, dark under the deck; its sign, TICKETS; its
  // window, lit, the attendant in it in his cap
  for (let y = DECK_Y + 5; y < HORIZON; y++) for (let x = HOUSE_X0; x < DECK_X1; x++) {
    const s = Math.floor((x - HOUSE_X0) / 4) % 2, p = (x - HOUSE_X0) % 4;
    const ramp = s ? ['#5a0a34', '#a01c5a', '#ec4899', '#ff9ccc'] : ['#7a5a38', '#c8a070', '#f0d8a8', '#fff4d8'];
    let v = p === 0 ? 1 : p === 3 ? 0.2 : 0.62;
    if (y < DECK_Y + 8) v -= 0.35 - (y - DECK_Y - 5) * 0.08;
    R(g, x, y, 1, 1, rampAt(ramp, v - (y - DECK_Y) * 0.004, x, y));
  }
  R(g, HOUSE_X0 - 1, DECK_Y + 5, 1, HORIZON - DECK_Y - 5, INK);
  const SX0 = 357, SY0 = 108, SW = 33, SH = 9;
  R(g, SX0 - 1, SY0 - 1, SW + 2, SH + 2, INK);
  R(g, SX0, SY0, SW, SH, GOLD[2]); R(g, SX0, SY0, SW, 1, GOLD[4]); R(g, SX0, SY0, 1, SH, GOLD[3]); R(g, SX0, SY0 + SH - 1, SW, 1, GOLD[1]); R(g, SX0 + SW - 1, SY0, 1, SH, GOLD[1]);
  R(g, SX0 + 1, SY0 + 1, SW - 2, SH - 2, '#3a0628'); R(g, SX0 + 1, SY0 + 1, SW - 2, 1, '#5a0a3a');
  const TINY: Record<string, string[]> = { T: ['###', '.#.', '.#.', '.#.', '.#.'], I: ['###', '.#.', '.#.', '.#.', '###'], C: ['.##', '#..', '#..', '#..', '.##'], K: ['#.#', '#.#', '##.', '#.#', '#.#'], E: ['###', '#..', '##.', '#..', '###'], S: ['.##', '#..', '.#.', '..#', '##.'] };
  let tx = SX0 + 3;
  for (const ch of 'TICKETS') {
    const gl = TINY[ch];
    for (let r = 0; r < 5; r++) for (let k = 0; k < 3; k++) if (gl[r][k] === '#') { R(g, tx + k + 1, SY0 + 3 + r, 1, 1, '#1a0210'); R(g, tx + k, SY0 + 2 + r, 1, 1, r === 0 ? '#ffffff' : r < 3 ? '#fff2c4' : '#fcd36a'); }
    tx += 4;
  }
  // (the window: a gold frame, lit inside, him in it, the counter)
  const WX0 = 362, WY0 = 119;
  R(g, WX0 - 1, WY0 - 1, 15, 9, INK); R(g, WX0, WY0, 13, 7, GOLD[1]); R(g, WX0, WY0, 13, 1, GOLD[3]);
  for (let y = WY0 + 1; y < WY0 + 7; y++) R(g, WX0 + 1, y, 11, 1, ['#fff4c0', '#fde68a', '#fcd060', '#f8b040', '#f0a030', '#e08a28'][y - WY0 - 1]);
  R(g, WX0 + 5, WY0 + 1, 3, 1, '#d02a3a'); R(g, WX0 + 4, WY0 + 2, 5, 1, '#a01a2a');
  R(g, WX0 + 5, WY0 + 3, 3, 2, '#e8b088'); R(g, WX0 + 5, WY0 + 3, 1, 1, '#1a1010'); R(g, WX0 + 7, WY0 + 3, 1, 1, '#1a1010');
  R(g, WX0 + 3, WY0 + 5, 7, 2, '#d02a3a'); R(g, WX0 + 3, WY0 + 5, 1, 2, '#ff6a7a');
  R(g, WX0 - 1, WY0 + 7, 15, 1, '#c88a50'); R(g, WX0 - 1, WY0 + 8, 15, 1, '#5a2a18');
  // The loading deck: planks lit along the top, their seams, inked under; the gold fascia the bulbs are on; the
  // brace under its overhang
  line(g, DECK_X0 + 2, DECK_Y + 4, HOUSE_X0, DECK_Y + 8, STEEL[2], 1); line(g, DECK_X0 + 2, DECK_Y + 3, HOUSE_X0, DECK_Y + 7, INK, 1);
  R(g, DECK_X0 - 1, DECK_Y - 1, DECK_X1 - DECK_X0 + 2, 7, INK);
  R(g, DECK_X0, DECK_Y, DECK_X1 - DECK_X0, 1, '#ffe0a8');
  for (let x = DECK_X0; x < DECK_X1; x++) for (let k = 1; k < 3; k++) R(g, x, DECK_Y + k, 1, 1, (x - DECK_X0) % 7 === 6 ? '#3a1810' : rampAt(['#5a2a18', '#8a4a28', '#b06a38'], k === 1 ? 0.8 : 0.35, x, DECK_Y + k));
  R(g, DECK_X0, DECK_Y + 3, DECK_X1 - DECK_X0, 1, GOLD[3]); R(g, DECK_X0, DECK_Y + 4, DECK_X1 - DECK_X0, 1, GOLD[1]);
  // (the legs' feet: gold caps bolted to the deck)
  for (const x1 of [LEG_L, LEG_R]) { R(g, x1 - 2, DECK_Y - 2, 6, 3, INK); R(g, x1 - 1, DECK_Y - 1, 4, 1, GOLD[3]); R(g, x1 - 1, DECK_Y, 4, 1, GOLD[1]); }
  // The queue waiting on the deck (a balloon on one, bobbing, drawn each frame), behind the railing
  QUEUE.forEach((x, i) => {
    const kid = i === 2, top = DECK_Y - (kid ? 5 : 7);
    R(g, x - 1, top - 1, 4, DECK_Y - top + 1, '#0a0410');
    R(g, x, top, 2, 1, GUEST_HAIR[(i * 2) % 6]); R(g, x, top + 1, 2, 1, GUEST_SKIN[(i * 3) % 5]);
    R(g, x, top + 2, 2, kid ? 1 : 2, SHIRTS[(i * 3 + 1) % 8]); R(g, x, top + 2, 1, 1, '#fffbe0');
    R(g, x, DECK_Y - 2, 1, 2, '#2a2a4a'); R(g, x + 1, DECK_Y - 2, 1, 2, '#1a1a30');
  });
  // (the railing along the deck, the gap at its left end to board through)
  R(g, 367, DECK_Y - 5, DECK_X1 - 367, 1, INK); R(g, 367, DECK_Y - 4, DECK_X1 - 367, 1, GOLD[3]);
  for (let x = 367; x < DECK_X1; x += 5) { R(g, x, DECK_Y - 4, 1, 4, GOLD[2]); R(g, x + 1, DECK_Y - 3, 1, 3, GOLD[0]); }
  R(g, 367, DECK_Y - 2, DECK_X1 - 367, 1, '#a06c1080');
  return { back, front };
};
/** The bulbs along the deck's fascia. */
const DECK_BULBS: number[] = [];
for (let x = DECK_X0 + 2; x < DECK_X1 - 1; x += 4) DECK_BULBS.push(x);

// ---------------------------------------------------------------------------
// The banners
// ---------------------------------------------------------------------------

/** A park banner, flat: candy stripes (lit on one edge, shaded on the other), a gold star on a navy field, a gold
 *  fringe, a swallowtail end, inked round; in three lights (shaded, flat, catching light). */
const FLAG_W = 40, FLAG_H = 21;
const buildFlags = () => ([
  { a: ['#5a0a3a', '#8a1450', '#a02060'], b: ['#7a6038', '#a89058', '#c0a868'], star: '#a08020', fr: '#7a5a10' },
  { a: ['#b8286a', '#ec4899', '#f882bc'], b: ['#e0c070', '#fde68a', '#fff4c8'], star: '#f8c820', fr: '#d8a020' },
  { a: ['#e8489a', '#ff82c0', '#ffb8dc'], b: ['#fde68a', '#fffbe0', '#ffffff'], star: '#fff2a0', fr: '#fcd850' },
].map(p => {
  const c = canvas(FLAG_W, FLAG_H), g = c.getContext('2d')!;
  const on = (x: number, y: number) => {
    if (x < 0 || x >= FLAG_W || y < 0 || y >= FLAG_H - 1) return false;
    const notch = x > FLAG_W - 9 ? Math.round((x - (FLAG_W - 9)) * 1.1) : 0;
    return Math.abs(y - 10) >= notch;
  };
  for (let x = 0; x < FLAG_W; x++) for (let y = 0; y < FLAG_H - 1; y++) {
    if (!on(x, y)) continue;
    const s = Math.floor((x + y) / 5) % 2, q = (x + y) % 5, ramp = s ? p.b : p.a;
    let col = ramp[q === 0 ? 2 : q === 4 ? 0 : 1];
    if (x > 0 && (!on(x + 1, y) || !on(x, y - 1) || !on(x, y + 1))) col = INK;
    R(g, x, y, 1, 1, col);
  }
  // (the fringe along its foot)
  for (let x = 1; x < FLAG_W - 9; x++) R(g, x, FLAG_H - 1, 1, 1, x % 2 ? p.fr : p.star);
  const star = ['..#..', '..#..', '#####', '.###.', '.#.#.'];
  R(g, 3, 4, 13, 13, INK); R(g, 4, 5, 11, 11, '#2a1060'); R(g, 4, 5, 11, 1, '#4a2a90'); R(g, 4, 5, 1, 11, '#3a1a78');
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) if (star[y][x] === '#') R(g, 7 + x, 8 + y, 1, 1, y < 2 ? '#fffbe0' : p.star);
  return c;
}));

/** A banner on its pole, waving: flying right of the pole (`dir` 1) or left (-1, the wind's way). */
const drawFlag = (g: Ctx, flags: HTMLCanvasElement[], poleX: number, topY: number, bottomY: number, t: number, seed: number, dir = 1) => {
  R(g, poleX - 1, topY - 2, 4, bottomY - topY + 2, INK);
  R(g, poleX, topY - 2, 2, bottomY - topY + 2, '#8c8098'); R(g, poleX, topY - 2, 1, bottomY - topY + 2, '#e8e0f0');
  R(g, poleX - 1, topY - 6, 4, 4, INK); R(g, poleX, topY - 5, 2, 2, GOLD[2]); R(g, poleX, topY - 5, 1, 1, GOLD[4]);
  g.save();
  if (dir < 0) { g.translate(poleX * 2 + 1, 0); g.scale(-1, 1); }
  for (let c = 0; c < FLAG_W; c++) {
    const ph = c * 0.26 - t * 0.09 + seed;
    const dy = Math.round(Math.sin(ph) * 2.2 * (c / FLAG_W));
    const slope = Math.cos(ph) * dir;
    g.drawImage(flags[slope > 0.55 ? 2 : slope < -0.55 ? 0 : 1], c, 0, 1, FLAG_H, poleX + 2 + c, topY + dy, 1, FLAG_H);
  }
  g.restore();
};

// ---------------------------------------------------------------------------
// The logo: MEATHEAD 2, cut the way Meathead 1's is, in candy colors
// ---------------------------------------------------------------------------

const GLYPHS: Record<string, string[]> = {
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  E: ['####', '#...', '#...', '###.', '#...', '#...', '####'],
  A: ['.##.', '#..#', '#..#', '####', '#..#', '#..#', '#..#'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  H: ['#..#', '#..#', '#..#', '####', '#..#', '#..#', '#..#'],
  D: ['###.', '#..#', '#..#', '#..#', '#..#', '#..#', '###.'],
  '2': ['.##.', '#..#', '...#', '..#.', '.#..', '#...', '####'],
  ' ': ['.', '.', '.', '.', '.', '.', '.'],
};
const WORD = 'MEATHEAD 2';
const CELL_W = 6, CELL_H = 5;
const PAD = 8;
const SLANT = 6;
/** The letters' face, top to bottom: cotton-candy yellow going gold, a dark line across the middle, the lower half pink. */
const FACE_TOP = ['#fffbe8', '#fff4b8', '#fff0a0', '#fde070', '#fdd84a', '#f8b020', '#ec8410'].map(rgbOf);
const FACE_BOT = ['#5a0636', '#6a0840', '#9a1260', '#cc2a84', '#ee5aa8', '#ff9ccc', '#ffc4e2'].map(rgbOf);
/** The 2's: sky blue, the rides' lights. */
const TWO_TOP = ['#f0fcff', '#d0f6ff', '#b8f0ff', '#6ad8fc', '#30b0f0', '#2098e4', '#1a84d8'].map(rgbOf);
const TWO_BOT = ['#081e56', '#0a2a6a', '#12408e', '#1a62b8', '#3a8ce0', '#7ac0ff', '#b0dcff'].map(rgbOf);

/** The logo, whole, and a letter at a time (the intro stamps them on one by one): each letter's slice of the finished
 *  art (outline, bevel, drop shadow and all), cut between the letters along their slant, the slices adding back up to
 *  the whole. */
interface Logo { art: HTMLCanvasElement; face: HTMLCanvasElement; x: number; y: number; w: number; h: number; letters: HTMLCanvasElement[]; ends: number[] }

const buildLogo = (): Logo => {
  const cols = [...WORD].reduce((n, ch, i) => n + GLYPHS[ch][0].length + (i ? 1 : 0), 0);
  const faceH = 7 * CELL_H, lean = Math.floor((faceH - 1) / SLANT);
  const w = cols * CELL_W + lean + PAD * 2, h = faceH + PAD * 2;
  // (1 on the MEATHEAD, 2 on the 2)
  const F = new Uint8Array(w * h);
  let cx = PAD;
  /** Each letter's columns (unslanted: its bottom row's), start and end. */
  const spans: [number, number][] = [];
  for (const ch of WORD) {
    const gl = GLYPHS[ch], v = ch === '2' ? 2 : 1;
    if (ch !== ' ') spans.push([cx, cx + gl[0].length * CELL_W]);
    for (let r = 0; r < 7; r++) for (let c = 0; c < gl[r].length; c++) if (gl[r][c] === '#') {
      for (let yy = 0; yy < CELL_H; yy++) {
        const y = r * CELL_H + yy, shift = Math.floor((faceH - 1 - y) / SLANT);
        for (let xx = 0; xx < CELL_W; xx++) F[(PAD + y) * w + cx + c * CELL_W + xx + shift] = v;
      }
    }
    cx += (gl[0].length + 1) * CELL_W;
  }
  const D = new Uint8Array(w * h).fill(9);
  for (let i = 0; i < F.length; i++) if (F[i]) D[i] = 0;
  for (let k = 1; k <= 4; k++) for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    if (D[i] < 9) continue;
    if (D[i - 1] === k - 1 || D[i + 1] === k - 1 || D[i - w] === k - 1 || D[i + w] === k - 1 || D[i - w - 1] === k - 1 || D[i - w + 1] === k - 1 || D[i + w - 1] === k - 1 || D[i + w + 1] === k - 1) D[i] = k;
  }
  const art = canvas(w, h + 5), face = canvas(w, h);
  const ag = art.getContext('2d')!, fg = face.getContext('2d')!;
  const img = ag.createImageData(w, h + 5), out = new Uint32Array(img.data.buffer);
  const fimg = fg.createImageData(w, h), fout = new Uint32Array(fimg.data.buffer);
  const INKP = pack(rgbOf(INK)), DEEP = ['#4a0c52', '#360842', '#260634', '#180424', '#0e0216'].map(c => pack(rgbOf(c)));
  const GOLDR = ['#fffad0', '#fff4b0', '#fcd850', '#e8a820', '#b06c0c', '#7a4808'].map(rgbOf);
  const WHITE = rgbOf('#fffcf0');
  const HALO = pack(rgbOf('#6a0e56'));
  for (let k = 5; k >= 1; k--) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (D[y * w + x] <= 3) out[(y + k) * w + x] = DEEP[k - 1];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, d = D[i], dz = bayer(x, y);
    if (d === 1 || d === 3) out[i] = INKP;
    else if (d === 2) {
      // (the gold rim: stepped top to bottom, brighter on its upper left edges)
      const v = (y - PAD + 2) / (faceH + 4);
      let k = Math.round(v * 5 + dz * 0.8);
      if (D[i - w] === 3 || D[i - 1] === 3) k -= 1;
      out[i] = pack(GOLDR[Math.max(0, Math.min(5, k))]);
    } else if (d === 4 && !out[i] && ((x + y) & 1) === 0) out[i] = HALO;
    else if (d === 0) {
      const fy = y - PAD, mid = Math.floor(faceH / 2), two = F[i] === 2;
      const top = two ? TWO_TOP : FACE_TOP, bot = two ? TWO_BOT : FACE_BOT;
      let c: RGB;
      if (fy === mid) c = rgbOf(two ? '#06184a' : '#4c0636');
      else if (fy < mid) c = top[Math.max(0, Math.min(6, Math.round((fy / (mid - 1)) * 6 + dz * 0.9)))];
      else c = bot[Math.max(0, Math.min(6, Math.round(((fy - mid - 1) / (faceH - mid - 2)) * 6 + dz * 0.9)))];
      // (a gloss streak slanting across the upper half, a fainter one after it)
      if (fy > 1 && fy < mid - 1) { const s = (((x - fy * 0.7) % 26) + 26) % 26; if (s < 2) c = mix(c, WHITE, 0.6); else if (s > 4 && s < 6) c = mix(c, WHITE, 0.3); }
      if (!F[i - w] || !F[i - 2 * w] && fy > 1) c = !F[i - w] ? WHITE : mix(c, WHITE, 0.5);
      else if (!F[i - 1]) c = mix(c, WHITE, 0.45);
      if (!F[i + w]) c = mix(c, rgbOf('#3c0430'), 0.6);
      else if (!F[i + 1]) c = mix(c, rgbOf('#5c0846'), 0.45);
      // (a hard glint on each stroke's top left corner)
      if (!F[i - w] && !F[i - 1]) c = rgbOf('#ffffff');
      out[i] = pack(c);
      fout[i] = 0xffffffff;
    }
  }
  ag.putImageData(img, 0, 0); fg.putImageData(fimg, 0, 0);
  // The letters' slices: cut halfway across the gap between each two, the cut leaning with the letters
  const H5 = h + 5;
  const letters = spans.map(([s, e], i) => {
    const left = i === 0 ? -lean - 1 : Math.floor((spans[i - 1][1] + s) / 2);
    const right = i === spans.length - 1 ? w + 1 : Math.floor((e + spans[i + 1][0]) / 2);
    const c = canvas(w, H5), cg = c.getContext('2d')!;
    const li = cg.createImageData(w, H5), lo = new Uint32Array(li.data.buffer);
    for (let y = 0; y < H5; y++) {
      const fy = Math.max(0, Math.min(faceH - 1, y - PAD)), sh = Math.floor((faceH - 1 - fy) / SLANT);
      for (let x = Math.max(0, left + sh); x < Math.min(w, right + sh); x++) lo[y * w + x] = out[y * w + x];
    }
    cg.putImageData(li, 0, 0);
    return c;
  });
  return { art, face, x: Math.round((TITLE_W - w) / 2), y: 106, w, h, letters, ends: spans.map(([, e]) => e + lean) };
};

/** The plate the logo sits on: the park's marquee right across, pointed at the ends, a pink stripe along it, gold
 *  trimmed and riveted (its bulbs are drawn each frame, chasing). */
const PLATE_Y = 126, PLATE_H = 24, PLATE_X0 = 10, PLATE_X1 = TITLE_W - 10;
const plateSpan = (y: number) => { const k = Math.min(y, PLATE_H - 1 - y); return Math.max(0, 10 - k); };
const buildPlate = () => {
  const c = canvas(TITLE_W, TITLE_H), g = c.getContext('2d')!;
  const rows = ['#fff4b0', '#e8a820', '#7a1040', '#5e0c36', '#520a30', '#48082c', '#400728', '#3a0626', '#340524', '#ec4899', '#f9a8d4', '#ec4899', '#300522', '#2c041f', '#28041c', '#25031a', '#220318', '#200316', '#1e0314', '#1c0212', '#b06c0c', '#fcd850', '#3a0420', '#000000'];
  g.fillStyle = '#000000';
  for (let y = 0; y < PLATE_H; y++) { const s = plateSpan(y); g.fillRect(PLATE_X0 + s + 3, PLATE_Y + y + 3, PLATE_X1 - PLATE_X0 - s * 2, 1); }
  for (let y = 0; y < PLATE_H; y++) {
    const s = plateSpan(y), x0 = PLATE_X0 + s, x1 = PLATE_X1 - s;
    R(g, x0, PLATE_Y + y, x1 - x0, 1, rows[y]);
    // (the velvet field: dithered into the next row down where they meet, a fine diagonal nap)
    const field = (y >= 2 && y <= 7) || (y >= 12 && y <= 18);
    if (field) for (let x = x0 + 1; x < x1 - 1; x++) {
      if (bayer(x, y) > 0.25) R(g, x, PLATE_Y + y, 1, 1, rows[y + 1]);
      if ((x + y * 2) % 11 === 0) R(g, x, PLATE_Y + y, 1, 1, hexOf(mix(rgbOf(rows[y]), [255, 140, 200], 0.14)));
    }
    // (the pink stripe's sheen: glints along it)
    if (y === 10) for (let x = x0 + 8; x < x1 - 8; x += 22) { R(g, x, PLATE_Y + y, 4, 1, '#ffe4f2'); R(g, x + 1, PLATE_Y + y, 1, 1, '#ffffff'); }
    R(g, x0, PLATE_Y + y, 1, 1, '#000000'); R(g, x1 - 1, PLATE_Y + y, 1, 1, '#000000');
  }
  // (rivets along the gold trims)
  for (let x = PLATE_X0 + 20; x < PLATE_X1 - 20; x += 12) {
    for (const y of [PLATE_Y + 1, PLATE_Y + 21]) { R(g, x, y, 1, 1, '#7a4a08'); R(g, x - 1, y, 1, 1, '#fffbe0'); }
  }
  return c;
};
/** The marquee's bulbs: along its top and bottom, and round its pointed ends. */
const PLATE_BULBS: [number, number][] = [];
for (let x = PLATE_X0 + 14; x < PLATE_X1 - 14; x += 6) { PLATE_BULBS.push([x, PLATE_Y + 4]); PLATE_BULBS.push([x, PLATE_Y + PLATE_H - 6]); }
for (const [x, y] of [[PLATE_X0 + 8, PLATE_Y + 8], [PLATE_X0 + 5, PLATE_Y + 12], [PLATE_X0 + 8, PLATE_Y + 16], [PLATE_X1 - 9, PLATE_Y + 8], [PLATE_X1 - 6, PLATE_Y + 12], [PLATE_X1 - 9, PLATE_Y + 16]] as [number, number][]) PLATE_BULBS.push([x, y]);

// ---------------------------------------------------------------------------
// GOES TO HAPPY LAND, on a ribbon under the plate
// ---------------------------------------------------------------------------

const SMALL: Record<string, string[]> = {
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  N: ['#...#', '##..#', '#.#.#', '#.#.#', '#..##', '#...#', '#...#'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
};
const SUBTITLE = 'GOES TO HAPPY LAND';
const RIBBON_Y = 152;

const buildRibbon = () => {
  const c = canvas(TITLE_W, TITLE_H), g = c.getContext('2d')!;
  const tw = [...SUBTITLE].reduce((n, ch) => n + (ch === ' ' ? 4 : 6), 0) - 1;
  const x0 = Math.round((TITLE_W - tw) / 2), bx0 = x0 - 10, bx1 = x0 + tw + 10, h = 11;
  // (its tails, folded behind, swallowtailed)
  for (const [x, dir] of [[bx0 - 9, 1], [bx1 + 1, -1]] as [number, number][]) {
    for (let k = 0; k < 9; k++) for (let y = 0; y < h; y++) {
      const notch = dir > 0 ? 9 - k : k + 1;
      if (Math.abs(y - 5) < notch - 5) continue;
      R(g, x + k, RIBBON_Y + 3 + y, 1, 1, y < 2 ? '#a8125e' : '#7a0a44');
    }
  }
  R(g, bx0 - 1, RIBBON_Y + 2, 2, h + 1, '#3a0420'); R(g, bx1 - 1, RIBBON_Y + 2, 2, h + 1, '#3a0420');
  // (the band itself, stepped light to dark top to bottom, inked)
  const BAND = ['#ffb0d8', '#f472b6', '#ec4899', '#ec4899', '#db2777', '#db2777', '#be185d', '#be185d', '#9d174d', '#831843', '#5a0a30'];
  R(g, bx0, RIBBON_Y - 1, bx1 - bx0, h + 2, '#12041a');
  for (let y = 0; y < h; y++) R(g, bx0 + 1, RIBBON_Y + y, bx1 - bx0 - 2, 1, BAND[y]);
  // (the letters: cream, lit along their tops, a dark drop shadow)
  let x = x0;
  for (const ch of SUBTITLE) {
    if (ch === ' ') { x += 4; continue; }
    const gl = SMALL[ch];
    for (let r = 0; r < 7; r++) for (let k = 0; k < 5; k++) if (gl[r][k] === '#') R(g, x + k + 1, RIBBON_Y + 3 + r, 1, 1, '#4a0628');
    for (let r = 0; r < 7; r++) for (let k = 0; k < 5; k++) if (gl[r][k] === '#') R(g, x + k, RIBBON_Y + 2 + r, 1, 1, r < 2 ? '#ffffff' : r < 5 ? '#fff2c4' : '#fcd36a');
    x += 6;
  }
  return c;
};

// ---------------------------------------------------------------------------
// The whole picture
// ---------------------------------------------------------------------------

interface Bit { x: number; y: number; vy: number; ph: number; col: string; back: string }
const CONFETTI: [string, string][] = [['#ff5aa8', '#b0206a'], ['#fde047', '#b08a10'], ['#5eead4', '#1a9a8a'], ['#a78bfa', '#5a3ab0'], ['#fffcf0', '#b8b0c0'], ['#4ade80', '#1a8a40'], ['#fb923c', '#a8501a']];
const STARS = 54;
const STAR_COLS = ['#fffcf0', '#a890d0', '#c8d8ff', '#ffe0c0'];
/** The fireworks' colors: each a ramp from white-hot down to out. */
const BURSTS = [
  ['#ffffff', '#ffd0ea', '#ff5aa8', '#c0207a', '#6a0c46'],
  ['#ffffff', '#fff2a0', '#fdd020', '#d88a10', '#7a3a06'],
  ['#ffffff', '#c8f8ff', '#40d8f8', '#1a84c8', '#0a3a6a'],
  ['#ffffff', '#d0ffd8', '#4ade80', '#1a9a4a', '#0a4a22'],
  ['#ffffff', '#ecdcff', '#a78bfa', '#6a3ad0', '#2e1468'],
];
/** A firework every this many frames, each on its own clock (rising, bursting, falling off), out to the sides of him. */
const FW_EVERY = 46, FW_LIFE = 120, FW_RISE = 26, FW_SPARKS = 30;
const RIM_OUT = '#ff4fa0', RIM_IN = '#ffd8ee';

const drawFirework = (g: Ctx, k: number, age: number) => {
  const side = hash2(k, 1) < 0.5 ? -1 : 1;
  const cx = Math.round(CX + side * (90 + hash2(k, 2) * 100)), cy = Math.round(18 + hash2(k, 3) * 62);
  const ramp = BURSTS[Math.floor(hash2(k, 4) * BURSTS.length)];
  if (age < FW_RISE) {
    // (the rocket going up, a spark trailing)
    const f = age / FW_RISE, y = Math.round(HORIZON - (HORIZON - cy) * (1 - (1 - f) ** 2));
    const x = cx + Math.round((1 - f) * side * 6);
    R(g, x, y, 1, 2, '#fff2c0');
    if (age % 2) R(g, x, y + 3 + (age % 3), 1, 1, '#f8a040');
    if (age % 3 === 0) R(g, x + ((age >> 1) % 2 ? 1 : -1), y + 5, 1, 1, '#a04020');
    return;
  }
  const n = age - FW_RISE, life = FW_LIFE - FW_RISE;
  // (the flash as it goes, a ring of light round it)
  if (n < 3) { R(g, cx - 2, cy, 5, 1, '#ffffff'); R(g, cx, cy - 2, 1, 5, '#ffffff'); }
  if (n >= 1 && n < 5) for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; R(g, Math.round(cx + Math.cos(a) * n * 2), Math.round(cy + Math.sin(a) * n * 2), 1, 1, ramp[1]); }
  const drag = 0.955, travel = (1 - drag ** n) / (1 - drag), fall = 0.012 * n * n * 0.5;
  const step = Math.min(ramp.length - 1, Math.floor((n / life) * ramp.length * 1.1));
  for (let i = 0; i < FW_SPARKS; i++) {
    const a = (i / FW_SPARKS) * Math.PI * 2 + hash2(k, 5) * 3, sp = 0.9 + hash2(k * 31 + i, 6) * 0.5;
    const x = Math.round(cx + Math.cos(a) * sp * travel), y = Math.round(cy + Math.sin(a) * sp * travel + fall);
    // (fading out: flickering, a spark at a time, at the end; crackling white now and then)
    if (n > life * 0.7 && ((n + i) & 1)) continue;
    R(g, x, y, 1, 1, n > life * 0.5 && (n + i * 7) % 11 === 0 ? '#ffffff' : ramp[step]);
    if (n < life * 0.45) R(g, Math.round(cx + Math.cos(a) * sp * travel * 0.8), Math.round(cy + Math.sin(a) * sp * travel * 0.8 + fall * 0.7), 1, 1, ramp[Math.min(ramp.length - 1, step + 1)]);
    if (n < life * 0.3) R(g, Math.round(cx + Math.cos(a) * sp * travel * 0.6), Math.round(cy + Math.sin(a) * sp * travel * 0.6 + fall * 0.5), 1, 1, ramp[Math.min(ramp.length - 1, step + 2)]);
  }
};

/** A searchlight's beam, from behind the park, swinging: a pale wedge row by row (crisp: whole pixels), brighter in
 *  its middle. */
const drawBeam = (g: Ctx, baseX: number, ang: number) => {
  const dx = Math.sin(ang), dy = -Math.cos(ang);
  for (let y = HORIZON - 12; y >= 0; y--) {
    const s = (HORIZON - 12 - y) / Math.max(0.2, -dy);
    const cx = baseX + dx * s, w = 2 + s * 0.09;
    g.fillStyle = 'rgba(200, 190, 255, 0.07)';
    g.fillRect(Math.round(cx - w), y, Math.round(w * 2), 1);
    g.fillStyle = 'rgba(230, 220, 255, 0.07)';
    g.fillRect(Math.round(cx - w * 0.45), y, Math.round(w * 0.9), 1);
  }
};

// ---------------------------------------------------------------------------
// The intro: the park dropped in a piece at a time on the theme's opening, him popping up behind the marquee, the
// logo stamped on a letter at a time
// ---------------------------------------------------------------------------

/** The intro's clock is the theme's beats (150 a minute: 24 frames a beat). Everything lands on a hit of its four-bar
 *  opening (music/songs/title.ts): Meathead 1's riff on the guitars (bar 1: E E . E G A, the crash on 1, the snare on
 *  3 and 4; bar 2: E E . E C D, the crash on 1 again), then the band crashing in on C and D (bar 3: brass stabs,
 *  timpani and the orchestra hit on 1 and 3). */
const BEAT_F = 24;
/** The scene's one eye (the lot's stall lines run to it): where the logo's letters fly in from the camera along. */
const VPX = CX, VPY = HORIZON;
/** A piece of the park dropping in: the beat it lands on; how far it falls (screen pixels, from off the top: the same
 *  fall time for all, so the nearer, bigger things come down faster); how hard it squashes, by depth (the far skyline
 *  barely, the near lot and the marquee most), and whether across too (the lot's pieces span both sides: up and down
 *  only); where it meets the ground (its squash's anchor, straight under it: it never slides sideways); where its dust
 *  goes up; the shake it lands with. */
interface Piece { at: number; D: number; k: number; kx: number; ax: number; ay: number; dust: [number, number][]; shake: number }
const piece = (at: number, D: number, k: number, kx: number, ax: number, ay: number, dust: [number, number][], shake: number): Piece => ({ at, D, k, kx, ax, ay, dust, shake });
const PIECES = {
  castle: piece(0, 160, 0.6, 1, CX, HORIZON, [[112, 288]], 1),
  coaster: piece(2, 160, 0.6, 1, 50, HORIZON, [[2, 98]], 1),
  wheel: piece(4, 236, 0.9, 1, WX, HORIZON, [[DECK_X0 - 6, WX - 6], [WX + 6, TITLE_W + 4]], 3),
  lotFar: piece(6, 170, 0.7, 0, CX, HORIZON + 5, [], 0),
  lotNear: piece(6, 210, 0.85, 0, CX, 172, [[2, 96], [304, 398]], 0),
  lamps: piece(6, 330, 1, 0, CX, TITLE_H, [], 0),
  flags: piece(6, 170, 0.8, 0, CX, HORIZON, [], 0),
  plate: piece(6, 190, 1, 1, CX, PLATE_Y + PLATE_H, [], 3),
};
/** Main Street's three stretches: the left on the riff's second E, the middle and right on its third. */
const ROOFS = [piece(4.5, 160, 0.5, 1, 66, HORIZON, [[0, 133]], 1), piece(5.5, 160, 0.5, 1, 200, HORIZON, [[133, 267]], 1), piece(5.5, 160, 0.5, 1, 333, HORIZON, [[267, 400]], 1)];
/** Him popping up behind the marquee (the riff's last D); the logo's letters a sixteenth apart from the C stab, the 2
 *  on the D stab; done (the bulbs on, the ribbon out) a beat after. */
const FACE_AT = 7, TWO_AT = 10;
export const INTRO_END = 11;
const letterAt = (i: number) => (i < 8 ? 8 + i * 0.25 : TWO_AT);
const IMPACTS: [number, number][] = [
  ...[...Object.values(PIECES), ...ROOFS].filter(p => p.shake).map(p => [p.at, p.shake] as [number, number]),
  [FACE_AT, 2], ...Array.from({ length: 8 }, (_, i) => [letterAt(i), 1] as [number, number]), [TWO_AT, 5],
];

/** A piece's pose, `f` frames from its landing: falling (stretched), the thud (squashed), a bounce, settling. */
interface Pose { hide: boolean; dy: number; sx: number; sy: number }
const REST: Pose = { hide: false, dy: 0, sx: 1, sy: 1 };
const HIDE: Pose = { hide: true, dy: 0, sx: 1, sy: 1 };
const FALL = 9;
const poseOf = (f: number, p: Piece): Pose => {
  const { D, k, kx } = p;
  if (f < -FALL) return HIDE;
  if (f < 0) { const q = -f / FALL; return { hide: false, dy: -Math.round((D * q * q) / 2) * 2, sx: 1 - 0.08 * k * kx, sy: 1 + 0.16 * k }; }
  if (f < 3) return { hide: false, dy: 0, sx: 1 + 0.16 * k * kx, sy: 1 - 0.24 * k };
  if (f < 6) return { hide: false, dy: -Math.round(5 * k), sx: 1 - 0.04 * k * kx, sy: 1 + 0.08 * k };
  if (f < 9) return { hide: false, dy: 0, sx: 1 + 0.05 * k * kx, sy: 1 - 0.07 * k };
  return REST;
};
/** Him: shooting up from below the bottom of the screen (stretched, slowing as he gets there), over the top, squashed
 *  back down, settling. */
const RISE = 10;
const popOf = (f: number): Pose => {
  if (f < -RISE) return HIDE;
  if (f < 0) { const q = -f / RISE; return { hide: false, dy: Math.round((TITLE_H * q * q) / 2) * 2, sx: 0.86, sy: 1.18 }; }
  if (f < 3) return { hide: false, dy: -8, sx: 0.92, sy: 1.1 };
  if (f < 6) return { hide: false, dy: 3, sx: 1.12, sy: 0.88 };
  if (f < 9) return { hide: false, dy: -1, sx: 0.97, sy: 1.04 };
  return REST;
};

/** The thud's dust: round puffs along where it landed, rolling outward and up, going from bright to dusk and
 *  dithering out; smaller for the far things. Each puff lit on its top, shaded under. */
const DUST = [['#fff4fa', '#f4dcef', '#c8a4d0'], ['#e4c8e4', '#c8a4d0', '#8a6a98'], ['#a888b4', '#8a6a98', '#5a4468']];
const drawDust = (g: Ctx, f: number, p: Piece) => {
  if (f < 0 || f >= 18 || !p.dust.length) return;
  const k = p.k, ramp = DUST[f < 6 ? 0 : f < 12 ? 1 : 2];
  const r = Math.min(7, Math.round(1 + f * 0.4 * k));
  for (const [x0, x1] of p.dust) {
    const n = Math.max(2, Math.round((x1 - x0) / 16)), mid = (x0 + x1) / 2;
    for (let i = 0; i < n; i++) {
      const bx = x0 + ((i + 0.5) * (x1 - x0)) / n, dir = bx < mid ? -1 : 1;
      const x = Math.round(bx + dir * f * 0.7 * k + (hash2(i, x0) - 0.5) * 4), y = Math.round(p.ay - r - f * 0.25 * k);
      for (let yy = -r; yy <= r; yy++) {
        if (f >= 12 && (yy + i + f) & 1) continue;
        const hw = Math.round(Math.sqrt(r * r - yy * yy));
        R(g, x - hw, y + yy, hw * 2 + 1, 1, yy < -r / 3 ? ramp[0] : yy < r / 2 ? ramp[1] : ramp[2]);
      }
    }
  }
};
/** A four-point sparkle, `f` frames in: a glint, wide, a glint, gone. */
const sparkle = (g: Ctx, x: number, y: number, f: number, big = 1) => {
  if (f < 0 || f >= 12) return;
  const s = Math.round((f < 3 ? 2 : f < 7 ? 4 : 2) * big), c = f < 7 ? '#ffffff' : '#fde68a';
  R(g, x - s, y, s * 2 + 1, 1, c); R(g, x, y - s, 1, s * 2 + 1, c);
  if (f < 7) R(g, x - 1, y - 1, 3, 3, c);
};
/** The screen's shake at `beat`: the hardest thud going, dying off over 12 frames, a pixel step every 2; up and down
 *  (and across a touch on the big ones). */
const shakeAt = (beat: number): [number, number] => {
  let m = 0, f0 = 0;
  for (const [at, mag] of IMPACTS) { const f = (beat - at) * BEAT_F; if (f >= 0 && f < 12) { const v = mag * (1 - f / 12); if (v > m) { m = v; f0 = f; } } }
  if (m < 0.5) return [0, 0];
  const sg = Math.floor(f0 / 2) % 2 ? -1 : 1;
  return [m >= 3 ? sg * Math.round(m / 3) : 0, sg * Math.round(m)];
};
export const createTitleScene = () => {
  // (his stills painted ahead in idle moments: the intro would otherwise stop to paint each as his face pops in)
  prewarmTitleMeathead();
  let sky: HTMLCanvasElement | null = null, park: Park | null = null, plate: HTMLCanvasElement | null = null;
  let ribbon: HTMLCanvasElement | null = null, flags: HTMLCanvasElement[] = [], logo: Logo | null = null;
  let wheelBase: { back: HTMLCanvasElement; front: HTMLCanvasElement } | null = null;
  const wheel = canvas(TITLE_W, TITLE_H);
  let wheelRot = -1;
  const bust = canvas(ART_W, ART_H), sil = canvas(ART_W + 8, ART_H + 8), him = canvas(ART_W + 8, ART_H + 8), glint = canvas(1, 1);
  /** His body under the close-up as he comes up (the intro). */
  const torso = canvas(ART_W + 8, TITLE_H + 40);
  /** The scene's frames the 2 landed on (his fury's clock), the fireworks started, the intro finished; the confetti's
   *  started coming down. */
  let furyAt: number | null = null, fwAt: number | null = null, doneAt: number | null = null, confettiOn = false;
  const bits: Bit[] = [];
  const spawn = (b?: Bit, anywhere = false): Bit => {
    const n = b || ({} as Bit);
    n.x = Math.random() * TITLE_W; n.y = anywhere ? Math.random() * TITLE_H : -4;
    n.vy = 0.3 + Math.random() * 0.45; n.ph = Math.random() * 100;
    const [col, back] = CONFETTI[Math.floor(Math.random() * CONFETTI.length)];
    n.col = col; n.back = back;
    return n;
  };
  for (let i = 0; i < 46; i++) bits.push(spawn(undefined, true));

  /** Draws frame `t` (60 a second) onto `g`, a TITLE_W x TITLE_H canvas; `beat` is where the intro is (the theme's
   *  beats: below 0 nothing's come down yet), Infinity once it's done or skipped. */
  const draw = (g: Ctx, t: number, dt = 1, beat = Infinity) => {
    // (a clean slate each frame, whatever the last one left)
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    g.imageSmoothingEnabled = false;
    if (!sky) {
      sky = buildSky(); park = buildPark(); plate = buildPlate(); ribbon = buildRibbon(); flags = buildFlags(); logo = buildLogo();
      wheelBase = buildWheelBase();
      glint.width = logo.w; glint.height = logo.h;
    }
    const live = Number.isFinite(beat);
    /** Frames since the intro's beat `at` (negative before it). */
    const fOf = (at: number) => (beat - at) * BEAT_F;
    // (the moments the intro hands on: skipped, they're long past)
    if (beat >= TWO_AT && furyAt === null) furyAt = live ? t - Math.round(fOf(TWO_AT)) : t - 100;
    if (beat >= TWO_AT - FW_RISE / BEAT_F && fwAt === null) fwAt = live ? t - Math.round(fOf(TWO_AT - FW_RISE / BEAT_F)) : t - 300;
    if (beat >= INTRO_END && doneAt === null) doneAt = t;
    if (beat >= TWO_AT && !confettiOn) {
      confettiOn = true;
      // (on the 2: a shower of it from the top; skipped, it's already coming down everywhere)
      if (live) for (const b of bits) { spawn(b); b.y = -4 - Math.random() * 110; }
    }
    /** Draws a piece of the park where it is in its drop (squashed on its own ground line), then its dust. */
    const put = (p: Piece, fn: () => void, dust = true) => {
      const f = fOf(p.at), q = poseOf(f, p);
      if (q.hide) return;
      if (q === REST) fn();
      else { g.save(); g.translate(p.ax, p.ay + q.dy); g.scale(q.sx, q.sy); g.translate(-p.ax, -p.ay); fn(); g.restore(); }
      if (dust) drawDust(g, f, p);
    };

    g.drawImage(sky, 0, 0);
    // (everything but the sky shakes with the thuds)
    const [shx, shy] = shakeAt(beat);
    g.save();
    g.translate(shx, shy);
    // (stars, out up in the night at the top, in their colors, a few of them twinkling)
    for (let i = 0; i < STARS; i++) {
      const x = Math.floor(hash2(i, 3) * TITLE_W), y = Math.floor(hash2(i, 5) ** 1.6 * 58) + 1;
      if (Math.hypot(x - MOON_X, y - MOON_Y) < MOON_R + 3) continue;
      const tw = (t + i * 37) % 170;
      if (tw < 8) continue;
      const c = STAR_COLS[Math.floor(hash2(i, 9) * STAR_COLS.length)];
      R(g, x, y, 1, 1, c);
      if (tw > 160 || hash2(i, 11) < 0.08) { R(g, x - 1, y, 3, 1, tw > 160 ? c : '#3a2a6a'); R(g, x, y - 1, 1, 3, tw > 160 ? c : '#3a2a6a'); R(g, x, y, 1, 1, c); }
    }
    // The searchlights, swinging back and forth from behind the park (on with the first thud)
    if (beat >= PIECES.castle.at) {
      drawBeam(g, 100, Math.sin(t * 0.011) * 0.55 + 0.15);
      drawBeam(g, 300, Math.sin(t * 0.009 + 2) * 0.55 - 0.15);
    }
    // The fireworks (each one on its own clock: two or three going at once; the first bursting on the 2)
    if (fwAt !== null) {
      const ft = t - fwAt;
      for (let k = Math.max(0, Math.floor((ft - FW_LIFE) / FW_EVERY)); k * FW_EVERY <= ft; k++) {
        const start = k ? k * FW_EVERY + Math.floor(hash2(k, 7) * 20) : 0, age = ft - start;
        if (age >= 0 && age < FW_LIFE) drawFirework(g, k, age);
      }
    }
    // The Ferris wheel, whole on its base, a step every three frames: the far legs, the wheel, its bulbs chasing round
    // the rim and racing out along the spokes, the near legs, the deck and the booth, the deck's bulbs
    const rot = Math.floor(t / 3) % WHEEL_STEPS;
    if (rot !== wheelRot) { wheelRot = rot; paintWheel(wheel.getContext('2d')!, rot); }
    const WB = wheelBase!;
    put(PIECES.wheel, () => {
      g.drawImage(WB.back, 0, 0);
      g.drawImage(wheel, 0, 0);
      const a0 = (rot / WHEEL_STEPS) * Math.PI * 2, chase = Math.floor(t / 5);
      for (let i = 0; i < RIM_BULBS; i++) {
        const a = a0 + (i / RIM_BULBS) * Math.PI * 2, x = Math.round(WX + Math.cos(a) * (WR - 3)), y = Math.round(WY + Math.sin(a) * (WR - 3));
        if ((i + chase) % 4 === 0) { R(g, x - 1, y, 3, 1, '#fcd850'); R(g, x, y - 1, 1, 3, '#fcd850'); R(g, x, y, 1, 1, '#ffffff'); }
        else R(g, x, y, 1, 1, ['#ff5aa8', '#fde047', '#5eead4'][(i + chase) % 3]);
      }
      const race = Math.floor(t / 4) % 4;
      for (let i = 0; i < SPOKES; i++) {
        const a = a0 + (i / SPOKES) * Math.PI * 2;
        for (let k = 0; k < 4; k++) {
          const r = 10 + k * 5, x = Math.round(WX + Math.cos(a) * r), y = Math.round(WY + Math.sin(a) * r);
          R(g, x, y, 1, 1, k === race ? '#ffffff' : (k + 1) % 4 === race ? '#fde047' : '#a8506a');
        }
      }
      g.drawImage(WB.front, 0, 0);
      // (the hub's light, pulsing)
      R(g, WX, WY, 1, 1, t % 60 < 30 ? '#fde047' : '#ffffff');
      // (a balloon in the queue, bobbing)
      const qx = QUEUE[1], by = DECK_Y - 16 + Math.round(Math.sin(t * 0.05));
      R(g, qx + 2, by + 3, 1, DECK_Y - 5 - by - 3, '#c8c0d8');
      R(g, qx + 1, by - 1, 3, 1, INK); R(g, qx, by, 1, 3, INK); R(g, qx + 4, by, 1, 3, INK);
      R(g, qx + 1, by, 3, 3, '#ff4f6a'); R(g, qx + 1, by, 1, 1, '#ffffff');
      // (the deck's bulbs, chasing)
      for (let i = 0; i < DECK_BULBS.length; i++) {
        const on = (i + chase) % 3 === 0;
        R(g, DECK_BULBS[i], DECK_Y + 3, 1, 1, on ? '#ffffff' : '#c87a20');
        if (on) { R(g, DECK_BULBS[i] - 1, DECK_Y + 3, 1, 1, '#fde68a'); R(g, DECK_BULBS[i] + 1, DECK_Y + 3, 1, 1, '#fde68a'); }
      }
    });
    // The park, back to front (each piece where it is in its drop)
    const P = park!;
    g.drawImage(P.trees, 0, 0);
    for (let c = 0; c < 3; c++) put(ROOFS[c], () => g.drawImage(P.roofs[c], 0, 0));
    put(PIECES.castle, () => {
      g.drawImage(P.castle, 0, 0);
      // (the bulbs along its wall, twinkling)
      for (let i = 0; i < CASTLE_BULBS.length; i++) {
        const [x, y] = CASTLE_BULBS[i];
        if ((Math.floor(t / 9) + i) % 5 === 0) continue;
        R(g, x, y, 1, 1, (Math.floor(t / 16) + i) % 4 === 0 ? '#ffffff' : '#fcd850');
      }
    });
    put(PIECES.coaster, () => g.drawImage(P.coaster, 0, 0));
    put(PIECES.lotFar, () => {
      g.drawImage(P.lotFar, 0, 0);
      for (const p of CROWD) drawGuest(g, p, HORIZON + 10, t);
    });
    put(PIECES.lotNear, () => g.drawImage(P.lotNear, 0, 0));
    put(PIECES.lamps, () => g.drawImage(P.lamps, 0, 0));
    // (Main Street's bulbs, twinkling)
    for (let c = 0; c < 3; c++) put(ROOFS[c], () => {
      for (let i = 0; i < BULBS.length; i++) {
        const [x, y, chunk] = BULBS[i];
        if (chunk !== c || (Math.floor(t / 7) + i) % 6 === 0) continue;
        R(g, x, y, 1, 1, (Math.floor(t / 20) + i) % 3 === 0 ? '#fff6c0' : '#f8c040');
      }
    }, false);
    // (the coaster's beacon on top of its loop, blinking)
    put(PIECES.coaster, () => { if (t % 80 < 40) { R(g, LOOP_X, LOOP_Y - LOOP_RY - 2, 1, 1, '#ff3020'); R(g, LOOP_X - 1, LOOP_Y - LOOP_RY - 2, 3, 1, '#ff302080'); } else R(g, LOOP_X, LOOP_Y - LOOP_RY - 2, 1, 1, '#5a1010'); }, false);
    // (the banners: one on the coaster's crest, one by the wheel; both flying left, the wind's way)
    put(PIECES.flags, () => {
      drawFlag(g, flags, 49, 30, Math.round(trackY(49)) - 1, t, 0, -1);
      drawFlag(g, flags, TITLE_W - 4, 2, DECK_Y, t, 1.3, -1);
    }, false);

    // Him: the close-up, flexing (a breath in and out: up a pixel, down a pixel). In the intro: coming up from the
    // bottom of the screen with his dumb look, a blink, a big grin; fuming from the 2 on (the fury's jolt as it lands)
    const fb = beat - FACE_AT, ff = fb * BEAT_F, pop = popOf(ff);
    if (!pop.hide) {
      const bctx = bust.getContext('2d')!;
      bctx.imageSmoothingEnabled = false;
      bctx.clearRect(0, 0, ART_W, ART_H);
      const mood: TitleMood = beat >= TWO_AT ? 'fury' : fb < 0.65 ? 'dumb' : 'stoked';
      drawTitleMeathead(bctx, t, mood, t - (furyAt ?? t - 100));
      if (fb >= 0.4 && fb < 0.65) blinkTitleMeathead(bctx);
      const by = BUST_Y + (t % 150 < 75 ? 0 : -1);
      // Backlit: the park's neon round his edges in two hard rings, pink outside, near-white in
      const sg = sil.getContext('2d')!, hg = him.getContext('2d')!;
      hg.clearRect(0, 0, him.width, him.height);
      const rim = (color: string, offs: number[][]) => {
        sg.globalCompositeOperation = 'source-over';
        sg.clearRect(0, 0, sil.width, sil.height);
        for (const [dx, dy] of offs) sg.drawImage(bust, 4 + dx, 4 + dy);
        sg.globalCompositeOperation = 'source-in';
        sg.fillStyle = color; sg.fillRect(0, 0, sil.width, sil.height);
        sg.globalCompositeOperation = 'source-over';
        hg.drawImage(sil, 0, 0);
      };
      rim(RIM_OUT, [[-2, 0], [2, 0], [0, -2], [-1, -1], [1, -1], [-1, 1], [1, 1], [0, 2]]);
      rim(RIM_IN, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
      hg.drawImage(bust, 4, 4);
      if (pop === REST) g.drawImage(him, BUST_X - 4, by - 4);
      else {
        // (coming up out of the bottom of the screen: in front of the lot, behind the marquee; straight up, squashed
        // on his own bottom edge)
        const ax = BUST_X + ART_W / 2, ay = BUST_Y + ART_H;
        g.save();
        g.translate(ax, ay + pop.dy); g.scale(pop.sx, pop.sy); g.translate(-ax, -ay);
        g.drawImage(him, BUST_X - 4, by - 4);
        if (ff < 0) {
          // His body under the close-up, down off the bottom of the screen while he's coming up: the chest's last
          // row carried on down, going into the dark in steps (out of the park's light), the neon still on his edges
          const top = by - 4 + him.height - 8, len = Math.min(torso.height, Math.ceil((TITLE_H + 16 - (ay + pop.dy)) / pop.sy) + 12);
          const tg = torso.getContext('2d')!;
          tg.imageSmoothingEnabled = false;
          tg.globalCompositeOperation = 'source-over';
          tg.clearRect(0, 0, torso.width, torso.height);
          tg.drawImage(him, 0, him.height - 9, him.width, 1, 0, 0, him.width, len);
          tg.globalCompositeOperation = 'source-atop';
          for (let k = 0; k < 6; k++) { tg.fillStyle = `rgba(14, 4, 26, ${0.12 + k * 0.15})`; tg.fillRect(0, 10 + k * 18, torso.width, k === 5 ? torso.height : 18); }
          tg.globalCompositeOperation = 'source-over';
          g.drawImage(torso, 0, 0, him.width, len, BUST_X - 4, top, him.width, len);
        }
        g.restore();
      }
      sparkle(g, BUST_X + 44, 24, ff); sparkle(g, BUST_X + ART_W - 46, 30, ff - 2); sparkle(g, BUST_X + 66, 4, ff - 4);
    }

    // Confetti, coming down, fluttering (flat, edge on, flat, its back showing): from the 2 on
    if (confettiOn) for (const b of bits) {
      b.y += b.vy * dt; b.ph += dt;
      const x = Math.round(b.x + Math.sin(b.ph * 0.06) * 4);
      if (b.y > TITLE_H + 2) { spawn(b); continue; }
      const f = Math.floor(b.ph / 6) % 4, y = Math.round(b.y);
      if (f === 0) R(g, x, y, 2, 1, b.col); else if (f === 2) R(g, x, y, 1, 2, b.back); else R(g, x, y, 1, 1, f === 1 ? b.col : b.back);
    }

    // The marquee across his chest (the park's gate), its bulbs chasing (off till the 2 lands, then lit from the
    // middle out), the logo on it, a glint across the logo now and then
    put(PIECES.plate, () => {
      g.drawImage(plate!, 0, 0);
      const pc = Math.floor(t / 6), lit = beat >= TWO_AT + 0.75 ? -1 : beat >= TWO_AT ? ((beat - TWO_AT) / 0.75) * 200 : 0;
      for (let i = 0; i < PLATE_BULBS.length; i++) {
        const [x, y] = PLATE_BULBS[i];
        const on = lit < 0 ? ((i >> 1) + pc) % 3 === 0 : Math.abs(x - CX) < lit;
        R(g, x - 1, y - 1, 3, 3, '#1a0210');
        R(g, x - 1, y - 1, 1, 1, '#5a3a10');
        R(g, x, y, 1, 1, on ? '#fffbe0' : '#a87a20');
        if (on) {
          R(g, x - 1, y, 1, 1, '#fcd850'); R(g, x + 1, y, 1, 1, '#fcd850'); R(g, x, y - 1, 1, 1, '#fcd850'); R(g, x, y + 1, 1, 1, '#fcd850');
          R(g, x - 1, y - 1, 1, 1, '#c88a30'); R(g, x + 1, y + 1, 1, 1, '#c88a30'); R(g, x + 1, y - 1, 1, 1, '#c88a30'); R(g, x - 1, y + 1, 1, 1, '#c88a30');
        }
      }
    }, false);
    const L = logo!;
    if (beat >= TWO_AT + 0.5) g.drawImage(L.art, L.x, L.y);
    else {
      // The letters stamped on one at a time: each flying in from the camera along the line to the eye (scaled about
      // it, so it stays true to the scene's perspective the whole way), pressed into the plate, springing back; the 2
      // last, from furthest out, hardest
      const n = L.letters.length;
      for (let i = 0; i < n; i++) {
        const two = i === n - 1, f = fOf(letterAt(i)), F = two ? 8 : 5, s0 = two ? 4 : 2.4;
        if (f < -F) continue;
        let s = 1;
        if (f < 0) { const q = -f / F; s = 1 + (s0 - 1) * q * q; }
        else if (f < (two ? 3 : 2)) s = two ? 0.85 : 0.9;
        else if (f < (two ? 6 : 4)) s = two ? 1.08 : 1.04;
        const c = L.letters[i];
        if (s === 1) g.drawImage(c, L.x, L.y);
        else g.drawImage(c, Math.round(VPX + (L.x - VPX) * s), Math.round(VPY + (L.y - VPY) * s), Math.round(c.width * s), Math.round(c.height * s));
      }
    }
    // (a sparkle off each letter as it lands; the 2's a burst of them)
    if (live) for (let i = 0; i < L.letters.length; i++) {
      const f = fOf(letterAt(i)), x = L.x + L.ends[i], y = L.y + PAD;
      if (i < L.letters.length - 1) sparkle(g, x, y, f);
      else { sparkle(g, x + 2, y - 2, f, 2); sparkle(g, x - 14, L.y + L.h - 2, f - 2); sparkle(g, L.x + 6, L.y + 4, f - 3, 1.5); sparkle(g, PLATE_X0 + 20, PLATE_Y + 12, f - 4); sparkle(g, PLATE_X1 - 20, PLATE_Y + 12, f - 4); }
    }
    const sweep = doneAt === null ? 999 : (t - doneAt) % 240;
    if (sweep < 60) {
      const gg = glint.getContext('2d')!;
      gg.globalCompositeOperation = 'source-over';
      gg.clearRect(0, 0, L.w, L.h);
      gg.drawImage(L.face, 0, 0);
      gg.globalCompositeOperation = 'source-in';
      const gx = -30 + (sweep / 60) * (L.w + 60);
      for (let y = 0; y < L.h; y++) {
        const x = Math.round(gx + (L.h - y) * 0.6);
        gg.fillStyle = 'rgba(255, 255, 255, 0.95)'; gg.fillRect(x, y, 5, 1);
        gg.fillStyle = 'rgba(255, 250, 220, 0.55)'; gg.fillRect(x + 5, y, 3, 1); gg.fillRect(x + 11, y, 2, 1);
      }
      gg.globalCompositeOperation = 'source-over';
      g.drawImage(glint, L.x, L.y);
    }
    if (sweep >= 56 && sweep < 80) {
      const s = sweep < 62 || sweep > 74 ? 2 : 4, x = L.x + L.w - PAD - 2, y = L.y + PAD;
      R(g, x - s, y, s * 2 + 1, 1, '#fffcf0'); R(g, x, y - s, 1, s * 2 + 1, '#fffcf0'); R(g, x - 1, y - 1, 3, 3, '#ffffff');
    }
    // (no GOES TO HAPPY LAND ribbon under the title: the user's)
    void ribbon;
    g.restore();
  };
  return { draw };
};
