// THE STUNT STAGE: section 7 of Hollywood Land, the boss. The tornado flings him down onto the set of a stunt show:
// STUNTMAN STEVE'S STUPENDOUS STUNTERY, an amphitheater's stage (extra wide, a small crowd at the barrier and up the
// ends, the street set along the back, the posse's garage doors in it, ramps creeping along the back lane, hoops and
// rings of fire hung off the truss). Steve: a washed-up 80s stunt double in a yellow suit (fight.ts: the intro, the
// fight, his two deaths; cars.ts: his posse; art.ts and steve.ts: the look).
//
// In off the fling (or on foot from the havoc), it starts as soon as he's on the stage: the walls go up (the stacked
// tires), the camera keeps to the arena. A retry from the checkpoint (60, at the way in, a big health and ammo refill
// there) goes straight to the fight. Beaten: VICTORY, the walk-away (walkAway/stuntmanSteve.ts), the hub, Hollywood
// Land cleared. Revisits: once the land's cleared, the stage stands empty (SHOW CANCELED, the wrecks).
//
// The way back: the left end (back to where the tornado caught him: DOORS.havoc.end). No way on (the end of the land).

import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import type { HollywoodSection } from '../section';
import { layOwn, endWalls, endExits, runExits, hollywoodState, hands } from '../section';
import { DOORS, GY } from '../geometry';
import { topBand } from '../../../m1/constants';
import { goTo, markLandCleared, noteBossKill, isLandCleared } from '../../store';
import { type Victory, startVictory, tickVictory, drawVictory, victoryDone } from '../../victory';
import { type WalkAway, playWalkAway, tickWalkAway, drawWalkAway } from '../../walkAway';
import { markBossFight } from '../../bossQuiet';
import { x0, x1, ARENA_L, ARENA_R, CEIL_Y, CAM_ROW } from './arena';
import { drawStuntBackdrop, drawStage, drawCrowd } from './art';
import {
  type Fight, startFight, updateFight, fightOver, endFight, resetFight, drawFightBack, drawFightFront, drawFightHud,
  killCamTick, killCamZoom, killedByWeakness, screenState,
} from './fight';

interface Stunt {
  fight: 'wait' | 'on' | 'won'; wonAt: number;
  f: Fight | null; walls: Block[];
  victory: Victory | null; walk: WalkAway | null;
}
const stuntOf = (state: GameState) => hollywoodState<Stunt>(state, 'stunt', () => ({ fight: 'wait', wonAt: 0, f: null, walls: [], victory: null, walk: null }));

const leave = (state: GameState, weakness: boolean) => {
  const s = stuntOf(state);
  markLandCleared('hollywood'); noteBossKill();
  s.walk = playWalkAway(state, { boss: 'stuntman-steve', weakness, onDone: () => goTo('hub') });
};

export const stunt: HollywoodSection = {
  id: 'stunt', x0, x1,
  checkpoints: [{ name: 'THE STUNT STAGE', cp: 60, x: DOORS.stunt.start.x, y: GY, clear: [400, 3000] }],
  build: (state) => {
    resetFight();
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'hard' }]);
    endWalls(state, 'stunt');
    // (the far end's stacked tires: always there; nothing past them but the bleachers)
    state.blocks.push({ x: ARENA_R, y: -4000, w: 40, h: 4000 + GY, type: 'wall', hidden: true, tag: 'stunt-end' } as Block);
    // (the big health and ammo, by the way in: before it starts, and on every retry)
    // (no pickups on the stage: the refill's in the havoc's SAFE TORNADO LAUNCHING ZONE, on the way in)
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, s = stuntOf(state);
    if (s.fight === 'wait') {
      runExits(state, endExits('stunt'));
      // (on the stage, not cleared: it's on; the walls up, the truss over it)
      if (!isLandCleared('hollywood') && p.pos.x + p.width / 2 > ARENA_L + 40 && p.pos.x + p.width / 2 < ARENA_R) {
        s.fight = 'on';
        s.f = startFight(state);
        s.walls = [
          { x: ARENA_L - 40, y: -4000, w: 40, h: 4000 + GY, type: 'wall', hidden: true, tag: 'stunt-wall' } as Block,
          { x: ARENA_R, y: -4000, w: 40, h: 4000 + GY, type: 'wall', hidden: true, tag: 'stunt-wall' } as Block,
          { x: ARENA_L - 40, y: CEIL_Y - 40, w: ARENA_R - ARENA_L + 80, h: 40, type: 'wall', hidden: true, tag: 'stunt-truss' } as Block,
        ];
        state.blocks.push(...s.walls);
      }
      return controls;
    }
    if (s.fight === 'on' && s.f) {
      const f = s.f;
      markBossFight(state);
      const out = updateFight(ctx, f, controls);
      // (held in: never out of the arena, whatever sends him flying)
      const lo = ARENA_L, hi = ARENA_R - p.width;
      if (p.pos.x < lo) { p.pos.x = lo; if (p.vel.x < 0) p.vel.x = 0; }
      if (p.pos.x > hi) { p.pos.x = hi; if (p.vel.x > 0) p.vel.x = 0; }
      if (p.pos.y < CEIL_Y) { p.pos.y = CEIL_Y; if (p.vel.y < 0) p.vel.y = 0; }
      if (fightOver(f)) {
        s.fight = 'won'; s.wonAt = state.frame;
        endFight(state, f);
        state.blocks = state.blocks.filter(b => !s.walls.includes(b)); s.walls = [];
        s.victory = startVictory();
      }
      return out;
    }
    if (s.fight === 'won') {
      p.inCutscene = true;
      if (s.victory) { tickVictory(state, s.victory); if (victoryDone(s.victory) && state.frame - s.wonAt > 60) { s.victory = null; leave(state, !!s.f && killedByWeakness(s.f)); } }
      if (s.walk) tickWalkAway(s.walk, controls);
      return hands();
    }
    return controls;
  },
  cameraX: (state) => (stuntOf(state).fight === 'wait' ? { min: x0, max: ARENA_R + 40 - 800 } : { min: ARENA_L, max: ARENA_R - 800 }),
  cameraRow: () => CAM_ROW,
  drawBackdrop: (c, state) => drawStuntBackdrop(c, state),
  drawBack: (c, state) => {
    const s = stuntOf(state), f = s.f;
    const sc = f ? screenState(f) : { replay: 0, hurtFlash: 0, hype: 0 };
    drawStage(c, state, { cleared: isLandCleared('hollywood') && !f, hype: sc.hype, replay: sc.replay, hurtFlash: sc.hurtFlash, doorsLit: !!f });
    if (f) drawFightBack(c, state, f);
  },
  drawFront: (c, state) => {
    const s = stuntOf(state), f = s.f;
    if (f && s.fight !== 'wait') drawFightFront(c, state, f);
    drawCrowd(c, state, f ? f.hype : 0);
  },
  drawHud: (c, state) => {
    const s = stuntOf(state);
    if (s.f && s.fight === 'on') drawFightHud(c, s.f, topBand(), !!state.player.inCutscene);
    if (s.victory) drawVictory(c, s.victory);
    if (s.walk) drawWalkAway(c, s.walk);
  },
  zoom: (state) => { const f = stuntOf(state).f; return f ? killCamZoom(state, f) : null; },
  holdTick: (ctx) => { const f = stuntOf(ctx.state).f; return f ? killCamTick(f) : false; },
  outdoors: () => 1,
};
