// THE TOWN SQUARE: section 1 of Fairy Land. The user's brief: "we begin with a standard platforming sequence in a town
// square. theme it as a combination of harry potter lands in islands of adventure and fantasy land in Disney world.
// various primarily human enemies will be in your way. introduce a new mechanic in these sections too... surprise me."
// HOGSMEAT VILLAGE into the storybook square (layout.ts: teach, then escalate): the land's new mechanic, THE ENCHANTED
// STAIRCASES (fantasy/stairs.ts), taught alone at WANDS & SONS and built on (the carousel, the gorge's chain, the
// Grand Staircase's tower); the hazards (hazards.ts: the roofs' snow, the butter brew keg); the cast (kinds.ts: the
// park's cast members in costume, a mail owl); at its end the LOUDSPEAKER and Piper's voice (speaker.ts), whose scene
// sends him on to the fairy wheel.
//
// The ways: the land's start (no going off its left); its right end, once the loudspeaker's had its say, on to the
// wheel (DOORS.wheel.start); back from the wheel, he's past the bandstand (DOORS.square.end).

import { pickLine } from '../../../m1/game/platform/speech';
import type { EnemyKind } from '../../../m1/types';
import { makeKindEnemy, mid } from '../../../m1/game/enemies/kinds';
import type { FantasySection } from '../section';
import { layOwn, ledge, solid, meatheadSays, byPants, endExits, runExits, saidOver } from '../section';
import { SECTIONS, GY } from '../geometry';
import { makeStairs, updateStairs, drawStairs, ridingAny } from '../stairs';
import { GROUND, SOLIDS, LEDGES, STAIRS, CAST, PICKUPS, CHECKPOINTS, GAG_AT, PILLAR, X, Y } from './layout';
import { squareOf } from './state';
import { buildHazards, updateHazards, drawHazardsBack, drawHazardsFront } from './hazards';
import { drawSquareBackdrop, drawSquareBack, squareLamps } from './art';
import { updateSpeaker, drawSpeakerBack, drawSpeakerFront, drawSpeakerHud, speakerDone } from './speaker';
import { ARRIVE, REVISIT, GAGS } from './lines';
import './kinds';

const { x0, x1 } = SECTIONS.square;

export const square: FantasySection = {
  id: 'square', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    layOwn(state, GROUND.map(([a, b, h]) => ({ x1: X(a), y1: Y(h), x2: X(b), y2: Y(h), surface: 'stone' })));
    // (the land's start: no going off the left of it; the right end: walled, the way on's an exit once the scene's run)
    state.blocks.push({ x: x0 - 40, y: -6000, w: 40, h: 6000 + GY + 600, type: 'wall', hidden: true, tag: 'square-start' });
    state.blocks.push({ x: x1, y: -6000, w: 40, h: 6000 + GY + 600, type: 'wall', hidden: true, tag: 'square-end' });
    for (const [a, b, top, bot] of SOLIDS) solid(state, X(a), Y(top), b - a, (bot !== undefined ? Y(bot) : GY + 40) - Y(top), { hidden: true });
    for (const [a, b, h] of LEDGES) ledge(state, X(a), Y(h), b - a, { hidden: true });
    const sq = squareOf(state);
    sq.stairs = makeStairs(state, STAIRS);
    buildHazards(state);
    for (const [kind, rx, h] of CAST) {
      const e = makeKindEnemy(kind as EnemyKind, X(rx), Y(h));
      e.homeX ??= e.pos.x; e.homeY = e.pos.y; e.variant = Math.abs(Math.round(rx)) % 7; e.facing = -1;
      state.enemies.push(e);
    }
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `square-${Math.round(rx)}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, sq = squareOf(state);
    updateStairs(ctx, sq.stairs);
    const out = updateSpeaker(ctx, controls);
    updateHazards(ctx);
    const rx = p.pos.x + p.width / 2 - x0;
    // What he's got to say about it (once each)
    const once = (k: string, pool: string[]) => { if (!sq.said[k] && !p.inCutscene && p.health > 0) { sq.said[k] = true; meatheadSays(state, pickLine(pool), false); } };
    if (state.checkpoint === 0 && rx < 500 && state.frame > 40) once('arrive', byPants(state, speakerDone(state) ? REVISIT : ARRIVE));
    for (const [k, at] of GAG_AT) if (rx > at && rx < at + 400) once(k, byPants(state, GAGS[k as keyof typeof GAGS]));
    // (charged into PLATFORM 7 5/8: it's a wall)
    if (p.hurtForm === 'charge' && Math.abs(rx - (PILLAR.a + PILLAR.b) / 2) < 90) once('wall', byPants(state, GAGS.wall));
    // (on a staircase for the first time, as it moves)
    const on = ridingAny(state, sq.stairs);
    if (on && (on.moving || on.tell > 0)) once('stairs', byPants(state, GAGS.stairs));
    // (on to the wheel: off the right end, once the loudspeaker's had its say)
    if (speakerDone(state)) runExits(state, endExits('square', { left: false }));
    return out;
  },
  drawBackdrop: (c, state) => drawSquareBackdrop(c, state),
  drawBack: (c, state) => {
    drawSquareBack(c, state);
    drawHazardsBack(c, state);
    drawStairs(c, state, squareOf(state).stairs);
    drawSpeakerBack(c, state);
  },
  drawFront: (c, state) => {
    drawHazardsFront(c, state);
    // (the cast's barks, over their heads)
    for (const [e, s] of squareOf(state).barks) if (e.health > 0) saidOver(c, s.text, mid(e).x, e.pos.y - 12, '#FDE68A', 220);
    drawSpeakerFront(c, state);
  },
  drawHud: (c, state) => drawSpeakerHud(c, state),
  cameraRow: () => 500,
  outdoors: () => 1,
  lamps: (state) => squareLamps(state),
};
