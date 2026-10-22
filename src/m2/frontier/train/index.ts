// THE TRAIN: section 2 of Wilderness Land. The station scene (wilds/station.ts) leaves Tucker's train speeding off and
// puts him here, running after it. The user's design (frontier-spec.md, verbatim there): Meathead jumps on the train from
// the caboose and makes his way through it to the engine. Cars he can go into (the caboose, coaches, dining cars,
// baggage and mail cars, cattle cars) and cars he can only cross on top (boxcars, flatcars of logs, ore hoppers, tank
// cars, the tender); Tucker now and then uncouples the car he's on (dally and it derails: a silly violent death, cars.ts);
// tunnels go by and darken the view, more and more of them, never quite black (passers.ts, the lighting); train hazards
// (low bridges, water towers, the waterfalls, the grades, the fireman's coal, the stack's cinders) and the train's cast
// (kinds.ts). At the front: the engine with a big KILL arrow (as Riggs in Meathead 1); Tucker's insult (a cutscene); one
// shot of the ray gun, the close-up of the hole through his eye; the crash into Sawdust Gulch (engine.ts).
//
// The playtest's: the cars are big (300 tall inside, things to climb in them), the camera pulled back for them (view.ts
// ZOOM); the lights muted (soft glows, no spotlights; in a tunnel only the inside of a car is lit right through); the
// grades tilt the whole view (worldTilt: the train stays on its rails, the horizon level).
//
// The train stands still in the world; the world goes by it (the scenery, the ties, whatever's coming: tr.dist).
//
// THE RUN FOR THE CABOOSE: coming in from the station, he's on the ties behind the train as it labors up the grade; he
// runs it down and hops up onto the caboose's back porch (a cutscene: SKIP >> puts him on it), and the train gets up to
// speed. Down on the tracks after that (through a cut coupling), he's under the wheels.
//
// Checkpoints 10-18. A death puts the train back as it was at that checkpoint (cars cut loose before it stay gone).
// The ways: no way back to the station (the train carried him off: one-way, the user's rule; the caboose's back porch
// has its rail, the section's left end is a wall); on, only by the crash (the town, DOORS.town.start). After the crash
// (a revisit), the train's stood still at the end of the line, whole again (the park towed the cars back, and billed
// him), nobody on it: walk it end to end; into the cab's back to go on to the town (no way back from the town either).

import type { EnemyKind } from '../../../m1/types';
import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { pickLine } from '../../../m1/game/platform/speech';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { todLight } from '../../timeOfDay';
import type { FrontierSection } from '../section';
import { layOwn, endWalls, teleport, meatheadSays, byPants, hands } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';
import { trainOf } from './state';
import { CARS, CAR_X, CHECKPOINTS, DECK, ROOF, END, TOP, ENGINE, V_FULL, V_INTRO, PICKUPS, TRAIN_END, EVENTS, eventX } from './layout';
import { buildCars, rearForCheckpoint, updateCut, updateTracks, updateRooms, insideCar } from './cars';
import { updatePassers, drawPassersBack, drawPassersFront, drawNearLane, drawRiders, drawWarnings, tunnelLamps } from './passers';
import { updateShots, drawShots } from './shots';
import { setBounds } from './kinds';
import { drawScenery, drawTrackside, drawCarsBack, drawCarsFront, carLamps, stepWrecks, drawWrecks } from './art';
import { updateEngine, drawEngineBack, drawEngineFront, drawEngineHud, crashed, whenCrashed, headlamp } from './engine';
import { ZOOM } from './view';
import { tubeSay, drawTube } from './tube';
import { BOARDED, TUBE_BOARD, TUBE_LEDGER, TRAIN_GAGS, REVISIT } from './lines';
import { updateCage, updateMaul, drawMaul, drawEscape, trainOff } from './lion';

const { x0, x1 } = SECTIONS.train;
// (back into the train from the town: the tender's front end)
DOORS.train.end = TRAIN_END;

const AWAY = -99999;

/** Everybody on the train, where they were put (none on a revisit). */
const spawnCast = (state: GameState) => {
  CARS.forEach((d, i) => {
    const x = CAR_X[i];
    for (const [kind, rx, where, up] of d.foes ?? []) {
      const feet = where === 'in' ? DECK - (up ?? 0) : TOP[d.kind] ?? ROOF;
      const e = makeKindEnemy(`m2:fr_${kind}` as EnemyKind, x + rx, feet);
      e.homeX = e.pos.x; e.homeY = e.pos.y; e.variant = (i * 3 + rx) % 7; e.facing = -1;
      // (each keeps to its car: inside it, well clear of its doors (the playtest: nobody camps the doors), or along its
      // top)
      setBounds(e, x + (where === 'in' ? END + 70 : END + 4), x + d.len - (where === 'in' ? END + 70 : END + 4));
      state.enemies.push(e);
    }
  });
};

export const train: FrontierSection = {
  id: 'train', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    const tr = trainOf(state);
    // (the bed under the train: the ties; the ends walled)
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'dirt' }]);
    endWalls(state, 'train');
    tr.rear = 0;
    buildCars(state, tr);
    if (!crashed(state)) spawnCast(state);
    for (const [ci, rx, type] of PICKUPS) state.pickups.push({ id: `train-${ci}-${rx}`, pos: { x: CAR_X[ci] + rx - 10, y: DECK - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, tr = trainOf(state), p = state.player;
    const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
    // (the first frame: where he really starts is known now (a cheat's pick comes after the build): the train as it is
    // there; on the train, it's moving; behind it, he's running it down; after the crash, it's stood still)
    if (!tr.settled) {
      tr.settled = true;
      if (crashed(state)) { tr.phase = 'still'; tr.v = 0; tr.vTarget = 0; }
      else if (state.checkpoint >= 10) {
        tr.phase = 'ride'; tr.v = V_FULL; tr.vTarget = V_FULL;
        // (what came by before this checkpoint has been and gone: not all of it again at once)
        const cpX = CHECKPOINTS.find(c => c.cp === state.checkpoint)?.x ?? 0;
        EVENTS.forEach((ev, i) => { if (eventX(ev) < cpX) tr.fired.add(i); });
        const rear = rearForCheckpoint(state.checkpoint);
        if (rear > 0) {
          for (let i = 0; i < rear; i++) { tr.cars[i].gone = true; for (const b of tr.cars[i].blocks) b.y = AWAY; tr.cutsDone.add(i); }
          tr.rear = rear;
          state.enemies = state.enemies.filter(e => e.pos.x > CAR_X[rear] - 10 || e.pos.x < x0 || e.pos.x > x1);
          state.pickups = state.pickups.filter(q => !q.id.startsWith('train-') || q.pos.x > CAR_X[rear]);
        }
      } else { tr.phase = 'intro'; tr.v = V_INTRO; tr.vTarget = V_INTRO; }
    }
    // (the camera's pulled back: the whole of what's drawn is the screen for the rules (what he can see, he can shoot))
    state.viewIsScreen = true;
    // (off it onto the tracks: the lion's scene has it from here (lion.ts))
    if (tr.lion) { stepWrecks(state); updateCage(ctx); return updateMaul(ctx); }
    // (up a grade it slows, down one it picks up)
    const want = tr.phase === 'ride' && tr.vTarget === V_FULL ? V_FULL * Math.max(0.7, Math.min(1.3, 1 - tr.grade * 4)) : tr.vTarget;
    tr.v += (want - tr.v) * 0.02;
    if (Math.abs(want - tr.v) < 0.02) tr.v = want;
    tr.dist += tr.v;
    let out = controls;
    // ---- the run for the caboose (from the station)
    const rearX = CAR_X[tr.rear];
    if (tr.phase === 'intro') {
      if (cx >= rearX - 24 && feet < GY - 10 && p.isGrounded) boarded(state, tr.introT > 0);
      else if (cx > x0 + 60 && cx < rearX && p.health > 0) {
        tr.introT++;
        p.inCutscene = true;
        if (tr.introT > SKIP_AFTER) { offerSkip(); if (takeSkip()) { teleport(state, rearX + 14, DECK); boarded(state, true); return hands(); } }
        // (running it down; close, a hop up onto the porch)
        // (hopT: frames left holding the jump; below zero, frames it's been let go, so a missed hop can go again)
        let jump = false;
        if (tr.hopT > 0) { jump = true; if (--tr.hopT === 0) tr.hopT = -1; }
        else if (tr.hopT < 0) tr.hopT--;
        if (p.isGrounded && cx > rearX - 70 && (tr.hopT === 0 || tr.hopT < -4)) tr.hopT = 6;
        if (tr.introT > 420) { teleport(state, rearX + 14, DECK); boarded(state, true); return hands(); }
        return { ...hands(), right: true, jump } as typeof controls;
      }
    }
    // ---- the engine's scene, the cuts, what goes by, what flies, the tracks
    out = updateEngine(ctx, out);
    // (the caboose's back porch, while it's coupled (or the back of the train stood still): its rail. No way back to the
    // station: the train carried him off, one-way (the user's rule). The playtest's: once cars have been cut loose, off
    // the back of what's left of the moving train is down on the tracks: under the wheels (updateTracks))
    const rearFloor = tr.cars[tr.rear]?.blocks[0];
    if (tr.phase !== 'intro' && rearFloor && (tr.rear === 0 || tr.phase === 'still') && (!tr.cut || tr.cut.phase === 'tell' || tr.cut.k < tr.rear) && cx < rearFloor.x + 2 && feet < GY - 6 && feet > DECK - 40 && p.health > 0 && !p.inCutscene) {
      p.pos.x = rearFloor.x + 2 - p.width / 2;
      if (p.vel.x < 0) p.vel.x = 0;
    }
    // (stood still: into the back of the cab, on to the town)
    if (tr.phase === 'still' && cx > CAR_X[ENGINE] - 30 && feet <= DECK + 4 && feet > DECK - 120) { teleport(state, DOORS.town.start.x, DOORS.town.start.y); return out; }
    updateCut(ctx);
    updatePassers(ctx);
    updateShots(ctx, tr.phase === 'ride');
    updateRooms(ctx);
    updateCage(ctx);
    stepWrecks(state);
    updateTracks(ctx, CAR_X[0] - 600, CAR_X[ENGINE] + CARS[ENGINE].len);
    // ---- what's said: the ledger now and then; the firsts
    if (tr.phase === 'ride' && p.health > 0 && !p.inCutscene) {
      if (++tr.ledgerT > 1500 && !tr.tubeBusy && !tr.cut && cx < CAR_X[ENGINE - 1] - 40) { tr.ledgerT = 0; tubeSay(state, TUBE_LEDGER, undefined, false); }
      for (let i = tr.rear; i < CARS.length; i++) if (CARS[i].kind === 'cattle' && !tr.said.cattle && insideCar(state, tr, i)) { tr.said.cattle = true; meatheadSays(state, pickLine(byPants(state, TRAIN_GAGS.cattle)), false); }
      if (!tr.said.tower && tr.passers.some(q => q.kind === 'tower')) { tr.said.tower = true; meatheadSays(state, pickLine(byPants(state, TRAIN_GAGS.tower)), false); }
    }
    if (tr.phase === 'still' && !tr.said.revisit && cx > x0 + 400 && p.health > 0) { tr.said.revisit = true; meatheadSays(state, pickLine(byPants(state, REVISIT)), false); }
    return out;
  },
  // (pulled back: the view's wider than the camera's 800, so the camera's kept that much in from the ends)
  cameraX: () => ({ min: x0 + (CANVAS_WIDTH / ZOOM - CANVAS_WIDTH) / 2, max: x1 - CANVAS_WIDTH - (CANVAS_WIDTH / ZOOM - CANVAS_WIDTH) / 2 }),
  // (the camera kept level: the train and the scenery steady, whichever car top he's on)
  // (off it onto the tracks: kept where it was, at the deck)
  cameraRow: (state) => (trainOf(state).lion ? DECK : state.player.isGrounded ? state.player.pos.y + state.player.height : DECK + 200),
  // (the playtest: the cars are big; the camera pulled back to fit them, about the middle of the screen)
  zoom: (state) => ({ scale: ZOOM, x: state.camera.x + CANVAS_WIDTH / 2, y: state.camera.y + 300 }),
  // (the grades: the whole train tilts with the line under it, the horizon (the backdrop) level)
  worldTilt: (state) => { const t = trainOf(state).tilt; return Math.abs(t) > 0.0005 ? { x: state.camera.x + CANVAS_WIDTH / 2, y: DECK, angle: -t } : null; },
  drawBackdrop: (c, state) => drawScenery(c, state),
  // (off it onto the tracks, the world stood still: the train drawn gone on without him (lion.ts trainOff))
  drawBack: (c, state) => {
    const off = trainOff(state);
    drawTrackside(c, state);
    drawPassersBack(c, state);
    c.save(); c.translate(off, 0);
    drawCarsBack(c, state);
    drawEngineBack(c, state);
    c.restore();
    drawShots(c, state);
  },
  drawFront: (c, state) => {
    const off = trainOff(state);
    c.save(); c.translate(off, 0);
    drawCarsFront(c, state);
    c.restore();
    drawPassersFront(c, state);
    c.save(); c.translate(off, 0);
    drawEngineFront(c, state);
    c.restore();
    // (him on the ties, the lion)
    drawMaul(c, state);
    drawNearLane(c, state);
    // (the wrecks still up by the rails, then the riders in the near lane, then the wrecks gone down the bank past them)
    drawWrecks(c, state, false);
    drawRiders(c, state);
    // (the lion out of its wreck, off along the near lane)
    drawEscape(c, state);
    drawWrecks(c, state, true);
  },
  drawHud: (c, state) => {
    const tr = trainOf(state);
    // (off it onto the tracks: a cutscene, nothing up over it)
    if (tr.lion) return;
    drawWarnings(c, state);
    drawTube(c, state);
    drawEngineHud(c, state);
    if (tr.phase === 'intro' && tr.introT > SKIP_AFTER && state.player.inCutscene) drawSkipPrompt(c, CANVAS_WIDTH);
  },
  outdoors: (state) => 1 - trainOf(state).dark,
  // (the time of day's light; in a tunnel, murky (never black): the car he's in lit right through, the rest only dim
  // glows (the playtest: the lights muted, no spotlights; nobody lit up round him much))
  lighting: (state) => {
    const tr = trainOf(state), h = headlamp();
    const off = trainOff(state);
    const lamps: Light[] = [...carLamps(state).map(l => (off ? { ...l, x: l.x + off } : l)), ...tunnelLamps(state), { x: h.x + off, y: h.y, r: 170, a: 0.35, color: '#4A4418' }];
    const tod = todLight(lamps, 1);
    if (tr.dark < 0.02) return tod;
    return { dark: Math.max(tod?.dark ?? 0, 0.86 * tr.dark), shade: [12, 10, 10], rim: 0.2, grade: tod?.grade, lights: lamps };
  },
};

/** On (the porch reached, or skipped to): the train gets up to speed; him, then Tucker down the tube. */
const boarded = (state: GameState, voiced: boolean) => {
  const tr = trainOf(state), p = state.player;
  tr.phase = 'ride'; tr.vTarget = V_FULL; tr.introT = 0; tr.hopT = 0;
  p.inCutscene = false;
  if (voiced) meatheadSays(state, pickLine(byPants(state, BOARDED)), true, () => tubeSay(state, TUBE_BOARD));
};

// After the crash: the train stood still and whole, nobody on it (the town's way back comes here).
whenCrashed((state) => {
  const tr = trainOf(state);
  for (const car of tr.cars) for (const b of car.blocks) b.y = AWAY;
  tr.rear = 0; tr.cut = null;
  buildCars(state, tr);
  state.enemies = state.enemies.filter(e => e.pos.x < x0 - 400 || e.pos.x > x1 + 400);
  tr.passers = []; tr.shots = []; tr.horses = []; tr.wrecks = []; tr.stash = []; tr.riders = [];
  tr.phase = 'still'; tr.v = 0; tr.vTarget = 0; tr.dark = 0; tr.grade = 0; tr.tilt = 0; tr.soak = 0;
});
