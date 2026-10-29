// PIPER'S GROSS-UP (the user's: "when it does a closeup of her face, do a gross ren and stimpy style closeup", then
// "make piper's 'gross up' full body"): the John K held still, ALL of her in frame head to glass heels and painted in
// excruciating detail. The face: pores, blackheads on her nose, a cold sore at the corner of her mouth, nose hairs, a
// wart with a hair on her chin, the caked foundation cracking (and stopping dead at her jaw), clumped mascara running,
// lipstick smeared past her lips and on her teeth, gold fillings, bloodshot eyes, an eyelid twitching, three chins,
// hairs on her upper lip, sweat. The body: the hot-pink sequined satin gown straining (split up her thigh and under the
// raised arm, the flesh bulging out of the splits, threads hanging), the belly in rolls under it, sweat stains under the
// arms and the bust, back fat squeezed out over it at the sides, flabby arms (wings of their own), cellulite, stretch
// marks, the inner thigh chafed raw, cankles spilling over little glass heels (one buckling), yellow toenails, a bunion;
// the towering platinum beehive with a gold tiara jammed in it, the gold star wand held up, the tiny useless gossamer
// wings on her back. Two faces: SULTRY (heavy-lidded, the pout, drool) and RAGE (red to the roots, the veins bulging,
// bulging eyes with pinprick pupils, the scream, spittle flying, the wings buzzing uselessly).
//
// Painted per pixel into a low-res buffer (GW x GH, each pixel GP screen pixels): round shading off a light up-left,
// stepped into long SNES ramps with a 4x4 ordered dither between the steps, creases inked in each material's line tone.
// The heavy paint's cached: a base per face, then a stamp per (face, mouth shape, twitch) off it; the live bits (glitter
// twinkling, a bead of sweat running, drool, spittle, the tic, the wings' buzz) are drawn over it each frame.

import { stepper, paintAhead } from '../grossKit';
type Ctx = CanvasRenderingContext2D;

/** The buffer's size in its pixels, and how many screen pixels each is at the hold (all of her: 480 x 500). */
export const GW = 240, GH = 250, GP = 2;
/** The middle of the frame in the buffer (what's put at the caller's (cx, cy)), and the middle of her face. */
const AX = 120, AY = 125;
const FX = 120, FY = 84;

// ---------------------------------------------------------------------------------------------------------------
// Colors (32-bit, the buffer's byte order) and ramps (light .. deep, then the line)

const hexU = (h: string) => { const n = parseInt(h.slice(1), 16); return ((255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | (n >> 16)) >>> 0; };
const R = (...h: string[]) => h.map(hexU);
const mixU = (a: number, b: number, k: number) => {
  const ch = (s: number) => Math.round(((a >>> s) & 255) * (1 - k) + ((b >>> s) & 255) * k);
  return ((255 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)) >>> 0;
};
const WHITE = hexU('#FFFFFF');

// (FACE: the foundation, troweled on a shade too orange; SKIN: the rest of her, where it stops)
const FACE = R('#FFEAD4', '#FCD6B4', '#F4BE98', '#E8A67E', '#D68A66', '#BA6E52', '#94523E', '#5A2A1E');
const SKIN = R('#FFEEE6', '#FCD6C6', '#F4BCA8', '#E8A08C', '#D68474', '#B8665A', '#8E4A42', '#52221E');
const RAGEF = R('#FFC0A8', '#FF9E86', '#F47E6A', '#E45E52', '#CC4440', '#AC2C2E', '#861C22', '#480A10');
const RAGES = R('#FFC8B8', '#FFA494', '#F48478', '#E46660', '#CC4A4A', '#AC3236', '#86202A', '#480A12');
const HAIR = R('#FFFFF4', '#FAF0C4', '#ECD894', '#D4BA6A', '#B09450', '#86703A', '#4E3E1A');
const GOLD = R('#FFFAD0', '#FBE27A', '#F2C444', '#D4A02A', '#A8781A', '#7A520E', '#3E2806');
const GOWN = R('#FFC4E6', '#FF8CC8', '#F45AAE', '#D63A92', '#B02474', '#841656', '#460828');
const WING = R('#FFFFFF', '#EEE8FF', '#D8CCFF', '#BCA8F4', '#9A84DC', '#4A3A8A');
const GLASS = R('#F4FCFF', '#D4F0FC', '#A8DCF4', '#7CC0E8', '#5A9ACC', '#2A4A7A');
const SHADOW = R('#B8D8FF', '#8AB4F8', '#5A8AE8', '#4466CC', '#3048A0', '#1E2C6A');
const SHADOW2 = R('#E8C4FA', '#D2A0F0', '#B47CE0', '#9458C4', '#6E38A0', '#34124E');
const SCLERA = R('#FFFFFF', '#FAF2EC', '#F0DCD4', '#DCBCB4', '#B8908A', '#6A3A34');
const SCLERA_R = R('#FFF0EC', '#F8D4CC', '#F0B4AC', '#DC9088', '#B86660', '#6A2A26');
const IRIS = R('#A8F0C4', '#6ED49A', '#3CAA6E', '#22804E', '#105434', '#04200E');
const PUPIL = R('#2A2A30', '#16161A', '#0A0A0C', '#040406', '#000000');
const LIP = R('#FF94AE', '#F4587E', '#D82450', '#B4143A', '#8A0A28', '#4A0412');
const MOUTH = R('#8A3240', '#6A1E2A', '#4C1220', '#320A14', '#1C040C', '#0A0004');
const TONGUE = R('#FFBCC8', '#F894A4', '#E87286', '#C85068', '#9A344C', '#4A1020');
const TOOTH = R('#FFFDEC', '#F4EAC0', '#E0CE94', '#C4AC6C', '#9A8048', '#4E3E1E');
const NAIL = R('#FFF6C4', '#F0DC8A', '#D4B85A', '#A88A3A', '#5A4418');
const ACRYL = R('#FF9AB8', '#F0406E', '#C41848', '#8A0A2A', '#4A0414');
const WART = R('#ECBCA4', '#D49A82', '#B87A66', '#985C4C', '#764036', '#3A1A14');
const VEIN = R('#F4B0E4', '#D07ACA', '#A852A4', '#80347E', '#5A1A5E', '#2A0630');
const SORE = R('#FFF6B8', '#F6DA6A', '#EAA644', '#C8563A', '#8A2418', '#4A0E08');
const DARK = hexU('#2A140E'), HAIRLINE = hexU('#1E120A'), MASCARA = hexU('#120A14'), SMUDGE = hexU('#3A2A4A');

// ---------------------------------------------------------------------------------------------------------------
// The buffer and its brushes

const M_SKIN = 1, M_HAIR = 2, M_SCLERA = 3, M_IRIS = 4, M_LIP = 5, M_MOUTH = 6, M_OTHER = 7, M_GOWN = 8;
interface Buf { px: Uint32Array; mat: Uint8Array; tone: Uint8Array; glitter: number[] }
const newBuf = (): Buf => ({ px: new Uint32Array(GW * GH), mat: new Uint8Array(GW * GH), tone: new Uint8Array(GW * GH), glitter: [] });
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const bay = (x: number, y: number) => BAYER[(y & 3) * 4 + (x & 3)];
const hash2 = (x: number, y: number) => { let h = (x * 374761393 + y * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
let seed = 1;
const rnd = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const matAt = (b: Buf, x: number, y: number) => (x < 0 || y < 0 || x >= GW || y >= GH ? 0 : b.mat[(y | 0) * GW + (x | 0)]);

const plot = (b: Buf, x: number, y: number, col: number, mat?: number, onMat?: number) => {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= GW || y >= GH) return;
  const i = y * GW + x;
  if (onMat !== undefined && b.mat[i] !== onMat) return;
  b.px[i] = col; if (mat !== undefined) b.mat[i] = mat;
};
/** Mix a color into what's there (on one material). */
const shade = (b: Buf, x: number, y: number, col: number, k: number, onMat?: number) => {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= GW || y >= GH) return;
  const i = y * GW + x;
  if (onMat !== undefined && b.mat[i] !== onMat) return;
  b.px[i] = mixU(b.px[i], col, k);
};
const seg = (b: Buf, x0: number, y0: number, x1: number, y1: number, col: number, w = 1, mat?: number, onMat?: number) => {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  for (let k = 0; k <= n; k++) {
    const x = x0 + ((x1 - x0) * k) / n, y = y0 + ((y1 - y0) * k) / n;
    for (let a = 0; a < w; a++) for (let d = 0; d < w; d++) plot(b, x + a - (w - 1) / 2, y + d - (w - 1) / 2, col, mat, onMat);
  }
};
const path = (b: Buf, pts: number[], col: number, w = 1, mat?: number, onMat?: number) => { for (let i = 2; i < pts.length; i += 2) seg(b, pts[i - 2], pts[i - 1], pts[i], pts[i + 1], col, w, mat, onMat); };

interface BallO {
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
}
/** One pixel of a round form: its shading off the light up-left, stepped, dithered (or the ink at its rim). */
const shadePx = (b: Buf, x: number, y: number, dx: number, dy: number, d2: number, rim: boolean, ramp: number[], o: BallO) => {
  const n = ramp.length - 1, i = y * GW + x;
  if (rim) { b.px[i] = ramp[n]; if (o.mat !== undefined) b.mat[i] = o.mat; b.tone[i] = 255; return; }
  const nz = Math.sqrt(Math.max(0, 1 - d2)) * (o.flat ?? 1), ln = Math.hypot(dx, dy, nz) || 1;
  const lv = Math.max(0, Math.min(1, ((-0.42 * dx - 0.5 * dy + 0.76 * nz) / ln) * (o.lit ?? 1)));
  const s = (1 - lv) * n * 1.05 - 0.55 + (bay(x, y) - 0.5) * 0.9;
  const k = Math.max(0, Math.min(n - 1, Math.round(s)));
  b.px[i] = ramp[k]; b.tone[i] = Math.round((k / Math.max(1, n - 1)) * 254);
  if (o.mat !== undefined) b.mat[i] = o.mat;
};
/** A round form in its ramp. */
const ball = (b: Buf, cx: number, cy: number, rx: number, ry: number, ramp: number[], o: BallO = {}) => {
  const lw = o.lw ?? 1.2, mn = Math.min(rx, ry);
  const y0 = Math.max(0, Math.floor(cy - ry)), y1 = Math.min(GH - 1, Math.ceil(cy + ry));
  const x0 = Math.max(0, Math.floor(cx - rx)), x1 = Math.min(GW - 1, Math.ceil(cx + rx));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, d2 = dx * dx + dy * dy;
    if (d2 > 1) continue;
    if (o.only && !o.only(x, y)) continue;
    const d = Math.sqrt(d2);
    if (o.soft && d > 1 - o.soft && bay(x, y) > (1 - d) / o.soft) continue;
    shadePx(b, x, y, dx, dy, d2, !!o.line && (1 - d) * mn < lw && (o.line === true || o.line(dx, dy)), ramp, o);
  }
};
/** A limb: a rounded tube from (x0, y0) r0 to (x1, y1) r1, shaded like a cylinder. */
const limb = (b: Buf, x0: number, y0: number, r0: number, x1: number, y1: number, r1: number, ramp: number[], o: BallO = {}) => {
  const lw = o.lw ?? 1.2, vx = x1 - x0, vy = y1 - y0, L2 = vx * vx + vy * vy || 1, rm = Math.max(r0, r1);
  const bx0 = Math.max(0, Math.floor(Math.min(x0, x1) - rm)), bx1 = Math.min(GW - 1, Math.ceil(Math.max(x0, x1) + rm));
  const by0 = Math.max(0, Math.floor(Math.min(y0, y1) - rm)), by1 = Math.min(GH - 1, Math.ceil(Math.max(y0, y1) + rm));
  for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) {
    const px = x + 0.5, py = y + 0.5;
    const t = Math.max(0, Math.min(1, ((px - x0) * vx + (py - y0) * vy) / L2));
    const r = r0 + (r1 - r0) * t, ex = (px - (x0 + vx * t)) / r, ey = (py - (y0 + vy * t)) / r, d2 = ex * ex + ey * ey;
    if (d2 > 1) continue;
    if (o.only && !o.only(x, y)) continue;
    const d = Math.sqrt(d2);
    shadePx(b, x, y, ex, ey, d2, !!o.line && (1 - d) * r < lw && (o.line === true || o.line(ex, ey)), ramp, o);
  }
};
/** Wash a color over what's there (in an ellipse, on one material), dithered off at the rim. */
const tint = (b: Buf, cx: number, cy: number, rx: number, ry: number, col: number, k: number, onMat?: number, soft = 0.5) => {
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
/** A flat polygon in its ramp, banded top to bottom, inked round its edge. */
const poly = (b: Buf, pts: number[], ramp: number[], mat?: number) => {
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (let i = 0; i < pts.length; i += 2) { x0 = Math.min(x0, pts[i]); x1 = Math.max(x1, pts[i]); y0 = Math.min(y0, pts[i + 1]); y1 = Math.max(y1, pts[i + 1]); }
  const n = ramp.length - 1;
  for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(GH - 1, y1); y++) for (let x = Math.max(0, Math.floor(x0)); x <= Math.min(GW - 1, x1); x++) {
    const px = x + 0.5, py = y + 0.5;
    if (!inPoly(pts, px, py)) continue;
    const edge = !inPoly(pts, px - 1, py) || !inPoly(pts, px + 1, py) || !inPoly(pts, px, py - 1) || !inPoly(pts, px, py + 1);
    const t = (py - y0) / Math.max(1, y1 - y0) + (px - x0) / Math.max(1, x1 - x0) * 0.4;
    const k = edge ? n : Math.max(0, Math.min(n - 1, Math.round(t * (n - 1) + (bay(x, y) - 0.5) * 0.9)));
    plot(b, x, y, ramp[k], mat);
  }
};
/** A wandering line (a crack, a vein, a run of mascara): `fn` paints each step (false stops it). */
const walk = (x: number, y: number, ang: number, steps: number, wob: number, fn: (x: number, y: number, i: number) => boolean | void) => {
  for (let i = 0; i < steps; i++) {
    x += Math.cos(ang); y += Math.sin(ang); ang += (rnd() - 0.5) * wob;
    if (fn(Math.round(x), Math.round(y), i) === false) return;
  }
};
/** A drop of sweat: clear, catching the light (low right), a glint up left. */
const bead = (b: Buf, x: number, y: number, r: number, skin: number[]) => {
  ball(b, x, y, r, r * 1.25, [skin[2], skin[1], skin[0], WHITE, skin[5]], { line: (_dx, dy) => dy > 0.2, lw: 0.7 });
  plot(b, x - r * 0.4, y - r * 0.5, WHITE);
};
const vein = (b: Buf, pts: number[], w = 2) => { path(b, pts, VEIN[5], w + 1); path(b, pts, VEIN[3], w); path(b, pts.map((v, i) => (i % 2 ? v : v - 1)), VEIN[1], 1); };
const sparkle = (b: Buf, x: number, y: number, col = WHITE) => { plot(b, x, y, col); b.glitter.push(Math.round(x), Math.round(y)); };

// ---------------------------------------------------------------------------------------------------------------
// Where her parts are (the buffer's pixels)

// (the neckline: a sweetheart, dipping between the cups)
const neck = (x: number) => 133 + 7 * Math.exp(-(((x - 120) / 6) ** 2));
// (the split up her thigh (her right: the screen's left), a ragged wedge)
const SLIT = [70, 228, 80, 184, 86, 182, 102, 228];
// (the split under her raised arm)
const RIP = [166, 152, 176, 148, 186, 156, 184, 174, 172, 170];
// (the raised arm: the shoulder, the elbow, the hand with the wand)
const SH = [172, 134], EL = [206, 112], HA = [199, 72];
// (where the cellulite goes)
const cellulite = (x: number, y: number) =>
  ((x - 86) / 18) ** 2 + ((y - 208) / 26) ** 2 < 1 || ((x - 95) / 16) ** 2 + ((y - 230) / 10) ** 2 < 1 || ((x - 145) / 16) ** 2 + ((y - 230) / 10) ** 2 < 1 ||
  ((x - 52) / 16) ** 2 + ((y - 156) / 24) ** 2 < 1 || ((x - 192) / 18) ** 2 + ((y - 130) / 12) ** 2 < 1;

// ---------------------------------------------------------------------------------------------------------------
// The base: everything but her eyes and her mouth

function* buildBase(rage: boolean): Generator<void, Buf> {
  seed = rage ? 911 : 377;
  const b = newBuf();
  const FC = rage ? RAGEF : FACE, SK = rage ? RAGES : SKIN;
  yield;
  // (her wings, peeking over her shoulders: tiny, veined, glittered, far too small to lift her)
  for (const [x, y, s] of [[76, 104, -1], [162, 98, 1]] as const) {
    ball(b, x, y, 8, 14, WING, { line: true, mat: M_OTHER });
    ball(b, x + s * 2, y + 14, 5, 7, WING, { line: true, mat: M_OTHER });
    path(b, [x, y + 14, x + s * 1, y, x - s * 2, y - 10], WING[4], 1, undefined, M_OTHER);
    path(b, [x + s * 1, y + 4, x + s * 5, y - 4], WING[4], 1, undefined, M_OTHER);
    path(b, [x, y + 14, x + s * 3, y + 19], WING[4], 1, undefined, M_OTHER);
    for (let k = 0; k < 4; k++) { const gx = x + (rnd() - 0.5) * 10, gy = y - 8 + rnd() * 26; if (matAt(b, gx, gy) === M_OTHER) sparkle(b, gx, gy); }
  }
  yield;
  // (the beehive: towering, platinum, three tiers of it, leaning a little; in the rage coming down)
  const lean = rage ? 5 : 0;
  ball(b, 118 + lean, 14, 20, 13, HAIR, { mat: M_HAIR, line: true });
  ball(b, 118 + lean * 0.5, 36, 28, 22, HAIR, { mat: M_HAIR, line: true });
  ball(b, 120, 58, 34, 14, HAIR, { mat: M_HAIR, line: (_dx, dy) => dy < 0.2 });
  for (const [cx, cy, rx, ry] of [[118 + lean, 14, 20, 13], [118 + lean * 0.5, 36, 28, 22]]) {
    // (the swirls of lacquer round each tier)
    for (let a = 0.4; a < 2.8; a += 0.6) path(b, [cx - rx * 0.9, cy + ry * Math.cos(a) * 0.5, cx - rx * 0.3, cy + ry * Math.cos(a) * 0.5 + 3, cx + rx * 0.5, cy + ry * Math.cos(a) * 0.5 + 1, cx + rx * 0.9, cy + ry * Math.cos(a) * 0.5 - 2], HAIR[4], 1, undefined, M_HAIR);
  }
  // (fly-aways; in the rage whole hanks of it down)
  for (let k = 0; k < (rage ? 30 : 16); k++) { const x0 = 92 + rnd() * 56, y0 = 4 + rnd() * 60; path(b, [x0, y0, x0 + (rnd() - 0.5) * 8, y0 - 3 - rnd() * 4, x0 + (rnd() - 0.5) * 12, y0 - 7 - rnd() * 6], k % 3 ? HAIR[4] : HAIR[0]); }
  if (rage) for (const s of [-1, 1]) path(b, [120 + s * 22, 30, 120 + s * 30, 46, 120 + s * 28, 62, 120 + s * 33, 76], HAIR[3], 2);
  // (bobby pins)
  for (const [x, y, dx, dy] of [[100, 26, 6, -3], [136, 20, 5, 3], [108, 6, 4, -3], [146, 44, -5, 3]]) { seg(b, x, y, x + dx, y + dy, hexU('#1A1A22'), 1, undefined, M_HAIR); seg(b, x, y + 1, x + dx, y + dy + 1, hexU('#3A3A48'), 1, undefined, M_HAIR); }
  yield;
  // (the legs, under the hem: fat calves, the cankles spilling over the shoes)
  for (const [x, s] of [[95, -1], [145, 1]] as const) {
    limb(b, x, 220, 16, x + s * -1, 236, 10, SK, { mat: M_SKIN, line: true });
    ball(b, x, 239, 13, 5, SK, { mat: M_SKIN, line: (_dx, dy) => dy > -0.2 });
  }
  yield;
  // (the little glass heels: slippers too small, the feet bulging out of them, the toes out the front; her left
  // heel (the screen's right) buckling)
  for (const [x, s] of [[95, -1], [145, 1]] as const) {
    ball(b, x, 244, 11, 4, SK, { mat: M_SKIN, line: (_dx, dy) => dy > 0.3 });
    // (the toes, sausages, the nails thick and yellow, the polish chipped off)
    for (let k = 0; k < 5; k++) {
      const tx = x - 8 + k * 4, ty = 246 + Math.abs(k - 2) * 0.3;
      ball(b, tx, ty, 2.3, 2.6, SK, { mat: M_SKIN, line: true, lw: 0.8 });
      plot(b, tx, ty - 1, NAIL[k % 2 ? 1 : 2], M_OTHER); if (k === (s < 0 ? 4 : 0)) { plot(b, tx, ty - 1, NAIL[3], M_OTHER); plot(b, tx + 1, ty - 1, ACRYL[2], M_OTHER); }
    }
    // (the bunion, on her right foot's big toe: red, swollen, out over the glass)
    if (s < 0) { ball(b, x + 11, 243, 3.5, 3, SK, { mat: M_SKIN, line: true, lw: 0.8 }); tint(b, x + 11, 243, 3.5, 3, hexU('#D8404A'), 0.5, M_SKIN, 0.6); plot(b, x + 10, 242, WHITE); }
    // (the glass: a band over the instep, the sole, the heel)
    for (let xx = x - 11; xx <= x + 11; xx++) {
      const yt = 241 - (1 - ((xx - x) / 11) ** 2) * 2;
      for (let yy = Math.round(yt); yy <= yt + 2; yy++) shade(b, xx, yy, GLASS[yy === Math.round(yt) ? 0 : 2], 0.55);
      plot(b, xx, 249, GLASS[xx % 3 ? 3 : 1], M_OTHER);
      plot(b, xx, 248, mixU(b.px[248 * GW + xx], GLASS[2], 0.5));
    }
    const hx = x - s * 8;
    if (s < 0) seg(b, hx, 244, hx, 249, GLASS[4], 1, M_OTHER);
    else { seg(b, hx, 244, hx + 3, 247, GLASS[4], 1, M_OTHER); seg(b, hx + 3, 247, hx + 5, 249, GLASS[4], 1, M_OTHER); plot(b, hx + 3, 247, WHITE); }
    sparkle(b, x - 6, 241);
  }
  yield;
  // (the skirt: down past her knees, flaring at the hips, straining)
  poly(b, [44, 196, 196, 196, 184, 226, 158, 228, 120, 224, 82, 228, 56, 226], GOWN, M_GOWN);
  ball(b, 120, 198, 84, 26, GOWN, { mat: M_GOWN, line: (_dx, dy) => dy > 0.1, lw: 1.4 });
  // (the split up her thigh: the thigh bulging out of it, the inner thigh chafed raw, threads hanging across)
  const inSlit = (x: number, y: number) => inPoly(SLIT, x + 0.5, y + 0.5);
  ball(b, 86, 208, 19, 28, SK, { mat: M_SKIN, only: inSlit, lit: 1.05 });
  for (let i = 0; i < SLIT.length - 2; i += 2) if (i !== 2) for (let k = 0; k <= 1; k += 0.03) {
    const x = SLIT[i] + (SLIT[i + 2] - SLIT[i]) * k, y = SLIT[i + 1] + (SLIT[i + 3] - SLIT[i + 1]) * k;
    plot(b, x + (hash2(Math.round(y), 5) > 0.5 ? 1 : 0), y, GOWN[6], M_GOWN);
  }
  tint(b, 100, 218, 6, 12, hexU('#D8303A'), 0.45, M_SKIN, 0.6);
  for (let k = 0; k < 8; k++) { const y = 204 + rnd() * 22, x = 95 + (y - 200) * 0.2 + rnd() * 3; shade(b, x, y, hexU('#F0E0D0'), 0.6, M_SKIN); }
  for (const [y0, y1] of [[196, 200], [206, 211], [216, 214]]) seg(b, 78 + (y0 - 190) * -0.1, y0, 98, y1, GOWN[1]);
  path(b, [100, 226, 98, 232, 101, 236], GOWN[5]); path(b, [72, 226, 70, 232], GOWN[5]);
  yield;
  // (the torso, the satin pulled tight round it)
  ball(b, 120, 152, 68, 24, GOWN, { mat: M_GOWN, line: true, lw: 1.4 });
  // (the belly: two rolls under the satin, the lower over her hips, the upper over that, each creased under)
  ball(b, 120, 184, 80, 20, GOWN, { mat: M_GOWN, line: (_dx, dy) => dy > 0.25, lw: 1.5 });
  ball(b, 120, 166, 72, 20, GOWN, { mat: M_GOWN, line: (_dx, dy) => dy > 0.25, lw: 1.5 });
  // (the navel through the satin, the fabric pulled into it)
  ball(b, 122, 178, 3, 2, GOWN, { mat: M_GOWN, line: (_dx, dy) => dy < 0, lw: 0.8, lit: 0.6 });
  for (const s of [-1, 1]) path(b, [122 + s * 3, 178, 122 + s * 10, 176, 122 + s * 18, 177], GOWN[4], 1, undefined, M_GOWN);
  // (the back fat: squeezed out over the gown at her sides, roll on roll)
  for (const [x, y, r] of [[78, 157, 8], [74, 168, 9], [192, 176, 10], [189, 187, 9]] as const) ball(b, x, y, r, r * 0.55, SK, { mat: M_SKIN, line: (_dx, dy) => dy > -0.3 });
  yield;
  // (her shoulders, the chest, the top of her bust spilling over the neckline)
  ball(b, 74, 132, 22, 14, SK, { mat: M_SKIN, line: (dx, dy) => dx < -0.3 || dy < -0.6 });
  ball(b, 166, 132, 22, 14, SK, { mat: M_SKIN, line: (dx, dy) => dy < -0.6 });
  ball(b, 120, 132, 50, 14, SK, { mat: M_SKIN });
  for (const s of [-1, 1]) ball(b, 120 + s * 19, 144, 23, 18, SK, { mat: M_SKIN, line: (dx) => dx * s > 0.3, lit: 1.05 });
  path(b, [120, 128, 119, 134, 120, 140], SK[6]);
  // (the gown over the bust, the neckline biting in, the flesh muffin-topping over it)
  for (const s of [-1, 1]) ball(b, 120 + s * 19, 147, 24, 19, GOWN, { mat: M_GOWN, line: (dx, dy) => dx * s > 0.4 || dy > 0.5, only: (x, y) => y >= neck(x) });
  for (let x = 96; x <= 144; x++) { plot(b, x, neck(x), GOWN[6], M_GOWN); shade(b, x, neck(x) - 1, SK[6], 0.6, M_SKIN); if (x % 2) plot(b, x, neck(x) + 1, GOWN[1], M_GOWN); }
  // (the straps, biting into her shoulders, the flesh bulging either side)
  for (const s of [-1, 1]) { const x0 = 120 + s * 24, x1 = 120 + s * 36; seg(b, x0, 130, x1, 120, GOWN[4], 2, M_GOWN); seg(b, x0 - s * 2, 131, x1 - s * 2, 121, SK[6], 1, undefined, M_SKIN); seg(b, x0 + s * 2, 130, x1 + s * 2, 120, SK[6], 1, undefined, M_SKIN); }
  yield;
  // (the split under the raised arm: the side of her bulging out through it, threads)
  ball(b, 178, 161, 10, 14, SK, { mat: M_SKIN, only: (x, y) => inPoly(RIP, x + 0.5, y + 0.5) });
  for (let i = 0; i < RIP.length; i += 2) { const j = (i + 2) % RIP.length; seg(b, RIP[i], RIP[i + 1], RIP[j], RIP[j + 1], GOWN[6]); }
  for (const y of [155, 161, 167]) seg(b, 168, y, 184, y + 2, GOWN[1]);
  path(b, [184, 174, 185, 180, 183, 184], GOWN[5]);
  yield;
  // (the gown's sheen, the sequins (glinting), the sweat stains: under the arms, under the bust, in the rolls)
  for (let y = 120; y < 232; y++) for (let x = 36; x < 206; x++) {
    const i = y * GW + x;
    if (b.mat[i] !== M_GOWN) continue;
    const h = hash2(x * 7 + 3, y * 13 + 1);
    if (b.tone[i] < 80 && (x + y * 2) % 9 === 0 && h > 0.4) b.px[i] = GOWN[0];
    else if (h > 0.985) { b.px[i] = WHITE; if (h > 0.996) b.glitter.push(x, y); }
    else if (h < 0.05) b.px[i] = GOWN[b.tone[i] > 128 ? 2 : 1];
  }
  const STAIN = hexU('#7A1048');
  for (const [x, y, rx, ry] of [[78, 146, 7, 9], [176, 152, 9, 8], [102, 162, 18, 4], [138, 162, 18, 4], [120, 184, 40, 3], [120, 202, 50, 3]] as const) {
    tint(b, x, y, rx, ry, STAIN, 0.35, M_GOWN, 0.8);
    tint(b, x, y, rx * 0.7, ry * 0.7, STAIN, 0.25, M_GOWN, 0.6);
  }
  yield;
  // (her right arm (the screen's left): flab hanging off the upper arm, the hand on her hip, rings sunk in the fingers,
  // long pink acrylics)
  limb(b, 66, 132, 15, 50, 172, 14, SK, { mat: M_SKIN, line: true });
  ball(b, 52, 158, 13, 18, SK, { mat: M_SKIN, line: (dx, dy) => dx < -0.2 || dy > 0.6, lit: 0.95 });
  limb(b, 50, 174, 12, 58, 198, 8, SK, { mat: M_SKIN, line: true });
  path(b, [42, 174, 50, 177, 58, 174], SK[6]); path(b, [44, 178, 50, 180, 56, 178], SK[5]);
  ball(b, 62, 200, 8, 6, SK, { mat: M_SKIN, line: true });
  for (let k = 0; k < 4; k++) {
    const fy = 197 + k * 2.6;
    limb(b, 64, fy, 2, 74, fy + 1.5, 1.8, SK, { mat: M_SKIN, line: true, lw: 0.8 });
    plot(b, 75, fy + 1.5, ACRYL[1], M_OTHER); plot(b, 76, fy + 1.8, ACRYL[2], M_OTHER); plot(b, 77, fy + 2.2, ACRYL[3], M_OTHER);
    if (k === 1) { seg(b, 68, fy - 1.5, 68, fy + 2, GOLD[2], 1, M_OTHER); sparkle(b, 68, fy - 1); }
  }
  yield;
  // (her left arm, raised, the wand up beside her head: the bingo wing sagging off it, the armpit stubbled and
  // sweating, a vein standing out on it in the rage)
  limb(b, SH[0], SH[1], 16, EL[0], EL[1], 12, SK, { mat: M_SKIN, line: true });
  ball(b, 192, 130, 16, 11, SK, { mat: M_SKIN, line: (_dx, dy) => dy > -0.1, lit: 0.9 });
  path(b, [180, 136, 192, 140, 204, 134], SK[5]);
  limb(b, EL[0], EL[1], 11, HA[0], HA[1] + 6, 8, SK, { mat: M_SKIN, line: true });
  path(b, [196, 84, 200, 86, 206, 84], SK[6]);
  for (let k = 0; k < 40; k++) { const x = 172 + rnd() * 14, y = 128 + rnd() * 12; if (matAt(b, x, y) === M_SKIN) shade(b, x, y, DARK, 0.5); }
  // (the wand: a gold stick, the star on the end of it, and the hand round it, rings and nails)
  seg(b, 198, 92, 196, 48, GOLD[4], 2, M_OTHER); seg(b, 197, 92, 195, 48, GOLD[1], 1, M_OTHER);
  const star: number[] = [];
  for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 4.5 : 11; star.push(196 + Math.cos(a) * r, 40 + Math.sin(a) * r); }
  poly(b, star, GOLD, M_OTHER);
  sparkle(b, 193, 36); sparkle(b, 196, 30); sparkle(b, 205, 37);
  ball(b, HA[0], HA[1], 8, 7, SK, { mat: M_SKIN, line: true });
  for (let k = 0; k < 4; k++) { const fx = HA[0] - 5 + k * 3; ball(b, fx, HA[1] - 3, 1.8, 3, SK, { mat: M_SKIN, line: true, lw: 0.8 }); plot(b, fx, HA[1] - 6, ACRYL[1], M_OTHER); plot(b, fx, HA[1] - 7, ACRYL[2], M_OTHER); }
  seg(b, HA[0] - 2, HA[1] - 5, HA[0] - 2, HA[1] - 1, GOLD[2], 1, M_OTHER); sparkle(b, HA[0] - 2, HA[1] - 4);
  if (rage) { vein(b, [178, 128, 188, 122, 196, 118, 203, 112], 1); vein(b, [204, 108, 202, 96, 200, 86], 1); }
  yield;
  // (the chins: three, sagging, the lowest first; each creased under; the foundation stopping dead at the jaw)
  ball(b, FX, 123, 36, 8, SK, { mat: M_SKIN, line: (_dx, dy) => dy > -0.1, lw: 1.3 });
  ball(b, FX, 117, 33, 8, SK, { mat: M_SKIN, line: (_dx, dy) => dy > -0.1, lw: 1.3 });
  ball(b, FX, 111, 30, 8, SK, { mat: M_SKIN, line: (_dx, dy) => dy > -0.1, lw: 1.3 });
  yield;
  // (the ears, the lobes stretched by the hoops)
  for (const s of [-1, 1]) {
    const ex = FX + s * 27;
    ball(b, ex, 84, 5, 8, SK, { mat: M_SKIN, line: true });
    ball(b, ex, 93, 2.5, 2.5, SK, { mat: M_SKIN, line: true });
    path(b, [ex + s * 1, 79, ex - s * 1, 84, ex, 88], SK[6]);
  }
  yield;
  // (her face: round, the jowls hanging)
  ball(b, FX, FY, 27, 24, FC, { mat: M_SKIN, line: (_dx, dy) => dy > -0.25, lw: 1.2 });
  ball(b, 106, 97, 15, 12, FC, { mat: M_SKIN, line: (dx, dy) => (dy > 0.35 && dx > -0.5) || dx < -0.8, lit: 1.08 });
  ball(b, 134, 97, 15, 12, FC, { mat: M_SKIN, line: (dx, dy) => (dy > 0.35 && dx < 0.5) || dx > 0.8, lit: 1.08 });
  // (the line where the foundation stops: orange above, pale below)
  for (let x = 94; x <= 146; x++) { const y = 107 + Math.round(2 * Math.cos((x - FX) / 14)); if (matAt(b, x, y + 1) === M_SKIN && bay(x, y) < 0.6) plot(b, x, y + 1, FC[4]); }
  yield;
  // (the blush, troweled on)
  for (const s of [-1, 1]) tint(b, FX + s * 15, 93, 9, 5, hexU(rage ? '#C81E24' : '#F46A86'), rage ? 0.3 : 0.45, M_SKIN);
  // (the eyeshadow: violet up to her brows, blue in the crease)
  for (const s of [-1, 1]) {
    const ex = FX + s * 11;
    ball(b, ex + s * 1, 74, 11, 5, SHADOW2, { soft: 0.45, flat: 0.6 });
    ball(b, ex, 78, 9, 5, SHADOW, { soft: 0.3, flat: 0.8 });
  }
  // (the brows: plucked to nothing and penciled back on, a few real hairs poking out; down in a V in the rage)
  for (const s of [-1, 1]) {
    const pts = rage ? [FX + s * 22, 66, FX + s * 15, 68, FX + s * 9, 71, FX + s * 4, 74] : [FX + s * 22, 72, FX + s * 18, 68, FX + s * 12, 67, FX + s * 6, 70];
    path(b, pts, hexU('#4A2E14'), rage ? 2 : 1);
    for (let k = 0; k < 3; k++) { const x = FX + s * (7 + rnd() * 13), y = rage ? 69 : 70; plot(b, x, y + 1, hexU('#6A4A2A')); }
  }
  yield;
  // (the nose: the bridge, the bulb; the nostrils, the hairs out of them)
  ball(b, FX, 86, 4, 8, FC, { mat: M_SKIN, lit: 1.1 });
  for (const s of [-1, 1]) ball(b, FX + s * 5, 93, 3.5, 3, FC, { mat: M_SKIN, line: (dx, dy) => dy > -0.2 && dx * s > -0.3, lw: 0.8 });
  ball(b, FX, 91, 6, 5, FC, { mat: M_SKIN, line: (_dx, dy) => dy > 0.4, lit: 1.12, lw: 0.8 });
  for (const s of [-1, 1]) {
    plot(b, FX + s * 2, 95, hexU('#2E0E0A'), M_OTHER); plot(b, FX + s * 3, 95, hexU('#1A0606'), M_OTHER);
    seg(b, FX + s * 2, 96, FX + s * 2, 97, HAIRLINE); plot(b, FX + s * 3, 97, HAIRLINE);
  }
  // (the hairs on her upper lip)
  for (let k = 0; k < 8; k++) { const x = FX - 6 + rnd() * 12, y = 97 + rnd() * 1.5; seg(b, x, y, x, y + 1, hexU('#4A2A1A'), 1, undefined, M_SKIN); }
  // (the beauty mark, with a hair out of it; the wart on her chin, with a long one)
  ball(b, 134, 98, 1.3, 1.2, R('#6A3A22', '#4A2414', '#2E140A', '#1A0804', '#0E0402'), { mat: M_OTHER });
  path(b, [135, 97, 136, 95, 138, 94], HAIRLINE);
  ball(b, 129, 109, 2.4, 2, WART, { line: true, mat: M_OTHER, lw: 0.7 });
  plot(b, 128, 109, WART[4]);
  path(b, [130, 108, 131, 105, 134, 103, 135, 100], HAIRLINE);
  // (stubble on the chins; a long hair off them)
  for (let k = 0; k < 40; k++) { const x = FX + (rnd() - 0.5) * 60, y = 108 + rnd() * 16; if (matAt(b, x, y) === M_SKIN) shade(b, x, y, DARK, 0.5); }
  path(b, [110, 120, 108, 123, 110, 126], HAIRLINE);
  yield;
  // (the hoops: big gold rings off the lobes, down on her shoulders)
  for (const s of [-1, 1]) {
    const hx = FX + s * 27, hy = 100;
    for (let a = 0; a < Math.PI * 2; a += 0.08) {
      const k = Math.cos(a + 2.3) > 0.4 ? 1 : Math.cos(a + 2.3) > -0.3 ? 2 : 4;
      plot(b, hx + Math.cos(a) * 6, hy + Math.sin(a) * 6, GOLD[k], M_OTHER);
    }
    sparkle(b, hx - 4, hy - 4);
  }
  yield;
  // (the hairline: the beehive pulled up off her forehead, black roots coming through the bleach)
  ball(b, FX, 58, 31, 9, HAIR, { mat: M_HAIR, lit: 1.05 });
  for (let x = FX - 31; x <= FX + 31; x++) {
    const yE = 58 + 9 * Math.sqrt(Math.max(0, 1 - ((x - FX) / 31) ** 2));
    for (let y = Math.floor(yE - 4); y <= yE + 1; y++) {
      if (y > yE - 0.5) { if (matAt(b, x, y) === M_SKIN && bay(x, y) < 0.35) plot(b, x, y, hexU('#4A3218')); continue; }
      if (matAt(b, x, y) === M_HAIR && bay(x, y) < (y - (yE - 4)) / 3 + 0.15) plot(b, x, y, hexU(y > yE - 2 ? '#3A2410' : '#7A5A2E'));
    }
  }
  for (let k = 0; k < 10; k++) { const x0 = FX - 26 + rnd() * 52; path(b, [x0, 64, x0 + (rnd() - 0.5) * 6, 56, x0 + (rnd() - 0.5) * 4, 50], HAIR[4], 1, undefined, M_HAIR); }
  // (the tiara, jammed in it: gold, a pink heart, a stone missing)
  poly(b, [102, 56, 104, 48, 110, 53, 116, 44, 120, 50, 124, 44, 130, 53, 136, 48, 138, 56, 138, 58, 102, 58], GOLD, M_OTHER);
  ball(b, FX, 53, 2.5, 2.2, R('#FFB4DA', '#FF5AA8', '#E02A84', '#A8105E', '#5A0430'), { line: true, mat: M_OTHER, lw: 0.6 }); sparkle(b, FX - 1, 52);
  plot(b, 110, 55, hexU('#5AC8F4'), M_OTHER); plot(b, 130, 55, hexU('#120A02'), M_OTHER);
  for (const [x, y] of [[104, 48], [116, 44], [124, 44], [136, 48]]) sparkle(b, x, y);
  yield;
  // (rage: the veins up her forehead, her temples, her neck)
  if (rage) {
    vein(b, [114, 60, 112, 64, 115, 68], 1); vein(b, [126, 60, 128, 64, 125, 67], 1);
    vein(b, [96, 70, 95, 76, 97, 82], 1); vein(b, [144, 70, 145, 76, 143, 82], 1);
    vein(b, [100, 112, 96, 118, 98, 126], 1); vein(b, [140, 112, 144, 118, 142, 126], 1);
  }
  yield;
  // (sweat: beads across her forehead and over her lip, in her cleavage, down her chest, on her belly's skin and arms)
  for (let k = 0; k < 7; k++) { const x = 102 + rnd() * 36, y = 62 + rnd() * 6; if (matAt(b, x, y) === M_SKIN) bead(b, x, y, 0.8 + rnd() * 0.6, FC); }
  bead(b, 116, 97.5, 0.7, FC); bead(b, 124, 97.5, 0.7, FC);
  path(b, [120, 132, 121, 136, 120, 139], mixU(SK[1], WHITE, 0.5), 1, undefined, M_SKIN); bead(b, 120, 139, 1.1, SK);
  for (let k = 0; k < 10; k++) { const x = 80 + rnd() * 80, y = 124 + rnd() * 12; if (matAt(b, x, y) === M_SKIN) bead(b, x, y, 0.7 + rnd() * 0.6, SK); }
  for (let k = 0; k < 8; k++) { const x = 40 + rnd() * 170, y = 140 + rnd() * 90; if (matAt(b, x, y) === M_SKIN) bead(b, x, y, 0.8 + rnd() * 0.5, SK); }
  for (const s of [-1, 1]) path(b, [FX + s * 24, 66, FX + s * 25, 72, FX + s * 24, 78], mixU(FC[1], WHITE, 0.5), 1, undefined, M_SKIN);
  yield;
  // (stretch marks: silvery-purple tears up her thigh, the bingo wings, the sides of her bust)
  const STRETCH = mixU(SK[3], hexU('#B088C0'), 0.55), STRETCH_L = mixU(SK[1], hexU('#E8D8F0'), 0.5);
  const marks = (x0: number, y0: number, n: number, dx: number, dy: number, len: number) => {
    for (let k = 0; k < n; k++) {
      const x = x0 + k * dx + (rnd() - 0.5) * 2, y = y0 + k * dy + (rnd() - 0.5) * 2, a = Math.atan2(dy, dx) + Math.PI / 2 + (rnd() - 0.5) * 0.4, l = len * (0.6 + rnd() * 0.6);
      seg(b, x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, STRETCH, 1, undefined, M_SKIN);
      seg(b, x + 1, y, x + 1 + Math.cos(a) * l * 0.7, y + Math.sin(a) * l * 0.7, STRETCH_L, 1, undefined, M_SKIN);
    }
  };
  marks(80, 196, 5, 2.5, 4, 6); marks(46, 160, 4, 1, 4, 5); marks(186, 128, 4, 3, 0.5, 4); marks(98, 133, 2, -3, 0, 3); marks(142, 133, 2, 3, 0, 3);
  yield;
  // (post: the pores, the blackheads, the grease shining, the glitter stuck in it; the cellulite, dimpled)
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const i = y * GW + x;
    if (b.mat[i] !== M_SKIN) continue;
    const h = hash2(x, y);
    const face = ((x - FX) / 30) ** 2 + ((y - 90) / 22) ** 2 < 1;
    const nose = ((x - FX) / 7) ** 2 + ((y - 90) / 7) ** 2 < 1, chin = y > 100 && y < 112 && Math.abs(x - FX) < 12;
    const dens = nose ? 0.18 : face ? 0.08 : 0.04;
    if (h < dens) b.px[i] = mixU(b.px[i], FC[7], h < dens * 0.3 ? 0.4 : 0.24);
    else if ((nose || chin) && h > 0.95) b.px[i] = DARK;
    else if (b.tone[i] < 50 && h > 0.6 && h < 0.72) b.px[i] = mixU(b.px[i], WHITE, 0.6);
    else if (h > 0.997 && b.tone[i] < 170) { b.px[i] = hexU(['#FFFFFF', '#FFE070', '#FFB0E0', '#B0F0FF'][Math.floor(hash2(y, x) * 4)]); b.glitter.push(x, y); }
    if (cellulite(x, y)) {
      // (dimples in staggered rows, each its own size: a dark pit, lit on its far rim)
      const cy = Math.floor(y / 3), ox = Math.floor(hash2(cy, 77) * 4), cx = Math.floor((x + ox) / 4), lx = x + ox - cx * 4, ly = y - cy * 3;
      const hc = hash2(cx + 500, cy + 900);
      if (hc < 0.4) { const r = hc < 0.15 ? 2 : 1; if (lx >= 1 && lx <= r && ly >= 1 && ly <= r) b.px[i] = mixU(b.px[i], SK[6], 0.38); else if (lx === r + 1 && ly === r) b.px[i] = mixU(b.px[i], WHITE, 0.25); }
    }
  }
  yield;
  // (the foundation, caked on, cracking: across her forehead, her cheeks, her chin)
  for (let k = 0; k < 12; k++) {
    const sx = 96 + rnd() * 48, sy = k < 4 ? 62 + rnd() * 6 : 90 + rnd() * 16;
    if (matAt(b, sx, sy) !== M_SKIN) continue;
    const len = 3 + rnd() * 6, ang = rnd() * Math.PI * 2;
    walk(sx, sy, ang, len, 1.1, (x, y) => {
      if (matAt(b, x, y) !== M_SKIN) return false;
      b.px[y * GW + x] = mixU(b.px[y * GW + x], FC[7], 0.55);
      if (matAt(b, x, y - 1) === M_SKIN) b.px[(y - 1) * GW + x] = mixU(b.px[(y - 1) * GW + x], WHITE, 0.35);
    });
  }
  return b;
}

// ---------------------------------------------------------------------------------------------------------------
// The eyes and the mouth (a stamp each per face, mouth shape, twitch)

const eye = (b: Buf, ex: number, ey: number, outer: -1 | 1, rage: boolean, twitch: boolean, FC: number[]) => {
  const rx = rage ? 8.5 : 7.5, ry = rage ? 6.5 : 4.5;
  ball(b, ex, ey, rx, ry, rage ? SCLERA_R : SCLERA, { mat: M_SCLERA, line: true, lw: 0.8, flat: 0.7 });
  // (bloodshot: red threads in off the rim)
  for (let k = 0; k < (rage ? 9 : 4); k++) {
    const a = rnd() * Math.PI * 2, col = hexU(k % 3 ? '#D8303C' : '#9A1622');
    walk(ex + Math.cos(a) * rx * 0.9, ey + Math.sin(a) * ry * 0.9, a + Math.PI, 2 + rnd() * 3, 1.3, (x, y) => { if (matAt(b, x, y) !== M_SCLERA) return false; plot(b, x, y, col); });
  }
  // (the iris (a touch cross-eyed), the pupil (a pinprick when she's furious), the glint)
  const ix = ex - outer * 1, iy = ey + (rage ? 0 : 1), ir = rage ? 2.6 : 3.2;
  ball(b, ix, iy, ir, ir, IRIS, { mat: M_IRIS, line: true, lw: 0.7, only: (x, y) => matAt(b, x, y) === M_SCLERA || matAt(b, x, y) === M_IRIS });
  if (rage) plot(b, ix, iy, PUPIL[2], M_IRIS); else ball(b, ix, iy, 1.5, 1.5, PUPIL, { mat: M_IRIS });
  plot(b, ix - 1, iy - 1, WHITE);
  // (the lid: heavy and half down for the sultry look, pulled back off the eye in the rage; the twitch drops it more)
  const lidAt = (x: number) => ey + (rage ? -ry + 1 : -0.5) + (twitch ? 2.5 : 0) + ((x - ex) / rx) ** 2 * 1.5;
  const lowAt = (x: number) => ey + ry - (twitch ? 2 : 0.5) - ((x - ex) / rx) ** 2 * 1.2;
  for (let y = Math.floor(ey - ry - 1); y <= ey + ry + 1; y++) for (let x = Math.floor(ex - rx - 1); x <= ex + rx + 1; x++) {
    const m = matAt(b, x, y);
    if (m !== M_SCLERA && m !== M_IRIS) continue;
    const dl = lidAt(x) - y;
    if (dl > 0) plot(b, x, y, SHADOW[dl < 1.5 ? 4 : dl < 3 ? 2 : 1], M_OTHER);
    else if (y > lowAt(x)) plot(b, x, y, FC[5], M_OTHER);
  }
  // (the liner, flicked out past the outer corner)
  for (let x = ex - rx; x <= ex + rx; x++) plot(b, x, lidAt(x), MASCARA);
  const cx = ex + outer * rx;
  path(b, [cx, lidAt(cx), cx + outer * 3, lidAt(cx) - 2], MASCARA);
  // (the false lashes, curled, clumped)
  for (let k = 0; k < 6; k++) {
    const x = ex - rx + 1.5 + (k * (2 * rx - 3)) / 5, y = lidAt(x);
    const dx = ((x - ex) / rx) * 0.7 + outer * 0.2, len = 3 + rnd() * 2;
    path(b, [x, y, x + dx * len * 0.3, y - len * 0.6, x + dx * len, y - len], MASCARA);
  }
  plot(b, ex + outer * 3, lidAt(ex) - 3, MASCARA);
  // (the lower lashes, the bags under)
  for (let k = 0; k < 4; k++) { const x = ex - rx + 2 + (k * (2 * rx - 4)) / 3; plot(b, x, lowAt(x) + 1, MASCARA); }
  tint(b, ex, ey + ry + 1.5, rx, 1.8, SMUDGE, 0.45, undefined, 0.7);
  path(b, [ex - rx + 2, ey + ry + 3, ex, ey + ry + 4, ex + rx - 2, ey + ry + 3], FC[6], 1, undefined, M_SKIN);
  // (the mascara running down her cheek: one eye when she's purring, both in the rage)
  if (rage || outer === -1) {
    let x = ex + outer * 3;
    const n = rage ? 20 : 15;
    for (let y = Math.round(ey + ry + 1); y < ey + ry + n; y++) { x += (rnd() - 0.5) * 0.8; plot(b, x, y, mixU(MASCARA, SMUDGE, 0.3)); }
    ball(b, x, ey + ry + n, 1, 1.3, R('#4A3A5A', '#2A2036', '#1A1222', '#000000'));
  }
};

/** Her teeth along the inside of the mouth: yellowed, a gap or two, gold, her lipstick on the front ones. */
const teeth = (b: Buf, x0: number, x1: number, edge: (x: number) => number, dir: 1 | -1, h: number, gaps: number[], gold: number[], lippy: number[]) => {
  for (let i = 0, x = x0; x < x1; i++, x += 3) {
    if (gaps.includes(i)) continue;
    for (let tx = 0; tx < 2; tx++) for (let ty = 0; ty < h; ty++) {
      const y = Math.round(edge(x + tx) + dir * ty);
      if (matAt(b, x + tx, y) !== M_MOUTH) continue;
      const ramp = gold.includes(i) ? GOLD : TOOTH;
      let k = tx === 0 ? 0 : ty >= h - 1 ? 2 : 1;
      if (bay(x + tx, y) > 0.8) k++;
      plot(b, x + tx, y, lippy.includes(i) && ty === 0 ? LIP[2] : ramp[k], M_OTHER);
    }
  }
};

const mouth = (b: Buf, rage: boolean, n: number) => {
  if (rage) {
    // (the scream: lips stretched thin round it, the uvula, the tongue, both rows of teeth, spit strung between them)
    const cx = FX, cy = 103, mw = 11, mh = 5 + n;
    ball(b, cx, cy, mw + 2.5, mh + 2.5, LIP, { mat: M_LIP, line: true, lw: 0.9 });
    ball(b, cx, cy, mw, mh, MOUTH, { mat: M_MOUTH, flat: 0.25, lit: 0.55 });
    ball(b, cx, cy - mh + 3, 1, 1.8, TONGUE, { mat: M_MOUTH });
    ball(b, cx, cy + mh - 1, 7, 3, TONGUE, { mat: M_MOUTH, line: (_dx, dy) => dy < 0, lw: 0.7, only: (x, y) => matAt(b, x, y) === M_MOUTH });
    const top = (x: number) => cy - mh * Math.sqrt(Math.max(0, 1 - ((x - cx) / mw) ** 2)) + 1;
    const bot = (x: number) => cy + mh * Math.sqrt(Math.max(0, 1 - ((x - cx) / mw) ** 2)) - 1;
    teeth(b, cx - 9, cx + 9, top, 1, 2 + (n > 1 ? 1 : 0), [2], [1, 5], [3, 4]);
    teeth(b, cx - 7, cx + 7, bot, -1, 2, [3], [4], []);
    for (const sx of [cx - 5, cx + 4]) for (let y = Math.round(top(sx) + 3); y < bot(sx) - 1; y++) if (bay(sx, y) < 0.7) plot(b, sx, y, hexU('#F0E8F8'));
  } else {
    // (the pout: big glossy red lips, the lipstick smeared past them; parted, her teeth)
    const cx = FX, cy = 101;
    if (n > 0) {
      ball(b, cx, cy + 0.5 + n * 0.3, 8, 0.8 + n * 1.2, MOUTH, { mat: M_MOUTH, flat: 0.3, lit: 0.6 });
      if (n >= 2) ball(b, cx + 0.5, cy + 1 + n * 1.1, 5, 1.5, TONGUE, { mat: M_MOUTH, only: (x, y) => matAt(b, x, y) === M_MOUTH });
      teeth(b, cx - 7, cx + 7, (x) => cy + 0.5 + n * 0.3 - (0.8 + n * 1.2) * Math.sqrt(Math.max(0, 1 - ((x - cx) / 8) ** 2)) + 1, 1, 1 + Math.ceil(n * 0.6), [3], [1], [2]);
    }
    for (const s of [-1, 1]) ball(b, cx + s * 4, cy - 2 - n * 0.3, 6, 2.8, LIP, { mat: M_LIP, line: (_dx, dy) => dy < 0.1, lit: 1.05, lw: 0.8 });
    ball(b, cx, cy + 2.5 + n * 0.8, 10, 3.6, LIP, { mat: M_LIP, line: (_dx, dy) => dy > -0.1, lit: 1.2, lw: 0.8 });
    if (!n) path(b, [cx - 10, cy, cx - 4, cy + 1, cx, cy, cx + 4, cy + 1, cx + 10, cy], LIP[5]);
    seg(b, cx - 3, cy + 1.5 + n * 0.8, cx - 1, cy + 1.5 + n * 0.8, WHITE, 1, undefined, M_LIP); plot(b, cx - 6, cy - 3 - n * 0.3, WHITE, undefined, M_LIP);
    // (smeared: off the right corner, over her cupid's bow)
    tint(b, cx + 11, cy + 1, 3.5, 2, LIP[2], 0.8, M_SKIN, 0.7);
    tint(b, cx - 1, cy - 4.5, 5, 1.3, LIP[2], 0.7, M_SKIN, 0.8);
  }
  // (the cold sore at the corner of her mouth: blisters, weeping, a crust)
  const sx = rage ? FX - 15 : FX - 11, sy = rage ? 101 : 100;
  tint(b, sx, sy, 2.5, 2.2, hexU('#C8303A'), 0.55, undefined, 0.5);
  for (const [dx, dy, r] of [[0, 0, 1.1], [1.5, -1, 0.8], [-1, 1.5, 0.8]]) ball(b, sx + dx, sy + dy, r, r, SORE, { line: true, lw: 0.5 });
  plot(b, sx + 1, sy + 2, hexU('#A8641E'));
};

// ---------------------------------------------------------------------------------------------------------------
// The caches

const bases = new Map<boolean, Buf>();
/** The bases being painted ahead a step at a time (warmGrossUps), each with its own dice. */
const baseJobs = new Map<boolean, ReturnType<typeof stepper<Buf>>>();
const baseJob = (rage: boolean) => {
  let j = baseJobs.get(rage);
  if (!j) { j = stepper(() => buildBase(rage), { get: () => seed, set: s => { seed = s; } }); baseJobs.set(rage, j); }
  return j;
};
// (ahead: each base a step at a time, then every stamp off it (a mouth shape each: cheap) one at a time)
paintAhead(until => {
  for (const v of [false, true]) {
    if (!bases.has(v)) { const j = baseJob(v); if (!j.run(until)) return false; bases.set(v, j.finish()); }
    for (let n = 0; n < 4; n++) for (const tw of [false, true]) {
      if (stamps.has(`${v ? 1 : 0}${n}${tw ? 1 : 0}`)) continue;
      stamp(v, n, tw);
      if (performance.now() >= until) return false;
    }
  }
  return true;
});
const stamps = new Map<string, HTMLCanvasElement>();
const stamp = (rage: boolean, n: number, twitch: boolean): HTMLCanvasElement | null => {
  const key = `${rage ? 1 : 0}${n}${twitch ? 1 : 0}`;
  const hit = stamps.get(key);
  if (hit) return hit;
  if (typeof document === 'undefined') return null;
  let base = bases.get(rage);
  if (!base) { base = baseJob(rage).finish(); bases.set(rage, base); }
  const b: Buf = { px: base.px.slice(), mat: base.mat.slice(), tone: base.tone, glitter: base.glitter };
  const FC = rage ? RAGEF : FACE;
  seed = rage ? 41 : 43; // (the same every stamp: the veins in her eyes don't jump about as her mouth goes)
  eye(b, FX - 11, 80, -1, rage, false, FC);
  eye(b, FX + 11, 80, 1, rage, twitch, FC);
  mouth(b, rage, n);
  const cv = document.createElement('canvas'); cv.width = GW; cv.height = GH;
  const g = cv.getContext('2d')!;
  const img = g.createImageData(GW, GH);
  new Uint32Array(img.data.buffer).set(b.px);
  g.putImageData(img, 0, 0);
  stamps.set(key, cv);
  return cv;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawn

/** Her gross-up, all of her: (cx, cy) the middle of the frame on screen (her belly's top: she's head to heels about
 *  GH x GP tall around it), `zoom` 1 at the hold (each of its pixels GP screen pixels), less as it lurches in; `jolt`
 *  her shaking (the rage). */
export const drawGrossUp = (c: Ctx, cx: number, cy: number, zoom: number, f: number, rage: boolean, talking: boolean, jolt = 0) => {
  const n = talking ? [0, 2, 3, 1][Math.floor(f / 5) % 4] : 0;
  const twitch = f % 96 < 16 && (f >> 1) % 2 === 0;
  const img = stamp(rage, n, twitch);
  if (!img) return;
  const base = bases.get(rage)!;
  const S = GP * zoom;
  // (the lurch: a slow sway, a jitter now and then, the jolt)
  const jx = Math.round(Math.sin(f * 0.045) * 1.4 + (hash2(Math.floor(f / 9), 3) > 0.7 ? (hash2(Math.floor(f / 9), 5) - 0.5) * 2 : 0)) + jolt * (f % 4 < 2 ? 1 : -1) / GP;
  const jy = Math.round(Math.sin(f * 0.06) * 1.2);
  c.save();
  c.translate(Math.round(cx - (AX - jx) * S), Math.round(cy - (AY - jy) * S));
  c.scale(S, S);
  c.imageSmoothingEnabled = false;
  // (rage: the wings buzzing, a blur of them behind her shoulders, uselessly)
  if (rage) {
    c.globalAlpha = 0.4; c.fillStyle = '#EEE8FF';
    for (const [x, y, s] of [[76, 104, -1], [162, 98, 1]] as const) {
      const o = (f % 3) - 1;
      c.beginPath(); c.ellipse(x + o * 3 * s, y + 3, 10, 17, s * (0.25 + o * 0.15), 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
  }
  c.drawImage(img, 0, 0);
  const box = (x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  // (the glitter in the grease and the sequins, twinkling in turn)
  const g = base.glitter;
  for (let i = 0; i < g.length; i += 2) {
    const ph = (f + i * 7) % 46;
    if (ph < 5) { const s = ph < 2 || ph > 3 ? 1 : 2; box(g[i] - s, g[i + 1], s * 2 + 1, 1, '#FFFFFF'); box(g[i], g[i + 1] - s, 1, s * 2 + 1, '#FFFFFF'); }
  }
  // (a bead of sweat running down her temple, another down her cleavage, again and again)
  {
    const t = (f % 150) / 150, x = FX - 24 - t + Math.sin(t * 9) * 0.6, y = 66 + t * 18;
    box(x, y, 1, 2, '#FFF4EA'); box(x, y, 1, 1, '#FFFFFF');
    const u = ((f + 70) % 120) / 120;
    box(120 + Math.sin(u * 7) * 0.6, 128 + u * 10, 1, 2, '#FFF4EA');
  }
  if (rage) {
    // (spittle: flecks flying out of the scream at the camera, growing as they come)
    for (let i = 0; i < 14; i++) {
      const ph = ((f * 1.4 + i * 19) % 32) / 32, a = -Math.PI * (0.05 + (i / 13) * 0.9);
      const d = 6 + ph * 50, x = FX + Math.cos(a) * d * 1.2, y = 102 + Math.sin(a) * d * 0.7 + ph * ph * 30, s = 1 + Math.round(ph * 2);
      c.globalAlpha = ph < 0.85 ? 1 : (1 - ph) / 0.15;
      box(x, y, s, s, '#E8F0FA'); box(x, y, 1, 1, '#FFFFFF');
    }
    c.globalAlpha = 1;
    // (the veins throbbing)
    if (f % 20 < 6) { c.globalAlpha = 0.45; for (const [x, y] of [[112, 62], [127, 62], [95, 74], [144, 74], [96, 116], [143, 116]]) box(x, y, 2, 4, '#F4B0E4'); c.globalAlpha = 1; }
    // (the wings' buzz lines)
    for (const [x, y, s] of [[76, 104, -1], [162, 98, 1]] as const) for (let k = 0; k < 3; k++) box(x - 6 + (f % 3) * 2 * s, y - 10 + k * 9, 12, 1, 'rgba(255, 255, 255, 0.7)');
  } else {
    // (drool, stringing off her bottom lip and letting go)
    const L = (f * 0.2) % 16, x = FX - 6, y = 105 + n * 0.8;
    c.globalAlpha = 0.85;
    box(x, y, 1, Math.round(L), '#E4ECF8');
    box(x - 1, y + L, 2, 2, '#EEF4FC'); box(x - 1, y + L, 1, 1, '#FFFFFF');
    c.globalAlpha = 1;
  }
  // (the tic: little shake marks off the twitching eye)
  if (twitch) for (let k = 0; k < 3; k++) box(FX + 21 + k * 2, 74 + k * 3 - (f % 2), 2, 1, '#FFFFFF');
  c.restore();
};
