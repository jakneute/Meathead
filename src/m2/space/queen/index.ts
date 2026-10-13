// THE QUEEN: section 8 of Space Land, the boss (owner: the haunted-house agent). XENOSCARE's hold: the showpiece, THE
// QUEEN (LEGALLY DISTINCT, the signs insist: a cheap knockoff animatronic of a certain movie monster's queen) behind
// her glass. Meathead kicks the glass in; the real aliens up in the ride's control booth take her over with their
// mind-control rig, and she's a real threat: the land's boss (fight.ts: the cutscene and a PLACEHOLDER fight; her art,
// every pose, in art.ts).
//
// The antechamber first: the big health and ammo, the boss's checkpoint. Into the room, the way back shuts behind him
// and the view's held on it. Beaten: VICTORY, the walk-away (walkAway/spaceQueen.ts), the hub; Space Land's cleared.
// Revisits: once the land's cleared, she's slumped dead on her stand, the glass in, the booth's window green.
//
// The way back: the left end (into the haunted spaceship). No way on (the end of the land).

import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import type { SpaceSection } from '../section';
import { layOwn, endWalls, endExits, runExits, spaceState, hands, box } from '../section';
import { GY } from '../geometry';
import { CANVAS_WIDTH, CANVAS_HEIGHT, topBand } from '../../../m1/constants';
import { drawSkipPrompt, SKIP_AFTER } from '../../../m1/game/platform/skip';
import { goTo, markLandCleared, noteBossKill, isLandCleared } from '../../store';
import { type Victory, startVictory, tickVictory, drawVictory, victoryDone } from '../../victory';
import { type WalkAway, playWalkAway, tickWalkAway, drawWalkAway } from '../../walkAway';
import { drawBars } from '../../spooky/control/cine';
import { x0, x1, ARENA_L, ARENA_R, TRIGGER_X, REFILL_X, QUEEN_X, GLASS_X } from './geo';
import { drawRoomBack, drawGlass, drawQueen, roomLights, queenHead } from './art';
import { type Fight, makeFight, startFight, updateFight, fightOver, endFight, introOn, drawQueenFight, drawQueenSaid, drawFightHud } from './fight';

interface Queen {
  fight: 'wait' | 'on' | 'won'; wonAt: number;
  f: Fight | null; gate: Block | null; glassBlock: Block | null;
  victory: Victory | null; walk: WalkAway | null;
}
const queenOf = (state: GameState) => spaceState<Queen>(state, 'queen', () => ({ fight: 'wait', wonAt: 0, f: null, gate: null, glassBlock: null, victory: null, walk: null }));
const fightOf = (state: GameState) => { const q = queenOf(state); return (q.f ??= makeFight(state)); };

export const queen: SpaceSection = {
  id: 'queen', x0, x1,
  checkpoints: [
    // (the antechamber, the refill beside him: back here for another go, nobody's about)
    { name: 'THE QUEEN', cp: 70, x: x0 + 300, y: GY, clear: [400, 1700] },
  ],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'metal' }]);
    endWalls(state, 'queen');
    // (the room's far wall)
    state.blocks.push({ x: ARENA_R, y: -4000, w: 40, h: 4000 + GY, type: 'wall', hidden: true, tag: 'queen-far' } as Block);
    // (her glass: a wall till it's kicked in)
    const q = queenOf(state);
    if (!isLandCleared('space') && fightOf(state).glass) { q.glassBlock = { x: GLASS_X - 8, y: -4000, w: 16, h: 4000 + GY, type: 'wall', hidden: true, tag: 'queen-glass' } as Block; state.blocks.push(q.glassBlock); }
    // Before her door: the big health and the big ammo
    state.pickups.push(
      { id: 'queen-health', pos: { x: REFILL_X - 30, y: GY - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 },
      { id: 'queen-ammo', pos: { x: REFILL_X + 10, y: GY - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 },
    );
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, q = queenOf(state), f = fightOf(state);
    if (q.glassBlock && !f.glass) { state.blocks = state.blocks.filter(b => b !== q.glassBlock); q.glassBlock = null; }
    if (q.fight === 'wait') {
      runExits(state, endExits('queen'));
      if (!isLandCleared('space') && p.pos.x + p.width / 2 > TRIGGER_X && p.isGrounded && p.health > 0) {
        q.fight = 'on';
        q.gate = { x: ARENA_L - 30, y: -4000, w: 30, h: 4000 + GY, type: 'wall', hidden: true, tag: 'queen-gate' } as Block;
        state.blocks.push(q.gate);
        startFight(state, f);
      }
      return controls;
    }
    if (q.fight === 'on') {
      let out = updateFight(ctx, f, controls);
      if (introOn(f)) p.inCutscene = true;
      const lo = ARENA_L, hi = ARENA_R - p.width;
      if (p.pos.x < lo) { p.pos.x = lo; if (p.vel.x < 0) p.vel.x = 0; }
      if (p.pos.x > hi) { p.pos.x = hi; if (p.vel.x > 0) p.vel.x = 0; }
      if (fightOver(f)) {
        q.fight = 'won'; q.wonAt = state.frame;
        endFight(state, f);
        if (q.gate) { state.blocks = state.blocks.filter(b => b !== q.gate); q.gate = null; }
        q.victory = startVictory();
        out = hands();
      }
      return out;
    }
    p.inCutscene = true;
    if (q.victory) {
      tickVictory(state, q.victory);
      if (victoryDone(q.victory) && state.frame - q.wonAt > 60) {
        q.victory = null;
        markLandCleared('space'); noteBossKill();
        q.walk = playWalkAway(state, { boss: 'space-queen', weakness: f.byWeakness, onDone: () => goTo('hub') });
      }
    }
    if (q.walk) tickWalkAway(q.walk, controls);
    return hands();
  },
  cameraX: (state) => (queenOf(state).fight !== 'wait' ? { min: ARENA_L, max: ARENA_L } : { min: x0, max: ARENA_R - CANVAS_WIDTH }),
  drawBackdrop: (c) => { box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#07040E'); return true; },
  lighting: (state) => {
    const f = fightOf(state), cleared = isLandCleared('space');
    const head = queenHead(QUEEN_X, -1, -f.ext);
    return { dark: 0.5, shade: [14, 6, 30], rim: 0.5, lights: [
      ...roomLights({ glass: f.glass, booth: cleared ? 1 : f.booth, splat: false, operators: false, beam: f.beam, head }, QUEEN_X),
      { x: REFILL_X, y: GY - 120, r: 160, a: 0.6 }, { x: x0 + 260, y: GY - 300, r: 260, a: 0.5 },
      { x: state.player.pos.x + 20, y: state.player.pos.y + 30, r: 130, a: 0.4 },
    ] };
  },
  drawBack: (c, state) => {
    const f = fightOf(state), cleared = isLandCleared('space');
    drawRoomBack(c, state, { glass: f.glass && !cleared, booth: cleared ? 1 : f.booth, splat: cleared || !f.operators, operators: !cleared && f.operators, beam: f.beam, head: queenHead(QUEEN_X, -1, -f.ext) });
    if (cleared && queenOf(state).fight === 'wait') drawQueen(c, QUEEN_X, -1, { pose: 'dead', t: state.frame, ext: 0, alive: 0, beat: 1 });
    else drawQueenFight(c, state, f);
  },
  drawFront: (c, state) => {
    const f = fightOf(state);
    drawGlass(c, state, f.glass && !isLandCleared('space'));
    drawQueenSaid(c, f);
  },
  drawHud: (c, state) => {
    const q = queenOf(state), f = fightOf(state);
    if (introOn(f)) { drawBars(c, Math.min(1, f.skipT / 20)); if (f.skipT > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH); }
    if (q.fight === 'on') drawFightHud(c, f, topBand(), !!state.player.inCutscene);
    if (q.victory) drawVictory(c, q.victory);
    if (q.walk) drawWalkAway(c, q.walk);
  },
};
