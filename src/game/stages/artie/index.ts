// Artie Avalanche's stage: see course.ts for the layout. This file builds it
// into the game state and runs its hazards and set pieces each frame.

import type { StageLayout } from '../index';
import { BOSS_DOOR_X, GROUND_Y, STAGE_WIDTH } from '../../../constants';
import { groundBlocks } from '../../terrain';
import { COURSE } from './course';
import { createArtieRuntime, getArtie, updateArtie } from './runtime';
import { drawArtieBack, drawArtieFront, drawArtieHud } from './draw';

export const artieLayout: StageLayout = {
  left: COURSE.left,
  startX: COURSE.startX,
  verticalCamera: true,
  build: (state, skipToBoss) => {
    const C = COURSE;
    // The ground line (for blood and sparks) runs on through the boss arena; its collision is already there
    state.groundRuns = [...C.runs, { x1: BOSS_DOOR_X, y1: GROUND_Y, x2: STAGE_WIDTH, y2: GROUND_Y }];
    state.blocks.push(...groundBlocks(C.runs));
    // Rock overhangs (icicles hang off them) and ledges (some are crumbling ice)
    C.overhangs.forEach((o, i) => state.blocks.push({ x: o.x, y: o.y, w: o.w, h: o.h, type: 'platform', tag: `overhang-${i}` }));
    C.ledges.forEach((l, i) => state.blocks.push({ x: l.x, y: l.y, w: l.w, h: l.crumble ? 18 : 26, type: 'platform', tag: l.crumble ? `crumble-${i}` : `rock-${i}` }));
    state.cameraMinX = C.left;
    state.stage = createArtieRuntime(state, skipToBoss);
    const cp = skipToBoss ? 0 : state.checkpoint;
    if (cp > 0) {
      const at = C.checkpoints[cp];
      state.cameraRestY = at.y - 550;
      return at;
    }
  },
  update: (ctx, controls) => updateArtie(ctx, controls),
  drawBack: (ctx, state) => { if (getArtie(state)) drawArtieBack(ctx, state); },
  drawFront: (ctx, state) => { if (getArtie(state)) drawArtieFront(ctx, state); },
  drawHud: (ctx, state) => { if (getArtie(state)) drawArtieHud(ctx, state); },
};
