// Adventure Land: the stage. Its sections (see geometry.ts) each in a folder of their own, each a Section (section.ts);
// this runs whichever one he's in, keeps the camera to it, and puts him back at the right checkpoint after dying.
//
// The first pass is a crude one on purpose (prototype boxes and words, to get the feel of it before the real look).

import { sleepFar, wakeNear } from '../dormant';
import { fenced } from '../../m1/game/render/fence';
import type { StageLayout } from '../../m1/game/stages/index';
import type { GameState } from '../../m1/game/core/state';
import type { Enemy } from '../../m1/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../m1/constants';
import { NO_CONTROLS } from '../../m1/game/platform/input';
import { todLight } from '../timeOfDay';
import { drawNotedSunFlare } from '../sunFlare';
import { setUi, isLeaving, arrived, carryGut, takeGut, takeStartCheckpoint } from '../store';
import { stopWeapons } from '../weapons';
import { createGrab, updateGrab, drawGrab, type Grab } from '../moves/grab';
import { takePortalArrival, startPortalArrival, tickPortalArrival, drawPortalArrival, type PortalArrival } from '../portalArrival';
import { SECTIONS, SECTION_ORDER, type SectionId } from './geometry';
import { getAdv, type Adv, type Section } from './section';
import { jungle } from './jungle';
import { queue } from './queue';
import { river } from './river';
import { dino } from './dino';
import { temple } from './temple';
import { cart } from './cart';
import { roof } from './roof';
import { clearing } from './clearing';
import { onLandLeft } from '../landCaches';
import { clearOrbitSprites } from './clearing/orbit';

export const ADV_STAGE = 'M2 Adventure Land';
// (what's only wanted here, let go once he's gone: landCaches.ts)
onLandLeft(ADV_STAGE, () => clearOrbitSprites());

const ALL: Record<SectionId, Section> = { jungle, queue, river, dino, temple, cart, roof, clearing };
const sectionAt = (x: number): Section => {
  for (const id of SECTION_ORDER) { const s = ALL[id]; if (x >= s.x0 && x < s.x1) return s; }
  // (between sections, or off the end of one: the nearest, never the jungle's for nothing)
  let best = ALL.jungle, bestD = Infinity;
  for (const id of SECTION_ORDER) { const s = ALL[id], d = x < s.x0 ? s.x0 - x : x - s.x1; if (d < bestD) { bestD = d; best = s; } }
  return best;
};
const current = (state: GameState) => ALL[getAdv(state)?.section ?? 'jungle'];
/** Every checkpoint in the stage, in order. */
export const ADV_CHECKPOINTS = SECTION_ORDER.flatMap(id => ALL[id].checkpoints).sort((a, b) => a.cp - b.cp);

interface AdvState extends Adv {
  grab: Grab;
  /** Just (re)started at a checkpoint: frames left of the grace, and who's being held off for it. */
  grace: number; held: Set<Enemy>;
  /** The section the camera was last put into. */
  lastSec?: string;
  /** In through the hub's portal: the land opening on him (portalArrival.ts). */
  arrive?: PortalArrival;
}
/** Starting again at a checkpoint, whatever's near it holds off a moment (he's not in danger the moment he's back). */
const GRACE = 120, GRACE_RANGE = 650;
let devStarted = false;

export const advLayout: StageLayout = {
  left: SECTIONS.jungle.x0 - 200,
  startX: SECTIONS.jungle.x0 + 150,
  verticalCamera: true,
  startsStanding: true,
  build: (state) => {
    arrived(); stopWeapons();
    { const g = takeGut(); if (g) state.player.gut = g; }
    const adv: AdvState = { section: 'jungle', s: {}, grab: createGrab(state), grace: GRACE, held: new Set(), arrive: takePortalArrival() ? startPortalArrival() : undefined };
    state.stage = adv;
    for (const id of SECTION_ORDER) ALL[id].build(state);
    // (back from dying: at the checkpoint he'd got to)
    // (the checkpoint-skip cheat: where he picked to start, the first time in)
    { const pick = takeStartCheckpoint(); if (pick !== null) state.checkpoint = pick; }
    // (in dev, ?adv=<checkpoint> starts there, the first time)
    if (import.meta.env.DEV && !devStarted) { devStarted = true; const q = new URLSearchParams(location.search).get('adv'); if (q) state.checkpoint = +q; }
    const cp = ADV_CHECKPOINTS.find(c => c.cp === state.checkpoint) ?? ADV_CHECKPOINTS[0];
    adv.section = sectionAt(cp.x).id;
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
    const adv = getAdv(state) as AdvState | null;
    if (import.meta.env.DEV) (window as unknown as { __m2: GameState }).__m2 = state;
    if (isLeaving()) { stopWeapons(); carryGut(state.player); state.player.vel.x = 0; return { ...NO_CONTROLS }; }
    if (!adv) return controls;
    wakeNear(state);
    const p = state.player;
    // (just back at a checkpoint: anything near holds off a moment, then it's itself again)
    if (adv.grace > 0) {
      adv.grace--;
      for (const e of state.enemies) {
        if (e.type === 'boss' || e.health <= 0 || e.isBlownAway) continue;
        if (adv.grace > 0 && Math.abs(e.pos.x + e.width / 2 - (p.pos.x + p.width / 2)) < GRACE_RANGE && (e.pauseTimer ?? 0) <= 2) { e.puppet = true; e.pauseTimer = 2; e.vel.x = 0; adv.held.add(e); }
      }
      if (adv.grace === 0) { for (const e of adv.held) e.puppet = false; adv.held.clear(); }
    }
    // Which section he's in (the one his middle's in), and the camera kept to it
    const sec = sectionAt(p.pos.x + p.width / 2);
    adv.section = sec.id;
    const lim = sec.cameraX?.(state) ?? { min: sec.x0, max: sec.x1 - CANVAS_WIDTH };
    state.cameraMinX = lim.min; state.cameraMaxX = lim.max;
    // (into a section (or back at a checkpoint): the camera's put right on him there, no gliding in from somewhere else)
    if (adv.lastSec !== sec.id) { adv.lastSec = sec.id; state.camera.x = Math.max(lim.min, Math.min(lim.max, p.pos.x + p.width / 2 - CANVAS_WIDTH / 2)); }
    // (passing a checkpoint: it's his)
    for (const c of sec.checkpoints) if (c.cp > state.checkpoint && p.pos.x + p.width / 2 >= c.x) state.checkpoint = c.cp;
    setUi({ near: null, map: null, nearExit: false });
    // (in through the portal: not his till the land's opened on him)
    const arriving = !!adv.arrive && tickPortalArrival(state, adv.arrive, sec.cameraRow?.(state) ?? 550);
    if (adv.arrive && !arriving) adv.arrive = undefined;
    if (arriving) controls = { ...NO_CONTROLS };
    let out = sec.update ? sec.update(ctx, controls) : controls;
    out = updateGrab(ctx, adv.grab, out);
    if (arriving) out = { ...NO_CONTROLS };
    // (a cutscene in any section: no HUD; and where he is, for its look: on the river, the boat or under it)
    setUi({ introCutscene: !!p.inCutscene, zone: sec.id === 'river' ? (p.swimming ? 'underwater' : 'boat') : sec.id });
    return out;
  },
  waterBodyAt: (state, x, y) => sectionAt(x).waterBodyAt?.(state, x, y) ?? null,
  drawBackdrop: (c, state) => {
    const sec = current(state);
    if (sec.drawBackdrop && fenced(c, sec.id, () => sec.drawBackdrop!(c, state), 'drawBackdrop')) return true;
    c.fillStyle = '#1F2937'; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    return true;
  },
  drawBack: (c, state) => {
    // (the ones either side too, so walking from one into the next there's no gap)
    for (const id of SECTION_ORDER) { const s = ALL[id]; if (s.x1 > state.camera.x - 200 && s.x0 < state.camera.x + CANVAS_WIDTH + 200) s.drawBack && fenced(c, id, () => s.drawBack!(c, state), 'drawBack'); }
  },
  drawFront: (c, state) => {
    for (const id of SECTION_ORDER) { const s = ALL[id]; if (s.x1 > state.camera.x - 200 && s.x0 < state.camera.x + CANVAS_WIDTH + 200) s.drawFront && fenced(c, id, () => s.drawFront!(c, state), 'drawFront'); }
    const adv = getAdv(state) as AdvState | null;
    if (adv) drawGrab(c, state, adv.grab);
  },
  // (the lens's ghosts off the sun, as outdoors as the section is (sunFlare.ts), under the section's own HUD things)
  drawHud: (c, state) => {
    const sec = current(state);
    drawNotedSunFlare(c, sec.outdoors?.(state) ?? 0, sec.cylinder ? undefined : state);
    if (sec.drawHud) fenced(c, sec.id, () => sec.drawHud!(c, state), 'drawHud');
    const adv = getAdv(state) as AdvState | null;
    if (adv?.arrive) drawPortalArrival(c, state, adv.arrive);
  },
  zoom: (state) => current(state).zoom?.(state) ?? null,
  holdTick: (ctx) => current(ctx.state).holdTick?.(ctx) ?? false,
  // (a section's own lighting if it has one; else outdoors, the time of day's (timeOfDay.ts); indoors, none)
  lighting: (state) => {
    const sec = current(state);
    if (sec.lighting) return sec.lighting(state);
    const out = sec.outdoors?.(state) ?? 0;
    return out > 0 ? todLight(sec.lamps?.(state) ?? [], out) : null;
  },
  cameraRow: (state) => current(state).cameraRow?.(state),
  cylinder: (state) => current(state).cylinder?.(state) ?? null,
};
