// TIMBER TUMBLE: section 4 of Wilderness Land, the log ride. The user's design: "as you cut ahead, tucker isn't done.
// he has a hole in his head but is somehow still alive. when meathead jumps into the log ride he goes 'time to engage
// the buzzsaws' at the ride controls, shoving the actual ride operator out of the way. when he presses it, a buzzsaw
// falls from the ceiling and cuts a huge hole in his forehead. show a closeup of this. his missing eye and his
// splitting headache. he falls over again, apparently dead and now you need to do a tracked section log ride with
// various buzz saw obstacles along the way. ... the end of the line is a woodchipper. you gotta jump out at that
// moment or else you get a funny death animation." And after: its last stretch in a SEWER (way off the track), then out
// into an ACTUAL river (the real wilderness starts here), which ends at the woodchipper.
//
// The pieces: the station and the booth's scene (scene.ts: Tucker, the operator, the saw, the close-up); riding the
// log (ride.ts: the ride's pace, brake and paddle, the hop, the duck); the saws and everything else in the way
// (hazards.ts); the sewer's rats (kinds.ts); the woodchipper (chipper.ts); the art (art.ts); the lines (lines.ts); where
// it all is (layout.ts).
//
// Checkpoints 30-39: the station (30, walked to), and 31-38 along the ride (each puts him straight back in a log
// there). The ways: in from the town's queue (DOORS.logride.start, on the platform); back off the platform's left end
// to the queue (DOORS.town.end); on off the clearing's right end into the woods (DOORS.woods.start); back from the
// woods onto the clearing (DOORS.logride.end); off the clearing's left end, the trail back to the park (the station's
// platform: in a log again, the ride's the same, the saws still on).

import type { GameState } from '../../../m1/game/core/state';
import type { EnemyKind } from '../../../m1/types';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { teleport, layOwn, ledge, solid, endWalls, runExits, saidOver, type FrontierSection, type Exit } from '../section';
import { DOORS, GY } from '../geometry';
import { rideOf } from './state';
import {
  x0, x1, X, Y, waterY, PLATFORM_END, LOAD_X, WALKWAYS, RATS, CROWS, RIDE_CPS, CLEARING, CHIPPER, indoorsAt, inSewer,
} from './layout';
import { board, updateRide, holdInLog, SINK } from './ride';
import { buildHazards, updateHazards, drawHazardsBack, drawHazardsFront, drawProps, drawObstaclesBack, drawObstaclesFront } from './hazards';
import { RAT } from './kinds';
import { startScene, updateScene, updateBooth, againLine, sawed, drawBooth, drawSceneHud } from './scene';
import { updateChipper, drawChipperBack, drawChipperFront } from './chipper';
import { drawRideBackdrop, drawRideBack, drawRideFront, drawLogBack, drawLogFront, rideLighting } from './art';

/** Back from the woods: on the crew's clearing, past the chipper. */
DOORS.logride.end = { x: X(11460), y: CHIPPER.ground };
const STATION = { x: X(200), y: GY };

/** Where the river and the sewer are (the swimming's, and whoever's knocked in drowns). */
const waterAt = (x: number, y: number) => {
  const rx = x - x0;
  if ((rx > 5840 && rx < 8440) || (rx > 8640 && rx < 10760)) {
    const s = waterY(rx);
    if (y > s - 14 && y < s + 140) return { key: inSewer(rx) ? 'sewer' : 'river', x1: X(inSewer(rx) ? 5840 : 8640), x2: X(inSewer(rx) ? 8440 : 10760), surface: s, bottom: s + 140, kind: 'clean' as const };
  }
  return null;
};

/** The ways off its ends, on foot. */
const EXITS: Exit[] = [
  { x0: x0, x1: x0 + 60, yTop: GY - 40, yBot: GY + 2, to: DOORS.town.end },
  { x0: x1 - 60, x1, yTop: CHIPPER.ground - 40, yBot: CHIPPER.ground + 2, to: DOORS.woods.start },
  { x0: X(CLEARING.a), x1: X(CLEARING.a) + 40, yTop: CHIPPER.ground - 40, yBot: CHIPPER.ground + 2, to: STATION },
];

/** Round again (the trail back to the station): the saws reset, the log waiting. */
const resetRide = (state: GameState) => {
  const r = rideOf(state);
  r.log.mode = 'off'; r.cutT = 0; r.chip = { state: 'idle', t: 0, lx0: 0, ly0: 0, lk: 0, chips: [], crew: null, crewSaid: false };
  r.said = { opcut: true };
  buildHazards(state);
};

/** Just built (a death, or a fresh way in): put back in a log on the next frame if he's at one of the ride's checkpoints. */
const fresh = new WeakMap<object, boolean>();

export const logride: FrontierSection = {
  id: 'logride', x0, x1,
  checkpoints: [
    { name: 'TIMBER TUMBLE', cp: 30, x: STATION.x, y: GY },
    ...RIDE_CPS.map(c => ({ name: c.name, cp: c.cp, x: X(c.rx), y: waterY(c.rx) - SINK, manual: true })),
  ],
  build: (state) => {
    // (the station's platform; a catch over the trough at the waiting log's floor; the crew's clearing)
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: X(PLATFORM_END), y2: GY, surface: 'wood' }]);
    ledge(state, X(PLATFORM_END), waterY(LOAD_X) - SINK, X(LOAD_X + 110) - X(PLATFORM_END), { hidden: true });
    solid(state, X(LOAD_X + 110), GY - 400, 30, 460, { hidden: true });
    layOwn(state, [{ x1: X(CLEARING.a) - 60, y1: CHIPPER.ground, x2: x1 + 200, y2: CHIPPER.ground, surface: 'dirt' }]);
    solid(state, X(CLEARING.a) - 80, CHIPPER.ground - 400, 40, 500, { hidden: true });
    endWalls(state, 'logride');
    // (the sewer's walkways, and the rats on them)
    for (const [a, b, h] of WALKWAYS) ledge(state, X(a), Y(h), X(b) - X(a), { hidden: true });
    const r = rideOf(state);
    r.rats = RATS.map(([rx, h]) => { const e = makeKindEnemy(RAT as EnemyKind, X(rx), Y(h)); state.enemies.push(e); return e; });
    for (const [rx, h] of CROWS) { const e = makeKindEnemy('m2:fr_crow' as EnemyKind, X(rx), Y(h)); e.homeX = e.pos.x; e.homeY = e.pos.y; e.variant = rx % 7; state.enemies.push(e); }
    buildHazards(state);
    fresh.set(state.stage as object, true);
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, r = rideOf(state), L = r.log;
    // (back at one of the ride's checkpoints: straight into a log there)
    if (fresh.get(state.stage as object)) {
      fresh.delete(state.stage as object);
      const c = RIDE_CPS.find(q => q.cp === state.checkpoint);
      if (c && Math.abs(p.pos.x + p.width / 2 - X(c.rx)) < 60) { board(state, c.rx, 'ride'); }
    }
    // ---- on foot: the ways off, the operator's bark, into the waiting log
    if (L.mode === 'off' || L.mode === 'done') {
      const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
      for (const e of EXITS) if (cx >= e.x0 && cx <= e.x1 && feet >= e.yTop && feet <= e.yBot) {
        if (e.to === STATION) resetRide(state);
        teleport(state, e.to.x, e.to.y);
        return controls;
      }
      void runExits;
      updateBooth(state);
      if (L.mode === 'off' && p.health > 0 && cx > X(PLATFORM_END) + 6 && cx < X(LOAD_X + 110) && feet >= waterY(LOAD_X) - SINK - 6 && feet < GY + 60) {
        if (!sawed(state)) { board(state, LOAD_X, 'scene'); startScene(state); }
        else { board(state, LOAD_X, 'ride'); againLine(state); }
      }
    }
    // ---- the scene at the booth
    if (L.mode === 'scene') {
      holdInLog(state);
      const out = updateScene(ctx);
      if (out) { updateHazards(ctx); return out; }
    }
    updateHazards(ctx);
    const ch = updateChipper(ctx, controls);
    if (ch) return ch;
    if (L.mode === 'ride') return updateRide(ctx, controls);
    return controls;
  },
  waterBodyAt: (_state, x, y) => waterAt(x, y),
  cameraX: () => ({ min: x0, max: x1 - CANVAS_WIDTH }),
  cameraRow: () => 430,
  drawBackdrop: (c, state) => drawRideBackdrop(c, state),
  drawBack: (c, state) => {
    drawRideBack(c, state);
    drawProps(c, state);
    drawObstaclesBack(c, state);
    drawHazardsBack(c, state);
    drawBooth(c, state);
    drawChipperBack(c, state);
    drawLogBack(c, state);
  },
  drawFront: (c, state) => {
    drawLogFront(c, state);
    drawRideFront(c, state);
    drawHazardsFront(c, state);
    drawObstaclesFront(c, state);
    drawChipperFront(c, state);
  },
  drawHud: (c, state) => {
    const r = rideOf(state);
    // (the ride's spiel, up top while it's said: the PA)
    if (r.pa) saidOver(c, `PA: ${r.pa.text}`, CANVAS_WIDTH / 2, 120, '#FDE68A', 360);
    drawSceneHud(c, state);
  },
  outdoors: (state) => {
    const rx = state.player.pos.x + state.player.width / 2 - x0;
    return indoorsAt(rx) || inSewer(rx) ? 0 : 1;
  },
  lighting: (state) => rideLighting(state, []),
};
