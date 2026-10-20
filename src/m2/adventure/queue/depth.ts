// The Jungle Cruise's painting kit (the queue's and the river's surface): the intro's SNES kit (intro/art/kit.ts) plus
// what the jungle-explorer look needs — depth faked the SNES way (anything at depth s drawn about where the camera
// looks: 1 the plane he walks in, less further back), bamboo, logs, thatch, rope, a box with its top and side going
// back, crude stenciled crates, and the jungle out past it all in parallax.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky, farTint, timeOfDay, skyTint, cloudTint, type TimeOfDay } from '../../timeOfDay';
import { snap2, wave, jag, range, mist, kabooma, falls, canopy, palm, wrapAt, banded, pixelBlob } from '../farArt';
import { type Ctx, INK, rampOf, box, checker, hazeBands, PIX, hash, mix, dark, lite, stamp, tilePattern, text } from '../../intro/art/kit';
import { signAt, stencil as stencilLook } from '../letters';
import { farTemple, farWaterTower, farMonorailBeam, drawMonorail, drawBirds } from '../teases';
import { farMark } from '../../parkFar';

export { INK, rampOf, box, checker, hazeBands, PIX, hash, mix, dark, lite, stamp, tilePattern, text };
export type { Ctx };

// ---------------------------------------------------------------------------------------------------------------
// Depth

/** Where the camera's looking from (its middle, across and a bit up). */
export interface Eye { x: number; y: number }
export const eyeOf = (state: GameState): Eye => ({ x: state.camera.x + CANVAS_WIDTH / 2, y: state.camera.y + CANVAS_HEIGHT * 0.42 });
/** Where a world point (x, y) is drawn when it's at depth s (1 his plane; less, further back). */
export const P = (eye: Eye, x: number, y: number, s: number): [number, number] => [eye.x + (x - eye.x) * s, eye.y + (y - eye.y) * s];
/** A four-cornered shape, filled. */
export const quad = (c: Ctx, a: [number, number], b: [number, number], d: [number, number], e: [number, number], col: string | CanvasPattern) => {
  c.fillStyle = col; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1]); c.lineTo(e[0], e[1]); c.closePath(); c.fill();
};
export const seg = (c: Ctx, a: [number, number], b: [number, number], col: string, w = 1) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); };
/** Into a depth: whatever's drawn after this (in world units) lands at depth s. Undo with c.restore(). */
export const atDepth = (c: Ctx, eye: Eye, s: number) => { c.save(); c.translate(eye.x * (1 - s), eye.y * (1 - s)); c.scale(s, s); };

/**
 * A stretch of still art at a depth, painted once (at the screen's resolution for that depth) and slid with the camera:
 * `paint` draws it in world units (wx..wx+ww, wy..wy+wh) as if at depth 1. Kept per key (and per scale), so many
 * stretches can be in it at once. Returns where it went (screen-world rect) and its canvas, for a reflection.
 */
const chunkCache = new Map<string, HTMLCanvasElement>();
const fontIn = () => typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"');
export const depthChunk = (c: Ctx, eye: Eye, s: number, key: string, wx: number, wy: number, ww: number, wh: number, paint: (g: Ctx) => void) => {
  const m = c.getTransform(), k = Math.abs(m.a), sc = k * s;
  const id = `${key}|${sc.toFixed(3)}`;
  let cv = chunkCache.get(id);
  if (!cv) {
    if (chunkCache.size > 48) chunkCache.clear();
    cv = document.createElement('canvas'); cv.width = Math.max(1, Math.ceil(ww * sc)); cv.height = Math.max(1, Math.ceil(wh * sc));
    const g = cv.getContext('2d')!;
    g.setTransform(sc, 0, 0, sc, -wx * sc, -wy * sc);
    paint(g);
    // (painted before the pixel font was in: used the once, painted again next time)
    if (fontIn()) chunkCache.set(id, cv);
  }
  const [sx, sy] = P(eye, wx, wy, s);
  const dw = cv.width / k, dh = cv.height / k;
  c.drawImage(cv, sx, sy, dw, dh);
  return { cv, sx, sy, dw, dh };
};

// ---------------------------------------------------------------------------------------------------------------
// Materials

export const BAMBOO = '#C9A64E', LOG = '#8A5A2E', PLANK = '#9C7448', STRAW = '#C9A15A', ROPE = '#D8C08A', CANVAS_TAN = '#D9C9A0';

/** A bamboo pole (stood up): stepped round, its joints ringed, lit down the left. */
export const bamboo = (c: Ctx, x: number, top: number, bottom: number, w = 8, col = BAMBOO) => {
  const r = rampOf(col);
  x = Math.round(x); top = Math.round(top); bottom = Math.round(bottom); w = Math.max(2, Math.round(w));
  box(c, x - 1, top, w + 2, bottom - top, INK);
  const cols = [r[3], r[4], r[3], r[2], r[2], r[1], r[1], r[0]];
  for (let i = 0; i < cols.length; i++) { const a = Math.floor((w * i) / cols.length), b = Math.floor((w * (i + 1)) / cols.length); if (b > a) box(c, x + a, top, b - a, bottom - top, cols[i]); }
  const step = Math.max(10, w * 3.2);
  for (let y = top + step * 0.6; y < bottom - 4; y += step) { box(c, x - 1, y, w + 2, 2, r[0]); box(c, x, y + 2, w, 1, r[4]); }
};
/** A bamboo pole laid across (a rail): from x0 to x1 at y. */
export const bambooRail = (c: Ctx, x0: number, x1: number, y: number, h = 5, col = BAMBOO) => {
  const r = rampOf(col);
  x0 = Math.round(x0); x1 = Math.round(x1); y = Math.round(y); h = Math.max(2, Math.round(h));
  box(c, x0, y - 1, x1 - x0, h + 2, INK);
  box(c, x0, y, x1 - x0, h, r[2]); box(c, x0, y, x1 - x0, Math.max(1, h >> 1), r[3]); box(c, x0, y, x1 - x0, 1, r[4]); box(c, x0, y + h - 1, x1 - x0, 1, r[0]);
  const step = Math.max(16, h * 9);
  for (let x = x0 + step * 0.5; x < x1 - 2; x += step) box(c, x, y - 1, 2, h + 2, r[0]);
};
/** Rope lashing round a joint. */
export const lash = (c: Ctx, x: number, y: number, w: number, h = 6) => {
  const r = rampOf(ROPE);
  box(c, x - 1, y - 1, w + 2, h + 2, INK);
  for (let k = 0; k < h; k += 2) { box(c, x, y + k, w, 2, k % 4 ? r[1] : r[3]); box(c, x + 1, y + k, 1, 1, r[4]); }
};
/** A log (stood up), barked: stepped round, the bark in dark streaks. */
export const logPost = (c: Ctx, x: number, top: number, bottom: number, w = 18, col = LOG) => {
  const r = rampOf(col);
  x = Math.round(x); top = Math.round(top); bottom = Math.round(bottom);
  box(c, x - 1, top, w + 2, bottom - top, INK);
  const cols = [r[3], r[3], r[2], r[2], r[2], r[1], r[1], r[0]];
  for (let i = 0; i < cols.length; i++) { const a = Math.floor((w * i) / cols.length), b = Math.floor((w * (i + 1)) / cols.length); if (b > a) box(c, x + a, top, b - a, bottom - top, cols[i]); }
  for (let k = 0; k < 7; k++) {
    const bx = x + 2 + Math.floor(hash(x * 0.3 + k) * (w - 4)), by = top + Math.floor(hash(x + k * 7.1) * (bottom - top - 20));
    box(c, bx, by, 2, 10 + Math.floor(hash(k + x) * 18), r[0]);
  }
  box(c, x, top, w, 3, lite(col, 0.35)); box(c, x + 3, top + 1, w - 6, 1, dark(col, 0.2));
};
/** A log laid across (a beam), its ends showing their rings. */
export const logBeam = (c: Ctx, x0: number, x1: number, y: number, h = 16, col = LOG) => {
  const r = rampOf(col);
  x0 = Math.round(x0); x1 = Math.round(x1); y = Math.round(y);
  box(c, x0 - 1, y - 1, x1 - x0 + 2, h + 2, INK);
  const rows = [r[3], r[4], r[3], r[2], r[2], r[1], r[1], r[0]];
  for (let i = 0; i < rows.length; i++) { const a = Math.floor((h * i) / rows.length), b = Math.floor((h * (i + 1)) / rows.length); if (b > a) box(c, x0, y + a, x1 - x0, b - a, rows[i]); }
  for (let k = 0; k < (x1 - x0) / 14; k++) box(c, x0 + Math.floor(hash(k * 3.3 + y) * (x1 - x0 - 12)), y + 3 + Math.floor(hash(k + y * 0.1) * (h - 6)), 10 + Math.floor(hash(k) * 12), 1, r[0]);
  for (const ex of [x0, x1 - h * 0.7]) { box(c, ex, y, h * 0.7, h, '#C89A62'); box(c, ex + h * 0.2, y + h * 0.3, h * 0.3, h * 0.4, '#9C7044'); box(c, ex, y, h * 0.7, 1, '#E8C48A'); }
};

/** Straw, a row of it: its tile (one row, a hanging fringe of strands along its foot), as a fill. */
const strawTile = (c: Ctx, col: string, key: string) => tilePattern(c, `straw-${key}`, 64, 14, g => {
  const r = rampOf(col);
  g.fillStyle = r[1]; g.fillRect(0, 0, 64, 9);
  g.fillStyle = r[2]; g.fillRect(0, 0, 64, 6);
  for (let x = 0; x < 64; x += 2) {
    const h = 6 + Math.floor(hash(x * 1.7 + 3) * 7), k = hash(x * 0.9);
    g.fillStyle = k < 0.25 ? r[0] : k < 0.6 ? r[1] : k < 0.85 ? r[2] : r[3];
    g.fillRect(x, 4, 2, h);
    g.fillStyle = k < 0.5 ? r[3] : r[4]; g.fillRect(x, 1 + Math.floor(k * 3), 2, 1);
  }
  g.fillStyle = r[0]; for (let x = 0; x < 64; x += 8) g.fillRect(x + 3, 0, 1, 4);
});
/** A band of thatch from y0 down to y1 (x0..x1), layered: each row hanging over the one under it, its fringe ragged. */
export const thatch = (c: Ctx, x0: number, x1: number, y0: number, y1: number, col = STRAW, row = 10) => {
  const pat = strawTile(c, col, col);
  c.fillStyle = dark(col, 0.55); c.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let y = y0; y < y1 - 4; y += row) {
    c.save(); c.translate(0, Math.round(y)); c.fillStyle = pat;
    c.fillRect(x0, 0, x1 - x0, Math.min(14, y1 - y)); c.restore();
  }
};
/**
 * A thatched roof's slope going back: from its eave (at depth s0, height y0) up to its ridge (s1, y1), x0..x1 at the
 * eave, the ends hipped in by `hip` by the ridge. Row by row, each row at its own depth (so it swings round as he goes).
 */
export const thatchRoof = (c: Ctx, eye: Eye, x0: number, x1: number, s0: number, y0: number, s1: number, y1: number, hip = 60, col = STRAW, rows = 18) => {
  const pat = strawTile(c, col, col);
  // (the body under the rows, so no sky shows between them)
  const a = P(eye, x0, y0, s0), b = P(eye, x1, y0, s0), d = P(eye, x1 - hip, y1, s1), e = P(eye, x0 + hip, y1, s1);
  quad(c, a, b, d, e, dark(col, 0.5));
  for (let i = rows; i >= 0; i--) {
    const t = i / rows, s = s0 + (s1 - s0) * t, y = y0 + (y1 - y0) * t, h = hip * t;
    // (further up, a touch darker: the haze, the light off it)
    atDepth(c, eye, s);
    c.fillStyle = pat; c.fillRect(x0 + h, y - 3, x1 - x0 - h * 2, 14);
    if (i > rows * 0.55) { c.fillStyle = `rgba(30, 20, 10, ${(0.06 + (t - 0.55) * 0.3).toFixed(3)})`; c.fillRect(x0 + h, y - 3, x1 - x0 - h * 2, 14); }
    c.restore();
  }
  // (the ridge: a capping of bundled straw, lashed)
  atDepth(c, eye, s1);
  box(c, x0 + hip - 4, y1 - 8, x1 - x0 - hip * 2 + 8, 8, INK); box(c, x0 + hip - 3, y1 - 7, x1 - x0 - hip * 2 + 6, 6, dark(col, 0.2)); box(c, x0 + hip - 3, y1 - 7, x1 - x0 - hip * 2 + 6, 2, lite(col, 0.15));
  for (let x = x0 + hip + 20; x < x1 - hip - 10; x += 60) box(c, x, y1 - 8, 3, 8, rampOf(ROPE)[1]);
  c.restore();
};
/** A thatch roof's front edge, hanging (the eave's fringe, seen straight on): x0..x1, from y down `h`. */
export const fringe = (c: Ctx, x0: number, x1: number, y: number, h = 14, col = STRAW) => {
  const r = rampOf(col);
  box(c, x0, y, x1 - x0, 4, r[1]);
  for (let x = Math.floor(x0 / 2) * 2; x < x1; x += 2) {
    const k = hash(x * 0.71 + 5), len = Math.floor(h * (0.55 + k * 0.45));
    box(c, x, y + 2, 2, len, k < 0.3 ? r[0] : k < 0.65 ? r[1] : r[2]);
    if (k > 0.8) box(c, x, y + 2, 2, 2, r[3]);
  }
  box(c, x0, y, x1 - x0, 1, r[3]);
};

/** Stenciled words (on a crate, a drum, a wall): no shadow, a little worn. */
export const stencil = (c: Ctx, s: string, x: number, y: number, col: string, size = 6) => signAt(c, s, x, y, size, stencilLook(size, col));

/**
 * A box in the world (a crate, a dumpster, an AC unit, a fence post): its front at depth 1 (x..x+w, top..GY-ish
 * `bottom`), its top going back to depth 1 - d (seen from above, lit) and the side facing him going back too. `front`
 * paints its face (stampable: keyed). The top's front edge is its lip: lit (it's stood on).
 */
export const box3d = (c: Ctx, eye: Eye, x: number, top: number, w: number, bottom: number, d: number, col: string, front?: { key: string; paint: (g: Ctx) => void }, topCol?: string) => {
  const r = rampOf(col), s = 1 - d;
  // (the side that faces him)
  const side = eye.x < x ? x : eye.x > x + w ? x + w : null;
  if (side !== null) quad(c, [side, top], P(eye, side, top, s), P(eye, side, bottom, s), [side, bottom], r[0]);
  // (the top: lit; dithered back toward the far edge)
  const tl = P(eye, x, top, s), tr = P(eye, x + w, top, s);
  quad(c, [x, top], [x + w, top], tr, tl, topCol ?? r[3]);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(x, top); c.lineTo(tl[0], tl[1]); c.lineTo(tr[0], tr[1]); c.lineTo(x + w, top); c.stroke();
  if (side !== null) { const p = P(eye, side, bottom, s); c.beginPath(); c.moveTo(P(eye, side, top, s)[0], P(eye, side, top, s)[1]); c.lineTo(p[0], p[1]); c.stroke(); }
  // (the front)
  if (front) stamp(c, front.key, x - 2, top - 2, w + 4, bottom - top + 4, front.paint);
  else { box(c, x, top, w, bottom - top, r[2]); }
  // (the lip: lit)
  box(c, x, top, w, 2, r[4]); box(c, x, top + 2, w, 1, r[3]);
};

// ---------------------------------------------------------------------------------------------------------------
// The jungle out past it all (screen space), in the hour's light

// Each layer's a tile painted once for the hour (a stamp) and slid along at its own pace; farther: paler, bluer, flatter.
// Tile y 0 is HZ_TOP over the horizon.
const TW = 1024, HZ_TOP = 220;
/** Far scenery at the hour: its own color under the hour's light, then into the haze by k. */
const hazeOf = (col: string, k: number, tod: TimeOfDay) => mix(farTint(col, 1, tod), skyTint('#B4E0F0', 0.9, tod), k);
/** The far ranges' lines (tile space): the high peaks at the back; the jungle mountains in front, low where KABOOMA
 *  stands up behind them. */
const KAB_X = 640, FALLS_X = 260;
const backY = (x: number) => snap2(HZ_TOP - 150 + wave(x, TW, 1.3) * 40 + jag(x, TW, 8, 7) * 8);
const frontY = (x: number) => snap2(HZ_TOP - 80 + wave(x, TW, 4.4) * 26 + jag(x, TW, 12, 13) * 4 + 50 * Math.exp(-(((x - KAB_X) / 110) ** 2)));

/** The far ranges: the high peaks at the back (palest, a cloud caught on one), MOUNT KABOOMA steaming between, the
 *  jungle mountains in front (forest up their lower slopes, a falls down one), the mist they stand in. */
const paintRanges = (g: Ctx, tod: TimeOfDay) => {
  const H = HZ_TOP + 80, hz = skyTint('#B4E0F0', 0.9, tod);
  const L = (base: string, k: number) => ({ body: hazeOf(base, k, tod), lit: hazeOf(mix(base, '#D8ECF4', 0.26), k, tod), hi: hazeOf(mix(base, '#FFFFFF', 0.42), k, tod), shade: hazeOf(mix(base, '#0A1420', 0.18), k, tod), deep: hazeOf(mix(base, '#0A1420', 0.3), k, tod) });
  // (the high peaks)
  range(g, TW, backY, H, L('#5A7A9A', 0.5), 3, { gullies: 26, d: 16 });
  mist(g, TW, HZ_TOP - 120, 200, hz, 0.02, 0.55, 6);
  // (a lens of cloud caught on the highest)
  let px = 0, best = 1e9;
  for (let x = 40; x < TW - 40; x += 4) if (backY(x) < best) { best = backY(x); px = x; }
  const cl = [cloudTint(mix('#C8D4E4', '#B4C8DC', 0.3), tod), cloudTint('#E8EEF6', tod), cloudTint('#FFFFFF', tod)];
  pixelBlob(g, px + 4, best + 12, 52, 7, cl[0]); pixelBlob(g, px, best + 9, 44, 5, cl[1]); pixelBlob(g, px - 10, best + 7, 22, 3, cl[2]);
  // (MOUNT KABOOMA, the dino park's volcano, off past the trees, steaming)
  const KC = '#6A5A4E', kk = 0.38;
  kabooma(g, KAB_X, HZ_TOP + 10, 190, 128, {
    body: hazeOf(KC, kk, tod), lit: hazeOf(mix(KC, '#E8D4B4', 0.25), kk, tod), hi: hazeOf(mix(KC, '#FFF0D8', 0.4), kk, tod), shade: hazeOf(mix(KC, '#140C08', 0.2), kk, tod), deep: hazeOf(mix(KC, '#140C08', 0.36), kk, tod),
    lava: hazeOf('#E0581A', 0.25, tod), lavaHi: '#FFB040', steam: [cloudTint('#B8C0CC', tod), cloudTint('#DCE2EA', tod), cloudTint('#F6F8FC', tod)].map(c => mix(c, hz, 0.3)),
  }, tod.lamps);
  // (the jungle mountains, nearer: greener, forest up their slopes; the falls)
  const F = L('#3E6E5E', 0.32);
  range(g, TW, frontY, H, F, 17, { gullies: 18, d: 18, forest: [hazeOf('#2A5A3A', 0.3, tod), hazeOf('#447A48', 0.3, tod)], forestY: x => frontY(x) + 26 + wave(x, TW, 8.3, 2) * 10 });
  const top = frontY(FALLS_X) + 6;
  falls(g, FALLS_X, top, HZ_TOP + 6, 6, { rock: F.deep, water: hazeOf('#B8DCE8', 0.3, tod), lit: hazeOf('#F0FAFF', 0.25, tod), spray: hazeOf('#DCEEF4', 0.25, tod) });
  mist(g, TW, HZ_TOP - 70, 150, hz, 0.0, 0.5, 6);
};

/** A canopy ridge (tile space, its top `y0` down from the tile's top): crowns along it in the ridge's ramp, palms up
 *  off it here and there (`palms` of them), hazed at the foot. */
const paintRidge = (g: Ctx, tod: TimeOfDay, H: number, y0: number, amp: number, r: number, k: number, seed: number, palms: number) => {
  const R = ['#163E26', '#24583A', '#3A7A44', '#5E9E56'].map(c => hazeOf(c, k, tod));
  const yAt = (x: number) => y0 + wave(x, TW, seed, 2) * amp;
  // (the palms first: their feet down in the crowns)
  for (let i = 0; i < palms; i++) {
    const x = snap2(((i + 0.3 + hash(seed + i) * 0.4) * TW) / palms), h = 70 + hash(seed + i * 2.3) * 50;
    wrapAt(TW, x, xx => palm(g, xx, yAt(xx) + r, h, (hash(seed + i * 5.1) - 0.5) * 20, [hazeOf('#3A2C1E', k, tod), hazeOf('#6A5438', k, tod)], [R[0], R[1], R[3]], seed + i), 80);
  }
  canopy(g, TW, yAt, H, R, r, seed);
  banded(g, TW, y0 + r * 3, r * 2, [mix(R[0], skyTint('#B4E0F0', 0.9, tod), k * 0.25)], H);
  mist(g, TW, y0 - amp, r * 4 + amp, skyTint('#B4E0F0', 0.9, tod), 0.0, 0.18 + k * 0.3, 4);
};

/** The park between the far ranges and the canopy (tile space, y 0 is PARK_TOP over the horizon, its feet down behind
 *  the first canopy ridge): the other lands on the horizon (the World Showcase's castle on its hill, the Great Pixie's
 *  castle, SPACE NEEDLE 2 and the GIANT ATOM: parkFar.ts), then Jungle Land's own ahead of the river, nearer: the Temple
 *  of the Jaguar and its show building, the dino park's water tower and the monorail's beam (its train's live). */
const PARK_TOP = 220, PARK_H = 240, PARK_FOOT = 214, MONO_A = 650, MONO_B = 1016, MONO_Y = 150;
const paintPark = (g: Ctx, tod: TimeOfDay) => {
  farMark(g, 'fairyCastle', 196, PARK_FOOT - 26, 96, 0.52, tod);
  farMark(g, 'needle', 548, PARK_FOOT - 30, 88, 0.54, tod);
  farMark(g, 'atom', 612, PARK_FOOT - 34, 56, 0.54, tod);
  const T = (c: string) => hazeOf(c, 0.36, tod);
  farTemple(g, 372, PARK_FOOT, 190, T, tod.lamps);
  farMonorailBeam(g, MONO_A, MONO_B, MONO_Y, PARK_FOOT, T, 120);
  farWaterTower(g, 900, PARK_FOOT - 8, T, tod.lamps);
  mist(g, TW, PARK_FOOT - 90, 90, skyTint('#B4E0F0', 0.9, tod), 0.0, 0.4, 5);
};

/** A tile slid along at `k` of the camera's pace; under it (if it doesn't reach), its bottom color on down. */
const layer = (c: Ctx, key: string, scroll: number, k: number, y: number, h: number, paint: (g: Ctx) => void, under?: string) => {
  let x = -((((scroll * k) % TW) + TW) % TW);
  const tx = x;
  for (; x < CANVAS_WIDTH; x += TW) { c.save(); c.translate(Math.round(x), Math.round(y)); stamp(c, key, 0, 0, TW, h, paint); c.restore(); }
  if (under && y + h < CANVAS_HEIGHT) box(c, 0, Math.round(y + h), CANVAS_WIDTH, CANVAS_HEIGHT - Math.round(y + h), under);
  return tx;
};

/**
 * The sky and the jungle going back from the river (screen space): the hour's sky, the far ranges (the high peaks, MOUNT
 * KABOOMA steaming, the jungle mountains with a falls down one, its water cycling), the canopy in two ridges each
 * nearer, darker and bumpier (palms up off them), mist between. `horizon`: the screen y the land meets the sky;
 * `scroll`: the camera's x.
 */
export const drawJungleBackdrop = (c: Ctx, state: GameState, horizon: number, scroll: number, f: number) => {
  const tod = timeOfDay(), W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
  drawTodSky(c, 0, 0, W, H, ['#3AA0E0', '#6EC0EE', '#A6DCF4', '#D6EFD0', '#C8E6A0'], { sun: [620, horizon - 300], moon: [470, horizon - 280], horizon, t: f, scroll: scroll * 0.03 });
  // The far ranges (and the falls down the near one: its water cycling down, live)
  const tx = layer(c, `jc-rng-${tod.key}`, scroll, 0.05, horizon - HZ_TOP, HZ_TOP + 80, g => paintRanges(g, tod));
  {
    const top = frontY(FALLS_X) + 6 - HZ_TOP + horizon, wc = farTint('#E8F8FF', 1);
    for (let x = tx + FALLS_X; x < W + 20; x += TW) {
      if (x < -20) continue;
      for (let y = top; y < horizon + 4; y += 2) { const k = ((y - (f >> 1)) >> 2) % 4; if (k === 0) box(c, x - 3 + (((y >> 3) & 1) << 1), y, 2, 2, wc); }
    }
  }
  // The park between (the other lands, the temple, the dino park), the monorail going by on its beam (live)
  const pk = layer(c, `jc-park-${tod.key}`, scroll, 0.085, horizon - PARK_TOP, PARK_H, g => paintPark(g, tod));
  {
    const span = MONO_B - MONO_A, T = (col: string) => hazeOf(col, 0.36, tod), y = horizon - PARK_TOP + MONO_Y;
    for (let x = pk; x < W; x += TW) {
      const a = x + MONO_A, b = x + MONO_B;
      if (b < 0 || a > W) continue;
      c.save(); c.beginPath(); c.rect(a, y - 20, span, 20); c.clip();
      drawMonorail(c, a + ((f * 0.5) % (span + 160)), y, T, tod.lamps);
      c.restore();
    }
  }
  drawBirds(c, f, W * 0.5, horizon - 150, W * 0.45, 4, hazeOf('#1F2937', 0.3, tod));
  // The canopy: two ridges, each nearer, darker, bumpier, quicker; palms up off them
  layer(c, `jc-r1-${tod.key}`, scroll, 0.12, horizon - 200, 360, g => paintRidge(g, tod, 360, 150, 14, 14, 0.4, 2.1, 6));
  layer(c, `jc-r2-${tod.key}`, scroll, 0.22, horizon - 150, 360, g => paintRidge(g, tod, 360, 176, 18, 22, 0.2, 4.7, 5), hazeOf('#163E26', 0.2, tod));
};
