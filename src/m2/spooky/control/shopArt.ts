// The gift shop's room, painted: a theme park's idea of hell, done on a gift shop's budget. Fiberglass "rock" in
// panels (the seams and the screws showing), plywood flames standing along the foot of the wall (a brace behind one),
// a painted lava strip, plastic stalactites, red rope lights along the top, a skull sconce or two; red carpet with a
// flame runner. Its stuff (the racks, the counter, the booth...) is shop.ts's. The back wall at WALL_D (paint.ts).

import type { GameState } from '../../../m1/game/core/state';
import { GY } from '../geometry';
import {
  INK, box, slab, pole, ball, rampOf, mix, checker, hazeBands, hash,
  WALL_D, CEIL, inDepth, spanAt, at, quad, seg, inked, wallRun, ceiling, backFloor, frontFloor, plaque, type Eye,
} from './paint';
import { signAt, print, haunt, candle } from '../letters';

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

/** A section's sign, hung from the ceiling on two chains. */
export const hangingSign = (c: Ctx, x: number, words: string) => {
  for (const dx of [-58, 56]) for (let y = CEIL; y < GY - 372; y += 6) { box(c, x + dx, y, 3, 4, INK); box(c, x + dx + 1, y + 1, 1, 2, '#A8A29E'); }
  plaque(c, x, GY - 360, words, '#450A0A', '#FDE68A', 8, '#78350F', candle(8, '#450A0A', '#FDE68A', false));
};

void pole; void ball;
