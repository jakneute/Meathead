// The showpiece room's cutscene (HUD hidden; skip all-or-nothing): he walks up to her glass, has his say, kicks it in.
// The real ones up in the control booth light up and have theirs; their dish puts its rings into her head; she twitches,
// the green comes on under her crest, she rears up and screeches (she says nothing: the screech, the clicks, the
// hydraulics). Then she brings both fists down on the floor in front of him, and it goes: down he drops, into the dark,
// and lands in the attraction's basement (basement.ts). Seen once a run (kept across his deaths): back up here after,
// her stand's empty, its lines torn, and the hole's still in the floor (walk into it: down he goes again).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { silenceAll, pickLine } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip } from '../../../m1/game/platform/skip';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { KICK_POSE_FRAMES, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { hands, speak, meatheadSays, saidOver, teleport } from '../section';
import { GY } from '../geometry';
import { GLASS_X, QUEEN_X, BOOTH, HOLE, LAND_X } from './geo';
import { drawQueen, queenHead } from './art';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;
const dressed = (state: GameState): L.Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

/** Kept across his deaths: the floor's gone, he's been down (the checkpoint past it, the same). */
export const FELL_MEMO = 'm2:space:fell';
export const BASEMENT_CP = 71;

type Step = 'wait' | 'walk' | 'look' | 'kick' | 'booth' | 'beam' | 'rise' | 'smash' | 'drop' | 'land' | 'done';
export interface Show {
  step: Step; stepT: number; skipT: number; token: number;
  glass: boolean; booth: number; beam: number; alive: number; ext: number;
  boothSaid: string | null;
  /** The screen going black (0..1) on the way down, and coming back up. */
  fade: number;
}
export const fell = (state: GameState) => !!state.stageMemo[FELL_MEMO] || state.checkpoint >= BASEMENT_CP;
export const makeShow = (state: GameState): Show => {
  const done = fell(state);
  return { step: done ? 'done' : 'wait', stepT: 0, skipT: 0, token: 0, glass: !done, booth: 0, beam: 0, alive: 0, ext: 0, boothSaid: null, fade: 0 };
};
export const showOn = (s: Show) => s.step !== 'wait' && s.step !== 'done';
/** Skippable now (the drop's own few frames aren't: they're the cut). */
export const showSkippable = (s: Show) => showOn(s) && s.step !== 'drop' && s.step !== 'land';

const go = (s: Show, st: Step) => { s.step = st; s.stepT = 0; };
const tokened = (s: Show, fn: () => void) => { const tok = s.token; return () => { if (tok === s.token) fn(); }; };

export const startShow = (state: GameState, s: Show) => {
  s.token++; go(s, 'walk'); s.skipT = 0;
  state.player.inCutscene = true;
};

/** Down he goes (the cut): out of the room, in at the top of the basement's shaft, falling. */
const dropIn = (state: GameState, s: Show) => {
  const p = state.player;
  state.stageMemo[FELL_MEMO] = '1';
  if (state.checkpoint < BASEMENT_CP) state.checkpoint = BASEMENT_CP;
  p.hidden = false; p.kickPose = 0;
  teleport(state, LAND_X, GY - 360);
  p.vel.y = 4; p.facing = 1;
  go(s, 'land'); s.fade = 1;
};

/** Each frame; the cutscene's controls while it's on (else null). */
export const tickShow = (ctx: FrameContext, s: Show): Controls | null => {
  const { state } = ctx, p = state.player;
  if (!showOn(s)) return null;
  s.stepT++; s.skipT++;
  p.inCutscene = true;
  if (showSkippable(s) && s.skipT > SKIP_AFTER) offerSkip();
  if (showSkippable(s) && s.skipT > SKIP_AFTER && takeSkip()) {
    silenceAll(); state.playerVulgarityTimer = 0; s.token++;
    s.glass = false; s.boothSaid = null; s.beam = 0;
    dropIn(state, s); s.fade = 0.6;
    return hands();
  }
  const t = s.stepT, cx = p.pos.x + p.width / 2;
  switch (s.step) {
    case 'walk':
      if (cx < GLASS_X - 60 && t < 240) return { ...hands(), right: true } as Controls;
      p.vel.x = 0; p.facing = 1;
      go(s, 'look');
      meatheadSays(state, pick(L.MH_GLASS[dressed(state)]), true, tokened(s, () => go(s, 'kick')));
      break;
    case 'look': p.vel.x = 0; break;
    case 'kick':
      p.vel.x = 0; p.facing = 1;
      if ((p.kickPose || 0) > 0) p.kickPose!--;
      if (t === 6) { p.kickPose = KICK_POSE_FRAMES; playSound('whoosh', 0.7, -4); }
      if (t === 16) { shatter(state, s); meatheadSays(state, pick(L.MH_KICK[dressed(state)]), true, tokened(s, () => go(s, 'booth'))); }
      break;
    case 'booth':
      s.booth = Math.min(1, s.booth + 0.04);
      if (t === 1) playSound('alarm', 0.4, 2);
      if (t === 30) speak('m2.space.alien', pick(L.BOOTH_TAKEOVER[dressed(state)]), x => { s.boothSaid = x?.text ?? null; }, true, tokened(s, () => go(s, 'beam')));
      break;
    case 'beam':
      s.beam = Math.min(1, t / 20);
      s.alive = Math.min(1, Math.max(0, (t - 40) / 50));
      if (t % 8 === 0) { playSound('click', 0.5, 6 + (t % 24) / 2); shakeScreen(state, 2, 2); }
      if (t === 2) playSound('alienCharge', 0.8, -6);
      if (t % 12 === 0) for (let i = 0; i < 4; i++) state.particles.push({ pos: queenHead(QUEEN_X, -1, 0), vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 18, color: i % 2 ? '#A3E635' : '#FFFFFF', size: 2 + Math.random() * 2, grav: 0.2 });
      if (t >= 110) { go(s, 'rise'); s.beam = 0; }
      break;
    case 'rise':
      // (up she rears: the screech, no words)
      if (t === 1) { playSound('roar', 1, -6); playSound('screams', 0.6, -10); shakeScreen(state, 14, 8); }
      if (t % 10 === 0) playSound('click', 0.4, -4);
      if (t >= 70) go(s, 'smash');
      break;
    case 'smash':
      // (both fists down on the floor in front of him, out on her arm: it gives)
      s.ext = Math.min(1, t / 10) * 130;
      if (t === 10) { playSound('crash', 1, -6); playSound('boom', 0.8, -8); shakeScreen(state, 18, 10); for (let i = 0; i < 30; i++) state.particles.push({ pos: { x: HOLE.a + Math.random() * (HOLE.b - HOLE.a), y: GY - 4 }, vel: { x: (Math.random() - 0.5) * 8, y: -2 - Math.random() * 6 }, life: 40, color: ['#3F3F46', '#52525B', '#A78BFA', '#18181B'][i % 4], size: 3 + Math.random() * 5, grav: 0.4 }); }
      if (t === 18) { playSound('crack', 1, -4); }
      if (t >= 26) { go(s, 'drop'); p.hidden = false; }
      break;
    case 'drop':
      // (down through it: he sinks out of the room, the picture going black)
      p.vel.x = 0; p.vel.y = 0;
      p.pos.y += 2 + t * 0.9;
      if (p.pos.y > GY + 10) p.hidden = true;
      s.fade = Math.min(1, t / 22);
      s.ext *= 0.9;
      if (t === 2) playSound('whoosh', 0.8, -8);
      if (t >= 26) dropIn(state, s);
      break;
    case 'land':
      // (out of the black, falling in from the top of the shaft; landed: his say, and he's his own again)
      s.fade = Math.max(0, s.fade - 0.06);
      if (p.isGrounded && t > 4 && s.stepT < 9000) {
        s.stepT = 9000;
        playSound('land', 1); playSound('thud', 1, -8); shakeScreen(state, 10, 5);
        for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: p.pos.x + p.width / 2, y: GY - 2 }, vel: { x: (Math.random() - 0.5) * 7, y: -1 - Math.random() * 3 }, life: 30, color: i % 2 ? '#3F3F46' : '#57534E', size: 3 + Math.random() * 4, grav: 0.3 });
        meatheadSays(state, pick(L.MH_FALL[dressed(state)]), false);
      }
      if (s.stepT > 9030 || t > 600) { go(s, 'done'); s.fade = 0; p.inCutscene = false; }
      break;
    default: break;
  }
  return hands();
};

const shatter = (state: GameState, s: Show) => {
  s.glass = false;
  playSound('glass', 1, -2); playSound('crash', 0.7, 2); shakeScreen(state, 8, 4);
  for (let i = 0; i < 40; i++) state.particles.push({ pos: { x: GLASS_X + Math.random() * 20, y: GY - Math.random() * 320 }, vel: { x: 1 + Math.random() * 6, y: -2 - Math.random() * 4 }, life: 50, color: i % 3 ? 'rgba(186, 230, 253, 0.8)' : '#FFFFFF', size: 2 + Math.random() * 4, grav: 0.35 });
};

/** Her, on her stand, as the scene has her (gone, after: drawn empty by the room). */
export const drawShowQueen = (c: Ctx, state: GameState, s: Show) => {
  if (s.step === 'done' || s.step === 'land') return;
  const pose = s.step === 'beam' ? (s.alive > 0 ? 'wake' : 'dormant') : s.step === 'rise' ? 'roar' : s.step === 'smash' || s.step === 'drop' ? 'swipe' : 'dormant';
  drawQueen(c, QUEEN_X, -1, { pose, t: state.frame, ext: s.ext, alive: s.alive, beat: 0 });
};
export const drawShowSaid = (c: Ctx, s: Show) => {
  if (s.boothSaid) saidOver(c, s.boothSaid, BOOTH.x + BOOTH.w / 2, BOOTH.y - 20, '#D9F99D', 260);
};
/** Screen space: the fade to black on the way down. */
export const drawShowFade = (c: Ctx, s: Show) => {
  if (s.fade <= 0) return;
  c.fillStyle = `rgba(0, 0, 0, ${s.fade.toFixed(2)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
};
export const showHead = (s: Show) => queenHead(QUEEN_X, -1, s.ext);
