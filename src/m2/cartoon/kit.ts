// Cartoon Land's painting kit, crude-but-clean (the prototype first pass: flat colors in a few steps, bold ink round
// everything, readable silhouettes; peak-SNES comes later). The park's look is a cartoon's: nothing straight (walls
// bulge, roofs droop, posts curl), candy stripes, puff-ball trees, a cel-painted sky. Here: the land's signs (a lumpy
// cartoon board on a curly striped pole, the letters fat, hand-done and bouncing: the park's alphabet, signLetters.ts),
// the sky by the hour over the far rolling hills with the CARTOON LAND WATER TOWER among them (monument.ts: bigger
// every section), and the shared shapes (wobbly boxes, stripes, puff-balls, curly posts).

import type { GameState } from '../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../m1/constants';
import { mix } from '../../m1/game/render/backdrops/core';
import { stamp } from '../../m1/game/render/stamp';
import { drawTodSky, timeOfDay, farTint, hourMix } from '../timeOfDay';
import { signText, signW, type Look } from '../signLetters';
import { box } from '../adventure/section';
import { drawMonument, type MonumentAt } from './monument';

export type Ctx = CanvasRenderingContext2D;
export { box, mix, stamp };

/** A repeatable 0..1 noise off a number. */
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** Ink (the outline every shape gets: a cartoon's thick black line, a touch of plum in it). */
export const INK = '#1A1028';

/** Is world x0..x1 on screen (with a margin)? */
export const onScreen = (state: GameState, x0: number, x1: number, m = 60) => x1 > state.camera.x - m && x0 < state.camera.x + CANVAS_WIDTH + m;

/** A color for the hour (near: barely into the haze). */
export const hour = (col: string, k = 0.1) => farTint(hourMix(col, mix(col, '#8A4A6A', 0.14), mix(col, '#141832', 0.34)), k);
/** Scenery's (dimmed toward the air: none of it reads as somewhere to stand). */
export const dimmed = (col: string) => { const tod = timeOfDay(); return mix(farTint(hourMix(col, mix(col, '#6A3A5A', 0.16), mix(col, '#0E1024', 0.42), tod), 0.4, tod), '#8E86B4', 0.2); };
/** After dark (the lamps, the windows). */
export const lit = () => timeOfDay().lamps > 0.35;
/** A color's steps: shade, itself, lit. */
export const steps3 = (col: string) => [mix(col, INK, 0.3), col, mix(col, '#FFFFFF', 0.35)];

// ---------------------------------------------------------------------------------------------------------------
// Shapes (nothing straight)

/** A wobbly box's path: its sides bulge out (or pinch in: `bulge` < 0), its top droops like a cake's icing. */
export const wobblePath = (c: Ctx, x: number, y: number, w: number, h: number, bulge = 6, lean = 0) => {
  c.moveTo(x, y + h);
  c.quadraticCurveTo(x - bulge + lean * 0.5, y + h / 2, x + lean, y);
  c.quadraticCurveTo(x + w / 2 + lean, y - bulge * 0.8, x + w + lean, y);
  c.quadraticCurveTo(x + w + bulge + lean * 0.5, y + h / 2, x + w, y + h);
  c.closePath();
};
/** Fills a path, inks it. */
export const inked = (c: Ctx, path: () => void, fill: string | CanvasPattern, line = 3) => {
  c.beginPath(); path();
  c.fillStyle = fill; c.fill();
  c.lineJoin = 'round'; c.strokeStyle = INK; c.lineWidth = line; c.stroke();
};
/** Candy stripes (diagonal) clipped to a path, over its box. */
export const stripes = (c: Ctx, path: () => void, a: string, b: string, x: number, y: number, w: number, h: number, band = 10, slope = 0.6) => {
  c.save(); c.beginPath(); path(); c.clip();
  c.fillStyle = a; c.fillRect(x - 4, y - 4, w + 8, h + 8);
  c.fillStyle = b;
  for (let k = -h; k < w + h; k += band * 2) { c.beginPath(); c.moveTo(x + k, y + h + 4); c.lineTo(x + k + band, y + h + 4); c.lineTo(x + k + band + (h + 8) * slope, y - 4); c.lineTo(x + k + (h + 8) * slope, y - 4); c.closePath(); c.fill(); }
  c.restore();
};
/** A puff-ball tree (the land's tufty ones): a curly striped trunk bending up to a fluffy ball, lit top-left. */
export const puffTree = (c: Ctx, x: number, feetY: number, h: number, col: string, seed: number, trunkA = '#FFF7E8', trunkB = '#F472B6') => {
  const bend = (hash(seed) - 0.5) * h * 0.5, topX = x + bend, topY = feetY - h;
  // (the trunk: a fat S curve, striped)
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = 11; c.beginPath(); c.moveTo(x, feetY); c.bezierCurveTo(x - bend * 0.6, feetY - h * 0.4, topX + bend * 0.4, feetY - h * 0.7, topX, topY); c.stroke();
  c.strokeStyle = trunkA; c.lineWidth = 7; c.stroke();
  c.setLineDash([5, 6]); c.strokeStyle = trunkB; c.stroke(); c.setLineDash([]);
  // (the tuft: lumps round a ball)
  const r = h * 0.2;
  c.fillStyle = INK; c.beginPath(); c.arc(topX, topY, r + 3, 0, Math.PI * 2); c.fill();
  for (let k = 0; k < 7; k++) { const a = (k / 7) * Math.PI * 2 + seed; c.beginPath(); c.arc(topX + Math.cos(a) * r * 0.85, topY + Math.sin(a) * r * 0.75, r * 0.42 + 3, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = col; c.beginPath(); c.arc(topX, topY, r, 0, Math.PI * 2); c.fill();
  for (let k = 0; k < 7; k++) { const a = (k / 7) * Math.PI * 2 + seed; c.beginPath(); c.arc(topX + Math.cos(a) * r * 0.85, topY + Math.sin(a) * r * 0.75, r * 0.42, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = mix(col, '#FFFFFF', 0.4); c.beginPath(); c.arc(topX - r * 0.35, topY - r * 0.35, r * 0.35, 0, Math.PI * 2); c.fill();
  c.fillStyle = mix(col, INK, 0.25); c.beginPath(); c.arc(topX + r * 0.4, topY + r * 0.45, r * 0.3, 0, Math.PI * 2); c.fill();
};

// ---------------------------------------------------------------------------------------------------------------
// Signs

/** The park's letters: fat, hand-done, bouncing off the line, a bright fill banded top to bottom, inked, a drop shadow. */
export const toonLetters = (cell = 2, fill: string[] = ['#FFFFFF', '#FFF7C2', '#FDE047', '#F59E0B'], seed = 0): Look => ({ sx: cell, sy: cell, bold: true, gap: 1, fill, dither: true, ink: INK, shadow: '#3A1030', drop: 2, wobble: 2, seed });

const fontReady = () => typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"');

/**
 * A cartoon sign standing at (x, feetY), world space: a lumpy board (a cloud's outline, or a blob) on a curly
 * candy-striped pole sunk in a little mound, a curl of a bracket under it. `lines` top to bottom, the first big.
 * `board` the board's color. Painted once for the hour (a stamp).
 */
export const toonSign = (c: Ctx, x: number, feetY: number, lines: string[], opts: { board?: string; tall?: number; big?: number; seed?: number; pole?: [string, string]; warn?: boolean } = {}) => {
  const big = opts.big ?? 2, seed = opts.seed ?? lines.join('').length;
  const looks = lines.map((_, i) => toonLetters(i ? 1 : big, opts.warn ? ['#FFFFFF', '#FFE4E6', '#FECDD3', '#FB7185'] : i ? ['#FFFFFF', '#FFFFFF', '#FDF2F8', '#F9A8D4'] : undefined, seed + i));
  const w = Math.max(90, ...lines.map((l, i) => signW(l, looks[i]) + 34)), lh = lines.map((_, i) => 7 * (i ? 1 : big) + (i ? 7 : 10));
  const h = lh.reduce((a, b) => a + b, 0) + 18, tall = opts.tall ?? 120;
  const board = opts.board ?? (opts.warn ? '#BE123C' : '#7C3AED');
  const [pa, pb] = opts.pole ?? ['#FFF7E8', '#EF4444'];
  const key = `ctsign-${lines.join('|')}-${board}-${tall}-${big}-${opts.warn ? 1 : 0}-${timeOfDay().key}-${fontReady() ? 'f' : 'n'}`;
  c.save(); c.translate(Math.round(x), Math.round(feetY));
  stamp(c, key, -w / 2 - 24, -tall - h - 20, w + 48, tall + h + 30, g => {
    const T = (col: string) => hour(col, 0.12);
    // (the mound it's sunk in, the pole: a fat curl of candy stripe up to the board)
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, 0, 22, 8, 0, Math.PI, 0); g.fill();
    g.fillStyle = T('#86EFAC'); g.beginPath(); g.ellipse(0, 0, 19, 6, 0, Math.PI, 0); g.fill();
    const top = -tall;
    g.lineCap = 'round';
    g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.moveTo(0, -2); g.bezierCurveTo(-14, top * 0.35, 14, top * 0.7, 0, top); g.stroke();
    g.strokeStyle = T(pa); g.lineWidth = 7; g.stroke();
    g.setLineDash([6, 6]); g.strokeStyle = T(pb); g.stroke(); g.setLineDash([]);
    // (the board: a cloud's lumpy outline round a rounded box, a lighter rim inside, a shine)
    const bx = -w / 2, by = top - h, B = T(board);
    const cloud = () => {
      g.moveTo(bx + 10, by + h);
      for (let k = 0; k <= 4; k++) g.quadraticCurveTo(bx + (k + 0.5) * (w / 5) - w / 10 + 10, by + h + 7, bx + 10 + (k + 1) * ((w - 20) / 5), by + h);
      g.quadraticCurveTo(bx + w + 8, by + h / 2, bx + w - 10, by);
      for (let k = 4; k >= 0; k--) g.quadraticCurveTo(bx + 10 + (k + 0.5) * ((w - 20) / 5), by - 9, bx + 10 + k * ((w - 20) / 5), by);
      g.quadraticCurveTo(bx - 8, by + h / 2, bx + 10, by + h);
      g.closePath();
    };
    g.beginPath(); cloud(); g.fillStyle = B; g.fill(); g.strokeStyle = INK; g.lineWidth = 3.5; g.lineJoin = 'round'; g.stroke();
    g.save(); g.beginPath(); cloud(); g.clip();
    g.fillStyle = mix(B, '#FFFFFF', 0.22); g.fillRect(bx - 10, by - 10, w + 20, 8);
    g.fillStyle = mix(B, INK, 0.22); g.fillRect(bx - 10, by + h - 5, w + 20, 14);
    g.restore();
    g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.ellipse(bx + 16, by + 6, 8, 3, -0.3, 0, Math.PI * 2); g.fill();
    // (the letters)
    let ly = by + 12;
    lines.forEach((l, i) => { signText(g, l, 0, Math.round(ly + lh[i] / 2 + (7 * (i ? 1 : big)) / 2 - 2), looks[i]); ly += lh[i]; });
  });
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The sky

/**
 * Screen space: the sky by the hour (cel-painted bands), curly cartoon clouds drifting, the far rolling hills in two
 * flat tones with lollipop trees on them, and the CARTOON LAND WATER TOWER standing on the far hill (monument.ts, at
 * the section's size; it drifts across as he goes). For the stubs and as each section's far layer.
 */
export const toonSky = (c: Ctx, state: GameState, tower: MonumentAt | null, opts: { hill?: string; near?: string } = {}) => {
  const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
  drawTodSky(c, 0, 0, W, H, ['#38BDF8', '#60C8FA', '#8ED8FB', '#BDE8FD', '#E0F4FE', '#FDF2F8'], { horizon: 420, sun: [620, 100], moon: [170, 90] });
  // (the clouds: lumps on a flat bottom, inked, drifting)
  const tod = timeOfDay(), cloud = hourMix('#FFFFFF', '#FBCFE8', '#475569');
  for (let k = 0; k < 5; k++) {
    const cx = ((k * 240 - state.camera.x * 0.03 + state.frame * 0.05 + 2000) % 1200) - 200, cy = 70 + (k % 3) * 46;
    c.fillStyle = INK;
    for (const [dx, dy, r] of [[0, 0, 22], [26, -10, 26], [54, 0, 20], [24, 6, 18]]) { c.beginPath(); c.arc(cx + dx, cy + dy, r + 2.5, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = cloud;
    for (const [dx, dy, r] of [[0, 0, 22], [26, -10, 26], [54, 0, 20], [24, 6, 18]]) { c.beginPath(); c.arc(cx + dx, cy + dy, r, 0, Math.PI * 2); c.fill(); }
    box(c, cx - 22, cy + 8, 98, 16, cloud);
    c.fillStyle = mix(cloud, '#93C5FD', 0.35); box(c, cx - 18, cy + 18, 90, 4, mix(cloud, '#93C5FD', 0.35));
  }
  // (far hills: rolling humps, a lollipop tree here and there)
  const far = farTint(opts.hill ?? '#A7D8A0', 0.8, tod);
  const off = -((state.camera.x * 0.05) % 600);
  c.fillStyle = far;
  c.beginPath(); c.moveTo(0, 440);
  for (let x = -20; x <= W + 20; x += 20) c.lineTo(x, 380 - Math.sin((x - off) * 0.012) * 26 - Math.sin((x - off) * 0.031) * 8);
  c.lineTo(W, 440); c.closePath(); c.fill();
  if (tower) drawMonument(c, state, tower);
  const near = farTint(opts.near ?? '#6CC07A', 0.55, tod), off2 = -((state.camera.x * 0.12) % 700);
  c.fillStyle = near;
  c.beginPath(); c.moveTo(0, 450);
  for (let x = -20; x <= W + 20; x += 20) c.lineTo(x, 412 - Math.sin((x - off2) * 0.017 + 1) * 16);
  c.lineTo(W, 450); c.closePath(); c.fill();
  for (let k = 0; k < 9; k++) {
    const tx = ((k * 110 + off2 * 1.0) % 990 + 990) % 990 - 60, ty = 412 - Math.sin((tx - off2) * 0.017 + 1) * 16;
    box(c, tx - 1, ty - 16, 2, 16, mix(near, INK, 0.4));
    c.fillStyle = farTint(['#F472B6', '#FDE047', '#FB923C', '#C084FC'][k % 4], 0.55, tod); c.beginPath(); c.arc(tx, ty - 20, 7, 0, Math.PI * 2); c.fill();
  }
  box(c, 0, 446, W, H - 446, mix(near, INK, 0.2));
  return true;
};
