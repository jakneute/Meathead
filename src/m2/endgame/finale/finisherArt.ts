// THE KAIJU FINALE's finishers, the brushes (finishers.ts stages the eleven with them): the backdrop (Cartoon Land
// flattened, at sunrise: painted once), Meathead as he is in the fight (his own sprite's parts, posed here: every elbow
// and knee off art/limb.ts; the weapon in his fist the game's own held art; clean, shitty or naked), the two of them
// alive (bossArt.ts's poses) and every way they end up (baked once each where they hold still: frozen, sick, flat,
// bones), and the props. Everything in the picture's own 256 x 144 space; the beats are drawn 3 to the pixel (the
// scene player's `res`), so it's as fine as the fight itself.

import type { WeaponType } from '../../../m1/types';
import { drawLeg, drawArmTo, drawTorsoFromHips, setNude, setGlasses, type Mood } from '../../../m1/game/render/player/body';
import { drawHeldWeaponArt } from '../../../m1/game/render/player/player';
import { drawPoseSprite, drawPoseHead } from '../../moves/grab';
import { elbow, knee, reachTo, elbowFront, kneeFront } from '../../art/limb';
import { drawSatanBody, drawWidowBody, drawWidowHead, satanUpper, SATAN_S, SATAN_H, type SatanPose, type WidowPose } from './bossArt';
import { drawSatanFace } from '../../spooky/hell/satanArt';
import { paintCwTower } from './landmarkArt';

export type Ctx = CanvasRenderingContext2D;
export type P = [number, number];
export type Dress = 'clean' | 'shitty' | 'nude';
/** The pictures are drawn this many times finer than their 256 x 144 (the beats' `res`). */
export const RES = 3;
export const AW = 256, AH = 144;
/** The ground line, and where each of them stands in the picture; the bosses' scale. */
export const GY = 126, MX = 38, SX = 138, WX = 212, BK = 0.56, MK = 0.6;

export const INK = '#0B0A10';
export const BLOOD = ['#2E0202', '#5A0808', '#861010', '#B01C1C', '#D63434', '#F46A6A'];
export const GOO = ['#16300C', '#2E5A1A', '#3FA34D', '#6CC85A', '#A8E88A'];
export const BONE = ['#6A5E48', '#A89A7A', '#D8CCB0', '#F1EADA', '#FFFDF4'];
export const SK = ['#260404', '#4A0A08', '#721410', '#982018', '#BE3424', '#DE5838'];
export const HIDE = ['#203214', '#385424', '#527236', '#6E8E4A', '#8AA860', '#A8C27A'];
export const COAT = ['#480C30', '#86285E', '#BC4A88', '#E070AA', '#F49AC6', '#FCC0DC'];

export const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
export const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string, rot = 0) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.2, rx), Math.max(0.2, ry), rot, 0, Math.PI * 2); c.fill(); };
export const poly = (c: Ctx, pts: number[], col: string, ink: string | null = null, lw = 0.7) => {
  c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath();
  c.fillStyle = col; c.fill(); if (ink) { c.strokeStyle = ink; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke(); }
};
export const line = (c: Ctx, pts: number[], col: string, w = 1, cap: CanvasLineCap = 'round') => {
  c.strokeStyle = col; c.lineWidth = w; c.lineCap = cap; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.stroke(); c.lineCap = 'butt';
};
/** An inked ellipse in three tones (a lit cap up-left, a dark foot). */
export const blob = (c: Ctx, x: number, y: number, rx: number, ry: number, ramp: readonly string[], rot = 0) => {
  ell(c, x, y, rx + 0.7, ry + 0.7, INK, rot); ell(c, x, y, rx, ry, ramp[1], rot);
  c.save(); c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); c.clip();
  ell(c, x + rx * 0.2, y + ry * 0.45, rx * 1.1, ry * 0.8, ramp[0], rot); ell(c, x, y - ry * 0.1, rx * 0.95, ry * 0.8, ramp[1], rot); ell(c, x - rx * 0.3, y - ry * 0.4, rx * 0.5, ry * 0.4, ramp[2], rot);
  c.restore();
};
/** A checker dither of `col` over a rect (art pixels a third of a picture pixel: fine as the screen). */
export const dither = (c: Ctx, x: number, y: number, w: number, h: number, col: string, s = 1 / RES) => {
  c.fillStyle = col;
  const nx = Math.round(w / s), ny = Math.round(h / s);
  for (let j = 0; j < ny; j++) for (let i = (j & 1); i < nx; i += 2) c.fillRect(x + i * s, y + j * s, s, s);
};
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const ease = (k: number) => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
export const clamp01 = (k: number) => Math.max(0, Math.min(1, k));

// ---------------------------------------------------------------------------------------------------------------
// Painted once

const baked = new Map<string, HTMLCanvasElement>();
/** A still piece, painted the once into a canvas of its own (`x, y, w, h` its box in picture units; RES fine) and drawn
 *  from it after (turned, squashed, faded: whatever the caller's transform is). */
export const bake = (c: Ctx, key: string, x: number, y: number, w: number, h: number, paint: (g: Ctx) => void) => {
  let cv = baked.get(key);
  if (!cv) {
    cv = document.createElement('canvas'); cv.width = Math.ceil(w * RES); cv.height = Math.ceil(h * RES);
    const g = cv.getContext('2d')!; g.scale(RES, RES); g.translate(-x, -y); paint(g);
    baked.set(key, cv);
  }
  c.drawImage(cv, x, y, w, h);
};
/** The same, washed one color after (`k` how much): a frozen one, a sick one, a burnt one. */
export const bakeTint = (c: Ctx, key: string, x: number, y: number, w: number, h: number, col: string, k: number, paint: (g: Ctx) => void) =>
  bake(c, key, x, y, w, h, g => { paint(g); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = k; g.fillStyle = col; g.fillRect(0, 0, g.canvas.width, g.canvas.height); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; });

// ---------------------------------------------------------------------------------------------------------------
// The backdrop: Cartoon Land flat, the sun coming up on the right

const SKY = ['#2E4C9C', '#3A5AA8', '#5A74B4', '#8A8CB4', '#B898A8', '#DCA890', '#F2B878', '#FFD890'];
const GROUND = ['#FBC4DC', '#F4A8CC', '#E898C0', '#D888B4', '#C074A0'];
const CANDY = ['#F472B6', '#C084FC', '#FDE047', '#22D3EE', '#A3E635', '#FDE68A', '#F8FAFC'];
const paintBack = (g: Ctx) => {
  // (the sky: banded, a dithered seam between each band; the sun low on the right, its glow in stepped rings)
  const H0 = 100, bh = H0 / SKY.length;
  SKY.forEach((col, i) => R(g, 0, i * bh, AW, bh + 0.4, col));
  for (let i = 1; i < SKY.length; i++) dither(g, 0, i * bh - 1, AW, 1, SKY[i], 1 / 3);
  for (const [r, a] of [[46, 0.1], [34, 0.14], [24, 0.2]] as const) { g.globalAlpha = a; ell(g, 224, 99, r, r * 0.8, '#FFE9B0'); }
  g.globalAlpha = 1; ell(g, 224, 100, 13, 13, '#FFF2C4'); ell(g, 224, 100, 10, 10, '#FFFBE8');
  // (clouds lit from under)
  for (const [x, y, w] of [[18, 16, 44], [96, 30, 60], [170, 12, 36], [150, 52, 50], [40, 58, 30]] as const) {
    R(g, x, y, w, 2.4, '#A8A4C8'); R(g, x + w * 0.15, y - 1.6, w * 0.6, 1.8, '#A8A4C8'); R(g, x + 2, y + 2, w - 4, 0.8, '#FFD8A8');
  }
  // (far off, dim: what's left of the park: heaps, a few things still standing crooked, smoke going up)
  const far = '#9A7CA8', far2 = '#B08AAE';
  g.fillStyle = far; g.beginPath(); g.moveTo(0, 101);
  for (let x = 0; x <= AW; x += 4) g.lineTo(x, 92 - hash(x * 0.37) * 5 - Math.sin(x * 0.07) * 2 - (x > 60 && x < 84 ? 6 : 0));
  g.lineTo(AW, 101); g.closePath(); g.fill();
  // (a ride's bent arc, a snapped lollipop tree, the half of a dome, a leaning sign)
  g.strokeStyle = far; g.lineWidth = 1.4; g.beginPath(); g.arc(34, 94, 14, Math.PI * 1.05, Math.PI * 1.7); g.stroke();
  poly(g, [112, 92, 118, 80, 126, 79, 131, 92], far); line(g, [150, 92, 153, 74], far, 1); ell(g, 154, 73, 3, 3, far);
  poly(g, [178, 92, 180, 82, 196, 85, 197, 92], far);
  for (const [x, w] of [[20, 5], [72, 7], [124, 5], [188, 6]] as const) for (let k = 0; k < 5; k++) { g.globalAlpha = 0.16 - k * 0.025; ell(g, x + k * 2.6 + Math.sin(k) * 2, 86 - k * 8, w * 0.6 + k * 1.2, 3 + k * 0.8, '#6A5A78'); }
  g.globalAlpha = 1;
  dither(g, 0, 96, AW, 3, far2, 1 / 3);
  // (the ground: pink, in bands back to front, a dithered seam each; the cracks his feet left)
  const G0 = 100, gh = (AH - G0) / GROUND.length;
  GROUND.forEach((col, i) => R(g, 0, G0 + i * gh, AW, gh + 0.4, col));
  for (let i = 1; i < GROUND.length; i++) dither(g, 0, G0 + i * gh - 1, AW, 1, GROUND[i], 1 / 3);
  R(g, 0, G0, AW, 0.7, '#FFE4F0');
  // (a yellow path wandering back, broken)
  g.fillStyle = '#FEF3C7'; g.beginPath(); g.moveTo(60, 144); g.lineTo(96, 144); g.lineTo(84, 118); g.lineTo(100, 104); g.lineTo(94, 104); g.lineTo(70, 118); g.closePath(); g.fill();
  dither(g, 70, 112, 26, 8, '#E898C0', 1 / 3);
  for (const [x, y, l] of [[20, 132, 22], [118, 136, 30], [170, 120, 18], [226, 134, 20], [150, 108, 12]] as const) {
    line(g, [x, y, x + l * 0.3, y - 2, x + l * 0.55, y + 1.5, x + l, y - 1], '#9A4E80', 0.6); line(g, [x + l * 0.3, y - 2, x + l * 0.38, y - 5], '#9A4E80', 0.5);
  }
  // (his footprints: sunk ovals going off right)
  for (const [x, y] of [[8, 138], [50, 116], [104, 140], [190, 112]] as const) { ell(g, x, y, 9, 2.6, '#C074A0'); ell(g, x, y + 0.6, 8, 2, '#D888B4'); }
  // (the rubble: candy-colored heaps along the back of the ground, chunks nearer: each inked, a lit top)
  const heap = (x: number, y: number, w: number, h: number, seed: number) => {
    g.fillStyle = '#7A3A6A'; g.beginPath(); g.moveTo(x - w / 2 - 0.6, y);
    for (let k = 0; k <= 8; k++) g.lineTo(x - w / 2 + (k / 8) * w, y - Math.sin((k / 8) * Math.PI) * h * (0.7 + hash(seed + k) * 0.5) - 0.6);
    g.lineTo(x + w / 2 + 0.6, y); g.closePath(); g.fill();
    for (let k = 0; k < w * 0.9; k++) {
      const u = hash(seed * 3 + k), px = x - w / 2 + u * w, top = Math.sin(u * Math.PI) * h * 0.8, py = y - hash(seed + k * 7) * top, s = 1.2 + hash(k + seed) * 2.6;
      R(g, px - 0.3, py - s - 0.3, s + 0.6, s + 0.6, '#4A1A40'); R(g, px, py - s, s, s, CANDY[(k + seed) % CANDY.length]); R(g, px, py - s, s, 0.4, '#FFFFFF');
    }
  };
  heap(22, 104, 40, 9, 3); heap(82, 103, 30, 6, 11); heap(246, 106, 30, 10, 5); heap(176, 103, 26, 5, 19);
  heap(10, 144, 34, 8, 23); heap(244, 146, 40, 10, 31);
  // (a lollipop tree snapped over, a striped awning down, a flattened car)
  line(g, [100, 110, 122, 107], INK, 1.6); line(g, [100, 110, 122, 107], '#F8FAFC', 0.9); ell(g, 125, 106.5, 4.6, 4.6, INK); ell(g, 125, 106.5, 4, 4, '#F472B6'); ell(g, 124, 105.5, 1.6, 1.6, '#FBCFE8');
  for (let k = 0; k < 6; k++) poly(g, [196 + k * 3, 138, 199 + k * 3, 138, 198 + k * 3, 142, 195 + k * 3, 142], k % 2 ? '#F8FAFC' : '#22D3EE', INK, 0.3);
  R(g, 56, 136.4, 12, 1.8, INK); R(g, 56.4, 136.6, 11.2, 1.2, '#FDE047'); ell(g, 58, 138.4, 1.2, 0.8, INK); ell(g, 66, 138.4, 1.2, 0.8, INK);
};
/** The backdrop (painted once). */
export const back = (c: Ctx) => bake(c, 'back', 0, 0, AW, AH, paintBack);

/** A shadow on the ground under something. */
export const shadow = (c: Ctx, x: number, w: number, y = GY, a = 0.28) => { c.globalAlpha = a; ell(c, x, y + 0.6, w, w * 0.16, '#5A2A50'); c.globalAlpha = 1; };

// ---------------------------------------------------------------------------------------------------------------
// Meathead (his own sprite's parts, posed)

export interface MhPose {
  hipY?: number; feet?: [P, P]; lean?: number;
  /** His hands, in the torso's frame (from the hips, turned with the lean): the far one, the near one. */
  hands: [P, P];
  mood?: Mood; head?: P; headRot?: number;
  /** In his near fist: one of the nine (the game's own held art, its grip at his fist, turned `aim`), or a prop drawn
   *  there by the caller (`prop`, in the fist's frame, x along `aim`); `behind`: the prop's drawn before his body. */
  weapon?: WeaponType; aim?: number; prop?: (g: Ctx) => void; behind?: boolean;
  /** In his far fist. */
  prop2?: (g: Ctx) => void;
}
const UPPER = 20, FORE = 20, THIGH = 13, SHIN = 13;
const mhLeg = (g: Ctx, hip: P, foot: P, backLeg: boolean, toe = 0) => {
  const ft = reachTo(hip[0], hip[1], foot[0], foot[1], THIGH, SHIN), kn = knee(hip[0], hip[1], ft[0], ft[1], THIGH, SHIN, 1);
  drawLeg(g, hip, kn, ft, toe, backLeg);
};
const mhArm = (g: Ctx, sh: P, hand: P, backArm: boolean): P => {
  const hd = reachTo(sh[0], sh[1], hand[0], hand[1], UPPER, FORE), el = elbow(sh[0], sh[1], hd[0], hd[1], UPPER, FORE, 1);
  drawArmTo(g, sh, el, hd, backArm, backArm ? 5 : 6);
  return hd;
};
/** The shit: down the seat and the back of the legs (his own sprite's is the player renderer's; this is its stand-in on
 *  the posed one), a couple of flies. */
const shitOn = (g: Ctx, hipY: number, t: number) => {
  for (const [x, y, rx, ry] of [[-6, hipY + 1, 5, 4], [-3, hipY + 6, 4, 5], [-8, hipY + 10, 2.4, 4], [1, hipY + 3, 3, 2.4]] as const) ell(g, x, y, rx, ry, '#4A2E0C');
  for (const [x, y, rx, ry] of [[-6, hipY + 1, 3.4, 2.6], [-3, hipY + 6, 2.6, 3.4]] as const) ell(g, x, y, rx, ry, '#6A4A1A');
  ell(g, -5, hipY, 1.4, 1, '#8A6A2A');
  // (the stink off it: three wavy lines going up behind him)
  g.strokeStyle = 'rgba(110, 130, 40, 0.8)'; g.lineWidth = 1;
  for (let k = 0; k < 3; k++) { g.beginPath(); for (let j = 0; j <= 8; j++) { const px = -14 - k * 4 + Math.sin(j * 1.1 + t * 0.2 + k) * 1.6, py = hipY - 2 - j * 2.2; j ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); }
  for (let k = 0; k < 2; k++) { const a = t * 0.2 + k * 3; R(g, -12 + Math.cos(a) * 6, hipY - 8 + Math.sin(a * 1.3) * 5, 1.4, 1.2, '#0A0A0A'); }
};
/** Him, feet at (x, GY) (or `y`), facing `dir`, dressed `d`, in `p`. */
export const meathead = (c: Ctx, x: number, d: Dress, p: MhPose, t = 0, dir = 1, y = GY, k = MK) => {
  setNude(d === 'nude', 0, 0, t, 1); setGlasses(true);
  const hipY = p.hipY ?? -22, feet = p.feet ?? [[-8, 0], [9, 0]], lean = p.lean ?? 0;
  c.save(); c.translate(x, y); c.scale(k, k);
  drawPoseSprite(c, 0, 0, dir, g => {
    mhLeg(g, [-5, hipY], feet[0], true);
    mhLeg(g, [5, hipY], feet[1], false);
    if (d === 'shitty') shitOn(g, hipY, t);
    g.save(); g.translate(0, hipY); g.rotate(lean);
    const far = reachTo(-8, -22, p.hands[0][0], p.hands[0][1], UPPER, FORE);
    const near = reachTo(11, -22, p.hands[1][0], p.hands[1][1], UPPER, FORE);
    const held = () => { g.save(); g.translate(near[0], near[1]); g.rotate(p.aim ?? 0); if (p.weapon) drawHeldWeaponArt(g, p.weapon, t); p.prop?.(g); g.restore(); };
    if (p.prop2) { g.save(); g.translate(far[0], far[1]); p.prop2(g); g.restore(); }
    mhArm(g, [-8, -22], p.hands[0], true);
    if (p.behind) held();
    drawTorsoFromHips(g);
    const h = p.head ?? [3, -37];
    drawPoseHead(g, h[0], h[1], p.headRot ?? 0, p.mood ?? 'grit', t);
    if (!p.behind && (p.weapon || p.prop)) held();
    mhArm(g, [11, -22], p.hands[1], false);
    g.restore();
  });
  c.restore();
};
/** One of the nine, in a fist, `k` times its size (the fist's frame): a prop for a pose. */
export const heldBig = (w: WeaponType, k: number, t = 0) => (g: Ctx) => { g.save(); g.scale(k, k); drawHeldWeaponArt(g, w, t); g.restore(); };
/** Stood there, the weapon up and aimed (`kick`: 0..1 its recoil). */
export const aiming = (w: WeaponType, aim = 0, kick = 0, mood: Mood = 'grit'): MhPose => ({ lean: 0.06 - kick * 0.12, hands: [[20 - kick * 4, -22], [24 - kick * 5, -20 + Math.sin(aim) * 6]], weapon: w, aim: aim - kick * 0.3, mood, feet: [[-10, 0], [10, 0]] });
/** Stood easy, the weapon down at his side. */
export const easy = (w?: WeaponType, mood: Mood = 'scowl'): MhPose => ({ hands: [[-6, 0], [15, -2]], weapon: w, aim: 0.5, mood });
/** Arms folded, watching. */
export const folded = (mood: Mood = 'scowl'): MhPose => ({ lean: -0.05, hands: [[9, -15], [1, -13]], mood });

// ---------------------------------------------------------------------------------------------------------------
// The two of them, alive

/** Satan / the widow in one of their own poses: feet at (x, y), facing left at him (`face` 1: right), turned `ang`. */
export const satan = (c: Ctx, pose: SatanPose, t: number, x = SX, y = GY, ang = 0, k = BK, face = -1, talk = false) => { c.save(); c.translate(x, y); c.rotate(ang); c.scale(face * k, k); drawSatanBody(c, pose, t, talk); c.restore(); };
export const widow = (c: Ctx, pose: WidowPose, t: number, x = WX, y = GY, ang = 0, k = BK, face = -1, talk = false) => { c.save(); c.translate(x, y); c.rotate(ang); c.scale(face * k, k); drawWidowBody(c, pose, t, talk); c.restore(); };
/** Their boxes (their own units, about their feet): for baking them still. */
const SBOX: [number, number, number, number] = [-100, -200, 200, 210], WBOX: [number, number, number, number] = [-60, -175, 130, 185];
/** One of them, still, washed a color (frozen blue, sick green, burnt black), baked once: drawn as `satan` / `widow`. */
export const satanTint = (c: Ctx, key: string, pose: SatanPose, col: string, a: number, x = SX, y = GY, ang = 0, k = BK, sx = 1, sy = 1) => {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(-k * sx, k * sy);
  bakeTint(c, `s-${key}`, SBOX[0], SBOX[1], SBOX[2], SBOX[3], col, a, g => drawSatanBody(g, pose, 20, false)); c.restore();
};
export const widowTint = (c: Ctx, key: string, pose: WidowPose, col: string, a: number, x = WX, y = GY, ang = 0, k = BK, sx = 1, sy = 1) => {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(-k * sx, k * sy);
  bakeTint(c, `w-${key}`, WBOX[0], WBOX[1], WBOX[2], WBOX[3], col, a, g => drawWidowBody(g, pose, 20, false)); c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Gore, smoke, the small stuff

/** A splat on the ground: lobes round a pool, inked, a wet light in it. */
export const splat = (c: Ctx, x: number, y: number, r: number, ramp: readonly string[] = BLOOD, seed = 1) => {
  for (const pass of [0, 1]) {
    for (let k = 0; k < 9; k++) { const a = k * 0.7 + seed, d = r * (0.55 + hash(seed + k) * 0.5); ell(c, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.28, r * 0.3 + pass * -0.5 + 0.5, r * 0.11 + 0.4 - pass * 0.3, pass ? ramp[2] : ramp[0]); }
    ell(c, x, y, r * 0.8 + (pass ? 0 : 0.6), r * 0.24 + (pass ? 0 : 0.5), pass ? ramp[2] : ramp[0]);
  }
  ell(c, x - r * 0.1, y - r * 0.03, r * 0.5, r * 0.12, ramp[3]); ell(c, x - r * 0.3, y - r * 0.08, r * 0.16, r * 0.04, ramp[5] ?? ramp[4]);
};
/** Drops flung from (x, y): `k` 0..1 how far along (they arc and fall). */
export const spray = (c: Ctx, x: number, y: number, n: number, k: number, ramp: readonly string[] = BLOOD, reach = 30, seed = 1, floor = GY) => {
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * (0.1 + hash(seed + i) * 0.8), v = reach * (0.4 + hash(seed * 7 + i) * 0.8);
    const px = x + Math.cos(a) * v * k, py = Math.min(floor, y + Math.sin(a) * v * k + k * k * 34), s = 0.8 + hash(i + seed) * 1.6;
    ell(c, px, py, s + 0.4, s + 0.4, ramp[0]); ell(c, px, py, s, s, ramp[i % 2 ? 3 : 2]);
  }
};
/** Smoke going up off (x, y): stepped puffs, drifting (`t` frames). */
export const smoke = (c: Ctx, x: number, y: number, t: number, n = 4, col = '#5A5460', rise = 26, a = 0.5) => {
  for (let k = 0; k < n; k++) {
    const u = ((t * 0.012 + k / n) % 1), px = x + Math.sin(u * 5 + k) * 3, py = y - u * rise, r = 1.6 + u * 4;
    c.globalAlpha = a * (1 - u); ell(c, px, py, r, r * 0.85, col); c.globalAlpha = a * 0.6 * (1 - u); ell(c, px - r * 0.3, py - r * 0.3, r * 0.5, r * 0.4, '#C8C4CC');
  }
  c.globalAlpha = 1;
};
/** A fireball in stepped rings, `k` 0..1 as it blooms and goes to smoke. */
export const fireball = (c: Ctx, x: number, y: number, r: number, k: number, seed = 1) => {
  const grow = ease(Math.min(1, k * 2.2)), fade = clamp01((k - 0.55) / 0.45);
  for (const [rr, col] of [[1.12, INK], [1.08, '#4A0A08'], [1, '#B01C1C'], [0.82, '#EA580C'], [0.6, '#FDBA4A'], [0.36, '#FDE68A'], [0.16, '#FFFBE8']] as [number, string][]) {
    if (fade > 0 && rr < 0.9) c.globalAlpha = 1 - fade;
    for (let j = 0; j < 7; j++) { const a = j * 0.9 + seed, d = r * grow * rr * 0.34; ell(c, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, r * grow * rr * 0.62, r * grow * rr * 0.56, fade > 0 && rr >= 0.9 ? (rr > 1.1 ? INK : rr > 1.05 ? '#2A2630' : '#4A4650') : col); }
    c.globalAlpha = 1;
  }
};
/** Flames along a thing: stepped tongues flickering (`t`). */
export const flames = (c: Ctx, x0: number, x1: number, y: number, h: number, t: number, n = 6) => {
  for (let k = 0; k < n; k++) {
    const x = x0 + ((k + 0.5) / n) * (x1 - x0), hh = h * (0.55 + 0.45 * Math.abs(Math.sin(t * 0.3 + k * 1.9))), w = (x1 - x0) / n * 0.8;
    for (const [s, col] of [[1, '#7F1D1D'], [0.8, '#EA580C'], [0.52, '#FDBA4A'], [0.26, '#FEF3C7']] as [number, string][]) poly(c, [x - w * s, y, x + w * s, y, x + Math.sin(t * 0.4 + k) * w * 0.5, y - hh * s], col);
  }
};
/** Birdies round a head (flattened, they still get them). */
export const birds = (c: Ctx, x: number, y: number, t: number, n = 3) => {
  for (let k = 0; k < n; k++) {
    const a = t * 0.1 + (k / n) * Math.PI * 2, bx = x + Math.cos(a) * 12, by = y + Math.sin(a) * 3, flap = Math.sin(t * 0.6 + k) > 0 ? -1.6 : 1;
    ell(c, bx, by, 2.2, 1.7, INK); ell(c, bx, by, 1.7, 1.2, '#FDE047'); poly(c, [bx + 1.4, by - 0.4, bx + 3.2, by, bx + 1.4, by + 0.5], '#F97316');
    poly(c, [bx - 1, by - 0.4, bx + 0.6, by - 0.4, bx - 0.6, by + flap * 1.6], '#CA8A04'); R(c, bx + 0.5, by - 0.8, 0.5, 0.5, INK);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// What's left of them

/** Satan's hooves, stood where he was, smoking stumps of shin in them. */
export const hooves = (c: Ctx, x: number, t: number) => {
  for (const s of [-1, 1]) {
    const hx = x + s * 7;
    poly(c, [hx - 3.6, GY, hx - 3, GY - 5, hx + 3, GY - 5, hx + 4.4, GY], INK); poly(c, [hx - 2.9, GY - 0.4, hx - 2.4, GY - 4.4, hx + 2.4, GY - 4.4, hx + 3.6, GY - 0.4], '#1E1616'); R(c, hx - 2.4, GY - 4.4, 4.8, 0.6, '#4A3A3A'); R(c, hx - 0.2, GY - 2.4, 0.5, 2, '#000');
    R(c, hx - 2.6, GY - 8, 5.2, 3.4, INK); R(c, hx - 2, GY - 7.6, 4, 3, SK[3]); R(c, hx - 2, GY - 7.6, 4, 0.8, '#3A1A14'); ell(c, hx, GY - 7.8, 1.6, 0.7, '#F1EADA');
    smoke(c, hx, GY - 9, t + s * 20, 4, '#4A4450', 30);
  }
  ell(c, x, GY + 1.6, 16, 2.4, 'rgba(20, 10, 10, 0.5)');
};
/** Her slippers, the same: fuzzy, pink, an ankle's stump each. */
export const slippers = (c: Ctx, x: number, t: number) => {
  for (const s of [-1, 1]) {
    const hx = x + s * 6;
    ell(c, hx + 1, GY - 1.6, 5.4, 2.6, INK); ell(c, hx + 1, GY - 1.6, 4.8, 2, '#F9A8D4'); ell(c, hx + 3, GY - 2.6, 2.4, 1.4, '#FBCFE8');
    for (let k = 0; k < 5; k++) R(c, hx - 3 + k * 1.8, GY - 3.8 + (k % 2) * 0.5, 0.7, 1, '#FCE7F3');
    R(c, hx - 2.2, GY - 6.4, 3.6, 3.2, INK); R(c, hx - 1.7, GY - 6, 2.6, 2.8, HIDE[3]); ell(c, hx - 0.4, GY - 6.2, 1.2, 0.5, '#F1EADA');
    smoke(c, hx, GY - 7, t + s * 14 + 9, 4, '#4A5048', 26);
  }
  ell(c, x, GY + 1.6, 13, 2, 'rgba(20, 16, 10, 0.5)');
};

/** A skeleton stood there, front-on, `h` tall: skull, ribs, pelvis, arms hung, legs (knees and elbows off limb.ts);
 *  `who` gives it his horns and wing struts, or her block jaw, curlers and bow. */
export const skeleton = (c: Ctx, x: number, who: 'satan' | 'widow', t: number, y = GY) => {
  const h = who === 'satan' ? 80 : 68, s = h / 80;
  c.save(); c.translate(x, y); c.scale(s, s);
  const bone = (pts: number[], w = 2.2) => { line(c, pts, INK, w + 1.2); line(c, pts, BONE[2], w); line(c, [pts[0] - 0.4, pts[1] - 0.3, pts[2] - 0.4, pts[3] - 0.3], BONE[4], w * 0.35); };
  const knob = (px: number, py: number, r = 1.8) => { ell(c, px, py, r + 0.6, r + 0.6, INK); ell(c, px, py, r, r, BONE[3]); };
  // (his wing struts: bare, the skin gone; behind everything)
  if (who === 'satan') for (const sd of [-1, 1]) { bone([sd * 6, -58, sd * 26, -76], 1.4); for (const [ex, ey] of [[40, -62], [36, -48], [30, -38]] as const) bone([sd * 26, -76, sd * ex, ey], 1); }
  // (legs: hip, knee out to its side, foot)
  for (const sd of [-1, 1]) {
    const hip: P = [sd * 5, -30], foot: P = [sd * 7, -2], kn = kneeFront(hip[0], hip[1], foot[0], foot[1], 15, 15, sd);
    bone([hip[0], hip[1], kn[0], kn[1]]); bone([kn[0], kn[1], foot[0], foot[1]], 1.8); knob(kn[0], kn[1]);
    if (who === 'satan') { poly(c, [foot[0] - 3.4, 0, foot[0] - 2.6, -4, foot[0] + 2.6, -4, foot[0] + 3.8, 0], INK); poly(c, [foot[0] - 2.6, -0.5, foot[0] - 2, -3.4, foot[0] + 2, -3.4, foot[0] + 3, -0.5], '#1E1616'); }
    else { ell(c, foot[0] + sd, -1.6, 5, 2.4, INK); ell(c, foot[0] + sd, -1.6, 4.4, 1.8, '#F9A8D4'); }
  }
  // (the pelvis, the spine, the ribs)
  poly(c, [-9, -34, 9, -34, 6, -27, 0, -29, -6, -27], BONE[2], INK); ell(c, -4, -31, 1.6, 1.4, INK); ell(c, 4, -31, 1.6, 1.4, INK);
  for (let k = 0; k < 7; k++) { R(c, -1.8, -36 - k * 3.4, 3.6, 2.8, INK); R(c, -1.2, -35.6 - k * 3.4, 2.4, 2, BONE[3]); }
  for (let k = 0; k < 5; k++) { const yy = -56 + k * 3.6, w = 11 - Math.abs(k - 1.5) * 1.4; c.strokeStyle = INK; c.lineWidth = 2.2; c.beginPath(); c.ellipse(0, yy, w, 2.6, 0, 0.15, Math.PI - 0.15); c.stroke(); c.strokeStyle = BONE[2]; c.lineWidth = 1.2; c.stroke(); }
  bone([-12, -59, 12, -59], 1.6);
  // (arms hung, elbows out)
  for (const sd of [-1, 1]) {
    const sh: P = [sd * 12, -59], hand: P = [sd * 15, -30], el = elbowFront(sh[0], sh[1], hand[0], hand[1], 15, 15, sd);
    bone([sh[0], sh[1], el[0], el[1]], 1.8); bone([el[0], el[1], hand[0], hand[1]], 1.5); knob(sh[0], sh[1], 2); knob(el[0], el[1], 1.5);
    for (let f = -1; f <= 1; f++) line(c, [hand[0], hand[1], hand[0] + f * 1.6, hand[1] + 4], BONE[3], 0.8);
  }
  // (the skull)
  if (who === 'satan') {
    for (const sd of [-1, 1]) { c.strokeStyle = INK; c.lineWidth = 3.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(sd * 6, -74); c.quadraticCurveTo(sd * 16, -78, sd * 13, -90); c.stroke(); c.strokeStyle = '#2A2422'; c.lineWidth = 2.4; c.stroke(); c.strokeStyle = '#5A4A44'; c.lineWidth = 0.7; c.stroke(); c.lineCap = 'butt'; }
    blob(c, 0, -70, 8.4, 8, [BONE[1], BONE[3], BONE[4]]); poly(c, [-5, -66, 5, -66, 3.4, -58, -3.4, -58], BONE[3], INK);
    for (const sd of [-1, 1]) poly(c, [sd * 1.6, -72, sd * 6, -74, sd * 5, -69.5], INK);
    poly(c, [0, -68, -1.2, -65.4, 1.2, -65.4], INK);
    for (let k = 0; k < 5; k++) R(c, -3 + k * 1.3, -62, 0.9, 2.2, INK);
  } else {
    // (her block of a jaw, the pegs; the one socket; the curlers and the bow still on it)
    blob(c, -1, -72, 7, 6, [BONE[1], BONE[3], BONE[4]]); R(c, -8.6, -67.6, 18, 9.6, INK); R(c, -8, -67, 16.8, 8.4, BONE[3]); R(c, -8, -67, 16.8, 1, BONE[4]); R(c, -8, -60, 16.8, 1.4, BONE[1]);
    ell(c, 1, -72, 3.8, 3.2, INK); ell(c, 1.6, -71.6, 1, 0.8, '#3A1A1A');
    for (let k = 0; k < 5; k++) { R(c, -5.6 + k * 2.6, -70, 1.9, 3.4, INK); R(c, -5.2 + k * 2.6, -69.6, 1.1, 2.8, k === 2 ? '#F2C444' : BONE[4]); }
    for (let k = 0; k < 4; k++) { R(c, -8 + k * 3.2, -79.6, 3, 2.6, INK); R(c, -7.6 + k * 3.2, -79.2, 2.2, 1.8, k % 2 ? '#F472B6' : '#6A9CF4'); }
    poly(c, [-9, -79, -15, -83, -15, -75], '#F25BAA', INK, 0.5); poly(c, [-9, -79, -3, -83.4, -3, -76], '#F25BAA', INK, 0.5);
  }
  c.restore();
  void t;
};

/** Flat as a pancake: one of them stamped out on the ground, `w` wide (the face up in the middle of it, tread marks),
 *  birdies over it. */
export const pancake = (c: Ctx, x: number, who: 'satan' | 'widow', w = 44, y = GY) => {
  const base = who === 'satan' ? SK : COAT;
  c.save(); c.translate(x, y);
  // (the splat-shaped slab: lobed edge, inked, a lit rim)
  const edge = (grow: number) => { c.beginPath(); for (let k = 0; k <= 24; k++) { const a = (k / 24) * Math.PI * 2, r = 1 + Math.sin(k * 2.6) * 0.08 + (k % 3 ? 0 : 0.1); const px = Math.cos(a) * (w / 2 + grow) * r, py = Math.sin(a) * (4 + grow) * r - 2.6; k ? c.lineTo(px, py) : c.moveTo(px, py); } c.closePath(); };
  edge(0.7); c.fillStyle = INK; c.fill(); edge(0); c.fillStyle = base[2]; c.fill();
  c.save(); edge(0); c.clip();
  ell(c, 0, -3.6, w / 2 - 1, 3.4, base[3]); ell(c, -w * 0.12, -4.6, w / 2 - 6, 2, base[4]);
  if (who === 'satan') {
    // (his face, spread: the eyes a yard apart, the horns flat out either side, the grin gone long)
    for (const s of [-1, 1]) { ell(c, s * 8, -3.6, 3.4, 1.3, '#FDE047'); ell(c, s * 8.6, -3.5, 1, 0.9, INK); line(c, [s * 4, -5.2, s * 12, -5.8], INK, 0.7); }
    line(c, [-9, -1.4, -4, -0.6, 4, -0.6, 9, -1.4], INK, 0.8); for (let k = 0; k < 6; k++) R(c, -6 + k * 2.2, -1.5, 1.2, 1, '#F1EADA');
    ell(c, 0, -2.6, 1.6, 0.8, SK[1]);
  } else {
    // (her one eye, huge and flat; the lipstick a long smear; the quilting's diamonds)
    c.strokeStyle = COAT[1]; c.lineWidth = 0.4; for (let k = -6; k <= 6; k++) { c.beginPath(); c.moveTo(k * 5 - 6, -8); c.lineTo(k * 5 + 6, 2); c.moveTo(k * 5 + 6, -8); c.lineTo(k * 5 - 6, 2); c.stroke(); }
    ell(c, 0, -3.8, 9, 2.6, HIDE[3]); ell(c, 0, -4.2, 5.4, 1.7, '#3A6CD4'); ell(c, 0, -4.1, 4.2, 1.2, '#F8FAFC'); ell(c, 0.6, -4.1, 1.6, 0.9, '#8C5ADC'); ell(c, 0.8, -4.1, 0.6, 0.5, INK);
    R(c, -5, -2.4, 10, 0.9, '#D2245C');
  }
  c.restore();
  if (who === 'satan') {
    for (const s of [-1, 1]) { poly(c, [s * 12, -3.4, s * (w / 2 + 3), -5.4, s * (w / 2 + 6), -2.4, s * (w / 2 + 2), -1.6], '#2A2422', INK, 0.5); }
    line(c, [w / 2 - 2, -1, w / 2 + 7, 0, w / 2 + 12, -1.6], INK, 1.6); line(c, [w / 2 - 2, -1, w / 2 + 7, 0, w / 2 + 12, -1.6], SK[2], 0.9); poly(c, [w / 2 + 11, -3, w / 2 + 15.6, -1.4, w / 2 + 11.6, 0.4], INK);
  } else {
    for (let k = 0; k < 3; k++) { R(c, -w / 2 - 3 + k * 0.4, -6 + k * 1.8, 3.4, 1.6, INK); R(c, -w / 2 - 2.6 + k * 0.4, -5.7 + k * 1.8, 2.6, 1, k % 2 ? '#F472B6' : '#6A9CF4'); }
    ell(c, w / 2 + 3, -1.4, 4, 1.5, INK); ell(c, w / 2 + 3, -1.4, 3.4, 1, '#F9A8D4');
  }
  c.restore();
};

/** Rolled up like a rug: a roll lying along x from (x, y), `len` long, the spiral showing at the near end; his horn and
 *  tail out the ends, or her curler and slipper. */
export const rug = (c: Ctx, x: number, y: number, who: 'satan' | 'widow', len = 34, r = 4.6) => {
  const base = who === 'satan' ? SK : COAT;
  c.save(); c.translate(x, y);
  if (who === 'satan') { line(c, [-len / 2, 0, -len / 2 - 6, 2, -len / 2 - 9, 6], INK, 1.8); line(c, [-len / 2, 0, -len / 2 - 6, 2, -len / 2 - 9, 6], SK[2], 1); poly(c, [-len / 2 - 11, 5, -len / 2 - 8, 9.6, -len / 2 - 6.6, 5.6], INK); }
  else { ell(c, -len / 2 - 3, 1, 3.6, 1.6, INK); ell(c, -len / 2 - 3, 1, 3, 1.1, '#F9A8D4'); line(c, [-len / 2, 0, -len / 2 - 2, 1], HIDE[3], 1.6); }
  R(c, -len / 2, -r - 0.6, len, r * 2 + 1.2, INK); R(c, -len / 2, -r, len, r * 2, base[3]); R(c, -len / 2, -r, len, r * 0.5, base[5]); R(c, -len / 2, -r * 0.5, len, r * 0.5, base[4]); R(c, -len / 2, r * 0.4, len, r * 0.6, base[2]);
  dither(c, -len / 2, r * 0.1, len, 0.7, base[2]);
  if (who === 'widow') { c.save(); c.beginPath(); c.rect(-len / 2, -r, len, r * 2); c.clip(); c.strokeStyle = COAT[1]; c.lineWidth = 0.35; for (let k = -2; k < len / 4 + 2; k++) { c.beginPath(); c.moveTo(-len / 2 + k * 4, -r); c.lineTo(-len / 2 + k * 4 + 5, r); c.moveTo(-len / 2 + k * 4 + 5, -r); c.lineTo(-len / 2 + k * 4, r); c.stroke(); } c.restore(); }
  for (const u of [0.22, 0.72]) { R(c, -len / 2 + len * u, -r - 0.8, 1.6, r * 2 + 1.6, INK); R(c, -len / 2 + len * u + 0.3, -r - 0.5, 1, r * 2 + 1, '#C8A46A'); }
  // (the end: the spiral)
  ell(c, len / 2, 0, r * 0.62 + 0.6, r + 0.6, INK); ell(c, len / 2, 0, r * 0.62, r, base[2]);
  c.strokeStyle = base[0]; c.lineWidth = 0.5; c.beginPath(); for (let k = 0; k < 40; k++) { const a = k * 0.42, rr = (k / 40) * r * 0.9; const px = len / 2 + Math.cos(a) * rr * 0.62, py = Math.sin(a) * rr; k ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke();
  if (who === 'satan') { c.strokeStyle = INK; c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(len / 2, -1); c.quadraticCurveTo(len / 2 + 7, -2, len / 2 + 7, -8); c.stroke(); c.strokeStyle = '#2A2422'; c.lineWidth = 1.6; c.stroke(); c.lineCap = 'butt'; }
  else { R(c, len / 2 + 0.6, -2.6, 4.2, 3, INK); R(c, len / 2 + 1, -2.2, 3.4, 2.2, '#6A9CF4'); R(c, len / 2 + 1, -2.2, 3.4, 0.6, '#FFFFFF'); }
  c.restore();
};

/** An empty skin lying in a heap (deflated, drained, or melted to it): `w` wide. */
export const husk = (c: Ctx, x: number, who: 'satan' | 'widow', w = 36, y = GY) => {
  const base = who === 'satan' ? SK : HIDE;
  c.save(); c.translate(x, y);
  c.fillStyle = INK; c.beginPath(); c.moveTo(-w / 2 - 0.6, 0.4);
  for (let k = 0; k <= 10; k++) c.lineTo(-w / 2 + (k / 10) * w, -2.4 - Math.abs(Math.sin(k * 1.7)) * 3.6 - 0.6);
  c.lineTo(w / 2 + 0.6, 0.4); c.closePath(); c.fill();
  c.fillStyle = base[2]; c.beginPath(); c.moveTo(-w / 2, 0);
  for (let k = 0; k <= 10; k++) c.lineTo(-w / 2 + (k / 10) * w, -2.4 - Math.abs(Math.sin(k * 1.7)) * 3.6);
  c.lineTo(w / 2, 0); c.closePath(); c.fill();
  for (let k = 0; k < 5; k++) { const px = -w / 2 + 4 + k * (w - 8) / 4; line(c, [px, -1, px + 2, -4.4], base[0], 0.5); ell(c, px - 1, -3.4, 2.4, 1, base[4]); }
  if (who === 'satan') {
    for (const s of [-1, 1]) { c.strokeStyle = INK; c.lineWidth = 2.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(s * 4 - 6, -5); c.quadraticCurveTo(s * 9 - 6, -6, s * 8 - 6, -11); c.stroke(); c.strokeStyle = '#2A2422'; c.lineWidth = 1.4; c.stroke(); c.lineCap = 'butt'; }
    ell(c, -8, -4, 1.4, 0.6, '#FDE047'); ell(c, -3.6, -4, 1.4, 0.6, '#FDE047'); R(c, -8.4, -4.2, 2.6, 0.4, INK); R(c, -4.2, -4.2, 2.6, 0.4, INK);
    poly(c, [w / 2 - 6, -0.4, w / 2 - 5, -4, w / 2 - 1, -4, w / 2 + 0.6, -0.4], '#1E1616', INK, 0.4);
  } else {
    R(c, -w / 2 + 2, -3, w * 0.5, 2.4, COAT[3]); R(c, -w / 2 + 2, -3, w * 0.5, 0.6, COAT[5]);
    ell(c, 2, -4.6, 3, 1.2, '#F8FAFC'); ell(c, 2.6, -4.6, 1, 0.8, '#8C5ADC'); R(c, 0, -5.4, 4.6, 0.5, INK);
    for (let k = 0; k < 3; k++) { R(c, 7 + k * 3, -7 + (k % 2), 2.8, 2.2, INK); R(c, 7.4 + k * 3, -6.7 + (k % 2), 2, 1.5, k % 2 ? '#F472B6' : '#6A9CF4'); }
    ell(c, w / 2 - 2, -1.4, 3.6, 1.5, INK); ell(c, w / 2 - 2, -1.4, 3, 1, '#F9A8D4');
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Props

/** THE CARTOON LAND WATER TOWER, as it stands (the land's own painter), its foot at (x, y), `k` its size. */
export const towerUp = (c: Ctx, x: number, y: number, k = BK, rot = 0) => { c.save(); c.translate(x, y); c.rotate(rot); c.scale(k, k); bake(c, 'cwtower', -40, -104, 80, 108, paintCwTower); c.restore(); };
/** Its tank, giant, upside-down: the cup (its mouth on the ground at (x, y), `r` half its width), `t` frames. `inside`:
 *  the front of it cut away (a cartoon's cutaway: a ragged window) and what's in there drawn by the caller, clipped to
 *  it (in the cup's own frame: the ground at 0, x about its middle). */
export const cup = (c: Ctx, x: number, y: number, r: number, t: number, inside?: (g: Ctx) => void) => {
  const h = r * 1.56;
  c.save(); c.translate(x, y);
  const dome = (g: number) => { c.beginPath(); c.moveTo(-r - g, 0); c.lineTo(-r - g, -h * 0.5); c.bezierCurveTo(-r - g, -h * 1.08 - g, r + g, -h * 1.08 - g, r + g, -h * 0.5); c.lineTo(r + g, 0); c.closePath(); };
  dome(0.8); c.fillStyle = INK; c.fill();
  c.save(); dome(0); c.clip();
  const bands = ['#FBCFE8', '#F9A8D4', '#F472B6', '#EC4899', '#DB2777'];
  bands.forEach((col, i) => R(c, -r + (i / bands.length) * 2 * r, -h - 2, (2 * r) / bands.length + 0.3, h + 3, col));
  for (let i = 1; i < bands.length; i++) dither(c, -r + (i / bands.length) * 2 * r - 0.7, -h, 0.7, h, bands[i]);
  // (the purple band with its name, upside-down now; its face over that, upside-down and not happy about it)
  R(c, -r, -h * 0.74, 2 * r, h * 0.13, '#7C3AED'); R(c, -r, -h * 0.74, 2 * r, 0.8, '#A78BFA'); R(c, -r, -h * 0.61 - 0.8, 2 * r, 0.8, '#4C1D95');
  c.save(); c.translate(0, -h * 0.675); c.rotate(Math.PI); c.font = `${r * 0.12}px "Press Start 2P"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FDE047'; c.fillText('CARTOON LAND', 0, 0); c.restore();
  for (const s of [-1, 1]) { ell(c, s * r * 0.3, -h * 0.84, r * 0.15, r * 0.14, INK); ell(c, s * r * 0.3, -h * 0.84, r * 0.125, r * 0.115, '#F8FAFC'); ell(c, s * r * 0.3 + Math.sin(t * 0.3) * 0.8, -h * 0.82, r * 0.05, r * 0.055, INK); }
  c.strokeStyle = INK; c.lineWidth = 0.9; c.beginPath(); c.arc(0, -h * 0.95 + r * 0.16, r * 0.16, Math.PI + 0.4, -0.4); c.stroke();
  c.restore();
  if (inside) {
    // (the cutaway: ragged, a dark rim; what's in there)
    const win = (g: number) => { c.beginPath(); const x0 = -r * 0.84 - g, x1 = r * 0.84 + g, y0 = -h * 0.57 - g, y1 = -1.6 + g; c.moveTo(x0, y1); for (let k = 0; k <= 10; k++) c.lineTo(x0 + (k % 2 ? 1.6 : 0), y1 + (y0 - y1) * (k / 10)); for (let k = 0; k <= 14; k++) c.lineTo(x0 + (x1 - x0) * (k / 14), y0 + (k % 2 ? 1.8 : 0) - Math.sin((k / 14) * Math.PI) * 3); for (let k = 0; k <= 10; k++) c.lineTo(x1 - (k % 2 ? 1.6 : 0), y0 + (y1 - y0) * (k / 10)); c.closePath(); };
    win(1.3); c.fillStyle = INK; c.fill(); win(0.6); c.fillStyle = '#9D174D'; c.fill();
    c.save(); win(0); c.clip(); R(c, -r, -h, 2 * r, h, '#3A1030'); dither(c, -r, -h * 0.57, 2 * r, 6, '#240818', 1 / 3); inside(c); c.restore();
  }
  c.restore();
};
/** The tower's four bendy legs, stuck up in the air off the cup's top (it's upside-down), wobbling. */
export const cupLegs = (c: Ctx, x: number, y: number, r: number, t: number) => {
  const h = r * 1.56;
  for (const [x0, bend] of [[-0.5, -0.7], [-0.18, -0.25], [0.18, 0.25], [0.5, 0.7]] as const) {
    const w = Math.sin(t * 0.15 + x0 * 4) * 2;
    c.strokeStyle = INK; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + x0 * r, y - h + 3); c.quadraticCurveTo(x + bend * r * 1.4 + w, y - h - r * 0.4, x + bend * r + w * 2, y - h - r * 0.8); c.stroke();
    c.strokeStyle = '#C084FC'; c.lineWidth = 1.8; c.stroke(); c.strokeStyle = '#E9D5FF'; c.lineWidth = 0.5; c.stroke(); c.lineCap = 'butt';
  }
};

/** A moai, the whole guy (the gift shop's: the head everybody knows, on the body nobody does), `h` tall, its foot's
 *  middle at (x, y): gray tuff in bands, the long face, the brow's shadow, the little hands on the belly. */
export const moai = (c: Ctx, x: number, y: number, h = 76, rot = 0) => {
  c.save(); c.translate(x, y); c.rotate(rot); const s = h / 76; c.scale(s, s);
  bake(c, 'moai', -22, -78, 44, 80, g => {
    const ST = ['#3A3A34', '#56564E', '#72726A', '#8E8E84', '#AAAA9E', '#C4C4B8'];
    // (the body: a slab, narrow shoulders, the belly out; the arms down it to the hands at the navel)
    poly(g, [-14, 0, -16, -30, -12, -40, 12, -40, 16, -30, 14, 0], ST[2], INK, 1);
    poly(g, [-14, 0, -16, -30, -12, -40, -6, -40, -9, 0], ST[3]); poly(g, [8, 0, 10, -40, 12, -40, 16, -30, 14, 0], ST[1]);
    dither(g, -9, -40, 3, 40, ST[2], 1 / 3); dither(g, 5, -40, 3, 40, ST[1], 1 / 3);
    line(g, [-13, -34, -12, -14, -4, -9], ST[0], 0.9); line(g, [13, -34, 12, -14, 4, -9], ST[0], 0.9);
    for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) line(g, [sd * 4, -9 + k * 1.3, sd * 0.6, -8.4 + k * 1.3], ST[0], 0.6);
    ell(g, 0, -15, 1, 1, ST[0]); line(g, [-9, -3, 9, -3], ST[1], 0.7);
    // (the head: long, the jaw square, leaning forward over the chest)
    poly(g, [-11, -38, -12, -66, -8, -76, 9, -76, 12, -64, 11, -38, 4, -36, -4, -36], ST[3], INK, 1);
    poly(g, [-11, -38, -12, -66, -8, -76, -3, -76, -6, -38], ST[4]); poly(g, [6, -38, 7, -76, 9, -76, 12, -64, 11, -38], ST[1]);
    dither(g, -6, -76, 2.4, 38, ST[3], 1 / 3); dither(g, 4.4, -76, 2.4, 38, ST[2], 1 / 3);
    // (the brow: a shelf, the sockets in its shadow; the long nose, its flared end; the thin pursed mouth; the ears)
    poly(g, [-12, -66, 12, -65, 12, -61, -12, -62], ST[4], INK, 0.6); R(g, -10, -62, 20, 4.4, ST[0]); R(g, -8, -61, 5, 2, '#1A1A16'); R(g, 3, -61, 5, 2, '#1A1A16');
    poly(g, [-2, -62, 2, -62, 4.4, -47, 0, -45.4, -4.4, -47], ST[4], INK, 0.6); poly(g, [0, -62, 2, -62, 4.4, -47, 0, -45.4], ST[2]);
    ell(g, -2.4, -46.6, 1, 0.7, ST[0]); ell(g, 2.4, -46.6, 1, 0.7, ST[0]);
    poly(g, [-6, -42.4, 6, -42.4, 5, -40.4, -5, -40.4], ST[1], INK, 0.5); line(g, [-5, -41.4, 5, -41.4], ST[0], 0.5);
    for (const sd of [-1, 1]) { poly(g, [sd * 12, -62, sd * 14.4, -61, sd * 14.4, -46, sd * 12, -44], ST[sd < 0 ? 4 : 1], INK, 0.6); }
    // (weather: pits and lichen)
    for (let k = 0; k < 40; k++) { const px = -11 + hash(k * 3.1) * 22, py = -74 + hash(k * 7.7) * 72; R(g, px, py, 0.7, 0.7, hash(k) > 0.7 ? '#7A8A4A' : ST[1]); }
    // (the gift shop's sticker on its backside's edge)
    R(g, 8, -8, 6, 4, '#FDE047'); R(g, 8.6, -6.6, 4.8, 0.5, INK); R(g, 8.6, -5.4, 3, 0.5, INK);
  });
  c.restore();
};
/** An Eiffel tower, the souvenir kind, giant: its point at (x, y) going down into something, `h` tall, standing up
 *  from there (turned `rot`). */
export const eiffel = (c: Ctx, x: number, y: number, h = 60, rot = 0) => {
  c.save(); c.translate(x, y); c.rotate(rot); const s = h / 60; c.scale(s, s);
  // (drawn point down: the base up in the air)
  bake(c, 'eiffel', -16, -62, 32, 64, g => {
    const IR = ['#2A1C10', '#4A341E', '#6E4E2C', '#8A6A4A', '#B08A5E', '#D8B88A'];
    const side = (sd: number) => [sd * 0.6, 0, sd * 1.6, -22, sd * 4, -38, sd * 8, -50, sd * 14, -60];
    const L = side(-1), Rr = side(1);
    g.beginPath(); g.moveTo(L[0], L[1]); for (let i = 2; i < L.length; i += 2) g.lineTo(L[i], L[i + 1]); for (let i = Rr.length - 2; i >= 0; i -= 2) g.lineTo(Rr[i], Rr[i + 1]); g.closePath();
    g.fillStyle = IR[2]; g.fill(); g.strokeStyle = INK; g.lineWidth = 1; g.lineJoin = 'round'; g.stroke();
    g.save(); g.clip();
    R(g, -16, -62, 16, 64, IR[3]); dither(g, -2, -62, 2, 64, IR[2], 1 / 3); R(g, -16, -62, 6, 64, IR[4]);
    g.strokeStyle = IR[0]; g.lineWidth = 0.5; for (let k = 0; k < 16; k++) { g.beginPath(); g.moveTo(-16, -k * 4); g.lineTo(16, -k * 4 - 8); g.moveTo(16, -k * 4); g.lineTo(-16, -k * 4 - 8); g.stroke(); }
    g.restore();
    // (the decks; the arch between the legs at the base, cut out)
    for (const [yy, w] of [[-22, 3], [-38, 5.4], [-50, 9.4]] as const) { R(g, -w, yy - 1, w * 2, 2.2, INK); R(g, -w + 0.4, yy - 0.6, w * 2 - 0.8, 1.4, IR[5]); }
    g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.ellipse(0, -60.5, 6.4, 7.4, 0, 0, Math.PI * 2); g.fill(); g.globalCompositeOperation = 'source-over';
    g.strokeStyle = INK; g.lineWidth = 0.8; g.beginPath(); g.ellipse(0, -60.5, 6.6, 7.6, 0, 0.15, Math.PI - 0.15); g.stroke();
    R(g, -14, -61, 28, 1.4, INK);
    // (PARIS on a plate: it's from the gift shop)
    R(g, -4.6, -45.4, 9.2, 3.6, INK); R(g, -4.2, -45, 8.4, 2.8, '#FDE68A'); g.font = '2px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = '#7A1A1A'; g.save(); g.translate(0, -43.6); g.rotate(Math.PI); g.fillText('PARIS', 0, 1); g.restore();
  });
  c.restore();
};

/** A block of ice round something, its foot's middle at (x, y): banded, see-through (what's in it is drawn first by the
 *  caller), cracks, icicles off the top edge, frost on the ground. */
export const iceBlock = (c: Ctx, x: number, y: number, w: number, h: number) => {
  c.save(); c.translate(x, y);
  const pts = [-w / 2, 0, -w / 2 - 2, -h * 0.5, -w / 2 + 3, -h, w / 2 - 4, -h - 2, w / 2 + 2, -h * 0.55, w / 2, 0];
  poly(c, pts, 'rgba(150, 205, 250, 0.5)', INK, 0.9);
  c.save(); c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.clip();
  R(c, -w / 2 - 2, -h - 2, w * 0.22, h + 2, 'rgba(230, 245, 255, 0.5)'); dither(c, -w / 2 - 2 + w * 0.22, -h - 2, 1.4, h + 2, 'rgba(230, 245, 255, 0.5)');
  R(c, w * 0.26, -h - 2, w * 0.3, h + 2, 'rgba(60, 110, 190, 0.3)'); dither(c, w * 0.26 - 1.4, -h - 2, 1.4, h + 2, 'rgba(60, 110, 190, 0.3)');
  poly(c, [-w * 0.3, -h, -w * 0.12, -h, -w * 0.34, 0, -w * 0.5, 0], 'rgba(255, 255, 255, 0.28)');
  line(c, [w * 0.1, -h, w * 0.02, -h * 0.7, w * 0.14, -h * 0.5, w * 0.06, -h * 0.3], 'rgba(255, 255, 255, 0.8)', 0.5); line(c, [w * 0.02, -h * 0.7, -w * 0.12, -h * 0.62], 'rgba(255, 255, 255, 0.8)', 0.4);
  c.restore();
  R(c, -w / 2 + 3, -h - 0.4, w - 7, 1, '#FFFFFF');
  for (let k = 0; k < 6; k++) { const px = -w / 2 + 5 + k * (w - 10) / 5, l = 3 + hash(k * 3) * 6; poly(c, [px - 1.4, -h * 0.55 + (k % 2) * 2, px + 1.4, -h * 0.55 + (k % 2) * 2, px, -h * 0.55 + l], '#DCEEFF', INK, 0.4); }
  ell(c, 0, 1, w * 0.62, 2, 'rgba(230, 245, 255, 0.7)');
  c.restore();
};
/** Shards of that ice lying about, bits of him in them (`n` of them along x0..x1). */
export const iceShards = (c: Ctx, x0: number, x1: number, n = 12, seed = 3, y = GY) => {
  for (let k = 0; k < n; k++) {
    const x = x0 + hash(seed + k * 1.7) * (x1 - x0), s = 3 + hash(seed * 5 + k) * 6, a = hash(k * 9 + seed) * 2 - 1;
    c.save(); c.translate(x, y - s * 0.3 - hash(k) * 2); c.rotate(a);
    if (k % 2 === 0) { R(c, -s * 0.3, -s * 0.2, s * 0.6, s * 0.4, k % 4 ? SK[3] : SK[4]); if (k % 4 === 0) R(c, -s * 0.2, -s * 0.1, s * 0.3, s * 0.2, '#F1EADA'); }
    poly(c, [-s * 0.6, s * 0.3, -s * 0.4, -s * 0.5, s * 0.5, -s * 0.4, s * 0.7, s * 0.2, 0, s * 0.5], 'rgba(170, 215, 250, 0.62)', INK, 0.5);
    line(c, [-s * 0.3, -s * 0.3, s * 0.3, -s * 0.3], 'rgba(255, 255, 255, 0.9)', 0.4);
    c.restore();
  }
};

/** One of the spawner's little goblins: 6 or so tall, feet at (x, y), facing `dir`; `mouth`: chewing. */
export const goblin = (c: Ctx, x: number, y: number, dir: number, t: number, k = 0, s = 1) => {
  const G = [['#2E5A1A', '#5FA83A', '#A8E06A'], ['#3A4E12', '#84A82A', '#C8E86A'], ['#1E5A3A', '#3FA36A', '#8AE8A8']][k % 3];
  const chew = (t >> 2) % 2;
  c.save(); c.translate(x, y); c.scale(dir * s, s);
  R(c, -1.8 + chew * 0.6, -1.6, 1.2, 1.6, INK); R(c, 0.8 - chew * 0.6, -1.6, 1.2, 1.6, INK);
  ell(c, 0, -3.6, 2.6, 2.4, INK); ell(c, 0, -3.6, 2.1, 1.9, G[1]); ell(c, -0.5, -4.2, 1.1, 0.8, G[2]);
  poly(c, [-1.6, -5, -3.8, -6.6, -1.2, -4], G[1], INK, 0.3); poly(c, [0.6, -5.2, 0.2, -7.4, 1.6, -5], G[1], INK, 0.3);
  ell(c, 1, -4, 0.9, 0.9, '#F8FAFC'); R(c, 1.1, -4.2, 0.6, 0.6, INK);
  R(c, 0.4, -2.8 + chew * 0.3, 2.2, 0.8 + chew * 0.4, INK); for (let j = 0; j < 3; j++) R(c, 0.6 + j * 0.7, -2.8 + chew * 0.3, 0.4, 0.5, '#F8FAFC');
  c.restore();
};

/** A crossbow's plague darts stuck in one of them (in its own units about its feet: the caller's transform). */
export const dartsIn = (c: Ctx, pts: readonly (readonly [number, number, number])[]) => {
  for (const [x, y, a] of pts) {
    c.save(); c.translate(x, y); c.rotate(a);
    R(c, 0, -1.2, 16, 2.4, INK); R(c, 0, -0.7, 15, 1.4, '#8A6A3A'); R(c, 0, -0.7, 15, 0.5, '#C8A46A');
    poly(c, [15, -3.6, 22, -3.6, 19, 0, 22, 3.6, 15, 3.6, 17, 0], '#84CC16', INK, 0.7);
    ell(c, 0, 0, 2.6, 2.6, 'rgba(132, 204, 22, 0.55)');
    c.restore();
  }
};

/** Puke through the air from (x0, y0) to (x1, y1): a fat stepped arc, chunks in it, `t` frames (it pulses along). */
export const pukeArc = (c: Ctx, x0: number, y0: number, x1: number, y1: number, t: number, sag = -10, w = 3.4) => {
  const at = (u: number): P => [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u + Math.sin(u * Math.PI) * sag];
  for (const [ww, col] of [[w + 1.4, INK], [w, '#5E8A18'], [w * 0.66, '#A3E635'], [w * 0.26, '#EAFFB0']] as [number, string][]) {
    c.strokeStyle = col; c.lineWidth = ww; c.lineCap = 'round'; c.beginPath();
    for (let k = 0; k <= 16; k++) { const [px, py] = at(k / 16), wob = Math.sin(k * 1.3 - t * 0.5) * 0.7; k ? c.lineTo(px, py + wob) : c.moveTo(px, py + wob); }
    c.stroke();
  }
  c.lineCap = 'butt';
  for (let k = 0; k < 6; k++) { const u = ((k / 6 + t * 0.03) % 1), [px, py] = at(u); R(c, px - 0.6, py - 0.6, 1.3, 1.3, k % 2 ? '#F59E0B' : '#D9F99D'); }
  // (where it lands: a splash)
  for (let k = 0; k < 5; k++) { const a = -Math.PI * (k + 0.5) / 5, d = 3 + ((t * 0.3 + k * 2) % 5); ell(c, x1 + Math.cos(a) * d, y1 + Math.sin(a) * d, 1.2, 1.2, '#84CC16'); }
};

/** Satan from the neck down (no head: the flintlock's): his body's own painter with the head clipped off, the stump
 *  pumping. `sit`: sat dazed (else stood, arms flung). */
export const satanHeadless = (c: Ctx, x: number, y: number, ang: number, t: number, sit = true, k = BK) => {
  const cy = -SATAN_H + 40 + (sit ? 34 : 0);
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(-k, k);
  bake(c, `s-headless-${sit ? 1 : 0}`, -100, -200, 200, 210, g => {
    g.save(); g.beginPath(); g.rect(-100, -200, 200, 210); g.ellipse(0, cy - 12, 27, 48, 0, 0, Math.PI * 2); g.clip('evenodd');
    drawSatanBody(g, sit ? 'dazed' : 'dangleHit', 20, false); g.restore();
    ell(g, 0, cy + 30, 11, 5, INK); ell(g, 0, cy + 30, 9.6, 4, BLOOD[2]); ell(g, 0, cy + 30, 6, 2.4, BLOOD[4]); ell(g, 0, cy + 30, 2.6, 1.3, '#F1EADA');
  });
  const pump = Math.abs(Math.sin(t * 0.25));
  for (let j = 0; j < 6; j++) { const u = ((t * 0.05 + j / 6) % 1); ell(c, (j - 2.5) * 5 * u * 2, cy + 28 - u * 60 * (0.5 + pump * 0.5) + u * u * 44, 3.4 - u * 1.4, 4 - u * 1.4, j % 2 ? BLOOD[3] : BLOOD[2]); }
  c.restore();
};
/** His head, off and going (its painting's head, baked): its middle at (x, y), turned, `k` its size. */
export const satanHead = (c: Ctx, x: number, y: number, rot: number, k = BK) => {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(-k, k);
  bake(c, 's-head', -34, -52, 68, 76, g => {
    g.save(); g.beginPath(); g.ellipse(0, -20, 25, 31, 0, 0, Math.PI * 2); g.clip();
    g.translate(0, -44 + 0); const up = satanUpper(); g.drawImage(up, -440 * SATAN_S, -90 * SATAN_S, 880 * SATAN_S, up.height / 2);
    g.save(); g.scale(SATAN_S, SATAN_S); drawSatanFace(g, 20, true); g.restore();
    g.restore();
    ell(g, 0, 9, 9, 3.4, BLOOD[1]); ell(g, 0, 9, 6, 2, BLOOD[3]);
  });
  c.restore();
};
/** Her head, the same (her own head painter). */
export const widowHeadAt = (c: Ctx, x: number, y: number, rot: number, t: number, k = BK, open = true) => {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(-k, k); c.translate(0, 132); drawWidowHead(c, 'idle', t, open); c.restore();
};
