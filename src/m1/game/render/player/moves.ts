// Meathead's special-move poses: the shoulder charge, the uppercut and the
// divekick, each drawn as its own full-body pose with effects (like the slide
// tackle). Drawn in his local frame: (0,0) is between his feet, facing +x.

// Palette (matches player.ts)
const BELT = '#78350F';
const BUCKLE = '#FACC15';

import { glowLayer } from './spriteOutline';
import { chunky, ditherFill, drawFireball } from '../fx/fireball';
import { steppedGlow } from '../pixelArt';
import { drawLeg, drawArmTo, drawTorsoFromHips, drawHead, drawRamDelt, Mood } from './body';

type Ctx = CanvasRenderingContext2D;

/** The animation frame being drawn (for the chin drip and sweat on his head). */
let frameNow = 0;

// ---------------------------------------------------------------------------
// Body parts
// ---------------------------------------------------------------------------

const limb = (ctx: Ctx, x1: number, y1: number, x2: number, y2: number, width: number, color: string) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};

/** A leg from hip through knee to foot, with a combat boot pointing along `toeAngle` (the same leg as standing). */
const leg = (ctx: Ctx, hip: [number, number], knee: [number, number], foot: [number, number], toeAngle: number, back: boolean) => drawLeg(ctx, hip, knee, foot, toeAngle, back);

/** The knee for a hip and a foot, `thigh` and `shin` long, bent forward (+x): the leg folds the way a leg does. */
const kneeFor = (hip: [number, number], foot: [number, number], thigh = 12, shin = 12): [number, number] => {
  let dx = foot[0] - hip[0], dy = foot[1] - hip[1];
  const d = Math.hypot(dx, dy) || 1;
  dx /= d; dy /= d;
  const reach = Math.min(thigh + shin - 0.05, d);
  const along = (thigh * thigh - shin * shin + reach * reach) / (2 * reach), out = Math.sqrt(Math.max(0, thigh * thigh - along * along));
  return [hip[0] + dx * along + dy * out, hip[1] + dy * along - dx * out];
};

/** A point along a cubic curve, `t` 0..1. */
const bez = (t: number, a: [number, number], b: [number, number], c: [number, number], d: [number, number]): [number, number] => {
  const u = 1 - t;
  return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]];
};

/**
 * One leg of a flat-out sprint, `u` 0..1 round its stride: the boot strikes the ground under him and drives back hard,
 * the heel peeling up as the toe shoves off way behind; then the heel whips up under his backside, the knee punches
 * forward and up, and the boot claws down for the ground again. Feet on the ground at `ground` (his feet's level).
 */
export const sprintLeg = (ctx: Ctx, hip: [number, number], u: number, back: boolean, ground = -3.5) => {
  let foot: [number, number], toe: number;
  if (u < 0.4) {
    const k = u / 0.4, peel = Math.max(0, (k - 0.6) / 0.4);
    foot = [hip[0] + 7 - k * 25, ground - peel * peel * 5];
    toe = -0.15 * Math.max(0, 1 - k / 0.15) + peel * 0.9;
  } else {
    const k = (u - 0.4) / 0.6;
    foot = bez(k, [hip[0] - 18, ground - 5], [hip[0] - 24, ground - 24], [hip[0] + 26, ground - 22], [hip[0] + 7, ground]);
    toe = 0.9 * (1 - k) + (k > 0.6 ? -0.2 * (k - 0.6) / 0.4 : 0) + Math.sin(Math.PI * k) * 0.3;
  }
  leg(ctx, hip, kneeFor(hip, foot), foot, toe, back);
};

/** An arm from shoulder through elbow to a fist, with the spiked wristband (the same arm as standing). */
const arm = (ctx: Ctx, shoulder: [number, number], elbow: [number, number], fist: [number, number], back: boolean, fistSize = 5.5) => drawArmTo(ctx, shoulder, elbow, fist, back, fistSize);

/** Torso from the hips (0,0) up to the shoulders (y = -26): the same pecs, abs and belt as standing. */
const torso = (ctx: Ctx) => drawTorsoFromHips(ctx);

/** Meathead's head centred on (hx, hy): the same head as standing. */
const head = (ctx: Ctx, hx: number, hy: number, mouth: Mood) => drawHead(ctx, hx, hy, mouth, frameNow);

/** Faded, tinted copies of a pose trailing behind it. */
const ghosts = (ctx: Ctx, count: number, offset: (k: number) => [number, number], tint: string, draw: (k: number) => void) => {
  for (let k = count; k >= 1; k--) {
    ctx.save();
    const [dx, dy] = offset(k);
    ctx.translate(dx, dy);
    ctx.globalAlpha *= 0.22 / k;
    ctx.filter = tint;
    draw(k);
    ctx.restore();
  }
};

// ---------------------------------------------------------------------------
// On the jet ski: his specials are the ski's, and so are the poses (the ski's
// drawn under him by the stage, tipped the same way)
// ---------------------------------------------------------------------------

/** The wheelie: nose up, leaning way back on the seat, one hand hauling on the bars, the other fist pumping at the sky. */
export const drawJetskiWheelie = (ctx: Ctx, frame: number) => {
  frameNow = frame;
  ctx.save();
  ctx.rotate(-0.42);
  // Braced in the footwell
  leg(ctx, [-4, -24], [12, -29], [17, -10], 0.2, true);
  leg(ctx, [4, -24], [19, -27], [23, -8], 0.2, false);
  ctx.save();
  ctx.translate(-2, -24);
  ctx.rotate(-0.35);
  arm(ctx, [-9, -22], [8, -19], [26, -10], true);
  torso(ctx);
  ctx.save(); ctx.translate(-2, -37); ctx.rotate(-0.2); head(ctx, 0, 0, 'roar'); ctx.restore();
  const pump = Math.sin(frame * 0.6) * 4;
  arm(ctx, [11, -22], [20, -38 + pump * 0.5], [15, -55 + pump], false, 6.5);
  ctx.restore();
  ctx.restore();
};

/** Up out of the water: stood up on the seat, one arm out for balance, the other fist driving straight up. */
export const drawJetskiLeap = (ctx: Ctx, frame: number) => {
  frameNow = frame;
  // Spray streaming off below
  ctx.strokeStyle = 'rgba(224, 242, 254, 0.75)';
  ctx.lineWidth = 2;
  for (let s = 0; s < 6; s++) {
    const x = -18 + s * 7, y = 6 + ((frame * 9 + s * 11) % 34);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 2, y + 14 + (s % 2) * 8); ctx.stroke();
  }
  ctx.save();
  ctx.rotate(-0.3);
  leg(ctx, [-3, -30], [-4, -16], [-2, -2], 0.1, true);
  leg(ctx, [5, -30], [11, -17], [9, -3], 0.1, false);
  ctx.save();
  ctx.translate(0, -30);
  ctx.rotate(-0.08);
  // Off arm flung out behind for balance, like he's surfing it
  arm(ctx, [-9, -22], [-22, -26], [-33, -20], true);
  torso(ctx);
  ctx.save(); ctx.translate(-3, -37); ctx.rotate(-0.35); head(ctx, 0, 0, 'roar'); ctx.restore();
  const fist: [number, number] = [14, -66];
  const g = glowLayer(ctx);
  const glow = g.createRadialGradient(fist[0], fist[1], 2, fist[0], fist[1], 28);
  glow.addColorStop(0, 'rgba(255, 255, 255, 0.95)'); glow.addColorStop(0.3, 'rgba(56, 189, 248, 0.6)'); glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
  g.fillStyle = glow; g.beginPath(); g.arc(fist[0], fist[1], 28, 0, Math.PI * 2); g.fill();
  arm(ctx, [11, -22], [16, -44], fist, false, 7.5);
  ctx.restore();
  ctx.restore();
};

/** Driving it down nose first: tucked low over the bars, both hands on, knees on the seat, teeth gritted. */
export const drawJetskiDive = (ctx: Ctx, frame: number) => {
  frameNow = frame;
  // Air tearing past above him
  ctx.strokeStyle = 'rgba(241, 245, 249, 0.6)';
  ctx.lineWidth = 2;
  for (let s = 0; s < 5; s++) {
    const x = -30 + s * 9, y = -80 - ((frame * 10 + s * 13) % 40);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 6, y - 16); ctx.stroke();
  }
  ctx.save();
  ctx.rotate(0.5);
  leg(ctx, [-6, -20], [8, -20], [-2, -8], -0.3, true);
  leg(ctx, [2, -20], [16, -19], [6, -7], -0.3, false);
  ctx.save();
  ctx.translate(-4, -20);
  ctx.rotate(0.7);
  arm(ctx, [-9, -22], [3, -30], [16, -32], true);
  torso(ctx);
  ctx.save(); ctx.translate(4, -34); ctx.rotate(0.3); head(ctx, 0, 0, 'grit'); ctx.restore();
  arm(ctx, [11, -22], [19, -30], [21, -34], false);
  ctx.restore();
  ctx.restore();
};

// ---------------------------------------------------------------------------
// The standing kick (booting somebody off whatever he's about to steal)
// ---------------------------------------------------------------------------

/**
 * A big front kick from a standing start: the knee comes up, then the leg shoots out straight, boot sole first,
 * leaning way back on the planted leg, one arm flung back for balance. `k` runs 0..1 through it.
 */
export const drawStandingKick = (ctx: Ctx, frame: number, k: number) => {
  frameNow = frame;
  const out = Math.min(1, Math.max(0, (k - 0.2) / 0.2));
  const lean = -0.1 - out * 0.3;
  // Planted leg, knee soft
  leg(ctx, [-4, -26], [-7, -13], [-8, 0], 0, true);
  // Kicking leg: chambered, then driven straight out
  const knee: [number, number] = [16 + out * 6, -36 + out * 6];
  const foot: [number, number] = [14 + out * 26, -20 - out * 12];
  leg(ctx, [5, -26], knee, foot, -0.4 - out * 1.1, false);
  // Impact lines off the sole as it lands
  if (out > 0.6 && k < 0.8) {
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.9)'; ctx.lineWidth = 2;
    for (let s = 0; s < 5; s++) {
      const a = -0.9 + s * 0.45, r0 = 10, r1 = 20 + (s % 2) * 6;
      ctx.beginPath(); ctx.moveTo(foot[0] + 12 + Math.cos(a) * r0, foot[1] + Math.sin(a) * r0); ctx.lineTo(foot[0] + 12 + Math.cos(a) * r1, foot[1] + Math.sin(a) * r1); ctx.stroke();
    }
  }
  ctx.save();
  ctx.translate(-4, -26);
  ctx.rotate(lean);
  // Back arm flung out behind for balance
  arm(ctx, [-9, -22], [-20, -30 + out * 4], [-30, -24 + out * 6], true);
  torso(ctx);
  ctx.save(); ctx.translate(2, -37); ctx.rotate(-0.1); head(ctx, 0, 0, out > 0.3 ? 'roar' : 'grit'); ctx.restore();
  // Front arm: fist cocked tight at the chest
  arm(ctx, [11, -22], [18, -12], [8, -14], false);
  ctx.restore();
};

// ---------------------------------------------------------------------------
// The gunslinger (Meathead 2's showdown duel: squared up, waiting on the DRAW)
// ---------------------------------------------------------------------------

/**
 * Squared up for a duel: feet planted wide, knees soft, leaning in a touch; his gun tucked in his belt at his front
 * hip, barrel down, and his gun hand hovering over it, fingers twitching; the other arm loose, a scowl. `gun` paints
 * the held weapon in its own frame (the grip at the origin, the barrel along +x). He fires: the pose is over (the
 * player's own shooting pose takes it).
 */
export const drawGunslinger = (ctx: Ctx, frame: number, gun: (c: Ctx) => void) => {
  frameNow = frame;
  const twitch = Math.sin(frame * 0.9) > 0.7 ? 1 : 0, sway = Math.sin(frame * 0.05) * 0.6;
  leg(ctx, [-5, -26], [-11, -13], [-15, 0], 0, true);
  leg(ctx, [5, -26], [12, -13], [15, 0], 0, false);
  ctx.save();
  ctx.translate(-1, -26 + Math.abs(sway) * 0.3);
  ctx.rotate(0.06);
  // Back arm hanging loose, a little out from him
  arm(ctx, [-9, -22], [-14, -11], [-15, 0 + sway], true);
  torso(ctx);
  // The gun in his belt at the front hip, barrel down and forward
  ctx.save(); ctx.translate(11, -1); ctx.rotate(1.25); ctx.scale(0.85, 0.85); gun(ctx); ctx.restore();
  ctx.save(); ctx.translate(2, -37); ctx.rotate(0.04); head(ctx, 0, 0, 'scowl'); ctx.restore();
  // Gun hand: down by the hip, hovering over the grip, fingers twitching
  arm(ctx, [11, -22], [18, -12], [17 + twitch, -4 - twitch], false, 5);
  ctx.restore();
};

// ---------------------------------------------------------------------------
// Dropping down through a ledge
// ---------------------------------------------------------------------------

/**
 * Down through the floor like it's a trapdoor: a quick scrunch, then arms straight up over his head, legs together and
 * toes pointed, eyes wide, air rushing up past him. `k` runs 0..1 through it.
 */
export const drawLedgeDrop = (ctx: Ctx, frame: number, k: number) => {
  frameNow = frame;
  // (the first moment: knees bent, arms coming up; then stretched out long)
  const tuck = Math.max(0, 1 - k / 0.15);
  // Air rushing up past him
  ctx.strokeStyle = 'rgba(241, 245, 249, 0.6)';
  ctx.lineWidth = 2;
  for (let s = 0; s < 4; s++) {
    const x = -20 + s * 13, y = -70 - ((frame * 8 + s * 15) % 36);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 12 - (s % 2) * 6); ctx.stroke();
  }
  const wob = Math.sin(frame * 0.7) * 1.5;
  // Legs together, toes pointed down (knees bent at first)
  leg(ctx, [-4, -26], [-3 + tuck * 8, -13 - tuck * 4], [-3, 0 - tuck * 6], 1.2, true);
  leg(ctx, [4, -26], [5 + tuck * 8, -13 - tuck * 4], [4, 1 - tuck * 6], 1.3, false);
  ctx.save();
  ctx.translate(0, -26);
  // Back arm straight up, flailing a little
  const up = 1 - tuck;
  arm(ctx, [-9, -22], [-12 - wob, -36 - up * 6], [-11 - wob * 2, -48 - up * 10], true);
  torso(ctx);
  ctx.save(); ctx.translate(1, -37); ctx.rotate(0.05); head(ctx, 0, 0, 'roar'); ctx.restore();
  // Front arm straight up too (the gun hand, empty for the drop)
  arm(ctx, [11, -22], [13 + wob, -37 - up * 6], [12 + wob * 2, -49 - up * 10], false);
  ctx.restore();
};

// ---------------------------------------------------------------------------
// Shoulder charge
// ---------------------------------------------------------------------------

/** Head down, leading shoulder blazing, legs driving: a battering ram of beef. */
export const drawShoulderCharge = (ctx: Ctx, frame: number) => {
  frameNow = frame;
  // Speed lines streaming past
  ctx.strokeStyle = 'rgba(253, 224, 71, 0.7)';
  ctx.lineWidth = 2;
  for (let s = 0; s < 5; s++) {
    const y = -58 + s * 12;
    const x = -30 - ((frame * 9 + s * 17) % 40);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 26 - (s % 2) * 10, y); ctx.stroke();
  }
  // Dust kicked up behind
  for (let i = 0; i < 4; i++) {
    const d = (frame * 3 + i * 11) % 36;
    ctx.fillStyle = `rgba(190, 175, 150, ${0.5 - d / 80})`;
    ctx.beginPath(); ctx.arc(-22 - d, -3 - (i % 2) * 4 - d * 0.1, 4 + d * 0.15, 0, Math.PI * 2); ctx.fill();
  }
  ghosts(ctx, 2, k => [-k * 15, 0], 'sepia(1) saturate(6) hue-rotate(-25deg) brightness(1.1)', k => chargeBody(ctx, frame - k * 3, false));
  chargeBody(ctx, frame, true);
};

const chargeBody = (ctx: Ctx, frame: number, main: boolean) => {
  // Legs pumping in a sprint: one driving off the ground while the other comes through knee-high (a stride every
  // half-turn); low as each boot hits and takes him, up off the toe as it shoves him on
  const u = ((frame * 0.55) / (Math.PI * 2)) % 1;
  const hipY = -24 + Math.abs(Math.cos((u * 2 - 0.12) * Math.PI)) * -1.8 + 1.2;
  sprintLeg(ctx, [-4, hipY], (u + 0.5) % 1, true);
  sprintLeg(ctx, [4, hipY], u, false);

  ctx.save();
  // Torso bent forward like a ram
  ctx.translate(0, hipY);
  ctx.rotate(0.55);
  // Back arm swinging behind
  arm(ctx, [-8, -22], [-20, -10], [-27, -1], true);
  torso(ctx);
  // Head tucked down behind the shoulder, eyes forward
  ctx.save();
  ctx.translate(9, -33);
  ctx.rotate(-0.4);
  head(ctx, 0, 0, 'scowl');
  ctx.restore();
  // Lead arm braced across the chest under the shoulder
  arm(ctx, [10, -20], [15, -9], [5, -8], false);
  // The shoulder itself: a huge delt, glowing hot
  if (main) {
    const g = glowLayer(ctx);
    const glow = g.createRadialGradient(14, -22, 2, 14, -22, 26);
    glow.addColorStop(0, 'rgba(255, 220, 90, 0.9)');
    glow.addColorStop(0.4, 'rgba(255, 110, 20, 0.45)');
    glow.addColorStop(1, 'rgba(255, 60, 0, 0)');
    g.fillStyle = glow;
    g.beginPath(); g.arc(14, -22, 26, 0, Math.PI * 2); g.fill();
  }
  drawRamDelt(ctx, 14, -22, 10);
  ctx.restore();

  if (!main) return;
  // Shockwave rings of air bursting off the shoulder, out in front
  for (let k = 0; k < 3; k++) {
    const t = ((frame * 2 + k * 7) % 21) / 21;
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.75 * (1 - t)})`;
    ctx.lineWidth = 2.5 - t;
    ctx.beginPath();
    ctx.arc(24 + t * 22, -42, 10 + t * 14, -1.1, 1.1);
    ctx.stroke();
  }
};

// ---------------------------------------------------------------------------
// Shoulder charge underwater: a torpedo
// ---------------------------------------------------------------------------

/** Laid out flat, fists out in front, legs together dolphin-kicking, a trail of bubbles. */
export const drawSwimCharge = (ctx: Ctx, frame: number) => {
  frameNow = frame;
  // Bubbles streaming off behind him
  for (let i = 0; i < 7; i++) {
    const d = (frame * 5 + i * 13) % 70;
    ctx.strokeStyle = `rgba(224, 242, 254, ${0.9 - d / 90})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(-34 - d, -32 + Math.sin(i * 2.1 + frame * 0.3) * 8, 2 + (i % 3), 0, Math.PI * 2); ctx.stroke();
  }
  ghosts(ctx, 2, k => [-k * 16, 0], 'saturate(0.4) brightness(1.3) hue-rotate(170deg)', k => torpedoBody(ctx, frame - k * 3, false));
  torpedoBody(ctx, frame, true);
};

const torpedoBody = (ctx: Ctx, frame: number, main: boolean) => {
  ctx.save();
  // Flat out, head first (turned about his middle)
  ctx.translate(0, -30);
  ctx.rotate(1.35);
  ctx.translate(0, 30);
  // Legs together behind him, dolphin kicking
  const k = Math.sin(frame * 0.5) * 5;
  leg(ctx, [-3, -24], [-3 + k * 0.5, -12], [-2 + k, -1], 0.2, true);
  leg(ctx, [3, -24], [3 + k * 0.5, -12], [4 + k, -1], -0.1, false);
  ctx.translate(0, -24);
  // Both arms stretched out ahead, fists together: he's a missile
  arm(ctx, [-6, -22], [-5, -36], [-2, -50], true);
  torso(ctx);
  ctx.save();
  ctx.translate(2, -32);
  head(ctx, 0, 0, 'grit');
  ctx.restore();
  arm(ctx, [6, -22], [5, -37], [2, -51], false, 6.5);
  ctx.restore();
  if (!main) return;
  // The water parting round his fists: a bow wave out in front
  for (let j = 0; j < 3; j++) {
    const t = ((frame * 2 + j * 7) % 21) / 21;
    ctx.strokeStyle = `rgba(224, 242, 254, ${0.8 * (1 - t)})`;
    ctx.lineWidth = 2.5 - t;
    ctx.beginPath(); ctx.arc(40 + t * 18, -34, 8 + t * 12, -1.2, 1.2); ctx.stroke();
  }
};

// ---------------------------------------------------------------------------
// Uppercut
// ---------------------------------------------------------------------------

/** Rocketing up, fist to the sky wreathed in energy, knee driving, roaring. */
export const drawUppercut = (ctx: Ctx, frame: number) => {
  frameNow = frame;
  // Rising streaks below
  ctx.strokeStyle = 'rgba(125, 211, 252, 0.7)';
  ctx.lineWidth = 2;
  for (let s = 0; s < 5; s++) {
    const x = -14 + s * 7;
    const y = 4 + ((frame * 8 + s * 13) % 30);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 18 + (s % 2) * 8); ctx.stroke();
  }
  ghosts(ctx, 2, k => [0, k * 16], 'sepia(1) saturate(4) hue-rotate(160deg) brightness(1.3)', () => uppercutBody(ctx, frame, false));
  uppercutBody(ctx, frame, true);
};

const uppercutBody = (ctx: Ctx, frame: number, main: boolean) => {
  // Back leg trailing straight down, lead knee driven up
  leg(ctx, [-4, -24], [-5, -11], [-6, 1], 1.2, true);
  leg(ctx, [5, -24], [15, -30], [16, -16], 1.3, false);
  ctx.save();
  ctx.translate(0, -24);
  ctx.rotate(-0.1);
  // Back arm pulled down hard to the hip
  arm(ctx, [-9, -22], [-16, -10], [-11, -1], true);
  torso(ctx);
  // Head thrown back, roaring at the sky
  ctx.save();
  ctx.translate(-4, -36);
  ctx.rotate(-0.3);
  head(ctx, 0, 0, 'roar');
  ctx.restore();
  // Lead arm straight up
  const fist: [number, number] = [19, -63];
  if (main) {
    const g = glowLayer(ctx);
    const glow = g.createRadialGradient(fist[0], fist[1], 2, fist[0], fist[1], 30);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    glow.addColorStop(0.3, 'rgba(56, 189, 248, 0.6)');
    glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
    g.fillStyle = glow;
    g.beginPath(); g.arc(fist[0], fist[1], 30, 0, Math.PI * 2); g.fill();
  }
  arm(ctx, [14, -22], [21, -42], fist, false, 7.5);
  if (main) {
    // Energy spiralling around the fist and forearm
    for (let k = 0; k < 3; k++) {
      const a = frame * 0.5 + k * (Math.PI * 2 / 3);
      ctx.strokeStyle = k % 2 === 0 ? '#7DD3FC' : '#FDE047';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(fist[0], fist[1] + 10 + k * 6, 13 - k * 2, 4, 0, a, a + Math.PI * 1.1);
      ctx.stroke();
    }
    // Sparks flying off the knuckles
    ctx.fillStyle = '#FFFFFF';
    for (let s = 0; s < 4; s++) {
      const t = ((frame * 3 + s * 9) % 24) / 24;
      ctx.fillRect(fist[0] + Math.sin(s * 2.4) * (6 + t * 16), fist[1] - 6 - t * 18, 2.5, 2.5);
    }
  }
  ctx.restore();
};

// ---------------------------------------------------------------------------
// Divekick
// ---------------------------------------------------------------------------

/** Plummeting heel-first at a steep angle, the boot on fire, trailing flame. */
export const drawDivekick = (ctx: Ctx, frame: number) => {
  frameNow = frame;
  ctx.save();
  ctx.translate(0, -30);
  ctx.rotate(0.95); // 55-60 degrees down toward the target
  // Flame trailing behind along the line of the dive
  // (puffs of it, cooling down the ramp as they fall behind, the last of each a dithered wisp)
  chunky(ctx, -84, -20, 104, 40, g => {
    for (let k = 0; k < 7; k++) {
      const t = ((frame * 2 + k * 5) % 35) / 35;
      const px = -14 - t * 50, py = Math.sin(frame * 0.4 + k) * 5, rx = 8 + t * 6, ry = 5 + t * 3;
      g.fillStyle = t > 0.75 ? ditherFill(g, '#B91C1C') : t > 0.5 ? '#B91C1C' : t > 0.25 ? '#EA580C' : '#F59E0B';
      g.beginPath(); g.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2); g.fill();
      if (t < 0.5) { g.fillStyle = t < 0.25 ? '#FDE047' : '#F59E0B'; g.beginPath(); g.ellipse(px + rx * 0.2, py, rx * 0.5, ry * 0.5, 0, 0, Math.PI * 2); g.fill(); }
    }
  });
  ghosts(ctx, 2, k => [-k * 16, 0], 'sepia(1) saturate(6) hue-rotate(-15deg) brightness(1.1)', () => diveBody(ctx, frame, false));
  diveBody(ctx, frame, true);
  ctx.restore();
};

/** A flying kick laid out along +x (lead boot leading); the caller rotates it into the dive. */
const diveBody = (ctx: Ctx, frame: number, main: boolean) => {
  // Back leg tucked up
  leg(ctx, [-2, 2], [8, 12], [-4, 16], 0.3, true);
  // Torso laid back behind the kick, leaning away from it
  ctx.save();
  ctx.translate(-2, 0);
  ctx.rotate(-Math.PI / 2 - 0.15);
  // Back arm tucked in tight to his side (nothing flapping about in a dive)
  arm(ctx, [-9, -22], [-14, -12], [-7, -5], true);
  torso(ctx);
  ctx.save();
  ctx.translate(2, -36);
  ctx.rotate(Math.PI / 2 - 0.6); // head turned to look down the kick
  head(ctx, 0, 0, 'grit');
  ctx.restore();
  // Lead arm tucked in across the chest
  arm(ctx, [10, -22], [14, -12], [4, -10], false);
  ctx.restore();
  // Lead leg: locked straight, boot first
  leg(ctx, [2, 0], [18, 0], [34, 0], 0, false);
  if (!main) return;
  // The boot's on fire
  const g = glowLayer(ctx);
  steppedGlow(g, 40, 0, 20, '#FF7814', 0.6, 0.1, 4);
  // (a ball of it round the boot, streaming back off it the way he's come)
  drawFireball(ctx, 38, 0, 9, frame, { seed: 7, vx: 1, vy: 0, tail: 2.6, heat: 1 });
};

// ---------------------------------------------------------------------------
// On the bike: pedaling (the stage draws the bike under him)
// ---------------------------------------------------------------------------

/** Where the bike's cranks turn (from his feet), how long they are, and his thigh and shin. */
export const CRANK = { x: 3, y: -10, r: 6.5 }, THIGH = 12, SHIN = 12;

/** His legs going round on the pedals, `turn` radians into a revolution (the far leg half a turn behind). */
export const drawPedalLegs = (ctx: Ctx, turn: number) => {
  const hip: [number, number] = [-3, -22];
  for (const [k, back] of [[Math.PI, true], [0, false]] as const) {
    const a = turn + k;
    const foot: [number, number] = [CRANK.x + Math.cos(a) * CRANK.r, CRANK.y + Math.sin(a) * CRANK.r];
    // The knee: where thigh and shin meet, up and forward of the line from hip to foot
    const dx = foot[0] - hip[0], dy = foot[1] - hip[1], d = Math.min(THIGH + SHIN - 0.5, Math.hypot(dx, dy));
    const along = (THIGH * THIGH - SHIN * SHIN + d * d) / (2 * d), up = Math.sqrt(Math.max(0, THIGH * THIGH - along * along));
    const ux = dx / (Math.hypot(dx, dy) || 1), uy = dy / (Math.hypot(dx, dy) || 1);
    const knee: [number, number] = [hip[0] + ux * along + uy * up, hip[1] + uy * along - ux * up];
    leg(ctx, hip, knee, foot, 0.1, back);
  }
};

// ---------------------------------------------------------------------------
// In the boat (Hector's Coast Guard chase)
// ---------------------------------------------------------------------------

/**
 * Sat on the bench at the back of the boat, both fists on the outboard's tiller (it comes forward past his hip from the
 * motor behind him), hunched into the rain, jaw out. (0,0) is where he's sat; the motor's head is at (-34, -8).
 * `rough`: knocked about, teeth bared.
 */
export const drawSeatedAtMotor = (ctx: Ctx, frame: number, rough: boolean) => {
  frameNow = frame;
  const jolt = rough ? Math.sin(frame * 1.7) * 1.5 : 0;
  // The bench under him
  ctx.fillStyle = BELT; ctx.fillRect(-14, 0, 34, 4);
  ctx.fillStyle = '#451A03'; ctx.fillRect(-14, 3, 34, 1.5);
  // Legs out in front, knees up, boots braced on the deck
  leg(ctx, [-4, -2], [16, -6], [18, 14], 0, true);
  leg(ctx, [4, -2], [24, -4], [26, 16], 0, false);
  // The far arm, back to the tiller beside his hip
  arm(ctx, [-9, -26 + jolt], [-22, -20], [-18, -11], true);
  ctx.save();
  ctx.translate(0, -4 + jolt);
  ctx.rotate(0.1);
  torso(ctx);
  ctx.save(); ctx.translate(1, -37); ctx.rotate(rough ? -0.15 : 0.05); head(ctx, 0, 0, rough ? 'roar' : 'grit'); ctx.restore();
  ctx.restore();
  // The tiller: from the motor's head forward past his hip, the rubber grip at the end
  limb(ctx, -34, -8, 12, -15, 3.5, '#374151');
  limb(ctx, 2, -13.5, 13, -15.2, 5, '#111827');
  // The near arm, across to the end of it
  arm(ctx, [11, -26 + jolt], [20, -18], [8, -14], false);
};

/**
 * Thrown out of the boat end over end: arms and legs going every which way, mouth wide. Drawn about his middle
 * (the caller spins it).
 */
export const drawFlung = (ctx: Ctx, frame: number) => {
  frameNow = frame;
  const f = Math.sin(frame * 0.9), g = Math.cos(frame * 0.7);
  leg(ctx, [-4, 8], [-12 + f * 4, 22], [-8 + f * 8, 36], 1.2 + f * 0.4, true);
  leg(ctx, [4, 8], [16, 18 + g * 4], [26 + g * 4, 28], 0.4, false);
  arm(ctx, [-9, -14], [-22, -24 + f * 5], [-30, -36 + f * 8], true);
  ctx.save(); ctx.translate(0, 10); torso(ctx); ctx.restore();
  ctx.save(); ctx.translate(-1, -27); ctx.rotate(0.3 * f); head(ctx, 0, 0, 'roar'); ctx.restore();
  arm(ctx, [11, -14], [24, -22 + g * 5], [32, -34 + g * 9], false);
};

// ---------------------------------------------------------------------------
// Torn in half (the lab's test subjects, on hypermode)
// ---------------------------------------------------------------------------

/** The ragged edge where he came apart: meat, a ring of fat, the spine's end, blood running off it. */
const tornEdge = (ctx: Ctx, y: number, dir: 1 | -1, frame: number) => {
  ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.moveTo(-14, y);
  for (let k = 0; k <= 14; k++) ctx.lineTo(-14 + k * 2, y + dir * (2 + ((k * 7) % 5)));
  ctx.lineTo(14, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#DC2626'; ctx.fillRect(-12, y + dir * 1, 24, 2);
  ctx.fillStyle = '#FDE68A'; ctx.fillRect(-13, y + dir * 0.5, 26, 1);
  // (the spine, a stub of it)
  ctx.fillStyle = '#F5F5F4'; ctx.fillRect(-2, y + (dir > 0 ? 0 : -6), 4, 6); ctx.fillStyle = '#D6D3D1'; ctx.fillRect(-2, y + (dir > 0 ? 2 : -4), 4, 1);
  // (and the drips, running off it)
  ctx.fillStyle = '#B91C1C';
  for (let k = 0; k < 4; k++) { const len = 3 + ((frame + k * 5) % 9); ctx.fillRect(-10 + k * 6, y + dir * 3, 1.6, dir * len); }
};

/** His top half: the torso, the head (mouth wide), the arms going, the guts hanging out of the bottom of it. (0,0) is the tear. */
export const drawTorsoHalf = (ctx: Ctx, frame: number) => {
  frameNow = frame;
  const f = Math.sin(frame * 0.8);
  arm(ctx, [-9, -22], [-20, -12 + f * 6], [-28, -2 + f * 8], true);
  // (the guts, in loops)
  ctx.strokeStyle = '#F9A8D4'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-4, 2); ctx.quadraticCurveTo(-8 + f * 3, 14, 0, 12); ctx.quadraticCurveTo(8, 10, 6 - f * 3, 20); ctx.stroke();
  ctx.strokeStyle = '#DB2777'; ctx.lineWidth = 1; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.rect(-20, -40, 40, 40); ctx.clip(); torso(ctx); ctx.restore();
  tornEdge(ctx, 0, 1, frame);
  ctx.save(); ctx.translate(-1, -37); ctx.rotate(0.2 * f); head(ctx, 0, 0, 'roar'); ctx.restore();
  arm(ctx, [11, -22], [22, -30 - f * 4], [30, -40 - f * 6], false);
};

/** His bottom half: the belt and the buckle, the jeans, the boots, still kicking. (0,0) is the tear. */
export const drawLegsHalf = (ctx: Ctx, frame: number) => {
  frameNow = frame;
  const f = Math.sin(frame * 0.7);
  leg(ctx, [-5, 2], [-9 - f * 4, 18], [-6 - f * 6, 32], 0.2, true);
  leg(ctx, [5, 2], [9 + f * 4, 17], [8 + f * 7, 31], 0.1, false);
  ctx.fillStyle = BELT; ctx.fillRect(-14, 0, 28, 6);
  ctx.fillStyle = BUCKLE; ctx.fillRect(-5, -0.5, 10, 7); ctx.fillStyle = '#451A03'; ctx.fillRect(-2, 1.5, 4, 3);
  tornEdge(ctx, 0, -1, frame);
};
