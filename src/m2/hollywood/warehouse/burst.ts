// THE BURST-IN (the coaster's launch: section.ts takeBurstIn): the throne-train comes through the warehouse's end wall
// in the white of the flight, tumbles down the stage and wrecks; a beat of the secret shoot in there (the sets lit, the
// crew frozen, the REVENGERS banner), a creak, and the walls all fall flat outward: the end wall out, the back wall
// away, the front one toward us (its shadow over the screen). Daylight; the public outside, staring in over them, phones
// up. Then who says what, in turn: somebody in the crowd, the AD on the bullhorn, him, the AD again to the crew. Then
// he's his own (the walls down for good: WALLS_MEMO). A cutscene: HUD hidden, SKIP >> for the lot.
//
// Launched in again later (the lever's still on): the walls are already down; he lands by the wreck, a line, on.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { hands, meatheadSays, takeBurstIn } from '../section';
import { X, GY, x0, WALLS_MEMO } from './layout';
import { whOf } from './state';
import { BURST, BACK_AGAIN, CROWD_GASP, AD_CLOSED, AD_CREW } from './lines';
import { adSay, crowdSay } from './talk';

/** Where the wreck stops (its middle). */
export const WRECK_X = 520;
export const wallsDown = (state: GameState) => !!state.stageMemo[WALLS_MEMO];

const done = (state: GameState, skipped: boolean) => {
  const b = whOf(state).burst, p = state.player;
  if (skipped) silenceAll();
  b.on = false; b.fall = 1; b.tx = X(WRECK_X); b.tv = 0; b.tilt = 1;
  state.stageMemo[WALLS_MEMO] = '1';
  p.inCutscene = false;
  state.cameraOverride = null;
};

/** The coaster's just put him here flying (once a launch): the burst-in, or (the walls already down) just a landing. */
export const takeLaunch = (state: GameState) => {
  if (!takeBurstIn()) return;
  const b = whOf(state).burst;
  playSound('crash', 1, -10); playSound('boom', 0.8, -6); shakeScreen(state, 16, 7);
  for (let k = 0; k < 30; k++) state.particles.push({ pos: { x: X(10), y: GY - 40 - Math.random() * 200 }, vel: { x: 3 + Math.random() * 8, y: -2 - Math.random() * 5 }, life: 40, color: ['#78716C', '#A8A29E', '#CA8A04', '#57534E'][k % 4], size: 3 + Math.random() * 5, grav: 0.35 });
  if (wallsDown(state)) { meatheadSays(state, pickLine(BACK_AGAIN), false); return; }
  // (it slides to a stop at WRECK_X: 600 px at 18 a frame, losing 3% a frame)
  Object.assign(b, { on: true, t: 0, fall: 0, tx: X(WRECK_X - 600), tv: 18, tilt: 0, step: 0 });
  state.player.inCutscene = true;
  state.camera.x = x0 - 40; state.camera.y = GY - 550;
  state.cameraOverride = { x: x0 - 40, y: GY - 550 };
};

export const updateBurst = (ctx: FrameContext): Controls | null => {
  const { state } = ctx, o = whOf(state), b = o.burst, p = state.player, f = state.frame;
  if (!b.on) return null;
  b.t++;
  p.inCutscene = true;
  if (b.t > SKIP_AFTER) { offerSkip(); if (takeSkip()) { done(state, true); return hands(); } }
  state.cameraOverride = { x: x0 - 40, y: GY - 550 };
  // The wreck: tumbling in, skidding to a stop on its side
  if (b.tv > 0.05) {
    b.tx += b.tv; b.tv *= 0.97; b.tilt = Math.min(1, b.tilt + 0.03);
    if (f % 3 === 0) state.particles.push({ pos: { x: b.tx - 60, y: GY - 6 }, vel: { x: -1 - Math.random() * 2, y: -2 - Math.random() * 3 }, life: 14, color: Math.random() < 0.5 ? '#FDE047' : '#F97316', size: 2, grav: 0.3 });
    if (f % 6 === 0) playSound('grind', 0.5, -4);
  } else b.tv = 0;
  // A beat; the creak; the walls going (outward, all of them); the daylight, the crowd
  if (b.t === 70) { playSound('rumble', 0.8, -10); shakeScreen(state, 30, 2); }
  if (b.t >= 100 && b.fall < 1) {
    b.fall = Math.min(1, b.fall + 0.022 + b.fall * 0.04);
    if (b.fall >= 1) {
      playSound('boom', 1, -12); playSound('crash', 1, -10); shakeScreen(state, 20, 8);
      for (let k = 0; k < 40; k++) state.particles.push({ pos: { x: x0 - 40 + Math.random() * CANVAS_WIDTH, y: GY - 60 - Math.random() * 30 }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 3 }, life: 50, color: 'rgba(168, 162, 158, 0.8)', size: 5 + Math.random() * 6 });
    }
  }
  // Then, in turn: the crowd, the AD, him, the AD to the crew
  if (b.fall >= 1 && b.step === 0 && b.t > 150) {
    b.step = 1;
    crowdSay(state, CROWD_GASP, x0 + 260, 3, () => adSay(state, AD_CLOSED, () => meatheadSays(state, pickLine(BURST), true, () => adSay(state, AD_CREW, () => { b.step = 2; }))));
  }
  // (the phones going off in the crowd)
  if (b.fall >= 1 && f % 9 === 0) o.flashes.push({ x: x0 - 40 + Math.random() * CANVAS_WIDTH, y: GY - 120 - Math.random() * 20, at: f });
  if ((b.step === 2 && b.t > 200) || b.t > 1500) done(state, false);
  return hands();
};

/** Screen space: the dim of the inside before the walls go, the front wall's shadow coming down over us, SKIP >>. */
export const drawBurstHud = (c: CanvasRenderingContext2D, state: GameState) => {
  const b = whOf(state).burst;
  if (!b.on) return;
  if (b.fall < 1) { c.fillStyle = `rgba(0, 0, 0, ${0.4 * (1 - b.fall)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  // (the white of the flight, going)
  if (b.t < 24) { c.fillStyle = `rgba(255, 255, 255, ${1 - b.t / 24})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  // (the fourth wall, coming down toward us: its shadow sweeping down the screen, then gone)
  if (b.fall > 0.3 && b.fall < 1) { const k = (b.fall - 0.3) / 0.7; c.fillStyle = `rgba(28, 25, 23, ${0.8 * (1 - k * 0.6)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT * k); }
  if (b.t > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
