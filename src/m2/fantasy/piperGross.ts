// PIPER'S GROSS-UP (the user's: "when it does a closeup of her face, do a gross ren and stimpy style closeup"): the John K
// held still, her face huge in frame and painted in excruciating detail. Every pore, blackheads on her nose, a cold sore
// at the corner of her mouth, nose hairs, a wart with a hair on her chin, the caked foundation cracking, clumped mascara
// running, lipstick smeared past her lips and on her teeth, gaps and gold fillings, bloodshot eyes, an eyelid twitching,
// three chins sagging, hairs on her upper lip, glitter stuck in the grease, sweat. Two faces: SULTRY (heavy-lidded, the
// pout, drool) and RAGE (red, the veins bulging, bulging eyes with pinprick pupils, the scream, spittle flying).
//
// Painted per pixel into a low-res buffer (GW x GH, each pixel GP screen pixels): round shading off a light up-left,
// stepped into long SNES ramps with a 4x4 ordered dither between the steps, creases inked in each material's line tone.
// The heavy paint's cached: a base per face, then a stamp per (face, mouth shape, twitch) off it; the live bits (glitter
// twinkling, a bead of sweat running, drool, spittle, the tic) are drawn over it each frame.

type Ctx = CanvasRenderingContext2D;

/** The buffer's size in its pixels, and how many screen pixels each is at the hold. */
export const GW = 272, GH = 204, GP = 3;
/** The middle of her face in the buffer. */
const FX = 136, FY = 92;

// ---------------------------------------------------------------------------------------------------------------
// Colors (32-bit, the buffer's byte order) and ramps (light .. deep, then the line)

const hexU = (h: string) => { const n = parseInt(h.slice(1), 16); return ((255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | (n >> 16)) >>> 0; };
const R = (...h: string[]) => h.map(hexU);
const mixU = (a: number, b: number, k: number) => {
  const ch = (s: number) => Math.round(((a >>> s) & 255) * (1 - k) + ((b >>> s) & 255) * k);
  return ((255 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)) >>> 0;
};
const WHITE = hexU('#FFFFFF');

const FACE = R('#FFEAD4', '#FCD6B4', '#F4BE98', '#E8A67E', '#D68A66', '#BA6E52', '#94523E', '#5A2A1E');
const SKIN = R('#FFEEE6', '#FCD6C6', '#F4BCA8', '#E8A08C', '#D68474', '#B8665A', '#8E4A42', '#52221E');
const RAGEF = R('#FFC0A8', '#FF9E86', '#F47E6A', '#E45E52', '#CC4440', '#AC2C2E', '#861C22', '#480A10');
const RAGES = R('#FFC8B8', '#FFA494', '#F48478', '#E46660', '#CC4A4A', '#AC3236', '#86202A', '#480A12');
const HAIR = R('#FFFFF4', '#FAF0C4', '#ECD894', '#D4BA6A', '#B09450', '#86703A', '#4E3E1A');
const GOLD = R('#FFFAD0', '#FBE27A', '#F2C444', '#D4A02A', '#A8781A', '#7A520E', '#3E2806');
const GOWN = R('#FFC4E6', '#FF8CC8', '#F45AAE', '#D63A92', '#B02474', '#841656', '#460828');
const WING = R('#FFFFFF', '#EEE8FF', '#D8CCFF', '#BCA8F4', '#9A84DC', '#4A3A8A');
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
const WART = R('#ECBCA4', '#D49A82', '#B87A66', '#985C4C', '#764036', '#3A1A14');
const VEIN = R('#F4B0E4', '#D07ACA', '#A852A4', '#80347E', '#5A1A5E', '#2A0630');
const SORE = R('#FFF6B8', '#F6DA6A', '#EAA644', '#C8563A', '#8A2418', '#4A0E08');
const DARK = hexU('#2A140E'), HAIRLINE = hexU('#1E120A'), MASCARA = hexU('#120A14'), SMUDGE = hexU('#3A2A4A');

// ---------------------------------------------------------------------------------------------------------------
// The buffer and its brushes

const M_SKIN = 1, M_HAIR = 2, M_SCLERA = 3, M_IRIS = 4, M_LIP = 5, M_MOUTH = 6, M_OTHER = 7;
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
/** A round form in its ramp: shaded off the light up-left, stepped, dithered between the steps. */
const ball = (b: Buf, cx: number, cy: number, rx: number, ry: number, ramp: number[], o: BallO = {}) => {
  const n = ramp.length - 1, lw = o.lw ?? 1.2, mn = Math.min(rx, ry);
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
    const lv = Math.max(0, Math.min(1, ((-0.42 * dx - 0.5 * dy + 0.76 * nz) / ln) * (o.lit ?? 1)));
    const s = (1 - lv) * n * 1.05 - 0.55 + (bay(x, y) - 0.5) * 0.9;
    const k = Math.max(0, Math.min(n - 1, Math.round(s)));
    b.px[i] = ramp[k]; b.tone[i] = Math.round((k / Math.max(1, n - 1)) * 254);
    if (o.mat !== undefined) b.mat[i] = o.mat;
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
/** A flat polygon in its ramp, banded top to bottom, inked round its edge. */
const poly = (b: Buf, pts: number[], ramp: number[], mat?: number) => {
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (let i = 0; i < pts.length; i += 2) { x0 = Math.min(x0, pts[i]); x1 = Math.max(x1, pts[i]); y0 = Math.min(y0, pts[i + 1]); y1 = Math.max(y1, pts[i + 1]); }
  const inside = (x: number, y: number) => {
    let c = false;
    for (let i = 0, j = pts.length - 2; i < pts.length; j = i, i += 2) {
      const xi = pts[i], yi = pts[i + 1], xj = pts[j], yj = pts[j + 1];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const n = ramp.length - 1;
  for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(GH - 1, y1); y++) for (let x = Math.max(0, Math.floor(x0)); x <= Math.min(GW - 1, x1); x++) {
    const px = x + 0.5, py = y + 0.5;
    if (!inside(px, py)) continue;
    const edge = !inside(px - 1, py) || !inside(px + 1, py) || !inside(px, py - 1) || !inside(px, py + 1);
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
  ball(b, x, y, r, r * 1.25, [skin[2], skin[1], skin[0], WHITE, skin[5]], { line: (dx, dy) => dy > 0.2, lw: 0.8 });
  plot(b, x - r * 0.4, y - r * 0.5, WHITE);
};

// ---------------------------------------------------------------------------------------------------------------
// The base: everything but her eyes and her mouth

const buildBase = (rage: boolean): Buf => {
  seed = rage ? 911 : 377;
  const b = newBuf();
  const FC = rage ? RAGEF : FACE, SK = rage ? RAGES : SKIN;
  // (her wings' tips peeking up behind her shoulders: veined, glittered, straining)
  for (const s of [-1, 1]) {
    const x = FX + s * 126;
    ball(b, x, 166, 12, 32, WING, { line: true, mat: M_OTHER });
    path(b, [x - s * 2, 196, x + s * 3, 160, x + s * 1, 140], WING[4], 1, undefined, M_OTHER);
    path(b, [x + s * 2, 178, x - s * 6, 158], WING[4], 1, undefined, M_OTHER);
    path(b, [x + s * 3, 160, x + s * 9, 150], WING[4], 1, undefined, M_OTHER);
    for (let k = 0; k < 6; k++) { const gx = x + (rnd() - 0.5) * 16, gy = 140 + rnd() * 50; if (matAt(b, gx, gy) === M_OTHER) { plot(b, gx, gy, WHITE); b.glitter.push(Math.round(gx), Math.round(gy)); } }
  }
  // (her shoulders, the gown at the corners, the straps biting in)
  ball(b, FX, 300, 230, 112, SK, { mat: M_SKIN });
  for (const s of [-1, 1]) {
    ball(b, FX + s * 136, 214, 46, 22, GOWN, { line: true, mat: M_OTHER });
    seg(b, FX + s * 112, 204, FX + s * 104, 190, GOWN[5], 4, M_OTHER);
    seg(b, FX + s * 112 - 1, 204, FX + s * 104 - 1, 190, GOWN[1], 1, M_OTHER);
    seg(b, FX + s * 115, 204, FX + s * 107, 190, SK[3], 1);
    seg(b, FX + s * 108, 204, FX + s * 100, 190, SK[6], 1);
    for (let k = 0; k < 14; k++) { const sx = FX + s * (104 + rnd() * 30), sy = 200 + rnd() * 4; if (matAt(b, sx, sy) === M_OTHER) plot(b, sx, sy, k % 3 ? GOWN[0] : WHITE); }
  }
  // (the beehive's sides behind her head)
  for (const s of [-1, 1]) ball(b, FX + s * 106, 44, 44, 62, HAIR, { mat: M_HAIR, line: true });
  // (the chins: three, sagging, the lowest first; each creased under)
  ball(b, FX, 194, 104, 18, SK, { mat: M_SKIN, line: (_dx, dy) => dy > -0.1, lw: 1.5 });
  ball(b, FX, 181, 92, 18, SK, { mat: M_SKIN, line: (_dx, dy) => dy > -0.1, lw: 1.5 });
  ball(b, FX, 168, 80, 18, SK, { mat: M_SKIN, line: (_dx, dy) => dy > -0.1, lw: 1.5 });
  // (the ears, the lobes stretched by the hoops)
  for (const s of [-1, 1]) {
    const ex = FX + s * 106;
    ball(b, ex, 100, 14, 22, SK, { mat: M_SKIN, line: true });
    ball(b, ex, 124, 6, 6, SK, { mat: M_SKIN, line: true });
    path(b, [ex + s * 4, 84, ex - s * 4, 88, ex - s * 6, 100, ex - s * 2, 112], SK[6]);
    path(b, [ex + s * 1, 92, ex - s * 2, 100, ex + s * 1, 106], SK[4]);
  }
  // (her face: round, the jowls hanging)
  ball(b, FX, FY, 98, 78, FC, { mat: M_SKIN, line: (_dx, dy) => dy > -0.25, lw: 1.5 });
  ball(b, 84, 120, 42, 34, FC, { mat: M_SKIN, line: (dx, dy) => (dy > 0.35 && dx > -0.5) || dx < -0.8, lit: 1.08 });
  ball(b, 188, 120, 42, 34, FC, { mat: M_SKIN, line: (dx, dy) => (dy > 0.35 && dx < 0.5) || dx > 0.8, lit: 1.08 });
  // (the blush, troweled on)
  for (const s of [-1, 1]) tint(b, FX + s * 54, 112, 30, 15, hexU(rage ? '#C81E24' : '#F46A86'), rage ? 0.3 : 0.4, M_SKIN);
  // (the eyeshadow: violet up to her brows, blue in the crease, dithered off at the edges)
  for (const s of [-1, 1]) {
    const ex = FX + s * 38;
    ball(b, ex + s * 2, 64, 34, 15, SHADOW2, { soft: 0.45, flat: 0.6 });
    ball(b, ex, 78, 29, 18, SHADOW, { soft: 0.3, flat: 0.8 });
  }
  // (the brows: plucked to nothing and drawn back on in pencil, a few real hairs poking out of the line; down in a V
  // when she's furious)
  for (const s of [-1, 1]) {
    const pts = rage ? [FX + s * 72, 50, FX + s * 50, 56, FX + s * 30, 64, FX + s * 12, 72] : [FX + s * 72, 66, FX + s * 60, 54, FX + s * 42, 49, FX + s * 18, 57];
    path(b, pts, hexU('#4A2E14'), rage ? 3 : 2);
    path(b, pts.map((v, i) => (i % 2 ? v - 1 : v)), hexU('#7A5230'), 1);
    for (let k = 0; k < 9; k++) { const t = rnd(), j = Math.floor(t * (pts.length / 2 - 1)) * 2, u = t * (pts.length / 2 - 1) - j / 2; const x = pts[j] + (pts[j + 2] - pts[j]) * u, y = pts[j + 1] + (pts[j + 3] - pts[j + 1]) * u; seg(b, x, y + 2, x + s * 1, y + 4 + rnd() * 2, hexU('#6A4A2A')); }
  }
  // (the nose: the bridge, the wings, the bulb; the nostrils, the hairs out of them)
  ball(b, FX, 98, 13, 26, FC, { mat: M_SKIN, lit: 1.1 });
  for (const s of [-1, 1]) ball(b, FX + s * 17, 120, 10, 9, FC, { mat: M_SKIN, line: (dx, dy) => dy > -0.2 && dx * s > -0.3 });
  ball(b, FX, 114, 19, 16, FC, { mat: M_SKIN, line: (_dx, dy) => dy > 0.4, lit: 1.12 });
  for (const s of [-1, 1]) {
    ball(b, FX + s * 9, 126, 5, 3, R('#4A1C16', '#2E0E0A', '#1A0606', '#0E0202', '#060000'), { mat: M_OTHER });
    for (let k = 0; k < 4; k++) path(b, [FX + s * (6 + k * 2), 126, FX + s * (5.5 + k * 2.4) + (rnd() - 0.5) * 2, 129 + rnd() * 3, FX + s * (5 + k * 2.6) + (rnd() - 0.5) * 3, 131 + rnd() * 2], HAIRLINE);
  }
  // (the philtrum; the hairs on her upper lip)
  seg(b, FX - 4, 131, FX - 3, 139, FC[5]); seg(b, FX + 4, 131, FX + 3, 139, FC[5]);
  for (let k = 0; k < 18; k++) { const x = FX - 22 + rnd() * 44, y = 134 + rnd() * 6; seg(b, x, y, x + (x - FX) * 0.05 + (rnd() - 0.5), y + 2, hexU('#4A2A1A'), 1, undefined, M_SKIN); }
  // (the beauty mark, with a hair out of it; the wart on her chin, with a long one)
  ball(b, 197, 134, 2.4, 2.2, R('#6A3A22', '#4A2414', '#2E140A', '#1A0804', '#0E0402'), { mat: M_OTHER });
  path(b, [198, 133, 201, 129, 200, 125, 203, 122], HAIRLINE);
  ball(b, 168, 166, 6, 5, WART, { line: true, mat: M_OTHER });
  for (let k = 0; k < 6; k++) plot(b, 165 + rnd() * 6, 163 + rnd() * 5, WART[4]);
  path(b, [170, 162, 172, 156, 176, 153, 177, 148, 181, 146], HAIRLINE);
  // (stubble on the chins; two long hairs off them)
  for (let k = 0; k < 90; k++) { const x = FX + (rnd() - 0.5) * 150, y = 172 + rnd() * 30; if (matAt(b, x, y) === M_SKIN) plot(b, x, y, mixU(b.px[(Math.round(y)) * GW + Math.round(x)] ?? WHITE, DARK, 0.55)); }
  path(b, [104, 186, 100, 191, 103, 196, 100, 201], HAIRLINE); path(b, [162, 190, 165, 195, 162, 200], HAIRLINE);
  // (the hoops: big gold rings off the lobes)
  for (const s of [-1, 1]) {
    const hx = FX + s * 106, hy = 142;
    for (let a = 0; a < Math.PI * 2; a += 0.04) {
      const k = Math.cos(a + 2.3) > 0.4 ? 1 : Math.cos(a + 2.3) > -0.3 ? 2 : 4;
      plot(b, hx + Math.cos(a) * 13, hy + Math.sin(a) * 13, GOLD[k], M_OTHER); plot(b, hx + Math.cos(a) * 12, hy + Math.sin(a) * 12, GOLD[k + 1], M_OTHER);
    }
    plot(b, hx - 9, hy - 9, WHITE); b.glitter.push(hx - 9, hy - 9);
  }
  // (the hairline: the beehive pulled up off her forehead, black roots coming through the bleach, bobby pins)
  ball(b, FX, -14, 124, 38, HAIR, { mat: M_HAIR, line: (_dx, dy) => dy > 0.5 });
  for (let x = FX - 124; x <= FX + 124; x++) {
    const yE = -14 + 38 * Math.sqrt(Math.max(0, 1 - ((x - FX) / 124) ** 2));
    for (let y = Math.floor(yE - 7); y < yE - 1; y++) if (matAt(b, x, y) === M_HAIR && bay(x, y) < (y - (yE - 7)) / 6 + 0.2) plot(b, x, y, hexU(y > yE - 4 ? '#4A3218' : '#7A5A2E'));
  }
  for (let k = 0; k < 40; k++) { const x0 = rnd() * GW, y0 = rnd() * 60; path(b, [x0, y0, x0 + (rnd() - 0.5) * 10, y0 - 4 - rnd() * 6, x0 + (rnd() - 0.5) * 16, y0 - 10 - rnd() * 8], k % 3 ? HAIR[4] : HAIR[0], 1, undefined, M_HAIR); }
  for (const [x, y, dx, dy] of [[56, 14, 12, -6], [204, 10, 10, 6], [88, 6, 6, -6], [238, 60, -8, 6], [30, 64, 9, 5]]) { seg(b, x, y, x + dx, y + dy, hexU('#1A1A22'), 1, undefined, M_HAIR); seg(b, x, y + 2, x + dx, y + dy + 2, hexU('#3A3A48'), 1, undefined, M_HAIR); }
  // (the tiara, jammed in it: gold, a pink heart, a stone missing)
  poly(b, [96, 20, 100, 7, 110, 15, 122, -1, 136, 12, 150, -1, 162, 15, 172, 7, 176, 20, 176, 22, 96, 22], GOLD, M_OTHER);
  ball(b, FX, 13, 6, 5, R('#FFB4DA', '#FF5AA8', '#E02A84', '#A8105E', '#5A0430'), { line: true, mat: M_OTHER }); plot(b, FX - 2, 11, WHITE); b.glitter.push(FX - 2, 11);
  ball(b, 110, 17, 2.5, 2.5, R('#C8F0FF', '#5AC8F4', '#2A8ACC', '#145A8A', '#082A4A'), { mat: M_OTHER }); ball(b, 162, 17, 2.5, 2.5, R('#2A1A08', '#1A1004', '#120A02', '#0A0601', '#000000'), { mat: M_OTHER });
  for (const x of [100, 122, 150, 172]) { plot(b, x, x === 122 || x === 150 ? 1 : 9, WHITE); b.glitter.push(x, x === 122 || x === 150 ? 1 : 9); }
  // (rage: the veins up her forehead and her temples, bulging)
  if (rage) {
    const vein = (pts: number[]) => { path(b, pts, VEIN[5], 4); path(b, pts, VEIN[3], 3); path(b, pts.map((v, i) => (i % 2 ? v : v - 1)), VEIN[1], 1); path(b, pts.map((v, i) => (i % 2 ? v - 1 : v - 1)), VEIN[0], 1); };
    vein([116, 24, 112, 32, 118, 40, 114, 50]); vein([118, 40, 106, 46, 102, 52]); vein([160, 26, 164, 34, 158, 44, 162, 50]);
    vein([52, 40, 46, 52, 50, 62, 46, 74]); vein([220, 40, 226, 52, 222, 62, 226, 74]);
  }
  // (sweat: beads across her forehead, over her lip, on her chins; a trail down each temple)
  for (let k = 0; k < 12; k++) { const x = 70 + rnd() * 132, y = 26 + rnd() * 22; if (matAt(b, x, y) === M_SKIN) bead(b, x, y, 1.6 + rnd() * 1.6, FC); }
  for (let k = 0; k < 4; k++) bead(b, FX - 16 + k * 10 + rnd() * 3, 135 + rnd() * 2, 1.3, FC);
  bead(b, 116, 176, 2, SK); bead(b, 154, 188, 1.8, SK);
  for (const s of [-1, 1]) { path(b, [FX + s * 82, 50, FX + s * 85, 66, FX + s * 84, 82, FX + s * 87, 94], mixU(FC[1], WHITE, 0.5), 2, undefined, M_SKIN); bead(b, FX + s * 87, 96, 2.2, FC); }
  // (post: the pores, the blackheads, the grease shining, the glitter stuck in it)
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const i = y * GW + x;
    if (b.mat[i] !== M_SKIN) continue;
    const h = hash2(x, y);
    const nose = ((x - FX) / 26) ** 2 + ((y - 112) / 22) ** 2 < 1, chin = y > 150 && Math.abs(x - FX) < 40;
    const cheek = ((x - 84) / 40) ** 2 + ((y - 118) / 30) ** 2 < 1 || ((x - 188) / 40) ** 2 + ((y - 118) / 30) ** 2 < 1;
    const dens = nose ? 0.17 : cheek || chin ? 0.1 : 0.055;
    if (h < dens) b.px[i] = mixU(b.px[i], FC[7], h < dens * 0.3 ? 0.42 : 0.26);
    else if ((nose || chin) && h > 0.965) { b.px[i] = DARK; if (hash2(x + 1, y) > 0.5) plot(b, x + 1, y, DARK); }
    else if (b.tone[i] < 50 && h > 0.6 && h < 0.74) b.px[i] = mixU(b.px[i], WHITE, 0.65);
    else if (h > 0.9965 && b.tone[i] < 170) { b.px[i] = hexU(['#FFFFFF', '#FFE070', '#FFB0E0', '#B0F0FF'][Math.floor(hash2(y, x) * 4)]); b.glitter.push(x, y); }
  }
  // (the foundation, caked on, cracking: across her forehead, her cheeks, her chin; flakes lifting off the cracks)
  for (let k = 0; k < 22; k++) {
    const sx = 50 + rnd() * 172, sy = k < 9 ? 26 + rnd() * 24 : 96 + rnd() * 60;
    if (matAt(b, sx, sy) !== M_SKIN) continue;
    const len = 8 + rnd() * 18, ang = rnd() * Math.PI * 2;
    const crack = (x: number, y: number) => {
      if (matAt(b, x, y) !== M_SKIN) return false;
      b.px[y * GW + x] = mixU(b.px[y * GW + x], FC[7], 0.6);
      if (matAt(b, x, y - 1) === M_SKIN) b.px[(y - 1) * GW + x] = mixU(b.px[(y - 1) * GW + x], WHITE, 0.4);
      if (rnd() < 0.08) { plot(b, x + 1, y + 1, mixU(FC[0], WHITE, 0.3), undefined, M_SKIN); plot(b, x + 2, y + 1, mixU(FC[0], WHITE, 0.3), undefined, M_SKIN); }
    };
    walk(sx, sy, ang, len, 1.1, (x, y, i) => { crack(x, y); if (i === 5) walk(x, y, ang + 1.2, len * 0.5, 1.1, (x2, y2) => crack(x2, y2)); });
  }
  return b;
};

// ---------------------------------------------------------------------------------------------------------------
// The eyes and the mouth (a stamp each per face, mouth shape, twitch)

const eye = (b: Buf, ex: number, ey: number, outer: -1 | 1, rage: boolean, twitch: boolean, FC: number[]) => {
  const rx = rage ? 20 : 18, ry = rage ? 15 : 11;
  ball(b, ex, ey, rx, ry, rage ? SCLERA_R : SCLERA, { mat: M_SCLERA, line: true, lw: 1, flat: 0.7 });
  // (bloodshot: red threads wandering in off the rim, branching)
  for (let k = 0; k < (rage ? 18 : 8); k++) {
    const a = rnd() * Math.PI * 2;
    const col = hexU(k % 3 ? '#D8303C' : '#9A1622');
    walk(ex + Math.cos(a) * rx * 0.92, ey + Math.sin(a) * ry * 0.92, a + Math.PI, 4 + rnd() * 9, 1.3, (x, y, i) => {
      if (matAt(b, x, y) !== M_SCLERA) return false;
      plot(b, x, y, col);
      if (i === 2 && rnd() < 0.6) walk(x, y, a + Math.PI + 0.9, 3 + rnd() * 3, 1.2, (x2, y2) => { if (matAt(b, x2, y2) !== M_SCLERA) return false; plot(b, x2, y2, col); });
    });
  }
  // (the iris (a touch cross-eyed), the pupil (a pinprick when she's furious), the glints)
  const ix = ex - outer * 2, iy = ey + (rage ? 0 : 2), ir = rage ? 6 : 7.5;
  ball(b, ix, iy, ir, ir, IRIS, { mat: M_IRIS, line: true, only: (x, y) => matAt(b, x, y) === M_SCLERA || matAt(b, x, y) === M_IRIS });
  for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; seg(b, ix + Math.cos(a) * 2.5, iy + Math.sin(a) * 2.5, ix + Math.cos(a) * (ir - 1.5), iy + Math.sin(a) * (ir - 1.5), IRIS[k % 2 ? 1 : 3], 1, undefined, M_IRIS); }
  ball(b, ix, iy, rage ? 1.6 : 3.4, rage ? 1.6 : 3.4, PUPIL, { mat: M_IRIS });
  plot(b, ix - 3, iy - 3, WHITE); plot(b, ix - 2, iy - 3, WHITE); plot(b, ix - 3, iy - 2, WHITE); plot(b, ix + 2, iy + 2, WHITE);
  // (the lid: heavy and half down for the sultry look, pulled back off the eye in the rage; the twitch drops it more)
  const lidAt = (x: number) => ey + (rage ? -ry + 2 : -2) + (twitch ? 5 : 0) + ((x - ex) / rx) ** 2 * 4;
  const lowAt = (x: number) => ey + ry - (twitch ? 5 : 1) - ((x - ex) / rx) ** 2 * 3;
  for (let y = Math.floor(ey - ry - 1); y <= ey + ry + 1; y++) for (let x = Math.floor(ex - rx - 1); x <= ex + rx + 1; x++) {
    const m = matAt(b, x, y);
    if (m !== M_SCLERA && m !== M_IRIS) continue;
    const dl = lidAt(x) - y;
    if (dl > 0) { const k = dl < 2 ? 4 : dl < 4 ? (bay(x, y) < 0.5 ? 3 : 4) : dl < 7 ? 2 : 1; plot(b, x, y, SHADOW[k], M_OTHER); if (dl > 5 && hash2(x, y) > 0.93) plot(b, x, y, WHITE); }
    else if (y > lowAt(x)) plot(b, x, y, y > lowAt(x) + 2 ? FC[3] : FC[5], M_OTHER);
  }
  path(b, [ex - rx * 0.8, ey - ry - 4, ex, ey - ry - 6, ex + rx * 0.8, ey - ry - 4], SHADOW[5]);
  // (the liner along the lid, flicked out past the outer corner)
  for (let x = ex - rx; x <= ex + rx; x++) { plot(b, x, lidAt(x), MASCARA); plot(b, x, lidAt(x) - 1, MASCARA); }
  const cx = ex + outer * rx;
  path(b, [cx, lidAt(cx), cx + outer * 6, lidAt(cx) - 4, cx + outer * 11, ey - ry - 4], MASCARA, 2);
  // (the false lashes, curled, clumped with mascara)
  for (let k = 0; k < 10; k++) {
    const x = ex - rx + 2 + (k * (2 * rx - 4)) / 9, y = lidAt(x);
    const dx = ((x - ex) / rx) * 0.7 + outer * 0.15, len = 7 + rnd() * 5;
    path(b, [x, y, x + dx * len * 0.3, y - len * 0.6, x + dx * len, y - len], MASCARA, k % 3 === 0 ? 2 : 1);
    if (rnd() < 0.55) ball(b, x + dx * len * 0.55, y - len * 0.75, 1.6, 1.6, R('#3A2A3A', '#1A1018', '#0A060A', '#000000', '#000000'));
  }
  // (the lower lashes, short and spiky, the mascara smudged under them; the bags)
  for (let k = 0; k < 7; k++) { const x = ex - rx + 4 + (k * (2 * rx - 8)) / 6, y = lowAt(x) + 1; seg(b, x, y, x + ((x - ex) / rx) * 2, y + 3, MASCARA); }
  tint(b, ex, ey + ry + 4, rx, 4, SMUDGE, 0.5, undefined, 0.7);
  for (const [dy, col] of [[8, FC[6]], [13, FC[5]]] as const) path(b, [ex - rx + 3, ey + ry + dy - 2, ex - rx * 0.4, ey + ry + dy + 1, ex + rx * 0.4, ey + ry + dy + 1, ex + rx - 3, ey + ry + dy - 2], col, 1, undefined, M_SKIN);
  // (the mascara running down her cheek: one eye when she's purring, both in the rage)
  if (rage || outer === -1) {
    let x = ex + outer * 7, w = 2;
    for (let y = Math.round(ey + ry + 3); y < ey + ry + (rage ? 50 : 40); y++) { x += (rnd() - 0.5) * 1.2; for (let a = 0; a < w; a++) plot(b, x + a, y, mixU(MASCARA, SMUDGE, 0.3)); if (y > ey + ry + 20) w = 1; }
    ball(b, x, ey + ry + (rage ? 51 : 41), 1.8, 2.2, R('#4A3A5A', '#2A2036', '#1A1222', '#0A060E', '#000000'));
  }
};

/** Her teeth along the inside of the mouth: yellowed, the gums showing, a gap or two, gold, her lipstick on the front. */
const teeth = (b: Buf, x0: number, x1: number, edge: (x: number) => number, dir: 1 | -1, h: number, gaps: number[], gold: number[], lippy: number[]) => {
  for (let i = 0, x = x0; x < x1; i++, x += 5) {
    if (gaps.includes(i)) continue;
    const top = (tx: number) => edge(x + tx);
    for (let tx = 0; tx < 4; tx++) for (let ty = 0; ty < h; ty++) {
      const y = Math.round(top(tx) + dir * ty);
      if (matAt(b, x + tx, y) !== M_MOUTH) continue;
      const ramp = gold.includes(i) ? GOLD : TOOTH;
      let k = tx === 0 ? 0 : tx === 3 ? 3 : ty > h - 2 ? 2 : 1;
      if (ty === 0) k = Math.min(ramp.length - 2, 4);
      if (bay(x + tx, y) > 0.8 && k < 3) k++;
      plot(b, x + tx, y, lippy.includes(i) && ty < 3 && tx > 0 ? LIP[ty === 0 ? 3 : 2] : ramp[k], M_OTHER);
    }
  }
};

const mouth = (b: Buf, rage: boolean, n: number) => {
  if (rage) {
    // (the scream: lips stretched thin round it, the throat, the uvula, the tongue, both rows of teeth, spit strung
    // between them)
    const cx = FX, cy = 154, mw = 30, mh = 15 + n * 2;
    ball(b, cx, cy, mw + 6, mh + 6, LIP, { mat: M_LIP, line: true, lw: 1.4 });
    ball(b, cx, cy, mw, mh, MOUTH, { mat: M_MOUTH, flat: 0.25, lit: 0.55 });
    ball(b, cx, cy - mh + 10, 3, 5, TONGUE, { mat: M_MOUTH, line: true });
    ball(b, cx, cy + mh - 4, 21, 9, TONGUE, { mat: M_MOUTH, line: (_dx, dy) => dy < 0, only: (x, y) => matAt(b, x, y) === M_MOUTH });
    seg(b, cx, cy + mh - 10, cx, cy + mh - 2, TONGUE[4], 1, undefined, M_MOUTH);
    const top = (x: number) => cy - mh * Math.sqrt(Math.max(0, 1 - ((x - cx) / mw) ** 2)) + 1;
    const bot = (x: number) => cy + mh * Math.sqrt(Math.max(0, 1 - ((x - cx) / mw) ** 2)) - 1;
    teeth(b, cx - 26, cx + 26, top, 1, 7, [3, 8], [1, 9], [4, 5]);
    teeth(b, cx - 22, cx + 22, bot, -1, 5, [2, 6], [7], []);
    for (const sx of [cx - 13, cx + 7, cx + 16]) for (let y = Math.round(top(sx) + 6); y < bot(sx) - 3; y++) if (bay(sx, y) < 0.7) plot(b, sx + Math.round(Math.sin(y * 0.4)), y, hexU('#F0E8F8'));
    // (the lips: chapped, the lipstick in their cracks)
    for (let x = cx - mw - 4; x < cx + mw + 4; x += 3) for (let y = cy - mh - 6; y < cy + mh + 6; y++) if (matAt(b, x, y) === M_LIP && hash2(x, y) > 0.5) plot(b, x, y, LIP[3]);
  } else {
    // (the pout: big glossy red lips, the lipstick smeared past them and feathered into the lines; parted, her teeth)
    const cx = FX, cy = 148;
    if (n > 0) {
      ball(b, cx, cy + 1 + n * 0.4, 18, 1.5 + n * 2.4, MOUTH, { mat: M_MOUTH, flat: 0.3, lit: 0.6 });
      if (n >= 2) ball(b, cx + 1, cy + 2 + n * 2.4, 11, 3 + n * 0.5, TONGUE, { mat: M_MOUTH, only: (x, y) => matAt(b, x, y) === M_MOUTH });
      teeth(b, cx - 15, cx + 15, (x) => cy + 1 + n * 0.4 - (1.5 + n * 2.4) * Math.sqrt(Math.max(0, 1 - ((x - cx) / 18) ** 2)) + 1, 1, 3 + n, [4], [1], [2, 3]);
    }
    for (const s of [-1, 1]) ball(b, cx + s * 9, cy - 4 - n * 0.6, 13, 6, LIP, { mat: M_LIP, line: (_dx, dy) => dy < 0.1, lit: 1.05 });
    ball(b, cx, cy + 6 + n * 1.7, 23, 8.5, LIP, { mat: M_LIP, line: (_dx, dy) => dy > -0.1, lit: 1.2 });
    if (!n) path(b, [cx - 23, cy + 1, cx - 9, cy + 2, cx, cy + 1, cx + 9, cy + 2, cx + 23, cy + 1], LIP[5]);
    // (the lip lines, the gloss)
    for (let x = cx - 24; x < cx + 24; x += 3) for (let y = cy - 12; y < cy + 18; y++) if (matAt(b, x, y) === M_LIP && hash2(x, y) > 0.55) plot(b, x, y, LIP[3]);
    for (const [x, y, w] of [[cx - 6, cy + 4 + n * 1.7, 6], [cx + 4, cy + 5 + n * 1.7, 3], [cx - 12, cy - 7 - n * 0.6, 4]]) seg(b, x, y, x + w, y, WHITE, 1, undefined, M_LIP);
    // (smeared: off the right corner, over her cupid's bow)
    tint(b, cx + 24, cy + 3, 9, 5, LIP[2], 0.8, M_SKIN, 0.7);
    tint(b, cx - 3, cy - 11, 13, 3, LIP[2], 0.7, M_SKIN, 0.8);
  }
  // (the cold sore at the corner of her mouth: a cluster of blisters, weeping, a crust)
  const sx = rage ? FX - 40 : FX - 26, sy = rage ? 146 : 145;
  tint(b, sx, sy, 7, 6, hexU('#C8303A'), 0.5, undefined, 0.6);
  for (const [dx, dy, r] of [[0, 0, 2], [3, -2, 1.6], [-2, 3, 1.6], [3, 3, 1.3], [-3, -2, 1.2]]) ball(b, sx + dx, sy + dy, r, r, SORE, { line: true, lw: 0.7 });
  plot(b, sx + 1, sy + 5, hexU('#A8641E')); plot(b, sx + 2, sy + 5, hexU('#8A4A12'));
};

// ---------------------------------------------------------------------------------------------------------------
// The caches

const bases = new Map<boolean, Buf>();
const stamps = new Map<string, HTMLCanvasElement>();
const stamp = (rage: boolean, n: number, twitch: boolean): HTMLCanvasElement | null => {
  const key = `${rage ? 1 : 0}${n}${twitch ? 1 : 0}`;
  const hit = stamps.get(key);
  if (hit) return hit;
  if (typeof document === 'undefined') return null;
  let base = bases.get(rage);
  if (!base) { base = buildBase(rage); bases.set(rage, base); }
  const b: Buf = { px: base.px.slice(), mat: base.mat.slice(), tone: base.tone, glitter: base.glitter };
  const FC = rage ? RAGEF : FACE;
  seed = rage ? 41 : 43; // (the same every stamp: the veins in her eyes don't jump about as her mouth goes)
  eye(b, FX - 38, 82, -1, rage, false, FC);
  eye(b, FX + 38, 82, 1, rage, twitch, FC);
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

/** Her gross-up: (cx, cy) the middle of her face on screen, `zoom` 1 at the hold (each of its pixels GP screen pixels),
 *  less as it lurches in; `jolt` her shaking (the rage). */
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
  c.translate(Math.round(cx - (FX - jx) * S), Math.round(cy - (FY - jy) * S));
  c.scale(S, S);
  c.imageSmoothingEnabled = false;
  c.drawImage(img, 0, 0);
  const box = (x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  // (the glitter in the grease, twinkling in turn)
  const g = base.glitter;
  for (let i = 0; i < g.length; i += 2) {
    const ph = (f + i * 7) % 46;
    if (ph < 5) { const s = ph < 2 || ph > 3 ? 1 : 2; box(g[i] - s, g[i + 1], s * 2 + 1, 1, '#FFFFFF'); box(g[i], g[i + 1] - s, 1, s * 2 + 1, '#FFFFFF'); }
  }
  // (a bead of sweat running down her temple, again and again)
  {
    const t = (f % 150) / 150, x = FX - 82 - 2 * t + Math.sin(t * 9) * 1.2, y = 50 + t * 44;
    box(x, y, 2, 3, '#FFF4EA'); box(x, y, 1, 1, '#FFFFFF'); box(x + 1, y + 2, 1, 1, rage ? '#C8423E' : '#D68A66');
  }
  if (rage) {
    // (spittle: flecks flying out of the scream at the camera, growing as they come)
    for (let i = 0; i < 14; i++) {
      const ph = ((f * 1.4 + i * 19) % 32) / 32, a = -Math.PI * (0.05 + (i / 13) * 0.9);
      const d = 12 + ph * 80, x = FX + Math.cos(a) * d * 1.2, y = 150 + Math.sin(a) * d * 0.7 + ph * ph * 40, s = 1 + Math.round(ph * 3);
      c.globalAlpha = ph < 0.85 ? 1 : (1 - ph) / 0.15;
      box(x, y, s, s, '#E8F0FA'); box(x, y, 1, 1, '#FFFFFF'); if (s > 2) box(x + s - 1, y + s - 1, 1, 1, '#9AB0C8');
    }
    c.globalAlpha = 1;
    // (the veins throbbing)
    if (f % 20 < 6) { c.globalAlpha = 0.45; for (const [x, y] of [[113, 34], [161, 36], [48, 58], [224, 58]]) box(x, y, 3, 6, '#F4B0E4'); c.globalAlpha = 1; }
    // (the wings buzzing behind her shoulders, uselessly)
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) box(FX + s * 126 - 8 + (f % 3) * 2 * s, 140 + k * 14, 16, 1, 'rgba(255, 255, 255, 0.7)');
  } else {
    // (drool, stringing off her bottom lip and letting go)
    const L = (f * 0.3) % 30, x = FX - 15, y = 157 + n * 1.7;
    c.globalAlpha = 0.85;
    box(x, y, 1, Math.round(L), '#E4ECF8');
    box(x - 1, y + L, 3, 3, '#EEF4FC'); box(x - 1, y + L, 1, 1, '#FFFFFF'); box(x + 1, y + L + 2, 1, 1, '#9AB0C8');
    c.globalAlpha = 1;
  }
  // (the tic: little shake marks off the twitching eye)
  if (twitch) for (let k = 0; k < 3; k++) box(FX + 62 + k * 3, 70 + k * 5 - (f % 2), 3, 1, '#FFFFFF');
  c.restore();
};
