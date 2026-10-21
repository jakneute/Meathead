// The remains pictures' paint box (remains.ts): a little pixel painter over one small print, the SNES way. Every shape
// is filled pixel by pixel and shaded from its own surface (an ellipse as a dome, a limb as a cylinder, a slab flat or
// banded), light from the top left: the ramp in hard steps with a checker dithered along each seam, and an ink line
// round its own edge in the ramp's darkest. No anti-aliasing anywhere: what's painted is what's on the print.
//
// A ramp is light to dark, its last color the ink.

export type Ramp = readonly string[];

const RGB = new Map<string, number>();
const rgbOf = (col: string) => {
  let v = RGB.get(col);
  if (v === undefined) { v = parseInt(col.slice(1, 7), 16); RGB.set(col, v); }
  return v;
};

/** The light: from the top left, out of the print a little. */
const LX = -0.5, LY = -0.66, LZ = 0.56;

export interface Opts {
  /** An ink line round it (default true). */
  ink?: boolean | string;
  /** Brighter (+) or darker (-), in light units (0..1). */
  lit?: number;
}

export class Pix {
  readonly w: number; readonly h: number;
  readonly img: ImageData;
  /** A seeded random (the same picture every time). */
  private seed: number;
  constructor(w: number, h: number, seed = 1) {
    this.w = w; this.h = h; this.seed = seed;
    this.img = new ImageData(w, h);
  }
  rnd() { this.seed = (this.seed * 16807) % 2147483647; return (this.seed - 1) / 2147483646; }

  px(x: number, y: number, col: string) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const v = rgbOf(col), i = (y * this.w + x) * 4, d = this.img.data;
    d[i] = v >> 16; d[i + 1] = (v >> 8) & 255; d[i + 2] = v & 255; d[i + 3] = 255;
  }
  rect(x: number, y: number, w: number, h: number, col: string) {
    for (let j = Math.round(y); j < Math.round(y + h); j++) for (let i = Math.round(x); i < Math.round(x + w); i++) this.px(i, j, col);
  }
  /** Every other pixel of a rect (a dithered tone over what's there). */
  checker(x: number, y: number, w: number, h: number, col: string, phase = 0) {
    for (let j = Math.round(y); j < Math.round(y + h); j++) for (let i = Math.round(x); i < Math.round(x + w); i++) if (((i + j + phase) & 1) === 0) this.px(i, j, col);
  }
  line(x0: number, y0: number, x1: number, y1: number, col: string) {
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
    for (let k = 0; k <= n; k++) this.px(x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n, col);
  }
  /** Horizontal bands top to bottom (y0..y1), a dithered row between each. */
  bands(y0: number, y1: number, cols: Ramp, x0 = 0, x1 = this.w) {
    const n = cols.length, span = y1 - y0;
    for (let y = y0; y < y1; y++) {
      const f = ((y - y0) / span) * n, k = Math.min(n - 1, Math.floor(f)), fr = f - k;
      for (let x = x0; x < x1; x++) {
        const nx = k + 1 < n && fr > 0.8 && ((x + y) & 1) === 0 ? k + 1 : k;
        this.px(x, y, cols[nx]);
      }
    }
  }

  /** A ramp's step for a light level at (x, y): hard steps, the seams checkered. */
  step(ramp: Ramp, l: number, x: number, y: number) {
    const n = ramp.length - 1;
    const f = Math.max(0, Math.min(n - 1, (1 - l) * (n - 1)));
    let b = Math.floor(f);
    const fr = f - b;
    if (fr > 0.68) b++;
    else if (fr > 0.36 && ((x + y) & 1) === 0) b++;
    return ramp[Math.min(n - 1, b)];
  }

  /** The general fill: inside, the light there, the ink round its edge. */
  fill(x0: number, y0: number, x1: number, y1: number, inside: (x: number, y: number) => boolean, light: (x: number, y: number) => number, ramp: Ramp, o: Opts = {}) {
    x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0)); x1 = Math.min(this.w - 1, Math.ceil(x1)); y1 = Math.min(this.h - 1, Math.ceil(y1));
    const W = x1 - x0 + 1, H = y1 - y0 + 1;
    if (W <= 0 || H <= 0) return;
    const m = new Uint8Array(W * H);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (inside(x + 0.5, y + 0.5)) m[(y - y0) * W + (x - x0)] = 1;
    const at = (x: number, y: number) => x >= x0 && x <= x1 && y >= y0 && y <= y1 && m[(y - y0) * W + (x - x0)] === 1;
    const ink = o.ink === false ? null : typeof o.ink === 'string' ? o.ink : ramp[ramp.length - 1];
    const lit = o.lit ?? 0;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (!at(x, y)) continue;
      if (ink && (!at(x - 1, y) || !at(x + 1, y) || !at(x, y - 1) || !at(x, y + 1))) { this.px(x, y, ink); continue; }
      this.px(x, y, this.step(ramp, Math.max(0, Math.min(1, light(x + 0.5, y + 0.5) + lit)), x, y));
    }
  }

  /** An ellipse, shaded as a dome (turned by rot). */
  ell(cx: number, cy: number, rx: number, ry: number, ramp: Ramp, o: Opts & { rot?: number; flat?: boolean } = {}) {
    const c = Math.cos(o.rot ?? 0), s = Math.sin(o.rot ?? 0), R = Math.max(rx, ry) + 1;
    const loc = (x: number, y: number) => { const dx = x - cx, dy = y - cy; return [(c * dx + s * dy) / rx, (-s * dx + c * dy) / ry]; };
    this.fill(cx - R, cy - R, cx + R, cy + R, (x, y) => { const [u, v] = loc(x, y); return u * u + v * v <= 1; }, (x, y) => {
      const [u, v] = loc(x, y);
      if (o.flat) return 0.62 - v * 0.25 - u * 0.12;
      const nu = c * u - s * v, nv = s * u + c * v, nz = Math.sqrt(Math.max(0, 1 - u * u - v * v));
      return 0.18 + 0.82 * Math.max(0, nu * LX + nv * LY + nz * LZ);
    }, ramp, o);
  }

  /** A limb: a capsule from (x1, y1) to (x2, y2), radius r1 to r2, shaded as a cylinder. */
  cap(x1: number, y1: number, x2: number, y2: number, r1: number, r2: number, ramp: Ramp, o: Opts = {}) {
    const dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy || 1, R = Math.max(r1, r2) + 1;
    const near = (x: number, y: number) => {
      const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / L2));
      const ox = x - (x1 + dx * t), oy = y - (y1 + dy * t), r = r1 + (r2 - r1) * t;
      return { ox, oy, r, d: Math.hypot(ox, oy) };
    };
    this.fill(Math.min(x1, x2) - R, Math.min(y1, y2) - R, Math.max(x1, x2) + R, Math.max(y1, y2) + R, (x, y) => { const n = near(x, y); return n.d <= n.r; }, (x, y) => {
      const n = near(x, y), nx = n.ox / Math.max(0.5, n.r), ny = n.oy / Math.max(0.5, n.r), nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      return 0.18 + 0.82 * Math.max(0, nx * LX + ny * LY + nz * LZ);
    }, ramp, o);
  }

  /** A polygon, flat lit (`l`), or banded down it (top `l`, bottom `l2`). */
  poly(pts: number[][], ramp: Ramp, o: Opts & { l?: number; l2?: number } = {}) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    const inside = (x: number, y: number) => {
      let c = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i], [xj, yj] = pts[j];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
      }
      return c;
    };
    const l = o.l ?? 0.6, l2 = o.l2 ?? l;
    this.fill(x0, y0, x1, y1, inside, (_, y) => l + (l2 - l) * ((y - y0) / Math.max(1, y1 - y0)), ramp, o);
  }

  /** A pool on the floor (blood, oil, shit): flat, ragged at the edge, a lit rim at the back and a glint. */
  pool(cx: number, cy: number, rx: number, ry: number, ramp: Ramp, seed = 0) {
    const R = Math.max(rx, ry) * 1.3 + 1;
    const inside = (x: number, y: number) => {
      const dx = (x - cx) / rx, dy = (y - cy) / ry, a = Math.atan2(dy, dx);
      return dx * dx + dy * dy <= 1 + 0.22 * Math.sin(a * 5 + seed) + 0.12 * Math.sin(a * 9 + seed * 3);
    };
    this.fill(cx - R, cy - R, cx + R, cy + R, inside, (x, y) => 0.45 - ((y - cy) / ry) * 0.2, ramp, { ink: ramp[ramp.length - 2] });
    this.px(cx - rx * 0.4, cy - ry * 0.35, ramp[0]); this.px(cx - rx * 0.4 + 1, cy - ry * 0.35, ramp[0]);
  }

  /** Spatters: a few drops round a point. */
  spatter(cx: number, cy: number, r: number, n: number, ramp: Ramp) {
    for (let i = 0; i < n; i++) {
      const a = this.rnd() * Math.PI * 2, d = r * (0.4 + this.rnd() * 0.8);
      const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.5;
      this.px(x, y, ramp[1]);
      if (this.rnd() < 0.4) this.px(x + 1, y, ramp[2]);
    }
  }

  /** A crime-scene evidence tent: yellow, a black number mark on it. */
  marker(x: number, y: number) {
    this.poly([[x - 3, y], [x, y - 5], [x + 3, y]], ['#FEF08A', '#FACC15', '#CA8A04', '#A16207', '#3A2A04'], { l: 0.9, l2: 0.4 });
    this.px(x, y - 2, '#18181B'); this.px(x, y - 1, '#18181B');
  }

  /** Wisps of smoke going up from a point. */
  smoke(x: number, y: number, h: number, col = '#9CA3AF') {
    for (let k = 0; k < h; k++) {
      const sx = x + Math.sin(k * 0.45) * 2.2 * (k / h + 0.3);
      if ((k & 1) === 0 || k < h * 0.4) this.px(sx, y - k, col);
      if (k > h * 0.3 && (k % 3) === 0) this.px(sx + 1, y - k, col);
    }
  }
}

// ---- the shared ramps (light to dark, the last the ink)
export const BLOOD: Ramp = ['#E85858', '#C02020', '#921414', '#640A0A', '#2E0404'];
export const SHIT: Ramp = ['#B08040', '#8A5C2C', '#6C4420', '#503014', '#26160A'];
export const BONE: Ramp = ['#FFFFF2', '#ECE6CC', '#CCC29E', '#A0946E', '#4A4232'];
export const GOO: Ramp = ['#D2F79A', '#86D840', '#56A222', '#326A12', '#142C06'];
export const ASH: Ramp = ['#BEB8B0', '#948E88', '#706A64', '#4E4A46', '#1E1C1A'];
export const SOOT: Ramp = ['#5C544E', '#3A3430', '#262220', '#161412', '#000000'];
export const GOLD: Ramp = ['#FEF9C3', '#FACC15', '#CA8A04', '#A16207', '#5A3A06'];
export const STEEL: Ramp = ['#FFFFFF', '#D4D6DC', '#9EA2AC', '#6C707A', '#2E3036'];
export const SOCKW: Ramp = ['#FFFFFF', '#F2F0E6', '#D2CFBE', '#ABA896', '#5E5C50'];
