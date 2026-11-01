// CON-FUCK-TIOUS in the world (every land's meetup uses this). The owner: "just a buff generic japanese american man who
// speaks in riddles and shares much of meathead's sensibilities. like an older mentor." So: Ben Smith, a Japanese
// American lifelong gym rat in his fifties or sixties, built like a fridge: big traps, big arms, a barrel chest and a
// bit of a gut; a gray buzz cut, a short gray goatee, a nose broken a few times, a toothpick. A faded cut-off tank top
// (IRON in cracked letters), a beat-up leather lifting belt, gray sweatpants, white high-top sneakers.
//
// Each pose is painted once into the stamp cache (m1 render/stamp.ts) and put down with one drawImage; only the
// flurry's frames and the odd live bit (stars round his head) change, and each of those is a pose of its own.
// What he's holding: the armor piece he's about to give (`piece`), drawn in his hands (or on them: the gloves), till
// he's given it (`piece` null: bare hands). Limbs from art/limb.ts (elbows and knees bend the right way).

import { stamp } from '../../../m1/game/render/stamp';
import { elbow, knee } from '../../art/limb';
import type { ArmorPiece } from '../state';

type Ctx = CanvasRenderingContext2D;

/** What he's doing. 'flurry' is three frames (pass `frame`); the rest hold still. 'offer': holding something out (the
 *  trial's thing); 'yank': whipping it up out of reach. */
export type BenPose = 'stand' | 'flurry' | 'offer' | 'yank' | 'nuts' | 'give' | 'fold';

const INK = '#1A1028';
// (SNES ramps: deep .. light)
const SKIN = ['#5A3018', '#7E4A28', '#A4683C', '#C88A56', '#E2AA78', '#F4CCA0'];
const TANK = ['#3E3E4A', '#5E5E6E', '#82828E', '#A4A4AE', '#C4C4CC'];
const SWEATS = ['#2A2A34', '#3E3E4C', '#565666', '#707082', '#8E8E9E'];
const BELT = ['#2A1608', '#4A2A12', '#6E421E', '#94602E', '#B8844A'];
const SHOE = ['#8A8A96', '#C8C8D0', '#F0F0F4', '#FFFFFF'];
const GRAY = ['#4A4A54', '#7A7A86', '#A8A8B2', '#D0D0D8'];
const GLOVE = ['#6E6A86', '#A4A2B8', '#D2D0DE', '#F0F0F6', '#FFFFFF'];
const SHAKER = ['#1E3A8A', '#2563EB', '#60A5FA', '#BFDBFE'];

const box = (g: Ctx, x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w) || 1, Math.round(h) || 1); };
const ell = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string, rot = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2); g.fill(); };
const poly = (g: Ctx, pts: [number, number][], col: string) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
/** A limb segment: inked, filled, a lit stripe along its top. */
const bone = (g: Ctx, a: [number, number], b: [number, number], w: number, R: string[]) => {
  g.lineCap = 'round';
  g.strokeStyle = INK; g.lineWidth = w + 2; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  g.strokeStyle = R[2]; g.lineWidth = w; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  g.strokeStyle = R[4] ?? R[3]; g.lineWidth = Math.max(1, w * 0.3); g.beginPath(); g.moveTo(a[0] - 0.5, a[1] - w * 0.25); g.lineTo(b[0] - 0.5, b[1] - w * 0.25); g.stroke();
};
/** A white four-finger cartoon glove (three fingers and a thumb), balled up, at (x, y). */
const glove = (g: Ctx, x: number, y: number, big = 1, open = false) => {
  const r = 7 * big;
  ell(g, x, y, r + 1.4, r * 0.95 + 1.4, INK);
  ell(g, x, y, r, r * 0.95, GLOVE[2]); ell(g, x - r * 0.15, y - r * 0.15, r * 0.8, r * 0.75, GLOVE[3]); ell(g, x - r * 0.35, y - r * 0.35, r * 0.35, r * 0.3, GLOVE[4]);
  if (open) {
    for (let i = 0; i < 3; i++) { ell(g, x + r * 0.9, y - r * 0.5 + i * r * 0.5, r * 0.55 + 1, r * 0.26 + 1, INK); ell(g, x + r * 0.9, y - r * 0.5 + i * r * 0.5, r * 0.55, r * 0.26, GLOVE[3]); }
  } else {
    for (let i = 0; i < 3; i++) box(g, x - r * 0.5 + i * r * 0.45, y - r * 0.7, 1, r * 0.8, GLOVE[0]);
  }
  ell(g, x - r * 0.9, y + r * 0.2, r * 0.45 + 1, r * 0.8 + 1, INK); ell(g, x - r * 0.9, y + r * 0.2, r * 0.45, r * 0.8, GLOVE[3]); box(g, x - r * 1.05, y - r * 0.3, 1, r, GLOVE[1]);
};
/** A big bare fist (knuckles scarred). */
const fist = (g: Ctx, x: number, y: number) => { ell(g, x, y, 5.4, 4.8, INK); ell(g, x, y, 4.4, 3.8, SKIN[3]); ell(g, x - 1, y - 1, 2.2, 1.6, SKIN[4]); box(g, x + 1, y - 2, 2, 1, SKIN[1]); };
/** His protein shaker (the trial's), in his hand at (x, y). */
const shaker = (g: Ctx, x: number, y: number) => {
  box(g, x - 4, y - 15, 9, 15, INK); box(g, x - 3, y - 14, 7, 13, SHAKER[1]); box(g, x - 3, y - 14, 2, 13, SHAKER[3]); box(g, x - 3, y - 9, 7, 3, '#F8FAFC');
  box(g, x - 3, y - 18, 7, 4, INK); box(g, x - 2, y - 17, 5, 2, '#111827'); box(g, x + 1, y - 21, 2, 4, INK);
};

/** Where his hands go in each pose (local, facing +x: [front hand, back hand]), how far he's hunched, how far he leans. */
const HANDS: Record<Exclude<BenPose, 'flurry'>, { f: [number, number]; b: [number, number]; drop?: number; lean?: number }> = {
  stand: { f: [14, -38], b: [-8, -37] },
  offer: { f: [30, -48], b: [-8, -37] },
  yank: { f: [8, -94], b: [-8, -37] },
  nuts: { f: [7, -27], b: [3, -26], drop: 7, lean: 7 },
  give: { f: [28, -46], b: [24, -44] },
  fold: { f: [-2, -54], b: [12, -53] },
};
const FLURRY: [number, number][][] = [[[34, -60], [10, -52]], [[13, -52], [33, -58]], [[30, -66], [15, -50]]];

const paintBen = (g: Ctx, pose: BenPose, frame: number, piece: ArmorPiece | null) => {
  const hp = pose === 'flurry' ? { f: FLURRY[frame % 3][0], b: FLURRY[frame % 3][1], drop: 0, lean: 2 } : HANDS[pose];
  const drop = hp.drop ?? 0, lean = hp.lean ?? 0, gloved = piece === 'hands';
  // ---- the legs: gray sweatpants, a wide stance, knees a little bent; white high-tops
  const hipY = -34 + drop;
  for (const [fx, s] of [[-9, -1], [11, 1]] as const) {
    const hip: [number, number] = [s * 5, hipY], foot: [number, number] = [fx, -5];
    const k = knee(hip[0], hip[1], foot[0], foot[1], 16, 15, 1);
    bone(g, hip, k, 13, SWEATS); bone(g, k, foot, 11, SWEATS);
    // (the high-top: white, a red swoosh-ish stripe, the laces)
    box(g, fx - 7, -9, 16, 9, INK); box(g, fx - 6, -8, 14, 7, SHOE[2]); box(g, fx - 6, -8, 14, 1, SHOE[3]); box(g, fx - 6, -2, 14, 2, SHOE[0]);
    box(g, fx - 3, -6, 8, 2, '#DC2626'); box(g, fx - 5, -8, 2, 3, SHOE[1]);
  }
  // ---- the body: a barrel chest, a bit of a gut; the cut-off tank top (arm holes cut to his hips), the belt
  const sx = 2 + lean, sy = -66 + drop, top = sy - 1;
  // (the torso's skin under the tank top's big arm holes)
  poly(g, [[-15 + lean * 0.4, hipY + 2], [17 + lean * 0.4, hipY + 2], [20 + lean, top + 4], [-14 + lean, top]], INK);
  poly(g, [[-14 + lean * 0.4, hipY + 1], [16 + lean * 0.4, hipY + 1], [19 + lean, top + 5], [-13 + lean, top + 1]], SKIN[2]);
  // (the tank top: front panel, scooped low at the neck, the gut pushing it out)
  poly(g, [[-9 + lean * 0.5, hipY + 1], [15 + lean * 0.4, hipY + 1], [19 + lean * 0.7, hipY - 14], [14 + lean, top + 4], [8 + lean, top + 10], [0 + lean, top + 9], [-6 + lean, top + 2]], INK);
  poly(g, [[-8 + lean * 0.5, hipY], [14 + lean * 0.4, hipY], [18 + lean * 0.7, hipY - 14], [13 + lean, top + 5], [8 + lean, top + 11], [0 + lean, top + 10], [-5 + lean, top + 3]], TANK[2]);
  poly(g, [[-8 + lean * 0.5, hipY], [-2 + lean * 0.5, hipY], [-1 + lean, top + 8], [-5 + lean, top + 3]], TANK[1]);
  poly(g, [[8 + lean * 0.5, hipY], [14 + lean * 0.4, hipY], [18 + lean * 0.7, hipY - 14], [15 + lean * 0.8, hipY - 12]], TANK[3]);
  // (IRON, cracked, across it; a sweat patch)
  for (const [i, x] of [0, 4, 8, 12].entries()) box(g, -2 + lean * 0.7 + x, hipY - 18, 3, 5, i % 2 ? TANK[4] : '#D8D8DE');
  box(g, 0 + lean * 0.7, hipY - 17, 10, 1, TANK[1]);
  ell(g, 6 + lean * 0.8, top + 16, 4, 3, TANK[1]);
  // (gray chest hair out of the scoop; the pecs' line)
  for (let i = 0; i < 5; i++) box(g, 1 + lean + i * 1.6, top + 6 + (i % 2), 1, 2, GRAY[2]);
  // (the lifting belt: wide, cracked leather, the big buckle)
  box(g, -15 + lean * 0.4, hipY - 4, 33, 9, INK); box(g, -14 + lean * 0.4, hipY - 3, 31, 7, BELT[2]); box(g, -14 + lean * 0.4, hipY - 3, 31, 1, BELT[4]); box(g, -14 + lean * 0.4, hipY + 3, 31, 1, BELT[0]);
  box(g, 10 + lean * 0.4, hipY - 4, 7, 9, INK); box(g, 11 + lean * 0.4, hipY - 3, 5, 7, '#C8C8D0'); box(g, 12 + lean * 0.4, hipY - 2, 3, 5, BELT[1]);
  for (let i = 0; i < 3; i++) box(g, -10 + lean * 0.4 + i * 6, hipY - 1, 1, 3, BELT[1]);
  // ---- an arm: a huge upper arm (the bicep's bulge), a thick forearm
  const arm = (h: [number, number], back: boolean) => {
    const s: [number, number] = [sx + (back ? -9 : 7), sy + 5], e = elbow(s[0], s[1], h[0], h[1], 15, 14, 1);
    const R = back ? SKIN.map((_c, i) => SKIN[Math.max(0, i - 1)]) : SKIN;
    bone(g, s, e, back ? 11 : 12, R); bone(g, e, h, back ? 9 : 10, R);
    // (the bicep: a bulge on the front of the upper arm)
    const mx = (s[0] + e[0]) / 2, my = (s[1] + e[1]) / 2;
    ell(g, mx + 1, my + 1, 6.5, 5, INK); ell(g, mx + 1, my + 1, 5.5, 4, R[2]); ell(g, mx, my, 3, 2, R[4]);
    if (gloved) glove(g, h[0], h[1], back ? 0.9 : 1, pose === 'offer' && !back);
    else fist(g, h[0], h[1]);
  };
  arm(hp.b, true);
  // ---- the traps and the neck: a slope from the shoulders straight up into the head
  const hx = 5 + lean * 1.2, hy = -78 + drop;
  poly(g, [[sx - 13, sy + 5], [sx + 15, sy + 6], [hx + 8, hy + 9], [hx - 7, hy + 9]], INK);
  poly(g, [[sx - 11, sy + 5], [sx + 13, sy + 6], [hx + 7, hy + 9], [hx - 6, hy + 9]], SKIN[2]);
  poly(g, [[sx - 6, sy + 4], [sx + 4, sy + 4], [hx + 2, hy + 9], [hx - 4, hy + 9]], SKIN[3]);
  // (the tank top's straps over them)
  box(g, sx - 6, sy - 1, 4, 7, INK); box(g, sx - 5, sy, 2, 6, TANK[2]);
  box(g, sx + 9, sy, 4, 7, INK); box(g, sx + 10, sy + 1, 2, 6, TANK[3]);
  // ---- the head: square, a gray buzz cut, the jaw; a cauliflower ear
  box(g, hx - 9, hy - 11, 19, 22, INK);
  box(g, hx - 8, hy - 10, 17, 20, SKIN[2]); box(g, hx - 6, hy - 8, 12, 14, SKIN[3]); box(g, hx - 5, hy - 7, 4, 4, SKIN[4]);
  // (the buzz cut: gray stubble over the top and the back, the hairline square)
  box(g, hx - 9, hy - 12, 19, 5, INK); box(g, hx - 8, hy - 11, 17, 4, GRAY[1]); for (let i = 0; i < 8; i++) box(g, hx - 7 + i * 2, hy - 11 + (i % 2), 1, 1, GRAY[3]);
  box(g, hx - 9, hy - 8, 4, 8, GRAY[1]);
  // (the ear, thick and lumpy)
  ell(g, hx - 6, hy, 3.4, 4, INK); ell(g, hx - 6, hy, 2.4, 3, SKIN[2]); box(g, hx - 7, hy - 1, 2, 2, SKIN[1]);
  const nuts = pose === 'nuts';
  // (the brow, heavy; the eyes narrowed; crossed when he's winded)
  box(g, hx + 1, hy - 5, 8, 2, GRAY[0]);
  if (nuts) { box(g, hx + 3, hy - 2, 1, 1, INK); box(g, hx + 5, hy - 2, 1, 1, INK); box(g, hx + 4, hy - 1, 1, 1, INK); box(g, hx + 3, hy, 1, 1, INK); box(g, hx + 5, hy, 1, 1, INK); }
  else { box(g, hx + 3, hy - 2, 5, 1, INK); box(g, hx + 4, hy - 1, 3, 1, SKIN[1]); }
  // (the nose: broken, a bump, bent)
  poly(g, [[hx + 8, hy - 3], [hx + 12, hy + 2], [hx + 9, hy + 3]], SKIN[2]); box(g, hx + 9, hy - 1, 2, 1, SKIN[4]); box(g, hx + 9, hy + 2, 1, 1, INK);
  // (the goatee, short and gray, round the mouth; the mouth a smirk with a toothpick, or an O, winded)
  box(g, hx + 3, hy + 4, 7, 7, GRAY[1]); box(g, hx + 4, hy + 5, 5, 5, GRAY[2]); box(g, hx + 5, hy + 9, 3, 2, GRAY[3]);
  if (nuts) ell(g, hx + 6, hy + 6, 1.6, 2, INK);
  else { box(g, hx + 4, hy + 6, 5, 1, INK); g.strokeStyle = '#E8D49A'; g.lineWidth = 1; g.beginPath(); g.moveTo(hx + 8, hy + 6); g.lineTo(hx + 13, hy + 4); g.stroke(); }
  // (stubble down the jaw and the neck)
  for (let i = 0; i < 6; i++) box(g, hx - 3 + i * 2, hy + 9 + (i % 2), 1, 1, SKIN[1]);
  // ---- the front arm
  arm(hp.f, false);
  if (pose === 'offer') shaker(g, hp.f[0] + 1, hp.f[1] - 6);
  if (pose === 'yank') shaker(g, hp.f[0], hp.f[1] - 6);
};

/** Him, feet at (x, y), facing `facing`. `frame`: the flurry's (0..2). `piece`: what he's still holding (null: given). */
export const drawBen = (c: Ctx, x: number, y: number, facing: 1 | -1, pose: BenPose, frame: number, piece: ArmorPiece | null) => {
  c.save();
  c.translate(Math.round(x), Math.round(y));
  if (facing < 0) c.scale(-1, 1);
  stamp(c, `ben2-${pose}-${pose === 'flurry' ? frame % 3 : 0}-${piece ?? 'none'}`, -30, -122, 76, 126, g => paintBen(g, pose, frame, piece));
  c.restore();
  // (winded: the stars going round)
  if (pose === 'nuts') {
    const t = performance.now() / 160;
    for (let i = 0; i < 3; i++) {
      const a = t + (i * Math.PI * 2) / 3, sx = x + facing * 6 + Math.cos(a) * 13, sy = y - 98 + Math.sin(a) * 3.5;
      c.fillStyle = INK; c.fillRect(Math.round(sx) - 2, Math.round(sy) - 2, 5, 5);
      c.fillStyle = '#FDE047'; c.fillRect(Math.round(sx) - 1, Math.round(sy) - 1, 3, 3);
    }
  }
};
/** Where his head is (for the words over it), feet at (x, y). */
export const benHeadY = (y: number) => y - 104;
