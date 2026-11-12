// SKULL GROTTO: MEHPHISTO, Satan's other son (level 2's boss; the demon one in the water park's alien / demon order),
// and, half way, his brother. The owner's spec (2026-11-05): "make him similar to his brother. A soulsborne esque boss
// whose telegraphs must be read/avoided. When he's at 50, the boss from spooky land comes and it turns into a 2 on 1
// fight. He has half as much health though. One one dies he falls to his knees, disabled until the other is down."
// The owner's still to give the raw mechanics: for now the standing boss rules (999 HP, the 75-frame breather after a
// hit; the ray gun and his moves in full, every special 35% (the owner's rule for every water park boss, 2026-11-05: no
// weakness, the specials generally better than the ray gun; all die the same); no more than about five seconds of one
// attack: the spam breaker).
//
//   THE INTRO   (a cutscene, skippable, all of it; no HUD) He walks up to the grotto's door (a plywood board: KEEP OUT.
//               SERIOUSLY.) and kicks it in. The son's sunk in his beanbag at the back in the smoke; he doesn't get up
//               (the gross-up); his say, Meathead's, his again; on. A retry: a beat for him to say so, then on.
//   MEHPHISTO   Every move a long, clear wind-up to read, deadly if it lands, and a window after it to hit him in:
//     LEAP      sinks low, the coat flaring (the tell); up in a puff of smoke, gone; his shadow on the floor following
//               Meathead (then set); down on it out of the ceiling: crushed under him, and a burp of fire rolled out
//               along the floor both ways off the landing (jump it). Winded after.
//     ROACHES   the lighter clicked, clicked (the tell): three lit roaches flicked in arcs, at him and either side of
//               him (fire where they land, a while). He takes a drag after.
//     RING      the vape up, a long drag (the tell), the smoke gathering at the height it'll come at: a big hot ring
//               blown along at him (high: duck it; low: jump it). Down past half, two, the second the other height.
//     PILLARS   pointing (the tell): the floor glowing where Meathead is and either side, then hellfire up out of it.
//               After, he looks up for his dad (an opening).
//     BREATH    rears back, a hand on his gut, the gurgle (the tell): then hunched, a jet of fire straight out at waist
//               height across most of the grotto (duck it, or be up over it). He coughs after.
//     TAIL      close up (don't hug him): the tail cocked up behind him (the tell), then whipped low out in front (jump
//               it).
//   BRATHAZAR   The owner (2026-11-06): "stage 2 is about managing two large threats attacking at once. a standard
//               fromsoft surprise ambush". At half, no beat, no call: Meathead mocks him (in play), and a moment later
//               the AMBUSH: a split-second tell (a rumble, dust off the ceiling or rocks off the wall behind Meathead,
//               the heavy metal kicking in) and Spooky Land's punk jumps in: dropped down out of the ceiling, or
//               leaped in over the wall behind him, landing on the far side of Meathead from his brother. The owner:
//               "the other one shouldn't do damage to the player at all until a couple second pass ... it is immune
//               for a moment and you are immune to it": GRACE, two seconds from the jump in, flickering: he can't
//               hurt and can't be hurt. Then he's live, at his whole bar (half the son's health: BRO_HP), his own
//               moves from hell (the LEAP's crouch and shadow, the SWEEP's floor flashing out in front, the RUSH's
//               pawing and the arrows along the floor), spaced for the smaller room.
//   TWO AT ONCE Both run their own moves at the same time (the owner: "the player should be able to see two threats
//               going off at once"): when one starts, the other's pulled in to start too. Every move has a danger
//               window (when it can hurt) and an answer (jump, duck, get off the spot, get out from under). The
//               second one's move is picked to land WITH the first when the answers mix (the floor glowing or burning
//               where he stands while the other sweeps low: get off the spot and jump; the jet at the waist while the
//               pillars come: stand in a gap and duck; two low ones together: one jump) and otherwise to land just
//               after it. Never two that can't both be dodged: a leap onto him (get out from under) never lands
//               with anything. The brother stalks round to the far side of Meathead from his brother: the crossfire.
//               The whole grotto is the screen (the camera's fixed on it), so both are always in view.
//   DOWN        The first of them down drops to his knees: out of it (no attacks, nothing hits him) till the other's down.
//               Both down: the end (end.ts: they try to run, the pretzel, the beer, the river).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind } from '../../../m1/types';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { say, silenceAll, pickLine } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { CANVAS_WIDTH, CANVAS_HEIGHT, KICK_POSE_FRAMES } from '../../../m1/constants';
import { endgameBoss, endgameDamage } from '../../weapons/endgameDamage';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { ownShare } from '../../weapons/subBoss';
import { setSickHurl, takeSickBurst } from '../../weapons/crossbow';
import { newSpam, spamTick, hitKey, swatOff, type Spam, BOSS_IFRAMES } from '../../bossSpam';
import { bossIntroSeen, markBossIntroSeen } from '../../bossIntro';
import { TOO_BIG_BY_KIND } from '../../lines/weaponLines';
import { box, label, saidOver, speak, voice, meatheadSays } from '../../adventure/section';
import { drawPunkAs, DEMON_NUTLESS, type PunkSt } from '../../spooky/hell/demon';
import { cheapShotGate, cheapShotStunned, endCheapStun, registerClearThreats, crushGroups, crushLines, type CrushId } from '../../upgrades/cheapShot';
import { keptForRevisits } from '../../store';
import { DEMON_CHATTER, DEMON_HURT, HURT_CRUSH, DEATH_CRUSH, HURT_WAVE, DEATH_WAVE, HURT_GUITAR, DEATH_GUITAR, HURT_RUSH, DEATH_RUSH, HURT_BUMP, DEATH_BUMP } from '../../spooky/hell/demonLines';
import { byPants } from '../park1/kinds';
import { drawSon, sonHand, sonMouth, SON_W, SON_H, type SonPose } from './sonArt';
import { drawSonGross, drawSonGrossBack, warmSonGross } from './sonGross';
import { shoot2, lob, clearFire, fireOf, FIRE } from './fire';
const shotsNow = (state: GameState) => fireOf(state).shots;
import { GROTTO, GY } from './geo';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;

// ---------------------------------------------------------------------------------------------------------------
// The numbers (tune here)

export const SON_HP = 999;
/** The brother: half the son's. */
export const BRO_HP = Math.round(SON_HP / 2);
const BIG = 100000;
export const ARENA_L = GROTTO.door + 60, ARENA_R = GROTTO.R - 50;
/** Where his beanbag is (he's sunk in it for the intro). */
export const BEANBAG_X = GROTTO.R - 150;
/** Damage, before Meathead 2's own cut (×0.65): deadly, meant to be dodged. */
const DMG = { crush: 33, wave: 22, roach: 18, ring: 24, pillar: 28, breath: 28, tail: 22, touch: 12, broCrush: 34, broWave: 22, sweep: 29, rush: 33 };
/** Wind-ups (the tells) and the openings after (frames); under half, the wind-ups a fifth quicker. */
const WIND = { crouch: 40, flick: 36, inhale: 46, point: 34, rear: 46, cock: 28, broCrouch: 40, sweepWind: 46, rushWind: 56 };
const OPEN = { land: 50, roach: 36, ring: 40, pose: 60, cough: 44, tail: 34, broLand: 50, sweep: 42, crash: 80 };
/** Two on one, the openings after a move cut to this (the pressure: the other one's on him meanwhile). */
const DUO_OPEN = 0.7;
const JET = { near: 40, reach: 350, top: GY - 92, bot: GY - 50, T: 36 };
const TAIL_REACH = 185, SWEEP_REACH = 235, RUSH_SPEED = 12, RING_R = 16, PILLAR_R = 27, BRO_BOX = 84;
/** Alone, the rest after a move before the next (frames, and up to `ALONE_RND` more); two on one, each one's own. */
const ALONE_CD = 44, ALONE_RND = 30, DUO_CD = { son: [8, 14], bro: [6, 10] } as const;
/** Two on one, the longest a tell's held to land after the other's hit instead of on it (frames). */
const HOLD_MAX = 70;
/** The ambush: Meathead's mock to the tell (frames, and up to `AMB_RND` more); the tell (a split second); the grace
 *  from the jump in (the owner's "a couple second": neither hurts the other); how far off Meathead he lands. */
const AMB_WAIT = 40, AMB_RND = 50, AMB_TELL = 30, GRACE = 120, AMB_LAND = 140;
/** Danger windows: the gap kept between two that can't share one (frames); two low ones this close: one jump. */
const DZ_PAD = 16, DZ_TOGETHER = 8;

for (const [src, hurt, death] of [['m2:wp2_brocrush', HURT_CRUSH, DEATH_CRUSH], ['m2:wp2_browave', HURT_WAVE, DEATH_WAVE], ['m2:wp2_brosweep', HURT_GUITAR, DEATH_GUITAR], ['m2:wp2_brorush', HURT_RUSH, DEATH_RUSH], ['m2:wp2_bro', HURT_BUMP, DEATH_BUMP]] as const) registerHurtLines(src, hurt, death);

type Who = 'son' | 'bro';
type SonMove = 'leap' | 'roach' | 'ring' | 'pillars' | 'breath' | 'tail';
type BroMove = 'bleap' | 'sweep' | 'rush';
type Move = SonMove | BroMove;
/** A move's answer: J jump it, D duck it, Z get off the spot (the floor's lit or burning where he is: a while), C get
 *  out from under (a leap onto him: he has to be free to run), X both heights one after the other (the double ring). */
type Ans = 'J' | 'D' | 'Z' | 'C' | 'X';
/** When a move can hurt him (frames, absolute: the fight's `total`), and how it's dodged. */
interface Danger { a: number; b: number; ans: Ans }
export interface Foe {
  who: Who; e: Enemy; hp: number; max: number; iframes: number; flash: number; moveSeen?: number; spam: Spam;
  x: number; y: number; vx: number; vy: number; face: 1 | -1;
  /** What he's doing: 'walk' (between), a move's own steps, 'kneel' (down). */
  st: string; t: number; T: number; move: Move | null; last: Move[]; cd: number;
  down: boolean; said: string | null;
  /** The ring's height, the leap's landing (where his shadow is), the rush's way, a move's hit had. */
  high: boolean; aim: number; rushDir: 1 | -1; hit: boolean; shots: number;
  /** Wincing at his brother's nuts going (frames left): a flinch, no attacking. Frozen in a cheap shot's cutscene. */
  wince: number; frozen: boolean;
  /** His move's danger window (null: none on). The grace after the brother jumps in (frames left: neither hurts the
   *  other). A leap off to the far side (the spam breaker, two on one): harmless, just away. */
  dz: Danger | null; grace: number; away: boolean;
}
type Intro = 'kick' | 'walk' | 'view' | 'gross' | 'talk' | 'retry';
export interface Fight2 {
  mode: 'intro' | 'on' | 'end';
  son: Foe; bro: Foe | null;
  intro: Intro; introT: number; skipT: number; talkStep: number;
  /** The ambush (at half): frames since Meathead's mock; when the tell starts; down out of the ceiling or leaped in over
   *  the wall; where he lands, the side he comes from (the wall's). The brother's made at the tell (the metal's on). */
  amb: { t: number; at: number; kind: 'drop' | 'leap'; x: number; side: 1 | -1 } | null;
  /** Where the way in broke (the ceiling, the wall): rubble and a hole, a while. */
  hole: { x: number; y: number; t: number; wall: boolean } | null;
  total: number; tauntAt: number; lowSaid: boolean;
  door: number;
}

const SON_KIND = 'm2:wp2_sonboss' as const, BRO_KIND = 'm2:wp2_broboss' as const;
for (const [kind, w, h, blood] of [[SON_KIND, SON_W, SON_H, '#7F1D1D'], [BRO_KIND, 60, 160, '#7F1D1D']] as const) registerM2Kind({
  kind, stats: { w, h, hp: BIG, contact: 0, mass: 300, air: true },
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y, harmless: true }),
  gender: 'm', humanoid: true, grab: 'none', midBoss: true, blood,
  head: { x: 20, y: -h + 16, r: 14 },
  draw: () => {},
  ai: () => true,
});
// (grabbing either: his line, by his pants (set as the fight goes: updateFight2))
TOO_BIG_BY_KIND[SON_KIND] = L.GRAB_SON.clean;
TOO_BIG_BY_KIND[BRO_KIND] = L.GRAB_SON.clean;
// (every special's hit worked out here, in the fight, off the table: not cut again as a sub-boss's)
ownShare(SON_KIND, BRO_KIND);
// (every special's hit off the water park's own damage table, by weapon and move: weapons/endgameDamage.ts)
endgameBoss(SON_KIND, BRO_KIND);
setSickHurl(SON_KIND, BRO_KIND);
// (the hand armor's cheap shot (upgrades/cheapShot.ts) on both: the son's own crushed set and close-up; his brother's
// as in hell, unless they were torn out there (then there's nothing left: Y + B on him grabs at nothing, his line))
crushGroups('mehphisto', { hurt: [L.SON_HURT], taunt: [L.SON_LAZY, L.SON_LOW] });
for (const id of ['mehphisto', 'brathazar'] as CrushId[]) registerClearThreats(id, state => {
  for (const sh of [...shotsNow(state)]) for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: sh.x + (Math.random() - 0.5) * 20, y: sh.y - Math.random() * 20 }, vel: { x: (Math.random() - 0.5) * 2, y: -1 - Math.random() * 2 }, life: 30, color: i % 2 ? 'rgba(68, 64, 60, 0.6)' : '#F97316', size: 3 + Math.random() * 4 });
  clearFire(state); playSound('flame', 0.6, 6);
});
/** His nuts were torn out in hell (the file says: spooky/hell/demon.ts DEMON_NUTLESS): none to have here. */
export const broNutless = () => keptForRevisits(DEMON_NUTLESS) === '1';

let token = 0;
export const resetFight2 = () => { token++; };
const pmid = (state: GameState) => ({ x: state.player.pos.x + state.player.width / 2, y: state.player.pos.y + state.player.height / 2 });
const voiceOf = (who: Who) => (who === 'son' ? L.SON_VOICE : 'm2.demon');
/** A line of his, its turn (waits for anybody talking), `onDone` after. */
export const foeSays = (o: Foe, text: string, onDone?: () => void) => { const tok = token; speak(voiceOf(o.who), text, s => { if (tok === token) o.said = s?.text ?? null; }, true, () => { if (tok === token) onDone?.(); }); };
/** A bark (dropped if anybody's talking). */
const bark = (state: GameState, o: Foe, lines: { clean: readonly string[]; shitty: readonly string[]; nude: readonly string[] }) => {
  if (o.said) return;
  const text = pick([...byPants(state, lines)]), tok = token;
  say(text, voice(voiceOf(o.who)), 'casual', {
    always: true,
    onShow: spoken => { if (tok !== token) return; o.said = text; if (!spoken) setTimeout(() => { if (o.said === text) o.said = null; }, Math.max(1600, text.length * 65)); },
    onHide: () => { if (o.said === text) o.said = null; },
  });
};
const hands = (): Controls => ({ left: false, right: false, up: false, down: false, jump: false, special: false, shoot: false });
const setSt = (o: Foe, st: string, T: number) => { o.st = st; o.t = 0; o.T = Math.max(1, Math.round(T)); };
const mad = (o: Foe) => (o.hp < o.max / 2 ? 0.8 : 1);

const newFoe = (who: Who, x: number, y: number): Foe => {
  const e = makeKindEnemy((who === 'son' ? SON_KIND : BRO_KIND) as EnemyKind, x, y);
  e.seen = true;
  const max = who === 'son' ? SON_HP : BRO_HP;
  return { who, e, hp: max, max, iframes: 0, flash: 0, moveSeen: e.hitByMove, spam: newSpam(), x, y, vx: 0, vy: 0, face: -1, st: 'walk', t: 0, T: 60, move: null, last: [], cd: 50, down: false, said: null, high: false, aim: 0, rushDir: -1, hit: false, shots: 0, wince: 0, frozen: false, dz: null, grace: 0, away: false };
};

export const startFight2 = (state: GameState): Fight2 => {
  token++;
  const f: Fight2 = {
    mode: 'intro', son: newFoe('son', BEANBAG_X, GY), bro: null,
    intro: 'kick', introT: 0, skipT: 0, talkStep: 0, amb: null, hole: null, total: 0, tauntAt: 700, lowSaid: false, door: 0,
  };
  f.son.st = 'sit';
  warmSonGross();
  state.player.inCutscene = true;
  if (bossIntroSeen(state, 'mehphisto')) { f.intro = 'retry'; f.door = 1; }
  return f;
};
const beginFight = (state: GameState, f: Fight2) => {
  token++; markBossIntroSeen(state, 'mehphisto');
  f.son.said = null; state.cameraOverride = null;
  const p = state.player;
  p.inCutscene = false; p.kickPose = 0;
  f.mode = 'on'; f.door = 1;
  setSt(f.son, 'walk', 50); f.son.cd = 50;
  if (!state.enemies.includes(f.son.e)) state.enemies.push(f.son.e);
};

// ---------------------------------------------------------------------------------------------------------------
// The intro

const updateIntro = (ctx: FrameContext, f: Fight2): Controls => {
  const { state } = ctx, p = state.player;
  f.introT++; f.skipT++;
  p.inCutscene = true; p.vel.x = 0;
  const skippable = f.intro !== 'retry';
  if (skippable && f.skipT > SKIP_AFTER) offerSkip();
  if (skippable && f.skipT > SKIP_AFTER && takeSkip()) { silenceAll(); state.playerVulgarityTimer = 0; p.pos.x = GROTTO.door + 120 - p.width / 2; p.facing = 1; beginFight(state, f); return hands(); }
  const t = f.introT;
  switch (f.intro) {
    case 'kick':
      p.facing = 1;
      // (the kick plays through, frame by frame: nothing else counts it down here, so it held its first frame)
      if ((p.kickPose || 0) > 0) p.kickPose!--;
      if (t === 2) meatheadSays(state, pick(byPants(state, L.MH_DOOR)), false);
      if (t === 8) p.kickPose = KICK_POSE_FRAMES;
      if (t === 16) { f.door = 0.01; playSound('crash', 1, -6); playSound('crack', 0.9, -4); shakeScreen(state, 12, 5); }
      if (f.door > 0) f.door = Math.min(1, f.door + 0.12);
      if (t > 36) { f.intro = 'walk'; f.introT = 0; p.kickPose = 0; }
      break;
    case 'walk':
      p.facing = 1; p.vel.x = 2.2;
      if (p.pos.x + p.width / 2 > GROTTO.door + 120) { p.vel.x = 0; f.intro = 'view'; f.introT = 0; }
      break;
    case 'view':
      if (t === 20) playSound('glug', 0.6, -6);
      if (t > 60) { f.intro = 'gross'; f.introT = 0; playSound('snort', 0.5, -10); }
      break;
    case 'gross':
      if (t > 105) { f.intro = 'talk'; f.introT = 0; f.talkStep = 0; }
      break;
    case 'talk':
      if (f.talkStep === 0) { f.talkStep = 1; foeSays(f.son, pick(byPants(state, L.SON_INTRO)), () => { f.talkStep = 2; }); }
      if (f.talkStep === 2) { f.talkStep = 3; meatheadSays(state, pick(byPants(state, L.MH_INTRO2)), true, () => { f.talkStep = 4; }); }
      if (f.talkStep === 4) { f.talkStep = 5; foeSays(f.son, pick(byPants(state, L.SON_INTRO2)), () => { f.talkStep = 6; }); }
      if (f.talkStep === 6) beginFight(state, f);
      if (t > 1600) beginFight(state, f);
      break;
    case 'retry':
      if (t === 1) bark(state, f.son, L.SON_RETRY);
      if (t > 70) beginFight(state, f);
      break;
  }
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------
// The ambush (at half): Meathead's mock; a split second's tell; the brother jumps in (out of the ceiling, or over the
// wall behind Meathead) and lands on the far side of him from his brother; two seconds' grace; live

const startAmb = (state: GameState, f: Fight2) => {
  const p = pmid(state), pl = state.player;
  // (out of the ceiling, or in over the wall behind him: the wall he's got his back to (the far one, if he's right up
  // against it))
  const kind: 'drop' | 'leap' = Math.random() < 0.5 ? 'drop' : 'leap';
  let side: 1 | -1 = (pl.facing > 0 ? -1 : 1);
  if ((side < 0 ? p.x - ARENA_L : ARENA_R - p.x) < 160) side = (-side) as 1 | -1;
  f.amb = { t: 0, at: AMB_WAIT + Math.floor(Math.random() * AMB_RND), kind, x: 0, side };
  meatheadSays(state, pick(byPants(state, L.MH_MOCK)), false);
};
/** Where he lands: the far side of Meathead from his brother (the crossfire), in the room. */
const ambLand = (state: GameState, f: Fight2) => {
  const p = pmid(state), away = f.son.x < p.x ? 1 : -1;
  let x = p.x + away * AMB_LAND;
  if (x < ARENA_L + 40 || x > ARENA_R - 40) x = p.x - away * AMB_LAND;
  return Math.max(ARENA_L + 40, Math.min(ARENA_R - 40, x));
};
const rubble = (state: GameState, x: number, y: number, n: number, vy: number) => {
  for (let k = 0; k < n; k++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 70, y: y + (Math.random() - 0.5) * 20 }, vel: { x: (Math.random() - 0.5) * 3, y: vy + Math.random() * 3 }, life: 44, color: k % 3 ? '#3A2A34' : '#6A5A64', size: 3 + Math.random() * 4, grav: 0.3 });
};
const stepAmb = (state: GameState, f: Fight2) => {
  const a = f.amb!;
  a.t++;
  const tell = a.t - a.at;
  if (tell < 0) return;
  const top = GY - 470;
  if (tell === 0) {
    // (the tell: his music, the rumble; the brother's made (the metal's on him), not yet anywhere)
    a.x = ambLand(state, f);
    f.bro = newFoe('bro', a.x, GY - 600); f.bro.st = 'lurk';
    playSound('rumble', 1, -10); playSound('crack', 0.8, -14); shakeScreen(state, 6, 3);
  }
  if (tell < AMB_TELL) {
    // (dust off the ceiling over where he'll come down; rocks shaken loose off the wall's top behind Meathead)
    if (a.kind === 'drop') { if (tell < 14) a.x = ambLand(state, f); if (tell % 2 === 0) rubble(state, a.x, top + 10, 2, 1); }
    else if (tell % 3 === 0) rubble(state, a.side > 0 ? ARENA_R + 30 : ARENA_L - 30, GY - 240 - Math.random() * 120, 2, 0);
    if (tell % 10 === 5) shakeScreen(state, 4, 2);
    return;
  }
  // (in: the jump; the grace from now)
  const b = f.bro!;
  b.grace = GRACE;
  if (a.kind === 'drop') {
    b.x = a.x; b.y = top - 60; b.vx = 0; b.vy = 6; b.aim = a.x;
    f.hole = { x: a.x, y: top, t: 0, wall: false };
    rubble(state, a.x, top + 10, 20, 2); playSound('crash', 1, -10);
  } else {
    const T = 34;
    b.x = a.side > 0 ? ARENA_R + 70 : ARENA_L - 70; b.y = GY - 210; b.aim = a.x;
    b.vx = (a.x - b.x) / T; b.vy = -(0.6 * T) / 2 + 210 / T;
    f.hole = { x: a.side > 0 ? ARENA_R + 30 : ARENA_L - 30, y: GY - 230, t: 0, wall: true };
    rubble(state, f.hole.x, f.hole.y, 20, -1); playSound('crash', 1, -10);
  }
  b.face = pmid(state).x < a.x ? -1 : 1;
  setSt(b, 'air', 60); b.move = null; b.cd = 0;
  foeSays(b, pick(byPants(state, L.BRO_ARRIVE)), () => meatheadSays(state, pick(byPants(state, L.MH_BRO)), true));
  f.amb = null;
};

// ---------------------------------------------------------------------------------------------------------------
// The fight: the two of them (or the son alone, till half)

const live = (f: Fight2) => [f.son, f.bro].filter((o): o is Foe => !!o && !o.down && o.st !== 'lurk');
/** Both in it (the brother jumped in, neither down). */
const duo = (f: Fight2) => live(f).length === 2;
const otherOf = (f: Fight2, o: Foe) => (o.who === 'son' ? f.bro : f.son);
const sonPool = (adx: number): SonMove[] => adx < TAIL_REACH ? ['tail', 'tail', 'leap', 'breath'] : ['leap', 'roach', 'ring', 'pillars', 'breath', 'ring', 'roach'];
const broPool = (adx: number): BroMove[] => adx < SWEEP_REACH ? ['sweep', 'sweep', 'bleap'] : ['bleap', 'rush', 'sweep', 'rush'];
/** A move's danger window from its start (frames) and its answer; `high`: the ring's height (rolled first). */
const dangerOf = (state: GameState, o: Foe, m: Move, high: boolean): { a: number; b: number; ans: Ans } => {
  const k = mad(o), adx = Math.abs(pmid(state).x - o.x), two = o.who === 'son' && o.hp < o.max / 2;
  switch (m) {
    case 'leap': { const a = WIND.crouch * k + 44; return { a, b: a + 70, ans: 'C' }; }
    case 'roach': { const a = WIND.flick * k + 30; return { a, b: a + 160, ans: 'Z' }; }
    case 'ring': { const a = WIND.inhale * k + Math.max(0, adx - 40) / 3.6; return two ? { a, b: a + 50, ans: 'X' } : { a, b: a + 16, ans: high ? 'D' : 'J' }; }
    case 'pillars': { const a = WIND.point * k + 42 * k; return { a, b: a + 130, ans: 'Z' }; }
    case 'breath': { const a = WIND.rear * k; return { a, b: a + JET.T, ans: 'D' }; }
    case 'tail': { const a = WIND.cock * k + 2; return { a, b: a + 8, ans: 'J' }; }
    case 'bleap': { const a = WIND.broCrouch * k + 20; return { a, b: a + 70, ans: 'C' }; }
    case 'sweep': { const a = WIND.sweepWind * k + 2; return { a, b: a + 7, ans: 'J' }; }
    case 'rush': { const a = WIND.rushWind * k + Math.max(0, adx - 40) / RUSH_SPEED; return { a, b: a + 12, ans: 'J' }; }
  }
};
/** Can a move with danger `d` (absolute) go with the other's on (`o`'s)? 'with': landing together (a crossfire both can
 *  be dodged at once); 'after': clear of it; false: it'd make the two undodgeable together. */
const fits = (d: Danger, o: Danger | null): 'with' | 'after' | false => {
  if (!o || d.a > o.b + DZ_PAD || d.b < o.a - DZ_PAD) return 'after';
  const [x, y] = [d.ans, o.ans];
  // (two low ones landing together: one jump clears both)
  if (x === 'J' && y === 'J') return Math.abs(d.a - o.a) <= DZ_TOGETHER ? 'with' : false;
  // (ducking both)
  if (x === 'D' && y === 'D') return 'with';
  // (off the lit or burning spot, and over or under the other: never two spots at once, never with a leap onto him)
  if ((x === 'Z') !== (y === 'Z') && x !== 'C' && y !== 'C') return 'with';
  return false;
};
/** His turn to move: what fits with what his brother's got on (a crossfire, three times out of four when there's one),
 *  else nothing yet (a moment, then he looks again). */
const tryMove = (state: GameState, f: Fight2, o: Foe) => {
  const adx = Math.abs(pmid(state).x - o.x), now = f.total;
  const other = otherOf(f, o), od = other && !other.down && other.dz && other.dz.b > now ? other.dz : null;
  const pool: Move[] = o.who === 'son' ? sonPool(adx) : broPool(adx);
  const opts: { m: Move; high: boolean; d: Danger; w: number; hold: number }[] = [];
  for (const m of new Set(pool)) {
    if (o.last[0] === m) continue;
    const high = Math.random() < 0.5, r = dangerOf(state, o, m, high), d = { a: now + r.a, b: now + r.b, ans: r.ans };
    // (in his grace: nothing of his lands till it's over)
    if (o.grace > 0 && r.a < o.grace) continue;
    const n = pool.filter(q => q === m).length, fit = fits(d, od);
    if (fit) { opts.push({ m, high, d, w: (fit === 'with' ? 3 : 1) * n, hold: 0 }); continue; }
    // (it'd clash: started now anyway with its tell held longer (the crouch held, the pawing kept up), to land just
    // after the other's: both going at once, the hits one after the other)
    const hold = od ? od.b + DZ_PAD + 1 - d.a : 0;
    if (hold > 0 && hold <= HOLD_MAX) opts.push({ m, high, d: { a: d.a + hold, b: d.b + hold, ans: d.ans }, w: 1.5 * n, hold });
  }
  if (!opts.length) { o.cd = 6; return; }
  let r = Math.random() * opts.reduce((s, q) => s + q.w, 0), it = opts[0];
  for (const q of opts) { r -= q.w; if (r <= 0) { it = q; break; } }
  o.high = it.high;
  begin(state, f, o, it.m);
  o.T += it.hold;
  o.dz = it.d;
  // (two on one: the other's pulled in to start his too, so they're going off together)
  if (other && duo(f) && other.st === 'walk' && other.wince <= 0) other.cd = Math.min(other.cd, 2 + Math.random() * 10);
};
/** Into a move: its tell. */
const begin = (state: GameState, f: Fight2, o: Foe, m: Move) => {
  o.move = m; o.last = [m, ...o.last].slice(0, 3); o.shots = 0; o.hit = false; o.away = false; o.dz = null;
  void f;
  const p = pmid(state);
  o.face = p.x < o.x ? -1 : 1; o.vx = 0;
  const k = mad(o);
  switch (m) {
    case 'leap': setSt(o, 'crouch', WIND.crouch * k); playSound('suck', 0.5, -4); break;
    case 'roach': setSt(o, 'flick', WIND.flick * k); playSound('click', 0.7, 4); break;
    case 'ring': setSt(o, 'inhale', WIND.inhale * k); playSound('suck', 0.5, 8); break;
    case 'pillars': setSt(o, 'point', WIND.point * k); playSound('ignite', 0.6, -6); break;
    case 'breath': setSt(o, 'rear', WIND.rear * k); playSound('glug', 0.8, -12); break;
    case 'tail': setSt(o, 'cock', WIND.cock * k); playSound('whoosh', 0.4, 10); break;
    case 'bleap': setSt(o, 'crouch', WIND.broCrouch * k); playSound('snort', 0.6, -8); break;
    case 'sweep': setSt(o, 'sweepWind', WIND.sweepWind * k); playSound('grind', 0.5, -4); break;
    case 'rush': setSt(o, 'rushWind', WIND.rushWind * k); o.rushDir = o.face; break;
  }
};
/** Done (the opening's over): back to walking, a rest (alone, a longer one; two on one, each his own short one). */
const finishMove = (f: Fight2, o: Foe) => {
  setSt(o, 'walk', 0); o.move = null; o.away = false;
  const [c, r] = duo(f) ? DUO_CD[o.who] : [ALONE_CD, ALONE_RND];
  o.cd = c + Math.random() * r;
};
/** An opening after a move (frames): shorter two on one. */
const opening = (f: Fight2, n: number) => (duo(f) ? n * DUO_OPEN : n);
const hurtIf = (ctx: FrameContext, o: Foe, x: number, y: number, w: number, h: number, dmg: number, src: string, kx: number, ky: number) => {
  const pl = ctx.state.player;
  if (o.hit || o.grace > 0 || o.away || pl.health <= 0 || pl.invincibilityTimer > 0 || pl.inCutscene) return;
  const top = pl.pos.y + (pl.isDucking ? 24 : 0);
  if (pl.pos.x + pl.width - 6 > x && pl.pos.x + 6 < x + w && pl.pos.y + pl.height > y && top < y + h) { o.hit = true; hurtPlayer(ctx, dmg, src, { x: kx, y: ky }, 22); shakeScreen(ctx.state, 8, 4); }
};
const waves = (state: GameState, x: number, dmg: number, src: string) => {
  for (const d of [-1, 1]) shoot2(state, { kind: 'burp', x: x + d * 34, y: GY, vx: d * 6, vy: 0, src, dmg, life: 110, r: 16, floor: GY });
};
const puff = (state: GameState, x: number, y: number) => { for (let k = 0; k < 22; k++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 60, y: y + (Math.random() - 0.5) * 90 }, vel: { x: (Math.random() - 0.5) * 2.4, y: -0.6 - Math.random() * 1.4 }, life: 40, color: k % 2 ? '#5A5266' : '#3A3444', size: 5 + Math.random() * 5 }); };

const stepSon = (ctx: FrameContext, f: Fight2, o: Foe) => {
  const { state } = ctx, p = pmid(state), dx = p.x - o.x, k = mad(o);
  o.t++;
  switch (o.st) {
    case 'walk': {
      // (keeping his distance, a slouching drift; his turn and it's time: a move)
      const want = Math.abs(dx) > 300 ? Math.sign(dx) : Math.abs(dx) < 170 ? -Math.sign(dx) : 0;
      o.vx += (want * 1.3 - o.vx) * 0.08;
      o.face = dx < 0 ? -1 : 1;
      o.cd--;
      if (o.cd <= 0) tryMove(state, f, o);
      break;
    }
    // LEAP: the crouch, gone (the shadow following him, then set), down on it, the fire both ways (away: just off to
    // the far side, harmless)
    case 'crouch':
      if (o.t >= o.T) { setSt(o, 'gone', 28); o.aim = o.away ? farFrom(p.x) : p.x; puff(state, o.x, o.y - 70); playSound('poof', 0.8, -6); }
      break;
    case 'gone':
      if (o.t < o.T - 10 && !o.away) o.aim += Math.max(-3.2, Math.min(3.2, p.x - o.aim)) * 0.5;
      if (o.t >= o.T) { setSt(o, 'fall', 60); o.x = Math.max(ARENA_L, Math.min(ARENA_R, o.aim)); o.y = GY - 460; o.vy = 5; }
      break;
    case 'fall':
      o.vy += 1; o.y += o.vy;
      if (o.y >= GY - 60) hurtIf(ctx, o, o.x - 30, o.y - SON_H, 60, SON_H, DMG.crush, 'm2:wp2_sondrop', Math.sign(dx || 1) * 8, -7);
      if (o.y >= GY) { o.y = GY; o.vy = 0; playSound('slam', 1, -10); playSound('thud', 1, -12); shakeScreen(state, 14, 6); if (!o.away) waves(state, o.x, DMG.wave, 'm2:wp2_sonburp'); puff(state, o.x, GY - 30); setSt(o, 'open', opening(f, OPEN.land)); }
      break;
    // ROACHES: the lighter, then three in arcs
    case 'flick':
      if (o.t === Math.round(o.T * 0.5)) playSound('click', 0.7, 6);
      if (o.t >= o.T) { setSt(o, 'roaches', 30); }
      break;
    case 'roaches':
      if (o.t % 8 === 1 && o.shots < 3) {
        const [hx, hy] = sonHand('flick'), at = [p.x, p.x - 110 * o.face, p.x + 110 * o.face][o.shots++];
        lob(state, o.x + hx * o.face, o.y + hy, Math.max(GROTTO.door, Math.min(GROTTO.R, at)), GY, 38, 'm2:wp2_sonflick', DMG.roach);
        playSound('whoosh', 0.4, 8);
      }
      if (o.t >= o.T) setSt(o, 'open', opening(f, OPEN.roach));
      break;
    // RING: the drag (the smoke gathering at its height), the ring (two, past half: the other height second)
    case 'inhale':
      if (o.t >= o.T) setSt(o, 'blow', o.hp < o.max / 2 ? 54 : 24);
      break;
    case 'blow':
      if (o.t === 1 || (o.t === 34 && o.hp < o.max / 2)) {
        if (o.t === 34) o.high = !o.high;
        const [mx] = sonMouth('blow');
        shoot2(state, { kind: 'ring', x: o.x + mx * o.face, y: o.high ? GY - 58 : GY - 18, vx: o.face * 3.6, vy: 0, src: 'm2:wp2_sonring', dmg: DMG.ring, life: 260, r: RING_R });
        playSound('whoosh', 0.7, -10);
      }
      if (o.t >= o.T) setSt(o, 'open', opening(f, OPEN.ring));
      break;
    // PILLARS: pointing; the glow where he is and either side, then hellfire; looking up for his dad after
    case 'point':
      if (o.t >= o.T) {
        const at = [p.x, p.x - 150, p.x + 150, ...(o.hp < o.max / 2 ? [p.x + (Math.random() < 0.5 ? -75 : 75)] : [])];
        at.forEach((x, i) => shoot2(state, { kind: 'pillar', x: Math.max(GROTTO.door + 20, Math.min(GROTTO.R - 20, x)), y: GY, vx: 0, vy: 0, src: 'm2:wp2_sonpillar', dmg: DMG.pillar, life: 86 + i * 12, r: PILLAR_R, tell: Math.round(42 * k) + i * 12, floor: GY }));
        playSound('rumble', 0.8, -6); setSt(o, 'pose', opening(f, OPEN.pose + 40));
      }
      break;
    // BREATH: rearing back, the gurgle; the jet at waist height; the cough
    case 'rear':
      if (o.t >= o.T) { setSt(o, 'jet', JET.T); playSound('ignite', 1, -8); playSound('burp', 0.8, -14); }
      break;
    case 'jet': {
      const reach = JET.near + (JET.reach - JET.near) * Math.min(1, o.t / 8);
      const x0 = o.face > 0 ? o.x + JET.near : o.x - reach, w = reach - JET.near;
      if (o.t > 2) hurtIf(ctx, o, x0, JET.top, w, JET.bot - JET.top, DMG.breath, 'm2:wp2_sonbreath', o.face * 6, -4);
      if (o.t >= o.T) setSt(o, 'open', opening(f, OPEN.cough));
      break;
    }
    // TAIL: cocked up behind him, then whipped low out in front
    case 'cock':
      if (o.t >= o.T) { setSt(o, 'whip', 12); playSound('whoosh', 0.8, 2); }
      break;
    case 'whip': {
      const x0 = o.face > 0 ? o.x : o.x - TAIL_REACH;
      if (o.t > 2 && o.t < 9) hurtIf(ctx, o, x0, GY - 36, TAIL_REACH, 36, DMG.tail, 'm2:wp2_sontail', o.face * 7, -6);
      if (o.t >= o.T) setSt(o, 'open', opening(f, OPEN.tail));
      break;
    }
    case 'pose': case 'open':
      o.vx *= 0.8;
      if (o.t >= o.T) finishMove(f, o);
      break;
  }
  if (o.st === 'walk' || o.st === 'open' || o.st === 'pose') { o.x += o.vx; o.x = Math.max(ARENA_L, Math.min(ARENA_R, o.x)); }
};

const stepBro = (ctx: FrameContext, f: Fight2, o: Foe) => {
  const { state } = ctx, p = pmid(state), pl = state.player, dx = p.x - o.x;
  o.t++;
  switch (o.st) {
    case 'walk': {
      // (coming at him, stalking, showing off; two on one, round to the far side of him from his brother (the
      // crossfire), never shoving through him to get there)
      const son = f.son, flank = duo(f) ? (son.x < p.x ? 1 : -1) : 0, wrong = flank !== 0 && Math.sign(o.x - p.x) !== flank;
      let want = Math.abs(dx) > 200 ? Math.sign(dx) : Math.abs(dx) < 110 ? -Math.sign(dx) : 0;
      if (flank && !wrong) { const to = Math.max(ARENA_L, Math.min(ARENA_R, p.x + flank * 160)); want = Math.abs(to - o.x) > 30 ? Math.sign(to - o.x) : 0; }
      if (wrong && Math.abs(dx) < 130) want = 0;
      o.vx += (want * 1.8 - o.vx) * 0.1;
      o.face = dx < 0 ? -1 : 1;
      o.cd--;
      if (o.cd <= 0) tryMove(state, f, o);
      break;
    }
    // LEAP: the crouch (horns going red); up and over at him, his shadow where he'll land; crushed under, the shockwaves
    // (away: just off to the far side; the jump in: from the ambush, his grace on)
    case 'crouch':
      if (o.t >= o.T) { setSt(o, 'air', 46); o.aim = o.away ? farFrom(p.x) : Math.max(ARENA_L, Math.min(ARENA_R, p.x + pl.vel.x * 10)); o.vx = (o.aim - o.x) / 46; o.vy = -(0.6 * 46) / 2; playSound('jump', 0.9, -12); }
      break;
    case 'air':
      o.vy += 0.6; o.x += o.vx; o.y += o.vy;
      if (o.vy > 0) hurtIf(ctx, o, o.x - BRO_BOX / 2, o.y - 150, BRO_BOX, 150, DMG.broCrush, 'm2:wp2_brocrush', Math.sign(dx || 1) * 8, -7);
      if (o.y >= GY && o.vy > 0) {
        o.y = GY; o.vy = 0; o.vx = 0; playSound('slam', 1, -12); playSound('thud', 1, -14); shakeScreen(state, 16, 7);
        if (!o.away && o.grace <= 0) waves(state, o.x, DMG.broWave, 'm2:wp2_browave');
        for (let k = 0; k < 14; k++) state.particles.push({ pos: { x: o.x + (Math.random() - 0.5) * 90, y: GY - 6 }, vel: { x: (Math.random() - 0.5) * 7, y: -2 - Math.random() * 4 }, life: 30, color: k % 2 ? FIRE[2] : '#3A2A34', size: 3 + Math.random() * 4 });
        // (the jump in: a showy landing, the grace running down; his first move's lined up to land as it ends)
        if (o.grace > 0) { setSt(o, 'land', 40); o.cd = 0; } else setSt(o, 'land', opening(f, OPEN.broLand));
      }
      break;
    // SWEEP: the guitar dragged back, the floor flashing out in front; along the floor (jump it)
    case 'sweepWind':
      if (o.t >= o.T) { setSt(o, 'sweep', 10); playSound('whoosh', 1, -6); }
      break;
    case 'sweep': {
      const x0 = o.face > 0 ? o.x + 20 : o.x - SWEEP_REACH;
      if (o.t > 2 && o.t < 8) hurtIf(ctx, o, x0, GY - 40, SWEEP_REACH - 20, 40, DMG.sweep, 'm2:wp2_brosweep', o.face * 9, -6);
      if (o.t >= o.T) setSt(o, 'sweepRec', opening(f, OPEN.sweep));
      break;
    }
    // RUSH: pawing the floor (thud, thud, thud), the arrows; the length of the grotto; into the wall
    case 'rushWind':
      if (o.t % 18 === 6) { playSound('thud', 0.8, -10); shakeScreen(state, 3, 2); }
      if (o.t >= o.T) { setSt(o, 'rush', 200); playSound('roar', 0.6, -2); }
      break;
    case 'rush':
      o.x += o.rushDir * RUSH_SPEED;
      hurtIf(ctx, o, o.x - BRO_BOX / 2, GY - 100, BRO_BOX, 100, DMG.rush, 'm2:wp2_brorush', o.rushDir * 12, -8);
      if (o.x <= ARENA_L || o.x >= ARENA_R) { o.x = Math.max(ARENA_L, Math.min(ARENA_R, o.x)); setSt(o, 'crash', opening(f, OPEN.crash)); playSound('crash', 1, -8); shakeScreen(state, 14, 6); }
      break;
    case 'land': case 'sweepRec': case 'crash':
      o.vx = 0;
      if (o.t >= o.T) finishMove(f, o);
      break;
  }
  if (o.st === 'walk') { o.x += o.vx; o.x = Math.max(ARENA_L, Math.min(ARENA_R, o.x)); }
};

/** The far side of the room from x. */
const farFrom = (x: number) => (x > (ARENA_L + ARENA_R) / 2 ? ARENA_L + 70 : ARENA_R - 70);
/** His box (where he's hit and touches). */
export const foeBox = (o: Foe) => {
  const w = o.who === 'son' ? SON_W : 60, h = o.st === 'kneel' ? 80 : o.st === 'sit' ? 90 : o.who === 'son' ? (o.st === 'crouch' ? 100 : SON_H) : 160;
  return { x: o.x - w / 2, y: o.y - h, w, h };
};
const stepFoe = (ctx: FrameContext, f: Fight2, o: Foe) => {
  const { state } = ctx, pl = state.player;
  if (o.iframes > 0) o.iframes--;
  if (o.flash > 0) o.flash--;
  if (o.down) { o.st = 'kneel'; o.dz = null; if (state.enemies.includes(o.e)) state.enemies = state.enemies.filter(q => q !== o.e); return; }
  // (the ambush's tell: he's not in yet)
  if (o.st === 'lurk') return;
  if (o.grace > 0) o.grace--;
  if (cheapShotStunned(o.e)) {
    // (stunned off the cheap shot: planted, no attacks, taking hits; his move's off)
    o.dz = null;
    if (o.st !== 'stun') { setSt(o, 'stun', 9999); o.move = null; }
    o.vx = 0; o.y = GY;
  } else if (o.st === 'stun') { setSt(o, 'walk', 0); o.cd = 30; }
  else if (o.wince > 0) { o.wince--; o.vx *= 0.8; o.t++; if (o.wince === 0) setSt(o, 'walk', 0); }
  else if (o.who === 'son') stepSon(ctx, f, o); else stepBro(ctx, f, o);
  const gone = o.st === 'gone' || o.st === 'fall' && o.y < GY - 200;
  const b = foeBox(o);
  // (touching him: a shove; not mid-leap (those are their own))
  if (!gone && o.grace <= 0 && o.st !== 'air' && o.st !== 'fall' && pl.health > 0 && pl.invincibilityTimer <= 0 && !pl.inCutscene && pl.pos.x + pl.width > b.x + 8 && pl.pos.x < b.x + b.w - 8 && pl.pos.y + pl.height > b.y + 10 && pl.pos.y < b.y + b.h) {
    hurtPlayer(ctx, DMG.touch, o.who === 'son' ? 'm2:wp2_son' : 'm2:wp2_bro', { x: Math.sign(pl.pos.x - o.x || 1) * 7, y: -6 }, 20); shakeScreen(state, 5, 3);
  }
  const e = o.e;
  e.pos.x = b.x; e.pos.y = b.y; e.width = b.w; e.height = b.h; e.vel.x = 0; e.vel.y = 0; e.facing = o.face;
  if (gone && state.enemies.includes(e)) state.enemies = state.enemies.filter(q => q !== e);
  if (!gone && !state.enemies.includes(e)) state.enemies.push(e);
  takeHits(ctx, f, o, gone);
};

const takeHits = (ctx: FrameContext, f: Fight2, o: Foe, gone: boolean) => {
  const { state } = ctx, e = o.e;
  const dealt = Math.max(0, BIG - e.health);
  e.health = BIG; e.maxHealth = BIG;
  const melee = e.hitByMove !== o.moveSeen;
  o.moveSeen = e.hitByMove;
  // (not there to be hit: a hurl he's owed waits till he is; in his grace after the jump in, nothing lands on him)
  if (gone || o.grace > 0) return;
  const burst = takeSickBurst(e);
  if ((!burst && (dealt <= 0 || o.iframes > 0))) return;
  const dmg = burst || endgameDamage(state, e, melee, dealt);
  o.hp -= dmg; if (!burst) o.iframes = BOSS_IFRAMES; o.flash = 8;
  // (never down before his brother's in: the ambush is at half, between moves)
  if (o.who === 'son' && (!f.bro || f.bro.st === 'lurk')) o.hp = Math.max(1, o.hp);
  playSound('gunhit', 0.6, -2);
  ctx.fx.spawnDamageNumber({ x: o.x - 10, y: o.y - 160 }, Math.max(1, Math.round(dmg)), dmg > 40);
  for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: o.x, y: o.y - 90 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 22, color: '#7F1D1D', size: 2 + Math.random() * 3, grav: 0.3 });
  if (o.hp > 0 && Math.random() < 0.2) bark(state, o, crushLines(o.e, o.who === 'son' ? L.SON_HURT : DEMON_HURT));
  // (the same hit landing on him ~4 s running: up and away (the son in smoke, the brother in a leap), swatted off first:
  // alone, the leap's onto him; two on one, or with his brother's move on, just off to the far side, harmless)
  if (o.hp > 0 && !burst && spamTick(o.spam, state.frame, hitKey(state.player, melee)) && (o.st === 'walk' || o.st === 'open' || o.st === 'pose' || o.st.endsWith('Rec') || o.st === 'land' || o.st === 'crash')) {
    if (melee) swatOff(state, o.x);
    const m: Move = o.who === 'son' ? 'leap' : 'bleap';
    const d = { a: f.total + 8 + (o.who === 'son' ? 44 : 20), b: 0, ans: 'C' as Ans }; d.b = d.a + 70;
    const other = otherOf(f, o), od = other && !other.down && other.dz && other.dz.b > f.total ? other.dz : null;
    begin(state, f, o, m);
    o.T = 8;
    if (duo(f) || !fits(d, od)) o.away = true; else o.dz = d;
  }
  if (o.hp <= 0) {
    endCheapStun(o.e);
    o.hp = 0; o.down = true; o.st = 'kneel'; o.t = 0; o.vx = 0; o.y = GY; o.said = null; o.dz = null;
    state.enemies = state.enemies.filter(q => q !== e);
    playSound('thud', 1, -10); shakeScreen(state, 8, 4);
    // (the first one down says so; the second's down is the end: they're up and running (end.ts), no line held over it)
    const other = otherOf(f, o);
    if (other && !other.down) foeSays(o, pick(byPants(state, o.who === 'son' ? L.SON_KNEEL : L.BRO_KNEEL)));
  }
};

/** A frame of the grotto's fight. `onBothDown`: the end (end.ts takes it from here). */
export const updateFight2 = (ctx: FrameContext, f: Fight2, controls: Controls, onBothDown: () => void): Controls => {
  const { state } = ctx;
  if (f.mode === 'intro') return updateIntro(ctx, f);
  if (f.mode === 'end') return hands();
  f.total++;
  if (f.hole) { f.hole.t++; if (f.hole.t > 240) f.hole = null; }
  // (the mutters: his, his brother's showing off for their dad)
  const talker = live(f)[Math.floor(Math.random() * live(f).length)];
  if (talker && f.total > f.tauntAt && !f.son.said && !f.bro?.said) { f.tauntAt = f.total + 520 + Math.floor(Math.random() * 400); bark(state, talker, crushLines(talker.e, talker.who === 'son' ? L.SON_LAZY : duo(f) && Math.random() < 0.6 ? L.BRO_DUO : DEMON_CHATTER)); }
  if (!f.lowSaid && f.son.hp < SON_HP * 0.62 && !f.son.said) { f.lowSaid = true; bark(state, f.son, crushLines(f.son.e, L.SON_LOW)); }
  // (the cheap shot: each up for it on the floor, out in the open (not off in a leap, up in smoke, head down in the rush);
  // his brother only with his nuts still on him. While it's on with either, the whole fight's frozen; after, the other
  // one (if he's still in it) winces at it)
  let frozen = false;
  for (const o of [f.son, f.bro]) {
    if (!o || o.down) continue;
    // (nothing left on him to have: the cheap shot's not offered him at all)
    if (o.who === 'bro' && broNutless()) { o.frozen = false; continue; }
    if (o.st === 'lurk') continue;
    const ok = o.y >= GY - 0.5 && o.grace <= 0 && !['gone', 'fall', 'air', 'rush', 'crouch'].includes(o.st);
    const was = o.frozen;
    o.frozen = cheapShotGate(state, o.e, o.who === 'son' ? 'mehphisto' : 'brathazar', ok) === 'frozen';
    if (o.frozen) frozen = true;
    if (was && !o.frozen) wince(state, f, o);
  }
  // (Y + B on a brother with nothing left: grabbing at nothing, his line)
  TOO_BIG_BY_KIND[SON_KIND] = byPants(state, L.GRAB_SON);
  TOO_BIG_BY_KIND[BRO_KIND] = f.bro && broNutless() ? byPants(state, L.MH_NOTHING) : byPants(state, L.GRAB_SON);
  if (frozen) return controls;
  stepFoe(ctx, f, f.son);
  if (f.bro) stepFoe(ctx, f, f.bro);
  // (half way down, between moves (not mid-attack): the ambush (in play: the son carries on through it))
  if (!f.bro && !f.amb && !f.son.down && f.son.hp <= SON_HP / 2 && f.son.st === 'walk') startAmb(state, f);
  if (f.amb) stepAmb(state, f);
  if (f.son.down && (!f.bro || f.bro.down) && f.bro) { f.mode = 'end'; token++; clearFire(state); onBothDown(); return hands(); }
  return controls;
};
export { BEANBAG_X as BEANBAG };
/** One's nuts just went (`o`, the cheap shot's over): the other, if he's still in it, winces: a horrified line, a
 *  flinch (no attacking a moment; mid-attack, he carries on, the line only: the turns as they were). */
const wince = (state: GameState, f: Fight2, o: Foe) => {
  const other = o.who === 'son' ? f.bro : f.son;
  if (!other || other.down || cheapShotStunned(other.e)) return;
  other.said = null;
  foeSays(other, pick(byPants(state, other.who === 'son' ? L.SON_WINCE : L.BRO_WINCE)));
  if (other.st === 'walk') { setSt(other, 'wince', 0); other.wince = 40; other.vx = 0; other.face = o.x < other.x ? -1 : 1; }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const sonPose = (f: Fight2, o: Foe): SonPose => {
  if (f.mode === 'intro') return 'sit';
  if (o.down) return 'kneel';
  if (o.st === 'stun') return 'stun';
  if (o.st === 'wince') return 'hurt';
  if (o.flash > 4 && (o.st === 'walk' || o.st === 'open')) return 'hurt';
  switch (o.st) {
    case 'crouch': return 'crouch';
    case 'fall': return 'drop';
    case 'flick': case 'roaches': return 'flick';
    case 'inhale': return 'inhale';
    case 'blow': return 'blow';
    case 'point': return 'point';
    case 'pose': return 'try';
    case 'rear': return 'burp';
    case 'jet': return 'breath';
    case 'cock': case 'whip': return 'tail';
    case 'open': return o.move === 'breath' ? 'hurt' : o.move === 'leap' ? 'crouch' : 'idle';
    default: return o.said ? 'talk' : Math.abs(o.vx) > 0.4 ? 'walk' : 'idle';
  }
};
/** His brother's state, as his own fight (spooky/hell/demon.ts) draws it. */
const broSt = (o: Foe): PunkSt => {
  if (o.down) return 'beaten';
  switch (o.st) {
    case 'wince': return 'stagger';
    case 'crouch': return 'crouch';
    case 'air': case 'fall': return 'air';
    case 'land': return 'land';
    case 'sweepWind': return 'sweepWind';
    case 'sweep': return 'sweep';
    case 'sweepRec': return 'sweepRec';
    case 'rushWind': return 'rushWind';
    case 'rush': return 'rush';
    case 'crash': return 'crash';
    default: return 'walk';
  }
};

/** World space: the tells on the floor, the two of them, the jet, the tail, their words. */
export const drawFight2 = (c: Ctx, state: GameState, f: Fight2) => {
  const fr = state.frame;
  // (where he broke in: a ragged black hole in the ceiling or the wall, its rim lit, fading out after a while)
  if (f.hole) {
    const h = f.hole, k = h.t > 180 ? 1 - (h.t - 180) / 60 : 1;
    c.globalAlpha = k;
    if (h.wall) {
      const x = h.x > (ARENA_L + ARENA_R) / 2 ? GROTTO.R - 46 : GROTTO.L + 6;
      for (let i = 0; i < 7; i++) { const w = 30 + ((i * 37) % 13), y = h.y - 60 + i * 18; box(c, x + ((i * 11) % 9) - 4, y, w + 8, 18, '#5A3A44'); box(c, x + ((i * 11) % 9), y + 2, w, 16, '#050208'); }
    } else {
      for (let i = 0; i < 6; i++) { const w = 96 - Math.abs(i - 2) * 22, y = h.y + i * 6; box(c, h.x - w / 2 - 4, y, w + 8, 6, '#5A3A44'); box(c, h.x - w / 2, y, w, 6 - (i === 5 ? 2 : 0), '#050208'); }
    }
    c.globalAlpha = 1;
  }
  for (const o of [f.son, f.bro]) {
    if (!o || o.st === 'lurk') continue;
    // ---- the tells on the floor
    if (o.st === 'gone' || (o.st === 'fall' && o.y < GY - 40) || (o.who === 'bro' && o.st === 'air')) {
      const k = o.who === 'bro' ? Math.max(0.2, 1 - (GY - o.y) / 400) : o.st === 'gone' ? Math.min(1, o.t / o.T) : 1, x = o.who === 'bro' ? o.aim : o.st === 'gone' ? o.aim : o.x;
      c.globalAlpha = 0.3 + 0.4 * k; c.fillStyle = '#050208'; c.beginPath(); c.ellipse(x, GY - 2, 20 + 18 * k, 5, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
      if (k > 0.6) { c.fillStyle = fr % 6 < 3 ? '#F97316' : '#7F1D1D'; c.fillRect(Math.round(x - 30), GY - 2, 60, 2); }
    }
    if (o.st === 'sweepWind') { const x0 = o.face > 0 ? o.x + 20 : o.x - SWEEP_REACH, on = Math.floor(o.t / 6) % 2 === 0; box(c, x0, GY - 4, SWEEP_REACH - 20, 4, on ? '#FDE047' : '#B45309'); }
    if (o.st === 'rushWind') { const end = o.rushDir > 0 ? ARENA_R : ARENA_L; for (let x = o.x + o.rushDir * 70, i = 1; o.rushDir > 0 ? x < end : x > end; x += o.rushDir * 70, i++) { const lit = (Math.floor(o.t / 4) - i) % 4 === 0; c.fillStyle = lit ? '#FDE047' : 'rgba(239, 68, 68, 0.55)'; c.beginPath(); c.moveTo(x - o.rushDir * 10, GY - 10); c.lineTo(x + o.rushDir * 6, GY - 5); c.lineTo(x - o.rushDir * 10, GY); c.fill(); } }
    if (o.st === 'inhale') {
      // (the ring's tell: the smoke gathering in front of him at the height it'll come at)
      const k = Math.min(1, o.t / o.T), y = o.high ? GY - 58 : GY - 18, x = o.x + o.face * 40;
      c.globalAlpha = 0.25 + 0.5 * k; c.fillStyle = '#6A6078'; c.beginPath(); c.ellipse(x, y, 8 + 10 * k, 6 + 8 * k, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    }
    if (o.st === 'cock') { const x0 = o.face > 0 ? o.x : o.x - TAIL_REACH, on = Math.floor(o.t / 5) % 2 === 0; box(c, x0, GY - 3, TAIL_REACH, 3, on ? '#F0ABFC' : '#7E22CE'); }
    if (o.st === 'gone') continue;
    // ---- him
    // (the grace after the jump in: a hard flicker, the whole time, so it reads as "not yet")
    const alpha = o.grace > 0 ? (Math.floor(o.grace / 3) % 2 ? 0.35 : 1) : o.iframes > 0 && Math.floor(o.iframes / 4) % 2 === 0 ? 0.7 : 1;
    if (o.who === 'son') {
      const pose = sonPose(f, o), q = pose === 'walk' ? Math.floor(fr / 7) % 8 : pose === 'idle' || pose === 'talk' ? Math.floor(fr / 12) % 8 : 0;
      const sx = f.mode === 'intro' ? BEANBAG_X : o.x;
      drawSon(c, sx, o.y - (pose === 'sit' ? 14 : 0), f.mode === 'intro' ? -1 : o.face, { pose, q, mouth: !!o.said }, fr, o.st === 'point' || o.st === 'pose' || o.st === 'rear' ? 0.9 : 0, alpha);
      // (the jet: bands of fire straight out at his waist, white at the core)
      if (o.st === 'jet') {
        const reach = JET.near + (JET.reach - JET.near) * Math.min(1, o.t / 8), dying = o.t > JET.T - 8 ? (JET.T - o.t) / 8 : 1, mid = (JET.top + JET.bot) / 2;
        for (const [hh, col] of [[22, FIRE[1]], [16, FIRE[2]], [10, FIRE[3]], [4, FIRE[5]]] as [number, string][]) for (let s = 0; s < reach - JET.near; s += 8) {
          const kk = s / Math.max(1, reach - JET.near), hw = Math.round(hh * (0.5 + 0.6 * kk) * dying + Math.sin(fr * 0.8 + s * 0.2) * 2);
          box(c, o.x + o.face * (JET.near + s) - (o.face < 0 ? 8 : 0), mid - hw, 8, hw * 2, col);
        }
      }
      // (the tail's whip: a lash along the floor)
      if (o.st === 'whip' && o.t < 10) { c.strokeStyle = '#7A2A3C'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(o.x - o.face * 20, GY - 30); c.quadraticCurveTo(o.x + o.face * 80, GY - 4 - o.t, o.x + o.face * TAIL_REACH, GY - 10); c.stroke(); c.lineCap = 'butt'; }
      if (o.said) saidOver(c, o.said, sx, o.y - SON_H - 34, '#D8B4FE', 280);
    } else {
      c.save(); c.translate(Math.round(o.x), Math.round(o.y)); c.scale(o.face, 1);
      if (alpha < 1) c.globalAlpha = alpha;
      drawPunkAs(c, { st: broSt(o), t: o.t, e: cheapShotStunned(o.e) ? o.e : null, vx: o.vx, facing: 1, flash: o.flash, said: o.said ? { text: o.said } : null, jumpTo: o.aim, rushDir: 1, x: o.x, y: o.y }, fr);
      c.restore();
      if (o.said) saidOver(c, o.said, o.x, o.y - 200, '#FDBA74', 280);
    }
  }
};

/** Screen space: their bars in the top band; the intro's letterbox, the gross-up, SKIP. */
export const drawFight2Hud = (c: Ctx, state: GameState, f: Fight2, band: { x1: number; x2: number; mid: number }) => {
  if (f.mode === 'intro') {
    if (f.intro === 'retry') return;
    if (f.intro === 'gross') { drawSonGrossBack(c, CANVAS_WIDTH, CANVAS_HEIGHT); drawSonGross(c, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 6, 0.9 + 0.1 * Math.min(1, f.introT / 10), state.frame, f.introT % 40 < 18, f.introT < 16 ? 2 : 0); }
    const k = Math.min(1, f.skipT / 20), bar = Math.round(k * 44);
    c.fillStyle = '#000'; c.fillRect(0, 0, CANVAS_WIDTH, bar); c.fillRect(0, CANVAS_HEIGHT - bar, CANVAS_WIDTH, bar);
    if (f.skipT > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
    return;
  }
  if (f.mode !== 'on' || state.player.inCutscene) return;
  const w = band.x2 - band.x1;
  const bar = (o: Foe, y: number, h: number, col: string, name: string) => {
    const k = Math.max(0, o.hp / o.max);
    box(c, band.x1, y, w, h, '#18181B'); box(c, band.x1 + 2, y + 2, (w - 4) * k, h - 4, o.iframes > 0 && Math.floor(o.iframes / 4) % 2 ? '#FFFFFF' : o.down ? '#52525B' : col);
    for (let i = 1; i < 10; i++) box(c, Math.round(band.x1 + 2 + ((w - 4) * i) / 10), y + 2, 1, h - 4, '#18181B');
    label(c, name, band.mid, y + h + 12, col, 7);
  };
  bar(f.son, 22, 14, '#A855F7', L.SON_NAME);
  if (f.bro && f.bro.st !== 'lurk') bar(f.bro, 62, 10, '#F97316', 'BRATHAZAR');
};
export const doorState2 = (f: Fight2 | null) => (f ? f.door : 0);
