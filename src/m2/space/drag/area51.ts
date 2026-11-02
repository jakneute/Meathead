// ALIEN GIFTS & NOVELTIES (the owner's: "in space land, you can walk a little past the entrance to space needle 2 (you
// now need to press up to enter the lobby). make sure the screen scrolls right so it isn't too hidden. there's a 'top
// secret government containment' dressed up as a store. says "imported from area 51". if you go to the door, you'll
// enter an oblivion like 'tumbler' minigame where you can lockpick the door and open it. trying to charge into the door
// will have meathead talk about 'what kind of bullshit door is this', as it is unaffected by his ramming speed. if you
// go inside you'll find a shard and actual government secrets involving alien technology they obviously wouldn't want
// the public to know about, all hidden in a door that can be lockpicked by a dumbass.")
//
// Past Space Needle 2's lobby doors (UP goes in now: index.ts), the street runs on another screen (the camera with it:
// index.ts cameraX) to the store at its end (area51Art.ts). Its door is the end of the street: two feet of steel.
//
//   RAMMED     (a charge or a slide into it) it doesn't budge: a clang, he bounces off, the bell jangles, and he says
//              what kind of bullshit door this is (pants variants; a few seconds at least between); the PA now and then.
//   THE CLIP   on the walk up to the door the first time: a bent paperclip on the ground (the owner's). He picks it up
//              with a line; it's his pick. (UP at the door without it: he spots it then.)
//   UP         his line, then the ask (minigameConfirm.ts: A accept, B back), the controls card the first go (the
//              explain screens' buffer), then THE LOCK, Oblivion's tumblers: five pins in a row over his paperclip.
//              Left / right moves the pick under one; PUSH (A / jump) springs that tumbler up, where it hangs a moment
//              at the top (each its own rhythm: snappy, lazy, stiff...) and falls back. SET (X / fire) while it hangs
//              and it's set. Set it while it's still going up or already coming down and the clip slips (bent out of
//              shape: he bends it back): that tumbler drops and so does the last one set (never all of them). No limit
//              on goes, and every slip gives the hang a couple of frames more (up to ten): never stuck. B gives up.
//              Now and then he grumbles how bullshit it is to open a door this way (the owner's; never over anybody).
//              The HUD's away, the world held (enemies paused, nothing hurts him), only the lock's buttons count.
//              START pauses it (minigamePause.ts, 'lockpick': its controls on the pause card); timers in game frames.
//   PICKED     the plug turns, the door swings in (stageMemo; and for good once the shard's his: the save). UP: in.
//   THE ROOM   one fixed screen of the actual secrets (area51Art.ts); his line on each as he passes. The CHARGE SHARD
//              in its jar: walk into it (upgrades/shardAward.ts: once a save, the card with its buffer), then his line
//              (all this behind a door a dumbass could pick). UP at the door: back out onto the street.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { pickLine, isTalking, silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { markCollectibleFound } from '../../store';
import { saveProgress } from '../../save';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { setUi } from '../../store';
import { openAsk, tickAsk, closeAsk, type Ask } from '../../minigameConfirm';
import { minigamePausable } from '../../minigamePause';
import type { GameCue } from '../../music/moments';
import { awardShard, shardWon, openShardCard, tickShardCard, closeShardCard, type ShardCard } from '../../upgrades/shardAward';
import type { EquipControl } from '../../upgrades/equipInfo';
import { meatheadSays, speak, saidOver, teleport, type Said } from '../section';
import { GY } from '../geometry';
import { byPants } from '../square/kinds';
import { X, STORE, A51_DOOR, A51_STOP, A51_CLIP, ROOM, STREET1 } from './layout';
import { drawStore, drawRoom, drawLock, drawLockWords, drawClip, ROOM_AT, type LockView } from './area51Art';
import * as L from './area51Lines';

type Ctx = CanvasRenderingContext2D;
export const SHARD_LAND = 'space', SHARD_ID = 'shard-lockpick';
/** stageMemo: the lock's been picked this run (the door stays open through deaths; for good once the shard's his). */
const OPEN_MEMO = 'spc-a51-open';
/** stageMemo: he's picked up the paperclip off the walk (the owner: "meathead happens to find a bent paperclip on the
 *  ground as he approaches the door"). */
const CLIP_MEMO = 'spc-a51-clip';
const N_PINS = 5;
/** Frames: the controls card's buffer; the win (the plug turning) before the world's back; the door's swing. */
const CARD_HOLD = 90, WON_T = 80, TIPS_T = 240;
/** A pin's hang at the top: a snap adds this much more (up to MERCY_MAX). Grace frames either side of the hang. */
const MERCY_STEP = 2, MERCY_MAX = 10, GRACE = 3;
/** His bullshit-door line no more often than this (frames); the PA's on a ram no more often than this. */
const RAM_LINE_GAP = 240, RAM_PA_GAP = 900, SNAP_LINE_GAP = 200;

type Phase = 'kick' | 'idle' | 'intro' | 'ask' | 'card' | 'play' | 'won' | 'leave' | 'shard';
type PinSt = 'down' | 'rise' | 'top' | 'fall' | 'set';
interface Pin { h: number; st: PinSt; t: number; rise: number; hang: number; fall: number; wob: number; from: number; base: [number, number, number] }
interface Lock {
  pins: Pin[]; slot: number; pick: number; push: number; snap: number; broken: number; turn: number; flash: number;
  verdict: string | null; good: boolean; verdictT: number; mercy: number; order: number[]; t: number;
  prev: { l: boolean; r: boolean; a: boolean; x: boolean; b: boolean };
}
interface A51 {
  phase: Phase; t: number;
  /** The door's swing (0 shut .. 1 open), its rattle, the camera's eye on him. */
  open: number; jolt: number; look: number;
  ramLineAt: number; ramPaAt: number; snapLineAt: number;
  ask: Ask | null; cardArmed: boolean; cardShown: boolean;
  lock: Lock | null; shardCard: ShardCard | null; taken: number;
  pa: Said | null; upWas: boolean;
  /** At the lock: the frame (its own clock) of his next grumble (the owner: "as you do the minigame he says how
   *  bullshit it is that he needs to open the door this way"). */
  grumbleAt: number;
  /** What he's thrown at the shut door so far (his lines get more baffled), the last clank (frame). */
  hits: number; clankAt: number;
  /** The first walk-up's beat (the owner: "his first attempt will be kicking the door down, noticing it doesn't work,
   *  then seeing a paperclip on the ground. non-interactive as you approach"): its step, frames into it. */
  step: 'walk' | 'kick' | 'hurt' | 'look' | 'fetch' | 'pick' | 'end'; st: number; ky: number;
  /** Said already (this run): the PA's welcome, his first look, in, each secret, the PA inside. */
  said: Set<string>; roomT: number;
}
const ALL = new WeakMap<object, A51>();
const of = (state: GameState) => ALL.get(state.stage as object) ?? null;

/** He's got the paperclip (or never needs it again). */
export const hasClip = (state: GameState) => isOpen(state) || kickSeen() || !!state.stageMemo[CLIP_MEMO];
/** The kick-the-door beat's been seen on this save (kept in the save's found list: once a save; he kept the clip). */
const KICK_ID = 'seen-a51-kick';
const kickSeen = () => shardWon(SHARD_LAND, KICK_ID);
const takeClip = (state: GameState) => {
  state.stageMemo[CLIP_MEMO] = '1';
  playSound('pickup', 0.6, 6);
  meatheadSays(state, pickLine(byPants(state, L.MH_CLIP)), true);
};
const isOpen = (state: GameState) => shardWon(SHARD_LAND, SHARD_ID) || !!state.stageMemo[OPEN_MEMO];
const hasShard = () => !shardWon(SHARD_LAND, SHARD_ID);
/** In the room (or on the way in): its stretch of the world. */
export const inA51Room = (state: GameState) => state.player.pos.x + state.player.width / 2 >= X(ROOM.a) - 100;
/** The drag's camera here: in the room, held on it; on the street, out to the street's end. */
export const a51Camera = (state: GameState, x0: number) => (inA51Room(state) ? { min: X(ROOM.a), max: X(ROOM.a) } : { min: x0, max: X(STREET1) - CANVAS_WIDTH });

export const buildA51 = (state: GameState) => {
  // (a fresh build (a death, a checkpoint): whatever of ours was up on the screen comes down)
  setUi({ minigameAsk: null, minigameCard: null, chordTips: null });
  closeShardCard();
  ALL.set(state.stage as object, {
    phase: 'idle', t: 0, open: isOpen(state) ? 1 : 0, jolt: 0, look: X(A51_DOOR),
    ramLineAt: -9999, ramPaAt: -9999, snapLineAt: -9999,
    ask: null, cardArmed: false, cardShown: false, lock: null, shardCard: null, taken: 0,
    pa: null, upWas: true, said: new Set(), roomT: 0, grumbleAt: 0, hits: 0, clankAt: -9999, step: 'walk', st: 0, ky: 0,
  });
};

const paSay = (a: A51, lines: string[], after = true) => speak(L.A51_PA_VOICE, pickLine(lines), s => { a.pa = s; }, after);

/** The world held while it's on: nobody moves, nothing hurts him. */
const hold = (state: GameState) => {
  const p = state.player;
  p.inCutscene = true; p.vel.x = 0; p.untouchable = true;
  for (const e of state.enemies) e.pauseTimer = Math.max(e.pauseTimer ?? 0, 2);
  state.projectiles = state.projectiles.filter(q => q.owner !== 'enemy');
};
const release = (state: GameState, a: A51) => {
  const p = state.player;
  p.inCutscene = false; p.untouchable = false;
  a.phase = 'idle'; a.t = 0; a.lock = null;
  setUi({ chordTips: null, minigameCard: null });
};

// ---------------------------------------------------------------------------------------------------------------
// The lock

/** The tumblers' rhythms (rise, hang at the top, fall: frames), dealt out one each, shuffled, a new lock every go. */
const RHYTHMS: [number, number, number][] = [[7, 12, 14], [20, 22, 30], [12, 16, 20], [9, 13, 26], [16, 19, 16]];
const newLock = (): Lock => {
  const r = [...RHYTHMS].sort(() => Math.random() - 0.5);
  return {
    pins: Array.from({ length: N_PINS }, (_, i) => ({ h: 0, st: 'down' as PinSt, t: 0, rise: 1, hang: 1, fall: 1, wob: 0, from: 0, base: r[i % r.length] })),
    slot: 0, pick: 0, push: 0, snap: 0, broken: 0, turn: 0, flash: 0, verdict: null, good: true, verdictT: 0, mercy: 0, order: [], t: 0,
    prev: { l: true, r: true, a: true, x: true, b: true },
  };
};
const verdict = (k: Lock, s: string, good: boolean) => { k.verdict = s; k.good = good; k.verdictT = 50; };
const dropPin = (pin: Pin) => { pin.from = pin.h; pin.st = 'fall'; pin.t = 0; };

/** A frame of the lock: true once every tumbler's set. */
const runLock = (state: GameState, a: A51, k: Lock, controls: Controls): boolean => {
  k.t++;
  const c = { l: !!controls.left, r: !!controls.right, a: !!controls.jump, x: !!controls.shoot, b: !!(controls.special || controls.charge) };
  const press = (key: keyof typeof c) => c[key] && !k.prev[key];
  const pl = press('l'), pr = press('r'), pa = press('a'), px = press('x'), pb = press('b');
  k.prev = c;
  if (k.flash > 0) k.flash--;
  if (k.verdictT > 0 && --k.verdictT === 0) k.verdict = null;
  k.push *= 0.8;
  // (the pins: up, hang, down, each to its own rhythm)
  for (const pin of k.pins) {
    pin.wob *= 0.9;
    if (pin.st === 'rise') { pin.t++; const u = Math.min(1, pin.t / pin.rise); pin.h = 1 - (1 - u) * (1 - u); if (pin.t >= pin.rise) { pin.st = 'top'; pin.t = 0; pin.h = 1; pin.wob = 1; playSound('boing', 0.25, 10); } }
    else if (pin.st === 'top') { pin.t++; if (pin.t >= pin.hang) { pin.st = 'fall'; pin.t = 0; pin.from = 1; } }
    else if (pin.st === 'fall') { pin.t++; const u = Math.min(1, pin.t / pin.fall); pin.h = pin.from * (1 - u * u); if (pin.t >= pin.fall) { pin.st = 'down'; pin.h = 0; pin.t = 0; playSound('click', 0.35, -6); } }
  }
  if (k.snap > 0) { if (++k.snap > 36) k.snap = 0; k.pick += (k.slot - k.pick) * 0.3; return false; }
  if (pb) { a.phase = 'leave'; a.t = 0; meatheadSays(state, pickLine(L.MH_QUIT), true); playSound('menuback', 0.6); setUi({ chordTips: null }); return false; }
  if (pl && k.slot > 0) { k.slot--; playSound('click', 0.3, 8); }
  if (pr && k.slot < N_PINS - 1) { k.slot++; playSound('click', 0.3, 8); }
  k.pick += (k.slot - k.pick) * 0.35;
  const under = Math.abs(k.pick - k.slot) < 0.2, pin = k.pins[k.slot];
  if (pa && under) {
    k.push = 1;
    if (pin.st === 'down') {
      const j = () => 0.85 + Math.random() * 0.3;
      pin.st = 'rise'; pin.t = 0;
      pin.rise = Math.max(5, Math.round(pin.base[0] * j())); pin.hang = Math.round(pin.base[1] * j()) + k.mercy; pin.fall = Math.max(8, Math.round(pin.base[2] * j()));
      playSound('boing', 0.45, -4 + pin.base[0] * -0.2);
    } else playSound('click', 0.25, 4);
  }
  if (px && under) {
    const inWindow = pin.st === 'top' || (pin.st === 'rise' && pin.rise - pin.t <= GRACE) || (pin.st === 'fall' && pin.t <= GRACE);
    if (inWindow) {
      pin.st = 'set'; pin.h = 1; pin.wob = 0; k.order.push(k.slot); k.flash = 24;
      verdict(k, 'SET!', true); playSound('click', 0.9, 2); playSound('clink', 0.6, 6);
      if (k.pins.every(q => q.st === 'set')) return true;
    } else if (pin.st === 'rise' || pin.st === 'fall') {
      // SLIPPED: the paperclip bends out of shape (he bends it back), this tumbler drops, and so does the last one set
      k.broken++; k.snap = 1; k.mercy = Math.min(MERCY_MAX, k.mercy + MERCY_STEP);
      dropPin(pin);
      const last = k.order.pop();
      if (last !== undefined) dropPin(k.pins[last]);
      verdict(k, 'SLIPPED!', false); playSound('crack', 0.9, 8); playSound('clink', 0.5, -4);
      shakeScreen(state, 5, 3);
      if (state.frame - a.snapLineAt > SNAP_LINE_GAP && !isTalking()) { a.snapLineAt = state.frame; meatheadSays(state, pickLine(L.MH_SNAP), false); }
    } else playSound('click', 0.2, -2);
  }
  // (the buttons, shown up top live for the first few seconds)
  setUi({ chordTips: k.t < TIPS_T ? LOCK_TIPS : null });
  return false;
};
const LOCK_TIPS: EquipControl[] = [
  { pad: ['DPAD_LEFT', 'DPAD_RIGHT'], join: '/', kb: ['@left', '@right'], label: 'MOVE THE PICK' },
  { pad: ['A'], kb: ['@jump'], label: 'PUSH IT UP' },
  { pad: ['X'], kb: ['@fire'], label: 'SET IT AT THE TOP' },
];
/** The lock's controls, all of them (its card; and the pause screen's, once minigames take a pause card). */
export const A51_LOCK_CONTROLS: EquipControl[] = [
  ...LOCK_TIPS,
  { pad: ['B'], kb: ['@special'], label: 'GIVE UP' },
];
const CARD_TEXT = 'EACH TUMBLER SPRINGS UP, HANGS AT THE TOP A MOMENT AND DROPS, EACH AT ITS OWN SPEED. SET IT WHILE IT HANGS. TOO EARLY OR TOO LATE AND THE PAPERCLIP SLIPS: THAT TUMBLER DROPS, AND SO DOES THE LAST ONE YOU SET. BEND IT BACK AND GO AGAIN.';

// ---------------------------------------------------------------------------------------------------------------
// Each frame

const btnAny = (c: Controls) => !!(c.jump || c.shoot || c.special || c.secondary || c.charge || c.up || c.down || c.left || c.right);

/** The store's say over the controls (it hands back what the engine gets). */
export const updateA51 = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, a = of(state);
  if (!a) return controls;
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height, f = state.frame;
  const upPress = !!controls.up && !a.upWas;
  a.upWas = !!controls.up;
  const opened = isOpen(state);
  a.open = opened ? Math.min(1, a.open + 0.04) : 0;
  a.jolt *= 0.86;
  a.look += (cx - a.look) * 0.05;
  const free = p.health > 0 && !p.inCutscene && state.deathTimer <= 0;
  const ground = p.isGrounded && Math.abs(feet - GY) < 6;

  switch (a.phase) {
    case 'idle': {
      if (!free) return controls;
      if (inA51Room(state)) return room(state, a, controls, upPress, ground);
      // (walking up to it: the PA's recording, then his first look)
      if (cx > X(STORE.a) - 140 && !a.said.has('pa-normal') && !isTalking()) { a.said.add('pa-normal'); paSay(a, L.PA_NORMAL); meatheadSays(state, pickLine(byPants(state, L.MH_STORE)), true); }
      // (the first walk up to the door: the beat (he kicks it, it doesn't care, he spots the paperclip))
      if (!kickSeen() && !isOpen(state) && p.isGrounded && cx > X(A51_DOOR) - 250) { a.phase = 'kick'; a.t = 0; a.step = 'walk'; a.st = 0; hold(state); p.carried = true; return { ...NO_CONTROLS }; }
      // (the paperclip on the walk: picked up on the way past)
      if (!hasClip(state) && Math.abs(cx - X(A51_CLIP)) < 26 && feet > GY - 70) takeClip(state);
      // RAMMED: a charge (or a slide) into the door: it doesn't budge; he does
      const ramming = (p.isCharging || p.isSliding) && p.facing === 1 && p.pos.x + p.width >= X(A51_STOP) - 6 && feet > GY - 130;
      if (ramming && opened) { goIn(state, a); return { ...NO_CONTROLS }; }
      if (ramming) { ram(state, a); return controls; }
      // (and everything else he's got: shots, swings, uppercuts, dive kicks: nothing)
      if (!opened) immune(state, a, controls);
      // UP at it: the lock (or, picked, in)
      if (ground && Math.abs(cx - X(A51_DOOR)) < 48) {
        setUi({ upPrompt: opened ? 'GO IN' : 'PICK THE LOCK' });
        if (upPress) {
          if (opened) { goIn(state, a); return { ...NO_CONTROLS }; }
          a.phase = 'intro'; a.t = 0; hold(state); p.facing = 1;
          if (!hasClip(state)) takeClip(state);
          meatheadSays(state, pickLine(byPants(state, L.MH_LOCK)), true, () => { if (a.phase === 'intro' && of(state) === a) toAsk(a); });
          return { ...NO_CONTROLS };
        }
      }
      return controls;
    }
    case 'kick':
      return kickBeat(state, a);
    case 'intro':
      hold(state);
      if (++a.t > 420) toAsk(a);
      return { ...NO_CONTROLS };
    case 'ask': {
      hold(state);
      const r = tickAsk(a.ask!, f);
      if (r === 'wait') return { ...NO_CONTROLS };
      a.ask = null;
      if (r === 'back') { a.phase = 'leave'; a.t = 0; meatheadSays(state, pickLine(L.MH_QUIT), true); return { ...NO_CONTROLS }; }
      a.lock = newLock(); a.grumbleAt = 260;
      if (!a.cardShown) { a.cardShown = true; a.phase = 'card'; a.t = 0; a.cardArmed = false; showCard(false); }
      else { a.phase = 'play'; a.t = 0; }
      playSound('clink', 0.6, 4);
      return { ...NO_CONTROLS };
    }
    case 'card': {
      hold(state);
      a.t++;
      const held = btnAny(controls);
      if (!a.cardArmed && a.t > CARD_HOLD && !held) { a.cardArmed = true; showCard(true); }
      if (a.cardArmed && held) { setUi({ minigameCard: null }); playSound('menuok', 0.6); a.phase = 'play'; a.t = 0; a.lock!.prev = { l: true, r: true, a: true, x: true, b: true }; }
      return { ...NO_CONTROLS };
    }
    case 'play': {
      hold(state);
      // (START pauses it, the lock's controls on the pause card (minigamePause.ts, PauseControls.tsx 'lockpick'); its
      // timers are game frames, so a pause doesn't eat them)
      minigamePausable(state, 'lockpick');
      const k = a.lock!;
      // (his grumble now and then: never over anybody)
      if (k.t >= a.grumbleAt && !isTalking()) { a.grumbleAt = k.t + 620 + Math.floor(Math.random() * 360); meatheadSays(state, pickLine(byPants(state, L.MH_GRUMBLE)), false); }
      if (runLock(state, a, k, controls)) {
        a.phase = 'won'; a.t = 0; setUi({ chordTips: null });
        playSound('thud', 0.8, 6); playSound('clink', 0.8, 0);
      }
      return { ...NO_CONTROLS };
    }
    case 'won': {
      hold(state);
      minigamePausable(state, 'lockpick');
      a.t++;
      const k = a.lock!;
      k.turn = Math.min(1, a.t / 40);
      if (a.t === 40) { playSound('slam', 0.7, 4); shakeScreen(state, 6, 4); }
      if (a.t >= WON_T) {
        state.stageMemo[OPEN_MEMO] = '1';
        release(state, a);
        playSound('rumble', 0.5, 8);
        meatheadSays(state, pickLine(byPants(state, L.MH_OPEN)), true);
        paSay(a, L.PA_PICKED);
        a.upWas = true;
      }
      return { ...NO_CONTROLS };
    }
    case 'leave': {
      // (backed out: held a beat till the button's let go, so it doesn't fire a charge on the way out)
      hold(state);
      if (!btnAny(controls) || ++a.t > 40) { release(state, a); a.upWas = true; }
      return { ...NO_CONTROLS };
    }
    case 'shard': {
      hold(state);
      a.taken++;
      if (a.shardCard && tickShardCard(a.shardCard, f)) {
        a.shardCard = null; release(state, a); a.upWas = true;
        meatheadSays(state, pickLine(byPants(state, L.MH_SHARD)), true);
        paSay(a, L.PA_SHARD);
      }
      return { ...NO_CONTROLS };
    }
  }
  return controls;
};

const toAsk = (a: A51) => {
  a.phase = 'ask'; a.t = 0;
  a.ask = openAsk('PICK THE LOCK?', "A TOP SECRET GOVERNMENT DOOR WITH A $4.99 GIFT SHOP LOCK ON IT. FIVE TUMBLERS. YOU'VE GOT A BENT PAPERCLIP.");
};
const showCard = (ready: boolean) => setUi({ minigameCard: { title: 'THE LOCK', rows: A51_LOCK_CONTROLS, text: CARD_TEXT, ready } });

/** Rammed: the door doesn't care. */
const ram = (state: GameState, a: A51) => {
  const p = state.player;
  p.isCharging = false; p.isSliding = false; p.chargeTimer = 0; p.lockTimer = 0;
  p.pos.x = Math.min(p.pos.x, X(A51_STOP) - p.width - 2);
  p.vel.x = -7; p.vel.y = -5; p.isGrounded = false;
  a.jolt = 6;
  playSound('clang', 1, -6); playSound('thud', 0.8, -10);
  shakeScreen(state, 10, 6);
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: X(A51_STOP) - 4, y: p.pos.y + p.height * 0.4 + (Math.random() - 0.5) * 30 }, vel: { x: -1 - Math.random() * 4, y: -2 - Math.random() * 4 }, life: 20 + Math.random() * 14, color: i % 2 ? '#FDE68A' : '#FFFFFF', size: 2 + Math.random() * 2, grav: 0.3 });
  const f = state.frame;
  a.hits++; a.clankAt = f;
  if (f - a.ramLineAt > RAM_LINE_GAP) { a.ramLineAt = f; meatheadSays(state, pickLine(byPants(state, a.hits >= 12 ? L.MH_IMMUNE[2] : L.MH_RAM)), false); }
  else if (f - a.ramPaAt > RAM_PA_GAP && !isTalking()) { a.ramPaAt = f; paSay(a, L.PA_RAM, false); }
};

/** The shut door against everything else he's got (the owner: "his overwhelming power and his weapons cannot budge the
 *  door, but a shitty lockpick would suffice"): any shot of his that reaches it is gone in a spray of sparks, an
 *  uppercut or a dive kick into it bounces him off, any swing or blast from close range clanks off it. Baffled lines,
 *  tiered by how much he's thrown at it (the last tier spots the keyhole), at most every few seconds. */
const immune = (state: GameState, a: A51, controls: Controls) => {
  const p = state.player, f = state.frame, door = X(A51_STOP), front = p.pos.x + p.width;
  let hit = false, hy = p.pos.y + p.height * 0.4;
  // (his shots: whatever's about to reach the door, eaten there)
  const before = state.projectiles.length;
  state.projectiles = state.projectiles.filter(q => {
    if (q.owner !== 'player') return true;
    const lead = q.pos.x + q.width + Math.max(0, q.vel.x) * 1.5;
    if (lead >= door - 2 && q.pos.x < door + 260 && q.pos.y + q.height > GY - 230 && q.pos.y < GY + 4) { hy = Math.max(GY - 200, Math.min(GY - 8, q.pos.y + q.height / 2)); return false; }
    return true;
  });
  if (state.projectiles.length < before) hit = true;
  // (an uppercut or a dive kick into it: bounced off)
  if ((p.isUppercutting || p.isDivekicking) && p.facing === 1 && front >= door - 6) { p.pos.x = Math.min(p.pos.x, door - p.width - 2); p.vel.x = -6; hit = true; }
  // (a swing, a beam, a blast, a yell at it from close: it clanks off)
  if ((controls.shoot || controls.secondary) && p.facing === 1 && door - front < 200 && door - front > -10 && f - a.clankAt > 14) hit = true;
  if (!hit || f - a.clankAt < 5) return;
  a.hits++; a.clankAt = f; a.jolt = Math.max(a.jolt, 3);
  playSound(a.hits % 2 ? 'clang' : 'clink', 0.8, -4 + Math.random() * 6);
  for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: door - 3, y: hy + (Math.random() - 0.5) * 16 }, vel: { x: -1 - Math.random() * 4, y: -1.5 - Math.random() * 3.5 }, life: 14 + Math.random() * 12, color: i % 3 ? '#FDE68A' : '#FFFFFF', size: 2 + Math.random() * 2, grav: 0.25 });
  if (f - a.ramLineAt > RAM_LINE_GAP) {
    a.ramLineAt = f;
    meatheadSays(state, pickLine(byPants(state, L.MH_IMMUNE[a.hits < 5 ? 0 : a.hits < 14 ? 1 : 2])), false);
  }
};

/** The beat: walk up, kick it (CLANG, nothing), hop about on the foot, look about, spot the paperclip, pick it up.
 *  No input, no HUD; skippable, all of it (speech bubbles while it can be: App.tsx's rule). */
const KICK_AT = A51_STOP - 34;
const kickBeat = (state: GameState, a: A51): Controls => {
  const p = state.player;
  hold(state); p.carried = true; p.vel.y = 0;
  a.t++; a.st++;
  const cx = () => p.pos.x + p.width / 2;
  const walkTo = (x: number, sp = 2.6) => { const d = x - cx(); p.facing = d < 0 ? -1 : 1; p.pos.x += Math.max(-sp, Math.min(sp, d)); return Math.abs(d) < 1.5; };
  const to = (s: A51['step']) => { a.step = s; a.st = 0; };
  if (a.t > SKIP_AFTER) { offerSkip(); if (takeSkip()) { silenceAll(); endKick(state, a); return { ...NO_CONTROLS }; } }
  switch (a.step) {
    case 'walk': if (walkTo(X(KICK_AT)) || a.st > 120) { p.facing = 1; to('kick'); } break;
    case 'kick':
      p.facing = 1;
      if (a.st === 4) p.kickPose = 16;
      if (a.st === 10) {
        // CLANG: nothing. Not a dent.
        a.jolt = 9; a.hits++;
        playSound('clang', 1, -10); playSound('thud', 0.9, -12); shakeScreen(state, 14, 7);
        for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: X(A51_STOP) - 3, y: GY - 40 + (Math.random() - 0.5) * 20 }, vel: { x: -1 - Math.random() * 4, y: -2 - Math.random() * 4 }, life: 18 + Math.random() * 14, color: i % 2 ? '#FDE68A' : '#FFFFFF', size: 2 + Math.random() * 2, grav: 0.3 });
      }
      if (a.st >= 22) { to('hurt'); meatheadSays(state, pickLine(byPants(state, L.MH_KICK_HURT)), true); }
      break;
    case 'hurt': {
      // (hopping about on the other foot, backing off)
      const hop = Math.abs(Math.sin(a.st * 0.22)) * 12;
      p.pos.y = GY - p.height - hop; p.isGrounded = hop < 1;
      if (a.st < 70) p.pos.x -= 0.5;
      p.facing = Math.floor(a.st / 22) % 2 ? -1 : 1;
      if (a.st > 80 && !isTalking()) { p.pos.y = GY - p.height; p.isGrounded = true; to('look'); }
      break;
    }
    case 'look':
      // (a look this way, that way: then down, and there it is)
      p.facing = a.st < 24 ? 1 : a.st < 48 ? -1 : -1;
      p.isDucking = a.st > 50 && a.st < 62;
      if (a.st === 56) playSound('ding', 0.4, 10);
      if (a.st > 66) { p.isDucking = false; to('fetch'); }
      break;
    case 'fetch': if (walkTo(X(A51_CLIP) + 14, 2.2) || a.st > 150) { p.facing = -1; to('pick'); } break;
    case 'pick':
      p.isDucking = a.st < 20;
      if (a.st === 12) takeClip(state);
      if (a.st > 30 && !isTalking()) endKick(state, a);
      break;
    default: endKick(state, a);
  }
  return { ...NO_CONTROLS };
};
const endKick = (state: GameState, a: A51) => {
  const p = state.player;
  state.stageMemo[CLIP_MEMO] = '1';
  markCollectibleFound(SHARD_LAND, KICK_ID); saveProgress();
  p.carried = false; p.isDucking = false; p.kickPose = 0; p.pos.y = GY - p.height; p.isGrounded = true; p.vel.x = 0; p.vel.y = 0;
  if (p.pos.x + p.width > X(A51_STOP) - 2) p.pos.x = X(A51_STOP) - p.width - 2;
  release(state, a); a.upWas = true;
};

/** In through the open door: the room, its one screen. */
const goIn = (state: GameState, a: A51) => {
  const p = state.player;
  p.isCharging = false; p.isSliding = false; p.chargeTimer = 0;
  teleport(state, X(ROOM.a) + ROOM_AT.exit + 36, GY); p.facing = 1;
  state.camera.x = X(ROOM.a);
  playSound('thud', 0.5, -4);
  a.upWas = true; a.roomT = 0;
  if (!a.said.has('enter')) { a.said.add('enter'); meatheadSays(state, pickLine(byPants(state, L.MH_ENTER)), true); }
};
/** Back out onto the street, at the door. */
const goOut = (state: GameState, a: A51) => {
  const p = state.player;
  teleport(state, X(A51_STOP) - p.width / 2 - 4, GY); p.facing = -1;
  state.camera.x = X(STREET1) - CANVAS_WIDTH;
  playSound('thud', 0.5, -4);
  a.upWas = true;
};

/** In the room: the way out, his lines on what's there, the shard. */
const room = (state: GameState, a: A51, controls: Controls, upPress: boolean, ground: boolean): Controls => {
  const p = state.player, rx = p.pos.x + p.width / 2 - X(ROOM.a);
  a.roomT++;
  if (ground && Math.abs(rx - ROOM_AT.exit) < 46) {
    setUi({ upPrompt: 'LEAVE' });
    if (upPress) { goOut(state, a); return { ...NO_CONTROLS }; }
  }
  // (his line on each thing as he comes by it: one at a time, never over anybody)
  if (!isTalking()) {
    for (const key of Object.keys(L.MH_SEE) as (keyof typeof L.MH_SEE)[]) {
      if (a.said.has(key) || Math.abs(rx - ROOM_AT[key]) > 34) continue;
      a.said.add(key); meatheadSays(state, pickLine(L.MH_SEE[key]), false); break;
    }
    if (a.roomT > 900 && !a.said.has('pa-inside')) { a.said.add('pa-inside'); paSay(a, L.PA_INSIDE); }
  }
  // THE SHARD: walk into its jar
  if (hasShard() && Math.abs(rx - ROOM_AT.shard) < 22 && p.pos.y < GY - 60 + 10 && p.pos.y + p.height > GY - 100) {
    if (awardShard(SHARD_LAND, SHARD_ID)) {
      a.phase = 'shard'; a.t = 0; a.taken = 1; a.shardCard = openShardCard(); hold(state);
      playSound('glass', 0.6, 6);
      return { ...NO_CONTROLS };
    }
  }
  return controls;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** With the street's shopfronts. */
export const drawA51Store = (c: Ctx, state: GameState) => {
  const a = of(state);
  drawStore(c, state, a?.open ?? 0, a?.jolt ?? 0, a?.look ?? X(A51_DOOR));
};
/** The room, over everything behind it. */
export const drawA51Room = (c: Ctx, state: GameState) => {
  const a = of(state);
  drawRoom(c, state, hasShard(), a?.phase === 'shard' ? a.taken : 0);
};
/** The PA's words (over the store's camera, or up over the room). */
export const drawA51Words = (c: Ctx, state: GameState) => {
  const a = of(state);
  if (!hasClip(state) && Math.abs(X(A51_CLIP) - state.camera.x - CANVAS_WIDTH / 2) < CANVAS_WIDTH) drawClip(c, X(A51_CLIP), state.frame);
  if (!a?.pa || a.lock) return;
  if (inA51Room(state)) saidOver(c, a.pa.text, X(ROOM.a) + CANVAS_WIDTH / 2, GY - 470, '#86EFAC', 420);
  else saidOver(c, a.pa.text, X(A51_DOOR) + 20, GY - 210, '#86EFAC', 300);
};
/** The lock's close-up over the screen (the HUD's pass). */
export const drawA51Hud = (c: Ctx, state: GameState) => {
  const a = of(state);
  if (a?.phase === 'kick' && a.t > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
  if (!a?.lock || (a.phase !== 'card' && a.phase !== 'play' && a.phase !== 'won')) return;
  const k = a.lock;
  const v: LockView = { pins: k.pins.map(q => ({ h: q.h, set: q.st === 'set', wob: q.wob })), pick: k.pick, push: k.push, snap: k.snap, broken: k.broken, turn: k.turn, flash: k.flash };
  drawLock(c, v, state.frame);
  drawLockWords(c, k.broken, a.phase === 'won' ? 'CLICK. OPEN!' : k.verdict, a.phase === 'won' || k.good, k.pins.filter(q => q.st === 'set').length, N_PINS);
  // (what he says while he's at it, low on the screen: he's under the close-up)
  if (state.playerVulgarityTimer > 0 && state.playerLastVulgarity) saidOver(c, state.playerLastVulgarity, CANVAS_WIDTH / 2, 586, '#FFFFFF', 640);
  if (a.pa) saidOver(c, a.pa.text, CANVAS_WIDTH / 2, 40, '#86EFAC', 600);
  void CANVAS_HEIGHT;
};
/** Taken down (the stage going away under it). */
export const dropA51 = (state: GameState) => { const a = of(state); if (a?.ask) { closeAsk(); a.ask = null; } if (a?.shardCard) { closeShardCard(); a.shardCard = null; } setUi({ minigameCard: null, chordTips: null }); };
export const a51Open = (state: GameState) => isOpen(state);
/** The music's (cues.ts): the lock's own song from its controls card (the ask's the land's), the sting as it turns. */
export const a51Music = (state: GameState): GameCue | null => {
  const ph = of(state)?.phase;
  return ph === 'card' || ph === 'play' ? { song: 'game:lockpick' } : ph === 'won' ? { song: null, sting: 'game:lockpick-open' } : null;
};
