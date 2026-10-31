// The custom cheap-shot close-ups' shared kit (group B: Harry, Piper, the demon, the Queen, the rex). Bake-time painters
// (SNES shading a pixel at a time, hard bands with a checker seam, ink outlines, veins, hair, the X-ray window) and
// per-frame movers (debris from a baked sheet drawn turned, droplets, drips, sparks, smoke puffs, the sound word, the
// shake). Nothing here paints at load: every canvas comes from closeUp.ts bakeOnce on first use.

import { bakeOnce, rnd, clamp, PANEL_W, PANEL_H } from '../closeUp';

type Ctx = CanvasRenderingContext2D;
/** A color ramp, darkest first. */
export type Ramp = readonly string[];
export const INK = '#0A0608';

// ---------------------------------------------------------------------------------------------------------------------
// Bake-time painting

const px = (g: Ctx, x: number, y: number, col: string) => { g.fillStyle = col; g.fillRect(x, y, 1, 1); };

/** Paints a shape a pixel at a time (bake only): `inside(x, y)`, `lit(x, y)` 0..1; the ramp in bands, a checker seam. */
export const shade = (g: Ctx, x0: number, y0: number, w: number, h: number, inside: (x: number, y: number) => boolean, lit: (x: number, y: number) => number, ramp: Ramp) => {
  const n = ramp.length - 1;
  x0 = Math.floor(x0); y0 = Math.floor(y0);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const x = x0 + i + 0.5, y = y0 + j + 0.5;
    if (!inside(x, y)) continue;
    const v = clamp(lit(x, y)) * n, lo = Math.floor(v), fr = v - lo;
    const k = Math.min(n, fr > 0.7 ? lo + 1 : fr > 0.4 && ((x0 + i + y0 + j) & 1) ? lo + 1 : lo);
    px(g, x0 + i, y0 + j, ramp[k]);
  }
};
/** How lit a point on a dome is (light from the upper left, toward us). */
export const domeLit = (cx: number, cy: number, rx: number, ry: number, amb = 0.1) => (x: number, y: number) => {
  const nx = (x - cx) / rx, ny = (y - cy) / ry, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
  return amb + (1 - amb) * Math.max(0, -0.5 * nx - 0.55 * ny + 0.67 * nz);
};
export const inEllipse = (cx: number, cy: number, rx: number, ry: number) => (x: number, y: number) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;

/** A shaded ball (bake): ink rim, the dome in the ramp's bands, a glint. */
export const orb = (g: Ctx, cx: number, cy: number, rx: number, ry: number, ramp: Ramp, ink = INK, glint = true) => {
  g.fillStyle = ink; g.beginPath(); g.ellipse(cx, cy, rx + 1.5, ry + 1.5, 0, 0, Math.PI * 2); g.fill();
  shade(g, cx - rx - 1, cy - ry - 1, rx * 2 + 3, ry * 2 + 3, inEllipse(cx, cy, rx, ry), domeLit(cx, cy, rx, ry), ramp);
  if (glint) { g.fillStyle = '#FFFFFF'; g.fillRect(Math.round(cx - rx * 0.45), Math.round(cy - ry * 0.55), Math.max(2, Math.round(rx * 0.22)), Math.max(1, Math.round(ry * 0.14))); }
};

const pats = new Map<string, CanvasPattern>();
/** A 2x2 checker of a color (a band's seam). */
export const dith = (g: Ctx, col: string): CanvasPattern | string => {
  let p = pats.get(col);
  if (p) return p;
  if (typeof document === 'undefined') return col;
  const cv = document.createElement('canvas'); cv.width = 2; cv.height = 2;
  const x = cv.getContext('2d')!; x.fillStyle = col; x.fillRect(0, 0, 1, 1); x.fillRect(1, 1, 1, 1);
  p = g.createPattern(cv, 'repeat')!; pats.set(col, p);
  return p;
};

/** Hard bands across a box, `cols` in order (top to bottom, or left to right when !down), a checker seam at each step. */
export const bands = (g: Ctx, x: number, y: number, w: number, h: number, cols: Ramp, down = true) => {
  const n = cols.length, step = (down ? h : w) / n;
  for (let i = 0; i < n; i++) {
    g.fillStyle = cols[i];
    if (down) g.fillRect(x, Math.round(y + i * step), w, Math.ceil(step) + 1); else g.fillRect(Math.round(x + i * step), y, Math.ceil(step) + 1, h);
  }
  for (let i = 1; i < n; i++) {
    g.fillStyle = dith(g, cols[i]);
    if (down) g.fillRect(x, Math.round(y + i * step) - 2, w, 2); else g.fillRect(Math.round(x + i * step) - 2, y, 2, h);
  }
};

/** Runs `paint` clipped to a path. */
export const clipTo = (g: Ctx, path: () => void, paint: () => void) => { g.save(); g.beginPath(); path(); g.clip(); paint(); g.restore(); };
export const stroke = (g: Ctx, path: () => void, col: string, w: number) => { g.beginPath(); path(); g.strokeStyle = col; g.lineWidth = w; g.lineJoin = 'round'; g.stroke(); };

/** A shape in banded light from the left (or top), outlined. */
export const banded = (g: Ctx, path: () => void, x: number, y: number, w: number, h: number, cols: Ramp, down = false, ink: string | null = INK, lw = 3) => {
  clipTo(g, path, () => bands(g, x, y, w, h, cols, down));
  if (ink) stroke(g, path, ink, lw);
};

/** A vein (bake): a wandering line that forks, a lit edge. */
export const vein = (g: Ctx, x: number, y: number, ang: number, len: number, seed: number, col: string, w = 2, hi?: string) => {
  const pts: [number, number][] = [[x, y]];
  let a = ang;
  for (let i = 0; i < 6; i++) { a += (rnd(seed + i * 3.7) - 0.5) * 1.1; x += Math.cos(a) * len / 6; y += Math.sin(a) * len / 6; pts.push([x, y]); }
  const path = () => { g.moveTo(pts[0][0], pts[0][1]); for (const p of pts) g.lineTo(p[0], p[1]); };
  stroke(g, path, col, w);
  if (hi) { g.save(); g.translate(-1, -1); stroke(g, path, hi, 1); g.restore(); }
  if (len > 20) vein(g, pts[3][0], pts[3][1], ang + (rnd(seed * 2.3) > 0.5 ? 0.9 : -0.9), len * 0.45, seed + 17, col, Math.max(1, w - 1));
};

/** Curly hairs over a box (bake). */
export const hairs = (g: Ctx, x: number, y: number, w: number, h: number, n: number, seed: number, col: string, len = 7) => {
  g.strokeStyle = col; g.lineWidth = 1.4; g.beginPath();
  for (let i = 0; i < n; i++) {
    const hx = x + rnd(seed + i) * w, hy = y + rnd(seed + i * 1.9 + 4) * h, a = rnd(seed + i * 2.7) * Math.PI * 2;
    g.moveTo(hx, hy); g.quadraticCurveTo(hx + Math.cos(a + 1.4) * len, hy + Math.sin(a + 1.4) * len, hx + Math.cos(a) * len, hy + Math.sin(a) * len);
  }
  g.stroke();
};

/** Sweat beads (bake). */
export const sweatBeads = (g: Ctx, x: number, y: number, w: number, h: number, n: number, seed: number) => {
  for (let i = 0; i < n; i++) {
    const sx = Math.round(x + rnd(seed + i) * w), sy = Math.round(y + rnd(seed + i * 3.3) * h);
    g.fillStyle = 'rgba(10,20,40,0.5)'; g.fillRect(sx - 2, sy - 1, 5, 6);
    g.fillStyle = '#BFE3F8'; g.fillRect(sx - 1, sy, 3, 4); g.fillStyle = '#FFFFFF'; g.fillRect(sx - 1, sy, 1, 1);
  }
};

/** Scanlines over the whole panel (bake). */
export const scanlines = (g: Ctx, a = 0.18) => { g.fillStyle = `rgba(0,0,0,${a})`; for (let y = 0; y < PANEL_H; y += 3) g.fillRect(0, y, PANEL_W, 1); };

/** The X-ray window (bake): an ellipse glowing in bands (darkest at the rim), a hard rim, tick marks. */
export const xrayWindow = (g: Ctx, cx: number, cy: number, rx: number, ry: number, ramp: Ramp, rim: string) => {
  g.fillStyle = INK; g.beginPath(); g.ellipse(cx, cy, rx + 6, ry + 6, 0, 0, Math.PI * 2); g.fill();
  const n = ramp.length;
  for (let i = 0; i < n; i++) {
    const k = 1 - i / n;
    if (i > 0) { g.fillStyle = dith(g, ramp[i]); g.beginPath(); g.ellipse(cx, cy, rx * k + 2, ry * k + 2, 0, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = ramp[i]; g.beginPath(); g.ellipse(cx, cy, rx * k, ry * k, 0, 0, Math.PI * 2); g.fill();
  }
  g.strokeStyle = rim; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, cy, rx + 2, ry + 2, 0, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 2;
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, r0 = 1.0, r1 = i % 6 ? 1.04 : 1.08; g.beginPath(); g.moveTo(cx + Math.cos(a) * (rx + 2) * r0, cy + Math.sin(a) * (ry + 2) * r0); g.lineTo(cx + Math.cos(a) * (rx + 2) * r1, cy + Math.sin(a) * (ry + 2) * r1); g.stroke(); }
};
export const winPath = (g: Ctx, cx: number, cy: number, rx: number, ry: number) => () => g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);

/** A small caption (bake or live): Press Start 2P, a hard drop shadow. */
export const tag = (c: Ctx, text: string, x: number, y: number, col: string, size = 8, align: CanvasTextAlign = 'left') => {
  c.font = `${size}px "Press Start 2P"`; c.textAlign = align;
  c.fillStyle = '#000'; c.fillText(text, x + 2, y + 2); c.fillStyle = col; c.fillText(text, x, y);
  c.textAlign = 'left';
};

// ---------------------------------------------------------------------------------------------------------------------
// Per frame

/** The hit's shake (translate; the caller's save/restore round it). */
export const shake = (c: Ctx, hit: number, amp = 10, len = 12) => {
  if (hit < 0 || hit >= len) return;
  const k = (len - hit) / len;
  c.translate((hit % 2 ? 1 : -1) * amp * k, ((hit >> 1) % 2 ? 1 : -1) * amp * 0.5 * k);
};
export const flash = (c: Ctx, hit: number, col = '255,255,255', len = 3) => {
  if (hit < 0 || hit >= len) return;
  c.fillStyle = `rgba(${col},${(0.85 * (1 - hit / len)).toFixed(2)})`; c.fillRect(-20, -20, PANEL_W + 40, PANEL_H + 40);
};

/** A strip of little sprites painted once (cell `s` px, `n` of them), for debris drawn turned. */
export interface Sheet { cv: HTMLCanvasElement; n: number; s: number }
export const sheet = (key: string, n: number, s: number, paint: (g: Ctx, i: number, s: number) => void): Sheet => ({
  cv: bakeOnce(key, g => { for (let i = 0; i < n; i++) { g.save(); g.translate(i * s + s / 2, s / 2); paint(g, i, s); g.restore(); } }, n * s, s), n, s,
});
export const stampCell = (c: Ctx, sh: Sheet, i: number, x: number, y: number, rot = 0, sc = 1) => {
  c.save(); c.translate(x, y); if (rot) c.rotate(rot); if (sc !== 1) c.scale(sc, sc);
  c.drawImage(sh.cv, (i % sh.n) * sh.s, 0, sh.s, sh.s, -sh.s / 2, -sh.s / 2, sh.s, sh.s);
  c.restore();
};

export interface Fling { seed: number; ang: number; spread: number; v0: number; v1: number; grav?: number; delay?: number; scale?: number; spin?: number; first?: number; cells?: number }
/** Debris flung from (x0, y0) at `hit`, ballistic, tumbling (cells of the sheet in turn). */
export const debris = (c: Ctx, sh: Sheet, count: number, t: number, x0: number, y0: number, o: Fling) => {
  if (t < 0) return;
  const g = o.grav ?? 0.35, d = o.delay ?? 0, sc = o.scale ?? 1, spin = o.spin ?? 0.4, cells = o.cells ?? sh.n;
  for (let i = 0; i < count; i++) {
    const k = t - Math.floor(rnd(o.seed + i * 3.1) * d);
    if (k < 0) continue;
    const a = o.ang + (rnd(o.seed + i) - 0.5) * o.spread, v = o.v0 + (o.v1 - o.v0) * rnd(o.seed + i * 7.3);
    const x = x0 + Math.cos(a) * v * k, y = y0 + Math.sin(a) * v * k + 0.5 * g * k * k;
    if (y > PANEL_H + 24 || x < -24 || x > PANEL_W + 24) continue;
    stampCell(c, sh, (o.first ?? 0) + (i % cells), x, y, rnd(o.seed + i * 13) * 6 + k * (rnd(o.seed + i * 5) - 0.5) * spin, sc * (0.6 + rnd(o.seed + i * 11) * 0.8));
  }
};

/** Droplets flung out (squares, a lit corner), falling. */
export const drops = (c: Ctx, t: number, x0: number, y0: number, n: number, seed: number, cols: Ramp, o: { ang?: number; spread?: number; v0?: number; v1?: number; grav?: number; delay?: number; size?: number } = {}) => {
  if (t < 0) return;
  const ang = o.ang ?? -Math.PI / 2, spread = o.spread ?? 3, v0 = o.v0 ?? 3, v1 = o.v1 ?? 11, g = o.grav ?? 0.34, d = o.delay ?? 8, sz = o.size ?? 1;
  for (let i = 0; i < n; i++) {
    const k = t - Math.floor(rnd(seed + i * 5) * d);
    if (k < 0) continue;
    const a = ang + (rnd(seed + i) - 0.5) * spread, v = v0 + (v1 - v0) * rnd(seed + i * 2);
    const x = Math.round(x0 + Math.cos(a) * v * k), y = Math.round(y0 + Math.sin(a) * v * k + 0.5 * g * k * k);
    if (y > PANEL_H + 10 || x < -10 || x > PANEL_W + 10) continue;
    const r = Math.round((2 + (i % 4)) * sz);
    c.fillStyle = cols[i % 3 === 0 ? 0 : 1]; c.fillRect(x - r, y - r, r * 2, r * 2);
    c.fillStyle = cols[cols.length - 1]; c.fillRect(x - r, y - r, Math.max(1, r - 1), Math.max(1, r >> 1));
  }
};

/** Drips running down from points, each its own speed, a bulb at the end. */
export const runs = (c: Ctx, t: number, pts: readonly [number, number][], cols: Ramp, maxLen: number, speed = 3, w = 5) => {
  if (t < 0) return;
  for (let i = 0; i < pts.length; i++) {
    const [x, y] = pts[i];
    const len = Math.min(maxLen * (0.5 + rnd(i * 7.7) * 0.5), t * speed * (0.6 + rnd(i * 3.1) * 0.6));
    if (len <= 0) continue;
    const ww = Math.max(2, Math.round(w * (0.6 + rnd(i * 2.2) * 0.6)));
    c.fillStyle = cols[0]; c.fillRect(x - 1, y, ww + 2, len);
    c.fillStyle = cols[1]; c.fillRect(x, y, ww, len);
    c.fillStyle = cols[2]; c.fillRect(x, y, 1, len);
    c.fillStyle = cols[1]; c.fillRect(x - 1, y + len - 2, ww + 2, ww + 1);
    c.fillStyle = cols[2]; c.fillRect(x, y + len - 1, 2, 2);
  }
};

/** Sparks: hot streaks out of a point, gone in `life` frames each. */
export const sparks = (c: Ctx, t: number, x0: number, y0: number, n: number, seed: number, life = 14, cols: Ramp = ['#FDE047', '#FFFFFF', '#FB923C'], v = 9) => {
  if (t < 0) return;
  c.lineWidth = 2;
  for (let i = 0; i < n; i++) {
    const k = t - Math.floor(rnd(seed + i * 2.1) * 6);
    if (k < 0 || k > life) continue;
    const a = rnd(seed + i) * Math.PI * 2, vv = v * (0.4 + rnd(seed + i * 4.4) * 0.8);
    const x = x0 + Math.cos(a) * vv * k, y = y0 + Math.sin(a) * vv * k + 0.18 * k * k;
    c.strokeStyle = cols[i % cols.length]; c.beginPath(); c.moveTo(x, y); c.lineTo(x - Math.cos(a) * vv * 1.2, y - Math.sin(a) * vv * 1.2 - 0.3 * k); c.stroke();
  }
};

/** A smoke puff, banded and dithered (gray), painted once; drawn scaled with alpha. */
const puffCv = (steam = false) => bakeOnce(steam ? 'kitB-steam' : 'kitB-puff', g => {
  const R = steam ? ['#94A3B8', '#B6C2D2', '#CBD5E1', '#E2E8F0', '#F8FAFC'] : ['#1C1917', '#292524', '#44403C', '#57534E', '#78716C'];
  for (let i = 0; i < 5; i++) { const cx = 32 + (rnd(i) - 0.5) * 22, cy = 34 + (rnd(i + 9) - 0.5) * 16, r = 14 + rnd(i * 3) * 10; orb(g, cx, cy, r, r * 0.9, R, 'rgba(0,0,0,0)', false); }
}, 64, 64);
export const smoke = (c: Ctx, t: number, x0: number, y0: number, n: number, seed: number, o: { rise?: number; drift?: number; grow?: number; life?: number; alpha?: number; every?: number; steam?: boolean } = {}) => {
  if (t < 0) return;
  const cv = puffCv(o.steam), rise = o.rise ?? 1.2, drift = o.drift ?? 0.4, grow = o.grow ?? 0.025, life = o.life ?? 60, al = o.alpha ?? 0.8, ev = o.every ?? 5;
  for (let i = 0; i < n; i++) {
    const k = t - i * ev;
    if (k < 0 || k > life) continue;
    const s = 0.4 + k * grow + rnd(seed + i) * 0.3, x = x0 + (rnd(seed + i * 3) - 0.5) * 30 + (rnd(seed + i * 5) - 0.3) * drift * k, y = y0 - rise * k;
    c.globalAlpha = al * (1 - k / life);
    c.drawImage(cv, x - 32 * s, y - 32 * s, 64 * s, 64 * s);
  }
  c.globalAlpha = 1;
};

/** The sound word, anywhere: pops in big, settles, a black drop and a white glint. */
export const bigWord = (c: Ctx, t: number, text: string, x: number, y: number, size: number, fill: string, edge = '#000', rot = -0.16) => {
  if (t < 0) return;
  const s = Math.min(1, (t + 1) / 4) * (1 + Math.max(0, 6 - t) * 0.07);
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.font = `${size}px "Press Start 2P"`; c.textAlign = 'center';
  c.fillStyle = edge; c.fillText(text, 4, 4); c.fillText(text, -2, 0); c.fillText(text, 2, 0); c.fillText(text, 0, -2); c.fillText(text, 0, 2);
  c.fillStyle = '#FFFFFF'; c.fillText(text, -1, -1);
  c.fillStyle = fill; c.fillText(text, 0, 0);
  c.restore();
};
