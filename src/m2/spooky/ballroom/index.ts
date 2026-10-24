// THE BALLROOM: section 8 of Spooky Land, the boss. A tacky ballroom (the theme park's idea of a vampire's: plastic
// chandeliers, a disco ball, fog machines, folding chairs, a buffet), Donnie Dracula's arena: the fat balding guy from
// the control room in his cheap wig, cape (DONNIE on its name tag) and plastic fangs, cowering in the far corner. Then
// Satan gives him real power, and it's on (fight.ts: the intro, the fight, his two deaths). Dracula, legally: only Bram
// Stoker's novel and generic vampire tropes; never the film looks. Donnie: spooky/donnie.ts.
//
// Through the foyer (the coat check, the buffet, stacks of folding chairs) onto the dance floor: the velvet rope's gate
// goes up behind him, and the view's fixed on the floor. Beaten: VICTORY, the walk-away (walkAway/donnie.ts), the hub.
// Revisits: once the land's cleared, the floor's empty: the circle's scorch in it, the chairs over; and as he died:
// burnt up, the disco ball down; the usual way, him still wedged up in the ceiling, legs hanging, the floor under him
// brown (the ball still up: he only clipped it).
//
// The way back: the left end (into the gift shop). No way on (the end of the land).

import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import type { SpookySection } from '../section';
import { layOwn, endWalls, endExits, runExits, box, ledge, solid, spookyState } from '../section';
import { drawBallroomArt, drawBallroomFront, ballroomLighting } from './art';
import { GY } from '../geometry';
import { CANVAS_WIDTH, CANVAS_HEIGHT, topBand } from '../../../m1/constants';
import { drawSkipPrompt, SKIP_AFTER } from '../../../m1/game/platform/skip';
import { goTo, markLandCleared, markBossDeath, noteBossKill, isLandCleared, bossDeath, keptForRevisits } from '../../store';
import { type Victory, startVictory, tickVictory, drawVictory, victoryDone } from '../../victory';
import { type WalkAway, playWalkAway, tickWalkAway, drawWalkAway } from '../../walkAway';
import { markBossFight } from '../../bossQuiet';
import { hands } from '../section';
import { drawBars } from '../control/cine';
import { x0, x1, ARENA_L, ARENA_R, ARENA_MID, TRIGGER_X, CHANDELIERS, RISER } from './arena';
import { type Fight, startFight, updateFight, fightOver, endFight, resetFight, drawFightBack, drawFightFront, drawFightHud, killCamTick, killCamZoom, drawKillCam, killedByWeakness, introOn, introSkipT, deathLights, drawIntroCloseup,
  deathNeed, drawDeathBars, ballSwing, drawStuckLeftovers, MEMO_STUCK } from './fight';
import { frameDeath } from '../../deathFrame';
import { CEIL } from '../control/paint';
import { setStampHold } from '../../../m1/game/render/stamp';

/** The built room: as far as a camera taking his death in (floor to ceiling) may go. */
const ROOM = { x0: ARENA_L - 140, y0: CEIL - 140, x1: ARENA_R + 140, y1: GY + 100 };

type Ctx = CanvasRenderingContext2D;

interface Ballroom {
  fight: 'wait' | 'on' | 'won'; wonAt: number;
  f: Fight | null; gate: Block | null;
  victory: Victory | null; walk: WalkAway | null;
}
const ballOf = (state: GameState) => spookyState<Ballroom>(state, 'ballroom', () => ({ fight: 'wait', wonAt: 0, f: null, gate: null, victory: null, walk: null }));

/** Done: him walking away from it all, then the hub (Spooky Land's cleared: the day moves on). */
const leave = (state: GameState, weakness: boolean) => {
  const b = ballOf(state);
  markBossDeath('spooky', weakness);
  markLandCleared('spooky');
  noteBossKill();
  b.walk = playWalkAway(state, { boss: 'donnie-dracula', weakness, onDone: () => goTo('hub') });
};

export const ballroom: SpookySection = {
  id: 'ballroom', x0, x1,
  // (none of its own: the boss's checkpoint is just outside the doors, in the gift shop: control/index.ts)
  checkpoints: [],
  build: (state) => {
    resetFight();
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'parquet' }]);
    endWalls(state, 'ballroom');
    // (the stage's wall: the end of the floor)
    state.blocks.push({ x: ARENA_R, y: -4000, w: 40, h: 4000 + GY, type: 'wall', hidden: true, tag: 'ballroom-stage' } as Block);
    // (the ceiling, under its cornice: nobody off a chandelier up through it)
    solid(state, x0 - 40, CEIL - 60, ARENA_R - x0 + 40, 60, { hidden: true, tag: 'ballroom-ceiling' });
    // The arena's high ground: the two chandeliers (stood on: up level with him in the air, for a shot at him, or out of
    // the way of the blood), the bandstand's riser in the corner
    for (const ch of CHANDELIERS) ledge(state, ch.x, GY - ch.h, ch.w, { hidden: true, tag: 'ballroom-chandelier' });
    ledge(state, RISER.x, GY - RISER.h, RISER.w, { hidden: true, tag: 'ballroom-riser' });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, b = ballOf(state);
    if (b.fight === 'wait') {
      runExits(state, endExits('ballroom'));
      if (!isLandCleared('spooky') && p.pos.x + p.width / 2 > TRIGGER_X && p.isGrounded) {
        b.fight = 'on';
        b.f = startFight(state);
        b.gate = { x: ARENA_L - 30, y: -4000, w: 30, h: 4000 + GY, type: 'wall', hidden: true, tag: 'ballroom-gate' } as Block;
        state.blocks.push(b.gate);
      }
      return controls;
    }
    if (b.fight === 'on' && b.f) {
      const f = b.f;
      markBossFight(state, 'donnie-dracula');
      let out = updateFight(ctx, f, controls);
      if (f.cam) { p.inCutscene = true; out = hands(); }
      // (locked in)
      const lo = ARENA_L, hi = ARENA_R - p.width;
      if (p.pos.x < lo) { p.pos.x = lo; if (p.vel.x < 0) p.vel.x = 0; }
      if (p.pos.x > hi) { p.pos.x = hi; if (p.vel.x > 0) p.vel.x = 0; }
      if (fightOver(f)) {
        b.fight = 'won'; b.wonAt = state.frame;
        endFight(state, f);
        if (b.gate) { state.blocks = state.blocks.filter(x => x !== b.gate); b.gate = null; }
        b.victory = startVictory();
      }
      return out;
    }
    if (b.fight === 'won') {
      p.inCutscene = true;
      if (b.victory) { tickVictory(state, b.victory); if (victoryDone(b.victory) && state.frame - b.wonAt > 60) { b.victory = null; leave(state, !!b.f && killedByWeakness(b.f)); } }
      if (b.walk) tickWalkAway(b.walk, controls);
      return hands();
    }
    return controls;
  },
  cameraX: (state) => (ballOf(state).fight !== 'wait' ? { min: ARENA_L, max: ARENA_L } : { min: x0, max: ARENA_R - CANVAS_WIDTH }),
  drawBackdrop: (c) => { box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#0A0310'); return true; },
  lighting: (state) => { const f = ballOf(state).f, s = ballroomLighting(state, f?.circle ?? 0); if (f) s.lights.push(...deathLights(f, state.frame)); return s; },
  drawBack: (c, state) => {
    drawBallroom(c, state);
    const b = ballOf(state);
    if (b.f) drawFightBack(c, state, b.f);
  },
  drawFront: (c, state) => { drawBallroomFront(c, state); const b = ballOf(state); if (b.f && b.fight !== 'wait') drawFightFront(c, state, b.f); },
  drawHud: (c, state) => {
    const b = ballOf(state);
    if (b.f) drawIntroCloseup(c, b.f, state.frame);
    if (b.f && introOn(b.f)) { drawBars(c, Math.min(1, introSkipT(b.f) / 20)); if (introSkipT(b.f) > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH); }
    if (b.fight === 'on' && b.f) drawFightHud(c, b.f, topBand(), !!state.player.inCutscene);
    if (b.f) { drawKillCam(c, b.f); drawDeathBars(c, b.f); }
    if (b.victory) drawVictory(c, b.victory);
    if (b.walk) drawWalkAway(c, b.walk);
  },
  zoom: (state) => {
    const f = ballOf(state).f, z = f ? frameDeath(state, f, killCamZoom(state, f), deathNeed(f), ROOM) : null;
    // (pushed in on his death: the room's big stamps (the wall's bays, the stage) scaled, not painted again screens big)
    setStampHold(!!z && z.scale > 1.05);
    return z;
  },
  holdTick: (ctx) => { const f = ballOf(ctx.state).f; return f ? killCamTick(f) : false; },
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (art.ts): the room as the fight's left it

const drawBallroom = (c: Ctx, state: GameState) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  if (v.x > x1 + 200 || v.x + v.w < x0 - 200) return;
  const b = ballOf(state), cleared = isLandCleared('spooky');
  // (the disco ball: down on the floor once it's all over (burnt up); the usual way, still up, swinging if he clipped it)
  const usual = cleared && bossDeath('spooky') !== 'weakness';
  drawBallroomArt(c, state, { cleared, ballDown: cleared && !usual, swing: b.f ? ballSwing(b.f) : 0 });
  // (a revisit after the usual death: him, still up there)
  if (usual && !(b.f && b.fight !== 'wait')) drawStuckLeftovers(c, Number(keptForRevisits(MEMO_STUCK) ?? ARENA_MID + 62), state.frame);
};
