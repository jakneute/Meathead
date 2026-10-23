// Sat in a ride's seat (the cart pose), a big haymaker with his lead fist: Meathead 2's Voyage to 2010, the two control
// panels he punches going by. p.seatPunch: 0..1 the wind-up (leaning back to load it, coming up off the seat, the fist
// cocked back up by his ear, the elbow out), 1..2 the throw (up out of the seat, leaning right into it, the fist round
// in an arc and driven out level), held at 2 (the impact: whoever scripts it holds it there for the hit-stop), 2..3
// back down into the seat. The lead arm is the near one (in a cutscene it's his left: the sprite just mirrors).
// Elbows bend the way elbows bend (the same two-bone rule as Meathead 2's art/limb.ts: facing +x in his local frame).

import { drawArmTo, skinShadow, wristbandColor } from './body';

type Ctx = CanvasRenderingContext2D;
type P = [number, number];

const ease = (t: number) => { const k = Math.max(0, Math.min(1, t)); return k * k * (3 - 2 * k); };
const lerp = (a: P, b: P, k: number): P => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
/** Upper arm and forearm (his local units). */
const UPPER = 15, FORE = 17;
/** Where the lead shoulder sits sat in a cart (his local frame, turned with his body), and where the hand rests. */
const SHOULDER: P = [8, -42], REST: P = [30, -32];
/** From his middle to the fist at full reach, sat, facing +x, in world px (the scripts time the impact off it). */
export const SEAT_PUNCH_REACH = 54;
/** ...and how far up off his feet it lands (world px). */
export const SEAT_PUNCH_UP = 52;

/** His body through it: the lean (radians, + forward) and how far up off the seat (px, - up). */
export const seatPunchLean = (v: number) => {
  if (v <= 1) { const k = ease(v); return { rot: -0.3 - 0.14 * k, y: 3 - 9 * k }; }
  if (v <= 2) { const k = ease((v - 1) * 1.4); return { rot: -0.44 + 0.8 * k, y: -6 - 6 * k }; }
  const k = ease(v - 2); return { rot: 0.36 - 0.66 * k, y: -12 + 15 * k };
};

/** The elbow (the forearm folding to the front of the upper arm, facing +x), the hand brought within reach. */
const elbowOf = (s: P, h: P): [P, P] => {
  const dx = h[0] - s[0], dy = h[1] - s[1], d0 = Math.hypot(dx, dy) || 1;
  const d = Math.max(Math.abs(UPPER - FORE) + 1, Math.min(UPPER + FORE - 0.6, d0));
  const hand: P = [s[0] + (dx / d0) * d, s[1] + (dy / d0) * d];
  const cos = Math.max(-1, Math.min(1, (UPPER * UPPER + d * d - FORE * FORE) / (2 * UPPER * d)));
  const t = Math.atan2(dy, dx) + Math.acos(cos);
  return [[s[0] + Math.cos(t) * UPPER, s[1] + Math.sin(t) * UPPER], hand];
};

/** The far arm through it: braced on the side of the seat in front of him, gripping it. */
export const drawSeatPunchBackArm = (ctx: Ctx) => {
  drawArmTo(ctx, [-6, -40], [-2, -29], [10, -27], true);
  ctx.fillStyle = skinShadow; ctx.beginPath(); ctx.arc(10, -27, 4.5, 0, Math.PI * 2); ctx.fill();
};

/** The lead arm through it. `rot`: how his body's turned (the frame this is drawn in), so the throw goes out level. */
export const drawSeatPunchArm = (ctx: Ctx, v: number, rot: number) => {
  // (targets given level, from the shoulder, turned back into his frame)
  const c = Math.cos(-rot), s = Math.sin(-rot);
  const fromShoulder = (ox: number, oy: number): P => [SHOULDER[0] + ox * c - oy * s, SHOULDER[1] + ox * s + oy * c];
  const cock = fromShoulder(-15, -11), out = fromShoulder(UPPER + FORE - 1, 1);
  let h: P;
  if (v <= 1) h = lerp(REST, cock, ease(v));
  else if (v <= 2) {
    // (accelerating all the way in, round in an arc over the top: a haymaker, not a jab)
    const k = Math.min(1, (v - 1) * (v - 1));
    h = lerp(cock, out, k); h[1] -= Math.sin(k * Math.PI) * 9;
  } else h = lerp(out, REST, ease(v - 2));
  const [el, hand] = elbowOf(SHOULDER, h);
  const big = v > 1.2 && v < 2.6;
  // (the speed of it: streaks behind the fist as it goes in)
  if (v > 1.45 && v <= 2.05) {
    ctx.save(); ctx.globalAlpha = 0.55; ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (const [dy, len] of [[-5, 16], [0, 22], [5, 14]]) { ctx.beginPath(); ctx.moveTo(hand[0] - 9, hand[1] + dy); ctx.lineTo(hand[0] - 9 - len, hand[1] + dy + 3); ctx.stroke(); }
    ctx.restore();
  }
  drawArmTo(ctx, SHOULDER, el, hand, false, big ? 7 : 5.5);
  // (the wristband, square to the forearm; the knuckles on the fist)
  const a = Math.atan2(hand[1] - el[1], hand[0] - el[0]);
  ctx.save(); ctx.translate(hand[0], hand[1]); ctx.rotate(a);
  ctx.fillStyle = wristbandColor; ctx.fillRect(-11, -4.5, 4, 9);
  ctx.fillStyle = skinShadow; for (let k = 0; k < 3; k++) ctx.fillRect(3.5, -4 + k * 3, 2, 1.2);
  ctx.restore();
};
