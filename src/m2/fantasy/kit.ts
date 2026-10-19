// Fairy Land's painting kit, crude (the prototype first pass: flat colors in a few steps, simple shapes, readable
// silhouettes; peak-SNES comes later): the land's storybook signs (a carved, painted shingle hung off a wrought-iron
// bracket on a post, the letters in gilt: the park's alphabet, signLetters.ts), the sky by the hour over the far snowy
// hills with the GREAT PIXIE'S CASTLE among them (monument.ts: bigger every section), and small helpers.

import type { GameState } from '../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../m1/constants';
import { mix } from '../../m1/game/render/backdrops/core';
import { drawTodSky, timeOfDay, farTint } from '../timeOfDay';
import { signText, signW, type Look } from '../signLetters';
import { box } from '../adventure/section';
import { stamp } from '../intro/art/kit';
import { drawMonument, type MonumentAt } from './monument';

export type Ctx = CanvasRenderingContext2D;
export { box, mix };

/** A repeatable 0..1 noise off a number. */
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** Ink (the outline every shape gets). */
export const INK = '#1A1028';

/** Gilt letters (the storybook's): gold in steps, a dark outline, a drop shadow, serifs. `cell` the letters' cell. */
export const gilt = (cell = 2): Look => ({ sx: cell, sy: cell, gap: 2, serif: true, fill: ['#FFF6C8', '#F6D365', '#E0AE3A', '#B07A1E'], dither: true, ink: '#3A2208', shadow: '#120A1E' });
/** Painted on (a warning's): white on red, a shadow. */
export const paintedOn = (cell = 2, col = '#FFF7E8'): Look => ({ sx: cell, sy: cell, fill: [mix(col, '#FFFFFF', 0.3), col, col, mix(col, '#000000', 0.2)], dither: true, shadow: '#2A0A0A' });

const fontReady = () => typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"');

/**
 * A storybook sign standing at (x, feetY) (world space): a carved shingle (a scalloped top, a painted field, a gilt
 * border) hung on two chains off a wrought-iron bracket (its scroll, a finial) on a post sunk in a stone footing. The
 * letters in gilt (`warn`: painted white on a red field). `lines` top to bottom, the first big. `board` the field's
 * color. Painted once for the hour (a stamp).
 */
export const storySign = (c: Ctx, x: number, feetY: number, lines: string[], opts: { board?: string; warn?: boolean; tall?: number; big?: number; seed?: number } = {}) => {
  const big = opts.big ?? 2, warn = !!opts.warn;
  const looks = lines.map((_, i) => (warn ? paintedOn(i ? 1 : big) : gilt(i ? 1 : big)));
  const w = Math.max(80, ...lines.map((l, i) => signW(l, looks[i]) + 26)), lh = lines.map((_, i) => 7 * (i ? 1 : big) + (i ? 6 : 8));
  const h = lh.reduce((a, b) => a + b, 0) + 14, tall = opts.tall ?? 120;
  const board = opts.board ?? (warn ? '#9B1C1C' : '#1E3A6E');
  const key = `fasign-${lines.join('|')}-${warn ? 1 : 0}-${board}-${tall}-${big}-${timeOfDay().key}-${fontReady() ? 'f' : 'n'}`;
  // (the post stands at the left; the shingle hangs off the bracket out to the right of it, centered on x)
  const postX = -w / 2 - 14, top = -tall, hangY = top + 26;
  c.save(); c.translate(Math.round(x), Math.round(feetY));
  stamp(c, key, postX - 16, top - 20, w + 60, tall + 24, g => {
    const tod = timeOfDay(), T = (col: string) => farTint(col, 0.15, tod);
    // (the stone footing, the post: an iron lamp-post sort of thing, fluted, a ball finial)
    box(g, postX - 9, -10, 22, 10, INK); box(g, postX - 8, -9, 20, 9, T('#8A8494')); box(g, postX - 8, -9, 20, 2, T('#B8B2C2'));
    box(g, postX - 1, top - 6, 8, tall - 4, INK); box(g, postX, top - 5, 6, tall - 6, T('#2E2A3A')); box(g, postX, top - 5, 2, tall - 6, T('#5A546A'));
    g.fillStyle = INK; g.beginPath(); g.arc(postX + 3, top - 9, 5, 0, Math.PI * 2); g.fill();
    g.fillStyle = T('#E0AE3A'); g.beginPath(); g.arc(postX + 3, top - 9, 4, 0, Math.PI * 2); g.fill(); box(g, postX + 1, top - 12, 2, 2, '#FFF6C8');
    // (the bracket: an iron arm out to the right, a curl under it)
    box(g, postX + 6, top + 6, w + 14, 4, INK); box(g, postX + 6, top + 7, w + 13, 2, T('#3A3448'));
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(postX + 6, top + 26); g.quadraticCurveTo(postX + 30, top + 26, postX + 34, top + 9); g.stroke();
    g.strokeStyle = T('#4A445A'); g.lineWidth = 1.4; g.beginPath(); g.moveTo(postX + 6, top + 26); g.quadraticCurveTo(postX + 30, top + 26, postX + 34, top + 9); g.stroke();
    // (the two chains)
    for (const cx of [-w / 2 + 10, w / 2 - 10]) for (let y = top + 10; y < hangY; y += 4) { box(g, cx - 1, y, 3, 3, INK); box(g, cx, y + 1, 1, 1, T('#A8A2B4')); }
    // (the shingle: a scalloped top, the field, a gilt border, the shade under)
    const sy = hangY, B = T(board);
    g.fillStyle = INK; g.beginPath(); g.moveTo(-w / 2 - 1, sy + 7); g.quadraticCurveTo(-w / 4, sy - 5, 0, sy + 1); g.quadraticCurveTo(w / 4, sy - 5, w / 2 + 1, sy + 7); g.lineTo(w / 2 + 1, sy + h + 1); g.lineTo(-w / 2 - 1, sy + h + 1); g.closePath(); g.fill();
    g.fillStyle = mix(B, '#000000', 0.25); g.beginPath(); g.moveTo(-w / 2, sy + 7); g.quadraticCurveTo(-w / 4, sy - 4, 0, sy + 2); g.quadraticCurveTo(w / 4, sy - 4, w / 2, sy + 7); g.lineTo(w / 2, sy + h); g.lineTo(-w / 2, sy + h); g.closePath(); g.fill();
    box(g, -w / 2 + 3, sy + 8, w - 6, h - 11, B); box(g, -w / 2 + 3, sy + 8, w - 6, 2, mix(B, '#FFFFFF', 0.25));
    const gold = T(warn ? '#F2E8D0' : '#E0AE3A');
    box(g, -w / 2 + 3, sy + 6, w - 6, 1, gold); box(g, -w / 2 + 3, sy + h - 3, w - 6, 1, gold); box(g, -w / 2 + 3, sy + 6, 1, h - 9, gold); box(g, w / 2 - 4, sy + 6, 1, h - 9, gold);
    // (a gilt star at the scallop's dip, little rivets at the corners)
    g.fillStyle = gold; g.beginPath(); g.moveTo(0, sy - 3); g.lineTo(2, sy + 1); g.lineTo(0, sy + 5); g.lineTo(-2, sy + 1); g.closePath(); g.fill();
    for (const [rx, ry] of [[-w / 2 + 6, sy + 10], [w / 2 - 8, sy + 10], [-w / 2 + 6, sy + h - 6], [w / 2 - 8, sy + h - 6]]) box(g, rx, ry, 2, 2, gold);
    // (the letters)
    let ly = sy + 10;
    lines.forEach((l, i) => { signText(g, l, 0, Math.round(ly + lh[i] / 2 + (7 * (i ? 1 : big)) / 2 - 1), looks[i]); ly += lh[i]; });
  });
  c.restore();
};

/** Is world x0..x1 on screen (with a margin)? */
export const onScreen = (state: GameState, x0: number, x1: number, m = 60) => x1 > state.camera.x - m && x0 < state.camera.x + CANVAS_WIDTH + m;

/**
 * Screen space: the sky by the hour (a storybook blue, a pink blush low down), far snowy hills, THE GREAT PIXIE'S
 * CASTLE on its crag among them (monument.ts: at this section's size, `castle`), nearer pine-dark hills, scrolling slow.
 * For the stubs and as the sections' far layers.
 */
export const fairySky = (c: Ctx, state: GameState, castle: MonumentAt | null, opts: { near?: string } = {}) => {
  const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
  drawTodSky(c, 0, 0, W, H, ['#23307A', '#3A55B4', '#6E8EDC', '#A8C4F0', '#E8D4F0', '#F8C8D8'], { horizon: 430, sun: [620, 120], moon: [170, 90] });
  const tod = timeOfDay();
  // (far hills: rounded, snow along their tops)
  const far = farTint('#7C86B4', 0.8, tod), snow = farTint('#EEF2FA', 0.6, tod);
  const off = -((state.camera.x * 0.04) % 560);
  for (let k = -1; k < 3; k++) {
    const bx = off + k * 560;
    c.fillStyle = far; c.beginPath(); c.moveTo(bx, 440);
    for (let i = 0; i <= 14; i++) c.lineTo(bx + i * 40, 360 - Math.sin(i * 0.7 + k) * 26 - (i % 3) * 8);
    c.lineTo(bx + 560, 440); c.closePath(); c.fill();
    c.fillStyle = snow;
    for (let i = 0; i < 14; i++) { const x = bx + i * 40, y = 360 - Math.sin(i * 0.7 + k) * 26 - (i % 3) * 8; c.fillRect(Math.round(x - 6), Math.round(y), 22, 4); }
  }
  // (the castle, on its crag, between the far hills and the near ones)
  if (castle) drawMonument(c, state, castle);
  // (nearer: dark pine hills, snow caught on them)
  const near = farTint(opts.near ?? '#2A3E4A', 0.5, tod);
  const off2 = -((state.camera.x * 0.12) % 640);
  for (let k = -1; k < 3; k++) {
    const bx = off2 + k * 640;
    c.fillStyle = near; c.beginPath(); c.moveTo(bx, 460);
    for (let i = 0; i <= 32; i++) c.lineTo(bx + i * 20, 412 + Math.sin(i * 0.9 + k * 2) * 10 - (i % 2) * 14);
    c.lineTo(bx + 640, 460); c.closePath(); c.fill();
    c.fillStyle = farTint('#DCE4F2', 0.5, tod);
    for (let i = 0; i < 32; i += 2) c.fillRect(Math.round(bx + i * 20 - 2), Math.round(412 + Math.sin(i * 0.9 + k * 2) * 10 - 14), 4, 2);
  }
  box(c, 0, 454, W, H - 454, mix(near, '#000000', 0.25));
  return true;
};
