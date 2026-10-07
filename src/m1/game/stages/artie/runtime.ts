// Artie's stage while it's being played: which set pieces have happened, and
// the hazards' moving parts. Rebuilt with the level on every (re)spawn; the
// checkpoint number says what's already behind you.

import type { GameState } from '../../core/state';
import type { FrameContext } from '../../core/context';
import type { Controls } from '../../platform/input';
import { COURSE, CP } from './course';
import { makeKindEnemy } from '../../enemies/kinds';
import { createHazards, updateHazards, Hazards } from './hazards';
import { createTram, updateTram, checkFellOffTram, Tram } from './tram';
import { createMooseFight, updateMooseFight, MooseFight } from './moose';
import { createSki, updateSki, Ski } from './ski';
import { createTease, updateTease, Tease } from './tease';

export interface ArtieRuntime {
  /** Which checkpoint this attempt started from (0 = the trailhead). */
  startedAt: number;
  hazards: Hazards;
  tram: Tram;
  moose: MooseFight;
  ski: Ski;
  /** The rumble in the woods, off the tram (the avalanche to come). */
  tease: Tease;
}

/** Nothing's placed closer than this ahead of where you start (the trailhead or a checkpoint). */
const SPAWN_CLEARANCE = 480;

export const getArtie = (state: GameState) => state.stage as ArtieRuntime | null;

export const createArtieRuntime = (state: GameState, skipToBoss: boolean): ArtieRuntime => {
  const startedAt = skipToBoss ? CP.DOOR : state.checkpoint;
  // Pickups along the trail (only the ones still ahead of you)
  const fromX = startedAt > 0 ? COURSE.checkpoints[startedAt].x : -Infinity;
  COURSE.pickups.forEach((p, i) => {
    if (p.x < fromX) return;
    state.pickups.push({ id: `artie-pickup-${i}`, pos: { x: p.x - 10, y: p.y - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: p.type, life: 1e9 });
  });
  // The trail's wildlife and goons (the ones still ahead, and never right on top of where you start)
  const startX = COURSE.checkpoints[startedAt].x;
  for (const s of COURSE.spawns) if (s.x >= fromX && s.x - startX >= SPAWN_CLEARANCE) state.enemies.push(makeKindEnemy(s.kind, s.x, s.y));
  return { startedAt, hazards: createHazards(state), tram: createTram(state, startedAt), moose: createMooseFight(state, startedAt), ski: createSki(state, startedAt), tease: createTease(startedAt) };
};

export const updateArtie = (ctx: FrameContext, controls: Controls): Controls => {
  const rt = getArtie(ctx.state);
  if (!rt) return controls;
  const { state } = ctx;
  const { player } = state;
  // Reaching the tram station saves your place
  if (state.checkpoint < CP.STATION && player.isGrounded && player.pos.x >= COURSE.checkpoints[CP.STATION].x) state.checkpoint = CP.STATION;
  // ...the edge of the moose's clearing, and halfway through the ice cave
  if (state.checkpoint >= CP.TOP && state.checkpoint < CP.CLEARING && player.isGrounded && player.pos.x >= COURSE.checkpoints[CP.CLEARING].x) state.checkpoint = CP.CLEARING;
  if (state.checkpoint >= CP.AFTER_MOOSE && state.checkpoint < CP.CAVE && player.isGrounded && player.pos.x >= COURSE.checkpoints[CP.CAVE].x) state.checkpoint = CP.CAVE;
  updateHazards(ctx, rt.hazards);
  updateTram(ctx, rt.tram);
  checkFellOffTram(ctx);
  updateMooseFight(ctx, rt.moose);
  controls = updateTease(ctx, rt.tease, rt.tram, controls);
  return updateSki(ctx, rt.ski, controls);
};
