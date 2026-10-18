// SAWDUST GULCH AND THE MINES: section 3 of Wilderness Land. The train's run into the end of the line (train/engine.ts)
// cuts to the crash here (crash.ts: the wreck, Tucker thrown out face first, the paramedics), and leaves him at its
// smashed buffer stop. The user's design: "you then face a sequence of characters in this logging/mining town going
// through the town and the mines for a bit until you hit the log ride." Still the PARK's frontier (plywood false fronts,
// fake gold, the Wild West Show, guests, staff in costume breaking character); the real wilderness only comes after the
// log ride's sewer.
//
// The run (layout.ts, teach then escalate): the crash's aftermath (Tucker carried off to FIRST AID: never seen alive
// here), main street's characters (deputies, the snake-oil man, the barbershop quartet, the undertaker), the saloon's
// brawl (calm till he starts it: then everybody at everybody, last man out the back), the rooftops, the showdown's duel
// (DRAW!), the livery and the smithy, the mill pond (the land's ROLLING LOGS again: the birler, the fellers' TIMBER!,
// the jack ladder up to the mill), the sawmill's belts and head saw, the lumber yard, the Mother Lode Mine (murky,
// lantern-lit: cave-ins, ore chutes, runaway carts, TNT crates, the ride cart over the trestle and its low beams, the
// canary and the firedamp, the long flooded shaft), and up into the log ride's long queue.
//
// The playtest made it all bigger (the fronts, the doors, the saloon, the street) and pulled the camera back to take it
// in (view.ts: 0.8, further in the saloon); the mine's lights muted (soft glows, murky, never black).
//
// The cast: kinds.ts (drawn in kindArt.ts); what flies: throws.ts; what blows: blast.ts; the hazards: hazards.ts; the
// pond's logs: logs.ts; the scenes, the brawl and the duel: scenes.ts (the duel's death: duelDeath.ts); the art: art.ts;
// the lines: lines.ts.
//
// Checkpoints 20-29. The ways: in from the crash (DOORS.town.start); back off the left end to the train (the tender:
// DOORS.train.end); on off the right end (the queue) into the log ride (DOORS.logride.start), and back from it to the
// queue (DOORS.town.end).

import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { todLight, timeOfDay } from '../../timeOfDay';
import type { FrontierSection } from '../section';
import { layOwn, ledge, solid, endWalls, endExits, runExits } from '../section';
import { SECTIONS } from '../geometry';
import { frontierSky } from '../kit';
import { townOf } from './state';
import { GROUND, LEDGES, SOLIDS, CRATES, CAST, PICKUPS, CHECKPOINTS, SALOON, SQUARE, X, Y, inMine, inSaloon } from './layout';
import { givePine } from './kinds';
import { updateThrows, drawThrows } from './throws';
import { updateBlasts, drawBlasts, blastLights } from './blast';
import { waterAt, waterZones, layWaterSteps, buildHazards, updatePines, updateMine, updateRide, updateMill, updateCover, drawHazardsBack, drawHazardsFront, drawMineBits } from './hazards';
import { buildLogs, updateLogs, drawLogs, drawLadder } from './logs';
import { buildScenes, updateScenes, drawScenesFront, drawScenesHud, spawnTown, wreckHere, squareShut } from './scenes';
import { drawTownBackdrop, drawTownBack, drawWaterFront, townLamps } from './art';
import { updateZoom, zoomOf, spill } from './view';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import type { EnemyKind } from '../../../m1/types';

const { x0, x1 } = SECTIONS.town;

export const town: FrontierSection = {
  id: 'town', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    layOwn(state, GROUND.map(([a, b, h1, h2]) => ({ x1: X(a), y1: Y(h1), x2: X(b), y2: Y(h2), surface: 'dirt' })));
    endWalls(state, 'town');
    for (const [a, b, h] of LEDGES) ledge(state, X(a), Y(h), X(b) - X(a), { hidden: true });
    for (const [a, b, h, h2] of SOLIDS) solid(state, X(a), Y(h), X(b) - X(a), Y(h2 ?? 0) - Y(h), { hidden: true });
    layWaterSteps(state);
    const tw = townOf(state);
    buildHazards(state);
    buildLogs(state);
    tw.crates = CRATES.map(([rx, h]) => { const e = makeKindEnemy('m2:fr_tntcrate' as EnemyKind, X(rx), Y(h)); state.enemies.push(e); return e; });
    for (const [kind, rx, h, pine] of CAST) { const e = spawnTown(state, kind, rx, h); if (pine !== undefined) givePine(e, pine); }
    buildScenes(state);
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `town-${rx}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx;
    // (the camera pulled back: the whole view is the screen)
    updateZoom(state);
    state.viewIsScreen = true;
    let out = updateScenes(ctx, controls);
    out = updateLogs(ctx, out);
    updateThrows(ctx);
    updateBlasts(ctx);
    updatePines(ctx);
    updateMill(ctx);
    updateMine(ctx);
    updateRide(ctx);
    updateCover(state);
    waterZones(state);
    runExits(state, endExits('town'));
    return out;
  },
  waterBodyAt: (_state, x, y) => waterAt(x, y),
  // (the fights hold the camera on their room, the whole of it on screen; otherwise it's the section's, the pulled-back
  // view kept inside it)
  cameraX: (state) => {
    const tw = townOf(state);
    if (tw.saloon.state === 'on') { const c = (SALOON.a + SALOON.b) / 2 - CANVAS_WIDTH / 2; return { min: c, max: c }; }
    if (squareShut(state)) { const c = (SQUARE.a + SQUARE.b) / 2 - CANVAS_WIDTH / 2; return { min: c, max: c }; }
    const s = spill(state);
    return { min: x0 + s, max: x1 - CANVAS_WIDTH - s };
  },
  zoom: (state) => ({ scale: zoomOf(state), x: state.camera.x + CANVAS_WIDTH / 2, y: state.camera.y + 300 }),
  // (down the mine, his feet higher on the screen: what's above and below both in view)
  cameraRow: (state) => (inMine(state.player.pos.x + state.player.width / 2, state.player.pos.y + state.player.height) ? 400 : 510),
  drawBackdrop: (c, state) => drawTownBackdrop(c, state) || frontierSky(c, state),
  drawBack: (c, state) => {
    drawTownBack(c, state, wreckHere(state));
    drawMineBits(c, state);
    drawLadder(c, state);
    drawHazardsBack(c, state);
    drawLogs(c, state);
  },
  drawFront: (c, state) => {
    drawWaterFront(c, state);
    drawHazardsFront(c, state);
    drawThrows(c, state);
    drawBlasts(c, state);
    drawScenesFront(c, state);
  },
  drawHud: (c, state) => drawScenesHud(c, state),
  outdoors: (state) => {
    const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
    return inMine(cx, feet) || inSaloon(cx, feet) ? 0 : 1;
  },
  // (outdoors: the time of day's light (the street's lamps after dark); in the saloon, its lamps, soft; down the mine,
  // murky (the playtest: "the lights shine way too brightly", as the train's tunnels did): dark, the lanterns only
  // dim warm glows, the actors keeping a little of themselves; never black; the blasts light it up)
  lighting: (state) => {
    const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
    const lamps: Light[] = [...townLamps(state), ...blastLights(state)];
    if (inMine(cx, feet)) {
      const deep = Math.min(1, Math.max(0, (feet - Y(0) - 40) / 200));
      return { dark: 0.5 + 0.28 * deep, shade: [12, 9, 6], rim: 0.22, lights: lamps };
    }
    if (inSaloon(cx, feet)) return { dark: 0.24, shade: [30, 14, 8], rim: 0.35, lights: lamps };
    return todLight(timeOfDay().lamps > 0.05 ? lamps : blastLights(state), 1);
  },
};
