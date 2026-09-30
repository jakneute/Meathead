// Toxic Tommy's stage: see course.ts for the layout. This file builds it into
// the game state and hooks the bike, the sewer, the thing in the cistern, the
// way out and the drawing into the engine.

import type { StageLayout } from '../index';
import type { Block } from '../../../types';
import { BOSS_DOOR_X, GROUND_Y, STAGE_WIDTH, DOOR_WIDTH, CANVAS_WIDTH } from '../../../constants';
import { groundBlocks } from '../../core/terrain';
import { COURSE, CP, placeOf, TUNNEL_ROOF, CAVERN_ROOF } from './course';
import { createTommyRuntime, getTommy, updateTommy, tommyDeathMessage } from './runtime';
import { hitThing } from './thing';
import { bottleZoom, isRidingBike } from './bike';
import { doorZoom, DOOR_ZOOM } from './escape';
import { drawTommyBackdrop, drawTommyBack, drawTommyMid, drawTommyFront, drawTommyHud, drawTommyOverlays } from './draw';
import { tommyScene } from './lighting';

export const tommyLayout: StageLayout = {
  // (the muck in the sewer channels: Flint's water supply)
  waterBodyAt: (_state, x, y) => {
    const i = COURSE.channels.findIndex(c => x > c.x1 && x < c.x2 && y > c.surface - 12 && y < c.floor);
    if (i < 0) return null;
    const c = COURSE.channels[i];
    return { key: `muck-${i}`, x1: c.x1, x2: c.x2, surface: c.surface, bottom: c.floor, kind: 'muck' };
  },
  music: state => {
    const p = placeOf(state.player.pos.x + state.player.width / 2);
    return p === 'hood' || p === 'road' || p === 'ruins' ? p : 'sewer';
  },
  left: COURSE.left,
  startX: COURSE.startX,
  verticalCamera: true,
  lighting: state => tommyScene(state),
  // (dying to Tommy: back in front of what's left of the house, and down the hole again)
  bossStartX: COURSE.ruins.house - 300,
  build: (state, skipToBoss) => {
    const C = COURSE;
    state.groundRuns = [...C.runs, { x1: BOSS_DOOR_X, y1: GROUND_Y, x2: STAGE_WIDTH, y2: GROUND_Y }];
    state.blocks.push(...groundBlocks(C.runs));
    // Grates over the muck, pipe runs, porches: all things you jump up through and stand on
    C.ledges.forEach((l, i) => state.blocks.push({ x: l.x, y: l.y, w: l.w, h: 14, type: 'platform', hidden: true, oneWay: true, tag: `tledge-${i}` }));
    const wall = (x: number, y: number, w: number, h: number, tag: string): Block => ({ x, y, w, h, type: 'wall', hidden: true, tag });
    // The ends of each part
    state.blocks.push(wall(C.hood.x1 - 60, -3000, 60, 4400, 'hood-start'), wall(C.road.x2, -3000, 60, 4400, 'road-end'));
    state.blocks.push(wall(C.sewer.x1 - 60, -3000, 60, 4400, 'sewer-start'), wall(C.sewer.x2, -3000, 60, 4400, 'sewer-end'));
    state.blocks.push(wall(C.ruins.x1 - 60, -6000, 60, 8000, 'ruins-start'));
    // (and the far end of the ruins up top: no walking off it; the floor outside the door, way down below, is open)
    state.blocks.push(wall(C.ruins.x2 - 40, -6000, 60, C.ruins.y + 300 + 6000, 'ruins-end'));
    // Down outside Tommy's door, the left edge of what the camera shows there (pushed in on it, up against the door): no
    // wandering off out of sight
    const outside = BOSS_DOOR_X + DOOR_WIDTH - CANVAS_WIDTH / DOOR_ZOOM;
    state.blocks.push(wall(outside - 60, GROUND_Y - 1200, 60, 1200, 'door-left'));
    // (and its ceiling, either side of the hole he came down through: no jumping up out of it)
    const P = C.ruins.pit, PW = C.ruins.pitW;
    state.blocks.push(wall(outside - 60, GROUND_Y - CAVERN_ROOF - 160, P - (outside - 60), 160, 'cavern-roof'), wall(P + PW, GROUND_Y - CAVERN_ROOF - 160, BOSS_DOOR_X - P - PW, 160, 'cavern-roof'));
    // The sewer's roof (a hole in it where he comes down through the manhole), and the flooded tunnel's, low over the muck
    const S = C.sewer;
    state.blocks.push(wall(S.x1, GROUND_Y - 940, S.drop - 80 - S.x1, 600, 'sewer-roof'), wall(S.drop + 80, GROUND_Y - 940, S.tunnel.x1 - S.drop - 80, 600, 'sewer-roof'));
    state.blocks.push(wall(S.tunnel.roof1, TUNNEL_ROOF - 600, S.tunnel.roof2 - S.tunnel.roof1, 600, 'tunnel-roof'));
    state.blocks.push(wall(S.pit.roof1, TUNNEL_ROOF - 600, S.pit.roof2 - S.pit.roof1, 600, 'pit-roof'));
    // (the cistern's a dome: high enough to lob a rock at the thing in it)
    state.blocks.push(wall(S.tunnel.x2, GROUND_Y - 940, S.cistern.x1 - S.tunnel.x2, 600, 'sewer-roof'), wall(S.cistern.x1, GROUND_Y - 1160, S.x2 - S.cistern.x1, 600, 'cistern-roof'));
    // The pipes and grates in the tunnel
    C.bars.forEach((b, i) => state.blocks.push(wall(b.x, b.y1, b.w, b.y2 - b.y1, `tunnel-bar-${i}`)));
    state.cameraMinX = C.startX;
    state.player.hidden = false;
    state.stage = createTommyRuntime(state, skipToBoss);
    // Back for Tommy: up in the ruins, in front of the house (the engine puts him at the start x at the bottom)
    if (skipToBoss) {
      const at = C.checkpoints[CP.RUINS];
      state.player.pos = { x: C.ruins.house - 160, y: at.y - state.player.height };
      state.cameraRestY = at.y - 550; state.camera.y = state.cameraRestY;
      state.camera.x = Math.max(C.ruins.x1, state.player.pos.x - 250);
    }
    const cp = skipToBoss ? 0 : state.checkpoint;
    if (cp > 0) {
      const at = C.checkpoints[cp];
      state.cameraRestY = at.y - 550;
      return at;
    }
  },
  update: (ctx, controls) => updateTommy(ctx, controls),
  deathMessage: ctx => tommyDeathMessage(ctx),
  updateSpecialEnemy: (ctx, e) => {
    // (the thing's run by its room; it just sits in the pool)
    if (e.kind !== 'amalgam') return undefined;
    e.vel = { x: 0, y: 0 };
    return true;
  },
  hitSpecialEnemy: (ctx, e, p) => {
    const rt = getTommy(ctx.state);
    if (e.kind !== 'amalgam' || !rt) return undefined;
    return hitThing(ctx, e, p, rt.thing, rt.talk);
  },
  // (the stage draws the thing itself, alive or dead: see drawTommyMid)
  drawSpecialEnemy: (ctx, e) => { void ctx; return e.kind === 'amalgam'; },
  drawBack: (ctx, state) => { if (getTommy(state)) drawTommyBack(ctx, state); },
  drawMid: (ctx, state) => { if (getTommy(state)) drawTommyMid(ctx, state); },
  drawFront: (ctx, state) => { if (getTommy(state)) drawTommyFront(ctx, state); },
  drawHud: (ctx, state) => { if (getTommy(state)) drawTommyHud(ctx, state); },
  drawBackdrop: (ctx, state) => !!getTommy(state) && drawTommyBackdrop(ctx, state),
  drawBackdropFront: (ctx, state) => !!getTommy(state) && drawTommyOverlays(ctx, state),
  // (on the bike the ski camera has it; in the sewer his feet sit a little lower, there's nothing much up top)
  cameraRow: state => {
    const rt = getTommy(state);
    if (rt && isRidingBike(rt.bike)) return undefined;
    const place = placeOf(state.player.pos.x);
    return place === 'sewer' || place === 'tunnel' || place === 'cistern' ? 460 : undefined;
  },
  zoom: state => { const rt = getTommy(state); return rt ? bottleZoom(rt.bike) ?? doorZoom(state, rt.escape) : null; },
};
