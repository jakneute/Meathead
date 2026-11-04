// Which Truelling Tragons plays: the from-behind ride (behind/: the owner's redo, 2026-11-03, the normal one) or the
// CLASSIC side-view ride (ride.ts's own, kept whole: the owner's "the old version of truelling tragons can stay as
// maybe an 'easter egg' hidden thingy when beating it or something").
//
// THE HOOK for unlocking and choosing it later (the owner's call, not made yet: beat the new ride, then a sign at the
// station or an option on a revisit): call setClassicTragons(true / false) before the ride's built (a fresh section
// build: the station, a respawn), or put CLASSIC_MEMO in the stage's memo. Today it's only the cheat panel's CLASSIC
// TRAGONS row (cheats.ts) and, in dev, ?classic on the URL.

import type { GameState } from '../../../m1/game/core/state';

/** A stage memo key: set (to anything) and this visit rides the classic one. */
export const CLASSIC_MEMO = 'fa-tragons-classic';

let classicOn = import.meta.env.DEV && typeof location !== 'undefined' && new URLSearchParams(location.search).has('classic');
/** Pick the classic ride (true) or the from-behind one (false), from now on (takes at the next build of the ride). */
export const setClassicTragons = (on: boolean) => { classicOn = on; };
export const classicTragonsPicked = () => classicOn;
/** Does this visit ride the classic side-view ride? Decided once per build of the ride (ride.ts settle). */
export const classicTragons = (state: GameState) => classicOn || !!state.stageMemo[CLASSIC_MEMO];
