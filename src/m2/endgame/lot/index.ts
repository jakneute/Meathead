// The endgame's stage 1 (a stub for now: the owner fills it in): the lot just outside the water park, where Satan
// threw his truck. The owner's: "you go flying to a lot that is just outside the water park. this will begin 'stage 1'.
// the aliens and demons are now fighting over who gets to lay claim to you as you get ready to wreak havoc in the
// water park. i'll fill in the stage details later."
//
// He climbs out of the wreck (it's upside down: out of the cab's window on his belly; skipped the cutscene, he's
// already out, stood by it), says his piece; up in the sky the aliens and the demons go at each other over him,
// yelling it now and then. Right, along the lot, to the water park's gate: chained shut, for now (his line about it).
// No way back: the lot's fenced off to the left. Hour 10 from here on (endgame/stages.ts, timeOfDay.ts). Two
// checkpoints (endgame/stages.ts: the wreck, the gate), nothing about to hurt him at either (there's nobody here yet).
// Saved here, as he lands and at each checkpoint (the file's in the endgame: CONTINUE comes back to it).

import type { StageLayout } from '../../../m1/game/stages/index';
import type { GameState } from '../../../m1/game/core/state';
import { groundBlocks } from '../../../m1/game/core/terrain';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { GROUND_Y, CANVAS_WIDTH } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { say, MEATHEAD_VOICE, pickLine } from '../../../m1/game/platform/speech';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { arrived, isLeaving, carryGut, takeGut, setUi, takeStartCheckpoint, setEndgameAt, setWalkOut } from '../../store';
import { saveProgress } from '../../save';
import { stopWeapons } from '../../weapons';
import { todLight, setEndgameHour } from '../../timeOfDay';
import { createGrab, updateGrab, drawGrab, type Grab } from '../../moves/grab';
import { endgameStage } from '../stages';
import { takeAbductionSkipped } from '../abduction';
import { MH_LOT, MH_GATE, ALIEN_CLAIM, DEMON_CLAIM, ALIEN_VOICE, DEMON_VOICE, type Dressed } from '../lines';
import { LOT, drawLotBackdrop, drawLotBack, lotLights, flyerAt, FLYER_LIST } from './art';
import { setWalkwaysBack } from '../../intro/geometry';

const STAGE = endgameStage('lot')!;
/** Where each checkpoint is (endgame/stages.ts lists them: the wreck, the gate). */
const CP_AT: Record<number, number> = { 0: LOT.wreck + 150, 1: LOT.gate - 260 };

interface Lot {
  grab: Grab;
  /** The way out of the wreck (frames; -1 done). */
  climb: number;
  /** His line's been said (on landing); the gate's line, when. */
  said: boolean; gateAt: number;
  /** The sky's yelling: when next, what's up and over whom (screen space). */
  barkNext: number; bark: { text: string; i: number } | null;
  /** How hard the wreck's steaming (it dies down). */
  steam: number;
}
const getLot = (state: GameState) => state.stage as Lot | null;
const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

/** A line of his, over his head in play, only while it's said. */
const mhSays = (state: GameState, text: string) => {
  const shown = say(text, MEATHEAD_VOICE, 'casual', {
    always: true,
    onShow: () => { state.playerLastVulgarity = text; state.playerVulgarityTimer = 180; },
    onHide: () => { if (state.playerLastVulgarity === text) state.playerVulgarityTimer = 0; },
  });
  if (!shown) { state.playerLastVulgarity = text; state.playerVulgarityTimer = 150; }
};

/** Where he climbs out (the cab's window, the truck on its roof). */
const OUT_X = LOT.wreck - 60;

export const lotLayout: StageLayout = {
  left: LOT.x0 - 200,
  startX: CP_AT[0],
  verticalCamera: false,
  startsStanding: true,
  build: (state) => {
    // (fresh in from the abduction, or CONTINUE, or a respawn: whichever, the endgame's hour and its place on the file)
    const fresh = isLeaving();
    arrived(); stopWeapons();
    setWalkOut(false); setWalkwaysBack(false);
    setEndgameHour(STAGE.hour);
    { const g = takeGut(); if (g) state.player.gut = g; }
    const runs = [{ x1: LOT.x0 - 200, y1: GROUND_Y, x2: LOT.end + 200, y2: GROUND_Y, surface: 'concrete' }];
    state.groundRuns = runs;
    state.blocks.push(...groundBlocks(runs));
    state.blocks.push(
      { x: LOT.x0 - 60, y: -3000, w: 60, h: 3600, type: 'wall', hidden: true, tag: 'lot-l' },
      { x: LOT.gate - 120, y: -3000, w: 60, h: 3600, type: 'wall', hidden: true, tag: 'lot-gate' },
    );
    state.cameraMinX = LOT.x0 - 60;
    state.cameraMaxX = LOT.gate + 200 - CANVAS_WIDTH;
    { const pick = takeStartCheckpoint(); if (pick !== null) state.checkpoint = pick; }
    if (!STAGE.checkpoints.some(c => c.cp === state.checkpoint)) state.checkpoint = 0;
    // (just landed, the cutscene played out: he's in the wreck yet, and climbs out)
    const inWreck = fresh && state.checkpoint === 0 && !takeAbductionSkipped();
    const lot: Lot = { grab: createGrab(state), climb: inWreck ? 0 : -1, said: !inWreck && !fresh, gateAt: -1e9, barkNext: state.frame + 420, bark: null, steam: fresh ? 1 : 0.5 };
    state.stage = lot;
    const p = state.player, x = inWreck ? OUT_X : CP_AT[state.checkpoint];
    p.pos = { x: x - p.width / 2, y: GROUND_Y - p.height }; p.vel = { x: 0, y: 0 }; p.facing = 1;
    p.hidden = inWreck; p.inCutscene = inWreck;
    setUi({ introCutscene: inWreck });
    state.camera.x = Math.max(state.cameraMinX, x - CANVAS_WIDTH / 2);
    // (a safe point: in the endgame, here; on the file)
    setEndgameAt({ stage: STAGE.id, cp: state.checkpoint });
    saveProgress();
    return { x, y: GROUND_Y };
  },
  update: (ctx, controls) => {
    const { state } = ctx;
    const lot = getLot(state);
    if (import.meta.env.DEV) (window as unknown as { __m2: GameState }).__m2 = state;
    if (isLeaving()) { stopWeapons(); carryGut(state.player); state.player.vel.x = 0; return { ...NO_CONTROLS }; }
    if (!lot) return controls;
    const p = state.player, px = p.pos.x + p.width / 2;
    lot.steam = Math.max(0.3, lot.steam - 0.0008);
    // Out of the wreck: a beat, the truck rocking, then out of the cab's window on his belly, up on his feet
    if (lot.climb >= 0) {
      lot.climb++;
      p.inCutscene = true; p.vel.x = 0;
      if (lot.climb === 20) { playSound('thud', 0.7, -6); shakeScreen(state, 3, 4); }
      if (lot.climb === 46) { p.hidden = false; p.pos.y = GROUND_Y - p.height; p.vel.y = -3.5; p.vel.x = 2.2; playSound('jump', 0.6); }
      if (lot.climb > 60 && p.isGrounded) {
        lot.climb = -1; p.inCutscene = false; p.vel.x = 0;
        setUi({ introCutscene: false });
      }
      return { ...NO_CONTROLS };
    }
    // (on his feet, the first time in: his piece about it)
    if (!lot.said) { lot.said = true; mhSays(state, pickLine(MH_LOT[dressed(state)])); }
    // (the checkpoints: on past one, it's where he comes back to; saved there)
    for (const c of STAGE.checkpoints) if (c.cp > state.checkpoint && px >= CP_AT[c.cp]) { state.checkpoint = c.cp; setEndgameAt({ stage: STAGE.id, cp: c.cp }); saveProgress(); }
    // (at the gate: chained shut. For now.)
    if (px > LOT.gate - 200 && performance.now() - lot.gateAt > 45000) { lot.gateAt = performance.now(); mhSays(state, pickLine(MH_GATE[dressed(state)])); }
    // (the sky: now and then one of them yells it; only one at a time, and only while it's said)
    if (!lot.bark && state.frame > lot.barkNext) {
      const up = FLYER_LIST.map((f, i) => ({ f, i, at: flyerAt(f, state.frame) })).filter(o => !o.at.falling && o.at.x > 80 && o.at.x < CANVAS_WIDTH - 80);
      const o = up[Math.floor(Math.random() * up.length)];
      lot.barkNext = state.frame + 600 + Math.floor(Math.random() * 500);
      if (o) {
        const text = pickLine(o.f.alien ? ALIEN_CLAIM : DEMON_CLAIM), b = { text, i: o.i };
        const shown = say(text, o.f.alien ? ALIEN_VOICE : DEMON_VOICE, 'casual', { onShow: () => { lot.bark = b; }, onHide: () => { if (lot.bark === b) lot.bark = null; }, onDropped: () => { if (lot.bark === b) lot.bark = null; } });
        if (!shown) lot.bark = null;
      }
    }
    setUi({ near: null, map: null, nearExit: false });
    return updateGrab(ctx, lot.grab, controls);
  },
  drawBackdrop: (c, state) => { drawLotBackdrop(c, state); return true; },
  lighting: () => todLight(lotLights(), 1),
  drawBack: (c, state) => { const lot = getLot(state); drawLotBack(c, state, { steam: lot?.steam ?? 0.5 }); },
  drawFront: (c, state) => { const lot = getLot(state); if (lot) drawGrab(c, state, lot.grab); },
  drawHud: (c, state) => {
    // (whoever's yelling up there: the words over them, plain, while it's said)
    const lot = getLot(state);
    if (!lot?.bark) return;
    const at = flyerAt(FLYER_LIST[lot.bark.i], state.frame);
    c.save();
    c.font = '7px "Press Start 2P"'; c.textAlign = 'center';
    // (kept whole on the screen, clear of the HUD's corner)
    const half = c.measureText(lot.bark.text).width / 2 + 6;
    const x = Math.max(half, Math.min(CANVAS_WIDTH - half, at.x)), y = Math.max(124, at.y - 26);
    c.fillStyle = '#000'; c.fillText(lot.bark.text, x + 1, y + 1);
    c.fillStyle = FLYER_LIST[lot.bark.i].alien ? '#F9A8D4' : '#FCA5A5'; c.fillText(lot.bark.text, x, y);
    c.restore();
  },
};
export const LOT_STAGE = STAGE.stage;
