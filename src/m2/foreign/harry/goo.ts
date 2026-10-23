// GOO (Harry's fight): the wet stuff, drawn the one way for both of them. His barf (a thick ropey stream that necks
// and bulges as it comes, chunks of what he had riding it (carrots, corn, half-digested mush) in a yellow-green-tan
// ramp, strings hanging off it that stretch and snap, the landing in irregular pancakes with chunks and a sheen that
// settle and dry) and her concrete (a heavy gray slurry: a thick stream with folds rolling down it and gravel in it,
// gloopy drips hanging and falling as slow globs, a slump where it lands that sags and settles, darker wet to lighter
// drying edges, grit, a wet sheen).
//
// SNES grade: every mass in its ramp (deep, shade, base, lit, shine) in stepped bands with dithered seams, outlined in
// its ink. Streams are a handful of polygons a frame (bands along the curve); the splats and piles are stamped (one
// drawImage each) with only their sheen and bubbles live.

import { dith } from '../heli/harryArt';
import { stamp } from '../../../m1/game/render/stamp';

type Ctx = CanvasRenderingContext2D;

export interface Goo {
  id: string;
  ink: string;
  /** deep, shade, base, lit, shine */
  R: readonly string[];
  /** The bits in it (chunks / gravel) and their glint. */
  bits: readonly string[]; bitHi: string;
  /** Drying toward (the crust's color). */
  dry: string;
  /** 0 runny (puke) .. 1 slurry (concrete): how slow, how fat, how folded. */
  thick: number;
}

export const PUKE_GOO: Goo = {
  id: 'puke', ink: '#1E1A05', R: ['#3A4310', '#646E1E', '#979838', '#C8B95C', '#EEE5A4'],
  bits: ['#E8701A', '#F6CE2A', '#B89868', '#8A6A34', '#F59E3B', '#D8C890'], bitHi: '#FFF6CC', dry: '#7E6E36', thick: 0,
};
export const BLOODY_GOO: Goo = {
  id: 'bloody', ink: '#1A0404', R: ['#3A0808', '#6E1212', '#9E1E1A', '#C2463A', '#F09A8A'],
  bits: ['#E8701A', '#B89868', '#5B3A1A', '#F6CE2A'], bitHi: '#FFD6CC', dry: '#4A1010', thick: 0.1,
};
export const CONC_GOO: Goo = {
  id: 'conc', ink: '#141210', R: ['#2E2B28', '#4A4642', '#6A655F', '#8E8880', '#C8C2B8'],
  bits: ['#A29C94', '#56514B', '#BAB4AA', '#3A3632', '#7E7A72'], bitHi: '#ECE8E0', dry: '#B6B0A6', thick: 1,
};

const hh = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const hexN = (h: string) => parseInt(h.slice(1), 16);
const mixC = (a: string, b: string, t: number) => {
  const A = hexN(a), B = hexN(b), ch = (s: number) => Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t);
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
};
const px = (c: Ctx, x: number, y: number, w: number, h: number, col: string | CanvasPattern) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
/** Its ramp gone this far (0..1) toward dried. */
const dried = (G: Goo, k: number) => (k <= 0 ? G.R : G.R.map((col, i) => mixC(col, i === 4 ? G.dry : mixC(G.dry, col, 0.35 + i * 0.08), k * (i === 4 ? 0.8 : 0.6))));

// ---------------------------------------------------------------------------------------------------------------
// The stream

const N = 16;
const SX = new Float64Array(N + 1), SY = new Float64Array(N + 1), NX = new Float64Array(N + 1), NY = new Float64Array(N + 1), WS = new Float64Array(N + 1);
/** One band of the stream: between t0 and t1 across it (+1 its top (lit) edge, -1 its underside), `pad` px out past its edges. */
const band = (c: Ctx, t0: number, t1: number, col: string | CanvasPattern, pad = 0) => {
  c.beginPath();
  for (let i = 0; i <= N; i++) { const o = WS[i] * t0 + pad * Math.sign(t0); const x = SX[i] + NX[i] * o, y = SY[i] + NY[i] * o; i ? c.lineTo(x, y) : c.moveTo(x, y); }
  for (let i = N; i >= 0; i--) { const o = WS[i] * t1 + pad * Math.sign(t1); c.lineTo(SX[i] + NX[i] * o, SY[i] + NY[i] * o); }
  c.closePath(); c.fillStyle = col; c.fill();
};
/** A spot along the stream (u 0..1), t across it. */
const along = (u: number, t: number) => {
  const f = Math.max(0, Math.min(N - 0.001, u * N)), i = Math.floor(f), k = f - i;
  const x = SX[i] + (SX[i + 1] - SX[i]) * k, y = SY[i] + (SY[i + 1] - SY[i]) * k, w = WS[i] + (WS[i + 1] - WS[i]) * k;
  return { x: x + NX[i] * w * t, y: y + NY[i] * w * t, w };
};

/** A drip hanging off (x, y) straight down: stretching (p 0..0.8), then snapped (the glob falls, the string pulls back
 *  up). `len` how far it stretches, `w` how fat at the root. */
export const gooDrip = (c: Ctx, x: number, y: number, len: number, w: number, G: Goo, p: number) => {
  const snap = p > 0.8 ? (p - 0.8) / 0.2 : 0, s = Math.min(1, p / 0.8), L = len * (snap ? 1 - snap * 0.85 : s * s * (3 - 2 * s));
  const neck = Math.max(0.6, w * 0.5 * (1 - s * 0.75)), rb = snap ? 0 : w * (0.55 + s * 0.35);
  const by = y + L;
  // (the string: fat at the root, thinning as it stretches; the glob swelling at its end)
  const str = (pad: number, col: string) => {
    c.fillStyle = col; c.beginPath();
    c.moveTo(x - w / 2 - pad, y); c.quadraticCurveTo(x - neck / 2 - pad, y + L * 0.5, x - neck / 2 - pad, by);
    c.lineTo(x + neck / 2 + pad, by); c.quadraticCurveTo(x + neck / 2 + pad, y + L * 0.5, x + w / 2 + pad, y); c.closePath(); c.fill();
    if (rb > 0) { c.beginPath(); c.ellipse(x, by + rb * 0.7, rb + pad, rb * 1.1 + pad, 0, 0, Math.PI * 2); c.fill(); }
  };
  str(1, G.ink); str(0, G.R[1]);
  if (L > 3) px(c, x - neck / 2, y + 1, 1, L * 0.7, G.R[3]);
  if (rb > 0) { px(c, x - rb * 0.5, by + rb * 0.2, Math.max(1, rb * 0.5), Math.max(1, rb * 0.5), G.R[3]); px(c, x - rb * 0.45, by + rb * 0.2, 1, 1, G.R[4]); px(c, x, by + rb * 1.3, rb * 0.6, 1, G.R[0]); }
  // (snapped: the glob falling away, stretched long then balling up)
  if (snap) {
    const gy = y + len + snap * snap * len * 1.6, gr = w * 0.8;
    c.fillStyle = G.ink; c.beginPath(); c.ellipse(x, gy, gr + 1, gr * (1.5 - snap * 0.4) + 1, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = G.R[1]; c.beginPath(); c.ellipse(x, gy, gr, gr * (1.5 - snap * 0.4), 0, 0, Math.PI * 2); c.fill();
    px(c, x - gr * 0.5, gy - gr * 0.6, Math.max(1, gr * 0.6), 1, G.R[4]);
  }
};

/**
 * A stream of it from (x0, y0) bending through (cx, cy) to (x1, y1), about `w` thick: necking and bulging as it comes
 * (the bulges rolling down it), its body in bands (the lit top, the shade under, dithered seams), wet glints on the
 * bulges, the bits riding it, concrete's folds rolling down it, drips hanging off its underside stretching and
 * snapping, and where it lands, the splatter (`flowing`: still coming; off, it's just the tail).
 */
export const gooStream = (c: Ctx, x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, w: number, G: Goo, fr: number, flowing: boolean, seed = 0) => {
  const T = G.thick;
  const K = 11 - T * 5, spd = 0.42 - T * 0.3, amp = 0.36 - T * 0.12;
  let mean = 0;
  for (let i = 0; i <= N; i++) {
    const u = i / N, a = 1 - u;
    let x = a * a * x0 + 2 * a * u * cx + u * u * x1, y = a * a * y0 + 2 * a * u * cy + u * u * y1;
    const tx = 2 * a * (cx - x0) + 2 * u * (x1 - cx), ty = 2 * a * (cy - y0) + 2 * u * (y1 - cy), l = Math.hypot(tx, ty) || 1;
    let nx = -ty / l, ny = tx / l;
    if (ny > 0 || (ny === 0 && nx < 0)) { nx = -nx; ny = -ny; }
    // (the rope's wiggle; the bulges rolling down it, necking between)
    const wig = Math.sin(u * 7 - fr * spd * 0.7 + seed) * w * (0.14 - T * 0.08) * Math.min(1, u * 3);
    x += nx * wig; y += ny * wig;
    const taper = T > 0.5 ? 1.15 - u * 0.2 : 0.7 + Math.min(1, u * 4) * 0.3;
    const prof = 1 + amp * Math.sin(u * K - fr * spd + seed) + 0.12 * Math.sin(u * 23 - fr * spd * 1.7 + seed * 2);
    SX[i] = x; SY[i] = y; NX[i] = nx; NY[i] = ny; WS[i] = Math.max(w * 0.15, (w / 2) * taper * Math.max(0.32, prof));
    mean += WS[i];
  }
  mean /= N + 1;
  const R = G.R;
  // (the body in bands, inked)
  band(c, 1, -1, G.ink, 1.6);
  band(c, 1, -1, R[1]);
  band(c, -0.5, -1, R[0]); band(c, -0.32, -0.5, dith(c, R[0]));
  band(c, 0.82, -0.3, R[2]); band(c, -0.3, -0.42, dith(c, R[2]));
  band(c, 0.72, 0.28, R[3]); band(c, 0.28, 0.1, dith(c, R[3]));
  // (concrete's folds: ridges across it, rolling slowly down, each a dark crease with a lit lip under)
  if (T > 0.5) for (let k = 0; k < 5; k++) {
    const u = (fr * 0.006 + k / 5 + seed * 0.1) % 1, a = along(u, 1), b = along(u, -1), m = along(Math.min(1, u + 0.035), 0);
    c.lineCap = 'round';
    c.strokeStyle = R[0]; c.lineWidth = 1.6; c.beginPath(); c.moveTo(a.x, a.y); c.quadraticCurveTo(m.x, m.y, b.x, b.y); c.stroke();
    c.strokeStyle = R[3]; c.lineWidth = 1; c.beginPath(); c.moveTo(a.x, a.y + 2); c.quadraticCurveTo(m.x, m.y + 2, b.x, b.y + 2); c.stroke();
  }
  // (wet glints on the bulges)
  c.strokeStyle = R[4]; c.lineWidth = Math.max(1, w * 0.07); c.lineCap = 'round'; c.beginPath();
  for (let i = 1; i < N; i++) if (WS[i] > mean * 1.08) { const o = WS[i] * 0.55, o2 = WS[i + 1] * 0.55; c.moveTo(SX[i] + NX[i] * o, SY[i] + NY[i] * o); c.lineTo(SX[i + 1] + NX[i + 1] * o2, SY[i + 1] + NY[i + 1] * o2); }
  c.stroke();
  for (let i = 1; i < N; i++) if (WS[i] > mean * 1.2 && WS[i] >= WS[i - 1] && WS[i] >= WS[i + 1]) px(c, SX[i] + NX[i] * WS[i] * 0.6 - 1, SY[i] + NY[i] * WS[i] * 0.6 - 1, 2, 2, '#FFFFFF');
  // (the bits riding it: chunks / gravel, each inked, lit on top)
  const nb = T > 0.5 ? 14 : 10, bs = T > 0.5 ? 0.012 : 0.034;
  for (let i = 0; i < nb; i++) {
    const u = (fr * bs * (0.8 + hh(i + seed) * 0.4) + i / nb + hh(i * 3.1)) % 1, p = along(u, (hh(i * 7.3) - 0.5) * 1.3);
    const col = G.bits[i % G.bits.length], sw = T > 0.5 ? 1.5 + hh(i * 2.2) * 2 : 1.5 + hh(i * 2.2) * 2.5, sh = T > 0.5 ? sw * 0.8 : (i % 3 === 0 ? sw * 0.6 : sw);
    px(c, p.x - sw / 2 - 0.6, p.y - sh / 2 - 0.6, sw + 1.2, sh + 1.2, G.ink); px(c, p.x - sw / 2, p.y - sh / 2, sw, sh, col);
    px(c, p.x - sw / 2, p.y - sh / 2, 1, 1, i % 2 ? G.bitHi : col);
  }
  // (drips off its underside: stretching, snapping, the glob dropping)
  const nd = 3, rate = T > 0.5 ? 1 / 120 : 1 / 46;
  for (let j = 0; j < nd; j++) {
    const ua = 0.28 + j * 0.2 + Math.sin(fr * 0.01 + j) * 0.03, a = along(ua, -0.85);
    gooDrip(c, a.x, a.y, (T > 0.5 ? 22 : 14) + j * 4 + w * 0.3, T > 0.5 ? Math.max(4, w * 0.22) : Math.max(2.4, w * 0.3), G, (fr * rate + j * 0.37 + seed * 0.21) % 1);
  }
  if (!flowing) return;
  // (where it lands: a heap of it splatting and burbling, and the splatter thrown up and out)
  const bub = 1 + Math.sin(fr * (0.5 - T * 0.35)) * 0.15, br = w * (0.7 + T * 0.3) * bub;
  c.fillStyle = G.ink; c.beginPath(); c.ellipse(x1, y1, br + 1.5, br * 0.6 + 1.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = R[1]; c.beginPath(); c.ellipse(x1, y1, br, br * 0.6, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = R[2]; c.beginPath(); c.ellipse(x1 - br * 0.15, y1 - br * 0.15, br * 0.7, br * 0.38, 0, 0, Math.PI * 2); c.fill();
  px(c, x1 - br * 0.5, y1 - br * 0.35, br * 0.5, 1, R[4]);
  const nsp = 6, ss = T > 0.5 ? 0.045 : 0.09;
  for (let i = 0; i < nsp; i++) {
    const ph = (fr * ss + i / nsp + hh(i + seed)) % 1, dir = (hh(i * 5.7) - 0.5) * 2.4;
    const dx = dir * w * 1.4 * ph, dy = -Math.sin(ph * Math.PI) * w * (T > 0.5 ? 0.6 : 1.1), r = Math.max(0.8, w * (0.2 + T * 0.08) * (1 - ph * 0.6));
    c.fillStyle = G.ink; c.beginPath(); c.ellipse(x1 + dx, y1 + dy, r + 0.8, r * (1 + ph * 0.4) + 0.8, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = R[i % 2 ? 1 : 2]; c.beginPath(); c.ellipse(x1 + dx, y1 + dy, r, r * (1 + ph * 0.4), 0, 0, Math.PI * 2); c.fill();
    if (i % 2 === 0 && T < 0.5) px(c, x1 + dx - 0.5, y1 + dy - 0.5, 1.6, 1.6, G.bits[i % G.bits.length]);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Splats (on the floor, on her): irregular pancakes

/** The splat's outline (around the origin, rx by ry, `sc` of it), lobed and seeded. */
const splatPath = (c: Ctx, rx: number, ry: number, seed: number, sc: number, ox = 0, oy = 0) => {
  const s1 = hh(seed) * 6.28, s2 = hh(seed + 1) * 6.28, s3 = hh(seed + 2) * 6.28;
  c.beginPath();
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2, r = sc * (1 + 0.17 * Math.sin(3 * a + s1) + 0.09 * Math.sin(5 * a + s2) + 0.05 * Math.sin(11 * a + s3));
    const x = ox + Math.cos(a) * rx * r, y = oy + Math.sin(a) * ry * r;
    i ? c.lineTo(x, y) : c.moveTo(x, y);
  }
  c.closePath();
};
const paintSplat = (g: Ctx, rx: number, ry: number, G: Goo, seed: number, dry: number) => {
  const R = dried(G, dry / 3);
  // (the satellite droplets thrown off round it)
  for (let i = 0; i < 5; i++) {
    const a = hh(seed * 3 + i) * Math.PI * 2, d = 1.12 + hh(seed + i * 9) * 0.35, r = 1 + hh(seed + i) * Math.max(1.5, rx * 0.07);
    const x = Math.cos(a) * rx * d, y = Math.sin(a) * ry * d;
    g.fillStyle = G.ink; g.beginPath(); g.ellipse(x, y, r + 1, r * (ry / rx) + 1, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = R[1]; g.beginPath(); g.ellipse(x, y, r, Math.max(0.8, r * (ry / rx)), 0, 0, Math.PI * 2); g.fill();
  }
  // (the pancake: inked, its rim deep, its body, a raised middle lit up-left, dithered seams between)
  g.fillStyle = dith(g, R[0]); splatPath(g, rx + 3, ry + 2, seed, 1); g.fill();
  g.fillStyle = G.ink; splatPath(g, rx + 1.5, ry + 1.2, seed, 1); g.fill();
  g.fillStyle = R[0]; splatPath(g, rx, ry, seed, 1); g.fill();
  g.fillStyle = dith(g, R[1]); splatPath(g, rx, ry, seed, 0.9, -rx * 0.03, -ry * 0.05); g.fill();
  g.fillStyle = R[1]; splatPath(g, rx, ry, seed, 0.8, -rx * 0.05, -ry * 0.08); g.fill();
  g.fillStyle = dith(g, R[2]); splatPath(g, rx, ry, seed + 4, 0.66, -rx * 0.08, -ry * 0.14); g.fill();
  g.fillStyle = R[2]; splatPath(g, rx, ry, seed + 4, 0.56, -rx * 0.1, -ry * 0.16); g.fill();
  g.fillStyle = R[3]; splatPath(g, rx, ry, seed + 7, 0.26, -rx * 0.22, -ry * 0.3); g.fill();
  // (drying: a crust round the rim)
  if (dry > 0) { g.strokeStyle = dith(g, mixC(G.dry, '#FFFFFF', 0.1)); g.lineWidth = dry * 1.4; splatPath(g, rx - dry, ry - dry * 0.5, seed, 1); g.stroke(); }
  // (the chunks in it, inked, lit)
  const n = Math.min(16, Math.round(3 + rx / 6));
  for (let i = 0; i < n; i++) {
    const a = hh(seed * 7 + i) * Math.PI * 2, d = Math.sqrt(hh(seed * 11 + i)) * 0.72, x = Math.cos(a) * rx * d, y = Math.sin(a) * ry * d;
    const w = G.thick > 0.5 ? 1.5 + hh(i + seed) * 1.5 : 2 + hh(i + seed) * 2, h = G.thick > 0.5 ? w * 0.8 : (i % 3 === 0 ? 1.4 : w * 0.7);
    px(g, x - w / 2 - 0.6, y - h / 2 - 0.6, w + 1.2, h + 1.2, G.ink); px(g, x - w / 2, y - h / 2, w, h, G.bits[(i + seed) % G.bits.length]);
    px(g, x - w / 2, y - h / 2, 1, 1, G.bitHi);
  }
};

/**
 * A splat of it (on the floor; or on her, upright): an irregular pancake rx by ry round (x, y), its chunks in it, a
 * wet sheen (`wet` 1 .. 0 dried), a bubble now and then while it's fresh. Stamped; the sheen's live.
 */
export const gooSplat = (c: Ctx, x: number, y: number, rx: number, ry: number, G: Goo, seed: number, wet: number, fr: number) => {
  if (rx < 1) return;
  const qx = Math.max(2, Math.round(rx / 3) * 3), qy = Math.max(1, Math.round(ry)), dry = Math.max(0, Math.min(3, Math.round((1 - wet) * 3)));
  c.save(); c.translate(x, y);
  stamp(c, `goo-splat-${G.id}-${seed}-${qx}-${qy}-${dry}`, -qx * 1.6 - 8, -qy * 1.6 - 8, qx * 3.2 + 16, qy * 3.2 + 16, g => paintSplat(g, qx, qy, G, seed, dry));
  // (the sheen: a lit streak and a glint, going as it dries; a bubble welling up and popping)
  if (wet > 0.1) {
    c.globalAlpha = Math.min(1, wet * 1.4);
    px(c, -qx * 0.42, -qy * 0.5, qx * 0.34 * wet + 1, 1, G.R[4]); px(c, -qx * 0.36, -qy * 0.52, 2, 1, '#FFFFFF');
    px(c, qx * 0.1, -qy * 0.2, qx * 0.12 * wet + 1, 1, G.R[3]);
    c.globalAlpha = 1;
  }
  if (wet > 0.45 && G.thick < 0.5) {
    const b = ((fr + seed * 17) % 80) / 80;
    if (b < 0.45) {
      const r = 1 + b * 5, bx = qx * (hh(seed + Math.floor((fr + seed * 17) / 80)) - 0.5) * 0.9, by = -1 - b * 2;
      c.strokeStyle = G.R[4]; c.lineWidth = 1; c.beginPath(); c.arc(bx, by, r, Math.PI, Math.PI * 2); c.stroke();
      px(c, bx - r * 0.5, by - r, 1, 1, '#FFFFFF');
    }
  }
  c.restore();
};

/** A splat stuck on something upright (his puke on her): the pancake, and a run of it creeping down from its foot with
 *  a glob swelling at the end, dropping off and starting again (`age` frames since it landed). */
export const gooRun = (c: Ctx, x: number, y: number, r: number, G: Goo, seed: number, age: number, fr: number) => {
  const run = Math.min(r * 2.6, age * 0.12);
  for (let k = 0; k < 2; k++) {
    const rx = x + (hh(seed + k * 3) - 0.5) * r * 1.1, len = run * (k ? 0.6 : 1);
    if (len < 2) continue;
    // (the run: a streak down her, inked, lit down its left)
    const w = Math.max(2, r * (k ? 0.18 : 0.26)), y0 = y + r * 0.4;
    px(c, rx - w / 2 - 1, y0, w + 2, len + 1, G.ink); px(c, rx - w / 2, y0, w, len, G.R[1]); px(c, rx - w / 2, y0, 1, len, G.R[3]); px(c, rx + w / 2 - 1, y0, 1, len, G.R[0]);
    if (age > 60) gooDrip(c, rx, y0 + len - 1, r * 0.9, w, G, ((fr + seed * 31 + k * 50) / (k ? 150 : 110)) % 1);
  }
  gooSplat(c, x, y, r, r * 0.75, G, seed, 1, fr);
};

// ---------------------------------------------------------------------------------------------------------------
// The slump (her concrete where it lands)

const paintPile = (g: Ctx, w: number, h: number, G: Goo, seed: number, dry: number) => {
  const R = dried(G, dry / 3);
  const s1 = hh(seed) * 6, s2 = hh(seed + 3) * 6;
  const top = (u: number, k = 1) => -h * k * Math.pow(Math.max(0, 1 - u * u), 0.65) * (1 + 0.16 * Math.sin(u * 7 + s1) + 0.08 * Math.sin(u * 15 + s2));
  const shape = (k = 1, dy = 0) => { g.beginPath(); g.moveTo(-w, 0); for (let i = 0; i <= 24; i++) { const u = -1 + (i / 24) * 2; g.lineTo(u * w, top(u, k) + dy); } g.lineTo(w, 0); g.closePath(); };
  // (its toes: the slurry spread out from its foot in lobes)
  for (let i = 0; i < 4; i++) {
    const tx = (i < 2 ? -1 : 1) * w * (0.9 + hh(seed + i) * 0.25), tw = 6 + hh(seed + i * 2) * w * 0.2;
    g.fillStyle = G.ink; g.beginPath(); g.ellipse(tx, 0, tw + 1.5, 3.5, 0, Math.PI, Math.PI * 2); g.fill();
    g.fillStyle = R[1]; g.beginPath(); g.ellipse(tx, 0, tw, 2.5, 0, Math.PI, Math.PI * 2); g.fill();
    g.fillStyle = dith(g, R[3]); g.fillRect(tx - tw * 0.6, -2, tw * 0.8, 1);
  }
  // (the mass: inked; in bands following its top (the lit crest, the body, the shade at its foot), shade down its right)
  g.fillStyle = G.ink; g.beginPath(); g.moveTo(-w - 2, 1); for (let i = 0; i <= 24; i++) { const u = -1 + (i / 24) * 2; g.lineTo(u * (w + 1.5), top(u) - 1.5); } g.lineTo(w + 2, 1); g.closePath(); g.fill();
  g.fillStyle = R[3]; shape(); g.fill();
  g.save(); shape(); g.clip();
  g.fillStyle = dith(g, R[2]); shape(1, 2); g.fill();
  g.fillStyle = R[2]; shape(1, 4); g.fill();
  g.fillStyle = dith(g, R[1]); shape(0.62, 2); g.fill();
  g.fillStyle = R[1]; shape(0.5, 2); g.fill();
  g.fillStyle = dith(g, R[0]); shape(0.24, 1); g.fill();
  g.fillStyle = dith(g, R[0]); g.fillRect(w * 0.45, -h * 1.3, w, h * 1.4);
  g.fillStyle = R[0]; g.fillRect(w * 0.72, -h * 1.3, w, h * 1.4);
  // (the folds it slumped in: creases following its top, each lit under)
  for (const [k, dy] of [[0.78, 3], [0.55, 4], [0.33, 3]] as const) {
    g.strokeStyle = R[0]; g.lineWidth = 1.2; g.beginPath();
    for (let i = 2; i <= 22; i++) { const u = -1 + (i / 24) * 2; const y = top(u, k) + dy + Math.sin(u * 9 + seed) * 1.5; i > 2 ? g.lineTo(u * w * 0.92, y) : g.moveTo(u * w * 0.92, y); }
    g.stroke();
    g.strokeStyle = R[4]; g.lineWidth = 0.8; g.beginPath();
    for (let i = 3; i <= 14; i++) { const u = -1 + (i / 24) * 2; const y = top(u, k) + dy + 1.6 + Math.sin(u * 9 + seed) * 1.5; i > 3 ? g.lineTo(u * w * 0.92, y) : g.moveTo(u * w * 0.92, y); }
    g.stroke();
  }
  // (the gravel in it and the grit: lumps poking out, lit on top, a dark under)
  const n = Math.round(10 + w * 0.25);
  for (let i = 0; i < n; i++) {
    const u = (hh(seed * 5 + i) - 0.5) * 1.8, y = top(u) * (0.1 + hh(seed * 3 + i) * 0.8), s = 1.2 + hh(i + seed) * (i % 4 ? 1.4 : 3);
    px(g, u * w - s / 2, y - s / 2, s, s, G.bits[i % G.bits.length]); px(g, u * w - s / 2, y + s / 2, s, 1, G.ink); px(g, u * w - s / 2, y - s / 2, 1, 1, G.bitHi);
  }
  g.restore();
  // (drying from its edges: paler, dithered in along its outline and its foot)
  if (dry > 0) {
    g.strokeStyle = dith(g, G.dry); g.lineWidth = dry * 1.6; g.beginPath(); g.moveTo(-w, -1);
    for (let i = 0; i <= 24; i++) { const u = -1 + (i / 24) * 2; g.lineTo(u * (w - 1), top(u) + 1); }
    g.stroke(); g.fillStyle = G.dry; g.fillRect(-w, -2, w * 2, 1);
  }
};

/**
 * Her concrete's slump on the floor at (x, gy): `w` half across, `h` high at the most; `settle` 0 fresh .. 1 sagged
 * flatter and spread (and dry: paler from its edges in). Stamped by step; the wet sheen and the odd burp are live.
 */
export const gooPile = (c: Ctx, x: number, gy: number, w: number, h: number, G: Goo, seed: number, settle: number, fr: number) => {
  if (w < 2 || h < 1) return;
  const sw = w * (1 + 0.14 * settle), sh = h * (1 - 0.2 * settle);
  const qw = Math.round(sw / 3) * 3, qh = Math.max(2, Math.round(sh / 2) * 2), dry = Math.min(3, Math.floor(settle * 3.2));
  c.save(); c.translate(x, gy);
  stamp(c, `goo-pile-${G.id}-${seed}-${qw}-${qh}-${dry}`, -qw * 1.4 - 10, -qh * 1.5 - 8, qw * 2.8 + 20, qh * 1.5 + 14, g => paintPile(g, qw, qh, G, seed, dry));
  // (wet: the sheen along its crest, glinting; a slow burp of air out of it)
  const wet = 1 - settle;
  if (wet > 0.05) {
    c.globalAlpha = Math.min(1, wet * 1.3);
    px(c, -qw * 0.4, -qh * 0.86, qw * 0.36, 1, G.R[4]); px(c, -qw * 0.3, -qh * 0.88, 3, 1, '#FFFFFF');
    px(c, qw * 0.1, -qh * 0.7, qw * 0.16, 1, G.R[4]);
    c.globalAlpha = 1;
    const b = ((fr + seed * 23) % 140) / 140;
    if (b < 0.3 && wet > 0.4) { const r = 1.5 + b * 8, bx = qw * (hh(seed + Math.floor((fr + seed * 23) / 140)) - 0.5) * 0.8, by = -qh * 0.6 - b * 3; c.strokeStyle = G.R[3]; c.lineWidth = 1.2; c.beginPath(); c.arc(bx, by, r, Math.PI, Math.PI * 2); c.stroke(); px(c, bx - r * 0.5, by - r, 1, 1, '#FFFFFF'); }
  }
  c.restore();
};

/** Where a slump's top is (world y) at world x `at`: gooPile's own outline (its settled, snapped size, the same bumps),
 *  for things that have to come up out of it (Harry's arm out of her concrete) rather than hover over it. Its foot
 *  (gy) past its ends. */
export const pileTop = (at: number, x: number, gy: number, w: number, h: number, seed: number, settle: number) => {
  const sw = w * (1 + 0.14 * settle), sh = h * (1 - 0.2 * settle);
  const qw = Math.round(sw / 3) * 3, qh = Math.max(2, Math.round(sh / 2) * 2);
  if (qw < 2) return gy;
  const u = (at - x) / qw, s1 = hh(seed) * 6, s2 = hh(seed + 3) * 6;
  return gy - qh * Math.pow(Math.max(0, 1 - u * u), 0.65) * (1 + 0.16 * Math.sin(u * 7 + s1) + 0.08 * Math.sin(u * 15 + s2));
};

/** Frames since `o` was first seen drawn (for how fresh a splat or slump is: settling, drying). */
const born = new WeakMap<object, number>();
export const ageOf = (o: object, fr: number) => { let b = born.get(o); if (b === undefined || b > fr) { b = fr; born.set(o, b); } return fr - b; };
