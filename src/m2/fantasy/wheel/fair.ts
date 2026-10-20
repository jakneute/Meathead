// The fairy wheel's plaza, round the play plane (world space, one eye: kit.ts's view). Going back from him:
//
//   the plaza's flags        running back from the kerb to the hedge (joints going toward the eye, snow banked at
//                            the back), and in front the paving the fair's on, scanline-bent, its kerb's lit lip
//   the hedge and trees      at TREE_D: a clipped hedge with its topiary, snowy pines and bare trees strung with
//                            fairy lights behind it, all the way along
//   the midway               at ROW_D, with real sides going back: game booths (RING TOSS, DUCK SHOOT, HOOK A FROG,
//                            KNOCK 'EM DOWN, GUESS YOUR WEIGHT, plush prizes hung up), food stalls with what they sell
//                            big on their roofs (BUTTER BREW, TURKEY LEGS, FAIRY FLOSS, PRETZELS, CHURROS), the
//                            fortune teller's tent, the strongman's TEST YOUR STRENGTH, gift shops with turrets, and
//                            behind the wheel its boarding pavilion
//   the plaza's furniture    at PROP_D: lamp posts with fairy lights strung between them, the crowds behind their
//                            rope rails (seeded: women and men, kids, skin tones, builds, hair, hats; bobbing,
//                            cheering), topiary, benches, a candy cart, and the fountain (Piper in bronze, water live)
//
// Painted once for the hour (stamps); the crowds in two bob frames; the fountain's water live. Nothing here's stood on.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { signText } from '../../signLetters';
import { timeOfDay } from '../../timeOfDay';
import { tilePattern, bendFloor } from '../../intro/art/kit';
import {
  type Ctx, type View, INK, box, mix, hash, checker, gilt, at, atDepth, stillAt, seen, polyF, sideBack, postR, ballR, snowCap,
  FLAG, SNOW, IRON, GOLD, PINE, TIMBER, STONE, LIP, ramp6, rampH, hour, dimmed, lit,
} from '../kit';
import { GY } from '../geometry';
import { X } from './layout';

export const TREE_D = 0.72, ROW_D = 0.8, SIDE_D = 0.76, PROP_D = 0.92, FOUNT_D = 0.88;
const BULB = ['#FFE9A8', '#FFB0D8', '#A8E8FF', '#C8FFB8'];

// ---------------------------------------------------------------------------------------------------------------
// The midway's pieces (x from the section's start)

type Kind = 'booth' | 'food' | 'tent' | 'striker' | 'gift' | 'pavilion';
interface Piece { x: number; w: number; h: number; kind: Kind; seed: number }
const W_OF: Record<Kind, number> = { booth: 170, food: 150, tent: 150, striker: 80, gift: 230, pavilion: 340 };
const H_OF: Record<Kind, number> = { booth: 130, food: 150, tent: 170, striker: 250, gift: 200, pavilion: 190 };
const CYCLE: Kind[] = ['food', 'booth', 'tent', 'booth', 'food', 'striker', 'gift', 'booth', 'food', 'booth', 'tent', 'food', 'booth', 'gift'];
export const PIECES: Piece[] = (() => {
  const out: Piece[] = [];
  let x = -560, i = 0;
  while (x < 6560) {
    let kind = CYCLE[i % CYCLE.length];
    if (x > 2600 && !out.some(p => p.kind === 'pavilion')) { kind = 'pavilion'; x = Math.max(x, 2830); }
    out.push({ x, w: W_OF[kind], h: H_OF[kind], kind, seed: i * 7 + 3 });
    x += W_OF[kind] + 22 + Math.floor(hash(i * 3.7) * 14); i++;
  }
  return out;
})();
const GAMES = ['RING TOSS', 'DUCK SHOOT', 'HOOK A FROG', "KNOCK 'EM DOWN", 'GUESS YOUR WEIGHT', 'WHACK A GNOME'];
const FOODS = ['BUTTER BREW', 'TURKEY LEGS', 'FAIRY FLOSS', 'PRETZELS', 'CHURROS'];
const GIFTS = ['PIXIE DUST', 'WANDS', 'TIARAS'];

const D = (col: string) => dimmed(col);
const R6 = (col: string) => rampH(ramp6(col), true);
const stripes = (g: Ctx, x: number, y: number, w: number, h: number, n: number, a: string, b: string) => { for (let k = 0; k < n; k++) box(g, x + Math.floor((k * w) / n), y, Math.ceil(w / n) + 1, h, k % 2 ? a : b); };
/** A scalloped, striped awning from x..x+w at y, `d` deep. */
const awning = (g: Ctx, x: number, y: number, w: number, d: number, A: string[], B: string[]) => {
  const n = Math.max(4, Math.round(w / 16));
  polyF(g, [[x - 5, y + d + 1], [x + 3, y - 1], [x + w - 3, y - 1], [x + w + 5, y + d + 1]], INK);
  for (let k = 0; k < n; k++) {
    const a = x + (k * w) / n, b = x + ((k + 1) * w) / n, R = k % 2 ? A : B;
    polyF(g, [[a - 4 + (8 * k) / n, y + d], [a + 2, y], [b + 2, y], [b - 4 + (8 * (k + 1)) / n, y + d]], R[3]);
    box(g, a + 2, y, (b - a) * 0.4, 2, R[4]);
    g.fillStyle = INK; g.beginPath(); g.arc((a + b) / 2, y + d, (b - a) / 2 + 1, 0, Math.PI); g.fill();
    g.fillStyle = R[2]; g.beginPath(); g.arc((a + b) / 2, y + d, (b - a) / 2, 0, Math.PI); g.fill();
    box(g, (a + b) / 2 - (b - a) / 4, y + d + 1, (b - a) / 3, 1, R[4]);
  }
};
/** A plush prize (a unicorn, a dragon, a bear, a heart) hung up, at (x, y) its top. */
const plush = (g: Ctx, x: number, y: number, s: number) => {
  const col = ['#F49AC8', '#9EE6C8', '#C8A8F4', '#FFC8A0', '#FDE047'][s % 5], R = R6(col), kind = s % 4;
  box(g, x, y - 4, 1, 4, D('#3A3448'));
  ballR(g, x, y + 8, 6, R); ballR(g, x, y + 18, 8, R);
  box(g, x - 3, y + 6, 1, 1, INK); box(g, x + 2, y + 6, 1, 1, INK);
  if (kind === 0) { polyF(g, [[x - 1, y + 2], [x + 1, y - 6], [x + 2, y + 2]], D('#F6D365')); box(g, x - 6, y + 2, 2, 6, D('#C084FC')); }
  if (kind === 1) for (let k = 0; k < 3; k++) polyF(g, [[x + 4 + k * 2, y + 12 + k * 4], [x + 10 + k * 2, y + 12 + k * 4], [x + 6 + k * 2, y + 8 + k * 4]], R[1]);
  if (kind === 2) { ballR(g, x - 5, y + 2, 3, R); ballR(g, x + 5, y + 2, 3, R); }
  if (kind === 3) { box(g, x - 2, y + 15, 5, 4, D('#E11D48')); }
};
/** The name over a stall: a painted board, the letters in gilt. */
const board = (g: Ctx, cx: number, y: number, w: number, text: string, field: string) => {
  const F = R6(field);
  box(g, cx - w / 2 - 1, y - 1, w + 2, 16, INK); box(g, cx - w / 2, y, w, 14, F[2]); box(g, cx - w / 2, y, w, 2, F[4]); box(g, cx - w / 2, y + 12, w, 2, F[1]);
  for (const ex of [cx - w / 2 - 3, cx + w / 2 - 1]) box(g, ex, y + 3, 4, 8, D('#E0AE3A'));
  signText(g, text, cx, y + 11, gilt(1));
};

const paintPiece = (g: Ctx, p: Piece) => {
  const { w, h, seed } = p, S = rampH(SNOW, true), Tm = rampH(TIMBER, true), I = rampH(IRON, true), Gd = rampH(GOLD, true);
  const k = Math.floor(hash(seed) * 97), night = lit();
  const cols = ['#E0408A', '#4A78D4', '#3A9A6A', '#8A4AC8', '#E07A1E'], main = cols[k % cols.length], M = R6(main), Wh = R6('#FFF4F8');
  if (p.kind === 'booth') {
    // (a game booth: a timber frame, the back wall hung with plush, the counter, the striped awning, the board)
    const top = -h + 30;
    box(g, -1, top - 1, w + 2, -top + 1, INK); box(g, 0, top, w, -top, Tm[2]);
    box(g, 6, top + 8, w - 12, -top - 40, night ? D('#7A4A3A') : Tm[1]);
    for (let i = 0; i < Math.floor((w - 20) / 22); i++) plush(g, 18 + i * 22, top + 14 + (i % 2) * 8, seed + i);
    if (k % 3 === 0) for (let i = 0; i < 5; i++) { box(g, 16 + i * 28, -46, 18, 10, D('#F6D365')); box(g, 18 + i * 28, -44, 6, 4, D('#F97316')); }
    box(g, -2, -36, w + 4, 6, INK); box(g, -1, -35, w + 2, 4, Tm[4]); box(g, -1, -35, w + 2, 1, Tm[5]);
    box(g, 0, -30, w, 30, M[2]); stripes(g, 0, -30, w, 30, 8, M[2], Wh[2]); box(g, 0, -30, w, 2, M[4]); box(g, w - 6, -30, 6, 30, M[0]);
    for (const x of [0, w - 6]) { box(g, x - 1, top - 6, 8, -top + 6, INK); box(g, x, top - 6, 6, -top + 6, Tm[3]); box(g, x, top - 6, 2, -top + 6, Tm[5]); }
    awning(g, -4, top - 2, w + 8, 18, M, Wh);
    board(g, w / 2, top - 30, Math.min(w - 10, 150), GAMES[k % GAMES.length], '#4A1A5A');
    if (night) for (let i = 0; i < 8; i++) box(g, 8 + i * ((w - 16) / 7), top + 20, 2, 2, BULB[i % 4]);
    snowCap(g, w / 2 - 60, top - 30, 120, 3, seed, S, false);
  } else if (p.kind === 'food') {
    // (a food stall: a timber hut, its hatch and counter lit, what it sells big on the roof, the menu, a stool)
    const top = -h + 46, which = k % FOODS.length;
    box(g, -1, top - 1, w + 2, -top + 1, INK); box(g, 0, top, w, -top, Tm[3]); box(g, 0, top, 4, -top, Tm[4]); box(g, w - 6, top, 6, -top, Tm[1]);
    for (let y = top + 8; y < 0; y += 9) box(g, 0, y, w, 1, Tm[1]);
    box(g, 14, top + 18, w - 28, 44, INK); box(g, 15, top + 19, w - 30, 42, night ? D('#F0A83E') : D('#C0864A')); box(g, 15, top + 19, w - 30, 6, night ? D('#FFD87A') : D('#E8B874'));
    for (let i = 0; i < 4; i++) box(g, 22 + i * ((w - 50) / 3), top + 40, 8, 14, D(['#C8E4F4', '#F4E8C8', '#F49AC8', '#9EE6C8'][i]));
    box(g, 8, top + 60, w - 16, 6, INK); box(g, 9, top + 61, w - 18, 4, Tm[5]);
    awning(g, 4, top + 2, w - 8, 14, M, Wh);
    box(g, w - 30, top + 72, 24, 30, INK); box(g, w - 29, top + 73, 22, 28, D('#2A2A38')); for (let i = 0; i < 4; i++) box(g, w - 26, top + 77 + i * 6, 12 + (i % 2) * 4, 2, D('#F4F0FA'));
    // (the roof's prop)
    const cx = w / 2, ry = top - 4;
    polyF(g, [[-6, top + 2], [cx, top - 22], [w + 6, top + 2]], INK); polyF(g, [[-4, top + 1], [cx, top - 20], [w + 4, top + 1]], M[1]); polyF(g, [[-4, top + 1], [cx, top - 20], [cx - 10, top + 1]], M[3]);
    snowCap(g, 0, top, w, 3, seed, S, true);
    if (which === 0) { const B = R6('#C8843A'); box(g, cx - 19, ry - 64, 38, 44, INK); box(g, cx - 18, ry - 63, 36, 42, B[3]); box(g, cx - 18, ry - 63, 8, 42, B[4]); box(g, cx + 10, ry - 63, 8, 42, B[1]); for (const hy of [ry - 56, ry - 30]) box(g, cx - 18, hy, 36, 3, I[3]); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.arc(cx + 22, ry - 44, 10, -1.3, 1.3); g.stroke(); g.strokeStyle = B[2]; g.lineWidth = 3; g.stroke(); for (let i = 0; i < 5; i++) { g.fillStyle = D(i % 2 ? '#FFF4D8' : '#F4E0B0'); g.beginPath(); g.arc(cx - 14 + i * 7, ry - 64, 7, Math.PI, 0); g.fill(); } }
    if (which === 1) { const B = R6('#A85A2A'); g.save(); g.translate(cx, ry - 40); g.rotate(-0.5); box(g, -30, -15, 44, 30, INK); ballR(g, -10, 0, 18, B); ballR(g, 2, 2, 14, B); box(g, 10, -4, 30, 8, INK); box(g, 11, -3, 28, 6, D('#F4ECD8')); ballR(g, 40, -4, 5, R6('#F4ECD8')); ballR(g, 40, 4, 5, R6('#F4ECD8')); g.restore(); }
    if (which === 2) { polyF(g, [[cx - 8, ry - 20], [cx + 8, ry - 20], [cx, ry + 4]], D('#F4E8C8')); for (const [dx, dy, r] of [[0, -40, 22], [-14, -32, 14], [14, -30, 14], [0, -58, 14]] as const) ballR(g, cx + dx, ry + dy, r, R6(dy < -50 ? '#C8A8F4' : '#F9A8D4')); }
    if (which === 3) { const B = R6('#B8783A'); g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.arc(cx - 12, ry - 40, 16, 0, Math.PI * 2); g.arc(cx + 12, ry - 40, 16, 0, Math.PI * 2); g.stroke(); g.strokeStyle = B[3]; g.lineWidth = 9; g.stroke(); g.strokeStyle = B[4]; g.lineWidth = 2; g.stroke(); for (let i = 0; i < 10; i++) box(g, cx - 26 + hash(i) * 52, ry - 54 + hash(i * 2) * 28, 2, 2, D('#FFFFFF')); }
    if (which === 4) { const B = R6('#C8843A'); for (let i = 0; i < 3; i++) { g.save(); g.translate(cx - 14 + i * 14, ry - 10); g.rotate(-0.3 + i * 0.3); box(g, -6, -58, 12, 58, INK); box(g, -5, -57, 10, 56, B[3]); box(g, -5, -57, 3, 56, B[4]); for (let y = -54; y < -2; y += 6) box(g, -5, y, 10, 1, B[1]); g.restore(); } }
    board(g, w / 2, top + 20, Math.min(w - 20, 124), FOODS[which], '#2E1A4A');
  } else if (p.kind === 'tent') {
    // (the fortune teller's: a peaked tent in stripes, its flap tied back, a crystal ball glowing, stars on it)
    const wall = 70, peak = -h, cx = w / 2, A = R6('#5A2A9A'), B = R6('#F6D365');
    box(g, -1, -wall - 1, w + 2, wall + 1, INK); stripes(g, 0, -wall, w, wall, 10, A[3], A[2]);
    for (let i = 0; i < 10; i++) { const a = (i * w) / 10, b = ((i + 1) * w) / 10; polyF(g, [[a, -wall], [cx, peak], [b, -wall]], i % 2 ? A[2] : A[3]); }
    polyF(g, [[0, -wall], [cx, peak], [cx - 16, -wall]], A[4]);
    for (let i = 0; i < 12; i++) { const sx = 10 + hash(seed + i) * (w - 20), sy = -wall + 10 + hash(seed * 2 + i) * (wall - 30); box(g, sx, sy, 3, 1, B[4]); box(g, sx + 1, sy - 1, 1, 3, B[4]); }
    polyF(g, [[cx - 22, 0], [cx, -wall + 10], [cx + 22, 0]], night ? D('#C060E0') : D('#2A1040'));
    polyF(g, [[cx - 22, 0], [cx, -wall + 10], [cx - 28, -wall + 14]], A[1]); polyF(g, [[cx + 22, 0], [cx, -wall + 10], [cx + 28, -wall + 14]], A[1]);
    ballR(g, cx, -14, 8, R6('#A8E8FF'));
    for (let i = 0; i < Math.floor(w / 12); i++) { g.fillStyle = i % 2 ? B[3] : A[1]; g.beginPath(); g.arc(6 + i * 12, -wall, 6, 0, Math.PI); g.fill(); }
    box(g, cx - 1, peak - 18, 2, 18, I[3]); polyF(g, [[cx + 1, peak - 18], [cx + 16, peak - 14], [cx + 1, peak - 10]], B[3]);
    board(g, cx, -wall - 30, 118, "MADAME FAE", '#2A1040');
  } else if (p.kind === 'striker') {
    // (TEST YOUR STRENGTH: the tall board with its scale, the bell on top, the puck, the mallet and its pad)
    const cx = w / 2, top = -h + 20;
    box(g, cx - 11, top - 1, 22, -top + 1, INK); box(g, cx - 10, top, 20, -top, Tm[3]); box(g, cx - 10, top, 4, -top, Tm[4]);
    const sc = ['#4ADE80', '#A3E635', '#FDE047', '#FB923C', '#F87171', '#E879F9'];
    for (let i = 0; i < 12; i++) box(g, cx - 6, -20 - i * ((-top - 40) / 12), 12, 8, D(sc[Math.floor(i / 2)]));
    box(g, cx - 1, top + 10, 2, -top - 30, I[1]);
    ballR(g, cx, top - 8, 10, Gd); box(g, cx - 2, top - 20, 4, 4, Gd[2]);
    box(g, cx - 4, -60, 8, 6, R6('#E11D48')[3]);
    box(g, cx - 22, -8, 44, 8, INK); box(g, cx - 21, -7, 42, 7, R6('#E11D48')[3]); box(g, cx - 21, -7, 42, 2, R6('#E11D48')[5]);
    g.save(); g.translate(cx + 26, -2); g.rotate(-0.3); box(g, -2, -44, 4, 44, Tm[4]); box(g, -9, -52, 18, 10, INK); box(g, -8, -51, 16, 8, Tm[2]); g.restore();
    board(g, cx, top + 30, 64, 'STRONG', '#9B1C1C');
  } else if (p.kind === 'gift') {
    // (a gift shop: storybook plaster and timber, a bay window full of wands and tiaras, a corner turret)
    const top = -h + 70, P = R6('#E8D8F0');
    box(g, -1, top - 1, w + 2, -top + 1, INK); box(g, 0, top, w, -top, P[3]); box(g, 0, top, 6, -top, P[4]); box(g, w - 8, top, 8, -top, P[1]);
    for (const x of [0, w * 0.33, w * 0.66, w - 6]) box(g, x, top, 6, -top, Tm[2]);
    box(g, 0, top + 40, w, 5, Tm[2]);
    box(g, 20, -70, w * 0.5, 56, INK); box(g, 21, -69, w * 0.5 - 2, 54, night ? D('#FFD87A') : D('#C0864A'));
    for (let i = 0; i < 6; i++) { box(g, 26 + i * 16, -40, 2, 20, D('#5A3420')); box(g, 25 + i * 16, -42, 4, 3, D(['#FDE047', '#F472B6', '#A5F3FC'][i % 3])); }
    for (let i = 0; i < 4; i++) polyF(g, [[30 + i * 22, -54], [34 + i * 22, -62], [38 + i * 22, -54]], D('#F6D365'));
    box(g, w * 0.7, -64, 32, 64, INK); box(g, w * 0.7 + 1, -63, 30, 63, Tm[1]); ballR(g, w * 0.7 + 24, -32, 2, Gd);
    for (let i = 0; i < 3; i++) box(g, 14 + i * 50, top + 10, 18, 22, night ? D('#FFD88A') : D('#4A4066'));
    polyF(g, [[-8, top + 2], [w / 2, top - 70], [w + 8, top + 2]], INK); polyF(g, [[-6, top + 1], [w / 2, top - 68], [w + 6, top + 1]], R6('#4A78D4')[2]); polyF(g, [[-6, top + 1], [w / 2, top - 68], [w / 2 - 10, top + 1]], R6('#4A78D4')[4]);
    for (let r = 0; r < 6; r++) for (let i = 0; i < 14; i++) { const y = top - 6 - r * 11, half = (w / 2 + 6) * (1 - (r * 11 + 6) / 70), x = w / 2 - half + i * ((half * 2) / 14); if (x < w / 2 + half - 4) { g.fillStyle = R6('#4A78D4')[1]; g.beginPath(); g.arc(x + 4, y, 4, 0, Math.PI); g.fill(); } }
    snowCap(g, -6, top, w + 12, 4, seed, S, true);
    // (the turret at the corner)
    const tx = w - 10, TP = R6('#D8CCE8');
    box(g, tx - 19, -h - 10, 38, h - 60, INK); box(g, tx - 18, -h - 10, 36, h - 60, TP[3]); box(g, tx - 18, -h - 10, 10, h - 60, TP[4]); box(g, tx + 8, -h - 10, 10, h - 60, TP[1]);
    box(g, tx - 4, -h + 10, 8, 14, night ? D('#FFD88A') : D('#4A4066'));
    polyF(g, [[tx - 24, -h - 10], [tx, -h - 70], [tx + 24, -h - 10]], INK); polyF(g, [[tx - 22, -h - 11], [tx, -h - 68], [tx + 22, -h - 11]], M[2]); polyF(g, [[tx - 22, -h - 11], [tx, -h - 68], [tx - 5, -h - 11]], M[4]);
    box(g, tx - 1, -h - 84, 2, 16, I[3]); polyF(g, [[tx + 1, -h - 84], [tx + 16, -h - 80], [tx + 1, -h - 76]], R6('#F49AC8')[3]);
    board(g, w * 0.38, top + 44, 110, GIFTS[k % GIFTS.length], '#4A1A5A');
  } else {
    // (the wheel's boarding pavilion, behind its feet: a pink pavilion, an arcade, a dome with a gilt heart)
    const top = -h + 60, P = R6('#F4C8E0'), Sk = R6('#E8D8F0');
    box(g, -1, top - 1, w + 2, -top + 1, INK); box(g, 0, top, w, -top, P[3]); box(g, 0, top, 6, -top, P[4]); box(g, w - 8, top, 8, -top, P[1]);
    for (let i = 0; i < 6; i++) { const ax = 20 + i * 52; g.fillStyle = INK; g.beginPath(); g.arc(ax + 20, -60, 21, Math.PI, 0); g.fill(); box(g, ax - 1, -60, 42, 60, INK); g.fillStyle = night ? D('#F0A8D0') : D('#5A2A5A'); g.beginPath(); g.arc(ax + 20, -60, 19, Math.PI, 0); g.fill(); box(g, ax + 1, -60, 38, 60, night ? D('#F0A8D0') : D('#5A2A5A')); box(g, ax + 42, -84, 8, 84, Sk[4]); box(g, ax + 48, -84, 2, 84, Sk[1]); }
    box(g, -4, top - 6, w + 8, 8, INK); box(g, -3, top - 5, w + 6, 6, Sk[4]); box(g, -3, top - 5, w + 6, 1, Sk[5]);
    g.fillStyle = INK; g.beginPath(); g.ellipse(w / 2, top - 6, w * 0.34 + 2, 62, 0, Math.PI, 0); g.fill();
    for (let i = 0; i < 6; i++) { g.fillStyle = [P[2], P[3], P[4], P[3], P[2], P[1]][i]; g.beginPath(); g.ellipse(w / 2, top - 6, w * 0.34 * (1 - i * 0.14), 60 * (1 - i * 0.05), 0, Math.PI, 0); g.fill(); }
    snowCap(g, w / 2 - 50, top - 62, 100, 4, seed, S, false);
    const hx = w / 2, hy = top - 82;
    g.fillStyle = INK; g.beginPath(); g.moveTo(hx, hy + 14); g.bezierCurveTo(hx - 20, hy, hx - 12, hy - 14, hx, hy - 4); g.bezierCurveTo(hx + 12, hy - 14, hx + 20, hy, hx, hy + 14); g.fill();
    g.fillStyle = Gd[3]; g.beginPath(); g.moveTo(hx, hy + 11); g.bezierCurveTo(hx - 16, hy, hx - 10, hy - 11, hx, hy - 2); g.bezierCurveTo(hx + 10, hy - 11, hx + 16, hy, hx, hy + 11); g.fill();
    board(g, w / 2, top + 6, 150, 'BOARD HERE', '#6E2A6E');
    if (night) for (let i = 0; i < 20; i++) box(g, 6 + i * 17, top + 2, 2, 2, BULB[i % 4]);
  }
};
/** How wide a piece's walls go back (its sides): the box part of it. */
const bodyOf = (p: Piece): [number, number, number] => {
  if (p.kind === 'striker') return [p.w / 2 - 11, p.w / 2 + 11, p.h - 20];
  if (p.kind === 'tent') return [0, p.w, 70];
  if (p.kind === 'food') return [0, p.w, p.h - 46];
  if (p.kind === 'gift') return [0, p.w, p.h - 70];
  if (p.kind === 'pavilion') return [0, p.w, p.h - 60];
  return [0, p.w, p.h - 30];
};

// ---------------------------------------------------------------------------------------------------------------
// The hedge and the trees behind the midway (at TREE_D, in segments)

const SEG = 520;
const paintHedge = (g: Ctx, s: number) => {
  const P = rampH(PINE, true), Sn = rampH(SNOW, true), Tr = rampH(TIMBER, true), night = lit();
  // (the trees: snowy pines in tiers, bare trees strung with lights)
  for (let i = 0; i < 16; i++) {
    const x = i * 34 + hash(s + i) * 20, h = 90 + hash(s * 3 + i) * 90;
    if (hash(s * 5 + i) > 0.35) {
      for (let t = 0; t < 4; t++) { const y = -h + t * (h / 4.4), half = 10 + t * 9; polyF(g, [[x - half - 1, y + h / 4 + 1], [x, y - 2], [x + half + 1, y + h / 4 + 1]], INK); polyF(g, [[x - half, y + h / 4], [x, y], [x + half, y + h / 4]], P[2 + (t % 2)]); polyF(g, [[x - half, y + h / 4], [x, y], [x - half * 0.3, y + h / 4]], P[4]); for (let k = -half + 3; k < half - 2; k += 7) box(g, x + k, y + h / 4 - 3, 5, 3, Sn[4]); }
    } else {
      g.strokeStyle = Tr[1]; g.lineWidth = 4; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, -h); g.stroke();
      g.lineWidth = 2; g.beginPath(); for (let b = 0; b < 6; b++) { const by = -h * (0.35 + b * 0.11), sd = b % 2 ? 1 : -1; g.moveTo(x, by); g.lineTo(x + sd * (26 - b * 3), by - 18); g.lineTo(x + sd * (30 - b * 3), by - 26); } g.stroke();
      for (let b = 0; b < 6; b++) box(g, x + (b % 2 ? 1 : -1) * (26 - b * 3) - 3, -h * (0.35 + b * 0.11) - 20, 8, 2, Sn[4]);
      for (let b = 0; b < 14; b++) box(g, x - 22 + hash(s + i + b) * 44, -h * (0.3 + hash(s * 2 + b + i) * 0.68), 2, 2, night ? BULB[b % 4] : D(BULB[b % 4]));
    }
  }
  // (the hedge: clipped, banded, snow on top, its topiary)
  box(g, 0, -46, SEG, 46, INK); box(g, 0, -45, SEG, 45, P[2]); box(g, 0, -45, SEG, 6, P[3]); box(g, 0, -12, SEG, 12, P[1]);
  for (let x = 0; x < SEG; x += 6) { box(g, x, -40 + Math.floor(hash(s + x) * 30), 3, 2, P[4]); box(g, x + 2, -20 + Math.floor(hash(s * 2 + x) * 14), 2, 2, P[1]); }
  snowCap(g, 0, -45, SEG, 4, s, Sn, false);
  const t = Math.floor(hash(s * 7) * 4), tx = 120 + hash(s * 9) * 280;
  if (t === 0) { ballR(g, tx, -74, 24, P); ballR(g, tx - 14, -100, 14, P); ballR(g, tx + 14, -100, 14, P); polyF(g, [[tx - 30, -82], [tx, -48], [tx + 30, -82]], P[3]); }
  if (t === 1) { ballR(g, tx, -66, 18, P); ballR(g, tx + 22, -84, 10, P); polyF(g, [[tx + 26, -94], [tx + 30, -122], [tx + 34, -92]], Sn[3]); for (const lx of [-10, 10]) box(g, tx + lx - 3, -52, 6, 10, P[2]); }
  if (t === 2) { ballR(g, tx, -60, 14, P); ballR(g, tx, -86, 12, P); ballR(g, tx, -106, 9, P); ballR(g, tx, -120, 6, P); }
  if (t === 3) { for (let k = 0; k < 3; k++) ballR(g, tx - 26 + k * 26, -58 - (k === 1 ? 16 : 0), 14, P); }
};

// ---------------------------------------------------------------------------------------------------------------
// The plaza's furniture (at PROP_D)

type PropKind = 'lamp' | 'crowd' | 'topiary' | 'bench' | 'cart';
const PROPS: [number, PropKind, number][] = [];
for (let x = -420; x < 6500; x += 260) PROPS.push([x, 'lamp', 0]);
for (const [x, n] of [[120, 7], [620, 9], [1840, 6], [2180, 10], [3820, 10], [4180, 7], [4720, 9], [5420, 8], [5900, 7]] as const) PROPS.push([x, 'crowd', n]);
for (const x of [-200, 960, 2050, 3960, 5060, 6200]) PROPS.push([x, 'topiary', 0]);
for (const x of [400, 1560, 4500, 5700]) PROPS.push([x, 'bench', 0]);
for (const x of [1680 - 260, 4420, 6000]) PROPS.push([x, 'cart', 0]);
/** The fountain (x from the section's start). */
const FOUNT = 1260;

/** One of the crowd: feet at (x, 0), `s` his or her seed; bobbing (`b` 0/1); cheering. Women and men, kids, skin tones,
 *  builds, hair, hats and coats all seeded. */
const person = (g: Ctx, x: number, s: number, b: number) => {
  const SK = [['#FFE0CC', '#F2BFA0', '#C88E70'], ['#F4C8A0', '#D8A478', '#A87650'], ['#E8A070', '#C47A48', '#8E5230'], ['#9A6644', '#6E4428', '#4A2A16'], ['#6A4026', '#4A2A16', '#2E180A']];
  const HAIR = ['#140A06', '#2A1A0E', '#5A3A1E', '#C2501E', '#E8D090', '#B8B8C0', '#8A4A2A'];
  const COAT = ['#C8283E', '#2E5AAE', '#2E8A5A', '#7A3AAA', '#E86AA8', '#E0AE3A', '#3A3448', '#F4F0FA', '#4AAAC8', '#8A5A3A'];
  const sk = SK[Math.floor(hash(s * 1.3) * 5)].map(c => hour(c)), hair = hour(HAIR[Math.floor(hash(s * 2.1) * 7)]), coat = ramp6(COAT[Math.floor(hash(s * 3.7) * 10)]).map(c => hour(c));
  const woman = hash(s * 4.3) > 0.5, kid = hash(s * 5.9) < 0.18, wide = kid ? 8 : 9 + Math.floor(hash(s * 6.1) * 5);
  const h = kid ? 26 : 36 + Math.floor(hash(s * 7.3) * 9), cheer = hash(s * 8.9 + b) > 0.62;
  const y = -h + (b && hash(s * 9.7) > 0.4 ? -2 : 0), hw = wide / 2;
  // (legs, boots; a long coat or a skirt on some)
  box(g, x - hw + 1, y + h * 0.62, 3, h * 0.38, INK); box(g, x + hw - 4, y + h * 0.62, 3, h * 0.38, INK);
  box(g, x - hw + 1, y + h * 0.62, 2, h * 0.38 - 2, hour(woman && hash(s) > 0.5 ? '#3A2A4A' : '#2A3A5A')); box(g, x + hw - 4, y + h * 0.62, 2, h * 0.38 - 2, hour('#2A3A5A'));
  // (the coat, stepped; a scarf)
  box(g, x - hw - 1, y + 9, wide + 2, h * 0.6 - 2 + (woman ? 4 : 0), INK);
  box(g, x - hw, y + 10, wide, h * 0.6 - 4 + (woman ? 4 : 0), coat[3]); box(g, x - hw, y + 10, 2, h * 0.6 - 4, coat[4]); box(g, x + hw - 2, y + 10, 2, h * 0.6 - 4, coat[1]);
  box(g, x - hw, y + 10, wide, 3, hour(['#F4F0FA', '#C8283E', '#E0AE3A', '#2E8A5A'][Math.floor(hash(s * 11) * 4)]));
  // (arms: up when cheering, else down)
  if (cheer) { box(g, x - hw - 3, y - 2, 3, 13, coat[2]); box(g, x + hw, y - 2, 3, 13, coat[2]); box(g, x - hw - 3, y - 4, 3, 3, sk[1]); box(g, x + hw, y - 4, 3, 3, sk[1]); }
  else { box(g, x - hw - 2, y + 11, 3, h * 0.4, coat[2]); box(g, x + hw - 1, y + 11, 3, h * 0.4, coat[1]); }
  // (the head, the hair; a hat: a beanie and its bobble, a wizard's hat, a tiara, earmuffs, or none)
  box(g, x - 4, y + 1, 8, 9, INK); box(g, x - 3, y + 2, 6, 7, sk[1]); box(g, x - 3, y + 2, 2, 7, sk[0]);
  box(g, x - 4, y, 8, 3, hair); if (woman) { box(g, x - 5, y + 1, 2, 10, hair); box(g, x + 3, y + 1, 2, 10, hair); }
  const hat = Math.floor(hash(s * 12.7) * 6);
  if (hat === 0) { box(g, x - 4, y - 3, 8, 4, hour(['#C8283E', '#2E5AAE', '#E86AA8'][s % 3])); box(g, x - 1, y - 5, 2, 2, hour('#FFFFFF')); }
  if (hat === 1) { polyF(g, [[x - 6, y + 1], [x + 1, y - 14], [x + 6, y + 1]], hour('#3A2A6A')); box(g, x - 1, y - 8, 2, 2, hour('#F6D365')); }
  if (hat === 2 && woman) { box(g, x - 3, y - 2, 6, 2, hour('#F6D365')); box(g, x - 1, y - 4, 2, 2, hour('#F472B6')); }
  if (hat === 3) { box(g, x - 5, y + 3, 2, 4, hour('#F9A8D4')); box(g, x + 3, y + 3, 2, 4, hour('#F9A8D4')); box(g, x - 4, y - 1, 8, 1, hour('#F9A8D4')); }
};
const paintProp = (g: Ctx, kind: PropKind, s: number, n: number, b: number) => {
  const I = rampH(IRON), S = rampH(SNOW), Gd = rampH(GOLD), P = rampH(PINE), Tm = rampH(TIMBER), night = lit();
  if (kind === 'lamp') {
    // (an iron lamp post, a fairy lantern on a scrolled arm; the fairy lights slung from it to the next one)
    box(g, -8, -8, 16, 8, INK); box(g, -7, -7, 14, 7, I[3]); box(g, -7, -7, 14, 1, I[5]);
    postR(g, 0, -128, -8, 6, I);
    for (let y = -118; y < -12; y += 26) { box(g, -5, y, 10, 3, I[2]); box(g, -5, y, 10, 1, I[4]); }
    box(g, -10, -158, 20, 26, INK); box(g, -9, -157, 18, 24, night ? '#FFE9F4' : hour('#E8D8E8')); box(g, -9, -157, 5, 24, night ? '#FFFFFF' : hour('#FFF4FA'));
    box(g, -1, -157, 2, 24, I[2]); polyF(g, [[-12, -158], [0, -170], [12, -158]], INK); polyF(g, [[-10, -159], [0, -168], [10, -159]], I[3]); ballR(g, 0, -172, 3, Gd);
    box(g, -11, -134, 22, 3, I[3]); snowCap(g, -9, -159, 18, 3, s, S, false);
    // (the string to the next post: sagging, bulbs on it)
    const n2 = 22;
    g.strokeStyle = I[1]; g.lineWidth = 1; g.beginPath(); for (let i = 0; i <= n2; i++) { const t = i / n2, x = t * 260, y = -140 + Math.sin(t * Math.PI) * 30; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    for (let i = 1; i < n2; i++) { const t = i / n2, x = t * 260, y = -140 + Math.sin(t * Math.PI) * 30; box(g, x - 1, y, 3, 4, INK); box(g, x - 1, y + 1, 2, 2, night ? BULB[(i + s) % 4] : hour(mix(BULB[(i + s) % 4], '#8A8AA0', 0.4))); }
  } else if (kind === 'crowd') {
    // (a rope rail on brass posts, the crowd along behind it, waving)
    for (let i = 0; i < n; i++) person(g, i * 18 + (hash(s + i) - 0.5) * 6, s * 13 + i, b);
    const w = n * 18;
    for (let x = -14; x <= w; x += Math.max(40, w / 3)) { box(g, x - 3, -30, 6, 30, INK); box(g, x - 2, -29, 4, 29, Gd[3]); box(g, x - 2, -29, 1, 29, Gd[5]); ballR(g, x, -32, 3, Gd); }
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(-14, -28); for (let x = -14; x <= w; x += 8) g.lineTo(x, -28 + Math.sin(((x + 14) / Math.max(40, w / 3)) * Math.PI) ** 2 * 6); g.stroke();
    g.strokeStyle = hour('#C8283E'); g.lineWidth = 2; g.stroke();
  } else if (kind === 'topiary') {
    // (a clipped topiary in its tub: a unicorn, a heart or a pixie)
    box(g, -18, -18, 36, 18, INK); box(g, -17, -17, 34, 17, rampH(STONE)[3]); box(g, -17, -17, 34, 3, rampH(STONE)[5]);
    const t = Math.floor(hash(s) * 3);
    if (t === 0) { ballR(g, 0, -40, 18, P); ballR(g, 16, -62, 10, P); polyF(g, [[18, -72], [22, -94], [25, -70]], Gd[4]); box(g, -12, -24, 5, 8, P[2]); box(g, 8, -24, 5, 8, P[2]); }
    if (t === 1) { g.fillStyle = INK; g.beginPath(); g.moveTo(0, -18); g.bezierCurveTo(-34, -40, -24, -74, 0, -56); g.bezierCurveTo(24, -74, 34, -40, 0, -18); g.fill(); g.fillStyle = P[3]; g.beginPath(); g.moveTo(0, -21); g.bezierCurveTo(-30, -40, -22, -70, 0, -53); g.bezierCurveTo(22, -70, 30, -40, 0, -21); g.fill(); g.fillStyle = P[4]; g.beginPath(); g.ellipse(-10, -54, 6, 4, -0.6, 0, Math.PI * 2); g.fill(); }
    if (t === 2) { ballR(g, 0, -34, 13, P); ballR(g, 0, -58, 9, P); for (const sd of [-1, 1]) { g.fillStyle = P[4]; g.beginPath(); g.ellipse(sd * 16, -52, 12, 6, sd * -0.5, 0, Math.PI * 2); g.fill(); } }
    snowCap(g, -12, -60, 24, 3, s, S, false);
  } else if (kind === 'bench') {
    for (const x of [-26, 20]) { box(g, x - 1, -24, 8, 24, INK); box(g, x, -23, 6, 23, I[3]); box(g, x, -23, 2, 23, I[4]); }
    for (let k = 0; k < 3; k++) { box(g, -30, -28 + k * 4, 60, 3, INK); box(g, -29, -27 + k * 4, 58, 2, Tm[4 - k]); }
    box(g, -30, -14, 60, 4, INK); box(g, -29, -13, 58, 3, Tm[3]);
    snowCap(g, -30, -15, 60, 4, s, S, true);
    person(g, -12, s * 3 + 1, 0); person(g, 12, s * 3 + 2, 0);
  } else {
    // (a candy cart: striped canopy, a glass case of sweets, spoked wheels)
    const M = rampH(ramp6('#E86AA8'));
    for (const x of [-30, 30]) { g.fillStyle = INK; g.beginPath(); g.arc(x, -12, 12, 0, Math.PI * 2); g.fill(); g.strokeStyle = Gd[3]; g.lineWidth = 2; g.beginPath(); g.arc(x, -12, 10, 0, Math.PI * 2); g.stroke(); for (let k = 0; k < 6; k++) { const a = (k * Math.PI) / 3; g.beginPath(); g.moveTo(x, -12); g.lineTo(x + Math.cos(a) * 10, -12 + Math.sin(a) * 10); g.stroke(); } }
    box(g, -40, -54, 80, 32, INK); box(g, -39, -53, 78, 30, M[3]); box(g, -39, -53, 78, 3, M[5]);
    box(g, -32, -76, 64, 22, INK); box(g, -31, -75, 62, 20, hour('#D8ECF8'));
    for (let k = 0; k < 6; k++) { ballR(g, -24 + k * 10, -62, 4, rampH(ramp6(['#F472B6', '#FDE047', '#60A5FA', '#4ADE80'][k % 4]))); }
    for (const x of [-38, 36]) box(g, x, -112, 3, 36, I[3]);
    polyF(g, [[-48, -110], [0, -128], [48, -110]], INK); for (let k = 0; k < 6; k++) polyF(g, [[-46 + k * 15.3, -111], [0, -126], [-46 + (k + 1) * 15.3, -111]], k % 2 ? M[3] : hour('#FFF4F8'));
    for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? M[2] : hour('#FFF4F8'); g.beginPath(); g.arc(-38 + k * 15.3, -111, 7, 0, Math.PI); g.fill(); }
    signText(g, 'SWEETS', 0, -32, gilt(1));
  }
};
/** The fountain's stonework (still): a round basin, a pedestal, PIPER IN BRONZE on top (blowing a kiss). */
const paintFountain = (g: Ctx) => {
  const St = rampH(STONE), Br = rampH(ramp6('#A87A3A')), S = rampH(SNOW);
  box(g, -110, -34, 220, 34, INK); box(g, -109, -33, 218, 33, St[3]); box(g, -109, -33, 218, 4, St[5]); box(g, -109, -8, 218, 8, St[1]);
  for (let x = -100; x < 110; x += 30) box(g, x, -29, 1, 21, St[2]);
  box(g, -100, -36, 200, 4, hour('#7AB8E8'));
  box(g, -16, -96, 32, 62, INK); box(g, -15, -95, 30, 61, St[3]); box(g, -15, -95, 8, 61, St[4]); box(g, 7, -95, 8, 61, St[1]);
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, -96, 46, 10, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = St[4]; g.beginPath(); g.ellipse(0, -97, 44, 8, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = hour('#8AC8F0'); g.beginPath(); g.ellipse(0, -98, 38, 5, 0, 0, Math.PI * 2); g.fill();
  // (Piper in bronze: round, winged, a hand up blowing a kiss, the green of the weather on her)
  ballR(g, 0, -128, 18, Br); ballR(g, 0, -156, 11, Br);
  for (const sd of [-1, 1]) { g.fillStyle = INK; g.beginPath(); g.ellipse(sd * 20, -142, 14, 7, sd * -0.6, 0, Math.PI * 2); g.fill(); g.fillStyle = Br[4]; g.beginPath(); g.ellipse(sd * 20, -142, 12, 5, sd * -0.6, 0, Math.PI * 2); g.fill(); }
  box(g, 10, -170, 5, 16, Br[2]); box(g, 12, -173, 5, 5, Br[3]);
  box(g, -8, -164, 16, 4, Br[1]); box(g, -4, -150, 3, 2, INK); box(g, 2, -150, 3, 2, INK);
  for (let k = 0; k < 6; k++) box(g, -14 + hash(k) * 28, -140 + hash(k * 2) * 24, 3, 2, hour('#5A9A7A'));
  snowCap(g, -8, -167, 16, 3, 5, S, false);
  signText(g, 'PIPER, OUR PATRONESS', 0, -14, gilt(1));
};

// ---------------------------------------------------------------------------------------------------------------
// The plaza's flags: going back to the hedge (between it and the play plane), and in front

const flagTile = (c: Ctx, R: string[], S: string[]) => tilePattern(c, `fa-wh-flags-${timeOfDay().key}`, 96, 48, g => {
  box(g, 0, 0, 96, 48, R[1]);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) {
    const x = k * 32 + (r % 2) * 16, y = r * 16;
    for (const ox of [0, -96, 96]) {
      const tint = (r + k) % 3 === 0 ? mix(R[3], '#C8A0C8', 0.18) : R[3];
      box(g, x + ox + 1, y + 1, 30, 14, tint); box(g, x + ox + 1, y + 1, 30, 1, R[4]); box(g, x + ox + 1, y + 1, 1, 14, R[4]); box(g, x + ox + 2, y + 2, 3, 1, R[5]);
      box(g, x + ox + 1, y + 13, 30, 2, R[2]); box(g, x + ox + 30, y + 2, 1, 13, R[2]);
      if (hash(x * 1.3 + y) > 0.7) { box(g, x + ox + 6, y + 3, 18, 1, S[3]); checker(g, x + ox + 4, y + 4, 22, 2, S[2], 0, 1); }
    }
  }
});
const drawFlags = (c: Ctx, v: View, a: number, b: number) => {
  const F = rampH(FLAG), S = rampH(SNOW), eye = v.eye;
  if (eye.y >= GY - 1) return;
  const s = Math.max(a, v.v0 - 400), e = Math.min(b, v.v1 + 400);
  // (the flags going back, banded lighter at the front, joints toward the eye; snow banked along the hedge)
  const n = 5;
  for (let i = 0; i < n; i++) {
    const d0 = 1 - ((1 - TREE_D) * i) / n, d1 = 1 - ((1 - TREE_D) * (i + 1)) / n;
    polyF(c, [at(eye, s, GY, d0), at(eye, e, GY, d0), at(eye, e, GY, d1), at(eye, s, GY, d1)], F[Math.max(1, 4 - i)]);
    if (i) { const [x0, y0] = at(eye, s, GY, d0), [x1] = at(eye, e, GY, d0); checker(c, x0, y0 - 1, x1 - x0, 2, F[Math.max(1, 5 - i)], i % 2, 1); }
  }
  c.strokeStyle = F[1]; c.lineWidth = 1;
  for (let x = Math.floor(s / 48) * 48; x < e; x += 48) { const [p0, q0] = at(eye, x, GY, 1), [p1, q1] = at(eye, x, GY, TREE_D); c.beginPath(); c.moveTo(p0, q0); c.lineTo(p1, q1); c.stroke(); }
  for (const d of [0.95, 0.89, 0.83, 0.77]) { const [x0, y0] = at(eye, s, GY, d), [x1] = at(eye, e, GY, d); box(c, x0, Math.round(y0), x1 - x0, 1, F[1]); }
  const [bx0, by0] = at(eye, s, GY, TREE_D + 0.02), [bx1] = at(eye, e, GY, TREE_D + 0.02);
  box(c, bx0, by0 - 2, bx1 - bx0, 3, S[4]); checker(c, bx0, by0 + 1, bx1 - bx0, 2, S[3], 0, 1);
};
/** The paving in front of the play plane, bent toward him, its kerb lit (it's the ground he walks on). */
export const drawPaving = (c: Ctx, state: GameState, v: View, a: number, b: number) => {
  const L = Math.max(a, state.camera.x - 40), Rr = Math.min(b, state.camera.x + 840);
  if (Rr <= L) return;
  const F = rampH(FLAG), S = rampH(SNOW), K = rampH(STONE);
  box(c, L, GY, Rr - L, 700, F[0]);
  c.fillStyle = flagTile(c, F, S); c.fillRect(L, GY + 8, Rr - L, 600);
  for (const [y, h] of [[GY + 40, 10], [GY + 84, 14]] as const) { checker(c, L, y, Rr - L, h, S[2], 0, 2); for (let x = Math.floor(L / 9) * 9; x < Rr; x += 9) if (hash(x * 0.3 + y) > 0.6) box(c, x, y + 1 + Math.floor(hash(x) * (h - 3)), 3, 1, S[4]); }
  bendFloor(c, v.eye, GY, GY, GY + 140, a, b);
  box(c, L, GY, Rr - L, 8, K[2]); box(c, L, GY + 6, Rr - L, 2, K[1]);
  for (let x = Math.floor(L / 40) * 40; x < Rr; x += 40) box(c, x, GY + 1, 1, 6, K[1]);
  box(c, L, GY, Rr - L, 2, LIP[2]); box(c, L, GY, Rr - L, 1, LIP[3]);
  for (let x = Math.floor(L / 6) * 6; x < Rr; x += 6) if (hash(x * 0.17) > 0.6) box(c, x, GY - 1, 4 + Math.floor(hash(x) * 4), 2, S[5]);
};

// ---------------------------------------------------------------------------------------------------------------
// Putting it down

/** Everything behind the play plane, farthest first. */
export const drawFairBack = (c: Ctx, state: GameState, v: View, a: number, b: number) => {
  const eye = v.eye;
  drawFlags(c, v, a, b);
  // (the hedge and the trees)
  for (let s = Math.floor((a - X(0)) / SEG) - 1; s * SEG + X(0) < b + SEG; s++) {
    const x = X(0) + s * SEG;
    if (!seen(v, x - 60, x + SEG + 60, TREE_D, 60)) continue;
    stillAt(c, v, TREE_D, `wh-hedge-${s}`, x, GY, -40, -220, SEG + 80, 224, g => paintHedge(g, s * 13 + 5));
  }
  // (the midway: its sides first, farthest from the eye first)
  const near = PIECES.filter(p => seen(v, X(p.x) - 60, X(p.x) + p.w + 60, ROW_D, 140));
  near.sort((p, q) => Math.abs(X(q.x) + q.w / 2 - eye.x) - Math.abs(X(p.x) + p.w / 2 - eye.x));
  const Sd = rampH(ramp6('#9A88B0'), true);
  for (const p of near) {
    const [l, r, hh] = bodyOf(p), x0 = X(p.x);
    // (its wall going back toward the hedge, where the eye's past its end)
    for (const [e, side] of [[x0 + l, -1], [x0 + r, 1]] as const) sideBack(c, eye, e, side, GY - hh, GY, ROW_D, SIDE_D, Sd, 3);
    stillAt(c, v, ROW_D, `wh-row-${p.x}-${p.kind}`, x0, GY, -60, -p.h - 110, p.w + 120, p.h + 114, g => paintPiece(g, p));
  }
  // (the fountain, the crowds and the furniture)
  const f = v.f, bob = Math.floor(f / 18) % 2;
  if (seen(v, X(FOUNT) - 130, X(FOUNT) + 130, FOUNT_D, 60)) {
    stillAt(c, v, FOUNT_D, 'wh-fountain', X(FOUNT), GY, -120, -190, 240, 194, paintFountain);
    atDepth(c, eye, FOUNT_D, () => fountainWater(c, X(FOUNT), f));
  }
  for (const [rx, kind, n] of PROPS) {
    const x = X(rx), wide = kind === 'lamp' ? 270 : kind === 'crowd' ? n * 18 + 30 : 70;
    if (!seen(v, x - 60, x + wide, PROP_D, 80)) continue;
    const ph = kind === 'crowd' ? bob : 0;
    stillAt(c, v, PROP_D, `wh-prop-${kind}-${rx}-${ph}`, x, GY, -60, -200, wide + 120, 204, g => paintProp(g, kind, Math.abs(rx) + 7, n, ph));
  }
};
/** The fountain's water (live): jets up off the bowl, falling into the basin, ripples. */
const fountainWater = (c: Ctx, x: number, f: number) => {
  const col = hour('#BFE4FA'), hi = '#FFFFFF';
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2, r = 36, t = ((f * 0.04 + k * 0.1) % 1);
    for (let i = 0; i < 6; i++) { const u = (i / 6 + t) % 1, px = x + Math.cos(a) * r * u * 1.4, py = GY - 98 - Math.sin(u * Math.PI) * 18 + u * 62 * u; box(c, px - 1, py, 2, 3, i % 2 ? col : hi); }
  }
  for (let i = 0; i < 8; i++) { const u = ((f * 0.05 + i / 8) % 1); box(c, x - 1, GY - 176 - u * 6 + 30, 2, 3, hi); box(c, x + 13, GY - 176 + u * 40, 2, 3, col); }
  for (let k = 0; k < 4; k++) { const w = 20 + ((f * 0.5 + k * 25) % 100); box(c, x - w, GY - 37, 6, 1, hi); box(c, x + w - 6, GY - 37, 6, 1, hi); }
};

/** After dark: the lamp posts' lanterns, the stalls' glow. */
export const fairLamps = (state: GameState, v: View): Light[] => {
  const out: Light[] = [];
  if (timeOfDay().lamps < 0.05) return out;
  const add = (x: number, y: number, r: number, a: number, color: string) => { if (x > state.camera.x - 200 && x < state.camera.x + 1000 && y > state.camera.y - 200 && y < state.camera.y + 800) out.push({ x, y, r, a, color }); };
  for (const [rx, kind] of PROPS) if (kind === 'lamp') { const [x, y] = at(v.eye, X(rx), GY - 146, PROP_D); add(x, y, 120, 0.5, '#FFD8E8'); }
  for (const p of PIECES) if (p.kind === 'food' || p.kind === 'booth' || p.kind === 'pavilion') { const [x, y] = at(v.eye, X(p.x) + p.w / 2, GY - 60, ROW_D); add(x, y, 90, 0.35, '#FFC070'); }
  return out;
};
