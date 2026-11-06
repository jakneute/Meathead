// THE KAIJU FINALE's throw (the owner's: "doing your beatdown input will do a special animation where meathead grabs
// them and throws them into an attraction ... watching the whole roller coaster collapse"). A stunned boss, him close
// enough, Y + B (the beatdown's input, the pad's chord or the beatdown key): he squats, gets his arms under them,
// heaves them up over his head (both arms straight up, the boss lying across them), leans back, and pitches them
// end over end in a big arc into the section's throw target, which comes down hard (landmarks.ts). The camera goes
// with them to see it; he's back in control as they fly. Everything else holds still through the heave (the other
// boss, the shots, the minions) and keeps calm till they land.
//
// His poses: drawn as his own sprite (moves/grab.ts drawPoseSprite: outlined, tinted like him), every elbow and knee
// off art/limb.ts.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH as W } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { drawLeg, drawArmTo, drawTorsoFromHips } from '../../../m1/game/render/player/body';
import { drawPoseSprite, drawPoseHead } from '../../moves/grab';
import { elbow, knee, reachTo } from '../../art/limb';
import { type Boss, bossH, drawBoss } from './bosses';
import type { Lm } from './landmarks';

type Ctx = CanvasRenderingContext2D;
type P = [number, number];

/** The beats (frames). */
export const T_REACH = 18, T_LIFT = 54, T_WIND = 80, T_RELEASE = 90, T_FREE = 118;
export interface Throw {
  b: Boss; m: Lm;
  t: number;
  /** Where he stands, which way he faces (at the landmark). */
  x: number; feet: number; face: 1 | -1;
  /** The flight: from, to, how long, how far into it. */
  x0: number; y0: number; x1: number; y1: number; T: number; ft: number;
  landed: boolean;
}

export const startThrow = (state: GameState, b: Boss, m: Lm): Throw => {
  const p = state.player, x = p.pos.x + p.width / 2;
  b.mode = 'carried'; b.vx = 0;
  playSound('crunch', 0.6, -6); playSound('punch', 0.5, -10);
  return { b, m, t: 0, x, feet: p.pos.y + p.height, face: m.x >= x ? 1 : -1, x0: 0, y0: 0, x1: m.x, y1: m.foot - Math.min(60, m.def.h * 0.45), T: 60, ft: 0, landed: false };
};

/** Where the carried boss is (its middle), its turn: on his hands, over his head. */
const carriedAt = (th: Throw): { x: number; y: number; ang: number } => {
  const t = th.t, h = bossH(th.b);
  const lift = Math.max(0, Math.min(1, (t - T_REACH) / (T_LIFT - T_REACH)));
  const wind = Math.max(0, Math.min(1, (t - T_LIFT) / (T_WIND - T_LIFT)));
  const ease = (k: number) => k * k * (3 - 2 * k);
  // (from lying in front of him on the ground, up over his head, then leaned back behind it)
  const x = th.x + th.face * (34 - ease(lift) * 34 - ease(wind) * 18);
  const half = th.b.who === 'satan' ? 58 : 34;
  const y = th.feet - 14 - ease(lift) * (70 + half) + ease(wind) * 6;
  void h;
  const ang = th.face * (-Math.PI / 2) * (0.6 + 0.4 * ease(lift)) - th.face * wind * 0.4;
  return { x, y, ang };
};

/** Each frame. Returns whether he's still held out of control (true: the heave isn't done). */
export const updateThrow = (state: GameState, th: Throw, onLand: (th: Throw) => void) => {
  th.t++;
  const p = state.player;
  if (th.t === T_REACH) playSound('crunch', 0.5, -4);
  if (th.t === T_LIFT - 10) playSound('bellow', 0.6, -10);
  if (th.t === T_RELEASE) {
    const at = carriedAt(th);
    th.x0 = at.x; th.y0 = at.y;
    const d = Math.abs(th.x1 - th.x0);
    th.T = Math.max(40, Math.min(96, Math.round(d / 9)));
    th.b.mode = 'flying'; th.b.spin = at.ang;
    playSound('whoosh', 0.9, -10); playSound('roar', 0.5, 0);
  }
  if (th.t > T_RELEASE && !th.landed) {
    th.ft++;
    th.b.spin += th.face * 0.22;
    if (th.ft >= th.T) { th.landed = true; th.b.x = th.x1; th.b.y = th.m.foot; onLand(th); }
  }
  // (the camera: with them through the flight to the wreck, then back)
  if (th.t >= T_RELEASE && th.t < T_RELEASE + th.T + 100) {
    const f = flightAt(th), mid = th.t < T_RELEASE + th.T ? (f.x + p.pos.x) / 2 : th.x1;
    state.cameraOverride = { x: mid - W / 2, y: state.camera.y };
  } else if (th.t >= T_RELEASE + th.T + 100) state.cameraOverride = null;
  return th.t < T_FREE;
};
/** Where the flying boss is (its middle): a high arc to the landmark. */
const flightAt = (th: Throw) => {
  const k = Math.min(1, th.ft / th.T), peak = 120 + Math.abs(th.x1 - th.x0) * 0.25;
  return { x: th.x0 + (th.x1 - th.x0) * k, y: th.y0 + (th.y1 - th.y0) * k - Math.sin(k * Math.PI) * peak };
};
export const throwDone = (th: Throw) => th.landed && th.t > T_RELEASE + th.T + 110;

// ---------------------------------------------------------------------------------------------------------------
// Drawing

export const drawThrow = (c: Ctx, state: GameState, th: Throw) => {
  if (th.t < T_RELEASE) {
    const at = carriedAt(th);
    // (behind him while it's low in front, over him once it's up)
    if (th.t < T_REACH) drawBoss(c, state, th.b, at);
    drawHeave(c, state, th.x, th.feet, th.face, th.t);
    if (th.t >= T_REACH) drawBoss(c, state, th.b, at);
    return;
  }
  if (th.t < T_FREE) drawHeave(c, state, th.x, th.feet, th.face, th.t);
  if (!th.landed) { const f = flightAt(th); drawBoss(c, state, th.b, { x: f.x, y: f.y, ang: th.b.spin }); }
};

/** Him heaving (feet at (x, feet), facing `face`), `t` frames in: squat and reach, the lift, the lean back, the
 *  pitch, the follow-through. */
export const drawHeave = (c: Ctx, state: GameState, x: number, feet: number, face: 1 | -1, t: number) => {
  const f = state.frame;
  const phase: 'reach' | 'lift' | 'wind' | 'pitch' | 'follow' = t < T_REACH ? 'reach' : t < T_LIFT ? 'lift' : t < T_WIND ? 'wind' : t < T_RELEASE + 6 ? 'pitch' : 'follow';
  drawPoseSprite(c, x, feet, face, g => heavePose(g, f, phase, t));
};
const UPPER = 20, FORE = 20, THIGH = 13, SHIN = 13;
const leg = (g: Ctx, hip: P, foot: P, back: boolean, toe = 0) => {
  const ft = reachTo(hip[0], hip[1], foot[0], foot[1], THIGH, SHIN), kn = knee(hip[0], hip[1], ft[0], ft[1], THIGH, SHIN, 1);
  drawLeg(g, hip, kn, ft, toe, back);
};
const arm = (g: Ctx, sh: P, hand: P, back: boolean) => {
  const hd = reachTo(sh[0], sh[1], hand[0], hand[1], UPPER, FORE), el = elbow(sh[0], sh[1], hd[0], hd[1], UPPER, FORE, 1);
  drawArmTo(g, sh, el, hd, back, back ? 5 : 6);
};
/** His heave's poses, facing right, feet at the origin (the torso's frame from the hips, as his own sprite's). */
export const heavePose = (g: Ctx, f: number, phase: 'reach' | 'lift' | 'wind' | 'pitch' | 'follow', t = 0) => {
  const S = {
    reach: { hipY: -16, feet: [[-15, 0], [16, 0]] as P[], lean: 0.6, hands: [[24, -10], [28, -8]] as P[], mood: 'grit' as const, head: [7, -35] as P },
    lift: { hipY: -22, feet: [[-14, 0], [14, 0]] as P[], lean: -0.04, hands: [[-2, -60], [8, -62]] as P[], mood: 'roar' as const, head: [3, -37] as P },
    wind: { hipY: -22, feet: [[-16, 0], [12, 0]] as P[], lean: -0.32, hands: [[-10, -56], [-2, -60]] as P[], mood: 'yell' as const, head: [0, -37] as P },
    pitch: { hipY: -20, feet: [[-20, 0], [18, 0]] as P[], lean: 0.42, hands: [[26, -46], [32, -42]] as P[], mood: 'roar' as const, head: [8, -36] as P },
    follow: { hipY: -19, feet: [[-22, 0], [18, 0]] as P[], lean: 0.55, hands: [[28, -16], [32, -12]] as P[], mood: 'grit' as const, head: [9, -34] as P },
  }[phase];
  const strain = phase === 'lift' ? Math.sin(t * 0.9) * 1 : 0;
  leg(g, [-5, S.hipY], S.feet[0], true);
  leg(g, [5, S.hipY], S.feet[1], false);
  g.save(); g.translate(0, S.hipY); g.rotate(S.lean);
  arm(g, [-8, -22], [S.hands[0][0], S.hands[0][1] + strain], true);
  drawTorsoFromHips(g);
  drawPoseHead(g, S.head[0], S.head[1], 0, S.mood, f);
  arm(g, [11, -22], [S.hands[1][0], S.hands[1][1] + strain], false);
  g.restore();
};
export const HEAVE_PHASES = ['reach', 'lift', 'wind', 'pitch', 'follow'] as const;
