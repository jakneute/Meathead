// The town's backdrop (screen space): the gloomy sky by the hour (banded; the moon and stars after dark), a low cloud
// bank drifting, the crags at the edge of the world (Dracula's first castle on the highest), the hills (dead trees, the
// graveyard, the ruined abbey, a gallows), the ELEVATOR TO HELL's clock tower far off behind the town (growing as he
// goes: small behind the rooftops at the gate, huge by the castle stairs, its spire off the top of the screen; all of
// it from how far along he is, never a jump), the far side of town in its fog, and the town's skyline nearer (gables,
// mansards, turrets, a church, chimneys; windows lit after dark, more the darker it gets). Farther back: paler, bluer,
// flatter. Each far layer's a tile painted once for the hour (a stamp) and slid along; only the tower's drawn live.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky, timeOfDay, hourMix, farTint, skyAt, cloudTint, type TimeOfDay } from '../../timeOfDay';
import { SECTIONS } from '../geometry';
import { STAIRS } from './layout';
import { type Ctx, INK, box, mix, hash, poly, stamp, checker, hazeBands, pixelBlob } from './paint';
import { signText, candle, blood } from '../letters';

const { x0 } = SECTIONS.town;
const TW = 1024;

const SKY = ['#34304E', '#423C5E', '#544A6C', '#685A78', '#7E6C82', '#94808A'];
/** The ELEVATOR TO HELL's ride: up the tower slow, a hold at the top, then the drop (frames). */
const RIDE_UP = 420, RIDE_HOLD = 90, RIDE_DROP = 22, RIDE_REST = 120;

/** A tile, slid along with the camera at `k` of its speed, repeated across the screen. */
const tile = (c: Ctx, key: string, camX: number, k: number, y: number, h: number, paint: (g: Ctx) => void) => {
  let x = -((((camX * k) % TW) + TW) % TW);
  for (; x < CANVAS_WIDTH; x += TW) { c.save(); c.translate(Math.round(x), Math.round(y)); stamp(c, key, 0, 0, TW, h, paint); c.restore(); }
};
/** Something painted at tile x, and again a tile either side (so what's cut off one edge carries on at the other). */
const wrap = (x: number, draw: (x: number) => void) => { draw(x); if (x < 260) draw(x + TW); if (x > TW - 260) draw(x - TW); };

const hazeOf = (col: string, k: number, tod: TimeOfDay) => mix(farTint(col, 1, tod), skyAt(0.85, tod), k);

/** The cloud bank: long flat-bottomed clouds in three steps, lit along their tops. */
const paintClouds = (g: Ctx, tod: TimeOfDay) => {
  const body = cloudTint('#6A5A7E', tod), lit = cloudTint('#8A7896', tod), dk = cloudTint('#4E4262', tod);
  for (let i = 0; i < 7; i++) wrap(i * (TW / 7) + hash(i * 3.1) * 60, x => {
    const y = 40 + hash(i * 1.7) * 60, w = 140 + hash(i * 2.3) * 120;
    pixelBlob(g, x, y + 10, w * 0.5, 10, dk);
    pixelBlob(g, x - w * 0.1, y + 4, w * 0.4, 10, body);
    pixelBlob(g, x - w * 0.18, y, w * 0.24, 7, lit);
    box(g, x - w * 0.5, y + 14, w, 4, dk);
  });
};

/** A wave round the tile (whole cycles across it, so the tile's ends meet): -1..1. */
const wave = (x: number, seed: number) => {
  const a = (x / TW) * Math.PI * 2;
  return Math.sin(a * 3 + seed) * 0.5 + Math.sin(a * 7 + seed * 2.3) * 0.3 + Math.sin(a * 17 + seed * 4.1) * 0.2;
};
/** A jag (the same at the tile's ends): -0.5..0.5, in steps of `step` px. */
const jag = (x: number, step: number, seed: number) => hash(Math.floor((((x % TW) + TW) % TW) / step) + seed) - 0.5;
/** A ridge line's height at x, snapped to the art's 2 px grid. */
const snap2 = (v: number) => Math.round(v / 2) * 2;
/** Fills under a ridge line (sampled every `step` px) down to `bottom`. */
const fillUnder = (g: Ctx, yAt: (x: number) => number, bottom: number, col: string, step = 4) => {
  g.fillStyle = col; g.beginPath(); g.moveTo(0, bottom);
  for (let x = 0; x <= TW; x += step) { g.lineTo(x, yAt(x)); g.lineTo(x + step, yAt(x)); }
  g.lineTo(TW, bottom); g.closePath(); g.fill();
};
/** A ridge's flanks: the ones facing the light (up to the right: the upper left lit) a band of `lit` under the line and a
 *  row of dither under that; the ones facing away a deeper band of `shade`. */
const flanks = (g: Ctx, yAt: (x: number) => number, lit: string, shade: string, d: number, step = 4) => {
  for (let x = 0; x < TW; x += step) {
    const y = yAt(x), yn = yAt(x + step);
    if (yn < y) { box(g, x, y, step, d * 0.5, lit); checker(g, x, y + d * 0.5, step, 2, lit); }
    else if (yn > y) { box(g, x, y + 2, step, d, shade); checker(g, x, y + 2 + d, step, 2, shade, 1); }
  }
};
/** A line of pixels from (x, y) at angle a (up is up), `w` thick; where it ends. */
const stroke = (g: Ctx, x: number, y: number, a: number, len: number, w: number, col: string): [number, number] => {
  for (let t = 0; t < len; t++) box(g, Math.round(x + Math.cos(a) * t), Math.round(y - Math.sin(a) * t), w, w, col);
  return [x + Math.cos(a) * len, y - Math.sin(a) * len];
};
/** A dead tree: a crooked trunk forking into crooked limbs, three times over, the twigs a pixel thick. */
const deadTree = (g: Ctx, x: number, y: number, h: number, col: string, seed: number, w = 2) => {
  const limb = (lx: number, ly: number, a: number, len: number, lw: number, depth: number) => {
    const [ex, ey] = stroke(g, lx, ly, a, len, lw, col);
    if (depth <= 0 || len < 3) return;
    for (let k = 0; k < 2; k++) {
      const da = (k ? 1 : -1) * (0.3 + hash(seed + depth * 7.3 + k * 3.1) * 0.55);
      limb(ex, ey, a + da, len * (0.5 + hash(seed + depth * 1.9 + k * 5.7) * 0.25), Math.max(1, lw - 1), depth - 1);
    }
  };
  limb(x, y, Math.PI / 2 + (hash(seed * 1.3) - 0.5) * 0.35, h * 0.42, w, 3);
};
/** Haze over what's painted (none on the clear sky round it): in bands, dithered between. */
const mist = (g: Ctx, y: number, h: number, col: string, a0: number, a1: number, n: number) => {
  g.save(); g.globalCompositeOperation = 'source-atop'; hazeBands(g, 0, y, TW, h, col, a0, a1, n); g.restore();
};
/** A cone (a turret's roof, a spire): stepped across in `cols` (lit at the left), from (cx, base) up to `top`. */
const cone = (g: Ctx, cx: number, base: number, top: number, half: number, cols: string[]) => {
  const n = cols.length;
  for (let i = 0; i < n; i++) {
    const a = -half + (2 * half * i) / n, b = -half + (2 * half * (i + 1)) / n;
    poly(g, [[cx + a, base], [cx + a * 0.08, top], [cx + b * 0.08, top], [cx + b, base]], cols[i]);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The far layers, farthest first: the crags at the edge of the world (the old castle on the highest), the hills (dead
// trees, the graveyard, the ruined abbey, a gallows), the far side of town, the skyline. Farther: paler, bluer, flatter.

/** The crags: a range at the edge of the world, palest of all; Dracula's FIRST castle on the highest of them (the one
 *  in town's his other one), its windows lit after dark, a few. */
const paintCrags = (g: Ctx, tod: TimeOfDay) => {
  const H = 280, K = 0.62;
  const base = hourMix('#4A4068', '#503C5A', '#231B38', tod);
  const T = (col: string) => hazeOf(col, K, tod);
  const body = T(base), lit = T(mix(base, '#B4A8D4', 0.2)), lit2 = T(mix(base, '#D0C4EC', 0.32)), dk = T(mix(base, '#0A0614', 0.16)), dk2 = T(mix(base, '#0A0614', 0.3));
  const yAt = (x: number) => snap2(124 + wave(x, 1.3) * 36 + jag(x, 8, 11) * 8);
  fillUnder(g, yAt, H, body);
  flanks(g, yAt, lit, dk, 18);
  // (the rock's seams: streaks down from the peaks, the snowless gullies)
  for (let i = 0; i < 26; i++) {
    const x = snap2(i * (TW / 26) + hash(i * 3.7) * 30), y = yAt(x);
    box(g, x, y + 6, 2, 10 + hash(i) * 16, dk2); box(g, x - 2, y + 14 + hash(i * 2) * 8, 2, 6, dk);
  }
  // (bare trees along the tops, a pixel thick)
  for (let i = 0; i < 40; i++) { const x = snap2(i * (TW / 40) + hash(i * 5.1) * 18); deadTree(g, x, yAt(x) + 1, 8 + hash(i * 1.7) * 6, dk, 300 + i, 1); }
  // The old castle on the highest crag
  let cx = 200, best = 1e9;
  for (let x = 140; x < TW - 140; x += 4) if (yAt(x) < best) { best = yAt(x); cx = x; }
  const y = best + 4, W = dk, L = lit2, D = dk2;
  const win = mix(hourMix('#3A3456', '#8A5A2A', '#C8923C', tod), body, 0.35), on = tod.lamps > 0.25;
  const crenels = (x: number, top: number, w: number, col: string) => { for (let k = 0; k < w; k += 6) box(g, x + k, top - 4, 4, 4, col); };
  // (the curtain wall down the crag, its crenels)
  box(g, cx - 54, y - 16, 108, 22, W); box(g, cx - 54, y - 16, 2, 22, L); crenels(cx - 54, y - 16, 108, W);
  // (the towers: round, their roofs candle-snuffers, the keep's spire tallest)
  const tower = (tx: number, tw: number, th: number, roof: number) => {
    box(g, tx, y - th, tw, th, W); box(g, tx, y - th, 2, th, L); box(g, tx + tw - 2, y - th, 2, th, D);
    cone(g, tx + tw / 2, y - th, y - th - roof, tw / 2 + 3, [L, W, W, D]);
    box(g, tx + tw / 2 - 1, y - th - roof - 4, 2, 4, D);
    for (let k = 0; k < 2; k++) box(g, tx + tw / 2 - 1, y - th + 8 + k * 12, 2, 4, on && hash(tx + k) > 0.4 ? win : D);
  };
  tower(cx - 48, 12, 34, 16); tower(cx + 32, 14, 40, 20);
  box(g, cx - 18, y - 46, 36, 46, W); box(g, cx - 18, y - 46, 2, 46, L); box(g, cx + 14, y - 46, 4, 46, D); crenels(cx - 18, y - 46, 36, W);
  for (let k = 0; k < 3; k++) box(g, cx - 10 + k * 8, y - 36, 2, 6, on && k !== 1 ? win : D);
  tower(cx - 6, 12, 54, 20);
  // (the mist the range stands in, thicker going down)
  mist(g, 120, H - 120, skyAt(0.95, tod), 0.05, 0.55, 6);
};

/** The hills: two rows rolling (the far one paler), dead trees crooked against the sky; on one, the graveyard (its
 *  stones, its crosses, the mausoleum, an iron fence round it); on another the ruined abbey; a gallows on a knoll. */
const paintHills = (g: Ctx, tod: TimeOfDay) => {
  const H = 220;
  const hz = (col: string, k: number) => hazeOf(col, k, tod);
  const bD = hourMix('#3A3052', '#3A2A44', '#1A1428', tod), fD = hourMix('#2E2442', '#2E1F38', '#140E22', tod);
  const back = hz(bD, 0.45), backL = hz(mix(bD, '#9A90C0', 0.14), 0.45), backD = hz(mix(bD, '#05030A', 0.18), 0.45);
  const body = hz(fD, 0.3), rim = hz(mix(fD, '#9A90C0', 0.16), 0.3), shade = hz(mix(fD, '#05030A', 0.22), 0.3), deep = hz(mix(fD, '#05030A', 0.36), 0.3);
  const sil = hz(mix(fD, '#05030A', 0.3), 0.26), silL = hz(mix(fD, '#9A90C0', 0.1), 0.26);
  // The far row
  const backY = (x: number) => snap2(92 + wave(x, 4.2) * 18 + jag(x, 12, 5) * 4);
  fillUnder(g, backY, H, back);
  flanks(g, backY, backL, backD, 14);
  for (let i = 0; i < 18; i++) { const x = snap2(i * (TW / 18) + hash(i * 7.7) * 30); deadTree(g, x, backY(x) + 1, 12 + hash(i * 1.3) * 8, backD, 500 + i, 1); }
  mist(g, 100, 60, skyAt(0.92, tod), 0.0, 0.3, 4);
  // The near row: rolling, the hollows between in shade, banded darker going down
  const frontY = (x: number) => snap2(140 + wave(x, 7.7) * 22 + jag(x, 16, 9) * 3);
  fillUnder(g, frontY, H, body);
  flanks(g, frontY, rim, shade, 16);
  box(g, 0, 186, TW, H - 186, shade); checker(g, 0, 182, TW, 4, shade);
  box(g, 0, 204, TW, H - 204, deep); checker(g, 0, 200, TW, 4, deep, 1);
  // (dead trees, crooked, black against the sky)
  for (let i = 0; i < 9; i++) {
    const x = snap2(i * (TW / 9) + hash(i * 9.3) * 60);
    if (Math.abs(x - 300) < 90 || Math.abs(x - 640) < 60) continue;
    wrap(x, xx => deadTree(g, xx, frontY(xx) + 2, 26 + hash(i * 1.1) * 18, sil, 700 + i, 2));
  }
  // The graveyard: its stones up the hill, crosses, the mausoleum, an iron fence round the lot
  for (let k = 0; k < 16; k++) {
    const sx = snap2(232 + k * 9 + hash(k * 2.3) * 4), sy = frontY(sx) + 2 + Math.round(hash(k * 4.1) * 6), t = hash(k * 6.7);
    if (t < 0.45) { box(g, sx, sy - 6, 4, 6, sil); box(g, sx + 1, sy - 7, 2, 1, sil); box(g, sx, sy - 6, 1, 5, silL); }
    else if (t < 0.75) { box(g, sx + 1, sy - 9, 2, 9, sil); box(g, sx - 1, sy - 7, 6, 2, sil); }
    else { box(g, sx, sy - 4, 6, 4, sil); box(g, sx + 2, sy - 10, 2, 6, sil); box(g, sx + 1, sy - 12, 4, 2, sil); }
  }
  {
    const mx = 300, my = frontY(300) + 4;
    box(g, mx - 14, my - 18, 28, 18, sil); box(g, mx - 14, my - 18, 2, 18, silL);
    poly(g, [[mx - 17, my - 18], [mx, my - 28], [mx + 17, my - 18]], sil);
    for (let k = 0; k < 3; k++) box(g, mx - 10 + k * 8, my - 16, 2, 14, silL);
    box(g, mx - 3, my - 12, 6, 12, deep); box(g, mx - 1, my - 36, 2, 9, sil); box(g, mx - 4, my - 33, 8, 2, sil);
  }
  for (let fx = 222; fx < 384; fx += 4) { const fy = frontY(fx) + 8; box(g, fx, fy - 8, 1, 8, sil); if (fx % 8 === 0) box(g, fx, fy - 9, 1, 1, sil); box(g, fx, fy - 6, 4, 1, sil); }
  // The ruined abbey: a gable end standing, its tracery long gone, the nave's arches open to the sky, a tower's stump
  {
    const ax = 640, ay = frontY(640) + 4;
    box(g, ax - 30, ay - 30, 60, 30, sil); box(g, ax - 30, ay - 30, 2, 30, silL);
    for (let k = 0; k < 3; k++) { const wx = ax - 24 + k * 18; box(g, wx, ay - 24, 8, 16, back); box(g, wx + 2, ay - 28, 4, 4, back); box(g, wx + 3, ay - 30, 2, 2, back); }
    // (the broken top, stepped down)
    for (let k = 0; k < 6; k++) box(g, ax - 30 + k * 10, ay - 30 - (k < 3 ? 6 - k * 2 : 0) - (k % 2 ? 2 : 0), 10, 6 - (k < 3 ? 0 : 4), sil);
    box(g, ax + 18, ay - 62, 20, 62, sil); box(g, ax + 18, ay - 62, 2, 62, silL);
    box(g, ax + 25, ay - 52, 6, 14, back); box(g, ax + 26, ay - 55, 4, 3, back);
    for (let k = 0; k < 4; k++) box(g, ax + 18 + k * 5, ay - 64 - (k % 2) * 4, 4, 4, sil);
    box(g, ax - 44, ay - 6, 14, 6, sil); box(g, ax - 40, ay - 10, 6, 4, sil);
  }
  // A gallows on a knoll, the noose empty
  wrap(880, gx => {
    const gy = frontY(gx) + 2;
    box(g, gx, gy - 34, 3, 34, sil); box(g, gx, gy - 34, 22, 3, sil); stroke(g, gx + 3, gy - 22, Math.PI / 4, 10, 2, sil);
    box(g, gx + 19, gy - 31, 1, 10, sil); box(g, gx + 17, gy - 21, 5, 5, sil); box(g, gx + 18, gy - 20, 3, 3, body);
  });
  mist(g, 150, 70, skyAt(0.95, tod), 0.0, 0.3, 4);
};

/** The far side of town: little roofs, steep and close, a church or two, smoke-stained chimneys; their windows pinpricks
 *  of lamplight after dark; the fog in the streets between. */
const paintFarTown = (g: Ctx, tod: TimeOfDay) => {
  const H = 170, G = 150;
  const hz = (col: string) => hazeOf(col, 0.26, tod);
  const base = hourMix('#3A3454', '#3E2E48', '#16101E', tod);
  const body = hz(base), lit = hz(mix(base, '#A89CC8', 0.18)), dk = hz(mix(base, '#05030A', 0.2)), roof = hz(mix(base, '#05030A', 0.28)), roofL = hz(mix(base, '#A89CC8', 0.1));
  const win = mix(hourMix('#3A3456', '#8A5A2A', '#D09A44', tod), body, 0.15), pane = hz(mix(base, '#05030A', 0.35));
  const on = (n: number) => tod.lamps > 0.1 && hash(n) > 0.9 - 0.35 * tod.lamps;
  let x = 0, i = 0;
  const draw: (() => void)[] = [];
  while (x < TW) {
    const w = 26 + Math.round(hash(i * 2.1) * 20) * 2, h = 34 + Math.round(hash(i * 3.3) * 20) * 2, top = G - h, kind = hash(i * 5.9), xx = x, ii = i;
    const one = (bx: number) => {
      box(g, bx, top, w, H - top, body); box(g, bx, top, 2, H - top, lit); box(g, bx + w - 4, top, 4, H - top, dk); checker(g, bx + w - 6, top, 2, H - top, dk);
      if (kind < 0.55) {
        const gh = Math.min(28, Math.round(w * 0.7));
        poly(g, [[bx - 2, top + 1], [bx + w / 2, top - gh], [bx + w + 2, top + 1]], roof);
        poly(g, [[bx - 2, top + 1], [bx + w / 2, top - gh], [bx + w / 2, top - gh + 4], [bx + 1, top + 1]], roofL);
        box(g, bx + w / 2 - 1, top - gh - 4, 2, 4, dk);
      } else if (kind < 0.8) {
        poly(g, [[bx - 2, top + 1], [bx + 4, top - 12], [bx + w - 4, top - 12], [bx + w + 2, top + 1]], roof);
        for (let d = bx + 6; d < bx + w - 8; d += 12) { box(g, d, top - 9, 6, 8, body); box(g, d + 2, top - 7, 2, 4, on(d * 1.3 + 7) ? win : pane); }
      } else {
        const sx = bx + w / 2, sh = Math.min(top - 6, 56);
        box(g, sx - 6, top - 16, 12, 16, body); box(g, sx - 6, top - 16, 2, 16, lit); box(g, sx - 2, top - 12, 4, 6, pane);
        cone(g, sx, top - 16, top - sh, 8, [roofL, roof, roof, dk]);
        box(g, sx - 1, top - sh - 6, 2, 6, dk); box(g, sx - 3, top - sh - 4, 6, 2, dk);
      }
      if (hash(ii * 4.7) > 0.45) { const cx = bx + Math.round(w * 0.7); box(g, cx, top - 14, 6, 14, dk); box(g, cx - 1, top - 16, 8, 2, roof); }
      for (let wy = top + 8; wy < G - 4; wy += 14) for (let wx = bx + 6; wx < bx + w - 8; wx += 8) box(g, wx, wy, 2, 4, on(wx * 0.37 + wy * 0.91 + ii) ? win : pane);
    };
    draw.push(() => { one(xx); if (xx + w > TW) one(xx - TW); });
    x += w + (hash(i * 6.1) > 0.7 ? 10 : -2);
    i++;
  }
  for (const d of draw) d();
  // (the fog lying in the streets, thicker down low)
  mist(g, G - 50, H - G + 50, skyAt(0.95, tod), 0.0, 0.5, 5);
};

/** The town's skyline (nearer): houses shoulder to shoulder, each in its own stucco's ramp (lit at the upper left, the
 *  shade dithered in at the right, a cornice at every floor); steep gables with slate coursed across, an attic
 *  oculus, a finial; mansards with dormers; a church spire and its belfry; round turrets under candle-snuffer roofs;
 *  a widow's walk railed in iron; chimneys and their pots; pointed windows (shuttered, some), the sky in their panes by
 *  day, lamplit after dark (more of them the darker it gets), the lit ones glowing out a step; dead trees and an iron
 *  fence in the gaps; the fog along the bottom. Nothing on it lit along a top: none of it's to stand on. */
const paintSkyline = (g: Ctx, tod: TimeOfDay) => {
  const H = 360, G = 280;
  const ramp = (hex: string, k = 0.18) => {
    const b = hazeOf(hourMix(mix(hex, '#4A3E66', 0.2), mix(hex, '#4E3450', 0.22), mix(hex, '#0A0614', 0.3), tod), k, tod);
    return [mix(b, '#05030A', 0.5), mix(b, '#05030A', 0.28), b, mix(b, '#B8B0D8', 0.12), mix(b, '#D0C8F0', 0.24)];
  };
  const HUES = ['#3A3352', '#3E3048', '#33364E', '#44364A', '#383048'].map(h => ramp(h));
  const SL = ramp('#262236'), IRN = ramp('#14121C', 0.1);
  const win = hourMix('#4A4060', '#8A5A2A', '#C8923C', tod), winHi = mix(win, '#FFF0C0', 0.4);
  const pane = hourMix('#2A2238', '#2A1E2C', '#0E0A16', tod), glint = mix(pane, skyAt(0.4, tod), 0.4 * (1 - tod.lamps));
  const lamps = tod.lamps;
  const lit = (n: number) => lamps > 0.1 && hash(n) > 0.85 - 0.3 * lamps;
  /** A pointed window (6 x 12), framed; lamplit (a step of glow round it, a mullion and transom) or the sky in it. */
  const pointed = (wx: number, wy: number, on: boolean, R: string[], shutters: boolean) => {
    if (on) box(g, wx - 3, wy - 5, 12, 20, mix(R[2], win, 0.2));
    box(g, wx - 1, wy - 1, 8, 14, R[0]); box(g, wx, wy - 3, 6, 2, R[0]); box(g, wx + 1, wy - 4, 4, 1, R[0]);
    const p = on ? win : pane;
    box(g, wx, wy, 6, 12, p); box(g, wx + 1, wy - 2, 4, 2, p); box(g, wx + 2, wy - 3, 2, 1, p);
    if (on) { box(g, wx + 1, wy + 1, 2, 5, winHi); box(g, wx + 3, wy - 2, 1, 14, mix(win, R[0], 0.5)); box(g, wx, wy + 5, 6, 1, mix(win, R[0], 0.5)); }
    else { box(g, wx, wy - 1, 4, 3, glint); box(g, wx, wy + 2, 2, 2, glint); }
    box(g, wx - 1, wy + 12, 8, 2, R[3]);
    if (shutters) { box(g, wx - 4, wy, 3, 12, R[1]); box(g, wx + 7, wy, 3, 12, R[1]); }
  };
  /** Slate coursed across a roof's face: a darker line every 4 px. */
  const courses = (x0: number, y0: number, w: number, h: number) => { for (let y = y0 + 3; y < y0 + h; y += 4) box(g, x0, y, w, 1, SL[1]); };
  const house = (x: number, i: number) => {
    const R = HUES[i % HUES.length];
    const w = 70 + Math.round(hash(i * 2.7) * 35) * 2, h = 56 + Math.round(hash(i * 4.1) * 37) * 2, top = G - h, kind = hash(i * 6.3);
    // (the body: lit at its left, its shade dithered in at its right; a cornice at each floor; the foundation)
    box(g, x, top, w, H - top, R[2]);
    box(g, x, top, 6, H - top, R[3]); box(g, x, top, 2, H - top, R[4]); checker(g, x + 6, top, 2, H - top, R[3]);
    box(g, x + w - 10, top, 10, H - top, R[1]); checker(g, x + w - 12, top, 2, H - top, R[1]); box(g, x + w - 3, top, 3, H - top, R[0]);
    for (let fy = top + 34; fy < G; fy += 34) { box(g, x, fy, w, 2, R[0]); box(g, x, fy + 2, w, 1, R[3]); }
    box(g, x, G - 6, w, 6, R[1]); checker(g, x, G - 8, w, 2, R[1]);
    const mid = x + w / 2, church = kind >= 0.6 && kind < 0.72 && top > 170, turret = kind >= 0.6 && kind < 0.86 && !church;
    if (kind < 0.42) {
      // A steep gable: slate coursed, the bargeboard lit up its left slope, an oculus, a finial
      const gh = Math.min(Math.round(w * 0.85), 76, top - 18);
      poly(g, [[x - 5, top + 2], [mid, top - gh - 2], [x + w + 5, top + 2]], SL[0]);
      poly(g, [[x - 3, top + 1], [mid, top - gh], [x + w + 3, top + 1]], SL[2]);
      g.save(); g.beginPath(); g.moveTo(x - 3, top + 1); g.lineTo(mid, top - gh); g.lineTo(x + w + 3, top + 1); g.closePath(); g.clip();
      courses(x - 3, top - gh, w + 6, gh + 1); box(g, mid, top - gh, w / 2 + 4, gh + 1, SL[1]); checker(g, mid - 2, top - gh, 2, gh + 1, SL[1]);
      g.restore();
      for (let k = 0; k < gh; k += 2) box(g, x - 3 + (k / gh) * (w / 2 + 3), top - k, 3, 2, SL[4]);
      if (hash(i * 8.8) > 0.4) { const oy = top - gh * 0.42; box(g, mid - 6, oy - 6, 12, 12, SL[0]); box(g, mid - 4, oy - 4, 8, 8, lit(i * 3.3) ? win : pane); box(g, mid - 1, oy - 4, 2, 8, SL[0]); }
      box(g, mid - 1, top - gh - 12, 2, 12, SL[0]); box(g, mid - 3, top - gh - 14, 6, 3, SL[0]); box(g, mid - 1, top - gh - 17, 2, 3, SL[0]);
    } else if (kind < 0.6) {
      // A mansard: its steep slate sides, dormers with their pointed hoods
      poly(g, [[x - 3, top + 1], [x + 8, top - 30], [x + w - 8, top - 30], [x + w + 3, top + 1]], SL[2]);
      courses(x - 3, top - 30, w + 6, 31);
      poly(g, [[x - 3, top + 1], [x + 8, top - 30], [x + 12, top - 30], [x + 2, top + 1]], SL[4]);
      box(g, x + 8, top - 32, w - 16, 2, SL[0]);
      for (let d = x + 14; d < x + w - 22; d += 26) {
        box(g, d, top - 22, 14, 18, R[2]); box(g, d, top - 22, 2, 18, R[4]);
        poly(g, [[d - 2, top - 21], [d + 7, top - 31], [d + 16, top - 21]], SL[1]); poly(g, [[d - 2, top - 21], [d + 7, top - 31], [d + 7, top - 28], [d + 1, top - 21]], SL[4]);
        box(g, d + 4, top - 18, 6, 11, lit(d * 0.7) ? win : pane);
      }
    } else if (church) {
      // A church: its tower, the belfry's louvered lancet, the spire stepped across, a weathervane
      const sh = Math.min(150, top - 22);
      box(g, mid - 16, top - 52, 32, 52, R[2]); box(g, mid - 16, top - 52, 4, 52, R[4]); box(g, mid + 8, top - 52, 8, 52, R[1]);
      box(g, mid - 6, top - 44, 12, 22, R[0]); box(g, mid - 4, top - 48, 8, 4, R[0]); box(g, mid - 2, top - 50, 4, 2, R[0]);
      for (let k = 0; k < 4; k++) box(g, mid - 5, top - 42 + k * 5, 10, 2, R[1]);
      box(g, mid - 18, top - 54, 36, 4, R[0]); for (let k = 0; k < 4; k++) box(g, mid - 18 + k * 10, top - 58, 6, 4, R[1]);
      cone(g, mid, top - 54, top - sh, 15, [SL[4], SL[3], SL[2], SL[2], SL[1], SL[0]]);
      for (let k = 1; k < 4; k++) { const ly = top - 54 - k * (sh - 54) / 4.5, hw = 15 * (1 - k / 4.5); box(g, mid - hw, ly, hw * 2, 1, SL[0]); }
      box(g, mid - 1, top - sh - 16, 2, 16, SL[0]); box(g, mid - 6, top - sh - 12, 12, 2, SL[0]); box(g, mid - 2, top - sh - 18, 6, 3, SL[0]);
    } else if (kind < 0.86) {
      // A round turret at one corner (its walls in bands round it) under a candle-snuffer roof; a low hip on the rest
      poly(g, [[x - 3, top + 1], [x + 16, top - 22], [x + w - 16, top - 22], [x + w + 3, top + 1]], SL[2]);
      courses(x - 3, top - 22, w + 6, 23);
      const tw = 30, tx = x + w - tw + 4, tt = top - 40, th = Math.min(66, tt - 16);
      const bands = [R[4], R[3], R[2], R[2], R[1], R[0]];
      for (let k = 0; k < 6; k++) box(g, tx + k * 5, tt, 5, G - tt, bands[k]);
      box(g, tx - 2, tt - 4, tw + 4, 4, R[0]);
      cone(g, tx + tw / 2, tt - 4, tt - th, tw / 2 + 5, [SL[4], SL[3], SL[2], SL[1], SL[0]]);
      box(g, tx + tw / 2 - 1, tt - th - 10, 2, 10, SL[0]); box(g, tx + tw / 2 - 3, tt - th - 6, 6, 2, SL[0]);
      for (let wy = tt + 12; wy < G - 30; wy += 34) pointed(tx + 12, wy, lit(tx + wy * 1.7), R, false);
    } else {
      // A hipped roof with a widow's walk on top, railed in iron
      poly(g, [[x - 3, top + 1], [x + 22, top - 26], [x + w - 22, top - 26], [x + w + 3, top + 1]], SL[2]);
      courses(x - 3, top - 26, w + 6, 27);
      poly(g, [[x - 3, top + 1], [x + 22, top - 26], [x + 26, top - 26], [x + 2, top + 1]], SL[4]);
      box(g, x + 22, top - 36, w - 44, 1, IRN[1]); for (let r = x + 22; r <= x + w - 22; r += 4) box(g, r, top - 36, 1, 10, IRN[1]);
    }
    // (chimneys: brick-dark stacks lit at their left, their pots)
    if (hash(i * 3.9) > 0.3 && kind < 0.86) {
      const cx = Math.round(x + w * (0.62 + hash(i) * 0.14)), ch = 50 + Math.round(hash(i * 1.9) * 8) * 2;
      box(g, cx, top - ch, 12, ch, R[1]); box(g, cx, top - ch, 3, ch, R[3]); box(g, cx + 9, top - ch, 3, ch, R[0]);
      box(g, cx - 2, top - ch - 4, 16, 4, R[0]); box(g, cx + 2, top - ch - 10, 3, 6, R[0]); box(g, cx + 7, top - ch - 8, 3, 4, R[0]);
    }
    // (its windows: a row a floor, pointed; shuttered, some)
    const shut = hash(i * 7.1) > 0.6, right = turret ? x + w - 34 : x + w - 16;
    for (let wy = top + 12; wy < G - 16; wy += 34) for (let wx = x + 14; wx < right; wx += 20) pointed(wx, wy, lit(wx * 0.37 + wy * 0.91), R, shut);
    // (the front door, under a pointed hood)
    if (hash(i * 2.2) > 0.5) { box(g, mid - 7, G - 30, 14, 24, R[0]); box(g, mid - 5, G - 34, 10, 4, R[0]); box(g, mid - 3, G - 36, 6, 2, R[0]); }
    return w;
  };
  // The houses along, a gap now and then (a dead tree in it, an iron fence); the last carried round onto the start
  const row: { x: number; i: number; w: number }[] = [];
  let x = 0, i = 0;
  while (x < TW) {
    const w = 70 + Math.round(hash(i * 2.7) * 35) * 2;
    row.push({ x, i, w });
    x += w + (hash(i * 5.5) > 0.7 ? 18 + Math.round(hash(i) * 10) * 2 : -2);
    i++;
  }
  for (const r of row) {
    const gx = r.x + r.w, next = row.find(o => o.i === r.i + 1);
    if (next && next.x - gx > 12) {
      const t = gx + (next.x - gx) / 2;
      deadTree(g, t, G - 4, 60 + hash(r.i * 3.1) * 30, IRN[1], 900 + r.i, 3);
      for (let f = gx; f < next.x; f += 4) box(g, f, G - 20, 1, 16, IRN[1]);
      box(g, gx, G - 16, next.x - gx, 1, IRN[1]);
    }
  }
  for (const r of row) { house(r.x, r.i); if (r.x + r.w > TW) house(r.x - TW, r.i); }
  box(g, 0, G, TW, H - G, HUES[0][1]);
  checker(g, 0, G - 2, TW, 2, HUES[0][1]);
  // (the fog: in the street, drifting up the fronts)
  mist(g, G - 60, 100, skyAt(0.94, tod), 0.0, 0.3, 5);
  mist(g, 40, 140, skyAt(0.9, tod), 0.12, 0.0, 4);
};

// ---------------------------------------------------------------------------------------------------------------
// The ELEVATOR TO HELL: the clock tower, drawn live (it grows), every edge snapped to the screen's pixels

const drawTower = (c: Ctx, state: GameState, tx: number, base: number, ts: number) => {
  const tod = timeOfDay(), f = state.frame;
  const H = (d: string, s: string, n: string) => hourMix(d, s, n, tod);
  const body = H('#3A3058', '#3A2A48', '#1E1630'), lit = H('#544872', '#54405E', '#2E2448'), lit2 = H('#6A5E8A', '#6A5272', '#3B2F58');
  const dk = H('#2A2242', '#2A1E36', '#140E22'), dk2 = H('#1E1830', '#1E1428', '#0C0816');
  const S = (v: number) => v * ts;
  /** A box in the tower's own units, snapped. */
  const R = (x: number, y: number, w: number, h: number, col: string) => {
    const a = Math.round(tx + S(x)), b = Math.round(base + S(y)), e = Math.round(tx + S(x + w)), d = Math.round(base + S(y + h));
    if (e > a && d > b) { c.fillStyle = col; c.fillRect(a, b, e - a, d - b); }
  };
  const P = (pts: [number, number][], col: string) => poly(c, pts.map(([x, y]) => [Math.round(tx + S(x)), Math.round(base + S(y))] as [number, number]), col);
  const T = -430;
  // The shaft: inked, stepped across (lit at its left), coursed, quoins at its corners
  R(-52, T + 68, 104, -T - 68, INK);
  R(-50, T + 70, 100, -T - 70, body);
  R(-50, T + 70, 10, -T - 70, lit); R(-50, T + 70, 4, -T - 70, lit2);
  R(28, T + 70, 22, -T - 70, dk); R(42, T + 70, 8, -T - 70, dk2);
  for (let y = T + 84; y < 0; y += 16) { R(-40, y, 68, 1, dk); }
  for (let y = T + 76, k = 0; y < -6; y += 16, k++) { R(-50, y, k % 2 ? 10 : 16, 8, lit2); R(k % 2 ? 40 : 34, y, k % 2 ? 10 : 16, 8, dk); }
  // (slit windows up it: a lit one or two after dark)
  for (let k = 0; k < 4; k++) { const y = T + 230 + k * 50; R(-6, y, 12, 26, dk2); P([[-6, y], [0, y - 8], [6, y]], dk2); if (tod.lamps > 0.3 && k % 2) R(-4, y + 4, 8, 18, '#8A5A2A'); }
  // The belfry ledge, the roof: stepped slate, lit up its left; the spire, its finial
  R(-62, T + 58, 124, 14, INK); R(-60, T + 60, 120, 10, lit); R(-60, T + 60, 120, 3, lit2); R(-60, T + 67, 120, 3, dk);
  for (let i = 0; i < 6; i++) {
    const w = 88 - i * 14, y = T + 60 - (i + 1) * 10;
    R(-w / 2 - 1, y - 1, w + 2, 11, INK); R(-w / 2, y, w, 10, i % 2 ? body : dk); R(-w / 2, y, Math.max(2, w * 0.25), 10, lit); R(-w / 2, y, w, 2, lit2);
  }
  R(-3, T - 30, 6, 32, INK); R(-2, T - 28, 3, 30, lit); R(1, T - 28, 1, 30, dk);
  R(-8, T - 22, 16, 2, dk); R(-5, T - 36, 10, 6, INK); R(-4, T - 35, 8, 4, BRASS_DIM);
  // The clock: a dark frame, the face banded (lit at the top), the hours ticked, the hands going round (stepped)
  R(-30, T + 84, 60, 60, INK); R(-28, T + 86, 56, 56, '#1A1424'); R(-28, T + 86, 56, 2, lit);
  R(-24, T + 90, 48, 48, '#CDB878'); R(-24, T + 90, 48, 14, '#D9C98A'); R(-24, T + 90, 48, 5, '#E6D8A0'); R(-24, T + 130, 48, 8, '#B8A266');
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; R(Math.sin(a) * 19 - 1.5, T + 114 - Math.cos(a) * 19 - 1.5, 3, 3, '#3B2F58'); }
  const t = f * 0.002;
  const hand = (a: number, len: number, w: number) => { for (let s = 0; s <= len; s += 2) R(Math.sin(a) * s - w / 2, T + 114 - Math.cos(a) * s - w / 2, w, w, '#1E1036'); };
  hand(t, 18, 3); hand(t / 12, 12, 4);
  R(-2, T + 112, 4, 4, '#7F1D1D');
  // The ride's sign: a marquee bolted to the front of it, inside its width (clear of the track): devil horns on its top
  // corners, a border of bulbs chasing round it, TO HELL big under ELEVATOR (lit, dim: no glare)
  const glow = 0.6 + 0.4 * Math.max(tod.lamps, (Math.floor(f / 20) % 6 ? 1 : 0.4));
  const SL = -45, SR = 45, ST = T + 152, SB = T + 206;
  // (the horns)
  P([[SL + 2, ST + 1], [SL - 3, ST - 12], [SL + 11, ST + 1]], INK); P([[SL + 4, ST], [SL - 1, ST - 9], [SL + 9, ST]], '#B91C1C');
  P([[SR - 2, ST + 1], [SR + 3, ST - 12], [SR - 11, ST + 1]], INK); P([[SR - 4, ST], [SR + 1, ST - 9], [SR - 9, ST]], '#B91C1C');
  // (the board: inked, a dark frame, the red panel banded lit at its top, dark at its foot)
  R(SL - 2, ST - 2, SR - SL + 4, SB - ST + 4, INK);
  R(SL, ST, SR - SL, SB - ST, '#1A0606');
  R(SL + 4, ST + 4, SR - SL - 8, SB - ST - 8, mix('#3A0A0A', '#7F1D1D', glow));
  R(SL + 4, ST + 4, SR - SL - 8, 4, mix('#5A1010', '#B91C1C', glow));
  R(SL + 4, SB - 9, SR - SL - 8, 5, mix('#2A0606', '#5A1010', glow));
  // (the bulbs round it, chasing: every third lit)
  const chase = Math.floor(f / 6);
  let n = 0;
  const bulb = (x: number, y: number) => { const on = (n++ + chase) % 3 === 0; R(x - 1, y - 1, 2, 2, on ? mix('#C8A050', '#FDE68A', glow) : '#4A2A10'); };
  for (let x = SL + 2; x <= SR - 2; x += 6) bulb(x, ST + 2);
  for (let y = ST + 8; y <= SB - 2; y += 6) bulb(SR - 2, y);
  for (let x = SR - 8; x >= SL + 2; x -= 6) bulb(x, SB - 2);
  for (let y = SB - 8; y >= ST + 8; y -= 6) bulb(SL + 2, y);
  c.save(); c.translate(Math.round(tx), Math.round(base)); c.scale(ts, ts);
  // (ELEVATOR in candlelit gilt, TO HELL big, bleeding)
  signText(c, 'ELEVATOR', 0, T + 170, { ...candle(6, '#7F1D1D', mix('#C8A050', '#FDE68A', glow), false), shadow: INK });
  signText(c, 'TO HELL', 0, T + 190, { ...blood({ sx: 2, sy: 2 }, mix('#D8B0B0', '#FFF1F1', glow), INK, 3), drip: { col: mix('#B07070', '#F8C8C8', glow), rate: 0.35, len: 5 } });
  c.restore();
  // The track up its right side (its rungs), and the car: up slow, a moment at the top, then the drop
  R(50, T + 78, 10, -T - 78, INK); R(51, T + 80, 8, -T - 80, '#18121F'); R(51, T + 80, 2, -T - 80, '#2E2440');
  for (let y = T + 86; y < 0; y += 14) R(50, y, 10, 2, '#3F3550');
  const cyc = RIDE_UP + RIDE_HOLD + RIDE_DROP + RIDE_REST, kk = f % cyc;
  const lo = -30, hi = T + 90;
  const carY = kk < RIDE_UP ? lo - (lo - hi) * (kk / RIDE_UP) : kk < RIDE_UP + RIDE_HOLD ? hi : kk < RIDE_UP + RIDE_HOLD + RIDE_DROP ? hi + (lo - hi) * ((kk - RIDE_UP - RIDE_HOLD) / RIDE_DROP) ** 2 : lo;
  R(55, carY - 1, 24, 22, INK); R(56, carY, 22, 20, '#7F1D1D'); R(56, carY, 22, 3, '#B91C1C'); R(74, carY, 4, 20, '#4A0E0E');
  R(58, carY + 4, 18, 7, '#FDE68A'); R(58, carY + 4, 18, 2, '#FFF4C0');
  // (the dots of the riders' heads in its window)
  for (let i = 0; i < 3; i++) R(60 + i * 5, carY + 6, 3, 3, '#3F2A1A');
};
const BRASS_DIM = '#8A6A2A';

export const drawTownBackdrop = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), camX = state.camera.x - x0, up = Math.max(0, -state.camera.y);
  const oy = up * 0.12, horizon = 440 + oy, cx = camX + 100000;
  drawTodSky(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, SKY, { bands: 12, sun: [150, 120 + oy], moon: [150, 100 + oy], horizon, t: state.frame });
  // (the low cloud bank, drifting)
  tile(c, `tn-cloud-${tod.key}`, cx + state.frame * 6, 0.012, 100 + oy * 0.5, 160, g => paintClouds(g, tod));
  // The crags at the edge of the world (the old castle on them), the hills
  // (stood well up over the hills, so the old castle sits on a mountain, not on the hills' line)
  tile(c, `tn-crags-${tod.key}`, cx, 0.008, horizon - 350, 280, g => paintCrags(g, tod));
  tile(c, `tn-hills-${tod.key}`, cx, 0.02, horizon - 230, 220, g => paintHills(g, tod));
  // The ELEVATOR TO HELL: far off and small behind the rooftops at the gate, looming by the castle stairs
  const k = Math.max(0, Math.min(1, camX / (STAIRS.a0 - CANVAS_WIDTH / 2))), ke = k * k * (3 - 2 * k);
  const ts = 0.6 + 0.9 * ke;
  const tx = 620 - camX * (0.012 + 0.012 * k), base = horizon + 10 + ke * 110;
  drawTower(c, state, tx, base, ts);
  // The far side of town (the tower's foot sunk behind it), then the town's skyline, nearer
  tile(c, `tn-far-${tod.key}`, cx, 0.09, horizon - 160 + oy * 0.3, 170, g => paintFarTown(g, tod));
  tile(c, `tn-sky-${tod.key}`, cx, 0.2, horizon - 250 + oy * 0.6, 360, g => paintSkyline(g, tod));
};
