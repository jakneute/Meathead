// The jungle's backdrop (screen space): the sky through the gaps, the jungle going back in layers (far crowns in the
// haze, the temple's top poking out of them; a misty row of trunks; a nearer, darker row hung with lianas), mist
// lying between them, light coming down through it all in shafts (the sun's, gold as it gets low; the moon's, after
// dark), and the canopy over the top. Each layer's a tile painted once for the hour (a stamp) and slid along.

import type { GameState } from '../../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../../../../m1/constants';
import { timeOfDay, farTint, skyRamp, skyAt, drawStars, drawMoon, sunAt, type TimeOfDay } from '../../../timeOfDay';
import { noteSun } from '../../../sunFlare';
import { stamp, bandedGradient, hazeBands, steppedGlow, pixelBlob } from '../../../intro/art/kit';
import { type Ctx, INK, box, mix, hash, poly, clump, fern, bigLeaf, bark, LEAF, BARK } from './paint';

const TW = 1024;

/** A tile, slid along with the camera at `k` of its speed, repeated across the screen. */
const tile = (c: Ctx, key: string, camX: number, k: number, y: number, h: number, paint: (g: Ctx) => void) => {
  let x = -((((camX * k) % TW) + TW) % TW);
  for (; x < CANVAS_WIDTH; x += TW) { c.save(); c.translate(Math.round(x), Math.round(y)); stamp(c, key, 0, 0, TW, h, paint); c.restore(); }
};
/** Something painted at tile x, and again a tile either side (so what's cut off one edge carries on at the other). */
const wrap = (x: number, draw: (x: number) => void) => { draw(x); if (x < 200) draw(x + TW); if (x > TW - 200) draw(x - TW); };

/** How far the far scenery's moved down (the camera up a tree, up the cliff): the layer at `k` moves k of it. */
const lift = (state: GameState) => GROUND_Y - 500 - state.camera.y;

// The layers' own colors, by day; the hour's tint over them (farTint), and haze the further back.
const hazeOf = (col: string, k: number, tod: TimeOfDay) => mix(farTint(col, 1, tod), skyAt(0.85, tod), k);

/** The far jungle: crowns rolling away in the haze, giants standing up out of them, the temple's top. */
const paintFar = (g: Ctx, tod: TimeOfDay) => {
  const G = 560;
  const body = hazeOf('#2C5A3A', 0.5, tod), lit = hazeOf('#4F8A4E', 0.45, tod), dk = hazeOf('#20462E', 0.52, tod);
  // (the temple: a stepped pyramid, its shrine on top, vines down it)
  wrap(700, x => {
    const st = hazeOf('#6E6A58', 0.5, tod), sl = hazeOf('#8E8872', 0.45, tod), sd = hazeOf('#4A4A3E', 0.52, tod);
    for (let i = 0; i < 6; i++) { const w = 150 - i * 22, y = 300 - i * 18; box(g, x - w / 2, y, w, 18, st); box(g, x - w / 2, y, w, 3, sl); box(g, x + w / 2 - 10, y, 10, 18, sd); }
    box(g, x - 16, 170, 32, 24, st); box(g, x - 16, 170, 32, 3, sl); box(g, x - 6, 178, 12, 16, sd);
    box(g, x - 20, 166, 40, 5, sd);
    for (let i = 0; i < 5; i++) box(g, x - 50 + i * 24, 240 + hash(i) * 30, 3, 40 + hash(i * 2) * 40, body);
  });
  // (emergent giants: thin trunks, umbrella crowns)
  for (let i = 0; i < 4; i++) wrap(i * 256 + 90 + hash(i * 3.3) * 80, x => {
    const top = 180 + hash(i) * 50;
    box(g, x - 3, top, 6, G - top, dk); box(g, x - 3, top, 2, G - top, body);
    for (let k = -2; k <= 2; k++) pixelBlob(g, x + k * 22, top + Math.abs(k) * 4, 26, 13, k < 1 ? lit : body);
    pixelBlob(g, x - 8, top - 6, 22, 9, mix(lit, '#FFFFFF', 0.08));
  });
  // (the rolling crowns: two rows, the back one paler)
  for (const [row, y0, col, top] of [[0, 300, mix(body, skyAt(0.85, tod), 0.25), mix(lit, skyAt(0.85, tod), 0.25)], [1, 340, body, lit]] as [number, number, string, string][]) {
    for (let i = 0; i < 22; i++) wrap(i * (TW / 22) + hash(i + row * 50) * 20, x => {
      const y = y0 + hash(i * 1.7 + row) * 34, r = 30 + hash(i * 2.9 + row) * 18;
      pixelBlob(g, x, y + r * 0.4, r * 1.1, r * 0.9, col);
      pixelBlob(g, x - r * 0.2, y + r * 0.15, r * 0.7, r * 0.5, top);
    });
    box(g, 0, y0 + 40, TW, G + 140 - y0, col);
  }
  hazeBands(g, 0, 380, TW, 180, skyAt(0.9, tod), 0.0, 0.35, 5);
};

/** The middle distance: a misty row of trunks, their crowns up top, ferns at their feet. */
const paintMid = (g: Ctx, tod: TimeOfDay) => {
  const G = 560;
  const tr = BARK.map(c => hazeOf(c, 0.36, tod)), lf = LEAF.map(c => hazeOf(c, 0.34, tod));
  for (let i = 0; i < 14; i++) wrap(i * (TW / 14) + hash(i * 4.1) * 40, x => {
    const w = 12 + hash(i * 5.3) * 14;
    box(g, x, 60, w, G - 60, tr[3]); box(g, x, 60, w * 0.3, G - 60, tr[4]); box(g, x + w * 0.7, 60, w * 0.3, G - 60, tr[2]);
    box(g, x - 1, 60, 1, G - 60, tr[1]); box(g, x + w, 60, 1, G - 60, tr[1]);
    // (a liana down it)
    if (hash(i * 7.7) > 0.5) for (let y = 120; y < G; y += 6) box(g, x + w * 0.5 + Math.sin(y * 0.05 + i) * (w * 0.4), y, 3, 6, lf[2]);
    // (the foot of it, flaring)
    poly(g, [[x - w * 0.6, G], [x, G - w * 1.2], [x + w, G - w * 1.2], [x + w * 1.6, G]], tr[2]);
  });
  // (the crowns, a band of them along the top, lit underneath where the light comes through)
  for (let i = 0; i < 18; i++) wrap(i * (TW / 18) + hash(i * 9.1) * 30, x => { pixelBlob(g, x, 60 + hash(i) * 50, 50 + hash(i * 3) * 20, 34, lf[2]); pixelBlob(g, x - 10, 50 + hash(i) * 50, 30, 18, lf[3]); });
  box(g, 0, 0, TW, 60, lf[2]);
  // (undergrowth)
  for (let i = 0; i < 30; i++) wrap(i * (TW / 30) + hash(i * 2.2) * 20, x => pixelBlob(g, x, G - 10 + hash(i) * 8, 24 + hash(i * 4) * 14, 16, i % 3 ? lf[2] : lf[3]));
  box(g, 0, G, TW, 140, lf[1]);
  hazeBands(g, 0, G - 90, TW, 110, skyAt(0.9, tod), 0.0, 0.3, 5);
};

/** The near back: big trunks (bark, roots), lianas looping between them, moss hanging, big leaves at their feet. */
const paintNear = (g: Ctx, tod: TimeOfDay) => {
  const G = 560;
  const tr = BARK.map(c => hazeOf(c, 0.16, tod)), lf = LEAF.map(c => hazeOf(c, 0.14, tod));
  const xs: number[] = [];
  for (let i = 0; i < 6; i++) {
    const x = i * (TW / 6) + 20 + hash(i * 6.6) * 70, w = 30 + hash(i * 1.9) * 26;
    xs.push(x + w / 2);
    wrap(x, xx => {
      g.save(); g.beginPath(); g.rect(xx - 80, 0, w + 160, G + 4); g.clip();
      bark(g, xx, 0, G, w, i * 11 + 3, tr, false);
      g.restore();
      poly(g, [[xx - w * 0.9, G + 2], [xx + 2, G - w * 1.3], [xx + w * 0.4, G + 2]], tr[2]);
      poly(g, [[xx + w * 0.6, G + 2], [xx + w - 2, G - w * 1.2], [xx + w * 1.9, G + 2]], tr[1]);
      poly(g, [[xx - w * 0.9, G + 2], [xx + 2, G - w * 1.3], [xx + 4, G - w * 1.2], [xx - w * 0.5, G + 2]], tr[4]);
    });
  }
  // (lianas looping from trunk to trunk, and moss hanging off them)
  for (let i = 0; i < xs.length; i++) {
    const a = xs[i], b = i + 1 < xs.length ? xs[i + 1] : xs[0] + TW, y = 90 + hash(i * 3.9) * 120, sag = 60 + hash(i * 8.3) * 90;
    for (const off of [0, -TW, TW]) {
      g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(a + off, y); g.quadraticCurveTo((a + b) / 2 + off, y + sag * 2, b + off, y + 10); g.stroke();
      g.strokeStyle = lf[2]; g.lineWidth = 3; g.beginPath(); g.moveTo(a + off, y); g.quadraticCurveTo((a + b) / 2 + off, y + sag * 2, b + off, y + 10); g.stroke();
      g.strokeStyle = lf[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(a + off, y - 1); g.quadraticCurveTo((a + b) / 2 + off, y + sag * 2 - 1, b + off, y + 9); g.stroke();
      for (let k = 1; k < 8; k++) {
        const t = k / 8, mx = (1 - t) * (1 - t) * a + 2 * t * (1 - t) * (a + b) / 2 + t * t * b + off, my = (1 - t) * (1 - t) * y + 2 * t * (1 - t) * (y + sag * 2) + t * t * (y + 10);
        const len = 14 + hash(i * 5 + k) * 34;
        for (let d = 0; d < len; d += 2) box(g, mx + Math.sin(d * 0.3 + k) * 1.5, my + d, 2, 2, d % 4 ? hazeOf('#7E8E5E', 0.2, tod) : hazeOf('#5E6E44', 0.2, tod));
      }
    }
  }
  // (big leaves and ferns at their feet)
  for (let i = 0; i < 16; i++) wrap(i * (TW / 16) + hash(i * 3.7) * 30, x => {
    if (i % 2) bigLeaf(g, x, G + 4, 18 + hash(i) * 10, -Math.PI / 2 - 0.6 + hash(i * 2) * 1.2, lf, 3);
    else fern(g, x, G + 4, 40 + hash(i) * 20, i, 0, lf, 3);
  });
  box(g, 0, G, TW, 140, lf[0]);
};

/** The canopy over it all: leaf masses along the top, gaps of sky between, moss and vines hanging from them. */
const paintCanopy = (g: Ctx, tod: TimeOfDay) => {
  const lf = LEAF.map(c => farTint(mix(c, '#000000', 0.15), 0.1, tod));
  // (vines and moss hanging down out of it first: behind the leaves)
  for (let i = 0; i < 16; i++) wrap(i * (TW / 16) + hash(i * 4.4) * 40, x => {
    const len = 40 + hash(i * 6.1) * 160;
    for (let y = 110; y < 110 + len; y += 4) box(g, x + Math.sin(y * 0.04 + i) * 3, y, 2, 4, (y >> 2) % 3 ? lf[2] : lf[3]);
    if (i % 3 === 0) for (let y = 110; y < 110 + len * 0.6; y += 2) box(g, x + 8 + Math.sin(y * 0.2 + i) * 2, y, 2, 2, (y >> 1) % 2 ? hazeOf('#8A9A6A', 0.1, tod) : hazeOf('#6A7A50', 0.1, tod));
  });
  box(g, 0, 0, TW, 100, lf[0]);
  // (the masses: a solid row along the top, a row hanging lower here and there, gaps between some)
  for (let i = 0; i < 24; i++) wrap(i * (TW / 24) + hash(i * 0.7) * 16, x => clump(g, x, 96 + hash(i * 1.1) * 14, 40, 26, i * 5 + 3, lf, 1));
  for (let i = 0; i < 20; i++) wrap(i * (TW / 20) + hash(i * 1.3) * 20, x => {
    if (hash(i * 9.9) > 0.7) return;
    const hy = 130 + hash(i * 2.7) * 50;
    clump(g, x, hy, 40 + hash(i * 3.1) * 20, 26 + hash(i * 5.5) * 16, i * 13 + 1, lf, 0);
  });
};

/** Light coming down through it in shafts: banded (each a few flat steps of light), slanting with the sun. */
const shafts = (c: Ctx, state: GameState, tod: TimeOfDay, k: number, n: number, seed: number, a0: number) => {
  const sun = sunAt(0, 0, 1, tod).up, moon = tod.moon;
  const day = sun > 0.05;
  const col = day ? mix('#FFF4C8', tod.sunGlow, Math.min(1, tod.skyK * 0.9)) : '#B8C8FF';
  const [r, gg, b] = [1, 3, 5].map(i => parseInt(col.slice(i, i + 2), 16));
  const strength = day ? a0 * (0.6 + 0.6 * tod.skyK) * sun : a0 * 0.45 * moon;
  if (strength < 0.004) return;
  // (lower sun: longer, more slanted shafts)
  const slant = 0.25 + Math.max(0, 1 - Math.max(0, tod.sunH)) * 0.55;
  const span = CANVAS_WIDTH + 600, f = state.frame;
  for (let i = 0; i < n; i++) {
    const x = ((((i * span) / n + hash(seed + i) * 120 - state.camera.x * k) % span) + span) % span - 300;
    const w = 26 + hash(seed + i * 2.3) * 50;
    // (each one breathes a little, in steps)
    const br = 0.7 + 0.3 * Math.round((Math.sin(f * 0.012 + i * 2.1) * 0.5 + 0.5) * 3) / 3;
    for (let s = 0; s < 3; s++) {
      const ww = w * (1 - s * 0.32), a = strength * br * (s === 0 ? 0.5 : 0.35);
      const cx = x + (w - ww) / 2;
      poly(c, [[cx, -10], [cx + ww, -10], [cx + ww + slant * CANVAS_HEIGHT + ww * 0.6, CANVAS_HEIGHT], [cx + slant * CANVAS_HEIGHT - ww * 0.2, CANVAS_HEIGHT]], `rgba(${r}, ${gg}, ${b}, ${a.toFixed(3)})`);
    }
    // (motes drifting in it, catching the light)
    if (day) for (let m = 0; m < 5; m++) {
      const t = ((hash(seed + i * 9 + m) * 600 + f * (0.15 + hash(m + i) * 0.2)) % 600) / 600;
      const my = t * CANVAS_HEIGHT, mx = x + w * hash(seed + m * 3.3 + i) + slant * my + Math.sin(f * 0.03 + m) * 3;
      if ((f + m * 13 + i * 7) % 90 < 70) box(c, mx, my, 2, 2, `rgba(${r}, ${gg}, ${b}, ${Math.min(0.8, strength * 6).toFixed(3)})`);
    }
  }
};

export const drawJungleBackdrop = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), up = lift(state), cx = state.camera.x - 100000, f = state.frame;
  // The sky (the hour's, banded), the sun's glare behind the leaves, or the moon and stars
  const sky = skyRamp(['#5C8ED2', '#86AEE0', '#B7D2E6', '#DCE8DA'], tod);
  bandedGradient(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, sky, 12);
  drawStars(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT * 0.6, f, cx * 0.02, tod);
  drawMoon(c, 610, 90 + up * 0.04, 16, tod);
  const sun = sunAt(560, 60, 360, tod);
  if (sun.up > 0.05) steppedGlow(c, sun.x, sun.y + up * 0.04, 120, tod.sunGlow, 0.5 * sun.up, 0.0, 5);
  // (its glare, gentle and behind the leaves: it's peeking through them, so no ghosts on the lens: sunFlare.ts)
  noteSun(c, sun.x, sun.y + up * 0.04, 0.4, 0);
  // The far crowns, the misty trunks, the near trunks (each its own pace; lower as he climbs)
  tile(c, `jg-far-${tod.key}`, cx, 0.06, 360 - 560 + up * 0.06, 700, g => paintFar(g, tod));
  hazeBands(c, 0, 300 + up * 0.06, CANVAS_WIDTH, 80, skyAt(0.9, tod), 0, 0.18, 4);
  tile(c, `jg-mid-${tod.key}`, cx, 0.16, 420 - 560 + up * 0.16, 700, g => paintMid(g, tod));
  shafts(c, state, tod, 0.2, 5, 11, 0.16);
  tile(c, `jg-near-${tod.key}`, cx, 0.32, 478 - 560 + up * 0.32, 700, g => paintNear(g, tod));
  // (mist lying low among the trunks, drifting)
  const mist = mix(skyAt(0.9, tod), '#FFFFFF', 0.2);
  const [mr, mg, mb] = [1, 3, 5].map(i => parseInt(mist.slice(i, i + 2), 16));
  for (let i = 0; i < 7; i++) {
    const x = ((((i * 160 + f * 0.12 - cx * 0.36) % 1120) + 1120) % 1120) - 160, y = 430 + up * 0.36 + hash(i) * 40;
    pixelBlob(c, x, y, 110 + hash(i * 2) * 60, 16, `rgba(${mr}, ${mg}, ${mb}, 0.1)`);
  }
  // The canopy over the top (it comes down a little as he climbs: there's only so far up)
  const ct = Math.min(80, Math.max(-40, up * 0.3)) - 140;
  tile(c, `jg-canopy-${tod.key}`, cx, 0.5, ct, 360, g => paintCanopy(g, tod));
  shafts(c, state, tod, 0.45, 3, 37, 0.1);
  return true;
};
