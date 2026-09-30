// Tommy's stage while it's being played: which part you're in, the bike, the
// sewer, the thing in the cistern, the way out, and the fades between them.
// Rebuilt with the level on every (re)spawn; the checkpoint says what's behind you.

import { deathByCause } from '../../core/deathCause';
import type { GameState } from '../../core/state';
import type { FrameContext } from '../../core/context';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { makeKindEnemy } from '../../enemies/kinds';
import { CANVAS_WIDTH } from '../../../constants';
import { COURSE, CP, Place, placeOf, RUINS_Y } from './course';
import { Talk, createTalk, updateTalk, hush, queueLines } from './script';
import { shakeScreen } from '../../core/state';
import { playSound } from '../../platform/audio';
import { BikeRun, createBikeRun, updateBikeRun, bikeDeathMessage } from './bike';
import { Sewer, createSewer, updateSewer } from './sewer';
import { Thing, createThing, updateThingRoom, thingDeathMessage } from './thing';
import { Escape, createEscape, updateEscape, escapeDeathMessage, startEscape } from './escape';
import { Block, createBlock, updateBlock } from './block';

export interface TommyRuntime {
  startedAt: number;
  talk: Talk;
  /** The block before the corner: the mains blowing. */
  block: Block;
  bike: BikeRun;
  sewer: Sewer;
  thing: Thing;
  escape: Escape;
  /** Down the manhole into the sewer: still falling, or flat out seeing stars. */
  sewerFall: 'falling' | 'dazed' | null;
  /** A cut to black and back (into the sewer): frames in, and what happens at the black. */
  fade: { t: number; at: (() => void) | null };
}

/** The fade: frames to black, held, frames back. */
export const FADE_OUT = 36, FADE_HOLD = 24, FADE_IN = 36;
/** Nothing's placed closer than this ahead of where you start. */
const SPAWN_CLEARANCE = 480;

export const getTommy = (state: GameState) => state.stage as TommyRuntime | null;

const ORDER: Record<Place, number> = { hood: 0, road: 1, sewer: 2, tunnel: 3, cistern: 4, ruins: 5 };

export const createTommyRuntime = (state: GameState, skipToBoss: boolean): TommyRuntime => {
  const startedAt = skipToBoss ? CP.RUINS : state.checkpoint;
  const start = COURSE.checkpoints[startedAt];
  const order = (x: number) => ORDER[placeOf(x)];
  const ahead = (x: number, clearance: number) => order(x) > order(start.x) || (order(x) === order(start.x) && x - start.x >= clearance);
  COURSE.pickups.forEach((p, i) => {
    if (!ahead(p.x, 0)) return;
    state.pickups.push({ id: `tommy-pickup-${i}`, pos: { x: p.x - 10, y: p.y - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: p.type, life: 1e9 });
  });
  for (const s of COURSE.spawns) {
    if (!ahead(s.x, SPAWN_CLEARANCE)) continue;
    const e = makeKindEnemy(s.kind, s.x, s.y);
    if (s.variant !== undefined) e.variant = s.variant;
    // (a fish keeps to the water it's in)
    if (s.kind === 'mutantfish') { const c = COURSE.channels.find(ch => s.x > ch.x1 && s.x < ch.x2); if (c) e.swimBox = { x1: c.x1, x2: c.x2, y1: c.surface, y2: c.floor }; }
    state.enemies.push(e);
  }
  const rt: TommyRuntime = {
    startedAt,
    talk: createTalk(),
    block: createBlock(),
    bike: createBikeRun(state, startedAt),
    sewer: createSewer(startedAt),
    thing: createThing(state, startedAt),
    escape: createEscape(state, startedAt),
    fade: { t: 0, at: null },
    sewerFall: null,
  };
  applyPlaceCamera(state, placeOf(start.x));
  return rt;
};

/** Where the camera's allowed in each part of the world. */
export const applyPlaceCamera = (state: GameState, place: Place) => {
  const C = COURSE;
  if (place === 'hood' || place === 'road') { state.cameraMinX = C.hood.x1; state.cameraMaxX = C.road.x2 - CANVAS_WIDTH; }
  else if (place === 'ruins') { state.cameraMinX = C.ruins.x1; state.cameraMaxX = undefined; }
  else { state.cameraMinX = C.sewer.x1; state.cameraMaxX = C.sewer.x2 - CANVAS_WIDTH; }
};

/** Put him somewhere (the next part), the camera with him, nothing from where he was following him. */
export const arrive = (state: GameState, x: number, y: number) => {
  const p = state.player;
  p.pos = { x: x - p.width / 2, y: y - p.height };
  p.vel = { x: 0, y: 0 };
  p.facing = 1;
  p.hidden = false;
  p.inCutscene = false;
  p.kickPose = 0;
  state.projectiles = [];
  state.cameraOverride = null;
  const place = placeOf(x);
  state.enemies = state.enemies.filter(e => e.type === 'boss' || placeOf(e.pos.x) === place || (ORDER[placeOf(e.pos.x)] > ORDER[place]));
  applyPlaceCamera(state, place);
  state.camera.x = Math.max(state.cameraMinX, x - 250);
  state.cameraRestY = Math.min(y, RUINS_Y + 3000) - 550; state.camera.y = state.cameraRestY;
};

export const startFade = (rt: TommyRuntime, at: () => void) => { rt.fade = { t: 1, at }; };

export const updateTommy = (ctx: FrameContext, controls: Controls): Controls => {
  const rt = getTommy(ctx.state);
  if (!rt) return controls;
  const { state } = ctx;
  const p = state.player;
  updateTalk(state, rt.talk);
  if ((p.kickPose || 0) > 0) p.kickPose!--;
  if (rt.fade.t > 0) {
    rt.fade.t++;
    if (rt.fade.t === FADE_OUT) { hush(state, rt.talk); rt.fade.at?.(); rt.fade.at = null; }
    if (rt.fade.t > FADE_OUT + FADE_HOLD + FADE_IN) rt.fade.t = 0;
    if (rt.fade.t < FADE_OUT + FADE_HOLD / 2) return { ...NO_CONTROLS };
  }
  const place = placeOf(p.pos.x);
  // On foot down the block: the mains going off, the flooded holes (the sewer's muck, the same stuff)
  if (place === 'hood' && rt.bike.phase === 'waiting') {
    updateBlock(ctx, rt.block);
    updateSewer(ctx, rt.sewer, rt.talk);
    if (state.checkpoint < CP.BLOCK && p.isGrounded && p.pos.x > COURSE.checkpoints[CP.BLOCK].x) state.checkpoint = CP.BLOCK;
  }
  if (place === 'hood' || place === 'road') {
    if (state.checkpoint < CP.ROAD_MID && rt.bike.phase === 'riding' && p.pos.x >= COURSE.checkpoints[CP.ROAD_MID].x) state.checkpoint = CP.ROAD_MID;
    controls = updateBikeRun(ctx, rt.bike, rt.talk, controls, () => startFade(rt, () => {
      // Down the manhole: into the sewer, falling in through a hole in its roof
      state.checkpoint = Math.max(state.checkpoint, CP.SEWER);
      arrive(state, COURSE.sewer.drop, COURSE.checkpoints[CP.SEWER].y - 380);
      p.vel.y = 6;
      rt.sewerFall = 'falling';
    }));
  }
  if (rt.sewerFall === 'falling') {
    // Flailing all the way down, then flat on the walkway seeing stars
    p.hurtTimer = Math.max(p.hurtTimer || 0, 10);
    if (p.isGrounded) {
      rt.sewerFall = 'dazed';
      p.hurtTimer = 0;
      state.playerStunTimer = 100;
      p.squash = 1;
      shakeScreen(state, 16, 8); playSound('slam');
      for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: p.pos.x + p.width / 2, y: p.pos.y + p.height - 3 }, vel: { x: (Math.random() - 0.5) * 9, y: -Math.random() * 5 }, life: 26, color: i % 2 ? '#65A30D' : '#57534E', size: 3 + Math.random() * 5 });
      queueLines(state, rt.talk, [{ who: 'meathead', text: 'UGH... MY EVERYTHING.' }], 20);
    }
    controls = { ...NO_CONTROLS };
  } else if (rt.sewerFall === 'dazed') {
    if (state.playerStunTimer <= 0) rt.sewerFall = null;
    controls = { ...NO_CONTROLS };
  }
  if (place === 'sewer' || place === 'tunnel' || place === 'cistern') {
    updateSewer(ctx, rt.sewer, rt.talk);
    if (state.checkpoint < CP.CISTERN && p.isGrounded && p.pos.x > COURSE.checkpoints[CP.CISTERN].x) state.checkpoint = CP.CISTERN;
  }
  if (place === 'cistern') controls = updateThingRoom(ctx, rt.thing, rt.talk, controls, () => startEscape(rt.escape));
  controls = updateEscape(ctx, rt.escape, rt.talk, controls);
  const ep = rt.escape.phase;
  p.suit = rt.sewer.suitOn || ep === 'suit' || ep === 'blast' || (ep === 'melt' && rt.escape.t < 60);
  return controls;
};

/** How black the screen is for a fade (0..1). */
export const fadeAmount = (rt: TommyRuntime) => {
  const t = rt.fade.t;
  if (t <= 0) return 0;
  if (t < FADE_OUT) return t / FADE_OUT;
  if (t < FADE_OUT + FADE_HOLD) return 1;
  return Math.max(0, 1 - (t - FADE_OUT - FADE_HOLD) / FADE_IN);
};

export const tommyDeathMessage = (ctx: FrameContext): string | undefined => {
  const rt = getTommy(ctx.state);
  if (!rt) return undefined;
  // (what got him in particular first; the ride and the rest are the catch-alls)
  return deathByCause(ctx.state) ?? bikeDeathMessage(rt.bike) ?? thingDeathMessage(rt.thing) ?? escapeDeathMessage(rt.escape);
};
