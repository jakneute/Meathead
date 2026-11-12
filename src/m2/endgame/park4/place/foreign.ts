// HELICOPTER HARRY's place in hell (WRATH): HELL'S AMERICA PAVILION. He shot at everything: clouds, birds, his own dad.
// Down here nothing he shoots stays shot. Out past the dig a firing range runs to the horizon, every target back up with
// its holes taped over, the flag on the pavilion's pole shot to rags and sewn back up; along the berm's top pop-up
// targets bandaged and propped back up, sandbags, heaps of his spent brass, burning barrels, and the range's sign. Ash
// gray and dull red, a sun like a hot coal, muzzle flashes going off far off (somebody down here's always shooting).
// The Statue's his too (rf/foreign.ts: raised and stitched, as she died); the wrecked landmark mechs on the berm are
// the land's, left as they lie.
//
//   - the sky (screen space, the land's hidden; its horizon at the scene's: foreign/harry/scene.ts HOR): banded ash to
//     a dull red glow, the coal sun, smoke banks; a far range of targets slid by the camera, muzzle flashes live;
//   - along the berm's top (foreign/harry/scene.ts SCENE_HOOKS.berm, after the berm and its wrecks, before the slab):
//     painted once, opaque; the barrels' fires live.

import type { GameState } from '../../../../m1/game/core/state';
import type { HellPlace } from '../defs';
import { HOR } from '../../../foreign/harry/scene';
import { VIEW_X, BERM_Y } from '../../../foreign/harry/arena';
import { pixelBlob } from '../../../../m1/game/render/pixelArt';
import {
  type Ctx, W, H, INK, h01, box, poly, line, bake, strip, skull, flame, motes,
  bandedGradient, hazeBands, steppedGlow, IRONK,
} from './kitPA';

const CARD = ['#3A3020', '#5E5034', '#86764E', '#A8986A', '#C8BA8A', '#E6DAAE'];
const TAPE = ['#5A4A2A', '#8A7A4A', '#B8A86A', '#D8CC8E'];
const BRASS = ['#3A2A08', '#6A4E10', '#9A7A1C', '#C8A42E', '#E8CC5A', '#FFF0A0'];
const SAND = ['#2A2216', '#463A26', '#645438', '#80704A', '#9C8C62'];
const FIRE = ['#FFF0A0', '#FAB040', '#E06A1C', '#8A2A10'];

// ---------------------------------------------------------------------------------------------------------------
// The sky (screen space)

const paintSky = (g: Ctx) => {
  bandedGradient(g, 0, 0, W, HOR, ['#0C0808', '#140E0E', '#1E1414', '#2A1A18', '#3A201C', '#4E281E', '#66301E', '#7E3A1E', '#964620'], 16);
  box(g, 0, HOR, W, H - HOR, '#140E0C');
  // (the sun: a coal, hot in the middle, ash crusting it)
  const sx = 600, syy = 120;
  steppedGlow(g, sx, syy, 110, '#C8501A', 0.18, 0, 6);
  g.fillStyle = INK; g.beginPath(); g.arc(sx, syy, 30, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#8A2A10'; g.beginPath(); g.arc(sx, syy, 28, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#C8501A'; g.beginPath(); g.arc(sx - 2, syy - 2, 21, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#F08A30'; g.beginPath(); g.arc(sx - 4, syy - 4, 12, 0, Math.PI * 2); g.fill();
  for (let k = 0; k < 14; k++) { const a = h01(k * 3.1) * Math.PI * 2, r = 8 + h01(k * 1.7) * 18; box(g, sx + Math.cos(a) * r - 2, syy + Math.sin(a) * r - 1, 4 + (k % 3), 2, k % 2 ? '#4A1A0C' : '#2A100A'); }
  // (smoke banks: ash, the low ones lit red under)
  for (let k = 0; k < 26; k++) {
    const x = h01(k * 4.3) * (W + 200) - 100, y = 16 + h01(k * 2.9) * (HOR - 60), rw = 50 + h01(k * 6.7) * 120, rh = 5 + h01(k * 1.3) * 9;
    if (Math.abs(x - sx) < 70 && Math.abs(y - syy) < 44) continue;
    pixelBlob(g, x, y + 3, rw, rh, y > HOR - 140 ? '#5A2A1C' : '#2A2020');
    pixelBlob(g, x + 6, y, rw * 0.92, rh * 0.8, y > HOR - 140 ? '#241818' : '#140E0E');
  }
};

/** The range out past the dig: a berm of its own, rows of targets on their frames to the horizon (every hole taped),
 *  the pavilion's flagpole with the flag shot to rags and sewn back up, a watchtower. A tile 1000 wide, 150 tall. */
const TW = 1000, TH = 150;
const FLASH: [number, number][] = [];
const target = (g: Ctx, x: number, y: number, s: number, col: string, tape: string) => {
  // (a man-shaped target: head, shoulders, on a frame)
  const u = (n: number) => Math.max(1, Math.round(n * s));
  box(g, x - u(1), y - u(4), u(1), u(4), INK); box(g, x + u(6), y - u(4), u(1), u(4), INK);
  box(g, x - u(5), y - u(20), u(16), u(16), col); poly(g, [[x - u(5), y - u(10)], [x - u(1), y - u(14)], [x + u(7), y - u(14)], [x + u(11), y - u(10)], [x + u(11), y - u(4)], [x - u(5), y - u(4)]], col);
  box(g, x, y - u(24), u(6), u(6), col);
  if (s > 0.6) { box(g, x + u(1), y - u(12), u(4), 1, tape); box(g, x + u(3), y - u(14), 1, u(4), tape); box(g, x + u(2), y - u(22), u(2), 1, tape); }
};
const paintRange = (g: Ctx) => {
  // (three rows going off, smaller and hazier each)
  const rows: [number, number, string, string, number][] = [[TH - 70, 0.45, '#4A3A30', '#6A5A44', 34], [TH - 50, 0.65, '#5A4636', '#86764E', 46], [TH - 26, 0.9, '#6A5440', '#A8986A', 62]];
  for (const [y, s, col, tape, gap] of rows) {
    box(g, 0, y, TW, TH - y, '#1E1612');
    for (let x = 6; x < TW; x += gap) { target(g, x + (h01(x * 0.3 + y) * 8 | 0), y, s, col, tape); if (h01(x + y) > 0.86) FLASH.push([x + 4, y - 14 * s]); }
    hazeBands(g, 0, y - 20, TW, 24, '#3A2420', 0, 0.45, 4, 2);
    box(g, 0, y, TW, 1, '#2E2218');
  }
  // (the flagpole: the flag shot to rags, stitched back together, stars and stripes in ash colors)
  const fx = 640, fy = TH - 26;
  box(g, fx - 1, fy - 120, 3, 120, INK); box(g, fx, fy - 120, 1, 120, '#7A6A66'); box(g, fx - 3, fy - 124, 7, 5, BRASS[3]);
  for (let r = 0; r < 7; r++) {
    const yy = fy - 118 + r * 5, len = 64 - (r % 3) * 9;
    for (let x = 0; x < len; x += 2) { const rag = h01(r * 7 + x * 0.3) > 0.9; if (rag) continue; box(g, fx + 2 + x, yy + Math.round(Math.sin(x * 0.12 + r) * 1.5), 2, 5, r % 2 ? '#C8C0B8' : '#8A2A20'); }
  }
  box(g, fx + 2, fy - 118, 26, 17, '#1E2A4A'); for (let k = 0; k < 6; k++) box(g, fx + 5 + (k % 3) * 8, fy - 115 + Math.floor(k / 3) * 7, 2, 2, '#C8C0B8');
  // (the stitches across it: black thread in a zig where it's been sewn up)
  for (const [x0, y0, x1, y1] of [[fx + 12, fy - 120, fx + 30, fy - 90], [fx + 40, fy - 118, fx + 48, fy - 88]] as const) {
    line(g, [[x0, y0], [x1, y1]], INK, 1);
    for (let t = 0; t <= 1; t += 0.12) { const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; line(g, [[x - 2, y - 1], [x + 2, y + 1]], INK, 1); }
  }
  // (a range tower, its light)
  const tx = 220;
  for (const lx of [tx - 14, tx + 12]) box(g, lx, TH - 90, 2, 64, '#2A2020');
  box(g, tx - 20, TH - 104, 42, 16, '#2A2020'); poly(g, [[tx - 24, TH - 104], [tx + 1, TH - 116], [tx + 26, TH - 104]], '#2A2020'); box(g, tx - 14, TH - 100, 30, 6, '#7E3A1E');
  steppedGlow(g, tx + 1, TH - 97, 22, '#F08A30', 0.2, 0, 3);
};

const drawRangeLive = (c: Ctx, state: GameState) => {
  const f = state.frame, off = (state.camera.x - VIEW_X) * 0.12, y0 = HOR - TH + 6;
  const cv = bake('rf4-fo-range', TW, TH, paintRange);
  strip(c, cv, off, y0);
  // (muzzle flashes, here and there, a frame or two each: nobody down here ever stops)
  for (let i = 0; i < FLASH.length; i++) {
    const t = (f + i * 37) % (90 + (i * 13) % 70);
    if (t > 2) continue;
    const x = ((FLASH[i][0] - off) % TW + TW) % TW;
    for (const xx of [x, x + TW, x - TW]) if (xx > -4 && xx < W + 4) { c.fillStyle = FIRE[t === 0 ? 0 : 1]; c.fillRect(Math.round(xx), Math.round(y0 + FLASH[i][1]), 3, 2); c.fillRect(Math.round(xx) + 1, Math.round(y0 + FLASH[i][1]) - 1, 1, 4); }
  }
  motes(c, f, 18, ['#5A4E4C', '#786A66', '#3A3030'], true, 0.5);
  motes(c, f + 700, 6, [FIRE[1], FIRE[2]], false, 0.8);
};

export const foreignPlace: HellPlace = {
  light: { dark: 0.3, shade: [24, 8, 6], grade: '#ECCFC0' },
  sky: { paint: paintSky, alpha: 1 },
  skyLive: drawRangeLive,
};

// ---------------------------------------------------------------------------------------------------------------
// Along the berm's top (world space; the shot's x from VIEW_X; feet on BERM_Y)

/** A pop-up target on its hinge: man-shaped card, the rings, holes taped over in crosses (healed back up), propped
 *  with a stick where the hinge gave. */
const popTarget = (g: Ctx, x: number, y: number, seed: number) => {
  const C = CARD, lean = (h01(seed) - 0.5) * 0.12;
  g.save(); g.translate(x, y); g.transform(1, 0, lean, 1, 0, 0);
  box(g, -14, -6, 28, 6, INK); box(g, -13, -5, 26, 4, IRONK[3]); box(g, -13, -5, 26, 1, IRONK[5]);
  const body: [number, number][] = [[-14, -6], [-14, -30], [-8, -38], [-6, -40], [-6, -50], [6, -50], [6, -40], [8, -38], [14, -30], [14, -6]];
  poly(g, body.map(([a, b]) => [a * 1.1, b - 1]), INK);
  poly(g, body, C[3]);
  box(g, -13, -30, 4, 24, C[4]); box(g, 10, -30, 4, 24, C[2]); box(g, -5, -49, 3, 9, C[4]);
  // (the rings)
  g.strokeStyle = C[1]; g.lineWidth = 1;
  for (const r of [10, 6, 2]) { g.beginPath(); g.ellipse(0, -22, r, r * 1.1, 0, 0, Math.PI * 2); g.stroke(); }
  // (holes, taped in crosses; one fresh one, still open)
  for (let k = 0; k < 5; k++) {
    const hx = (h01(seed * 3 + k) - 0.5) * 18, hy = -12 - h01(seed * 5 + k) * 34;
    if (k === 4) { box(g, hx, hy, 2, 2, INK); continue; }
    box(g, hx - 3, hy, 7, 2, TAPE[2]); box(g, hx, hy - 3, 2, 7, TAPE[2]); box(g, hx - 3, hy, 7, 1, TAPE[3]);
  }
  g.restore();
  // (the stick propping it back up)
  line(g, [[x + 6, y - 30], [x + 22, y]], INK, 3); line(g, [[x + 6, y - 30], [x + 22, y]], '#7A5A34', 1);
};
const sandbags = (g: Ctx, x: number, y: number, n: number) => {
  for (let r = 0; r < 2; r++) for (let k = 0; k < n - r; k++) {
    const bx = x + k * 18 + r * 9, by = y - 9 - r * 9;
    pixelBlob(g, bx + 8, by + 4, 10, 6, INK, 1); pixelBlob(g, bx + 8, by + 4, 9, 5, SAND[2], 1); pixelBlob(g, bx + 6, by + 2, 6, 2, SAND[3], 1); box(g, bx + 1, by + 7, 14, 1, SAND[1]);
  }
};
const brass = (g: Ctx, x: number, y: number, w: number) => {
  pixelBlob(g, x, y - 3, w / 2, 4, BRASS[1], 1);
  for (let k = 0; k < w * 0.9; k++) { const bx = x + (h01(k * 1.3 + x) - 0.5) * w, by = y - 1 - h01(k * 2.7 + x) * 6; box(g, bx, by, 3, 1, BRASS[3]); box(g, bx, by, 1, 1, BRASS[5]); }
};
const barrel = (g: Ctx, x: number, y: number) => {
  box(g, x - 12, y - 30, 24, 30, INK); box(g, x - 11, y - 29, 22, 29, '#4A2A1E'); box(g, x - 11, y - 29, 5, 29, '#6A3E2A'); box(g, x + 6, y - 29, 5, 29, '#2E1A12');
  for (const ry of [-22, -9]) { box(g, x - 11, y + ry, 22, 2, '#2A1810'); box(g, x - 11, y + ry, 22, 1, '#8A5A3A'); }
  // (shot through, taped)
  box(g, x - 3, y - 16, 7, 2, TAPE[2]); box(g, x, y - 19, 2, 7, TAPE[2]);
  box(g, x - 11, y - 31, 22, 3, '#1A100A');
};
const BARRELS = [150, 420, 700];
const paintBerm = (g: Ctx) => {
  const y = 70;
  sandbags(g, 20, y, 4);
  popTarget(g, 110, y, 1);
  barrel(g, BARRELS[0], y);
  brass(g, 196, y, 34);
  popTarget(g, 240, y, 2); popTarget(g, 290, y, 3);
  skull(g, 330, y, 0.9);
  sandbags(g, 470, y, 3);
  brass(g, 560, y, 40);
  popTarget(g, 610, y, 4);
  barrel(g, BARRELS[1] + 0, y);
  popTarget(g, 660, y, 5);
  barrel(g, BARRELS[2], y);
  sandbags(g, 730, y, 3);
};
export const drawForeignBerm = (c: Ctx, state: GameState) => {
  c.drawImage(bake('rf4-fo-berm', 800, 80, paintBerm), VIEW_X, BERM_Y - 70);
  const f = state.frame;
  for (let i = 0; i < BARRELS.length; i++) flame(c, VIEW_X + BARRELS[i], BERM_Y - 30, f, i, FIRE, 1);
};
export const FOREIGN_SIGN = ["HELL'S AMERICA", 'NOTHING STAYS SHOT', 'OPEN FOREVER'];

// (dev: a sheet)
export const foreignSheet = (g: Ctx) => {
  g.fillStyle = '#3A2A26'; g.fillRect(0, 0, 1000, 420);
  g.drawImage(bake('rf4-fo-range', TW, TH, paintRange), 0, 0);
  g.drawImage(bake('rf4-fo-berm', 800, 80, paintBerm), 0, 180);
};
