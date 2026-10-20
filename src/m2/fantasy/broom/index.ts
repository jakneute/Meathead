// THE BROOMSTICK DEATHMATCH: section 6 of Fairy Land, the final trial (a sub-boss: markBossFight every frame of it).
// The user's design (fantasy-spec.md, verbatim there): behind the back like the Road Rash section, a "free range"
// arena with mode 7 style trickery; Y or alternate fire toggles inverted up/down; X fires; kill all the other suitors;
// then he flies into the castle's highest window: a rapid zoom, a fancy shattering-glass transition, and he's outside
// the great pixie's bedroom (naked: he's got a boner). Modeled on Star Fox 64's all-range mode (the user's), simpler.
//
//   arena.ts   the castle grounds as a sky to fly round (the castle in the middle, towers, balloons, the magic wall),
//              the eye, the solids, the mode 7 floor (its texture's copies, the park beyond's tile past its edge), the
//              splatters baked into it
//   world.ts   where everything stands (shared by the floor and the billboards)
//   ground.ts  the floor's texture, painted for the hour (the grounds from above at peak SNES)
//   sprites.ts the billboards (the castle, watchtowers, trees, banner poles, balloons), each with its chain of copies
//   sky.ts     the sky and the rings round the horizon (stars, clouds, the Alps, the far park), sun, birds, fireworks
//   side.ts    the side view after it's won (a wall walk high on the castle, the grounds below through the mode 7 floor)
//   art.ts     him from behind on his broom (the laser on its end), the suitors on theirs, what flies, the dead
//   fight.ts   the mode: flying, the laser and the lock-on, the suitors and their ways, deaths, the late entries, the
//              window, the zoom, the shatter; its HUD bits
//   lines.ts   every line, clean / shitty / naked; the new hurts and their death screens
//
// The side view (this file): only for after (a revisit): a short landing high on the castle, the deathmatch done,
// walkable both ways (back to the runway, on to her chambers). Before it's won, being here is being in the fight: in
// off the runway's scene (DOORS.broom.start) or back at its checkpoints (50 the start, 51 the late entries) he's
// straight up on his broom. Once it's on there's no leaving it (the sub-boss rule) till the last suitor's down.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../../m1/constants';
import type { FantasySection } from '../section';
import { layOwn, endWalls, runExits, fantasyState, hands, type Exit } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';
import { storySign, onScreen } from '../kit';
import { markBossFight } from '../../bossQuiet';
import { inFight, startFight, updateFight, drawFight, broomDone } from './fight';
import { drawSideBackdrop, drawSideBack } from './side';

export { tickShatter, drawShatter, BROOM_MEMO } from './fight';

const { x0, x1 } = SECTIONS.broom;
/** The side view's length (the rest of the x room is unused: the fight's its own view). */
const LEN = 1400;
DOORS.broom.end = { x: x0 + LEN - 250, y: GY };

interface Side { first: boolean }
const sideOf = (state: GameState) => fantasyState<Side>(state, 'broom-side' as 'broom', () => ({ first: true }));

const exits = (): Exit[] => [
  { x0, x1: x0 + 60, yTop: GY - 40, yBot: GY + 2, to: DOORS.keep.end },
  { x0: x0 + LEN - 60, x1: x0 + LEN, yTop: GY - 40, yBot: GY + 2, to: DOORS.bedroom.start },
];

export const broom: FantasySection = {
  id: 'broom', x0, x1,
  checkpoints: [
    { name: 'BROOMSTICK DEATHMATCH', cp: 50, x: DOORS.broom.start.x, y: GY },
    { name: 'BROOMSTICKS: LATE ENTRIES', cp: 51, x: DOORS.broom.start.x, y: GY, manual: true },
  ],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x0 + LEN + 200, y2: GY, surface: 'stone' }]);
    endWalls(state, 'broom', { right: false });
    state.blocks.push({ x: x0 + LEN, y: -6000, w: 40, h: 8000, type: 'wall', hidden: true, tag: 'broom-end' });
    sideOf(state).first = true;
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player;
    if (inFight(state)) { markBossFight(state, 'broomsticks'); return updateFight(ctx, controls); }
    // (not won yet: here is up on the broom, straight away)
    if (!broomDone(state) && p.health > 0) { sideOf(state).first = false; markBossFight(state, 'broomsticks'); startFight(state); return hands(); }
    runExits(state, exits());
    return controls;
  },
  cameraX: () => ({ min: x0, max: x0 + LEN - CANVAS_WIDTH }),
  drawBackdrop: (c, state) => (inFight(state) ? true : drawSideBackdrop(c, state, x0, LEN)),
  drawBack: (c, state) => {
    if (inFight(state)) return;
    // (after: a wall walk high on the castle's crown, the grounds far below; the way to her chambers: side.ts)
    drawSideBack(c, state, x0, LEN);
    if (onScreen(state, x0 + 200, x0 + 700)) storySign(c, x0 + 450, GY, ['BROOMSTICK DEATHMATCH', 'CONCLUDED. NO SURVIVORS.'], { board: '#6E1E4E' });
    if (onScreen(state, x0 + LEN - 400, x0 + LEN)) storySign(c, x0 + LEN - 200, GY, ["HER CHAMBERS >"], { big: 1, board: '#6E1E4E' });
  },
  drawHud: (c, state) => { if (inFight(state)) drawFight(c, state); },
  outdoors: () => 1,
};
