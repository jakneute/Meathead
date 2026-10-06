// The end of the marina: an old boy fishing off the last pier in a hurricane.
// Meathead takes his boat (and throws him in), guns it out across the open
// water, and runs straight into a waterspout that sucks him, boat and all, up
// into the storm.

import type { Block } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { shakeScreen } from '../../core/state';
import { playSound } from '../../platform/audio';
import { say, MEATHEAD_VOICE, Voice, holdForSpeech } from '../../platform/speech';
import { COURSE, CP } from './course';
import { KICK_POSE_FRAMES } from '../../../constants';
import { Chase, startChase, updateChase, spoutTakesCutter } from './chase';
import { isShat } from '../../player/gut';

type BoatPhase = 'waiting' | 'cutscene' | 'launch' | 'riding' | 'spout' | 'gone';

export interface Boat {
  phase: BoatPhase;
  t: number;
  /** Frames it's been quiet (the scene waits for lines to finish: see BOAT_HOLDS). */
  quiet: { n: number };
  /** The old man: sitting, flying, bobbing in the water; or what's left once the boat's been over him (his head,
   * flying, then bobbing, and when it went: the red in the water fades from then). */
  oldMan: { x: number; y: number; vx: number; vy: number; rot: number; state: 'fishing' | 'flying' | 'swimming' | 'headless'; line: string; lineT: number;
    head?: { x: number; y: number; vx: number; vy: number; rot: number; afloat: boolean; t: number; rel0: number }; goneAt?: number };
  x: number;
  y: number;
  block: Block;
  speed: number;
  /** The waterspout spinning him up: angle and height gained. */
  spin: number;
  lift: number;
  /** The Coast Guard after him across the open water (see chase.ts). */
  chase: Chase | null;
}

const BOAT_W = 150;

export const createBoat = (state: GameState, startedAt: number): Boat => {
  const block: Block = { x: COURSE.boat.x, y: COURSE.boat.y - 18, w: BOAT_W, h: 14, type: 'platform', hidden: true, oneWay: true, tag: 'boat' };
  const past = startedAt >= CP.TOWER;
  if (!past) state.blocks.push(block);
  // (back out on the water at the chase's checkpoint: in the boat, the old man long since in the drink, off again)
  const out = startedAt === CP.CHASE;
  const x = out ? COURSE.checkpoints[startedAt].x - 40 : COURSE.boat.x;
  if (out) block.x = x;
  return {
    phase: past ? 'gone' : out ? 'riding' : 'waiting', t: 0, quiet: { n: 0 },
    // (back at the chase: he's long gone, what was left of him far behind)
    oldMan: { x: COURSE.fisherman.x, y: out ? COURSE.sea.y + 6 : COURSE.fisherman.y, vx: 0, vy: 0, rot: 0, state: out ? 'headless' : 'fishing', line: '', lineT: 0, goneAt: out ? -9999 : undefined },
    x, y: COURSE.boat.y, block, speed: 0, spin: 0, lift: 0, chase: null,
  };
};

const meatheadSays = (state: GameState, text: string) => {
  // (after whoever's talking: nobody talks over anybody)
  const shown = say(text, MEATHEAD_VOICE, 'queue', {
    onShow: () => { state.playerLastVulgarity = text; state.playerVulgarityTimer = 150; },
    onHide: () => { if (state.playerLastVulgarity === text) state.playerVulgarityTimer = 0; },
  });
  if (!shown) { state.playerLastVulgarity = text; state.playerVulgarityTimer = 120; }
};
const OLDMAN_VOICE: Voice = { id: 'oldman', pitch: 0.8, rate: 0.9 };
const oldManSays = (b: Boat, text: string) => {
  say(text, OLDMAN_VOICE, 'queue', { onShow: () => { b.oldMan.line = text; b.oldMan.lineT = 120 + text.length * 3; }, onHide: () => { if (b.oldMan.line === text) b.oldMan.lineT = 0; } });
};
/** Where the scene waits for the line before to be finished: each answer, the kick, "...STILL BITIN'", getting in the boat, and off. */
const BOAT_HOLDS = new Set([80, 150, 230, 300, 320, 340, 379]);

/** Returns the controls to use (it takes them over from the cutscene on). Calls onSucked when the spout's got him. */
export const updateBoat = (ctx: FrameContext, b: Boat, controls: Controls, onSucked: () => void): Controls => {
  const { state } = ctx;
  const { player } = state;
  // (the cutscene's clock waits at each beat till the line before's been said)
  if (b.phase !== 'cutscene' || holdForSpeech(b.t, BOAT_HOLDS, b.quiet)) b.t++;
  if (b.oldMan.lineT > 0) b.oldMan.lineT--;
  updateOldMan(b);
  switch (b.phase) {
    case 'waiting':
      if (player.isGrounded && Math.abs(player.pos.x + player.width / 2 - b.oldMan.x) < 240) { b.phase = 'cutscene'; b.t = 0; }
      return controls;
    case 'cutscene': return cutscene(ctx, b);
    case 'launch': return launch(ctx, b);
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
  } else if (m.state === 'headless' && m.head) {
    // (his head: way up off the bow, turning over and over, carried along over the boat, and down a couple of seconds
    // later in the water a little way ahead of it, where he can't miss it; then bobbing there as the boat comes up on it)
    const h = m.head;
    if (!h.afloat) {
      h.t++; h.vy += HEAD_GRAVITY; h.y += h.vy; h.rot += 0.16;
      const k = Math.min(1, h.t / HEAD_FLIGHT), ease = k * k * (3 - 2 * k);
      h.x = b.x + BOAT_W + h.rel0 + (HEAD_AHEAD - h.rel0) * ease;
      if (h.vy > 0 && h.y >= COURSE.sea.y - 2) { h.afloat = true; h.y = COURSE.sea.y - 2; h.rot = 0.4; playSound('splash', 0.6); }
    } else { h.y = COURSE.sea.y - 2 + Math.sin(b.t * 0.12) * 2; h.x -= 0.3; }
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
  if (t === 80) meatheadSays(state, isShat(state) ? "NEED YOUR BOAT, GRAMPS. DON'T ASK ABOUT THE SMELL." : 'NEED YOUR BOAT, GRAMPS.');
  if (t === 150) oldManSays(b, isShat(state) ? "IN THIS WEATHER? YOU'LL GET KILLED OUT THERE! ...AND DON'T YOU SIT ON MY CUSHIONS LIKE THAT!" : "IN THIS WEATHER? YOU'LL GET KILLED OUT THERE!");
  if (t === 230) {
    // Up and over, into the drink
    player.facing = 1;
    player.kickPose = KICK_POSE_FRAMES;
    // (out over the boat and into the water ahead of it: right where it's about to go)
    b.oldMan.state = 'flying'; b.oldMan.vx = 11; b.oldMan.vy = -12;
    oldManSays(b, 'WHOOAAA!');
    ctx.fx.playGunSound('splash');
    shakeScreen(state, 8, 4);
  }
  if ((player.kickPose || 0) > 0) player.kickPose!--;
  if (t === 300) oldManSays(b, isShat(state) ? "...STILL BITIN'. HE CAN KEEP THE BOAT." : "...STILL BITIN'.");
  if (t === 320) {
    // Into the boat
    player.pos.x = b.x + 40; player.pos.y = b.block.y - player.height; player.vel = { x: 0, y: -4 };
  }
  if (t === 340) { meatheadSays(state, 'CATCH YOU LATER.'); playSound('engine'); }
  if (t >= 380) {
    b.phase = 'launch'; b.t = 0;
    state.cameraOverride = null;
    state.cameraLeadX = 200;
  }
  return c;
};

/** His head, up off the bow: how hard it goes up, how floaty it comes down (about two seconds up there), and where it
 * lands (ahead of the bow). */
const HEAD_UP = -8, HEAD_GRAVITY = 0.13, HEAD_FLIGHT = 122, HEAD_AHEAD = 230;
/** How long after the old man's gone under the bow before it's his to drive. */
const LAUNCH_AFTER = 70;
/**
 * Off: the boat opens up, still the cutscene, straight over the old man bobbing in its way. The hull takes the rest of
 * him; his head goes up off the bow, hat and all, and comes down bobbing. Then it's his to drive.
 */
const launch = (ctx: FrameContext, b: Boat): Controls => {
  const { state, fx } = ctx;
  const { player } = state;
  player.inCutscene = true;
  player.invincibilityTimer = Math.max(player.invincibilityTimer, 2);
  b.speed = Math.min(7.2, b.speed + 0.22);
  moveBoatTo(state, b, b.speed, COURSE.boat.y);
  const m = b.oldMan;
  // (still in the air from the kick, or bobbing: either way the bow has him)
  if ((m.state === 'swimming' || m.state === 'flying') && b.x + BOAT_W - 20 >= m.x) {
    m.state = 'headless'; m.goneAt = b.t;
    m.y = COURSE.sea.y + 6;
    m.head = { x: m.x, y: COURSE.sea.y - 14, vx: 0, vy: HEAD_UP, rot: 0, afloat: false, t: 0, rel0: m.x - (b.x + BOAT_W) };
    for (let i = 0; i < 26; i++) state.particles.push({ pos: { x: m.x + (Math.random() - 0.5) * 20, y: COURSE.sea.y - 4 }, vel: { x: 1 + Math.random() * 5, y: -2 - Math.random() * 7 }, life: 26 + Math.random() * 20, color: i % 3 ? '#B91C1C' : '#7F1D1D', size: 3 + Math.random() * 4, grav: 0.35 });
    fx.spawnExplosion({ x: m.x, y: COURSE.sea.y - 10 }, '#8B0000', 14, 0, 10);
    playSound('crunch', 0.9); playSound('splat'); playSound('splash', 0.7);
    shakeScreen(state, 10, 5);
  }
  if (m.goneAt !== undefined && b.t === m.goneAt + 24) meatheadSays(state, "GUESS THEY'RE STILL BITIN'.");
  if (m.goneAt !== undefined && b.t >= m.goneAt + LAUNCH_AFTER) { b.phase = 'riding'; b.t = 0; }
  // (never reached him somehow: the boat's not leaving without going over him, so bring him to the bow)
  if (m.goneAt === undefined && b.t > 120) { m.state = 'swimming'; m.x = b.x + BOAT_W - 24; m.y = COURSE.sea.y + 6; }
  return { ...NO_CONTROLS };
};

/** Flat out across the open water, him at the wheel, the Coast Guard after him (see chase.ts). */
const ride = (ctx: FrameContext, b: Boat, controls: Controls): Controls => {
  const { state } = ctx;
  if (!b.chase) { b.chase = startChase(state, b.x); b.speed = Math.max(b.speed, 4); state.checkpoint = Math.max(state.checkpoint, CP.CHASE); }
  // (boarded: the kill camera's playing, and that's that)
  if (b.chase.caughtT > 0) return { ...NO_CONTROLS };
  const c = updateChase(ctx, b.chase, b, (dx, y) => moveBoatTo(state, b, dx, y), controls);
  if (b.x + BOAT_W / 2 > COURSE.sea.spoutX - 420 && b.chase.caughtT === 0) {
    state.cameraLeadX = 200;
    state.player.isDucking = false;
    state.player.hidden = false;
    b.phase = 'spout'; b.t = 0;
    meatheadSays(state, 'OH, COME ON.');
    playSound('thunder');
  }
  return c;
};

/** The boat on, by dx, and its keel at y (riding the swell, or up off it in a hop): him in it, all of it. */
const moveBoatTo = (state: GameState, b: Boat, dx: number, y: number) => {
  const { player } = state;
  b.x += dx; b.y = y;
  b.block.x = b.x; b.block.y = b.y - 18;
  player.pos.x += dx;
  player.pos.y = b.block.y - player.height;
  player.isGrounded = true;
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
  // (and the cutter in after him)
  if (b.chase) spoutTakesCutter(b.chase, COURSE.sea.spoutX, b.t);
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
  // (him, and the cutter coming up after him: both in the picture)
  const cgY = b.chase ? COURSE.boat.y - b.chase.cgLift : b.y;
  state.cameraOverride = { x: COURSE.sea.spoutX - 400, y: Math.min(COURSE.fisherman.y - 530, (b.y + cgY) / 2 - 330) };
  if (state.frame % 3 === 0) shakeScreen(state, 4, 5);
  if (b.t > 150) {
    b.phase = 'gone';
    state.blocks = state.blocks.filter(bl => bl !== b.block);
    onSucked();
  }
  return { ...NO_CONTROLS };
};

export const BOAT_WIDTH = BOAT_W;
