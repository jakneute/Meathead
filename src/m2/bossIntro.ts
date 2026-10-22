// A land boss's intro cutscene, seen this visit: one flag, the same for all eight (Artie, Donnie, the queen, Steve,
// Harry, Tucker, Piper, Stupid Dad). The user's: the full intro (gross-up and all) plays on the first encounter in each
// visit to the land; only a death in the fight (back outside the boss door, walked back in) gets the short retry entrance.
//
// Kept in state.stageMemo: it outlives a death (a respawn rebuilds the stage, not the memo) and goes with the visit
// (every fresh way into a land, from the hub's portal, the checkpoint-skip cheat or a new file, starts the memo empty).
// So leaving the land and coming back with the boss still alive, it's the full intro again.
//
// Set only when the intro's actually over: played through to the fight, or SKIP >> taken. Never at the door's kick, a
// checkpoint, a section's build, or partway in. (The one exception is the cheat starting him at a boss's own checkpoint,
// which counts as a run that's been there: the world as a run left it.)

import type { GameState } from '../m1/game/core/state';

export type IntroBoss = 'artie' | 'donnie' | 'queen' | 'steve' | 'harry' | 'tucker' | 'piper' | 'dad';

const key = (boss: IntroBoss) => `m2:boss-intro:${boss}`;
/** The intro's been seen this visit (a retry: the short entrance). */
export const bossIntroSeen = (state: GameState, boss: IntroBoss) => state.stageMemo[key(boss)] === '1';
/** The intro's over (played through or skipped): from here, this visit, back in is a retry. */
export const markBossIntroSeen = (state: GameState, boss: IntroBoss) => { state.stageMemo[key(boss)] = '1'; };
