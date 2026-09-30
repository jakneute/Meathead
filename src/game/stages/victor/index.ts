// Victor Volcano's stage: see course.ts for the layout. This file builds it into
// the game state and hooks its hazards, the doorman, the lounge and its drawing
// into the engine.

import type { StageLayout } from '../index';
import { BOSS_DOOR_X, GROUND_Y, STAGE_WIDTH } from '../../../constants';
import { groundBlocks } from '../../core/terrain';
import { COURSE, CP } from './course';
import { createVictorRuntime, getVictor, updateVictor, regionOf } from './runtime';
import { updateDoorman, hitDoorman } from './doorman';
import { drawDoorman } from './doormanDraw';
import { hazardDeathMessage } from './hazards';
import { drawVictorBackdrop, drawVictorBack, drawVictorMid, drawVictorFront, drawVictorHud } from './draw';
import { victorScene } from './lighting';

export const victorLayout: StageLayout = {
  music: state => {
    const px = state.player.pos.x + state.player.width / 2;
    const r = regionOf(px);
    if (r !== 'main') return r;
    return px >= COURSE.club.x1 - 400 ? 'club' : 'cliffs';
  },
  left: COURSE.left,
  startX: COURSE.startX,
  verticalCamera: true,
  lighting: state => victorScene(state),
  // (back far enough that the wrecked lounge is in view when you come back from dying to Victor)
  bossStartX: COURSE.lounge.x1 + 150,
  build: (state, skipToBoss) => {
    const C = COURSE;
    state.groundRuns = [...C.runs, { x1: BOSS_DOOR_X, y1: GROUND_Y, x2: STAGE_WIDTH, y2: GROUND_Y }];
    state.blocks.push(...groundBlocks(C.runs));
    // Ledges of rock and the catwalks up the shaft: you can jump up through them
    C.ledges.forEach((l, i) => state.blocks.push({ x: l.x, y: l.y, w: l.w, h: 16, type: 'platform', hidden: true, oneWay: true, tag: `vledge-${i}` }));
    // The ends of each part, and the shaft's walls (the river comes in under the left one)
    const S = C.shaft;
    const wall = (x: number, y1: number, y2: number, tag: string) => state.blocks.push({ x, y: y1, w: 60, h: y2 - y1, type: 'wall', hidden: true, tag });
    wall(C.startX - 60, -3000, 1400, 'trail-end');
    wall(C.club.door + 300, -3000, 1400, 'club-end');
    wall(C.inside.x1 - 60, -3000, 1400, 'inside-end');
    wall(S.x1 - 60, S.top - 500, S.floor - 170, 'shaft-left');
    wall(S.x2, S.top - 500, S.floor + 200, 'shaft-right');
    state.blocks.push({ x: S.x1 - 60, y: S.top - 520, w: S.x2 - S.x1 + 120, h: 20, type: 'wall', hidden: true, tag: 'shaft-roof' });
    wall(C.lounge.x1 - 60, -3000, 1400, 'lounge-end');
    // The club floor's end, and the atrium's walls (the floor comes in under the left one) and roof
    const A = C.atrium;
    wall(C.floor.x1 - 60, -3000, 1400, 'floor-end');
    wall(A.x1 - 60, A.top - 500, A.floor - 170, 'atrium-left');
    wall(A.x2, A.top - 500, A.floor + 200, 'atrium-right');
    state.blocks.push({ x: A.x1 - 60, y: A.top - 520, w: A.x2 - A.x1 + 120, h: 20, type: 'wall', hidden: true, tag: 'atrium-roof' });
    // The bar and the speaker stacks: solid
    C.solids.forEach((s, i) => state.blocks.push({ x: s.x, y: s.y, w: s.w, h: s.h, type: 'ground', hidden: true, tag: `club-solid-${i}` }));
    state.cameraMinX = C.startX;
    state.stage = createVictorRuntime(state, skipToBoss);
    const cp = skipToBoss ? 0 : state.checkpoint;
    if (cp > 0) {
      const at = C.checkpoints[cp];
      state.cameraRestY = at.y - 550;
      return at;
    }
  },
  update: (ctx, controls) => updateVictor(ctx, controls),
  deathMessage: ctx => { const rt = getVictor(ctx.state); return rt ? hazardDeathMessage(ctx.state, rt.hazards) : undefined; },
  updateSpecialEnemy: (ctx, e) => {
    const rt = getVictor(ctx.state);
    return e.kind === 'doorman' && rt ? updateDoorman(ctx, e, rt.doorman) : undefined;
  },
  hitSpecialEnemy: (ctx, e, p) => {
    const rt = getVictor(ctx.state);
    return e.kind === 'doorman' && rt ? hitDoorman(ctx, e, p, rt.doorman) : undefined;
  },
  drawSpecialEnemy: (ctx, e, state) => {
    if (e.kind !== 'doorman') return false;
    const rt = getVictor(state);
    if (rt) drawDoorman(ctx, e, rt.doorman, state.frame);
    return true;
  },
  drawBack: (ctx, state) => { if (getVictor(state)) drawVictorBack(ctx, state); },
  drawMid: (ctx, state) => { if (getVictor(state)) drawVictorMid(ctx, state); },
  drawFront: (ctx, state) => { if (getVictor(state)) drawVictorFront(ctx, state); },
  drawHud: (ctx, state) => { if (getVictor(state)) drawVictorHud(ctx, state); },
  // A clash: the camera pushes in on the two of you
  // A clash: the camera pushes in on the two of you (and brings you to the middle of the shot)
  zoom: state => {
    const d = getVictor(state)?.doorman;
    if (!d || d.zoom <= 0.01) return null;
    return { scale: 1 + d.zoom * 0.75, x: d.zoomAt.x, y: d.zoomAt.y, shiftX: (state.camera.x + 400 - d.zoomAt.x) * d.zoom, shiftY: (state.camera.y + 260 - d.zoomAt.y) * d.zoom };
  },
  drawBackdrop: (ctx, state) => !!getVictor(state) && drawVictorBackdrop(ctx, state),
  // (crossing the lava river the view sits lower, so you can see the fish coming under the surface)
  cameraRow: state => {
    const p = state.player, r = regionOf(p.pos.x);
    if (r === 'inside' && p.pos.x < COURSE.shaft.x1 - 60) return 420;
    // At the foot of the atrium, on the floor: down a bit, so the stairwell under it can be seen going down
    if (r === 'club' && p.pos.x > COURSE.atrium.x1 - 150 && p.pos.x < COURSE.atrium.x1 + 420 && p.pos.y + p.height > COURSE.atrium.floor - 40) return 380;
    return undefined;
  },
  // (up the shaft the camera drifts after you rather than jerking to every catwalk)
  cameraEaseY: state => { const r = regionOf(state.player.pos.x), x = state.player.pos.x; return (r === 'inside' && x > COURSE.shaft.x1 - 100) || (r === 'club' && x > COURSE.atrium.x1 - 100) ? 0.08 : undefined; },
};

void CP;
