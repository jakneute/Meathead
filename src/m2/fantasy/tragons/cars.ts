// The three trains, as things stand on: where each one is, who's on which, which is above or below which. Shared by the
// ride (ride.ts), the rivals (rivals.ts) and the drawing (art.ts).

import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import { rearX, TL, AWAY, type Lane } from './layout';
import type { Tragons, Train } from './state';

/** Anything with a box. */
interface Boxed { pos: { x: number; y: number }; width: number; height: number; vel: { x: number; y: number } }

/** A train's blocks: the roof (a jump-through: the dragon's back, lit along its top), its head (a wall over the front:
 *  the dragon's neck and head) and its tail (a low wall at the back: its tail curled up). */
export const makeTrainBlocks = (state: GameState) => {
  const roof: Block = { x: 0, y: AWAY, w: TL, h: 16, type: 'platform', oneWay: true, hidden: true, tag: 'tragon-roof' } as Block;
  const head: Block = { x: 0, y: AWAY, w: 16, h: 46, type: 'wall', hidden: true, tag: 'tragon-head' } as Block;
  const tail: Block = { x: 0, y: AWAY, w: 12, h: 24, type: 'wall', hidden: true, tag: 'tragon-tail' } as Block;
  state.blocks.push(roof, head, tail);
  return { roof, head, tail };
};

/** Puts a train's blocks where it is (or away, gone). */
export const placeBlocks = (t: Tragons, tr: Train) => {
  const live = tr.phase === 'ok';
  const x = rearX(t.dist);
  tr.roof.x = x; tr.roof.y = live ? tr.y : AWAY;
  // (pulled in at the unload, the heads are no wall: he steps off the front onto the deck)
  tr.head.x = x + TL - 16; tr.head.y = live && t.phase !== 'arrive' && t.phase !== 'done' ? tr.y - 46 : AWAY;
  tr.tail.x = x; tr.tail.y = live ? tr.y - 24 : AWAY;
};

/** Stood on this train (his feet or anybody's on its roof, over it). */
export const standsOn = (o: Boxed, t: Tragons, tr: Train, slack = 4) => {
  if (tr.phase !== 'ok') return false;
  const x = rearX(t.dist), cx = o.pos.x + o.width / 2, feet = o.pos.y + o.height;
  return cx >= x - 4 && cx <= x + TL + 4 && Math.abs(feet - tr.y) <= slack && o.vel.y >= -0.01;
};
/** Which train somebody's stood on (null: none). */
export const trainUnder = (o: Boxed, t: Tragons, slack = 4) => t.trains.find(tr => standsOn(o, t, tr, slack)) ?? null;

/** Over a train (his middle within its length). */
export const overTrains = (o: Boxed, t: Tragons) => { const x = rearX(t.dist), cx = o.pos.x + o.width / 2; return cx >= x - 20 && cx <= x + TL + 20; };

/** The train above (dir -1) or below (+1) a height, the nearest that's there to land on (null: none). */
export const trainBeyond = (t: Tragons, fromY: number, dir: -1 | 1, not?: Lane) => {
  let best: Train | null = null;
  for (const tr of t.trains) {
    if (tr.phase !== 'ok' || tr.lane === not) continue;
    const d = (tr.y - fromY) * dir;
    if (d < 40) continue;
    if (!best || (tr.y - fromY) * dir < (best.y - fromY) * dir) best = tr;
  }
  return best;
};

/** A lane's train. */
export const trainOn = (t: Tragons, lane: Lane) => t.trains[lane];
