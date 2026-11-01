// CON-FUCK-TIOUS in the world (every land's meetup uses this): a little old man in a dojo master's white gi and a frayed
// black belt, sandals, bald and liver-spotted, white side tufts and a topknot, long droopy white brows, a thin white
// mustache hanging past his chin, a wisp of goatee, big ears, a toothpick. Each pose is painted once into the stamp
// cache (m1 render/stamp.ts) and put down with one drawImage; only the flurry's frames and the odd live bit (a pebble,
// stars round his head) change, and each of those is a pose of its own.
//
// What he's holding: the armor piece he's about to give (`piece`), drawn in his hands (or on them: the gloves), till
// he's given it (`piece` null: bare hands). Limbs from art/limb.ts (elbows bend the right way).

import { stamp } from '../../../m1/game/render/stamp';
import { elbow, knee } from '../../art/limb';
import type { ArmorPiece } from '../state';

type Ctx = CanvasRenderingContext2D;

/** What he's doing. 'flurry' is three frames (pass `frame`); the rest hold still. */
export type BenPose = 'stand' | 'flurry' | 'pebble' | 'yank' | 'nuts' | 'give' | 'fold' | 'bow';

const INK = '#1A1028';
// (SNES ramps: deep .. light)
const SKIN = ['#6A3A1E', '#8E5430', '#B47446', '#D4955E', '#EAB582', '#F8D6AE'];
const GI = ['#5E5A6E', '#8E8AA0', '#BEBACC', '#E2E0EA', '#F6F4FA', '#FFFFFF'];
const BELT = ['#08060C', '#16121C', '#28222E', '#3C3444'];
const HAIR = ['#8A8494', '#B8B2C2', '#E2DEEA', '#FFFFFF'];
const SANDAL = ['#3A2410', '#6A4420', '#94642E'];
const GLOVE = ['#6E6A86', '#A4A2B8', '#D2D0DE', '#F0F0F6', '#FFFFFF'];
const STONE = ['#3A3A44', '#62626E', '#8E8E9A', '#BEBEC8'];

const box = (g: Ctx, x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w) || 1, Math.round(h) || 1); };
const ell = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string, rot = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2); g.fill(); };
const poly = (g: Ctx, pts: [number, number][], col: string) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
/** A limb segment: inked, then filled, then a lit stripe along its top. */
const bone = (g: Ctx, a: [number, number], b: [number, number], w: number, R: string[]) => {
  g.lineCap = 'round';
  g.strokeStyle = INK; g.lineWidth = w + 2; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  g.strokeStyle = R[2]; g.lineWidth = w; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  g.strokeStyle = R[4]; g.lineWidth = Math.max(1, w * 0.35); g.beginPath(); g.moveTo(a[0] - 0.5, a[1] - w * 0.25); g.lineTo(b[0] - 0.5, b[1] - w * 0.25); g.stroke();
};
/** A white four-finger cartoon glove (three fingers and a thumb), balled up, at (x, y); `big` its size. */
const glove = (g: Ctx, x: number, y: number, big = 1, open = false) => {
  const r = 6.5 * big;
  ell(g, x, y, r + 1.4, r * 0.95 + 1.4, INK);
  ell(g, x, y, r, r * 0.95, GLOVE[2]); ell(g, x - r * 0.15, y - r * 0.15, r * 0.8, r * 0.75, GLOVE[3]); ell(g, x - r * 0.35, y - r * 0.35, r * 0.35, r * 0.3, GLOVE[4]);
  if (open) {
    // (palm up: three fat fingers out)
    for (let i = 0; i < 3; i++) { ell(g, x + r * 0.9, y - r * 0.5 + i * r * 0.5, r * 0.55 + 1, r * 0.26 + 1, INK); ell(g, x + r * 0.9, y - r * 0.5 + i * r * 0.5, r * 0.55, r * 0.26, GLOVE[3]); }
  } else {
    // (the fingers curled over, the three stitch lines on the back)
    for (let i = 0; i < 3; i++) box(g, x - r * 0.5 + i * r * 0.45, y - r * 0.7, 1, r * 0.8, GLOVE[0]);
  }
  // (the rolled cuff)
  ell(g, x - r * 0.9, y + r * 0.2, r * 0.45 + 1, r * 0.8 + 1, INK); ell(g, x - r * 0.9, y + r * 0.2, r * 0.45, r * 0.8, GLOVE[3]); box(g, x - r * 1.05, y - r * 0.3, 1, r, GLOVE[1]);
};
const hand = (g: Ctx, x: number, y: number) => { ell(g, x, y, 4.2, 3.8, INK); ell(g, x, y, 3.2, 2.8, SKIN[3]); ell(g, x - 0.8, y - 0.8, 1.6, 1.2, SKIN[4]); };
const pebble = (g: Ctx, x: number, y: number) => { ell(g, x, y, 3.6, 2.8, INK); ell(g, x, y, 2.6, 2, STONE[1]); ell(g, x - 0.6, y - 0.6, 1.4, 1, STONE[3]); };

/** Where his hands go in each pose (local, facing +x: [front hand, back hand]), and how far he's hunched down. */
const HANDS: Record<Exclude<BenPose, 'flurry'>, { f: [number, number]; b: [number, number]; drop?: number; lean?: number }> = {
  stand: { f: [10, -36], b: [6, -34] },
  pebble: { f: [27, -45], b: [-6, -34] },
  yank: { f: [6, -84], b: [-6, -34] },
  nuts: { f: [6, -24], b: [2, -23], drop: 7, lean: 6 },
  give: { f: [24, -42], b: [20, -40] },
  fold: { f: [-4, -46], b: [9, -45] },
  bow: { f: [10, -30], b: [6, -29], drop: 3, lean: 10 },
};
const FLURRY: [number, number][][] = [[[30, -54], [9, -47]], [[12, -47], [29, -52]], [[26, -60], [14, -45]]];

const paintBen = (g: Ctx, pose: BenPose, frame: number, piece: ArmorPiece | null) => {
  const hp = pose === 'flurry' ? { f: FLURRY[frame % 3][0], b: FLURRY[frame % 3][1], drop: 0, lean: 2 } : HANDS[pose];
  const drop = hp.drop ?? 0, lean = hp.lean ?? 0, gloved = piece === 'hands';
  // ---- the legs: wide white gi pants, knees bent a little, sandals
  const hipY = -30 + drop;
  for (const [fx, s] of [[-7, -1], [8, 1]] as const) {
    const hip: [number, number] = [s * 3, hipY], foot: [number, number] = [fx, -3];
    const k = knee(hip[0], hip[1], foot[0], foot[1], 15, 15, 1);
    bone(g, hip, k, 10, GI); bone(g, k, foot, 9, GI);
    // (the sandal: a flat sole, a toe thong; the foot under it)
    box(g, fx - 6, -4, 13, 4, INK); box(g, fx - 5, -3, 11, 2, SANDAL[1]); box(g, fx - 5, -3, 11, 1, SANDAL[2]);
    box(g, fx - 3, -7, 8, 3, SKIN[3]); box(g, fx - 3, -7, 8, 1, SKIN[4]);
  }
  // ---- the body: the gi jacket, crossed over, the black belt and its knot
  const sx = 3 + lean, sy = -58 + drop;
  poly(g, [[-11 + lean * 0.4, hipY + 3], [13 + lean * 0.4, hipY + 3], [15 + lean, sy + 2], [-9 + lean, sy]], INK);
  poly(g, [[-10 + lean * 0.4, hipY + 2], [12 + lean * 0.4, hipY + 2], [13.5 + lean, sy + 3], [-8 + lean, sy + 1]], GI[3]);
  // (its shading: lit down the front, a fold line, shaded behind)
  poly(g, [[-10 + lean * 0.4, hipY + 2], [-5 + lean * 0.4, hipY + 2], [-4 + lean, sy + 1], [-8 + lean, sy + 1]], GI[2]);
  poly(g, [[6 + lean * 0.5, hipY + 2], [12 + lean * 0.4, hipY + 2], [13.5 + lean, sy + 3], [9 + lean, sy + 3]], GI[4]);
  // (the lapels crossing, a vee of old chest, a tuft of white chest hair)
  poly(g, [[2 + lean, sy + 2], [10 + lean, sy + 3], [3 + lean * 0.6, hipY - 2]], INK);
  poly(g, [[3 + lean, sy + 3], [8.5 + lean, sy + 3.5], [3.5 + lean * 0.6, hipY - 5]], SKIN[3]);
  box(g, 4 + lean, sy + 6, 2, 2, HAIR[2]); box(g, 5 + lean, sy + 9, 1, 2, HAIR[1]);
  g.strokeStyle = GI[1]; g.lineWidth = 1.4; g.beginPath(); g.moveTo(10 + lean, sy + 3); g.lineTo(2 + lean * 0.6, hipY + 1); g.stroke();
  // (the belt: black, frayed gray at the ends, the knot's tails hanging)
  box(g, -11 + lean * 0.4, hipY - 2, 25, 6, INK); box(g, -10 + lean * 0.4, hipY - 1, 23, 4, BELT[2]); box(g, -10 + lean * 0.4, hipY - 1, 23, 1, BELT[3]);
  poly(g, [[5 + lean * 0.4, hipY + 3], [8 + lean * 0.4, hipY + 3], [10 + lean * 0.4, hipY + 13], [7 + lean * 0.4, hipY + 13]], BELT[1]);
  poly(g, [[3 + lean * 0.4, hipY + 3], [5 + lean * 0.4, hipY + 3], [4 + lean * 0.4, hipY + 12], [2 + lean * 0.4, hipY + 12]], BELT[2]);
  box(g, 7 + lean * 0.4, hipY + 12, 3, 1, '#8A8494'); box(g, 2 + lean * 0.4, hipY + 11, 2, 1, '#8A8494');
  // ---- the back arm (behind the head and the front arm)
  const arm = (h: [number, number], back: boolean) => {
    const s: [number, number] = [sx + (back ? -5 : 1), sy + 4], e = elbow(s[0], s[1], h[0], h[1], 13, 13, 1);
    const R = back ? GI.map((_c, i) => GI[Math.max(0, i - 1)]) : GI;
    bone(g, s, e, 8, R); bone(g, e, h, 6, R);
    if (gloved) glove(g, h[0], h[1], back ? 0.9 : 1, pose === 'pebble' && !back);
    else hand(g, h[0], h[1]);
  };
  arm(hp.b, true);
  // ---- the head: bald, liver-spotted; white tufts at the sides and the topknot; the big ears; the face
  const hx = 5 + lean * 1.2, hy = -70 + drop + (pose === 'bow' ? 4 : 0);
  // (the topknot, up the back)
  ell(g, hx - 6, hy - 9, 3.4, 3, INK); ell(g, hx - 6, hy - 9, 2.4, 2, HAIR[2]);
  ell(g, hx, hy, 9.5, 10.5, INK);
  ell(g, hx, hy, 8.5, 9.5, SKIN[2]); ell(g, hx - 1, hy - 1.5, 7.2, 8, SKIN[3]); ell(g, hx - 2.5, hy - 4, 4, 4, SKIN[4]); box(g, hx - 4, hy - 7, 2, 1, SKIN[5]);
  // (liver spots)
  box(g, hx + 2, hy - 6, 2, 2, SKIN[1]); box(g, hx - 3, hy - 8, 1, 1, SKIN[1]); box(g, hx + 5, hy - 2, 1, 1, SKIN[1]);
  // (the ear, the side tuft)
  ell(g, hx - 7, hy + 1, 3, 4, INK); ell(g, hx - 7, hy + 1, 2, 3, SKIN[2]); box(g, hx - 7, hy, 1, 2, SKIN[0]);
  for (let i = 0; i < 4; i++) box(g, hx - 10 + i, hy - 3 + (i % 2), 2, 4, HAIR[i % 2 ? 1 : 2]);
  // (the face: the long brow drooping past the eye, the squint, the nose)
  const nuts = pose === 'nuts';
  g.strokeStyle = HAIR[3]; g.lineWidth = 1.6; g.beginPath(); g.moveTo(hx + 1, hy - 4); g.quadraticCurveTo(hx + 7, hy - 6, hx + 11, hy - 1); g.stroke();
  if (nuts) { box(g, hx + 4, hy - 2, 1, 1, INK); box(g, hx + 6, hy - 2, 1, 1, INK); box(g, hx + 5, hy - 1, 1, 1, INK); box(g, hx + 4, hy, 1, 1, INK); box(g, hx + 6, hy, 1, 1, INK); }
  else { box(g, hx + 3, hy - 1, 5, 1, INK); box(g, hx + 4, hy, 3, 1, SKIN[1]); }
  poly(g, [[hx + 8, hy - 1], [hx + 11.5, hy + 3], [hx + 8, hy + 4]], SKIN[2]); box(g, hx + 9, hy + 3, 1, 1, INK);
  // (the mouth: a smirk; the toothpick; winded, an O)
  if (nuts) ell(g, hx + 7, hy + 6.5, 1.6, 2, INK);
  else { box(g, hx + 5, hy + 6, 4, 1, INK); g.strokeStyle = '#E8D49A'; g.lineWidth = 1; g.beginPath(); g.moveTo(hx + 8, hy + 6); g.lineTo(hx + 13, hy + 4); g.stroke(); }
  // (the mustache: thin, white, down past his chin both sides; the goatee's wisp)
  g.strokeStyle = HAIR[2]; g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(hx + 6, hy + 5); g.quadraticCurveTo(hx + 3, hy + 9, hx + 4, hy + 16); g.stroke();
  g.beginPath(); g.moveTo(hx + 9, hy + 5); g.quadraticCurveTo(hx + 12, hy + 9, hx + 11, hy + 16); g.stroke();
  g.strokeStyle = HAIR[1]; g.beginPath(); g.moveTo(hx + 7, hy + 9); g.lineTo(hx + 7.5, hy + 14); g.stroke();
  // ---- the front arm
  arm(hp.f, false);
  // (what he's holding)
  if (pose === 'pebble') pebble(g, hp.f[0] + 2, hp.f[1] - 8);
  if (pose === 'yank') pebble(g, hp.f[0], hp.f[1] - 6);
};

/** Him, feet at (x, y), facing `facing`. `frame`: the flurry's (0..2). `piece`: what he's still holding (null: given). */
export const drawBen = (c: Ctx, x: number, y: number, facing: 1 | -1, pose: BenPose, frame: number, piece: ArmorPiece | null) => {
  c.save();
  c.translate(Math.round(x), Math.round(y));
  if (facing < 0) c.scale(-1, 1);
  stamp(c, `ben-${pose}-${pose === 'flurry' ? frame % 3 : 0}-${piece ?? 'none'}`, -24, -100, 64, 104, g => paintBen(g, pose, frame, piece));
  c.restore();
  // (winded: the stars going round)
  if (pose === 'nuts') {
    const t = performance.now() / 160;
    for (let i = 0; i < 3; i++) {
      const a = t + (i * Math.PI * 2) / 3, sx = x + facing * 6 + Math.cos(a) * 12, sy = y - 86 + Math.sin(a) * 3.5;
      c.fillStyle = INK; c.fillRect(Math.round(sx) - 2, Math.round(sy) - 2, 5, 5);
      c.fillStyle = '#FDE047'; c.fillRect(Math.round(sx) - 1, Math.round(sy) - 1, 3, 3);
    }
  }
};
/** Where his head is (for the words over it), feet at (x, y). */
export const benHeadY = (y: number) => y - 92;
