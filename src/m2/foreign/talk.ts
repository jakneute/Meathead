// What every pavilion's lines are shaped like, and gathering them for the voices. Pure data and helpers ONLY: the
// lines.ts files import this, and tools/voices bundles them in node (nothing here may pull in the engine, the canvas
// or timeOfDay.ts: import.meta.env isn't there).

/** The land's PA voice (a cheerful, smarmy, very American announcer over the lamppost horns). */
export const PA_VOICE = 'm2.foreign.pa';

/** Clean, shat, naked: a pool for each (somebody reacting to the state of him). */
export interface ByPants { clean: string[]; shitty: string[]; nude: string[] }
export const allOf = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];

/** A gag: passing world x from..to (from the pavilion's start; and his feet at least `minH` up, if given), he says one
 *  of `lines`, once. */
/** The time of day, coarsely (for a line that mentions it: it says the right one). */
export type DayPart = 'morning' | 'day' | 'evening' | 'night';
export interface Gag {
  from: number; to: number; key: string; lines: string[]; minH?: number; maxH?: number;
  /** Said instead of `lines` at that time of day (a line that names the time never gets it wrong). */
  byTime?: Partial<Record<DayPart, string[]>>;
}

export interface PavilionTalk {
  /** The PA's hello for this pavilion (by his pants), as he walks in. */
  pa: ByPants;
  /** His line walking in (after the PA). */
  arrive: string[];
  gags: Gag[];
}

export type HurtTable = Record<string, { hurt: string[]; death: string[] }>;

/** A pavilion's lines for the voices: Meathead's (his own and every hurt), the death screens, the PA's, the cast's. */
export const pavilionVoices = (t: PavilionTalk, hurts: HurtTable, cast: [voices: { m: string; f: string } | { m: string; f: string }[], pool: ByPants][], extra: Record<string, string[]> = {}) => {
  const out: Record<string, string[]> = {
    meathead: [...t.arrive, ...t.gags.flatMap(g => [...g.lines, ...Object.values(g.byTime ?? {}).flat()]), ...Object.values(hurts).flatMap(h => h.hurt)],
    death: Object.values(hurts).flatMap(h => h.death),
    [PA_VOICE]: allOf(t.pa),
  };
  for (const [vs, pool] of cast) for (const v of Array.isArray(vs) ? vs : [vs]) for (const id of [v.m, v.f]) out[id] = [...(out[id] ?? []), ...allOf(pool)];
  for (const [k, v] of Object.entries(extra)) out[k] = [...(out[k] ?? []), ...v];
  for (const k of Object.keys(out)) out[k] = [...new Set(out[k])];
  return out;
};
