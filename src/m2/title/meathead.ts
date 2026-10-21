// Meathead up close for Meathead 2's title screen (title/art.ts): the sequel's marquee, so his own painting, a grade up
// from Meathead 1's close-up (scenes/ending.ts drawMeatheadCloseUp, which Meathead 1 keeps). The same man, the same
// face in the same place (the flat-top, the brute block of a head, the dumb look, the grin, the fury), on a 256 x 144
// canvas, doing the double biceps: but oiled up and glistening. Rich stepped skin ramps with a dither between the
// steps, every muscle its own inked form (the deltoids in three heads, the biceps peaked, split down the middle and
// striated, the forearms corded, the triceps hanging), veins standing up on them, sweat beading, the hot spots on the
// oil, the pink neon from behind him running round his edges inside the ink; his spiked wristbands (shirtless, as he
// is in Meathead 2). All of that is painted once (twice: the pump in and out) and kept; each frame only puts it down,
// then the face's moving parts, a drip running down a forearm, and a twinkle off the shine.

import { painting, idleTasks, bayer, rgbOf, type Painter, type RGB } from '../../m1/game/scenes/art/raster';

type Ctx = CanvasRenderingContext2D;

export const ART_W = 256;
export const ART_H = 144;
export type TitleMood = 'dumb' | 'stoked' | 'fury';

/** His skin, darkest to lightest: the shadows going to oxblood (the dusk), the lit side warm and golden. */
const SK = ['#1e0810', '#3a1014', '#581a16', '#76281a', '#94381e', '#ae4c24', '#c4622c', '#d67c38', '#e4964a', '#eeb262', '#f6cc84', '#fde6b0'];
/** The same at Meathead 1's eight steps (the face's details are placed in those). */
const S = [SK[1], SK[3], SK[4], SK[5], SK[7], SK[8], SK[10], SK[11]];
/** The oil's hot spots. */
const SHINE = '#fffcf0';
/** The flat-top: blue-black, gelled. */
const HAIR = ['#020206', '#08080e', '#101018', '#1a1a26', '#262636', '#36364c', '#4c4c68'];
/** The wristbands' leather, the studs' steel. */
const BAND = ['#020204', '#0a0a10', '#16161e', '#24242e', '#383844'];
const STEEL = ['#2a2a34', '#4c4c5a', '#7c7c8c', '#b0b0c0', '#dcdce8', '#ffffff'];
const INK = '#120610';
const VEIN = ['#4a1420', '#82301e', '#b0502c', '#fcd8a0'];
const PINK: RGB = rgbOf('#ff5aa8'), PINK_HOT: RGB = rgbOf('#ffc0e2');
const WHITE = '#fcfcfc', GOLD_L = '#fce0a0';

const R = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const hash = (n: number) => { const x = Math.sin(n * 91.7 + 17.3) * 43758.5453; return x - Math.floor(x); };

/** A tapered capsule (a limb) from (x0, y0), r0 thick, to (x1, y1), r1 thick, as a path. */
const capsule = (g: Ctx, x0: number, y0: number, r0: number, x1: number, y1: number, r1: number) => {
  const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a);
  g.moveTo(x0 + nx * r0, y0 + ny * r0); g.lineTo(x1 + nx * r1, y1 + ny * r1);
  g.arc(x1, y1, r1, a + Math.PI / 2, a - Math.PI / 2, true);
  g.lineTo(x0 - nx * r0, y0 - ny * r0);
  g.arc(x0, y0, r0, a - Math.PI / 2, a + Math.PI / 2, true);
  g.closePath();
};

/** A vein standing up: the shadow it throws, its body, the light along its top. */
const vein = (p: Painter, pts: number[][], thick = 1) => {
  const run = (f: (x: number, y: number) => void) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
      for (let k = 0; k <= n; k++) f(Math.round(x0 + ((x1 - x0) * k) / n), Math.round(y0 + ((y1 - y0) * k) / n));
    }
  };
  run((x, y) => { for (const [dx, dy] of [[1, 1], [1, 2], [2, 1]]) if (p.painted(x + dx, y + dy)) p.px(x + dx, y + dy, SK[3]); });
  run((x, y) => { p.px(x, y, VEIN[2]); p.px(x, y + 1, VEIN[1]); if (thick > 1) { p.px(x + 1, y, VEIN[2]); p.px(x + 1, y + 1, VEIN[1]); } });
  run((x, y) => { p.px(x, y - 1, VEIN[3]); });
};

/** A bead of sweat: its shadow, the drop, the light in it. */
const bead = (p: Painter, x: number, y: number, big = false) => {
  p.px(x + 1, y + 2, SK[4]); if (big) p.px(x + 2, y + 2, SK[4]);
  p.rect(x, y, big ? 2 : 1, 2, SK[10]); if (big) p.rect(x, y + 1, 2, 2, SK[9]);
  p.px(x, y, SHINE);
};

/** Fine lines across a form (the grain of a muscle), every `gap` px along its length, where it's painted. */
const striate = (p: Painter, m: Uint8Array, x0: number, y0: number, x1: number, y1: number, n: number, len: number, ang: number, col: string, skip = 2) => {
  for (let i = 0; i < n; i++) {
    const k = (i + 0.5) / n, cx = x0 + (x1 - x0) * k, cy = y0 + (y1 - y0) * k;
    for (let j = -len; j <= len; j++) {
      if (Math.abs(j) % skip === 1 && hash(i * 7.3 + j) < 0.35) continue;
      const x = Math.round(cx + Math.cos(ang) * j), y = Math.round(cy + Math.sin(ang) * j);
      if (x >= 0 && y >= 0 && x < p.w && y < p.h && m[y * p.w + x] && p.painted(x - 1, y) && p.painted(x + 1, y)) p.px(x, y, col, 0.55);
    }
  }
};

/**
 * The neon behind him caught round his edges, just inside the ink: a hot pink line, softer pink dithered in past it;
 * hardest across the top and the outsides (where the light's coming round him), none down into the bottom edge.
 */
const neonRim = (p: Painter) => {
  const { w, h, d } = p, m = new Uint8Array(w * h);
  for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 0 ? 1 : 0;
  const D = p.dist(m);
  for (let y = 0; y < h - 6; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, dd = D[i];
    if (!m[i] || dd < 1.9 || dd > 5) continue;
    // (which way's out: down the slope of the distance)
    const gx = (x < w - 1 ? D[i + 1] : 0) - (x > 0 ? D[i - 1] : 0), gy = (y < h - 1 ? D[i + w] : 0) - (y > 0 ? D[i - w] : 0);
    const gl = Math.hypot(gx, gy) || 1, ox = -gx / gl, oy = -gy / gl;
    const face = Math.max(0, -oy * 0.8 + Math.abs(ox) * 0.75);
    if (face < 0.2) continue;
    const o = i * 4, k = dd < 2.9 ? 0.82 * face : dd < 4 ? (bayer(x, y) + 0.5 < 0.55 * face ? 0.5 : 0) : (bayer(x, y) + 0.5 < 0.25 * face ? 0.35 : 0);
    if (!k) continue;
    const c = dd < 2.9 && face > 0.7 ? PINK_HOT : PINK;
    d[o] += (c[0] - d[o]) * k; d[o + 1] += (c[1] - d[o + 1]) * k; d[o + 2] += (c[2] - d[o + 2]) * k;
  }
};

// ---------------------------------------------------------------------------
// The still part: chest, traps, neck, head, flat-top, and both arms up
// ---------------------------------------------------------------------------

const paintBody = (p: Painter) => {
  const I = INK;
  // The pecs, under it all (the marquee's over most of them): two slabs, the split between them deep
  for (const s of [-1, 1]) {
    p.form(g => { g.ellipse(128 + s * 30, 142, 32, 18, s * 0.12, 0, Math.PI * 2); }, { ramp: SK, bevel: 16, amb: 0.1, ink: I, spec: SHINE, wet: 0.9 });
  }
  // The traps and shoulders, off the bottom and the sides; sloping up into the neck like a mountainside
  const traps = p.form(g => { g.moveTo(-6, 150); g.lineTo(-6, 132); g.bezierCurveTo(30, 124, 64, 112, 96, 92); g.lineTo(160, 92); g.bezierCurveTo(192, 112, 226, 124, 262, 132); g.lineTo(262, 150); g.lineTo(196, 150); g.bezierCurveTo(170, 128, 150, 126, 128, 126); g.bezierCurveTo(106, 126, 86, 128, 60, 150); g.closePath(); },
    { ramp: SK, bevel: 22, amb: 0.1, ink: I, inkIn: SK[2], spec: SHINE, wet: 0.85 });
  gloss(p, traps, 2.4, 4.4);
  for (const s of [-1, 1]) {
    striate(p, traps, 128 + s * 40, 112, 128 + s * 80, 126, 7, 6, s < 0 ? 1.15 : Math.PI - 1.15, SK[4]);
    // (the collarbone, a ridge: lit along its top, shadow under)
    for (let k = 0; k < 30; k++) { const x = 128 + s * (14 + k), y = 128 + Math.round(k * 0.12 + (k * k) / 500); p.px(x, y + 1, SK[3]); p.px(x, y, SK[5]); p.px(x, y - 1, SK[10]); }
  }
  p.line(128, 130, 128, 144, SK[2]); p.line(127, 132, 127, 144, SK[4]);
  // The neck: a trunk, wider at the bottom than his jaw
  p.form(g => { g.moveTo(102, 86); g.lineTo(154, 86); g.bezierCurveTo(156, 102, 160, 114, 168, 124); g.bezierCurveTo(144, 132, 112, 132, 88, 124); g.bezierCurveTo(96, 114, 100, 102, 102, 86); g.closePath(); },
    { ramp: SK, bevel: 14, amb: 0.12, ink: I, inkIn: SK[2], spec: SHINE, wet: 0.6 });
  for (const [x0, x1] of [[104, 123], [152, 133]] as const) for (let k = 0; k <= 24; k++) { const x = Math.round(x0 + ((x1 - x0) * k) / 24), y = 100 + k; p.px(x, y, SK[3]); p.px(x - 1, y, SK[9]); p.px(x + 1, y, SK[4]); }
  p.disc(128, 127, 4, 2, SK[2]);
  for (let x = 96; x < 162; x++) for (let y = 96; y < 112; y++) if (p.painted(x, y) && bayer(x, y) + 0.5 < 0.9 - (y - 96) / 14) p.px(x, y, y < 101 ? SK[1] : SK[3]);
  vein(p, [[150, 104], [152, 112], [156, 120]]); vein(p, [[106, 104], [104, 112], [100, 120]]);
  // The ears
  for (const [ex, s] of [[87, -1], [169, 1]] as const) {
    p.form(g => { g.ellipse(ex, 58, 6, 11, s * 0.08, 0, Math.PI * 2); }, { ramp: SK, bevel: 4, amb: s < 0 ? 0.2 : 0.1, ink: I });
    p.line(ex + s, 51, ex + s, 64, SK[3]); p.line(ex + s * 2, 52, ex + s * 2, 63, SK[1]); p.line(ex, 50, ex, 52, SK[9]); p.px(ex + s, 66, SK[3]);
  }
  // The head: a block, the jaw square, the sides rounding off; a sheen on him
  const head = p.form(g => {
    g.moveTo(94, 24); g.lineTo(162, 24); g.bezierCurveTo(166, 40, 167, 58, 166, 74); g.lineTo(164, 92); g.bezierCurveTo(160, 100, 152, 106, 140, 108);
    g.lineTo(116, 108); g.bezierCurveTo(104, 106, 96, 100, 92, 92); g.lineTo(90, 74); g.bezierCurveTo(89, 58, 90, 40, 94, 24); g.closePath();
  }, { ramp: SK, bevel: 18, amb: 0.18, ink: I, inkIn: SK[1], spec: SHINE, wet: 0.45 });
  gloss(p, head, 2.4, 3.6, 0.95);
  backGlow(p, head, 2, 5);
  for (const ex of [111, 145]) for (let y = 49; y < 64; y++) for (let x = ex - 13; x <= ex + 13; x++) {
    const dd = ((x - ex) / 13) ** 2 + ((y - 56) / 7.5) ** 2;
    if (dd < 1 && bayer(x, y) + 0.5 < 0.85 - dd * 0.6) p.px(x, y, ex < 128 ? SK[6] : SK[5]);
  }
  for (const s of [-1, 1]) for (let y = 70; y < 84; y++) for (let x = 128 + s * 22; s < 0 ? x > 96 : x < 160; x += s) {
    const dx = (Math.abs(x - 128) - 30) / 8, e = (y - 76) / 6;
    if (dx * dx + e * e < 1 && bayer(x, y) + 0.5 < 0.5 - (dx * dx + e * e) * 0.4) p.px(x, y, SK[5]);
  }
  for (let y = 30; y < 46; y++) for (let x = 151; x < 162; x++) if (bayer(x, y) + 0.5 < 0.5) p.px(x, y, SK[5]);
  // (the cheekbones catching the light; the shine across his brow)
  for (const [cx, cy, n] of [[104, 66, 5], [150, 67, 3]] as const) for (let k = 0; k < n; k++) p.px(cx + k, cy - (k >> 1), SK[10]);
  for (let x = 106; x < 124; x++) if (bayer(x, 34) + 0.5 < 0.7) p.px(x, 34, SK[10]);
  p.rect(110, 33, 5, 1, SHINE); p.px(116, 33, SK[11]);
  // The flat-top: dead flat on top, gelled (a hard shine along it), the sides square, every bristle stood up
  p.form(g => { g.moveTo(87, 46); g.lineTo(87, 9); g.quadraticCurveTo(87, 4, 92, 4); g.lineTo(164, 4); g.quadraticCurveTo(169, 4, 169, 9); g.lineTo(169, 46); g.lineTo(164, 46); g.lineTo(163, 30); g.lineTo(93, 30); g.lineTo(92, 46); g.closePath(); },
    { ramp: HAIR, bevel: 5, amb: 0.3, ink: I, gain: 1.1 });
  for (let x = 89; x < 168; x++) {
    p.px(x, 5, x < 136 ? '#8c8cb4' : '#5a5a78'); p.px(x, 6, (x & 1) ? '#3a3a52' : '#56567a');
    if ((x & 1) === 0) { p.line(x, 8, x, 28, x < 110 ? '#262636' : '#1a1a26'); p.px(x, 7, '#6a6a8c'); if (x < 120 && x % 4 === 0) p.line(x, 9, x, 12, '#4a4a66'); }
  }
  for (let x = 96; x < 126; x += 3) p.px(x, 5, '#c8c8e8');
  p.line(88, 9, 88, 44, '#3a3a52');
  p.rect(93, 29, 70, 1, '#050505');
  for (let x = 93; x < 163; x++) if (bayer(x, 30) + 0.5 < 0.6) p.px(x, 30, SK[3]);
  for (let x = 93; x < 163; x++) if (bayer(x, 31) + 0.5 < 0.25) p.px(x, 31, SK[5]);
  // The vein at his temple
  vein(p, [[105, 32], [105, 35], [106, 38], [108, 39], [111, 40]], 2);
  // The nose: the bridge lit down its left, the shadow side, the ball of it (shining), the nostrils
  p.line(126, 56, 125, 70, SK[10]); p.line(127, 58, 127, 70, SK[8]);
  p.line(130, 58, 131, 71, SK[5]); p.line(131, 60, 132, 70, SK[3]);
  p.form(g => { g.ellipse(128, 72, 7, 4.5, 0, 0, Math.PI * 2); }, { ramp: SK, bevel: 4, amb: 0.2, ink: null, spec: SHINE, wet: 0.9 });
  p.form(g => { g.ellipse(120.5, 73.5, 3, 2.5, 0, 0, Math.PI * 2); g.moveTo(138.5, 73.5); g.ellipse(135.5, 73.5, 3, 2.5, 0, 0, Math.PI * 2); }, { ramp: SK, bevel: 2, amb: 0.2, ink: null });
  p.rect(121, 75, 4, 1, '#3a1208'); p.rect(132, 75, 4, 1, '#3a1208'); p.px(122, 74, '#6a2a14'); p.px(133, 74, '#6a2a14');
  p.line(118, 76, 138, 76, SK[3]); p.line(120, 77, 136, 77, SK[5]);
  p.px(124, 70, SHINE); p.px(125, 70, SK[11]);
  p.line(126, 78, 126, 81, SK[5]); p.line(130, 78, 130, 81, SK[5]); p.line(128, 79, 128, 81, SK[9]);
  // Stubble over the jaw and the lip
  for (let y = 80; y < 108; y++) for (let x = 92; x < 165; x++) {
    if (!p.painted(x, y) || (y < 84 && Math.abs(x - 128) < 30)) continue;
    const side = Math.max(0, Math.abs(x - 128) - 26) / 12, low = (y - 78) / 22;
    if (hash(x * 0.71 + y * 1.37) < Math.min(0.6, Math.max(side * 0.5, low) * 0.6) && (x + y) % 2 === 0) p.px(x, y, (x * 3 + y) % 5 ? '#7a3c22' : '#5a2a16');
  }
  p.line(128, 99, 128, 105, SK[3]); p.px(127, 104, SK[3]); p.line(126, 99, 126, 103, SK[9]);
  // (sweat up on his forehead and his temples)
  for (const [x, y, b] of [[100, 36, 1], [119, 37, 0], [140, 35, 1], [154, 40, 0], [96, 48, 0], [160, 52, 1], [133, 33, 0]] as const) bead(p, x, y, !!b);
};

/**
 * The oil on a form: a hard crescent of shine just in from its lit edge (up and to the left), the way a glossy thing
 * catches a light: the hottest pixels white, a step down either side of it.
 */
const gloss = (p: Painter, m: Uint8Array, d0 = 2.4, d1 = 4.6, k = 1) => {
  const { w, h } = p, D = p.dist(m);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x, dd = D[i];
    if (!m[i] || dd < d0 || dd > d1) continue;
    const gx = D[i + 1] - D[i - 1], gy = D[i + w] - D[i - w], gl = Math.hypot(gx, gy) || 1;
    const f = ((gx / gl) * 0.55 + (gy / gl) * 0.83) * k;
    if (f > 0.9) p.px(x, y, SHINE);
    else if (f > 0.72) p.px(x, y, SK[11]);
    else if (f > 0.5 && bayer(x, y) + 0.5 < (f - 0.5) * 4) p.px(x, y, SK[10]);
  }
};

/** The neon from behind him bouncing into a form's shadow side (down and to the right): a pink sheen in from its edge. */
const backGlow = (p: Painter, m: Uint8Array, d0 = 2, d1 = 5) => {
  const { w, h, d } = p, D = p.dist(m);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x, dd = D[i];
    if (!m[i] || dd < d0 || dd > d1) continue;
    const gx = D[i + 1] - D[i - 1], gy = D[i + w] - D[i - w], gl = Math.hypot(gx, gy) || 1;
    const f = -((gx / gl) * 0.7 + (gy / gl) * 0.7);
    if (f < 0.55 || bayer(x, y) + 0.5 > (f - 0.45) * 1.6 * (1 - (dd - d0) / (d1 - d0 + 1))) continue;
    const o = i * 4, k = 0.45;
    d[o] += (PINK[0] - d[o]) * k; d[o + 1] += (PINK[1] - d[o + 1]) * k; d[o + 2] += (PINK[2] - d[o + 2]) * k;
  }
};
/** The shadow a form throws down onto what's under it: `n` rows under its bottom edge, darkest nearest. */
const castBelow = (p: Painter, m: Uint8Array, n = 3, dx = 1) => {
  const { w, h } = p;
  for (let y = h - 2; y >= 0; y--) for (let x = 1; x < w - 1; x++) {
    if (!m[y * w + x] || m[(y + 1) * w + x]) continue;
    for (let k = 1; k <= n; k++) {
      const yy = y + k, xx = x + Math.round(dx * k * 0.5);
      if (yy >= h || m[yy * w + xx] || !p.painted(xx, yy)) break;
      if (k === 1 || bayer(xx, yy) + 0.5 < 1 - k / (n + 1)) p.px(xx, yy, k === 1 ? SK[1] : SK[2]);
    }
  }
};

/** One arm up (s -1: the one on the left of the picture; 1 the other, the same arm mirrored, lit the same way). */
const paintArm = (p: Painter, s: number, pump: number) => {
  const X = (x: number) => (s < 0 ? x : ART_W - x);
  const I = INK, pk = pump * 2;
  const oil = (bevel: number, amb = 0.08, wet = 0.95, bump?: (x: number, y: number) => number) => ({ ramp: SK, bevel, amb, ink: I, inkIn: SK[1], spec: SHINE, wet, bump });
  /** A dome on a form (so it rounds over all the way across, not just at its edges). */
  const dome = (cx: number, cy: number, rx: number, ry: number, ht: number) => (x: number, y: number) => ht * Math.sqrt(Math.max(0, 1 - ((x - X(cx)) / rx) ** 2 - ((y - cy) / ry) ** 2));
  // The triceps, hanging heavy under the upper arm
  p.form(g => { g.ellipse(X(46), 114, 23, 10, s * 0.08, 0, Math.PI * 2); }, oil(9, 0.06, 0.6));
  // The upper arm, out level from the shoulder to the elbow
  p.form(g => capsule(g, X(72), 110, 15, X(22), 101, 11), oil(12));
  // The forearm back up from the elbow, leaning in toward his head: thick by the elbow, tapering to the wrist
  const fore1 = p.form(g => { capsule(g, X(21), 98, 11.5, X(25), 70, 12.5); }, oil(8, 0.06, 0.95, dome(22, 80, 14, 26, 10)));
  gloss(p, fore1, 2.4, 3.8);
  backGlow(p, fore1, 2, 4);
  const fore = p.form(g => { capsule(g, X(25), 72, 12, X(34), 47, 7.5); }, oil(9));
  gloss(p, fore, 2.4, 3.8);
  // (the muscle down its outside: a groove, lit along its far side)
  for (let k = 0; k < 30; k++) { const y = 54 + k, x = X(Math.round(31 - k * 0.28)); p.px(x, y, SK[3]); p.px(x - s, y, SK[8]); }
  vein(p, [[X(30), 52], [X(27), 60], [X(27), 68], [X(24), 78], [X(23), 88]]);
  // The bicep: peaked up off the upper arm like a mountain, split down the middle into its two heads
  const bi = p.form(g => {
    g.moveTo(X(25), 104); g.bezierCurveTo(X(20), 88, X(28), 63 - pk, X(43), 60 - pk); g.bezierCurveTo(X(58), 57 - pk, X(70), 76, X(70), 99);
    g.bezierCurveTo(X(62), 109, X(37), 111, X(25), 104); g.closePath();
  }, oil(10, 0.06, 1, dome(45, 82, 30, 28, 22)));
  castBelow(p, bi, 4, s < 0 ? 1 : -1);
  gloss(p, bi, 2.4, 5.4);
  backGlow(p, bi, 2, 6);
  // (the split: a soft groove down from near the peak, shadowed, lit along its far side)
  for (let k = 0; k < 24; k++) { const y = 72 - pk + k, x = X(Math.round(46 - k * 0.22)); if (bi[y * p.w + x] && k > 2) { p.px(x, y, SK[5]); if (k > 6) p.px(x - s, y, SK[4]); p.px(x + s, y, SK[9]); } }
  // (the crease where the forearm folds into it)
  for (let k = 0; k < 7; k++) { p.px(X(25 + k), 101 - k * 1.6, SK[1]); p.px(X(26 + k), 101 - k * 1.6, SK[3]); }
  // (the vein over the peak, branching)
  vein(p, [[X(34), 98], [X(40), 91], [X(46), 88], [X(56), 88]]);
  vein(p, [[X(46), 88], [X(50), 78 - pk]]);
  // The deltoid capping the shoulder, the line between its front and side heads
  const delt = p.form(g => { g.ellipse(X(74), 105, 17, 16, -s * 0.35, 0, Math.PI * 2); }, oil(7, 0.06, 1, dome(74, 105, 19, 18, 14)));
  gloss(p, delt, 2.4, 4.6);
  backGlow(p, delt, 2, 5);
  for (let k = 4; k < 22; k++) {
    const t = k / 21, x = X(Math.round(76 - 8 * t + Math.sin(t * Math.PI) * -3)), y = 90 + k;
    if (delt[y * p.w + x]) { p.px(x, y, SK[4]); p.px(x + s, y, SK[9]); }
  }
  // The wristband: black leather, three steel spikes out the front
  p.form(g => { g.rect(X(23) - (s < 0 ? 0 : 23), 45, 23, 9); }, { ramp: BAND, bevel: 3, amb: 0.25, ink: I, spec: '#8888a0', wet: 0.6 });
  for (const sx of [27, 34, 41]) {
    const x = X(sx) - (s < 0 ? 0 : 1);
    p.px(x, 46, STEEL[5]); p.rect(x - 1, 47, 3, 1, STEEL[3]); p.px(x - 1, 47, STEEL[4]); p.rect(x - 1, 48, 3, 1, STEEL[2]); p.rect(x - 2, 49, 5, 2, STEEL[1]);
    p.px(x - 1, 49, STEEL[3]); p.px(x, 49, STEEL[4]); p.rect(x - 2, 51, 5, 1, STEEL[0]);
  }
  p.rect(X(23) - (s < 0 ? 0 : 23), 53, 23, 1, BAND[3]);
  // The fist on top of it: square, the knuckles in a row along the top, the fingers folded, the thumb across
  const fist = p.form(g => { const x0 = s < 0 ? 22 : ART_W - 48; g.roundRect(x0, 23, 26, 23, 5); }, oil(6, 0.15, 0.8));
  gloss(p, fist, 1.9, 2.9);
  for (let k = 0; k < 4; k++) {
    const kx = X(27 + k * 5);
    p.form(g => { g.ellipse(kx, 27, 3, 3, 0, 0, Math.PI * 2); }, { ramp: SK, bevel: 3, amb: 0.2, ink: null, spec: SHINE, wet: 1 });
    if (k) { p.line(X(25 + k * 5), 29, X(25 + k * 5), 37, SK[2]); p.line(X(25 + k * 5) - s, 29, X(25 + k * 5) - s, 37, SK[8]); }
  }
  p.form(g => capsule(g, X(26), 40, 3, X(43), 38, 3.5), { ramp: SK, bevel: 3, amb: 0.2, ink: SK[1], spec: SHINE, wet: 0.9 });
  p.line(X(27), 43, X(43), 42, SK[2]);
  for (let k = 0; k < 4; k++) p.line(X(26 + k * 5), 34, X(28 + k * 5), 34, SK[4]);
  // (sweat beading on him)
  for (const [x, y, b] of [[52, 78, 1], [36, 94, 0], [22, 64, 1], [82, 98, 0]] as const) bead(p, X(x) - (s < 0 ? 0 : 1), y - (y < 90 ? pk : 0), !!b);
};

const bodyStill = (pump: number) => painting(`m2-title-mh-${pump}`, ART_W, ART_H, p => {
  paintBody(p);
  paintArm(p, -1, pump);
  paintArm(p, 1, pump);
  neonRim(p);
});

// ---------------------------------------------------------------------------
// The face's moving parts (Meathead 1's, in his new skin)
// ---------------------------------------------------------------------------

const cuBrow = (ctx: Ctx, x0: number, x1: number, y0: number, y1: number, t0: number, t1: number, arch = 0) => {
  for (let x = x0; x <= x1; x++) {
    const k = (x - x0) / Math.max(1, x1 - x0);
    const top = Math.round(y0 + (y1 - y0) * k - Math.sin(k * Math.PI) * arch), th = Math.max(2, Math.round(t0 + (t1 - t0) * k));
    R(ctx, x, top, 1, th, HAIR[1]);
    if (hash(x * 1.7 + y0) < 0.45) R(ctx, x, top - 1, 1, 1, HAIR[0]);
    if (x % 3 === 1) R(ctx, x, top + 1, 1, Math.max(1, th - 3), HAIR[4]);
    if (x % 5 === 2) R(ctx, x, top, 1, 1, HAIR[5]);
    R(ctx, x, top + th, 1, 1, S[3]);
  }
};

const cuEye = (ctx: Ctx, cx: number, cy: number, hw: number, hh: number, o: { px?: number; py?: number; ir?: number; lid?: number; red?: boolean; pin?: boolean; sparkle?: boolean } = {}) => {
  const half = (dy: number) => Math.round(hw * Math.sqrt(Math.max(0, 1 - (dy / (hh + 0.6)) ** 2)));
  const inEye = (x: number, y: number) => Math.abs(y - cy) <= hh && Math.abs(x - cx + 0.5) < half(y - cy);
  const lid = o.lid ?? 0, top = cy - hh + lid;
  for (let dy = -hh + lid; dy <= hh; dy++) { const w = half(dy); if (w > 0) R(ctx, cx - w, cy + dy, w * 2, 1, cy + dy === top ? '#c8b0a8' : Math.abs(dy) === hh ? '#e8d8d0' : '#f8f0e8'); }
  if (o.red) for (const [s, dy] of [[-1, 0], [1, -1], [1, 1]] as const) { const w = half(dy); R(ctx, cx + s * (w - 3), cy + dy, 3, 1, '#e05860'); }
  const ir = o.ir ?? 3, ix = cx + (o.px ?? 0), iy = cy + (o.py ?? 0);
  for (let y = iy - ir; y <= iy + ir; y++) for (let x = ix - ir; x <= ix + ir; x++) {
    if (y < top || !inEye(x, y)) continue;
    const d = Math.hypot(x - ix, y - iy); if (d > ir + 0.3) continue;
    const pupil = o.pin ? d < 0.8 : d < ir * 0.5;
    R(ctx, x, y, 1, 1, pupil ? INK : d > ir - 0.8 ? '#0e2260' : y > iy ? '#4888ec' : '#2a5cc0');
  }
  if (!o.pin && inEye(ix - 1, iy - 1) && iy - 1 >= top) R(ctx, ix - 1, iy - 1, 1, 1, WHITE);
  if (o.sparkle) { R(ctx, ix - 2, iy - 2, 2, 2, WHITE); R(ctx, ix + 1, iy + 1, 1, 1, WHITE); }
  for (let dy = -hh; dy < -hh + lid; dy++) { const w = half(dy); if (w > 0) R(ctx, cx - w, cy + dy, w * 2, 1, S[4]); }
  for (let dx = -hw - 1; dx <= hw; dx++) {
    const w = Math.abs(dx + 0.5) / (hw + 0.5), y = Math.round(top - 1 - (lid ? 0 : Math.sqrt(Math.max(0, 1 - w * w)) * 0.5));
    R(ctx, cx + dx, y, 1, w < 0.75 ? 2 : 1, INK);
  }
  const outer = cx < 128 ? -1 : 1;
  R(ctx, cx + outer * (hw + 1) - (outer < 0 ? 1 : 0), top - 2, 2, 1, INK);
  for (let dx = -hw + 2; dx < hw - 1; dx++) R(ctx, cx + dx, cy + hh + 1, 1, 1, S[2]);
  for (let dx = -hw + 3; dx < hw - 2; dx++) R(ctx, cx + dx, cy + hh + 2, 1, 1, S[6]);
};

const LIP = '#a0402c', LIP_D = '#561410', MOUTH = '#340406', TOOTH = '#f8f0e0', TOOTH_S = '#c8bca8', TONGUE = '#c84858';
const cuLine = (ctx: Ctx, x0: number, x1: number, y: number, bend: (k: number) => number = () => 0) => {
  for (let x = x0; x <= x1; x++) {
    const k = (x - x0) / (x1 - x0), yy = Math.round(y + bend(k)), edge = k < 0.08 || k > 0.92;
    R(ctx, x, yy - 1, 1, 1, edge ? S[3] : '#8a3a24'); R(ctx, x, yy, 1, 1, LIP_D);
    if (!edge) { R(ctx, x, yy + 1, 1, 1, LIP); R(ctx, x, yy + 2, 1, 1, k > 0.3 && k < 0.5 ? '#e07a60' : S[5]); R(ctx, x, yy + 3, 1, 1, S[3]); }
  }
  R(ctx, x0 - 1, Math.round(y + bend(0)) - 1, 1, 2, S[2]); R(ctx, x1 + 1, Math.round(y + bend(1)) - 1, 1, 2, S[2]);
};
const cuTongue = (ctx: Ctx, x: number, y: number, w: number, h: number) => {
  for (let r = 0; r < h; r++) R(ctx, x, y + r, w, 1, r === 0 ? '#e87888' : TONGUE);
  R(ctx, x + Math.floor(w / 2), y + 1, 1, Math.max(1, h - 2), '#a03040');
};
const cuOpen = (ctx: Ctx, x: number, y: number, w: number, h: number, o: { top?: boolean; bottom?: boolean; tongue?: boolean; gritted?: boolean; grin?: boolean }) => {
  const inset = (r: number) => {
    if (o.grin) return Math.round((r / Math.max(1, h - 1)) ** 2 * w * 0.22);
    return Math.max(0, 3 - Math.min(r, h - 1 - r) * 1.5) | 0;
  };
  for (let r = 0; r < h; r++) { const i = inset(r); R(ctx, x + i, y + r, w - i * 2, 1, MOUTH); }
  if (o.tongue && h > 5) { const tw = Math.round(w * 0.6), tx = x + Math.round((w - tw) / 2), th = Math.min(5, Math.round(h / 2)); cuTongue(ctx, tx, y + h - th, tw, th); }
  const teeth = (ty: number, th: number, upper: boolean) => {
    for (let k = 0; k < w; k++) {
      const i = inset(upper ? Math.min(h - 1, ty - y) : h - 1), xx = x + k;
      if (xx < x + i || xx >= x + w - i) continue;
      R(ctx, xx, ty, 1, th, TOOTH); R(ctx, xx, upper ? ty + th - 1 : ty, 1, 1, TOOTH_S);
      if ((k + 2) % 5 === 0) R(ctx, xx, ty, 1, th, TOOTH_S);
      if (upper && (k + 4) % 5 === 0) R(ctx, xx, ty, 1, 1, WHITE);
    }
  };
  if (o.gritted) {
    for (let r = 0; r < h; r++) { const i = inset(r); R(ctx, x + i, y + r, w - i * 2, 1, r === Math.floor(h / 2) ? '#7a6a58' : TOOTH); }
    for (let k = 3; k < w - 2; k += 4) { R(ctx, x + k, y + 1, 1, h - 2, TOOTH_S); R(ctx, x + k - 2, y + 1, 1, 1, WHITE); }
    R(ctx, x + 2, y + h - 2, w - 4, 1, TOOTH_S);
  } else {
    if (o.top) teeth(y, Math.max(2, Math.min(4, Math.round(h * 0.28))), true);
    if (o.bottom) teeth(y + h - Math.max(2, Math.round(h * 0.22)), Math.max(2, Math.round(h * 0.22)), false);
  }
  for (let r = -1; r <= h; r++) {
    const i = inset(Math.max(0, Math.min(h - 1, r)));
    if (r === -1 || r === h) { R(ctx, x + i, y + r, w - i * 2, 1, r < 0 ? LIP_D : LIP); continue; }
    R(ctx, x + i - 1, y + r, 1, 1, LIP_D); R(ctx, x + w - i, y + r, 1, 1, LIP_D);
  }
  R(ctx, x + inset(h - 1) + 1, y + h + 1, w - inset(h - 1) * 2 - 2, 1, S[5]);
  R(ctx, x + inset(h - 1) + 2, y + h + 2, w - inset(h - 1) * 2 - 4, 1, S[3]);
  R(ctx, x + inset(0), y - 2, w - inset(0) * 2, 1, '#8a3a24');
};

/** Fury, over him: flushed (dithered), the veins up over his head and down his neck, steam out of his nose. */
const furyOver = (ctx: Ctx, t: number) => {
  const throb = t % 12 < 6 ? 1 : 0;
  for (let y = 40; y < 104; y++) for (let x = 92 + (y % 2); x < 164; x += 2) {
    if (y < 60 && x > 118 && x < 138) continue;
    if (hash(x * 0.37 + y * 1.71) < 0.5 + (y - 40) / 128) R(ctx, x, y, 1, 1, 'rgba(220, 30, 30, 0.24)');
  }
  const V = (pts: number[][]) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      for (let k = 0; k <= n; k++) { const x = x0 + ((x1 - x0) * k) / n, y = y0 + ((y1 - y0) * k) / n; R(ctx, x + 1, y + 1, 2 + throb, 2 + throb, VEIN[0]); R(ctx, x, y, 2 + throb, 2 + throb, VEIN[2]); R(ctx, x, y, 1, 1, VEIN[3]); }
    }
  };
  V([[100, 46], [104, 38], [108, 32], [112, 30]]); V([[104, 38], [100, 32]]);
  V([[156, 46], [152, 38], [146, 32], [142, 30]]); V([[152, 38], [158, 32]]);
  V([[124, 34], [127, 40], [126, 44]]);
  V([[106, 102], [104, 112], [100, 122]]); V([[150, 102], [152, 112], [156, 122]]);
  for (const side of [-1, 1]) for (let k = 0; k < 4; k++) {
    const q = ((t * 1.5 + k * 9) % 36) / 36, px = 128 + side * (6 + q * 34), py = 76 + q * 10, r = 2 + q * 6;
    ctx.fillStyle = `rgba(240, 240, 250, ${0.75 - q * 0.6})`;
    for (let yy = -Math.floor(r); yy <= r; yy++) { const w = Math.round(Math.sqrt(Math.max(0, r * r - yy * yy))); ctx.fillRect(Math.round(px - w), Math.round(py + yy), w * 2, 1); }
  }
};

/** Fury on his arms too: the veins on them pumped up red and throbbing. */
const furyArms = (ctx: Ctx, t: number, pump: number) => {
  if (t % 12 >= 6) return;
  for (const s of [-1, 1]) {
    const X = (x: number) => (s < 0 ? x : ART_W - x - 1);
    for (const [x, y] of [[40, 91], [46, 88], [52, 88], [27, 60], [27, 68], [24, 78]] as const) {
      const yy = y - (x > 30 && y < 90 ? pump * 2 : 0);
      R(ctx, X(x), yy, 2, 2, VEIN[2]); R(ctx, X(x), yy - 1, 2, 1, VEIN[3]);
    }
  }
};

// ---------------------------------------------------------------------------

/** The twinkles off the oil (where the shine's hottest), each on its own clock. */
const GLINTS: [number, number, number][] = [[39, 70, 0], [ART_W - 41, 70, 23], [70, 93, 47], [ART_W - 74, 93, 11], [111, 33, 61], [30, 26, 35], [ART_W - 32, 26, 52]];
const twinkle = (ctx: Ctx, x: number, y: number, f: number) => {
  if (f < 0 || f >= 14) return;
  const s = f < 3 ? 1 : f < 9 ? 3 : 1, c = f < 9 ? WHITE : GOLD_L;
  R(ctx, x - s, y, s * 2 + 1, 1, c); R(ctx, x, y - s, 1, s * 2 + 1, c);
  if (f >= 4 && f < 8) { R(ctx, x - 1, y - 1, 3, 3, WHITE); R(ctx, x - 1, y - 1, 1, 1, '#ffd0ec'); R(ctx, x + 1, y + 1, 1, 1, '#ffd0ec'); }
};
/** A drop running down a forearm, the other side's later. */
const drip = (ctx: Ctx, t: number) => {
  for (const s of [-1, 1]) {
    const q = ((t + (s > 0 ? 70 : 0)) % 140) / 60;
    if (q > 1) continue;
    const x = s < 0 ? 28 - Math.round(q * 6) : ART_W - 28 + Math.round(q * 6) - 1, y = 56 + Math.round(q * q * 30);
    R(ctx, x, y - 2, 1, 2, SK[9]); R(ctx, x, y, 2, 2, SK[10]); R(ctx, x + 1, y + 2, 1, 1, SK[4]); R(ctx, x, y, 1, 1, SHINE);
  }
};

// ---------------------------------------------------------------------------
// The disguise (the gym's closing: the public thinks he's in Guantanamo): thick black nerd glasses, worn from then on
// ---------------------------------------------------------------------------

/** The frames' acetate: near black, a cold sheen on the lit edges. */
const FRAME = ['#020204', '#07070b', '#101016', '#1a1a24', '#282836', '#3c3c50', '#5a5a74'];
/** Where the lenses sit (their outer rims), the bridge between them over his nose. */
const LENS = [{ x0: 94, x1: 127 }, { x0: 129, x1: 162 }];
const LENS_Y0 = 46, LENS_Y1 = 69;

/** A light on see-through glass: the colour put down outright, at least `a` opaque (a blend would keep the glass's
 *  faint alpha and lose the streak). */
const onGlass = (p: Painter, x: number, y: number, col: string, a: number) => {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= p.w || y >= p.h) return;
  const o = (y * p.w + x) * 4, c = rgbOf(col);
  p.d[o] = c[0]; p.d[o + 1] = c[1]; p.d[o + 2] = c[2]; p.d[o + 3] = Math.max(p.d[o + 3], Math.round(255 * a));
};
/** The glasses, painted once: the two rims (the brow bar heavy across the top), the keyhole bridge, the arms back to his
 *  ears, the glass a faint blue over his eyes with the light streaked across it, the shadow they throw on his cheeks. */
const glassesStill = () => painting('m2-title-glasses', ART_W, ART_H, p => {
  // (the shadow under the rims on his cheeks: a dithered step down)
  for (const l of LENS) for (let x = l.x0 + 3; x < l.x1 - 2; x++) { p.px(x, LENS_Y1 + 1, SK[3], 0.55); if (bayer(x, LENS_Y1 + 2) + 0.5 < 0.45) p.px(x, LENS_Y1 + 2, SK[4], 0.5); }
  // (the arms first, under the rims' ends: back along his temples to the tops of his ears)
  p.form(g => { g.rect(83, 50, 13, 4); g.rect(160, 50, 14, 4); }, { ramp: FRAME, bevel: 1.5, amb: 0.3, ink: INK, spec: '#c8c8e4', wet: 0.6 });
  // (the glass: a faint cold tint, see-through)
  for (const l of LENS) for (let y = LENS_Y0 + 4; y < LENS_Y1 - 3; y++) for (let x = l.x0 + 4; x < l.x1 - 3; x++) p.px(x, y, '#b4d4f0', 0.14);
  // The rims: thick, square-cornered with the corners eased, the top a heavy brow bar
  const outer = p.mask(g => { for (const l of LENS) g.roundRect(l.x0, LENS_Y0, l.x1 - l.x0, LENS_Y1 - LENS_Y0, 5); g.rect(125, 51, 6, 5); });
  const inner = p.mask(g => { for (const l of LENS) g.roundRect(l.x0 + 4, LENS_Y0 + 4, l.x1 - l.x0 - 8, LENS_Y1 - LENS_Y0 - 7, 3); });
  p.form(p.minus(outer, inner), { ramp: FRAME, bevel: 2.5, amb: 0.28, ink: INK, spec: '#dcdcf4', wet: 0.75 });
  // (the bar's top edge lit hard; the hinges' studs; the pink neon caught round the outer bottom corners)
  for (const l of LENS) {
    for (let x = l.x0 + 4; x < l.x1 - 4; x++) p.px(x, LENS_Y0 + 1, (x & 1) ? FRAME[5] : FRAME[6]);
    p.rect(l.x0 + 3, LENS_Y0 + 2, 6, 1, FRAME[6]);
    const hx = l.x0 < 128 ? l.x0 + 1 : l.x1 - 3;
    p.rect(hx, 51, 2, 2, '#9a9ab0'); p.px(hx, 51, '#ffffff');
    const ox = l.x0 < 128 ? l.x0 + 1 : l.x1 - 2;
    for (let k = 0; k < 6; k++) p.px(ox, LENS_Y1 - 8 + k, '#ff5aa8', 0.6);
  }
  // (the light streaked across the glass: a broad stripe and a thin one, up and to the left; a dither off them)
  for (const l of LENS) {
    const x0 = l.x0 + 6;
    for (let k = 0; k < 12; k++) {
      const x = x0 + k, y = LENS_Y0 + 16 - k;
      onGlass(p, x, y, '#ffffff', 0.6); onGlass(p, x + 1, y, '#ffffff', 0.45); onGlass(p, x + 2, y, '#e8f4ff', 0.25);
      if (k < 7) onGlass(p, x + 5, y + 2, '#ffffff', 0.45);
    }
    for (let y = LENS_Y1 - 9; y < LENS_Y1 - 5; y++) for (let x = l.x1 - 12; x < l.x1 - 5; x++) if (bayer(x, y) + 0.5 < 0.3) onGlass(p, x, y, '#ffc0e2', 0.45);
  }
});

/** The glasses on him (`dy` off where they sit: the gym's closing puts them on him from above). */
/** Paints his stills ahead, one per idle moment (the title's intro, or the gym's opening, would otherwise stop to paint
 *  each the frame it's first wanted). */
export const prewarmTitleMeathead = () => idleTasks([() => bodyStill(1), () => bodyStill(0), () => glassesStill()]);
export const drawTitleGlasses = (ctx: Ctx, dy = 0) => { ctx.drawImage(glassesStill(), 0, Math.round(dy)); };

/**
 * Him, frame `t`, onto a 256 x 144 canvas (cleared: nothing behind him), `mood` his face; `ft` the frames since the fury
 * came on (its jolt and its clock); `glasses`: the disguise on (Meathead 2 from the gym's closing on: the title too).
 */
export const drawTitleMeathead = (ctx: Ctx, t: number, mood: TitleMood, ft = t, glasses = true) => {
  const pump = t % 20 < 10 ? 1 : 0;
  // (fury: the camera jolts in on him as it cuts)
  const jolt = mood === 'fury' && ft < 12 ? (ft % 4 < 2 ? 2 : -2) : 0;
  if (jolt) { ctx.save(); ctx.translate(jolt, 0); }
  ctx.drawImage(bodyStill(pump), 0, 0);
  if (mood === 'stoked') {
    cuBrow(ctx, 98, 123, 38, 37, 4, 5, 3); cuBrow(ctx, 132, 157, 37, 38, 5, 4, 3);
    cuEye(ctx, 111, 54, 10, 5, { ir: 4, sparkle: true }); cuEye(ctx, 145, 54, 10, 5, { ir: 4, sparkle: true });
    if (t % 30 < 15) for (const [x, y] of [[95, 42], [161, 42]]) { R(ctx, x, y - 3, 1, 7, GOLD_L); R(ctx, x - 3, y, 7, 1, GOLD_L); R(ctx, x, y, 1, 1, WHITE); }
    cuOpen(ctx, 106, 80, 44, 10, { top: true, bottom: true, grin: true });
    for (const s of [-1, 1]) { R(ctx, 128 + s * 24 - (s < 0 ? 2 : 0), 76, 3, 1, S[2]); R(ctx, 128 + s * 26 - (s < 0 ? 1 : 0), 77, 2, 4, S[2]); }
  } else if (mood === 'fury') {
    cuBrow(ctx, 96, 124, 38, 50, 5, 8); cuBrow(ctx, 132, 160, 50, 38, 8, 5);
    R(ctx, 126, 44, 1, 10, S[2]); R(ctx, 129, 44, 1, 10, S[2]); R(ctx, 127, 42, 2, 2, S[2]); R(ctx, 127, 44, 1, 8, S[5]);
    cuEye(ctx, 112, 56, 9, 2, { ir: 2, px: 1, red: true, pin: true }); cuEye(ctx, 144, 56, 9, 2, { ir: 2, px: -1, red: true, pin: true });
    cuOpen(ctx, 106, 79, 44, 10, { top: true, bottom: true, gritted: true });
    furyOver(ctx, ft);
    furyArms(ctx, ft, pump);
  } else {
    cuBrow(ctx, 98, 123, 45, 44, 4, 6); cuBrow(ctx, 132, 157, 44, 45, 6, 4);
    cuEye(ctx, 111, 57, 9, 3, { lid: 1 }); cuEye(ctx, 145, 57, 9, 3, { lid: 1 });
    cuLine(ctx, 114, 142, 87, k => Math.round(Math.sin(k * Math.PI) * -0.6));
  }
  if (glasses) drawTitleGlasses(ctx);
  drip(ctx, t);
  for (const [x, y, ph] of GLINTS) twinkle(ctx, x, y - (y < 80 && y > 60 ? pump * 2 : 0), (t + ph * 3) % 90);
  if (jolt) ctx.restore();
  // The pump: lines bursting off the peaks as they swell
  if (pump) for (const s of [-1, 1]) {
    const X = (x: number) => (s < 0 ? x : ART_W - x - 1);
    for (const [x, y, dx, dy] of [[14, 70, -1, -1], [10, 82, -1, 0], [16, 60, -1, -2]] as const) for (let k = 0; k < 4; k++) R(ctx, X(x + dx * k), y + dy * k, 1, 1, k < 2 ? WHITE : GOLD_L);
  }
};

/** His eyes shut a moment (the blink on the dumb look): the lids his own skin, the lashes a dark line. */
export const blinkTitleMeathead = (ctx: Ctx, glasses = true) => {
  for (const ex of [111, 145]) { R(ctx, ex - 11, 51, 23, 10, S[4]); R(ctx, ex - 11, 51, 23, 2, S[5]); R(ctx, ex - 9, 56, 19, 1, INK); R(ctx, ex - 8, 57, 17, 1, S[2]); }
  // (the glasses back on over the lids)
  if (glasses) drawTitleGlasses(ctx);
};
