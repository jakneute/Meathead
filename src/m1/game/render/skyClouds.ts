// A screen full of cloud, parting as you fall through it. The deploy transition
// (target select into a stage) dives into it, and the stage's skyfall intro
// comes out of it, so the two meet seamlessly: everything in it is a function of
// how far he's fallen (scroll) and the stage, nothing else, so both halves land
// on the same picture at DEPLOY_CLOUD_SCROLL_END.
//
// SNES-style: the puffs are pre-painted once per stage into little half-res
// sprites (stepped shading down a ramp, a lit lip on top, a dark belly, Bayer
// dither at the edges and between the steps), stacked in three layers at three
// speeds, with wisps, speed streaks, and whatever's in that stage's air.

import { SKYFALL_CLOUD_FRAMES, WALK_ON_STAGE } from '../../constants';
import { WHITE_HOUSE_ID } from '../../content/whiteHouse';
import { checker } from './pixelArt';

type Ctx = CanvasRenderingContext2D;

/** How far through the clouds the deploy transition's dive ends (the skyfall intro carries on from here). */
export const DEPLOY_CLOUD_SCROLL_END = 1200;
/** How fast the clouds stream past him as he falls out of them into the stage (per frame). */
export const SKYFALL_CLOUD_SPEED = 40;

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** Translucency in eighths (no smooth fades). */
const step8 = (a: number) => Math.round(clamp01(a) * 8) / 8;
/** Wraps v into [0, span). */
const wrap = (v: number, span: number) => ((v % span) + span) % span;
/** The 2px grid. */
const snap = (v: number) => Math.round(v / 2) * 2;

type RGB = [number, number, number];
const rgb = (hex: string): RGB => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
const mix = (a: RGB, b: RGB, k: number): RGB => [Math.round(a[0] + (b[0] - a[0]) * k), Math.round(a[1] + (b[1] - a[1]) * k), Math.round(a[2] + (b[2] - a[2]) * k)];
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);
const bayer = (x: number, y: number) => BAYER[(y & 3) * 4 + (x & 3)];

type Mote = 'snow' | 'ash' | 'embers' | 'smog' | 'dust' | 'soot';

interface CloudLook {
  /** The murk between the puffs, top to bottom (lit from above). */
  murk: string[];
  /** The puffs, belly to lit top (five steps). */
  ramp: string[];
  /** The speed streaks. */
  streak: string;
  /** Light from below (a fire, a city), how strong, and whether it pulses (flares) or rolls on and off (a blackout). */
  glow?: { color: string; a: number; flicker?: 'pulse' | 'blackout' };
  /** What's in the air with him. */
  motes?: Mote[];
  /** A sun glinting through from up top on the right (where the stage's own sun is), and how strong. */
  sun?: { color: string; a: number };
  /** Sideways drift (px per px fallen), sway (px), puffs (x the usual), how fast they go by (x the usual). */
  drift: number; sway: number; density: number; speed: number;
}

const PLAIN: CloudLook = {
  murk: ['#E4EAF2', '#D2DAE6', '#BCC8D8'], ramp: ['#8E9CB4', '#B0BCD0', '#CED8E6', '#E8EEF6', '#FFFFFF'], streak: '#FFFFFF',
  drift: 0, sway: 10, density: 1, speed: 1,
};

/** Each destination's clouds, matched to its sky (backdrops/stages.ts) and what's going on down there. */
const LOOKS: Record<string, CloudLook> = {
  // Anchorage at night: moonlit snow cloud, blue-white, flakes going by
  'Artie Avalanche': {
    murk: ['#B4C8E4', '#8EA8D0', '#6A86B6'], ramp: ['#2C4470', '#4A6A9E', '#7C9CCC', '#B6CCEA', '#F0F8FF'], streak: '#E6F2FF',
    motes: ['snow'], drift: 0.08, sway: 14, density: 1.1, speed: 1,
  },
  // Hilo: an ash plume, lit orange from the lava under it, embers coming up through it
  'Victor Volcano': {
    murk: ['#8C6E64', '#6E4A40', '#5C2C1C'], ramp: ['#1E100C', '#3A221C', '#5A3C32', '#80604E', '#AE8C74'], streak: '#FFC890',
    glow: { color: '#FF5A12', a: 0.6, flicker: 'pulse' }, motes: ['ash', 'embers'], drift: -0.05, sway: 22, density: 1.2, speed: 0.9,
  },
  // San Francisco: the fog coming in off the bay at sundown, grey-white, warm underneath, thick and slow, sideways
  'Ernie Earthquake': {
    murk: ['#ECE6EA', '#DCD2DA', '#CCBCC4'], ramp: ['#7E7488', '#A49CAE', '#C8C2CE', '#E6E0E4', '#FFF8F0'], streak: '#FFFFFF',
    glow: { color: '#F69A5A', a: 0.28 }, drift: 0.22, sway: 6, density: 1.35, speed: 0.75,
  },
  // Miami Beach, sunny (the storm's not got there yet): fair-weather cumulus, white and blue, clear blue sky between,
  // the sun glinting through
  'Hector Hurricane': {
    murk: ['#4FA6EA', '#7CBEF0', '#ACD8F6'], ramp: ['#6E92C4', '#9EBCE2', '#CCE0F4', '#EEF6FD', '#FFFFFF'], streak: '#FFFFFF',
    sun: { color: '#FFE69A', a: 0.55 }, drift: 0.06, sway: 8, density: 0.9, speed: 1,
  },
  // Flint: the plant's smog, a sick yellow-green, glowing from underneath, slow and greasy
  'Toxic Tommy': {
    murk: ['#A0A060', '#80844A', '#5E6436'], ramp: ['#262A16', '#424828', '#666E38', '#949C4C', '#CCD278'], streak: '#E8F08A',
    glow: { color: '#A8F030', a: 0.3, flicker: 'pulse' }, motes: ['smog'], drift: 0.04, sway: 26, density: 1.15, speed: 0.85,
  },
  // New York at night: dark cloud lit amber from the city under it, the light going out and coming back (the blackout)
  'Blackout Barry': {
    murk: ['#2E3852', '#222A42', '#2E2A3A'], ramp: ['#0A0E1C', '#161E36', '#283452', '#405074', '#7084A8'], streak: '#A8B8DA',
    glow: { color: '#FFA83C', a: 0.5, flicker: 'blackout' }, drift: 0.05, sway: 10, density: 1, speed: 1,
  },
  // Houston: black smoke off the refineries, the flares under it, soot and sparks
  'Oily Oscar': {
    murk: ['#5E3E28', '#42291A', '#6A3814'], ramp: ['#080604', '#18120E', '#2C221A', '#46382A', '#786048'], streak: '#FFB060',
    glow: { color: '#FF7A12', a: 0.65, flicker: 'pulse' }, motes: ['soot', 'embers'], drift: 0.1, sway: 18, density: 1.3, speed: 1,
  },
  // Albuquerque: desert haze at sundown, dust blowing through it, peach and purple
  'Drug Trade Dale': {
    murk: ['#ECBC8C', '#D89C7A', '#B47C72'], ramp: ['#5C3A5E', '#8A5264', '#C07A6C', '#E8AA7C', '#FFE2AA'], streak: '#FFF0C8',
    motes: ['dust'], drift: 0.45, sway: 16, density: 0.85, speed: 1.1,
  },
};
// Washington at night: moonlit cloud over the Capitol, the city warm under it
const DC: CloudLook = {
  murk: ['#46506E', '#343C5A', '#2C2C46'], ramp: ['#141A2E', '#262E4C', '#3E486C', '#66729C', '#BCC8E4'], streak: '#D8E0F4',
  glow: { color: '#FFC870', a: 0.32 }, drift: -0.04, sway: 8, density: 1, speed: 0.95,
};
LOOKS[WHITE_HOUSE_ID] = DC;
LOOKS[WALK_ON_STAGE] = DC;

const lookFor = (stageId?: string | null) => (stageId && LOOKS[stageId]) || PLAIN;

// ---------------------------------------------------------------------------
// The sprites, painted once a look
// ---------------------------------------------------------------------------

type Shape = 'puff' | 'tall' | 'wisp';

/**
 * One puff, w x h cells (a cell's 2px on screen): a flat-bottomed base with heads bubbling up off it (`tall`: drawn
 * out top to bottom, the near ones going by fast; `wisp`: a thin streamer), shaded down `ramp` in steps.
 */
const paintPuff = (seed: number, w: number, h: number, shape: Shape, ramp: RGB[]) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d')!;
  const R = (k: number) => hash(seed * 13.7 + k * 3.1);
  const stretch = shape === 'tall' ? 1.5 : 1, hh = h / stretch;
  const lobes: { x: number; y: number; rx: number; ry: number }[] = [];
  if (shape === 'wisp') {
    for (let i = 0; i < 4; i++) lobes.push({ x: w * (0.22 + 0.56 * R(i)), y: h * (0.42 + 0.16 * R(i + 9)), rx: w * (0.16 + 0.14 * R(i + 4)), ry: h * (0.28 + 0.14 * R(i + 7)) });
  } else {
    lobes.push({ x: w * 0.5, y: hh * 0.72, rx: w * 0.47, ry: hh * 0.24 });
    const n = 3 + Math.floor(R(1) * 3);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const r = Math.min(w * 0.2, hh * 0.4) * (0.7 + 0.45 * R(i + 20)) * (1 - Math.abs(t - 0.5) * 0.7);
      const y = Math.max(r + 1, hh * 0.62 - r * (0.35 + 0.5 * R(i + 40)));
      lobes.push({ x: w * (0.16 + 0.68 * t) + (R(i + 30) - 0.5) * w * 0.08, y, rx: r * 1.12, ry: r });
    }
    for (const l of lobes) { l.y *= stretch; l.ry *= stretch; }
  }
  const N = ramp.length, edge = shape === 'wisp' ? 0.55 : 0.2;
  const lvl = new Int8Array(w * h).fill(-1);
  const upper = new Uint8Array(w * h);
  // (each cell's deepest lobe; and each column's top, so the light falls on the mass as a whole, not lobe by lobe)
  const depth = new Float32Array(w * h), owner = new Int8Array(w * h).fill(-1), top = new Int16Array(w).fill(h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let best = 0, bi = -1;
    lobes.forEach((l, li) => {
      const dx = (x + 0.5 - l.x) / l.rx, dy = (y + 0.5 - l.y) / l.ry, q = dx * dx + dy * dy;
      if (q < 1) { const d = 1 - Math.sqrt(q); if (d > best) { best = d; bi = li; } }
    });
    if (bi < 0) continue;
    depth[y * w + x] = best; owner[y * w + x] = bi;
    if (top[x] === h) top[x] = y;
  }
  const thick = shape === 'wisp' ? h : h * 0.62;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, best = depth[i];
    if (owner[i] < 0) continue;
    const b = bayer(x, y);
    // (the edge breaks up in an ordered dither)
    if (best < edge && b > best / edge) continue;
    const bl = lobes[owner[i]];
    // Lit from above and a bit to the left: bright on top of each head, down to a dark belly, rounder where it's deep
    const down = Math.min(1, (y - top[x]) / thick);
    const L = 0.92 - 0.8 * down - 0.14 * (x / w - 0.5) + 0.14 * best;
    lvl[i] = Math.max(0, Math.min(N - 1, Math.floor(L * N + (b - 0.5) * 0.7)));
    upper[i] = y + 0.5 < bl.y ? 1 : 0;
  }
  // A lit lip along the tops of the heads, the belly's underside a step darker
  const out = lvl.slice();
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, v = lvl[i];
    if (v < 0) continue;
    if ((y === 0 || lvl[i - w] < 0) && upper[i] && shape !== 'wisp') out[i] = Math.max(v, N - 1 - (x & 1 && v < N - 3 ? 1 : 0));
    else if (y === h - 1 || lvl[i + w] < 0) out[i] = Math.max(0, v - 1);
  }
  const img = g.createImageData(w, h), d = img.data;
  for (let i = 0; i < w * h; i++) {
    if (out[i] < 0) continue;
    const col = ramp[out[i]];
    d[i * 4] = col[0]; d[i * 4 + 1] = col[1]; d[i * 4 + 2] = col[2]; d[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
};

/** The murk, 400 x 300 cells: the stops in flat bands, dithered only right at each seam. */
const paintMurk = (stops: RGB[]) => {
  const W = 400, H = 300, BANDS = 12;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  const img = g.createImageData(W, H), d = img.data;
  const band = (b: number) => { const t = (b / (BANDS - 1)) * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(t)); return mix(stops[i], stops[i + 1], t - i); };
  const cols = Array.from({ length: BANDS }, (_, b) => band(b));
  for (let y = 0; y < H; y++) {
    const v = (y / H) * BANDS, b = Math.floor(v), f = v - b;
    for (let x = 0; x < W; x++) {
      const k = f > 0.7 && b < BANDS - 1 && bayer(x, y) < (f - 0.7) / 0.3 ? b + 1 : b;
      const col = cols[k], i = (y * W + x) * 4;
      d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return c;
};

/** Light from below, 400 x 150 cells: six steps of it up from the bottom, each seam dithered. */
const paintGlow = (color: RGB) => {
  const W = 400, H = 150, STEPS = 6;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  const img = g.createImageData(W, H), d = img.data;
  for (let y = 0; y < H; y++) {
    const v = (y / H) * STEPS, s = Math.floor(v), f = v - s;
    for (let x = 0; x < W; x++) {
      const k = f > 0.65 && bayer(x, y) < (f - 0.65) / 0.35 ? s + 1 : s;
      const i = (y * W + x) * 4;
      d[i] = color[0]; d[i + 1] = color[1]; d[i + 2] = color[2]; d[i + 3] = Math.round(255 * Math.pow(k / STEPS, 1.6));
    }
  }
  g.putImageData(img, 0, 0);
  return c;
};

/** A sun's glare, 160 cells across: stepped rings, brightest in the middle, each seam dithered. */
const paintSun = (color: RGB) => {
  const S = 160, STEPS = 6;
  const c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d')!;
  const img = g.createImageData(S, S), d = img.data;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const r = Math.hypot(x + 0.5 - S / 2, y + 0.5 - S / 2) / (S / 2);
    if (r >= 1) continue;
    const v = (1 - r) * STEPS, s = Math.floor(v), f = v - s;
    const k = f > 0.65 && bayer(x, y) < (f - 0.65) / 0.35 ? s + 1 : s;
    const i = (y * S + x) * 4;
    d[i] = color[0]; d[i + 1] = color[1]; d[i + 2] = color[2]; d[i + 3] = Math.round(255 * Math.pow(k / STEPS, 1.8));
  }
  g.putImageData(img, 0, 0);
  return c;
};

interface Sprites { far: HTMLCanvasElement[]; mid: HTMLCanvasElement[]; near: HTMLCanvasElement[]; wisp: HTMLCanvasElement[]; murk: HTMLCanvasElement; glow?: HTMLCanvasElement; sun?: HTMLCanvasElement }
const cache = new Map<CloudLook, Sprites>();

const spritesFor = (look: CloudLook): Sprites => {
  let s = cache.get(look);
  if (s) return s;
  const ramp = look.ramp.map(rgb), murk = look.murk.map(rgb);
  // (the far ones half gone into the murk)
  const far = ramp.map(c => mix(c, murk[1], 0.45));
  const wisp = ramp.slice(1).map(c => mix(c, murk[0], 0.25));
  s = {
    far: [0, 1, 2, 3].map(i => paintPuff(100 + i, 40 + Math.round(hash(i + 1) * 22), 22 + Math.round(hash(i + 2) * 8), 'puff', far)),
    mid: [0, 1, 2, 3, 4].map(i => paintPuff(200 + i, 80 + Math.round(hash(i + 11) * 60), 40 + Math.round(hash(i + 12) * 20), 'puff', ramp)),
    near: [0, 1, 2].map(i => paintPuff(300 + i, 120 + Math.round(hash(i + 21) * 50), 120 + Math.round(hash(i + 22) * 40), 'tall', ramp)),
    wisp: [0, 1, 2].map(i => paintPuff(400 + i, 70 + Math.round(hash(i + 31) * 40), 10 + Math.round(hash(i + 32) * 6), 'wisp', wisp)),
    murk: paintMurk(murk),
    glow: look.glow ? paintGlow(rgb(look.glow.color)) : undefined,
    sun: look.sun ? paintSun(rgb(look.sun.color)) : undefined,
  };
  cache.set(look, s);
  return s;
};

/** Paints a destination's clouds ahead of time (the deploy transition does, as it starts), so the dive doesn't hitch. */
export const prepareSkyClouds = (stageId?: string | null) => { if (typeof document !== 'undefined') spritesFor(lookFor(stageId)); };

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

/** The three layers of puffs, and the wisps: how many, how fast they go by, and how far they part as the cover goes. */
const LAYERS = [
  { key: 'far', n: 14, speed: 0.42, part: 0.35, sway: 0.4, seed: 0 },
  { key: 'wisp', n: 9, speed: 0.8, part: 0.6, sway: 1.4, seed: 100, alpha: 0.75 },
  { key: 'mid', n: 12, speed: 1, part: 0.9, sway: 1, seed: 200 },
  { key: 'near', n: 6, speed: 2, part: 1.7, sway: 0.7, seed: 300 },
] as const;


const drawLayer = (ctx: Ctx, w: number, h: number, cover: number, scroll: number, look: CloudLook, sprites: HTMLCanvasElement[], L: typeof LAYERS[number]) => {
  const n = Math.round(L.n * look.density);
  const maxH = 2 * Math.max(...sprites.map(s => s.height)), maxW = 2 * Math.max(...sprites.map(s => s.width));
  const spanY = h + maxH, spanX = w + maxW;
  const fall = scroll * L.speed * look.speed;
  for (let i = 0; i < n; i++) {
    const k = L.seed + i;
    const sp = sprites[i % sprites.length];
    const sw = sp.width * 2, sh = sp.height * 2;
    const jitter = 0.85 + hash(k + 7) * 0.3;
    const y = wrap(hash(k + 90) * spanY - fall * jitter, spanY) - maxH;
    let x = wrap(hash(k + 50) * spanX + fall * look.drift + look.sway * L.sway * Math.sin(scroll * 0.005 + i * 1.7), spanX) - maxW / 2;
    // (parting as the cover goes: out to the sides)
    x = w / 2 + (x - w / 2) * (1 + (1 - cover) * L.part);
    const a = step8(cover * (0.82 + hash(k + 3) * 0.4) * ('alpha' in L ? L.alpha : 1));
    if (a <= 0) continue;
    ctx.globalAlpha = a;
    ctx.drawImage(sp, snap(x - sw / 2), snap(y), sw, sh);
  }
};

/** Speed: long thin streaks of wind shooting up past him. */
const drawStreaks = (ctx: Ctx, w: number, h: number, cover: number, scroll: number, look: CloudLook) => {
  const span = h + 200;
  ctx.fillStyle = look.streak;
  for (let i = 0; i < 14; i++) {
    const len = snap(40 + hash(i + 600) * 110);
    const y = wrap(hash(i + 610) * span - scroll * (2.4 + hash(i + 620) * 1.2), span) - 150;
    const x = snap(wrap(hash(i + 630) * w + scroll * look.drift * 2, w));
    ctx.globalAlpha = step8(cover * (0.25 + hash(i + 640) * 0.3));
    ctx.fillRect(x, y, 2, len);
    // (a fainter tail)
    ctx.globalAlpha = step8(cover * 0.15);
    ctx.fillRect(x, y + len, 2, len >> 1);
  }
};

/** What's in the air with him: snow, ash, embers, smog, dust or soot, going by at its own speed. */
const drawMotes = (ctx: Ctx, w: number, h: number, cover: number, scroll: number, look: CloudLook, kind: Mote) => {
  const a = step8(cover);
  if (a <= 0) return;
  ctx.globalAlpha = a;
  const span = h + 80, base = { snow: 700, ash: 760, embers: 820, smog: 940, dust: 1000, soot: 1060 }[kind];
  const count = { snow: 70, ash: 40, embers: 34, smog: 36, dust: 70, soot: 44 }[kind];
  const flick = Math.floor(scroll / 24);
  for (let i = 0; i < count; i++) {
    const k = base + i;
    const sp = { snow: 0.7, ash: 0.6, embers: 2, smog: 0.45, dust: 0.9, soot: 1.2 }[kind] * (0.7 + hash(k) * 0.6);
    const y = wrap(hash(k + 1) * span - scroll * sp, span) - 40;
    const sway = kind === 'snow' || kind === 'ash' || kind === 'smog' ? Math.sin(scroll * 0.01 + i) * 18 : 0;
    const drift = kind === 'dust' ? scroll * 0.9 : scroll * look.drift;
    const x = snap(wrap(hash(k + 2) * w + drift + sway, w));
    const yy = snap(y), big = hash(k + 3) > 0.7;
    switch (kind) {
      case 'snow':
        ctx.fillStyle = big ? '#FFFFFF' : '#D6E8FF';
        if (big) { ctx.fillRect(x - 2, yy, 6, 2); ctx.fillRect(x, yy - 2, 2, 6); } else ctx.fillRect(x, yy, 2, 2);
        break;
      case 'ash':
        ctx.fillStyle = big ? '#9A8A84' : '#5E504C';
        ctx.fillRect(x, yy, big ? 4 : 2, 2);
        break;
      case 'embers': {
        const c = (i + flick) % 4;
        if (c === 3) break;
        ctx.fillStyle = c === 0 ? '#FFF1A0' : c === 1 ? '#FFAA22' : '#FF5A14';
        ctx.fillRect(x, yy, 2, 2);
        ctx.fillStyle = '#C8320C'; ctx.fillRect(x, yy + 2, 2, big ? 6 : 2);
        break;
      }
      case 'smog':
        ctx.fillStyle = big ? '#D8E66A' : '#9AB040';
        ctx.fillRect(x, yy, big ? 6 : 4, big ? 4 : 2);
        if (big) { ctx.fillRect(x + 2, yy - 2, 2, 2); ctx.fillRect(x - 2, yy + 2, 2, 2); }
        break;
      case 'dust':
        ctx.fillStyle = big ? '#FFE6B4' : '#C8946A';
        ctx.fillRect(x, yy, big ? 4 : 2, 2);
        break;
      case 'soot':
        ctx.fillStyle = big ? '#000000' : '#2A1E16';
        ctx.fillRect(x, yy, big ? 4 : 2, big ? 4 : 2);
        break;
    }
  }
};


/**
 * cover: 1 is solid cloud, 0 is clear. scroll: how far you've fallen through it
 * (the puffs stream up past you as it grows). stageId: whose clouds (each place
 * its own; the deploy and the stage pass the same one).
 */
export const drawSkyClouds = (ctx: Ctx, w: number, h: number, cover: number, scroll: number, stageId?: string | null) => {
  if (cover <= 0 || typeof document === 'undefined') return;
  const look = lookFor(stageId);
  const sp = spritesFor(look);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  // The murk between the puffs
  ctx.globalAlpha = step8(cover * 1.4 - 0.4);
  if (ctx.globalAlpha > 0) ctx.drawImage(sp.murk, 0, 0, w, h);
  drawLayer(ctx, w, h, cover, scroll, look, sp.far, LAYERS[0]);
  drawLayer(ctx, w, h, cover, scroll, look, sp.wisp, LAYERS[1]);
  drawLayer(ctx, w, h, cover, scroll, look, sp.mid, LAYERS[2]);
  drawStreaks(ctx, w, h, cover, scroll, look);
  for (const m of look.motes ?? []) drawMotes(ctx, w, h, cover, scroll, look, m);
  drawLayer(ctx, w, h, cover, scroll, look, sp.near, LAYERS[3]);
  // Light from below, added on (the fire, the city), the bellies catching it
  if (look.glow && sp.glow) {
    const f = look.glow.flicker;
    const k = f === 'pulse' ? 0.8 + 0.2 * Math.round(Math.sin(scroll * 0.012) * 2) / 2
      : f === 'blackout' ? [1, 1, 0.55, 0.15, 0.6, 1, 1, 0.85][Math.floor(scroll / 70) % 8] : 1;
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = step8(cover * look.glow.a * k);
    ctx.drawImage(sp.glow, 0, h - h / 2, w, h / 2);
    ctx.globalCompositeOperation = 'source-over';
  }
  // The sun glinting through from up over the top right (it doesn't go by: it's that far off)
  if (look.sun && sp.sun) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = step8(cover * look.sun.a);
    ctx.drawImage(sp.sun, snap(w * 0.84 - 200), snap(-40 - 200), 400, 400);
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
};

/** How far he's fallen, t frames into the stage (the skyfall carrying on from where the deploy's dive ended: its first frame, t 1, is the dive's last). */
const skyfallScroll = (t: number) => DEPLOY_CLOUD_SCROLL_END + Math.max(0, t - 1) * SKYFALL_CLOUD_SPEED;

/**
 * The clouds parting at the start of a stage, t frames in (nothing once they've gone). `settle`: slowing to a stop
 * as they go instead of streaming on (a stage he doesn't fall into: a dissolve out of the dive).
 */
export const drawCloudExit = (ctx: Ctx, w: number, h: number, stageId: string | null | undefined, t: number, settle = false) => {
  // (counted from t 1, the dive's last frame over again)
  const k = Math.max(0, t - 1) / SKYFALL_CLOUD_FRAMES;
  if (k >= 1) return;
  const scroll = settle ? DEPLOY_CLOUD_SCROLL_END + SKYFALL_CLOUD_SPEED * (t - t * t / (2 * SKYFALL_CLOUD_FRAMES)) : skyfallScroll(t);
  drawSkyClouds(ctx, w, h, 1 - k * k, scroll, stageId);
};

// ---------------------------------------------------------------------------
// The sky over the stage's own, for the skyfall's camera coming down through it
// ---------------------------------------------------------------------------

/** The top of each stage's sky where he lands (what its backdrop paints along the top), and whether it's starry. */
const ZENITH: Record<string, { color: string; stars?: boolean }> = {
  'Artie Avalanche': { color: '#040714', stars: true },
  'Victor Volcano': { color: '#1F0A1A' },
  'Ernie Earthquake': { color: '#221537' },
  'Hector Hurricane': { color: '#1D8FE0' },
  'Toxic Tommy': { color: '#3E6FB0' },
  'Blackout Barry': { color: '#010208', stars: true },
  'Oily Oscar': { color: '#140A08' },
  'Drug Trade Dale': { color: '#140C2E', stars: true },
};

/** How tall each step of the sky is above the backdrop, going up, and how much deeper each one is. */
const ZENITH_BAND = 48, ZENITH_STEP = 0.07, ZENITH_STEPS = 5;

/**
 * The sky carried on up from the top of the stage's backdrop (drawn h lower down the screen, the camera above its
 * place): the same colour where they meet, deeper a step at a time going up, banded, each seam dithered, and the
 * stars on, if it's a starry one, going by with it.
 */
export const drawSkyAbove = (ctx: Ctx, w: number, h: number, stageId?: string | null) => {
  if (h <= 0) return;
  const z = (stageId && ZENITH[stageId]) || { color: '#0A1020' };
  const base = rgb(z.color);
  const band = (k: number) => { const c = mix(base, [0, 0, 0], Math.min(k, ZENITH_STEPS) * ZENITH_STEP); return `rgb(${c[0]}, ${c[1]}, ${c[2]})`; };
  ctx.save();
  // (bands counted up from the seam, so they stay put on the sky as it slides down)
  for (let k = 0; h - k * ZENITH_BAND > 0; k++) {
    const y1 = h - k * ZENITH_BAND, y0 = Math.max(0, y1 - ZENITH_BAND);
    ctx.fillStyle = band(k);
    ctx.fillRect(0, y0, w, y1 - y0 + (k === 0 ? 2 : 0));
    // (the seam under this band: a checker row of it down into the one below, and of that up into it)
    if (k > 0 && k <= ZENITH_STEPS) { checker(ctx, 0, y1, w, 2, band(k), 0); checker(ctx, 0, y1 - 2, w, 2, band(k - 1), 1); }
  }
  if (z.stars) {
    for (let i = 0; i < 60; i++) {
      const y = snap(h - 8 - hash(i + 1500) * 1600);
      if (y < 0 || y > h - 6) continue;
      const x = snap(hash(i + 1600) * w), big = hash(i + 1700) > 0.85;
      ctx.fillStyle = big ? '#BFD4FF' : '#6E7FA8';
      ctx.fillRect(x, y, 2, 2);
      if (big) { ctx.fillStyle = '#4A5A86'; ctx.fillRect(x - 2, y, 2, 2); ctx.fillRect(x + 2, y, 2, 2); ctx.fillRect(x, y - 2, 2, 2); ctx.fillRect(x, y + 2, 2, 2); }
    }
  }
  ctx.restore();
};
