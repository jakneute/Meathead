// The game's moments the music follows that aren't in the GameState: the VICTORY stamp, the walk-away, the walk
// into a portal. Each ticks musicMoment every frame it's up (with who or where); the cue system (cues.ts) reads
// momentOn. Nothing imported: anything can call it.

export type MomentKind = 'victory' | 'walkaway' | 'portal';
const at: Partial<Record<MomentKind, { t: number; arg?: string }>> = {};

/** This moment is on (this frame), `arg` naming it: the boss walked away from, the land walked into. */
export const musicMoment = (kind: MomentKind, arg?: string) => { at[kind] = { t: performance.now(), arg }; };
/** On (pinged within the last `within` ms), and what it said; or null. */
export const momentOn = (kind: MomentKind, within = 350) => { const m = at[kind]; return m && performance.now() - m.t < within ? m : null; };
