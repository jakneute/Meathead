// Artie Avalanche's stage: see course.ts for the layout. This file builds it
// into the game state and runs its hazards and set pieces each frame.

import type { StageLayout } from '../index';
import { BOSS_DOOR_X, GROUND_Y, STAGE_WIDTH } from '../../../constants';
import { groundBlocks } from '../../core/terrain';
import { COURSE } from './course';
import { createArtieRuntime, getArtie, updateArtie } from './runtime';
import { drawArtieBack, drawArtieMid, drawArtieFront, drawArtieHud } from './draw';
import { updateMoose, hitMoose } from './moose';
import { drawMoose } from './mooseDraw';
import { skiDeathMessage, skiZoom } from './ski';
import { artieScene } from './lighting';

export const artieLayout: StageLayout = {
  music: state => {
    const rt = getArtie(state);
    if (!rt) return 'trail';
    if (state.player.skiing || rt.ski.phase === 'skiing' || rt.ski.phase === 'runout') return 'ski';
    if (['closing', 'riding', 'arrived', 'open'].includes(rt.tram.phase)) return 'tram';
    if (rt.tram.phase === 'done') return rt.ski.phase === 'done' || rt.ski.phase === 'finale' ? 'trail' : 'summit';
    return 'trail';
  },
  left: COURSE.left,
  startX: COURSE.startX,
  verticalCamera: true,
  lighting: state => artieScene(state),
  build: (state, skipToBoss) => {
    const C = COURSE;
    // The ground line (for blood and sparks) runs on through the boss arena; its collision is already there
    state.groundRuns = [...C.runs, { x1: BOSS_DOOR_X, y1: GROUND_Y, x2: STAGE_WIDTH, y2: GROUND_Y }];
    state.blocks.push(...groundBlocks(C.runs));
    // Rock overhangs (icicles hang off them) and ledges (some are crumbling ice)
    C.overhangs.forEach((o, i) => state.blocks.push({ x: o.x, y: o.y, w: o.w, h: o.h, type: 'platform', tag: `overhang-${i}` }));
    C.ledges.forEach((l, i) => state.blocks.push({ x: l.x, y: l.y, w: l.w, h: l.crumble ? 18 : 26, type: 'platform', oneWay: true, tag: l.crumble ? `crumble-${i}` : `rock-${i}` }));
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
  // (zoomed out on the skis, to keep the avalanche in view)
  zoom: state => { const rt = getArtie(state); return rt ? skiZoom(state, rt.ski) : null; },
  deathMessage: ctx => { const rt = getArtie(ctx.state); return rt ? skiDeathMessage(ctx.state, rt.ski) : undefined; },
  updateSpecialEnemy: (ctx, e) => {
    const rt = getArtie(ctx.state);
    return e.kind === 'moose' && rt ? updateMoose(ctx, e, rt.moose) : undefined;
  },
  hitSpecialEnemy: (ctx, e, p) => {
    const rt = getArtie(ctx.state);
    return e.kind === 'moose' && rt ? hitMoose(ctx, e, p, rt.moose) : undefined;
  },
  drawSpecialEnemy: (ctx, e, state) => {
    if (e.kind !== 'moose') return false;
    drawMoose(ctx, e, state.frame);
    return true;
  },
  drawBack: (ctx, state) => { if (getArtie(state)) drawArtieBack(ctx, state); },
  drawMid: (ctx, state) => { if (getArtie(state)) drawArtieMid(ctx, state); },
  drawFront: (ctx, state) => { if (getArtie(state)) drawArtieFront(ctx, state); },
  drawHud: (ctx, state) => { if (getArtie(state)) drawArtieHud(ctx, state); },
};
