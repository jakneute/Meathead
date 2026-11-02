// The tracks go by (the train stands still in the world; the world moves past it at tr.v): whatever's down on them goes
// by with them. The owner's "knocking any enemy off the tracks should show them quickly moving away. sometimes i see a
// splat on the tracks that doesn't move when the train is supposed to be moving. hides the illusion." Each frame the
// train's rolling: the splats and smears on the ground, the bodies lying there (the pancakes, the heads off them), the
// bodies flying low over it, and anybody planted in it (knocked out and flung back: followups.ts) go back at the
// ground's speed, and off the back of the screen they're gone. What's on the train (its roofs, its floors, up off the
// ground) stays with the train.

import type { FrameContext } from '../../../m1/game/core/context';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { plantedOnMovingGround } from '../../moves/followups';
import { GY } from '../geometry';

/** The ground's band: on it (a splat on the ties, the rails) down to under it. */
const TOP = GY - 16, BOT = GY + 40;
/** A body in the air this low over the ground (under the cars' floors) is swept back with it: it's fallen off. */
const LOW = GY - 40;

export const driftGround = (ctx: FrameContext, x0: number, x1: number, v: number) => {
  if (v <= 0) return;
  const { state } = ctx, dx = -v, cull = state.camera.x - 240;
  const inX = (x: number) => x > x0 - 400 && x < x1 + CANVAS_WIDTH;
  // (the splats and the stuck bits: on the ground, along with it; off the back, gone)
  let drop = false;
  for (const p of state.particles) {
    if (!(p.isSplat || p.isStuck) || p.pos.y < TOP || p.pos.y > BOT || !inX(p.pos.x)) continue;
    p.pos.x += dx;
    if (p.pos.x < cull) { p.life = 0; drop = true; }
  }
  if (drop) state.particles = state.particles.filter(p => p.life > 0);
  if (state.groundSmears?.length) state.groundSmears = state.groundSmears.filter(s => {
    if (s.y < TOP || s.y > BOT) return true;
    s.x1 += dx; s.x2 += dx;
    return s.x2 > cull;
  });
  // (the bodies lying on it, and their heads)
  if (state.enemyDeaths.length) state.enemyDeaths = state.enemyDeaths.filter(d => {
    const feet = d.y + d.h;
    if (feet < TOP || feet > BOT || !inX(d.x)) return true;
    d.x += dx;
    if (d.head && d.head.y > TOP - 30) d.head.x += dx;
    return d.x + d.w > cull;
  });
  // (flung off it, low over it: swept back with it, tumbling; the engine takes it off the screen)
  for (const e of state.enemies) {
    if (!e.isBlownAway || e.pos.y + e.height < LOW || !inX(e.pos.x)) continue;
    e.pos.x += dx * 0.85;
  }
  // (planted in it: knocked out, back with it)
  plantedOnMovingGround(ctx, x0 - 400, x1 + CANVAS_WIDTH, TOP, BOT, dx, cull);
};
