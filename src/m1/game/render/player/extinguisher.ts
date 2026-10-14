// The fire extinguisher (Player.extinguisher: Meathead 2's space disco, the cutscene before the queen): his own poses
// for it, drawn in his local frame (feet at 0, facing +x), the can drawn with him (in front of his head: held up near
// his face, it's in front of it, the standing rule).
//
//   'reach'  a crouch, a hop up for it in its cabinet up on the wall, both hands up; got it, down he comes with it,
//            landing in a squat, and brings it in to his chest.
//   'hold'   stood with it cradled at his chest, a hand on its handle (his say).
//   'spray'  braced (feet wide, the front knee bent, leaning in), the can clamped at his side by the back arm, the
//            front arm out with the hose, aimed up at her; the kick of it shaking him; the foam's the stage's.
//   'shake'  it's empty: held up to his face, shaken, the nozzle tipped to peer up it.
//   'wind'   both hands on it, back over his head, leaning back, up on the back foot (the wind-up).
//   'throw'  let go (the stage has it now): hurled overhand, arms whipping over and down, leaning into it, then back
//            up straight.
// Clean, shitty (the seat stained) or bare (setNude's legs, no belt): as the body parts draw themselves.

import type { Player } from '../../../types';
import { drawArmTo, drawJointedLeg, drawTorso, drawBelt, drawHead, pantsColor, pantsShadow, type Mood } from './body';
import type { LadderPants } from './ladder';

type Ctx = CanvasRenderingContext2D;
type Ext = NonNullable<Player['extinguisher']>;
type Pt = [number, number];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => { const k = clamp01(v); return k * k * (3 - 2 * k); };
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const mixPt = (a: Pt, b: Pt, k: number): Pt => [mix(a[0], b[0], k), mix(a[1], b[1], k)];

/** How long each takes (frames): the hop for it (he's got it at REACH_GRAB), the wind-up. */
export const REACH_T = 30, REACH_GRAB = 12, WIND_T = 20;
/** Where the can leaves his hands, thrown (local, from his feet, facing +x). */
export const THROW_FROM: Pt = [10, -86];
/** The hose's tip, spraying (local): the foam comes out of here, along `SPRAY_AIM` (radians; up's negative). */
export const SPRAY_AIM = -0.34;
export const sprayNozzle = (e: Ext): Pt => { const r = recoil(e); return [27 + r, -41 + r * 0.3]; };
/** The nozzle shaken out (local): the last dribbles. */
export const shakeNozzle = (e: Ext): Pt => [20, -64 + Math.sin(e.t * 1.3) * 4];

/** The kick of it spraying (a shudder back, a px or two). */
const recoil = (e: Ext) => (e.step === 'spray' ? -((e.t >> 1) % 2) * 1.5 : 0);

/** An elbow for an arm from shoulder `s` to fist `f` (upper arm 12, forearm 11), bent `down` (below the line) or up. */
const elbow = (s: Pt, f: Pt, down: boolean): Pt => {
  const a = 12, b = 11, dx = f[0] - s[0], dy = f[1] - s[1], d = Math.min(a + b - 0.5, Math.hypot(dx, dy) || 1);
  const base = Math.atan2(dy, dx), off = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
  const ang = base + (down ? off : -off);
  return [s[0] + Math.cos(ang) * a, s[1] + Math.sin(ang) * a];
};
/** The fist pulled in to what the arm reaches (no stretching). */
const reach = (s: Pt, f: Pt): Pt => { const dx = f[0] - s[0], dy = f[1] - s[1], d = Math.hypot(dx, dy), m = 22.5; return d <= m ? f : [s[0] + dx / d * m, s[1] + dy / d * m]; };

/** The can: red, shaded, the lit stripe, the white label, the black valve and handle on top (local to the can: its
 *  middle, upright along -y, `rot` turned). Its hose from the valve to `nozzle` (in the frame it's drawn in), if given. */
const drawCan = (ctx: Ctx, x: number, y: number, rot: number, nozzle?: Pt, aim = 0) => {
  if (nozzle) {
    // (the hose: off the valve, a loop down, out to the nozzle)
    const vx = x + Math.sin(rot) * 20, vy = y - Math.cos(rot) * 20;
    ctx.strokeStyle = '#18181B'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(vx, vy); ctx.bezierCurveTo(vx + 10, vy + 4, nozzle[0] - 16, nozzle[1] + 14, nozzle[0] - Math.cos(aim) * 6, nozzle[1] - Math.sin(aim) * 6); ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.save(); ctx.translate(nozzle[0], nozzle[1]); ctx.rotate(aim);
    ctx.fillStyle = '#18181B'; ctx.beginPath(); ctx.moveTo(-8, -2.5); ctx.lineTo(1, -4); ctx.lineTo(1, 4); ctx.lineTo(-8, 2.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#52525B'; ctx.fillRect(-7, -2, 6, 1);
    ctx.restore();
  }
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.roundRect(-7.5, -17, 15, 34, 4); ctx.fill();
  ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.roundRect(-6.5, -16, 12, 32, 3.5); ctx.fill();
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(2.5, -14, 3, 29);
  ctx.fillStyle = '#FCA5A5'; ctx.fillRect(-5, -13, 2, 24);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-5, -6, 10, 8);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(-3, -4, 6, 1); ctx.fillRect(-3, -1, 4, 1);
  // (the valve head, the squeeze handle, the pin)
  ctx.fillStyle = '#18181B'; ctx.fillRect(-4, -23, 8, 7); ctx.fillRect(-2, -26, 13, 3); ctx.fillRect(1, -21, 10, 2.5);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(-6, -21, 3, 2);
  ctx.restore();
};

interface Look {
  /** Fists (local), the can's middle and turn; the hose's tip and its aim (spraying). */
  back: Pt; front: Pt; can: Pt | null; rot: number; nozzle?: Pt; aim?: number;
  /** Lean about his hips; the whole of him up off the ground (the hop) and squashed (landing); the legs. */
  lean: number; up: number; squash: number;
  bt: number; bk: number; nt: number; nk: number;
  hy: number; mood: Mood;
}

const STAND_LEGS = { bt: 0.08, bk: 0.05, nt: -0.08, nk: 0.08 };
/** Cradled at his chest: the can upright in front of him, a hand under it, one on its handle. */
const HOLD: Look = { back: [10, -24], front: [16, -46], can: [13, -33], rot: 0.12, lean: 0, up: 0, squash: 0, ...STAND_LEGS, hy: -54, mood: 'grit' };

const lookOf = (e: Ext, frame: number): Look => {
  const t = e.t;
  switch (e.step) {
    case 'reach': {
      if (t < 6) {
        // (down for the hop, arms back)
        const k = ease(t / 6);
        return { back: [-12, -26], front: [-6, -28], can: null, rot: 0, lean: 0.15 * k, up: -3 * k, squash: 0.08 * k, bt: 0.1, bk: 0.5 * k, nt: -0.3 * k, nk: 0.7 * k, hy: -54, mood: 'scowl' };
      }
      if (t < 18) {
        // (the hop: up, arms straight up for it; got it at the top)
        const u = (t - 6) / 12, up = Math.sin(u * Math.PI) * 28;
        const k = ease(u * 2);
        const got = t >= REACH_GRAB;
        return { back: mixPt([-12, -26], [0, -80], k), front: mixPt([-6, -28], [6, -82], k), can: got ? [3, -94] : null, rot: 0, lean: -0.05, up, squash: 0, bt: 0.2, bk: 0.4, nt: -0.1, nk: 0.5, hy: -55, mood: got ? 'yell' : 'scowl' };
      }
      // (down with it in a squat, then in to his chest)
      const u = (t - 18) / (REACH_T - 18), k = ease(u), sq = Math.max(0, 1 - u * 2.5);
      return { back: mixPt([0, -80], HOLD.back, k), front: mixPt([6, -82], HOLD.front, k), can: mixPt([3, -94], HOLD.can!, k), rot: HOLD.rot * k, lean: 0.1 * sq, up: -5 * sq, squash: 0.12 * sq, bt: 0.1, bk: 0.6 * sq, nt: -0.35 * sq, nk: 0.8 * sq, hy: -54, mood: 'grit' };
    }
    case 'hold': {
      const b = Math.sin(frame * 0.08) * 0.6;
      return { ...HOLD, can: [HOLD.can![0], HOLD.can![1] + b], back: [HOLD.back[0], HOLD.back[1] + b], front: [HOLD.front[0], HOLD.front[1] + b] };
    }
    case 'spray': {
      // (braced, leaning in, the can clamped at his side, the hose out at her; it kicks)
      const r = recoil(e), k = ease(t / 8), nz = sprayNozzle(e);
      return {
        back: mixPt(HOLD.back, [6, -30 + r * 0.3], k), front: mixPt(HOLD.front, [nz[0] - 6, nz[1] + 2], k), can: mixPt(HOLD.can!, [4 + r, -34], k), rot: mix(HOLD.rot, 0.55, k),
        nozzle: k >= 1 ? nz : undefined, aim: SPRAY_AIM,
        lean: mix(0, 0.12, k) + r * 0.02, up: -2 * k, squash: 0, bt: mix(0.08, 0.42, k), bk: mix(0.05, 0.12, k), nt: mix(-0.08, -0.45, k), nk: mix(0.08, 0.5, k), hy: -54, mood: 'grit',
      };
    }
    case 'shake': {
      // (empty: up to his face, shaken, the nozzle tipped up to peer into it)
      const k = ease(t / 10), s = Math.sin(t * 1.3) * 4 * k;
      return { back: mixPt(HOLD.back, [12, -48 + s], k), front: mixPt(HOLD.front, [18, -66 + s], k), can: mixPt(HOLD.can!, [15, -56 + s], k), rot: mix(HOLD.rot, -0.6, k), lean: 0, up: 0, squash: 0, ...STAND_LEGS, hy: -54, mood: 'scowl' };
    }
    case 'wind': {
      // (both hands on it, back over his head; leaning back on the back foot)
      const k = ease(t / 14), tr = t >= 14 ? Math.sin(t * 2.1) * 0.8 : 0;
      return {
        back: mixPt(HOLD.back, [-12, -76 + tr], k), front: mixPt(HOLD.front, [-6, -82 + tr], k), can: mixPt(HOLD.can!, [-14, -88 + tr], k), rot: mix(HOLD.rot, -2.2, k),
        lean: -0.28 * k, up: 0, squash: 0, bt: mix(0.08, 0.3, k), bk: mix(0.05, 0.45, k), nt: mix(-0.08, -0.4, k), nk: mix(0.08, 0.15, k), hy: -54, mood: 'roar',
      };
    }
    case 'throw': {
      // (hurled: arms whipping over and down in front, leaning into it; then back up straight)
      const w = ease(t / 6), back = ease((t - 12) / 18);
      const fb: Pt = mixPt(mixPt([THROW_FROM[0] - 4, THROW_FROM[1] + 6], [20, -30], w), [10, -24], back);
      const ff: Pt = mixPt(mixPt([THROW_FROM[0], THROW_FROM[1]], [26, -34], w), [8, -26], back);
      return { back: fb, front: ff, can: null, rot: 0, lean: mix(mix(-0.1, 0.32, w), 0, back), up: 0, squash: 0, bt: mix(0.45, 0.08, back), bk: mix(0.3, 0.05, back), nt: mix(-0.35, -0.08, back), nk: mix(0.35, 0.08, back), hy: -54, mood: back < 0.5 ? 'yell' : 'grit' };
    }
  }
};

/** Him with the extinguisher, posed (local frame, already turned the way he faces). */
export const drawExtinguisherPose = (ctx: Ctx, e: Ext, frame: number, pants: LadderPants) => {
  const q = lookOf(e, frame);
  ctx.save();
  ctx.translate(0, -q.up);
  if (q.squash) { ctx.scale(1 + q.squash, 1 - q.squash); }
  const upper = (fn: () => void) => { ctx.save(); ctx.translate(0, -22); ctx.rotate(q.lean); ctx.translate(0, 22); fn(); ctx.restore(); };
  // (in the lean's frame: the shoulders; the fists are where they're put, unleaned, so the can stays put in them)
  const tip = (x: number, y: number): Pt => { const c = Math.cos(q.lean), sn = Math.sin(q.lean), vy = y + 22; return [x * c - vy * sn, x * sn + vy * c - 22]; };
  const sB = tip(-8, -45), sF = tip(6, -45);
  const fB = reach(sB, q.back), fF = reach(sF, q.front);
  drawArmTo(ctx, sB, elbow(sB, fB, true), fB, true);
  drawJointedLeg(ctx, -4, -22, q.bt, q.bk, pantsShadow, false);
  drawJointedLeg(ctx, 5, -22, q.nt, q.nk, pantsColor, true);
  if (pants.shat) {
    ctx.fillStyle = 'rgba(92, 58, 22, 0.8)'; ctx.beginPath(); ctx.ellipse(-8, -16, 6, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(70, 42, 14, 0.85)'; ctx.beginPath(); ctx.ellipse(-9, -17, 3.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  }
  upper(() => { drawBelt(ctx, -27, 7); drawTorso(ctx, -50, 24, -48); drawHead(ctx, 1, q.hy, q.mood, frame); });
  // (the can in front of him, in front of his head where it's up by it; then the arm that's on it)
  if (q.can) drawCan(ctx, q.can[0], q.can[1], q.rot, q.nozzle, q.aim);
  drawArmTo(ctx, sF, elbow(sF, fF, true), fF, false);
  ctx.restore();
};
