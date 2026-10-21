// THE FRONTIER: section 1 of Wilderness Land (the park's version of the wilderness, stocked with real animals). Platform
// heavy, as Jungle Land's opening is: up over fiberglass boulders, along fake-rock shelves (some loose), over ravines;
// the land's new mechanic, the ROLLING LOGS (logs.ts), taught on a still pond and built on (the creek, the rapids, the
// long river to the falls); the hazards (hazards.ts: bear traps, pine cones, loose edges, beehives, the log pile); the
// wildlife (kinds.ts). Laid out in layout.ts (teach, then escalate); at its end LONESOME PINE STATION and Tucker
// (station.ts), whose scene sends him on to the train.
//
// The ways: the land's start (no going off its left); its right end, after the station's scene (or on a revisit), on
// to the train (DOORS.train.start); back from the train, he's on the platform (DOORS.wilds.end).

import { pickLine } from '../../../m1/game/platform/speech';
import type { EnemyKind } from '../../../m1/types';
import type { Light } from '../../../m1/game/render/lighting';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { timeOfDay } from '../../timeOfDay';
import type { FrontierSection } from '../section';
import { layOwn, ledge, solid, meatheadSays, byPants, endExits, runExits } from '../section';
import { SECTIONS, GY } from '../geometry';
import { GROUND, LEDGES, BOULDERS, ANIMALS, PICKUPS, CHECKPOINTS, WATERS, STATION, X, Y } from './layout';
import { wildsOf } from './state';
import { waterAt, layWaterSteps, waterZones, carrySwimmer, surfaceY, drawWaterFront } from './water';
import { buildLogs, updateLogs, updateFalls, updateBranches, drawLogs, drawBoomAndBranches } from './logs';
import { buildHazards, updateTraps, updatePines, updateLoose, updateBees, updateRollers, updateQuills, drawHazardsBack, drawHazardsFront } from './hazards';
import { updateLeeches, drawLeeches } from './leeches';
import { drawWildsBackdrop, drawWildsBack } from './art';
import { updateStation, drawStationBack, drawStationFront, drawStationHud, stationGone } from './station';
import { ARRIVE, GAGS } from './lines';
import { tickHurtGag, drawHurtGag } from '../../hurtGags';
import './kinds';

const { x0, x1 } = SECTIONS.wilds;

/** Once each, passing: [the gag, from x (from the section's start)]. */
const GAG_AT: [keyof typeof GAGS, number][] = [
  ['trap', 470], ['log', 2860], ['wolves', 4900], ['leeches', 6240], ['rapids', 10420], ['bison', 13360], ['falls', 15480], ['tracks', 18820],
];

export const wilds: FrontierSection = {
  id: 'wilds', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    layOwn(state, GROUND.map(([a, b, h1, h2]) => ({ x1: X(a), y1: Y(h1), x2: X(b), y2: Y(h2), surface: 'dirt' })));
    // (the land's start: no going off the left of it; the station's end: no walking off it till the train's gone)
    state.blocks.push({ x: x0 - 40, y: -4000, w: 40, h: 4000 + GY + 400, type: 'wall', hidden: true, tag: 'wilds-start' });
    state.blocks.push({ x: x1, y: -4000, w: 40, h: 4000 + GY + 400, type: 'wall', hidden: true, tag: 'wilds-end' });
    for (const [a, b, h] of LEDGES) ledge(state, X(a), Y(h), X(b) - X(a), { hidden: true });
    for (const [a, b, h] of BOULDERS) solid(state, X(a), Y(h), X(b) - X(a), h + 4, { hidden: true });
    layWaterSteps(state);
    wildsOf(state);
    buildLogs(state);
    buildHazards(state);
    for (const [kind, rx, h] of ANIMALS) {
      // (a beaver in its water, its bottom under the surface; a hive hanging from h; a crow, a hawk flying at h; a goose
      // grazing on the ground at h)
      let feet = Y(h);
      if (kind === 'm2:fr_beaver' || kind === 'm2:fr_trout') { const w = WATERS.find(q => X(rx) > q.a && X(rx) < q.b); feet = (w ? surfaceY(w) : GY) + (kind === 'm2:fr_trout' ? 40 : 10); }
      if (kind === 'm2:fr_hive') feet = Y(h) + 30;
      const e = makeKindEnemy(kind as EnemyKind, X(rx), feet);
      e.homeX ??= e.pos.x; e.homeY = e.pos.y; e.variant = Math.abs(rx) % 7;
      state.enemies.push(e);
    }
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `wilds-${rx}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, w = wildsOf(state);
    const rx = p.pos.x + p.width / 2 - x0;
    let out = updateStation(ctx, controls);
    out = updateTraps(ctx, out);
    // (a bear trap on his ankle: him, hopping in it (hurtGags.ts))
    tickHurtGag(state);
    out = updateLogs(ctx, out);
    out = updateLeeches(ctx, out);
    updatePines(ctx); updateLoose(ctx); updateBees(ctx); updateRollers(ctx); updateQuills(ctx); updateBranches(ctx); updateFalls(ctx);
    carrySwimmer(state); waterZones(state);
    // What he's got to say about it (once each)
    const once = (k: string, pool: string[]) => { if (!w.said[k] && !p.inCutscene && p.health > 0) { w.said[k] = true; meatheadSays(state, pickLine(pool), false); } };
    if (state.checkpoint === 0 && rx < 400 && state.frame > 40) once('arrive', byPants(state, ARRIVE));
    for (const [k, at] of GAG_AT) if (rx > at && rx < at + 400) once(k, byPants(state, GAGS[k]));
    // (on to the train: off the platform's right end, once the train's gone)
    if (stationGone(state)) runExits(state, endExits('wilds', { left: false }));
    return out;
  },
  waterBodyAt: (_state, x, y) => waterAt(x, y),
  drawBackdrop: (c, state) => drawWildsBackdrop(c, state),
  drawBack: (c, state) => {
    // (the water's body is drawn in among the ground: drawWildsBack)
    drawWildsBack(c, state);
    drawStationBack(c, state);
    drawHazardsBack(c, state);
    drawLogs(c, state);
  },
  drawFront: (c, state) => {
    drawHurtGag(c, state);
    drawLeeches(c, state);
    drawWaterFront(c, state);
    drawBoomAndBranches(c, state);
    drawHazardsFront(c, state);
    drawStationFront(c, state);
  },
  drawHud: (c, state) => drawStationHud(c, state),
  cameraRow: () => 500,
  outdoors: () => 1,
  // (after dark: the station's lamps, the engine's headlamp)
  lamps: (): Light[] => (timeOfDay().lamps > 0.05 ? [{ x: STATION.depot - 27, y: Y(STATION.deck.h) - 90, r: 110, a: 0.7, color: '#FFD08A' }, { x: STATION.engineFront - 12, y: Y(STATION.deck.h) - 70, r: 160, a: 0.8, color: '#FEF08A' }] : []),
};
