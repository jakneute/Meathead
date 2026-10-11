// The town, drawn (the final pass: peak SNES, fake 3D outdoors, one eye for the lot). The backdrop (sky.ts): the gloomy
// sky by the hour, the far hills, the ELEVATOR TO HELL's clock tower growing as he goes, the town's skyline. In the
// world, back to front: the street going back and the far townhouses along it, the moat cut through it, the plaza, the
// terrace and the stairs raised on it (ground.ts); the shopfronts a step back from where he walks, their sides going
// back, and the castle at the top of the stairs (buildings.ts); the near faces of everything raised and the street
// under his feet, bent (ground.ts); the furniture, the balconies, the lamps (props.ts); the haunted kiddie rides
// (rides.ts).

import type { GameState } from '../../../m1/game/core/state';
import { viewOf } from './paint';
import { drawGoingBack, drawPlayPlane, drawMoatDressing } from './ground';
import { drawShops, drawCastle } from './buildings';
import { drawProps } from './props';
import { drawRides } from './rides';

export { drawTownBackdrop } from './sky';
export { townLamps } from './props';

type Ctx = CanvasRenderingContext2D;

export const drawTownBack = (c: Ctx, state: GameState) => {
  const v = viewOf(state);
  drawGoingBack(c, v);
  drawShops(c, v);
  drawCastle(c, v);
  drawPlayPlane(c, v);
  drawMoatDressing(c, v);
  drawProps(c, v);
  drawRides(c, state);
};
