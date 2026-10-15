// Futureland's far scenery kit: what the outdoor backdrops' far layers are painted with (the square's and the main
// drag's skylines and hills, the impact site's skyline, the park far below the needle's lobby), so they all come out of
// a piece, and of a piece with Adventure Land's and Spooky Land's far passes (adventure/farArt.ts: its ridges, mist and
// bands are reused here). The look: everything on the art's 2 px grid; lit from the left (a lit strip, a row of dither
// off it), shaded down the right (a band, dithered in); round things in stepped shells or columns across; windows that
// show the sky by day and light up after dark (more of them the darker it gets, a step of glow round each up close);
// neon trim that comes on after dark. Nothing here is lit along a top: none of it's to stand on. Every piece stands on
// its foot `f` (the ground of its own layer: parkGround paints that, a tree line along its back edge).

import { type Ctx, box, mix, hash, checker, hazeBands, pixelBlob, snap2, wave, jag, poly, fillUnder, flanks, mist, banded, range, type RangeLook } from '../adventure/farArt';

export { type Ctx, box, mix, hash, checker, hazeBands, pixelBlob, snap2, wave, jag, poly, fillUnder, flanks, mist, banded, range, type RangeLook };

/** How a layer's painted: `T` tints a color for its distance and the hour; `night` how dark (the hour's lamps, 0..1);
 *  `s` the layer's scale; `glass` the sky in the windows by day. */
export interface Far { T: (c: string) => string; night: number; s: number; glass: string }

const INKF = '#1A1838';
/** A five-step ramp round a color, tinted for the layer: deep, shade, body, lit, highlight. */
export const rampF = (F: Far, base: string) => [mix(base, INKF, 0.55), mix(base, INKF, 0.3), base, mix(base, '#FFFFFF', 0.25), mix(base, '#FFFFFF', 0.5)].map(F.T);

/** The park's pastels (walls) and its trim colors. */
export const PASTEL = ['#C8D4F0', '#EAC6DA', '#C2E6DE', '#EEE2C2', '#D8CEEE', '#E6EAF2'];
export const ACCENT = ['#E8659E', '#22BCAC', '#FB9440', '#7A6AE0'];
const pick = <T,>(a: T[], seed: number) => a[Math.floor(hash(seed) * a.length) % a.length];
/** Window light after dark (warm; a few cool), and the neon (pink, teal). */
const LIT = '#FFE8A0', LIT_COOL = '#BDF4FF', NEON_P = '#FF7AD0', NEON_T = '#7DF9FF';
/** A light that's on after dark (more of them the darker it is), by its seed. */
const on = (F: Far, seed: number, k = 0.85) => hash(seed) < F.night * k;
/** A neon color: lit after dark, its paint by day. */
const neon = (F: Far, lit: string, day: string) => (F.night > 0.3 ? mix(F.T(day), lit, Math.min(1, F.night * 1.2)) : F.T(day));

// ---------------------------------------------------------------------------------------------------------------
// Shading

/** A box lit down its left (a strip, dithered off), shaded down its right (a band, dithered in); its top capped dark. */
export const block = (g: Ctx, x: number, y: number, w: number, h: number, R: string[]) => {
  x = snap2(x); y = snap2(y); w = Math.max(2, snap2(w)); h = Math.max(2, snap2(h));
  box(g, x, y, w, h, R[2]);
  const lw = Math.max(2, snap2(w * 0.12)), sw = Math.max(2, snap2(w * 0.28));
  box(g, x, y, lw, h, R[3]); checker(g, x + lw, y, 2, h, R[3]);
  box(g, x + w - sw, y, sw, h, R[1]); checker(g, x + w - sw - 2, y, 2, h, R[1], 1);
  box(g, x, y, w, 2, R[1]);
};
/** Shade across something round (u 0 its left edge .. 1 its right): lit a little in from the left, darkest at the right. */
export const across = (u: number, R: string[]) => (u < 0.1 ? R[2] : u < 0.3 ? R[4] : u < 0.48 ? R[3] : u < 0.7 ? R[2] : u < 0.88 ? R[1] : R[0]);
/** A cylinder standing up (a stalk, a tank, a rocket's body): columns across, `w0` wide at its foot, `w1` at its top. */
export const cylV = (g: Ctx, cx: number, foot: number, top: number, w0: number, w1: number, R: string[]) => {
  foot = snap2(foot); top = snap2(top);
  for (let y = top; y < foot; y += 2) {
    const t = (foot - y) / Math.max(1, foot - top), hw = Math.max(1, snap2((w0 + (w1 - w0) * t) / 2));
    for (let x = -hw; x < hw; x += 2) box(g, snap2(cx) + x, y, 2, 2, across((x + hw) / (hw * 2), R));
  }
};
/** A ball in stepped shells (darkest at the rim, lit at the upper left), each dithered into the one under it. `half`:
 *  only its top half (a dome). */
export const ball = (g: Ctx, cx: number, cy: number, r: number, R: string[], half = false) => {
  cx = snap2(cx); cy = snap2(cy); r = Math.max(2, snap2(r));
  g.save();
  if (half) { g.beginPath(); g.rect(cx - r - 4, cy - r - 4, r * 2 + 8, r + 4); g.clip(); }
  const shells: [number, number, number, string][] = [[0, 0, 1, R[0]], [-0.06, -0.06, 0.93, R[1]], [-0.16, -0.18, 0.76, R[2]], [-0.3, -0.34, 0.46, R[3]], [-0.42, -0.48, 0.16, R[4]]];
  shells.forEach(([dx, dy, k, col], i) => {
    const x = cx + dx * r, y = cy + dy * r, rr = r * k;
    if (rr < 1) return;
    if (i) { g.save(); g.beginPath(); g.arc(x, y, rr + 2, 0, Math.PI * 2); g.clip(); g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.clip(); checker(g, x - rr - 4, y - rr - 4, rr * 2 + 8, rr * 2 + 8, col, i % 2); g.restore(); }
    g.fillStyle = col; g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2); g.fill();
  });
  g.restore();
};
/** A row of windows (2 px each, `step` apart) from x0 to x1 at y: the sky in them by day (dark on the shaded side),
 *  lit after dark (a step of glow round them when `glow`). */
export const windowRow = (g: Ctx, F: Far, x0: number, x1: number, y: number, R: string[], seed: number, step = 6, h = 2, glow = false) => {
  y = snap2(y);
  for (let x = snap2(x0); x < x1 - 1; x += step) {
    const sd = seed + x * 0.37 + y * 1.31;
    if (on(F, sd)) {
      const col = hash(sd + 5) < 0.15 ? LIT_COOL : LIT;
      if (glow) box(g, x - 2, y - 2, 6, h + 4, mix(R[2], col, 0.3));
      box(g, x, y, 2, h, col);
    } else box(g, x, y, 2, h, (x - x0) / Math.max(1, x1 - x0) < 0.6 ? F.glass : R[0]);
  }
};
/** Windows in rows over a face. */
export const windowGrid = (g: Ctx, F: Far, x: number, y: number, w: number, h: number, R: string[], seed: number, step = 6, glow = false) => {
  for (let wy = snap2(y + 6); wy < y + h - 6; wy += step) windowRow(g, F, x + 4, x + w - 4, wy, R, seed + wy, step, 2, glow);
};
/** A blinking-light's spot (a beacon: red after dark with a step of glow, its housing by day). */
const beacon = (g: Ctx, F: Far, x: number, y: number, col = '#FF4A5A') => {
  x = snap2(x); y = snap2(y);
  if (F.night > 0.15) { box(g, x - 2, y - 2, 6, 6, mix(F.T('#8A94A8'), col, 0.35 * F.night)); box(g, x, y, 2, 2, col); }
  else box(g, x, y, 2, 2, F.T('#A83040'));
};

// ---------------------------------------------------------------------------------------------------------------
// The skyline of tomorrow: each piece centered on x, standing on f, at scale s; `seed` picks its colors and lights.

export type Piece = 'dome' | 'saucer' | 'rocket' | 'orbitron' | 'spire' | 'hotel' | 'radar' | 'geo' | 'pavilion';
/** How wide each piece is (at scale 1), so the pieces along a strip don't crowd or overrun the tile. */
export const PIECE_W: Record<Piece, number> = { dome: 84, saucer: 92, rocket: 70, orbitron: 110, spire: 60, hotel: 64, radar: 50, geo: 70, pavilion: 110 };

/** A dome on its drum: ribbed, stepped; a band of windows round the drum; a mast with a bulb. */
const dome = (g: Ctx, F: Far, x: number, f: number, s: number, seed: number) => {
  const r = snap2((26 + hash(seed) * 12) * s), dh = snap2(14 * s), R = rampF(F, pick(PASTEL, seed + 1)), A = rampF(F, pick(ACCENT, seed + 2));
  block(g, x - r - 4 * s, f - dh, r * 2 + 8 * s, dh, R);
  box(g, snap2(x - r - 4 * s), snap2(f - dh + 2), snap2(r * 2 + 8 * s), 2, A[1]);
  windowRow(g, F, x - r, x + r, f - dh + 6 * s, R, seed, 6, 2, s >= 1);
  ball(g, x, f - dh, r, R, true);
  // (its ribs, curving over)
  g.save(); g.beginPath(); g.rect(x - r, f - dh - r, r * 2, r); g.clip();
  g.strokeStyle = R[1]; g.lineWidth = 1;
  for (const k of [0.35, 0.72]) { g.beginPath(); g.ellipse(snap2(x), snap2(f - dh), r * k, r, 0, Math.PI, Math.PI * 2); g.stroke(); }
  g.restore();
  const mh = snap2(16 * s);
  box(g, snap2(x) - 2, snap2(f - dh - r - mh), 2, mh, R[1]);
  box(g, snap2(x) - 4, snap2(f - dh - r - mh) - 2, 4, 4, F.night > 0.3 ? NEON_P : A[3]);
};
/** A saucer up on its stalk: the stalk in columns, its flared foot; the saucer's underside stepped, its rim a band of
 *  windows, the dome on top; bulbs round the rim after dark. */
const saucer = (g: Ctx, F: Far, x: number, f: number, s: number, seed: number) => {
  const h = snap2((80 + hash(seed) * 60) * s), rw = snap2((34 + hash(seed + 2) * 10) * s), R = rampF(F, '#E4E8F2'), A = rampF(F, pick(ACCENT, seed + 3));
  cylV(g, x, f, f - h, 14 * s, 6 * s, R);
  cylV(g, x, f, f - 8 * s, 26 * s, 14 * s, A);
  const y = snap2(f - h);
  // (the underside: stepped up into the rim)
  for (const [k, col] of [[1, A[0]], [0.84, A[1]], [0.6, A[2]]] as const) { g.fillStyle = col; g.beginPath(); g.ellipse(snap2(x) - (1 - k) * rw * 0.2, y, rw * k, 9 * s * k, 0, 0, Math.PI); g.fill(); }
  // (the rim)
  const rh = snap2(Math.max(4, 6 * s));
  for (let xx = -rw; xx < rw; xx += 2) box(g, snap2(x) + xx, y - rh, 2, rh, across((xx + rw) / (rw * 2), R));
  windowRow(g, F, x - rw + 4, x + rw - 4, y - rh + 2, R, seed, 6, 2, s >= 1);
  // (the dome on it)
  g.save(); g.beginPath(); g.rect(x - rw, y - rh - 20 * s, rw * 2, 20 * s); g.clip();
  ball(g, x, y - rh, rw * 0.55, R);
  g.restore();
  // (bulbs under the rim, after dark)
  if (F.night > 0.3) for (let xx = -rw + 4; xx < rw - 2; xx += 8) box(g, snap2(x + xx), y + 2, 2, 2, (xx / 8) % 2 ? LIT : NEON_T);
};
/** A rocket on its pad, the gantry beside it: the body in columns (lit left), the red nose and fins, a band round it,
 *  portholes; the gantry's lattice and its arm across; a beacon on the gantry. */
const rocket = (g: Ctx, F: Far, x: number, f: number, s: number, seed: number) => {
  const rh = snap2((110 + hash(seed) * 50) * s), rw = snap2(10 * s), W = rampF(F, '#F2F2F6'), Rd = rampF(F, '#D8405A'), G = rampF(F, '#8A92A8');
  const pad = snap2(10 * s), foot = f - pad;
  // (the gantry, right of it: two posts, girts, the X's stepped between)
  const gx = snap2(x + rw + 6 * s), gw = snap2(14 * s), gt = snap2(f - rh - 12 * s), gs = snap2(12 * s);
  box(g, gx, gt, 2, f - gt, G[2]); box(g, gx + gw - 2, gt, 2, f - gt, G[0]);
  for (let y = gt; y < foot; y += gs) {
    box(g, gx, y, gw, 2, G[1]);
    for (let k = 0; k < gs; k += 2) { const u = Math.round((k / gs) * (gw - 2) / 2) * 2; box(g, gx + u, y + k, 2, 2, G[1]); box(g, gx + gw - 2 - u, y + k, 2, 2, G[0]); }
  }
  box(g, snap2(x), snap2(foot - rh * 0.62), gx - snap2(x), 2, G[1]);
  beacon(g, F, gx + gw / 2 - 1, gt - 4);
  // (the body and its nose)
  const noseH = snap2(rw * 2.6), top = snap2(foot - rh), bodyTop = top + noseH;
  for (let y = top; y < foot; y += 2) {
    const t = y < bodyTop ? (y - top) / noseH : 1, hw = Math.max(2, snap2(rw * Math.sqrt(t)));
    const R = y < bodyTop || (y > foot - rh * 0.42 && y < foot - rh * 0.36) ? Rd : W;
    for (let xx = -hw; xx < hw; xx += 2) box(g, snap2(x) + xx, y, 2, 2, across((xx + rw) / (rw * 2), R));
  }
  for (const py of [bodyTop + 8 * s, bodyTop + 22 * s]) box(g, snap2(x) - 2, snap2(py), 2, 2, on(F, seed + py) ? LIT : F.glass);
  // (the fins)
  for (const sd of [-1, 1]) poly(g, [[x + sd * rw, foot - 34 * s], [x + sd * (rw + 10 * s), foot], [x + sd * rw, foot]], sd < 0 ? Rd[2] : Rd[0]);
  // (the pad)
  block(g, x - 26 * s, foot, 52 * s + gw, pad, G);
};
/** The ORBITRON (a ride): its skirted base, a post, the hub, six arms out with a rocket car on the end of each (the
 *  back ones behind the post); a spike on top with a bulb. */
const orbitron = (g: Ctx, F: Far, x: number, f: number, s: number, seed: number) => {
  const ph = snap2((66 + hash(seed) * 24) * s), aw = (44 + hash(seed + 1) * 8) * s, G = rampF(F, '#C8CCD8'), B = rampF(F, pick(PASTEL, seed + 4));
  const hy = snap2(f - ph);
  const arm = (k: number, back: boolean) => {
    const an = (k / 6) * Math.PI * 2 + 0.3, sn = Math.sin(an);
    if ((sn < 0) !== back) return;
    const ex = x + Math.cos(an) * aw, ey = hy + 8 * s + sn * 10 * s;
    for (let u = 0; u <= 1; u += 0.06) box(g, snap2(x + (ex - x) * u), snap2(hy + (ey - 4 * s - hy) * u), 2, 2, back ? G[0] : G[1]);
    const C = rampF(F, ACCENT[k % 4]), cw = snap2(10 * s), ch = snap2(Math.max(4, 6 * s));
    box(g, snap2(ex - cw / 2), snap2(ey - ch / 2), cw, ch, back ? C[1] : C[2]); box(g, snap2(ex - cw / 2), snap2(ey - ch / 2), 2, ch, back ? C[2] : C[3]); box(g, snap2(ex + cw / 2) - 2, snap2(ey - ch / 2), 2, ch, C[0]);
  };
  for (let k = 0; k < 6; k++) arm(k, true);
  // (the base: a skirt, stepped)
  poly(g, [[x - 24 * s, f], [x - 14 * s, f - 14 * s], [x + 14 * s, f - 14 * s], [x + 24 * s, f]], B[2]);
  poly(g, [[x - 24 * s, f], [x - 14 * s, f - 14 * s], [x - 8 * s, f - 14 * s], [x - 14 * s, f]], B[3]);
  poly(g, [[x + 8 * s, f], [x + 10 * s, f - 14 * s], [x + 14 * s, f - 14 * s], [x + 24 * s, f]], B[1]);
  cylV(g, x, f - 14 * s, hy, 8 * s, 6 * s, G);
  ball(g, x, hy, 8 * s, G);
  for (let k = 0; k < 6; k++) arm(k, false);
  box(g, snap2(x) - 2, snap2(hy - 22 * s), 2, snap2(14 * s), G[1]);
  box(g, snap2(x) - 4, snap2(hy - 22 * s) - 2, 4, 4, F.night > 0.3 ? LIT : G[3]);
};
/** A googie spire: a tapering mast between two fins, two little saucer decks up it, a starburst on top (neon after
 *  dark). */
const spire = (g: Ctx, F: Far, x: number, f: number, s: number, seed: number) => {
  const th = snap2((140 + hash(seed) * 60) * s), R = rampF(F, pick(PASTEL, seed + 5)), A = rampF(F, pick(ACCENT, seed + 6));
  // (the fins: the lit one left, the shaded right)
  poly(g, [[x - 4 * s, f - th * 0.5], [x - 22 * s, f], [x - 4 * s, f]], R[3]);
  poly(g, [[x + 4 * s, f - th * 0.5], [x + 22 * s, f], [x + 4 * s, f]], R[1]);
  cylV(g, x, f, f - th, 12 * s, 4 * s, R);
  for (const [k, w] of [[0.55, 18], [0.78, 12]] as const) {
    const y = snap2(f - th * k), rw = snap2(w * s);
    g.fillStyle = A[1]; g.beginPath(); g.ellipse(snap2(x), y, rw, 5 * s, 0, 0, Math.PI); g.fill();
    for (let xx = -rw; xx < rw; xx += 2) box(g, snap2(x) + xx, y - 4, 2, 4, across((xx + rw) / (rw * 2), A));
    windowRow(g, F, x - rw + 2, x + rw - 2, y - 2, A, seed + k * 10, 4, 2, false);
  }
  // (the starburst)
  const sy = snap2(f - th - 6 * s), sl = 12 * s, col = neon(F, NEON_P, A[3]);
  for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; for (let u = 2; u < sl * (k % 2 ? 0.6 : 1); u += 2) box(g, snap2(x + Math.cos(a) * u) - 1, snap2(sy + Math.sin(a) * u), 2, 2, col); }
  box(g, snap2(x) - 2, sy - 2, 4, 4, F.night > 0.3 ? LIT : A[4]);
};
/** The hotel of tomorrow: a tall slab, its window grid (lit after dark), a fin up one side with a neon stripe, a
 *  boomerang canopy over its door. */
const hotel = (g: Ctx, F: Far, x: number, f: number, s: number, seed: number) => {
  const w = snap2((40 + hash(seed) * 16) * s), h = snap2((100 + hash(seed + 1) * 60) * s), R = rampF(F, pick(PASTEL, seed + 7)), A = rampF(F, pick(ACCENT, seed + 8));
  const x0 = snap2(x - w / 2);
  block(g, x0, f - h, w, h, R);
  windowGrid(g, F, x0 + 2, f - h + 4, w - 10, h - 20 * s, R, seed, 6, s >= 1);
  // (the fin: up past the roof at the right, a neon stripe down it)
  const fw = snap2(Math.max(4, 8 * s)), fx = x0 + w - fw;
  poly(g, [[fx, f - h], [fx + fw, f - h], [fx + fw, f - h - 26 * s], [fx, f - h - 12 * s]], A[1]);
  box(g, fx, snap2(f - h - 10 * s), fw, snap2(h * 0.7), A[1]);
  box(g, fx + 2, snap2(f - h - 6 * s), 2, snap2(h * 0.66), neon(F, NEON_T, A[3]));
  // (the canopy over the door, its shade under it)
  const cy = snap2(f - 14 * s);
  poly(g, [[x0 - 8 * s, cy], [x0 + w * 0.5, cy - 6 * s], [x0 + w + 6 * s, cy + 2], [x0 + w * 0.5, cy - 2]], A[1]);
  box(g, x0 + 4, cy, w - 8, 2, R[0]);
  box(g, snap2(x - 4 * s), cy + 2, snap2(8 * s), f - cy - 2, on(F, seed + 9, 1.2) ? LIT : R[0]);
};
/** A radar dish up on a lattice tower: the legs braced, the dish tilted (its bowl stepped), the feed out of it, a
 *  beacon. */
const radar = (g: Ctx, F: Far, x: number, f: number, s: number, seed: number) => {
  const th = snap2((60 + hash(seed) * 30) * s), G = rampF(F, '#B8BECC');
  const ty = snap2(f - th);
  for (let y = ty; y < f; y += 2) {
    const t = (y - ty) / th, hw = snap2((4 + 12 * t) * s);
    box(g, snap2(x) - hw, y, 2, 2, G[3]); box(g, snap2(x) + hw - 2, y, 2, 2, G[1]);
    if (Math.round((y - ty) / 2) % 8 === 0) box(g, snap2(x) - hw, y, hw * 2, 2, G[1]);
    const k = ((y - ty) / 2) % 8, u = snap2(((k / 8) * 2 - 1) * hw);
    box(g, snap2(x) + u, y, 2, 2, G[0]);
  }
  // (the dish)
  const dx = snap2(x - 2 * s), dy = snap2(ty - 10 * s), rx = 20 * s, ry = 11 * s;
  g.save(); g.translate(dx, dy); g.rotate(-0.45);
  for (const [k, col, ox] of [[1, G[0], 0], [0.9, G[1], -1], [0.7, G[3], -2], [0.36, G[4], -3]] as const) { g.fillStyle = col; g.beginPath(); g.ellipse(ox * s, ox * s, rx * k, ry * k, 0, 0, Math.PI * 2); g.fill(); }
  g.restore();
  for (let u = 0; u < 12 * s; u += 2) box(g, snap2(dx + u * 0.5), snap2(dy - u), 2, 2, G[1]);
  beacon(g, F, dx + 6 * s, dy - 14 * s);
  box(g, snap2(x) - 2, ty, 4, 4, G[1]);
};
/** The Tomorrow Sphere: a geodesic ball up on three legs, its facets a lattice over the stepped shells. */
const geo = (g: Ctx, F: Far, x: number, f: number, s: number, seed: number) => {
  const r = snap2((26 + hash(seed) * 6) * s), cy = snap2(f - 18 * s - r), R = rampF(F, '#D6DCEA');
  for (const lx of [-0.8, 0, 0.8]) { const fx = x + lx * r, tx = x + lx * r * 0.5; poly(g, [[fx - 3 * s, f], [tx - 2 * s, cy + r * 0.6], [tx + 2 * s, cy + r * 0.6], [fx + 3 * s, f]], lx > 0 ? R[1] : R[2]); }
  ball(g, x, cy, r, R);
  g.save(); g.beginPath(); g.arc(snap2(x), cy, r, 0, Math.PI * 2); g.clip();
  g.strokeStyle = R[1]; g.lineWidth = 1;
  for (let k = -2; k <= 2; k++) { g.beginPath(); g.ellipse(snap2(x), cy, Math.abs(k) * r * 0.36 + 0.5, r, 0, 0, Math.PI * 2); g.stroke(); }
  for (let k = -2; k <= 2; k++) { const yy = cy + k * r * 0.36; g.beginPath(); g.moveTo(x - r, yy); g.lineTo(x + r, yy); g.stroke(); }
  g.restore();
  // (a band of lights round its middle after dark)
  if (F.night > 0.3) for (let xx = -r + 4; xx < r - 2; xx += 6) box(g, snap2(x + xx), cy, 2, 2, on(F, seed + xx, 1.2) ? LIT : R[0]);
};
/** A pavilion: low, a band of glass along its front (lit after dark), a folded-plate roof zigzagging over it (its
 *  slopes facing left lit, the others shaded; the plate's edge in shade under). */
const pavilion = (g: Ctx, F: Far, x: number, f: number, s: number, seed: number) => {
  const w = snap2((76 + hash(seed) * 30) * s), ph = snap2((24 + hash(seed + 1) * 14) * s), R = rampF(F, pick(PASTEL, seed + 9)), A = rampF(F, pick(ACCENT, seed + 10));
  const x0 = snap2(x - w / 2), top = f - ph;
  block(g, x0, top, w, ph, R);
  windowRow(g, F, x0 + 6, x0 + w - 6, top + 8 * s, R, seed, 4, snap2(Math.max(2, 8 * s)), s >= 1);
  const n = 4 + Math.floor(hash(seed + 2) * 3), pw = (w + 12 * s) / n, rh = 12 * s;
  for (let k = 0; k < n; k++) {
    const a = x0 - 6 * s + k * pw;
    poly(g, [[a, top], [a + pw / 2, top - rh], [a + pw / 2, top]], A[3]);
    poly(g, [[a + pw / 2, top - rh], [a + pw, top], [a + pw / 2, top]], A[1]);
  }
  box(g, snap2(x0 - 6 * s), snap2(top), snap2(w + 12 * s), 2, A[0]);
};
const PIECES: Record<Piece, (g: Ctx, F: Far, x: number, f: number, s: number, seed: number) => void> = { dome, saucer, rocket, orbitron, spire, hotel, radar, geo, pavilion };
/** One piece of the skyline. */
export const piece = (g: Ctx, F: Far, kind: Piece, x: number, f: number, seed: number, s = F.s) => PIECES[kind](g, F, x, f, s, seed);

/**
 * A strip of skyline across a tile `tw` wide, standing on f: pieces picked from `kinds` (seeded), each kept wholly in
 * the tile (so the tile meets round itself), gaps between. The taller ones first so the low ones stand in front.
 */
export const skyline = (g: Ctx, F: Far, tw: number, f: number, seed: number, kinds: Piece[], gap: [number, number] = [14, 50]) => {
  const items: [number, Piece, number][] = [];
  let x = 10 + hash(seed) * 30;
  for (let i = 0; ; i++) {
    const kind = kinds[Math.floor(hash(seed + i * 7.3) * kinds.length) % kinds.length], w = PIECE_W[kind] * F.s;
    if (x + w > tw - 10) break;
    items.push([x + w / 2, kind, seed + i * 13]);
    x += w + (gap[0] + hash(seed + i * 5.7) * (gap[1] - gap[0])) * F.s;
  }
  const tall = (k: Piece) => (['spire', 'hotel', 'rocket', 'saucer'] as Piece[]).includes(k);
  for (const [cx, kind, sd] of items) if (tall(kind)) piece(g, F, kind, cx, f, sd);
  for (const [cx, kind, sd] of items) if (!tall(kind)) piece(g, F, kind, cx, f, sd);
};

/** The monorail's beam across a tile on its T pylons (its top in shade, its belly dark: nothing lit to stand on), a
 *  train on it at `trainX` (its windows lit after dark). */
export const monorail = (g: Ctx, F: Far, tw: number, f: number, y: number, trainX: number, span = 170) => {
  const C = rampF(F, '#D4D8E4'), y0 = snap2(y), bh = snap2(Math.max(4, 6 * F.s));
  const np = Math.max(1, Math.round(tw / span));
  for (let i = 0; i < np; i++) { const x = ((i + 0.5) * tw) / np; box(g, snap2(x) - 2, y0 + bh, 4, f - y0 - bh, C[1]); box(g, snap2(x) - 2, y0 + bh, 2, f - y0 - bh, C[2]); box(g, snap2(x - 8 * F.s), y0 + bh, snap2(16 * F.s), 2, C[0]); }
  box(g, 0, y0, tw, bh, C[2]); box(g, 0, y0, tw, 2, C[1]); box(g, 0, y0 + bh - 2, tw, 2, C[0]);
  // (the train: a nose each end, a band of windows, a stripe)
  const tl = snap2(110 * F.s), th = snap2(12 * F.s), ty = y0 - th, T = rampF(F, '#F4F6FA'), P = rampF(F, ACCENT[0]);
  for (const tx of [trainX, trainX - tw, trainX + tw]) {
    if (tx + tl < 0 || tx > tw) continue;
    box(g, snap2(tx), ty, tl, th, T[2]); box(g, snap2(tx), ty + th - 2, tl, 2, T[0]); box(g, snap2(tx), ty + 2, 2, th - 4, T[3]);
    poly(g, [[tx, ty + 2], [tx - 10 * F.s, ty + th], [tx, ty + th]], T[3]);
    poly(g, [[tx + tl, ty + 2], [tx + tl + 10 * F.s, ty + th], [tx + tl, ty + th]], T[1]);
    box(g, snap2(tx), snap2(ty + th * 0.66), tl, 2, P[2]);
    windowRow(g, F, tx + 4, tx + tl - 4, ty + 3, T, 777 + tx, 6, snap2(Math.max(2, th * 0.3)), false);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Ground, trees, hills

/**
 * The ground a skyline stands on, from f down `gh` (a lawn banded darker going down, each step dithered in; a pale walk
 * along it with lamp posts, their bulbs lit after dark), and a tree line along its back edge in front of the pieces'
 * feet (round crowns lit at the upper left, an atomic palm here and there), gaps in it.
 */
export const parkGround = (g: Ctx, F: Far, tw: number, f: number, gh: number, seed: number) => {
  const L = ['#2A4512', '#3C5F17', '#4F7A1C', '#679A26', '#86B838'].map(F.T), Wk = rampF(F, '#C8C4DC');
  f = snap2(f);
  box(g, 0, f - 2, tw, gh + 2, L[3]);
  [L[2], L[1], L[0]].forEach((col, i) => { const y = f + snap2(((i + 1) * gh) / 4); box(g, 0, y, tw, f + gh - y, col); checker(g, 0, y - 2, tw, 2, col, i % 2); });
  const wy = f + snap2(gh * 0.42);
  box(g, 0, wy, tw, snap2(Math.max(2, 4 * F.s)), Wk[2]); box(g, 0, wy + snap2(Math.max(2, 4 * F.s)), tw, 2, Wk[0]);
  // (the tree line: crowns along the back edge, gaps here and there)
  const T = ['#24442A', '#335E34', '#477A3C', '#62964A'].map(F.T), r = Math.max(4, 7 * F.s);
  const nc = Math.max(1, Math.round(tw / (r * 1.5)));
  for (let i = 0; i < nc; i++) {
    if (hash(seed + i * 1.37) < 0.22) continue;
    const rr = r * (0.7 + hash(seed + i * 3.1) * 0.6), y = f + 2 - rr * 0.4;
    // (and again a tile over, where it's cut off at an end: the tile meets round itself)
    for (const x of [(i * tw) / nc, (i * tw) / nc + tw, (i * tw) / nc - tw]) {
      if (x < -rr * 2 || x > tw + rr * 2) continue;
      pixelBlob(g, x + rr * 0.15, y + rr * 0.1, rr, rr * 0.75, T[0]);
      pixelBlob(g, x, y, rr * 0.88, rr * 0.66, T[1]);
      pixelBlob(g, x - rr * 0.22, y - rr * 0.2, rr * 0.5, rr * 0.36, T[2]);
      if (rr > 6) pixelBlob(g, x - rr * 0.36, y - rr * 0.34, rr * 0.22, rr * 0.16, T[3]);
    }
  }
  // (atomic palms: a ringed trunk, fronds in a starburst, a ball at the heart)
  for (let i = 0; i < 6; i++) {
    const x = snap2(((i + 0.5) * tw) / 6 + (hash(seed + i * 3.1) - 0.5) * 60), h = snap2((30 + hash(seed + i) * 16) * F.s);
    if (x < 20 || x > tw - 20) continue;
    for (let y = 0; y < h; y += 2) box(g, x, f - y, 2, 2, F.T(y % 6 ? '#8A6A4A' : '#5A4030'));
    const fr = 12 * F.s;
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; for (let u = 2; u < fr; u += 2) box(g, snap2(x + Math.cos(a) * u), snap2(f - h + Math.sin(a) * u * 0.6 + (u * u) / (fr * 3)), 2, 2, k < 4 ? T[1] : T[2]); }
    box(g, x - 2, f - h - 2, 4, 4, F.T('#E8C850'));
  }
  // (lamp posts along the walk)
  const nl = Math.max(1, Math.round(tw / 90));
  for (let i = 0; i < nl; i++) { const x = snap2(30 + (i * tw) / nl); box(g, x, wy - snap2(10 * F.s), 2, snap2(10 * F.s), Wk[0]); box(g, x - 2, wy - snap2(10 * F.s) - 2, 4, 2, F.night > 0.3 ? LIT : Wk[1]); }
};

/** Hills (or far mountains) for the park's horizon: the range painted along `yAt` (lit flanks, gullies, forest up its
 *  slopes), misted toward its foot. */
export const parkHills = (g: Ctx, tw: number, yAt: (x: number) => number, bottom: number, look: RangeLook, forest: [string, string] | null, haze: string, seed: number) => {
  range(g, tw, yAt, bottom, look, seed, { gullies: 18, d: 14, forest });
  mist(g, tw, bottom - 60, 60, haze, 0, 0.55, 5);
};
