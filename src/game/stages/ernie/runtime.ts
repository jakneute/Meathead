// Ernie's stage while it's being played: which part you're in, the quakes, the
// bridge, the jet ski and the tour. Rebuilt with the level on every (re)spawn;
// the checkpoint says what's behind you.

import type { GameState } from '../../core/state';
import type { FrameContext } from '../../core/context';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { makeKindEnemy } from '../../enemies/kinds';

/** Alcatraz's lot, placed once he's landed on the island (past where the tour was). */
export const spawnIsland = (state: GameState) => {
  for (const s of COURSE.spawns) if (onTheIsland({ pos: s }) && s.x > COURSE.cellblock.crashX + SPAWN_CLEARANCE) state.enemies.push(makeKindEnemy(s.kind, s.x, s.y));
};
import { COURSE, CP, onTheIsland } from './course';
import { Quakes, createQuakes, updateQuakes } from './quake';
import { Bridge, createBridge, updateBridge } from './bridge';
import { JetSki, createJetSki, updateJetSki } from './jetski';
import { Tour, createTour, startTour, updateTour, tourWrecked, skipTour } from './alcatraz';
import { SKIP_AFTER, offerSkip, takeSkip } from '../../platform/skip';
import { DoorCrash, createDoorCrash, updateDoorCrash } from './doorCrash';
import { say, cancelSpeech, MEATHEAD_VOICE } from '../../platform/speech';

/** Meathead, to himself, over his head (after whoever's talking). */
const meatheadSays = (state: GameState, text: string) => {
  const shown = say(text, MEATHEAD_VOICE, 'queue', {
    onShow: () => { state.playerLastVulgarity = text; state.playerVulgarityTimer = 180; },
    onHide: () => { if (state.playerLastVulgarity === text) state.playerVulgarityTimer = Math.min(state.playerVulgarityTimer, 30); },
  });
  if (!shown) { state.playerLastVulgarity = text; state.playerVulgarityTimer = 160; }
};

export interface ErnieRuntime {
  startedAt: number;
  quakes: Quakes;
  bridge: Bridge;
  ski: JetSki;
  tour: Tour;
  /** The one who went off the ramp after him, coming down outside Ernie's door. */
  doorCrash: DoorCrash;
  /** Out in the yard he's wondered where the hipster got to. */
  wondered: boolean;
  /** Frames into the scene from the hipster catching up to him to Meathead climbing out of the wreck (it can be skipped). */
  sceneT: number;
  /** Off the end of the bridge and down to the water: frames of the fade (0 = not). */
  downT: number;
  /** Off the ramp and on to the island: frames of the fade to black (0 = not). */
  awayT: number;
}

export type Region = 'main' | 'bay' | 'cell';
export const regionOf = (x: number): Region => (x >= COURSE.cellblock.x1 - 200 ? 'cell' : x < COURSE.bay.x2 + 2000 ? 'bay' : 'main');

/** Nothing's placed closer than this ahead of where you start. */
const SPAWN_CLEARANCE = 480;
export const DOWN_FRAMES = 50, DOWN_HOLD = 8;
export const AWAY_FRAMES = 30;

export const getErnie = (state: GameState) => state.stage as ErnieRuntime | null;

export const createErnieRuntime = (state: GameState, skipToBoss: boolean): ErnieRuntime => {
  const startedAt = skipToBoss ? CP.DOOR : state.checkpoint;
  const start = COURSE.checkpoints[startedAt];
  const order = (x: number) => ({ main: 0, bay: 1, cell: 2 })[regionOf(x)];
  const ahead = (x: number, clearance: number) => order(x) > order(start.x) || (order(x) === order(start.x) && x - start.x >= clearance);
  COURSE.pickups.forEach((p, i) => {
    if (!ahead(p.x, 0)) return;
    state.pickups.push({ id: `ernie-pickup-${i}`, pos: { x: p.x - 10, y: p.y - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: p.type, life: 1e9 });
  });
  // (the island's lot only once he's there: out ahead of him all the way from the streets, the birds would be off
  // across the bay after him)
  const startedOnIsland = order(start.x) === 2;
  for (const s of COURSE.spawns) {
    if (!ahead(s.x, SPAWN_CLEARANCE) || (!startedOnIsland && onTheIsland({ pos: s }))) continue;
    state.enemies.push(makeKindEnemy(s.kind, s.x, s.y));
  }
  const rt: ErnieRuntime = {
    startedAt,
    quakes: createQuakes(state, startedAt),
    bridge: createBridge(state),
    ski: createJetSki(state, startedAt),
    tour: createTour(startedAt),
    doorCrash: createDoorCrash(state, startedAt),
    wondered: startedAt >= CP.CITADEL,
    sceneT: 0,
    downT: 0,
    awayT: 0,
  };
  applyRegionCamera(state, regionOf(start.x));
  return rt;
};

/** Where the camera's allowed in each part of the world. */
const applyRegionCamera = (state: GameState, region: Region) => {
  if (region === 'main') { state.cameraMinX = COURSE.streets.x1; state.cameraMaxX = COURSE.bridge.x2 - 800; }
  else if (region === 'bay') { state.cameraMinX = COURSE.bay.x1; state.cameraMaxX = undefined; }
  else { state.cameraMinX = COURSE.cellblock.x1; state.cameraMaxX = undefined; }
};

export const updateErnie = (ctx: FrameContext, controls: Controls): Controls => {
  const rt = getErnie(ctx.state);
  if (!rt) return controls;
  const { state } = ctx;
  const { player } = state;
  const region = regionOf(player.pos.x);

  // (on the island they're back on once the tour's over, all the way to Ernie's door)
  const onIsland = region === 'cell' && tourWrecked(rt.tour) && rt.tour.phase === 'wrecked' && rt.doorCrash.phase !== 'scene' && player.pos.x < COURSE.cellblock.x2 - 350;
  updateQuakes(ctx, rt.quakes, (region === 'main' && !rt.bridge.plunge) || onIsland);
  if (region === 'cell') {
    // Out into the yard: no sign of the hipster anywhere (he's still up there somewhere)
    if (!rt.wondered && player.isGrounded && player.pos.x > COURSE.island.house + 60) { rt.wondered = true; meatheadSays(state, "HUH. WHERE'D THAT HIPSTER LAND? HE WAS RIGHT BEHIND ME."); }
    for (const cp of [CP.YARD, CP.CITADEL, CP.DOOR]) if (state.checkpoint < cp && player.isGrounded && player.pos.x >= COURSE.checkpoints[cp].x) state.checkpoint = cp;
  }
  if (region === 'main') {
    if (state.checkpoint < CP.QUAKES && player.isGrounded && player.pos.x >= COURSE.checkpoints[CP.QUAKES].x) state.checkpoint = CP.QUAKES;
    if (state.checkpoint < CP.BRIDGE && player.isGrounded && player.pos.x >= COURSE.checkpoints[CP.BRIDGE].x) state.checkpoint = CP.BRIDGE;
    controls = updateBridge(ctx, rt.bridge, controls);
    // Off the far end of the bridge: down to the water
    if (rt.downT === 0 && player.isGrounded && player.pos.x + player.width > COURSE.bridge.exit) rt.downT = 1;
  }
  if (rt.downT > 0) {
    rt.downT++;
    controls = { ...NO_CONTROLS, right: rt.downT < DOWN_FRAMES / 2 };
    if (rt.downT === DOWN_FRAMES) {
      const at = COURSE.checkpoints[CP.DOCK];
      player.pos = { x: at.x, y: at.y - player.height };
      player.vel = { x: 0, y: 0 };
      state.cameraOverride = null;
      state.camera.x = at.x - 250; state.camera.y = at.y - 550;
      state.cameraRestY = at.y - 550;
      applyRegionCamera(state, 'bay');
      state.checkpoint = Math.max(state.checkpoint, CP.DOCK);
      // (nothing from up there follows you down)
      state.enemies = state.enemies.filter(e => e.type === 'boss' || onTheIsland(e));
      state.projectiles = [];
    }
    if (rt.downT > DOWN_FRAMES + DOWN_HOLD + 30) rt.downT = 0;
  }
  if (region === 'bay') {
    controls = updateJetSki(ctx, rt.ski, controls, () => { rt.awayT = 1; });
  }
  if (rt.awayT > 0) {
    rt.awayT++;
    if (rt.awayT === AWAY_FRAMES) { startTour(state, rt.tour); rt.awayT = 0; }
    controls = { ...NO_CONTROLS };
  }
  if (region === 'cell') controls = updateDoorCrash(ctx, rt.doorCrash, controls);
  // The scene from the hipster catching up to him, off the ramp, to Meathead climbing out of the wreck on the tour:
  // all or nothing, skipping it puts him right there, stood in what's left of the tour
  if (inHipsterScene(rt)) {
    rt.sceneT++;
    if (rt.sceneT > SKIP_AFTER) offerSkip();
    if (rt.sceneT > SKIP_AFTER && takeSkip()) {
      cancelSpeech();
      rt.ski.phase = 'gone'; rt.ski.chaser.state = 'gone'; rt.ski.lineT = 0; rt.ski.hipster.lineT = 0; rt.ski.talk = null;
      rt.awayT = 0;
      skipTour(state, rt.tour);
      rt.sceneT = 0;
      return { ...NO_CONTROLS };
    }
  } else rt.sceneT = 0;
  return updateTour(ctx, rt.tour, controls);
};

/** The hipster's scene is on (from him pulling up behind, to Meathead back on his feet on the island). */
export const inHipsterScene = (rt: ErnieRuntime) =>
  (rt.ski.phase === 'riding' && rt.ski.chaser.state !== 'off') || rt.ski.phase === 'launch' || rt.awayT > 0 || rt.tour.phase === 'tour';

/** The fade off the end of the bridge (0..1). */
// (held on black a beat either side of the cut, so nothing of the move down there shows)
export const downFade = (rt: ErnieRuntime) => (rt.downT <= 0 ? 0 : rt.downT < DOWN_FRAMES ? Math.min(1, rt.downT / (DOWN_FRAMES - DOWN_HOLD)) : Math.max(0, Math.min(1, 1 - (rt.downT - DOWN_FRAMES - DOWN_HOLD) / 30)));
