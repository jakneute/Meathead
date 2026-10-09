// His footsteps: quiet, under everything, a step every stride he walks or runs on the ground, sounding like whatever
// he's walking on. The stage's usual ground (Artie's snow, the desert's sand, the city's concrete), boards and
// catwalks underfoot, floors indoors; a stage can say otherwise for a floor of its own (footstep, in its layout).

import type { FrameContext } from '../core/context';
import type { Block } from '../../types';
import { playSound } from '../platform/audio';
import { getStageLayout } from '../stages';

export type Surface = 'hard' | 'snow' | 'metal' | 'wood' | 'dirt' | 'sand' | 'wet';

/** How far he goes between steps (px). */
const STRIDE = 36;
/** How loud, over the sounds' own (already quiet) levels. */
let VOLUME = 0.8;
/** A game's own level for them (Meathead 2's are up over its music and its PA). */
export const setFootstepVolume = (v: number) => { VOLUME = v; };

/** Each stage's ground outdoors, and what its raised boards and walkways (the one-way platforms) are. */
const STAGE_GROUND: Record<string, { ground: Surface; deck: Surface }> = {
  'Artie Avalanche': { ground: 'snow', deck: 'wood' },
  'Victor Volcano': { ground: 'dirt', deck: 'metal' },
  'Ernie Earthquake': { ground: 'hard', deck: 'metal' },
  'Hector Hurricane': { ground: 'sand', deck: 'wood' },
  'Toxic Tommy': { ground: 'hard', deck: 'metal' },
  'Blackout Barry': { ground: 'hard', deck: 'metal' },
  'Oily Oscar': { ground: 'dirt', deck: 'metal' },
  'Drug Trade Dale': { ground: 'sand', deck: 'wood' },
};

const surfaceOf = (ctx: FrameContext, floor: Block): Surface => {
  const { state } = ctx;
  const own = getStageLayout(ctx.stageId)?.footstep?.(state, floor);
  if (own) return own;
  const s = STAGE_GROUND[ctx.stageId ?? ''];
  if (!s) return 'hard';
  if (floor.indoor) return 'wood';
  if (floor.oneWay) return s.deck;
  // (the bosses' lairs are floored, all but Artie's ice cave)
  if (state.arenaLocked) return ctx.stageId === 'Artie Avalanche' ? 'snow' : 'hard';
  return s.ground;
};

export const footsteps = (ctx: FrameContext) => {
  const { state } = ctx;
  const p = state.player;
  const walking = p.isGrounded && Math.abs(p.vel.x) > 0.8 && !p.isCharging && !p.isSliding && !p.isDucking
    && !p.jetski && !p.bike && !p.skiing && !p.swimming && !p.hidden && !p.inCutscene && p.health > 0;
  if (!walking) { p.stepDist = STRIDE * 0.7; return; }
  p.stepDist = (p.stepDist ?? 0) + Math.abs(p.vel.x);
  if (p.stepDist < STRIDE) return;
  p.stepDist = 0;
  const feet = p.pos.y + p.height, cx = p.pos.x + p.width / 2;
  const floor = state.blocks.find(b => b.type !== 'pit' && cx >= b.x - 4 && cx <= b.x + b.w + 4 && Math.abs(b.y - feet) <= 4);
  if (!floor) return;
  playSound(`step_${surfaceOf(ctx, floor)}` as const, VOLUME);
};
