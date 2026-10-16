// HELICOPTER HARRY: the land's boss (the user's design: foreign-spec.md "The land boss"). Harry's rocket brought the
// helicopter down in the AMERICA pavilion's construction site (arena.ts): he comes to by the burning wreck
// (DOORS.harry.start, checkpoint 120), the big health and ammo a few steps on, then through the scaffold towers' gate
// onto the slab, and it's on: the gate slams shut, Harry comes down on his jetpack, rips the hippie off, and calls the
// STATUE OF LIBERTY up out of the dig (fight.ts: the intro, the fight, his two deaths, hers; rambo.ts and liberty.ts:
// the two of them drawn in full; scene.ts: the rest). A retry from the checkpoint goes straight to the fight (her up,
// him waiting). Beaten: VICTORY, the walk-away (walkAway/helicopterHarry.ts), the hub, Foreign Lands cleared (his toy:
// the SOUVENIR launcher). Revisits: once the land's cleared, the slab stands empty (her rubble, the gun and the torch
// lying, a chalk outline, his tie-dye in shreds), the gate open.
//
// The way back: the left end (to the helipad's end, DOORS.heli.end). No way on (the end of the land).

import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import type { ForeignSection } from '../section';
import { layOwn, endWalls, endExits, runExits, foreignState, hands } from '../section';
import { DOORS, GY } from '../geometry';
import { topBand } from '../../../m1/constants';
import { goTo, markLandCleared, noteBossKill, isLandCleared, keptForRevisits } from '../../store';
import { type Victory, startVictory, tickVictory, drawVictory, victoryDone } from '../../victory';
import { type WalkAway, playWalkAway, tickWalkAway, drawWalkAway } from '../../walkAway';
import { x0, x1, VIEW_X, ARENA_L, ARENA_R, CAM_ROW, REFILL_X, sy } from './arena';
import { drawSky, drawScene } from './scene';
import { torchFlame } from './liberty';
import {
  type Fight, startFight, updateFight, fightOver, endFight, resetFight, drawStatue, drawFightBack, drawFightFront, drawFightHud,
  drawWaiting, introSeen, killCamTick, killCamZoom, killedByWeakness, drawLeftovers, MEMO_CRUMBLED, MEMO_DEATH,
} from './fight';

/** A revisit: what's left, as the winning run left it. */
const leftovers = (state: GameState) => {
  const how = keptForRevisits(MEMO_DEATH) || 'spin';
  return { crumbled: keptForRevisits(MEMO_CRUMBLED) === '1', him: how === 'spin' ? null : (g: CanvasRenderingContext2D) => drawLeftovers(g, how, state.frame), outline: how !== 'buried' };
};

interface Harry {
  fight: 'wait' | 'on' | 'won'; wonAt: number;
  f: Fight | null; walls: Block[];
  victory: Victory | null; walk: WalkAway | null;
}
const harryOf = (state: GameState) => foreignState<Harry>(state, 'harry', () => ({ fight: 'wait', wonAt: 0, f: null, walls: [], victory: null, walk: null }));

const leave = (state: GameState, weakness: boolean) => {
  const s = harryOf(state);
  markLandCleared('foreign'); noteBossKill();
  s.walk = playWalkAway(state, { boss: 'helicopter-harry', weakness, onDone: () => goTo('hub') });
};

export const harry: ForeignSection = {
  id: 'harry', x0, x1,
  checkpoints: [{ name: 'HELICOPTER HARRY', cp: 120, x: DOORS.harry.start.x, y: GY, clear: [300, 3000] }],
  build: (state) => {
    resetFight();
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'hard' }]);
    endWalls(state, 'harry');
    // (the right-hand scaffold tower: always there; nothing past it but the dig)
    state.blocks.push({ x: ARENA_R, y: -6000, w: 40, h: 6000 + GY, type: 'wall', hidden: true, tag: 'harry-end' } as Block);
    // (the big health and ammo, on the way in: before it starts, and on every retry)
    state.pickups.push({ id: 'hh-health', pos: { x: REFILL_X - 30, y: GY - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 });
    state.pickups.push({ id: 'hh-ammo', pos: { x: REFILL_X + 10, y: GY - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, s = harryOf(state);
    if (s.fight === 'wait') {
      runExits(state, endExits('harry'));
      // (through the gate onto the slab, not cleared: it's on; the gate shut behind him)
      const cx = p.pos.x + p.width / 2;
      if (!isLandCleared('foreign') && cx > ARENA_L + 60 && cx < ARENA_R) {
        s.fight = 'on';
        s.f = startFight(state);
        s.walls = [
          { x: ARENA_L - 40, y: -6000, w: 40, h: 6000 + GY, type: 'wall', hidden: true, tag: 'harry-gate' } as Block,
          { x: ARENA_L - 40, y: sy(-80) - 40, w: ARENA_R - ARENA_L + 80, h: 40, type: 'wall', hidden: true, tag: 'harry-top' } as Block,
        ];
        state.blocks.push(...s.walls);
      }
      return controls;
    }
    if (s.fight === 'on' && s.f) {
      const f = s.f;
      const out = updateFight(ctx, f, controls);
      // (held in: never out of the arena, whatever sends him flying)
      const lo = ARENA_L, hi = ARENA_R - p.width;
      if (p.pos.x < lo) { p.pos.x = lo; if (p.vel.x < 0) p.vel.x = 0; }
      if (p.pos.x > hi) { p.pos.x = hi; if (p.vel.x > 0) p.vel.x = 0; }
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
  cameraX: (state) => (harryOf(state).fight === 'wait' ? { min: x0, max: VIEW_X } : { min: VIEW_X, max: VIEW_X }),
  cameraRow: () => CAM_ROW,
  drawBackdrop: (c, state) => drawSky(c, state),
  drawBack: (c, state) => {
    const s = harryOf(state), f = s.f, cleared = isLandCleared('foreign');
    // (a retry, before he's on the slab: her up already, him waiting)
    const waiting = !f && !cleared && introSeen() ? drawWaiting(c, state) : null;
    drawScene(c, state, {
      shut: s.fight === 'on',
      aftermath: cleared && !f ? leftovers(state) : null,
      between: f ? (g) => drawStatue(g, state, f) : waiting ? waiting.statue : undefined,
    });
    if (f) drawFightBack(c, state, f);
    else if (waiting) waiting.front(c);
  },
  drawFront: (c, state) => {
    const s = harryOf(state);
    if (s.f && s.fight !== 'wait') drawFightFront(c, state, s.f);
  },
  drawHud: (c, state) => {
    const s = harryOf(state);
    if (s.f && s.fight === 'on') drawFightHud(c, s.f, topBand(), !!state.player.inCutscene);
    if (s.victory) drawVictory(c, s.victory);
    if (s.walk) drawWalkAway(c, s.walk);
  },
  zoom: (state) => { const f = harryOf(state).f; return f ? killCamZoom(state, f) : null; },
  holdTick: (ctx) => { const f = harryOf(ctx.state).f; return f ? killCamTick(f) : false; },
  outdoors: () => 1,
  // (her torch's gold flame glows, wherever it is: held up, or planted in the floor)
  lamps: (state) => (torchFlame && Math.abs(state.frame - torchFlame.f) <= 2 ? [{ x: torchFlame.x, y: torchFlame.y, r: 180, a: 0.75, color: '#FDE68A' }] : []),
};
