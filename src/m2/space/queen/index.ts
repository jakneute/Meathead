// THE QUEEN: section 8 of Space Land, the boss (owner: the haunted-house agent). The haunted house's showpiece room:
// a queen alien animatronic behind a glass panel. Meathead kicks the glass; the real aliens mind-control it, and it's a
// real threat (the boss: it spawns brood, a robot birthing new aliens; don't ask). The boss mechanics aren't in yet:
// build the room, the queen, the kick and the mind-control turn as a cutscene beat (HUD hidden, skip all-or-nothing),
// then a clearly-placeholder fight or a "boss coming soon" stand-in that ends the land, easy to replace. Main bosses:
// the 60-frame breather, 666 HP. A big health + ammo refill before its door.
//
// THE SKELETON'S STAND-IN (replace it): walk past the middle of the room and it's VICTORY, the walk-away
// (walkAway/spaceQueen.ts) and the hub, Space Land cleared. Its checkpoint (70) is at the room's door for now; give the
// boss its own `clear` as the others do. Revisits: once the land's cleared, the stand-in doesn't fire.
//
// The way back: the left end (into the haunted house). No way on (the end of the land).

import type { GameState } from '../../../m1/game/core/state';
import type { SpaceSection } from '../section';
import { layOwn, endWalls, endExits, runExits, groundBox, postSign, placeholderBackdrop, spaceState, hands } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';
import { goTo, markLandCleared, noteBossKill, isLandCleared } from '../../store';
import { type Victory, startVictory, tickVictory, drawVictory, victoryDone } from '../../victory';
import { type WalkAway, playWalkAway, tickWalkAway, drawWalkAway } from '../../walkAway';

const { x0, x1 } = SECTIONS.queen;
/** Where the stand-in ends the land (past the middle of the room). */
const TRIGGER_X = x0 + 1500;

interface Queen { done: boolean; wonAt: number; victory: Victory | null; walk: WalkAway | null }
const queenOf = (state: GameState) => spaceState<Queen>(state, 'queen', () => ({ done: false, wonAt: 0, victory: null, walk: null }));

export const queen: SpaceSection = {
  id: 'queen', x0, x1,
  checkpoints: [{ name: 'THE SHOWPIECE', cp: 70, x: DOORS.queen.start.x, y: GY }],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'metal' }]);
    endWalls(state, 'queen');
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, q = queenOf(state);
    if (!q.done) {
      runExits(state, endExits('queen'));
      if (!isLandCleared('space') && p.pos.x + p.width / 2 > TRIGGER_X && p.isGrounded) { q.done = true; q.wonAt = state.frame; q.victory = startVictory(); }
      return controls;
    }
    p.inCutscene = true;
    if (q.victory) {
      tickVictory(state, q.victory);
      if (victoryDone(q.victory) && state.frame - q.wonAt > 60) {
        q.victory = null;
        markLandCleared('space'); noteBossKill();
        q.walk = playWalkAway(state, { boss: 'space-queen', onDone: () => goTo('hub') });
      }
    }
    if (q.walk) tickWalkAway(q.walk, controls);
    return hands();
  },
  drawBackdrop: (c, state) => placeholderBackdrop(c, state, { flat: '#0A0614', far: '#3B0764' }),
  drawBack: (c) => {
    groundBox(c, x0 - 200, x1 + 200, GY, '#27272A', '#A1A1AA');
    postSign(c, x0 + 600, GY, 'THE QUEEN: COMING SOON');
  },
  drawHud: (c, state) => {
    const q = queenOf(state);
    if (q.victory) drawVictory(c, q.victory);
    if (q.walk) drawWalkAway(c, q.walk);
  },
};
