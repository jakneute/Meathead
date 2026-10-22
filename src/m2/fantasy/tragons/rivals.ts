// The suitors and Truelling Tragons (the glen's queue: BLAKE, RAFAEL, HANK, glen/rivals.ts's RIVALS). Not on the ride
// with him (the user's: "no suitors are fought on the dragon ride"): they went ahead of him on the train before his,
// and all three live through it (the castle's boutique and the broom roster get all three). Glimpsed at the unload:
// off their train, in the yard (Blake bent over puking, Rafael fixing his hair, Hank cheering), each has his say at him
// in turn (ride.ts arrive), then out the exit to the castle they go. Drawn here; their words over them (art.ts's HUD).

import type { GameState } from '../../../m1/game/core/state';
import { box } from '../section';
import { drawSuitor } from '../suitors';
import { RIVALS } from '../glen/rivals';
import { GY, EXIT_X } from './layout';
import type { Tragons } from './state';
import type { Ctx } from '../kit';

/** The suitors' places in the unload's yard (from the decks' end). */
export const unloadSpots = (deckEnd: number) => [deckEnd + 300, deckEnd + 380, deckEnd + 470];

export const drawUnloadRivals = (c: Ctx, state: GameState, t: Tragons, spots: number[]) => {
  if (t.phase !== 'arrive') return;
  const f = state.frame;
  RIVALS.forEach((r, i) => {
    const x = spots[i] + t.unload.walk;
    if (x > EXIT_X + 60) return;
    const talking = !!t.unload.talk[r.id];
    const walking = t.unload.walk > 0;
    const pose = walking ? 'walk' : talking ? 'talk' : r.id === 'blake' ? 'hurt' : r.id === 'hank' ? 'cheer' : 'stand';
    drawSuitor(c, x, GY, walking ? 1 : -1, f, r.look, pose, { talking, stride: t.unload.walk + i * 23 });
    // (Blake's lunch, coming back up)
    if (r.id === 'blake' && !walking && !talking && f % 50 < 24) for (let k = 0; k < 4; k++) box(c, x - 18 - k * 4, GY - 66 + k * 9 + (f % 4), 5, 4, k % 2 ? '#84CC16' : '#A3E635');
  });
};
