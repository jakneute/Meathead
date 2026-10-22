// Fairy Land (land id `fantasy`): the stage. Built the way Wilderness Land is (frontier/index.ts): its sections (see
// geometry.ts) each in a folder of their own, each a FantasySection (section.ts: Adventure Land's Section with Fairy
// Land's ids); this runs whichever one he's in, keeps the camera to it, and puts him back at the right checkpoint after
// dying. The land's mechanic, the enchanted staircases (stairs.ts), is each section's to place; their riding runs in
// the sections' updates.
//
// Shared file (see OWNERSHIP.md): section owners may only append minimally, and must re-read it before editing.

import { sleepFar, wakeNear } from '../dormant';
import { fenced } from '../../m1/game/render/fence';
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
import { SECTIONS, SECTION_ORDER, type FantasyId } from './geometry';
import { getFantasy, newLandVisit, type Fantasy, type FantasySection } from './section';
import { fairySky } from './kit';
import { clearPiperLines } from './piperLines';
import { MONUMENT_AT } from './monument';
import { square } from './square';
import { wheel } from './wheel';
import { glen } from './glen';
import { tragons } from './tragons';
import { keep } from './keep';
import { broom, tickShatter, drawShatter } from './broom';
import { bedroom } from './bedroom';
import type { Zone } from '../hudThemes';
export { FANTASY_VOICE_LINES } from './voices';

export const FANTASY_STAGE = 'M2 Fairy Land';

const ALL: Record<FantasyId, FantasySection> = { square, wheel, glen, tragons, keep, broom, bedroom };
const sectionAt = (x: number): FantasySection => {
  for (const id of SECTION_ORDER) { const s = ALL[id]; if (x >= s.x0 && x < s.x1) return s; }
  // (between sections, or off the end of one: the nearest)
  let best = ALL.square, bestD = Infinity;
  for (const id of SECTION_ORDER) { const s = ALL[id], d = x < s.x0 ? s.x0 - x : x - s.x1; if (d < bestD) { bestD = d; best = s; } }
  return best;
};
const current = (state: GameState) => ALL[getFantasy(state)?.section ?? 'square'];
/** The HUD's look for where he is (hudSkins/fantasy.tsx): a skin per section (the castle's base and its runway apart). */
const hudZone = (id: FantasyId, x: number): Zone => {
  if (id === 'square') return 'fantasy';
  if (id === 'bedroom') return 'piper';
  if (id === 'keep') return x - SECTIONS.keep.x0 >= 9000 ? 'runway' : 'keep';
  return id;
};
/** Every checkpoint in the stage, in order (the checkpoint-skip cheat lists them all). */
export const FANTASY_CHECKPOINTS = SECTION_ORDER.flatMap(id => ALL[id].checkpoints).sort((a, b) => a.cp - b.cp);

interface FantasyState extends Fantasy {
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

export const fantasyLayout: StageLayout = {
  left: SECTIONS.square.x0 - 300,
  startX: SECTIONS.square.x0 + 150,
  verticalCamera: true,
  startsStanding: true,
  build: (state) => {
    // (a fresh way into the land (a door/portal/cheat sent him here, or the dev start), not a respawn: section.ts's
    // landVisit, for what has to outlive a death but not a new visit)
    const fresh = isLeaving() || (import.meta.env.DEV && !devStarted);
    if (fresh) newLandVisit();
    // (a new life: Piper's lines all sayable again (piperLines.ts))
    clearPiperLines();
    arrived(); stopWeapons();
    { const g = takeGut(); if (g) state.player.gut = g; }
    const fs: FantasyState = { section: 'square', s: {}, grab: createGrab(state), grace: GRACE, held: new Set(), arrive: takePortalArrival() ? startPortalArrival() : undefined };
    state.stage = fs;
    for (const id of SECTION_ORDER) ALL[id].build(state);
    // (the checkpoint-skip cheat: where he picked to start, the first time in)
    { const pick = takeStartCheckpoint(); if (pick !== null) state.checkpoint = pick; }
    // (in dev, ?fantasy=<checkpoint> starts there, the first time)
    if (import.meta.env.DEV && !devStarted) { devStarted = true; const q = new URLSearchParams(location.search).get('fantasy'); if (q) state.checkpoint = +q; }
    const cp = FANTASY_CHECKPOINTS.find(c => c.cp === state.checkpoint) ?? FANTASY_CHECKPOINTS[0];
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
    const fs = getFantasy(state) as FantasyState | null;
    if (import.meta.env.DEV) (window as unknown as { __m2: GameState }).__m2 = state;
    if (isLeaving()) { stopWeapons(); carryGut(state.player.gut); state.player.vel.x = 0; return { ...NO_CONTROLS }; }
    if (!fs) return controls;
    // (in through Piper's window: the glass flying apart over the scene, him held a moment: broom/fight.ts)
    tickShatter(state);
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
    if (fs.lastSec !== sec.id) { fs.lastSec = sec.id; state.viewIsScreen = false; state.camera.x = Math.max(lim.min, Math.min(lim.max, p.pos.x + p.width / 2 - CANVAS_WIDTH / 2)); }
    // (passing a checkpoint: it's his)
    for (const c of sec.checkpoints) if (!c.manual && c.cp > state.checkpoint && p.pos.x + p.width / 2 >= c.x) state.checkpoint = c.cp;
    setUi({ near: null, map: null, nearExit: false, upPrompt: null, holdUpPrompt: null, holdDownPrompt: null, logTip: false });
    // (in through the portal: not his till the land's opened on him)
    const arriving = !!fs.arrive && tickPortalArrival(state, fs.arrive, sec.cameraRow?.(state) ?? 550);
    if (fs.arrive && !arriving) fs.arrive = undefined;
    if (arriving) controls = { ...NO_CONTROLS };
    let out = sec.update ? sec.update(ctx, controls) : controls;
    out = updateGrab(ctx, fs.grab, out);
    if (arriving) out = { ...NO_CONTROLS };
    // (a cutscene in any section: none of his own controls get through (no shooting, no moves); only what the scene
    // itself scripts him to do (a walk, a hop), never a shot or a special)
    if (p.inCutscene && p.health > 0) {
      const scripted = out !== controls;
      out = scripted ? { ...NO_CONTROLS, left: !!out.left, right: !!out.right, up: !!out.up, down: !!out.down, jump: !!out.jump } : { ...NO_CONTROLS };
    }
    // (a cutscene in any section: no HUD; the HUD's look: the section he's in)
    setUi({ introCutscene: !!p.inCutscene, zone: hudZone(sec.id as FantasyId, p.pos.x + p.width / 2) });
    return out;
  },
  waterBodyAt: (state, x, y) => sectionAt(x).waterBodyAt?.(state, x, y) ?? null,
  // (cobbles and flagstones underfoot; the staircases, the balconies and the ledges are wood)
  footstep: (_state, floor) => (floor.oneWay ? 'wood' : 'hard'),
  drawBackdrop: (c, state) => {
    const sec = current(state);
    if (sec.drawBackdrop && fenced(c, sec.id, () => sec.drawBackdrop!(c, state), 'drawBackdrop')) return true;
    return fairySky(c, state, MONUMENT_AT[sec.id]);
  },
  drawBack: (c, state) => { for (const id of near(state)) { const s = ALL[id]; if (s.drawBack) fenced(c, id, () => s.drawBack!(c, state), 'drawBack'); } },
  drawFront: (c, state) => {
    // (a grab's in the play plane: anything the sections draw in front of him goes in front of it too)
    const fs = getFantasy(state) as FantasyState | null;
    if (fs) drawGrab(c, state, fs.grab);
    for (const id of near(state)) { const s = ALL[id]; if (s.drawFront) fenced(c, id, () => s.drawFront!(c, state), 'drawFront'); }
  },
  drawHud: (c, state) => {
    const sec = current(state);
    drawNotedSunFlare(c, sec.outdoors?.(state) ?? 0, sec.cylinder ? undefined : state);
    if (sec.drawHud) fenced(c, sec.id, () => sec.drawHud!(c, state), 'drawHud');
    const fs = getFantasy(state) as FantasyState | null;
    if (fs?.arrive) drawPortalArrival(c, state, fs.arrive);
    drawShatter(c);
  },
  zoom: (state) => current(state).zoom?.(state) ?? null,
  holdTick: (ctx) => current(ctx.state).holdTick?.(ctx) ?? false,
  // (outdoors, the time of day's (timeOfDay.ts); indoors, none; a section's own lighting on top of that if it has one)
  lighting: (state) => {
    const sec = current(state);
    const out = sec.outdoors?.(state) ?? 0;
    const base = out > 0 ? todLight(near(state).flatMap(id => ALL[id].lamps?.(state) ?? []), out) : null;
    // (a section's own built on that: Truelling Tragons' mountain dark)
    return sec.lighting ? sec.lighting(state, base) : base;
  },
  cameraRow: (state) => current(state).cameraRow?.(state),
  cylinder: (state) => current(state).cylinder?.(state) ?? null,
  worldTilt: (state) => current(state).worldTilt?.(state) ?? null,
};
