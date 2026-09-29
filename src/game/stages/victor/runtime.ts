// Victor's stage while it's being played: which part you're in, the hazards, the
// doorman, getting into the club (and the volcano), the window at the top of the
// shaft and the lounge. Rebuilt with the level on every (re)spawn; the
// checkpoint says what's behind you.

import type { GameState } from '../../core/state';
import type { FrameContext } from '../../core/context';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { makeKindEnemy } from '../../enemies/kinds';
import { playSound } from '../../platform/audio';
import { COURSE, CP } from './course';
import { CANVAS_WIDTH } from '../../../constants';
import { Hazards, createHazards, updateHazards } from './hazards';
import { DoormanFight, createDoormanFight, updateDoormanFight } from './doorman';
import { Lounge, createLounge, startCrash, updateLounge } from './lounge';

/** How fast the view slides over to the shaft's left wall when he starts up it (and back when he's down again), a frame. */
const SHAFT_CAMERA_SLIDE = 24;

export interface VictorRuntime {
  startedAt: number;
  hazards: Hazards;
  doorman: DoormanFight;
  lounge: Lounge;
  /** Through the club doors: frames of the fade (0 = not). */
  enterT: number;
}

export type Region = 'main' | 'inside' | 'lounge';
export const regionOf = (x: number): Region => (x >= COURSE.lounge.x1 - 200 ? 'lounge' : x < COURSE.inside.x2 + 400 ? 'inside' : 'main');

/** Nothing's placed closer than this ahead of where you start. */
const SPAWN_CLEARANCE = 480;
const ENTER_FRAMES = 50;

export const getVictor = (state: GameState) => state.stage as VictorRuntime | null;

export const createVictorRuntime = (state: GameState, skipToBoss: boolean): VictorRuntime => {
  const startedAt = skipToBoss ? CP.LOUNGE : state.checkpoint;
  const start = COURSE.checkpoints[startedAt];
  // Enemies and pickups ahead of you (the parts come in order: the trail, inside, the lounge)
  const order = (x: number) => ({ main: 0, inside: 1, lounge: 2 })[regionOf(x)];
  const ahead = (x: number, clearance: number) => order(x) > order(start.x) || (order(x) === order(start.x) && x - start.x >= clearance);
  COURSE.pickups.forEach((p, i) => {
    if (!ahead(p.x, 0)) return;
    state.pickups.push({ id: `victor-pickup-${i}`, pos: { x: p.x - 10, y: p.y - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: p.type, life: 1e9 });
  });
  for (const s of COURSE.spawns) if (ahead(s.x, SPAWN_CLEARANCE)) state.enemies.push(makeKindEnemy(s.kind, s.x, s.y));
  const rt: VictorRuntime = {
    startedAt,
    hazards: createHazards(state),
    doorman: createDoormanFight(state, startedAt),
    lounge: createLounge(startedAt),
    enterT: 0,
  };
  applyRegionCamera(state, regionOf(start.x));
  return rt;
};

/** Where the camera's allowed in each part of the world. */
const applyRegionCamera = (state: GameState, region: Region) => {
  if (region === 'main') state.cameraMinX = COURSE.startX;
  else if (region === 'inside') state.cameraMinX = COURSE.inside.x1 - 40;
  else state.cameraMinX = COURSE.lounge.x1 - 40;
};

export const updateVictor = (ctx: FrameContext, controls: Controls): Controls => {
  const rt = getVictor(ctx.state);
  if (!rt) return controls;
  const { state } = ctx;
  const { player } = state;
  const region = regionOf(player.pos.x);
  updateHazards(ctx, rt.hazards);

  if (region === 'main') {
    // Checkpoints along the trail
    if (state.checkpoint < CP.BOMBS && player.isGrounded && player.pos.x >= COURSE.checkpoints[CP.BOMBS].x) state.checkpoint = CP.BOMBS;
    if (state.checkpoint < CP.CLUB && player.isGrounded && player.pos.x >= COURSE.checkpoints[CP.CLUB].x) state.checkpoint = CP.CLUB;
    controls = updateDoormanFight(ctx, rt.doorman, controls);
    // He's down: in through the club doors (and on into the volcano)
    if (rt.doorman.phase === 'dead' && rt.enterT === 0 && player.pos.x + player.width > COURSE.club.door + 30) { rt.enterT = 1; playSound('ding'); }
  }
  if (rt.enterT > 0) {
    rt.enterT++;
    controls = { ...NO_CONTROLS, right: rt.enterT < ENTER_FRAMES / 2 };
    if (rt.enterT === ENTER_FRAMES) {
      const at = COURSE.checkpoints[CP.RIVER];
      player.pos = { x: at.x, y: at.y - player.height };
      player.vel = { x: 0, y: 0 };
      // (let go of the club's fixed shot: we're inside now)
      state.cameraOverride = null;
      state.camera.x = at.x - 250; state.camera.y = at.y - 550;
      state.cameraRestY = at.y - 550;
      applyRegionCamera(state, 'inside');
      state.checkpoint = Math.max(state.checkpoint, CP.RIVER);
    }
    if (rt.enterT > ENTER_FRAMES + 30) rt.enterT = 0;
  }
  // Up the shaft the view stops at its right-hand wall (and lets go again anywhere else)
  const inShaft = region === 'inside' && player.pos.x > COURSE.shaft.x1 - 200;
  // (and out on the trail it stops at the club: nothing past the front of it)
  state.cameraMaxX = inShaft ? COURSE.shaft.x2 + 60 - CANVAS_WIDTH : region === 'main' ? COURSE.club.x2 - 10 - CANVAS_WIDTH + 20 : undefined;
  // ...and once you're on your way up, at its left-hand wall too (down on the floor you can still see back out to the river)
  // (only once he's really in there, past the wall: jumping at it from the river side doesn't count; and the
  // view slides over to the wall and back rather than jumping)
  if (region === 'inside') {
    const free = COURSE.inside.x1 - 40, wall = COURSE.shaft.x1 - 60;
    const climbing = player.pos.x > COURSE.shaft.x1 - 60 && player.pos.y + player.height < COURSE.shaft.floor - 150;
    state.cameraMinX = !inShaft ? free
      : climbing ? Math.min(wall, state.camera.x + SHAFT_CAMERA_SLIDE)
      : Math.max(free, Math.min(wall, state.camera.x - SHAFT_CAMERA_SLIDE));
  }
  if (region === 'inside') {
    if (state.checkpoint < CP.SHAFT && player.isGrounded && player.pos.x >= COURSE.checkpoints[CP.SHAFT].x) state.checkpoint = CP.SHAFT;
    // Up at the window
    const w = COURSE.shaft.window;
    if (rt.lounge.phase === 'party' && player.isGrounded && player.pos.x + player.width > w.x - 60 && player.pos.y + player.height < COURSE.shaft.top + 10) startCrash(state, rt.lounge);
  }
  return updateLounge(ctx, rt.lounge, controls);
};

/** The fade through the club doors (0..1). */
export const enterFade = (rt: VictorRuntime) => (rt.enterT <= 0 ? 0 : rt.enterT < ENTER_FRAMES ? rt.enterT / ENTER_FRAMES : Math.max(0, 1 - (rt.enterT - ENTER_FRAMES) / 30));
