// The dirt-bike chase's art (the final pass: Road Rash on the Genesis / Mega Drive, at its peak). Everything on the road
// is a SPRITE the Genesis way: painted once, cut crisp (its edges thresholded hard, no soft pixels), ringed in a 1 px ink
// outline, and kept in SCALE BUCKETS (a size per step: 1/8, 3/16, 1/4, 3/8, 1/2, 3/4, 1, 1.5, 2 of its base), each bucket
// put down at the nearest size with no smoothing: as a thing comes at you it steps up through its frames, chunky and
// sharp, never blurred. Far ones are fogged in steps into the haze (the road's own fog bands).
//
// The roadside (painted once each, per look): real Rockies country, the log ride's real side and the woods' (the same
// ramps: firs, spruce, lodgepole, aspens gold and green, granite, the farm's barn red, creosoted poles, steel towers).
// The riders from behind, Road Rash's way, each pose its own cached frame (the lean baked in, in steps, like the
// Genesis's lean frames): Meathead (clean, shat, bare; his blood in stages; the punch, its wind-up and the profile
// scowl), the teens (seeded: helmets and jerseys with their numbers on the back, ball caps on backwards, beanies, their
// hair; their weapons and every recoil), Tucker on the stolen bike, the bodies, the tumbles, the wrecks.
//
// Riders are drawn in "art units": the bike's ground point at the origin, about 100 units to the top of the rider's
// head; px per unit is the slot's scale times ART (world units per art unit) times K (him: about 1, so his frames are
// painted 1:1 and put down unscaled).

import { elbowFront, halfBone } from '../../art/limb';
import { mix } from '../kit';
import { lookOf, type Look } from '../../adventure/temple/people';
import { teenOf, bikeColor, type Teen } from '../woods/teens';
import { drawTuckerCloseup, type TuckerWounds } from '../tucker';
import { signText, signW, type Look as Letters } from '../../signLetters';
import { pine, clump, rampOf, NEEDLE, BARK, OAK, GRASS, DIRT, STEEL, PLANK } from '../wilds/paint';
import { ASPEN, GOLD, POLE, firOf, spruceOf } from '../woods/paint';
import { SPR, FOG_HAZE, type SprKind } from './road';

type Ctx = CanvasRenderingContext2D;
export const INK = '#140C06';
/** World units per art unit (a rider's 80 units is 440 world units tall). */
export const ART = 5.5;

const box = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2); c.fill(); };
const poly = (c: Ctx, col: string, pts: number[]) => { c.fillStyle = col; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fill(); };
const line = (c: Ctx, col: string, w: number, pts: number[]) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.stroke(); c.lineCap = 'butt'; };
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
/** A 6-step ramp off a color (darkest first; [3] the color itself). */
const RAMPS = new Map<string, string[]>();
const R6 = (col: string) => { let r = RAMPS.get(col); if (!r) { r = rampOf(col); RAMPS.set(col, r); } return r; };

// ---------------------------------------------------------------------------------------------------------------
// The sprite cache: crisp, outlined, in scale buckets

interface Sprite { cv: HTMLCanvasElement; ox: number; oy: number; k: number }
const KS = [0.125, 0.1875, 0.25, 0.375, 0.5, 0.75, 1, 1.5, 2];
/** The bucket for a scale: the biggest frame not much bigger than it's shown (so it's scaled up a little, never
 *  shrunk away to nothing), capped at `max`. */
const bucketOf = (s: number, max = 2) => {
  let k = KS[0];
  for (const q of KS) if (q <= s * 1.14 && q <= max) k = q;
  return k;
};
/** Cut a freshly painted frame crisp: every pixel fully on or off, and a 1 px ink ring round the lot. */
const crisp = (cv: HTMLCanvasElement, outline = true) => {
  const g = cv.getContext('2d')!, w = cv.width, h = cv.height;
  const im = g.getImageData(0, 0, w, h), d = im.data;
  for (let i = 3; i < d.length; i += 4) d[i] = d[i] >= 112 ? 255 : 0;
  if (outline) {
    const on = new Uint8Array(w * h);
    for (let p = 0; p < w * h; p++) on[p] = d[p * 4 + 3] ? 1 : 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const p = y * w + x;
      if (on[p]) continue;
      if ((x > 0 && on[p - 1]) || (x < w - 1 && on[p + 1]) || (y > 0 && on[p - w]) || (y < h - 1 && on[p + w])) { const q = p * 4; d[q] = 20; d[q + 1] = 12; d[q + 2] = 6; d[q + 3] = 255; }
    }
  }
  g.putImageData(im, 0, 0);
};
/** Paint a frame: `paint` draws in its own units about the origin, inside the box (bx, by, bw, bh), at bucket k. */
const makeSprite = (k: number, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void, fog = 0, outline = true): Sprite => {
  const cv = document.createElement('canvas');
  cv.width = Math.max(3, Math.ceil(bw * k) + 2); cv.height = Math.max(3, Math.ceil(bh * k) + 2);
  const g = cv.getContext('2d')!;
  const ox = Math.round(1 - bx * k), oy = Math.round(1 - by * k);
  g.save(); g.translate(ox, oy); g.scale(k, k); paint(g); g.restore();
  crisp(cv, outline);
  // (fogged in a step toward the haze: the road's fog bands)
  if (fog > 0) { g.globalCompositeOperation = 'source-atop'; g.globalAlpha = fog; g.fillStyle = FOG_HAZE; g.fillRect(0, 0, cv.width, cv.height); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
  return { cv, ox, oy, k };
};
/** Put a frame down, its origin at (x, y), shown at scale s (snapped to 1:1 when it's near enough). */
const blit = (c: Ctx, sp: Sprite, x: number, y: number, s: number) => {
  let r = s / sp.k;
  if (Math.abs(r - 1) < 0.12) r = 1;
  c.drawImage(sp.cv, Math.round(x - sp.ox * r), Math.round(y - sp.oy * r), Math.round(sp.cv.width * r), Math.round(sp.cv.height * r));
};

/** The riders' frames, kept while there's room (the longest unused go first). */
const FRAMES = new Map<string, Sprite>();
let framePx = 0;
const FRAME_BUDGET = 12e6;
const frame = (key: string, k: number, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void) => {
  let sp = FRAMES.get(key);
  if (sp) { FRAMES.delete(key); FRAMES.set(key, sp); return sp; }
  sp = makeSprite(k, bx, by, bw, bh, paint);
  FRAMES.set(key, sp); framePx += sp.cv.width * sp.cv.height;
  while (framePx > FRAME_BUDGET && FRAMES.size > 1) { const [k0, s0] = FRAMES.entries().next().value as [string, Sprite]; FRAMES.delete(k0); framePx -= s0.cv.width * s0.cv.height; }
  return sp;
};
/** A lean in steps (the Genesis's lean frames). */
const leanStep = (a: number) => Math.round(Math.max(-0.3, Math.min(0.3, a)) * 10) / 10;
/** An angle in 16 steps (a tumble's frames). */
const turnStep = (a: number) => { const n = Math.round((a / (Math.PI * 2)) * 16); return (((n % 16) + 16) % 16) * (Math.PI / 8); };
/** A wobble's four beats (0, 1, 0, -1). */
const OSC = [0, 1, 0, -1];

// (3x5 digits: the jerseys' numbers, the mailbox's)
const DIG = ['111101101101111', '010110010010111', '111001111100111', '111001111001111', '101101111001001', '111100111001111', '111100111101111', '111001001001001', '111101111101111', '111101111001111'];
export const digits = (c: Ctx, n: number, x: number, y: number, col: string, px = 1) => {
  const s = String(n);
  let cx = x - (s.length * 4 * px - px) / 2;
  for (const ch of s) {
    const m = DIG[+ch];
    for (let i = 0; i < 15; i++) if (m[i] === '1') box(c, cx + (i % 3) * px, y + Math.floor(i / 3) * px, px, px, col);
    cx += 4 * px;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The roadside things: painted once each (per look), at RES world units per base px, their feet at the bottom middle

/** World units per base px, by kind (the signs finer, for their words; the animals finer, for their faces). */
const RES: Partial<Record<SprKind, number>> = {
  pine: 8, oak: 8, teentree: 8, bloodtree: 8, bush: 5, boulder: 6, post: 4, mailbox: 4, hay: 5, outhouse: 6, tractor: 6, slow: 5, sign: 4,
  cow: 6, deer: 6, deadcow: 6, deaddeer: 6, pylon: 10, pole: 8, barn: 10, house: 10, reeds: 4, rock: 4, log: 6, stump: 4, health: 3,
};
const resOf = (k: SprKind) => RES[k] ?? 10;
/** How many looks each kind has (by its seed). */
const VARIANTS: Partial<Record<SprKind, number>> = { pine: 3, oak: 3, bloodtree: 3, cow: 3, deer: 2, bush: 2, boulder: 2, deadcow: 3, deaddeer: 2, teentree: 4, tractor: 2, mailbox: 2 };

// (the roadside's ramps: the land's own (wilds / woods paint), and the farm's)
const BARN = ['#2A0806', '#4A0E0A', '#6E1810', '#922418', '#B23424', '#CC5038', '#E27A5E'];
const TRIM = ['#4A4640', '#7A766C', '#A8A498', '#CCC8BC', '#E6E2D8', '#F8F6F0'];
const HAYR = ['#3A2A0A', '#5E4612', '#86661C', '#A8862C', '#C8A440', '#E2C460', '#F4DE8A'];
const GRAN = ['#101216', '#1C2026', '#2C3038', '#3E434C', '#535862', '#6C727C', '#8E949C', '#B4B8BE'];
const SAND = ['#2A1408', '#4A2410', '#6E3A1C', '#8E5230', '#AE6C44', '#C88A5E', '#E0AC80'];
const WEATHER = ['#1E1C1A', '#36322E', '#504A44', '#6C645C', '#8A8278', '#A8A096', '#C8C0B6'];
const LICHEN = ['#7A8A3A', '#A0A84A', '#C8C060'];
const TIRE = ['#08080A', '#141418', '#202026', '#2E2E36', '#42424C', '#5A5A66'];
const RINGS = ['#5A3A1E', '#7E5630', '#A07444', '#C29660', '#DAB47C', '#ECCE9A'];
const COW_HIDES: [string[], string[] | null, boolean][] = [
  // (holstein: white with black patches; angus: black; hereford: red with a white face)
  [['#6A6660', '#9C988E', '#C8C4BA', '#E8E4DA', '#F6F4EE', '#FFFFFF'], ['#08080A', '#141418', '#1E1E24', '#2A2A32'], false],
  [['#060606', '#0E0E10', '#18181C', '#24242A', '#34343C', '#4A4A54'], null, false],
  [['#2A0E06', '#4A1A0A', '#6E2A12', '#8E3C1C', '#AA5428', '#C47040'], ['#B8B4AA', '#D8D4CA', '#F2F0EA', '#FFFFFF'], true],
];
const DEER = ['#2A1A0E', '#4A3018', '#6E4A26', '#8E6436', '#A87E4C', '#C49C6A', '#DCBE92'];

/** An aspen (gold or green) or a cottonwood: chalky bark with black eyes, round crowns of small leaves. */
const aspen = (c: Ctx, w: number, h: number, v: number) => {
  const cx = w / 2, th = h * 0.66;
  if (v === 2) {
    // (a cottonwood by the water: a thick furrowed gray trunk forking, a broad crown)
    const B = WEATHER;
    poly(c, B[3], [cx - 7, h, cx + 7, h, cx + 5, h - th * 0.55, cx + 14, h - th, cx + 8, h - th, cx, h - th * 0.62, cx - 9, h - th * 0.95, cx - 14, h - th * 0.92, cx - 5, h - th * 0.55]);
    box(c, cx - 6, h - th * 0.55, 3, th * 0.55, B[5]); box(c, cx + 3, h - th * 0.55, 3, th * 0.55, B[1]);
    for (let y = h - 4; y > h - th * 0.55; y -= 4) box(c, cx - 4 + ((y * 3) % 6), y, 1, 3, B[2]);
    const L = OAK.map(col => mix(col, '#6A8A2A', 0.15));
    clump(c, cx, h - th - 18, w * 0.42, 30, 31, L, 0); clump(c, cx - 26, h - th + 2, w * 0.26, 22, 33, L, 1); clump(c, cx + 26, h - th - 2, w * 0.26, 22, 35, L, 0);
    return;
  }
  const A = ASPEN;
  box(c, cx - 5, h - th, 10, th, A[4]); box(c, cx - 5, h - th, 3, th, A[6]); box(c, cx + 2, h - th, 3, th, A[2]);
  for (let i = 0; i < 12; i++) { const y = h - th + 6 + i * (th / 12); box(c, cx - 4 + (i % 2) * 4, y, 4, 2, '#1E1A16'); box(c, cx - 3 + (i % 2) * 4, y + 2, 2, 1, A[1]); }
  // (a fork, a broken limb)
  line(c, A[3], 3, [cx + 2, h - th + 8, cx + 14, h - th - 4]); line(c, A[3], 2, [cx - 3, h - th + 20, cx - 13, h - th + 12]);
  const L = v === 0 ? GOLD : OAK.map(col => mix(col, '#9AB040', 0.25));
  clump(c, cx, h - th - 14, w * 0.34, 34, 11 + v, L, 0); clump(c, cx - 22, h - th + 6, w * 0.22, 22, 13 + v, L, 1); clump(c, cx + 20, h - th + 2, w * 0.24, 22, 15 + v, L, 0);
};

/** A kid's look for a roadside casualty (the same drawer as the riders'). */
const casualty = (seed: number) => teenLookOf(seed);

const painters: Record<SprKind, (c: Ctx, w: number, h: number, v: number, words?: string) => void> = {
  pine: (c, w, h, v) => {
    // (a Douglas fir, a blue spruce, a lodgepole: the real ones, the log ride's and the woods' painter)
    if (v === 0) pine(c, w / 2, h, h - 3, w * 0.82, 7, firOf(NEEDLE), BARK);
    else if (v === 1) pine(c, w / 2, h, h * 0.92, w * 0.74, 19, spruceOf(NEEDLE), BARK);
    else pine(c, w / 2, h, h - 3, w * 0.6, 29, NEEDLE, BARK);
    // (duff and a root flare at its foot)
    ell(c, w / 2, h - 1, w * 0.22, 2, DIRT[2]); box(c, w / 2 - w * 0.18, h - 2, w * 0.36, 1, DIRT[3]);
  },
  oak: (c, w, h, v) => aspen(c, w, h, v),
  teentree: (c, w, h, v) => {
    aspen(c, w, h, v % 2);
    // (a kid folded backward round the trunk, bat and all: legs one side, the head the other, blood down the bark)
    const k = casualty(1000 + v * 37), L = k.look, cx = w / 2, y = h - 36;
    const P = R6(L.pants), S = R6(L.shirt), K = R6(L.skin);
    box(c, cx - 2, y + 4, 3, 30, '#7F1414'); box(c, cx - 1, y + 4, 1, 30, '#B91C1C');
    line(c, P[2], 7, [cx - 6, y, cx - 18, y + 6, cx - 24, y + 2]); line(c, P[3], 5, [cx - 6, y, cx - 18, y + 5, cx - 24, y + 1]);
    line(c, P[2], 7, [cx - 6, y + 3, cx - 16, y + 13, cx - 26, y + 13]); line(c, P[3], 5, [cx - 6, y + 3, cx - 16, y + 12, cx - 26, y + 12]);
    box(c, cx - 30, y - 2, 7, 5, k.helmet ? '#F5F5F4' : '#18181B'); box(c, cx - 32, y + 10, 7, 5, k.helmet ? '#F5F5F4' : '#18181B');
    box(c, cx - 8, y - 9, 16, 12, S[3]); box(c, cx - 8, y - 9, 16, 2, S[4]); box(c, cx + 4, y - 9, 4, 12, S[2]);
    if (k.helmet) { ell(c, cx + 13, y + 4, 7, 7, R6(k.helmet)[3]); box(c, cx + 8, y + 1, 10, 2, '#18181B'); }
    else { ell(c, cx + 13, y + 4, 6, 6, K[3]); box(c, cx + 7, y - 2, 12, 4, L.hair); box(c, cx + 10, y + 4, 2, 2, INK); box(c, cx + 15, y + 4, 2, 2, INK); box(c, cx + 11, y + 8, 5, 2, '#5A0A0A'); }
    line(c, K[3], 3, [cx + 6, y + 8, cx + 12, y + 18]);
    ell(c, cx + 2, y - 2, 6, 4, '#8A1414');
  },
  bloodtree: (c, w, h, v) => {
    aspen(c, w, h, v);
    // (where a kid hit it and peeled off: a red splat on the bark at head height, the runs down to the roots, a shoe
    // left up in the leaves)
    const cx = w / 2, y = h - 40;
    ell(c, cx, y, 10, 8, '#7F1414'); ell(c, cx - 1, y - 1, 7, 5, '#A51C1C'); ell(c, cx - 7, y - 5, 4, 3, '#B91C1C'); ell(c, cx + 8, y + 3, 3, 3, '#A51C1C'); box(c, cx - 3, y - 3, 3, 2, '#E04848');
    for (const [dx, len] of [[-4, 30], [0, 38], [4, 24]]) { box(c, cx + dx, y, 2, len, '#7F1414'); box(c, cx + dx, y + len, 3, 2, '#5A0A0A'); }
    box(c, cx + 16, h - h * 0.66 - 26, 8, 5, '#F5F5F4'); box(c, cx + 16, h - h * 0.66 - 22, 8, 2, '#18181B'); box(c, cx + 18, h - h * 0.66 - 26, 3, 1, '#DC2626');
  },
  bush: (c, w, h, v) => {
    // (a serviceberry thicket with its berries, or sagebrush gone silver)
    const L = v ? OAK.map(col => mix(col, '#8A9A88', 0.45)) : OAK.map(col => mix(col, '#1A2A1A', 0.15));
    clump(c, w / 2 - 12, h - 18, 22, 16, 3 + v, L, 1); clump(c, w / 2 + 12, h - 18, 22, 16, 5 + v, L, 1); clump(c, w / 2, h - 28, 24, 18, 7 + v, L, 0);
    if (!v) for (let i = 0; i < 9; i++) { const bx = w / 2 - 22 + hash(i * 3.1) * 44, by = h - 34 + hash(i * 5.3) * 24; box(c, bx, by, 2, 2, '#3A1240'); box(c, bx, by, 1, 1, '#8A4A9A'); }
    for (let i = 0; i < 6; i++) box(c, w / 2 - 18 + i * 7, h - 5, 1, 5, BARK[2]);
  },
  boulder: (c, w, h, v) => {
    // (granite, lit up and left, cracked, lichen on it; or a red sandstone lump)
    const G = v ? SAND : GRAN;
    poly(c, G[2], [2, h, 4, h - 28, 14, h - 46, 34, h - 54, 58, h - 50, 78, h - 40, 92, h - 26, w - 2, h]);
    poly(c, G[3], [5, h - 3, 7, h - 28, 16, h - 43, 34, h - 51, 56, h - 47, 74, h - 37, 86, h - 25, w - 8, h - 3]);
    poly(c, G[4], [8, h - 28, 17, h - 41, 34, h - 48, 52, h - 45, 40, h - 36, 24, h - 30]);
    poly(c, G[5], [14, h - 38, 28, h - 46, 42, h - 45, 30, h - 40]);
    box(c, 20, h - 46, 14, 1, G[6]);
    poly(c, G[1], [60, h - 40, 88, h - 24, w - 6, h - 3, 70, h - 3]);
    line(c, G[1], 1.5, [44, h - 46, 50, h - 30, 46, h - 16]); line(c, G[5], 1, [45, h - 45, 51, h - 30]);
    if (!v) for (let i = 0; i < 7; i++) { const lx = 12 + hash(i * 2.7) * 60, ly = h - 40 + hash(i * 4.1) * 30; box(c, lx, ly, 3, 2, LICHEN[i % 3]); }
    box(c, 4, h - 4, w - 10, 3, G[1]);
  },
  post: (c, w, h) => {
    // (a split cedar fence post, three strands of barbed wire stapled on and running off either side)
    const P = WEATHER;
    box(c, 3, 2, w - 6, h - 2, P[3]); box(c, 3, 2, 3, h - 2, P[5]); box(c, w - 6, 2, 3, h - 2, P[1]);
    poly(c, P[4], [3, 2, w / 2, 0, w - 3, 3]);
    for (let y = 8; y < h - 4; y += 7) box(c, 6 + ((y * 3) % 4), y, 1, 4, P[2]);
    for (const y of [12, 26, 40]) { box(c, 0, y, w, 1, STEEL[4]); box(c, 1, y - 1, 1, 3, STEEL[5]); box(c, w - 2, y - 1, 1, 3, STEEL[5]); box(c, w / 2 - 1, y - 1, 2, 2, STEEL[2]); }
    box(c, 2, h - 3, w - 4, 3, DIRT[2]);
  },
  mailbox: (c, w, h, v) => {
    // (a rural mailbox on a 4x4: dented, the flag up, the house number stenciled on)
    const M = v ? ['#0A0A0C', '#18181C', '#26262C', '#36363E', '#4A4A54', '#646470'] : STEEL;
    box(c, w / 2 - 3, 18, 6, h - 18, PLANK[3]); box(c, w / 2 - 3, 18, 2, h - 18, PLANK[5]); box(c, w / 2 + 1, 18, 2, h - 18, PLANK[1]);
    box(c, w / 2 - 8, 16, 16, 3, PLANK[2]);
    box(c, 3, 5, w - 6, 12, M[3]); ell(c, w / 2, 5, w / 2 - 3, 4, M[3]); box(c, 3, 5, w - 6, 2, M[5]); box(c, 3, 14, w - 6, 3, M[1]);
    box(c, 5, 3, w - 10, 2, M[4]); box(c, 12, 9, 6, 3, M[2]);
    box(c, 4, 7, 2, 9, M[2]); box(c, 4, 7, 1, 9, M[0]);
    digits(c, 40 + v * 37, w / 2 + 3, 8, '#F4F4F0');
    box(c, w - 5, 0, 2, 11, M[2]); box(c, w - 8, 0, 5, 4, '#C81E1E'); box(c, w - 8, 0, 5, 1, '#F06A55');
  },
  hay: (c, w, h) => {
    // (a round bale's face: the straw wound round in steps, loose ends, the net, a shadow under)
    const cx = w / 2, cy = h - 30, r = 29;
    ell(c, cx, cy, r, r, HAYR[2]); ell(c, cx - 1, cy - 1, r - 3, r - 3, HAYR[3]); ell(c, cx - 3, cy - 3, r - 9, r - 9, HAYR[4]); ell(c, cx - 4, cy - 5, r - 17, r - 17, HAYR[5]);
    c.strokeStyle = HAYR[1]; c.lineWidth = 1; c.beginPath();
    for (let a = 0; a < 22; a += 0.3) { const rr = a * 1.28; c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
    c.stroke();
    for (let i = 0; i < 16; i++) { const a = hash(i * 1.7) * Math.PI * 2, rr = 8 + hash(i * 3.3) * 18; box(c, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 3, 1, i % 2 ? HAYR[6] : HAYR[2]); }
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; box(c, cx + Math.cos(a) * (r - 1), cy + Math.sin(a) * (r - 1), 2, 2, HAYR[5]); }
    box(c, cx - r + 4, h - 3, r * 2 - 8, 3, HAYR[1]);
  },
  outhouse: (c, w, h) => {
    // (a weathered board outhouse: its tin roof rusting, the moon cut in the door, the door hanging on one hinge)
    const B = WEATHER;
    poly(c, '#5A3A26', [-1, 14, w / 2, 2, w + 1, 14, w + 1, 18, -1, 18]);
    poly(c, '#8A5A3A', [1, 14, w / 2, 4, w / 2, 8, 2, 16]); for (let x = 4; x < w; x += 6) box(c, x, 9, 1, 8, '#4A2A16');
    box(c, 3, 18, w - 6, h - 18, B[3]);
    for (let x = 3; x < w - 3; x += 7) { box(c, x, 18, 6, h - 18, (x / 7) % 2 ? B[3] : B[4]); box(c, x + 6, 18, 1, h - 18, B[1]); box(c, x, 18, 1, h - 18, B[5]); }
    box(c, 9, 26, w - 18, h - 28, B[2]); box(c, 10, 27, w - 20, h - 30, B[4]);
    for (const y of [32, h - 12]) box(c, 10, y, w - 20, 3, B[2]);
    line(c, B[2], 2.2, [12, 35, w - 12, h - 14]);
    c.fillStyle = '#100A04'; c.beginPath(); c.arc(w / 2, 22 + 18, 6, 0.6, Math.PI * 1.75); c.arc(w / 2 + 3, 22 + 17, 5, Math.PI * 1.6, 0.75, true); c.fill();
    box(c, w - 13, h / 2 + 8, 3, 4, STEEL[5]); box(c, 10, 30, 3, 6, STEEL[2]); box(c, 10, h - 16, 3, 6, STEEL[2]);
    box(c, 0, h - 3, w, 3, DIRT[2]);
  },
  tractor: (c, w, h, v) => {
    // (an old farm tractor parked by the fence: the big rear wheel's chevron lugs, the little front one, the hood, the
    // exhaust stack, the seat, the wheel; green, or red; no brand on it)
    const Bd = R6(v ? '#B81C1C' : '#2E7A2A'), Y = ['#3A2A04', '#7A5A0C', '#B88A14', '#E4B020', '#F8D04A', '#FFE890'];
    const rx = 36, ry = h - 34, R = 33;
    ell(c, rx, ry, R, R, TIRE[2]); ell(c, rx - 2, ry - 2, R - 4, R - 4, TIRE[3]);
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; c.save(); c.translate(rx + Math.cos(a) * (R - 3), ry + Math.sin(a) * (R - 3)); c.rotate(a + 0.6); box(c, -2, -5, 4, 10, TIRE[1]); box(c, -2, -5, 1, 10, TIRE[4]); c.restore(); }
    ell(c, rx, ry, R * 0.55, R * 0.55, Y[3]); ell(c, rx - 2, ry - 2, R * 0.45, R * 0.45, Y[4]); ell(c, rx, ry, R * 0.22, R * 0.22, Y[1]); ell(c, rx - 1, ry - 1, 4, 4, Y[5]);
    const fx = w - 20, fy = h - 17;
    ell(c, fx, fy, 16, 16, TIRE[2]); ell(c, fx - 1, fy - 1, 13, 13, TIRE[3]); ell(c, fx, fy, 8, 8, Y[3]); ell(c, fx - 1, fy - 1, 5, 5, Y[4]); ell(c, fx, fy, 2, 2, Y[1]);
    // (the hood and the engine block, the grille)
    box(c, 54, h - 62, w - 74, 22, Bd[3]); box(c, 54, h - 62, w - 74, 4, Bd[5]); box(c, 54, h - 44, w - 74, 4, Bd[1]);
    for (let x = 60; x < w - 26; x += 9) box(c, x, h - 56, 6, 2, Bd[2]);
    box(c, w - 22, h - 64, 6, 26, Bd[2]); for (let y = h - 62; y < h - 40; y += 3) box(c, w - 21, y, 4, 1, Bd[0]);
    box(c, 56, h - 40, w - 82, 14, '#2A2A2E'); box(c, 56, h - 40, w - 82, 2, '#4A4A52');
    // (the stack, the seat, the steering wheel, the fender over the big wheel)
    box(c, 72, h - 88, 5, 28, '#1C1C1C'); box(c, 72, h - 88, 2, 28, '#4A4A4A'); box(c, 71, h - 90, 7, 3, '#3A3A3A'); box(c, 73, h - 94, 3, 2, '#5A3A1A');
    poly(c, Bd[2], [4, ry - 6, 10, ry - R - 6, rx + 10, ry - R - 10, rx + 30, ry - R + 2, rx + 30, ry - 18, rx + 26, ry - R - 2, rx + 8, ry - R - 4, 12, ry - R]);
    box(c, 26, h - 80, 18, 5, '#202020'); box(c, 30, h - 92, 4, 14, '#202020'); box(c, 26, h - 80, 18, 1, '#4A4A4A');
    line(c, '#1C1C1C', 2, [48, h - 66, 56, h - 84]); line(c, '#1C1C1C', 2, [50, h - 86, 62, h - 82]);
    for (let i = 0; i < 6; i++) box(c, 60 + hash(i) * 50, h - 60 + hash(i * 3) * 16, 3, 2, Bd[1]);
  },
  slow: (c, w, h) => {
    // (SLOW CHILDREN on a galvanized U-channel post: the reflective yellow, a black border, buckshot dents in it)
    box(c, w / 2 - 3, 40, 6, h - 40, STEEL[4]); box(c, w / 2 - 3, 40, 2, h - 40, STEEL[6]); box(c, w / 2 + 1, 40, 2, h - 40, STEEL[2]);
    for (let y = 46; y < h - 6; y += 6) box(c, w / 2 - 1, y, 2, 2, STEEL[1]);
    box(c, 0, 0, w, 44, '#111111'); box(c, 2, 2, w - 4, 40, '#F6CC1C'); box(c, 2, 2, w - 4, 2, '#FFE680'); box(c, 2, 38, w - 4, 4, '#D8A410');
    const L: Letters = { sx: 1, sy: 1, fill: '#111111', bold: true };
    signText(c, 'SLOW', w / 2, 17, { ...L, sx: 2, sy: 2 });
    signText(c, 'CHILDREN', w / 2, 34, L);
    for (const [bx, by] of [[9, 8], [w - 12, 12], [w - 18, 30], [14, 28]]) { box(c, bx, by, 2, 2, '#5A4410'); box(c, bx, by, 1, 1, '#2A2008'); }
    box(c, w / 2 - 2, 4, 4, 3, STEEL[5]); box(c, w / 2 - 2, 36, 4, 3, STEEL[5]);
  },
  sign: (c, w, h, _v, words) => {
    const text = words ?? '';
    // (two 4x4 posts, lit down one side)
    for (const px of [w * 0.2, w * 0.74]) { box(c, px, 60, 10, h - 60, PLANK[3]); box(c, px, 60, 3, h - 60, PLANK[5]); box(c, px + 7, 60, 3, h - 60, PLANK[1]); box(c, px - 2, h - 4, 14, 4, DIRT[2]); }
    if (text === 'CREEK') {
      // (a yellow diamond on its posts: CREEK over the water's waves)
      const cx = w / 2, cy = 66, r = 62;
      poly(c, '#111111', [cx, cy - r, cx + r, cy, cx, cy + r, cx - r, cy]);
      poly(c, '#F6CC1C', [cx, cy - r + 5, cx + r - 5, cy, cx, cy + r - 5, cx - r + 5, cy]);
      poly(c, '#FFE680', [cx, cy - r + 5, cx - r + 5, cy, cx - r + 9, cy, cx, cy - r + 9]);
      signText(c, 'CREEK', cx, cy - 4, { sx: 3, sy: 3, fill: '#111111', bold: true });
      for (let k = 0; k < 2; k++) { c.strokeStyle = '#111111'; c.lineWidth = 3; c.beginPath(); for (let x = -26; x <= 26; x += 2) c.lineTo(cx + x, cy + 14 + k * 9 + Math.sin(x * 0.3) * 3); c.stroke(); }
      return;
    }
    // (a county's brown sign, the letters routed in and painted cream: real-world, not the park's)
    box(c, 2, 4, w - 4, 62, '#2A1A0E'); box(c, 4, 6, w - 8, 58, '#6B4423'); box(c, 4, 6, w - 8, 3, '#8A5A30'); box(c, 4, 60, w - 8, 4, '#4E3018');
    for (let gy = 12; gy < 58; gy += 5) box(c, 8 + hash(gy) * 30, gy, w * 0.4, 1, '#5E3A1E');
    c.strokeStyle = '#F4EAD0'; c.lineWidth = 2; c.strokeRect(9, 11, w - 18, 48);
    const big: Letters = { sx: 3, sy: 3, fill: ['#FFF8E6', '#F4EAD0', '#F4EAD0', '#C8B890'], shadow: '#2A1A0E' };
    const small: Letters = { sx: 2, sy: 2, fill: ['#FFF8E6', '#F4EAD0', '#F4EAD0', '#C8B890'], shadow: '#2A1A0E' };
    const look = signW(text, big) > w - 30 ? small : big;
    signText(c, text, w / 2, 44, look);
    for (const nx of [10, w - 13]) { box(c, nx, 8, 3, 3, STEEL[2]); box(c, nx, 56, 3, 3, STEEL[2]); }
  },
  cow: (c, w, h, v) => {
    // (side on, facing right: the hide stepped, its patches, the udder, the yellow ear tag, chewing)
    const [H, S, face] = COW_HIDES[v];
    for (const [x, d] of [[14, 0], [24, 1], [w - 26, 0], [w - 16, 1]] as const) { box(c, x, h - 17, 5, 17, d ? H[2] : H[3]); box(c, x, h - 4, 5, 4, '#2A1E14'); }
    poly(c, H[3], [8, h - 44, w - 26, h - 46, w - 18, h - 38, w - 20, h - 16, 10, h - 16, 4, h - 30]);
    box(c, 10, h - 44, w - 38, 4, H[4]); box(c, 10, h - 22, w - 30, 6, H[2]); box(c, 8, h - 40, 4, 18, H[2]);
    if (S) { ell(c, 24, h - 34, 9, 7, S[2]); ell(c, 44, h - 28, 8, 8, S[2]); ell(c, 36, h - 40, 6, 3, S[2]); ell(c, 23, h - 36, 4, 2, S[3]); }
    ell(c, 32, h - 15, 6, 4, '#E89AA6'); box(c, 29, h - 13, 2, 3, '#D07080'); box(c, 34, h - 13, 2, 3, '#D07080');
    line(c, H[1], 2, [6, h - 40, 2, h - 24]); ell(c, 2, h - 22, 2, 3, S ? S[2] : H[1]);
    // (the head down a little, the muzzle, an eye, the ears, the tag)
    poly(c, face ? (S as string[])[2] : H[3], [w - 26, h - 46, w - 6, h - 42, w - 1, h - 28, w - 9, h - 24, w - 20, h - 32]);
    ell(c, w - 5, h - 27, 5, 4, '#E8A0AC'); box(c, w - 6, h - 28, 2, 2, '#5A2A2A');
    box(c, w - 13, h - 39, 3, 3, '#0A0A0A'); box(c, w - 13, h - 39, 1, 1, '#FFFFFF');
    poly(c, H[2], [w - 22, h - 46, w - 30, h - 52, w - 20, h - 48]); box(c, w - 28, h - 50, 4, 3, '#F2C21C');
    box(c, w - 14, h - 48, 4, 3, '#E8E2D4');
  },
  deadcow: (c, w, h, v) => {
    // (on its back, legs straight up and stiff, the tongue out, an X for an eye, a puddle)
    const [H, S] = COW_HIDES[v];
    ell(c, w / 2, h - 3, w / 2 - 2, 4, '#6A0A0A'); ell(c, w / 2 - 6, h - 4, w / 3, 2.5, '#8A1010');
    poly(c, H[3], [8, h - 6, 10, h - 22, w - 24, h - 24, w - 18, h - 6]); box(c, 10, h - 22, w - 34, 3, H[4]);
    if (S) { ell(c, 24, h - 14, 8, 5, S[2]); ell(c, 44, h - 16, 6, 5, S[2]); }
    for (const x of [14, 22, w - 30, w - 22]) { box(c, x, h - 40, 4, 18, H[3]); box(c, x, h - 44, 4, 4, '#2A1E14'); }
    ell(c, 30, h - 25, 6, 4, '#E89AA6');
    poly(c, H[3], [w - 22, h - 20, w - 4, h - 18, w - 2, h - 6, w - 20, h - 6]);
    line(c, INK, 1.2, [w - 14, h - 16, w - 10, h - 12]); line(c, INK, 1.2, [w - 10, h - 16, w - 14, h - 12]);
    box(c, w - 3, h - 10, 5, 3, '#E87890');
  },
  deer: (c, w, h, v) => {
    // (a mule deer, side on: the big ears, the white rump, the black-tipped tail; the buck's antlers forked twice)
    const D = DEER;
    for (const [x, d] of [[12, 0], [19, 1], [w - 22, 0], [w - 16, 1]] as const) { box(c, x, h - 20, 3, 20, d ? D[2] : D[3]); box(c, x, h - 3, 3, 3, '#1A120A'); }
    poly(c, D[3], [6, h - 38, w - 24, h - 40, w - 18, h - 32, w - 20, h - 20, 10, h - 20, 4, h - 30]);
    box(c, 8, h - 38, w - 34, 3, D[4]); box(c, 10, h - 24, w - 32, 4, D[5]); box(c, 8, h - 34, 3, 12, D[2]);
    ell(c, 7, h - 32, 5, 6, '#F4F0E6'); box(c, 2, h - 36, 3, 6, '#F4F0E6'); box(c, 2, h - 31, 3, 3, '#141414');
    poly(c, D[3], [w - 26, h - 38, w - 18, h - 56, w - 12, h - 56, w - 16, h - 36]);
    poly(c, D[3], [w - 18, h - 58, w - 4, h - 54, w - 1, h - 48, w - 12, h - 48]); box(c, w - 3, h - 51, 3, 3, '#141414');
    box(c, w - 12, h - 56, 2, 2, '#0A0A0A'); box(c, w - 8, h - 49, 6, 2, D[5]);
    poly(c, D[2], [w - 18, h - 58, w - 26, h - 66, w - 15, h - 60]); poly(c, D[4], [w - 19, h - 59, w - 24, h - 64, w - 17, h - 60]);
    if (v) {
      const A = '#E8DCC0';
      line(c, A, 2, [w - 14, h - 58, w - 18, h - 68, w - 24, h - 74]); line(c, A, 2, [w - 18, h - 68, w - 14, h - 76]);
      line(c, A, 2, [w - 10, h - 58, w - 8, h - 68, w - 2, h - 72]); line(c, A, 2, [w - 8, h - 68, w - 10, h - 76]);
    }
  },
  deaddeer: (c, w, h, v) => {
    const D = DEER;
    ell(c, w / 2, h - 3, w / 2 - 2, 4, '#6A0A0A'); ell(c, w / 2 - 6, h - 4, w / 3, 2.5, '#8A1010');
    poly(c, D[3], [8, h - 6, 8, h - 20, w - 22, h - 22, w - 18, h - 6]); box(c, 10, h - 20, w - 32, 3, D[4]); box(c, 10, h - 9, w - 30, 3, D[5]);
    for (const x of [14, 20, w - 28, w - 22]) { box(c, x, h - 34, 3, 14, D[3]); box(c, x, h - 36, 3, 2, '#1A120A'); }
    poly(c, D[3], [w - 20, h - 18, w - 4, h - 16, w - 2, h - 6, w - 18, h - 6]);
    line(c, INK, 1.2, [w - 12, h - 15, w - 8, h - 11]); line(c, INK, 1.2, [w - 8, h - 15, w - 12, h - 11]);
    box(c, w - 3, h - 9, 4, 2, '#E87890');
    if (v) { line(c, '#E8DCC0', 2, [w - 6, h - 16, w + 0, h - 24]); line(c, '#E8DCC0', 2, [w - 3, h - 20, w - 8, h - 26]); }
  },
  pylon: (c, w, h) => {
    // (a steel lattice transmission tower: the legs splayed, the cross-bracing in steps, the arms, the insulator
    // strings hanging; galvanized, lit down one side)
    const S = STEEL, cx = w / 2;
    const legX = (y: number, s: number) => cx + s * (6 + (w / 2 - 8) * Math.pow(Math.max(0, (y - 30) / (h - 30)), 1.4));
    for (const s of [-1, 1]) { c.strokeStyle = s < 0 ? S[5] : S[2]; c.lineWidth = 3; c.beginPath(); for (let y = 30; y <= h; y += 10) c.lineTo(legX(y, s), y); c.stroke(); }
    c.strokeStyle = S[3]; c.lineWidth = 1.4; c.beginPath();
    for (let y = 40; y < h; y += 22) { c.moveTo(legX(y, -1), y); c.lineTo(legX(y + 22, 1), y + 22); c.moveTo(legX(y, 1), y); c.lineTo(legX(y + 22, -1), y + 22); c.moveTo(legX(y, -1), y); c.lineTo(legX(y, 1), y); }
    c.stroke();
    // (the waist, the arms, the peak)
    for (const [ay, aw] of [[34, w / 2 - 2], [64, w / 2 - 12]] as const) {
      box(c, cx - aw, ay, aw * 2, 4, S[3]); box(c, cx - aw, ay, aw * 2, 1, S[5]);
      line(c, S[2], 1.2, [cx - aw, ay + 4, cx - 6, ay + 16, cx + 6, ay + 16, cx + aw, ay + 4]);
      for (const ix of [cx - aw + 3, cx + aw - 3]) { box(c, ix - 1, ay + 4, 3, 14, '#5A7A86'); for (let k = 0; k < 4; k++) box(c, ix - 2, ay + 6 + k * 3, 5, 2, '#8AB0BC'); }
    }
    poly(c, S[3], [cx - 7, 34, cx, 4, cx + 7, 34]); poly(c, S[5], [cx - 6, 34, cx, 6, cx - 1, 34]);
    box(c, cx - 1, 0, 2, 6, S[4]);
    // (the footings: concrete)
    for (const s of [-1, 1]) box(c, legX(h, s) - 5, h - 5, 10, 5, '#8A8680');
  },
  pole: (c, w, h) => {
    // (a creosoted pole: checked with age, step bolts, a crossarm with glass insulators, a transformer can)
    const P = POLE, cx = w / 2;
    box(c, cx - 3, 0, 6, h, P[3]); box(c, cx - 3, 0, 2, h, P[5]); box(c, cx + 2, 0, 1, h, P[1]);
    for (let y = 30; y < h - 10; y += 9) box(c, cx - 1 + ((y * 7) & 1), y, 1, 5, P[2]);
    box(c, 0, 10, w, 3, '#5A3E26'); box(c, 0, 10, w, 1, '#7A5634');
    box(c, 0, 5, 2, 5, '#3A8A86'); box(c, 0, 5, 1, 5, '#7ED0C4'); box(c, w - 2, 5, 2, 5, '#3A8A86');
    box(c, cx, 24, 5, 12, STEEL[4]); box(c, cx, 24, 2, 12, STEEL[6]);
    for (let y = 60; y < h - 30; y += 24) box(c, y % 48 ? cx + 3 : cx - 5, y, 2, 1, STEEL[5]);
  },
  barn: (c, w, h) => {
    // (a red gambrel barn: board-and-batten in steps, white trim, the X doors, the hay loft door and its hood, a tin
    // roof gone to rust in streaks, a weathervane)
    const B = BARN, T = TRIM, cx = w / 2, eave = 58;
    poly(c, '#4A4A50', [-2, eave + 4, 22, 26, cx, 2, w - 22, 26, w + 2, eave + 4]);
    poly(c, '#6A6A72', [2, eave, 24, 28, cx, 6, cx, 10, 26, 32, 6, eave]);
    for (let x = 4; x < w - 4; x += 8) line(c, '#3A3A40', 1, [x, eave + 2, x + (cx - x) * 0.18, 10 + Math.abs(x - cx) * 0.4]);
    for (let i = 0; i < 9; i++) { const rx = 20 + hash(i * 3.3) * (w - 40); box(c, rx, 20 + Math.abs(rx - cx) * 0.3, 2, 10 + hash(i) * 14, '#8A4A22'); }
    box(c, 6, eave, w - 12, h - eave, B[3]);
    for (let x = 6; x < w - 6; x += 9) { box(c, x, eave, 2, h - eave, B[5]); box(c, x + 7, eave, 2, h - eave, B[1]); }
    box(c, 6, eave, w - 12, 3, B[1]);
    box(c, 6, h - 4, w - 12, 4, B[0]);
    // (the trim: corners, the doors' X, the loft door)
    box(c, 6, eave, 4, h - eave, T[4]); box(c, w - 10, eave, 4, h - eave, T[3]);
    const dx = cx - 34, dy = h - 74;
    box(c, dx, dy, 68, 74, B[2]); box(c, dx, dy, 68, 4, T[4]); box(c, dx, dy, 4, 74, T[4]); box(c, dx + 64, dy, 4, 74, T[3]); box(c, cx - 1, dy, 2, 74, T[3]);
    line(c, T[4], 3, [dx + 2, dy + 2, cx, h, dx + 2, h, cx, dy + 2]); line(c, T[3], 3, [cx, dy + 2, dx + 66, h, cx, h, dx + 66, dy + 2]);
    box(c, cx - 12, 30, 24, 22, B[1]); box(c, cx - 12, 30, 24, 2, T[4]); box(c, cx - 12, 30, 2, 22, T[4]); box(c, cx + 10, 30, 2, 22, T[3]); box(c, cx - 12, 50, 24, 2, T[3]);
    for (let y = 34; y < 50; y += 4) box(c, cx - 9, y, 18, 2, '#C8A440');
    box(c, cx - 1, 0, 2, 8, '#2A2A2A'); poly(c, '#2A2A2A', [cx - 8, 1, cx + 6, 1, cx + 8, 3, cx - 8, 3]);
  },
  house: (c, w, h) => {
    // (the farmhouse: white clapboard in steps, a gable, a porch on posts, two windows with the sky in them, a brick
    // chimney, a satellite dish)
    const T = TRIM, cx = w / 2;
    poly(c, '#2E2E36', [-2, 52, cx, 2, w + 2, 52]); poly(c, '#46464E', [2, 50, cx, 6, cx, 10, 6, 50]);
    for (let y = 14; y < 50; y += 5) box(c, cx - (y - 4) + 4, y, (y - 4) * 2 - 8, 1, '#24242A');
    box(c, w - 46, 4, 14, 30, '#7A3A2A'); box(c, w - 46, 4, 14, 2, '#9A5A40'); for (let y = 8; y < 34; y += 4) box(c, w - 46 + ((y / 4) % 2) * 4, y, 6, 1, '#5A2A1E');
    box(c, 10, 50, w - 20, h - 50, T[4]);
    for (let y = 54; y < h; y += 5) { box(c, 10, y, w - 20, 1, T[2]); box(c, 10, y + 1, w - 20, 1, T[5]); }
    for (const x of [24, w - 56]) { box(c, x, 64, 30, 28, T[1]); box(c, x + 2, 66, 26, 24, '#3A5A82'); box(c, x + 2, 66, 26, 8, '#7AA0C8'); box(c, x + 2, 66, 10, 3, '#B8D4EC'); box(c, x + 14, 66, 2, 24, T[4]); box(c, x + 2, 77, 26, 2, T[4]); box(c, x - 2, 92, 34, 3, T[5]); }
    // (the porch: its roof, posts, steps, the door)
    poly(c, '#3A3A42', [cx - 36, h - 50, cx + 36, h - 50, cx + 40, h - 44, cx - 40, h - 44]);
    for (const px of [cx - 34, cx - 12, cx + 10, cx + 32]) box(c, px, h - 44, 3, 40, T[5]);
    box(c, cx - 11, h - 42, 22, 38, '#6A2E22'); box(c, cx - 11, h - 42, 22, 2, '#8A4A34'); box(c, cx + 6, h - 24, 2, 2, '#E4B020');
    box(c, cx - 40, h - 6, 80, 3, T[3]); box(c, cx - 40, h - 3, 80, 3, T[2]);
    ell(c, 22, 48, 7, 5, '#C8C8C8'); box(c, 22, 48, 2, 6, '#888888');
  },
  reeds: (c, w, h) => {
    // (cattails and sedge at the water's edge)
    for (let i = 0; i < 11; i++) {
      const x = 4 + i * 6, lean = (i - 5) * 0.8, top = 8 + (i % 4) * 6;
      line(c, i % 2 ? GRASS[3] : GRASS[5], 2, [x, h, x + lean, top]);
      if (i % 3 === 0) { box(c, x + lean - 2, top - 2, 4, 10, '#4A2A12'); box(c, x + lean - 2, top - 2, 1, 10, '#7A4A22'); box(c, x + lean, top - 6, 1, 4, GRASS[4]); }
    }
    for (let i = 0; i < 8; i++) line(c, GRASS[2], 1.5, [6 + i * 9, h, 2 + i * 9 + (i % 2 ? 6 : -4), h - 18]);
  },
  rock: (c, w, h) => {
    // (a rock in the road: granite, lit along its top)
    poly(c, GRAN[2], [1, h, 4, 8, 16, 2, 40, 0, 60, 4, w - 4, 12, w - 1, h]);
    poly(c, GRAN[4], [5, h - 2, 7, 9, 17, 4, 38, 2, 34, 12, 14, 18]);
    box(c, 18, 3, 18, 1, GRAN[6]); box(c, 46, 6, 14, 2, GRAN[3]);
    box(c, 2, h - 3, w - 4, 3, GRAN[1]);
  },
  log: (c, w, h) => {
    // (a fallen fir across the road: bark plates in steps, moss along its top, branch stubs, both cut ends ringed)
    const B = BARK;
    box(c, 8, 1, w - 16, h - 2, B[3]); box(c, 8, 1, w - 16, 4, B[5]); box(c, 8, h - 6, w - 16, 4, B[1]);
    for (let x = 14; x < w - 14; x += 9) { box(c, x, 6 + ((x * 3) % 6), 7, 2, B[2]); box(c, x + 2, 5 + ((x * 3) % 6), 3, 1, B[6]); }
    for (let x = 20; x < w - 20; x += 13) box(c, x, 0, 6 + ((x * 7) % 5), 2, x % 3 ? '#4A6A24' : '#6C8A30');
    for (const sx of [80, 210, 340]) { box(c, sx, -2, 5, 6, B[2]); box(c, sx, -2, 2, 6, B[5]); }
    for (const ex of [8, w - 8]) {
      ell(c, ex, h / 2, 7, h / 2, B[1]);
      ell(c, ex, h / 2, 5, h / 2 - 2, RINGS[3]); ell(c, ex, h / 2, 3.5, h / 2 - 5, RINGS[4]); ell(c, ex, h / 2, 2, h / 2 - 8, RINGS[2]); box(c, ex - 1, h / 2 - 1, 2, 2, RINGS[1]);
    }
  },
  stump: (c, w, h) => {
    // (a stump: the chainsaw's cut ringed, the back cut stepped, the bark)
    box(c, 6, 6, w - 12, h - 6, BARK[3]); box(c, 6, 6, 4, h - 6, BARK[5]); box(c, w - 10, 6, 4, h - 6, BARK[1]);
    for (let x = 10; x < w - 10; x += 6) box(c, x, 10, 2, h - 12, BARK[2]);
    poly(c, BARK[2], [2, h, 8, h - 8, 14, h]); poly(c, BARK[2], [w - 14, h, w - 8, h - 9, w - 2, h]);
    ell(c, w / 2, 6, w / 2 - 6, 5, RINGS[3]); ell(c, w / 2, 6, w / 2 - 12, 3.5, RINGS[4]); ell(c, w / 2, 6, w / 2 - 20, 2, RINGS[2]); box(c, w / 2 - 1, 5, 2, 2, RINGS[1]);
    box(c, 10, 6, w - 20, 1, RINGS[5]);
  },
  health: (c, w, h) => {
    // (a first-aid kit somebody dropped: a white steel box, the red cross, the latch, the handle)
    box(c, 3, 12, w - 6, h - 12, '#C8CCD2'); box(c, 4, 13, w - 8, h - 15, '#F4F4F6'); box(c, 4, 13, w - 8, 3, '#FFFFFF'); box(c, 4, h - 6, w - 8, 3, '#A8ACB4');
    box(c, w / 2 - 5, 18, 10, h - 28, '#C81E1E'); box(c, w / 2 - 15, h / 2 - 2, 30, 10, '#C81E1E'); box(c, w / 2 - 5, 18, 3, h - 28, '#F06A55'); box(c, w / 2 - 15, h / 2 - 2, 30, 2, '#F06A55');
    box(c, w / 2 - 9, 3, 18, 3, '#3A3A40'); box(c, w / 2 - 9, 3, 3, 10, '#3A3A40'); box(c, w / 2 + 6, 3, 3, 10, '#3A3A40'); box(c, w / 2 - 9, 3, 18, 1, '#7A7A84');
    box(c, w / 2 - 3, 12, 6, 4, '#8A8A94');
  },
  scorch: () => undefined,
  gore: () => undefined,
};

/** The roadside's frames: base look by look (kind, look, words), then by bucket and fog step. Never thrown away
 *  (a small set); looked up through the thing itself, so the road loop builds no keys. */
const FOGN = 4;
const BASES = new Map<string, (Sprite | undefined)[]>();
const MEMO = new WeakMap<object, { k: SprKind; seed: number; arr: (Sprite | undefined)[] }>();
const variantOf = (k: SprKind, seed: number) => ((VARIANTS[k] ?? 1) > 1 ? Math.abs(seed) % (VARIANTS[k] ?? 1) : 0);
const framesOf = (owner: object, k: SprKind, seed: number, words?: string) => {
  const m = MEMO.get(owner);
  if (m && m.k === k && m.seed === seed) return m.arr;
  const key = k + variantOf(k, seed) + (words ?? '');
  let arr = BASES.get(key);
  if (!arr) { arr = []; BASES.set(key, arr); }
  MEMO.set(owner, { k, seed, arr });
  return arr;
};
const FOG_K = [0, 0.22, 0.42, 0.6];

/** A roadside thing at screen (sx, sy) (its feet), at slot scale sc, cropped at the clip line, fogged `fog` steps
 *  (0..3). `flip` mirrors it. `owner`: the thing (its frames are found through it). */
export const drawSpr = (c: Ctx, k: SprKind, seed: number, sx: number, sy: number, sc: number, clip: number, words?: string, flip = false, fog = 0, owner?: object) => {
  const d = SPR[k], res = resOf(k);
  const dw = d.w * sc * 200, dh = d.h * sc * 200;
  if (dw < 0.6 || dh < 0.6) return;
  const bw = d.w / res, bh = d.h / res;
  const kq = bucketOf(dh / bh, 1), bi = KS.indexOf(kq), fq = kq <= 0.375 ? Math.min(FOGN - 1, fog) : 0;
  const arr = framesOf(owner ?? SPR[k], k, seed, words), slot = bi * FOGN + fq;
  let sp = arr[slot];
  if (!sp) {
    const v = variantOf(k, seed);
    sp = makeSprite(kq, 0, 0, bw, bh, g => painters[k](g, bw, bh, v, words), FOG_K[fq]);
    arr[slot] = sp;
  }
  // (its feet at sy: the frame's box scaled to the shown size; under the crest cut off)
  const r = dw / (bw * kq);
  let x = Math.round(sx - (bw * kq / 2 + sp.ox) * r);
  const y = Math.round(sy - (bh * kq + sp.oy) * r), fw = Math.round(sp.cv.width * r), fh = Math.round(sp.cv.height * r);
  let hh = fh, srcH = sp.cv.height;
  if (y + fh > clip) { const over = y + fh - clip; if (over >= fh) return; hh = fh - over; srcH = Math.max(1, sp.cv.height * (hh / fh)); }
  if (flip) { c.save(); c.translate(Math.round(sx), 0); c.scale(-1, 1); x = -Math.round((bw * kq / 2 + sp.ox) * r); c.drawImage(sp.cv, 0, 0, sp.cv.width, srcH, x, y, fw, hh); c.restore(); }
  else c.drawImage(sp.cv, 0, 0, sp.cv.width, srcH, x, y, fw, hh);
};

// ---------------------------------------------------------------------------------------------------------------
// Bikes from behind

/** A dirt bike from behind (art units, ground point at the origin): the rear knobby, its lugs going round, the swingarm
 *  and the shock's spring, the fender up over it, the side panels and their numbers edge-on, the silencer out the right,
 *  the ribbed seat, the pegs. `spin` turns the tread (2 beats). */
export const rearBike = (c: Ctx, color: string, spin: number, wreck = false) => {
  const B = R6(color), Al = ['#3A3E44', '#5A6068', '#80868E', '#A8AEB6', '#CCD2D8', '#F0F4F8'];
  // (the tire: rounded, the lugs stepping round, mud in them)
  box(c, -8, -24, 16, 24, TIRE[2]); box(c, -7, -25, 14, 1, TIRE[2]); box(c, -8, -24, 3, 24, TIRE[3]); box(c, 5, -24, 3, 24, TIRE[1]);
  const o = (Math.floor(spin) & 1) * 2;
  for (let y = -23 + o; y < -1; y += 4) { box(c, -10, y, 3, 2, TIRE[3]); box(c, 7, y + 2, 3, 2, TIRE[1]); box(c, -4, y, 3, 2, TIRE[4]); box(c, 1, y + 2, 3, 2, TIRE[4]); }
  box(c, -6, -3, 12, 3, '#3A2A1A'); box(c, -5, -24, 4, 2, '#5A4430');
  // (the swingarm and the chain guard, the shock's spring under the seat)
  box(c, -12, -27, 24, 3, Al[3]); box(c, -12, -27, 24, 1, Al[5]); box(c, -12, -25, 24, 1, Al[1]);
  box(c, -2, -38, 4, 11, '#C88A14'); for (let y = -37; y < -28; y += 2) box(c, -2, y, 4, 1, '#F2C84A');
  // (the silencer out the right, its end cap and its soot)
  box(c, 8, -42, 7, 13, Al[3]); box(c, 8, -42, 2, 13, Al[5]); box(c, 13, -42, 2, 13, Al[1]); ell(c, 11.5, -35, 2.4, 2.4, '#141414'); box(c, 10, -36, 1, 1, '#4A4A4A');
  // (the side panels flaring out, the white number plates edge-on, the rear fender up over the wheel)
  poly(c, B[2], [-15, -42, 15, -42, 12, -31, -12, -31]); box(c, -15, -42, 30, 2, B[4]); box(c, -12, -33, 24, 2, B[1]);
  box(c, -15, -41, 3, 9, '#F4F4F0'); box(c, 12, -41, 3, 9, '#D8D8D0');
  poly(c, wreck ? B[1] : B[3], [-6, -47, 6, -47, 9, -29, -9, -29]); box(c, -5, -46, 3, 16, wreck ? B[2] : B[5]); box(c, 4, -46, 3, 16, B[1]);
  box(c, -4, -34, 8, 3, '#18181B'); box(c, -3, -33, 6, 1, '#DC2626');
  box(c, -5, -40, 3, 2, '#6A4A2A'); box(c, 2, -37, 2, 2, '#6A4A2A');
  // (the seat on top, ribbed)
  box(c, -7, -50, 14, 4, '#18181B'); for (let x = -6; x < 7; x += 3) box(c, x, -50, 1, 4, '#2E2E36'); box(c, -7, -50, 14, 1, '#4A4A54');
  // (the pegs)
  box(c, -19, -21, 7, 2, Al[2]); box(c, 12, -21, 7, 2, Al[2]); box(c, -19, -21, 7, 1, Al[4]); box(c, 12, -21, 7, 1, Al[4]);
};
/** The bars, wide, the grips, the levers (drawn over the rider's hands). */
export const rearBars = (c: Ctx, y = -58) => {
  line(c, '#3F3F46', 2.4, [-22, y, -8, y + 3, 8, y + 3, 22, y]); line(c, '#9CA3AF', 1, [-21, y - 0.6, -8, y + 2.2]);
  box(c, -25, y - 2, 6, 4, '#18181B'); box(c, 19, y - 2, 6, 4, '#18181B'); box(c, -25, y - 2, 6, 1, '#3F3F46'); box(c, 19, y - 2, 6, 1, '#3F3F46');
  box(c, -3, y + 1, 6, 3, '#18181B');
};

// ---------------------------------------------------------------------------------------------------------------
// The teens' weapons

export type Weapon = 'chain' | 'bat' | 'crowbar' | 'nunchucks' | 'hockey' | 'skateboard';
/** A weapon in a fist at (x, y), pointing along `a` (radians, 0 = right), `flash` white, `ph` its swing's beat (0..3). */
const paintWeapon = (c: Ctx, w: Weapon, x: number, y: number, a: number, flash: boolean, ph: number) => {
  c.save(); c.translate(x, y); c.rotate(a);
  const Wt = flash ? '#FFFFFF' : null;
  switch (w) {
    case 'chain': {
      // (a greasy bike chain: links in a sagging arc, alternately lit)
      const sag = 4 + OSC[ph] * 2;
      for (let i = 0; i < 10; i++) { const t = i / 9, px = t * 28, py = Math.sin(t * Math.PI) * sag; box(c, px - 2, py - 1.5, 4, 3, Wt ?? '#3F3F46'); box(c, px - 1, py - 1, 2, 2, Wt ?? (i % 2 ? '#A1A1AA' : '#D4D4D8')); }
      break;
    }
    case 'bat':
      // (aluminum: the barrel lit along its top, a sticker, grip tape, the knob)
      poly(c, Wt ?? '#9CA3AF', [0, -2, 26, -3.6, 28, 0, 26, 3.6, 0, 2]); box(c, 4, -2, 22, 1.4, Wt ?? '#E5E7EB'); box(c, 4, 1, 22, 1.2, Wt ?? '#6B7280');
      box(c, 15, -2.6, 5, 4.8, Wt ?? '#DC2626'); box(c, -4, -2, 8, 4, Wt ?? '#18181B'); box(c, -3, -1.5, 1, 3, '#3F3F46'); box(c, -6, -3, 2, 6, Wt ?? '#18181B');
      break;
    case 'crowbar':
      line(c, Wt ?? '#7F1D1D', 3.2, [0, 0, 22, 0, 26, -4, 24, -7]); line(c, Wt ?? '#DC2626', 1.4, [0, -0.6, 22, -0.6, 25.4, -4]);
      line(c, Wt ?? '#18181B', 3.2, [0, 0, -4, 1, -6, 4]);
      break;
    case 'nunchucks': {
      box(c, -1, -2, 12, 4, Wt ?? '#4A2E16'); box(c, -1, -2, 12, 1, Wt ?? '#8A5A30');
      const sw = OSC[ph] * 0.8;
      line(c, '#A1A1AA', 1, [11, 0, 15, Math.sin(sw) * 3]);
      c.save(); c.translate(15, Math.sin(sw) * 3); c.rotate(sw); box(c, 0, -2, 12, 4, Wt ?? '#4A2E16'); box(c, 0, -2, 12, 1, Wt ?? '#8A5A30'); c.restore();
      break;
    }
    case 'hockey':
      // (wood: the shaft, black tape round the blade)
      line(c, Wt ?? '#A0763E', 3, [0, 0, 26, 0, 28, 5, 37, 6]); line(c, Wt ?? '#E0B67A', 1, [0, -0.8, 25, -0.8]);
      line(c, Wt ?? '#18181B', 3, [28, 5, 36, 6]); box(c, -2, -1.5, 5, 3, '#F5F5F4');
      break;
    case 'skateboard':
      // (the deck from under: its graphic in steps, the trucks, four wheels)
      poly(c, Wt ?? '#4C1D95', [0, -4, 28, -4, 31, 0, 28, 4, 0, 4, -3, 0]); poly(c, Wt ?? '#7C3AED', [1, -3, 27, -3, 29, 0, 27, 2, 1, 2, -1, 0]);
      box(c, 10, -2, 8, 3, Wt ?? '#FACC15'); box(c, 12, -1, 4, 1, Wt ?? '#DC2626');
      box(c, 4, 4, 3, 2, '#D4D4D8'); box(c, 21, 4, 3, 2, '#D4D4D8'); box(c, 3, 5, 2, 2, '#F5F5F4'); box(c, 7, 5, 2, 2, '#F5F5F4'); box(c, 20, 5, 2, 2, '#F5F5F4'); box(c, 24, 5, 2, 2, '#F5F5F4');
      break;
  }
  c.restore();
};

/** A weapon on its own (in his fist through a parry), cached by angle (32 steps), at (x, y) shown at s. */
export const drawWeapon = (c: Ctx, w: Weapon, x: number, y: number, a: number, flash: boolean, f: number, s = 1) => {
  const n = ((Math.round((a / (Math.PI * 2)) * 32) % 32) + 32) % 32, aq = n * (Math.PI / 16), ph = (f >> 2) & 3, k = bucketOf(s);
  const anim = w === 'chain' || w === 'nunchucks' ? ph : 0;
  const sp = frame(`w${w}${n}${flash ? 1 : 0}${anim}|${k}`, k, -46, -46, 92, 92, g => paintWeapon(g, w, 0, 0, aq, flash, anim));
  blit(c, sp, x, y, s);
};

// ---------------------------------------------------------------------------------------------------------------
// A teen from behind, on their bike

/** (the woods' kids' jerseys and caps: the same seeds give the same kid's gear) */
const JERSEYS = ['#1E3A8A', '#B91C1C', '#111827', '#F97316', '#0F766E', '#7C3AED', '#E5E7EB', '#65A30D'];
const CAPS = ['#1F2937', '#B91C1C', '#1D4ED8', '#166534', '#F5F5F4', '#9A3412'];
const MOTO_PANTS = ['#18181B', '#1E3A8A', '#E5E7EB', '#7F1D1D'];
export interface TeenLook extends Teen {
  look: Look; bike: string; heavy: boolean; pony: boolean;
  /** No helmet: a ball cap on backwards (0), a beanie (1), or just their hair (2); its color. */
  gear: number; cap: string;
  /** The number on their jersey's back (helmeted kids). */
  num: number;
}
const TEEN_HAIR = ['#1F1611', '#4A2E1A', '#A16207', '#F5D27A', '#7F1D1D', '#111827', '#E8C070'];
export const teenLookOf = (seed: number): TeenLook => {
  const t = teenOf(seed), look = lookOf(seed, t.woman);
  const shirt = t.helmet ? JERSEYS[((Math.floor(t.seed / 2) % JERSEYS.length) + JERSEYS.length) % JERSEYS.length] : look.shirt;
  const pants = t.helmet ? MOTO_PANTS[((Math.floor(t.seed / 11) % MOTO_PANTS.length) + MOTO_PANTS.length) % MOTO_PANTS.length] : look.pants;
  return {
    ...t, look: { ...look, shirt, pants, hair: TEEN_HAIR[((Math.floor(seed / 7) % TEEN_HAIR.length) + TEEN_HAIR.length) % TEEN_HAIR.length], kid: true, bald: false },
    bike: bikeColor(seed), heavy: look.heavy, pony: t.woman && Math.floor(seed / 13) % 2 === 0,
    gear: Math.floor(t.seed / 5) % 3, cap: CAPS[((Math.floor(t.seed / 7) % CAPS.length) + CAPS.length) % CAPS.length], num: 2 + (Math.abs(t.seed * 13) % 97),
  };
};

export interface RiderPose {
  /** Leaning into a bend (radians). */
  lean: number;
  /** Which side their weapon's on (-1 left, 1 right), and how it's held: down, wound up (the tell), swung out. */
  side: number; arm: 'idle' | 'wind' | 'swing' | 'none';
  /** The tell: flashing white. */
  flash: boolean;
  /** Turned to look at him (-1 left, 0 ahead, 1 right). */
  look: number;
  /** Hit just now: a white flash over the lot. */
  hit: boolean;
  spin: number;
  /** Punched (1 just now, easing to 0): recoiling away from him in pain, the head snapped back, the arms flung,
   *  wincing, blood off the face. */
  pain?: number;
  /** Seeing stars (circling over the head). */
  daze?: boolean;
  /** The head squashed down (a bonk on top), 0..1. */
  squash?: number;
  /** Both arms flailing over their head (riding blind). */
  flail?: boolean;
  /** Wearing their skateboard round their neck (through the deck). */
  neckboard?: boolean;
}

/** A kid's head from behind: a helmet (the shell stepped, its stripe, the peak out front, the goggle strap round the
 *  back), or a ball cap on backwards (its strap and the brim at us), a beanie, or their hair (a ponytail flying). */
const teenHead = (c: Ctx, k: TeenLook, hy: number, look: number, ph: number) => {
  const L = k.look, K = R6(L.skin);
  box(c, -4, hy + 6, 8, 5, K[2]); box(c, -4, hy + 6, 3, 5, K[3]);
  if (k.helmet) {
    const Hm = R6(k.helmet), stripe = k.helmet === '#F8FAFC' ? '#DC2626' : '#F8FAFC';
    // (the peak out over the front, seen past the shell)
    poly(c, Hm[2], [-12, hy - 6, 12, hy - 6, 9, hy - 11, -9, hy - 11]);
    ell(c, 0, hy, 10.5, 10.5, Hm[2]); ell(c, -1, hy - 1, 9, 9, Hm[3]); ell(c, -3, hy - 4, 5, 4.5, Hm[4]); box(c, -6, hy - 8, 3, 1, Hm[5]);
    box(c, -2, hy - 10, 4, 20, stripe); box(c, 1, hy - 10, 1, 20, mix(stripe, '#000000', 0.3));
    // (the goggle strap round the back of it, the brand's band)
    box(c, -10, hy - 2, 20, 3, '#18181B'); box(c, -8, hy - 2, 16, 1, '#F59E0B'); box(c, -2, hy - 2, 4, 3, '#3F3F46');
    box(c, -9, hy + 6, 18, 3, Hm[1]);
    if (look) { box(c, look * 7 - 2, hy + 1, 5, 6, K[3]); box(c, look * 8, hy + 2, 2, 2, INK); box(c, look * 6 - 2, hy - 1, 6, 2, '#F59E0B'); }
    return;
  }
  ell(c, 0, hy, 8.5, 9, K[3]); box(c, -10, hy - 1, 2, 4, K[3]); box(c, 8, hy - 1, 2, 4, K[2]);
  const Hr = R6(L.hair);
  ell(c, 0, hy - 2, 9, 8, Hr[3]); ell(c, -2, hy - 4, 5, 4, Hr[4]); box(c, 2, hy - 6, 1, 8, Hr[2]); box(c, -4, hy - 7, 1, 6, Hr[2]);
  if (L.long || k.woman) { box(c, -8, hy - 2, 16, 13, Hr[3]); box(c, -8, hy - 2, 3, 13, Hr[4]); box(c, 5, hy - 2, 3, 13, Hr[2]); for (let x = -7; x < 8; x += 3) box(c, x, hy + 9, 2, 2, Hr[2]); }
  if (k.pony) { const sw = OSC[ph] * 3; line(c, Hr[2], 4.4, [0, hy - 2, sw, hy + 8, sw * 1.6, hy + 17]); line(c, Hr[4], 1.4, [-1, hy - 1, sw - 1, hy + 8]); box(c, -2, hy - 3, 4, 2, '#DC2626'); }
  if (look) { box(c, look * 6 - 2, hy - 1, 4, 6, K[3]); box(c, look * 7, hy, 2, 2, INK); }
  if (k.gear === 0) {
    // (a ball cap on backwards: the crown, the strap and its snap, the brim down over the back of the neck)
    const C = R6(k.cap);
    ell(c, 0, hy - 4, 9.5, 7, C[3]); ell(c, -2, hy - 6, 5, 3.5, C[4]); box(c, -1, hy - 11, 2, 2, C[2]);
    box(c, -9, hy - 3, 18, 3, C[2]); box(c, -4, hy - 1, 8, 3, '#18181B'); box(c, -1, hy - 1, 2, 2, '#9CA3AF');
    poly(c, C[1], [-8, hy + 2, 8, hy + 2, 6, hy + 6, -6, hy + 6]); box(c, -8, hy + 2, 16, 1, C[4]);
  } else if (k.gear === 1) {
    // (a beanie: ribbed, its cuff turned up)
    const C = R6(k.cap);
    ell(c, 0, hy - 4, 9.4, 8, C[3]); for (let x = -7; x < 8; x += 3) box(c, x, hy - 10, 1, 8, C[2]); ell(c, -2, hy - 7, 4, 3, C[4]);
    box(c, -9, hy - 1, 18, 4, C[2]); box(c, -9, hy - 1, 18, 1, C[4]);
  }
};

const paintTeenRider = (c: Ctx, k: TeenLook, weapon: Weapon, p: RiderPose, ph: number, lean: number) => {
  c.rotate(lean);
  c.scale(0.92, 0.92);
  rearBike(c, k.bike, p.spin);
  const L = k.look, bw = k.heavy ? 15 : 12, S = R6(L.shirt), P = R6(L.pants), Kn = R6(L.skin);
  // (punched: the whole body above the seat thrown away from him (he's on the side their weapon faces), easing back)
  const pain = p.pain ?? 0, away = -p.side;
  if (pain > 0) { c.translate(0, -44); c.rotate(away * 0.42 * pain); c.translate(away * 5 * pain, 44); }
  // (legs down to the pegs: moto pants and knee guards, or jeans; their boots or sneakers)
  for (const s of [-1, 1]) {
    line(c, P[2], 6, [s * 8, -42, s * 14, -30, s * 13, -19]); line(c, P[3], 3.6, [s * 7.4, -42, s * 13.4, -30, s * 12.6, -20]);
    if (k.helmet) { box(c, s * 14 - 3, -33, 6, 6, '#E5E7EB'); box(c, s * 14 - 3, -33, 6, 1, '#FFFFFF'); box(c, s * 13 - 4, -21, 8, 6, '#F4F4F0'); box(c, s * 13 - 4, -18, 8, 1, '#18181B'); box(c, s * 13 - 4, -16, 8, 1, '#18181B'); }
    else { box(c, s * 13 - 4, -20, 8, 5, '#F5F5F4'); box(c, s * 13 - 4, -16, 8, 1, '#A1A1AA'); box(c, s * 13 - 1, -20, 2, 2, s < 0 ? '#DC2626' : '#2563EB'); }
  }
  // (the seat of their pants, their back in their shirt or jersey: its number, the yoke)
  box(c, -10, -48, 20, 8, P[3]); box(c, -10, -48, 20, 2, P[4]); box(c, -1, -47, 1, 7, P[1]);
  poly(c, S[3], [-bw, -72, bw, -72, bw - 2, -47, -bw + 2, -47]);
  box(c, -bw, -72, 4, 25, S[4]); box(c, bw - 4, -72, 4, 25, S[2]); box(c, -bw, -72, bw * 2, 2, S[5]); box(c, -1, -68, 2, 20, S[2]);
  if (k.helmet) { box(c, -bw + 1, -72, bw * 2 - 2, 5, S[1]); digits(c, k.num, 0, -63, S[3] === '#E5E7EB' || L.shirt === '#E5E7EB' ? '#18181B' : '#F4F4F0', 2); box(c, -bw + 2, -50, bw * 2 - 4, 2, S[1]); }
  else { box(c, -bw + 2, -52, bw * 2 - 4, 2, S[2]); box(c, -6, -60, 4, 1, S[2]); }
  // (the arms out to the bars; the weapon arm up behind (the wind-up), out at him (the swing), or down at their side)
  const armTo = (side: number, hx: number, hy: number) => {
    // (seen from behind: the elbow out to that arm's side by anatomy, src/m2/art/limb.ts, never in across the back)
    const L = halfBone(side * (bw - 2), -70, hx, hy, 9, 1.03), [mx, my] = elbowFront(side * (bw - 2), -70, hx, hy, L, L, side);
    // (inked round as one arm first, so the sleeve and the forearm join at a real elbow)
    line(c, INK, 8, [side * (bw - 2), -70, mx, my]); line(c, INK, 6, [mx, my, hx, hy]);
    line(c, S[2], 6, [side * (bw - 2), -70, mx, my]); line(c, S[4], 2, [side * (bw - 2) - 1, -71, mx - 1, my - 1]);
    line(c, Kn[2], 4, [mx, my, hx, hy]); line(c, Kn[4], 1.2, [mx, my - 1, hx, hy - 1]);
    // (the elbow: the sleeve's cuff round it, the joint's knob; the shoulder: a round cap of jersey over the arm's root)
    ell(c, mx, my, 2.4, 2.4, Kn[2]); box(c, mx - 1, my - 2, 1, 1, Kn[4]);
    line(c, S[1], 1.4, [mx - 2.6, my - 1.6, mx + 2.6, my - 2.6]);
    ell(c, side * (bw - 2), -70, 4.2, 3.6, S[3]); ell(c, side * (bw - 2) - 1, -71.4, 2, 1.4, S[4]); box(c, side * (bw - 2) - 2, -67, 4, 1, S[2]);
    box(c, hx - 2, hy - 2, 4, 4, k.helmet ? '#18181B' : Kn[3]);
  };
  const ws = p.side;
  if (p.flail) {
    // (riding blind: both arms waving over their head)
    const a = OSC[ph] * 6;
    armTo(-1, -16 + a, -100 - a); armTo(1, 16 + a, -100 + a);
    rearBars(c);
  } else if (pain > 0.35) {
    // (the arms flung out off the bars, the weapon arm up and away)
    armTo(away, away * 26, -86 - pain * 8); armTo(-away, -away * 14, -60);
    rearBars(c);
    if (p.arm !== 'none') paintWeapon(c, weapon, away * 26, -86 - pain * 8, away > 0 ? -1.1 : Math.PI + 1.1, false, ph);
  } else {
    if (p.arm === 'none' || p.arm === 'idle') { armTo(-1, -21, -58); armTo(1, 21, -58); }
    else armTo(-ws, -ws * 21, -58);
    rearBars(c);
    if (p.arm === 'idle') paintWeapon(c, weapon, ws * 21, -58, ws > 0 ? 0.3 : Math.PI - 0.3, false, ph);
    else if (p.arm === 'wind') {
      // (the wind-up: the weapon cocked up behind them, quivering a little as they put their back into it: the only tell)
      const q = OSC[ph] * 1.2;
      armTo(ws, ws * 8, -88 + q); paintWeapon(c, weapon, ws * 8, -88 + q, ws > 0 ? -2.2 : -0.94, p.flash, ph);
    }
    else if (p.arm === 'swing') { armTo(ws, ws * 30, -68); paintWeapon(c, weapon, ws * 30, -68, ws > 0 ? 0.1 : Math.PI - 0.1, false, ph); line(c, '#FFFFFF', 1, [ws * 30, -76, ws * 14, -86]); }
  }
  // (the head: snapped back and away when punched; squashed down by a bonk)
  if (pain > 0) c.translate(away * 4 * pain, -3 * pain);
  const sq = p.squash ?? 0;
  if (sq > 0) { c.translate(0, -82); c.scale(1 + sq * 0.25, 1 - sq * 0.4); c.translate(0, 82 + sq * 6); }
  const hy = -82;
  teenHead(c, k, hy, pain > 0.2 ? p.side : p.look, ph);
  if (pain > 0.2) {
    // (the wince, turned half round at him: the eye screwed shut, the mouth open in a howl, blood off the nose and lip
    // spraying away from him)
    const fx = p.side * 8;
    box(c, fx - 2, hy - 1, 5, 8, Kn[3]);
    line(c, INK, 1, [fx - 1, hy, fx + 2, hy + 1.5]);
    box(c, fx - 1, hy + 3.5, 3, 3, '#3A0A0A'); box(c, fx - 1, hy + 3.5, 3, 1, '#F4F4F4');
    box(c, fx, hy + 2, 2, 4, '#B91C1C');
    for (let i = 0; i < 6; i++) {
      const d = (1 - pain) * 22 + i * 3.4, dy = Math.sin(i * 1.7) * 4 - d * 0.25 + d * d * 0.02;
      box(c, fx + away * d, hy + 3 + dy, i % 2 ? 2 : 3, i % 2 ? 2 : 3, i % 3 ? '#B91C1C' : '#7F1D1D');
    }
  }
  if (p.neckboard) {
    // (their own deck down over their head, through it, round their neck)
    poly(c, '#4C1D95', [-18, hy + 6, 18, hy + 6, 20, hy + 10, 18, hy + 14, -18, hy + 14, -20, hy + 10]); box(c, -17, hy + 7, 34, 2, '#7C3AED'); box(c, -6, hy + 9, 12, 3, '#FACC15');
    box(c, -14, hy + 14, 4, 2, '#F5F5F4'); box(c, 10, hy + 14, 4, 2, '#F5F5F4');
  }
  if (p.hit) { c.globalCompositeOperation = 'source-atop'; c.globalAlpha = 0.6; box(c, -60, -130, 120, 140, '#FFFFFF'); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; }
};

/** A teen on their bike from behind, at (x, y) (the ground point) at `s` px per art unit. */
export const drawTeenRider = (c: Ctx, k: TeenLook, weapon: Weapon, p: RiderPose, x: number, y: number, s: number, f: number) => {
  const kq = bucketOf(s), lean = leanStep(p.lean), ph = (f >> 2) & 3;
  const pain = p.pain ? Math.ceil(p.pain * 6) / 6 : 0, sq = p.squash ? Math.ceil(p.squash * 4) / 4 : 0;
  const animated = p.flail || p.arm === 'wind' || k.pony || weapon === 'chain' || weapon === 'nunchucks';
  const key = `t${k.seed}${weapon}|${lean}|${p.side}${p.arm}${p.flash ? 1 : 0}${p.look}${p.hit ? 1 : 0}${Math.floor(p.spin) & 1}|${pain}|${sq}|${p.flail ? 1 : 0}${p.neckboard ? 1 : 0}${animated ? ph : 0}|${kq}`;
  const sp = frame(key, kq, -64, -134, 128, 140, g => paintTeenRider(g, k, weapon, { ...p, pain, squash: sq }, ph, lean));
  blit(c, sp, x, y, s);
  if (p.daze) {
    // (stars round their head, going round)
    const hy = -82 * 0.92;
    for (let i = 0; i < 3; i++) {
      const a = f * 0.25 + (i * Math.PI * 2) / 3, sx = x + Math.cos(a) * 12 * s, sy = y + (hy - 14 + Math.sin(a) * 3) * s, r = Math.max(1, Math.round(2.4 * s));
      box(c, Math.round(sx - r / 2), Math.round(sy - r * 1.5), Math.max(1, Math.round(r * 0.7)), r * 3, '#FDE047'); box(c, Math.round(sx - r * 1.5), Math.round(sy - r / 2), r * 3, Math.max(1, Math.round(r * 0.7)), '#FDE047');
      box(c, Math.round(sx - 0.5), Math.round(sy - 0.5), 1, 1, '#FFFFFF');
    }
  }
};

/** A teen hoisted off their bike by the underwear (the crowbar's wedgie), from behind: hung from the hook at (x, y),
 *  the waistband stretched up over their head to it, legs kicking, arms flailing. */
export const drawTeenDangle = (c: Ctx, k: TeenLook, x: number, y: number, s: number, f: number, stretch: number) => {
  const kq = bucketOf(s), ph = (f >> 1) & 7, st = Math.round(stretch * 4) / 4;
  const sp = frame(`d${k.seed}|${ph}|${st}|${kq}`, kq, -40, -10, 80, 90, g => {
    const L = k.look, S = R6(L.shirt), P = R6(L.pants), Kn = R6(L.skin), a8 = (ph / 8) * Math.PI * 2;
    g.rotate(Math.sin(a8) * 0.12);
    const top = 8 + st * 12, wy = top + 30, kick = Math.sin(a8 * 2) * 6, a = Math.sin(a8 * 1.5) * 5;
    line(g, P[2], 6, [-5, wy + 8, -8 - kick * 0.4, wy + 22]); line(g, P[2], 6, [5, wy + 8, 8 + kick * 0.4, wy + 20 - kick * 0.3]);
    line(g, P[4], 2, [-6, wy + 8, -9 - kick * 0.4, wy + 21]);
    box(g, -12 - kick * 0.4, wy + 21, 7, 4, '#F5F5F4'); box(g, 5 + kick * 0.4, wy + 19 - kick * 0.3, 7, 4, '#F5F5F4');
    box(g, -9, wy, 18, 10, P[3]); box(g, -9, wy, 4, 10, P[4]);
    poly(g, S[3], [-11, wy + 1, 11, wy + 1, 12, top + 10, -12, top + 10]); box(g, -11, top + 10, 4, wy - top - 9, S[4]); box(g, 8, top + 10, 4, wy - top - 9, S[2]);
    if (k.helmet) digits(g, k.num, 0, top + 16, '#F4F4F0', 1);
    line(g, Kn[3], 3.6, [-10, top + 13, -19, top + 2 + a]); line(g, Kn[3], 3.6, [10, top + 13, 19, top + 2 - a]);
    if (k.helmet) { ell(g, 0, top + 4, 8, 8, R6(k.helmet)[3]); box(g, -8, top + 3, 16, 2, '#18181B'); }
    else { ell(g, 0, top + 4, 7.5, 7.5, Kn[3]); ell(g, 0, top + 2, 8, 5, R6(L.hair)[3]); }
    // (the underwear yanked up out of the pants, up the back, over the head to the hook: white, stretched thin)
    box(g, -8, wy - 3, 16, 4, '#F4F4F4'); box(g, -8, wy - 3, 16, 1, '#FFFFFF');
    line(g, '#E8E8EC', 2.8 - st, [-6, wy - 2, -3, top - 2, 0, 0]); line(g, '#E8E8EC', 2.8 - st, [6, wy - 2, 3, top - 2, 0, 0]);
  });
  blit(c, sp, x, y, s);
};

/** A teen off their bike, tumbling or lying face down with their backside up (the undignified way), at `s`. */
export const drawTeenBody = (c: Ctx, k: TeenLook, x: number, y: number, s: number, rot: number, lying: boolean, flat = 0) => {
  const kq = bucketOf(s), rq = lying ? 0 : turnStep(rot), fl = lying ? Math.round(flat * 5) / 5 : 0;
  const sp = frame(`b${k.seed}|${lying ? 1 : 0}|${rq.toFixed(2)}|${fl}|${kq}`, kq, -44, -46, 88, 90, g => {
    const L = k.look, S = R6(L.shirt), P = R6(L.pants), Kn = R6(L.skin), Hr = R6(L.hair);
    if (lying) {
      // (face down in the dirt, backside up, the underwear riding up out of their pants; flattened if run over)
      g.scale(1, 1 - fl * 0.55);
      ell(g, 0, -2, 22, 4, '#6A0A0A'); ell(g, -4, -2, 14, 2.5, '#8A1414');
      box(g, -18, -9, 36, 9, S[3]); box(g, -18, -9, 36, 2, S[4]); box(g, -18, -2, 36, 2, S[1]);
      if (k.helmet) digits(g, k.num, -2, -8, '#F4F4F0', 1);
      ell(g, 8, -13, 9, 8, P[3]); ell(g, 6, -15, 5, 4, P[4]); box(g, 3, -21, 10, 3, '#F4F4F4');
      line(g, P[2], 5, [12, -10, 22, -4, 26, -2]); line(g, P[2], 5, [6, -8, 18, 0]);
      box(g, 24, -5, 6, 4, '#F5F5F4'); box(g, 16, -2, 6, 3, '#F5F5F4');
      ell(g, -21, -5, 6.5, 5.5, k.helmet ? R6(k.helmet)[3] : Hr[3]); if (k.helmet) box(g, -26, -6, 10, 2, '#18181B');
      line(g, Kn[3], 3.4, [-12, -6, -22, 2]); line(g, Kn[3], 3.4, [-6, -6, -2, 2]);
      return;
    }
    g.rotate(rq);
    box(g, -8, -14, 16, 18, S[3]); box(g, -8, -14, 4, 18, S[4]); box(g, 4, -14, 4, 18, S[2]);
    line(g, P[2], 6, [-4, 4, -10, 16]); line(g, P[2], 6, [4, 4, 12, 14]); box(g, -13, 15, 6, 4, '#F5F5F4'); box(g, 10, 12, 6, 4, '#F5F5F4');
    line(g, Kn[2], 3.6, [-8, -10, -18, -18]); line(g, Kn[2], 3.6, [8, -10, 18, -4]);
    if (k.helmet) { ell(g, 0, -23, 8.5, 8.5, R6(k.helmet)[3]); ell(g, -2, -25, 4, 3.5, R6(k.helmet)[4]); box(g, -1, -32, 2, 17, '#F8FAFC'); }
    else { ell(g, 0, -22, 8, 8, Kn[3]); ell(g, 0, -25, 8, 5, Hr[3]); box(g, -3, -20, 2, 2, INK); box(g, 2, -20, 2, 2, INK); box(g, -2, -16, 5, 3, '#5A0A0A'); box(g, -1, -16, 3, 1, '#F4F4F4'); }
  });
  blit(c, sp, x, y, s);
};

/** The hockey stick's endo, in his parry: the kid's bike stood up on its front wheel (k 0..1 how far), the kid hanging
 *  on up over the bars, legs kicking at nothing, wobbling (t its frame). */
export const drawEndo = (c: Ctx, k: TeenLook, bike: string, x: number, y: number, s: number, kUp: number, t: number) => {
  const kq = bucketOf(s), kk = Math.round(kUp * 5) / 5, ph = t & 7;
  const sp = frame(`e${k.seed}${bike}|${kk}|${ph}|${kq}`, kq, -50, -150, 100, 160, g => {
    const wob = Math.sin(ph * 1.1) * 0.06;
    g.save(); g.translate(0, -kk * 24); g.rotate(wob); rearBike(g, bike, 0); g.restore();
    g.save(); g.translate(0, -60 - kk * 34); g.rotate(wob * 2);
    const L = k.look, P = R6(L.pants), S = R6(L.shirt), Kn = R6(L.skin), kick = Math.sin(ph * 0.9) * 6;
    line(g, P[2], 6, [-4, -10, -8 - kick, -32]); line(g, P[2], 6, [4, -10, 8 + kick, -30]); line(g, P[4], 2, [-5, -10, -9 - kick, -31]);
    box(g, -12 - kick, -37, 7, 5, '#F5F5F4'); box(g, 5 + kick, -35, 7, 5, '#F5F5F4');
    box(g, -9, -14, 18, 8, P[3]); box(g, -9, -14, 18, 2, P[4]);
    box(g, -11, -6, 22, 16, S[3]); box(g, -11, -6, 4, 16, S[4]); box(g, 7, -6, 4, 16, S[2]);
    line(g, Kn[3], 3.6, [-9, 8, -18, 22]); line(g, Kn[3], 3.6, [9, 8, 18, 22]);
    if (k.helmet) { ell(g, 0, 16, 8.5, 8.5, R6(k.helmet)[3]); box(g, -8, 15, 16, 2, '#18181B'); }
    else { ell(g, 0, 16, 8, 8, Kn[3]); ell(g, 0, 19, 8, 5, R6(L.hair)[3]); }
    g.restore();
  });
  blit(c, sp, x, y, s);
};

// ---------------------------------------------------------------------------------------------------------------
// Meathead from behind, on his bike (shirtless, the flat-top, his jeans: clean, shitty, or bare)

/** His skin, his jeans, his hair (darkest first: [3] the base). */
const SK = ['#4A2410', '#7A4220', '#A86630', '#E0AC69', '#EEC48E', '#F8DCB4'];
const JE = ['#0A1028', '#13204A', '#1E3A8A', '#2C50AA', '#4468C0', '#6A8AD4'];
const HAIR = '#18181B';
const BUM = ['#B8805A', '#D8A07A', '#EEC4A0', '#F8DCC0'];
export interface MhPose {
  lean: number; spin: number;
  /** Punching (-1 left, 1 right, 0 not) and the punch's frame (PUNCH_WIND to cock it, then the blow, PUNCH_LEN in all). */
  punch: number; pt: number;
  /** A parry under way: its weapon and frame (the flourish's own arms). */
  parry: { w: Weapon; t: number; side: number } | null;
  shat: boolean; nude: boolean;
  /** Flicker (just back on after a bail). */
  blink: boolean;
  bike: string;
  /** How beaten up he is this chase (0 fresh .. 1 near dead): scrapes, then blood, torn jeans, a gash, dripping. */
  blood: number;
}

/** His punch: the cock back (frames), and the whole thing (the blow lands at PUNCH_WIND). */
export const PUNCH_WIND = 7, PUNCH_LEN = 24;
/** The punch's shape at frame t (no allocation: one shared out): wind (the cock back, 0..1), out (the arm's reach),
 *  turn (his head round in profile at the target, 0..1). */
const PSH = { wind: 0, out: 0, turn: 0 };
const punchShape = (t: number) => {
  if (t < PUNCH_WIND) { const k = t / PUNCH_WIND; PSH.wind = k; PSH.out = 0; PSH.turn = Math.min(1, k * 1.6); return PSH; }
  const u = t - PUNCH_WIND, rest = PUNCH_LEN - PUNCH_WIND - 10;
  PSH.out = u < 2 ? (u + 1) / 2 : u < 10 ? 1 : Math.max(0, 1 - (u - 10) / rest);
  PSH.wind = Math.max(0, 1 - u / 2);
  PSH.turn = u < 12 ? 1 : PSH.out;
  return PSH;
};

/** Where his working fist is in a parry's flourish, frame t, toward side sd (art units; shared by the arm and the
 *  weapon drawn in his hand). One shared out. */
export const PH = { x: 0, y: 0, a: 0 };
export const parryHand = (w: Weapon, t: number, sd: number) => {
  let x = sd * 38, y = -70, a = sd > 0 ? 0 : Math.PI;
  const toward = (ang: number) => (sd > 0 ? ang : Math.PI - ang);
  switch (w) {
    case 'chain': if (t >= 8 && t < 34) { x = sd * 4; y = -100; } break;
    case 'bat':
      if (t < 6) { const k = t / 6; x = sd * (38 - k * 14); y = -70 - k * 30; a = toward(-1.3 * k); }
      else if (t < 22) {
        // (three bonks on the head, BONK BONK BONK: up, down on it, up again)
        const l = (t - 6) % 5, up = l < 2 ? 1 - l / 2 : (l - 2) / 3;
        x = sd * 26; y = -80 - up * 22; a = toward(0.45 - up * 1.6);
      } else if (t < 28) { const k = (t - 22) / 6; x = sd * (26 - k * 34); y = -80 + k * 4; a = toward(-2.6 - k * 0.4); }
      else { const k = Math.min(1, (t - 28) / 3); x = sd * (-8 + k * 50); y = -76 + k * 8; a = toward(-3 + k * 3.2); }
      break;
    case 'crowbar':
      if (t < 5) { x = sd * 38; y = -70; a = toward(0); }
      else if (t < 10) { const k = (t - 5) / 5; x = sd * (38 + k * 12); y = -70 + k * 6; a = toward(0.6); }
      else if (t < 26) { const k = Math.min(1, (t - 10) / 6); x = sd * (50 - k * 10); y = -64 - k * 56 + Math.sin(t * 0.9) * 2; a = toward(-0.4); }
      else { const k = Math.min(1, (t - 26) / 3); x = sd * (40 - k * 20); y = -120 + k * 20; a = toward(-1.2 * k); }
      break;
    case 'nunchucks':
      if (t < 4) { x = sd * 38; y = -70; }
      else if (t < 22) { const l = (t - 4) % 4; x = sd * (30 + (l < 2 ? l * 6 : (4 - l) * 6)); y = -82 + (l % 2) * 4; a = toward(l < 2 ? -0.6 : 0.6); }
      else if (t < 30) { x = sd * 34; y = -72; }
      else { const k = Math.min(1, (t - 30) / 6); x = sd * (34 - k * 24); y = -72 + k * 14; }
      break;
    case 'hockey':
      if (t < 4) { x = sd * 38; y = -70; a = toward(0); }
      else { x = sd * 40; y = -64; a = toward(0.9); }
      break;
    case 'skateboard':
      if (t < 6) { const k = t / 6; x = sd * (38 - k * 10); y = -70 - k * 20; a = toward(-0.4); }
      else if (t < 16) { const l = (t - 6) % 5, up = l < 2 ? 1 - l / 2 : (l - 2) / 3; x = sd * 32; y = -84 - up * 18; a = toward(0.3 - up * 1.2); }
      else if (t < 20) { const k = (t - 16) / 4; x = sd * 32; y = -104 + k * 18; a = toward(0); }
      else { x = sd * 34; y = -78; a = toward(0.4); }
      break;
  }
  PH.x = x; PH.y = y; PH.a = a;
  return PH;
};

/** An arm from his shoulder to the fist at (hx, hy): the deltoid capped, the triceps from behind in steps, the elbow
 *  cocked out when the fist's up by his head, the fist bigger thrown (`big`), scraped and bloody by `blood`. */
const mhArm = (c: Ctx, side: number, hx: number, hy: number, blood: number, big = false) => {
  const sx = side * 15, sy = -67;
  const near = Math.abs(hx - sx) < 14 && hy < sy;
  const ex = near ? sx + side * 13 : (sx + hx) / 2 + side * 3, ey = near ? sy + 5 : (sy + hy) / 2 + 3;
  const lit = side < 0;
  line(c, SK[2], big ? 10 : 9, [sx, sy, ex, ey]); line(c, SK[2], big ? 8 : 7, [ex, ey, hx, hy]);
  line(c, SK[3], big ? 7 : 6, [sx, sy - 0.5, ex, ey - 0.5]); line(c, SK[3], big ? 5.4 : 4.6, [ex, ey - 0.5, hx, hy - 0.5]);
  line(c, lit ? SK[5] : SK[4], 1.6, [sx - side * 1, sy - 2, (sx + ex) / 2 - side, (sy + ey) / 2 - 2]);
  line(c, SK[4], 1.2, [ex, ey - 2, (ex + hx) / 2, (ey + hy) / 2 - 2]);
  ell(c, sx, sy, 6, 5, SK[3]); ell(c, sx - side * 1.5, sy - 1.5, 3.2, 2.4, lit ? SK[5] : SK[4]);
  if (blood > 0.2) line(c, '#A83232', 2.2, [(sx * 2 + ex) / 3, (sy * 2 + ey) / 3, ex, ey]);
  if (blood > 0.4) { line(c, '#991B1B', 1.4, [ex, ey, (ex + hx) / 2, (ey + hy) / 2 + 1]); box(c, ex - 1, ey - 1, 3, 2, '#7F1D1D'); }
  const r = big ? 5 : 3.8;
  ell(c, hx, hy, r, r * 0.95, SK[3]); ell(c, hx - r * 0.25, hy - r * 0.3, r * 0.55, r * 0.45, SK[5]);
  box(c, hx - r * 0.7, hy + 1, r * 1.4, 1.4, SK[1]); box(c, hx - r * 0.6, hy - r * 0.2, 1, r * 0.6, SK[2]); box(c, hx + r * 0.1, hy - r * 0.2, 1, r * 0.6, SK[2]);
  if (blood > 0.3) box(c, hx - 2, hy - 2, 3, 2, '#B91C1C');
};

/** His head: from behind (the flat-top, the ears, the thick neck), or swung round to `turn` toward sd in profile: the
 *  brow crushed down over the eye, the nose, the jaw out, the teeth bared: he wants you dead. */
const mhHead = (c: Ctx, turn: number, sd: number, blood: number, fq: number) => {
  box(c, -8, -81, 16, 9, SK[2]); box(c, -6, -81, 11, 9, SK[3]); box(c, -6, -81, 3, 9, SK[4]); box(c, -1, -80, 1, 6, SK[2]);
  if (turn < 0.35) {
    box(c, -12, -89, 3, 8, SK[3]); box(c, -12, -89, 1, 8, SK[5]); box(c, -11, -87, 1, 4, SK[1]);
    box(c, 9, -89, 3, 8, SK[2]); box(c, 10, -87, 1, 4, SK[1]);
    box(c, -9, -97, 18, 17, SK[3]); box(c, -9, -97, 4, 17, SK[4]); box(c, 5, -97, 4, 17, SK[2]);
    box(c, -9, -84, 18, 2, SK[2]);
    // (the flat-top: buzzed flat on top, squared at the corners, faded down the back to skin)
    box(c, -9, -98, 18, 10, HAIR); box(c, -10, -100, 20, 4, HAIR); box(c, -10, -100, 20, 1, '#52525B'); box(c, -8, -99, 8, 1, '#3F3F46');
    for (let x = -8; x < 9; x += 2) box(c, x, -88, 1, 2, '#2A2A30');
    box(c, -9, -90, 18, 1, '#27272A');
    // (his glasses from behind: the arms over the tops of his ears, hooked down behind them)
    box(c, -13, -89, 4, 1.4, INK); box(c, -13, -88, 1, 3, INK); box(c, 9, -89, 4, 1.4, INK); box(c, 12, -88, 1, 3, INK);
    box(c, -12, -89, 2, 0.5, '#52525B'); box(c, 10, -89, 2, 0.5, '#52525B');
  } else {
    c.save(); c.translate(sd * 2, 0); c.scale(sd, 1);
    // (the skull side on, the face to +x; the ear back toward us, the flat-top over it)
    box(c, -9, -97, 18, 17, SK[3]); box(c, -9, -97, 4, 17, SK[2]); box(c, 2, -95, 5, 8, SK[4]);
    box(c, -9, -89, 5, 9, SK[1]); box(c, -8, -88, 3, 6, SK[3]); box(c, -7, -87, 1, 4, SK[2]);
    box(c, -10, -100, 20, 4, HAIR); box(c, -9, -98, 14, 8, HAIR); box(c, -10, -100, 20, 1, '#52525B');
    // (the brow ridge crushed down at the nose, the eye a slit under it, the vein up his temple)
    poly(c, HAIR, [3, -94, 12, -91, 12, -89.4, 3, -92]); box(c, 4, -91, 8, 1, SK[1]);
    box(c, 6, -90, 4, 1.8, '#F4F4F4'); box(c, 8.4, -90, 1.4, 1.8, INK);
    line(c, '#B4532A', 1, [0, -96, 1.5, -92, 0.5, -89]);
    // (the nose out, the nostril flared, the jaw jutting, the mouth pulled back off his teeth: bared, clenched)
    poly(c, SK[3], [9, -91, 14, -85, 9, -84]); box(c, 10, -86, 3, 1, SK[1]); box(c, 9, -90, 1, 5, SK[5]);
    box(c, 2, -82, 11, 3, SK[2]); box(c, 3, -82, 9, 2, SK[3]);
    box(c, 5, -85, 8, 3.4, '#3A0A0A'); box(c, 5.5, -85, 7, 1.3, '#F4F4F4'); box(c, 5.5, -83.2, 7, 1.2, '#F4F4F4');
    box(c, 7.5, -85, 0.6, 3, '#9CA3AF'); box(c, 9.8, -85, 0.6, 3, '#9CA3AF');
    box(c, 12, -85.5, 1.4, 3.8, '#7F1D1D');
    if (blood > 0.5) box(c, 11, -87, 1.6, 4 + (fq % 3), '#B91C1C');
    // (his glasses side on: the arm back to his ear, the thick rim round the eye, the brow bar heavier, the glass tinted;
    // cracked as he's beaten up, the way the game's are)
    box(c, -7, -91.2, 11, 1.4, INK); box(c, -6, -91.2, 8, 0.5, '#3F3F46');
    c.fillStyle = 'rgba(190, 220, 248, 0.24)'; c.fillRect(5, -91, 6, 3);
    box(c, 4, -92.6, 8, 1.8, INK); box(c, 4, -91, 1.2, 4, INK); box(c, 10.8, -91, 1.2, 4, INK); box(c, 4, -88, 8, 1, INK);
    box(c, 5, -92.4, 5, 0.5, '#52525B'); box(c, 5.4, -90.6, 0.8, 0.8, '#F8FAFC');
    if (blood >= 0.45) line(c, 'rgba(244, 250, 255, 0.9)', 0.5, [5.4, -90.8, 7.6, -89.8, 8.4, -90.4, 10.6, -88.4]);
    if (blood >= 0.85) { line(c, 'rgba(244, 250, 255, 0.9)', 0.5, [7.6, -89.8, 7.2, -88.2]); box(c, 3.4, -91.6, 1.6, 2, '#E7E5E4'); }
    c.restore();
  }
  // (beaten up: a gash in the scalp, blood down the back of his neck; dripping off his ear at the worst)
  if (blood > 0.55) { box(c, -4, -97, 7, 2, '#991B1B'); box(c, -1, -95, 2, 15, '#8A1C1C'); box(c, -1, -95, 1, 15, '#B32626'); }
  if (blood > 0.75) { const d = (fq * 3) % 14; box(c, 9.5, -82 + d, 1.6, 2, '#B91C1C'); }
};

const paintMeathead = (c: Ctx, p: MhPose, fq: number, lean: number) => {
  c.rotate(lean);
  rearBike(c, p.bike, p.spin);
  // (the bars before him: seen from behind, his body's in front of them (the playtest); the grips still show either
  // side of him, his hands drawn on them after)
  rearBars(c);
  const b = p.blood;
  // (his legs down to the pegs: the jeans in steps, the seams, his boots; or bare)
  const L = p.nude ? SK : JE;
  for (const s of [-1, 1]) {
    line(c, L[1], 8, [s * 9, -42, s * 16, -29, s * 15, -17]); line(c, L[3], 5.6, [s * 8.6, -42, s * 15.6, -29, s * 14.6, -17]);
    line(c, L[4], 1.6, [s * 8 - 1, -42, s * 15 - 1.2, -29]);
    if (!p.nude) line(c, '#B8862E', 0.8, [s * 10, -41, s * 17, -29]);
    box(c, s * 15 - 4, -20, 8, 6, '#1A120C'); box(c, s * 15 - 4, -20, 8, 1, '#4A3A2E'); box(c, s * 15 - 4, -15, 8, 1, '#0A0604');
  }
  // (torn through at the knees, the skin under them skinned raw)
  if (b > 0.55) for (const sx of [-1, 1]) { box(c, sx * 16 - 2.5, -32, 5, 4, p.nude ? '#C2413A' : SK[3]); box(c, sx * 16 - 1.5, -31, 3, 2, '#B91C1C'); box(c, sx * 16 - 3, -33, 6, 1, '#E8E8F0'); }
  // (the seat of his jeans (or his bare backside), the belt)
  if (p.nude) {
    ell(c, -5.5, -43, 6.5, 5.6, BUM[2]); ell(c, 5.5, -43, 6.5, 5.6, BUM[1]); ell(c, -7, -45, 3, 2.2, BUM[3]); box(c, -0.5, -47, 1, 7, '#8A5A3A');
    box(c, -12, -50, 24, 3, BUM[2]); box(c, -12, -50, 24, 1, BUM[3]);
    if (b > 0.35) ell(c, -7, -43, 3.5, 2.5, '#C0504A');
    if (b > 0.55) ell(c, 7, -42, 3, 2.5, '#B03030');
  } else {
    box(c, -12.5, -50, 25, 11, JE[3]); box(c, -12.5, -50, 4, 11, JE[4]); box(c, 8.5, -50, 4, 11, JE[2]); box(c, -0.6, -48, 1.2, 9, JE[1]);
    // (the back pockets, their stitching)
    for (const s of [-1, 1]) { box(c, s * 6.5 - 4, -47, 8, 6, JE[2]); box(c, s * 6.5 - 4, -47, 8, 1, '#B8862E'); line(c, '#B8862E', 0.6, [s * 6.5 - 3, -45, s * 6.5, -43, s * 6.5 + 3, -45]); }
    if (p.shat) { ell(c, 0, -43, 8.5, 4.8, '#6A4418'); ell(c, 0, -42, 5, 3, '#4A2E0E'); ell(c, -2, -44, 3, 1.6, '#8A5E28'); box(c, -2, -39, 2, 3 + (fq % 3), '#5C3A16'); }
    // (a seat pocket torn off, the jeans ripped, his cheek showing scraped through)
    if (b > 0.55) { poly(c, BUM[2], [-10, -46, -4, -47, -3, -41, -9, -40]); box(c, -8, -45, 3, 2, '#B91C1C'); box(c, -10, -47, 7, 1, '#E8E8F0'); }
    box(c, -13, -51, 26, 5, '#5A2A0C'); box(c, -13, -51, 26, 1, '#8A4A1C'); for (const bx of [-8, -3, 2, 7]) box(c, bx, -49.5, 1.6, 1.6, '#E5E7EB');
    box(c, -2, -51, 4, 3, '#C8A040');
    if (b > 0.75) box(c, -13, -51, 26, 2, '#7F1D1D');
  }
  // (above the seat he twists into the punch: back from it as he cocks it, then into it hard, shoulder and all)
  const pr = p.parry;
  const sh = p.punch && !pr ? punchShape(p.pt) : null;
  const sd = pr ? pr.side : p.punch;
  const twist = sh ? sd * (-0.12 * sh.wind + 0.24 * sh.out) : 0, shift = sh ? sd * (-3 * sh.wind + 6 * sh.out) : 0;
  c.save();
  c.translate(shift, -46); c.rotate(twist); c.translate(0, 46);
  // (his bare back, lit from the upper left in steps: the lats flaring, the spine's groove, the shoulder blades, the
  // traps up to his neck, the lower back's two columns)
  poly(c, SK[3], [-17, -71, 17, -71, 19, -63, 14, -50, -14, -50, -19, -63]);
  poly(c, SK[4], [-17, -71, -2, -71, -2, -50, -14, -50, -19, -63]);
  poly(c, SK[2], [12, -70, 17, -71, 19, -63, 14, -50, 10, -50, 13, -62]);
  poly(c, SK[2], [-19, -63, -14, -50, -12, -50, -16, -62]);
  box(c, -1, -69, 2, 19, SK[2]); box(c, -2, -60, 1, 9, SK[1]); box(c, 1, -57, 1, 6, SK[1]);
  ell(c, -7.5, -64, 5, 3.6, SK[5]); ell(c, 7, -64, 4.6, 3.4, SK[4]); box(c, -12, -61, 8, 1, SK[3]); box(c, 3, -61, 8, 1, SK[2]);
  ell(c, -4, -55, 2.6, 4, SK[4]); ell(c, 4, -55, 2.6, 4, SK[3]);
  poly(c, SK[3], [-14, -70, -5, -77, 5, -77, 14, -70]); poly(c, SK[4], [-13, -70, -5, -76, -1, -76, -1, -70]);
  box(c, -16, -66, 3, 12, SK[2]);
  // (beaten up, by stages: road rash on the shoulder blades; bruises and blood smeared down his back; streaks running
  // to his belt; at the worst, the lot of it dripping)
  if (b > 0.15) { ell(c, -8, -65, 4, 2.6, '#C85A4A'); for (let i = 0; i < 3; i++) box(c, -11 + i * 2, -66 + i, 3, 0.8, '#F8C8BC'); }
  if (b > 0.35) { ell(c, 9, -61, 3.6, 3, '#8A5A8A'); line(c, '#991B1B', 1.6, [-8, -64, -9, -57, -8, -52]); ell(c, 6, -67, 3, 2, '#C85A4A'); }
  if (b > 0.55) { line(c, '#7F1D1D', 2, [5, -67, 6, -59, 4, -52]); line(c, '#991B1B', 1.2, [-2, -71, -3, -61]); ell(c, -12, -59, 3, 4, '#B03838'); box(c, -6, -71, 12, 2, '#9A2222'); }
  if (b > 0.75) {
    for (let i = 0; i < 3; i++) { const d = (fq * 2 + i * 9) % 14; box(c, -8 + i * 7, -52 + d, 1.6, 2, '#B91C1C'); }
    ell(c, 0, -61, 7, 5, '#A04040');
  }
  // (his arms: to the bars, or the punch, or the parry's flourish)
  if (pr) {
    if (pr.w === 'chain' && pr.t >= 8 && pr.t < 34) { mhArm(c, -1, -4, -100, b); mhArm(c, 1, 4, -100, b); }
    else { const h = parryHand(pr.w, pr.t, sd); mhArm(c, -sd, -sd * 21, -58, b); mhArm(c, sd, h.x, h.y, b, true); }
  } else if (sh) {
    // (cocked back by his ear, then thrown right out at them, overreaching, and back)
    const cx = sd * 7, cy = -82, ex = sd * 54, ey = -68, rx = sd * 21, ry = -58;
    let hx: number, hy: number;
    if (p.pt < PUNCH_WIND) { hx = rx + (cx - rx) * sh.wind; hy = ry + (cy - ry) * sh.wind; }
    else if (p.pt < PUNCH_WIND + 2) { hx = cx + (ex - cx) * sh.out; hy = cy + (ey - cy) * sh.out; }
    else { hx = rx + (ex - rx) * sh.out; hy = ry + (ey - ry) * sh.out; }
    mhArm(c, -sd, -sd * 21, -58, b);
    // (the speed lines behind the fist as it goes out)
    if (p.pt >= PUNCH_WIND && p.pt < PUNCH_WIND + 4) for (let i = 1; i <= 3; i++) box(c, Math.min(hx - sd * (6 + i * 5), hx - sd * (14 + i * 6)), hy - 3 + i * 2, 8 + i, 1, '#FFFFFF');
    mhArm(c, sd, hx, hy, b, sh.out > 0.5);
  } else { mhArm(c, -1, -21, -58, b); mhArm(c, 1, 21, -58, b); }
  // (the head: round in profile at whoever he's hitting)
  mhHead(c, pr ? 1 : sh ? sh.turn : 0, sd || 1, b, fq);
  c.restore();
};

/** How beaten up he is, in stages (the art's own thresholds). */
const BLOOD_AT = [0.15, 0.2, 0.3, 0.35, 0.4, 0.5, 0.55, 0.75];
const bloodStage = (b: number) => { let n = 0; for (const q of BLOOD_AT) if (b > q) n++; return n; };

/** Him, from behind, on his bike, at (x, y) (its ground point), `s` px per art unit. */
export const drawMeathead = (c: Ctx, p: MhPose, x: number, y: number, s: number, f: number) => {
  if (p.blink && (f >> 2) % 2) return;
  const kq = bucketOf(s), lean = leanStep(p.lean), st = bloodStage(p.blood);
  const b = st === 0 ? 0 : BLOOD_AT[st - 1] + 0.001;
  const fq = st >= 6 || p.shat ? (f >> 3) % 6 : 0;
  const pr = p.parry;
  const key = `m|${lean}|${Math.floor(p.spin) & 1}|${p.punch}${p.punch ? p.pt : 0}|${pr ? pr.w + pr.t + pr.side : ''}|${p.shat ? 1 : 0}${p.nude ? 1 : 0}${p.bike}|${st}|${fq}|${kq}`;
  const sp = frame(key, kq, -76, -132, 152, 138, g => paintMeathead(g, { ...p, blood: b }, fq, lean));
  blit(c, sp, x, y, s);
};

/** Him and his bike apart (the bail): him tumbling (`rot`), the bike cartwheeling. */
export const drawMhTumble = (c: Ctx, x: number, y: number, s: number, rot: number, nude: boolean, shat: boolean) => {
  const kq = bucketOf(s), rq = turnStep(rot);
  const sp = frame(`mt|${rq.toFixed(2)}|${nude ? 1 : 0}${shat ? 1 : 0}|${kq}`, kq, -44, -48, 88, 88, g => {
    g.rotate(rq);
    const L = nude ? SK : JE;
    box(g, -12, -16, 24, 18, SK[3]); box(g, -12, -16, 5, 18, SK[4]); box(g, 7, -16, 5, 18, SK[2]); box(g, -1, -15, 2, 16, SK[2]);
    box(g, -12, 2, 24, 9, nude ? BUM[2] : JE[3]); box(g, -12, 2, 24, 2, nude ? BUM[3] : JE[4]);
    if (!nude) box(g, -13, 1, 26, 3, '#5A2A0C');
    if (shat && !nude) ell(g, 0, 7, 6, 3, '#6A4418');
    line(g, L[2], 7, [-6, 10, -14, 24]); line(g, L[2], 7, [6, 10, 16, 20]); line(g, L[4], 2, [-7, 10, -15, 23]);
    box(g, -18, 23, 8, 5, '#1A120C'); box(g, 13, 18, 8, 5, '#1A120C');
    line(g, SK[2], 6, [-12, -12, -24, -22]); line(g, SK[2], 6, [12, -12, 24, -4]); line(g, SK[4], 2, [-12, -13, -23, -23]);
    box(g, -8, -33, 16, 17, SK[3]); box(g, -8, -33, 4, 17, SK[4]); box(g, -9, -35, 18, 6, HAIR); box(g, -9, -35, 18, 1, '#52525B');
    box(g, -4, -25, 3, 2, INK); box(g, 2, -25, 3, 2, INK); box(g, -3, -21, 7, 3, '#5A0A0A'); box(g, -2, -21, 5, 1, '#F4F4F4');
    // (his glasses, knocked crooked on the way down: the rims round his eyes, the bridge, a streak on the glass)
    g.save(); g.translate(0, -24.5); g.rotate(0.18);
    for (const rx of [-6, 1]) { box(g, rx, -3, 6, 1.6, INK); box(g, rx, -1.4, 1, 3.4, INK); box(g, rx + 5, -1.4, 1, 3.4, INK); box(g, rx, 2, 6, 1, INK); box(g, rx + 1, -1, 1, 1, '#F8FAFC'); }
    box(g, 0, -1, 1, 1, INK); box(g, -9, -2, 3, 1, INK); box(g, 7, -2, 2, 1, INK);
    g.restore();
  });
  blit(c, sp, x, y, s);
};
export const drawBikeTumble = (c: Ctx, x: number, y: number, s: number, rot: number, color: string) => {
  const kq = bucketOf(s), rq = turnStep(rot);
  const sp = frame(`bt${color}|${rq.toFixed(2)}|${kq}`, kq, -50, -72, 100, 100, g => {
    g.translate(0, -20); g.rotate(rq); g.translate(0, 20);
    rearBike(g, color, 0, true);
    // (bent bars, a snapped lever)
    line(g, '#3F3F46', 2.4, [-20, -56, -8, -55, 8, -55, 18, -62]);
  });
  blit(c, sp, x, y - 0, s);
};

// ---------------------------------------------------------------------------------------------------------------
// Tucker on his stolen bike: from behind (the conductor's coat, the tails flapping, his trousers and boots), twisted
// round in the seat to yell back at Meathead (his face: tucker.ts's close-up, small: the eye hole, the buzzsaw, the
// grime, all there when he's near enough to see them)

export const drawTuckerRider = (c: Ctx, x: number, y: number, s: number, lean: number, wounds: TuckerWounds, talking: boolean, f: number) => {
  const kq = bucketOf(s), lq = Math.round(lean * 20) / 20, ph = (f >> 2) & 3, mouth = talking ? (f >> 2) & 3 : 0;
  const wk = `${wounds.eye ? 1 : 0}${wounds.saw ? 1 : 0}${wounds.branch ? 1 : 0}${wounds.grime ? 1 : 0}${wounds.split ? 1 : 0}`;
  const sp = frame(`tk|${lq}|${ph}|${talking ? 1 : 0}${mouth}|${wk}|${kq}`, kq, -60, -150, 120, 156, g => {
    g.save(); g.rotate(lq);
    rearBike(g, '#2563EB', ph);
    // (black trousers to the pegs, polished boots)
    for (const sx of [-1, 1]) { line(g, '#14141A', 6.5, [sx * 8, -42, sx * 15, -29, sx * 14, -18]); line(g, '#2A2A36', 2, [sx * 7, -42, sx * 14, -29]); box(g, sx * 14 - 4, -21, 8, 6, '#0C0C10'); box(g, sx * 14 - 3, -21, 4, 1, '#5A5A6A'); }
    // (the coat's tails flapping out behind him, its back seam, two buttons at the waist)
    const fl = OSC[ph] * 3;
    poly(g, '#1E2A4A', [-13, -52, 13, -52, 15 + fl, -34, 1, -36, -1, -36, -15 - fl, -34]);
    poly(g, '#2E3E66', [-13, -52, -2, -52, -2, -36, -15 - fl, -34]);
    box(g, -1, -52, 2, 16, '#141C34'); box(g, -6, -50, 2, 2, '#E8C25A'); box(g, 4, -50, 2, 2, '#E8C25A');
    // (twisted round: his back and shoulders under the head)
    poly(g, '#1E2A4A', [-15, -80, 15, -80, 13, -52, -13, -52]); poly(g, '#2E3E66', [-15, -80, -2, -80, -2, -52, -13, -52]);
    line(g, '#1E2A4A', 6, [-14, -76, -22, -60]); line(g, '#1E2A4A', 6, [14, -76, 22, -60]);
    rearBars(g);
    g.restore();
    drawTuckerCloseup(g, Math.sin(lq) * -60, -92, 0.85, mouth * 4, { wounds, talking, face: talking ? 'manic' : 'angry' });
  });
  blit(c, sp, x, y, s);
};
