// The lot outside the water park, drawn: the SNES pass. At night (the endgame's hour 10: the same sky as 9, no
// fireworks). No volcanoes. Nothing here to stand on but the ground.
//
// One eye for the whole scene (the camera's middle, on the horizon): everything set back in depth is drawn about it
// (`deep`), so it all slides together as he walks and nothing at one depth is drawn over something nearer.
//
// Depth, back to front (each its own step, in this order):
//   the backdrop (screen space, each far layer painted once for the hour, a step a frame, slid for the parallax):
//     the sky and the moon; the city's skyline far off along the horizon (towers, a hotel's crown, the convention
//     center's dome, a radio mast; windows lit, the fight's pink and orange light low on the sky); Happy Land to the
//     left, the way he came (its lands' landmarks as they are now: parkFar.ts's, the ones the water park's own backdrop
//     shows, its tree line, America USA's flag); the water park's rides to the right (MOUNT EVEREST BUT BETTER's fake
//     snow on its scaffold, the slide towers and their tubes in the slides' own colors, the Black Hole's dark tube, the
//     wave pool's long wall, palms); the ground out past the lot (the frontage road's lamps, palms, the hedge); then
//     the sky fight over all of it (saucers and demons going at each other, pink lasers and fireballs, now and then one
//     going down in smoke).
//   drawBack (world): the lot's asphalt (banded, specked, cracked); the park's outer wall going back from the gate's
//     left tower toward the eye (in stucco steps, its wave coping, a mural band); the lot's chain-link fence at the
//     back (depth 0.8, barbed wire, a NO OVERNIGHT PARKING sign wired on, dimmed); the far row of stalls (their lines
//     going back to the fence, the wheel stops, the oil stains); the light poles on their bases (depth 0.9: their
//     light pools and cones stepped); the truck's scrape and his wreck (on its roof, the puddle under it, the glass);
//     the near row's stall lines running off the bottom of the screen; then the gate: what's seen through it (the
//     plaza's pavers going back, a ticket booth, the turnstiles, a palm, a lamp), the right tower's inner face, the
//     bars (or the bars going over, flat at the last, the dust), the towers and the arch in front of all of it.
//   (the engine: him)
//
// The gate's kit (park1 draws the same gate from the other side, kicked down): GATE below, the colors exactly.

import type { GameState } from '../../../m1/game/core/state';
import { GROUND_Y, CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../../../m1/constants';
import { drawTodSky, farTint, timeOfDay, lampGlow, skyAt } from '../../timeOfDay';
import { drawFighter } from '../../space/orbit/art';
import { truckPicture } from '../../intro/art/upper';
import { text, steppedGlow, pixelBlob, mix, checker, hazeBands, stamp as stampT } from '../../intro/art/kit';
import { farMark, farTreeline, shrunk } from '../../parkFar';
import { paintAmericaLandmark } from '../../hub/far';
import { elbow, knee } from '../../art/limb';
import { stamp } from '../../../m1/game/render/stamp';
import { WATER_PARK_NAME } from '../stages';

type Ctx = CanvasRenderingContext2D;
type P = [number, number];
const INK = '#08070C';
const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const poly = (c: Ctx, pts: P[], col: string) => { c.fillStyle = col; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); c.fill(); };
/** Five steps round a color: deep, shade, body, lit, highlight. */
const ramp5 = (c: string) => [mix(c, INK, 0.55), mix(c, INK, 0.3), c, mix(c, '#FFFFFF', 0.25), mix(c, '#FFFFFF', 0.5)];

/** The lot's layout (world x). */
export const LOT = { x0: 0, wreck: 520, gate: 2000, end: 2100 };
export const HORIZON = GROUND_Y - 150;
/** Where the gate's drawn: its middle (world x), a little short of LOT.gate, so his kick (he stops for it at
 *  LOT.gate - 200) lands on the bars, not on the left tower. Nothing that plays is moved: the hidden wall and the kick's
 *  spot are LOT.gate's. */
export const GX = LOT.gate - 80;

/**
 * The water park's gate, its kit (the lot's side, standing; park1's side, kicked down: the same gate). The towers in
 * blue stucco (TOWER: body [2], lit edge [4], shade [1]), their caps in cyan tiers (CAP), the arch a cresting wave
 * (ARCH: body [2], crest [4], foam [5]), the name on it in NAME with an ink shadow, the bars in steel (BARS), the chain
 * and the padlock (STEEL, BRASS), the CLOSED board (white enamel, a red band, red letters).
 */
export const GATE = {
  TOWER: ['#0B2340', '#14345A', '#1E4A7A', '#2C64A0', '#3A7AB8', '#6AA4D8'],
  CAP: ['#0E5A6E', '#0E8CA8', '#22D3EE', '#67E8F9', '#A5F3FC'],
  ARCH: ['#064A5E', '#06708A', '#0891B2', '#22B8D8', '#67E8F9', '#CFFAFE'],
  NAME: '#FEF08A',
  BARS: ['#2A2E36', '#4A4E58', '#6A6E78', '#8A8E98', '#A4A8B2', '#C8CCD2'],
  BRASS: ['#5C3A06', '#9A6A0E', '#D4A017', '#F2CC4A', '#FFF0A0'],
  CLOSED: { board: '#F8FAFC', band: '#DC2626', words: '#B91C1C' },
  /** The towers: 50 wide, 260 tall, their outer edges 170 out from the gate's middle; the bars 236 across, 150 tall. */
  towerX: [-170, 120] as const, towerW: 50, towerH: 260, barsW: 236, barsH: 150,
} as const;

// ---------------------------------------------------------------------------------------------------------------
// The one eye, and things set back in depth

interface Eye { x: number; y: number }
const eyeOf = (state: GameState): Eye => ({ x: state.camera.x + W / 2, y: state.camera.y + HORIZON });
/** Where a point at (x, y) on the play plane lands set back to depth d (1: the play plane; less, further back). */
const at = (e: Eye, x: number, y: number, d: number): P => [e.x + (x - e.x) * d, e.y + (y - e.y) * d];
/** Draws `fn` in the play plane's own coordinates, set back to depth d about the eye. */
const deep = (c: Ctx, e: Eye, d: number, fn: () => void) => { c.save(); c.translate(e.x * (1 - d), e.y * (1 - d)); c.scale(d, d); fn(); c.restore(); };
/** What's on screen of a plane at depth d (its own x). */
const span = (e: Eye, d: number, pad = 80): [number, number] => [e.x - (W / 2 + pad) / d, e.x + (W / 2 + pad) / d];

/** Depths: the lot's back fence, the light poles. */
const D_FENCE = 0.8, D_POLE = 0.9;

// ---------------------------------------------------------------------------------------------------------------
// Far layers: painted once for the hour at the screen's scale, in steps (a few ms a frame at most: the stage loads at
// once), shown once whole, faded in if they took more than a frame

interface Held { id: string; cv: HTMLCanvasElement; g: Ctx; next: number; born: number; done: number; out: HTMLCanvasElement | null; a: number }
const held = new Map<string, Held>();
let budgetF = -1, budgetT = 0, stepsNow = 0;
const mayPaint = (f: number) => {
  if (f !== budgetF) { budgetF = f; budgetT = performance.now(); stepsNow = 0; }
  return stepsNow === 0 || performance.now() - budgetT < 5;
};
/** Gets the layer under way (painted a step at a time, a few ms a frame across all of them). */
const prep = (c: Ctx, key: string, w: number, y0: number, h: number, steps: ((g: Ctx) => void)[], f: number, x0 = 0) => {
  w -= x0;
  if (typeof document === 'undefined') return;
  const a = Math.abs(c.getTransform().a) || 1, S = Math.max(1, Math.ceil(a - 1e-3));
  const id = `${timeOfDay().key}@${a.toFixed(3)}`;
  let L = held.get(key);
  if (!L || L.id !== id) {
    const cv = document.createElement('canvas'); cv.width = Math.ceil(w * S); cv.height = Math.ceil(h * S);
    const g = cv.getContext('2d')!; g.imageSmoothingEnabled = false; g.setTransform(S, 0, 0, S, -x0 * S, -y0 * S);
    L = { id, cv, g, next: 0, born: f, done: -1, out: null, a };
    held.set(key, L);
  }
  while (L.done === -1 && mayPaint(f)) {
    steps[L.next](L.g); stepsNow++; L.next++;
    if (L.next >= steps.length) {
      L.done = f === L.born ? -1e9 : f;
      // (brought down to the screen's own scale the once, smoothed: put down after with a plain copy, pixel for pixel)
      const out = document.createElement('canvas'); out.width = Math.round(w * a); out.height = Math.round(h * a);
      const og = out.getContext('2d')!; og.imageSmoothingEnabled = true; og.imageSmoothingQuality = 'high';
      og.drawImage(L.cv, 0, 0, out.width, out.height);
      L.out = out; L.cv.width = L.cv.height = 1;
    }
  }
};
/** Puts the layer down, once it's whole (faded in over a few frames if it took more than the one). */
const show = (c: Ctx, key: string, y0: number, f: number, x0 = 0) => {
  const L = held.get(key);
  if (!L || L.done === -1 || !L.out) return;
  const k = Math.min(1, (f - L.done) / 24), m = c.getTransform();
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha *= k;
  c.drawImage(L.out, Math.round(m.e + x0 * m.a), Math.round(m.f + y0 * m.d));
  c.restore();
};
/** A far layer at parallax k (its share of the camera), w wide. */
const slid = (c: Ctx, cam: number, k: number, w: number, draw: () => void) => {
  c.save(); c.translate(-Math.round(Math.max(0, Math.min(w - W, (cam + 60) * k))), 0); draw(); c.restore();
};

// The city's skyline, far off: CITY_W wide, y 200..404 -----------------------------------------------------------

const CITY_W = 960;
const paintCity = (g: Ctx) => {
  const tod = timeOfDay(), hz = skyAt(0.95, tod);
  const T = (col: string) => mix(farTint(col, 1, tod), hz, 0.42);
  const night = tod.lamps, foot = 402;
  // (the fight's light, low on the sky: the demons' fire orange to the left, the saucers' pink to the right)
  hazeBands(g, 0, 300, CITY_W / 2, 100, '#FF8A3C', 0, 0.16, 6);
  hazeBands(g, CITY_W / 2, 290, CITY_W / 2, 110, '#FF5AC8', 0, 0.18, 6);
  checker(g, CITY_W / 2 - 2, 300, 4, 100, 'rgba(255, 120, 140, 0.08)');
  // (towers: lit down the left, shade dithered in down the right, windows lit here and there)
  const tower = (x: number, w: number, top: number, col: string, seed: number) => {
    const Rm = ramp5(col).map(T);
    R(g, x - 1, top - 1, w + 2, foot - top + 1, T('#0A0C1C'));
    R(g, x, top, w, foot - top, Rm[2]);
    R(g, x, top, 2, foot - top, Rm[3]); checker(g, x + 2, top, 2, foot - top, Rm[3]);
    R(g, x + w - Math.max(2, Math.round(w * 0.3)), top, Math.max(2, Math.round(w * 0.3)), foot - top, Rm[1]);
    R(g, x, top, w, 2, Rm[1]);
    for (let y = top + 4; y < foot - 4; y += 4) for (let xx = x + 2; xx < x + w - 2; xx += 3) {
      const s = hash(seed + xx * 0.71 + y * 1.37);
      R(g, xx, y, 1, 2, s < night * 0.38 ? (s < 0.04 ? '#BDF4FF' : '#FFE09A') : Rm[0]);
    }
  };
  const B = ['#5A6478', '#6A6A7C', '#4E5A70', '#727082', '#5C6680'];
  let x = 6;
  for (let i = 0; x < CITY_W - 20; i++) {
    const w = 14 + Math.floor(hash(i * 3.1) * 22), h = 16 + Math.floor(hash(i * 5.7) * 60) + (i % 7 === 3 ? 40 : 0);
    tower(x, w, foot - h, B[i % B.length], i * 13);
    // (now and then: a stepped top, an antenna with its light, a hotel's crown of lights)
    if (i % 5 === 1) { R(g, x + 3, foot - h - 8, w - 6, 8, T(B[i % B.length])); R(g, x + w / 2 - 1, foot - h - 22, 2, 14, T('#8A90A0')); if (night > 0.2) { R(g, x + w / 2 - 2, foot - h - 24, 4, 4, mix(T('#FF4A5A'), '#401020', 0.5)); R(g, x + w / 2 - 1, foot - h - 23, 2, 2, '#FF4A5A'); } }
    if (i % 7 === 3 && night > 0.2) for (let k = 0; k < w - 2; k += 3) R(g, x + 1 + k, foot - h + 1, 2, 1, '#FFD27A');
    x += w + 2 + Math.floor(hash(i * 9.3) * 14);
  }
  // (the convention center's dome, low and wide; a radio mast with its lights)
  {
    const cx = 330, r = 34, Rm = ramp5('#7A8090').map(T);
    for (let k = 0; k < 4; k++) { g.fillStyle = Rm[k]; g.beginPath(); g.ellipse(cx - k * 3, foot - 10 - k * 2, r - k * 7, 16 - k * 3, 0, Math.PI, 0); g.fill(); }
    R(g, cx - r - 4, foot - 12, r * 2 + 8, 12, Rm[1]); for (let k = 0; k < r * 2; k += 6) R(g, cx - r + k, foot - 9, 3, 4, night > 0.3 ? '#FFE09A' : Rm[0]);
  }
  {
    const mx = 610, top = foot - 150, Rm = ramp5('#9098A8').map(T);
    for (let y = top; y < foot; y += 2) { const hw = 1 + ((y - top) / 150) * 8; R(g, mx - hw, y, 1, 2, Rm[1]); R(g, mx + hw, y, 1, 2, Rm[1]); }
    g.strokeStyle = Rm[0]; g.lineWidth = 1; g.beginPath(); for (let y = top + 6; y < foot; y += 10) { const hw = 1 + ((y - top) / 150) * 8; g.moveTo(mx - hw, y); g.lineTo(mx + hw, y + 10); } g.stroke();
    for (const y of [top, top + 50, top + 100]) { R(g, mx - 2, y - 1, 5, 4, mix(T('#FF4A5A'), '#2A0A14', 0.4)); R(g, mx - 1, y, 3, 2, '#FF5A6A'); }
  }
  // (the haze lying along their feet)
  hazeBands(g, 0, foot - 30, CITY_W, 32, hz, 0, 0.6, 5);
  R(g, 0, foot, CITY_W, 4, hz);
};

// Happy Land, to the left (the way he came): HAPPY_W wide, y 180..404 --------------------------------------------

const HAPPY_W = 960;
const HAPPY_FOOT = 402;
/** The landmarks, as the water park's own backdrop has them (parkFar.ts), smaller still from out here: one a step. */
const HAPPY_STEPS: ((g: Ctx) => void)[] = [
  g => farMark(g, 'rockies', 210, HAPPY_FOOT, 52, 0.62),
  g => farMark(g, 'fairyCastle', 90, HAPPY_FOOT, 92, 0.52),
  g => farMark(g, 'needle', 290, HAPPY_FOOT, 128, 0.52),
  g => farMark(g, 'atom', 380, HAPPY_FOOT, 60, 0.52),
  g => farMark(g, 'clockTower', 470, HAPPY_FOOT, 84, 0.52),
  g => farMark(g, 'thrones', 590, HAPPY_FOOT, 52, 0.56),
  g => farMark(g, 'cartoonTower', 160, HAPPY_FOOT, 70, 0.52),
  g => farMark(g, 'showcase', 690, HAPPY_FOOT, 60, 0.56),
  // (America USA's flag, the biggest in the world, at the way in, nearest)
  g => { const tod = timeOfDay(); shrunk(g, 230, 352, o => paintAmericaLandmark(o, 50, 350, 0), 760 - 50 * 0.26, HAPPY_FOOT - 350 * 0.26, 230 * 0.26, 352 * 0.26, skyAt(0.86, tod), 0.5); },
  g => {
    const tod = timeOfDay();
    farTreeline(g, 0, HAPPY_W, HAPPY_FOOT - 14, farTint('#22302A', 1, tod), 7);
    hazeBands(g, 0, HAPPY_FOOT - 22, HAPPY_W, 24, skyAt(0.96, tod), 0, 0.5, 4);
    // (the park's lamps along its fence, a string of them)
    for (let x = 6; x < 800; x += 9) R(g, x, HAPPY_FOOT - 4 - Math.round(hash(x) * 2), 1, 1, hash(x * 3.3) > 0.3 ? '#FFD88A' : '#9AD0FF');
  },
];

const FAR_STEPS: ((g: Ctx) => void)[] = [paintCity, ...HAPPY_STEPS];

// The water park's rides, to the right: RIDES_W wide, y 90..404 ---------------------------------------------------

const RIDES_W = 1150;
const RF = 402;
type Tn = (c: string) => string;
/** A slide's tube on a curve (from p0 by way of cp to p1): inked, its underside dark, lit along its top, the seams
 *  round it every so often, the legs down from it to the ground. */
const farTube = (g: Ctx, T: Tn, p0: P, cp: P, p1: P, col: string, w: number, open = false) => {
  const Rm = ramp5(col).map(T);
  const path = (dy = 0) => { g.beginPath(); g.moveTo(p0[0], p0[1] + dy); g.quadraticCurveTo(cp[0], cp[1] + dy, p1[0], p1[1] + dy); };
  const pt = (t: number): P => [(1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * cp[0] + t * t * p1[0], (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * cp[1] + t * t * p1[1]];
  // (its legs first: steel, from under it down to the ground)
  for (let t = 0.06; t < 1; t += 0.12) {
    const [x, y] = pt(t);
    if (RF - y > 10) { R(g, x - 1, y + w / 2, 3, RF - y - w / 2, T('#0C1020')); R(g, x, y + w / 2, 1, RF - y - w / 2, T('#5A6478')); }
  }
  g.lineCap = 'round'; g.lineJoin = 'round';
  path(); g.strokeStyle = T('#0A0A14'); g.lineWidth = w + 3; g.stroke();
  g.strokeStyle = Rm[1]; g.lineWidth = w + 1; g.stroke();
  path(-1); g.strokeStyle = Rm[2]; g.lineWidth = w - 2; g.stroke();
  if (open) { path(-w * 0.18); g.strokeStyle = Rm[0]; g.lineWidth = w * 0.34; g.stroke(); path(-w * 0.32); g.strokeStyle = Rm[4]; g.lineWidth = 1; g.stroke(); }
  else { path(-w * 0.26); g.strokeStyle = Rm[3]; g.lineWidth = Math.max(1, w * 0.3); g.stroke(); path(-w * 0.34); g.strokeStyle = Rm[4]; g.lineWidth = 1; g.setLineDash([3, 4]); g.stroke(); g.setLineDash([]); }
  g.lineCap = 'butt'; g.lineJoin = 'miter';
  // (the seams round it)
  for (let t = 0.04; t < 1; t += 0.05) { const [x, y] = pt(t); R(g, x, y - w / 2 + 1, 1, w - 1, Rm[0]); }
};
/** A slide tower: lattice steel (two chords each side, the zigzag), its stair switchbacks up the side, the deck on top
 *  under its striped canopy. */
const farTowerOf = (g: Ctx, T: Tn, x: number, w: number, top: number, canopy: string) => {
  const S = ramp5('#5A6478').map(T);
  for (const cx of [x, x + w - 2]) { R(g, cx - 1, top, 4, RF - top, T('#0A0C18')); R(g, cx, top, 2, RF - top, S[3]); }
  g.strokeStyle = S[1]; g.lineWidth = 1; g.beginPath();
  for (let y = top + 4; y < RF; y += 12) { g.moveTo(x + 1, y); g.lineTo(x + w - 1, y + 6); g.lineTo(x + 1, y + 12); }
  g.stroke();
  for (let y = top + 16; y < RF; y += 24) R(g, x, y, w, 2, S[2]);
  // (the stairs: flights zigzagging up its far side, landings at each turn)
  g.strokeStyle = S[0]; g.lineWidth = 2; g.beginPath();
  for (let y = RF, k = 0; y > top + 14; y -= 18, k++) { g.moveTo(x + w + (k % 2 ? 10 : 0), y); g.lineTo(x + w + (k % 2 ? 0 : 10), y - 18); }
  g.stroke();
  // (the deck, the canopy over it in stripes, its peak)
  R(g, x - 6, top - 2, w + 12, 5, T('#0A0C18')); R(g, x - 5, top - 1, w + 10, 2, S[3]);
  const cw = w + 16, cx0 = x - 8, ch = 12;
  poly(g, [[cx0 - 1, top - 6], [cx0 + cw / 2, top - 6 - ch - 2], [cx0 + cw + 1, top - 6]], T('#0A0C18'));
  for (let k = 0; k < 6; k++) {
    const a = cx0 + (k / 6) * cw, b = cx0 + ((k + 1) / 6) * cw, m = cx0 + cw / 2;
    poly(g, [[a, top - 7], [m, top - 7 - ch], [b, top - 7]], T(k % 2 ? '#F8FAFC' : canopy));
  }
  R(g, cx0, top - 7, cw, 2, T(mix(canopy, INK, 0.4)));
  R(g, cx0 + cw / 2 - 1, top - 7 - ch - 6, 2, 6, S[1]);
  R(g, cx0 + cw / 2, top - 7 - ch - 10, 4, 3, T('#EF4444'));
};
const RIDE_STEPS: ((g: Ctx) => void)[] = [
  // (the wave pool's wall, long and low, its wave machine's house at the end; palms behind it)
  g => {
    const tod = timeOfDay(), T: Tn = c => farTint(c, 0.8, tod), X = 470;
    for (let i = 0; i < 9; i++) {
      const px = X + 10 + i * 58 + hash(i) * 20, ph = 34 + hash(i + 4) * 22, lean = (hash(i + 9) - 0.5) * 10;
      g.strokeStyle = T('#141018'); g.lineWidth = 3; g.beginPath(); g.moveTo(px, RF - 30); g.quadraticCurveTo(px + lean * 0.4, RF - 30 - ph * 0.6, px + lean, RF - 30 - ph); g.stroke();
      for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * 0.62; g.strokeStyle = T(k % 2 ? '#123824' : '#1C4A30'); g.lineWidth = 3; g.beginPath(); g.moveTo(px + lean, RF - 30 - ph); g.quadraticCurveTo(px + lean + Math.cos(a) * 12, RF - 34 - ph + Math.sin(a) * 10, px + lean + Math.cos(a) * 20, RF - 26 - ph + Math.sin(a) * 8); g.stroke(); }
    }
    const Wv = ramp5('#2A5A88').map(T);
    R(g, X + 20, RF - 36, 480, 36, T('#0A0C18'));
    R(g, X + 22, RF - 34, 476, 32, Wv[2]);
    for (let k = 0; k < 476; k += 40) { R(g, X + 22 + k, RF - 34, 2, 32, Wv[1]); }
    R(g, X + 22, RF - 34, 476, 3, Wv[3]); R(g, X + 22, RF - 31, 476, 2, Wv[1]);
    // (its mural: a wave rolling along it)
    for (let k = 0; k < 476; k += 2) { const yy = RF - 20 + Math.round(Math.sin(k * 0.06) * 4); R(g, X + 22 + k, yy, 2, 2, Wv[4]); R(g, X + 22 + k, yy + 2, 2, RF - 4 - yy - 2, Wv[1]); }
    checker(g, X + 22, RF - 12, 476, 8, Wv[0]);
    const Hs = ramp5('#3A4A66').map(T);
    R(g, X + 480, RF - 70, 60, 70, T('#0A0C18')); R(g, X + 482, RF - 68, 56, 68, Hs[2]); R(g, X + 482, RF - 68, 8, 68, Hs[3]); R(g, X + 528, RF - 68, 10, 68, Hs[1]);
    for (let k = 0; k < 6; k++) R(g, X + 494, RF - 60 + k * 6, 30, 2, Hs[0]);
    if (tod.lamps > 0.3) R(g, X + 506, RF - 76, 6, 4, '#FFE8A0');
  },
  // (MOUNT EVEREST BUT BETTER, the tallest thing out here: a fake mountain in fiberglass rock on its scaffold, fake snow
  // painted down its top, the spiral of its queue round it, its slide coming down; a red light on the summit)
  g => {
    const tod = timeOfDay(), T: Tn = c => farTint(c, 0.75, tod), cx = 890, top = 110, bw = 150;
    const S = ramp5('#5A6478').map(T), Rk = ramp5('#6A6478').map(T), Sn = ramp5('#DCE4F0').map(T);
    // (its scaffold, under and round the foot)
    for (let x = cx - bw / 2; x <= cx + bw / 2; x += 10) { R(g, x, RF - 120, 2, 120, S[1]); }
    g.strokeStyle = S[0]; g.lineWidth = 1; g.beginPath(); for (let y = RF - 120; y < RF; y += 12) for (let x = cx - bw / 2; x < cx + bw / 2; x += 10) { g.moveTo(x, y); g.lineTo(x + 10, y + 12); } g.stroke();
    for (let y = RF - 120; y < RF; y += 24) R(g, cx - bw / 2, y, bw, 2, S[2]);
    // (the mountain: its silhouette in crags, lit down its left face)
    const ridge: P[] = [[cx - bw / 2 + 4, RF - 110], [cx - 50, RF - 170], [cx - 40, RF - 160], [cx - 22, top + 40], [cx - 10, top + 20], [cx, top], [cx + 8, top + 14], [cx + 20, top + 30], [cx + 30, top + 60], [cx + 44, RF - 180], [cx + 54, RF - 150], [cx + bw / 2 - 4, RF - 110]];
    poly(g, [...ridge.map(([x, y]) => [x - 1, y - 1] as P), [cx + bw / 2, RF - 104], [cx - bw / 2, RF - 104]], T('#0A0C18'));
    poly(g, [...ridge, [cx + bw / 2 - 4, RF - 104], [cx - bw / 2 + 4, RF - 104]], Rk[2]);
    poly(g, [[cx, top], [cx - 22, top + 40], [cx - 40, RF - 160], [cx - 50, RF - 170], [cx - bw / 2 + 4, RF - 110], [cx - 30, RF - 108], [cx - 6, top + 50]], Rk[3]);
    poly(g, [[cx, top], [cx + 20, top + 30], [cx + 30, top + 60], [cx + 44, RF - 180], [cx + 54, RF - 150], [cx + bw / 2 - 4, RF - 110], [cx + 30, RF - 108], [cx + 10, top + 60]], Rk[1]);
    // (its crags: facets lit on the left, shaded on the right, the fiberglass panels' seams)
    for (let k = 0; k < 9; k++) {
      const fx = cx - 50 + hash(k * 3.3) * 100, fy = top + 70 + hash(k * 5.1) * 150, fw = 10 + hash(k * 7.7) * 14;
      const lft = fx < cx;
      poly(g, [[fx, fy], [fx + fw * 0.5, fy - fw * 0.9], [fx + fw, fy + 2]], lft ? Rk[4] : Rk[0]);
      poly(g, [[fx + fw * 0.5, fy - fw * 0.9], [fx + fw, fy + 2], [fx + fw * 0.6, fy + 2]], lft ? Rk[2] : Rk[1]);
    }
    g.strokeStyle = Rk[1]; g.lineWidth = 1; g.beginPath(); for (let y = top + 60; y < RF - 110; y += 22) { g.moveTo(cx - (y - top) * 0.32, y); g.lineTo(cx + (y - top) * 0.3, y + 4); } g.stroke();
    // (the fake snow, its drips down the gullies)
    poly(g, [[cx, top], [cx - 10, top + 20], [cx - 22, top + 40], [cx - 30, top + 70], [cx - 18, top + 62], [cx - 10, top + 80], [cx - 2, top + 58], [cx + 8, top + 74], [cx + 14, top + 52], [cx + 26, top + 66], [cx + 30, top + 60], [cx + 20, top + 30], [cx + 8, top + 14]], Sn[2]);
    poly(g, [[cx, top], [cx - 10, top + 20], [cx - 22, top + 40], [cx - 26, top + 58], [cx - 12, top + 50], [cx - 4, top + 30]], Sn[4]);
    checker(g, cx - 28, top + 58, 56, 8, Sn[1]);
    // (the queue's spiral round it, a band going up in stripes, its lamps)
    for (let k = 0; k < 5; k++) {
      const y0 = RF - 112 - k * 34, hw = bw / 2 - 8 - k * 12;
      g.strokeStyle = T('#0A0C18'); g.lineWidth = 4; g.beginPath(); g.moveTo(cx - hw, y0); g.quadraticCurveTo(cx, y0 + 6, cx + hw, y0 - 17); g.stroke();
      g.strokeStyle = T('#B4652A'); g.lineWidth = 2; g.stroke();
      g.strokeStyle = T('#E0A060'); g.lineWidth = 0.8; g.beginPath(); g.moveTo(cx - hw, y0 - 1); g.quadraticCurveTo(cx, y0 + 5, cx + hw, y0 - 18); g.stroke();
      if (tod.lamps > 0.3) for (let j = 0; j < 4; j++) R(g, cx - hw + j * (hw / 2), y0 - (j / 4) * 17 - 3, 1, 1, '#FFE8A0');
    }
    // (its slide, down off the top's far side to the splash pool, in the pale blue of the descent's chute)
    farTube(g, T, [cx + 16, top + 26], [cx + 100, top + 60], [cx + 120, RF - 6], '#7DD3FC', 7, true);
    R(g, cx - 2, top - 14, 2, 14, S[1]); poly(g, [[cx, top - 14], [cx + 12, top - 11], [cx, top - 8]], T('#DC2626'));
    if (tod.lamps > 0.15) { R(g, cx - 3, top - 18, 6, 4, mix(T('#FF4A5A'), '#2A0A14', 0.4)); R(g, cx - 2, top - 17, 4, 2, '#FF5A6A'); }
  },
  // (the slide towers and their tubes: the Twister's pink, the Kamikaze's cyan straight down, LIL' SQUIRT's yellow,
  // the Drop's green, the Wipeout's orange, the Black Hole's dark tube and the Abyss's blood red, curling down)
  g => {
    const tod = timeOfDay(), T: Tn = c => farTint(c, 0.8, tod);
    // (the Twister: its tower, the pink tube curling down off it twice)
    farTowerOf(g, T, 500, 22, RF - 200, '#EC4899');
    farTube(g, T, [522, RF - 190], [610, RF - 200], [600, RF - 110], '#EC4899', 11);
    farTube(g, T, [600, RF - 110], [590, RF - 30], [670, RF - 8], '#EC4899', 11);
    // (the Kamikaze: the tallest tower this side, the open cyan flume straight down; the Black Hole's dark tube off its
    // back, curling down the other way)
    farTowerOf(g, T, 650, 26, RF - 240, '#22D3EE');
    farTube(g, T, [650, RF - 200], [560, RF - 170], [560, RF - 8], '#1E1B4B', 13);
    farTube(g, T, [676, RF - 232], [700, RF - 120], [770, RF - 8], '#22D3EE', 10, true);
    // (the Drop, short and green)
    farTowerOf(g, T, 760, 18, RF - 130, '#A3E635');
    farTube(g, T, [778, RF - 122], [800, RF - 60], [790, RF - 8], '#A3E635', 9, true);
    // (the Abyss: its tower, the blood-red tube; the Wipeout's orange flume off it)
    farTowerOf(g, T, 1090, 24, RF - 270, '#450A0A');
    farTube(g, T, [1090, RF - 260], [1000, RF - 240], [1030, RF - 130], '#450A0A', 13);
    farTube(g, T, [1030, RF - 130], [1050, RF - 40], [1130, RF - 8], '#450A0A', 13);
    farTube(g, T, [1114, RF - 210], [1150, RF - 120], [1120, RF - 60], '#F97316', 9, true);
    // (LIL' SQUIRT, the kids' one, yellow, low down in front of it)
    farTowerOf(g, T, 990, 16, RF - 90, '#FACC15');
    farTube(g, T, [1006, RF - 84], [1040, RF - 50], [1030, RF - 8], '#FACC15', 8, true);
    // (the work lights left on, here and there)
    for (const [x, y] of [[511, RF - 214], [663, RF - 254], [1102, RF - 284], [769, RF - 144]] as P[]) { R(g, x - 2, y - 2, 5, 4, mix(T('#FFE8A0'), '#202030', 0.4)); R(g, x - 1, y - 1, 3, 2, '#FFE8A0'); }
  },
  // (the trapdoor drop, at the near end (the owner, 2026-11-06: "throw in other stuff too as flavor that we may have
  // missed"): its narrow tower, the clear launch capsule on top (a rider's shape in it, waiting on the floor to go),
  // the tube straight down out of it, the loop, the run out)
  g => {
    const tod = timeOfDay(), T: Tn = c => farTint(c, 0.8, tod), x = 452, top = RF - 236;
    farTowerOf(g, T, x, 14, top, '#A855F7');
    const cx = x + 7, Cp = ramp5('#A5F3FC').map(T);
    R(g, cx - 7, top - 44, 14, 32, T('#0A0C18')); R(g, cx - 6, top - 43, 12, 30, Cp[0]); R(g, cx - 6, top - 43, 3, 30, Cp[3]); R(g, cx + 3, top - 43, 2, 30, Cp[1]);
    R(g, cx - 8, top - 46, 16, 4, T('#0A0C18')); R(g, cx - 6, top - 45, 12, 2, Cp[2]);
    R(g, cx - 1, top - 38, 3, 3, T('#1A1410')); R(g, cx - 1, top - 35, 2, 9, T('#1A1410'));
    farTube(g, T, [cx, top - 12], [cx, RF - 150], [cx + 2, RF - 96], '#A855F7', 8);
    // (the loop: round, the tube's own steps)
    const lx = cx + 18, ly = RF - 82, r = 18;
    for (const [w, col] of [[11, T('#0A0A14')], [9, T(ramp5('#A855F7')[1])], [6, T('#A855F7')], [1, T(ramp5('#A855F7')[4])]] as const) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.arc(lx, ly, r - (w === 1 ? 2 : 0), Math.PI, Math.PI * 2.9); g.stroke(); }
    R(g, lx - 1, ly + r, 3, RF - ly - r, T('#0C1020'));
    farTube(g, T, [lx + r * Math.cos(Math.PI * 2.9), ly + r * Math.sin(Math.PI * 2.9)], [lx + 24, RF - 40], [lx + 40, RF - 8], '#A855F7', 8, true);
    if (tod.lamps > 0.3) { R(g, cx - 2, top - 50, 4, 3, mix(T('#FF4A5A'), '#2A0A14', 0.3)); }
  },
  // (the haze along their feet, the park's hedge in front)
  g => {
    const tod = timeOfDay();
    farTreeline(g, 440, RIDES_W, RF - 12, farTint('#1E3428', 0.9, tod), 3);
    hazeBands(g, 440, RF - 30, RIDES_W - 440, 32, skyAt(0.96, tod), 0, 0.45, 4);
  },
];

// The ground out past the lot: SCRUB_W wide, y 398..470 -----------------------------------------------------------

const SCRUB_W = 1600, SF0 = 398, SF1 = 472;
const SCRUB_STEPS: ((g: Ctx) => void)[] = [g => {
  const tod = timeOfDay(), T = (c: string) => farTint(c, 0.5, tod), lit = tod.lamps > 0.3;
  // (the ground, banded darker going back; the frontage road along it, its lamps)
  const G = ['#16141E', '#1C1A24', '#22202A', '#282630'].map(T);
  for (let k = 0; k < 4; k++) R(g, 0, SF0 + k * 18, SCRUB_W, 18, G[k]);
  for (let k = 1; k < 4; k++) checker(g, 0, SF0 + k * 18 - 2, SCRUB_W, 2, G[k]);
  R(g, 0, SF0 + 12, SCRUB_W, 8, T('#2E2C34')); for (let x = 0; x < SCRUB_W; x += 24) R(g, x, SF0 + 15, 10, 1, T('#8A8466'));
  for (let x = 30; x < SCRUB_W; x += 140) {
    R(g, x, SF0 - 22, 2, 34, T('#3A3E48')); R(g, x - 5, SF0 - 23, 12, 3, T('#20222A'));
    if (lit) { hazeBands(g, x - 16, SF0 - 20, 34, 30, '#FFD88A', 0.02, 0.1, 3); R(g, x - 4, SF0 - 20, 10, 1, '#FFE8A8'); R(g, x - 12, SF0 + 10, 26, 2, mix(T('#2E2C34'), '#FFD88A', 0.2)); }
  }
  // (palms along the road, in clumps; the hedge at the lot's back)
  for (let i = 0; i < 22; i++) {
    const px = 40 + i * 72 + hash(i * 3.3) * 40, ph = 40 + hash(i * 1.7) * 26, lean = (hash(i * 7.1) - 0.5) * 14, f = SF0 + 30;
    g.strokeStyle = T('#120E14'); g.lineWidth = 4; g.beginPath(); g.moveTo(px, f); g.quadraticCurveTo(px + lean * 0.3, f - ph * 0.6, px + lean, f - ph); g.stroke();
    g.strokeStyle = T('#2A2026'); g.lineWidth = 2; g.stroke();
    for (let k = 0; k < 7; k++) {
      const a = -Math.PI / 2 + (k - 3) * 0.55;
      g.strokeStyle = T('#0E2018'); g.lineWidth = 4; g.beginPath(); g.moveTo(px + lean, f - ph); g.quadraticCurveTo(px + lean + Math.cos(a) * 14, f - ph - 6 + Math.sin(a) * 12, px + lean + Math.cos(a) * 26, f - ph + 6 + Math.sin(a) * 8); g.stroke();
      g.strokeStyle = T(k % 2 ? '#1A3A28' : '#24482F'); g.lineWidth = 2; g.stroke();
    }
  }
  for (let x = 0; x < SCRUB_W; x += 8) { const hh = 6 + hash(x * 0.29) * 6; pixelBlob(g, x + 4, SF1 - hh * 0.5 - 2, 6, hh * 0.6, T('#14241A')); pixelBlob(g, x + 2, SF1 - hh * 0.7 - 2, 3, hh * 0.3, T('#1E3424')); }
  R(g, 0, SF1 - 4, SCRUB_W, 6, T('#101C14'));
}];

// ---------------------------------------------------------------------------------------------------------------
// The sky fight

/** The sky fight: who's up there (screen space, by the frame): saucers and demons on loops round each other. */
interface Flyer { alien: boolean; seed: number }
const FLYERS: Flyer[] = Array.from({ length: 9 }, (_, i) => ({ alien: i % 2 === 0, seed: i * 7.3 + 1 }));
/** Where one is at frame f (screen x, y), its facing, whether it's down (a smoking fall, then back on again). */
export const flyerAt = (fl: Flyer, f: number) => {
  const s = fl.seed, sp = 0.004 + hash(s) * 0.004, ph = f * sp + s;
  const cycle = 900 + Math.floor(hash(s + 2) * 600), local = (f + Math.floor(hash(s + 3) * cycle)) % cycle;
  const falling = local > cycle - 120 ? (local - (cycle - 120)) / 120 : 0;
  const x = W / 2 + Math.sin(ph) * (W * 0.42) + Math.sin(ph * 2.3 + s) * 60;
  const y = 70 + hash(s + 1) * 150 + Math.sin(ph * 1.7) * 30 + falling * falling * 300;
  const vx = Math.cos(ph) * (W * 0.42) * sp;
  return { x, y, face: vx >= 0 ? 1 : -1, falling };
};
export const FLYER_LIST = FLYERS;

// A demon, flying (one of Satan's): side on, facing right, about 44 tall; bat wings (bones inked, the membrane in steps
// between them), horns, a yellow eye, the grin, a spaded tail, a pitchfork in the near hand. The arms and the legs
// two-bone (limb.ts). Two looks (`v`: a red one with straight horns; a darker crimson one, ram-horned, pot-bellied),
// two wing beats each, stamped.
const SKINS = [
  ['#3A0606', '#6A0E0A', '#981C12', '#C8321E', '#E8603C', '#FF9A6A'],
  ['#2A0418', '#4E0820', '#7A142C', '#A0263A', '#C84A50', '#EE8070'],
];
const HORN = ['#3A3020', '#7A6A4A', '#B8A880', '#E8DCC0', '#FFF8E4'];
const IRONS = ['#1A1C22', '#3A3E48', '#6A707C', '#A0A8B4', '#DCE2EA'];
const seg = (c: Ctx, x0: number, y0: number, x1: number, y1: number, col: string, w: number, hi?: string) => {
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = w + 2; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  if (hi) { c.strokeStyle = hi; c.lineWidth = Math.max(1, w * 0.35); c.beginPath(); c.moveTo(x0 - 0.5, y0 - w * 0.25); c.lineTo(x1 - 0.5, y1 - w * 0.25); c.stroke(); }
  c.lineCap = 'butt';
};
/** A round form in stepped shells (ink rim, shade, body, lit up its upper left, a highlight). */
const shell = (g: Ctx, x: number, y: number, rx: number, ry: number, rot: number, S: string[]) => {
  const e = (dx: number, dy: number, k: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(x + dx, y + dy, Math.max(0.5, rx * k), Math.max(0.5, ry * k), rot, 0, Math.PI * 2); g.fill(); };
  e(0, 0, 1 + 1.2 / Math.max(rx, ry), INK);
  e(0, 0, 1, S[1]);
  g.save(); g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); g.clip();
  e(-rx * 0.12, -ry * 0.12, 0.86, S[2]);
  checker(g, x - rx, y + ry * 0.4, rx * 2, 2, S[1]);
  e(-rx * 0.3, -ry * 0.32, 0.5, S[3]);
  e(-rx * 0.42, -ry * 0.46, 0.18, S[4]);
  g.restore();
};
export const paintDemon = (g: Ctx, up: boolean, v = 0) => {
  const SK = SKINS[v % 2], fat = v % 2 === 1;
  const MEM = [mix(SK[0], '#100008', 0.3), mix(SK[1], '#200010', 0.3), mix(SK[2], '#300818', 0.35)];
  // (a wing: the arm bone out from the shoulder to the wrist, three finger bones fanned off it, the membrane between
  // in steps (darker toward the trailing edge), scalloped between the tips)
  const wing = (dx: number, near: boolean) => {
    const sh: P = [dx, -24], wr: P = [dx - 12, up ? -40 : -24];
    const tips: P[] = up ? [[dx - 26, -48], [dx - 28, -36], [dx - 22, -24]] : [[dx - 28, -20], [dx - 24, -10], [dx - 16, -6]];
    const root: P = [dx - 2, -14];
    const M = near ? MEM.map(c => mix(c, SK[2], 0.25)) : MEM;
    poly(g, [sh, wr, tips[0], [(tips[0][0] + tips[1][0]) / 2 + 2, (tips[0][1] + tips[1][1]) / 2 + 2], tips[1], [(tips[1][0] + tips[2][0]) / 2 + 2, (tips[1][1] + tips[2][1]) / 2 + 2], tips[2], [(tips[2][0] + root[0]) / 2 + 1, (tips[2][1] + root[1]) / 2 + 2], root], INK);
    poly(g, [sh, wr, tips[0], [(tips[0][0] + tips[1][0]) / 2 + 1, (tips[0][1] + tips[1][1]) / 2 + 1], tips[1], wr], M[2]);
    poly(g, [wr, tips[1], [(tips[1][0] + tips[2][0]) / 2 + 1, (tips[1][1] + tips[2][1]) / 2 + 1], tips[2], wr], M[1]);
    poly(g, [sh, wr, tips[2], [(tips[2][0] + root[0]) / 2, (tips[2][1] + root[1]) / 2 + 1], root], M[0]);
    // (the bones over the membrane, lit along their tops)
    seg(g, sh[0], sh[1], wr[0], wr[1], near ? SK[2] : SK[1], 2.2, near ? SK[4] : undefined);
    for (const t of tips) seg(g, wr[0], wr[1], t[0], t[1], near ? SK[2] : SK[1], 1.2);
    R(g, tips[0][0] - 1, tips[0][1] - 2, 2, 2, HORN[3]);
  };
  wing(5, false);
  // (the tail: a curve behind, the spade at its end)
  g.lineCap = 'round';
  g.strokeStyle = INK; g.lineWidth = 3.5; g.beginPath(); g.moveTo(-4, -12); g.quadraticCurveTo(-20, -2, -24, -14); g.stroke();
  g.strokeStyle = SK[2]; g.lineWidth = 2; g.stroke();
  g.strokeStyle = SK[3]; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-6, -13); g.quadraticCurveTo(-19, -4, -23, -14); g.stroke();
  g.lineCap = 'butt';
  poly(g, [[-29, -18], [-21, -16], [-24, -12], [-27, -9]], INK); poly(g, [[-27, -17], [-22, -15.5], [-24.5, -12.5], [-26, -11]], SK[3]);
  // (the legs: thigh back, the knee forward (limb.ts), the shin trailing, a hoof)
  for (const s of [-1, 1]) {
    const hip: P = [-2, -12], foot: P = [-12 + s * 2, 2];
    const [kx, ky] = knee(hip[0], hip[1], foot[0], foot[1], 8, 9, 1);
    const col = s < 0 ? SK[1] : SK[2];
    seg(g, hip[0], hip[1], kx, ky, col, 4.5, s > 0 ? SK[3] : undefined); seg(g, kx, ky, foot[0], foot[1], col, 3.2, s > 0 ? SK[3] : undefined);
    R(g, foot[0] - 3, foot[1] - 1, 5, 3, INK); R(g, foot[0] - 2, foot[1] - 1, 3, 2, '#2A1A14');
  }
  // (the far arm, back)
  const sh: P = [2, -26];
  const far: P = [-6, -16], [fex, fey] = elbow(sh[0], sh[1], far[0], far[1], 6, 6, 1);
  seg(g, sh[0], sh[1], fex, fey, SK[1], 3); seg(g, fex, fey, far[0], far[1], SK[1], 2.5);
  R(g, far[0] - 1.5, far[1] - 1.5, 3, 3, SK[1]);
  // (the body: the chest leant into the flight, the belly (a pot on the crimson one), the abs)
  shell(g, 0, -20, fat ? 9 : 7.5, fat ? 11 : 10, 0.4, SK);
  if (fat) shell(g, 2, -14, 6, 5, 0, SK);
  R(g, 1, -22, 1, 1, SK[1]); R(g, 0, -19, 1, 1, SK[1]); R(g, 3, -21, 1, 1, SK[1]);
  // (the head: the skull in shells, a heavy brow, the pointed ear, horns in ivory steps, a yellow eye, the grin)
  shell(g, 5, -32, 6.5, 6, 0, SK);
  R(g, 4, -36, 8, 2, SK[1]); R(g, 4, -37, 6, 1, SK[3]);
  poly(g, [[0, -33], [-5, -38], [1, -36]], INK); poly(g, [[0.5, -33.5], [-3.5, -37], [1, -35.5]], SK[3]);
  if (v % 2 === 0) {
    for (const hx of [2, 7]) { poly(g, [[hx - 2.5, -36], [hx - 3.5, -45], [hx + 2.5, -36]], INK); poly(g, [[hx - 1.5, -36.5], [hx - 2.8, -43.5], [hx + 1.2, -36.5]], HORN[2]); R(g, hx - 2, -41, 1, 3, HORN[4]); R(g, hx, -38, 1, 2, HORN[1]); }
  } else {
    for (const hx of [2, 7]) {
      g.strokeStyle = INK; g.lineWidth = 3.6; g.beginPath(); g.moveTo(hx, -37); g.quadraticCurveTo(hx - 8, -44, hx - 7, -34); g.stroke();
      g.strokeStyle = HORN[2]; g.lineWidth = 2; g.stroke();
      g.strokeStyle = HORN[4]; g.lineWidth = 0.8; g.beginPath(); g.moveTo(hx - 0.5, -38); g.quadraticCurveTo(hx - 7, -44, hx - 7, -36); g.stroke();
    }
  }
  R(g, 7, -34, 3, 2, '#FDE047'); R(g, 9, -34, 1, 2, '#DC2626'); R(g, 7, -35, 3, 1, INK);
  R(g, 6, -29, 6, 2, INK); R(g, 7, -29, 1, 1, '#FFFFFF'); R(g, 9, -29, 1, 1, '#FFFFFF'); R(g, 11, -30, 1, 1, '#FFFFFF');
  R(g, 10, -31, 2, 1, SK[1]);
  // (the near arm forward round the pitchfork's shaft; elbows from limb.ts)
  const hand: P = [12, -18], [ex, ey] = elbow(sh[0] + 1, sh[1], hand[0], hand[1], 6, 6, 1);
  g.lineCap = 'round';
  g.strokeStyle = INK; g.lineWidth = 3.4; g.beginPath(); g.moveTo(-2, -8); g.lineTo(22, -26); g.stroke();
  g.strokeStyle = '#6B4A2A'; g.lineWidth = 1.8; g.stroke();
  g.strokeStyle = '#A07848'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(-2, -8.8); g.lineTo(22, -26.8); g.stroke();
  g.lineCap = 'butt';
  R(g, 19, -26, 4, 3, INK); R(g, 20, -25, 2, 1, IRONS[3]);
  for (const k of [-3, 0, 3]) { g.strokeStyle = INK; g.lineWidth = 2.6; g.beginPath(); g.moveTo(21 + k * 0.6, -26 + k * 0.8); g.lineTo(28 + k * 0.6, -32 + k * 0.8); g.stroke(); g.strokeStyle = IRONS[3]; g.lineWidth = 1; g.stroke(); R(g, 27.5 + k * 0.6, -32 + k * 0.8, 1, 1, IRONS[4]); }
  seg(g, sh[0] + 1, sh[1], ex, ey, SK[2], 3.2, SK[3]); seg(g, ex, ey, hand[0], hand[1], SK[3], 2.6);
  R(g, hand[0] - 2, hand[1] - 2, 4, 4, INK); R(g, hand[0] - 1.5, hand[1] - 1.5, 3, 3, SK[3]); R(g, hand[0] - 1, hand[1] - 1.5, 1, 1, SK[4]);
  wing(0, true);
};
const drawDemon = (c: Ctx, f: number, seed: number) => {
  const up = ((f >> 3) + Math.floor(seed)) % 2 === 0, v = hash(seed * 3.7) > 0.5 ? 1 : 0;
  stamp(c, `lot-demon2-${v}-${+up}`, -34, -52, 68, 58, g => paintDemon(g, up, v));
};

/** The far off, and the fight over it (screen space). */
export const drawLotBackdrop = (c: Ctx, state: GameState) => {
  const f = state.frame, cam = state.camera.x;
  drawTodSky(c, 0, 0, W, H, ['#060A1C', '#0B1230', '#121B42', '#1C2752', '#283460', '#38406C'], { moon: [640, 90], horizon: HORIZON, t: f, scroll: cam });
  // (painted nearest first: the ground's there before the far off)
  // (the city and Happy Land share a layer (one copy a frame, not two); the rides' starts where they do)
  prep(c, 'lot-scrub', SCRUB_W, SF0, SF1 - SF0 + 2, SCRUB_STEPS, f);
  prep(c, 'lot-rides', RIDES_W, 90, 316, RIDE_STEPS, f, 440);
  prep(c, 'lot-far', CITY_W, 250, 156, FAR_STEPS, f);
  slid(c, cam, 0.07, CITY_W, () => show(c, 'lot-far', 250, f));
  slid(c, cam, 0.27, RIDES_W, () => show(c, 'lot-rides', 90, f, 440));
  // (the ground out past the lot, between the scrub and the asphalt: the last of the sky's color won't do)
  R(c, 0, SF1 - 4, W, 516 - SF1 + 4, '#101C14');
  slid(c, cam, 0.5, SCRUB_W, () => show(c, 'lot-scrub', SF0, f));
  // The fight: shots between them first (pink bolts from the saucers, fireballs from the demons), then them
  for (let i = 0; i < FLYERS.length; i++) {
    const a = flyerAt(FLYERS[i], f), b = flyerAt(FLYERS[(i + 3) % FLYERS.length], f);
    if (a.falling || FLYERS[i].alien === FLYERS[(i + 3) % FLYERS.length].alien) continue;
    const ph = (f + i * 37) % 90;
    if (ph < 12) {
      const k = ph / 12, x = a.x + (b.x - a.x) * k, y = a.y + (b.y - a.y) * k;
      if (FLYERS[i].alien) {
        const tx = x + (b.x - a.x) * 0.12, ty = y + (b.y - a.y) * 0.12;
        c.lineCap = 'round';
        c.strokeStyle = 'rgba(255, 58, 184, 0.45)'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, y); c.lineTo(tx, ty); c.stroke();
        c.strokeStyle = '#FF7AD9'; c.lineWidth = 2.5; c.stroke();
        c.strokeStyle = '#FFE4F6'; c.lineWidth = 1; c.stroke();
        c.lineCap = 'butt';
      } else {
        const dx = (b.x - a.x) * 0.04, dy = (b.y - a.y) * 0.04;
        steppedGlow(c, x, y, 7, '#F97316', 0.5, 0.1, 3);
        pixelBlob(c, x - dx * 2, y - dy * 2, 3, 3, 'rgba(220, 60, 20, 0.7)'); pixelBlob(c, x - dx * 4, y - dy * 4, 2, 2, 'rgba(160, 40, 20, 0.5)');
        R(c, x - 3, y - 3, 6, 6, '#F97316'); R(c, x - 2, y - 2, 4, 4, '#FDE047'); R(c, x - 1, y - 2, 2, 2, '#FFFBEA');
      }
      if (ph === 11) { steppedGlow(c, b.x, b.y, 16, FLYERS[i].alien ? '#FF7AD9' : '#F97316', 0.55, 0.05, 4); R(c, b.x - 3, b.y - 3, 6, 6, '#FFF4E0'); }
    }
  }
  for (const fl of FLYERS) {
    const a = flyerAt(fl, f);
    if (a.y > HORIZON + 10) continue;
    c.save(); c.translate(Math.round(a.x), Math.round(a.y));
    if (a.face < 0) c.scale(-1, 1);
    if (fl.alien) { c.scale(0.55, 0.55); drawFighter(c, f, fl.seed > 30, false, false, true); } else { c.scale(0.85, 0.85); drawDemon(c, f, fl.seed); }
    c.restore();
    if (a.falling) {
      if ((f >> 2) % 2) R(c, a.x - 2 + a.face * 6, a.y - 4, 4, 4, '#FDBA74');
      for (let k = 0; k < 4; k++) pixelBlob(c, a.x - a.face * k * 6, a.y - k * 8, 4 + k, 3 + k, `rgba(${60 - k * 6}, ${60 - k * 6}, ${66 - k * 6}, ${(0.6 - k * 0.12).toFixed(2)})`);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The lot itself (world space)

/** (the last one stood back from the gate: at its depth, 1850 was in behind the park's wall) */
const LIGHTS = [260, 900, 1400, 1640];
/** The lights for the scene's lighting: at the heads of the poles (set back to D_POLE, where the eye puts them now). */
export const lotLights = (state: GameState) => {
  const e = eyeOf(state);
  return LIGHTS.map(x => { const [lx, ly] = at(e, x, GROUND_Y - 156, D_POLE); return { x: lx, y: ly, r: 170, a: 0.3, color: '#FDE68A' }; });
};

const ASPH = ['#121218', '#18181F', '#1E1F26', '#25262E', '#2C2D36', '#363844'];
/** The asphalt, a 400-wide stretch of it (flat: the bands run across, so the eye doesn't matter): banded lighter
 *  coming forward, specked, a crack or two, the odd patch. From the fence's foot (516) down past the screen. */
const paintAsphalt = (g: Ctx, x0: number) => {
  const y0 = 514, y1 = H + 40;
  const bands: [number, string][] = [[514, ASPH[0]], [522, ASPH[1]], [532, ASPH[2]], [546, ASPH[3]], [562, ASPH[4]], [582, ASPH[3]]];
  for (let i = 0; i < bands.length; i++) { const [y, col] = bands[i], ye = i + 1 < bands.length ? bands[i + 1][0] : y1; R(g, x0, y, 400, ye - y, col); if (i) checker(g, x0, y - 2, 400, 2, col, 0); }
  for (let k = 0; k < 260; k++) {
    const s = x0 * 0.013 + k * 1.37, x = x0 + Math.floor(hash(s) * 200) * 2, y = y0 + 4 + Math.floor(hash(s + 1) * ((y1 - y0) / 2)) * 2;
    R(g, x, y, y > 540 ? 2 : 1, 1, hash(s + 2) > 0.5 ? ASPH[5] : ASPH[0]);
  }
  // (cracks: a jag across, a branch)
  for (let k = 0; k < 2; k++) {
    let x = x0 + 40 + hash(x0 + k * 7) * 300, y = 560 + hash(x0 + k * 3) * 30;
    g.strokeStyle = '#0C0C10'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y);
    for (let j = 0; j < 8; j++) { x += 6 + hash(x0 + k + j) * 8; y += (hash(x0 * 2 + j + k) - 0.5) * 6; g.lineTo(x, y); }
    g.stroke();
  }
  // (a patch: a square of newer, blacker tar, its seam)
  if (hash(x0 * 0.7) > 0.4) { const px = x0 + 60 + hash(x0 * 1.3) * 240; R(g, px, 566, 54, 12, ASPH[3]); checker(g, px, 566, 54, 12, ASPH[2]); R(g, px, 566, 54, 1, ASPH[5]); R(g, px, 577, 54, 1, ASPH[1]); }
};

/** The chain-link fence along the lot's back, a 240 stretch of it at its own depth (its foot at GROUND_Y in its own
 *  coordinates): posts and their caps, the top rail, the mesh (diamonds), three strands of barbed wire on the arms,
 *  dimmed: it's background. */
const FENCE_H = 72;
const paintFence = (g: Ctx, x0: number) => {
  const B = GROUND_Y, top = B - FENCE_H, St = ['#20242C', '#2E333C', '#3E444E', '#525A66', '#6A7482'];
  // (the mesh)
  g.save(); g.beginPath(); g.rect(x0, top, 240, FENCE_H); g.clip();
  g.strokeStyle = 'rgba(120, 130, 150, 0.32)'; g.lineWidth = 1; g.beginPath();
  for (let x = x0 - FENCE_H; x < x0 + 240; x += 6) { g.moveTo(x, top + 2); g.lineTo(x + FENCE_H - 4, B - 2); g.moveTo(x + FENCE_H - 4, top + 2); g.lineTo(x, B - 2); }
  g.stroke();
  g.restore();
  // (the rails: top and bottom, lit along their tops)
  R(g, x0, top - 1, 240, 4, St[0]); R(g, x0, top - 1, 240, 1, St[3]);
  R(g, x0, B - 4, 240, 3, St[0]); R(g, x0, B - 4, 240, 1, St[2]);
  // (the posts: lit down the left, a cap; the barbed wire's arms leaning out, the strands, their barbs)
  for (let x = x0; x < x0 + 240; x += 80) {
    R(g, x - 2, top - 4, 5, FENCE_H + 4, St[0]); R(g, x - 1, top - 4, 1, FENCE_H + 4, St[3]); R(g, x + 1, top - 4, 1, FENCE_H + 4, St[1]);
    R(g, x - 3, top - 6, 7, 3, St[2]); R(g, x - 3, top - 6, 7, 1, St[4]);
    g.strokeStyle = St[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(x, top - 5); g.lineTo(x - 8, top - 16); g.stroke();
  }
  for (let k = 0; k < 3; k++) {
    const y = top - 7 - k * 4, dx = -3 - k * 3;
    g.strokeStyle = 'rgba(140, 150, 166, 0.5)'; g.lineWidth = 1; g.beginPath();
    for (let x = x0; x <= x0 + 240; x += 20) { const sag = Math.sin(((x - x0) % 80) / 80 * Math.PI) * 2; if (x === x0) g.moveTo(x + dx, y + sag); else g.lineTo(x + dx, y + sag); }
    g.stroke();
    for (let x = x0 + 6 + k * 4; x < x0 + 240; x += 12) R(g, x + dx, y - 1 + Math.sin(((x - x0) % 80) / 80 * Math.PI) * 2, 2, 2, 'rgba(160, 170, 186, 0.45)');
  }
  // (weeds up through the foot)
  for (let k = 0; k < 6; k++) { const wx = x0 + hash(x0 + k * 5) * 236; for (let j = 0; j < 3; j++) R(g, wx + j * 2 - 2, B - 6 - hash(wx + j) * 8, 1, 6 + hash(wx + j) * 8, j % 2 ? '#1A3020' : '#22402A'); }
};
/** The sign wired to the fence (at the fence's depth, held up on it, clear of the posts). */
const SIGN_X = 1160;
const paintFenceSign = (g: Ctx) => {
  const x = SIGN_X, y = GROUND_Y - 54;
  R(g, x - 40, y - 1, 80, 26, INK); R(g, x - 39, y, 78, 24, '#D8D4C8'); R(g, x - 39, y, 78, 1, '#F2EEE4'); R(g, x - 39, y + 23, 78, 1, '#9A968A');
  R(g, x - 36, y + 3, 72, 8, '#B91C1C');
  text(g, 'NO OVERNIGHT', x, y + 10, '#F8FAFC', 6, 'center', null);
  text(g, 'PARKING', x, y + 20, '#1E2A5A', 6, 'center', null);
  for (const wx of [x - 34, x + 33]) { R(g, wx, y + 2, 1, 1, '#8A8E98'); R(g, wx, y + 21, 1, 1, '#8A8E98'); }
  // (rust run down from the wire holes)
  R(g, x - 34, y + 3, 1, 4, '#7A4A2A'); R(g, x + 33, y + 22, 1, 3, '#7A4A2A');
};

/** A light pole (at D_POLE: its own coordinates): the concrete base, the steel pole in steps, the arm, two shoebox
 *  heads (their lenses: lit after dark, live), the conduit plate. */
const paintPole = (g: Ctx, x: number) => {
  const B = GROUND_Y, St = ['#1E2228', '#2E333C', '#444A56', '#5E6672', '#7E8896', '#A8B2C0'], C = ['#4A4844', '#625E58', '#7E7A72', '#9C978E', '#BCB6AA'];
  // (the base: a round concrete footing, lit down the left, its top a step)
  R(g, x - 12, B - 18, 24, 18, INK); R(g, x - 11, B - 17, 22, 17, C[2]); R(g, x - 11, B - 17, 4, 17, C[3]); R(g, x + 5, B - 17, 6, 17, C[1]); R(g, x - 11, B - 17, 22, 2, C[4]);
  checker(g, x - 11, B - 6, 22, 4, C[1]);
  // (the pole: tapered, lit down its left, a seam halfway up)
  for (let y = B - 168; y < B - 17; y += 2) {
    const hw = 2 + Math.round((y - (B - 168)) / 151 * 2);
    R(g, x - hw - 1, y, hw * 2 + 2, 2, INK); R(g, x - hw, y, hw * 2, 2, St[2]); R(g, x - hw, y, 1, 2, St[4]); R(g, x + hw - 1, y, 1, 2, St[1]);
  }
  R(g, x - 4, B - 92, 8, 2, St[1]); R(g, x - 3, B - 40, 6, 8, St[1]); R(g, x - 2, B - 38, 1, 1, St[3]);
  // (the arm, the heads)
  R(g, x - 26, B - 170, 52, 4, INK); R(g, x - 25, B - 169, 50, 2, St[3]);
  for (const s of [-1, 1]) {
    const hx = x + s * 24;
    R(g, hx - 12, B - 172, 24, 9, INK); R(g, hx - 11, B - 171, 22, 7, St[2]); R(g, hx - 11, B - 171, 22, 2, St[4]); R(g, hx - 11, B - 166, 22, 1, St[1]);
  }
};
const drawPoleLight = (c: Ctx, e: Eye, x: number) => {
  const k = lampGlow();
  if (k < 0.05) return;
  // (the light down off each head, in steps: cone and pool; then the lenses)
  for (const s of [-1, 1]) {
    const [hx, hy] = at(e, x + s * 24, GROUND_Y - 163, D_POLE), [fx, fy] = at(e, x + s * 34, GROUND_Y, 1.02);
    for (let j = 0; j < 2; j++) {
      const sp = 1 - j * 0.42;
      c.fillStyle = `rgba(253, 230, 138, ${(0.05 * k).toFixed(3)})`;
      c.beginPath(); c.moveTo(hx - 10 * D_POLE, hy); c.lineTo(hx + 10 * D_POLE, hy); c.lineTo(fx + 70 * sp, fy); c.lineTo(fx - 70 * sp, fy); c.closePath(); c.fill();
    }
  }
  const [px, py] = at(e, x, GROUND_Y, 0.98);
  for (let j = 0; j < 2; j++) { c.fillStyle = `rgba(253, 236, 170, ${(0.07 * k).toFixed(3)})`; c.beginPath(); c.ellipse(px, py + 4, 140 - j * 60, 13 - j * 5, 0, 0, Math.PI * 2); c.fill(); }
  for (const s of [-1, 1]) {
    const [hx, hy] = at(e, x + s * 24, GROUND_Y - 163, D_POLE);
    R(c, hx - 9 * D_POLE, hy - 1, 18 * D_POLE, 3, '#FDE68A'); R(c, hx - 6 * D_POLE, hy - 1, 12 * D_POLE, 1, '#FFFBEA');
  }
};

/** Where the stalls' lines are (world x on the play plane): the far row's and the near row's. */
const STALL = 110;
/** A line on the ground from depth d0 to d1 at world x (w px wide on the play plane): a quad toward the eye. */
const groundLine = (c: Ctx, e: Eye, x: number, d0: number, d1: number, w: number, col: string) => {
  const [a0, b0] = at(e, x - w / 2, GROUND_Y, d0), [a1] = at(e, x + w / 2, GROUND_Y, d0);
  const [c0, b1] = at(e, x - w / 2, GROUND_Y, d1), [c1] = at(e, x + w / 2, GROUND_Y, d1);
  poly(c, [[a0, b0], [a1, b0], [c1, b1], [c0, b1]], col);
};

/** The water park's outer wall, going back from the gate's left tower toward the eye (its face to the lot): stucco in
 *  steps going back (darker the further), the wave coping along its top, a mural band of waves, its foot's shadow.
 *  From the play plane (d 1) back to WALL_D. */
const WALL_H = 150, WALL_D = 0.5;
const drawParkWall = (c: Ctx, e: Eye) => {
  const ex = GX + GATE.towerX[0] - 2;
  if (e.x >= ex - 2 || at(e, ex, GROUND_Y, WALL_D)[0] > e.x + W / 2 + 20) return;
  const B = GROUND_Y, T = GATE.TOWER, n = 10;
  for (let i = 0; i < n; i++) {
    const d0 = 1 - (1 - WALL_D) * (i / n), d1 = 1 - (1 - WALL_D) * ((i + 1) / n);
    const [x0, t0] = at(e, ex, B - WALL_H, d0), [, f0] = at(e, ex, B, d0), [x1, t1] = at(e, ex, B - WALL_H, d1), [, f1] = at(e, ex, B, d1);
    const body = mix(T[1], INK, i * 0.04);
    poly(c, [[x0, t0], [x1, t1], [x1, f1], [x0, f0]], body);
    // (the mural band: a wave, crest and foam)
    const m = (y: number, d: number): number => at(e, ex, y, d)[1];
    poly(c, [[x0, m(B - 86, d0)], [x1, m(B - 86, d1)], [x1, m(B - 50, d1)], [x0, m(B - 50, d0)]], mix(GATE.ARCH[1], INK, 0.2 + i * 0.04));
    poly(c, [[x0, m(B - 86, d0)], [x1, m(B - 86, d1)], [x1, m(B - 80, d1)], [x0, m(B - 80, d0)]], mix(GATE.ARCH[4], INK, 0.35 + i * 0.04));
    if (i % 2 === 0) poly(c, [[x0, m(B - 80, d0)], [x1, m(B - 76, d1)], [x0, m(B - 72, d0)]], mix(GATE.ARCH[5], INK, 0.45 + i * 0.03));
    // (the coping: a cyan cap, scalloped like a wave's lip; not lit: nothing to stand on up there)
    poly(c, [[x0, t0 - 6 * d0], [x1, t1 - 6 * d1], [x1, t1], [x0, t0]], mix(GATE.CAP[1], INK, 0.3 + i * 0.04));
    poly(c, [[x0, t0], [(x0 + x1) / 2, at(e, ex, B - WALL_H + 6, (d0 + d1) / 2)[1]], [x1, t1]], mix(GATE.CAP[0], INK, 0.3 + i * 0.04));
    // (its pilasters, every step)
    poly(c, [[x0, t0], [x0 + (x1 - x0) * 0.12, t0 + (t1 - t0) * 0.12], [x0 + (x1 - x0) * 0.12, f0 + (f1 - f0) * 0.12], [x0, f0]], mix(T[2], INK, 0.2 + i * 0.04));
  }
  const [xb, tb] = at(e, ex, B - WALL_H - 6, WALL_D), [, fb] = at(e, ex, B, WALL_D);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(ex, B - WALL_H - 6); c.lineTo(xb, tb); c.lineTo(xb, fb); c.stroke();
  // (its foot: the shadow along it on the asphalt)
  poly(c, [[ex, B], [xb, fb], [xb - 10 * WALL_D, fb], [ex - 14, B]], 'rgba(4, 4, 10, 0.45)');
};

/** The gate's bars (stamped; up, or going over): spear-tipped steel bars, the rails, a wave scroll along the middle
 *  rail, the hinges, the chain round the middle, the padlock, the CLOSED board hung off it. */
const paintBars = (g: Ctx) => {
  const X = GX, B = GROUND_Y, S = GATE.BARS, Br = GATE.BRASS, L = X - GATE.barsW / 2;
  for (let x = L + 2; x <= X + GATE.barsW / 2 - 4; x += 14) {
    R(g, x, B - 150, 5, 150, INK); R(g, x + 1, B - 150, 3, 150, S[3]); R(g, x + 1, B - 150, 1, 150, S[5]); R(g, x + 3, B - 150, 1, 150, S[1]);
    // (its spear tip)
    poly(g, [[x - 1, B - 150], [x + 2.5, B - 160], [x + 6, B - 150]], INK); poly(g, [[x + 0.5, B - 151], [x + 2.5, B - 157], [x + 4.5, B - 151]], GATE.CAP[2]); R(g, x + 2, B - 156, 1, 3, GATE.CAP[4]);
  }
  for (const y of [B - 150, B - 70, B - 12]) { R(g, L, y - 3, GATE.barsW, 7, INK); R(g, L + 1, y - 2, GATE.barsW - 2, 5, S[3]); R(g, L + 1, y - 2, GATE.barsW - 2, 1, S[5]); R(g, L + 1, y + 2, GATE.barsW - 2, 1, S[1]); }
  // (the wave scroll between the top rail and the middle one)
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath();
  for (let x = L + 6; x < X + GATE.barsW / 2 - 20; x += 28) { g.moveTo(x, B - 118); g.quadraticCurveTo(x + 7, B - 134, x + 14, B - 118); g.quadraticCurveTo(x + 21, B - 102, x + 28, B - 118); }
  g.stroke(); g.strokeStyle = S[4]; g.lineWidth = 1.2; g.stroke();
  // (the hinges on the tower sides; the line down the middle where the two leaves meet)
  for (const hx of [L - 2, X + GATE.barsW / 2 - 4]) for (const hy of [B - 140, B - 30]) { R(g, hx, hy, 6, 10, INK); R(g, hx + 1, hy + 1, 4, 8, S[2]); R(g, hx + 1, hy + 1, 4, 2, S[4]); }
  R(g, X - 1, B - 150, 2, 150, INK);
  // (the chain round the middle: its links in steel, alternately face on and edge on)
  for (let k = 0; k < 10; k++) {
    const cx = X - 36 + k * 8, cy = B - 96 + Math.sin(k * 0.9) * 2;
    if (k % 2) { R(g, cx - 4, cy - 1, 8, 3, INK); R(g, cx - 3, cy, 6, 1, S[4]); }
    else { g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, cy, 5, 3, 0, 0, Math.PI * 2); g.stroke(); g.strokeStyle = S[4]; g.lineWidth = 1.2; g.stroke(); R(g, cx - 2, cy - 3, 2, 1, S[5]); }
  }
  // (the padlock: brass in steps, its shackle, the keyhole)
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(X, B - 92, 5, Math.PI, 0); g.stroke(); g.strokeStyle = S[4]; g.lineWidth = 2; g.stroke();
  R(g, X - 8, B - 92, 16, 16, INK); R(g, X - 7, B - 91, 14, 14, Br[2]); R(g, X - 7, B - 91, 3, 14, Br[3]); R(g, X + 4, B - 91, 3, 14, Br[1]); R(g, X - 7, B - 91, 14, 2, Br[4]);
  checker(g, X - 4, B - 82, 8, 4, Br[1]);
  R(g, X - 1, B - 87, 3, 3, INK); R(g, X, B - 84, 1, 3, INK);
  // (the CLOSED board, hung off the chain on two wires: white enamel, a red band, red letters; a chip or two)
  g.strokeStyle = S[2]; g.lineWidth = 1; g.beginPath(); g.moveTo(X - 26, B - 95); g.lineTo(X - 34, B - 78); g.moveTo(X + 26, B - 95); g.lineTo(X + 34, B - 78); g.stroke();
  R(g, X - 46, B - 78, 92, 30, INK); R(g, X - 45, B - 77, 90, 28, GATE.CLOSED.board); R(g, X - 45, B - 77, 90, 5, GATE.CLOSED.band); R(g, X - 45, B - 72, 90, 1, '#7F1D1D');
  R(g, X - 45, B - 50, 90, 1, '#B8BCC4'); R(g, X - 45, B - 77, 1, 28, '#FFFFFF');
  R(g, X + 30, B - 56, 4, 3, '#3A3E48'); R(g, X - 40, B - 64, 3, 2, '#3A3E48');
  text(g, 'CLOSED', X, B - 55, GATE.CLOSED.words, 10, 'center', '#F2B8B8');
};

/** The towers and the arch (stamped: drawn over the bars): blue stucco towers, lit down their left edges, banded joints,
 *  a porthole each, a lifebuoy; their cyan caps in tiers; the arch over the way in a cresting wave (body, crest, foam
 *  curling off its peak), the name on a plaque at its top. */
const paintTowers = (g: Ctx) => {
  const X = GX, B = GROUND_Y, T = GATE.TOWER, C = GATE.CAP, A = GATE.ARCH, tw = GATE.towerW, th = GATE.towerH;
  for (const ox of GATE.towerX) {
    const tx = X + ox;
    R(g, tx - 2, B - th, tw + 4, th, INK);
    R(g, tx, B - th + 2, tw, th - 2, T[2]);
    R(g, tx, B - th + 2, 6, th - 2, T[4]); R(g, tx + 6, B - th + 2, 2, th - 2, T[3]); checker(g, tx + 8, B - th + 2, 2, th - 2, T[3]);
    R(g, tx + tw - 10, B - th + 2, 10, th - 2, T[1]); checker(g, tx + tw - 12, B - th + 2, 2, th - 2, T[1]); R(g, tx + tw - 2, B - th + 2, 2, th - 2, T[0]);
    for (let k = 0; k < 8; k++) { R(g, tx, B - 236 + k * 30, tw, 2, T[0]); R(g, tx, B - 234 + k * 30, tw, 1, T[3]); }
    // (the foot: a darker plinth, grimed)
    R(g, tx - 4, B - 26, tw + 8, 26, INK); R(g, tx - 3, B - 25, tw + 6, 25, T[1]); R(g, tx - 3, B - 25, tw + 6, 2, T[3]); checker(g, tx - 3, B - 10, tw + 6, 8, T[0]);
    // (a porthole high up: brass rim, the glass dark with a glint; a lifebuoy below it, red and white)
    const px = tx + tw / 2, py = B - 200;
    g.fillStyle = INK; g.beginPath(); g.arc(px, py, 10, 0, Math.PI * 2); g.fill();
    g.fillStyle = GATE.BRASS[2]; g.beginPath(); g.arc(px, py, 9, 0, Math.PI * 2); g.fill();
    g.fillStyle = GATE.BRASS[1]; g.beginPath(); g.arc(px + 1, py + 1, 7, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#0B1828'; g.beginPath(); g.arc(px, py, 6, 0, Math.PI * 2); g.fill();
    R(g, px - 3, py - 4, 2, 2, '#9AC8F0'); R(g, px - 1, py - 4, 1, 1, '#FFFFFF');
    const by = B - 130;
    for (let a = 0; a < 8; a++) {
      const a0 = (a / 8) * Math.PI * 2, a1 = ((a + 1) / 8) * Math.PI * 2;
      g.fillStyle = a % 2 ? '#F8FAFC' : '#DC2626'; g.beginPath(); g.arc(px, by, 12, a0, a1); g.arc(px, by, 6, a1, a0, true); g.closePath(); g.fill();
    }
    g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.arc(px, by, 12.5, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(px, by, 5.5, 0, Math.PI * 2); g.stroke();
    R(g, px - 8, by - 9, 3, 2, '#FFFFFF');
    // (the cap: three tiers, cyan, lit along each lip, a wave-tipped finial)
    const tiers: [number, number, number][] = [[-8, B - th - 14, tw + 16], [-4, B - th - 24, tw + 8], [0, B - th - 32, tw]];
    for (const [dx, y, w] of tiers) { R(g, tx + dx - 1, y - 1, w + 2, 12, INK); R(g, tx + dx, y, w, 10, C[2]); R(g, tx + dx, y, w, 2, C[4]); R(g, tx + dx, y + 7, w, 3, C[1]); R(g, tx + dx, y + 2, 3, 5, C[3]); }
    poly(g, [[px - 7, B - th - 32], [px - 2, B - th - 50], [px + 8, B - th - 44], [px + 2, B - th - 42], [px + 6, B - th - 32]], INK);
    poly(g, [[px - 5, B - th - 33], [px - 1.5, B - th - 47], [px + 5, B - th - 44], [px + 1, B - th - 41], [px + 4, B - th - 33]], C[3]);
    R(g, px - 2, B - th - 45, 2, 3, C[4]);
  }
  // (the arch: a wave cresting over the way in)
  const L0 = X + GATE.towerX[0] + 20, R0 = X + GATE.towerX[1] + 30;
  const arc = (dy: number) => { g.beginPath(); g.moveTo(L0, B - 236 + dy); g.quadraticCurveTo(X, B - 330 + dy, R0, B - 236 + dy); };
  g.lineCap = 'round';
  arc(0); g.strokeStyle = INK; g.lineWidth = 36; g.stroke();
  arc(1); g.strokeStyle = A[1]; g.lineWidth = 30; g.stroke();
  arc(-2); g.strokeStyle = A[2]; g.lineWidth = 22; g.stroke();
  arc(-8); g.strokeStyle = A[3]; g.lineWidth = 8; g.stroke();
  arc(-12); g.strokeStyle = A[4]; g.lineWidth = 4; g.stroke();
  arc(-14); g.strokeStyle = A[5]; g.lineWidth = 1.5; g.setLineDash([6, 5]); g.stroke(); g.setLineDash([]);
  arc(10); g.strokeStyle = A[0]; g.lineWidth = 6; g.stroke();
  g.lineCap = 'butt';
  // (foam curling off the crest, a lip of it over the left tower's cap)
  for (let k = 0; k < 7; k++) { const fx = L0 + 6 + k * 7, fy = B - 262 - k * 4 - Math.sin(k) * 2; g.fillStyle = INK; g.beginPath(); g.arc(fx, fy, 4.5, 0, Math.PI * 2); g.fill(); g.fillStyle = k % 2 ? A[5] : '#FFFFFF'; g.beginPath(); g.arc(fx, fy, 3.5, 0, Math.PI * 2); g.fill(); }
  // (the name: on a plaque at the arch's top, held up on it)
  R(g, X - 90, B - 292, 180, 26, INK); R(g, X - 89, B - 291, 178, 24, '#0B2A4A'); R(g, X - 89, B - 291, 178, 2, A[3]); R(g, X - 89, B - 269, 178, 2, '#061A30');
  for (const sx of [X - 85, X + 83]) R(g, sx, B - 287, 2, 2, GATE.BRASS[3]);
  text(g, WATER_PARK_NAME, X, B - 272, GATE.NAME, 14, 'center', '#3A2A06');
};

/** What's seen through the gateway: the plaza going back (pavers), a ticket booth set back, the turnstiles, a palm, a
 *  lamp; clipped to the way in, under the arch. */
const drawThrough = (c: Ctx, e: Eye, f: number) => {
  const X = GX, B = GROUND_Y, x0 = X + GATE.towerX[0] + GATE.towerW, x1 = X + GATE.towerX[1];
  c.save(); c.beginPath(); c.rect(x0, B - 250, x1 - x0, 252); c.clip();
  // (the plaza: pavers, banded darker going back, their joints going back toward the eye)
  const P5 = ['#1E1A24', '#2A2430', '#38303E', '#463C4C', '#56495A'];
  // (far in: the plaza going off to its far side, its hedges, umbrellas folded, lamps along the way)
  const [, yf] = at(e, X, B, 0.2);
  R(c, x0, HORIZON - 2, x1 - x0, yf - HORIZON + 2, '#16121C');
  R(c, x0, HORIZON - 2, x1 - x0, 6, '#101C16'); for (let xx = x0; xx < x1; xx += 6) pixelBlob(c, xx + 3, HORIZON - 2, 4, 3, '#14261C');
  checker(c, x0, HORIZON + 10, x1 - x0, 4, '#1A1620');
  for (let k = 0; k < 4; k++) { const [ux, uy] = at(e, X - 90 + k * 64, B, 0.3 + (k % 2) * 0.06); R(c, ux - 1, uy - 16, 2, 16, '#2A2430'); poly(c, [[ux - 2, uy - 22], [ux + 2, uy - 22], [ux + 1, uy - 12], [ux - 1, uy - 12]], k % 2 ? '#7A2A4A' : '#2A5A7A'); }
  for (let k = 0; k < 5; k++) { const [lx2, ly2] = at(e, X - 120 + k * 60, B, 0.42); R(c, lx2, ly2 - 26, 1, 26, '#2A2E38'); if (lampGlow() > 0.1) { R(c, lx2 - 2, ly2 - 28, 5, 3, '#8A7A50'); R(c, lx2 - 1, ly2 - 27, 3, 1, '#FFE8A8'); } }
  for (let k = 0; k < 8; k++) { const d0 = 0.2 + k * 0.1, [, y0] = at(e, X, B, d0), [, y1] = at(e, X, B, d0 + 0.1); R(c, x0, y0, x1 - x0, y1 - y0 + 1, P5[Math.max(0, k - 3)]); if (k) checker(c, x0, y0 - 1, x1 - x0, 2, P5[Math.max(0, k - 3)]); }
  for (let xx = X - 800; xx <= X + 800; xx += 40) groundLine(c, e, xx, 0.2, 1, 1.5, 'rgba(10, 8, 14, 0.6)');
  for (let k = 1; k < 8; k++) { const [, y] = at(e, X, B, 0.2 + k * 0.1); R(c, x0, y, x1 - x0, 1, 'rgba(10, 8, 14, 0.5)'); }
  // (a lamp, set back, its pool)
  const [lx, ly] = at(e, X + 60, B, 0.6), lk = lampGlow();
  R(c, lx - 2, ly - 90 * 0.6, 3, 90 * 0.6, '#14161C'); R(c, lx - 1, ly - 90 * 0.6, 1, 90 * 0.6, '#6A7280'); R(c, lx - 3, ly - 2, 7, 3, '#4A4E58'); R(c, lx - 5, ly - 92 * 0.6, 10, 3, '#3A3E48');
  if (lk > 0.1) { steppedGlow(c, lx, ly - 90 * 0.6, 16, '#FFE8A8', 0.35 * lk, 0.05, 3); R(c, lx - 3, ly - 90 * 0.6 + 1, 6, 2, '#FFF4C8'); c.fillStyle = `rgba(255, 232, 168, ${(0.1 * lk).toFixed(3)})`; c.beginPath(); c.ellipse(lx, ly, 40, 5, 0, 0, Math.PI * 2); c.fill(); }
  // (a palm behind the booth)
  deep(c, e, 0.62, () => {
    const px = X + 120;
    c.strokeStyle = '#1A1410'; c.lineWidth = 9; c.beginPath(); c.moveTo(px, B); c.quadraticCurveTo(px + 6, B - 90, px + 14, B - 170); c.stroke();
    c.strokeStyle = '#3A2A1E'; c.lineWidth = 5; c.stroke();
    for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.5; c.strokeStyle = '#0A1E14'; c.lineWidth = 8; c.beginPath(); c.moveTo(px + 14, B - 170); c.quadraticCurveTo(px + 14 + Math.cos(a) * 30, B - 182 + Math.sin(a) * 30, px + 14 + Math.cos(a) * 54, B - 160 + Math.sin(a) * 24); c.stroke(); c.strokeStyle = k % 2 ? '#174A2C' : '#1E5A36'; c.lineWidth = 4; c.stroke(); }
  });
  // (a ticket booth, set back: pink, its window dark and smashed, TICKETS over it)
  deep(c, e, 0.72, () => stampT(c, 'lot-thru-booth', X - 30, B - 150, 120, 152, g => {
    const bx = X + 30;
    R(g, bx - 50, B - 120, 100, 120, INK); R(g, bx - 48, B - 118, 96, 118, '#B0457E'); R(g, bx - 48, B - 118, 8, 118, '#D06A9C'); R(g, bx + 36, B - 118, 12, 118, '#7E2E5A');
    R(g, bx - 36, B - 96, 72, 40, '#0B1220'); for (let k = 0; k < 6; k++) R(g, bx - 30 + k * 11, B - 92 + (k % 2) * 14, 4, 4, '#5A7A9A');
    g.strokeStyle = '#8AA8C8'; g.lineWidth = 1; g.beginPath(); g.moveTo(bx - 10, B - 80); g.lineTo(bx - 30, B - 92); g.moveTo(bx - 10, B - 80); g.lineTo(bx + 14, B - 60); g.moveTo(bx - 10, B - 80); g.lineTo(bx + 20, B - 94); g.stroke();
    R(g, bx - 58, B - 136, 116, 18, INK); R(g, bx - 56, B - 134, 112, 14, '#0A6A96'); R(g, bx - 56, B - 134, 112, 2, '#4AB0E0');
    text(g, 'TICKETS', bx, B - 123, '#E8F0F8', 7, 'center', null);
    R(g, bx - 48, B - 50, 96, 6, '#5A2040'); checker(g, bx - 48, B - 20, 96, 20, '#5A2040');
  }));
  // (the turnstiles, nearer: steel posts, their arms)
  deep(c, e, 0.88, () => {
    for (let k = 0; k < 4; k++) {
      const tx = X - 80 + k * 52;
      R(c, tx - 5, B - 44, 10, 44, INK); R(c, tx - 4, B - 43, 8, 43, '#5A606C'); R(c, tx - 4, B - 43, 2, 43, '#8A929E'); R(c, tx - 7, B - 48, 14, 6, '#3A3E48'); R(c, tx - 7, B - 48, 14, 1, '#9AA2AE');
      R(c, tx + 4, B - 36, 18, 3, INK); R(c, tx + 5, B - 35, 16, 1, '#B4BCC8');
      R(c, tx - 2, B - 40, 3, 2, (f >> 4) % 2 && k === 1 ? '#22C55E' : '#DC2626');
    }
  });
  c.restore();
};

/** The tower's side faces, going back toward the eye: the left tower's outer face (when he's left of it), the right
 *  tower's inner face (seen through the way in). */
const towerSide = (c: Ctx, e: Eye, ex: number, side: 1 | -1) => {
  if ((e.x - ex) * side <= 2) return;
  const B = GROUND_Y, th = GATE.towerH, d = 0.93, T = GATE.TOWER;
  const [x1, t1] = at(e, ex, B - th, d), [, b1] = at(e, ex, B, d);
  poly(c, [[ex, B - th], [x1, t1], [x1, b1], [ex, B]], T[1]);
  poly(c, [[x1 + (ex - x1) * 0.4, t1 + (B - th - t1) * 0.4], [x1, t1], [x1, b1], [x1 + (ex - x1) * 0.4, b1 + (B - b1) * 0.4]], T[0]);
  for (let k = 0; k < 8; k++) { const y = B - 236 + k * 30, [, ya] = at(e, ex, y, d); c.strokeStyle = mix(T[0], INK, 0.3); c.lineWidth = 1; c.beginPath(); c.moveTo(ex, y); c.lineTo(x1, ya); c.stroke(); }
  // (its cap's tiers going back too)
  const cxe = ex + side * 6, [cx1, ct1] = at(e, cxe, B - th - 14, d), [, cb1] = at(e, cxe, B - th - 4, d);
  poly(c, [[cxe, B - th - 14], [cx1, ct1], [cx1, cb1], [cxe, B - th - 4]], GATE.CAP[1]);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(ex, B - th); c.lineTo(x1, t1); c.lineTo(x1, b1); c.stroke();
};

/** His truck's picture (the way in's), without the shadow painted along under its wheels: turned over, that'd hang in
 *  the air over it. Baked the once (its few rows of shadow, the see-through black, cleared). */
let wreckCv: HTMLCanvasElement | null = null;
const wreckPicture = () => {
  if (wreckCv) return wreckCv;
  const img = truckPicture();
  const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
  const g = cv.getContext('2d')!; g.drawImage(img, 0, 0);
  try {
    const y0 = img.height - 12, d = g.getImageData(0, y0, img.width, 12);
    for (let i = 0; i < d.data.length; i += 4) if (d.data[i] < 12 && d.data[i + 1] < 12 && d.data[i + 2] < 12 && d.data[i + 3] < 215) d.data[i + 3] = 0;
    g.putImageData(d, 0, y0);
  } catch { /* (a tainted canvas can't be: it's all painted) */ }
  wreckCv = cv;
  return cv;
};
/** The truck, where it came down: on its roof, smashed, steaming, a wheel still turning; the puddle under it, oil and
 *  coolant (its sheen), the glass, the scrape it left sliding in from the left. */
const drawWreck = (c: Ctx, e: Eye, f: number, steam: number) => {
  const X = LOT.wreck, B = GROUND_Y;
  // (the scrape: lighter streaks gouged in the asphalt behind it, bits of trim along it)
  stamp(c, 'lot-scrape', X - 560, B - 8, 440, 22, g => {
    for (let k = 0; k < 5; k++) {
      const y = B - 4 + k * 3 + (k % 2), x0 = X - 540 + hash(k) * 80;
      g.fillStyle = k % 2 ? '#3E404A' : '#4A4C56'; g.fillRect(x0, y, X - 140 - x0, 1);
      for (let x = x0; x < X - 140; x += 18 + hash(x + k) * 20) R(g, x, y, 6, 1, '#5E606C');
    }
    for (let k = 0; k < 9; k++) R(g, X - 520 + k * 44 + hash(k * 3) * 20, B - 2 + hash(k) * 8, 3, 2, k % 3 ? '#9A9CA2' : '#B91C1C');
  });
  // (the puddle under it: dark, the oil's sheen in bands, the moon in it)
  stamp(c, 'lot-puddle', X - 170, B - 6, 340, 26, g => {
    g.fillStyle = '#0A0A10'; g.beginPath(); g.ellipse(X - 10, B + 6, 150, 9, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#12121C'; g.beginPath(); g.ellipse(X - 20, B + 5, 120, 6, 0, 0, Math.PI * 2); g.fill();
    for (const [dx, col] of [[-80, '#3A2A5A'], [-60, '#1E4A4A'], [-40, '#4A3A1A']] as [number, string][]) { g.fillStyle = col; g.beginPath(); g.ellipse(X + dx, B + 6, 22, 2, 0, 0, Math.PI * 2); g.fill(); }
    R(g, X + 40, B + 4, 10, 1, '#8A9AC8'); R(g, X + 44, B + 5, 4, 1, '#C8D4F0');
    // (coolant: a green run toward the front)
    g.fillStyle = '#1A4A2A'; g.beginPath(); g.ellipse(X - 130, B + 9, 26, 3, 0, 0, Math.PI * 2); g.fill(); R(g, X - 140, B + 8, 6, 1, '#4ADE80');
  });
  // (its shadow, dithered, then the truck itself: turned over about the picture's middle, its cab's roof down on the
  // asphalt, the hood at the left now)
  checker(c, X - 150, B - 6, 300, 6, 'rgba(0, 0, 0, 0.5)');
  const img = wreckPicture();
  c.save(); c.translate(X, B - 34); c.rotate(Math.PI - 0.04); c.drawImage(img, -150, -76); c.restore();
  // (the damage over it: the cab crushed down, the glass starred, a door sprung)
  stamp(c, 'lot-wreck-dmg', X - 160, B - 120, 320, 124, g => {
    poly(g, [[X - 104, B - 2], [X - 70, B - 12], [X - 30, B - 4], [X + 6, B - 14], [X + 6, B - 2]], 'rgba(10, 8, 12, 0.7)');
    for (let k = 0; k < 6; k++) { g.strokeStyle = 'rgba(200, 230, 255, 0.55)'; g.lineWidth = 1; g.beginPath(); g.moveTo(X - 60, B - 22); g.lineTo(X - 60 + Math.cos(k * 1.1) * 14, B - 22 + Math.sin(k * 1.1) * 8); g.stroke(); }
    R(g, X - 62, B - 24, 4, 4, '#E8F4FF');
    for (let k = 0; k < 5; k++) { const dx = X - 20 + k * 22; poly(g, [[dx, B - 56], [dx + 8, B - 60], [dx + 12, B - 52]], 'rgba(20, 16, 20, 0.6)'); R(g, dx + 2, B - 57, 6, 1, 'rgba(255, 255, 255, 0.35)'); }
    // (the bed's load: a toolbox burst open, a cooler, on the asphalt by the tailgate)
    R(g, X + 122, B - 16, 26, 16, INK); R(g, X + 123, B - 15, 24, 14, '#B91C1C'); R(g, X + 123, B - 15, 24, 3, '#E85A4A'); R(g, X + 132, B - 10, 6, 3, '#9A9CA2');
    R(g, X - 150, B - 12, 18, 12, INK); R(g, X - 149, B - 11, 16, 10, '#F8FAFC'); R(g, X - 149, B - 11, 16, 3, '#2563EB');
    for (let k = 0; k < 4; k++) R(g, X - 128 + k * 5, B - 3, 3, 2, ['#C08A2A', '#9A9CA2', '#C08A2A', '#6A4A2A'][k]);
  });
  for (let k = 0; k < 14; k++) R(c, X - 140 + hash(k) * 280, B - 3 - hash(k + 3) * 4, 3, 2, k % 2 ? '#BFE0FF' : '#9A9CA2');
  // (steam off the engine, dying down)
  for (let k = 0; k < 5; k++) {
    const age = (f * 1.2 + k * 24) % 120;
    pixelBlob(c, X - 112 + Math.sin((f + k * 40) * 0.05) * 6, B - 30 - age * 0.9, 6 + age * 0.12, 5 + age * 0.1, `rgba(232, 236, 240, ${(0.45 * steam * (1 - age / 120)).toFixed(2)})`);
  }
  // (now and then a spark off the wiring under the dash)
  if ((f % 97) < 4) { R(c, X - 40 + (f % 5), B - 30 - (f % 4) * 3, 2, 2, '#FFF4C8'); R(c, X - 36, B - 26 - (f % 3) * 2, 1, 1, '#FDE047'); }
  // (a back wheel up in the air, still going round: its spokes' glints)
  const wx = X + 80, wy = B - 92, a = f * 0.2;
  for (let k = 0; k < 5; k++) { const an = a + (k / 5) * Math.PI * 2; R(c, wx + Math.cos(an) * 11, wy + Math.sin(an) * 11, 2, 2, '#FFFFFF'); R(c, wx + Math.cos(an) * 6, wy + Math.sin(an) * 6, 1, 1, '#B4BCC8'); }
  void e;
};

export const drawLotBack = (c: Ctx, state: GameState, wreck: { steam: number; gate?: number; kick?: number }) => {
  const cam = state.camera.x, f = state.frame, e = eyeOf(state);
  const vis = (a: number, b: number) => b > cam - 60 && a < cam + W + 60;
  // (the asphalt, in stamped stretches)
  for (let x = Math.floor((cam - 60) / 400) * 400; x < cam + W + 60; x += 400) stamp(c, `lot-asph-${x}`, x, 512, 400, H + 40 - 512, g => paintAsphalt(g, x));
  // (the park's outer wall, going back from the gate)
  drawParkWall(c, e);
  // (the fence at the back: at its depth, culled by where it lands on screen; it stops at the park's wall)
  deep(c, e, D_FENCE, () => {
    const [a, b] = span(e, D_FENCE, 40), stop = GX + GATE.towerX[0] - 2;
    for (let x = Math.floor(a / 240) * 240; x < Math.min(b, stop); x += 240) {
      if (x + 240 <= stop) stamp(c, `lot-fence-${x}`, x - 20, GROUND_Y - FENCE_H - 26, 280, FENCE_H + 28, g => paintFence(g, x));
      else { c.save(); c.beginPath(); c.rect(x - 20, GROUND_Y - FENCE_H - 30, stop - x + 20, FENCE_H + 40); c.clip(); stamp(c, `lot-fence-${x}`, x - 20, GROUND_Y - FENCE_H - 26, 280, FENCE_H + 28, g => paintFence(g, x)); c.restore(); }
    }
    if (SIGN_X > a - 50 && SIGN_X < b + 50) stampT(c, 'lot-fence-sign', SIGN_X - 42, GROUND_Y - 56, 84, 30, paintFenceSign);
    // (the curb along the fence's foot: concrete, not lit: there's nothing back there to stand on)
    R(c, a, GROUND_Y - 4, Math.min(b, stop) - a, 6, '#2E2C30'); R(c, a, GROUND_Y - 4, Math.min(b, stop) - a, 1, '#4A4850');
  });
  // (the far row of stalls: lines going back to the fence, their wheel stops, oil stains)
  const x0 = Math.floor((cam - 200) / STALL) * STALL, x1 = cam + W + 200;
  for (let x = x0; x < x1; x += STALL) {
    if (x > GX - 180) continue;
    groundLine(c, e, x, D_FENCE, 0.935, 3, 'rgba(196, 192, 168, 0.55)');
    const [sx, sy] = at(e, x + STALL / 2, GROUND_Y, 0.84), d = 0.84;
    R(c, sx - 20 * d, sy - 3, 40 * d, 4, '#3A3836'); R(c, sx - 20 * d, sy - 3, 40 * d, 1, '#5A5650');
    if (hash(x * 0.37) > 0.35) { const [ox, oy] = at(e, x + STALL / 2 + (hash(x) - 0.5) * 20, GROUND_Y, 0.89); c.fillStyle = 'rgba(6, 6, 10, 0.55)'; c.beginPath(); c.ellipse(ox, oy, 16 * 0.89, 2.5, 0, 0, Math.PI * 2); c.fill(); }
  }
  // (the light poles at their depth; their light)
  deep(c, e, D_POLE, () => { const [a, b] = span(e, D_POLE, 60); for (const x of LIGHTS) if (x > a - 40 && x < b + 40) stamp(c, `lot-pole-${x}`, x - 30, GROUND_Y - 176, 60, 178, g => paintPole(g, x)); });
  for (const x of LIGHTS) { const [sx] = at(e, x, GROUND_Y, D_POLE); if (sx > cam - 200 && sx < cam + W + 200) drawPoleLight(c, e, x); }
  // (the aisle's arrows, painted flat on the play plane, worn)
  for (let x = Math.floor((cam - 100) / 600) * 600 + 300; x < cam + W + 100; x += 600) {
    if (x > GX - 180 || Math.abs(x - LOT.wreck) < 220) continue;
    const pt = (dx: number, d: number) => at(e, x + dx, GROUND_Y, d);
    poly(c, [pt(-30, 0.985), pt(10, 0.985), pt(10, 0.975), pt(30, 1.0), pt(10, 1.025), pt(10, 1.015), pt(-30, 1.015)], 'rgba(190, 186, 160, 0.3)');
  }
  // (the near row's lines, off the bottom of the screen)
  for (let x = x0; x < x1; x += STALL) groundLine(c, e, x + STALL / 2, 1.07, 1.4, 4, 'rgba(206, 200, 172, 0.5)');
  // His truck, where it came down (the puddle over the lines)
  if (vis(LOT.wreck - 600, LOT.wreck + 200)) drawWreck(c, e, f, wreck.steam);
  // The water park's gate: what's through it, the towers' sides, the bars (up, or going over), the towers and the arch
  if (vis(GX - 260, GX + 260)) drawGate(c, e, f, wreck.gate ?? 0, wreck.kick ?? -1);
};

/** The gate: `down` 0 up, 1 kicked in flat (falling away from him, into the park: squashed down onto the ground's plane,
 *  the far side); `kick` frames since he kicked it (-1 not yet: the dust). */
const drawGate = (c: Ctx, e: Eye, f: number, down: number, kick: number) => {
  const X = GX, B = GROUND_Y;
  drawThrough(c, e, f);
  towerSide(c, e, X + GATE.towerX[1], -1);
  // (the bars: up, or going over away from him, flat at the last; drawn first: the arch's towers stand in front of them)
  if (down <= 0) stampT(c, 'lot-gate-bars2', X - 130, B - 162, 260, 164, paintBars);
  else {
    const k = Math.min(1, down), sq = Math.max(0.04, Math.cos(k * Math.PI / 2));
    // (its shadow going with it)
    c.fillStyle = 'rgba(0, 0, 0, 0.35)'; c.fillRect(X - 118, B - 4, 236, 4);
    c.save(); c.translate(0, B); c.scale(1, sq); c.translate(0, -B);
    stampT(c, 'lot-gate-bars2', X - 130, B - 162, 260, 164, paintBars);
    c.restore();
  }
  // (the dust off it as it lands)
  if (kick > 14) {
    const t = kick - 20;
    if (t > 0 && t < 50) for (let k = 0; k < 9; k++) {
      const dx = (k - 4) * 28 + Math.sin(k * 2.1) * 8, rise = t * (0.5 + hash(k) * 0.4), a = 0.5 * (1 - t / 50);
      pixelBlob(c, X + dx * (1 + t * 0.01), B - 6 - rise, 10 + t * 0.3, 6 + t * 0.2, `rgba(${150 + k * 4}, ${140 + k * 3}, ${128 + k * 2}, ${a.toFixed(2)})`);
    }
  }
  towerSide(c, e, X + GATE.towerX[0] - 2, -1);
  stampT(c, 'lot-gate2', X - 200, B - 330, 400, 332, paintTowers);
  // (the work lights on its towers' caps, blinking)
  for (const tx of [X + GATE.towerX[0] + 25, X + GATE.towerX[1] + 25]) if ((f >> 5) % 2) steppedGlow(c, tx, B - 268, 12, '#22D3EE', 0.5, 0.1, 3);
};
