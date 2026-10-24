// The train's painting kit (the final pass: peak SNES, matched to the wilds' (wilds/paint.ts) and Lonesome Pine
// Station's train (wilds/stationArt.ts): the same 4-4-0, the same cars, the same reds, maroons, Russia iron, brass and
// varnish, here at the train section's big car sizes). Materials in stepped ramps (darkest first), lit from the upper
// left, inked round.
//
// Still art is painted once per hour into an offscreen canvas and put down after that (still()): unlike the engine's
// stamps it keeps its cache under the grades' tilt (the world drawn turned), so a climb doesn't repaint every car every
// frame.

import { timeOfDay, thisHour, farTint, skyAt } from '../../timeOfDay';
import { box, checker, mix, hash, INK, part as wpart, slab, post, ball, fiberglass, pine, near, dimmed, rampOf, FIBER, STONE, DIRT, GRASS, NEEDLE, BARK, PLANK, PLY, STEEL, WATER, LIP, FIBER_LIP, bandedGradient, hazeBands, pixelBlob } from '../wilds/paint';

export { box, checker, mix, hash, INK, slab, post, ball, fiberglass, pine, near, dimmed, rampOf, FIBER, STONE, DIRT, GRASS, NEEDLE, BARK, PLANK, PLY, STEEL, WATER, LIP, FIBER_LIP, bandedGradient, hazeBands, pixelBlob, timeOfDay, farTint, skyAt };
export const part = wpart;
export type Ctx = CanvasRenderingContext2D;

// ---------------------------------------------------------------------------------------------------------------
// The train's own materials (the station's: wilds/stationArt.ts)

export const RED = ['#3A0A0C', '#5E1216', '#821C20', '#A3262A', '#C2403A', '#DC6450', '#F09070'];
export const MAROON = ['#200A10', '#341018', '#4A1822', '#5E2230', '#7A3242', '#98485A', '#B86478'];
export const IRON = ['#0E1218', '#1A2028', '#28303C', '#384452', '#4C5A6C', '#667688', '#90A0B2'];
export const BLACK = ['#08080A', '#121216', '#1C1C22', '#26262E', '#363642', '#4A4A58', '#6A6A7A'];
export const BRASS = ['#3A2408', '#6A4410', '#9A6A1C', '#C8962E', '#E8C25A', '#FFF0A8', '#FFF8D8'];
export const VARNISH = ['#1E0E06', '#3A1C0C', '#5A3016', '#7A4620', '#9A5E2E', '#BA7A40', '#D89A5A'];
/** The dining car's green (a Pullman's). */
export const GREEN = ['#08140E', '#102218', '#183226', '#224434', '#2E5A44', '#427458', '#5E9272'];
/** The mail car's olive drab. */
export const OLIVE = ['#141208', '#24200E', '#363016', '#4A4220', '#60562C', '#7A6E3C', '#988A52'];
/** The freight cars' boxcar red (oxide, weathered). */
export const OXIDE = ['#1E0C06', '#341608', '#4E220E', '#6A3016', '#86401E', '#A2562C', '#BE7240'];
/** The cattle car's slats (raw, weathered fir). */
export const FIR = ['#1A1008', '#2E1C0E', '#463016', '#5E4420', '#785A2E', '#94743E', '#B29254'];
/** The cars' painted insides: cream walls, the varnished wainscot. */
export const CREAM = ['#3A3020', '#5A4C34', '#7E6E50', '#A8966E', '#C8B890', '#E2D6B2', '#F4ECD2'];
/** Plush (the coach's benches). */
export const PLUSH = ['#1E0608', '#360A0E', '#521216', '#6E1C20', '#8A2A2C', '#A84440', '#C2645A'];
/** Hay. */
export const HAY = ['#3A2A0A', '#5E4612', '#86661C', '#A8862C', '#C8A440', '#E2C460', '#F4DE8A'];
/** Ore (the hoppers': rusty, glinting). */
export const ORE = ['#1C0E06', '#32180A', '#4C2610', '#683618', '#844A22', '#A0642E', '#C08442'];
export const COAL = ['#060608', '#0E0E12', '#18181E', '#24242C', '#34343E', '#4A4A56', '#6E6E7E'];
export const GOLD = '#F2C84A';
/** The lit lip along what he stands on (worn paint and wood catching the light). */
export const TOPLIP = ['#3A2410', '#8A6A3A', '#E8C890', '#FFF0C8'];

/** A ramp for the hour, near (the train's in the scene's own light). */
export const N = (R: string[]) => near(R, 0.18);

// ---------------------------------------------------------------------------------------------------------------
// Stills (cached per hour, kept under the tilt)

const CACHE = new Map<string, HTMLCanvasElement>();
/** The cache's budget (pixels): past it, the longest unused go first. */
const BUDGET = 16e6;
let pixels = 0;
/** Every still let go (off out of Wilderness Land: landCaches.ts; or a new hour, all painted again for it). */
export const clearStills = () => { CACHE.clear(); pixels = 0; };
const fontIn = () => (typeof document !== 'undefined' && document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n');
/**
 * Still art: `paint` (in local units, the box bx, by, bw, bh) painted once for this hour at the screen's scale into its
 * own canvas, put down at the current transform (turned or not). Origin at the current transform's (0, 0).
 */
export const still = (c: Ctx, key: string, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void) => {
  if (typeof document === 'undefined') { paint(c); return; }
  const m = c.getTransform(), s = Math.max(0.25, Math.round(Math.hypot(m.a, m.b) * 32) / 32);
  const id = `${key}-${timeOfDay().key}-${fontIn()}@${s}`;
  let cv = thisHour(CACHE, clearStills).get(id);
  if (cv) { CACHE.delete(id); CACHE.set(id, cv); }
  else {
    cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.ceil(bw * s)); cv.height = Math.max(1, Math.ceil(bh * s));
    const g = cv.getContext('2d')!;
    g.imageSmoothingEnabled = false;
    g.scale(s, s); g.translate(-bx, -by);
    paint(g);
    CACHE.set(id, cv);
    pixels += cv.width * cv.height;
    while (pixels > BUDGET && CACHE.size > 1) {
      const [old, oc] = CACHE.entries().next().value as [string, HTMLCanvasElement];
      CACHE.delete(old); pixels -= oc.width * oc.height;
    }
  }
  c.drawImage(cv, bx, by, cv.width / s, cv.height / s);
};
/** Still art at world (x, y). */
export const stillAt = (c: Ctx, key: string, x: number, y: number, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); still(c, key, bx, by, bw, bh, paint); c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Pieces

/** A row of rivets along y (ink, then the head's glint). */
export const rivets = (g: Ctx, x0: number, x1: number, y: number, col: string, step = 6) => { for (let x = x0; x < x1; x += step) { g.fillStyle = INK; g.fillRect(x, y, 2, 2); g.fillStyle = col; g.fillRect(x, y, 1, 1); } };

/** Planks standing up side by side (a car's side): each lit down its left, its seam dark, the odd one a shade off, nail
 *  heads top and bottom. */
export const planks = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], pw = 7, seed = 0) => {
  box(g, x, y, w, h, R[3]);
  for (let px = x, i = 0; px < x + w; px += pw, i++) {
    const tone = hash(seed + i * 1.7);
    if (tone < 0.22) box(g, px, y, pw, h, R[2]); else if (tone > 0.85) box(g, px, y, pw, h, mix(R[3], R[4], 0.5));
    box(g, px, y, 1, h, R[1]); box(g, px + 1, y, 1, h, R[4]);
    box(g, px + 2, y + 3, 1, 2, INK); box(g, px + 2, y + h - 5, 1, 2, INK);
  }
};
/** Planks laid along (a floor's edge, a deck, the tender's sides). */
export const boards = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], bh = 6, seed = 0) => {
  box(g, x, y, w, h, R[3]);
  for (let py = y, i = 0; py < y + h; py += bh, i++) {
    box(g, x, py, w, 1, R[4]); box(g, x, py + bh - 1, w, 1, R[1]);
    for (let j = 0; j < 3; j++) box(g, x + hash(seed + i * 5 + j) * w, py + 2, 10 + hash(seed + i + j * 3) * 30, 1, R[2]);
    const joint = x + ((i * 97 + seed * 13) % Math.max(1, Math.floor(w)));
    box(g, joint, py, 1, bh, R[0]);
  }
};
/** A lit top lip along a standable top (worn edge catching the light, shade under). */
export const lip = (g: Ctx, x: number, y: number, w: number, L = TOPLIP) => {
  box(g, x, y, w, 1, L[3]); box(g, x, y + 1, w, 1, L[2]); box(g, x, y + 2, w, 1, L[1]);
};
/** A window's glass (by the hour: cool by day, warm lamplight behind it after dark), with its glint. */
export const glass = (g: Ctx, x: number, y: number, w: number, h: number, warm: number) => {
  const day = ['#1E2C38', '#2E4456', '#4A6A84', '#7A9AB4'], night = ['#4A2E10', '#7A4E1A', '#B07A2C', '#E8B05A'];
  const C = day.map((d, i) => mix(d, night[i], warm));
  box(g, x, y, w, h, C[1]);
  box(g, x, y, w, Math.max(2, h * 0.3), C[2]);
  box(g, x, y, Math.max(2, w * 0.22), h, C[2]);
  checker(g, x, y + h * 0.3, w, 2, C[2], 0);
  box(g, x + 1, y + 1, Math.max(1, w * 0.12), Math.max(2, h * 0.5), C[3]);
  box(g, x, y + h - 2, w, 2, C[0]);
};
/** How warm the windows are this hour (0 by day, 1 at night: the lamps lit inside). */
export const warmth = () => Math.min(1, Math.max(0, timeOfDay().lamps));
/** A spoked wheel (the station's): the steel tire lit along its top, the red center, spokes turned by `a`, a
 *  counterweight on the drivers, the brass hub. */
export const wheel = (c: Ctx, x: number, y: number, r: number, a: number, weight = false, spokes?: number) => {
  const S = N(STEEL), Rd = N(RED);
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + 1.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = S[3]; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.fillStyle = S[5]; c.beginPath(); c.arc(x, y, r, Math.PI * 1.1, Math.PI * 1.7); c.lineTo(x, y); c.closePath(); c.fill();
  c.fillStyle = S[1]; c.beginPath(); c.arc(x, y, r, Math.PI * 0.1, Math.PI * 0.7); c.lineTo(x, y); c.closePath(); c.fill();
  c.fillStyle = Rd[1]; c.beginPath(); c.arc(x, y, r - Math.max(3, r * 0.14), 0, Math.PI * 2); c.fill();
  if (weight) { c.fillStyle = Rd[3]; c.beginPath(); c.arc(x, y, r - Math.max(4, r * 0.16), a + Math.PI - 0.7, a + Math.PI + 0.7); c.lineTo(x, y); c.closePath(); c.fill(); }
  const n = spokes ?? (r > 15 ? 12 : 8);
  c.strokeStyle = Rd[4]; c.lineWidth = r > 30 ? 3.4 : r > 15 ? 2.4 : 1.6;
  for (let k = 0; k < n; k++) { const t = a + (k * Math.PI * 2) / n; c.beginPath(); c.moveTo(x + Math.cos(t) * 3, y + Math.sin(t) * 3); c.lineTo(x + Math.cos(t) * (r - 3), y + Math.sin(t) * (r - 3)); c.stroke(); }
  c.strokeStyle = Rd[2]; c.lineWidth = 1;
  for (let k = 0; k < n; k++) { const t = a + (k * Math.PI * 2) / n + 0.06; c.beginPath(); c.moveTo(x + Math.cos(t) * 4, y + Math.sin(t) * 4); c.lineTo(x + Math.cos(t) * (r - 4), y + Math.sin(t) * (r - 4)); c.stroke(); }
  const hub = Math.max(3, r * 0.17);
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, hub + 1, 0, Math.PI * 2); c.fill();
  c.fillStyle = BRASS[3]; c.beginPath(); c.arc(x, y, hub, 0, Math.PI * 2); c.fill();
  c.fillStyle = BRASS[5]; c.fillRect(x - hub * 0.6, y - hub * 0.6, Math.max(1.4, hub * 0.5), Math.max(1.4, hub * 0.5));
};
/** A banded cylinder lying along x (a boiler, a tank): lit along its top, shaded under, dithered between. */
export const barrel = (g: Ctx, x: number, y: number, w: number, h: number, Rm: string[]) => {
  box(g, x - 1, y - 1, w + 2, h + 2, INK);
  const bands: [number, string][] = [[0.08, Rm[4]], [0.1, Rm[5]], [0.2, Rm[4]], [0.24, Rm[3]], [0.2, Rm[2]], [0.18, Rm[1]]];
  let yy = y;
  for (const [k, col] of bands) { box(g, x, yy, w, h * k + 1, col); yy += h * k; }
  checker(g, x, y + h * 0.38, w, 2, Rm[4], 0); checker(g, x, y + h * 0.62, w, 2, Rm[3], 1); checker(g, x, y + h * 0.82, w, 2, Rm[2], 0);
};
/** A flame (stepped: red rim, orange, yellow heart), flickering by `t`. */
export const flame = (c: Ctx, x: number, y: number, h: number, t: number, seed = 0) => {
  const w = h * 0.42, sway = Math.sin(t * 0.3 + seed) * w * 0.3;
  const tongue = (k: number, col: string) => { c.fillStyle = col; c.beginPath(); c.moveTo(x - w * k, y); c.quadraticCurveTo(x - w * k * 0.9, y - h * k * 0.5, x + sway * k, y - h * k); c.quadraticCurveTo(x + w * k * 0.9, y - h * k * 0.5, x + w * k, y); c.closePath(); c.fill(); };
  tongue(1, '#B4281A'); tongue(0.78, '#F06A1E'); tongue(0.52, '#FBBF24'); tongue(0.26, '#FFF3B0');
};
/** Sky-colored at height v (0 top .. 1 horizon), for windows onto what's going by. */
export const skyCol = (v: number) => skyAt(v);
/** A soft round puff (smoke, steam, mist): stepped, three tones. */
export const puff = (c: Ctx, x: number, y: number, r: number, cols: [string, string, string], a = 1) => {
  c.globalAlpha = a;
  pixelBlob(c, x, y, r, r * 0.86, cols[0]);
  pixelBlob(c, x - r * 0.18, y - r * 0.2, r * 0.74, r * 0.62, cols[1]);
  pixelBlob(c, x - r * 0.34, y - r * 0.38, r * 0.36, r * 0.3, cols[2]);
  c.globalAlpha = 1;
};
export { farTint as tint };
void dimmed; void FIBER_LIP;
