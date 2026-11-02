// MONSTER MASH (the owner's: "spooky land: there's a kid at the arcade. he challenges you to a game of "monster mash"
// - a shitty fighting game. controls are simple - up jump. X punch. Y kick. B special down/B special and up/B special,
// back block. there's 3 specials depending on the direction. come up with something fitting for each. the kid isn't
// particuarly good. there's a character select screen. count dracula, frankenstein's monster, the mummy, dr jekyll and
// mr hyde, the invisible man (literally invisible, no frames, the game will comment on how ridiculous it is), the
// phantom of the opera and quasimodo. give them all rudimentary attacks for standing/jumping/ducking with categories
// like mid,low,overhead. mids hit at any height, lows need to be blocked low. overheads need to be blocked standing.
// defeat the kid and the shard is yours. round 1, round 2, round 3. no timer. best of 3. 'end them' will show a grisly
// fatality depending on who the victor is." And: "like standard fighting games, characters always face each other").
//
// THE KID stands at his MONSTER MASH cabinet under the Grand Arcade's roof (the town, past the skeleton pony). UP by
// him (its real prompt): his challenge (by Meathead's pants), Meathead's answer, then the ask (minigameConfirm.ts: A
// accept / B back). Accepted, the cabinet's screen fills the whole screen (a CRT: the bezel, scanlines): the title,
// the controls card (the real buttons, live: ui.chordTips; the explain screens' buffer), CHOOSE YOUR MONSTER (the kid
// picks too), VS, then the rounds (sim.ts), END THEM and the winner's ending (fatal.ts). Meathead wins: the kid's
// sore, and the CHARGE SHARD (once a save: upgrades/shardAward.ts, the find kept in the save) with its card (the
// explain screens' buffer, there). The kid wins: his ending on Meathead's fighter, the kid
// gloats, CONTINUE? (the ask again: a rematch, free, as many as he likes; every one he wins makes the kid sloppier).
//
// While it's on: Meathead's held (inCutscene: no HUD, no pausing into the world), can't be hurt, everything near him
// holds still; the game takes only the cabinet's own input. The cabinet's own announcer (lines.ts MASH) calls it.

import type { GameState } from '../../../../m1/game/core/state';
import type { FrameContext } from '../../../../m1/game/core/context';
import type { Controls } from '../../../../m1/game/platform/input';
import type { Enemy, SoundType } from '../../../../m1/types';
import { NO_CONTROLS } from '../../../../m1/game/platform/input';
import { CANVAS_WIDTH } from '../../../../m1/constants';
import { playSound } from '../../../../m1/game/platform/audio';
import { say, pickLine, isTalking, MEATHEAD_VOICE, type Voice } from '../../../../m1/game/platform/speech';
import { isShat, isNude } from '../../../../m1/game/player/gut';
import { setUi } from '../../../store';
import { pollM2, btn, pressed as menuPressed } from '../../../input';
import { shardWon, awardShard, openShardCard, tickShardCard, closeShardCard, type ShardCard } from '../../../upgrades/shardAward';
import { openAsk, tickAsk, closeAsk, type Ask } from '../../../minigameConfirm';
import { minigamePausable } from '../../../minigamePause';
import { meatheadSays, speak, saidOver, type Said } from '../../section';
import { X, Y } from '../layout';
import { ROSTER, type CharId } from './data';
import { newMatch, resetRound, step, tickFx, think, newBrain, NO_INPUT, type Match, type Brain, type Input } from './sim';
import { startFatal, tickFatal, type Fatal } from './fatal';
import { screenBuf, present, drawBoot, drawControls, drawSelect, drawVs, drawFight, warmScreens, type SelectView } from './screen';
import { drawCabinet, drawKid2, type KidPose } from './kid';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
type Phase = 'off' | 'talk' | 'ask' | 'leave' | 'boot' | 'controls' | 'select' | 'vs' | 'fight' | 'fatal' | 'result' | 'rematch' | 'card' | 'out';
type Rp = 'intro' | 'fight' | 'ko';

/** Where they are (x from the town's start): the cabinet, the kid at its right side, playing. */
export const CAB_RX = 8540, KID_RX = 8566;
export const SHARD_LAND = 'spooky', SHARD_ID = 'shard-mash';
const TALK_RANGE = 46, FREEZE_RANGE = 1000, CONTROLS_HOLD = 90;

interface Mash {
  phase: Phase; t: number; ask: Ask | null; upLatch: boolean;
  /** The kid's words in the world, over his head (only while said); the line under the cabinet's screen. */
  kidSaid: Said | null; said: { who: string; text: string; col: string } | null;
  sel: SelectView; p1: CharId; kid: CharId;
  m: Match | null; br: Brain; wins: [number, number]; round: number; rp: Rp; rt: number;
  banner: { big: string; small?: string; col?: string; t: number } | null;
  fatal: Fatal | null; winner: 0 | 1;
  /** The cabinet's next step's waiting on a line said (or skipped). */
  ready: boolean;
  kidPose: KidPose; kidWins: number; cardArmed: boolean; card: ShardCard | null; anyPrev: boolean; held: Set<Enemy>;
  menuPrev: { l: boolean; r: boolean; u: boolean; d: boolean; p: boolean };
  ticker: number;
}
const ALL = new WeakMap<GameState, Mash>();
let seenControls = false;
const mashOf = (state: GameState): Mash => {
  let ms = ALL.get(state);
  if (!ms) {
    ms = {
      phase: 'off', t: 0, ask: null, upLatch: true, kidSaid: null, said: null,
      sel: { cur: 0, kid: 3, picked: false, kidPicked: false, t: 0 }, p1: 'drac', kid: 'monster',
      m: null, br: newBrain(), wins: [0, 0], round: 0, rp: 'intro', rt: 0, banner: null, fatal: null, winner: 0, ready: true,
      kidPose: 'play0', kidWins: 0, cardArmed: false, card: null, anyPrev: true, held: new Set(), menuPrev: { l: true, r: true, u: true, d: true, p: true }, ticker: 0,
    };
    ALL.set(state, ms);
  }
  return ms;
};

const won = () => shardWon(SHARD_LAND, SHARD_ID);
const pants = <T,>(state: GameState, b: { clean: T; shitty: T; nude: T }) => (isNude(state) ? b.nude : isShat(state) ? b.shitty : b.clean);
const PAUSABLE: Phase[] = ['boot', 'select', 'vs', 'fight', 'fatal', 'result'];
const CRT: Phase[] = ['boot', 'controls', 'select', 'vs', 'fight', 'fatal', 'result', 'rematch', 'card', 'out'];
/** The music's (cues.ts): the land's theme as a cheap arcade loop while the cabinet's up. */
export const mashMusic = (state: GameState): string | null => { const ms = ALL.get(state); return ms && CRT.includes(ms.phase) ? 'arcade' : null; };
/** It's on (the town holds its own business). */
export const mashOn = (state: GameState) => (ALL.get(state)?.phase ?? 'off') !== 'off';

// ---------------------------------------------------------------------------------------------------------------
// Talking (in turn: no talk-over; the words up only while they're said)

const VOICE: Record<'kid' | 'mash', Voice> = { kid: { id: L.KID, pitch: 0, rate: 1 }, mash: { id: L.MASH, pitch: 0, rate: 1 } };
const NAME = { kid: 'KID', meathead: 'MEATHEAD' }, COL = { kid: '#93C5FD', meathead: '#FCA5A5' };
/** A line on the cabinet's strip (the kid's, Meathead's) or the cabinet's announcer (its banner says it). */
const talk = (ms: Mash, who: 'kid' | 'meathead' | 'mash', text: string, onDone?: () => void) => {
  const v = who === 'meathead' ? MEATHEAD_VOICE : VOICE[who];
  const s = who === 'mash' ? null : { who: NAME[who], text, col: COL[who] };
  let over = false;
  const done = () => { if (over) return; over = true; if (s && ms.said === s) ms.said = null; onDone?.(); };
  const shown = say(text, v, 'queue', {
    always: true,
    onShow: spoken => { if (s) ms.said = s; if (!spoken) setTimeout(done, Math.max(1500, text.length * 65)); },
    onHide: done, onDropped: done,
  });
  if (!shown) setTimeout(done, 0);
};
/** The next step when this line's over. */
const thenReady = (ms: Mash) => { ms.ready = false; return () => { ms.ready = true; }; };

// ---------------------------------------------------------------------------------------------------------------
// The flow

/** Hold still everything near him (and keep holding it). */
const freeze = (state: GameState, ms: Mash) => {
  const p = state.player, cx = p.pos.x + p.width / 2;
  for (const e of state.enemies) {
    if (e.health <= 0) continue;
    if (!ms.held.has(e) && Math.abs(e.pos.x + e.width / 2 - cx) > FREEZE_RANGE) continue;
    ms.held.add(e); e.puppet = true; e.pauseTimer = 2; e.vel.x = 0;
  }
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 40);
};
const end = (state: GameState, ms: Mash) => {
  const p = state.player;
  for (const e of ms.held) { e.puppet = false; e.pauseTimer = 30; }
  ms.held.clear();
  p.inCutscene = false; p.vel.x = 0;
  if (ms.ask) closeAsk();
  if (ms.card) { closeShardCard(); ms.card = null; }
  setUi({ chordTips: null });
  ms.phase = 'off'; ms.t = 0; ms.ask = null; ms.m = null; ms.fatal = null; ms.banner = null; ms.said = null; ms.upLatch = true;
  ms.kidPose = 'play0';
};

const toPhase = (ms: Mash, ph: Phase) => { ms.phase = ph; ms.t = 0; };

const startMatch = (ms: Mash) => {
  ms.m = newMatch(ms.p1, ms.kid); ms.br = newBrain(Math.min(0.6, ms.kidWins * 0.15));
  ms.wins = [0, 0]; ms.round = 0; ms.fatal = null;
  startRound(ms);
};
const startRound = (ms: Mash) => {
  resetRound(ms.m!); ms.round++; ms.rp = 'intro'; ms.rt = 0; ms.ready = false; ms.banner = null;
  // (wait for anybody still talking, then ROUND N; FIGHT! once that's said)
};

/** A frame's input for the fight, off the game's controls (X punch, Y kick, B special; up or A jumps). */
const inputOf = (c: Controls): Input => ({ l: c.left, r: c.right, u: c.up || c.jump, d: c.down, p: c.shoot, k: !!c.secondary, s: c.special });

const CONTROLS_TIPS = [
  { pad: ['DPAD_LEFT', 'DPAD_RIGHT'], join: '/' as const, kb: ['@left', '@right'], label: 'WALK' },
  // (A jumps too: the owner's "make A jump in the fighting game")
  { pad: ['A', 'DPAD_UP'], join: '/' as const, kb: ['@jump', '@up'], label: 'JUMP' },
  { pad: ['DPAD_DOWN'], kb: ['@down'], label: 'CROUCH' },
  { pad: ['X'], kb: ['@@fire'], label: 'PUNCH' },
  { pad: ['Y'], kb: ['@secondary'], label: 'KICK' },
  { pad: ['B'], kb: ['@special'], label: 'SPECIAL' },
  { pad: ['DPAD_DOWN', 'B'], join: '+' as const, kb: ['@downSpecial'], label: 'DOWN SPECIAL' },
  { pad: ['DPAD_UP', 'B'], join: '+' as const, kb: ['@uppercut'], label: 'UP SPECIAL' },
  { pad: ['DPAD_LEFT'], kb: ['@left'], label: 'HOLD AWAY FROM HIM: BLOCK' },
] as const;

/** Each frame in the town: the controls to pass on while it's on, or null (it's off: UP by the kid starts it). */
export const updateMash = (ctx: FrameContext, controls: Controls): Controls | null => {
  const { state } = ctx, p = state.player, ms = mashOf(state);
  if (!controls.up) ms.upLatch = false;
  const upIn = !!controls.up && !ms.upLatch;
  if (upIn) ms.upLatch = true;
  if (ms.phase === 'off') {
    // (by the kid, free, on his feet: UP to talk to him)
    const cx = p.pos.x + p.width / 2;
    if (Math.abs(cx - X(KID_RX)) < TALK_RANGE && p.isGrounded && !p.inCutscene && p.health > 0 && Math.abs(p.pos.y + p.height - Y(0)) < 8) {
      setUi({ upPrompt: 'TALK' });
      if (upIn) { setUi({ upPrompt: null }); startTalk(state, ms); return { ...NO_CONTROLS }; }
    }
    if (ms.kidPose !== 'play0' && ms.kidPose !== 'play1') ms.kidPose = 'play0';
    ms.kidPose = Math.floor(state.frame / 9) % 2 ? 'play1' : 'play0';
    return null;
  }
  p.inCutscene = true; p.vel.x = 0;
  freeze(state, ms);
  ms.t++;
  pollM2(state.frame);
  const anyHeld = !!(controls.jump || controls.shoot || controls.special || controls.secondary || controls.charge) || btn('ok') || btn('back');
  const anyPress = anyHeld && !ms.anyPrev; ms.anyPrev = anyHeld;
  switch (ms.phase) {
    case 'talk': {
      p.facing = X(KID_RX) > p.pos.x + p.width / 2 ? 1 : -1;
      if (ms.ready && ms.t > 20) { ms.ask = openAsk('MONSTER MASH?', won() ? 'ONE MORE GAME. NO PRIZE THIS TIME: HIS GLOWY ROCK IS YOURS ALREADY. BEST OF 3. NOBODY DIES (FOR REAL).' : 'THE KID PUTS HIS GLOWY ROCK ON IT. BEAT HIM, BEST OF 3, AND IT IS YOURS. NOBODY DIES (FOR REAL).'); toPhase(ms, 'ask'); }
      break;
    }
    case 'ask': {
      const r = tickAsk(ms.ask!, state.frame);
      if (r === 'back') {
        ms.ask = null; toPhase(ms, 'leave'); ms.kidPose = 'smug';
        speak(L.KID, pickLine(pants(state, L.KID_CHICKEN)), s => { ms.kidSaid = s; }, true);
      } else if (r === 'accept') {
        ms.ask = null; toPhase(ms, 'boot'); warmScreens();
        playSound('powerup', 0.5, 6); talk(ms, 'mash', L.A_TITLE);
      }
      break;
    }
    case 'leave':
      // (held a moment till the button's let go, so the B that said no doesn't fire his special)
      if (!anyHeld || ms.t > 40) end(state, ms);
      break;
    case 'boot':
      if (ms.t > 100 && (anyPress || ms.t > 220)) {
        if (!seenControls) { toPhase(ms, 'controls'); ms.cardArmed = false; }
        else toSelect(ms);
      }
      break;
    case 'controls':
      setUi({ chordTips: CONTROLS_TIPS.map(k => ({ ...k, pad: [...k.pad], kb: [...k.kb] })) });
      if (!ms.cardArmed && ms.t > CONTROLS_HOLD && !anyHeld) ms.cardArmed = true;
      if (ms.cardArmed && anyPress) { seenControls = true; setUi({ chordTips: null }); playSound('menuok', 0.6); toSelect(ms); }
      break;
    case 'select': select(state, ms, controls); break;
    case 'vs':
      if (ms.t === 16) { playSound('slam', 0.7, -6); }
      if (ms.t > 110) { toPhase(ms, 'fight'); startMatch(ms); }
      break;
    case 'fight': fight(state, ms, controls); break;
    case 'fatal': {
      const ft = ms.fatal!, m = ms.m!;
      tickFx(m); tickFatal(m, ft);
      sounds(m);
      if (ft.done) {
        toPhase(ms, 'result'); const w = m.f[ms.winner];
        ms.banner = { big: L.A_WINS[w.ch], small: 'MONSTROSITY!', col: ms.winner === 0 ? '#FCA5A5' : '#93C5FD', t: 0 };
        talk(ms, 'mash', L.A_WINS[w.ch]); talk(ms, 'mash', L.A_FATAL, thenReady(ms));
      }
      break;
    }
    case 'result': {
      tickFx(ms.m!);
      if (ms.t === 1 && ms.winner === 1) ms.kidPose = 'cheer';
      if (ms.t === 1 && ms.winner === 0) ms.kidPose = 'sulk';
      if (ms.t === 60) {
        const done = thenReady(ms);
        if (ms.winner === 0) { talk(ms, 'kid', won() ? pickLine(L.KID_SORE_AGAIN) : pickLine(pants(state, L.KID_SORE))); talk(ms, 'meathead', pickLine(pants(state, L.MH_MATCH_WON)), done); }
        else { talk(ms, 'kid', pickLine(pants(state, L.KID_GLOAT))); talk(ms, 'meathead', pickLine(pants(state, L.MH_MATCH_LOST)), done); }
      }
      if (ms.t > 70 && ms.ready) {
        if (ms.winner === 1) { ms.ask = openAsk('CONTINUE?', 'A REMATCH WITH THE KID. FREE. AS MANY AS YOU LIKE.'); toPhase(ms, 'rematch'); }
        // THE SHARD (once a save: his for good, saved there and then; upgrades/shardAward.ts), its card
        else if (awardShard(SHARD_LAND, SHARD_ID)) { ms.card = openShardCard(); toPhase(ms, 'card'); }
        else toPhase(ms, 'out');
      }
      break;
    }
    case 'rematch': {
      tickFx(ms.m!);
      const r = tickAsk(ms.ask!, state.frame);
      if (r === 'accept') { ms.ask = null; ms.kidWins++; ms.kidPose = 'play0'; toSelect(ms); }
      else if (r === 'back') { ms.ask = null; ms.kidWins++; talk(ms, 'kid', pickLine(L.KID_QUIT)); toPhase(ms, 'out'); }
      break;
    }
    case 'card':
      if (tickShardCard(ms.card!, state.frame)) { ms.card = null; ms.anyPrev = true; toPhase(ms, 'out'); }
      break;
    case 'out':
      if (ms.t > 24 && !anyHeld) { end(state, ms); ms.kidPose = 'play0'; }
      break;
  }
  if (ms.banner) ms.banner.t++;
  // (on the cabinet, START pauses it, the pause menu showing its controls: minigamePause.ts; not on the asks, its
  // controls screen or the shard's card)
  if (PAUSABLE.includes(ms.phase)) minigamePausable(state, 'mash');
  return { ...NO_CONTROLS };
};

const startTalk = (state: GameState, ms: Mash) => {
  const p = state.player;
  p.inCutscene = true; p.vel.x = 0;
  toPhase(ms, 'talk'); ms.kidPose = 'smug'; ms.anyPrev = true;
  freeze(state, ms);
  const done = thenReady(ms);
  speak(L.KID, pickLine(pants(state, won() ? L.KID_AGAIN : L.KID_CHALLENGE)), s => { ms.kidSaid = s; }, true);
  meatheadSays(state, pickLine(pants(state, L.MH_TAKE)), true, done);
};

const toSelect = (ms: Mash) => {
  toPhase(ms, 'select');
  ms.sel = { cur: ROSTER.indexOf(ms.p1), kid: ROSTER.indexOf(ms.kid), picked: false, kidPicked: false, t: 0 };
  ms.menuPrev = { l: true, r: true, u: true, d: true, p: true };
  ms.banner = null; ms.said = null;
  talk(ms, 'mash', L.A_SELECT);
};

/** CHOOSE YOUR MONSTER: the stick moves the box (a row of four over three), A / punch picks, B backs out. */
const select = (state: GameState, ms: Mash, c: Controls) => {
  const s = ms.sel; s.t++;
  const edge = (k: 'l' | 'r' | 'u' | 'd' | 'p', now: boolean) => { const was = ms.menuPrev[k]; ms.menuPrev[k] = now; return now && !was; };
  const L_ = edge('l', c.left), R_ = edge('r', c.right), U_ = edge('u', c.up), D_ = edge('d', c.down), P_ = edge('p', c.shoot);
  if (!s.picked) {
    const row = s.cur < 4 ? 0 : 1, col = row ? s.cur - 4 : s.cur;
    let n = s.cur;
    if (L_) n = row ? 4 + (col + 2) % 3 : (col + 3) % 4;
    if (R_) n = row ? 4 + (col + 1) % 3 : (col + 1) % 4;
    if (U_ && row) n = Math.min(3, col);
    if (D_ && !row) n = 4 + Math.min(2, col);
    if (n !== s.cur) { s.cur = n; playSound('cursor', 0.5); }
    if (menuPressed('ok') || P_) {
      s.picked = true; ms.p1 = ROSTER[s.cur]; playSound('menuok', 0.7);
      talk(ms, 'mash', L.A_CALL[ms.p1]);
      if (ms.p1 === 'invis') { talk(ms, 'mash', L.A_INVIS); talk(ms, 'kid', pickLine(L.KID_INVIS)); }
      s.t = 0;
    } else if (menuPressed('back')) { playSound('menuback', 0.6); toPhase(ms, 'out'); return; }
  } else if (!s.kidPicked) {
    // (the kid's box darting about, then on his pet pick)
    if (s.t % 6 === 0 && s.t < 48) { s.kid = Math.floor(Math.random() * ROSTER.length); playSound('cursor', 0.3, 4); }
    if (s.t === 54) {
      const pets: CharId[] = ['monster', 'drac', 'quasi', 'mummy', 'phantom', 'jekyll'];
      ms.kid = pets[Math.floor(Math.random() * pets.length)]; s.kid = ROSTER.indexOf(ms.kid); s.kidPicked = true;
      playSound('menuok', 0.6, -3); talk(ms, 'mash', L.A_CALL[ms.kid]); talk(ms, 'kid', pickLine(L.KID_PICK), thenReady(ms));
      s.t = 0;
    }
  } else if (ms.ready && s.t > 40) { toPhase(ms, 'vs'); ms.said = null; }
  void state;
};

/** The rounds. */
const fight = (state: GameState, ms: Mash, c: Controls) => {
  const m = ms.m!;
  ms.rt++;
  if (ms.rp === 'intro') {
    if (ms.rt === 1) ms.ready = false;
    if (ms.rt > 1 && !ms.banner && !isTalking()) {
      ms.banner = { big: ms.round >= 3 ? 'FINAL ROUND' : `ROUND ${ms.round}`, t: 0 };
      talk(ms, 'mash', L.A_ROUND[Math.min(2, ms.round - 1)], () => {
        ms.banner = { big: 'FIGHT!', small: 'FIGHT IS BEGIN', col: '#F87171', t: 0 };
        talk(ms, 'mash', L.A_FIGHT);
        ms.ready = true; ms.rt = 1000;
      });
    }
    if (ms.ready && ms.rt > 1030) { ms.rp = 'fight'; ms.rt = 0; m.live = true; }
    step(m, NO_INPUT, NO_INPUT);
  } else if (ms.rp === 'fight') {
    if (ms.rt > 40 && ms.banner?.big === 'FIGHT!') ms.banner = null;
    step(m, inputOf(c), think(m, ms.br));
    for (const e of m.ev) if (e.e === 'ko') {
      ms.rp = 'ko'; ms.rt = 0; m.live = false; ms.winner = (1 - e.loser) as 0 | 1;
      ms.banner = { big: 'K.O.', small: 'YOU ARE DEFEAT', col: '#F87171', t: 0 };
      talk(ms, 'mash', L.A_KO);
    }
  } else {
    step(m, NO_INPUT, NO_INPUT);
    const w = ms.winner, wf = m.f[w], lf = m.f[1 - w];
    if (ms.rt === 70) {
      ms.wins[w]++;
      if (ms.wins[w] >= 2) {
        // END THEM: up he gets, dazed; the winner's ending on him
        lf.ko = false; lf.knock = false; lf.down = 0; lf.getup = 0; lf.dazed = true; lf.h = 0; lf.air = false;
        wf.act = null; wf.stun = 0; wf.stunKind = null; wf.blocking = false; wf.crouch = false; wf.h = 0; wf.air = false; wf.knock = false; wf.down = 0; wf.getup = 0;
        m.shots = []; m.drops = [];
        ms.banner = { big: 'END THEM!', small: '(THEM)', col: '#EF4444', t: 0 };
        talk(ms, 'mash', L.A_END);
      } else {
        wf.win = true;
        const flawless = wf.hp >= 100;
        ms.banner = { big: L.A_WINS[wf.ch], small: flawless ? 'FLAWLESS MASH!' : 'CONGRATURATION', col: w === 0 ? '#FCA5A5' : '#93C5FD', t: 0 };
        talk(ms, 'mash', L.A_WINS[wf.ch]);
        if (flawless) talk(ms, 'mash', L.A_FLAWLESS);
        // (their live reactions, short, each in turn)
        if (w === 1) { ms.kidPose = 'cheer'; talk(ms, 'kid', pickLine(pants(state, L.KID_ROUND_WON))); talk(ms, 'meathead', pickLine(pants(state, L.MH_ROUND_LOST))); }
        else { ms.kidPose = 'sulk'; talk(ms, 'kid', pickLine(pants(state, L.KID_ROUND_LOST))); talk(ms, 'meathead', pickLine(pants(state, L.MH_ROUND_WON))); }
      }
    }
    if (ms.wins[w] >= 2 && ms.rt === 150) { toPhase(ms, 'fatal'); ms.fatal = startFatal(m, w); ms.banner = null; }
    else if (ms.wins[w] < 2 && ms.rt > 200 && !isTalking()) { ms.kidPose = 'play0'; startRound(ms); }
  }
  sounds(m);
};

const sounds = (m: Match) => { for (const e of m.ev) if (e.e === 'sfx') playSound(e.name as SoundType, e.vol ?? 0.6, e.pitch ?? 0); };

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const inView = (state: GameState) => { const cx = X(CAB_RX), x0 = state.camera.x; return cx > x0 - 100 && cx < x0 + CANVAS_WIDTH + 100; };
/** The cabinet in the world (the town's back pass: behind him). */
export const drawMashWorld = (c: Ctx, state: GameState) => {
  if (!inView(state)) return;
  drawCabinet(c, X(CAB_RX), Y(0), state.frame, mashOf(state).phase !== 'off');
};
/** The kid (the front pass: a step nearer us than Meathead, so he's never lost behind him at the cabinet). */
export const drawMashFront = (c: Ctx, state: GameState) => {
  if (!inView(state)) return;
  const ms = mashOf(state), f = state.frame;
  // (playing, he faces the cabinet; talking, smug at Meathead; after, cheering or sulking)
  const p = state.player, face = ms.kidPose === 'play0' || ms.kidPose === 'play1' ? -1 : (p.pos.x + p.width / 2 >= X(KID_RX) ? 1 : -1);
  drawKid2(c, X(KID_RX), Y(0), face, ms.kidPose, f);
};

/** Over everything: the kid's words in the world; the cabinet's screen, whole screen, while it's up. */
export const drawMashHud = (c: Ctx, state: GameState) => {
  const ms = ALL.get(state);
  if (!ms) return;
  if (ms.kidSaid) saidOver(c, ms.kidSaid.text, X(KID_RX) - state.camera.x, Y(0) - 60 - state.camera.y, '#BFDBFE', 220);
  if (!CRT.includes(ms.phase)) return;
  const [, b] = screenBuf();
  switch (ms.phase) {
    case 'boot': drawBoot(ms.t); break;
    case 'controls': drawControls(ms.cardArmed, ms.t); break;
    case 'select': drawSelect(ms.sel); break;
    case 'vs': drawVs(ms.p1, ms.kid, ms.t); break;
    case 'out': {
      if (ms.m) drawFight(ms.m, { wins: ms.wins, banner: null, ticker: null, fatal: ms.fatal, dim: 0 }); else drawBoot(200);
      break;
    }
    default: if (ms.m) drawFight(ms.m, { wins: ms.wins, banner: ms.banner, ticker: tickerOf(ms, state.frame), fatal: ms.fatal, dim: ms.phase === 'card' ? 0.6 : 0 });
  }
  // (the tube switching off: the picture squeezed down to a line, the line fading)
  if (ms.phase === 'out') {
    const k = Math.min(1, ms.t / 18);
    b.fillStyle = '#000'; b.fillRect(0, 0, 360, 130 * k); b.fillRect(0, 260 - 130 * k, 360, 130 * k);
    if (k >= 1) { b.fillStyle = `rgba(255,255,255,${Math.max(0, 1 - (ms.t - 18) / 8)})`; b.fillRect(0, 129, 360, 2); }
  }
  present(c, 0, ms.said);
};

const INVIS_TICKER = ['THE INVISIBLE MAN IS IN THIS FIGHT. TRUST US.', 'SPRITE BUDGET FOR THIS CHARACTER: $0', 'HE IS DOING A MOVE RIGHT NOW. PROBABLY.', 'IF YOU CAN SEE HIM, CALL THE OPERATOR.', 'REALISM IS OUR #1 PRIORITY.', 'PLEASE IMAGINE A VERY COOL MAN.'];
const tickerOf = (ms: Mash, f: number) => {
  if (ms.phase !== 'fight' || !ms.m) return null;
  if (ms.p1 !== 'invis' && ms.kid !== 'invis') return null;
  return INVIS_TICKER[Math.floor(f / 360) % INVIS_TICKER.length];
};

/** Stop the lot (the stage going away under it). */
export const dropMash = (state: GameState) => { const ms = ALL.get(state); if (ms && ms.phase !== 'off') end(state, ms); };
