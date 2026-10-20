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
import { box, onScreen, INK, still, postR, ballR, snowCap, rampH, lit, IRON, GOLD, SNOW, type Ctx } from '../kit';
import { signText } from '../../signLetters';
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
  // (the post: wrought iron on a stepped plinth, fluted, a collar, its lantern (lit after dark), the scrolled bracket
  // the horn hangs off, its wire running down the post, a little enamel plate; painted once)
  const I = rampH(IRON), Gd = rampH(GOLD), S = rampH(SNOW), ph = Y(0) - hy;
  still(c, 'sq-speakerpost', px, Y(0), -24, -ph - 30, 60, ph + 34, g => {
    box(g, -12, -14, 24, 14, INK); box(g, -11, -13, 22, 13, I[3]); box(g, -11, -13, 22, 2, I[5]); box(g, -8, -18, 16, 5, I[2]); box(g, -8, -18, 16, 1, I[4]);
    postR(g, 0, -ph - 6, -18, 7, I);
    for (let y = -ph + 20; y < -24; y += 30) { box(g, -5, y, 10, 3, I[2]); box(g, -5, y, 10, 1, I[4]); }
    box(g, -6, -ph + 52, 12, 4, Gd[3]); box(g, -6, -ph + 52, 12, 1, Gd[5]);
    box(g, 4, -ph + 8, 1, ph - 26, '#2A2A30');
    box(g, -9, -ph + 30, 18, 20, INK); box(g, -8, -ph + 31, 16, 18, lit() ? '#FFE9A8' : '#E8D8A8'); box(g, -8, -ph + 31, 5, 18, lit() ? '#FFFFFF' : '#FFF4D8'); box(g, -1, -ph + 31, 2, 18, I[2]);
    box(g, -10, -ph + 28, 20, 3, I[3]); box(g, -10, -ph + 49, 20, 3, I[3]);
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -ph - 2); g.lineTo(24, -ph - 2); g.moveTo(4, -ph + 12); g.quadraticCurveTo(16, -ph + 10, 18, -ph - 2); g.stroke();
    g.strokeStyle = I[4]; g.lineWidth = 1; g.stroke();
    ballR(g, 0, -ph - 9, 4, Gd);
    snowCap(g, -10, -ph + 28, 20, 2, 11, S, false);
    box(g, -14, -60, 28, 12, INK); box(g, -13, -59, 26, 10, '#1E3A6E'); box(g, -13, -59, 26, 1, '#4A6AA0');
    signText(g, 'PA', 0, -51, { sx: 1, sy: 1, fill: GOLD[4] });
  });
  const talking = s.who === 'piper' && !!s.said, jig = talking && f % 4 < 2 ? 1 : 0;
  // (the horn: brass in steps, flaring right, its bell's dark mouth, a rim catching the light; while she talks it
  // buzzes and soft pink rings come out of it)
  if (talking) { c.globalAlpha = 0.16; c.fillStyle = '#FF9AD0'; c.beginPath(); c.arc(px + 54, hy - 2, 34, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(px + 54, hy - 2, 20, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
  const y0 = hy + jig;
  c.fillStyle = INK; c.beginPath(); c.moveTo(px + 18, y0 - 6); c.quadraticCurveTo(px + 40, y0 - 8, px + 53, y0 - 23); c.lineTo(px + 53, y0 + 19); c.quadraticCurveTo(px + 40, y0 + 4, px + 18, y0 + 6); c.closePath(); c.fill();
  const bandsH = [Gd[5], Gd[4], Gd[3], Gd[3], Gd[2], Gd[1]];
  for (let i = 0; i < 6; i++) { const t0 = i / 6, t1 = (i + 1) / 6; c.fillStyle = bandsH[i]; c.beginPath(); c.moveTo(px + 19, y0 - 4 + 8 * t0); c.quadraticCurveTo(px + 40, y0 - 6 + 10 * t0, px + 51, y0 - 20 + 36 * t0); c.lineTo(px + 51, y0 - 20 + 36 * t1); c.quadraticCurveTo(px + 40, y0 - 6 + 10 * t1, px + 19, y0 - 4 + 8 * t1); c.closePath(); c.fill(); }
  c.fillStyle = INK; c.beginPath(); c.ellipse(px + 52, y0 - 2, 5, 21, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = Gd[2]; c.beginPath(); c.ellipse(px + 52, y0 - 2, 4, 20, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#2A1A0A'; c.beginPath(); c.ellipse(px + 53, y0 - 2, 2.5, 16, 0, 0, Math.PI * 2); c.fill();
  box(c, px + 51, y0 - 20, 1, 12, Gd[5]); box(c, px + 14, y0 - 4, 6, 8, I[2]);
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
  // (the scene's framing: letterbox bars easing in as he walks up to the post, a soft pink vignette while she purrs)
  const on = s.step === 'walk' || s.step === 'talk' || s.step === 'fade';
  if (on) {
    const k = Math.min(1, s.all / 24), bh = Math.round(36 * k * k * (3 - 2 * k));
    if (s.who === 'piper' && s.said) { c.globalAlpha = 0.07; c.fillStyle = '#FF7AC0'; c.fillRect(0, bh, CANVAS_WIDTH, 26); c.fillRect(0, CANVAS_HEIGHT - bh - 26, CANVAS_WIDTH, 26); c.globalAlpha = 1; }
    c.fillStyle = '#05030A'; c.fillRect(0, 0, CANVAS_WIDTH, bh); c.fillRect(0, CANVAS_HEIGHT - bh, CANVAS_WIDTH, bh);
    c.fillStyle = '#2A1830'; c.fillRect(0, bh, CANVAS_WIDTH, 1); c.fillRect(0, CANVAS_HEIGHT - bh - 1, CANVAS_WIDTH, 1);
  }
  if (s.fade > 0) { c.fillStyle = `rgba(0, 0, 0, ${s.fade})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  if ((s.step === 'walk' || s.step === 'talk' || s.step === 'fade') && s.all > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
