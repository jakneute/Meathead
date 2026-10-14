// The crater section, drawn (the final pass: peak SNES). The pieces:
//
//   paint.ts   the kit: the section's ramps, the one eye, faces going back, panels, posts
//   site.ts    outdoors, the impact site (the hour's light): the sky and Futureland far off, the ground going back and
//              coming toward him, the wreck, the dead, the park's things, XENOSCARE's front
//   ship.ts    indoors, XENOSCARE: a haunted spaceship (the park's legally distinct derelict): the queue, the pre-show's
//              teleporter, the bridge, the specimen bay, the engine room, the corridor aft to the hold
//   green.ts   the cheap animatronic greens
//   aliens.ts  Zorblax's people (the live ones, the dead)

import type { GameState } from '../../../m1/game/core/state';
import { drawSiteBack, drawSiteFront } from './site';
import { drawShipBack } from './ship';

export { drawImpactBackdrop, fireAt, SITE_LAMPS } from './site';
export { drawCheapGreen } from './green';
export { floorAt, shown } from './paint';

type Ctx = CanvasRenderingContext2D;

/** Behind him (world space): the impact site, then the ship. */
export const drawCraterBack = (c: Ctx, state: GameState) => {
  drawSiteBack(c, state);
  drawShipBack(c, state);
};

/** In front of him: the queue's way in. */
export const drawCraterFront = (c: Ctx, state: GameState) => drawSiteFront(c, state);
