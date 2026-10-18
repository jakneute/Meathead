// Wilderness Land (land id `frontier`): the stage. Built the way Hollywood Land is (hollywood/index.ts): its sections
// (see geometry.ts) each in a folder of their own, each a FrontierSection (section.ts: Adventure Land's Section with
// Wilderness Land's ids); this runs whichever one he's in, keeps the camera to it, swims him in its water (air.ts) and
// drowns whoever's knocked in (drown.ts), and puts him back at the right checkpoint after dying.
//
// Shared file (see OWNERSHIP.md): section owners may only append minimally, and must re-read it before editing.

import { sleepFar, wakeNear } from '../dormant';
import { drownLanders } from '../drown';
import type { StageLayout } from '../../m1/game/stages/index';
import type { GameState } from '../../m1/game/core/state';
import type { Enemy } from '../../m1/types';
import { CANVAS_WIDTH } from '../../m1/constants';
import { NO_CONTROLS } from '../../m1/game/platform/input';
import { todLight } from '../timeOfDay';
import { drawNotedSunFlare } from '../sunFlare';
import { setUi, isLeaving, arrived, carryGut, takeGut, takeStartCheckpoint } from '../store';
import { stopWeapons } from '../weapons';
import { createGrab, updateGrab, drawGrab, type Grab } from '../moves/grab';
import { takePortalArrival, startPortalArrival, tickPortalArrival, drawPortalArrival, type PortalArrival } from '../portalArrival';
import { SECTIONS, SECTION_ORDER, type FrontierId } from './geometry';
import { getFrontier, newLandVisit, type Frontier, type FrontierSection } from './section';
import { updateSwimAir, drawAir } from './air';
import { frontierSky } from './kit';
import { wilds } from './wilds';
import { train } from './train';
import { town } from './town';
import { logride } from './logride';
import { woods } from './woods';
import { dirtbike } from './dirtbike';
import { arena } from './arena';
export { FRONTIER_VOICE_LINES } from './voices';

export const FRONTIER_STAGE = 'M2 Wilderness Land';

const ALL: Record<FrontierId, FrontierSection> = { wilds, train, town, logride, woods, dirtbike, arena };
const sectionAt = (x: number): FrontierSection => {
  for (const id of SECTION_ORDER) { const s = ALL[id]; if (x >= s.x0 && x < s.x1) return s; }
  // (between sections, or off the end of one: the nearest)
  let best = ALL.wilds, bestD = Infinity;
  for (const id of SECTION_ORDER) { const s = ALL[id], d = x < s.x0 ? s.x0 - x : x - s.x1; if (d < bestD) { bestD = d; best = s; } }
  return best;
};
const current = (state: GameState) => ALL[getFrontier(state)?.section ?? 'wilds'];
/** Every checkpoint in the stage, in order (the checkpoint-skip cheat lists them all). */
export const FRONTIER_CHECKPOINTS = SECTION_ORDER.flatMap(id => ALL[id].checkpoints).sort((a, b) => a.cp - b.cp);

interface FrontierState extends Frontier {
  grab: Grab;
  /** Just (re)started at a checkpoint: frames left of the grace, and who's being held off for it. */
  grace: number; held: Set<Enemy>;
  /** The section the camera was last put into. */
  lastSec?: string;
  /** In through the hub's portal: the land opening on him (portalArrival.ts). */
  arrive?: PortalArrival;
}
const GRACE = 120, GRACE_RANGE = 650;
let devStarted = false;

/** Every section that might be on screen (drawn either side of the one he's in, so there's never a gap). */
const near = (state: GameState) => SECTION_ORDER.filter(id => { const s = ALL[id]; return s.x1 > state.camera.x - 300 && s.x0 < state.camera.x + CANVAS_WIDTH + 300; });
const waterAt = (state: GameState, x: number, y: number) => sectionAt(x).waterBodyAt?.(state, x, y) ?? null;

export const frontierLayout: StageLayout = {
  left: SECTIONS.wilds.x0 - 300,
  startX: SECTIONS.wilds.x0 + 150,
  verticalCamera: true,
  startsStanding: true,
  build: (state) => {
    // (a fresh way into the land (a door/portal/cheat sent him here, or the dev start), not a respawn: section.ts's
    // landVisit, for what has to outlive a death but not a new visit)
    const fresh = isLeaving() || (import.meta.env.DEV && !devStarted);
    if (fresh) newLandVisit();
    arrived(); stopWeapons();
    { const g = takeGut(); if (g) state.player.gut = g; }
    const fs: FrontierState = { section: 'wilds', s: {}, grab: createGrab(state), grace: GRACE, held: new Set(), arrive: takePortalArrival() ? startPortalArrival() : undefined };
    state.stage = fs;
    for (const id of SECTION_ORDER) ALL[id].build(state);
    // (the checkpoint-skip cheat: where he picked to start, the first time in)
    { const pick = takeStartCheckpoint(); if (pick !== null) state.checkpoint = pick; }
    // (in dev, ?frontier=<checkpoint> starts there, the first time)
    if (import.meta.env.DEV && !devStarted) { devStarted = true; const q = new URLSearchParams(location.search).get('frontier'); if (q) state.checkpoint = +q; }
    const cp = FRONTIER_CHECKPOINTS.find(c => c.cp === state.checkpoint) ?? FRONTIER_CHECKPOINTS[0];
    fs.section = sectionAt(cp.x).id;
    // (a boss's checkpoint: back for another go at him, nobody else about)
    if (cp.clear) {
      const [l, r] = cp.clear;
      state.enemies = state.enemies.filter(e => { const ex = e.pos.x + e.width / 2; return ex < cp.x - l || ex > cp.x + r; });
    }
    const p = state.player;
    p.pos.x = cp.x - p.width / 2; p.pos.y = cp.y - p.height; p.vel.x = 0; p.vel.y = 0;
    state.camera.x = cp.x - CANVAS_WIDTH / 2;
    // (the cast of every section but where he starts: asleep till he's near (dormant.ts))
    sleepFar(state);
    return { x: cp.x, y: cp.y };
  },
  update: (ctx, controls) => {
    const { state } = ctx;
    const fs = getFrontier(state) as FrontierState | null;
    if (import.meta.env.DEV) (window as unknown as { __m2: GameState }).__m2 = state;
    if (isLeaving()) { stopWeapons(); carryGut(state.player.gut); state.player.vel.x = 0; return { ...NO_CONTROLS }; }
    if (!fs) return controls;
    wakeNear(state);
    const p = state.player;
    // (just back at a checkpoint: anything near holds off a moment, then it's itself again)
    if (fs.grace > 0) {
      fs.grace--;
      for (const e of state.enemies) {
        if (e.type === 'boss' || e.health <= 0 || e.isBlownAway) continue;
        if (fs.grace > 0 && Math.abs(e.pos.x + e.width / 2 - (p.pos.x + p.width / 2)) < GRACE_RANGE && (e.pauseTimer ?? 0) <= 2) { e.puppet = true; e.pauseTimer = 2; e.vel.x = 0; fs.held.add(e); }
      }
      if (fs.grace === 0) { for (const e of fs.held) e.puppet = false; fs.held.clear(); }
    }
    // Which section he's in (the one his middle's in), and the camera kept to it
    const sec = sectionAt(p.pos.x + p.width / 2);
    fs.section = sec.id;
    const lim = sec.cameraX?.(state) ?? { min: sec.x0, max: sec.x1 - CANVAS_WIDTH };
    state.cameraMinX = lim.min; state.cameraMaxX = lim.max;
    // (into a section (or back at a checkpoint): the camera's put right on him there, no gliding in from somewhere else)
    if (fs.lastSec !== sec.id) { fs.lastSec = sec.id; state.camera.x = Math.max(lim.min, Math.min(lim.max, p.pos.x + p.width / 2 - CANVAS_WIDTH / 2)); }
    // (passing a checkpoint: it's his)
    for (const c of sec.checkpoints) if (!c.manual && c.cp > state.checkpoint && p.pos.x + p.width / 2 >= c.x) state.checkpoint = c.cp;
    setUi({ near: null, map: null, nearExit: false, upPrompt: null, holdUpPrompt: null, holdDownPrompt: null });
    // (in through the portal: not his till the land's opened on him)
    const arriving = !!fs.arrive && tickPortalArrival(state, fs.arrive, sec.cameraRow?.(state) ?? 550);
    if (fs.arrive && !arriving) fs.arrive = undefined;
    if (arriving) controls = { ...NO_CONTROLS };
    // (in the water anywhere: he swims, his air goes while he's under; and whoever's knocked in drowns)
    updateSwimAir(ctx, (x, y) => waterAt(state, x, y));
    drownLanders(ctx, (x, y) => waterAt(state, x, y));
    let out = sec.update ? sec.update(ctx, controls) : controls;
    out = updateGrab(ctx, fs.grab, out);
    if (arriving) out = { ...NO_CONTROLS };
    // (a cutscene in any section: none of his own controls get through (no shooting, no moves: the playtest); only
    // what the scene itself scripts him to do (a walk, a hop), never a shot or a special)
    if (p.inCutscene && p.health > 0) {
      const scripted = out !== controls;
      out = scripted ? { ...NO_CONTROLS, left: !!out.left, right: !!out.right, up: !!out.up, down: !!out.down, jump: !!out.jump } : { ...NO_CONTROLS };
    }
    // (a cutscene in any section: no HUD; the HUD's look: Wilderness Land's, everywhere in it)
    setUi({ introCutscene: !!p.inCutscene, zone: 'frontier' });
    return out;
  },
  waterBodyAt: (state, x, y) => waterAt(state, x, y),
  // (dirt underfoot; the logs, the decks and the ledges are wood)
  footstep: (_state, floor) => (floor.oneWay ? 'wood' : 'dirt'),
  drawBackdrop: (c, state) => {
    const sec = current(state);
    if (sec.drawBackdrop?.(c, state)) return true;
    return frontierSky(c, state);
  },
  drawBack: (c, state) => { for (const id of near(state)) ALL[id].drawBack?.(c, state); },
  drawFront: (c, state) => {
    // (a grab's in the play plane: anything the sections draw in front of him goes in front of it too)
    const fs = getFrontier(state) as FrontierState | null;
    if (fs) drawGrab(c, state, fs.grab);
    for (const id of near(state)) ALL[id].drawFront?.(c, state);
    drawAir(c, state);
  },
  drawHud: (c, state) => {
    const sec = current(state);
    drawNotedSunFlare(c, sec.outdoors?.(state) ?? 0, sec.cylinder ? undefined : state);
    sec.drawHud?.(c, state);
    const fs = getFrontier(state) as FrontierState | null;
    if (fs?.arrive) drawPortalArrival(c, state, fs.arrive);
  },
  zoom: (state) => current(state).zoom?.(state) ?? null,
  holdTick: (ctx) => current(ctx.state).holdTick?.(ctx) ?? false,
  // (a section's own lighting if it has one; else outdoors, the time of day's (timeOfDay.ts); indoors, none)
  lighting: (state) => {
    const sec = current(state);
    if (sec.lighting) return sec.lighting(state);
    const out = sec.outdoors?.(state) ?? 0;
    return out > 0 ? todLight(near(state).flatMap(id => ALL[id].lamps?.(state) ?? []), out) : null;
  },
  cameraRow: (state) => current(state).cameraRow?.(state),
  cylinder: (state) => current(state).cylinder?.(state) ?? null,
  worldTilt: (state) => current(state).worldTilt?.(state) ?? null,
};
