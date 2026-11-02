// THE STUNT STAGE: section 7 of Hollywood Land, the boss. The tornado flings him down onto the set of a stunt show:
// STUNTMAN STEVE'S STUPENDOUS STUNTERY, an amphitheater's stage (extra wide, a small crowd at the barrier and up the
// ends, the street set along the back, the posse's garage doors in it, ramps creeping along the back lane, hoops and
// rings of fire hung off the truss). Steve: a washed-up 80s stunt double in a yellow suit (fight.ts: the intro, the
// fight, his two deaths; cars.ts: his posse; art.ts and steve.ts: the look).
//
// In off the fling (or on foot from the havoc), it starts as soon as he's on the stage: the walls go up (the stacked
// tires), the camera keeps to the arena. A retry from the checkpoint (60: outside, at the havoc's end by its big health
// and ammo) walks back in through the way on and goes straight to the fight. Beaten: VICTORY, the walk-away (walkAway/stuntmanSteve.ts), the hub, Hollywood
// Land cleared. Revisits: once the land's cleared, the stage stands empty (SHOW CANCELED, the wrecks).
//
// No way back: the fling is one-way (the left end's a wall; dead, he's back at the checkpoint outside and walks in).
// No way on (the end of the land).

import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import type { HollywoodSection } from '../section';
import { layOwn, endWalls, hollywoodState, hands } from '../section';
import { DOORS, GY } from '../geometry';
import { topBand, CANVAS_HEIGHT } from '../../../m1/constants';
import { goTo, markLandCleared, markBossDeath, noteBossKill, isLandCleared } from '../../store';
import { type Victory, startVictory, tickVictory, drawVictory, victoryDone } from '../../victory';
import { type WalkAway, playWalkAway, tickWalkAway, drawWalkAway } from '../../walkAway';
import { markBossFight } from '../../bossQuiet';
import { x0, x1, ARENA_L, ARENA_R, CEIL_Y, CAM_ROW } from './arena';
import { frameDeath } from '../../deathFrame';
import { drawStuntBackdrop, drawStage, drawCrowd } from './art';
import {
  type Fight, startFight, updateFight, fightOver, endFight, resetFight, drawFightBack, drawFightFront, drawFightHud,
  killCamTick, killCamZoom, deathNeed, killedByWeakness, screenState, bayLooks,
} from './fight';
import { bossGone, leaveEmptyArena } from '../../emptyArena';
import { FLUNG_IN, LAND_FALL } from './state';
import { MH_STAGE_EMPTY } from './lines';
import { byPants } from '../blvd/kinds';
import { pickLine } from '../../../m1/game/platform/speech';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';

/** The stage as far as a camera taking his death in may go (wall to wall, the truss's ceiling, the front of the shot). */
const STAGE_ROOM = { x0: ARENA_L, y0: CEIL_Y, x1: ARENA_R, y1: GY - CAM_ROW + CANVAS_HEIGHT };
interface Stunt {
  fight: 'wait' | 'on' | 'won'; wonAt: number;
  f: Fight | null; walls: Block[];
  victory: Victory | null; walk: WalkAway | null;
  /** A revisit (Steve's dead): in off the fling, frames into his fall onto the empty stage; his line there, picked once. */
  fall?: number; fallX?: number; emptyLine?: string;
}
const stuntOf = (state: GameState) => hollywoodState<Stunt>(state, 'stunt', () => ({ fight: 'wait', wonAt: 0, f: null, walls: [], victory: null, walk: null }));

const leave = (state: GameState, weakness: boolean) => {
  const s = stuntOf(state);
  markBossDeath('hollywood', weakness); markLandCleared('hollywood'); noteBossKill();
  s.walk = playWalkAway(state, { boss: 'stuntman-steve', weakness, onDone: () => goTo('hub') });
};

/** The revisit's stage: the fall in off the fling (as the fight's intro has it, simpler: head over heels, down onto the
 *  stage), then the empty arena (emptyArena.ts). On foot (a fresh start at its checkpoint), straight to the line. */
const emptyStage = (state: GameState, s: Stunt, controls: Parameters<NonNullable<HollywoodSection['update']>>[1]) => {
  const p = state.player, cx = p.pos.x + p.width / 2;
  if (FLUNG_IN.on && s.fall === undefined) { FLUNG_IN.on = false; s.fall = 0; s.fallX = cx; }
  if (s.fall !== undefined && s.fall <= LAND_FALL.t) {
    const T = LAND_FALL.t, u = Math.min(1, ++s.fall / T), ease = 1 - (1 - u) * (1 - u);
    const x = s.fallX! + (ARENA_L + 520 - s.fallX!) * ease, feet = GY - LAND_FALL.h * (1 - u * u);
    p.inCutscene = true; p.carried = true; p.pos.x = x - p.width / 2; p.pos.y = feet - p.height; p.vel.x = 0; p.vel.y = 0;
    const rot = Math.PI * 6 * ease;
    if (!p.freefall) p.freefall = { style: 'flail', t: 0, rot, land: 0 };
    p.freefall.t++; p.freefall.rot = rot;
    if (s.fall % 18 === 0) playSound('whoosh', 0.7, -2 + s.fall / 12);
    if (s.fall >= T) {
      // (down: feet on the boards, the dust, nobody clapping)
      s.fall = T + 1;
      p.freefall = undefined; p.carried = false; p.spriteScaleX = undefined; p.spriteRot = undefined;
      p.facing = 1; p.pos.y = GY - p.height; p.isGrounded = true;
      playSound('crash', 0.8, -4); playSound('thud', 1, -8); playSound('land', 1, -4); shakeScreen(state, 14, 6);
      for (let k = 0; k < 26; k++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 60, y: GY - 6 }, vel: { x: (k % 2 ? 1 : -1) * (1 + Math.random() * 6), y: -1 - Math.random() * 3 }, life: 50, color: 'rgba(168, 162, 158, 0.85)', size: 5 + Math.random() * 6 });
    }
    return hands();
  }
  if (s.emptyLine || (cx > ARENA_L + 40 && cx < ARENA_R && p.isGrounded && p.health > 0)) {
    s.emptyLine ??= pickLine(byPants(state, MH_STAGE_EMPTY));
    leaveEmptyArena(state, s.emptyLine);
    return hands();
  }
  return controls;
};

export const stunt: HollywoodSection = {
  id: 'stunt', x0, x1,
  // (the boss's checkpoint: OUTSIDE the stage (the user's standing rule: dead in a boss fight, he's back outside its
  // door and walks in himself), at the havoc's end where the tornado caught him, the SAFE TORNADO LAUNCHING ZONE's big
  // health and ammo just behind him; the tornado's spent from here on (havoc/hazards.ts spent: checkpoint 60). In
  // through the way on (endExits) onto the stage and it's on again (a retry's entrance beat). It's set the moment he's
  // in this section (his middle's past it), the fling's landing included)
  checkpoints: [{ name: 'THE STUNT STAGE', cp: 60, x: DOORS.havoc.end.x, y: GY, clear: [400, 3000] }],
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
    // (a revisit, Steve's dead: the tornado still flings him in, onto his empty stage (SHOW CANCELED), no fight; down, his
    // line, then the hub)
    if (s.fight === 'wait' && bossGone('hollywood')) return emptyStage(state, s, controls);
    if (s.fight === 'wait') {
      // (no way back to the havoc: the tornado's fling put him here, one-way (the user's rule); a retry from the
      // checkpoint outside walks in through the havoc's way on; the land's end: no way on either)
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
      markBossFight(state, 'stuntman-steve', { l: ARENA_L, r: ARENA_R });
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
    drawStage(c, state, { cleared: isLandCleared('hollywood') && !f, hype: sc.hype, replay: sc.replay, hurtFlash: sc.hurtFlash, doorsLit: !!f, bays: f ? bayLooks(f) : undefined });
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
  // (killed with him a way off the screen: the camera takes him in till it's caught up with him (deathFrame.ts))
  zoom: (state) => { const f = stuntOf(state).f; return f ? frameDeath(state, f, killCamZoom(state, f), deathNeed(f), STAGE_ROOM) : null; },
  holdTick: (ctx) => { const f = stuntOf(ctx.state).f; return f ? killCamTick(f) : false; },
  outdoors: () => 1,
};
