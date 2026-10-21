// Where his weapons' hits land that aren't projectiles (the mallet's swings, smashes and tornado, the soul sucker's
// cone, the stunt car's fireball, a meteor going up), as a box, for whatever in a stage breaks when it's hit and isn't
// an enemy (Space Needle 2's big window). Projectiles are in state.projectiles already, for anybody to look at.

export interface Strike { x0: number; y0: number; x1: number; y1: number; dmg: number }
const hooks = new Set<(s: Strike) => void>();

/** Told of every strike from here on. */
export const onStrike = (fn: (s: Strike) => void) => { hooks.add(fn); return () => { hooks.delete(fn); }; };

/** A hit landing over (x0, y0)-(x1, y1) (either way round), this hard. */
export const struckAt = (x0: number, y0: number, x1: number, y1: number, dmg: number) => {
  if (!hooks.size) return;
  const s = { x0: Math.min(x0, x1), y0: Math.min(y0, y1), x1: Math.max(x0, x1), y1: Math.max(y0, y1), dmg };
  for (const f of hooks) f(s);
};
