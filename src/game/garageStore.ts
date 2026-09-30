// What's in the garage: kept for this session only (in memory: a refresh or a new session starts it empty, while how
// souvenirs work might still change; nothing's written to the browser). A boss's souvenirs
// come one per difficulty cleared: the first clear of him (on any difficulty) takes one of his three home at random,
// and clearing him on each difficulty not cleared before takes one of the ones that are left. Clearing him again on a
// difficulty already done brings nothing new.

import { SOUVENIRS, Souvenir } from '../content/garage';

/** The difficulties a stage can be cleared on (hard and very hard are coming: normal's all there is so far). */
export type Difficulty = 'normal' | 'hard' | 'veryhard';

const KEY = 'meathead-garage';
const CLEARS_KEY = 'meathead-clears';

// (this session's, in memory; and anything an earlier build left saved in the browser is cleared out, once)
const memory = new Map<string, unknown>();
try { if (typeof localStorage !== 'undefined') { localStorage.removeItem(KEY); localStorage.removeItem(CLEARS_KEY); } } catch { /* no storage */ }
const read = <T,>(key: string, fallback: T): T => (memory.has(key) ? memory.get(key) as T : fallback);
const write = (key: string, value: unknown) => { memory.set(key, value); };

/** The souvenirs he's got (their ids). */
export const ownedSouvenirs = (): string[] => {
  const ids = read<unknown>(KEY, []);
  return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string' && SOUVENIRS.some(s => s.id === id)) : [];
};

/** The souvenir of this boss's he took home most recently (its id), if he's got any. */
export const lastSouvenirOf = (boss: string): string | null => {
  const mine = ownedSouvenirs().filter(id => SOUVENIRS.find(s => s.id === id)?.boss === boss);
  return mine.length ? mine[mine.length - 1] : null;
};

/** Which difficulties each boss has been cleared on. */
const clears = (): Record<string, Difficulty[]> => {
  const c = read<unknown>(CLEARS_KEY, {});
  return c && typeof c === 'object' ? c as Record<string, Difficulty[]> : {};
};

/**
 * A boss down on a difficulty: if it's the first time he's been cleared on that one, one of his souvenirs he hasn't got
 * yet goes home (null if it's a difficulty he's already been cleared on, or there's none of his left).
 */
export const takeSouvenir = (boss: string, difficulty: Difficulty = 'normal'): Souvenir | null => {
  const all = clears();
  const done = Array.isArray(all[boss]) ? all[boss] : [];
  if (done.includes(difficulty)) return null;
  write(CLEARS_KEY, { ...all, [boss]: [...done, difficulty] });
  const owned = ownedSouvenirs();
  const left = SOUVENIRS.filter(s => s.boss === boss && !owned.includes(s.id));
  if (!left.length) return null;
  const got = left[Math.floor(Math.random() * left.length)];
  write(KEY, [...owned, got.id]);
  return got;
};
