// The park map's paint box: pixel-art helpers in the brochure's own px (whole pixels, no smoothing), every material a
// ramp (highlight, lit, base, shade, deep, ink) laid in stepped bands with a dithered seam, the SNES way.

export type Ctx = CanvasRenderingContext2D;

const hex = (c: string) => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const toHex = (r: number, g: number, b: number) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export const mix = (a: string, b: string, k: number) => { const A = hex(a), B = hex(b); return toHex(A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, A[2] + (B[2] - A[2]) * k); };
export const rgb = hex;

export interface Ramp { hi: string; lit: string; base: string; shade: string; deep: string; ink: string }
const RAMPS = new Map<string, Ramp>();
/** A material's ramp from its base color (warm lights, cool shadows). */
export const ramp = (base: string): Ramp => {
  let r = RAMPS.get(base);
  if (!r) {
    r = {
      hi: mix(mix(base, '#FFFFFF', 0.55), '#FFF4C8', 0.25), lit: mix(mix(base, '#FFFFFF', 0.25), '#FFF0B0', 0.12), base,
      shade: mix(mix(base, '#000000', 0.25), '#2A1E5A', 0.15), deep: mix(mix(base, '#000000', 0.48), '#1E1440', 0.2), ink: mix(mix(base, '#000000', 0.72), '#140C28', 0.25),
    };
    RAMPS.set(base, r);
  }
  return r;
};

/** A filled rect on whole pixels. */
export const R = (g: Ctx, x: number, y: number, w: number, h: number, col: string) => {
  if (w <= 0 || h <= 0) return;
  g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
};
/** A pixel. */
export const px = (g: Ctx, x: number, y: number, col: string) => R(g, x, y, 1, 1, col);
/** A checker of a color over a rect (every other pixel, on the paper's grid): the dithered seam between two bands. */
export const dith = (g: Ctx, x: number, y: number, w: number, h: number, col: string) => {
  g.fillStyle = col;
  const X = Math.round(x), Y = Math.round(y);
  for (let j = 0; j < Math.round(h); j++) for (let i = (X + Y + j) & 1; i < Math.round(w); i += 2) g.fillRect(X + i, Y + j, 1, 1);
};
/** A horizontal line of pixels. */
export const hl = (g: Ctx, x: number, y: number, w: number, col: string) => R(g, x, y, w, 1, col);
export const vl = (g: Ctx, x: number, y: number, h: number, col: string) => R(g, x, y, 1, h, col);

/** A pixel line (Bresenham). */
export const line = (g: Ctx, x0: number, y0: number, x1: number, y1: number, col: string, w = 1) => {
  let X0 = Math.round(x0), Y0 = Math.round(y0);
  const X1 = Math.round(x1), Y1 = Math.round(y1), dx = Math.abs(X1 - X0), dy = -Math.abs(Y1 - Y0), sx = X0 < X1 ? 1 : -1, sy = Y0 < Y1 ? 1 : -1;
  let err = dx + dy;
  g.fillStyle = col;
  for (let n = 0; n < 4000; n++) {
    g.fillRect(X0 - (w >> 1), Y0 - (w >> 1), w, w);
    if (X0 === X1 && Y0 === Y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; X0 += sx; }
    if (e2 <= dx) { err += dx; Y0 += sy; }
  }
};

/** A filled pixel ellipse (row by row), its top rows lit and its foot shaded if a ramp's given. */
export const ell = (g: Ctx, cx: number, cy: number, rx: number, ry: number, col: string | Ramp, outline = true) => {
  const r = typeof col === 'string' ? null : col;
  const base = r ? r.base : (col as string);
  const Y0 = Math.round(cy - ry), Y1 = Math.round(cy + ry);
  for (let y = Y0; y <= Y1; y++) {
    const t = (y + 0.5 - cy) / ry;
    if (Math.abs(t) > 1) continue;
    const hw = Math.round(rx * Math.sqrt(1 - t * t));
    const k = (y - Y0) / Math.max(1, Y1 - Y0);
    const c = r ? (k < 0.18 ? r.lit : k < 0.62 ? r.base : k < 0.85 ? r.shade : r.deep) : base;
    R(g, cx - hw, y, hw * 2 + 1, 1, c);
    if (r && outline) { px(g, cx - hw, y, r.ink); px(g, cx + hw, y, r.ink); }
  }
  if (r && outline) { hl(g, cx - 1, Y0, 3, r.ink); hl(g, cx - 1, Y1, 3, r.ink); }
};

/** A box seen from the brochure's three-quarter view: its roof (top) w x d, its front face w x h below that; lit
 *  from the upper left; inked round. (x, y): the front face's foot, left corner. */
export const block = (g: Ctx, x: number, y: number, w: number, h: number, d: number, wall: string, roofCol: string) => {
  const W = ramp(wall), T = ramp(roofCol);
  // (the front face, banded down: lit at the top, shaded at the foot, a dithered seam)
  R(g, x, y - h, w, h, W.base);
  R(g, x, y - Math.ceil(h * 0.3), w, Math.ceil(h * 0.3), W.shade);
  dith(g, x, y - Math.ceil(h * 0.3) - 1, w, 1, W.shade);
  R(g, x + w - 2, y - h, 2, h, W.shade);
  // (the roof)
  R(g, x, y - h - d, w, d, T.base);
  hl(g, x, y - h - d, w, T.lit);
  dith(g, x, y - h - d + 1, w, 1, T.lit);
  hl(g, x, y - h - 1, w, T.shade);
  // (the ink round it all)
  hl(g, x - 1, y - h - d - 1, w + 2, T.ink); hl(g, x - 1, y, w + 2, W.ink);
  vl(g, x - 1, y - h - d, h + d, W.ink); vl(g, x + w, y - h - d, h + d, W.ink);
  hl(g, x, y - h, w, W.deep);
};

/** Windows along a face: a row of n, lit or dark. */
export const windows = (g: Ctx, x: number, y: number, w: number, n: number, col = '#FDE68A', dark = '#1E293B', ww = 2, wh = 2) => {
  const step = w / n;
  for (let i = 0; i < n; i++) { const wx = Math.round(x + i * step + (step - ww) / 2); R(g, wx, y, ww, wh, (i * 7 + Math.round(x)) % 3 ? col : dark); }
};

/** A pointed roof (a spire or a gable): base width w at y, its tip h up; one side lit, the other shaded. */
export const spire = (g: Ctx, cx: number, y: number, w: number, h: number, col: string) => {
  const r = ramp(col);
  for (let j = 0; j < h; j++) {
    const hw = Math.max(0, Math.round((w / 2) * (1 - j / h)));
    const yy = y - j;
    R(g, cx - hw, yy, hw, 1, r.lit); R(g, cx, yy, hw + 1, 1, r.shade);
    px(g, cx - hw - 1, yy, r.ink); px(g, cx + hw + 1, yy, r.ink);
  }
  px(g, cx, y - h, r.ink);
};

/** A flag on a pole. */
export const flag = (g: Ctx, x: number, y: number, col: string, h = 9) => {
  vl(g, x, y - h, h, '#3F3F46'); R(g, x + 1, y - h, 5, 3, col); px(g, x + 6, y - h + 1, col); hl(g, x + 1, y - h + 3, 4, mix(col, '#000000', 0.35));
};

// ---- trees, the map's filler: each a few px, in its land's own kind
export type TreeKind = 'round' | 'pine' | 'palm' | 'dead' | 'candy' | 'mushroom' | 'cypress' | 'snowpine' | 'snowround' | 'cactus' | 'scrub';
export const tree = (g: Ctx, x: number, y: number, kind: TreeKind, s = 1) => {
  switch (kind) {
    case 'pine': {
      const r = ramp('#2F6B3A');
      for (let j = 0; j < 9 * s; j++) { const hw = Math.round(((j % (3 * s)) + j * 0.4) / (1.2 * s) + 1); R(g, x - hw, y - 2 - (9 * s - j), hw, 1, r.base); R(g, x, y - 2 - (9 * s - j), hw, 1, r.shade); }
      R(g, x, y - 2, 1, 2, '#5A3A1E'); px(g, x - 1, y - 9 * s - 1, r.lit);
      break;
    }
    case 'snowpine': {
      // (a pine under snow: its tiers' tops caked white, the shade side blue-gray)
      const r = ramp('#2A5A3E');
      for (let j = 0; j < 9 * s; j++) {
        const hw = Math.round(((j % (3 * s)) + j * 0.4) / (1.2 * s) + 1), yy = y - 2 - (9 * s - j), top = j % (3 * s) === 0;
        R(g, x - hw, yy, hw, 1, top ? '#F4F8FC' : r.base); R(g, x, yy, hw, 1, top ? '#C2CEDF' : r.shade);
      }
      R(g, x, y - 2, 1, 2, '#5A3A1E'); px(g, x, y - 9 * s - 2, '#FFFFFF');
      break;
    }
    case 'snowround': {
      // (a bare-ish broadleaf, snow along its crown's top)
      R(g, x, y - 2, 1, 2, '#5A3A1E');
      ell(g, x, y - 5 * s, 4 * s, 3.5 * s, ramp('#3E6A4A'));
      hl(g, x - 2 * s, y - 8 * s, 5 * s, '#F4F8FC'); hl(g, x - 3 * s, y - 7 * s, 4 * s, '#E2EAF4');
      break;
    }
    case 'cactus': {
      // (a saguaro: trunk, two arms up)
      const r = ramp('#5E8A3A');
      R(g, x, y - 7 * s, 2, 7 * s, r.base); vl(g, x + 1, y - 7 * s, 7 * s, r.shade);
      vl(g, x - 2, y - 5 * s, 3, r.base); px(g, x - 1, y - 3 * s, r.base);
      vl(g, x + 3, y - 6 * s, 3, r.shade); px(g, x + 2, y - 4 * s, r.shade);
      break;
    }
    case 'scrub': {
      // (a sagebrush clump)
      ell(g, x, y - 2, 3 * s, 2 * s, ramp('#8A9A62'));
      break;
    }
    case 'palm': {
      vl(g, x, y - 7 * s, 7 * s, '#8A5A2E'); px(g, x + 1, y - 4 * s, '#6A4220');
      const r = ramp('#3F9A3A');
      hl(g, x - 4 * s, y - 7 * s, 9 * s, r.base); hl(g, x - 5 * s, y - 6 * s, 3 * s, r.shade); hl(g, x + 3 * s, y - 6 * s, 3 * s, r.shade); hl(g, x - 2 * s, y - 8 * s, 5 * s, r.lit);
      break;
    }
    case 'dead': {
      vl(g, x, y - 8 * s, 8 * s, '#3B3044'); line(g, x, y - 5 * s, x - 3 * s, y - 8 * s, '#3B3044'); line(g, x, y - 6 * s, x + 3 * s, y - 9 * s, '#3B3044');
      break;
    }
    case 'candy': {
      vl(g, x, y - 4, 4, '#FFFFFF'); ell(g, x, y - 7, 3 * s, 3 * s, ramp(['#F472B6', '#FDE047', '#60A5FA'][(x * 7 + y) % 3]));
      break;
    }
    case 'mushroom': {
      R(g, x - 1, y - 4 * s, 2 * s + 1, 4 * s, '#F5F0E1'); ell(g, x, y - 5 * s, 4 * s, 2 * s, ramp('#DC2626')); px(g, x - 2, y - 6 * s, '#FFFFFF'); px(g, x + 2, y - 5 * s, '#FFFFFF');
      break;
    }
    case 'cypress': {
      const r = ramp('#2E4A2E');
      ell(g, x, y - 6 * s, 2 * s, 6 * s, r);
      break;
    }
    default: {
      R(g, x, y - 2, 1, 2, '#5A3A1E');
      ell(g, x, y - 5 * s, 4 * s, 3.5 * s, ramp('#3E8A3A'));
      px(g, x - 2, y - 7 * s, ramp('#3E8A3A').hi);
    }
  }
};

/** A cheap hash of a pixel (0..1), the same every time: speckle, scatter. */
export const hash = (x: number, y: number, s = 0) => { const n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return n - Math.floor(n); };
