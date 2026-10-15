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
import { snap2, wave, jag, range, falls, mist, canopy, crown, banded, checker } from '../../farArt';

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

/** The far jungle: misty peaks at the back (a falls down one), the temple standing up out of the trees (a stepped
 *  pyramid in its stone's ramp: courses, the stair up its front, the shrine and its roof comb, vines and moss down it),
 *  giants over the canopy (umbrella crowns on bare trunks), and the canopy rolling away in two rows, the back one paler;
 *  mist lying in it. Farther: paler, bluer, flatter. */
const paintFar = (g: Ctx, tod: TimeOfDay) => {
  const G = 560, H = 700;
  const sky = skyAt(0.88, tod);
  // The peaks at the back: palest, jagged, in the mist; a falls down one
  {
    const K = 0.62, base = '#4E7A86';
    const L = { body: hazeOf(base, K, tod), lit: hazeOf(mix(base, '#C8E4E8', 0.28), K, tod), hi: hazeOf(mix(base, '#F0FAFA', 0.4), K, tod), shade: hazeOf(mix(base, '#0A1A20', 0.18), K, tod), deep: hazeOf(mix(base, '#0A1A20', 0.3), K, tod) };
    const yAt = (x: number) => snap2(262 + wave(x, TW, 2.2) * 30 + jag(x, TW, 8, 31) * 6);
    range(g, TW, yAt, H, L, 41, { gullies: 18, d: 14, forest: [hazeOf('#2E5A44', K, tod), hazeOf('#4A7A56', K, tod)], forestY: x => yAt(x) + 34 + wave(x, TW, 6.1, 2) * 8 });
    const fx = 380, top = yAt(fx) + 8;
    falls(g, fx, top, top + 58, 6, { rock: L.deep, water: hazeOf('#B8D8E0', K * 0.8, tod), lit: hazeOf('#F0FAFF', K * 0.7, tod), spray: hazeOf('#DCECF0', K * 0.7, tod) });
    mist(g, TW, 250, 120, sky, 0.05, 0.6, 6);
  }
  // The temple: a stepped pyramid, its stair up the front, the shrine on top, vines and moss down it
  wrap(700, x => {
    const K = 0.46, S = ['#3E3A2E', '#57523F', '#6E6A54', '#8A8468', '#A8A080'].map(c => hazeOf(c, K, tod));
    const moss = hazeOf('#4A6A34', K, tod), mossL = hazeOf('#6A8A44', K, tod);
    const tiers = 6, th = 18;
    for (let i = 0; i < tiers; i++) {
      const w = 150 - i * 22, y = 300 - i * th, l = x - w / 2;
      // (the tier's face: lit at its left end, its shade dithered in at the right; a dark line under the tread over it)
      box(g, l, y, w, th, S[2]);
      box(g, l, y, 6, th, S[3]); box(g, l, y, 2, th, S[4]); checker(g, l + 6, y, 2, th, S[3]);
      box(g, l + w - 12, y, 12, th, S[1]); checker(g, l + w - 14, y, 2, th, S[1]);
      box(g, l, y, w, 2, S[0]);
      // (block courses, the joints staggered)
      for (let cy = y + 7; cy < y + th; cy += 6) {
        box(g, l + 2, cy, w - 4, 1, S[1]);
        for (let jx = l + 6 + ((cy >> 1) % 2) * 6; jx < l + w - 6; jx += 12) box(g, jx, cy - 5, 1, 5, S[1]);
      }
      // (moss creeping along under the tread, dripping)
      for (let mx = l + 4; mx < l + w - 4; mx += 6) if (hash(mx * 0.7 + i) > 0.45) { box(g, mx, y + 2, 4, 2, moss); if (hash(mx + i * 3) > 0.6) box(g, mx + 1, y + 4, 2, 2 + Math.round(hash(mx * 1.3) * 4), moss); }
    }
    // (the stair up the middle: its treads in shade, its edges lit; the walls either side of it)
    const sw = 22, sTop = 300 - (tiers - 1) * th;
    box(g, x - sw / 2 - 3, sTop, 3, 318 - sTop, S[3]); box(g, x + sw / 2, sTop, 3, 318 - sTop, S[1]);
    for (let y = sTop; y < 318; y += 4) { box(g, x - sw / 2, y, sw, 2, S[2]); box(g, x - sw / 2, y + 2, sw, 2, S[1]); }
    // (the shrine on top: its walls, the dark doorway, the roof comb over it pierced)
    const sy = 170;
    box(g, x - 18, sy, 36, 30, S[2]); box(g, x - 18, sy, 3, 30, S[4]); box(g, x + 12, sy, 6, 30, S[1]); checker(g, x + 10, sy, 2, 30, S[1]);
    box(g, x - 7, sy + 10, 14, 20, S[0]); box(g, x - 5, sy + 8, 10, 2, S[0]);
    box(g, x - 22, sy - 4, 44, 4, S[1]); box(g, x - 22, sy, 44, 1, S[0]);
    box(g, x - 12, sy - 22, 24, 18, S[2]); box(g, x - 12, sy - 22, 2, 18, S[3]); box(g, x + 8, sy - 22, 4, 18, S[1]);
    for (let k = 0; k < 3; k++) box(g, x - 8 + k * 6, sy - 18, 3, 6, S[0]);
    box(g, x - 4, sy - 26, 8, 4, S[1]);
    // (vines down it: green strands from the shrine and the tiers, leafy)
    for (let i = 0; i < 7; i++) {
      const vx = x - 60 + i * 20 + Math.round(hash(i * 2.7) * 6), dx = Math.abs(vx - x);
      // (hung off the highest tier that's under it)
      const vy = Math.max(210 + hash(i) * 30, 300 - Math.max(0, Math.floor((142 - 2 * dx) / 22)) * 18 + 4), len = 30 + hash(i * 1.9) * 50;
      for (let y = vy; y < Math.min(318, vy + len); y += 2) { box(g, vx + Math.round(Math.sin(y * 0.15 + i) * 1.5), y, 2, 2, (y >> 1) % 3 ? moss : mossL); }
    }
  });
  // The giants: bare trunks up over the canopy, lit down the left, forking; umbrella crowns in stepped lumps
  const GR = ['#1E4430', '#2C5A3A', '#467A46', '#6A9A58'].map(c => hazeOf(c, 0.46, tod));
  const tr = BARK.map(c => hazeOf(c, 0.5, tod));
  for (let i = 0; i < 4; i++) wrap(i * 256 + 90 + hash(i * 3.3) * 80, x => {
    const top = 180 + hash(i) * 50;
    box(g, x - 4, top, 8, G - top, tr[3]); box(g, x - 4, top, 2, G - top, tr[5]); box(g, x + 2, top, 2, G - top, tr[2]); checker(g, x - 2, top, 2, G - top, tr[4]);
    // (the fork into its crown)
    for (let k = 0; k < 14; k += 2) { box(g, x - 4 - k, top - k * 0.6, 3, 2, tr[3]); box(g, x + 3 + k, top - k * 0.5, 3, 2, tr[2]); }
    for (let k = -2; k <= 2; k++) crown(g, x + k * 20, top - 8 + Math.abs(k) * 5, 18 - Math.abs(k) * 2, GR);
    crown(g, x - 6, top - 16, 16, GR);
  });
  // The canopy rolling away: the back row paler and flatter, the front row nearer, bumpier
  const back = ['#2A5038', '#386848', '#4E8256', '#6E9E6A'].map(c => hazeOf(c, 0.56, tod));
  const front = ['#1E4430', '#2C5C38', '#427C44', '#64A058'].map(c => hazeOf(c, 0.42, tod));
  canopy(g, TW, x => 300 + wave(x, TW, 1.1, 2) * 10, H, back, 16, 7);
  mist(g, TW, 300, 70, sky, 0.1, 0.35, 4);
  canopy(g, TW, x => 346 + wave(x, TW, 3.7, 2) * 14, H, front, 24, 19);
  banded(g, TW, 410, 36, [mix(front[0], sky, 0.1), mix(front[0], sky, 0.22)], H);
  mist(g, TW, 380, 180, sky, 0.0, 0.4, 5);
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
