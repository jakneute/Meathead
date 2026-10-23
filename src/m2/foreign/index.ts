// Foreign Lands: the stage. Built the way Hollywood Land is (hollywood/index.ts): its sections (see geometry.ts) each
// in a folder of their own, each a ForeignSection (section.ts: Adventure Land's Section with Foreign Lands' ids); this
// runs whichever one he's in, keeps the camera, and puts him back at the right checkpoint after dying.
//
// THE STREETS ARE ONE WALK (the user: fewer raw transitions): the pavilions sit back to back along the lagoon
// promenade, and the camera runs along the whole of it (no section limits, no snap walking from one into the next).
// What they share runs here once a frame: the cast's shots (shots.ts), their barks and the PA's words over it all, the
// one backdrop (backdrop.ts: the sky, the lagoon and its fireworks barge, each pavilion's far landmark slid in by
// parallax). The helipad's on the end of the walk; the cut section (Harry's arena) keeps to its own stretch.
//
// Shared file (see OWNERSHIP.md): section owners may only append minimally, and must re-read it before editing.

import { sleepFar, wakeNear } from '../dormant';
import { fenced } from '../../m1/game/render/fence';
import { updateSwimAir, drawAir } from './air';
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
import { SECTIONS, SECTION_ORDER, STREETS_X0, STREETS_X1, isStreet, type ForeignId } from './geometry';
import { getForeign, newLandVisit, saidOver, type Foreign, type ForeignSection } from './section';
import { streetsOf } from './state';
import { updateShots, drawShots } from './shots';
import { drawStreetsBackdrop } from './backdrop';
import { mexico } from './mexico';
import { norway } from './norway';
import { china } from './china';
import { germany } from './germany';
import { italy } from './italy';
import { japan } from './japan';
import { morocco } from './morocco';
import { france } from './france';
import { uk } from './uk';
import { canada } from './canada';
import { heli } from './heli';
import { harry } from './harry';
export { FOREIGN_VOICE_LINES } from './voices';

export const FOREIGN_STAGE = 'M2 Foreign Lands';

const ALL: Record<ForeignId, ForeignSection> = { mexico, norway, china, germany, italy, japan, morocco, france, uk, canada, heli, harry };
const sectionAt = (x: number): ForeignSection => {
  for (const id of SECTION_ORDER) { const s = ALL[id]; if (x >= s.x0 && x < s.x1) return s; }
  let best = ALL.mexico, bestD = Infinity;
  for (const id of SECTION_ORDER) { const s = ALL[id], d = x < s.x0 ? s.x0 - x : x - s.x1; if (d < bestD) { bestD = d; best = s; } }
  return best;
};
const current = (state: GameState) => ALL[getForeign(state)?.section ?? 'mexico'];
/** Every checkpoint in the stage, in order (the checkpoint-skip cheat lists them all). */
export const FOREIGN_CHECKPOINTS = SECTION_ORDER.flatMap(id => ALL[id].checkpoints).sort((a, b) => a.cp - b.cp);

interface ForeignState extends Foreign {
  grab: Grab;
  grace: number; held: Set<Enemy>;
  lastSec?: string;
  arrive?: PortalArrival;
}
const GRACE = 120, GRACE_RANGE = 650;
let devStarted = false;

/** The camera's limits where he is: along the whole of the streets, or a cut section's own (or its own say). */
const limitsOf = (state: GameState, sec: ForeignSection) =>
  sec.cameraX?.(state) ?? (isStreet(sec.id) ? { min: STREETS_X0, max: STREETS_X1 - CANVAS_WIDTH } : { min: sec.x0, max: sec.x1 - CANVAS_WIDTH });

/** Every section that might be on screen (drawn either side of the one he's in, so there's never a gap). */
const near = (state: GameState) => SECTION_ORDER.filter(id => { const s = ALL[id]; return s.x1 > state.camera.x - 300 && s.x0 < state.camera.x + CANVAS_WIDTH + 300; });

export const foreignLayout: StageLayout = {
  left: SECTIONS.mexico.x0 - 300,
  startX: SECTIONS.mexico.x0 + 150,
  verticalCamera: true,
  startsStanding: true,
  build: (state) => {
    const fresh = isLeaving() || (import.meta.env.DEV && !devStarted);
    if (fresh) newLandVisit();
    arrived(); stopWeapons();
    { const g = takeGut(); if (g) state.player.gut = g; }
    const fs: ForeignState = { section: 'mexico', s: {}, grab: createGrab(state), grace: GRACE, held: new Set(), arrive: takePortalArrival() ? startPortalArrival() : undefined };
    state.stage = fs;
    for (const id of SECTION_ORDER) ALL[id].build(state);
    { const pick = takeStartCheckpoint(); if (pick !== null) state.checkpoint = pick; }
    // (in dev, ?foreign=<checkpoint> starts there, the first time)
    if (import.meta.env.DEV && !devStarted) { devStarted = true; const q = new URLSearchParams(location.search).get('foreign'); if (q) state.checkpoint = +q; }
    const cp = FOREIGN_CHECKPOINTS.find(c => c.cp === state.checkpoint) ?? FOREIGN_CHECKPOINTS[0];
    fs.section = sectionAt(cp.x).id;
    if (cp.clear) {
      const [l, r] = cp.clear;
      state.enemies = state.enemies.filter(e => { const ex = e.pos.x + e.width / 2; return ex < cp.x - l || ex > cp.x + r; });
    }
    const p = state.player;
    p.pos.x = cp.x - p.width / 2; p.pos.y = cp.y - p.height; p.vel.x = 0; p.vel.y = 0;
    state.camera.x = cp.x - CANVAS_WIDTH / 2;
    // (the cast of every pavilion but the one he's in: asleep till he's near (dormant.ts))
    sleepFar(state);
    return { x: cp.x, y: cp.y };
  },
  update: (ctx, controls) => {
    const { state } = ctx;
    const fs = getForeign(state) as ForeignState | null;
    if (import.meta.env.DEV) (window as unknown as { __m2: GameState }).__m2 = state;
    if (isLeaving()) { stopWeapons(); carryGut(state.player); state.player.vel.x = 0; return { ...NO_CONTROLS }; }
    if (!fs) return controls;
    wakeNear(state);
    const p = state.player;
    if (fs.grace > 0) {
      fs.grace--;
      for (const e of state.enemies) {
        if (e.type === 'boss' || e.health <= 0 || e.isBlownAway) continue;
        if (fs.grace > 0 && Math.abs(e.pos.x + e.width / 2 - (p.pos.x + p.width / 2)) < GRACE_RANGE && (e.pauseTimer ?? 0) <= 2) { e.puppet = true; e.pauseTimer = 2; e.vel.x = 0; fs.held.add(e); }
      }
      if (fs.grace === 0) { for (const e of fs.held) e.puppet = false; fs.held.clear(); }
    }
    const sec = sectionAt(p.pos.x + p.width / 2);
    fs.section = sec.id;
    const lim = limitsOf(state, sec);
    state.cameraMinX = lim.min; state.cameraMaxX = lim.max;
    // (a cut into a section, or back at a checkpoint: the camera's put right on him; walking along the streets it just
    // follows him, whichever pavilion it is)
    const want = Math.max(lim.min, Math.min(lim.max, p.pos.x + p.width / 2 - CANVAS_WIDTH / 2));
    if (fs.lastSec !== sec.id) { if (!fs.lastSec || !(isStreet(sec.id) && isStreet(fs.lastSec as ForeignId)) || Math.abs(want - state.camera.x) > CANVAS_WIDTH) state.camera.x = want; fs.lastSec = sec.id; }
    // (a section's manual ones (the helicopter's landmarks, all at the one x) only ever by its own code: walked past,
    // standing there on a respawn at the second fired them all and started him at the last)
    for (const c of sec.checkpoints) if (!c.manual && c.cp > state.checkpoint && p.pos.x + p.width / 2 >= c.x) state.checkpoint = c.cp;
    setUi({ near: null, map: null, nearExit: false, upPrompt: null, holdUpPrompt: null, holdDownPrompt: null });
    // (out of the helicopter: the HUD's his own again)
    if (sec.id !== 'heli') setUi({ heliHud: false });
    const arriving = !!fs.arrive && tickPortalArrival(state, fs.arrive, sec.cameraRow?.(state) ?? 550);
    if (fs.arrive && !arriving) fs.arrive = undefined;
    if (arriving) controls = { ...NO_CONTROLS };
    // (the streets' shared business: what the cast throw)
    if (isStreet(sec.id)) updateShots(ctx);
    // (in the water anywhere: he swims, and his air goes while he's under)
    updateSwimAir(ctx, (x, y) => sectionAt(x).waterBodyAt?.(state, x, y) ?? null);
    // (and the cast that end up in it drown: nobody here can swim)
    drownLanders(ctx, (x, y) => sectionAt(x).waterBodyAt?.(state, x, y) ?? null);
    let out = sec.update ? sec.update(ctx, controls) : controls;
    out = updateGrab(ctx, fs.grab, out);
    if (arriving) out = { ...NO_CONTROLS };
    // (the HUD's look: the pavilion he's in (hudSkins/foreign.tsx); through the land's gate, the passport)
    setUi({ introCutscene: !!p.inCutscene, zone: sec.id === 'mexico' && p.pos.x + p.width / 2 < SECTIONS.mexico.x0 + 600 ? 'foreign' : sec.id as ForeignId });
    return out;
  },
  waterBodyAt: (state, x, y) => sectionAt(x).waterBodyAt?.(state, x, y) ?? null,
  drawBackdrop: (c, state) => {
    const sec = current(state);
    if (sec.drawBackdrop && fenced(c, sec.id, () => sec.drawBackdrop!(c, state), 'drawBackdrop')) return true;
    return drawStreetsBackdrop(c, state);
  },
  drawBack: (c, state) => { for (const id of near(state)) { const s = ALL[id]; if (s.drawBack) fenced(c, id, () => s.drawBack!(c, state), 'drawBack'); } },
  drawFront: (c, state) => {
    const fs = getForeign(state) as ForeignState | null;
    if (fs) drawGrab(c, state, fs.grab);
    for (const id of near(state)) { const s = ALL[id]; if (s.drawFront) fenced(c, id, () => s.drawFront!(c, state), 'drawFront'); }
    // (the streets' shared: what's flying, who's saying what over their heads, the PA's words up top)
    drawShots(c, state);
    drawAir(c, state);
    const o = streetsOf(state);
    for (const e of state.enemies) { const s = o.barks.get(e); if (s && e.health > 0) saidOver(c, s.text, e.pos.x + e.width / 2, e.pos.y - 18, '#BFDBFE', 220); }
    if (o.pa) saidOver(c, o.pa.text, state.camera.x + CANVAS_WIDTH / 2 + 120, state.camera.y + 150, '#FDE68A', 320);
  },
  drawHud: (c, state) => {
    const sec = current(state);
    drawNotedSunFlare(c, sec.outdoors?.(state) ?? 0, sec.cylinder ? undefined : state);
    if (sec.drawHud) fenced(c, sec.id, () => sec.drawHud!(c, state), 'drawHud');
    const fs = getForeign(state) as ForeignState | null;
    if (fs?.arrive) drawPortalArrival(c, state, fs.arrive);
  },
  zoom: (state) => current(state).zoom?.(state) ?? null,
  holdTick: (ctx) => current(ctx.state).holdTick?.(ctx) ?? false,
  lighting: (state) => {
    const sec = current(state);
    if (sec.lighting) return sec.lighting(state);
    const out = sec.outdoors?.(state) ?? 0;
    // (the lamps of every section on screen: a pavilion's lanterns don't go out the moment he steps into the next)
    return out > 0 ? todLight(near(state).flatMap(id => ALL[id].lamps?.(state) ?? []), out) : null;
  },
  cameraRow: (state) => current(state).cameraRow?.(state),
  cylinder: (state) => current(state).cylinder?.(state) ?? null,
  worldTilt: (state) => current(state).worldTilt?.(state) ?? null,
};
