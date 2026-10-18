// Where things are on the train: each car's left end now (a cut-off end drops back), whether he's inside a car, which
// car's inside a spot is in, which car he's on. (Its own module so the cast's AI can ask without the cars' code.)

import type { GameState } from '../../../m1/game/core/state';
import { CARS, CAR_X, DECK, CEIL, COUPLER, END, ENTERABLE } from './layout';
import type { Train } from './state';

/** How far car i's dropped back (the cut's drift, if it's in the cut-off end). */
export const offOf = (tr: Train, i: number) => (tr.cut && tr.cut.phase === 'drift' && i <= tr.cut.k ? tr.cut.off : 0);
/** Car i's left end now. */
export const carXNow = (tr: Train, i: number) => CAR_X[i] + offOf(tr, i);

/** Is he inside car i (on its floor or anything in it, under its roof)? */
export const insideCar = (state: GameState, tr: Train, i: number) => {
  const d = CARS[i];
  if (!ENTERABLE.includes(d.kind) || tr.cars[i]?.gone) return false;
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height, x = carXNow(tr, i);
  return cx > x + END - 2 && cx < x + d.len - END + 2 && feet > CEIL + 6 && feet < DECK + 12;
};
/** The car he's inside, or -1. */
export const playerRoom = (state: GameState, tr: Train) => {
  for (let i = tr.rear; i < CARS.length; i++) if (insideCar(state, tr, i)) return i;
  return -1;
};
/** The car whose inside (x, y) is in, or -1. */
export const roomAt = (tr: Train, x: number, y: number) => {
  if (y < CEIL || y > DECK + 4) return -1;
  for (let i = tr.rear; i < CARS.length; i++) {
    const d = CARS[i];
    if (!ENTERABLE.includes(d.kind) || tr.cars[i]?.gone) continue;
    const cx = carXNow(tr, i);
    if (x > cx + END && x < cx + d.len - END) return i;
  }
  return -1;
};
/** The car he's on or in (by his middle), or -1. */
export const carAt = (tr: Train, x: number) => {
  for (let i = tr.rear; i < CARS.length; i++) { const a = carXNow(tr, i) - COUPLER / 2; if (x >= a && x < a + CARS[i].len + COUPLER) return i; }
  return -1;
};
