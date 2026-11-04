// TEST YOUR PLUNGE (the owner's: "the second toilet, you cannot shit on it until it is plunged. you get a 'test your
// plunge' minigame like mortal kombat. it alternates between a stardew valley fishing minigame where instead of lining
// a fish you line a turd. you gotta hold the button but release it strategically. it then alternates between accurate
// pressing and rapid pressing. after getting the 'success' meter all the way up, you win a charge shard in the toilet.
// you can then shit on it like normal. the announcer isn't too pleased about cleaning the clog." Then: "you gotta press
// 'up' to plunge the toilet, not down"; every minigame asks first, A to accept, B to go back: minigameConfirm.ts. Then
// (2026-11-03): "a special view of the action as you're doing it ... from behind plunging a toilet, his ass crack
// showing"; "it's like test your might from mortal kombat. the front of the toilet is seen while meathead is on his
// knees plunging it"; "before it starts an announcer who sounds like the death announcer goes 'TEST. YOUR. PLUNGE!'.
// one word shows up at a time with a beat between"; "the 'stardew valley' turd minigame is finicky"; "make it play
// suction sounds"; "the success bar should fill up a bit faster and gives more 'success bars' depending on how good
// you did ... double the amount if 'perfect'"; "hold it on the turd for at least 90 percent of the time to get a
// perfect ... because it won't be right at the very beginning"; "get it to the top or hit all 5. getting close will
// count somewhat. getting nothing won't count at all. have tiers of 'success'".)
//
// THE GODFATHER'S CLOG (stop 2's toilet), its stop's staff dead, not plunged yet: UP's prompt by it, PLUNGE IT
// (index.ts). UP: the ask (TEST YOUR PLUNGE? ACCEPT / BACK). Accepted: the whole screen goes to the close shot
// (plungeView.ts: him on his knees from behind, the toilet's front beyond him, every frame painted once), the player
// held (inCutscene: no HUD, no input to the world). THE INTRO: the death announcer's voice says TEST. YOUR. PLUNGE!, a
// word a clip with a beat between, each word up big only while it's said (no input; START skips the lot). Then the
// rounds go round in turn, one button for all of it (JUMP: its real button shown live up top, ui.chordTips):
//
//   THE TURD LINE   (Stardew's fishing bar) a turd drifts about a pipe; his bar rises while JUMP's held and falls when
//                   it's let go. The share of the round the turd's in the bar (counted from the first time it is, or a
//                   second in, whichever's first) is shown as it goes: 90% or more is PERFECT.
//   ON THE NOSE     a marker sweeps over a bar; press with it in the sweet spot. Five presses: all five hit is PERFECT.
//   MASH IT         mash JUMP to push the gauge to the top before the time's up (it sinks back on its own).
//
// Each round ends on a TIER, said big with its own sound, and SUCCESS fills by it there and then (the new segments
// flashing): PERFECT (double), GOOD (TIER_PAY.good), CLOSE (half that), NOTHING (takes a little back, drained red).
// There's no losing it outright (the meter never goes under 0). SUCCESS full: the clog blows clear, a CHARGE SHARD comes up out of the bowl (upgrades/state.ts: shards
// + 1, saved; kept in the save so it's never won twice: thrones.ts SHARD_ID), the card (the explain-screen buffer:
// CARD_HOLD frames, every button let go, then a fresh press). Then it's a toilet like the others.
//
// THE NUMBERS, old (sim'd, a decent bot ~35-40 s to fill) and now (a decent player GOOD, GOOD, PERFECT then a GOOD
// line: ~36 s; all PERFECT: full at the end of the first MASH IT, ~25 s):
//   the line's bar    BAR_H 0.26 -> 0.34 of the pipe; lift 0.0016 -> 0.0012 a frame held, fall 0.0016 -> 0.0011,
//                     top speed 0.028 -> 0.018, and a drag (x0.96 a frame) so it doesn't sail; floor bounce 0.35 -> 0.15
//   the turd          was: a new spot anywhere in the pipe every 30-100 frames, snapping to it (a quarter of the time in
//                     ~10 frames). Now: a spring to a spot within 0.3 of where it is, every 60-130 frames, its speed
//                     capped (0.009 a frame; a dash now and then 0.014); a calm first second; a hair of give round it
//   the payout        was LINE_GAIN 0.0009 a frame on it / LINE_DRAIN 0.00036 off it, TAP +0.055 / +0.035 / -0.03 a
//                     press, MASH +0.16 / -0.05. Now by tier, at the round's end: PERFECT 0.4, GOOD 0.2, CLOSE 0.1,
//                     NOTHING -0.1 (the owner: "the success meter can go down a bit if you do poorly"; never under 0). The line: >= 90% PERFECT, >= 65% GOOD, >= 35% CLOSE. On the nose: 5 hits PERFECT,
//                     3-4 GOOD, 1-2 CLOSE. Mash it: the top PERFECT, 70% up GOOD, 40% CLOSE.
//   on the nose       sweet spot half-widths 0.03 / 0.085 -> 0.04 / 0.1
//   mash it           a press 0.06 -> 0.07, the sink 0.0035 -> 0.0025 a frame, the line 80% -> the top (5 s)

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { pickLine, isTalking, silenceAll } from '../../../m1/game/platform/speech';
import { offerSkip, takeSkip, drawSkipPrompt, SKIP_AFTER } from '../../../m1/game/platform/skip';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { setUi, markCollectibleFound } from '../../store';
import { saveProgress } from '../../save';
import { shards, setShards, powerCells, MAX_SHARDS } from '../../upgrades/state';
import { openAsk, tickAsk, closeAsk, type Ask } from '../../minigameConfirm';
import { minigamePausable } from '../../minigamePause';
import type { GameCue } from '../../music/moments';
import { meatheadSays, speak, saidOver, box, type Said } from '../section';
import { byPants } from '../blvd/kinds';
import { throneAt, plunged, PLUNGED_MEMO, SHARD_LAND, SHARD_ID } from './thrones';
import { coasterOf, type Coaster } from './state';
import { drawPlungeView, dropPlungeFrames, viewBowl, type PlungePose, type PlungePants } from './plungeView';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
type Game = 'line' | 'tap' | 'mash';
type Phase = 'ask' | 'leave' | 'intro' | 'title' | Game | 'grade' | 'win' | 'card';
type Tier = 'perfect' | 'good' | 'close' | 'nothing';

/** Frames: a round's title; the turd line; a press's wait on the nose; MASH IT's time; a tier up (SUCCESS filling); the
 *  win (the geyser, the shard coming up) before the card; the card's buffer; the beat between the announcer's words. */
const TITLE_T = 70, LINE_T = 420, TAP_WAIT = 210, TAP_N = 5, MASH_T = 300, GRADE_T = 90, WIN_T = 110, CARD_HOLD = 90, WORD_GAP = 22;
/** SUCCESS (0..1) paid by a round's tier: PERFECT double GOOD, CLOSE half, NOTHING takes some back (never under 0). */
export const TIER_PAY: Record<Tier, number> = { perfect: 0.4, good: 0.2, close: 0.1, nothing: -0.1 };
const TIER_NAME: Record<Tier, string> = { perfect: 'PERFECT!', good: 'GOOD', close: 'CLOSE', nothing: 'NOTHING' };
/** The line's cut-offs (the share on the turd), on the nose's (hits of five), mash it's (how far up it got). */
const LINE_TIERS = [0.9, 0.65, 0.35], TAP_TIERS = [5, 3, 1], MASH_TIERS = [1, 0.7, 0.4];
const tierOf = (v: number, cuts: number[]): Tier => (v >= cuts[0] - 1e-6 ? 'perfect' : v >= cuts[1] - 1e-6 ? 'good' : v >= cuts[2] - 1e-6 ? 'close' : 'nothing');
/** The turd line's bar (a share of the pipe), its lift held, its fall let go, its top speed, its drag; the give round the
 *  turd; the frames before it counts whether or not he's found it. */
const BAR_H = 0.34, BAR_UP = 0.0012, BAR_DOWN = 0.0011, BAR_MAX = 0.018, BAR_DRAG = 0.96, GIVE = 0.02, LINE_GRACE = 60;
/** The turd: its spring to its spot, its damping, its top speed (a dash's). */
const TURD_K = 0.0035, TURD_DAMP = 0.9, TURD_MAX = 0.009, TURD_DASH = 0.014;
/** On the nose: the sweet spot's half-widths (perfect, good), the marker's first speed and its gain a press. */
const PERFECT_W = 0.04, GOOD_W = 0.1, TAP_SPEED = 0.016, TAP_SPEEDUP = 0.003;
/** MASH IT: a press's push, the sink a frame. */
const MASH_PUSH = 0.07, MASH_SINK = 0.0025;
const TITLES: Record<Game, string> = { line: 'THE TURD LINE', tap: 'ON THE NOSE', mash: 'MASH IT!' };
const TIPS: Record<Game, string> = { line: 'HOLD: BAR UP. LET GO: BAR DOWN', tap: 'PRESS IN THE SWEET SPOT', mash: 'MASH IT TO THE TOP!' };
const NEXT: Record<Game, Game> = { line: 'tap', tap: 'mash', mash: 'line' };

interface Plunge {
  phase: Phase; t: number; total: number; meter: number; game: Game;
  ask: Ask | null; prev: boolean; anyPrev: boolean; from: { x: number; y: number };
  /** The intro: the word being said (0..2), the word up (while it's said), the beat after one (frames left). */
  word: number; wordUp: string | null; wordGap: number; wordWaiting: boolean;
  /** The turd line: his bar (its foot, 0 bottom .. 1 top) and its speed; the turd, its speed, its spot, frames to a new
   *  one, its top speed now; on it now; frames counted, frames on it, counting yet. */
  bar: number; vb: number; turd: number; vt: number; target: number; retarget: number; cap: number; on: boolean;
  counted: number; onFrames: number; counting: boolean;
  /** On the nose: the marker, its way, its speed; the sweet spot's middle; presses made; frames waiting; how each went. */
  mark: number; dir: number; speed: number; spot: number; taps: number; tapT: number; marks: ('perfect' | 'good' | 'miss')[];
  /** A verdict up (PERFECT, GOOD, MISS), frames left. */
  flash: string | null; flashT: number; flashGood: boolean;
  /** MASH IT: the gauge, its best; done (frames since it ended). */
  gauge: number; peak: number; done: number;
  /** The round just graded: its tier, the meter before and after (the new segments flash). */
  tier: Tier; fillFrom: number; fillTo: number;
  /** His push (0..1, eased); the stroke's phase (holding on the line); the pose on show and when it came up; the
   *  shot's shake; the last grunt and gurgle (frames). */
  pump: number; stroke: number; pose: PlungePose; poseAt: number; shake: number; gruntAt: number; gurgleAt: number; lastPress: number; duringSaid: number;
  cardArmed: boolean;
}
const ALL = new WeakMap<Coaster, Plunge>();
export const plungeOf = (co: Coaster) => ALL.get(co) ?? null;
/** The music's (cues.ts): its own song from TEST YOUR PLUNGE! through the rounds (the ask's the land's), the sting as the
 *  clog blows (ringing on under the shard's card). */
export const plungeMusic = (co: Coaster): GameCue | null => {
  const ph = ALL.get(co)?.phase;
  if (!ph || ph === 'ask' || ph === 'leave' || ph === 'card') return null;
  return ph === 'win' ? { song: null, sting: 'game:plunge-win' } : { song: 'game:plunge' };
};
/** The Godfather's look (shrine.ts paintToilet): 2 plunged, 1 being plunged (he's got the plunger), 0 as ever. */
export const plungeLook = (state: GameState, co: Coaster) => { if (plunged(state)) return 2; const ph = ALL.get(co)?.phase; return ph && ph !== 'ask' && ph !== 'leave' ? 1 : 0; };

/** UP by the clog (index.ts, its prompt up): the ask first. */
export const startPlunge = (state: GameState, co: Coaster) => {
  const p = state.player;
  p.inCutscene = true;
  ALL.set(co, {
    phase: 'ask', t: 0, total: 0, meter: 0, game: 'line', ask: openAsk('TEST YOUR PLUNGE?', "THE GODFATHER'S CLOG HAS BEEN IN THERE SINCE 1994. PLUNGE IT CLEAR TO USE IT. NO DYING."),
    prev: true, anyPrev: true, from: { x: p.pos.x, y: p.pos.y },
    word: 0, wordUp: null, wordGap: 0, wordWaiting: false,
    bar: 0, vb: 0, turd: 0.5, vt: 0, target: 0.5, retarget: 0, cap: TURD_MAX, on: false, counted: 0, onFrames: 0, counting: false,
    mark: 0, dir: 1, speed: TAP_SPEED, spot: 0.5, taps: 0, tapT: 0, marks: [],
    flash: null, flashT: 0, flashGood: true, gauge: 0, peak: 0, done: 0,
    tier: 'nothing', fillFrom: 0, fillTo: 0,
    pump: 0, stroke: 0, pose: 'ready', poseAt: 0, shake: 0, gruntAt: -9999, gurgleAt: -9999, lastPress: -9999, duringSaid: 0, cardArmed: false,
  });
};

const toGame = (pg: Plunge, g: Game) => {
  pg.game = g; pg.phase = 'title'; pg.t = 0; pg.flash = null;
  if (g === 'line') { pg.bar = 0; pg.vb = 0; pg.turd = 0.45; pg.vt = 0; pg.target = 0.45; pg.retarget = 60; pg.counted = 0; pg.onFrames = 0; pg.counting = false; pg.on = false; }
  if (g === 'tap') { pg.taps = 0; pg.marks = []; pg.speed = TAP_SPEED; pg.mark = 0; pg.dir = 1; pg.tapT = 0; pg.spot = 0.25 + Math.random() * 0.5; }
  if (g === 'mash') { pg.gauge = 0; pg.peak = 0; pg.done = 0; }
};
const verdict = (pg: Plunge, text: string, good: boolean) => { pg.flash = text; pg.flashT = 40; pg.flashGood = good; };
/** A round over: its tier, said big, its sound, SUCCESS filled by it now. */
const grade = (state: GameState, pg: Plunge, tier: Tier) => {
  pg.tier = tier; pg.phase = 'grade'; pg.t = 0; pg.flash = null;
  pg.fillFrom = pg.meter; pg.meter = Math.max(0, Math.min(1, pg.meter + TIER_PAY[tier])); pg.fillTo = pg.meter;
  if (tier === 'perfect') { playSound('powerup', 0.9); playSound('ding', 0.8, 7); playSound('plunge_pop', 1, -6); pg.shake = 10; shakeScreen(state, 8, 6); }
  else if (tier === 'good') { playSound('ding', 0.8, 2); playSound('plunge_pop', 0.8, -2); pg.shake = 4; }
  else if (tier === 'close') { playSound('ding', 0.5, -5); playSound('plunge_gurgle', 0.6); }
  else { playSound('fart', 0.8, -6); playSound('plunge_gurgle', 0.7, -10); if (pg.fillTo < pg.fillFrom) { pg.shake = 5; shakeScreen(state, 4, 4); } }
};
/** A grunt, now and then (not over anybody). */
const grunt = (state: GameState, pg: Plunge) => {
  if (isTalking() || state.frame - pg.gruntAt < 540) return;
  pg.gruntAt = state.frame; meatheadSays(state, pickLine(byPants(state, L.PLUNGE_GRUNT)), false);
};
/** The bowl's mouth (world). */
const bowl = (g: ReturnType<typeof throneAt>) => ({ x: g.mx + 10, y: g.top - 31 });
const pantsOf = (state: GameState): PlungePants => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

const end = (state: GameState, co: Coaster) => {
  const p = state.player;
  ALL.delete(co); dropPlungeFrames();
  p.inCutscene = false; p.carried = false; p.spriteScaleY = undefined; p.isGrounded = true; p.vel.x = 0; p.vel.y = 0;
  setUi({ chordTips: null });
};

/** The intro's next word (the death announcer's), up while it's said; after the last, the rounds. */
const sayWord = (pg: Plunge) => {
  const w = L.ANNOUNCE_PLUNGE[pg.word];
  pg.wordWaiting = true;
  speak(L.PLUNGE_ANNOUNCER, w, s => { pg.wordUp = s ? w.replace('.', '') : null; }, true, () => {
    if (!pg.wordWaiting) return;
    pg.wordWaiting = false; pg.wordUp = null; pg.wordGap = WORD_GAP;
    playSound('thud', 0.5, -10);
  });
};
/** Into the rounds (the intro done or skipped): him, then the ride's narrator, in turn. */
const intoRounds = (state: GameState, pg: Plunge, pa: (line: string) => void) => {
  pg.wordUp = null; pg.wordWaiting = false;
  meatheadSays(state, pickLine(byPants(state, L.PLUNGE_START)), true);
  pa(pickLine(L.SPIEL_PLUNGE_START));
  toGame(pg, 'line');
};

/** The pose on show (plungeView.ts) for where it's at; the plunger's noises as he changes from one to the next. */
const poseFor = (state: GameState, pg: Plunge, held: boolean): PlungePose => {
  switch (pg.phase) {
    case 'intro': return 'ready';
    case 'title': return pg.t % 40 < 20 ? 'ready' : 'down';
    case 'line': {
      if (!held) return pg.on || !pg.counting ? 'ready' : ((pg.t >> 3) & 1 ? 'wobL' : 'wobR');
      const s = Math.sin(pg.stroke);
      if (!pg.on && pg.counting && Math.abs(s) < 0.6) return (pg.t >> 3) & 1 ? 'wobL' : 'wobR';
      return s > 0.3 ? 'down' : s < -0.3 ? 'up' : 'ready';
    }
    case 'tap':
      if (pg.flash && pg.flashT > 18) return pg.flash === 'PERFECT!' ? 'yank' : pg.flash === 'GOOD' ? 'up' : 'fail';
      return pg.mark > pg.spot - GOOD_W && pg.mark < pg.spot + GOOD_W ? 'down' : 'ready';
    case 'mash':
      if (pg.done > 0) return pg.peak >= 1 ? 'yank' : 'fail';
      if (state.frame - pg.lastPress < 5) return 'down';
      return state.frame - pg.lastPress < 14 ? 'up' : (pg.gauge > 0.5 ? ((pg.t >> 2) & 1 ? 'wobL' : 'wobR') : 'ready');
    case 'grade': return pg.t > 50 ? 'ready' : pg.tier === 'perfect' ? 'yank' : pg.tier === 'good' ? 'up' : pg.tier === 'close' ? 'wobL' : 'fail';
    case 'win': case 'card': return 'win';
    default: return 'ready';
  }
};
const poseSounds = (state: GameState, pg: Plunge, was: PlungePose, now: PlungePose, work: number) => {
  if (was === now) return;
  const v = 0.45 + 0.55 * Math.max(0, Math.min(1, work));
  if (now === 'down') { playSound('plunge_squelch', v, -2 - work * 3); pg.shake = Math.max(pg.shake, 1.5 + work * 2); }
  else if (now === 'up') playSound('plunge_pop', v * 0.85, 1 - work * 3);
  else if (now === 'yank') { playSound('plunge_pop', 1, -5); playSound('splat', 0.5, -8); pg.shake = Math.max(pg.shake, 6); }
  else if (now === 'fail') { playSound('poopsplat', 0.7, -2); playSound('splash', 0.5, -6); pg.shake = Math.max(pg.shake, 5); }
  else if ((now === 'wobL' || now === 'wobR') && (was === 'wobL' || was === 'wobR') && state.frame - pg.gurgleAt > 50) { pg.gurgleAt = state.frame; playSound('plunge_gurgle', 0.5 * v, -3); }
};

/** Each frame, while it's on (the ask, the game, the card): the controls to pass on (none), or null (not on). */
export const updatePlunge = (ctx: FrameContext, co: Coaster, controls: Controls, pa: (line: string) => void): Controls | null => {
  const pg = ALL.get(co);
  if (!pg) return null;
  const { state } = ctx, p = state.player, g = throneAt(1), b = bowl(g);
  p.inCutscene = true; p.vel.x = 0;
  // THE ASK: A to accept, B back (nothing changed)
  if (pg.phase === 'leave') {
    const any = !!(controls.jump || controls.shoot || controls.special || controls.secondary || controls.charge);
    if (!any || ++pg.t > 40) { ALL.delete(co); p.inCutscene = false; }
    return { ...NO_CONTROLS };
  }
  if (pg.phase === 'ask') {
    const r = tickAsk(pg.ask!, state.frame);
    // (back: nothing changed; held a moment till the button's let go, so the B that said no doesn't fire his special)
    if (r === 'back') { pg.phase = 'leave'; pg.t = 0; return { ...NO_CONTROLS }; }
    if (r === 'wait') return { ...NO_CONTROLS };
    // (accepted: the close shot, and the announcer's first word)
    pg.ask = null; pg.phase = 'intro'; pg.t = 0; pg.prev = true; pg.anyPrev = true; pg.word = 0;
    pg.from = { x: p.pos.x, y: p.pos.y };
    dropPlungeFrames(); silenceAll();
    playSound('thud', 0.8, -8); shakeScreen(state, 8, 6);
    sayWord(pg);
  }
  pg.t++; pg.total++;
  const held = !!controls.jump, press = held && !pg.prev; pg.prev = held;
  const anyHeld = !!(controls.jump || controls.shoot || controls.special || controls.secondary || controls.charge);
  const anyPress = anyHeld && !pg.anyPrev; pg.anyPrev = anyHeld;
  if (pg.flashT > 0 && --pg.flashT === 0) pg.flash = null;
  pg.shake *= 0.85;

  // Him (in the world, behind the shot): up on the plinth by the bowl, facing it, held there
  p.carried = true; p.vel.y = 0; p.facing = -1; p.isDucking = false; p.isCharging = false; p.isSliding = false;
  const sx = g.mx + 40 - p.width / 2, sy = g.top - p.height, k = Math.min(1, pg.total / 14);
  p.pos.x = pg.from.x + (sx - pg.from.x) * k; p.pos.y = pg.from.y + (sy - pg.from.y) * k - Math.sin(k * Math.PI) * 22;
  p.isGrounded = k >= 1;
  p.spriteScaleY = undefined;

  let push = 0, work = 0;
  switch (pg.phase) {
    case 'intro': {
      // TEST. YOUR. PLUNGE!: a word a clip, a beat between; START skips the lot
      if (pg.t > SKIP_AFTER) offerSkip();
      if ((pg.t > SKIP_AFTER && takeSkip()) || pg.t > 720) { silenceAll(); intoRounds(state, pg, pa); break; }
      if (!pg.wordWaiting && pg.wordGap > 0 && --pg.wordGap === 0) {
        if (++pg.word < L.ANNOUNCE_PLUNGE.length) sayWord(pg);
        else intoRounds(state, pg, pa);
      }
      break;
    }
    case 'title':
      push = 0.3 + 0.3 * Math.sin(pg.t * 0.2);
      if (pg.t === 1) playSound('ding', 0.6, 2);
      if (pg.t >= TITLE_T) { pg.phase = pg.game; pg.t = 0; }
      break;
    case 'line': {
      // (his bar: lifted while it's held, falling when it's let go, a drag on it so it never sails; a soft floor)
      pg.vb = Math.max(-BAR_MAX, Math.min(BAR_MAX, (pg.vb + (held ? BAR_UP : -BAR_DOWN)) * BAR_DRAG));
      pg.bar += pg.vb;
      if (pg.bar < 0) { pg.bar = 0; pg.vb = -pg.vb * 0.15; }
      if (pg.bar > 1 - BAR_H) { pg.bar = 1 - BAR_H; pg.vb = -Math.abs(pg.vb) * 0.15; }
      // (the turd: a calm first second, then sprung toward a spot not far off, its speed capped; now and then a dash)
      if (--pg.retarget <= 0) {
        pg.target = Math.max(0.1, Math.min(0.9, pg.turd + (Math.random() * 2 - 1) * 0.3));
        pg.retarget = 60 + Math.floor(Math.random() * 70);
        pg.cap = Math.random() < 0.15 ? TURD_DASH : TURD_MAX;
      }
      pg.vt = Math.max(-pg.cap, Math.min(pg.cap, (pg.vt + (pg.target - pg.turd) * TURD_K) * TURD_DAMP));
      pg.turd = Math.max(0.05, Math.min(0.95, pg.turd + pg.vt + Math.sin(pg.t * 0.21) * 0.0012));
      pg.on = pg.turd >= pg.bar - GIVE && pg.turd <= pg.bar + BAR_H + GIVE;
      // (the share on it: counted from the first time it's in the bar, or a second in)
      if (pg.on || pg.t > LINE_GRACE) pg.counting = true;
      if (pg.counting) { pg.counted++; if (pg.on) pg.onFrames++; }
      if (held) pg.stroke += 0.22;
      work = held ? (pg.on ? 1 : 0.6) : 0.1;
      push = held ? 0.6 + 0.4 * Math.abs(Math.sin(pg.t * 0.25)) : 0.15;
      // (the clog shifting down in there as the turd goes: a gurgle the faster it's going)
      if (Math.abs(pg.vt) > 0.006 && state.frame - pg.gurgleAt > 45) { pg.gurgleAt = state.frame; playSound('plunge_gurgle', 0.3 + Math.abs(pg.vt) * 40, -2 + Math.random() * 3); }
      if (pg.on && pg.t % 120 === 60) grunt(state, pg);
      if (pg.t >= LINE_T) grade(state, pg, tierOf(pg.counted ? pg.onFrames / pg.counted : 0, LINE_TIERS));
      break;
    }
    case 'tap': {
      if (pg.taps >= TAP_N) { if (pg.flashT <= 0) { const hits = pg.marks.filter(m => m !== 'miss').length; grade(state, pg, tierOf(hits, TAP_TIERS)); } break; }
      if (pg.flash && pg.flashT > 20) { push = pg.flashGood ? 1 : 0.2; break; } // (a beat on the verdict)
      pg.mark += pg.dir * pg.speed;
      if (pg.mark > 1) { pg.mark = 1; pg.dir = -1; }
      if (pg.mark < 0) { pg.mark = 0; pg.dir = 1; }
      pg.tapT++;
      let v: 'perfect' | 'good' | 'miss' | null = null;
      if (press) { const d = Math.abs(pg.mark - pg.spot); v = d <= PERFECT_W ? 'perfect' : d <= GOOD_W ? 'good' : 'miss'; }
      else if (pg.tapT > TAP_WAIT) v = 'miss';
      if (v) {
        pg.marks.push(v); pg.taps++; pg.tapT = 0; pg.speed += TAP_SPEEDUP; pg.spot = 0.15 + Math.random() * 0.7;
        if (v === 'perfect') { verdict(pg, 'PERFECT!', true); pg.shake = 6; shakeScreen(state, 4, 3); grunt(state, pg); }
        else if (v === 'good') { verdict(pg, 'GOOD', true); pg.shake = 3; }
        else { verdict(pg, 'MISS', false); playSound('fart', 0.4, 8); }
      }
      work = 0.7; push = 0.2;
      break;
    }
    case 'mash': {
      if (pg.done > 0) { if (++pg.done > 40) grade(state, pg, tierOf(pg.peak, MASH_TIERS)); push = pg.peak >= 1 ? 1 : 0.1; break; }
      if (press) { pg.gauge = Math.min(1, pg.gauge + MASH_PUSH); pg.pump = 1; pg.shake = 2; pg.lastPress = state.frame; }
      pg.gauge = Math.max(0, pg.gauge - MASH_SINK);
      pg.peak = Math.max(pg.peak, pg.gauge);
      work = 0.4 + pg.gauge * 0.6;
      push = press ? 1 : pg.pump * 0.9;
      if (pg.gauge >= 1 - 1e-6) { pg.peak = 1; verdict(pg, 'TO THE TOP!', true); pg.done = 1; pg.shake = 10; playSound('glug', 1, -10); shakeScreen(state, 10, 8); grunt(state, pg); }
      else if (pg.t >= MASH_T) { verdict(pg, "TIME'S UP!", false); pg.done = 1; }
      break;
    }
    case 'grade': {
      if (pg.t >= GRADE_T) { if (pg.meter >= 1) { pg.phase = 'win'; pg.t = 0; } else toGame(pg, NEXT[pg.game]); }
      break;
    }
    case 'win': {
      push = 0;
      if (pg.t === 1) {
        // THE CLOG BLOWS CLEAR: and up comes the shard (his for good: saved there and then)
        state.stageMemo[PLUNGED_MEMO] = '1';
        setShards(shards() + 1); markCollectibleFound(SHARD_LAND, SHARD_ID); saveProgress();
        playSound('boom', 0.7, -10); playSound('poopsplat', 1, -6); playSound('splash', 1, -10); playSound('plunge_gurgle', 1, -8);
        shakeScreen(state, 22, 14); pg.shake = 14;
        setUi({ chordTips: null });
        meatheadSays(state, pickLine(byPants(state, L.PLUNGE_WIN)), true);
        pa(pickLine(L.SPIEL_PLUNGE_WIN));
      }
      if (pg.t < 70 && pg.t % 2 === 0) {
        // (the geyser in the world too: brown, green, paper, a chunk of 1994)
        for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: b.x + (Math.random() - 0.5) * 14, y: b.y - 4 }, vel: { x: (Math.random() - 0.5) * 7, y: -9 - Math.random() * 10 * (1 - pg.t / 90) }, life: 50 + Math.random() * 40, color: ['#5C3A16', '#78350F', '#3F2A10', '#5E5628', '#84CC16', '#F4F0E6'][(i + pg.t) % 6], size: 3 + Math.random() * 5, grav: 0.4 });
      }
      if (pg.t === 60) playSound('powerup', 0.8);
      if (pg.t >= WIN_T) { pg.phase = 'card'; pg.t = 0; pg.cardArmed = false; }
      break;
    }
    case 'card': {
      // (the explain screens' buffer: CARD_HOLD frames, every button let go once, then a fresh press)
      if (!pg.cardArmed && pg.t > CARD_HOLD && !anyHeld) pg.cardArmed = true;
      if (pg.cardArmed && anyPress) { end(state, co); pa(pickLine(L.SPIEL_PLUNGE_AFTER)); return { ...NO_CONTROLS }; }
      break;
    }
  }
  pg.pump += (push - pg.pump) * 0.35;
  // (the shot's pose, and the plunger's noises as it changes)
  const pose = poseFor(state, pg, held);
  if (pose !== pg.pose) { poseSounds(state, pg, pg.pose, pose, work); pg.pose = pose; pg.poseAt = state.frame; }
  // (the ride's narrator, annoyed, partway in: he'll be the one mopping up)
  if ((pg.phase === 'line' || pg.phase === 'tap' || pg.phase === 'mash') && pg.duringSaid < 2 && pg.total > 900 + pg.duringSaid * 1000 && !isTalking()) { pg.duringSaid++; pa(pickLine(byPants(state, L.SPIEL_PLUNGE_DURING))); }
  // (the one button, shown up top live while a round's on)
  const tipOn = pg.phase === 'title' || pg.phase === 'line' || pg.phase === 'tap' || pg.phase === 'mash' || pg.phase === 'grade';
  // (START pauses it, the pause menu showing its controls: minigamePause.ts; not on the ask, the intro (START skips it)
  // or the shard's card)
  if (tipOn || pg.phase === 'win') minigamePausable(state, 'plunge', quitPlunge);
  const tipGame = pg.phase === 'title' || pg.phase === 'grade' ? pg.game : pg.phase as Game;
  setUi({ chordTips: tipOn ? [{ pad: ['A'], kb: ['@jump'], label: TIPS[tipGame] }] : null });
  return { ...NO_CONTROLS };
};

/** QUIT MINIGAME (the pause menu: minigamePause.ts): off the plinth, back where he stood, the clog still in there (try
 *  again whenever). Quit on the win (the clog's blown, the shard's his already: saved at its first frame): it ends as
 *  the card would, the shard kept. */
const quitPlunge = (state: GameState) => {
  const co = coasterOf(state), pg = ALL.get(co);
  if (!pg) return;
  silenceAll();
  if (pg.phase === 'win' || pg.phase === 'card') { end(state, co); return; }
  const p = state.player;
  p.carried = false; p.spriteScaleY = undefined; p.isGrounded = true; p.vel.x = 0; p.vel.y = 0;
  p.pos.x = pg.from.x; p.pos.y = pg.from.y;
  setUi({ chordTips: null });
  dropPlungeFrames();
  // (held till the button's let go, as the ask's back is)
  pg.phase = 'leave'; pg.t = 0; pg.wordUp = null; pg.wordWaiting = false; pg.flash = null;
};

/** Stop the lot (the stage going away under it). */
export const dropPlunge = (co: Coaster) => { if (ALL.get(co)?.phase === 'ask') closeAsk(); ALL.delete(co); dropPlungeFrames(); };

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const INK = '#1C1014';
const GOLD = ['#5A3A06', '#8A5A0A', '#C08414', '#E8B420', '#FDE047', '#FFF6C0'];
const POO = ['#1E1006', '#3A220C', '#5C3A16', '#7A4E1E', '#9A6A2E', '#BC8A48'];
const txt = (c: Ctx, s: string, x: number, y: number, size: number, col: string, shadow = '#000000', align: CanvasTextAlign = 'center') => {
  c.font = `${size}px "Press Start 2P"`; c.textAlign = align;
  c.fillStyle = shadow; c.fillText(s, x + Math.max(1, size / 8), y + Math.max(1, size / 8));
  c.fillStyle = col; c.fillText(s, x, y);
  c.textAlign = 'left';
};
/** Big title text: inked all round, a drop shadow, a gold face banded light to dark down it (MK's). */
const bigTxt = (c: Ctx, s: string, x: number, y: number, size: number, face: string[] = [GOLD[5], GOLD[4], GOLD[3], GOLD[2]]) => {
  c.font = `${size}px "Press Start 2P"`; c.textAlign = 'center';
  const o = Math.max(2, Math.round(size / 10));
  c.fillStyle = '#000000'; c.fillText(s, x + o * 1.5, y + o * 1.5);
  c.fillStyle = INK; for (const [dx, dy] of [[-o, 0], [o, 0], [0, -o], [0, o], [-o, -o], [o, o], [-o, o], [o, -o]]) c.fillText(s, x + dx, y + dy);
  const m = c.measureText(s), top = y - size, step = size / face.length;
  for (let k = 0; k < face.length; k++) { c.save(); c.beginPath(); c.rect(x - m.width, top + k * step, m.width * 2, step + 1); c.clip(); c.fillStyle = face[k]; c.fillText(s, x, y); c.restore(); }
  c.textAlign = 'left';
};
/** A framed panel: ink, a gold bevel, a navy body banded darker toward its foot, rivets at the corners. */
const frame = (c: Ctx, x: number, y: number, w: number, h: number) => {
  box(c, x - 4, y - 4, w + 8, h + 8, INK);
  box(c, x - 3, y - 3, w + 6, h + 6, GOLD[2]); box(c, x - 3, y - 3, w + 6, 1, GOLD[4]); box(c, x - 3, y - 3, 1, h + 6, GOLD[4]);
  box(c, x - 3, y + h + 2, w + 6, 1, GOLD[0]); box(c, x + w + 2, y - 3, 1, h + 6, GOLD[0]);
  box(c, x - 1, y - 1, w + 2, h + 2, INK);
  const B = ['#1E1B4B', '#1A1740', '#161334', '#110F28'];
  for (let k = 0; k < 4; k++) box(c, x, y + (h * k) / 4, w, h / 4 + 1, B[k]);
  for (const [rx, ry] of [[x + 3, y + 3], [x + w - 6, y + 3], [x + 3, y + h - 6], [x + w - 6, y + h - 6]]) { box(c, rx, ry, 3, 3, GOLD[1]); box(c, rx, ry, 1, 1, GOLD[5]); }
};
/** A turd (the line's): three coils stepped, lit, a glint, a fly or two. */
const turd = (c: Ctx, x: number, y: number, f: number) => {
  const ell = (ex: number, ey: number, rx: number, ry: number, col: string) => { c.fillStyle = col; c.beginPath(); c.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2); c.fill(); };
  for (const [dx, dy, rx, ry] of [[0, 5, 11, 5], [1, 0, 8, 4.5], [0, -5, 5, 3.5]] as const) { ell(x + dx, y + dy, rx + 1.5, ry + 1.5, INK); }
  for (const [dx, dy, rx, ry] of [[0, 5, 11, 5], [1, 0, 8, 4.5], [0, -5, 5, 3.5]] as const) { ell(x + dx, y + dy, rx, ry, POO[2]); ell(x + dx - rx * 0.2, y + dy - ry * 0.3, rx * 0.6, ry * 0.5, POO[3]); box(c, x + dx - rx * 0.5, y + dy - ry * 0.6, 2, 1, POO[5]); }
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 2, y - 8); c.quadraticCurveTo(x + 1, y - 14, x + 4, y - 11); c.lineTo(x + 2, y - 7); c.fill();
  box(c, x + 1, y - 11, 2, 2, POO[4]);
  const a = f * 0.3; box(c, x + Math.cos(a) * 15, y - 10 + Math.sin(a * 1.3) * 5, 2, 2, INK);
};
/** The SUCCESS meter, MK's might meter: standing tall up the left side, segments banded red to gold to green up it, the
 *  ones a tier's just paid flashing (white on a PERFECT, bigger), a shine down its left. */
const SEG = 20;
const meterTall = (c: Ctx, pg: Plunge, f: number) => {
  const x = 22, w = 40, y = 96, h = 420;
  box(c, x - 6, y - 30, w + 12, h + 40, INK); box(c, x - 4, y - 28, w + 8, h + 36, GOLD[2]); box(c, x - 4, y - 28, w + 8, 1, GOLD[4]); box(c, x - 2, y - 2, w + 4, h + 4, INK);
  txt(c, 'SUCCESS', x + w / 2, y - 12, 7, '#FFF6C0', '#000000');
  // (the meter shown: filling up to what's paid over the tier's first moments)
  const fillK = pg.phase === 'grade' ? Math.min(1, pg.t / 30) : 1;
  const shown = pg.phase === 'grade' ? pg.fillFrom + (pg.fillTo - pg.fillFrom) * fillK : pg.meter;
  const sh = h / SEG, perfect = pg.phase === 'grade' && pg.tier === 'perfect';
  for (let i = 0; i < SEG; i++) {
    const lo = i / SEG, on = (i + 1) / SEG <= shown + 1e-6, part = !on && lo < shown;
    const u = i / (SEG - 1), col = u < 0.35 ? ['#7F1D1D', '#DC2626', '#FCA5A5'] : u < 0.7 ? ['#854D0E', '#EAB308', '#FEF08A'] : ['#14532D', '#22C55E', '#BBF7D0'];
    const sy = y + h - (i + 1) * sh + 1;
    if (on || part) {
      const hh = part ? Math.max(2, (shown - lo) * SEG * (sh - 2)) : sh - 2;
      const yy = sy + (sh - 2 - hh);
      box(c, x + 1, yy, w - 2, hh, col[0]); box(c, x + 1, yy, w - 8, hh, col[1]); box(c, x + 3, yy, 3, hh, col[2]);
      // (just paid: flashing)
      const fresh = pg.phase === 'grade' && lo >= pg.fillFrom - 1e-6 && lo < pg.fillTo - 1e-6;
      if (fresh && (f >> (perfect ? 1 : 2)) % 2 === 0) box(c, x + 1, yy, w - 2, hh, perfect ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)');
    } else {
      box(c, x + 1, sy, w - 2, sh - 2, '#18181B');
      // (just lost: drained, flashing red)
      if (pg.phase === 'grade' && pg.fillTo < pg.fillFrom && lo >= pg.fillTo - 1e-6 && lo < pg.fillFrom - 1e-6 && (f >> 2) % 2 === 0) box(c, x + 1, sy, w - 2, sh - 2, 'rgba(239, 68, 68, 0.75)');
    }
  }
  if (perfect && pg.t < 50) { const r = 10 + (pg.t % 10); c.strokeStyle = `rgba(255, 246, 192, ${1 - (pg.t % 10) / 10})`; c.lineWidth = 2; c.strokeRect(x - 2 - r * 0.3, y + h * (1 - pg.fillTo) - r * 0.3, w + 4 + r * 0.6, h * (pg.fillTo - pg.fillFrom) + r * 0.6); }
};
/** The charge shard: a crystal, stepped gold-white, a bolt in it, its glow banded. */
export const drawShardGem = (c: Ctx, x: number, y: number, s: number, f: number) => {
  const w = Math.abs(Math.cos(f * 0.08)) * 0.7 + 0.3;
  for (const [r, a] of [[26, 0.12], [18, 0.16], [11, 0.2]] as const) { c.fillStyle = `rgba(253, 224, 71, ${a})`; c.beginPath(); c.arc(x, y, r * s, 0, Math.PI * 2); c.fill(); }
  const pts = (k: number) => { c.beginPath(); c.moveTo(x, y - 16 * s * k); c.lineTo(x + 8 * s * w * k, y - 4 * s * k); c.lineTo(x + 5 * s * w * k, y + 14 * s * k); c.lineTo(x - 5 * s * w * k, y + 14 * s * k); c.lineTo(x - 8 * s * w * k, y - 4 * s * k); c.closePath(); };
  pts(1.15); c.fillStyle = INK; c.fill();
  pts(1); c.fillStyle = '#EAB308'; c.fill();
  c.save(); pts(1); c.clip();
  box(c, x - 8 * s, y - 16 * s, 8 * s * w, 32 * s, '#FDE047'); box(c, x - 6 * s * w, y - 12 * s, 3 * s, 20 * s, '#FFF9DB');
  box(c, x + 3 * s * w, y - 16 * s, 6 * s, 32 * s, '#A16207');
  c.restore();
  c.strokeStyle = '#FFFFFF'; c.lineWidth = Math.max(1, 1.5 * s); c.beginPath(); c.moveTo(x + 2 * s * w, y - 8 * s); c.lineTo(x - 2 * s * w, y + 1 * s); c.lineTo(x + 2 * s * w, y + 1 * s); c.lineTo(x - 2 * s * w, y + 10 * s); c.stroke();
  if (f % 30 < 4) { box(c, x - 1, y - 22 * s, 2, 6 * s, '#FFFFFF'); box(c, x - 3 * s, y - 19 * s, 6 * s, 2, '#FFFFFF'); }
};

/** In the world: nothing now (the close shot covers the screen while it's on: drawPlungeHud). Kept for index.ts. */
export const drawPlungeWorld = (_c: Ctx, _state: GameState, _co: Coaster) => { /* the close shot has it */ };

/** Over everything (the HUD's pass): the close shot, the might meter, the round's panel, the tier, the card. True while
 *  it's up. */
export const drawPlungeHud = (c: Ctx, state: GameState, co: Coaster, pa: Said | null): boolean => {
  const pg = ALL.get(co);
  if (!pg || pg.phase === 'ask' || pg.phase === 'leave') return false;
  const f = state.frame;
  // THE SHOT: the whole screen
  drawPlungeView(c, pg.pose, pantsOf(state), f, pg.shake);
  if (pg.phase === 'win' && pg.t > 30) {
    const u = Math.min(1, (pg.t - 30) / 40), [bx, by] = viewBowl();
    drawShardGem(c, bx, by - 30 - 170 * (1 - (1 - u) * (1 - u)), 2, f);
  }
  // (his words, over his head in the shot; the ride's narrator's, low and whole)
  if (state.playerVulgarityTimer > 0 && state.playerLastVulgarity) saidOver(c, state.playerLastVulgarity, 300, 182, '#FFFFFF', 300);
  if (pa) saidOver(c, pa.text, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 22, '#FDE68A', 520);
  if (pg.phase === 'card') { drawCard(c, f, pg.cardArmed); return true; }
  // THE INTRO: each word big in the middle while it's said
  if (pg.phase === 'intro') {
    if (pg.wordUp) {
      const big = pg.wordUp.startsWith('PLUNGE') ? 52 : 44;
      bigTxt(c, pg.wordUp, CANVAS_WIDTH / 2, 250, big, pg.wordUp.startsWith('PLUNGE') ? ['#FFFFFF', '#FCA5A5', '#EF4444', '#991B1B'] : undefined);
    }
    if (pg.t > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
    return true;
  }
  meterTall(c, pg, f);
  // The round's panel, up the right side
  const PW = 184, PH = 390, px = CANVAS_WIDTH - PW - 18, py = 96;
  frame(c, px, py, PW, PH);
  const mid = px + PW / 2, top = py + 44;
  txt(c, TITLES[pg.game], mid, py + 22, 9, '#FDE047', '#7F1D1D');
  box(c, px + 10, py + 32, PW - 20, 2, GOLD[1]); box(c, px + 10, py + 32, PW - 20, 1, GOLD[3]);
  if (pg.phase === 'title') {
    const k = Math.min(1, pg.t / 10);
    txt(c, 'NEXT:', mid, top + 110, 8, '#A1A1AA');
    c.save(); c.translate(mid, top + 140); c.scale(2 - k, 2 - k); txt(c, TITLES[pg.game], 0, 0, 10, '#FDE047', '#7F1D1D'); c.restore();
    txt(c, pg.game === 'line' ? 'KEEP THE TURD' : pg.game === 'tap' ? 'HIT ALL 5' : 'MASH IT TO', mid, top + 190, 7, '#E4E4E7');
    txt(c, pg.game === 'line' ? 'IN THE BAR' : pg.game === 'tap' ? 'FOR A PERFECT' : 'THE TOP', mid, top + 206, 7, '#E4E4E7');
    txt(c, pg.game === 'line' ? '90% FOR A PERFECT' : '', mid, top + 222, 7, '#E4E4E7');
  } else if (pg.phase === 'line' || (pg.phase === 'grade' && pg.game === 'line')) drawLine(c, pg, mid, top, f);
  else if (pg.phase === 'tap' || (pg.phase === 'grade' && pg.game === 'tap')) drawTap(c, pg, px, top, PW, f);
  else if (pg.phase === 'mash' || (pg.phase === 'grade' && pg.game === 'mash')) drawMash(c, pg, mid, top, f);
  else if (pg.phase === 'win') {
    const s = 1 + 0.15 * Math.sin(pg.t * 0.4);
    c.save(); c.translate(mid, top + 150); c.scale(s, s); txt(c, 'UNCLOGGED!', 0, 0, 12, '#86EFAC', '#14532D'); c.restore();
  }
  // (a press's verdict, in the panel)
  if (pg.flash && pg.phase !== 'grade') txt(c, pg.flash, mid, py + PH - 18, 10, pg.flashGood ? '#FDE047' : '#F87171', '#000000');
  // THE TIER: big over the shot as it's paid
  if (pg.phase === 'grade') {
    const k = Math.min(1, pg.t / 8), s = 1.8 - 0.8 * k + (pg.tier === 'perfect' ? 0.06 * Math.sin(pg.t * 0.5) : 0);
    const face = pg.tier === 'perfect' ? ['#FFFFFF', '#FFF6C0', '#FDE047', '#EAB308'] : pg.tier === 'good' ? ['#DCFCE7', '#86EFAC', '#22C55E', '#15803D'] : pg.tier === 'close' ? ['#FFEDD5', '#FDBA74', '#F97316', '#C2410C'] : ['#E4E4E7', '#A1A1AA', '#71717A', '#3F3F46'];
    c.save(); c.translate(320, 92); c.scale(s, s); bigTxt(c, TIER_NAME[pg.tier], 0, 0, pg.tier === 'perfect' ? 30 : 24, face); c.restore();
    const paid = Math.round(TIER_PAY[pg.tier] * SEG);
    const lost = Math.round((pg.fillFrom - pg.fillTo) * SEG);
    txt(c, paid > 0 ? `+${paid} SUCCESS${pg.tier === 'perfect' ? '  x2!' : ''}` : lost > 0 ? `-${lost} SUCCESS` : 'NO SUCCESS', 320, 122, 9, paid > 0 ? '#FFF6C0' : '#F87171', '#000000');
  }
  return true;
};

/** The turd line: the pipe (sewer water banded down it), his bar (green, lit along its top), the turd; the share on it
 *  so far (green at 90% and up: on for a PERFECT), time left. */
const drawLine = (c: Ctx, pg: Plunge, mid: number, top: number, f: number) => {
  const tw = 46, th = 250, tx = mid - tw / 2 - 22, ty = top + 8;
  box(c, tx - 3, ty - 3, tw + 6, th + 6, INK);
  const W = ['#3A3A1A', '#45441E', '#504E22', '#5B5826'];
  for (let k = 0; k < 4; k++) box(c, tx, ty + (th * k) / 4, tw, th / 4 + 1, W[3 - k]);
  for (let k = 0; k < 6; k++) { const yy = ty + ((f * 0.6 + k * 33) % th); box(c, tx + 4 + ((k * 13) % (tw - 8)), yy, 2, 2, '#6E6A30'); }
  box(c, tx - 3, ty - 3, 3, th + 6, '#71717A'); box(c, tx + tw, ty - 3, 3, th + 6, '#3F3F46');
  const by = ty + th * (1 - pg.bar - BAR_H), bh = th * BAR_H, col = pg.on ? ['#15803D', '#22C55E', '#BBF7D0'] : ['#14532D', '#16A34A', '#86EFAC'];
  c.globalAlpha = 0.8; box(c, tx + 2, by, tw - 4, bh, col[0]); box(c, tx + 4, by + 2, tw - 8, bh - 4, col[1]); c.globalAlpha = 1;
  box(c, tx + 2, by, tw - 4, 2, col[2]); box(c, tx + 2, by + bh - 2, tw - 4, 2, col[0]);
  turd(c, tx + tw / 2, ty + th * (1 - pg.turd), f);
  const left = 1 - Math.min(1, pg.t / LINE_T), gx = mid + 34;
  box(c, gx - 1, ty - 1, 10, th + 2, INK); box(c, gx, ty + th * (1 - left), 8, th * left, '#A78BFA'); box(c, gx, ty + th * (1 - left), 2, th * left, '#DDD6FE');
  // (on it: the share, from the first time it was)
  if (pg.counting) {
    const share = pg.counted ? pg.onFrames / pg.counted : 0, pct = Math.round(share * 100);
    txt(c, `ON IT ${pct}%`, mid, ty + th + 24, 9, share >= 0.9 ? '#86EFAC' : share >= 0.65 ? '#FDE047' : '#F87171');
    txt(c, share >= 0.9 ? 'PERFECT PACE' : '90% = PERFECT', mid, ty + th + 40, 6, share >= 0.9 ? '#BBF7D0' : '#A1A1AA');
  } else if (f % 20 < 14) txt(c, 'FIND THE TURD!', mid, ty + th + 24, 8, '#FFFFFF');
};
/** On the nose: the bar (red, the good zone, the perfect middle), the marker, the presses so far. */
const drawTap = (c: Ctx, pg: Plunge, px: number, top: number, PW: number, f: number) => {
  const bw = PW - 28, bx = px + 14, by = top + 80, bh = 30;
  box(c, bx - 3, by - 3, bw + 6, bh + 6, INK);
  for (let k = 0; k < 3; k++) box(c, bx, by + k * 10, bw, 10, ['#991B1B', '#7F1D1D', '#5F1414'][k]);
  const gz = bx + bw * (pg.spot - GOOD_W), pz = bx + bw * (pg.spot - PERFECT_W);
  box(c, gz, by, bw * GOOD_W * 2, bh, '#CA8A04'); box(c, gz, by, bw * GOOD_W * 2, 3, '#FDE047');
  box(c, pz, by, bw * PERFECT_W * 2, bh, '#16A34A'); box(c, pz, by, bw * PERFECT_W * 2, 3, '#86EFAC');
  const mx = bx + bw * pg.mark;
  box(c, mx - 2, by - 10, 4, bh + 20, INK); box(c, mx - 1, by - 9, 2, bh + 18, '#FFFFFF');
  c.fillStyle = INK; c.beginPath(); c.moveTo(mx - 7, by - 16); c.lineTo(mx + 7, by - 16); c.lineTo(mx, by - 7); c.fill();
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(mx - 5, by - 15); c.lineTo(mx + 5, by - 15); c.lineTo(mx, by - 9); c.fill();
  // (the presses: a plunger cup each, filled by how it went)
  for (let i = 0; i < TAP_N; i++) {
    const cx = px + PW / 2 + (i - 2) * 30, cy = by + 90, m = pg.marks[i];
    const col = m === 'perfect' ? '#22C55E' : m === 'good' ? '#EAB308' : m === 'miss' ? '#52525B' : '#27272A';
    c.fillStyle = INK; c.beginPath(); c.moveTo(cx - 11, cy + 1); c.quadraticCurveTo(cx, cy - 15, cx + 11, cy + 1); c.fill();
    c.fillStyle = col; c.beginPath(); c.moveTo(cx - 9, cy); c.quadraticCurveTo(cx, cy - 12, cx + 9, cy); c.fill();
    if (m === 'miss') { box(c, cx - 5, cy - 7, 10, 2, '#F87171'); }
  }
  const hits = pg.marks.filter(m => m !== 'miss').length;
  txt(c, `HITS ${hits} / ${TAP_N}`, px + PW / 2, by + 130, 9, hits === pg.marks.length ? '#86EFAC' : '#FDE047');
  txt(c, 'ALL 5 = PERFECT', px + PW / 2, by + 148, 6, '#A1A1AA');
  void f;
};
/** MASH IT: the gauge (banded up as it fills), its tier marks (CLOSE, GOOD, the top), time left. */
const drawMash = (c: Ctx, pg: Plunge, mid: number, top: number, f: number) => {
  const gw = 46, gh = 250, gx = mid - gw / 2 - 22, gy = top + 12;
  box(c, gx - 3, gy - 3, gw + 6, gh + 6, INK); box(c, gx, gy, gw, gh, '#18181B');
  const fh = gh * pg.gauge, R = ['#7F1D1D', '#B91C1C', '#EA580C', '#EAB308', '#FDE047'];
  for (let k = 0; k < 5; k++) { const y0 = gy + gh - fh * (k + 1) / 5; box(c, gx + 2, y0, gw - 4, fh / 5 + 1, R[k]); }
  if (fh > 2) box(c, gx + 2, gy + gh - fh, gw - 4, 2, '#FFF6C0');
  box(c, gx + 4, gy + gh - fh, 3, fh, 'rgba(255,255,255,0.25)');
  // (its best so far, a tick)
  box(c, gx - 4, gy + gh * (1 - pg.peak) - 1, 6, 2, '#FFFFFF');
  for (const [v, s, col] of [[MASH_TIERS[2], 'CLOSE', '#FDBA74'], [MASH_TIERS[1], 'GOOD', '#86EFAC']] as const) { const ly = gy + gh * (1 - v); box(c, gx, ly, gw, 1, col); txt(c, s, gx + gw + 4, ly + 3, 5, col, '#000000', 'left'); }
  box(c, gx - 6, gy - 1, gw + 12, 3, f % 10 < 5 ? '#FFFFFF' : '#FDE047');
  txt(c, 'TOP!', gx + gw / 2, gy - 8, 7, '#FDE047');
  const left = Math.max(0, 1 - pg.t / MASH_T), tx = mid + 40;
  box(c, tx - 1, gy - 1, 10, gh + 2, INK); box(c, tx, gy + gh * (1 - left), 8, gh * left, '#A78BFA');
  if (!pg.done && pg.phase === 'mash' && f % 12 < 8) txt(c, 'MASH!', mid - 10, gy + gh + 24, 10, '#FFFFFF', '#7F1D1D');
};
/** The card: YOU GOT A CHARGE SHARD, how many of how many, what's next; PRESS ANY BUTTON once it's armed. */
const drawCard = (c: Ctx, f: number, armed: boolean) => {
  const w = 460, h = 220, x = (CANVAS_WIDTH - w) / 2, y = 190;
  frame(c, x, y, w, h);
  const n = shards(), toNext = 3 - (n % 3), cells = powerCells();
  txt(c, 'YOU GOT', CANVAS_WIDTH / 2, y + 26, 9, GOLD[4]);
  txt(c, 'A CHARGE SHARD!', CANVAS_WIDTH / 2, y + 52, 16, '#FFFFFF', '#7F1D1D');
  drawShardGem(c, x + 58, y + 120, 1.4, f);
  drawShardGem(c, x + w - 58, y + 120, 1.4, f + 40);
  txt(c, `CHARGE SHARDS: ${n} / ${MAX_SHARDS}`, CANVAS_WIDTH / 2, y + 96, 9, '#FDE047');
  const next = n >= MAX_SHARDS ? 'EVERY SHARD FOUND!' : n % 3 === 0 ? `A NEW POWER CELL! ${cells} CELLS NOW` : `${toNext} MORE TO THE NEXT POWER CELL`;
  txt(c, next, CANVAS_WIDTH / 2, y + 122, 8, '#E4E4E7');
  txt(c, 'EVERY 3 YOU FIND MAKE', CANVAS_WIDTH / 2, y + 146, 7, '#A1A1AA');
  txt(c, 'ANOTHER POWER CELL', CANVAS_WIDTH / 2, y + 160, 7, '#A1A1AA');
  if (armed && f % 40 < 28) txt(c, 'PRESS ANY BUTTON', CANVAS_WIDTH / 2, y + h - 18, 8, '#D4D4D8');
};
