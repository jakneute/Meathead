// THE FLING (a cutscene: HUD hidden, SKIP >> for the lot). Past the first aid station the tornado surges and gets him:
// he's lifted, spinning, up round the funnel (tumbling: Player.freefall), up into the junk it's carrying (a cow, the
// HAPPYWOOD letters, a porta-potty, Steve's standee); round and round up top while he says his piece; then it spits him
// out, high over the park, off toward Stuntman Steve's stage (a cut in the black: he's high over the stage's way in,
// DOORS.stunt.start, and the stunt intro brings him down, all accidental flips and twists: stunt/fight.ts 'land'). Up top he says what he thinks of a SAFE tornado launching zone,
// the user's line, verbatim. Once it's done the tornado's spent (FLUNG_MEMO: the revisit's calm).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { hazardVictims, hazardKill } from '../../hazardHit';
import { hands, meatheadSays, teleport } from '../section';
import { DOORS, GY } from '../geometry';
import { Y } from './layout';
import { hvOf, FLUNG_MEMO } from './state';
import { tornadoBase } from './chase';
import { CAUGHT, SPIN, FLUNG } from './lines';
import { FLUNG_IN, LAND_FALL } from '../stunt/state';

export const flinging = (state: GameState) => { const s = hvOf(state).fling.step; return s !== 'off' && s !== 'done'; };

/** It's got him: on. */
export const startFling = (ctx: FrameContext) => {
  const { state } = ctx, hv = hvOf(state), fl = hv.fling, p = state.player, t = hv.tornado;
  if (fl.step !== 'off') return;
  Object.assign(fl, { step: 'caught', t: 0, all: 0, lineDone: false, fade: 0, cx: t.x, cy: Y(tornadoBase(t.x)), ang: Math.PI, r: 30 });
  t.hold = 99999;
  p.inCutscene = true; p.carried = true; p.vel.x = 0; p.vel.y = 0;
  p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false; p.isDucking = false;
  p.freefall = { style: 'flail', t: 0, rot: 0, land: 0 };
  playSound('whirl', 1, -8); playSound('whoosh', 1, -14);
  meatheadSays(state, pickLine(CAUGHT), false);
  // (anybody about goes up with him)
  for (const e of hazardVictims(state)) if (Math.abs(e.pos.x - t.x) < 900) hazardKill(ctx, e, t.x, 'SUCKED UP!', { fling: { x: (Math.random() - 0.5) * 10, y: -22 }, sound: 'whirl' });
};

const finish = (ctx: FrameContext, skipped: boolean) => {
  const { state } = ctx, hv = hvOf(state), fl = hv.fling, p = state.player;
  if (skipped) silenceAll();
  state.stageMemo[FLUNG_MEMO] = '1';
  fl.step = 'done'; fl.fade = 0;
  hv.tornado.on = false;
  p.spriteRot = undefined;
  state.cameraOverride = null;
  // (high over the stunt stage's way in, still tumbling: the stunt intro's landing brings him down, all flips)
  const to = DOORS.stunt.start;
  teleport(state, to.x, to.y - LAND_FALL.h);
  p.freefall = { style: 'flail', t: 0, rot: 0, land: 0 }; p.carried = true; p.inCutscene = true;
  FLUNG_IN.on = true;
  state.camera.y = to.y - 550; state.cameraRestY = state.camera.y;
  playSound('whoosh', 1, -6);
};

/** Each frame of it (null: it's not on). */
export const updateFling = (ctx: FrameContext): Controls | null => {
  const { state } = ctx, hv = hvOf(state), fl = hv.fling, p = state.player;
  if (fl.step === 'off' || fl.step === 'done') return null;
  fl.t++; fl.all++;
  p.inCutscene = true; p.carried = true;
  if (fl.all > SKIP_AFTER) { offerSkip(); if (takeSkip()) { finish(ctx, true); return hands(); } }
  const ff = p.freefall;
  const put = (x: number, y: number) => { p.pos.x = x - p.width / 2; p.pos.y = y - p.height / 2; };
  if (fl.step === 'caught') {
    // Up round the funnel, the turns widening as he goes up
    fl.ang += 0.2; fl.r = 30 + fl.t * 1.3;
    const up = 50 + fl.t * 5.2;
    put(fl.cx + Math.sin(fl.ang) * fl.r, fl.cy - up);
    if (ff) ff.rot += 0.2;
    p.facing = Math.cos(fl.ang) > 0 ? 1 : -1;
    if (fl.t % 20 === 0) playSound('whirl', 0.8, -6 + fl.t / 20);
    if (fl.t >= 72) {
      fl.step = 'spin'; fl.t = 0; fl.lineDone = false;
      const done = () => { fl.lineDone = true; };
      meatheadSays(state, pickLine(SPIN), true, done);
    }
  } else if (fl.step === 'spin') {
    // Round and round up top, the junk going round with him, while he says his piece
    fl.ang += 0.12; fl.r = 120 + Math.sin(fl.t * 0.05) * 20;
    const up = 430 + Math.sin(fl.t * 0.04) * 26;
    put(fl.cx + Math.sin(fl.ang) * fl.r, fl.cy - up);
    if (ff) ff.rot += 0.12;
    p.facing = Math.cos(fl.ang) > 0 ? 1 : -1;
    if (fl.t % 30 === 0) playSound('whirl', 0.6, -10);
    if ((fl.lineDone && fl.t >= 110) || fl.t > 1500) {
      fl.step = 'flung'; fl.t = 0;
      p.vel.x = 16; p.vel.y = -9; p.facing = 1;
      playSound('whoosh', 1, -4); playSound('screams', 0.5, 0);
      meatheadSays(state, pickLine(FLUNG), false);
    }
  } else if (fl.step === 'flung') {
    // Spat out, high over the park
    p.vel.y += 0.16;
    put(p.pos.x + p.width / 2 + p.vel.x, p.pos.y + p.height / 2 + p.vel.y);
    if (ff) ff.rot += 0.3;
    if (fl.t > 46) fl.fade = Math.min(1, (fl.t - 46) / 26);
    if (fl.t >= 74) { fl.step = 'cut'; fl.t = 0; fl.fade = 1; }
  } else if (fl.step === 'cut') {
    fl.fade = 1;
    if (fl.t >= 16) { finish(ctx, false); return hands(); }
  }
  // The camera on him (up there it's all sky)
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  state.cameraOverride = { x: cx - CANVAS_WIDTH / 2, y: Math.min(GY - 550, cy - CANVAS_HEIGHT / 2 - 40) };
  state.camera.x = state.cameraOverride.x; state.camera.y += (state.cameraOverride.y - state.camera.y) * 0.25;
  return hands();
};

/** Screen space: the cut to black, SKIP >>. */
export const drawFlingHud = (c: CanvasRenderingContext2D, state: GameState) => {
  const fl = hvOf(state).fling;
  if (fl.step === 'off' || fl.step === 'done') return;
  if (fl.fade > 0) { c.fillStyle = `rgba(0, 0, 0, ${fl.fade})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  if (fl.all > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
