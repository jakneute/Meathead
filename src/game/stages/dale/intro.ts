// The landing. Meathead comes down out of the sky in the middle of nowhere, right
// on top of Dale and his crew loading his truck at a turnout. Dale takes one look:
// "OH NO! THE FEDS!", drops what he's carrying, runs for the cab and floors it
// off across the desert. His goons stay put (they weren't told).

import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { playSound } from '../../platform/audio';
import { isSpeaking } from '../../platform/speech';
import { shakeScreen } from '../../core/state';
import { CAB_DOOR } from '../../render/bosses/daleTruck';
import { COURSE, CP } from './course';
import { Talk, queueLines } from './script';

export interface Intro {
  phase: 'loading' | 'spotted' | 'running' | 'boarding' | 'driving' | 'gone';
  t: number;
  /** Where Dale is (his feet, middle), and the truck (its back end), and how fast it's going. */
  daleX: number;
  truckX: number;
  speed: number;
  /** The crate he was carrying, dropped. */
  crate: { x: number; y: number; vy: number; broke: boolean } | null;
  /** When he spotted him, when he set off for the cab (and how fast he's going), when he got to its door, when the truck started up. */
  spotT: number;
  runT: number;
  runV: number;
  boardT: number;
  goT: number;
  /** How far the loading had got when he was caught (it stops there: the pile stays as it was). */
  caughtAt: number;
  /** Whether this scene has him in a cutscene (it set inCutscene, and takes it off). */
  held?: boolean;
}

export const createIntro = (startedAt: number): Intro => ({
  phase: startedAt === CP.LANDING ? 'loading' : 'gone', t: 0,
  daleX: COURSE.landing.daleX, truckX: COURSE.landing.truckX, speed: 0, crate: null,
  spotT: 0, runT: 0, runV: 0, boardT: 0, goT: 0, caughtAt: -1,
});

/** When he spots him; how long he stands there gawping before he runs; getting in the cab; the truck going. */
const SPOT_AT = 10, GAWP_FOR = 30, GO_AFTER = 15, GONE_AFTER = 260;
/** Getting in: the door yanked open, stepping up, in, the door slammed. */
export const BOARD = { yank: 6, open: 8, step: 10, stepUp: 18, inside: 28, slam: 32 };
const RUN_TOP = 6;

// ---------------------------------------------------------------------------
// The loading: Dale shoving crates up into the back of the truck, from the pile behind him, one at a time (the frames
// since the stage started, so it's going on while Meathead comes down out of the sky)
// ---------------------------------------------------------------------------

export type LoadAct = 'carry' | 'shove' | 'dust' | 'turn' | 'walk' | 'lift' | 'idle';
export interface LoadPose {
  x: number; facing: 1 | -1; act: LoadAct;
  /** How far through it (0..1). */
  k: number;
  /** A crate in his hands. */
  holding: boolean;
  /** The pile crate he's picking up (lift). */
  pick: number;
  /** Which pile crates are gone (into the truck, or in his hands). */
  taken: number[];
  /** Where his feet are in their stride, walking. */
  stride: number;
}

/** The pile of crates behind the truck (its crates' top-left corners, 30 square), bottom row first. */
export const PILE_SIZE = 30;
export const pileCrate = (i: number, truckX = COURSE.landing.truckX) => ({ x: truckX - 180 + (i % 3) * 32 + (i >= 3 ? 16 : 0), y: 550 - 28 - (i >= 3 ? 28 : 0) });
/** Where he stands to shove one in (the crate in his arms up against the back of the truck), and to pick one up. */
const LOAD_X = (truckX: number) => truckX - 34;
const standFor = (i: number, truckX: number) => pileCrate(i, truckX).x + PILE_SIZE / 2 + 28;
/** The order he takes them: the top row, then the bottom. */
const PICKS = [5, 4, 3, 2, 1];

interface Seg { act: LoadAct; dur: number; x0: number; x1: number; facing: 1 | -1; holding: boolean | 'drops' | 'gets'; pick: number }
const plan = (truckX: number): Seg[] => {
  const lx = LOAD_X(truckX);
  const segs: Seg[] = [
    { act: 'carry', dur: 14, x0: lx, x1: lx, facing: 1, holding: true, pick: -1 },
    { act: 'shove', dur: 16, x0: lx, x1: lx, facing: 1, holding: 'drops', pick: -1 },
    { act: 'dust', dur: 8, x0: lx, x1: lx, facing: 1, holding: false, pick: -1 },
  ];
  for (const i of PICKS) {
    const sx = standFor(i, truckX);
    segs.push(
      { act: 'turn', dur: 4, x0: lx, x1: lx, facing: -1, holding: false, pick: i },
      { act: 'walk', dur: Math.ceil((lx - sx) / 1.6), x0: lx, x1: sx, facing: -1, holding: false, pick: i },
      { act: 'lift', dur: 18, x0: sx, x1: sx, facing: -1, holding: 'gets', pick: i },
      { act: 'turn', dur: 4, x0: sx, x1: sx, facing: 1, holding: true, pick: i },
      { act: 'walk', dur: Math.ceil((lx - sx) / 1.3), x0: sx, x1: lx, facing: 1, holding: true, pick: i },
      { act: 'shove', dur: 16, x0: lx, x1: lx, facing: 1, holding: 'drops', pick: i },
      { act: 'dust', dur: 8, x0: lx, x1: lx, facing: 1, holding: false, pick: i },
    );
  }
  return segs;
};
let planned: { truckX: number; segs: Seg[] } | null = null;

/** Where he is in the loading, `clock` frames in. */
export const loadingAt = (clock: number, truckX = COURSE.landing.truckX): LoadPose => {
  if (!planned || planned.truckX !== truckX) planned = { truckX, segs: plan(truckX) };
  const taken: number[] = [];
  let c = Math.max(0, clock), walked = 0;
  for (const s of planned.segs) {
    if (c < s.dur) {
      const k = c / s.dur;
      if (s.act === 'lift' && k >= LIFT_OFF) taken.push(s.pick);
      if (s.act === 'walk') walked += Math.abs(s.x1 - s.x0) * k;
      const holding = s.holding === 'drops' ? k < SHOVE_GONE : s.holding === 'gets' ? k >= LIFT_OFF : s.holding;
      return { x: s.x0 + (s.x1 - s.x0) * k, facing: s.facing, act: s.act, k, holding, pick: s.pick, taken, stride: walked / 5 };
    }
    c -= s.dur;
    if (s.act === 'lift') taken.push(s.pick);
    if (s.act === 'walk') walked += Math.abs(s.x1 - s.x0);
  }
  // (all of it in: stood there admiring it)
  return { x: LOAD_X(truckX), facing: 1, act: 'idle', k: 0, holding: false, pick: -1, taken, stride: 0 };
};
/** The crate comes up off the pile this far into the lift, and is all the way into the truck this far into the shove. */
export const LIFT_OFF = 0.4, SHOVE_GONE = 0.8;

const ease = (t: number) => { const k = Math.max(0, Math.min(1, t)); return k * k * (3 - 2 * k); };

/**
 * The crate he's got hold of, if he has (the middle of it, in the world): held against his belly, shoved off his hands
 * into the back of the truck, or coming up off the pile into his arms.
 */
export const carriedCrate = (p: LoadPose, truckX = COURSE.landing.truckX): { x: number; y: number } | null => {
  if (!p.holding) return null;
  const at = (fwd: number, down: number) => ({ x: p.x + p.facing * fwd, y: 550 - 80 + down });
  if (p.act === 'shove') return at(CARRY[0] + 46 * ease(p.k / SHOVE_GONE), CARRY[1] - 4 * ease(p.k));
  if (p.act === 'lift') {
    const c = pileCrate(p.pick, truckX), e = ease((p.k - LIFT_OFF) / (1 - LIFT_OFF)), to = at(CARRY[0], CARRY[1]);
    const from = { x: c.x + PILE_SIZE / 2, y: c.y + PILE_SIZE / 2 };
    // (up off the pile in an arc, into his arms)
    return { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e - Math.sin(e * Math.PI) * 6 };
  }
  return at(CARRY[0], CARRY[1]);
};
/** Where a crate he's carrying sits: [out in front of his middle, down from the top of his head]. */
export const CARRY: [number, number] = [12, 46];

/** The loading's clock: the frames he's been at it (through the drop out of the sky, then the scene's own). */
export const loadClock = (state: GameState, it: Intro) => (it.caughtAt >= 0 ? it.caughtAt : (state.introTimer || 0) + it.t);

/** Where he gets to by the cab door (his middle), to yank it open and climb in. */
export const doorStand = (truckX: number) => truckX + CAB_DOOR.x1 + 22;

export const updateIntro = (ctx: FrameContext, it: Intro, talk: Talk, controls: Controls): Controls => {
  const { state } = ctx;
  if (it.phase === 'gone') return controls;
  it.t++;
  // Nobody's starting anything till the truck's going
  if (it.phase !== 'driving') state.gapGrace = Math.max(state.gapGrace || 0, 2);
  if (it.phase === 'loading') it.daleX = loadingAt(loadClock(state, it), it.truckX).x;
  // (he lets Meathead finish his line from the landing first)
  if (it.phase === 'loading' && it.t >= SPOT_AT && (!isSpeaking() || it.t > 150)) {
    const clock = loadClock(state, it), pose = loadingAt(clock, it.truckX);
    it.phase = 'spotted'; it.spotT = it.t; it.caughtAt = clock; it.daleX = pose.x;
    queueLines(state, talk, [{ who: 'dale', text: 'OH NO! THE FEDS!' }, { who: 'dale', text: "DROP EVERYTHING! I'M OUTTA HERE!" }]);
    // (whatever he had hold of goes up out of his hands as he jumps, and down in the dirt)
    const held = carriedCrate(pose, it.truckX);
    if (held) it.crate = { x: held.x, y: held.y - PILE_SIZE / 2, vy: -3, broke: false };
  }
  if (it.phase === 'spotted' && it.t >= it.spotT + GAWP_FOR) { it.phase = 'running'; it.runT = it.t; it.runV = 0; }
  if (it.phase === 'running') {
    // Legging it for the cab (off the mark, up to a flat-out sprint)
    it.runV = Math.min(RUN_TOP, it.runV + 0.75);
    it.daleX = Math.min(doorStand(it.truckX), it.daleX + it.runV);
    if (it.daleX >= doorStand(it.truckX)) { it.phase = 'boarding'; it.boardT = it.t; }
  }
  if (it.phase === 'boarding') {
    const b = it.t - it.boardT;
    if (b === 2) playSound('click');
    if (b === BOARD.inside + 1) playSound('slam', 0.7);
    // (in over the seat)
    if (b > BOARD.stepUp && b <= BOARD.inside) it.daleX += 2.2;
    if (b >= BOARD.slam) { it.phase = 'driving'; it.goT = it.t; playSound('truckhorn'); shakeScreen(state, 6, 3); }
  }
  if (it.phase === 'driving') {
    if (it.t >= it.goT + GO_AFTER) { it.speed = Math.min(18, it.speed + 0.35); it.truckX += it.speed; }
    if (it.t === it.goT + GO_AFTER + 20) queueLines(state, talk, [{ who: 'meathead', text: "FEDS? I WISH, DALE. I'M WAY WORSE." }]);
    // Dust kicked up behind it
    if (it.speed > 1 && state.frame % 2 === 0) for (let i = 0; i < 2; i++) state.particles.push({ pos: { x: it.truckX + Math.random() * 20, y: 540 }, vel: { x: -1 - Math.random() * 3, y: -Math.random() * 2 }, life: 40, color: Math.random() < 0.5 ? '#D6A77A' : '#B5703D', size: 6 + Math.random() * 8 });
    if (it.t > it.goT + GO_AFTER + GONE_AFTER) it.phase = 'gone';
  }
  // The crate he dropped
  const cr = it.crate;
  if (cr && !cr.broke) {
    cr.vy += 0.6; cr.y += cr.vy;
    if (cr.y >= 550 - PILE_SIZE) { cr.y = 550 - PILE_SIZE; cr.broke = true; ctx.fx.spawnPowderExplosion({ x: cr.x, y: cr.y + PILE_SIZE / 2 }, 20); }
  }
  // Hands off the controls till he's in the cab (a cutscene till then: the HUD's put away)
  const p = state.player;
  // (not once the truck's gone, either: this is the frame it goes, and the scene's not run again after it)
  const scene = it.phase !== 'driving' && it.phase !== 'gone';
  if (scene) { p.inCutscene = true; it.held = true; }
  else if (it.held) { p.inCutscene = false; it.held = false; }
  return scene ? { ...NO_CONTROLS } : controls;
};

/** Dale in view (not in the cab yet). */
export const daleVisible = (it: Intro) => it.phase === 'loading' || it.phase === 'spotted' || it.phase === 'running' || it.phase === 'boarding';
