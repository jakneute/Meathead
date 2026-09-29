// Out back of the field office, where the road comes out: two of the union
// having a smoke under the NO SMOKING sign, going on about the things that are
// wrong with their day. Meathead comes up the road on the chopper, backflips off
// it, and the bike carries on into the two of them and the wall they're stood
// against. He pulls the machine gun's trigger: nothing, it's empty. So it goes
// on the pile too. Then it's on to Oscar's door.

import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { shakeScreen } from '../../core/state';
import { playSound } from '../../platform/audio';
import { CANVAS_WIDTH, GROUND_Y } from '../../../constants';
import { COURSE, CP } from './course';
import { Talk, queueLines, quiet } from './script';
import { dismountMoto } from './moto';

export type EndPhase = 'waiting' | 'talk' | 'ridein' | 'flip' | 'landed' | 'toss' | 'done';

export interface Ending {
  phase: EndPhase;
  t: number;
  /** The bike: under him, then loose and heading for the wall, then a wreck at the foot of it. */
  bike: { x: number; vx: number; rot: number; state: 'ridden' | 'loose' | 'crashed' };
  /** Him, up in the air in the backflip (drawn turning: the real him's hidden till he lands). */
  flip: { x: number; y: number; vx: number; vy: number; rot: number };
  /** The two smokers: stood there, or paste on the wall. */
  smokers: 'smoking' | 'paste';
  splatAt: number;
  /** Dirty Dan's machine gun: in his hands, flung, or on the pile. */
  gun: { x: number; y: number; vx: number; vy: number; rot: number; state: 'held' | 'flying' | 'dumped' };
}

/** Where he comes in from (off the left of the screen), and where he goes up off the bike. */
const RIDE_FROM = -420, FLIP_AT = -300;

export const createEnding = (startedAt: number): Ending => ({
  phase: startedAt >= CP.END ? 'done' : 'waiting', t: 0,
  bike: { x: 0, vx: 0, rot: 0, state: startedAt >= CP.END ? 'crashed' : 'ridden' },
  flip: { x: 0, y: 0, vx: 0, vy: 0, rot: 0 },
  smokers: startedAt >= CP.END ? 'paste' : 'smoking', splatAt: -999,
  gun: { x: COURSE.end.wall - 44, y: GROUND_Y - 34, vx: 0, vy: 0, rot: 0.3, state: startedAt >= CP.END ? 'dumped' : 'held' },
});

/** Where the camera sits for it: the two of them and their wall on the right, the road in from the left. */
export const endCamX = () => COURSE.end.smokers + 420 - CANVAS_WIDTH;

/** Once it's over: no going back down the road (a wall at the left of where the camera sat for it, and the camera no further). */
export const fenceEnd = (state: GameState) => {
  const x = endCamX();
  state.cameraMinX = x;
  if (!state.blocks.some(b => b.tag === 'end-left')) state.blocks.push({ x: x - 60, y: GROUND_Y - 3000, w: 60, h: 3000, type: 'wall', hidden: true, tag: 'end-left' });
};

/** Straight in from the chase: him waiting just off the screen, on the bike, while they talk. */
export const startEnding = (state: GameState, en: Ending, talk: Talk) => {
  const p = state.player;
  en.phase = 'talk'; en.t = 0;
  p.hidden = true;
  p.pos.x = COURSE.end.smokers + RIDE_FROM - 400;
  p.skiSpeed = 0;
  queueLines(state, talk, [
    { who: 'smokerA', text: 'NOW THE COFFEE COMES IN LITTLE PODS.' },
    { who: 'smokerB', text: "PODS, CARL. LIKE WE'RE ASTRONAUTS." },
  ], 10);
};

export const updateEnding = (ctx: FrameContext, en: Ending, talk: Talk, controls: Controls): Controls => {
  const { state } = ctx;
  const p = state.player;
  en.t++;
  const S = COURSE.end.smokers;
  if (en.phase === 'done' || en.phase === 'waiting') {
    if (en.bike.state === 'loose') updateBike(ctx, en);
    return controls;
  }
  p.inCutscene = true;
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
  state.cameraOverride = { x: endCamX(), y: GROUND_Y - 550 };
  switch (en.phase) {
    case 'talk':
      p.skiSpeed = 0;
      if (en.t > 20 && quiet(talk)) { en.phase = 'ridein'; en.t = 0; p.hidden = false; p.pos.x = S + RIDE_FROM - 300; p.skiSpeed = 12; playSound('engine'); }
      break;
    case 'ridein':
      p.skiSpeed = 12;
      if (p.pos.x + p.width / 2 >= S + FLIP_AT) {
        // Up off the bike, over backwards; the bike carries on without him
        en.phase = 'flip'; en.t = 0;
        en.flip = { x: p.pos.x + p.width / 2, y: p.pos.y + p.height, vx: 2.2, vy: -15, rot: 0 };
        en.bike = { x: p.pos.x + p.width / 2, vx: 12, rot: 0, state: 'loose' };
        dismountMoto(state);
        // (the machine gun's still in his hands)
        state.lockWeapon = 'LMG'; p.currentWeapon = 'LMG';
        p.hidden = true;
      }
      break;
    case 'flip': {
      const fl = en.flip;
      fl.vy += 0.55; fl.x += fl.vx; fl.y += fl.vy;
      // (a whole turn, backwards, in the time he's up)
      fl.rot = -Math.min(1, en.t / 52) * Math.PI * 2;
      p.pos.x = fl.x - p.width / 2; p.pos.y = fl.y - p.height; p.vel = { x: 0, y: 0 };
      if (fl.vy > 0 && fl.y >= GROUND_Y) {
        en.phase = 'landed'; en.t = 0;
        p.pos.y = GROUND_Y - p.height; p.hidden = false; p.squash = 1; p.facing = 1;
        shakeScreen(state, 8, 4);
      }
      break;
    }
    case 'landed':
      if (en.t === 10) queueLines(state, talk, [{ who: 'meathead', text: 'SMOKING KILLS.' }]);
      if (en.t > 20 && quiet(talk)) { en.phase = 'toss'; en.t = 0; }
      break;
    case 'toss':
      // The trigger: nothing. Empty. On the pile with the rest of it
      if (en.t === 4 || en.t === 14) { ctx.fx.spawnDamageNumber({ x: p.pos.x + 30, y: p.pos.y - 20 - en.t }, 'CLICK', false, '#E5E7EB'); playSound('click'); }
      if (en.t === 26) {
        en.gun = { x: p.pos.x + p.width / 2 + 20, y: p.pos.y + 30, vx: (COURSE.end.wall - 44 - (p.pos.x + p.width / 2 + 20)) / 34, vy: -9, rot: 0, state: 'flying' };
        state.lockWeapon = undefined; p.currentWeapon = 'GUN';
        p.kickPose = 0;
      }
      if (en.gun.state === 'flying') {
        const g = en.gun;
        g.vy += 0.5; g.x += g.vx; g.y += g.vy; g.rot += 0.35;
        if (g.vy > 0 && g.y >= GROUND_Y - 34) { g.state = 'dumped'; g.y = GROUND_Y - 34; g.rot = 0.3; playSound('clang'); }
      }
      if (en.t > 64) {
        en.phase = 'done'; en.t = 0;
        p.inCutscene = false;
        state.cameraOverride = null;
        fenceEnd(state);
        state.checkpoint = Math.max(state.checkpoint, CP.END);
      }
      break;
  }
  if (en.bike.state === 'loose') updateBike(ctx, en);
  return { ...NO_CONTROLS };
};

/** The bike, riderless: straight on into the two of them, and the wall. */
const updateBike = (ctx: FrameContext, en: Ending) => {
  const { state } = ctx;
  const bk = en.bike;
  bk.x += bk.vx;
  bk.rot = Math.sin(en.t * 0.4) * 0.06;
  if (bk.x >= COURSE.end.smokers - 30 && en.smokers === 'smoking') {
    // Into them, and them into the wall
    en.smokers = 'paste'; en.splatAt = state.frame;
    shakeScreen(state, 30, 12);
    playSound('crash'); playSound('splat');
    for (let i = 0; i < 60; i++) state.particles.push({ pos: { x: COURSE.end.wall - 10, y: GROUND_Y - 30 - Math.random() * 70 }, vel: { x: -Math.random() * 7, y: -2 - Math.random() * 7 }, life: 40 + Math.random() * 30, color: ['#7F1D1D', '#B91C1C', '#DC2626', '#F8FAFC', '#FACC15', '#F97316'][i % 6], size: 3 + Math.random() * 6 });
  }
  if (bk.x >= COURSE.end.wall - 36) { bk.x = COURSE.end.wall - 36; bk.vx = 0; bk.state = 'crashed'; bk.rot = 0.5; }
};

/** How much of the flip's gone (for drawing him turning). */
export const flipOf = (en: Ending) => (en.phase === 'flip' ? en.flip : null);
