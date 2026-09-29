// The way down. A skier is admiring the view at the summit; Meathead boots him
// off the mountain and takes his skis. The racket sets off an avalanche, and
// it's a race to the bottom: jump rocks, logs, trees and crevasses, duck
// branches (or shoot the logs and trees out of the way). Let the avalanche
// catch you and you're rolled up in a snowball for a while (it hurts), then
// spat out ahead of it. At the bottom it flattens the park ranger's cabin
// behind you, and you step off your skis at Artie's door without a scratch.

import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { shakeScreen } from '../../core/state';
import { rectsOverlap, boundsOf } from '../../core/utils';
import { say, MEATHEAD_VOICE, Voice } from '../../platform/speech';
import { playSound } from '../../platform/audio';
import { groundLineAt } from '../../core/terrain';
import { GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT, KICK_POSE_FRAMES } from '../../../constants';
import { COURSE, CP, SkiObstacle } from './course';

type SkiPhase = 'waiting' | 'cutscene' | 'skiing' | 'runout' | 'finale' | 'done';

export interface Ski {
  phase: SkiPhase;
  t: number;
  skier: { x: number; y: number; vx: number; vy: number; rot: number; state: 'stand' | 'flying' | 'gone'; line: string; lineT: number };
  /** The skis in the air, on their way to Meathead's feet. */
  skis: { x: number; y: number; vx: number; vy: number; rot: number } | null;
  /** Front edge of the avalanche (it's all snow to the left of this). */
  avX: number;
  /** Rolled up in a snowball: frames left, and where the ball is. */
  ball: number;
  ballX: number;
  ballRot: number;
  crash: number;
  broken: boolean[];
  /** The ranger cabin: when it got hit (0 = still standing). */
  cabinHitAt: number;
  /** Where the avalanche finally stopped (the snow pile's front). */
  pileX: number;
  /** In the cutscene: he's walked up to the skier and it's started. */
  arrived: boolean;
  /** In the cutscene, if anything's still alive on screen: the avalanche's first surge, which comes right up behind him and pulverizes it. */
  surge: boolean;
}

// Ski speeds (px/frame): cruising, pushing on, and dragging your heels
const SKI_BASE = 9.2, SKI_FAST = 11, SKI_SLOW = 7, SKI_CRASHED = 2.5;
const AVALANCHE_SPEED = 8.7, AVALANCHE_CATCHUP = 12.5;
/** The cutscene surge: how fast it comes in, and how close behind him it stops. */
const SURGE_SPEED = 18, SURGE_STOP = 90;
/** After a surge it's right on his tail: it drops back to this speed until he's got his usual head start. */
const AVALANCHE_AFTER_SURGE = 5, AVALANCHE_HEAD_START = 650;
const BALL_FRAMES = 90, BALL_DAMAGE = 22;
const CRASH_FRAMES = 42, CRASH_DAMAGE = 6;
/** What goes up over his head when he skis into each kind of thing. */
const CRASH_CALLOUTS: Record<SkiObstacle['kind'], { lines: string[]; color: string }> = {
  rock: { lines: ['ROCKED!', 'SHIN CHECK!', 'STONE COLD!'], color: '#A8A29E' },
  log: { lines: ['LOGJAMMED!', 'TIMBER!', 'SPLINTERED!'], color: '#D97706' },
  pine: { lines: ['TREE HUGGER!', 'PINED!', 'BARKED!'], color: '#4ADE80' },
  branch: { lines: ['CLOTHESLINED!', 'SHOULDA DUCKED!', 'BRANCHED!'], color: '#FDE047' },
};

/** How far ahead of him the camera looks on skis (not so far he ends up under the HUD in the corner). */
const SKI_CAMERA_LEAD = 190;

export const createSki = (state: GameState, startedAt: number): Ski => {
  const onSkis = startedAt === CP.SKI;
  const past = startedAt > CP.SKI;
  const ski: Ski = {
    phase: past ? 'done' : onSkis ? 'skiing' : 'waiting', t: 0,
    skier: { x: COURSE.skier.x, y: COURSE.skier.y, vx: 0, vy: 0, rot: 0, state: onSkis || past ? 'gone' : 'stand', line: '', lineT: 0 },
    skis: null, avX: COURSE.checkpoints[CP.SKI].x - 650, ball: 0, ballX: 0, ballRot: 0, crash: 0,
    broken: COURSE.ski.obstacles.map(() => false), cabinHitAt: past ? -9999 : 0, pileX: COURSE.cabin.x + 330, surge: false, arrived: false,
  };
  if (onSkis) { state.player.skiing = true; state.player.skiSpeed = SKI_BASE; state.cameraLeadX = SKI_CAMERA_LEAD; }
  if (past) addPile(state, ski);
  return ski;
};

/** The pile's invisible wall goes up this far: no jumping back over it. */
const PILE_WALL_HEIGHT = 3000;

/** The snow pile the avalanche leaves at the bottom: a wall you can't climb back over. */
const addPile = (state: GameState, ski: Ski) => {
  state.blocks.push({ x: ski.pileX - 70, y: GROUND_Y - PILE_WALL_HEIGHT, w: 70, h: PILE_WALL_HEIGHT, type: 'wall', hidden: true, tag: 'snowpile' });
  // (far enough left that you can still see what's left of the cabin)
  state.cameraMinX = Math.max(state.cameraMinX, COURSE.cabin.x - 80);
};

const meatheadSays = (state: GameState, text: string) => {
  const shown = say(text, MEATHEAD_VOICE, 'urgent', {
    onShow: () => { state.playerLastVulgarity = text; state.playerVulgarityTimer = 150; },
    onHide: () => { if (state.playerLastVulgarity === text) state.playerVulgarityTimer = Math.min(state.playerVulgarityTimer, 30); },
  });
  if (!shown) { state.playerLastVulgarity = text; state.playerVulgarityTimer = 120; }
};

const SKIER_VOICE: Voice = { id: 'skier', pitch: 1.2, rate: 1.1 };
const skierSays = (ski: Ski, text: string) => { ski.skier.line = text; ski.skier.lineT = 110; say(text, SKIER_VOICE, 'urgent', { onShow: () => {}, onHide: () => {} }); };

/** Runs the whole thing; returns the controls to use (cutscenes take them over). */
export const updateSki = (ctx: FrameContext, ski: Ski, controls: Controls): Controls => {
  const { state } = ctx;
  const { player } = state;
  ski.t++;
  if (ski.skier.lineT > 0) ski.skier.lineT--;
  updateSkierBody(state, ski);
  switch (ski.phase) {
    case 'waiting':
      if (player.isGrounded && Math.abs(player.pos.x + player.width / 2 - ski.skier.x) < 260) { ski.phase = 'cutscene'; ski.t = 0; }
      return controls;
    case 'cutscene': return cutscene(ctx, ski);
    case 'skiing': return skiing(ctx, ski, controls);
    case 'runout':
    case 'finale': return finale(ctx, ski);
    default: return controls;
  }
};

// ---------------------------------------------------------------------------

const cutscene = (ctx: FrameContext, ski: Ski): Controls => {
  const { state } = ctx;
  const { player } = state;
  const standAt = ski.skier.x - 70;
  state.cameraOverride = { x: COURSE.skier.x - 420, y: COURSE.skier.y - 500 };
  // Nothing gets to hurt him while it plays out: everything else holds off, and their shots in the air fizzle
  player.invincibilityTimer = Math.max(player.invincibilityTimer, 2);
  player.inCutscene = true;
  state.gapGrace = Math.max(state.gapGrace || 0, 2);
  if (ski.t === 1) state.projectiles = state.projectiles.filter(p => p.owner !== 'enemy');
  let c: Controls = { ...NO_CONTROLS };
  // Walks right up behind him first (the scene waits for him to get there)
  const px = player.pos.x + player.width / 2;
  if (!ski.arrived) {
    if (px < standAt - 6) c = { ...c, right: true };
    else if (px > standAt + 6) c = { ...c, left: true };
    // (planted on the spot: no sliding past him on the ice)
    else if (player.isGrounded) { ski.arrived = true; ski.t = 0; player.vel.x = 0; player.pos.x = standAt - player.width / 2; }
    if (!ski.arrived) { ski.t = 0; return c; }
  }
  const t = ski.t;
  player.facing = 1;
  if (t === 20) skierSays(ski, 'BRO. THE POWDER UP HERE IS SICK.');
  if (t === 75) meatheadSays(state, 'NICE SKIS.');
  if (t === 120) skierSays(ski, "THANKS, THEY'RE CARBON FIB-");
  if (t === 138) {
    // The kick
    player.facing = 1;
    player.kickPose = KICK_POSE_FRAMES;
    ski.skier.state = 'flying'; ski.skier.vx = 11; ski.skier.vy = -9;
    ski.skis = { x: ski.skier.x, y: ski.skier.y - 10, vx: -2.2, vy: -11, rot: 0 };
    skierSays(ski, 'AAAAAAAAAAHHHHH');
    shakeScreen(state, 10, 5);
    ctx.fx.playGunSound('punch');
  }
  if ((player.kickPose || 0) > 0) player.kickPose!--;
  // The skis come down at his feet
  if (ski.skis) {
    const s = ski.skis;
    s.vy += 0.6; s.x += s.vx; s.y += s.vy; s.rot += 0.35;
    const feet = player.pos.y + player.height;
    if (s.vy > 0 && s.y >= feet - 4) { ski.skis = null; player.skiing = true; player.skiSpeed = 0; meatheadSays(state, 'MINE NOW.'); }
  }
  if (t === 230) {
    shakeScreen(state, 90, 6); playSound('rumble');
    // Anything still alive on screen is about to have a very bad day
    if (enemiesOnScreen(state).length) { ski.surge = true; ski.avX = state.camera.x - 220; }
  }
  if (ski.surge && t > 240) surge(ctx, ski);
  if (t === 280) meatheadSays(state, '...OH SHIT.');
  if (t >= 330) {
    ski.phase = 'skiing'; ski.t = 0;
    state.cameraOverride = null;
    player.inCutscene = false;
    state.cameraLeadX = SKI_CAMERA_LEAD;
    player.skiing = true;
    player.skiSpeed = SKI_BASE;
    if (!ski.surge) ski.avX = player.pos.x - AVALANCHE_HEAD_START;
    state.checkpoint = Math.max(state.checkpoint, CP.SKI);
    ctx.fx.spawnDamageNumber({ x: player.pos.x - 60, y: player.pos.y - 60 }, 'AVALANCHE!', true, '#F8FAFC');
  }
  return c;
};

const enemiesOnScreen = (state: GameState) => state.enemies.filter(e =>
  e.type !== 'boss' && e.health > 0 && !e.isBlownAway
  && e.pos.x + e.width > state.camera.x && e.pos.x < state.camera.x + CANVAS_WIDTH
  && e.pos.y + e.height > state.camera.y && e.pos.y < state.camera.y + CANVAS_HEIGHT);

/** The surge rolls in behind him and pulverizes whatever it reaches; its powder blast throws anything past him off the mountain. */
const surge = (ctx: FrameContext, ski: Ski) => {
  const { state, fx } = ctx;
  const { player } = state;
  const stop = player.pos.x - SURGE_STOP;
  const arriving = ski.avX < stop;
  ski.avX = Math.min(stop, ski.avX + SURGE_SPEED);
  if (state.frame % 3 === 0) shakeScreen(state, 6, 5);
  for (const e of enemiesOnScreen(state)) {
    const cx = e.pos.x + e.width / 2;
    const reached = cx < ski.avX + 30;
    const blasted = !arriving && cx > player.pos.x;
    if (!reached && !blasted) continue;
    e.health = 0;
    e.isBlownAway = true;
    e.vel = reached ? { x: 16 + Math.random() * 6, y: -12 - Math.random() * 8 } : { x: 18 + Math.random() * 6, y: -9 - Math.random() * 4 };
    // A burst of snow, ice and whatever was inside it
    for (let i = 0; i < 26; i++) {
      state.particles.push({
        pos: { x: cx, y: e.pos.y + e.height / 2 }, vel: { x: (Math.random() - 0.2) * 12, y: -Math.random() * 10 },
        life: 30 + Math.random() * 25, color: i % 3 === 0 ? '#B91C1C' : i % 3 === 1 ? '#7F1D1D' : '#F8FAFC', size: 3 + Math.random() * 5,
      });
    }
    fx.spawnKillCallout(e, 'pulverized');
    shakeScreen(state, 10, 7);
  }
};

/** The skier: stands there, then goes cartwheeling off down the mountain. */
const updateSkierBody = (state: GameState, ski: Ski) => {
  const sk = ski.skier;
  if (sk.state !== 'flying') return;
  sk.vy += 0.55; sk.x += sk.vx; sk.y += sk.vy; sk.rot += 0.3;
  const g = groundLineAt(state.groundRuns, sk.x);
  if (g !== Infinity && sk.y > g) { sk.y = g; sk.vy = -Math.abs(sk.vy) * 0.55 - 2; }
  if (sk.x > state.camera.x + 1400 || sk.y > state.camera.y + 1400) sk.state = 'gone';
};

// ---------------------------------------------------------------------------

const obstacleBox = (o: SkiObstacle) => {
  switch (o.kind) {
    case 'rock': return { x: o.x - 22, y: o.ground - 30, w: 44, h: 30 };
    case 'log': return { x: o.x - 34, y: o.ground - 22, w: 68, h: 22 };
    case 'pine': return { x: o.x - 16, y: o.ground - 76, w: 32, h: 76 };
    case 'branch': return { x: o.x - 44, y: o.ground - 118, w: 88, h: 62 }; // (duck under it, even on a downhill)
  }
};
export { obstacleBox };

const skiing = (ctx: FrameContext, ski: Ski, controls: Controls): Controls => {
  const { state, fx } = ctx;
  const { player } = state;
  // Rolled up in a snowball: carried along until it spits you out
  if (ski.ball > 0) return inBall(ctx, ski);

  // Speed: lean on it, drag your heels, or pick yourself up after a crash
  if (ski.crash > 0) { ski.crash--; player.skiSpeed = SKI_CRASHED + (1 - ski.crash / CRASH_FRAMES) * (SKI_BASE - SKI_CRASHED); }
  else player.skiSpeed = controls.right ? SKI_FAST : controls.left ? SKI_SLOW : SKI_BASE;

  // Obstacles: crash into them, or shoot the logs and trees out of the way
  const hurt = boundsOf(player);
  if (player.isDucking) { hurt.y += 28; hurt.h -= 28; }
  COURSE.ski.obstacles.forEach((o, i) => {
    if (ski.broken[i] || Math.abs(o.x - player.pos.x) > 900) return;
    const box = obstacleBox(o);
    if (o.kind === 'log' || o.kind === 'pine') {
      const shot = state.projectiles.find(p => p.owner === 'player' && rectsOverlap(boundsOf(p), box));
      if (shot) { if (!shot.isTsunami) shot.health = 0; ski.broken[i] = true; splinters(state, o); return; }
    }
    if (ski.crash === 0 && player.invincibilityTimer <= 0 && rectsOverlap(hurt, box)) {
      ski.crash = CRASH_FRAMES;
      ski.broken[i] = o.kind !== 'rock';
      if (!ctx.cheats.invincible) player.health -= CRASH_DAMAGE;
      player.invincibilityTimer = 30;
      player.vel.y = -6;
      player.isGrounded = false;
      shakeScreen(state, 12, 5);
      if (o.kind !== 'rock') splinters(state, o);
      const callout = CRASH_CALLOUTS[o.kind];
      fx.spawnDamageNumber({ x: player.pos.x - 20, y: player.pos.y - 30 }, callout.lines[Math.floor(Math.random() * callout.lines.length)], true, callout.color);
      fx.speakVulgarity('hurt', `ski_${o.kind}`);
    }
  });

  // The avalanche: steady, but it catches up fast if it's fallen far behind
  const gap = player.pos.x - ski.avX;
  // (right behind him after the cutscene surge: it hangs back until he's got his usual lead)
  if (ski.surge && gap >= AVALANCHE_HEAD_START) ski.surge = false;
  ski.avX += gap > 850 ? AVALANCHE_CATCHUP : ski.surge ? AVALANCHE_AFTER_SURGE : AVALANCHE_SPEED;
  if (state.frame % 3 === 0) shakeScreen(state, 4, Math.max(1, 5 - gap / 200));
  if (ski.avX >= player.pos.x + 16 && state.deathTimer <= 0) {
    // Caught: rolled up in a snowball
    ski.ball = BALL_FRAMES;
    ski.ballX = player.pos.x + player.width / 2;
    ski.ballRot = 0;
    player.hidden = true;
    if (!ctx.cheats.invincible) player.health -= BALL_DAMAGE;
    fx.spawnDamageNumber({ x: player.pos.x - 40, y: player.pos.y - 40 }, 'SNOWBALLED!', true, '#E0F2FE');
    fx.speakVulgarity('hurt', 'avalanche');
    shakeScreen(state, 25, 8);
  }

  // Made it to the bottom
  if (player.pos.x > COURSE.ski.x2 - 20) { ski.phase = 'runout'; ski.t = 0; }
  return { ...controls, left: false, right: false, special: false };
};

const inBall = (ctx: FrameContext, ski: Ski): Controls => {
  const { state } = ctx;
  const { player } = state;
  ski.ball--;
  ski.avX += AVALANCHE_SPEED;
  ski.ballX += AVALANCHE_SPEED + 3.2;
  ski.ballRot += 0.35;
  const g = groundLineAt(state.groundRuns, ski.ballX);
  const ground = g === Infinity ? player.pos.y + player.height : g;
  player.pos.x = ski.ballX - player.width / 2;
  player.pos.y = ground - player.height;
  player.vel = { x: 0, y: 0 };
  if (ski.ball === 0 || player.health <= 0) {
    // Spat out ahead of it
    player.hidden = false;
    if (player.health > 0) {
      player.vel.y = -9;
      player.invincibilityTimer = 90;
      ski.avX = Math.min(ski.avX, player.pos.x - 420);
      for (let i = 0; i < 20; i++) state.particles.push({ pos: { x: ski.ballX, y: ground - 30 }, vel: { x: (Math.random() - 0.5) * 10, y: -Math.random() * 8 }, life: 30 + Math.random() * 20, color: i % 3 ? '#FFFFFF' : '#DBEAFE', size: 5 + Math.random() * 8 });
    }
  }
  return { ...NO_CONTROLS };
};

const splinters = (state: GameState, o: SkiObstacle) => {
  for (let i = 0; i < 12; i++) {
    state.particles.push({
      pos: { x: o.x, y: o.ground - 20 }, vel: { x: (Math.random() - 0.2) * 8, y: -Math.random() * 7 },
      life: 30 + Math.random() * 20, color: o.kind === 'pine' ? (i % 2 ? '#14532D' : '#F8FAFC') : (i % 2 ? '#78350F' : '#A16207'), size: 3 + Math.random() * 5,
    });
  }
};

// ---------------------------------------------------------------------------

const finale = (ctx: FrameContext, ski: Ski): Controls => {
  const { state } = ctx;
  const { player } = state;
  const cabin = COURSE.cabin;
  ski.avX += AVALANCHE_SPEED * (ski.phase === 'runout' ? 1 : 1.2);
  if (ski.phase === 'runout') {
    // Coast in and skid to a stop past the cabin
    const left = cabin.stopX - player.pos.x;
    player.skiSpeed = Math.max(0, Math.min(SKI_BASE, left * 0.06));
    if (left < 30 && player.isGrounded) { player.skiSpeed = 0; ski.phase = 'finale'; ski.t = 0; state.cameraLeadX = 0; }
    if (state.frame % 3 === 0) shakeScreen(state, 4, 4);
    return { ...NO_CONTROLS };
  }
  // Turn round and watch (nothing can touch him now)
  state.cameraOverride = { x: cabin.x - 120, y: 0 };
  player.facing = -1;
  player.inCutscene = true;
  player.invincibilityTimer = Math.max(player.invincibilityTimer, 2);
  const t = ski.t;
  if (ski.cabinHitAt === 0 && ski.avX >= cabin.x) {
    ski.cabinHitAt = state.frame;
    shakeScreen(state, 60, 12);
    playSound('crash');
    // Planks, logs, a hat, and the ranger himself, everywhere
    for (let i = 0; i < 60; i++) {
      state.particles.push({
        pos: { x: cabin.x + 130 + (Math.random() - 0.5) * 200, y: GROUND_Y - 60 - Math.random() * 100 },
        vel: { x: 4 + Math.random() * 12, y: -6 - Math.random() * 12 },
        life: 70 + Math.random() * 60, color: ['#78350F', '#92400E', '#A16207', '#FFFFFF', '#57534E'][i % 5], size: 6 + Math.random() * 10,
      });
    }
  }
  // It stops just short of him
  if (ski.avX >= ski.pileX) {
    ski.avX = ski.pileX;
    if (!state.blocks.some(b => b.tag === 'snowpile')) addPile(state, ski);
  }
  if (ski.avX >= ski.pileX && t > 120 && ski.phase === 'finale') {
    if (player.skiing) {
      player.skiing = false;
      meatheadSays(state, "SHOULD'VE BUILT FURTHER UP.");
    }
    if (t > 240) {
      ski.phase = 'done';
      state.cameraOverride = null;
      player.inCutscene = false;
      state.checkpoint = Math.max(state.checkpoint, CP.DOOR);
      player.facing = 1;
    }
  }
  return { ...NO_CONTROLS };
};

/** How he died, if it was out here. */
export const skiDeathMessage = (state: GameState, ski: Ski): string | undefined => {
  if (ski.phase !== 'skiing') return undefined;
  const fell = state.player.health > 0;
  const lines = fell
    ? ['SKIED INTO THE ABYSS', 'CREVASSE: 1, MEATHEAD: 0']
    : ['BURIED ALIVE', 'FLASH-FROZEN MEAT POPSICLE', 'THE MOUNTAIN WON', 'YOU GOT AVALANCHED'];
  return lines[Math.floor(Math.random() * lines.length)];
};
