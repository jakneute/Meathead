// Paddling the log (Player.logPaddle: Meathead 2's Wilderness Land log ride, frontier/logride/ride.ts): sat in it, a
// canoe paddle (the log's own: a park rental, painted blade) worked down its near side. Boosting (right held): hard
// quick strokes, the blade dug in ahead and hauled back past him, leaning into each one, lifted out and swung forward
// again. Braking (left held, so he's turned to face back up the ride): the blade planted out in front of him, braced
// against it, leaning back, shaking with the strain. Local frame: his body's (facing +x, feet at 0, 0, after the seat
// pose's bodyY/bodyRot). The paddle's part below the log's rim is drawn again over the log's near side by the ride's
// art (logride/art.ts drawLog), from what's recorded here as it's drawn (paddleShown), so it reads in front of the log.

import type { Player } from '../../../types';
import { drawArmTo } from './body';
import { elbow } from '../../../../m2/art/limb';

type Ctx = CanvasRenderingContext2D;
type Paddle = NonNullable<Player['logPaddle']>;
type P = [number, number];

/** One hard stroke (frames), the part of it the blade's in the water. */
export const STROKE = 22, POWER = 0.55;
/** The paddle: top grip to the blade's throat, the blade's length, the lower hand's way down from the grip. */
const SHAFT = 54, BLADE = 22, HANDS = 26;
const FRONT_SHOULDER: P = [14, -45], BACK_SHOULDER: P = [-6, -40];
const UPPER = 15, FORE = 15;

export interface PaddlePose { low: P; top: P; dir: P; inWater: boolean; k: number }

/** Where it is `q.t` frames in: the lower hand, the top grip, the way the shaft runs (top to blade). */
export const paddlePose = (q: Paddle): PaddlePose => {
  let hx: number, hy: number, th: number, inWater = true, k = 0;
  if (q.mode > 0) {
    k = (q.t % STROKE) / STROKE;
    if (k < POWER) {
      // (the power: dug in ahead, hauled back past his hip)
      const s = k / POWER, e = s * s * (3 - 2 * s);
      hx = 24 - 30 * e; hy = -37 + Math.sin(s * Math.PI) * 1.5; th = 0.45 - 0.95 * e;
    } else {
      // (the recovery: out, the blade swung back forward through the air)
      const s = (k - POWER) / (1 - POWER), e = s * s * (3 - 2 * s);
      hx = -6 + 30 * e; hy = -37 - Math.sin(s * Math.PI) * 16; th = -0.5 + 0.95 * e - Math.sin(s * Math.PI) * 0.35;
      inWater = s > 0.9;
    }
  } else {
    // (the brake: planted out in front, braced, juddering against the water)
    const j = Math.sin(q.t * 1.7) * 0.7 + Math.sin(q.t * 0.9) * 0.4;
    hx = 21 + j * 0.5; hy = -36 + Math.abs(j) * 0.3; th = 0.32 + j * 0.02;
  }
  const dir: P = [Math.sin(th), Math.cos(th)];
  return { low: [hx, hy], top: [hx - dir[0] * HANDS, hy - dir[1] * HANDS], dir, inWater, k };
};

/** How he leans with it: into each stroke boosting, back against it braking. */
export const paddleLean = (q: Paddle): { rot: number; y: number } => {
  if (q.mode < 0) return { rot: -0.2 + Math.sin(q.t * 1.7) * 0.012, y: 2 };
  const k = (q.t % STROKE) / STROKE;
  const s = k < POWER ? k / POWER : 1 - (k - POWER) / (1 - POWER);
  return { rot: 0.16 - s * 0.2, y: 2 + s * 0.8 };
};

/** The blade's middle (local), for the spray off it. */
export const bladeMid = (pp: PaddlePose): P => {
  const d = SHAFT - HANDS + BLADE * 0.55;
  return [pp.low[0] + pp.dir[0] * d, pp.low[1] + pp.dir[1] * d];
};

// ---- the paddle, stamped: drawn once pointing down (+y), the grip at (6, 0)
const W = 12, H = SHAFT + BLADE + 4;
let stamp: HTMLCanvasElement | null | undefined;
const INK = '#1A0F08';
const paintPaddle = (g: Ctx) => {
  const box = (x: number, y: number, w: number, h: number, c: string) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  // (the T-grip)
  box(1, 0, 10, 5, INK); box(2, 1, 8, 3, '#B07A3E'); box(2, 1, 8, 1, '#E0B070');
  // (the shaft: ash, lit down one side, the grain)
  box(4, 4, 4, SHAFT - 2, INK); box(5, 4, 2, SHAFT - 2, '#C8945A'); box(5, 4, 1, SHAFT - 2, '#ECC48A');
  for (let y = 9; y < SHAFT - 2; y += 7) box(6, y, 1, 3, '#8E5E2C');
  // (the blade: painted the ride's red, a cream band and its stripe, the tip worn back to the wood)
  const by = SHAFT;
  box(1, by, 10, BLADE + 2, INK);
  box(2, by + 1, 8, BLADE, '#B8321E'); box(2, by + 1, 2, BLADE, '#D8503A'); box(8, by + 1, 2, BLADE, '#7E1E12');
  box(2, by + 7, 8, 3, '#F0E2B8'); box(2, by + 8, 8, 1, '#1E3A5F');
  box(3, by + BLADE - 3, 6, 3, '#C8945A'); box(4, by + BLADE - 2, 2, 1, '#ECC48A');
  // (the shaft's spine down the blade)
  box(5, by + 1, 2, BLADE - 4, 'rgba(0,0,0,0.18)');
};
const getStamp = () => {
  if (stamp !== undefined) return stamp;
  if (typeof document === 'undefined') return (stamp = null);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); if (!g) return (stamp = null);
  paintPaddle(g);
  return (stamp = c);
};

/** The paddle (local), from its pose. */
export const drawPaddle = (ctx: Ctx, pp: PaddlePose) => {
  ctx.save();
  ctx.translate(pp.top[0], pp.top[1] - 2);
  ctx.rotate(-Math.atan2(pp.dir[0], pp.dir[1]));
  ctx.translate(-W / 2, 0);
  const s = getStamp();
  if (s) ctx.drawImage(s, 0, 0); else paintPaddle(ctx);
  ctx.restore();
};

/** The far arm reaching across to the top grip (drawn before his torso). */
export const drawPaddleBackArm = (ctx: Ctx, q: Paddle) => {
  const pp = paddlePose(q);
  drawArmTo(ctx, BACK_SHOULDER, elbow(BACK_SHOULDER[0], BACK_SHOULDER[1], pp.top[0], pp.top[1], UPPER, FORE, 1), pp.top, true, 4.5);
};

/** The paddle in front of him, the far fist over its grip, the near arm down on its shaft (his lead arm's layer). */
export const drawPaddleFront = (ctx: Ctx, q: Paddle) => {
  const pp = paddlePose(q);
  drawPaddle(ctx, pp);
  // (the far hand round the grip, seen over it)
  ctx.fillStyle = '#C68B45'; ctx.beginPath(); ctx.arc(pp.top[0], pp.top[1], 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#A87038'; ctx.fillRect(pp.top[0] - 3, pp.top[1] + 1, 6, 1);
  drawArmTo(ctx, FRONT_SHOULDER, elbow(FRONT_SHOULDER[0], FRONT_SHOULDER[1], pp.low[0], pp.low[1], UPPER, FORE, 1), pp.low, false, 5);
};

/** What was drawn this frame (world): for the ride's art to draw the paddle's lower part again over the log. */
export const paddleShown: { frame: number; x: number; y: number; rot: number; facing: number; bodyY: number; bodyRot: number; q: Paddle | null } = {
  frame: -1, x: 0, y: 0, rot: 0, facing: 1, bodyY: 0, bodyRot: 0, q: null,
};
