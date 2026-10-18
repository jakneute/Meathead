// Wilderness Land's painting kit, crude (the prototype first pass: flat colors, simple shapes, readable silhouettes;
// peak-SNES comes later): the park's frontier signs (planks on posts, the letters burned and carved in: the park's
// alphabet, signLetters.ts), the sky by the hour, the park's painted backdrop flats, and small helpers.

import type { GameState } from '../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../m1/constants';
import { mix } from '../../m1/game/render/backdrops/core';
import { drawTodSky } from '../timeOfDay';
import { signText, signW, type Look } from '../signLetters';
import { box } from '../adventure/section';
import { timeOfDay, farTint } from '../timeOfDay';
import { stamp } from '../intro/art/kit';
import { checker } from '../../m1/game/render/pixelArt';

export type Ctx = CanvasRenderingContext2D;
export { box, mix };

/** A repeatable 0..1 noise off a number. */
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** Ink (the outline every shape gets). */
export const INK = '#1C1209';

/** The frontier's carved letters: burned into a pine plank, the cut dark, its lower lip catching the light, a hand's
 *  wobble. `cell` the letters' cell size. */
export const burned = (cell = 2, seed = 0): Look => ({ sx: cell, sy: cell, fill: ['#140A04', '#2A1608', '#2A1608', '#4A2A12'], dither: true, lip: '#E8C890', wobble: 1, seed });
/** Painted on (a park safety sign): white or a color, a shadow. */
export const painted = (cell = 2, col = '#FEF3C7', shadow = '#3F2A14'): Look => ({ sx: cell, sy: cell, fill: [mix(col, '#FFFFFF', 0.3), col, col, mix(col, '#000000', 0.2)], dither: true, shadow });

/**
 * A frontier sign: a pine plank (or two) nailed to two split-rail posts stood in the ground at (x, feetY), the words
 * burned into it. `lines` top to bottom (the first big, the rest small), `board` the plank's color. World space.
 * `lean` tips the lot a little (radians), `rope` hangs it off a crossbar instead (a trail sign).
 */
export const frontierSign = (c: Ctx, x: number, feetY: number, lines: string[], opts: { board?: string; big?: number; small?: number; lean?: number; tall?: number; seed?: number; warn?: boolean } = {}) => {
  const big = opts.big ?? 2, small = opts.small ?? 1;
  const looks = lines.map((_, i) => (opts.warn ? painted(i ? small : big, i ? '#FEF3C7' : '#FDE047') : burned(i ? small : big, (opts.seed ?? 0) + i)));
  const w = Math.max(70, ...lines.map((l, i) => signW(l, looks[i]) + 18)), lh = lines.map((_, i) => 7 * (i ? small : big) + (i ? 5 : 7));
  const h = lh.reduce((a, b) => a + b, 0) + 8, tall = opts.tall ?? 92, top = feetY - tall;
  const board = opts.board ?? (opts.warn ? '#7F1D1D' : '#A0703C');
  c.save(); c.translate(Math.round(x), Math.round(feetY)); c.rotate(opts.lean ?? 0); c.translate(-Math.round(x), -Math.round(feetY));
  // (the posts: split rails, lit down one side, sunk in the dirt)
  for (const px of [x - w / 2 + 8, x + w / 2 - 14]) { box(c, px - 1, top, 8, tall, INK); box(c, px, top, 6, tall, '#6B4423'); box(c, px, top, 2, tall, '#8A5A30'); box(c, px - 3, feetY - 4, 12, 4, '#3F2A14'); }
  // (the plank: its grain, a lit top edge, nail heads, a knot)
  box(c, x - w / 2 - 1, top - 1, w + 2, h + 2, INK);
  box(c, x - w / 2, top, w, h, board);
  box(c, x - w / 2, top, w, 2, mix(board, '#FFFFFF', 0.3));
  box(c, x - w / 2, top + h - 2, w, 2, mix(board, '#000000', 0.25));
  for (let gy = top + 5; gy < top + h - 3; gy += 5) box(c, x - w / 2 + 3 + ((gy * 7) % 11), gy, w * 0.4, 1, mix(board, '#000000', 0.12));
  box(c, x + w / 2 - 18, top + h - 8, 4, 3, mix(board, '#000000', 0.3));
  for (const nx of [x - w / 2 + 4, x + w / 2 - 6]) { box(c, nx, top + 3, 2, 2, '#52525B'); box(c, nx, top + h - 5, 2, 2, '#52525B'); }
  let y = top + 6;
  lines.forEach((l, i) => { y += lh[i] - (i ? 4 : 6); signText(c, l, x, y, looks[i]); y += i ? 4 : 6; });
  c.restore();
};

/** Screen space: the sky by the hour over the park's painted mountains (plywood flats: you can see the bracing on the
 *  near ones' edges, the paint stops at the top), scrolling slow. For the stubs and as the wilds' far layer. */
export const frontierSky = (c: Ctx, state: GameState, opts: { far?: string; near?: string } = {}) => {
  const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
  drawTodSky(c, 0, 0, W, H, ['#1E40AF', '#3B82F6', '#7DB8F0', '#BFE0F8', '#F2E6C4', '#F8D9A0'], { horizon: 420, sun: [600, 110], moon: [180, 90] });
  // (far mountains: snowcapped peaks, flat cutouts in two tones, the snow painted on; no fire mountains here)
  const far = opts.far ?? '#7C8CA8';
  const off = -((state.camera.x * 0.06) % 520);
  for (let k = -1; k < 3; k++) {
    const bx = off + k * 520;
    c.fillStyle = far; c.beginPath(); c.moveTo(bx, 430); c.lineTo(bx + 120, 300); c.lineTo(bx + 170, 340); c.lineTo(bx + 260, 250); c.lineTo(bx + 380, 360); c.lineTo(bx + 450, 320); c.lineTo(bx + 520, 430); c.closePath(); c.fill();
    c.fillStyle = '#F1F5F9'; c.beginPath(); c.moveTo(bx + 228, 283); c.lineTo(bx + 260, 250); c.lineTo(bx + 296, 284); c.lineTo(bx + 276, 276); c.lineTo(bx + 262, 290); c.lineTo(bx + 246, 278); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(bx + 100, 323); c.lineTo(bx + 120, 300); c.lineTo(bx + 142, 322); c.lineTo(bx + 120, 316); c.closePath(); c.fill();
  }
  // (nearer: the park's plywood ridge flats in pine green, their 2x4 bracing showing at the cut ends)
  const near = opts.near ?? '#3F5B3A';
  const off2 = -((state.camera.x * 0.14) % 640);
  for (let k = -1; k < 3; k++) {
    const bx = off2 + k * 640;
    c.fillStyle = near; c.beginPath(); c.moveTo(bx, 440);
    for (let i = 0; i <= 16; i++) c.lineTo(bx + i * 30, 380 + Math.sin(i * 1.3 + k) * 14 - (i % 2) * 16);
    c.lineTo(bx + 480, 440); c.closePath(); c.fill();
    // (the flat's raw end: a plywood edge and its brace)
    box(c, bx + 478, 372, 4, 70, '#C8A070'); c.strokeStyle = '#8A6A40'; c.lineWidth = 3; c.beginPath(); c.moveTo(bx + 482, 380); c.lineTo(bx + 520, 440); c.stroke();
  }
  box(c, 0, 438, W, H - 438, mix(near, '#000000', 0.25));
  return true;
};

/** Is world x0..x1 on screen (with a margin)? */
export const onScreen = (state: GameState, x0: number, x1: number, m = 60) => x1 > state.camera.x - m && x0 < state.camera.x + CANVAS_WIDTH + m;

// ---------------------------------------------------------------------------------------------------------------
// The SNES pass's park sign (section 1's: for every section to use): planks nailed across two peeled-log posts sunk in
// a mound of dirt, each plank grained in steps with a lit top edge and a shaded foot, iron nail heads, the letters
// burned in (the park's alphabet); a warning's a plank painted barn red with an off-white border, the letters painted
// on in safety yellow. The big ones (the land's gate) get a shingled cap. Painted once for the hour (a stamp).

const PLANK_R = ['#2A1608', '#44260E', '#603818', '#7E4E24', '#9C6834', '#BA8448', '#D8A464'];
const fontReady = () => typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"');

/** A park sign standing at (x, feetY) (world space): `lines` top to bottom (the first big). */
export const parkSign = (c: Ctx, x: number, feetY: number, lines: string[], opts: { warn?: boolean; seed?: number; tall?: number; cap?: boolean; big?: number } = {}) => {
  const big = opts.big ?? 2, seed = opts.seed ?? 0, warn = !!opts.warn;
  const looks = lines.map((_, i) => (warn ? { ...painted(i ? 1 : big, i ? '#FEF3C7' : '#FDE047', '#3A0A06'), dither: true } : burned(i ? 1 : big, seed + i)));
  const w = Math.max(76, ...lines.map((l, i) => signW(l, looks[i]) + 22)), lh = lines.map((_, i) => 7 * (i ? 1 : big) + (i ? 6 : 8));
  const tall = opts.tall ?? (warn ? 82 : 94), top = -tall;
  const key = `fsign-${lines.join('|')}-${warn ? 1 : 0}-${seed}-${tall}-${opts.cap ? 1 : 0}-${timeOfDay().key}-${fontReady() ? 'f' : 'n'}`;
  c.save(); c.translate(Math.round(x), Math.round(feetY));
  stamp(c, key, -w / 2 - 20, top - 30, w + 40, tall + 36, g => {
    const tod = timeOfDay(), P = PLANK_R.map(col => farTint(col, 0.2, tod));
    const B = warn ? ['#2A0606', '#4A0C0A', '#6E1410', '#8E1C16', '#AE2A20', '#CC4A3A', '#E87A62'].map(col => farTint(col, 0.2, tod)) : P;
    // (the mound the posts are sunk in, tufts round it)
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, 0, w / 2 + 8, 5, 0, Math.PI, 0); g.fill();
    g.fillStyle = farTint('#54381C', 0.2, tod); g.beginPath(); g.ellipse(0, 0, w / 2 + 7, 4, 0, Math.PI, 0); g.fill();
    // (the posts: peeled logs, stepped across, a knot)
    for (const px of [-w / 2 + 10, w / 2 - 10]) {
      box(g, px - 5, top - 4, 10, tall + 2, INK); box(g, px - 4, top - 3, 8, tall + 1, P[3]); box(g, px - 4, top - 3, 2, tall + 1, P[5]); box(g, px - 3, top - 3, 1, tall + 1, P[6]); box(g, px + 2, top - 3, 2, tall + 1, P[2]);
      for (let y = top + 8; y < -6; y += 11) box(g, px - 2 + ((y * 7) % 4), y, 2, 3, P[1]);
      box(g, px - 4, top - 3, 8, 2, P[4]);
      for (let k = 0; k < 3; k++) { box(g, px - 7 + k * 6, -4, 1, 4, farTint('#4C7E28', 0.2, tod)); box(g, px - 6 + k * 6, -6, 1, 6, farTint('#6C9C34', 0.2, tod)); }
    }
    // (the planks across them: one per line, their joints, grain, a lit top edge, a shaded foot, ragged cut ends)
    let y = top + 4;
    lines.forEach((_, i) => {
      const ph = lh[i] + (i === 0 ? 4 : 2), x0 = -w / 2 + (hash(seed + i) - 0.5) * 4, pw = w + (hash(seed + i * 3) - 0.5) * 6;
      box(g, x0 - 1, y - 1, pw + 2, ph + 2, INK);
      box(g, x0, y, pw, ph, B[3]);
      box(g, x0, y, pw, 1, B[6]); box(g, x0, y + 1, pw, 1, B[5]); box(g, x0, y + ph - 2, pw, 2, B[1]); checker(g, x0, y + ph - 4, pw, 2, B[2], i % 2, 2);
      if (!warn) for (let gy = y + 3; gy < y + ph - 3; gy += 3) box(g, x0 + 3 + ((gy * 7 + seed) % 13), gy, pw * (0.3 + hash(seed + gy) * 0.4), 1, B[2]);
      else { box(g, x0 + 2, y + 2, pw - 4, 1, '#F2E8D0'); box(g, x0 + 2, y + ph - 3, pw - 4, 1, '#F2E8D0'); }
      box(g, x0 + pw * (0.6 + hash(seed + i) * 0.3), y + ph * 0.5, 4, 3, B[1]); box(g, x0 + pw * (0.6 + hash(seed + i) * 0.3), y + ph * 0.5, 2, 1, B[5]);
      for (const nx of [x0 + 7, x0 + pw - 9]) { box(g, nx, y + ph / 2 - 1, 3, 3, '#26262C'); box(g, nx, y + ph / 2 - 1, 1, 1, '#A1A1AA'); }
      y += ph + 1;
    });
    // (a shingled cap over the big ones: two rows of cedar shakes, lit along their bottoms)
    if (opts.cap) {
      const cw = w + 16;
      for (let r = 0; r < 2; r++) for (let sx = -cw / 2 + (r ? 5 : 0); sx < cw / 2; sx += 10) { box(g, sx - 1, top - 14 + r * 6 - 1, 11, 8, INK); box(g, sx, top - 14 + r * 6, 9, 6, P[2 + ((sx + r) & 1)]); box(g, sx, top - 9 + r * 6, 9, 1, P[5]); }
    }
    // (the letters, burned in or painted on)
    let ly = top + 4;
    lines.forEach((l, i) => { const ph = lh[i] + (i === 0 ? 4 : 2); signText(g, l, 0, Math.round(ly + ph / 2 + 7 * (i ? 1 : big) / 2), looks[i]); ly += ph + 1; });
  });
  c.restore();
};
