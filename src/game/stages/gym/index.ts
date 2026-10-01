// The Iron Pit (the opening stage, START GAME + INTRO): see course.ts for the layout. This file builds it into the
// game state and hooks the rooms, the pencil necks' lines, the bigger fellas at the end and the drawing into the engine.

import type { StageLayout } from '../index';
import type { Block } from '../../../types';
import { groundBlocks } from '../../core/terrain';
import { COURSE } from './course';
import { createGymRuntime, getGym, updateGym, gymDeathMessage } from './runtime';
import { drawGymBackdrop, drawGymBack, drawGymMid, drawGymFront, drawGymHud } from './draw';

export { GYM_STAGE } from './course';

export const gymLayout: StageLayout = {
  left: COURSE.left,
  startX: COURSE.startX,
  verticalCamera: false,
  // (he's already there: no dropping in out of the sky)
  startsStanding: true,
  // (a body sent flying out of one room doesn't get to clear the next one, out of sight, before he's there)
  collateralOnScreenOnly: true,
  build: (state) => {
    const C = COURSE;
    state.groundRuns = [...C.runs];
    state.blocks.push(...groundBlocks(C.runs));
    C.ledges.forEach((l, i) => state.blocks.push({ x: l.x, y: l.y, w: l.w, h: 14, type: 'platform', hidden: true, oneWay: true, tag: `gledge-${i}` }));
    // The wall behind his bench, and the locker room doors at the end (shut, till the bigger fellas open them)
    const wall = (x: number, tag: string): Block => ({ x, y: -3000, w: 60, h: 4400, type: 'wall', hidden: true, tag });
    state.blocks.push(wall(C.x1 - 60, 'gym-back'), wall(C.doors, 'gym-doors'));
    // The ceiling: nobody's jumping up out through it (its underside's where the drawn one's trim is)
    state.blocks.push({ x: C.x1 - 60, y: -3000, w: C.doors - C.x1 + 120, h: 3070, type: 'wall', hidden: true, tag: 'gym-ceiling' });
    state.stage = createGymRuntime(state);
    const cp = state.checkpoint;
    if (cp > 0) { state.cameraRestY = 0; return C.checkpoints[cp]; }
  },
  update: (ctx, controls) => updateGym(ctx, controls),
  deathMessage: ctx => gymDeathMessage(ctx),
  drawBackdrop: (ctx, state) => !!getGym(state) && drawGymBackdrop(ctx),
  drawBack: (ctx, state) => drawGymBack(ctx, state),
  drawMid: (ctx, state) => drawGymMid(ctx, state),
  drawFront: (ctx, state) => drawGymFront(ctx, state),
  drawHud: (ctx, state) => drawGymHud(ctx, state),
};
