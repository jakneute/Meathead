// Meathead from the front, walking at the camera (in place: the world goes away behind him), his head down over his
// new toy, turning it over in his hands. The walk-away screen's (walkAway.ts). In the picture's own pixels (2x on the
// screen), his feet at the origin, up is -y. His colors are Meathead 1's (render/player/body.ts), each in a stepped
// ramp; lit from the front left, the wreck behind him catching his edges (rim).

import { type Ctx, INK, box, lump, poly, mix, stipple } from './kit';
import { type Arm, armOf, flesh, foreLines, foreRegion, legOf, upperLines, wristband } from './flesh';

export const SKIN = ['#6E3F1C', '#A0662E', '#C68B45', '#E0AC69', '#F5D0A9'];
export const GREEN = ['#3A4A12', '#5C6E1E', '#7E9434', '#A8BC5A', '#D2E08A'];
export const JEANS = ['#0B1438', '#172554', '#1E3A8A', '#2D4FA8', '#4A6CC4'];
export const BOOT = ['#050507', '#18181B', '#27272A', '#3F3F46', '#94A3B8'];
export const BELT = ['#3B1A06', '#5C2A0B', '#78350F', '#9A4A1A', '#B8652E'];
export const GOLD = ['#7C5A05', '#CA8A04', '#FACC15', '#FDE047', '#FEF9C3'];
export const HAIR = ['#050507', '#09090B', '#18181B', '#2A2A30', '#45454D'];
export const BAND = ['#000000', '#09090B', '#1C1C20', '#33333A', '#55555E'];

export interface Pose {
  /** His walk: the step's phase (radians: a step every π). */
  step: number;
  /** The weapon: where its middle is (his frame), its tilt, how far round it's turned (0: side on, π: the other side). */
  wx: number; wy: number; rot: number; turn: number;
  /** His face: grinning, sniffing it, gagging; how green he's gone (0..1); his head tipped (picture px). */
  face: 'grin' | 'smirk' | 'sniff' | 'gag' | 'chuckle' | 'blow' | 'dazed' | 'yell';
  green: number; headY: number;
  /** Pants blown off him (Meathead 2's gut): his legs his own; shitty pants: his jeans stained, the flies. */
  nude: boolean; shat: boolean;
  rim: string;
  t: number;
  /** What he's doing with it (walkAway/acts.ts: each weapon its own business); left out: the toy turned over in both
   *  hands at wx, wy (the crossbow's). */
  hold?: Hold;
}

/** A point in his frame (picture px, his feet at the origin; the walk's bob is added when he's drawn). */
export type Pt = [number, number];

/**
 * His hands and the toy, free: where the toy is and how it's turned, where each fist is (null: hanging at his side,
 * swinging with his stride), where his elbows are (raised for a hand up at his face), and anything drawn round it.
 * His left is the screen's right (he's facing us): the hand he holds things in.
 */
export interface Hold {
  /** The toy: where its own origin goes (its grip, most of them), its tilt, its scale (sx < 0 flips it), and how it's drawn. */
  wx: number; wy: number; rot: number; sx?: number; sy?: number;
  draw: ((c: Ctx, t: number) => void) | null;
  left: Pt | null; right: Pt | null;
  elbowL?: Pt; elbowR?: Pt;
  /** The toy behind his forearms (on his shoulder, down his back), not in his fists. */
  under?: boolean;
  /** His frame, after the toy, before his fists (a hose, a strap); and over everything (smoke, words, sparkle). */
  mid?: (c: Ctx, ty: number) => void;
  over?: (c: Ctx, ty: number) => void;
}

/** Where a fist hangs at his side mid-stride (`side` 1: his left, the screen's right). */
export const hangFist = (side: number, step: number): Pt => {
  const sw = Math.sin(step), swing = side < 0 ? sw : -sw * 0.35;
  return [side * (45 + swing * 1.2), -64 + swing * 3];
};
/** Where the elbows sit with the arms down. */
export const ELBOW_L: Pt = [47, -97], ELBOW_R: Pt = [-47, -97];

/** Where things are on him this frame (his frame): his mouth (for the spit), his crotch (for the censor). */
export interface Marks { mouth: [number, number]; crotch: [number, number, number, number] }

/** The toy's drawn this much bigger than its own frame. */
const TOY = 1.3;

const lerpRamp = (a: string[], b: string[], k: number) => (k <= 0 ? a : a.map((col, i) => mix(col, b[i], k)));

const leg = (c: Ctx, side: number, step: number, bob: number, p: Pose) => {
  const s = Math.sin(step) * side;
  const lift = Math.max(0, -s) * 7, fwd = Math.max(0, s);
  const R = p.nude ? SKIN : JEANS;
  const lx = side * 13 + side * fwd * 0.5, hipY = -74 + bob;
  const bootTop = -15 - lift + fwd * 1.5;
  // The leg (jeans): thigh to ankle, bunched over the boot; one mass (flesh.ts), the thigh's sweep, the knee, the calf
  flesh(c, legOf(lx, hipY, lx - side * 1, bootTop + 3, side, p.nude), R, side > 0 ? p.rim : undefined);
  if (!p.nude) {
    // (the knee, the creases bunched at the ankle, the outer seam)
    const ky = hipY + (bootTop - hipY) * 0.55;
    box(c, lx - 6, ky, 8, 2, R[3]); box(c, lx - 5, ky + 2, 6, 1, R[1]);
    for (let i = 0; i < 3; i++) box(c, lx - 8 + i * 2, bootTop - 4 + i * 2 - 2, 14 - i * 2, 1, R[1]);
    box(c, lx + side * 9, hipY + 4, 1, bootTop - hipY - 6, R[4]);
    if (p.shat) { c.fillStyle = stipple(c, '#5C3A16', 0); c.fillRect(lx - 9, hipY + 2, 18, 14); }
  } else {
    // (hairy)
    for (let i = 0; i < 9; i++) box(c, lx - 7 + ((i * 5) % 13), hipY + 8 + ((i * 11) % (bootTop - hipY - 12)), 1, 2, SKIN[0]);
  }
  // The boot: the shaft, laces, the steel toe toward us (bigger, the nearer it is), the sole
  const bw = 22 + fwd * 3, bx = lx - bw / 2 - side * 0.5, by = bootTop;
  const bh = 15 + fwd * 1.5;
  c.fillStyle = INK; c.beginPath(); c.roundRect(bx - 1, by - 1, bw + 2, bh + 2, 3); c.fill();
  box(c, bx, by, bw, bh, BOOT[1]);
  box(c, bx + 2, by, bw - 4, bh * 0.45, BOOT[2]);
  for (let i = 0; i < 3; i++) box(c, bx + bw / 2 - 3, by + 1 + i * 2, 6, 1, BOOT[3]);
  // (the toe: a dome, lit; the sole under it)
  c.fillStyle = BOOT[2]; c.beginPath(); c.ellipse(bx + bw / 2, by + bh - 4, bw / 2 - 1, 5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = BOOT[3]; c.beginPath(); c.ellipse(bx + bw / 2 - 2, by + bh - 5, bw / 3, 3, 0, 0, Math.PI * 2); c.fill();
  box(c, bx + bw / 2 - 5, by + bh - 7, 3, 1, BOOT[4]);
  box(c, bx - 1, by + bh - 1, bw + 2, 2, INK);
  if (side > 0) box(c, bx + bw - 1, by, 1, bh - 2, p.rim);
};

let turnLayer: HTMLCanvasElement | null = null;

/** His arms' ramps: his right (the screen's left) in the light; his left a step down (in the wreck's light). */
const armRamp = (side: number, S: string[]) => (side < 0 ? S : [S[0], S[1], S[2], S[3], S[3]]);

/** The toy turned over in his hands (the crossbow's): how far round it's turned, and where its grips are (his frame). */
const toyGrips = (p: Pose, bob: number, grip: [[number, number], [number, number]]) => {
  const cs = Math.cos(p.turn);
  const sx = Math.abs(cs) < 0.08 ? 0.08 * Math.sign(cs || 1) : cs;
  const at = ([gx, gy]: [number, number]): Pt => {
    const x = gx * sx * TOY, y = gy * TOY;
    return [p.wx + x * Math.cos(p.rot) - y * Math.sin(p.rot), p.wy + bob + x * Math.sin(p.rot) + y * Math.cos(p.rot)];
  };
  let [a, b] = [at(grip[0]), at(grip[1])];
  // (his left fist the one on the screen's left)
  if (a[0] > b[0]) [a, b] = [b, a];
  return { cs, sx, a, b };
};

/** His arms this frame, shoulder to fist (`ty`: the walk's bob): [the screen's left, the screen's right]. */
const armsOf = (p: Pose, ty: number, grip: [[number, number], [number, number]], walking: boolean): Arm[] => {
  const sw = Math.sin(p.step), h = p.hold;
  const toy = !walking && !h ? toyGrips(p, ty, grip) : null;
  return [-1, 1].map(side => {
    let F: Pt, hint: Pt = [side * 47, -97 + ty];
    if (walking) {
      // (his right arm swings with his left leg; his left, with the weapon in it, hardly at all. Swung toward us: the
      // fist lower)
      const swing = side < 0 ? sw : -sw * 0.35;
      F = [side * (45 + swing * 1.2), -64 + ty + swing * 3];
    } else if (h) {
      const e = (side > 0 ? h.elbowL : h.elbowR) ?? (side > 0 ? ELBOW_L : ELBOW_R);
      const f = (side > 0 ? h.left : h.right) ?? hangFist(side, p.step);
      F = [f[0], f[1] + ty]; hint = [e[0], e[1] + ty];
    } else F = side < 0 ? toy!.a : toy!.b;
    return armOf([side * 44, -128 + ty], F, hint, side);
  });
};

/** A forearm up in front of his face (or of anything drawn after his upper arms): drawn again over it. */
const overHead = (a: Arm, ty: number) =>
  Math.min(a.E[1], a.F[1]) < -134 + ty && (Math.min(Math.abs(a.E[0]), Math.abs(a.F[0])) < 32 || a.E[0] * a.F[0] < 0);

/** The forearms' late pass (after his head): each forearm again where it must be over what's been drawn since (its
 *  region of the same arm: no seam), the wrist wrap. */
const forearms = (c: Ctx, p: Pose, arms: Arm[], ty: number, S: string[], redrawAll = false) => {
  for (const a of arms) {
    if (redrawAll || overHead(a, ty)) {
      const r = armRamp(a.side, S);
      flesh(c, a.mass, r, a.side > 0 ? p.rim : undefined, foreRegion(a), foreLines(a, r, false));
    }
    wristband(c, a, BAND);
  }
};

/** A fist, knuckles toward us. */
const fistAt = (c: Ctx, x: number, y: number, R: string[], rx = 7, ry = 7) => {
  lump(c, x, y, rx, ry, R);
  box(c, x - 5, y - 2, 10, 1, R[1]); box(c, x - 4, y + 1, 8, 1, R[1]); box(c, x - 5, y - 4, 2, 1, R[4]);
};

/** The weapon with his hands on it: his forearms to the grips, the toy in its frame, his fists over it. */
const handsAndToy = (c: Ctx, p: Pose, bob: number, grip: [[number, number], [number, number]], drawWeapon: (c: Ctx, t: number) => void, R: string[], arms: Arm[]) => {
  const { cs, sx } = toyGrips(p, bob, grip);
  forearms(c, p, arms, bob, R);
  // The toy
  c.save(); c.translate(p.wx, p.wy + bob); c.rotate(p.rot); c.scale(sx * TOY, TOY);
  if (cs >= 0 || typeof document === 'undefined') drawWeapon(c, p.t);
  else {
    // (turned: its far side's in its own shade. Shaded on a layer of its own, the toy alone: shading it where it's
    // drawn would darken all that's under the box round it, him and the scene)
    const m = c.getTransform(), cw = c.canvas.width, ch = c.canvas.height;
    if (!turnLayer) turnLayer = document.createElement('canvas');
    if (turnLayer.width !== cw || turnLayer.height !== ch) { turnLayer.width = cw; turnLayer.height = ch; }
    const g = turnLayer.getContext('2d')!;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, cw, ch);
    g.setTransform(m); g.imageSmoothingEnabled = c.imageSmoothingEnabled;
    drawWeapon(g, p.t);
    g.globalCompositeOperation = 'source-atop'; g.globalAlpha = 0.22; g.fillStyle = INK; g.fillRect(-40, -30, 80, 60);
    c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(turnLayer, 0, 0);
  }
  c.restore();
  // Fists, over it
  for (const a of arms) fistAt(c, a.F[0], a.F[1], R, 7, 6);
};

/** The weapon's drawn this much bigger than it is in the game, hanging from his fist (walking, not holding it up). */
const HANG = 2.4;

/**
 * Walking, not admiring it: his arms hanging and swinging against his stride, what he's carrying down by his thigh
 * in his left fist (he's left-handed: from the front, the one on the screen's right), muzzle to the ground.
 */
const swingingArms = (c: Ctx, p: Pose, ty: number, weapon: ((c: Ctx, t: number) => void) | null, R: string[], arms: Arm[]) => {
  const sw = Math.sin(p.step);
  forearms(c, p, arms, ty, R);
  for (const a of arms) {
    const swing = a.side < 0 ? sw : -sw * 0.35;
    const [fx, fy] = a.F;
    if (a.side > 0 && weapon) {
      c.save(); c.translate(fx, fy + 1); c.rotate(Math.PI / 2 - 0.22 - swing * 0.04); c.scale(HANG, -HANG); c.translate(-5, -6);
      weapon(c, p.t);
      c.restore();
    }
    fistAt(c, fx, fy, R, 7 + Math.max(0, swing) * 0.5, 7);
  }
};

/** His arms and the toy as a Hold has them (walkAway/acts.ts). Everything shifted by the walk's bob (`ty`). */
const holdingIt = (c: Ctx, p: Pose, h: Hold, ty: number, R: string[], arms: Arm[]) => {
  const toy = () => {
    if (!h.draw) return;
    c.save(); c.translate(h.wx, h.wy + ty); c.rotate(h.rot); c.scale(h.sx ?? 1, h.sy ?? 1);
    h.draw(c, p.t);
    c.restore();
  };
  // (the toy behind his forearms: his forearms drawn again over it)
  if (h.under) toy();
  forearms(c, p, arms, ty, R, !!h.under && !!h.draw);
  if (!h.under) toy();
  h.mid?.(c, ty);
  // (the fists: knuckles toward us)
  for (const a of arms) fistAt(c, a.F[0], a.F[1], R);
  h.over?.(c, ty);
};

/** `walking`: arms hanging and swinging, `walking.weapon` in his left fist (in place of the toy held up in both). */
export const drawMeatheadFront = (c: Ctx, x: number, y: number, p: Pose, grip: [[number, number], [number, number]], drawWeapon: (c: Ctx, t: number) => void, walking?: { weapon: ((c: Ctx, t: number) => void) | null }): Marks => {
  c.save();
  c.translate(Math.round(x), Math.round(y));
  const step = p.step;
  // (up highest with his legs passing, down on each foot; his shoulders rolling with it)
  const bob = Math.round(-(1 - Math.abs(Math.sin(step))) * 3);
  const roll = Math.sin(step) * 1.2;
  const S = SKIN;
  // His shadow under him (stippled)
  c.fillStyle = stipple(c, '#000000'); c.beginPath(); c.ellipse(0, 0, 40, 6, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(0, 0, 30, 4, 0, 0, Math.PI * 2); c.fill();
  // Legs: the lifted one first (it's behind)
  const order = Math.sin(step) > 0 ? [1, -1] : [-1, 1];
  // (the hips between them: the seat of the jeans, the fly)
  const hipY = -74 + bob;
  const PANTS = p.nude ? S : JEANS;
  for (const side of [order[0]]) leg(c, side, step, bob, p);
  poly(c, [[-26, hipY - 2], [26, hipY - 2], [24, hipY + 16], [0, hipY + 22], [-24, hipY + 16]], PANTS[2]);
  box(c, -26, hipY - 2, 4, 16, PANTS[3]); box(c, 22, hipY - 2, 4, 16, PANTS[1]);
  for (const side of [order[1]]) leg(c, side, step, bob, p);
  const crotch: [number, number, number, number] = [-12, hipY + 2, 24, 22];
  if (p.nude) {
    // (uncensored, the whole hog: swinging with each step, a beat behind it)
    // (the lot swinging side to side with his stride, the balls a beat behind and bouncing on each footfall, each its own way)
    const sw = Math.sin(step - 0.6) * 5, bl = Math.sin(step - 1.2) * 4, bo = Math.abs(Math.cos(step)) * 2;
    c.fillStyle = '#3B2414'; c.beginPath(); c.ellipse(0, hipY + 6, 10, 6, 0, 0, Math.PI * 2); c.fill();
    lump(c, -3 + bl, hipY + 15 + bo, 4, 5, S); lump(c, 3 + bl * 0.8, hipY + 16 + bo * 0.6, 4, 5, S);
    poly(c, [[-2, hipY + 6], [3, hipY + 6], [3 + sw, hipY + 19], [0 + sw, hipY + 22], [-2 + sw, hipY + 19]], S[3]);
    box(c, -1 + sw, hipY + 20, 2, 2, '#D9907A');
  }
  if (!p.nude) {
    box(c, -1, hipY + 2, 1, 16, PANTS[1]); box(c, 1, hipY + 4, 2, 2, GOLD[2]);
    // (the pockets' corners)
    box(c, -22, hipY + 1, 6, 1, PANTS[4]); box(c, 16, hipY + 1, 6, 1, PANTS[4]);
  }
  c.translate(roll * 0.4, 0);
  // (his pants gone, the belt with them: his lower belly where the belt was, the navel, the trail down from it)
  if (p.nude) {
    const by = -88 + bob;
    poly(c, [[-27, by], [27, by], [27, by + 16], [-27, by + 16]], S[2]);
    box(c, -27, by, 3, 16, S[1]); box(c, 24, by, 3, 16, S[1]); box(c, -18, by + 2, 36, 2, S[3]);
    c.fillStyle = S[0]; c.beginPath(); c.ellipse(0, by + 6, 2, 2.5, 0, 0, Math.PI * 2); c.fill();
    for (let y = by + 10; y < by + 16; y += 2) box(c, -1 + ((y >> 1) % 2), y, 1, 1, '#3B2414');
  }
  // The lifting belt (not with his pants gone)
  if (!p.nude) {
    const by = -86 + bob;
    poly(c, [[-28, by], [28, by], [27, by + 12], [-27, by + 12]], BELT[2]);
    box(c, -27, by + 1, 54, 2, BELT[3]); box(c, -27, by + 9, 54, 2, BELT[1]);
    for (let i = -24; i < 24; i += 3) { box(c, i, by + 2, 1, 1, BELT[4]); box(c, i, by + 9, 1, 1, BELT[4]); }
    // (the gold buckle: big, stepped, the prong through it)
    const bx = -9, bby = by - 1;
    box(c, bx - 1, bby - 1, 20, 16, INK);
    box(c, bx, bby, 18, 14, GOLD[2]); box(c, bx, bby, 18, 2, GOLD[4]); box(c, bx, bby, 2, 14, GOLD[3]);
    box(c, bx, bby + 12, 18, 2, GOLD[1]); box(c, bx + 16, bby, 2, 14, GOLD[1]);
    box(c, bx + 4, bby + 4, 10, 6, BELT[1]); box(c, bx + 4, bby + 6, 10, 2, GOLD[0]);
    box(c, bx + 2, bby + 2, 2, 1, '#FFFFFF');
  }
  // The torso: lats flared out from his waist to his armpits, the traps up to his neck
  const ty = bob;
  const torso = [[-25, -84 + ty], [-38, -118 + ty], [-42, -131 + ty], [-30, -141 + ty], [-12, -147 + ty], [12, -147 + ty], [30, -141 + ty], [42, -131 + ty], [38, -118 + ty], [25, -84 + ty]];
  poly(c, torso, S[2]);
  c.save(); c.beginPath(); torso.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.closePath(); c.clip();
  box(c, -44, -150 + ty, 8, 70, S[3]); box(c, -36, -150 + ty, 2, 70, stipple(c, S[3]) as never);
  box(c, 34, -150 + ty, 10, 70, S[1]); box(c, 32, -150 + ty, 2, 70, stipple(c, S[1], 1) as never);
  box(c, 39, -150 + ty, 2, 70, p.rim);
  // (the traps: lit slopes up to the neck)
  c.fillStyle = S[3]; c.beginPath(); c.moveTo(-30, -140 + ty); c.lineTo(-12, -148 + ty); c.lineTo(-10, -140 + ty); c.closePath(); c.fill();
  c.fillStyle = S[1]; c.beginPath(); c.moveTo(30, -140 + ty); c.lineTo(12, -148 + ty); c.lineTo(10, -140 + ty); c.closePath(); c.fill();
  c.restore();
  // Pecs: two slabs, lit across the top, a deep shadow under
  for (const side of [-1, 1]) {
    const px = side * 14, py = -126 + ty;
    c.fillStyle = S[0]; c.beginPath(); c.ellipse(px, py + 4, 16, 8, 0, 0, Math.PI); c.fill();
    lump(c, px, py, 16, 9, side < 0 ? S : [S[0], S[1], S[2], S[3], S[3]], false);
    box(c, px + side * 3, py + 4, 2, 2, '#8A4B2A');
  }
  box(c, -1, -133 + ty, 2, 14, S[1]);
  // Abs: three pairs, each lit along the top and shaded under; the line down the middle; the obliques
  for (let row = 0; row < 3; row++) for (const side of [-1, 1]) {
    const ax = side < 0 ? -15 : 2, ay = -112 + row * 9 + ty;
    box(c, ax, ay, 13, 8, S[2]); box(c, ax, ay, 13, 2, S[3]); box(c, ax, ay + 6, 13, 2, S[1]);
    box(c, ax + (side < 0 ? 0 : 11), ay, 2, 8, side < 0 ? S[3] : S[1]);
  }
  box(c, -1, -113 + ty, 2, 28, S[0]);
  for (const side of [-1, 1]) for (let i = 0; i < 3; i++) box(c, side * (20 + i) - (side > 0 ? 3 : 0), -116 + i * 9 + ty, 3, 1, S[1]);
  // Arms: each one mass (flesh.ts), shoulder to wrist: the deltoid's cap, the biceps and triceps tapering to the elbow,
  // the forearm swelling under it and tapering to the wrist; the veins. The forearms drawn again later where they're
  // over his face or the toy (forearms())
  const arms = armsOf(p, ty, grip, !!walking);
  for (const a of arms) {
    const r = armRamp(a.side, S);
    flesh(c, a.mass, r, a.side > 0 ? p.rim : undefined, undefined, cc => { upperLines(a, r, false)(cc); foreLines(a, r, false)(cc); });
  }
  // The neck: a stump, the cords down it, his jaw's shadow over it
  const hy = ty + p.headY;
  poly(c, [[-12, -140 + ty], [12, -140 + ty], [11, -152 + hy], [-11, -152 + hy]], S[2]);
  box(c, -11, -152 + hy, 22, 3, S[0]); box(c, 6, -150 + hy, 2, 8, S[1]); box(c, -8, -150 + hy, 2, 8, S[3]);
  // The head (tipped down at the toy)
  const H = lerpRamp(S, GREEN, p.green);
  const head = [[-13, -174 + hy], [13, -174 + hy], [14, -158 + hy], [11, -150 + hy], [-11, -150 + hy], [-14, -158 + hy]];
  // (ears)
  lump(c, -15, -163 + hy, 3, 4, H); lump(c, 15, -163 + hy, 3, 4, [H[0], H[1], H[1], H[2], H[2]]);
  poly(c, head, H[2]);
  box(c, -13, -172 + hy, 4, 16, H[3]); box(c, 9, -172 + hy, 4, 18, H[1]); box(c, 12, -170 + hy, 1, 14, p.rim);
  // (the stubble, dithered over his jaw)
  c.fillStyle = stipple(c, mix(H[1], '#3B2414', 0.5)); c.fillRect(-11, -158 + hy, 22, 7);
  // The flat-top: a slab of black, the flat of it lit (we see down onto it, his head tipped), the sides shaved
  box(c, -15, -186 + hy, 30, 14, INK);
  box(c, -14, -185 + hy, 28, 12, HAIR[2]);
  box(c, -14, -185 + hy, 28, 4, HAIR[3]);
  for (let i = 0; i < 12; i++) box(c, -13 + i * 2.3, -185 + hy + (i % 2), 1, 2, HAIR[4]);
  box(c, -14, -175 + hy, 3, 4, stipple(c, HAIR[2]) as never); box(c, 11, -175 + hy, 3, 4, stipple(c, HAIR[2]) as never);
  // The face
  const eyeY = -165 + hy, mouthY = -155 + hy;
  // (the brows: a scowl, always)
  const browDrop = p.face === 'gag' || p.face === 'dazed' ? 1 : 0;
  c.fillStyle = INK;
  c.beginPath(); c.moveTo(-11, eyeY - 4); c.lineTo(-2, eyeY - 1 + browDrop); c.lineTo(-2, eyeY + 1 + browDrop); c.lineTo(-11, eyeY - 2); c.fill();
  c.beginPath(); c.moveTo(11, eyeY - 4); c.lineTo(2, eyeY - 1 + browDrop); c.lineTo(2, eyeY + 1 + browDrop); c.lineTo(11, eyeY - 2); c.fill();
  if (p.face === 'gag') {
    // (squeezed shut)
    box(c, -9, eyeY + 1, 2, 1, INK); box(c, -7, eyeY + 2, 2, 1, INK); box(c, -9, eyeY + 3, 2, 1, INK);
    box(c, 7, eyeY + 1, 2, 1, INK); box(c, 5, eyeY + 2, 2, 1, INK); box(c, 7, eyeY + 3, 2, 1, INK);
  } else if (p.face === 'dazed') {
    // (bonked: cross-eyed, the pupils in at his nose, one of them wandering)
    for (const ex of [-7, 4]) { box(c, ex, eyeY, 4, 3, '#F5F5F4'); box(c, ex - 1, eyeY - 1, 6, 1, H[0]); }
    box(c, -4, eyeY + 1, 1, 2, INK); box(c, 4 + (Math.floor(p.t / 8) % 2), eyeY + 1, 1, 2, INK);
  } else {
    // (looking down at it: heavy lids, the pupils low)
    for (const ex of [-7, 4]) { box(c, ex, eyeY + 1, 4, 2, '#F5F5F4'); box(c, ex + 1, eyeY + 2, 2, 1, INK); box(c, ex - 1, eyeY, 6, 1, H[0]); }
  }
  // (the nose: its shade down the right, the nostrils: flared, sniffing)
  box(c, -1, eyeY + 2, 3, 6, H[3]); box(c, 2, eyeY + 2, 1, 6, H[1]);
  const flare = p.face === 'sniff' ? 1 + (Math.floor(p.t / 6) % 2) : 0;
  box(c, -3 - flare, eyeY + 7, 2 + flare, 1 + (flare ? 1 : 0), H[0]); box(c, 2, eyeY + 7, 2 + flare, 1 + (flare ? 1 : 0), H[0]);
  // (the mouth)
  if (p.face === 'gag') {
    lump(c, -8, mouthY, 4, 3, H, false); lump(c, 8, mouthY, 4, 3, H, false);
    box(c, -2, mouthY - 1, 4, 3, INK); box(c, -1, mouthY, 2, 1, '#7F1D1D');
  } else if (p.face === 'sniff') {
    box(c, -4, mouthY, 8, 1, INK);
  } else if (p.face === 'blow') {
    // (lips pushed out in a little O, the cheeks puffed)
    lump(c, -9, mouthY - 2, 3, 3, H, false); lump(c, 9, mouthY - 2, 3, 3, H, false);
    box(c, -3, mouthY - 2, 6, 5, INK); box(c, -2, mouthY - 1, 4, 3, '#B45309'); box(c, -1, mouthY, 2, 1, INK);
  } else if (p.face === 'yell') {
    // (wide open, bellowing: the teeth, the tongue, the back of his throat)
    box(c, -6, mouthY - 2, 13, 8, INK); box(c, -5, mouthY - 1, 11, 2, '#F5F5F4'); box(c, -4, mouthY + 1, 9, 3, '#7F1D1D'); box(c, -2, mouthY + 3, 5, 2, '#E11D48'); box(c, -5, mouthY + 5, 11, 1, '#F5F5F4');
  } else if (p.face === 'dazed') {
    // (a dopey grin, the tongue out the side)
    box(c, -6, mouthY, 13, 2, INK); box(c, -5, mouthY + 1, 10, 1, '#F5F5F4'); box(c, 3, mouthY + 2, 3, 3, '#E11D48'); box(c, 4, mouthY + 2, 1, 2, '#FDA4AF');
  } else {
    // (a grin: crooked, up on his left; teeth; the chuckle opens it)
    const open = p.face === 'chuckle' ? 1 + (Math.floor(p.t / 5) % 2) : p.face === 'grin' ? 1 : 0;
    box(c, -6, mouthY, 13, 1 + open + 1, INK);
    box(c, -5, mouthY + 1, 11, open, '#F5F5F4');
    if (open > 1) box(c, -3, mouthY + 2, 7, 1, '#7F1D1D');
    box(c, 6, mouthY - 2, 2, 2, INK); box(c, -7, mouthY + 1, 1, 1, INK);
  }
  // (his glasses: the thick black rims round his eyes, the brow bar heavy, the bridge over his nose, the arms back to his
  // ears; the glass a cold tint, a streak of light up its left; drawn here, behind whatever his hands hold up to his face)
  // (the arms: from the rims' outer corners back along his temples, rising to the roots of his ears and in behind
  // them, each ear's rim over its end, a crease of shadow where it goes under)
  box(c, -14, eyeY - 2, 4, 2, INK); box(c, 10, eyeY - 2, 4, 2, INK); box(c, -13, eyeY - 2, 3, 1, BAND[3]); box(c, 10, eyeY - 2, 3, 1, BAND[2]);
  box(c, -16, eyeY - 1, 2, 1, H[0]); box(c, 14, eyeY - 1, 2, 1, H[0]); box(c, -17, eyeY, 1, 1, H[1]); box(c, 16, eyeY, 1, 1, H[0]);
  for (const rx of [-11, 1]) {
    c.fillStyle = 'rgba(190, 220, 248, 0.24)'; c.fillRect(rx + 1, eyeY - 1, 8, 6);
    box(c, rx + 2, eyeY + 2, 1, 1, '#F8FAFC'); box(c, rx + 3, eyeY + 1, 1, 1, '#F8FAFC'); box(c, rx + 4, eyeY, 1, 1, 'rgba(248, 250, 252, 0.6)');
    box(c, rx, eyeY - 3, 10, 2, INK); box(c, rx, eyeY - 1, 1, 7, INK); box(c, rx + 9, eyeY - 1, 1, 7, INK); box(c, rx, eyeY + 5, 10, 1, INK);
    box(c, rx + 1, eyeY - 3, 7, 1, BAND[3]); box(c, rx + 1, eyeY - 3, 2, 1, BAND[4]);
  }
  box(c, -1, eyeY, 2, 1, INK);
  // His forearms, the toy, his fists: last, in front of everything (his head too: up at his nose, it's in front of his
  // face; held at his chest, nothing's in its way)
  if (walking) swingingArms(c, p, ty, walking.weapon, S, arms);
  else if (p.hold) holdingIt(c, p, p.hold, ty, S, arms);
  else handsAndToy(c, p, ty, grip, drawWeapon, S, arms);
  c.restore();
  return { mouth: [x + 0, y + mouthY + 1], crotch: [x + crotch[0], y + crotch[1], crotch[2], crotch[3]] };
};

