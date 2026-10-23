// TUCKER'S CLOSE-UPS AS GROSS-UPS (the user: "all closeups for tucker is a 'ren and stimpy' style"; the gross-up rule,
// grossKit.ts). Every `drawTuckerCloseup` at close-up size (the train's eye shot and its insult inset, the log ride's
// saw, the catch-up's branch, the arena entry's split, the bounty and the fight's jumpscares, the station's pitch, the
// chase's inset, the fight's mauling and the lions) paints him here: the same head in the same place (the same 3/4 view,
// facing right, in tucker.ts's head units, so every wound painter still lands where it did), painted per pixel in the
// kit's buffers at 4 px a head unit: lumpy pink (or rage red) skin with its pores, blackheads, broken capillaries,
// stubble, sweat beads, a hairy mole, a pimple on the purple button nose, veins up his temples, a hairy ear; beady
// bloodshot eyes swimming behind the wire spectacles (bags under them, crow's feet), the ginger muttonchops and the waxed
// handlebar strand by strand (a snot glob in it), the cracked lips, the gums, the gap teeth (one gold, two rotten),
// spit strung across; the conductor's cap with its tarnished plate, dandruff, a sweat stain; his wounds in the gross-up's
// detail (the shot-out socket torn, the brain matter at its rim, daylight through it and the exit hole behind his ear;
// the buzzsaw sunk through the cap into the bone, its teeth caked with blood and hair; the split's sheets of blood; the
// branch through his chest, splintered, the vest torn round it, a rib shard out of the hole; the lions' rakes; the soul
// sucker's blood).
//
// Painted once per state and kept (layers: the head's base, its eyes and brows, its mouth, its mustache, what's on top
// (the spectacles, the cap, the wounds), the shoulders): a face's mouth shapes and eye states are their own small
// layers, so a talking close-up only ever flips between stamps. The wound painters' animated frames (each mutilation
// happening) go through `gore`: drawn into the same 4 px grid, dithered and inked to match, repainted only when their
// frame state changes (every other frame at most), never the stamps under them.

import type { TuckerFace, TuckerWounds } from './tucker';
import {
  type Ctx, type Buf, type BallO, R, hexU, mixU, WHITE, newBuf, setSeed, rnd, matAt, plot, shade, seg, path, ball, tint, poly, walk, bead, vein, hairs,
  stubble, inkEdges, skinPost, eyeball, teeth, toCanvas, paintAhead, bay, hash2, M_SKIN, M_HAIR, M_LIP, M_MOUTH, M_OTHER, M_METAL, M_CLOTH,
  SCLERA, SCLERA_R, SCLERA_Y, MOUTH, TONGUE, GUM, TOOTH_B, BLOOD,
} from '../grossKit';

// ---------------------------------------------------------------------------------------------------------------
// The grid: 4 buffer pixels a head unit; the head's buffer from (-34, -31), the shoulders' from (-38.5, 5)

const U = 4;
const HEAD: readonly [number, number] = [-34, -31];
const BODY: readonly [number, number] = [-38.5, 5];
/** A buffer's size in head units (the kit's buffers are 272 x 204). */
const BW = 272 / U, BH = 204 / U;
let OX = 0, OY = 0;
const at = (fr: readonly [number, number]) => { OX = fr[0]; OY = fr[1]; };
const X = (u: number) => (u - OX) * U, Y = (v: number) => (v - OY) * U, L = (n: number) => n * U;
const P = (pts: number[]) => pts.map((p, i) => (i % 2 ? Y(p) : X(p)));
const uball = (b: Buf, u: number, v: number, ru: number, rv: number, ramp: number[], o?: BallO) => ball(b, X(u), Y(v), L(ru), L(rv), ramp, o);
const upath = (b: Buf, pts: number[], col: number, w = 1, mat?: number, onMat?: number) => path(b, P(pts), col, w, mat, onMat);
const upoly = (b: Buf, pts: number[], ramp: number[], mat?: number, o?: { line?: boolean; tilt?: number }) => poly(b, P(pts), ramp, mat, o);
/** A path of straight and quadratic parts as points: `[x, y]` a line to there, `[cx, cy, x, y]` a curve. */
const quads = (x0: number, y0: number, parts: number[][], n = 6) => {
  const out = [x0, y0];
  let px = x0, py = y0;
  for (const s of parts) {
    if (s.length === 2) { out.push(s[0], s[1]); px = s[0]; py = s[1]; continue; }
    const [cx, cy, x, y] = s;
    for (let i = 1; i <= n; i++) { const t = i / n, a = (1 - t) * (1 - t), m = 2 * (1 - t) * t, e = t * t; out.push(a * px + m * cx + e * x, a * py + m * cy + e * y); }
    px = x; py = y;
  }
  return out;
};
/** Scaled about a point (the gross-up's features a touch bigger than the figure's). */
const grow = (pts: number[], cx: number, cy: number, k: number) => pts.map((p, i) => (i % 2 ? cy + (p - cy) * k : cx + (p - cx) * k));

// ---------------------------------------------------------------------------------------------------------------
// Colors (light .. deep, then the line)

const SKIN = R('#FFF4E4', '#FFDCC2', '#F4C0A0', '#E0A282', '#C8846A', '#A4644E', '#6E3E30', '#3A1A12');
const RAGE = R('#FFD0BC', '#FFAE98', '#F48A78', '#E06A5C', '#C44A44', '#9A3032', '#6A1A1E', '#3A0808');
const NOSE = R('#F4B8C4', '#E094A8', '#C8708C', '#A85072', '#843858', '#5A2040', '#2E0A1E');
const GINGER = R('#FFD8A8', '#F6B884', '#DC8A4E', '#B4642E', '#86441C', '#5A2A10', '#2E1406');
const IRIS = R('#B8DCF8', '#7CAEE0', '#4A7AB0', '#2E5486', '#18325A', '#081428');
const LIP = R('#F4A8A0', '#E08682', '#C46462', '#A04648', '#782E32', '#4A161A', '#260808');
const CANAL = R('#5A1A14', '#3A0C08', '#240404', '#140202', '#080101', '#000000');
const PIMPLE = R('#FFFCE0', '#FFE89A', '#F4B070', '#E07A5A', '#B04A40', '#5A1A14');
const MOLE = R('#8A5A3A', '#6A4028', '#4E2C1A', '#36200E', '#20120A', '#0E0804');
const SNOT = R('#F8FCC8', '#E4F09A', '#C8DC6A', '#A8BC4A', '#7A8A2E', '#3A4210');
const VEIN_R = R('#FFB8A8', '#E88A7A', '#C86A5C', '#A04C44', '#78302C', '#401414');
const COAT = R('#8494C8', '#5A6CA2', '#3E4E86', '#2E3C6A', '#1E2A4E', '#121A34', '#060A18');
const VEST = R('#E68482', '#C25A58', '#A0363C', '#7E262E', '#5A1820', '#3A0C12', '#1E0408');
const SHIRT = R('#FFFFFF', '#F6F2E8', '#E2DCCC', '#C4BCAA', '#9A9282', '#5E5A50');
const TIE = R('#6A6A74', '#3A3A42', '#24242A', '#16161A', '#0A0A0E', '#000000');
const BRASS = R('#FFFCE0', '#FFE88A', '#F4CC4E', '#CC9E2C', '#926E16', '#4A3608');
const PATENT = R('#B0B0BC', '#6A6A76', '#2E2E36', '#1C1C22', '#101014', '#020203');
const STEEL = R('#FFFFFF', '#E2E6EC', '#C4C8CE', '#A2A6AE', '#7A7E86', '#52565E', '#2A2C32');
const BARK = R('#C8A67A', '#A8865A', '#7A5634', '#5A3C20', '#3E2812', '#1E1208');
const WOOD = R('#FFF0CC', '#F0D8A8', '#D8B886', '#B8966A', '#8A6A44', '#4A3218');
const MEAT = R('#F0606A', '#C82C36', '#9A1820', '#741016', '#4E080C', '#280204');
const HOLE = R('#3A0606', '#260202', '#160101', '#0A0000', '#000000', '#000000');
const BONE = R('#FFFDF4', '#F5EEDC', '#E2D6BC', '#C4B494', '#9A8868', '#5A4C34');
const BRAIN = R('#FFE4EA', '#F8C4D0', '#E89EB0', '#CC7C94', '#A45874', '#5A2234');
const SKYR = R('#FFFFFF', '#E6F4FE', '#BFE0F8', '#9ACAEE', '#7AB2E0', '#4A82B0');
const LEAF = R('#FFC060', '#F4A040', '#D9741E', '#B05A14', '#8A3A10', '#4A1C06');
const MUCK = R('#7A7A46', '#5E5E34', '#4A4A26', '#3A3A1C', '#2A2A12', '#16160A');
const WIRE = hexU('#8A7A3A'), WIRE_D = hexU('#4A3C14'), WIRE_L = hexU('#E8D890');
const B = (i: number) => BLOOD[i];

// The head's landmarks (tucker.ts's head units)
const EYE_Y = -2.6, FAR_EYE = -1.2, NEAR_EYE = 6.4, MX = 5.2, MY = 8;

// ---------------------------------------------------------------------------------------------------------------
// Small brushes

/** Letters 3x5 (the cap's plate, the badge). */
const GLYPH: Record<string, string> = {
  C: '111100100100111', O: '111101101101111', N: '101111111111101', D: '110101101101110', U: '101101101101111',
  T: '111010010010010', R: '110101110101101', K: '101101110101101', E: '111100110100111',
};
const letters = (b: Buf, text: string, x: number, y: number, col: number, lit?: number) => {
  for (let i = 0; i < text.length; i++) {
    const g = GLYPH[text[i]]; if (!g) continue;
    for (let k = 0; k < 15; k++) if (g[k] === '1') { plot(b, x + i * 4 + (k % 3), y + Math.floor(k / 3), col); if (lit !== undefined && k < 3) plot(b, x + i * 4 + (k % 3), y - 1, lit); }
  }
};
/** A splash of blood: a flat blob, droplets flung round it, a wet glint. */
const clot = (b: Buf, u: number, v: number, r: number) => {
  uball(b, u, v, r, r * 0.72, [B(1), B(2), B(3), B(4), B(5)], { mat: M_OTHER, line: (_dx, dy) => dy > 0.35, lw: 0.8, flat: 0.4 });
  for (let k = 0; k < 6; k++) { const a = rnd() * Math.PI * 2, d = r * (1.25 + rnd() * 0.9), x = X(u + Math.cos(a) * d), y = Y(v + Math.sin(a) * d * 0.75); plot(b, x, y, B(3)); if (k % 2) plot(b, x + 1, y, B(4)); }
  plot(b, X(u - r * 0.4), Y(v - r * 0.3), B(0));
};
/** A run of blood down along `pts` (head units), `w` px wide at its head and tapering: lit down its left edge, dark
 *  down its right, a teardrop hanging off its foot. */
const run = (b: Buf, pts: number[], w: number) => {
  const q = P(pts);
  let len = 0;
  for (let i = 2; i < q.length; i += 2) len += Math.hypot(q[i] - q[i - 2], q[i + 1] - q[i - 1]);
  let done = 0, lx = q[0], ly = q[1];
  for (let i = 2; i < q.length; i += 2) {
    const x0 = q[i - 2], y0 = q[i - 1], x1 = q[i], y1 = q[i + 1], n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (let j = 0; j <= n; j++) {
      const x = x0 + ((x1 - x0) * j) / n, y = y0 + ((y1 - y0) * j) / n, t = (done + (Math.hypot(x1 - x0, y1 - y0) * j) / n) / Math.max(1, len);
      const ww = Math.max(1, Math.round(w * (1 - 0.45 * t)));
      for (let k = 0; k < ww; k++) plot(b, x - ww / 2 + k, y, ww === 1 ? B(3) : k === 0 ? B(1) : k === ww - 1 ? B(5) : k === 1 ? B(2) : B(3), M_OTHER);
      lx = x; ly = y;
    }
    done += Math.hypot(x1 - x0, y1 - y0);
  }
  const r = Math.max(1, w * 0.45);
  ball(b, lx, ly + r * 0.9, r, r * 1.3, [B(1), B(2), B(3), B(4), B(5)], { mat: M_OTHER, line: (_dx, dy) => dy > 0.2, lw: 0.8 });
  plot(b, lx - r * 0.3, ly + r * 0.5, B(0));
};
/** A wound torn open: a ragged rim of meat (chips of bone at it, brain bulging, `brain`), the hole dark in it. */
const tear = (b: Buf, u: number, v: number, rx: number, ry: number, o: { brain?: boolean; bone?: boolean } = {}) => {
  const rim: number[] = [], hole: number[] = [];
  for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2, r = (i % 2 ? 0.78 : 1) * (0.85 + rnd() * 0.3); rim.push(u + Math.cos(a) * rx * r, v + Math.sin(a) * ry * r); hole.push(u + 0.1 + Math.cos(a) * rx * r * 0.5, v + 0.1 + Math.sin(a) * ry * r * 0.5); }
  upoly(b, rim, MEAT, M_OTHER, { tilt: 0.3 });
  upoly(b, hole, HOLE, M_OTHER, { line: false });
  for (let k = 0; k < 8; k++) { const a = rnd() * Math.PI * 2, r = 0.6 + rnd() * 0.3; plot(b, X(u + Math.cos(a) * rx * r), Y(v + Math.sin(a) * ry * r), MEAT[0]); }
  if (o.bone) for (let k = 0; k < 4; k++) { const a = -2.6 + k * 0.5, x = u + Math.cos(a) * rx * 0.85, y = v + Math.sin(a) * ry * 0.85; upoly(b, [x - 0.3, y - 0.2, x + 0.4, y - 0.4, x + 0.2, y + 0.3], BONE, M_OTHER); }
  if (o.brain) for (let k = 0; k < 3; k++) { const a = -1.8 + k * 1.1; uball(b, u + Math.cos(a) * rx * 0.45, v + Math.sin(a) * ry * 0.45, Math.min(rx, ry) * 0.28, Math.min(rx, ry) * 0.24, BRAIN, { mat: M_OTHER, line: true, lw: 0.7 }); }
};
/** A dead leaf (the woods' pile): its blade, its vein, inked. */
const leaf = (b: Buf, u: number, v: number, rot: number, s = 1) => {
  const pts: number[] = [];
  for (const [x, y] of [[-2.3, 0], [-1.2, -1.1], [0.4, -1.2], [2.3, 0], [0.6, 1.1], [-1.2, 1]] as const) pts.push(u + (x * Math.cos(rot) - y * Math.sin(rot)) * s, v + (x * Math.sin(rot) + y * Math.cos(rot)) * s);
  upoly(b, pts, LEAF, M_OTHER, { tilt: 0.6 });
  upath(b, [u - 2 * Math.cos(rot) * s, v - 2 * Math.sin(rot) * s, u + 2 * Math.cos(rot) * s, v + 2 * Math.sin(rot) * s], LEAF[4]);
};
/** A wood chip (the chipper's). */
const chip = (b: Buf, u: number, v: number, rot: number) => {
  const c = Math.cos(rot), s = Math.sin(rot), pts: number[] = [];
  for (const [x, y] of [[-1.1, -0.5], [1.1, -0.4], [1, 0.5], [-1.1, 0.4]] as const) pts.push(u + x * c - y * s, v + x * s + y * c);
  upoly(b, pts, WOOD.slice(1), M_OTHER);
};

// ---------------------------------------------------------------------------------------------------------------
// THE BASE: his skull, jowls and double chin, the hairy ear, the nose, the cheeks, the chops, every pore

function paintBase(red: boolean, capless: boolean): Buf {
  at(HEAD); setSeed(red ? 7331 : 1337 + (capless ? 5 : 0));
  const b = newBuf(), S = red ? RAGE : SKIN, ln = S[7];
  // ---- the skull: round and jowly, the near jowl sagging, a double chin under it
  uball(b, 0.4, -3.4, 11, 10.6, S, { mat: M_SKIN });
  uball(b, 1.1, 3.8, 10.9, 9.8, S, { mat: M_SKIN });
  uball(b, 7.2, 7.8, 5, 4.8, S, { mat: M_SKIN, lit: 1.05 });
  uball(b, 2.4, 12.4, 7, 2.6, S, { mat: M_SKIN });
  // ---- the far ear: fleshy, its rim, the hole, hairs out of it
  uball(b, -9.6, 0.4, 3.2, 4.4, S, { mat: M_SKIN, lit: 0.95 });
  uball(b, -9.2, 0.8, 1.8, 2.9, S.slice(2), { mat: M_SKIN, soft: 0.35 });
  uball(b, -8.9, 1.3, 0.8, 1.1, CANAL, { mat: M_OTHER });
  for (let a = -1.3; a <= 1.3; a += 0.03) plot(b, X(-9.6 + Math.cos(a) * 3.1), Y(0.4 + Math.sin(a) * 4.3), S[6]);
  for (let a = 1.7; a <= 4.4; a += 0.03) plot(b, X(-9.4 + Math.cos(a) * 2.2), Y(0.6 + Math.sin(a) * 3.3), S[5]);
  hairs(b, 9, () => [X(-9.2) + rnd() * 3, Y(0.8) + rnd() * 5], 7, Math.PI * 0.95, GINGER[3], undefined, 0.9);
  inkEdges(b, M_SKIN, ln, [M_OTHER]);
  // ---- the sockets sunk dark round the eyes; the bags under them, puffy, creased
  tint(b, X(FAR_EYE), Y(EYE_Y + 0.2), L(3), L(2.9), S[4], 0.32, M_SKIN, 0.6);
  tint(b, X(NEAR_EYE), Y(EYE_Y + 0.2), L(3.4), L(3.2), S[4], 0.32, M_SKIN, 0.6);
  uball(b, FAR_EYE, 0.5, 2.4, 1.1, S, { mat: M_SKIN, lit: 0.85, soft: 0.4 });
  uball(b, NEAR_EYE, 0.8, 2.9, 1.3, S, { mat: M_SKIN, lit: 0.85, soft: 0.4 });
  upath(b, [-3.4, 0.4, -1.2, 1.7, 0.9, 0.8], S[6]); upath(b, [-3, 1.4, -1.2, 2.3, 0.4, 1.8], S[5]);
  upath(b, [3.8, 0.8, 6.4, 2.2, 9.2, 0.8], S[6]); upath(b, [4.6, 1.9, 6.6, 2.9, 8.8, 2], S[5]);
  // (crow's feet out of both corners)
  for (const [x0, y0, x1, y1] of [[9.4, -3.6, 11, -4.6], [9.7, -2.5, 11.4, -2.4], [9.4, -1.5, 10.9, -0.6], [-3.6, -3.4, -5, -4.2], [-3.8, -2.4, -5.3, -2.3], [-3.6, -1.5, -4.9, -0.8]] as const) upath(b, [x0, y0, (x0 + x1) / 2, (y0 + y1) / 2 + 0.15, x1, y1], S[6]);
  // ---- the cheeks: apple-round and blotchy, broken capillaries all over them
  const cheek = hexU(red ? '#B0202E' : '#E0587A');
  tint(b, X(7.8), Y(3.4), L(3.9), L(3.3), cheek, red ? 0.3 : 0.38, M_SKIN, 0.7);
  tint(b, X(-3.6), Y(3.8), L(2.6), L(2.2), cheek, red ? 0.25 : 0.32, M_SKIN, 0.7);
  for (let k = 0; k < 14; k++) {
    const cx = k < 9 ? 7.8 : -3.6, cy = k < 9 ? 3.4 : 3.8;
    walk(X(cx + (rnd() - 0.5) * 6), Y(cy + (rnd() - 0.5) * 4), rnd() * 6.28, 5 + rnd() * 7, 1.4, (x, y) => { if (matAt(b, x, y) === M_SKIN) plot(b, x, y, hexU(k % 3 ? '#C02848' : '#9A1834')); });
  }
  // ---- the veins up his temple (and his forehead, the cap off), bulging when he's red
  vein(b, P([-8.4, -3.4, -7.8, -6.4, -8.6, -9.2]), VEIN_R, red ? 3 : 2);
  if (capless) vein(b, P([1.2, -13, 1.8, -11, 0.9, -8.6]), VEIN_R, red ? 3 : 2);
  // ---- the forehead: crumpled (the cap off), or the cap's shadow across it
  if (capless) {
    for (let i = 0; i < 4; i++) { const y = -12.4 + i * 1.3; upath(b, [-7, y + 0.3, -3, y - 0.2, 1, y + 0.2, 5, y - 0.3, 8.6, y + 0.4], S[6]); upath(b, [-6.6, y + 0.6, -3, y + 0.2, 1, y + 0.5, 5, y], S[1]); }
    // (the comb-over: a few greasy strands slicked across the bald dome, liver spots, dandruff)
    for (let i = 0; i < 7; i++) {
      const pts = quads(-9.6 + i * 0.3, -6.8 - i * 0.6, [[-3 + i * 0.4, -15.4 + i * 0.25, 7.4 + i * 0.5, -11.6 - i * 0.2]], 10);
      upath(b, pts, GINGER[4], 1, undefined, M_SKIN); upath(b, pts.map((p, j) => (j % 2 ? p - 0.25 : p)), GINGER[i % 2 ? 1 : 2], 1, undefined, M_SKIN);
    }
    for (const [x, y, r] of [[-5, -10.6, 1.1], [3.4, -12.4, 0.8], [-1.4, -12.8, 0.6]] as const) tint(b, X(x), Y(y), L(r), L(r * 0.8), hexU('#A06A3A'), 0.4, M_SKIN, 0.5);
    for (let k = 0; k < 30; k++) { const x = X(-8 + rnd() * 16), y = Y(-13 + rnd() * 4); if (matAt(b, x, y) === M_SKIN) plot(b, x, y, hexU('#FFFDF0')); }
  } else {
    for (let y = Math.floor(Y(-10.2)); y < Y(-7); y++) for (let x = 0; x < 272; x++) {
      const v = y / U + OY;
      if (matAt(b, x, y) !== M_SKIN) continue;
      if (v < -8.4 || bay(x, y) < (-7 - v) / 1.6) shade(b, x, y, S[6], 0.45);
    }
    upath(b, [-7, -7.2, -3, -7.5, 1, -7.2], S[6]);
  }
  // ---- the nose: the bridge, a button bulb gone purple, its wing, the nostril (hairs out of it), a ripe pimple
  uball(b, 3.9, 0.2, 1.5, 2.4, S, { mat: M_SKIN });
  uball(b, 4.4, 3.5, 1.5, 1.1, S, { mat: M_SKIN, line: (_dx, dy) => dy > 0.25 });
  uball(b, 6.5, 2.6, 2.5, 2.2, red ? R('#F49090', '#DC6A78', '#C04A62', '#A0324E', '#7A2040', '#541230', '#2A0618') : NOSE, { mat: M_SKIN, lit: 1.1, line: (dx, dy) => dy > 0.1 || dx > 0.55 });
  uball(b, 4.9, 4.05, 0.9, 0.45, CANAL, { mat: M_OTHER });
  for (let k = 0; k < 4; k++) seg(b, X(4.5 + k * 0.25), Y(4.2), X(4.3 + k * 0.4), Y(5.0 + rnd() * 0.4), GINGER[3 + (k % 2)]);
  uball(b, 7.9, 1.2, 0.75, 0.75, PIMPLE, { mat: M_OTHER, line: true, lw: 0.8 }); plot(b, X(7.75), Y(1.0), WHITE); plot(b, X(7.75) + 1, Y(1.0), WHITE);
  tint(b, X(7.9), Y(1.2), L(1.5), L(1.4), hexU('#D03040'), 0.3, M_SKIN, 0.6);
  // ---- the creases: the double chin's, the jowl's, from the nose down round the mouth, the chin's dimple
  upath(b, [-2, 11.4, 2.4, 12.8, 6.8, 11.2], S[6]); upath(b, [-1.4, 12, 2.4, 13.4, 6.2, 12], S[1]);
  upath(b, [10.2, 3.4, 10.8, 6.6, 9.6, 10], S[6]); upath(b, [3.3, 4.4, 2.3, 6.6, 2.4, 9.6], S[6]); upath(b, [9.4, 4.4, 10.2, 7.2, 9.2, 10.6], S[5]);
  upath(b, [5.6, 11.2, 5.3, 12, 5.7, 12.6], S[6]);
  // ---- a hairy mole on the far cheek
  uball(b, -4.4, 6.8, 0.75, 0.65, MOLE, { mat: M_OTHER, line: true, lw: 0.8 });
  for (let k = 0; k < 3; k++) seg(b, X(-4.4 + (k - 1) * 0.3), Y(6.6), X(-4.4 + (k - 1) * 1.3), Y(5.4 - k * 0.2), GINGER[4 - k]);
  // ---- the skin's going-over: stubble on his jowls and chin, the pores (thick on the nose and the cheeks), blackheads,
  // grease shining on the lit side
  stubble(b, (_x, y) => { const v = y / U + OY; return v > 6.8 ? Math.min(1, (v - 6.8) / 2.2) : 0; }, GINGER[4], 0.42);
  skinPost(b, S[6], (x, y) => {
    const u = x / U + OX, v = y / U + OY;
    return ((u - 6.4) / 2.6) ** 2 + ((v - 2.6) / 2.2) ** 2 < 1 ? 0.2 : ((u - 7.8) / 4) ** 2 + ((v - 3.4) / 3.4) ** 2 < 1 ? 0.15 : 0.08;
  }, { blackheads: (x, y) => ((x / U + OX - 6.2) / 3) ** 2 + ((y / U + OY - 2.4) / 2.6) ** 2 < 1, shine: 0.2 });
  // ---- the muttonchops: ginger, bushy, strand by strand, strays off their edges
  const chops = [
    quads(-6.4, -8.4, [[-3.4, -8.6], [-2.2, -1, 0.6, 5.4], [-3, 9.6, -6.4, 7.6], [-8.2, 0, -6.4, -8.4]]),
    quads(10.6, -4, [[12.4, 2, 10.9, 7.2], [8.6, 8.8, 7.5, 6.6], [10, 2, 9.3, -3.6], [10.6, -4]]),
  ];
  for (const pts of chops) upoly(b, pts, GINGER, M_HAIR, { line: false, tilt: 0.2 });
  for (let k = 0; k < 900; k++) {
    const far = k % 2 === 0, x = X(far ? -8.4 + rnd() * 9.2 : 7.4 + rnd() * 5.2), y = Y(far ? -8.6 + rnd() * 18.4 : -4 + rnd() * 12.8);
    if (matAt(b, x, y) !== M_HAIR) continue;
    const a = Math.PI / 2 + (far ? 0.3 : -0.3) + (rnd() - 0.5) * 0.8, l = 4 + rnd() * 6;
    seg(b, x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, GINGER[[0, 1, 2, 2, 3, 3, 4, 5][k % 8]], 1, undefined, M_HAIR);
  }
  for (let k = 0; k < 70; k++) {
    const far = k % 2 === 0, x = X(far ? -8.4 + rnd() * 9.2 : 7.4 + rnd() * 5.2), y = Y(far ? -8.6 + rnd() * 18.4 : -4 + rnd() * 12.8);
    if (matAt(b, x, y) !== M_HAIR || (matAt(b, x - 3, y) === M_HAIR && matAt(b, x + 3, y) === M_HAIR && matAt(b, x, y + 3) === M_HAIR)) continue;
    const a = (far ? Math.PI * 0.75 : Math.PI * 0.25) + (rnd() - 0.5) * 1.4;
    seg(b, x, y, x + Math.cos(a) * (3 + rnd() * 5), y + Math.sin(a) * (3 + rnd() * 5), GINGER[k % 3 ? 3 : 1]);
  }
  inkEdges(b, M_HAIR, GINGER[6]);
  // ---- sweat: beaded on his brow and temples and the end of his nose (more of it red)
  for (let k = 0; k < (red ? 18 : 11); k++) {
    const x = X(capless ? -7 + rnd() * 15 : -6 + rnd() * 16), y = Y(capless ? -12.6 + rnd() * 5 : -7.4 + rnd() * 1.6);
    if (matAt(b, x, y) === M_SKIN) bead(b, x, y, 1.2 + rnd() * 1.6, S);
  }
  for (const [u, v] of [[-8.6, -6], [-8.2, -1.6], [10.9, -6.2], [6.9, 3.9], [2.2, 4.6]] as const) if (matAt(b, X(u), Y(v)) === M_SKIN) bead(b, X(u), Y(v), 1.5, S);
  return b;
}

// ---------------------------------------------------------------------------------------------------------------
// THE EYES AND BROWS (by face: beady and bloodshot, bulging, squeezed shut, rolled back...)

interface EyeOpen { rx: number; ry: number; idx: number; idy: number; ir: number; pr: number; top?: number; bot?: number; slope?: number; smile?: boolean; veins: number; dy?: number; sclera?: number[] }
interface EyeShut { shut: 'happy' | 'squeeze' | 'line'; rx: number; ry: number }
type EyeDef = EyeOpen | EyeShut;
/** A brow: tilt (+: down to the right), lift. */
type Brow = [number, number];

const viseme = (f: number) => {
  const k = Math.floor(f / 5) % 8;
  return [{ o: 0.4, w: 0.8 }, { o: 2.2, w: 1 }, { o: 1.2, w: 1.2 }, { o: 3, w: 0.9 }, { o: 0.6, w: 1.3 }, { o: 2.6, w: 1 }, { o: 1.6, w: 0.7 }, { o: 0.2, w: 1 }][k];
};
const sgn3 = (v: number) => (v > 0.5 ? 1 : v < -0.5 ? -1 : 0);

const eyesFor = (face: TuckerFace, f: number): { key: string; far: EyeDef; near: EyeDef; bf: Brow; bn: Brow } => {
  const shut = (s: EyeShut['shut'], key: string, bf: Brow, bn: Brow) => ({ key, far: { shut: s, rx: 2.1, ry: 1.9 }, near: { shut: s, rx: 2.5, ry: 2.2 }, bf, bn });
  switch (face) {
    case 'cheer': return shut('happy', 'cheer', [0.3, 0.6], [-0.3, 0.6]);
    case 'ow': return shut('squeeze', 'ow', [0.8, 0.4], [-0.8, 0.4]);
    case 'out': return { key: 'out', far: { rx: 2, ry: 1.9, idx: 0.2, idy: -1.7, ir: 1, pr: 0.45, top: 0.3, veins: 18 }, near: { rx: 2.4, ry: 2.3, idx: 0.2, idy: -2, ir: 1.15, pr: 0.5, top: 0.32, veins: 22 }, bf: [0.6, 0], bn: [-0.6, 0] };
    case 'daze': {
      const p = Math.floor((f * 0.2 * 8) / (Math.PI * 2)) % 8, a = (p * Math.PI) / 4;
      return { key: `daze${p}`, far: { rx: 2.1, ry: 2, idx: 0.7 + Math.cos(a) * 0.4, idy: Math.sin(a) * 0.5, ir: 0.95, pr: 0.5, top: 0.2, veins: 16 }, near: { rx: 2.5, ry: 2.4, idx: -0.8 - Math.cos(a) * 0.4, idy: -Math.sin(a) * 0.5, ir: 1.1, pr: 0.55, top: 0.22, veins: 18 }, bf: [0.6, 0], bn: [-0.6, 0] };
    }
    case 'shock': return { key: 'shock', far: { rx: 2.4, ry: 2.5, idx: 0.3, idy: 0, ir: 0.9, pr: 0.22, veins: 26, sclera: SCLERA }, near: { rx: 2.9, ry: 3, idx: 0.4, idy: 0, ir: 1.05, pr: 0.25, veins: 30, sclera: SCLERA }, bf: [0, 1.6], bn: [0, 1.8] };
    case 'manic': {
      const s = sgn3(Math.sin(f * 0.9) * 1.6);
      return { key: `manic${s}`, far: { rx: 1.7, ry: 1.1, idx: 0.1 + s * 0.2, idy: 0.1, ir: 0.5, pr: 0.2, top: 0.32, bot: 0.25, veins: 10, dy: 0.4 }, near: { rx: 3, ry: 3.1, idx: 0.4 + s * 0.3, idy: 0, ir: 1, pr: 0.2, veins: 34, dy: -0.4, sclera: SCLERA_Y }, bf: [-1.4, -0.8], bn: [-0.8, 2.6 + s * 0.4] };
    }
    case 'angry': case 'yell': {
      const y = face === 'yell';
      return { key: face, far: { rx: 2.1, ry: 2, idx: 0.6, idy: 0.2, ir: 0.95, pr: y ? 0.3 : 0.45, top: 0.36, slope: 0.4, veins: y ? 24 : 16, dy: 0.3 }, near: { rx: 2.5, ry: 2.4, idx: 0.5, idy: 0.2, ir: 1.1, pr: y ? 0.32 : 0.5, top: 0.36, slope: -0.4, veins: y ? 28 : 18, dy: 0.3 }, bf: [-1.1, -0.6], bn: [1.3, -0.6] };
    }
    default: {
      const lift = face === 'talk' ? Math.round(Math.max(0, Math.sin(f * 0.21)) * 2) * 0.4 : 0.6;
      if (f % 210 < 5) return shut('line', `blink${lift}`, [0.3, lift], [-0.3, lift]);
      return { key: `beady${lift}`, far: { rx: 1.9, ry: 1.8, idx: 0.5, idy: 0.1, ir: 0.8, pr: 0.38, top: 0.3, bot: 0.34, smile: true, veins: 12 }, near: { rx: 2.3, ry: 2.1, idx: 0.6, idy: 0.1, ir: 0.95, pr: 0.42, top: 0.3, bot: 0.34, smile: true, veins: 14 }, bf: [0.3, lift], bn: [-0.3, lift] };
    }
  }
};

function paintEyes(face: TuckerFace, f: number, red: boolean, nearOk: boolean, farOk: boolean): Buf {
  at(HEAD);
  const d = eyesFor(face, f), S = red ? RAGE : SKIN;
  setSeed(d.key.length * 977 + (red ? 3 : 0));
  const b = newBuf();
  const one = (ex: number, e: EyeDef) => {
    if ('shut' in e) {
      const ey = EYE_Y;
      uball(b, ex, ey, e.rx + 0.25, e.ry + 0.2, S, { mat: M_SKIN, lit: 0.95, line: true, lw: 1 });
      const crease = e.shut === 'happy' ? [ex - e.rx, ey + 0.5, ex, ey - 0.9, ex + e.rx, ey + 0.5] : e.shut === 'line' ? [ex - e.rx, ey - 0.2, ex, ey + 0.7, ex + e.rx, ey - 0.2]
        : ex < 2 ? [ex - e.rx, ey - 1.3, ex + e.rx * 0.6, ey, ex - e.rx, ey + 1.3] : [ex + e.rx, ey - 1.3, ex - e.rx * 0.6, ey, ex + e.rx, ey + 1.3];
      upath(b, crease, S[7], 2); upath(b, crease.map((p, i) => (i % 2 ? p - 0.4 : p)), S[1]);
      // (lashes off the lid's edge; the squeeze's wrinkles fanned round it)
      for (let k = 0; k < 5; k++) { const t = (k + 0.5) / 5, x = ex - e.rx + t * 2 * e.rx, y = ey + (e.shut === 'line' ? 0.5 : -0.2) * Math.sin(t * Math.PI); seg(b, X(x), Y(y), X(x + (t - 0.5) * 0.8), Y(y + 0.9), S[7]); }
      if (e.shut === 'squeeze') for (let k = 0; k < 6; k++) { const a = -1.2 + k * 0.48 + (ex < 2 ? Math.PI : 0); upath(b, [ex + Math.cos(a) * (e.rx + 0.5), ey + Math.sin(a) * (e.ry + 0.4), ex + Math.cos(a) * (e.rx + 1.6), ey + Math.sin(a) * (e.ry + 1.3)], S[6]); }
      return;
    }
    const ey = EYE_Y + (e.dy ?? 0), cx = X(ex), cy = Y(ey), rx = L(e.rx), ry = L(e.ry);
    const top = e.top !== undefined ? (x: number) => cy - ry + 2 * ry * e.top! + (x - cx) * (e.slope ?? 0) : undefined;
    const bot = e.bot !== undefined ? (x: number) => cy + ry - 2 * ry * e.bot! + (e.smile ? (1 - ((x - cx) / rx) ** 2) * -ry * 0.35 : 0) : undefined;
    eyeball(b, cx, cy, { rx, ry, sclera: e.sclera ?? SCLERA_R, iris: IRIS, ir: L(e.ir), idx: L(e.idx), idy: L(e.idy), pr: L(e.pr), veins: e.veins, lid: S, top, bot });
    // (the lids' wet red rims, the lashes, the lid's crease above)
    for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      const xs = (x - cx) / rx; if (Math.abs(xs) > 0.95) continue;
      const yb = bot ? bot(x) : cy + ry * Math.sqrt(1 - xs * xs);
      plot(b, x, Math.round(yb) + 1, hexU('#E2506A')); plot(b, x, Math.round(yb) + 2, hexU('#B83048'));
      const yt = top ? top(x) : cy - ry * Math.sqrt(1 - xs * xs);
      plot(b, x, Math.round(yt) - 1, S[7]);
      if ((x & 1) === 0 && Math.abs(xs) > 0.2) seg(b, x, Math.round(yt) - 1, x + Math.sign(xs) * 1.5, Math.round(yt) - 3, S[7]);
      plot(b, x, Math.round(yt) - 4 - Math.round((1 - xs * xs) * 1.5), S[5]);
    }
    // (a wet glint on the white)
    plot(b, cx - rx * 0.55, cy - ry * 0.3, WHITE); plot(b, cx - rx * 0.55 + 1, cy - ry * 0.3, WHITE);
  };
  if (farOk) one(FAR_EYE, d.far);
  if (nearOk) one(NEAR_EYE, d.near);
  // ---- the brows: ginger, bushy, strays curling off them
  for (const [ex, br, w] of [[FAR_EYE, d.bf, 2.1], [NEAR_EYE, d.bn, 2.5]] as const) {
    const by = EYE_Y - 4.4, [tilt, lift] = br, x0 = ex - w, x1 = ex + w, y0 = by - lift + tilt * (w / 2.4), y1 = by - lift - tilt * (w / 2.4);
    for (let k = 0; k < 120; k++) {
      const t = rnd(), x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + (rnd() - 0.5) * 1.1 * Math.sin(t * Math.PI + 0.3), a = -Math.PI / 2 + (t - 0.5) * 1.6 + (rnd() - 0.5) * 0.6;
      seg(b, X(x), Y(y + 0.5), X(x) + Math.cos(a) * 4, Y(y + 0.5) + Math.sin(a) * 4 + 2, GINGER[k % 5], 1, M_HAIR);
    }
    for (let k = 0; k < 5; k++) { const t = rnd(), x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; seg(b, X(x), Y(y), X(x) + (rnd() - 0.3) * 9, Y(y) - 3 - rnd() * 5, GINGER[1]); }
  }
  inkEdges(b, M_HAIR, GINGER[6]);
  return b;
}

// ---------------------------------------------------------------------------------------------------------------
// THE MOUTH (by face and, talking, by shape): cracked lips, gums, gap teeth, spit

const mouthFor = (face: TuckerFace, f: number, talking: boolean): { key: string; kind: 'open' | 'grin' | 'cheer' | 'clench' | 'out' | 'daze' | 'angry' | 'ow'; o: number; w: number } => {
  const open = (o: number, w: number) => ({ key: `o${o.toFixed(1)}w${w.toFixed(2)}`, kind: 'open' as const, o, w });
  switch (face) {
    case 'yell': return open(4.2 + 0.5 * sgn3(Math.sin(f * 0.6) * 1.6), 1.15);
    case 'manic': { if (talking) { const v = viseme(f); return open(v.o + 1.2, 1.2); } return { key: 'clench', kind: 'clench', o: 0, w: 1 }; }
    case 'shock': return open(3.4, 0.7);
    case 'ow': return { key: 'ow', kind: 'ow', o: 1.6, w: 1.1 };
    case 'out': return { key: 'out', kind: 'out', o: 0, w: 1 };
    case 'daze': return { key: 'daze', kind: 'daze', o: 0, w: 1 };
    case 'angry': return { key: 'angry', kind: 'angry', o: 0, w: 1 };
    default: {
      if (talking || face === 'talk') { const v = viseme(f); return open(v.o + 0.6, v.w); }
      return face === 'cheer' ? { key: 'cheer', kind: 'cheer', o: 0, w: 1 } : { key: 'grin', kind: 'grin', o: 0, w: 1 };
    }
  }
};

function paintMouth(m: ReturnType<typeof mouthFor>, red: boolean): Buf {
  at(HEAD); setSeed(m.key.length * 131 + 17);
  const b = newBuf(), S = red ? RAGE : SKIN, SALIVA = hexU('#EEEAF6');
  const inMouth = (x: number, y: number) => matAt(b, x, y) === M_MOUTH;
  const crack = () => { for (let x = 0; x < 272; x += 1) for (let y = 0; y < 204; y++) if (matAt(b, x, y) === M_LIP) { const h = hash2(x, y); if (h < 0.06) { plot(b, x, y, LIP[5]); plot(b, x, y + 1, LIP[4]); } else if (h > 0.97) plot(b, x, y, WHITE); } };
  const spit = (x0: number, y0: number, y1: number) => { for (let y = Math.round(y0); y < y1; y++) { const x = Math.round(x0 + Math.sin((y - y0) * 0.35) * 0.8); if (inMouth(x, y) || matAt(b, x, y) === M_OTHER) { plot(b, x, y, bay(x, y) < 0.7 ? SALIVA : hexU('#C8C0D8')); } } };
  if (m.kind === 'open' || m.kind === 'ow') {
    const rx = 3.4 * m.w + 0.3, ry = 0.7 + m.o * 0.72, cy = MY + m.o * 0.4;
    uball(b, MX, cy, rx + 0.8, ry + 0.7, LIP, { mat: M_LIP, line: true, lw: 1.3 });
    crack();
    uball(b, MX, cy, rx, ry, MOUTH, { mat: M_MOUTH, flat: 0.3, lit: 0.55 });
    const cx = X(MX), ccy = Y(cy), Rx = L(rx), Ry = L(ry);
    const top = (x: number) => ccy - Ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / Rx) ** 2)) + 1;
    const bot = (x: number) => ccy + Ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / Rx) ** 2)) - 1;
    if (ry > 2.6) uball(b, MX + 0.2, cy - ry + 1.4, 0.45, 0.8, TONGUE, { mat: M_MOUTH, line: true });
    if (m.o > 1) uball(b, MX + 0.4, cy + ry * 0.6, rx * 0.66, Math.max(0.6, ry * 0.42), TONGUE, { mat: M_MOUTH, line: (_dx, dy) => dy < 0, only: inMouth });
    if (m.o > 1) seg(b, X(MX + 0.4), Y(cy + ry * 0.35), X(MX + 0.4), Y(cy + ry * 0.85), TONGUE[4], 1, undefined, M_MOUTH);
    // (the gums along the top, the teeth: the gap in the middle, one gold, two gone brown; the bottom row, gappier)
    for (let x = Math.floor(cx - Rx); x <= cx + Rx; x++) { const t = Math.round(top(x)); for (let y = t; y < t + 3; y++) if (inMouth(x, y)) plot(b, x, y, GUM[y === t ? 3 : y === t + 1 ? 1 : 2], M_MOUTH); }
    const n = Math.floor((2 * Rx - 4) / 5);
    teeth(b, cx - Rx + 2, cx + Rx - 2, (x) => top(x) + 2, 1, Math.min(L(1.3), Ry * 0.8), { tw: 5, gaps: [Math.floor(n / 2)], gold: [Math.floor(n / 2) + 2], rot: [1, n - 2] });
    if (m.o > 1.4 || m.kind === 'ow') teeth(b, cx - Rx + 4, cx + Rx - 4, bot, -1, m.kind === 'ow' ? Math.min(L(1.2), Ry) : L(0.9), { tw: 5, gaps: [1, n - 3], rot: [2, 3], ramp: TOOTH_B });
    // (spit strung across, a bubble; drool out the near corner)
    if (m.o > 1.1) { spit(cx - Rx * 0.45, top(cx - Rx * 0.45) + L(1), bot(cx - Rx * 0.45)); spit(cx + Rx * 0.35, top(cx + Rx * 0.35) + L(1), bot(cx + Rx * 0.35) - 2); }
    if (m.o > 2) { uball(b, MX - rx * 0.6, cy + ry * 0.3, 0.4, 0.4, R('#FFFFFF', '#F0F0FA', '#D8D8EA', '#B0B0C8', '#8080A0'), { mat: M_OTHER, line: true, lw: 0.6 }); upath(b, [MX + rx + 0.4, cy + 0.2, MX + rx + 0.6, cy + 1.6, MX + rx + 0.3, cy + 2.6], SALIVA); }
    if (m.kind === 'ow') upath(b, [MX - rx, cy, MX + rx, cy], MOUTH[4], 1, undefined, M_OTHER);
  } else if (m.kind === 'grin' || m.kind === 'cheer') {
    const dip = m.kind === 'cheer' ? 4.2 : 3.2;
    const lip = quads(MX - 4.6, MY - 1, [[MX, MY + dip + 1, MX + 4.6, MY - 1.2], [MX, MY - 0.2, MX - 4.6, MY - 1]], 10);
    upoly(b, lip, LIP, M_LIP, { line: true, tilt: 0.1 });
    crack();
    const pts = quads(MX - 4, MY - 0.7, [[MX, MY + dip, MX + 4, MY - 0.9], [MX, MY - 0.4, MX - 4, MY - 0.7]], 10);
    upoly(b, pts, MOUTH, M_MOUTH, { line: false });
    // (the gums: receding, the teeth long under them, the gap, gold, rot)
    for (let x = Math.floor(X(MX - 4)); x <= X(MX + 4); x++) for (let y = Math.floor(Y(MY - 1)); y < Y(MY + 0.1); y++) if (inMouth(x, y)) plot(b, x, y, GUM[(y & 1) ? 2 : 1], M_MOUTH);
    teeth(b, X(MX - 3.6), X(MX + 3.6), (x) => { for (let y = Math.floor(Y(MY - 1.4)); y < Y(MY + 4); y++) if (inMouth(x, y)) return y + 2; return Y(MY); }, 1, L(1.5), { tw: 5, gaps: [3], gold: [5], rot: [0, 6] });
    if (m.kind === 'cheer') { uball(b, MX + 0.6, MY + dip - 1.1, 2, 0.9, TONGUE, { mat: M_MOUTH, only: inMouth }); spit(X(MX - 1.6), Y(MY + 0.6), Y(MY + dip - 0.6)); }
    for (const s of [-1, 1]) upath(b, [MX + s * 4.8, MY - 2, MX + s * 4.2, MY - 0.6, MX + s * 4.6, MY + 0.6], S[6], 1, M_OTHER);
  } else if (m.kind === 'clench') {
    upoly(b, [MX - 5.2, MY - 1.8, MX + 5.2, MY - 1.8, MX + 5, MY + 2.8, MX - 5, MY + 2.8], LIP, M_LIP, { tilt: 0.1 });
    crack();
    upoly(b, [MX - 4.6, MY - 1.2, MX + 4.6, MY - 1.2, MX + 4.4, MY + 2.2, MX - 4.4, MY + 2.2], MOUTH, M_MOUTH, { line: false });
    for (let x = Math.floor(X(MX - 4.6)); x <= X(MX + 4.6); x++) for (let y = Math.floor(Y(MY - 1.2)); y < Y(MY - 0.6); y++) if (inMouth(x, y)) plot(b, x, y, GUM[(y & 1) ? 1 : 2], M_MOUTH);
    teeth(b, X(MX - 4.3), X(MX + 4.3), () => Y(MY - 0.6), 1, L(1.4), { tw: 5, gaps: [3], gold: [5], rot: [1, 6] });
    teeth(b, X(MX - 4), X(MX + 4), () => Y(MY + 2.1), -1, L(1.2), { tw: 5, gaps: [5], rot: [2], ramp: TOOTH_B });
    for (const s of [-1, 1]) { upath(b, [MX + s * 5.6, MY - 2.4, MX + s * 5, MY - 0.6], S[6], 2); uball(b, MX + s * 4.9, MY + 1.5, 0.45, 0.4, R('#FFFFFF', '#F0F0FA', '#D8D8EA', '#B0B0C8', '#8080A0'), { mat: M_OTHER, line: true, lw: 0.6 }); }
  } else if (m.kind === 'out') {
    uball(b, MX, MY + 0.6, 2.8, 1.6, LIP, { mat: M_LIP, line: true });
    uball(b, MX, MY + 0.6, 2.2, 1.1, MOUTH, { mat: M_MOUTH });
    teeth(b, X(MX - 2), X(MX + 2), () => Y(MY - 0.3), 1, L(0.8), { tw: 5, gaps: [2] });
    uball(b, MX + 1.4, MY + 2.4, 1.4, 1.9, TONGUE, { mat: M_OTHER, line: true });
    seg(b, X(MX + 1.4), Y(MY + 1.4), X(MX + 1.4), Y(MY + 3.6), TONGUE[4]);
    upath(b, [MX + 2.4, MY + 3.4, MX + 2.6, MY + 5.2, MX + 2.3, MY + 6.4], SALIVA, 1); uball(b, MX + 2.3, MY + 6.6, 0.35, 0.45, R('#FFFFFF', '#F0F0FA', '#D8D8EA', '#B0B0C8', '#8080A0'), { line: true, lw: 0.6 });
  } else {
    // (daze: a slack wobble, drool; angry: a frown, the lower lip pushed out)
    const pts = m.kind === 'daze' ? [MX - 3, MY + 0.6, MX - 1, MY + 1.6, MX + 1, MY + 1, MX + 3, MY + 0.2] : [MX - 3.4, MY + 1.4, MX, MY + 0.2, MX + 3.4, MY + 1.4];
    if (m.kind === 'angry') { uball(b, MX, MY + 1.6, 3.2, 1.1, LIP, { mat: M_LIP, line: true }); crack(); }
    upath(b, pts, LIP[6], 2, M_OTHER); upath(b, pts.map((p, i) => (i % 2 ? p - 0.3 : p)), LIP[3], 1);
    if (m.kind === 'daze') { upath(b, [MX + 3, MY + 0.4, MX + 3.3, MY + 2, MX + 3, MY + 3.4], SALIVA, 1); uball(b, MX + 3, MY + 3.6, 0.4, 0.5, R('#FFFFFF', '#F0F0FA', '#D8D8EA', '#B0B0C8', '#8080A0'), { line: true, lw: 0.6 }); }
    else for (const s of [-1, 1]) upath(b, [MX + s * 3.6, MY + 1.2, MX + s * 4, MY + 2.6], S[6]);
  }
  return b;
}

// ---------------------------------------------------------------------------------------------------------------
// THE MUSTACHE: the waxed handlebar, strand by strand, its curls shining, a glob of snot in it

const stacheFor = (face: TuckerFace, f: number, talking: boolean) => {
  const twitch = talking ? sgn3(Math.sin(f * 0.6) * 1.6) * 0.4 : 0;
  const curl = face === 'out' || face === 'daze' ? 2.4 : face === 'manic' ? -2 + sgn3(Math.sin(f * 0.9) * 1.6) * 0.3 : face === 'yell' || face === 'angry' ? -1.4 : -0.8;
  return { key: `${curl.toFixed(1)}|${twitch}`, curl, twitch };
};

function paintStache(curl: number, twitch: number): Buf {
  at(HEAD); setSeed(4242);
  const b = newBuf(), my = 5.6 + twitch;
  const pts = grow(quads(0.6, my - 0.6, [
    [3, my - 1.8, 5.4, my - 0.6], [7.8, my - 1.8, 10.4, my - 0.4], [12.6, my + 0.4 + curl * 0.3, 13.4, my - 1.6 + curl], [13.8, my - 3 + curl, 12.8, my - 3.2 + curl],
    [12.6, my - 1.6 + curl, 11.2, my + 1.4], [8, my + 2.6, 5.4, my + 1.6], [2.6, my + 2.8, -0.6, my + 1.6], [-2.6, my + 1 + curl * 0.3, -3.4, my - 1.2 + curl],
    [-3.4, my - 2.6 + curl, -2.4, my - 2.6 + curl], [-2.4, my - 1, 0.6, my - 0.6],
  ]), 5.2, my, 1.1);
  upoly(b, pts, GINGER, M_HAIR, { line: false, tilt: 0.1 });
  for (let k = 0; k < 1100; k++) {
    const x = X(-3.4 + rnd() * 18), y = Y(my - 4.4 + rnd() * 7.4);
    if (matAt(b, x, y) !== M_HAIR) continue;
    const u = x / U + OX, side = u > 5.2 ? 1 : -1, a = Math.PI / 2 - side * (0.9 + Math.min(1, Math.abs(u - 5.2) / 6) * 0.5) + (rnd() - 0.5) * 0.5;
    seg(b, x, y, x + Math.cos(a) * (4 + rnd() * 4), y + Math.sin(a) * (4 + rnd() * 4), GINGER[[0, 1, 2, 2, 3, 3, 4, 5][k % 8]], 1, undefined, M_HAIR);
  }
  // (the wax on its curls, shining; the part in the middle; crumbs caught in it; the snot glob off the nostril)
  for (let k = 0; k < 40; k++) { const x = X(rnd() < 0.5 ? 11.4 + rnd() * 3 : -3.6 + rnd() * 2.6), y = Y(my - 3.8 + curl + rnd() * 3); if (matAt(b, x, y) === M_HAIR && matAt(b, x, y - 2) === M_HAIR) plot(b, x, y, k % 3 ? GINGER[0] : WHITE); }
  seg(b, X(5.2), Y(my - 1.2), X(5.3), Y(my + 1.4), GINGER[5], 2, undefined, M_HAIR);
  for (const [u, v] of [[2.2, my + 0.9], [8.4, my + 1.3], [9.6, my + 0.4], [3.6, my + 1.6]] as const) { plot(b, X(u), Y(v), hexU('#F4E2A0')); plot(b, X(u) + 1, Y(v), hexU('#C8A860')); }
  inkEdges(b, M_HAIR, GINGER[6]);
  uball(b, 4.7, my - 1.1, 0.6, 0.5, SNOT, { mat: M_OTHER, line: true, lw: 0.8 }); plot(b, X(4.5), Y(my - 1.3), WHITE);
  return b;
}

// ---------------------------------------------------------------------------------------------------------------
// ON TOP: the sockets, the spectacles, the cap, the wounds

export interface TopKey { capless: boolean; eye: boolean; saw: boolean; grime: boolean; branch: boolean; sd: number; clawed: number; bloody: number }
const SPLIT_X = 4.2;

/** A socket emptied: the meat of it, the rim torn, chips of the bone, brain matter at it, the hole (daylight through
 *  it, shot through), the nerve hanging out of it with a shred of the eye on it, the blood run out of it. */
const socket = (b: Buf, ex: number, ey: number, r: number, daylight: boolean, S: number[]) => {
  uball(b, ex, ey, r + 0.4, r * 0.92 + 0.4, MEAT, { mat: M_OTHER, line: true, lw: 1.2 });
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2 + rnd() * 0.3, rr = r + 0.3 + rnd() * 0.5, w = 0.3 + rnd() * 0.3;
    upoly(b, [ex + Math.cos(a - w) * rr, ey + Math.sin(a - w) * rr * 0.92, ex + Math.cos(a) * (rr - 0.9 - rnd() * 0.5), ey + Math.sin(a) * (rr - 0.9) * 0.92, ex + Math.cos(a + w) * rr, ey + Math.sin(a + w) * rr * 0.92], k % 4 === 0 ? BONE : S.slice(1), M_OTHER);
  }
  uball(b, ex + 0.2, ey + 0.1, r * 0.58, r * 0.54, HOLE, { mat: M_OTHER });
  if (daylight) { uball(b, ex + 0.3, ey + 0.1, r * 0.36, r * 0.33, SKYR, { mat: M_OTHER }); plot(b, X(ex + 0.1), Y(ey - 0.2), WHITE); }
  for (let k = 0; k < 4; k++) { const a = -2.4 + k * 0.9; uball(b, ex + Math.cos(a) * r * 0.62, ey + Math.sin(a) * r * 0.58, 0.45 + rnd() * 0.25, 0.4, BRAIN, { mat: M_OTHER, line: true, lw: 0.7 }); }
  upath(b, [ex - 0.3, ey + r * 0.5, ex - 0.6, ey + r + 0.6, ex - 0.4, ey + r + 1.8], BRAIN[5], 3, M_OTHER); upath(b, [ex - 0.3, ey + r * 0.5, ex - 0.6, ey + r + 0.6, ex - 0.4, ey + r + 1.8], BRAIN[2], 1);
  uball(b, ex - 0.4, ey + r + 2.1, 0.75, 0.6, R('#FFFFFF', '#F4ECE4', '#E0CCC4', '#C49A94', '#7A4A44'), { mat: M_OTHER, line: true, lw: 0.7 });
  plot(b, X(ex - 0.2), Y(ey + r + 2.2), IRIS[2]); plot(b, X(ex - 0.2) + 1, Y(ey + r + 2.2), IRIS[3]);
};

function paintTop(k: TopKey): Buf {
  at(HEAD); setSeed(9001 + (k.eye ? 1 : 0) + (k.saw ? 2 : 0) + (k.grime ? 4 : 0) + Math.round(k.sd * 40) * 8);
  const b = newBuf(), S = SKIN, blind = k.sd >= 0.45;
  // ---- the sockets: the near one shot out (the train's), the far one burst (the split's)
  if (k.eye) socket(b, NEAR_EYE, EYE_Y, 2.8, !blind, S);
  if (blind) socket(b, FAR_EYE, EYE_Y, 2.4, false, S);
  // ---- the spectacles: round wire rims, greasy glass; the near lens starred round the hole; split, the bridge snapped,
  // the far half gone with his eye, the near lens slid down his cheek, crooked, starred, bloody
  const rim = (lx: number, ly: number, r: number, rot: number, starred: boolean) => {
    const c = Math.cos(rot), s = Math.sin(rot);
    for (let a = 0; a < Math.PI * 2; a += 0.012) {
      const ex = Math.cos(a) * r, ey = Math.sin(a) * r * 0.92, x = X(lx + ex * c - ey * s), y = Y(ly + ex * s + ey * c);
      plot(b, x, y, Math.cos(a + 2.3) > 0.4 ? WIRE_L : WIRE, M_METAL); plot(b, x + Math.cos(a), y + Math.sin(a), WIRE_D, M_METAL);
    }
    if (starred) {
      for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2 + 0.3, pts = [lx + Math.cos(a) * 1.3, ly + Math.sin(a) * 1.2, lx + Math.cos(a + 0.12) * r * 0.6, ly + Math.sin(a + 0.12) * r * 0.55, lx + Math.cos(a) * r * 0.96, ly + Math.sin(a) * r * 0.88]; upath(b, pts, hexU('#EAF2FA')); }
      for (let a = 0; a < Math.PI * 2; a += 0.05) if (hash2(Math.round(a * 20), 7) > 0.3) plot(b, X(lx + Math.cos(a) * r * 0.55), Y(ly + Math.sin(a) * r * 0.5), hexU('#D8E6F2'));
      tint(b, X(lx - 1.3), Y(ly + 1.9), L(r * 0.4), L(r * 0.25), B(2), 0.6, undefined, 0.6);
    } else {
      seg(b, X(lx - r * 0.55), Y(ly - r * 0.25), X(lx - r * 0.1), Y(ly - r * 0.7), WHITE); seg(b, X(lx - r * 0.35), Y(ly - r * 0.05), X(lx + r * 0.05), Y(ly - r * 0.5), hexU('#E8F0F8'));
      for (let j = 0; j < 5; j++) plot(b, X(lx + (hash2(j, Math.round(lx)) - 0.5) * r), Y(ly + 0.6 + (hash2(Math.round(lx), j) - 0.5) * r), hexU('#E0E4D0'));
    }
  };
  if (blind) {
    rim(NEAR_EYE + 1.2, EYE_Y + 3.6, 3, 0.5, true);
    upath(b, [NEAR_EYE - 1.6, EYE_Y + 2.6, NEAR_EYE - 3.2, EYE_Y + 0.8], WIRE, 2, M_METAL);
  } else {
    rim(FAR_EYE, EYE_Y + 0.2, 2.6, 0, false);
    rim(NEAR_EYE, EYE_Y + 0.2, 3, 0, k.eye);
    upath(b, [FAR_EYE + 2.6, EYE_Y - 0.2, NEAR_EYE - 3, EYE_Y - 0.2], WIRE, 2, M_METAL); upath(b, [FAR_EYE + 2.6, EYE_Y - 0.5, NEAR_EYE - 3, EYE_Y - 0.5], WIRE_L, 1);
    upath(b, [FAR_EYE - 2.6, EYE_Y, -8.6, -1.4], WIRE, 2, M_METAL);
  }
  // ---- the exit hole behind his ear (the train's): ragged, brain at its lip, matted blood
  if (k.eye) {
    tear(b, -10.4, -3.4, 1.7, 2.2, { brain: true, bone: true });
    run(b, [-10.6, -1.4, -10.9, 0.6, -10.6, 2.2], 2);
  }
  // ---- the cap: navy wool (dandruff on it, a sweat stain through it), the brass band gone green in spots, the
  // CONDUCTOR plate, the chin strap's buttons and cord, the cracked patent visor with its hard shine
  if (!k.capless) {
    const drum = quads(-10.8, -9.6, [[-11.6, -19.6], [0, -21.8, 11.8, -19.8], [11, -9.6], [0, -8.2, -10.8, -9.6]]);
    upoly(b, drum, COAT, M_CLOTH, { tilt: 0.5 });
    for (let y = Math.floor(Y(-22)); y < Y(-8); y++) for (let x = Math.floor(X(-12)); x < X(12); x++) {
      if (matAt(b, x, y) !== M_CLOTH) continue;
      const h = hash2(x, y);
      if (((x + y) & 3) === 0 && h < 0.5) shade(b, x, y, COAT[6], 0.25);
      else if (y / U + OY > -12.4 && h > 0.988) plot(b, x, y, hexU('#F4F0E4'));
    }
    tint(b, X(-4), Y(-13.4), L(5), L(1.8), hexU('#6A5A3A'), 0.35, M_CLOTH, 0.7); tint(b, X(6), Y(-13.2), L(3.4), L(1.4), hexU('#6A5A3A'), 0.3, M_CLOTH, 0.7);
    upath(b, [-11, -19.7, 0, -21.4, 11.4, -19.9], COAT[0]);
    const band = quads(-11, -12.8, [[0, -11.4, 11.2, -12.8], [11.1, -10.4], [0, -9, -10.9, -10.4]]);
    upoly(b, band, BRASS, M_METAL, { tilt: 0.3 });
    for (let j = 0; j < 9; j++) { const x = X(-10 + rnd() * 20), y = Y(-12 + rnd() * 1.6); if (matAt(b, x, y) === M_METAL) { plot(b, x, y, hexU('#4A8A6A')); plot(b, x + 1, y, hexU('#6AAA88')); } }
    upoly(b, [-1, -17.6, 8.4, -17.6, 8.4, -13.6, -1, -13.6], BRASS, M_METAL, { tilt: 0.6 });
    letters(b, 'CONDUCTOR', Math.round(X(-1)) + 2, Math.round(Y(-16.4)), BRASS[5], BRASS[1]);
    tint(b, X(6.6), Y(-14.4), L(1.2), L(0.6), hexU('#4A8A6A'), 0.4, M_METAL, 0.6);
    for (const bx of [-9.4, 10.4]) { uball(b, bx, -11.6, 0.85, 0.85, BRASS, { mat: M_METAL, line: true, lw: 0.8 }); plot(b, X(bx - 0.3), Y(-11.9), WHITE); }
    upath(b, [-9.4, -11.2, 0, -10.2, 10.4, -11.2], BRASS[4], 2); upath(b, [-9.4, -11.4, 0, -10.4, 10.4, -11.4], BRASS[2]);
    const visor = quads(1, -10, [[8, -10.9, 15.6, -8.4], [14.8, -6.2, 9, -6.7], [4, -7.4, 1, -8.4]]);
    upoly(b, visor, PATENT, M_OTHER, { tilt: -0.2 });
    upath(b, [4, -9.3, 9, -9.6, 13.8, -8.5], hexU('#E8E8F2')); upath(b, [5, -8.9, 9, -9.1, 12.4, -8.2], PATENT[1]);
    for (let j = 0; j < 4; j++) { const x0 = 3 + j * 2.8; upath(b, [x0, -9.6, x0 + 0.4, -8.6, x0 + 0.1, -7.8], PATENT[0], 1, undefined, M_OTHER); }
  }
  // ---- the log ride's: the buzzsaw sunk through the cap's crown into his forehead. The slot: meat, the skull's bone
  // chipped white at its lips, his brain bulged up in it; the blade's teeth caked with blood, hair and skin; a tooth gone
  if (k.saw && k.sd <= 0) {
    const top = k.capless ? -13.6 : -21.4;
    upoly(b, [1, top - 0.2, 7.6, top + 0.6, 5.7, -7.8, 3.1, -8.3], MEAT, M_OTHER);
    upoly(b, [2, top + 0.4, 6.6, top + 1, 5, -9, 3.6, -9.2], HOLE, M_OTHER, { line: false });
    for (const [x0, y0, x1, y1] of [[1.2, top, 3.2, -8.5], [7.4, top + 0.8, 5.6, -8]] as const) {
      upath(b, [x0, y0, x1, y1], BONE[1], 2, M_OTHER);
      for (let t = 0.1; t < 1; t += 0.18) { const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; plot(b, X(x) + (x0 < 4 ? -2 : 2), Y(y), BONE[3]); plot(b, X(x) + (x0 < 4 ? -1 : 1), Y(y) + 1, BONE[4]); }
    }
    uball(b, 4.4, (top - 8) / 2 + 1, 1, Math.max(1, (-8 - top) * 0.32), BRAIN, { mat: M_OTHER, line: true });
    for (let j = 0; j < 4; j++) upath(b, [3.9 + j * 0.3, (top - 8) / 2 - 1 + j * 1.6, 4.9 - j * 0.2, (top - 8) / 2 - 0.4 + j * 1.6], BRAIN[4], 1, undefined, M_OTHER);
    // (the blade: what isn't inside him: over the crown, out in front of his brow)
    const sx = 4.4, sy = -17, Rr = 10, fx = k.capless ? 9.8 : 11.6;
    const cx = X(sx), cy = Y(sy);
    for (let y = Math.floor(Y(sy - Rr - 1.2)); y <= Y(sy + Rr + 1.2); y++) for (let x = Math.floor(X(sx - Rr - 1.2)); x <= X(sx + Rr + 1.2); x++) {
      if (x < 0 || y < 0 || x >= 272 || y >= 204) continue;
      const u = x / U + OX, v = y / U + OY;
      if (!(v < top || (u > fx && v >= top + 0.4 && v < -8.6))) continue;
      const dx = (x + 0.5 - cx) / U, dy = (y + 0.5 - cy) / U, d = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
      const ph = ((((a - 0.2) / (Math.PI * 2)) * 28) % 2 + 2) % 2, tooth = Math.floor(((((a - 0.2) / (Math.PI * 2)) * 28) % 28 + 28) % 28);
      const rr = tooth === 9 || tooth === 10 ? Rr - 0.4 : Rr + 1.1 - 1.5 * (ph < 1 ? ph : 2 - ph);
      if (d > rr) continue;
      const i = y * 272 + x;
      if (d > rr - 0.3) { b.px[i] = STEEL[6]; b.mat[i] = M_METAL; continue; }
      let s: number;
      if (d < 2.4) s = d < 1 ? 4 : d > 2.1 ? 5 : 1;
      else {
        const lv = 0.5 + 0.5 * Math.cos(a + 2.2), ring = hash2(Math.round(d * 6), 3) * 0.6;
        s = Math.max(0, Math.min(5, Math.round((1 - lv) * 4.2 + ring - 0.3 + (bay(x, y) - 0.5) * 0.9)));
        if (Math.abs(d - Rr * 0.8) < 0.25) s = 5;
        if (d < Rr * 0.75 && a > -2.4 && a < -1.9) s = 0;
      }
      b.px[i] = d < 2.4 ? BRASS[s] : STEEL[s]; b.mat[i] = M_METAL;
      // (caked: blood dried on the teeth round its underside and smeared up it, hair and skin stuck in them)
      if (d > Rr - 1.4 && dy > -2 && hash2(x, y) < 0.55 + dy * 0.05) b.px[i] = B(hash2(x + 1, y) < 0.3 ? 2 : hash2(x, y + 1) < 0.5 ? 4 : 5);
      else if (dy > 3 && d < Rr - 1 && bay(x, y) < (dy - 3) / 9) b.px[i] = B(3);
    }
    for (let j = 0; j < 6; j++) { const a = 0.6 + j * 0.35, x = X(sx + Math.cos(a) * (Rr + 0.6)), y = Y(sy + Math.sin(a) * (Rr + 0.6)); if (matAt(b, x, y) === M_METAL) seg(b, x, y, x + 3 - j, y + 4, GINGER[3]); }
    if (k.capless) uball(b, sx, sy, 1, 1, STEEL, { mat: M_METAL, line: true });
    // (the hanger's arm, snapped off short up out of the hub, its end jagged)
    upath(b, [sx, sy, sx - 1.4, sy - 12], STEEL[6], 5, M_METAL); upath(b, [sx, sy, sx - 1.4, sy - 12], STEEL[3], 3); upath(b, [sx - 0.2, sy, sx - 1.6, sy - 12], STEEL[1], 1);
    upoly(b, [sx - 2.2, sy - 12, sx - 0.6, sy - 12, sx - 0.9, sy - 13.6, sx - 1.4, sy - 12.6, sx - 1.9, sy - 13.2], STEEL, M_METAL);
  }
  // ---- the blood: out of the shot socket down his cheek and over the chop; out of the slot down his brow, over the
  // lens and off his jaw; the split's sheets either side of his nose; the branch's, coughed up out of his mouth
  if (k.eye) { run(b, [NEAR_EYE - 0.5, EYE_Y + 2.4, NEAR_EYE - 0.9, EYE_Y + 6, NEAR_EYE - 0.2, EYE_Y + 10.4], 3); run(b, [NEAR_EYE + 1.3, EYE_Y + 2.4, NEAR_EYE + 1.8, EYE_Y + 6.6], 2); }
  if (k.saw && k.sd <= 0) { run(b, [5.6, -8, 6, -4, 5.2, 2, 5.6, 9], 3); run(b, [3.4, -8.2, 2.6, -3, 1.6, 2], 2); clot(b, 4.6, -7.4, 0.6); }
  if (k.sd > 0) {
    const x = SPLIT_X, q = Math.min(1, k.sd * 1.6);
    run(b, [x - 0.6, -10, x - 1.2, -6, x - 1.6, -6 + 9 * q, x - 2.6, -6 + 16 * q], 4);
    run(b, [x + 0.8, -10, x + 1.4, -5, x + 1.2, -5 + 7 * q, x + 2.2, -5 + 13 * q], 3);
    run(b, [x - 3, -12, x - 3.6, -9, x - 3.2, -9 + 6 * q], 2);
    if (blind) run(b, [FAR_EYE - 0.4, EYE_Y + 2.2, FAR_EYE - 0.9, EYE_Y + 6, FAR_EYE - 0.3, EYE_Y + 11], 3);
  }
  if (k.branch) run(b, [8.9, 8.2, 9.3, 10.6, 8.7, 13.4], 2);
  // ---- the woods' extra-bloodied look: blood spattered across his face, muck smeared on the cap (or his brow), chips
  // in his chops and his mustache, leaves off the pile
  if (k.grime) {
    for (const [x, y, r] of [[8.6, 4.6, 0.9], [9.8, 2.2, 0.6], [2.4, 6, 0.5], [-4.8, 2.6, 0.7], [-2, -6.4, 0.6], [0.6, 1.4, 0.4], [-6.4, -2, 0.5]] as const) clot(b, x, y, r);
    run(b, [9.4, -2, 10, 3, 9.2, 8], 2);
    uball(b, -4, k.capless ? -10.6 : -7.6, 3.8, 0.9, MUCK, { mat: M_OTHER, soft: 0.5, lit: 0.8 });
    chip(b, -5.4, -2, 0.4); chip(b, -4.6, 4, -0.6); chip(b, 11, 1, 1.1); chip(b, 9, 6.4, 0.2); chip(b, 1.4, 6.8, 0.8);
    leaf(b, k.capless ? -4 : -6, k.capless ? -13 : -20.6, -0.4, 1.1); leaf(b, -7.4, 6.4, 0.9, 0.8);
  }
  // ---- the fight's: the lions' rakes torn across his face (three parallel gashes a set, flaps of skin at their lips)
  const n = Math.min(5, k.clawed);
  const RAKES: [number, number, number][] = [[-5, 4, 0.8], [7, 6, -0.6], [0, -8, 0.3], [-7, -6, -0.9], [3, 9, 1.2]];
  for (let i = 0; i < n; i++) {
    const [x, y, a] = RAKES[i], s = 0.55, c = Math.cos(a), sn = Math.sin(a);
    const T = (px: number, py: number): [number, number] => [x + px * c - py * sn, y + px * sn + py * c];
    for (let j = -1; j <= 1; j++) {
      const yy = j * 2.2 * s, [ax, ay] = T(-5 * s, yy - 0.4), [bx, by] = T(5 * s, yy + 0.6), [mx, my] = T(0, yy + 0.2);
      upath(b, [ax, ay, mx, my, bx, by], MEAT[5], 2, M_OTHER); upath(b, [ax, ay, mx, my, bx, by], MEAT[2], 1); upath(b, [ax, ay - 0.3, mx, my - 0.3], MEAT[0], 1);
      const [fx, fy] = T(1.2 * s, yy - 0.7); plot(b, X(fx), Y(fy), S[2]); plot(b, X(fx) + 1, Y(fy), S[3]);
    }
    run(b, [x, y + 2 * s, x + 0.4, y + 6 * s], 2);
  }
  // ---- the soul sucker's blood all over his face, wet
  if (k.bloody > 0) {
    const q = 0.75 * k.bloody;
    const onHead = (u: number, v: number) => ((u - 0.4) / 11) ** 2 + ((v + 3.4) / 10.6) ** 2 < 1 || ((u - 1.1) / 10.9) ** 2 + ((v - 3.8) / 9.8) ** 2 < 1 || (!k.capless && v > -21.4 && v < -8.4 && Math.abs(u) < 11.4);
    for (const [x0, y0, rx, ry] of [[1, -10, 11, 5], [-4, 2, 5, 4], [7, 4, 4, 3]] as const) {
      for (let y = Math.floor(Y(y0 - ry)); y <= Y(y0 + ry); y++) for (let x = Math.floor(X(x0 - rx)); x <= X(x0 + rx); x++) {
        if (x < 0 || y < 0 || x >= 272 || y >= 204) continue;
        const u = x / U + OX, v = y / U + OY, dd = Math.hypot((u - x0) / rx, (v - y0) / ry);
        if (dd > 1 || !onHead(u, v) || (dd > 0.6 && bay(x, y) > (1 - dd) / 0.4)) continue;
        const i = y * 272 + x, col = hash2(x, y) < 0.05 ? hexU('#FF8A8A') : B(hash2(x + 3, y) < 0.3 ? 2 : 3);
        if (b.px[i] === 0) { if (bay(x, y) < q * 1.25) b.px[i] = col; } else b.px[i] = mixU(b.px[i], col, q);
      }
    }
    run(b, [-8, -4, -8.4, 8], 3); run(b, [9, -6, 9.4, 6], 2);
  }
  return b;
}

// ---------------------------------------------------------------------------------------------------------------
// THE SHOULDERS: the coat, the vest straining, the collar's sweat ring, the bow tie, the badge, the neck's rolls; the
// woods' grime; the branch through his chest; the split's blood down his front

export interface BodyKey { red: boolean; grime: boolean; branch: boolean; split: number }
const CB = { x: 6, y: 30, dy: 0.18, exit: -21.5 };
const cby = (u: number) => CB.y + (u - CB.x) * CB.dy;
const cbr = (u: number) => Math.max(0, Math.min(7, 0.3 + (u + 40) * 0.1));

/** A length of the branch (head units, xa < xb): bark in stepped bands lit along its top, its furrows; blood up it to
 *  `bloodTo` (wet, running off its underside); `jag`: snapped off, splinters out of the break. */
const bough = (b: Buf, ua: number, ub: number, o: { bloodTo?: number; jag?: boolean; seed: number }) => {
  for (let x = Math.floor(X(ua)); x <= Math.ceil(X(ub)); x++) {
    const u = x / U + OX, cy = Y(cby(u)), rr = L(cbr(u));
    if (rr < 0.6) continue;
    const bl = o.bloodTo !== undefined && u < o.bloodTo;
    for (let y = Math.floor(cy - rr); y <= Math.ceil(cy + rr); y++) {
      const d = (y + 0.5 - cy) / rr; if (Math.abs(d) > 1) continue;
      const edge = Math.abs(d) > 1 - 1.3 / rr;
      let k = edge ? 5 : Math.max(0, Math.min(4, Math.round((d + 1) * 2 - 0.4 + (bay(x, y) - 0.5) * 0.9)));
      if (!edge && hash2(Math.floor(x / 7) + o.seed, Math.round(y / 2)) < 0.14) k = Math.min(5, k + 2);
      let col = BARK[k];
      if (bl) col = edge ? B(5) : d < -0.55 && hash2(x, y) < 0.35 ? B(0) : B(k < 1 ? 1 : k < 3 ? 2 : 3);
      plot(b, x, y, col, M_OTHER);
    }
    if (bl && hash2(x, o.seed) < 0.16) { const l = 2 + Math.floor(hash2(o.seed, x) * 9); for (let j = 0; j < l; j++) plot(b, x, Math.round(cy + rr) + j, B(j === l - 1 ? 2 : 3)); }
  }
  if (o.jag) {
    const rr = cbr(ub), y = cby(ub);
    upoly(b, [ub - rr * 0.2, y - rr, ub + rr * 0.8, y - rr * 0.6, ub + rr * 0.2, y - rr * 0.2, ub + rr, y + rr * 0.15, ub + rr * 0.25, y + rr * 0.45, ub + rr * 0.6, y + rr * 0.9, ub - rr * 0.2, y + rr], WOOD, M_OTHER, { tilt: 0.8 });
    for (let j = 0; j < 4; j++) upath(b, [ub - rr * 0.1, y - rr * 0.6 + j * rr * 0.4, ub + rr * (0.4 + (j % 2) * 0.4), y - rr * 0.5 + j * rr * 0.42], WOOD[4]);
  }
};

function paintBody(k: BodyKey): Buf {
  at(BODY); setSeed(555 + (k.red ? 1 : 0) + (k.grime ? 2 : 0) + (k.branch ? 4 : 0) + Math.round(k.split * 8) * 8);
  const b = newBuf(), S = k.red ? RAGE : SKIN;
  // ---- the neck: fat rolls over the collar, stubble, a boil
  uball(b, 0.2, 11.2, 6.6, 4.4, S, { mat: M_SKIN, line: true });
  upath(b, [-5, 12.4, 0, 13.6, 5.6, 12.2], S[6]); upath(b, [-4.4, 10.4, 0, 11.2, 5, 10.2], S[5]);
  stubble(b, () => 0.5, GINGER[4], 0.4);
  uball(b, -3.4, 12.2, 0.7, 0.6, PIMPLE, { mat: M_OTHER, line: true, lw: 0.8 }); plot(b, X(-3.5), Y(12), WHITE);
  // ---- the coat: navy wool, its weave, dandruff snowed across the shoulders
  const coat = quads(-26, 40, [[-24, 18, -12, 14], [14, 14], [26, 18, 28, 40]]);
  upoly(b, coat, COAT, M_CLOTH, { tilt: 0.5 });
  for (const s of [-1, 1]) tint(b, X(s < 0 ? -15 : 17), Y(17), L(8), L(3), COAT[0], 0.35, M_CLOTH, 0.7);
  for (let y = Math.floor(Y(14)); y < 204; y++) for (let x = 0; x < 272; x++) {
    if (matAt(b, x, y) !== M_CLOTH) continue;
    const h = hash2(x, y), v = y / U + OY;
    if (((x + y) & 3) === 0 && h < 0.45) shade(b, x, y, COAT[6], 0.22);
    else if (v < 19 && h > 0.972 - Math.max(0, 17 - v) * 0.01) plot(b, x, y, hexU('#F4F0E4'));
  }
  // ---- the vest: straining over his belly, the pull lines off its buttons, a gravy stain
  upoly(b, [-6, 15, 8, 15, 10, 40, -8, 40], VEST, M_CLOTH, { tilt: 0.4 });
  for (let i = 0; i < 3; i++) {
    const by = 22 + i * 6;
    for (const s of [-1, 1]) upath(b, [1 + s * 1.6, by, 1 + s * 4.6, by - 1.4, 1 + s * 6.4, by - 2], VEST[4]);
    uball(b, 1, by, 1.25, 1.25, BRASS, { mat: M_METAL, line: true, lw: 0.9 }); plot(b, X(0.6), Y(by - 0.4), WHITE);
  }
  tint(b, X(-2.8), Y(33), L(2.2), L(1.4), hexU('#7A5418'), 0.55, M_CLOTH, 0.6); tint(b, X(4.6), Y(27), L(1), L(0.8), hexU('#7A5418'), 0.5, M_CLOTH, 0.6);
  // ---- the shirt front, the collar (a yellow sweat ring round it), the bow tie
  upoly(b, [-4, 13.4, 6, 13.4, 1, 22], SHIRT, M_CLOTH);
  upoly(b, [-5.6, 10.4, 6.8, 10.4, 6.8, 14.4, -5.6, 14.4], SHIRT, M_CLOTH, { tilt: 0.2 });
  upath(b, [-5.2, 10.8, 0.6, 11.2, 6.4, 10.8], hexU('#C8B060'), 2, undefined, M_CLOTH); upath(b, [-5, 11.6, 6.2, 11.6], hexU('#E0D090'), 1, undefined, M_CLOTH);
  upoly(b, [0.6, 15.6, -5.4, 13, -5.6, 18.6], TIE, M_CLOTH); upoly(b, [1.4, 15.6, 7.4, 13, 7.6, 18.6], TIE, M_CLOTH);
  uball(b, 1, 15.8, 1.5, 1.7, TIE, { mat: M_CLOTH, line: true });
  // ---- the lapels, the coat's brass buttons, the TUCKER badge
  upoly(b, [-6, 14, -13, 22, -11.4, 26, -15, 29, -13, 16], COAT, M_CLOTH, { tilt: 0.3 });
  upoly(b, [8, 14, 15, 22, 13.4, 26, 17, 29, 15, 16], COAT, M_CLOTH, { tilt: -0.3 });
  for (let i = 0; i < 2; i++) for (const bx of [-17, 19]) { uball(b, bx, 30 + i * 6, 1.35, 1.35, BRASS, { mat: M_METAL, line: true, lw: 0.9 }); tint(b, X(bx + 0.4), Y(30.4 + i * 6), L(0.6), L(0.5), hexU('#4A8A6A'), 0.4, M_METAL, 0.5); plot(b, X(bx - 0.4), Y(29.6 + i * 6), WHITE); }
  upoly(b, [14, 22.4, 23, 22.4, 23, 25.8, 14, 25.8], BRASS, M_METAL, { tilt: 0.5 });
  letters(b, 'TUCKER', Math.round(X(14)) + 6, Math.round(Y(22.4)) + 4, BRASS[5], BRASS[1]);
  inkEdges(b, M_CLOTH, COAT[6], [M_METAL, M_SKIN]);
  // ---- the woods': sewer muck, blood down the shirt front and spattered, the near shoulder torn open, chips
  if (k.grime) {
    uball(b, -18, 34, 6, 3, MUCK, { mat: M_OTHER, soft: 0.4, lit: 0.8 });
    run(b, [1, 16, 0.4, 24, 1.6, 32, 1, 39], 4);
    for (const [x, y, r] of [[-10, 26, 1.4], [12, 30, 1.1], [20, 20, 1.6], [-20, 24, 0.9], [6, 36, 1]] as const) clot(b, x, y, r);
    upoly(b, [18, 16, 25, 20, 23, 27, 19, 23], SHIRT, M_CLOTH);
    upath(b, [19.6, 18.6, 22.4, 23], MEAT[2], 2); upath(b, [20, 18.4, 22.6, 22.6], MEAT[0], 1);
    for (let i = 0; i < 8; i++) chip(b, -22 + ((i * 9.1) % 44), 20 + ((i * 7.7) % 18), i * 0.9);
  }
  // ---- the catch-up's: the branch through his chest. Out behind his far shoulder (the coat burst open round it, its
  // point all red, dripping); the hole in his vest (torn open in a ragged star, the meat, a shard of rib out of it, the
  // blood pumped down his front); its front, snapped off a way out (splintered), blood up it, a twig and its leaves
  if (k.branch) {
    const ex = CB.exit, ey = cby(ex), er = cbr(ex);
    tear(b, ex, ey, er + 1.6, er + 2, { bone: true });
    bough(b, -38.4, ex + 0.5, { bloodTo: ex + 0.5, seed: 5 });
    upoly(b, [ex + 0.6, ey - er - 2.4, ex - 3.4, ey - er - 3.6, ex - 0.6, ey - er - 0.6], COAT, M_CLOTH); upoly(b, [ex + 0.6, ey + er + 2, ex - 2.6, ey + er + 4, ex - 0.4, ey + er + 0.6], COAT.slice(1), M_CLOTH);
    const rr = cbr(CB.x);
    const star: number[] = [];
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, q = i % 2 ? 1.25 : 1.8; star.push(CB.x + Math.cos(a) * rr * q, CB.y + Math.sin(a) * rr * q); }
    upoly(b, star, VEST.slice(2), M_CLOTH);
    tear(b, CB.x, CB.y, rr + 1.4, rr + 1.6, { bone: true });
    upoly(b, [CB.x + 3, CB.y - 4.4, CB.x + 7.4, CB.y - 9.6, CB.x + 7.8, CB.y - 8.6, CB.x + 4.4, CB.y - 3.6], BONE, M_OTHER);
    run(b, [CB.x - 1, CB.y + rr, CB.x - 1.6, CB.y + rr + 4, CB.x - 0.8, 39], 6); run(b, [CB.x + 2.6, CB.y + rr, CB.x + 3.4, 38], 3);
    bough(b, CB.x - 2, 25, { bloodTo: CB.x + 2.4, jag: true, seed: 9 });
    const tx = 17, ty = cby(tx) - cbr(tx) + 0.4;
    upath(b, [tx, ty, tx + 2.4, ty - 5, tx + 5.4, ty - 7], BARK[5], 4, M_OTHER); upath(b, [tx, ty, tx + 2.4, ty - 5, tx + 5.4, ty - 7], BARK[1], 2);
    leaf(b, tx + 3, ty - 6, -0.5, 1.15); leaf(b, tx + 6.4, ty - 7.6, 0.5, 1.15);
  }
  // ---- the split's blood, sheeted down off his chin over the collar and the shirt front
  if (k.split > 0.3) {
    const q = Math.min(1, (k.split - 0.3) * 1.6);
    run(b, [3, 12, 2.6, 12 + 6 * q, 3.4, 12 + 14 * q, 2.8, 12 + 26 * q], 8); run(b, [6.4, 12, 7, 12 + 9 * q], 4);
    uball(b, 4.2, 12.6, Math.max(0.3, 3.4 * q), Math.max(0.3, 1.4 * q), [B(1), B(2), B(3), B(4), B(5)], { mat: M_OTHER, line: true });
  }
  return b;
}

// ---------------------------------------------------------------------------------------------------------------
// Keeping them

/** (no document: the headless runs, which never see it; the caller draws the figure-grade close-up instead) */
export const grossCloseupsOn = () => typeof document !== 'undefined';
const kept = new Map<string, HTMLCanvasElement | null>();
const stamp = (key: string, paint: () => Buf) => { let cv = kept.get(key); if (cv === undefined) { cv = toCanvas(paint()); kept.set(key, cv); } return cv; };
const put = (c: Ctx, img: HTMLCanvasElement | null, fr: readonly [number, number]) => { if (img) c.drawImage(img, fr[0], fr[1], BW, BH); };

const baseOf = (red: boolean, capless: boolean) => stamp(`b|${red}|${capless}`, () => paintBase(red, capless));
const bodyOf = (k: BodyKey) => stamp(`B|${k.red}|${k.grime}|${k.branch}|${k.split}`, () => paintBody(k));
// (the usual ones painted ahead, a little at a time, whenever the gross-ups are warmed)
paintAhead(until => {
  const jobs: (() => unknown)[] = [() => baseOf(true, false), () => baseOf(false, false), () => baseOf(false, true), () => baseOf(true, true)];
  for (const j of jobs) { j(); if (performance.now() >= until) return false; }
  return true;
});

export interface HeadState { face: TuckerFace; f: number; talking: boolean; capless: boolean; red: boolean; wounds: TuckerWounds; sd: number }
/** The split's how-far, stepped (each step a stamp). */
export const splitStep = (sd: number) => Math.round(sd * 20) / 20;

/** His head, in the head's units (the caller's transform): the base, the eyes and brows, the mouth, the mustache, what's
 *  on top. */
export const drawGrossHead = (c: Ctx, h: HeadState) => {
  const w = h.wounds, sd = splitStep(h.sd), blind = sd >= 0.45;
  c.save(); c.imageSmoothingEnabled = false;
  put(c, baseOf(h.red, h.capless), HEAD);
  const e = eyesFor(h.face, h.f), nearOk = !w.eye && !blind, farOk = !blind;
  if (nearOk || farOk) put(c, stamp(`e|${e.key}|${h.red}|${nearOk}|${farOk}`, () => paintEyes(h.face, h.f, h.red, nearOk, farOk)), HEAD);
  const m = mouthFor(h.face, h.f, h.talking);
  put(c, stamp(`m|${m.key}|${h.red}`, () => paintMouth(m, h.red)), HEAD);
  const s = stacheFor(h.face, h.f, h.talking);
  put(c, stamp(`s|${s.key}`, () => paintStache(s.curl, s.twitch)), HEAD);
  const tk: TopKey = { capless: h.capless, eye: !!w.eye, saw: !!w.saw, grime: !!w.grime, branch: !!w.branch, sd, clawed: Math.min(5, Math.floor(w.clawed ?? 0)), bloody: Math.round(Math.max(0, Math.min(1, w.bloody ?? 0)) * 4) / 4 };
  put(c, stamp(`t|${tk.capless}|${tk.eye}|${tk.saw}|${tk.grime}|${tk.branch}|${tk.sd}|${tk.clawed}|${tk.bloody}`, () => paintTop(tk)), HEAD);
  c.restore();
};

/** His shoulders and neck (under the head). */
export const drawGrossBody = (c: Ctx, red: boolean, wounds: TuckerWounds, sd: number) => {
  c.save(); c.imageSmoothingEnabled = false;
  put(c, bodyOf({ red, grime: !!wounds.grime, branch: !!wounds.branch, split: sd > 0.3 ? splitStep(sd) : 0 }), BODY);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// THE GORE PASS: a wound painter's animated frames (or the split's gap), drawn into the same 4 px grid, its translucent
// parts dithered, its outline inked, a wet glint along the top of the blood; repainted only when its key changes

const GX0 = -64, GY0 = -48, GWU = 128, GHU = 96;
class Gore {
  private work: HTMLCanvasElement | null = null;
  private wc: CanvasRenderingContext2D | null = null;
  private out: HTMLCanvasElement | null = null;
  private oc: CanvasRenderingContext2D | null = null;
  private keep = new Uint8Array(0);
  private key = '';
  draw(c: Ctx, key: string, paint: (g: Ctx) => void) {
    if (typeof document === 'undefined') { paint(c); return; }
    if (!this.work) {
      const W = GWU * U, H = GHU * U;
      this.work = document.createElement('canvas'); this.work.width = W; this.work.height = H;
      this.wc = this.work.getContext('2d', { willReadFrequently: true });
      this.out = document.createElement('canvas'); this.out.width = W; this.out.height = H;
      this.oc = this.out.getContext('2d');
      this.keep = new Uint8Array(W * H);
    }
    if (!this.wc || !this.oc || !this.out) { paint(c); return; }
    if (key !== this.key) { this.key = key; this.render(paint); }
    c.save(); c.imageSmoothingEnabled = false; c.drawImage(this.out, GX0, GY0, GWU, GHU); c.restore();
  }
  private render(paint: (g: Ctx) => void) {
    const g = this.wc!, W = GWU * U, H = GHU * U, keep = this.keep;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H);
    g.save(); g.setTransform(U, 0, 0, U, -GX0 * U, -GY0 * U); paint(g); g.restore();
    g.setTransform(1, 0, 0, 1, 0, 0);
    const img = g.getImageData(0, 0, W, H), d = img.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, a = d[i * 4 + 3];
      if (!a) { keep[i] = 0; continue; }
      if (a >= 250) { keep[i] = 2; d[i * 4 + 3] = 255; continue; }
      if (a / 255 > bay(x, y)) { keep[i] = 1; d[i * 4 + 3] = 255; } else { keep[i] = 0; d[i * 4 + 3] = 0; }
    }
    for (let y = 2; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      if (keep[i] !== 2) continue;
      const j = i * 4;
      if (!keep[i - 1] || !keep[i + 1] || !keep[i - W] || !keep[i + W]) { d[j] *= 0.32; d[j + 1] *= 0.26; d[j + 2] *= 0.28; continue; }
      const r = d[j], gg = d[j + 1], bb = d[j + 2];
      if (r > 80 && r > gg * 1.8 && r > bb * 1.6 && !keep[i - 2 * W] && hash2(x, y) > 0.4) { d[j] = r + (255 - r) * 0.55; d[j + 1] = gg + (255 - gg) * 0.5; d[j + 2] = bb + (255 - bb) * 0.5; }
    }
    this.oc!.putImageData(img, 0, 0);
  }
}
const gap = new Gore(), making = new Gore();
/** The split's gap (static at its step: kept). */
export const drawGoreGap = (c: Ctx, sd: number, capless: boolean, paint: (g: Ctx) => void) => gap.draw(c, `${splitStep(sd)}|${capless}`, paint);
/** A wound being made: its frames at k (stepped finely) and the frame count (every other frame). */
export const drawGoreMaking = (c: Ctx, wound: string, k: number, f: number, paint: (g: Ctx) => void) => making.draw(c, `${wound}|${Math.round(k * 400)}|${f >> 1}`, paint);
