// A long fall out of his hands (Player.freefall: Meathead 2's clock tower, the drop into hell), and the landing at
// the bottom of it. Undignified all the way (he always is): drawn in his local frame (feet at 0, facing +x).
//
//   'flail': arms windmilling, legs bicycling, tumbling slowly head over heels, eyes like saucers, mouth wide open;
//     his jeans flapping at the cuffs and riding down at the back. He comes down flat on his face (a belly flop),
//     lies there a while, a leg twitching, his backside up; then springs up stiff as a board, and shakes it off.
//   'ball': a cannonball, knees hugged to his chest, spinning. He comes down on his backside, squashed, then sat
//     there sprawled, legs up in the air, stars round his head; then up, and shakes it off.
// Clean, shitty (the seat soaked brown, it shows coming down backside up) or bare (setNude: his legs his own, no
// belt, swinging free). The weapon's put away.

import type { Player } from '../../../types';
import { drawArm, drawJointedLeg, drawTorso, drawBelt, drawHead, drawGlasses, isNude, pantsColor, pantsShadow, skinTone, skinShadow, skinHighlight, skinVein, backArmShade } from './body';
import type { LadderPants } from './ladder';

type Ctx = CanvasRenderingContext2D;
type Freefall = NonNullable<Player['freefall']>;

/** How long the landing takes (frames), down to back on his feet. */
export const FREEFALL_LAND = 100;
/** Where he's turned about in the air: his middle (local, from his feet). */
export const FREEFALL_PIVOT = -35;
/** The turn he comes down in: flat on his face (flail), sat on his backside (ball). */
export const freefallLandRot = (style: Freefall['style']) => (style === 'ball' ? 0 : Math.PI / 2);

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => { const k = clamp01(v); return k * k * (3 - 2 * k); };
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
/** Overshoots a little and settles (springing up). */
const easeBack = (v: number) => { const k = clamp01(v) - 1; return 1 + 2.7 * k * k * k + 1.7 * k * k; };

/** An arm from the shoulder, `a` its angle off straight down (canvas turn: π up, -π/2 forward), the forearm `bend` on from it. */
const arm = (ctx: Ctx, sx: number, sy: number, a: number, bend: number, back: boolean) => {
  const ex = sx - Math.sin(a) * 12, ey = sy + Math.cos(a) * 12;
  const wx = ex - Math.sin(a + bend) * 10, wy = ey + Math.cos(a + bend) * 10;
  if (back) drawArm(ctx, sx, sy, ex, ey, wx, wy, skinShadow, backArmShade, skinTone);
  else drawArm(ctx, sx, sy, ex, ey, wx, wy, skinTone, skinShadow, skinHighlight);
};

/** A leg (drawJointedLeg's) and, on jeans, the cuff flapping in the wind (`up`: which way's up in the world, here). */
const leg = (ctx: Ctx, hipX: number, thigh: number, knee: number, near: boolean, flap: number, up: [number, number], frame: number) => {
  drawJointedLeg(ctx, hipX, -22, thigh, knee, near ? pantsColor : pantsShadow, near);
  if (flap <= 0 || isNude()) return;
  // (the cuff: at the top of the boot, the hem of the leg fluttering off it, up the way the air's rushing)
  const kx = hipX - Math.sin(thigh) * 11, ky = -22 + Math.cos(thigh) * 11;
  const cx = kx - Math.sin(thigh + knee) * 9, cy = ky + Math.cos(thigh + knee) * 9;
  const w = Math.sin(frame * 1.7 + hipX) * 2.2 * flap, len = 5 * flap;
  ctx.fillStyle = near ? pantsColor : pantsShadow;
  ctx.beginPath();
  ctx.moveTo(cx - up[1] * 5, cy + up[0] * 5);
  ctx.lineTo(cx + up[0] * len - up[1] * (5 + w), cy + up[1] * len + up[0] * (5 + w));
  ctx.lineTo(cx + up[0] * len * 0.6 + up[1] * (5 - w), cy + up[1] * len * 0.6 - up[0] * (5 - w));
  ctx.lineTo(cx + up[1] * 5, cy - up[0] * 5);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'; ctx.fillRect(Math.round(cx - 1), Math.round(cy - 1), 2, 2);
};

/** The seat of his pants, soaked through brown (and his jeans ridden down at the back: the top of his crack). */
const seat = (ctx: Ctx, pants: LadderPants, ridden: number) => {
  if (!pants.nude && ridden > 0) {
    ctx.fillStyle = skinShadow; ctx.fillRect(-14, -21, 7, 2 + ridden * 2);
    ctx.fillStyle = 'rgba(90, 45, 15, 0.8)'; ctx.fillRect(-12, -21, 1, 2 + ridden * 2);
  }
  if (!pants.shat) return;
  ctx.fillStyle = 'rgba(92, 58, 22, 0.8)'; ctx.beginPath(); ctx.ellipse(-8, -15, 7, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(70, 42, 14, 0.85)'; ctx.beginPath(); ctx.ellipse(-10, -16, 4, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(200, 160, 100, 0.35)'; ctx.fillRect(-11, -19, 3, 1);
};

/** His head, scared out of his wits (eyes like saucers, the brows up, the mouth a big wide O), or dazed (stars). */
const face = (ctx: Ctx, hx: number, hy: number, frame: number, look: 'scream' | 'dazed' | 'grit') => {
  drawHead(ctx, hx, hy, look === 'grit' ? 'scowl' : 'roar', frame);
  if (look === 'grit') return;
  // (over the brows and eyes: skin again, then his own)
  ctx.fillStyle = skinTone; ctx.fillRect(hx - 9, hy - 11, 18, 7.6);
  ctx.fillStyle = 'rgba(150, 90, 35, 0.35)'; ctx.fillRect(hx - 10, hy - 11, 3.5, 7.6);
  ctx.fillStyle = skinShadow; ctx.fillRect(hx + 1.2, hy - 3.4, 1.1, 1);
  ctx.strokeStyle = skinVein; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(hx - 6, hy - 10.5); ctx.lineTo(hx - 3, hy - 9.5); ctx.stroke();
  ctx.fillStyle = '#09090B';
  if (look === 'scream') {
    // Brows right up, worried (high in the middle)
    ctx.beginPath(); ctx.moveTo(hx - 8, hy - 9); ctx.lineTo(hx - 2, hy - 11.5); ctx.lineTo(hx - 2, hy - 10); ctx.lineTo(hx - 8, hy - 7.6); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx + 8, hy - 9); ctx.lineTo(hx + 2, hy - 11.5); ctx.lineTo(hx + 2, hy - 10); ctx.lineTo(hx + 8, hy - 7.6); ctx.fill();
    // Eyes like saucers, the pupils pinned small
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(hx - 8, hy - 7.5, 5, 5); ctx.fillRect(hx + 2, hy - 7.5, 5, 5);
    const j = (frame >> 1) % 2;
    ctx.fillStyle = '#09090B'; ctx.fillRect(hx - 6 + j, hy - 6, 1.6, 1.6); ctx.fillRect(hx + 4 + j, hy - 6, 1.6, 1.6);
    // The mouth: wide open, a big O (bigger as he hollers), the top teeth, the tongue, the thing at the back
    const o = 4.2 + ((frame >> 2) % 2) * 0.8;
    ctx.fillStyle = '#18181B'; ctx.beginPath(); ctx.ellipse(hx + 1, hy + 4.2, 4.8, o + 0.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#450A0A'; ctx.beginPath(); ctx.ellipse(hx + 1, hy + 4.2, 4, o, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.ellipse(hx + 1, hy + 4.2 + o * 0.6, 2.8, o * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F5F5F4'; ctx.fillRect(hx - 2, hy + 4.2 - o + 0.3, 6, 1.3);
    ctx.fillStyle = '#7F1D1D'; ctx.fillRect(hx + 0.5, hy + 4.2 - o + 2, 1, 1.5);
  } else {
    // Dazed: brows up, the eyes rolling round (a ring each), the mouth hanging open
    ctx.fillRect(hx - 8, hy - 10.5, 6, 1.4); ctx.fillRect(hx + 2, hy - 10.5, 6, 1.4);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(hx - 8, hy - 7.5, 5, 4.5); ctx.fillRect(hx + 2, hy - 7.5, 5, 4.5);
    const a = frame * 0.35;
    ctx.fillStyle = '#09090B';
    ctx.fillRect(hx - 6 + Math.cos(a) * 1.4, hy - 5.8 + Math.sin(a) * 1.2, 1.5, 1.5);
    ctx.fillRect(hx + 4 - Math.cos(a) * 1.4, hy - 5.8 - Math.sin(a) * 1.2, 1.5, 1.5);
    ctx.fillStyle = '#450A0A'; ctx.beginPath(); ctx.ellipse(hx + 1, hy + 4, 3, 2.4, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#DC2626'; ctx.fillRect(hx + 1.5, hy + 5, 2, 1.5);
  }
  // (Meathead 2's glasses back on over the saucers)
  drawGlasses(ctx, hx, hy - 4);
};

/** Stars round his head (local, about the top of it), going round. */
const stars = (ctx: Ctx, hx: number, hy: number, frame: number) => {
  for (let k = 0; k < 3; k++) {
    const a = frame * 0.12 + (k * Math.PI * 2) / 3, x = hx + Math.cos(a) * 13, y = hy - 18 + Math.sin(a) * 4;
    ctx.fillStyle = Math.sin(a) > 0 ? '#FDE047' : '#CA8A04';
    ctx.fillRect(Math.round(x) - 1, Math.round(y) - 3, 2, 6); ctx.fillRect(Math.round(x) - 3, Math.round(y) - 1, 6, 2);
    ctx.fillStyle = '#FEF9C3'; ctx.fillRect(Math.round(x) - 0.5, Math.round(y) - 0.5, 1, 1);
  }
};

interface Pose {
  /** Arms: angle off down, forearm bend (back arm, front arm). */
  ba: number; bb: number; fa: number; fb: number;
  /** Legs: thigh angle (negative forward), knee bend (back leg, near leg). */
  bt: number; bk: number; nt: number; nk: number;
  /** The torso tipped about the hips; the head's place. */
  lean: number; hx: number; hy: number;
}
const lerpPose = (a: Pose, b: Pose, k: number): Pose => {
  const o = {} as Pose;
  for (const key of Object.keys(a) as (keyof Pose)[]) o[key] = mix(a[key], b[key], k);
  return o;
};
const STAND: Pose = { ba: 0.25, bb: 0.3, fa: -0.15, fb: 0.35, bt: 0.08, bk: 0.05, nt: -0.08, nk: 0.08, lean: 0, hx: 0, hy: -54 };
const TUCK: Pose = { ba: -1.2, bb: 0.9, fa: -1.45, fb: 1.0, bt: -2.25, bk: 2.5, nt: -2.35, nk: 2.55, lean: 0.25, hx: 5, hy: -50 };
const SPRAWL: Pose = { ba: 0.9, bb: -0.4, fa: 0.75, fb: -0.5, bt: -1.9, bk: 0.4, nt: -2.1, nk: 0.3, lean: -0.45, hx: -3, hy: -53 };

/** The whole of him, posed (back arm, legs, the seat, belt and torso, front arm, head). */
const body = (ctx: Ctx, q: Pose, pants: LadderPants, frame: number, flap: number, up: [number, number], ridden: number, look: 'scream' | 'dazed' | 'grit', tucked: boolean) => {
  // (the torso, belt and head tipped about his hips; the legs aren't)
  const upper = (fn: () => void) => { ctx.save(); ctx.translate(0, -22); ctx.rotate(q.lean); ctx.translate(0, 22); fn(); ctx.restore(); };
  upper(() => arm(ctx, -8, -45, q.ba, q.bb, true));
  leg(ctx, -4, q.bt, q.bk, false, flap, up, frame);
  // (tucked, both legs come up in front of him: the near one over the torso, below)
  if (!tucked) leg(ctx, 5, q.nt, q.nk, true, flap, up, frame + 9);
  seat(ctx, pants, ridden);
  upper(() => { drawBelt(ctx, -27, 7); drawTorso(ctx, -50, 24, -48); });
  if (tucked) leg(ctx, 5, q.nt, q.nk, true, flap, up, frame + 9);
  upper(() => {
    arm(ctx, 6, -45, q.fa, q.fb, false);
    face(ctx, q.hx, q.hy, frame, look);
  });
};

/**
 * Him, falling (or landing, f.land > 0), in his local frame (already turned the way he faces). `facing` so the cloth
 * flaps the world's way up.
 */
export const drawFreefall = (ctx: Ctx, f: Freefall, frame: number, pants: LadderPants, facing: number) => {
  const P = FREEFALL_PIVOT;
  ctx.save();
  if (f.style === 'pinned') {
    // Flat on his back, held down (his head behind him, his face to the sky): arms up over his face, flinching at each
    // hit (`rot`: the jolt), legs kicking at nothing
    const t = f.t, j = Math.max(0, Math.min(1, f.rot)), kick = t * 0.45;
    ctx.translate(0, 25 - j * 2); ctx.translate(0, P); ctx.rotate(-Math.PI / 2); ctx.translate(0, -P);
    const q: Pose = {
      ba: -1.75 + Math.sin(t * 0.5) * 0.15 - j * 0.3, bb: -1.1 - j * 0.3, fa: -1.95 + Math.sin(t * 0.43 + 1) * 0.15 - j * 0.35, fb: -1.0 - j * 0.3,
      bt: -0.55 + 0.45 * Math.sin(kick), bk: 1.0 + 0.6 * Math.sin(kick + 1.3), nt: -0.6 + 0.45 * Math.sin(kick + Math.PI), nk: 1.0 + 0.6 * Math.sin(kick + Math.PI + 1.3),
      lean: -0.05 * j, hx: -j * 1.5, hy: -54,
    };
    body(ctx, q, pants, frame, 0, [1, 0], 0, 'scream', false);
    ctx.restore();
    return;
  }
  if (f.land <= 0) {
    // In the air: turned over about his middle
    ctx.translate(0, P); ctx.rotate(f.rot); ctx.translate(0, -P);
    // (which way's up in the world, in here: the air rushing that way past him)
    const up: [number, number] = [-Math.sin(f.rot) * facing, -Math.cos(f.rot)];
    const t = f.t, k = ease(t / 8);
    if (f.style === 'ball') {
      const q = lerpPose(STAND, TUCK, k);
      // (shivering with it, hugged in tight)
      q.hy += ((frame >> 1) % 2) * 0.6;
      body(ctx, q, pants, frame, 0.6 * k, up, k, 'scream', k > 0.5);
    } else {
      // Arms windmilling (one after the other, round and round), legs bicycling, all of it a mess
      const w = t * 0.34, kick = t * 0.47;
      const q: Pose = {
        ba: mix(STAND.ba, Math.PI * 0.95 + w, k), bb: mix(STAND.bb, 0.5 + 0.45 * Math.sin(t * 0.5), k),
        fa: mix(STAND.fa, Math.PI * 0.95 + w + Math.PI * 0.9, k), fb: mix(STAND.fb, 0.4 + 0.5 * Math.sin(t * 0.43 + 2), k),
        bt: mix(STAND.bt, -0.45 + 0.85 * Math.sin(kick), k), bk: mix(STAND.bk, 0.95 + 0.75 * Math.sin(kick + 1.3), k),
        nt: mix(STAND.nt, -0.45 + 0.85 * Math.sin(kick + Math.PI), k), nk: mix(STAND.nk, 0.95 + 0.75 * Math.sin(kick + Math.PI + 1.3), k),
        lean: mix(0, -0.12 + 0.1 * Math.sin(t * 0.21), k), hx: 0, hy: -54 + Math.sin(t * 0.9) * 0.8 * k,
      };
      body(ctx, q, pants, frame, k, up, 1 + Math.sin(t * 0.6) * 0.5, 'scream', false);
    }
    ctx.restore();
    return;
  }
  // The landing
  const u = f.land;
  const up: [number, number] = [0, -1];
  if (f.style === 'ball') {
    // Down on his backside, squashed; sat there sprawled, legs in the air, seeing stars; up, and shaking it off
    const squash = u < 8 ? Math.sin((u / 8) * Math.PI) * 0.4 : 0;
    const sit = u < 60 ? 1 : 1 - ease((u - 60) / 18);
    const q = u < 16 ? lerpPose(TUCK, SPRAWL, ease((u - 2) / 14)) : lerpPose(STAND, SPRAWL, sit);
    // (the legs bounce up and flop with the landing)
    if (u >= 16 && u < 60) { const b = Math.exp(-(u - 16) / 10) * Math.sin((u - 16) * 0.5); q.bt -= b * 0.4; q.nt -= b * 0.5; }
    if (u >= 78) { q.hx += Math.sin((u - 78) * 1.1) * 2.5 * (1 - (u - 78) / 22); }
    // (sat: his backside on the ground, down from where his feet would be)
    ctx.translate(0, mix(0, 20, Math.max(sit, u < 16 ? 1 : 0)));
    ctx.translate(0, P + 20); ctx.scale(1 + squash, 1 - squash); ctx.translate(0, -P - 20);
    body(ctx, q, pants, frame, 0, up, 1, u < 70 ? 'dazed' : 'grit', u < 10);
    if (u > 10 && u < 74) stars(ctx, q.hx, q.hy, frame);
    ctx.restore();
    return;
  }
  // Flat on his face: flattened by it, then lying there (a leg twitching, his backside up), then springing up stiff
  // as a board (about his middle, overshooting and settling), and shaking his head
  const squash = u < 8 ? Math.sin((u / 8) * Math.PI) * 0.45 : 0;
  const rise = u < 58 ? 0 : easeBack((u - 58) / 20);
  const rot = (Math.PI / 2) * (1 - rise);
  const flat = Math.max(0, Math.min(1, rot / (Math.PI / 2)));
  // (lying: down onto the ground, about his middle, where he'd be stood)
  ctx.translate(0, 21 * flat);
  ctx.translate(0, P); ctx.scale(1 + squash * 0.5, 1 - squash); ctx.rotate(rot); ctx.translate(0, -P);
  // (his heels up in the air behind him, one kicking now and then)
  const twitch = u > 18 && u < 56 && Math.floor(u / 6) % 3 === 0 ? 0.45 : 0;
  const lie: Pose = { ba: Math.PI * 0.92, bb: 0.15, fa: Math.PI * 0.82, fb: 0.2, bt: 0.2, bk: 1.5 + twitch, nt: 0.05, nk: 1.15 - twitch * 0.5, lean: 0, hx: 1, hy: -54 };
  const q = lerpPose(lie, STAND, rise);
  if (u >= 80) q.hx += Math.sin((u - 80) * 1.1) * 2.5 * (1 - (u - 80) / 20);
  // (his backside up in the air: jiggling a moment after the slap)
  const jig = u < 30 ? Math.sin(u * 0.9) * Math.exp(-u / 9) * 2 : 0;
  ctx.save(); ctx.translate(-jig, 0);
  body(ctx, q, pants, frame, 0, up, 1 - rise, rise > 0.5 ? 'grit' : 'scream', false);
  ctx.restore();
  ctx.restore();
};
