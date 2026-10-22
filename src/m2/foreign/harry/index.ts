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
// No way back: the crash is one-way (the left end's a wall, the wreck burning by it). No way on (the end of the land).

import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import type { ForeignSection } from '../section';
import { layOwn, endWalls, foreignState, hands } from '../section';
import { DOORS, GY } from '../geometry';
import { topBand } from '../../../m1/constants';
import { goTo, markLandCleared, markBossDeath, noteBossKill, isLandCleared, keptForRevisits } from '../../store';
import { type Victory, startVictory, tickVictory, drawVictory, victoryDone } from '../../victory';
import { type WalkAway, playWalkAway, tickWalkAway, drawWalkAway } from '../../walkAway';
import { x0, x1, VIEW_X, ARENA_L, ARENA_R, CAM_ROW, REFILL_X, WALL_W, WRECK_X, sy } from './arena';
import { KICK_POSE_FRAMES } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { markBossFight } from '../../bossQuiet';
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
  /** The gate in the left tower's doorway: shut (a wall) till he walks up to it and kicks it in; then down for good. */
  gate: 'up' | 'kick' | 'down'; gateT: number; gateBlock: Block | null;
  f: Fight | null; walls: Block[];
  victory: Victory | null; walk: WalkAway | null;
}
const harryOf = (state: GameState) => foreignState<Harry>(state, 'harry', () => ({ fight: 'wait', wonAt: 0, f: null, walls: [], victory: null, walk: null, gate: 'up', gateT: 0, gateBlock: null }));
/** The kick: when his boot lands (the gate starts over), and when it's down flat. */
const KICK_HIT = 10, KICK_DONE = 34;
/** The gate's been kicked in this run (state.stageMemo: kept across his deaths, the checkpoint world state): back at
 *  the checkpoint it's lying down flat, and he walks back in through it. */
const GATE_MEMO = 'foreign-harry-gate';

const leave = (state: GameState, weakness: boolean) => {
  const s = harryOf(state);
  markBossDeath('foreign', weakness); markLandCleared('foreign'); noteBossKill();
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
    // (the gate: shut in its doorway, a wall, till he kicks it in; kicked in already this run (back at the checkpoint
    // after dying), or the land done, it's down)
    const s = harryOf(state);
    s.gate = isLandCleared('foreign') || state.stageMemo[GATE_MEMO] === '1' ? 'down' : 'up'; s.gateT = 0;
    s.gateBlock = s.gate === 'up' ? { x: ARENA_L - WALL_W, y: GY - 150, w: WALL_W, h: 150, type: 'wall', hidden: true, tag: 'harry-gatepanel' } as Block : null;
    if (s.gateBlock) state.blocks.push(s.gateBlock);
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, s = harryOf(state);
    if (s.fight === 'wait') {
      // (no way back to the helipad: Harry's rocket and the crash put him here, one-way (the user's rule); the land's
      // end: no way on either)
      // The gate: walk up to it, and he kicks it in (a beat: it goes over flat onto the slab)
      if (s.gate === 'up' && p.health > 0 && !p.inCutscene && p.isGrounded && p.pos.x + p.width >= ARENA_L - WALL_W - 4) {
        s.gate = 'kick'; s.gateT = 0; p.facing = 1; p.vel.x = 0; p.kickPose = KICK_POSE_FRAMES; playSound('whoosh', 0.7, -4);
      }
      if (s.gate === 'kick') {
        s.gateT++; p.vel.x = 0;
        // (the kick's pose runs out on its own here: nothing else counts it down in Meathead 2)
        if ((p.kickPose ?? 0) > 0) p.kickPose!--;
        if (s.gateT === KICK_HIT) {
          state.stageMemo[GATE_MEMO] = '1';
          if (s.gateBlock) { state.blocks = state.blocks.filter(b => b !== s.gateBlock); s.gateBlock = null; }
          playSound('clang', 1, -6); playSound('crash', 0.8, -2); shakeScreen(state, 10, 5);
          for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: ARENA_L, y: GY - 20 - Math.random() * 100 }, vel: { x: 1 + Math.random() * 4, y: -1 - Math.random() * 3 }, life: 24, color: i % 2 ? '#A8A29E' : '#71717A', size: 2 + Math.random() * 3, grav: 0.3 });
        }
        if (s.gateT >= KICK_DONE) { s.gate = 'down'; p.kickPose = 0; playSound('thud', 0.8, -6); shakeScreen(state, 6, 3); }
        return hands();
      }
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
      markBossFight(state, 'helicopter-harry');
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
    const waiting = !f && !cleared && introSeen(state) ? drawWaiting(c, state) : null;
    drawScene(c, state, {
      gate: s.gate === 'up' ? { kind: 'standing' } : s.gate === 'kick' ? (s.gateT < KICK_HIT ? { kind: 'standing' } : { kind: 'falling', k: Math.min(1, (s.gateT - KICK_HIT) / (KICK_DONE - KICK_HIT)) }) : { kind: 'down' },
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
  // (her torch's flame, and the helicopter's wreck burning in its crater: they glow after dark)
  lamps: (state) => [
    ...(torchFlame && Math.abs(state.frame - torchFlame.f) <= 2 ? [{ x: torchFlame.x, y: torchFlame.y, r: 180, a: 0.75, color: '#FDE68A' }] : []),
    { x: WRECK_X, y: GY - 40, r: 200 + Math.sin(state.frame * 0.3) * 10, a: 0.7, color: '#FB923C' },
  ],
};
