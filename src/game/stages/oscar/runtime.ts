// Oscar's stage while it's being played: which part you're in, the oil in the
// field, the break room, the chase, the field office, and the fades between
// them. Rebuilt with the level on every (re)spawn; the checkpoint says what's
// behind you.

import type { GameState } from '../../core/state';
import type { FrameContext } from '../../core/context';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { makeKindEnemy, KIND_STATS } from '../../enemies/kinds';
import { groundLineAt } from '../../core/terrain';
import { CANVAS_WIDTH, GROUND_Y } from '../../../constants';
import { COURSE, CP, Place, placeOf } from './course';
import { Talk, createTalk, updateTalk, hush } from './script';
import { Field, createField, updateField, inCrude } from './field';
import { Bunker, createBunker, updateBunker } from './bunker';
import { Chase, createChase, updateChase, startChase, chaseDeathMessage } from './chase';
import { Ending, createEnding, updateEnding, startEnding, fenceEnd } from './ending';
import { mountMoto } from './moto';
import { Bar, createBar, updateBar } from './bar';

export interface OscarRuntime {
  startedAt: number;
  talk: Talk;
  field: Field;
  bunker: Bunker;
  chase: Chase;
  ending: Ending;
  bar: Bar;
  /** A cut to black and back: frames in, and what happens at the black. */
  fade: { t: number; at: (() => void) | null };
}

export const FADE_OUT = 36, FADE_HOLD = 24, FADE_IN = 36;
/** Nothing's placed closer than this ahead of where you start. */
const SPAWN_CLEARANCE = 480;

export const getOscar = (state: GameState) => state.stage as OscarRuntime | null;

const ORDER: Record<Place, number> = { field: 0, bunker: 1, outside: 2, chase: 3, end: 4 };

export const createOscarRuntime = (state: GameState, skipToBoss: boolean): OscarRuntime => {
  const startedAt = skipToBoss ? CP.BOSS : state.checkpoint;
  const start = COURSE.checkpoints[startedAt];
  const order = (x: number) => ORDER[placeOf(x)];
  const ahead = (x: number, clearance: number) => order(x) > order(start.x) || (order(x) === order(start.x) && x - start.x >= clearance);
  COURSE.pickups.forEach((p, i) => {
    // (the refill at the door's always there)
    if (!ahead(p.x, 0) && placeOf(p.x) !== 'end') return;
    state.pickups.push({ id: `oscar-pickup-${i}`, pos: { x: p.x - 10, y: p.y - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: p.type, life: 1e9 });
  });
  for (const s of COURSE.spawns) {
    if (!ahead(s.x, SPAWN_CLEARANCE)) continue;
    // (stood on the ground where it is: up a slope, say; or up on whatever it was put on)
    const g = groundLineAt(COURSE.runs, s.x);
    const air = KIND_STATS[s.kind].air;
    const e = makeKindEnemy(s.kind, s.x, air || s.y < g - 5 ? s.y : g);
    if (s.variant !== undefined) e.variant = s.variant;
    state.enemies.push(e);
  }
  const rt: OscarRuntime = {
    startedAt,
    talk: createTalk(),
    field: createField(state),
    bunker: createBunker(state, startedAt),
    chase: createChase(startedAt),
    ending: createEnding(startedAt),
    bar: createBar(state, startedAt),
    fade: { t: 0, at: null },
  };
  applyPlaceCamera(state, placeOf(start.x));
  if (startedAt === CP.CHASE) startChase(state, rt.chase);
  if (startedAt >= CP.END) fenceEnd(state);
  return rt;
};

/** Where the camera's allowed in each part of the world. */
export const applyPlaceCamera = (state: GameState, place: Place) => {
  const C = COURSE;
  if (place === 'chase') { state.cameraMinX = C.chase.x1; state.cameraMaxX = undefined; }
  else if (place === 'end') { state.cameraMinX = C.end.x1; state.cameraMaxX = undefined; }
  else { state.cameraMinX = C.field.x1; state.cameraMaxX = C.field.x2 - CANVAS_WIDTH; }
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
  state.enemies = state.enemies.filter(e => e.type === 'boss' || placeOf(e.pos.x) === place || ORDER[placeOf(e.pos.x)] > ORDER[place]);
  applyPlaceCamera(state, place);
  state.camera.x = Math.max(state.cameraMinX, x - 250);
  state.cameraRestY = y - 550; state.camera.y = state.cameraRestY;
};

export const startFade = (rt: OscarRuntime, at: () => void) => { rt.fade = { t: 1, at }; };

export const updateOscar = (ctx: FrameContext, controls: Controls): Controls => {
  const rt = getOscar(ctx.state);
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
  if (place === 'field' || place === 'bunker' || place === 'outside') {
    if (state.checkpoint < CP.FIELD_MID && p.isGrounded && p.pos.x > COURSE.checkpoints[CP.FIELD_MID].x) state.checkpoint = CP.FIELD_MID;
    if (state.checkpoint < CP.FIELD_MID2 && p.isGrounded && p.pos.x > COURSE.checkpoints[CP.FIELD_MID2].x) state.checkpoint = CP.FIELD_MID2;
    updateField(ctx, rt.field);
    // In the break room the camera holds on the room (it fits the screen)
    const B = COURSE.bunker, px = p.pos.x + p.width / 2;
    if ((rt.bunker.phase === 'break' || rt.bunker.phase === 'waiting') && px > B.x1 + 20 && px < B.x2) state.cameraOverride = { x: (B.x1 + B.x2) / 2 - CANVAS_WIDTH / 2, y: GROUND_Y - 550 };
    else if (rt.bunker.phase === 'break' || rt.bunker.phase === 'waiting') state.cameraOverride = null;
    controls = updateBunker(ctx, rt.bunker, rt.talk, controls, () => startFade(rt, () => {
      // Out across the field on the stolen hog: the chase
      arrive(state, COURSE.checkpoints[CP.CHASE].x, GROUND_Y);
      mountMoto(state);
      startChase(state, rt.chase);
    }));
  }
  if (place === 'chase' || rt.chase.phase === 'won') {
    controls = updateChase(ctx, rt.chase, rt.talk, controls, () => startFade(rt, () => {
      // The road comes out behind the field office
      rt.chase.phase = 'done';
      // (the chase's lot are gone; everything waiting out back of the field office stays)
      state.enemies = state.enemies.filter(e => e.type === 'boss' || placeOf(e.pos.x) === 'end');
      arrive(state, COURSE.end.smokers - 900, GROUND_Y);
      mountMoto(state, 0);
      startEnding(state, rt.ending, rt.talk);
    }));
  }
  if (place === 'end') {
    controls = updateEnding(ctx, rt.ending, rt.talk, controls);
    updateField(ctx, rt.field);
    controls = updateBar(ctx, rt.bar, rt.talk, controls);
    if (state.checkpoint < CP.END_MID && rt.ending.phase === 'done' && p.isGrounded && p.pos.x > COURSE.checkpoints[CP.END_MID].x) state.checkpoint = CP.END_MID;
  }
  return controls;
};

/** How black the screen is for a fade (0..1). */
export const fadeAmount = (rt: OscarRuntime) => {
  const t = rt.fade.t;
  if (t <= 0) return 0;
  if (t < FADE_OUT) return t / FADE_OUT;
  if (t < FADE_OUT + FADE_HOLD) return 1;
  return Math.max(0, 1 - (t - FADE_OUT - FADE_HOLD) / FADE_IN);
};

export const oscarDeathMessage = (ctx: FrameContext): string | undefined => {
  const rt = getOscar(ctx.state);
  if (!rt) return undefined;
  const pick = (l: string[]) => l[Math.floor(Math.random() * l.length)];
  if (inCrude(ctx.state)) return pick(['DROWNED IN CRUDE', 'FOSSIL FUEL', 'A BARREL A DAY', 'PART OF THE RESERVE NOW']);
  return chaseDeathMessage(rt.chase);
};
