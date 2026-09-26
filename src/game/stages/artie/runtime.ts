// Artie's stage while it's being played: which set pieces have happened, and
// the hazards' moving parts. Rebuilt with the level on every (re)spawn; the
// checkpoint number says what's already behind you.

import type { GameState } from '../../state';
import type { FrameContext } from '../../context';
import type { Controls } from '../../input';
import { COURSE } from './course';
import { makeKindEnemy } from '../../systems/kinds';
import { createHazards, updateHazards, Hazards } from './hazards';

export interface ArtieRuntime {
  /** Which checkpoint this attempt started from (0 = the trailhead). */
  startedAt: number;
  hazards: Hazards;
}

export const getArtie = (state: GameState) => state.stage as ArtieRuntime | null;

export const createArtieRuntime = (state: GameState, skipToBoss: boolean): ArtieRuntime => {
  const startedAt = skipToBoss ? 4 : state.checkpoint;
  // Pickups along the trail (only the ones still ahead of you)
  const fromX = startedAt > 0 ? COURSE.checkpoints[Math.min(3, startedAt)].x : -Infinity;
  COURSE.pickups.forEach((p, i) => {
    if (p.x < fromX) return;
    state.pickups.push({ id: `artie-pickup-${i}`, pos: { x: p.x - 10, y: p.y - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: p.type, life: 1e9 });
  });
  // The trail's wildlife and goons (the ones still ahead)
  for (const s of COURSE.spawns) if (s.x >= fromX) state.enemies.push(makeKindEnemy(s.kind, s.x, s.y));
  return { startedAt, hazards: createHazards(state) };
};

export const updateArtie = (ctx: FrameContext, controls: Controls): Controls => {
  const rt = getArtie(ctx.state);
  if (!rt) return controls;
  updateHazards(ctx, rt.hazards);
  return controls;
};
