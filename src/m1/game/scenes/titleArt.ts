// The title screen's picture, as SNES pixel art on a 400 x 300 canvas (scaled up 2x with no smoothing): a sunset
// sky in dithered bands with the sun behind his head and its rays turning slowly round it, a city skyline cut out
// against it, the flag flying either side, Meathead up close doing a double-biceps (the cutscenes' close-up, fuming),
// backlit by the sun in hard stepped rings of light, embers coming up off the street, and the logo on its plate over
// his chest, a glint going across it. Everything that doesn't move is painted once and kept; the rays are redrawn
// only when they've turned a step.

import { drawMeatheadCloseUp, ART_W, ART_H } from './ending';
import { bayer, hash2, rgbOf, RGB } from './art/raster';
import { shatPants, setShatPants, shatClock } from './shatLook';

type Ctx = CanvasRenderingContext2D;

export const TITLE_W = 400;
export const TITLE_H = 300;
/** Where the sky meets the street (behind the logo's plate). */
const HORIZON = 150;
/** The sun, behind his head. */
const SUN_X = 200, SUN_Y = 50;
/** Where his close-up goes. */
const BUST_X = (TITLE_W - ART_W) / 2, BUST_Y = 2;

const pack = ([r, g, b]: RGB) => ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
const mix = (a: RGB, b: RGB, k: number): RGB => [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * k)) as RGB;
const canvas = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const R = (g: Ctx, x: number, y: number, w: number, h: number, c: string) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

// ---------------------------------------------------------------------------
// The sky and the rays
// ---------------------------------------------------------------------------

/** Night at the top down to the sun's own yellow on the skyline. */
const SKY = ['#08021a', '#18062e', '#300a42', '#521048', '#7c1648', '#a8203c', '#d0381e', '#ec5c14', '#f88c24', '#fcb848', '#fcdc80'].map(rgbOf);
/** The street under it, dark, going to black. */
const GROUND = ['#2c0c2c', '#1c0820', '#120416', '#0a020c', '#050106', '#000000'].map(rgbOf);
const HALO = rgbOf('#fff0b0'), RAY = rgbOf('#fff4c8');
const SUN_CORE = rgbOf('#fffadc'), SUN_RIM = rgbOf('#fce07c');
/** How far each ring of the sun's halo goes, and how much it lightens the sky. */
const HALO_RINGS: [number, number][] = [[40, 0.5], [52, 0.32], [68, 0.18]];
const RAY_MIX = [0, 0.1, 0.2];
/** The rays: 16 of them, each a third of its slot, a full turn in 1024 steps. */
const RAY_STEPS = 1024, RAY_SLOT = 64, RAY_WIDTH = 22;

interface Sky { img: ImageData; px: Uint32Array; base: Uint16Array; ang: Uint16Array; pal: Uint32Array; rot: number }

const buildSky = (g: Ctx): Sky => {
  const img = g.createImageData(TITLE_W, TITLE_H);
  const px = new Uint32Array(img.data.buffer);
  const n = TITLE_W * HORIZON;
  const base = new Uint16Array(n), ang = new Uint16Array(n);
  // (the palette: every band of the sky, at each ring of the halo (or the sun itself), at each strength of ray)
  const H = HALO_RINGS.length + 3; // 0 none, 1..3 the rings, 4 the sun's rim, 5 its core
  const pal = new Uint32Array(SKY.length * H * 3);
  for (let b = 0; b < SKY.length; b++) for (let h = 0; h < H; h++) for (let r = 0; r < 3; r++) {
    let c: RGB;
    if (h === 5) c = SUN_CORE;
    else if (h === 4) c = SUN_RIM;
    else {
      c = h ? mix(SKY[b], HALO, HALO_RINGS[HALO_RINGS.length - h][1]) : SKY[b];
      c = mix(c, RAY, RAY_MIX[r]);
    }
    pal[(b * H + h) * 3 + r] = pack(c);
  }
  for (let y = 0; y < TITLE_H; y++) for (let x = 0; x < TITLE_W; x++) {
    const d = bayer(x, y);
    if (y < HORIZON) {
      const band = Math.max(0, Math.min(SKY.length - 1, Math.round((y / (HORIZON - 1)) ** 0.85 * (SKY.length - 1) + d * 0.9)));
      const dist = Math.hypot(x - SUN_X, (y - SUN_Y) * 1.05);
      const dd = dist + d * 5;
      let h = 0;
      if (dd < 22) h = 5;
      else if (dd < 29) h = 4;
      else for (let k = HALO_RINGS.length - 1; k >= 0; k--) if (dd < HALO_RINGS[k][0]) h = HALO_RINGS.length - k;
      // (the rays fade out with distance from the sun, in steps)
      const rd = dist + d * 36;
      const r = rd < 110 ? 2 : rd < 200 ? 1 : 0;
      base[y * TITLE_W + x] = ((band * H + h) * 3) | (r << 12);
      ang[y * TITLE_W + x] = Math.floor(((Math.atan2(y - SUN_Y, x - SUN_X) + Math.PI) / (Math.PI * 2)) * RAY_STEPS) % RAY_STEPS;
    } else {
      const v = Math.min(1, (y - HORIZON) / 90);
      const band = Math.max(0, Math.min(GROUND.length - 1, Math.round(v * (GROUND.length - 1) + d * 0.9)));
      px[y * TITLE_W + x] = pack(GROUND[band]);
    }
  }
  return { img, px, base, ang, pal, rot: -1 };
};

/** The sky turned to `rot`: every pixel above the street, ray or no ray. */
const paintSky = (s: Sky, rot: number) => {
  if (s.rot === rot) return false;
  s.rot = rot;
  const { px, base, ang, pal } = s;
  for (let i = 0, n = base.length; i < n; i++) {
    const b = base[i], r = b >> 12;
    const on = r && ((ang[i] + rot) & (RAY_SLOT - 1)) < RAY_WIDTH;
    px[i] = pal[(b & 0xfff) + (on ? r : 0)];
  }
  return true;
};

// ---------------------------------------------------------------------------
// The skyline and the flags
// ---------------------------------------------------------------------------

/** The city against the sunset: a far row in the haze, a near row black against it with its windows lit. */
const buildSkyline = () => {
  const c = canvas(TITLE_W, TITLE_H), g = c.getContext('2d')!;
  const row = (seed: number, minH: number, maxH: number, minW: number, maxW: number, body: string, rim: string, side: string, windows: string[] | null) => {
    for (let x = -4, i = 0; x < TITLE_W; i++) {
      const w = Math.round(minW + hash2(i, seed) * (maxW - minW));
      const h = Math.round(minH + hash2(i, seed + 7) ** 1.4 * (maxH - minH));
      const top = HORIZON - h;
      R(g, x, top, w, h, body);
      // (lit along the top and down the side that faces the sun; the sun's in the middle)
      R(g, x, top, w, 1, rim);
      if (x + w / 2 < SUN_X) R(g, x + w - 1, top + 1, 1, h - 1, side); else R(g, x, top + 1, 1, h - 1, side);
      // (a stepped crown, an antenna, a water tower on some)
      const kind = hash2(i, seed + 13);
      if (kind < 0.25 && w > 8) { R(g, x + 2, top - 3, w - 4, 3, body); R(g, x + 2, top - 3, w - 4, 1, rim); }
      else if (kind < 0.4) { R(g, x + Math.floor(w / 2), top - 9, 1, 9, body); R(g, x + Math.floor(w / 2), top - 9, 1, 1, rim); }
      else if (kind < 0.5 && w > 7) { R(g, x + 2, top - 6, 5, 4, body); R(g, x + 2, top - 6, 5, 1, rim); R(g, x + 3, top - 2, 1, 2, body); R(g, x + 5, top - 2, 1, 2, body); }
      if (windows) for (let wy = top + 3; wy < HORIZON - 2; wy += 4) for (let wx = x + 2; wx < x + w - 2; wx += 3) {
        const k = hash2(wx * 0.7 + seed, wy * 1.3);
        if (k < 0.3) R(g, wx, wy, 1, 2, windows[k < 0.08 ? 0 : k < 0.2 ? 1 : 2]);
      }
      x += w + (hash2(i, seed + 3) < 0.3 ? 1 : 0);
    }
  };
  row(11, 26, 64, 7, 18, '#5a1a4c', '#a8385c', '#74224e', null);
  // (the haze between them: every other pixel of a band along the foot of the far row)
  for (let y = HORIZON - 14; y < HORIZON; y++) for (let x = (y & 1); x < TITLE_W; x += 2) if ((HORIZON - y) < 6 || ((x >> 1) + y) % 3 === 0) R(g, x, y, 1, 1, '#a02c48');
  row(29, 10, 44, 10, 26, '#1c0820', '#6c1c3c', '#2e0c2c', ['#fff0a0', '#fcc040', '#7c3a2c']);
  return c;
};

/** The flag, flat: 7 stripes, the canton with its stars, in three lights (shaded, flat, catching the sun). */
const FLAG_W = 40, FLAG_H = 21;
const buildFlags = () => ([
  { red: '#841010', white: '#b0a8a0', navy: '#0c1648', star: '#b0a8a0' },
  { red: '#c81c1c', white: '#f0ece0', navy: '#1c2c78', star: '#f0ece0' },
  { red: '#f44a30', white: '#fffcf0', navy: '#2c40a0', star: '#fffcf0' },
].map(p => {
  const c = canvas(FLAG_W, FLAG_H), g = c.getContext('2d')!;
  for (let s = 0; s < 7; s++) R(g, 0, s * 3, FLAG_W, 3, s % 2 ? p.white : p.red);
  R(g, 0, 0, 17, 12, p.navy);
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) R(g, 2 + i * 4 + (j % 2) * 2, 1 + j * 3, 1, 1, p.star);
  return c;
}));

const drawFlag = (g: Ctx, flags: HTMLCanvasElement[], poleX: number, topY: number, t: number, seed: number) => {
  // The pole, lit down its left; the gold ball on top
  R(g, poleX, topY - 2, 2, HORIZON - topY + 2, '#8c8478'); R(g, poleX, topY - 2, 1, HORIZON - topY + 2, '#e8e0cc');
  R(g, poleX - 1, topY - 5, 4, 3, '#c08c00'); R(g, poleX - 1, topY - 5, 2, 2, '#fcf0a0');
  // The flag, a column at a time, rippling out from the pole
  for (let c = 0; c < FLAG_W; c++) {
    const ph = c * 0.26 - t * 0.09 + seed;
    const dy = Math.round(Math.sin(ph) * 2.2 * (c / FLAG_W));
    const slope = Math.cos(ph);
    g.drawImage(flags[slope > 0.55 ? 2 : slope < -0.55 ? 0 : 1], c, 0, 1, FLAG_H, poleX + 2 + c, topY + dy, 1, FLAG_H);
  }
};

// ---------------------------------------------------------------------------
// The logo
// ---------------------------------------------------------------------------

const GLYPHS: Record<string, string[]> = {
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  E: ['####', '#...', '#...', '###.', '#...', '#...', '####'],
  A: ['.##.', '#..#', '#..#', '####', '#..#', '#..#', '#..#'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  H: ['#..#', '#..#', '#..#', '####', '#..#', '#..#', '#..#'],
  D: ['###.', '#..#', '#..#', '#..#', '#..#', '#..#', '###.'],
};
const WORD = 'MEATHEAD';
/** A cell of the logo's letters: wide and squat, so the strokes come out fat. */
const CELL_W = 6, CELL_H = 5;
const PAD = 8;
/** How far the letters lean (one pixel over for every this many up). */
const SLANT = 6;
/** The face of the letters, top to bottom: hot metal, white-hot up top, a dark line across the middle, the
 *  lower half catching the fire back up off the street. */
const FACE_TOP = ['#fff6d8', '#fce48c', '#f8b440', '#f07c1c', '#d84410'].map(rgbOf);
const FACE_BOT = ['#7c1006', '#a81c08', '#d43c10', '#f4701c', '#fca848'].map(rgbOf);

interface Logo { art: HTMLCanvasElement; face: HTMLCanvasElement; x: number; y: number; w: number; h: number; faceH: number }

const buildLogo = (): Logo => {
  const cols = [...WORD].reduce((n, ch, i) => n + GLYPHS[ch][0].length + (i ? 1 : 0), 0);
  const faceH = 7 * CELL_H, lean = Math.floor((faceH - 1) / SLANT);
  const w = cols * CELL_W + lean + PAD * 2, h = faceH + PAD * 2;
  const F = new Uint8Array(w * h);
  let cx = PAD;
  for (const ch of WORD) {
    const gl = GLYPHS[ch];
    for (let r = 0; r < 7; r++) for (let c = 0; c < gl[r].length; c++) if (gl[r][c] === '#') {
      for (let yy = 0; yy < CELL_H; yy++) {
        const y = r * CELL_H + yy, shift = Math.floor((faceH - 1 - y) / SLANT);
        for (let xx = 0; xx < CELL_W; xx++) F[(PAD + y) * w + cx + c * CELL_W + xx + shift] = 1;
      }
    }
    cx += (gl[0].length + 1) * CELL_W;
  }
  // (how far each pixel is from the letters, up to 4: 0 on them)
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
  const INK = pack(rgbOf('#140206')), DEEP = [rgbOf('#5c0a10'), rgbOf('#3c060c'), rgbOf('#2a040a'), rgbOf('#1c0206'), rgbOf('#100104')].map(pack);
  const GOLD = ['#fff4b0', '#fcd850', '#e8a820', '#b06c0c'].map(rgbOf);
  const WHITE = rgbOf('#fffcf0');
  // The block it's cut from pushed down behind it, deeper the further down
  for (let k = 5; k >= 1; k--) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (D[y * w + x] <= 3) out[(y + k) * w + x] = DEEP[k - 1];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, d = D[i], dz = bayer(x, y);
    if (d === 1 || d === 3) out[i] = INK;
    else if (d === 2) {
      // (a gold rim between two lines of ink, lighter up top)
      const v = (y - PAD + 2) / (faceH + 4);
      out[i] = pack(GOLD[Math.max(0, Math.min(3, Math.round(v * 3 + dz * 0.8)))]);
    } else if (d === 0) {
      const fy = y - PAD, mid = Math.floor(faceH / 2);
      let c: RGB;
      if (fy === mid) c = rgbOf('#4c0606');
      else if (fy < mid) c = FACE_TOP[Math.max(0, Math.min(4, Math.round((fy / (mid - 1)) * 4 + dz * 0.9)))];
      else c = FACE_BOT[Math.max(0, Math.min(4, Math.round(((fy - mid - 1) / (faceH - mid - 2)) * 4 + dz * 0.9)))];
      // (the bevel: lit along the top and left of each stroke, in shadow along the bottom and right)
      if (!F[i - w] || !F[i - 2 * w] && fy > 1) c = !F[i - w] ? WHITE : mix(c, WHITE, 0.5);
      else if (!F[i - 1]) c = mix(c, WHITE, 0.45);
      if (!F[i + w]) c = mix(c, rgbOf('#3c0404'), 0.6);
      else if (!F[i + 1]) c = mix(c, rgbOf('#5c0806'), 0.45);
      out[i] = pack(c);
      fout[i] = 0xffffffff;
    }
  }
  ag.putImageData(img, 0, 0); fg.putImageData(fimg, 0, 0);
  return { art, face, x: Math.round((TITLE_W - w) / 2), y: 106, w, h, faceH };
};

/** The plate the logo sits on: a steel bar right across, pointed at the ends, a red stripe along it, riveted. */
const PLATE_Y = 126, PLATE_H = 24, PLATE_X0 = 10, PLATE_X1 = TITLE_W - 10;
const buildPlate = () => {
  const c = canvas(TITLE_W, TITLE_H), g = c.getContext('2d')!;
  const rows = ['#e8eef4', '#868e9a', '#3a3f48', '#2c3038', '#262a31', '#22252b', '#1e2126', '#1c1f24', '#1a1c21', '#9c1a0a', '#c82814', '#9c1a0a', '#18191d', '#16171b', '#141518', '#131416', '#121314', '#111213', '#101112', '#0e0f10', '#2a2d33', '#5c636e', '#0a0a0c', '#000000'];
  const span = (y: number) => { const k = Math.min(y, PLATE_H - 1 - y); return Math.max(0, 10 - k); };
  // (its shadow first, dropped down and right)
  g.fillStyle = '#000000';
  for (let y = 0; y < PLATE_H; y++) { const s = span(y); g.fillRect(PLATE_X0 + s + 3, PLATE_Y + y + 3, PLATE_X1 - PLATE_X0 - s * 2, 1); }
  for (let y = 0; y < PLATE_H; y++) {
    const s = span(y);
    R(g, PLATE_X0 + s, PLATE_Y + y, PLATE_X1 - PLATE_X0 - s * 2, 1, rows[y]);
    // (the pointed ends inked)
    R(g, PLATE_X0 + s, PLATE_Y + y, 1, 1, '#000000'); R(g, PLATE_X1 - s - 1, PLATE_Y + y, 1, 1, '#000000');
  }
  for (const x of [PLATE_X0 + 16, PLATE_X1 - 19]) for (const y of [PLATE_Y + 4, PLATE_Y + 16]) {
    R(g, x, y, 3, 3, '#5c636e'); R(g, x, y, 2, 2, '#b6bec8'); R(g, x, y, 1, 1, '#ffffff'); R(g, x + 2, y + 2, 1, 1, '#0a0a0c');
  }
  return c;
};

// ---------------------------------------------------------------------------
// The whole picture
// ---------------------------------------------------------------------------

interface Ember { x: number; y: number; vx: number; vy: number; life: number; age: number; big: boolean }
const STARS = 26;
const RIM_OUT = '#f0600c', RIM_IN = '#fce890';

export const createTitleScene = () => {
  let sky: Sky | null = null, skyCanvas: HTMLCanvasElement | null = null;
  let skyline: HTMLCanvasElement | null = null, plate: HTMLCanvasElement | null = null, flags: HTMLCanvasElement[] = [], logo: Logo | null = null;
  const bust = canvas(ART_W, ART_H), sil = canvas(ART_W + 8, ART_H + 8), glint = canvas(1, 1);
  const embers: Ember[] = [];
  const spawn = (e?: Ember, anywhere = false): Ember => {
    const n = e || ({} as Ember);
    n.x = Math.random() * TITLE_W; n.y = anywhere ? HORIZON - 40 + Math.random() * (TITLE_H - HORIZON + 40) : TITLE_H + 2;
    n.vx = (Math.random() - 0.5) * 0.3; n.vy = -(0.35 + Math.random() * 0.6); n.life = 160 + Math.random() * 200; n.age = anywhere ? Math.random() * n.life * 0.6 : 0;
    n.big = Math.random() < 0.3;
    return n;
  };
  for (let i = 0; i < 34; i++) embers.push(spawn(undefined, true));

  /** Draws frame `t` (60 a second) onto `g`, a TITLE_W x TITLE_H canvas. `shitty`: the cheat's on, and it shows. */
  const draw = (g: Ctx, t: number, shitty: boolean, dt = 1) => {
    g.imageSmoothingEnabled = false;
    if (!sky) {
      skyCanvas = canvas(TITLE_W, TITLE_H);
      sky = buildSky(skyCanvas.getContext('2d')!);
      skyline = buildSkyline(); plate = buildPlate(); flags = buildFlags(); logo = buildLogo();
      glint.width = logo.w; glint.height = logo.h;
    }
    // The sky, the rays turned a step every few frames
    if (paintSky(sky, Math.floor(t / 4) % RAY_STEPS)) skyCanvas!.getContext('2d')!.putImageData(sky.img, 0, 0);
    g.drawImage(skyCanvas!, 0, 0);
    // (stars, still out up in the night at the top, a few of them twinkling)
    for (let i = 0; i < STARS; i++) {
      const x = Math.floor(hash2(i, 3) * TITLE_W), y = Math.floor(hash2(i, 5) ** 1.6 * 46) + 1;
      const tw = (t + i * 37) % 160;
      if (tw < 8) continue;
      const c = hash2(i, 9) < 0.3 ? '#fffcf0' : '#a890c0';
      R(g, x, y, 1, 1, c);
      if (tw > 150) { R(g, x - 1, y, 3, 1, c); R(g, x, y - 1, 1, 3, c); }
    }
    g.drawImage(skyline!, 0, 0);
    // (a light or two at the tops of the antennas, blinking)
    if (t % 90 < 45) for (const [x, y] of [[33, 98], [371, 101]]) R(g, x, y, 1, 1, '#ff3020');
    drawFlag(g, flags, 18, 26, t, 0);
    drawFlag(g, flags, TITLE_W - 60, 26, t, 1.3);

    // Him: the close-up, fuming, flexing (a breath in and out: up a pixel, down a pixel)
    const bctx = bust.getContext('2d')!;
    bctx.imageSmoothingEnabled = false;
    bctx.clearRect(0, 0, ART_W, ART_H);
    const wasShat = shatPants();
    setShatPants(shitty); shatClock(t);
    // (past the first 12 frames, so the fury's jolt as it cuts in never comes)
    drawMeatheadCloseUp(bctx, t + 12, false, 'fury', { bg: () => {}, medal: false, pose: 'flex' });
    setShatPants(wasShat);
    const by = BUST_Y + (t % 150 < 75 ? 0 : -1);
    // Backlit: the sun round his edges in two hard rings, orange outside, near-white in
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

    // Embers, up off the street, cooling as they go
    for (const e of embers) {
      e.age += dt; e.x += (e.vx + Math.sin((e.age + e.x) * 0.05) * 0.15) * dt; e.y += e.vy * dt;
      if (e.age > e.life || e.y < 10) { spawn(e); continue; }
      const k = e.age / e.life;
      if (k > 0.85 && (Math.floor(e.age / 3) & 1)) continue;
      R(g, Math.round(e.x), Math.round(e.y), 1, e.big ? 2 : 1, k < 0.35 ? '#fff4b0' : k < 0.7 ? '#f8a030' : '#c03810');
    }

    // The plate across his chest, the logo on it, and now and then a glint across the logo
    g.drawImage(plate!, 0, 0);
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
    // (the glint gone off the end: a sparkle off the corner of the last letter)
    if (sweep >= 56 && sweep < 80) {
      const s = sweep < 62 || sweep > 74 ? 2 : 4, x = L.x + L.w - PAD - 2, y = L.y + PAD;
      R(g, x - s, y, s * 2 + 1, 1, '#fffcf0'); R(g, x, y - s, 1, s * 2 + 1, '#fffcf0'); R(g, x - 1, y - 1, 3, 3, '#ffffff');
    }
  };
  return { draw };
};
