// What the death screen says when a stage has nothing particular of its own: what killed him (the last thing that hurt
// him), or the boss whose fight it was, or the fall. See content/deaths.ts.

import type { GameState } from './state';
import { DEATH_LINES, BOSS_DEATH_LINES, FALL_DEATH_LINES, PLUCK_DEATH_LINES } from '../../content/deaths';
import { pickRandom } from './utils';

/**
 * How recently he has to have been hurt by it for it to be what killed him (frames). Everything that hurts him says so
 * the moment it does, and he's dead the moment his health runs out, so what killed him was hurt-recorded just now:
 * anything older was something before it (a machete a second ago, then a one-shot kill that set nothing: that's not
 * the machete's kill). A few frames' grace for a death that's checked a frame or two later.
 */
const RECENT = 8;

/** Was this (a hurt recorded on frame `at`) just now, the hurt that killed him? */
export const hurtJustNow = (state: GameState, at: number) => state.frame - at >= 0 && state.frame - at <= RECENT;

/** Is the last thing that hurt him the one that was recorded on frame `at` (nothing's hurt him since)? A stage's own
 * lines for one of its hazards only if it's the hazard that did it. */
export const lastHurtWas = (state: GameState, at: number) => !!state.lastHurt && state.lastHurt.at === at && hurtJustNow(state, at);

/** What killed him, if it's known (not the fall, not a boss fight in general). */
export const deathByCause = (state: GameState): string | undefined => {
  const h = state.lastHurt;
  // (still in one piece: it was the fall, or a set piece, that got him, not what hurt him last)
  if (!h || !hurtJustNow(state, h.at) || state.player.health > 0) return undefined;
  const lines = DEATH_LINES[h.source] ?? BOSS_DEATH_LINES[h.source];
  return lines ? pickRandom(lines) : undefined;
};

/** A bird took his eyes (it dived on him, and that was it): that, whatever the stage would have said. */
export const pluckDeathMessage = (state: GameState): string | undefined => {
  const h = state.lastHurt, pb = state.pluckedBy;
  if (!h || !pb || pb.frame !== h.at || !hurtJustNow(state, h.at) || state.player.health > 0) return undefined;
  const kind = state.enemies.find(e => e.id === pb.id)?.kind ?? '';
  return pickRandom([...(PLUCK_DEATH_LINES[kind] ?? []), ...PLUCK_DEATH_LINES.any]);
};

/** Everything else: off the bottom of the world, or the boss got him. */
export const deathFallback = (state: GameState, stageId: string | null, fell: boolean): string | undefined => {
  if (fell) return pickRandom(FALL_DEATH_LINES);
  if (state.arenaLocked && stageId && BOSS_DEATH_LINES[stageId]) return pickRandom(BOSS_DEATH_LINES[stageId]);
  return undefined;
};
