// THE BALLROOM: section 8 of Spooky Land, the boss. A tacky ballroom (the theme park's idea of a vampire's: plastic
// chandeliers, a disco ball, fog machines, folding chairs, a buffet), Donnie Dracula's arena: the fat balding guy from
// the control room in his cheap wig, cape (DONNIE on its name tag) and plastic fangs, cowering in the far corner. Then
// Satan gives him real power, and it's on (fight.ts: the intro, the fight, his two deaths). Dracula, legally: only Bram
// Stoker's novel and generic vampire tropes; never the film looks. Donnie: cast/donnie.ts.
//
// Through the foyer (the coat check, the buffet, stacks of folding chairs) onto the dance floor: the velvet rope's gate
// goes up behind him, and the view's fixed on the floor. Beaten: VICTORY, the walk-away (walkAway/donnie.ts), the hub.
// Revisits: once the land's cleared, the floor's empty: the circle's scorch in it, the disco ball down, the chairs over.
//
// The way back: the left end (into the gift shop). No way on (the end of the land).

import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import type { SpookySection } from '../section';
import { layOwn, endWalls, endExits, runExits, wallSign, groundBox, box, spookyState } from '../section';
import { GY } from '../geometry';
import { CANVAS_WIDTH, CANVAS_HEIGHT, topBand } from '../../../m1/constants';
import { drawSkipPrompt, SKIP_AFTER } from '../../../m1/game/platform/skip';
import { goTo, markLandCleared, noteBossKill, isLandCleared } from '../../store';
import { type Victory, startVictory, tickVictory, drawVictory, victoryDone } from '../../victory';
import { type WalkAway, playWalkAway, tickWalkAway, drawWalkAway } from '../../walkAway';
import { hands } from '../section';
import { drawBars } from '../control/cine';
import { x0, x1, ARENA_L, ARENA_R, ARENA_MID, CIRCLE_X, TRIGGER_X } from './arena';
import { type Fight, startFight, updateFight, fightOver, endFight, resetFight, drawFightBack, drawFightFront, drawFightHud, killCamTick, killCamZoom, drawKillCam, killedByWeakness, introOn, introSkipT } from './fight';

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
  markLandCleared('spooky');
  noteBossKill();
  b.walk = playWalkAway(state, { boss: 'donnie-dracula', weakness, onDone: () => goTo('hub') });
};

export const ballroom: SpookySection = {
  id: 'ballroom', x0, x1,
  checkpoints: [
    { name: 'THE BALLROOM DOOR', cp: 70, x: x0 + 200, y: GY },
    // (past the foyer: back here, nothing's about, and it's the intro again)
    { name: 'DONNIE DRACULA', cp: 71, x: ARENA_L - 120, y: GY, clear: [900, 1200] },
  ],
  build: (state) => {
    resetFight();
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'parquet' }]);
    endWalls(state, 'ballroom');
    // (the stage's wall: the end of the floor)
    state.blocks.push({ x: ARENA_R, y: -4000, w: 40, h: 4000 + GY, type: 'wall', hidden: true, tag: 'ballroom-stage' } as Block);
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
  drawBackdrop: (c) => { box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#12061F'); return true; },
  drawBack: (c, state) => {
    drawBallroom(c, state);
    const b = ballOf(state);
    if (b.f) drawFightBack(c, state, b.f);
  },
  drawFront: (c, state) => { const b = ballOf(state); if (b.f && b.fight !== 'wait') drawFightFront(c, state, b.f); },
  drawHud: (c, state) => {
    const b = ballOf(state);
    if (b.f && introOn(b.f)) { drawBars(c, Math.min(1, introSkipT(b.f) / 20)); if (introSkipT(b.f) > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH); }
    if (b.fight === 'on' && b.f) drawFightHud(c, b.f, topBand(), !!state.player.inCutscene);
    if (b.f) drawKillCam(c, b.f);
    if (b.victory) drawVictory(c, b.victory);
    if (b.walk) drawWalkAway(c, b.walk);
  },
  zoom: (state) => { const f = ballOf(state).f; return f ? killCamZoom(state, f) : null; },
  holdTick: (ctx) => { const f = ballOf(ctx.state).f; return f ? killCamTick(f) : false; },
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (crude: the first pass)

const drawBallroom = (c: Ctx, state: GameState) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  if (v.x > x1 + 200 || v.x + v.w < x0 - 200) return;
  const f = state.frame, b = ballOf(state), cleared = isLandCleared('spooky');
  const vis = (a: number, z: number) => z > v.x - 100 && a < v.x + v.w + 100;
  // The walls: purple flock wallpaper, gold pilasters, a dado rail; the ceiling's edge
  box(c, x0 - 200, GY - 440, ARENA_R - x0 + 400, 440, '#3B0764');
  for (let x = x0; x < ARENA_R; x += 30) for (let y = GY - 420; y < GY - 90; y += 34) box(c, x + ((y / 34) % 2) * 15, y, 6, 10, '#4C1D95');
  for (let x = x0 + 150; x < ARENA_R; x += 300) box(c, x, GY - 440, 18, 440, '#A16207');
  box(c, x0 - 200, GY - 96, ARENA_R - x0 + 400, 6, '#A16207');
  box(c, x0 - 200, GY - 446, ARENA_R - x0 + 400, 10, '#1E0A33');
  // ---- The foyer: the coat check, the buffet, folding chairs stacked
  if (vis(x0, ARENA_L)) {
    box(c, x0 + 40 - 40, GY - 150, 80, 150, '#A16207'); box(c, x0 + 8, GY - 142, 64, 142, '#0B0B0D');
    wallSign(c, x0 + 40, GY - 172, 'GIFT SHOP', '#3B0764', '#FDE047');
    box(c, x0 + 170, GY - 110, 120, 110, '#57534E'); box(c, x0 + 170, GY - 114, 120, 4, '#D6D3D1');
    wallSign(c, x0 + 230, GY - 140, 'COAT CHECK', '#1C1917', '#FDE68A');
    // (the buffet: a long table, a white cloth, chafing dishes, the punch bowl, a sad ice sculpture of a bat)
    box(c, x0 + 360, GY - 60, 240, 60, '#F8FAFC'); box(c, x0 + 360, GY - 62, 240, 3, '#FFFFFF');
    for (let i = 0; i < 4; i++) { box(c, x0 + 372 + i * 44, GY - 74, 30, 12, '#A1A1AA'); box(c, x0 + 372 + i * 44, GY - 76, 30, 2, '#E4E4E7'); }
    c.fillStyle = '#BAE6FD'; c.beginPath(); c.ellipse(x0 + 560, GY - 70, 16, 8, 0, 0, Math.PI); c.fill();
    box(c, x0 + 550, GY - 86, 4, 16, '#E0F2FE'); box(c, x0 + 540, GY - 92, 24, 6, '#E0F2FE');
    wallSign(c, x0 + 480, GY - 150, 'ALL YOU CAN EAT $29.99', '#3B0764', '#FDE68A');
    for (let k = 0; k < 6; k++) box(c, x0 + 640 + (k % 2) * 4, GY - 20 - k * 12, 50, 10, '#71717A');
    // (the velvet rope's gate onto the floor: up once he's through)
    for (const px of [ARENA_L - 40, ARENA_L - 4]) { box(c, px, GY - 60, 8, 60, '#A16207'); box(c, px - 2, GY - 64, 12, 6, '#FDE047'); }
    if (b.gate) box(c, ARENA_L - 34, GY - 52, 32, 6, '#B91C1C'); else { box(c, ARENA_L - 34, GY - 40, 4, 34, '#B91C1C'); }
  }
  // ---- The dance floor: the lit checker, the stage, the DJ booth, fog machines, the chandeliers, the disco ball
  if (vis(ARENA_L - 100, ARENA_R + 100)) {
    // (the stage at the far end: a curtain, a banner)
    box(c, ARENA_R - 10, GY - 440, 60, 440, '#7F1D1D');
    for (let y = GY - 440; y < GY; y += 20) box(c, ARENA_R - 10, y, 60, 3, '#991B1B');
    wallSign(c, ARENA_MID, GY - 400, 'CONGRATULATIONS BRAD & TIFFANY', '#3B0764', '#F9A8D4');
    // (the guests' way in: the kitchen's swing doors on the right, the foyer's arch on the left)
    box(c, ARENA_R - 80, GY - 130, 60, 130, '#57534E'); box(c, ARENA_R - 76, GY - 124, 25, 124, '#27272A'); box(c, ARENA_R - 47, GY - 124, 25, 124, '#27272A');
    box(c, ARENA_R - 66, GY - 100, 6, 6, '#BAE6FD'); box(c, ARENA_R - 38, GY - 100, 6, 6, '#BAE6FD');
    wallSign(c, ARENA_R - 50, GY - 150, 'KITCHEN', '#1C1917', '#E5E7EB');
    // (fog machines in the corners, puffing)
    for (const fx of [ARENA_L + 20, ARENA_R - 110]) {
      box(c, fx, GY - 22, 40, 22, '#27272A'); box(c, fx + 4, GY - 18, 8, 4, '#EF4444');
      for (let i = 0; i < 4; i++) { const u = ((f + i * 40 + fx) % 160) / 160; c.fillStyle = `rgba(226, 232, 240, ${(0.25 * (1 - u)).toFixed(2)})`; c.beginPath(); c.ellipse(fx + 40 + u * 120, GY - 12 - u * 10, 20 + u * 40, 8 + u * 6, 0, 0, Math.PI * 2); c.fill(); }
    }
    // (folding chairs round the edge, one or two knocked over once it's done)
    for (let i = 0; i < 5; i++) { const cx = ARENA_L + 100 + i * 150; if (cleared && i % 2) { box(c, cx - 12, GY - 10, 26, 6, '#71717A'); continue; } box(c, cx - 8, GY - 50, 4, 50, '#71717A'); box(c, cx + 8, GY - 30, 4, 30, '#71717A'); box(c, cx - 8, GY - 30, 20, 4, '#A1A1AA'); }
    // (the plastic chandeliers)
    for (const cx of [ARENA_L + 180, ARENA_R - 180]) {
      box(c, cx - 1, GY - 440, 2, 50, '#A16207');
      box(c, cx - 36, GY - 392, 72, 8, '#FDE047'); box(c, cx - 26, GY - 384, 52, 8, '#FACC15');
      for (let i = 0; i < 6; i++) box(c, cx - 30 + i * 12, GY - 376, 3, 12 + (i % 2) * 6, '#FEF9C3');
    }
    // (the disco ball over the middle of the floor, glinting, spots going round the walls; down on the floor once it's
    // all over, or till the fight's death brings it down)
    const ballDown = cleared || (b.f?.mode === 'dead' && b.f.death?.how === 'flat' && (b.f.death.land ? b.f.death.t - b.f.death.land > 60 : false));
    if (!ballDown) {
      box(c, ARENA_MID - 1, GY - 440, 2, 60, '#71717A');
      c.fillStyle = '#1A0B06'; c.beginPath(); c.arc(ARENA_MID, GY - 366, 16, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#A1A1AA'; c.beginPath(); c.arc(ARENA_MID, GY - 366, 15, 0, Math.PI * 2); c.fill();
      for (let i = 0; i < 16; i++) box(c, ARENA_MID - 13 + (i % 4) * 7, GY - 379 + Math.floor(i / 4) * 7, 5, 5, (i + Math.floor(f / 5)) % 3 ? '#E4E4E7' : '#FFFFFF');
      for (let i = 0; i < 8; i++) { const a = f * 0.01 + i * 0.8; box(c, ARENA_MID + Math.cos(a) * 340, GY - 250 + Math.sin(a * 1.7) * 140, 4, 4, ['#F472B6', '#60A5FA', '#FDE047', '#FFFFFF'][i % 4]); }
    } else if (cleared) {
      c.fillStyle = '#A1A1AA'; c.beginPath(); c.arc(ARENA_MID - 160, GY - 14, 14, 0, Math.PI * 2); c.fill();
    }
  }
  // The floor: the parquet in the foyer, the lit checker on the dance floor (its tiles lit along the top: walked on)
  groundBox(c, x0 - 200, ARENA_L - 40, GY, '#78350F', '#F59E0B');
  for (let x = Math.max(ARENA_L - 40, Math.floor((v.x - 100) / 50) * 50); x < Math.min(ARENA_R + 200, v.x + v.w + 100); x += 50) {
    const k = Math.floor(x / 50), lit = (k + Math.floor(f / 30)) % 4 === 0;
    box(c, x, GY, 50, 400, k % 2 ? '#2E1065' : '#4C1D95');
    box(c, x, GY, 50, 4, lit ? '#F9A8D4' : '#C4B5FD');
  }
  // (once it's done: the scorch where the circle opened)
  if (cleared) { c.fillStyle = '#0A0505'; c.beginPath(); c.ellipse(CIRCLE_X, GY + 1, 110, 10, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#3B0A0A'; c.beginPath(); c.ellipse(CIRCLE_X, GY + 1, 80, 6, 0, 0, Math.PI * 2); c.fill(); }
};
