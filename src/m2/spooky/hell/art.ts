// Real hell, painted (SNES: every material in a stepped ramp, dithered where the steps meet, inked where it stands
// out; flat banded gradients; the light comes up off the lava, dim, never a glare). The cavern behind (painted once
// into parallax layers: the banded dark going down to the lava's dull glow, the far wall with lava falls down it,
// stalactites, two rows of rock spires); the pit's shaft he falls down; the wrecked cars and what's left of their
// riders; the basalt floor (a lit top lip: standable; dim seams of lava in its cracks), rocks shaped like rocks (in
// columns, the lip on top, the lava's light on their feet), slabs to jump up through (jagged undersides); the dressing
// (cages hung from the dark with what's left of somebody in them, bone piles: dim, still, part of the place, not
// anything that'll come at him); the bone arch into the demon's pit; Satan's lake behind it; the vent.
//
// Still things are painted once into stamps (m1 render/stamp) and put down with one drawImage after; only what moves
// (the falls' flow, a cage swinging on its chain, the cable) is drawn live.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { blitLayer, tileToScreenX, type LayerSpec } from '../../../m1/game/render/backdrops/core';
import { bandedGradient, hazeBands, tilePattern } from '../../../m1/game/render/pixelArt';
import { GY } from '../geometry';
import {
  x0, x1, SHAFT_L, SHAFT_R, SHAFT_TOP, LEFT_ROCK_BOTTOM, RIGHT_ROCK_BOTTOM, RIGHT_ROCK_W, WRECK_X, WRECK_B_X, POOLS, ROCKS, LEDGES,
  REFILL_X, ARENA_IN, VENT_X, LAVA_DROP, CAGES, BONES,
} from './layout';
import { drawWreckedCar } from './hazards';
import { GUESTS, corpse, bloodPool, splat } from './riders';
import { hellOf } from './state';
import { type Ctx, INK, box, checker, mix, hash, PIX, dark, stamp, BASALT, LAVA, BONE, IRON, LIP, poly, inkPoly, lip, basalt, hellSign, sn } from './paint';

// ---------------------------------------------------------------------------------------------------------------
// The cavern (screen space): painted once into half-res tiles (640 x 300, shown 2x), blitted with parallax

const TW = 640, TH = 300;
/** Hell's own dark, for dimming what's far back into it. */
const MURK = '#160605';
const far = (col: string, k: number) => mix(col, MURK, k);

const SKY: LayerSpec = {
  key: 'hell-sky', parallax: 0,
  paint: (g, w, h) => {
    bandedGradient(g, 0, 0, w, h, ['#080202', '#100404', '#1A0606', '#260A07', '#330E08', '#40130A', '#4C190B'], 12, 1);
  },
};

/** The far wall: rock in great columns, the lava falls down it (their flow's drawn live over: see FALLS). */
const FALLS = [70, 250, 470];
/** How near a fall a far-wall column stands (0 far .. 1 right by it): the falls light the rock round them. */
const nearFall = (x: number) => Math.max(0, ...FALLS.map(fx => 1 - Math.abs(x - fx) / 70));
const WALL: LayerSpec = {
  key: 'hell-wall3', parallax: 0.08,
  paint: (g, w, h) => {
    // (columns of basalt, each a stepped ramp: lit on its left by the falls, its face, then its shade going round to the
    // dark on its right, dithered between; fractured across in courses, each break inked with its lower lip lit)
    for (let x = 0; x < w; x += 22) {
      const k = hash(x * 0.37), top = 20 + k * 40, glow = nearFall(x + 11);
      const tint = (col: string, f: number) => mix(far(col, f), '#7A2A0E', glow * 0.32);
      const face = tint(BASALT[3], 0.58 + k * 0.08), lit = tint(BASALT[5], 0.6), lit2 = tint(BASALT[4], 0.62), shade = tint(BASALT[2], 0.55), deep = tint(BASALT[1], 0.4);
      g.fillStyle = face; g.fillRect(x, top, 22, h - top);
      // (its broken top: a jag, the facet catching the light)
      g.beginPath(); g.moveTo(x, top); g.lineTo(x + 8 + k * 6, top - 8 - k * 10); g.lineTo(x + 22, top); g.fill();
      g.fillStyle = lit2; g.beginPath(); g.moveTo(x, top); g.lineTo(x + 8 + k * 6, top - 8 - k * 10); g.lineTo(x + 6 + k * 6, top); g.fill();
      g.fillStyle = lit; g.fillRect(x, top, 2, h - top);
      g.fillStyle = lit2; g.fillRect(x + 2, top, 3, h - top);
      checker(g, x + 5, top, 2, h - top, lit2, 0, 1);
      g.fillStyle = shade; g.fillRect(x + 15, top, 4, h - top);
      checker(g, x + 13, top, 2, h - top, shade, 1, 1);
      g.fillStyle = deep; g.fillRect(x + 19, top, 3, h - top);
      g.fillStyle = far(INK, 0.35); g.fillRect(x + 21, top, 1, h - top);
      // (the courses: breaks across the column every so often)
      for (let y = top + 10 + hash(x * 1.7) * 22; y < h - 8; y += 24 + hash(x + y) * 26) {
        const yy = Math.round(y), tilt = hash(x * 3 + y) < 0.5 ? 1 : 0;
        g.fillStyle = deep; g.fillRect(x + 1, yy, 20, 1); g.fillRect(x + 11, yy + tilt, 10, 1);
        g.fillStyle = lit2; g.fillRect(x + 2, yy + 1 + tilt, 12, 1);
        // (now and then a chip out of the edge)
        if (hash(x + y * 3.1) < 0.3) { g.fillStyle = deep; g.fillRect(x + 18, yy - 3, 4, 3); g.fillStyle = shade; g.fillRect(x + 17, yy - 3, 1, 3); }
      }
      // (soot streaks running down from the top, faint)
      if (k > 0.55) { g.fillStyle = far(BASALT[1], 0.5); g.fillRect(x + 8 + Math.floor(k * 6), top + 4, 1, 30 + k * 60); }
    }
    // (the falls: out of a crack, down the wall into a dull pool of glow at the bottom: crust edges, a stepped core)
    for (const fx of FALLS) {
      const top = 40 + hash(fx) * 50;
      // (the glow they throw on the wall round them: stepped bands)
      for (let i = 3; i >= 1; i--) {
        const r = 10 + i * 9;
        g.fillStyle = `rgba(150, 46, 14, ${(0.1 + (3 - i) * 0.06).toFixed(2)})`; g.fillRect(fx + 2 - r, top, r * 2, h - top);
      }
      // (the crack it pours out of, inked, its lip lit)
      g.fillStyle = far(INK, 0.1); g.fillRect(fx - 9, top - 7, 22, 9);
      g.fillStyle = '#3A0E06'; g.fillRect(fx - 7, top - 5, 18, 5);
      g.fillStyle = '#C2561A'; g.fillRect(fx - 5, top - 2, 14, 2);
      // (the flow: dark crust either side, then up the ramp to its hot middle)
      g.fillStyle = '#2E0A04'; g.fillRect(fx - 6, top, 16, h - top);
      g.fillStyle = '#5A1808'; g.fillRect(fx - 4, top, 12, h - top);
      g.fillStyle = '#7E260B'; g.fillRect(fx - 2, top, 8, h - top);
      g.fillStyle = '#A6380F'; g.fillRect(fx, top, 4, h - top);
      g.fillStyle = '#C8561C'; g.fillRect(fx + 1, top, 1, h - top);
      checker(g, fx - 4, top, 2, h - top, '#7E260B', 0, 1);
      checker(g, fx + 6, top, 2, h - top, '#7E260B', 1, 1);
      checker(g, fx - 8, top, 2, h - top, '#5A1808', 1, 1);
      checker(g, fx + 10, top, 2, h - top, '#5A1808', 0, 1);
      // (crust lumps hanging off its edges)
      for (let y = top + 8; y < h - 20; y += 14 + hash(fx + y) * 18) { g.fillStyle = '#2E0A04'; g.fillRect(fx + (hash(y + fx) < 0.5 ? -7 : 9), Math.round(y), 2, 3); }
      // (where it lands: the splash pool, banded, the glow up the wall)
      g.fillStyle = '#4A1406'; g.fillRect(fx - 22, h - 14, 48, 14);
      g.fillStyle = '#6A1E0A'; g.fillRect(fx - 16, h - 18, 36, 18);
      g.fillStyle = '#8E2E0E'; g.fillRect(fx - 10, h - 16, 24, 4);
      g.fillStyle = '#C2561A'; g.fillRect(fx - 4, h - 16, 12, 1);
      checker(g, fx - 26, h - 20, 56, 4, '#6A1E0A', 0, 1);
    }
    // (the glow off the lava, low down: in bands)
    hazeBands(g, 0, h - 90, w, 90, '#7A2208', 0, 0.28, 6, 1);
  },
};

const STALACTITES: LayerSpec = {
  key: 'hell-stalactites3', parallax: 0.15,
  paint: (g, w) => {
    // (the roof itself first: a ragged band of rock along the top, lit underneath)
    for (let x = 0; x < w; x += 6) {
      const d = 8 + Math.floor(hash(x * 0.9) * 8);
      g.fillStyle = far(BASALT[1], 0.2); g.fillRect(x, 0, 6, d);
      g.fillStyle = far(BASALT[3], 0.35); g.fillRect(x, d - 1, 6, 1);
    }
    checker(g, 0, 16, w, 2, far(BASALT[1], 0.2), 0, 1);
    const cone = (ox: number, l: number, hf: number) => {
      const tri = (pts: [number, number][], col: string) => { g.fillStyle = col; g.beginPath(); pts.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); g.fill(); };
      // (ink round it, then its body, lit down its left from below, shaded down its right, a drip at its tip)
      tri([[ox - hf - 1, 0], [ox + hf + 1, 0], [ox + 1, l + 2]], far(INK, 0.15));
      tri([[ox - hf, 0], [ox + hf, 0], [ox + 1, l]], far(BASALT[2], 0.3));
      tri([[ox - hf, 0], [ox - hf + 3, 0], [ox + 1, l], [ox, l - 2]], far(BASALT[4], 0.4));
      tri([[ox - hf + 3, 0], [ox - hf + 5, 0], [ox + 1, l - 4]], far(BASALT[3], 0.38));
      tri([[ox + hf - 3, 0], [ox + hf, 0], [ox + 1, l]], far(BASALT[1], 0.2));
      // (rings where it's grown, faint)
      for (let y = 8; y < l - 8; y += 9) { const ww = hf * (1 - y / l); g.fillStyle = far(BASALT[1], 0.3); g.fillRect(Math.round(ox - ww + 2), y, Math.max(1, Math.round(ww)), 1); }
      g.fillStyle = far('#7A2A10', 0.35); g.fillRect(ox, l - 3, 2, 2);
      g.fillStyle = far('#C2561A', 0.45); g.fillRect(ox, l - 1, 1, 1);
    };
    for (let i = 0; i < 24; i++) {
      const x = (i * 29 + hash(i) * 20) % w, len = 26 + hash(i * 3.1) * 74, half = 5 + hash(i * 5.3) * 10, twin = hash(i * 7.7) < 0.35;
      for (const dx of [-w, 0, w]) {
        cone(x + dx, len, half);
        if (twin) cone(x + dx + half + 4, len * 0.45, half * 0.5);
      }
    }
  },
};

/** Rock spires going back: the far row (lit from under, dim), then a nearer, darker one. */
const spires = (g: CanvasRenderingContext2D, w: number, h: number, seed: number, base: number, amp: number, col: string, lit: string) => {
  // (each inked, its left flank lit up from the lava in two steps dithered into its face, its right in shade, strata
  // breaking across it)
  const mid = mix(col, lit, 0.45), dk = mix(col, '#000000', 0.35), ink = mix(col, '#000000', 0.6);
  const fill = (p: [number, number][], c: string) => { g.fillStyle = c; g.beginPath(); p.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); g.fill(); };
  for (const dx of [-w, 0, w]) {
    let x = 0;
    while (x < w) {
      const k = hash(seed + x * 0.13), sw = 26 + k * 50, sh = base + hash(seed + x * 0.71) * amp, cx = x + dx;
      const pts: [number, number][] = [[cx - 4, h], [cx + sw * 0.35, h - sh], [cx + sw * 0.5, h - sh - 6], [cx + sw * 0.62, h - sh + 4], [cx + sw + 4, h]];
      fill([[cx - 5, h], [cx + sw * 0.35, h - sh - 1], [cx + sw * 0.5, h - sh - 7], [cx + sw * 0.62, h - sh + 3], [cx + sw + 5, h]], ink);
      fill(pts, col);
      fill([[cx + sw * 0.5, h - sh - 6], [cx + sw * 0.62, h - sh + 4], [cx + sw + 4, h], [cx + sw * 0.72, h]], dk);
      fill([[cx - 4, h], [cx + sw * 0.35, h - sh], [cx + sw * 0.35 + 7, h - sh + 10], [cx + 10, h]], mid);
      fill([[cx - 4, h], [cx + sw * 0.35, h - sh], [cx + sw * 0.35 + 3, h - sh + 4], [cx + 2, h]], lit);
      g.save(); g.beginPath(); pts.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); g.clip();
      checker(g, cx + 8, h - sh * 0.7, 4, sh * 0.7, mid, 0, 1);
      for (let s = 1; s < 4; s++) { const y = Math.round(h - sh * (s / 4) + hash(seed + x + s) * 6); g.fillStyle = dk; g.fillRect(cx, y, sw, 1); g.fillStyle = mid; g.fillRect(cx + 2, y + 1, Math.round(sw * 0.4), 1); }
      g.restore();
      x += sw * 0.7;
    }
  }
};
const RIDGE_FAR: LayerSpec = {
  key: 'hell-ridge-far3', parallax: 0.32,
  paint: (g, w, h) => {
    spires(g, w, h, 11, 60, 80, '#1E0806', '#3A1209');
    hazeBands(g, 0, h - 50, w, 50, '#6A1C08', 0, 0.22, 5, 1);
  },
};
const RIDGE_NEAR: LayerSpec = {
  key: 'hell-ridge-near3', parallax: 0.55,
  paint: (g, w, h) => {
    spires(g, w, h, 37, 30, 60, '#120404', '#2A0C07');
  },
  // (the heat off the lava shimmering the bottom of it)
  raster: { from: TH - 26, wobble: (row, f) => (Math.sin(row * 0.9 + f * 0.12) > 0.6 ? 1 : 0) },
};

/** Screen space: the cavern behind everything. */
export const drawHellBackdrop = (c: Ctx, state: GameState) => {
  const cam = state.camera, f = state.frame;
  blitLayer(c, SKY, 0, 0, f);
  blitLayer(c, WALL, cam.x, cam.y, f);
  // (the falls' flow: a few stepped streaks running down each, slow, dim)
  for (const fx of FALLS) {
    const sx = tileToScreenX(fx, WALL, cam.x, f);
    if (sx < -40 || sx > CANVAS_WIDTH + 40) continue;
    const top = (40 + hash(fx) * 50) * 2;
    for (let y = top + ((f * 3 + fx) % 48); y < CANVAS_HEIGHT - 30; y += 48) { box(c, sx + 2, y, 2, 14, '#A8441A'); box(c, sx - 2, y + 20, 2, 8, '#8E2E0E'); }
  }
  blitLayer(c, STALACTITES, cam.x, cam.y, f);
  blitLayer(c, RIDGE_FAR, cam.x, cam.y, f);
  blitLayer(c, RIDGE_NEAR, cam.x, cam.y, f);
  // (embers drifting up out of it all: a few, small, dim)
  for (let i = 0; i < 14; i++) {
    const sp = 0.4 + hash(i * 3.7) * 0.5, y = CANVAS_HEIGHT - ((f * sp + hash(i) * 900) % (CANVAS_HEIGHT + 40));
    const x = ((hash(i * 9.1) * (CANVAS_WIDTH + 200) - cam.x * 0.4 + Math.sin(f * 0.02 + i) * 14) % (CANVAS_WIDTH + 200) + CANVAS_WIDTH + 200) % (CANVAS_WIDTH + 200) - 100;
    box(c, Math.round(x / 2) * 2, Math.round(y / 2) * 2, 2, 2, i % 3 ? '#9A3A12' : '#C2561A');
  }
};
void TW;

// ---------------------------------------------------------------------------------------------------------------
// The pit's wreck: the riders (riders.ts), where they landed

/** The two wrecked elevators at the bottom of the pit (both shafts' cars came down when the tower went: one on its
 *  side against the other), and their riders all round them. */
const drawWreck = (c: Ctx, state: GameState, extra: boolean) => {
  const f = state.frame, W = WRECK_X, B = WRECK_B_X, G = GUESTS;
  // (the floor's share: the blood, under it all; splats up the shaft wall)
  c.save(); c.translate(W, 0);
  stamp(c, 'hell-pit-floor2', -440, GY - 200, 1240, 212, g => {
    g.translate(-W, 0);
    bloodPool(g, B - 60, 40, GY); bloodPool(g, W + 6, 46, GY); bloodPool(g, W + 214, 36, GY); bloodPool(g, W + 330, 44, GY);
    bloodPool(g, W + 460, 38, GY); bloodPool(g, W + 630, 42, GY); bloodPool(g, W + 540, 14, GY);
    for (let k = 0; k < 7; k++) splat(g, W - 130 + k * 37, GY - 150 - ((k * 37) % 70), 5 + (k % 3) * 2);
  });
  c.restore();
  // (the other car, on its side; the one half out of it, over its edge)
  drawWreckedCar(c, B + 63, GY - 58, -Math.PI / 2, f);
  c.save(); c.translate(B, 0);
  stamp(c, 'hell-pit-b2', -110, GY - 160, 220, 162, g => {
    g.translate(-B, 0);
    box(g, B - 63, GY - 113, 126, 2, LIP[0]); box(g, B - 63, GY - 111, 126, 2, LIP[1]);
    splat(g, B - 62, GY - 70, 8);
    corpse(g, G[0], {
      head: [B - 74, GY - 74], face: -1, neck: [B - 68, GY - 88], hip: [B - 50, GY - 120],
      arms: [[[B - 68, GY - 92], [B - 78, GY - 66], [B - 76, GY - 44]], [[B - 64, GY - 90], [B - 56, GY - 64], [B - 64, GY - 40]]],
      legs: [[[B - 50, GY - 120], [B - 30, GY - 126], [B - 12, GY - 120]], [[B - 50, GY - 118], [B - 30, GY - 122], [B - 10, GY - 136]]],
    });
  });
  c.restore();
  // (the cable down the shaft, snapped, swinging a little: stepped strands)
  const sw = Math.round(Math.sin(f * 0.02) * 12);
  for (const [col, w] of [[INK, 4], [IRON[3], 2]] as [string, number][]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(W + 10, SHAFT_TOP); c.quadraticCurveTo(W + 10 + sw, GY - 600, W - 10, GY - 140); c.stroke(); }
  void extra; // (the last car down: hazards.ts draws it, once it's down)
  drawWreckedCar(c, W, GY, 0, f, true);
  // (the rest of them: one folded over the lap bar, butt up; the others where they were thrown)
  c.save(); c.translate(W, 0);
  stamp(c, 'hell-pit-riders', -60, GY - 90, 800, 92, g => {
    g.translate(-W, 0);
    // (over the lap bar)
    corpse(g, G[3], {
      head: [W + 12, GY - 18], face: 1, neck: [W + 8, GY - 30], hip: [W - 6, GY - 62],
      arms: [[[W + 6, GY - 32], [W + 14, GY - 16], [W + 6, GY - 6]], [[W + 10, GY - 30], [W + 22, GY - 18], [W + 20, GY - 6]]],
      legs: [[[W - 6, GY - 62], [W - 22, GY - 52], [W - 26, GY - 30]], [[W - 6, GY - 60], [W - 20, GY - 48], [W - 20, GY - 26]]],
    });
    // (face down, butt up)
    corpse(g, G[1], {
      head: [W + 234, GY - 7], face: 1, down: true, neck: [W + 222, GY - 10], hip: [W + 200, GY - 24],
      arms: [[[W + 220, GY - 11], [W + 212, GY - 4], [W + 200, GY - 3]], [[W + 220, GY - 10], [W + 230, GY - 3], [W + 244, GY - 3]]],
      legs: [[[W + 200, GY - 24], [W + 192, GY - 4], [W + 172, GY - 4]], [[W + 200, GY - 22], [W + 198, GY - 3], [W + 178, GY - 3]]],
    });
    // (on her back, an arm up crooked, a leg the wrong way, the churro still in her fist)
    corpse(g, G[4], {
      head: [W + 290, GY - 9], face: -1, neck: [W + 300, GY - 9], hip: [W + 340, GY - 9],
      arms: [[[W + 302, GY - 11], [W + 294, GY - 26], [W + 310, GY - 36]], [[W + 304, GY - 8], [W + 318, GY - 4], [W + 322, GY - 18]]],
      legs: [[[W + 340, GY - 10], [W + 356, GY - 26], [W + 352, GY - 5]], [[W + 340, GY - 8], [W + 362, GY - 6], [W + 372, GY - 24]]],
    });
    // (on her side, her legs going the wrong way, the souvenir cup spilled)
    corpse(g, G[2], {
      head: [W + 482, GY - 8], face: 1, neck: [W + 470, GY - 9], hip: [W + 436, GY - 9],
      arms: [[[W + 468, GY - 11], [W + 478, GY - 22], [W + 490, GY - 14]], [[W + 468, GY - 8], [W + 484, GY - 4], [W + 496, GY - 6]]],
      legs: [[[W + 436, GY - 10], [W + 420, GY - 22], [W + 432, GY - 36]], [[W + 436, GY - 8], [W + 418, GY - 6], [W + 402, GY - 4]]],
    });
    // (face down, spread out flat, one arm and one leg bent back on themselves)
    corpse(g, G[5], {
      head: [W + 590, GY - 7], face: -1, down: true, neck: [W + 602, GY - 7], hip: [W + 640, GY - 7],
      arms: [[[W + 602, GY - 8], [W + 590, GY - 18], [W + 576, GY - 12]], [[W + 604, GY - 6], [W + 614, GY - 3], [W + 620, GY - 16]]],
      legs: [[[W + 640, GY - 8], [W + 660, GY - 7], [W + 682, GY - 5]], [[W + 640, GY - 6], [W + 656, GY - 4], [W + 662, GY - 20]]],
    });
    // (what came off them: a lone sneaker, a cap, the ride's photo strip)
    g.save(); g.translate(W + 150, GY - 4); g.rotate(-0.4);
    box(g, -1, -4, 12, 8, INK); box(g, 0, -3, 10, 6, '#D8D8D8'); box(g, 0, -3, 10, 1, '#F4F4F4'); box(g, 0, 2, 10, 1, '#8A8A8A');
    g.restore();
    box(g, W + 380, GY - 5, 20, 5, INK); box(g, W + 381, GY - 4, 18, 3, '#E8E8E8'); for (let i = 0; i < 3; i++) box(g, W + 382 + i * 6, GY - 4, 4, 2, '#5A6A8A');
    box(g, W + 540, GY - 6, 16, 6, INK); box(g, W + 541, GY - 5, 14, 4, '#9A1B1B'); box(g, W + 553, GY - 3, 8, 2, '#7A1414');
  });
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Rock

const FLOOR_W = 192, FLOOR_H = 160;

/** One stretch of the floor (FLOOR_W wide, from the lip down): basalt in courses, the joints inked, lava's dull
 *  light in a few of the cracks, a few stones lying on it; the lit lip along its top. Local: (0, 0) the lip's left. */
const paintFloor = (g: Ctx, v: number) => {
  const r = BASALT;
  const bands: [number, string][] = [[6, r[5]], [16, r[4]], [42, r[3]], [86, r[2]], [FLOOR_H, r[1]]];
  let y0 = 0;
  for (const [y1, col] of bands) { box(g, 0, y0, FLOOR_W, y1 - y0, col); y0 = y1; }
  y0 = 6;
  for (const [y1, col] of bands.slice(1)) { checker(g, 0, y0 - PIX, FLOOR_W, PIX, col, 0); y0 = y1; }
  // (the courses: rows of blocks, joints inked, each block's top lit and its bottom shaded)
  const rows = [[8, 30], [30, 58], [58, 96], [96, 140]];
  rows.forEach(([a, b], ri) => {
    let x = -Math.floor(hash(v * 7 + ri) * 40);
    while (x < FLOOR_W) {
      const bw = 30 + Math.floor(hash(v * 13 + ri * 5 + x) * 40);
      const L = Math.max(0, x), R = Math.min(FLOOR_W, x + bw);
      if (R - L > 4) {
        box(g, L, a, R - L, 1, mix(bands[Math.min(4, ri + 1)][1], r[6], 0.35));
        box(g, L, b - 3, R - L, 2, dark(bands[Math.min(4, ri + 1)][1], 0.3));
        if (x + bw < FLOOR_W) {
          box(g, x + bw - 1, a, 2, b - a, INK);
          // (a crack with the lava's dull light in it: dim, deep down)
          if (hash(v * 3 + x * 0.7 + ri) < 0.28 && ri > 0) { box(g, x + bw - 1, a + 3, 2, b - a - 6, LAVA[1]); box(g, x + bw - 1, a + 6, 1, b - a - 12, LAVA[2]); }
        }
      }
      x += bw;
    }
    box(g, 0, b - 1, FLOOR_W, 2, INK);
  });
  // (stones lying on it, and a skull now and then: small, sat on the lip)
  for (let i = 0; i < 3; i++) {
    const k = hash(v * 17 + i * 3.3);
    if (k > 0.6) continue;
    const sx = 12 + Math.floor(hash(v + i * 9.1) * (FLOOR_W - 30)), sw = 6 + Math.floor(k * 10);
    box(g, sx - 1, -5, sw + 2, 6, INK); box(g, sx, -4, sw, 4, r[4]); box(g, sx, -4, sw, 1, r[6]); box(g, sx + sw - 2, -3, 2, 3, r[2]);
  }
  lip(g, 0, 0, FLOOR_W);
};

/** The floor from a to b (world x), in stretches (world-anchored: they stay put as the camera goes). */
const floor = (c: Ctx, a: number, b: number) => {
  c.save(); c.beginPath(); c.rect(a, GY - 12, b - a, FLOOR_H + 400); c.clip();
  for (let k = Math.floor(a / FLOOR_W); k * FLOOR_W < b; k++) {
    const v = Math.floor(hash(k * 1.37) * 4);
    c.save(); c.translate(k * FLOOR_W, GY);
    stamp(c, `hell-floor-${v}`, 0, -8, FLOOR_W, FLOOR_H + 8, g => paintFloor(g, v));
    c.restore();
  }
  box(c, a, GY + FLOOR_H, b - a, 400, BASALT[1]);
  c.restore();
};

const overPool = (x: number, w: number) => POOLS.some(([a, b]) => x + w > a && x < b);

/** A rock with a flat top to stand on, from `top` down to `bot`: basalt in columns, inked, the lit lip on top; in the
 *  lava, the lava's light on its foot. */
export const rock = (c: Ctx, x: number, top: number, w: number, bot: number) => {
  const h = Math.round(bot - top), lavaY = GY + LAVA_DROP - top, wet = lavaY < h;
  c.save(); c.translate(Math.round(x), Math.round(top));
  stamp(c, `hell-rock-${Math.round(x)}-${Math.round(w)}-${h}-${wet ? Math.round(lavaY) : 'dry'}`, -10, -2, w + 20, h + 4, g => {
    const pts: [number, number][] = [[0, 0], [w, 0], [w + 4, 22], [w + 2, h], [-2, h], [-5, 20]];
    g.save(); poly(g, pts, BASALT[4]); g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.clip();
    basalt(g, -6, 0, w + 12, h, x + w, 4);
    // (the right flank in shade: it's turned from the light)
    box(g, w - 8, 6, 14, h, BASALT[2]); checker(g, w - 12, 6, 4, h, BASALT[2]);
    // (the lava's light up its foot, in steps)
    if (wet) for (let i = 0; i < 4; i++) { box(g, -6, lavaY - 6 - i * 6, w + 12, 6, mix(BASALT[4], LAVA[3], 0.45 - i * 0.1)); checker(g, -6, lavaY - 12 - i * 6, w + 12, 2, mix(BASALT[4], LAVA[3], 0.35 - i * 0.1)); }
    g.restore();
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.stroke();
    lip(g, 0, 0, w);
    box(g, -1, 0, 2, 2, LIP[1]); box(g, w - 1, 0, 2, 2, LIP[1]);
  });
  c.restore();
};

/** A slab of rock to jump up through and stand on: lit top, jagged underside, inked. */
const slab = (c: Ctx, x: number, y: number, w: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, `hell-slab-${w}-${x}`, -4, -2, w + 8, 36, g => {
    const pts: [number, number][] = [[0, 0], [w, 0], [w + 1, 12]];
    for (let k = w; k > 0; k -= 22) pts.push([k - 11, 14 + Math.round(hash(x + k) * 12)]);
    pts.push([-1, 12]);
    g.save(); poly(g, pts, BASALT[4]); g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.clip();
    basalt(g, -2, 0, w + 4, 30, x, 4, false);
    box(g, -2, 10, w + 4, 4, BASALT[3]); box(g, -2, 14, w + 4, 20, BASALT[2]); checker(g, -2, 12, w + 4, 2, BASALT[2]);
    g.restore();
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.stroke();
    lip(g, 0, 0, w);
  });
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Dressing: dim, still, part of the place (nothing here that looks like it'll come at him)

/** Set dressing goes back toward the dark. */
const dress = (col: string) => mix(col, '#2A0C08', 0.4);

/** A cage hung on a chain from the dark, a skeleton slumped in it (swinging a little). */
const cage = (c: Ctx, x: number, low: number, f: number, camY: number) => {
  const sw = Math.round(Math.sin(f * 0.02 + x) * 4), top = GY - low - 90, cx = x + sw;
  // (the chain: links, alternately edge on)
  const ax = x, ay = camY - 20, n = Math.max(1, Math.floor((top - 14 - ay) / 6));
  for (let i = 0; i < n; i++) {
    const t = i / n, lx = Math.round(ax + (cx - ax) * t), ly = Math.round(ay + (top - 14 - ay) * t);
    if (i % 2) box(c, lx - 1, ly, 2, 6, dress(IRON[3]));
    else { box(c, lx - 2, ly, 4, 6, dress(IRON[1])); box(c, lx - 1, ly + 1, 2, 4, MURK); }
  }
  c.save(); c.translate(cx, top);
  stamp(c, 'hell-cage', -32, -18, 64, 92, g => {
    const bar = dress(IRON[3]), barD = dress(IRON[1]);
    // (the skeleton in the back of it, slumped: the skull lolling, a hand through the bars)
    const b = dress(BONE[3]), bd = dress(BONE[1]);
    box(g, -9, 21, 16, 14, INK); box(g, -8, 22, 14, 12, b); box(g, -8, 22, 14, 2, dress(BONE[4])); box(g, 3, 24, 3, 10, dress(BONE[2]));
    box(g, -5, 26, 3, 3, MURK); box(g, 1, 26, 3, 3, MURK); box(g, -4, 31, 8, 2, bd);
    box(g, -2, 34, 3, 20, b);
    for (let i = 0; i < 3; i++) box(g, -8, 38 + i * 5, 16, 2, b);
    box(g, -12, 52, 22, 3, b); box(g, 6, 54, 14, 3, b); box(g, -14, 52, 3, 14, bd); box(g, 18, 54, 3, 12, bd);
    box(g, 20, 40, 10, 2, b); box(g, -26, 46, 8, 2, b);
    // (the cage: a dome, the bars, the floor ring)
    g.fillStyle = INK; g.beginPath(); g.moveTo(-28, 1); g.lineTo(0, -15); g.lineTo(28, 1); g.closePath(); g.fill();
    g.fillStyle = barD; g.beginPath(); g.moveTo(-26, 0); g.lineTo(0, -13); g.lineTo(26, 0); g.closePath(); g.fill();
    g.fillStyle = bar; g.beginPath(); g.moveTo(-24, -1); g.lineTo(0, -13); g.lineTo(-2, -1); g.closePath(); g.fill();
    box(g, -2, -18, 4, 6, barD);
    for (let i = 0; i < 6; i++) { box(g, -27 + i * 10, 0, 4, 70, INK); box(g, -26 + i * 10, 0, 2, 70, bar); }
    for (const yy of [0, 66]) { box(g, -28, yy - 1, 56, 6, INK); box(g, -27, yy, 54, 4, barD); box(g, -27, yy, 54, 1, bar); }
  });
  c.restore();
};

/** A pile of bones: flat to the floor, a skull or two on it, dim. */
const bones = (c: Ctx, x: number) => {
  c.save(); c.translate(Math.round(x), GY);
  stamp(c, `hell-bones-${Math.floor(hash(x) * 3)}`, -40, -26, 80, 28, g => {
    const v = Math.floor(hash(x) * 3);
    poly(g, [[-36, 1], [-24, -9], [-6, -13], [14, -11], [30, -6], [37, 1]], INK);
    poly(g, [[-33, 0], [-23, -8], [-6, -11], [13, -9], [28, -5], [34, 0]], dress(BONE[1]));
    for (let i = 0; i < 6; i++) {
      const bx = -28 + i * 10 + ((i * 7 + v) % 5), by = -6 - ((i + v) % 3) * 2, len = 12 + ((i * 5) % 6);
      box(g, bx - 1, by - 1, len + 2, 4, INK); box(g, bx, by, len, 2, dress(BONE[3])); box(g, bx - 2, by - 1, 3, 4, dress(BONE[3])); box(g, bx + len - 1, by - 1, 3, 4, dress(BONE[3]));
    }
    // (the skull)
    const sx = -8 + v * 6;
    box(g, sx - 1, -22, 18, 16, INK); box(g, sx, -21, 16, 14, dress(BONE[3])); box(g, sx, -21, 16, 2, dress(BONE[4])); box(g, sx + 12, -19, 4, 12, dress(BONE[2]));
    box(g, sx + 3, -16, 4, 4, MURK); box(g, sx + 9, -16, 4, 4, MURK); box(g, sx + 7, -12, 2, 2, MURK); box(g, sx + 3, -9, 10, 2, dress(BONE[1]));
  });
  c.restore();
};

/** The arch into the demon's pit: two posts of stacked bones, a lintel of skulls. */
const arch = (c: Ctx) => {
  c.save(); c.translate(ARENA_IN, GY);
  stamp(c, 'hell-arch', -40, -262, 144, 264, g => {
    for (const px of [-20, 60]) {
      box(g, px - 2, -232, 28, 232, INK);
      box(g, px, -230, 24, 230, BONE[2]); box(g, px, -230, 4, 230, BONE[3]); box(g, px + 18, -230, 6, 230, BONE[1]);
      checker(g, px + 4, -230, 2, 230, BONE[3]); checker(g, px + 16, -230, 2, 230, BONE[1], 1);
      // (the bones it's stacked from: knuckled ends sticking out)
      for (let y = -220; y < 0; y += 20) {
        const o = ((y / 20) & 1) ? -3 : 3;
        box(g, px - 4 + o, y - 1, 32, 8, INK); box(g, px - 3 + o, y, 30, 6, BONE[3]); box(g, px - 3 + o, y, 30, 2, BONE[4]);
        box(g, px - 5 + o, y - 2, 5, 10, INK); box(g, px - 4 + o, y - 1, 3, 8, BONE[4]);
        box(g, px + 26 + o, y - 2, 5, 10, INK); box(g, px + 27 + o, y - 1, 3, 8, BONE[2]);
      }
      box(g, px - 4, -6, 32, 6, INK); box(g, px - 3, -5, 30, 5, BASALT[3]);
    }
    // (the lintel: skulls in a row)
    box(g, -32, -252, 128, 30, INK); box(g, -30, -250, 124, 26, BONE[1]);
    for (let i = 0; i < 4; i++) {
      const sx = -26 + i * 30;
      box(g, sx - 1, -249, 22, 24, INK); box(g, sx, -248, 20, 22, BONE[3]); box(g, sx, -248, 20, 3, BONE[4]); box(g, sx + 15, -246, 5, 20, BONE[2]);
      box(g, sx + 3, -241, 6, 6, INK); box(g, sx + 11, -241, 6, 6, INK); box(g, sx + 9, -234, 2, 3, INK);
      for (let t = 0; t < 4; t++) box(g, sx + 4 + t * 3, -229, 2, 3, BONE[4]);
      box(g, sx + 4, -230, 12, 1, INK);
    }
  });
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The shaft (the rock either side of it, far up; its back wall)

/** Foreground rock (the shaft's sides): basalt in big columns, world-anchored (a tile). */
const rockPattern = (c: Ctx) => tilePattern(c, 'hell-rockwall2', 96, 160, g => {
  // (columns, each lit on its left, shaded on its right, broken across here and there by an inked crack)
  const r = BASALT;
  for (let i = 0; i < 4; i++) {
    const x = i * 24, k = hash(i * 7.7);
    box(g, x, 0, 24, 160, r[k < 0.5 ? 3 : 2]);
    box(g, x, 0, 2, 160, r[4]); checker(g, x + 2, 0, 2, 160, r[4]);
    box(g, x + 21, 0, 3, 160, r[1]); checker(g, x + 19, 0, 2, 160, r[1], 1);
    for (let j = 0; j < 2; j++) { const y = Math.floor(hash(i * 3.1 + j * 5.3) * 150); box(g, x + 2, y, 19, 2, INK); box(g, x + 3, y + 2, 17, 1, r[4]); }
  }
});
/** The shaft's back wall: dim (far back: nothing on it to stand on), a tile. */
const backPattern = (c: Ctx) => tilePattern(c, 'hell-shaftback', 128, 140, g => {
  g.fillStyle = far(BASALT[3], 0.45); g.fillRect(0, 0, 128, 140);
  for (let x = 0; x < 128; x += 32) { g.fillStyle = far(BASALT[2], 0.4); g.fillRect(x + 28, 0, 4, 140); g.fillStyle = far(BASALT[4], 0.55); g.fillRect(x, 0, 2, 140); }
  for (const [y, x, w] of [[24, 6, 50], [70, 60, 46], [112, 20, 70]]) { g.fillStyle = far(BASALT[1], 0.3); g.fillRect(x, y, w, 2); g.fillStyle = far(BASALT[2], 0.4); g.fillRect(x + 4, y + 2, w - 8, 1); }
});

const drawShaft = (c: Ctx, state: GameState) => {
  const top = Math.max(SHAFT_TOP, state.camera.y - 60), bot = Math.min(GY, state.camera.y + CANVAS_HEIGHT + 60);
  if (bot <= top) return;
  // (the back wall)
  c.fillStyle = backPattern(c); c.fillRect(SHAFT_L, top, SHAFT_R - SHAFT_L, bot - top);
  // (the dark coming down from the top of it)
  if (top < SHAFT_TOP + 900) for (let i = 0; i < 6; i++) { const y = SHAFT_TOP + i * 150; c.fillStyle = MURK; c.globalAlpha = 0.6 - i * 0.1; c.fillRect(SHAFT_L, y, SHAFT_R - SHAFT_L, 150); }
  c.globalAlpha = 1;
  // (the rock either side: solid, inked along the face toward the shaft)
  for (const [a, b, rbot] of [[x0 - 200, SHAFT_L, LEFT_ROCK_BOTTOM], [SHAFT_R, SHAFT_R + RIGHT_ROCK_W, RIGHT_ROCK_BOTTOM]] as const) {
    const t = Math.max(SHAFT_TOP, state.camera.y - 60), bb = Math.min(rbot, state.camera.y + CANVAS_HEIGHT + 60);
    if (bb > t) {
      c.fillStyle = rockPattern(c); c.fillRect(a, t, b - a, bb - t);
      const face = a === SHAFT_R ? a : b - 6;
      box(c, face, t, 6, bb - t, a === SHAFT_R ? BASALT[5] : BASALT[2]);
      checker(c, a === SHAFT_R ? face + 6 : face - 2, t, 2, bb - t, a === SHAFT_R ? BASALT[5] : BASALT[2]);
      box(c, a === SHAFT_R ? a - 2 : b - 2, t, 2, bb - t, INK);
    }
    // (its underside: jagged, dark, inked: an overhang, not a ledge)
    if (rbot < GY && rbot > state.camera.y - 80 && rbot < state.camera.y + CANVAS_HEIGHT + 40) {
      const pts: [number, number][] = [[a, rbot]];
      for (let x = a; x <= b; x += 24) pts.push([x + 12, rbot + 8 + hash(x) * 14]);
      pts.push([b, rbot]);
      inkPoly(c, pts, BASALT[1], 2);
      box(c, a, rbot - 4, b - a, 4, BASALT[1]);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------

/** World space, behind: the shaft, the floor, rocks and slabs, the pit's set pieces, the dressing, the gate, the vent. */
/** How far past the screen's edges to draw (Satan's pulled the camera back: a lot further). */
const margin = (state: GameState) => (hellOf(state).fin?.full && (hellOf(state).fin?.rise ?? 0) > 0 ? 900 : 220);

export const drawHellWorld = (c: Ctx, state: GameState, o: { extraWreck: boolean; beaten: boolean }) => {
  const M = margin(state), cam = state.camera.x, f = state.frame, vis = (a: number, b: number) => b > cam - M && a < cam + CANVAS_WIDTH + M;
  if (vis(x0 - 200, SHAFT_R + RIGHT_ROCK_W)) drawShaft(c, state);
  // The floor, all but the pools
  let from = x0 - 200;
  for (const [a, b] of POOLS) { if (vis(from, a)) floor(c, Math.max(from, cam - M), Math.min(a, cam + CANVAS_WIDTH + M)); from = b; }
  if (vis(from, x1 + 200)) floor(c, Math.max(from, cam - M), Math.min(x1 + 200, cam + CANVAS_WIDTH + M));
  // (the dressing: cages hung on chains, bone piles)
  for (const [x, low] of CAGES) if (vis(x - 40, x + 40)) cage(c, x, low, f, state.camera.y);
  for (const x of BONES) if (vis(x - 40, x + 40)) bones(c, x);
  // Rocks (in the lava they go on down into it) and slabs
  for (const [x, top, w] of ROCKS) if (vis(x, x + w)) rock(c, x, top, w, overPool(x, w) ? GY + LAVA_DROP + 30 : GY);
  for (const [x, y, w] of LEDGES) if (vis(x, x + w)) slab(c, x, y, w);
  // The pit: the wreck, the bits
  if (vis(x0, WRECK_X + 700)) drawWreck(c, state, o.extraWreck);
  if (vis(x0 + 1350, x0 + 1550)) hellSign(c, x0 + 1520, GY, 'ABANDON ALL HOPE');
  // (the refill's spot, and the way into the demon's pit: an arch of bones, its sign)
  if (vis(REFILL_X - 200, ARENA_IN + 200)) {
    hellSign(c, REFILL_X - 130, GY, 'LAST REST STOP');
    arch(c);
    hellSign(c, ARENA_IN + 32, GY - 280, o.beaten ? "GONE TO DAD'S" : 'NO LOITERING', '#5A1010', '#FEF08A', true);
  }
  // (the vent: a ring of rock, glowing once it's live; its sign on a post)
  if (vis(VENT_X - 200, VENT_X + 200)) {
    rock(c, VENT_X - 46, GY - 12, 18, GY); rock(c, VENT_X + 28, GY - 12, 18, GY);
    box(c, VENT_X - 29, GY - 7, 58, 7, INK); box(c, VENT_X - 28, GY - 6, 56, 6, BASALT[1]);
    if (o.beaten) {
      const p = (f >> 3) % 3;
      box(c, VENT_X - 22, GY - 4, 44, 3, LAVA[2 + p]); box(c, VENT_X - 14, GY - 4, 28, 2, LAVA[4 + (p ? 1 : 0)]);
      if (f % 24 < 12) { box(c, VENT_X - 3, GY - 16, 6, 6, INK); box(c, VENT_X - 2, GY - 15, 4, 4, LAVA[6]); }
    } else box(c, VENT_X - 22, GY - 4, 44, 3, BASALT[0]);
    hellSign(c, VENT_X + 110, GY, 'EXPRESS TO SURFACE');
  }
};

/** Satan's lake: lava out behind the demon's pit (drawn before the floor, behind it). Its far shore first, then (after
 *  Satan, who comes up out of it) its surface, and the pit's back wall between it and the floor. */
export const drawLake = (c: Ctx, state: GameState, part: 'shore' | 'surface') => {
  const a = ARENA_IN - 300, b = VENT_X + 600, f = state.frame;
  const M = margin(state);
  if (b < state.camera.x - M || a > state.camera.x + CANVAS_WIDTH + M) return;
  const L = GY - 110, v0 = Math.max(a, state.camera.x - M), v1 = Math.min(b, state.camera.x + CANVAS_WIDTH + M);
  if (part === 'shore') {
    // (the far shore: low rock, dim, lit from the lake under it)
    for (let x = a - ((a) % 180); x < b; x += 180) {
      if (x + 180 < v0 || x > v1) continue;
      const k = hash(x * 0.01), hgt = 40 + k * 30;
      poly(c, [[x, L + 2], [x + 50, L - hgt], [x + 70, L - hgt + 8], [x + 120, L - 20], [x + 180, L + 2]], far(BASALT[2], 0.4));
      poly(c, [[x, L + 2], [x + 50, L - hgt], [x + 54, L - hgt + 6], [x + 10, L + 2]], far(BASALT[4], 0.5));
      box(c, x, L - 8, 180, 10, far(LAVA[1], 0.55)); checker(c, x, L - 12, 180, 4, far(LAVA[1], 0.55));
    }
    return;
  }
  // (the lake: dull next to the pools up front (it's far), but lava: in bands, the slow swell moving along it, crust)
  const bands = [far(LAVA[5], 0.35), far(LAVA[4], 0.35), far(LAVA[3], 0.4), far(LAVA[2], 0.4)];
  box(c, v0, L, v1 - v0, 40, bands[3]);
  box(c, v0, L, v1 - v0, 16, bands[2]); checker(c, v0, L + 16, v1 - v0, 2, bands[2]);
  box(c, v0, L, v1 - v0, 6, bands[1]); checker(c, v0, L + 6, v1 - v0, 2, bands[1]);
  box(c, v0, L, v1 - v0, 2, bands[0]);
  for (let x = v0 - (v0 % 40) + ((f >> 3) % 40); x < v1; x += 40) box(c, x, L + 3, 16, 2, far(LAVA[6], 0.35));
  for (let x = v0 - (v0 % 130); x < v1; x += 130) { const px = x + ((f * 0.2) % 130); box(c, px, L + 8, 30, 3, far(LAVA[0], 0.2)); box(c, px + 6, L + 7, 12, 1, far(LAVA[2], 0.3)); }
  // (the pit's back wall between it and the floor: rock, dim, its top in shadow: not something to stand on)
  c.fillStyle = backPattern(c); c.fillRect(v0, L + 40, v1 - v0, GY - L - 40);
  box(c, v0, L + 40, v1 - v0, 6, MURK); checker(c, v0, L + 46, v1 - v0, 2, MURK);
  // (its ends: the lake runs back into the rock)
  for (const [ex, s] of [[a, 1], [b, -1]] as [number, number][]) {
    if (ex < v0 - 100 || ex > v1 + 100) continue;
    poly(c, [[ex, L - 40], [ex + s * 60, L - 10], [ex + s * 90, L + 40], [ex, GY]], far(BASALT[2], 0.4));
  }
};
void sn; void hazeBands;
