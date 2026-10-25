// The land bosses' spam breaker. The user's: "i don't want the player to be given more than 5 uninterrupted seconds
// spamming the same attack on a boss" (holding fire with any weapon, dive kick after dive kick off his head, charge
// after charge, uppercut loops, one special weapon). Each fight keeps a Spam, ticks it on every hit that lands on its
// boss with the hit's key, and when it fires does something of its own about it (moves off, counters, goes for the
// spot he's stood on). A hit of another kind, or a gap of more than GAP frames with none, starts the run over.

import type { Player } from '../m1/types';

/** The run that's too long (frames, first hit to last: a boss's breather is 60, so this is the fifth hit running, 4 s
 *  in), and the gap with no hits that ends a run. */
export const RUN = 240, GAP = 90;

export type Spam = { key: string; since: number; last: number };
export const newSpam = (): Spam => ({ key: '', since: 0, last: -1e9 });

/** What landed: his move (the engine marks a charge move landing; a shot it doesn't), else the weapon he's shooting. */
export const hitKey = (p: Player, melee: boolean): string =>
  melee ? (p.isDivekicking ? 'dive' : p.isUppercutting ? 'uppercut' : p.isSliding ? 'slide' : 'charge') : `shot:${p.currentWeapon}`;

/** A hit landed (at frame `now`): true when the same kind of hit has kept landing for RUN frames (then it starts
 *  counting again, so it fires again if he keeps it up). */
export const spamTick = (s: Spam, now: number, key: string): boolean => {
  if (key !== s.key || now - s.last > GAP) { s.key = key; s.since = now; }
  s.last = now;
  if (now - s.since < RUN) return false;
  s.since = now;
  return true;
};

/** Stop counting (the boss moved off on his own, a phase change, a cutscene): the next hit starts a fresh run. */
export const spamReset = (s: Spam) => { s.key = ''; s.last = -1e9; };
