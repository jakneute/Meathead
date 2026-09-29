// Ernie Earthquake's stage: see course.ts for the layout. This file builds it into
// the game state and hooks its quakes, the bridge, the jet ski, the tour and its
// drawing into the engine.

import type { StageLayout } from '../index';
import { BOSS_DOOR_X, GROUND_Y, STAGE_WIDTH } from '../../../constants';
import { groundBlocks } from '../../core/terrain';
import { COURSE, CP } from './course';
import { createErnieRuntime, getErnie, updateErnie, regionOf } from './runtime';
import { quakeDeathMessage } from './quake';
import { onBridge } from './bridge';
import { skiDeathMessage, isRiding } from './jetski';
import { drawErnieBackdrop, drawErnieBack, drawErnieMid, drawErnieFront, drawErnieHud, drawErnieWeather } from './draw';
import { ernieScene } from './lighting';

export const ernieLayout: StageLayout = {
  music: state => {
    const px = state.player.pos.x + state.player.width / 2;
    const r = regionOf(px);
    if (r === 'bay') return 'bay';
    if (r === 'cell') return 'cell';
    return onBridge(px) ? 'bridge' : 'streets';
  },
  left: COURSE.left,
  startX: COURSE.startX,
  verticalCamera: true,
  lighting: state => ernieScene(state),
  // (back far enough that what's left of the tour is in view when you come back from dying to Ernie)
  bossStartX: COURSE.cellblock.x1 + 150,
  build: (state, skipToBoss) => {
    const C = COURSE;
    state.groundRuns = [...C.runs, { x1: BOSS_DOOR_X, y1: GROUND_Y, x2: STAGE_WIDTH, y2: GROUND_Y }];
    state.blocks.push(...groundBlocks(C.runs));
    // Fire escapes and bay-window ledges: you can jump up through them
    C.ledges.forEach((l, i) => state.blocks.push({ x: l.x, y: l.y, w: l.w, h: 14, type: 'platform', hidden: true, oneWay: true, tag: `eledge-${i}` }));
    // The ends of each part
    const wall = (x: number, tag: string) => state.blocks.push({ x, y: -3000, w: 60, h: 4400, type: 'wall', hidden: true, tag });
    wall(C.streets.x1 - 60, 'streets-end');
    wall(C.bridge.x2, 'bridge-end');
    wall(C.bay.x1 - 60, 'bay-end');
    wall(C.cellblock.x1 - 60, 'cell-end');
    state.cameraMinX = C.startX;
    state.stage = createErnieRuntime(state, skipToBoss);
    const cp = skipToBoss ? 0 : state.checkpoint;
    if (cp > 0) {
      const at = C.checkpoints[cp];
      state.cameraRestY = at.y - 550;
      return at;
    }
  },
  update: (ctx, controls) => updateErnie(ctx, controls),
  deathMessage: ctx => {
    const rt = getErnie(ctx.state);
    if (!rt) return undefined;
    return skiDeathMessage(rt.ski) ?? quakeDeathMessage(ctx.state, rt.quakes);
  },
  drawBack: (ctx, state) => { if (getErnie(state)) drawErnieBack(ctx, state); },
  drawMid: (ctx, state) => { if (getErnie(state)) drawErnieMid(ctx, state); },
  drawFront: (ctx, state) => { if (getErnie(state)) drawErnieFront(ctx, state); },
  drawHud: (ctx, state) => { if (getErnie(state)) drawErnieHud(ctx, state); },
  drawBackdrop: (ctx, state) => !!getErnie(state) && drawErnieBackdrop(ctx, state),
  drawBackdropFront: (ctx, state) => !!getErnie(state) && drawErnieWeather(ctx, state),
  // (on the bridge the view sits higher, so you can see down through the gaps and the steel underneath)
  cameraRow: state => {
    const rt = getErnie(state);
    if (rt && isRiding(rt.ski)) return undefined;
    return regionOf(state.player.pos.x) === 'main' && onBridge(state.player.pos.x) ? 430 : undefined;
  },
};

void CP;
