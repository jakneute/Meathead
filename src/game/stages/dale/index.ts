// Drug Trade Dale's stage: see course.ts for the layout. This file builds it into
// the game state and hooks the acts (the desert and the warehouse, the convoy,
// the old west town), Dale's distributor and the drawing into the engine.

import type { StageLayout } from '../index';
import type { Block } from '../../../types';
import { BOSS_DOOR_X, GROUND_Y, STAGE_WIDTH } from '../../../constants';
import { groundBlocks } from '../../core/terrain';
import { COURSE } from './course';
import { createDaleRuntime, getDale, updateDale, regionOf, daleDeathMessage } from './runtime';
import { officeBlocks, updateJunkie, hitJunkie } from './junkie';
import { beltBlocks } from './hazards';
import { jailWall } from './town';
import { HIGHWAY_CAM_Y } from './convoy';
import { drawDaleBackdrop, drawDaleBack, drawDaleMid, drawDaleFront, drawDaleHud, drawDaleWeather } from './draw';
import { drawJunkie } from './junkieDraw';

export const daleLayout: StageLayout = {
  left: COURSE.left,
  startX: COURSE.startX,
  verticalCamera: true,
  // (back after dying to Dale: in the rubble of the jail, the camera held short of his door till you go through it)
  bossStartX: COURSE.town.jail.x1 - 60,
  build: (state, skipToBoss) => {
    const C = COURSE;
    state.groundRuns = [...C.runs, { x1: BOSS_DOOR_X, y1: GROUND_Y, x2: STAGE_WIDTH, y2: GROUND_Y }];
    state.blocks.push(...groundBlocks(C.runs));
    // Rock shelves, pallet racks, the hotel balcony, the bell tower: you can jump up through them
    C.ledges.forEach((l, i) => state.blocks.push({ x: l.x, y: l.y, w: l.w, h: 14, type: 'platform', hidden: true, oneWay: true, tag: `dledge-${i}` }));
    // The conveyor belts, the warehouse ceiling, the office
    state.blocks.push(...beltBlocks());
    state.blocks.push({ x: C.warehouse.x1, y: C.warehouse.ceiling - 30, w: C.warehouse.stairs - C.warehouse.x1 + 60, h: 30, type: 'wall', hidden: true, tag: 'warehouse-ceiling' });
    state.blocks.push(...officeBlocks());
    // The town: the rooftops and the porch roofs (up through them from below), the fake jail across the street
    for (const b of C.buildings) state.blocks.push({ x: b.x1, y: b.top, w: b.x2 - b.x1, h: 14, type: 'platform', hidden: true, oneWay: true, tag: 'roof' });
    for (const a of C.awnings) state.blocks.push({ x: a.x, y: a.y, w: a.w, h: 10, type: 'platform', hidden: true, oneWay: true, tag: 'awning' });
    // The ends of each part
    const wall = (x: number, tag: string): Block => ({ x, y: -3000, w: 60, h: 4400, type: 'wall', hidden: true, tag });
    state.blocks.push(wall(C.desert.x1 - 60, 'desert-end'), wall(C.town.x1 - 60, 'town-end'));
    state.cameraMinX = C.startX;
    state.player.hidden = false;
    state.stage = createDaleRuntime(state, skipToBoss);
    if (!state.stageMemo.jailWrecked && !skipToBoss) state.blocks.push(jailWall() as Block);
    const cp = skipToBoss ? 0 : state.checkpoint;
    if (cp > 0) {
      const at = C.checkpoints[cp];
      // (on the convoy the camera's fixed on the road)
      state.cameraRestY = regionOf(at.x) === 'highway' ? HIGHWAY_CAM_Y : at.y - 550;
      return at;
    }
  },
  update: (ctx, controls) => updateDale(ctx, controls),
  deathMessage: ctx => daleDeathMessage(ctx),
  updateSpecialEnemy: (ctx, e) => {
    const rt = getDale(ctx.state);
    return e.kind === 'junkie' && rt ? updateJunkie(ctx, e, rt.junkie, rt.talk) : undefined;
  },
  hitSpecialEnemy: (ctx, e, p) => {
    const rt = getDale(ctx.state);
    return e.kind === 'junkie' && rt ? hitJunkie(ctx, e, p, rt.junkie, rt.talk) : undefined;
  },
  drawSpecialEnemy: (ctx, e, state) => {
    if (e.kind !== 'junkie') return false;
    const rt = getDale(state);
    if (rt) drawJunkie(ctx, e, rt.junkie, state);
    return true;
  },
  drawBack: (ctx, state) => { if (getDale(state)) drawDaleBack(ctx, state); },
  drawMid: (ctx, state) => { if (getDale(state)) drawDaleMid(ctx, state); },
  drawFront: (ctx, state) => { if (getDale(state)) drawDaleFront(ctx, state); },
  drawHud: (ctx, state) => { if (getDale(state)) drawDaleHud(ctx, state); },
  drawBackdrop: (ctx, state) => !!getDale(state) && drawDaleBackdrop(ctx, state),
  drawBackdropFront: (ctx, state) => !!getDale(state) && drawDaleWeather(ctx, state),
  // (out in the desert the view sits higher, so the arroyos and the far sides of them are in sight before you're at the edge)
  cameraRow: state => {
    const x = state.player.pos.x;
    if (regionOf(x) !== 'desert') return undefined;
    return x > COURSE.warehouse.x1 ? 520 : 420;
  },
};
