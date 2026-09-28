// The end of the marina: an old boy fishing off the last pier in a hurricane.
// Meathead takes his boat (and throws him in), guns it out across the open
// water, and runs straight into a waterspout that sucks him, boat and all, up
// into the storm.

import type { Block } from '../../../types';
import type { FrameContext } from '../../context';
import type { GameState } from '../../state';
import type { Controls } from '../../input';
import { NO_CONTROLS } from '../../input';
import { shakeScreen } from '../../state';
import { playSound } from '../../audio';
import { say, MEATHEAD_VOICE } from '../../speech';
import { COURSE, CP } from './course';

type BoatPhase = 'waiting' | 'cutscene' | 'riding' | 'spout' | 'gone';

export interface Boat {
  phase: BoatPhase;
  t: number;
  /** The old man: sitting, flying, bobbing in the water. */
  oldMan: { x: number; y: number; vx: number; vy: number; rot: number; state: 'fishing' | 'flying' | 'swimming'; line: string; lineT: number };
  x: number;
  y: number;
  block: Block;
  speed: number;
  /** The waterspout spinning him up: angle and height gained. */
  spin: number;
  lift: number;
}

const BOAT_W = 150, RIDE_SPEED = 9;

export const createBoat = (state: GameState, startedAt: number): Boat => {
  const block: Block = { x: COURSE.boat.x, y: COURSE.boat.y - 18, w: BOAT_W, h: 14, type: 'platform', hidden: true, tag: 'boat' };
  const past = startedAt >= CP.TOWER;
  if (!past) state.blocks.push(block);
  return {
    phase: past ? 'gone' : 'waiting', t: 0,
    oldMan: { x: COURSE.fisherman.x, y: COURSE.fisherman.y, vx: 0, vy: 0, rot: 0, state: 'fishing', line: '', lineT: 0 },
    x: COURSE.boat.x, y: COURSE.boat.y, block, speed: 0, spin: 0, lift: 0,
  };
};

const meatheadSays = (state: GameState, text: string) => {
  const shown = say(text, MEATHEAD_VOICE, 'urgent', {
    onShow: () => { state.playerLastVulgarity = text; state.playerVulgarityTimer = 150; },
    onHide: () => { if (state.playerLastVulgarity === text) state.playerVulgarityTimer = Math.min(state.playerVulgarityTimer, 30); },
  });
  if (!shown) { state.playerLastVulgarity = text; state.playerVulgarityTimer = 120; }
};
const oldManSays = (b: Boat, text: string) => { b.oldMan.line = text; b.oldMan.lineT = 120; };

/** Returns the controls to use (it takes them over from the cutscene on). Calls onSucked when the spout's got him. */
export const updateBoat = (ctx: FrameContext, b: Boat, controls: Controls, onSucked: () => void): Controls => {
  const { state } = ctx;
  const { player } = state;
  b.t++;
  if (b.oldMan.lineT > 0) b.oldMan.lineT--;
  updateOldMan(b);
  switch (b.phase) {
    case 'waiting':
      if (player.isGrounded && Math.abs(player.pos.x + player.width / 2 - b.oldMan.x) < 240) { b.phase = 'cutscene'; b.t = 0; }
      return controls;
    case 'cutscene': return cutscene(ctx, b);
    case 'riding': return ride(ctx, b, controls);
    case 'spout': return spout(ctx, b, onSucked);
    default: return controls;
  }
};

const updateOldMan = (b: Boat) => {
  const m = b.oldMan;
  if (m.state === 'flying') {
    m.vy += 0.6; m.x += m.vx; m.y += m.vy; m.rot += 0.25;
    if (m.y > COURSE.sea.y + 6) { m.state = 'swimming'; m.y = COURSE.sea.y + 6; m.vx = 0; m.vy = 0; m.rot = 0; }
  } else if (m.state === 'swimming') {
    m.y = COURSE.sea.y + 6 + Math.sin(b.t * 0.1) * 3;
  }
};

const cutscene = (ctx: FrameContext, b: Boat): Controls => {
  const { state } = ctx;
  const { player } = state;
  const t = b.t;
  state.cameraOverride = { x: b.oldMan.x - 420, y: COURSE.fisherman.y - 530 };
  player.inCutscene = true;
  player.invincibilityTimer = Math.max(player.invincibilityTimer, 2);
  state.gapGrace = Math.max(state.gapGrace || 0, 2);
  let c: Controls = { ...NO_CONTROLS };
  const standAt = b.oldMan.x - 60;
  const px = player.pos.x + player.width / 2;
  if (t < 90 && Math.abs(px - standAt) > 6) c = { ...c, right: px < standAt, left: px > standAt };
  else if (t < 90) player.vel.x = 0;
  if (t === 10) oldManSays(b, "BITIN' LIKE CRAZY TODAY.");
  if (t === 80) meatheadSays(state, 'NEED YOUR BOAT, GRAMPS.');
  if (t === 150) oldManSays(b, "IN THIS WEATHER? YOU'LL GET KILLED OUT THERE!");
  if (t === 230) {
    // Up and over, into the drink
    player.facing = 1;
    player.kickPose = 16;
    b.oldMan.state = 'flying'; b.oldMan.vx = 5; b.oldMan.vy = -11;
    oldManSays(b, 'WHOOAAA!');
    ctx.fx.playGunSound('tsunami');
    shakeScreen(state, 8, 4);
  }
  if ((player.kickPose || 0) > 0) player.kickPose!--;
  if (t === 300) oldManSays(b, "...STILL BITIN'.");
  if (t === 320) {
    // Into the boat
    player.pos.x = b.x + 40; player.pos.y = b.block.y - player.height; player.vel = { x: 0, y: -4 };
  }
  if (t === 340) { meatheadSays(state, 'CATCH YOU LATER.'); playSound('horn'); }
  if (t >= 380) {
    b.phase = 'riding'; b.t = 0;
    player.inCutscene = false;
    state.cameraOverride = null;
    state.cameraLeadX = 200;
  }
  return c;
};

/** Flat out across the open water (he can still shoot, duck and hop about in it). */
const ride = (ctx: FrameContext, b: Boat, controls: Controls): Controls => {
  const { state } = ctx;
  const { player } = state;
  b.speed = Math.min(RIDE_SPEED, b.speed + 0.2);
  moveBoat(state, b, b.speed, Math.sin(b.t * 0.12) * 0.8);
  // Spray off the bow
  if (state.frame % 2 === 0) state.particles.push({ pos: { x: b.x + BOAT_W, y: b.y - 6 }, vel: { x: 2 + Math.random() * 3, y: -2 - Math.random() * 3 }, life: 18, color: '#E0F2FE', size: 3 + Math.random() * 3 });
  if (b.x + BOAT_W / 2 > COURSE.sea.spoutX - 420) {
    b.phase = 'spout'; b.t = 0;
    meatheadSays(state, 'OH, COME ON.');
    playSound('nuke');
  }
  // He stays on board: no walking off either end, no specials launching him overboard
  return {
    ...controls, special: false,
    left: controls.left && player.pos.x > b.x + 8,
    right: controls.right && player.pos.x + player.width < b.x + BOAT_W - 8,
  };
};

const moveBoat = (state: GameState, b: Boat, dx: number, dy: number) => {
  const { player } = state;
  const onBoard = player.pos.x + player.width > b.x && player.pos.x < b.x + BOAT_W && Math.abs(player.pos.y + player.height - b.block.y) < 6;
  b.x += dx; b.y += dy;
  b.block.x = b.x; b.block.y = b.y - 18;
  // (he moves with the boat even mid-hop: he's in it, not chasing it)
  player.pos.x += dx;
  if (onBoard) player.pos.y = b.block.y - player.height;
};

/** The spout: dragged in, spun round it and lifted clean out of the sea. */
const spout = (ctx: FrameContext, b: Boat, onSucked: () => void): Controls => {
  const { state } = ctx;
  const { player } = state;
  player.inCutscene = true;
  player.invincibilityTimer = Math.max(player.invincibilityTimer, 2);
  const toward = COURSE.sea.spoutX - (b.x + BOAT_W / 2);
  if (b.t < 50) {
    moveBoat(state, b, Math.max(2, toward * 0.06), 0);
  } else {
    // Round and round, up and up
    b.spin += 0.18;
    b.lift += 6 + b.t * 0.08;
    const cx = COURSE.sea.spoutX, r = 70;
    const nx = cx - BOAT_W / 2 + Math.cos(b.spin) * r;
    b.x = nx; b.y = COURSE.boat.y - b.lift;
    b.block.x = b.x; b.block.y = b.y - 18;
    player.pos.x = b.x + 50; player.pos.y = b.block.y - player.height;
    player.facing = Math.sin(b.spin) > 0 ? 1 : -1;
  }
  state.cameraOverride = { x: COURSE.sea.spoutX - 400, y: Math.min(COURSE.fisherman.y - 530, b.y - 360) };
  if (state.frame % 3 === 0) shakeScreen(state, 4, 5);
  if (b.t > 150) {
    b.phase = 'gone';
    state.blocks = state.blocks.filter(bl => bl !== b.block);
    onSucked();
  }
  return { ...NO_CONTROLS };
};

export const BOAT_WIDTH = BOAT_W;
