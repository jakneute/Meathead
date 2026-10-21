// SILLYVILLE SQUARE: section 1 of Cartoon Land. The user's brief: "we enter into a seuss landing esque place. a section
// of the park built for kiddie rides with a whimsical theme. introduce a new platforming mechanic here. go through the
// square, avoid the rides. have meathead lament why he went here because 'there's no good rides here'. as you progress
// through, you enter an indoor ride that promises you to 'learn the magic of how cartoons are made' (established 1994)."
// The kiddie square (layout.ts: teach, then escalate): the land's new mechanic, THE SWAYING STACK-TOWERS
// (cartoon/sway.ts), taught alone at the SWEET-TOOTH SHOPPE and built on (a ball pit, the carousel's canopy, the
// spinner's fish, a chain over the big pit, lids over the trolley's track); the rides as moving hazards and the ball
// pits (hazards.ts); the costumed cast (kinds.ts); at its end, the studio's front door (the way on).
//
// The ways: the land's start (no going off its left); the studio's door, on to the studio (DOORS.studio.start); back
// from the studio, he's in front of that door (DOORS.kiddie.end).

import { pickLine } from '../../../m1/game/platform/speech';
import type { EnemyKind } from '../../../m1/types';
import { makeKindEnemy, mid } from '../../../m1/game/enemies/kinds';
import type { CartoonSection } from '../section';
import { layOwn, ledge, solid, meatheadSays, byPants, runExits, saidOver } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';
import { makeTowers, updateTowers, drawTowers, ridingTower } from '../sway';
import { GROUND, SOLIDS, LEDGES, TOWERS, IN_PIT, CAST, PICKUPS, CHECKPOINTS, GAG_AT, STUDIO, X, Y } from './layout';
import { kiddieOf, saidOnce, KIDDIE_DONE_MEMO } from './state';
import { updateHazards, drawHazardsBack, drawHazardsFront, noteSafe } from './hazards';
import { drawPitBounce } from '../pitBounce';
import { drawKiddieBackdrop, drawKiddieBack, drawPitHeaps, kiddieLamps } from './art';
import { ARRIVE, REVISIT, GAGS } from './lines';
import './kinds';

const { x0, x1 } = SECTIONS.kiddie;
export { KIDDIE_DONE_MEMO };

export const kiddie: CartoonSection = {
  id: 'kiddie', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    layOwn(state, GROUND.map(([a, b]) => ({ x1: X(a), y1: GY, x2: X(b), y2: GY, surface: 'hard' })));
    // (the land's start: no going off the left of it; the studio's door is as far right as he goes)
    state.blocks.push({ x: x0 - 40, y: -6000, w: 40, h: 6000 + GY + 600, type: 'wall', hidden: true, tag: 'kiddie-start' });
    state.blocks.push({ x: X(STUDIO.door) + 70, y: -6000, w: 40, h: 6000 + GY + 600, type: 'wall', hidden: true, tag: 'kiddie-end' });
    for (const [a, b, top] of SOLIDS) solid(state, X(a), Y(top), b - a, GY + 40 - Y(top), { hidden: true });
    for (const [a, b, h] of LEDGES) ledge(state, X(a), Y(h), b - a, { hidden: true });
    const k = kiddieOf(state);
    k.towers = makeTowers(state, TOWERS.map((d, i) => (IN_PIT.has(i) ? { ...d, pit: true } : d)));
    for (const [kind, rx, h, v] of CAST) {
      const e = makeKindEnemy(kind as EnemyKind, X(rx), Y(h));
      e.homeX ??= e.pos.x; e.homeY = e.pos.y; e.variant = v ?? Math.abs(Math.round(rx)) % 7; e.facing = -1;
      state.enemies.push(e);
    }
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `kiddie-${Math.round(rx)}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
    // (where the ball pits spit him back out, till he's stood somewhere: his checkpoint)
    const cp = CHECKPOINTS.find(c => c.cp === state.checkpoint) ?? CHECKPOINTS[0];
    k.safe = { x: cp.x, y: cp.y };
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, k = kiddieOf(state);
    updateTowers(ctx, k.towers);
    noteSafe(state);
    updateHazards(ctx);
    const rx = p.pos.x + p.width / 2 - x0;
    // What he's got to say about it (once each a visit)
    const once = (key: string, pool: string[]) => { if (!p.inCutscene && p.health > 0 && saidOnce(key)) meatheadSays(state, pickLine(pool), false); };
    if (rx < 600 && state.frame > 40) once('arrive', byPants(state, state.stageMemo[KIDDIE_DONE_MEMO] ? REVISIT : ARRIVE));
    for (const [key, at] of GAG_AT) if (rx > at && rx < at + 400) once(key, byPants(state, GAGS[key as keyof typeof GAGS]));
    // (on a tower as it first leans)
    const t = ridingTower(state, k.towers);
    if (t && Math.abs(t.ang) > 0.12) once('tower', byPants(state, GAGS.tower));
    // (the mascot, coming for him)
    if (state.enemies.some(e => e.kind === 'm2:ct_mascot' && e.health > 0 && e.aiState === 'near' && Math.abs(mid(e).x - mid(p).x) < 500)) once('mascot', byPants(state, GAGS.mascot));
    // (in through the studio's door: on to the studio)
    const door = X(STUDIO.door);
    if (runExits(state, [{ x0: door - 30, x1: door + 40, yTop: GY - 40, yBot: GY + 2, to: DOORS.studio.start }])) state.stageMemo[KIDDIE_DONE_MEMO] = '1';
    return controls;
  },
  drawBackdrop: (c, state) => drawKiddieBackdrop(c, state),
  drawBack: (c, state) => {
    drawKiddieBack(c, state);
    drawHazardsBack(c, state);
    drawTowers(c, state, kiddieOf(state).towers);
    drawPitHeaps(c, state);
  },
  drawFront: (c, state) => {
    drawHazardsFront(c, state);
    drawPitBounce(c, state);
    // (the cast's barks, over their heads)
    for (const [e, s] of kiddieOf(state).barks) if (e.health > 0) saidOver(c, s.text, mid(e).x, e.pos.y - 14, '#FDE68A', 220);
  },
  cameraRow: () => 500,
  outdoors: () => 1,
  lamps: (state) => kiddieLamps(state),
};
