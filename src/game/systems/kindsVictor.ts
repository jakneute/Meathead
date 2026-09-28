// Victor's stage: the wildlife with its own AI. (The goons ride on the usual
// shooter / charger / shield logic in their heat gear; the salamander and the
// vulture borrow the wolverine's and the eagle's.)
//
//   magmafish: lurks under the lava, just a glint and some bubbles, and leaps
//              out at you in an arc when you're near, then splashes back in.
//              Out of the lava it's fair game: shoot it or punch it.

import { Enemy } from '../../types';
import { GRAVITY } from '../../constants';
import type { FrameContext } from '../context';
import { mid } from './kinds';

export const runVictorKindAI = (ctx: FrameContext, e: Enemy): boolean => {
  switch (e.kind) {
    case 'magmafish': magmafish(ctx, e); return true;
    default: return false;
  }
};

/** How far along the lava a fish will go after you, how near you have to be for it to leap, and how long it waits between leaps. */
const FISH_RANGE = 170, FISH_REACH = 240, FISH_REST = 80;

const magmafish = (ctx: FrameContext, e: Enemy) => {
  const { player } = ctx.state;
  e.aiTimer = (e.aiTimer || 0) + 1;
  // (it was placed with its belly on the lava)
  const surface = (e.homeY ?? e.pos.y) + e.height;
  const home = e.homeX ?? e.pos.x;
  switch (e.aiState) {
    case 'idle':
    default: {
      // Under the surface, cruising toward where you are (within its stretch of lava)
      const target = Math.max(home - FISH_RANGE, Math.min(home + FISH_RANGE, mid(player).x - e.width / 2));
      e.pos.x += Math.sign(target - e.pos.x) * Math.min(Math.abs(target - e.pos.x), 1.6);
      e.pos.y = surface + 10;
      e.facing = mid(player).x < mid(e).x ? -1 : 1;
      const dx = Math.abs(mid(player).x - mid(e).x);
      if (dx < FISH_REACH && e.aiTimer > FISH_REST && mid(player).y < surface + 20 && player.health > 0) {
        e.aiState = 'leap'; e.aiTimer = 0;
        e.pos.y = surface - e.height;
        e.vel = { x: Math.max(-6, Math.min(6, (mid(player).x - mid(e).x) / 26)), y: -14.5 };
        for (let i = 0; i < 10; i++) ctx.state.particles.push({ pos: { x: mid(e).x, y: surface }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 5 }, life: 24, color: i % 2 ? '#F97316' : '#FDE047', size: 3 + Math.random() * 3 });
      }
      break;
    }
    case 'leap':
      // Out in an arc, jaws first, then back in
      e.vel.y += GRAVITY * 0.8;
      e.pos.x = Math.max(home - FISH_RANGE - 60, Math.min(home + FISH_RANGE + 60, e.pos.x + e.vel.x));
      e.pos.y += e.vel.y;
      e.facing = e.vel.x < 0 ? -1 : 1;
      if (e.vel.y > 0 && e.pos.y + e.height > surface + 4) {
        e.aiState = 'idle'; e.aiTimer = 0; e.vel = { x: 0, y: 0 };
        for (let i = 0; i < 8; i++) ctx.state.particles.push({ pos: { x: mid(e).x, y: surface }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 4 }, life: 20, color: i % 2 ? '#EA580C' : '#FACC15', size: 3 + Math.random() * 3 });
      }
      break;
  }
};

/** A fish under the lava can't be hit (only its glint shows). */
export const submerged = (e: Enemy) => e.kind === 'magmafish' && (!e.aiState || e.aiState === 'idle');
