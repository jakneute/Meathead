// Fire that isn't a fire on the ground: balls of it (thrown, swung, spun on a bar), jets of it (out of a nozzle, a
// mouth), columns of it (out of a vent). Same deal as the ground fire: painted at half size and blown up chunky, the
// same red-to-white-hot ramp in hard bands, so it sits with the rest. Works in whatever frame the caller's set up.

type Ctx = CanvasRenderingContext2D;

const PX = 2;
export const FIRE_RAMP = ['#7F1D1D', '#B91C1C', '#EA580C', '#F59E0B', '#FDE047', '#FEF9C3'];
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** The little canvases it's painted in: taken in turn, so one's never painted over while the last copy out of it is
 * still being put down (reusing the one would make each wait on the one before). */
const BUFS: HTMLCanvasElement[] = [];
let bufAt = 0;

/**
 * Paint something chunky: `paint` draws in the caller's coordinates as normal, but into a half-size canvas covering
 * the box (x0, y0, w, h), which then goes down blown up 2x with no smoothing. Don't nest it.
 */
export const chunky = (ctx: Ctx, x0: number, y0: number, w: number, h: number, paint: (g: Ctx) => void) => {
  if (typeof document === 'undefined' || w <= 0 || h <= 0) return;
  const sx = Math.floor(x0 / PX) * PX, sy = Math.floor(y0 / PX) * PX;
  const cw = Math.ceil((w + x0 - sx) / PX) + 1, ch = Math.ceil((h + y0 - sy) / PX) + 1;
  bufAt = (bufAt + 1) % 8;
  const buf = BUFS[bufAt] ??= document.createElement('canvas');
  // (a clear margin round what's copied out: drawn turned, the copy's edges sample a pixel past it, and whatever an
  // earlier, bigger one left there would show as a faint box)
  if (buf.width < cw + 2) buf.width = cw + 2;
  if (buf.height < ch + 2) buf.height = ch + 2;
  const g = buf.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, cw + 2, ch + 2);
  g.save();
  g.beginPath(); g.rect(0, 0, cw, ch); g.clip();
  g.imageSmoothingEnabled = false;
  g.setTransform(1 / PX, 0, 0, 1 / PX, -sx / PX, -sy / PX);
  paint(g);
  g.restore();
  g.setTransform(1, 0, 0, 1, 0, 0);
  const prev = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(buf, 0, 0, cw, ch, sx, sy, cw * PX, ch * PX);
  ctx.imageSmoothingEnabled = prev;
};

export interface FireballOpts {
  seed?: number;
  /** The way it's going (any length): it streams a tail out the other way. */
  vx?: number; vy?: number;
  /** How long the tail is, in radii (default 1.6 when it's moving). */
  tail?: number;
  /** Start the ramp this many steps hotter (a white-hot one) or cooler (negative: a guttering one). */
  heat?: number;
}

/** The ball itself, painted into `g` (already chunky). */
const ball = (g: Ctx, x: number, y: number, r: number, f: number, o: FireballOpts) => {
  const seed = o.seed ?? 0;
  const sp = Math.hypot(o.vx ?? 0, o.vy ?? 0);
  const tx = sp ? -(o.vx ?? 0) / sp : 0, ty = sp ? -(o.vy ?? 0) / sp : 0;
  const tl = sp ? (o.tail ?? 1.6) * r : 0;
  const heat = Math.round(o.heat ?? 0);
  const layers = 5;
  for (let li = 0; li < layers; li++) {
    const col = FIRE_RAMP[Math.max(0, Math.min(FIRE_RAMP.length - 1, li + heat))];
    const s = 1 - li * 0.18;
    const lr = r * s * (0.92 + 0.08 * Math.sin(f * 0.7 + seed + li * 1.3));
    // (the hotter layers sit a little forward, so the cool side's the trailing one; sitting still, a little up, the heat
    // rising in it)
    const cx = x - tx * r * 0.12 * li, cy = y - (sp ? ty * r * 0.12 : r * 0.07) * li;
    g.fillStyle = col;
    g.beginPath(); g.arc(cx, cy, Math.max(1, lr), 0, Math.PI * 2); g.fill();
    // (lumps boiling round the edge)
    for (let j = 0; j < 5; j++) {
      const a = (j / 5) * Math.PI * 2 + f * 0.17 * (j % 2 ? 1 : -1) + seed;
      const pr = lr * (0.35 + 0.15 * Math.sin(f * 0.5 + j * 2 + seed));
      g.beginPath(); g.arc(cx + Math.cos(a) * lr * 0.7, cy + Math.sin(a) * lr * 0.7, Math.max(1, pr), 0, Math.PI * 2); g.fill();
    }
    // (the tail: a tongue streaming off behind, licking side to side)
    if (tl > 0 && li < 4) {
      const L = tl * (1 - li * 0.22), wob = Math.sin(f * 0.6 + seed + li) * lr * 0.35;
      const nx = -ty, ny = tx;
      g.beginPath();
      g.moveTo(cx + nx * lr * 0.95, cy + ny * lr * 0.95);
      g.quadraticCurveTo(cx + tx * L * 0.5 + nx * (lr * 0.6 + wob), cy + ty * L * 0.5 + ny * (lr * 0.6 + wob), cx + tx * (lr + L) + nx * wob, cy + ty * (lr + L) + ny * wob);
      g.quadraticCurveTo(cx + tx * L * 0.5 - nx * (lr * 0.6 - wob), cy + ty * L * 0.5 - ny * (lr * 0.6 - wob), cx - nx * lr * 0.95, cy - ny * lr * 0.95);
      g.closePath(); g.fill();
    }
  }
};

/** A ball of fire at (x, y), `r` across the middle of it: banded hot to the core, boiling at the edge, a tail if it's moving. */
export const drawFireball = (ctx: Ctx, x: number, y: number, r: number, f: number, o: FireballOpts = {}) => {
  if (r < 1) return;
  const sp = Math.hypot(o.vx ?? 0, o.vy ?? 0);
  const ext = r * 1.4 + (sp ? (o.tail ?? 1.6) * r + r : 0) + 4;
  chunky(ctx, x - ext, y - ext, ext * 2, ext * 2, g => ball(g, x, y, r, f, o));
  // (a spark spitting off it now and then)
  const seed = o.seed ?? 0;
  for (let i = 0; i < 2; i++) {
    const t = ((f * 1.3 + hash(seed + i) * 40) % 24) / 24;
    if (t > 0.8) continue;
    const a = hash(seed + i * 3 + Math.floor((f * 1.3 + hash(seed + i) * 40) / 24)) * Math.PI * 2;
    ctx.fillStyle = t < 0.4 ? '#FDE047' : '#F97316';
    ctx.fillRect(Math.round((x + Math.cos(a) * r * (1 + t * 1.5)) / PX) * PX, Math.round((y + Math.sin(a) * r * (1 + t * 1.5) - t * r) / PX) * PX, PX, PX);
  }
};

/** Several balls at once in one chunky pass (a fire bar's arm, a string of them): each { x, y, r, vx?, vy? }. */
export const drawFireballs = (ctx: Ctx, balls: { x: number; y: number; r: number; vx?: number; vy?: number }[], f: number, o: FireballOpts = {}) => {
  if (!balls.length) return;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const b of balls) {
    const ext = b.r * 1.4 + (b.vx || b.vy ? (o.tail ?? 1.6) * b.r + b.r : 0) + 4;
    x0 = Math.min(x0, b.x - ext); y0 = Math.min(y0, b.y - ext); x1 = Math.max(x1, b.x + ext); y1 = Math.max(y1, b.y + ext);
  }
  chunky(ctx, x0, y0, x1 - x0, y1 - y0, g => balls.forEach((b, i) => ball(g, b.x, b.y, b.r, f, { ...o, vx: b.vx, vy: b.vy, seed: (o.seed ?? 0) + i * 7 })));
};

/**
 * A stream of fire laid along +x from (0, 0) in `g`'s frame, `len` long, `hw(u)` its half-width `u` of the way along:
 * layer on layer hotter and thinner in to the core, each a body with billows rolling along it (so the edges boil and
 * the whole thing moves), the end of it breaking up into licks. `flow`: how fast the billows go.
 */
const stream = (g: Ctx, len: number, hw: (u: number) => number, f: number, seed: number, flow: number, ramp: number[]) => {
  const step = Math.max(4, len / 20);
  const layers = [[1, 1], [0.94, 0.8], [0.84, 0.6], [0.7, 0.42], [0.5, 0.24]];
  layers.forEach(([ls, ws], li) => {
    g.fillStyle = FIRE_RAMP[ramp[li]];
    const L = len * ls;
    const edge = (d: number, side: number) => side * hw(d / len) * ws * 0.9 * (1 + 0.12 * Math.sin(d * 0.07 - f * 0.7 * flow + seed + li + side * 1.7));
    g.beginPath(); g.moveTo(0, edge(0, -1));
    for (let d = step; d < L; d += step) g.lineTo(d, edge(d, -1));
    g.lineTo(L, 0);
    for (let d = Math.floor(L / step) * step; d > 0; d -= step) g.lineTo(d, edge(d, 1));
    g.lineTo(0, edge(0, 1)); g.closePath(); g.fill();
    // (the billows, rolling out along it and swelling as they go)
    const n = Math.max(3, Math.round(L / Math.max(8, hw(0.5) * 1.1)));
    for (let i = 0; i < n; i++) {
      const d = ((f * 3 * flow + (i + hash(seed + i) * 0.6) * (L / n) + seed * 7) % L + L) % L;
      const u = d / L, r = hw(d / len) * ws * (0.72 + 0.22 * Math.sin(f * 0.3 + i * 2.3 + li)) * (u > 0.85 ? 1 - (u - 0.85) / 0.15 * 0.6 : 1);
      if (r < 1) continue;
      const off = Math.sin(i * 2.1 + seed + f * 0.11) * hw(d / len) * ws * 0.3;
      g.beginPath(); g.arc(d, off, r, 0, Math.PI * 2); g.fill();
    }
  });
  // (licks breaking off the end and going on alone)
  for (let i = 0; i < 4; i++) {
    const t = ((f * 1.7 * flow + hash(seed + i) * 20) % 16) / 16;
    const r = hw(1) * 0.5 * (1 - t);
    if (r < 1) continue;
    g.fillStyle = FIRE_RAMP[t < 0.4 ? 3 : t < 0.7 ? 2 : 1];
    g.beginPath(); g.arc(len * (0.92 + t * 0.22), (hash(seed + i * 3) - 0.5) * hw(1) * 1.4, r, 0, Math.PI * 2); g.fill();
  }
};

/**
 * A jet of fire going off along +x from (x, y) (rotate or flip the frame for any other way): `len` long, `w` across
 * where it's widest, tight at the mouth and flaring out as it goes.
 */
export const drawFireJet = (ctx: Ctx, x: number, y: number, len: number, w: number, f: number, seed = 0) => {
  if (len < 2) return;
  const half = w * 1.1 + 6;
  chunky(ctx, x - 4, y - half, len + w + 12, half * 2, g => {
    g.translate(x, y);
    stream(g, len, u => w * 0.5 * (0.55 + 0.65 * Math.min(1, u * 1.4)), f, seed, 1.6, [0, 2, 3, 4, 5]);
  });
};

/**
 * A column of fire roaring straight up out of a hole: feet at (x, y), `hw` half-width at the foot narrowing to half
 * that at the top, `h` tall. `lava`: the foot of it's molten orange, not white-hot.
 */
export const drawFireColumn = (ctx: Ctx, x: number, y: number, hw: number, h: number, f: number, seed = 0, lava = false) => {
  if (h < 2) return;
  chunky(ctx, x - hw * 1.6 - 4, y - h - hw - 8, hw * 3.2 + 8, h + hw + 12, g => {
    g.translate(x, y); g.rotate(-Math.PI / 2);
    stream(g, h, u => hw * 1.1 * (1 - u * 0.5), f, seed, 1.2, lava ? [0, 1, 2, 3, 4] : [0, 2, 3, 4, 5]);
  });
};

/**
 * Flames licking up off something that's on fire (a body, a head of hair, a pair of antlers), rather than a fire on the
 * ground: no bed under them, just teardrop tongues, round at the foot and licking up to a point, scattered over the box
 * `w` wide round x and from y up, `h` tall at the tallest. All their outer bands go down first, then the next band in, so
 * they run together into one blaze. `n` tongues (default by width); `k` 0..1, how much it's going; `lean`, the tips blown
 * over sideways (a fraction of their height: a torch in a gale).
 */
export const drawFlameLicks = (ctx: Ctx, x: number, y: number, w: number, h: number, f: number, o: { seed?: number; n?: number; k?: number; lean?: number } = {}) => {
  const seed = o.seed ?? 0, k = o.k ?? 1;
  if (k <= 0.02 || h < 2) return;
  const n = o.n ?? Math.max(3, Math.round(w / 9));
  const tongues: [number, number, number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const u = n === 1 ? 0.5 : i / (n - 1);
    const bx = x + (u - 0.5) * w * 0.8 + (hash(seed + i * 3) - 0.5) * w * 0.15;
    const mid = 1 - Math.abs(u - 0.5) * 1.2;
    const by = y - hash(seed + i * 5) * h * 0.35 * mid;
    const flick = 0.7 + 0.3 * (0.5 + 0.5 * Math.sin(f * (0.25 + hash(seed + i) * 0.2) + i * 2.3 + seed));
    const th = h * k * (0.6 + 0.4 * mid) * flick;
    const r = Math.max(2, Math.min(w / n * 0.9 + 1, h * 0.22)) * (0.8 + 0.2 * k);
    const lean = (Math.sin(f * 0.11 + i * 1.7 + seed) * 0.2 + (o.lean ?? 0)) * th;
    tongues.push([bx, by, r, th, lean]);
  }
  const pad = w * 0.5 + 6 + Math.abs(o.lean ?? 0) * h;
  chunky(ctx, x - w / 2 - pad, y - h * 1.1 - pad, w + pad * 2, h * 1.1 + pad * 2, g => {
    const layers = [[1, 1], [0.8, 0.82], [0.6, 0.62], [0.4, 0.42], [0.22, 0.24]];
    layers.forEach(([rs, hs], li) => {
      g.fillStyle = FIRE_RAMP[[0, 2, 3, 4, 5][li]];
      for (const [bx, by, r, th, lean] of tongues) {
        const rr = r * rs, tt = th * hs, cy = by - r * 0.25 * li;
        if (rr < 0.5) continue;
        g.beginPath();
        g.moveTo(bx + rr, cy);
        g.arc(bx, cy, rr, 0, Math.PI);
        g.bezierCurveTo(bx - rr * 1.05, cy - tt * 0.45, bx - rr * 0.3 + lean * 0.5, cy - tt * 0.75, bx + lean, cy - tt);
        g.bezierCurveTo(bx + rr * 0.4 + lean * 0.5, cy - tt * 0.7, bx + rr * 1.05, cy - tt * 0.4, bx + rr, cy);
        g.fill();
      }
    });
    // (licks breaking off the tips)
    tongues.forEach(([bx, by, r, th, lean], i) => {
      const t = ((f * 1.5 + hash(seed + i * 7) * 30) % 24) / 24;
      if (t > 0.7 || i % 2) return;
      g.fillStyle = FIRE_RAMP[t < 0.35 ? 3 : 2];
      g.beginPath(); g.arc(bx + lean * 1.2, by - th * (1.05 + t * 0.4), Math.max(1, r * 0.35 * (1 - t)), 0, Math.PI * 2); g.fill();
    });
  });
  // (a spark or two spitting off)
  for (let i = 0; i < 2; i++) {
    const t = ((f * 1.2 + hash(seed + i * 11) * 60) % 60) / 60;
    if ((f + i) % 6 === 5) continue;
    ctx.fillStyle = t < 0.5 ? '#FDE047' : '#F97316';
    ctx.fillRect(Math.round((x + (hash(seed + i * 13) - 0.5) * w + Math.sin(t * 6 + i) * 4) / PX) * PX, Math.round((y - h * k * (0.6 + t)) / PX) * PX, PX, PX);
  }
};

let dither: HTMLCanvasElement | null = null;
const dithers = new Map<string, CanvasPattern>();
/** A checkerboard of `color` (every other chunky pixel), for filling inside `chunky`: the ragged seam a band fades out on. */
export const ditherFill = (g: Ctx, color: string): CanvasPattern | string => {
  let p = dithers.get(color);
  if (p) return p;
  if (typeof document === 'undefined') return color;
  if (!dither) dither = document.createElement('canvas');
  dither.width = 2; dither.height = 2;
  const d = dither.getContext('2d')!;
  d.clearRect(0, 0, 2, 2); d.fillStyle = color; d.fillRect(0, 0, 1, 1); d.fillRect(1, 1, 1, 1);
  p = g.createPattern(dither, 'repeat')!;
  // (one cell of it to one chunky pixel)
  p.setTransform(new DOMMatrix([PX, 0, 0, PX, 0, 0]));
  dithers.set(color, p);
  return p;
};
