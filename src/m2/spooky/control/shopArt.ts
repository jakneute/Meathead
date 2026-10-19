// The gift shop's room, painted: a theme park's idea of hell, done on a gift shop's budget. Fiberglass "rock" in
// panels (the seams and the screws showing), plywood flames standing along the foot of the wall (a brace behind one),
// a painted lava strip, plastic stalactites, red rope lights along the top, a skull sconce or two; red carpet with a
// flame runner. Its stuff (the racks, the counter, the booth...) is shop.ts's. The back wall at WALL_D (paint.ts).

import type { GameState } from '../../../m1/game/core/state';
import { GY } from '../geometry';
import {
  INK, box, slab, pole, ball, rampOf, mix, checker, hazeBands, hash, stamp,
  WALL_D, CEIL, inDepth, spanAt, at, quad, seg, inked, wallRun, ceiling, backFloor, frontFloor, plaque, type Eye,
} from './paint';
import { signAt, print, haunt, candle, brand, fit } from '../letters';
import { BUFFET_X, BUFFET_W, SLUSH_X } from './geo';

type Ctx = CanvasRenderingContext2D;

const ROCK = '#4A1610', LAVA = ['#7C2D12', '#B33A0E', '#E2580F', '#F59E0B'];

/** A lump of fiberglass rock: an ink edge, its body, lit up its top left, shadowed under. */
const rock = (g: Ctx, cx: number, cy: number, rw: number, rh: number, col: string, seed: number) => {
  const r = rampOf(col), n = 8, pts: [number, number][] = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, j = 0.8 + hash(seed + i * 1.7) * 0.3; pts.push([cx + Math.cos(a) * rw * j, cy + Math.sin(a) * rh * j]); }
  const path = (k: number, dx = 0, dy = 0) => { g.beginPath(); pts.forEach(([x, y], i) => { const px = cx + (x - cx) * k + dx, py = cy + (y - cy) * k + dy; if (i) g.lineTo(px, py); else g.moveTo(px, py); }); g.closePath(); };
  path(1); g.fillStyle = INK; g.fill();
  path(0.94); g.fillStyle = r[1]; g.fill();
  path(0.8, -rw * 0.08, -rh * 0.1); g.fillStyle = col; g.fill();
  path(0.42, -rw * 0.32, -rh * 0.38); g.fillStyle = mix(col, r[3], 0.55); g.fill();
};

/** A stretch of the fiberglass rock (x0..x1, top..bottom): the gaps dark, lumps in rows, a seam at its left, the
 *  painted lava along its foot. For the passages' walls. */
export const rockWall = (g: Ctx, x0: number, x1: number, top: number, bottom: number, seed: number) => {
  g.save(); g.beginPath(); g.rect(x0, top, x1 - x0, bottom - top); g.clip();
  box(g, x0, top, x1 - x0, bottom - top, '#2A0806');
  for (let row = 0; row * 44 < bottom - top + 40; row++) for (let k = -1; k * 56 < x1 - x0 + 60; k++) {
    const s = seed * 31 + row * 13 + k * 7;
    rock(g, x0 + k * 56 + (row % 2) * 28 + (hash(s) - 0.5) * 12, top + 18 + row * 44, 27 + hash(s * 2.1) * 8, 20 + hash(s * 3.7) * 5, mix(ROCK, hash(s * 5.3) < 0.5 ? '#3A0A08' : '#7A2A18', 0.25), s);
  }
  box(g, x0, top, 2, bottom - top, '#140302'); box(g, x0 + 2, top, 1, bottom - top, '#7A2A18');
  for (let i = 0; i < 4; i++) box(g, x0, bottom - 24 + i * 6, x1 - x0, 7, LAVA[i]);
  g.restore();
};

/** A plywood flame standing on the floor (feet at x, y): red round orange round yellow, inked; flat as a board. */
const flameFlat = (g: Ctx, x: number, y: number, h: number, w: number, seed: number) => {
  const tongue = (k: number) => {
    g.beginPath(); g.moveTo(x, y);
    g.lineTo(x + w * 0.08 * k, y - h * 0.45 * k);
    g.lineTo(x + w * 0.22, y - h * 0.62 * k); g.lineTo(x + w * 0.3, y - h * 0.4 * k);
    g.lineTo(x + w * (0.45 + hash(seed) * 0.1), y - h * k);
    g.lineTo(x + w * 0.62, y - h * 0.5 * k); g.lineTo(x + w * 0.78, y - h * 0.72 * k);
    g.lineTo(x + w * (1 - 0.08 * k), y - h * 0.3 * k); g.lineTo(x + w, y); g.closePath();
  };
  tongue(1); g.strokeStyle = INK; g.lineWidth = 2; g.lineJoin = 'miter'; g.stroke(); g.fillStyle = '#B91C1C'; g.fill();
  g.save(); g.translate(x + w * 0.5, y); g.scale(0.7, 1); g.translate(-(x + w * 0.5), -y); tongue(0.72); g.fillStyle = '#EA580C'; g.fill(); g.restore();
  g.save(); g.translate(x + w * 0.5, y); g.scale(0.42, 1); g.translate(-(x + w * 0.5), -y); tongue(0.42); g.fillStyle = '#FBBF24'; g.fill(); g.restore();
};

const paintShopTile = (g: Ctx, x: number, v: number) => {
  const W = 320, top = CEIL - 260;
  box(g, x, top, W, CEIL - top + 4, '#0A0505');
  // (the rock: panels of it, lumps in rows; the gaps between dark)
  box(g, x, CEIL, W, GY - CEIL, '#2A0806');
  for (let row = 0; row < 11; row++) {
    const cy = CEIL + 28 + row * 50;
    for (let k = -1; k < 6; k++) {
      const s = v * 101 + row * 13 + k * 7;
      const cx = x + k * 62 + (row % 2) * 31 + (hash(s) - 0.5) * 16;
      rock(g, cx, cy + (hash(s * 1.3) - 0.5) * 10, 30 + hash(s * 2.1) * 10, 22 + hash(s * 3.7) * 6, mix(ROCK, hash(s * 5.3) < 0.5 ? '#3A0A08' : '#7A2A18', 0.25), s);
    }
  }
  // (the panels' seams, straight up, screwed down: it's fiberglass)
  for (const sx of [x + 6, x + 166]) { box(g, sx, CEIL, 2, GY - CEIL, '#140302'); box(g, sx + 2, CEIL, 1, GY - CEIL, '#7A2A18'); for (let y = CEIL + 30; y < GY - 40; y += 64) { box(g, sx - 2, y, 2, 2, '#A8A29E'); box(g, sx + 3, y, 2, 2, '#A8A29E'); } }
  // (dark up under the ceiling)
  hazeBands(g, x, CEIL, W, 160, '#0A0303', 0.7, 0, 6);
  // (plastic stalactites off the top)
  for (let k = 0; k < 6; k++) {
    const sx = x + 14 + k * 52 + hash(v * 9 + k) * 12, len = 26 + hash(v * 3 + k * 2) * 34, w = 14 + hash(k + v) * 8;
    inked(g, () => { g.moveTo(sx, CEIL - 2); g.lineTo(sx + w, CEIL - 2); g.lineTo(sx + w * 0.55, CEIL + len); g.closePath(); }, '#6B2418', 2);
    box(g, sx + 2, CEIL, 3, len * 0.5, '#8A3A26');
  }
  // (the painted lava strip along the foot)
  for (let i = 0; i < 4; i++) box(g, x, GY - 30 + i * 7, W, 8, LAVA[i]);
  for (let i = 1; i < 4; i++) checker(g, x, GY - 30 + i * 7, W, 2, LAVA[i - 1]);
  for (let k = 0; k < 10; k++) box(g, x + k * 32 + (v * 7 % 16), GY - 22 + (k % 3) * 5, 10, 2, '#FDE68A');
  // (the decor, one per panel)
  if (v === 0) {
    // a plastic skull sconce, a red bulb in each eye
    const sx = x + 230, sy = GY - 320;
    slab(g, sx - 16, sy + 20, 32, 10, '#3F2A20', { edge: 2 });
    inked(g, () => { g.ellipse(sx, sy, 15, 14, 0, 0, Math.PI * 2); }, '#E7E0CF', 2);
    box(g, sx - 9, sy + 8, 18, 10, '#E7E0CF'); box(g, sx - 9, sy + 17, 18, 1, INK);
    for (let i = 0; i < 4; i++) box(g, sx - 7 + i * 4, sy + 12, 1, 6, INK);
    box(g, sx - 9, sy - 3, 7, 7, '#7F1D1D'); box(g, sx + 2, sy - 3, 7, 7, '#7F1D1D'); box(g, sx - 7, sy - 1, 3, 3, '#EF4444'); box(g, sx + 4, sy - 1, 3, 3, '#EF4444');
    box(g, sx - 1, sy + 5, 2, 3, INK); box(g, sx - 10, sy - 10, 6, 2, '#F8F4EA');
  } else if (v === 1) {
    // a back shelf of mugs (dark: it's the wall's, not a ledge)
    const sx = x + 60, sy = GY - 220;
    box(g, sx, sy, 150, 6, '#2E0E0A'); box(g, sx, sy + 6, 150, 2, '#140302');
    for (let i = 0; i < 7; i++) { const mx = sx + 6 + i * 20; slab(g, mx, sy - 16, 13, 16, i % 2 ? '#2A2A2E' : '#C9B8A6', { edge: 1 }); box(g, mx + 2, sy - 10, 8, 3, '#B91C1C'); box(g, mx + 13, sy - 12, 3, 8, i % 2 ? '#2A2A2E' : '#C9B8A6'); }
  } else if (v === 2) {
    // EMPLOYEE OF THE MONTH: a framed photo of a fat balding guy in a headset, the same guy every month
    const sx = x + 120, sy = GY - 300;
    slab(g, sx, sy, 76, 96, '#A16207', { edge: 3 });
    box(g, sx + 6, sy + 6, 64, 62, '#7DA0C0'); box(g, sx + 6, sy + 6, 64, 20, '#93B4D0');
    inked(g, () => g.ellipse(sx + 38, sy + 70, 24, 18, 0, 0, Math.PI * 2), '#E7E5E4', 2);
    inked(g, () => g.ellipse(sx + 38, sy + 38, 14, 16, 0, 0, Math.PI * 2), '#E8B48A', 2);
    box(g, sx + 25, sy + 26, 4, 10, '#57534E'); box(g, sx + 47, sy + 26, 4, 10, '#57534E');
    box(g, sx + 32, sy + 36, 3, 3, INK); box(g, sx + 41, sy + 36, 3, 3, INK); box(g, sx + 33, sy + 46, 10, 2, '#9A5A40');
    box(g, sx + 22, sy + 30, 3, 14, '#27272A'); box(g, sx + 24, sy + 42, 8, 2, '#27272A');
    box(g, sx + 3, sy + 68, 70, 22, '#F1EFEA');
    signAt(g, 'EMPLOYEE', sx + 38, sy + 77, 6, print(6, '#7F1D1D'));
    signAt(g, 'OF THE MONTH', sx + 38, sy + 86, 6, print(6, '#7F1D1D'));
  } else {
    // a poster: WISH YOU WERE HERE, a devil on a beach chair
    const sx = x + 110, sy = GY - 330;
    slab(g, sx, sy, 90, 120, '#F59E0B', { edge: 3 });
    box(g, sx + 6, sy + 6, 78, 70, '#7F1D1D'); box(g, sx + 6, sy + 56, 78, 20, '#C2410C'); checker(g, sx + 6, sy + 54, 78, 2, '#C2410C');
    inked(g, () => { g.ellipse(sx + 45, sy + 40, 9, 10, 0, 0, Math.PI * 2); }, '#DC2626', 2);
    box(g, sx + 37, sy + 26, 3, 7, '#DC2626'); box(g, sx + 50, sy + 26, 3, 7, '#DC2626');
    box(g, sx + 30, sy + 50, 30, 4, '#FDE68A'); box(g, sx + 32, sy + 54, 2, 10, '#78350F'); box(g, sx + 56, sy + 54, 2, 10, '#78350F');
    signAt(g, 'WISH YOU', sx + 45, sy + 92, 7, haunt(7, '#450A0A'));
    signAt(g, 'WERE HERE', sx + 45, sy + 104, 7, haunt(7, '#450A0A'));
  }
  // (the plywood flames along the foot of the wall: three, one with its brace showing)
  for (let k = 0; k < 3; k++) {
    const fx = x + 8 + k * 104 + hash(v * 5 + k) * 20, h = 70 + hash(v * 7 + k * 3) * 60, w = 50 + hash(k * 9 + v) * 26;
    if (k === 1) { g.strokeStyle = '#6B4A2A'; g.lineWidth = 4; g.beginPath(); g.moveTo(fx + w * 0.5, GY - h * 0.6); g.lineTo(fx + w + 16, GY); g.stroke(); }
    flameFlat(g, fx, GY, h, w, v * 3 + k);
  }
};

/** The rope lights along the top of the wall (live: they chase). */
const ropeLights = (c: Ctx, eye: Eye, L: number, R: number, f: number) => {
  inDepth(c, eye, WALL_D, () => {
    const [s0, s1] = spanAt(eye, WALL_D, 10);
    const a = Math.max(L, s0), b = Math.min(R, s1);
    box(c, a, CEIL + 10, b - a, 1, '#3A0A08');
    const ph = Math.floor(f / 8);
    for (let x = Math.floor(a / 12) * 12; x < b; x += 12) box(c, x, CEIL + 9, 3, 3, (x / 12 + ph) % 3 ? '#B91C1C' : '#FCA5A5');
  });
};

/** The shop's room behind its stuff: the back wall, the ceiling, the floor. World x from L to R. */
export const drawShopRoom = (c: Ctx, state: GameState, eye: Eye, L: number, R: number) => {
  const f = state.frame;
  box(c, L, CEIL - 900, R - L, 900, '#0A0505');
  wallRun(c, eye, 'shop-wall', L, R, 320, 4, paintShopTile, 'rgba(16, 2, 2, 0.32)');
  ropeLights(c, eye, L, R, f);
  ceiling(c, eye, L, R, ['#120404', '#180606', '#1E0808', '#240A0A'], 160, '#2E0C0A');
  // (the track lights along the ceiling: a rail, cans pointed down)
  {
    const p0 = at(eye, L, CEIL, 0.93), p1 = at(eye, R, CEIL, 0.93);
    seg(c, [p0[0], p0[1] + 1], [p1[0], p1[1] + 1], '#3F3F46', 2);
    const [s0, s1] = spanAt(eye, 0.93, 40);
    for (let x = Math.ceil(Math.max(L, s0) / 320) * 320 + 100; x < Math.min(R, s1); x += 320) { const p = at(eye, x, CEIL, 0.93); box(c, p[0] - 4, p[1] + 1, 8, 10, INK); box(c, p[0] - 3, p[1] + 2, 6, 8, '#27272A'); box(c, p[0] - 2, p[1] + 9, 4, 1, '#FDE68A'); }
  }
  // (the carpet going back: red, banded darker toward the wall; a flame runner down it)
  backFloor(c, eye, L, R, ['#3A0A0A', '#4E0E0E', '#621414', '#741A1A'], 96, 'rgba(20, 2, 2, 0.35)');
  {
    const [s0, s1] = spanAt(eye, 0.94, 40);
    for (let x = Math.ceil(Math.max(L, s0) / 48) * 48; x < Math.min(R, s1); x += 48) {
      const a = at(eye, x, GY, 0.935), b = at(eye, x + 24, GY, 0.935), m = at(eye, x + 12, GY, 0.915);
      quad(c, '#9A3412', [a[0], a[1]], m, [b[0], b[1]], [m[0], a[1] + 2]);
      const m2 = at(eye, x + 12, GY, 0.925); box(c, m2[0] - 2, m2[1], 4, 2, '#EA580C');
    }
  }
  frontFloor(c, L, R, ['#6B1515', '#5A1111', '#480D0D', '#380A0A'], '#E05050');
  // (the runner, on the near floor too)
  for (let x = Math.floor(L / 48) * 48; x < R; x += 48) { box(c, x, GY + 10, 24, 6, '#8A2A10'); box(c, x + 8, GY + 8, 8, 4, '#C2410C'); box(c, x + 10, GY + 7, 4, 1, '#F59E0B'); }
};

// ---------------------------------------------------------------------------------------------------------------
// The ALL-YOU-CAN-EAT buffet against the back wall (wall units; Donnie's kind of place): a rack of snack bars, the
// steam table (wings, fries, meatballs, red jello) under its sneeze guard and heat lamps, the blood slushie machine,
// its sign up over it all on two posts. Background: dimmed a step (nothing on it to stand on), the sign kept bright.

const FOODS: [string, string, string][] = [['#B45309', '#D97706', '#78350F'], ['#FACC15', '#FDE68A', '#CA8A04'], ['#7C2D12', '#9A3412', '#451A03'], ['#DC2626', '#F87171', '#7F1D1D']];

const paintBuffet = (g: Ctx, x: number) => {
  // The snack bars: a wire gondola, five shelves of bars in their wrappers, SNACKS on its header card
  const sx = x;
  slab(g, sx, GY - 112, 46, 112, '#27272A', { edge: 2 });
  box(g, sx + 4, GY - 104, 38, 100, '#141416');
  for (let s = 0; s < 5; s++) {
    const y = GY - 100 + s * 19;
    box(g, sx + 3, y + 13, 40, 2, '#A1A1AA'); box(g, sx + 3, y + 15, 40, 1, '#3F3F46');
    for (let k = 0; k < 4; k++) {
      const col = ['#7C2D12', '#DC2626', '#2563EB', '#16A34A', '#F59E0B', '#7E22CE'][(s * 2 + k) % 6], r = rampOf(col);
      for (let j = 0; j < 2; j++) { box(g, sx + 5 + k * 9, y + 3 + j * 4, 8, 4, INK); box(g, sx + 6 + k * 9, y + 4 + j * 4, 6, 2, col); box(g, sx + 6 + k * 9, y + 4 + j * 4, 6, 1, r[3]); box(g, sx + 8 + k * 9, y + 5 + j * 4, 2, 1, '#F8FAFC'); }
    }
  }
  slab(g, sx + 4, GY - 128, 38, 14, '#FDE68A', { edge: 1 }); signAt(g, 'SNACKS', sx + 23, GY - 118, 6, print(6, '#7F1D1D'));
  box(g, sx + 21, GY - 114, 4, 2, '#3F3F46');
  // The steam table: a stainless front (flame decals on it: it's hell's), the pans in the top, the sneeze guard, the lamps
  const tx = x + 56, tw = 142, top = GY - 42;
  slab(g, tx, top, tw, 42, '#71717A', { edge: 3 });
  box(g, tx + 4, top + 10, tw - 8, 2, '#A1A1AA'); box(g, tx + 4, GY - 8, tw - 8, 6, '#3F3F46');
  for (let k = 0; k < 5; k++) { const fx = tx + 10 + k * 26; for (const [kk, col] of [[1, '#B91C1C'], [0.65, '#EA580C'], [0.35, '#FBBF24']] as const) { g.fillStyle = col; g.beginPath(); g.moveTo(fx + 10 - 10 * kk, GY - 10); g.lineTo(fx + 10, GY - 10 - 20 * kk); g.lineTo(fx + 10 + 10 * kk, GY - 10); g.closePath(); g.fill(); } }
  // (the pans: a hotel pan each, the food heaped in it, a serving spoon left in one)
  for (let k = 0; k < 4; k++) {
    const px = tx + 6 + k * 34, [c0, c1, c2] = FOODS[k];
    box(g, px - 1, top - 7, 34, 8, INK); box(g, px, top - 6, 32, 6, '#D4D4D8'); box(g, px, top - 6, 32, 1, '#F4F4F5');
    for (let i = 0; i < 7; i++) {
      const fx = px + 3 + i * 4, fy = top - 8 - (i % 3);
      if (k === 1) { box(g, fx, fy - 4, 2, 7, c2); box(g, fx, fy - 4, 1, 6, c1); }            // (fries)
      else if (k === 3) { box(g, fx - 1, fy - 2, 4, 4, c2); box(g, fx - 1, fy - 2, 3, 3, c0); box(g, fx - 1, fy - 2, 1, 1, c1); }  // (jello, shaking)
      else { ball(g, fx + 1, fy, 2.6, c0); box(g, fx, fy - 2, 2, 1, c1); }
    }
  }
  box(g, tx + 46, top - 20, 2, 14, '#A1A1AA'); box(g, tx + 44, top - 8, 6, 3, '#A1A1AA');
  // (the sneeze guard: glass on two posts, angled out, its edge catching the light)
  for (const gx of [tx + 4, tx + tw - 7]) { box(g, gx, top - 40, 3, 34, '#A1A1AA'); box(g, gx, top - 40, 1, 34, '#E4E4E7'); }
  g.fillStyle = 'rgba(186, 230, 253, 0.18)'; g.beginPath(); g.moveTo(tx + 2, top - 22); g.lineTo(tx + tw - 2, top - 22); g.lineTo(tx + tw + 4, top - 40); g.lineTo(tx - 4, top - 40); g.closePath(); g.fill();
  box(g, tx - 4, top - 41, tw + 8, 2, '#E0F2FE'); box(g, tx + 2, top - 23, tw - 4, 1, 'rgba(224, 242, 254, 0.6)');
  // (the heat lamps' bar, the lamps down off it)
  box(g, tx - 2, top - 62, tw + 4, 4, INK); box(g, tx - 1, top - 61, tw + 2, 2, '#52525B');
  for (let k = 0; k < 4; k++) { const lx = tx + 14 + k * 36; box(g, lx + 4, top - 58, 2, 6, '#3F3F46'); inked(g, () => { g.moveTo(lx, top - 44); g.lineTo(lx + 3, top - 52); g.lineTo(lx + 7, top - 52); g.lineTo(lx + 10, top - 44); g.closePath(); }, '#3F3F46', 1); }
  // (the stack of plates at its end; a tray)
  for (let i = 0; i < 6; i++) box(g, tx + tw + 4, GY - 6 - i * 3, 18, 3, i % 2 ? '#E7E5E4' : '#F8FAFC');
  box(g, tx + tw + 3, GY - 24, 20, 1, INK);
  // The blood slushie machine: a cabinet, two clear bowls of red slush (the auger's drawn live), its lit header, the taps,
  // a drip tray with a puddle in it, the cups stacked beside
  const mx = x + (SLUSH_X - BUFFET_X) - 24;
  slab(g, mx, GY - 46, 48, 46, '#7F1D1D', { edge: 3 });
  for (const bx of [mx + 3, mx + 25]) {
    box(g, bx - 1, GY - 85, 22, 40, INK);
    box(g, bx, GY - 84, 20, 38, '#3A0606');
    box(g, bx, GY - 64, 20, 18, '#B91C1C'); box(g, bx, GY - 64, 20, 2, '#F87171'); checker(g, bx, GY - 62, 20, 2, '#DC2626');
    box(g, bx + 2, GY - 82, 2, 34, 'rgba(255, 255, 255, 0.22)');
    box(g, bx + 7, GY - 50, 6, 6, '#27272A'); box(g, bx + 9, GY - 44, 2, 4, '#52525B');
  }
  slab(g, mx - 2, GY - 108, 52, 24, '#18181B', { edge: 2 });
  box(g, mx + 2, GY - 104, 44, 17, '#DC2626'); box(g, mx + 2, GY - 104, 44, 2, '#F87171');
  signAt(g, 'BLOOD', mx + 24, GY - 96, 6, print(6, '#FEF2F2', '#7F1D1D'));
  signAt(g, 'SLUSH', mx + 24, GY - 88, 6, print(6, '#FEF2F2', '#7F1D1D'));
  box(g, mx + 4, GY - 30, 40, 4, '#27272A'); box(g, mx + 10, GY - 29, 14, 2, '#991B1B');
  for (let i = 0; i < 7; i++) { box(g, mx + 52, GY - 6 - i * 4, 12, 4, INK); box(g, mx + 53, GY - 5 - i * 4, 10, 3, i % 2 ? '#F1EFEA' : '#E5E1D6'); box(g, mx + 53, GY - 4 - i * 4, 10, 1, '#DC2626'); }
  // (background: a step down toward the room's dark, so none of it reads as a ledge)
  g.fillStyle = 'rgba(16, 2, 2, 0.3)'; g.fillRect(x - 2, GY - 130, BUFFET_W + 6, 132);
  // The sign: ALL-YOU-CAN-EAT burned into a board, up on two posts off the back of the table, $6.66 hung under it
  const cx = tx + tw / 2;
  for (const dx of [-62, 58]) { box(g, cx + dx, GY - 150, 5, 86, INK); box(g, cx + dx + 1, GY - 150, 3, 86, '#44403C'); }
  slab(g, cx - 82, GY - 176, 164, 30, '#2A0A06', { edge: 2 });
  signAt(g, 'ALL-YOU-CAN-EAT', cx, GY - 156, 9, fit('ALL-YOU-CAN-EAT', brand(9, '#2A0A06'), 152));
  for (const dx of [-14, 12]) box(g, cx + dx, GY - 146, 1, 6, '#A8A29E');
  slab(g, cx - 20, GY - 140, 42, 13, '#FDE68A', { edge: 1 });
  signAt(g, '$6.66', cx + 1, GY - 131, 6, print(6, '#7F1D1D'));
};

/** The buffet, at the back wall: stamped, then its live bits (the lamps' glow, the slush going round, the steam). */
export const drawBuffet = (c: Ctx, eye: Eye, f: number) => {
  const [s0, s1] = spanAt(eye, WALL_D, 60);
  if (BUFFET_X + BUFFET_W < s0 || BUFFET_X - 20 > s1) return;
  inDepth(c, eye, WALL_D, () => {
    stamp(c, 'shop-buffet', BUFFET_X - 8, GY - 182, BUFFET_W + 16, 184, g => paintBuffet(g, BUFFET_X));
    const tx = BUFFET_X + 56, top = GY - 42;
    // (the heat lamps: lit orange, a stepped cone of light down onto the pans)
    for (let k = 0; k < 4; k++) {
      const lx = tx + 14 + k * 36, fl = (Math.floor(f / 9) + k) % 5 === 0 ? 0.7 : 1;
      box(c, lx + 2, top - 45, 6, 2, '#FDBA74');
      for (let i = 1; i <= 3; i++) { const w = 6 + i * 6; c.fillStyle = `rgba(251, 146, 60, ${(0.07 * fl * (4 - i)).toFixed(3)})`; c.fillRect(lx + 5 - w / 2, top - 43, w, 36); }
    }
    // (steam off the pans, in steps)
    for (let k = 0; k < 4; k++) { const t = ((f + k * 23) % 60) / 60, sx = tx + 20 + k * 34 + Math.sin(f * 0.05 + k) * 3; box(c, sx, top - 12 - t * 22, 4, 3, `rgba(230, 230, 230, ${(0.35 * (1 - t)).toFixed(2)})`); }
    // (the slush going round in each bowl: the auger's blade turning, the slush churning lighter and darker)
    const mx = SLUSH_X - 24;
    for (const [j, bx] of [[0, mx + 3], [1, mx + 25]] as const) {
      const ph = Math.floor(f / 6 + j * 2) % 4;
      box(c, bx + 9, GY - 82, 2, 34, '#5C0A0A');
      box(c, bx + 3 + ph * 3, GY - 76 + ph * 6, 14 - ph * 2, 2, '#7F1D1D');
      box(c, bx + 2 + ((ph + 2) % 4) * 4, GY - 60 + (ph % 2) * 4, 4, 2, '#F87171');
    }
  });
};

/** A section's sign, hung from the ceiling on two chains. */
export const hangingSign = (c: Ctx, x: number, words: string) => {
  for (const dx of [-58, 56]) for (let y = CEIL; y < GY - 372; y += 6) { box(c, x + dx, y, 3, 4, INK); box(c, x + dx + 1, y + 1, 1, 2, '#A8A29E'); }
  plaque(c, x, GY - 360, words, '#450A0A', '#FDE68A', 8, '#78350F', candle(8, '#450A0A', '#FDE68A', false));
};

void pole; void ball;
