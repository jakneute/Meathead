// Sawdust Gulch and the mines with the flooded shaft lit up and CON-FUCK-TIOUS's assay office under it (benLair.ts,
// benLairArt.ts): the town's section wrapped, its own code untouched. Its build, then the winze, the maze and the office
// cut out of the ground under the bed; the lair's frame before the town's own; its water (the maze's, the pool's), its
// camera row, its lighting, its drawing and its HUD over the town's.

import type { FrontierSection } from '../section';
import { buildBenLair, updateBenLair, benWaterAt, inLair, underBed } from './benLair';
import { drawBenLairBack, drawBenLairFront, drawBenLairHud, benLighting } from './benLairArt';

/** Where his feet sit on screen down there: the office (it fits, floor to ceiling, the rock over it), the maze (he's
 *  mid-screen: what's above and below him in view). */
const ROOM_ROW = 470, MAZE_ROW = 360;

export const withBenLair = (base: FrontierSection): FrontierSection => ({
  ...base,
  build: (state) => { base.build(state); buildBenLair(state); },
  update: (ctx, controls) => {
    const c = updateBenLair(ctx, controls);
    return base.update ? base.update(ctx, c) : c;
  },
  waterBodyAt: (state, x, y) => benWaterAt(x, y) ?? base.waterBodyAt?.(state, x, y) ?? null,
  cameraRow: (state) => (inLair(state) ? ROOM_ROW : underBed(state) ? MAZE_ROW : base.cameraRow?.(state)),
  lighting: (state, b) => benLighting(state, base.lighting?.(state, b) ?? b ?? null),
  drawBack: (c, state) => { base.drawBack?.(c, state); drawBenLairBack(c, state); },
  drawFront: (c, state) => { base.drawFront?.(c, state); drawBenLairFront(c, state); },
  drawHud: (c, state) => { base.drawHud?.(c, state); drawBenLairHud(c, state); },
});
