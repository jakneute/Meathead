// Meathead 2's title screen picture, made the way Meathead 1's is (src/m1/game/scenes/titleArt.ts): SNES pixel art on a
// 400 x 300 canvas (scaled up 2x with no smoothing), Meathead up close doing a double-biceps in the middle of it and the
// logo on its plate over his chest. Where Meathead 1 has a sunset over a city, here it's dusk at Happy Land's front
// gate: a banded twilight sky with stars coming out, searchlights sweeping it and fireworks going off; the giant Ferris
// wheel right behind him, turning, its spokes going out round him the way the sun's rays did, its bulbs chasing round
// the rim; the park cut out against the sky (the castle's spires, the roller coaster's lift hill and loop, Main Street's
// rooftops strung with bulbs); the park's banners flying either side; the parking lot under it all, rows of cars, the
// sodium lamps; confetti coming down; and the plate a marquee, its bulbs chasing, MEATHEAD 2 on it, a glint going across
// it, GOES TO HAPPY LAND on a ribbon under it. Everything that doesn't move is painted once and kept; the wheel's
// redrawn only when it's turned a step.

import { drawMeatheadCloseUp, ART_W, ART_H } from '../../m1/game/scenes/ending';
import { bayer, hash2, rgbOf, type RGB } from '../../m1/game/scenes/art/raster';

type Ctx = CanvasRenderingContext2D;

export const TITLE_W = 400;
export const TITLE_H = 300;
/** Where the sky meets the parking lot (behind the logo's plate). */
const HORIZON = 150;
/** Where his close-up goes. */
const BUST_X = (TITLE_W - ART_W) / 2, BUST_Y = 2;
/** The Ferris wheel's hub (behind his head) and its rim: big, so its spokes show round him like rays. */
const WX = 200, WY = 64, WR = 128;

const pack = ([r, g, b]: RGB) => ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
const mix = (a: RGB, b: RGB, k: number): RGB => [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * k)) as RGB;
const canvas = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const R = (g: Ctx, x: number, y: number, w: number, h: number, c: string) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

// ---------------------------------------------------------------------------
// The sky and the parking lot (painted once)
// ---------------------------------------------------------------------------

/** Night at the top down through violet and magenta to the last of the sunset on the skyline. */
const SKY = ['#060420', '#0c0832', '#160c44', '#221052', '#34145e', '#4c1866', '#6a1c6a', '#8c246a', '#b23266', '#d44c5c', '#ee7454', '#f8a058', '#fcc874'].map(rgbOf);
/** The lot under it: asphalt in the dusk, going to black at the bottom. */
const GROUND = ['#2c1838', '#22122e', '#1a0e26', '#130a1e', '#0d0716', '#08040e', '#040208', '#000000'].map(rgbOf);
/** The sodium lamps' pools on the asphalt. */
const LAMP_POOL = rgbOf('#8a5a3a');
const LAMPS: [number, number, number][] = [[24, 296, 70], [376, 296, 70], [74, 176, 34], [326, 176, 34]];

const buildSky = () => {
  const c = canvas(TITLE_W, TITLE_H), g = c.getContext('2d')!;
  const img = g.createImageData(TITLE_W, TITLE_H), px = new Uint32Array(img.data.buffer);
  for (let y = 0; y < TITLE_H; y++) for (let x = 0; x < TITLE_W; x++) {
    const d = bayer(x, y);
    if (y < HORIZON) {
      const band = Math.max(0, Math.min(SKY.length - 1, Math.round((y / (HORIZON - 1)) ** 1.25 * (SKY.length - 1) + d * 0.9)));
      px[y * TITLE_W + x] = pack(SKY[band]);
    } else {
      const v = Math.min(1, (y - HORIZON) / 140);
      const band = Math.max(0, Math.min(GROUND.length - 1, Math.round(v * (GROUND.length - 1) + d * 0.9)));
      let col = GROUND[band];
      // (the lamps' pools: stepped rings, dithered at their edges)
      for (const [lx, ly, lr] of LAMPS) {
        const dist = Math.hypot((x - lx) / 1.9, y - ly) + d * 10;
        if (dist < lr) col = mix(col, LAMP_POOL, dist < lr * 0.45 ? 0.5 : dist < lr * 0.75 ? 0.3 : 0.14);
      }
      px[y * TITLE_W + x] = pack(col);
    }
  }
  g.putImageData(img, 0, 0);
  // The parking lot's lines going back to the gate (the stalls' lines on the vanishing point, the rows across)
  for (let k = -9; k <= 9; k++) {
    const xb = WX + k * 52;
    for (let y = HORIZON + 6; y < TITLE_H; y++) {
      const x = Math.round(WX + (xb - WX) * (y - HORIZON) / (TITLE_H - HORIZON));
      if (x >= 0 && x < TITLE_W && ((y >> 1) + k) % 7 !== 0) R(g, x, y, 1, 1, y > 230 ? '#4a3a58' : '#3a2c4a');
    }
  }
  for (const y of [158, 170, 188, 216, 258]) R(g, 0, y, TITLE_W, 1, y > 200 ? '#3c2e4a' : '#30243e');
  return c;
};

// ---------------------------------------------------------------------------
// The park against the sky, and the cars and lamps in the lot (painted once)
// ---------------------------------------------------------------------------

/** Where Main Street's rooftop bulbs are (drawn twinkling each frame). */
const BULBS: [number, number][] = [];

const buildPark = () => {
  const c = canvas(TITLE_W, TITLE_H), g = c.getContext('2d')!;
  BULBS.length = 0;
  // The far trees in the haze along the horizon
  for (let x = 0; x < TITLE_W; x++) {
    const h = 8 + Math.round(Math.sin(x * 0.07) * 3 + Math.sin(x * 0.19 + 1) * 2 + hash2(x, 4) * 2);
    R(g, x, HORIZON - h, 1, h, '#4a1a5c');
    R(g, x, HORIZON - h, 1, 1, '#8a3270');
  }
  for (let y = HORIZON - 10; y < HORIZON; y++) for (let x = (y & 1); x < TITLE_W; x += 2) if ((x + y * 3) % 5 === 0) R(g, x, y, 1, 1, '#9a3a6a');

  // Main Street's rooftops, right along: shopfronts with false fronts and gables, windows lit, bulbs along the eaves
  for (let x = -2, i = 0; x < TITLE_W; i++) {
    const w = 12 + Math.round(hash2(i, 21) * 14), h = 7 + Math.round(hash2(i, 23) * 9), top = HORIZON - h;
    const body = ['#2a0c34', '#320e3a', '#260a30'][i % 3];
    R(g, x, top, w, h, body);
    R(g, x, top, w, 1, '#a04070');
    if (hash2(i, 25) < 0.45) { // a gable
      for (let k = 1; k < w - 1; k++) { const hh = Math.floor(Math.min(k, w - 1 - k) / 2); R(g, x + k, top - hh, 1, hh, body); R(g, x + k, top - hh, 1, 1, '#a04070'); }
    }
    for (let wy = top + 3; wy < HORIZON - 2; wy += 4) for (let wx = x + 2; wx < x + w - 2; wx += 4) if (hash2(wx, wy) < 0.5) R(g, wx, wy, 2, 2, hash2(wy, wx) < 0.3 ? '#fff0a0' : '#f8b040');
    for (let bx = x + 1; bx < x + w - 1; bx += 3) BULBS.push([bx, top - 1]);
    x += w + 1;
  }

  // The castle, on the left: a keep, its towers and their spires, flags on top, windows lit
  const wall = '#5c3478', wallLit = '#9c64b0', wallDark = '#3a1e52', roof = '#22307a', roofLit = '#5a7ad8';
  const tower = (x: number, w: number, top: number, spire: number) => {
    const m = x + Math.floor(w / 2);
    R(g, x, top, w, HORIZON - top, wall);
    R(g, x, top, 1, HORIZON - top, wallLit); R(g, x + w - 1, top, 1, HORIZON - top, wallDark);
    // (crenellations)
    for (let k = 0; k < w; k += 3) R(g, x + k, top - 2, 2, 2, wall);
    // (the cone, in two tones, lit on its left)
    for (let y = spire; y < top - 2; y++) {
      const half = Math.round(((y - spire) / (top - 2 - spire)) * (w / 2 + 1));
      R(g, m - half, y, half * 2, 1, roof);
      R(g, m - half, y, Math.max(1, Math.round(half * 0.6)), 1, roofLit);
    }
    R(g, m, spire - 7, 1, 7, '#c8b8e0');
    R(g, m + 1, spire - 7, 4, 3, '#ec4899'); R(g, m + 1, spire - 7, 4, 1, '#f9a8d4');
    for (let wy = top + 4; wy < HORIZON - 6; wy += 9) { R(g, m - 1, wy, 2, 4, '#fde68a'); R(g, m - 1, wy, 2, 1, '#fffbe0'); }
  };
  R(g, 12, 112, 58, HORIZON - 112, wall); R(g, 12, 112, 58, 1, wallLit);
  for (let k = 12; k < 70; k += 4) R(g, k, 109, 2, 3, wall);
  // (the gate, its arch)
  R(g, 35, 132, 12, 18, wallDark); R(g, 37, 130, 8, 2, wallDark); R(g, 39, 129, 4, 1, wallDark);
  R(g, 36, 140, 10, 10, '#f8b040'); R(g, 38, 136, 6, 4, '#f8b040'); R(g, 36, 140, 10, 1, '#fde68a');
  tower(4, 12, 96, 70);
  tower(62, 12, 92, 66);
  tower(28, 18, 80, 56);
  tower(20, 9, 100, 82);

  // The roller coaster, on the right: the lift hill, the drop, a loop; pink steel on its supports, a train on top
  const rail = '#ec4f8a', railLit = '#ffb0d0', support = '#4a2058';
  const trackY = (x: number) => {
    if (x < 312) return HORIZON - 8;
    if (x < 350) return HORIZON - 8 - ((x - 312) / 38) * 74;
    if (x < 360) return HORIZON - 82 + ((x - 350) / 10) ** 2 * 6;
    return Math.min(HORIZON - 8, HORIZON - 76 + ((x - 360) / 30) * 68);
  };
  for (let x = 304; x < 396; x++) {
    const y = Math.round(trackY(x));
    if (x % 5 === 0) R(g, x, y + 2, 1, HORIZON - y - 2, support);
    if (x % 10 === 0 && y < HORIZON - 20) for (let yy = y + 6; yy < HORIZON - 4; yy += 8) R(g, x - 4, yy, 5, 1, support);
    R(g, x, y, 1, 2, rail); R(g, x, y, 1, 1, railLit);
  }
  // (the loop)
  for (let a = 0; a < Math.PI * 2; a += 0.02) {
    const x = Math.round(380 + Math.cos(a) * 15), y = Math.round(HORIZON - 26 + Math.sin(a) * 18);
    R(g, x, y, 2, 1, a > Math.PI ? railLit : rail);
  }
  R(g, 379, HORIZON - 8, 2, 8, support);
  // (the train cresting the lift hill)
  for (let k = 0; k < 3; k++) { const x = 340 + k * 5, y = Math.round(trackY(x)) - 4; R(g, x, y, 4, 3, ['#fde047', '#38bdf8', '#fde047'][k]); R(g, x, y, 4, 1, '#fffbe0'); }

  // The lot: a row of cars nosed in by the gate, another nearer at the sides; the lamp posts
  const CARS = ['#b02a3a', '#2a5ab0', '#d8d0c0', '#2a8a5a', '#c8a020', '#5a3a8a', '#303038', '#a85020'];
  for (let x = 2, i = 0; x < TITLE_W - 8; i++) {
    const col = CARS[Math.floor(hash2(i, 31) * CARS.length)];
    if (hash2(i, 33) > 0.18) {
      R(g, x, HORIZON + 1, 9, 4, '#120a18');
      R(g, x + 1, HORIZON, 7, 4, col); R(g, x + 2, HORIZON, 5, 1, '#9ab4d0'); R(g, x + 1, HORIZON + 3, 7, 1, '#0a0610');
    }
    x += 11;
  }
  for (const side of [0, 1]) for (let k = 0; k < 4; k++) {
    const x = side ? TITLE_W - 18 - k * 20 : 4 + k * 20, col = CARS[(k * 3 + side * 5) % CARS.length];
    R(g, x, 165, 16, 6, '#0a0610');
    R(g, x + 1, 160, 14, 7, col);
    R(g, x + 3, 159, 10, 3, '#1a2436'); R(g, x + 4, 159, 6, 1, '#7a9ac0');
    R(g, x + 1, 160, 14, 1, '#fffbe0'); R(g, x + 1, 166, 3, 1, '#ffe08a'); R(g, x + 12, 166, 3, 1, '#ffe08a');
  }
  const pole = (x: number, top: number, bottom: number, big: boolean) => {
    R(g, x, top, big ? 3 : 2, bottom - top, '#4a4058'); R(g, x, top, 1, bottom - top, '#8a80a0');
    const hw = big ? 11 : 7;
    R(g, x - hw + 2, top - 2, hw * 2, big ? 4 : 3, '#3a3448');
    R(g, x - hw + 3, top + (big ? 2 : 1), hw * 2 - 2, 1, '#ffd27a');
    R(g, x - hw + 4, top + (big ? 3 : 2), hw * 2 - 4, 1, '#fff2c0');
  };
  pole(74, 132, 177, false); pole(326, 132, 177, false);
  pole(23, 186, TITLE_H, true); pole(375, 186, TITLE_H, true);
  return c;
};

// ---------------------------------------------------------------------------
// The Ferris wheel (redrawn when it's turned a step)
// ---------------------------------------------------------------------------

const WHEEL_STEPS = 720, SPOKES = 16, CARS_ON = 16, RIM_BULBS = 40;
const STEEL = '#eadcfa', STEEL_MID = '#b49ad8', STEEL_DARK = '#6c4e92';
const CAB = ['#ec4899', '#fde047', '#38bdf8', '#4ade80', '#f97316', '#a78bfa'];

const line = (g: Ctx, x0: number, y0: number, x1: number, y1: number, c: string, w = 1) => {
  const n = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)));
  g.fillStyle = c;
  for (let i = 0; i <= n; i++) g.fillRect(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), w, w);
};
const ring = (g: Ctx, r: number, c: string, lit?: string) => {
  const n = Math.ceil(r * Math.PI * 2.2);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    g.fillStyle = lit && Math.sin(a) < -0.3 ? lit : c;
    g.fillRect(Math.round(WX + Math.cos(a) * r), Math.round(WY + Math.sin(a) * r), 1, 1);
  }
};

const paintWheel = (g: Ctx, rot: number) => {
  g.clearRect(0, 0, TITLE_W, TITLE_H);
  const a0 = (rot / WHEEL_STEPS) * Math.PI * 2;
  // The legs (an A-frame each side, down to the ground), behind it
  for (const s of [-1, 1]) { line(g, WX, WY, WX + s * 78, HORIZON, STEEL_DARK, 2); line(g, WX + s * 39, WY + 43, WX + s * 47, WY + 43, STEEL_DARK, 1); }
  // The spokes, in pairs, and the bracing between the rims
  for (let i = 0; i < SPOKES; i++) {
    const a = a0 + (i / SPOKES) * Math.PI * 2;
    line(g, WX, WY, WX + Math.cos(a) * (WR - 2), WY + Math.sin(a) * (WR - 2), STEEL_MID);
    const b = a + Math.PI / SPOKES;
    line(g, WX + Math.cos(a) * WR, WY + Math.sin(a) * WR, WX + Math.cos(b) * (WR - 10), WY + Math.sin(b) * (WR - 10), STEEL_DARK);
    line(g, WX + Math.cos(b) * (WR - 10), WY + Math.sin(b) * (WR - 10), WX + Math.cos(a + (2 * Math.PI) / SPOKES) * WR, WY + Math.sin(a + (2 * Math.PI) / SPOKES) * WR, STEEL_DARK);
  }
  ring(g, WR, STEEL_MID, STEEL); ring(g, WR - 1, STEEL_DARK);
  ring(g, WR - 10, STEEL_MID);
  ring(g, 18, STEEL_MID, STEEL);
  // The cars, hanging straight down off the rim, swinging a touch
  for (let i = 0; i < CARS_ON; i++) {
    const a = a0 + ((i + 0.5) / CARS_ON) * Math.PI * 2;
    const px = Math.round(WX + Math.cos(a) * WR), py = Math.round(WY + Math.sin(a) * WR);
    const sw = Math.round(Math.sin(a * 3 + i) * 1);
    const col = CAB[i % CAB.length];
    R(g, px, py, 1, 4, STEEL_DARK);
    R(g, px - 4 + sw, py + 3, 9, 2, '#fffbe0'); // its canopy
    R(g, px - 3 + sw, py + 5, 7, 5, col);
    R(g, px - 3 + sw, py + 5, 7, 1, '#ffffff');
    R(g, px - 2 + sw, py + 6, 5, 2, '#1a1030'); // the window, people in it
    R(g, px - 1 + sw, py + 6, 1, 1, '#f4c49c'); R(g, px + 1 + sw, py + 6, 1, 1, '#c8906c');
    R(g, px - 3 + sw, py + 9, 7, 1, '#00000080');
  }
  // The hub
  R(g, WX - 4, WY - 4, 9, 9, STEEL_DARK); R(g, WX - 3, WY - 3, 7, 7, STEEL_MID); R(g, WX - 2, WY - 2, 3, 3, STEEL);
};

// ---------------------------------------------------------------------------
// The banners either side
// ---------------------------------------------------------------------------

/** A park banner, flat: candy stripes, a gold star, a swallowtail end; in three lights (shaded, flat, catching light). */
const FLAG_W = 40, FLAG_H = 21;
const buildFlags = () => ([
  { a: '#9a1a5c', b: '#b8a060', star: '#a08020' },
  { a: '#ec4899', b: '#fde68a', star: '#f8c820' },
  { a: '#ff82c0', b: '#fffbe0', star: '#fff2a0' },
].map(p => {
  const c = canvas(FLAG_W, FLAG_H), g = c.getContext('2d')!;
  for (let x = 0; x < FLAG_W; x++) {
    const notch = x > FLAG_W - 9 ? Math.round((x - (FLAG_W - 9)) * 1.1) : 0;
    for (let y = 0; y < FLAG_H; y++) {
      if (Math.abs(y - 10) < notch) continue;
      R(g, x, y, 1, 1, Math.floor((x + y) / 5) % 2 ? p.b : p.a);
    }
  }
  const star = ['..#..', '..#..', '#####', '.###.', '.#.#.'];
  R(g, 4, 5, 11, 11, '#2a1060');
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) if (star[y][x] === '#') R(g, 7 + x, 8 + y, 1, 1, p.star);
  return c;
}));

const drawFlag = (g: Ctx, flags: HTMLCanvasElement[], poleX: number, topY: number, t: number, seed: number) => {
  R(g, poleX, topY - 2, 2, HORIZON - topY + 2, '#8c8098'); R(g, poleX, topY - 2, 1, HORIZON - topY + 2, '#e8e0f0');
  R(g, poleX - 1, topY - 5, 4, 3, '#c08c00'); R(g, poleX - 1, topY - 5, 2, 2, '#fcf0a0');
  for (let c = 0; c < FLAG_W; c++) {
    const ph = c * 0.26 - t * 0.09 + seed;
    const dy = Math.round(Math.sin(ph) * 2.2 * (c / FLAG_W));
    const slope = Math.cos(ph);
    g.drawImage(flags[slope > 0.55 ? 2 : slope < -0.55 ? 0 : 1], c, 0, 1, FLAG_H, poleX + 2 + c, topY + dy, 1, FLAG_H);
  }
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
const FACE_TOP = ['#fffbe8', '#fff0a0', '#fdd84a', '#f8b020', '#ec8410'].map(rgbOf);
const FACE_BOT = ['#6a0840', '#9a1260', '#cc2a84', '#ee5aa8', '#ff9ccc'].map(rgbOf);
/** The 2's: sky blue, the rides' lights. */
const TWO_TOP = ['#f0fcff', '#b8f0ff', '#6ad8fc', '#30b0f0', '#1a84d8'].map(rgbOf);
const TWO_BOT = ['#0a2a6a', '#12408e', '#1a62b8', '#3a8ce0', '#7ac0ff'].map(rgbOf);

interface Logo { art: HTMLCanvasElement; face: HTMLCanvasElement; x: number; y: number; w: number; h: number }

const buildLogo = (): Logo => {
  const cols = [...WORD].reduce((n, ch, i) => n + GLYPHS[ch][0].length + (i ? 1 : 0), 0);
  const faceH = 7 * CELL_H, lean = Math.floor((faceH - 1) / SLANT);
  const w = cols * CELL_W + lean + PAD * 2, h = faceH + PAD * 2;
  // (1 on the MEATHEAD, 2 on the 2)
  const F = new Uint8Array(w * h);
  let cx = PAD;
  for (const ch of WORD) {
    const gl = GLYPHS[ch], v = ch === '2' ? 2 : 1;
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
  const INK = pack(rgbOf('#12041a')), DEEP = ['#4a0c52', '#360842', '#260634', '#180424', '#0e0216'].map(c => pack(rgbOf(c)));
  const GOLD = ['#fff4b0', '#fcd850', '#e8a820', '#b06c0c'].map(rgbOf);
  const WHITE = rgbOf('#fffcf0');
  for (let k = 5; k >= 1; k--) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (D[y * w + x] <= 3) out[(y + k) * w + x] = DEEP[k - 1];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, d = D[i], dz = bayer(x, y);
    if (d === 1 || d === 3) out[i] = INK;
    else if (d === 2) {
      const v = (y - PAD + 2) / (faceH + 4);
      out[i] = pack(GOLD[Math.max(0, Math.min(3, Math.round(v * 3 + dz * 0.8)))]);
    } else if (d === 0) {
      const fy = y - PAD, mid = Math.floor(faceH / 2), two = F[i] === 2;
      const top = two ? TWO_TOP : FACE_TOP, bot = two ? TWO_BOT : FACE_BOT;
      let c: RGB;
      if (fy === mid) c = rgbOf(two ? '#06184a' : '#4c0636');
      else if (fy < mid) c = top[Math.max(0, Math.min(4, Math.round((fy / (mid - 1)) * 4 + dz * 0.9)))];
      else c = bot[Math.max(0, Math.min(4, Math.round(((fy - mid - 1) / (faceH - mid - 2)) * 4 + dz * 0.9)))];
      if (!F[i - w] || !F[i - 2 * w] && fy > 1) c = !F[i - w] ? WHITE : mix(c, WHITE, 0.5);
      else if (!F[i - 1]) c = mix(c, WHITE, 0.45);
      if (!F[i + w]) c = mix(c, rgbOf('#3c0430'), 0.6);
      else if (!F[i + 1]) c = mix(c, rgbOf('#5c0846'), 0.45);
      out[i] = pack(c);
      fout[i] = 0xffffffff;
    }
  }
  ag.putImageData(img, 0, 0); fg.putImageData(fimg, 0, 0);
  return { art, face, x: Math.round((TITLE_W - w) / 2), y: 106, w, h };
};

/** The plate the logo sits on: the park's marquee right across, pointed at the ends, a pink stripe along it, gold
 *  trimmed (its bulbs are drawn each frame, chasing). */
const PLATE_Y = 126, PLATE_H = 24, PLATE_X0 = 10, PLATE_X1 = TITLE_W - 10;
const plateSpan = (y: number) => { const k = Math.min(y, PLATE_H - 1 - y); return Math.max(0, 10 - k); };
const buildPlate = () => {
  const c = canvas(TITLE_W, TITLE_H), g = c.getContext('2d')!;
  const rows = ['#fff4b0', '#e8a820', '#7a1040', '#5e0c36', '#520a30', '#48082c', '#400728', '#3a0626', '#340524', '#ec4899', '#f9a8d4', '#ec4899', '#300522', '#2c041f', '#28041c', '#25031a', '#220318', '#200316', '#1e0314', '#1c0212', '#b06c0c', '#fcd850', '#3a0420', '#000000'];
  g.fillStyle = '#000000';
  for (let y = 0; y < PLATE_H; y++) { const s = plateSpan(y); g.fillRect(PLATE_X0 + s + 3, PLATE_Y + y + 3, PLATE_X1 - PLATE_X0 - s * 2, 1); }
  for (let y = 0; y < PLATE_H; y++) {
    const s = plateSpan(y);
    R(g, PLATE_X0 + s, PLATE_Y + y, PLATE_X1 - PLATE_X0 - s * 2, 1, rows[y]);
    R(g, PLATE_X0 + s, PLATE_Y + y, 1, 1, '#000000'); R(g, PLATE_X1 - s - 1, PLATE_Y + y, 1, 1, '#000000');
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

interface Bit { x: number; y: number; vy: number; ph: number; col: string }
const CONFETTI = ['#ff5aa8', '#fde047', '#5eead4', '#a78bfa', '#fffcf0', '#4ade80', '#fb923c'];
const STARS = 30;
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
  const cx = Math.round(WX + side * (90 + hash2(k, 2) * 100)), cy = Math.round(18 + hash2(k, 3) * 62);
  const ramp = BURSTS[Math.floor(hash2(k, 4) * BURSTS.length)];
  if (age < FW_RISE) {
    // (the rocket going up, a spark trailing)
    const f = age / FW_RISE, y = Math.round(HORIZON - (HORIZON - cy) * (1 - (1 - f) ** 2));
    const x = cx + Math.round((1 - f) * side * 6);
    R(g, x, y, 1, 2, '#fff2c0');
    if (age % 2) R(g, x, y + 3 + (age % 3), 1, 1, '#f8a040');
    return;
  }
  const n = age - FW_RISE, life = FW_LIFE - FW_RISE;
  // (the flash as it goes)
  if (n < 3) { R(g, cx - 2, cy, 5, 1, '#ffffff'); R(g, cx, cy - 2, 1, 5, '#ffffff'); }
  const drag = 0.955, travel = (1 - drag ** n) / (1 - drag), fall = 0.012 * n * n * 0.5;
  const step = Math.min(ramp.length - 1, Math.floor((n / life) * ramp.length * 1.1));
  for (let i = 0; i < FW_SPARKS; i++) {
    const a = (i / FW_SPARKS) * Math.PI * 2 + hash2(k, 5) * 3, sp = 0.9 + hash2(k * 31 + i, 6) * 0.5;
    const x = Math.round(cx + Math.cos(a) * sp * travel), y = Math.round(cy + Math.sin(a) * sp * travel + fall);
    // (fading out: flickering, a spark at a time, at the end)
    if (n > life * 0.7 && ((n + i) & 1)) continue;
    R(g, x, y, 1, 1, ramp[step]);
    if (n < life * 0.45) R(g, Math.round(cx + Math.cos(a) * sp * travel * 0.8), Math.round(cy + Math.sin(a) * sp * travel * 0.8 + fall * 0.7), 1, 1, ramp[Math.min(ramp.length - 1, step + 1)]);
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

export const createTitleScene = () => {
  let sky: HTMLCanvasElement | null = null, park: HTMLCanvasElement | null = null, plate: HTMLCanvasElement | null = null;
  let ribbon: HTMLCanvasElement | null = null, flags: HTMLCanvasElement[] = [], logo: Logo | null = null;
  const wheel = canvas(TITLE_W, TITLE_H);
  let wheelRot = -1;
  const bust = canvas(ART_W, ART_H), sil = canvas(ART_W + 8, ART_H + 8), glint = canvas(1, 1);
  const bits: Bit[] = [];
  const spawn = (b?: Bit, anywhere = false): Bit => {
    const n = b || ({} as Bit);
    n.x = Math.random() * TITLE_W; n.y = anywhere ? Math.random() * TITLE_H : -4;
    n.vy = 0.3 + Math.random() * 0.45; n.ph = Math.random() * 100;
    n.col = CONFETTI[Math.floor(Math.random() * CONFETTI.length)];
    return n;
  };
  for (let i = 0; i < 46; i++) bits.push(spawn(undefined, true));

  /** Draws frame `t` (60 a second) onto `g`, a TITLE_W x TITLE_H canvas. */
  const draw = (g: Ctx, t: number, dt = 1) => {
    g.imageSmoothingEnabled = false;
    if (!sky) {
      sky = buildSky(); park = buildPark(); plate = buildPlate(); ribbon = buildRibbon(); flags = buildFlags(); logo = buildLogo();
      glint.width = logo.w; glint.height = logo.h;
    }
    g.drawImage(sky, 0, 0);
    // (stars, out up in the night at the top, a few of them twinkling)
    for (let i = 0; i < STARS; i++) {
      const x = Math.floor(hash2(i, 3) * TITLE_W), y = Math.floor(hash2(i, 5) ** 1.6 * 54) + 1;
      const tw = (t + i * 37) % 170;
      if (tw < 8) continue;
      const c = hash2(i, 9) < 0.3 ? '#fffcf0' : '#a890d0';
      R(g, x, y, 1, 1, c);
      if (tw > 160) { R(g, x - 1, y, 3, 1, c); R(g, x, y - 1, 1, 3, c); }
    }
    // The searchlights, swinging back and forth from behind the park
    drawBeam(g, 46, Math.sin(t * 0.011) * 0.55 + 0.15);
    drawBeam(g, 354, Math.sin(t * 0.009 + 2) * 0.55 - 0.15);
    // The fireworks (each one on its own clock: two or three going at once)
    for (let k = Math.max(0, Math.floor((t - FW_LIFE) / FW_EVERY)); k * FW_EVERY <= t; k++) {
      const start = k * FW_EVERY + Math.floor(hash2(k, 7) * 20), age = t - start;
      if (age >= 0 && age < FW_LIFE) drawFirework(g, k, age);
    }
    // The wheel, a step every three frames
    const rot = Math.floor(t / 3) % WHEEL_STEPS;
    if (rot !== wheelRot) { wheelRot = rot; paintWheel(wheel.getContext('2d')!, rot); }
    g.drawImage(wheel, 0, 0);
    // (its bulbs chasing round the rim)
    const a0 = (rot / WHEEL_STEPS) * Math.PI * 2, chase = Math.floor(t / 5);
    for (let i = 0; i < RIM_BULBS; i++) {
      const a = a0 + (i / RIM_BULBS) * Math.PI * 2, x = Math.round(WX + Math.cos(a) * (WR - 5)), y = Math.round(WY + Math.sin(a) * (WR - 5));
      if ((i + chase) % 4 === 0) { R(g, x, y, 2, 2, '#fff6b0'); R(g, x, y, 1, 1, '#ffffff'); }
      else R(g, x, y, 1, 1, ['#ff5aa8', '#fde047', '#5eead4'][(i + chase) % 3]);
    }
    g.drawImage(park!, 0, 0);
    // (Main Street's bulbs, twinkling)
    for (let i = 0; i < BULBS.length; i++) {
      const [x, y] = BULBS[i];
      if ((Math.floor(t / 7) + i) % 6 === 0) continue;
      R(g, x, y, 1, 1, (Math.floor(t / 20) + i) % 3 === 0 ? '#fff6c0' : '#f8c040');
    }
    // (the coaster's beacon, blinking)
    if (t % 80 < 40) R(g, 350, HORIZON - 84, 1, 1, '#ff3020');
    drawFlag(g, flags, 18, 26, t, 0);
    drawFlag(g, flags, TITLE_W - 60, 26, t, 1.3);

    // Him: the close-up, fuming, flexing (a breath in and out: up a pixel, down a pixel)
    const bctx = bust.getContext('2d')!;
    bctx.imageSmoothingEnabled = false;
    bctx.clearRect(0, 0, ART_W, ART_H);
    // (past the first 12 frames, so the fury's jolt as it cuts in never comes)
    drawMeatheadCloseUp(bctx, t + 12, false, 'fury', { bg: () => {}, medal: false, pose: 'flex' });
    const by = BUST_Y + (t % 150 < 75 ? 0 : -1);
    // Backlit: the park's neon round his edges in two hard rings, pink outside, near-white in
    const sg = sil.getContext('2d')!;
    const rim = (color: string, offs: number[][]) => {
      sg.globalCompositeOperation = 'source-over';
      sg.clearRect(0, 0, sil.width, sil.height);
      for (const [dx, dy] of offs) sg.drawImage(bust, 4 + dx, 4 + dy);
      sg.globalCompositeOperation = 'source-in';
      sg.fillStyle = color; sg.fillRect(0, 0, sil.width, sil.height);
      sg.globalCompositeOperation = 'source-over';
      g.drawImage(sil, BUST_X - 4, by - 4);
    };
    rim(RIM_OUT, [[-2, 0], [2, 0], [0, -2], [-1, -1], [1, -1], [-1, 1], [1, 1], [0, 2]]);
    rim(RIM_IN, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
    g.drawImage(bust, BUST_X, by);

    // Confetti, coming down, fluttering (flat, edge on, flat)
    for (const b of bits) {
      b.y += b.vy * dt; b.ph += dt;
      const x = Math.round(b.x + Math.sin(b.ph * 0.06) * 4);
      if (b.y > TITLE_H + 2) { spawn(b); continue; }
      const f = Math.floor(b.ph / 6) % 4, y = Math.round(b.y);
      if (f === 0) R(g, x, y, 2, 1, b.col); else if (f === 2) R(g, x, y, 1, 2, b.col); else R(g, x, y, 1, 1, b.col);
    }

    // The marquee across his chest, its bulbs chasing, the logo on it, a glint across the logo now and then
    g.drawImage(plate!, 0, 0);
    const pc = Math.floor(t / 6);
    for (let i = 0; i < PLATE_BULBS.length; i++) {
      const [x, y] = PLATE_BULBS[i];
      const on = ((i >> 1) + pc) % 3 === 0;
      R(g, x - 1, y - 1, 3, 3, '#1a0210');
      R(g, x, y, 1, 1, on ? '#fffbe0' : '#a87a20');
      if (on) { R(g, x - 1, y, 1, 1, '#fcd850'); R(g, x + 1, y, 1, 1, '#fcd850'); R(g, x, y - 1, 1, 1, '#fcd850'); R(g, x, y + 1, 1, 1, '#fcd850'); }
    }
    const L = logo!;
    g.drawImage(L.art, L.x, L.y);
    const sweep = t % 240;
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
    g.drawImage(ribbon!, 0, 0);
  };
  return { draw };
};
