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
import { hellOf } from './state';
import { type Ctx, INK, box, checker, mix, hash, PIX, dark, lite, stamp, BASALT, LAVA, BONE, IRON, LIP, poly, inkPoly, lip, basalt, hellSign, sn } from './paint';

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
const WALL: LayerSpec = {
  key: 'hell-wall', parallax: 0.08,
  paint: (g, w, h) => {
    // (columns of rock, each lit a little on its left by the falls)
    for (let x = 0; x < w; x += 22) {
      const k = hash(x * 0.37), top = 20 + k * 40;
      const col = far(BASALT[3], 0.6 + k * 0.08);
      g.fillStyle = col; g.fillRect(x, top, 22, h - top);
      g.fillStyle = far(BASALT[4], 0.72); g.fillRect(x, top, 2, h - top);
      g.fillStyle = far(BASALT[2], 0.6); g.fillRect(x + 19, top, 3, h - top);
      // (its top broken off: a jag)
      g.fillStyle = col; g.beginPath(); g.moveTo(x, top); g.lineTo(x + 8 + k * 6, top - 8 - k * 10); g.lineTo(x + 22, top); g.fill();
    }
    // (the falls: out of a crack, down the wall into a dull pool of glow at the bottom)
    for (const fx of FALLS) {
      const top = 40 + hash(fx) * 50;
      g.fillStyle = far('#1A0503', 0.2); g.fillRect(fx - 7, top - 6, 18, 8);
      g.fillStyle = '#5A1808'; g.fillRect(fx - 4, top, 12, h - top);
      g.fillStyle = '#74220A'; g.fillRect(fx - 2, top, 8, h - top);
      g.fillStyle = '#8E2E0E'; g.fillRect(fx, top, 3, h - top);
      checker(g, fx - 6, top, 2, h - top, '#5A1808', 0, 1);
      checker(g, fx + 8, top, 2, h - top, '#5A1808', 1, 1);
      // (where it lands: the splash, the glow up the wall)
      g.fillStyle = '#6A1E0A'; g.fillRect(fx - 14, h - 18, 32, 18);
      checker(g, fx - 20, h - 22, 44, 4, '#6A1E0A', 0, 1);
    }
    // (the glow off the lava, low down: in bands)
    hazeBands(g, 0, h - 90, w, 90, '#7A2208', 0, 0.28, 6, 1);
  },
};

const STALACTITES: LayerSpec = {
  key: 'hell-stalactites', parallax: 0.15,
  paint: (g, w) => {
    for (let i = 0; i < 18; i++) {
      const x = (i * 37 + hash(i) * 20) % w, len = 30 + hash(i * 3.1) * 70, half = 6 + hash(i * 5.3) * 10;
      for (const dx of [-w, 0, w]) {
        const cx = x + dx;
        g.fillStyle = far(BASALT[2], 0.3); g.beginPath(); g.moveTo(cx - half, 0); g.lineTo(cx + half, 0); g.lineTo(cx + 1, len); g.closePath(); g.fill();
        // (lit down its left side, from below)
        g.fillStyle = far(BASALT[4], 0.4); g.beginPath(); g.moveTo(cx - half, 0); g.lineTo(cx - half + 3, 0); g.lineTo(cx + 1, len); g.lineTo(cx, len - 2); g.closePath(); g.fill();
        g.fillStyle = far(BASALT[1], 0.2); g.beginPath(); g.moveTo(cx + half - 3, 0); g.lineTo(cx + half, 0); g.lineTo(cx + 1, len); g.closePath(); g.fill();
        g.fillStyle = far('#7A2A10', 0.35); g.fillRect(cx, len - 3, 2, 2);
      }
    }
    // (the roof itself, a band of rock along the top)
    g.fillStyle = far(BASALT[1], 0.2); g.fillRect(0, 0, w, 8);
    checker(g, 0, 8, w, 2, far(BASALT[1], 0.2), 0, 1);
  },
};

/** Rock spires going back: the far row (lit from under, dim), then a nearer, darker one. */
const spires = (g: CanvasRenderingContext2D, w: number, h: number, seed: number, base: number, amp: number, col: string, lit: string) => {
  for (const dx of [-w, 0, w]) {
    let x = 0;
    while (x < w) {
      const k = hash(seed + x * 0.13), sw = 26 + k * 50, sh = base + hash(seed + x * 0.71) * amp, cx = x + dx;
      g.fillStyle = col; g.beginPath(); g.moveTo(cx - 4, h); g.lineTo(cx + sw * 0.35, h - sh); g.lineTo(cx + sw * 0.5, h - sh - 6); g.lineTo(cx + sw * 0.62, h - sh + 4); g.lineTo(cx + sw + 4, h); g.closePath(); g.fill();
      // (the lava's light up its left flank, stepped)
      g.fillStyle = lit; g.beginPath(); g.moveTo(cx - 4, h); g.lineTo(cx + sw * 0.35, h - sh); g.lineTo(cx + sw * 0.35 + 3, h - sh + 4); g.lineTo(cx + 2, h); g.closePath(); g.fill();
      x += sw * 0.7;
    }
  }
};
const RIDGE_FAR: LayerSpec = {
  key: 'hell-ridge-far', parallax: 0.32,
  paint: (g, w, h) => {
    spires(g, w, h, 11, 60, 80, '#1E0806', '#3A1209');
    hazeBands(g, 0, h - 50, w, 50, '#6A1C08', 0, 0.22, 5, 1);
  },
};
const RIDGE_NEAR: LayerSpec = {
  key: 'hell-ridge-near', parallax: 0.55,
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
// The pit's wreck: the riders, in bits (a theme park's own: the ride's souvenir shirts on them)

const SKIN = ['#F1C27D', '#8D5524', '#C68642', '#FFDBAC', '#5C3A1E'];
const HAIR = ['#2C1B10', '#E6C36A', '#7C2D12', '#18181B', '#A8A29E'];
const CLOTH = ['#1D4ED8', '#15803D', '#9333EA', '#DB2777', '#CA8A04'];
const BLOOD = ['#2E0404', '#5B0A0A', '#7F1111', '#9E1B1B', '#C03030'];

/** A slab in steps with an ink line (a sleeve, a shin): lit top, shaded bottom. */
const piece = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => {
  box(c, x - 1, y - 1, w + 2, h + 2, INK);
  box(c, x, y, w, h, col);
  box(c, x, y, w, Math.max(1, Math.round(h * 0.3)), lite(col, 0.2));
  box(c, x, y + h - Math.max(1, Math.round(h * 0.3)), w, Math.max(1, Math.round(h * 0.3)), dark(col, 0.25));
  checker(c, x, y + Math.round(h * 0.3), w, 1, lite(col, 0.2));
};
/** The torn end: meat, the bone in it. */
const stump = (c: Ctx, x: number, y: number, h: number) => {
  box(c, x - 4, y - h - 1, 9, h + 2, INK);
  box(c, x - 3, y - h, 7, h, BLOOD[3]); box(c, x - 3, y - h, 2, h, BLOOD[4]); box(c, x + 2, y - h, 2, h, BLOOD[2]);
  box(c, x - 1, y - h + 3, 3, h - 6, BONE[4]); box(c, x + 1, y - h + 3, 1, h - 6, BONE[2]);
};
const leg = (c: Ctx, x: number, y: number, s: number, i: number) => {
  const x2 = s > 0 ? x : x - 56;
  piece(c, x2, y - 13, 56, 13, CLOTH[i % 5]);
  // (the shoe)
  const sx = s > 0 ? x + 56 : x - 74;
  piece(c, sx, y - 15, 18, 15, '#D8D8D8'); box(c, sx, y - 4, 18, 4, '#8A8A8A'); box(c, sx + 2, y - 12, 10, 1, '#F8F8F8');
  stump(c, x, y, 13);
};
const arm = (c: Ctx, x: number, y: number, s: number, i: number) => {
  const x2 = s > 0 ? x : x - 40;
  piece(c, x2, y - 10, 40, 10, CLOTH[(i + 2) % 5]);
  const hx = s > 0 ? x + 40 : x - 54, sk = SKIN[i % 5];
  piece(c, hx, y - 10, 14, 10, sk);
  box(c, s > 0 ? hx + 12 : hx - 4, y - 8, 6, 4, sk); box(c, s > 0 ? hx + 12 : hx - 4, y - 9, 6, 1, INK);
  stump(c, x, y, 10);
};
const head = (c: Ctx, x: number, y: number, i: number) => {
  const sk = SKIN[i % 5];
  box(c, x - 15, y - 33, 30, 33, INK);
  box(c, x - 14, y - 28, 28, 28, sk); box(c, x - 14, y - 28, 4, 28, lite(sk, 0.15)); box(c, x + 9, y - 28, 5, 28, dark(sk, 0.2));
  box(c, x - 14, y - 32, 28, 9, HAIR[i % 5]); box(c, x - 14, y - 32, 28, 2, lite(HAIR[i % 5], 0.25));
  // (dead: crossed out, the tongue out)
  for (const ex of [x - 7, x + 5]) { box(c, ex - 2, y - 19, 2, 2, INK); box(c, ex + 2, y - 19, 2, 2, INK); box(c, ex, y - 17, 2, 2, INK); box(c, ex - 2, y - 15, 2, 2, INK); box(c, ex + 2, y - 15, 2, 2, INK); }
  box(c, x - 6, y - 9, 12, 4, '#3A0808'); box(c, x - 2, y - 7, 5, 5, '#E87A90');
  box(c, x - 12, y - 3, 24, 3, BLOOD[3]); box(c, x - 17, y - 1, 34, 2, BLOOD[2]);
};
/** A pool of blood on the floor: flat, in bands, a few drops off it. */
const pool = (c: Ctx, x: number, w: number) => {
  poly(c, [[x - w, GY + 2], [x - w * 0.8, GY - 2], [x + w * 0.7, GY - 2], [x + w, GY + 2]], BLOOD[1]);
  box(c, x - w * 0.6, GY - 2, w * 1.1, 2, BLOOD[2]);
  box(c, x - w * 0.4, GY - 2, w * 0.4, 1, BLOOD[4]);
  for (let k = 0; k < 4; k++) box(c, x - w + ((k * 53) % (w * 2)), GY - 4 - (k % 2) * 2, 4, 2, BLOOD[2]);
};
/** A rider hanging half out of a car's doors, the ride's souvenir shirt on him (at x, his chest's top at y). */
const rider = (c: Ctx, x: number, y: number, i: number) => {
  piece(c, x, y, 36, 32, CLOTH[i % 5]);
  const sk = SKIN[i % 5];
  piece(c, x + 36, y + 4, 24, 24, sk); box(c, x + 34, y - 1, 27, 8, INK); box(c, x + 35, y, 25, 6, HAIR[i % 5]);
  box(c, x + 46, y + 12, 2, 2, INK); box(c, x + 50, y + 12, 2, 2, INK); box(c, x + 48, y + 14, 2, 2, INK); box(c, x + 46, y + 16, 2, 2, INK); box(c, x + 50, y + 16, 2, 2, INK);
  box(c, x + 50, y + 22, 8, 3, '#3A0808'); box(c, x + 54, y + 24, 3, 4, '#E87A90');
  box(c, x + 2, y + 34, 30, 34, BLOOD[2]); box(c, x + 4, y + 34, 6, 30, BLOOD[3]); box(c, x + 24, y + 34, 8, 36, BLOOD[1]);
  c.font = '5px "Press Start 2P"'; c.fillStyle = INK; c.fillText('I RODE', x + 2, y + 15); c.fillText('IT!', x + 9, y + 23);
  c.fillStyle = '#FDE68A'; c.fillText('I RODE', x + 1, y + 14); c.fillText('IT!', x + 8, y + 22);
};

/** The two wrecked elevators at the bottom of the pit (both shafts' cars came down when the tower went: one on its
 *  side against the other), and both cars' riders, in bits, all over. */
const drawWreck = (c: Ctx, state: GameState, extra: boolean) => {
  const f = state.frame, W = WRECK_X, B = WRECK_B_X;
  // (the floor's share: the blood, under it all; spatter up the shaft wall)
  c.save(); c.translate(W, 0);
  stamp(c, 'hell-pit-floor', -440, GY - 200, 1240, 212, g => {
    g.translate(-W, 0);
    pool(g, B, 110); pool(g, W, 150); pool(g, W + 260, 70); pool(g, W + 400, 40); pool(g, W + 320, 50); pool(g, W + 560, 60);
    for (let k = 0; k < 9; k++) { const sx = W - 120 + k * 31, sy = GY - 170 - ((k * 37) % 70); box(g, sx, sy, 6 + (k % 3) * 4, 4 + (k % 2) * 4, BLOOD[1]); box(g, sx + 2, sy + 4, 2, 6 + (k % 3) * 3, BLOOD[1]); }
  });
  c.restore();
  // (the other car, on its side, its riders' share)
  drawWreckedCar(c, B + 63, GY - 58, -Math.PI / 2, f);
  c.save(); c.translate(B, 0);
  stamp(c, 'hell-pit-b', -100, GY - 160, 200, 162, g => {
    g.translate(-B, 0);
    box(g, B - 63, GY - 113, 126, 2, LIP[0]); box(g, B - 63, GY - 111, 126, 2, LIP[1]);
    rider(g, B - 20, GY - 150, 3);
    head(g, B + 40, GY - 112, 0); arm(g, B - 60, GY - 112, -1, 1);
    leg(g, B - 80, GY, -1, 4); arm(g, B + 20, GY, -1, 2);
  });
  c.restore();
  // (the cable down the shaft, snapped, swinging a little: stepped strands)
  const sw = Math.round(Math.sin(f * 0.02) * 12);
  for (const [col, w] of [[INK, 4], [IRON[3], 2]] as [string, number][]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(W + 10, SHAFT_TOP); c.quadraticCurveTo(W + 10 + sw, GY - 600, W - 10, GY - 140); c.stroke(); }
  if (extra) drawWreckedCar(c, W + 250, GY, 0.2, f);
  drawWreckedCar(c, W, GY, 0, f, true);
  // (one hanging half out of its doors; the bits)
  c.save(); c.translate(W, 0);
  stamp(c, 'hell-pit-bits', -40, GY - 80, 760, 82, g => {
    g.translate(-W, 0);
    rider(g, W + 56, GY - 70, 0);
    leg(g, W + 420, GY, -1, 0); leg(g, W + 200, GY, -1, 1); leg(g, W + 330, GY, 1, 2);
    arm(g, W + 560, GY, -1, 3); arm(g, W + 150, GY, 1, 4); arm(g, W + 470, GY, -1, 0);
    head(g, W + 300, GY, 1); head(g, W + 650, GY, 2); head(g, W + 240, GY, 3); head(g, W + 520, GY, 4);
    // (a ribcage)
    const rx = W + 600;
    box(g, rx - 1, GY - 6, 58, 6, INK); box(g, rx, GY - 5, 56, 4, BONE[3]);
    for (let i = 0; i < 6; i++) { box(g, rx + 3 + i * 9, GY - 25, 6, 21, INK); box(g, rx + 4 + i * 9, GY - 24, 4, 20, BONE[3]); box(g, rx + 4 + i * 9, GY - 24, 1, 20, BONE[4]); }
    box(g, rx - 1, GY - 26, 58, 6, INK); box(g, rx, GY - 25, 56, 4, BONE[3]); box(g, rx, GY - 25, 56, 1, BONE[4]);
    // (guts, in a loop)
    for (const [col, w] of [[INK, 8], ['#9D174D', 6], ['#DB5A8E', 2]] as [string, number][]) {
      g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(W + 90, GY - 3); g.bezierCurveTo(W + 110, GY - 40, W + 150, GY + 6, W + 170, GY - 20); g.stroke();
    }
    // (the ride's photo strip, and a hat)
    piece(g, W + 380, GY - 5, 18, 4, '#F4F4F4');
    piece(g, W + 470, GY - 14, 24, 9, '#232327'); piece(g, W + 464, GY - 5, 36, 4, '#232327');
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
