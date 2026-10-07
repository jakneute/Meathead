// The weapon-get screen's shots, from the camera's side: what each weapon does to the lens, and to the camera (see
// weaponShot.ts for him). Drawn on a canvas at half the screen's resolution and blown up square, so it's in chunky
// pixels: frost, char and static come in stepped colors and ordered dithering, the SNES way. Everything's in the
// screen's units (800 x 600), timed in ms from when he pulls the trigger (`e`); `hit` is when it reaches the lens.

import type { SoundType } from '../../types';
import { INK, hash, flames } from './art/ink';
import { rock, ShotWeapon } from './weaponShot';

type Ctx = CanvasRenderingContext2D;
type Pt = [number, number];

export const FX_W = 400, FX_H = 300;
const W = 800, H = 600;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const easeIn = (v: number) => v * v * v;
const easeOut = (v: number) => 1 - (1 - v) ** 3;
const easeOutBounce = (x: number) => {
  const n = 7.5625, d = 2.75;
  if (x < 1 / d) return n * x * x;
  if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
  if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
  return n * (x -= 2.625 / d) * x + 0.984375;
};

// ---------------------------------------------------------------------------
// The sounds each one makes (ms from the trigger): fired, hitting, and what it does after
// ---------------------------------------------------------------------------

export type Cue = [at: number, sound: SoundType, vol?: number, pitch?: number];
export const SHOT_SFX: Record<ShotWeapon, Cue[]> = {
  SHOTGUN: [[0, 'ice', 1.3], [140, 'clink', 1.2], [150, 'crack', 0.8, 4], [660, 'crack', 1.1], [840, 'glass', 1.4], [870, 'clink', 1, -3]],
  FLAMETHROWER: [[0, 'flame', 1.4], [150, 'ignite', 1.3], [300, 'flame', 1.1, -2], [570, 'thud', 1.2]],
  BOULDER: [[0, 'whoosh', 1.4, -4], [170, 'crunch', 1.5], [175, 'glass', 1.2], [180, 'slam', 1], [930, 'thud', 1.3]],
  TSUNAMI: [[0, 'tsunami', 1.4], [190, 'splash', 1.5], [420, 'glug', 1.1], [640, 'glug', 1, -3]],
  NEEDLES: [[0, 'dart', 1.3], [140, 'clink', 1.1], [200, 'clink', 1.1, 2], [260, 'clink', 1.1, -2], [1010, 'thud', 1.2]],
  TASER: [[0, 'taser', 1.4], [110, 'taser', 1.2, 3], [330, 'taser', 1, -3], [560, 'taser', 0.9, 5], [800, 'click', 1.2], [870, 'beep', 0.6, -12]],
  SLUDGE: [[0, 'barf', 1.4], [160, 'splat', 1.4], [170, 'poopsplat', 1]],
  OIL_ROCKET: [[0, 'oil', 1.2], [40, 'whoosh', 1.2, -2], [300, 'splat', 1.3], [300, 'oil', 1, -4], [400, 'beep', 0.7], [500, 'beep', 0.7], [600, 'boom', 1.5], [610, 'crash', 1.2]],
};

// ---------------------------------------------------------------------------
// What happens to the camera (the picture it's taking): moved, frozen, rolled, switched off
// ---------------------------------------------------------------------------

export interface ShotCam {
  x: number; y: number; rot: number; scale: number;
  /** The picture squashed (a set switching off). */
  sx: number; sy: number;
  /** The picture stops (frozen solid). */
  freeze: boolean;
  /** The picture rolling (px down, wrapping). */
  roll: number;
  /** The picture in negative (a flash of current). */
  invert: boolean;
  /** Shaking (px). */
  shake: number;
}

export const shotCam = (w: ShotWeapon, e: number, hit: number): ShotCam => {
  const c: ShotCam = { x: 0, y: 0, rot: 0, scale: 1, sx: 1, sy: 1, freeze: false, roll: 0, invert: false, shake: 0 };
  const f = e - hit;
  if (f < 0) return c;
  switch (w) {
    case 'SHOTGUN':
      c.freeze = true; c.shake = f < 180 ? 10 : f > 700 && f < 840 ? 16 : 0;
      break;
    case 'FLAMETHROWER': {
      // (it topples over, burning: the punch's fall)
      c.shake = f < 300 ? 6 : 0;
      const fall = clamp01((f - 180) / 640);
      c.x = easeOutBounce(fall) * 190; c.y = -easeOutBounce(fall) * 20; c.rot = easeOutBounce(fall) * 82; c.scale = 1 - fall * 0.4;
      break;
    }
    case 'BOULDER': {
      // (knocked flying: it spins off, end over end, comes down, bounces, lies there skewed)
      c.shake = f < 160 ? 26 : 0;
      const k = clamp01((f - 60) / 700), land = clamp01((f - 760) / 260);
      c.rot = easeOut(k) * 380 + Math.sin(land * Math.PI) * 6 * (1 - land);
      c.x = -Math.sin(k * Math.PI) * 260 + k * 120; c.y = -Math.sin(k * Math.PI) * 160 + k * 60 - Math.abs(Math.sin(land * Math.PI * 2)) * 30 * (1 - land);
      c.scale = 1 - k * 0.3;
      break;
    }
    case 'TSUNAMI': {
      // (washed away: rocking in the swell, going under)
      c.shake = f < 120 ? 14 : 0;
      const k = clamp01(f / 900);
      c.rot = Math.sin(f / 260) * 7 * (0.4 + k); c.x = Math.sin(f / 340) * 26; c.y = k * 70 + Math.sin(f / 200) * 8;
      c.sx = 1 + Math.sin(f / 120) * 0.025; c.scale = 1 + k * 0.08;
      break;
    }
    case 'NEEDLES': {
      // (the dope hits: it swims, sways, and then it keels over, slow, out cold)
      c.shake = f < 160 ? 4 : 0;
      const k = clamp01(f / 500), keel = clamp01((f - 560) / 310);
      c.rot = Math.sin(f / 230) * 7 * k + easeIn(keel) * 96;
      c.x = Math.sin(f / 330) * 34 * k + easeIn(keel) * 120; c.y = Math.sin(f / 410) * 16 * k + easeIn(keel) * 60;
      c.scale = 1 + Math.sin(f / 270) * 0.07 * k - keel * 0.2;
      c.sx = 1 + Math.sin(f / 180) * 0.05 * k;
      break;
    }
    case 'TASER': {
      // (fried: flashing negative, rolling, then switching off like an old set: squashed to a line, the line to a dot)
      c.shake = f < 500 ? 5 : 0;
      c.invert = (f < 70) || (f > 150 && f < 190) || (f > 330 && f < 360) || (f > 560 && f < 580);
      if (f > 240 && f < 740) c.roll = ((f - 240) * 1.4) % 220;
      const off = clamp01((f - 760) / 90), dot = clamp01((f - 850) / 90);
      c.sy = Math.max(0.006, 1 - easeIn(off)); c.sx = Math.max(0.004, 1 - easeIn(dot));
      break;
    }
    case 'SLUDGE': {
      // (it sags under the weight of it)
      c.shake = f < 140 ? 8 : 0;
      const k = clamp01(f / 900);
      c.rot = -easeOut(k) * 9; c.y = easeOut(k) * 40;
      break;
    }
    case 'OIL_ROCKET': {
      // (the blast: it's blown away, spinning off up and out)
      const b = f - 300;
      c.shake = f < 80 ? 8 : b > 0 && b < 380 ? 30 * (1 - b / 380) : 0;
      if (b > 0) { const k = clamp01(b / 520); c.rot = -easeOut(k) * 240; c.x = easeOut(k) * -200; c.y = easeOut(k) * -260; c.scale = 1 + easeOut(k) * 0.5; }
      break;
    }
  }
  return c;
};

// ---------------------------------------------------------------------------
// The kit: dithering, noise, the pixel layer
// ---------------------------------------------------------------------------

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);
const bayer = (x: number, y: number) => BAYER[(y & 3) * 4 + (x & 3)];

/** Smooth noise over the low-res canvas (0..1), made once. */
let noiseField: Float32Array | null = null;
const noise = () => {
  if (noiseField) return noiseField;
  const n = new Float32Array(FX_W * FX_H);
  const cell = (cx: number, cy: number, s: number) => hash(cx * 17.3 + cy * 91.7 + s * 3.1);
  for (let y = 0; y < FX_H; y++) for (let x = 0; x < FX_W; x++) {
    let v = 0, amp = 0.6;
    for (const [sz, s] of [[40, 1], [16, 2], [6, 3]] as const) {
      const gx = x / sz, gy = y / sz, ix = Math.floor(gx), iy = Math.floor(gy), fx = gx - ix, fy = gy - iy;
      const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
      const a = lerp(cell(ix, iy, s), cell(ix + 1, iy, s), sx), b = lerp(cell(ix, iy + 1, s), cell(ix + 1, iy + 1, s), sx);
      v += lerp(a, b, sy) * amp; amp *= 0.5;
    }
    n[y * FX_W + x] = v / 1.05;
  }
  noiseField = n;
  return n;
};

/** A colour as [r, g, b]. */
const rgb = (hex: string): [number, number, number] => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];

let pixCanvas: HTMLCanvasElement | null = null;
let pixData: ImageData | null = null;
/**
 * The pixel layer: `fn` gives each low-res pixel a colour (index into `ramp`, or -1 for none) and it's laid over
 * what's drawn so far.
 */
const pixels = (ctx: Ctx, ramp: string[], alpha: number, fn: (x: number, y: number, i: number) => number) => {
  if (!pixCanvas) { pixCanvas = document.createElement('canvas'); pixCanvas.width = FX_W; pixCanvas.height = FX_H; }
  const pc = pixCanvas.getContext('2d')!;
  if (!pixData) pixData = pc.createImageData(FX_W, FX_H);
  const d = pixData.data, cols = ramp.map(rgb), a = Math.round(alpha * 255);
  for (let y = 0, i = 0; y < FX_H; y++) for (let x = 0; x < FX_W; x++, i++) {
    const c = fn(x, y, i), o = i * 4;
    if (c < 0) { d[o + 3] = 0; continue; }
    const col = cols[Math.min(cols.length - 1, c)];
    d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = a;
  }
  pc.putImageData(pixData, 0, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false; ctx.drawImage(pixCanvas, 0, 0); ctx.restore();
};

/** A jagged bolt from a to b (its points). */
const bolt = (a: Pt, b: Pt, seed: number, amp: number, n = 9): Pt[] => {
  const pts: Pt[] = [a];
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  for (let i = 1; i < n; i++) { const k = i / n, o = (hash(seed * 13.1 + i * 7.7) - 0.5) * 2 * amp; pts.push([a[0] + dx * k + nx * o, a[1] + dy * k + ny * o]); }
  pts.push(b);
  return pts;
};
const strokePts = (ctx: Ctx, pts: Pt[], color: string, w: number) => {
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineJoin = 'miter'; ctx.lineCap = 'square';
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]); ctx.stroke();
};
/** Electricity: a fat glow, the bolt, a white-hot core. */
const zap = (ctx: Ctx, pts: Pt[], w: number) => { strokePts(ctx, pts, 'rgba(34, 211, 238, 0.35)', w * 4); strokePts(ctx, pts, '#22D3EE', w * 1.6); strokePts(ctx, pts, '#ECFEFF', w * 0.6); };

/** Cracks in the glass: each a black line with a white one along it. */
const cracks = (ctx: Ctx, lines: Pt[][], w = 4) => {
  for (const [c, lw] of [[INK, w], ['#FFFFFF', w * 0.4]] as const) for (const l of lines) strokePts(ctx, l, c, lw);
};

/** A starburst crack where something hit the glass: a few short jagged legs out of it. */
const starCrack = (x: number, y: number, r: number, seed: number): Pt[][] =>
  Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2 + hash(seed + i) * 0.8, l = r * (0.5 + hash(seed * 3 + i) * 0.7); return bolt([x, y], [x + Math.cos(a) * l, y + Math.sin(a) * l], seed * 5 + i, l * 0.12, 3); });

/** A lumpy blob (a splat), `n` lumps round it. */
const blob = (ctx: Ctx, x: number, y: number, r: number, seed: number, n = 11, squash = 1) => {
  const pts: Pt[] = Array.from({ length: n }, (_, k) => { const a = (k / n) * Math.PI * 2, w = r * (0.72 + hash(seed + k * 7.3) * 0.5); return [x + Math.cos(a) * w, y + Math.sin(a) * w * squash]; });
  const mid = (k: number) => [(pts[k % n][0] + pts[(k + 1) % n][0]) / 2, (pts[k % n][1] + pts[(k + 1) % n][1]) / 2];
  const m0 = mid(0);
  ctx.moveTo(m0[0], m0[1]);
  for (let k = 0; k < n; k++) { const p = pts[(k + 1) % n], m = mid(k + 1); ctx.quadraticCurveTo(p[0], p[1], m[0], m[1]); }
  ctx.closePath();
};

/** Flames the size of the screen: the inked tongues (ink.ts), fewer and fatter, scaled up. */
const bigFlames = (ctx: Ctx, x: number, y: number, w: number, h: number, seed: number) => {
  const k = 6;
  ctx.save(); ctx.scale(k, k); flames(ctx, x / k, y / k, w / k, h / k, seed); ctx.restore();
};

/** Stepped rings (a banded radial: the SNES way of a glow). */
const rings = (ctx: Ctx, x: number, y: number, r: number, cols: string[]) => {
  cols.forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r * (1 - i / cols.length), 0, Math.PI * 2); ctx.fill(); });
};

/** Banded bars down the screen (a stepped gradient, top to bottom). */
const bands = (ctx: Ctx, cols: string[], y0 = 0, y1 = H) => {
  const h = (y1 - y0) / cols.length;
  cols.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, Math.floor(y0 + i * h), W, Math.ceil(h) + 1); });
};

// ---------------------------------------------------------------------------
// The shots
// ---------------------------------------------------------------------------

/** Where on the lens each of a spread lands. */
const SPREAD: Pt[] = [[400, 290], [300, 220], [520, 210], [250, 360], [470, 380], [600, 300], [360, 140], [180, 250], [640, 450]];

const ICE = ['#F0F9FF', '#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8'];

/** Shatter: the frozen glass broken into pieces (a jittered grid of them), each falling its own way. */
const SHARDS = (() => {
  const cols = 6, rows = 5, v: Pt[][] = [];
  for (let j = 0; j <= rows; j++) { v.push([]); for (let i = 0; i <= cols; i++) { const edge = i === 0 || j === 0 || i === cols || j === rows; v[j].push([(i / cols) * W + (edge ? 0 : (hash(i * 7 + j * 13) - 0.5) * 90), (j / rows) * H + (edge ? 0 : (hash(i * 11 + j * 5) - 0.5) * 80)]); } }
  const out: { pts: Pt[]; c: Pt; delay: number; spin: number; drift: number }[] = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const quad = [v[j][i], v[j][i + 1], v[j + 1][i + 1], v[j + 1][i]];
    // (each cell split corner to corner: two shards)
    for (const tri of hash(i + j * 3) > 0.5 ? [[quad[0], quad[1], quad[2]], [quad[0], quad[2], quad[3]]] : [[quad[0], quad[1], quad[3]], [quad[1], quad[2], quad[3]]]) {
      const c: Pt = [(tri[0][0] + tri[1][0] + tri[2][0]) / 3, (tri[0][1] + tri[1][1] + tri[2][1]) / 3];
      out.push({ pts: tri as Pt[], c, delay: Math.hypot(c[0] - 400, c[1] - 300) * 0.12 + hash(out.length) * 40, spin: (hash(out.length * 3) - 0.5) * 6, drift: (c[0] - 400) * 0.6 + (hash(out.length * 5) - 0.5) * 100 });
    }
  }
  return out;
})();

const shotgun = (ctx: Ctx, e: number, src: Pt, hit: number) => {
  const f = e - hit;
  if (f < 0) {
    // The pellets: a spread of ice, coming at the lens, trailing frost
    const p = clamp01(e / hit);
    SPREAD.forEach(([tx, ty], i) => {
      const k = easeIn(clamp01(p * (1 + i * 0.03))), x = lerp(src[0], tx, k), y = lerp(src[1], ty, k), r = 3 + k * 22;
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.5)'; ctx.lineWidth = r * 0.8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(lerp(src[0], tx, k * 0.6), lerp(src[1], ty, k * 0.6)); ctx.lineTo(x, y); ctx.stroke();
      rings(ctx, x, y, r, ['#0EA5E9', '#7DD3FC', '#E0F2FE', '#FFFFFF']);
    });
    return;
  }
  if (f > 700) {
    // Shattered: the frozen glass in pieces, falling away off the dead lens
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const g = f - 700;
    for (const s of SHARDS) {
      const k = Math.max(0, g - s.delay), dy = 0.0016 * k * k, dx = s.drift * Math.min(1, k / 600) * 0.4, a = s.spin * k / 1000;
      if (k === 0) { ctx.fillStyle = '#BAE6FD'; ctx.beginPath(); s.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill(); continue; }
      ctx.save(); ctx.translate(s.c[0] + dx, s.c[1] + dy); ctx.rotate(a); ctx.scale(0.96, 0.96);
      ctx.beginPath(); s.pts.forEach(([x, y], i) => i ? ctx.lineTo(x - s.c[0], y - s.c[1]) : ctx.moveTo(x - s.c[0], y - s.c[1])); ctx.closePath();
      ctx.fillStyle = (s.c[0] + s.c[1]) % 3 < 1.5 ? '#BAE6FD' : '#7DD3FC'; ctx.fill();
      ctx.strokeStyle = '#F0F9FF'; ctx.lineWidth = 3; ctx.stroke();
      ctx.restore();
    }
    return;
  }
  // Frozen over: a cold cast over all of it, frost growing out from every hit, ferning, till it's white
  bands(ctx, ['rgba(186,230,253,0.10)', 'rgba(125,211,252,0.16)', 'rgba(56,189,248,0.22)', 'rgba(14,165,233,0.28)'].map(c => c.replace(/0\.\d+\)$/, m => `${(parseFloat(m) * clamp01(f / 300 + 0.3)).toFixed(3)})`)));
  const n = noise(), grow = 40 + f * 0.75;
  const spots = SPREAD.map(([x, y]) => [x / 2, y / 2] as Pt);
  pixels(ctx, ICE, 0.92, (x, y, i) => {
    let d = 1e9;
    for (const [sx, sy] of spots) { const dd = Math.hypot(x - sx, y - sy); if (dd < d) d = dd; }
    const v = 1 - (d + n[i] * 40) / (grow / 2);
    if (v <= 0 || v < bayer(x, y) * 0.9) return -1;
    return Math.min(4, Math.floor((1 - v) * 3 + n[i] * 2.4));
  });
  // (the starbursts where they hit)
  cracks(ctx, SPREAD.flatMap(([x, y], i) => starCrack(x, y, 40, i + 1)), 3);
  // (and then the cracks running right across it: about to go)
  if (f > 520) {
    const k = clamp01((f - 520) / 140);
    const legs = Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * Math.PI * 2 + 0.3, l = 520 * k; return bolt([400, 290], [400 + Math.cos(a) * l, 290 + Math.sin(a) * l], 40 + i, 30 * k, 7); });
    cracks(ctx, legs, 5);
  }
};

const flamethrower = (ctx: Ctx, e: number, src: Pt, hit: number) => {
  const f = e - hit;
  if (f < 0) {
    // The jet: a widening stream of fire out of the nozzle, at the lens
    const p = clamp01(e / hit);
    for (let i = 0; i < 14; i++) {
      const k = (i / 14) * p, x = lerp(src[0], 400, easeIn(k + 0.05)), y = lerp(src[1], 300, easeIn(k + 0.05)), r = 8 + easeIn(k) * 340 + hash(i + Math.floor(e / 40)) * 10;
      rings(ctx, x, y, r, ['#B91C1C', '#EA580C', '#F59E0B', '#FDE047', '#FEF9C3']);
    }
    return;
  }
  // The wash: the whole lens in flames for a moment, then burning down to the bottom edge
  const heat = clamp01(1 - (f - 120) / 700);
  ctx.fillStyle = `rgba(234, 88, 12, ${0.55 * heat})`; ctx.fillRect(0, 0, W, H);
  // Char: the picture blistering and blackening in from the edges, an ember line along where it's burning
  const n = noise(), k = clamp01((f - 60) / 650);
  pixels(ctx, ['#000000', '#1C0A04', '#3B1606', '#7C2D12', '#EA580C', '#FDE047'], 1, (x, y, i) => {
    const edge = Math.min(x, FX_W - x, y * 1.2, (FX_H - y) * 0.7) / 150;
    const v = k * 1.05 - edge - n[i] * 0.9 + 0.12;
    if (v <= 0) return -1;
    if (v < 0.06) return bayer(x, y) < 0.5 ? 5 : 4;
    if (v < 0.14) return 3;
    if (v < 0.25) return bayer(x, y) < 0.5 ? 2 : 3;
    return v < 0.4 ? 1 : 0;
  });
  // Melting: runs of it sliding down off the top, blistering
  ctx.fillStyle = '#1C0A04';
  for (let i = 0; i < 12; i++) {
    const x = 40 + i * 66 + hash(i) * 30, len = clamp01((f - 120 - hash(i * 3) * 300) / 700) * (200 + hash(i * 5) * 260), w = 10 + hash(i * 7) * 16;
    if (len <= 0) continue;
    ctx.fillRect(x - w / 2, 0, w, len); ctx.beginPath(); ctx.arc(x, len, w / 2 + 3, 0, Math.PI * 2); ctx.fill();
  }
  // The flames: a wall of them up from the bottom, licking higher at first
  const fh = 200 + 460 * heat;
  bigFlames(ctx, -20, H + 20, W + 40, fh, Math.floor(f / 70));
  bigFlames(ctx, 60, H + 40, W - 120, fh * 0.6, Math.floor(f / 70) + 9);
};

const boulder = (ctx: Ctx, e: number, src: Pt, hit: number) => {
  const f = e - hit;
  const WEB_C: Pt = [400, 300];
  if (f >= 0) {
    // The lens spiderwebbed: legs out from where it hit, rings across them, a crater of crushed glass in the middle
    const legs = Array.from({ length: 13 }, (_, i) => { const a = (i / 13) * Math.PI * 2 + hash(i) * 0.3; return Array.from({ length: 7 }, (_, j) => { const r = j === 0 ? 0 : 40 + j * 85 + hash(i * 9 + j) * 30; return [WEB_C[0] + Math.cos(a + (hash(i * 3 + j) - 0.5) * 0.12) * r, WEB_C[1] + Math.sin(a + (hash(i * 3 + j) - 0.5) * 0.12) * r] as Pt; }); });
    const rings2: Pt[][] = [];
    for (let j = 1; j < 6; j++) for (let i = 0; i < 13; i++) if (hash(i * 5 + j * 11) > 0.25) { const a = legs[i][j], b = legs[(i + 1) % 13][j]; rings2.push([a, [(a[0] + b[0]) / 2 + (WEB_C[0] - (a[0] + b[0]) / 2) * 0.08, (a[1] + b[1]) / 2 + (WEB_C[1] - (a[1] + b[1]) / 2) * 0.08], b]); }
    cracks(ctx, [...legs, ...rings2], 5);
    rings(ctx, WEB_C[0], WEB_C[1], 46, ['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.6)', 'rgba(226,232,240,0.85)']);
    cracks(ctx, starCrack(WEB_C[0], WEB_C[1], 60, 77), 3);
    if (f < 90) { ctx.fillStyle = `rgba(255,255,255,${1 - f / 90})`; ctx.fillRect(0, 0, W, H); }
  }
  // The rock: thrown, coming at the lens end over end till it's all there is; then dropping away off it
  if (f < 260) {
    const p = clamp01(e / hit), k = easeIn(p);
    const x = f < 0 ? lerp(src[0], 400, k) : 400, y = f < 0 ? lerp(src[1], 300, k) : 300 + 0.016 * f * f;
    const r = f < 0 ? 50 + k * 480 : 530;
    rock(ctx, x, y, r, e / 160);
  }
};

const tsunami = (ctx: Ctx, e: number, src: Pt, hit: number) => {
  const f = e - hit;
  const WATER = ['rgba(30,64,175,0.45)', 'rgba(29,78,216,0.5)', 'rgba(30,58,138,0.58)', 'rgba(23,37,84,0.66)', 'rgba(15,23,42,0.74)'];
  if (f < 0) {
    // The wall of water: out of the nozzle, rearing up over the lens, the lip of it curling over at you, foam on it
    const p = clamp01(e / hit), q = easeIn(p) * 0.85 + p * 0.15;
    const top = lerp(H - 60, -40, q), lipR = 60 + q * 240;
    ctx.strokeStyle = 'rgba(147,197,253,0.85)'; ctx.lineWidth = 24 + p * 120; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(src[0], src[1]); ctx.lineTo(lerp(src[0], 400, p), lerp(src[1], top + lipR, p)); ctx.stroke();
    const crest = (x: number) => top + Math.sin(x / 90 + e / 50) * 16 + Math.abs(x - 400) * 0.12;
    // (the face of it: stepped blues, dark at the bottom, lit up toward the crest; streaks running up it)
    const body = () => { ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, crest(x)); ctx.lineTo(W, H); ctx.closePath(); };
    ctx.save(); body(); ctx.clip();
    bands(ctx, ['#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A'], top, H);
    ctx.fillStyle = 'rgba(219,234,254,0.5)';
    for (let i = 0; i < 12; i++) { const x = hash(i * 3.3) * W, y = top + 40 + hash(i * 1.7) * (H - top); ctx.fillRect(x, y, 6, 50 + hash(i) * 60); }
    ctx.restore();
    // (the lip, curling over toward the lens: its underside dark, foam rolling along its edge, spray off it)
    ctx.fillStyle = '#1E3A8A'; ctx.beginPath(); ctx.moveTo(0, crest(0) + 10);
    for (let x = 0; x <= W; x += 20) ctx.lineTo(x, crest(x) + lipR * 0.55 + Math.sin(x / 40 + e / 40) * 10);
    for (let x = W; x >= 0; x -= 20) ctx.lineTo(x, crest(x) + 10);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3B82F6'; ctx.beginPath(); ctx.moveTo(0, crest(0));
    for (let x = 0; x <= W; x += 20) ctx.lineTo(x, crest(x) + lipR * 0.4 + Math.sin(x / 40 + e / 40) * 8);
    for (let x = W; x >= 0; x -= 20) ctx.lineTo(x, crest(x) - 6);
    ctx.closePath(); ctx.fill();
    for (let x = 0; x <= W; x += 12) {
      const y = crest(x) + lipR * 0.4 + Math.sin(x / 40 + e / 40) * 8;
      ctx.fillStyle = (x / 12) % 2 ? '#F0F9FF' : '#BFDBFE'; ctx.fillRect(x, y - 10, 12, 14 + hash(x) * 10);
      ctx.fillStyle = '#F0F9FF'; ctx.fillRect(x, crest(x) - 8, 12, 10);
      if (hash(x * 0.7 + Math.floor(e / 60)) > 0.6) ctx.fillRect(x + 2, crest(x) - 24 - hash(x) * 30, 6, 6);
    }
    return;
  }
  // Under: all of it drowned, stepped blues, light wavering through in bands, bubbles going up
  bands(ctx, WATER);
  for (let i = 0; i < 5; i++) {
    const y = ((i * 140 + f * 0.12) % 700) - 50;
    ctx.fillStyle = 'rgba(191,219,254,0.18)';
    ctx.beginPath(); ctx.moveTo(0, y); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, y + Math.sin(x / 90 + f / 200 + i) * 18); ctx.lineTo(W, y + 22); ctx.lineTo(0, y + 22); ctx.closePath(); ctx.fill();
  }
  for (let i = 0; i < 26; i++) {
    const r = 4 + hash(i) * 14, x = hash(i * 3) * W + Math.sin(f / 150 + i) * 12, y = H + 40 - ((f * (0.35 + hash(i * 7) * 0.5) + hash(i * 5) * 600) % (H + 80));
    ctx.strokeStyle = '#DBEAFE'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - r * 0.5, y - r * 0.6, 4, 4);
  }
  // The splash on the glass: streaks running
  if (f < 400) { ctx.fillStyle = `rgba(240,249,255,${0.7 * (1 - f / 400)})`; ctx.fillRect(0, 0, W, H); }
  // Then it shorts out: static fizzing up over it, till there's nothing
  if (f > 520) {
    const k = clamp01((f - 520) / 380), seed = Math.floor(f / 33);
    if (k >= 1) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
    pixels(ctx, ['#000000', '#3F3F46', '#A1A1AA', '#F4F4F5'], 1, (x, y) => {
      const r = hash(x * 0.37 + y * 13.1 + seed * 7.3);
      if (k < 1 && r > k * 1.1) return -1;
      // (tearing: whole rows gone bright)
      const row = hash(y * 3.3 + seed) > 0.97;
      return row ? 3 : Math.floor(hash(x * 1.7 + y * 0.9 + seed) * 4) * (k >= 1 && r > 0.15 ? 0 : 1);
    });
  }
};

/** Where the darts stick, and when each lands (ms after the first). */
const DARTS: [Pt, number][] = [[[330, 250], 0], [[480, 200], 60], [[420, 370], 120]];

const needles = (ctx: Ctx, e: number, src: Pt, hit: number) => {
  const f = e - hit;
  // Woozy: pink pulsing in from the edges, in stepped rings, swirls going round
  if (f > 0) {
    const k = clamp01(f / 400), pulse = 0.5 + 0.5 * Math.sin(f / 160);
    const cols = ['rgba(134,16,111,', 'rgba(192,19,158,', 'rgba(255,43,214,'];
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = cols[i] + ((0.18 + pulse * 0.1) * k).toFixed(3) + ')';
      ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.ellipse(400, 300, 520 - i * 70 - pulse * 30, 400 - i * 55 - pulse * 24, 0, 0, Math.PI * 2, true); ctx.fill('evenodd');
    }
    ctx.strokeStyle = `rgba(255,194,243,${0.45 * k})`; ctx.lineWidth = 6;
    for (const [cx, cy, dir] of [[150, 130, 1], [660, 470, -1], [640, 120, 1]] as const) {
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 5; a += 0.3) { const r = a * 6, ang = a * dir + f / 300 * dir; a === 0 ? ctx.moveTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r) : ctx.lineTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r); }
      ctx.stroke();
    }
  }
  DARTS.forEach(([[tx, ty], lag], i) => {
    const land = hit + lag, start = lag * 0.6;
    if (e < start) return;
    if (e < land) {
      // (flying: needle first, getting bigger)
      const k = easeIn(clamp01((e - start) / (land - start))), x = lerp(src[0], tx, k), y = lerp(src[1], ty, k);
      dartNoseOn(ctx, x, y, 6 + k * 34, 0);
      return;
    }
    // (stuck in the glass, quivering, a star of cracks round it)
    const g = e - land, quiver = Math.sin(g / 18) * 6 * Math.max(0, 1 - g / 300);
    cracks(ctx, starCrack(tx, ty, 50, 30 + i), 3);
    dartNoseOn(ctx, tx + quiver, ty, 40, quiver);
  });
};

/** A dart, its needle in the lens, seen down its length: the red hub, the pink barrel round it, the plunger beyond. */
const dartNoseOn = (ctx: Ctx, x: number, y: number, r: number, lean: number) => {
  const ox = lean * 0.6 - r * 0.25, oy = -r * 0.3;
  ctx.fillStyle = '#9CA3AF'; ctx.beginPath(); ctx.ellipse(x + ox * 2.2, y + oy * 2.2, r * 0.95, r * 0.85, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  // (the barrel, between the hub and the plunger: pink in the glass)
  ctx.strokeStyle = INK; ctx.lineWidth = r * 1.6 + 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + ox * 2, y + oy * 2); ctx.stroke();
  ctx.strokeStyle = '#FF2BD6'; ctx.lineWidth = r * 1.6; ctx.stroke();
  ctx.strokeStyle = '#FF6BE3'; ctx.lineWidth = r * 0.8; ctx.beginPath(); ctx.moveTo(x - r * 0.3, y - r * 0.3); ctx.lineTo(x + ox * 2 - r * 0.3, y + oy * 2 - r * 0.3); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = r * 0.18; ctx.beginPath(); ctx.moveTo(x - r * 0.55, y - r * 0.55); ctx.lineTo(x + ox * 2 - r * 0.55, y + oy * 2 - r * 0.55); ctx.stroke();
  rings(ctx, x, y, r * 0.42, ['#450A0A', '#B91C1C', '#EF4444', '#FCA5A5']);
  ctx.fillStyle = '#F1F5F9'; ctx.fillRect(x - 2, y - 2, 4, 4);
};

const taser = (ctx: Ctx, e: number, src: Pt, hit: number) => {
  const f = e - hit, seed = Math.floor(e / 40);
  if (f < 0) {
    zap(ctx, bolt(src, [400, 300], seed, 40, 10), 5);
    rings(ctx, src[0], src[1], 30, ['rgba(34,211,238,0.3)', 'rgba(165,243,252,0.6)', '#FFFFFF']);
    return;
  }
  if (f > 760) {
    // Switched off: a dot of light left in the middle, dying
    const k = clamp01((f - 850) / 260);
    if (f > 850) rings(ctx, 400, 300, 26 * (1 - k) + 6, [`rgba(165,243,252,${(1 - k) * 0.5})`, `rgba(236,254,255,${1 - k * 0.8})`, `rgba(255,255,255,${1 - k * 0.6})`]);
    // (the line it squashes to, on its way)
    else if (f > 800) { ctx.fillStyle = '#ECFEFF'; ctx.fillRect(0, 296, W, 8); }
    return;
  }
  // Fried: arcs crawling all over the lens, from edge to edge and off the middle, re-striking every frame or two
  for (let i = 0; i < 6; i++) {
    const a = hash(seed * 3 + i) * Math.PI * 2, b = a + Math.PI * (0.5 + hash(seed * 5 + i));
    const p0: Pt = [400 + Math.cos(a) * 460, 300 + Math.sin(a) * 340], p1: Pt = i < 2 ? [400 + (hash(seed + i) - 0.5) * 120, 300 + (hash(seed * 2 + i) - 0.5) * 80] : [400 + Math.cos(b) * 460, 300 + Math.sin(b) * 340];
    if (hash(seed * 7 + i) > 0.35) zap(ctx, bolt(p0, p1, seed * 11 + i, 60, 11), 3 + (i < 2 ? 2 : 0));
  }
  rings(ctx, 400, 300, 70, ['rgba(34,211,238,0.15)', 'rgba(165,243,252,0.35)', 'rgba(255,255,255,0.7)']);
  // (static: rows of it, the picture's tearing)
  for (let i = 0; i < 9; i++) { const y = hash(seed * 9 + i) * H; ctx.fillStyle = i % 3 ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.5)'; ctx.fillRect(0, y, W, 4 + hash(i + seed) * 10); }
  // (burning out: going dim and orange-brown at the edges)
  if (f > 420) { const k = clamp01((f - 420) / 340); ctx.fillStyle = `rgba(28,10,4,${0.5 * k})`; ctx.fillRect(0, 0, W, H); }
};

const SLUDGE_COLS = ['#1A2E05', '#365314', '#4D7C0F', '#65A30D', '#84CC16', '#BEF264'];

const sludge = (ctx: Ctx, e: number, src: Pt, hit: number) => {
  const f = e - hit;
  if (f < 0) {
    // The glob: lumpy, flying at the lens, drips trailing off it
    const k = easeIn(clamp01(e / hit)), x = lerp(src[0], 380, k), y = lerp(src[1], 270, k), r = 10 + k * 230;
    for (let i = 0; i < 4; i++) { ctx.fillStyle = SLUDGE_COLS[2]; ctx.beginPath(); ctx.arc(lerp(src[0], x, 0.7 - i * 0.15), lerp(src[1], y, 0.7 - i * 0.15), r * (0.25 - i * 0.04), 0, Math.PI * 2); ctx.fill(); }
    ctx.beginPath(); blob(ctx, x, y, r, 5); ctx.fillStyle = SLUDGE_COLS[3]; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
    ctx.beginPath(); blob(ctx, x - r * 0.2, y - r * 0.2, r * 0.45, 9); ctx.fillStyle = SLUDGE_COLS[4]; ctx.fill();
    return;
  }
  // Splattered: a great lump of it over the lens, chunks in it, spray round it; sliding down, a smear left behind
  const slide = 0.00045 * f * f, cx = 390, cy = 270 + slide;
  // (the smear it leaves on the glass behind it, lumpy, see-through)
  ctx.beginPath();
  for (let y = 270; y < cy; y += 30) blob(ctx, cx + Math.sin(y / 50) * 10, y, 250, 70 + Math.floor(y / 30), 11, 0.85);
  ctx.fillStyle = 'rgba(77,124,15,0.45)'; ctx.fill();
  // (runs off the bottom of it, each with a drop on the end)
  for (let i = 0; i < 7; i++) {
    const x = cx - 200 + i * 66 + hash(i) * 24, len = clamp01((f - hash(i * 3) * 200) / 900) * (60 + hash(i * 5) * 220), w = 8 + hash(i * 7) * 16;
    ctx.fillStyle = SLUDGE_COLS[3]; ctx.fillRect(x - w / 2, cy + 120, w, 80 + len);
    ctx.beginPath(); ctx.arc(x, cy + 200 + len, w / 2 + 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = SLUDGE_COLS[5]; ctx.fillRect(x - w / 2 + 2, cy + 150, 3, 40 + len);
  }
  // (spray thrown off round it)
  for (let i = 0; i < 26; i++) { const a = hash(i * 1.3) * Math.PI * 2, d = 240 + hash(i * 2.1) * 170, r = 4 + hash(i * 3.7) * 14; ctx.beginPath(); blob(ctx, cx + Math.cos(a) * d, 270 + Math.sin(a) * d * 0.75 + slide * 0.6, r, i, 7); ctx.fillStyle = SLUDGE_COLS[3 + (i % 2)]; ctx.fill(); }
  // (the lump: banded from its dark edge to its light middle, ink round it)
  const pop = Math.min(1, f / 60);
  [[1, 2], [0.8, 3], [0.55, 4], [0.3, 5]].forEach(([s, c], j) => { ctx.beginPath(); blob(ctx, cx - (1 - s) * 50, cy - (1 - s) * 50, 300 * s * (0.7 + pop * 0.3), 3 + j, 13, 0.85); ctx.fillStyle = SLUDGE_COLS[c]; ctx.fill(); if (j === 0) { ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke(); } });
  // (chunks: carrot, a pea or two, something that was once a hot dog)
  for (let i = 0; i < 14; i++) {
    const x = cx + (hash(i * 4.1) - 0.5) * 380, y = cy + (hash(i * 6.7) - 0.5) * 280, r = 7 + hash(i * 8.3) * 12, kind = i % 3;
    ctx.fillStyle = kind === 0 ? '#F97316' : kind === 1 ? '#A3E635' : '#B45309';
    if (kind === 0) ctx.fillRect(x - r, y - r * 0.5, r * 2, r); else { ctx.beginPath(); ctx.arc(x, y, r * 0.7, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke(); if (kind === 0) ctx.strokeRect(x - r, y - r * 0.5, r * 2, r);
  }
  // (the shine on it, wet; bubbles in it popping)
  ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillRect(cx - 120, cy - 120, 40, 10); ctx.fillRect(cx - 132, cy - 104, 12, 10); ctx.fillRect(cx + 60, cy - 60, 16, 8);
  for (let i = 0; i < 5; i++) { const q = ((f / 400 + i / 5) % 1), x = cx + (hash(i * 9) - 0.5) * 260, y = cy + (hash(i * 11) - 0.5) * 160; if (q < 0.8) { ctx.strokeStyle = SLUDGE_COLS[5]; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 4 + q * 12, 0, Math.PI * 2); ctx.stroke(); } }
};

const oilRocket = (ctx: Ctx, e: number, src: Pt, hit: number) => {
  const f = e - hit;
  if (f < 0) {
    // The rocket: nose on, wobbling in at the lens, its exhaust glowing round it, smoke rings behind
    const k = easeIn(clamp01(e / hit)), wob = Math.sin(e / 30) * 10 * (1 - k);
    const x = lerp(src[0], 400, k) + wob, y = lerp(src[1], 300, k), r = 14 + k * 400;
    for (let i = 3; i >= 1; i--) { const q = clamp01(k - i * 0.12); rings(ctx, lerp(src[0], x, q), lerp(src[1], y, q), r * 0.6, ['rgba(68,64,60,0.4)', 'rgba(120,113,108,0.4)']); }
    rings(ctx, x, y, r * 1.35, ['rgba(234,88,12,0.35)', 'rgba(250,204,21,0.45)', 'rgba(255,251,235,0.6)']);
    rings(ctx, x, y, r, ['#3F3F2E', '#7F1D1D', '#B91C1C', '#DC2626', '#F87171', '#FECACA']);
    // (crude on it, slopped over the top)
    ctx.fillStyle = '#0A0A0A'; ctx.beginPath(); blob(ctx, x - r * 0.15, y - r * 0.45, r * 0.5, 31, 9, 0.5); ctx.fill();
    ctx.fillRect(x - r * 0.3, y - r * 0.4, r * 0.08, r * 0.5); ctx.fillRect(x + r * 0.1, y - r * 0.4, r * 0.06, r * 0.36);
    return;
  }
  // Oil: black over the lens in splats, glossy, running; a beat of it (the fuse going)
  const blast = f - 300;
  for (let i = 0; i < 9; i++) {
    const x = 400 + (hash(i * 3.3) - 0.5) * 700, y = 300 + (hash(i * 5.1) - 0.5) * 500 + Math.min(f, 400) * 0.08 * hash(i), r = 90 + hash(i * 7.7) * 160;
    ctx.beginPath(); blob(ctx, x, y, r, 50 + i, 10); ctx.fillStyle = '#050505'; ctx.fill();
    ctx.beginPath(); blob(ctx, x - r * 0.15, y - r * 0.18, r * 0.7, 60 + i, 9); ctx.fillStyle = '#1C1917'; ctx.fill();
    ctx.beginPath(); blob(ctx, x - r * 0.25, y - r * 0.3, r * 0.4, 70 + i, 8); ctx.fillStyle = '#292524'; ctx.fill();
    ctx.fillStyle = '#0A0A0A'; ctx.fillRect(x - r * 0.2, y, r * 0.18, r * 0.6 + Math.min(f, 400) * 0.3 * hash(i * 9));
    ctx.fillStyle = 'rgba(214,211,209,0.55)'; ctx.fillRect(x - r * 0.35, y - r * 0.45, r * 0.25, 8); ctx.fillRect(x - r * 0.42, y - r * 0.33, 8, 8);
  }
  // (the fuse light, blinking red through the oil)
  if (blast < 0 && f > 60 && Math.floor(f / 100) % 2) rings(ctx, 400, 300, 26, ['rgba(220,38,38,0.4)', '#EF4444', '#FECACA']);
  if (blast > 0) {
    // The blast: white, then a fireball over everything, the oil on the glass burning; going out to black
    const k = clamp01(blast / 500);
    rings(ctx, 400, 300, 200 + k * 700, ['#7F1D1D', '#B91C1C', '#EA580C', '#F59E0B', '#FDE047', '#FEF9C3', '#FFFFFF']);
    bigFlames(ctx, -40, H + 20, W + 80, 500 * (1 - k * 0.5), Math.floor(blast / 60));
    if (blast < 110) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H); }
    if (k > 0.6) { ctx.fillStyle = `rgba(0,0,0,${(k - 0.6) / 0.4})`; ctx.fillRect(0, 0, W, H); }
  }
};

const DRAW: Record<ShotWeapon, (ctx: Ctx, e: number, src: Pt, hit: number) => void> = {
  SHOTGUN: shotgun, FLAMETHROWER: flamethrower, BOULDER: boulder, TSUNAMI: tsunami, NEEDLES: needles, TASER: taser, SLUDGE: sludge, OIL_ROCKET: oilRocket,
};

/** The shot, on the lens: `e` ms from the trigger, `src` where the muzzle is on the screen (800 x 600). */
export const drawLensFx = (ctx: Ctx, w: ShotWeapon, e: number, src: Pt, hit: number) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, FX_W, FX_H);
  if (e < 0) return;
  ctx.setTransform(FX_W / W, 0, 0, FX_H / H, 0, 0);
  ctx.imageSmoothingEnabled = false;
  // The flash off the muzzle as it goes (not a rock: that's thrown)
  if (w !== 'BOULDER' && e < 90) {
    const col: Record<ShotWeapon, string[]> = {
      SHOTGUN: ['rgba(14,165,233,0.5)', '#7DD3FC', '#FFFFFF'], FLAMETHROWER: ['rgba(234,88,12,0.5)', '#F59E0B', '#FEF9C3'], BOULDER: [],
      TSUNAMI: ['rgba(59,130,246,0.5)', '#93C5FD', '#FFFFFF'], NEEDLES: ['rgba(255,43,214,0.4)', '#FF6BE3', '#FFFFFF'], TASER: ['rgba(34,211,238,0.5)', '#A5F3FC', '#FFFFFF'],
      SLUDGE: ['rgba(101,163,13,0.5)', '#BEF264', '#F7FEE7'], OIL_ROCKET: ['rgba(120,113,108,0.6)', '#F59E0B', '#FFFFFF'],
    };
    const r = 60 * (1 - e / 90) + 20;
    rings(ctx, src[0], src[1], r, col[w]);
    ctx.fillStyle = col[w][2];
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; ctx.save(); ctx.translate(src[0], src[1]); ctx.rotate(a); ctx.fillRect(r * 0.6, -3, r * 0.9, 6); ctx.restore(); }
  }
  DRAW[w](ctx, e, src, hit);
};

/** Warm the noise up ahead of time (a frame's work, before it's needed). */
export const warmLensFx = () => { noise(); };
