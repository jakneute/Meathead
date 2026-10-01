// Oily Oscar's stage: see course.ts for the layout. This file builds it into
// the game state and hooks the oil field, the break room, the chase, the field
// office and the drawing into the engine.

import type { StageLayout } from '../index';
import type { Block } from '../../../types';
import { BOSS_DOOR_X, GROUND_Y } from '../../../constants';
import { groundBlocks } from '../../core/terrain';
import { COURSE, CP, placeOf } from './course';
import { createOscarRuntime, getOscar, updateOscar, oscarDeathMessage } from './runtime';
import { isChaseVehicle, updateChaseVehicle, hitChaseVehicle, chaseZoom } from './chase';
import { drawOscarBackdrop, drawOscarBack, drawOscarMid, drawOscarFront, drawOscarHud, drawOscarOverlays } from './draw';
import { oscarScene } from './lighting';
import { taseZoom } from './taseCam';
import { tickSwirlyPipes } from './swirly';
import { getStageWidth } from '../../bosses/registry';

export const oscarLayout: StageLayout = {
  music: state => {
    const rt = getOscar(state);
    const p = placeOf(state.player.pos.x + state.player.width / 2);
    if (p === 'chase') return 'chase';
    if (p === 'end') return 'end';
    if (p === 'bunker' && rt && ['waiting', 'break', 'clockout', 'open'].includes(rt.bunker.phase)) return 'break';
    return 'field';
  },
  left: COURSE.left,
  startX: COURSE.startX,
  verticalCamera: true,
  lighting: state => oscarScene(state),
  // (dying to Oscar: no going back past the bar's front wall; he's put in the middle of what's left of it: see build)
  bossStartX: COURSE.bar.x1,
  build: (state, skipToBoss) => {
    const C = COURSE;
    // (the arena's ground out to the end of his double-width arena, and past it: the fight's camera pulls back to show the lot)
    state.groundRuns = [...C.runs, { x1: BOSS_DOOR_X, y1: GROUND_Y, x2: getStageWidth('Oily Oscar') + 800, y2: GROUND_Y }];
    state.blocks.push(...groundBlocks(C.runs));
    // Pipelines and derrick decks: things you jump up through and stand on
    C.ledges.forEach((l, i) => state.blocks.push({ x: l.x, y: l.y, w: l.w, h: 14, type: 'platform', hidden: true, oneWay: true, tag: `oledge-${i}` }));
    const wall = (x: number, y: number, w: number, h: number, tag: string): Block => ({ x, y, w, h, type: 'wall', hidden: true, tag });
    // The ends of each part
    state.blocks.push(wall(C.field.x1 - 60, -4000, 60, 6000, 'field-start'), wall(C.field.x2, -4000, 60, 6000, 'field-end'));
    state.blocks.push(wall(C.chase.x1 - 60, -4000, 60, 6000, 'chase-start'));
    state.blocks.push(wall(C.end.x1 - 60, -4000, 60, 6000, 'end-start'));
    state.cameraMinX = C.startX;
    state.player.hidden = false;
    state.stage = createOscarRuntime(state, skipToBoss);
    // Back for Oscar: on the floor in the middle of what's left of the bar
    if (skipToBoss) {
      const at = C.checkpoints[CP.BOSS];
      state.player.pos = { x: at.x - state.player.width / 2, y: at.y - state.player.height };
      state.cameraRestY = at.y - 550; state.camera.y = state.cameraRestY;
      state.camera.x = Math.max(C.bar.x1, at.x - 250);
    }
    const cp = skipToBoss ? 0 : state.checkpoint;
    if (cp > 0) {
      const at = C.checkpoints[cp];
      state.cameraRestY = at.y - 550;
      return at;
    }
  },
  update: (ctx, controls) => updateOscar(ctx, controls),
  deathSceneTick: (ctx, t) => { if (getOscar(ctx.state)?.bar.swirly) tickSwirlyPipes(t); },
  deathMessage: ctx => oscarDeathMessage(ctx),
  // (the chase's cars, trucks and choppers are run by the stage)
  updateSpecialEnemy: (ctx, e) => {
    if (!isChaseVehicle(e.kind)) return undefined;
    return updateChaseVehicle(ctx, e, getOscar(ctx.state)?.chase ?? null);
  },
  hitSpecialEnemy: (ctx, e, p) => {
    if (!isChaseVehicle(e.kind)) return undefined;
    if (p.owner !== 'player' || e.health <= 0) return 'miss';
    // (the machine gun's rounds punch on through: each one hits a few of them, once each)
    if (p.pierce !== undefined) {
      if (p.hitIds?.includes(e.id)) return 'miss';
      hitChaseVehicle(e, p.damage);
      (p.hitIds ??= []).push(e.id);
      p.pierce--;
      return p.pierce > 0 ? 'miss' : true;
    }
    hitChaseVehicle(e, p.damage);
    void ctx;
    return true;
  },
  drawBack: (ctx, state) => { if (getOscar(state)) drawOscarBack(ctx, state); },
  drawMid: (ctx, state) => { if (getOscar(state)) drawOscarMid(ctx, state); },
  drawFront: (ctx, state) => { if (getOscar(state)) drawOscarFront(ctx, state); },
  drawHud: (ctx, state) => { if (getOscar(state)) drawOscarHud(ctx, state); },
  drawBackdrop: (ctx, state) => !!getOscar(state) && drawOscarBackdrop(ctx, state),
  drawBackdropFront: (ctx, state) => !!getOscar(state) && drawOscarOverlays(ctx, state),
  // (on the chase the view pulls back as the mob grows)
  taserReachesOffscreen: true,
  zoom: state => { const rt = getOscar(state); return rt ? chaseZoom(state, rt.chase) ?? taseZoom(state, rt.taseCam) : null; },
  cameraRow: state => (placeOf(state.player.pos.x) === 'bunker' ? 520 : undefined),
};

