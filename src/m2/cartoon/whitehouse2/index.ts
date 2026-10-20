// CHELSEA AND SOCKS' WACKY WHITE HOUSE ADVENTURES, part two: section 4 of Cartoon Land. The user's design
// (cartoon-spec.md, verbatim there): the rest of the pundit mini-bosses, in order, RUSH LIMBAUGH, BOB DOLE, and in the
// Oval Office at the end NEWT GINGRICH; "at the end of the socks segment a tv screen with bill and Hillary thank you for
// your service by stopping those 'bad men'. the projector screen showing the cartoon chaos collapses showing meathead
// wasn't actually a cat but it was a clever tv projector making it look like he was... you see tons of dead bodies in
// the aftermath. meathead then leaves the cartoon studio." The user since: every player sees the Newt actor's body
// (flayed) where the screen falls; the other four actors' deaths are found going back (the backtrack: part one's
// index.ts draws Perot's and Falwell's); the real stage is a basic stage with no hazards; Chelsea's played by a grown
// woman: being sick after Newt, nonstop, telling him to leave.
//
// The pieces: the rooms (layout.ts, art.ts); the hazards (hazards.ts); the new mean men (kinds.ts, kindArt.ts; part
// one's are about too); the pundits (pundits.ts, punditArt.ts); the finale (finale.ts: the Clintons' TV, the screen
// coming down, the actress); the real stage (realStage.ts, bodies.ts: shared with part one). The cat form, the cartoon
// kills and Chelsea are part one's (whitehouse1/index.ts: catActive, projectionUp; chelsea.ts, handed this half's
// world).
//
// Checkpoints 30-37 (37 the real stage: set by the screen coming down). The ways: in off the Rose Garden's colonnade
// (DOORS.whitehouse2.start); back out the colonnade's left end (DOORS.whitehouse1.end, in the garden); after the screen's
// down, out the stage door at the far right (DOORS.bigkid.start); back from the big-kid rides, by the stage door
// (DOORS.whitehouse2.end).

import type { GameState } from '../../../m1/game/core/state';
import type { Enemy, EnemyKind } from '../../../m1/types';
import { pickLine } from '../../../m1/game/platform/speech';
import { makeKindEnemy, mid } from '../../../m1/game/enemies/kinds';
import { purgeCartoonGore } from '../../../m1/game/core/cartoonKills';
import { todLight } from '../../timeOfDay';
import type { CartoonSection } from '../section';
import { layOwn, ledge, solid, meatheadSays, byPants, runExits, saidOver } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';
import { toonSky } from '../kit';
import { projectionUp, catActive, drawThrows } from '../whitehouse1';
import { CAT_MEMO } from '../whitehouse1/state';
import { whOf } from '../whitehouse1/state';
import { updateThrows as updateMeanThrows } from '../whitehouse1/hazards';
import { updateChelsea, drawChelsea, drawChelseaSaid, chelseaSays, type ChelseaWorld } from '../whitehouse1/chelsea';
import { updatePuffs, drawPuffs } from '../whitehouse1/poof';
import { seedOf } from '../whitehouse1/kinds';
import { drawSkipPrompt } from '../../../m1/game/platform/skip';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { wh2Of, saidOnce, presetMemos, deadList, markDead, DEAD2_MEMO, COLLAPSED_MEMO, ACTRESS_GONE_MEMO, NEWT_MEMO } from './state';
import {
  SOLIDS, LEDGES, CAST, PICKUPS, CHECKPOINTS, GAG_AT, HINT_AT, OVAL_WALL, STAGE_DOOR, CABINETS, DESK_EIB, JELLO, RANGE, POT_RACK, CAB_TABLE,
  MAP_STEP, MAP_CAB, MAP_STOOL, RESOLUTE, LIMBAUGH_ARENA, DOLE_ARENA, NEWT_ARENA, BURNERS, BLINKERS, roomAt, X, Y,
} from './layout';
import { updateHazards2, makeDrawers } from './hazards';
import { updateWaves } from './kinds';
import { drawWave } from './kindArt';
import { updatePundits2, buildArenas2, drawPunditsWorld2, drawPunditsSaid2, drawPunditBar2, fightCam2, cowerSpot, punditScene2, punditSkipShown2 } from './pundits';
import { drawPuffBit2 } from './punditArt';
import {
  updateFinale, finaleOn, startFinale, drawFinaleFront, drawFinaleHud, drawFalling, shakeOffset, finaleLight, updateActress, drawActress, drawActressSaid,
  actressLeaves, openOval, NEWT_BODY, ACTRESS_AT, RIG_X,
} from './finale';
import { drawWh2Back } from './art';
import {
  drawStageBackdrop, drawStageShell, drawStageProps, drawSeats, drawStageDoor, drawFallenScreen, drawProjectorRig, stageLights, stageBox,
  type StagePlan,
} from './realStage';
import { drawNewtBody, drawLimbaughBody, drawDoleBody, drawDeadActor, drawWigAndMess, bloodPool } from './bodies';
import { HINT2, GLOBE_RUN, GAGS2, BODY_LINES, STAGE_AGAIN, LEAVING } from './lines';
import './kinds';

const { x0, x1 } = SECTIONS.whitehouse2;

/** Chelsea's world here: the floor's flat, her hints, where she cowers in a fight. */
const WORLD2: ChelseaWorld = {
  floorY: () => GY,
  hints: HINT_AT.map(([k, a, b]) => [k, X(a), X(b), HINT2[k as keyof typeof HINT2]]),
  cower: state => cowerSpot(state),
};

/** The look of the actor in a CAST place (the same as whoever was in the costume: part one's seeding). */
const castSeed = (kind: string, rx: number, h: number) => {
  const e = makeKindEnemy(kind as EnemyKind, X(rx), Y(h));
  e.variant = Math.abs(Math.round(rx)) % 7;
  return seedOf(e);
};
const seeds = new Map<number, number>();
const seedAt = (ix: number) => { let s = seeds.get(ix); if (s === undefined) { const [k, rx, h] = CAST[ix]; s = castSeed(k, rx, h); seeds.set(ix, s); } return s; };
/** The cast as built this stage (to tell when one's killed: the actor's body lies there later). */
const built = new WeakMap<object, Enemy[]>();
/** The stages the screen's come down in (the cast cleared off). */
const stripped = new WeakSet<object>();

/** The real stage, part two: what each thing was (plywood), the planks, the flats, the floor tape, the cameras. */
const PLAN: StagePlan = {
  a: x0 - 200, b: x1 + 200, floorAt: () => GY,
  boxes: [
    ...CABINETS.map(C => [X(C.a), X(C.b), Y(C.h), 'FILES'] as [number, number, number, string]),
    [X(DESK_EIB.a), X(DESK_EIB.b), Y(DESK_EIB.h), 'EIB'], [X(RANGE.a), X(RANGE.b), Y(RANGE.h), 'STOVE'], [X(CAB_TABLE.a), X(CAB_TABLE.b), Y(CAB_TABLE.h), 'TABLE'],
    [X(MAP_STEP.a), X(MAP_STEP.b), Y(MAP_STEP.h), ''], [X(MAP_CAB.a), X(MAP_CAB.b), Y(MAP_CAB.h), 'MAP CAB'], [X(MAP_STOOL.a), X(MAP_STOOL.b), Y(MAP_STOOL.h), ''],
    [X(RESOLUTE.a), X(RESOLUTE.b), Y(RESOLUTE.h), 'DESK'],
  ],
  planks: [[X(POT_RACK.a), X(POT_RACK.b), Y(POT_RACK.h)], ...[LIMBAUGH_ARENA, DOLE_ARENA, NEWT_ARENA].flatMap(A => A.ledges.map(([a, b, h]) => [X(a), X(b), Y(h)] as [number, number, number]))],
  decks: [],
  flats: [[X(1100), 'WW-01'], [X(2300), 'WW-02 RSVLT'], [X(3600), 'WW-03 KITCH'], [X(5000), 'WW-04 CABNT'], [X(6400), 'WW-05 MAP'], [X(7800), 'WW-06 SIT'], [X(9300), 'WW-07 OUTER'], [X(9950), 'WW-08 OVAL']],
  marks: [[X(400), 'COLONNADE'], [X(1700), 'OFFICES'], [X(2500), 'ROOSEVELT'], [X(3700), 'KITCHEN'], [X(5200), 'CABINET RM'], [X(6600), 'MAP RM'], [X(8000), 'SIT RM'], [X(9500), 'OUTER OVAL'], [X(10650), 'OVAL']],
  cameras: [X(640), X(4980), X(9180), X(11200)],
};

export const whitehouse2: CartoonSection = {
  id: 'whitehouse2', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    presetMemos(state);
    const s = wh2Of(state), real = !projectionUp(state);
    s.real = real;
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'wood' }]);
    state.blocks.push({ x: x0 - 40, y: -6000, w: 40, h: 6000 + GY + 600, type: 'wall', hidden: true, tag: 'whitehouse2-start' });
    state.blocks.push({ x: x1, y: -6000, w: 40, h: 6000 + GY + 600, type: 'wall', hidden: true, tag: 'whitehouse2-end' });
    for (const [a, b, top] of SOLIDS) solid(state, X(a), Y(top), b - a, top + 40, { hidden: true });
    for (const [a, b, h] of LEDGES) ledge(state, X(a), Y(h), b - a, { hidden: true });
    makeDrawers(state);
    buildArenas2(state);
    // (the Oval Office's far wall: the end of the show's White House, till the screen's down)
    s.ovalWall = real ? null : solid(state, X(OVAL_WALL), Y(1200), 40, 1240, { hidden: true, tag: 'ct-wh2-ovalwall' });
    const list: Enemy[] = [];
    if (!real) CAST.forEach(([kind, rx, h], ix) => {
      const e = makeKindEnemy(kind as EnemyKind, X(rx), Y(h));
      e.homeX ??= e.pos.x; e.homeY = e.pos.y; e.variant = Math.abs(Math.round(rx)) % 7; e.facing = -1;
      state.enemies.push(e); s.castIx.set(e, ix); list.push(e);
    });
    built.set(state.stage as object, list);
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `wh2-${Math.round(rx)}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, s = wh2Of(state);
    // (the screen's down (here, or a cheat start past it): the real stage from now on; the mean men still about were
    // actors: they ran)
    if (!projectionUp(state) && !stripped.has(state.stage as object)) {
      stripped.add(state.stage as object); s.real = true; stripCast(state);
      if (!finaleOn(state)) openOval(state);
    }
    const real = s.real, F = s.finale;
    // (the cartoon: no blood, no bodies, the puffs; he's the cat (a cheat start in here: he's been drawn in))
    if (!real && !state.stageMemo[CAT_MEMO]) state.stageMemo[CAT_MEMO] = '1';
    state.cartoonKills = !real;
    p.catForm = !real && catActive(state) && !(F && ['catslip', 'spark', 'look', 'actress', 'done'].includes(F.step));
    const hz = updateHazards2(ctx, real);
    if (!real) { updateWaves(ctx); updateMeanThrows(ctx); }
    let out = real ? controls : updatePundits2(ctx, controls);
    // (Newt beaten but the screen not down yet (a start from the outer office after leaving mid-scene): into the Oval
    // Office, and it's the Clintons' TV again)
    if (!real && !s.finale && state.stageMemo[NEWT_MEMO] && p.health > 0 && !p.inCutscene && p.pos.x + p.width / 2 > X(NEWT_ARENA.trigger)) startFinale(state);
    out = updateFinale(ctx, out);
    if (!real) updateChelsea(state, WORLD2);
    updatePuffs(state);
    purgeCartoonGore(state);
    if (real) updateActress(state);
    // (a mean man's actor killed: his body there once the screen's down)
    for (const e of built.get(state.stage as object) ?? []) if (e.health <= 0) { const ix = s.castIx.get(e); if (ix !== undefined) markDead(state, DEAD2_MEMO, ix); }
    // What he's got to say (once each a visit)
    const rx = p.pos.x + p.width / 2 - x0, alive = !p.inCutscene && p.health > 0;
    const once = (key: string, pool: string[]) => { if (alive && saidOnce(key)) meatheadSays(state, pickLine(pool), false); };
    if (!real) {
      for (const [key, a, b] of GAG_AT) if (rx > a && rx < b && key !== 'jello') once(`wh2-${key}`, byPants(state, GAGS2[key as keyof typeof GAGS2]));
      if (hz.bounced && saidOnce('wh2-jello')) meatheadSays(state, pickLine(byPants(state, GAGS2.jello)), false);
      // (the globe's off: Chelsea first, then him)
      if (hz.globe) chelseaSays(state, GLOBE_RUN[0], () => { if (state.player.health > 0 && saidOnce('wh2-globe')) meatheadSays(state, pickLine(byPants(state, GAGS2.globe)), true); }, false);
    } else if (!finaleOn(state)) {
      // The real stage, after: back past what he did
      if (!s.finale) once('wh2-stage-again', byPants(state, STAGE_AGAIN));
      const near = (x: number, r = 160) => Math.abs(p.pos.x + p.width / 2 - x) < r;
      if (near(X((DESK_EIB.a + DESK_EIB.b) / 2), 220)) once('body-limbaugh', byPants(state, BODY_LINES.limbaugh));
      if (near(X((CAB_TABLE.a + CAB_TABLE.b) / 2), 260)) once('body-dole', byPants(state, BODY_LINES.dole));
      if (state.stageMemo[ACTRESS_GONE_MEMO] && near(ACTRESS_AT.x, 160)) once('body-wig', byPants(state, BODY_LINES.wig));
      if ([...deadList(state, DEAD2_MEMO)].some(ix => near(X(CAST[ix][1]), 120))) once('body-staff', byPants(state, BODY_LINES.staff));
    }
    // The ways: back out the colonnade's left end (to the garden); out the stage door (the screen's down: on to the
    // big-kid rides, his line as he goes)
    if (runExits(state, [{ x0, x1: x0 + 60, yTop: GY - 40, yBot: GY + 2, to: DOORS.whitehouse1.end }])) actressLeaves(state);
    if (real && !finaleOn(state) && runExits(state, [{ x0: X(STAGE_DOOR.a + 20), x1: X(STAGE_DOOR.b), yTop: GY - 40, yBot: GY + 2, to: DOORS.bigkid.start }])) {
      actressLeaves(state);
      if (state.player.health > 0) meatheadSays(state, pickLine(byPants(state, LEAVING)), false);
    }
    return out;
  },
  drawBackdrop: (c, state) => {
    const s = wh2Of(state);
    if (s.real || (s.finale && s.finale.step === 'fall')) return drawStageBackdrop(c, state);
    return toonSky(c, state, null, { hill: '#A7D8A0' });
  },
  drawBack: (c, state) => {
    const s = wh2Of(state), F = s.finale;
    const cartoon = () => {
      const j = shakeOffset(state, F);
      if (j) { c.save(); c.translate(j.x, j.y); }
      drawWh2Back(c, state);
      for (const t of s.waves) drawWave(c, t.x, t.y, Math.sign(t.vx) || 1, t.t);
      drawPunditsWorld2(c, state);
      if (!s.real) drawChelsea(c, state);
      if (j) c.restore();
    };
    if (F && F.step === 'fall' && F.fall < 1) { drawReal(c, state); drawFalling(c, state, F, cartoon); return; }
    if (s.real) { drawReal(c, state); return; }
    cartoon();
  },
  drawFront: (c, state) => {
    const s = wh2Of(state);
    if (s.real) {
      drawSeats(c, state, x0 - 200, x1 + 200);
      drawScreenHeap(c, state);
      drawFinaleFront(c, state);
      return;
    }
    drawThrows(c, state);
    drawPuffs(c, state, drawPuffBit2);
    for (const [e, b] of s.barks) if (e.health > 0) saidOver(c, b.text, mid(e).x, e.pos.y - 14, '#FDE68A', 220);
    for (const [e, b] of whOf(state).barks) if (e.health > 0) saidOver(c, b.text, mid(e).x, e.pos.y - 14, '#FDE68A', 220);
    drawPunditsSaid2(c, state, saidOver);
    drawChelseaSaid(c, state);
    drawFinaleFront(c, state);
  },
  drawHud: (c, state) => {
    drawPunditBar2(c, state);
    if (punditScene2(state)) {
      c.fillStyle = '#05030A'; c.fillRect(0, 0, CANVAS_WIDTH, 36); c.fillRect(0, CANVAS_HEIGHT - 36, CANVAS_WIDTH, 36);
      if (punditSkipShown2(state)) drawSkipPrompt(c, CANVAS_WIDTH);
    }
    drawFinaleHud(c, state);
    drawActressSaid(c, state);
  },
  lighting: (state) => {
    const s = wh2Of(state);
    if (s.real) return finaleLight(state, stageLights(state, x0 - 200, x1 + 200, [{ x: X((STAGE_DOOR.a + STAGE_DOOR.b) / 2), y: GY - 248, r: 120, a: 0.6, color: '#F87171' }]));
    const out = roomAt(state.player.pos.x + state.player.width / 2 - x0).outdoors ? 1 : 0;
    return out > 0 ? todLight([], out) : null;
  },
  outdoors: (state) => (wh2Of(state).real ? 0 : roomAt(state.player.pos.x + state.player.width / 2 - x0).outdoors ? 1 : 0),
  cameraX: (state) => fightCam2(state),
};

/** The screen's down mid-stage: the mean men still about are actors, gone (they ran). */
const stripCast = (state: GameState) => {
  const s = wh2Of(state);
  state.enemies = state.enemies.filter(e => s.castIx.get(e) === undefined || e.health <= 0);
};

/** The real stage, part two (world, behind him): the shell, the plywood, the dead, the projector rig, the actress, the
 *  stage door. */
const drawReal = (c: CanvasRenderingContext2D, state: GameState) => {
  const s = wh2Of(state), f = state.frame, F = s.finale;
  drawStageShell(c, state, PLAN);
  drawStageProps(c, state, PLAN);
  // (the drawers, out for good: plywood steps)
  for (const d of s.drawers) if (d.b.x > -1e6) stageBox(c, d.b.x, d.b.x + d.b.w, d.b.y, d.b.y + 30, '');
  // (the jelly mold was a stunt trampoline; the burners dead rings; the laser emitters dark on their stands)
  { const a = X(JELLO.a), b = X(JELLO.b), top = Y(JELLO.h); c.fillStyle = '#3F3F46'; c.fillRect(a, top + 4, b - a, GY - top - 4); c.fillStyle = '#111827'; c.fillRect(a + 4, top, b - a - 8, 5); c.fillStyle = '#E7E2D6'; c.fillRect(a + 4, top, b - a - 8, 1); }
  for (const rx of BURNERS) { c.fillStyle = '#111827'; c.beginPath(); c.ellipse(X(rx), Y(RANGE.h) - 1, 16, 3, 0, 0, Math.PI * 2); c.fill(); }
  for (const [rx] of BLINKERS) { c.fillStyle = '#27272A'; c.fillRect(X(rx) - 10, GY - 14, 20, 14); c.fillStyle = '#7F1D1D'; c.fillRect(X(rx) - 2, GY - 16, 4, 2); }
  // (the globe: a split fiberglass ball)
  const g = s.globe;
  for (const h of g.halves) { c.save(); c.translate(h.x, GY); c.rotate(h.rock); c.fillStyle = '#D6D3D1'; c.beginPath(); c.arc(0, 0, 56, Math.PI, 0); c.closePath(); c.fill(); c.fillStyle = '#A8A29E'; c.fillRect(-56, -3, 112, 3); c.restore(); }
  // (the dead: Limbaugh, Dole, Newt, the mean men's actors he killed)
  drawLimbaughBody(c, X(DESK_EIB.a), X(DESK_EIB.b), Y(DESK_EIB.h), GY, f);
  drawDoleBody(c, X(CAB_TABLE.a), X(CAB_TABLE.b), Y(CAB_TABLE.h), GY);
  drawNewtBody(c, NEWT_BODY.x, GY);
  for (const ix of deadList(state, DEAD2_MEMO)) {
    const [kind, rx] = CAST[ix];
    if (Math.abs(X(rx) - (state.camera.x + CANVAS_WIDTH / 2)) > CANVAS_WIDTH) continue;
    drawDeadActor(c, kind, seedAt(ix), X(rx), GY, ix % 2 === 0, f);
  }
  // (the projector rig: lit till it sparks; then crooked and smoking)
  const lensOn = !!F && F.step !== 'done' && F.beam > 0;
  drawProjectorRig(c, RIG_X, GY, f, lensOn || (!!F && ['fall', 'catslip'].includes(F.step)), !F || F.step === 'done' || ['spark', 'look', 'actress'].includes(F.step));
  // (the actress (or, gone, her wig and her mess))
  if (state.stageMemo[ACTRESS_GONE_MEMO]) { drawWigAndMess(c, ACTRESS_AT.x, GY); bloodPool(c, ACTRESS_AT.x - 70, GY, 20, 7); }
  else drawActress(c, state);
  drawStageDoor(c, X(STAGE_DOOR.a), X(STAGE_DOOR.b), GY);
};

/** The fallen projection screen heaped over the stage's lip, all along (world, in front). */
const drawScreenHeap = (c: CanvasRenderingContext2D, state: GameState) => {
  const seg = 880, v0 = state.camera.x - seg, v1 = state.camera.x + CANVAS_WIDTH + seg;
  for (let a = Math.floor(Math.max(x0 - 200, v0) / seg) * seg; a < Math.min(x1 + 200, v1); a += seg) drawFallenScreen(c, a + 20, a + seg - 20, GY + 6);
};
export { COLLAPSED_MEMO };
