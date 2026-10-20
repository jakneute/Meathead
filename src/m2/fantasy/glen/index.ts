// THE ENCHANTED GLEN: section 3 of Fairy Land. The user's design (fantasy-spec.md, verbatim there): "when all suitors
// are dead, go through another fantasy themed area with escalating platforming/enemy challenges." The park's storybook
// forest walk (layout.ts: teach, then escalate): the land's ENCHANTED STAIRCASES harder (two in opposition over a
// gorge, one up a cottage with a cauldron swinging across it, a faster chain of four over the mine's shaft, one that
// rides him up the dragon's lair while he's shot at); the glen's own MUSHROOM TRAMPOLINES, BRIAR PATCHES and SWINGING
// CAULDRONS (hazards.ts); more of the cast (kinds.ts: huntsmen, cupids on wires, gingerbread men, dwarfs, unicorns,
// with the town square's); Piper over the PA now and then, him thinking with his dick; and at the end the queue for
// TRUELLING TRAGONS, the rivals in it (rivals.ts).
//
// Checkpoints 20-26. Way back: the left end to the wheel's end (DOORS.wheel.end); on: its right end, the ride's door
// (DOORS.tragons.start).

import { pickLine } from '../../../m1/game/platform/speech';
import { piperLine } from '../piperLines';
import type { EnemyKind } from '../../../m1/types';
import { makeKindEnemy, mid } from '../../../m1/game/enemies/kinds';
import type { FantasySection } from '../section';
import { layOwn, ledge, solid, meatheadSays, byPants, endWalls, endExits, runExits, saidOver } from '../section';
import { HORNY } from '../lines';
import { SECTIONS, GY } from '../geometry';
import { makeStairs, updateStairs, drawStairs, onStair } from '../stairs';
import { squareOf } from '../square/state';
import { GROUND, SOLIDS, LEDGES, STAIRS, RIDE_STAIR, CAST, PICKUPS, CHECKPOINTS, GAG_AT, HORNY_AT, PA_AT, X, Y } from './layout';
import { glenOf } from './state';
import { buildHazards, updateHazards, drawHazardsBack, drawHazardsFront } from './hazards';
import { drawGlenBackdrop, drawGlenBack, glenLamps } from './art';
import { buildRivals, updateRivals, drawRivals, drawRivalsFront, piperSays } from './rivals';
import { ARRIVE, GAGS, PIPER_GLEN } from './lines';
import '../square/kinds';
import './kinds';

const { x0, x1 } = SECTIONS.glen;

export const glen: FantasySection = {
  id: 'glen', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    layOwn(state, GROUND.map(([a, b, h]) => ({ x1: X(a), y1: Y(h), x2: X(b), y2: Y(h), surface: 'dirt' })));
    endWalls(state, 'glen');
    for (const [a, b, top, bot] of SOLIDS) solid(state, X(a), Y(top), b - a, (bot !== undefined ? Y(bot) : GY + 40) - Y(top), { hidden: true });
    for (const [a, b, h] of LEDGES) ledge(state, X(a), Y(h), b - a, { hidden: true });
    const g = glenOf(state);
    g.stairs = makeStairs(state, STAIRS);
    buildHazards(state);
    for (const [kind, rx, h] of CAST) {
      const e = makeKindEnemy(kind as EnemyKind, X(rx), Y(h));
      e.homeX ??= e.pos.x; e.homeY = e.pos.y; e.variant = Math.abs(Math.round(rx)) % 7; e.facing = -1;
      state.enemies.push(e);
    }
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `glen-${Math.round(rx)}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
    buildRivals(state);
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, g = glenOf(state);
    updateStairs(ctx, g.stairs);
    updateHazards(ctx, controls);
    updateRivals(ctx);
    const rx = p.pos.x + p.width / 2 - x0;
    const free = !p.inCutscene && p.health > 0;
    // What he's got to say about it (once each)
    const once = (k: string, pool: string[], after = false) => { if (!g.said[k] && free) { g.said[k] = true; meatheadSays(state, pickLine(pool), after); } };
    if (state.checkpoint === 20 && rx < 600 && state.frame > 40) once('arrive', byPants(state, ARRIVE));
    for (const [k, at] of GAG_AT) if (rx > at && rx < at + 400) once(k, byPants(state, GAGS[k as keyof typeof GAGS]));
    if (onStair(state, g.stairs[RIDE_STAIR]) && g.stairs[RIDE_STAIR].moving) once('ride', byPants(state, GAGS.ride));
    // (thinking with his dick, now and then)
    HORNY_AT.forEach((at, i) => { if (rx > at && rx < at + 500) once(`horny${i}`, byPants(state, HORNY), true); });
    // Piper over the PA as he passes each horn (once each); now and then he's got something to say back
    for (const [at, k] of PA_AT) {
      if (g.said[`pa-${k}`] || !free || rx < at - 200 || rx > at + 500) continue;
      g.said[`pa-${k}`] = true;
      // (already said this life: she says nothing, and he's nothing to answer)
      const line = piperLine(PIPER_GLEN[k]);
      if (line) piperSays(g, line, state, X(at), () => { if (Math.random() < 0.5 && p.health > 0) meatheadSays(state, pickLine(byPants(state, HORNY)), true); });
    }
    // (the ways: back to the wheel off the left end, on to the ride through its door off the right)
    runExits(state, endExits('glen'));
    return controls;
  },
  drawBackdrop: (c, state) => drawGlenBackdrop(c, state),
  drawBack: (c, state) => {
    const g = glenOf(state);
    drawGlenBack(c, state, g.piper ? g.piperX : null);
    drawHazardsBack(c, state);
    drawStairs(c, state, g.stairs);
    drawRivals(c, state);
  },
  drawFront: (c, state) => {
    const g = glenOf(state);
    drawHazardsFront(c, state);
    // (the cast's barks over their heads: the glen's own, and the town square's kinds' (they bark into the square's))
    for (const [e, s] of g.barks) if (e.health > 0) saidOver(c, s.text, mid(e).x, e.pos.y - 12, '#FDE68A', 220);
    for (const [e, s] of squareOf(state).barks) if (e.health > 0 && e.pos.x > x0 && e.pos.x < x1) saidOver(c, s.text, mid(e).x, e.pos.y - 12, '#FDE68A', 220);
    drawRivalsFront(c, state);
    // (Piper's words out of the horn she's on)
    if (g.piper) saidOver(c, g.piper.text, g.piperX + 30, GY - 250, '#F9A8D4', 260);
  },
  cameraRow: () => 500,
  outdoors: () => 1,
  lamps: (state) => glenLamps(state),
};
