// Hector Hurricane's stage: see course.ts for the layout. This file builds it
// into the game state and hooks its set pieces, hazards, the Eye and its
// drawing into the engine.

import type { StageLayout } from '../index';
import { BOSS_DOOR_X, GROUND_Y, STAGE_WIDTH } from '../../../constants';
import { groundBlocks } from '../../terrain';
import { COURSE, CP, isBouncy } from './course';
import { createHectorRuntime, getHector, updateHector, regionOf } from './runtime';
import { updateEye, hitEye } from './eye';
import { hazardDeathMessage, waterZones } from './hazards';
import { drawHectorBack, drawHectorMid, drawHectorFront, drawHectorHud, drawHectorBackdrop, drawHectorWeather } from './draw';
import { drawEye } from './eyeDraw';
import { drawSharksRound } from './drawSet';
import { TOWER } from './tower';

export const hectorLayout: StageLayout = {
  left: COURSE.left,
  startX: COURSE.startX,
  // (back far enough that the wrecked daycare's in view when you come back from dying to Hector)
  bossStartX: COURSE.daycare.building - 250,
  verticalCamera: true,
  build: (state, skipToBoss) => {
    const C = COURSE;
    state.groundRuns = [...C.runs, { x1: BOSS_DOOR_X, y1: GROUND_Y, x2: STAGE_WIDTH, y2: GROUND_Y }];
    state.blocks.push(...groundBlocks(C.runs));
    // Everything you can stand on that isn't the ground (awnings bounce you)
    C.plats.forEach((p, i) => state.blocks.push({ x: p.x, y: p.y, w: p.w, h: isBouncy(p) ? 12 : 16, type: 'platform', hidden: true, oneWay: p.look !== 'car', tag: isBouncy(p) ? `awning-${i}` : `hplat-${i}` }));
    // The sea bed under the open water (you can swim down to it)
    for (const z of waterZones(state)) if (z.bottom > COURSE.sea.y + 100) state.blocks.push({ x: z.x1, y: z.bottom, w: z.x2 - z.x1, h: 400, type: 'ground', hidden: true, tag: 'seabed' });
    state.cameraMinX = C.startX;
    state.stage = createHectorRuntime(state, skipToBoss);
    const cp = skipToBoss ? 0 : state.checkpoint;
    if (cp > 0) {
      const at = C.checkpoints[cp];
      state.cameraRestY = at.y - 550;
      if (cp === CP.EYE) { state.cameraOverride = { x: C.eye.x, y: C.eye.y }; state.cameraRestY = C.eye.y; }
      return at;
    }
  },
  update: (ctx, controls) => updateHector(ctx, controls),
  deathMessage: ctx => { const rt = getHector(ctx.state); return rt ? hazardDeathMessage(ctx.state, rt.hazards) : undefined; },
  updateSpecialEnemy: (ctx, e) => {
    const rt = getHector(ctx.state);
    return e.kind === 'eye' && rt ? updateEye(ctx, e, rt.eye) : undefined;
  },
  hitSpecialEnemy: (ctx, e, p) => {
    const rt = getHector(ctx.state);
    return e.kind === 'eye' && rt ? hitEye(ctx, e, p, rt.eye) : undefined;
  },
  drawSpecialEnemy: (ctx, e, state) => {
    // (up the storm the sharks are out in the air round it, not painted on it: they're drawn over it, flat)
    if (e.kind === 'shark' && regionOf(state.player.pos.x) === 'tower') return true;
    if (e.kind !== 'eye') return false;
    const rt = getHector(state);
    if (rt) drawEye(ctx, state, rt.eye, e);
    return true;
  },
  drawBack: (ctx, state) => { if (getHector(state)) drawHectorBack(ctx, state); },
  drawMid: (ctx, state) => { if (getHector(state)) drawHectorMid(ctx, state); },
  drawFront: (ctx, state) => { if (getHector(state)) drawHectorFront(ctx, state); },
  drawHud: (ctx, state) => { if (getHector(state)) drawHectorHud(ctx, state); },
  drawBackdrop: (ctx, state) => !!getHector(state) && drawHectorBackdrop(ctx, state),
  drawBackdropFront: (ctx, state) => !!getHector(state) && drawHectorWeather(ctx, state),
  // Climbing the storm: the world's wrapped round the eye wall
  drawOverCylinder: (ctx, state, radius, around) => drawSharksRound(ctx, state, radius, around),
  cylinder: state => (regionOf(state.player.pos.x) === 'tower' ? { radius: TOWER.radius } : null),
  // (up the storm, every ledge is a different height: the camera drifts after him rather than jerking to each one)
  cameraEaseY: state => (regionOf(state.player.pos.x) === 'tower' ? 0.06 : undefined),
};
