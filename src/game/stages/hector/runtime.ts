// Hector's stage while it's being played: which part you're in, the beach and
// its storm, the hazards, the boat, the storm tower, the Eye and the daycare.
// Rebuilt with the level on every (re)spawn; the checkpoint says what's behind you.

import type { GameState } from '../../core/state';
import { GatorCam, createGatorCam } from './gatorCam';
import type { FrameContext } from '../../core/context';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { makeKindEnemy } from '../../enemies/kinds';
import { playSound } from '../../platform/audio';
import { COURSE, CP, palmTip } from './course';
import { GROUND_Y } from '../../../constants';
import { Beach, createBeach, updateBeach } from './beach';
import { Hazards, createHazards, updateHazards, waterZones } from './hazards';
import { Boat, createBoat, updateBoat } from './boat';
import { TowerRun, createTowerRun, updateTower, inTower, onLift, TOWER } from './tower';
import { EyeFight, createEyeFight, updateEyeFight, inEyeArena } from './eye';
import { News, createNews, startNews, updateNews, newsOn } from './news';
import { Daycare, createDaycare, updateDaycare, startDaycare, inDaycare } from './daycare';

export interface HectorRuntime {
  startedAt: number;
  beach: Beach;
  hazards: Hazards;
  boat: Boat;
  tower: TowerRun;
  eye: EyeFight;
  daycare: Daycare;
  /** Whether the Eye's death and the news have him in a cutscene (this file set inCutscene, and takes it off). */
  heldScene?: boolean;
  /** The news bulletin between the Eye dying and the flood landing. */
  news: News;
  /** The storm dying (after the Eye): frames of the whiteout into sunshine. */
  clearT: number;
  /** Pulls back to show a gator eating somebody. */
  gatorCam: GatorCam;
}

export type Region = 'main' | 'tower' | 'eye' | 'daycare';
export const regionOf = (x: number): Region => (inTower(x) ? 'tower' : inEyeArena(x) ? 'eye' : inDaycare(x) ? 'daycare' : 'main');

/** Nothing's placed closer than this ahead of where you start. */
const SPAWN_CLEARANCE = 480;

export const getHector = (state: GameState) => state.stage as HectorRuntime | null;

export const createHectorRuntime = (state: GameState, skipToBoss: boolean): HectorRuntime => {
  const startedAt = skipToBoss ? CP.DOOR : state.checkpoint;
  const start = COURSE.checkpoints[startedAt];
  // The main run's enemies and pickups (only the ones ahead, and only if you're still on it)
  if (startedAt <= CP.MARINA) {
    const fromX = startedAt > 0 ? start.x : -Infinity;
    COURSE.pickups.forEach((p, i) => {
      if (p.x < fromX) return;
      state.pickups.push({ id: `hector-pickup-${i}`, pos: { x: p.x - 10, y: p.y - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: p.type, life: 1e9 });
    });
    for (const s of COURSE.spawns) {
      if (s.x < fromX || s.x - start.x < SPAWN_CLEARANCE) continue;
      const e = makeKindEnemy(s.kind, s.x, s.y);
      if (s.variant !== undefined) e.variant = s.variant;
      // An iguana belongs to the palm it's up
      if (s.kind === 'iguana') e.aiX = COURSE.props.filter(p => p.look === 'palm').reduce((best, p) => Math.abs(p.x - s.x) < Math.abs(best - s.x) ? p.x : best, s.x);
      state.enemies.push(e);
    }
  }
  // (the tower's platforms go in first: its trampolines are bouncy like the awnings)
  // Refills down on the sea bed, to make it worth diving for
  if (startedAt <= CP.MARINA) {
    const fromX = startedAt > 0 ? start.x : -Infinity;
    waterZones(state).filter(z => !z.underDock && z.bottom > COURSE.sea.y + 100 && z.x2 - z.x1 > 100 && z.x1 > fromX && z.x1 < COURSE.sea.x1).forEach((z, i) => {
      const type = (['large_health', 'large_ammo', 'small_health', 'small_ammo'] as const)[i % 4];
      state.pickups.push({ id: `hector-seabed-${i}`, pos: { x: (z.x1 + z.x2) / 2 - 10, y: z.bottom - 22 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
    });
  }
  const tower = createTowerRun(state, startedAt);
  const rt: HectorRuntime = {
    startedAt,
    beach: createBeach(state, startedAt),
    hazards: createHazards(state),
    boat: createBoat(state, startedAt),
    tower,
    eye: createEyeFight(state, startedAt),
    daycare: createDaycare(state, startedAt),
    clearT: 0,
    gatorCam: createGatorCam(),
    news: createNews(),
  };
  applyRegionCamera(state, regionOf(start.x));
  return rt;
};

/** Where the camera's allowed in each part of the world. */
const applyRegionCamera = (state: GameState, region: Region) => {
  if (region === 'main') state.cameraMinX = COURSE.startX;
  else if (region === 'daycare') state.cameraMinX = COURSE.daycare.x1;
  else state.cameraMinX = COURSE.left;
};

/** Arriving in the Eye: how long his feet stay planted (frames). */
const EYE_ARRIVE_HOLD = 45;

export const updateHector = (ctx: FrameContext, controls: Controls): Controls => {
  const rt = getHector(ctx.state);
  if (!rt) return controls;
  const { state } = ctx;
  const { player } = state;
  const region = regionOf(player.pos.x);

  if (region === 'main') {
    updateBeach(ctx, rt.beach);
    // Iguanas ride the palm crowns as they whip about in the wind
    for (const e of state.enemies) {
      if (e.kind !== 'iguana' || e.aiX === undefined || (e.aiState && e.aiState !== 'idle') || (e.pauseTimer || 0) > 0) continue;
      const tip = palmTip(e.aiX, state.frame, rt.beach.storm);
      e.pos.x = e.aiX + tip.x - e.width / 2;
      e.pos.y = GROUND_Y + tip.y - e.height + 6;
    }
    // Checkpoints along the strip
    for (const cp of [CP.MOTEL, CP.MARINA]) {
      if (state.checkpoint < cp && player.isGrounded && player.pos.x >= COURSE.checkpoints[cp].x) state.checkpoint = cp;
    }
  }
  updateHazards(ctx, rt.hazards, region === 'main' && rt.beach.storm > 0.6);
  controls = updateBoat(ctx, rt.boat, controls, () => { enterTower(state); rt.tower.cgT = 1; });
  updateTower(ctx, rt.tower, () => enterEye(state));
  updateEyeFight(ctx, rt.eye, () => { rt.clearT = 1; });
  // (the news: watch it all, or skip the lot)
  updateNews(ctx, rt.news, controls, () => startDaycare(state, rt.daycare, true));
  // Riding the lift up into the Eye: hands off
  if (onLift(rt.tower)) { controls = { ...NO_CONTROLS }; player.vel.x *= 0.6; }
  // Just arrived in the Eye (off the tower, or back at its checkpoint): feet planted a moment while he takes it in,
  // so a right still held from the climb doesn't walk him straight off the junk (he can still shoot)
  if (region === 'eye' && rt.eye.phase === 'intro' && rt.eye.t < EYE_ARRIVE_HOLD) {
    controls = { ...NO_CONTROLS, shoot: controls.shoot, secondary: controls.secondary };
    player.vel.x *= 0.6;
  }
  // The Eye's dead: hands off while it dies and the storm clears
  if ((region === 'eye' && (rt.eye.phase === 'dead' || rt.eye.phase === 'done')) || newsOn(rt.news) || rt.hazards.drownT > 0) {
    controls = { ...NO_CONTROLS };
    player.isCharging = false; player.isSliding = false; player.isUppercutting = false; player.isDivekicking = false;
  }
  // (the Eye going and the storm clearing, and the news after it: a cutscene, him out of it (the HUD's put away);
  // given back the moment it's over. The same for the lift up into the Eye, and drowning. And the daycare, which the
  // news hands straight on to, holds it till it's done with it itself)
  const scene = (region === 'eye' && (rt.eye.phase === 'dead' || rt.eye.phase === 'done')) || newsOn(rt.news) || rt.clearT > 0
    || onLift(rt.tower) || rt.hazards.drownT > 0 || rt.daycare.phase === 'cutscene';
  if (scene) { player.inCutscene = true; rt.heldScene = true; }
  else if (rt.heldScene) { player.inCutscene = false; rt.heldScene = false; }
  // The storm dies: a whiteout, the news, then the daycare
  if (rt.clearT > 0) {
    rt.clearT++;
    if (rt.clearT === 40) startNews(rt.news);
    if (rt.clearT > 90) rt.clearT = 0;
  }
  return updateDaycare(ctx, rt.daycare, controls);
};

/** Sucked up by the spout: out at the bottom of the storm tower. */
const enterTower = (state: GameState) => {
  const p = state.player;
  const at = COURSE.checkpoints[CP.TOWER];
  p.pos = { x: at.x, y: at.y - p.height - 200 };
  p.vel = { x: 0, y: 0 };
  p.inCutscene = false;
  state.cameraOverride = null;
  state.cameraLeadX = 0;
  state.camera.x = p.pos.x - 378;
  state.cameraRestY = TOWER.floorY - 550;
  state.camera.y = state.cameraRestY;
  applyRegionCamera(state, 'tower');
  state.checkpoint = Math.max(state.checkpoint, CP.TOWER);
  playSound('thunder');
};

/** Up at the top of the storm: onto the junk in the Eye's arena. */
const enterEye = (state: GameState) => {
  const p = state.player;
  const at = COURSE.checkpoints[CP.EYE];
  p.pos = { x: at.x, y: at.y - p.height };
  p.vel = { x: 0, y: 0 };
  state.camera.x = COURSE.eye.x; state.camera.y = COURSE.eye.y;
  state.cameraOverride = { x: COURSE.eye.x, y: COURSE.eye.y };
  applyRegionCamera(state, 'eye');
  state.checkpoint = Math.max(state.checkpoint, CP.EYE);
};
