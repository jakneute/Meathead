// The jungle, drawn (its art in art/): the backdrop (the jungle going back in layers, light through the canopy), then
// in the world: the ground going back and the ravines through it, the trees further back, the play plane (the
// overlook's face, the floor under him, bent), the trees he climbs and the branches he stands on, the signs and the
// park showing through, the vines; in front, the nearest plants.

import type { GameState } from '../../../m1/game/core/state';
import { viewOf } from './art/paint';
import { drawGoingBack, drawPlayPlane } from './art/ground';
import { drawBackTrees, drawTrees } from './art/trees';
import { drawSigns, drawProps, drawLife, drawExitView } from './art/props';

export { drawJungleBackdrop } from './art/backdrop';
export { drawJungleFront } from './art/front';
export { jungleLamps } from './art/props';

type Ctx = CanvasRenderingContext2D;

/** World space, behind everything that moves (the vines go on after). */
export const drawJungleBack = (c: Ctx, state: GameState) => {
  const v = viewOf(state);
  drawExitView(c, v);
  drawGoingBack(c, v);
  drawBackTrees(c, v);
  drawPlayPlane(c, v);
  drawTrees(c, v);
  drawSigns(c, v);
  drawProps(c, v);
  drawLife(c, v);
};
