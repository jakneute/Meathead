// After a weakness kill, while VICTORY spells out, Meathead strolls over to
// what's left of the boss and takes a leak on it.

import { CANVAS_WIDTH, BOSS_DOOR_X, ARENA_LEFT, GROUND_Y, GRAVITY } from '../constants';
import { TOMMY_BOARD_Y } from './bosses/tommy';
import type { FrameContext } from './context';
import { getBossDef, getArenaRight, getStageWidth } from './boss';

const STAND_OFF = 72;        // how far from the corpse he stands
const WALK_SPEED = 3.5;
const PEE_FRAMES = 200;      // then a shake and he's done
export const PEE_SHAKE_FRAMES = 14;

export const updateVictoryPee = (ctx: FrameContext) => {
  const { state, stageId } = ctx;
  const corpse = state.bossCorpse;
  const p = state.player;
  if (!corpse) return;
  // Tommy's pool has no floor: he walks along the (restored) boards instead
  const floorY = getBossDef(stageId)?.arena?.floorless ? TOMMY_BOARD_Y : GROUND_Y;

  // Drop to the floor if he was mid-air when the boss died
  if (p.pos.y + p.height < floorY) {
    p.vel.y += GRAVITY;
    p.pos.y = Math.min(floorY - p.height, p.pos.y + p.vel.y);
    p.isGrounded = p.pos.y + p.height >= floorY;
    return;
  }
  p.pos.y = floorY - p.height;
  p.vel.y = 0;
  p.isGrounded = true;

  const mid = p.pos.x + p.width / 2;
  const side = mid <= corpse.x ? -1 : 1; // which side of the corpse he's on
  p.facing = side === -1 ? 1 : -1;
  const standMid = Math.max(ARENA_LEFT + p.width, Math.min(getArenaRight(stageId) - p.width, corpse.x + side * STAND_OFF));

  if ((p.peeTimer || 0) === 0 && Math.abs(standMid - mid) > WALK_SPEED) {
    // Strolling over
    p.vel.x = Math.sign(standMid - mid) * WALK_SPEED;
    p.pos.x += p.vel.x;
    state.playerAnimFrame++;
  } else {
    p.vel.x = 0;
    if ((p.peeTimer || 0) < PEE_FRAMES + PEE_SHAKE_FRAMES) p.peeTimer = (p.peeTimer || 0) + 1;
    state.playerAnimFrame++;
  }

  // In a wide arena the camera keeps him and the corpse in view
  if (getArenaRight(stageId) - ARENA_LEFT > CANVAS_WIDTH) {
    const target = (p.pos.x + p.width / 2 + corpse.x) / 2 - CANVAS_WIDTH / 2;
    const clamped = Math.max(BOSS_DOOR_X, Math.min(getStageWidth(stageId) - CANVAS_WIDTH, target));
    state.camera.x += (clamped - state.camera.x) * 0.1;
  }
};

export const peeFinished = (peeTimer: number | undefined) => (peeTimer || 0) >= PEE_FRAMES + PEE_SHAKE_FRAMES;

/** 0 before he starts, then how far into the leak he is; the stream flows until PEE_FRAMES. */
export const peeProgress = (peeTimer: number | undefined) => ({
  peeing: !!peeTimer && peeTimer <= PEE_FRAMES,
  shaking: !!peeTimer && peeTimer > PEE_FRAMES && peeTimer < PEE_FRAMES + PEE_SHAKE_FRAMES,
  out: !!peeTimer && peeTimer < PEE_FRAMES + PEE_SHAKE_FRAMES,
});
