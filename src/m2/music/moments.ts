// The game's moments the music follows that aren't in the GameState: the VICTORY stamp, the walk-away, the walk
// into a portal. Each ticks musicMoment every frame it's up (with who or where); the cue system (cues.ts) reads
// momentOn. Nothing imported: anything can call it.

export type MomentKind = 'victory' | 'walkaway' | 'portal' | 'alphaend';
const at: Partial<Record<MomentKind, { t: number; arg?: string }>> = {};
/** When the tab was hidden (null: it's showing). */
let hiddenAt: number | null = null;
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { hiddenAt = document.hidden ? performance.now() : null; });

/** This moment is on (this frame), `arg` naming it: the boss walked away from, the land walked into. */
export const musicMoment = (kind: MomentKind, arg?: string) => { at[kind] = { t: performance.now(), arg }; };
/** On (pinged within the last `within` ms), and what it said; or null. (A hidden tab runs no frames, so nothing pings: the moment's held as it was, not timed out (the user's: the stage's
 *  music came on in the walk-away when he opened another tab).) */
export const momentOn = (kind: MomentKind, within = 350) => {
  const m = at[kind];
  if (!m) return null;
  // (hidden: on if it was on when the tab went away)
  if (hiddenAt !== null) return hiddenAt - m.t < within ? m : null;
  return performance.now() - m.t < within ? m : null;
};
