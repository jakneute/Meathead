// Meathead and Chelsea never say the same thing twice in one life in the White House (the user's: "he and Chelsea won't
// repeat the same line twice on the same life but have potentially more things to say during combat, etc."), both
// halves (fantasy/piperLines.ts's way): a line from the pool not said since he last (re)spawned, one not heard in the
// last 45 s first; null once the pool's used up (an ambient line then goes unsaid; a scripted beat falls back to
// pickLine: whMust, never stalls). By line text, so it works across the clean / shitty / naked pools. Cleared by
// whitehouse1's build (every respawn, every new visit: the land builds every section).

import { pickFreshLine, pickLine } from '../../../m1/game/platform/speech';

const said = new Set<string>();

/** A new life: everything's sayable again. */
export const clearWhLines = () => { said.clear(); };

/** One of these not said this life (marked said), or null if they've all been said. */
export const whLine = (pool: readonly string[]): string | null => {
  const left = pool.filter(l => !said.has(l));
  if (!left.length) return null;
  const line = pickFreshLine(left) ?? left[Math.floor(Math.random() * left.length)];
  said.add(line);
  return line;
};

/** For a beat that waits on the line: a fresh one this life if there is one, else pickLine. */
export const whMust = (pool: readonly string[]): string => whLine(pool) ?? pickLine(pool);
