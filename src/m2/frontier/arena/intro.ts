// TUCKER'S ARENA INTRO: THE FAKE-OUT (the user's: "you approach the body in the area and meathead goes 'are you going to
// fake me out again?' yep, he does, he pops up like a jumpscare (he does this every time, coming back from the dead).
// the real fight against him begins here").
//
// Played, then a cutscene: he walks up to the body himself (hung on the oak by the branch through his chest); near it,
// the scene (no HUD; SKIP >> for all of it): "ARE YOU GOING TO FAKE ME OUT AGAIN?" A beat (nothing; a leaf comes down;
// Meathead leans in)... and YEP: the branch snaps and Tucker comes off the oak at him screaming (the jumpscare: the
// sting, the shake, the screen snapped to his screaming face, the oak's leaves everywhere), Meathead jumping back out of
// his skin. Meathead's line; Tucker on his feet with the branch through him, squaring up (his line); then, the same
// cutscene, THE ARENA ENTRY (entry.ts: the axe tree, the split, blind) and it's his fight (`onUp`: fight.ts). UP_MEMO
// ('frontier-arena-up') and checkpoint 60 from here on.
//
// REUSABLE for the fight: a retry (dead in his fight, back at checkpoint 60, the same visit) skips all of that for THE
// ENTRANCE BEAT (as the other land bosses' retries do): he's lying flat by the felled tree (the axe in the stump), the
// branch sticking up out of his chest, split; walk up and he pops up again, blind (a sting, a shake, a bark), Meathead
// free to move meanwhile; then it's on.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { silenceAll } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { hands, saidOver } from '../section';
import { box, hash, type Ctx } from '../kit';
import { drawTuckerGross, drawTuckerGrossBack } from '../tuckerGross';
import { GY, TREE_X, HANG_X, HANG_FEET, UP_X, ROOT, FIGHT_X } from './layout';
import { startEntry, skipToWalk } from './entry';
import { arenaOf, next, UP_MEMO, type Arena } from './state';
import { tuckerSays, tuckerBarks, meatheadLine, camSnap, tickTucker } from './cast';
import { leafBurst } from './art';
import { setBranchMemos } from './catchup';
import { FAKE_ME_OUT, TUCKER_JUMP, MH_JUMPED, TUCKER_UP, TUCKER_ENTRANCE } from './lines';

/** The fight's frames of the entrance beat (a retry's). */
export const ENTRANCE_T = 90;

const pmid = (state: GameState) => state.player.pos.x + state.player.width / 2;

/** He's up: where he stands squaring up, facing Meathead (split, past the felled tree: blind, groping). */
const standUp = (state: GameState, s: Arena) => {
  s.tMode = 'up'; s.tx = s.split ? FIGHT_X : UP_X; s.ty = GY; s.tvx = 0; s.tvy = 0; s.hop = null; s.snapped = true;
  s.tFacing = pmid(state) < s.tx ? -1 : 1; s.pose = s.split ? 'grope' : 'furious'; s.face = 'manic';
};

// ---------------------------------------------------------------------------------------------------------------
// The fake-out (the first time this visit)

export const startFakeout = (state: GameState) => {
  const s = arenaOf(state), p = state.player;
  silenceAll();
  s.phase = 'fakeout'; next(s, 'ask'); s.all = 0; s.busy = false; s.said = null; s.talking = false;
  p.inCutscene = true; p.vel.x = 0; p.isDucking = false;
  p.facing = pmid(state) < HANG_X ? 1 : -1;
  camSnap(state, s, (pmid(state) + TREE_X) / 2);
};

/** A frame of it (it has the controls). Null once it's over. `onUp`: he's up and it's his fight. */
export const updateFakeout = (ctx: FrameContext, onUp: (state: GameState) => void): Controls | null => {
  const { state } = ctx, s = arenaOf(state), p = state.player;
  if (s.phase !== 'fakeout') return null;
  s.t++; s.all++;
  p.inCutscene = true;
  // (SKIP: all of it, and the arena entry's run-off and taunt after it: onto the walk up to the axe tree, his to walk
  // (the user's: he walks up to the boss's door himself))
  if (s.all > SKIP_AFTER) { offerSkip(); if (takeSkip()) { finishFakeout(state, true); skipToWalk(state); return hands(); } }
  tickTucker(s);
  switch (s.step) {
    case 'ask':
      if (s.t === 10) meatheadLine(state, s, FAKE_ME_OUT, () => next(s, 'beat'));
      break;
    case 'beat':
      // (a beat: nothing. A leaf comes down off the oak. He leans in for a look...)
      if (s.t === 20) leafBurst(s, HANG_X + 10, GY - 260, 1, 0, 20);
      if (s.t > 50 && s.t < 74) { p.pos.x += 0.6 * p.facing; }
      if (s.t >= 104) pop(state, s);
      break;
    case 'pop':
      // (the jumpscare's up while he screams: then back out)
      if (s.t >= 56 && !s.busy) { next(s, 'jumped'); s.pose = 'furious'; s.face = 'manic'; s.tFacing = pmid(state) < s.tx ? -1 : 1; }
      break;
    case 'jumped':
      if (s.t === 4) meatheadLine(state, s, MH_JUMPED, () => next(s, 'up'));
      break;
    case 'up':
      if (s.t === 1) { s.pose = 'point'; s.face = 'manic'; tuckerSays(state, s, TUCKER_UP, () => next(s, 'go')); }
      break;
    case 'go':
      // (on into the arena entry, the same cutscene: he runs off to the axe tree; the fight's after it: entry.ts)
      startEntry(state);
      return hands();
  }
  return hands();
};

/** YEP: off the oak at him, screaming. */
const pop = (state: GameState, s: Arena) => {
  next(s, 'pop');
  const p = state.player;
  playSound('slam', 1, -10); playSound('crack', 1, -4); playSound('crash', 0.8, -2); playSound('alarm', 1, 14); playSound('roar', 0.5, 10);
  shakeScreen(state, 18, 10);
  s.snapped = true;
  // (off the branch and the rest of it with him: a leap down at Meathead)
  s.tMode = 'pop'; s.tx = HANG_X; s.ty = HANG_FEET; s.tvy = -7; s.tvx = (UP_X - HANG_X) / 24; s.tFacing = -1; s.pose = 'pop'; s.face = 'yell';
  leafBurst(s, TREE_X, GY - 300, 50, 3, 340); leafBurst(s, ROOT.x - 20, ROOT.y, 16, 7, 40);
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: ROOT.x - 14, y: ROOT.y + (Math.random() - 0.5) * 10 }, vel: { x: -1 - Math.random() * 3, y: -1 - Math.random() * 3 }, life: 30, color: i % 2 ? '#D8B886' : '#5A3C20', size: 2 + Math.random() * 2 });
  state.stageMemo[UP_MEMO] = '1';
  // (Meathead out of his skin: back and up)
  p.vel.x = -4.5 * p.facing; p.vel.y = -7;
  tuckerSays(state, s, TUCKER_JUMP);
};

/** Over (played through, or skipped): Tucker up, the branch snapped off the oak and through him, checkpoint 60. */
export const finishFakeout = (state: GameState, skipped: boolean) => {
  const s = arenaOf(state), p = state.player;
  if (skipped) silenceAll();
  setBranchMemos(state);
  // (the intro's seen only at the entry's end (entry.ts finishEntry): it goes on from here, the same cutscene)
  state.stageMemo[UP_MEMO] = '1';
  s.step = ''; s.busy = false; s.said = null; s.talking = false;
  standUp(state, s);
  p.inCutscene = false;
  state.cameraOverride = null;
  if (state.checkpoint < 60) state.checkpoint = 60;
};

// ---------------------------------------------------------------------------------------------------------------
// The entrance beat (a retry this visit): flat by the oak; walk up and he pops up again

/** Lying there by the felled tree, the branch up out of his chest, split (a retry's start). */
export const layFlat = (s: Arena) => { s.tMode = 'flat'; s.tx = FIGHT_X; s.ty = GY; s.tFacing = -1; s.pose = 'flat'; s.face = 'out'; s.snapped = true; };

export const startEntrance = (state: GameState) => {
  const s = arenaOf(state);
  s.phase = 'entrance'; s.entrance = ENTRANCE_T;
  playSound('slam', 1, -8); playSound('alarm', 0.6, 14); shakeScreen(state, 10, 5);
  s.tMode = 'pop'; s.tx = FIGHT_X; s.ty = GY; s.tvy = -8; s.tvx = 0; s.tFacing = pmid(state) < s.tx ? -1 : 1; s.pose = 'pop'; s.face = 'yell';
  leafBurst(s, FIGHT_X, GY - 10, 18, 7, 50);
  tuckerBarks(state, s, TUCKER_ENTRANCE);
};
/** A frame of it (Meathead's free); true once it's over (he's up: the fight's on). */
export const tickEntrance = (state: GameState): boolean => {
  const s = arenaOf(state);
  tickTucker(s);
  if (--s.entrance > 0) return false;
  standUp(state, s);
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (screen space): the jumpscare (his screaming face snapped into yours, the branch through him), the SKIP; the
// entrance's flash

export const drawIntroHud = (c: Ctx, state: GameState) => {
  const s = arenaOf(state), f = state.frame, W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
  if (s.phase === 'fakeout' && s.step === 'pop') {
    const t = s.t;
    // (the woods dark behind his head, banded; his face, gross (the user's rule for every close-up: tuckerGross.ts);
    // the oak's leaves whipping across)
    drawTuckerGrossBack(c, W, H);
    drawTuckerGross(c, W / 2, H / 2 + 16, 1.06 - Math.min(0.06, t * 0.004), f, s.talking, Math.max(0.6, 7 - t * 0.25));
    for (let i = 0; i < 26; i++) {
      const k = ((t * 0.04 + hash(i + 50) * 3) % 1), x = (hash(i + 59) * W + t * (12 + hash(i + 54) * 14)) % (W + 80) - 40, y = H * k;
      c.save(); c.translate(x, y); c.rotate(t * 0.2 + i); c.fillStyle = ['#B45309', '#D97706', '#92400E', '#CA8A04'][i % 4]; c.beginPath(); c.ellipse(0, 0, 14, 7, 0, 0, Math.PI * 2); c.fill(); c.restore();
    }
    // (the snap: a white frame or two, then a red one)
    if (t < 3) { c.globalAlpha = 1 - t * 0.25; box(c, 0, 0, W, H, '#FFFFFF'); c.globalAlpha = 1; }
    else if (t < 6) { c.globalAlpha = 0.35; box(c, 0, 0, W, H, '#DC2626'); c.globalAlpha = 1; }
    if (s.said) saidOver(c, s.said, W / 2, H - 40, '#FDE68A', 360);
  }
  if (s.phase === 'entrance' && s.entrance > 86) { c.globalAlpha = 0.4; box(c, 0, 0, W, H, '#FFFFFF'); c.globalAlpha = 1; }
  if (s.phase === 'fakeout' && s.all > SKIP_AFTER) drawSkipPrompt(c, W);
};
