// THE ATOM: section 2 of Space Land (owner: the atom agent). Inside the giant atom: Meathead callously cuts through
// the backstage of a stylish dark ride (the VOYAGE TO 2010 shows through the gaps in the flats: the starfields, the
// neon planets, the narrated scenes of 2010, the star sleds going round), murdering stagehands among the ride's
// space effects, set to real (rigs.ts): the thrusters, the prop meteors on chains and the meteor shower, the airlocks
// and the decompression air cannon, the laser show in the fog and the blacklight. Taught one at a time, then doubled
// up. Each rig has a stagehand at its controls: kill them and it stops (for good: state.stageMemo). Cast members in
// costume (the moon landing's astronauts with the flag: POINTY; the friendly martians: SPIKY) and the riggers up on
// the catwalks throwing wrenches. Then out a backstage door into the line: he walks straight up it to the front and
// takes a star sled (hijack.ts): on to the ride (SECTIONS.ride).
//
// Backtrackable: out through the CAST ONLY door at the start, to the square. Coming back from the ride's end (it
// launched him out onto the drag: walking back in from there), he's put at the platform, the sled waiting.
//
// ~7500 px, ~1.5 min. Checkpoints 10-14. Indoors (no time of day). Painted in art.ts.

import type { SpaceSection } from '../section';
import type { GameState } from '../../../m1/game/core/state';
import type { Enemy, EnemyKind } from '../../../m1/types';
import { lay, solid, ledge, runExits, endExits, sectionState } from '../section';
import { GY } from '../geometry';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { drawSkipPrompt } from '../../../m1/game/platform/skip';
import {
  x0, x1, A, LEDGES, SOLIDS, POSTS, CAST, deadPosts, markPostDead, HIJACK_MEMO, QUEUE_DOOR, TUNNEL_X,
} from './layout';
import { ATOM, homeFacing, drawBarks } from './kinds';
import { runRigs, buildRigBlocks, type RigBlocks } from './rigs';
import { drawRideBackdrop, drawAtomBack, drawAtomFront, drawPlatformSleds, atomLighting } from './art';
import { type Hijack, newHijack, settleHijack, runLine, atPlatform, runHijack } from './hijack';

interface AtomState { blocks: RigBlocks; hj: Hijack }
const atomOf = (state: GameState) => sectionState<AtomState, 'atom'>(state, 'atom', () => ({ blocks: { doors: [], rocks: [] }, hj: newHijack() }));

/** (who's at which post: kept to see them die) */
const postOf = new WeakMap<Enemy, number>();

export const atom: SpaceSection = {
  id: 'atom', x0, x1,
  checkpoints: [
    { name: 'THE GIANT ATOM', cp: 10, x: A + 200, y: GY },
    { name: 'THE METEOR RIG', cp: 11, x: A + 2260, y: GY },
    { name: 'THE AIRLOCKS', cp: 12, x: A + 3660, y: GY },
    { name: 'THE LASER SHOW', cp: 13, x: A + 4870, y: GY },
    { name: 'THE LINE', cp: 14, x: QUEUE_DOOR + 80, y: GY },
  ],
  build: (state) => {
    const n0 = state.blocks.length;
    lay(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'concrete' }]);
    // (the wall at the start: out through the door there, to the square)
    solid(state, x0 - 60, GY - 800, 60, 800);
    for (const [x, top, w] of SOLIDS) solid(state, x, top, w, GY - top);
    for (const [x, y, w] of LEDGES) ledge(state, x, y, w);
    for (let i = n0; i < state.blocks.length; i++) state.blocks[i].hidden = true;
    const as = atomOf(state);
    as.blocks = buildRigBlocks(state);
    // The stagehands at their posts (not the ones dead in an earlier life: their rigs stay stopped)
    const dead = deadPosts(state);
    for (const [post, x, feet, face] of POSTS) {
      if (dead.has(post)) continue;
      const e: Enemy = makeKindEnemy(ATOM.hand as EnemyKind, x, feet);
      e.variant = post; e.facing = face; e.homeX = e.pos.x;
      homeFacing.set(e, face); postOf.set(e, post);
      state.enemies.push(e);
    }
    CAST.forEach(([kind, x, feet], i) => {
      const e = makeKindEnemy(ATOM[kind] as EnemyKind, x, feet);
      e.variant = i; e.homeX = e.pos.x; e.facing = -1;
      state.enemies.push(e);
    });
    // (a fresh start at the line or past it, the cheat's: the sled's already been taken? No: only from the ride on)
    if (state.checkpoint >= 20) state.stageMemo[HIJACK_MEMO] = 'yes';
    settleHijack(state, as.hj);
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player;
    const as = atomOf(state), hj = as.hj;
    if (hj.active) return runHijack(ctx, hj);
    // (back out the stage door: the square)
    if (runExits(state, endExits('atom').filter(e => e.x1 <= x0 + 60))) return controls;
    // (a stagehand dead: their rig's stopped, and stays stopped)
    for (const e of state.enemies) if (e.kind === ATOM.hand && (e.health <= 0 || e.isBlownAway)) { const post = postOf.get(e); if (post !== undefined && !deadPosts(state).has(post)) markPostDead(state, post); }
    runRigs(ctx, as.blocks);
    runLine(state, hj);
    if (atPlatform(state, hj)) return runHijack(ctx, hj);
    void p;
    return controls;
  },
  drawBackdrop: (c, state) => drawRideBackdrop(c, state),
  drawBack: (c, state) => { const hj = atomOf(state).hj; drawAtomBack(c, state, hj); drawPlatformSleds(c, state, hj, true); },
  drawFront: (c, state) => { const hj = atomOf(state).hj; drawPlatformSleds(c, state, hj, false); drawAtomFront(c, state, hj); drawBarks(c); },
  lighting: (state) => atomLighting(state),
  cameraX: () => ({ min: x0 - 200, max: Math.min(x1, TUNNEL_X + 300) - CANVAS_WIDTH }),
  drawHud: (c, state) => { const hj = atomOf(state).hj; if (hj.active && (hj.t > 30 || hj.step > 0)) drawSkipPrompt(c, CANVAS_WIDTH); },
};
