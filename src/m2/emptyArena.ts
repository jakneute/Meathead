// A land revisited after its boss is dead (the owner's revisit brief, 2026-11-02: "reaching any 'boss arena' has
// meathead say something, then it goes back to the hub (or the parking lot if wilderness land)"). One place for every
// land's: `bossGone(land)` for whether the boss is dead on this save; `leaveEmptyArena` once he's into the empty
// arena: he's held (a cutscene, no HUD), says his line (picked by the land with pickLine), and when it's done he's
// off: to the hub, or wherever `leave` sends him (Wilderness: back out to the parking lot, as after Tucker).

import type { GameState } from '../m1/game/core/state';
import { goTo, isLandCleared } from './store';
import { meatheadSays } from './adventure/section';

/** The land's boss is dead on this save: the revisit plays without him. */
export const bossGone = (land: string) => isLandCleared(land);

const going = new WeakSet<GameState>();

/** He's into the empty arena: his line, then off (once a visit). Call it every frame he's in; it holds him meanwhile. */
export const leaveEmptyArena = (state: GameState, line: string, leave: () => void = () => goTo('hub')) => {
  const p = state.player;
  p.inCutscene = true; p.vel.x = 0;
  if (going.has(state)) return;
  going.add(state);
  meatheadSays(state, line, true, leave);
};
