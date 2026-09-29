// Blackout Barry's stage: see course.ts for the layout. This file builds it into
// the game state and hooks the places (the streets, the skyscraper floor by floor,
// the rooftops and the climb, the power room, the street at the end), the
// tenants and the power room's generators and Barry's man, the lighting and the
// drawing into the engine.

import type { StageLayout } from '../index';
import type { Block } from '../../../types';
import { BOSS_DOOR_X, GROUND_Y, STAGE_WIDTH } from '../../../constants';
import { groundBlocks } from '../../core/terrain';
import { COURSE, placeOf, roomOf } from './course';
import { createBarryRuntime, getBarry, updateBarry, barryDeathMessage } from './runtime';
import { updateTenant, hitTenant } from './climb';
import { updateGenerator, updateMinion } from './power';
import { drawBarryBackdrop, drawBarryBack, drawBarryMid, drawBarryFront, drawBarryHud, drawBarryWeather } from './draw';
import { drawGenerator } from './rooms';
import { drawTenantDeath } from '../../render/enemies/barry';
import { roomZoom, barryScene } from './lighting';
import { drawSurgeMinion } from './surgeDraw';

export const barryLayout: StageLayout = {
  music: state => {
    const p = placeOf(state.player.pos.x + state.player.width / 2);
    return p === 'roofs' ? 'roofs' : p === 'power' ? 'power' : p === 'streets' || p === 'landing' ? 'streets' : 'tower';
  },
  left: COURSE.left,
  startX: COURSE.startX,
  verticalCamera: true,
  build: (state, skipToBoss) => {
    const C = COURSE;
    // (every gap is drawn by the stage: the trenches in the street, the alleys between the roofs)
    const runs = C.runs.map((r, i) => ({ ...r, pitAfter: C.runs[i + 1] && C.runs[i + 1].x1 > r.x2 + 1 ? 'clouds' as const : undefined }));
    state.groundRuns = [...runs, { x1: BOSS_DOOR_X, y1: GROUND_Y, x2: STAGE_WIDTH, y2: GROUND_Y }];
    state.blocks.push(...groundBlocks(runs));
    // Stoops, car roofs, scaffolding, desks, shelves, fire escapes: all things you jump up through and stand on
    C.ledges.forEach((l, i) => state.blocks.push({ x: l.x, y: l.y, w: l.w, h: 14, type: 'platform', hidden: true, oneWay: true, tag: `bledge-${i}` }));
    // The ceilings and walls (the stage draws them)
    C.walls.forEach((w, i) => state.blocks.push({ x: w.x, y: w.y, w: w.w, h: w.h, type: 'wall', hidden: true, tag: `bwall-${i}` }));
    // The ends of the streets and the roofs
    const wall = (x: number, tag: string): Block => ({ x, y: -3000, w: 60, h: 4400, type: 'wall', hidden: true, tag });
    state.blocks.push(wall(C.streets.x1 - 60, 'streets-start'), wall(C.streets.x2 + 20, 'streets-end'), wall(C.roofs.x1 - 60, 'roofs-start'), wall(C.landing.x1 - 60, 'landing-start'));
    state.cameraMinX = C.startX;
    state.player.hidden = false;
    state.stage = createBarryRuntime(state, skipToBoss);
    const cp = skipToBoss ? 0 : state.checkpoint;
    if (cp > 0) {
      const at = C.checkpoints[cp];
      state.cameraRestY = at.y - 550;
      return at;
    }
  },
  update: (ctx, controls) => updateBarry(ctx, controls),
  deathMessage: ctx => barryDeathMessage(ctx),
  updateSpecialEnemy: (ctx, e) => {
    const rt = getBarry(ctx.state);
    if (!rt) return undefined;
    if (e.kind === 'tenant') return updateTenant(ctx, e);
    if (e.kind === 'generator') return updateGenerator(ctx, e, rt.power);
    if (e.kind === 'minion') return updateMinion(ctx, e, rt.power);
    return undefined;
  },
  hitSpecialEnemy: (ctx, e, p) => {
    if (e.kind === 'tenant') return hitTenant(ctx, e, p);
    // (Barry's man isn't for shooting: he's for later)
    if (e.kind === 'minion') return 'miss';
    // (a blown generator's just a wreck: shots go on past it to the next one)
    if (e.kind === 'generator') { const g = getBarry(ctx.state)?.power.gens.find(q => q.id === e.id); if (g && g.charge <= 0) return 'miss'; }
    void ctx;
    return undefined;
  },
  drawSpecialEnemy: (ctx, e, state) => {
    if (e.kind === 'tenant' && (e.aiState === 'fall' || e.aiState === 'splat')) { drawTenantDeath(ctx, e, state.frame); return true; }
    const rt = getBarry(state);
    if (e.kind === 'minion' && rt?.power.phase === 'surge') { drawSurgeMinion(ctx, e, state, rt.power); return true; }
    if (e.kind !== 'generator') return false;
    const g = rt?.power.gens.find(q => q.id === e.id);
    drawGenerator(ctx, e, state, g ? g.charge : 100);
    return true;
  },
  drawBack: (ctx, state) => { if (getBarry(state)) drawBarryBack(ctx, state); },
  drawMid: (ctx, state) => { if (getBarry(state)) drawBarryMid(ctx, state); },
  drawFront: (ctx, state) => { if (getBarry(state)) drawBarryFront(ctx, state); },
  drawHud: (ctx, state) => { if (getBarry(state)) drawBarryHud(ctx, state); },
  drawBackdrop: (ctx, state) => !!getBarry(state) && drawBarryBackdrop(ctx, state),
  drawBackdropFront: (ctx, state) => !!getBarry(state) && drawBarryWeather(ctx, state),
  // (indoors: his feet a bit higher up the screen, the room pushed in on; outside, more of what's below in view)
  cameraRow: state => {
    const place = placeOf(state.player.pos.x);
    return roomOf(place) ? 470 : place === 'roofs' ? 450 : 500;
  },
  zoom: state => roomZoom(state),
  lighting: state => { const rt = getBarry(state); return rt ? barryScene(state, rt) : null; },
};
