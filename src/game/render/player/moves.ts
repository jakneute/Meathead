// Meathead's special-move poses: the shoulder charge, the uppercut and the
// divekick, each drawn as its own full-body pose with effects (like the slide
// tackle). Drawn in his local frame: (0,0) is between his feet, facing +x.

// Palette (matches player.ts)
const SKIN = '#E0AC69';
const SKIN_SHADOW = '#C68B45';
const SKIN_HIGHLIGHT = '#F5D0A9';
const VEIN = '#EF4444';
const PANTS = '#1E3A8A';
const PANTS_SHADOW = '#172554';
const BOOT = '#18181B';
const STEEL_TOE = '#94A3B8';
const BELT = '#78350F';
const BUCKLE = '#FACC15';
const WRISTBAND = '#09090B';

import { glowLayer, markEyes } from './spriteOutline';
import { drawHeadBlood, drawTorsoBlood, drawBeatenUp, getGore } from './gore';

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

/** A leg from hip through knee to foot, with a combat boot pointing along `toeAngle`. */
const leg = (ctx: Ctx, hip: [number, number], knee: [number, number], foot: [number, number], toeAngle: number, back: boolean) => {
  const color = back ? PANTS_SHADOW : PANTS;
  limb(ctx, hip[0], hip[1], knee[0], knee[1], 11, color);
  limb(ctx, knee[0], knee[1], foot[0], foot[1], 10, color);
  // Blood soaking into the trousers as he takes a beating
  if (getGore() > 0.5) limb(ctx, hip[0] + (knee[0] - hip[0]) * 0.3, hip[1] + (knee[1] - hip[1]) * 0.3, hip[0] + (knee[0] - hip[0]) * 0.6, hip[1] + (knee[1] - hip[1]) * 0.6, 7, 'rgba(60, 5, 10, 0.55)');
  ctx.save();
  ctx.translate(foot[0], foot[1]);
  ctx.rotate(toeAngle);
  ctx.fillStyle = BOOT;
  ctx.fillRect(-5, -5, 15, 9);
  ctx.fillStyle = STEEL_TOE;
  ctx.fillRect(6, -4, 5, 7);
  ctx.restore();
};

/** An arm from shoulder through elbow to a fist, with the spiked wristband. */
const arm = (ctx: Ctx, shoulder: [number, number], elbow: [number, number], fist: [number, number], back: boolean, fistSize = 5.5) => {
  const color = back ? SKIN_SHADOW : SKIN;
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(shoulder[0], shoulder[1], 7.5, 0, Math.PI * 2); ctx.fill();
  limb(ctx, shoulder[0], shoulder[1], elbow[0], elbow[1], 9, color);
  limb(ctx, elbow[0], elbow[1], fist[0], fist[1], 8, color);
  // Wristband just short of the fist
  const dx = fist[0] - elbow[0], dy = fist[1] - elbow[1], len = Math.hypot(dx, dy) || 1;
  limb(ctx, fist[0] - (dx / len) * 7, fist[1] - (dy / len) * 7, fist[0] - (dx / len) * 3, fist[1] - (dy / len) * 3, 9, WRISTBAND);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(fist[0], fist[1], fistSize, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = SKIN_SHADOW;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(fist[0], fist[1], fistSize, 0, Math.PI * 2); ctx.stroke();
};

/** Torso from the hips (0,0) up to the shoulders (y = -26): pecs, abs and the lifting belt. */
const torso = (ctx: Ctx) => {
  ctx.fillStyle = SKIN;
  ctx.fillRect(-14, -26, 28, 26);
  ctx.fillStyle = SKIN_SHADOW;
  ctx.fillRect(-0.75, -16, 1.5, 13);
  ctx.fillRect(-8, -12, 16, 1.2);
  ctx.fillRect(-7, -7, 14, 1.2);
  ctx.fillStyle = SKIN_HIGHLIGHT;
  ctx.fillRect(-6, -15.5, 4.5, 2.8);
  ctx.fillRect(1.5, -15.5, 4.5, 2.8);
  ctx.fillRect(-5.5, -11, 4, 3);
  ctx.fillRect(1.5, -11, 4, 3);
  ctx.fillStyle = SKIN;
  ctx.beginPath(); ctx.roundRect(-13, -26, 12, 9, [3, 1, 3, 4]); ctx.fill();
  ctx.beginPath(); ctx.roundRect(1, -26, 12, 9, [1, 3, 4, 3]); ctx.fill();
  ctx.fillStyle = SKIN_SHADOW;
  ctx.fillRect(-12, -18, 24, 1.5);
  ctx.fillStyle = SKIN_HIGHLIGHT;
  ctx.fillRect(-10, -24.5, 7, 2);
  ctx.fillRect(3, -24.5, 7, 2);
  ctx.fillStyle = BELT;
  ctx.fillRect(-14, -3, 28, 7);
  ctx.fillStyle = BUCKLE;
  ctx.fillRect(-5, -4, 10, 9);
  ctx.fillStyle = '#451A03';
  ctx.fillRect(-2, -2, 4, 5);
  drawTorsoBlood(ctx, -26, 23, -26);
};

/** Meathead's head centred on (hx, hy): flat-top, rage vein, furrowed brows. */
const head = (ctx: Ctx, hx: number, hy: number, mouth: 'grit' | 'roar') => {
  markEyes(ctx, hx - 0.5, hy - 4);
  ctx.fillStyle = SKIN;
  ctx.beginPath(); ctx.roundRect(hx - 10, hy - 12, 20, 20, [4, 4, 3, 3]); ctx.fill();
  ctx.fillStyle = 'rgba(120, 53, 15, 0.25)';
  ctx.fillRect(hx - 9, hy + 1, 18, 7);
  ctx.fillStyle = '#18181B';
  ctx.fillRect(hx - 10, hy - 16, 20, 5);
  ctx.fillRect(hx - 11, hy - 14, 2, 7);
  ctx.fillRect(hx + 9, hy - 14, 2, 7);
  ctx.strokeStyle = VEIN;
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(hx - 6, hy - 10); ctx.lineTo(hx - 3, hy - 8); ctx.lineTo(hx - 4, hy - 5); ctx.stroke();
  ctx.fillStyle = '#09090B';
  ctx.beginPath(); ctx.moveTo(hx - 8, hy - 9); ctx.lineTo(hx - 1, hy - 6); ctx.lineTo(hx - 1, hy - 4); ctx.lineTo(hx - 8, hy - 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(hx + 8, hy - 9); ctx.lineTo(hx + 1, hy - 6); ctx.lineTo(hx + 1, hy - 4); ctx.lineTo(hx + 8, hy - 7); ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(hx - 7.5, hy - 5.5, 5, 3);
  ctx.fillRect(hx + 1.5, hy - 5.5, 5, 3);
  ctx.fillStyle = '#09090B';
  ctx.fillRect(hx - 4.5, hy - 5, 2.5, 2.5);
  ctx.fillRect(hx + 4.5, hy - 5, 2.5, 2.5);
  if (mouth === 'roar') {
    ctx.fillStyle = '#450A0A';
    ctx.beginPath(); ctx.ellipse(hx + 1, hy + 4, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(hx - 2, hy + 1, 6, 1.6);
  } else {
    ctx.fillStyle = '#18181B';
    ctx.fillRect(hx - 6, hy + 3, 12, 3);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(hx - 5, hy + 3.5, 10, 2);
    ctx.fillStyle = '#18181B';
    ctx.fillRect(hx - 2, hy + 3.5, 0.8, 2);
    ctx.fillRect(hx + 1, hy + 3.5, 0.8, 2);
  }
  drawHeadBlood(ctx, hx, hy, frameNow);
  drawBeatenUp(ctx, hx, hy, frameNow);
};

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
  const s = Math.sin(frame * 0.55);
  // Legs pumping in a sprint
  leg(ctx, [-4, -24], [-10 - 5 * s, -12], [-20 - 7 * s, -3], 0.2, true);
  leg(ctx, [4, -24], [13 + 5 * s, -18 + 3 * Math.max(0, s)], [16 + 7 * s, -3 - 5 * Math.max(0, s)], -0.1, false);

  ctx.save();
  // Torso bent forward like a ram
  ctx.translate(0, -24);
  ctx.rotate(0.55);
  // Back arm swinging behind
  arm(ctx, [-8, -22], [-20, -10], [-27, -1], true);
  torso(ctx);
  // Head tucked down behind the shoulder, eyes forward
  ctx.save();
  ctx.translate(9, -33);
  ctx.rotate(-0.4);
  head(ctx, 0, 0, 'grit');
  ctx.restore();
  // Lead arm braced across the chest under the shoulder
  arm(ctx, [10, -20], [16, -8], [6, -6], false);
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
  ctx.fillStyle = SKIN;
  ctx.beginPath(); ctx.arc(14, -22, 11, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = SKIN_HIGHLIGHT;
  ctx.beginPath(); ctx.arc(17, -25, 5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = VEIN;
  ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(8, -26); ctx.lineTo(12, -21); ctx.lineTo(10, -16); ctx.stroke();
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
  const fist: [number, number] = [15, -64];
  if (main) {
    const g = glowLayer(ctx);
    const glow = g.createRadialGradient(fist[0], fist[1], 2, fist[0], fist[1], 30);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    glow.addColorStop(0.3, 'rgba(56, 189, 248, 0.6)');
    glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
    g.fillStyle = glow;
    g.beginPath(); g.arc(fist[0], fist[1], 30, 0, Math.PI * 2); g.fill();
  }
  arm(ctx, [11, -22], [16, -43], fist, false, 7.5);
  ctx.strokeStyle = VEIN;
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(12, -29); ctx.lineTo(15, -35); ctx.lineTo(14, -40); ctx.stroke();
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
  for (let k = 0; k < 7; k++) {
    const t = ((frame * 2 + k * 5) % 35) / 35;
    ctx.fillStyle = k % 2 === 0 ? `rgba(255, 110, 20, ${0.7 * (1 - t)})` : `rgba(255, 215, 0, ${0.6 * (1 - t)})`;
    ctx.beginPath();
    ctx.ellipse(-14 - t * 50, Math.sin(frame * 0.4 + k) * 5, 8 + t * 6, 5 + t * 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
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
  // Back arm thrown up for balance
  arm(ctx, [-9, -22], [-20, -30], [-26, -40], true);
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
  const glow = g.createRadialGradient(40, 0, 2, 40, 0, 20);
  glow.addColorStop(0, 'rgba(255, 245, 180, 0.95)');
  glow.addColorStop(0.4, 'rgba(255, 120, 20, 0.55)');
  glow.addColorStop(1, 'rgba(255, 60, 0, 0)');
  g.fillStyle = glow;
  g.beginPath(); g.arc(40, 0, 20, 0, Math.PI * 2); g.fill();
  for (let k = 0; k < 4; k++) {
    const t = ((frame * 3 + k * 6) % 20) / 20;
    ctx.fillStyle = k % 2 === 0 ? '#FF6D00' : '#FFD600';
    ctx.beginPath();
    ctx.moveTo(30 - t * 16, -6 + k * 3);
    ctx.quadraticCurveTo(24 - t * 22, -10 + k * 4, 18 - t * 30, -4 + k * 3);
    ctx.lineTo(30 - t * 16, -2 + k * 3);
    ctx.fill();
  }
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
