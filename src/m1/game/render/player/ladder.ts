// His poses on a ladder (Meathead 2's ladders: src/m2/moves/ladders.ts; Player.ladder). Drawn in his local frame
// (feet at 0, facing +x), into drawPlayer's vine poses (he's p.vine too, hanging, upright): the far arm, the legs, and,
// climbing or sliding, the gun arm (turned out to shoot, it's the vine's own level gun arm).
//
//   Climbing (and the rush up): hand over hand, the two hands and the two feet each on a rung (where the rungs are,
//   from how far up it he is), a hand and the opposite foot moving together, each one held on its rung while he goes
//   up past it, then let go and reached up two rungs; the gun stays in his fist, pointed up along the ladder.
//   Hanging (turned out to shoot): the far hand on a rung over his head, a foot on a rung, the other knee up on the
//   next. Sliding down: both hands up on the rails, legs straight down together, the rails smoking in his hands.

import type { Player } from '../../../types';
import { drawArmTo, drawLeg } from './body';

type Ctx = CanvasRenderingContext2D;
type Ladder = NonNullable<Player['ladder']>;

/** How long, of each two-rung cycle, a hand or foot stays on its rung (the rest: reaching for the next). */
const HOLD = 0.62;
const frac = (v: number) => v - Math.floor(v);

/**
 * Where a hand or foot is (local y), on its rung `k` rungs over his feet, in the cycle `off` rungs on (0 or 1: the two
 * pairs), and how far through a reach it is (0: on a rung).
 */
const limb = (l: Ladder, k: number, off: number) => {
  const R = l.rung, a = frac((l.up / R + off) / 2);
  // (no higher than the tops of the rails: up there, it's hold of them)
  const top = -l.reach + 3;
  if (a <= HOLD) return { y: Math.max(top, (2 * a - k) * R), reach: 0 };
  const t = (a - HOLD) / (1 - HOLD), e = t * t * (3 - 2 * t);
  const from = (2 * HOLD - k) * R, to = (2 * a - k - 2) * R;
  return { y: Math.max(top, from + (to - from) * e), reach: Math.sin(Math.PI * t) };
};

/** The rung nearest `y` (local), as it is up the ladder. */
const rungNear = (l: Ladder, y: number) => {
  const R = l.rung, o = frac(l.up / R) * R;
  return Math.max(-l.reach + 3, o + Math.round((y - o) / R) * R);
};

/** A leg from the hip to the foot on (fx, fy) (the ankle; the boot's sole on the rung under it), the knee forward. */
const legTo = (ctx: Ctx, hipX: number, fx: number, rungY: number, back: boolean) => {
  const hip: [number, number] = [hipX, -22], L1 = 11, L2 = 10.5;
  let fy = rungY - 3.5;
  let dx = fx - hip[0], dy = fy - hip[1], d = Math.hypot(dx, dy);
  const max = L1 + L2 - 0.5;
  if (d > max) { fy = hip[1] + (dy / d) * max; dx = fx - hip[0]; dy = fy - hip[1]; d = Math.hypot(dx, dy); }
  // (the knee out in front, whichever bend puts it there)
  const phi = Math.atan2(dy, dx), al = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * (d || 1)))));
  const k1 = Math.cos(phi + al), k2 = Math.cos(phi - al), ang = k1 > k2 ? phi + al : phi - al;
  const knee: [number, number] = [hip[0] + Math.cos(ang) * L1, hip[1] + Math.sin(ang) * L1];
  drawLeg(ctx, hip, knee, [fx, fy], 0, back);
};

/** The far arm: its hand on a rung over his head (climbing: hand over hand; sliding: on the rail, smoking). */
export const drawLadderBackArm = (ctx: Ctx, l: Ladder, frame: number) => {
  const sh: [number, number] = [-9, -46];
  let fist: [number, number];
  if (l.mode === 'slide') fist = [-2, Math.max(-l.reach + 3, -90)];
  else if (l.mode === 'hang') fist = [-2, rungNear(l, -88)];
  else { const h = limb(l, 7, 0); fist = [-5 - h.reach * 4, h.y]; }
  const el: [number, number] = [(sh[0] + fist[0]) / 2 - 6, (sh[1] + fist[1]) / 2 + 3];
  drawArmTo(ctx, sh, el, fist, true, 5.5);
  if (l.mode === 'slide') smoke(ctx, fist[0], fist[1], frame);
};

/** The legs: on the rungs (climbing, stepping up in turn; hanging, one knee up), or straight down together, sliding. */
export const drawLadderLegs = (ctx: Ctx, l: Ladder) => {
  if (l.mode === 'slide') {
    // (straight down, together, the boots turned out onto the rails)
    drawLeg(ctx, [-4, -22], [-3, -11], [-3, -3], 0.25, true);
    drawLeg(ctx, [5, -22], [5, -11], [5, -3], -0.2, false);
    return;
  }
  if (l.mode === 'hang') {
    // (stood on a rung, the near knee up on the next one, if it's not too high: otherwise on the same one)
    const r = rungNear(l, -3), r2 = r - l.rung >= -20 ? r - l.rung : r;
    legTo(ctx, -4, -4, r, true);
    legTo(ctx, 5, 6, r2, false);
    return;
  }
  // (the far foot with the near hand, the near foot with the far hand; his legs are short, so a step's not a whole
  // rung's climb: each foot stepped up from his feet to a knee's height, in time with his hands)
  const span = 2 * HOLD * l.rung, step = (y: number) => -15 + (y + l.rung) * (15 / span);
  const back = limb(l, 1, 1), near = limb(l, 1, 0);
  legTo(ctx, -4, -5 + back.reach * 3, step(back.y), true);
  legTo(ctx, 5, 7 + near.reach * 3, step(near.y), false);
};

/**
 * The gun arm, climbing or sliding: its fist up on a rung (or the rail) with the gun still in it, pointed up the
 * ladder (`weapon` draws it as it's drawn in his hand stood up, at the origin, the barrel along +x).
 */
export const drawLadderGunArm = (ctx: Ctx, l: Ladder, frame: number, weapon: (c: Ctx) => void) => {
  const sh: [number, number] = [14, -45];
  let fist: [number, number];
  if (l.mode === 'slide') fist = [9, Math.max(-l.reach + 3, -88)];
  else { const h = limb(l, 7, 1); fist = [12 + h.reach * 4, h.y]; }
  // (the gun up past his fist, the fist round its grip)
  ctx.save(); ctx.translate(fist[0], fist[1]); ctx.rotate(-Math.PI / 2 + 0.12); ctx.translate(-1, -4); weapon(ctx); ctx.restore();
  const el: [number, number] = [(sh[0] + fist[0]) / 2 + 6, (sh[1] + fist[1]) / 2 + 3];
  drawArmTo(ctx, sh, el, fist, false, 5.5);
  if (l.mode === 'slide') smoke(ctx, fist[0], fist[1], frame);
};

/** Hands on the rails going down fast: smoke off them. */
const smoke = (ctx: Ctx, x: number, y: number, frame: number) => {
  for (let k = 0; k < 3; k++) {
    const t = ((frame + k * 5) % 15) / 15;
    ctx.fillStyle = `rgba(214, 211, 209, ${(0.55 * (1 - t)).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(x + Math.sin(k * 2.3 + frame) * 3, y - 4 - t * 14, 2 + t * 4, 0, Math.PI * 2); ctx.fill();
  }
};
