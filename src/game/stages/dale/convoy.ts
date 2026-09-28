// Act II: Dale's convoy. Four semis doing eighty down the interstate, and Dale's
// had every one of them rigged to blow ("IF HE GETS ON ONE, BLOW IT!").
//
// On each of the first three a timer's running from the moment Meathead lands on
// it: goons come up onto the roof off SUVs pulling alongside, vultures come down
// out of the sky, and junk comes flying down the road at him (tires and
// tumbleweeds to jump, signs and boxes at head height to duck). Clear the roof
// before the time runs out and the next truck pulls up close enough to jump to
// (GO!), and this one goes up behind him. Don't, and it goes up with him on it.
//
// Off the side of a truck is the road at eighty miles an hour: land in front of a
// truck and it runs you over; off the back and you bounce down the interstate.
// And the roofs are sheet metal: barf on one once and it sizzles, twice and it's
// eating through, a third time and you're in the trailer with the goons riding
// in the back, who have machine guns.
//
// The fourth truck's the last: no goons on it, just the driver, the second
// hitman, Riggs, arguing with Dale over the radio about whether to blow himself
// up. Get out on the hood in front of the windshield with the handgun and end the
// argument. (Leave it a minute and Riggs finally does as he's told.)

import type { Block, Enemy, EnemyKind } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { GROUND_Y, CANVAS_WIDTH } from '../../../constants';
import { shakeScreen } from '../../core/state';
import { rectsOverlap, boundsOf } from '../../core/utils';
import { hurtPlayer } from '../../bosses/shared';
import { killPlayer } from '../../player/player';
import { playSound } from '../../platform/audio';
import { makeKindEnemy } from '../../enemies/kinds';
import { COURSE, CP, TRAILER_W, TRUCK_W, TRAILER_TOP, CAB_TOP, HOOD_TOP, SLEEPER_W } from './course';
import { Talk, queueLines, replaceLines, hush, quiet } from './script';

const Y = GROUND_Y;

/** How fast the road goes by (for the scenery), a frame. */
export const ROAD_SPEED = 24;
/** Where the camera sits: the road near the bottom of the screen. */
export const HIGHWAY_CAM_Y = Y - 520;

interface Arrival { kind: EnemyKind; x: number }
interface Plan { seconds: number; waves: Arrival[][]; birds: number; debris: [number, number] }
/** The first three trucks (the last has nobody on the roof). x is along the trailer's roof from its back end. */
const PLANS: Plan[] = [
  { seconds: 45, waves: [[{ kind: 'sicario', x: 420 }], [{ kind: 'enforcer', x: 440 }], [{ kind: 'sicario', x: 140 }, { kind: 'cardoor', x: 400 }]], birds: 1, debris: [330, 470] },
  { seconds: 50, waves: [[{ kind: 'sicario', x: 160 }, { kind: 'sicario', x: 440 }], [{ kind: 'cardoor', x: 420 }, { kind: 'enforcer', x: 200 }], [{ kind: 'sicario', x: 300 }, { kind: 'enforcer', x: 460 }]], birds: 2, debris: [270, 400] },
  { seconds: 55, waves: [[{ kind: 'enforcer', x: 430 }, { kind: 'sicario', x: 150 }], [{ kind: 'cardoor', x: 320 }, { kind: 'sicario', x: 460 }, { kind: 'sicario', x: 110 }], [{ kind: 'enforcer', x: 380 }, { kind: 'cardoor', x: 170 }]], birds: 3, debris: [220, 340] },
];
/** Once the roof's clear: how long before the truck goes up anyway (get off it); how far back the next one waits till then. */
const AFTER_CLEAR = 10 * 60, FAR_BACK = 420;
/** Before the first wave; between waves (once a wave's down, or after a while regardless). */
const FIRST_WAVE = 100, WAVE_GAP = 50, WAVE_MAX = 13 * 60;

export type TruckPhase = 'far' | 'coming' | 'waiting' | 'active' | 'cleared' | 'doomed' | 'gone' | 'last';
export interface TruckState {
  phase: TruckPhase;
  /** How far ahead of its spot it is (the next one hangs back till the roof's clear, then pulls up). */
  offset: number;
  /** Frames left on its timer; frames in its phase. */
  timeLeft: number;
  t: number;
  wave: number;
  nextWaveAt: number;
  goons: string[];
  birds: number;
  debrisAt: number;
  barfs: number;
  blocks: Block[];
  /** Blown up: frames since, and how far behind it's fallen. */
  boomT: number;
  back: number;
}
export interface Debris { x: number; y: number; w: number; h: number; vx: number; vy: number; rot: number; look: 'tire' | 'tumbleweed' | 'sign' | 'box'; low: boolean; hit: boolean }
export interface Suv { x: number; toX: number; t: number; kind: EnemyKind; dropped: boolean; leaving: boolean }
/** Off a truck onto the road, or blown up, or melted through the roof, or Riggs pressed the button: how Meathead's going. */
export interface Fall { t: number; kind: 'runover' | 'flop' | 'boom' | 'melt' | 'button'; x: number; y: number; truck: number }
export interface Cab {
  phase: 'none' | 'bicker' | 'standoff' | 'shot' | 'crash' | 'done';
  t: number;
  /** He's been told about the handgun (once). */
  wrongSaid: boolean;
  /** How far the truck's swerving (for the crash). */
  swerve: number;
}
export interface Convoy {
  active: boolean;
  trucks: TruckState[];
  current: number;
  scroll: number;
  debris: Debris[];
  suvs: Suv[];
  fall: Fall | null;
  cab: Cab;
  /** A big word across the screen (TRUCK 1 OF 4, GO!, CLEAR!), and how long it's been up. */
  banner: { text: string; t: number; color: string } | null;
  /** The radio's crackling (Dale's on it). */
  radioT: number;
  /** Meathead's weapon-rising-edge tracker (for counting barfs). */
  lastBarf: number;
  /** Faded out at the end: on to the town. */
  finished: boolean;
}

export const truckX = (cv: Convoy, i: number) => COURSE.highway.trucks[i].x + cv.trucks[i].offset;

const makeBlocks = (x: number): Block[] => [
  { x, y: TRAILER_TOP, w: TRAILER_W, h: Y - 40 - TRAILER_TOP, type: 'ground', hidden: true, tag: 'truck' },
  { x: x + TRAILER_W, y: Y - 70, w: 10, h: 30, type: 'ground', hidden: true, tag: 'truck' },
  { x: x + TRAILER_W + 10, y: CAB_TOP, w: SLEEPER_W, h: Y - 40 - CAB_TOP, type: 'ground', hidden: true, tag: 'truck' },
  { x: x + TRAILER_W + 10 + SLEEPER_W, y: HOOD_TOP, w: TRUCK_W - TRAILER_W - 10 - SLEEPER_W, h: Y - 40 - HOOD_TOP, type: 'ground', hidden: true, tag: 'truck' },
];

export const createConvoy = (state: GameState, startedAt: number): Convoy => {
  const onTruck = startedAt >= CP.HIGHWAY && startedAt <= CP.TRUCK4 ? startedAt - CP.HIGHWAY : -1;
  const trucks: TruckState[] = COURSE.highway.trucks.map((tr, i) => {
    const phase: TruckPhase = onTruck < 0 ? (i === 0 ? 'waiting' : 'far') : i < onTruck ? 'gone' : i === onTruck ? (i === 3 ? 'last' : 'waiting') : 'far';
    const offset = phase === 'far' ? FAR_BACK : 0;
    const blocks = phase === 'gone' ? [] : makeBlocks(tr.x + offset);
    state.blocks.push(...blocks);
    return { phase, offset, timeLeft: (PLANS[i]?.seconds ?? 0) * 60, t: 0, wave: 0, nextWaveAt: FIRST_WAVE, goons: [], birds: 0, debrisAt: 200, barfs: 0, blocks, boomT: 999, back: 0 };
  });
  return {
    active: onTruck >= 0, trucks, current: Math.max(0, onTruck), scroll: 0, debris: [], suvs: [], fall: null,
    cab: { phase: 'none', t: 0, wrongSaid: false, swerve: 0 }, banner: null, radioT: 0, lastBarf: 0, finished: false,
  };
};

/** Out of the office window: onto the first truck (the fade's over; he drops onto its roof). */
export const boardConvoy = (state: GameState, cv: Convoy) => {
  cv.active = true;
  const p = state.player;
  p.pos = { x: truckX(cv, 0) + 90, y: TRAILER_TOP - 260 };
  p.vel = { x: 3, y: 2 };
  p.hidden = false;
  p.inCutscene = false;
  state.cameraOverride = { x: truckX(cv, 0) - 60, y: HIGHWAY_CAM_Y };
  state.camera.x = state.cameraOverride.x; state.camera.y = HIGHWAY_CAM_Y;
  state.checkpoint = Math.max(state.checkpoint, CP.HIGHWAY);
};

export const updateConvoy = (ctx: FrameContext, cv: Convoy, talk: Talk, controls: Controls): Controls => {
  const { state } = ctx;
  if (!cv.active || cv.finished) return controls;
  const p = state.player;
  cv.scroll += ROAD_SPEED;
  if (cv.banner) cv.banner.t++;
  if (cv.radioT > 0) cv.radioT--;
  // Keep the trucks' collision where the trucks are
  cv.trucks.forEach((tr, i) => {
    if (tr.phase === 'coming') { tr.offset = Math.max(0, tr.offset - 5); if (tr.offset === 0) tr.phase = 'waiting'; }
    const x = truckX(cv, i);
    const base = makeBlocks(x);
    tr.blocks.forEach((b, k) => { b.x = base[k].x; });
  });
  // The fall (or the blast, or the melt, or the button): it plays out, then that's it
  if (cv.fall) return updateFall(ctx, cv);
  const cur = cv.trucks[cv.current];
  const cx = truckX(cv, cv.current);
  // The camera: along the truck he's on (and on to the next once it's pulled up)
  const reachRight = cur.phase === 'cleared' || cur.phase === 'doomed' ? truckX(cv, Math.min(3, cv.current + 1)) + TRUCK_W : cx + TRUCK_W + 380;
  const want = p.pos.x + p.width / 2 - CANVAS_WIDTH / 2;
  const camX = Math.max(cx - 60, Math.min(reachRight - CANVAS_WIDTH, want));
  state.cameraOverride = { x: camX, y: HIGHWAY_CAM_Y };
  // Landed on a truck
  const standingOn = p.isGrounded ? truckUnder(cv, p.pos.x + p.width / 2, p.pos.y + p.height) : -1;
  if (standingOn >= 0 && standingOn !== cv.current) arrive(ctx, cv, standingOn, talk);
  if (standingOn >= 0) {
    const tr = cv.trucks[standingOn];
    if (tr.phase === 'waiting') startTruck(ctx, cv, standingOn, talk);
  }
  // Knocked about up here, he doesn't get flung off the side by it (walking off it's another matter): the knock
  // only carries him so far, and never out over the end he's near
  if (p.pushbackTimer > 0) {
    p.vel.x = Math.max(-3, Math.min(3, p.vel.x));
    const on = truckUnder(cv, p.pos.x + p.width / 2, p.pos.y + p.height + 40);
    if (on >= 0) {
      const ox = truckX(cv, on);
      if ((p.vel.x < 0 && p.pos.x < ox + 50) || (p.vel.x > 0 && p.pos.x + p.width > ox + TRUCK_W - 50)) p.vel.x = 0;
    }
  }
  // Off the side
  if (p.pos.y + p.height > Y - 30 && state.deathTimer <= 0) { startFall(ctx, cv, talk); return { ...NO_CONTROLS }; }
  // Goons off the side: roadkill (only out here: not the ones waiting in town)
  for (const e of state.enemies) {
    if (e.health <= 0 || e.isBlownAway || e.type === 'boss' || e.enemyType === 'flyer') continue;
    if (e.pos.x < COURSE.highway.x1 || e.pos.x > COURSE.highway.x2) continue;
    if (e.pos.y + e.height > Y - 30) roadkill(ctx, cv, e);
  }
  updateTrucks(ctx, cv, talk);
  updateSuvs(ctx, cv);
  updateDebris(ctx, cv);
  watchBarf(ctx, cv, talk);
  if (cv.current === 3) return updateCab(ctx, cv, talk, controls);
  return controls;
};

/** Which truck's roof (or cab, or hood) is under (x, feet), or -1. */
const truckUnder = (cv: Convoy, x: number, feet: number) => {
  for (let i = 0; i < cv.trucks.length; i++) {
    if (cv.trucks[i].phase === 'gone' || cv.trucks[i].phase === 'far') continue;
    const tx = truckX(cv, i);
    if (x >= tx - 4 && x <= tx + TRUCK_W + 4 && feet <= Y - 60) return i;
  }
  return -1;
};

const arrive = (ctx: FrameContext, cv: Convoy, i: number, talk: Talk) => {
  const { state } = ctx;
  const prev = cv.current;
  cv.current = i;
  state.checkpoint = Math.max(state.checkpoint, CP.HIGHWAY + i);
  // The one he's left goes up behind him
  if (prev < i && (cv.trucks[prev].phase === 'cleared')) { cv.trucks[prev].phase = 'doomed'; cv.trucks[prev].t = 0; }
  if (i === 3) { cv.trucks[3].phase = 'last'; cv.banner = { text: 'LAST TRUCK', t: 0, color: '#FACC15' }; }
  void talk;
};

const startTruck = (ctx: FrameContext, cv: Convoy, i: number, talk: Talk) => {
  const { state } = ctx;
  const tr = cv.trucks[i];
  tr.phase = 'active'; tr.t = 0;
  tr.timeLeft = PLANS[i].seconds * 60;
  cv.banner = { text: `TRUCK ${i + 1} OF 4`, t: 0, color: '#F97316' };
  if (i === 0) {
    cv.radioT = 200;
    queueLines(state, talk, [
      { who: 'dale', text: "HE'S ON THE TRUCK! HE'S ON THE TRUCK! BLOW IT IF HE GETS CLOSE!" },
      { who: 'meathead', text: "THEY'RE RIGGED?! GREAT. CLEAR THE ROOF, THEN JUMP. EASY." },
    ], 20);
  }
};

const updateTrucks = (ctx: FrameContext, cv: Convoy, talk: Talk) => {
  const { state } = ctx;
  cv.trucks.forEach((tr, i) => {
    tr.t++;
    if (tr.phase === 'active') {
      const plan = PLANS[i];
      tr.timeLeft--;
      // The next wave: once this lot's down (a moment after), or after a while regardless
      const alive = tr.goons.filter(id => state.enemies.some(e => e.id === id && e.health > 0 && !e.isBlownAway));
      tr.goons = alive;
      const pending = cv.suvs.some(s => !s.dropped);
      if (tr.wave < plan.waves.length && !pending && (tr.t >= tr.nextWaveAt || (tr.wave > 0 && !alive.length && tr.t >= tr.nextWaveAt - WAVE_MAX + WAVE_GAP))) {
        for (const a of plan.waves[tr.wave]) cv.suvs.push({ x: state.camera.x - 260 - Math.random() * 120, toX: truckX(cv, i) + a.x, t: 0, kind: a.kind, dropped: false, leaving: false });
        tr.wave++;
        tr.nextWaveAt = tr.t + WAVE_MAX;
      }
      // Vultures out of the sky
      if (tr.birds < plan.birds && tr.t > 300 + tr.birds * 700) {
        tr.birds++;
        const v = makeKindEnemy('vulture', state.camera.x + CANVAS_WIDTH + 60, TRAILER_TOP - 230);
        v.homeX = truckX(cv, i) + 150 + Math.random() * 250; v.homeY = TRAILER_TOP - 250;
        state.enemies.push(v);
      }
      // Junk down the road
      if (tr.t >= tr.debrisAt) { tr.debrisAt = tr.t + plan.debris[0] + Math.floor(Math.random() * (plan.debris[1] - plan.debris[0])); spawnDebris(state, cv); }
      // All down: clear. The next truck pulls up
      if (tr.wave >= plan.waves.length && !alive.length && !pending) {
        tr.phase = 'cleared'; tr.t = 0; tr.timeLeft = AFTER_CLEAR;
        const next = cv.trucks[i + 1];
        if (next && next.phase === 'far') next.phase = 'coming';
        cv.banner = { text: 'CLEAR! GO!', t: 0, color: '#22C55E' };
        playSound('horn');
        if (i === 0) queueLines(state, talk, [{ who: 'meathead', text: "ROOF'S CLEAR! NEXT TRUCK! GO GO GO!" }]);
      }
      if (tr.timeLeft <= 0) blowUp(ctx, cv, i, talk);
    } else if (tr.phase === 'cleared') {
      tr.timeLeft--;
      if (tr.timeLeft <= 0) blowUp(ctx, cv, i, talk);
    } else if (tr.phase === 'doomed') {
      if (tr.t > 50) blowUp(ctx, cv, i, talk);
    } else if (tr.phase === 'gone') {
      // A burning wreck, falling away behind
      tr.boomT++;
      tr.back += Math.min(16, tr.boomT * 0.2);
    }
  });
};

const blowUp = (ctx: FrameContext, cv: Convoy, i: number, talk: Talk) => {
  const { state, fx } = ctx;
  const tr = cv.trucks[i];
  const x = truckX(cv, i);
  tr.phase = 'gone'; tr.boomT = 0; tr.back = 0;
  state.blocks = state.blocks.filter(b => !tr.blocks.includes(b));
  tr.blocks = [];
  for (let k = 0; k < 5; k++) fx.spawnExplosion({ x: x + 60 + k * 140, y: TRAILER_TOP + 40 }, k % 2 ? '#F97316' : '#FDE047', 26, 0, 30);
  fx.spawnExplosion({ x: x + 300, y: TRAILER_TOP }, '#1C1917', 30, 0, 24);
  shakeScreen(state, 36, 14);
  playSound('nuke');
  // Anything still on it goes with it
  for (const e of state.enemies) {
    if (e.health <= 0 || e.type === 'boss' || e.enemyType === 'flyer') continue;
    if (e.pos.x + e.width > x - 20 && e.pos.x < x + TRUCK_W + 20) { e.health = 0; fx.blowAwayEnemy(e, { x: (Math.random() - 0.5) * 20, y: -20 }, 'oil_kill', 0, 2); }
  }
  const p = state.player;
  const on = p.pos.x + p.width > x - 10 && p.pos.x < x + TRUCK_W + 10 && p.pos.y + p.height <= TRAILER_TOP + 150;
  if (on && state.deathTimer <= 0) cv.fall = { t: 0, kind: 'boom', x: p.pos.x, y: p.pos.y, truck: i };
  void talk;
};

/** Off the side of the truck: in front of one and it runs you over, off the back and you bounce. */
const startFall = (ctx: FrameContext, cv: Convoy, talk: Talk) => {
  const { state } = ctx;
  const p = state.player;
  const x = p.pos.x + p.width / 2;
  let behind = -1;
  cv.trucks.forEach((tr, i) => { if (tr.phase !== 'gone' && tr.phase !== 'far' && truckX(cv, i) + TRUCK_W < x) behind = i; });
  cv.fall = { t: 0, kind: behind >= 0 ? 'runover' : 'flop', x, y: Y, truck: behind };
  hush(state, talk);
};

const FALL_LINES: Record<Fall['kind'], string[]> = {
  runover: ['ROADKILL', 'FLATTENED ON THE INTERSTATE', 'EIGHTEEN WHEELS, ZERO SURVIVORS'],
  flop: ['THE INTERSTATE WON', 'SKIPPED LIKE A STONE AT EIGHTY MILES AN HOUR', 'ROAD RASH: TERMINAL'],
  boom: ['SHOULD HAVE CLEARED THE ROOF', 'SPECIAL DELIVERY: YOU', 'BLOWN SKY HIGH'],
  melt: ['FULL OF LEAD AND BARF', 'SHOULD HAVE LISTENED TO YOURSELF', 'NEVER BARF WHERE YOU STAND'],
  button: ['RIGGS FINALLY PRESSED THE BUTTON', 'HE HAD A LIZARD TO THINK OF', 'TOOK YOUR SWEET TIME'],
};

const updateFall = (ctx: FrameContext, cv: Convoy): Controls => {
  const { state, fx } = ctx;
  const p = state.player;
  const f = cv.fall!;
  f.t++;
  p.inCutscene = true;
  p.vel = { x: 0, y: 0 };
  if (f.kind === 'runover' || f.kind === 'flop') {
    // On the road: gone from under him at eighty miles an hour
    p.hidden = true;
    f.x -= f.kind === 'flop' ? 6 + f.t * 0.3 : 3;
    if (f.t === 1) { shakeScreen(state, 18, 8); playSound('nuke'); }
    if (f.kind === 'runover' && f.t === 12) { fx.spawnDeathShower({ x: f.x, y: Y - 20 }, -1, 3); shakeScreen(state, 26, 10); }
    if (f.kind === 'flop' && f.t % 8 === 0) fx.spawnDeathShower({ x: f.x, y: Y - 10 }, -1, 0.4);
  } else if (f.kind === 'boom') {
    p.hidden = true;
    if (f.t === 1) fx.spawnDeathShower({ x: p.pos.x + p.width / 2, y: p.pos.y }, 0, 4);
  } else if (f.kind === 'melt') {
    // Down through the hole into the dark, and the muzzle flashes
    p.hidden = true;
    if (f.t > 40 && f.t % 3 === 0) { playSound('gun'); fx.spawnDeathShower({ x: f.x, y: TRAILER_TOP + 60 }, (Math.random() - 0.5) * 2, 0.3); }
    if (f.t === 40) shakeScreen(state, 50, 6);
  } else if (f.kind === 'button') {
    // (Riggs saying goodbye to his lizard first)
    if (f.t === 0) blowUpLast(ctx, cv);
    if (f.t >= 0) p.hidden = true;
    if (f.t === 1) fx.spawnDeathShower({ x: p.pos.x + p.width / 2, y: p.pos.y }, 0, 4);
  }
  const at = f.kind === 'melt' ? 110 : f.kind === 'boom' || f.kind === 'button' ? 40 : 46;
  if (f.t === at && state.deathTimer <= 0) {
    const lines = FALL_LINES[f.kind];
    killPlayer(ctx, lines[Math.floor(Math.random() * lines.length)], false);
  }
  return { ...NO_CONTROLS };
};

/** The last truck, Riggs and all. */
const blowUpLast = (ctx: FrameContext, cv: Convoy) => {
  const { state, fx } = ctx;
  const tr = cv.trucks[3];
  const x = truckX(cv, 3);
  tr.phase = 'gone'; tr.boomT = 0; tr.back = 0;
  state.blocks = state.blocks.filter(b => !tr.blocks.includes(b));
  tr.blocks = [];
  for (let k = 0; k < 5; k++) fx.spawnExplosion({ x: x + 60 + k * 140, y: TRAILER_TOP + 40 }, k % 2 ? '#F97316' : '#FDE047', 26, 0, 30);
  shakeScreen(state, 40, 14);
  playSound('nuke');
};

const roadkill = (ctx: FrameContext, cv: Convoy, e: Enemy) => {
  const { state, fx } = ctx;
  e.health = 0;
  fx.spawnDeathShower({ x: e.pos.x + e.width / 2, y: Y - 10 }, -1, 1.2);
  fx.spawnDamageNumber({ x: Math.max(state.camera.x + 60, e.pos.x), y: Y - 120 }, 'ROADKILL!', true, '#F87171');
  fx.speakVulgarity('charge_kill');
  state.player.killSatisfactionTimer = 60;
  void cv;
};

// ---------------------------------------------------------------------------
// Goons up off the SUVs
// ---------------------------------------------------------------------------

const updateSuvs = (ctx: FrameContext, cv: Convoy) => {
  const { state } = ctx;
  cv.suvs = cv.suvs.filter(s => {
    s.t++;
    if (s.leaving) { s.x -= 9; return s.x > state.camera.x - 400; }
    // Pulling up alongside, then a goon leaps up off the roof
    s.x += Math.max(2, (s.toX - s.x) * 0.08);
    if (!s.dropped && Math.abs(s.toX - s.x) < 20) {
      s.dropped = true;
      const e = makeKindEnemy(s.kind, s.toX, Y - 52);
      e.vel = { x: 0, y: -13.5 };
      e.homeX = s.toX;
      e.facing = state.player.pos.x < s.toX ? -1 : 1;
      state.enemies.push(e);
      cv.trucks[cv.current].goons.push(e.id);
    }
    if (s.dropped && s.t > 70) s.leaving = true;
    return true;
  });
};

// ---------------------------------------------------------------------------
// Junk down the road
// ---------------------------------------------------------------------------

const DEBRIS_WARN = 50;

const spawnDebris = (state: GameState, cv: Convoy) => {
  const looks: Debris['look'][] = ['tire', 'tumbleweed', 'sign', 'box'];
  const look = looks[Math.floor(Math.random() * looks.length)];
  const low = look === 'tire' || look === 'tumbleweed';
  const size = look === 'tire' ? { w: 38, h: 38 } : look === 'tumbleweed' ? { w: 44, h: 40 } : look === 'sign' ? { w: 60, h: 26 } : { w: 34, h: 28 };
  const vx = -(11 + Math.random() * 4);
  // (a head-height one comes in over the roof just above a crouch; a low one along the roof)
  const roof = cv.current === 3 ? TRAILER_TOP : TRAILER_TOP;
  const y = low ? roof - size.h - 30 : roof - 62 - size.h / 2 + 8;
  cv.debris.push({ x: state.camera.x + CANVAS_WIDTH + 30 - vx * DEBRIS_WARN, y, ...size, vx, vy: 0, rot: 0, look, low, hit: false });
};

const updateDebris = (ctx: FrameContext, cv: Convoy) => {
  const { state } = ctx;
  const p = state.player;
  cv.debris = cv.debris.filter(d => {
    d.x += d.vx;
    d.rot += d.vx * 0.02;
    if (d.low) {
      // Bouncing along the roof
      d.vy += 0.7; d.y += d.vy;
      const floor = TRAILER_TOP - d.h;
      if (d.y > floor && truckUnder(cv, d.x + d.w / 2, TRAILER_TOP) >= 0) { d.y = floor; d.vy = -7 - Math.random() * 3; }
    } else d.y += Math.sin((d.x + state.frame) * 0.05) * 0.6;
    if (d.hit) { d.vy += 0.6; d.y += d.vy; return d.y < Y + 200; }
    const box = { x: d.x, y: d.y, w: d.w, h: d.h };
    const hurt = { x: p.pos.x, y: p.pos.y + (p.isDucking || p.isSliding ? 28 : 0), w: p.width, h: p.height - (p.isDucking || p.isSliding ? 28 : 0) };
    if (!p.inCutscene && p.invincibilityTimer <= 0 && state.deathTimer <= 0 && rectsOverlap(box, hurt)) {
      d.hit = true; d.vx *= 0.4; d.vy = -6;
      hurtPlayer(ctx, 10, d.look === 'tumbleweed' ? 'tumbleweed' : 'road_debris', { x: -5, y: -6 }, 20);
      shakeScreen(state, 10, 5);
    }
    return d.x > state.camera.x - 300;
  });
};

/** A piece of junk coming (it's still off the right of the screen): its warning. */
export const debrisComing = (state: GameState, cv: Convoy) => cv.debris.filter(d => !d.hit && d.x > state.camera.x + CANVAS_WIDTH);

// ---------------------------------------------------------------------------
// Barfing on the roof
// ---------------------------------------------------------------------------

const BARF_LINES = [
  "WHOA. THE ROOF'S SIZZLING. MAYBE DON'T BARF ON THE THING I'M STANDING ON.",
  "IT'S EATING THROUGH THE METAL! ONE MORE AND I'M GOING IN THERE!",
];

const watchBarf = (ctx: FrameContext, cv: Convoy, talk: Talk) => {
  const { state } = ctx;
  const p = state.player;
  const barf = p.barfTimer || 0;
  const started = barf > cv.lastBarf;
  cv.lastBarf = barf;
  if (!started || !p.isGrounded) return;
  const i = truckUnder(cv, p.pos.x + p.width / 2, p.pos.y + p.height);
  if (i < 0 || p.pos.y + p.height > TRAILER_TOP + 4) return;
  const tr = cv.trucks[i];
  tr.barfs++;
  if (tr.barfs <= 2) { replaceLines(state, talk, [{ who: 'meathead', text: BARF_LINES[tr.barfs - 1] }]); return; }
  // Through the roof
  replaceLines(state, talk, [{ who: 'meathead', text: '...UH OH.' }]);
  cv.fall = { t: 0, kind: 'melt', x: p.pos.x + p.width / 2, y: p.pos.y, truck: i };
  playSound('barf');
};

// ---------------------------------------------------------------------------
// The last truck: Riggs
// ---------------------------------------------------------------------------

/** The cab: the windshield (where the driver's sat behind it), and the hood in front of it. */
export const windshield = (cv: Convoy) => {
  const x = truckX(cv, 3) + TRAILER_W + 10 + SLEEPER_W;
  return { x: x - 30, y: CAB_TOP + 2, w: 30, h: HOOD_TOP - CAB_TOP - 2 };
};
export const hood = (cv: Convoy) => {
  const x = truckX(cv, 3) + TRAILER_W + 10 + SLEEPER_W;
  return { x, x2: truckX(cv, 3) + TRUCK_W };
};

const BICKER = [
  { who: 'dale', text: "RIGGS! HE'S ON YOUR TRUCK! BLOW IT! BLOW IT NOW!" },
  { who: 'riggs', text: "BLOW IT? I'M DRIVING IT, DALE!" },
  { who: 'dale', text: "YOU KNEW THE RISKS WHEN YOU SIGNED UP!" },
  { who: 'riggs', text: "I SIGNED UP TO DRIVE! THE AD SAID DRIVING! NOTHING ABOUT EXPLODING!" },
  { who: 'dale', text: "PRESS THE RED BUTTON, RIGGS! THAT'S AN ORDER!" },
  { who: 'riggs', text: "I'VE GOT A LIZARD AT HOME, DALE! WHO'S GONNA FEED MY LIZARD?!" },
] as const;
/** After the argument: how long Riggs sits there with his thumb over the button. */
const STANDOFF = 60 * 60;

const updateCab = (ctx: FrameContext, cv: Convoy, talk: Talk, controls: Controls): Controls => {
  const { state, fx } = ctx;
  const p = state.player;
  const cab = cv.cab;
  cab.t++;
  const tx = truckX(cv, 3);
  if (cab.phase === 'none' && p.pos.x > tx + 200 && p.isGrounded) {
    cab.phase = 'bicker'; cab.t = 0; cv.radioT = 99999;
    queueLines(state, talk, BICKER.map(l => ({ ...l })));
  }
  if (cab.phase === 'bicker' && quiet(talk)) {
    cab.phase = 'standoff'; cab.t = 0;
    queueLines(state, talk, [{ who: 'meathead', text: "HE'S RIGHT BEHIND THAT WINDSHIELD. ONE CLEAN SHOT FROM THE HOOD." }], 30);
  }
  if (cab.phase === 'bicker' || cab.phase === 'standoff') {
    // Something hitting the cab: only a handgun round from out on the hood does it
    const ws = windshield(cv);
    const h = hood(cv);
    const onHood = p.pos.x + p.width / 2 > h.x && p.pos.y + p.height <= HOOD_TOP + 3 && p.pos.y + p.height >= HOOD_TOP - 60;
    const glass = { x: ws.x - 40, y: ws.y, w: ws.w + 40, h: ws.h };
    for (const pj of state.projectiles) {
      if (pj.owner !== 'player' || pj.health <= 0 || !rectsOverlap(glass, boundsOf(pj))) continue;
      const plain = !pj.isBoulder && !pj.isIce && !pj.isDart && !pj.isSludge && !pj.isOilRocket && !pj.isShrapnel;
      if (plain && onHood && pj.vel.x < 0) { pj.health = 0; shootRiggs(ctx, cv, talk); break; }
      pj.health = 0;
      if (!cab.wrongSaid) { cab.wrongSaid = true; queueLines(state, talk, [{ who: 'meathead', text: "NOT WITH THAT! THIS NEEDS A SURGEON'S TOUCH. THE HANDGUN. FROM THE HOOD." }]); }
      fx.spawnExplosion({ x: pj.pos.x, y: pj.pos.y }, '#CBD5E1', 6, 0, 6);
    }
  }
  if (cab.phase === 'standoff' && cab.t >= STANDOFF) {
    // Riggs gives in
    cab.phase = 'done';
    replaceLines(state, talk, [{ who: 'riggs', text: "...SORRY, LIZARD." }]);
    cv.fall = { t: -50, kind: 'button', x: p.pos.x, y: p.pos.y, truck: 3 };
    return { ...NO_CONTROLS };
  }
  if (cab.phase === 'shot' || cab.phase === 'crash') return crash(ctx, cv, talk);
  return controls;
};

const shootRiggs = (ctx: FrameContext, cv: Convoy, talk: Talk) => {
  const { state, fx } = ctx;
  const cab = cv.cab;
  cab.phase = 'shot'; cab.t = 0;
  const ws = windshield(cv);
  fx.spawnGlassShatter({ x: ws.x + ws.w / 2, y: ws.y + ws.h / 2 });
  fx.spawnDeathShower({ x: ws.x, y: ws.y + 16 }, -1, 1.4);
  fx.spawnDamageNumber({ x: ws.x - 60, y: ws.y - 50 }, 'HEADSHOT!', true, '#F87171');
  shakeScreen(state, 12, 5);
  playSound('horn');
  cv.radioT = 0;
  replaceLines(state, talk, [
    { who: 'dale', text: "RIGGS? RIGGS?! ...THAT'S COMING OUT OF YOUR PAYCHECK!" },
    { who: 'meathead', text: "HOLD ON. WHO'S DRIVING NOW?" },
  ], 30);
  state.stageMemo.riggsShot = 'yes';
};

/** Riggs slumped on the wheel, the horn going: the truck swerves off the interstate into the next town. */
const CRASH_FRAMES = 330;

const crash = (ctx: FrameContext, cv: Convoy, talk: Talk): Controls => {
  const { state } = ctx;
  const cab = cv.cab;
  if (cab.phase === 'shot' && cab.t > 150) { cab.phase = 'crash'; cab.t = 0; }
  if (cab.phase === 'crash') {
    cab.swerve = Math.sin(cab.t * 0.08) * Math.min(1, cab.t / 60);
    if (cab.t % 30 === 0) shakeScreen(state, 12, 4 + cab.t / 40);
    if (cab.t === 60) replaceLines(state, talk, [{ who: 'meathead', text: 'NOBODY. NOBODY IS DRIVING NOW.' }]);
    if (cab.t >= CRASH_FRAMES) { cv.finished = true; hush(state, talk); }
    // Holding on for dear life
    const p = state.player;
    p.vel.x = 0;
    return { ...NO_CONTROLS };
  }
  return { ...NO_CONTROLS };
};

/** The last few frames before the crash (for the fade and the town sign). */
export const crashProgress = (cv: Convoy) => (cv.cab.phase === 'crash' ? cv.cab.t / CRASH_FRAMES : cv.finished ? 1 : 0);
