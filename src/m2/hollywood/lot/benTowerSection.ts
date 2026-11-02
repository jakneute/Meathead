// The backlot with the HAPPYWOOD WATER TOWER grown huge over the western town's street, CON-FUCK-TIOUS up in its tank
// (benTower.ts, benTowerArt.ts): the lot's section wrapped, its own code untouched. Its build, then the tower's decks,
// walls and tank; the tower's frame before the lot's own; the tower's rigs after the lot's; in the tank, its camera row,
// its own dark (out of it, the time of day's light as the lot has it), its drawing and HUD over the lot's.

import type { HollywoodSection } from '../section';
import { todLight } from '../../timeOfDay';
import { buildTower, updateTower, inTank, tankView, TOWER_WIRES } from './benTower';
import { drawTowerBack, drawTowerOver, drawTowerFront, drawTowerHud, tankLighting } from './benTowerArt';

/** Where his feet sit on screen in the tank (the room fits, floor to roof). */
const TANK_ROW = 470;

export const withBenTower = (base: HollywoodSection): HollywoodSection => ({
  ...base,
  build: (state) => { base.build(state); buildTower(state); },
  update: (ctx, controls) => { const c = updateTower(ctx, controls); return base.update ? base.update(ctx, c) : c; },
  cameraRow: (state) => (inTank(state) ? TANK_ROW : base.cameraRow?.(state)),
  outdoors: (state) => (tankView(state) ? 0 : base.outdoors?.(state) ?? 0),
  lighting: (state) => tankLighting(state) ?? todLight(base.lamps?.(state) ?? [], base.outdoors?.(state) ?? 1),
  drawBack: (c, state) => { base.drawBack?.(c, state); drawTowerBack(c, state); },
  drawOverWires: (c, state) => { base.drawOverWires?.(c, state); drawTowerOver(c, state); },
  drawFront: (c, state) => { base.drawFront?.(c, state); drawTowerFront(c, state); },
  drawHud: (c, state) => { base.drawHud?.(c, state); drawTowerHud(c, state); },
  wires: (state) => [...(base.wires?.(state) ?? []), ...TOWER_WIRES],
});
