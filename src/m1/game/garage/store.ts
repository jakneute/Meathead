// What's in the garage: the souvenirs he's taken home and which difficulties each boss has been cleared on. Held here
// for the run that's going; the save file it belongs to (game/save/files.ts) is loaded into it and saved from it, and
// a new game empties it. A boss's souvenirs come one per difficulty cleared: the first clear of him (on any
// difficulty) takes one of his three home at random, and clearing him on each difficulty not cleared before takes one
// of the ones that are left. Clearing him again on a difficulty already done brings nothing new.

import { SOUVENIRS, Souvenir } from '../../content/garage';

/** The difficulties a stage can be cleared on (hard and very hard are coming: normal's all there is so far). */
export type Difficulty = 'normal' | 'hard' | 'veryhard';
const DIFFICULTIES: Difficulty[] = ['normal', 'hard', 'veryhard'];

/** The garage as a save file keeps it. */
export interface GarageState {
  /** The souvenirs he's got (their ids), in the order he took them home. */
  souvenirs: string[];
  /** Which difficulties each boss has been cleared on. */
  clears: Record<string, Difficulty[]>;
}

let owned: string[] = [];
let cleared: Record<string, Difficulty[]> = {};

/** Anything read back in (a save file), kept to what makes sense: souvenirs that exist, difficulties that do. */
const clean = (s: unknown): GarageState => {
  const o = (s && typeof s === 'object' ? s : {}) as Record<string, unknown>;
  const souvenirs = Array.isArray(o.souvenirs) ? o.souvenirs.filter((id, i, all): id is string => typeof id === 'string' && SOUVENIRS.some(v => v.id === id) && all.indexOf(id) === i) : [];
  const clears: Record<string, Difficulty[]> = {};
  if (o.clears && typeof o.clears === 'object') {
    for (const [boss, ds] of Object.entries(o.clears as Record<string, unknown>)) {
      if (Array.isArray(ds)) clears[boss] = DIFFICULTIES.filter(d => ds.includes(d));
    }
  }
  return { souvenirs, clears };
};

/** What's in it now (a copy). */
export const garageState = (): GarageState => ({ souvenirs: [...owned], clears: Object.fromEntries(Object.entries(cleared).map(([k, v]) => [k, [...v]])) });
/** A save file's garage (or, with nothing, an empty one: a new game). */
export const setGarageState = (s?: unknown) => { const c = clean(s); owned = c.souvenirs; cleared = c.clears; };
/** Cleans up a garage read back from a save file. */
export const cleanGarageState = clean;

/** The souvenirs he's got (their ids). */
export const ownedSouvenirs = (): string[] => [...owned];

/** The souvenir of this boss's he took home most recently (its id), if he's got any. */
export const lastSouvenirOf = (boss: string): string | null => {
  const mine = owned.filter(id => SOUVENIRS.find(s => s.id === id)?.boss === boss);
  return mine.length ? mine[mine.length - 1] : null;
};

/** Marks a boss cleared on a difficulty; true if it's the first time on that one. */
const markCleared = (boss: string, difficulty: Difficulty) => {
  const done = cleared[boss] ?? [];
  if (done.includes(difficulty)) return false;
  cleared = { ...cleared, [boss]: [...done, difficulty] };
  return true;
};

/**
 * A boss down on a difficulty: if it's the first time he's been cleared on that one, one of his souvenirs he hasn't got
 * yet goes home (null if it's a difficulty he's already been cleared on, or there's none of his left).
 */
export const takeSouvenir = (boss: string, difficulty: Difficulty = 'normal'): Souvenir | null => {
  if (!markCleared(boss, difficulty)) return null;
  const left = SOUVENIRS.filter(s => s.boss === boss && !owned.includes(s.id));
  if (!left.length) return null;
  const got = left[Math.floor(Math.random() * left.length)];
  owned = [...owned, got.id];
  return got;
};

/**
 * For the time being: a boss down takes all three of his souvenirs home at once (the ones he hasn't got), whatever the
 * difficulty (and the clear's put down, on normal, the only one there is so far). (The one-per-difficulty way above is
 * how it'll go once hard and very hard are in.)
 */
export const takeAllSouvenirs = (boss: string, difficulty: Difficulty = 'normal'): Souvenir[] => {
  markCleared(boss, difficulty);
  const got = SOUVENIRS.filter(s => s.boss === boss && !owned.includes(s.id));
  if (got.length) owned = [...owned, ...got.map(s => s.id)];
  return got;
};
