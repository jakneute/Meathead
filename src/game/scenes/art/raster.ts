// A little pixel painter for the cutscenes' best close-ups (the fast food, the medal): forms filled in from a path,
// inflated into a rounded relief (pillowed in from their edges), lit from the upper left like everything else, stepped
// to a colour ramp with an ordered dither where the steps meet, a hard glint where it's wet, and inked round. Pixel by
// pixel into an ImageData, so it's for painting once and keeping (see `painting`), never for every frame.

type Ctx = CanvasRenderingContext2D;
export type RGB = [number, number, number];

export const rgbOf = (hex: string): RGB => {
  if (hex.startsWith('rgb')) { const m = hex.match(/[\d.]+/g)!.map(Number); return [m[0], m[1], m[2]]; }
  const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** A 4x4 ordered dither, -0.5..0.5. */
export const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16 - 0.5);
export const bayer = (x: number, y: number) => BAYER4[(y & 3) * 4 + (x & 3)];

export const hash2 = (x: number, y: number) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
/** Smooth value noise (0..1) on a grid `cell` pixels across. */
export const noise = (x: number, y: number, cell: number, seed = 0) => {
  const gx = x / cell, gy = y / cell, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = hash2(x0 + seed, y0), b = hash2(x0 + 1 + seed, y0), c = hash2(x0 + seed, y0 + 1), d = hash2(x0 + 1 + seed, y0 + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
};

const norm3 = (x: number, y: number, z: number): [number, number, number] => { const l = Math.hypot(x, y, z) || 1; return [x / l, y / l, z / l]; };
export const LIGHT = norm3(-0.45, -0.6, 0.66);

export interface FormOpts {
  /** Darkest to lightest. */
  ramp: string[];
  /** How far in from its edge it takes to round over (px): small for a slab, big for a ball. */
  bevel?: number;
  /** The least light it gets. */
  amb?: number;
  light?: [number, number, number];
  /** Added to the light (bumps, pocks, crust), by pixel. */
  tex?: (x: number, y: number) => number;
  /** A height added to the relief (bumps that catch the light properly). */
  bump?: (x: number, y: number) => number;
  /** The glint where it's wet: its colour, and how readily it shows (0 never .. 1 everywhere it faces the light). */
  spec?: string; wet?: number;
  /** The outline (null: none). */
  ink?: string | null;
  /** Only the outer edge inked where it meets nothing painted (an edge against another form gets `inkIn`). */
  inkIn?: string | null;
  /** Lean the light over more (multiplies the result before stepping). */
  gain?: number;
  /** See-through (0..1). */
  alpha?: number;
}

/** A canvas being painted pixel by pixel. */
export class Painter {
  readonly w: number; readonly h: number;
  readonly d: Uint8ClampedArray;
  private img: ImageData;
  private mc: HTMLCanvasElement; private mg: Ctx;
  constructor(w: number, h: number, base?: (g: Ctx) => void) {
    this.w = w; this.h = h;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d')!;
    if (base) { g.imageSmoothingEnabled = false; base(g); }
    this.img = g.getImageData(0, 0, w, h); this.d = this.img.data;
    this.mc = document.createElement('canvas'); this.mc.width = w; this.mc.height = h;
    this.mg = this.mc.getContext('2d', { willReadFrequently: true })!;
  }

  /** Where a path fills (a 0/1 per pixel). */
  mask(path: (g: Ctx) => void): Uint8Array {
    const g = this.mg; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, this.w, this.h);
    g.fillStyle = '#fff'; g.strokeStyle = '#fff'; g.beginPath(); path(g); g.fill();
    const a = g.getImageData(0, 0, this.w, this.h).data, m = new Uint8Array(this.w * this.h);
    for (let i = 0; i < m.length; i++) m[i] = a[i * 4 + 3] >= 128 ? 1 : 0;
    return m;
  }
  /** A stroked path's mask (a fry, a hair, a straw). */
  strokeMask(path: (g: Ctx) => void, width: number): Uint8Array {
    const g = this.mg; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, this.w, this.h);
    g.strokeStyle = '#fff'; g.lineWidth = width; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); path(g); g.stroke();
    const a = g.getImageData(0, 0, this.w, this.h).data, m = new Uint8Array(this.w * this.h);
    for (let i = 0; i < m.length; i++) m[i] = a[i * 4 + 3] >= 128 ? 1 : 0;
    return m;
  }
  and(a: Uint8Array, b: Uint8Array) { const m = new Uint8Array(a.length); for (let i = 0; i < a.length; i++) m[i] = a[i] & b[i]; return m; }
  minus(a: Uint8Array, b: Uint8Array) { const m = new Uint8Array(a.length); for (let i = 0; i < a.length; i++) m[i] = a[i] & (1 - b[i]); return m; }

  painted(x: number, y: number) { return x >= 0 && y >= 0 && x < this.w && y < this.h && this.d[(y * this.w + x) * 4 + 3] > 0; }

  /** A pixel (blended over what's there by `a`). */
  px(x: number, y: number, col: string | RGB, a = 1) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const c = typeof col === 'string' ? rgbOf(col) : col, o = (y * this.w + x) * 4, d = this.d;
    if (a >= 1 || d[o + 3] === 0) { d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = Math.max(d[o + 3], Math.round(255 * Math.min(1, a))); return; }
    d[o] += (c[0] - d[o]) * a; d[o + 1] += (c[1] - d[o + 1]) * a; d[o + 2] += (c[2] - d[o + 2]) * a;
  }
  rect(x: number, y: number, w: number, h: number, col: string | RGB, a = 1) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, col, a); }
  /** A solid ellipse in whole pixels. */
  disc(cx: number, cy: number, rx: number, ry: number, col: string | RGB, a = 1) {
    for (let y = Math.ceil(-ry); y <= ry; y++) { const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry)))); for (let x = -hw; x < hw; x++) this.px(Math.round(cx) + x, Math.round(cy) + y, col, a); }
  }
  /** A line a pixel wide. */
  line(x0: number, y0: number, x1: number, y1: number, col: string | RGB, a = 1) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let k = 0; k <= n; k++) this.px(x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n, col, a);
  }
  /** A colour over a mask, dithered at `a` (a checker-ish scatter, not a blend: it stays pixels). */
  stipple(m: Uint8Array, col: string, a: number, phase = 0) {
    const c = rgbOf(col);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (m[y * this.w + x] && bayer(x + phase, y) + 0.5 < a) this.px(x, y, c);
  }
  /** Tint a mask (a real blend: grease soaking through paper). */
  tint(m: Uint8Array, col: string, a: number) { const c = rgbOf(col); for (let i = 0; i < m.length; i++) if (m[i]) this.px(i % this.w, Math.floor(i / this.w), c, a); }

  /** How far each pixel of a mask is from its edge (chamfer 3-4, in px). */
  dist(m: Uint8Array) {
    const { w, h } = this, D = new Float32Array(w * h), BIG = 1e6;
    for (let i = 0; i < D.length; i++) D[i] = m[i] ? BIG : 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x; if (!D[i]) continue;
      let v = D[i];
      v = Math.min(v, x > 0 ? D[i - 1] + 1 : 1, y > 0 ? D[i - w] + 1 : 1, x > 0 && y > 0 ? D[i - w - 1] + 1.414 : 1.414, x < w - 1 && y > 0 ? D[i - w + 1] + 1.414 : 1.414);
      D[i] = v;
    }
    for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
      const i = y * w + x; if (!D[i]) continue;
      let v = D[i];
      v = Math.min(v, x < w - 1 ? D[i + 1] + 1 : 1, y < h - 1 ? D[i + w] + 1 : 1, x < w - 1 && y < h - 1 ? D[i + w + 1] + 1.414 : 1.414, x > 0 && y < h - 1 ? D[i + w - 1] + 1.414 : 1.414);
      D[i] = v;
    }
    return D;
  }

  /**
   * A form: the mask (or a path) pillowed up from its edges `bevel` px in, lit, stepped to its ramp with a dither
   * between the steps, a glint where it faces the light and it's wet, and inked round. Returns its mask.
   */
  form(shape: Uint8Array | ((g: Ctx) => void), o: FormOpts): Uint8Array {
    const m = typeof shape === 'function' ? this.mask(shape) : shape;
    const { w, h } = this, D = this.dist(m), bev = o.bevel ?? 8, amb = o.amb ?? 0.14, L = o.light ?? LIGHT;
    const H = new Float32Array(w * h);
    for (let i = 0; i < H.length; i++) {
      if (!m[i]) continue;
      const t = Math.min(D[i] / bev, 1);
      H[i] = bev * Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t))) + (o.bump ? o.bump(i % w, Math.floor(i / w)) : 0);
    }
    const cols = o.ramp.map(rgbOf), n = cols.length, sc = o.spec ? rgbOf(o.spec) : null, wet = o.wet ?? 0;
    const Hv = norm3(L[0], L[1], L[2] + 1);
    const inkC = o.ink === null ? null : rgbOf(o.ink ?? '#140a06'), inkInC = o.inkIn === undefined ? inkC : o.inkIn === null ? null : rgbOf(o.inkIn);
    const before = new Uint8Array(w * h); for (let i = 0; i < before.length; i++) before[i] = this.d[i * 4 + 3] > 0 ? 1 : 0;
    const a = o.alpha ?? 1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x; if (!m[i]) continue;
      const hl = x > 0 && m[i - 1] ? H[i - 1] : H[i], hr = x < w - 1 && m[i + 1] ? H[i + 1] : H[i];
      const hu = y > 0 && m[i - w] ? H[i - w] : H[i], hd = y < h - 1 && m[i + w] ? H[i + w] : H[i];
      const [nx, ny, nz] = norm3(-(hr - hl) / 2, -(hd - hu) / 2, 1);
      let l = amb + (1 - amb) * Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
      if (o.gain) l *= o.gain;
      if (o.tex) l += o.tex(x, y);
      const edge = (x > 0 && !m[i - 1]) || (x < w - 1 && !m[i + 1]) || (y > 0 && !m[i - w]) || (y < h - 1 && !m[i + w]);
      if (edge && (inkC || inkInC)) {
        // (against nothing that was there before: the outer ink; against another form: the inner one)
        const out = (x > 0 && !m[i - 1] && !before[i - 1]) || (x < w - 1 && !m[i + 1] && !before[i + 1]) || (y > 0 && !m[i - w] && !before[i - w]) || (y < h - 1 && !m[i + w] && !before[i + w]);
        const ic = out ? inkC : inkInC;
        if (ic) { this.px(x, y, ic, a); continue; }
      }
      if (sc && wet > 0) {
        const s = Math.max(0, nx * Hv[0] + ny * Hv[1] + nz * Hv[2]) ** 24;
        if (s * wet + (hash2(x, y) - 0.5) * 0.16 > 0.42) { this.px(x, y, sc, a); continue; }
      }
      const k = Math.max(0, Math.min(n - 1, Math.round(Math.max(0, Math.min(1, l)) * (n - 1) + bayer(x, y) * 0.7)));
      this.px(x, y, cols[k], a);
    }
    return m;
  }

  /** Done: onto a canvas. */
  canvas(): HTMLCanvasElement {
    const c = document.createElement('canvas'); c.width = this.w; c.height = this.h;
    c.getContext('2d')!.putImageData(this.img, 0, 0);
    return c;
  }
}

const kept = new Map<string, HTMLCanvasElement>();
/** Painted once (by `paint`, onto a Painter), kept by `key`. */
export const painting = (key: string, w: number, h: number, paint: (p: Painter) => void, base?: (g: Ctx) => void) => {
  let c = kept.get(key);
  if (!c) { const p = new Painter(w, h, base); paint(p); c = p.canvas(); kept.set(key, c); }
  return c;
};
