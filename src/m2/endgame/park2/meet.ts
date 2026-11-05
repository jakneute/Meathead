// THE MEETING (the owner's: "you meet satans other bratty son ... he sets the lazy river on fire and runs off"). A short
// cutscene at the river's head: no input, no HUD, skippable all-or-nothing (SKIP >> takes the lot), speech bubbles
// (a skippable scene's), no talk-over (each line waits for the last).
//
// Walking past the tube rental, it starts: he's walked up the deck toward the dock's end, where MEHPHISTO's slouched,
// vaping, looking at the water. He doesn't get up for anybody. His say, Meathead's, who he is, what his dad told him to
// do; then the lighter: click, click, a joint lit, a drag, and flicked into the river (it's slick with tanning oil: the
// sign says so). WHOOMP: it goes up, the fire racing off down the river out of sight. The leak (tell my dad I did that
// on purpose); WHATEVER; and he slouches off, straight out over the burning water (it doesn't bother him: he's from
// hell), off to the right and gone. Meathead's line; control's his.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { silenceAll, pickLine } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { speak, meatheadSays, saidOver } from '../../adventure/section';
import { byPants } from '../park1/kinds';
import { drawSon, sonHand, SON_H, type SonPose } from './sonArt';
import { lob } from './fire';
import { MEET, HEAD, RIVER_Y, GY } from './geo';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
type Step = 'wait' | 'walk' | 'talk' | 'light' | 'flick' | 'whoomp' | 'leak' | 'go' | 'after' | 'done';
export interface Meet { step: Step; t: number; skipT: number; talk: number; said: string | null; sonX: number; sonFace: 1 | -1; front: number; joint: boolean; tok: number }
export const newMeet = (done: boolean): Meet => ({ step: done ? 'done' : 'wait', t: 0, skipT: 0, talk: 0, said: null, sonX: MEET.sonX, sonFace: -1, front: done ? Infinity : -Infinity, joint: false, tok: 0 });
const hands = (): Controls => ({ left: false, right: false, up: false, down: false, jump: false, special: false, shoot: false });
const MEMO = 'm2:wp2-meet';
export const meetSeen = (state: GameState) => state.stageMemo[MEMO] === '1';

let token = 0;
const sonSays = (m: Meet, text: string, onDone: () => void) => { const tok = ++token; m.tok = tok; speak(L.SON_VOICE, text, s => { if (tok === token) m.said = s?.text ?? null; }, true, () => { if (tok === token) onDone(); }); };
const finish = (state: GameState, m: Meet) => {
  m.step = 'done'; m.front = Infinity; m.said = null; token++;
  state.stageMemo[MEMO] = '1';
  const p = state.player; p.inCutscene = false; state.cameraOverride = null;
};

/** A frame of it (a cutscene while it's on: the controls it returns are none). `onRiver`: the river's gone up. */
export const updateMeet = (ctx: FrameContext, m: Meet, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2;
  if (m.step === 'done') return controls;
  if (m.step === 'wait') {
    if (cx < MEET.trigger || p.health <= 0 || !p.isGrounded) return controls;
    m.step = 'walk'; m.t = 0; m.skipT = 0;
  }
  m.t++; m.skipT++;
  p.inCutscene = true; p.vel.x = 0;
  state.cameraOverride = { x: (MEET.stopX + MEET.sonX) / 2 - CANVAS_WIDTH / 2 + 60, y: GY - 470 };
  if (m.skipT > SKIP_AFTER) offerSkip();
  if (m.skipT > SKIP_AFTER && takeSkip()) {
    silenceAll(); state.playerVulgarityTimer = 0;
    p.pos.x = MEET.stopX - p.width / 2; p.facing = 1;
    finish(state, m);
    return hands();
  }
  const t = m.t;
  switch (m.step) {
    case 'walk':
      p.facing = 1; p.vel.x = 2.4;
      if (cx >= MEET.stopX) { p.vel.x = 0; m.step = 'talk'; m.t = 0; m.talk = 0; }
      break;
    case 'talk':
      // (his say, Meathead's, who he is, his job; each waits on the last)
      if (m.talk === 0 && t > 20) { m.talk = 1; sonSays(m, pickLine(byPants(state, L.SON_HELLO)), () => { m.talk = 2; }); }
      if (m.talk === 2) { m.talk = 3; meatheadSays(state, pickLine(byPants(state, L.MH_MEET)), true, () => { m.talk = 4; }); }
      if (m.talk === 4) { m.talk = 5; sonSays(m, pickLine(byPants(state, L.SON_NAME_LINE)), () => { m.talk = 6; }); }
      if (m.talk === 6) { m.talk = 7; sonSays(m, pickLine(byPants(state, L.SON_JOB)), () => { m.talk = 8; }); }
      if (m.talk === 8) { m.step = 'light'; m.t = 0; }
      if (t > 2400) { m.step = 'light'; m.t = 0; }
      break;
    case 'light':
      // (the lighter: click, click, lit; a drag)
      if (t === 10 || t === 26) playSound('click', 0.7, 4);
      if (t === 40) playSound('ignite', 0.4, 14);
      if (t > 70) { m.step = 'flick'; m.t = 0; }
      break;
    case 'flick': {
      // (flicked over his shoulder into the river: an arc)
      if (t === 6) {
        const [hx, hy] = sonHand('flick');
        lob(state, m.sonX + hx * m.sonFace, GY + hy, HEAD + 60, RIVER_Y, 34, 'm2:wp2_sonflick', 0);
        playSound('whoosh', 0.5, 8); m.joint = true;
      }
      if (t >= 40) { m.step = 'whoomp'; m.t = 0; m.front = HEAD; playSound('ignite', 1, -14); playSound('boom', 0.6, -10); shakeScreen(state, 14, 7); for (let i = 0; i < 40; i++) state.particles.push({ pos: { x: HEAD + 60 + (Math.random() - 0.5) * 80, y: RIVER_Y }, vel: { x: (Math.random() - 0.3) * 6, y: -3 - Math.random() * 8 }, life: 40, color: ['#FDE047', '#F59E0B', '#EA580C', '#B91C1C'][i % 4], size: 3 + Math.random() * 4 }); }
      break;
    }
    case 'whoomp':
      // (it races off down the river, out of sight)
      m.front += 28;
      if (t % 12 === 0) playSound('ignite', 0.4, -6 + Math.random() * 6);
      if (t > 50) { m.step = 'leak'; m.t = 0; m.talk = 0; }
      break;
    case 'leak':
      m.front += 28;
      m.sonFace = -1;
      if (m.talk === 0 && t > 10) { m.talk = 1; sonSays(m, pickLine(byPants(state, L.SON_LEAK)), () => { m.talk = 2; }); }
      if (m.talk === 2) { m.talk = 3; sonSays(m, pickLine(byPants(state, L.SON_BYE)), () => { m.talk = 4; }); }
      if (m.talk === 4 || t > 1600) { m.step = 'go'; m.t = 0; m.sonFace = 1; }
      break;
    case 'go':
      // (slouching off, out over the fire, quick for him)
      m.front += 28;
      m.sonX += 2.6;
      if (m.sonX > MEET.sonX + 560) { m.step = 'after'; m.t = 0; m.talk = 0; }
      break;
    case 'after':
      m.front += 28;
      if (m.talk === 0) { m.talk = 1; meatheadSays(state, pickLine(byPants(state, L.MH_AFTER_MEET)), true, () => { m.talk = 2; }); }
      if (m.talk === 2 || t > 900) finish(state, m);
      break;
  }
  return hands();
};
export const meetOn = (m: Meet) => m.step !== 'done' && m.step !== 'wait';
/** How far down the river the fire's got (Infinity: all of it). */
export const meetFront = (m: Meet) => m.front;

/** World space: him (on the dock, then off over the water), his words. */
export const drawMeet = (c: Ctx, state: GameState, m: Meet) => {
  if (m.step === 'done') return;
  const f = state.frame;
  const pose: SonPose = m.step === 'light' ? (m.t > 40 ? 'inhale' : 'flick') : m.step === 'flick' ? 'flick' : m.step === 'go' || m.step === 'after' ? 'walk' : m.said ? 'talk' : 'idle';
  const q = pose === 'walk' ? Math.floor(f / 7) % 8 : pose === 'idle' || pose === 'talk' ? Math.floor(f / 12) % 8 : 0;
  const feet = m.sonX > HEAD ? RIVER_Y - 2 : GY;
  drawSon(c, m.sonX, feet, m.sonFace, { pose, q, mouth: !!m.said }, f);
  // (the lighter's flame, lit)
  if (m.step === 'light' && m.t > 40) { c.fillStyle = f % 4 < 2 ? '#FDE047' : '#F59E0B'; const [hx, hy] = sonHand('flick'); c.fillRect(Math.round(m.sonX + hx * m.sonFace), Math.round(GY + hy - 14), 3, 5); }
  if (m.said) saidOver(c, m.said, m.sonX, GY - SON_H - 34, '#D8B4FE', 280);
};
/** Screen space: the letterbox, SKIP. */
export const drawMeetHud = (c: Ctx, m: Meet) => {
  if (!meetOn(m)) return;
  const k = Math.min(1, m.skipT / 20), bar = Math.round(k * 44);
  c.fillStyle = '#000'; c.fillRect(0, 0, CANVAS_WIDTH, bar); c.fillRect(0, CANVAS_HEIGHT - bar, CANVAS_WIDTH, bar);
  if (m.skipT > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
