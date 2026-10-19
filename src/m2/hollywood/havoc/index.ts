// THE HAVOC: section 6 of Hollywood Land (owner: the havoc agent). Disaster: The Ride's lever made it real: every
// natural disaster at once, a total juxtaposition. Out the hole the ride's far wall left, onto the backlot under a red
// sky: lava rivers across the street, the plywood facades coming down flat (nothing behind them), a light tower over a
// lava river for a bridge, the wind throwing the street at him, the quake bringing down what's up, the Revengers
// billboard. Then THE FLOOD CLIMB: the water comes up the backlot and the only way is up, a staircase of three shafts as
// the buildings round him are demolished (the hotel's scaffold, the crane over STAGE 14 and its wrecking ball, the
// water tower's scaffold), ledges crumbling under him and behind him, chunks coming down. Up on the HAPPYWOOD sign's
// ridge (the flood goes back down), THE BLIZZARD: down the hill road in the snow, and at each AVALANCHE ZONE a concrete
// bunker: the hill rumbles, he gets in, and the avalanche (a wall of snow over the whole screen, far too tall to get
// over) goes over it. Out in the open it buries him (half his health). Then at the foot of the hill THE TORNADO comes
// down behind him and chases him on along the street to the end: touch it and he dies. It blows away everything it
// comes to; lesser takes on everything else come at him on the way (snow slides to jump, narrow lava, puddles, gusts,
// a few falling bits, hail). A first aid station (the big health and ammo, before Stuntman Steve), and the tornado
// surges, catches him and flings him (fling.ts: a cutscene, HUD hidden, SKIP >> for the lot) onto the stunt stage. If
// up there he rants about how a tornado launching zone can be SAFE (lines.ts SPIN).
//
// layout.ts lays it out; hazards.ts the disasters; chase.ts the bunkers, the avalanches and the tornado; fling.ts the
// fling; kinds.ts its people (looters, the storm crew, Poppy the popcorn mascot); civilians.ts the guests (he can't hurt
// them, the disasters can: civArt.ts draws what happens to them); art.ts draws it (snowzone.ts the blizzard's detail);
// lines.ts what's said.
//
// ~22000 px of play (the climb counted by how long it plays), ~4.5 min. Checkpoints 50-59. Outdoors: the time of
// day's light, the sky gone red.
//
// One-way set piece: the fling. Back from the stunt stage (DOORS.havoc.end, on the ground at the end) the tornado's
// spent (FLUNG_MEMO): no chase, no flood (gone down), no wind, quake or hail; the lava crusted over, the facades down,
// the snow banked up, the ledges solid. Walkable both ways; the right end on to the stunt stage from then on.

import type { GameState } from '../../../m1/game/core/state';
import type { EnemyKind } from '../../../m1/types';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { pickLine } from '../../../m1/game/platform/speech';
import { playSound } from '../../../m1/game/platform/audio';
import { CANVAS_WIDTH } from '../../../m1/constants';
import type { HollywoodSection } from '../section';
import { layOwn, solid, endWalls, endExits, runExits, meatheadSays, speak } from '../section';
import { byPants } from '../blvd/kinds';
import { paSay } from '../blvd';
import { LOOP, REAL } from '../disaster/lines';
import {
  x0, x1, X, Y, R, GY, RUNS, BUILDINGS, ENEMIES, PICKUPS, CHECKPOINTS, WIRES, groundH, FLOOD_AT, CLIMB, SHAFTS, COVERS,
  REFILL, WIND, QUAKE, HAIL, LAVA, CHASE_AT, TORNADO_FORM,
} from './layout';
import { hvOf, FLUNG_MEMO } from './state';
import './kinds';
import { buildHazards, updateHazards, updateLobs, spent } from './hazards';
import { buildCovers, updateChase, startTornado, formTornado, coverRoof, tearUpTo } from './chase';
import { startFling, updateFling, drawFlingHud, flinging } from './fling';
import { updateCivilians } from './civilians';
import { drawHavocBackdrop, drawHavocBack, drawHavocFront, havocLamps } from './art';
import * as L from './lines';

export { noteTornadoDeath, diedToTornado } from './state';

const pick = pickLine;

/** The narrator (the ride's, on the park's horns now): in turn, his words up top while he says them. */
const narrate = (state: GameState, line: string, onDone?: () => void) => {
  const hv = hvOf(state);
  speak(L.NARR, line, s => { hv.narr = s; }, true, onDone);
};
/** Once a stage run (kept across his deaths). */
const once = (state: GameState, k: string) => { const key = `hwh-said-${k}`; if (state.stageMemo[key]) return false; state.stageMemo[key] = '1'; return true; };
/** Once a life. */
const oncePer = (state: GameState, k: string) => { const hv = hvOf(state); if (hv.said[k]) return false; hv.said[k] = true; return true; };

/** Starting (or starting again): the flood and the tornado as they'd be from here; spent, the calm. Run on the first
 *  frame (the checkpoint-skip cheat sets the checkpoint after the build). */
const settle = (state: GameState) => {
  const hv = hvOf(state);
  const cp = CHECKPOINTS.find(c => c.cp === state.checkpoint);
  const cpRx = cp ? R(cp.x) : state.checkpoint >= 60 ? 99999 : -99999;
  buildCovers(state, cpRx);
  if (spent(state)) {
    // (the calm: the lava crusted, everything down, nothing crumbling)
    if (!hv.crusts.length) for (const l of LAVA) hv.crusts.push(solid(state, X(l.a), Y((l.hl + l.hr) / 2), l.b - l.a, 200, { hidden: true, tag: 'havoc-crust' }));
    for (const fl of hv.falls) fl.phase = 'down';
    hv.crumbs = [];
    hv.flood.on = false; hv.tornado.on = false;
    for (const av of hv.avalanches) av.phase = 'done';
    return;
  }
  const c = state.checkpoint;
  if (c === 53) Object.assign(hv.flood, { on: true, h: -60, wait: 70, wave: 0, drain: false });
  else if (c === 54) Object.assign(hv.flood, { on: true, h: 220, wait: 70, wave: 120, drain: false });
  else if (c === 55) Object.assign(hv.flood, { on: true, h: 740, wait: 70, wave: 120, drain: false });
  if (c >= 53 && c <= 55) hv.said.flooded = true;
  // (the hill: the flood's gone down; the chase: the tornado behind him, everything it's been past blown away)
  if (c >= 56 && c <= 59) hv.said.top = true;
  if (c === 58) { formTornado(state); hv.said.chase = true; tearUpTo(state, X(TORNADO_FORM)); }
  else if (c === 59 && cp) { startTornado(state, cp.x - 900, 100); hv.said.chase = true; tearUpTo(state, cp.x - 900); }
};

export const havoc: HollywoodSection = {
  id: 'havoc', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    layOwn(state, RUNS.map(([a, b, h1, h2]) => ({ x1: X(a), y1: Y(h1), x2: X(b), y2: Y(h2), surface: 'hard' as const })));
    // (the climb's buildings: STAGE 14, STAGE 15)
    for (const [bx, w, h] of BUILDINGS) solid(state, X(bx), Y(h), w, h, { hidden: true, tag: 'havoc-building' });
    // (the shelters' lids; the first aid tent's roof)
    COVERS.forEach((_, k) => { const r = coverRoof(k); solid(state, r.x, r.y, r.w, r.h, { hidden: true, tag: 'havoc-shelter' }); });
    solid(state, X(REFILL - 74), Y(118), 148, 18, { hidden: true, tag: 'havoc-tent' });
    endWalls(state, 'havoc');
    buildHazards(state);
    ENEMIES.forEach(([kind, rx, h], i) => {
      const e = makeKindEnemy(kind as EnemyKind, X(rx), Y(h ?? groundH(rx) ?? 0));
      e.homeX = e.pos.x; e.homeY = e.pos.y; e.initialY = e.pos.y;
      e.variant = (i * 7 + rx) % 23;
      state.enemies.push(e);
    });
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `havoc-${rx}-${type}`, pos: { x: X(rx) - 10, y: Y(h ?? groundH(rx) ?? 0) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, hv = hvOf(state);
    if (!hv.said.init) { hv.said.init = true; settle(state); }
    // The fling: it has him
    const cut = updateFling(ctx);
    if (cut) return cut;
    const done = spent(state);
    const ev = updateHazards(ctx);
    updateLobs(ctx);
    const cx = p.pos.x + p.width / 2, rx = R(cx), feet = p.pos.y + p.height, up = GY - feet;
    const alive = p.health > 0 && !p.inCutscene && state.deathTimer <= 0;
    // The flood comes (down on the canyon floor)
    if (!done && alive && !hv.said.flooded && rx > FLOOD_AT && rx < SHAFTS[0].b && up < 60) {
      hv.said.flooded = true;
      Object.assign(hv.flood, { on: true, h: -60, wait: 50, wave: 0, drain: false });
      playSound('tsunami', 1, -6); playSound('rumble', 0.8, -14);
      if (once(state, 'flood')) narrate(state, LOOP[4][0], () => meatheadSays(state, pick(L.GAG.flood), true));
      else meatheadSays(state, pick(L.GAG.flood), false);
    }
    // Up on the ridge: the flood goes back down; the blizzard
    if (!done && alive && !hv.said.top && rx >= CLIMB.b && up > 1480) {
      hv.said.top = true;
      if (hv.flood.on) hv.flood.drain = true;
      playSound('whoosh', 1, -16);
      if (once(state, 'top')) meatheadSays(state, pick(L.GAG.top), true, () => narrate(state, REAL.blizzard));
    }
    // Down off the hill (the last avalanche gone by): the tornado comes down behind him
    if (!done && alive && hv.said.top && !hv.said.chase && rx >= CHASE_AT && !hv.avalanches.some(a => a.phase === 'tell' || a.phase === 'run')) {
      hv.said.chase = true;
      formTornado(state);
      playSound('roar', 1, -18); playSound('whirl', 1, -10);
      if (once(state, 'chase')) narrate(state, L.NARR_HAVOC.tornado, () => meatheadSays(state, pick(L.GAG.tornado), true));
      else meatheadSays(state, pick(L.GAG.tornado), true);
    }
    // The bunkers and the avalanches, the tornado
    const ch = updateChase(ctx);
    // The guests (he can't hurt them; the disasters can)
    updateCivilians(ctx, ev);
    if (ch.caught) { startFling(ctx); return updateFling(ctx) ?? controls; }
    // What's said (talk less: each beat once)
    if (alive && !done) {
      if (rx < 900 && state.frame > 50 && once(state, 'arrive')) paSay(state, pick(byPants(state, L.PA_HAVOC)), () => meatheadSays(state, pick(L.ARRIVE), true));
      if (rx > 1050 && rx < 1300 && once(state, 'lava')) narrate(state, L.NARR_HAVOC.lava, () => meatheadSays(state, pick(L.GAG.lava), true));
      if (ev.fell?.how === 'flat' && once(state, 'facade')) meatheadSays(state, pick(L.GAG.facade), true);
      if (ev.fell?.how === 'bridge' && once(state, 'bridge')) meatheadSays(state, pick(L.GAG.bridge), true);
      if (ev.fell?.how === 'billboard' && once(state, 'billboard')) meatheadSays(state, pick(L.GAG.billboard), true);
      if (ev.gust && rx < WIND[0][1] && once(state, 'wind')) narrate(state, L.NARR_HAVOC.wind, () => meatheadSays(state, pick(L.GAG.wind), true));
      if (rx > 2400 && once(state, 'pa-leak')) paSay(state, pick(L.PA_LEAK_HAVOC));
      if (rx > 3950 && once(state, 'pa-steve')) paSay(state, L.PA_STEVE_HAVOC[0]);
      if (ev.quake && rx < QUAKE[0][1] && once(state, 'quake')) narrate(state, LOOP[0][0], () => meatheadSays(state, pick(L.GAG.quake), true));
      if (rx > SHAFTS[1].a && rx < SHAFTS[1].b && up > 620 && once(state, 'ball')) meatheadSays(state, pick(L.GAG.ball), true);
      if (ch.avalancheTell && rx < COVERS[0].b + 100 && once(state, 'cover')) narrate(state, L.NARR_HAVOC.avalanche, () => meatheadSays(state, pick(L.GAG.coverSign), true));
      if (ch.inCover && oncePer(state, 'inCover')) meatheadSays(state, pick(L.GAG.inCover), true);
      if (ch.ripped && once(state, 'rip')) meatheadSays(state, pick(L.GAG.rip), true);
      if (rx > 15800 && once(state, 'pa-steve-2')) paSay(state, L.PA_STEVE_HAVOC[1]);
      if (rx > WIND[1][0] && once(state, 'everything')) narrate(state, REAL.all, () => meatheadSays(state, pick(L.GAG.everything), true));
      if (ev.hail && rx > HAIL[0][0] && once(state, 'hail')) narrate(state, L.NARR_HAVOC.hail);
      if (rx > REFILL - 220 && once(state, 'refill')) meatheadSays(state, pick(L.GAG.refill), true);
      // (the first surge: the narrator, then him, in turn; after that just him, if nobody's talking)
      if (ch.surge) { if (once(state, 'surge')) narrate(state, L.NARR_HAVOC.surge, () => meatheadSays(state, pick(L.GAG.surge), true)); else meatheadSays(state, pick(L.GAG.surge), false); }
    }
    // The ways out: back into the ride (always); on to the stunt stage (once the tornado's spent: the fling's one-way)
    runExits(state, endExits('havoc').filter(e => e.x0 < X(10000) || done));
    return controls;
  },
  drawBackdrop: (c, state) => drawHavocBackdrop(c, state),
  drawBack: (c, state) => drawHavocBack(c, state),
  drawFront: (c, state) => drawHavocFront(c, state),
  drawHud: (c, state) => drawFlingHud(c, state),
  cameraX: (state) => {
    const t = hvOf(state).tornado;
    if (flinging(state)) return undefined;
    // (the chase: the tornado always just off the left of the view, never left behind)
    if (t.on && !spent(state)) return { min: Math.max(x0, Math.min(t.x - 260, x1 - CANVAS_WIDTH)), max: x1 - CANVAS_WIDTH };
    return undefined;
  },
  cameraRow: (state) => {
    const rx = R(state.player.pos.x + state.player.width / 2);
    // (up the climb: his feet lower on the screen, the way up in view)
    return rx > CLIMB.a && rx < CLIMB.b + 60 && !flinging(state) ? 430 : undefined;
  },
  outdoors: () => 1,
  lamps: (state) => havocLamps(state),
  wires: () => WIRES,
};

// (the fling's memo, for anybody who needs to know the tornado's spent)
export { FLUNG_MEMO };
