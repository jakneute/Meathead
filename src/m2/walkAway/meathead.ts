// Meathead from the front, walking at the camera (in place: the world goes away behind him), his head down over his
// new toy, turning it over in his hands. The walk-away screen's (walkAway.ts). In the picture's own pixels (2x on the
// screen), his feet at the origin, up is -y. His colors are Meathead 1's (render/player/body.ts), each in a stepped
// ramp; lit from the front left, the wreck behind him catching his edges (rim).

import { type Ctx, INK, box, lump, poly, mix, stipple } from './kit';

const SKIN = ['#6E3F1C', '#A0662E', '#C68B45', '#E0AC69', '#F5D0A9'];
const GREEN = ['#3A4A12', '#5C6E1E', '#7E9434', '#A8BC5A', '#D2E08A'];
const JEANS = ['#0B1438', '#172554', '#1E3A8A', '#2D4FA8', '#4A6CC4'];
const BOOT = ['#050507', '#18181B', '#27272A', '#3F3F46', '#94A3B8'];
const BELT = ['#3B1A06', '#5C2A0B', '#78350F', '#9A4A1A', '#B8652E'];
const GOLD = ['#7C5A05', '#CA8A04', '#FACC15', '#FDE047', '#FEF9C3'];
const HAIR = ['#050507', '#09090B', '#18181B', '#2A2A30', '#45454D'];
const BAND = ['#000000', '#09090B', '#1C1C20', '#33333A', '#55555E'];

export interface Pose {
  /** His walk: the step's phase (radians: a step every π). */
  step: number;
  /** The weapon: where its middle is (his frame), its tilt, how far round it's turned (0: side on, π: the other side). */
  wx: number; wy: number; rot: number; turn: number;
  /** His face: grinning, sniffing it, gagging; how green he's gone (0..1); his head tipped (picture px). */
  face: 'grin' | 'smirk' | 'sniff' | 'gag' | 'chuckle';
  green: number; headY: number;
  /** Pants blown off him (Meathead 2's gut): his legs his own; shitty pants: his jeans stained, the flies. */
  nude: boolean; shat: boolean;
  rim: string;
  t: number;
}

/** Where things are on him this frame (his frame): his mouth (for the spit), his crotch (for the censor). */
export interface Marks { mouth: [number, number]; crotch: [number, number, number, number] }

/** The toy's drawn this much bigger than its own frame. */
const TOY = 1.3;

const lerpRamp = (a: string[], b: string[], k: number) => (k <= 0 ? a : a.map((col, i) => mix(col, b[i], k)));

/** A tapered limb (a leg, a forearm): from (x0, y0) w0 wide to (x1, y1) w1 wide; lit down its left, shaded down its right. */
const limb = (c: Ctx, x0: number, y0: number, w0: number, x1: number, y1: number, w1: number, r: string[], rim?: string) => {
  const pts = [[x0 - w0 / 2, y0], [x0 + w0 / 2, y0], [x1 + w1 / 2, y1], [x1 - w1 / 2, y1]];
  poly(c, pts, r[2]);
  // (lit along the left, shaded along the right, a stepped edge each)
  c.save(); c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
  const n = 8;
  for (let i = 0; i < n; i++) {
    const k = i / n, xa = x0 + (x1 - x0) * k, ya = y0 + (y1 - y0) * k, wa = w0 + (w1 - w0) * k;
    const h = Math.abs(y1 - y0) / n + 1;
    box(c, xa - wa / 2, ya, 3, h, r[3]); box(c, xa - wa / 2 + 3, ya, 1, h, stipple(c, r[3]) as never);
    box(c, xa + wa / 2 - 3, ya, 3, h, r[1]); box(c, xa + wa / 2 - 4, ya, 1, h, stipple(c, r[1], 1) as never);
    if (rim) box(c, xa + wa / 2 - 1, ya, 1, h, rim);
  }
  c.restore();
};

const leg = (c: Ctx, side: number, step: number, bob: number, p: Pose) => {
  const s = Math.sin(step) * side;
  const lift = Math.max(0, -s) * 7, fwd = Math.max(0, s);
  const R = p.nude ? SKIN : JEANS;
  const lx = side * 13 + side * fwd * 0.5, hipY = -74 + bob;
  const bootTop = -15 - lift + fwd * 1.5;
  // The leg (jeans): thigh to ankle, bunched over the boot
  limb(c, lx, hipY, 25, lx - side * 1, bootTop + 3, 20, R, side > 0 ? p.rim : undefined);
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

/** The weapon with his hands on it: drawn in its frame, the grips found, his forearms to them, his fists over it. */
const handsAndToy = (c: Ctx, p: Pose, bob: number, grip: [[number, number], [number, number]], drawWeapon: (c: Ctx, t: number) => void, R: string[]) => {
  const cs = Math.cos(p.turn);
  const sx = Math.abs(cs) < 0.08 ? 0.08 * Math.sign(cs || 1) : cs;
  const at = ([gx, gy]: [number, number]) => {
    const x = gx * sx * TOY, y = gy * TOY;
    return [p.wx + x * Math.cos(p.rot) - y * Math.sin(p.rot), p.wy + bob + x * Math.sin(p.rot) + y * Math.cos(p.rot)] as const;
  };
  let [a, b] = [at(grip[0]), at(grip[1])];
  // (his left fist the one on the screen's left)
  if (a[0] > b[0]) [a, b] = [b, a];
  const elbowL = [-47, -97 + bob] as const, elbowR = [47, -97 + bob] as const;
  const FORE = [R[0], R[0], R[1], R[2], R[3]];
  // Forearms (behind the toy): elbow to fist, the wristband by the fist
  for (const [e, h, side] of [[elbowL, a, -1], [elbowR, b, 1]] as const) {
    limb(c, e[0], e[1], 14, h[0] - side * 2, h[1] + 2, 11, FORE, side > 0 ? p.rim : undefined);
    // (the elbow's point, the muscle down the top of it)
    lump(c, e[0], e[1], 6, 5, FORE);
    const k = 0.78, wx = e[0] + (h[0] - e[0]) * k, wy = e[1] + (h[1] - e[1]) * k;
    c.fillStyle = INK; c.beginPath(); c.ellipse(wx, wy, 7, 5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = BAND[2]; c.beginPath(); c.ellipse(wx, wy, 6, 4, 0, 0, Math.PI * 2); c.fill();
    box(c, wx - 4, wy - 3, 5, 1, BAND[4]);
  }
  // The toy
  c.save(); c.translate(p.wx, p.wy + bob); c.rotate(p.rot); c.scale(sx * TOY, TOY);
  drawWeapon(c, p.t);
  // (turned: its far side's in its own shade)
  if (cs < 0) { c.globalCompositeOperation = 'source-atop'; c.globalAlpha = 0.22; c.fillStyle = INK; c.fillRect(-40, -30, 80, 60); }
  c.restore();
  // Fists, over it
  for (const h of [a, b]) {
    lump(c, h[0], h[1], 7, 6, R);
    box(c, h[0] - 5, h[1] - 2, 10, 1, R[1]); box(c, h[0] - 4, h[1] + 1, 8, 1, R[1]);
    box(c, h[0] - 5, h[1] - 4, 2, 1, R[4]);
  }
};

export const drawMeatheadFront = (c: Ctx, x: number, y: number, p: Pose, grip: [[number, number], [number, number]], drawWeapon: (c: Ctx, t: number) => void): Marks => {
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
  // Shoulders: delts, big round caps; biceps hanging under them out to his elbows
  for (const side of [-1, 1]) {
    const r = side < 0 ? S : [S[0], S[1], S[2], S[2], S[3]];
    // (the upper arm, shoulder to elbow; the bicep bulging on its inside, the tricep's shade on its outside)
    limb(c, side * 44, -132 + ty, 20, side * 47, -97 + ty, 14, r, side > 0 ? p.rim : undefined);
    lump(c, side * 42, -113 + ty, 7, 10, r, false);
    box(c, side * 42 - 3, -106 + ty, 6, 1, r[1]);
    lump(c, side * 43, -131 + ty, 12, 10, r);
    box(c, side * 43 - 6, -124 + ty, 12, 1, r[1]);
    if (side > 0) { c.strokeStyle = p.rim; c.lineWidth = 1; c.beginPath(); c.ellipse(side * 43, -131 + ty, 11, 10, 0, -Math.PI / 2.4, Math.PI / 2.4); c.stroke(); c.beginPath(); c.ellipse(45, -114 + ty, 9, 14, 0, -Math.PI / 3, Math.PI / 3); c.stroke(); }
    // (a vein down the bicep)
    box(c, side * 47, -120 + ty, 1, 6, '#C2410C'); box(c, side * 46, -114 + ty, 1, 5, '#C2410C');
  }
  // His forearms, the toy, his fists
  handsAndToy(c, p, ty, grip, drawWeapon, S);
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
  const browDrop = p.face === 'gag' ? 1 : 0;
  c.fillStyle = INK;
  c.beginPath(); c.moveTo(-11, eyeY - 4); c.lineTo(-2, eyeY - 1 + browDrop); c.lineTo(-2, eyeY + 1 + browDrop); c.lineTo(-11, eyeY - 2); c.fill();
  c.beginPath(); c.moveTo(11, eyeY - 4); c.lineTo(2, eyeY - 1 + browDrop); c.lineTo(2, eyeY + 1 + browDrop); c.lineTo(11, eyeY - 2); c.fill();
  if (p.face === 'gag') {
    // (squeezed shut)
    box(c, -9, eyeY + 1, 2, 1, INK); box(c, -7, eyeY + 2, 2, 1, INK); box(c, -9, eyeY + 3, 2, 1, INK);
    box(c, 7, eyeY + 1, 2, 1, INK); box(c, 5, eyeY + 2, 2, 1, INK); box(c, 7, eyeY + 3, 2, 1, INK);
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
  } else {
    // (a grin: crooked, up on his left; teeth; the chuckle opens it)
    const open = p.face === 'chuckle' ? 1 + (Math.floor(p.t / 5) % 2) : p.face === 'grin' ? 1 : 0;
    box(c, -6, mouthY, 13, 1 + open + 1, INK);
    box(c, -5, mouthY + 1, 11, open, '#F5F5F4');
    if (open > 1) box(c, -3, mouthY + 2, 7, 1, '#7F1D1D');
    box(c, 6, mouthY - 2, 2, 2, INK); box(c, -7, mouthY + 1, 1, 1, INK);
  }
  c.restore();
  return { mouth: [x + 0, y + mouthY + 1], crotch: [x + crotch[0], y + crotch[1], crotch[2], crotch[3]] };
};

