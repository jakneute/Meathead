// DAD GUY'S GROSS-UP (the user's: close-ups are "gross ren and stimpy style close ups"): the intro's brief close-up
// when Meathead walks up on him, held still, his face huge in frame and painted in excruciating detail, the way the
// fantasy land does Piper's (piperGross.ts). Seventy-odd years of beer on one face: the dome blotched with liver spots
// and sweat, three strands of comb-over plastered across it, deep creases up his forehead, wild grey brows, the eyes
// bloodshot and yellowed under heavy lids with crust in the corners and purple bags under them, the nose a swollen
// purple strawberry (pores, blackheads, burst veins, a wart, nose hair out of both holes), the cheeks flushed and
// broken-veined, white stubble with a dark follicle under every hair, jowls, the neck rolls, beer foam on his lip,
// yellow teeth (a gap, a brown one), the headset mic taped along his cheek, the tank top's straps gone yellow. Two
// faces: SQUINT (one eye screwed shut, peering at Meathead) and BLEARY (both half shut, talking).
//
// Painted per pixel into a low-res buffer (GW x GH, each pixel GP screen pixels): round shading off a light up-left,
// stepped into long ramps with a 4x4 ordered dither between the steps, creases inked in each material's line tone. The
// paint's cached (a base per face, then a stamp per mouth shape off it); the live bits (a bead of sweat running, the
// foam dripping, drool, a fly) are drawn over it each frame.

import { stepper, paintAhead } from '../../grossKit';
type Ctx = CanvasRenderingContext2D;

export const GW = 272, GH = 204, GP = 3;
const FX = 136, FY = 96;

// ---------------------------------------------------------------------------------------------------------------
// Colors (32-bit, the buffer's byte order) and ramps (light .. deep, then the line)

const hexU = (h: string) => { const n = parseInt(h.slice(1), 16); return ((255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | (n >> 16)) >>> 0; };
const R = (...h: string[]) => h.map(hexU);
const mixU = (a: number, b: number, k: number) => {
  const ch = (s: number) => Math.round(((a >>> s) & 255) * (1 - k) + ((b >>> s) & 255) * k);
  return ((255 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)) >>> 0;
};
const WHITE = hexU('#FFFFFF');

const SKIN = R('#FFEDE2', '#FCD8C4', '#F2BFA6', '#E2A388', '#CC866E', '#AE6654', '#844638', '#4E241A');
const FLUSH = R('#FFC6C2', '#F8A2A2', '#EA8088', '#D45E6E', '#B84258', '#922C44', '#6A1A30', '#3A0818');
const NOSE = R('#F4A8C0', '#E07898', '#C8527E', '#AA3868', '#8A2456', '#681642', '#460A2C', '#240416');
const HAIR = R('#FFFFFF', '#EEEEEA', '#D4D4CE', '#B4B4AC', '#8C8C84', '#5A5A54');
const SCLERA = R('#FFFBE6', '#F6EAC4', '#EAD6A4', '#D4BA86', '#B09466', '#5A4022');
const IRIS = R('#C8E0F4', '#9CC2E4', '#6E9CCA', '#4A76A8', '#2C507E', '#0E2440');
const PUPIL = R('#2A2A30', '#16161A', '#0A0A0C', '#040406', '#000000');
const BAG = R('#E2B0B4', '#C88E9E', '#A86E86', '#88526E', '#663856', '#341A2C');
const LIP = R('#F0A0A0', '#DC7A80', '#C05A64', '#9E404C', '#7A2A36', '#40121A');
const MOUTH = R('#7A2A34', '#5A1824', '#40101A', '#2A0810', '#160408', '#080002');
const TONGUE = R('#FFB4BC', '#F08C9A', '#DA6A7E', '#B84C62', '#8A3248', '#40101E');
const TOOTH = R('#FFF6D0', '#F0DC9C', '#D8BE72', '#B89A50', '#8A6E34', '#4A3816');
const BROWN = R('#B08A50', '#8A6634', '#684A20', '#4A3212', '#2A1A06', '#140A02');
const TANK = R('#FFFFFF', '#F2EFE6', '#DCD6C6', '#C0B8A2', '#968E78', '#4E4838');
const MIC = R('#F4DCC0', '#E2C2A2', '#C8A282', '#A88262', '#7A5A40', '#3A2818');
const FOAM = R('#FFFFFF', '#FFFBEA', '#F4EAC4', '#E2D29A', '#C4AE6C', '#7A6630');
const WART = R('#E8B49C', '#CC9478', '#B07860', '#905C48', '#704234', '#381E14');
const DARK = hexU('#2A140E'), HAIRLINE = hexU('#24140C'), VEIN = hexU('#A8243C'), VEIN_B = hexU('#7A6AB4'), SPOT = R('#D2A078', '#B8845E', '#9A6A46');
const CRUST = hexU('#E8D27A'), CRUST_D = hexU('#B8962E');

// ---------------------------------------------------------------------------------------------------------------
// The buffer and its brushes (piperGross.ts's)

const M_SKIN = 1, M_HAIR = 2, M_SCLERA = 3, M_IRIS = 4, M_LIP = 5, M_MOUTH = 6, M_OTHER = 7, M_NOSE = 8;
interface Buf { px: Uint32Array; mat: Uint8Array; tone: Uint8Array }
const newBuf = (): Buf => ({ px: new Uint32Array(GW * GH), mat: new Uint8Array(GW * GH), tone: new Uint8Array(GW * GH) });
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const bay = (x: number, y: number) => BAYER[(y & 3) * 4 + (x & 3)];
const hash2 = (x: number, y: number) => { let h = (x * 374761393 + y * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
let seed = 1;
const rnd = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const matAt = (b: Buf, x: number, y: number) => (x < 0 || y < 0 || x >= GW || y >= GH ? 0 : b.mat[(y | 0) * GW + (x | 0)]);
const pxAt = (b: Buf, x: number, y: number) => b.px[(Math.round(y)) * GW + Math.round(x)];

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

interface BallO { mat?: number; line?: boolean | ((dx: number, dy: number) => boolean); lw?: number; lit?: number; flat?: number; soft?: number; only?: (x: number, y: number) => boolean }
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
const walk = (x: number, y: number, ang: number, steps: number, wob: number, fn: (x: number, y: number, i: number) => boolean | void) => {
  for (let i = 0; i < steps; i++) {
    x += Math.cos(ang); y += Math.sin(ang); ang += (rnd() - 0.5) * wob;
    if (fn(Math.round(x), Math.round(y), i) === false) return;
  }
};
const bead = (b: Buf, x: number, y: number, r: number, skin: number[]) => {
  ball(b, x, y, r, r * 1.25, [skin[2], skin[1], skin[0], WHITE, skin[5]], { line: (dx, dy) => dy > 0.2, lw: 0.8 });
  plot(b, x - r * 0.4, y - r * 0.5, WHITE);
};
/** A vein: a wandering thread that forks (on one material). */
const veins = (b: Buf, x: number, y: number, ang: number, len: number, col: number, onMat: number) => {
  walk(x, y, ang, len, 1.2, (vx, vy, i) => {
    if (matAt(b, vx, vy) !== onMat) return false;
    plot(b, vx, vy, col);
    if (i === Math.floor(len / 2) && rnd() < 0.7) walk(vx, vy, ang + (rnd() < 0.5 ? 0.9 : -0.9), len * 0.5, 1.2, (x2, y2) => { if (matAt(b, x2, y2) !== onMat) return false; plot(b, x2, y2, col); });
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The base: everything but his eyes and his mouth

function* buildBase(squint: boolean): Generator<void, Buf> {
  seed = squint ? 731 : 733;
  const b = newBuf();
  yield;
  // (the tank top: the scooped neckline at the bottom of the frame, the straps gone yellow at the armpits, grey chest
  yield;
  // hair curling out over it; his shoulders round it)
  ball(b, FX, 300, 240, 120, SKIN, { mat: M_SKIN });
  for (const s of [-1, 1]) {
    for (let y = 182; y < GH; y++) { const x = FX + s * (96 + (y - 182) * 0.5); seg(b, x - 9, y, x + 9, y, TANK[1 + (bay(x, y) > 0.6 ? 1 : 0)], 1, M_OTHER); plot(b, x - 9, y, TANK[5]); plot(b, x + 9, y, TANK[5]); }
    tint(b, FX + s * 104, 198, 14, 10, hexU('#D8B848'), 0.45, M_OTHER, 0.8);
  }
  for (let x = FX - 92; x <= FX + 92; x++) { const yN = 192 + ((x - FX) / 92) ** 2 * 10; for (let y = Math.ceil(yN); y < GH; y++) plot(b, x, y, (x % 3 === 0) ? TANK[2] : TANK[1], M_OTHER); plot(b, x, Math.round(yN), TANK[4]); }
  for (let k = 0; k < 40; k++) { const x = FX - 60 + rnd() * 120, y = 186 + rnd() * 6; path(b, [x, y + 4, x + (rnd() - 0.5) * 4, y, x + (rnd() - 0.5) * 6, y - 3], k % 3 ? HAIR[3] : HAIR[1]); }
  yield;
  // (the neck rolls: three, sweaty in their creases)
  for (let k = 0; k < 3; k++) ball(b, FX, 178 - k * 9, 92 - k * 6, 14, SKIN, { mat: M_SKIN, line: (_dx, dy) => dy > 0.1, lw: 1.4 });
  yield;
  // (the ears: big, red at the rims, white hair tufting out of the holes, a lobe like a teabag)
  for (const s of [-1, 1]) {
    const ex = FX + s * 104;
    ball(b, ex, 98, 17, 30, SKIN, { mat: M_SKIN, line: true });
    tint(b, ex + s * 6, 92, 9, 24, FLUSH[3], 0.4, M_SKIN, 0.6);
    ball(b, ex - s * 2, 124, 9, 11, SKIN, { mat: M_SKIN, line: (dx, dy) => dy > 0 || dx * s > 0.3 });
    path(b, [ex + s * 6, 76, ex - s * 4, 80, ex - s * 8, 96, ex - s * 4, 114], SKIN[6]);
    path(b, [ex + s * 1, 88, ex - s * 3, 98, ex + s * 1, 108], SKIN[5]);
    for (let k = 0; k < 12; k++) path(b, [ex - s * 2, 100, ex - s * (6 + rnd() * 6), 92 - rnd() * 10, ex - s * (8 + rnd() * 10), 86 - rnd() * 12], k % 2 ? HAIR[0] : HAIR[2]);
  }
  yield;
  // (the white fringe round the back of his head, over the ears, a fuzz)
  for (const s of [-1, 1]) {
    ball(b, FX + s * 96, 66, 18, 26, HAIR, { mat: M_HAIR, soft: 0.5 });
    for (let k = 0; k < 30; k++) { const x = FX + s * (84 + rnd() * 24), y = 44 + rnd() * 44; path(b, [x, y, x + s * (2 + rnd() * 5), y - 3 - rnd() * 4], k % 3 ? HAIR[1] : HAIR[4], 1, undefined, M_HAIR); }
  }
  yield;
  // (the jowls, hanging off the jaw, and the double chin)
  ball(b, FX, 162, 84, 30, SKIN, { mat: M_SKIN, line: (_dx, dy) => dy > 0.2, lw: 1.4 });
  for (const s of [-1, 1]) ball(b, FX + s * 58, 146, 34, 36, SKIN, { mat: M_SKIN, line: (dx, dy) => dy > 0.4 || dx * s > 0.85, lit: 1.04 });
  yield;
  // (the head: the dome, cut off at the top of the frame, a forehead you could land a plane on)
  ball(b, FX, 76, 96, 104, SKIN, { mat: M_SKIN, line: (dx, dy) => dy > -0.1 && Math.abs(dx) > 0.82, lw: 1.5, lit: 1.05 });
  for (const s of [-1, 1]) ball(b, FX + s * 50, 128, 40, 30, SKIN, { mat: M_SKIN, line: (dx, dy) => (dy > 0.5 && dx * s > -0.4) || dx * s > 0.9, lit: 1.08 });
  yield;
  // (the cheeks flushed, broken capillaries all over them)
  for (const s of [-1, 1]) {
    tint(b, FX + s * 52, 126, 32, 20, FLUSH[2], 0.55, M_SKIN, 0.6);
    for (let k = 0; k < 9; k++) veins(b, FX + s * (34 + rnd() * 34), 114 + rnd() * 24, rnd() * Math.PI * 2, 5 + rnd() * 6, VEIN, M_SKIN);
  }
  yield;
  // (the liver spots: big brown blotches over the dome, a few at his temples, raised and cracked)
  for (let k = 0; k < 16; k++) {
    const x = FX + (rnd() - 0.5) * 170, y = 4 + rnd() * 54, r = 2 + rnd() * 6;
    if (matAt(b, x, y) !== M_SKIN) continue;
    ball(b, x, y, r * (0.8 + rnd() * 0.5), r, SPOT.concat(SPOT[2], DARK), { soft: 0.4, flat: 0.4 });
    if (r > 5) path(b, [x - r * 0.5, y, x, y - r * 0.3, x + r * 0.4, y + r * 0.2], DARK);
  }
  yield;
  // (the forehead's creases: deep, wavy, three across, each inked under and lit over)
  for (let k = 0; k < 4; k++) {
    const y0 = 38 + k * 8, w = 52 - k * 6;
    const pts: number[] = []; for (let x = FX - w; x <= FX + w; x += 6) pts.push(x, y0 + Math.sin(x * 0.11 + k) * 1.8 + ((x - FX) / w) ** 2 * 3);
    path(b, pts, SKIN[6], 1, undefined, M_SKIN); path(b, pts.map((v, i) => (i % 2 ? v - 1 : v)), SKIN[0], 1, undefined, M_SKIN);
  }
  path(b, [FX - 6, 58, FX - 3, 66, FX - 4, 72], SKIN[6]); path(b, [FX + 6, 58, FX + 3, 66, FX + 5, 72], SKIN[6]);
  yield;
  // (the comb-over: three long white strands from over his left ear clean across the dome, sweat-plastered, one come
  yield;
  // loose and standing up)
  for (let k = 0; k < 3; k++) {
    const pts: number[] = [];
    for (let u = 0; u <= 1.001; u += 0.05) { const x = FX + 96 - u * 186, y = 58 + k * 9 - Math.sin(u * Math.PI) * 44 + Math.sin(u * 17 + k * 2) * 1.6 + u * 10; pts.push(x, y); }
    path(b, pts.map((v, i) => (i % 2 ? v + 1 : v)), SKIN[6], 1, undefined, M_SKIN);
    path(b, pts, k === 1 ? HAIR[0] : HAIR[2], 1, M_HAIR);
    for (let i = 0; i < pts.length; i += 6) plot(b, pts[i], pts[i + 1], WHITE);
  }
  path(b, [FX - 12, 12, FX - 18, 2, FX - 14, -6], HAIR[2], 1); path(b, [FX + 10, 10, FX + 14, 1, FX + 22, -4], HAIR[2], 1);
  yield;
  // (rosacea and the veins up the sides of his nose, the bridge)
  ball(b, FX, 108, 14, 30, SKIN, { mat: M_SKIN, lit: 1.1 });
  tint(b, FX, 112, 22, 26, FLUSH[3], 0.45, M_SKIN, 0.6);
  yield;
  // (the brows: big, grey, wiry, going every way, a couple of long ones curling off)
  for (const s of [-1, 1]) {
    const by = squint && s < 0 ? 66 : 60;
    ball(b, FX + s * 40, by + 6, 28, 6, [HAIR[3], HAIR[4], HAIR[4], HAIR[5], HAIR[5], DARK], { soft: 0.6, flat: 0.5 });
    for (let k = 0; k < 110; k++) {
      const u = rnd(), x = FX + s * (14 + u * 50), y = by + (u - 0.5) ** 2 * -18 + 4 + rnd() * 7;
      const a = -Math.PI / 2 + s * (0.6 + rnd() * 0.9) + (rnd() - 0.5) * 0.8, l = 3 + rnd() * 6;
      seg(b, x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, k % 3 === 0 ? HAIR[5] : k % 3 === 1 ? HAIR[4] : HAIR[1], 1, M_HAIR);
    }
    path(b, [FX + s * 54, by - 4, FX + s * 62, by - 14, FX + s * 70, by - 12], HAIR[1]);
  }
  yield;
  // (the bags under the eyes: purple, three deep, veined)
  for (const s of [-1, 1]) {
    const ex = FX + s * 38, ey = 94;
    tint(b, ex, ey + 15, 26, 9, BAG[3], 0.45, M_SKIN, 0.7);
    for (let k = 0; k < 3; k++) path(b, [ex - 22 + k * 3, ey + 14 + k * 5, ex - 8, ey + 19 + k * 5, ex + 8, ey + 19 + k * 5, ex + 22 - k * 3, ey + 14 + k * 5], k ? SKIN[5] : BAG[4], 1, undefined, M_SKIN);
    for (let k = 0; k < 4; k++) veins(b, ex + (rnd() - 0.5) * 30, ey + 16, Math.PI * (0.3 + rnd() * 0.4), 6, VEIN_B, M_SKIN);
    // (crow's feet)
    for (let k = 0; k < 4; k++) path(b, [ex + s * 26, ey - 2 + k * 3, ex + s * (34 + k * 2), ey - 6 + k * 5, ex + s * (40 + k * 2), ey - 8 + k * 7], SKIN[6], 1, undefined, M_SKIN);
  }
  yield;
  // (the nose: a swollen purple strawberry, bumpy, the nostrils flared, the wings)
  for (const s of [-1, 1]) ball(b, FX + s * 22, 136, 14, 12, NOSE, { mat: M_NOSE, line: (dx, dy) => dy > -0.2 && dx * s > -0.3 });
  ball(b, FX, 124, 28, 24, NOSE, { mat: M_NOSE, line: (_dx, dy) => dy > 0.3, lit: 1.12 });
  for (const [x, y, r] of [[FX - 14, 118, 7], [FX + 12, 114, 6], [FX + 4, 132, 6], [FX - 6, 108, 5], [FX + 18, 128, 5]] as const) ball(b, x, y, r, r * 0.9, NOSE, { mat: M_NOSE, lit: 1.15, flat: 0.6 });
  for (let k = 0; k < 12; k++) veins(b, FX + (rnd() - 0.5) * 40, 112 + rnd() * 24, rnd() * Math.PI * 2, 6 + rnd() * 8, NOSE[6], M_NOSE);
  for (const s of [-1, 1]) {
    ball(b, FX + s * 12, 143, 8, 4, R('#4A1426', '#2E0A16', '#1A040C', '#0E0206', '#060002'), { mat: M_OTHER });
    for (let k = 0; k < 7; k++) path(b, [FX + s * (7 + k * 1.6), 142, FX + s * (6 + k * 2) + (rnd() - 0.5) * 3, 147 + rnd() * 3, FX + s * (5 + k * 2.2) + (rnd() - 0.5) * 4, 150 + rnd() * 3], k % 3 ? HAIRLINE : HAIR[3]);
  }
  yield;
  // (the wart on the side of his nose, a hair out of it)
  ball(b, FX + 26, 118, 4, 4, WART, { line: true, mat: M_OTHER });
  path(b, [FX + 27, 115, FX + 30, 109, FX + 34, 106], HAIRLINE);
  yield;
  // (the philtrum; the white stubble everywhere under the nose, a dark follicle under every hair)
  seg(b, FX - 5, 151, FX - 4, 158, SKIN[5]); seg(b, FX + 5, 151, FX + 4, 158, SKIN[5]);
  for (let k = 0; k < 520; k++) {
    const x = FX + (rnd() - 0.5) * 190, y = 140 + rnd() * 60;
    if (matAt(b, x, y) !== M_SKIN) continue;
    if (((x - FX) / 34) ** 2 + ((y - 128) / 22) ** 2 < 1) continue;
    plot(b, x, y, mixU(pxAt(b, x, y), DARK, 0.4));
    if (rnd() < 0.6) plot(b, x + (rnd() < 0.5 ? 1 : 0), y - 1, rnd() < 0.5 ? HAIR[3] : HAIR[1]);
  }
  yield;
  // (the headset mic: taped along his right cheek from the ear, a boom, the foam ball by his mouth, tape gone grey)
  path(b, [FX + 100, 120, FX + 74, 146, FX + 46, 162], MIC[5], 4, M_OTHER); path(b, [FX + 100, 120, FX + 74, 146, FX + 46, 162], MIC[1], 2, M_OTHER);
  for (const [x, y] of [[FX + 84, 136], [FX + 64, 152]] as const) { ball(b, x, y, 6, 4, R('#E4E0D4', '#CCC6B6', '#B0A894', '#908874', '#5A5444'), { line: true, mat: M_OTHER, flat: 0.4 }); seg(b, x - 4, y, x + 4, y, hexU('#9A947E')); }
  ball(b, FX + 42, 164, 7, 7, R('#5A5A5A', '#3A3A3A', '#262626', '#161616', '#060606'), { line: true, mat: M_OTHER });
  for (let k = 0; k < 10; k++) plot(b, FX + 38 + rnd() * 8, 160 + rnd() * 8, hexU('#6A6A6A'));
  yield;
  // (sweat: beads across the dome and the forehead, over the lip, in the neck rolls)
  for (let k = 0; k < 18; k++) { const x = FX - 80 + rnd() * 160, y = 6 + rnd() * 56; if (matAt(b, x, y) === M_SKIN) bead(b, x, y, 1.5 + rnd() * 1.8, SKIN); }
  for (let k = 0; k < 4; k++) bead(b, FX - 60 + rnd() * 120, 172 + rnd() * 10, 1.6, SKIN);
  yield;
  // (post: the pores (thick on his nose and cheeks), blackheads, the grease shining)
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const i = y * GW + x, m = b.mat[i];
    if (m !== M_SKIN && m !== M_NOSE) continue;
    const h = hash2(x, y);
    const nose = m === M_NOSE, cheek = ((x - FX + 52) / 36) ** 2 + ((y - 126) / 24) ** 2 < 1 || ((x - FX - 52) / 36) ** 2 + ((y - 126) / 24) ** 2 < 1;
    const ramp = nose ? NOSE : SKIN;
    const dens = nose ? 0.22 : cheek ? 0.12 : 0.06;
    if (h < dens) b.px[i] = mixU(b.px[i], ramp[7], h < dens * 0.3 ? 0.45 : 0.26);
    else if (nose && h > 0.955) { b.px[i] = DARK; if (hash2(x + 1, y) > 0.5) plot(b, x + 1, y, DARK); }
    else if (b.tone[i] < 50 && h > 0.6 && h < 0.76) b.px[i] = mixU(b.px[i], WHITE, 0.6);
  }
  return b;
}

// ---------------------------------------------------------------------------------------------------------------
// The eyes and the mouth

const eye = (b: Buf, ex: number, ey: number, outer: -1 | 1, shut: boolean, open: number) => {
  const rx = 24, ry = 15;
  if (shut) {
    // (screwed shut: the lid pulled down in folds, the lashes stuck together with crust)
    ball(b, ex, ey, rx + 2, ry * 0.7, SKIN, { mat: M_SKIN, line: (_dx, dy) => dy > 0.3, lw: 1.4 });
    path(b, [ex - rx, ey + 2, ex - rx * 0.4, ey + 5, ex + rx * 0.4, ey + 5, ex + rx, ey + 2], SKIN[7], 2);
    for (let k = 0; k < 3; k++) path(b, [ex - rx + 4, ey - 4 - k * 3, ex, ey - 1 - k * 3, ex + rx - 4, ey - 4 - k * 3], SKIN[5]);
    for (let k = 0; k < 6; k++) plot(b, ex - rx + 6 + k * 6, ey + 6, k % 2 ? CRUST : CRUST_D);
    return;
  }
  ball(b, ex, ey, rx, ry, SCLERA, { mat: M_SCLERA, line: true, lw: 1, flat: 0.7 });
  // (bloodshot: red threads wandering in off the rim, branching)
  for (let k = 0; k < 16; k++) {
    const a = rnd() * Math.PI * 2, col = hexU(k % 3 ? '#D8303C' : '#9A1622');
    walk(ex + Math.cos(a) * rx * 0.92, ey + Math.sin(a) * ry * 0.92, a + Math.PI, 4 + rnd() * 10, 1.3, (x, y, i) => {
      if (matAt(b, x, y) !== M_SCLERA) return false;
      plot(b, x, y, col);
      if (i === 2 && rnd() < 0.6) walk(x, y, a + Math.PI + 0.9, 3 + rnd() * 3, 1.2, (x2, y2) => { if (matAt(b, x2, y2) !== M_SCLERA) return false; plot(b, x2, y2, col); });
    });
  }
  // (the iris, wandering off a touch; the pupil; the glints, watery)
  const ix = ex - outer * 3, iy = ey + 2, ir = 7;
  ball(b, ix, iy, ir, ir, IRIS, { mat: M_IRIS, line: true, only: (x, y) => matAt(b, x, y) === M_SCLERA || matAt(b, x, y) === M_IRIS });
  for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; seg(b, ix + Math.cos(a) * 2.5, iy + Math.sin(a) * 2.5, ix + Math.cos(a) * (ir - 1.5), iy + Math.sin(a) * (ir - 1.5), IRIS[k % 2 ? 1 : 3], 1, undefined, M_IRIS); }
  ball(b, ix, iy, 2.6, 2.6, PUPIL, { mat: M_IRIS });
  plot(b, ix - 3, iy - 3, WHITE); plot(b, ix - 2, iy - 3, WHITE); plot(b, ix + 2, iy + 2, WHITE);
  // (the lid: heavy, droopy, down over most of it (more on a squint); the lower lid red and sagging, wet)
  const lidAt = (x: number) => ey - ry + 2 + (1 - open) * ry * 1.4 + ((x - ex) / rx) ** 2 * 4;
  const lowAt = (x: number) => ey + ry - 3 - ((x - ex) / rx) ** 2 * 3;
  for (let y = Math.floor(ey - ry - 1); y <= ey + ry + 1; y++) for (let x = Math.floor(ex - rx - 1); x <= ex + rx + 1; x++) {
    const m = matAt(b, x, y);
    if (m !== M_SCLERA && m !== M_IRIS) continue;
    const dl = lidAt(x) - y;
    if (dl > 0) { const k = dl < 2 ? 6 : dl < 4 ? (bay(x, y) < 0.5 ? 5 : 6) : dl < 8 ? 3 : 2; plot(b, x, y, SKIN[k], M_OTHER); }
    else if (y > lowAt(x)) plot(b, x, y, y > lowAt(x) + 2 ? FLUSH[3] : FLUSH[5], M_OTHER);
  }
  for (let x = ex - rx; x <= ex + rx; x++) { plot(b, x, lidAt(x), SKIN[7]); if (bay(x, 0) > 0.5) plot(b, x, lidAt(x) + 1, SKIN[6]); }
  // (the lid's folds over it, sagging; a few stubby grey lashes)
  for (let k = 1; k <= 2; k++) path(b, [ex - rx, lidAt(ex - rx) - k * 3, ex, lidAt(ex) - k * 3 - 1, ex + rx, lidAt(ex + rx) - k * 3], SKIN[5]);
  for (let k = 0; k < 8; k++) { const x = ex - rx + 4 + k * 5, y = lidAt(x); seg(b, x, y, x + ((x - ex) / rx) * 1.5, y + 2, HAIR[4]); }
  // (crust in the inner corner, yellow, and a wet glint along the lower lid)
  const ic = ex - outer * (rx - 2);
  ball(b, ic, ey + 3, 3, 2.4, [CRUST, CRUST, CRUST_D, CRUST_D, CRUST_D, hexU('#7A5A10')], { line: true, lw: 0.6, mat: M_OTHER });
  seg(b, ex - rx * 0.5, lowAt(ex) - 1, ex + rx * 0.4, lowAt(ex) - 1, hexU('#FFF4F0'), 1, undefined, M_SCLERA);
};

/** His teeth along the inside of the mouth: yellow, one gone brown, a gap. */
const teeth = (b: Buf, x0: number, x1: number, edge: (x: number) => number, dir: 1 | -1, h: number, gaps: number[], brown: number[]) => {
  for (let i = 0, x = x0; x < x1; i++, x += 6) {
    if (gaps.includes(i)) continue;
    for (let tx = 0; tx < 5; tx++) for (let ty = 0; ty < h; ty++) {
      const y = Math.round(edge(x + tx) + dir * ty);
      if (matAt(b, x + tx, y) !== M_MOUTH) continue;
      const ramp = brown.includes(i) ? BROWN : TOOTH;
      let k = tx === 0 ? 0 : tx === 4 ? 3 : ty > h - 2 ? 2 : 1;
      if (ty === 0) k = 4;
      if (bay(x + tx, y) > 0.8 && k < 3) k++;
      plot(b, x + tx, y, ramp[k], M_OTHER);
    }
  }
};

const mouth = (b: Buf, n: number) => {
  const cx = FX - 4, cy = 168;
  if (n > 0) {
    const mw = 30, mh = 4 + n * 4;
    ball(b, cx, cy + n, mw, mh, MOUTH, { mat: M_MOUTH, flat: 0.3, lit: 0.55 });
    if (n >= 2) ball(b, cx + 2, cy + n + mh - 4, 15, 5 + n, TONGUE, { mat: M_MOUTH, only: (x, y) => matAt(b, x, y) === M_MOUTH });
    const top = (x: number) => cy + n - mh * Math.sqrt(Math.max(0, 1 - ((x - cx) / mw) ** 2)) + 1;
    const bot = (x: number) => cy + n + mh * Math.sqrt(Math.max(0, 1 - ((x - cx) / mw) ** 2)) - 1;
    teeth(b, cx - 22, cx + 22, top, 1, 4 + n, [3], [5]);
    if (n >= 2) teeth(b, cx - 16, cx + 16, bot, -1, 3, [1, 4], []);
    // (spit strung across it)
    for (const sx of [cx - 10, cx + 12]) for (let y = Math.round(top(sx) + 4); y < bot(sx) - 2; y++) if (bay(sx, y) < 0.7) plot(b, sx + Math.round(Math.sin(y * 0.5)), y, hexU('#F0E8F0'));
  }
  // (the lips: thin, chapped, wet, the bottom one hanging)
  ball(b, cx, cy - 4 - n * 0.4, 30, 5, LIP, { mat: M_LIP, line: (_dx, dy) => dy < 0.2, lit: 1.0 });
  ball(b, cx, cy + 6 + n * 2, 28, 7, LIP, { mat: M_LIP, line: (_dx, dy) => dy > -0.1, lit: 1.2 });
  if (!n) path(b, [cx - 30, cy + 1, cx - 12, cy + 2, cx, cy + 1, cx + 12, cy + 2, cx + 30, cy], LIP[5], 2);
  for (let x = cx - 30; x < cx + 30; x += 3) for (let y = cy - 10; y < cy + 16; y++) if (matAt(b, x, y) === M_LIP && hash2(x, y) > 0.55) plot(b, x, y, LIP[4]);
  seg(b, cx - 8, cy + 6 + n * 2, cx + 6, cy + 6 + n * 2, WHITE, 1, undefined, M_LIP);
  // (beer foam on the upper lip and caught in the stubble over it, a mustache of it, bubbles)
  for (let k = 0; k < 26; k++) {
    const x = cx - 26 + rnd() * 52, y = cy - 12 - n * 0.4 + rnd() * 3, r = 1.2 + rnd() * 2;
    ball(b, x, y, r, r * 0.85, FOAM, { line: (_dx, dy) => dy > 0.4, lw: 0.5, mat: M_OTHER });
  }
  for (let k = 0; k < 8; k++) { const x = cx - 24 + rnd() * 48, y = cy - 10 + rnd() * 3; plot(b, x, y, WHITE); }
};

// ---------------------------------------------------------------------------------------------------------------
// The caches

const bases = new Map<boolean, Buf>();
/** The bases being painted ahead a step at a time (warmGrossUps), each with its own dice. */
const baseJobs = new Map<boolean, ReturnType<typeof stepper<Buf>>>();
const baseJob = (squint: boolean) => {
  let j = baseJobs.get(squint);
  if (!j) { j = stepper(() => buildBase(squint), { get: () => seed, set: s => { seed = s; } }); baseJobs.set(squint, j); }
  return j;
};
// (ahead: each base a step at a time, then every stamp off it (a mouth shape each: cheap) one at a time)
paintAhead(until => {
  for (const v of [false, true]) {
    if (!bases.has(v)) { const j = baseJob(v); if (!j.run(until)) return false; bases.set(v, j.finish()); }
    for (let n = 0; n < 4; n++) {
      if (stamps.has(`${v ? 1 : 0}${n}`)) continue;
      stamp(v, n);
      if (performance.now() >= until) return false;
    }
  }
  return true;
});
const stamps = new Map<string, HTMLCanvasElement>();
const stamp = (squint: boolean, n: number): HTMLCanvasElement | null => {
  const key = `${squint ? 1 : 0}${n}`;
  const hit = stamps.get(key);
  if (hit) return hit;
  if (typeof document === 'undefined') return null;
  let base = bases.get(squint);
  if (!base) { base = baseJob(squint).finish(); bases.set(squint, base); }
  const b: Buf = { px: base.px.slice(), mat: base.mat.slice(), tone: base.tone };
  seed = squint ? 51 : 53;
  eye(b, FX - 38, 92, -1, squint, squint ? 0.35 : 0.5);
  eye(b, FX + 38, 92, 1, false, squint ? 0.4 : 0.5);
  mouth(b, n);
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

/** His gross-up: (cx, cy) the middle of his face on screen, `zoom` 1 at the hold (each of its pixels GP screen
 *  pixels), less as it lurches in. `squint`: one eye screwed shut, peering; else bleary. */
export const drawDadGross = (c: Ctx, cx: number, cy: number, zoom: number, f: number, squint: boolean, talking: boolean) => {
  const n = talking ? [0, 2, 3, 1][Math.floor(f / 5) % 4] : 0;
  const img = stamp(squint, n);
  if (!img) return;
  const S = GP * zoom;
  // (a slow drunk sway, a lurch now and then)
  const jx = Math.round(Math.sin(f * 0.035) * 2 + (hash2(Math.floor(f / 11), 3) > 0.75 ? (hash2(Math.floor(f / 11), 5) - 0.5) * 2 : 0));
  const jy = Math.round(Math.sin(f * 0.05) * 1.2);
  c.save();
  c.translate(Math.round(cx - (FX - jx) * S), Math.round(cy - (FY - jy) * S));
  c.scale(S, S);
  c.imageSmoothingEnabled = false;
  c.drawImage(img, 0, 0);
  const box = (x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  // (a bead of sweat running down off his temple, again and again)
  { const t = (f % 140) / 140, x = FX - 86 + Math.sin(t * 9) * 1.2, y = 50 + t * 50; box(x, y, 2, 3, '#FFF4EA'); box(x, y, 1, 1, '#FFFFFF'); box(x + 1, y + 2, 1, 1, '#CC866E'); }
  // (the foam dripping off his lip, a drop at a time)
  { const L = (f * 0.25) % 22, x = FX + 14, y = 166 - n * 0.4; box(x, y, 1, Math.round(L * 0.5), '#FFFBEA'); box(x - 1, y + L, 3, 3, '#FFFFFF'); box(x + 1, y + L + 2, 1, 1, '#C4AE6C'); }
  // (drool stringing off the bottom lip)
  { const L = (f * 0.3) % 30, x = FX - 20, y = 178 + n * 2; c.globalAlpha = 0.85; box(x, y, 1, Math.round(L), '#E4ECF8'); box(x - 1, y + L, 3, 3, '#EEF4FC'); box(x - 1, y + L, 1, 1, '#FFFFFF'); c.globalAlpha = 1; }
  // (a fly, round and round his nose, landing on it now and then)
  {
    const ph = f % 220, land = ph > 150 && ph < 200;
    const a = f * 0.21, x = land ? FX + 6 : FX + Math.cos(a) * 46 + Math.sin(a * 2.3) * 8, y = land ? 112 : 112 + Math.sin(a) * 26 + Math.cos(a * 1.7) * 6;
    box(x - 1, y - 1, 3, 2, '#141418'); box(x - 1, y - 1, 1, 1, '#5A2A2A'); box(x + 1, y - 1, 1, 1, '#5A2A2A');
    if (!land || (f >> 3) % 2) { c.globalAlpha = 0.6; box(x - 2, y - 3 - (f % 2), 2, 2, '#E8F0FA'); box(x + 1, y - 3 - ((f + 1) % 2), 2, 2, '#E8F0FA'); c.globalAlpha = 1; }
  }
  c.restore();
};
