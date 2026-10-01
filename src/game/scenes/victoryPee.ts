// After a weakness kill, while VICTORY spells out, Meathead strolls over to
// what's left of the boss and takes a leak on it: belt undone, pants straight
// down round his ankles (it's how he does it everywhere), and let it go.

import { CANVAS_WIDTH, BOSS_DOOR_X, ARENA_LEFT, GROUND_Y, GRAVITY } from '../../constants';
import { TOMMY_BOARD_Y } from '../bosses/tommy';
import type { FrameContext } from '../core/context';
import { getBossDef, getArenaRight, getStageWidth } from '../bosses/registry';

const STAND_OFF = 72;        // how far from the corpse he stands
const WALK_SPEED = 3.5;
const PEE_FRAMES = 200;      // then a shake and he's done
export const PEE_SHAKE_FRAMES = 14;
/** First the belt (fumbling with the buckle), then the pants dropping, then it starts. */
export const PEE_UNBUCKLE = 26, PEE_DROP = 10, PEE_START = PEE_UNBUCKLE + PEE_DROP;
const PEE_END = PEE_START + PEE_FRAMES + PEE_SHAKE_FRAMES;

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
    if ((p.peeTimer || 0) < PEE_END) p.peeTimer = (p.peeTimer || 0) + 1;
    state.playerAnimFrame++;
    const t = p.peeTimer || 0;
    // (the buckle, and the pants hitting the floor)
    if (t === 6) ctx.fx.playGunSound('clink');
    if (t === PEE_UNBUCKLE + PEE_DROP - 2) ctx.fx.playGunSound('land', 0.5);
    // Tinkle tinkle, once the stream reaches him
    if (t > PEE_START + 12 && t <= PEE_START + PEE_FRAMES && (state.frame % 5 === 0 || Math.random() < 0.08)) ctx.fx.playGunSound('tinkle');
  }

  // In a wide arena the camera keeps him and the corpse in view
  if (getArenaRight(stageId) - ARENA_LEFT > CANVAS_WIDTH) {
    const target = (p.pos.x + p.width / 2 + corpse.x) / 2 - CANVAS_WIDTH / 2;
    const clamped = Math.max(BOSS_DOOR_X, Math.min(getStageWidth(stageId) - CANVAS_WIDTH, target));
    state.camera.x += (clamped - state.camera.x) * 0.1;
  }
};

export const peeFinished = (peeTimer: number | undefined) => (peeTimer || 0) >= PEE_END;

/**
 * Where he's got to: undoing the belt, the pants dropping (`drop`: 0 up to 1 round his ankles), then it out and the
 * stream going (`t`: frames since it started), then the shake. `busy`: any of it (hands down there, weapon away).
 */
export const peeProgress = (peeTimer: number | undefined) => {
  const p = peeTimer || 0, t = p - PEE_START;
  return {
    busy: p > 0 && p < PEE_END,
    undoing: p > 0 && p <= PEE_UNBUCKLE,
    drop: p <= PEE_UNBUCKLE ? 0 : Math.min(1, (p - PEE_UNBUCKLE) / PEE_DROP),
    t,
    peeing: t > 0 && t <= PEE_FRAMES,
    shaking: t > PEE_FRAMES && t < PEE_FRAMES + PEE_SHAKE_FRAMES,
    out: t > 0 && p < PEE_END,
  };
};
