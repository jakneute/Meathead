// THE CATCH-UP AND TUCKER'S ARENA: section 7 of Wilderness Land, the boss (a later job's; the skeleton's stand-in for
// now). The user's design (frontier-spec.md, verbatim there): back to side view, Meathead catches up to Tucker ("YOU TOOK
// THEM ALL OUT?"); he's furious (he can't stand people cutting the line expecting a free ride; he doesn't give handouts);
// he crashes into a tree with a pointy branch that impales him through the chest (the mutilation rule: an ANIMATED,
// detailed close-up of it happening, tucker.ts `making: { wound: 'branch', k }`). Missing an eye, a buzzsaw in his
// forehead, a branch through his chest, crashed. Meathead walks up: "ARE YOU GOING TO FAKE ME OUT AGAIN?" Yep: he pops up
// like a jumpscare (he does it every time). The real fight starts here. THE FIGHT ISN'T DESIGNED YET: don't design it.
// (His standard death, for when it is: he falls over, apparently dead; Meathead walks up; the jumpscare "AAHHH!"; then a
// grizzly comes out of nowhere and mauls him to death for good, chunks flying; the close-up rule applies. Main bosses:
// 666 HP, the 60-frame breather, non-weakness damage 35%; the big refill before his door; clean / shitty / naked pools
// for every line group.)
//
// THE SKELETON'S STAND-IN (replace it): walk past the middle and it's VICTORY, the walk-away (walkAway/tucker.ts, a
// placeholder registered as 'tucker' in walkAway.ts; his toy: the FLINTLOCK) and the hub, Wilderness Land cleared.
// (The user's spin for the real thing: the walk-away says HEADING BACK TO PARK and he starts from the parking lot and
// walks back in: frontier-spec.md, a later job.) Revisits: once the land's cleared, the stand-in doesn't fire.
//
// Checkpoints 60-69. The way back: the left end (to the end of the dirt-bike chase). No way on (the end of the land).

import type { GameState } from '../../../m1/game/core/state';
import type { FrontierSection } from '../section';
import { layOwn, endWalls, endExits, runExits, groundBox, frontierState, hands } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';
import { frontierSign, frontierSky, onScreen } from '../kit';
import { goTo, markLandCleared, noteBossKill, isLandCleared } from '../../store';
import { type Victory, startVictory, tickVictory, drawVictory, victoryDone } from '../../victory';
import { type WalkAway, playWalkAway, tickWalkAway, drawWalkAway } from '../../walkAway';

const { x0, x1 } = SECTIONS.arena;
/** Where the stand-in ends the land (past the middle of the arena). */
const TRIGGER_X = x0 + 2000;

interface Arena { done: boolean; wonAt: number; victory: Victory | null; walk: WalkAway | null }
const arenaOf = (state: GameState) => frontierState<Arena>(state, 'arena', () => ({ done: false, wonAt: 0, victory: null, walk: null }));

export const arena: FrontierSection = {
  id: 'arena', x0, x1,
  checkpoints: [{ name: 'TUCKER', cp: 60, x: DOORS.arena.start.x, y: GY }],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'dirt' }]);
    endWalls(state, 'arena');
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, s = arenaOf(state);
    if (!s.done) {
      runExits(state, endExits('arena'));
      if (!isLandCleared('frontier') && p.pos.x + p.width / 2 > TRIGGER_X && p.isGrounded) { s.done = true; s.wonAt = state.frame; s.victory = startVictory(); }
      return controls;
    }
    p.inCutscene = true;
    if (s.victory) {
      tickVictory(state, s.victory);
      if (victoryDone(s.victory) && state.frame - s.wonAt > 60) {
        s.victory = null;
        markLandCleared('frontier'); noteBossKill();
        s.walk = playWalkAway(state, { boss: 'tucker', onDone: () => goTo('hub') });
      }
    }
    if (s.walk) tickWalkAway(s.walk, controls);
    return hands();
  },
  drawBackdrop: (c, state) => frontierSky(c, state, { near: '#2F4A2A' }),
  drawBack: (c, state) => {
    groundBox(c, x0 - 200, x1 + 200, GY, '#4A3420', '#6B8A3A');
    if (onScreen(state, x0 + 400, x0 + 800)) frontierSign(c, x0 + 600, GY, ['TUCKER', 'THE FIGHT: COMING SOON']);
  },
  drawHud: (c, state) => {
    const s = arenaOf(state);
    if (s.victory) drawVictory(c, s.victory);
    if (s.walk) drawWalkAway(c, s.walk);
  },
  outdoors: () => 1,
};
