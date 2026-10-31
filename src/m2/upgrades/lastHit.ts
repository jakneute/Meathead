// The last of his four moves to land on an enemy, and which (for the armor's follow-ups: moves/followups.ts). Noted from
// the engine's melee damage hook (apply.ts), which runs in the engine's own pass, after the grabs' step for that frame:
// the follow-ups' tick stamps it with the next frame they see, and counts their window from there.

import type { Enemy } from '../../m1/types';
import type { MeleeMove } from '../../m1/game/core/tuning';

export interface MeleeHit { e: Enemy; move: MeleeMove; at: number | null }
let last: MeleeHit | null = null;

export const noteMelee = (e: Enemy, move: MeleeMove) => { last = { e, move, at: null }; };
export const lastMelee = () => last;
/** The frame it's first seen at (the one after it landed). */
export const stampMelee = (frame: number) => { if (last && last.at === null) last.at = frame; };
/** Used (a follow-up's come of it), or gone with the stage. */
export const clearMelee = () => { last = null; };
