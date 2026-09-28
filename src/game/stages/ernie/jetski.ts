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
import { say, canSpeak, MEATHEAD_VOICE, Voice } from '../../platform/speech';
import { makeKindEnemy } from '../../enemies/kinds';
import { JETSKI_CRUISE } from '../../enemies/kinds/ernie';
import { hurtPlayer } from '../../bosses/shared';
import { rectsOverlap, boundsOf } from '../../core/utils';
import { GROUND_Y, CANVAS_WIDTH, KICK_POSE_FRAMES } from '../../../constants';
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
  /** The cutscene's beats: each line waits for the one before it to be finished. Which beat, when it started, and the line being said. */
  step: number;
  stepAt: number;
  talk: { at: number; len: number; spoken: boolean; done: boolean } | null;
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
const SKI_BASE = JETSKI_CRUISE, SKI_FAST = 9.5, SKI_SLOW = 5.5;
/** How far ahead of him the camera looks (not far: there's plenty coming from behind too). */
const SKI_LEAD = 70;
const WRECK_DAMAGE = 8;
const HIPSTER_VOICE: Voice = { pitch: 1.4, rate: 1.1 };

/** What comes at you, when (frames into the run), and from where. */
type Wave = { at: number; kind: EnemyKind; from: 'behind' | 'ahead' | 'air'; variant?: number };
const TIMELINE: Wave[] = [
  { at: 150, kind: 'seagull', from: 'air' },
  { at: 260, kind: 'jetskier', from: 'behind', variant: 0 },
  { at: 700, kind: 'jetskier', from: 'ahead', variant: 1 },
  { at: 1150, kind: 'drone', from: 'air' },
  { at: 1600, kind: 'jetskier', from: 'behind', variant: 0 },
  { at: 1950, kind: 'seagull', from: 'air' },
  { at: 2150, kind: 'jetskier', from: 'ahead', variant: 1 },
  { at: 2450, kind: 'drone', from: 'air' },
  { at: 2750, kind: 'jetskier', from: 'behind', variant: 0 },
  { at: 3050, kind: 'drone', from: 'air' },
  { at: 3150, kind: 'seagull', from: 'air' },
  { at: 3350, kind: 'jetskier', from: 'ahead', variant: 1 },
];

export const createJetSki = (state: GameState, startedAt: number): JetSki => {
  const B = COURSE.bay;
  const onSki = startedAt === CP.SKI;
  const past = startedAt > CP.SKI;
  const js: JetSki = {
    phase: past ? 'gone' : onSki ? 'riding' : 'waiting', t: 0,
    hipster: { x: B.ski, y: B.water, vx: 0, vy: 0, rot: 0, state: onSki || past ? 'swimming' : 'sitting', line: '', lineT: 0 },
    line: '', lineT: 0, arrived: false, step: 0, stepAt: 0, talk: null, wrecks: [], wreckTimer: 500, spawned: 0, hint: '', hintT: 0, hinted: new Set(),
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

/** A line in the cutscene, said by one of them; its bubble stays up till it's been said (and a beat after). */
const talk = (js: JetSki, who: 'meathead' | 'hipster', text: string) => {
  const t = { at: js.t, len: text.length, spoken: false, done: false };
  js.talk = t;
  const bubble = who === 'meathead' ? js : js.hipster;
  bubble.line = text; bubble.lineT = 9999;
  t.spoken = say(text, who === 'meathead' ? MEATHEAD_VOICE : HIPSTER_VOICE, 'urgent', { onShow: () => {}, onHide: () => {}, onDone: () => { t.done = true; } }) && canSpeak();
};
/** The line being said is over: spoken to the end (or, with no voice, up long enough to read; and never forever). */
const talkOver = (js: JetSki) => {
  const t = js.talk;
  if (!t) return true;
  const age = js.t - t.at;
  const over = age > 20 && (t.done || (!t.spoken && age > 45 + t.len * 3) || age > 60 + t.len * 5);
  if (over) { js.talk = null; if (js.lineT > 20) js.lineT = 20; if (js.hipster.lineT > 20) js.hipster.lineT = 20; }
  return over;
};
const meatheadSays = (js: JetSki, text: string) => {
  const shown = say(text, MEATHEAD_VOICE, 'urgent', { onShow: () => { js.line = text; js.lineT = 110; }, onHide: () => { if (js.line === text) js.lineT = Math.min(js.lineT, 30); } });
  if (!shown) { js.line = text; js.lineT = 100; }
};

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
  p.facing = 1;
  // One beat after another: each line waits till the one before it's been said
  const since = js.t - js.stepAt;
  const next = () => { js.step++; js.stepAt = js.t; };
  switch (js.step) {
    case 0: if (since >= 20) { talk(js, 'hipster', "SICK RIDE, RIGHT? IT'S VINTAGE."); next(); } break;
    case 1: if (talkOver(js) && since > 30) { talk(js, 'hipster', "YOU'VE PROBABLY NEVER HEARD OF IT."); next(); } break;
    case 2: if (talkOver(js) && since > 30) { talk(js, 'meathead', "I'VE HEARD OF IT NOW."); next(); } break;
    case 3:
      if (talkOver(js) && since > 25) {
        p.kickPose = KICK_POSE_FRAMES;
        const h = js.hipster;
        h.state = 'flying'; h.vx = 10; h.vy = -13;
        talk(js, 'hipster', 'MY KOMBUCHAAAAAAA');
        shakeScreen(state, 10, 5);
        ctx.fx.playGunSound('gun');
        next();
      }
      break;
    case 4:
      // Down off the end of the pier onto it
      if (since === 32) {
        state.blocks = state.blocks.filter(b => b.tag !== 'pier-end');
        p.vel = { x: 3.2, y: -8 };
        p.isGrounded = false;
      }
      if (since > 32 && since < 70) c = { ...c, right: p.pos.x + p.width / 2 < B.ski - 4 };
      if (since > 40 && p.isGrounded && !p.skiing) { mount(state); p.skiSpeed = 0; }
      if (since > 70 && p.skiing && talkOver(js)) { talk(js, 'meathead', 'SMELLS LIKE BEARD OIL.'); next(); }
      break;
  }
  if ((p.kickPose || 0) > 0) p.kickPose!--;
  if (js.step === 5 && talkOver(js) && js.t - js.stepAt > 30) {
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
  teach(state, js);
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
    meatheadSays(js, 'COWABUNGAAAAA!');
    playSound('horn');
  }
  return controls;
};

const hint = (js: JetSki, text: string) => { if (js.hinted.has(text)) return; js.hinted.add(text); js.hint = text; js.hintT = 1; };

/**
 * Each control's hint comes up the first time it's the thing to do, one at a time: turning to shoot back when
 * a jet ski's sat behind you in view, the wheelie when one ahead brake-checks you, the leap when a drone's hanging
 * right over you, the dive when a chaser pulls alongside to ram.
 */
const teach = (state: GameState, js: JetSki) => {
  if (js.hintT > 0) return;
  const p = state.player;
  const px = p.pos.x + p.width / 2;
  const cam = state.camera;
  const live = state.enemies.filter(e => e.health > 0 && !e.isBlownAway && e.pos.x + e.width > cam.x + 20 && e.pos.x < cam.x + CANVAS_WIDTH - 20);
  const mx = (e: Enemy) => e.pos.x + e.width / 2;
  if (live.some(e => e.kind === 'jetskier' && e.variant !== 1 && e.aiState === 'hold' && mx(e) < px - 120 && mx(e) > cam.x + 60)) hint(js, 'HOLD LEFT: TURN AND SHOOT BEHIND');
  else if (live.some(e => e.kind === 'jetskier' && e.variant === 1 && (e.aiState === 'brake' || (mx(e) > px && mx(e) < cam.x + CANVAS_WIDTH - 60)))) hint(js, 'SPECIAL: WHEELIE! RAM HIM');
  else if (live.some(e => e.kind === 'drone' && Math.abs(mx(e) - px) < 100 && e.pos.y < p.pos.y)) hint(js, 'UP + SPECIAL: LEAP OUT OF THE WATER');
  else if (live.some(e => e.kind === 'jetskier' && e.aiState === 'ram' && Math.abs(mx(e) - px) < 110)) hint(js, 'JUMP, THEN DOWN + SPECIAL: CRUSH HIM');
};

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
      hurtPlayer(ctx, WRECK_DAMAGE, `floating_${w.look}`, { x: -2, y: -8 });
      fx.spawnDamageNumber({ x: p.pos.x - 30, y: p.pos.y - 40 }, { car: 'FENDER BENDER!', crate: 'SPLINTERED!', buoy: 'BUOY OH BUOY!' }[w.look], true, '#F97316');
      continue;
    }
    // A jet ski knocked into one (dazed, not steering) wraps itself round it
    for (const e of state.enemies) {
      if (e.kind !== 'jetskier' || e.health <= 0 || e.isBlownAway || !((e.pauseTimer || 0) > 0) || !rectsOverlap(boundsOf(e), box)) continue;
      w.hit = true;
      splinter(state, w);
      e.health = 0; e.isBlownAway = true; e.vel = { x: 6, y: -14 };
      fx.spawnDeathShower(e.pos, 1, 1.5); fx.spawnKillCallout(e, 'shipwreck'); fx.spawnPickup(e.pos);
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
