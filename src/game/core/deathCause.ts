// What the death screen says when a stage has nothing particular of its own: what killed him (the last thing that hurt
// him), or the boss whose fight it was, or the fall. See content/deaths.ts.

import type { GameState } from './state';
import { DEATH_LINES, BOSS_DEATH_LINES, FALL_DEATH_LINES } from '../../content/deaths';
import { pickRandom } from './utils';

/** How recently he has to have been hurt by it for it to be what killed him (frames). */
const RECENT = 120;

/** What killed him, if it's known (not the fall, not a boss fight in general). */
export const deathByCause = (state: GameState): string | undefined => {
  const h = state.lastHurt;
  // (still in one piece: it was the fall, or a set piece, that got him, not what hurt him last)
  if (!h || state.frame - h.at > RECENT || state.player.health > 0) return undefined;
  const lines = DEATH_LINES[h.source] ?? BOSS_DEATH_LINES[h.source];
  return lines ? pickRandom(lines) : undefined;
};

/** Everything else: off the bottom of the world, or the boss got him. */
export const deathFallback = (state: GameState, stageId: string | null, fell: boolean): string | undefined => {
  if (fell) return pickRandom(FALL_DEATH_LINES);
  if (state.arenaLocked && stageId && BOSS_DEATH_LINES[stageId]) return pickRandom(BOSS_DEATH_LINES[stageId]);
  return undefined;
};
