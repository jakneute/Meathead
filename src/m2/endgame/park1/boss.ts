// THE SUMMIT: ZORZARBLAX, Zorblax and Zarblax's kid (level 1's boss). The owner's (2026-11-06): "bosses in the final
// stretch should be generally more difficult than the land bosses you fought prior ... i want him to be a big lumbering
// monstrosity who goes back and forth and swings his weird appendages at you and seems to be in obvious intense
// discomfort, being a weird deformed incest baby and all. the gag is general unpleasantness." (The full mechanics are
// still to come from the owner: this is the lumbering misery.)
//
// The standing boss rules: 999 HP like the rematches; the 75-frame breather after a hit; every hit off the water park's
// own damage table (weapons/endgameDamage.ts); the crossbow's sick hurl (30 darts, one 85 burst); no more than about
// five seconds of one attack (the spam breaker: he stamps the floor and lumbers off).
//
//   THE INTRO   (a cutscene, skippable, all of it; no HUD) Up the stairs onto the summit: he kicks the door in. The kid's
//               sat at the slide's mouth at the far end, looking at the view, his back to him; turns round (the
//               gross-up); his say, Meathead's, his again; on. A retry: a beat for the kid to turn round and say so.
//   THE KID     Huge (kidArt.ts KID_S: four Meatheads tall, hunched), slow, heavy: he paces back and forth over the
//               summit, every footfall a thud and a shake, often straight through where Meathead's stood. Walking into
//               him hurts (his gut and up); there's a gap under the gut between his legs, so duck or slide under him to
//               get past (down on his knee, squatting to swing, there's no gap). He's in misery the whole fight:
//               wheezing, drooling, a boil swelling up and popping in a spray of pus, stopping mid-walk to whine,
//               scratching the rash raw, retching. The swings, every one with its windup:
//     SLAM      both big arms up over his head, trembling, a shadow on the floor where they'll land (he lumbers toward
//               him under them): down, both fists, a big hit; and they're stuck a while (pulling his knuckles out of the
//               floor: an opening). Low on health, sometimes a second.
//     LOW SWEEP the gun arm dragged back along the floor behind him, knuckles scraping, the far one out front: both
//               swing round along the floor, in front of him and behind. Jump it.
//     HIGH SWEEP the gun arm cocked back up at his head, a whistle: it swings round level, waist high on Meathead, in
//               front. Duck (or slide) under it. Low on health, a low sweep's sometimes chained straight into it.
//     WHIP      the gun arm coiled back up over his head, wheezing: it unspools out along the floor, the forearm
//               stretching like taffy right across the summit, the hand slapping along at the end. Jump it.
//     GRAB      all three hands out at him, open, the drool stringing down: a lurch forward. Duck it or get clear.
//               Caught: held up to his face and squeezed, drooled on (mash to get out); missed, he stumbles (an opening).
//     PUKE      retching (his cheeks puffed, heaving): then up it comes, a hot arc of it out ahead of him, pooling.
//     RAY       (rare) one of his three arms comes up glowing, as before: the long gun arm, one big fast bolt; the far
//               arm, three in a spread; the little chest arm, five slow ones in a wild fan.
//     STOMP     (the spam breaker, and when he's had Meathead hiding under his gut too long) the near foot up, down:
//               a quake both ways along the floor (jump it); then he lumbers off.
//   HIS MISERY  between the swings, now and then: he stops to whine (stood clutching the gut, crying); scratches the
//               rash; or his short leg gives out (BUCKLE: down on his knee, doubled over, sobbing: the big opening).
//
// His death (standard; no weakness yet): he staggers over toward the slide's mouth, his last line; then he POPS: every
// boil at once, pus everywhere, and he goes down like a punctured bouncy castle (wheezing, farting the air out) to the
// size of the scrawny manchild underneath; over backward, flat on his belly into the slide's mouth. (The
// stagger's at most about 3 s, however far off he died.) Then THE DESCENT (descent.ts): Meathead's one short line.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind } from '../../../m1/types';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { say, silenceAll, pickLine, isTalking } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { CANVAS_WIDTH, CANVAS_HEIGHT, KICK_POSE_FRAMES } from '../../../m1/constants';
import { endgameBoss, endgameDamage } from '../../weapons/endgameDamage';
import { registerM2Kind } from '../../kinds';
import { ownShare } from '../../weapons/subBoss';
import { setSickHurl, takeSickBurst } from '../../weapons/crossbow';
import { newSpam, spamTick, hitKey, swatOff, spamReset, type Spam, BOSS_IFRAMES } from '../../bossSpam';
import { bossIntroSeen, markBossIntroSeen } from '../../bossIntro';
import { TOO_BIG_BY_KIND } from '../../lines/weaponLines';
import { box, label, saidOver, speak, voice, meatheadSays } from '../../adventure/section';
import { SUMMIT } from './geo';
import { fire, fireBolt, byPants, clearShots } from './kinds';
import { drawKid, drawLash, kidContactSheet, kidPalm, kidHand, kidSpots, kidBody, KID_S, KID_W, KID_H, type KidPose, type KidOpts } from './kidArt';
import { drawKidGross, drawKidGrossBack, warmKidGross } from './kidGross';
import { cheapShotGate, cheapShotStunned, endCheapStun, registerClearThreats, crushGroups, crushLines, isCrushed } from '../../upgrades/cheapShot';
import { CRUSHED } from '../../upgrades/crushedLines';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;
const S = KID_S;

// ---------------------------------------------------------------------------------------------------------------
// The numbers (tune here)

export const KID_HP = 999;
const BIG = 100000;
/** Tells (frames), at full health; a third left, they're quicker (LOW_K). */
const TELL = { slam: 46, low: 40, high: 40, whip: 44, grab: 34, ray: 40, puke: 40, stomp: 26 };
const LOW_K = 0.8;
/** What his hits do (Meathead's damage taken is cut in M2 anyway: these are big on purpose, past the land bosses'). */
const DMG = { slam: 30, quake: 14, low: 22, high: 22, whip: 20, squeeze: 5, toss: 8, big: 18, spread: 13, fan: 10, puke: 12, touch: 14 };
/** His lumber (world px a frame), a third left a touch quicker; how far one walk cycle (8 frames of it) carries him. */
const WALK_V = 1.15, WALK_V_LOW = 1.4, STRIDE = 60 * S;
/** His misery between swings: how often (a roll after each), the whine's, scratch's and buckle's lengths. */
const MISERY = 0.24, WHINE_T = [70, 110], SCRATCH_T = 60, BUCKLE_T = 110, BUCKLE_T_LOW = 90;
/** How long Meathead can hide under his gut before he stamps him out (frames). */
const UNDER_MAX = 70, UNDER_R = 45;
/** The slam's fists land this far out in front of him (world), the zone either side of them. */
const SLAM_AT = 112 * S, SLAM_HALF = 62;
/** The sweeps' reach (world): the low one both sides of him, the high one in front. */
const LOW_R = 182, HIGH_R = 210;
/** The whip: how fast it unspools (world px a frame), its reach. */
const WHIP_V = 20, WHIP_MAX = 560;
/** The squeeze: its most, a squeeze every, the mashes that get him out. */
const HOLD_T = 110, SQUEEZE_EVERY = 22, MASH_OUT = 6;
const ARENA_L = SUMMIT.L + 70, ARENA_R = SUMMIT.R - 70;
const GY = SUMMIT.y;

// ---------------------------------------------------------------------------------------------------------------

type Move = 'slam' | 'low' | 'high' | 'whip' | 'grab' | 'ray' | 'puke' | 'stomp';
type Act = 'walk' | 'turn' | 'whine' | 'scratch' | 'buckle' | 'tell' | 'do' | 'hold' | 'recover' | 'spasm';
type Intro = 'kick' | 'walk' | 'view' | 'turn' | 'gross' | 'talk' | 'retry';
interface Glob { x: number; y: number; vx: number; vy: number; pus: boolean }
interface Puddle { x: number; w: number; t: number; pus: boolean }
export interface Fight {
  mode: 'intro' | 'on' | 'dying' | 'dead';
  e: Enemy;
  hp: number; iframes: number; flash: number; moveSeen?: number; spam: Spam;
  x: number; y: number; vx: number; face: 1 | -1;
  /** How big he's drawn (KID_S; down to 1 as he pops). */
  scale: number;
  act: Act; actT: number; T: number; move: Move | null; last: Move | null; pending: Move | null; arm: 0 | 1 | 2; shots: number;
  total: number; dest: number; walkPh: number; swings: number; misery: boolean; under: number; lastRay: number; chain: boolean; flee: boolean;
  /** The stomp's the spam breaker's: no lumbering off after it, straight into a swing at him. */
  answer: boolean;
  /** The whip's end (art units out from his feet); the grab's mashes; a squeeze's clock. */
  lash: number; mash: number; mashPrev: boolean;
  boil: { t: number; at: 'hump' | 'gut' | 'jaw' } | null; boilAt: number; wheezeAt: number; reactAt: number;
  globs: Glob[]; puddles: Puddle[];
  intro: Intro; introT: number; skipT: number; said: string | null; talkStep: number;
  tauntAt: number; lowSaid: boolean;
  /** (far: how far from the slide's mouth he died: the stagger's lurches are sized to get him there in about 2 s) */
  death: { t: number; step: 'stagger' | 'line' | 'pop' | 'fall' | 'flop' | 'done'; far: number } | null;
  /** The door (kicked in): 0 up, 1 down flat. */
  door: number;
}

const KID_KIND = 'm2:wp_kidboss' as const;
registerM2Kind({
  kind: KID_KIND, stats: { w: KID_W * S, h: KID_H * S, hp: BIG, contact: 0, mass: 900, air: true },
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y, harmless: true }),
  gender: 'm', humanoid: true, grab: 'none', midBoss: true, blood: '#3FA34D',
  head: { x: 50, y: -215, r: 34 },
  draw: () => {},
  ai: () => true,
});
TOO_BIG_BY_KIND[KID_KIND] = L.GRAB_KID;
// (every special's hit worked out here, in the fight, off the table: not cut again as a sub-boss's)
ownShare(KID_KIND);
// (every special's hit off the water park's own damage table, by weapon and move: weapons/endgameDamage.ts)
endgameBoss(KID_KIND);
setSickHurl(KID_KIND);
// (the hand armor's cheap shot (upgrades/cheapShot.ts): after it, his hurt and taunt lines from the crushed-nuts pool;
// its free window, the moment the stun starts: every bolt, quake and glob of his in the air gone in a puff)
crushGroups('kid', { hurt: [L.KID_HURT], taunt: [L.KID_TAUNT, L.KID_LOW] });
registerClearThreats('kid', state => {
  const f = live;
  for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: (f?.x ?? SUMMIT.L) + (Math.random() - 0.5) * 300, y: GY - Math.random() * 200 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 26, color: i % 2 ? '#7CFF3A' : '#E8F0FA', size: 3 + Math.random() * 3 });
  clearShots(state);
  if (f) f.globs.length = 0;
  playSound('rayFizzle', 0.6, -6);
});

let live: Fight | null = null;
let token = 0;
export const resetFight = () => { live = null; token++; };

const pmid = (state: GameState) => ({ x: state.player.pos.x + state.player.width / 2, y: state.player.pos.y + state.player.height / 2 });
const lowK = (f: Fight) => (f.hp < KID_HP / 3 ? LOW_K : 1);
const low = (f: Fight) => f.hp < KID_HP / 3;
const rand = (r: number[]) => r[0] + Math.random() * (r[1] - r[0]);
const kidSays = (f: Fight, text: string, after = true, onDone?: () => void) => {
  const tok = token;
  speak(L.KID_VOICE, text, s => { if (tok === token) f.said = s?.text ?? null; }, after, () => { if (tok === token) onDone?.(); });
};
/** A bark (dropped if anybody's talking). */
const bark = (state: GameState, f: Fight, lines: L.ByPants) => {
  if (f.said || isTalking()) return;
  const text = pick(byPants(state, lines)), tok = token;
  say(text, voice(L.KID_VOICE), 'casual', {
    always: true,
    onShow: spoken => { if (tok !== token) return; f.said = text; if (!spoken) setTimeout(() => { if (f.said === text) f.said = null; }, Math.max(1600, text.length * 65)); },
    onHide: () => { if (f.said === text) f.said = null; },
  });
};
/** Meathead's say over the misery, now and then (never over anybody). */
const react = (state: GameState, f: Fight, lines: L.ByPants, gap = 900) => {
  if (f.said || isTalking() || f.total < f.reactAt) return;
  f.reactAt = f.total + gap;
  meatheadSays(state, pick(byPants(state, lines)), true);
};

/** The player's box, ducked or sliding: down low (28 off the top, the engine's own duck: clear of anything over it). */
const pBox = (state: GameState) => {
  const p = state.player, lo = p.isDucking || p.isSliding;
  return { x0: p.pos.x, x1: p.pos.x + p.width, y0: p.pos.y + (lo ? 28 : 0), y1: p.pos.y + p.height };
};
/** Can he be hurt this frame, and is he in this box (world)? */
const inBox = (state: GameState, x0: number, x1: number, y0: number, y1: number) => {
  const p = state.player;
  if (p.health <= 0 || p.inCutscene || p.invincibilityTimer > 0 || p.untouchable || p.carried) return false;
  const b = pBox(state), a = Math.min(x0, x1), z = Math.max(x0, x1);
  return b.x1 > a && b.x0 < z && b.y1 > y0 && b.y0 < y1;
};
const knock = (f: Fight, state: GameState, k = 7, up = -6) => ({ x: (Math.sign(pmid(state).x - f.x) || f.face) * k, y: up });

export const startFight = (state: GameState): Fight => {
  token++;
  const e = makeKindEnemy(KID_KIND as EnemyKind, SUMMIT.R - 90, GY);
  e.seen = true;
  const f: Fight = {
    mode: 'intro', e, hp: KID_HP, iframes: 0, flash: 0, moveSeen: e.hitByMove, spam: newSpam(),
    x: SUMMIT.R - 70, y: GY, vx: 0, face: 1, scale: S,
    act: 'walk', actT: 0, T: 40, move: null, last: null, pending: null, arm: 0, shots: 0,
    total: 0, dest: SUMMIT.L + 300, walkPh: 0, swings: 0, misery: false, under: 0, lastRay: -9999, chain: false, flee: false, answer: false,
    lash: 0, mash: 0, mashPrev: true, boil: null, boilAt: 420, wheezeAt: 90, reactAt: 600, globs: [], puddles: [],
    intro: 'kick', introT: 0, skipT: 0, said: null, talkStep: 0, tauntAt: 700, lowSaid: false, death: null, door: 0,
  };
  live = f;
  warmKidGross();
  state.player.inCutscene = true;
  // (a retry: the kid's already up and about, turned round; a beat for it)
  if (bossIntroSeen(state, 'zorzarblax')) { f.intro = 'retry'; f.x = SUMMIT.R - 200; f.face = -1; f.door = 1; }
  return f;
};

const beginFight = (state: GameState, f: Fight) => {
  token++; markBossIntroSeen(state, 'zorzarblax');
  f.said = null; state.cameraOverride = null;
  const p = state.player;
  p.inCutscene = false; p.kickPose = 0;
  f.mode = 'on'; f.door = 1;
  if (f.intro !== 'retry') { f.x = SUMMIT.R - 200; f.face = -1; }
  // (first thing: a lumber over at him)
  startWalk(f, SUMMIT.L + 260);
  if (!state.enemies.includes(f.e)) state.enemies.push(f.e);
};

// ---------------------------------------------------------------------------------------------------------------
// The intro

const updateIntro = (ctx: FrameContext, f: Fight): Controls => {
  const { state } = ctx, p = state.player;
  f.introT++; f.skipT++;
  p.inCutscene = true; p.vel.x = 0;
  const skippable = f.intro !== 'retry';
  if (skippable && f.skipT > SKIP_AFTER) offerSkip();
  if (skippable && f.skipT > SKIP_AFTER && takeSkip()) { silenceAll(); state.playerVulgarityTimer = 0; p.pos.x = SUMMIT.L + 140 - p.width / 2; p.facing = 1; beginFight(state, f); return hands(); }
  const t = f.introT;
  switch (f.intro) {
    case 'kick':
      // (the door kicked in: his boot, the door down flat inward)
      p.facing = 1;
      if ((p.kickPose || 0) > 0) p.kickPose!--;
      if (t === 6) p.kickPose = KICK_POSE_FRAMES;
      if (t === 14) { f.door = 0.01; playSound('crash', 1, -6); playSound('slam', 0.9, -8); shakeScreen(state, 12, 5); }
      if (f.door > 0) f.door = Math.min(1, f.door + 0.12);
      if (t > 34) { f.intro = 'walk'; f.introT = 0; }
      break;
    case 'walk':
      p.facing = 1; p.vel.x = 2.2;
      if (p.pos.x + p.width / 2 > SUMMIT.L + 140) { p.vel.x = 0; f.intro = 'view'; f.introT = 0; }
      break;
    case 'view':
      // (the kid, his back to him, sat on the slide's mouth looking at the view, wheezing; a beat)
      if (t === 20) playSound('snort', 0.5, -14);
      if (t === 52) playSound('snort', 0.5, -16);
      if (t > 70) { f.intro = 'turn'; f.introT = 0; playSound('bellow', 0.5, 6); }
      break;
    case 'turn':
      // (up off the lip with a groan, the summit taking his weight)
      if (t === 10) { f.face = -1; f.x = SUMMIT.R - 120; playSound('thud', 1, -14); shakeScreen(state, 10, 4); }
      if (t > 26) { f.intro = 'gross'; f.introT = 0; playSound('roar', 0.6, 4); shakeScreen(state, 8, 4); }
      break;
    case 'gross':
      if (t > 105) { f.intro = 'talk'; f.introT = 0; f.talkStep = 0; }
      break;
    case 'talk':
      if (f.talkStep === 0) { f.talkStep = 1; kidSays(f, pick(byPants(state, L.KID_INTRO)), true, () => { f.talkStep = 2; }); }
      if (f.talkStep === 2) { f.talkStep = 3; meatheadSays(state, pick(byPants(state, L.MH_INTRO)), true, () => { f.talkStep = 4; }); }
      if (f.talkStep === 4) { f.talkStep = 5; kidSays(f, pick(byPants(state, L.KID_INTRO2)), true, () => { f.talkStep = 6; }); }
      if (f.talkStep === 6) beginFight(state, f);
      if (t > 1500) beginFight(state, f);
      break;
    case 'retry':
      if (t === 1) bark(state, f, L.KID_RETRY);
      if (t > 70) beginFight(state, f);
      break;
  }
  return hands();
};
const hands = (): Controls => ({ left: false, right: false, up: false, down: false, jump: false, special: false, shoot: false });

// ---------------------------------------------------------------------------------------------------------------
// The fight: what he does next

const setAct = (f: Fight, a: Act, T: number) => { f.act = a; f.actT = 0; f.T = Math.max(1, Math.round(T)); };
const clampX = (x: number) => Math.max(ARENA_L, Math.min(ARENA_R, x));

/** Off for a lumber to `dest` (turning round first, slowly, if it's behind him). */
const startWalk = (f: Fight, dest: number) => {
  f.dest = clampX(dest); f.swings = 0;
  const dir = Math.sign(f.dest - f.x) || f.face;
  if (dir !== f.face) { f.pending = null; setAct(f, 'turn', 22); }
  else setAct(f, 'walk', 300);
};
/** A walk's end: toward him and past him (straight through where he's stood: get under, or out of the way), or off to
 *  the far end. */
const walkSomewhere = (state: GameState, f: Fight) => {
  const px = pmid(state).x, side = Math.sign(px - f.x) || f.face;
  if (Math.random() < 0.65) startWalk(f, px + side * (150 + Math.random() * 160));
  else startWalk(f, f.x < (SUMMIT.L + SUMMIT.R) / 2 ? ARENA_R - 40 : ARENA_L + 40);
};

const choose = (state: GameState, f: Fight): Move => {
  const d = Math.abs(pmid(state).x - f.x);
  if (d < UNDER_R) return Math.random() < 0.5 ? 'low' : 'stomp';
  if (f.total - f.lastRay > 540 && Math.random() < 0.16) return 'ray';
  const pool: Move[] = d < 190 ? ['slam', 'low', 'high', 'grab', 'puke', 'low', 'high', 'slam'] : d < 330 ? ['slam', 'whip', 'grab', 'high', 'whip'] : ['whip', 'whip', 'ray'];
  const ok = pool.filter(m => m !== f.last && (m !== 'ray' || f.total - f.lastRay > 540));
  return ok[Math.floor(Math.random() * ok.length)] ?? 'whip';
};

/** Next: a bout of his misery, a lumber somewhere, or a swing (facing him first: a slow turn if he's behind). */
const next = (state: GameState, f: Fight) => {
  f.vx = 0;
  if (f.flee) { f.flee = false; const px = pmid(state).x; startWalk(f, px < f.x ? ARENA_R - 30 : ARENA_L + 30); return; }
  if (!f.misery && Math.random() < MISERY) { misery(state, f, Math.random() < 0.45 ? 'whine' : Math.random() < 0.6 ? 'scratch' : 'buckle'); return; }
  f.misery = false;
  const d = Math.abs(pmid(state).x - f.x);
  if (f.swings >= 2 || (d > 340 && Math.random() < 0.45) || (f.swings >= 1 && Math.random() < 0.35)) { walkSomewhere(state, f); return; }
  startMove(state, f, choose(state, f));
};
/** His misery: stood whining; scratching; down on his short leg (the opening). */
const misery = (state: GameState, f: Fight, what: 'whine' | 'scratch' | 'buckle') => {
  f.misery = true; f.vx = 0;
  if (what === 'whine') { setAct(f, 'whine', rand(WHINE_T)); playSound('bellow', 0.35, 12); bark(state, f, L.KID_WHINE); }
  else if (what === 'scratch') { setAct(f, 'scratch', SCRATCH_T); if (Math.random() < 0.6) bark(state, f, L.KID_SCRATCH); }
  else { setAct(f, 'buckle', low(f) ? BUCKLE_T_LOW : BUCKLE_T); playSound('thud', 1, -14); playSound('crunch', 0.6, -10); shakeScreen(state, 10, 4); bark(state, f, L.KID_BUCKLE); }
  if (what !== 'scratch' && Math.random() < 0.18) react(state, f, L.MH_REACT);
};

const startMove = (state: GameState, f: Fight, m: Move, quick = false, turned = false) => {
  const side = (Math.sign(pmid(state).x - f.x) || f.face) as 1 | -1;
  // (behind him: round first, slowly; the swing after)
  if (!turned && side !== f.face && m !== 'stomp' && m !== 'low') { f.pending = m; setAct(f, 'turn', 18); return; }
  f.move = m; f.last = m; f.shots = 0; f.pending = null; f.swings++;
  if (isCrushed(f.e) && Math.random() < 0.25) bark(state, f, CRUSHED.kid.attack as unknown as L.ByPants);
  f.arm = (Math.floor(Math.random() * 3)) as 0 | 1 | 2;
  setAct(f, 'tell', TELL[m] * lowK(f) * (quick ? 0.6 : 1));
  switch (m) {
    case 'slam': playSound('bellow', 0.6, -4); break;
    case 'low': playSound('grind', 0.5, -8); break;
    case 'high': playSound('whoosh', 0.5, 12); break;
    case 'whip': playSound('snort', 0.6, -12); break;
    case 'grab': playSound('slurp', 0.7, -8); break;
    case 'ray': playSound('alienCharge', 0.6, 0); f.lastRay = f.total; break;
    case 'puke': playSound('retch', 0.8, -6); if (Math.random() < 0.6) bark(state, f, L.KID_RETCH); break;
    case 'stomp': playSound('roar', 0.5, 6); break;
  }
};

const updateOn = (ctx: FrameContext, f: Fight, controls: Controls): Controls => {
  const { state } = ctx, pl = state.player, p = pmid(state);
  // (the cheap shot: up for it any time he isn't holding him; frozen in its cutscene, then stunned: planted, no
  // swings, taking hits)
  const cs = cheapShotGate(state, f.e, 'kid', f.act !== 'hold');
  if (cs === 'frozen') return controls;
  if (cs === 'stunned') {
    if (f.iframes > 0) f.iframes--;
    if (f.flash > 0) f.flash--;
    f.vx = 0; f.y = GY; f.move = null; f.under = 0; setAct(f, 'recover', 20);
    placeEnemy(state, f);
    takeHits(ctx, f);
    return controls;
  }
  f.total++; f.actT++;
  if (f.iframes > 0) f.iframes--;
  if (f.flash > 0) f.flash--;
  const dx = p.x - f.x;
  f.under = Math.abs(dx) < UNDER_R && pl.isGrounded ? f.under + 1 : Math.max(0, f.under - 2);
  // (the taunts, now and then; the low line once)
  if (f.total > f.tauntAt && !f.said) { f.tauntAt = f.total + 620 + Math.floor(Math.random() * 400); bark(state, f, crushLines(f.e, L.KID_TAUNT)); }
  if (!f.lowSaid && low(f)) { f.lowSaid = true; bark(state, f, crushLines(f.e, L.KID_LOW)); }
  misc(ctx, f);
  let out = controls;
  switch (f.act) {
    case 'walk': {
      const v = low(f) ? WALK_V_LOW : WALK_V, dir = Math.sign(f.dest - f.x);
      f.vx = dir * v;
      if (dir !== 0) f.face = dir as 1 | -1;
      const was = Math.floor(f.walkPh);
      f.walkPh = (f.walkPh + (v * 8) / STRIDE) % 8;
      const now = Math.floor(f.walkPh);
      if (now !== was && (now === 2 || now === 6)) footfall(state, f, now === 2);
      const near = Math.abs(dx) < 300 && Math.sign(dx) === f.face;
      if (f.act === 'walk' && (Math.abs(f.dest - f.x) < 6 || f.actT >= f.T || (f.actT > 60 && near && Math.random() < 0.02) || f.under > UNDER_MAX)) next(state, f);
      break;
    }
    case 'turn':
      f.vx = 0;
      if (f.actT === 8) { playSound('thud', 0.6, -12); shakeScreen(state, 4, 2); }
      if (f.actT >= f.T) {
        f.face = (f.face === 1 ? -1 : 1);
        if (f.pending) startMove(state, f, f.pending, false, true); else setAct(f, 'walk', 300);
      }
      break;
    case 'whine':
      f.vx = 0;
      if (f.actT % 30 === 15) playSound('snort', 0.4, 6 + (f.actT % 4));
      if (f.actT % 10 === 0) state.particles.push({ pos: { x: f.x + f.face * 50 * S, y: GY - 120 * S }, vel: { x: f.face * (0.5 + Math.random()), y: 0.5 }, life: 26, color: '#9AD8F4', size: 2, grav: 0.25 });
      if (f.actT >= f.T || f.under > UNDER_MAX) next(state, f);
      break;
    case 'scratch':
      f.vx = 0;
      if (f.actT % 8 === 0) {
        playSound('scratch', 0.45, -6 + (f.actT % 3));
        for (let k = 0; k < 3; k++) state.particles.push({ pos: { x: f.x + f.face * (40 + Math.random() * 20) * S, y: GY - (40 + Math.random() * 20) * S }, vel: { x: (Math.random() - 0.5) * 2, y: -0.5 - Math.random() }, life: 30, color: k % 2 ? '#E8E0B8' : '#C2403C', size: 2, grav: 0.15 });
      }
      if (f.actT >= f.T || f.under > UNDER_MAX) next(state, f);
      break;
    case 'buckle':
      // (down on his knee, doubled over, sobbing; then up again with a groan)
      f.vx = 0;
      if (f.actT % 22 === 11) playSound('snort', 0.45, 10);
      if (f.actT === f.T - 16) { playSound('bellow', 0.45, -2); playSound('thud', 0.7, -14); shakeScreen(state, 6, 3); }
      if (f.actT >= f.T) { f.misery = true; setAct(f, 'recover', 14); }
      break;
    case 'tell': tell(ctx, f); break;
    case 'do': runMove(ctx, f); break;
    case 'hold': out = hold(ctx, f, controls); break;
    case 'recover':
      f.vx *= 0.8;
      if (f.move === 'slam' && f.actT % 12 === 6 && f.actT < f.T - 10) { playSound('crunch', 0.4, 4); state.particles.push({ pos: { x: f.x + f.face * SLAM_AT, y: GY - 6 }, vel: { x: (Math.random() - 0.5) * 3, y: -2 }, life: 20, color: '#CBD5E1', size: 3, grav: 0.3 }); }
      if (f.actT >= f.T) {
        if (f.chain) { f.chain = false; startMove(state, f, f.move === 'low' ? 'high' : 'slam', true); }
        // (the spam breaker's stomp: no walk off, no whine: a swing at him, wherever he's stood)
        else if (f.answer) { f.answer = false; f.misery = true; f.swings = 0; startMove(state, f, choose(state, f)); }
        else next(state, f);
      }
      break;
    case 'spasm':
      f.vx = 0;
      if (f.actT >= f.T) next(state, f);
      break;
  }
  f.x = clampX(f.x + f.vx);
  f.y = GY;
  // (walking into him hurts: his gut and up; under it, ducked or sliding, he's clear)
  const b = bodyBox(f);
  if (f.act !== 'hold' && inBox(state, b.x0 + 8, b.x1 - 8, b.top, b.bottom)) {
    hurtPlayer(ctx, DMG.touch, 'm2:wp_kid', knock(f, state, 8, -6), 20);
    shakeScreen(state, 6, 3);
  }
  placeEnemy(state, f);
  takeHits(ctx, f);
  return out;
};

/** The live misery that runs over whatever he's doing: the wheeze, a boil swelling up and popping, the globs. */
const misc = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  if (f.total > f.wheezeAt) { f.wheezeAt = f.total + 110 + Math.random() * 60; playSound('snort', 0.3, -14); }
  if (!f.boil && f.total > f.boilAt && (f.act === 'walk' || f.act === 'whine' || f.act === 'scratch' || f.act === 'recover')) f.boil = { t: 0, at: (['hump', 'gut', 'jaw'] as const)[Math.floor(Math.random() * 3)] };
  if (f.boil && ++f.boil.t >= 50) {
    // (pop: the spray, a whimper, a splat on the floor)
    const [lx, ly] = kidSpots(optsOf(f))[f.boil.at], wx = f.x + f.face * lx * f.scale, wy = f.y + ly * f.scale;
    for (let k = 0; k < 7; k++) f.globs.push({ x: wx, y: wy, vx: f.face * (0.5 + Math.random() * 2.5) + (Math.random() - 0.5) * 2, vy: -2 - Math.random() * 3, pus: true });
    for (let k = 0; k < 12; k++) state.particles.push({ pos: { x: wx, y: wy }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 4 }, life: 24, color: k % 2 ? '#F4E27A' : '#D8BC3A', size: 2 + Math.random() * 2, grav: 0.3 });
    playSound('squish', 0.8, -4); playSound('gush', 0.4, 8);
    if (Math.random() < 0.6) bark(state, f, L.KID_BOIL);
    f.boil = null; f.boilAt = f.total + 360 + Math.random() * 360;
  }
  // (the globs: pus (harmless, gross) and puke (hurts), arcing down into puddles)
  for (let i = f.globs.length - 1; i >= 0; i--) {
    const g = f.globs[i];
    g.vy += 0.28; g.x += g.vx; g.y += g.vy;
    if (!g.pus && inBox(state, g.x - 6, g.x + 6, g.y - 6, g.y + 6)) { hurtPlayer(ctx, DMG.puke, 'm2:wp_kidpuke', { x: Math.sign(g.vx) * 4, y: -3 }, 12); f.globs.splice(i, 1); continue; }
    if (g.y >= GY - 2) {
      const pd = f.puddles.find(q => Math.abs(q.x - g.x) < q.w && q.pus === g.pus);
      if (pd) { pd.w = Math.min(46, pd.w + 2); pd.t = 0; } else if (f.puddles.length < 10) f.puddles.push({ x: g.x, w: 8, t: 0, pus: g.pus });
      if (Math.random() < 0.3) playSound('splat', 0.25, 8);
      f.globs.splice(i, 1);
    }
  }
  for (let i = f.puddles.length - 1; i >= 0; i--) if (++f.puddles[i].t > 600) f.puddles.splice(i, 1);
};

/** A footfall: the thud, the shake, the dust; now and then the step's too much for him and he stops to whine. */
const footfall = (state: GameState, f: Fight, near: boolean) => {
  playSound('stomp', 0.5, -14); playSound('thud', 0.6, -10);
  shakeScreen(state, 5, 2);
  const fx = f.x + f.face * (near ? 10 : -14) * S;
  for (let k = 0; k < 5; k++) state.particles.push({ pos: { x: fx + (Math.random() - 0.5) * 30, y: GY - 3 }, vel: { x: (Math.random() - 0.5) * 3, y: -0.5 - Math.random() }, life: 22, color: '#CBD5E1', size: 2 + Math.random() * 2 });
  if (!near && Math.random() < 0.3) playSound('snort', 0.35, 4);
  if (f.actT > 90 && !f.misery && Math.random() < 0.12) misery(state, f, 'whine');
};

// ---------------------------------------------------------------------------------------------------------------
// The swings

const tell = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, p = pmid(state);
  f.vx = 0;
  switch (f.move) {
    case 'slam': {
      // (lumbering in under his raised fists so they'll land where he is: the shadow on the floor shows where)
      const want = p.x - f.face * SLAM_AT, v = Math.max(-2.2, Math.min(2.2, (want - f.x) / Math.max(1, f.T - f.actT)));
      if (Math.sign(v) === f.face) f.vx = v;
      if (f.actT % 14 === 0) playSound('snort', 0.35, -6);
      break;
    }
    case 'low':
      if (f.actT % 6 === 0) { playSound('grind', 0.3, -4); for (const s of [-1, 1]) state.particles.push({ pos: { x: f.x + s * f.face * 110 * S, y: GY - 3 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 14, color: '#FDE68A', size: 2 }); }
      break;
    case 'whip': if (f.actT % 10 === 0) playSound('snort', 0.35, -10 + f.actT / 6); break;
    case 'grab': if (f.actT % 12 === 0) playSound('slurp', 0.4, -10); break;
  }
  if (f.actT >= f.T) doMove(ctx, f);
};

const doMove = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  switch (f.move) {
    case 'slam': setAct(f, 'do', 8); playSound('whoosh', 0.8, -10); break;
    case 'low': case 'high': setAct(f, 'do', 12); playSound('whoosh', 0.9, f.move === 'low' ? -8 : 4); break;
    case 'whip': f.lash = kidHand({ pose: 'whipOut', q: 0 }, 0)[0]; setAct(f, 'do', 80); playSound('whoosh', 0.9, 8); playSound('twang', 0.6, -6); break;
    case 'grab': setAct(f, 'do', 18); playSound('whoosh', 0.6, -6); break;
    case 'ray': setAct(f, 'do', 40); break;
    case 'puke': setAct(f, 'do', 46); playSound('barf', 1, -6); break;
    case 'stomp': setAct(f, 'do', 24); stompDown(state, f); break;
    default: next(state, f);
  }
};

const runMove = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, p = pmid(state);
  const t = f.actT;
  switch (f.move) {
    case 'slam':
      if (t === 6) {
        const hx = f.x + f.face * SLAM_AT;
        playSound('slam', 1, -12); playSound('thud', 1, -14); playSound('crash', 0.6, -12); shakeScreen(state, 16, 8);
        for (let k = 0; k < 22; k++) state.particles.push({ pos: { x: hx + (Math.random() - 0.5) * 90, y: GY - 4 }, vel: { x: (Math.random() - 0.5) * 9, y: -1 - Math.random() * 6 }, life: 32, color: k % 2 ? '#E8F0FA' : '#94A3B8', size: 3 + Math.random() * 4, grav: 0.3 });
        if (inBox(state, hx - SLAM_HALF, hx + SLAM_HALF, GY - 90, GY + 4)) hurtPlayer(ctx, DMG.slam, 'm2:wp_kidslam', knock(f, state, 9, -8), 24);
        // (low on health: the quake off the fists too)
        if (low(f)) for (const d of [-1, 1]) fire(state, { x: hx + d * 40, y: GY, vx: d * 6, vy: 0, kind: 'wave', src: 'm2:wp_kidquake', dmg: DMG.quake, floor: GY });
      }
      if (t >= f.T) {
        // (the fists stuck in the floor: an opening; low on health, sometimes straight into a second)
        f.chain = low(f) && Math.random() < 0.4;
        setAct(f, 'recover', f.chain ? 22 : 52);
        if (!f.chain && Math.random() < 0.3) { f.misery = false; misery(state, f, 'buckle'); }
      }
      break;
    case 'low':
      if (t >= 2 && t <= 10 && inBox(state, f.x - LOW_R, f.x + LOW_R, GY - 30, GY + 4)) hurtPlayer(ctx, DMG.low, 'm2:wp_kidsweep', knock(f, state, 9, -7), 22);
      if (t === 6) shakeScreen(state, 6, 3);
      if (t >= f.T) { f.chain = low(f) && Math.random() < 0.35; setAct(f, 'recover', f.chain ? 10 : 26); }
      break;
    case 'high':
      if (t >= 2 && t <= 10 && inBox(state, f.x - f.face * 30, f.x + f.face * HIGH_R, GY - 100, GY - 42)) hurtPlayer(ctx, DMG.high, 'm2:wp_kidsweep', knock(f, state, 10, -5), 22);
      if (t >= f.T) setAct(f, 'recover', 26);
      break;
    case 'whip': {
      // (out along the floor to the wall or its reach; a slap at the end; reeled back in, harmless)
      const wrist = kidHand({ pose: 'whipOut', q: 0 }, 0)[0];
      const wall = f.face > 0 ? SUMMIT.R - 12 : SUMMIT.L + 12, most = Math.min(WHIP_MAX, Math.abs(wall - f.x)) / S;
      const phase = f.shots;
      if (phase === 0) { f.lash = Math.min(most, f.lash + WHIP_V / S); if (f.lash >= most) { f.shots = 1; f.actT = 0; playSound('slam', 0.6, 6); playSound('splat', 0.5, -2); shakeScreen(state, 5, 3); } }
      else if (phase === 1) { if (t >= 10) { f.shots = 2; f.actT = 0; playSound('suck', 0.5, 4); } }
      else { f.lash = Math.max(wrist, f.lash - 14 / S); if (f.lash <= wrist) setAct(f, 'recover', 18); }
      if (phase < 2) {
        const x0 = f.x + f.face * wrist * S, x1 = f.x + f.face * f.lash * S;
        if (inBox(state, x0, x1, GY - 28, GY + 4)) hurtPlayer(ctx, DMG.whip, 'm2:wp_kidwhip', { x: f.face * 6, y: -7 }, 20);
      }
      break;
    }
    case 'grab': {
      f.vx = f.face * 4;
      const h0 = f.x + f.face * 50 * S, h1 = f.x + f.face * 112 * S;
      if (t >= 4 && inBox(state, h0, h1, GY - 80, GY - 40)) { catchHim(ctx, f); break; }
      if (t >= f.T) { setAct(f, 'recover', 40); playSound('thud', 0.7, -10); }
      break;
    }
    case 'ray': {
      if (t === 2) {
        const [px, py] = kidPalm(f.arm);
        const sx = f.x + px * S * f.face, sy = f.y + py * S;
        if (f.arm === 0) shotsAimed(state, sx, sy, p.x, p.y, 9, [0], DMG.big);
        else if (f.arm === 1) shotsAimed(state, sx, sy, p.x, p.y, 7, [-0.26, 0, 0.26], DMG.spread);
        else shotsAimed(state, sx, sy, p.x, p.y, 4.6, [-0.7, -0.35, 0, 0.35, 0.7].map(a => a + (Math.random() - 0.5) * 0.3), DMG.fan);
        playSound('alienBeam', 0.7, f.arm * 3);
        shakeScreen(state, 4, 2);
      }
      if (t >= f.T) setAct(f, 'recover', 18);
      break;
    }
    case 'puke': {
      if (t % 3 === 0 && t < 40) {
        const [mx, my] = kidSpots({ pose: 'puke', q: 0 }).mouth;
        f.globs.push({ x: f.x + f.face * mx * S, y: f.y + my * S, vx: f.face * (2.5 + Math.random() * 4.2), vy: -1.5 - Math.random() * 2.2, pus: false });
      }
      if (t % 9 === 0) playSound('gush', 0.4, -6);
      if (t >= f.T) setAct(f, 'recover', 24);
      break;
    }
    case 'stomp':
      if (t >= f.T) { f.flee = !f.answer; setAct(f, 'recover', 10); }
      break;
    default:
      next(state, f);
  }
};
const shotsAimed = (state: GameState, x: number, y: number, tx: number, ty: number, speed: number, offs: number[], dmg: number) => {
  const a = Math.atan2(ty - y, tx - x);
  for (const o of offs) fireBolt(state, x, y, x + Math.cos(a + o) * 100, y + Math.sin(a + o) * 100, speed, 'm2:wp_kidshot', dmg, 'kid');
};
/** The stomp's foot down: the shake, the quake out both ways along the floor. */
const stompDown = (state: GameState, f: Fight) => {
  playSound('slam', 1, -14); playSound('thud', 1, -16); playSound('stomp', 1, -12); shakeScreen(state, 14, 7);
  for (const d of [-1, 1]) fire(state, { x: f.x + d * 60, y: GY, vx: d * 6.5, vy: 0, kind: 'wave', src: 'm2:wp_kidquake', dmg: DMG.quake, floor: GY });
  for (let k = 0; k < 18; k++) state.particles.push({ pos: { x: f.x + (Math.random() - 0.5) * 120, y: GY - 4 }, vel: { x: (Math.random() - 0.5) * 8, y: -1 - Math.random() * 4 }, life: 30, color: k % 2 ? '#E8F0FA' : '#CBD5E1', size: 3 + Math.random() * 4 });
};

// ---- the squeeze

const holdAt = (f: Fight) => ({ x: f.x + f.face * 56 * S, y: f.y - 108 * S });
const catchHim = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, p = state.player;
  hurtPlayer(ctx, DMG.squeeze * 2, 'm2:wp_kidgrab', { x: 0, y: 0 }, 1);
  if (p.health <= 0) { setAct(f, 'recover', 30); return; }
  p.carried = true; p.noSpecials = true; p.isCharging = false; p.isSliding = false; p.isDivekicking = false; p.isUppercutting = false; p.isDucking = false;
  f.vx = 0; f.mash = 0; f.mashPrev = true;
  setAct(f, 'hold', HOLD_T);
  playSound('squish', 1, -8); playSound('slurp', 0.8, -4);
  bark(state, f, L.KID_GRAB);
  if (!f.said) react(state, f, L.MH_GRABBED, 300);
};
const letGo = (ctx: FrameContext, f: Fight, toss: boolean) => {
  const { state } = ctx, p = state.player;
  p.carried = false; p.noSpecials = false;
  p.vel.x = f.face * (toss ? 8 : 4); p.vel.y = toss ? -6 : -4; p.isGrounded = false;
  if (toss) { p.invincibilityTimer = 0; hurtPlayer(ctx, DMG.toss, 'm2:wp_kidgrab', { x: f.face * 8, y: -6 }, 16); playSound('whoosh', 0.8, -4); }
  else { p.invincibilityTimer = Math.max(p.invincibilityTimer, 45); playSound('squish', 0.7, 6); bark(state, f, crushLines(f.e, L.KID_HURT)); }
  setAct(f, 'recover', toss ? 26 : 40);
};
const hold = (ctx: FrameContext, f: Fight, controls: Controls): Controls => {
  const { state } = ctx, p = state.player;
  f.vx = 0;
  const at = holdAt(f);
  p.pos.x = at.x - p.width / 2; p.pos.y = at.y - p.height / 2; p.vel.x = 0; p.vel.y = 0; p.facing = f.face > 0 ? -1 : 1;
  if (p.health <= 0) { p.carried = false; p.noSpecials = false; setAct(f, 'recover', 30); return hands(); }
  // (mashing out: any fresh press)
  const down = !!(controls.jump || controls.shoot || controls.special);
  if (down && !f.mashPrev) { f.mash++; playSound('punch', 0.4, 4 + f.mash); }
  f.mashPrev = down;
  if (f.actT % SQUEEZE_EVERY === 0) { p.invincibilityTimer = 0; hurtPlayer(ctx, DMG.squeeze, 'm2:wp_kidgrab', { x: 0, y: 0 }, 1); playSound('squish', 0.6, -6 + (f.actT % 5)); shakeScreen(state, 4, 2); if (p.health <= 0) { p.carried = false; p.noSpecials = false; setAct(f, 'recover', 30); return hands(); } }
  // (the drool, down onto him)
  if (f.actT % 5 === 0) { const [mx, my] = kidSpots({ pose: 'grabHold', q: 0 }).mouth; state.particles.push({ pos: { x: f.x + f.face * mx * S, y: f.y + my * S }, vel: { x: (Math.random() - 0.5) * 0.6, y: 1 }, life: 34, color: Math.random() < 0.5 ? '#A8E03A' : '#EAFFB0', size: 2 + Math.random() * 2, grav: 0.25 }); }
  if (f.mash >= MASH_OUT) letGo(ctx, f, false);
  else if (f.actT >= f.T) letGo(ctx, f, true);
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------
// His box, and the hits on him

/** What of him is solid (walking into it hurts): his gut and up, world; the gap under it (between his legs). */
const bodyBox = (f: Fight) => {
  const b = kidBody(poseOf(f).pose), s = f.scale;
  const a = f.x + f.face * b.x0 * s, z = f.x + f.face * b.x1 * s;
  return { x0: Math.min(a, z), x1: Math.max(a, z), top: f.y + b.top * s, bottom: f.y - b.gap * s };
};
/** The engine's enemy, where he is: what the hits land on (legs and all, down to the floor). */
const placeEnemy = (state: GameState, f: Fight) => {
  const b = bodyBox(f), e = f.e;
  e.pos.x = b.x0; e.pos.y = b.top; e.width = b.x1 - b.x0; e.height = f.y - b.top; e.vel.x = 0; e.vel.y = 0; e.facing = f.face;
  if (!state.enemies.includes(e)) state.enemies.push(e);
};
export const kidBox = (f: Fight) => { const b = bodyBox(f); return { x: b.x0, y: b.top, w: b.x1 - b.x0, h: f.y - b.top }; };

const takeHits = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, e = f.e;
  const dealt = Math.max(0, BIG - e.health);
  e.health = BIG; e.maxHealth = BIG;
  const melee = e.hitByMove !== f.moveSeen;
  f.moveSeen = e.hitByMove;
  const burst = takeSickBurst(e);
  if ((!burst && (dealt <= 0 || f.iframes > 0))) return;
  const dmg = burst || endgameDamage(state, e, melee, dealt);
  f.hp -= dmg; if (!burst) f.iframes = BOSS_IFRAMES; f.flash = 8;
  playSound('gunhit', 0.6, -2); playSound('squish', 0.4, 6);
  ctx.fx.spawnDamageNumber({ x: f.x - 10, y: f.y - KID_H * S - 10 }, Math.max(1, Math.round(dmg)), dmg > 40);
  for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: f.x + f.face * 20, y: f.y - 120 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 22, color: i % 3 ? '#3FA34D' : '#F4E27A', size: 2 + Math.random() * 3, grav: 0.3 });
  if (f.hp > 0 && Math.random() < 0.2) bark(state, f, crushLines(f.e, L.KID_HURT));
  // (the same hit landing on him for ~4 s: off his head or out of his face. He used to stamp the floor and lumber off
  // to the far end, shot in the back the whole way, then be stamped out again: docile. Now it's an answer: from far
  // off, the whip right along the floor at him (jump it); close, the stamp (the quake both ways), and straight out of
  // it a swing at wherever he's stood)
  if (f.hp > 0 && !burst && spamTick(f.spam, state.frame, hitKey(state.player, melee)) && f.act !== 'hold') {
    if (melee) swatOff(state, f.x);
    spamReset(f.spam);
    f.chain = false; f.pending = null; f.flee = false; f.lash = 0;
    if (!melee && Math.abs(pmid(state).x - f.x) > 200) startMove(state, f, 'whip');
    else { f.answer = true; f.move = 'stomp'; f.last = 'stomp'; setAct(f, 'tell', TELL.stomp * 0.6); playSound('roar', 0.5, 6); }
  }
  if (f.hp <= 0) die(ctx, f);
};

// ---------------------------------------------------------------------------------------------------------------
// His death: the stagger, the last line, the pop (he goes down like a punctured bouncy castle), over backward into
// the slide's mouth

/** The kid's dead: the hour goes on and the file's past level 1 (the stage listens for it). */
let onKilled: ((state: GameState) => void) | null = null;
export const setOnKilled = (fn: (state: GameState) => void) => { onKilled = fn; };
const die = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, p = state.player;
  endCheapStun(f.e);
  if (p.carried) { p.carried = false; p.noSpecials = false; }
  f.hp = 0; f.mode = 'dying'; f.death = { t: 0, step: 'stagger', far: Math.abs(MOUTH_AT.x - 70 - f.x) }; token++; f.said = null; f.answer = false;
  silenceAll();
  clearShots(state);
  f.globs = f.globs.filter(g => g.pus);
  state.enemies = state.enemies.filter(q => q !== f.e);
  p.inCutscene = true; p.untouchable = true;
  f.vx = 0; f.y = GY;
  playSound('roar', 0.8, 10); shakeScreen(state, 10, 5);
  onKilled?.(state);
};
/** The mouth he ends up flopped into (his middle, world). */
export const MOUTH_AT = { x: SUMMIT.mouthX + 30, y: GY };
const POP_T = 96;
const updateDying = (ctx: FrameContext, f: Fight): Controls => {
  const { state } = ctx, d = f.death!, p = state.player;
  d.t++;
  p.inCutscene = true; p.vel.x = 0;
  misc(ctx, f);
  switch (d.step) {
    case 'stagger':
      // (staggering about, all three arms going, green and pus out of him: drunken lurches, always on toward the
      // slide's mouth (the owner's "the level one boss will stumble and fall over so he's always near the slide on
      // death"))
      { const to = MOUTH_AT.x - 70, lurch = Math.max(0, Math.sin(d.t * 0.18)) * Math.max(2.6, d.far / 40);
        f.x += Math.sign(to - f.x) * Math.min(Math.abs(to - f.x), lurch) + Math.sin(d.t * 0.5) * 1;
        if (Math.abs(to - f.x) > 6) f.face = to > f.x ? 1 : -1;
        if (d.t % 22 === 11) { playSound('thud', 0.7, -10); shakeScreen(state, 4, 2); } }
      f.x = Math.max(SUMMIT.L + 70, Math.min(MOUTH_AT.x - 40, f.x));
      if (d.t % 6 === 0) state.particles.push({ pos: { x: f.x, y: f.y - 150 }, vel: { x: (Math.random() - 0.5) * 5, y: -2 - Math.random() * 3 }, life: 30, color: '#3FA34D', size: 3 + Math.random() * 3, grav: 0.3 });
      if (d.t > 60 && Math.abs(MOUTH_AT.x - 70 - f.x) < 40 || d.t > 200) { f.face = MOUTH_AT.x > f.x ? -1 : 1; d.step = 'line'; d.t = 0; kidSays(f, pick(byPants(state, L.KID_DEATH)), true, () => { if (f.death) { f.death.step = 'pop'; f.death.t = 0; } }); }
      break;
    case 'line':
      if (d.t > 400) { d.step = 'pop'; d.t = 0; }
      break;
    case 'pop': {
      // (every boil at once: pus everywhere, the air farted and wheezed out of him, down to the scrawny manchild)
      const k = Math.min(1, d.t / POP_T), e = k * k * (3 - 2 * k);
      f.scale = S - (S - 1) * e + Math.sin(d.t * 0.9) * 0.05 * (1 - k);
      if (d.t === 1) { playSound('squish', 1, -10); playSound('gush', 1, -8); playSound('gorespray', 0.6, 0); shakeScreen(state, 12, 5); }
      if (d.t % 9 === 0 && k < 0.95) playSound('fart', 0.8, -14 + k * 26);
      if (d.t % 2 === 0 && k < 0.9) {
        const bx = f.x + (Math.random() - 0.5) * 80 * f.scale, by = f.y - (40 + Math.random() * 100) * f.scale;
        f.globs.push({ x: bx, y: by, vx: (Math.random() - 0.5) * 7, vy: -2 - Math.random() * 5, pus: true });
        state.particles.push({ pos: { x: bx, y: by }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 4 }, life: 26, color: Math.random() < 0.5 ? '#F4E27A' : '#3FA34D', size: 2 + Math.random() * 3, grav: 0.3 });
      }
      if (k >= 1) { f.scale = 1; d.step = 'fall'; d.t = 0; playSound('snort', 0.6, 16); }
      break;
    }
    case 'fall': {
      // (backward, tripping over his short leg, toward the mouth: over he goes)
      const k = Math.min(1, d.t / 40);
      f.x += (MOUTH_AT.x - 40 - f.x) * 0.08;
      if (d.t === 20) playSound('whoosh', 0.7, -8);
      if (k >= 1) {
        d.step = 'flop'; d.t = 0; playSound('splash', 1, -8); playSound('splat', 0.9, -6); shakeScreen(state, 10, 4);
        for (let i = 0; i < 26; i++) state.particles.push({ pos: { x: MOUTH_AT.x, y: GY - 6 }, vel: { x: (Math.random() - 0.5) * 7, y: -2 - Math.random() * 6 }, life: 34, color: i % 3 ? '#7DD3FC' : '#3FA34D', size: 2 + Math.random() * 3 });
      }
      break;
    }
    case 'flop':
      if (d.t > 30) { d.step = 'done'; f.mode = 'dead'; }
      break;
    case 'done': break;
  }
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------

/** A frame of the summit's fight. */
export const updateFight = (ctx: FrameContext, f: Fight, controls: Controls): Controls => {
  if (f.mode === 'intro') return updateIntro(ctx, f);
  if (f.mode === 'dying') return updateDying(ctx, f);
  if (f.mode === 'dead') return hands();
  return updateOn(ctx, f, controls);
};
export const fightDead = (f: Fight) => f.mode === 'dead';
/** Held in the squeeze right now (the stage puts the mash's real button up: ui.chordTips). */
export const fightHeld = (f: Fight) => f.mode === 'on' && f.act === 'hold';

/** The kid's pose this frame (q below 0: the pose's own loop off the frame count). */
const poseOf = (f: Fight): { pose: KidPose; q: number; noHand?: boolean } => {
  const P = (pose: KidPose, q = -1, noHand = false) => ({ pose, q, noHand });
  if (f.mode === 'intro') return P(f.intro === 'view' || f.intro === 'kick' || f.intro === 'walk' || (f.intro === 'turn' && f.introT < 10) ? 'sit' : f.intro === 'talk' && f.said ? 'talk' : 'idle');
  if (f.mode === 'dying') { const s = f.death!.step; return s === 'line' ? P('talk') : s === 'pop' ? P('spasm') : P('stagger'); }
  if (f.mode === 'on' && cheapShotStunned(f.e)) return P('stun');
  const t = f.actT;
  switch (f.act) {
    case 'walk': return P('walk', Math.floor(f.walkPh));
    case 'turn': return P('whine', 0);
    case 'whine': return P('whine');
    case 'scratch': return P('scratch', Math.floor(t / 6) % 2);
    case 'buckle': return P('buckle');
    case 'spasm': return P('spasm');
    case 'hold': return P('grabHold', Math.floor(t / 10) % 2);
    case 'tell':
      switch (f.move) {
        case 'slam': return P('slamUp'); case 'low': return P('lowBack'); case 'high': return P('highBack'); case 'whip': return P('whipBack');
        case 'grab': return P('grabReach'); case 'ray': return P('aim'); case 'puke': return P('retch', Math.floor(t / 8) % 2); default: return P('stomp');
      }
    case 'do':
      switch (f.move) {
        case 'slam': return P(t < 5 ? 'slamUp' : 'slamDown'); case 'low': return P(t < 2 ? 'lowBack' : 'lowThru'); case 'high': return P(t < 2 ? 'highBack' : 'highThru');
        case 'whip': return P('whipOut', 0, true); case 'grab': return P('grabReach'); case 'ray': return P('fire'); case 'puke': return P('puke'); default: return P('stompDown');
      }
    case 'recover':
      if (f.move === 'slam') return P('slamDown');
      if (f.move === 'low' && t < 12) return P('lowThru');
      if (f.move === 'high' && t < 12) return P('highThru');
      if (f.move === 'grab') return P(t < 24 ? 'stagger' : 'whine', t < 24 ? Math.floor(t / 8) % 2 : -1);
      if (f.move === 'stomp' && t < 8) return P('stompDown');
      break;
  }
  if (f.flash > 4) return P('hurt');
  return P(f.said ? 'talk' : 'idle');
};
const optsOf = (f: Fight): KidOpts => { const p = poseOf(f); return { pose: p.pose, q: Math.max(0, p.q), arm: f.arm, noHand: p.noHand }; };

/** World space: the kid (and his words over him), his puddles and globs, the slam's shadow, the squeeze's meter. */
export const drawFight = (c: Ctx, state: GameState, f: Fight) => {
  // (the puddles: pus and puke on the floor, going tacky)
  for (const pd of f.puddles) {
    c.globalAlpha = Math.min(1, (600 - pd.t) / 120);
    c.fillStyle = pd.pus ? '#B89A2A' : '#6A8A1A'; c.beginPath(); c.ellipse(pd.x, GY - 1, pd.w, 3.2, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = pd.pus ? '#F4E27A' : '#A8C83A'; c.beginPath(); c.ellipse(pd.x - pd.w * 0.2, GY - 1.6, pd.w * 0.55, 1.4, 0, 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
  const gone = f.mode === 'dead' || (f.mode === 'dying' && (f.death!.step === 'flop' || f.death!.step === 'done'));
  if (!gone) {
    const o = poseOf(f), pose = o.pose;
    // (the slam's tell: the shadow where the fists will land, darkening)
    if (f.mode === 'on' && f.act === 'tell' && f.move === 'slam') {
      const k = Math.min(1, f.actT / f.T), hx = f.x + f.face * SLAM_AT;
      c.fillStyle = `rgba(16, 6, 10, ${0.18 + 0.4 * k})`; c.beginPath(); c.ellipse(hx, GY - 1, 30 + 30 * k, 5 + 2 * k, 0, 0, Math.PI * 2); c.fill();
    }
    const glow = pose === 'aim' ? Math.min(1, f.actT / f.T) : pose === 'fire' ? 1 : 0;
    const shake = (f.act === 'tell' && (f.move === 'slam' || f.move === 'whip')) || pose === 'spasm' ? (Math.random() - 0.5) * 2.4 : 0;
    c.save();
    c.translate(Math.round(f.x + shake), Math.round(f.y));
    if (f.mode === 'dying' && f.death!.step === 'fall') c.rotate(-f.face * Math.min(1.4, f.death!.t / 28));
    c.scale(f.face * f.scale, f.scale);
    if (f.iframes > BOSS_IFRAMES - 24 && f.mode === 'on' && Math.floor(f.iframes / 4) % 2 === 0) c.globalAlpha = 0.8;
    const kopts: KidOpts = { pose, q: o.q, arm: f.arm, mouth: !!f.said, noHand: o.noHand };
    drawKid(c, kopts, state.frame, glow);
    if (o.noHand) drawLash(c, kopts, f.lash);
    // (a boil swelling up, trembling, ready)
    if (f.boil && f.mode === 'on') {
      const [bx, by] = kidSpots({ ...kopts, q: Math.max(0, o.q) })[f.boil.at], k = f.boil.t / 50, r = 1.6 + 5 * k, j = k > 0.6 ? (Math.random() - 0.5) * 0.8 : 0;
      c.fillStyle = '#C24A44'; c.beginPath(); c.ellipse(bx + j, by + 0.5, r * 1.5, r * 1.3, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#E8685A'; c.beginPath(); c.ellipse(bx + j, by, r, r * 0.9, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#F4E27A'; c.beginPath(); c.ellipse(bx + j - r * 0.1, by - r * 0.25, r * 0.6, r * 0.5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFFCE0'; c.fillRect(bx + j - r * 0.45, by - r * 0.6, Math.max(0.8, r * 0.25), Math.max(0.8, r * 0.2));
    }
    c.restore();
  }
  // (the globs in the air)
  for (const g of f.globs) { c.fillStyle = g.pus ? '#D8BC3A' : '#7A9A22'; c.fillRect(Math.round(g.x - 3), Math.round(g.y - 3), 6, 5); c.fillStyle = g.pus ? '#FFFCE0' : '#C8E85A'; c.fillRect(Math.round(g.x - 2), Math.round(g.y - 2), 2, 2); }
  // (held: how close he is to wriggling out)
  if (f.mode === 'on' && f.act === 'hold') {
    const at = holdAt(f), k = Math.min(1, f.mash / MASH_OUT);
    c.fillStyle = '#18181B'; c.fillRect(Math.round(at.x - 24), Math.round(at.y - 52), 48, 6);
    c.fillStyle = '#BEF264'; c.fillRect(Math.round(at.x - 23), Math.round(at.y - 51), Math.round(46 * k), 4);
  }
  if (f.said && !gone) saidOver(c, f.said, f.x, f.y - KID_H * f.scale - 50, '#BEF264', 280);
};
/** The summit's door (kicked in: down flat) at its left. */
export const doorState = (f: Fight | null) => (f ? f.door : 0);

/** Screen space: his bar in the top band; the intro's letterbox, the gross-up, SKIP. */
export const drawFightHud = (c: Ctx, state: GameState, f: Fight, band: { x1: number; x2: number; mid: number }) => {
  if (f.mode === 'intro') {
    if (f.intro === 'retry') return;
    if (f.intro === 'gross') { drawKidGrossBack(c, CANVAS_WIDTH, CANVAS_HEIGHT); drawKidGross(c, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 6, 0.9 + 0.1 * Math.min(1, f.introT / 10), state.frame, f.introT % 30 < 16, f.introT < 16 ? 2 : 0); }
    const k = Math.min(1, f.skipT / 20), bar = Math.round(k * 44);
    c.fillStyle = '#000'; c.fillRect(0, 0, CANVAS_WIDTH, bar); c.fillRect(0, CANVAS_HEIGHT - bar, CANVAS_WIDTH, bar);
    if (f.skipT > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
    return;
  }
  if (f.mode !== 'on' || state.player.inCutscene) return;
  const w = band.x2 - band.x1, k = Math.max(0, f.hp / KID_HP);
  box(c, band.x1, 22, w, 14, '#18181B'); box(c, band.x1 + 2, 24, (w - 4) * k, 10, f.iframes > 0 && Math.floor(f.iframes / 4) % 2 ? '#D9F99D' : '#84CC16');
  for (let i = 1; i < 10; i++) box(c, Math.round(band.x1 + 2 + ((w - 4) * i) / 10), 24, 1, 10, '#18181B');
  label(c, L.KID_NAME, band.mid, 50, '#BEF264', 7);
};
export const fightLive = () => live;
// (dev only: a headless check can bring him to his death, and see his sheet)
if (import.meta.env.DEV && typeof window !== 'undefined') { const w = window as unknown as Record<string, unknown>; w.__kidFight = () => live; w.__kidLow = (hp = 1) => { if (live) live.hp = hp; }; w.__kidSheet = (only?: KidPose[], zoom?: number, cols?: number) => kidContactSheet(only, zoom, cols)?.toDataURL('image/png'); }
