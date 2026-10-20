// The mine's set dressing going back (the SNES pass): on fiberglass rock ledges in front of the timbered wall, each
// piece at its own depth (one eye: drawn d of the way from where he's looking, dimmer the further back, the ledges'
// tops never lit: nothing back here is to stand on), so no screen-width of the ride is just rock and timber. A cheap
// mine ride's idea of a mine: crystal clusters glowing from the bulbs inside them (the cord out the back), the crew's
// work light and step ladder (WET PAINT on the fresh rock), a TNT stack (PROP), a side shaft that's a painted flat (its
// plywood edge showing) boarded up, animatronic miners (one picking at a gold vein, sparks; one lighting a fuse that
// never burns down), a waterfall out of a PVC pipe into a wishing pool, an ore cart full of gold paint with a
// prospector's skeleton slumped on it, mine timbers piled and a broken set, stalagmites (one snapped: the chicken wire
// and the dowel in it), bats on fishing line, the MINER'S MERCANTILE selling REAL GOLD* (*not), a pack mule nodding over
// a sluice, and THE LAST UNFRIENDLY GUEST chained to the wall.
//
// The still art's stamped once per piece (the shop in two: its back, the clerk live, its counter); what moves (the
// water, the pick, the fuse, the bats, the mule's head, the skeleton's jaw, the glows) is live over it.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { INK, box, mix, hash, checker, rampOf, stamp, steppedGlow } from '../../intro/art/kit';
import { at, type Eye } from '../temple/art';
import { drawPerson } from '../temple/people';
import { signAt, enamel, print, stencil, carved, plank, gilt } from '../letters';
import { X, artieTrackY } from './layout';

type Ctx = CanvasRenderingContext2D;
type T = (col: string) => string;

/** The cave's haze: further back, toward it. */
const HAZE = '#0E0E18';
const tintFor = (d: number): T => { const k = Math.min(0.4, (1 - d) * 0.75); return col => mix(col, HAZE, k); };
const rT = (col: string, t: T) => rampOf(col).map(t);

const fill = (g: Ctx, pts: number[], col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fill(); };
/** A filled shape, inked round. */
const inked = (g: Ctx, pts: number[], col: string, t: T) => {
  g.strokeStyle = t(INK); g.lineWidth = 2; g.lineJoin = 'round'; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.stroke();
  fill(g, pts, col);
};
const oval = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2); g.fill(); };
const line = (g: Ctx, pts: number[], col: string, w = 1) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.stroke(); };
/** Stepped columns across a box (lit left, shaded right), dithered at each step. */
const stepped = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], order = [4, 3, 3, 2, 2, 2, 1, 1]) => {
  for (let i = 0; i < order.length; i++) {
    const a = x + Math.floor((w * i) / order.length), b = x + Math.floor((w * (i + 1)) / order.length);
    box(g, a, y, b - a, h, R[order[i]]);
    if (i && order[i] !== order[i - 1]) checker(g, a - 2, y, 2, h, R[order[i]]);
  }
};
/** An inked box, stepped across. */
const crate = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], t: T) => { box(g, x - 1, y - 1, w + 2, h + 2, t(INK)); stepped(g, x, y, w, h, R); box(g, x, y, w, 1, R[4]); };
const bolt = (g: Ctx, x: number, y: number, t: T) => { box(g, x - 1, y - 1, 3, 3, t(INK)); box(g, x, y, 2, 2, t('#8A929C')); box(g, x, y, 1, 1, t('#E4E8EE')); };
/** A plank crate: boards, a frame round it, stenciled. */
const boards = (g: Ctx, x: number, y: number, w: number, h: number, t: T, col = '#9A7448') => {
  const W = rT(col, t);
  crate(g, x, y, w, h, W, t);
  for (let k = 1; k < 3; k++) box(g, x, y + Math.round((h * k) / 3), w, 1, W[0]);
  box(g, x, y, 3, h, W[1]); box(g, x + w - 3, y, 3, h, W[1]); box(g, x, y, w, 3, W[3]); box(g, x, y + h - 3, w, 3, W[1]);
  for (const [nx, ny] of [[x + 1, y + 1], [x + w - 3, y + 1], [x + 1, y + h - 3], [x + w - 3, y + h - 3]]) box(g, nx, ny, 2, 2, t('#3A3A3A'));
};
/** A stake in the ground and a board on it. */
const stakeSign = (g: Ctx, x: number, foot: number, h: number, w: number, bh: number, t: T, col = '#7A5634') => {
  const W = rT(col, t);
  box(g, x - 2, foot - h, 4, h, t(INK)); box(g, x - 1, foot - h, 2, h, W[2]);
  crate(g, x - w / 2, foot - h - bh, w, bh, W, t);
  return foot - h - bh;
};

// ---------------------------------------------------------------------------------------------------------------
// The ledge each stands on: fiberglass rock, banded, its seam bolted, a crack showing the plywood; the top not lit

const LEDGE = 150;
/** A crack in the painted foam: the skin broken off round it (the foam's white), the plywood under that, its grain. */
export const plywoodCrack = (g: Ctx, cx: number, cy: number, s: number, t: T, seed: number) => {
  const pts: number[] = [];
  for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2, r = s * (0.65 + hash(seed + k) * 0.5); pts.push(Math.round(cx + Math.cos(a) * r * 1.4), Math.round(cy + Math.sin(a) * r)); }
  inked(g, pts, t('#D8CCB0'), t);
  const inner = pts.map((v, i) => (i % 2 ? cy + (v - cy) * 0.7 : cx + (v - cx) * 0.72));
  fill(g, inner, t('#B08A58'));
  // (the grain, the edge of a ply, a staple)
  for (let k = -2; k <= 2; k++) box(g, cx - s * 0.9, cy + k * 3, s * 1.8, 1, t(k % 2 ? '#94703F' : '#C49C66'));
  box(g, cx - 3, cy - 1, 6, 1, t('#8A929C'));
};
const ledge = (g: Ctx, x: number, foot: number, hw: number, t: T, seed: number) => {
  const R = rT('#5E4C42', t);
  const n = Math.max(2, Math.ceil((hw * 2) / 16));
  const pts: number[] = [];
  for (let i = 0; i <= n; i++) pts.push(x - hw + i * ((hw * 2) / n), foot - 2 + Math.round(hash(seed + i * 1.3) * 2) * 2);
  pts.push(x + hw - 8, foot + 40, x + hw * 0.72, foot + 92, x + hw * 0.36, foot + LEDGE, x - hw * 0.42, foot + LEDGE, x - hw * 0.76, foot + 84, x - hw + 6, foot + 34);
  inked(g, pts, R[2], t);
  g.save(); fill(g, pts, R[2]); g.clip();
  for (let y = foot, k = 0; y < foot + LEDGE; y += 10, k++) {
    const u = (y - foot) / LEDGE;
    box(g, x - hw, y, hw * 2, 10, R[u < 0.12 ? 2 : u < 0.45 ? 1 : 0]);
    if (u >= 0.12 && u < 0.2) checker(g, x - hw, y - 2, hw * 2, 2, R[2]);
    if (u >= 0.45 && u < 0.52) checker(g, x - hw, y - 2, hw * 2, 2, R[1]);
  }
  // (the lumps: lit down their left, the paint's dry-brushed highlights)
  for (let k = 0; k < n; k++) {
    const lx = x - hw + 6 + k * 16 + hash(seed * 2 + k) * 6, ly = foot + 8 + hash(seed + k * 3) * 30;
    box(g, lx, ly, 3, 16 + hash(k + seed) * 24, R[3]); box(g, lx + 3, ly + 4, 2, 10, R[1]);
    if (hash(seed * 5 + k) > 0.6) box(g, lx - 2, ly + 2, 8, 1, R[4]);
  }
  // (the foam's seam, bolted; a crack showing the plywood)
  const sx = Math.round(x - hw * 0.25 + hash(seed) * hw * 0.5);
  box(g, sx, foot + 4, 1, LEDGE, R[0]); box(g, sx + 1, foot + 4, 1, LEDGE, R[3]);
  for (let y = foot + 16; y < foot + LEDGE - 30; y += 26) bolt(g, sx - 1, y, t);
  if (hash(seed * 3.7) > 0.35) plywoodCrack(g, x + (hash(seed * 1.9) - 0.5) * hw, foot + 34 + hash(seed) * 20, 7, t, seed);
  // (the dark under it)
  for (let i = 0; i < 5; i++) box(g, x - hw, foot + LEDGE - 64 + i * 13, hw * 2, 13, `rgba(8, 8, 14, ${(0.12 + i * 0.16).toFixed(2)})`);
  g.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The pieces (each at its ledge's top, `foot`; its middle at x; every color through `t`)

/** A crystal: a six-sided prism (two faces seen: the lit one, the shaded one), its point, from a base along `ang`. */
const prism = (g: Ctx, bx: number, by: number, ang: number, len: number, w: number, R: string[], t: T) => {
  const dx = Math.sin(ang), dy = -Math.cos(ang), px = -dy, py = dx, hw = w / 2, sh = len - w * 0.9;
  const BL = [bx - px * hw, by - py * hw], BR = [bx + px * hw, by + py * hw];
  const SL = [BL[0] + dx * sh, BL[1] + dy * sh], SR = [BR[0] + dx * sh, BR[1] + dy * sh], TP = [bx + dx * len, by + dy * len];
  const CB = [bx + px * hw * 0.1, by + py * hw * 0.1], CT = [CB[0] + dx * sh, CB[1] + dy * sh];
  inked(g, [...BL, ...SL, ...TP, ...SR, ...BR], R[2], t);
  fill(g, [...BL, ...SL, ...TP, ...CT, ...CB], R[3]);
  fill(g, [...CB, ...CT, ...TP, ...SR, ...BR], R[1]);
  // (the lit edge, the shoulder's facet, the light inside up its middle)
  line(g, [BL[0] + px, BL[1] + py, SL[0] + px, SL[1] + py], R[4], 1.5);
  fill(g, [...SL, ...TP, ...CT], R[4]);
  line(g, [CB[0] - px * 2 + dx * 6, CB[1] - py * 2 + dy * 6, CB[0] - px * 2 + dx * sh * 0.7, CB[1] - py * 2 + dy * sh * 0.7], mix(R[4], '#FFFFFF', 0.4), 1);
};
const CRYSTAL = ['#4FB8D8', '#9A6ADA', '#E07AB0'];
const crystals = (g: Ctx, x: number, foot: number, t: T, seed: number) => {
  const col = CRYSTAL[seed % 3], R = rT(col, t), B = rT('#4A3E3A', t);
  // (the base: a lump of rock they grow out of)
  inked(g, [x - 60, foot, x - 46, foot - 18, x - 18, foot - 28, x + 20, foot - 26, x + 50, foot - 14, x + 62, foot], B[2], t);
  fill(g, [x - 46, foot - 18, x - 18, foot - 28, x - 10, foot - 20, x - 40, foot - 10], B[3]);
  // (the crystals: the back ones first, then the big ones, then the little ones round the base)
  const set: [number, number, number, number][] = [[-30, -0.55, 70, 16], [26, 0.5, 78, 18], [-8, -0.18, 120, 24], [12, 0.15, 98, 22], [-40, -0.9, 40, 12], [44, 0.95, 36, 12], [-18, -0.4, 50, 14], [30, 0.28, 46, 13]];
  for (const [ox, a, len, w] of set) prism(g, x + ox, foot - 16, a + (hash(seed + ox) - 0.5) * 0.12, len * (0.85 + hash(seed * 2 + ox) * 0.3), w, R, t);
  // (the bulb socket in among them, the cord out the back and along the ledge to a power strip)
  box(g, x - 6, foot - 14, 12, 8, t(INK)); box(g, x - 5, foot - 13, 10, 6, t('#3A3E44')); box(g, x - 2, foot - 13, 4, 2, t('#FFF4C8'));
  line(g, [x + 6, foot - 8, x + 40, foot - 3, x + 70, foot - 3, x + 84, foot - 4], t('#E8701A'), 2);
  box(g, x + 84, foot - 8, 26, 7, t(INK)); box(g, x + 85, foot - 7, 24, 5, t('#E8E4DA')); box(g, x + 87, foot - 6, 2, 2, t('#DC2626'));
  for (let k = 0; k < 3; k++) box(g, x + 92 + k * 5, foot - 6, 3, 3, t('#3A3A3A'));
  // (the brass plaque on its little post)
  box(g, x - 86, foot - 22, 2, 22, t('#3A3A3A'));
  crate(g, x - 112, foot - 40, 54, 18, rT('#8A6A2A', t), t);
  signAt(g, 'CRYSTAL', x - 85, foot - 33, 4, gilt(4, t('#2A0A04'))); signAt(g, 'CAVERN', x - 85, foot - 26, 4, gilt(4, t('#2A0A04')));
};
const crystalsLive = (c: Ctx, x: number, foot: number, f: number, seed: number) => {
  const col = CRYSTAL[seed % 3], k = 0.1 + 0.04 * Math.sin(f * 0.04 + seed);
  steppedGlow(c, x, foot - 60, 70, col, k, 0.01, 4);
  // (a glint running up one of them now and then)
  const p = (f + seed * 37) % 160;
  if (p < 20) box(c, x - 8 + p * 0.3, foot - 30 - p * 4, 2, 2, '#FFFFFF');
};

/** The crew's corner: the work light on its tripod, its cord to the reel, the step ladder (a paint can on it), the
 *  toolbox, and the patch of rock they've just painted (WET PAINT). */
const workLight = (g: Ctx, x: number, foot: number, t: T) => {
  const M = rT('#5A626C', t), Y = rT('#E8B400', t), Rd = rT('#C81E1E', t), A = rT('#B8BEC6', t), P = rT('#7A5E46', t);
  // (the fresh patch: wet paint brighter than the rest, a drip or two, the sign stuck in front of it)
  inked(g, [x + 16, foot - 4, x + 20, foot - 70, x + 52, foot - 84, x + 70, foot - 60, x + 66, foot - 4], P[3], t);
  fill(g, [x + 20, foot - 70, x + 52, foot - 84, x + 56, foot - 74, x + 26, foot - 62], P[4]);
  for (const dx of [28, 44, 58]) box(g, x + dx, foot - 30, 2, 10 + (dx % 3) * 4, P[2]);
  const sy = stakeSign(g, x + 40, foot, 22, 44, 16, t, '#F1EFEA');
  signAt(g, 'WET PAINT', x + 40, sy + 11, 4, enamel(4, t('#B91C1C')));
  // (the tripod: three legs, the mast up, the lamp's housing angled at the track)
  const hx = x - 34, hy = foot - 130;
  for (const [lx, col] of [[x - 64, M[1]], [x - 6, M[2]], [x - 36, M[0]]] as const) { line(g, [hx, hy + 30, lx, foot], t(INK), 4); line(g, [hx, hy + 30, lx, foot], col, 2); }
  box(g, hx - 3, hy + 6, 6, 30, t(INK)); box(g, hx - 2, hy + 6, 4, 30, M[3]);
  g.save(); g.translate(hx, hy); g.rotate(0.35);
  box(g, -20, -14, 40, 26, t(INK)); stepped(g, -19, -13, 38, 24, Y);
  box(g, 16, -12, 6, 22, t(INK)); box(g, 17, -11, 4, 20, t('#FFF4C8'));
  for (let k = 0; k < 4; k++) box(g, 15, -12 + k * 6, 8, 1, t(INK));
  box(g, -6, -18, 12, 4, t(INK)); box(g, -5, -17, 10, 2, M[3]);
  g.restore();
  // (its cord down to the reel)
  line(g, [hx, hy + 30, hx + 4, foot - 2, x + 2, foot - 2], t('#2A2A2E'), 2);
  oval(g, x + 2, foot - 12, 12, 12, t(INK)); oval(g, x + 2, foot - 12, 11, 11, Y[2]); oval(g, x + 2, foot - 12, 7, 7, t('#2A2A2E')); oval(g, x + 2, foot - 12, 3, 3, Y[3]);
  // (the step ladder, open, against the rock; the paint can on its top step, the brush across it)
  const lx = x + 86;
  for (const [a, b] of [[lx, lx + 12], [lx + 36, lx + 24]]) { line(g, [a, foot, b, foot - 116], t(INK), 5); line(g, [a, foot, b, foot - 116], A[2], 3); }
  for (let k = 1; k < 5; k++) { const y = foot - k * 24, w = 36 - k * 5; box(g, lx + k * 2.5 - 1, y - 1, w + 2, 5, t(INK)); box(g, lx + k * 2.5, y, w, 3, A[3]); }
  box(g, lx + 8, foot - 122, 24, 6, t(INK)); box(g, lx + 9, foot - 121, 22, 4, A[4]);
  crate(g, lx + 10, foot - 140, 16, 18, rT('#9AA0A8', t), t); box(g, lx + 10, foot - 140, 16, 4, P[3]); box(g, lx + 12, foot - 134, 12, 6, t('#F1EFEA'));
  line(g, [lx + 6, foot - 140, lx + 30, foot - 146], t('#C8A050'), 2); box(g, lx + 28, foot - 150, 6, 6, P[2]);
  // (the toolbox)
  const tx = x - 104;
  crate(g, tx, foot - 22, 40, 22, Rd, t); box(g, tx, foot - 14, 40, 2, Rd[0]);
  box(g, tx + 12, foot - 28, 16, 3, t(INK)); box(g, tx + 12, foot - 28, 2, 6, t(INK)); box(g, tx + 26, foot - 28, 2, 6, t(INK));
  box(g, tx + 18, foot - 12, 4, 3, A[3]);
  // (a wrench and a roll of tape left on the ledge)
  box(g, tx + 46, foot - 4, 20, 3, A[2]); oval(g, tx + 66, foot - 3, 4, 3, A[2]);
  oval(g, tx - 12, foot - 6, 6, 6, t('#8A929C')); oval(g, tx - 12, foot - 6, 3, 3, t(INK));
};
const workLightLive = (c: Ctx, x: number, foot: number) => {
  const hx = x - 34 + 18, hy = foot - 130 + 6;
  steppedGlow(c, hx + 8, hy + 6, 60, '#FFF0C0', 0.16, 0.01, 4);
  steppedGlow(c, hx + 2, hy, 16, '#FFFFFF', 0.4, 0.05, 3);
};

/** TNT: a stack of crates (TNT, DANGER), one open on its sticks (PROP stamped on them), the plunger and its wires, the
 *  blasting zone's diamond. */
const tnt = (g: Ctx, x: number, foot: number, t: T) => {
  const Rd = rT('#B8281C', t), M = rT('#3A3E44', t);
  // (the stack)
  for (const [cx, cy] of [[x - 74, foot - 34], [x - 28, foot - 34], [x - 52, foot - 68]] as const) {
    boards(g, cx, cy, 44, 34, t);
    signAt(g, 'TNT', cx + 22, cy + 21, 6, stencil(6, Rd[1]));
  }
  signAt(g, 'DANGER', x - 30, foot - 50, 4, stencil(4, t('#1A0B06')));
  // (the open one on the ledge: its lid off, the sticks in it, wrapped in red paper, PROP on the nearest)
  const ox = x + 20;
  boards(g, ox, foot - 22, 46, 22, t);
  for (let k = 0; k < 6; k++) { box(g, ox + 3 + k * 7, foot - 30, 7, 12, t(INK)); box(g, ox + 4 + k * 7, foot - 29, 5, 11, Rd[k % 2 ? 2 : 3]); box(g, ox + 4 + k * 7, foot - 29, 1, 11, Rd[4]); }
  box(g, ox + 10, foot - 25, 18, 5, t('#F1EFEA')); signAt(g, 'PROP', ox + 19, foot - 21, 4, print(4, t('#1A0B06')));
  fill(g, [ox + 50, foot - 2, ox + 56, foot - 24, ox + 102, foot - 22, ox + 96, foot], rT('#9A7448', t)[1]);
  // (the plunger box, its T-handle up, the wires off it in a loop to the stack)
  const px = x + 120;
  crate(g, px - 16, foot - 26, 32, 26, rT('#6A4A2A', t), t);
  signAt(g, 'FIRE', px, foot - 12, 4, stencil(4, t('#E8C130')));
  box(g, px - 2, foot - 48, 4, 22, t(INK)); box(g, px - 1, foot - 48, 2, 22, M[4]);
  box(g, px - 14, foot - 52, 28, 5, t(INK)); box(g, px - 13, foot - 51, 26, 3, rT('#8A6A3A', t)[3]);
  g.strokeStyle = t('#B91C1C'); g.lineWidth = 1.5; g.beginPath(); g.moveTo(px - 16, foot - 6); g.bezierCurveTo(px - 40, foot + 4, x - 10, foot + 2, x - 26, foot - 4); g.stroke();
  g.strokeStyle = t('#1A1A1A'); g.beginPath(); g.moveTo(px - 16, foot - 4); g.bezierCurveTo(px - 46, foot + 8, x - 10, foot + 6, x - 30, foot - 2); g.stroke();
  // (the diamond on its stake)
  const sx = x - 110;
  box(g, sx - 2, foot - 64, 4, 64, t(INK)); box(g, sx - 1, foot - 64, 2, 64, rT('#7A5634', t)[2]);
  inked(g, [sx, foot - 104, sx + 22, foot - 82, sx, foot - 60, sx - 22, foot - 82], t('#E8C130'), t);
  fill(g, [sx, foot - 98, sx + 16, foot - 82, sx, foot - 66, sx - 16, foot - 82], t('#1A1A1A'));
  fill(g, [sx, foot - 95, sx + 13, foot - 82, sx, foot - 69, sx - 13, foot - 82], t('#E8C130'));
  signAt(g, 'BLAST', sx, foot - 84, 4, stencil(4, t('#1A0B06'))); signAt(g, 'ZONE', sx, foot - 77, 4, stencil(4, t('#1A0B06')));
};

/** A side shaft, boarded up: the timber portal (SHAFT No. 9 carved in its header), and in it a painted flat of a tunnel
 *  going back (the timber sets shrinking, the rails meeting, a lantern far off), its plywood edge in plain view. */
const shaft = (g: Ctx, x: number, foot: number, t: T, seed: number) => {
  const W = rT('#7A5530', t), Rk = rT('#4E4040', t);
  // (the rock round it)
  inked(g, [x - 110, foot, x - 104, foot - 130, x - 80, foot - 196, x - 20, foot - 220, x + 50, foot - 214, x + 96, foot - 180, x + 112, foot - 110, x + 116, foot], Rk[2], t);
  for (let k = 0; k < 9; k++) { const lx = x - 100 + k * 24; box(g, lx, foot - 200 + hash(seed + k) * 40, 3, 60 + hash(k) * 80, Rk[3]); box(g, lx + 10, foot - 160 + hash(k * 2) * 40, 2, 50, Rk[1]); }
  // (the flat: banded dark going back, the sets painted on it shrinking to the vanishing point)
  const L = x - 52, R = x + 52, top = foot - 150, vx = x + 6, vy = foot - 66;
  box(g, L, top, R - L, foot - top, t('#2A1E18'));
  for (let k = 0; k < 5; k++) {
    const u = 1 - k * 0.19, l = vx + (L + 4 - vx) * u, r = vx + (R - 4 - vx) * u, tp = vy + (top + 6 - vy) * u, bt = vy + (foot - vy) * u;
    const col = t(mix('#6A4A2E', '#120C0A', k / 5));
    box(g, l, tp, r - l, Math.max(1, 4 * u), col); box(g, l, tp, Math.max(1, 4 * u), bt - tp, col); box(g, r - 4 * u, tp, Math.max(1, 4 * u), bt - tp, col);
    if (k) box(g, l + 4 * u, tp + 4 * u, r - l - 8 * u, bt - tp - 4 * u, t(mix('#2A1E18', '#060406', k / 5)));
  }
  for (const s of [-1, 1]) line(g, [vx + s * 30, foot, vx + s * 2, vy + 2], t('#6A7280'), 1.5);
  box(g, vx - 2, vy - 6, 4, 4, t('#FCD34D'));
  // (the flat's edge: its plywood showing down the right, a gap, the 2x4 behind it)
  box(g, R - 4, top, 4, foot - top, t('#B08A58')); box(g, R - 4, top, 1, foot - top, t('#D8B47A'));
  box(g, R, top + 10, 6, foot - top - 10, t('#06060A')); box(g, R + 1, top + 30, 4, foot - top - 30, t('#8A6A40'));
  // (the portal: posts, the header carved, its knee braces)
  for (const px of [L - 18, R]) { box(g, px - 1, top - 4, 20, foot - top + 4, t(INK)); stepped(g, px, top - 4, 18, foot - top + 4, W); for (let y = top + 20; y < foot; y += 46) box(g, px, y, 18, 1, W[0]); }
  box(g, L - 30, top - 30, R - L + 60, 28, t(INK)); stepped(g, L - 29, top - 29, R - L + 58, 26, W, [3, 3, 2, 2, 2, 2, 2, 1]); box(g, L - 29, top - 29, R - L + 58, 2, W[4]);
  signAt(g, 'SHAFT No. 9', x, top - 12, 5, carved(5, t('#2A1A0C'), t('#E8C890')));
  for (const s of [-1, 1]) line(g, [x + s * 60, top - 2, x + s * 46, top + 16], W[1], 5);
  // (the boards nailed across: KEEP OUT)
  for (const [a, b, y0, y1] of [[L - 10, R + 12, top + 40, top + 66], [L - 8, R + 10, top + 92, top + 74]]) {
    inked(g, [a, y0, b, y1, b, y1 + 12, a, y0 + 12], W[3], t);
    box(g, a + 3, y0 + 3, 2, 2, t('#3A3A3A')); box(g, b - 5, y1 + 3, 2, 2, t('#3A3A3A'));
  }
  signAt(g, 'KEEP OUT', x, top + 62, 5, stencil(5, t('#B91C1C')));
};
const shaftLive = (c: Ctx, x: number, foot: number, f: number) => lamp(c, x + 64, foot - 150, f, '#F59E0B');

/** A lantern hung on a nail (live: it flickers). */
const lamp = (c: Ctx, x: number, y: number, f: number, col: string) => {
  const fl = 0.85 + 0.1 * Math.sin(f * 0.21 + x) + (hash(Math.floor(f / 3) + x) < 0.08 ? -0.25 : 0);
  steppedGlow(c, x, y + 10, 30 * fl, col, 0.2, 0.02, 4);
  box(c, x - 1, y - 6, 2, 6, '#2A2A2E');
  box(c, x - 5, y, 10, 2, INK); box(c, x - 5, y + 2, 10, 12, INK);
  box(c, x - 4, y + 3, 8, 10, mix(col, '#FFF4C8', 0.3 * fl)); box(c, x - 1, y + 5, 2, 6, '#FFFBEA');
  box(c, x - 5, y + 14, 10, 2, INK);
};

/** An animatronic miner: boots, jeans, a flannel shirt, suspenders, a fiberglass face (its seam down the jaw), a beard,
 *  the hard hat and its lamp, the servo at his shoulder and the cable out of his back into the rock. Picking at the gold
 *  vein, or lighting a fuse that never burns down. (The arm's live.) */
const miner = (g: Ctx, x: number, foot: number, t: T, fuse: boolean) => {
  const Rk = rT('#4E4040', t), Gd = rT('#D8A82A', t), J = rT('#3A5A8A', t), Fl = rT('#A8302A', t), Sk = rT('#D8A07A', t), Bd = rT('#A8A29E', t), Y = rT('#E8B400', t);
  // (the rock face he's at: a vein of gold paint down it, drips; the rubble he's had out of it)
  inked(g, [x - 90, foot, x - 84, foot - 150, x - 62, foot - 176, x - 36, foot - 160, x - 30, foot - 90, x - 40, foot], Rk[2], t);
  fill(g, [x - 84, foot - 150, x - 62, foot - 176, x - 58, foot - 160, x - 78, foot - 120], Rk[3]);
  line(g, [x - 70, foot - 150, x - 56, foot - 120, x - 62, foot - 90, x - 46, foot - 60, x - 52, foot - 30], Gd[2], 4);
  line(g, [x - 70, foot - 150, x - 56, foot - 120, x - 62, foot - 90], Gd[4], 1);
  for (const dy of [-112, -84, -56]) box(g, x - 58, foot + dy, 2, 8, Gd[1]);
  for (let k = 0; k < 7; k++) { const rx = x - 36 + hash(k * 3.1) * 40, ry = foot - 4 - hash(k) * 8; oval(g, rx, ry, 6, 4, t(INK)); oval(g, rx, ry, 5, 3, k % 3 ? Gd[2] : Rk[2]); box(g, rx - 3, ry - 2, 2, 1, Gd[4]); }
  // (the cable out of his back into the rock behind him)
  line(g, [x + 32, foot - 76, x + 56, foot - 60, x + 60, foot - 10, x + 80, foot - 2], t('#2A2A2E'), 3);
  // (the boots, the legs in jeans, braced)
  const mx = x + 18;
  for (const [lx, sh] of [[mx - 14, 2], [mx + 4, 1]] as const) {
    box(g, lx - 1, foot - 50, 13, 40, t(INK)); box(g, lx, foot - 50, 11, 40, J[sh + 1]); box(g, lx, foot - 50, 2, 40, J[3]);
    box(g, lx - 4, foot - 12, 17, 12, t(INK)); box(g, lx - 3, foot - 11, 15, 10, rT('#5A3A22', t)[2]); box(g, lx - 3, foot - 11, 15, 2, rT('#5A3A22', t)[3]);
  }
  // (the torso: flannel in checks, the suspenders, the belt)
  box(g, mx - 18, foot - 96, 38, 50, t(INK)); box(g, mx - 17, foot - 95, 36, 48, Fl[2]);
  for (let yy = 0; yy < 48; yy += 8) for (let xx = 0; xx < 36; xx += 8) if (((yy + xx) / 8) % 2 === 0) box(g, mx - 17 + xx, foot - 95 + yy, 8, 8, Fl[1]);
  for (let yy = 4; yy < 48; yy += 8) box(g, mx - 17, foot - 95 + yy, 36, 1, Fl[3]);
  for (const sx of [mx - 10, mx + 8]) box(g, sx, foot - 95, 4, 46, t('#3A2A1A'));
  box(g, mx - 17, foot - 50, 36, 5, t('#2A1A0E')); box(g, mx, foot - 50, 6, 5, Gd[3]);
  // (the servo at the shoulder)
  oval(g, mx - 10, foot - 88, 8, 8, t(INK)); oval(g, mx - 10, foot - 88, 7, 7, t('#5A626C')); oval(g, mx - 10, foot - 88, 3, 3, t('#8A929C'));
  for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + 0.4; box(g, mx - 11 + Math.cos(a) * 5, foot - 89 + Math.sin(a) * 5, 2, 2, t('#C8CED6')); }
  // (the head: a fiberglass face, its seam down the jaw, a big nose, the beard, the hat and its lamp)
  const hx = mx - 4, hy = foot - 116;
  oval(g, hx, hy, 15, 17, t(INK)); oval(g, hx, hy, 14, 16, Sk[2]); oval(g, hx - 4, hy - 4, 8, 9, Sk[3]);
  line(g, [hx + 10, hy - 6, hx + 8, hy + 10], Sk[0], 1);
  oval(g, hx - 13, hy + 1, 5, 4, t(INK)); oval(g, hx - 13, hy + 1, 4, 3, Sk[3]);
  box(g, hx - 9, hy - 5, 4, 3, t(INK)); box(g, hx - 1, hy - 5, 4, 3, t(INK));
  if (fuse) { box(g, hx - 9, hy - 6, 4, 4, t('#F8FAFC')); box(g, hx - 8, hy - 5, 2, 2, t(INK)); }
  fill(g, [hx - 14, hy + 4, hx + 14, hy + 2, hx + 10, hy + 20, hx, hy + 26, hx - 12, hy + 18], Bd[2]);
  fill(g, [hx - 14, hy + 4, hx - 2, hy + 4, hx - 4, hy + 20, hx - 12, hy + 18], Bd[3]);
  for (let k = 0; k < 5; k++) box(g, hx - 10 + k * 5, hy + 10 + (k % 2) * 4, 1, 8, Bd[1]);
  box(g, hx - 8, hy + 6, 10, 2, fuse ? t('#3A0A0A') : Bd[0]);
  box(g, hx - 18, hy - 16, 34, 6, t(INK)); box(g, hx - 17, hy - 15, 32, 4, Y[1]);
  fill(g, [hx - 13, hy - 14, hx - 10, hy - 28, hx + 10, hy - 28, hx + 13, hy - 14], t(INK)); fill(g, [hx - 12, hy - 15, hx - 9, hy - 27, hx + 9, hy - 27, hx + 12, hy - 15], Y[2]);
  fill(g, [hx - 12, hy - 15, hx - 9, hy - 27, hx - 3, hy - 27, hx - 6, hy - 15], Y[3]);
  box(g, hx - 15, hy - 24, 8, 8, t(INK)); box(g, hx - 14, hy - 23, 6, 6, t('#FFF4C8'));
  // (his other arm: down at his side, or holding the match up)
  if (fuse) {
    box(g, mx + 14, foot - 92, 9, 26, t(INK)); box(g, mx + 15, foot - 91, 7, 24, Fl[1]);
    box(g, mx + 14, foot - 72, 9, 9, t(INK)); box(g, mx + 15, foot - 71, 7, 7, Sk[2]);
  } else { box(g, mx + 14, foot - 92, 9, 40, t(INK)); box(g, mx + 15, foot - 91, 7, 32, Fl[1]); box(g, mx + 15, foot - 59, 7, 7, Sk[2]); }
  // (the lantern on a crate by him)
  boards(g, x + 52, foot - 24, 30, 24, t);
};
const minerLive = (c: Ctx, x: number, foot: number, f: number, t: T, fuse: boolean, seed: number) => {
  const mx = x + 18, sx = mx - 10, sy = foot - 88;
  steppedGlow(c, mx - 15, foot - 136, 22, '#FFF4C8', 0.22, 0.02, 3);
  lamp(c, x + 67, foot - 40, f + seed, '#F59E0B');
  if (fuse) {
    // (the stick up in his hand, the fuse lit: sparking, and never any shorter)
    const ax = sx - 22, ay = sy - 4;
    line(c, [sx, sy, ax, ay], t(INK), 9); line(c, [sx, sy, ax, ay], t('#A8302A'), 7);
    box(c, ax - 6, ay - 6, 10, 10, t(INK)); box(c, ax - 5, ay - 5, 8, 8, t('#D8A07A'));
    box(c, ax - 4, ay - 26, 7, 24, INK); box(c, ax - 3, ay - 25, 5, 22, t('#C8281C')); box(c, ax - 3, ay - 25, 1, 22, t('#F06A55'));
    line(c, [ax, ay - 26, ax + 3, ay - 32, ax + 1, ay - 36], '#E8E0CC', 1);
    for (let k = 0; k < 6; k++) { const a = f * 0.9 + k * 1.1, r = 2 + ((f + k * 3) % 5); box(c, ax + 1 + Math.cos(a) * r, ay - 37 + Math.sin(a) * r, 2, 2, k % 2 ? '#FDE047' : '#FFFFFF'); }
    steppedGlow(c, ax + 1, ay - 37, 14, '#FDBA3C', 0.35, 0.03, 3);
    return;
  }
  // (the pick: up over his shoulder, down at the vein; sparks off it as it lands)
  const u = (Math.sin(f * 0.075 + seed) + 1) / 2, ang = -2.5 + u * 1.75;
  const ex = sx + Math.cos(ang) * 30, ey = sy + Math.sin(ang) * 30;
  line(c, [sx, sy, ex, ey], t(INK), 10); line(c, [sx, sy, ex, ey], t('#A8302A'), 8);
  box(c, ex - 5, ey - 5, 10, 10, t(INK)); box(c, ex - 4, ey - 4, 8, 8, t('#D8A07A'));
  const hx = ex + Math.cos(ang) * 34, hy = ey + Math.sin(ang) * 34;
  line(c, [ex, ey, hx, hy], t(INK), 5); line(c, [ex, ey, hx, hy], t('#B08A58'), 3);
  const px = -Math.sin(ang), py = Math.cos(ang);
  line(c, [hx + px * 16, hy + py * 16, hx, hy, hx - px * 14, hy - py * 14], t(INK), 6);
  line(c, [hx + px * 15, hy + py * 15, hx, hy, hx - px * 13, hy - py * 13], t('#8A929C'), 3);
  if (u < 0.08) for (let k = 0; k < 5; k++) box(c, x - 38 - k * 3 + hash(f + k) * 6, foot - 100 + hash(f * 2 + k) * 24 - k * 3, 2, 2, k % 2 ? '#FDE047' : '#FFFFFF');
};

/** A waterfall out of the rock (out of a PVC pipe, if you look) into a wishing pool, NO WADING; the water's live. */
const WF_TOP = 226, WF_W = 36;
const waterfall = (g: Ctx, x: number, foot: number, t: T, seed: number) => {
  const Rk = rT('#4E4246', t), Pv = rT('#A8AEB6', t), Pl = rT('#3A6A5A', t);
  // (the rock: a tall fake face, its overhang, the seams bolted)
  inked(g, [x - 100, foot, x - 92, foot - 150, x - 70, foot - 236, x - 20, foot - 262, x + 40, foot - 256, x + 82, foot - 220, x + 96, foot - 120, x + 104, foot], Rk[2], t);
  g.save(); fill(g, [x - 100, foot, x - 92, foot - 150, x - 70, foot - 236, x - 20, foot - 262, x + 40, foot - 256, x + 82, foot - 220, x + 96, foot - 120, x + 104, foot], Rk[2]); g.clip();
  for (let y = foot - 262; y < foot; y += 22) { box(g, x - 100, y, 204, 3, Rk[1]); box(g, x - 100 + ((y / 22) % 3) * 30, y + 3, 90, 2, Rk[3]); }
  for (let k = 0; k < 8; k++) { const lx = x - 92 + k * 26; box(g, lx, foot - 240 + hash(seed + k) * 50, 3, 80 + hash(k) * 80, Rk[3]); }
  box(g, x + 58, foot - 230, 1, 230, Rk[0]); for (let y = foot - 210; y < foot - 20; y += 30) bolt(g, x + 57, y, t);
  plywoodCrack(g, x - 64, foot - 90, 8, t, seed);
  // (the wet behind the falls: darker, green)
  box(g, x - WF_W / 2 - 6, foot - WF_TOP, WF_W + 12, WF_TOP, t('#26303A'));
  for (let y = foot - WF_TOP; y < foot; y += 12) box(g, x - WF_W / 2 - 8, y, 4, 8, Pl[2]);
  g.restore();
  // (the overhang, the PVC pipe poking out from under it, its flange)
  inked(g, [x - 40, foot - WF_TOP - 6, x + 40, foot - WF_TOP - 8, x + 30, foot - WF_TOP + 6, x - 34, foot - WF_TOP + 4], Rk[3], t);
  box(g, x - 12, foot - WF_TOP + 2, 24, 8, t(INK)); box(g, x - 11, foot - WF_TOP + 3, 22, 6, Pv[2]); box(g, x - 11, foot - WF_TOP + 3, 22, 2, Pv[4]);
  box(g, x - 14, foot - WF_TOP, 3, 12, Pv[1]); box(g, x + 11, foot - WF_TOP, 3, 12, Pv[1]);
  // (the pool: a fiberglass basin, its rim not lit, coins in it)
  oval(g, x, foot - 10, 74, 14, t(INK)); oval(g, x, foot - 11, 72, 12, rT('#5E544C', t)[1]); oval(g, x, foot - 13, 64, 8, t('#1E4A64'));
  oval(g, x - 10, foot - 14, 40, 4, t('#2A6A8A'));
  for (let k = 0; k < 9; k++) box(g, x - 50 + hash(seed + k * 2) * 100, foot - 15 + hash(k) * 5, 2, 1, t(k % 3 ? '#C8A03A' : '#C8CED6'));
  // (plastic ferns at its edge, the sign)
  for (const [fx, s] of [[x - 78, -1], [x + 74, 1]] as const) for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * 0.35 + s * 0.2; line(g, [fx, foot - 4, fx + Math.cos(a) * 28, foot - 4 + Math.sin(a) * 28], Pl[k % 2 ? 2 : 3], 3); }
  const sy = stakeSign(g, x + 118, foot, 30, 52, 26, t, '#F1EFEA');
  signAt(g, 'MAKE A', x + 118, sy + 10, 4, print(4, t('#1E3A8A'))); signAt(g, 'WISH!', x + 118, sy + 18, 4, print(4, t('#1E3A8A')));
  signAt(g, 'NO WADING', x + 118, sy + 25, 3, print(3, t('#B91C1C')));
};
const waterfallLive = (c: Ctx, x: number, foot: number, f: number) => {
  const top = foot - WF_TOP + 9, bot = foot - 14, W = ['#9AD8F0', '#5EAED6', '#3A86B6', '#CFF0FF'];
  for (let y = top; y < bot; y += 6) {
    const k = Math.floor((y - top - f * 3) / 6);
    const spread = ((y - top) / (bot - top)) * 6;
    for (let col = 0; col < 4; col++) {
      const cx = x - 12 - spread / 2 + col * (6 + spread / 4);
      box(c, cx, y, 6 + spread / 4, 6, W[((k + col * 3) % 4 + 4) % 4]);
    }
  }
  box(c, x - 12, top, 24, 2, '#E8FAFF');
  // (the foam where it lands, the rings going out)
  for (let k = 0; k < 7; k++) { const a = f * 0.3 + k * 2.1; box(c, x - 16 + k * 5 + Math.sin(a) * 2, bot - 4 - Math.abs(Math.sin(a)) * 6, 4, 3, k % 2 ? '#F1FBFF' : '#BDE6F6'); }
  const r = (f % 50) / 50;
  c.strokeStyle = `rgba(190, 230, 250, ${(0.6 * (1 - r)).toFixed(2)})`; c.lineWidth = 1; c.beginPath(); c.ellipse(x, bot + 1, 20 + r * 40, 3 + r * 5, 0, 0, Math.PI * 2); c.stroke();
  steppedGlow(c, x, bot - 20, 50, '#9AD8F0', 0.08, 0.01, 3);
};

/** An ore cart on its siding (a buffer stop at the end), heaped with gold paint (chipped to gray); the prospector's
 *  skeleton slumped against it, his pick still in his hand; cobwebs; THIS WAY TO THE GOLD. */
const oreCart = (g: Ctx, x: number, foot: number, t: T) => {
  const Ru = rT('#8A4A2A', t), Gd = rT('#D8A82A', t), M = rT('#4A4E56', t), Bn = rT('#E4DCC4', t), W = rT('#6A4A2A', t);
  // (the siding: ties, two rails, the buffer stop)
  for (let k = x - 120; k < x + 110; k += 14) box(g, k, foot - 4, 9, 4, W[1]);
  box(g, x - 124, foot - 6, 236, 2, M[3]); box(g, x - 124, foot - 5, 236, 1, M[1]);
  crate(g, x + 100, foot - 30, 18, 26, W, t); box(g, x + 96, foot - 26, 26, 6, rT('#B91C1C', t)[1]);
  // (the cart: a riveted tub, its wheels; the load)
  const l = x - 60, top = foot - 64;
  for (let k = 0; k < 12; k++) { const rx = l + 6 + hash(k * 1.7) * 108, ry = top + 2 - hash(k * 3.1) * 14; oval(g, rx, ry, 9, 7, t(INK)); oval(g, rx, ry, 8, 6, k % 4 === 3 ? rT('#6A6A6E', t)[2] : Gd[2]); oval(g, rx - 2, ry - 2, 4, 3, k % 4 === 3 ? rT('#6A6A6E', t)[3] : Gd[4]); }
  inked(g, [l, top, l + 120, top, l + 112, foot - 18, l + 8, foot - 18], Ru[2], t);
  fill(g, [l + 2, top + 2, l + 118, top + 2, l + 117, top + 8, l + 3, top + 8], Ru[3]);
  fill(g, [l + 60, top + 8, l + 117, top + 8, l + 112, foot - 20, l + 60, foot - 20], Ru[1]);
  for (let k = l + 8; k < l + 116; k += 12) { box(g, k, top + 4, 2, 2, Ru[0]); box(g, k + 2, foot - 24, 2, 2, Ru[0]); }
  for (const dx of [30, 76]) box(g, l + dx, top + 14, 3, 26, Ru[0]);
  for (const wx of [l + 26, l + 94]) { oval(g, wx, foot - 12, 11, 11, t(INK)); oval(g, wx, foot - 12, 10, 10, M[1]); oval(g, wx, foot - 12, 5, 5, M[3]); box(g, wx - 1, foot - 13, 2, 2, M[4]); }
  // (the skeleton: sat against the cart's end, legs out along the ledge, an arm up over the rim holding the pick; his
  // hat still on; a cobweb from its brim to the cart)
  const sx = l - 14, sy = foot - 6;
  line(g, [sx, sy - 6, sx - 34, sy - 2, sx - 54, sy], t(INK), 5); line(g, [sx, sy - 6, sx - 34, sy - 2, sx - 54, sy], Bn[2], 3);
  line(g, [sx + 4, sy - 4, sx - 26, sy + 2, sx - 44, sy + 2], t(INK), 5); line(g, [sx + 4, sy - 4, sx - 26, sy + 2, sx - 44, sy + 2], Bn[3], 3);
  for (const bx of [sx - 58, sx - 48]) { box(g, bx - 1, sy - 9, 10, 9, t(INK)); box(g, bx, sy - 8, 8, 7, rT('#4A2E1A', t)[2]); }
  oval(g, sx + 2, sy - 12, 10, 6, t(INK)); oval(g, sx + 2, sy - 12, 9, 5, Bn[2]);
  line(g, [sx + 2, sy - 16, sx + 6, sy - 50], t(INK), 4); line(g, [sx + 2, sy - 16, sx + 6, sy - 50], Bn[2], 2);
  for (let k = 0; k < 5; k++) { g.strokeStyle = t(INK); g.lineWidth = 3; g.beginPath(); g.arc(sx + 6, sy - 26 - k * 6, 10 - k, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.strokeStyle = Bn[k % 2 ? 2 : 3]; g.lineWidth = 1.5; g.stroke(); }
  line(g, [sx + 2, sy - 48, sx + 20, sy - 66, sx + 30, top - 4], t(INK), 4); line(g, [sx + 2, sy - 48, sx + 20, sy - 66, sx + 30, top - 4], Bn[3], 2);
  line(g, [sx + 32, top - 4, sx + 36, top - 44], t(INK), 4); line(g, [sx + 32, top - 4, sx + 36, top - 44], rT('#A8845A', t)[2], 2);
  line(g, [sx + 22, top - 40, sx + 36, top - 46, sx + 52, top - 40], t(INK), 5); line(g, [sx + 22, top - 40, sx + 36, top - 46, sx + 52, top - 40], M[3], 3);
  const kx = sx + 8, ky = sy - 62;
  oval(g, kx, ky, 11, 12, t(INK)); oval(g, kx, ky, 10, 11, Bn[2]); oval(g, kx - 3, ky - 3, 5, 5, Bn[3]);
  box(g, kx - 6, ky - 2, 4, 4, t(INK)); box(g, kx + 2, ky - 2, 4, 4, t(INK)); box(g, kx - 1, ky + 3, 2, 3, t(INK));
  for (let k = 0; k < 4; k++) box(g, kx - 5 + k * 3, ky + 8, 2, 3, Bn[3]);
  box(g, kx - 18, ky - 12, 36, 4, t(INK)); box(g, kx - 17, ky - 11, 34, 2, rT('#6A4A2A', t)[2]);
  fill(g, [kx - 10, ky - 11, kx - 8, ky - 24, kx + 8, ky - 24, kx + 10, ky - 11], rT('#6A4A2A', t)[3]);
  line(g, [kx - 8, ky - 22, kx + 8, ky - 22], rT('#6A4A2A', t)[0], 2);
  for (const [a, b] of [[[kx + 16, ky - 10], [l + 2, top]], [[kx + 12, ky - 6], [l + 4, top + 12]], [[kx + 8, ky - 14], [l + 12, top - 6]]] as const) line(g, [a[0], a[1], b[0], b[1]], t('#B8B4AE'), 1);
  // (the sign on its stake, pointing at the wall)
  const sy2 = stakeSign(g, x + 150, foot, 40, 66, 22, t);
  signAt(g, 'THIS WAY TO', x + 150, sy2 + 9, 4, carved(4, t('#2A1A0C'), t('#E8C890'))); signAt(g, 'THE GOLD', x + 150, sy2 + 17, 4, carved(4, t('#2A1A0C'), t('#E8C890')));
  fill(g, [x + 116, sy2, x + 104, sy2 + 11, x + 116, sy2 + 22], W[2]);
};

/** Mine timbers: logs piled end on (their rings), a broken set (a post snapped, the cap down), the winch and its rope,
 *  a pick and a shovel leant on the pile, SHORING stenciled on a crate. */
const timbers = (g: Ctx, x: number, foot: number, t: T) => {
  const W = rT('#8A6238', t), E = rT('#C8A06A', t), M = rT('#5A626C', t);
  // (the broken set behind: one post up, the other snapped, the cap fallen across)
  const bx = x + 40;
  box(g, bx - 1, foot - 170, 20, 170, t(INK)); stepped(g, bx, foot - 170, 18, 170, W);
  inked(g, [bx + 100, foot, bx + 100, foot - 70, bx + 106, foot - 82, bx + 110, foot - 72, bx + 114, foot - 86, bx + 118, foot - 70, bx + 118, foot], W[2], t);
  for (let k = 0; k < 4; k++) box(g, bx + 101 + k * 4, foot - 84 + (k % 2) * 8, 2, 10, E[3]);
  g.save(); g.translate(bx + 10, foot - 170); g.rotate(0.62);
  box(g, -2, -11, 150, 22, t(INK)); stepped(g, 0, -10, 146, 20, W, [3, 3, 2, 2, 2, 2, 1, 1]); box(g, 0, -10, 146, 2, W[4]);
  oval(g, 146, 0, 4, 10, E[2]);
  g.restore();
  // (the pile: logs end on, three, two, one; rings, cracks, the bark round each)
  const log = (lx: number, ly: number, r: number) => {
    oval(g, lx, ly, r + 1, r + 1, t(INK)); oval(g, lx, ly, r, r, W[1]); oval(g, lx - 1, ly - 1, r - 3, r - 3, E[2]);
    for (let k = r - 6; k > 1; k -= 4) { g.strokeStyle = E[k % 8 ? 1 : 3]; g.lineWidth = 1; g.beginPath(); g.arc(lx - 1, ly - 1, k, 0, Math.PI * 2); g.stroke(); }
    oval(g, lx - 1, ly - 1, 1.5, 1.5, E[0]); line(g, [lx - 1, ly - 1, lx + r * 0.6, ly - r * 0.5], E[0], 1);
  };
  const r = 16;
  for (let row = 0; row < 3; row++) for (let k = 0; k < 3 - row; k++) log(x - 72 + k * 34 + row * 17, foot - r - row * 29, r);
  // (the pick and shovel leant on the pile)
  line(g, [x - 104, foot, x - 84, foot - 90], t(INK), 5); line(g, [x - 104, foot, x - 84, foot - 90], E[2], 3);
  line(g, [x - 96, foot - 94, x - 84, foot - 90, x - 70, foot - 98], t(INK), 6); line(g, [x - 96, foot - 94, x - 84, foot - 90, x - 70, foot - 98], M[3], 3);
  line(g, [x - 2, foot - 2, x + 10, foot - 100], t(INK), 5); line(g, [x - 2, foot - 2, x + 10, foot - 100], E[2], 3);
  inked(g, [x - 8, foot - 2, x + 6, foot - 4, x + 4, foot - 24, x - 6, foot - 22], M[2], t); box(g, x + 6, foot - 106, 10, 4, t(INK));
  // (the winch: a drum on its frame, rope wound on it, the crank; the coil of rope; the crate)
  const wx = x + 100;
  for (const fx of [wx - 22, wx + 18]) { box(g, fx - 1, foot - 44, 6, 44, t(INK)); box(g, fx, foot - 44, 4, 44, M[1]); }
  oval(g, wx, foot - 30, 18, 14, t(INK)); oval(g, wx, foot - 30, 17, 13, rT('#C8A86A', t)[2]);
  for (let k = -12; k <= 12; k += 3) box(g, wx + k, foot - 42, 1, 24, rT('#C8A86A', t)[k % 2 ? 1 : 3]);
  line(g, [wx + 20, foot - 30, wx + 30, foot - 22, wx + 30, foot - 12], t(INK), 3); box(g, wx + 27, foot - 14, 8, 4, M[3]);
  oval(g, wx + 58, foot - 6, 18, 6, t(INK)); oval(g, wx + 58, foot - 7, 17, 5, rT('#C8A86A', t)[2]); oval(g, wx + 58, foot - 8, 8, 2, rT('#C8A86A', t)[0]);
  boards(g, x - 150, foot - 30, 52, 30, t);
  signAt(g, 'SHORING', x - 124, foot - 12, 4, stencil(4, t('#1A0B06')));
};

/** Stalagmites: fiberglass cones in a cluster, ridged, lit down their left, drips on their tips; one snapped off, its top
 *  lying by it, the break showing the chicken wire and the dowel inside. (`bats`: a smaller cluster, and the bats on
 *  their fishing line over it, live.) */
const cone = (g: Ctx, x: number, foot: number, w: number, h: number, R: string[], t: T) => {
  inked(g, [x - w / 2, foot, x - w * 0.18, foot - h * 0.7, x, foot - h, x + w * 0.16, foot - h * 0.72, x + w / 2, foot], R[2], t);
  fill(g, [x - w / 2 + 2, foot, x - w * 0.18, foot - h * 0.7, x, foot - h + 2, x - w * 0.06, foot - h * 0.5, x - w * 0.2, foot], R[3]);
  fill(g, [x + w * 0.12, foot, x + w * 0.1, foot - h * 0.6, x + w * 0.16, foot - h * 0.72, x + w / 2 - 2, foot], R[1]);
  for (let k = 1; k < 5; k++) box(g, x - w * 0.36 + k * w * 0.16, foot - h * 0.32 - (k % 2) * 6, 1, h * 0.26, R[k < 3 ? 4 : 0]);
  box(g, x - 1, foot - h - 2, 2, 3, mix(R[4], '#FFFFFF', 0.3));
};
const stalagmites = (g: Ctx, x: number, foot: number, t: T, bats: boolean) => {
  const R = rT('#7A6A5E', t);
  const set: [number, number, number][] = bats ? [[-40, 26, 60], [-14, 34, 96], [16, 24, 52], [38, 20, 34]] : [[-80, 30, 70], [-50, 40, 130], [-16, 28, 84], [70, 36, 110], [100, 24, 54], [126, 18, 34]];
  for (const [ox, w, h] of set) cone(g, x + ox, foot, w, h, R, t);
  if (bats) return;
  // (the snapped one: its stump, the break: chicken wire over the dark, the dowel up out of it; its top beside it)
  const sx = x + 22;
  inked(g, [sx - 22, foot, sx - 14, foot - 50, sx + 12, foot - 54, sx + 22, foot], R[2], t);
  fill(g, [sx - 20, foot, sx - 14, foot - 50, sx - 4, foot - 52, sx - 8, foot], R[3]);
  oval(g, sx - 1, foot - 52, 13, 4, t('#1A1414'));
  for (let k = -10; k <= 10; k += 4) { line(g, [sx + k, foot - 55, sx + k + 3, foot - 49], t('#9AA0A8'), 1); line(g, [sx + k + 3, foot - 55, sx + k, foot - 49], t('#9AA0A8'), 1); }
  box(g, sx - 2, foot - 74, 4, 24, t(INK)); box(g, sx - 1, foot - 74, 2, 24, t('#C49C66'));
  g.save(); g.translate(sx + 50, foot - 6); g.rotate(1.35);
  inked(g, [-12, 0, -4, -50, 0, -60, 4, -50, 12, 0], R[2], t); fill(g, [-10, 0, -4, -50, 0, -58, -2, 0], R[3]);
  oval(g, 0, 0, 12, 3, t('#C8C0A8'));
  g.restore();
  // (the plaque on its rope posts)
  for (const px of [x - 130, x - 104]) { box(g, px - 2, foot - 26, 4, 26, t(INK)); box(g, px - 1, foot - 26, 2, 26, rT('#C8A86A', t)[2]); }
  crate(g, x - 156, foot - 48, 78, 22, rT('#2E3A2E', t), t);
  signAt(g, 'DO NOT TOUCH', x - 117, foot - 40, 4, enamel(4, t('#F2E8C8'))); signAt(g, 'THE FORMATIONS', x - 117, foot - 32, 3, print(3, t('#C8D8B8')));
};
const batsLive = (c: Ctx, x: number, foot: number, f: number, t: T) => {
  for (let i = 0; i < 3; i++) {
    const bx = x - 50 + i * 50 + Math.sin(f * 0.02 + i * 2) * 6, by = foot - 190 + i * 22 + Math.sin(f * 0.05 + i) * 10;
    c.strokeStyle = 'rgba(200, 210, 220, 0.3)'; c.lineWidth = 1; c.beginPath(); c.moveTo(bx, foot - 330); c.lineTo(bx, by - 4); c.stroke();
    const flap = Math.sin(f * 0.35 + i * 1.7) * 8;
    for (const s of [-1, 1]) {
      fill(c, [bx, by - 2, bx + s * 10, by - 8 - flap, bx + s * 20, by - 4 - flap * 0.6, bx + s * 16, by + 2, bx + s * 12, by - 1, bx + s * 8, by + 4], t(INK));
      fill(c, [bx + s * 2, by - 1, bx + s * 10, by - 6 - flap, bx + s * 17, by - 3 - flap * 0.6, bx + s * 8, by + 2], t('#3A2E3E'));
    }
    oval(c, bx, by, 4, 6, t(INK)); oval(c, bx, by, 3, 5, t('#4A3A4A'));
    box(c, bx - 3, by - 8, 2, 3, t(INK)); box(c, bx + 1, by - 8, 2, 3, t(INK));
    box(c, bx - 2, by - 2, 1, 1, '#F87171'); box(c, bx + 1, by - 2, 1, 1, '#F87171');
  }
};

/** The MINER'S MERCANTILE: a little shop in the rock (the back: planks, shelves of gold bags, pans and hats, the window's
 *  warm light; the clerk, live; the front: the counter, the sacks of REAL GOLD, the awning, the A-board, the fine print). */
const shopBack = (g: Ctx, x: number, foot: number, t: T) => {
  const Rk = rT('#4E4040', t), W = rT('#7A5530', t), In = rT('#6A4A2A', t), Gd = rT('#D8A82A', t);
  inked(g, [x - 140, foot, x - 132, foot - 160, x - 100, foot - 214, x - 20, foot - 236, x + 70, foot - 228, x + 124, foot - 190, x + 140, foot - 90, x + 146, foot], Rk[2], t);
  for (let k = 0; k < 11; k++) box(g, x - 130 + k * 26, foot - 210 + hash(k * 1.3) * 40, 3, 60 + hash(k) * 60, Rk[3]);
  // (the front wall: planks, a doorway; inside: the warm back wall and its shelves)
  box(g, x - 100, foot - 170, 200, 170, t(INK));
  for (let k = 0; k < 10; k++) { box(g, x - 99 + k * 20, foot - 169, 19, 169, W[k % 3 === 0 ? 3 : 2]); box(g, x - 99 + k * 20, foot - 169, 1, 169, W[0]); }
  box(g, x - 72, foot - 140, 120, 84, t(INK)); box(g, x - 70, foot - 138, 116, 80, In[3]);
  for (let y = foot - 138; y < foot - 58; y += 4) if ((y / 4) % 2) box(g, x - 70, y, 116, 1, In[2]);
  for (const sy of [foot - 118, foot - 92]) {
    box(g, x - 70, sy, 116, 4, W[1]); box(g, x - 70, sy, 116, 1, W[4]);
    for (let k = 0; k < 7; k++) {
      const ix = x - 64 + k * 16;
      if ((k + (sy & 1)) % 3 === 0) { oval(g, ix + 5, sy - 3, 7, 3, t(INK)); oval(g, ix + 5, sy - 4, 6, 2, rT('#8A929C', t)[3]); }
      else if (k % 3 === 1) { fill(g, [ix, sy, ix + 10, sy, ix + 9, sy - 12, ix + 5, sy - 15, ix + 1, sy - 12], rT('#B89A6A', t)[2]); box(g, ix + 3, sy - 8, 4, 4, Gd[3]); }
      else { box(g, ix, sy - 8, 12, 4, rT('#6A4A2A', t)[2]); fill(g, [ix + 2, sy - 8, ix + 4, sy - 14, ix + 8, sy - 14, ix + 10, sy - 8], rT('#6A4A2A', t)[3]); }
    }
  }
  box(g, x + 56, foot - 120, 30, 120, t(INK)); box(g, x + 58, foot - 118, 26, 118, In[1]);
  box(g, x + 78, foot - 62, 3, 3, Gd[3]);
};
const shopFront = (g: Ctx, x: number, foot: number, t: T) => {
  const W = rT('#7A5530', t), Gd = rT('#D8A82A', t), Bu = rT('#B89A6A', t), Rd = rT('#B8281C', t), Cr = rT('#E8DCC0', t);
  // (the awning: striped, scalloped, dim)
  for (let k = 0; k < 12; k++) fill(g, [x - 104 + k * 18, foot - 184, x - 86 + k * 18, foot - 184, x - 84 + k * 18, foot - 160, x - 102 + k * 18, foot - 160], k % 2 ? Cr[1] : Rd[1]);
  for (let k = 0; k < 12; k++) { g.fillStyle = k % 2 ? Cr[1] : Rd[1]; g.beginPath(); g.arc(x - 93 + k * 18, foot - 160, 9, 0, Math.PI); g.fill(); }
  box(g, x - 106, foot - 186, 222, 3, t(INK));
  // (the header board)
  crate(g, x - 96, foot - 214, 192, 28, W, t);
  signAt(g, "MINER'S MERCANTILE", x, foot - 196, 7, plank(7, t('#F2C14E'), undefined, t('#2A0A04'), 3));
  // (the counter: planks, a glass case of nuggets on it, the bell)
  box(g, x - 80, foot - 52, 160, 52, t(INK)); stepped(g, x - 79, foot - 51, 158, 51, W, [3, 3, 2, 2, 2, 2, 1, 1]);
  for (let k = 1; k < 4; k++) box(g, x - 79, foot - 51 + k * 12, 158, 1, W[0]);
  box(g, x - 84, foot - 56, 168, 6, t(INK)); box(g, x - 83, foot - 55, 166, 4, W[3]); box(g, x - 83, foot - 55, 166, 1, W[4]);
  box(g, x - 54, foot - 74, 54, 18, t(INK)); box(g, x - 53, foot - 73, 52, 16, t('#2A3A44')); box(g, x - 53, foot - 73, 52, 2, t('#9AC8D8'));
  for (let k = 0; k < 7; k++) { oval(g, x - 46 + k * 7, foot - 61, 3, 2, Gd[2]); box(g, x - 47 + k * 7, foot - 63, 1, 1, Gd[4]); }
  oval(g, x + 26, foot - 58, 6, 4, t(INK)); oval(g, x + 26, foot - 59, 5, 3, Gd[3]); box(g, x + 25, foot - 64, 2, 3, t(INK));
  // (the sacks: burlap, slumped open, gold heaped in them, GOLD on each)
  for (const [sx, s] of [[x - 120, 1], [x + 104, 0.85]] as const) {
    inked(g, [sx - 18 * s, foot, sx - 20 * s, foot - 30 * s, sx - 14 * s, foot - 40 * s, sx + 14 * s, foot - 40 * s, sx + 20 * s, foot - 30 * s, sx + 18 * s, foot], Bu[2], t);
    fill(g, [sx - 18 * s, foot, sx - 20 * s, foot - 30 * s, sx - 14 * s, foot - 40 * s, sx - 6 * s, foot - 38 * s, sx - 8 * s, foot], Bu[3]);
    oval(g, sx, foot - 40 * s, 14 * s, 5 * s, Gd[2]); for (let k = 0; k < 5; k++) box(g, sx - 10 * s + k * 5 * s, foot - 43 * s - (k % 2) * 2, 3, 2, Gd[4]);
    signAt(g, 'GOLD', sx, foot - 16 * s, 4, stencil(4, t('#5A1A0C')));
  }
  // (the A-board out front: REAL GOLD, the price, and the fine print)
  const ax = x + 168;
  inked(g, [ax - 26, foot, ax - 18, foot - 76, ax + 18, foot - 76, ax + 26, foot], t('#1E2A22'), t);
  box(g, ax - 18, foot - 78, 36, 3, W[3]);
  signAt(g, 'REAL', ax, foot - 62, 5, enamel(5, t('#F2C14E'))); signAt(g, 'GOLD!', ax, foot - 52, 5, enamel(5, t('#F2C14E')));
  signAt(g, '$19.99', ax, foot - 38, 4, print(4, t('#F8FAFC'))); signAt(g, 'A BAG', ax, foot - 30, 3, print(3, t('#F8FAFC')));
  signAt(g, '*NOT GOLD', ax, foot - 14, 3, print(3, t('#8A9A8A')));
};
const shopLive = (c: Ctx, x: number, foot: number, f: number) => {
  steppedGlow(c, x - 12, foot - 98, 70, '#FFC870', 0.12, 0.01, 4);
  c.save(); c.translate(x - 4, foot - 50); c.scale(-1, 1);
  drawPerson(c, { seed: 7313, outfit: 'guest', f, pose: 'stand', mood: 'bored', look: { shirt: '#B8281C' } });
  c.restore();
  // (OPEN, in the window, the O blinking out now and then)
  const on = (f >> 5) % 7 !== 0;
  box(c, x + 6, foot - 136, 34, 12, '#0A0A0C');
  signAt(c, on ? 'OPEN' : ' PEN', x + 23, foot - 127, 4, print(4, on ? '#F87171' : '#B91C1C'));
  // (a twinkle off the gold)
  const p = (f + 13) % 90;
  if (p < 8) { box(c, x - 121, foot - 46 - p, 2, 6, '#FFFFFF'); box(c, x - 123, foot - 44 - p, 6, 2, '#FFFFFF'); }
};

/** A pack mule (an animatronic: the servo ring at its neck) over the sluice, its packs on (a gold pan, a pick); the
 *  sluice on its legs, a trickle down it, gold flecks; PAN FOR GOLD. The head's live (it nods). */
const mule = (g: Ctx, x: number, foot: number, t: T) => {
  const Br = rT('#7A5A44', t), W = rT('#8A6238', t), M = rT('#8A929C', t), Cn = rT('#C8A86A', t);
  // (the sluice: a trough down on its legs, its riffles, a pan by it)
  const sx = x + 70;
  for (const [lx, h] of [[sx - 40, 50], [sx + 44, 30]] as const) { box(g, lx - 1, foot - h, 6, h, t(INK)); box(g, lx, foot - h, 4, h, W[1]); }
  inked(g, [sx - 50, foot - 58, sx + 56, foot - 34, sx + 56, foot - 24, sx - 50, foot - 46], W[2], t);
  fill(g, [sx - 50, foot - 58, sx + 56, foot - 34, sx + 56, foot - 31, sx - 50, foot - 55], W[4]);
  for (let k = 0; k < 6; k++) box(g, sx - 40 + k * 16, foot - 52 + k * 3.6, 2, 6, W[0]);
  oval(g, sx + 74, foot - 6, 16, 5, t(INK)); oval(g, sx + 74, foot - 7, 15, 4, M[2]); oval(g, sx + 74, foot - 8, 9, 2, M[0]);
  for (let k = 0; k < 3; k++) box(g, sx + 70 + k * 3, foot - 9, 1, 1, rT('#D8A82A', t)[4]);
  // (the mule: legs, the barrel of it, the packs, the tail; the neck up to the servo ring)
  const mx = x - 30;
  for (const [lx, sh] of [[mx - 34, 1], [mx - 22, 2], [mx + 18, 1], [mx + 30, 2]] as const) {
    box(g, lx - 1, foot - 50, 9, 50, t(INK)); box(g, lx, foot - 50, 7, 46, Br[sh]); box(g, lx, foot - 6, 7, 6, t('#2A2A2E'));
  }
  oval(g, mx, foot - 62, 44, 22, t(INK)); oval(g, mx, foot - 62, 43, 21, Br[2]); oval(g, mx - 6, foot - 68, 32, 12, Br[3]); oval(g, mx + 8, foot - 50, 30, 8, Br[1]);
  line(g, [mx - 42, foot - 70, mx - 52, foot - 50, mx - 50, foot - 36], t(INK), 4); line(g, [mx - 42, foot - 70, mx - 52, foot - 50, mx - 50, foot - 36], Br[1], 2);
  for (let k = 0; k < 4; k++) box(g, mx - 54 + k, foot - 38 + k * 2, 3, 4, t('#2A1E14'));
  // (the packs: saddlebags, a bedroll, the pan and pick lashed on)
  crate(g, mx - 26, foot - 80, 34, 28, rT('#6A4A2A', t), t); box(g, mx - 26, foot - 70, 34, 2, rT('#6A4A2A', t)[0]);
  oval(g, mx - 2, foot - 86, 22, 8, t(INK)); oval(g, mx - 2, foot - 86, 21, 7, rT('#4A6A8A', t)[2]); for (const bx of [mx - 12, mx + 8]) box(g, bx, foot - 93, 2, 14, Cn[1]);
  oval(g, mx + 18, foot - 82, 12, 12, t(INK)); oval(g, mx + 18, foot - 82, 11, 11, M[2]); oval(g, mx + 18, foot - 82, 7, 7, M[1]);
  line(g, [mx - 30, foot - 100, mx + 10, foot - 74], t(INK), 4); line(g, [mx - 30, foot - 100, mx + 10, foot - 74], Cn[2], 2);
  line(g, [mx - 36, foot - 98, mx - 30, foot - 100, mx - 22, foot - 108], t(INK), 5); line(g, [mx - 36, foot - 98, mx - 30, foot - 100, mx - 22, foot - 108], M[3], 3);
  inked(g, [mx + 30, foot - 70, mx + 42, foot - 98, mx + 54, foot - 94, mx + 46, foot - 62], Br[2], t);
  fill(g, [mx + 32, foot - 72, mx + 42, foot - 96, mx + 46, foot - 94, mx + 38, foot - 70], Br[3]);
  for (let k = 0; k < 4; k++) box(g, mx + 38 + k * 2, foot - 100 + k * 6, 4, 4, t('#2A1E14'));
  oval(g, mx + 50, foot - 98, 8, 8, t(INK)); oval(g, mx + 50, foot - 98, 7, 7, M[1]); oval(g, mx + 50, foot - 98, 3, 3, M[3]);
  // (the sign)
  const sy = stakeSign(g, x - 120, foot, 34, 62, 24, t);
  signAt(g, 'PAN FOR', x - 120, sy + 10, 4, carved(4, t('#2A1A0C'), t('#E8C890'))); signAt(g, 'GOLD! $5', x - 120, sy + 18, 4, carved(4, t('#2A1A0C'), t('#E8C890')));
};
const muleLive = (c: Ctx, x: number, foot: number, f: number, t: T) => {
  const Br = rT('#7A5A44', t), mx = x - 30, px = mx + 50, py = foot - 98, a = 0.35 + Math.sin(f * 0.05) * 0.22;
  // (the trickle down the sluice)
  const sx = x + 70;
  for (let k = 0; k < 6; k++) { const u = ((f * 0.02 + k / 6) % 1); box(c, sx - 46 + u * 98, foot - 54 + u * 22, 4, 1, k % 2 ? t('#9AD8F0') : t('#5EAED6')); }
  c.save(); c.translate(px, py); c.rotate(a);
  // (the head: long, the ears up, the muzzle down toward the water, an eye, the bridle)
  for (const ex of [-4, 2]) { fill(c, [ex, -4, ex + 3, -22, ex + 7, -4], t(INK)); fill(c, [ex + 1, -5, ex + 3, -19, ex + 5, -5], Br[3]); }
  fill(c, [-6, -4, 10, -6, 34, 6, 36, 16, 26, 20, 4, 10], t(INK));
  fill(c, [-5, -3, 10, -5, 33, 7, 34, 15, 26, 18, 4, 9], Br[2]);
  fill(c, [-5, -3, 10, -5, 30, 5, 8, 2], Br[3]);
  oval(c, 30, 14, 6, 5, t('#C8B8A0'));
  box(c, 32, 12, 2, 2, t(INK)); box(c, 8, 1, 3, 3, t(INK)); box(c, 8, 1, 1, 1, '#FFFFFF');
  line(c, [4, 8, 24, 10, 26, 18], t('#5A1A0C'), 1.5);
  c.restore();
};

/** THE LAST UNFRIENDLY GUEST: a skeleton chained up on the rock by the wrists, in what's left of a park T-shirt, an old
 *  park map in the dirt under him; the plaque. (His jaw's on a servo: live, chattering.) */
const skeleton = (g: Ctx, x: number, foot: number, t: T) => {
  const Rk = rT('#4E4046', t), Bn = rT('#E4DCC4', t), M = rT('#5A626C', t), Ts = rT('#2E7A6A', t);
  inked(g, [x - 80, foot, x - 76, foot - 190, x - 50, foot - 220, x + 40, foot - 226, x + 74, foot - 196, x + 82, foot], Rk[2], t);
  for (let k = 0; k < 7; k++) box(g, x - 70 + k * 22, foot - 210 + hash(k * 4.1) * 40, 3, 80 + hash(k) * 60, Rk[3]);
  // (the rings in the rock, the chains down to his wrists)
  for (const s of [-1, 1]) {
    const rx = x + s * 46, ry = foot - 196;
    oval(g, rx, ry, 6, 6, t(INK)); oval(g, rx, ry, 5, 5, M[3]); oval(g, rx, ry, 2, 2, t(INK));
    for (let k = 0; k < 5; k++) { const cx = rx - s * k * 5, cy = ry + 6 + k * 5; oval(g, cx, cy, 3, 2, t(INK)); oval(g, cx, cy, 2, 1, M[3]); }
    box(g, rx - s * 26 - 5, ry + 30, 10, 6, t(INK)); box(g, rx - s * 26 - 4, ry + 31, 8, 4, M[2]);
  }
  // (the arms up to the cuffs; the ribs in a tatty T-shirt; the pelvis, the legs hanging)
  for (const s of [-1, 1]) {
    line(g, [x + s * 12, foot - 140, x + s * 18, foot - 154, x + s * 20, foot - 160], t(INK), 4); line(g, [x + s * 12, foot - 140, x + s * 18, foot - 154, x + s * 20, foot - 160], Bn[2], 2);
    line(g, [x + s * 8, foot - 74, x + s * 10, foot - 40, x + s * 8, foot - 8], t(INK), 5); line(g, [x + s * 8, foot - 74, x + s * 10, foot - 40, x + s * 8, foot - 8], Bn[s < 0 ? 3 : 2], 3);
    box(g, x + s * 8 - 5, foot - 8, 10, 4, Bn[1]);
  }
  fill(g, [x - 16, foot - 142, x + 16, foot - 142, x + 18, foot - 100, x + 8, foot - 92, x - 6, foot - 98, x - 18, foot - 92], t(INK));
  fill(g, [x - 15, foot - 141, x + 15, foot - 141, x + 17, foot - 101, x + 8, foot - 94, x - 6, foot - 100, x - 17, foot - 94], Ts[2]);
  fill(g, [x - 15, foot - 141, x - 4, foot - 141, x - 8, foot - 100, x - 17, foot - 94], Ts[3]);
  oval(g, x, foot - 124, 7, 7, t(INK)); oval(g, x, foot - 124, 6, 6, t('#F2E8C8'));
  box(g, x - 3, foot - 126, 6, 3, t('#B91C1C'));
  box(g, x + 4, foot - 112, 6, 6, t(INK)); box(g, x - 10, foot - 104, 5, 5, t(INK));
  line(g, [x, foot - 92, x, foot - 80], t(INK), 4); line(g, [x, foot - 92, x, foot - 80], Bn[2], 2);
  fill(g, [x - 14, foot - 82, x + 14, foot - 82, x + 10, foot - 70, x - 10, foot - 70], t(INK)); fill(g, [x - 13, foot - 81, x + 13, foot - 81, x + 9, foot - 71, x - 9, foot - 71], Bn[2]);
  oval(g, x - 5, foot - 76, 3, 3, t(INK)); oval(g, x + 5, foot - 76, 3, 3, t(INK));
  // (the skull: tipped, its sockets; the lower jaw's live)
  oval(g, x + 2, foot - 156, 13, 14, t(INK)); oval(g, x + 2, foot - 156, 12, 13, Bn[2]); oval(g, x - 2, foot - 160, 6, 6, Bn[3]);
  oval(g, x - 3, foot - 156, 4, 4, t(INK)); oval(g, x + 7, foot - 156, 4, 4, t(INK)); box(g, x + 1, foot - 151, 2, 3, t(INK));
  // (the map in the dirt)
  g.save(); g.translate(x + 40, foot - 4); g.rotate(-0.12);
  box(g, -16, -8, 32, 9, t(INK)); box(g, -15, -7, 30, 7, t('#E8E0C8')); box(g, -10, -6, 6, 4, t('#4ADE80')); box(g, -2, -5, 10, 2, t('#60A5FA')); box(g, 10, -6, 3, 3, t('#B91C1C'));
  g.restore();
  // (the plaque)
  const py = foot - 44;
  crate(g, x + 92, py, 96, 30, rT('#3A2A1E', t), t);
  signAt(g, 'THE LAST', x + 140, py + 10, 4, gilt(4, t('#2A0A04'))); signAt(g, 'UNFRIENDLY', x + 140, py + 18, 4, gilt(4, t('#2A0A04'))); signAt(g, 'GUEST', x + 140, py + 26, 4, gilt(4, t('#2A0A04')));
  box(g, x + 138, py + 30, 4, 14, t(INK)); box(g, x + 139, py + 30, 2, 14, rT('#7A5634', t)[2]);
};
const skeletonLive = (c: Ctx, x: number, foot: number, f: number, t: T) => {
  const open = (f >> 3) % 4 === 0 ? 0 : ((f >> 2) % 2) * 3 + 1;
  box(c, x - 6, foot - 146 + open, 15, 6, t(INK)); box(c, x - 5, foot - 145 + open, 13, 4, t('#E4DCC4'));
  for (let k = 0; k < 4; k++) box(c, x - 4 + k * 3, foot - 146 + open, 2, 2, t('#F8F4E8'));
};

// ---------------------------------------------------------------------------------------------------------------
// Where they go

type Kind = 'crystals' | 'work' | 'tnt' | 'shaft' | 'miner' | 'fuse' | 'falls' | 'ore' | 'timbers' | 'mites' | 'bats' | 'shop' | 'mule' | 'bones';
/** [x from the mine's start, depth, what] */
const PLACED: [number, number, Kind][] = [
  [2720, 0.77, 'crystals'], [3250, 0.78, 'work'], [3820, 0.76, 'tnt'], [4380, 0.77, 'shaft'], [4920, 0.78, 'miner'],
  [5460, 0.76, 'falls'], [5960, 0.77, 'ore'], [6620, 0.76, 'crystals'], [7110, 0.78, 'timbers'], [7700, 0.77, 'bats'],
  [8680, 0.78, 'shop'], [9260, 0.76, 'mule'], [10760, 0.77, 'crystals'], [11340, 0.78, 'bones'], [11920, 0.76, 'fuse'],
  [12320, 0.77, 'mites'], [12940, 0.78, 'shaft'], [13480, 0.76, 'ore'], [14080, 0.77, 'tnt'], [14660, 0.78, 'crystals'],
  [15110, 0.76, 'miner'], [15560, 0.77, 'timbers'], [16000, 0.78, 'bats'], [16720, 0.76, 'work'], [17920, 0.77, 'falls'],
  [18460, 0.78, 'crystals'], [19000, 0.76, 'mule'], [19840, 0.77, 'ore'], [20300, 0.78, 'mites'], [20820, 0.76, 'fuse'],
  [21740, 0.77, 'tnt'], [22260, 0.78, 'shaft'],
];
interface Piece { x: number; d: number; kind: Kind; i: number; foot: number }
/** (each on its ledge, a little under the track's height there) */
const PIECES: Piece[] = PLACED.map(([rx, d, kind], i) => ({ x: X + rx, d, kind, i, foot: Math.round(artieTrackY(X + rx) + 40) })).sort((a, b) => a.d - b.d);
const HALF: Record<Kind, number> = { crystals: 120, work: 140, tnt: 140, shaft: 130, miner: 110, fuse: 110, falls: 150, ore: 190, timbers: 180, mites: 170, bats: 110, shop: 200, mule: 160, bones: 200 };
const TALL: Record<Kind, number> = { crystals: 170, work: 160, tnt: 110, shaft: 230, miner: 190, fuse: 190, falls: 270, ore: 120, timbers: 180, mites: 140, bats: 110, shop: 240, mule: 120, bones: 230 };
const PAINT: Record<Kind, (g: Ctx, x: number, foot: number, t: T, seed: number) => void> = {
  crystals, work: (g, x, f, t) => workLight(g, x, f, t), tnt: (g, x, f, t) => tnt(g, x, f, t), shaft,
  miner: (g, x, f, t) => miner(g, x, f, t, false), fuse: (g, x, f, t) => miner(g, x, f, t, true), falls: waterfall,
  ore: (g, x, f, t) => oreCart(g, x, f, t), timbers: (g, x, f, t) => timbers(g, x, f, t),
  mites: (g, x, f, t) => stalagmites(g, x, f, t, false), bats: (g, x, f, t) => stalagmites(g, x, f, t, true),
  shop: (g, x, f, t) => shopBack(g, x, f, t), mule: (g, x, f, t) => mule(g, x, f, t), bones: (g, x, f, t) => skeleton(g, x, f, t),
};

const live = (c: Ctx, p: Piece, f: number, t: T) => {
  const { x, foot } = p;
  switch (p.kind) {
    case 'crystals': crystalsLive(c, x, foot, f, p.i); break;
    case 'work': workLightLive(c, x, foot); break;
    case 'shaft': shaftLive(c, x, foot, f); break;
    case 'miner': minerLive(c, x, foot, f, t, false, p.i); break;
    case 'fuse': minerLive(c, x, foot, f, t, true, p.i); break;
    case 'falls': waterfallLive(c, x, foot, f); break;
    case 'bats': batsLive(c, x, foot, f, t); break;
    case 'shop': {
      shopLive(c, x, foot, f);
      stamp(c, `cart-dress-shopfront-${p.i}`, x - HALF.shop, foot - 220, HALF.shop * 2 + 10, 230, g => shopFront(g, x, foot, t));
      break;
    }
    case 'mule': muleLive(c, x, foot, f, t); break;
    case 'bones': skeletonLive(c, x, foot, f, t); break;
    default: break;
  }
};

/** The set dressing, furthest first (after the timbered wall's rock, before its posts). */
export const drawCartDressing = (c: Ctx, eye: Eye, state: GameState) => {
  const f = state.frame || 0, L = state.camera.x, R = L + CANVAS_WIDTH;
  for (const p of PIECES) {
    const sx = eye.x + (p.x - eye.x) * p.d, hw = (HALF[p.kind] + 10) * p.d;
    if (sx + hw < L - 40 || sx - hw > R + 40) continue;
    const t = tintFor(p.d);
    c.save(); c.translate(eye.x, eye.y); c.scale(p.d, p.d); c.translate(-eye.x, -eye.y);
    stamp(c, `cart-dress-${p.i}`, p.x - HALF[p.kind] - 10, p.foot - TALL[p.kind] - 10, HALF[p.kind] * 2 + 20, TALL[p.kind] + LEDGE + 20, g => {
      ledge(g, p.x, p.foot, HALF[p.kind] - 10, t, p.i * 7 + 3);
      PAINT[p.kind](g, p.x, p.foot, t, p.i * 13 + 5);
    });
    live(c, p, f, t);
    c.restore();
  }
};

/** Their light: soft, never a spot (the crystals' own glow, the work light, the shop's window, the lanterns, the falls). */
export const cartDressingLights = (state: GameState, eye: Eye): Light[] => {
  const out: Light[] = [], cam = state.camera.x, f = state.frame || 0;
  for (const p of PIECES) {
    const [sx] = at(eye, p.x, 0, p.d);
    if (sx < cam - 300 || sx > cam + CANVAS_WIDTH + 300) continue;
    const pt = (dx: number, dy: number) => at(eye, p.x + dx, p.foot + dy, p.d);
    const push = (dx: number, dy: number, r: number, a: number, color: string) => { const [lx, ly] = pt(dx, dy); out.push({ x: lx, y: ly, r: r * p.d, a, color }); };
    switch (p.kind) {
      case 'crystals': push(0, -60, 200, 0.55 + 0.1 * Math.sin(f * 0.04 + p.i), ['rgba(79, 184, 216, 0.1)', 'rgba(154, 106, 218, 0.1)', 'rgba(224, 122, 176, 0.1)'][p.i % 3]); break;
      case 'work': push(-10, -120, 260, 0.7, 'rgba(255, 240, 200, 0.08)'); break;
      case 'shaft': push(64, -140, 140, 0.6, 'rgba(255, 170, 80, 0.1)'); break;
      case 'miner': case 'fuse': push(20, -100, 160, 0.55, 'rgba(255, 190, 110, 0.08)'); break;
      case 'falls': push(0, -100, 200, 0.5, 'rgba(154, 216, 240, 0.08)'); break;
      case 'shop': push(-12, -100, 240, 0.7, 'rgba(255, 200, 112, 0.1)'); break;
      default: break;
    }
  }
  return out;
};
