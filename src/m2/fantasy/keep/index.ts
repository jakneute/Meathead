// THE GREAT PIXIE'S CASTLE, ITS BASE AND THE RUNWAY: section 5 of Fairy Land. The user's design (fantasy-spec.md,
// verbatim there): "eventually you enter the base of the great pixie's castle. go through more standard platforming
// stuff until you reach a 'fantasy' themed runway outside for the final trial". He's at the castle now: the monument's
// the setting (art.ts: the keep and the spire towering over him, its highest window lit).
//
// The castle's base (layout.ts: teach, then escalate): the castle gate, the drained moat and its DRAWBRIDGE (new), the
// gatehouse passage and its gift shop under the MURDER HOLES (new: boiling butter brew poured from the ceiling), the
// courtyard (the PRINCESS MAKEOVER BOUTIQUE, the suitors the ride didn't kill in its chairs), the royal rose garden's
// thorns and toadstool planters, the ramparts (machicolations pouring in a wave, the breach and its two staircases in
// opposition), the tower stairs (the land's staircases at their hardest), the postern. The castle's own cast (kinds.ts:
// GUARDS with halberds, COURT JESTERS juggling, LADIES-IN-WAITING throwing fans) among the square's and the glen's.
// Piper over the PA, closer and hungrier; him thinking with his dick. Then THE RUNWAY (runway.ts): the broom port, the
// suitors left on their brooms, the scene (a cutscene), and away to the broomstick deathmatch.
//
// Checkpoints 40-46 (47-49 spare). Way back: the left end to the ride's exit (DOORS.tragons.end); on: the runway's
// scene to DOORS.broom.start (one-way); a revisit (the scene done) walks off the right end on to the broomsticks.

import { pickLine } from '../../../m1/game/platform/speech';
import { piperLine } from '../piperLines';
import type { EnemyKind } from '../../../m1/types';
import { makeKindEnemy, mid } from '../../../m1/game/enemies/kinds';
import type { FantasySection } from '../section';
import { layOwn, ledge, solid, meatheadSays, byPants, endWalls, endExits, runExits, saidOver, speak } from '../section';
import { HORNY } from '../lines';
import { PIPER_PA_VOICE } from '../talk';
import { makeStairs, updateStairs, drawStairs } from '../stairs';
import { squareOf } from '../square/state';
import { glenOf } from '../glen/state';
import { GROUND, SOLIDS, LEDGES, STAIRS, BRIDGE_STAIR, CAST, PICKUPS, CHECKPOINTS, GAG_AT, HORNY_AT, PA_AT, RUNWAY, X, Y, x0, x1, GY } from './layout';
import { keepOf, runwayDone } from './state';
import { buildHazards, updateHazards, drawHazardsBack, drawHazardsFront, drawDrawbridge } from './hazards';
import { drawKeepBackdrop, drawKeepBack, drawGatehouseVeil, keepLamps } from './art';
import { buildRunway, updateRunway, updateBoutique, drawBoutique, drawBoutiqueFront, drawRunway, drawRunwayFront, drawRunwayHud, runwayPiper } from './runway';
import { ARRIVE, GAGS, PIPER_KEEP } from './lines';
import { primeGround } from '../broom/arena';
import '../square/kinds';
import '../glen/kinds';
import './kinds';

export const keep: FantasySection = {
  id: 'keep', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    layOwn(state, GROUND.map(([a, b, h]) => ({ x1: X(a), y1: Y(h), x2: X(b), y2: Y(h), surface: 'dirt' })));
    endWalls(state, 'keep');
    for (const [a, b, top, bot] of SOLIDS) solid(state, X(a), Y(top), b - a, (bot !== undefined ? Y(bot) : GY + 40) - Y(top), { hidden: true });
    for (const [a, b, h] of LEDGES) ledge(state, X(a), Y(h), b - a, { hidden: true });
    const k = keepOf(state);
    k.stairs = makeStairs(state, STAIRS);
    buildHazards(state);
    for (const [kind, rx, h] of CAST) {
      const e = makeKindEnemy(kind as EnemyKind, X(rx), Y(h));
      e.homeX ??= e.pos.x; e.homeY = e.pos.y; e.variant = Math.abs(Math.round(rx)) % 7; e.facing = -1;
      state.enemies.push(e);
    }
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `keep-${Math.round(rx)}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
    buildRunway(state);
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, k = keepOf(state);
    updateStairs(ctx, k.stairs);
    updateHazards(ctx, controls);
    updateBoutique(state);
    const out = updateRunway(ctx, controls);
    const rx = p.pos.x + p.width / 2 - x0;
    // (near the runway: the deathmatch's ground painted a few milliseconds a frame, so taking off doesn't hitch)
    if (rx > RUNWAY - 1500) primeGround();
    const free = !p.inCutscene && p.health > 0;
    const once = (key: string, pool: string[], after = false) => { if (!k.said[key] && free) { k.said[key] = true; meatheadSays(state, pickLine(pool), after); } };
    if (state.checkpoint === 40 && rx < 500 && state.frame > 40) once('arrive', byPants(state, ARRIVE));
    for (const [g, at] of GAG_AT) if (rx > at && rx < at + 400) once(g, byPants(state, GAGS[g as keyof typeof GAGS]));
    HORNY_AT.forEach((at, i) => { if (rx > at && rx < at + 500) once(`horny${i}`, byPants(state, HORNY), true); });
    // Piper over the PA as he passes each horn (once each); now and then he's got something to say back
    for (const [at, h, key] of PA_AT) {
      if (k.said[`pa-${key}`] || !free || rx < at - 200 || rx > at + 500) continue;
      k.said[`pa-${key}`] = true;
      const line = piperLine(PIPER_KEEP[key]);
      if (!line) continue;
      k.piperX = X(at); k.piperY = Y(h);
      speak(PIPER_PA_VOICE, line, s => { k.piper = s; }, true, () => { if (Math.random() < 0.5 && p.health > 0 && !p.inCutscene) meatheadSays(state, pickLine(byPants(state, HORNY)), true); });
    }
    // (the ways: back to the ride's exit off the left end; on a revisit (the brooms flown), on off the right end)
    runExits(state, endExits('keep', { right: runwayDone(state) }));
    return out;
  },
  drawBackdrop: (c, state) => drawKeepBackdrop(c, state),
  drawBack: (c, state) => {
    const k = keepOf(state);
    drawKeepBack(c, state, k.piper ? k.piperX : null, runwayPiper(state), runwayDone(state));
    drawBoutique(c, state);
    drawHazardsBack(c, state);
    drawStairs(c, state, k.stairs.filter((_, i) => i !== BRIDGE_STAIR));
    drawDrawbridge(c, state, k.stairs[BRIDGE_STAIR]);
    drawRunway(c, state);
  },
  drawFront: (c, state) => {
    const k = keepOf(state);
    drawGatehouseVeil(c, state);
    drawHazardsFront(c, state);
    // (the cast's barks over their heads: the castle's own, the square's kinds' and the glen's (they bark into theirs))
    const here = (x: number) => x > x0 && x < x1;
    for (const [e, s] of k.barks) if (e.health > 0) saidOver(c, s.text, mid(e).x, e.pos.y - 12, '#FDE68A', 220);
    for (const [e, s] of squareOf(state).barks) if (e.health > 0 && here(e.pos.x)) saidOver(c, s.text, mid(e).x, e.pos.y - 12, '#FDE68A', 220);
    for (const [e, s] of glenOf(state).barks) if (e.health > 0 && here(e.pos.x)) saidOver(c, s.text, mid(e).x, e.pos.y - 12, '#FDE68A', 220);
    drawBoutiqueFront(c, state);
    drawRunwayFront(c, state);
    if (k.piper) saidOver(c, k.piper.text, k.piperX + 30, k.piperY - 34, '#F9A8D4', 260);
  },
  drawHud: (c, state) => drawRunwayHud(c, state),
  cameraRow: (state) => (state.player.pos.x + state.player.width / 2 - x0 > RUNWAY ? 520 : 500),
  outdoors: () => 1,
  lamps: (state) => keepLamps(state),
};
