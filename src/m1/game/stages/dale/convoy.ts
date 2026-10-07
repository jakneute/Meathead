// Act II: Dale's convoy. Four semis doing eighty down the interstate, and Dale's
// had every one of them rigged to blow ("IF HE GETS ON ONE, BLOW IT!").
//
// On each of the first three a timer's running from the moment Meathead lands on
// it: goons come up onto the roof off SUVs pulling alongside, hawks come down
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
import { killPlayer, skipDying, clearForDoom } from '../../player/player';
import { playSound, playHornDrone } from '../../platform/audio';
import { say, MEATHEAD_VOICE, Voice, cutVoice } from '../../platform/speech';
import { makeKindEnemy } from '../../enemies/kinds';
import { COURSE, CP, TRAILER_W, TRUCK_W, TRAILER_TOP, truckDims } from './course';
import { Talk, queueLines, replaceLines, hush, quiet } from './script';
import { isShat } from '../../player/gut';

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
/** A goon off the front of the truck: through the air, then on the road going back under it, wheel by wheel. */
export interface Tumble { e: Enemy; truck: number; x: number; y: number; vx: number; vy: number; road: boolean; crunched: number[] }

/** Off a truck onto the road, or blown up, or melted through the roof, or Riggs pressed the button: how Meathead's going. */
export interface Fall {
  t: number; kind: 'runover' | 'flop' | 'boom' | 'melt' | 'button'; x: number; y: number; truck: number;
  /** In the trailer: the frame it froze on when he died (the death screen holds there). */
  still?: number;
  /** The goons have been cleared off for it (once it's sealed, nobody else gets in on it). */
  cleared?: boolean;
  /**
   * On the road (runover, flop): his body in road coordinates (g: how far along the road; the world x is g - road),
   * how fast it's still going along the road, its height off it and how fast that's changing, its spin; how far the
   * road's gone by since; the wheels that have gone over him; frames he's been flat; when he came to a stop; the
   * smears he's left.
   */
  road?: { g: number; v: number; h: number; vh: number; rot: number; spin: number; passed: number; crunched: number[]; flat: number; stoppedAt: number; said: number; smears: { g: number; w: number }[];
    /** Off the back: the family on their road trip. The SUV (how far it is from where he stopped, how fast it's going, when it hit him), and him, sent flying (from the same spot). */
    suv?: { off: number; v: number; hitAt: number; over?: boolean };
    fly?: { off: number; h: number; vx: number; vh: number; rot: number };
  };
}
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
  /** Goons knocked onto the cab: tumbling off the front and down under the wheels (the enemy, the wheels that have had it). */
  tumbles: Tumble[];
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

const makeBlocks = (x: number, i: number): Block[] => {
  const d = truckDims(i), s = d.s;
  return [
    { x, y: d.trailerTop, w: d.trailerW, h: d.bed - d.trailerTop, type: 'ground', hidden: true, tag: 'truck' },
    { x: x + d.trailerW, y: Y - 70 * s, w: 10 * s, h: 30 * s, type: 'ground', hidden: true, tag: 'truck' },
    { x: x + d.trailerW + 10 * s, y: d.cabTop, w: d.sleeperW, h: d.bed - d.cabTop, type: 'ground', hidden: true, tag: 'truck' },
    { x: x + d.trailerW + 10 * s + d.sleeperW, y: d.hoodTop, w: d.w - d.trailerW - 10 * s - d.sleeperW, h: d.bed - d.hoodTop, type: 'ground', hidden: true, tag: 'truck' },
  ];
};

export const createConvoy = (state: GameState, startedAt: number): Convoy => {
  const onTruck = startedAt >= CP.HIGHWAY && startedAt <= CP.TRUCK4 ? startedAt - CP.HIGHWAY : -1;
  const trucks: TruckState[] = COURSE.highway.trucks.map((tr, i) => {
    const phase: TruckPhase = onTruck < 0 ? (i === 0 ? 'waiting' : 'far') : i < onTruck ? 'gone' : i === onTruck ? (i === 3 ? 'last' : 'waiting') : 'far';
    const offset = phase === 'far' ? FAR_BACK : 0;
    const blocks = phase === 'gone' ? [] : makeBlocks(tr.x + offset, i);
    state.blocks.push(...blocks);
    return { phase, offset, timeLeft: (PLANS[i]?.seconds ?? 0) * 60, t: 0, wave: 0, nextWaveAt: FIRST_WAVE, goons: [], birds: 0, debrisAt: 200, barfs: 0, blocks, boomT: 999, back: 0 };
  });
  return {
    active: onTruck >= 0, trucks, current: Math.max(0, onTruck), scroll: 0, debris: [], suvs: [], fall: null, tumbles: [],
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
  cv.scroll += roadSpeedNow(cv);
  if (cv.banner) cv.banner.t++;
  if (cv.radioT > 0) cv.radioT--;
  // Keep the trucks' collision where the trucks are
  cv.trucks.forEach((tr, i) => {
    if (tr.phase === 'coming') { tr.offset = Math.max(0, tr.offset - 5); if (tr.offset === 0) tr.phase = 'waiting'; }
    const x = truckX(cv, i);
    const base = makeBlocks(x, i);
    tr.blocks.forEach((b, k) => { b.x = base[k].x; });
  });
  // Burning wrecks, falling away behind (the blast plays out whatever else is going on)
  for (const tr of cv.trucks) if (tr.phase === 'gone') { tr.boomT++; tr.back += Math.min(16, tr.boomT * 0.2); }
  // The fall (or the blast, or the melt, or the button): it plays out, then that's it
  if (cv.fall) return updateFall(ctx, cv, talk);
  const cur = cv.trucks[cv.current];
  const cx = truckX(cv, cv.current);
  // The camera: along the truck he's on (and on to the next once it's pulled up)
  const reachRight = cur.phase === 'cleared' || cur.phase === 'doomed' ? truckX(cv, Math.min(3, cv.current + 1)) + truckDims(Math.min(3, cv.current + 1)).w : cx + truckDims(cv.current).w + 380;
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
      if ((p.vel.x < 0 && p.pos.x < ox + 50) || (p.vel.x > 0 && p.pos.x + p.width > ox + truckDims(on).w - 50)) p.vel.x = 0;
    }
  }
  // Off the side
  if (p.pos.y + p.height > Y - 30 && state.deathTimer <= 0) { startFall(ctx, cv, talk); return { ...NO_CONTROLS }; }
  // Goons off the side: roadkill (only out here: not the ones waiting in town)
  for (const e of state.enemies) {
    if (e.health <= 0 || e.isBlownAway || e.type === 'boss' || e.enemyType === 'flyer') continue;
    if (e.pos.x < COURSE.highway.x1 || e.pos.x > COURSE.highway.x2) continue;
    if (e.pos.y + e.height > Y - 30) { roadkill(ctx, cv, e); continue; }
    // Knocked onto the cab: he goes over the front, and under the wheels
    // (off the front end of the trailer, down onto the cab or into the gap behind it: that's him gone over)
    const on = truckUnder(cv, e.pos.x + e.width / 2, Math.min(e.pos.y + e.height, Y - 70));
    if (on >= 0 && e.pos.x + e.width / 2 > truckX(cv, on) + truckDims(on).trailerW && e.pos.y + e.height > truckDims(on).trailerTop + 8) { overTheFront(ctx, cv, e, on); continue; }
    // (knocked clear across onto a truck that isn't in play: he'd be out of reach, so he goes off the side of it)
    const cur = truckX(cv, cv.current);
    if (e.vel.y === 0 && (e.pos.x + e.width < cur - 200 || e.pos.x > cur + truckDims(cv.current).w + 200)) roadkill(ctx, cv, e);
  }
  updateTumbles(ctx, cv);
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
    if (x >= tx - 4 && x <= tx + truckDims(i).w + 4 && feet <= Y - 60) return i;
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
      { who: 'dale', text: isShat(state) ? "HE'S ON THE TRUCK! HE'S SHIT HIMSELF ON THE TRUCK! BLOW IT IF HE GETS CLOSE!" : "HE'S ON THE TRUCK! HE'S ON THE TRUCK! BLOW IT IF HE GETS CLOSE!" },
      { who: 'meathead', text: "THEY'RE RIGGED?! GREAT. KILL THE CREW, THEN JUMP. EASY." },
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
      // (the last ten seconds, a beep a second)
      if (tr.timeLeft > 0 && tr.timeLeft <= 600 && tr.timeLeft % 60 === 0) playSound('beep');
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
        const v = makeKindEnemy('hawk', state.camera.x + CANVAS_WIDTH + 60, TRAILER_TOP - 230);
        v.homeX = truckX(cv, i) + 150 + Math.random() * 250; v.homeY = TRAILER_TOP - 250;
        state.enemies.push(v);
      }
      // Junk down the road
      if (tr.t >= tr.debrisAt) { tr.debrisAt = tr.t + plan.debris[0] + Math.floor(Math.random() * (plan.debris[1] - plan.debris[0])); spawnDebris(state, cv); }
      // All down: clear. The next truck pulls up
      // (every goon on it, however he got there: not just the ones it's been counting)
      // (every goon out here, wherever he's got to: not only the ones on this roof. Vultures don't count)
      const anyLeft = state.enemies.some(e => e.health > 0 && !e.isBlownAway && e.type !== 'boss' && !e.innocent && e.enemyType !== 'flyer' && e.pos.x > COURSE.highway.x1 - 400 && e.pos.x < COURSE.highway.x2);
      if (tr.wave >= plan.waves.length && !alive.length && !pending && !anyLeft) {
        tr.phase = 'cleared'; tr.t = 0; tr.timeLeft = AFTER_CLEAR;
        const next = cv.trucks[i + 1];
        if (next && next.phase === 'far') next.phase = 'coming';
        cv.banner = { text: 'CREW DOWN! GO!', t: 0, color: '#22C55E' };
        playSound('truckhorn');
        if (i === 0) queueLines(state, talk, [{ who: 'meathead', text: "THAT'S THE CREW! NEXT TRUCK! GO GO GO!" }]);
      }
      if (tr.timeLeft <= 0) blowUp(ctx, cv, i, talk);
    } else if (tr.phase === 'cleared') {
      tr.timeLeft--;
      if (tr.timeLeft > 0 && tr.timeLeft <= 300 && tr.timeLeft % 60 === 0) playSound('beep');
      if (tr.timeLeft <= 0) blowUp(ctx, cv, i, talk);
    } else if (tr.phase === 'doomed') {
      if (tr.t > 50) blowUp(ctx, cv, i, talk);
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
  if (on && state.deathTimer <= 0) { cv.fall = { t: 0, kind: 'boom', x: p.pos.x, y: p.pos.y, truck: i }; p.inCutscene = true; }
  void talk;
};

/** Off the side of the truck: in front of one and it runs you over, off the back and you bounce. */
const startFall = (ctx: FrameContext, cv: Convoy, talk: Talk) => {
  const { state } = ctx;
  const p = state.player;
  const x = p.pos.x + p.width / 2;
  let behind = -1;
  cv.trucks.forEach((tr, i) => { if (tr.phase !== 'gone' && tr.phase !== 'far' && truckX(cv, i) + truckDims(i).w < x) behind = i; });
  cv.fall = { t: 0, kind: behind >= 0 ? 'runover' : 'flop', x, y: Y, truck: behind,
    road: { g: x, v: ROAD_SPEED, h: Math.max(0, Y - (p.pos.y + p.height)), vh: -6, rot: 0, spin: behind >= 0 ? 0.1 : -0.35, passed: 0, crunched: [], flat: 0, stoppedAt: -1, said: 0, smears: [] } };
  hush(state, talk);
  // (a cutscene from the first frame of it)
  p.inCutscene = true;
  // (it's just him and the road now: no junk coming, no warnings, no banners)
  cv.debris = [];
  cv.banner = null;
};

const pick = (l: string[]) => l[Math.floor(Math.random() * l.length)];
const FALL_LINES: Record<Fall['kind'], string[]> = {
  runover: ['ROADKILL', 'FLATTENED ON THE INTERSTATE', 'EIGHTEEN WHEELS, ZERO SURVIVORS'],
  flop: ['THE INTERSTATE WON', 'SKIPPED LIKE A STONE AT EIGHTY MILES AN HOUR', 'ROAD RASH: TERMINAL'],
  boom: ['SHOULD HAVE KILLED FASTER', 'SPECIAL DELIVERY: YOU', 'BLOWN SKY HIGH'],
  melt: ['FULL OF LEAD AND BARF', 'SHOULD HAVE LISTENED TO YOURSELF', 'NEVER BARF WHERE YOU STAND'],
  button: ['RIGGS FINALLY PRESSED THE BUTTON', 'HE HAD A LIZARD TO THINK OF', 'TOOK YOUR SWEET TIME'],
};

/** Off the back, on his feet in the road: when he gets up, when the family comes along, and what they say about it after. */
export const FAMILY = { RISE: 40, STAND: 70, COMING: 110, HONK: 128 };
/** Where the SUV pulls up while they talk it over (from where he was stood). */
const SUV_STOP = 90;
const FAMILY_LINES: { who: 'kid' | 'dad' | 'mom'; text: string }[] = [
  { who: 'kid', text: 'DADDY, WHAT WAS THAT?' },
  { who: 'dad', text: 'THAT? THAT WAS A... SPEED BUMP, PUMPKIN.' },
  { who: 'kid', text: 'IT HAD ABS.' },
  { who: 'dad', text: 'IT WAS A VERY FIT SPEED BUMP.' },
  { who: 'mom', text: "GARY, THERE'S A SHOE IN THE GRILLE." },
  { who: 'dad', text: 'WHO WANTS NUGGETS?!' },
];
/** The same, if what they hit had shit itself. */
const FAMILY_LINES_SHAT: typeof FAMILY_LINES = [
  { who: 'kid', text: 'DADDY, WHAT WAS THAT?' },
  { who: 'dad', text: 'THAT? THAT WAS A... SPEED BUMP, PUMPKIN.' },
  { who: 'kid', text: 'IT HAD ABS. AND IT SMELLED LIKE POOP.' },
  { who: 'dad', text: 'IT WAS A VERY FIT, VERY DIRTY SPEED BUMP.' },
  { who: 'mom', text: "GARY, THERE'S A SHOE IN THE GRILLE. AND... GARY, WHAT IS THAT ON THE GRILLE?" },
  { who: 'dad', text: 'WINDOWS UP! WHO WANTS NUGGETS?!' },
];
const FAMILY_DEATHS = ['HIT AND RUN', 'A VERY FIT SPEED BUMP', 'WHO WANTS NUGGETS?'];

/**
 * Off the back, and he's stopped: he gets up. He's on his feet in the middle of the interstate, swaying, twitching,
 * "I'M GOOD." Then a family on their road trip comes along in their enormous, terrible SUV and runs him down without
 * so much as touching the brakes. From inside: the kids have questions. Dad has answers, of a sort. Off they go.
 */
const familyRide = (ctx: FrameContext, f: Fall, talk: Talk): Controls => {
  const { state, fx } = ctx;
  const r = f.road!;
  const s = f.t - r.stoppedAt;
  if (s === FAMILY.STAND) { state.playerLastVulgarity = "I'M GOOD. I'M GOOD."; state.playerVulgarityTimer = 90; say(state.playerLastVulgarity, MEATHEAD_VOICE, 'urgent', { onShow: () => {}, onHide: () => {} }); }
  if (s === FAMILY.COMING) r.suv = { off: -CANVAS_WIDTH * 0.55 - 240, v: 17, hitAt: -1 };
  if (s === FAMILY.HONK) playSound('horn');
  const suv = r.suv;
  if (suv) {
    suv.off += suv.v;
    // The front bumper reaches him: over he goes, and up, and away
    if (suv.hitAt < 0 && suv.off + 80 >= 0) {
      suv.hitAt = s;
      r.fly = { off: 0, h: 0, vx: 7, vh: -12, rot: 0 };
      shakeScreen(state, 22, 10); playSound('crunch');
      fx.spawnDeathShower({ x: f.x, y: Y - 60 }, 1, 1.4);
      state.playerLastVulgarity = ''; state.playerVulgarityTimer = 0;
      queueLines(state, talk, isShat(state) ? FAMILY_LINES_SHAT : FAMILY_LINES, 40);
    }
    if (suv.hitAt >= 0) {
      // Pulled up just past him while they talk it over (nobody gets out); then off, quick, right over him again
      const talking = !quiet(talk) || s - suv.hitAt < 50;
      if (talking) suv.v = Math.max(0, Math.min(suv.v, (SUV_STOP - suv.off) * 0.08));
      else suv.v = Math.min(20, suv.v + 0.5);
      if (!talking && !suv.over && r.fly && suv.off + 80 >= r.fly.off) {
        suv.over = true;
        shakeScreen(state, 12, 6); playSound('crunch');
        fx.spawnDeathShower({ x: f.x + r.fly.off, y: Y - 10 }, 1, 0.6);
      }
    }
  }
  const fly = r.fly;
  if (fly) {
    fly.off += fly.vx; fly.vh += 0.8; fly.h -= fly.vh; fly.rot += fly.vx * 0.03;
    if (fly.h <= 0) {
      fly.h = 0;
      if (fly.vh > 4) { fly.vh = -fly.vh * 0.4; fly.vx *= 0.6; shakeScreen(state, 6, 3); r.smears.push({ g: r.g + fly.off, w: 30 }); }
      else { fly.vh = 0; fly.vx *= 0.85; }
    }
  }
  // (his bubble goes where he is)
  state.player.pos = { x: f.x + (fly?.off ?? 0) - state.player.width / 2, y: Y - (fly?.h ?? 0) - state.player.height };
  // Once they're gone (or it's gone on long enough): that's it
  const gone = suv && suv.hitAt >= 0 && quiet(talk) && suv.off > CANVAS_WIDTH * 0.45 + 160;
  if ((gone || (suv && suv.hitAt >= 0 && s - suv.hitAt > 2400)) && state.deathTimer <= 0) {
    killPlayer(ctx, FAMILY_DEATHS[Math.floor(Math.random() * FAMILY_DEATHS.length)], false);
  }
  return { ...NO_CONTROLS };
};

const updateFall = (ctx: FrameContext, cv: Convoy, talk: Talk): Controls => {
  const { state, fx } = ctx;
  const p = state.player;
  const f = cv.fall!;
  // (it's sealed: the goons go, and what they've fired, so none of them gets in on it or wanders through the shot)
  if (!f.cleared) { f.cleared = true; clearForDoom(state); }
  // (in the trailer, the death screen holds on the moment: him on his feet, still taking it)
  if (f.kind === 'melt' && f.still !== undefined) return { ...NO_CONTROLS };
  f.t++;
  // (the long ones can be skipped: straight to the death screen)
  // (off the back and skipped before the family's got to him: no hit and run, just the road)
  if (skipDying(ctx, f.t, () => pick(f.kind === 'flop' && (f.road?.suv?.hitAt ?? -1) >= 0 ? FAMILY_DEATHS : FALL_LINES[f.kind]))) {
    hush(state, talk);
    if (f.kind === 'melt') f.still = state.frame;
    return { ...NO_CONTROLS };
  }
  p.inCutscene = true;
  p.vel = { x: 0, y: 0 };
  if (f.kind === 'runover' || f.kind === 'flop') {
    p.hidden = true;
    return onTheRoad(ctx, cv, f, talk);
  } else if (f.kind === 'boom') {
    p.hidden = true;
    if (f.t === 1) fx.spawnDeathShower({ x: p.pos.x + p.width / 2, y: p.pos.y }, 0, 4);
  } else if (f.kind === 'melt') {
    p.hidden = true;
    // (whatever was being said out there, it's not in here)
    if (f.t === MELT.FADE) hush(state, talk);
    return inTheTrailer(ctx, f);
  } else if (f.kind === 'button') {
    // (Riggs saying goodbye to his lizard first)
    if (f.t === 0) blowUpLast(ctx, cv);
    if (f.t >= 0) p.hidden = true;
    if (f.t === 1) fx.spawnDeathShower({ x: p.pos.x + p.width / 2, y: p.pos.y }, 0, 4);
  }
  const at = f.kind === 'boom' || f.kind === 'button' ? 40 : 46;
  if (f.t === at && state.deathTimer <= 0) {
    const lines = FALL_LINES[f.kind];
    killPlayer(ctx, lines[Math.floor(Math.random() * lines.length)], false);
  }
  return { ...NO_CONTROLS };
};

/**
 * Through the roof: the screen goes black on the sizzling hole, and then it's the inside of the trailer, a place of
 * its own. He drops in through the hole in its roof (always the same spot, near the back), lands, and looks round
 * at the dark. Nothing. A beat. Then the goons riding in the front of it come up from behind the crates and empty
 * their rifles into him. It freezes there, him still on his feet taking it, under the death screen. Frames from the start of the fall.
 */
export const MELT = { FADE: 36, DROP: 58, LAND: 78, POP: 228, FIRE: 258, KILL: 300, STOP: 340 };
/** What he says, when (and the goon's shout). */
export const MELT_SAYS: { at: number; until: number; who: 'meathead' | 'goon'; text: string }[] = [
  { at: MELT.LAND + 24, until: MELT.LAND + 84, who: 'meathead', text: '...HUH?' },
  { at: MELT.LAND + 96, until: MELT.POP - 6, who: 'meathead', text: 'HELLO? ANYBODY BACK HERE?' },
  { at: MELT.POP + 4, until: MELT.FIRE, who: 'goon', text: 'SURPRISE!' },
  { at: MELT.POP + 12, until: MELT.FIRE + 10, who: 'meathead', text: 'OH NO.' },
];

const GOON_VOICE: Voice = { id: 'dale.goon', pitch: 0.7, rate: 1.1 };
const inTheTrailer = (ctx: FrameContext, f: Fall): Controls => {
  const { state } = ctx;
  const u = f.t;
  const line = MELT_SAYS.find(l => l.at === u);
  if (line) say(line.text, line.who === 'meathead' ? MEATHEAD_VOICE : GOON_VOICE, 'urgent', { onShow: () => {}, onHide: () => {} });
  if (u === MELT.LAND) { shakeScreen(state, 10, 6); playSound('thud'); }
  if (u === MELT.POP) playSound('reload');
  if (u >= MELT.FIRE && u < MELT.STOP) { if (u % 3 === 0) playSound('lmg'); if (u % 12 === 0) shakeScreen(state, 8, 4); }
  if (u === MELT.KILL && state.deathTimer <= 0) {
    // Dead on his feet, mid-volley: it freezes right there
    f.still = state.frame;
    const lines = FALL_LINES.melt;
    killPlayer(ctx, lines[Math.floor(Math.random() * lines.length)], false);
  }
  return { ...NO_CONTROLS };
};

/** How long he lies there twitching before that's it. */
const TWITCH_FOR = 170;
const FLOP_SAYS = ['AAAAAAH!', 'OW!', 'OW! OW!', 'MY EVERYTHING!', "I'M OKAY!", '...NOPE.'];
const RUNOVER_SAYS = ['WAIT WAIT WAIT', 'OOF!', 'MY SPLEEN!', 'NOT THE FACE!', 'HOW MANY WHEELS DOES THIS THING HAVE?!', '...EIGHTEEN.'];

/**
 * Off the side of a truck at eighty miles an hour. The camera goes with him: off the back, he hits the road and
 * cartwheels away down the interstate, bouncing and yelling, the trucks pulling away, till he slides to a stop and
 * lies there. Off the front, the truck behind him catches up and every set of wheels goes over him in turn (crunch,
 * a spray of it, flatter each time), and what's left tumbles out the back and skids to a stop. Either way it ends
 * with him face down on the asphalt, twitching.
 */
const onTheRoad = (ctx: FrameContext, cv: Convoy, f: Fall, talk: Talk): Controls => {
  const { state, fx } = ctx;
  const r = f.road!;
  // (off the back and come to a stop: he's stood there on the road, and it stays put under him)
  if (!(f.kind === 'flop' && r.stoppedAt >= 0)) r.passed += ROAD_SPEED;
  const bodyX = () => r.g - r.passed;
  const shout = (i: number) => {
    const lines = f.kind === 'flop' ? FLOP_SAYS : RUNOVER_SAYS;
    if (i < r.said || i >= lines.length) return;
    r.said = i + 1;
    state.playerLastVulgarity = lines[i]; state.playerVulgarityTimer = 50;
    say(lines[i], MEATHEAD_VOICE, 'urgent', { onShow: () => {}, onHide: () => {} });
  };
  if (f.t === 1) { shakeScreen(state, 18, 8); playSound('slam'); shout(0); }
  // Slowing down along the road (much faster while he's scraping along it)
  const scraping = r.h <= 0.5;
  r.v = Math.max(0, r.v - (scraping ? (r.flat > 0 ? 0.28 : 0.22) : 0.08));
  r.g += r.v;
  // Up and down: bouncing, less each time
  if (r.flat === 0 || f.kind === 'flop') {
    r.vh += 0.75; r.h -= r.vh;
    if (r.h <= 0) {
      r.h = 0;
      if (r.vh > 3 && r.v > 2) {
        r.vh = -r.vh * 0.55; r.spin = (Math.random() < 0.5 ? -1 : 1) * (0.2 + r.v * 0.02);
        shakeScreen(state, 8, 4); playSound('thud');
        fx.spawnDeathShower({ x: bodyX(), y: Y - 10 }, -1, 0.35);
        r.smears.push({ g: r.g, w: 20 + r.v * 3 });
        if (f.kind === 'flop') shout(Math.min(4, r.said));
      } else r.vh = 0;
    }
  }
  r.rot += r.v > 0.5 ? r.spin * (r.h > 0 ? 1 : 0.5) : 0;
  // A smear along the asphalt while he scrapes
  if (scraping && r.v > 0.5 && f.t % 3 === 0) r.smears.push({ g: r.g, w: 8 + r.v });
  // The truck coming up behind him: every set of wheels in turn
  if (f.kind === 'runover' && f.truck >= 0 && cv.trucks[f.truck].phase !== 'gone') {
    const tx = truckX(cv, f.truck);
    const s = truckDims(f.truck).s;
    const wheels = [TRUCK_W - 34, TRAILER_W + 74, TRAILER_W + 30, 110, 60].map(o => tx + o * s);
    wheels.forEach((wx, k) => {
      if (r.crunched.includes(k) || Math.abs(bodyX() - wx) > 16) return;
      r.crunched.push(k);
      r.flat = Math.max(1, r.flat); r.h = 0; r.vh = 0;
      shakeScreen(state, 20 + k * 2, 10);
      playSound('crunch');
      fx.spawnDeathShower({ x: wx, y: Y - 16 }, -1, 1.2);
      fx.spawnDamageNumber({ x: wx - 30, y: Y - 110 }, ['CRUNCH!', 'SPLORT!', 'CRUNCH!', 'SQUELCH!', 'SPLAT!'][k], true, '#F87171');
      shout(k + 1);
      r.smears.push({ g: r.g, w: 60 });
    });
  }
  if (r.flat > 0) r.flat++;
  // The camera stays on him, the road going by under it as fast as he's still going
  const x = bodyX();
  state.cameraMinX = Math.min(state.cameraMinX, x - CANVAS_WIDTH);
  state.cameraOverride = { x: x - CANVAS_WIDTH * 0.55, y: HIGHWAY_CAM_Y };
  state.camera.x = state.cameraOverride.x; state.camera.y = HIGHWAY_CAM_Y;
  f.x = x;
  // (his words go up over where he is: the real him is hidden, but his speech bubble goes by his position)
  state.player.pos = { x: x - state.player.width / 2, y: Y - r.h - state.player.height };
  // Stopped: he lies there. A twitch now and then. Then that's that
  if (r.v <= 0 && r.h <= 0 && r.stoppedAt < 0) { r.stoppedAt = f.t; if (f.kind === 'flop') shout(5); else shout(5); }
  // Off the back: he gets up, and the family comes along
  if (f.kind === 'flop' && r.stoppedAt >= 0) return familyRide(ctx, f, talk);
  if (r.stoppedAt >= 0 && f.t === r.stoppedAt + TWITCH_FOR && state.deathTimer <= 0) {
    const lines = FALL_LINES[f.kind];
    killPlayer(ctx, lines[Math.floor(Math.random() * lines.length)], false);
  }
  return { ...NO_CONTROLS };
};

/** How fast the road's going by under the camera right now (it slows as the camera slows with him). */
export const roadSpeedNow = (cv: Convoy) => (cv.fall?.road ? cv.fall.road.v : ROAD_SPEED);

/** The last truck, Riggs and all. */
const blowUpLast = (ctx: FrameContext, cv: Convoy) => {
  const { state, fx } = ctx;
  const tr = cv.trucks[3];
  const x = truckX(cv, 3);
  tr.phase = 'gone'; tr.boomT = 0; tr.back = 0;
  state.blocks = state.blocks.filter(b => !tr.blocks.includes(b));
  tr.blocks = [];
  for (let k = 0; k < 5; k++) fx.spawnExplosion({ x: x + 60 + k * 180, y: truckDims(3).trailerTop + 40 }, k % 2 ? '#F97316' : '#FDE047', 26, 0, 30);
  shakeScreen(state, 40, 14);
  playSound('nuke');
};

/** Off the front of the cab he goes, tumbling, down onto the road in front of the truck. */
const overTheFront = (ctx: FrameContext, cv: Convoy, e: Enemy, truck: number) => {
  e.health = 0; e.isBlownAway = true; e.pauseTimer = 0;
  const front = truckX(cv, truck) + truckDims(truck).w;
  cv.tumbles.push({ e, truck, x: e.pos.x, y: e.pos.y, vx: Math.max(3, (front + 40 - e.pos.x) / 22), vy: -7, road: false, crunched: [] });
  ctx.fx.speakVulgarity('charge_kill');
  ctx.state.player.killSatisfactionTimer = 60;
};

/**
 * The goons going over the front: through the air and down onto the road ahead of the truck, where the road (going by
 * at eighty) takes them straight back under it, and every set of wheels goes over them in turn. What's left comes out
 * the back.
 */
const updateTumbles = (ctx: FrameContext, cv: Convoy) => {
  const { state, fx } = ctx;
  cv.tumbles = cv.tumbles.filter(tb => {
    const e = tb.e;
    const tx = truckX(cv, tb.truck), d = truckDims(tb.truck);
    if (!tb.road) {
      tb.vy += 0.7; tb.x += tb.vx; tb.y += tb.vy;
      if (tb.y + e.height >= Y - 6 && tb.vy > 0) {
        tb.road = true; tb.y = Y - 6 - e.height;
        playSound('thud'); fx.spawnDeathShower({ x: tb.x + e.width / 2, y: Y - 10 }, -1, 0.5);
      }
    } else {
      // On the road: it goes by, and him with it (back under the truck)
      tb.x -= ROAD_SPEED;
      const wheels = [TRUCK_W - 34, TRAILER_W + 74, TRAILER_W + 30, 110, 60].map(o => tx + o * d.s);
      wheels.forEach((wx, k) => {
        if (tb.crunched.includes(k) || Math.abs(tb.x + e.width / 2 - wx) > ROAD_SPEED / 2 + 4) return;
        tb.crunched.push(k);
        playSound('crunch');
        fx.spawnDeathShower({ x: wx, y: Y - 14 }, -1, k === 0 ? 1.6 : 0.9);
        if (k === 0) { fx.spawnDamageNumber({ x: wx - 40, y: Y - 120 }, 'FLATTENED!', true, '#F87171'); fx.announceKill('FLATTENED!'); shakeScreen(state, 10, 5); }
      });
    }
    // (him, where he is, tumbling; once the front wheels have him, he's under the truck: what's left is the spray)
    e.pos.x = tb.x; e.pos.y = tb.y; e.vel = { x: 0, y: 0 };
    if (tb.crunched.length) state.enemies = state.enemies.filter(o => o !== e);
    return tb.x > tx - 200;
  });
};

const roadkill = (ctx: FrameContext, cv: Convoy, e: Enemy) => {
  const { state, fx } = ctx;
  // (dead for good: gone off the list, not left at nothing to be topped back up if he was never on screen (see
  // spared), and so run over again next frame, and again, the callout every time)
  e.health = 0; e.seen = true; e.isBlownAway = true; e.vel = { x: -6, y: 4 };
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
  const roof = truckDims(cv.current).trailerTop;
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
      const under = truckUnder(cv, d.x + d.w / 2, TRAILER_TOP);
      const floor = (under >= 0 ? truckDims(under).trailerTop : TRAILER_TOP) - d.h;
      if (d.y > floor && under >= 0) { d.y = floor; d.vy = -7 - Math.random() * 3; }
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
  if (i < 0 || p.pos.y + p.height > truckDims(i).trailerTop + 4) return;
  const tr = cv.trucks[i];
  tr.barfs++;
  if (tr.barfs <= 2) { replaceLines(state, talk, [{ who: 'meathead', text: BARF_LINES[tr.barfs - 1] }]); return; }
  // Through the roof
  replaceLines(state, talk, [{ who: 'meathead', text: '...UH OH.' }]);
  cv.fall = { t: 0, kind: 'melt', x: p.pos.x + p.width / 2, y: p.pos.y, truck: i };
  p.inCutscene = true;
  playSound('barf');
};

// ---------------------------------------------------------------------------
// The last truck: Riggs
// ---------------------------------------------------------------------------

/** The cab: the windshield (where the driver's sat behind it), and the hood in front of it. */
export const windshield = (cv: Convoy) => {
  const d = truckDims(3);
  const x = truckX(cv, 3) + d.trailerW + 10 * d.s + d.sleeperW;
  return { x: x - 30 * d.s, y: d.cabTop + 2, w: 30 * d.s, h: d.hoodTop - d.cabTop - 2 };
};
export const hood = (cv: Convoy) => {
  const d = truckDims(3);
  const x = truckX(cv, 3) + d.trailerW + 10 * d.s + d.sleeperW;
  return { x, x2: truckX(cv, 3) + d.w, top: d.hoodTop };
};

/** Dale and Riggs over the radio: about a minute of it before Riggs gives in (the time you've got). */
const bicker = (shat: boolean) => [
  { who: 'dale', text: "RIGGS! HE'S ON YOUR TRUCK! BLOW IT! BLOW IT NOW!" },
  { who: 'riggs', text: shat ? "BLOW IT? I'M DRIVING IT, DALE! AND HE SMELLS LIKE HE ALREADY BLEW!" : "BLOW IT? I'M DRIVING IT, DALE!" },
  { who: 'meathead', text: "HE'S RIGHT BEHIND THAT WINDSHIELD. ONE CLEAN SHOT FROM THE HOOD." },
  { who: 'dale', text: "YOU KNEW THE RISKS WHEN YOU SIGNED UP!" },
  { who: 'riggs', text: "I SIGNED UP TO DRIVE! THE AD SAID DRIVING! NOTHING ABOUT EXPLODING!" },
  { who: 'dale', text: "IT WAS IN THE FINE PRINT, RIGGS! PAGE FORTY!" },
  { who: 'riggs', text: "THE CONTRACT WAS ONE PAGE, DALE! IT WAS A NAPKIN!" },
  { who: 'dale', text: "A BINDING NAPKIN! PRESS THE RED BUTTON! THAT'S AN ORDER!" },
  { who: 'riggs', text: "I'VE GOT A LIZARD AT HOME, DALE! WHO'S GONNA FEED MY LIZARD?!" },
  { who: 'dale', text: "I'LL FEED YOUR LIZARD! I'LL FEED HIM PERSONALLY!" },
  { who: 'riggs', text: "YOU DON'T EVEN KNOW HIS NAME!" },
  { who: 'dale', text: "...GARY?" },
  { who: 'riggs', text: "IT'S SIR REGINALD, DALE! TWELVE YEARS AND YOU NEVER ASKED!" },
  { who: 'dale', text: "RIGGS. BUDDY. PAL. THINK OF THE BONUS. THINK OF THE DENTAL." },
  { who: 'riggs', text: "WE DON'T GET DENTAL!" },
  { who: 'dale', text: "THE WIDOW'S DENTAL, RIGGS! IT'S VERY GOOD!" },
  { who: 'riggs', text: "I'M NOT MARRIED! SIR REGINALD'S ALL I'VE GOT!" },
  { who: 'dale', text: "THEN SIR REGINALD GETS THE DENTAL! PRESS IT! PRESS IT! PRESS IT!" },
  { who: 'riggs', text: "...YOU PROMISE YOU'LL FEED HIM?" },
  { who: 'dale', text: "CRICKETS, TWICE A DAY. YOU HAVE MY WORD." },
] as const;
/** However the talking's going, Riggs gives in by this long after it starts. */
const BICKER_MAX = 70 * 60;
/** Riggs slumped on the horn: how long it blares (the swerve off the road and all). */
const HORN_SECONDS = 6;

const updateCab = (ctx: FrameContext, cv: Convoy, talk: Talk, controls: Controls): Controls => {
  const { state, fx } = ctx;
  const p = state.player;
  const cab = cv.cab;
  cab.t++;
  const tx = truckX(cv, 3);
  if (cab.phase === 'none' && p.pos.x > tx + 200 && p.isGrounded) {
    cab.phase = 'bicker'; cab.t = 0; cv.radioT = 99999;
    queueLines(state, talk, bicker(isShat(state)).map(l => ({ ...l })));
  }
  if (cab.phase === 'bicker' && (quiet(talk) || cab.t >= BICKER_MAX)) {
    // He gives in
    cab.phase = 'standoff'; cab.t = 0;
    replaceLines(state, talk, [{ who: 'riggs', text: '...SORRY, SIR REGINALD.' }]);
  }
  if (cab.phase === 'bicker' || cab.phase === 'standoff') {
    // Something hitting the cab: only a handgun round from out on the hood does it
    const ws = windshield(cv);
    const h = hood(cv);
    const onHood = p.pos.x + p.width / 2 > h.x && p.pos.y + p.height <= h.top + 3 && p.pos.y + p.height >= h.top - 60;
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
  if (cab.phase === 'standoff' && cab.t > 30 && quiet(talk)) {
    // Thumb down on the button
    cab.phase = 'done';
    cv.fall = { t: -20, kind: 'button', x: p.pos.x, y: p.pos.y, truck: 3 };
    p.inCutscene = true;
    return { ...NO_CONTROLS };
  }
  if (cab.phase === 'shot' || cab.phase === 'crash') return crash(ctx, cv, talk);
  return controls;
};

const shootRiggs = (ctx: FrameContext, cv: Convoy, talk: Talk) => {
  const { state, fx } = ctx;
  const cab = cv.cab;
  cab.phase = 'shot'; cab.t = 0;
  // (shot mid-sentence: that's the end of the sentence)
  hush(state, talk);
  cutVoice('dale.riggs');
  const ws = windshield(cv);
  fx.spawnGlassShatter({ x: ws.x + ws.w / 2, y: ws.y + ws.h / 2 });
  fx.spawnDeathShower({ x: ws.x, y: ws.y + 16 }, -1, 1.4);
  fx.spawnDamageNumber({ x: ws.x - 60, y: ws.y - 50 }, 'HEADSHOT!', true, '#F87171');
  shakeScreen(state, 12, 5);
  // Face down on the wheel, on the horn
  playHornDrone(HORN_SECONDS);
  cv.radioT = 0;
  replaceLines(state, talk, [
    { who: 'dale', text: "RIGGS? RIGGS?! ...THAT'S COMING OUT OF YOUR PAYCHECK!" },
    { who: 'meathead', text: "HOLD ON. WHO'S DRIVING NOW?" },
  ], 30);
  state.stageMemo.riggsShot = 'yes';
};

/** Riggs slumped on the wheel, the horn going: the truck swerves off the interstate into the next town. */
const CRASH_FRAMES = 200;

const crash = (ctx: FrameContext, cv: Convoy, talk: Talk): Controls => {
  const { state } = ctx;
  const cab = cv.cab;
  // (Riggs shot, the truck swerving off the interstate with him hanging on: a cutscene, straight on into the crash in
  // town, which gives him back)
  state.player.inCutscene = true;
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

/** Swerving off the road: the last truck's drawn tipping this way and that about the road under its middle (and him
 * on its hood with it). Null while it's running straight. */
export const truckTilt = (cv: Convoy, onIt?: { x: number }) => {
  if (!cv.cab.swerve || cv.cab.phase !== 'crash') return null;
  if (onIt && (onIt.x < truckX(cv, 3) - 100 || onIt.x > truckX(cv, 3) + truckDims(3).w + 100)) return null;
  return { x: truckX(cv, 3) + truckDims(3).w / 2, y: Y, angle: cv.cab.swerve * 0.04 };
};
