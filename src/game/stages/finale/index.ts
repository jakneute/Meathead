// The finale: the White House press room, straight off the ending (the alien's just burst out of the President, singed
// Meathead's leg hairs, and it's on). No level before it: one room, locked from the first frame, the view pulled back
// to take all of it in, Meathead already on his feet facing him. See runtime.ts (the fight round the alien), room.ts
// (the room, and the wrecks), bosses/alien.ts (him).

import type { StageLayout } from '../index';
import type { Block } from '../../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';
import { createBoss } from '../../bosses/registry';
import { ALIEN_ID } from '../../bosses/alien';
import { newFinale, getFinale, drawingFinale } from './state';
import { updateFinale } from './runtime';
import { drawRoomBack, drawRoomMid, drawRoomFront, drawFinaleHud } from './room';
import { ROOM_L, ROOM_R, ROOM_TOP, FLOOR, VIEW_X, VIEW_Y, VIEW_W, VIEW_H, VIEW_SCALE, DOOR_H, RISERS, RISER_H } from './geometry';

export const finaleLayout: StageLayout = {
  left: ROOM_L - 400,
  // (he stands on the left of the room, the alien floating on the right; the camera's on the whole room)
  startX: VIEW_X,
  bossStartX: VIEW_X,
  bossStartY: FLOOR,
  ownBossBarrier: true,
  startsStanding: true,
  verticalCamera: false,
  runsInArena: true,
  taserReachesOffscreen: true,
  build: state => {
    state.stage = newFinale();
    // The room: the floor (on out under the side walls' doors), the side walls (doorways at their feet, for the
    // Secret Service), the ceiling, the two press risers. The room's walls and the rest are drawn by room.ts.
    const blocks: Block[] = [
      { x: ROOM_L - 400, y: FLOOR, w: ROOM_R - ROOM_L + 800, h: 80, type: 'ground', hidden: true },
      { x: ROOM_L - 100, y: -3000, w: 100, h: 3000 + FLOOR - DOOR_H, type: 'wall', hidden: true },
      { x: ROOM_R, y: -3000, w: 100, h: 3000 + FLOOR - DOOR_H, type: 'wall', hidden: true },
      { x: ROOM_L - 100, y: ROOM_TOP - 400, w: ROOM_R - ROOM_L + 200, h: 400, type: 'wall', hidden: true },
      ...RISERS.map(r => ({ x: r.x, y: r.y, w: r.w, h: RISER_H, type: 'platform' as const, oneWay: true, hidden: true })),
    ];
    state.blocks = blocks;
    state.groundRuns = [];
    state.enemies = state.enemies.filter(e => e.type !== 'boss');
    state.enemies.push(createBoss(ALIEN_ID));
    // Locked in from the start: no door to kick, no way out
    state.doorState = 'done';
    state.doorOpenAmount = 0;
    state.bossCheckpoint = true;
    state.camera = { x: VIEW_X, y: VIEW_Y };
    state.cameraOverride = { x: VIEW_X, y: VIEW_Y };
    state.view = { x: VIEW_X, y: VIEW_Y, w: VIEW_W, h: VIEW_H };
    state.cameraRestY = VIEW_Y;
    state.cameraMinX = VIEW_X;
  },
  update: (ctx, controls) => updateFinale(ctx, controls),
  zoom: () => ({ scale: VIEW_SCALE, x: VIEW_X, y: VIEW_Y }),
  // (the room's its own backdrop: nothing behind it but black)
  drawBackdrop: ctx => { ctx.fillStyle = '#05050a'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); return true; },
  drawBack: (ctx, state) => { drawingFinale(getFinale(state)); drawRoomBack(ctx, state); },
  drawMid: drawRoomMid,
  drawFront: drawRoomFront,
  drawHud: drawFinaleHud,
  // (the risers' metal decks; the carpet's a soft thud, or a slosh once it's flooded)
  footstep: (state, floor) => (floor.type === 'platform' ? 'metal' : getFinale(state)?.wrecked.TSUNAMI !== undefined ? 'wet' : 'dirt'),
};
