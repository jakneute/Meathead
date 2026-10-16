// Nobody in the park can swim (the user: "enemies knocked into water will immediately drown and float to the top").
// A land enemy, the cast or an animal that isn't a swimmer, that ends up in deep water (knocked in, thrown, shoved by
// a hazard, fallen) drowns there and then: a kill (DROWNED!, the usual kill line and drop), played out by the engine's
// drowned death (m1 enemies/drownDeath.ts): the flailing, under, up again face down and bobbing, then the burst, the
// way every keel-over death ends. Flung over the water (not in it), nothing. What lives in the water isn't touched.

import type { FrameContext } from '../m1/game/core/context';
import type { Enemy } from '../m1/types';
import type { WaterBody } from '../m1/game/stages/index';
import { isMidBoss } from '../m1/game/combat/midBoss';
import { startDrown } from '../m1/game/enemies/drownDeath';
import { m2Kind } from './kinds';

/** Kinds that live in the water (none on land with water to fall in, yet): they swim, they don't drown. */
const SWIMMERS = new Set<string>();
export const registerSwimmer = (kind: string) => { SWIMMERS.add(kind); };

/** Could it drown: alive, on the screen once, walks (not flies), not a boss, a mid-boss, a fixture or a swimmer. */
export const canDrown = (e: Enemy) => {
  if (e.health <= 0 || e.isBlownAway || !e.seen || e.type === 'boss' || isMidBoss(e) || e.enemyType === 'flyer') return false;
  const k = m2Kind(e.kind);
  return !k?.stats.air && !k?.fixture && !SWIMMERS.has(e.kind ?? '');
};

/** Drowns it, in the water given (its surface, its sides): the kill and the death. Whether it took. */
export const drownEnemy = (ctx: FrameContext, e: Enemy, w: { surface: number; x1: number; x2: number; key: string }, opts: { spray?: string[]; surfaceAt?: () => number } = {}) => {
  const { state, fx } = ctx, n = state.enemyDeaths.length;
  fx.killWithAnimation(e, 'drowned', 'charge_kill', 'drowned');
  const d = state.enemyDeaths[n];
  if (d?.kind === 'drowned') startDrown(d, w, opts);
  return e.health <= 0;
};

/** Each frame: anybody that can drown, in the stage's water past its middle, drowns. */
export const drownLanders = (ctx: FrameContext, bodyAt: (x: number, y: number) => WaterBody | null) => {
  for (const e of ctx.state.enemies) {
    if (!canDrown(e)) continue;
    const cx = e.pos.x + e.width / 2, waist = e.pos.y + e.height * 0.6;
    const w = bodyAt(cx, waist);
    if (!w || w.kind !== 'clean' || waist < w.surface + 6) continue;
    drownEnemy(ctx, e, w);
  }
};
