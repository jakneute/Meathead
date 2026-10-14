// The queen section's SNES painting kit: stepped ramps (ink, deep, base, lit, highlight), tubes shaded round (limbs,
// hoses, pipes), stepped blobs (joints, sacs, eggs), paths shaded in offset steps with a dithered seam between (her
// latex, her crest, her dome), and a checker pattern of any color for dithering. Everything here is flat fills: no
// gradients.

type Ctx = CanvasRenderingContext2D;

/** Five steps of a material, darkest first: ink, deep, base, lit, highlight. */
export type Ramp = readonly [string, string, string, string, string];

/** Her latex: blue-black, going steel-blue where the light catches it. */
export const LAT: Ramp = ['#06070B', '#15161F', '#242733', '#3E4458', '#7C8AAA'];
/** Its gloss (the long shine down her dome, the specular dots). */
export const GLOSS = '#B9C6DE', SPEC = '#EEF3FF';
/** Chrome (her joints, the pistons, the plinth's fittings). */
export const CHROME: Ramp = ['#18181B', '#52525B', '#8E8E99', '#C9CBD3', '#FAFAFA'];
/** Steel (the plinth, the arm she's on). */
export const STEELR: Ramp = ['#111114', '#2E2E35', '#4A4A54', '#6E6E7A', '#A6A6B2'];
/** The egg sac's membrane. */
export const SACR: Ramp = ['#2A2418', '#7C735A', '#B3AA8A', '#D9D1B4', '#F4EFDC'];
/** The yellow foam where her latex has torn. */
export const FOAMR: Ramp = ['#3A2A08', '#A07B22', '#D6AE4A', '#EED27E', '#FFF1BE'];
/** Her mouth's insides (the gums, the dark). */
export const GUM: Ramp = ['#0A0206', '#2A0716', '#4A0E28', '#7A1E44', '#B44A72'];
/** Teeth (silver). */
export const TOOTH: Ramp = ['#2A2E38', '#7C8496', '#B8BFCC', '#E2E6EE', '#FFFFFF'];
/** The mind-control green. */
export const GREEN: Ramp = ['#0B2A06', '#2F7A12', '#5CC22A', '#9BF25E', '#E4FFC8'];

const pats = new WeakMap<Ctx, Map<string, CanvasPattern>>();
/** A checker of `col` (every other 2px cell): for dithering one fill into the next. */
export const dith = (c: Ctx, col: string, px = 2, phase = 0): CanvasPattern | string => {
  if (typeof document === 'undefined') return col;
  let m = pats.get(c); if (!m) { m = new Map(); pats.set(c, m); }
  const key = `${col}|${px}|${phase}`;
  let p = m.get(key);
  if (!p) {
    const t = document.createElement('canvas'); t.width = px * 2; t.height = px * 2;
    const g = t.getContext('2d')!; g.fillStyle = col;
    g.fillRect(phase ? px : 0, 0, px, px); g.fillRect(phase ? 0 : px, px, px, px);
    p = c.createPattern(t, 'repeat')!; m.set(key, p);
  }
  return p;
};

const seg = (c: Ctx, x1: number, y1: number, x2: number, y2: number, w: number, col: string) => {
  if (w <= 0) return;
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
};

/** A tube from (x1, y1) to (x2, y2), `w` thick, shaded round: inked, deep underneath, its base, a lit stripe along its
 *  top, a thin highlight. (The light's from above: its lit side is whichever side faces up.) */
export const tube = (c: Ctx, x1: number, y1: number, x2: number, y2: number, w: number, r: Ramp, inked = true) => {
  c.lineCap = 'round';
  const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1;
  let nx = -dy / l, ny = dx / l;
  if (ny > 0 || (ny === 0 && nx > 0)) { nx = -nx; ny = -ny; }
  if (inked) seg(c, x1, y1, x2, y2, w + 2, r[0]);
  seg(c, x1, y1, x2, y2, w, r[1]);
  const o1 = w * 0.12, o2 = w * 0.24, o3 = w * 0.3;
  seg(c, x1 + nx * o1, y1 + ny * o1, x2 + nx * o1, y2 + ny * o1, w * 0.66, r[2]);
  if (w >= 4) seg(c, x1 + nx * o2, y1 + ny * o2, x2 + nx * o2, y2 + ny * o2, w * 0.34, r[3]);
  if (w >= 7) seg(c, x1 + nx * o3, y1 + ny * o3, x2 + nx * o3, y2 + ny * o3, Math.max(1, w * 0.12), r[4]);
  c.lineCap = 'butt';
};

/** A tube along a polyline (a hose, a sagging cable): shaded as `tube` is, each tone along the whole run in one go (no
 *  ink seams at its bends); its lit stripe up toward -y. */
export const hose = (c: Ctx, pts: [number, number][], w: number, r: Ramp, inked = true) => {
  if (pts.length < 2) return;
  c.lineCap = 'round'; c.lineJoin = 'round';
  const line = (off: number, width: number, col: string) => { c.strokeStyle = col; c.lineWidth = width; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y - off) : c.moveTo(x, y - off))); c.stroke(); };
  if (inked) line(0, w + 2, r[0]);
  line(0, w, r[1]);
  line(w * 0.12, w * 0.66, r[2]);
  if (w >= 4) line(w * 0.24, w * 0.34, r[3]);
  if (w >= 7) line(w * 0.3, Math.max(1, w * 0.12), r[4]);
  c.lineCap = 'butt'; c.lineJoin = 'miter';
};
/** Points along a quadratic curve (for `hose`). */
export const quad = (x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, n = 8): [number, number][] => {
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) { const u = i / n, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), d = u * u; out.push([a * x0 + b * cx + d * x1, a * y0 + b * cy + d * y1]); }
  return out;
};

/** A stepped ball (a joint, an egg, a lump): inked, deep, base up-left of it, lit, a highlight. */
export const blob = (c: Ctx, x: number, y: number, rx: number, ry: number, r: Ramp, inked = true, rot = 0) => {
  const el = (cx: number, cy: number, a: number, b: number, col: string | CanvasPattern) => { if (a <= 0 || b <= 0) return; c.fillStyle = col; c.beginPath(); c.ellipse(cx, cy, a, b, rot, 0, Math.PI * 2); c.fill(); };
  if (inked) el(x, y, rx + 1.2, ry + 1.2, r[0]);
  el(x, y, rx, ry, r[1]);
  el(x - rx * 0.1, y - ry * 0.12, rx * 0.82, ry * 0.8, r[2]);
  el(x - rx * 0.22, y - ry * 0.28, rx * 0.6, ry * 0.56, dith(c, r[3]));
  el(x - rx * 0.3, y - ry * 0.36, rx * 0.42, ry * 0.38, r[3]);
  el(x - rx * 0.42, y - ry * 0.5, Math.max(1, rx * 0.16), Math.max(1, ry * 0.14), r[4]);
};

/**
 * A shape (`path` traces it) shaded in steps: inked, its deep tone, then the same shape again, shrunk about its middle
 * (cx, cy) and shifted toward the light (dx, dy), in each lighter tone (clipped to itself), a dither row before each
 * step: the side away from the light left in a crescent of shadow, the near side catching it, a small hot spot.
 */
export const shapeShade = (c: Ctx, path: () => void, r: Ramp, dx: number, dy: number, line = 2, cx = 0, cy = 0) => {
  c.beginPath(); path();
  c.strokeStyle = r[0]; c.lineWidth = line; c.lineJoin = 'round'; c.stroke();
  c.fillStyle = r[1]; c.fill();
  c.save(); c.clip();
  const step = (k: number, s: number, col: string | CanvasPattern) => { c.save(); c.translate(cx + dx * k, cy + dy * k); c.scale(s, s); c.translate(-cx, -cy); c.beginPath(); path(); c.fillStyle = col; c.fill(); c.restore(); };
  step(0.6, 0.97, dith(c, r[2])); step(1, 0.93, r[2]);
  step(1.8, 0.76, dith(c, r[3])); step(2.3, 0.66, r[3]);
  step(3, 0.36, dith(c, r[4], 2, 1));
  c.restore();
};

/** A stepped glow (no gradient): `n` rings of `rgb` from alpha a0 in the middle to a1 at the edge. */
export const rings = (c: Ctx, x: number, y: number, rx: number, ry: number, rgb: string, a0: number, a1: number, n = 4) => {
  for (let i = n - 1; i >= 0; i--) {
    const k = n === 1 ? 1 : i / (n - 1);
    c.fillStyle = `rgba(${rgb}, ${(a0 + (a1 - a0) * k).toFixed(3)})`;
    c.beginPath(); c.ellipse(x, y, rx * (0.3 + 0.7 * k), ry * (0.3 + 0.7 * k), 0, 0, Math.PI * 2); c.fill();
  }
};

/** A deterministic 0..1 noise. */
export const hash = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
