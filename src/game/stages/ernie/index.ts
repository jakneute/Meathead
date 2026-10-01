// Ernie Earthquake's stage: see course.ts for the layout. This file builds it into
// the game state and hooks its quakes, the bridge, the jet ski, the tour and its
// drawing into the engine.

import { deathByCause } from '../../core/deathCause';
import type { StageLayout } from '../index';
import type { GameState } from '../../core/state';
import { BOSS_DOOR_X, GROUND_Y, STAGE_WIDTH } from '../../../constants';
import { groundBlocks } from '../../core/terrain';
import { COURSE, CP } from './course';
import { createErnieRuntime, getErnie, updateErnie, regionOf } from './runtime';
import { quakeDeathMessage } from './quake';
import { onBridge } from './bridge';
import { skiDeathMessage, isRiding } from './jetski';
import { drawErnieBackdrop, drawErnieBack, drawErnieMid, drawErnieFront, drawErnieHud, drawErnieWeather } from './draw';
import { ernieScene } from './lighting';
import { hallZoom } from './doorCrash';
import { plungeZoom, tickPlunge } from './bridge';

/** Down one of the island's holes: into the old fort under the cell house, off the cliff into the bay, into the cistern. */
const islandFallDeathMessage = (state: GameState) => {
  const x = state.player.pos.x;
  if (state.player.health <= 0 || regionOf(x) !== 'cell') return undefined;
  const pick = (l: string[]) => l[Math.floor(Math.random() * l.length)];
  if (x < COURSE.island.house) return pick(['FELL THROUGH THE FLOOR', 'SOLITARY CONFINEMENT', 'THE HOLE']);
  if (x < COURSE.island.yard) return pick(['ESCAPED FROM ALCATRAZ', 'SWIM FOR IT', 'SHARK FOOD']);
  return pick(['DROWNED IN THE DUNGEON', 'DOWN THE WELL']);
};

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
  // (at the foot of the citadel, by the refill)
  bossStartX: COURSE.checkpoints[CP.DOOR].x,
  // (down under the citadel's vaults, not on top of them)
  bossStartY: COURSE.checkpoints[CP.DOOR].y,
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
    // The cell house's roof (under the skylights), and the citadel's vaults: nobody's jumping out through either
    state.blocks.push({ x: C.cellblock.x1 - 60, y: GROUND_Y - 470 - 40, w: C.island.house - C.cellblock.x1 + 60, h: 40, type: 'wall', hidden: true, tag: 'house-roof' });
    state.blocks.push({ x: C.island.yard, y: GROUND_Y - 230 - 40, w: C.cellblock.x2 - C.island.yard, h: 40, type: 'wall', hidden: true, tag: 'citadel-vault' });
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
    // (what got him in particular first: a jet skier, a gull; the bay's only the catch-all out there)
    return quakeDeathMessage(ctx.state, rt.quakes) ?? islandFallDeathMessage(ctx.state) ?? deathByCause(ctx.state) ?? skiDeathMessage(rt.ski);
  },
  drawBack: (ctx, state) => { if (getErnie(state)) drawErnieBack(ctx, state); },
  drawMid: (ctx, state) => { if (getErnie(state)) drawErnieMid(ctx, state); },
  drawFront: (ctx, state) => { if (getErnie(state)) drawErnieFront(ctx, state); },
  drawHud: (ctx, state) => { if (getErnie(state)) drawErnieHud(ctx, state); },
  drawBackdrop: (ctx, state) => !!getErnie(state) && drawErnieBackdrop(ctx, state),
  drawBackdropFront: (ctx, state) => !!getErnie(state) && drawErnieWeather(ctx, state),
  // (pushed in on the hallway outside Ernie's door, once the hipster's come down through it)
  zoom: state => { const rt = getErnie(state); return rt ? plungeZoom(state, rt.bridge.plunge) ?? hallZoom(state, rt.doorCrash) : null; },
  // (off the bridge: the kill cam's sounds)
  deathSceneTick: (ctx, t) => { if (getErnie(ctx.state)?.bridge.plunge?.splashAt) tickPlunge(t); },
  // (on the bridge the view sits higher, so you can see down through the gaps and the steel underneath)
  cameraRow: state => {
    const rt = getErnie(state);
    if (rt && isRiding(rt.ski)) return undefined;
    return regionOf(state.player.pos.x) === 'main' && onBridge(state.player.pos.x) ? 430 : undefined;
  },
};

