// GALACTIC GROOVE, the space disco, drawn (the SNES pass): the hall (its walls banded dark to purple, the mural band of
// planets and starbursts, the tufted vinyl down low, the lighting truss up top with its par cans), the chrome pillars,
// the speaker stacks, the DJ ZORP booth (a saucer pod up on its pole: the two operators in it), the bar and its back
// bar, the extinguisher's cabinet, the refill's first-aid cabinet; and the live show: the light-up dance floor (its
// tiles stepping through patterns on the beat), the mirror ball (faceted, turning, throwing its spots round the
// hall), the par cans panning, the neon chasing.
//
// The lighting does the shining: the hall's dark (deep when the lights are down; the color pops out of it when they're
// up) with every tile, spot, can, the ball, the neon and the booth as lights in it (discoLighting); and after the
// lighting, over it (discoGlow: screen space, the world's transform), the light you can see in the air: the ball's
// rays, the cans' beams, the neon's bloom, the glow up off the floor. All stepped and stippled (no gradients).

import type { GameState } from '../../../m1/game/core/state';
import type { Light, SceneLight } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { stamp } from '../../../m1/game/render/stamp';
import { bandedGradient, tilePattern } from '../../../m1/game/render/pixelArt';
import { ALIEN } from '../../../m1/game/scenes/alienLook';
import { GY } from '../geometry';
import { drawAlien, type AlienPose } from '../crater/aliens';
import { DOOR_X, DISCO_L, DISCO_R, DJ, BALL, EXTINGUISHER_X, REFILL_X } from './geo';
import { type Ramp, CHROME, dith, tube, blob, hash } from './paint';
import { neon, neonW, chrome, square, print } from './letters';
import { DOORWAY, DOOR_SIGN } from './basement';

type Ctx = CanvasRenderingContext2D;
const W = DISCO_R - DISCO_L;
const shown = (state: GameState, a: number, b: number) => { const v = state.view ?? { x: state.camera.x, w: CANVAS_WIDTH }; return b > v.x - 80 && a < v.x + v.w + 80; };
const px = (c: Ctx, x: number, y: number, w: number, h: number, col: string | CanvasPattern) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

/** The booth's operators: at the controls; after her, fists shaking, stomping; running out the back; gone. */
export interface BoothOps { mode: 'on' | 'mad' | 'run' | 'gone'; t: number }

// ---------------------------------------------------------------------------------------------------------------
// The show's clock and its colors

/** The beat (frames): 120 to the minute. */
const BEAT = 30;
/** The floor's colors (each a ramp: frame, deep, base, lit, hot), and the same as light. */
const TILE: Ramp[] = [
  ['#3B0420', '#9D174D', '#EC4899', '#F9A8D4', '#FFF1F7'],
  ['#1E0B4B', '#5B21B6', '#8B5CF6', '#C4B5FD', '#F5F3FF'],
  ['#083344', '#0E7490', '#22D3EE', '#A5F3FC', '#F0FDFF'],
  ['#422006', '#A16207', '#FDE047', '#FEF08A', '#FFFFF0'],
  ['#052E16', '#15803D', '#22C55E', '#86EFAC', '#F0FFF4'],
];
const TILE_RGB = ['236, 72, 153', '139, 92, 246', '34, 211, 238', '253, 224, 71', '34, 197, 94'];
/** The floor's tiles: how wide, from where, how many. */
const TW = 36, T0 = DISCO_L + 40, TN = Math.floor((W - 60) / TW);
/** A tile's color this frame (-1: dark), by the pattern of the moment: a chase, the checker on the beat, a ripple out
 *  from the ball, sparkle. */
const tileAt = (i: number, row: number, f: number, on: boolean): number => {
  if (!on) return -1;
  const beat = Math.floor(f / BEAT), mode = Math.floor(f / (BEAT * 16)) % 4;
  if (mode === 0) { const k = (i + row * 2 - Math.floor(f / 6)) % 10; return k < 4 ? ((Math.floor((i + row * 2 - Math.floor(f / 6)) / 10) % 5) + 5) % 5 : -1; }
  if (mode === 1) return (i + row + beat) % 2 === 0 ? (beat + Math.floor(i / 4)) % 5 : -1;
  if (mode === 2) { const ball = (BALL.x - T0) / TW, d = Math.abs(i - ball) + row; const k = (Math.floor(d) - Math.floor(f / 5)) % 6; return ((k + 6) % 6) < 2 ? (Math.floor(d / 6) + beat) % 5 : -1; }
  return hash(i * 7.3 + row * 13 + beat * 1.7) < 0.45 ? Math.floor(hash(i + beat * 3.1) * 5) : -1;
};

/** The ball's spots: where each is on the walls this frame, (x, y). */
const SPOTS = 16;
const spotAt = (k: number, f: number) => {
  const a = f * 0.012 + k * (Math.PI * 2 / SPOTS) + Math.sin(k * 2.3) * 0.2, d = 260 + (k % 4) * 150;
  return { x: BALL.x + Math.cos(a) * d * 1.55, y: BALL.y + 150 + Math.sin(a) * d * 0.42 + (k % 3) * 30, front: Math.sin(a) > -0.75 };
};
/** The par cans along the truss: where each hangs, its color, where its beam lands on the floor this frame. */
const CANS = [0.08, 0.2, 0.33, 0.62, 0.76, 0.9].map((u, i) => ({ x: DISCO_L + u * W, col: [0, 2, 3, 1, 4, 2][i] }));
const TRUSS_Y = GY - 528;
const canHit = (k: number, f: number) => { const cn = CANS[k]; return cn.x + Math.sin(f * 0.015 + k * 1.9) * 260; };

/** The big neon over the booth: its board (x, y, w, h), each word's middle. */
const NEON_S = 3;
const N_PINK: Ramp = ['#1A0410', '#3A1A30', '#EC4899', '#F9A8D4', '#FFF1F7'];
const N_CYAN: Ramp = ['#04161C', '#14343C', '#22D3EE', '#A5F3FC', '#F0FDFF'];
const NEON = (() => {
  const wa = neonW('GALACTIC', NEON_S, 1), wr = neonW('GROOVE', NEON_S, 1), sp = 16, cx = DJ.x + DJ.w / 2, w = wa + sp + wr;
  return { x: Math.round(cx - w / 2 - 22), y: GY - 474, w: Math.round(w + 44), h: 44, ga: cx - w / 2 + wa / 2, gr: cx + w / 2 - wr / 2 };
})();

// ---------------------------------------------------------------------------------------------------------------
// The hall (stamped once)

const WALL = ['#05020B', '#0B0418', '#150826', '#200C38', '#2A0F48', '#331257', '#2A0F48', '#1C0A33'];
const tufted = (c: Ctx) => tilePattern(c, 'sp-q-tuft', 24, 24, g => {
  g.fillStyle = '#3A0A55'; g.fillRect(0, 0, 24, 24);
  // (the diamonds: their pleats in, lit along one side)
  g.fillStyle = '#4C1270'; g.beginPath(); g.moveTo(12, 1); g.lineTo(23, 12); g.lineTo(12, 23); g.lineTo(1, 12); g.closePath(); g.fill();
  g.fillStyle = '#5E1A86'; g.beginPath(); g.moveTo(12, 3); g.lineTo(20, 11); g.lineTo(12, 11); g.lineTo(4, 11); g.closePath(); g.fill();
  g.fillStyle = '#26063A'; for (let k = 0; k < 12; k++) { g.fillRect(k, 12 - k, 1, 1); g.fillRect(12 + k, k, 1, 1); g.fillRect(k, 12 + k, 1, 1); g.fillRect(12 + k, 24 - k, 1, 1); }
  // (the button at each corner)
  for (const [x, y] of [[0, 0], [24, 0], [0, 24], [24, 24], [12, 12]]) { g.fillStyle = '#1A0428'; g.fillRect(x - 2, y - 2, 4, 4); g.fillStyle = '#9F5BD0'; g.fillRect(x - 1, y - 1, 2, 1); }
});

const paintWall = (g: Ctx, tx: number) => {
  bandedGradient(g, tx, GY - 600, 400, 600, WALL, 14);
  // (the stars painted up high: twinkle dots, some crossed)
  for (let i = 0; i < 46; i++) {
    const x = tx + hash(i + tx) * 400, y = GY - 590 + hash(i * 3 + tx) * 300, big = i % 7 === 0;
    px(g, x, y, 2, 2, i % 3 ? '#A78BFA' : '#F0ABFC');
    if (big) { px(g, x - 3, y, 8, 1, '#C4B5FD'); px(g, x, y - 3, 1, 8, '#C4B5FD'); }
  }
  // (the mural band: a black field of space, a planet or two in steps, a ringed one, chrome-trimmed (dim: it's no ledge))
  const my = GY - 254, mh = 82;
  px(g, tx, my, 400, mh, '#0A0418'); px(g, tx, my - 3, 400, 3, '#4A4458'); px(g, tx, my + mh, 400, 3, '#4A4458'); px(g, tx, my - 3, 400, 1, '#6A6478');
  for (let i = 0; i < 30; i++) px(g, tx + hash(i * 9 + tx) * 400, my + 4 + hash(i * 5 + tx) * (mh - 8), 1, 1, '#E9D5FF');
  const k = Math.round((tx - DISCO_L) / 400);
  const pr: Ramp[] = [['#1C0A2E', '#7C2D12', '#EA580C', '#FDBA74', '#FFF7ED'], ['#0B1E3A', '#1D4ED8', '#60A5FA', '#BFDBFE', '#FFFFFF'], ['#1A2E05', '#4D7C0F', '#A3E635', '#D9F99D', '#F7FEE7']];
  const P = pr[((k % 3) + 3) % 3], cx = tx + 120 + (k % 2) * 160, cy = my + mh / 2, r = 26;
  blob(g, cx, cy, r, r, P);
  if (k % 2 === 0) { g.strokeStyle = '#0A0418'; g.lineWidth = 6; g.beginPath(); g.ellipse(cx, cy, r * 1.8, r * 0.45, -0.2, 0, Math.PI * 2); g.stroke(); g.strokeStyle = P[3]; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, cy, r * 1.8, r * 0.45, -0.2, Math.PI * 0.95, Math.PI * 2.05); g.stroke(); g.strokeStyle = P[1]; g.lineWidth = 1; g.beginPath(); g.ellipse(cx, cy, r * 1.6, r * 0.38, -0.2, Math.PI * 0.95, Math.PI * 2.05); g.stroke(); }
  // (a shooting star across it)
  for (let j = 0; j < 14; j++) px(g, tx + 300 - j * 5, my + 16 + j * 2, 5 - j * 0.3, 1, j < 3 ? '#FFFFFF' : j < 8 ? '#F0ABFC' : '#7C3AED');
  // (Googie starbursts, gold, on the wall between)
  for (const sx of [tx + 60, tx + 270]) {
    const sy = GY - 336 + (sx % 3) * 6;
    for (let a = 0; a < 12; a++) { const an = a * Math.PI / 6, l = a % 2 ? 9 : 18; g.strokeStyle = a % 2 ? '#A16207' : '#FACC15'; g.lineWidth = a % 2 ? 1 : 2; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + Math.cos(an) * l, sy + Math.sin(an) * l); g.stroke(); }
    blob(g, sx, sy, 3, 3, ['#422006', '#CA8A04', '#FACC15', '#FEF08A', '#FFFFFF']);
  }
  // (down low: the tufted vinyl, a chrome rail along its top, the baseboard)
  g.fillStyle = tufted(g); g.fillRect(tx, GY - 150, 400, 142);
  for (let y = GY - 150; y < GY - 8; y += 2) if (((y - (GY - 150)) >> 1) % 2 === 0) { /* (the shade toward the floor) */ }
  g.fillStyle = dith(g, '#14041F'); g.fillRect(tx, GY - 40, 400, 32); px(g, tx, GY - 24, 400, 16, 'rgba(10, 2, 18, 0.55)');
  px(g, tx, GY - 156, 400, 6, '#2E2A3A'); px(g, tx, GY - 156, 400, 1, '#4A4658'); px(g, tx, GY - 151, 400, 1, '#18181F');
  px(g, tx, GY - 8, 400, 8, '#52525B'); px(g, tx, GY - 8, 400, 2, '#A1A1AA'); px(g, tx, GY - 2, 400, 2, '#27272A');
};

/** A chrome pillar, floor to ceiling: banded round in steps, a flared foot and head. */
const pillar = (g: Ctx, x: number, w = 30) => {
  const bands = ['#2A2A31', '#52525B', '#8E8E99', '#C9CBD3', '#F4F4F5', '#A1A1AA', '#6B6B76', '#3F3F46'];
  const bw = w / bands.length;
  bands.forEach((col, i) => px(g, x + i * bw, GY - 600, Math.ceil(bw), 600, col));
  // (the hall's colors caught in it, down its shine)
  for (let y = GY - 560; y < GY - 20; y += 34) px(g, x + bw * 4, y, bw, 6, ['#F9A8D4', '#A5F3FC', '#C4B5FD', '#FEF08A'][Math.floor(y / 34) % 4]);
  for (const [y, h] of [[GY - 24, 24], [GY - 600, 16]] as const) { px(g, x - 6, y, w + 12, h, '#18181B'); px(g, x - 5, y + 1, w + 10, h - 2, '#71717A'); px(g, x - 5, y + 1, w + 10, 2, '#D4D4D8'); }
};

/** A speaker stack: two cabinets, woofers and a horn each, on the floor. */
const speakers = (g: Ctx, x: number) => {
  for (let k = 0; k < 2; k++) {
    const y = GY - 130 - k * 124;
    px(g, x - 1, y - 1, 82, 126, '#05050A'); px(g, x, y, 80, 124, '#18181D'); px(g, x, y, 80, 2, '#3A3A44'); px(g, x + 74, y, 6, 124, '#0E0E12');
    for (let i = 0; i < 2; i++) {
      const cx = x + 40, cy = y + 30 + i * 60;
      blob(g, cx, cy, 24, 24, ['#05050A', '#2A2A33', '#3F3F4C', '#5A5A6A', '#8A8A9A'], true);
      blob(g, cx, cy, 14, 14, ['#05050A', '#18181D', '#2A2A33', '#4A4A58', '#6A6A7A'], false);
      blob(g, cx, cy, 5, 5, ['#05050A', '#3A3A44', '#71717A', '#A1A1AA', '#E4E4E7'], false);
    }
    for (let s = 0; s < 4; s++) px(g, x + 6 + s * 18, y + 116, 12, 2, '#26262E');
  }
};

/** The DJ booth: a saucer pod up on a chrome pole (its window: the operators drawn into it live). */
const booth = (g: Ctx) => {
  const cx = DJ.x + DJ.w / 2;
  // (the pole down to the floor, its foot)
  tube(g, cx, DJ.y + DJ.h + 46, cx, GY - 8, 14, CHROME);
  px(g, cx - 30, GY - 12, 60, 12, '#18181B'); px(g, cx - 29, GY - 11, 58, 10, '#52525B'); px(g, cx - 29, GY - 11, 58, 2, '#A1A1AA');
  // (the pod: a cabin on a saucer rim, the dome over it)
  g.fillStyle = '#05020B'; g.beginPath(); g.ellipse(cx, DJ.y - 6, DJ.w / 2 + 6, 30, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#4C1D95'; g.beginPath(); g.ellipse(cx, DJ.y - 6, DJ.w / 2 + 4, 28, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#6D28D9'; g.beginPath(); g.ellipse(cx - 10, DJ.y - 10, DJ.w / 2 - 20, 20, 0, Math.PI, 0); g.fill();
  g.fillStyle = dith(g, '#A78BFA'); g.beginPath(); g.ellipse(cx - 24, DJ.y - 16, DJ.w / 2 - 50, 12, 0, Math.PI, 0); g.fill();
  px(g, cx - 40, DJ.y - 30, 24, 2, '#DDD6FE');
  tube(g, cx, DJ.y - 34, cx, DJ.y - 58, 3, CHROME); blob(g, cx, DJ.y - 60, 5, 5, ['#450A0A', '#B91C1C', '#EF4444', '#FCA5A5', '#FFFFFF']);
  // (the cabin's frame round the window)
  px(g, DJ.x - 12, DJ.y - 8, DJ.w + 24, DJ.h + 16, '#05020B');
  px(g, DJ.x - 10, DJ.y - 6, DJ.w + 20, DJ.h + 12, '#71717A'); px(g, DJ.x - 10, DJ.y - 6, DJ.w + 20, 2, '#D4D4D8'); px(g, DJ.x + DJ.w + 4, DJ.y - 4, 6, DJ.h + 8, '#3F3F46');
  px(g, DJ.x, DJ.y, DJ.w, DJ.h, '#0A0510');
  // (the saucer rim under it: banded, a ring of bulbs)
  g.fillStyle = '#05020B'; g.beginPath(); g.ellipse(cx, DJ.y + DJ.h + 14, DJ.w / 2 + 40, 22, 0, 0, Math.PI * 2); g.fill();
  const rim = ['#7C3AED', '#5B21B6', '#4C1D95', '#2E1065'];
  for (let i = 0; i < 4; i++) { g.save(); g.beginPath(); g.ellipse(cx, DJ.y + DJ.h + 14, DJ.w / 2 + 38, 20, 0, 0, Math.PI * 2); g.clip(); px(g, cx - DJ.w / 2 - 40, DJ.y + DJ.h - 6 + i * 10, DJ.w + 80, 10, rim[i]); g.restore(); }
  px(g, cx - DJ.w / 2 - 20, DJ.y + DJ.h - 2, DJ.w + 40, 1, '#C4B5FD');
  // (its sign, on the rim's face: DJ ZORP)
  px(g, cx - 40, DJ.y + DJ.h + 11, 80, 22, '#05020B'); px(g, cx - 39, DJ.y + DJ.h + 12, 78, 20, '#1E0B33'); px(g, cx - 39, DJ.y + DJ.h + 12, 78, 1, '#5B21B6');
  for (const sx of [cx - 37, cx + 35]) { px(g, sx, DJ.y + DJ.h + 20, 2, 2, '#71717A'); px(g, sx, DJ.y + DJ.h + 20, 1, 1, '#E4E4E7'); }
  chrome(g, 'DJ ZORP', cx, DJ.y + DJ.h + 15, 1, 2, { shadow: '#6B21A8', glint: false });
};

const paintFixtures = (g: Ctx) => {
  // (the lighting truss along the ceiling: two chrome chords, a zigzag between, its hangers)
  for (const y of [TRUSS_Y - 10, TRUSS_Y + 10]) { px(g, DISCO_L - 40, y - 2, W + 80, 5, '#18181B'); px(g, DISCO_L - 40, y - 1, W + 80, 3, '#8E8E99'); px(g, DISCO_L - 40, y - 1, W + 80, 1, '#E4E4E7'); }
  g.strokeStyle = '#6B6B76'; g.lineWidth = 2; g.beginPath();
  for (let x = DISCO_L - 40, k = 0; x < DISCO_R + 40; x += 16, k++) { g.lineTo(x, k % 2 ? TRUSS_Y + 9 : TRUSS_Y - 9); }
  g.stroke();
  for (let x = DISCO_L + 100; x < DISCO_R; x += 420) px(g, x, GY - 600, 3, TRUSS_Y - 12 - (GY - 600), '#3F3F46');
  // (the par cans under it: black cans, a colored lens each)
  for (const cn of CANS) {
    px(g, cn.x - 2, TRUSS_Y + 10, 4, 8, '#27272A');
    g.fillStyle = '#05050A'; g.beginPath(); g.roundRect(cn.x - 11, TRUSS_Y + 16, 22, 26, 4); g.fill();
    px(g, cn.x - 9, TRUSS_Y + 18, 18, 22, '#27272A'); px(g, cn.x - 9, TRUSS_Y + 18, 4, 22, '#3F3F46');
    px(g, cn.x - 8, TRUSS_Y + 40, 16, 4, TILE[cn.col][1]);
  }
  // (the pillars)
  for (const x of [DISCO_L + 260, DISCO_L + 1060, DISCO_L + 1560, DISCO_R - 40]) pillar(g, x);
  // (the speaker stacks by the booth)
  speakers(g, DJ.x + DJ.w + 30); speakers(g, DJ.x + DJ.w + 118);
  booth(g);
  // (the bar at the far end: the back bar's mirror and its bottles, lit shelves; the bar's padded front; the stools)
  const bx = DISCO_R - 300;
  px(g, bx - 4, GY - 250, 248, 140, '#05020B'); px(g, bx, GY - 246, 240, 132, '#1A1030');
  for (let i = 0; i < 6; i++) px(g, bx + 4 + i * 40, GY - 242, 36, 124, i % 2 ? '#241640' : '#2C1A4C');
  for (const sy of [GY - 200, GY - 150]) {
    px(g, bx, sy, 240, 4, '#A1A1AA'); px(g, bx, sy, 240, 1, '#F4F4F5');
    for (let i = 0; i < 16; i++) {
      const x = bx + 6 + i * 14.5, h = 18 + hash(i * 3.3 + sy) * 14, col = ['#15803D', '#B45309', '#9D174D', '#0E7490', '#CA8A04'][Math.floor(hash(i + sy) * 5)];
      px(g, x, sy - h, 8, h, '#05020B'); px(g, x + 1, sy - h + 4, 6, h - 4, col); px(g, x + 3, sy - h, 2, 5, col); px(g, x + 1, sy - h + 6, 1, h - 8, '#FFFFFF');
    }
  }
  // (its sign over the back bar: a lit box on two rods up to the truss's hanger, the words in the park's marquee type)
  for (const rx of [bx + 60, bx + 180]) { px(g, rx - 1, GY - 300, 3, 26, '#18181B'); px(g, rx, GY - 300, 1, 26, '#71717A'); }
  px(g, bx + 44, GY - 276, 152, 22, '#05020B'); px(g, bx + 45, GY - 275, 150, 20, '#0F2A2A'); px(g, bx + 45, GY - 275, 150, 1, '#2DD4BF'); px(g, bx + 45, GY - 256, 150, 1, '#042F2E');
  square(g, 'COSMIC COCKTAILS', bx + 120, GY - 272, 1, 2, ['#042F2E', '#0F766E', '#2DD4BF', '#5EEAD4', '#CCFBF1'], { spacing: 1 });
  g.fillStyle = '#05020B'; g.beginPath(); g.roundRect(bx - 4, GY - 94, 248, 94, 6); g.fill();
  g.fillStyle = tufted(g); g.fillRect(bx, GY - 82, 240, 78);
  px(g, bx, GY - 82, 240, 78, 'rgba(219, 39, 119, 0.35)');
  px(g, bx - 2, GY - 92, 244, 10, '#3F3F46'); px(g, bx - 2, GY - 92, 244, 2, '#71717A');
  for (let i = 0; i < 4; i++) {
    const sx = bx + 30 + i * 60;
    tube(g, sx, GY - 52, sx, GY - 6, 4, CHROME); px(g, sx - 10, GY - 6, 20, 4, '#52525B');
    g.fillStyle = '#05020B'; g.beginPath(); g.ellipse(sx, GY - 56, 15, 7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#DB2777'; g.beginPath(); g.ellipse(sx, GY - 57, 14, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#F472B6'; g.beginPath(); g.ellipse(sx - 3, GY - 59, 8, 3, 0, 0, Math.PI * 2); g.fill();
  }
  // (the extinguisher's cabinet on the wall: red, a glass door; IN CASE OF FIRE over it)
  const ex = EXTINGUISHER_X;
  px(g, ex - 22, GY - 152, 44, 74, '#05020B'); px(g, ex - 20, GY - 150, 40, 70, '#991B1B'); px(g, ex - 20, GY - 150, 40, 3, '#EF4444'); px(g, ex + 14, GY - 147, 6, 67, '#7F1D1D');
  px(g, ex - 16, GY - 144, 32, 58, '#1A0606'); px(g, ex - 14, GY - 142, 3, 40, 'rgba(255, 255, 255, 0.25)');
  px(g, ex - 30, GY - 178, 60, 21, '#05020B'); px(g, ex - 29, GY - 177, 58, 19, '#991B1B'); px(g, ex - 29, GY - 177, 58, 1, '#EF4444'); px(g, ex - 29, GY - 159, 58, 1, '#450A0A');
  print(g, 'IN CASE', ex, GY - 175, 1, 1, ['#FFFFFF', '#FECACA'], { shadow: '#450A0A' });
  print(g, 'OF FIRE', ex, GY - 167, 1, 1, ['#FFFFFF', '#FECACA'], { shadow: '#450A0A' });
  // (the refill's alcove by the door: a first-aid cabinet, white, its red cross)
  const rx = REFILL_X;
  px(g, rx - 32, GY - 152, 76, 152, '#05020B'); px(g, rx - 30, GY - 150, 72, 150, '#1E1B4B'); px(g, rx - 30, GY - 150, 72, 3, '#4338CA');
  px(g, rx - 18, GY - 134, 36, 36, '#05020B'); px(g, rx - 17, GY - 133, 34, 34, '#E7E5E4'); px(g, rx - 17, GY - 133, 34, 3, '#FFFFFF'); px(g, rx + 12, GY - 130, 5, 31, '#A8A29E');
  px(g, rx - 3, GY - 128, 6, 22, '#DC2626'); px(g, rx - 10, GY - 120, 20, 6, '#DC2626'); px(g, rx - 3, GY - 128, 2, 22, '#F87171');
};

// ---------------------------------------------------------------------------------------------------------------
// Live

/** One floor tile: a frame, its glass; lit, stepped from its edge in to a hot middle. */
const tile = (c: Ctx, x: number, y: number, w: number, h: number, k: number) => {
  px(c, x, y, w, h, '#07050C');
  if (k < 0) { px(c, x + 2, y + 2, w - 4, h - 4, '#1A1824'); px(c, x + 2, y + 2, w - 4, 1, '#2E2A3C'); px(c, x + 4, y + 4, 6, 1, '#3A3650'); return; }
  const r = TILE[k];
  px(c, x + 2, y + 2, w - 4, h - 4, r[1]);
  c.fillStyle = dith(c, r[2]); c.fillRect(x + 3, y + 3, w - 6, h - 6);
  px(c, x + 5, y + 5, w - 10, h - 10, r[2]);
  c.fillStyle = dith(c, r[3], 2, 1); c.fillRect(x + 7, y + 7, w - 14, h - 14);
  px(c, x + 10, y + 9, w - 20, h - 18, r[3]);
  px(c, x + 13, y + 11, w - 26, Math.max(1, h - 22), r[4]);
  px(c, x + 2, y + 2, w - 4, 1, r[4]);
};

export const drawDisco = (c: Ctx, state: GameState, o: { lights: number; ops: BoothOps | null; extinguisher: boolean }) => {
  if (!shown(state, DISCO_L - 60, DISCO_R + 60)) return;
  const f = state.frame, on = o.lights > 0.5;
  // (the hall's walls, in tiles)
  for (let tx = DISCO_L - 40; tx < DISCO_R + 40; tx += 400) {
    if (!shown(state, tx, tx + 400)) continue;
    stamp(c, `sp-q-disco2-${tx - DISCO_L}`, tx, GY - 600, 400, 604, g => paintWall(g, tx));
  }
  stamp(c, 'sp-q-disco2-fix', DISCO_L - 40, GY - 600, W + 80, 604, paintFixtures);
  // The ball's spots on the walls (the light itself is the lighting's; these are the bright cores)
  if (on) for (let k = 0; k < SPOTS; k++) {
    const s = spotAt(k, f);
    if (!s.front || !shown(state, s.x - 10, s.x + 10)) continue;
    px(c, s.x - 2, s.y - 2, 5, 5, k % 4 === 1 ? '#F0ABFC' : '#F8FAFC'); px(c, s.x - 4, s.y, 9, 1, '#E2E8F0'); px(c, s.x, s.y - 4, 1, 9, '#E2E8F0');
  }
  // The neon: GALACTIC GROOVE on its sign board (hung off the truss on two rods), bent glass, the letters chasing (dark
  // glass till the lights come up)
  if (shown(state, NEON.x - 30, NEON.x + NEON.w + 30)) {
    const N = NEON;
    for (const rx of [N.x + 24, N.x + N.w - 26]) { px(c, rx - 1, TRUSS_Y + 10, 4, N.y - TRUSS_Y - 10, '#05020B'); px(c, rx, TRUSS_Y + 10, 2, N.y - TRUSS_Y - 10, '#71717A'); px(c, rx, TRUSS_Y + 10, 1, N.y - TRUSS_Y - 10, '#D4D4D8'); }
    px(c, N.x - 2, N.y - 2, N.w + 4, N.h + 4, '#05020B'); px(c, N.x, N.y, N.w, N.h, '#12061E'); px(c, N.x, N.y, N.w, 2, '#3A2A4C'); px(c, N.x, N.y + N.h - 2, N.w, 2, '#0A0410');
    for (let i = 0; i < 24; i++) px(c, N.x + 6 + i * ((N.w - 12) / 24), N.y + N.h - 7, 3, 2, on && (i + (f >> 2)) % 4 === 0 ? '#FDE047' : '#3F2A12');
    const lit = (k: number) => (i: number) => { const j = i + k; return !on || ((j + Math.floor(f / 5)) % 9 === 0 && f % 4 < 2) ? 0 : (j + Math.floor(f / 5)) % 4 === 0 ? 2 : 1; };
    neon(c, 'GALACTIC', N.ga, N.y + 10, NEON_S, N_PINK, { slant: 1, lit: lit(0) });
    neon(c, 'GROOVE', N.gr, N.y + 10, NEON_S, N_CYAN, { slant: 1, lit: lit(9) });
  }
  // The floor: light-up tiles, two rows, the patterns stepping on the beat; its lip lit (stand on it)
  for (let i = 0; i < TN; i++) {
    const x = T0 + i * TW;
    if (!shown(state, x, x + TW)) continue;
    tile(c, x, GY, TW, 26, tileAt(i, 0, f, on));
    tile(c, x, GY + 26, TW, 30, tileAt(i, 1, f, on));
  }
  if (shown(state, DISCO_L, DISCO_R)) { px(c, DISCO_L, GY - 1, W, 2, '#E4E4E7'); px(c, DISCO_L, GY + 1, W, 1, '#52525B'); }
  // The mirror ball, turning: its chain and motor; the facets, each catching the light as it comes round
  const bx = BALL.x, by = BALL.y, R = 30;
  if (shown(state, bx - 60, bx + 60)) {
    px(c, bx - 1, TRUSS_Y + 10, 3, by - R - TRUSS_Y - 10, '#71717A'); for (let y = TRUSS_Y + 14; y < by - R; y += 6) px(c, bx - 2, y, 5, 2, '#A1A1AA');
    px(c, bx - 8, by - R - 8, 16, 8, '#18181B'); px(c, bx - 7, by - R - 7, 14, 6, '#52525B'); px(c, bx - 7, by - R - 7, 14, 1, '#A1A1AA');
    c.fillStyle = '#05050A'; c.beginPath(); c.arc(bx, by, R + 1.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#334155'; c.beginPath(); c.arc(bx, by, R, 0, Math.PI * 2); c.fill();
    const rot = f * 0.02;
    for (let lat = -5; lat <= 5; lat++) {
      const la = lat / 5.6 * (Math.PI / 2), ry = Math.sin(la) * R, rr = Math.cos(la) * R, n = Math.max(4, Math.round(16 * Math.cos(la)));
      for (let j = 0; j < n; j++) {
        const lo = (j / n) * Math.PI * 2 + rot + lat * 0.1, cz = Math.cos(lo);
        if (cz < 0.05) continue;
        const fx = bx + Math.sin(lo) * rr, fy = by + ry, sz = Math.max(2, 5 * cz * Math.cos(la));
        // (lit from up and to the left: the facets there bright; one now and then flashing; some the neon's color)
        const lum = cz * 0.6 + (-Math.sin(lo) * 0.3 - Math.sin(la) * 0.4) + 0.2;
        const flash = on && ((j * 7 + lat * 3 + (f >> 2)) % 29 === 0);
        const col = flash ? '#FFFFFF' : lum > 0.85 ? '#F1F5F9' : lum > 0.6 ? '#CBD5E1' : lum > 0.35 ? '#94A3B8' : lum > 0.15 ? '#64748B' : '#475569';
        const tint = on && (j + lat) % 7 === 0 ? (j % 2 ? '#F9A8D4' : '#A5F3FC') : col;
        px(c, fx - sz / 2, fy - 2.5, sz, 4, tint);
      }
    }
    // (the grout lines, the rim in shade)
    c.strokeStyle = 'rgba(15, 23, 42, 0.6)'; c.lineWidth = 1; for (let lat = -4; lat <= 4; lat += 2) { c.beginPath(); c.ellipse(bx, by + Math.sin(lat / 5.6 * Math.PI / 2) * R, Math.cos(lat / 5.6 * Math.PI / 2) * R, 1.5, 0, 0, Math.PI * 2); c.stroke(); }
    c.strokeStyle = '#1E293B'; c.lineWidth = 2; c.beginPath(); c.arc(bx, by, R - 1, -0.3, Math.PI * 0.9); c.stroke();
    if (on) { px(c, bx - 14, by - 16, 4, 4, '#FFFFFF'); px(c, bx - 18, by - 14, 12, 1, '#FFFFFF'); px(c, bx - 12, by - 20, 1, 12, '#FFFFFF'); }
  }
  // The par cans' lenses lit (their beams are the glow pass's)
  if (on) for (const cn of CANS) if (shown(state, cn.x - 20, cn.x + 20)) { px(c, cn.x - 8, TRUSS_Y + 40, 16, 4, TILE[cn.col][3]); px(c, cn.x - 5, TRUSS_Y + 41, 10, 2, TILE[cn.col][4]); }
  // The fog off the smoke machine by the booth, low over the floor: stippled, drifting
  if (on && shown(state, DJ.x - 300, DJ.x + 600)) for (let i = 0; i < 7; i++) {
    const u = ((f * 0.0015 + i * 0.143) % 1), fx = DJ.x - 200 + u * 900, fy = GY - 14 - Math.sin(u * Math.PI) * 10;
    c.fillStyle = dith(c, i % 2 ? '#A78BFA' : '#E9D5FF', 2, i % 2); c.globalAlpha = 0.35 * Math.sin(u * Math.PI);
    c.beginPath(); c.ellipse(fx, fy, 70 + i * 6, 12, 0, 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
  // The DJ booth: the two of them in there (headsets on, working her), or losing it after, or gone out the back
  if (shown(state, DJ.x - 40, DJ.x + DJ.w + 40)) {
    c.save(); c.beginPath(); c.rect(DJ.x, DJ.y, DJ.w, DJ.h); c.clip();
    // (the cabin inside: their green screens' light, the back wall's panels)
    px(c, DJ.x, DJ.y, DJ.w, DJ.h, '#0E1A14');
    for (let i = 0; i < 6; i++) px(c, DJ.x + 4 + i * 34, DJ.y + 4, 30, 30, i % 2 ? '#14261C' : '#10201A');
    for (let i = 0; i < 5; i++) { px(c, DJ.x + 10 + i * 38, DJ.y + 10, 22, 14, '#052E16'); px(c, DJ.x + 12 + i * 38, DJ.y + 12 + ((f >> 3) + i) % 10, 18, 1, '#4ADE80'); }
    const ops = o.ops, open = !ops || ops.mode === 'run' || ops.mode === 'gone';
    // (the back door out of it, at the right: open once they've run)
    px(c, DJ.x + DJ.w - 46, DJ.y + 6, 38, DJ.h - 6, '#05020B');
    px(c, DJ.x + DJ.w - 44, DJ.y + 8, 34, DJ.h - 8, open ? '#020103' : '#4C1D95');
    if (!open) { px(c, DJ.x + DJ.w - 44, DJ.y + 8, 34, 2, '#7C3AED'); px(c, DJ.x + DJ.w - 18, DJ.y + 40, 4, 6, '#FDE047'); }
    if (ops && ops.mode !== 'gone') for (let i = 0; i < 2; i++) {
      let x = DJ.x + 50 + i * 100, bob = 0;
      let pose: AlienPose = 'operate';
      if (ops.mode === 'mad') { pose = (ops.t + i * 5) % 12 < 6 ? 'point' : 'tell'; bob = (ops.t + i * 3) % 10 < 5 ? -3 : 0; x += Math.sin(ops.t * 0.9 + i) * 2; }
      else if (ops.mode === 'run') { pose = 'run'; x += Math.max(0, ops.t - i * 10) * 6; }
      if (x > DJ.x + DJ.w - 20) continue;
      c.save(); c.translate(x, DJ.y + DJ.h + 50 + bob);
      drawAlien(c, { seed: 201 + i * 7, headset: true, woman: i === 1 }, pose, f + i * 9, 0.85);
      c.restore();
    }
    // (the console: the decks spinning, the faders, the lamps)
    px(c, DJ.x, DJ.y + DJ.h - 14, DJ.w, 14, '#27272A'); px(c, DJ.x, DJ.y + DJ.h - 14, DJ.w, 2, '#71717A');
    for (let i = 0; i < 2; i++) {
      const tx = DJ.x + 60 + i * 80, ty = DJ.y + DJ.h - 7;
      c.fillStyle = '#05050A'; c.beginPath(); c.ellipse(tx, ty, 14, 4, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#18181B'; c.beginPath(); c.ellipse(tx, ty, 12, 3, 0, 0, Math.PI * 2); c.fill();
      px(c, tx - 2, ty - 1, 4, 2, '#F472B6'); px(c, tx + Math.cos(f * 0.2) * 10, ty + Math.sin(f * 0.2) * 2.5, 2, 1, '#A1A1AA');
    }
    for (let i = 0; i < 6; i++) px(c, DJ.x + 92 + i * 4, DJ.y + DJ.h - 11 + ((f + i * 9) % 20 < 10 ? 0 : 3), 2, 4, '#E4E4E7');
    // (the glass: a sheen across it, their green on it; dust out the back as they run)
    c.fillStyle = 'rgba(74, 222, 128, 0.12)'; c.fillRect(DJ.x, DJ.y, DJ.w, DJ.h);
    c.fillStyle = dith(c, 'rgba(255, 255, 255, 0.18)'); c.beginPath(); c.moveTo(DJ.x + 20, DJ.y); c.lineTo(DJ.x + 50, DJ.y); c.lineTo(DJ.x + 20, DJ.y + DJ.h); c.lineTo(DJ.x - 10, DJ.y + DJ.h); c.closePath(); c.fill();
    if (ops && ops.mode === 'run' && ops.t > 6) for (let k = 0; k < 6; k++) { const u = ((ops.t - 6) * 0.04 + k * 0.17) % 1; c.fillStyle = u < 0.5 ? '#D6D3D1' : dith(c, '#D6D3D1', 2, k % 2); c.beginPath(); c.ellipse(DJ.x + DJ.w - 40 - u * 60 + k * 6, DJ.y + DJ.h - 20 - u * 20 + (k % 3) * 6, 10 + u * 14, 8 + u * 8, 0, 0, Math.PI * 2); c.fill(); }
    c.restore();
  }
  void ALIEN; void o.extinguisher;
};

/** The shutter in the doorway (the same opening the doors were in): a heavy steel roll-down out of its housing up
 *  under the casing's head, slatted, hazard stripes along its foot (0 up, 1 down). World, behind him. */
// ---------------------------------------------------------------------------------------------------------------
// The building round the hall, cut away (only seen pulled right back, her weakness death: the whole hall on screen, wall
// to wall, so the screen's taller than the hall): over the ceiling, its slab, the long-span joists in the dark of the
// plenum (the ducts, the sprinkler main, the hangers), the roof deck, black above; under the floor, its slab, the piers
// under the pillars, black below; the outer wall past the far end. Drawn before the hall, which covers its own part.

const SHELL_TOP = GY - 1700, SHELL_BOT = GY + 600;
const CONC = ['#0E0C12', '#16141B', '#1C1A22', '#26232D', '#34303C'];
const STEEL_S = ['#101015', '#1F1F26', '#2E2E37', '#4A4A55'];
export const drawDiscoShell = (c: Ctx, state: GameState) => {
  if (!shown(state, DISCO_L - 60, DISCO_R + 60)) return;
  const xl = DISCO_L - 240, xr = DISCO_R + 240, ww = xr - xl, top = GY - 600;
  // (black, all of it, first)
  px(c, xl, SHELL_TOP, ww, SHELL_BOT - SHELL_TOP, '#020104');
  // Over the ceiling. The roof deck (corrugated, its ribs lit along the top), the membrane over it; black above
  const deck = top - 330;
  px(c, xl, deck - 26, ww, 26, '#0A0910'); px(c, xl, deck - 26, ww, 2, '#17151C');
  px(c, xl, deck, ww, 30, CONC[1]);
  for (let x = xl; x < xr; x += 14) { px(c, x, deck + 2, 6, 26, CONC[2]); px(c, x, deck + 2, 6, 1, CONC[3]); px(c, x + 6, deck + 2, 1, 26, CONC[0]); }
  // (the plenum: dark, banded darker up toward the deck)
  const PLEN = ['#06040A', '#08060D', '#0A0710', '#0C0913'];
  for (let k = 0; k < 4; k++) px(c, xl, deck + 30 + k * 64, ww, k === 3 ? top - 40 - (deck + 30 + k * 64) : 64, PLEN[k]);
  // (the joists, open web: top chord under the deck, bottom chord over the slab, the webs zigzag between; a column of
  // each pillar's up through it to the roof)
  const tc = deck + 34, bc = top - 76;
  for (const y of [tc, bc]) { px(c, xl, y, ww, 7, STEEL_S[1]); px(c, xl, y, ww, 1, STEEL_S[3]); px(c, xl, y + 6, ww, 1, STEEL_S[0]); }
  c.strokeStyle = STEEL_S[1]; c.lineWidth = 3; c.beginPath();
  for (let x = xl, k = 0; x <= xr; x += 48, k++) c.lineTo(x, k % 2 ? bc : tc + 7);
  c.stroke();
  c.strokeStyle = STEEL_S[2]; c.lineWidth = 1; c.beginPath();
  for (let x = xl, k = 0; x <= xr; x += 48, k++) c.lineTo(x - 1, k % 2 ? bc : tc + 7);
  c.stroke();
  for (const x of [DISCO_L + 260, DISCO_L + 1060, DISCO_L + 1560, DISCO_R - 40]) { px(c, x - 10, deck + 30, 20, top - 40 - deck - 30, STEEL_S[1]); px(c, x - 10, deck + 30, 3, top - 40 - deck - 30, STEEL_S[2]); px(c, x + 8, deck + 30, 2, top - 40 - deck - 30, STEEL_S[0]); }
  // (the supply duct along it, galvanized: its seams, its top lit; the sprinkler main under it in red, its hangers)
  const dy = deck + 120;
  px(c, xl, dy, ww, 46, '#1E2128'); px(c, xl, dy, ww, 2, '#3A3F4A'); px(c, xl, dy + 2, ww, 10, '#252931'); px(c, xl, dy + 44, ww, 2, '#0C0D11');
  for (let x = xl + 20; x < xr; x += 96) { px(c, x, dy, 3, 46, '#2E333D'); px(c, x + 3, dy, 1, 46, '#0F1014'); }
  const sy = bc - 34;
  px(c, xl, sy, ww, 7, '#3A0C0C'); px(c, xl, sy, ww, 2, '#7F1D1D'); px(c, xl, sy + 6, ww, 1, '#1A0505');
  for (let x = xl + 40; x < xr; x += 140) { px(c, x, sy - 10, 2, 10, STEEL_S[2]); px(c, x - 3, sy + 7, 8, 2, '#5A1414'); px(c, x, sy + 9, 2, 6, '#71717A'); }
  // (the slab hung off the bottom chords: rods down to it)
  for (let x = xl + 24; x < xr; x += 96) px(c, x, bc + 7, 2, top - 40 - bc - 7, STEEL_S[2]);
  // (the ceiling slab, cut: concrete, its aggregate stippled, its top edge lit dimly, its underside the hall's ceiling)
  px(c, xl, top - 40, ww, 40, CONC[2]); px(c, xl, top - 40, ww, 2, CONC[3]); px(c, xl, top - 4, ww, 4, CONC[0]);
  for (let i = 0; i < ww / 6; i++) { const x = xl + hash(i * 1.7) * ww, y = top - 36 + hash(i * 2.3) * 30; px(c, x, y, 2, 1, i % 3 ? CONC[1] : CONC[3]); }
  // Under the floor. Its structure under the tiles (the ends past them), the slab, the piers under the pillars and
  // their footings; black below
  px(c, xl, GY + 4, ww, 52, CONC[1]);
  px(c, xl, GY + 56, ww, 40, CONC[2]); px(c, xl, GY + 56, ww, 2, CONC[3]); px(c, xl, GY + 94, ww, 2, CONC[0]);
  for (let i = 0; i < ww / 6; i++) { const x = xl + hash(i * 3.1 + 7) * ww, y = GY + 60 + hash(i * 1.3 + 2) * 30; px(c, x, y, 2, 1, i % 3 ? CONC[1] : CONC[3]); }
  const PIT = ['#07050A', '#050307', '#030205'];
  for (let k = 0; k < 3; k++) px(c, xl, GY + 96 + k * 40, ww, 40, PIT[k]);
  for (const x of [DISCO_L - 40, DISCO_L + 260, DISCO_L + 1060, DISCO_L + 1560, DISCO_R - 40, DISCO_R + 40]) {
    px(c, x - 18, GY + 96, 36, 90, CONC[1]); px(c, x - 18, GY + 96, 4, 90, CONC[2]); px(c, x + 15, GY + 96, 3, 90, CONC[0]);
    px(c, x - 36, GY + 186, 72, 18, CONC[1]); px(c, x - 36, GY + 186, 72, 2, CONC[3]);
  }
  // The outer walls past each end, the hall's height and the plenum's: block, its courses
  for (const [x0, w] of [[DISCO_R + 40, 60], [DISCO_L - 100, 60]] as const) {
    px(c, x0, deck, w, GY + 96 - deck, CONC[1]);
    for (let y = deck; y < GY + 96; y += 20) px(c, x0, y, w, 1, CONC[0]);
    for (let y = deck, r = 0; y < GY + 96; y += 20, r++) for (let x = x0 + (r % 2 ? 20 : 0); x < x0 + w; x += 40) px(c, x, y, 1, 20, CONC[0]);
    px(c, x0, deck, 2, GY + 96 - deck, CONC[2]);
  }
};

export const drawShutter = (c: Ctx, state: GameState, k: number) => {
  const D = DOORWAY;
  if (k <= 0 || !shown(state, D.l - 20, D.r + 20)) return;
  const x = D.l, w = D.r - D.l, top = D.top + 12, h = Math.round((GY - top) * k);
  // (its housing: a steel drum box across the top of the opening, bolted)
  px(c, x, D.top, w, 12, '#05050A'); px(c, x + 1, D.top + 1, w - 2, 10, '#3F3F46'); px(c, x + 1, D.top + 1, w - 2, 2, '#A1A1AA'); px(c, x + 1, D.top + 8, w - 2, 2, '#27272A');
  for (const bx of [x + 4, x + w - 7]) px(c, bx, D.top + 4, 3, 3, '#D4D4D8');
  // (the slats: each rounded, lit along its top, shadowed under; the guides either side)
  px(c, x, top, w, h, '#05050A');
  for (let y = top; y < top + h - 10; y += 8) { px(c, x + 2, y, w - 4, 8, '#5A5A64'); px(c, x + 2, y, w - 4, 2, '#9A9AA6'); px(c, x + 2, y + 6, w - 4, 2, '#33333B'); c.fillStyle = dith(c, '#45454E', 1, (y >> 3) % 2); c.fillRect(x + w - 16, y + 2, 12, 4); }
  px(c, x, top, 2, h, '#27272A'); px(c, x + w - 2, top, 2, h, '#27272A');
  // (its foot: the bottom bar, the hazard stripes, a handle)
  c.save(); c.beginPath(); c.rect(x + 2, top + h - 10, w - 4, 10); c.clip();
  for (let i = -1; i < w / 6 + 1; i++) { c.fillStyle = i % 2 ? '#18181B' : '#FACC15'; c.beginPath(); c.moveTo(x + i * 6, top + h - 10); c.lineTo(x + i * 6 + 6, top + h - 10); c.lineTo(x + i * 6 + 2, top + h); c.lineTo(x + i * 6 - 4, top + h); c.closePath(); c.fill(); }
  c.restore();
  px(c, x + 2, top + h - 11, w - 4, 1, '#FEF08A');
  px(c, x + w / 2 - 8, top + h - 16, 16, 4, '#18181B'); px(c, x + w / 2 - 7, top + h - 16, 14, 1, '#A1A1AA');
  px(c, x, top + h - 1, w, 1, '#0A0A0A');
};

// ---------------------------------------------------------------------------------------------------------------
// The lighting

/** The hall's light: dark till they come up; then every tile, spot, can, the ball, the neon, the booth lit in it. */
export const discoLighting = (state: GameState, lights: number): SceneLight => {
  const f = state.frame, ls: Light[] = [], on = lights > 0.5, l = lights;
  const v0 = state.camera.x - 300, v1 = state.camera.x + CANVAS_WIDTH + 300;
  const inView = (x: number) => x > v0 && x < v1;
  if (on) {
    // (the floor: each lit tile's color up off it; pairs of tiles, one light)
    for (let i = 0; i < TN; i += 2) {
      const x = T0 + i * TW + TW;
      if (!inView(x)) continue;
      const k = tileAt(i, 0, f, true), k2 = tileAt(i + 1, 0, f, true), kk = k >= 0 ? k : k2;
      if (kk >= 0) ls.push({ x, y: GY - 4, r: 96, a: 0.55 * l, color: `rgba(${TILE_RGB[kk]}, 0.2)` });
    }
    // (the ball's spots round the walls and the floor)
    for (let k = 0; k < SPOTS; k++) { const s = spotAt(k, f); if (s.front && inView(s.x)) ls.push({ x: s.x, y: s.y, r: 34, a: 0.7 * l, color: k % 4 === 1 ? 'rgba(240, 171, 252, 0.25)' : 'rgba(248, 250, 252, 0.22)' }); }
    // (where the cans' beams land: a pool each)
    CANS.forEach((cn, k) => { const hx = canHit(k, f); if (inView(hx)) ls.push({ x: hx, y: GY - 60, r: 130, a: 0.6 * l, color: `rgba(${TILE_RGB[cn.col]}, 0.2)` }); });
    // (the ball itself, catching it all)
    ls.push({ x: BALL.x, y: BALL.y, r: 150, a: 0.85 * l, color: 'rgba(226, 232, 240, 0.14)' });
    // (the neon: pink along GALACTIC, cyan along GROOVE)
    ls.push({ x: NEON.ga, y: NEON.y + 20, r: 190, a: 0.75 * l, color: 'rgba(244, 114, 182, 0.2)' });
    ls.push({ x: NEON.gr, y: NEON.y + 20, r: 170, a: 0.75 * l, color: 'rgba(34, 211, 238, 0.18)' });
    // (the bar's back bar)
    ls.push({ x: DISCO_R - 180, y: GY - 180, r: 200, a: 0.6 * l, color: 'rgba(94, 234, 212, 0.14)' });
  }
  // (the booth: their screens' green; the door's light; the refill's alcove (always: he must see it))
  ls.push({ x: DJ.x + DJ.w / 2, y: DJ.y + DJ.h / 2, r: 170, a: 0.75, color: 'rgba(74, 222, 128, 0.14)' });
  ls.push({ x: DOOR_X, y: GY - 100, r: 160, a: 0.6 });
  // (the doorway's neon, over it on the header: always on)
  ls.push({ x: DOOR_X - 20, y: DOOR_SIGN.y + 14, r: 160, a: 0.7, color: 'rgba(244, 114, 182, 0.16)' });
  ls.push({ x: DOOR_X + 10, y: DOOR_SIGN.y + 34, r: 120, a: 0.5, color: 'rgba(34, 211, 238, 0.12)' });
  ls.push({ x: REFILL_X, y: GY - 100, r: 120, a: 0.6, color: 'rgba(255, 245, 230, 0.08)' });
  ls.push({ x: EXTINGUISHER_X, y: GY - 115, r: 70, a: 0.5, color: 'rgba(239, 68, 68, 0.14)' });
  ls.push({ x: state.player.pos.x + 20, y: state.player.pos.y + 30, r: 130, a: 0.5 });
  return { dark: on ? 0.84 - 0.24 * l : 0.86, shade: [12, 3, 26], lights: ls, rim: 0.55 };
};

// ---------------------------------------------------------------------------------------------------------------
// The glow pass: the light you see in the air, over the lit frame (call from drawHud with the world's transform on)

export const discoGlow = (c: Ctx, state: GameState, lights: number) => {
  if (lights <= 0.5 || !shown(state, DISCO_L - 60, DISCO_R + 60)) return;
  const f = state.frame, l = Math.min(1, lights);
  c.save();
  // (nothing drawn over the signs: the light in the air keeps off the neon's board and the doorway's sign)
  const v = state.view ?? { x: state.camera.x, w: CANVAS_WIDTH };
  c.beginPath(); c.rect(v.x - 400, GY - 1200, v.w + 800, 1600);
  c.rect(NEON.x - 2, NEON.y - 2, NEON.w + 4, NEON.h + 4); c.rect(DOOR_SIGN.x - 4, DOOR_SIGN.y - 12, DOOR_SIGN.w + 8, DOOR_SIGN.h + 14);
  c.clip('evenodd');
  c.globalCompositeOperation = 'lighter';
  // (the ball's rays: thin stippled lines out to each spot, faint)
  for (let k = 0; k < SPOTS; k++) {
    const s = spotAt(k, f);
    if (!s.front) continue;
    c.strokeStyle = dith(c, k % 4 === 1 ? 'rgba(240, 171, 252, 0.36)' : 'rgba(226, 232, 240, 0.3)', 2, k % 2); c.lineWidth = 2;
    c.beginPath(); c.moveTo(BALL.x, BALL.y); c.lineTo(s.x, s.y); c.stroke();
    // (the spot's own bloom: two rings)
    c.fillStyle = 'rgba(248, 250, 252, 0.10)'; c.beginPath(); c.arc(s.x, s.y, 12, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(248, 250, 252, 0.14)'; c.beginPath(); c.arc(s.x, s.y, 6, 0, Math.PI * 2); c.fill();
  }
  // (the cans' beams: from each lens down to its pool, stippled color, three steps wide)
  CANS.forEach((cn, k) => {
    const hx = canHit(k, f), top = TRUSS_Y + 44, rgb = TILE_RGB[cn.col];
    for (let s = 0; s < 3; s++) {
      const hw = 10 + s * 22, tw = 6 + s * 3, a = [0.09, 0.05, 0.03][s] * l;
      c.fillStyle = s === 2 ? dith(c, `rgba(${rgb}, ${a * 2})`, 2, k % 2) : `rgba(${rgb}, ${a})`;
      c.beginPath(); c.moveTo(cn.x - tw, top); c.lineTo(cn.x + tw, top); c.lineTo(hx + hw, GY); c.lineTo(hx - hw, GY); c.closePath(); c.fill();
    }
  });
  // (the ball's own glow: stepped rings)
  for (let r = 3; r >= 1; r--) { c.fillStyle = `rgba(226, 232, 240, ${(0.05 * r * l).toFixed(3)})`; c.beginPath(); c.arc(BALL.x, BALL.y, 30 + (4 - r) * 16, 0, Math.PI * 2); c.fill(); }
  // (the neon's bloom: a band of its color round the board, stepped (the board itself kept clear))
  for (let s = 0; s < 3; s++) {
    const pad = 6 + s * 10, a = [0.10, 0.06, 0.035][s] * l, mid = (NEON.ga + NEON.gr) / 2;
    c.fillStyle = `rgba(244, 114, 182, ${a})`; c.fillRect(NEON.x - pad, NEON.y - pad, mid - NEON.x + pad, NEON.h + pad * 2);
    c.fillStyle = `rgba(34, 211, 238, ${a})`; c.fillRect(mid, NEON.y - pad, NEON.x + NEON.w - mid + pad, NEON.h + pad * 2);
  }
  // (the glow up off the floor: each lit tile's color rising in three stepped bands)
  const v0 = state.camera.x - 100, v1 = state.camera.x + CANVAS_WIDTH + 100;
  for (let i = 0; i < TN; i++) {
    const x = T0 + i * TW;
    if (x < v0 || x > v1) continue;
    const k = tileAt(i, 0, f, true);
    if (k < 0) continue;
    for (let s = 0; s < 3; s++) { c.fillStyle = `rgba(${TILE_RGB[k]}, ${([0.16, 0.09, 0.045][s] * l).toFixed(3)})`; c.fillRect(x + 2, GY - 6 - s * 8, TW - 4, 8); }
  }
  // (the booth's windows: its green out through the glass)
  c.fillStyle = 'rgba(74, 222, 128, 0.07)'; c.fillRect(DJ.x - 8, DJ.y - 6, DJ.w + 16, DJ.h + 12);
  c.restore();
};
