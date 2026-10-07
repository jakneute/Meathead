// What a body's come down on: concrete, water, snow, rock, sand... For the kill
// callouts that name what it hit ("KISSED CONCRETE!" on a sidewalk, a belly flop
// on the water), so they never contradict what's actually under it.

import type { GameState } from './state';
import type { Ground } from '../../content/dialogue';
import { getStageLayout } from '../stages';

/** Each stage's ground where it's got no surface of its own (its default terrain, its boss's room). */
const STAGE_GROUND: Record<string, Ground> = {
  'Artie Avalanche': 'snow', 'Victor Volcano': 'rock', 'Ernie Earthquake': 'rock', 'Hector Hurricane': 'sand',
  'Toxic Tommy': 'concrete', 'Blackout Barry': 'concrete', 'Oily Oscar': 'dirt', 'Drug Trade Dale': 'sand',
};

/** The stages' named surfaces, by what they are. */
const SURFACE_GROUND: Record<string, Ground> = {
  street: 'concrete', deck: 'concrete', cellblock: 'concrete', rubble: 'concrete', stairs: 'concrete', yard: 'concrete',
  bleacher: 'concrete', walk: 'concrete', floor: 'concrete', road: 'concrete', concrete: 'concrete', roof: 'concrete', office: 'concrete',
  citadel: 'rock', cliff: 'rock',
  water: 'water', pool: 'water',
  pier: 'wood', dock: 'wood',
  sand: 'sand', dirt: 'dirt', grass: 'grass',
  clubfloor: 'glass', carpet: 'carpet', marble: 'tile', tile: 'tile', grate: 'metal',
  muck: 'muck', lava: 'lava',
};

/** What's under a body at x whose feet are at y (undefined: nothing much, or not on the ground: the plain lines do). */
export const groundUnder = (state: GameState, x: number, feet: number): Ground | undefined => {
  const water = getStageLayout(state.stageId)?.waterBodyAt?.(state, x, feet);
  if (water) return water.kind === 'muck' ? 'muck' : 'water';
  const run = state.groundRuns.find(r => x >= r.x1 && x <= r.x2);
  if (run) {
    const y = run.y1 + ((x - run.x1) / Math.max(1, run.x2 - run.x1)) * (run.y2 - run.y1);
    // (up on a ledge, a roof, a raft, it's not the ground under it that it hit)
    if (Math.abs(feet - y) > 40) return undefined;
    return run.surface ? SURFACE_GROUND[run.surface] : state.stageId ? STAGE_GROUND[state.stageId] : undefined;
  }
  return state.groundRuns.length ? undefined : state.stageId ? STAGE_GROUND[state.stageId] : undefined;
};
