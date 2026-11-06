// Piper never says the same thing twice in one life (the user's: "make sure piper doesn't say the same lines twice on
// the same life"). Every Piper line in the land (the PA, the trials, the broom fight, her bedroom) is picked here: one of
// the pool's lines she hasn't said since he last (re)spawned, preferring one not heard in the last 45 s; null once the
// pool's used up (an ambient bark then goes unsaid; a scripted beat falls back to pickLine: piperMust). By line text,
// so it works across the clean / shitty / naked pools. Cleared by the land's build (every respawn, every new visit).

import { pickFreshLine, pickLine } from '../../m1/game/platform/speech';
import { isLandCleared } from '../store';
import { inRefight, refightPool } from '../endgame/park4/hook';
import type { ByPants } from './talk';

const said = new Set<string>();

/** A new life: everything she's said is sayable again. */
export const clearPiperLines = () => { said.clear(); };

/** One of these she hasn't said this life (marked said), or null if she's said them all. */
export const piperLine = (pool: readonly string[]): string | null => {
  // (Ned's boss rush: her refight's pools in place of these (pickLine's swap; this picks for itself, so it asks too))
  if (inRefight('fantasy')) pool = refightPool(pool);
  const left = pool.filter(l => !said.has(l));
  if (!left.length) return null;
  const line = pickFreshLine(left) ?? left[Math.floor(Math.random() * left.length)];
  said.add(line);
  return line;
};

/** For a scripted beat that waits on her line: a fresh one this life if there is one, else pickLine (never stalls). */
export const piperMust = (pool: readonly string[]): string => piperLine(pool) ?? pickLine(inRefight('fantasy') ? refightPool(pool) : pool);

// ---------------------------------------------------------------------------------------------------------------
// After she's dead (the owner's revisit brief, 2026-11-02: "piper no longer speaks on the megaphone. you still fight
// suitors, but their inentions are revenge for killing piper, not winning a contest"). Her PA lines go through paLine /
// paMust (nothing, once she's dead: every caller goes on without her); the lines that change with her dead are swapped
// in with gonePants / gone (revisitLines.ts).

/** Piper's dead on this save: the land plays without her voice, the suitors out for revenge. */
export const piperGone = () => isLandCleared('fantasy');
/** Her line over the PA: piperLine, or none once she's dead. */
export const paLine = (pool: readonly string[]): string | null => (piperGone() ? null : piperLine(pool));
/** Her scripted PA beat: piperMust, or none once she's dead (the caller goes straight on). */
export const paMust = (pool: readonly string[]): string | null => (piperGone() ? null : piperMust(pool));
/** A pool by pants, with her dead: the revisit's pants pools over the normal ones (the ones it has). */
export const gonePants = (normal: ByPants, rev: Partial<ByPants> | undefined): ByPants => (piperGone() && rev ? { ...normal, ...rev } : normal);
/** Anything else, with her dead: the revisit's, if it has one. */
export const gone = <T>(normal: T, rev: T | undefined): T => (piperGone() && rev !== undefined ? rev : normal);
