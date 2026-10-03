// The finale's boulder, pitched like a big-league fastball (see combat/weapons.ts startPitch / updatePitch): his whole
// body in it, keyframed over the throw (k: 0 at the start of the windup, 1 at the end of the follow-through).
//   the set:      hands together at his chest, rock in the glove hand's palm;
//   the leg kick: the lead knee up high to his chest, leaning back, the throwing arm dropping down and back;
//   the stride:   the lead leg out long and planted, the arm cocked up behind his head, the glove arm pointed at him;
//   the release:  the arm whipped over the top (the rock gone at PITCH_RELEASE_AT);
//   the follow-through: the arm right down across him, bent over the front knee, the back leg kicked up behind.
// Local coordinates, as the rest of him: (0, 0) the middle of his feet, facing +x, up is -y.

import { PITCH_FRAMES, PITCH_RELEASE_AT } from '../../combat/finaleBuffs';
import { drawArm, drawLeg, skinTone, skinShadow, skinHighlight } from './body';
import { drawRock, PLAYER_ROCK } from '../bosses/boulders';

type Ctx = CanvasRenderingContext2D;

/** Where in the throw the rock leaves his hand. */
export const PITCH_RELEASE_K = 1 - PITCH_RELEASE_AT / PITCH_FRAMES;

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Between keyframes (each [k, value...]), eased. */
const key = (k: number, frames: [number, ...number[]][]): number[] => {
  if (k <= frames[0][0]) return frames[0].slice(1);
  for (let i = 1; i < frames.length; i++) {
    const [k1] = frames[i];
    if (k <= k1) {
      const k0 = frames[i - 1][0], t = smooth((k - k0) / (k1 - k0 || 1));
      return frames[i].slice(1).map((v, j) => frames[i - 1][j + 1] + (v - frames[i - 1][j + 1]) * t);
    }
  }
  return frames[frames.length - 1].slice(1);
};

const R = PITCH_RELEASE_K;

/** How far he leans (radians: back is negative), and how far down he sinks into it. */
export const pitchLean = (k: number) => {
  const [rot, y] = key(k, [[0, 0, 0], [0.28, -0.14, -2], [0.48, -0.08, 2], [R, 0.1, 3], [R + 0.16, 0.26, 4], [1, 0.16, 2]]);
  return { rot, y };
};

/** The legs: the lead knee up, then the long stride, then the back leg kicked up behind (drawn back leg first). */
export const drawPitchLegs = (ctx: Ctx, k: number) => {
  // [k, knee x, knee y, foot x, foot y, toe angle] for the back leg, then the lead leg
  const back = key(k, [[0, -3, -11, -5, 0, 0], [0.3, -2, -11, -6, 0, 0], [0.5, -8, -11, -14, 0, 0], [R, -12, -10, -20, -1, 0.1], [R + 0.18, -14, -16, -26, -22, 0.9], [1, -10, -14, -18, -12, 0.5]]);
  const lead = key(k, [[0, 6, -11, 6, 0, 0], [0.3, 15, -35, 9, -22, 0.3], [0.5, 15, -16, 23, 0, 0], [R, 14, -13, 22, 0, 0], [1, 13, -12, 20, 0, 0]]);
  drawLeg(ctx, [-4, -22], [back[0], back[1]], [back[2], back[3]], back[4], true);
  drawLeg(ctx, [5, -22], [lead[0], lead[1]], [lead[2], lead[3]], lead[4], false);
};

/** The glove arm (the free one, from its shoulder at (-15, -45)): together at his chest, then pointed out at the
 * alien, then tucked in hard as the throwing arm comes through. */
export const drawPitchGloveArm = (ctx: Ctx, k: number) => {
  const [ex, ey, fx, fy] = key(k, [[0, -6, -36, 4, -38], [0.3, -6, -38, 2, -40], [0.5, 0, -46, 14, -48], [R, -2, -42, 10, -44], [R + 0.15, -10, -34, -2, -32], [1, -12, -34, -4, -30]]);
  drawArm(ctx, -15, -45, ex, ey, fx, fy, skinTone, skinShadow, skinHighlight);
};

/** The throwing arm, from its shoulder at (sx, sy): the rock in his fist till it's let go. */
export const drawPitchArm = (ctx: Ctx, k: number, sx: number, sy: number) => {
  // [k, elbow x, elbow y, fist x, fist y] (from the shoulder)
  const [ex, ey, fx, fy] = key(k, [
    [0, -4, 10, -6, 7],
    [0.3, -12, 8, -30, 12],
    [0.5, -18, -2, -36, -14],
    [R, 2, -12, 10, -24],
    [R + 0.14, 12, 4, 18, 18],
    [1, 6, 14, -2, 28],
  ]);
  drawArm(ctx, sx, sy, sx + ex, sy + ey, sx + fx, sy + fy, skinTone, skinShadow, skinHighlight, sx + fx + 1);
  if (k < R) drawRock(ctx, sx + fx + 1, sy + fy - 1, 9, k * 3, PLAYER_ROCK, 7);
  // (the whip: a couple of hard white arcs of air where the hand's just been)
  if (k >= R - 0.04 && k < R + 0.16) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 3; i++) {
      const a = -2.2 + i * 0.45, r = 26;
      ctx.fillRect(Math.round(sx + Math.cos(a) * r), Math.round(sy + Math.sin(a) * r), 4, 2);
    }
  }
};
