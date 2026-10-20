// Piper never says the same thing twice in one life (the user's: "make sure piper doesn't say the same lines twice on
// the same life"). Every Piper line in the land (the PA, the trials, the broom fight, her bedroom) is picked here: one of
// the pool's lines she hasn't said since he last (re)spawned, preferring one not heard in the last 45 s; null once the
// pool's used up (an ambient bark then goes unsaid; a scripted beat falls back to pickLine: piperMust). By line text,
// so it works across the clean / shitty / naked pools. Cleared by the land's build (every respawn, every new visit).

import { pickFreshLine, pickLine } from '../../m1/game/platform/speech';

const said = new Set<string>();

/** A new life: everything she's said is sayable again. */
export const clearPiperLines = () => { said.clear(); };

/** One of these she hasn't said this life (marked said), or null if she's said them all. */
export const piperLine = (pool: readonly string[]): string | null => {
  const left = pool.filter(l => !said.has(l));
  if (!left.length) return null;
  const line = pickFreshLine(left) ?? left[Math.floor(Math.random() * left.length)];
  said.add(line);
  return line;
};

/** For a scripted beat that waits on her line: a fresh one this life if there is one, else pickLine (never stalls). */
export const piperMust = (pool: readonly string[]): string => piperLine(pool) ?? pickLine(pool);
