// The dirt road, the Genesis way (the segment-based pseudo-3D road of Road Rash, OutRun and Super Hang-On: NOT Mode 7).
// The road is a run of segments, each SEG_L long, each with a curve (bends are faked by the road's centre sliding
// sideways a little more each segment, accumulated out to the horizon) and a height (hills: each segment's ends
// projected up or down). Drawn far to near as flat bands: grass, the dirt's rumble edge and the road, each band
// alternating light and dark every RUMBLE segments (the stripes rushing at you are the speed), the fog stepping in
// toward the horizon in bands; the roadside things (sprites) scaled by their segment's projection and clipped at the
// crest of any hill in front of them; parallax layers behind (the snowcapped range, the near hills or treeline) that
// slide on the bends and bob on the hills. All of it on a small 400x300 canvas (chunky, a limited palette, banded),
// blown up 2x onto the screen.
//
// The road isn't laid out ahead of time: it's generated as he rides, piece by piece, into a ring of segments, by the
// stretch he's in (its biome: the trail through the woods, the fields, farm country, the creek, the power lines, the
// last mile): its bends, its hills, what's by the roadside and in the road. A stretch goes on until its teens are
// beaten; the next one's road starts generating then (out past the horizon).

import { mix } from '../kit';
import { timeOfDay, drawTodSky } from '../../timeOfDay';

export const W = 400, H = 300, HORIZON = 112, K = W / 2;
export const SEG_L = 200, ROAD_W = 1000, CAM_H = 700, CAM_D = 0.84, DRAW = 140, PLAYER_Z = 900;
export const RUMBLE = 3;
/** Road nearer the camera than this never clips anything (it's behind him). */
const NEAR_CLIP = PLAYER_Z * 0.5;
const RING = 2048, MASK = RING - 1;

export type Biome = 'trail' | 'fields' | 'farm' | 'creek' | 'power' | 'last';
export const BIOMES: Biome[] = ['trail', 'fields', 'farm', 'creek', 'power', 'last'];

/** What can be by (or in) the road. */
export type SprKind =
  | 'pine' | 'oak' | 'bush' | 'boulder' | 'post' | 'mailbox' | 'hay' | 'outhouse' | 'tractor' | 'slow' | 'sign'
  | 'cow' | 'deer' | 'pylon' | 'pole' | 'barn' | 'house' | 'reeds' | 'rock' | 'log' | 'stump'
  | 'teentree' | 'bloodtree' | 'deadcow' | 'deaddeer' | 'health' | 'scorch' | 'gore';

/** How each kind is in the world: its size (world units), how wide it is to hit (road half-widths either side of
 *  its middle), whether it's tall (no jumping it) or low (jump it), what it hurts him as, and whether it's alive. */
export interface SprDef { w: number; h: number; hit: number; solid: 'tall' | 'low' | 'none'; src?: string; animal?: 'cow' | 'deer' }
export const SPR: Record<SprKind, SprDef> = {
  pine: { w: 620, h: 1500, hit: 0.16, solid: 'tall', src: 'm2:fr_bail_tree' },
  oak: { w: 980, h: 1300, hit: 0.22, solid: 'tall', src: 'm2:fr_bail_tree' },
  teentree: { w: 980, h: 1300, hit: 0.22, solid: 'tall', src: 'm2:fr_bail_tree' },
  bloodtree: { w: 980, h: 1300, hit: 0.22, solid: 'tall', src: 'm2:fr_bail_tree' },
  bush: { w: 420, h: 300, hit: 0, solid: 'none' },
  boulder: { w: 620, h: 440, hit: 0.26, solid: 'tall', src: 'm2:fr_bail_rock' },
  post: { w: 70, h: 260, hit: 0.05, solid: 'tall', src: 'm2:fr_bail_post' },
  mailbox: { w: 140, h: 300, hit: 0.07, solid: 'tall', src: 'm2:fr_bail_post' },
  hay: { w: 380, h: 320, hit: 0.18, solid: 'tall', src: 'm2:fr_bail_hay' },
  outhouse: { w: 380, h: 720, hit: 0.2, solid: 'tall', src: 'm2:fr_bail_outhouse' },
  tractor: { w: 900, h: 640, hit: 0.4, solid: 'tall', src: 'm2:fr_bail_tractor' },
  slow: { w: 280, h: 620, hit: 0.06, solid: 'tall', src: 'm2:fr_bail_post' },
  sign: { w: 880, h: 720, hit: 0.1, solid: 'tall', src: 'm2:fr_bail_post' },
  cow: { w: 640, h: 400, hit: 0.28, solid: 'tall', src: 'm2:fr_bail_cow', animal: 'cow' },
  deer: { w: 500, h: 440, hit: 0.2, solid: 'tall', src: 'm2:fr_bail_deer', animal: 'deer' },
  pylon: { w: 760, h: 2600, hit: 0.24, solid: 'tall', src: 'm2:fr_bail_pylon' },
  pole: { w: 90, h: 1700, hit: 0.05, solid: 'tall', src: 'm2:fr_bail_post' },
  barn: { w: 2200, h: 1600, hit: 0, solid: 'none' },
  house: { w: 1700, h: 1200, hit: 0, solid: 'none' },
  reeds: { w: 300, h: 260, hit: 0, solid: 'none' },
  rock: { w: 300, h: 130, hit: 0.13, solid: 'low', src: 'm2:fr_bail_rock' },
  log: { w: 2700, h: 150, hit: 1.35, solid: 'low', src: 'm2:fr_bail_log' },
  stump: { w: 260, h: 160, hit: 0.1, solid: 'low', src: 'm2:fr_bail_log' },
  deadcow: { w: 680, h: 220, hit: 0.26, solid: 'low', src: 'm2:fr_bail_cow' },
  deaddeer: { w: 520, h: 200, hit: 0.2, solid: 'low', src: 'm2:fr_bail_deer' },
  health: { w: 180, h: 160, hit: 0.16, solid: 'none' },
  scorch: { w: 900, h: 60, hit: 0, solid: 'none' },
  gore: { w: 900, h: 60, hit: 0, solid: 'none' },
};

/** A thing by (or in) the road: its kind, where across (road half-widths from the middle: past ±1 is off the road),
 *  for a sign its words, for an animal crossing how fast across, dead or taken. */
export interface Spr { k: SprKind; x: number; seed: number; words?: string; vx?: number; gone?: boolean; t?: number }
export interface Seg { i: number; curve: number; y1: number; y2: number; biome: number; water: boolean; mound: boolean; spr: Spr[] }

// ---------------------------------------------------------------------------------------------------------------
// The ring of segments, and its generator

export interface Track {
  segs: Seg[];
  /** The next segment to generate, and its start height. */
  next: number; lastY: number;
  /** The biome it's generating now (the stretch's), and how far into it. */
  biome: number; inBiome: number;
  /** A seeded random, so a stretch started again lays out the same. */
  rnd: number;
  /** A sign to put up at the start of the next piece (a stretch's name), and a pickup to drop in its middle. */
  sign: string | null; health: boolean;
}

export const newTrack = (biome: number, seed: number): Track => {
  const segs: Seg[] = [];
  for (let i = 0; i < RING; i++) segs.push({ i: -1, curve: 0, y1: 0, y2: 0, biome, water: false, mound: false, spr: [] });
  return { segs, next: 0, lastY: 0, biome, inBiome: 0, rnd: (seed * 9301 + 49297) % 233280 || 1, sign: null, health: false };
};
const rand = (t: Track) => { t.rnd = (t.rnd * 9301 + 49297) % 233280; return t.rnd / 233280; };
const pick = <T,>(t: Track, a: readonly T[]) => a[Math.floor(rand(t) * a.length)];

export const segAt = (t: Track, i: number): Seg => t.segs[i & MASK];

const easeIn = (a: number, b: number, p: number) => a + (b - a) * p * p;
const easeInOut = (a: number, b: number, p: number) => a + (b - a) * (-Math.cos(p * Math.PI) / 2 + 0.5);

const addSeg = (t: Track, curve: number, y: number) => {
  const s = t.segs[t.next & MASK];
  s.i = t.next; s.curve = curve; s.y1 = t.lastY; s.y2 = y; s.biome = t.biome; s.water = false; s.mound = false; s.spr.length = 0;
  t.lastY = y; t.next++; t.inBiome++;
  return s;
};
/** A piece of road: easing into a bend and a hill, holding them, easing out (the classic way). Height in segments. */
const addRoad = (t: Track, enter: number, hold: number, leave: number, curve: number, hill: number) => {
  const startY = t.lastY, endY = startY + hill * SEG_L, total = enter + hold + leave;
  const first = t.next;
  for (let n = 0; n < enter; n++) addSeg(t, easeIn(0, curve, n / enter), easeInOut(startY, endY, (n + 1) / total));
  for (let n = 0; n < hold; n++) addSeg(t, curve, easeInOut(startY, endY, (enter + n + 1) / total));
  for (let n = 0; n < leave; n++) addSeg(t, easeInOut(curve, 0, n / leave), easeInOut(startY, endY, (enter + hold + n + 1) / total));
  return first;
};
const put = (t: Track, i: number, k: SprKind, x: number, extra: Partial<Spr> = {}) => { segAt(t, i).spr.push({ k, x, seed: Math.floor(rand(t) * 9999), ...extra }); };

/** How hard each biome's bends and hills get (curve, hill in segments). */
const ROUGH: Record<Biome, { curve: number[]; hill: number[]; len: number }> = {
  trail: { curve: [0, 2, -2, 3, -3], hill: [0, 8, -8, 12, -12], len: 1 },
  fields: { curve: [0, 2, -2, 0, 3, -3], hill: [0, 10, -10, 16, -16], len: 1.3 },
  farm: { curve: [2, -2, 4, -4, 0], hill: [0, 14, -14, 22, -22], len: 1.1 },
  creek: { curve: [3, -3, 5, -5, 0], hill: [10, -10, 20, -20, 0], len: 1 },
  power: { curve: [4, -4, 6, -6, 3, -3], hill: [16, -16, 28, -28, 0], len: 0.9 },
  last: { curve: [5, -5, 6, -6, 2, -2], hill: [20, -20, 30, -30, 10, -10], len: 0.9 },
};

/** Roadside dressing, every so many segments, by biome (the far stuff is scenery; the near stuff can be hit). */
const dress = (t: Track, from: number, to: number) => {
  const b = BIOMES[t.biome];
  for (let i = from; i < to; i++) {
    const r = rand(t), side = rand(t) < 0.5 ? -1 : 1;
    switch (b) {
      case 'trail':
        if (i % 3 === 0) put(t, i, rand(t) < 0.7 ? 'pine' : 'oak', side * (1.3 + rand(t) * 1.6));
        if (i % 7 === 0) put(t, i, rand(t) < 0.5 ? 'pine' : 'bush', -side * (1.25 + rand(t) * 0.8));
        if (r < 0.03) put(t, i, 'stump', side * (1.1 + rand(t) * 0.3));
        if (r > 0.985) put(t, i, 'boulder', side * (1.4 + rand(t)));
        break;
      case 'fields':
        if (i % 4 === 0) { put(t, i, 'post', -1.25); put(t, i, 'post', 1.25); }
        if (i % 23 === 0) put(t, i, 'hay', side * (1.6 + rand(t) * 1.5));
        if (r < 0.025) put(t, i, 'cow', side * (1.7 + rand(t) * 1.8));
        if (i % 37 === 0) put(t, i, 'oak', side * (2.4 + rand(t) * 2));
        if (r > 0.99) put(t, i, 'mailbox', side * 1.18);
        break;
      case 'farm':
        if (i % 4 === 0) { put(t, i, 'post', -1.25); put(t, i, 'post', 1.25); }
        if (i % 15 === 0) put(t, i, rand(t) < 0.5 ? 'mailbox' : 'hay', side * (1.2 + rand(t) * 0.5));
        if (r < 0.03) put(t, i, 'cow', side * (1.5 + rand(t) * 1.6));
        if (i % 90 === 30) put(t, i, rand(t) < 0.5 ? 'barn' : 'house', side * 5);
        if (i % 90 === 60) put(t, i, rand(t) < 0.5 ? 'outhouse' : 'tractor', side * (1.45 + rand(t) * 0.3));
        if (i % 120 === 10) put(t, i, 'slow', side * 1.2);
        if (i % 29 === 0) put(t, i, 'oak', side * (2 + rand(t) * 2));
        break;
      case 'creek':
        if (i % 3 === 0) put(t, i, rand(t) < 0.5 ? 'oak' : 'pine', side * (1.35 + rand(t) * 1.8));
        if (i % 5 === 0) put(t, i, 'reeds', -side * (1.15 + rand(t) * 0.5));
        if (r < 0.03) put(t, i, 'boulder', side * (1.3 + rand(t) * 1.2));
        if (r > 0.985) put(t, i, 'deer', side * (1.5 + rand(t)));
        break;
      case 'power':
        if (i % 40 === 0) { put(t, i, 'pylon', -1.9); put(t, i, 'pylon', 1.9); }
        if (i % 4 === 2) put(t, i, rand(t) < 0.5 ? 'bush' : 'pine', side * (1.4 + rand(t) * 2.2));
        if (r < 0.025) put(t, i, 'boulder', side * (1.25 + rand(t) * 1.3));
        if (r > 0.99) put(t, i, 'deer', side * (1.4 + rand(t)));
        break;
      case 'last':
        if (i % 6 === 0) put(t, i, 'pole', side * 1.4);
        if (i % 3 === 1) put(t, i, rand(t) < 0.6 ? 'pine' : 'oak', side * (1.6 + rand(t) * 1.8));
        if (r < 0.03) put(t, i, rand(t) < 0.5 ? 'cow' : 'deer', side * (1.5 + rand(t) * 1.4));
        if (r > 0.985) put(t, i, 'mailbox', side * 1.18);
        if (i % 140 === 70) put(t, i, 'outhouse', side * 1.5);
        break;
    }
  }
};

/** Something in the road to jump or ride round, by biome (the teach-then-escalate's middle). */
const obstacle = (t: Track, i: number) => {
  const b = BIOMES[t.biome];
  const r = rand(t);
  if (b === 'trail') { if (r < 0.5) put(t, i, 'log', 0); else { for (let k = 0; k < 4; k++) segAt(t, i + k).mound = true; } }
  else if (b === 'fields') { if (r < 0.5) put(t, i, 'cow', (rand(t) - 0.5) * 1.2); else put(t, i, 'rock', (rand(t) - 0.5) * 1.4); }
  else if (b === 'farm') { if (r < 0.4) put(t, i, 'cow', (rand(t) - 0.5) * 1.2); else if (r < 0.7) put(t, i, 'hay', (rand(t) - 0.5) * 1.2); else put(t, i, 'log', 0); }
  else if (b === 'creek') { for (let k = 0; k < 4; k++) segAt(t, i + k).water = true; put(t, i - 30, 'sign', pick(t, [-1.3, 1.3]), { words: 'CREEK' }); }
  else if (b === 'power') { if (r < 0.4) put(t, i, 'log', 0); else if (r < 0.7) { put(t, i, 'rock', -0.5); put(t, i + 2, 'rock', 0.4); } else { for (let k = 0; k < 4; k++) segAt(t, i + k).mound = true; } }
  else { if (r < 0.3) put(t, i, 'log', 0); else if (r < 0.6) { for (let k = 0; k < 4; k++) segAt(t, i + k).mound = true; } else put(t, i, 'deer', pick(t, [-1.6, 1.6]), { vx: 0.02 }); }
};

/** Generate on till there's road out past the horizon from segment `upTo`. */
export const generate = (t: Track, upTo: number) => {
  while (t.next < upTo) {
    const R = ROUGH[BIOMES[t.biome]];
    const first = t.next;
    if (t.sign) { const s = t.sign; t.sign = null; addRoad(t, 10, 30, 10, 0, 0); put(t, first + 32, 'sign', -1.35, { words: s }); dress(t, first, t.next); continue; }
    const len = Math.round((20 + rand(t) * 40) * R.len);
    // (the hills leaning back to level: the road wanders up and down but not off forever)
    let hill = pick(t, R.hill);
    if (t.lastY > 6000 && hill > 0) hill = -hill; else if (t.lastY < -6000 && hill < 0) hill = -hill;
    addRoad(t, Math.round(len * 0.3), len, Math.round(len * 0.3), pick(t, R.curve), hill);
    dress(t, first, t.next);
    // (in the middle of a piece, now and then: something in the road)
    const span = t.next - first;
    if (t.inBiome > 60 && rand(t) < 0.75) obstacle(t, first + Math.floor(span * (0.35 + rand(t) * 0.3)));
    if (t.health) { t.health = false; put(t, first + Math.floor(span / 2), 'health', (rand(t) - 0.5) * 0.8); }
  }
};
/** Over to the next biome (a new stretch): its sign first, a health pickup somewhere in it if `health`. */
export const nextBiome = (t: Track, biome: number, sign: string, health: boolean) => { t.biome = biome; t.inBiome = 0; t.sign = sign; t.health = health; };

// ---------------------------------------------------------------------------------------------------------------
// Projection (each frame: every segment's near edge out to the horizon, no allocations)

/** Screen x of the road's middle, y, the road's half-width (px), the scale, the depth, and the clip (the highest a
 *  thing at that slot shows: the crest of any hill in front of it), for each slot n out from the camera. */
export const PX = new Float32Array(DRAW + 2), PY = new Float32Array(DRAW + 2), PW = new Float32Array(DRAW + 2), PS = new Float32Array(DRAW + 2), PZ = new Float32Array(DRAW + 2), CLIP = new Float32Array(DRAW + 2);
export const view = { base: 0, camZ: 0, camX: 0, camY: 0 };

export const roadYAt = (t: Track, z: number) => {
  const i = Math.floor(z / SEG_L), s = segAt(t, i), p = (z - i * SEG_L) / SEG_L;
  return s.y1 + (s.y2 - s.y1) * p;
};

/** Project the road from camera depth camZ, the camera at camX (world, across) and camY (height). */
export const project = (t: Track, camZ: number, camX: number, camY: number) => {
  const base = Math.floor(camZ / SEG_L), pct = (camZ - base * SEG_L) / SEG_L;
  view.base = base; view.camZ = camZ; view.camX = camX; view.camY = camY;
  let x = 0, dx = -segAt(t, base).curve * pct, maxy = H;
  for (let n = 0; n <= DRAW + 1; n++) {
    const s = segAt(t, base + n);
    const z = (base + n) * SEG_L - camZ, sc = CAM_D / Math.max(z, 1);
    PX[n] = W / 2 + sc * (x - camX) * K;
    PY[n] = HORIZON - sc * (s.y1 - camY) * K;
    PW[n] = sc * ROAD_W * K; PS[n] = sc; PZ[n] = z;
    CLIP[n] = maxy;
    // (only road out ahead of the camera's own stretch can hide what's past it: the few segments under and just in
    // front of the camera (behind him) never clip anything; on a steep way down they projected up off the top of the
    // screen and hid every rider past them)
    if (n > 0 && z > NEAR_CLIP && PY[n] < maxy) maxy = PY[n];
    x += dx; dx += s.curve;
  }
};

/** Where something at depth z (absolute) and across x (road half-widths) is on screen: its slot, x, y, scale. */
export const placeAt = (z: number, x: number, out: { n: number; sx: number; sy: number; sc: number; clip: number }) => {
  const rel = z - view.base * SEG_L, n = Math.floor(rel / SEG_L), p = rel / SEG_L - n;
  if (n < 0 || n > DRAW) { out.n = -1; return out; }
  const sc = PS[n] + (PS[n + 1] - PS[n]) * p;
  out.n = n; out.sc = sc;
  out.sx = PX[n] + (PX[n + 1] - PX[n]) * p + sc * x * ROAD_W * K;
  out.sy = PY[n] + (PY[n + 1] - PY[n]) * p;
  out.clip = CLIP[n];
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// The road's colors, by biome, and fogged in bands toward the horizon

interface Pal { grass: [string, string]; rumble: [string, string]; road: [string, string]; rut: string; far: string; near: string; nearDk: string }
const PALS: Record<Biome, Pal> = {
  trail: { grass: ['#33602C', '#2A5226'], rumble: ['#5E4426', '#4E381E'], road: ['#8C6C46', '#80623E'], rut: '#6A5032', far: '#6E7F9C', near: '#24432A', nearDk: '#1A3220' },
  fields: { grass: ['#86AA4C', '#7A9E44'], rumble: ['#9A7A4C', '#8A6C42'], road: ['#B08E5C', '#A48252'], rut: '#8A6C44', far: '#7C8CA8', near: '#5E8240', nearDk: '#4A6A32' },
  farm: { grass: ['#6E9C40', '#62903A'], rumble: ['#8E6E44', '#7E603C'], road: ['#A4825A', '#987650'], rut: '#7E6040', far: '#7C8CA8', near: '#4E7A36', nearDk: '#3C6029' },
  creek: { grass: ['#4E803C', '#467636'], rumble: ['#5A4A34', '#4C3E2C'], road: ['#7A6448', '#6E5A40'], rut: '#56442E', far: '#6E7F9C', near: '#2E5232', nearDk: '#223E26' },
  power: { grass: ['#7E8C4C', '#727E44'], rumble: ['#7A7060', '#6C6254'], road: ['#9C9078', '#90846C'], rut: '#76705E', far: '#7C8CA8', near: '#566236', nearDk: '#444E2A' },
  last: { grass: ['#A8A052', '#9C944A'], rumble: ['#8E6C42', '#7E5E38'], road: ['#B48A58', '#A87E4E'], rut: '#8A6640', far: '#8A92AC', near: '#6E6A34', nearDk: '#58542A' },
};
const WATER: [string, string] = ['#3A78B0', '#326CA2'];
const FOG_STEPS = 6;
/** fogged[biome][step]: the palette mixed toward the haze, in steps (the Genesis banding). */
let fogged: { key: string; t: Pal[][]; water: [string, string][]; foam: string[] } | null = null;
const fogTable = () => {
  const tod = timeOfDay();
  if (fogged && fogged.key === tod.key) return fogged;
  const haze = tod.haze.startsWith('#') ? tod.haze : '#C8D4DC';
  const m = (c: string, k: number) => mix(c, haze, k);
  const t = BIOMES.map(b => {
    const P = PALS[b];
    return Array.from({ length: FOG_STEPS }, (_, s) => {
      const k = (s / (FOG_STEPS - 1)) * 0.85;
      return { grass: [m(P.grass[0], k), m(P.grass[1], k)], rumble: [m(P.rumble[0], k), m(P.rumble[1], k)], road: [m(P.road[0], k), m(P.road[1], k)], rut: m(P.rut, k), far: P.far, near: P.near, nearDk: P.nearDk } as Pal;
    });
  });
  const water = Array.from({ length: FOG_STEPS }, (_, s) => [m(WATER[0], (s / (FOG_STEPS - 1)) * 0.85), m(WATER[1], (s / (FOG_STEPS - 1)) * 0.85)] as [string, string]);
  const foam = Array.from({ length: FOG_STEPS }, (_, s) => m('#E6F2FA', (s / (FOG_STEPS - 1)) * 0.85));
  fogged = { key: tod.key, t, water, foam };
  return fogged;
};
export const palOf = (b: number) => PALS[BIOMES[b]];

const quad = (c: CanvasRenderingContext2D, col: string, x1: number, y1: number, w1: number, x2: number, y2: number, w2: number) => {
  c.fillStyle = col; c.beginPath();
  c.moveTo(x1 - w1, y1); c.lineTo(x2 - w2, y2); c.lineTo(x2 + w2, y2); c.lineTo(x1 + w1, y1); c.closePath(); c.fill();
};

/** The road, far to near (each nearer band over the farther). */
export const drawRoad = (c: CanvasRenderingContext2D, t: Track) => {
  const F = fogTable();
  for (let n = DRAW; n >= 1; n--) {
    if (PZ[n] < 40) continue;
    const y1 = PY[n], y2 = PY[n + 1];
    if (y2 >= y1 || y2 > H) continue;
    const s = segAt(t, view.base + n);
    const fogK = n / DRAW, step = Math.min(FOG_STEPS - 1, Math.floor(fogK * fogK * FOG_STEPS * 1.6));
    const P = F.t[s.biome][step], alt = Math.floor(s.i / RUMBLE) % 2;
    const top = Math.floor(y2), bot = Math.ceil(Math.min(y1, H));
    const x1 = PX[n], w1 = PW[n], x2 = PX[n + 1], w2 = PW[n + 1];
    if (s.water) {
      // (the creek across the road and off both sides: the water in bands, foam along its edges)
      c.fillStyle = F.water[step][alt]; c.fillRect(0, top, W, bot - top + 1);
      quad(c, F.foam[step], x1, y1, w1 * 0.06, x2, y2, w2 * 0.06);
      const prev = segAt(t, view.base + n - 1), nxt = segAt(t, view.base + n + 1);
      if (!prev.water || !nxt.water) { c.fillStyle = F.foam[step]; c.fillRect(0, !nxt.water ? top : bot - 2, W, 2); }
      continue;
    }
    c.fillStyle = P.grass[alt]; c.fillRect(0, top, W, bot - top + 1);
    quad(c, P.rumble[alt], x1, y1, w1 * 1.14, x2, y2, w2 * 1.14);
    quad(c, P.road[alt], x1, y1, w1, x2, y2, w2);
    // (the ruts worn in by every bike before him: two darker tracks, broken)
    if (alt === 0 || n < DRAW * 0.5) {
      quad(c, P.rut, x1 - w1 * 0.42, y1, w1 * 0.07, x2 - w2 * 0.42, y2, w2 * 0.07);
      quad(c, P.rut, x1 + w1 * 0.42, y1, w1 * 0.07, x2 + w2 * 0.42, y2, w2 * 0.07);
    }
    // (a dirt jump in the road: its face lit, banded)
    if (s.mound) quad(c, alt ? '#C49A64' : '#9C744A', x1, y1, w1 * 0.7, x2, y2, w2 * 0.7);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The background: the sky by the hour, the snowcapped range, the near hills (by biome), sliding on the bends

const layers = new Map<string, HTMLCanvasElement>();
const canvasOf = (w: number, h: number) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; };

const skyCanvas = () => {
  const tod = timeOfDay(), key = 'sky' + tod.key;
  let cv = layers.get(key);
  if (!cv) {
    cv = canvasOf(W, H);
    const c = cv.getContext('2d')!;
    drawTodSky(c, 0, 0, W, H, ['#1E40AF', '#3B82F6', '#7DB8F0', '#BFE0F8', '#F2E6C4', '#F8D9A0'], { horizon: HORIZON + 30, sun: [300, 40], moon: [90, 34], bands: 10 });
    layers.set(key, cv);
  }
  return cv;
};
/** The far range: snowcapped peaks (never a volcano), two tones, the snow painted on in steps. */
const rangeCanvas = (biome: number) => {
  const P = palOf(biome), key = 'range' + P.far;
  let cv = layers.get(key);
  if (!cv) {
    cv = canvasOf(W * 2, 70);
    const c = cv.getContext('2d')!;
    const dk = mix(P.far, '#000000', 0.15);
    for (let k = 0; k < 4; k++) {
      const bx = k * 200;
      c.fillStyle = k % 2 ? dk : P.far; c.beginPath(); c.moveTo(bx - 40, 70);
      c.lineTo(bx + 40, 24); c.lineTo(bx + 70, 38); c.lineTo(bx + 110, 8); c.lineTo(bx + 160, 34); c.lineTo(bx + 200, 22); c.lineTo(bx + 250, 70); c.closePath(); c.fill();
      c.fillStyle = '#EEF2F6'; c.beginPath(); c.moveTo(bx + 96, 18); c.lineTo(bx + 110, 8); c.lineTo(bx + 126, 19); c.lineTo(bx + 116, 16); c.lineTo(bx + 110, 21); c.lineTo(bx + 103, 16); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(bx + 32, 29); c.lineTo(bx + 40, 24); c.lineTo(bx + 49, 30); c.closePath(); c.fill();
    }
    layers.set(key, cv);
  }
  return cv;
};
/** The near hills or treeline, by biome (the woods a jagged pine line; the fields soft hills with a farm or two; the
 *  power lines' towers marching off). */
const nearCanvas = (biome: number) => {
  const b = BIOMES[biome], P = palOf(biome), key = 'near' + b;
  let cv = layers.get(key);
  if (!cv) {
    cv = canvasOf(W * 2, 60);
    const c = cv.getContext('2d')!;
    c.fillStyle = P.nearDk; c.fillRect(0, 50, W * 2, 10);
    if (b === 'trail' || b === 'creek' || b === 'last') {
      // (a pine line: jagged tops in two rows)
      for (let row = 0; row < 2; row++) {
        c.fillStyle = row ? P.near : P.nearDk;
        for (let x = 0; x < W * 2; x += 7) {
          const h = 18 + ((x * 37 + row * 11) % 23) - row * 6;
          c.beginPath(); c.moveTo(x - 6, 60); c.lineTo(x, 60 - h); c.lineTo(x + 6, 60); c.closePath(); c.fill();
        }
      }
    } else {
      // (rolling hills, a few trees and a barn on them)
      c.fillStyle = P.near; c.beginPath(); c.moveTo(0, 60);
      for (let x = 0; x <= W * 2; x += 20) c.lineTo(x, 36 + Math.sin(x * 0.012) * 8 + Math.sin(x * 0.031) * 4);
      c.lineTo(W * 2, 60); c.closePath(); c.fill();
      c.fillStyle = P.nearDk;
      for (let x = 30; x < W * 2; x += 90) { c.beginPath(); c.arc(x, 36 + Math.sin(x * 0.012) * 8, 6, 0, Math.PI * 2); c.fill(); c.fillRect(x - 1, 38 + Math.sin(x * 0.012) * 8, 2, 6); }
      if (b === 'farm' || b === 'fields') { c.fillStyle = '#8A2A1E'; c.fillRect(250, 30, 16, 12); c.beginPath(); c.moveTo(248, 30); c.lineTo(258, 22); c.lineTo(268, 30); c.fill(); c.fillStyle = '#D8D0C0'; c.fillRect(256, 35, 4, 7); }
      if (b === 'power') {
        c.strokeStyle = '#4A4E52'; c.lineWidth = 1;
        for (let x = 40; x < W * 2; x += 120) { c.beginPath(); c.moveTo(x - 5, 50); c.lineTo(x, 14); c.lineTo(x + 5, 50); c.moveTo(x - 8, 20); c.lineTo(x + 8, 20); c.stroke(); }
        c.beginPath(); for (let x = 40; x < W * 2; x += 120) { c.moveTo(x - 8, 20); c.quadraticCurveTo(x + 52, 28, x + 112, 20); } c.stroke();
      }
    }
    layers.set(key, cv);
  }
  return cv;
};

/** The sky, the range and the near layer, slid sideways by bgX (the bends) and bobbed by the height. */
export const drawBackground = (c: CanvasRenderingContext2D, biome: number, bgX: number, bob: number) => {
  c.drawImage(skyCanvas(), 0, 0);
  const wrap = (cv: HTMLCanvasElement, speed: number, y: number) => {
    const off = ((-bgX * speed) % cv.width + cv.width) % cv.width;
    c.drawImage(cv, -off, y); c.drawImage(cv, cv.width - off, y);
  };
  wrap(rangeCanvas(biome), 0.25, HORIZON - 64 + bob * 0.3);
  wrap(nearCanvas(biome), 0.6, HORIZON - 52 + bob * 0.6);
  // (whatever's under the near layer down to the road's horizon: the near ground's dark)
  c.fillStyle = palOf(biome).nearDk; c.fillRect(0, HORIZON + 8 + bob * 0.6, W, H);
};
