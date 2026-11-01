// The hidden armor's places, drawn (hidden.ts has the what and why):
//
//   THE OPENING in the trolley pit's balls: a dark hole down through them, the balls rimming it tipping in, and a shaft
//     of light coming down into it from above (wider as it goes, banded, dust in it): readable as "something's down
//     there" from the track, easy to miss from the ground. Painted once (the stamp cache); only the motes move.
//   THE CAVE under the park: packed earth in banded strata, roots down through the ceiling, lost balls stuck in the
//     walls; the shaft he fell down, its light on a heap of balls that came down with him; a second ragged hole where
//     the cannon punches him out; CON-FUCK-TIOUS's gym-bro hideout: a rubber mat, his heavy bag on a chain, a rusty
//     squat rack and its bench, plates, protein tubs, a NO PAIN NO GAIN poster, a cot, a hot plate and a cup of
//     noodles, his cardboard sign (BEN'S HOLE. NO SOLICITING.), and the last kid found in 1997
//     (a skeleton in a windbreaker, still holding his Game Boy). The floor's lit along its top (it's stood on). Painted
//     once in three chunks; Ben, the cannon, the motes live over it.

import type { GameState } from '../../../m1/game/core/state';
import { stamp } from '../../../m1/game/render/stamp';
import { checker } from '../../../m1/game/render/pixelArt';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawCannon } from '../../upgrades/returnCannon';
import { drawBen, benHeadY } from '../../upgrades/confucktious';
import { saidOver } from '../section';
import { GY } from '../geometry';
import { HOLE } from './layout';
import { CAVE, SHAFT_X, BEN_X, BAG_X, HOLE_X, hiddenOf, cannonHoleX } from './hidden';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A1028';
const box = (g: Ctx, x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const ell = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
const poly = (g: Ctx, pts: [number, number][], col: string) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
const BALLS = ['#EF4444', '#FDE047', '#3B82F6', '#22C55E', '#F472B6', '#FB923C'];
const ramp = (col: string) => { const m = (a: string, b: string, k: number) => { const p = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`; }; return [m(col, INK, 0.6), m(col, INK, 0.3), col, m(col, '#FFFFFF', 0.4)]; };
const ball = (g: Ctx, x: number, y: number, r: number, col: string) => { const R = ramp(col); ell(g, x, y, r + 1, r + 1, INK); ell(g, x, y, r, r, R[1]); ell(g, x - r * 0.15, y - r * 0.15, r * 0.75, r * 0.75, R[2]); box(g, x - r * 0.5, y - r * 0.55, Math.max(1, r * 0.3), Math.max(1, r * 0.3), R[3]); };
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const fontReady = () => typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"');

// ---------------------------------------------------------------------------------------------------------------
// The opening in the pit (world, drawn over the pit's balls in the section's drawBack)

const BEAM_TOP = GY - 760;
const paintHole = (g: Ctx) => {
  const hw = (HOLE.b - HOLE.a) / 2;
  // (the shaft of light coming down into it: widening, in bands, brighter in its middle)
  const bands = 6;
  for (let i = 0; i < bands; i++) {
    const k = i / bands, top = hw * 0.5 + 4 - k * 4, bot = hw + 6 - k * 10;
    g.fillStyle = `rgba(255,246,200,${0.05 + k * 0.035})`;
    g.beginPath(); g.moveTo(-top, BEAM_TOP - GY); g.lineTo(top, BEAM_TOP - GY); g.lineTo(bot, 0); g.lineTo(-bot, 0); g.closePath(); g.fill();
  }
  // (the hole: dark, going down, its far wall lit by the light falling in)
  ell(g, 0, 4, hw + 2, 12, INK);
  ell(g, 0, 4, hw, 10.5, '#120A1E');
  ell(g, 0, 6, hw - 6, 7, '#1E1430');
  ell(g, 0, 2, hw - 4, 5, 'rgba(255,240,190,0.22)');
  checker(g, -hw + 6, -2, hw * 2 - 12, 4, 'rgba(255,240,190,0.18)', 0, 1);
  // (the balls rimming it, tipping in: the back ones higher, the front ones over its lip)
  for (let k = 0; k < 14; k++) {
    const a = Math.PI + (k / 13) * Math.PI;
    ball(g, Math.cos(a) * (hw + 4), 3 + Math.sin(a) * 9, 5.5 + (k % 2), BALLS[(k * 5) % BALLS.length]);
  }
  for (let k = 0; k < 9; k++) {
    const a = (k / 8) * Math.PI;
    ball(g, Math.cos(a) * (hw + 3), 6 + Math.sin(a) * 9, 6, BALLS[(k * 3 + 1) % BALLS.length]);
  }
  // (a glow on the balls nearest the light)
  g.fillStyle = 'rgba(255,246,200,0.16)'; g.beginPath(); g.ellipse(0, 4, hw + 14, 16, 0, 0, Math.PI * 2); g.fill();
};
export const drawHoleBack = (c: Ctx, state: GameState) => {
  const L = state.camera.x - 120, R = state.camera.x + CANVAS_WIDTH + 120;
  if (HOLE_X < L || HOLE_X > R) return;
  c.save(); c.translate(Math.round(HOLE_X), GY);
  stamp(c, 'ct-hole', -70, BEAM_TOP - GY - 4, 140, GY - BEAM_TOP + 30, paintHole);
  c.restore();
  // (dust turning in the light)
  const f = state.frame;
  for (let i = 0; i < 9; i++) {
    const u = ((f * 0.4 + i * 71) % 600) / 600, y = BEAM_TOP + 60 + u * (GY - BEAM_TOP - 70), sp = 10 + u * 22;
    c.fillStyle = `rgba(255,250,220,${0.25 + 0.35 * Math.sin(u * Math.PI)})`;
    c.fillRect(Math.round(HOLE_X + Math.sin(f * 0.02 + i * 2.1) * sp), Math.round(y), 2, 2);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The cave

/** Screen space, behind everything while he's down there: earth, in dark bands. */
export const drawCaveBackdrop = (c: Ctx) => {
  const cols = ['#0E0814', '#140C1C', '#1A1024', '#20142A', '#261830'];
  const bh = CANVAS_HEIGHT / cols.length;
  cols.forEach((col, i) => { box(c, 0, i * bh, CANVAS_WIDTH, bh + 1, col); if (i) checker(c, 0, i * bh - 1, CANVAS_WIDTH, 2, col, i % 2, 2); });
};

const W = CAVE.b - CAVE.a, H = CAVE.floor - CAVE.ceil;
/** The whole cave in its own coordinates (x from its left end, y up from its floor: the ceiling at -H). */
const paintCave = (g: Ctx, holeX: number) => {
  const sx = SHAFT_X - CAVE.a, hx = holeX - CAVE.a;
  // ---- the back wall: strata in bands, dithered seams
  const STRATA = ['#3A2430', '#432A36', '#4E3240', '#3E2834', '#4A2E3A', '#5A3A44', '#4A303C'];
  for (let i = 0; i < STRATA.length; i++) {
    const y0 = -H - 40 + (i * (H + 40)) / STRATA.length;
    box(g, -60, y0, W + 120, (H + 40) / STRATA.length + 1, STRATA[i]);
    if (i) checker(g, -60, y0 - 1, W + 120, 2, STRATA[i], i % 2, 2);
    // (a wavy dark line along each seam)
    g.strokeStyle = 'rgba(14,8,20,0.45)'; g.lineWidth = 2; g.beginPath();
    for (let x = -60; x <= W + 60; x += 20) { const y = y0 + Math.sin(x * 0.02 + i) * 4; if (x === -60) g.moveTo(x, y); else g.lineTo(x, y); }
    g.stroke();
  }
  // (stones in it, a few lost balls stuck in the dirt, a buried soda can)
  for (let k = 0; k < 40; k++) { const x = hash(k) * W, y = -H + 20 + hash(k + 50) * (H - 60), r = 3 + hash(k + 9) * 6; ell(g, x, y, r + 1, r * 0.7 + 1, '#1E1220'); ell(g, x, y, r, r * 0.7, '#5E4A52'); box(g, x - r * 0.4, y - r * 0.4, 2, 1, '#8A747A'); }
  for (let k = 0; k < 12; k++) ball(g, 40 + hash(k + 200) * (W - 80), -H + 60 + hash(k + 300) * (H - 120), 5, BALLS[k % BALLS.length]);
  box(g, 930, -260, 10, 16, INK); box(g, 931, -259, 8, 14, '#DC2626'); box(g, 931, -255, 8, 3, '#F8FAFC');
  // ---- the side walls: darker rock, jutting
  for (const [x0, s] of [[0, 1], [W, -1]] as const) {
    poly(g, [[x0 - s * 60, -H - 60], [x0 + s * 30, -H - 60], [x0 + s * 18, -H * 0.6], [x0 + s * 36, -H * 0.3], [x0 + s * 14, 0], [x0 - s * 60, 0]], '#1A0E1C');
    poly(g, [[x0 + s * 30, -H - 60], [x0 + s * 18, -H * 0.6], [x0 + s * 36, -H * 0.3], [x0 + s * 14, 0], [x0 + s * 10, 0], [x0 + s * 30, -H * 0.3], [x0 + s * 12, -H * 0.6], [x0 + s * 24, -H - 60]], '#3A2430');
  }
  // ---- the ceiling: a thick band, jagged under, roots hanging; the two openings
  const ceil = (x: number) => -H + Math.sin(x * 0.05) * 6 + Math.sin(x * 0.13) * 4;
  const open = (x: number) => Math.abs(x - sx) < 44 || Math.abs(x - hx) < 34;
  for (let x = -60; x < W + 60; x += 4) {
    if (open(x)) continue;
    box(g, x, -H - 400, 4, ceil(x) + H + 400, '#160C18');
    box(g, x, ceil(x) - 4, 4, 4, '#2A1824');
    if (hash(x) > 0.8) { const len = 10 + hash(x + 1) * 40; g.strokeStyle = '#4A3226'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, ceil(x)); g.quadraticCurveTo(x + 6, ceil(x) + len / 2, x + 2, ceil(x) + len); g.stroke(); }
  }
  // (the openings' rims: the ball pit's balls jammed in the shaft's mouth; the cannon's hole ragged, clods round it)
  for (let k = 0; k < 10; k++) ball(g, sx - 44 + (k % 2 ? 88 : 0) + (k % 2 ? -1 : 1) * hash(k) * 6, ceil(sx) - 30 - k * 14, 5.5, BALLS[k % BALLS.length]);
  for (let k = 0; k < 8; k++) { const x = hx - 34 + (k % 2 ? 68 : 0), y = ceil(hx) - 8 - k * 9; ell(g, x, y, 7, 5, '#160C18'); ell(g, x - 1, y - 1, 5, 3, '#3A2430'); }
  // ---- the light: down the shaft, onto the heap and the floor (and fainter down the cannon's hole)
  for (const [x, w0, w1, a] of [[sx, 34, 110, 0.06], [hx, 24, 70, 0.035]] as const) {
    for (let i = 0; i < 5; i++) {
      const k = i / 5;
      g.fillStyle = `rgba(255,244,196,${a + k * 0.03})`;
      g.beginPath(); g.moveTo(x - w0 * (1 - k * 0.5), -H - 400); g.lineTo(x + w0 * (1 - k * 0.5), -H - 400); g.lineTo(x + w1 * (1 - k * 0.6), 0); g.lineTo(x - w1 * (1 - k * 0.6), 0); g.closePath(); g.fill();
    }
  }
  g.fillStyle = 'rgba(255,244,196,0.12)'; g.beginPath(); g.ellipse(sx, 0, 120, 14, 0, 0, Math.PI * 2); g.fill();
  // ---- his hideout: a gym-bro's basement (all set dressing, dimmed: none of it's stood on)
  // (a bodybuilding poster taped to the dirt, curling, torn: NO PAIN NO GAIN)
  const poX = BEN_X - CAVE.a - 20;
  box(g, poX - 30, -300, 60, 84, '#14101A'); box(g, poX - 29, -299, 58, 82, '#6A5A4A'); box(g, poX - 27, -297, 54, 50, '#7A4A3A');
  ell(g, poX, -272, 8, 9, '#5A3020'); poly(g, [[poX - 22, -252], [poX + 22, -252], [poX + 14, -262], [poX - 14, -262]], '#5A3020');
  poly(g, [[poX + 29, -217], [poX + 29, -232], [poX + 16, -217]], '#2A1E24');
  box(g, poX - 32, -302, 10, 4, '#9A9480'); box(g, poX + 22, -302, 10, 4, '#9A9480');
  if (fontReady()) { g.font = '7px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = '#C8B89A'; g.fillText('NO PAIN', poX, -236); g.fillText('NO GAIN', poX - 2, -224); g.textAlign = 'left'; }
  // (the rusty squat rack, its bar loaded with mismatched plates; the bench under it, its vinyl split and taped)
  const rk = 470;
  for (const ux of [rk, rk + 90]) { box(g, ux - 4, -156, 8, 156, '#14101A'); box(g, ux - 3, -155, 6, 155, '#5A3A2A'); box(g, ux - 3, -155, 2, 155, '#7A5236'); for (let y = -150; y < -10; y += 12) box(g, ux - 1, y, 2, 2, '#14101A'); }
  box(g, rk - 34, -124, 158, 5, '#14101A'); box(g, rk - 33, -123, 156, 3, '#6A6A72');
  for (const [px, r, col] of [[rk - 24, 22, '#2A2A30'], [rk - 14, 16, '#5A2A2A'], [rk + 104, 22, '#2A2A30'], [rk + 114, 14, '#3A3A5A']] as const) { box(g, px - 4, -122 - r, 8, r * 2, '#14101A'); box(g, px - 3, -121 - r, 6, r * 2 - 2, col); }
  box(g, rk + 6, -34, 78, 10, '#14101A'); box(g, rk + 7, -33, 76, 8, '#3A1A1E'); box(g, rk + 30, -33, 14, 8, '#6A6A60');
  box(g, rk + 14, -24, 5, 24, '#14101A'); box(g, rk + 70, -24, 5, 24, '#14101A');
  // (a stack of plates on the floor by it)
  for (let i = 0; i < 4; i++) { box(g, 590 - 16 + i, -8 - i * 6, 34 - i * 2, 6, '#14101A'); box(g, 591 - 16 + i, -7 - i * 6, 32 - i * 2, 4, ['#2A2A30', '#3A3A44', '#2A2A30', '#4A2A2A'][i]); }
  // (protein tubs, one tipped over, the scoop out)
  for (const [tx, col] of [[812, '#3A3A6A'], [834, '#5A2A2A']] as const) { box(g, tx - 9, -30, 18, 30, '#14101A'); box(g, tx - 8, -29, 16, 28, col); box(g, tx - 8, -22, 16, 8, '#A8A090'); box(g, tx - 9, -33, 18, 4, '#14101A'); }
  ell(g, 856, -8, 14, 8, '#14101A'); ell(g, 856, -8, 13, 7, '#2A4A3A'); box(g, 864, -6, 10, 2, '#C8C0B0');
  // (his cardboard sign, leaned on the wall)
  const sgX = 1060;
  poly(g, [[sgX - 40, -10], [sgX + 40, -12], [sgX + 44, -66], [sgX - 36, -70]], INK);
  poly(g, [[sgX - 38, -12], [sgX + 38, -14], [sgX + 42, -64], [sgX - 34, -68]], '#C8A070');
  box(g, sgX - 30, -50, 64, 1, '#A07E52');
  if (fontReady()) { g.font = '7px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = '#2A1810'; g.fillText("BEN'S HOLE.", sgX + 3, -48); g.fillText('NO', sgX + 3, -36); g.fillText('SOLICITING.', sgX + 3, -26); g.textAlign = 'left'; }
  // (the last kid found, 1997: a skeleton sat against the wall in a teal-and-purple windbreaker, his Game Boy)
  const kx = 1140;
  box(g, kx - 10, -30, 22, 22, INK); box(g, kx - 9, -29, 10, 20, '#14B8A6'); box(g, kx + 1, -29, 10, 20, '#7C3AED'); box(g, kx - 9, -22, 20, 3, '#F472B6');
  ell(g, kx + 1, -40, 9, 9, INK); ell(g, kx + 1, -40, 8, 8, '#E8E0CC'); box(g, kx - 3, -42, 3, 3, INK); box(g, kx + 3, -42, 3, 3, INK); box(g, kx, -37, 2, 2, INK); for (let i = 0; i < 4; i++) box(g, kx - 3 + i * 2, -34, 1, 2, INK);
  box(g, kx + 12, -14, 14, 4, INK); box(g, kx + 12, -13, 14, 2, '#E8E0CC'); box(g, kx - 18, -13, 10, 3, '#E8E0CC');
  box(g, kx + 10, -26, 9, 13, INK); box(g, kx + 11, -25, 7, 11, '#B8B4A8'); box(g, kx + 12, -24, 5, 4, '#7A9A3A');
  // (the cot and its pillow; the hot plate and the noodles)
  box(g, 880, -22, 90, 6, INK); box(g, 881, -21, 88, 4, '#4A5A3A'); box(g, 884, -16, 3, 16, INK); box(g, 962, -16, 3, 16, INK); ell(g, 892, -26, 10, 5, INK); ell(g, 892, -26, 9, 4, '#E8E4F0');
  box(g, 990, -14, 26, 10, INK); box(g, 991, -13, 24, 8, '#6A6A74'); ell(g, 1003, -14, 8, 2, '#E2465E');
  box(g, 997, -28, 13, 14, INK); box(g, 998, -27, 11, 12, '#F8F4EC'); box(g, 998, -24, 11, 3, '#DC2626'); box(g, 1006, -36, 1, 10, '#E8D49A'); box(g, 1008, -36, 1, 10, '#E8D49A');
  // (a rubber gym mat under him, scuffed)
  const mx = BEN_X - CAVE.a;
  box(g, mx - 110, -6, 220, 7, INK); box(g, mx - 109, -5, 218, 5, '#2A2A30'); box(g, mx - 109, -5, 218, 1, '#4A4A52');
  for (let x = mx - 104; x < mx + 108; x += 36) box(g, x, -4, 1, 4, '#16161C');
  // (his heavy bag, on a chain off the ceiling: red vinyl gone brown, duct-taped round the middle)
  const wx = BAG_X - CAVE.a;
  for (let y = -H + 10; y < -118; y += 6) { box(g, wx - 2, y, 4, 4, '#14101A'); box(g, wx - 1, y + 1, 2, 2, '#6A6A72'); }
  box(g, wx - 15, -120, 30, 92, INK); box(g, wx - 14, -119, 28, 90, '#5A1E1E'); box(g, wx - 14, -119, 6, 90, '#7A2A26'); box(g, wx + 7, -119, 7, 90, '#3E1414');
  box(g, wx - 14, -82, 28, 12, '#9A9A9E'); box(g, wx - 14, -82, 28, 2, '#C8C8CC'); box(g, wx - 14, -119, 28, 4, '#2A0E0E');
  // ---- the floor: packed earth, lit along its top (it's stood on)
  box(g, -60, 0, W + 120, 160, '#2E1C26');
  for (let i = 0; i < 4; i++) { box(g, -60, 10 + i * 30, W + 120, 30, ['#3A2430', '#321E2A', '#2A1824', '#22141E'][i]); checker(g, -60, 9 + i * 30, W + 120, 2, ['#3A2430', '#321E2A', '#2A1824', '#22141E'][i], i % 2, 2); }
  box(g, -60, 0, W + 120, 3, '#8A6A72'); box(g, -60, 0, W + 120, 1, '#C8AAB0');
  for (let k = 0; k < 30; k++) box(g, hash(k + 700) * W, 14 + hash(k + 800) * 120, 3, 2, '#5A4048');
  // ---- the heap of balls that came down with the light (and him)
  for (let row = 0; row < 4; row++) for (let k = 0; k < 9 - row * 2; k++) ball(g, sx - 52 + row * 13 + k * 13 + (row % 2) * 2, -5 - row * 10, 6.5, BALLS[(k * 7 + row * 3) % BALLS.length]);
};

export const drawCaveBack = (c: Ctx, state: GameState) => {
  const h = hiddenOf(state);
  const hx = Math.round(cannonHoleX(state));
  // (painted once, in three chunks so no one canvas is huge)
  const font = fontReady() ? 'f' : 'n';
  c.save(); c.translate(CAVE.a, CAVE.floor);
  for (let i = 0; i < 3; i++) {
    const bx = -60 + i * ((W + 120) / 3), bw = (W + 120) / 3;
    if (CAVE.a + bx + bw < state.camera.x - 20 || CAVE.a + bx > state.camera.x + CANVAS_WIDTH + 20) continue;
    stamp(c, `ct-cave-${i}-${hx}-${font}`, bx, -H - 420, bw, H + 580, g => {
      g.save(); g.beginPath(); g.rect(bx, -H - 420, bw, H + 580); g.clip(); paintCave(g, hx); g.restore();
    });
  }
  c.restore();
  // (dust in the shaft's light)
  const f = state.frame;
  for (let i = 0; i < 10; i++) {
    const u = ((f * 0.3 + i * 53) % 500) / 500, y = CAVE.ceil + u * H;
    c.fillStyle = `rgba(255,250,220,${0.2 + 0.35 * Math.sin(u * Math.PI)})`;
    c.fillRect(Math.round(SHAFT_X + Math.sin(f * 0.015 + i * 1.7) * (20 + u * 60)), Math.round(y), 2, 2);
  }
  drawCannon(c, h.cannon);
  const b = h.ben;
  drawBen(c, BEN_X, CAVE.floor - 4, b.facing, b.pose, Math.floor(b.poseT / 5), b.piece);
  // (his shaker, knocked out of his hand by the kick: tumbling, then lying on its side)
  const sk = h.shaker;
  if (sk) {
    const down = sk.vx === 0 && sk.vy === 0;
    c.save(); c.translate(Math.round(sk.x), Math.round(sk.y)); c.rotate(down ? Math.PI / 2 : state.frame * 0.3);
    c.fillStyle = '#1A1028'; c.fillRect(-5, -16, 10, 18); c.fillStyle = '#2563EB'; c.fillRect(-4, -15, 8, 14); c.fillStyle = '#BFDBFE'; c.fillRect(-4, -15, 2, 14);
    c.fillStyle = '#F8FAFC'; c.fillRect(-4, -10, 8, 3); c.fillStyle = '#111827'; c.fillRect(-3, -19, 6, 4);
    c.restore();
  }
};
export const drawCaveFront = (c: Ctx, state: GameState) => {
  const h = hiddenOf(state);
  // (his words over his head, only while they're said; not while his gross-up's got them)
  if (h.ben.said && !(h.phase === 'meet' && h.script?.gross)) saidOver(c, h.ben.said.text, BEN_X, benHeadY(CAVE.floor - 4), '#FFFFFF', 220);
};
