// What's in the garage: kept in the browser (it's his, it stays: across runs, across sessions). Every kill of a boss
// brings home one of that boss's souvenirs he hasn't got yet, at random.

import { SOUVENIRS, Souvenir } from '../content/garage';

const KEY = 'meathead-garage';

/** The souvenirs he's got (their ids). */
export const ownedSouvenirs = (): string[] => {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string' && SOUVENIRS.some(s => s.id === id)) : [];
  } catch { return []; }
};

const save = (ids: string[]) => {
  try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* (no storage: it's just this session's) */ }
};

/** A boss down: one of his souvenirs he hasn't got yet, taken home (null if he's got all of that boss's already). */
export const takeSouvenir = (boss: string): Souvenir | null => {
  const owned = ownedSouvenirs();
  const left = SOUVENIRS.filter(s => s.boss === boss && !owned.includes(s.id));
  if (!left.length) return null;
  const got = left[Math.floor(Math.random() * left.length)];
  save([...owned, got.id]);
  return got;
};
