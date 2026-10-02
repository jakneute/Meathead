// Hector Hurricane's stage: see course.ts for the layout. This file builds it
// into the game state and hooks its set pieces, hazards, the Eye and its
// drawing into the engine.

import { inEyeArena } from './eye';
import { tickBoarded, tickWreck } from './chase';
import type { StageLayout } from '../index';
import { BOSS_DOOR_X, GROUND_Y, STAGE_WIDTH } from '../../../constants';
import { groundBlocks } from '../../core/terrain';
import { COURSE, CP, isBouncy } from './course';
import { createHectorRuntime, getHector, updateHector, regionOf } from './runtime';
import { updateEye, hitEye } from './eye';
import { updateDrowning, drawDrowning } from './drown';
import { hazardDeathMessage, waterZones, waterBodyAt } from './hazards';
import { drawHectorBack, drawHectorMid, drawHectorFront, drawHectorHud, drawHectorBackdrop, drawHectorWeather } from './draw';
import { drawEye } from './eyeDraw';
import { drawSharksRound } from './drawSet';
import { TOWER } from './tower';
import { hectorScene } from './lighting';
import { gatorZoom } from './gatorCam';

export const hectorLayout: StageLayout = {
  waterBodyAt,
  music: state => {
    const rt = getHector(state);
    const r = regionOf(state.player.pos.x + state.player.width / 2);
    if (r === 'tower' || r === 'eye') return 'tower';
    if (r === 'daycare') return 'daycare';
    if (rt && (rt.boat.phase === 'riding' || rt.boat.phase === 'spout')) return 'boat';
    return rt && rt.beach.storm > 0.6 ? 'storm' : 'beach';
  },
  left: COURSE.left,
  startX: COURSE.startX,
  // (back far enough that the wrecked daycare's in view when you come back from dying to Hector)
  bossStartX: COURSE.daycare.building - 250,
  verticalCamera: true,
  // (out on the water in the boat: the camera up off him, the sea and what's coming down ahead in view under him and
  // over him, and holding still as he hops)
  cameraRow: state => { const b = getHector(state)?.boat; return b?.phase === 'riding' && b.chase ? 380 + b.chase.hopY : undefined; },
  lighting: state => hectorScene(state),
  build: (state, skipToBoss) => {
    const C = COURSE;
    state.groundRuns = [...C.runs, { x1: BOSS_DOOR_X, y1: GROUND_Y, x2: STAGE_WIDTH, y2: GROUND_Y }];
    // (the docks are just their boards: you can swim under them, and come up through them onto the top)
    const docks = C.runs.filter(r => r.surface === 'dock');
    state.blocks.push(...groundBlocks(C.runs).map(b => docks.some(r => b.x >= r.x1 && b.x < r.x2 && b.y === r.y1) ? { ...b, h: 16, oneWay: true } : b));
    // (a wall at the start of the beach: nothing gets shoved off the end of it into the void)
    state.blocks.push({ x: C.startX - 60, y: -3000, w: 60, h: 4000, type: 'wall', hidden: true, tag: 'beach-end' });
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
  // (boarded by the Coast Guard: the kill camera's beats; or the junk finished him: thrown out, the boat going up)
  deathSceneTick: ctx => { const c = getHector(ctx.state)?.boat.chase; if (c?.caughtT) tickBoarded(ctx, c); else if (c?.wreckT) tickWreck(ctx, c); },
  deathMessage: ctx => { const rt = getHector(ctx.state); return rt ? hazardDeathMessage(ctx.state, rt.hazards) : undefined; },
  // (the storm up the tower got him: it doesn't stop at the clouds)
  fallDeathKind: ctx => ((getHector(ctx.state)?.tower.suckT ?? 0) > 0 ? 'space' : inEyeArena(ctx.state.player.pos.x) ? 'eye_fall' : undefined),
  updateSpecialEnemy: (ctx, e) => {
    const rt = getHector(ctx.state);
    if (!rt) return undefined;
    if (e.kind === 'eye') return updateEye(ctx, e, rt.eye);
    // (knocked into the water with no gator about: nobody out here can swim)
    return updateDrowning(ctx, e, rt.hazards);
  },
  hitSpecialEnemy: (ctx, e, p) => {
    const rt = getHector(ctx.state);
    return e.kind === 'eye' && rt ? hitEye(ctx, e, p, rt.eye) : undefined;
  },
  drawSpecialEnemy: (ctx, e, state) => {
    // (up the storm the sharks are out in the air round it, not painted on it: they're drawn over it, flat)
    if (e.kind === 'shark' && regionOf(state.player.pos.x) === 'tower') return true;
    if (e.drownT !== undefined) { drawDrowning(ctx, e, state); return true; }
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
  // (a gator eating somebody: the camera pulls back to show it)
  zoom: state => { const rt = getHector(state); return rt && regionOf(state.player.pos.x) === 'main' ? gatorZoom(state, rt.gatorCam) : null; },
  cameraEaseY: state => (regionOf(state.player.pos.x) === 'tower' ? 0.06 : undefined),
};
