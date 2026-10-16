// Moving platforms (the longship on the wave machine, the cuckoo clock's wheel of figures, the gondolas): a one-way
// ledge the set piece moves each frame (before he moves); whoever's stood on it (him, the cast) goes with it.

import type { GameState } from '../../m1/game/core/state';
import type { Block } from '../../m1/types';
import { ledge } from './section';

export interface Mover { b: Block; x: number; y: number }

const AWAY = -99999;
export const makeMover = (state: GameState, x: number, y: number, w: number, tag: string): Mover => ({ b: ledge(state, x, y, w, { hidden: true, tag }), x, y });

/** Stood on it (feet on its top, over it)? */
const onIt = (b: Block, x: number, w: number, feet: number, grounded: boolean) => grounded && Math.abs(feet - b.y) < 4 && x + w > b.x + 2 && x < b.x + b.w - 2;

/** Moves it to (x, y) (its top's left end), and whoever's on it with it. `away`: taken out (not there to stand on). */
export const moveMover = (state: GameState, m: Mover, x: number, y: number, away = false) => {
  const b = m.b, dx = x - b.x, dy = y - b.y;
  if (b.y !== AWAY && !away) {
    const p = state.player;
    if (onIt(b, p.pos.x, p.width, p.pos.y + p.height, p.isGrounded) && !p.carried) { p.pos.x += dx; p.pos.y += dy; }
    for (const e of state.enemies) {
      if (e.health <= 0 || e.enemyType === 'flyer') continue;
      if (onIt(b, e.pos.x, e.width, e.pos.y + e.height, e.vel.y === 0)) { e.pos.x += dx; e.pos.y += dy; if (e.homeX !== undefined) e.homeX += dx; }
    }
  }
  b.x = x; b.y = away ? AWAY : y; m.x = x; m.y = y;
};
/** Is he stood on it right now? */
export const riding = (state: GameState, m: Mover) => { const p = state.player; return onIt(m.b, p.pos.x, p.width, p.pos.y + p.height, p.isGrounded); };
