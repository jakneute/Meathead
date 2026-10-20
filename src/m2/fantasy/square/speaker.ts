// THE LOUDSPEAKER: the end of the town square (the user's brief: "you eventually reach a loudspeaker, the speaker is a
// sultry sounding woman named 'piper the pixie'..."). The town's PA horn up a lamp post by the bandstand; the suitors
// stood round the bandstand (beefy, flexing: fantasy/suitors.ts). A cutscene (HUD hidden, no controls of his, SKIP >>
// for the lot), from him walking up short of the post:
//
//   the PA's chime; PIPER, purring over the speaker (her lust is for being fought over: coy about the prize, thrilled by
//   the blood): hello, boys; her name; OVERCOME MY TRIALS, WIN AN AUDIENCE WITH ME; fight for me, bleed for me; the first
//   trial, the fairy wheel. The suitors read it as sex (Braxton, Gunnar). Meathead gets aroused (hearts up off him, a
//   boing): "PIPER? I WILL PIPE HER. WITH MY DICK." Tremaine sneers at the state of him; "I'M WINNING THESE TRIALS,
//   LOSERS." Black; on to the fairy wheel (DOORS.wheel.start), a horny line there (fantasy/lines.ts HORNY).
//
// Done for good once it's run (SPEAKER_MEMO, state.stageMemo): back here later, the bandstand's empty; walk off the
// square's right end to go on to the wheel.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { hands, meatheadSays, speak, saidOver, teleport, byPants, type Said } from '../section';
import { DOORS } from '../geometry';
import { PIPER_PA_VOICE } from '../talk';
import { piperMust } from '../piperLines';
import { HORNY } from '../lines';
import { SUITORS, drawSuitor, SUITOR_H, type SuitorPose } from '../suitors';
import { box, onScreen, INK, type Ctx } from '../kit';
import { squareOf } from './state';
import { SPEAKER, SUITOR_SPOTS, X, Y } from './layout';
import { PIPER_HELLO, PIPER_NAME, PIPER_TRIALS, PIPER_BLOOD, PIPER_WHEEL, BRAXTON_SAY, GUNNAR_SAY, TREMAINE_SAY, PIPE_HER, WINNING } from './lines';

/** The scene's run for good (kept across his deaths; a revisit's bandstand is empty). */
export const SPEAKER_MEMO = 'fantasy-speaker-done';
export const speakerDone = (state: GameState) => state.stageMemo[SPEAKER_MEMO] === '1';

type Who = 'piper' | 'braxton' | 'gunnar' | 'tremaine';
export interface Scene {
  step: 'wait' | 'walk' | 'talk' | 'fade' | 'done';
  t: number; all: number; line: number;
  said: Said | null; who: Who | null;
  fade: number; hearts: number;
  suitors: unknown[];
}
const SUITOR_OF: Record<Exclude<Who, 'piper'>, keyof typeof SUITORS> = { braxton: 'braxton', gunnar: 'gunnar', tremaine: 'tremaine' };
const CAM_X = 14150;

const voiceLine = (state: GameState, s: Scene, who: Who, text: string, then: number) => {
  const voice = who === 'piper' ? PIPER_PA_VOICE : SUITORS[SUITOR_OF[who]].voice;
  s.who = who;
  speak(voice, text, x => { s.said = x; }, true, () => { s.said = null; s.who = null; s.line = then; });
};

/** The scene's over (run through, or skipped): on to the fairy wheel. */
const finish = (state: GameState, s: Scene, skipped: boolean) => {
  if (skipped) silenceAll();
  state.stageMemo[SPEAKER_MEMO] = '1';
  s.step = 'done'; s.said = null; s.who = null; s.fade = 0; s.hearts = 0;
  for (const e of state.enemies) if (e.puppet && Math.abs(e.pos.x - X(SPEAKER.post)) < 1400) e.puppet = false;
  const p = state.player;
  p.inCutscene = false;
  state.cameraOverride = null;
  teleport(state, DOORS.wheel.start.x, DOORS.wheel.start.y);
  meatheadSays(state, pickLine(byPants(state, HORNY)), true);
};

export const updateSpeaker = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, s = squareOf(state).scene;
  const cx = p.pos.x + p.width / 2;
  if (s.step === 'wait' && speakerDone(state)) s.step = 'done';
  if (s.step === 'done') return controls;
  s.t++;
  if (s.step === 'wait') {
    if (cx > X(SPEAKER.trigger) && cx < X(SPEAKER.stand.b) && p.health > 0 && !p.inCutscene && p.isGrounded) {
      s.step = 'walk'; s.t = 0; s.all = 0; s.line = 0;
      p.inCutscene = true;
      // (nothing he'd let fly gets anywhere; anybody of the cast still about holds still for it)
      state.projectiles = state.projectiles.filter(q => q.owner !== 'player');
      squareOf(state).throws = [];
      for (const e of state.enemies) if (e.health > 0 && Math.abs(e.pos.x - X(SPEAKER.post)) < 1400) { e.puppet = true; e.pauseTimer = 2; e.vel.x = 0; }
    }
    return controls;
  }
  // (the cutscene: no HUD, no controls, SKIP >> for the lot)
  s.all++;
  p.inCutscene = true;
  for (const e of state.enemies) if (e.puppet) { e.pauseTimer = 2; e.vel.x = 0; }
  state.cameraOverride = { x: X(CAM_X), y: state.camera.y };
  state.camera.x += (X(CAM_X) - state.camera.x) * 0.12;
  if (s.all > SKIP_AFTER) {
    offerSkip();
    if (takeSkip()) { finish(state, s, true); return hands(); }
  }
  if (s.hearts > 0) {
    s.hearts--;
    if (s.hearts % 7 === 0) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * 20, y: p.pos.y - 6 }, vel: { x: (Math.random() - 0.5) * 0.8, y: -1.4 }, life: 40, color: Math.random() < 0.5 ? '#F472B6' : '#FB7185', size: 5 });
  }
  switch (s.step) {
    case 'walk':
      p.facing = 1;
      if (cx < X(SPEAKER.stop)) return { ...hands(), right: true } as Controls;
      p.vel.x = 0; s.step = 'talk'; s.t = 0;
      return hands();
    case 'talk': {
      p.vel.x = 0; p.facing = 1;
      if (s.t === 16) playSound('ding', 0.8, 7);
      if (s.t === 30) playSound('ding', 0.8, 0);
      if (s.t === 56 && s.line === 0) s.line = 1;
      const next = () => { s.line = -1; };
      switch (s.line) {
        case 1: next(); voiceLine(state, s,'piper', piperMust(PIPER_HELLO), 2); break;
        case 2: next(); voiceLine(state, s,'piper', piperMust(PIPER_NAME), 3); break;
        case 3: next(); voiceLine(state, s,'piper', piperMust(PIPER_TRIALS), 4); break;
        case 4: next(); voiceLine(state, s,'piper', piperMust(PIPER_BLOOD), 5); break;
        case 5: next(); voiceLine(state, s,'piper', piperMust(PIPER_WHEEL), 6); break;
        case 6: next(); voiceLine(state, s,'braxton', pickLine(BRAXTON_SAY), 7); break;
        case 7: next(); voiceLine(state, s,'gunnar', pickLine(GUNNAR_SAY), 8); break;
        case 8: next(); s.hearts = 150; playSound('boing', 0.8, -6); meatheadSays(state, PIPE_HER, true, () => { s.line = 9; }); break;
        case 9: next(); voiceLine(state, s,'tremaine', pickLine(byPants(state, TREMAINE_SAY)), 10); break;
        case 10: next(); meatheadSays(state, WINNING, true, () => { s.line = 11; }); break;
        case 11: next(); s.step = 'fade'; s.t = 0; break;
      }
      return hands();
    }
    case 'fade':
      s.fade = Math.min(1, s.t / 40);
      if (s.t > 52) finish(state, s, false);
      return hands();
  }
  return controls;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing: the lamp post and its PA horn (sound rings out of it while she talks), the suitors round the bandstand

/** Behind him: the post, the horn, the suitors (while the scene's still to come or on). */
export const drawSpeakerBack = (c: Ctx, state: GameState) => {
  if (!onScreen(state, X(SPEAKER.post) - 200, X(SPEAKER.stand.b) + 100)) return;
  const s = squareOf(state).scene, f = state.frame, px = X(SPEAKER.post), hy = Y(SPEAKER.hornH);
  // (the post: wrought iron, fluted, a lantern near the top; the horn on its bracket)
  box(c, px - 5, hy - 6, 10, Y(0) - hy + 6, INK); box(c, px - 3, hy - 4, 6, Y(0) - hy + 4, '#2E2A3A'); box(c, px - 3, hy - 4, 2, Y(0) - hy + 4, '#5A546A');
  box(c, px - 10, Y(0) - 12, 20, 12, INK); box(c, px - 9, Y(0) - 11, 18, 11, '#3A3448');
  box(c, px - 8, hy + 30, 16, 18, INK); box(c, px - 6, hy + 32, 12, 14, '#FFE9A8');
  box(c, px, hy - 2, 26, 4, INK);
  const talking = s.who === 'piper' && !!s.said, jig = talking && f % 4 < 2 ? 1 : 0;
  // (the horn: brass, flaring right)
  c.fillStyle = INK; c.beginPath(); c.moveTo(px + 20, hy - 5 + jig); c.lineTo(px + 52, hy - 22 + jig); c.lineTo(px + 52, hy + 18 + jig); c.lineTo(px + 20, hy + 5 + jig); c.closePath(); c.fill();
  c.fillStyle = '#E0AE3A'; c.beginPath(); c.moveTo(px + 21, hy - 3 + jig); c.lineTo(px + 50, hy - 19 + jig); c.lineTo(px + 50, hy + 15 + jig); c.lineTo(px + 21, hy + 3 + jig); c.closePath(); c.fill();
  c.fillStyle = '#FFF0A0'; c.fillRect(px + 22, hy - 3 + jig, 24, 2);
  c.fillStyle = '#7A5A1E'; c.beginPath(); c.ellipse(px + 51, hy - 2 + jig, 4, 19, 0, 0, Math.PI * 2); c.fill();
  if (talking) for (let k = 0; k < 3; k++) { const r = 10 + ((f * 1.5 + k * 14) % 42); c.strokeStyle = `rgba(244, 114, 182, ${Math.max(0, 1 - r / 52)})`; c.lineWidth = 2; c.beginPath(); c.arc(px + 52, hy - 2, r, -0.7, 0.7); c.stroke(); }
  // (the suitors, till they're off to the wheel)
  if (s.step === 'done' || state.stageMemo[SPEAKER_MEMO] === '1') return;
  const names: (keyof typeof SUITORS)[] = ['braxton', 'gunnar', 'tremaine'];
  SUITOR_SPOTS.forEach(([x, h, face], i) => {
    const who = names[i], speaking = s.who === who && !!s.said;
    const pose: SuitorPose = speaking ? (who === 'tremaine' ? 'point' : 'talk') : s.who === 'piper' ? 'cheer' : (Math.floor((f + i * 70) / 120) % 2 ? 'flex' : 'stand');
    drawSuitor(c, X(x), Y(h), face, f + i * 13, SUITORS[who], pose, { talking: speaking });
  });
};

/** Over the world: what's being said, over whoever's saying it (Piper's out of the horn). */
export const drawSpeakerFront = (c: Ctx, state: GameState) => {
  const s = squareOf(state).scene;
  if (!s.said || !s.who) return;
  if (s.who === 'piper') { saidOver(c, s.said.text, X(SPEAKER.post) + 40, Y(SPEAKER.hornH) - 30, '#F9A8D4', 260); return; }
  const i = ['braxton', 'gunnar', 'tremaine'].indexOf(s.who), spot = SUITOR_SPOTS[i];
  saidOver(c, s.said.text, X(spot[0]), Y(spot[1]) - SUITOR_H - 12, '#FDE68A', 220);
};

/** Screen space: the fade to black, SKIP >>. */
export const drawSpeakerHud = (c: Ctx, state: GameState) => {
  const s = squareOf(state).scene;
  if (s.fade > 0) { c.fillStyle = `rgba(0, 0, 0, ${s.fade})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  if ((s.step === 'walk' || s.step === 'talk' || s.step === 'fade') && s.all > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
