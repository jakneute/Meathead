// THE GROSS-UP KIT (the user's standing rule for every close-up: "gross ren and stimpy style close ups"): the John K held
// still, a face huge in frame and painted in excruciating detail (pores, veins, bloodshot eyes, sweat, stubble, teeth
// and gums, wet highlights). The land bosses' fight-start close-ups are built from it (adventure/river/artieGross.ts,
// spooky/donnieGross.ts, space/queen/queenGross.ts, hollywood/stunt/steveGross.ts, foreign/harry/harryGross.ts,
// frontier/tuckerGross.ts); Piper's (fantasy/piperGross.ts) came first and is the model for it.
//
// Painted per pixel into a low-res buffer (GW x GH, each pixel GP screen pixels at the hold): round shading off a light
// up-left, stepped into long SNES ramps with a 4x4 ordered dither between the steps, creases inked in each material's
// line tone. The heavy paint's cached (a base per face, a stamp per variant off it: `stamps`); the live bits (a bead of
// sweat running, drool, spittle, a tic, glints) are drawn over it each frame by the caller (`drawGrossStamp`'s `over`).

import { idleJob } from '../m1/game/scenes/art/raster';

export type Ctx = CanvasRenderingContext2D;

/** The buffer's size in its pixels, and how many screen pixels each is at the hold (a little over the whole screen). */
export const GW = 272, GH = 204, GP = 3;

// ---------------------------------------------------------------------------------------------------------------
// Colors (32-bit, the buffer's byte order) and ramps (light .. deep, then the line)

export const hexU = (h: string) => { const n = parseInt(h.slice(1), 16); return ((255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | (n >> 16)) >>> 0; };
export const R = (...h: string[]) => h.map(hexU);
export const mixU = (a: number, b: number, k: number) => {
  const ch = (s: number) => Math.round(((a >>> s) & 255) * (1 - k) + ((b >>> s) & 255) * k);
  return ((255 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)) >>> 0;
};
export const WHITE = hexU('#FFFFFF');
export const BLACK = hexU('#000000');

// (the shared ramps: eyes, mouths, teeth, gums, blood, veins)
export const SCLERA = R('#FFFFFF', '#FAF2EC', '#F0DCD4', '#DCBCB4', '#B8908A', '#6A3A34');
export const SCLERA_Y = R('#FFFCE0', '#F6EEC0', '#E8DCA4', '#D0BE86', '#A8925E', '#5A4626');
export const SCLERA_R = R('#FFF0EC', '#F8D4CC', '#F0B4AC', '#DC9088', '#B86660', '#6A2A26');
export const PUPIL = R('#2A2A30', '#16161A', '#0A0A0C', '#040406', '#000000');
export const MOUTH = R('#8A3240', '#6A1E2A', '#4C1220', '#320A14', '#1C040C', '#0A0004');
export const TONGUE = R('#FFBCC8', '#F894A4', '#E87286', '#C85068', '#9A344C', '#4A1020');
export const GUM = R('#FFB4BC', '#F48C9A', '#DC6A7E', '#B84A60', '#8A2E44', '#4A1020');
export const TOOTH = R('#FFFDEC', '#F4EAC0', '#E0CE94', '#C4AC6C', '#9A8048', '#4E3E1E');
export const TOOTH_B = R('#E8D49A', '#CCB070', '#A88A4C', '#806434', '#584020', '#2E200C');
export const GOLD = R('#FFFAD0', '#FBE27A', '#F2C444', '#D4A02A', '#A8781A', '#7A520E', '#3E2806');
export const VEIN = R('#F4B0E4', '#D07ACA', '#A852A4', '#80347E', '#5A1A5E', '#2A0630');
export const VEIN_B = R('#B8D0FF', '#8AA8E8', '#6080C8', '#4460A0', '#2C4078', '#141E40');
export const BLOOD = R('#F46A6A', '#D63434', '#B01C1C', '#861010', '#5A0808', '#2E0202');
export const DARK = hexU('#2A140E'), HAIRLINE = hexU('#1E120A');

// ---------------------------------------------------------------------------------------------------------------
// The buffer and its brushes

export const M_SKIN = 1, M_HAIR = 2, M_SCLERA = 3, M_IRIS = 4, M_LIP = 5, M_MOUTH = 6, M_OTHER = 7, M_METAL = 8, M_CLOTH = 9, M_GLASS = 10;
export interface Buf { px: Uint32Array; mat: Uint8Array; tone: Uint8Array; glints: number[] }
export const newBuf = (): Buf => ({ px: new Uint32Array(GW * GH), mat: new Uint8Array(GW * GH), tone: new Uint8Array(GW * GH), glints: [] });
export const cloneBuf = (b: Buf): Buf => ({ px: b.px.slice(), mat: b.mat.slice(), tone: b.tone.slice(), glints: b.glints.slice() });
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
export const bay = (x: number, y: number) => BAYER[(y & 3) * 4 + (x & 3)];
export const hash2 = (x: number, y: number) => { let h = (x * 374761393 + y * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
let seed = 1;
/** The painting's dice: seeded (`setSeed`) so a face paints the same every time. */
export const setSeed = (s: number) => { seed = s; };
export const getSeed = () => seed;
export const rnd = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
export const matAt = (b: Buf, x: number, y: number) => (x < 0 || y < 0 || x >= GW || y >= GH ? 0 : b.mat[(y | 0) * GW + (x | 0)]);
export const pxAt = (b: Buf, x: number, y: number) => b.px[Math.max(0, Math.min(GH - 1, Math.round(y))) * GW + Math.max(0, Math.min(GW - 1, Math.round(x)))];

export const plot = (b: Buf, x: number, y: number, col: number, mat?: number, onMat?: number) => {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= GW || y >= GH) return;
  const i = y * GW + x;
  if (onMat !== undefined && b.mat[i] !== onMat) return;
  b.px[i] = col; if (mat !== undefined) b.mat[i] = mat;
};
/** Darken (or lighten, toward white) what's already there. */
export const shade = (b: Buf, x: number, y: number, col: number, k: number, onMat?: number) => {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= GW || y >= GH) return;
  const i = y * GW + x;
  if (onMat !== undefined && b.mat[i] !== onMat) return;
  b.px[i] = mixU(b.px[i], col, k);
};
export const seg = (b: Buf, x0: number, y0: number, x1: number, y1: number, col: number, w = 1, mat?: number, onMat?: number) => {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  for (let k = 0; k <= n; k++) {
    const x = x0 + ((x1 - x0) * k) / n, y = y0 + ((y1 - y0) * k) / n;
    for (let a = 0; a < w; a++) for (let d = 0; d < w; d++) plot(b, x + a - (w - 1) / 2, y + d - (w - 1) / 2, col, mat, onMat);
  }
};
export const path = (b: Buf, pts: number[], col: number, w = 1, mat?: number, onMat?: number) => { for (let i = 2; i < pts.length; i += 2) seg(b, pts[i - 2], pts[i - 1], pts[i], pts[i + 1], col, w, mat, onMat); };

export interface BallO {
  mat?: number;
  /** Ink its edge (all of it, or where this says, from the edge's direction off its middle). */
  line?: boolean | ((dx: number, dy: number) => boolean);
  lw?: number;
  /** Brighter (>1) or duller. */
  lit?: number;
  /** Flatter (<1) or rounder. */
  flat?: number;
  /** Dither it off into what's under it over this much of its rim (0..1). */
  soft?: number;
  only?: (x: number, y: number) => boolean;
  /** Where the light's from (default up-left). */
  light?: [number, number, number];
}
/** A round form in its ramp: shaded off the light up-left, stepped, dithered between the steps. */
export const ball = (b: Buf, cx: number, cy: number, rx: number, ry: number, ramp: number[], o: BallO = {}) => {
  const n = ramp.length - 1, lw = o.lw ?? 1.2, mn = Math.min(rx, ry);
  const [lx, ly, lz] = o.light ?? [-0.42, -0.5, 0.76];
  const y0 = Math.max(0, Math.floor(cy - ry)), y1 = Math.min(GH - 1, Math.ceil(cy + ry));
  const x0 = Math.max(0, Math.floor(cx - rx)), x1 = Math.min(GW - 1, Math.ceil(cx + rx));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, d2 = dx * dx + dy * dy;
    if (d2 > 1) continue;
    if (o.only && !o.only(x, y)) continue;
    const d = Math.sqrt(d2);
    if (o.soft && d > 1 - o.soft && bay(x, y) > (1 - d) / o.soft) continue;
    const i = y * GW + x;
    if (o.line && (1 - d) * mn < lw && (o.line === true || o.line(dx, dy))) { b.px[i] = ramp[n]; if (o.mat !== undefined) b.mat[i] = o.mat; b.tone[i] = 255; continue; }
    const nz = Math.sqrt(1 - d2) * (o.flat ?? 1), ln = Math.hypot(dx, dy, nz) || 1;
    const lv = Math.max(0, Math.min(1, ((lx * dx + ly * dy + lz * nz) / ln) * (o.lit ?? 1)));
    const s = (1 - lv) * n * 1.05 - 0.55 + (bay(x, y) - 0.5) * 0.9;
    const k = Math.max(0, Math.min(n - 1, Math.round(s)));
    b.px[i] = ramp[k]; b.tone[i] = Math.round((k / Math.max(1, n - 1)) * 254);
    if (o.mat !== undefined) b.mat[i] = o.mat;
  }
};
/** Wash a color over what's there (in an ellipse, on one material), dithered off at the rim. */
export const tint = (b: Buf, cx: number, cy: number, rx: number, ry: number, col: number, k: number, onMat?: number, soft = 0.5) => {
  for (let y = Math.max(0, Math.floor(cy - ry)); y <= Math.min(GH - 1, cy + ry); y++) for (let x = Math.max(0, Math.floor(cx - rx)); x <= Math.min(GW - 1, cx + rx); x++) {
    const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, d = Math.sqrt(dx * dx + dy * dy);
    if (d > 1) continue;
    const i = y * GW + x;
    if (onMat !== undefined && b.mat[i] !== onMat) continue;
    if (d > 1 - soft && bay(x, y) > (1 - d) / soft) continue;
    b.px[i] = mixU(b.px[i], col, k);
  }
};
const inPoly = (pts: number[], x: number, y: number) => {
  let c = false;
  for (let i = 0, j = pts.length - 2; i < pts.length; j = i, i += 2) {
    const xi = pts[i], yi = pts[i + 1], xj = pts[j], yj = pts[j + 1];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
/** A flat polygon in its ramp, banded top to bottom (and a little across), inked round its edge (`line` false: not). */
export const poly = (b: Buf, pts: number[], ramp: number[], mat?: number, o: { line?: boolean; tilt?: number; only?: (x: number, y: number) => boolean } = {}) => {
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (let i = 0; i < pts.length; i += 2) { x0 = Math.min(x0, pts[i]); x1 = Math.max(x1, pts[i]); y0 = Math.min(y0, pts[i + 1]); y1 = Math.max(y1, pts[i + 1]); }
  const n = ramp.length - 1, tilt = o.tilt ?? 0.4;
  for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(GH - 1, y1); y++) for (let x = Math.max(0, Math.floor(x0)); x <= Math.min(GW - 1, x1); x++) {
    const px = x + 0.5, py = y + 0.5;
    if (!inPoly(pts, px, py)) continue;
    if (o.only && !o.only(x, y)) continue;
    const edge = o.line !== false && (!inPoly(pts, px - 1, py) || !inPoly(pts, px + 1, py) || !inPoly(pts, px, py - 1) || !inPoly(pts, px, py + 1));
    const t = (py - y0) / Math.max(1, y1 - y0) + ((px - x0) / Math.max(1, x1 - x0)) * tilt;
    const k = edge ? n : Math.max(0, Math.min(n - 1, Math.round((t / (1 + Math.abs(tilt))) * (n - 1) + (bay(x, y) - 0.5) * 0.9)));
    plot(b, x, y, ramp[k], mat);
  }
};
/** A wandering line (a crack, a vein, a run of something): `fn` paints each step (false stops it). */
export const walk = (x: number, y: number, ang: number, steps: number, wob: number, fn: (x: number, y: number, i: number) => boolean | void) => {
  for (let i = 0; i < steps; i++) {
    x += Math.cos(ang); y += Math.sin(ang); ang += (rnd() - 0.5) * wob;
    if (fn(Math.round(x), Math.round(y), i) === false) return;
  }
};
/** A drop of sweat: clear, catching the light (low right), a glint up left. */
export const bead = (b: Buf, x: number, y: number, r: number, skin: number[]) => {
  ball(b, x, y, r, r * 1.25, [skin[2], skin[1], skin[0], WHITE, skin[Math.min(5, skin.length - 1)]], { line: (_dx, dy) => dy > 0.2, lw: 0.8 });
  plot(b, x - r * 0.4, y - r * 0.5, WHITE);
};
/** A bulging vein along `pts` (its ramp: light .. line). */
export const vein = (b: Buf, pts: number[], ramp = VEIN, w = 3) => {
  path(b, pts, ramp[5], w + 1); path(b, pts, ramp[3], w);
  path(b, pts.map((v, i) => (i % 2 ? v : v - 1)), ramp[1], 1); path(b, pts.map((v, i) => (i % 2 ? v - 1 : v - 1)), ramp[0], 1);
};
/** Hairs: `n` short strokes in a region (`at` picks a point, or null), each `len` long along `ang` (+ a wobble). */
export const hairs = (b: Buf, n: number, at: () => [number, number] | null, len: number, ang: number, col: number, onMat?: number, wob = 0.6) => {
  for (let k = 0; k < n; k++) {
    const p = at(); if (!p) continue;
    const a = ang + (rnd() - 0.5) * wob, l = len * (0.6 + rnd() * 0.6);
    seg(b, p[0], p[1], p[0] + Math.cos(a) * l, p[1] + Math.sin(a) * l, col, 1, undefined, onMat);
  }
};
/** Stubble: dots darker than the skin under them, thick in the middle of a region and thinning out. */
export const stubble = (b: Buf, inside: (x: number, y: number) => number, col: number, dens = 0.45, onMat = M_SKIN) => {
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const i = y * GW + x;
    if (b.mat[i] !== onMat) continue;
    const k = inside(x, y);
    if (k <= 0) continue;
    const h = hash2(x * 3 + 11, y * 5 + 7);
    if (h < dens * k) b.px[i] = mixU(b.px[i], col, h < dens * k * 0.4 ? 0.7 : 0.45);
  }
};

/** Ink round a material's edge, where it meets anything but `keep` (its line tone). */
export const inkEdges = (b: Buf, mat: number, col: number, keep: number[] = []) => {
  const m = b.mat.slice();
  const other = (x: number, y: number) => { if (x < 0 || y < 0 || x >= GW || y >= GH) return false; const v = m[y * GW + x]; return v !== mat && !keep.includes(v); };
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    if (m[y * GW + x] !== mat) continue;
    if (other(x - 1, y) || other(x + 1, y) || other(x, y - 1) || other(x, y + 1)) b.px[y * GW + x] = col;
  }
};

/** The skin's going over: pores (thick on the nose and the cheeks: `dens`), blackheads, grease shining on the lit side. */
export const skinPost = (b: Buf, deep: number, dens: (x: number, y: number) => number, o: { onMat?: number; blackheads?: (x: number, y: number) => boolean; shine?: number; shineCol?: number } = {}) => {
  const on = o.onMat ?? M_SKIN, sh = o.shine ?? 0.14, sc = o.shineCol ?? WHITE;
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const i = y * GW + x;
    if (b.mat[i] !== on) continue;
    const h = hash2(x, y), d = dens(x, y);
    if (h < d) b.px[i] = mixU(b.px[i], deep, h < d * 0.3 ? 0.42 : 0.26);
    else if (o.blackheads?.(x, y) && h > 0.965) { b.px[i] = DARK; if (hash2(x + 1, y) > 0.5) plot(b, x + 1, y, DARK); }
    else if (b.tone[i] < 60 && h > 0.6 && h < 0.6 + sh) b.px[i] = mixU(b.px[i], sc, 0.6);
  }
};

export interface EyeO {
  rx: number; ry: number;
  /** The white (bloodshot or yellowed) and the iris. */
  sclera?: number[]; iris: number[];
  /** The iris's size and where it sits off the middle; the pupil's size. */
  ir?: number; idx?: number; idy?: number; pr?: number;
  /** Red threads in off the rim. */
  veins?: number;
  /** The lids: the top lid's edge (y at x) and the bottom's (nothing over the eye past them), the lid's skin ramp. */
  top?: (x: number) => number; bot?: (x: number) => number; lid?: number[];
  /** The iris glowing (Donnie's): no ink, the light painted in. */
  glow?: boolean;
}
/** An eyeball, lids and all: the white (with its threads), the iris (rayed), the pupil, the glints, the lids over it. */
export const eyeball = (b: Buf, ex: number, ey: number, o: EyeO) => {
  const { rx, ry } = o;
  ball(b, ex, ey, rx, ry, o.sclera ?? SCLERA, { mat: M_SCLERA, line: true, lw: 1, flat: 0.7 });
  for (let k = 0; k < (o.veins ?? 8); k++) {
    const a = rnd() * Math.PI * 2;
    const col = hexU(k % 3 ? '#D8303C' : '#9A1622');
    walk(ex + Math.cos(a) * rx * 0.92, ey + Math.sin(a) * ry * 0.92, a + Math.PI, 4 + rnd() * 9, 1.3, (x, y, i) => {
      if (matAt(b, x, y) !== M_SCLERA) return false;
      plot(b, x, y, col);
      if (i === 2 && rnd() < 0.6) walk(x, y, a + Math.PI + 0.9, 3 + rnd() * 3, 1.2, (x2, y2) => { if (matAt(b, x2, y2) !== M_SCLERA) return false; plot(b, x2, y2, col); });
    });
  }
  const ir = o.ir ?? Math.min(rx, ry) * 0.62, ix = ex + (o.idx ?? 0), iy = ey + (o.idy ?? 0);
  const onEye = (x: number, y: number) => matAt(b, x, y) === M_SCLERA || matAt(b, x, y) === M_IRIS;
  ball(b, ix, iy, ir, ir, o.iris, { mat: M_IRIS, line: !o.glow, only: onEye, lit: o.glow ? 1.4 : 1 });
  for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; seg(b, ix + Math.cos(a) * ir * 0.35, iy + Math.sin(a) * ir * 0.35, ix + Math.cos(a) * (ir - 1.5), iy + Math.sin(a) * (ir - 1.5), o.iris[k % 2 ? 1 : 3], 1, undefined, M_IRIS); }
  const pr = o.pr ?? ir * 0.45;
  if (pr > 0) ball(b, ix, iy, pr, pr, o.glow ? [o.iris[0], WHITE, o.iris[0], o.iris[1], o.iris[2]] : PUPIL, { mat: M_IRIS });
  plot(b, ix - ir * 0.4, iy - ir * 0.4, WHITE); plot(b, ix - ir * 0.4 + 1, iy - ir * 0.4, WHITE); plot(b, ix - ir * 0.4, iy - ir * 0.4 + 1, WHITE); plot(b, ix + ir * 0.3, iy + ir * 0.3, WHITE);
  // (the lids: the skin down over the top of it, up over the bottom)
  const lid = o.lid;
  if (lid && (o.top || o.bot)) {
    for (let y = Math.floor(ey - ry - 1); y <= ey + ry + 1; y++) for (let x = Math.floor(ex - rx - 1); x <= ex + rx + 1; x++) {
      const m = matAt(b, x, y);
      if (m !== M_SCLERA && m !== M_IRIS) continue;
      if (o.top && y < o.top(x)) { const dl = o.top(x) - y; plot(b, x, y, lid[dl < 1.5 ? lid.length - 1 : dl < 3 ? 4 : dl < 6 ? (bay(x, y) < 0.5 ? 2 : 3) : 2], M_SKIN); }
      else if (o.bot && y > o.bot(x)) { const dl = y - o.bot(x); plot(b, x, y, lid[dl < 1.5 ? lid.length - 1 : dl < 3 ? 4 : 3], M_SKIN); }
    }
  }
};

/** Teeth along the inside of a mouth (only over its M_MOUTH): yellowed, gaps, gold, rot; `edge(x)` the gum line, `dir`
 *  +1 down from it (the top row) or -1 up (the bottom), `h` how long, `tw` each one's width. */
export const teeth = (b: Buf, x0: number, x1: number, edge: (x: number) => number, dir: 1 | -1, h: number, o: { gaps?: number[]; gold?: number[]; rot?: number[]; tw?: number; ramp?: number[]; long?: number[] } = {}) => {
  const tw = o.tw ?? 5;
  for (let i = 0, x = x0; x < x1; i++, x += tw) {
    if (o.gaps?.includes(i)) continue;
    const ramp = o.gold?.includes(i) ? GOLD : o.rot?.includes(i) ? TOOTH_B : o.ramp ?? TOOTH;
    const hh = o.long?.includes(i) ? h * 1.5 : h;
    for (let tx = 0; tx < tw - 1; tx++) for (let ty = 0; ty < hh; ty++) {
      const y = Math.round(edge(x + tx) + dir * ty);
      if (matAt(b, x + tx, y) !== M_MOUTH) continue;
      // (rounded off at the tip)
      if (ty > hh - 2 && (tx === 0 || tx === tw - 2)) continue;
      let k = tx === 0 ? 0 : tx === tw - 2 ? 3 : ty > hh - 2 ? 2 : 1;
      if (ty === 0) k = Math.min(ramp.length - 2, 4);
      if (bay(x + tx, y) > 0.8 && k < 3) k++;
      plot(b, x + tx, y, ramp[k], M_OTHER);
    }
    // (plaque at the gum line)
    if (!o.gold?.includes(i)) for (let tx = 0; tx < tw - 1; tx++) { const y = Math.round(edge(x + tx) + dir); if (matAt(b, x + tx, y) === M_OTHER && hash2(x + tx, y) > 0.35) plot(b, x + tx, y, TOOTH_B[2]); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Caching and drawing

/** The buffer onto a canvas (null with no document: the headless runs). */
export const toCanvas = (b: Buf): HTMLCanvasElement | null => {
  if (typeof document === 'undefined') return null;
  const cv = document.createElement('canvas'); cv.width = GW; cv.height = GH;
  const g = cv.getContext('2d')!;
  const img = g.createImageData(GW, GH);
  new Uint32Array(img.data.buffer).set(b.px);
  g.putImageData(img, 0, 0);
  return cv;
};

// ---- painted ahead, a step at a time
/** A paint that can be paused: a generator yielding between its parts, returning what it painted. */
export type Steps<T> = Iterator<void, T>;
const isSteps = <T>(r: T | Steps<T>): r is Steps<T> => !!r && typeof (r as Steps<T>).next === 'function';
/**
 * A paint part done, carrying its own dice (the seed's shared: anything painted in between, a portrait or a face
 * wanted now, would otherwise shift the dice under it, and it'd come out different from painting it in one go).
 * `run(until)` paints on till then (true once done); `finish()` the rest, now.
 */
export const stepper = <T>(start: () => T | Steps<T>, dice: { get: () => number; set: (s: number) => void } = { get: getSeed, set: setSeed }) => {
  let it: Steps<T> | null = null, mine = 0, out: { v: T } | null = null;
  const go = (until: number) => {
    if (out) return true;
    const theirs = dice.get();
    try {
      if (!it) { const r = start(); if (!isSteps(r)) { out = { v: r }; return true; } it = r; mine = dice.get(); }
      dice.set(mine);
      for (;;) { const n = it.next(); if (n.done) { out = { v: n.value }; it = null; return true; } if (performance.now() >= until) { mine = dice.get(); return false; } }
    } finally { dice.set(theirs); }
  };
  return { run: go, finish: (): T => { go(Infinity); return out!.v; }, done: () => !!out };
};
/** Paint jobs to do ahead (each face's, as its module loads): run by warmGrossUps. */
const ahead: ((until: number) => boolean)[] = [];
export const paintAhead = (job: (until: number) => boolean) => { ahead.push(job); };
let warming = false;
/** Paints every gross-up ahead, a few ms per idle moment (each face's parts a step at a time: never a long frame),
 *  so no close-up stops to paint itself the frame it cuts in (or each time a new mouth shape comes up). Once. */
export const warmGrossUps = () => {
  if (warming || typeof document === 'undefined') return;
  warming = true;
  const q = ahead.slice();
  idleJob(until => {
    while (q.length) { if (!q[0](until)) return false; q.shift(); if (performance.now() >= until) break; }
    return !q.length;
  });
};

/** A face's stamps: built once each (by key), kept; `warm`: the keys to paint ahead (warmGrossUps). `build` can be a
 *  generator yielding between its parts (so it can be painted ahead a step at a time). */
export const stamps = <K extends string>(build: (key: K) => Buf | Steps<Buf>, warm: K[] = []) => {
  const m = new Map<K, { img: HTMLCanvasElement | null; buf: Buf }>();
  const going = new Map<K, ReturnType<typeof stepper<Buf>>>();
  const job = (key: K) => { let j = going.get(key); if (!j) { j = stepper(() => build(key)); going.set(key, j); } return j; };
  const keep = (key: K, buf: Buf) => { const s = { img: toCanvas(buf), buf }; m.set(key, s); going.delete(key); return s; };
  if (warm.length) paintAhead(until => {
    for (const k of warm) {
      if (m.has(k)) continue;
      const j = job(k);
      if (!j.run(until)) return false;
      keep(k, j.finish());
      if (performance.now() >= until) return false;
    }
    return true;
  });
  return (key: K) => m.get(key) ?? keep(key, job(key).finish());
};

/** A stamp on the screen: (cx, cy) where its (fx, fy) goes, `zoom` 1 at the hold (each of its pixels GP screen pixels),
 *  a slow lurch and a jitter now and then, `jolt` a shake; `over` draws the live bits in the buffer's own pixels. */
export const drawGrossStamp = (c: Ctx, img: HTMLCanvasElement | null, cx: number, cy: number, fx: number, fy: number, zoom: number, f: number, jolt = 0, over?: (box: (x: number, y: number, w: number, h: number, col: string) => void) => void) => {
  if (!img) return;
  const S = GP * zoom;
  const jx = Math.round(Math.sin(f * 0.045) * 1.4 + (hash2(Math.floor(f / 9), 3) > 0.7 ? (hash2(Math.floor(f / 9), 5) - 0.5) * 2 : 0)) + (jolt * (f % 4 < 2 ? 1 : -1)) / GP;
  const jy = Math.round(Math.sin(f * 0.06) * 1.2);
  c.save();
  c.translate(Math.round(cx - (fx - jx) * S), Math.round(cy - (fy - jy) * S));
  c.scale(S, S);
  c.imageSmoothingEnabled = false;
  c.drawImage(img, 0, 0);
  if (over) over((x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); });
  c.restore();
};

/** Behind a close-up: the screen in flat bands (top to bottom), a dithered seam between each. */
export const grossBackdrop = (c: Ctx, W: number, H: number, bands: string[]) => {
  const n = bands.length, bh = H / n;
  bands.forEach((col, i) => { c.fillStyle = col; c.fillRect(0, Math.floor(i * bh), W, Math.ceil(bh) + 1); });
  for (let i = 1; i < n; i++) {
    c.fillStyle = bands[i];
    const y = Math.floor(i * bh) - 4;
    for (let x = 0; x < W; x += 4) { c.fillRect(x, y, 2, 2); c.fillRect(x + 2, y + 2, 2, 2); }
  }
};

/** A brief close-up's punch in and out: 0..1 over the first `inT` frames, back down over the last `outT` of `T`. */
export const punchK = (t: number, T: number, inT = 10, outT = 0) => Math.min(1, t / inT, outT ? (T - t) / outT : 1);
