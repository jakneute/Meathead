// SPAZ & STINKY'S BUMPER BASH CHALLENGE: a minigame at its ticket booth just right of the rink (the owner's, 2026-11-01: "another
// minigame in cartoon land: bumper cars. there's a guy who offers you a bumper car challenge at the ticket booth. 'kill
// everyone, win a prize'. it's overhead and it controls are tank controls and finnicky, like real bumper cars. tank
// controls. you can press B to boost. you gotta run into and kill all the other bumper cars in the arena in the time
// limit. boosting into them does massive damage, sends them flying to the top, then peeling down to the floor of the
// bumper car arena, allowing you to run them over after they fall." Then: "running them over is like overkill";
// "their idle cars can be pushed too. they act as obstacles"; "the idle exploded cars"; "there are combinations of
// skinner and heavier pepole. male and female, with different weight values and how much they bounce/take damage";
// and for every minigame: "a sub-menu to press A to accept and B to go back").
//
//   THE CARNY       in his booth (art.ts bumperBooth*), waving him down (bumperArt.ts drawCarny), his bark as Meathead comes up (the owner's line), UP to talk
//                   (the real prompt). The offer (pants variants), Meathead's take, then the box (minigameConfirm.ts:
//                   A accept, B back, buffered). Won before: he's sore, and it's for fun (no second shard).
//   THE CARD        the controls (BumperCard.tsx), the first go each visit, buffered like every explain screen.
//   THE RINK        a full-screen overhead mode drawn from the section's drawHud, the HUD put away (ui.hudOff), the
//                   player held (a cutscene to the engine: nothing touches him, only this reads the buttons).
//                   3, 2, 1, BUMP! Then ROUND_SECS to kill all RIVALS cars.
//   HIS CAR         tank controls, finicky: left / right turn it (it takes a moment to start turning and to stop), up
//                   is the gas, down reverses; it slides (sideways grip's poor), it bounces off the rail and the others.
//                   B boosts (the meter refills over BOOST_REFILL frames). He can't die: rammed, he's knocked about.
//   THE DRIVERS     men and women, skinny to heavy (squeezed into the car so it reads): heavy ones are heavier cars
//                   (harder to shove, bounce less, ram harder), take less from a bump and from a boost (one boost
//                   won't kill a fresh heavy: wear them down first); skinny ones fly about and break easy.
//   THE HITS        only HE hurts them (ME_PUSH, CREDIT_T): his own drive into a car (sat still and rammed, it's just a
//                   bounce), or a car or hulk he's just sent flying smacking into one. Their bumps on each other knock
//                   them about but never hurt. A plain bump of his chips them (by how hard, and the mass behind it). A
//                   BOOSTED ram does massive damage. A car at nothing blows up and counts: the car's left a burnt-out
//                   hulk, a pushable obstacle (it blocks and bounces everyone, shoves heavy, and one he's shoved hard
//                   into a live car hurts it); the driver's flung up at the screen, splats on the glass, peels down it
//                   and drops flat on the rink floor. Run the pancake over: OVERKILL (not needed to win).
//   THE OTHERS      each on its own whim (think): they go after anyone, him or each other, in bursts, lose interest,
//                   overshoot, weave, swerve off, stop dead, wander; now and then line up, rev (the tell: shaking,
//                   beeping, exhaust) and lunge. The dead are anybody's: they shove the hulks about and run over
//                   the flattened drivers (shoved, rolled, squashed: the owner's "other bodies and cars can get ran
//                   over by living cpu opponents"), though only he ever hurts a living one.
//   THE END         won or lost, the cars stop dead (runFrozen); his line or the carny's; then he's back out at the
//                   booth, every way it ends (the owner's, 2026-11-02: "make it so i have to physically talk to the
//                   booth man ... by pressing up to speak to him after exiting out of the minigame any way"). A win: the
//                   carny sore; the first win, the prize: a CHARGE SHARD (upgrades/shardAward.ts: one a save, the card
//                   buffered), and closing its card starts nothing. Again: UP at the booth, the carny's warning first
//                   once he's won (no prize, go again anyway?), or "back for more?" after a loss; then the box.
//
// Nothing here outlives a death but the shard (in the save). He can't die in here anyway.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll, announce } from '../../../m1/game/platform/speech';
import { getUi, setUi } from '../../store';
import { openAsk, tickAsk, closeAsk, type Ask } from '../../minigameConfirm';
import { onFloorish, upStart } from '../../upZone';
import { minigamePausable } from '../../minigamePause';
import type { GameCue } from '../../music/moments';
import { awardShard, shardWon, openShardCard, tickShardCard, closeShardCard, type ShardCard } from '../../upgrades/shardAward';
import { pollM2, btn, pressed } from '../../input';
import { walkOff, walkOffDue, type WalkOff } from '../../walkOffCall';
import { byPants, meatheadSays, speak, saidOver, landVisit, type Said } from '../section';
import { GY } from '../geometry';
import { X, BOOTH } from './layout';
import { bumperBoothBack, bumperBoothFront } from './art';
import {
  W, H, RINK, R, PODIUM, CAR_W, CAR_H, arenaCanvas, gridCanvas, carCanvas, hulkCanvas, drawFig, drawPeel, drawCarny, drawCarnyTop,
  type Look, type Build,
} from './bumperArt';
import {
  CARNY_VOICE, CARNY_HOOK, CARNY_CALL, CARNY_LEAVE, CARNY_LEAVE_WON, CARNY_OFFER, CARNY_BACK, CARNY_SORE, CARNY_DECLINE, CARNY_LOSE, CARNY_QUIT, CARNY_WIN, CARNY_PRIZE, CARNY_WIN_AGAIN,
  MH_OFFERED, MH_START, MH_KILL, MH_OVERKILL, MH_RAMMED, MH_LOSE, MH_WIN, OVERKILL_CALL,
} from './bumperLines';

/** Where the carny stands (world): in the bumper bash's own ticket booth, just right of the rink (the owner's,
 *  2026-11-02: "the bumper car man should be closer to the bumper cars themselves. just to the right. he waves you
 *  down, trying to get your attention."). */
export const CARNY_X = X(BOOTH.x);
/** Waving him down: while he's this near (and, once he's played this visit, only this near); a call-out at most this
 *  often (frames), only while he's this near. */
const WAVE_FAR = 700, WAVE_PLAYED = 300, CALL_EVERY = 1500, CALL_NEAR = 520;
/** The shard's id in the save (store.ts collectibles, Cartoon Land's). */
const SHARD_LAND = 'cartoon', SHARD_ID = 'shard-bumper';
/** The round: how long, how many. */
export const ROUND_SECS = 90, RIVALS = 6;
const COUNT = 150;
/** The controls card's least time up (the explain screens' buffer). */
const CARD_HOLD = 90;

// ---- the car's handling (px and radians a frame)
const TURN_ACC = 0.0075, TURN_DAMP = 0.88, TURN_MAX = 0.075;
const GAS = 0.13, GAS_AI = 0.112, REVERSE = 0.08;
const DRAG_F = 0.965, DRAG_F_BOOST = 0.985, DRAG_L = 0.92, VMAX = 11;
/** (the owner's, 2026-11-02: "reduce the cooldown for boost by a bit too": 200 frames to 155) */
const BOOST_T = 18, BOOST_PUSH = 0.5, BOOST_REFILL = 155;
const LUNGE_T = 16, LUNGE_PUSH = 0.42;
/** Bounce off each other, off the rail. */
const E_CARS = 0.82, E_RAIL = 0.6;
/** Damage: a bump's (times the closing speed behind it), a boost's (before the driver's build). */
const BUMP_K = 1.5, BOOST_DMG = 135;
/** The build: weight (mass, toughness). */
const BUILD_W: Record<Build, number> = { 0: 0.72, 1: 1, 2: 1.45 };
const ME_MASS = 2.0, HULK_MASS = 2.5;
/** Only he kills (the owner's, 2026-11-02: "another car cannot elimate another car, only you can kill another rider";
 *  "make sure that your own collisions bump them. they cannot die if you idle"): a rival's hurt only by his own drive
 *  into it (his speed along the hit, at least ME_PUSH: sat still and rammed, nobody's hurt, it's just a bounce), or by a
 *  car or hulk he's sent flying in the last CREDIT_T frames (his still: the kill's his). Their bumps on each other just
 *  knock them about. */
const ME_PUSH = 1.0, CREDIT_T = 50;

// ---------------------------------------------------------------------------------------------------------------
// Who's driving (men and women, skinny to heavy, skin tones, hair: the same lot every round, shuffled about)

const RIVAL_LOOKS: (Look & { color: string })[] = [
  { woman: false, build: 0, skin: '#F6DCC8', hair: '#A16207', shirt: '#22C55E', pants: '#57534E', long: false, bald: false, seed: 101, color: '#14B8A6' },
  { woman: true, build: 2, skin: '#8D5524', hair: '#111827', shirt: '#EC4899', pants: '#1E3A8A', long: true, bald: false, seed: 202, color: '#A855F7' },
  { woman: false, build: 2, skin: '#E0B088', hair: '#4A2E1A', shirt: '#F8FAFC', pants: '#0F172A', long: false, bald: true, seed: 303, color: '#F97316' },
  { woman: true, build: 0, skin: '#F4C2B0', hair: '#F5D27A', shirt: '#3B82F6', pants: '#A8A29E', long: true, bald: false, seed: 404, color: '#84CC16' },
  { woman: false, build: 1, skin: '#5C3A21', hair: '#1F1611', shirt: '#F59E0B', pants: '#1E3A8A', long: false, bald: false, seed: 505, color: '#EAB308' },
  { woman: true, build: 1, skin: '#C68642', hair: '#7F1D1D', shirt: '#14B8A6', pants: '#78350F', long: false, bald: false, seed: 606, color: '#EC4899' },
];
export const _RIVAL_LOOKS = RIVAL_LOOKS;
const ME_COLOR = '#DC2626';

/** Each driver's own way of going at it (rolled each round, leaning on the build): how keen on him (aggro), how long
 *  they keep at one thing (focus, frames), how much they weave (wobble), how far ahead they aim (lead, frames), how
 *  slow to notice he's moved (lag, frames: they drive at where he was, and overshoot), how often they swerve off or
 *  stop dead (rash). */
interface Pers { aggro: number; focus: number; wobble: number; lead: number; lag: number; rash: number }
interface Ai {
  mode: 'roam' | 'hunt' | 'rev' | 'lunge' | 'back' | 'idle' | 'swerve'; t: number; tgt: Car | null; px: number; py: number; cool: number; side: number; stuck: number;
  pers: Pers; ph: number; aimX: number; aimY: number; aimT: number;
}
interface Car {
  x: number; y: number; a: number; vx: number; vy: number; av: number;
  hp: number; mass: number; w: number; look: Look; color: string; num: number;
  me: boolean; dead: boolean; boostT: number; lastBoost: number; hurtAt: number; ai: Ai;
  /** Sent flying by him: till this tick, what it hits is on him. */
  credit: number;
}
type FlingPhase = 'up' | 'smack' | 'peel' | 'drop' | 'flat';
interface Fling {
  look: Look; sx: number; sy: number; fx: number; fy: number; t: number; over: boolean; rot: number; dir: number; px: number; py: number;
  /** Flat on the floor: how many times a car's gone over it (squashed after a couple), the last tick one did. */
  runs: number; runAt: number;
}
interface Part { x: number; y: number; vx: number; vy: number; life: number; max: number; col: string; size: number; kind: 'spark' | 'smoke' | 'fire' | 'star' | 'dust' }
interface Pop { text: string; x: number; y: number; t: number; col: string }

type Phase = 'off' | 'offer' | 'ask' | 'decline' | 'card' | 'count' | 'play' | 'won' | 'lost' | 'payout' | 'award';
interface Bumper {
  phase: Phase; t: number; token: number;
  ask: Ask | null; shard: ShardCard | null; cardT: number; cardArmed: boolean;
  cars: Car[]; flings: Fling[]; parts: Part[]; pops: Pop[];
  clock: number; shake: number; replay: boolean;
  /** What the carny's saying (over him, at the booth or at his podium), what Meathead's saying in the rink. */
  carny: Said | null; mh: Said | null;
  prompted: boolean; wasUp: boolean; upBuf?: number; was: Partial<Controls>;
  rammedAt: number; buzzAt: number; lineAt: number; tick: number;
  /** Lost (or quit) a round and not won since: the carny's "back for more?" next time. */
  lost: boolean;
  /** B pressed fresh this frame. */
  boostPress: boolean;
  /** The carny flagging him down (bumper.ts sets it, the booth draws it); when he last called out. */
  waving: boolean; callAt: number;
  /** Won his last round (the payout's over); when he was last let go; calling after him as he walks off (walkOffCall.ts). */
  won: boolean; endAt: number; leave: WalkOff;
}
const stores = new WeakMap<object, Bumper>();
const bumperOf = (state: GameState): Bumper => {
  const key = (state.stage ?? state) as object;
  let b = stores.get(key);
  if (!b) stores.set(key, b = {
    phase: 'off', t: 0, token: 0, ask: null, shard: null, cardT: 0, cardArmed: false,
    cars: [], flings: [], parts: [], pops: [], clock: 0, shake: 0, replay: false,
    carny: null, mh: null, prompted: false, wasUp: false, was: {}, rammedAt: -9999, buzzAt: 0, lineAt: -9999, tick: 0, boostPress: false,
    waving: false, callAt: -99999, lost: false, won: false, endAt: -99999, leave: walkOff(),
  });
  return b;
};
/** The carny's bark said this visit; the controls card shown this visit; played it this visit. */
let hookVisit = -1, cardVisit = -1, playedVisit = -1;
/** The UI flags this left up (cleared when it's off). */
let uiUp = false;

const inRink = (b: Bumper) => b.phase === 'card' || b.phase === 'count' || b.phase === 'play' || b.phase === 'won' || b.phase === 'lost';
/** The music's (cues.ts): the rink's own song from its card till he's back out (the ask's the land's); a sting
 *  on a win (every car dead) or a loss (the clock out), then the song again under the lines. */
export const bumperMusic = (state: GameState): GameCue | null => {
  const b = bumperOf(state);
  if (!inRink(b)) return null;
  return b.phase === 'won' ? { song: 'game:bumper', sting: 'game:bumper-win' } : b.phase === 'lost' ? { song: 'game:bumper', sting: 'game:bumper-lose' } : { song: 'game:bumper' };
};
/** Something's on (the rest of the zone holds still). */
export const bumperOn = (state: GameState) => bumperOf(state).phase !== 'off';

const rnd = Math.random;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const wrap = (a: number) => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
const anyHeld = (c: Partial<Controls>) => !!(c.jump || c.shoot || c.special || c.secondary || c.charge || c.up || c.down || c.left || c.right);
const hands = (): Controls => ({ ...NO_CONTROLS });

// ---------------------------------------------------------------------------------------------------------------
// Holding him, letting go

const hold = (state: GameState, b: Bumper, rink: boolean) => {
  const p = state.player;
  p.inCutscene = true; p.vel.x = 0; p.vel.y = Math.max(0, p.vel.y);
  p.hidden = rink; p.carried = rink; p.noSpecials = rink;
  if (rink) p.shootCooldown = Math.max(p.shootCooldown, 3);
  state.projectiles = state.projectiles.filter(q => q.owner !== 'player');
  if (!uiUp || b.prompted) { setUi({ hudOff: true, upPrompt: null }); uiUp = true; b.prompted = false; }
};
const release = (state: GameState, b: Bumper) => {
  const p = state.player;
  p.inCutscene = false; p.hidden = false; p.carried = false; p.noSpecials = false;
  // (a moment's grace, put back out by the booth: nothing roaming the zone gets a free hit on him as he's let go)
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 90); p.noContactUntil = state.frame + 90;
  b.phase = 'off'; b.t = 0; b.mh = null; b.endAt = b.tick;
  if (b.ask) { closeAsk(); b.ask = null; }
  if (b.shard) { closeShardCard(); b.shard = null; }
  setUi({ hudOff: false, bumperCard: null }); uiUp = false;
};
/** Out of the rink, stood by the carny, facing him. */
const outOfRink = (state: GameState, b: Bumper) => {
  const p = state.player;
  p.hidden = false; p.carried = false; p.noSpecials = false;
  p.pos.x = CARNY_X + 70 - p.width / 2; p.pos.y = GY - p.height; p.vel.x = 0; p.vel.y = 0; p.facing = -1;
  b.mh = null;
  setUi({ bumperCard: null });
};

const carnySays = (b: Bumper, line: string, onDone?: () => void) => {
  const tok = b.token;
  speak(CARNY_VOICE, line, s => { b.carny = s; }, true, () => { if (b.token === tok) onDone?.(); });
};
/** Meathead in the rink (his words over his car). */
const mhSays = (b: Bumper, line: string, after = true, onDone?: () => void) => {
  const tok = b.token;
  b.lineAt = b.tick;
  speak('meathead', line, s => { b.mh = s; }, after, () => { if (b.token === tok) onDone?.(); });
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame (the section's update calls it first: null when it's not on and he's not starting it)

export const updateBumper = (ctx: FrameContext, controls: Controls): Controls | null => {
  const { state } = ctx, p = state.player, b = bumperOf(state);
  b.tick++;
  const upNow = !!controls.up;
  if (b.phase === 'off') {
    if (uiUp) { setUi({ hudOff: false, bumperCard: null }); uiUp = false; }
    const cx = p.pos.x + p.width / 2, d = Math.abs(cx - CARNY_X);
    const free = !p.inCutscene && p.health > 0 && state.deathTimer <= 0;
    // (UP's zone: the whole booth (BOOTH.hw either side of him) and a good step past it, on the floor or hopping (the
    // owner's, 2026-11-02: "i really don't want players to miss it. same for all"): upZone.ts)
    const near = free && d < BOOTH.hw + 36 && onFloorish(p.pos.y + p.height, GY);
    // (his bark as Meathead comes up: the owner's line, once a visit)
    if (free && hookVisit !== landVisit() && d < 330) { hookVisit = landVisit(); b.callAt = b.tick; speak(CARNY_VOICE, CARNY_HOOK, s => { b.carny = s; }, false); }
    // (flagging him down: arms over his head, till he comes over; now and then a shout, never over anybody)
    b.waving = free && !near && d < (playedVisit === landVisit() ? WAVE_PLAYED : WAVE_FAR);
    if (b.waving && !b.carny && d < CALL_NEAR && hookVisit === landVisit() && b.tick - b.callAt > CALL_EVERY) {
      b.callAt = b.tick; speak(CARNY_VOICE, pickLine(byPants(state, CARNY_CALL)), s => { b.carny = s; }, false);
    }
    // (walked off out of sight once he's been flagged down or played: once a leaving, "WHERE ARE YOU GOING? COME
    // BACK!"; won (or won it before and not lost since), sore instead; nothing if the sore words just finished)
    const met = hookVisit === landVisit() || playedVisit === landVisit();
    if (walkOffDue(state, b.leave, CARNY_X, met, !b.carny && b.tick - b.callAt > 180)) {
      b.callAt = b.tick;
      const sore = b.won || (shardWon(SHARD_LAND, SHARD_ID) && !b.lost);
      if (!(b.won && b.tick - b.endAt < 300)) speak(CARNY_VOICE, pickLine(byPants(state, sore ? CARNY_LEAVE_WON : CARNY_LEAVE)), s => { b.carny = s; }, false);
    }
    if (near) { if (!b.prompted || getUi().upPrompt !== 'BUMPER CARS') setUi({ upPrompt: 'BUMPER CARS' }); b.prompted = true; }
    else if (b.prompted) { setUi({ upPrompt: null }); b.prompted = false; }
    const go = upStart(b, upNow && !b.wasUp, near, p.isGrounded);
    b.wasUp = upNow;
    if (!go) return null;
    b.waving = false;
    startOffer(state, b);
    return hands();
  }
  b.wasUp = upNow;
  b.t++;
  const fresh = (k: keyof Controls) => !!controls[k] && !b.was[k];
  const anyPress = fresh('jump') || fresh('shoot') || fresh('special') || fresh('secondary') || fresh('charge');
  const heldNow = anyHeld(controls);
  b.boostPress = fresh('special') || fresh('charge');
  b.was = { ...controls };
  switch (b.phase) {
    case 'offer': {
      hold(state, b, false);
      p.facing = CARNY_X < p.pos.x + p.width / 2 ? -1 : 1;
      // (in case a line never gets its turn)
      if (b.t > 900) toAsk(b);
      break;
    }
    case 'ask': {
      hold(state, b, false);
      const r = tickAsk(b.ask!, state.frame);
      if (r === 'accept') {
        b.ask = null; playedVisit = landVisit();
        if (cardVisit !== landVisit()) { cardVisit = landVisit(); b.phase = 'card'; b.t = 0; b.cardT = 0; b.cardArmed = false; setupRound(b); setUi({ bumperCard: { ready: false } }); }
        else startRound(b);
      } else if (r === 'back') {
        b.ask = null; b.token++;
        b.phase = 'decline'; b.t = 0;
        carnySays(b, pickLine(byPants(state, CARNY_DECLINE)));
        // (his to walk off from at once)
        p.inCutscene = false; setUi({ hudOff: false }); uiUp = false;
        b.phase = 'off';
      }
      break;
    }
    case 'card': {
      hold(state, b, true);
      b.cardT++;
      pollM2(state.frame);
      const padHeld = btn('ok') || btn('back') || btn('a') || btn('b') || btn('x') || btn('y');
      if (!b.cardArmed && b.cardT > CARD_HOLD && !heldNow && !padHeld) { b.cardArmed = true; setUi({ bumperCard: { ready: true } }); }
      if (b.cardArmed && (anyPress || pressed('ok') || pressed('back'))) { setUi({ bumperCard: null }); playSound('menuok', 0.6); startRound(b); }
      break;
    }
    case 'count': {
      hold(state, b, true);
      if (b.t === 1 || b.t === 41 || b.t === 81) playSound('beep', 0.7, 0);
      if (b.t === 121) { playSound('horn', 0.8, 2); playSound('beep', 0.8, 12); }
      if (b.t === 20) mhSays(b, pickLine(byPants(state, MH_START)), false);
      // (engines idling: a shiver)
      for (const c of b.cars) if (!c.dead && rnd() < 0.2) c.a += (rnd() - 0.5) * 0.01;
      tickParts(b);
      if (b.t >= COUNT) { b.phase = 'play'; b.t = 0; }
      break;
    }
    case 'play': {
      hold(state, b, true);
      runPlay(state, b, controls);
      break;
    }
    case 'won': {
      hold(state, b, true);
      runFrozen(state, b);
      if (b.t === 1) { playSound('ding', 0.9, 0); playSound('powerup', 0.6, 4); b.shake = 0; }
      if (b.t === 40) mhSays(b, pickLine(byPants(state, MH_WIN)), true, () => { if (b.phase === 'won') toPayout(state, b); });
      if (b.t > 520) toPayout(state, b);
      break;
    }
    case 'lost': {
      hold(state, b, true);
      runFrozen(state, b);
      if (b.t === 1) { playSound('truckhorn', 0.8, 0); silenceAll(); b.mh = null; b.carny = null; }
      if (b.t === 50) { const tok = b.token; carnySays(b, pickLine(byPants(state, CARNY_LOSE)), () => { if (b.token === tok && b.phase === 'lost') backOut(state, b); }); }
      if (b.t > 700) backOut(state, b);
      break;
    }
    case 'payout': {
      hold(state, b, false);
      p.facing = -1;
      if (b.t > 1200 && b.phase === 'payout') { if (!b.replay && awardShard(SHARD_LAND, SHARD_ID)) toAward(b); else release(state, b); }
      break;
    }
    case 'award': {
      hold(state, b, false);
      // (the A that closes it starts nothing: he's let go, and playing again is UP at the booth)
      if (b.shard && tickShardCard(b.shard, state.frame)) { b.shard = null; release(state, b); }
      break;
    }
  }
  // (in the rink, START pauses it, the pause menu showing its controls: minigamePause.ts; not on its card or the asks)
  if (b.phase === 'count' || b.phase === 'play' || b.phase === 'won' || b.phase === 'lost') minigamePausable(state, 'bumper', quitBumper);
  return hands();
};

/** QUIT MINIGAME (the pause menu: minigamePause.ts): out of the rink as a loss goes, stood by the carny, no prize (the
 *  shard's only ever given at the payout), his sore-loser line. */
const quitBumper = (state: GameState) => {
  const b = bumperOf(state);
  if (b.phase !== 'count' && b.phase !== 'play' && b.phase !== 'won' && b.phase !== 'lost') return;
  silenceAll(); b.carny = null;
  backOut(state, b, true);
};
/** Lost (the clock, or he quit): back out by the booth, let go, his sore-loser line. Again's UP at the booth. */
const backOut = (state: GameState, b: Bumper, quit = false) => {
  b.token++; b.lost = true; b.won = false;
  outOfRink(state, b);
  release(state, b);
  // (quit: the carny calls him out for it (the owner's "special callouts for quitting"); the clock: his own sore line)
  if (quit) speak(CARNY_VOICE, pickLine(byPants(state, CARNY_QUIT)), s => { b.carny = s; }, true);
  else meatheadSays(state, pickLine(byPants(state, MH_LOSE)), false);
};

const startOffer = (state: GameState, b: Bumper) => {
  const p = state.player;
  b.token++; b.phase = 'offer'; b.t = 0;
  b.replay = shardWon(SHARD_LAND, SHARD_ID);
  silenceAll(); b.carny = null;
  hold(state, b, false);
  p.facing = CARNY_X < p.pos.x + p.width / 2 ? -1 : 1;
  const tok = b.token;
  // (won already: his warning, no prize this time; lost last time: back for more?; else the offer)
  const back = !b.replay && b.lost;
  carnySays(b, pickLine(byPants(state, b.replay ? CARNY_SORE : back ? CARNY_BACK : CARNY_OFFER)), () => {
    if (b.token !== tok || b.phase !== 'offer') return;
    if (b.replay || back) toAsk(b);
    else meatheadSays(state, pickLine(byPants(state, MH_OFFERED)), true, () => { if (b.token === tok && b.phase === 'offer') toAsk(b); });
  });
};
const toAsk = (b: Bumper) => {
  b.phase = 'ask'; b.t = 0;
  b.ask = openAsk(b.replay ? 'BUMPER BASH (FOR FUN)' : 'BUMPER BASH', b.replay
    ? 'NO PRIZE THIS TIME. KILL EVERYONE ANYWAY?'
    : `KILL ALL ${RIVALS} CARS IN ${ROUND_SECS} SECONDS. WIN A PRIZE.`);
};
/** Won: the frozen beat over, back out at the booth, the carny's sore words (and the first time, the prize). */
const toPayout = (state: GameState, b: Bumper) => {
  b.token++; b.phase = 'payout'; b.t = 0; b.lost = false; b.won = true;
  outOfRink(state, b);
  hold(state, b, false);
  const tok = b.token;
  if (b.replay) carnySays(b, pickLine(byPants(state, CARNY_WIN_AGAIN)), () => { if (b.token === tok) release(state, b); });
  else carnySays(b, pickLine(byPants(state, CARNY_WIN)), () => {
    if (b.token !== tok) return;
    carnySays(b, pickLine(CARNY_PRIZE), () => {
      if (b.token !== tok || b.phase !== 'payout') return;
      // (his for good, there and then; won already somehow: just let him go)
      if (awardShard(SHARD_LAND, SHARD_ID)) toAward(b); else release(state, b);
    });
  });
};
const toAward = (b: Bumper) => { b.phase = 'award'; b.t = 0; b.shard = openShardCard(); };

// ---------------------------------------------------------------------------------------------------------------
// The round

/** A driver's head (`w`: the build's weight; the heavy ones come straighter and keener, the skinny ones flit about). */
const mkAi = (w: number): Ai => {
  const heavy = clamp((w - 0.72) / 0.73, 0, 1);
  const pers: Pers = {
    aggro: clamp(0.25 + rnd() * 0.45 + heavy * 0.15, 0.2, 0.85),
    focus: 50 + Math.floor(rnd() * 90 + heavy * 50),
    wobble: 0.15 + rnd() * 0.5 - heavy * 0.1,
    lead: Math.floor(rnd() * 18),
    lag: 8 + Math.floor(rnd() * 26),
    rash: 0.003 + rnd() * 0.008,
  };
  return { mode: 'roam', t: 30 + Math.floor(rnd() * 60), tgt: null, px: 400, py: 340, cool: 120 + Math.floor(rnd() * 120), side: 1, stuck: 0, pers, ph: rnd() * 6.3, aimX: 400, aimY: 340, aimT: 0 };
};
const setupRound = (b: Bumper) => {
  const cx = (RINK.x0 + RINK.x1) / 2, cy = (RINK.y0 + RINK.y1) / 2;
  b.cars = [];
  b.cars.push({ x: cx, y: RINK.y1 - 60, a: -Math.PI / 2, vx: 0, vy: 0, av: 0, hp: 100, mass: ME_MASS, w: 1.3, look: { woman: false, build: 1, skin: '#E0AC69', hair: '#18181B', shirt: '#E0AC69', pants: '#1E3A8A', long: false, bald: false, seed: 1, meathead: 'clean' }, color: ME_COLOR, num: 1, me: true, dead: false, boostT: 0, lastBoost: -99, hurtAt: -99, ai: mkAi(1), credit: -1 });
  // (the others round the top and sides of the rink, facing in; who's where shuffled)
  const order = RIVAL_LOOKS.map((_, i) => i).sort(() => rnd() - 0.5);
  const spots: [number, number][] = [[RINK.x0 + 80, RINK.y0 + 70], [cx - 150, RINK.y0 + 60], [cx + 150, RINK.y0 + 60], [RINK.x1 - 80, RINK.y0 + 70], [RINK.x0 + 70, cy + 40], [RINK.x1 - 70, cy + 40]];
  order.slice(0, RIVALS).forEach((li, i) => {
    const L = RIVAL_LOOKS[li], [x, y] = spots[i], w = BUILD_W[L.build];
    b.cars.push({ x, y, a: Math.atan2(cy - y, cx - x), vx: 0, vy: 0, av: 0, hp: 100, mass: 0.6 + w, w, look: L, color: L.color, num: li + 2, me: false, dead: false, boostT: 0, lastBoost: -99, hurtAt: -99, ai: mkAi(w), credit: -1 });
  });
  b.flings = []; b.parts = []; b.pops = []; b.clock = ROUND_SECS * 60; b.shake = 0; b.mh = null;
};
const startRound = (b: Bumper) => {
  b.token++;
  setupRound(b);
  b.phase = 'count'; b.t = 0;
};
/** His pants now (his car's look follows them). */
const pantsLook = (state: GameState, me: Car) => {
  const pants = byPants(state, { clean: ['clean'], shitty: ['shitty'], nude: ['nude'] })[0] as Look['meathead'];
  if (me.look.meathead !== pants) me.look = { ...me.look, meathead: pants };
};

const runPlay = (state: GameState, b: Bumper, controls: Controls) => {
  const me = b.cars[0];
  pantsLook(state, me);
  b.clock--;
  if (b.clock > 0 && b.clock <= 600 && b.clock % 60 === 0) playSound('beep', 0.5, b.clock <= 180 ? 10 : 4);
  runSim(state, b, controls);
  const left = b.cars.filter(c => !c.me && !c.dead).length;
  if (left === 0) { b.token++; b.phase = 'won'; b.t = 0; return; }
  if (b.clock <= 0) { b.clock = 0; b.token++; b.phase = 'lost'; b.t = 0; }
};

/** A frame of the cars (his driven by `controls`; null: his coasts). */
const runSim = (state: GameState, b: Bumper, controls: Controls | null) => {
  const me = b.cars[0];
  // ---- his inputs
  if (controls && !me.dead) {
    const turn = (controls.right ? 1 : 0) - (controls.left ? 1 : 0);
    const boostBtn = !!(controls.special || controls.charge);
    const charge = clamp((b.tick - me.lastBoost) / BOOST_REFILL, 0, 1);
    // (a fresh press of B, the meter full)
    if (boostBtn && b.boostPress && charge >= 1 && me.boostT <= 0) { me.boostT = BOOST_T; me.lastBoost = b.tick; playSound('whoosh', 0.9, -6); playSound('engine', 0.5, 6); for (let i = 0; i < 10; i++) addPart(b, me.x - Math.cos(me.a) * 26, me.y - Math.sin(me.a) * 26, -Math.cos(me.a) * 2 + (rnd() - 0.5) * 2, -Math.sin(me.a) * 2 + (rnd() - 0.5) * 2, 22, i % 2 ? '#FDE047' : '#F97316', 3, 'fire'); }
    drive(me, turn, !!controls.up, !!controls.down, GAS, BOOST_PUSH);
  } else drive(me, 0, false, false, GAS, BOOST_PUSH);
  // ---- the others
  for (const c of b.cars) {
    if (c.me) continue;
    if (c.dead) { coast(c); continue; }
    const { turn, gas, rev } = think(b, c);
    drive(c, turn, gas, rev, GAS_AI, LUNGE_PUSH);
  }
  for (const c of b.cars) move(b, c);
  collide(state, b);
  // ---- the poles' sparks off the ceiling grid, the buzz; the hulks smoking
  let fast = 0;
  for (const c of b.cars) {
    const sp = Math.hypot(c.vx, c.vy);
    if (c.dead) { if (b.tick % 7 === 0 && b.parts.length < 240) addPart(b, c.x + (rnd() - 0.5) * 14, c.y + (rnd() - 0.5) * 10, (rnd() - 0.5) * 0.4, -0.5 - rnd() * 0.5, 60, rnd() < 0.5 ? '#3F3A44' : '#57525C', 5 + rnd() * 4, 'smoke'); continue; }
    if (sp > 2) fast++;
    if (rnd() < 0.03 + sp * 0.03) { const [tx, ty] = poleTip(c); for (let i = 0; i < 3; i++) addPart(b, tx, ty, (rnd() - 0.5) * 3, (rnd() - 0.5) * 3, 8 + rnd() * 6, rnd() < 0.5 ? '#FEF9C3' : '#67E8F9', 1.5, 'spark'); }
  }
  if (fast > 0 && b.tick - b.buzzAt > 14 && rnd() < 0.5) { b.buzzAt = b.tick; playSound('taser', 0.05 + fast * 0.012, -6 + rnd() * 8); }
  tickFlings(state, b);
  tickParts(b);
  if (b.shake > 0) b.shake *= 0.85;
  for (const pp of b.pops) pp.t++;
  b.pops = b.pops.filter(pp => pp.t < 70);
};

/** Won or lost: the cars stop dead where they are (the owner's: "if you fail/succeed, pause the action. don't show them
 *  continuing to bump into you"): no driving, no bumps, no hits; just the flung drivers, the smoke and sparks settling. */
const runFrozen = (state: GameState, b: Bumper) => {
  for (const c of b.cars) { c.vx = 0; c.vy = 0; c.av = 0; c.boostT = 0; if (!c.me && c.ai.mode !== 'roam') { c.ai.mode = 'roam'; c.ai.t = 999; } }
  tickFlings(state, b);
  tickParts(b);
  if (b.shake > 0) b.shake *= 0.85;
  for (const pp of b.pops) pp.t++;
  b.pops = b.pops.filter(pp => pp.t < 70);
};

const poleTip = (c: Car): [number, number] => [c.x - Math.cos(c.a) * 22, c.y - Math.sin(c.a) * 22 - 18];

/** Tank controls: turning builds up and dies away (finicky), gas or reverse along the nose, the boost's shove. */
const drive = (c: Car, turn: number, gas: boolean, rev: boolean, gasK: number, boostK: number) => {
  c.av = clamp((c.av + turn * TURN_ACC) * TURN_DAMP, -TURN_MAX, TURN_MAX);
  c.a = wrap(c.a + c.av);
  const fx = Math.cos(c.a), fy = Math.sin(c.a);
  let thrust = gas ? gasK : rev ? -REVERSE : 0;
  if (c.boostT > 0) { thrust = boostK; c.boostT--; }
  c.vx += fx * thrust; c.vy += fy * thrust;
  // (grip along the nose, poor sideways: it slides)
  const f = c.vx * fx + c.vy * fy, l = -c.vx * fy + c.vy * fx;
  const f2 = f * (c.boostT > 0 ? DRAG_F_BOOST : DRAG_F), l2 = l * DRAG_L;
  c.vx = fx * f2 - fy * l2; c.vy = fy * f2 + fx * l2;
};
/** A hulk: heavy, scraping along, a slow spin dying away. */
const coast = (c: Car) => { c.vx *= 0.93; c.vy *= 0.93; c.av *= 0.85; c.a = wrap(c.a + c.av); };
const move = (b: Bumper, c: Car) => {
  const sp = Math.hypot(c.vx, c.vy);
  if (sp > VMAX) { c.vx *= VMAX / sp; c.vy *= VMAX / sp; }
  c.x += c.vx; c.y += c.vy;
  // (the rail: a rubber bounce, a thud, a spin off it)
  const hit = (imp: number) => {
    if (imp > 1.2) { playSound('thud', clamp(imp * 0.12, 0.15, 0.7), c.dead ? -10 : -4); playSound('boing', clamp(imp * 0.05, 0.05, 0.3), -8); }
    c.av += (rnd() - 0.5) * imp * 0.02;
    if (imp > 3) b.shake = Math.max(b.shake, imp * 0.5);
  };
  if (c.x < RINK.x0 + R) { c.x = RINK.x0 + R; if (c.vx < 0) { hit(-c.vx); c.vx = -c.vx * E_RAIL; } }
  if (c.x > RINK.x1 - R) { c.x = RINK.x1 - R; if (c.vx > 0) { hit(c.vx); c.vx = -c.vx * E_RAIL; } }
  if (c.y < RINK.y0 + R) { c.y = RINK.y0 + R; if (c.vy < 0) { hit(-c.vy); c.vy = -c.vy * E_RAIL; } }
  if (c.y > RINK.y1 - R) { c.y = RINK.y1 - R; if (c.vy > 0) { hit(c.vy); c.vy = -c.vy * E_RAIL; } }
};

/** Car on car: shoved apart by mass, an elastic bounce, a spin, and the damage. */
const collide = (state: GameState, b: Bumper) => {
  const cs = b.cars;
  for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) {
    const A = cs[i], B = cs[j];
    const dx = B.x - A.x, dy = B.y - A.y, d2 = dx * dx + dy * dy;
    if (d2 >= 4 * R * R || d2 < 1e-6) continue;
    const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
    const mA = A.dead ? HULK_MASS : A.mass, mB = B.dead ? HULK_MASS : B.mass;
    const over = 2 * R - d;
    A.x -= nx * over * (mB / (mA + mB)); A.y -= ny * over * (mB / (mA + mB));
    B.x += nx * over * (mA / (mA + mB)); B.y += ny * over * (mA / (mA + mB));
    const rel = (A.vx - B.vx) * nx + (A.vy - B.vy) * ny;
    if (rel <= 0) continue;
    // (how much of the closing speed each brought: the one doing the ramming does the hurting)
    const cA = Math.max(0, A.vx * nx + A.vy * ny), cB = Math.max(0, -(B.vx * nx + B.vy * ny));
    const e = A.dead || B.dead ? 0.55 : E_CARS;
    const jimp = ((1 + e) * rel) / (1 / mA + 1 / mB);
    A.vx -= (jimp / mA) * nx; A.vy -= (jimp / mA) * ny;
    B.vx += (jimp / mB) * nx; B.vy += (jimp / mB) * ny;
    const tang = (A.vx - B.vx) * -ny + (A.vy - B.vy) * nx;
    A.av += tang * 0.006 / mA + (rnd() - 0.5) * rel * 0.01; B.av -= tang * 0.006 / mB - (rnd() - 0.5) * rel * 0.01;
    impact(state, b, A, B, rel, cA, cB, (A.x + B.x) / 2, (A.y + B.y) / 2);
  }
};

const impact = (state: GameState, b: Bumper, A: Car, B: Car, rel: number, cA: number, cB: number, x: number, y: number) => {
  // (the sound: a rubber thud, deeper for heavier, a clang for a hulk)
  if (rel > 0.8) {
    const heavy = (A.dead ? HULK_MASS : A.mass) + (B.dead ? HULK_MASS : B.mass);
    playSound('thud', clamp(rel * 0.13, 0.15, 0.9), 2 - heavy * 2);
    playSound('boing', clamp(rel * 0.06, 0.05, 0.4), 4 - heavy * 2);
    if (A.dead || B.dead) playSound('clang', clamp(rel * 0.06, 0.05, 0.4), -6);
    for (let i = 0; i < Math.min(8, rel * 2); i++) addPart(b, x, y, (rnd() - 0.5) * rel, (rnd() - 0.5) * rel, 10, i % 2 ? '#FEF08A' : '#FFFFFF', 2, 'spark');
  }
  if (rel > 3.5) b.shake = Math.max(b.shake, rel * 0.6);
  const meCar = b.cars[0];
  // (only his doing hurts (ME_PUSH, CREDIT_T): his own drive into them, or a car or hulk he sent flying)
  const hurt = (V: Car, By: Car, push: number, flung = false) => {
    if (V.dead || V.me) return;
    const his = flung || (By.me ? push >= ME_PUSH : By.credit > b.tick && push > 0.3);
    if (!his) return;
    // (what he hit goes flying on his say-so: whatever it smacks next is on him too; a knock-on, a shorter while)
    if (!flung) V.credit = Math.max(V.credit, b.tick + (By.me ? CREDIT_T : CREDIT_T / 2));
    if (b.tick - V.hurtAt < 10) return;
    const byMass = By.dead ? HULK_MASS : By.mass;
    let dmg = (push * BUMP_K + rel * 0.25 * BUMP_K * 0.3) * (byMass / 1.6) / V.w;
    // (a boosted ram (his): massive)
    const boosted = By.me && (By.boostT > 0 || b.tick - By.lastBoost < BOOST_T + 6) && push > 2.2;
    if (boosted) { dmg = Math.max(dmg, BOOST_DMG / V.w); By.boostT = 0; playSound('punch', 1, -6); playSound('crunch', 0.8, 0); b.shake = Math.max(b.shake, 9); }
    if (dmg < 1) return;
    V.hurtAt = b.tick; V.hp -= dmg;
    if (V.hp <= 0) kill(state, b, V, By.me ? By : meCar, boosted);
  };
  // (a car he's sent flying takes the smack too, whatever it hits)
  const flown = (V: Car, Other: Car) => { if (!Other.me && V.credit > b.tick && rel * 0.5 > 0.3) hurt(V, Other, rel * 0.5, true); };
  hurt(B, A, cA); hurt(A, B, cB);
  flown(A, B); flown(B, A);
  // (a hulk he shoves: on him too, while it slides)
  if (A.me && B.dead && cA >= ME_PUSH) B.credit = b.tick + CREDIT_T; else if (B.me && A.dead && cB >= ME_PUSH) A.credit = b.tick + CREDIT_T;
  // (him rammed hard by one of theirs: knocked about, now and then his line)
  const me = A.me ? A : B.me ? B : null, them = me === A ? B : A, push = me === A ? cB : cA;
  if (me && !them.dead && push > 3.5 && b.tick - b.rammedAt > 480 && b.tick - b.lineAt > 300 && rnd() < 0.5) { b.rammedAt = b.tick; mhSays(b, pickLine(byPants(state, MH_RAMMED)), false); }
};

/** At nothing: the car goes up, the driver's flung at the screen; the burnt-out hulk stays (pushable). */
const kill = (state: GameState, b: Bumper, c: Car, by: Car, boosted: boolean) => {
  c.dead = true; c.hp = 0; c.boostT = 0;
  playSound('boom', 0.75, 0); playSound('screams', 0.5, 6);
  b.shake = Math.max(b.shake, 10);
  for (let i = 0; i < 26; i++) { const a = rnd() * Math.PI * 2, s = 1 + rnd() * 5; addPart(b, c.x, c.y, Math.cos(a) * s, Math.sin(a) * s, 18 + rnd() * 16, ['#FDE047', '#F97316', '#EF4444', '#FFFFFF'][i % 4], 3 + rnd() * 4, 'fire'); }
  for (let i = 0; i < 12; i++) addPart(b, c.x + (rnd() - 0.5) * 20, c.y + (rnd() - 0.5) * 20, (rnd() - 0.5) * 1.5, -0.6 - rnd(), 50 + rnd() * 30, '#2A2630', 8 + rnd() * 6, 'smoke');
  // (where they'll come down flat: out on the floor, clear of the rail)
  const fx = clamp(c.x + (rnd() - 0.5) * 260, RINK.x0 + 70, RINK.x1 - 70), fy = clamp(c.y + (rnd() - 0.5) * 200, RINK.y0 + 70, RINK.y1 - 70);
  b.flings.push({ look: c.look, sx: c.x, sy: c.y, fx, fy, t: 0, over: false, rot: (rnd() - 0.5) * 1.2, dir: rnd() < 0.5 ? -1 : 1, px: c.x, py: c.y, runs: 0, runAt: -99 });
  if (by.me && b.tick - b.lineAt > 180 && rnd() < (boosted ? 0.7 : 0.4)) mhSays(b, pickLine(byPants(state, MH_KILL)), false);
};

/** The others (the owner's, 2026-11-02: "make them more sporadic with their ability to track you"; "other cars may try
 *  to bump into others; they won't one track to you only"): each on its own whim (Pers). They pick anyone to go after,
 *  him or one of the others, keep at it a burst (focus), then lose interest; they drive at where their mark was a moment
 *  ago (lag), so they overshoot; they weave, swerve off, stop dead for a bit, wander; now and then line up, rev (the
 *  tell: shaking, beeping, exhaust) and lunge. They gang up on him a bit more as they thin out. Back off a wall. */
const think = (b: Bumper, c: Car): { turn: number; gas: boolean; rev: boolean } => {
  const ai = c.ai, me = b.cars[0], P = ai.pers;
  ai.t--; ai.cool--; ai.aimT--; ai.ph += 0.05 + P.wobble * 0.08;
  const sp = Math.hypot(c.vx, c.vy);
  if (ai.mode === 'back') { if (ai.t <= 0) { ai.mode = 'roam'; ai.t = 20; } return { turn: ai.side, gas: false, rev: true }; }
  if (ai.mode === 'idle') { if (ai.t <= 0) { ai.mode = 'roam'; ai.t = 0; } return { turn: rnd() < 0.04 ? ai.side : 0, gas: false, rev: false }; }
  if (ai.mode === 'swerve') { if (ai.t <= 0) { ai.mode = ai.tgt ? 'hunt' : 'roam'; ai.t = Math.max(ai.t, 20); } return { turn: ai.side, gas: true, rev: false }; }
  if (ai.mode === 'rev') {
    // (the tell: stopped, shaking, beeping, blowing smoke out the back)
    c.a += (rnd() - 0.5) * 0.05;
    if (ai.t % 10 === 0) playSound('beep', 0.35, 8);
    if (ai.t % 4 === 0) addPart(b, c.x - Math.cos(c.a) * 28, c.y - Math.sin(c.a) * 28, -Math.cos(c.a) * 1.2, -Math.sin(c.a) * 1.2, 26, '#9CA3AF', 4, 'smoke');
    const tgt = ai.tgt ?? me, want = Math.atan2(tgt.y - c.y, tgt.x - c.x), diff = wrap(want - c.a);
    if (ai.t <= 0) { ai.mode = 'lunge'; ai.t = 34; c.boostT = LUNGE_T; playSound('whoosh', 0.7, -2); }
    return { turn: Math.abs(diff) > 0.05 ? Math.sign(diff) : 0, gas: false, rev: false };
  }
  if (ai.mode === 'lunge') { if (ai.t <= 0) { ai.mode = 'hunt'; ai.t = 30 + Math.floor(rnd() * 40); } return { turn: 0, gas: true, rev: false }; }
  // (bored of it, or the mark's gone: a new whim)
  if (ai.t <= 0 || (ai.tgt && ai.tgt.dead) || (ai.mode === 'hunt' && rnd() < 0.004)) {
    const others = b.cars.filter(o => !o.me && !o.dead && o !== c);
    const pMe = clamp(P.aggro * (0.6 + (RIVALS - 1 - others.length) * 0.1), 0.15, 0.8), r = rnd();
    if (r < 0.08) { ai.mode = 'idle'; ai.tgt = null; ai.t = 25 + Math.floor(rnd() * 55); ai.side = rnd() < 0.5 ? -1 : 1; return { turn: 0, gas: false, rev: false }; }
    if (r < 0.08 + pMe || !others.length) { ai.mode = 'hunt'; ai.tgt = me; }
    else if (r < 0.08 + pMe + (1 - pMe) * 0.7) {
      // (one of the others: the nearest, mostly; any of them, sometimes)
      ai.mode = 'hunt';
      ai.tgt = rnd() < 0.6 ? others.reduce((a, o) => (Math.hypot(o.x - c.x, o.y - c.y) < Math.hypot(a.x - c.x, a.y - c.y) ? o : a), others[0]) : others[Math.floor(rnd() * others.length)];
    } else { ai.mode = 'roam'; ai.tgt = null; ai.px = RINK.x0 + 80 + rnd() * (RINK.x1 - RINK.x0 - 160); ai.py = RINK.y0 + 80 + rnd() * (RINK.y1 - RINK.y0 - 160); }
    ai.t = ai.mode === 'hunt' ? P.focus + Math.floor(rnd() * P.focus) : 60 + Math.floor(rnd() * 100);
    ai.aimT = 0;
  }
  // (where they think the mark is: looked at again every `lag` frames, led a bit; between looks, it's where it was)
  if (ai.tgt && ai.aimT <= 0) { ai.aimT = P.lag + Math.floor(rnd() * P.lag); ai.aimX = ai.tgt.x + ai.tgt.vx * P.lead; ai.aimY = ai.tgt.y + ai.tgt.vy * P.lead; }
  const tx = ai.tgt ? ai.aimX : ai.px, ty = ai.tgt ? ai.aimY : ai.py;
  const dist = Math.hypot(tx - c.x, ty - c.y);
  // (a weave on top: never a dead-straight line)
  const diff = wrap(Math.atan2(ty - c.y, tx - c.x) + Math.sin(ai.ph) * P.wobble - c.a);
  // (a swerve off out of nowhere)
  if (rnd() < P.rash) { ai.mode = 'swerve'; ai.t = 14 + Math.floor(rnd() * 22); ai.side = rnd() < 0.5 ? -1 : 1; return { turn: ai.side, gas: true, rev: false }; }
  if (ai.tgt && dist > 150 && dist < 330 && Math.abs(diff) < 0.3 && ai.cool <= 0 && rnd() < (ai.tgt === me ? 0.03 : 0.02)) { ai.mode = 'rev'; ai.t = 36; ai.cool = 260 + Math.floor(rnd() * 200); }
  const gas = Math.abs(diff) < 0.85;
  // (stuck nose-first in the rail or a hulk: back off, turning)
  if (gas && sp < 0.45) ai.stuck++; else ai.stuck = Math.max(0, ai.stuck - 2);
  if (ai.stuck > 45) { ai.mode = 'back'; ai.t = 32; ai.side = rnd() < 0.5 ? -1 : 1; ai.stuck = 0; }
  // (at the spot (roaming), or past where the mark was (they overshoot: carry on a beat, then look again))
  if (ai.mode === 'roam' && dist < 50) ai.t = 0;
  if (ai.tgt && dist < 40) ai.aimT = Math.min(ai.aimT, 6);
  return { turn: Math.abs(diff) > 0.1 ? Math.sign(diff) : 0, gas, rev: !gas && dist < 110 && Math.abs(diff) > 2.3 };
};

// ---- the flung drivers: up at the screen, splat, peel down it, drop flat on the floor; then there to run over
const UP = 34, SMACK = 64, PEEL = 122, DROP = 148;
const flingPhase = (f: Fling): FlingPhase => (f.t < UP ? 'up' : f.t < SMACK ? 'smack' : f.t < PEEL ? 'peel' : f.t < DROP ? 'drop' : 'flat');
const tickFlings = (state: GameState, b: Bumper) => {
  const me = b.cars[0];
  for (const f of b.flings) {
    const was = flingPhase(f);
    f.t++;
    const ph = flingPhase(f);
    if (was === 'up' && ph === 'smack') { playSound('splat', 1, -4); playSound('crunch', 0.7, -6); playSound('squish', 0.6, 0); b.shake = Math.max(b.shake, 8); }
    if (was === 'smack' && ph === 'peel') playSound('squish', 0.4, -10);
    if (was === 'drop' && ph === 'flat') { playSound('splat', 0.55, 4); for (let i = 0; i < 8; i++) addPart(b, f.fx + (rnd() - 0.5) * 30, f.fy + (rnd() - 0.5) * 20, (rnd() - 0.5) * 2, (rnd() - 0.5) * 2, 18, '#A1A1AA', 3, 'dust'); }
    // (run over: OVERKILL)
    if (ph === 'flat' && !f.over && !me.dead && Math.hypot(me.x - f.fx, me.y - f.fy) < R + 8 && Math.hypot(me.vx, me.vy) > 1.1 && b.phase === 'play') {
      f.over = true;
      playSound('squish', 1, -6); playSound('crunch', 0.9, -2); playSound('boing', 0.5, 10);
      announce(OVERKILL_CALL, 1, true);
      b.pops.push({ text: 'OVERKILL!', x: f.fx, y: f.fy - 30, t: 0, col: '#F472B6' });
      for (let i = 0; i < 10; i++) { const a = rnd() * Math.PI * 2; addPart(b, f.fx, f.fy, Math.cos(a) * 3, Math.sin(a) * 3, 24, i % 2 ? '#FDE047' : '#FFFFFF', 3, 'star'); }
      if (b.tick - b.lineAt > 200 && rnd() < 0.5) mhSays(b, pickLine(byPants(state, MH_OVERKILL)), false);
    }
    if (ph === 'flat' && b.phase === 'play') runOver(b, f);
  }
};
/** A flattened driver under any live car going at a fair clip (his or theirs): shoved along with it, rolled over,
 *  bled on the floor; a couple of goes and they're squashed. Nobody's hurt by it (they're dead already). */
const runOver = (b: Bumper, f: Fling) => {
  if (b.tick - f.runAt < 18) return;
  for (const c of b.cars) {
    if (c.dead) continue;
    if (Math.hypot(c.vx, c.vy) < 1.1 || Math.hypot(c.x - f.fx, c.y - f.fy) >= R + 8) continue;
    f.runAt = b.tick; f.runs++;
    f.fx = clamp(f.fx + c.vx * 5, RINK.x0 + 40, RINK.x1 - 40); f.fy = clamp(f.fy + c.vy * 5, RINK.y0 + 40, RINK.y1 - 40);
    f.rot = wrap(f.rot + (rnd() < 0.5 ? -1 : 1) * (0.6 + rnd() * 1.2));
    playSound('squish', 0.7, -4 + rnd() * 8); playSound('crunch', 0.5, -2 + rnd() * 6);
    for (let i = 0; i < 10; i++) { const a = rnd() * Math.PI * 2, s = 0.5 + rnd() * 2.5; addPart(b, f.fx, f.fy, Math.cos(a) * s + c.vx * 0.3, Math.sin(a) * s + c.vy * 0.3, 20 + rnd() * 16, i % 3 ? '#B91C1C' : '#7F1D1D', 2 + rnd() * 3, 'dust'); }
    // (the car rides up over it: a jolt)
    c.vx *= 0.9; c.vy *= 0.9; c.av += (rnd() - 0.5) * 0.04;
    return;
  }
};

const addPart = (b: Bumper, x: number, y: number, vx: number, vy: number, life: number, col: string, size: number, kind: Part['kind']) => {
  if (b.parts.length > 260) return;
  b.parts.push({ x, y, vx, vy, life, max: life, col, size, kind });
};
const tickParts = (b: Bumper) => {
  for (const p of b.parts) {
    p.x += p.vx; p.y += p.vy; p.life--;
    if (p.kind === 'smoke') { p.vx *= 0.97; p.vy *= 0.97; p.size += 0.12; }
    else if (p.kind === 'fire') { p.vx *= 0.9; p.vy *= 0.9; }
    else { p.vx *= 0.92; p.vy *= 0.92; }
  }
  b.parts = b.parts.filter(p => p.life > 0);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing: the carny at the booth (the section's back and front), the rink over everything (its drawHud)

/** In his booth, behind him (the section's drawBack): the booth's inside, the carny (waving him down, or not), the
 *  booth's front over his legs. */
export const drawBumperWorld = (c: CanvasRenderingContext2D, state: GameState) => {
  const b = bumperOf(state);
  if (inRink(b)) return;
  const cam = state.camera.x;
  if (CARNY_X < cam - 160 || CARNY_X > cam + W + 160) return;
  const p = state.player, dir: 1 | -1 = p.pos.x + p.width / 2 < CARNY_X ? -1 : 1;
  bumperBoothBack(c, state);
  // (up on a step inside, so he's in the window from the belt up: the wave reads over the sill)
  drawCarny(c, CARNY_X, GY - 22, dir, !!b.carny, state.frame, b.phase === 'off' && b.waving);
  bumperBoothFront(c, state);
};
/** His words over him (the section's drawFront). */
export const drawBumperWorldFront = (c: CanvasRenderingContext2D, state: GameState) => {
  const b = bumperOf(state);
  if (inRink(b) || !b.carny) return;
  // (over the booth's marquee)
  saidOver(c, b.carny.text, CARNY_X, GY - 296, '#FDE68A', 220);
};

const outlined = (c: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, fill: string, ink = '#1A1028', lw = 4) => {
  c.font = `${size}px "Press Start 2P"`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.lineJoin = 'round'; c.strokeStyle = ink; c.lineWidth = lw; c.strokeText(text, x, y); c.fillStyle = fill; c.fillText(text, x, y);
};

/** The rink, over the whole screen (the section's drawHud). */
export const drawBumper = (c: CanvasRenderingContext2D, state: GameState) => {
  const b = bumperOf(state);
  if (!inRink(b) || !b.cars.length) return;
  c.save();
  c.imageSmoothingEnabled = false;
  const sh = b.shake > 0.5 ? b.shake : 0;
  c.translate(Math.round((rnd() - 0.5) * sh), Math.round((rnd() - 0.5) * sh));
  c.drawImage(arenaCanvas(), 0, 0);
  // (the flattened ones on the floor first: the cars drive over them)
  for (const f of b.flings) if (flingPhase(f) === 'flat') {
    c.fillStyle = 'rgba(10,6,16,0.3)'; c.beginPath(); c.ellipse(f.fx + 3, f.fy + 4, 30, 24, 0, 0, Math.PI * 2); c.fill();
    drawFig(c, f.look, f.over || f.runs >= 2 ? 'over' : 'flat', f.fx, f.fy, 0.95, f.rot);
  }
  // (the cars and the hulks: their shadows, then each turned, the poles up to the grid)
  for (const car of b.cars) { c.fillStyle = 'rgba(8,4,14,0.4)'; c.beginPath(); c.ellipse(car.x + 4, car.y + 6, 31, 25, 0, 0, Math.PI * 2); c.fill(); }
  const order = [...b.cars].sort((p, q) => p.y - q.y);
  for (const car of order) {
    const cv = car.dead ? hulkCanvas(car.color, car.num) : carCanvas(car.color, car.num, car.look);
    c.save(); c.translate(Math.round(car.x), Math.round(car.y));
    if (!car.dead && car.ai.mode === 'rev') c.translate((rnd() - 0.5) * 2, (rnd() - 0.5) * 2);
    c.rotate(car.a);
    c.drawImage(cv, -CAR_W / 2, -CAR_H / 2);
    // (hurt: a flash; boosting: the flames out the back)
    if (!car.dead && b.tick - car.hurtAt < 6) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.5; c.drawImage(cv, -CAR_W / 2, -CAR_H / 2); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; }
    if (car.boostT > 0) for (let k = 0; k < 3; k++) { c.fillStyle = k === 0 ? '#F97316' : k === 1 ? '#FDE047' : '#FFFFFF'; c.beginPath(); c.ellipse(-30 - (2 - k) * 4 - rnd() * 6, 0, 10 - k * 3, 6 - k * 1.6, 0, 0, Math.PI * 2); c.fill(); }
    c.restore();
    // (the pole: up from the back to the grid, its shoe and spring; bent over on a hulk)
    const bx = car.x - Math.cos(car.a) * 22, by = car.y - Math.sin(car.a) * 22;
    const [tx, ty] = car.dead ? [bx + 10, by - 6] : poleTip(car);
    c.strokeStyle = '#1A1028'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(bx, by); c.lineTo(tx, ty); c.stroke();
    c.strokeStyle = car.dead ? '#3A302C' : '#C4C4CC'; c.lineWidth = 1.5; c.stroke();
    if (!car.dead) { c.fillStyle = '#1A1028'; c.fillRect(tx - 5, ty - 2, 10, 4); c.fillStyle = '#A1A1AA'; c.fillRect(tx - 4, ty - 1, 8, 2); if (b.tick % 6 < 2) { c.fillStyle = '#FEF9C3'; c.fillRect(tx - 1, ty - 4, 2, 2); } }
  }
  // (sparks, fire, smoke, stars)
  for (const p of b.parts) {
    const k = p.life / p.max;
    if (p.kind === 'smoke') { c.globalAlpha = 0.5 * k; c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, p.size, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
    else if (p.kind === 'star') { c.fillStyle = p.col; c.save(); c.translate(p.x, p.y); c.rotate(p.life * 0.3); c.fillRect(-p.size, -0.8, p.size * 2, 1.6); c.fillRect(-0.8, -p.size, 1.6, p.size * 2); c.restore(); }
    else { c.fillStyle = p.col; const s = p.kind === 'fire' ? p.size * (0.4 + k * 0.6) : p.size; c.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), Math.max(1, Math.round(s)), Math.max(1, Math.round(s))); }
  }
  c.drawImage(gridCanvas(), 0, 0);
  // (the flung: up at the glass, splatted on it, peeling down it, dropping away to the floor)
  for (const f of b.flings) drawFling(c, f);
  // (the board's face: the clock, the cars left, his boost)
  drawBoard(c, b);
  // (the carny at his podium; what's said over heads)
  drawCarnyTop(c, PODIUM.x, PODIUM.y);
  if (b.carny) saidOver(c, b.carny.text, PODIUM.x + 70, PODIUM.y + 70, '#FDE68A', 220);
  const me = b.cars[0];
  if (b.mh) saidOver(c, b.mh.text, clamp(me.x, 130, W - 130), me.y - 36, '#FFFFFF', 220);
  for (const pp of b.pops) { const s = pp.t < 8 ? 6 + pp.t * 1.2 : 16; c.globalAlpha = pp.t > 50 ? (70 - pp.t) / 20 : 1; outlined(c, pp.text, pp.x, pp.y - pp.t * 0.4, s, pp.col); c.globalAlpha = 1; }
  c.restore();
  // (the big words: the countdown, BUMP!, TIME!, EVERYBODY'S DEAD!)
  const stamp = (text: string, t: number, col: string) => { const s = t < 10 ? 60 - t * 3.6 : 24 + Math.sin(t * 0.3) * 1.5; outlined(c, text, W / 2, H / 2 - 10, Math.max(20, s), col, '#1A1028', 8); };
  if (b.phase === 'count') { const n = Math.floor(b.t / 40); stamp(n < 3 ? String(3 - n) : 'BUMP!', b.t % 40, n < 3 ? '#FDE047' : '#F472B6'); }
  if (b.phase === 'play' && b.t < 30) stamp('BUMP!', b.t + 40, '#F472B6');
  if (b.phase === 'won') stamp("EVERYBODY'S DEAD!", b.t, '#86EFAC');
  if (b.phase === 'lost') stamp('TIME!', b.t, '#F87171');
};

const drawFling = (c: CanvasRenderingContext2D, f: Fling) => {
  const ph = flingPhase(f);
  if (ph === 'flat') return;
  const tx = f.sx * 0.55 + W * 0.45 * 0.5 + 90 * f.dir, ty = 200;
  if (ph === 'up') {
    const u = f.t / UP, e = 1 - (1 - u) * (1 - u);
    const x = f.sx + (tx - f.sx) * e, y = f.sy + (ty - f.sy) * e - Math.sin(u * Math.PI) * 50, s = 0.8 + e * 3.2;
    f.px = x; f.py = y;
    drawFig(c, f.look, (f.t >> 2) % 2 ? 'fly1' : 'fly0', x, y, s, f.t * 0.42 * f.dir);
    return;
  }
  if (ph === 'smack') {
    // (splat on the glass: big and flat, a wobble dying away, a crack of stars round it)
    const k = f.t - UP, wob = Math.sin(k * 0.9) * Math.max(0, 1 - k / 20) * 0.12;
    drawFig(c, f.look, 'flat', f.px, f.py, 4.2, 0, 1 + wob, 1 - wob);
    if (k < 14) for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, r = 90 + k * 4; c.fillStyle = i % 2 ? '#FFFFFF' : '#FDE047'; c.fillRect(f.px + Math.cos(a) * r - 3, f.py + Math.sin(a) * r * 0.9 - 3, 6, 6); }
    if (k < 22) outlined(c, 'SPLAT!', f.px, f.py - 120, 18, '#FDE047');
    return;
  }
  if (ph === 'peel') {
    // (peeling down the glass: sliding, the top curling over (shorter, its back showing as a darker flap))
    const k = (f.t - SMACK) / (PEEL - SMACK), e = k * k;
    const y = f.py + e * 160;
    drawPeel(c, f.look, f.px, y, 4.2, Math.min(1, k * 1.15));
    return;
  }
  // (drop: unstuck, falling away from the glass down to the floor, smaller and smaller)
  const k = (f.t - PEEL) / (DROP - PEEL), e = k * k;
  const y0 = f.py + 160;
  const x = f.px + (f.fx - f.px) * e, y = y0 + (f.fy - y0) * e - Math.sin(k * Math.PI) * 30, s = 4.2 + (0.95 - 4.2) * Math.sqrt(k);
  drawFig(c, f.look, 'flat', x, y, s, f.rot * k);
};

const drawBoard = (c: CanvasRenderingContext2D, b: Bumper) => {
  const secs = Math.ceil(b.clock / 60), mm = Math.floor(secs / 60), ss = secs % 60;
  const low = b.clock <= 600 && b.phase === 'play';
  c.font = '8px "Press Start 2P"'; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  c.fillStyle = '#A78BFA'; c.fillText('TIME', 176, 32);
  outlined(c, `${mm}:${String(ss).padStart(2, '0')}`, 214, 54, 18, low && (b.tick >> 4) % 2 ? '#F87171' : '#FDBA74', '#1A0B06', 3);
  // (the cars left: a little car each, lit, or burnt out with an X)
  c.font = '8px "Press Start 2P"'; c.textAlign = 'center'; c.fillStyle = '#A78BFA'; c.fillText('CARS LEFT', 400, 32);
  const rivals = b.cars.filter(x => !x.me);
  rivals.forEach((r, i) => {
    const x = 400 + (i - (rivals.length - 1) / 2) * 24, y = 50;
    c.fillStyle = '#1A1028'; c.beginPath(); c.roundRect(x - 9, y - 7, 18, 14, 5); c.fill();
    c.fillStyle = r.dead ? '#3A302C' : r.color; c.beginPath(); c.roundRect(x - 7, y - 5, 14, 10, 4); c.fill();
    if (r.dead) { c.strokeStyle = '#F87171'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 6, y - 5); c.lineTo(x + 6, y + 5); c.moveTo(x + 6, y - 5); c.lineTo(x - 6, y + 5); c.stroke(); }
    else { c.fillStyle = '#FFFFFF'; c.fillRect(x + 2, y - 1, 2, 2); }
  });
  // (his boost: segments filling, READY flashing when full)
  const me = b.cars[0], k = clamp((b.tick - me.lastBoost) / BOOST_REFILL, 0, 1), ready = k >= 1;
  c.font = '8px "Press Start 2P"'; c.textAlign = 'right'; c.fillStyle = '#A78BFA'; c.fillText('BOOST', 624, 32);
  for (let i = 0; i < 10; i++) {
    const x = 522 + i * 10, on = k * 10 > i;
    c.fillStyle = '#1A1028'; c.fillRect(x - 1, 40, 9, 16);
    c.fillStyle = on ? (ready ? ((b.tick >> 3) % 2 ? '#F472B6' : '#FDE047') : i < 4 ? '#F97316' : i < 8 ? '#FACC15' : '#86EFAC') : '#2A1E36';
    c.fillRect(x, 41, 7, 14);
    if (on) { c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x, 41, 7, 2); }
  }
  if (ready && b.phase === 'play') outlined(c, 'READY', 572, 68, 8, '#FDE047', '#1A0B06', 3);
};

/** For the contact sheet (tools): set up a round as it'd start and run it a few seconds with nobody at the wheel. */
export const _sheetRound = (state: GameState) => {
  const b = bumperOf(state);
  setupRound(b); b.phase = 'play'; b.t = 0;
  return b;
};
export type { Bumper as _Bumper };
/** For a balance check (tools): a frame of play with these buttons, his pants left as they are. */
export const _simStep = (state: GameState, controls: Controls, boostPress: boolean) => {
  const b = bumperOf(state);
  b.tick++; b.t++; b.clock--; b.boostPress = boostPress;
  runSim(state, b, controls);
  return { left: b.cars.filter(c => !c.me && !c.dead).length, clock: b.clock };
};
