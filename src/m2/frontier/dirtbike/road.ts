// The dirt road, the Genesis way (the segment-based pseudo-3D road of Road Rash, OutRun and Super Hang-On: NOT Mode 7).
// The road is a run of segments, each SEG_L long, each with a curve (bends are faked by the road's centre sliding
// sideways a little more each segment, accumulated out to the horizon) and a height (hills: each segment's ends
// projected up or down). Drawn far to near as flat bands: grass, the worn verge, the dirt's rumble edge, the road with
// its crown and its two ruts, each band alternating light and dark every RUMBLE segments (the stripes rushing at you
// are the speed), the fog stepping in toward the horizon in bands; the roadside things (sprites) scaled by their
// segment's projection and clipped at the crest of any hill in front of them; raster-style parallax layers behind (the
// real Rockies, a ridge, the near treeline or farm country, by the stretch) that slide on the bends. All of it on a
// small 400x300 canvas (chunky, a limited palette, banded), blown up 2x onto the screen.
//
// The road isn't laid out ahead of time: it's generated as he rides, piece by piece, into a ring of segments, by the
// stretch he's in (its biome: the trail through the woods, the fields, farm country, the creek, the power lines, the
// last mile): its bends, its hills, what's by the roadside and in the road. A stretch goes on until its teens are
// beaten; the next one's road starts generating then (out past the horizon).

import { mix } from '../kit';
import { timeOfDay, drawTodSky, farTint, skyAt, hourMix, cloudTint, type TimeOfDay } from '../../timeOfDay';
import { range, mist, snap2, wave, jag, fillUnder, wrapAt, box, checker, hash, hazeBands, pixelBlob, type RangeLook } from '../../adventure/farArt';
import { bandedGradient, NEEDLE } from '../wilds/paint';

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
// The road's colors, by biome, fogged in bands toward the horizon (the Genesis banding). Painted in the day's own
// colors: the hour's light goes over the whole road view after (chase.ts), so the fog steps toward the day's haze.

/** The haze the road and the far roadside fog toward. */
export const FOG_HAZE = '#C4D2DC';
export const FOG_STEPS = 8;
/** The fog step of slot n (0 clear .. FOG_STEPS-1 deepest). */
export const fogStep = (n: number) => { const k = n / DRAW; return Math.min(FOG_STEPS - 1, Math.floor(k * k * FOG_STEPS * 1.7)); };

type Two = [string, string];
interface Pal { grass: Two; verge: Two; rumble: Two; road: Two; crown: Two; rut: Two; lip: string; mud: Two; jump: [string, string, string, string]; tuft: [string, string, string] }
const pal = (grass: Two, verge: Two, rumble: Two, road: Two, crown: Two, rut: Two, lip: string): Pal => ({
  grass, verge, rumble, road, crown, rut, lip,
  // (the grass's tufts: a dark clump, a sunlit blade, a wildflower)
  tuft: [mix(grass[1], '#0E1A0A', 0.32), mix(grass[0], '#F4F0B0', 0.3), mix(grass[0], '#F2E2A0', 0.62)],
  mud: [mix(road[0], '#2A2014', 0.55), mix(road[1], '#2A2014', 0.6)],
  // (a dirt jump: its run-up, its lit face, the lip catching the sun, its back in shade)
  jump: [mix(road[0], '#000000', 0.12), mix(crown[0], '#FFF4D8', 0.18), mix(lip, '#FFFFFF', 0.25), mix(road[1], '#1A1008', 0.3)],
});
const PALS: Record<Biome, Pal> = {
  // (the trail through the woods: shaded, the verge needle duff)
  trail: pal(['#2E5A2A', '#264E24'], ['#40422A', '#363A24'], ['#5A4024', '#4A341C'], ['#8A6A44', '#7E603C'], ['#9A7A50', '#8E6E48'], ['#5E4628', '#56402A'], '#B08C5C'),
  // (open range: bright grass, the verge gone dry)
  fields: pal(['#8AAE4E', '#7EA246'], ['#A6A65A', '#9A9A50'], ['#9A7A4C', '#8A6C42'], ['#B4925E', '#A88654'], ['#C4A26C', '#B89662'], ['#8E7046', '#86683E'], '#DCC08A'),
  // (farm country: irrigated green, a ditch's verge)
  farm: pal(['#6E9E42', '#62923A'], ['#527E32', '#4A722C'], ['#8E6E44', '#7E603C'], ['#A8865C', '#9C7A52'], ['#B89668', '#AC8A5E'], ['#80623E', '#785A38'], '#D0B080'),
  // (down by the creek: lush, dark wet dirt)
  creek: pal(['#4E843E', '#467838'], ['#3A6632', '#325A2C'], ['#5A4A34', '#4C3E2C'], ['#7C6648', '#705C40'], ['#8C7656', '#806A4C'], ['#58462E', '#504028'], '#A89070'),
  // (the power line cut: a gravel service road through dry scrub)
  power: pal(['#7E8E4E', '#728246'], ['#8C8A5C', '#807E52'], ['#7A7262', '#6C6456'], ['#A09680', '#948A74'], ['#B0A690', '#A49A84'], ['#7A725E', '#706856'], '#C8BEA8'),
  // (the last mile: late, golden, dry)
  last: pal(['#AEA456', '#A2984C'], ['#C2B266', '#B6A65C'], ['#8E6C42', '#7E5E38'], ['#B68C5A', '#AA8050'], ['#C69C68', '#BA905E'], ['#8A6640', '#82603A'], '#E0BC88'),
};
/** The creek: deep, the ford's shallows over the road's line, a ripple, the foam. */
const WATER = ['#2E6AA2', '#28609A', '#5A98C4', '#5290BC', '#A4D0EC', '#E6F2FA'];

/** The road's colors fogged in steps: [biome][step], each a flat list (index by the Pal's order). Made once. */
interface Fogged { t: Pal[][]; water: string[][] }
let fogged: Fogged | null = null;
const fogTable = (): Fogged => {
  if (fogged) return fogged;
  const fk = (s: number) => (s / (FOG_STEPS - 1)) * 0.88;
  const m = (c: string, s: number) => mix(c, FOG_HAZE, fk(s));
  const m2 = (p: Two, s: number): Two => [m(p[0], s), m(p[1], s)];
  const t = BIOMES.map(b => {
    const P = PALS[b];
    return Array.from({ length: FOG_STEPS }, (_, s): Pal => ({
      grass: m2(P.grass, s), verge: m2(P.verge, s), rumble: m2(P.rumble, s), road: m2(P.road, s), crown: m2(P.crown, s), rut: m2(P.rut, s),
      lip: m(P.lip, s), mud: m2(P.mud, s), jump: [m(P.jump[0], s), m(P.jump[1], s), m(P.jump[2], s), m(P.jump[3], s)], tuft: [m(P.tuft[0], s), m(P.tuft[1], s), m(P.tuft[2], s)],
    }));
  });
  const water = Array.from({ length: FOG_STEPS }, (_, s) => WATER.map(c => m(c, s)));
  fogged = { t, water };
  return fogged;
};

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
    const s = segAt(t, view.base + n), step = fogStep(n);
    const P = F.t[s.biome][step], alt = Math.floor(s.i / RUMBLE) % 2;
    const top = Math.floor(y2), bot = Math.ceil(Math.min(y1, H)), bh = bot - top;
    const x1 = PX[n], w1 = PW[n], x2 = PX[n + 1], w2 = PW[n + 1];
    if (s.water) {
      // (the creek across the road and off both sides: the water in bands, the ford's shallows lighter over the road's
      // line, ripples riding across, foam along its banks)
      const Wt = F.water[step];
      c.fillStyle = Wt[alt]; c.fillRect(0, top, W, bh + 1);
      quad(c, Wt[2 + alt], x1, y1, w1 * 1.1, x2, y2, w2 * 1.1);
      if (bh >= 2) {
        c.fillStyle = Wt[4];
        const dw = Math.max(2, Math.round(w1 * 0.1));
        for (let k = 0; k < 6; k++) c.fillRect(((s.i * 37 + k * 71) % (W + 40)) - 20, top + (k & 1) * Math.min(bh - 1, 2), dw, 1);
      }
      const prev = segAt(t, view.base + n - 1), nxt = segAt(t, view.base + n + 1);
      if (!prev.water || !nxt.water) { c.fillStyle = Wt[5]; c.fillRect(0, !nxt.water ? top : bot - 2, W, 2); }
      continue;
    }
    // (wet and churned to mud either side of a creek's ford)
    const wet = segAt(t, s.i + 1).water || segAt(t, s.i + 2).water || segAt(t, s.i - 1).water || segAt(t, s.i - 2).water;
    c.fillStyle = P.grass[alt]; c.fillRect(0, top, W, bh + 1);
    // (tufts in the grass either side, by the segment (they rush at him with it): dark clumps with a sunlit blade on
    // top, the odd wildflower; bigger up close)
    if (n < DRAW * 0.75) {
      const sz = Math.max(1, Math.round(w1 * 0.022)), tufts = n < 24 ? 7 : n < 60 ? 5 : 3;
      for (let k = 0; k < tufts; k++) {
        const u = hash(s.i * 7.3 + k * 1.9), off = (u < 0.5 ? -1 : 1) * (1.65 + hash(s.i * 3.1 + k * 2.7) * 7), tx = Math.round(x1 + off * w1);
        if (tx < -8 || tx > W + 8) continue;
        const ty = top + (bh > 2 ? Math.round(hash(s.i + k * 5.1) * (bh - 1)) : 0);
        if (hash(s.i * 1.7 + k * 9.3) > 0.86) { c.fillStyle = P.tuft[2]; c.fillRect(tx, ty - sz, sz, sz); continue; }
        c.fillStyle = P.tuft[0]; c.fillRect(tx - sz, ty - sz, sz * 3, sz + 1);
        c.fillStyle = P.tuft[1]; c.fillRect(tx, ty - sz * 2, sz, sz);
      }
    }
    quad(c, wet ? P.mud[alt] : P.verge[alt], x1, y1, w1 * 1.5, x2, y2, w2 * 1.5);
    quad(c, P.rumble[alt], x1, y1, w1 * 1.14, x2, y2, w2 * 1.14);
    quad(c, wet ? P.mud[1 - alt] : P.road[alt], x1, y1, w1, x2, y2, w2);
    if (!wet) quad(c, P.crown[alt], x1, y1, w1 * 0.16, x2, y2, w2 * 0.16);
    // (the ruts worn in by every bike before him: two darker tracks, broken far off, their inside lips lit up close)
    if (alt === 0 || n < DRAW * 0.5) {
      quad(c, P.rut[alt], x1 - w1 * 0.42, y1, w1 * 0.07, x2 - w2 * 0.42, y2, w2 * 0.07);
      quad(c, P.rut[alt], x1 + w1 * 0.42, y1, w1 * 0.07, x2 + w2 * 0.42, y2, w2 * 0.07);
      if (n < 40 && bh >= 2) {
        quad(c, P.lip, x1 - w1 * 0.345, y1, w1 * 0.012, x2 - w2 * 0.345, y2, w2 * 0.012);
        quad(c, P.lip, x1 + w1 * 0.495, y1, w1 * 0.012, x2 + w2 * 0.495, y2, w2 * 0.012);
      }
    }
    // (a dirt jump in the road: its run-up, its lit face, the lip, its back in shade; tire tracks up it)
    if (s.mound) {
      let m = 0;
      while (m < 3 && segAt(t, s.i - 1 - m).mound) m++;
      quad(c, P.jump[m], x1, y1, w1 * 0.7, x2, y2, w2 * 0.7);
      if (m < 3) { quad(c, P.rut[alt], x1 - w1 * 0.2, y1, w1 * 0.05, x2 - w2 * 0.2, y2, w2 * 0.05); quad(c, P.rut[alt], x1 + w1 * 0.2, y1, w1 * 0.05, x2 + w2 * 0.2, y2, w2 * 0.05); }
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The background: raster-style layers (the Genesis's line-scrolled horizon), each painted once for the hour and
// slid sideways on the bends, nearer ones faster. The real thing out here (the woods' and the log ride's real side):
// the real sky, the Rockies with their snow, a ridge (the forest, the power line's clear-cut and its towers, the open
// range's foothills, farm country's patchwork, the last mile's dry foothills), and the near treeline or farm by the
// stretch. Painted on the land's far art's 2 px grid at the screen's scale, then halved onto the road view's own
// pixels. No volcanoes anywhere.

type Ctx = CanvasRenderingContext2D;
const layers = new Map<string, HTMLCanvasElement>();
const canvasOf = (w: number, h: number) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; };
/** A layer `w` x `h` (road view px), painted at twice that once for the hour. */
const layer = (key: string, w: number, h: number, paint: (g: Ctx, tod: TimeOfDay) => void) => {
  const tod = timeOfDay(), k = key + tod.key;
  let cv = layers.get(k);
  if (!cv) {
    const big = canvasOf(w * 2, h * 2);
    paint(big.getContext('2d')!, tod);
    cv = canvasOf(w, h);
    const g = cv.getContext('2d')!;
    g.imageSmoothingEnabled = false; g.drawImage(big, 0, 0, w, h);
    layers.set(k, cv);
  }
  return cv;
};

/** A far layer's color for the hour, then into the sky's haze by `k` (the woods' far's). */
const farCol = (tod: TimeOfDay, k: number) => (c: string) => mix(farTint(hourMix(c, mix(c, '#8A5A48', 0.18), mix(c, '#141832', 0.45), tod), 1, tod), skyAt(0.88, tod), k);
const lookOf = (T: (c: string) => string, base: string): RangeLook => ({ body: T(base), lit: T(mix(base, '#F4ECD8', 0.28)), hi: T(mix(base, '#FFFFFF', 0.45)), shade: T(mix(base, '#141A30', 0.22)), deep: T(mix(base, '#141A30', 0.38)) });

// (the woods' real sky)
const SKY = ['#163E9C', '#2458B8', '#3E78CC', '#6C9CDC', '#A8C8E8', '#DCE6E8'];

const CW = 1200, CH = 140;
const paintClouds = (g: Ctx, tod: TimeOfDay) => {
  const C = ['#9AA8C0', '#C2CCDC', '#E4EAF2', '#FFFFFF'].map(col => cloudTint(col, tod));
  for (let i = 0; i < 5; i++) {
    const cx = 100 + i * (CW / 5) + hash(i * 4.1) * 80, base = 50 + hash(i * 2.9) * 60, w = 120 + hash(i * 1.3) * 160;
    wrapAt(CW, cx, x => {
      const n = 6 + Math.floor(hash(i + 3) * 3);
      for (let k = 0; k < n; k++) { const u = (k + 0.5) / n, r = (0.5 + Math.sin(u * Math.PI) * 0.8) * w * 0.17; pixelBlob(g, x - w / 2 + u * w, base - r * 0.6, r, r * 0.8, C[1]); }
      for (let k = 0; k < n; k++) { const u = (k + 0.5) / n, r = (0.5 + Math.sin(u * Math.PI) * 0.8) * w * 0.17; pixelBlob(g, x - w / 2 + u * w - r * 0.2, base - r * 0.8, r * 0.75, r * 0.6, C[2]); pixelBlob(g, x - w / 2 + u * w - r * 0.35, base - r, r * 0.36, r * 0.28, C[3]); }
      box(g, x - w / 2, base - 4, w, 6, C[0]); checker(g, x - w / 2, base - 6, w, 2, C[0]);
    }, 240);
  }
};

// (the real Rockies: the woods' skyline)
const RW = 1100, RH = 240;
const peakY = (x: number) => snap2(RH - 150 + wave(x, RW, 3.7) * 54 + jag(x, RW, 6, 5) * 12 - Math.max(0, wave(x, RW, 6.3, 2)) * 32);
const paintPeaks = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.42), L = lookOf(T, '#76809E');
  range(g, RW, peakY, RH, L, 11, { gullies: 40, d: 16, forest: [T('#2E4C48'), T('#44625A')], forestY: x => RH - 60 + wave(x, RW, 2.4, 2) * 12 });
  const S = [T('#9AA8C8'), T('#C8D2E6'), T('#F4F8FE')], snowLine = RH - 118;
  for (let x = 0; x < RW; x += 2) {
    const y = peakY(x);
    if (y >= snowLine) continue;
    const foot = snowLine - 6 + jag(x, RW, 5, 13) * 28 + wave(x, RW, 8.1, 3) * 10;
    if (foot <= y) continue;
    const lit = peakY(x + 4) < y || (peakY(x + 4) === y && peakY(x - 4) > y);
    box(g, x, y, 2, foot - y, lit ? S[2] : S[0]);
    if (lit) box(g, x, y + (foot - y) * 0.6, 2, (foot - y) * 0.4, S[1]);
    if ((x >> 1) % 3 === 0) box(g, x, foot, 2, 4 + hash(x) * 10, S[0]);
  }
  mist(g, RW, RH - 70, 70, skyAt(0.92, tod), 0, 0.5, 6);
};

// (the ridge, by the stretch)
type Ridge = 'forest' | 'clearcut' | 'range' | 'farm' | 'foothills';
const RIDGE_OF: Record<Biome, Ridge> = { trail: 'forest', fields: 'range', farm: 'farm', creek: 'forest', power: 'clearcut', last: 'foothills' };
const FW = 1300, FH = 140;
const ridgeY = (x: number) => snap2(FH - 96 + wave(x, FW, 1.9) * 22 + wave(x, FW, 5.3, 2) * 8);
const paintRidge = (g: Ctx, tod: TimeOfDay, kind: Ridge) => {
  const T = farCol(tod, 0.24);
  if (kind === 'forest' || kind === 'clearcut') {
    const N = [T('#0C1A12'), T('#14261A'), T('#1E3626'), T('#2A4632'), T('#3A5A40')];
    fillUnder(g, FW, ridgeY, FH, N[2]);
    for (let x = 0; x < FW; x += 5) {
      const y = ridgeY(x), h = 6 + hash(x * 0.7) * 10;
      g.fillStyle = N[1]; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + 4, y + 2); g.lineTo(x - 4, y + 2); g.closePath(); g.fill();
      box(g, x - 1, y - h * 0.6, 1, h * 0.5, N[3]);
    }
    for (let r = 0; r < 12; r++) for (let x = (r % 2) * 4; x < FW; x += 8) { const y = ridgeY(x) + 6 + r * 8; if (y > FH) break; box(g, x, y, 5, 3, (x + r * 3) % 24 < 8 ? N[3] : N[1]); box(g, x, y, 2, 1, N[4]); }
    // (aspen stands turned gold, patches down the slope)
    const Au = [T('#7A5A14'), T('#A47A1C'), T('#C89A2E')];
    for (let i = 0; i < 9; i++) {
      const ax = hash(i * 7.7) * FW, ay = ridgeY(ax) + 16 + hash(i * 3.1) * 40;
      for (let k = 0; k < 14; k++) { const px = ax + (hash(i * 13 + k) - 0.5) * 50, py = ay + (hash(i * 5 + k * 2) - 0.5) * 16; box(g, px, py, 4, 3, Au[k % 3]); box(g, px, py, 2, 1, Au[2]); }
    }
    if (kind === 'clearcut') {
      // (the power line's cut down the ridge: stumps and slash in banded dirt, the towers marching over it)
      const ca = 380, cb = 620, D = [T('#5A4430'), T('#7A5E40'), T('#9A7C56'), T('#BCA078')];
      g.save(); g.beginPath(); g.moveTo(ca, FH); for (let x = ca; x <= cb; x += 10) g.lineTo(x, ridgeY(x) + 10 + Math.sin(x * 0.07) * 4); g.lineTo(cb + 40, FH); g.closePath(); g.clip();
      bandedGradient(g, ca, ridgeY(ca) - 10, cb - ca + 40, FH - ridgeY(ca) + 10, [D[2], D[1], D[2], D[1], D[0]], 5);
      for (let i = 0; i < 70; i++) { const sx = ca + hash(i * 3.3) * (cb - ca + 40), sy = ridgeY(sx) + 14 + hash(i * 7.1) * 80; box(g, sx, sy, 2, 2, D[3]); box(g, sx, sy + 2, 2, 1, D[0]); }
      g.restore();
      const Ts = T('#5A606A');
      for (let i = 0; i < 5; i++) {
        const tx = 100 + i * 260, ty = ridgeY(tx);
        g.strokeStyle = Ts; g.lineWidth = 1; g.beginPath(); g.moveTo(tx - 5, ty + 4); g.lineTo(tx, ty - 26); g.lineTo(tx + 5, ty + 4); g.moveTo(tx - 7, ty - 20); g.lineTo(tx + 7, ty - 20); g.moveTo(tx - 4, ty - 8); g.lineTo(tx + 4, ty - 14); g.stroke();
        const nx = tx + 260, ny = ridgeY(nx % FW); g.beginPath(); g.moveTo(tx + 7, ty - 20); g.quadraticCurveTo(tx + 130, (ty + ny) / 2 - 8, nx - 7, ny - 20); g.stroke();
      }
    }
    mist(g, FW, FH - 40, 40, skyAt(0.92, tod), 0, 0.3, 5);
    return;
  }
  if (kind === 'range' || kind === 'foothills') {
    // (rolling foothills: grass going gold, dark pines in the draws, rock showing on the shoulders; the last mile's
    // drier, ochre, gold aspen in the folds)
    const dry = kind === 'foothills';
    const G = dry ? [T('#5A4A24'), T('#7A6430'), T('#9A823E'), T('#B49C52'), T('#CCB46A')] : [T('#3E5A2A'), T('#557236'), T('#6E8C42'), T('#8AA652'), T('#A6BC66')];
    const yAt = (x: number) => snap2(FH - 84 + wave(x, FW, 2.6) * 26 + wave(x, FW, 4.4, 2) * 8);
    fillUnder(g, FW, yAt, FH, G[2]);
    for (let x = 0; x < FW; x += 4) { const y = yAt(x), yn = yAt(x + 4); if (yn < y) { box(g, x, y, 4, 8, G[3]); box(g, x, y, 4, 2, G[4]); checker(g, x, y + 8, 4, 2, G[3]); } else if (yn > y) { box(g, x, y + 2, 4, 12, G[1]); checker(g, x, y + 14, 4, 2, G[1], 1); } }
    for (let r = 0; r < 4; r++) for (let x = r * 6; x < FW; x += 26) { const y = yAt(x) + 24 + r * 18; if (y < FH) box(g, x, y, 14, 2, G[1]); }
    // (pines down the draws)
    for (let i = 0; i < 26; i++) {
      const px = hash(i * 5.1) * FW, py = yAt(px) + 10 + hash(i * 2.3) * 40, h = 8 + hash(i) * 8;
      wrapAt(FW, px, xx => { g.fillStyle = T(NEEDLE[1]); g.beginPath(); g.moveTo(xx, py - h); g.lineTo(xx + 4, py); g.lineTo(xx - 4, py); g.closePath(); g.fill(); box(g, xx - 1, py - h * 0.6, 1, h * 0.5, T(NEEDLE[3])); }, 20);
    }
    if (dry) { const Au = [T('#8A6A14'), T('#B48A1C'), T('#D8AA34')]; for (let i = 0; i < 8; i++) { const ax = hash(i * 9.1) * FW, ay = yAt(ax) + 18 + hash(i * 1.7) * 30; for (let k = 0; k < 10; k++) box(g, ax + (hash(i * 7 + k) - 0.5) * 36, ay + (hash(i + k * 3) - 0.5) * 10, 4, 3, Au[k % 3]); } }
    // (rock outcrops on the shoulders)
    const Rk = [T('#4A4A50'), T('#6A6A70'), T('#8E8E94')];
    for (let i = 0; i < 7; i++) { const rx = hash(i * 3.9 + 1) * FW, ry = yAt(rx) + 4; box(g, rx, ry, 10, 6, Rk[1]); box(g, rx, ry, 10, 2, Rk[2]); box(g, rx + 6, ry + 2, 4, 4, Rk[0]); }
    mist(g, FW, FH - 50, 50, skyAt(0.92, tod), 0, 0.3, 5);
    return;
  }
  // (farm country: hills laid out in a patchwork of fields (stripes of wheat, alfalfa, plowed dirt), hedgerows between,
  // a red barn and a silo, a windbreak row)
  const yAt = (x: number) => snap2(FH - 80 + wave(x, FW, 2.2) * 22 + wave(x, FW, 4.9, 2) * 6);
  fillUnder(g, FW, yAt, FH, T('#5E8A3A'));
  const FIELDS = [T('#6E9A3E'), T('#C8B054'), T('#86A848'), T('#7A5A36'), T('#A4B85A'), T('#D8C26A')];
  g.save(); g.beginPath(); g.moveTo(0, FH); for (let x = 0; x <= FW; x += 4) g.lineTo(x, yAt(x)); g.lineTo(FW, FH); g.closePath(); g.clip();
  for (let px = 0, i = 0; px < FW; px += 70 + hash(i * 2.1) * 90, i++) {
    const pw = 70 + hash(i * 2.1) * 90;
    for (let r = 0; r < 8; r++) {
      const col = FIELDS[(i * 3 + r * 5) % FIELDS.length];
      const y = yAt(px) + 4 + r * 12;
      box(g, px, y, pw, 12, col);
      for (let sx = px; sx < px + pw; sx += 4) box(g, sx, y + 4, 2, 1, mix(col, '#000000', 0.12));
      box(g, px, y, pw, 1, T('#3A5A26'));
    }
    box(g, px, yAt(px), 2, FH, T('#2E4A20'));
  }
  g.restore();
  for (let x = 0; x < FW; x += 4) { const y = yAt(x), yn = yAt(x + 4); if (yn < y) box(g, x, y, 4, 2, T('#B8D070')); }
  const B = [T('#6E1810'), T('#922418'), T('#B23424')];
  for (const bx of [180, 760]) { const by = yAt(bx) + 10; box(g, bx, by, 16, 10, B[1]); box(g, bx, by, 6, 10, B[2]); g.fillStyle = T('#3A3A40'); g.beginPath(); g.moveTo(bx - 2, by); g.lineTo(bx + 8, by - 7); g.lineTo(bx + 18, by); g.closePath(); g.fill(); box(g, bx + 20, by - 10, 6, 20, T('#B8B8B4')); box(g, bx + 20, by - 12, 6, 2, T('#8A8A86')); }
  for (let k = 0; k < 18; k++) { const wx = 420 + k * 8; pixelBlob(g, wx, yAt(wx) + 8, 5, 6, T('#2A4A22')); pixelBlob(g, wx - 1, yAt(wx) + 6, 3, 3, T('#3E6230')); }
  mist(g, FW, FH - 50, 50, skyAt(0.92, tod), 0, 0.3, 5);
};

// (the near layer, by the stretch: the treeline, the willows by the creek, the fence along the open range, the farm,
// the power line's tower, the last mile's mix)
const NW = 1000, NH = 128;
const nearPine = (g: Ctx, R: string[], xx: number, h: number, w: number, i: number) => {
  const tiers = Math.max(4, Math.round(h / 10));
  for (let k = 0; k < tiers; k++) {
    const t = (k + 1) / tiers, y0 = NH - h + (k * h * 0.88) / tiers, y1 = y0 + h / tiers + 4, half = 2 + w * 0.5 * t * (0.75 + hash(i + k) * 0.5);
    g.fillStyle = R[0]; g.beginPath(); g.moveTo(xx, y0 - 1); g.lineTo(xx + half + 1, y1 + 1); g.lineTo(xx - half - 1, y1 + 1); g.closePath(); g.fill();
    g.fillStyle = R[1]; g.beginPath(); g.moveTo(xx, y0); g.lineTo(xx + half, y1); g.lineTo(xx - half, y1); g.closePath(); g.fill();
    g.fillStyle = R[2]; g.beginPath(); g.moveTo(xx, y0); g.lineTo(xx - half, y1); g.lineTo(xx - half * 0.3, y1); g.closePath(); g.fill();
    if (half > 5) { checker(g, xx - half * 0.7, y1 - 3, half * 0.6, 2, R[2], k % 2); box(g, xx - half * 0.8, y1 - 2, 2, 1, R[3]); }
  }
};
const paintNear = (g: Ctx, tod: TimeOfDay, b: Biome) => {
  const T = farCol(tod, 0.08), R = [T(NEEDLE[0]), T(NEEDLE[1]), T(NEEDLE[2]), T(NEEDLE[4])];
  const Au = [T('#6A4A10'), T('#9A6E18'), T('#C8962A')], Gr = [T('#2A4A1E'), T('#3E6228'), T('#567E34'), T('#74A042')];
  const ground = b === 'fields' ? T('#5E7E34') : b === 'farm' ? T('#4A7030') : b === 'last' ? T('#6E6430') : R[0];
  if (b === 'fields' || b === 'farm') {
    // (a low bank of grass, the barbed wire fence along it on cedar posts, cottonwoods and windbreak trees)
    const yAt = (x: number) => snap2(NH - 22 + wave(x, NW, 3.1) * 6);
    for (let i = 0; i < (b === 'farm' ? 22 : 9); i++) {
      const tx = b === 'farm' ? 40 + i * 26 + hash(i) * 10 : hash(i * 4.3) * NW, r = 10 + hash(i * 2.7) * 12;
      if (b === 'farm' && i > 14) continue;
      wrapAt(NW, tx, xx => { box(g, xx - 1, yAt(xx) - r, 3, r, T('#4A3A2A')); pixelBlob(g, xx, yAt(xx) - r * 1.4, r, r * 0.9, Gr[1]); pixelBlob(g, xx - 3, yAt(xx) - r * 1.6, r * 0.6, r * 0.5, Gr[2]); pixelBlob(g, xx - 5, yAt(xx) - r * 1.8, r * 0.25, r * 0.2, Gr[3]); }, 40);
    }
    if (b === 'farm') {
      // (the farmhouse and its silo past the windbreak's end)
      const hx = 700, hy = yAt(hx);
      g.fillStyle = T('#3A3A44'); g.beginPath(); g.moveTo(hx - 4, hy - 24); g.lineTo(hx + 22, hy - 42); g.lineTo(hx + 48, hy - 24); g.closePath(); g.fill();
      box(g, hx, hy - 24, 44, 24, T('#E2DED4')); for (let y = hy - 22; y < hy; y += 3) box(g, hx, y, 44, 1, T('#B8B4AA'));
      box(g, hx + 6, hy - 18, 8, 8, T('#3A5A82')); box(g, hx + 30, hy - 18, 8, 8, T('#3A5A82')); box(g, hx + 19, hy - 14, 6, 14, T('#6A2E22'));
      box(g, hx + 60, hy - 56, 14, 56, T('#C8C8C4')); box(g, hx + 60, hy - 56, 4, 56, T('#E8E8E4')); for (let y = hy - 52; y < hy; y += 6) box(g, hx + 60, y, 14, 1, T('#9A9A96'));
      pixelBlob(g, hx + 67, hy - 58, 7, 4, T('#7A7A82'));
      box(g, hx + 90, hy - 30, 40, 30, T('#922418')); box(g, hx + 90, hy - 30, 12, 30, T('#B23424')); g.fillStyle = T('#4A4A50'); g.beginPath(); g.moveTo(hx + 86, hy - 30); g.lineTo(hx + 96, hy - 44); g.lineTo(hx + 124, hy - 44); g.lineTo(hx + 134, hy - 30); g.closePath(); g.fill();
      box(g, hx + 104, hy - 18, 12, 18, T('#E8E4DC')); box(g, hx + 105, hy - 17, 10, 16, T('#6E1810'));
    }
    fillUnder(g, NW, yAt, NH, ground);
    for (let x = 0; x < NW; x += 4) { box(g, x, yAt(x), 4, 2, T(b === 'farm' ? '#7AA048' : '#9AB858')); if (hash(x * 0.3) > 0.6) box(g, x + 1, yAt(x) - 2, 1, 2, T('#B8CC70')); }
    // (the fence: posts, three strands of wire)
    for (let x = 0; x < NW; x += 24) { const y = yAt(x); box(g, x, y - 16, 3, 18, T('#5A4A3A')); box(g, x, y - 16, 1, 18, T('#8A7A66')); }
    for (const dy of [-14, -9, -4]) { g.strokeStyle = T('#7A7A80'); g.lineWidth = 1; g.beginPath(); for (let x = 0; x <= NW; x += 8) g.lineTo(x, yAt(x) + dy + ((x / 8) % 3 === 0 ? 1 : 0)); g.stroke(); }
    mist(g, NW, NH - 30, 30, skyAt(0.94, tod), 0, 0.14, 4);
    return;
  }
  // (a treeline: ragged pines, every one different; aspens gold among them; snags; by the creek willows round and pale;
  // on the power line cut a big lattice tower, its wires sagging over)
  const willow = b === 'creek';
  for (let x = -20, i = 0; x < NW + 20; x += 8 + hash(i * 1.9) * 14, i++) {
    const h = 40 + hash(i * 2.3) * 72, w = h * (0.24 + hash(i) * 0.12);
    const snag = hash(i * 5.7) < (b === 'last' ? 0.1 : 0.05), asp = hash(i * 3.9) < (b === 'last' ? 0.3 : 0.12), wil = willow && hash(i * 8.1) < 0.4;
    wrapAt(NW, x, xx => {
      if (snag) {
        box(g, xx - 2, NH - h * 0.8, 4, h * 0.8, T('#6A645C')); box(g, xx - 2, NH - h * 0.8, 1, h * 0.8, T('#9A948A'));
        for (let k = 0; k < 4; k++) box(g, xx + (k % 2 ? 2 : -7), NH - h * 0.7 + k * 10, 5, 1, T('#6A645C'));
        return;
      }
      if (wil) {
        // (a willow by the water: round, pale green, its fronds hanging)
        box(g, xx - 1, NH - h * 0.4, 3, h * 0.4, T('#5A4A3A'));
        pixelBlob(g, xx, NH - h * 0.5, w * 1.1, h * 0.3, T('#4E7A34')); pixelBlob(g, xx - 3, NH - h * 0.56, w * 0.8, h * 0.2, T('#6E9A46')); pixelBlob(g, xx - 5, NH - h * 0.62, w * 0.35, h * 0.08, T('#9AC060'));
        for (let k = -2; k <= 2; k++) box(g, xx + k * w * 0.35, NH - h * 0.4, 1, h * 0.18, T('#6E9A46'));
        return;
      }
      if (asp) {
        box(g, xx - 1, NH - h * 0.6, 3, h * 0.6, T('#C8C4B8'));
        pixelBlob(g, xx, NH - h * 0.66, w * 0.7, h * 0.22, Au[0]); pixelBlob(g, xx - 2, NH - h * 0.7, w * 0.55, h * 0.16, Au[1]); pixelBlob(g, xx - 4, NH - h * 0.74, w * 0.25, h * 0.08, Au[2]);
        return;
      }
      nearPine(g, R, xx, h, w, i);
    }, 50);
  }
  if (b === 'power') {
    // (the line's big lattice tower on the cut's edge, its arms and insulator strings, the wires sagging away)
    const S = [T('#3A3E44'), T('#5A6068'), T('#8A9098')];
    for (const tx of [240, 740]) {
      const top = 6, foot = NH;
      for (const s of [-1, 1]) { g.strokeStyle = s < 0 ? S[2] : S[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(tx + s * 3, top + 14); g.lineTo(tx + s * 22, foot); g.stroke(); }
      g.strokeStyle = S[1]; g.lineWidth = 1; g.beginPath();
      for (let y = top + 20; y < foot; y += 12) { const k0 = (y - top - 14) / (foot - top - 14), k1 = (y + 12 - top - 14) / (foot - top - 14); g.moveTo(tx - 3 - k0 * 19, y); g.lineTo(tx + 3 + k1 * 19, y + 12); g.moveTo(tx + 3 + k0 * 19, y); g.lineTo(tx - 3 - k1 * 19, y + 12); }
      g.stroke();
      for (const [ay, aw] of [[top + 14, 26], [top + 30, 18]] as const) { box(g, tx - aw, ay, aw * 2, 3, S[1]); box(g, tx - aw, ay, aw * 2, 1, S[2]); box(g, tx - aw + 1, ay + 3, 2, 8, T('#7AA0AC')); box(g, tx + aw - 3, ay + 3, 2, 8, T('#7AA0AC')); }
      g.fillStyle = S[1]; g.beginPath(); g.moveTo(tx - 4, top + 14); g.lineTo(tx, top); g.lineTo(tx + 4, top + 14); g.closePath(); g.fill();
    }
    g.strokeStyle = T('#2A2E34'); g.lineWidth = 1;
    for (const [ay, aw] of [[20 + 11, 25], [36 + 11, 17]] as const) for (const s of [-1, 1]) {
      g.beginPath(); g.moveTo(240 + s * aw, ay); g.quadraticCurveTo(490, ay + 22, 740 + s * aw, ay); g.stroke();
      g.beginPath(); g.moveTo(740 + s * aw, ay); g.quadraticCurveTo(870 + 0, ay + 22, NW + 240 + s * aw, ay); g.stroke();
      g.beginPath(); g.moveTo(240 + s * aw - NW, ay); g.quadraticCurveTo(-10, ay + 22, 240 + s * aw, ay); g.stroke();
    }
  }
  fillUnder(g, NW, () => NH - 6, NH, ground);
  mist(g, NW, NH - 36, 36, skyAt(0.94, tod), 0, 0.16, 4);
};

/** The crossfade between one stretch's backdrop and the next's (its old biome, how far gone). */
const bg = { cur: -1, old: -1, fade: 0 };
const wrap = (c: Ctx, cv: HTMLCanvasElement, bgX: number, speed: number, y: number) => {
  const off = ((-bgX * speed) % cv.width + cv.width) % cv.width;
  const yy = Math.round(y);
  c.drawImage(cv, -Math.round(off), yy); c.drawImage(cv, cv.width - Math.round(off), yy);
  if (cv.width * 2 - off < W) c.drawImage(cv, cv.width * 2 - Math.round(off), yy);
};
const ridgeOf = (b: number) => { const kind = RIDGE_OF[BIOMES[b]]; return layer('ridge' + kind, FW / 2, FH / 2, (g, tod) => paintRidge(g, tod, kind)); };
const nearOf = (b: number) => { const bi = BIOMES[b]; return layer('near' + bi, NW / 2, NH / 2, (g, tod) => paintNear(g, tod, bi)); };

/** The sky, the clouds, the range, the ridge and the near layer, slid sideways by bgX (the bends) and bobbed by the
 *  height. Drawn straight onto the road view (its own light: the hour's, painted in). */
export const drawBackground = (c: Ctx, biome: number, bgX: number, bob: number) => {
  const tod = timeOfDay();
  if (biome !== bg.cur) { bg.old = bg.cur; bg.cur = biome; bg.fade = bg.old < 0 ? 0 : 1; }
  if (bg.fade > 0) bg.fade = Math.max(0, bg.fade - 1 / 45);
  c.drawImage(layer('sky', W, H, g => drawTodSky(g, 0, 0, W * 2, H * 2, SKY, { bands: 16, horizon: HORIZON * 2, sun: [600, 70], moon: [190, 60] })), 0, 0);
  wrap(c, layer('clouds', CW / 2, CH / 2, paintClouds), bgX, 0.08, 6 + bob * 0.1);
  hazeBands(c, 0, HORIZON - 80, W, 56, hourMix('#E2DCC8', '#E8A878', '#2A2E4A', tod), 0, 0.2, 5, 1);
  wrap(c, layer('peaks', RW / 2, RH / 2, paintPeaks), bgX, 0.2, HORIZON - RH / 2 + 2 + bob * 0.2);
  const ridgeY0 = HORIZON - FH / 2 + 4 + bob * 0.4, nearY0 = HORIZON - NH / 2 + 6 + bob * 0.6;
  wrap(c, ridgeOf(biome), bgX, 0.4, ridgeY0);
  if (bg.fade > 0) { c.globalAlpha = bg.fade; wrap(c, ridgeOf(bg.old), bgX, 0.4, ridgeY0); c.globalAlpha = 1; }
  hazeBands(c, 0, HORIZON - 36, W, 32, skyAt(0.94, tod), 0, 0.2, 4, 1);
  wrap(c, nearOf(biome), bgX, 0.65, nearY0);
  if (bg.fade > 0) { c.globalAlpha = bg.fade; wrap(c, nearOf(bg.old), bgX, 0.65, nearY0); c.globalAlpha = 1; }
  // (under the near layer down to wherever the road's horizon is (lower, over a crest): the near ground)
  c.fillStyle = groundOf(biome, tod); c.fillRect(0, Math.round(nearY0 + NH / 2 - 2), W, H);
};
/** The near layer's ground color for the hour, by biome (kept per hour: no strings made per frame). */
const GROUND: Record<Biome, string> = { trail: NEEDLE[0], fields: '#5E7E34', farm: '#4A7030', creek: NEEDLE[0], power: NEEDLE[0], last: '#6E6430' };
let groundKey = '', groundCols: string[] = [];
const groundOf = (b: number, tod: TimeOfDay) => {
  if (groundKey !== tod.key) { groundKey = tod.key; const T = farCol(tod, 0.08); groundCols = BIOMES.map(bi => T(GROUND[bi])); }
  return groundCols[b];
};
