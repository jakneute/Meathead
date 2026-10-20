// The dino park's set dressing going back (the SNES pass): on the ground behind the play plane, each piece at its own
// depth (one eye: drawn d of the way from where he's looking, dimmer the further back, never anything to stand on), so
// no screen-width of the park is just a rail and the sky. In the raptor pen: its enrichment (a tire on a chain, a giant
// chewed rubber ball, bones), the keepers' hose reel and chum buckets. Out on the meadow, behind its rail: fake cycads
// (the price tags still on), a hay rack and a salt lick and a trough, the TRICERATOPS NEST exhibit (fiberglass eggs, one
// hatching a robot baby), a tour jeep stuck on its guide rail (TOUR SUSPENDED). Round the plaza: the DINO DOGS cart, the
// umbrella tables, the photo board (SMILE! YOU'RE LUNCH), a coin-op kiddie trike (OUT OF ORDER), the FOSSIL DIG pit. In
// the paddock: the feeding show's prop cow on its gantry (bitten), a tour jeep it's chewed. Past it: a pallet of spare
// parts (a dilophosaurus head, a raptor leg, the crate), a tour jeep on its side under the vines, more cycads.
//
// The still art's stamped once per piece; the baby's bob, the blinking lights and the swinging tire are live.

import type { GameState } from '../../../../m1/game/core/state';
import { GY } from '../../geometry';
import { type Ctx, type Eye, INK, box, mix, hash, checker, rampOf, stamp, steppedGlow, eyeOf, viewOf } from './kit';
import { D } from '../layout';
import { signAt, enamel, print, stencil, dino as dinoLook, carved } from '../../letters';

type T = (col: string) => string;
/** Further back: dimmer, toward the park's green haze (nothing back here reads as something to stand on). */
const tintFor = (d: number): T => { const k = Math.min(0.5, (1 - d) * 0.9); return col => mix(col, '#2E3E36', k); };
const rT = (col: string, t: T) => rampOf(col).map(t);

const fill = (g: Ctx, pts: number[], col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fill(); };
/** A filled shape, inked round. */
const inked = (g: Ctx, pts: number[], col: string, t: T) => {
  g.strokeStyle = t(INK); g.lineWidth = 2; g.lineJoin = 'round'; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.stroke();
  fill(g, pts, col);
};
const oval = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
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
/** A shadow pooled on the ground under a thing. */
const shadow = (g: Ctx, x: number, foot: number, w: number) => { oval(g, x, foot - 1, w / 2, 4, 'rgba(14, 18, 12, 0.35)'); };
/** A fern at a foot (fronds of stepped leaflets). */
const fern = (g: Ctx, x: number, foot: number, h: number, seed: number, t: T) => {
  const L = rT('#3E7A34', t);
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * 0.42 + (hash(seed + i) - 0.5) * 0.2, len = h * (0.7 + 0.3 * hash(seed * 2 + i));
    for (let s = 0; s < len; s += 3) {
      const k = s / len, px = x + Math.cos(a) * s, py = foot + Math.sin(a) * s + k * k * len * 0.5;
      box(g, px - 1, py, 3, 2, L[k < 0.5 ? 2 : 3]);
      const lw = Math.max(1, 5 * (1 - k)); box(g, px - lw - 1, py + 1, lw, 1, L[1]); box(g, px + 2, py + 1, lw, 1, L[4]);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The pieces (each in the walk plane, its foot at `foot`, its middle at x; every color through `t`)

/** Fake cycads: stout scaled trunks, crowns of stiff fronds; a price tag still zip-tied to one. */
const cycads = (g: Ctx, x: number, foot: number, t: T, seed: number) => {
  const B = rT('#6A5232', t), F = rT('#3E7034', t);
  shadow(g, x, foot, 150);
  const plant = (px: number, h: number, s: number) => {
    // (the trunk: diamond leaf-bases in rows, lit up its left)
    box(g, px - 9, foot - h - 1, 18, h + 1, t(INK));
    for (let y = foot - h; y < foot; y += 6) for (let k = 0; k < 4; k++) { const dx = px - 8 + k * 4 + ((y / 6) % 2 ? 2 : 0); box(g, dx, y, 4, 5, B[k === 0 ? 4 : k === 1 ? 3 : k === 2 ? 2 : 1]); box(g, dx, y + 4, 4, 1, B[0]); }
    // (the crown: fronds out and down, leaflets either side)
    const top = foot - h;
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI + 0.15 + (i / 8) * (Math.PI - 0.3), len = 34 + hash(s + i) * 16;
      for (let q = 0; q < len; q += 2) {
        const k = q / len, fx = px + Math.cos(a) * q, fy = top + Math.sin(a) * q * 0.7 + k * k * 22;
        box(g, fx, fy, 2, 2, F[1]);
        if (q % 4 === 0) { const lw = Math.round(6 * (1 - k * 0.6)); box(g, fx - 1, fy - lw + 1, 2, lw, F[Math.cos(a) < 0 ? 4 : 3]); box(g, fx + 1, fy + 2, 2, lw - 1, F[2]); }
      }
    }
    box(g, px - 4, top - 4, 8, 6, F[0]);
  };
  plant(x - 44, 34, seed); plant(x + 40, 26, seed + 5); plant(x - 2, 46, seed + 9);
  // (the price tag, still on)
  box(g, x - 2 + 8, foot - 30, 1, 6, t('#E8E4DA')); box(g, x + 4, foot - 24, 10, 7, t(INK)); box(g, x + 5, foot - 23, 8, 5, t('#F4F0E6')); box(g, x + 6, foot - 21, 6, 1, t('#B91C1C'));
  fern(g, x - 70, foot, 20, seed, t); fern(g, x + 70, foot, 18, seed + 3, t);
};

/** The meadow's feeding station: a hay rack on its A-frame (the hay bulging through its slats), a salt lick on a post,
 *  a steel trough, a plank sign. */
const feeder = (g: Ctx, x: number, foot: number, t: T) => {
  const W = rT('#7A5634', t), H = rT('#C8A24A', t), S = rT('#8A929C', t);
  shadow(g, x, foot, 200);
  // (the rack: legs splayed, slats across, hay in it)
  const l = x - 70;
  for (const lx of [l, l + 90]) { inked(g, [lx, foot, lx + 8, foot, lx + 22, foot - 70, lx + 16, foot - 70], W[2], t); fill(g, [lx + 1, foot, lx + 3, foot, lx + 17, foot - 69, lx + 16, foot - 69], W[4]); }
  inked(g, [l + 8, foot - 76, l + 104, foot - 76, l + 112, foot - 70, l + 2, foot - 70], W[1], t);
  // (the hay: a stepped mound, strands sticking out, through the slats)
  oval(g, x - 14, foot - 60, 56, 20, H[1]); oval(g, x - 18, foot - 64, 50, 16, H[2]); oval(g, x - 26, foot - 70, 30, 9, H[3]);
  for (let i = 0; i < 26; i++) { const sx = l + 10 + hash(i * 1.7) * 92, sy = foot - 74 + hash(i * 2.3) * 26; box(g, sx, sy, 1, 4 + hash(i) * 6, H[hash(i * 3.1) > 0.5 ? 4 : 0]); }
  for (let k = 0; k < 7; k++) { const sx = l + 14 + k * 13; box(g, sx, foot - 70, 3, 26, t(INK)); box(g, sx + 1, foot - 70, 1, 26, W[3]); }
  box(g, l + 6, foot - 46, 100, 4, W[1]); box(g, l + 6, foot - 46, 100, 1, W[3]);
  // (hay fallen under it)
  for (let i = 0; i < 18; i++) box(g, l + 4 + hash(i * 4.1) * 104, foot - 3 - hash(i) * 3, 3 + hash(i * 2) * 5, 1, H[hash(i * 7) > 0.5 ? 3 : 1]);
  // (the salt lick, pink, licked into a dip, on its post)
  const sx = x + 66;
  box(g, sx - 2, foot - 40, 5, 40, t(INK)); box(g, sx - 1, foot - 40, 3, 40, W[2]);
  crate(g, sx - 10, foot - 54, 20, 14, rT('#D8A8A0', t), t); box(g, sx - 4, foot - 54, 8, 3, t(mix('#D8A8A0', INK, 0.25)));
  // (the trough: a steel tub, water in it)
  const tx = x + 110;
  inked(g, [tx - 30, foot - 22, tx + 30, foot - 22, tx + 26, foot, tx - 26, foot], S[2], t);
  box(g, tx - 30, foot - 22, 60, 2, S[4]); box(g, tx - 26, foot - 4, 52, 3, S[1]);
  box(g, tx - 27, foot - 20, 54, 3, t('#5A86A6')); box(g, tx - 20, foot - 20, 12, 1, t('#C8E4F4'));
  for (let k = tx - 24; k < tx + 26; k += 12) box(g, k, foot - 17, 1, 14, S[1]);
  // (the sign, a plank on a stake)
  box(g, x - 102, foot - 44, 3, 44, W[1]);
  crate(g, x - 136, foot - 58, 70, 16, W, t);
  signAt(g, 'TRIKE CHOW', x - 101, foot - 50, 5, carved(5, t('#2A1A0C'), t('#E8C890')));
  fern(g, l - 10, foot, 18, 4, t);
};

/** The TRICERATOPS NEST exhibit: a mound in a ring of straw, four fiberglass eggs (one cracked, a robot baby looking out
 *  of it: its bob is live), rope on posts round it, the plaque. */
const nest = (g: Ctx, x: number, foot: number, t: T) => {
  const E = rT('#7A5634', t), ST = rT('#C8A24A', t), EG = rT('#E4D8BC', t);
  shadow(g, x, foot, 220);
  // (the mound, banded, the straw round its rim)
  oval(g, x, foot - 4, 96, 22, E[0]); oval(g, x, foot - 6, 92, 20, E[1]); oval(g, x - 6, foot - 12, 80, 14, E[2]); oval(g, x - 14, foot - 16, 54, 8, E[3]);
  for (let i = 0; i < 46; i++) { const a = (i / 46) * Math.PI * 2, px = x + Math.cos(a) * 62, py = foot - 16 + Math.sin(a) * 10; box(g, px - 3, py - 1, 7, 1, ST[i % 3 === 0 ? 4 : 2]); box(g, px, py - 3, 1, 4, ST[1]); }
  // (the eggs: standing up in it, speckled, lit up their left; the seam round each (molded in halves))
  const egg = (ex: number, ey: number, s: number) => {
    oval(g, ex, ey, 11 * s + 1, 16 * s + 1, t(INK));
    oval(g, ex, ey, 11 * s, 16 * s, EG[2]); oval(g, ex - 2 * s, ey - 2 * s, 8 * s, 12 * s, EG[3]); oval(g, ex - 4 * s, ey - 6 * s, 3 * s, 5 * s, EG[4]);
    oval(g, ex + 4 * s, ey + 6 * s, 6 * s, 8 * s, EG[1]);
    for (let k = 0; k < 6; k++) box(g, ex - 7 * s + hash(ex + k) * 12 * s, ey - 10 * s + hash(ex * 2 + k) * 18 * s, 2, 2, t('#8A6A44'));
    box(g, ex - 11 * s, ey, 22 * s, 1, EG[1]);
  };
  egg(x - 44, foot - 30, 1); egg(x - 16, foot - 34, 1.1); egg(x + 46, foot - 28, 0.95);
  // (the cracked one: its top half off, lying by it; the baby's in it (live))
  const cx = x + 16;
  oval(g, cx, foot - 28, 13, 15, t(INK)); oval(g, cx, foot - 28, 12, 14, EG[2]); oval(g, cx - 3, foot - 30, 7, 9, EG[3]);
  // (its broken rim, jagged)
  box(g, cx - 12, foot - 33, 24, 3, t('#2A1E14'));
  for (let k = 0; k < 6; k++) fill(g, [cx - 12 + k * 4, foot - 33, cx - 10 + k * 4, foot - 36 - (k % 2) * 2, cx - 8 + k * 4, foot - 33], EG[3]);
  oval(g, cx + 30, foot - 14, 9, 5, t(INK)); oval(g, cx + 30, foot - 15, 8, 4, EG[3]);
  // (the rope on its posts round the front, sagging)
  const W = rT('#6A4A2A', t);
  for (const px of [x - 100, x - 34, x + 34, x + 100]) { box(g, px - 3, foot - 30, 6, 30, t(INK)); box(g, px - 2, foot - 30, 4, 30, W[2]); box(g, px - 2, foot - 30, 1, 30, W[4]); box(g, px - 4, foot - 33, 8, 4, W[3]); }
  g.strokeStyle = t('#C8A86A'); g.lineWidth = 2;
  for (const [a, b] of [[x - 100, x - 34], [x - 34, x + 34], [x + 34, x + 100]]) { g.beginPath(); g.moveTo(a, foot - 26); g.quadraticCurveTo((a + b) / 2, foot - 14, b, foot - 26); g.stroke(); }
  // (the plaque on its stand)
  const px = x + 132;
  box(g, px - 2, foot - 30, 4, 30, t('#3A3A3A'));
  crate(g, px - 58, foot - 52, 116, 24, rT('#2E5A3A', t), t);
  signAt(g, 'TRICERATOPS NEST', px, foot - 44, 5, enamel(5, t('#F2E8C8'), t('#122A18')));
  signAt(g, '(EGGS: FIBERGLASS)', px, foot - 36, 4, print(4, t('#C8D8B8')));
};
/** The baby, looking out of its egg (live: bobbing, its eye lamp). */
const nestLive = (c: Ctx, x: number, foot: number, f: number, t: T, hostile: boolean) => {
  const cx = x + 16, b = Math.round(Math.sin(f * 0.09) * 2), H = rT('#86725A', t);
  const hy = foot - 40 + b;
  // (its little frill, its head, the beak, a servo at the neck)
  oval(c, cx - 4, hy - 4, 9, 8, t(INK)); oval(c, cx - 4, hy - 4, 8, 7, t('#A04A1C')); oval(c, cx - 6, hy - 6, 4, 3, t('#CA7232'));
  oval(c, cx + 2, hy, 8, 6, t(INK)); oval(c, cx + 2, hy, 7, 5, H[2]); oval(c, cx, hy - 2, 4, 2, H[3]);
  box(c, cx + 8, hy - 1, 4, 4, t('#3C363A'));
  box(c, cx + 4, hy - 8, 2, 4, t('#E2D8C0'));
  box(c, cx + 2, hy - 2, 2, 2, hostile ? '#FF3B30' : '#60A5FA');
  box(c, cx - 2, hy + 5, 4, 4, t('#545C68')); box(c, cx - 1, hy + 6, 1, 1, t('#C2CAD4'));
};

/** A tour jeep: two-tone, a roll bar, the spare on the back, the park's dino in a circle on the door, big tires.
 *  `stuck`: on its guide rail in the ground, a tire flat, TOUR SUSPENDED hung on it. `chewed`: bitten, its roll bar
 *  bent. `wreck`: on its side under the vines. */
const jeep = (g: Ctx, x: number, foot: number, t: T, kind: 'stuck' | 'chewed' | 'wreck') => {
  const B = rT('#C8642A', t), K = rT('#D8C08A', t), TY = rT('#2A2A2E', t), M = rT('#8A929C', t);
  shadow(g, x, foot, 190);
  g.save();
  // (flipped onto its roof, the roll bar crushed under it, its wheels in the air)
  if (kind === 'wreck') { g.translate(x, foot - 42); g.rotate(Math.PI + 0.05); g.translate(-x, -(foot - 42)); }
  if (kind === 'stuck') { g.translate(x, foot); g.rotate(0.04); g.translate(-x, -foot); }
  const l = x - 80, top = foot - 62;
  // (the roll bar: a hoop over the back seats; bent, chewed)
  g.strokeStyle = t(INK); g.lineWidth = 6; g.beginPath(); g.moveTo(l + 50, top + 16); g.lineTo(l + 54, top - 22);
  if (kind === 'chewed') g.quadraticCurveTo(l + 80, top - 4, l + 104, top - 30); else g.lineTo(l + 104, top - 22);
  g.lineTo(l + 108, top + 16); g.stroke();
  g.strokeStyle = M[2]; g.lineWidth = 3; g.stroke();
  g.strokeStyle = M[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(l + 54, top - 22); g.lineTo(l + 50, top + 14); g.stroke();
  // (the body: the khaki top half, the orange skirt, the hood sloping down to the grille)
  inked(g, [l, top + 14, l + 120, top + 14, l + 132, top + 22, l + 160, top + 26, l + 162, top + 48, l, top + 48], B[2], t);
  fill(g, [l + 2, top + 16, l + 120, top + 16, l + 132, top + 24, l + 158, top + 28, l + 158, top + 32, l + 2, top + 32], K[2]);
  box(g, l + 2, top + 16, 116, 2, K[4]); box(g, l + 2, top + 30, 156, 2, K[1]);
  box(g, l + 2, top + 40, 158, 6, B[1]); box(g, l + 2, top + 32, 158, 1, B[4]);
  // (the windshield, its frame; the seats; the grille, the lamps)
  fill(g, [l + 118, top + 14, l + 122, top - 8, l + 126, top - 8, l + 124, top + 14], t(INK)); box(g, l + 112, top - 6, 12, 20, 'rgba(150, 190, 210, 0.35)'); box(g, l + 114, top - 4, 2, 14, 'rgba(230, 245, 255, 0.4)');
  for (const sx of [l + 22, l + 72]) { crate(g, sx, top - 2, 20, 16, rT('#5A3A22', t), t); }
  box(g, l + 156, top + 28, 5, 16, M[1]); for (let k = 0; k < 4; k++) box(g, l + 157, top + 30 + k * 4, 3, 2, M[3]);
  box(g, l + 150, top + 26, 6, 5, t(INK)); box(g, l + 151, top + 27, 4, 3, t('#FFF2B0'));
  // (the door: the park's dino in its circle)
  oval(g, l + 60, top + 30, 11, 11, t(INK)); oval(g, l + 60, top + 30, 10, 10, t('#E8E0C8')); oval(g, l + 60, top + 30, 8, 8, t('#B91C1C'));
  fill(g, [l + 54, top + 34, l + 58, top + 26, l + 64, top + 24, l + 67, top + 27, l + 63, top + 29, l + 62, top + 35], t(INK));
  box(g, l + 92, top + 20, 1, 26, B[0]); box(g, l + 34, top + 20, 1, 26, B[0]);
  // (the spare on the back)
  oval(g, l - 4, top + 26, 9, 14, t(INK)); oval(g, l - 4, top + 26, 7, 12, TY[2]); oval(g, l - 4, top + 26, 3, 6, M[2]);
  // (the wheels: tread blocks, the hubs; the flat one squashed)
  for (const [wx, flat] of [[l + 30, kind === 'stuck'], [l + 128, false]] as [number, boolean][]) {
    const ry = flat ? 11 : 15, wy = foot - ry;
    oval(g, wx, wy, 16, ry + 1, t(INK)); oval(g, wx, wy, 15, ry, TY[1]); oval(g, wx - 2, wy - 2, 11, ry - 4, TY[2]);
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; box(g, wx + Math.cos(a) * 13 - 1, wy + Math.sin(a) * (ry - 2) - 1, 3, 3, TY[0]); }
    oval(g, wx, wy, 6, Math.min(6, ry - 6), M[2]); box(g, wx - 2, wy - 2, 2, 2, M[4]);
  }
  if (kind === 'chewed') {
    // (bites out of it: the steel inside, tooth notches round each)
    for (const [bx, by, r] of [[l + 84, top + 16, 16], [l + 140, top + 26, 11]] as const) {
      g.fillStyle = t(INK); g.beginPath(); g.arc(bx, by, r + 1, 0, Math.PI); g.fill();
      g.fillStyle = t('#2A2A2E'); g.beginPath(); g.arc(bx, by, r, 0, Math.PI); g.fill();
      for (let k = 0; k < 6; k++) { const a = (k / 5) * Math.PI; fill(g, [bx + Math.cos(a) * r - 2, by + Math.sin(a) * r, bx + Math.cos(a) * (r - 4), by + Math.sin(a) * (r - 4), bx + Math.cos(a) * r + 2, by + Math.sin(a) * r], B[2]); }
    }
  }
  g.restore();
  if (kind === 'stuck') {
    // (the guide rail it ran on, set in the ground; TOUR SUSPENDED hung off the roll bar)
    box(g, x - 140, foot - 3, 280, 3, t(INK)); box(g, x - 140, foot - 3, 280, 1, M[4]);
    for (let k = x - 136; k < x + 140; k += 18) box(g, k, foot - 1, 8, 2, t('#4A3622'));
    box(g, x - 12, foot - 84, 1, 10, t('#3A3A3A')); box(g, x + 34, foot - 84, 1, 10, t('#3A3A3A'));
    crate(g, x - 22, foot - 76, 66, 18, rT('#F2D024', t), t);
    signAt(g, 'TOUR', x + 11, foot - 70, 4, enamel(4, t('#1A0B06'))); signAt(g, 'SUSPENDED', x + 11, foot - 63, 4, enamel(4, t('#B91C1C')));
  }
  if (kind === 'wreck') {
    // (vines grown over it, ferns round it)
    const V = rT('#3E6A30', t);
    for (let i = 0; i < 7; i++) { const vx = x - 60 + i * 20; for (let y = foot - 150 + hash(i) * 20; y < foot; y += 3) box(g, vx + Math.round(Math.sin(y * 0.15 + i) * 3), y, 2, 3, V[(y >> 2) % 3 + 1]); }
    fern(g, x - 70, foot, 26, 7, t); fern(g, x + 60, foot, 22, 9, t);
  }
};

/** The DINO DOGS cart: a box on two wheels, the striped umbrella, a giant hot dog up top, the menu, CLOSED. */
const cart = (g: Ctx, x: number, foot: number, t: T) => {
  const R = rT('#C81E1E', t), W = rT('#F1EFEA', t), M = rT('#8A929C', t), Y = rT('#E8B400', t);
  shadow(g, x, foot, 130);
  const l = x - 46, top = foot - 64;
  // (the umbrella: a pole, the canopy in red and white panels, scalloped)
  box(g, x - 1, top - 70, 3, 70, M[1]);
  for (let k = 0; k < 8; k++) { const a = x - 64 + k * 16; fill(g, [a, top - 50, a + 16, top - 50, x + (k - 3.5) * 1.5 + 0.75, top - 84], k % 2 ? W[k < 4 ? 3 : 2] : R[k < 4 ? 3 : 2]); }
  for (let k = 0; k < 8; k++) { g.fillStyle = k % 2 ? W[2] : R[2]; g.beginPath(); g.arc(x - 56 + k * 16, top - 50, 8, 0, Math.PI); g.fill(); }
  g.strokeStyle = t(INK); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 64, top - 50); g.lineTo(x, top - 84); g.lineTo(x + 64, top - 50); g.stroke();
  box(g, x - 2, top - 88, 4, 5, M[3]);
  // (the box: steel, a red band, the menu; the counter)
  crate(g, l, top, 92, 50, M, t);
  box(g, l, top + 6, 92, 12, R[2]); box(g, l, top + 6, 92, 2, R[4]); box(g, l, top + 16, 92, 2, R[0]);
  signAt(g, 'DINO DOGS', x, top + 15, 6, dinoLook(6, ['#FFF2B0', '#FFD23A', '#F2A41E', '#C8641A'].map(t), t('#3A1A0A'), t('#3A1A0A')));
  crate(g, l + 4, top + 22, 84, 22, rT('#2A2A2E', t), t);
  signAt(g, 'BRONTO DOG $9', x, top + 29, 4, print(4, t('#F8FAFC'))); signAt(g, 'T-REX DOG $12', x, top + 38, 4, print(4, t('#FDE047')));
  // (CLOSED, hung on strings off the umbrella's rim; the bottles; the hot dog up on top)
  box(g, x + 4, top - 47, 1, 12, t('#3A3A3A')); box(g, x + 46, top - 47, 1, 12, t('#3A3A3A'));
  box(g, x + 2, top - 36, 48, 13, t(INK)); box(g, x + 3, top - 35, 46, 11, W[3]); box(g, x + 3, top - 35, 46, 1, W[4]); signAt(g, 'CLOSED', x + 26, top - 30, 4, enamel(4, R[1]));
  box(g, l + 66, top - 10, 6, 10, t(INK)); box(g, l + 67, top - 9, 4, 9, R[2]); box(g, l + 76, top - 10, 6, 10, t(INK)); box(g, l + 77, top - 9, 4, 9, Y[2]);
  oval(g, x - 18, top - 6, 26, 7, t(INK)); oval(g, x - 18, top - 6, 25, 6, rT('#E0A860', t)[2]); oval(g, x - 18, top - 9, 20, 3, rT('#E0A860', t)[3]);
  oval(g, x - 18, top - 9, 22, 3, rT('#B8462A', t)[2]); for (let k = 0; k < 5; k++) box(g, x - 34 + k * 8, top - 12 + (k % 2) * 2, 5, 1, Y[3]);
  // (its wheels, the handle)
  for (const wx of [l + 14, l + 78]) { oval(g, wx, foot - 9, 10, 10, t(INK)); oval(g, wx, foot - 9, 9, 9, M[1]); oval(g, wx, foot - 9, 4, 4, M[3]); }
  box(g, l - 14, top + 30, 14, 3, M[2]);
};

/** The plaza's tables: two rounds under green-and-white umbrellas, their chairs, a tray left with a soda. */
const tables = (g: Ctx, x: number, foot: number, t: T) => {
  const G = rT('#2E7A3A', t), W = rT('#F1EFEA', t), M = rT('#5A626C', t);
  for (const [tx, s] of [[x - 56, 0], [x + 60, 1]] as const) {
    shadow(g, tx, foot, 90);
    // (the umbrella)
    box(g, tx - 1, foot - 104, 3, 104, M[2]);
    for (let k = 0; k < 6; k++) { const a = tx - 48 + k * 16; fill(g, [a, foot - 82, a + 16, foot - 82, tx + (k - 2.5) * 2, foot - 108], k % 2 ? W[k < 3 ? 3 : 2] : G[k < 3 ? 3 : 2]); }
    box(g, tx - 48, foot - 82, 96, 3, G[1]); for (let k = 0; k < 12; k++) box(g, tx - 48 + k * 8, foot - 79, 4, 3, k % 2 ? W[1] : G[1]);
    // (the table: its top lit, the pedestal)
    box(g, tx - 30, foot - 42, 60, 6, t(INK)); box(g, tx - 29, foot - 41, 58, 4, M[3]); box(g, tx - 29, foot - 41, 58, 1, M[4]);
    box(g, tx - 3, foot - 36, 6, 34, M[1]); box(g, tx - 14, foot - 3, 28, 3, M[1]);
    // (the chairs either side, wire-backed)
    for (const cs of [-1, 1]) {
      const cx = tx + cs * 40;
      box(g, cx - 10, foot - 26, 20, 4, M[2]); box(g, cx - 10, foot - 26, 20, 1, M[4]);
      box(g, cx - 9, foot - 22, 2, 22, M[1]); box(g, cx + 7, foot - 22, 2, 22, M[1]);
      box(g, cx + cs * 8 - 1, foot - 50, 3, 26, M[1]); for (let y = foot - 48; y < foot - 28; y += 5) box(g, cx + cs * 8 - (cs < 0 ? 0 : 6), y, 7, 1, M[2]);
    }
    if (s === 0) { crate(g, tx - 12, foot - 46, 22, 4, rT('#B91C1C', t), t); box(g, tx - 4, foot - 56, 7, 10, t(INK)); box(g, tx - 3, foot - 55, 5, 9, W[3]); box(g, tx - 3, foot - 52, 5, 2, t('#B91C1C')); box(g, tx, foot - 62, 1, 7, t('#F8FAFC')); }
    else { oval(g, tx + 8, foot - 44, 8, 2, t('#E8D49A')); for (let k = 0; k < 5; k++) box(g, tx + 2 + k * 3, foot - 46, 2, 2, t('#FEF3C7')); }
  }
};

/** The photo board: a cartoon raptor painted on plywood, a hole where its face goes, SMILE! YOU'RE LUNCH. */
const cutout = (g: Ctx, x: number, foot: number, t: T) => {
  const P = rT('#6ABA4A', t), W = rT('#A8845A', t);
  shadow(g, x, foot, 120);
  // (the braces behind, the plywood's edge)
  for (const bx of [x - 40, x + 36]) { box(g, bx, foot - 70, 4, 70, W[1]); fill(g, [bx + 4, foot - 60, bx + 22, foot, bx + 18, foot, bx + 2, foot - 54], W[0]); }
  const top = foot - 132;
  crate(g, x - 56, top, 112, 112, rT('#9AD0E8', t), t);
  // (the scene: a sky, a hill, the raptor standing in it, grinning, a guest's face to go where its own is)
  box(g, x - 55, top + 70, 110, 41, t('#5E9636')); box(g, x - 55, top + 70, 110, 2, t('#7EB246'));
  inked(g, [x - 26, top + 108, x - 18, top + 70, x - 30, top + 56, x - 40, top + 40, x - 20, top + 46, x - 4, top + 52, x + 6, top + 34, x + 30, top + 28, x + 40, top + 36, x + 34, top + 50, x + 12, top + 58, x + 16, top + 80, x + 6, top + 108, x - 2, top + 108, x, top + 80, x - 8, top + 108], P[2], t);
  fill(g, [x - 18, top + 70, x - 4, top + 52, x + 6, top + 36, x + 10, top + 40, x - 2, top + 60, x - 12, top + 76], P[3]);
  fill(g, [x + 10, top + 58, x + 34, top + 50, x + 36, top + 54, x + 14, top + 62], t('#F8FAFC'));
  for (let k = 0; k < 4; k++) fill(g, [x + 14 + k * 5, top + 58, x + 16 + k * 5, top + 62, x + 18 + k * 5, top + 58], t(INK));
  // (the face hole)
  oval(g, x + 22, top + 40, 11, 10, t(INK)); oval(g, x + 22, top + 40, 10, 9, t('#1A1410'));
  oval(g, x + 23, top + 43, 6, 4, t('#2A2018'));
  signAt(g, 'SMILE!', x, top + 12, 7, dinoLook(7, ['#FFF2B0', '#FFD23A', '#F2A41E', '#C8641A'].map(t), t('#3A1A0A'), t('#3A1A0A')));
  signAt(g, "YOU'RE LUNCH", x, top + 22, 5, enamel(5, t('#B91C1C'), t('#F8FAFC')));
};

/** A coin-op kiddie ride: a little purple trike on its rocking plinth, the coin box, 25¢; a bag over the slot. */
const kiddie = (g: Ctx, x: number, foot: number, t: T) => {
  const P = rT('#8A4ACA', t), Y = rT('#F2C23A', t), M = rT('#8A929C', t), Bn = rT('#F4EED8', t);
  shadow(g, x, foot, 100);
  // (the plinth: a round base, stepped, its lights round the rim)
  oval(g, x, foot - 8, 46, 10, t(INK)); oval(g, x, foot - 9, 45, 9, Y[1]); oval(g, x - 4, foot - 12, 38, 6, Y[2]); box(g, x - 45, foot - 9, 90, 2, Y[3]);
  for (let k = 0; k < 9; k++) box(g, x - 38 + k * 9, foot - 7, 3, 2, t('#FFF2B0'));
  // (the trike: a fat barrel, a frill with a saddle on its back, chunky legs, a cartoon grin)
  const by = foot - 40;
  for (const lx of [x - 24, x - 10, x + 8, x + 22]) { box(g, lx - 1, by + 10, 10, 20, t(INK)); box(g, lx, by + 10, 8, 19, P[lx < x ? 1 : 2]); }
  oval(g, x, by + 6, 34, 15, t(INK)); oval(g, x, by + 6, 33, 14, P[2]); oval(g, x - 6, by + 2, 24, 8, P[3]); oval(g, x - 10, by - 1, 10, 3, P[4]);
  oval(g, x + 34, by - 2, 12, 18, t(INK)); oval(g, x + 34, by - 2, 11, 17, rT('#E86AA0', t)[2]);
  oval(g, x + 40, by + 4, 12, 9, t(INK)); oval(g, x + 40, by + 4, 11, 8, P[3]);
  fill(g, [x + 38, by - 2, x + 50, by - 18, x + 46, by - 2], Bn[2]); fill(g, [x + 44, by + 2, x + 58, by - 8, x + 52, by + 4], Bn[3]);
  box(g, x + 42, by, 3, 3, t(INK)); box(g, x + 46, by + 8, 7, 1, t(INK));
  // (the saddle, the handles)
  oval(g, x - 4, by - 8, 13, 4, t(INK)); oval(g, x - 4, by - 9, 12, 3, t('#7A1E1E'));
  box(g, x + 14, by - 14, 2, 8, M[2]); box(g, x + 10, by - 14, 10, 2, M[3]);
  // (the coin box on its post, 25¢, the bag over the slot)
  box(g, x - 58, foot - 44, 4, 44, M[1]);
  crate(g, x - 78, foot - 74, 44, 30, M, t);
  signAt(g, '25¢', x - 56, foot - 67, 4, print(4, t('#B91C1C')));
  fill(g, [x - 77, foot - 62, x - 35, foot - 62, x - 36, foot - 44, x - 76, foot - 44], t(INK)); fill(g, [x - 76, foot - 61, x - 36, foot - 61, x - 37, foot - 45, x - 75, foot - 45], t('#C8B88A'));
  box(g, x - 76, foot - 61, 40, 2, t('#E0D0A0'));
  signAt(g, 'OUT OF', x - 56, foot - 56, 4, print(4, t('#1A0B06'))); signAt(g, 'ORDER', x - 56, foot - 49, 4, print(4, t('#1A0B06')));
};

/** The FOSSIL DIG: a sandbox in a log frame, a plastic skeleton half-dug out of it, spades and a pail, the sign. */
const dig = (g: Ctx, x: number, foot: number, t: T) => {
  const W = rT('#7A5634', t), S = rT('#D8C08A', t), Bn = rT('#ECE4CC', t);
  shadow(g, x, foot, 200);
  // (the frame: logs, end grain showing, the sand heaped in it)
  crate(g, x - 96, foot - 18, 192, 18, W, t);
  for (const ex of [x - 96, x + 88]) { oval(g, ex + 4, foot - 9, 6, 9, t(INK)); oval(g, ex + 4, foot - 9, 5, 8, W[3]); oval(g, ex + 4, foot - 9, 2, 3, W[1]); }
  fill(g, [x - 92, foot - 18, x - 60, foot - 28, x + 10, foot - 32, x + 70, foot - 26, x + 92, foot - 18], S[2]);
  fill(g, [x - 70, foot - 22, x - 40, foot - 28, x + 10, foot - 30, x - 10, foot - 22], S[3]);
  for (let i = 0; i < 20; i++) box(g, x - 80 + hash(i * 3.3) * 160, foot - 26 + hash(i) * 8, 2, 1, S[hash(i * 5) > 0.5 ? 4 : 1]);
  // (the skeleton: a skull and a run of vertebrae, ribs curving up out of the sand)
  fill(g, [x - 70, foot - 30, x - 56, foot - 40, x - 36, foot - 38, x - 30, foot - 30], t(INK)); fill(g, [x - 68, foot - 31, x - 56, foot - 38, x - 37, foot - 37, x - 32, foot - 31], Bn[2]);
  box(g, x - 52, foot - 36, 4, 3, t(INK)); for (let k = 0; k < 4; k++) box(g, x - 64 + k * 6, foot - 31, 2, 3, Bn[4]);
  for (let k = 0; k < 9; k++) { box(g, x - 28 + k * 9, foot - 34 + (k % 2), 7, 5, t(INK)); box(g, x - 27 + k * 9, foot - 33 + (k % 2), 5, 3, Bn[k % 2 ? 2 : 3]); }
  g.lineWidth = 3; for (let k = 0; k < 5; k++) { g.strokeStyle = t(INK); g.beginPath(); g.arc(x - 8 + k * 11, foot - 26, 12, Math.PI * 1.05, Math.PI * 1.6); g.stroke(); g.strokeStyle = Bn[3]; g.lineWidth = 1.5; g.stroke(); g.lineWidth = 3; }
  // (spades, a pail)
  box(g, x + 50, foot - 46, 2, 18, t('#E8C040')); fill(g, [x + 46, foot - 30, x + 56, foot - 30, x + 54, foot - 22, x + 48, foot - 22], t('#2563EB'));
  fill(g, [x + 64, foot - 34, x + 78, foot - 34, x + 76, foot - 20, x + 66, foot - 20], t(INK)); fill(g, [x + 65, foot - 33, x + 77, foot - 33, x + 75, foot - 21, x + 67, foot - 21], t('#DC2626')); box(g, x + 65, foot - 33, 12, 2, t('#F87171'));
  // (the sign on its stakes)
  for (const sx of [x - 132, x - 96]) box(g, sx, foot - 50, 3, 50, W[1]);
  crate(g, x - 148, foot - 70, 72, 24, W, t);
  signAt(g, 'FOSSIL DIG', x - 112, foot - 62, 5, carved(5, t('#2A1A0C'), t('#E8C890')));
  signAt(g, 'AGES 3-8', x - 112, foot - 53, 4, print(4, t('#2A1A0C')));
};

/** The pen's enrichment: a tire on a chain off a post, a giant red rubber ball chewed, bones about. */
const toys = (g: Ctx, x: number, foot: number, t: T) => {
  const M = rT('#5A626C', t), R = rT('#C81E1E', t), Bn = rT('#E8E0CC', t);
  shadow(g, x, foot, 200);
  // (the post and its arm, the chain; the tire's live)
  box(g, x - 66, foot - 130, 8, 130, t(INK)); box(g, x - 65, foot - 130, 6, 130, M[2]); box(g, x - 65, foot - 130, 2, 130, M[4]);
  box(g, x - 66, foot - 132, 58, 6, t(INK)); box(g, x - 65, foot - 131, 56, 4, M[3]);
  // (the ball: big, red, lit up its left, bites out of it)
  const bx = x + 40, by = foot - 30;
  oval(g, bx, by, 31, 31, t(INK)); oval(g, bx, by, 30, 30, R[2]); oval(g, bx - 6, by - 6, 20, 20, R[3]); oval(g, bx - 12, by - 12, 6, 6, R[4]);
  oval(g, bx + 8, by + 10, 18, 14, R[1]);
  for (const [cx, cy] of [[bx + 22, by - 12], [bx - 4, by + 24]]) { oval(g, cx, cy, 8, 6, t(INK)); for (let k = 0; k < 4; k++) box(g, cx - 6 + k * 4, cy - 4, 2, 3, R[2]); }
  // (bones: plastic, a pile)
  for (const [ox, oy, a] of [[x - 30, foot - 6, 0.2], [x - 14, foot - 4, -0.4], [x + 80, foot - 5, 0.1]] as const) {
    g.save(); g.translate(ox, oy); g.rotate(a);
    box(g, -12, -2, 24, 4, t(INK)); box(g, -11, -1, 22, 2, Bn[3]);
    for (const e of [-13, 11]) { oval(g, e + 1, -3, 3, 3, t(INK)); oval(g, e + 1, 2, 3, 3, t(INK)); oval(g, e + 1, -3, 2, 2, Bn[4]); oval(g, e + 1, 2, 2, 2, Bn[2]); }
    g.restore();
  }
};
const toysLive = (c: Ctx, x: number, foot: number, f: number, t: T) => {
  const sw = Math.sin(f * 0.03) * 0.18, px = x - 30, py = foot - 128, L = 62;
  const ex = px + Math.sin(sw) * L, ey = py + Math.cos(sw) * L;
  c.strokeStyle = t('#8A929C'); c.lineWidth = 2; c.beginPath(); c.moveTo(px, py); c.lineTo(ex, ey); c.stroke();
  for (let k = 1; k < 8; k++) box(c, px + (ex - px) * k / 8 - 1, py + (ey - py) * k / 8 - 1, 3, 3, t('#5A626C'));
  c.save(); c.translate(ex, ey + 14); c.rotate(-sw);
  oval(c, 0, 0, 10, 16, t(INK)); oval(c, 0, 0, 9, 15, t('#2A2A2E')); oval(c, -2, -2, 6, 11, t('#3E3E46')); oval(c, 0, 0, 4, 8, t('#141210'));
  c.restore();
};

/** The keepers' station: the hose reel cart, the CHUM buckets (flies over them), a mop. */
const hose = (g: Ctx, x: number, foot: number, t: T) => {
  const G = rT('#2E7A3A', t), M = rT('#8A929C', t), Y = rT('#E8B400', t);
  shadow(g, x, foot, 140);
  // (the reel: a drum on a frame, wheels, the hose wound on it and trailing off)
  box(g, x - 30, foot - 54, 4, 46, M[1]); box(g, x + 22, foot - 54, 4, 46, M[1]);
  oval(g, x - 2, foot - 36, 24, 24, t(INK)); oval(g, x - 2, foot - 36, 23, 23, G[1]);
  for (let r = 20; r > 8; r -= 3) { g.strokeStyle = r % 2 ? G[3] : G[2]; g.lineWidth = 2; g.beginPath(); g.arc(x - 2, foot - 36, r, 0, Math.PI * 2); g.stroke(); }
  oval(g, x - 2, foot - 36, 6, 6, M[2]); box(g, x - 4, foot - 38, 2, 2, M[4]);
  g.strokeStyle = G[2]; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 20, foot - 30); g.quadraticCurveTo(x + 50, foot + 2, x + 90, foot - 2); g.stroke();
  for (const wx of [x - 24, x + 20]) { oval(g, wx, foot - 7, 7, 7, t(INK)); oval(g, wx, foot - 7, 6, 6, M[1]); }
  // (the buckets)
  for (const [bx, lab] of [[x - 78, 'CHUM'], [x - 48, 'CHUM']] as const) {
    fill(g, [bx - 14, foot - 26, bx + 14, foot - 26, bx + 11, foot, bx - 11, foot], t(INK)); fill(g, [bx - 13, foot - 25, bx + 13, foot - 25, bx + 10, foot - 1, bx - 10, foot - 1], Y[2]);
    fill(g, [bx + 4, foot - 25, bx + 13, foot - 25, bx + 10, foot - 1, bx + 4, foot - 1], Y[1]);
    box(g, bx - 13, foot - 25, 26, 2, Y[4]); box(g, bx - 13, foot - 27, 26, 2, t('#6A1414'));
    signAt(g, lab, bx, foot - 13, 5, stencil(5, t('#1A0B06')));
  }
  // (the mop, leant on the reel)
  g.strokeStyle = t('#A8845A'); g.lineWidth = 2; g.beginPath(); g.moveTo(x - 30, foot - 2); g.lineTo(x - 6, foot - 96); g.stroke();
  for (let k = 0; k < 6; k++) box(g, x - 36 + k * 2, foot - 8, 2, 8, t('#D8D0B8'));
};
const hoseLive = (c: Ctx, x: number, foot: number, f: number, t: T) => {
  for (let i = 0; i < 4; i++) box(c, x - 60 + Math.sin(f * 0.21 + i * 1.7) * 14, foot - 34 + Math.cos(f * 0.17 + i * 2.3) * 7, 2, 2, t('#1A1A1A'));
};

/** The feeding show's prop cow: hung by its hooves off a gantry's trolley, a side bitten out of it (plastic ribs). */
const carcass = (g: Ctx, x: number, foot: number, t: T) => {
  const M = rT('#4A525C', t), C = rT('#E8E0D2', t), K = rT('#2A2A2E', t), Bn = rT('#F4EED8', t), Rd = rT('#9A2A22', t);
  shadow(g, x, foot, 160);
  // (the gantry: two legs, the beam, its trolley and hook)
  for (const lx of [x - 80, x + 76]) { box(g, lx, foot - 190, 6, 190, t(INK)); box(g, lx + 1, foot - 190, 4, 190, M[2]); box(g, lx + 1, foot - 190, 1, 190, M[4]); }
  box(g, x - 84, foot - 196, 168, 8, t(INK)); box(g, x - 83, foot - 195, 166, 6, M[3]);
  for (let k = x - 80; k < x + 80; k += 16) fill(g, [k, foot - 188, k + 8, foot - 188, k + 16, foot - 176, k + 8, foot - 176], M[1]);
  box(g, x - 10, foot - 188, 20, 8, M[1]); box(g, x - 1, foot - 180, 2, 22, t('#3A3A3A'));
  // (the cow, upside down: its legs up to the hook, the body, the head hanging, its spots; a side bitten out)
  const by = foot - 120;
  for (const lx of [x - 18, x + 12]) { box(g, lx, by - 40, 6, 42, t(INK)); box(g, lx + 1, by - 40, 4, 42, C[2]); box(g, lx, by - 44, 6, 6, K[1]); }
  oval(g, x, by + 18, 40, 24, t(INK)); oval(g, x, by + 18, 39, 23, C[2]); oval(g, x - 6, by + 12, 30, 15, C[3]); oval(g, x + 10, by + 28, 22, 10, C[1]);
  for (const [sx, sy, r] of [[x - 18, by + 10, 9], [x + 14, by + 6, 7], [x - 4, by + 30, 8]]) oval(g, sx, sy, r, r * 0.7, K[2]);
  fill(g, [x + 24, by + 30, x + 34, by + 44, x + 30, by + 64, x + 20, by + 66, x + 16, by + 46], t(INK)); fill(g, [x + 24, by + 32, x + 32, by + 44, x + 28, by + 62, x + 21, by + 63, x + 18, by + 46], C[2]);
  box(g, x + 21, by + 60, 8, 4, t('#E8A8A0')); box(g, x + 22, by + 50, 2, 2, t(INK));
  // (the bite: a half-moon out of its side, the red paint, the plastic ribs across it)
  g.fillStyle = t(INK); g.beginPath(); g.arc(x - 28, by + 22, 17, -Math.PI / 2, Math.PI / 2); g.fill();
  g.fillStyle = Rd[2]; g.beginPath(); g.arc(x - 28, by + 22, 15, -Math.PI / 2, Math.PI / 2); g.fill();
  for (let k = 0; k < 4; k++) box(g, x - 28, by + 11 + k * 7, 12 - Math.abs(k - 1.5) * 2, 2, Bn[3]);
  // (its tag)
  box(g, x + 36, by + 4, 16, 8, t(INK)); box(g, x + 37, by + 5, 14, 6, t('#F2D024')); signAt(g, '3', x + 44, by + 10, 4, print(4, t('#1A0B06')));
};

/** A pallet of spare parts: a dilophosaurus head on its side (frill folded, eye dead, wires out of its neck), a raptor
 *  leg leant up, the crate (RAPTOR PARTS: FRAGILE), an oil drum. */
const parts = (g: Ctx, x: number, foot: number, t: T) => {
  const W = rT('#A8845A', t), H = rT('#4E6A3A', t), Fr = rT('#C8462A', t), M = rT('#5A626C', t), Dr = rT('#2E5A8A', t);
  shadow(g, x, foot, 220);
  // (the pallet)
  box(g, x - 90, foot - 10, 180, 10, t(INK));
  for (let k = 0; k < 9; k++) { box(g, x - 89 + k * 20, foot - 9, 18, 3, W[k % 2 ? 2 : 3]); }
  for (const bx of [x - 88, x - 6, x + 76]) box(g, bx, foot - 6, 12, 6, W[1]);
  // (the crate)
  crate(g, x - 84, foot - 70, 70, 60, W, t);
  for (const y of [foot - 64, foot - 22]) box(g, x - 84, y, 70, 3, W[1]);
  g.strokeStyle = W[1]; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 82, foot - 61); g.lineTo(x - 16, foot - 23); g.stroke();
  signAt(g, 'RAPTOR', x - 49, foot - 46, 5, stencil(5, t('#1A0B06'))); signAt(g, 'PARTS', x - 49, foot - 38, 5, stencil(5, t('#1A0B06')));
  signAt(g, 'FRAGILE', x - 49, foot - 28, 4, stencil(4, t('#B91C1C')));
  // (the head: a dilophosaurus, its frill folded flat, its crests, its eye out)
  const hx = x + 30, hy = foot - 34;
  fill(g, [hx - 30, hy + 6, hx - 26, hy - 18, hx - 10, hy - 26, hx - 4, hy + 10], t(INK)); fill(g, [hx - 29, hy + 5, hx - 25, hy - 16, hx - 11, hy - 24, hx - 6, hy + 8], Fr[2]);
  for (let k = 0; k < 4; k++) box(g, hx - 26 + k * 5, hy - 14 + k * 2, 2, 16 - k * 3, Fr[1]);
  inked(g, [hx - 12, hy - 14, hx + 30, hy - 16, hx + 46, hy - 8, hx + 48, hy + 4, hx + 8, hy + 12, hx - 12, hy + 8], H[2], t);
  fill(g, [hx - 10, hy - 12, hx + 30, hy - 14, hx + 44, hy - 7, hx + 30, hy - 6, hx - 10, hy - 4], H[3]);
  for (const [cx, ch] of [[hx + 4, 12], [hx + 18, 10]] as const) { fill(g, [cx - 8, hy - 14, cx + 2, hy - 14 - ch, cx + 8, hy - 15], t(INK)); fill(g, [cx - 6, hy - 14, cx + 2, hy - 13 - ch, cx + 6, hy - 14], rT('#E8B400', t)[2]); }
  box(g, hx + 10, hy - 8, 6, 5, t(INK)); box(g, hx + 11, hy - 7, 4, 3, t('#18181B'));
  for (let k = 0; k < 7; k++) fill(g, [hx + 14 + k * 4, hy + 4, hx + 16 + k * 4, hy + 8, hx + 18 + k * 4, hy + 4], t('#E4E0D4'));
  for (const [col, dy] of [['#DC2626', 0], ['#2563EB', 3], ['#FACC15', 6]] as const) { g.strokeStyle = t(col); g.lineWidth = 1.5; g.beginPath(); g.moveTo(hx - 10, hy + 2 + dy * 0.4); g.quadraticCurveTo(hx - 20, hy + 14, hx - 30 + dy, foot - 10); g.stroke(); }
  bolt(g, hx + 30, hy - 4, t); bolt(g, hx, hy + 4, t);
  // (a raptor leg leant on the crate: the steel showing at the hip end)
  g.save(); g.translate(x - 4, foot - 10); g.rotate(-0.35);
  box(g, -4, -60, 9, 40, t(INK)); box(g, -3, -59, 7, 38, H[2]); box(g, -3, -59, 2, 38, H[3]);
  box(g, -3, -22, 6, 20, t(INK)); box(g, -2, -21, 4, 18, H[1]);
  oval(g, 0, -62, 5, 5, M[2]); box(g, -1, -63, 2, 2, M[4]);
  fill(g, [-2, -4, 12, -4, 14, 0, -2, 0], t('#3E3E46')); fill(g, [2, -4, 4, -12, 8, -12, 6, -4], t('#24242A'));
  g.restore();
  // (the oil drum)
  const dx = x + 84;
  box(g, dx - 15, foot - 54, 30, 54, t(INK)); stepped(g, dx - 14, foot - 53, 28, 52, Dr);
  for (const y of [foot - 44, foot - 18]) { box(g, dx - 14, y, 28, 2, Dr[0]); box(g, dx - 14, y + 2, 28, 1, Dr[4]); }
  box(g, dx - 14, foot - 53, 28, 3, Dr[3]); oval(g, dx + 4, foot - 52, 3, 1, t(INK));
  for (let k = 0; k < 3; k++) box(g, dx - 10 + k * 7, foot - 51, 2, 6 + k * 4, 'rgba(14, 12, 10, 0.6)');
};

// ---------------------------------------------------------------------------------------------------------------
// Where they go

type Kind = 'cycads' | 'feeder' | 'nest' | 'jeepStuck' | 'jeepChewed' | 'jeepWreck' | 'cart' | 'tables' | 'cutout' | 'kiddie' | 'dig' | 'toys' | 'hose' | 'carcass' | 'parts';
/** [x from the section's start, depth, what] */
const PLACED: [number, number, Kind][] = [
  // the raptor pen (in front of its back wall)
  [330, 0.8, 'toys'], [880, 0.8, 'hose'],
  // the meadow (behind its rail, behind the tour group)
  [1150, 0.66, 'cycads'], [1380, 0.68, 'feeder'], [1700, 0.64, 'nest'], [2020, 0.66, 'jeepStuck'], [2300, 0.62, 'cycads'],
  // the plaza
  [4010, 0.8, 'cart'], [4860, 0.79, 'tables'], [5120, 0.8, 'cutout'], [5370, 0.79, 'kiddie'], [5790, 0.8, 'dig'],
  // the paddock
  [6560, 0.8, 'carcass'], [7720, 0.79, 'jeepChewed'],
  // past it, to the temple fence
  [8620, 0.8, 'cycads'], [9100, 0.79, 'parts'], [9640, 0.8, 'jeepWreck'], [10160, 0.79, 'cycads'],
];
interface Piece { x: number; d: number; kind: Kind; i: number }
const PIECES: Piece[] = PLACED.map(([rx, d, kind], i) => ({ x: D + rx, d, kind, i })).sort((a, b) => a.d - b.d);
const HALF: Record<Kind, number> = { cycads: 110, feeder: 150, nest: 200, jeepStuck: 150, jeepChewed: 110, jeepWreck: 110, cart: 80, tables: 120, cutout: 70, kiddie: 80, dig: 160, toys: 110, hose: 110, carcass: 100, parts: 120 };
const TALL: Record<Kind, number> = { cycads: 120, feeder: 100, nest: 70, jeepStuck: 110, jeepChewed: 110, jeepWreck: 170, cart: 160, tables: 120, cutout: 140, kiddie: 80, dig: 80, toys: 140, hose: 110, carcass: 210, parts: 90 };
const PAINT: Record<Kind, (g: Ctx, x: number, foot: number, t: T, seed: number) => void> = {
  cycads, feeder: (g, x, f, t) => feeder(g, x, f, t), nest: (g, x, f, t) => nest(g, x, f, t),
  jeepStuck: (g, x, f, t) => jeep(g, x, f, t, 'stuck'), jeepChewed: (g, x, f, t) => jeep(g, x, f, t, 'chewed'), jeepWreck: (g, x, f, t) => jeep(g, x, f, t, 'wreck'),
  cart: (g, x, f, t) => cart(g, x, f, t), tables: (g, x, f, t) => tables(g, x, f, t), cutout: (g, x, f, t) => cutout(g, x, f, t), kiddie: (g, x, f, t) => kiddie(g, x, f, t),
  dig: (g, x, f, t) => dig(g, x, f, t), toys: (g, x, f, t) => toys(g, x, f, t), hose: (g, x, f, t) => hose(g, x, f, t), carcass: (g, x, f, t) => carcass(g, x, f, t), parts: (g, x, f, t) => parts(g, x, f, t),
};

const live = (c: Ctx, p: Piece, f: number, t: T, hostile: boolean) => {
  if (p.kind === 'nest') nestLive(c, p.x, GY, f, t, hostile);
  else if (p.kind === 'toys') toysLive(c, p.x, GY, f, t);
  else if (p.kind === 'hose') hoseLive(c, p.x, GY, f, t);
  else if (p.kind === 'kiddie' && (f >> 4) % 3 === 0) { box(c, p.x - 2, GY - 9, 4, 3, '#FFF2B0'); steppedGlow(c, p.x, GY - 8, 10, '#FFE080', 0.25, 0, 2); }
  // (on its roof, its hazards still blinking)
  else if (p.kind === 'jeepWreck' && (f >> 5) % 2 === 0) { box(c, p.x - 76, GY - 52, 5, 4, '#F59E0B'); steppedGlow(c, p.x - 74, GY - 50, 10, '#F59E0B', 0.25, 0, 2); }
};

/**
 * The pieces from the furthest in, up to depth `upTo` (each call carries on from the last: drawn in two passes, the
 * furthest before the park's guests well back and what stands along the back, the rest after it).
 */
let cursor = 0;
export const drawDinoDressing = (c: Ctx, state: GameState, upTo: number, first: boolean, hostile: boolean) => {
  if (first) cursor = 0;
  const eye: Eye = eyeOf(state), v = viewOf(state), f = state.frame || 0;
  while (cursor < PIECES.length && PIECES[cursor].d <= upTo) {
    const p = PIECES[cursor++];
    const sx = eye.x + (p.x - eye.x) * p.d, hw = HALF[p.kind] * p.d;
    if (sx + hw < v.x - 40 || sx - hw > v.x + v.w + 40) continue;
    const t = tintFor(p.d);
    c.save(); c.translate(eye.x, eye.y); c.scale(p.d, p.d); c.translate(-eye.x, -eye.y);
    stamp(c, `dn-dress-${p.i}`, p.x - HALF[p.kind] - 10, GY - TALL[p.kind] - 10, HALF[p.kind] * 2 + 20, TALL[p.kind] + 16, g => PAINT[p.kind](g, p.x, GY, t, p.i * 13 + 5));
    live(c, p, f, t, hostile);
    c.restore();
  }
};
