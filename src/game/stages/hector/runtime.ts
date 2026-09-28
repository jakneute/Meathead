// Hector's stage while it's being played: which part you're in, the beach and
// its storm, the hazards, the boat, the storm tower, the Eye and the daycare.
// Rebuilt with the level on every (re)spawn; the checkpoint says what's behind you.

import type { GameState } from '../../state';
import type { FrameContext } from '../../context';
import type { Controls } from '../../input';
import { NO_CONTROLS } from '../../input';
import { makeKindEnemy } from '../../systems/kinds';
import { playSound } from '../../audio';
import { COURSE, CP, palmTip } from './course';
import { GROUND_Y } from '../../../constants';
import { Beach, createBeach, updateBeach } from './beach';
import { Hazards, createHazards, updateHazards } from './hazards';
import { Boat, createBoat, updateBoat } from './boat';
import { TowerRun, createTowerRun, updateTower, inTower, TOWER } from './tower';
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
  /** The news bulletin between the Eye dying and the flood landing. */
  news: News;
  /** The storm dying (after the Eye): frames of the whiteout into sunshine. */
  clearT: number;
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
  controls = updateBoat(ctx, rt.boat, controls, () => enterTower(state));
  updateTower(ctx, rt.tower, () => enterEye(state));
  updateEyeFight(ctx, rt.eye, () => { rt.clearT = 1; });
  // (skipping a line of the news goes by the real buttons)
  updateNews(ctx, rt.news, controls, () => startDaycare(state, rt.daycare, true));
  // The Eye's dead: hands off while it dies and the storm clears
  if ((region === 'eye' && (rt.eye.phase === 'dead' || rt.eye.phase === 'done')) || newsOn(rt.news)) {
    controls = { ...NO_CONTROLS };
    player.isCharging = false; player.isSliding = false; player.isUppercutting = false; player.isDivekicking = false;
  }
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
