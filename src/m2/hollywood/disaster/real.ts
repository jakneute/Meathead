// REAL DISASTERS (EXPERIMENTAL): the booth's lever flipped. A cutscene (HUD hidden, SKIP >> for the lot): the cut to
// the whole room, and the narrator's loop again, every effect going real in turn, in his same deadpan: the room
// QUAKES (him thrown, the walls cracking, the guests down), the heater ERUPTS (the screen on fire), the fan tears loose
// and the cow flies (the TORNADO), the AC frosts the walls (the BLIZZARD), the screen bursts and the water comes out of
// it (the FLOOD); "HERE'S EVERYTHING." and the far wall goes, out flat onto the backlot under a red sky. The sleeper
// wakes up ("WHAT'D I MISS?") and the lighting truss comes down on the booth. Him; the narrator's thanks. Then he's
// his own, in the wreck, the way on out through the hole (the havoc).
//
// Any of the ride's staff still about in there die in it. Kept across his deaths: REAL_DISASTERS_MEMO (section.ts:
// the lot's weather follows it).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { hazardKill } from '../../hazardHit';
import { hands, meatheadSays, speak, setRealDisasters, realDisastersOn, saidOver } from '../section';
import { X, Y, R, GY, FX, SCREEN, THEATER, FAR_WALL, BOOTH, CAT_R, COW_AT } from './layout';
import { dzOf, type Dz } from './state';
import { narrate } from './show';
import { LEVER, REAL, REAL_AFTER, SLEEPER, SLEEPER_LEVER, SLEEPER_WAKE } from './lines';

/** The wide shot: about this world point, pulled back. */
export const WIDE = { x: X(4400), y: GY - 330, scale: 0.42 };

/** The room's wrecked (the lever's been pulled: the cutscene's done, or going). */
export const wrecked = (state: GameState) => realDisastersOn(state);
export const realOn = (state: GameState) => dzOf(state).real.phase === 'on';

/** Everything as it's left (a respawn, a skip, the end). */
export const wreckAll = (o: Dz) => {
  const r = o.real;
  r.crack = 1; r.fire = 1; r.frost = 1; r.flood = 1; r.wall = 1; r.truss = 1; r.squashed = true; r.fan = null; r.cow = null; r.shake = 0;
};
const killTheater = (ctx: FrameContext) => {
  for (const e of ctx.state.enemies) {
    if (e.health <= 0 || e.isBlownAway || e.type === 'boss') continue;
    const rx = R(e.pos.x + e.width / 2);
    if (rx > THEATER.a && rx < THEATER.b) hazardKill(ctx, e, X(4100), 'REAL DISASTER!', { fling: { x: (Math.random() - 0.3) * 14, y: -12 - Math.random() * 6 }, sound: 'crunch' });
  }
};
const dropWall = (state: GameState, o: Dz) => {
  if (o.wall) { const i = state.blocks.indexOf(o.wall); if (i >= 0) state.blocks.splice(i, 1); o.wall = null; }
};

type Who = 'him' | 'narr' | 'sleeper' | 'none';
interface Step { who: Who; line: () => string; min: number; start?: (ctx: FrameContext, o: Dz) => void }
const STEPS: Step[] = [
  { who: 'him', line: () => pickLine(LEVER), min: 40, start: ({ state }) => { playSound('clang', 1, -8); playSound('alarm', 0.6, 2); shakeScreen(state, 8, 2); } },
  { who: 'sleeper', line: () => SLEEPER_LEVER, min: 20 },
  {
    who: 'narr', line: () => REAL.quake, min: 160,
    start: (ctx) => { playSound('rumble', 1, -14); playSound('crack', 0.8, -4); ctx.state.player.vel.y = -7; killTheater(ctx); },
  },
  { who: 'narr', line: () => REAL.volcano, min: 130, start: () => { playSound('ignite', 1, -6); playSound('boom', 0.6, -2); } },
  {
    who: 'narr', line: () => REAL.tornado, min: 120,
    start: (_ctx, o) => {
      playSound('whoosh', 1, -10); playSound('crash', 0.5, 4);
      o.real.fan = { x: X(FX.fan), y: Y(50), vx: 7, vy: -13, rot: 0 };
      o.real.cow = { x: X(COW_AT.x), y: Y(COW_AT.h) + 30, vx: 6, vy: -4, rot: 0 };
    },
  },
  { who: 'narr', line: () => REAL.blizzard, min: 110, start: () => { playSound('ice', 0.9, -6); playSound('whoosh', 0.6, 8); } },
  { who: 'narr', line: () => REAL.flood, min: 130, start: () => { playSound('glass', 1, -6); playSound('tsunami', 0.9, -2); } },
  {
    who: 'narr', line: () => REAL.all, min: 170,
    start: ({ state }) => { playSound('rumble', 1, -16); playSound('crack', 1, -8); state.player.vel.y = -6; },
  },
  { who: 'sleeper', line: () => SLEEPER_WAKE, min: 20 },
  { who: 'none', line: () => '', min: 60, start: () => playSound('crack', 0.8, 2) },
  { who: 'him', line: () => pickLine(REAL_AFTER), min: 30 },
  { who: 'narr', line: () => REAL.thanks, min: 20 },
];

const go = (ctx: FrameContext, o: Dz, i: number) => {
  const r = o.real, state = ctx.state;
  r.step = i; r.t = 0; r.done = false;
  const s = STEPS[i];
  s.start?.(ctx, o);
  const done = () => { r.done = true; };
  if (s.who === 'none') r.done = true;
  else if (s.who === 'him') meatheadSays(state, s.line(), true, done);
  else if (s.who === 'narr') narrate(state, s.line(), undefined, done);
  else speak(SLEEPER, s.line(), t => { o.sleeper = t; }, true, done);
};

/** The lever's pulled: on. */
export const startReal = (ctx: FrameContext) => {
  const { state } = ctx, o = dzOf(state), r = o.real, p = state.player;
  if (r.phase !== 'off') return;
  setRealDisasters(state);
  Object.assign(r, { phase: 'on', step: 0, t: 0, all: 0, done: false, fade: 0 });
  p.inCutscene = true; p.vel.x = 0;
  o.narr = null;
  go(ctx, o, 0);
};

const finish = (ctx: FrameContext, skipped: boolean) => {
  const { state } = ctx, o = dzOf(state), r = o.real, p = state.player;
  if (skipped) { silenceAll(); o.narr = null; o.sleeper = null; o.guestSaid = null; }
  killTheater(ctx);
  wreckAll(o); dropWall(state, o);
  r.phase = 'done'; r.fade = 0;
  p.inCutscene = false; p.vel.x = 0;
  // (back on the balcony, by the lever, if the quake threw him off it)
  if (p.pos.y + p.height > Y(CAT_R.h) + 4 || Math.abs(R(p.pos.x + p.width / 2) - BOOTH.lever) > 200) { p.pos.x = X(BOOTH.lever - 60) - p.width / 2; p.pos.y = Y(CAT_R.h) - p.height; p.vel.y = 0; }
  state.cameraOverride = null;
  state.camera.y = Y(CAT_R.h) - 550; state.cameraRestY = state.camera.y;
};

export const updateReal = (ctx: FrameContext): Controls | null => {
  const { state } = ctx, o = dzOf(state), r = o.real, p = state.player, f = state.frame;
  if (r.phase !== 'on') return null;
  r.t++; r.all++;
  p.inCutscene = true;
  if (r.all > SKIP_AFTER) { offerSkip(); if (takeSkip()) { finish(ctx, true); return hands(); } }
  // The cut to the wide shot (a blink of black)
  r.fade = r.all < 10 ? r.all / 10 : r.all < 24 ? 1 - (r.all - 10) / 14 : 0;
  if (r.all >= 10) {
    state.camera.x = WIDE.x - CANVAS_WIDTH / 2; state.camera.y = WIDE.y - CANVAS_HEIGHT / 2;
    state.cameraOverride = { x: state.camera.x, y: state.camera.y };
  }
  const st = r.step;
  // The quake: the shake (the whole time from here, easing off), the cracks, dust off the ceiling
  if (st >= 2) {
    const mag = st === 2 ? 7 : st === 7 ? 6 : 2.2;
    if (f % 4 === 0 && st <= 7) shakeScreen(state, 5, mag);
    if (st === 2) r.crack = Math.min(1, r.crack + 0.012);
    if (st <= 7 && f % 3 === 0) state.particles.push({ pos: { x: X(THEATER.a + Math.random() * (THEATER.b - THEATER.a)), y: Y(THEATER.ceil) + 4 }, vel: { x: 0, y: 1 + Math.random() * 2 }, life: 60, color: 'rgba(168, 162, 158, 0.8)', size: 2 + Math.random() * 3 });
  }
  // The volcano: the heater's eruption, the screen catching
  if (st >= 3) {
    if (st === 3) r.fire = Math.min(1, r.fire + 0.01);
    if (f % 2 === 0) state.particles.push({ pos: { x: X(FX.heater) + (Math.random() - 0.5) * 30, y: Y(50) }, vel: { x: (Math.random() - 0.5) * 2, y: -3 - Math.random() * (st === 3 ? 7 : 3) }, life: 30, color: ['#F97316', '#FDE047', '#DC2626'][f % 3], size: 3 + Math.random() * 4 });
    if (r.fire > 0.3 && f % 3 === 0) state.particles.push({ pos: { x: X(SCREEN.a + Math.random() * (SCREEN.b - SCREEN.a)), y: Y(SCREEN.hi) + 10 }, vel: { x: (Math.random() - 0.5), y: -2 - Math.random() * 2 }, life: 34, color: ['#F97316', '#FDE047', '#B91C1C'][f % 3], size: 3 + Math.random() * 3 });
  }
  // The tornado: the fan and the cow, flying; the wind
  for (const k of ['fan', 'cow'] as const) {
    const t = r[k];
    if (!t) continue;
    t.vy += 0.32; t.x += t.vx; t.y += t.vy; t.rot += k === 'fan' ? 0.4 : 0.22;
    if (t.y > GY - 10 && t.vy > 0) { t.vy *= -0.5; t.vx *= 0.7; t.y = GY - 10; playSound('thud', 0.5, k === 'cow' ? -10 : 4); }
    if (Math.abs(t.vx) < 0.3 && Math.abs(t.vy) < 1) r[k] = null;
  }
  if (st === 4 && f % 2 === 0) state.particles.push({ pos: { x: X(THEATER.a + Math.random() * 600 + 1000), y: Y(60 + Math.random() * 400) }, vel: { x: 9 + Math.random() * 5, y: (Math.random() - 0.5) * 2 }, life: 24, color: 'rgba(226, 232, 240, 0.6)', size: 2 });
  // The blizzard: the frost spreading, snow in the room
  if (st >= 5) {
    if (st === 5) r.frost = Math.min(1, r.frost + 0.011);
    if (st <= 7 && f % 2 === 0) state.particles.push({ pos: { x: X(FX.ac + (Math.random() - 0.5) * 1400), y: Y(THEATER.ceil - 20) }, vel: { x: 1 + Math.random() * 2, y: 1.5 + Math.random() }, life: 120, color: '#F8FAFC', size: 2 + Math.random() * 2 });
  }
  // The flood: out of the screen
  if (st >= 6) {
    if (st === 6) r.flood = Math.min(1, r.flood + 0.012);
    if (st <= 8) for (let i = 0; i < 2; i++) state.particles.push({ pos: { x: X(SCREEN.a + 200 + Math.random() * (SCREEN.b - SCREEN.a - 400)), y: Y(SCREEN.lo + 40) }, vel: { x: (Math.random() - 0.5) * 3, y: 1 + Math.random() * 2 }, life: 40, color: i ? '#60A5FA' : '#BFDBFE', size: 3 + Math.random() * 3 });
  }
  // Everything: the far wall, out flat
  if (st === 7 && r.t > 40 && r.wall < 1) {
    r.wall = Math.min(1, r.wall + 0.012 + r.wall * 0.05);
    if (r.wall >= 1) {
      dropWall(state, o);
      playSound('boom', 1, -12); playSound('crash', 1, -8); shakeScreen(state, 24, 9);
      for (let k = 0; k < 40; k++) state.particles.push({ pos: { x: X(FAR_WALL + 40 + Math.random() * 360), y: GY - 10 - Math.random() * 40 }, vel: { x: (Math.random() - 0.3) * 6, y: -1 - Math.random() * 4 }, life: 60, color: 'rgba(168, 162, 158, 0.85)', size: 5 + Math.random() * 6 });
    }
  }
  // The truss, down on the booth (once he's awake)
  if (st === 9 && r.truss < 1) {
    r.truss = Math.min(1, r.truss + 0.05 + r.truss * 0.1);
    if (r.truss >= 1 && !r.squashed) {
      r.squashed = true;
      playSound('crash', 1, -4); playSound('crunch', 1, -2); playSound('splat', 0.9, -4); shakeScreen(state, 10, 5);
      for (let k = 0; k < 24; k++) state.particles.push({ pos: { x: X(BOOTH.cab + 120), y: Y(CAT_R.h) - 40 }, vel: { x: (Math.random() - 0.5) * 8, y: -2 - Math.random() * 6 }, life: 40, color: ['#B91C1C', '#7F1D1D', '#DC2626'][k % 3], size: 2 + Math.random() * 3, grav: 0.35 });
    }
  }
  // On, step by step: each when its line's done and it's had its moment
  const s = STEPS[st];
  if ((r.done && r.t >= s.min && (st !== 7 || r.wall >= 1) && (st !== 9 || r.squashed)) || r.t > 900) {
    if (st + 1 < STEPS.length) go(ctx, o, st + 1);
    else { finish(ctx, false); return hands(); }
  }
  return hands();
};

/** World point to the screen in the wide shot. */
const onScreen = (x: number, y: number) => ({ x: (x - WIDE.x) * WIDE.scale + CANVAS_WIDTH / 2, y: (y - WIDE.y) * WIDE.scale + CANVAS_HEIGHT / 2 });

/** Screen space: the cut, the words (whole, readable: the wide shot's too small for them), SKIP >>. */
export const drawRealHud = (c: CanvasRenderingContext2D, state: GameState) => {
  const o = dzOf(state), r = o.real;
  if (r.phase !== 'on') return;
  if (r.all >= 10) {
    if (o.narr) saidOver(c, o.narr.text, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40, '#FDE68A', 560);
    if (o.sleeper) { const at = onScreen(X(BOOTH.cab + 150), Y(CAT_R.h) - 150); saidOver(c, o.sleeper.text, at.x, at.y, '#BAE6FD', 260); }
  }
  if (r.fade > 0) { c.fillStyle = `rgba(0, 0, 0, ${r.fade})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  if (r.all > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
