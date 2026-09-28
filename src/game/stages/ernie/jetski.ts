// Across the bay. A hipster's sat on his jet ski at the end of the pier; he
// isn't for much longer. Then it's a timed run to Alcatraz (the island getting
// bigger and bigger out ahead) with everything that floats or flies after you:
// goons on jet skis behind and ahead, drones, seagulls, and the wreckage of the
// bridge floating in the water.
//
// On the jet ski he's carried along (right: faster; left: easing off, and he
// turns round to shoot back at whatever's behind). Gun only. Jump's a jump, and
// the special's the ski's: a wheelie (forward, on the water or in the air) that
// rams whatever's in front, up + special launches him up out of the water to
// take a drone out of the sky, and down + special in the air drives him down on
// top of a jet ski to crush it.
//
// At the end: a ramp, and up and away...

import type { Enemy, EnemyKind } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { shakeScreen } from '../../core/state';
import { playSound, playGlassShatterSound } from '../../platform/audio';
import { say, MEATHEAD_VOICE, Voice } from '../../platform/speech';
import { makeKindEnemy } from '../../enemies/kinds';
import { hurtPlayer } from '../../bosses/shared';
import { rectsOverlap, boundsOf } from '../../core/utils';
import { GROUND_Y, CANVAS_WIDTH } from '../../../constants';
import { COURSE, CP } from './course';

export type SkiPhase = 'waiting' | 'theft' | 'riding' | 'launch' | 'gone';
export interface FloatingWreck { x: number; look: 'car' | 'buoy' | 'crate'; hit: boolean; rot: number }
export interface JetSki {
  phase: SkiPhase;
  t: number;
  /** The hipster: sat on it, then flying, then in the water. */
  hipster: { x: number; y: number; vx: number; vy: number; rot: number; state: 'sitting' | 'flying' | 'swimming'; line: string; lineT: number };
  /** Meathead's line, over him. */
  line: string;
  lineT: number;
  /** He's walked to the end of the pier. */
  arrived: boolean;
  wrecks: FloatingWreck[];
  wreckTimer: number;
  /** Which of the timeline's spawns have gone out. */
  spawned: number;
  /** Controls hints: which one, and for how long it's been up. */
  hint: string;
  hintT: number;
  hinted: Set<string>;
  /** The ramp at the end (world x), and when he left it. */
  rampX: number;
  launchT: number;
}

/** How long the run lasts. */
export const RIDE_FRAMES = 65 * 60;
/** Speeds on the water: cruising, gunning it, easing off. */
const SKI_BASE = 7.5, SKI_FAST = 9.5, SKI_SLOW = 5.5;
/** How far ahead of him the camera looks (not far: there's plenty coming from behind too). */
const SKI_LEAD = 70;
const WRECK_DAMAGE = 8;
const HIPSTER_VOICE: Voice = { pitch: 1.4, rate: 1.1 };

/** What comes at you, when (frames into the run), and from where. */
type Wave = { at: number; kind: EnemyKind; from: 'behind' | 'ahead' | 'air'; variant?: number; hint?: string };
const TIMELINE: Wave[] = [
  { at: 150, kind: 'seagull', from: 'air' },
  { at: 260, kind: 'jetskier', from: 'behind', variant: 0, hint: 'HOLD LEFT: TURN AND SHOOT BEHIND' },
  { at: 700, kind: 'jetskier', from: 'ahead', variant: 1, hint: 'SPECIAL: WHEELIE! RAM HIM' },
  { at: 1150, kind: 'drone', from: 'air', hint: 'UP + SPECIAL: LEAP OUT OF THE WATER' },
  { at: 1400, kind: 'seagull', from: 'air' },
  { at: 1550, kind: 'jetskier', from: 'behind', variant: 0, hint: 'JUMP, THEN DOWN + SPECIAL: CRUSH HIM' },
  { at: 1800, kind: 'drone', from: 'air' },
  { at: 2000, kind: 'jetskier', from: 'ahead', variant: 1 },
  { at: 2250, kind: 'jetskier', from: 'behind', variant: 0 },
  { at: 2350, kind: 'seagull', from: 'air' },
  { at: 2500, kind: 'drone', from: 'air' },
  { at: 2700, kind: 'jetskier', from: 'ahead', variant: 1 },
  { at: 2800, kind: 'jetskier', from: 'behind', variant: 0 },
  { at: 3000, kind: 'drone', from: 'air' },
  { at: 3100, kind: 'seagull', from: 'air' },
  { at: 3250, kind: 'jetskier', from: 'behind', variant: 0 },
  { at: 3300, kind: 'jetskier', from: 'ahead', variant: 1 },
  { at: 3450, kind: 'drone', from: 'air' },
];

export const createJetSki = (state: GameState, startedAt: number): JetSki => {
  const B = COURSE.bay;
  const onSki = startedAt === CP.SKI;
  const past = startedAt > CP.SKI;
  const js: JetSki = {
    phase: past ? 'gone' : onSki ? 'riding' : 'waiting', t: 0,
    hipster: { x: B.ski, y: B.water, vx: 0, vy: 0, rot: 0, state: onSki || past ? 'swimming' : 'sitting', line: '', lineT: 0 },
    line: '', lineT: 0, arrived: false, wrecks: [], wreckTimer: 500, spawned: 0, hint: '', hintT: 0, hinted: new Set(),
    rampX: 0, launchT: 0,
  };
  if (!past && !onSki) {
    // (no going in the water till you've got something to ride)
    state.blocks.push({ x: B.pier + 30, y: GROUND_Y - 3000, w: 40, h: 3000, type: 'wall', hidden: true, tag: 'pier-end' });
  }
  if (onSki) mount(state);
  return js;
};

/** On the ski and off: gun only, carried along. */
const mount = (state: GameState) => {
  const p = state.player;
  p.skiing = true; p.jetski = true; p.skiSpeed = SKI_BASE;
  p.currentWeapon = 'GUN';
  state.lockWeapon = 'GUN';
  state.cameraLeadX = SKI_LEAD;
};

const meatheadSays = (js: JetSki, text: string) => {
  const shown = say(text, MEATHEAD_VOICE, 'urgent', { onShow: () => { js.line = text; js.lineT = 110; }, onHide: () => { if (js.line === text) js.lineT = Math.min(js.lineT, 30); } });
  if (!shown) { js.line = text; js.lineT = 100; }
};
const hipsterSays = (js: JetSki, text: string) => { js.hipster.line = text; js.hipster.lineT = 90; say(text, HIPSTER_VOICE, 'urgent', { onShow: () => {}, onHide: () => {} }); };

export const updateJetSki = (ctx: FrameContext, js: JetSki, controls: Controls, onLanded: () => void): Controls => {
  const { state } = ctx;
  const p = state.player;
  js.t++;
  if (js.lineT > 0) js.lineT--;
  if (js.hipster.lineT > 0) js.hipster.lineT--;
  if (js.hintT > 0) js.hintT++;
  if (js.hintT > 200) js.hintT = 0;
  updateHipster(state, js);
  switch (js.phase) {
    case 'waiting':
      if (p.isGrounded && p.pos.x > COURSE.bay.x1 + 320) { js.phase = 'theft'; js.t = 0; }
      return controls;
    case 'theft': return theft(ctx, js);
    case 'riding': return riding(ctx, js, controls);
    case 'launch': return launch(ctx, js, onLanded);
    default: return controls;
  }
};

// ---------------------------------------------------------------------------

const theft = (ctx: FrameContext, js: JetSki): Controls => {
  const { state } = ctx;
  const p = state.player;
  const B = COURSE.bay;
  const standAt = B.pier - 40;
  state.cameraOverride = { x: B.pier - 480, y: GROUND_Y - 550 };
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
  p.inCutscene = true;
  let c: Controls = { ...NO_CONTROLS };
  const px = p.pos.x + p.width / 2;
  if (!js.arrived) {
    if (px < standAt - 6) c = { ...c, right: true };
    else if (p.isGrounded) { js.arrived = true; js.t = 0; p.vel.x = 0; }
    if (!js.arrived) { js.t = 0; return c; }
  }
  const t = js.t;
  p.facing = 1;
  if (t === 20) hipsterSays(js, "SICK RIDE, RIGHT? IT'S VINTAGE.");
  if (t === 100) hipsterSays(js, "YOU'VE PROBABLY NEVER HEARD OF IT.");
  if (t === 175) meatheadSays(js, "I'VE HEARD OF IT NOW.");
  if (t === 230) {
    p.kickPose = 16;
    const h = js.hipster;
    h.state = 'flying'; h.vx = 10; h.vy = -13;
    hipsterSays(js, 'MY KOMBUCHAAAAAAA');
    shakeScreen(state, 10, 5);
    ctx.fx.playGunSound('gun');
  }
  if ((p.kickPose || 0) > 0) p.kickPose!--;
  // Down off the end of the pier onto it
  if (t === 262) {
    state.blocks = state.blocks.filter(b => b.tag !== 'pier-end');
    p.vel = { x: 3.2, y: -8 };
    p.isGrounded = false;
  }
  if (t > 262 && t < 300) c = { ...c, right: p.pos.x + p.width / 2 < B.ski - 4 };
  if (t === 300) meatheadSays(js, 'SMELLS LIKE BEARD OIL.');
  if (t > 270 && p.isGrounded && !p.skiing) { mount(state); p.skiSpeed = 0; }
  if (t >= 380) {
    js.phase = 'riding'; js.t = 0;
    state.cameraOverride = null;
    p.inCutscene = false;
    mount(state);
    state.checkpoint = Math.max(state.checkpoint, CP.SKI);
    ctx.fx.spawnDamageNumber({ x: p.pos.x - 60, y: p.pos.y - 60 }, 'TO ALCATRAZ!', true, '#FDE68A');
    playSound('horn');
  }
  return c;
};

const updateHipster = (state: GameState, js: JetSki) => {
  const h = js.hipster;
  if (h.state === 'flying') {
    h.vy += 0.5; h.x += h.vx; h.y += h.vy; h.rot += 0.28;
    if (h.vy > 0 && h.y >= COURSE.bay.water) {
      h.state = 'swimming'; h.y = COURSE.bay.water;
      playSound('tsunami');
      for (let i = 0; i < 18; i++) state.particles.push({ pos: { x: h.x, y: h.y }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 7 }, life: 30, color: i % 2 ? '#E0F2FE' : '#93C5FD', size: 3 + Math.random() * 5 });
    }
  }
};

// ---------------------------------------------------------------------------

const riding = (ctx: FrameContext, js: JetSki, controls: Controls): Controls => {
  const { state, fx } = ctx;
  const p = state.player;
  if (!p.skiing) mount(state);
  p.currentWeapon = 'GUN';
  // The pace: gun it, ease off (and turn round to shoot back), or cruise
  p.skiSpeed = controls.right ? SKI_FAST : controls.left ? SKI_SLOW : SKI_BASE;
  // Everything in the air goes along with him (they're chasing him; the AI works out where to be from where he is)
  for (const e of state.enemies) {
    if (e.health <= 0 || e.isBlownAway) continue;
    if (e.kind === 'drone' || e.kind === 'seagull') { e.pos.x += p.vel.x; if (e.homeX !== undefined) e.homeX += p.vel.x; }
  }
  // ...and anything left far behind is gone (it gave up)
  state.enemies = state.enemies.filter(e => e.type === 'boss' || (e.pos.x > state.camera.x - 500 && e.pos.x < state.camera.x + 1700));
  spawnWaves(state, js);
  updateWrecks(ctx, js);
  // Splashing along
  if (p.isGrounded && state.frame % 2 === 0) state.particles.push({ pos: { x: p.pos.x + 2, y: GROUND_Y - 4 }, vel: { x: -2 - Math.random() * 3, y: -Math.random() * 3 }, life: 18, color: Math.random() < 0.5 ? '#E0F2FE' : '#BAE6FD', size: 3 + Math.random() * 4 });
  // Time's up: the ramp comes up out ahead
  if (js.t === RIDE_FRAMES) {
    js.rampX = state.camera.x + CANVAS_WIDTH + 200;
    fx.spawnDamageNumber({ x: p.pos.x - 40, y: p.pos.y - 70 }, 'RAMP AHEAD!', true, '#FDE68A');
  }
  if (js.rampX && p.pos.x + p.width >= js.rampX - 40) {
    js.phase = 'launch'; js.t = 0;
    p.vel = { x: 13, y: -26 };
    p.isGrounded = false;
    p.isCharging = false; p.isUppercutting = false; p.isDivekicking = false;
    meatheadSays(js, 'YEEEEEEHAAAAAW!');
    playSound('horn');
  }
  return controls;
};

const hint = (js: JetSki, text: string) => { if (js.hinted.has(text)) return; js.hinted.add(text); js.hint = text; js.hintT = 1; };

const spawnWaves = (state: GameState, js: JetSki) => {
  const p = state.player;
  while (js.spawned < TIMELINE.length && TIMELINE[js.spawned].at <= js.t) {
    const w = TIMELINE[js.spawned++];
    let e: Enemy;
    if (w.from === 'air') {
      e = makeKindEnemy(w.kind, state.camera.x + CANVAS_WIDTH + 60, GROUND_Y - 250);
      if (w.kind === 'drone') { e.aiState = 'hunt'; e.aiTimer = 40; e.aiX = 1; }
    } else {
      const x = w.from === 'behind' ? state.camera.x - 70 : state.camera.x + CANVAS_WIDTH + 70;
      e = makeKindEnemy(w.kind, x, GROUND_Y);
      e.variant = w.variant ?? 0;
      e.aiState = 'hold';
      e.vel.x = p.vel.x + (w.from === 'behind' ? 3 : -2);
      e.shootTimer = 40;
    }
    state.enemies.push(e);
    if (w.hint) hint(js, w.hint);
  }
};

const WRECK_LOOKS: FloatingWreck['look'][] = ['car', 'buoy', 'crate', 'car'];
/** A floating wreck's box (jump it, or wheelie through it). */
export const wreckBox = (w: FloatingWreck) => (w.look === 'buoy' ? { x: w.x - 14, y: GROUND_Y - 44, w: 28, h: 44 } : w.look === 'crate' ? { x: w.x - 22, y: GROUND_Y - 34, w: 44, h: 34 } : { x: w.x - 44, y: GROUND_Y - 30, w: 88, h: 30 });

const updateWrecks = (ctx: FrameContext, js: JetSki) => {
  const { state, fx } = ctx;
  const p = state.player;
  if (js.t > 480 && js.t < RIDE_FRAMES - 200 && --js.wreckTimer <= 0) {
    js.wreckTimer = 240 + Math.floor(Math.random() * 160);
    js.wrecks.push({ x: state.camera.x + CANVAS_WIDTH + 120, look: WRECK_LOOKS[Math.floor(Math.random() * WRECK_LOOKS.length)], hit: false, rot: 0 });
  }
  for (const w of js.wrecks) {
    w.rot += 0.03;
    if (w.hit) continue;
    const box = wreckBox(w);
    // A wheelie goes straight through it
    if (p.isCharging && rectsOverlap({ x: p.pos.x, y: p.pos.y, w: p.width + 30, h: p.height }, box)) {
      w.hit = true;
      splinter(state, w);
      fx.spawnDamageNumber({ x: w.x - 30, y: GROUND_Y - 80 }, 'SMASHED!', true, '#FDE047');
      continue;
    }
    if (p.invincibilityTimer <= 0 && rectsOverlap(boundsOf(p), box)) {
      w.hit = true;
      splinter(state, w);
      hurtPlayer(ctx, WRECK_DAMAGE, 'floating_wreck', { x: -2, y: -8 });
      fx.spawnDamageNumber({ x: p.pos.x - 30, y: p.pos.y - 40 }, w.look === 'car' ? 'FENDER BENDER!' : 'THUNK!', true, '#F97316');
      continue;
    }
    // A jet ski knocked into one (dazed, not steering) wraps itself round it
    for (const e of state.enemies) {
      if (e.kind !== 'jetskier' || e.health <= 0 || e.isBlownAway || !((e.pauseTimer || 0) > 0) || !rectsOverlap(boundsOf(e), box)) continue;
      w.hit = true;
      splinter(state, w);
      e.health = 0; e.isBlownAway = true; e.vel = { x: 6, y: -14 };
      fx.spawnDeathShower(e.pos, 1, 1.5); fx.spawnKillCallout(e, 'crash'); fx.spawnPickup(e.pos);
      break;
    }
  }
  js.wrecks = js.wrecks.filter(w => !w.hit && w.x > state.camera.x - 300);
};

const splinter = (state: GameState, w: FloatingWreck) => {
  const colors = w.look === 'car' ? ['#DC2626', '#F8FAFC', '#1C1917', '#93C5FD'] : w.look === 'buoy' ? ['#F97316', '#F8FAFC'] : ['#A16207', '#78350F'];
  for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: w.x, y: GROUND_Y - 20 }, vel: { x: (Math.random() - 0.2) * 9, y: -2 - Math.random() * 7 }, life: 30 + Math.random() * 20, color: colors[i % colors.length], size: 3 + Math.random() * 5 });
  playGlassShatterSound();
};

// ---------------------------------------------------------------------------

/** Up the ramp and away, off the top of the screen: then it's Alcatraz. */
const launch = (ctx: FrameContext, js: JetSki, onLanded: () => void): Controls => {
  const { state } = ctx;
  const p = state.player;
  p.inCutscene = true;
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
  p.skiSpeed = 13;
  // (the camera stays on the water: he goes up out of the top of it)
  state.cameraOverride = { x: state.camera.x + 6, y: state.camera.y };
  if (js.t === 70) {
    js.phase = 'gone';
    onLanded();
  }
  return { ...NO_CONTROLS };
};

/** How far through the run (0..1), for the island growing and the HUD. */
export const rideProgress = (js: JetSki) => (js.phase === 'riding' ? Math.min(1, js.t / RIDE_FRAMES) : js.phase === 'launch' || js.phase === 'gone' ? 1 : 0);

/** How he died out on the water. */
export const skiDeathMessage = (js: JetSki): string | undefined => {
  if (js.phase !== 'riding') return undefined;
  const l = ['SLEEPS WITH THE FISHES', 'SHARK BAIT', 'LOST AT SEA', 'THE BAY WINS'];
  return l[Math.floor(Math.random() * l.length)];
};

export const isRiding = (js: JetSki) => js.phase === 'riding' || js.phase === 'launch';
