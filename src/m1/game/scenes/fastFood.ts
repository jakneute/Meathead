// The epilogue's fast food, each held up close as the President offers it (Ren and Stimpy close-ups, in far more
// detail than anything round them): the biggest burger, grey patties sweating under cheese that's sliding off them, a
// hair across the bun; a bucket of chicken, oil soaking out through the cardboard, the skin sliding off a drumstick
// that's pink at the bone; fries gone limp, flopped over the side of the box into a pool of their own grease; a soda the
// size of a bin, sweating, the sugar settled into sludge at the bottom, a fly stuck in the syrup on the lid.
// Fast-food colors, over-lit, gone wrong.
//
// Pixels at half the size they're shown (384 x 216 on the hi-res panel's 768 x 432), SNES fashion: forms pillowed and
// lit and stepped to ramps (see art/raster), dithered, inked. The food's painted once and kept; what moves (drips,
// steam, the fly, a glint, the skin) goes over it every frame, in pixels.

import { Painter, painting, bayer, noise, hash2, rgbOf } from './art/raster';
import { flashAlpha } from '../settings';

type Ctx = CanvasRenderingContext2D;
const FW = 384, FH = 216;
const INK = '#160806';

const mixHex = (a: string, b: string, t: number) => {
  const A = rgbOf(a), B = rgbOf(b);
  return `rgb(${Math.round(A[0] + (B[0] - A[0]) * t)},${Math.round(A[1] + (B[1] - A[1]) * t)},${Math.round(A[2] + (B[2] - A[2]) * t)})`;
};
/** A ramp step for light `l` at a pixel (dithered between steps). */
const step = (ramp: string[], l: number, x: number, y: number) => ramp[Math.max(0, Math.min(ramp.length - 1, Math.round(Math.max(0, Math.min(1, l)) * (ramp.length - 1) + bayer(x, y) * 0.7)))];

/** A ragged ellipse (a patty, a puddle): its radius wandering by `amp`. */
const wob = (g: Ctx, cx: number, cy: number, rx: number, ry: number, amp: number, seed: number, n = 64) => {
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2, k = 1 + (noise(Math.cos(a) * 9 + 20, Math.sin(a) * 9 + 20, 3, seed) - 0.5) * amp;
    const x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k;
    if (i) g.lineTo(x, y); else g.moveTo(x, y);
  }
  g.closePath();
};

/** The over-lit fast-food backdrop: rays of two colors out from behind it, stepping darker to the edges. */
const burst = (p: Painter, cx: number, cy: number, a: string[], b: string[], rays = 22) => {
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
    const ang = Math.atan2(y - cy, x - cx), r = Math.hypot(x - cx, (y - cy) * 1.2);
    const ray = Math.floor(((ang + Math.PI) / (Math.PI * 2)) * rays) % 2;
    const l = 1 - r / 260;
    p.px(x, y, step(ray ? a : b, l, x, y));
  }
};

/** Dark in round the edges, in dithered steps. */
const vignette = (p: Painter, depth = 30) => {
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
    const e = Math.min(x, y, FW - 1 - x, FH - 1 - y);
    if (e >= depth) continue;
    const a = (1 - e / depth) * 0.85;
    if (bayer(x, y) + 0.5 < a) p.px(x, y, '#000000', 0.55);
  }
};

/** A bead of wet (sweat, grease, condensation): see-through, a dark lower rim, a hard white glint. */
const bead = (p: Painter, x: number, y: number, r: number, body = '#fff4dc', a = 0.35) => {
  p.disc(x, y, r, r * 1.15, body, a);
  p.px(x, y + Math.ceil(r), '#000000', 0.35);
  p.px(x - Math.floor(r / 2), y - Math.floor(r / 2), '#ffffff');
};

// ---------------------------------------------------------------------------
// What moves, every frame, in pixels on the low-res buffer
// ---------------------------------------------------------------------------

const F = (g: Ctx, x: number, y: number, w: number, h: number, c: string) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };

/** A fly (big: it's a close-up): hairy black body, red eyes, wings a blur when it's in the air, rubbing its hands when
 * it's not (or, stuck, kicking). */
const fly = (g: Ctx, x: number, y: number, t: number, flying: boolean, struggle = false) => {
  x = Math.round(x); y = Math.round(y);
  const P = (dx: number, dy: number, w: number, h: number, c: string) => F(g, x + dx * 2, y + dy * 2, w * 2, h * 2, c);
  if (flying || struggle) {
    const up = t % 2 === 0;
    P(-3, up ? -4 : -1, 3, 2, 'rgba(210, 225, 235, 0.6)'); P(2, up ? -4 : -1, 3, 2, 'rgba(210, 225, 235, 0.6)');
  } else {
    P(-3, -2, 3, 1, 'rgba(200, 215, 225, 0.6)'); P(-4, -1, 3, 1, 'rgba(200, 215, 225, 0.5)');
  }
  P(-2, -1, 4, 3, '#14140c'); P(-1, -2, 2, 1, '#2a2a1c');
  P(2, -1, 2, 2, '#14140c'); P(3, -1, 1, 1, '#b01c10'); P(2, -2, 1, 1, '#d02a18');
  F(g, x - 2, y - 2, 1, 1, '#6a7a5a'); F(g, x + 6, y - 2, 1, 1, '#ff8070');
  // (the bristles)
  F(g, x - 4, y - 3, 1, 1, '#14140c'); F(g, x + 1, y - 4, 1, 1, '#14140c'); F(g, x - 1, y + 4, 1, 1, '#14140c');
  if (!flying) {
    const k = struggle ? t % 4 < 2 : t % 16 < 8;
    P(-2, 2, 1, 1, '#14140c'); P(0, 2, 1, 1, '#14140c');
    F(g, x + 6 + (k ? 2 : 0), y + 2 + (k ? 0 : 2), 2, 1, '#14140c'); F(g, x + 8, y + (k ? 2 : 4), 1, 2, '#14140c');
  }
};

/** Where the fly is: buzzing round, landing on `perch`, sitting a while, off again. */
const flyAt = (g: Ctx, t: number, perch: [number, number], seed: number) => {
  const cycle = 260, c = (t + seed) % cycle;
  const sitFrom = 50, sitTo = 190;
  if (c >= sitFrom && c < sitTo) { fly(g, perch[0], perch[1], t, false); return; }
  // (in the air: loops out from the perch and back to it)
  const k = c < sitFrom ? 1 - c / sitFrom : (c - sitTo) / (cycle - sitTo);
  const a = t * 0.21 + seed;
  fly(g, perch[0] + Math.sin(a) * 60 * k + Math.sin(a * 2.3) * 8 * k, perch[1] - 20 * k + Math.cos(a * 1.4) * 26 * k, t, true);
};

/** Steam off it: wisps, each rising and swaying and thinning out. */
const steam = (g: Ctx, t: number, x0: number, x1: number, y: number, n = 6, a0 = 0.3) => {
  for (let k = 0; k < n; k++) {
    const p = ((t * 0.6 + k * 37) % 110) / 110;
    const bx = x0 + ((k * 0.618) % 1) * (x1 - x0);
    for (let j = 0; j < 7; j++) {
      const q = p - j * 0.025;
      if (q < 0) continue;
      const px = bx + Math.sin(q * 7 + k * 1.7) * 7, py = y - q * 80, w = 2 + Math.round(q * 6);
      g.fillStyle = `rgba(245, 240, 230, ${(a0 * 1.5 * (1 - q) * (1 - j / 7)).toFixed(3)})`;
      g.fillRect(Math.round(px - w / 2), Math.round(py), w, 2);
    }
  }
};

/** A drip running down from (x, y0) to y1 and dropping off, over and over (`len` frames each). */
const drip = (g: Ctx, t: number, x: number, y0: number, y1: number, len: number, seed: number, body: string, lit: string) => {
  const p = ((t + seed) % len) / len;
  if (p < 0.35) { const s = Math.round(p / 0.35 * 3); F(g, x, y0, 2, 1 + s, body); F(g, x, y0, 1, 1, lit); return; }
  const q = (p - 0.35) / 0.65, y = y0 + 3 + q * q * (y1 - y0 - 3);
  F(g, x, y0, 1, Math.max(1, Math.round((y - y0) * 0.4)), body);
  F(g, x - 1 + 1, y - 1, 2, 3, body); F(g, x, y - 1, 1, 1, lit);
};

/** A glint going off (a four-point star) every so often. */
const glint = (g: Ctx, t: number, x: number, y: number, seed: number) => {
  const c = (t + seed) % 70;
  if (c >= 8) return;
  const k = c < 4 ? c : 8 - c;
  F(g, x, y - k, 1, k * 2 + 1, '#ffffff'); F(g, x - k, y, k * 2 + 1, 1, '#ffffff');
};

let buf: HTMLCanvasElement | null = null;
/** The low-res buffer, with the still painted into it. */
const begin = (still: HTMLCanvasElement) => {
  if (!buf) { buf = document.createElement('canvas'); buf.width = FW; buf.height = FH; }
  const g = buf.getContext('2d')!;
  g.imageSmoothingEnabled = false; g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(still, 0, 0);
  return g;
};
/** Up onto the panel at twice the size; a lurch as it cuts in. */
const blit = (ctx: Ctx, t: number) => {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  const W = ctx.canvas.width, H = ctx.canvas.height, k = W / FW;
  const j = t < 6 ? (t % 2 ? 2 : -2) * (6 - t) / 3 : 0;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(buf!, Math.round(j * k), 0, W, H);
  if (t < 2) { ctx.fillStyle = `rgba(255,255,255,${flashAlpha(0.6)})`; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
};

// ---------------------------------------------------------------------------
// The burger
// ---------------------------------------------------------------------------

const BUN = ['#2a1004', '#5a2c0c', '#8a4a18', '#b86c28', '#d88c3c', '#eeae5c', '#f8cc84', '#fce4b0'];
const PATTY = ['#120c0a', '#261d18', '#3a2f28', '#504238', '#66574a', '#7c6c5c', '#968670', '#b0a088'];
const CHEESE = ['#6a1c00', '#a03a00', '#d05c00', '#f08000', '#ffa418', '#ffc850', '#ffe890'];
const SAUCE = ['#6a1c18', '#a03c30', '#c86450', '#e48e74', '#f4b49a', '#ffd8c4'];
const LETTUCE = ['#2a3008', '#4a5410', '#6c7818', '#909c28', '#b4bc48', '#d0d47c'];
const PAPER = ['#3a2e1a', '#5e4c30', '#86704a', '#ab9468', '#cbb68a', '#e4d4ac'];

/** A slice of cheese across at `y`, from x0 to x1, hanging down over the edge in tongues. */
const cheesePath = (y: number, x0: number, x1: number, tongues: [number, number, number][]) => (g: Ctx) => {
  g.moveTo(x0, y + 2); g.lineTo(x0 + 12, y - 4); g.lineTo(x1 - 10, y - 6); g.lineTo(x1, y + 1);
  const ts = [...tongues].sort((a, b) => b[0] - a[0]);
  for (const [cx, w, d] of ts) { g.lineTo(cx + w / 2, y + 6); g.bezierCurveTo(cx + w / 2, y + 6 + d * 0.7, cx + w * 0.2, y + 6 + d, cx, y + 6 + d); g.bezierCurveTo(cx - w * 0.2, y + 6 + d, cx - w / 2, y + 6 + d * 0.7, cx - w / 2, y + 6); }
  g.lineTo(x0, y + 8); g.closePath();
};

const burgerStill = () => painting('ff-burger', FW, FH, p => {
  burst(p, 192, 80, ['#2a0604', '#5a0e08', '#8c1a0c', '#b82a12', '#e04a1c', '#ff7a30'], ['#2a1a02', '#5a3a06', '#8c6010', '#b8881c', '#e0b030', '#fcd860']);
  // The wrapper it's sat on, crinkled, see-through where the grease has got into it
  p.form(g => { g.moveTo(-4, 176); for (let x = 0; x <= 388; x += 16) g.lineTo(x, 172 + Math.sin(x * 0.07) * 4 + (x % 32 ? 2 : -2)); g.lineTo(388, 220); g.lineTo(-4, 220); g.closePath(); },
    { ramp: PAPER, bevel: 4, amb: 0.3, ink: INK, tex: (x, y) => (noise(x, y, 9, 3) - 0.5) * 0.45 });
  for (const [cx, cy, rx, ry] of [[60, 198, 34, 9], [300, 202, 46, 10], [196, 206, 70, 8]]) p.tint(p.mask(g => wob(g, cx, cy, rx, ry, 0.5, cx)), '#6a4208', 0.42);
  // The bottom bun, soaked dark along its top
  p.form(g => g.ellipse(192, 178, 142, 22, 0, 0, Math.PI * 2), { ramp: BUN, bevel: 12, amb: 0.2, ink: INK, tex: (x, y) => (noise(x, y, 4, 1) - 0.5) * 0.18 });
  p.tint(p.mask(g => wob(g, 192, 166, 136, 10, 0.4, 5)), '#4a2408', 0.45);
  // The patties: grey (grey!), ragged at the edges, pocked, wet all over; the cheese between, sweating, sliding off
  const pattyOpts = { ramp: PATTY, bevel: 9, amb: 0.16, ink: INK, spec: '#f4ecd8', wet: 0.6,
    bump: (x: number, y: number) => (noise(x, y, 7, 2) - 0.5) * 1.6 + (noise(x, y, 16, 4) - 0.5) * 3,
    tex: (x: number, y: number) => (hash2(x, y) < 0.05 ? -0.3 : 0) + (noise(x, y, 3, 7) - 0.5) * 0.3 };
  p.form(g => wob(g, 192, 152, 154, 19, 0.16, 11), pattyOpts);
  p.form(cheesePath(132, 54, 332, [[74, 22, 22], [150, 18, 12], [252, 26, 26], [316, 18, 16]]), { ramp: CHEESE, bevel: 6, amb: 0.2, ink: INK, spec: '#fffbe0', wet: 0.8 });
  p.form(g => wob(g, 192, 122, 150, 18, 0.16, 23), pattyOpts);
  p.form(cheesePath(104, 58, 328, [[96, 26, 24], [198, 16, 10], [292, 22, 30]]), { ramp: CHEESE, bevel: 6, amb: 0.2, ink: INK, spec: '#fffbe0', wet: 0.8 });
  // The lettuce, wilted, going see-through and brown at the frills
  const lettuce = p.form(g => { g.moveTo(60, 98); for (let x = 60; x <= 324; x += 6) g.lineTo(x, 104 + Math.sin(x * 0.4) * 3 + (x < 90 || x > 300 ? 10 : 0)); g.lineTo(324, 92); g.lineTo(60, 92); g.closePath(); },
    { ramp: LETTUCE, bevel: 3, amb: 0.3, ink: '#1a2004', spec: '#f4f8d0', wet: 0.5, tex: (x, y) => (noise(x, y, 3, 8) - 0.5) * 0.4 });
  p.tint(p.and(lettuce, p.mask(g => { for (const cx of [84, 170, 236, 304]) wob(g, cx, 102, 12, 5, 0.6, cx); })), '#6a4a08', 0.55);
  // The sauce: pink, oozing out all round from under the top bun, hanging in drips
  p.form(g => { g.moveTo(66, 92); for (let x = 66; x <= 318; x += 4) { const d = [[112, 14], [184, 8], [232, 16], [286, 10]].reduce((m, [dx, dd]) => Math.max(m, dd * Math.exp(-((x - dx) ** 2) / 18)), 0); g.lineTo(x, 98 + Math.sin(x * 0.2) * 1.5 + d); } g.lineTo(318, 86); g.lineTo(66, 86); g.closePath(); },
    { ramp: SAUCE, bevel: 3, amb: 0.3, ink: '#4a0c08', spec: '#ffffff', wet: 1 });
  // The top bun: a dome, glossed till it shines like plastic; seeds, and the pits where seeds fell off
  const top = p.form(g => { g.moveTo(58, 96); g.bezierCurveTo(56, 40, 120, 14, 192, 14); g.bezierCurveTo(264, 14, 328, 40, 326, 96); g.bezierCurveTo(250, 102, 134, 102, 58, 96); g.closePath(); },
    { ramp: BUN, bevel: 46, amb: 0.18, ink: INK, spec: '#fff8e0', wet: 0.75, tex: (x, y) => (noise(x, y, 6, 2) - 0.5) * 0.12 });
  for (let i = 0; i < 56; i++) {
    const x = 80 + hash2(i, 1) * 224, y = 24 + hash2(i, 2) * 64;
    if (!top[Math.round(y) * FW + Math.round(x)] || !top[Math.round(y + 3) * FW + Math.round(x)]) continue;
    if (i % 5 === 0) { p.disc(x, y, 2, 1, BUN[2]); continue; }
    p.disc(x, y, 2.5, 1.5, '#f4e6c0'); p.px(x - 1, y - 1, '#ffffff'); p.px(x + 1, y + 1, '#a08860');
  }
  // A hair: long, dark, curling over the top of the bun and down the side, under the edge
  let hx = 140, hy = 44;
  for (let k = 0; k < 220; k++) { const a = k * 0.045 + Math.sin(k * 0.11) * 0.9; hx += Math.cos(a * 0.6 - 0.2) * 0.9; hy += Math.sin(a) * 0.5 + 0.12; p.px(hx, hy, k % 17 === 0 ? '#6a5a4a' : '#120a04'); }
  // The cheese sweating: beads on it; grease beaded on the patties' edges
  for (let i = 0; i < 14; i++) bead(p, 70 + hash2(i, 5) * 250, 108 + (i % 2) * 28 + hash2(i, 6) * 6, 1.5, '#fff0b0', 0.5);
  for (let i = 0; i < 18; i++) bead(p, 50 + hash2(i, 7) * 290, 128 + (i % 2) * 30 + hash2(i, 8) * 8, 1.2, '#f8e0a0', 0.6);
  vignette(p);
});

export const drawFoodBurger = (ctx: Ctx, t: number) => {
  const g = begin(burgerStill());
  steam(g, t, 100, 280, 20, 7, 0.32);
  // Sauce running down over the cheese and the patties; grease dropping off the bottom one onto the paper
  drip(g, t, 112, 110, 176, 130, 0, '#d47a60', '#ffd8c4');
  drip(g, t, 232, 112, 180, 150, 60, '#d47a60', '#ffd8c4');
  drip(g, t, 290, 136, 168, 110, 30, '#ffa418', '#ffe890');
  drip(g, t, 150, 168, 196, 70, 10, '#c89020', '#fff0a0');
  drip(g, t, 262, 170, 200, 90, 45, '#c89020', '#fff0a0');
  for (const [x, y, s] of [[110, 40, 0], [250, 34, 23], [180, 120, 41], [300, 150, 12], [92, 158, 55]]) glint(g, t, x, y, s);
  flyAt(g, t, [214, 34], 0);
};

// ---------------------------------------------------------------------------
// The bucket of chicken
// ---------------------------------------------------------------------------

const CRUST = ['#1a0702', '#341204', '#56220a', '#7a3610', '#9e4e18', '#c06c24', '#dc9038', '#f0b864'];
const FLESH = ['#4a2a2c', '#7a4e4c', '#a47470', '#c49890', '#dcbab0', '#f0d8d0'];
const BONE = ['#4a3a2a', '#7a6a54', '#a89a80', '#d0c4aa', '#ece4d0', '#fcf8ec'];
const BUCKET_R = ['#3a0404', '#6a0a08', '#9a140c', '#c42014', '#e43a20', '#f86a40'];
const BUCKET_W = ['#5a4a3a', '#8c7c68', '#b8aa94', '#dcd2c0', '#f2ece0', '#fffcf4'];

const crunchy = {
  ramp: CRUST, bevel: 12, amb: 0.14, ink: INK, spec: '#ffe8a8', wet: 0.55,
  bump: (x: number, y: number) => (noise(x, y, 3, 3) - 0.5) * 1.8 + (noise(x, y, 7, 5) - 0.5) * 3,
  tex: (x: number, y: number) => (hash2(x, y) < 0.05 ? -0.3 : 0),
};

const chickenStill = () => painting('ff-chicken', FW, FH, p => {
  burst(p, 192, 60, ['#2a0404', '#5a0a08', '#8c140c', '#b82012', '#e03a1c', '#ff6a34'], ['#2a2010', '#5a4a2a', '#8c7a50', '#b8a478', '#dcc8a0', '#f8ecc8']);
  // The bucket: red and white stripes round a cylinder, oil soaked out through it in blotches
  const bucket = p.mask(g => { g.moveTo(84, 118); g.lineTo(300, 118); g.lineTo(282, 220); g.lineTo(102, 220); g.closePath(); });
  const soak = p.mask(g => { wob(g, 130, 160, 26, 30, 0.7, 4); wob(g, 250, 150, 20, 36, 0.8, 9); wob(g, 196, 200, 40, 16, 0.6, 2); });
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
    const i = y * FW + x; if (!bucket[i]) continue;
    const half = 108 - (y - 118) * 0.088, u = (x - 192) / half;
    const nz = Math.sqrt(Math.max(0, 1 - u * u)), l = 0.15 + 0.85 * Math.max(0, u * -0.5 + nz * 0.8);
    const stripe = Math.floor((Math.asin(Math.max(-1, Math.min(1, u))) / Math.PI + 0.5) * 12) % 2;
    let c = step(stripe ? BUCKET_R : BUCKET_W, l, x, y);
    if (soak[i] && bayer(x, y) + 0.5 < 0.6) c = mixHex(c, stripe ? '#5a1a04' : '#c88a30', 0.3);
    p.px(x, y, c);
  }
  // (its edges inked, the seam, the oil running down it in streaks)
  for (let y = 118; y < FH; y++) { const half = 108 - (y - 118) * 0.088; p.px(192 - half, y, INK); p.px(192 + half, y, INK); p.px(192 - half + 1, y, INK); }
  for (const x0 of [150, 214, 266]) for (let y = 128; y < 128 + 30 + (x0 % 40); y++) p.px(x0 + Math.round(Math.sin(y * 0.2) * 1), y, '#7a4008', 0.6);
  // The chicken, piled up out of it: oil-sodden, craggy, glistening
  p.form(g => g.ellipse(124, 98, 46, 30, -0.3, 0, Math.PI * 2), crunchy);
  p.form(g => g.ellipse(262, 94, 46, 32, 0.4, 0, Math.PI * 2), crunchy);
  p.form(g => wob(g, 192, 66, 56, 38, 0.25, 7), crunchy);
  // (a drumstick leaning out of it on the right, its bone up)
  p.form(p.strokeMask(g => { g.moveTo(312, 70); g.lineTo(344, 36); }, 8), { ramp: BONE, bevel: 3, amb: 0.3, ink: INK });
  p.form(g => { g.ellipse(346, 30, 6, 5, 0, 0, Math.PI * 2); g.moveTo(358, 38); g.ellipse(352, 38, 6, 5, 0, 0, Math.PI * 2); }, { ramp: BONE, bevel: 4, amb: 0.3, ink: INK });
  p.form(g => g.ellipse(300, 92, 30, 22, -0.7, 0, Math.PI * 2), crunchy);
  // The rim, rolled, oil pooled along it
  p.form(g => { g.ellipse(192, 120, 112, 9, 0, 0, Math.PI); g.lineTo(80, 116); g.ellipse(192, 116, 112, 6, 0, Math.PI, 0, true); g.closePath(); }, { ramp: BUCKET_W, bevel: 3, amb: 0.3, ink: INK });
  p.form(g => { g.ellipse(192, 117, 104, 4, 0, 0, Math.PI); g.closePath(); }, { ramp: ['#4a2804', '#8a5410', '#c88a20', '#f0c048', '#fff0a0'], bevel: 2, amb: 0.3, ink: null, spec: '#ffffff', wet: 1.2, alpha: 0.8 });
  // The drumstick at the front, lying across the rim: its skin sliding off (that moves: see below), the meat under it
  // pale and stringy, pink going red at the bone
  p.form(g => g.ellipse(170, 114, 48, 24, 0.22, 0, Math.PI * 2), { ramp: FLESH, bevel: 10, amb: 0.2, ink: INK, spec: '#fff0f0', wet: 0.7, tex: (x, y) => Math.sin(x * 0.9 + y * 1.9) * 0.08 + (noise(x, y, 3, 6) - 0.5) * 0.2 });
  for (let k = 0; k < 9; k++) { const x0 = 134 + k * 8; for (let j = 0; j < 14; j++) p.px(x0 + j, 108 + k * 1.2 + j * 0.32 + Math.sin(j) * 0.5, FLESH[1], 0.6); }
  p.tint(p.mask(g => wob(g, 210, 122, 16, 10, 0.5, 3)), '#a01828', 0.5);
  p.tint(p.mask(g => wob(g, 216, 124, 9, 6, 0.5, 8)), '#6a0818', 0.55);
  p.line(196, 118, 214, 126, '#4a0a28'); p.line(200, 124, 212, 122, '#5a1030');
  p.form(p.strokeMask(g => { g.moveTo(214, 124); g.lineTo(246, 134); }, 9), { ramp: BONE, bevel: 3, amb: 0.3, ink: INK });
  p.form(g => { g.ellipse(250, 128, 7, 6, 0, 0, Math.PI * 2); g.moveTo(256, 140); g.ellipse(250, 140, 6, 5, 0, 0, Math.PI * 2); }, { ramp: BONE, bevel: 4, amb: 0.3, ink: INK });
  p.disc(246, 134, 3, 2, '#c8a0a0'); p.px(244, 133, '#e8d0d0');
  // Oil beaded all over the lot
  for (let i = 0; i < 40; i++) bead(p, 80 + hash2(i, 11) * 250, 34 + hash2(i, 12) * 80, 1 + (i % 3) * 0.5, '#ffe8a0', 0.5);
  vignette(p);
});

/** The skin coming off the drumstick: a flap of crust, the rubbery yellow fat under its edge. */
const SKIN_W = 110, SKIN_H = 60;
const skinFlap = () => painting('ff-chicken-skin', SKIN_W, SKIN_H, p => {
  const m = p.mask(g => { g.moveTo(6, 30); g.bezierCurveTo(10, 8, 60, 2, 96, 14); g.bezierCurveTo(100, 22, 92, 30, 84, 34); for (let x = 84; x > 10; x -= 6) g.lineTo(x, 40 + Math.sin(x * 0.7) * 3 + (x > 30 && x < 60 ? 6 : 0)); g.closePath(); });
  const fat = p.and(m, p.mask(g => { g.moveTo(0, 34); for (let x = 0; x <= 110; x += 6) g.lineTo(x, 33 + Math.sin(x * 0.7) * 3 + (x > 30 && x < 60 ? 6 : 0)); g.lineTo(110, 60); g.lineTo(0, 60); g.closePath(); }));
  p.form(m, crunchy);
  p.form(fat, { ramp: ['#6a5a20', '#a08c40', '#ccb868', '#e8d898', '#f8f0c8'], bevel: 2, amb: 0.3, ink: INK, spec: '#ffffff', wet: 0.8 });
});

export const drawFoodChicken = (ctx: Ctx, t: number) => {
  const g = begin(chickenStill());
  // (the skin sliding off the drumstick, slowly, then hanging)
  const slide = Math.min(t, 240) / 240, sx = 120 + Math.round(slide * 6), sy = 84 + Math.round(slide * 12);
  g.drawImage(skinFlap(), sx, sy);
  drip(g, t, sx + 46, sy + 44, 150, 90, 0, '#c88a20', '#fff0a0');
  steam(g, t, 110, 300, 40, 6, 0.3);
  // Oil running down the outside of the bucket
  drip(g, t, 150, 158, 214, 160, 20, '#8a5410', '#f0c048');
  drip(g, t, 266, 170, 214, 140, 80, '#8a5410', '#f0c048');
  for (const [x, y, s] of [[170, 46, 0], [110, 84, 33], [280, 70, 17], [150, 110, 51]]) glint(g, t, x, y, s);
  flyAt(g, t, [200, 34], 90);
};

// ---------------------------------------------------------------------------
// The fries
// ---------------------------------------------------------------------------

const FRY = ['#4a3810', '#7a6020', '#a88c38', '#ccb058', '#e4cc80', '#f4e4ac'];
const BOX = ['#3a0404', '#6c0a08', '#9c160c', '#c82414', '#e8442a', '#fc7a50'];
const TRAY = ['#1a0c04', '#2a160a', '#3e2210', '#542e16', '#6a3c1c', '#80502a'];
const OIL = ['#1e1002', '#3e2404', '#6a440a', '#9a6c18', '#d0a040', '#fff0b0'];

/** The fries: [base x, top x, top y, droop (how far the tip flops over and down), burnt]. */
const FRIES: [number, number, number, number, boolean][] = [
  [148, 124, 60, 30, false], [160, 152, 44, 0, false], [170, 164, 36, 0, true], [180, 168, 50, 0, false], [188, 190, 30, 0, false],
  [198, 204, 40, 0, true], [208, 212, 34, 0, false], [218, 230, 50, 0, false], [228, 246, 52, 28, false],
  [240, 258, 66, 0, false], [154, 144, 74, 0, false], [194, 176, 66, 0, false], [230, 222, 68, 0, false], [176, 154, 58, 22, true],
];
const fryTip = (bx: number, tx: number, ty: number, d: number): [number, number] => [tx + (tx > 192 ? 1 : -1) * d * 0.8, ty + d * 1.6];

const friesStill = () => painting('ff-fries', FW, FH, p => {
  burst(p, 192, 70, ['#2a1c02', '#5a4004', '#8c6808', '#c09410', '#e8c020', '#fce050'], ['#2a0a02', '#5a1806', '#8c2a0a', '#b8400e', '#e05a14', '#ff8030']);
  // The tray, wet with it
  for (let y = 148; y < FH; y++) for (let x = 0; x < FW; x++) p.px(x, y, step(TRAY, (y - 148) / 68 * 0.8 + 0.1, x, y));
  p.rect(0, 148, FW, 1, '#a07040'); p.rect(0, 149, FW, 1, TRAY[2]);
  // The pool: a puddle of grease spread out from under the box, see-through, shining
  p.form(g => wob(g, 196, 186, 168, 24, 0.3, 12), { ramp: OIL, bevel: 2, amb: 0.3, ink: '#2a1404', spec: '#ffffff', wet: 1.6, alpha: 0.8, gain: 0.55, tex: (x, y) => Math.sin(x * 0.05 + y * 0.6) * 0.12 + (y < 178 ? 0.15 : 0) });
  // (limp fries lying in it, half under)
  for (const [x0, y0, x1, y1] of [[40, 182, 96, 192], [300, 176, 352, 190], [92, 200, 140, 196]]) {
    p.form(p.strokeMask(g => { g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, Math.max(y0, y1) + 6, x1, y1); }, 7), { ramp: FRY, bevel: 2.5, amb: 0.3, ink: INK, spec: '#fffbe0', wet: 0.8 });
    p.tint(p.mask(g => { g.rect(x0 - 4, (y0 + y1) / 2 + 2, x1 - x0 + 8, 10); }), '#a06a14', 0.35);
  }
  // The back of the box
  p.form(g => { g.moveTo(132, 112); g.lineTo(138, 70); g.quadraticCurveTo(194, 58, 252, 66); g.lineTo(258, 108); g.closePath(); }, { ramp: BOX, bevel: 6, amb: 0.08, ink: INK });
  // The fries: limp, flopped over, pale, glistening; the odd black end
  for (const [bx, tx, ty, d, burnt] of FRIES) {
    const [ex, ey] = fryTip(bx, tx, ty, d);
    p.form(p.strokeMask(g => { g.moveTo(bx, 130); g.lineTo(tx, ty + 6); if (d) g.quadraticCurveTo(tx + (ex - tx) * 0.6, ty - 6, ex, ey); else g.lineTo(tx, ty); }, 11),
      { ramp: FRY, bevel: 2.5, amb: 0.3, ink: INK, spec: '#fffbe0', wet: 0.9, tex: (x, y) => (hash2(x, y) < 0.04 ? -0.3 : 0) + (noise(x, y, 4, 4) - 0.5) * 0.25 });
    if (burnt) { p.disc(ex, ey, 4, 4, '#2a1404', 0.75); p.px(ex - 1, ey - 1, '#5a3010'); }
    else p.disc(ex, ey, 3, 3, '#8a6a20', 0.4);
  }
  // The front of the box: red, soaked through in blotches, its top cut in a curve
  const box = p.form(g => { g.moveTo(128, 100); g.quadraticCurveTo(192, 128, 260, 96); g.lineTo(248, 200); g.quadraticCurveTo(196, 206, 144, 200); g.closePath(); }, { ramp: BOX, bevel: 10, amb: 0.16, ink: INK, tex: (x, y) => (noise(x, y, 6, 1) - 0.5) * 0.12 });
  p.tint(p.and(box, p.mask(g => { wob(g, 160, 168, 18, 24, 0.7, 3); wob(g, 228, 150, 14, 18, 0.7, 6); wob(g, 196, 196, 46, 8, 0.5, 9); })), '#3a1404', 0.45);
  // (a star on it, no name)
  p.form(g => { for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 9 : 20; g.lineTo(194 + Math.cos(a) * r, 152 + Math.sin(a) * r); } g.closePath(); }, { ramp: ['#6a4a00', '#b08000', '#e8b800', '#fcd840', '#fff4a0'], bevel: 4, amb: 0.3, ink: '#3a0404' });
  // The fries that flopped over the front edge, hanging down it
  for (const [bx, tx, ty, d, burnt] of FRIES) {
    if (!d) continue;
    const [ex, ey] = fryTip(bx, tx, ty, d);
    if (ey < 104) continue;
    p.form(p.strokeMask(g => { g.moveTo(tx + (ex - tx) * 0.5, ty + 4); g.quadraticCurveTo(tx + (ex - tx) * 0.8, ty, ex, ey); }, 11), { ramp: FRY, bevel: 2.5, amb: 0.3, ink: INK, spec: '#fffbe0', wet: 0.9 });
    if (burnt) p.disc(ex, ey, 4, 4, '#2a1404', 0.75);
  }
  // Salt, in clumps, wet
  for (let i = 0; i < 70; i++) { const x = 120 + hash2(i, 21) * 150, y = 26 + hash2(i, 22) * 100; p.px(x, y, '#ffffff', 0.85); if (i % 3 === 0) p.px(x + 1, y, '#d8e0e8'); }
  for (let i = 0; i < 30; i++) bead(p, 120 + hash2(i, 23) * 150, 40 + hash2(i, 24) * 80, 1, '#fff0b0', 0.6);
  vignette(p);
});

export const drawFoodFries = (ctx: Ctx, t: number) => {
  const g = begin(friesStill());
  // Grease dripping off the hanging fries into the pool, rings spreading where it lands
  let s = 0;
  for (const [bx, tx, ty, d] of FRIES) {
    if (!d) continue;
    const [ex, ey] = fryTip(bx, tx, ty, d);
    if (ey < 104) continue;
    const len = 90 + (s % 3) * 20, land = 180 + (s % 2) * 6;
    drip(g, t, Math.round(ex), Math.round(ey + 3), land, len, s * 31, '#d09a2c', '#fff0b0');
    const p = ((t + s * 31) % len) / len;
    if (p > 0.92 || p < 0.25) { const q = p > 0.92 ? (p - 0.92) / 0.33 : (p + 0.08) / 0.33, r = 2 + q * 14; for (let a = 0; a < 24; a++) F(g, ex + Math.cos(a / 24 * Math.PI * 2) * r, land + 2 + Math.sin(a / 24 * Math.PI * 2) * r * 0.3, 1, 1, `rgba(255, 240, 180, ${(0.7 * (1 - q)).toFixed(2)})`); }
    s++;
  }
  steam(g, t, 150, 240, 30, 3, 0.16);
  for (const [x, y, k] of [[80, 184, 0], [310, 180, 29], [200, 190, 47], [176, 60, 13]]) glint(g, t, x, y, k);
  flyAt(g, t, [226, 40], 150);
};

// ---------------------------------------------------------------------------
// The soda
// ---------------------------------------------------------------------------

const COLA = ['#060200', '#140804', '#260e06', '#3c1608', '#56200c', '#743012', '#9a4418'];
const SLUDGE = ['#3a2410', '#6a4824', '#94703c', '#bc985c', '#dcc08a', '#f4e4bc'];
const LID = ['#6a7880', '#94a2aa', '#bcc8ce', '#dce4e8', '#f2f6f8', '#ffffff'];

/** The cup's half-width at height y (it tapers). */
const cupHalf = (y: number) => 84 - (y - 34) * 0.12;
const surface = (x: number) => 50 + Math.sin(x * 0.05) * 0.6;
const sludgeTop = (x: number) => 162 + Math.sin(x * 0.09) * 4 + Math.sin(x * 0.23) * 2;

const sodaStill = () => painting('ff-soda', FW, FH, p => {
  burst(p, 192, 56, ['#02061a', '#061040', '#0c1c70', '#1830a0', '#2c50d0', '#5080f0'], ['#1a0210', '#40061c', '#700c28', '#a01434', '#d02440', '#f45064']);
  // The cup: clear plastic; through it, the cola (black, red at the edges where the light comes through), and down the
  // bottom the sugar that never dissolved, settled into sludge
  for (let y = 34; y < FH; y++) {
    const half = cupHalf(y);
    for (let x = Math.ceil(192 - half); x <= 192 + half; x++) {
      const u = (x - 192) / half, nz = Math.sqrt(Math.max(0, 1 - u * u));
      let c: string;
      if (y < surface(x)) c = step(['#40485a', '#5a6474', '#788496', '#98a4b4'], 0.3 + 0.5 * nz, x, y);
      else if (y >= sludgeTop(x)) {
        const grit = (noise(x, y, 2, 4) - 0.5) * 0.5 + (hash2(x, y) < 0.06 ? 0.4 : 0);
        c = step(SLUDGE, 0.15 + (y - 160) / 120 + grit + (1 - nz) * 0.3, x, y);
      } else c = step(COLA, 0.1 + (1 - nz) ** 2 * 0.9 + (y < 60 ? 0.15 : 0), x, y);
      p.px(x, y, c);
    }
  }
  // (a skin of foam gone flat on top; the line where the sludge starts, the crystals in it)
  for (let x = 110; x < 274; x++) if (Math.abs(x - 192) < cupHalf(50)) { p.px(x, surface(x), '#a08060'); if (x % 3) p.px(x, surface(x) + 1, '#5a3420'); }
  for (let x = 116; x < 268; x++) if (Math.abs(x - 192) < cupHalf(162) - 1) p.px(x, sludgeTop(x), '#c8a070');
  for (let i = 0; i < 160; i++) { const x = 120 + hash2(i, 31) * 144, y = 166 + hash2(i, 32) * 50; if (y > sludgeTop(x) + 2 && Math.abs(x - 192) < cupHalf(y) - 2) p.px(x, y, '#fffaf0'); }
  // (the plastic: shine down its near side, the far edge lit, ridges round it, inked)
  for (let y = 36; y < FH; y++) {
    const half = cupHalf(y);
    for (const [k, w, a] of [[-0.78, 4, 0.55], [-0.62, 2, 0.35], [0.82, 2, 0.4]] as const) for (let j = 0; j < w; j++) { const x = Math.round(192 + k * half) + j; if (bayer(x, y) + 0.5 < a + 0.3) p.px(x, y, '#ffffff', a); }
    p.px(192 - half, y, INK); p.px(192 + half, y, INK); p.px(192 - half + 1, y, '#b8c8d8'); p.px(192 + half - 1, y, '#8898a8');
  }
  for (const y of [64, 68, 196]) for (let x = Math.ceil(192 - cupHalf(y)) + 2; x < 192 + cupHalf(y) - 1; x++) p.px(x, y, '#ffffff', 0.18);
  // Sweating: condensation beaded all over it
  for (let i = 0; i < 120; i++) {
    const y = 60 + hash2(i, 41) * 156, half = cupHalf(y), x = 192 + (hash2(i, 42) * 2 - 1) * (half - 4);
    bead(p, x, y, 1 + (i % 4 === 0 ? 1 : 0), '#d8ecff', 0.4);
  }
  // The lid: a dome of white plastic, the rim pressed round the cup, the cross cut for the straw
  p.form(g => g.ellipse(192, 36, 90, 9, 0, 0, Math.PI * 2), { ramp: LID, bevel: 3, amb: 0.3, ink: INK });
  p.form(g => { g.ellipse(192, 30, 70, 16, 0, Math.PI, 0); g.closePath(); }, { ramp: LID, bevel: 10, amb: 0.3, ink: INK, spec: '#ffffff', wet: 0.6 });
  // (syrup run out of the lid down the cup: brown, sticky, a crust of it along the rim)
  p.form(p.strokeMask(g => { g.moveTo(244, 40); g.quadraticCurveTo(246, 60, 244, 92); }, 4), { ramp: ['#2a0e04', '#5a2008', '#8a3a10', '#c06420', '#f0a048'], bevel: 1.5, amb: 0.3, ink: '#1a0602', spec: '#ffffff', wet: 1.2 });
  for (let x = 120; x < 266; x += 2) if (hash2(x, 50) < 0.5) p.px(x, 42 + (x % 4 === 0 ? 1 : 0), '#6a2c0c');
  // The straw: striped, bent, chewed flat at the end
  const straw = p.form(p.strokeMask(g => { g.moveTo(204, 24); g.lineTo(214, -10); }, 12), { ramp: BOX, bevel: 3, amb: 0.3, ink: INK });
  for (let y = -10; y < 24; y++) for (let x = 196; x < 220; x++) if (y >= 0 && straw[y * FW + x] && ((y + x * 0.25) | 0) % 8 < 4) p.px(x, y, step(BUCKET_W, 0.4 + (x < 208 ? 0.4 : 0), x, y));
    vignette(p);
});

export const drawFoodSoda = (ctx: Ctx, t: number) => {
  const g = begin(sodaStill());
  // Bubbles, slow through the syrup, from the sludge up
  for (let k = 0; k < 9; k++) {
    const p = ((t * 0.35 + k * 23) % 110) / 110, x = 132 + ((k * 0.381) % 1) * 120 + Math.sin(p * 9 + k) * 2, y = 160 - p * 108;
    F(g, x, y, 2, 2, 'rgba(200, 120, 80, 0.55)'); F(g, x, y, 1, 1, 'rgba(255, 220, 190, 0.8)');
  }
  // Condensation running down it: a bead, sliding, a clear trail behind it
  for (let k = 0; k < 6; k++) {
    const len = 140 + k * 17, p = ((t + k * 41) % len) / len, x = 132 + ((k * 0.57) % 1) * 116, y0 = 64 + (k % 3) * 20, y = y0 + p * (200 - y0);
    F(g, x, y0, 1, Math.round(y - y0), 'rgba(220, 240, 255, 0.22)');
    F(g, x - 1, y, 3, 3, 'rgba(220, 240, 255, 0.5)'); F(g, x - 1, y, 1, 1, '#ffffff');
  }
  // (the syrup's drip growing at the bottom of its run)
  const sy = 92 + Math.min(t, 300) / 300 * 10;
  F(g, 243, 92, 2, Math.round(sy - 92), '#8a3a10'); F(g, 242, sy, 4, 3, '#8a3a10'); F(g, 243, sy, 1, 1, '#f0a048');
  // The fly, stuck in the syrup on the lid, wings going, legs going, getting nowhere
  fly(g, 150 + (t % 6 < 3 ? 0 : 1), 40, t, false, true);
  for (const [x, y, s] of [[150, 22, 0], [232, 26, 27], [140, 120, 50], [240, 150, 13]]) glint(g, t, x, y, s);
};

/** The food close-ups, drawn into a hi-res panel. */
export const drawFood = (which: 'burger' | 'chicken' | 'fries' | 'soda') => (ctx: Ctx, t: number) => {
  ({ burger: drawFoodBurger, chicken: drawFoodChicken, fries: drawFoodFries, soda: drawFoodSoda })[which](ctx, t);
  blit(ctx, t);
};
