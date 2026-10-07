// At Meathead 2's startup: the shared line tables (kill lines, hurt lines, callouts, death screens) cleared of anything
// that doesn't fit Happy Land (consistency.ts), so they're never picked; and anything the engine's code says itself
// that doesn't fit is dropped before it's said. A list left empty is taken out, so the next most general one is used.

import * as dialogue from '../../m1/content/dialogue';
import * as deaths from '../../m1/content/deaths';
import { setLineFilter } from '../../m1/game/platform/speech';
import { fitsHappyLand } from './consistency';

/** Filters every list of lines in it, in place; returns whether anything's left. */
const clean = (v: unknown): boolean => {
  if (Array.isArray(v)) {
    if (!v.every(x => typeof x === 'string')) { v.forEach(clean); return true; }
    const kept = v.filter(t => fitsHappyLand(t));
    v.splice(0, v.length, ...kept);
    return kept.length > 0;
  }
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    for (const k of Object.keys(o)) {
      const x = o[k];
      if (typeof x === 'string') { if (!fitsHappyLand(x)) delete o[k]; continue; }
      if (!clean(x) && Array.isArray(x)) delete o[k];
    }
    return Object.keys(o).length > 0;
  }
  return true;
};

export const cleanLines = () => {
  const d = dialogue as unknown as Record<string, unknown>;
  for (const k of ['VULGARITIES', 'KILL_LINES', 'ENEMY_KILL_LINES', 'GENERIC_KILL_LINES', 'GUT_LINES', 'SURFACE_CALLOUTS']) clean(d[k]);
  const bd = dialogue.BOSS_DIALOGUE as unknown as Record<string, unknown>;
  clean(bd.SPECIFIC_HAZARD_HURT); clean(bd.HURT);
  // (a callout with nothing left to call keeps the plain one: it's still a kill)
  const fallback = dialogue.KILL_CALLOUTS.crush.lines.filter(fitsHappyLand);
  for (const c of Object.values(dialogue.KILL_CALLOUTS)) {
    const kept = c.lines.filter(fitsHappyLand);
    c.lines.splice(0, c.lines.length, ...(kept.length ? kept : fallback));
  }
  const de = deaths as unknown as Record<string, unknown>;
  for (const k of ['DEATH_LINES', 'FALL_DEATH_LINES', 'ANIMAL_DEATH_LINES']) clean(de[k]);
  setLineFilter(fitsHappyLand);
};
