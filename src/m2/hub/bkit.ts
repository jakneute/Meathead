// The hub's building kit (the stretches' buildings, stamped): the pieces every front's made of, at the lands' own SNES
// detail. Materials in six-step ramps (R6: shadow, shade, under, body, lit, highlight), stepped shading with a row of
// dither at each step, inked edges. Windows framed, silled and linteled, the sky in them by day (banded, a glint) and
// lit warm after dark (curtains, a lamp, a figure now and then); doors paneled on their steps; awnings dimmed (not to
// stand on); gutters, downspouts, chimneys, vents, signs, planters, lamps.
//
// Depth: the hub's one eye is the cylinder's middle, its horizon HUB_HORIZON. A building's walls going back run toward
// its own middle column there (each stands square on to the eye: its sides are edge-on, never seen), so what shows of
// its depth is its tops: a flat roof, a gable's slopes, an awning, a porch roof, seen from above (they're all under the
// eye) as planes narrowing back toward (its middle, the horizon). `back(x, y, cx, s)`: where a point on its front is
// `s` of the way back (s < 1: farther).

import { type Ctx, INK, mix, hash, checker, box, R6 } from './kit';
import { HUB_HORIZON } from './geometry';
import { signText, type Look } from '../signLetters';

export { type Ctx, INK, mix, hash, checker, box, R6 };
export type Pt = [number, number];

/** A point on a front, `s` back toward the eye (its walls run back to its middle column cx at the horizon). */
export const back = (x: number, y: number, cx: number, s: number): Pt => [cx + (x - cx) * s, HUB_HORIZON + (y - HUB_HORIZON) * s];
export const poly = (g: Ctx, pts: Pt[], col: string) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
export const polyI = (g: Ctx, pts: Pt[], col: string, w = 1) => { poly(g, pts, col); g.strokeStyle = INK; g.lineWidth = w; g.lineJoin = 'round'; g.stroke(); };
export const seg = (g: Ctx, a: Pt, b: Pt, col: string, w = 1) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// ---------------------------------------------------------------------------------------------------------------
// Walls

/** A wall's body in stepped shade: lit down its left, shaded down its right, a dither row at each step (no lit top). */
export const wall = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], ink = true) => {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  if (ink) box(g, x - 1, y - 1, w + 2, h + 1, INK);
  box(g, x, y, w, h, R[3]);
  const lw = Math.max(2, Math.round(w * 0.08) & ~1), sw = Math.max(2, Math.round(w * 0.16) & ~1);
  box(g, x, y, lw, h, R[4]); checker(g, x + lw, y, 2, h, R[4]);
  box(g, x + w - sw, y, sw, h, R[2]); checker(g, x + w - sw - 2, y, 2, h, R[2], 1);
};
/** Brick in courses (each brick a step of its own), mortar lines, a few headers darker; soot toward the top. */
export const bricks = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], seed = 0, bw = 8, bh = 4) => {
  box(g, x, y, w, h, R[1]);
  for (let yy = y, r = 0; yy < y + h; yy += bh, r++) for (let xx = x - (r % 2 ? bw / 2 : 0); xx < x + w; xx += bw) {
    const a = Math.max(x, xx), b = Math.min(x + w, xx + bw - 1);
    if (b <= a) continue;
    const t = hash(seed + xx * 0.37 + r * 3.1), col = R[t > 0.85 ? 4 : t > 0.3 ? 3 : t > 0.1 ? 2 : 1];
    box(g, a, yy, b - a, Math.min(bh - 1, y + h - yy), col);
    if (t > 0.6) box(g, a, yy, b - a, 1, mix(col, R[5], 0.35));
  }
};
/** Clapboard: lapped boards across, each lit along its top edge, shaded under its lap; knots, a split or two. */
export const clapboard = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], seed = 0, bh = 5) => {
  box(g, x, y, w, h, R[3]);
  for (let yy = y, k = 0; yy < y + h; yy += bh, k++) {
    box(g, x, yy, w, 1, R[4]); box(g, x, yy + bh - 1, w, 1, R[1]);
    if (hash(seed + k) > 0.6) box(g, x + hash(seed + k * 3) * (w - 6), yy + 2, 3, 1, R[2]);
  }
};
/** Board and batten (up and down), weathered: each board its own step, the battens lit on their left. */
export const boards = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], seed = 0, bw = 7) => {
  for (let xx = x, k = 0; xx < x + w; xx += bw, k++) {
    const t = hash(seed + k * 1.7), ww = Math.min(bw, x + w - xx);
    box(g, xx, y, ww, h, R[t > 0.7 ? 4 : t > 0.25 ? 3 : 2]);
    box(g, xx, y, 1, h, R[1]); box(g, xx + 1, y, 1, h, mix(R[3], R[5], 0.3));
    for (let j = 0; j < h / 18; j++) box(g, xx + 2 + (j % 2), y + hash(seed + k * 5 + j) * h, 1, 5, R[2]);
    box(g, xx + ww / 2, y + 2, 1, 1, R[0]); box(g, xx + ww / 2, y + h - 3, 1, 1, R[0]);
  }
};
/** Dressed stone in courses: each block stepped, lit along its top and left, shaded under; a chip here and there. */
export const ashlar = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], seed = 0, bw = 16, bh = 8) => {
  box(g, x, y, w, h, R[1]);
  for (let yy = y, r = 0; yy < y + h; yy += bh, r++) for (let xx = x - (r % 2 ? bw / 2 : 0); xx < x + w; xx += bw) {
    const a = Math.max(x, xx), b = Math.min(x + w, xx + bw - 1), hh = Math.min(bh - 1, y + h - yy);
    if (b <= a) continue;
    const t = hash(seed + xx * 0.31 + r * 2.7), col = R[t > 0.8 ? 4 : t > 0.3 ? 3 : 2];
    box(g, a, yy, b - a, hh, col); box(g, a, yy, b - a, 1, R[Math.min(5, R.indexOf(col) + 1)]); box(g, a, yy, 1, hh, mix(col, R[5], 0.3));
    box(g, a, yy + hh - 1, b - a, 1, R[2]);
    if (t < 0.1 && b - a > 6) box(g, a + (b - a) * 0.6, yy + 2, 2, 2, R[1]);
  }
};
/** Stucco or plaster: stippled, water stains down from the top, a crack. */
export const plaster = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], seed = 0) => {
  for (let i = 0; i < (w * h) / 60; i++) box(g, x + hash(seed + i * 1.3) * w, y + hash(seed + i * 2.9) * h, 1, 1, i % 3 ? R[2] : R[4]);
  for (let k = 0; k < w / 50; k++) { const sx = x + 6 + hash(seed + k * 5.5) * (w - 12); checker(g, sx, y + 2, 3, 8 + hash(seed + k) * 16, R[2], 0, 1); }
};
/** Corrugated metal (a studio's, a shed's): ribs, each lit on its left; rust bleeding from the rivet rows. */
export const corrugated = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], seed = 0) => {
  box(g, x, y, w, h, R[3]);
  for (let xx = x; xx < x + w; xx += 4) { box(g, xx, y, 1, h, R[4]); box(g, xx + 2, y, 1, h, R[2]); }
  for (let yy = y + 10; yy < y + h; yy += 26) { for (let xx = x + 2; xx < x + w; xx += 8) box(g, xx, yy, 1, 1, R[1]); if (hash(seed + yy) > 0.5) checker(g, x + hash(seed + yy * 3) * w, yy + 1, 3, 10, '#8A4A1C', 0, 1); }
};
/** A run of rivets. */
export const rivets = (g: Ctx, x0: number, x1: number, y: number, step: number, R: string[]) => { for (let x = x0; x < x1; x += step) { box(g, x, y, 2, 2, R[1]); box(g, x, y, 1, 1, R[5]); } };

// ---------------------------------------------------------------------------------------------------------------
// Openings

export interface WinOpts {
  frame?: string; sill?: boolean; lintel?: string; mull?: number; trans?: boolean; arch?: boolean; round?: boolean;
  curtain?: string; shutters?: string; box?: boolean; glass?: string; seed?: number; on?: boolean;
}
/** A window: its frame (inked), the glass (the sky in it by day, banded, a glint; lit warm after dark, curtains drawn
 *  back, a lamp, sometimes someone), its mullions, its sill and lintel, shutters, a flower box. */
export const win = (g: Ctx, x: number, y: number, w: number, h: number, lit: boolean, o: WinOpts = {}) => {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  const F = R6(o.frame ?? '#F1E8D8'), seed = o.seed ?? x * 0.13 + y * 0.7, on = lit && (o.on ?? hash(seed) > 0.22);
  const shape = (c: Ctx, grow: number) => {
    c.beginPath();
    if (o.round) c.ellipse(x + w / 2, y + h / 2, w / 2 + grow, h / 2 + grow, 0, 0, Math.PI * 2);
    else if (o.arch) { c.moveTo(x - grow, y + h + grow); c.lineTo(x - grow, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2 + grow, Math.PI, 0); c.lineTo(x + w + grow, y + h + grow); c.closePath(); }
    else c.rect(x - grow, y - grow, w + grow * 2, h + grow * 2);
  };
  if (o.shutters) { const S = R6(o.shutters); for (const sx of [x - Math.ceil(w / 2) - 3, x + w + 3]) { box(g, sx - 1, y - 1, Math.ceil(w / 2) + 2, h + 2, INK); box(g, sx, y, Math.ceil(w / 2), h, S[3]); box(g, sx, y, 1, h, S[4]); for (let yy = y + 2; yy < y + h - 1; yy += 3) box(g, sx + 1, yy, Math.ceil(w / 2) - 2, 1, S[2]); } }
  shape(g, 2); g.fillStyle = INK; g.fill();
  shape(g, 1); g.fillStyle = F[3]; g.fill();
  g.save(); shape(g, 0); g.clip();
  if (on) {
    const G = ['#7A3E10', '#C0701E', '#F0A83E', '#FFD87A', '#FFF4C8'];
    for (let i = 0; i < 4; i++) box(g, x, y + (h * i) / 4, w, Math.ceil(h / 4) + 1, G[4 - i]);
    checker(g, x, y + Math.round(h / 4) - 1, w, 2, G[3], 0, 1); checker(g, x, y + Math.round(h / 2) - 1, w, 2, G[2], 1, 1);
    // (inside: a lamp's shade, or someone)
    const k = hash(seed * 3);
    if (k < 0.3 && w > 8) { box(g, x + w * 0.6, y + h * 0.45, 5, 4, '#F6D365'); box(g, x + w * 0.6 + 2, y + h * 0.45 + 4, 1, h, '#5A3A1A'); }
    else if (k < 0.5 && w > 8) { box(g, x + w * 0.3, y + h * 0.35, 4, 4, '#4A2A14'); box(g, x + w * 0.3 - 1, y + h * 0.35 + 4, 6, h, '#5A3420'); }
  } else {
    const glass = o.glass ?? '#9CC8E8', G = [mix(glass, '#1E3A5A', 0.45), mix(glass, '#1E3A5A', 0.25), glass, mix(glass, '#FFFFFF', 0.4)];
    box(g, x, y, w, h, G[1]); box(g, x, y, w, h * 0.45, G[2]); checker(g, x, y + Math.round(h * 0.45) - 1, w, 2, G[2], 0, 1);
    box(g, x, y + h * 0.75, w, h * 0.25 + 1, G[0]);
    g.strokeStyle = G[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 1, y + Math.min(h, w) * 0.6); g.lineTo(x + Math.min(h, w) * 0.6, y + 1); g.moveTo(x + 1, y + Math.min(h, w) * 0.9); g.lineTo(x + Math.min(h, w) * 0.9, y + 1); g.stroke();
  }
  // (curtains drawn back either side)
  if (o.curtain) { const C = R6(o.curtain); box(g, x, y, Math.max(2, w * 0.22), h, on ? C[3] : C[2]); box(g, x + w - Math.max(2, w * 0.22), y, Math.max(2, w * 0.22), h, on ? C[2] : C[1]); box(g, x, y, w, 2, C[1]); }
  g.restore();
  // (the mullions)
  const n = o.mull ?? (w > 14 ? 2 : 1);
  for (let k = 1; k < n; k++) box(g, x + Math.round((w * k) / n) - 1, y, 2, h, F[2]);
  if (o.trans !== false && h > 10 && !o.round) box(g, x, y + Math.round(h * (o.arch ? 0.5 : 0.42)), w, 1, F[2]);
  if (o.sill !== false && !o.round) { box(g, x - 3, y + h + 1, w + 6, 3, INK); box(g, x - 2, y + h + 1, w + 4, 2, F[4]); box(g, x - 2, y + h + 1, w + 4, 1, F[5]); }
  if (o.lintel && !o.arch && !o.round) { const L = R6(o.lintel); box(g, x - 3, y - 5, w + 6, 4, INK); box(g, x - 2, y - 4, w + 4, 3, L[3]); box(g, x - 2, y - 4, w + 4, 1, L[5]); box(g, x + w / 2 - 2, y - 5, 4, 4, L[4]); }
  if (o.box) { box(g, x - 2, y + h + 4, w + 4, 5, INK); box(g, x - 1, y + h + 4, w + 2, 4, '#7A4A22'); for (let k = 0; k < w + 2; k += 3) box(g, x - 1 + k, y + h + 1 + (k % 2), 2, 3, ['#F472B6', '#FDE047', '#F87171', '#4ADE80'][(k / 3 + Math.round(seed)) % 4 | 0]); box(g, x - 1, y + h + 4, w + 2, 1, '#9A6A3E'); }
};

/** A door: its frame, the leaf in panels (or planks), a knob, a window in it or a transom over, the step. */
export const door = (g: Ctx, x: number, foot: number, w: number, h: number, col: string, o: { frame?: string; glass?: boolean; planks?: boolean; arch?: boolean; lit?: boolean; transom?: boolean } = {}) => {
  x = Math.round(x); foot = Math.round(foot);
  const D = R6(col), F = R6(o.frame ?? '#F1E8D8'), top = foot - h;
  box(g, x - 4, top - 4, w + 8, h + 4, INK); box(g, x - 3, top - 3, w + 6, h + 3, F[3]); box(g, x - 3, top - 3, 2, h + 3, F[4]); box(g, x + w + 1, top - 3, 2, h + 3, F[2]);
  if (o.arch) { g.fillStyle = INK; g.beginPath(); g.arc(x + w / 2, top + w / 2, w / 2 + 1, Math.PI, 0); g.fill(); }
  box(g, x - 1, top - 1, w + 2, h + 1, INK);
  if (o.arch) { g.fillStyle = D[3]; g.beginPath(); g.arc(x + w / 2, top + w / 2, w / 2, Math.PI, 0); g.fill(); box(g, x, top + w / 2, w, h - w / 2, D[3]); }
  else box(g, x, top, w, h, D[3]);
  box(g, x, top, 2, h, D[4]); box(g, x + w - 2, top, 2, h, D[2]);
  if (o.planks) for (let xx = x + 4; xx < x + w - 1; xx += 4) box(g, xx, top + 1, 1, h - 1, D[2]);
  else {
    const pw = Math.floor((w - 6) / 2), py = o.glass ? top + h * 0.45 : top + 4;
    for (const px of [x + 2, x + 4 + pw]) for (const [yy, hh] of [[py, (foot - py - 6) * 0.45], [py + (foot - py - 6) * 0.5, (foot - py - 6) * 0.45]] as const) { box(g, px, yy, pw, hh, D[2]); box(g, px, yy, pw, 1, D[1]); box(g, px, yy + hh - 1, pw, 1, D[4]); }
    if (o.glass) win(g, x + 3, top + 4, w - 6, h * 0.36, !!o.lit, { frame: col, sill: false, trans: false, mull: 2, on: true });
  }
  if (o.transom) win(g, x, top - 9, w, 5, !!o.lit, { frame: o.frame ?? '#F1E8D8', sill: false, trans: false, mull: 3, on: true });
  box(g, x + w - 5, top + h * 0.55, 2, 2, '#F2C84A'); box(g, x + w - 5, top + h * 0.55, 1, 1, '#FFF0A8');
  box(g, x - 6, foot - 3, w + 12, 3, INK); box(g, x - 5, foot - 3, w + 10, 2, '#B4AEA4'); box(g, x - 5, foot - 3, w + 10, 1, '#E7E5E4');
};

/** A wall lamp on its bracket (lit after dark: a step of glow round it). */
export const sconce = (g: Ctx, x: number, y: number, lit: boolean, col = '#27272A') => {
  if (lit) { g.fillStyle = 'rgba(255, 216, 122, 0.18)'; g.beginPath(); g.arc(x, y + 4, 9, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255, 216, 122, 0.22)'; g.beginPath(); g.arc(x, y + 4, 5, 0, Math.PI * 2); g.fill(); }
  box(g, x - 1, y - 3, 2, 3, col); box(g, x - 3, y, 6, 2, col);
  box(g, x - 3, y + 2, 6, 6, INK); box(g, x - 2, y + 3, 4, 4, lit ? '#FFF4C8' : '#E8DCC0'); box(g, x - 2, y + 3, 1, 4, '#FFFFFF');
  box(g, x - 3, y + 8, 6, 1, col);
};

// ---------------------------------------------------------------------------------------------------------------
// Tops (the planes going back: all under the eye, so seen from above)

/** A flat roof's top going back (tar and gravel, a parapet's coping along the front), its clutter on it. */
export const flatTop = (g: Ctx, x0: number, x1: number, y: number, cx: number, s: number, R: string[], clutter = 0) => {
  const a = back(x0, y, cx, s), b = back(x1, y, cx, s);
  poly(g, [[x0, y], [x1, y], b, a], R[1]);
  for (let k = 1; k < 4; k++) { const t = k / 4, p = lerp([x0, y], a, t), q = lerp([x1, y], b, t); seg(g, p, q, R[0]); }
  checker(g, Math.min(a[0], x0), a[1], Math.max(b[0], x1) - Math.min(a[0], x0), y - a[1], R[2]);
  // (the clutter: vents, a box fan, a water tank)
  for (let k = 0; k < clutter; k++) {
    const u = 0.2 + (k / Math.max(1, clutter)) * 0.6 + hash(k + x0) * 0.1, [px, py] = lerp(lerp([x0, y], [x1, y], u), lerp(a, b, u), 0.5);
    if (k % 2) { box(g, px - 5, py - 7, 10, 7, INK); box(g, px - 4, py - 6, 8, 6, '#9CA3AF'); for (let j = 0; j < 3; j++) box(g, px - 4, py - 5 + j * 2, 8, 1, '#6B7280'); }
    else { box(g, px - 1, py - 9, 3, 9, INK); box(g, px, py - 9, 1, 9, '#9CA3AF'); box(g, px - 3, py - 11, 7, 3, INK); box(g, px - 2, py - 10, 5, 1, '#D1D5DB'); }
  }
};
/** A gable end facing out: its two slopes going back (shingle courses running back, their tabs across), then the gable
 *  itself flat (painted by the caller over it). Its peak at (px, py), eaves at (x0, ey) and (x1, ey). */
export const gableBack = (g: Ctx, x0: number, x1: number, ey: number, px: number, py: number, cx: number, s: number, R: string[], courses = 6) => {
  for (const [ex, lit] of [[x0, true], [x1, false]] as const) {
    const e: Pt = [ex, ey], p: Pt = [px, py], eb = back(ex, ey, cx, s), pb = back(px, py, cx, s);
    poly(g, [e, p, pb, eb], lit ? R[3] : R[1]);
    for (let k = 1; k < courses; k++) { const t = k / courses; seg(g, lerp(e, p, t), lerp(eb, pb, t), lit ? R[2] : R[0]); }
    for (let k = 1; k < 4; k++) { const t = k / 4; seg(g, lerp(e, eb, t), lerp(p, pb, t), lit ? R[4] : R[2]); }
    g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(...e); g.lineTo(...eb); g.lineTo(...pb); g.lineTo(...p); g.stroke();
  }
  seg(g, [px, py], back(px, py, cx, s), INK, 2);
};
/** A roof with its eaves to the street: the near slope up to the ridge going back (narrower, by the eye), in courses of
 *  `kind` (shingle, tile, slate, tin, thatch), an inked eave and ridge; overhanging `o`. */
export const eaveRoof = (g: Ctx, x0: number, x1: number, ey: number, rise: number, cx: number, s: number, R: string[], kind: 'shingle' | 'tile' | 'slate' | 'tin' | 'thatch' = 'shingle', o = 4) => {
  const e0: Pt = [x0 - o, ey], e1: Pt = [x1 + o, ey], r0 = back(x0 - o, ey - rise, cx, s), r1 = back(x1 + o, ey - rise, cx, s);
  poly(g, [e0, e1, r1, r0], R[3]);
  const rows = Math.max(3, Math.round((ey - r0[1]) / (kind === 'tile' ? 5 : 4)));
  for (let k = 0; k < rows; k++) {
    const t0 = k / rows, t1 = (k + 1) / rows, a0 = lerp(e0, r0, t0), b0 = lerp(e1, r1, t0), a1 = lerp(e0, r0, t1), b1 = lerp(e1, r1, t1);
    const t = hash(k + x0 * 0.1);
    poly(g, [a0, b0, b1, a1], R[k % 2 ? 3 : t > 0.5 ? 4 : 2]);
    seg(g, a0, b0, R[kind === 'tin' ? 4 : 1]);
    // (the tabs, tiles or seams across each course)
    const step = kind === 'tile' ? 5 : kind === 'tin' ? 6 : kind === 'thatch' ? 3 : 7;
    if (kind !== 'thatch') for (let u = ((k % 2) * step) / 2; u < b0[0] - a0[0]; u += step) { const fx = a0[0] + u, fy = a0[1] + (b0[1] - a0[1]) * (u / Math.max(1, b0[0] - a0[0])); seg(g, [fx, fy], [a1[0] + (u * (b1[0] - a1[0])) / Math.max(1, b0[0] - a0[0]), a1[1]], kind === 'tile' ? R[4] : R[2]); }
    else for (let u = 0; u < b0[0] - a0[0]; u += 3) box(g, a0[0] + u, a0[1] - 3, 1, 4, hash(u + k) > 0.5 ? R[4] : R[1]);
  }
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(...e0); g.lineTo(...e1); g.lineTo(...r1); g.lineTo(...r0); g.closePath(); g.stroke();
  box(g, e0[0], ey, e1[0] - e0[0], 2, R[0]);
  seg(g, r0, r1, R[5]);
  return { r0, r1 };
};
/** An awning out over a shopfront, its top going down toward us (stripes, dimmed: not to stand on), its scalloped
 *  valance, the shadow under it on the wall. */
export const awning = (g: Ctx, x0: number, x1: number, y: number, drop: number, a: string, b: string, stripe = 8, scallop = true) => {
  const D = (c: string) => mix(c, '#4A4458', 0.24), out = 4;
  box(g, x0, y + drop + 6, x1 - x0, 4, 'rgba(26, 16, 40, 0.28)');
  for (let x = x0, k = 0; x < x1; x += stripe, k++) {
    const xe = Math.min(x1, x + stripe), col = D(k % 2 ? b : a);
    poly(g, [[x, y], [xe, y], [xe + ((xe - (x0 + x1) / 2) / ((x1 - x0) / 2)) * out, y + drop], [x + ((x - (x0 + x1) / 2) / ((x1 - x0) / 2)) * out, y + drop]], col);
    box(g, x, y, Math.min(stripe, x1 - x), 1, mix(col, '#FFFFFF', 0.3));
    if (scallop) { g.fillStyle = col; g.beginPath(); g.arc(x + stripe / 2 + ((x - (x0 + x1) / 2) / ((x1 - x0) / 2)) * out, y + drop, stripe / 2, 0, Math.PI); g.fill(); }
    else box(g, x + ((x - (x0 + x1) / 2) / ((x1 - x0) / 2)) * out, y + drop, stripe, 4, col);
  }
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.lineTo(x1 + out, y + drop); g.lineTo(x0 - out, y + drop); g.closePath(); g.stroke();
  box(g, x0 - out, y + drop - 1, x1 - x0 + out * 2, 1, D(mix(a, INK, 0.4)));
};

// ---------------------------------------------------------------------------------------------------------------
// Trim and dressing

/** A gutter along an eave and a downspout off one end. */
export const gutter = (g: Ctx, x0: number, x1: number, y: number, spout: number | null, col = '#8A8F98') => {
  const M = R6(col);
  box(g, x0 - 1, y - 1, x1 - x0 + 2, 4, INK); box(g, x0, y, x1 - x0, 2, M[3]); box(g, x0, y, x1 - x0, 1, M[5]);
  if (spout !== null) { box(g, spout - 2, y + 2, 4, 484 - y - 2, INK); box(g, spout - 1, y + 2, 2, 484 - y - 3, M[3]); box(g, spout - 1, y + 2, 1, 484 - y - 3, M[4]); for (let yy = y + 20; yy < 480; yy += 24) box(g, spout - 2, yy, 4, 2, M[1]); box(g, spout - 2, 481, 6, 3, M[2]); }
};
/** A chimney: brick, its corbeled cap, its pots, soot. */
export const chimney = (g: Ctx, x: number, top: number, foot: number, w: number, R: string[] = R6('#9A3E2C')) => {
  box(g, x - 1, top - 1, w + 2, foot - top + 1, INK);
  bricks(g, x, top, w, foot - top, R, x, 5, 3);
  box(g, x, top, 2, foot - top, R[4]); box(g, x + w - 3, top, 3, foot - top, R[1]);
  box(g, x - 3, top - 4, w + 6, 4, INK); box(g, x - 2, top - 3, w + 4, 3, R[2]); box(g, x - 2, top - 3, w + 4, 1, R[4]);
  for (let k = 0; k < Math.max(1, Math.floor(w / 6)); k++) { const px = x + 1 + k * 6; box(g, px - 1, top - 10, 6, 7, INK); box(g, px, top - 9, 4, 6, '#B8684A'); box(g, px, top - 9, 1, 6, '#D8886A'); box(g, px, top - 9, 4, 1, '#3A2418'); }
  checker(g, x, top, w, 4, '#2A2420', 0, 1);
};
/** A vent pipe, a roof vent. */
export const ventPipe = (g: Ctx, x: number, foot: number, h: number) => { box(g, x - 2, foot - h, 4, h, INK); box(g, x - 1, foot - h, 2, h, '#9CA3AF'); box(g, x - 3, foot - h - 3, 6, 3, INK); box(g, x - 2, foot - h - 2, 4, 1, '#D1D5DB'); };
/** A sign board: inked, a beveled frame, the lettering on it. */
export const board = (g: Ctx, cx: number, y: number, w: number, h: number, text: string, L: Look, bg: string, frame = '#3A2208') => {
  const B = R6(bg), F = R6(frame);
  box(g, cx - w / 2 - 2, y - 2, w + 4, h + 4, INK); box(g, cx - w / 2 - 1, y - 1, w + 2, h + 2, F[3]); box(g, cx - w / 2 - 1, y - 1, w + 2, 1, F[5]);
  box(g, cx - w / 2, y, w, h, B[3]); box(g, cx - w / 2, y, w, 2, B[4]); box(g, cx - w / 2, y + h - 2, w, 2, B[2]);
  signText(g, text, cx, y + Math.round(h / 2 + (7 * (L.sy ?? 1)) / 2), L);
};
/** A hanging sign on an iron bracket out from a wall. */
export const hangSign = (g: Ctx, x: number, y: number, dir: 1 | -1, w: number, h: number, bg: string, paint: (cx: number, cy: number) => void) => {
  box(g, Math.min(x, x + dir * (w + 6)), y, w + 6, 2, INK); box(g, x - 1, y - 4, 2, 8, INK);
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y + 6); g.lineTo(x + dir * 8, y + 1); g.stroke();
  const sx = x + dir * 4 + (dir < 0 ? -w : 0);
  box(g, sx + 2, y + 2, 1, 3, INK); box(g, sx + w - 3, y + 2, 1, 3, INK);
  const B = R6(bg);
  box(g, sx - 1, y + 5, w + 2, h + 2, INK); box(g, sx, y + 6, w, h, B[3]); box(g, sx, y + 6, w, 1, B[5]); box(g, sx, y + 5 + h, w, 1, B[1]);
  paint(sx + w / 2, y + 6 + h / 2);
};
/** A planter box of flowers at a wall's foot. */
export const planter = (g: Ctx, x: number, w: number, seed = 0, foot = 484) => {
  for (let k = 0; k < w; k += 3) { const h = 5 + hash(seed + k) * 5; box(g, x + k, foot - 8 - h, 2, h, '#2F6B2A'); box(g, x + k, foot - 9 - h, 3, 3, ['#F472B6', '#FDE047', '#F87171', '#FFFFFF', '#A78BFA'][Math.floor(hash(seed + k * 3) * 5)]); }
  box(g, x - 1, foot - 9, w + 2, 9, INK); box(g, x, foot - 8, w, 8, '#8A5A32'); box(g, x, foot - 8, w, 1, '#B88A5A'); box(g, x, foot - 2, w, 2, '#5E3E22');
};
/** A poster pasted up: its colors in bands, a figure, a title strip, a corner peeling. */
export const poster = (g: Ctx, x: number, y: number, w: number, h: number, cols: string[], seed = 0) => {
  box(g, x - 1, y - 1, w + 2, h + 2, INK);
  box(g, x, y, w, h, cols[0]); box(g, x, y + h * 0.6, w, h * 0.4, cols[1]); checker(g, x, y + h * 0.6 - 1, w, 2, cols[1]);
  box(g, x + w * 0.35, y + h * 0.25, w * 0.3, h * 0.4, cols[2]); box(g, x + w * 0.4, y + h * 0.15, w * 0.2, h * 0.12, cols[2]);
  box(g, x + 1, y + h - 5, w - 2, 3, '#F8FAFC');
  if (hash(seed) > 0.5) { g.fillStyle = '#E7E5E4'; g.beginPath(); g.moveTo(x + w, y); g.lineTo(x + w - 4, y); g.lineTo(x + w, y + 4); g.fill(); }
};
/** A pennant banner hung down a wall from a rod. */
export const banner = (g: Ctx, x: number, y: number, w: number, h: number, col: string, trim = '#F2C84A', paint?: (cx: number) => void) => {
  const B = R6(col);
  box(g, x - 3, y - 2, w + 6, 2, INK);
  poly(g, [[x - 1, y], [x + w + 1, y], [x + w + 1, y + h + 1], [x + w / 2, y + h - w / 3], [x - 1, y + h + 1]], INK);
  poly(g, [[x, y], [x + w, y], [x + w, y + h], [x + w / 2, y + h - w / 3 - 1], [x, y + h]], B[3]);
  box(g, x, y, 2, h - 1, B[4]); box(g, x + w - 2, y, 2, h - 1, B[1]);
  box(g, x, y + 3, w, 1, trim); box(g, x, y + h - w / 3 - 4, w, 1, trim);
  paint?.(x + w / 2);
};
/** A string of bulbs swagged between two points (lit after dark). */
export const bulbs = (g: Ctx, x0: number, y0: number, x1: number, y1: number, sag: number, lit: boolean, cols = ['#F87171', '#FDE047', '#4ADE80', '#60A5FA']) => {
  g.strokeStyle = '#27272A'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + sag * 2, x1, y1); g.stroke();
  const n = Math.max(2, Math.round(Math.abs(x1 - x0) / 7));
  for (let k = 1; k < n; k++) { const t = k / n, bx = (1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * ((x0 + x1) / 2) + t * t * x1, by = (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * ((y0 + y1) / 2 + sag * 2) + t * t * y1; box(g, bx - 1, by, 2, 2, lit ? mix(cols[k % cols.length], '#FFFFFF', 0.4) : cols[k % cols.length]); }
};
