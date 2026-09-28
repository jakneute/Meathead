// Dale's stage: the ones with their own AI. (The sicario, the enforcer and the
// man behind the car door ride on the usual shooter / charger / shield logic;
// the coyote borrows the wolverine's bounding lunge, the scorpion the crab's
// scuttle, and the tourists in town carry on like the beachgoers.)
//
//   rattlesnake: coiled up, dead still, until you're close. Then the rattle
//                (the tell), and a strike: a fast, short lunge along the
//                ground, and it pulls back to coil up again.

import { Enemy } from '../../../types';
import type { FrameContext } from '../../core/context';
import { mid, safeAhead, seesPlayer, holdingOff } from './index';

export const runDaleKindAI = (ctx: FrameContext, e: Enemy): boolean => {
  switch (e.kind) {
    case 'rattlesnake': rattlesnake(ctx, e); return false;
    default: return false;
  }
};

/** How long it rattles before it strikes, how fast and how long the strike is, and the pause before it can go again. */
export const SNAKE_RATTLE = 30;
const SNAKE_STRIKE = 9.5, SNAKE_STRIKE_FRAMES = 13, SNAKE_RECOIL = 44;

const rattlesnake = (ctx: FrameContext, e: Enemy) => {
  const { player } = ctx.state;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const toward = (mid(player).x < mid(e).x ? -1 : 1) as 1 | -1;
  switch (e.aiState) {
    case 'idle':
    default:
      // Coiled, tongue flicking, watching
      e.vel.x = 0;
      e.facing = toward;
      if (seesPlayer(ctx, e, 250, 90) && !holdingOff(ctx.state)) { e.aiState = 'rattle'; e.aiTimer = 0; }
      break;
    case 'rattle':
      e.vel.x = 0;
      e.facing = toward;
      if (e.aiTimer > SNAKE_RATTLE) { e.aiState = 'strike'; e.aiTimer = 0; }
      break;
    case 'strike':
      // (not off the edge of anything)
      e.vel.x = safeAhead(ctx, e, e.facing!, 16) ? e.facing! * SNAKE_STRIKE : 0;
      if (e.aiTimer > SNAKE_STRIKE_FRAMES) { e.aiState = 'recoil'; e.aiTimer = 0; }
      break;
    case 'recoil':
      e.vel.x *= 0.75;
      if (e.aiTimer > SNAKE_RECOIL) { e.aiState = seesPlayer(ctx, e, 250, 90) && !holdingOff(ctx.state) ? 'rattle' : 'idle'; e.aiTimer = 0; }
      break;
  }
};
