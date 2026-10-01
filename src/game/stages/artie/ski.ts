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
import { say, silenceAll, MEATHEAD_VOICE, Voice, holdForSpeech } from '../../platform/speech';
import { playSound, playSquelch } from '../../platform/audio';
import { groundLineAt } from '../../core/terrain';
import { deathByCause } from '../../core/deathCause';
import { GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT, KICK_POSE_FRAMES } from '../../../constants';
import { COURSE, CP, SkiObstacle } from './course';
import { FLING_FRAMES } from './flingDraw';
import { isShat } from '../../player/gut';

type SkiPhase = 'waiting' | 'cutscene' | 'skiing' | 'runout' | 'finale' | 'done';

export interface Ski {
  phase: SkiPhase;
  t: number;
  /** Frames it's been quiet (the scene waits for lines to finish: see SKI_HOLDS). */
  quiet: { n: number };
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
  /** How far back the avalanche's held (the meter): a crash lets it close in, skiing clean it slowly drops back. */
  gap: number;
  /** How far the camera's zoomed out on the way down (1 not at all): enough to keep the avalanche's front in view. */
  zoom: number;
  /** Frames the how-to-ski prompt's been up (it goes after a few seconds out on the run). */
  hintT: number;
  /** Killed in the snowball: it's thrown him off the far side of the mountain (see drawFlingDeath). */
  fling: boolean;
}

// Ski speeds (px/frame): cruising, pushing on, and dragging your heels
const SKI_BASE = 9.2, SKI_FAST = 11, SKI_SLOW = 7, SKI_CRASHED = 2.5;
/** How long the how-to-ski prompt stays up once he's off (frames). */
const SKI_HINT_FOR = 420;
const AVALANCHE_SPEED = 8.7;
/** How much a crash lets the avalanche close in, and how fast it drops back again skiing clean (px a frame). */
const GAP_CRASH = 130, GAP_RECOVER = 0.35;
/** It never falls further behind than this (it catches up): the zoomed-out camera always has it in view. */
const AVALANCHE_MAX_GAP = 660;
/** The cutscene surge: how fast it comes in, and how close behind him it stops. */
const SURGE_SPEED = 18, SURGE_STOP = 90;
/** The lead he gets on it (and what it drops back to after the cutscene's surge has it right on his tail). */
const AVALANCHE_HEAD_START = 650;
const BALL_FRAMES = 90;
const CRASH_FRAMES = 42, CRASH_DAMAGE = 6;
/** What goes up over his head when he skis into each kind of thing. */
const CRASH_CALLOUTS: Record<SkiObstacle['kind'], { lines: string[]; color: string }> = {
  rock: { lines: ['ROCKED!', 'SHIN CHECK!', 'STONE COLD!'], color: '#A8A29E' },
  log: { lines: ['LOGJAMMED!', 'TIMBER!', 'SPLINTERED!'], color: '#D97706' },
  pine: { lines: ['TREE HUGGER!', 'PINED!', 'BARKED!'], color: '#4ADE80' },
  branch: { lines: ['CLOTHESLINED!', 'SHOULDA DUCKED!', 'BRANCHED!'], color: '#FDE047' },
};

/** Zoomed out on the skis: how much of the slope it always keeps in view ahead of him, the margin behind the
 * avalanche's front, and the furthest out it goes. */
const SKI_VIEW_AHEAD = 520, SKI_VIEW_BEHIND = 90, SKI_ZOOM_MIN = 0.58;
const skiZoomFor = (gap: number) => Math.max(SKI_ZOOM_MIN, Math.min(1, CANVAS_WIDTH / (Math.max(0, gap) + SKI_VIEW_BEHIND + SKI_VIEW_AHEAD)));

/** The zoom for the stage's hook: about his feet, and shifted right so the avalanche's front stays on the screen. */
export const skiZoom = (state: GameState, ski: Ski) => {
  if (ski.zoom >= 0.999) return null;
  const p = state.player, s = ski.zoom;
  const px = p.pos.x + p.width / 2, py = p.pos.y + p.height;
  const normal = px - state.camera.x;
  const want = Math.max(normal, (Math.max(0, px - ski.avX) + SKI_VIEW_BEHIND) * s);
  return { scale: s, x: px, y: py, shiftX: Math.min(CANVAS_WIDTH - SKI_VIEW_AHEAD * s, want) - normal, shiftY: 0 };
};

/** How far ahead of him the camera looks on skis (not so far he ends up under the HUD in the corner). */
const SKI_CAMERA_LEAD = 190;

export const createSki = (state: GameState, startedAt: number): Ski => {
  const onSkis = startedAt === CP.SKI;
  const past = startedAt > CP.SKI;
  const ski: Ski = {
    phase: past ? 'done' : onSkis ? 'skiing' : 'waiting', t: 0, quiet: { n: 0 },
    skier: { x: COURSE.skier.x, y: COURSE.skier.y, vx: 0, vy: 0, rot: 0, state: onSkis || past ? 'gone' : 'stand', line: '', lineT: 0 },
    skis: null, avX: COURSE.checkpoints[CP.SKI].x - 650, ball: 0, ballX: 0, ballRot: 0, crash: 0,
    broken: COURSE.ski.obstacles.map(() => false), cabinHitAt: past ? -9999 : 0, pileX: COURSE.cabin.x + 330, surge: false, arrived: false, zoom: 1, fling: false, gap: AVALANCHE_HEAD_START, hintT: 0,
  };
  if (onSkis) { state.player.skiing = true; state.player.skiSpeed = SKI_BASE; state.cameraLeadX = SKI_CAMERA_LEAD; ski.zoom = skiZoomFor(COURSE.checkpoints[CP.SKI].x - ski.avX); }
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
  // (after whoever's talking: nobody talks over anybody here but the kick)
  const shown = say(text, MEATHEAD_VOICE, 'queue', {
    onShow: () => { state.playerLastVulgarity = text; state.playerVulgarityTimer = 150; },
    onHide: () => { if (state.playerLastVulgarity === text) state.playerVulgarityTimer = Math.min(state.playerVulgarityTimer, 30); },
  });
  if (!shown) { state.playerLastVulgarity = text; state.playerVulgarityTimer = 120; }
};

const SKIER_VOICE: Voice = { id: 'skier', pitch: 1.2, rate: 1.1 };
/** The skier's lines: in turn, except the scream, which cuts his carbon fiber short (`cut`). */
const skierSays = (ski: Ski, text: string, cut = false) => {
  say(text, SKIER_VOICE, cut ? 'urgent' : 'queue', { onShow: () => { ski.skier.line = text; ski.skier.lineT = 110 + text.length * 3; }, onHide: () => { if (ski.skier.line === text) ski.skier.lineT = Math.min(ski.skier.lineT, 20); } });
  if (cut) { ski.skier.line = text; ski.skier.lineT = 110; }
};
/** Where the scene waits for the line before to be finished: before Meathead answers, before the skier answers him, before the rumble, before "...OH SHIT." */
const SKI_HOLDS = new Set([75, 120, 229, 280]);

/** The ranger's radio, under the snow at the bottom: every so often, dispatch asks after him (quietly, through the radio). */
const DISPATCH_VOICE: Voice = { id: 'dispatch', pitch: 1.1, rate: 1.0 };
export const RANGER_RADIO = ['RANGER ONE, COME IN.', 'DAVE? YOU GOOD, DAVE?', 'DAVE?'];
export const RANGER_RADIO_EVERY = 420;
/** The radio only starts up a while after the cabin's gone under (and he's under it). */
export const radioLive = (state: GameState, ski: Ski) => ski.cabinHitAt !== 0 && state.frame - ski.cabinHitAt >= 150;
const rangerRadio = (state: GameState, ski: Ski) => {
  if (ski.phase !== 'done' && ski.phase !== 'finale' && ski.phase !== 'runout') return;
  if (!radioLive(state, ski)) return;
  const f = state.frame;
  if (f % RANGER_RADIO_EVERY !== 0) return;
  const x = COURSE.cabin.x + 265;
  if (x < state.camera.x - 40 || x > state.camera.x + CANVAS_WIDTH + 40) return;
  if (say(RANGER_RADIO[Math.floor(f / RANGER_RADIO_EVERY) % RANGER_RADIO.length], DISPATCH_VOICE, 'casual', { onShow: () => {}, onHide: () => {} })) playSquelch();
};

/** Runs the whole thing; returns the controls to use (cutscenes take them over). */
export const updateSki = (ctx: FrameContext, ski: Ski, controls: Controls): Controls => {
  const { state } = ctx;
  const { player } = state;
  // (the cutscene's clock waits at each beat till the line before's been said)
  if (ski.phase !== 'cutscene' || !ski.arrived || holdForSpeech(ski.t, SKI_HOLDS, ski.quiet)) ski.t++;
  // (back from a death somewhere else on the mountain, or off the skis: no how-to-ski prompt left up)
  if (ski.phase !== 'skiing' && (ski.t === 1 || (ski.hintT > 0 && ski.hintT < SKI_HINT_FOR))) { if (ski.hintT > 0) ski.hintT = SKI_HINT_FOR; ctx.events.onTutorialHint?.(null); }
  if (ski.skier.lineT > 0) ski.skier.lineT--;
  rangerRadio(state, ski);
  updateSkierBody(state, ski);
  // Zoomed out on the way down, as far as it takes to keep the avalanche's front on screen behind him (and a good
  // look ahead): easing in and out, back to normal at the bottom
  const want = ski.phase === 'skiing' ? skiZoomFor(player.pos.x + player.width / 2 - ski.avX) : 1;
  ski.zoom += (want - ski.zoom) * (want < ski.zoom ? 0.18 : 0.03);
  if (Math.abs(ski.zoom - 1) < 0.002) ski.zoom = 1;
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
  if (t === 20) skierSays(ski, isShat(state) ? 'BRO. THE POWDER UP HERE IS SICK. ...BRO. DID YOU SHIT YOURSELF?' : 'BRO. THE POWDER UP HERE IS SICK.');
  if (t === 75) meatheadSays(state, isShat(state) ? "NICE SKIS. DON'T WORRY ABOUT IT." : 'NICE SKIS.');
  if (t === 120) skierSays(ski, "THANKS, THEY'RE CARBON FIB-");
  // (and the kick cuts him off, mid-word: the one interruption)
  if (t === 138) {
    // The kick
    player.facing = 1;
    player.kickPose = KICK_POSE_FRAMES;
    ski.skier.state = 'flying'; ski.skier.vx = 11; ski.skier.vy = -9;
    ski.skis = { x: ski.skier.x, y: ski.skier.y - 10, vx: -2.2, vy: -11, rot: 0 };
    skierSays(ski, 'AAAAAAAAAAHHHHH', true);
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
    ski.gap = player.pos.x - ski.avX;
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

  // The prompt, for the first few seconds out on the run: what left and right do (in the air too)
  if (ski.hintT < SKI_HINT_FOR) { if (ski.hintT === 0) ctx.events.onTutorialHint?.('ski'); if (++ski.hintT === SKI_HINT_FOR) ctx.events.onTutorialHint?.(null); }
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
      // (and the avalanche closes in)
      ski.gap -= GAP_CRASH;
      ski.broken[i] = o.kind !== 'rock';
      if (!ctx.cheats.invincible) player.health -= CRASH_DAMAGE;
      state.lastHurt = { source: `ski_${o.kind}`, at: state.frame };
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

  // The avalanche: how far back it's held is what he's earned (the meter). Every crash lets it close in; every stretch
  // skied clean it drops back a little, a bit more pushing on, a bit less dragging his heels (it's an early one: it's
  // forgiving). Right behind him after the cutscene's surge, it hangs back till he's got his usual lead
  if (ski.surge) { ski.gap = Math.min(AVALANCHE_HEAD_START, ski.gap + 4.2); if (ski.gap >= AVALANCHE_HEAD_START) ski.surge = false; }
  else ski.gap = Math.min(AVALANCHE_MAX_GAP, ski.gap + GAP_RECOVER + (player.skiSpeed - SKI_BASE) * 0.08);
  // (it rolls on down to where that puts it: surging when it's closing in, never back up the mountain)
  ski.avX += Math.max(2, (player.pos.x - ski.gap - ski.avX) * 0.15);
  const gap = player.pos.x - ski.avX;
  if (state.frame % 3 === 0) shakeScreen(state, 4, Math.max(1, 5 - gap / 200));
  if (ski.avX >= player.pos.x + 16 && state.deathTimer <= 0) {
    // Caught: rolled up in a snowball, and that's him (thrown off the far side of the mountain). Only the
    // invincibility cheat gets spat back out ahead of it
    ski.ball = BALL_FRAMES;
    ski.ballX = player.pos.x + player.width / 2;
    ski.ballRot = 0;
    player.hidden = true;
    fx.spawnDamageNumber({ x: player.pos.x - 40, y: player.pos.y - 40 }, 'SNOWBALLED!', true, '#E0F2FE');
    if (!ctx.cheats.invincible) { player.health = 0; flingOff(state, ski); }
    else fx.speakVulgarity('hurt', 'avalanche');
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
  if (player.health <= 0) { flingOff(state, ski); return { ...NO_CONTROLS }; }
  if (ski.ball === 0) {
    // Spat out ahead of it
    player.hidden = false;
    if (player.health > 0) {
      player.vel.y = -9;
      player.invincibilityTimer = 90;
      ski.avX = Math.min(ski.avX, player.pos.x - 420);
      ski.gap = Math.max(ski.gap, 420);
      // (it's dropped back a way all at once: the camera's straight out to keep it in view)
      ski.zoom = Math.min(ski.zoom, skiZoomFor(player.pos.x + player.width / 2 - ski.avX));
      for (let i = 0; i < 20; i++) state.particles.push({ pos: { x: ski.ballX, y: ground - 30 }, vel: { x: (Math.random() - 0.5) * 10, y: -Math.random() * 8 }, life: 30 + Math.random() * 20, color: i % 3 ? '#FFFFFF' : '#DBEAFE', size: 5 + Math.random() * 8 });
    }
  }
  return { ...NO_CONTROLS };
};

/** It's killed him: the snowball throws him off the far side of the mountain (the death scene: see flingDraw.ts). */
const flingOff = (state: GameState, ski: Ski) => {
  if (ski.fling) return;
  ski.fling = true;
  state.player.hidden = true;
  state.deathScene = { t: 0, len: FLING_FRAMES, voiced: true };
  // (whatever anyone was saying stops; he's got something to say, rolled up in there)
  silenceAll();
  say("NOT LIKE THIS! I HAVEN'T EVEN HAD MY PROTEIN SHAKE!", MEATHEAD_VOICE, 'urgent', { onShow: () => {}, onHide: () => {}, always: true });
  playSound('whoosh', 1, -6);
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
    // The whole thing going: the walls, the windows, the ranger
    playSound('crash'); playSound('boom', 0.8); playSound('glass'); playSound('crunch'); playSound('screams', 0.8);
    // Planks, logs, a hat, and the ranger himself, everywhere
    for (let i = 0; i < 60; i++) {
      state.particles.push({
        pos: { x: cabin.x + 130 + (Math.random() - 0.5) * 200, y: GROUND_Y - 60 - Math.random() * 100 },
        vel: { x: 4 + Math.random() * 12, y: -6 - Math.random() * 12 },
        life: 70 + Math.random() * 60, color: ['#78350F', '#92400E', '#A16207', '#FFFFFF', '#57534E'][i % 5], size: 6 + Math.random() * 10,
      });
    }
  }
  // ...and it keeps going for a bit after: beams snapping, the stove clanging, stuff coming down, the snow settling
  if (ski.cabinHitAt > 0) {
    const since = state.frame - ski.cabinHitAt;
    if (since === 8 || since === 19 || since === 33) playSound('crack', 0.9, since % 5);
    if (since === 14) playSound('clang', 0.8, -4);
    if (since === 26 || since === 44 || since === 58) playSound('thud', 0.7, -since % 4);
    if (since === 30) playSound('glass', 0.6, 5);
    if (since === 50) playSound('rumble', 0.6);
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
  // (thrown off the far side of the mountain, head first into a frozen pond)
  if (ski.fling) { const l = ['THIN ICE', 'PLANTED HEAD FIRST', 'THE OTHER SIDE OF THE MOUNTAIN', 'SNOWBALLED INTO NEXT WEEK']; return l[Math.floor(Math.random() * l.length)]; }
  // (something in particular got him: a log, a branch, the avalanche: that, over the mountain in general)
  const cause = fell ? undefined : deathByCause(state);
  if (cause) return cause;
  const lines = fell
    ? ['SKIED INTO THE ABYSS', 'CREVASSE: 1, MEATHEAD: 0']
    : ['BURIED ALIVE', 'FLASH-FROZEN MEAT POPSICLE', 'THE MOUNTAIN WON', 'YOU GOT AVALANCHED'];
  return lines[Math.floor(Math.random() * lines.length)];
};
