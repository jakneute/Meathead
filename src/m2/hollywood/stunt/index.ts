// THE STUNT STAGE: section 7 of Hollywood Land, the boss (owner: the disaster agent). The tornado flings him into the
// set of a stunt show: STUNTMAN STEVE'S STUPENDOUS STUNTERY. Steve's a washed-up stunt double who did dangerous work on
// 80s action films; now he does unimpressive stunts (sidestepping an oncoming car). He still has his balls; he lost his
// athleticism. The park treats the show as its crown jewel because his face was seen for a few frames of a released
// film once (the arena: grandstands half empty, a ramp, a car on a cable, a fire ring, crash mats, a giant face banner).
// THE FIGHT ISN'T DESIGNED YET (the user will do it): build the stage and Steve's entrance (cutscene beat: HUD hidden,
// skip all-or-nothing) when it's designed; till then, a clearly placeholder stand-in. Main bosses: 666 HP, the 60-frame
// breather, non-weakness damage 35%; a big health + ammo refill before its door; clean / shitty / naked line pools for
// every line group, intro to death.
//
// THE SKELETON'S STAND-IN (replace it): walk past the middle of the stage and it's VICTORY, the walk-away
// (walkAway/stuntmanSteve.ts, a placeholder SceneDef registered as 'stuntman-steve' in walkAway.ts; his toy: the
// STUNT_CAR) and the hub, Hollywood Land cleared. Its checkpoint (60) is at the stage's door for now; give the boss its
// own `clear` as the others do. Revisits: once the land's cleared, the stand-in doesn't fire.
//
// The way back: the left end (back to where the tornado caught him: DOORS.havoc.end). No way on (the end of the land).

import type { GameState } from '../../../m1/game/core/state';
import type { HollywoodSection } from '../section';
import { layOwn, endWalls, endExits, runExits, groundBox, postSign, placeholderBackdrop, hollywoodState, hands, steveFlier } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';
import { goTo, markLandCleared, noteBossKill, isLandCleared } from '../../store';
import { type Victory, startVictory, tickVictory, drawVictory, victoryDone } from '../../victory';
import { type WalkAway, playWalkAway, tickWalkAway, drawWalkAway } from '../../walkAway';

const { x0, x1 } = SECTIONS.stunt;
/** Where the stand-in ends the land (past the middle of the stage). */
const TRIGGER_X = x0 + 1500;

interface Stunt { done: boolean; wonAt: number; victory: Victory | null; walk: WalkAway | null }
const stuntOf = (state: GameState) => hollywoodState<Stunt>(state, 'stunt', () => ({ done: false, wonAt: 0, victory: null, walk: null }));

export const stunt: HollywoodSection = {
  id: 'stunt', x0, x1,
  checkpoints: [{ name: 'THE STUNT STAGE', cp: 60, x: DOORS.stunt.start.x, y: GY }],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'hard' }]);
    endWalls(state, 'stunt');
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, s = stuntOf(state);
    if (!s.done) {
      runExits(state, endExits('stunt'));
      if (!isLandCleared('hollywood') && p.pos.x + p.width / 2 > TRIGGER_X && p.isGrounded) { s.done = true; s.wonAt = state.frame; s.victory = startVictory(); }
      return controls;
    }
    p.inCutscene = true;
    if (s.victory) {
      tickVictory(state, s.victory);
      if (victoryDone(s.victory) && state.frame - s.wonAt > 60) {
        s.victory = null;
        markLandCleared('hollywood'); noteBossKill();
        s.walk = playWalkAway(state, { boss: 'stuntman-steve', onDone: () => goTo('hub') });
      }
    }
    if (s.walk) tickWalkAway(s.walk, controls);
    return hands();
  },
  drawBackdrop: (c, state) => placeholderBackdrop(c, state, { sky: ['#1E3A8A', '#3B82F6', '#93C5FD', '#FDE68A'], far: '#7F1D1D', hill: true }),
  drawBack: (c) => {
    groundBox(c, x0 - 200, x1 + 200, GY, '#44403C', '#FACC15');
    postSign(c, x0 + 600, GY, "STUNTMAN STEVE'S STUPENDOUS STUNTERY");
    steveFlier(c, x0 + 1200, GY - 170, 'poster');
    postSign(c, x0 + 1500, GY, 'STUNTMAN STEVE: COMING SOON');
  },
  drawHud: (c, state) => {
    const s = stuntOf(state);
    if (s.victory) drawVictory(c, s.victory);
    if (s.walk) drawWalkAway(c, s.walk);
  },
  outdoors: () => 1,
};
