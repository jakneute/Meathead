// Dale's stage while it's being played: which act you're in, the landing, the
// desert's and the warehouse's hazards, Chuco upstairs, the convoy, the town,
// and the fades between them (out of the office window onto the first truck; the
// last truck into the curio shop). Rebuilt with the level on every (re)spawn;
// the checkpoint says what's behind you.

import { deathByCause } from '../../core/deathCause';
import type { GameState } from '../../core/state';
import type { FrameContext } from '../../core/context';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { makeKindEnemy } from '../../enemies/kinds';
import { CANVAS_WIDTH } from '../../../constants';
import { rectsOverlap } from '../../core/utils';
import { COURSE, CP } from './course';
import { Talk, createTalk, updateTalk, hush } from './script';
import { Intro, createIntro, updateIntro } from './intro';
import { Hazards, createHazards, updateHazards, cactusBox } from './hazards';
import { JunkieFight, createJunkieFight, updateJunkieFight, outTheWindow } from './junkie';
import { Convoy, createConvoy, updateConvoy, boardConvoy, HIGHWAY_CAM_Y } from './convoy';
import { Town, createTown, updateTown, startArrival } from './town';

export interface DaleRuntime {
  startedAt: number;
  talk: Talk;
  intro: Intro;
  hazards: Hazards;
  junkie: JunkieFight;
  convoy: Convoy;
  town: Town;
  /** A fade to black and back: out of the office onto the highway, or off the highway into town. Frames in. */
  fade: { t: number; to: 'highway' | 'town' } | null;
}

export type Region = 'desert' | 'highway' | 'town';
// (the highway runs a long way back: off the back of a truck, he goes a long way down the road before he stops)
export const regionOf = (x: number): Region => (x >= COURSE.town.x1 - 600 ? 'town' : x >= COURSE.highway.x1 - 20000 ? 'highway' : 'desert');

/** Nothing's placed closer than this ahead of where you start. */
const SPAWN_CLEARANCE = 480;
/** The fade: frames to black, held, frames back. */
export const FADE_OUT = 40, FADE_HOLD = 20, FADE_IN = 40;

export const getDale = (state: GameState) => state.stage as DaleRuntime | null;

export const createDaleRuntime = (state: GameState, skipToBoss: boolean): DaleRuntime => {
  const startedAt = skipToBoss ? CP.JAIL : state.checkpoint;
  const start = COURSE.checkpoints[startedAt];
  const order = (x: number) => ({ desert: 0, highway: 1, town: 2 })[regionOf(x)];
  const ahead = (x: number, clearance: number) => order(x) > order(start.x) || (order(x) === order(start.x) && x - start.x >= clearance);
  COURSE.pickups.forEach((p, i) => {
    if (!ahead(p.x, 0)) return;
    state.pickups.push({ id: `dale-pickup-${i}`, pos: { x: p.x - 10, y: p.y - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: p.type, life: 1e9 });
  });
  for (const s of COURSE.spawns) {
    // (the goons at the landing are right there when you land: they're loading the truck)
    if (!ahead(s.x, startedAt === CP.LANDING && s.x < COURSE.landing.truckX + 400 ? 300 : SPAWN_CLEARANCE)) continue;
    const e = makeKindEnemy(s.kind, s.x, s.y);
    if (s.variant !== undefined) e.variant = s.variant;
    state.enemies.push(e);
  }
  const rt: DaleRuntime = {
    startedAt,
    talk: createTalk(),
    intro: createIntro(startedAt),
    hazards: createHazards(),
    junkie: createJunkieFight(state, startedAt),
    convoy: createConvoy(state, startedAt),
    town: createTown(state, startedAt),
    fade: null,
  };
  if (rt.convoy.active) state.cameraOverride = { x: start.x - 220, y: HIGHWAY_CAM_Y };
  // Straight to Dale (or back to him): the town's done with
  if (skipToBoss) { rt.town.ninja.state = 'dead'; rt.town.phase = 'crashed'; rt.town.cab.state = 'wrecked'; rt.town.prisoner.alive = false; }
  applyRegionCamera(state, regionOf(start.x));
  return rt;
};

/** Where the camera's allowed in each part of the world. */
const applyRegionCamera = (state: GameState, region: Region) => {
  if (region === 'desert') { state.cameraMinX = COURSE.desert.x1; state.cameraMaxX = COURSE.office.x2 + 60 - CANVAS_WIDTH; }
  else if (region === 'highway') { state.cameraMinX = COURSE.highway.x1; state.cameraMaxX = COURSE.highway.x2 - CANVAS_WIDTH; }
  else { state.cameraMinX = COURSE.town.x1; state.cameraMaxX = undefined; }
};

export const updateDale = (ctx: FrameContext, controls: Controls): Controls => {
  const rt = getDale(ctx.state);
  if (!rt) return controls;
  const { state } = ctx;
  const { player } = state;
  const region = regionOf(player.pos.x);
  updateTalk(state, rt.talk);
  // Between acts (the convoy keeps rolling under the fade in)
  if (rt.fade) {
    const c = updateFade(ctx, rt);
    if (rt.fade?.to === 'highway' && rt.convoy.active) updateConvoy(ctx, rt.convoy, rt.talk, c);
    return c;
  }
  if (region === 'desert') {
    controls = updateIntro(ctx, rt.intro, rt.talk, controls);
    // Down a crevasse past saving: gone into the dark (not drawn over its walls on the way down)
    if (!player.isGrounded && !player.hidden) {
      const px = player.pos.x + player.width / 2;
      const i = state.groundRuns.findIndex((r, k) => state.groundRuns[k + 1] && px > r.x2 && px < state.groundRuns[k + 1].x1);
      if (i >= 0 && player.pos.y > Math.max(state.groundRuns[i].y2, state.groundRuns[i + 1].y1) + 120) player.hidden = true;
    }
    updateHazards(ctx, rt.hazards);
    if (player.isGrounded) {
      for (const cp of [CP.DUNES, CP.WAREHOUSE, CP.OFFICE] as const) if (state.checkpoint < cp && player.pos.x >= COURSE.checkpoints[cp].x) state.checkpoint = cp;
    }
    controls = updateJunkieFight(ctx, rt.junkie, rt.talk, controls);
    if (outTheWindow(rt.junkie) && !rt.fade) rt.fade = { t: 0, to: 'highway' };
  } else if (region === 'highway') {
    controls = updateConvoy(ctx, rt.convoy, rt.talk, controls);
    // (straight into town: the cab coming down the street into the curio shop)
    if (rt.convoy.finished) { enterTown(ctx, rt); startArrival(state, rt.town); }
  } else {
    controls = updateTown(ctx, rt.town, rt.talk, controls);
  }
  return controls;
};

const updateFade = (ctx: FrameContext, rt: DaleRuntime): Controls => {
  const { state } = ctx;
  const f = rt.fade!;
  f.t++;
  if (f.t === FADE_OUT + FADE_HOLD / 2) {
    hush(state, rt.talk);
    state.projectiles = [];
    state.enemies = state.enemies.filter(e => e.type === 'boss');
    if (f.to === 'highway') {
      rt.junkie.phase = 'done';
      applyRegionCamera(state, 'highway');
      boardConvoy(state, rt.convoy);
    }
  }
  // (hands off the whole way, through the black and back up on the truck: a cutscene, the HUD put away till it's over)
  state.player.inCutscene = true;
  if (f.t >= FADE_OUT + FADE_HOLD + FADE_IN) { rt.fade = null; state.player.inCutscene = false; }
  return { ...NO_CONTROLS };
};

/** Off the highway into town (straight cut: the crash plays out there). */
const enterTown = (ctx: FrameContext, rt: DaleRuntime) => {
  const { state } = ctx;
  const p = state.player;
  hush(state, rt.talk);
  state.projectiles = [];
  state.enemies = state.enemies.filter(e => e.type === 'boss');
  rt.convoy.active = false;
  rt.convoy.finished = false;
  const at = COURSE.checkpoints[CP.TOWN];
  p.pos = { x: at.x, y: at.y - p.height };
  p.vel = { x: 0, y: 0 };
  state.cameraOverride = null;
  state.camera.x = COURSE.town.x1; state.camera.y = 0; state.cameraRestY = 0;
  applyRegionCamera(state, 'town');
  state.checkpoint = Math.max(state.checkpoint, CP.TOWN);
  state.stageMemo.fromCrash = 'yes';
  // The town's goons (they weren't there to put in before)
  for (const s of COURSE.spawns) if (regionOf(s.x) === 'town' && s.x > at.x + 300) { const e = makeKindEnemy(s.kind, s.x, s.y); if (s.variant !== undefined) e.variant = s.variant; state.enemies.push(e); }
  COURSE.pickups.forEach((pk, i) => { if (regionOf(pk.x) === 'town' && !state.pickups.some(q => q.id === `dale-pickup-${i}`)) state.pickups.push({ id: `dale-pickup-${i}`, pos: { x: pk.x - 10, y: pk.y - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: pk.type, life: 1e9 }); });
};

/** How black the screen is (0..1). */
export const fadeAmount = (rt: DaleRuntime) => {
  const f = rt.fade;
  if (!f) return 0;
  if (f.t < FADE_OUT) return f.t / FADE_OUT;
  if (f.t < FADE_OUT + FADE_HOLD) return 1;
  return Math.max(0, 1 - (f.t - FADE_OUT - FADE_HOLD) / FADE_IN);
};

/** What killed him, in so many words. */
export const daleDeathMessage = (ctx: FrameContext): string | undefined => {
  const rt = getDale(ctx.state);
  if (!rt) return undefined;
  const { state } = ctx;
  const p = state.player;
  const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];
  // (something in particular got him: that, over standing near a cactus or the region's catch-all)
  const cause = deathByCause(state);
  if (cause) return cause;
  if (COURSE.cacti.some(c => rectsOverlap(cactusBox(c), { x: p.pos.x - 10, y: p.pos.y - 10, w: p.width + 20, h: p.height + 20 }))) return pick(['PRICKED TO DEATH', 'HUGGED A CACTUS', 'DEATH BY A THOUSAND NEEDLES']);
  if (rt.junkie.phase === 'fight') return pick(['BEATEN TO A PULP BY A TWEAKER', 'CHUCO SAYS HI', 'TIGHT, TIGHT, TIGHT']);
  const shot = rt.town.sniper.lastShot;
  if (shot && state.frame - shot.t < 8) return pick(['SNIPED', 'ONE SHOT, ONE MEATHEAD', 'RED DOT, THEN NOTHING']);
  const region = regionOf(p.pos.x);
  if (region === 'desert') return pick(['THE DESERT CLAIMS ANOTHER', 'VULTURE FOOD', 'LOST IN THE SAND']);
  if (region === 'town') return pick(['DEAD IN DEADWOOD GULCH', 'BOOT HILL, PLOT 12', 'WANTED: DEAD. GOT IT.']);
  return undefined;
};
