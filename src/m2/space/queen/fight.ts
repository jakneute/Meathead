// THE QUEEN (LEGALLY DISTINCT), in the space disco (GALACTIC GROOVE): the cutscene and the fight (the user's design).
//
//   THE CUTSCENE  (HUD hidden; skip all-or-nothing) he's in (the door kicked in). The lights come up; his say about the
//                 place. Down she drops out of the ceiling, silent (a screech). He grabs the fire extinguisher off the
//                 wall (his say), hoses her down: foam all over her. Nothing: she shakes it off. His say; so he throws
//                 the thing at her head. BONK. Her first words, out of her speaker: NOW ENTERING LESS FATAL MODE. His say
//                 back. Up in the DJ booth, the real ones explain (their study of humans: the mating ritual happens at
//                 the disco; this is a disco; so she breeds): ACTIVATE IMPREGNATOR RAY! The beam into her. His say. On.
//                 The hall's extra wide (the camera follows him in it); held on him, the booth and her for this.
//   HER SIDE      she never stays put long (the user's: "it shouldn't stand at the same place for very long"): a few
//                 seconds or two goes at him (a litter, a flail) in one spot at most, then she's off: a skitter across
//                 the floor (a hiss and a rear back, the tell), a hop clean over him to his other side (a crouch and a
//                 screech), or now and then the big leap to the far end of the hall. First thing, she leaps.
//   BIRTHS        every so often she turns her back on him (the tell: round she goes, a push, a grunt) and out of her
//                 rear it comes: a sac, splat on the floor, and out of that one of her offspring (kin.ts: a BITER, a
//                 SPITTER or a CHARGER). So many at once, at most.
//   THE LEAP      every so often (and straight after she's had her head bonked) she crouches (the tell: down, a
//                 screech), leaps across the hall to the other side in a big arc, and all along it barfs "acid" (motor
//                 oil) down on the floor: it burns, and it leaves slicks (Meathead 1's oil: he slides on them). She
//                 lands in a pool of it, hot, glowing: keep out. Now and then a sac or two of her young drops out of
//                 her mid-leap (over the screen), or pops out of her where a hop lands (inside her cap).
//   THE BOOTH     from half way down her, the operators chip in: a spotlight dropped on him out of the rig (its spot
//                 marked red on the floor and a whistle first). Lower she gets, the more of hers at once, the quicker
//                 they come, the more she leaps.
//   THE FLAIL     him in close too long (her reach, about a second and a half): a twitch and a spark (the tell), then all
//                 four arms going at once, a wide heavy hit that knocks him back. Backing off resets it.
//   HURTING HER   a main boss's rules: 666, the 60-frame breather after each hit; the ray gun and his moves Meathead 1's
//                 way (a shot 25; charge and slide 35; uppercut and dive kick 50); any other special weapon 35%. Her
//                 weakness is the MALLET (in full). And:
//                   - one of her own (or anybody) thrown into her: it's destroyed, and she's hurt;
//                   - one of her own BATTED back into her with the mallet: the big one (not a finisher: eight-odd of them
//                     and the chip in between), she's stunned a moment, and every one of her offspring in the hall is
//                     destroyed with it;
//                   - her head bonked with the mallet, straight on (him up level with it): stunned, a modest chunk, and
//                     once she's over it she's off to the other side;
//                   - the mallet's plain swings: a modest knock, the breather after each like anything else.
//                 No instant kills.
//   HER DEATH     (anything but the mallet; endo.ts) her motor oil boils over and, NOW, it burns: her latex chars and
//                 peels off her in burning flakes, and under it a steel endoskeleton, eyes lit; LESS FATAL MODE...
//                 DISABLED; it screams, lunges at him one last time, trips over its own feet and breaks apart on the
//                 floor, one heap. His say. (A cutscene: no input, no HUD, skip all-or-nothing.) The mallet's: in slow
//                 motion, pushed in on her, she comes apart at every seam at once (split.ts), then bursts, and the
//                 camera pulls back to the whole hall to see her pieces land everywhere. Either way her offspring drop dead where they stand. Then the operators, Saturday-
//                 morning villains: fists shaking at him through the glass, stomping, CURSES, WE'LL SEE YOU AGAIN,
//                 MEATHEAD!, and out the booth's back door in a cloud of dust. His say. Over. (After: the booth empty.)
//
// A retry (killed in it, back at the checkpoint inside the door): no cutscene; she's in the hall, on, and it's on.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind } from '../../../m1/types';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { say, silenceAll, pickLine, announce, isTalking } from '../../../m1/game/platform/speech';
import { GRAB_CALLOUTS } from '../../moves/callouts';
import { SKIP_AFTER, offerSkip, takeSkip } from '../../../m1/game/platform/skip';
import { bossIntroSeen, markBossIntroSeen } from '../../bossIntro';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { registerDeathKind } from '../../../m1/game/player/deathAnim';
import { ENEMY_HIT_COOLDOWN, BULLET_DAMAGE, BOSS_CHARGE_DAMAGE, BOSS_UPPERCUT_DAMAGE, CANVAS_WIDTH, CANVAS_HEIGHT, HUD_CLEAR_Y } from '../../../m1/constants';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { takeBites } from '../../weapons/spawner';
import { takeMalletHit, malletReadBy, type MalletHow } from '../../weapons/mallet';
import { type Piece, type Splat, burstQueen, chipQueen, burstSpray, tickPieces, headPiece, drawPieces, drawSplats } from './burst';
import { setHazardZones } from '../../hazardHit';
import { ink, limb } from '../../../m1/game/render/npc/kit';
import { ALIEN } from '../../../m1/game/scenes/alienLook';
import { hands, speak, meatheadSays, saidOver, box, label, voice } from '../section';
import { GY } from '../geometry';
import { DISCO_L as ARENA_L, DISCO_R as ARENA_R, DISCO_SIDES, DJ as BOOTH, EXTINGUISHER_X } from './geo';
import type { BoothOps } from './lowerArt';
import type { Light } from '../../../m1/game/render/lighting';
import { drawQueen, queenHead, type QueenPose } from './art';
import { REACH_T, REACH_GRAB, WIND_T, THROW_FROM, SPRAY_AIM, sprayNozzle, shakeNozzle } from '../../../m1/game/render/player/extinguisher';
import { onMeteorBlast } from '../../weapons/spellbook';
import { BITER, SPITTER, CHARGER, KIN, isKin, kinAge, spawnKin, destroyKin, tickKin, drawKinShots, drawSac, resetKin } from './kin';
import * as L from './lines';
import { setDropTable } from '../../../m1/game/core/effects';
import { since } from '../../frames';
import { drawQueenGross, drawQueenGrossBack } from './queenGross';
import { type Sud, addSud, tickSuds, drawSuds } from './foam';
import { type Endo, makeEndo, tickEndo, settleEndo, drawEndo, endoLights } from './endo';
import { BURST_AT, PUNCH, tickSplit, drawSplit, splitLights } from './split';
import { setStampHold } from '../../../m1/game/render/stamp';
import { type Box, around, boxOf, join } from '../../deathFrame';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;
const dressed = (state: GameState): L.Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

// ---------------------------------------------------------------------------------------------------------------
// The numbers (tune here)

/** Her health (a main boss's); the enemy's (never runs out: the hits are taken off ours). */
const HP = 666, BIG = 100000;
/** Any special weapon that isn't her weakness (the mallet): this share gets through; after each hit, the breather. */
const SHARE = 0.35, IFRAMES = ENEMY_HIT_COOLDOWN;
/** Her two sides (where she stands: her feet's middle). */
const SIDE_X = { [-1]: DISCO_SIDES.l, [1]: DISCO_SIDES.r } as Record<-1 | 1, number>;
/** Where she drops in for the cutscene (on screen with him, the extinguisher and the booth); the camera then. */
const INTRO_X = ARENA_L + 780, INTRO_CAM = ARENA_L + 80;
/** Births: how often (by phase), at most this many of hers about at once (a whole litter has to fit); the tell (turning
 *  round), the push; one sac after another out of her, this far apart (frames). */
const BIRTH_EVERY = [0, 240, 170, 120], KIN_CAP = [0, 3, 5, 5], TURN_T = 26, PUSH_T = 34, SAC_GAP = 9;
/** How many to a litter: one at the start, rising with what she's lost, to three (the user's: five got too hectic). */
const LITTER_MIN = 1, LITTER_MAX = 3;
const litterOf = (f: Fight) => Math.max(LITTER_MIN, Math.min(LITTER_MAX, LITTER_MIN + Math.floor((1 - f.hp / HP) * (LITTER_MAX - LITTER_MIN + 1))));
/** Which kind comes out (by phase): the chances of a biter, a spitter (the rest chargers). */
const KIN_ODDS = [[0, 0, 0], [0.55, 0.3], [0.4, 0.35], [0.35, 0.35]];
/** The leap: how often (by phase); the crouch (the tell), the air, the landing; how high; the oil it barfs. */
const LEAP_EVERY = [0, 420, 360, 300], CROUCH_T = 34, AIR_T = 84, LAND_T = 22, LEAP_UP = 330, OIL_DMG = 12;
/** On the move: the longest she stands in one spot (frames, by phase); the soonest she might go on her own; how many
 *  goes at him (litters, flails) in one spot before she's off. Where she can be (her two far sides the ends of it). */
const STAY_MAX = [0, 200, 170, 140], STAY_MIN = 70, STAY_ACTS = 2, X_MIN = DISCO_SIDES.l, X_MAX = DISCO_SIDES.r;
/** The skitter: the tell (a hiss, reared back), how fast across the floor (px/frame), how far (at least, at most), kept
 *  this far off him (she never runs through him). */
const SKIT_TELL = 16, SKIT_SPEED = 12, SKIT_MIN = 200, SKIT_MAX = 620, SKIT_KEEP = 150;
/** The hop over him: the crouch (the tell), the air, how high, how far past him she comes down; only if he's this near. */
const HOP_CROUCH = 24, HOP_AIR = 46, HOP_UP = 210, HOP_PAST = 260, HOP_NEAR = 560;
/** The flail: in this close this long and it's coming; the tell; the hit (how wide, how hard, how far he goes). */
const FLAIL_REACH = 190, FLAIL_LINGER = 90, FLAIL_TELL = 20, FLAIL_T = 26, FLAIL_WIDE = 230, FLAIL_DMG = 28;
/** Thrown into her: what it does; batted back with the mallet: what that does, and how long she's stunned. */
/** (a throw into her is crowd control, a chip: only her own batted back with the mallet really hurts her) */
// (anything flung into her, thrown or batted, big or small, is the one fairly heavy hit, once per contact however many
// arrive together (the user's: it was compounding); a batted kid still stuns her and clears the brood)
const FLUNG_DMG = 40, FLUNG_GAP = 45, BATTED_STUN = 90;
/** One of hers batted back into her with the mallet (the rebound): a bit more than a throw (the user's: the hammer a bit harder). */
const BATTED_DMG = 56; // (a bit more again, the user's: was 48)
/** Her head bonked with the mallet: the extra, the stun. */
const HEAD_EXTRA = 10, HEAD_STUN = 70;
/** The mallet's plain swing on her: a modest knock (the breather after it, like anything). */
const MALLET_HIT = 64; // (a bit more again, the user's: was 54)
/** The held smash (Y held, the windup): twice and more a swing, and never swallowed by the breather after one. */
const MALLET_SMASH = 132; // (a bit more again, the user's: was 112)
/** Any straight mallet hit with him this close to her body (px, any height): stunned this long, and across she goes
 *  after it; not again within CLOSE_GAP frames of the last (nor while she's stunned or leaping). */
const CLOSE_R = 150, CLOSE_STUN = 60, SMASH_STUN = 90, CLOSE_GAP = 180;
/** The booth's spotlight: how often (by phase; 0 none), the tell (its spot on the floor), the fall, how wide, how hard. */
const DROP_EVERY = [0, 0, 620, 420], DROP_TELL = 54, DROP_FALL = 14, DROP_R = 36, DROP_DMG = 16;
/** The oil slicks: how long one lasts (frames). */
const SLICK_LIFE = 1100;
/** The barf on a leap: in gushes, onto spaced spots along the floor between her two sides (marked from her crouch on),
 *  safe gaps between: how many (by phase), how wide each, the drops in each, kept this far in from her two sides. */
const BARF_N = [0, 3, 4, 4], BARF_W = 110, BARF_DROPS = 7, BARF_IN = 130;
/** Her young on the move: the odds a leap (or a hop) brings some; how many at most (and never past her cap, KIN_CAP);
 *  not on the very first leap of a go. */
const BROOD_ODDS = 0.35, BROOD_MAX = 2, BROOD_AFTER = 240;
/** The drips off her all the time (frames between), the puddles she leaves stood about (how often, how long they last). */
const DRIP_EVERY = 2, SPOT_EVERY = 50, SPOT_LIFE = 700;
/** How often she says something at him (frames). */
const TAUNT_EVERY = 900;

/** Touching her: her body's box (narrower than she's drawn: the legs and torso), and what it does. */
const TOUCH_W = 70, TOUCH_H = 210, TOUCH_DMG = 18;
const OIL = 'm2:sp_queen_oil', FLAIL = 'm2:sp_queen_flail', POOL = 'm2:sp_queen_pool', CAN = 'm2:sp_queen_can';
registerHurtLines(OIL, L.HURT_OIL, L.DEATH_OIL);
registerHurtLines(CAN, L.HURT_CAN, L.DEATH_CAN);
registerDeathKind(CAN, 'flattened');
registerDeathKind(OIL, 'burnt');
registerDeathKind(POOL, 'boiled');
/** The flail's and the pool's lines go by the state of him: set each frame (registerHurtLines just files them). */
const fileLines = (state: GameState) => {
  const d = dressed(state);
  registerHurtLines(FLAIL, [...L.HURT_FLAIL[d]], [...L.DEATH_FLAIL[d]]);
  registerHurtLines(POOL, [...L.HURT_POOL[d]], [...L.DEATH_POOL[d]]);
};
/** The pool of hot oil she lands in after a leap: how wide; what it does to him. Up till her next birth. */
const POOL_R = 190, POOL_DMG = 22;


// ---------------------------------------------------------------------------------------------------------------
// The state

type Step = 'lights' | 'drop' | 'grab' | 'spray' | 'shake' | 'throw' | 'bonk' | 'mode' | 'study' | 'ray' | 'beam' | 'react';
export type Mode = 'wait' | 'intro' | 'idle' | 'birth' | 'leap' | 'skitter' | 'flail' | 'stun' | 'dead';
interface Drop { x: number; y: number; vx: number; vy: number; tx: number }
interface Sac { x: number; y: number; vx: number; vy: number; t: number; kind: string; landed: number }
interface Slick { x1: number; x2: number; t: number }
/** A spot the barf's coming down on: its middle; its gush let go; drops still in the air for it; landed. */
interface Barf { x: number; let: boolean; due: number; landed: number }
/** A puddle she's leaked, stood about (looks only). */
interface Spot { x: number; r: number; t: number }

export interface Fight {
  mode: Mode; t: number; total: number;
  hp: number; iframes: number; flash: number; moveSeen: number | undefined;
  /** Her side (-1 left, 1 right), where she is (x), how far up she is (the leap), which way she faces. */
  side: -1 | 1; x: number; y: number; facing: 1 | -1;
  ext: number; ph: string | null;
  step: Step; stepT: number; skipT: number; token: number;
  glass: boolean; booth: number; beam: number; alive: number;
  lights: number; down: number; foam: number;
  /** The extinguisher's foam loose in the air (the clouds, the globs at her, what she shakes off, the popped specks). */
  suds: Sud[];
  ext2: 'wall' | 'held' | 'air' | 'gone'; ex: { x: number; y: number; vx: number; vy: number; r: number };
  said: string | null; boothSaid: string | null;
  birthT: number; leapT: number; linger: number; forceLeap: boolean; stunT: number;
  /** When a close mallet hit last stunned her (f.total). */
  closeAt: number;
  /** The mallet's marks on her: dents (one a hit); what's come off her (chips in the fight, all of her at a weakness
   *  death) and the splashes under it; when her speaker last glitched. */
  dents: number; pieces: Piece[]; splats: Splat[]; glitchAt: number;
  /** Real ticks of hit-stop left (a mallet hit: the world held a beat). */
  stopT: number;
  /** Her bar's chunk just knocked off (from this hp, fading over barT frames). */
  barFrom: number; barT: number;
  /** Her weakness death: burst into pieces; its slow motion (real ticks, game time banked); its white flash (real
   *  ticks); her last words said (from her head, wherever it lands). */
  blown: boolean; slow: { t: number; acc: number } | null; whiteT: number; lastWords: boolean;
  /** Her weakness death: real ticks since the killing blow (the camera's push-in on her splitting, then the pull-back
   *  from the burst on), and the real tick she burst at (-1: not yet). */
  blowT: number; burstRT: number;
  /** The pool round her (after a leap; gone with her next birth): where, how far up it is (0..1), going. */
  pool: { x: number; k: number; going: boolean } | null;
  drops: Drop[]; sacs: Sac[]; slicks: Slick[]; barf: Barf[]; spots: Spot[];
  /** The rest of this litter still to come out of her (their kinds). */
  litter: string[];
  /** Meathead's said his say about the oil not burning (once a life). */
  cheapSaid: boolean;
  /** Frames into getting the extinguisher off the wall (the hop up for it). */
  grabT: number;
  tauntT: number; saidBirth: number;
  /** What she and the booth have said this life: never the same thing twice in one (out of new ones, they keep quiet). */
  barked: Set<string>;
  /** When one of hers (or anybody) last went into her, thrown or batted; when he last hinted at it. */
  throwAt: number; throwHintAt: number;
  /** When the last thing flung into her hurt her (one hit per contact, however many arrive together). */
  flungAt: number;
  /** A throw or a bat landed on her lately (the engine's own share of the same hit isn't counted on top). */
  eventAt: number;
  /** The operators in the booth: at it; losing it after her; running out the back; gone. */
  ops: BoothOps;
  /** The booth's spotlight: its spot (x), how far through (the tell, then falling); when the next. */
  can: { x: number; t: number } | null; canT: number;
  /** Where she leapt (or skittered) from; where to; the leap just a hop over him (no barf, no pool); the skitter's
   *  run (frames); her stride (the skitter's legs). */
  leapFrom: number; dest: number; hop: boolean; runT: number; stride: number;
  /** Frames stood in this one spot; goes at him (litters, flails) made from it. */
  stay: number; acts: number;
  deathT: number; deathSaid: number; byWeakness: boolean;
  /** Her plain death: the burn, the skeleton, the lunge, the heap (endo.ts); null till then (and for the mallet's). */
  endo: Endo | null;
  /** Sacs still to drop out of her on this leap (or out where this hop lands). */
  brood: number;
  /** When it went on (f.total): her young don't come on the move till a while into it. */
  onAt: number;
  e: Enemy | null;
  /** A retry's entrance beat (frames left): she rears and screeches, a greeting, nothing at him (the user's). */
  entrance: number;
}
export const makeFight = (state: GameState): Fight => {
  const seen = bossIntroSeen(state, 'queen');
  return {
    mode: 'wait', t: 0, total: 0, hp: HP, iframes: 0, flash: 0, moveSeen: undefined,
    side: 1, x: seen ? SIDE_X[1] : INTRO_X, y: 0, facing: -1, ext: 0, ph: null,
    step: 'lights', stepT: 0, skipT: 0, token: 0,
    glass: !seen, booth: 1, beam: 0, alive: 1,
    lights: seen ? 1 : 0, down: seen ? 1 : 0, foam: 0, suds: [], ext2: seen ? 'gone' : 'wall', ex: { x: EXTINGUISHER_X, y: GY - 90, vx: 0, vy: 0, r: 0 },
    said: null, boothSaid: null,
    birthT: 120, leapT: 0, linger: 0, forceLeap: false, stunT: 0, closeAt: -9999, pool: null,
    dents: 0, pieces: [], splats: [], glitchAt: -9999, stopT: 0, barFrom: HP, barT: 0, blown: false, slow: null, whiteT: 99, lastWords: false, blowT: 0, burstRT: -1,
    drops: [], sacs: [], slicks: [], barf: [], spots: [], litter: [], cheapSaid: false, grabT: 0, tauntT: 0, saidBirth: -9999, barked: new Set(), throwAt: -1, throwHintAt: -9999, flungAt: -9999, eventAt: -99,
    ops: { mode: 'on', t: 0 }, can: null, canT: 0, leapFrom: SIDE_X[1], dest: SIDE_X[1], hop: false, runT: 0, stride: 0, stay: 0, acts: 0, deathT: 0, deathSaid: 0, byWeakness: false, endo: null, brood: 0, onAt: 0, e: null, entrance: 0,
  };
};

// ---------------------------------------------------------------------------------------------------------------
// Her, the enemy (the engine's: for the hits. She's drawn here, not by it)

const QUEEN_KIND = 'm2:sp_queen' as const;
/** The disco's cutscene's lights (0..1), for the hall's own drawing and lighting. */
export const discoLights = (f: Fight) => (f.can && f.can.t < DROP_TELL && f.can.t % 8 < 4 ? f.lights * 0.4 : f.lights);
/** The booth's two, for the hall's drawing. */
export const boothOps = (f: Fight) => f.ops;
/** The camera held for the cutscene (null: following him). */
export const introCamX = (f: Fight) => (f.mode === 'intro' ? INTRO_CAM : null);
registerM2Kind({
  kind: QUEEN_KIND,
  stats: { w: 110, h: 240, hp: BIG, contact: 0, mass: 900, air: true },
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y, harmless: true }),
  gender: 'f', grab: 'none', midBoss: true, robot: true,
  head: { x: 40, y: -250, r: 24 },
  draw: () => {},
  ai: () => true,
  // (grabbed at: way too big. The hands close on her shin and he bounces off it)
  onGrab: ctx => {
    const { state } = ctx, p = state.player, e = live?.e;
    const dir = !e || p.pos.x + p.width / 2 < e.pos.x + e.width / 2 ? -1 : 1;
    p.vel = { x: dir * 6, y: Math.min(p.vel.y, -3) };
    p.lockTimer = Math.max(p.lockTimer, 14); p.recoiling = true;
    playSound('clang', 0.7, -6); playSound('thud', 0.6, -4); shakeScreen(state, 5, 3);
    if (since(state.frame, grabSaidAt) >= 150) { grabSaidAt = state.frame; meatheadSays(state, pick(L.MH_GRAB), false); }
    return { said: true, free: true };
  },
});
// (her fight shows the real damage of a mallet hit on her: not the mallet's own number as well; and she has her
// breather after a hit, so the tornado lands once on her, a swing's hit, and bounces him back)
malletReadBy(QUEEN_KIND, { breather: true });
/** When he last said his piece about grabbing her. */
let grabSaidAt = -9999;

// ---------------------------------------------------------------------------------------------------------------
// Saying things (one voice at a time: a bark's dropped if anybody's talking)

const tokened = (f: Fight, fn: () => void) => { const tok = f.token; return () => { if (tok === f.token) fn(); }; };
const queenSays = (state: GameState, f: Fight, lines: L.ByPants, onDone?: () => void) => {
  const tok = f.token;
  speak('m2.space.queen', pick(lines[dressed(state)]), s => { if (tok === f.token) f.said = s?.text ?? null; }, true, () => { if (tok === f.token) onDone?.(); });
};
const quiet = (f: Fight) => !f.said && !f.boothSaid;
/** The booth says one of these, and then (its line done) whatever's next. */
const boothSays = (state: GameState, f: Fight, lines: L.ByPants, onDone?: () => void) => {
  const tok = f.token;
  speak('m2.space.alien', pick(lines[dressed(state)]), x => { if (tok === f.token) f.boothSaid = x?.text ?? null; }, true, () => { if (tok === f.token) onDone?.(); });
};
const bark = (state: GameState, f: Fight, lines: L.ByPants, who: 'queen' | 'booth' = 'queen') => {
  if (!quiet(f)) return;
  const left = lines[dressed(state)].filter(t => !f.barked.has(t));
  if (!left.length) return;
  const text = pick(left);
  f.barked.add(text);
  const set = (v: string | null) => { if (who === 'queen') f.said = v; else f.boothSaid = v; };
  const get = () => (who === 'queen' ? f.said : f.boothSaid);
  say(text, voice(who === 'queen' ? 'm2.space.queen' : 'm2.space.alien'), 'casual', {
    always: true,
    onShow: spoken => { set(text); if (!spoken) setTimeout(() => { if (get() === text) set(null); }, Math.max(1600, text.length * 65)); },
    onHide: () => { if (get() === text) set(null); },
  });
};

// ---------------------------------------------------------------------------------------------------------------
// Starting: the cutscene (or, on a retry, straight in)

/** Her kids' drops, in the fight: small health only (nothing else drops here), a bit more often than out in the park
 *  (Meathead 2's usual: 6% small health, 5% small ammo: App.tsx). */
const KID_DROPS = { health: 0.12, ammo: 0 }, PARK_DROPS = { health: 0.06, ammo: 0.05 };
/** The drops kept to the fight: hers while it's on, the park's otherwise (the queen section's update says which). */
export const queenDrops = (on: boolean) => setDropTable(on ? KID_DROPS : PARK_DROPS);
export const startFight = (state: GameState, f: Fight) => {
  f.token++;
  setDropTable(KID_DROPS);
  resetKin();
  // (a retry: straight in, but a beat for her entrance first: the user's "give a beat for him to make his entrance
  // before you can take damage")
  if (!f.glass) { begin(state, f); f.entrance = ENTRANCE_T; playSound('roar', 1, -6); playSound('screams', 0.5, -10); shakeScreen(state, 10, 5); return; }
  f.mode = 'intro'; f.step = 'lights'; f.stepT = 0; f.skipT = 0;
  state.player.inCutscene = true;
  meatheadSays(state, pick(L.MH_DISCO[dressed(state)]), true, tokened(f, () => go(f, 'drop')));
};

/** On: out of the cutscene, the enemy into the world. */
const begin = (state: GameState, f: Fight) => {
  f.token++;
  to(f, 'idle'); f.onAt = f.total; f.glass = false; f.booth = 1; f.beam = 0; f.alive = 1; f.said = null; f.boothSaid = null;
  f.lights = 1; f.down = 1; f.foam = 0; f.suds = []; f.ext2 = 'gone'; f.cheapSaid = false;
  f.birthT = 120; f.canT = 0;
  // (the big leap's ready from the off: the first time she's to move, that's it; a retry, she's off soon after her entrance)
  f.leapT = LEAP_EVERY[1]; f.stay = 80; f.acts = 0;
  // (out of the cutscene she's mid-hall: first thing, she's off to the far end)
  if (Math.abs(f.x - SIDE_X[1]) > 40) { f.side = -1; f.forceLeap = true; }
  markBossIntroSeen(state, 'queen');
  state.player.inCutscene = false; state.player.kickPose = 0; state.player.extinguisher = undefined;
  const e = makeKindEnemy(QUEEN_KIND as EnemyKind, f.x, GY);
  e.facing = f.facing; e.seen = true;
  f.e = e; f.moveSeen = e.hitByMove;
  state.enemies.push(e);
};

/** A retry's entrance beat (frames). */
const ENTRANCE_T = 105;
const go = (f: Fight, s: Step) => { f.step = s; f.stepT = 0; };

const intro = (ctx: FrameContext, f: Fight): Controls => {
  const { state } = ctx, p = state.player;
  f.stepT++; f.skipT++;
  p.inCutscene = true;
  if (f.skipT > SKIP_AFTER) offerSkip();
  if (f.skipT > SKIP_AFTER && takeSkip()) {
    silenceAll(); state.playerVulgarityTimer = 0;
    p.vel.x = 0;
    begin(state, f); return hands();
  }
  const t = f.stepT, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height, head = queenHead(f.x, -1, 0);
  f.lights = Math.min(1, f.lights + 0.03);
  // (his pose with it (render/player/extinguisher.ts); a point of his (local, from his feet) out in the world)
  const pose = (step: NonNullable<typeof p.extinguisher>['step'], pt: number) => { p.extinguisher = { step, t: pt }; };
  const at = (lp: readonly [number, number]) => ({ x: cx + p.facing * lp[0], y: feet + lp[1] });
  if (p.extinguisher && p.extinguisher.step !== 'reach') p.extinguisher.t++;
  // (the loose foam: the spray's globs spent on her once they reach her (the heap on her is f.foam); the rest falls, lands, pops)
  if (f.suds.length) tickSuds(f.suds, s => f.step === 'spray' && Math.abs(s.x - (f.x - 20)) < 50 && s.y > GY - 320 && s.y < GY - 30);
  if (p.extinguisher?.step === 'throw' && p.extinguisher.t > 34) p.extinguisher = undefined;
  switch (f.step) {
    case 'lights':
      // (the hall coming up: the floor lighting, the ball turning; his say (the line's own callback moves it on))
      p.vel.x = 0; p.facing = 1;
      if (t === 1) playSound('powerup', 0.6, -4);
      if (t > 900) go(f, 'drop');
      break;
    case 'drop':
      // (down she comes out of the ceiling, silent: the screech, the landing)
      f.down = Math.min(1, t / 18);
      if (t === 1) playSound('screams', 0.7, -8);
      if (t === 18) { playSound('thud', 1, -10); playSound('land', 1, -8); shakeScreen(state, 14, 7); }
      if (t === 30) { playSound('roar', 0.8, -8); playSound('ding', 0.4, -10); }
      // (her gross-up from the screech on, a beat; then him)
      if (t >= 40 + GROSS_T) go(f, 'grab');
      break;
    case 'grab':
      // (over to the wall for the extinguisher; a hop up for it in its cabinet, got it, down with it, in to his chest)
      if (f.grabT === 0 && Math.abs(cx - EXTINGUISHER_X) > 12 && t < 200) return { ...hands(), right: cx < EXTINGUISHER_X, left: cx > EXTINGUISHER_X } as Controls;
      p.vel.x = 0; p.facing = 1;
      if (f.grabT === 0) pose('reach', 0);
      f.grabT++;
      if (p.extinguisher?.step === 'reach') p.extinguisher.t = f.grabT;
      if (f.grabT === 7) playSound('jump', 0.6, 4);
      if (f.grabT === REACH_GRAB && f.ext2 === 'wall') { f.ext2 = 'held'; playSound('clink', 0.8, -4); }
      if (f.grabT === 18) playSound('land', 0.8, -2);
      if (f.grabT === REACH_T) { pose('hold', 0); meatheadSays(state, pick(L.MH_EXTINGUISHER), true, tokened(f, () => { go(f, 'spray'); pose('spray', 0); })); }
      break;
    case 'spray': {
      // (braced, the hose on her: the foam a white cloud blasting out at her, the kick of it; it piles up on her; the
      // last of it sputtering)
      const tip = at(sprayNozzle(p.extinguisher ?? { step: 'spray', t })), out = t < 76, a = SPRAY_AIM;
      f.ex.x = tip.x; f.ex.y = tip.y;
      if (t > 6 && (out ? t % 2 === 0 : t % 5 === 0)) {
        playSound(out ? 'oil' : 'squish', out ? 0.35 : 0.3, out ? 8 : 12);
        // (globs of it, blasting at her (gone into the heap on her where they hit); sputtering at the end, dribbling)
        for (let i = 0; i < (out ? 2 : 1); i++) {
          const sp = (out ? 9 : 3) + Math.random() * 3, aa = a + (Math.random() - 0.5) * (out ? 0.22 : 0.6);
          addSud(f.suds, { x: tip.x, y: tip.y, vx: Math.cos(aa) * sp * p.facing, vy: Math.sin(aa) * sp, r: out ? 4 + Math.random() * 4 : 2.5 + Math.random() * 2, dr: out ? 0.12 : 0, life: out ? 44 : 22, grav: out ? 0.06 : 0.25, look: t + i });
        }
        // (the cloud billowing round the nozzle: swelling, hanging there, popping)
        if (out && t % 4 === 0) addSud(f.suds, { x: tip.x + p.facing * 8, y: tip.y, vx: p.facing * (0.6 + Math.random()), vy: -0.4 - Math.random() * 0.5, r: 5 + Math.random() * 3, dr: 0.2, life: 30, grav: 0, look: t + 3 });
      }
      if (out && t % 12 === 0) shakeScreen(state, 1, 1);
      f.foam = Math.min(1, t / 70);
      if (t >= 90) { go(f, 'shake'); playSound('gush', 0.5, 4); pose('shake', 0); }
      break;
    }
    case 'shake': {
      // (nothing: she shakes it all off, like a dog; him, shaking his empty can at his face)
      if (t % 6 === 0) {
        playSound('whoosh', 0.4, 6);
        // (flung off her like off a wet dog: globs out both ways, arcing down, landing in heaps that go)
        const n = Math.max(1, Math.round(5 * f.foam + 1));
        for (let i = 0; i < n; i++) addSud(f.suds, { x: f.x + (Math.random() - 0.5) * 80, y: GY - 120 - Math.random() * 160, vx: (Math.random() - 0.5) * 10, vy: -2 - Math.random() * 4, r: 3 + Math.random() * 5 * (0.4 + f.foam), dr: -0.04, life: 60, grav: 0.3, look: t + i });
      }
      if (t % 9 === 0) { playSound('clink', 0.3, 10); const tip = at(shakeNozzle(p.extinguisher ?? { step: 'shake', t })); addSud(f.suds, { x: tip.x, y: tip.y, vx: p.facing * 0.4, vy: 0.5, r: 2.5, dr: 0, life: 26, grav: 0.2, look: t }); }
      f.foam = Math.max(0, f.foam - 0.025);
      if (t === 40) meatheadSays(state, pick(L.MH_FOAM_FAIL), true, tokened(f, () => { go(f, 'throw'); pose('wind', 0); }));
      break;
    }
    case 'throw':
      // (so he throws it at her head: wound up over his head, hurled overhand, end over end)
      if (t === 1) { meatheadSays(state, pick(L.MH_THROW), false); }
      if (t === WIND_T) {
        f.ext2 = 'air';
        pose('throw', 0);
        const from = at(THROW_FROM);
        f.ex.x = from.x; f.ex.y = from.y; f.ex.r = 0;
        const T = Math.max(34, Math.round(Math.abs(head.x - f.ex.x) / 10));
        f.ex.vx = (head.x - f.ex.x) / T; f.ex.vy = (head.y - f.ex.y) / T - 0.5 * 0.35 * T;
        playSound('whoosh', 0.9, -2);
      }
      if (f.ext2 === 'air') {
        f.ex.x += f.ex.vx; f.ex.y += f.ex.vy; f.ex.vy += 0.35; f.ex.r += 0.4;
        if (Math.abs(f.ex.x - head.x) < 30 && Math.abs(f.ex.y - head.y) < 40) {
          // BONK
          f.ext2 = 'gone'; go(f, 'bonk');
          playSound('bonk', 1.2, -2); playSound('clang', 1, -6); shakeScreen(state, 10, 5);
          for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: head.x, y: head.y }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 4 }, life: 30, color: i % 2 ? '#FDE047' : '#DC2626', size: 2 + Math.random() * 3, grav: 0.3 });
        }
      }
      break;
    case 'bonk':
      // (a twitch, the sparks; then her first words)
      if (t % 5 === 0) playSound('click', 0.6, 8 - (t % 20));
      if (t === 40) { go(f, 'mode'); queenSays(state, f, L.QUEEN_LESS_FATAL, tokened(f, () => meatheadSays(state, pick(L.MH_LESS_FATAL[dressed(state)]), true, tokened(f, () => go(f, 'study'))))); }
      break;
    case 'mode':
      if (t > 1500) go(f, 'study');
      break;
    case 'study':
      // (up in the booth: their study of humans (the mating's done at the disco; this is a disco), then the plan)
      if (t === 1) boothSays(state, f, L.BOOTH_STUDY, () => boothSays(state, f, L.BOOTH_RITUAL, () => go(f, 'ray')));
      if (t > 1800) go(f, 'ray');
      break;
    case 'ray':
      // (up in the DJ booth: ACTIVATE IMPREGNATOR RAY; the beam into her belly; his say; on)
      if (t === 1) speak('m2.space.alien', pick(L.BOOTH_RAY[dressed(state)]), x => { f.boothSaid = x?.text ?? null; }, true, tokened(f, () => { f.beam = 0.01; go(f, 'beam'); }));
      if (t > 1500) begin(state, f);
      break;
    case 'beam':
      f.beam = Math.min(1, t / 15);
      if (t % 6 === 0) playSound('alienCharge', 0.4, 4 + (t % 18) / 3);
      if (t === 2) playSound('spawn', 0.8, -6);
      if (t >= 90) { f.beam = 0; go(f, 'react'); meatheadSays(state, pick(L.MH_RAY), true, tokened(f, () => begin(state, f))); }
      break;
    case 'react':
      if (t > 1500) begin(state, f);
      break;
  }
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame

const phase = (f: Fight) => (f.hp > (HP * 2) / 3 ? 1 : f.hp > HP / 3 ? 2 : 3);
const to = (f: Fight, m: Mode) => { f.mode = m; f.t = 0; f.ph = null; };
const pmid = (state: GameState) => ({ x: state.player.pos.x + state.player.width / 2, y: state.player.pos.y + state.player.height / 2 });
const canHurt = (state: GameState) => state.player.health > 0 && state.deathTimer <= 0 && state.player.invincibilityTimer <= 0;
const kinAbout = (state: GameState) => state.enemies.filter(e => isKin(e) && e.health > 0 && !e.isBlownAway);

export const updateFight = (ctx: FrameContext, f: Fight, controls: Controls): Controls => {
  const { state } = ctx;
  f.total++;
  live = f;
  // (her brood never drops anything (the user's: "no ammo drops. nothing"): whatever a kill's just thrown down in here
  // is gone again; the boss-door refill's out on the landing, kept)
  const kept = (id: string) => id === 'queen-health' || id === 'queen-ammo';
  if (state.pickups.some(k => !kept(k.id))) state.pickups = state.pickups.filter(k => kept(k.id));
  if (f.mode === 'intro') return intro(ctx, f);
  if (f.mode === 'wait') return controls;
  f.t++;
  if (f.iframes > 0) f.iframes--;
  if (f.flash > 0) f.flash--;
  if (f.barT > 0) f.barT--;
  tickPieces(state, f.pieces, f.splats);
  tickKin(ctx);
  fileLines(state);
  if (f.mode !== 'dead') { thrownInto(ctx, f); takeHits(ctx, f); }
  // (a good while into it and nothing thrown into her: him, working it out out loud)
  if (f.throwAt < 0) f.throwAt = f.total;
  if (f.mode !== 'dead' && f.total - f.throwAt > THROW_HINT_AFTER && f.total - f.throwHintAt > THROW_HINT_GAP && kinAbout(state).length > 0) {
    f.throwHintAt = f.total; meatheadSays(state, pick(L.MH_THROW_HINT[dressed(state)]), false);
  }
  if (f.hp <= 0 && f.mode !== 'dead') die(ctx, f);
  // (her entrance on a retry: reared up, screeching, her greeting; nothing born, leapt, dropped or swung at him)
  if (f.entrance > 0 && f.mode !== 'dead') {
    f.entrance--; f.linger = 0; f.ext *= 0.85;
    f.facing = (pmid(state).x < f.x ? -1 : 1);
    if (f.entrance === ENTRANCE_T - 12) bark(state, f, L.QUEEN_ENTRANCE);
    if (f.entrance % 10 === 0) playSound('click', 0.4, -4);
    tickOil(ctx, f);
    sync(f);
    return controls;
  }
  const ph = phase(f), p = state.player, pm = pmid(state);
  const toward = (pm.x < f.x ? -1 : 1) as 1 | -1;
  // (her body: run into her, or her into him, and it hurts (the user's: she does contact damage); her body rides up with
  // her leaps and hops, so under her in the air he's clear)
  if (f.mode !== 'dead' && canHurt(state)) {
    const bx0 = f.x - TOUCH_W / 2, bx1 = f.x + TOUCH_W / 2, by1 = GY - f.y, by0 = by1 - TOUCH_H;
    if (p.pos.x < bx1 && p.pos.x + p.width > bx0 && p.pos.y < by1 && p.pos.y + p.height > by0) {
      hurtPlayer(ctx, TOUCH_DMG, FLAIL, { x: toward * 9, y: -6 }, 14); playSound('punch', 0.8, -4);
    }
  }
  if (f.mode !== 'dead' && ++f.tauntT >= TAUNT_EVERY) { f.tauntT = Math.floor(Math.random() * 200); bark(state, f, L.QUEEN_TAUNT); }
  // (him in close: the flail's coming if he stays; backing off, it's off)
  // (not with the pool up round her: that's the keep-off then)
  // (her own pool's the keep-off while she's stood in it; walked off out of it, the flail's on again)
  const close = Math.abs(pm.x - f.x) < FLAIL_REACH && f.y === 0 && p.health > 0 && !(f.pool && Math.abs(f.pool.x - f.x) < POOL_R);
  f.linger = close && (f.mode === 'idle' || f.mode === 'birth') ? f.linger + 1 : Math.max(0, f.linger - 3);
  // (how long she's stood in this spot; the big leap's own clock runs whatever she's at)
  if (f.mode === 'idle' || f.mode === 'birth' || f.mode === 'flail') f.stay++;
  if (f.mode !== 'leap' && f.mode !== 'dead') f.leapT++;
  switch (f.mode) {
    case 'idle':
      f.facing = toward; f.ext *= 0.85;
      if (f.linger >= FLAIL_LINGER) { toFlail(f); break; }
      if (f.forceLeap) { startLeap(state, f); break; }
      // (stood here long enough, or had her two goes at him from here: off she goes; now and then sooner)
      if (f.acts >= STAY_ACTS || f.stay >= STAY_MAX[ph] || (f.stay >= STAY_MIN && Math.random() < 0.012)) { relocate(state, f); break; }
      if (++f.birthT >= BIRTH_EVERY[ph] && kinAbout(state).length + f.sacs.length + litterOf(f) <= KIN_CAP[ph]) { f.birthT = 0; f.acts++; to(f, 'birth'); f.ph = 'turn'; playSound('snort', 0.7, -8); }
      break;
    case 'birth':
      // (round she turns, her back to him; a push; out it comes)
      if (f.linger >= FLAIL_LINGER) { toFlail(f); break; }
      if (f.ph === 'turn') { f.facing = (-toward) as 1 | -1; if (f.t >= TURN_T) { f.ph = 'push'; f.t = 0; bark(state, f, L.QUEEN_BIRTH); } }
      else if (f.ph === 'push') {
        if (f.t % 8 === 0) { playSound('snort', 0.6, -12 + (f.t % 16) / 2); shakeScreen(state, 2, 1); }
        if (f.t >= PUSH_T) {
          // (a litter: two at the start, more the lower she gets; no more than two chargers to one)
          const odds = KIN_ODDS[ph], n = litterOf(f);
          f.litter = [];
          for (let i = 0; i < n; i++) {
            const r = Math.random();
            let kind = r < odds[0] ? BITER : r < odds[0] + odds[1] ? SPITTER : CHARGER;
            if (kind === CHARGER && f.litter.filter(k => k === CHARGER).length >= 2) kind = BITER;
            f.litter.push(kind);
          }
          if (state.frame - f.saidBirth > 900) { f.saidBirth = state.frame; meatheadSays(state, pick(L.MH_BIRTH), false); }
          else if (Math.random() < 0.5) bark(state, f, L.BOOTH_BIRTH, 'booth');
          f.ph = 'after'; f.t = 0;
          // (and the pool round her goes, as they come)
          if (f.pool) f.pool.going = true;
        }
      } else {
        // (out of her rear, toward the middle of the hall: one sac after another, the first flung furthest)
        if (f.litter.length && f.t % SAC_GAP === 0) {
          const dir = (-f.facing) as 1 | -1, i = f.litter.length - 1, kind = f.litter.shift()!;
          f.sacs.push({ x: f.x + dir * 70, y: GY - 90, vx: dir * (2.2 + i * 1.3 + Math.random() * 0.8), vy: -3 - Math.random(), t: 0, kind, landed: 0 });
          playSound('fart', f.litter.length ? 0.7 : 1, -6 + f.litter.length); playSound('splat', 0.7, -4); shakeScreen(state, 4, 2);
          for (let q = 0; q < 10; q++) state.particles.push({ pos: { x: f.x + dir * 60, y: GY - 90 }, vel: { x: dir * (1 + Math.random() * 4), y: -1 - Math.random() * 3 }, life: 30, color: q % 3 === 0 ? ALIEN.slime : q % 3 === 1 ? '#0A0604' : '#3F2A12', size: 2 + Math.random() * 3, grav: 0.3 });
        }
        if (!f.litter.length && f.t >= 24) to(f, 'idle');
      }
      break;
    case 'flail': {
      // (the tell: a twitch, sparks; then all four arms at once, wide)
      f.facing = toward;
      if (f.ph === 'tell') {
        if (f.t % 4 === 0) state.particles.push({ pos: { x: f.x, y: GY - 200 }, vel: { x: (Math.random() - 0.5) * 5, y: -2 }, life: 12, color: '#FDE047', size: 2 });
        if (f.t >= FLAIL_TELL) { f.ph = 'go'; f.t = 0; playSound('whoosh', 1, -6); bark(state, f, L.QUEEN_FLAIL); }
      } else {
        f.ext = Math.sin(f.t * 0.9) * 30;
        if (f.t % 5 === 0) playSound('whoosh', 0.6, -2 + (f.t % 10));
        if (canHurt(state) && Math.abs(pm.x - f.x) < FLAIL_WIDE && p.pos.y + p.height > GY - 260) {
          hurtPlayer(ctx, FLAIL_DMG, FLAIL, { x: toward * 13, y: -8 }, 20); playSound('punch', 1, -6); shakeScreen(state, 10, 5);
        }
        if (f.t >= FLAIL_T) { f.linger = 0; f.ext = 0; to(f, 'idle'); }
      }
      break;
    }
    case 'leap': leaping(ctx, f); break;
    case 'skitter': skittering(state, f); break;
    case 'stun':
      f.ext *= 0.9;
      if (f.t % 6 === 0) state.particles.push({ pos: { x: f.x + (Math.random() - 0.5) * 60, y: GY - 120 - Math.random() * 120 }, vel: { x: (Math.random() - 0.5) * 3, y: -1.5 }, life: 20, color: Math.random() < 0.5 ? '#FDE047' : '#FFFFFF', size: 2 });
      if (f.t % 30 === 1) playSound('twinkle', 0.5, 4);
      if (f.t >= f.stunT) to(f, 'idle');
      break;
    case 'dead': dying(ctx, f); break;
  }
  tickSacs(state, f);
  tickOil(ctx, f);
  tickPool(ctx, f);
  if (f.mode !== 'dead') tickCan(ctx, f, ph);
  sync(f);
  // (her plain death's a cutscene: hands off, the HUD down, from its first frame)
  // (and her weakness death, through her coming apart, the push-in, the burst and the pull-back to see it all land:
  // nothing of it can touch him (it's all hers, harmless), and none of it off screen anyway)
  if (f.mode === 'dead' && (!f.blown || f.deathT < BURST_AT + BLOWN_HOLD)) { p.inCutscene = true; p.vel.x *= 0.8; return hands(); }
  return controls;
};

// ---------------------------------------------------------------------------------------------------------------
// The leap, the oil

const toFlail = (f: Fight) => { f.acts++; to(f, 'flail'); f.ph = 'tell'; playSound('click', 0.8, 10); };
/** Off she goes from here: the big leap when it's due; else a hop over him (him near, room past him), or a skitter
 *  along her side of him; whichever there's room for. */
const relocate = (state: GameState, f: Fight) => {
  if (f.leapT >= LEAP_EVERY[phase(f)]) { startLeap(state, f); return; }
  const pm = pmid(state).x, over = (Math.sign(pm - f.x) || 1) as 1 | -1, hopX = pm + over * HOP_PAST;
  const canHop = Math.abs(pm - f.x) < HOP_NEAR && hopX >= X_MIN && hopX <= X_MAX && Math.abs(hopX - f.x) >= 260 && state.player.health > 0;
  const skit = skitterSpot(f, pm);
  if (canHop && (skit === null || Math.random() < 0.45)) startLeap(state, f, hopX);
  else if (skit !== null) startSkitter(f, skit);
  else startLeap(state, f);
};
/** Somewhere to skitter to: along her own side of him (never through him, never right up on him), a fair way off. */
const skitterSpot = (f: Fight, pm: number): number | null => {
  const mine = f.x >= pm ? 1 : -1;
  const lo = mine > 0 ? Math.max(X_MIN, pm + SKIT_KEEP) : X_MIN, hi = mine > 0 ? X_MAX : Math.min(X_MAX, pm - SKIT_KEEP);
  if (hi - lo < SKIT_MIN) return null;
  for (let i = 0; i < 8; i++) {
    const x = lo + Math.random() * (hi - lo), d = Math.abs(x - f.x);
    if (d >= SKIT_MIN && d <= SKIT_MAX) return x;
  }
  return null;
};
/** Off the spot: her clocks for it start again. */
const moved = (f: Fight) => {
  f.stay = 0; f.acts = 0; f.linger = 0;
  // (off out of her pool: it goes down behind her)
  if (f.pool) f.pool.going = true;
};
const startSkitter = (f: Fight, x: number) => {
  to(f, 'skitter'); f.ph = 'tell'; moved(f); f.leapFrom = f.x; f.dest = x;
  f.runT = Math.max(18, Math.min(52, Math.round(Math.abs(x - f.x) / SKIT_SPEED)));
  f.facing = (Math.sign(x - f.x) || f.facing) as 1 | -1;
  playSound('snort', 0.8, 6); playSound('click', 0.6, 12);
};
const skittering = (state: GameState, f: Fight) => {
  // (the tell: reared back, a hiss, her claws clicking)
  if (f.ph === 'tell') {
    if (f.t % 4 === 0) playSound('click', 0.35, 14);
    if (f.t >= SKIT_TELL) { f.ph = 'run'; f.t = 0; playSound('whoosh', 0.7, 2); }
    return;
  }
  // (across the floor at a scuttle, eased in and out, her legs going)
  const k = Math.min(1, f.t / f.runT), e = k * k * (3 - 2 * k);
  f.x = f.leapFrom + (f.dest - f.leapFrom) * e;
  f.stride += 0.6;
  if (f.t % 5 === 0) playSound('click', 0.5, 4 + (f.t % 10));
  if (f.t % 3 === 0) state.particles.push({ pos: { x: f.x - f.facing * 30, y: GY - 4 }, vel: { x: -f.facing * (1 + Math.random() * 2), y: -0.5 - Math.random() }, life: 16, color: '#3F2A12', size: 2 + Math.random() * 2, grav: 0.2 });
  if (k >= 1) { f.x = f.dest; f.side = f.x > (SIDE_X[-1] + SIDE_X[1]) / 2 ? 1 : -1; to(f, 'idle'); }
};

/** The big leap (to the far end of the hall, barfing), or with hopX a hop clean over him (no barf, no pool). */
const startLeap = (state: GameState, f: Fight, hopX?: number) => {
  to(f, 'leap'); f.ph = 'crouch'; f.forceLeap = false; f.leapFrom = f.x; moved(f);
  f.hop = hopX !== undefined;
  // (the big one: to whichever end of the hall's further off)
  const dest = hopX ?? (Math.abs(f.x - SIDE_X[-1]) > Math.abs(f.x - SIDE_X[1]) ? SIDE_X[-1] : SIDE_X[1]);
  f.dest = dest;
  f.facing = (Math.sign(dest - f.x) || -f.side) as 1 | -1;
  f.barf = [];
  // (some of her young on the way, now and then: as many as her cap has room for)
  const room = KIN_CAP[phase(f)] - kinAbout(state).length - f.sacs.length;
  f.brood = f.total - f.onAt > BROOD_AFTER && Math.random() < BROOD_ODDS ? Math.max(0, Math.min(room, 1 + Math.floor(Math.random() * BROOD_MAX))) : 0;
  if (f.hop) { playSound('screams', 0.4, -2); playSound('snort', 0.6, -4); return; }
  f.leapT = 0;
  // (where the barf'll come down: spaced spots along the floor between her and where she's going, gaps between them to
  // stand in; marked on the floor from now. As many as fit)
  const lo = Math.min(f.x, dest) + BARF_IN, hi = Math.max(f.x, dest) - BARF_IN, span = Math.max(BARF_W, hi - lo);
  const n = Math.max(1, Math.min(BARF_N[phase(f)], Math.floor((span + 40) / (BARF_W + 40))));
  const gap = n > 1 ? (span - n * BARF_W) / (n - 1) : 0, shift = n > 1 ? (Math.random() - 0.5) * Math.min(60, gap * 0.4) : 0;
  const first = n > 1 ? lo + BARF_W / 2 : lo + span / 2;
  for (let i = 0; i < n; i++) f.barf.push({ x: first + i * (BARF_W + gap) + shift, let: false, due: 0, landed: 0 });
  playSound('screams', 0.6, -8);
  if (Math.random() < 0.6) bark(state, f, L.QUEEN_LEAP);
};
const leaping = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  const from = f.leapFrom, dest = f.dest, hop = f.hop;
  if (f.ph === 'crouch') { if (f.t >= (hop ? HOP_CROUCH : CROUCH_T)) { f.ph = 'air'; f.t = 0; playSound('whoosh', 1, hop ? -2 : -8); if (!hop) playSound('engine', 0.6, 6); } return; }
  if (f.ph === 'air') {
    const k = f.t / (hop ? HOP_AIR : AIR_T);
    f.x = from + (dest - from) * k; f.y = Math.sin(k * Math.PI) * (hop ? HOP_UP : LEAP_UP);
    // (the barf: over each marked spot, a gush of it down out of her mouth onto that spot, a drop at a time, each
    // aimed at its own place in the spot; nothing in the gaps)
    const dir = Math.sign(dest - from) || 1;
    for (const b of f.barf) {
      if (!b.let && (f.x - b.x) * dir >= -60) { b.let = true; b.due = BARF_DROPS; playSound('retch', 0.8, -6); playSound('gush', 0.8, -4); }
      if (b.due > 0 && f.t % 2 === 0) {
        b.due--;
        const h = queenHead(f.x, f.facing, 0), x0 = h.x + f.facing * 20, y0 = GY - f.y - 230, vy = 1;
        const tx = b.x + (Math.random() - 0.5) * (BARF_W - 24), T = (-vy + Math.sqrt(vy * vy + 2 * 0.4 * Math.max(10, GY - y0))) / 0.4;
        f.drops.push({ x: x0, y: y0, vx: (tx - x0) / T, vy, tx });
      }
    }
    // (her young: out of her rear in mid-air, a sac at a time, only over the screen (they land where he can see them))
    if (!hop && f.brood > 0 && k > 0.25 && k < 0.85 && f.t % 10 === 0 && onScreen(state, f.x, 80)) {
      f.brood--;
      f.sacs.push({ x: f.x - dir * 50, y: GY - f.y - 110, vx: dir * (1 + Math.random() * 1.5), vy: -1 - Math.random(), t: 0, kind: broodKind(f), landed: 0 });
      broodOut(state, f, f.x - dir * 50, GY - f.y - 110, -dir as 1 | -1);
    }
    if (hop && f.t >= HOP_AIR) {
      // (a hop: down past him, turned round on him; no pool)
      f.ph = 'land'; f.t = 0; f.x = dest; f.y = 0; f.side = f.x > (SIDE_X[-1] + SIDE_X[1]) / 2 ? 1 : -1;
      f.facing = (pmid(state).x < f.x ? -1 : 1); playSound('thud', 1, -6); playSound('land', 0.8, -4); shakeScreen(state, 7, 4);
      // (and her young burst out of her as she comes down, off to either side of her)
      for (let i = 0; i < f.brood; i++) {
        const side = ((i % 2 ? 1 : -1) * (Math.random() < 0.5 ? 1 : -1)) as 1 | -1;
        f.sacs.push({ x: f.x + side * 40, y: GY - 120, vx: side * (2 + Math.random() * 2), vy: -4 - Math.random() * 2, t: 0, kind: broodKind(f), landed: 0 });
        broodOut(state, f, f.x + side * 40, GY - 120, side);
      }
      f.brood = 0;
      return;
    }
    if (f.t >= AIR_T) {
      f.brood = 0;
      f.ph = 'land'; f.t = 0; f.x = dest; f.y = 0; f.side = dest === SIDE_X[1] ? 1 : -1; playSound('thud', 1.2, -10); playSound('land', 1, -8); shakeScreen(state, 12, 6);
      // (down into a pool of it: hot, all round her, till her next birth)
      f.pool = { x: dest, k: 0, going: false }; playSound('gush', 1, -8);
      // (and a while before she births again: the pool's the keep-off till then; bat her kin back into her)
      f.birthT = 0;
    }
    return;
  }
  if (f.t >= (hop ? 14 : LAND_T)) to(f, 'idle');
};
/** Is world x on the screen (this far in from its edges)? */
const onScreen = (state: GameState, x: number, inset: number) => x > state.camera.x + inset && x < state.camera.x + CANVAS_WIDTH - inset;
/** Which of her young comes out (her odds by phase, no more than two chargers on their way). */
const broodKind = (f: Fight) => {
  const odds = KIN_ODDS[phase(f)], r = Math.random();
  const kind = r < odds[0] ? BITER : r < odds[0] + odds[1] ? SPITTER : CHARGER;
  return kind === CHARGER && f.sacs.filter(s => s.kind === CHARGER).length >= 2 ? BITER : kind;
};
/** One coming out of her on the move: the noise of it, the slime, his say (now and then). */
const broodOut = (state: GameState, f: Fight, x: number, y: number, dir: 1 | -1) => {
  playSound('fart', 0.8, -4 + Math.random() * 4); playSound('splat', 0.6, -2);
  for (let q = 0; q < 8; q++) state.particles.push({ pos: { x, y }, vel: { x: dir * (1 + Math.random() * 3), y: -1 - Math.random() * 2 }, life: 26, color: q % 3 === 0 ? ALIEN.slime : q % 3 === 1 ? '#0A0604' : '#3F2A12', size: 2 + Math.random() * 3, grav: 0.3 });
  if (state.frame - f.saidBirth > 900) { f.saidBirth = state.frame; meatheadSays(state, pick(L.MH_AIRDROP), false); }
};
/** The booth's spotlight: now and then (half way down her on), its spot marked on the floor under him (red, flashing,
 *  a whistle), then down it comes out of the rig: anything under it gets it (his, hers). */
const tickCan = (ctx: FrameContext, f: Fight, ph: number) => {
  const { state } = ctx, p = state.player;
  if (!f.can) {
    if (!DROP_EVERY[ph] || f.ops.mode !== 'on' || ++f.canT < DROP_EVERY[ph]) return;
    f.canT = Math.floor(Math.random() * 120);
    f.can = { x: Math.max(ARENA_L + 60, Math.min(ARENA_R - 60, pmid(state).x)), t: 0 };
    playSound('alarm', 0.4, 8);
    if (Math.random() < 0.5) bark(state, f, L.BOOTH_DROP, 'booth');
    return;
  }
  const c = f.can; c.t++;
  if (c.t < DROP_TELL && c.t % 10 === 0) playSound('beep', 0.3, 6 - c.t / 10);
  if (c.t === DROP_TELL + DROP_FALL) {
    playSound('glass', 1, -6); playSound('crash', 0.8, -2); shakeScreen(state, 8, 4);
    for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: c.x, y: GY - 8 }, vel: { x: (Math.random() - 0.5) * 8, y: -2 - Math.random() * 4 }, life: 40, color: ['#E2E8F0', '#FDE047', '#52525B'][i % 3], size: 2 + Math.random() * 3, grav: 0.35 });
    if (canHurt(state) && Math.abs(pmid(state).x - c.x) < DROP_R && p.pos.y + p.height > GY - 120) hurtPlayer(ctx, DROP_DMG, CAN, { x: pmid(state).x < c.x ? -6 : 6, y: -5 }, 16);
    for (const k of kinAbout(state)) if (Math.abs(k.pos.x + k.width / 2 - c.x) < DROP_R) destroyKin(ctx, k);
  }
  if (c.t > DROP_TELL + DROP_FALL + 40) f.can = null;
};

const tickOil = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, p = state.player;
  f.drops = f.drops.filter(d => {
    d.x += d.vx; d.y += d.vy; d.vy += 0.4;
    if (canHurt(state) && d.x > p.pos.x - 6 && d.x < p.pos.x + p.width + 6 && d.y > p.pos.y && d.y < p.pos.y + p.height) {
      hurtPlayer(ctx, OIL_DMG, OIL, { x: Math.sign(d.vx) * 3, y: -3 }, 10); playSound('splat', 0.6, 2); return false;
    }
    if (d.y >= GY - 2) {
      // (a slick where it lands, joined to any next to it; a splash, a sizzle, acid fumes)
      const near = f.slicks.find(s => d.x > s.x1 - 30 && d.x < s.x2 + 30);
      if (near) { near.x1 = Math.min(near.x1, d.x - 16); near.x2 = Math.max(near.x2, d.x + 16); near.t = 0; }
      else f.slicks.push({ x1: d.x - 18, x2: d.x + 18, t: 0 });
      for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: d.x, y: GY - 2 }, vel: { x: (Math.random() - 0.5) * 5, y: -1.5 - Math.random() * 3 }, life: 18, color: ['#0A0604', '#3F2A12', '#A3E635'][i % 3], size: 2 + Math.random() * 3, grav: 0.3 });
      state.particles.push({ pos: { x: d.x, y: GY - 8 }, vel: { x: (Math.random() - 0.5) * 0.5, y: -0.9 }, life: 40, color: 'rgba(190, 242, 100, 0.3)', size: 8 + Math.random() * 6 });
      if (Math.random() < 0.4) playSound('splat', 0.4, 4 + Math.random() * 4);
      if (Math.random() < 0.3) playSound('rayFizzle', 0.25, 10);
      const b = f.barf.find(q => Math.abs(q.x - d.tx) < BARF_W);
      if (b) b.landed++;
      return false;
    }
    return d.x > ARENA_L - 40 && d.x < ARENA_R + 40;
  });
  for (const s of f.slicks) s.t++;
  f.slicks = f.slicks.filter(s => s.t < SLICK_LIFE);
  // (the engine's oil: he slides on it)
  const others = (state.groundOil ?? []).filter(o => !(o as { queen?: boolean }).queen);
  state.groundOil = [...others, ...f.slicks.map(s => ({ x1: Math.max(ARENA_L, s.x1), x2: Math.min(ARENA_R, s.x2), kind: 'slick' as const, queen: true, notKinds: KIN_KINDS }))];
  // (the marks come off the floor once her barf's all down)
  if (f.mode !== 'leap' && f.barf.length && f.barf.every(b => b.let && b.due === 0) && !f.drops.length) f.barf = [];
  leak(state, f);
};
const KIN_KINDS = [...KIN];

/** She leaks all the time: drips off her joints, a trail of it in the air, puddles where she stands (looks only). */
const leak = (state: GameState, f: Fight) => {
  if (f.down < 1 || f.mode === 'intro' || f.mode === 'wait' || (f.endo && f.endo.ph === 'down')) return;
  const dead = f.mode === 'dead';
  if (state.frame % (dead ? DRIP_EVERY * 3 : DRIP_EVERY) === 0) {
    const x = f.x + (Math.random() - 0.5) * 80, y = GY - f.y - 40 - Math.random() * 170;
    state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 0.6, y: 0.5 }, life: 60, color: Math.random() < 0.2 ? '#A3E635' : Math.random() < 0.5 ? '#0A0604' : '#2A1A0A', size: 2 + Math.random() * 2.5, grav: 0.3 });
  }
  // (stood still, a puddle grows under her now and then; they dry up after a while)
  if (f.y === 0 && !dead && state.frame % SPOT_EVERY === 0 && f.spots.length < 10) f.spots.push({ x: f.x + (Math.random() - 0.5) * 120, r: 14 + Math.random() * 16, t: 0 });
  for (const s of f.spots) s.t++;
  f.spots = f.spots.filter(s => s.t < SPOT_LIFE);
};
export const clearOil = (state: GameState) => { state.groundOil = (state.groundOil ?? []).filter(o => !(o as { queen?: boolean }).queen); };

/** The pool round her: up, hot, burning him off it; going (her birth), down to nothing. The aliens keep out of it
 *  (hazardHit's zones; hers walk out of it: they're hers, it doesn't hurt them). */
const tickPool = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, p = state.player;
  const pl = f.pool;
  if (!pl) { setHazardZones(state, 'queen-pool', []); return; }
  pl.k = pl.going ? pl.k - 0.04 : Math.min(1, pl.k + 0.08);
  if (pl.k <= 0 && pl.going) { f.pool = null; setHazardZones(state, 'queen-pool', []); return; }
  const r = POOL_R * pl.k;
  setHazardZones(state, 'queen-pool', [{ x0: pl.x - r, x1: pl.x + r, y0: GY - 40, y1: GY, ground: true }]);
  if (state.frame % 10 === 0) playSound('glug', 0.2 * pl.k, -10);
  const cx = pmid(state).x;
  if (canHurt(state) && Math.abs(cx - pl.x) < r - 6 && p.pos.y + p.height > GY - 16) {
    const away = cx < pl.x ? -1 : 1;
    hurtPlayer(ctx, POOL_DMG, POOL, { x: away * 11, y: -9 }, 18); playSound('splat', 0.8, -4); playSound('oil', 1, -6); playSound('rayFizzle', 0.6, 4);
    for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: cx, y: GY - 6 }, vel: { x: (Math.random() - 0.5) * 4, y: -2 - Math.random() * 3 }, life: 20, color: i % 2 ? '#0A0A0A' : '#5B3A12', size: 2 + Math.random() * 3, grav: 0.3 });
  }
};

/** The sacs: out of her, along the floor, splat, and out it comes. */
const tickSacs = (state: GameState, f: Fight) => {
  f.sacs = f.sacs.filter(s => {
    s.t++;
    if (!s.landed) {
      s.x += s.vx; s.y += s.vy; s.vy += 0.4;
      if (s.y >= GY) { s.y = GY; s.landed = 1; playSound('splat', 0.9, -2); for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: s.x, y: GY - 4 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 24, color: i % 2 ? ALIEN.slime : '#C9C2A8', size: 2 + Math.random() * 3, grav: 0.3 }); }
      return true;
    }
    if (++s.landed >= 26) {
      // (out where he can see it: kept on the screen as well as in the hall)
      const cam = state.camera.x, x = Math.max(ARENA_L + 40, cam + 40, Math.min(ARENA_R - 40, cam + CANVAS_WIDTH - 40, s.x));
      if (f.mode !== 'dead') spawnKin(state, s.kind, x, s.vx > 0 ? 1 : -1);
      playSound('crack', 0.6, 6);
      return false;
    }
    return true;
  });
};

// ---------------------------------------------------------------------------------------------------------------
// Hits

/** Anybody flung into her: thrown (the grab), batted (the mallet), knocked flying. Hers are destroyed on her. */
/** Frames into the fight with nothing thrown into her before he hints at it, and between hints. */
const THROW_HINT_AFTER = 1500, THROW_HINT_GAP = 1500;
const thrownInto = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, p = state.player;
  if (f.mode === 'leap' && f.ph === 'air') return;
  const bx0 = f.x - 60, bx1 = f.x + 60, by0 = GY - 240;
  for (const e of [...state.enemies]) {
    if (e === f.e) continue;
    if (e.pos.x + e.width < bx0 || e.pos.x > bx1 || e.pos.y + e.height < by0) continue;
    const speed = Math.abs(e.vel.x) + Math.abs(e.vel.y);
    const thrown = (e.enemyCollisionCooldown ?? 0) > 0;
    const flung = thrown || e.isBlownAway || e.meleeFlung || ((e.pauseTimer ?? 0) > 0 && speed > 8);
    if (!flung || speed < 5 || (isKin(e) && kinAge(state, e) < 20 && !thrown && !e.isBlownAway)) continue;
    const batted = !thrown && p.currentWeapon === 'MALLET' && isKin(e);
    f.eventAt = f.total; f.throwAt = f.total;
    // (another one arriving on the same contact: it's done for, but she's already been hurt for this one)
    if (f.total - f.flungAt < FLUNG_GAP) {
      if (isKin(e) || e.isBlownAway) destroyKin(ctx, e);
      else { e.health = 0; ctx.fx.blowAwayEnemy(e, { x: -Math.sign(e.vel.x) * 6, y: -6 }, null as never, -Math.sign(e.vel.x) || 1); }
      continue;
    }
    f.flungAt = f.total;
    if (batted) {
      // (her own, batted back into her: the hit, and she's stunned, and the lot of them go)
      const before = f.hp;
      f.hp -= BATTED_DMG; f.flash = 16; f.iframes = IFRAMES;
      malletFeel(state, f, 'batted', before, { x: f.x, y: GY - 170 }, (Math.sign(e.vel.x) || 1) as 1 | -1);
      for (const k of kinAbout(state)) destroyKin(ctx, k);
      if (state.enemies.includes(e)) destroyKin(ctx, e);
      f.sacs = []; f.litter = [];
      ctx.fx.spawnDamageNumber({ x: f.x - 20, y: GY - 260 }, BATTED_DMG, true);
      // (its own callout, the announcer calling it)
      const call = pickLine(GRAB_CALLOUTS.batted.lines);
      state.damageNumbers.push({ id: `queen-bat-${state.frame}`, text: call, pos: { x: f.x - 60, y: GY - 300 }, vel: { x: 0, y: -2.8 }, life: 80, maxLife: 80, isCritical: true, isCallout: true, color: GRAB_CALLOUTS.batted.color });
      announce(call, 1, true);
      playSound('bonk', 1.2, -4); playSound('crash', 1, -2); shakeScreen(state, 16, 8);
      if (f.hp > 0) { stun(state, f, BATTED_STUN); meatheadSays(state, pick(L.MH_BAT), true); }
      else f.byWeakness = true;
      return;
    }
    // (thrown into her: it's done for, and she's hurt)
    f.hp -= FLUNG_DMG; f.flash = 12;
    ctx.fx.spawnDamageNumber({ x: f.x - 20, y: GY - 260 }, FLUNG_DMG, true);
    playSound('crash', 0.8, 2); shakeScreen(state, 8, 4);
    if (isKin(e) || e.isBlownAway) destroyKin(ctx, e);
    else { e.health = 0; ctx.fx.blowAwayEnemy(e, { x: -Math.sign(e.vel.x) * 6, y: -6 }, null as never, -Math.sign(e.vel.x) || 1); }
    // (a throw's never her weakness, whatever's in his hand: only a straight mallet hit or a batted kid is)
    if (f.hp <= 0) f.byWeakness = false;
  }
};

const takeHits = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, e = f.e, p = state.player;
  if (!e) return;
  // (what the mallet just did to her, if anything: read every frame, so it's never stale)
  const mh = takeMalletHit(e);
  const bites = takeBites(e);
  const dealt = Math.max(0, BIG - e.health);
  e.health = BIG; e.maxHealth = BIG;
  const melee = e.hitByMove !== f.moveSeen;
  f.moveSeen = e.hitByMove;
  if (dealt <= 0 || !state.enemies.includes(e)) return;
  // (a throw or a bat just landed on her: that's had its say; the engine's share of the same knock isn't extra)
  if (f.total - f.eventAt <= 4) return;
  const nib = Math.min(dealt, bites), hit = dealt - nib;
  if (nib > 0) f.hp -= nib * SHARE;
  // (finished by a nibble (the spawner's bites), mallet in hand or not: a plain death, not her weakness)
  if (f.hp <= 0) { f.byWeakness = false; return; }
  // (the held smash isn't swallowed by the breather after a lesser hit: it always gets its full weight in)
  const smash = mh?.how === 'smash';
  if (hit <= 0.5 || (f.iframes > 0 && !smash)) return;
  // (a straight hit of the mallet's own, reported by it: not just anything that hurts her while he's holding it)
  const mallet = !!mh;
  const dmg = smash ? MALLET_SMASH : melee ? (p.isUppercutting || p.isDivekicking ? BOSS_UPPERCUT_DAMAGE : BOSS_CHARGE_DAMAGE)
    : p.currentWeapon === 'GUN' ? BULLET_DAMAGE : mallet ? Math.min(hit, MALLET_HIT) : Math.max(1, hit * SHARE);
  const before = f.hp;
  f.hp -= dmg; f.iframes = IFRAMES;
  ctx.fx.spawnDamageNumber({ x: e.pos.x + 20, y: e.pos.y + 20 }, Math.max(1, Math.round(dmg)), mallet);
  const pm = pmid(state), head = queenHead(f.x, f.facing, 0);
  if (!mallet) {
    // (anything but her weakness: a modest knock, a ping, a spark or two)
    f.flash = 6;
    for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: e.pos.x + e.width / 2, y: e.pos.y + 60 + Math.random() * 100 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 12, color: '#FDE047', size: 2, grav: 0.3 });
    // (she bleeds oil: black, a glint on it)
    bleedOil(state, { x: e.pos.x + e.width / 2, y: e.pos.y + 60 + Math.random() * 100 }, (Math.sign(f.x - pm.x) || 1) as 1 | -1, 5);
    playSound('clang', 0.3, 8);
  }
  // (the mallet up close, at any height (him within CLOSE_R of her body): stunned, and off to the other side after.
  // At her head (him up level with it), a bit more and a BONK. Not again while she's stunned or leaping, nor within
  // CLOSE_GAP of the last: no stun-lock)
  const gap = Math.max(0, e.pos.x - pm.x, pm.x - (e.pos.x + e.width));
  const atHead = Math.abs(pm.y - head.y) < 70 && Math.abs(pm.x - head.x) < 130;
  let stunned = false;
  if (mallet && f.hp > 0 && f.mode !== 'leap' && f.mode !== 'stun' && f.mode !== 'dead' && gap < CLOSE_R && f.total - f.closeAt >= CLOSE_GAP) {
    f.closeAt = f.total; f.forceLeap = true; stunned = true;
    if (atHead) {
      f.hp -= HEAD_EXTRA;
      stun(state, f, HEAD_STUN);
      meatheadSays(state, pick(L.MH_HEAD), false);
    } else stun(state, f, smash ? SMASH_STUN : CLOSE_STUN);
  }
  if (mallet) {
    // (her weakness, and it shows: the world held a beat, the shake, her flash, the chunk off her bar, a dent, a bit
    // knocked off her, the noise of it, the word; her speaker glitching (when the stun hasn't had her say already))
    const at = { x: Math.max(e.pos.x, Math.min(e.pos.x + e.width, pm.x + Math.sign(f.x - pm.x) * 30)), y: Math.max(GY - 250, Math.min(GY - 70, atHead ? head.y : pm.y)) };
    malletFeel(state, f, smash ? 'smash' : atHead && stunned ? 'head' : mh!.how, before, at, (Math.sign(f.x - pm.x) || 1) as 1 | -1);
    if (!stunned && f.hp > 0) glitch(state, f);
  }
  // (the close-up kill: only for a straight mallet hit (swing, launch, pound, spin, head bonk, the smash))
  if (f.hp <= 0) f.byWeakness = mallet;
};

/** Hit, she bleeds oil: black motor oil spurting out the way the blow went, a few glints in it, spattering where it
 *  lands. */
const OIL_BLOOD = ['#09090B', '#141210', '#1F1B16', '#2C261E'];
const bleedOil = (state: GameState, at: { x: number; y: number }, away: 1 | -1, n: number) => {
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x: at.x, y: at.y }, vel: { x: away * (1 + Math.random() * 4) + (Math.random() - 0.5) * 2, y: -1.5 - Math.random() * 3.5 }, life: 40 + Math.random() * 30, color: i % 5 === 0 ? '#5A5040' : OIL_BLOOD[i % 4], size: 2 + Math.random() * 3, grav: 0.32 });
};
/** The comic words over a mallet hit on her, by what it was. */
const FEEL_WORDS: Record<string, string[]> = {
  smash: ['KA-BLAM!', 'KA-RUNCH!', 'WHAM-O!'], head: ['BONK!', 'KLONK!', 'DONK!'], batted: [],
  other: ['CLANG!', 'WHANG!', 'KLONG!', 'SPANG!', 'THWONK!'],
};
const FEEL_COLORS = ['#FDE047', '#F472B6', '#60A5FA', '#4ADE80', '#FB923C'];
/** A mallet hit on her (any: swing, head, smash, a kid batted back): it has to read as THE weakness. */
const malletFeel = (state: GameState, f: Fight, how: MalletHow | 'head' | 'batted', before: number, at: { x: number; y: number }, away: 1 | -1) => {
  const big = how === 'smash' || how === 'batted';
  f.stopT = how === 'smash' ? 9 : big ? 8 : 5;
  shakeScreen(state, big ? 22 : 16, big ? 11 : 8);
  f.flash = 16;
  f.barFrom = f.barT > 0 ? Math.max(f.barFrom, before) : before; f.barT = 50;
  f.dents++;
  for (let i = 0; i < 18; i++) { const a = Math.random() * Math.PI * 2, v = 3 + Math.random() * 7; state.particles.push({ pos: { x: at.x, y: at.y }, vel: { x: Math.cos(a) * v, y: Math.sin(a) * v - 1 }, life: 14 + Math.random() * 10, color: i % 3 ? '#FDE047' : '#FFFFFF', size: 2 + Math.random() * 2, grav: 0.2 }); }
  bleedOil(state, at, away, 14);
  if (f.pieces.length < 80) f.pieces.push(...chipQueen(at.x, at.y, away));
  playSound('bonk', 1.3, -6); playSound('clang', 1, -3); playSound('crash', 0.6, 2);
  if (how === 'smash') playSound('slam', 1, -6);
  const words = FEEL_WORDS[how === 'smash' || how === 'head' || how === 'batted' ? how : 'other'];
  if (words.length) {
    const text = pick(words), col = FEEL_COLORS[Math.floor(Math.random() * FEEL_COLORS.length)];
    state.damageNumbers.push({ id: `queen-feel-${state.frame}`, text, pos: { x: at.x - 40, y: at.y - 50 }, vel: { x: 0, y: -2.4 }, life: 60, maxLife: 60, isCritical: true, isCallout: true, color: col });
  }
};
/** Her speaker glitching out at a mallet hit: short, a while apart, not over anybody. */
const glitch = (state: GameState, f: Fight) => {
  if (f.total - f.glitchAt < 150 || !quiet(f) || isTalking()) return;
  f.glitchAt = f.total;
  const text = pickLine(L.QUEEN_MALLET[dressed(state)]);
  say(text, voice('m2.space.queen'), 'casual', {
    onShow: spoken => { f.said = text; if (!spoken) setTimeout(() => { if (f.said === text) f.said = null; }, Math.max(1400, text.length * 65)); },
    onHide: () => { if (f.said === text) f.said = null; },
  });
};

const stun = (state: GameState, f: Fight, t: number) => {
  to(f, 'stun'); f.stunT = t; f.linger = 0;
  playSound('rayFizzle', 0.8, -6); shakeScreen(state, 6, 3);
  if (Math.random() < 0.5) bark(state, f, L.QUEEN_STUN); else bark(state, f, L.BOOTH_MATING, 'booth');
};

/** The enemy, where she is. */
const sync = (f: Fight) => {
  const e = f.e;
  if (!e) return;
  e.pos.x = f.x + f.ext - e.width / 2 + f.facing * 10; e.pos.y = GY - 26 - e.height - f.y;
  e.vel.x = 0; e.vel.y = 0; e.facing = f.facing; e.initialY = e.pos.y;
  e.hitCooldown = f.iframes;
  e.pauseTimer = 0; e.frozenTimer = 0; e.isTased = false; e.sludgeTimer = 0; e.returnHome = false;
};

// ---------------------------------------------------------------------------------------------------------------
// Dying

const die = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  f.token++;
  to(f, 'dead'); f.deathT = 0; f.drops = []; f.sacs = []; f.litter = []; f.barf = []; f.y = 0; if (f.pool) f.pool.going = true;
  if (f.e) state.enemies = state.enemies.filter(o => o !== f.e);
  // (her offspring: dead where they stand, the lot)
  for (const k of kinAbout(state)) destroyKin(ctx, k);
  state.damageNumbers = [];
  f.said = null; f.boothSaid = null;
  playSound('rayFizzle', 1, -8); playSound('crash', 0.6, -4);
  // (her weakness: slow motion on the killing blow, pushed in on her, she comes apart at every seam at once (split.ts),
  // and bursts, the camera pulling back to the whole hall to see it land; her last words come out of her head wherever
  // it lands. Otherwise: her circuits going, said where she stands)
  if (f.byWeakness) {
    f.blown = true; f.slow = { t: 0, acc: 0 }; f.stopT = 0; f.whiteT = 99; f.blowT = 0; f.burstRT = -1; shakeScreen(state, 10, 6);
    state.player.noContactUntil = Math.max(state.player.noContactUntil ?? 0, state.frame + BURST_AT + BLOWN_HOLD + 60);
  }
  else {
    // (anything else: her oil boils over and catches (endo.ts); her speaker cooking while it does)
    const en = f.endo = makeEndo();
    f.stunT = 0; f.flash = 0; f.iframes = 0;
    playSound('oil', 1, -8); playSound('glug', 0.8, -10);
    queenSays(state, f, L.QUEEN_BURNS, tokened(f, () => { en.burnSaid = true; }));
  }
};
/** Her weakness death: game frames past the burst that it's a cutscene (the pull-back, the pieces coming down). */
const BLOWN_HOLD = 110;
const dying = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  const t = ++f.deathT;
  // (her lunge held where it was while she comes apart (her painting's frozen at the killing blow: split.ts))
  if (!f.blown) f.ext *= 0.95;
  if (f.blown) {
    // (cracking at every seam at once, then parting along all of them: sparks, her green, the wiring snapping)
    if (t < BURST_AT) tickSplit(state, f.x, f.facing, f.ext, t);
    if (t === BURST_AT) {
      f.pieces.push(...burstQueen(f.x + f.facing * f.ext, f.facing));
      burstSpray(state, f.x + f.facing * f.ext);
      f.whiteT = 0; f.burstRT = f.blowT;
      playSound('boom', 1.2, -6); playSound('crash', 1.2, -4); playSound('gush', 1, -4); playSound('bonk', 1, -10);
      shakeScreen(state, 30, 16);
    }
    // (her last words: out of her head, once it's come to rest (or a while on, wherever it is))
    const hd = headPiece(f.pieces);
    if (!f.lastWords && t > BURST_AT && (hd?.rest || t > 150)) {
      f.lastWords = true;
      queenSays(state, f, L.QUEEN_DIES, tokened(f, () => { f.deathSaid = 1; }));
    }
  }
  const en = f.endo;
  if (!f.blown && en) {
    // (all of it skippable, all or nothing: straight to her in pieces and the booth empty)
    if (t > SKIP_AFTER) offerSkip();
    if (t > SKIP_AFTER && takeSkip()) { skipDeath(state, f, en); return; }
    // (her last line once her burn line's done; the lunge once that is; his say once she's in pieces)
    if (en.ph === 'bare' && en.t >= 50 && en.burnSaid && !en.fatalAsked) { en.fatalAsked = true; queenSays(state, f, L.QUEEN_MORE_FATAL, tokened(f, () => { en.go = true; })); }
    tickEndo(state, en, f, pmid(state).x);
    if (en.ph === 'down' && en.t >= 50 && !en.quipped) { en.quipped = true; meatheadSays(state, pick(L.MH_ENDO[dressed(state)]), true, tokened(f, () => { f.deathSaid = 1; })); }
    if (en.ph === 'down' && en.t > 1500 && f.deathSaid === 0) f.deathSaid = 1;
  }
  // (her last words done: the booth's two lose it (fists, stomping, CURSES), WE'LL SEE YOU AGAIN, out the back; then
  // him)
  const o = f.ops;
  if (o.mode !== 'on') o.t++;
  if (o.mode === 'mad' && o.t % 8 === 0) playSound('thud', 0.4, 6);
  if (f.deathSaid === 1 && t > 160) {
    f.deathSaid = 2; o.mode = 'mad'; o.t = 0;
    boothSays(state, f, L.BOOTH_CURSES, () => boothSays(state, f, L.BOOTH_EXIT, () => { o.mode = 'run'; o.t = 0; playSound('whoosh', 0.8, 2); playSound('slam', 0.6, 4); }));
  }
  if (o.mode === 'run' && o.t === 50) {
    o.mode = 'gone'; o.t = 0;
    meatheadSays(state, pick(L.MH_OPS_GONE[dressed(state)]), true, tokened(f, () => { f.deathSaid = 3; }));
  }
  if (t > 2400) f.deathSaid = 3;
};

/** Her plain death skipped: her in pieces where she'd have ended up, the booth's two gone, over. */
const skipDeath = (state: GameState, f: Fight, en: Endo) => {
  f.token++;
  silenceAll(); state.playerVulgarityTimer = 0;
  f.said = null; f.boothSaid = null;
  settleEndo(en, f);
  f.ops.mode = 'gone'; f.ops.t = 0;
  f.deathSaid = 3; f.deathT = Math.max(f.deathT, 221);
};
/** Her plain death on (and skippable): the SKIP prompt's up. */
export const deathSkippable = (f: Fight) => f.mode === 'dead' && !f.blown && !!f.endo && f.deathT > SKIP_AFTER && f.deathSaid < 3;
/** The glow off her burning (the lighting pass). */
export const deathLights = (f: Fight): Light[] => (f.mode !== 'dead' ? [] : f.blown ? splitLights(f.x, f.facing, f.ext, f.deathT) : endoLights(f.endo, f));
/** Her death and the booth's two running out on it: the camera pulled back (eased in by `k`, 0..1) to take in the
 *  booth (and what they say over it), her and him; the booth's words kept clear below the HUD. */
export const discoZoom = (state: GameState, f: Fight, k: number) => {
  if (k <= 0) return null;
  if (f.blown) return blownZoom(state, f, k);
  const e = k * k * (3 - 2 * k), px = pmid(state).x;
  const x0 = Math.min(BOOTH.x - 40, f.x - 140, px - 50), x1 = Math.max(BOOTH.x + BOOTH.w + 40, f.x + 140, px + 50);
  const y0 = BOOTH.y - 80, y1 = GY + 16;
  const top = HUD_CLEAR_Y + 8, w = CANVAS_WIDTH - 40, h = CANVAS_HEIGHT - top - 12;
  const sc = Math.min(1, w / (x1 - x0), h / (y1 - y0));
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return { scale: 1 + (sc - 1) * e, x: cx, y: cy, shiftX: e * (state.camera.x + CANVAS_WIDTH / 2 - cx), shiftY: e * (state.camera.y + top + h / 2 - cy) };
};

/** Her plain death, what of it has to be on screen (deathFrame.ts: killed with her a way off it, the camera takes her
 *  in): her burning, the skeleton, its lunge; then the heap, every piece of it where it's gone. Null for the mallet's
 *  (its own camera's the whole hall) and once it's over. */
export const deathNeed = (f: Fight): Box | null => {
  const en = f.endo;
  if (f.mode !== 'dead' || f.blown || !en) return null;
  if (en.ph !== 'down') return around(f.x, GY, 240, 320, 12);
  return join(around(en.bx, GY, 60, 120, 12), boxOf(en.bits.map(b => ({ x: en.bx + en.bf * b.x, y: GY + b.y })), 30));
};

/** Her weakness death: pulled right back, the whole disco wall to wall, its floor along the bottom of the screen, to
 *  see her pieces go to every corner of it. */
const wideView = () => {
  const x0 = ARENA_L - 20, x1 = ARENA_R + 20;
  const sc = Math.min(1, (CANVAS_WIDTH - 16) / (x1 - x0));
  // (the floor (GY + 16) this far down the screen; the hall's middle across it)
  const floorAt = CANVAS_HEIGHT - 70, mid = CANVAS_HEIGHT / 2;
  return { sc, mid, cx: (x0 + x1) / 2, cy: GY + 16 - (floorAt - mid) / sc };
};
const wideZoom = (state: GameState, k: number) => {
  const e = k * k * (3 - 2 * k), { sc, mid, cx, cy } = wideView();
  return { scale: 1 + (sc - 1) * e, x: cx, y: cy, shiftX: e * (state.camera.x + CANVAS_WIDTH / 2 - cx), shiftY: e * (state.camera.y + mid - cy) };
};

/** Her weakness death's camera: pushed in on her as she comes apart (her filling the screen), held there till she
 *  bursts, then pulled right back (wideView) over the pieces' flight to take in every one of them where it comes down;
 *  held wide through the rest (her last words, the booth's two running out), back in for the walk-away (`k`). */
const CAM_IN = 16, CAM_OUT = 90;
const blownZoom = (state: GameState, f: Fight, k: number) => {
  if (f.deathSaid >= 3) return wideZoom(state, k);
  const sm = (u: number) => { const v = Math.max(0, Math.min(1, u)); return v * v * (3 - 2 * v); };
  const cam = state.camera, push = sm(f.blowT / CAM_IN), pull = f.burstRT < 0 ? 0 : sm((f.blowT - f.burstRT) / CAM_OUT);
  // (each view: a world point put at a screen point, at a scale; normal, pushed in on her, the whole hall)
  const wv = wideView();
  const mix = (a: number, b: number, w: number) => (a + (b - a) * push) * (1 - pull) + w * pull;
  const wx = mix(cam.x + CANVAS_WIDTH / 2, f.x + f.facing * (f.ext + 6), wv.cx), wy = mix(cam.y + CANVAS_HEIGHT / 2, GY - 140, wv.cy);
  const sx = CANVAS_WIDTH / 2, sy = mix(CANVAS_HEIGHT / 2, CANVAS_HEIGHT / 2 + 20, wv.mid);
  // (pushed in, the hall's big stamps are scaled up from the ones they have, not painted afresh huge for a moment)
  if (push > 0 && pull < 1) setStampHold(true);
  return { scale: mix(1, PUNCH, wv.sc), x: wx, y: wy, shiftX: sx + cam.x - wx, shiftY: sy + cam.y - wy };
};

/** Every real tick: a mallet hit's hit-stop, her weakness death's slow motion (held through her coming apart and the
 *  first of the burst, then back up to speed). True: this tick passes no game time. */
const SLOW = 0.24, SLOW_PAST = 8, SLOW_RAMP = 70;
export const queenHoldTick = (f: Fight): boolean => {
  if (f.whiteT < 99) f.whiteT++;
  if (f.blown) f.blowT++;
  if (f.stopT > 0) { f.stopT--; return true; }
  const s = f.slow;
  if (!s) return false;
  s.t++;
  if (f.deathT < BURST_AT + SLOW_PAST) s.t = 0;
  const rate = s.t <= 0 ? SLOW : Math.min(1, SLOW + ((1 - SLOW) * s.t) / SLOW_RAMP);
  if (rate >= 1) { f.slow = null; return false; }
  s.acc += rate;
  if (s.acc >= 1) { s.acc -= 1; return false; }
  return true;
};
/** Screen space: the white flash she bursts in. */
export const drawBurstFlash = (c: Ctx, f: Fight) => {
  if (f.whiteT >= 16) return;
  c.fillStyle = `rgba(255, 255, 255, ${(0.85 * (1 - f.whiteT / 16)).toFixed(2)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
};

// ---------------------------------------------------------------------------------------------------------------
// Her oil won't burn (it's acid, and it's cheap): a meteor from the spellbook's storm come down in it, it just splashes
// and smokes; his say over that, once a life. (Nothing else lights it either: it's the engine's slick, which nothing
// sets fire to.)

/** The fight that's on (for the meteor's say). */
let live: Fight | null = null;
onMeteorBlast((ctx, at) => {
  const f = live, { state } = ctx;
  if (!f || f.mode === 'intro' || f.mode === 'wait' || f.mode === 'dead') return;
  const pl = f.pool;
  const inPool = !!pl && pl.k > 0.2 && Math.abs(at.x - pl.x) < POOL_R * pl.k + 20 && at.y > GY - 260;
  const inSlick = at.y > GY - 110 && (f.slicks.some(s => at.x > s.x1 - 24 && at.x < s.x2 + 24) || f.spots.some(s => Math.abs(at.x - s.x) < s.r + 24));
  if (!inPool && !inSlick) return;
  // (a splash of black, a hiss, a sad puff of smoke: no fire)
  playSound('rayFizzle', 0.9, -8); playSound('splat', 0.9, -6);
  for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: at.x + (Math.random() - 0.5) * 30, y: GY - 4 }, vel: { x: (Math.random() - 0.5) * 7, y: -3 - Math.random() * 5 }, life: 34, color: i % 3 ? '#0A0604' : '#3F2A12', size: 3 + Math.random() * 4, grav: 0.35 });
  for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: at.x + (Math.random() - 0.5) * 40, y: GY - 10 }, vel: { x: (Math.random() - 0.5) * 0.8, y: -0.8 - Math.random() * 0.6 }, life: 70, color: 'rgba(120, 113, 108, 0.45)', size: 10 + Math.random() * 10 });
  ctx.fx.spawnDamageNumber({ x: at.x - 20, y: GY - 60 }, 'PFFT', true, '#A8A29E');
  if (!f.cheapSaid && state.player.health > 0 && state.deathTimer <= 0) { f.cheapSaid = true; meatheadSays(state, pick(L.MH_CHEAP_OIL[dressed(state)]), true); }
});

export const fightOver = (f: Fight) => f.mode === 'dead' && f.deathSaid >= 3 && f.deathT > 220;
export const endFight = (state: GameState, f: Fight) => { setDropTable(PARK_DROPS); live = null; state.player.inCutscene = false; state.player.extinguisher = undefined; f.drops = []; f.pool = null; setHazardZones(state, 'queen-pool', []); clearOil(state); };
export const introOn = (f: Fight) => f.mode === 'intro';
/** Her gross-up's length in the cutscene (frames, from the screech): the first go only (a retry has no cutscene). */
const GROSS_T = 100;
/** Screen space, under the letterbox: the cutscene's gross-up of her, screeching. */
export const drawIntroCloseup = (c: Ctx, f: Fight, fr: number) => {
  if (f.mode !== 'intro' || f.step !== 'drop' || f.stepT < 30 || f.stepT >= 30 + GROSS_T) return;
  const t = f.stepT - 30;
  drawQueenGrossBack(c, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawQueenGross(c, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0.9 + 0.1 * Math.min(1, t / 10), fr, t < 24 ? 4 : 1);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const poseOf = (f: Fight): QueenPose => {
  if (f.mode === 'dead') return f.deathT < 140 ? 'stunned' : 'dead';
  if (f.mode === 'intro' || f.mode === 'wait') return f.step === 'drop' ? 'roar' : f.step === 'shake' ? 'hurt' : f.step === 'bonk' ? 'stunned' : f.step === 'mode' || f.step === 'beam' ? 'wake' : 'idle';
  if (f.flash > 0) return 'hurt';
  if (f.entrance > 0) return 'roar';
  if (f.mode === 'birth') return f.ph === 'push' ? 'birth' : 'idle';
  if (f.mode === 'flail') return f.ph === 'tell' ? 'wake' : 'flail';
  if (f.mode === 'leap') return f.ph === 'crouch' ? 'stalk' : f.ph === 'air' ? 'leap' : 'stalk';
  if (f.mode === 'skitter') return f.ph === 'tell' ? 'tell' : 'stalk';
  if (f.mode === 'stun') return 'stunned';
  return 'idle';
};

/** The pool of hot motor oil round her after a leap: drawn over the floor and everything on it (the blood, the gore,
 *  his feet), so it can't be missed: black, a hard bright edge, a rainbow sheen sliding over it in bands, bubbles
 *  coming up and popping, fumes and a heat shimmer off it, and it glows (poolLights). World. */
export const drawPool = (c: Ctx, state: GameState, f: Fight) => {
  const pl = f.pool;
  if (!pl || pl.k <= 0) return;
  const r = POOL_R * pl.k, fr = state.frame, h = 18 * pl.k;
  // (the heat shimmer over it: thin wavy pale bands going up)
  for (let i = 0; i < 5; i++) {
    const u = ((fr * 0.015 + i * 0.2) % 1), y = GY - h - 10 - u * 90;
    c.fillStyle = `rgba(255, 237, 213, ${(0.08 * (1 - u) * pl.k).toFixed(3)})`;
    for (let x = -r * 0.8; x < r * 0.8; x += 8) c.fillRect(Math.round(pl.x + x), Math.round(y + Math.sin(x * 0.08 + fr * 0.2) * 3), 8, 2);
  }
  // (the body of it: a hard bright rim, black over everything)
  c.fillStyle = fr % 20 < 10 ? '#BEF264' : '#84CC16'; c.beginPath(); c.ellipse(pl.x, GY, r + 6, h + 5, 0, Math.PI, 0); c.fill(); c.fillRect(pl.x - r - 6, GY - 1, r * 2 + 12, 6);
  c.fillStyle = '#050302'; c.beginPath(); c.ellipse(pl.x, GY, r + 3, h + 2, 0, Math.PI, 0); c.fill(); c.fillRect(pl.x - r - 3, GY - 1, r * 2 + 6, 5);
  c.fillStyle = '#1A0F06'; c.beginPath(); c.ellipse(pl.x, GY, r * 0.94, h * 0.8, 0, Math.PI, 0); c.fill();
  // (the rainbow sheen: stepped bands sliding across it, clipped to it)
  c.save(); c.beginPath(); c.ellipse(pl.x, GY, r * 0.94, h * 0.8, 0, Math.PI, 0); c.clip();
  const bands = ['#7C3AED', '#2563EB', '#14B8A6', '#84CC16', '#FACC15', '#F97316', '#EC4899'];
  for (let i = 0; i < bands.length; i++) {
    const x = pl.x - r + (((fr * 1.2 + i * 18) % (r * 2 + 120)) - 60);
    c.fillStyle = bands[i]; c.globalAlpha = 0.55;
    c.beginPath(); c.moveTo(x, GY); c.lineTo(x + 14, GY); c.lineTo(x + 34, GY - h); c.lineTo(x + 20, GY - h); c.closePath(); c.fill();
  }
  c.globalAlpha = 1;
  c.restore();
  box(c, Math.round(pl.x - r * 0.5), Math.round(GY - h * 0.7), Math.round(r * 0.4), 2, 'rgba(255, 255, 255, 0.5)');
  // (bubbles up through it, swelling, popping in a ring)
  for (let i = 0; i < 8; i++) {
    const u = ((fr * 0.04 + i * 0.29) % 1), bx = pl.x - r * 0.8 + ((i * 61) % 100) / 100 * r * 1.6, by = GY - h * 0.5;
    if (u < 0.8) { const br = 2 + u * 7; c.fillStyle = '#0A0603'; c.beginPath(); c.arc(bx, by - br * 0.5, br, Math.PI, 0); c.fill(); c.strokeStyle = 'rgba(253, 186, 116, 0.8)'; c.lineWidth = 1.5; c.beginPath(); c.arc(bx, by - br * 0.5, br, Math.PI, 0); c.stroke(); box(c, bx - br * 0.4, by - br * 1.2, 2, 2, '#F0ABFC'); }
    else { const k = (u - 0.8) / 0.2; for (let q = 0; q < 6; q++) { const a = q * Math.PI / 3; box(c, bx + Math.cos(a) * (6 + k * 10) - 1, by - 6 - Math.abs(Math.sin(a)) * (4 + k * 8) - 1, 2, 2, '#FDBA74'); } }
  }
  // (the fumes off it: sick green-gray puffs, rising, fading in steps)
  for (let i = 0; i < 6; i++) {
    const u = ((fr * 0.012 + i * 0.17) % 1), a = u < 0.33 ? 0.35 : u < 0.66 ? 0.22 : 0.1;
    c.fillStyle = `rgba(163, 190, 140, ${(a * pl.k).toFixed(2)})`;
    c.beginPath(); c.ellipse(Math.round(pl.x - r * 0.6 + i * r * 0.24 + Math.sin(u * 6 + i) * 8), Math.round(GY - h - 10 - u * 120), 8 + u * 16, 6 + u * 10, 0, 0, Math.PI * 2); c.fill();
  }
  // (a warning glow on its rim, pulsing)
  if (fr % 20 < 10) { c.strokeStyle = 'rgba(163, 230, 53, 0.9)'; c.lineWidth = 2; c.beginPath(); c.ellipse(pl.x, GY, r + 7, h + 6, 0, Math.PI, 0); c.stroke(); }
};
/** Its glow (the lighting pass): orange, hot. */
export const poolLights = (f: Fight): Light[] => {
  const pl = f.pool;
  if (!pl || pl.k <= 0) return [];
  return [{ x: pl.x, y: GY - 20, r: POOL_R * pl.k * 1.5, a: 0.9 * pl.k, color: 'rgba(163, 230, 53, 0.22)' }, { x: pl.x, y: GY - 60, r: POOL_R * pl.k, a: 0.5 * pl.k, color: 'rgba(251, 146, 60, 0.12)' }];
};
/** Her tells, lit so the hall's dark never hides them: the flail's reach on the floor (red), the booth's spotlight's
 *  mark (red, flashing). */
export const tellLights = (f: Fight): Light[] => {
  const out: Light[] = [];
  if (f.mode === 'flail' && f.ph === 'tell') out.push({ x: f.x, y: GY - 10, r: FLAIL_WIDE, a: 0.8, color: 'rgba(239, 68, 68, 0.22)' });
  if (f.can && f.can.t < DROP_TELL + DROP_FALL) out.push({ x: f.can.x, y: GY - 10, r: 90, a: f.can.t % 8 < 4 ? 0.9 : 0.5, color: 'rgba(239, 68, 68, 0.25)' });
  return out;
};
/** The glow off her oil: each drop in the air, each slick's sizzle (sick acid green). */
export const oilLights = (f: Fight): Light[] => [
  ...f.drops.map(d => ({ x: d.x, y: d.y, r: 46, a: 0.7, color: 'rgba(163, 230, 53, 0.25)' })),
  ...f.slicks.map(s => ({ x: (s.x1 + s.x2) / 2, y: GY - 6, r: (s.x2 - s.x1) / 2 + 30, a: 0.5 * Math.min(1, (SLICK_LIFE - s.t) / 120), color: 'rgba(163, 230, 53, 0.16)' })),
  ...f.barf.filter(b => !b.let || b.due > 0).map(b => ({ x: b.x, y: GY - 4, r: BARF_W * 0.8, a: 0.5, color: 'rgba(190, 242, 100, 0.18)' })),
];

/** A glossy puddle of her oil on the floor (x, half-width; `a` how much of it's left): black-brown, a lit rim, the
 *  rainbow sheen sliding along it, a hard glint, a sick green sizzle at its edge. */
const puddle = (c: Ctx, x: number, r: number, a: number, fr: number, seed: number) => {
  c.globalAlpha = a;
  c.fillStyle = 'rgba(163, 230, 53, 0.55)'; c.beginPath(); c.ellipse(x, GY, r + 3, 5, 0, Math.PI, 0); c.fill(); c.fillRect(Math.round(x - r - 3), GY - 1, Math.round(r * 2 + 6), 3);
  c.fillStyle = '#0A0604'; c.beginPath(); c.ellipse(x, GY, r, 4, 0, Math.PI, 0); c.fill(); c.fillRect(Math.round(x - r), GY - 1, Math.round(r * 2), 4);
  c.fillStyle = '#2A1A0A'; c.fillRect(Math.round(x - r * 0.6), GY - 3, Math.round(r * 1.2), 1);
  const u = ((fr * 0.6 + seed * 37) % (r * 2)) - r;
  box(c, Math.round(x + u * 0.8), GY - 3, 4, 1, '#C084FC'); box(c, Math.round(x + u * 0.8) + 4, GY - 3, 4, 1, '#22D3EE'); box(c, Math.round(x + u * 0.8) + 8, GY - 3, 3, 1, '#FACC15');
  box(c, Math.round(x - r * 0.4), GY - 4, 3, 1, '#FFFFFF');
  // (the sizzle: a bubble up at its edge, popping)
  const b = (fr + seed * 13) % 24;
  if (b < 16) box(c, Math.round(x + ((seed * 7) % 2 ? r * 0.7 : -r * 0.7)) - 1, GY - 4 - (b >> 2), 3, 3, b < 12 ? '#BEF264' : '#ECFCCB');
  c.globalAlpha = 1;
};
/** One of her drops of oil: a big glossy gob (stretched along where it's going), black-brown, a rainbow sheen, a hard
 *  white glint, a sick acid-green rim and glow round it. */
const gob = (c: Ctx, x: number, y: number, vx: number, vy: number, fr: number) => {
  // (a teardrop: its fat round front the way it's going, the tail drawn out behind; a halo of acid green round it)
  const sp = Math.hypot(vx, vy), tail = 14 + Math.min(14, sp * 0.8), r = 9;
  c.fillStyle = `rgba(163, 230, 53, ${fr % 8 < 4 ? 0.3 : 0.18})`; c.beginPath(); c.arc(x, y, 18, 0, Math.PI * 2); c.fill();
  c.save(); c.translate(x, y); c.rotate(Math.atan2(vy, vx));
  const drop = (rr: number, tl: number) => { c.beginPath(); c.arc(0, 0, rr, -Math.PI / 2, Math.PI / 2); c.quadraticCurveTo(-tl * 0.5, rr * 0.9, -tl, 0); c.quadraticCurveTo(-tl * 0.5, -rr * 0.9, 0, -rr); c.fill(); };
  c.fillStyle = '#A3E635'; drop(r + 1.5, tail + 2);
  c.fillStyle = '#0A0604'; drop(r, tail);
  c.fillStyle = '#3A2410'; c.beginPath(); c.arc(1, 2.5, r * 0.55, 0, Math.PI * 2); c.fill();
  // (the sheen across its front, a hard glint)
  c.fillStyle = '#C084FC'; c.fillRect(-2, -r + 2, 3, 2); c.fillStyle = '#22D3EE'; c.fillRect(1, -r + 2.5, 3, 2); c.fillStyle = '#FACC15'; c.fillRect(4, -r + 3.5, 2, 2);
  c.fillStyle = '#FFFFFF'; c.fillRect(2, -4, 2, 2);
  c.restore();
};

export const drawQueenFight = (c: Ctx, state: GameState, f: Fight) => {
  const fr = state.frame;
  // (the puddles she's leaked, stood about)
  for (const s of f.spots) puddle(c, s.x, s.r * Math.min(1, s.t / 40), Math.min(1, (SPOT_LIFE - s.t) / 120), fr, s.x);
  // (the oil slicks on the floor where her barf came down: glossy black puddles, sheen, a sizzle)
  for (const s of f.slicks) {
    const a = Math.min(1, (SLICK_LIFE - s.t) / 120);
    puddle(c, (s.x1 + s.x2) / 2, (s.x2 - s.x1) / 2, a, fr, s.x1);
  }
  // (where it's coming down, marked from her crouch on: a sick green ring on the floor, flashing, a skull-ish blot in
  // the middle; and under each drop on its way down, its shadow, growing as it comes)
  for (const b of f.barf) {
    if (b.let && b.due === 0 && b.landed >= BARF_DROPS) continue;
    const on = fr % 10 < 5, hw = BARF_W / 2;
    c.strokeStyle = on ? '#BEF264' : '#65A30D'; c.lineWidth = 3;
    c.setLineDash([8, 6]); c.lineDashOffset = -fr * 0.5;
    c.beginPath(); c.ellipse(b.x, GY - 2, hw, 7, 0, 0, Math.PI * 2); c.stroke();
    c.setLineDash([]);
    c.fillStyle = on ? 'rgba(190, 242, 100, 0.22)' : 'rgba(101, 163, 13, 0.14)'; c.beginPath(); c.ellipse(b.x, GY - 2, hw, 7, 0, 0, Math.PI * 2); c.fill();
    // (the drips sign: three drops)
    for (let i = -1; i <= 1; i++) { box(c, b.x + i * 12 - 2, GY - 22 - (i === 0 ? 6 : 0), 4, 6, on ? '#A3E635' : '#4D7C0F'); box(c, b.x + i * 12 - 1, GY - 24 - (i === 0 ? 6 : 0), 2, 2, on ? '#A3E635' : '#4D7C0F'); }
  }
  for (const d of f.drops) {
    const k = Math.max(0, Math.min(1, 1 - (GY - d.y) / 500));
    c.fillStyle = `rgba(0, 0, 0, ${(0.25 + 0.45 * k).toFixed(2)})`; c.beginPath(); c.ellipse(d.tx, GY - 1, 4 + 8 * k, 2 + 2 * k, 0, 0, Math.PI * 2); c.fill();
  }
  for (const s of f.sacs) drawSac(c, s.x, s.y, state.frame, s.landed > 10 ? Math.min(1, (s.landed - 10) / 16) : 0);
  // (what's come off her: the splashes, the pieces)
  drawSplats(c, f.splats);
  if (f.mode === 'dead' && f.endo) {
    // (her plain death: burning, the skeleton, the lunge, the heap)
    drawEndo(c, f.endo, f, state.frame, { pose: 'stunned', t: state.frame, ext: f.ext, alive: Math.max(0, 1 - f.deathT / 60), beat: 1, free: true, dents: f.dents });
  } else if (f.blown && f.deathT < BURST_AT) {
    // (her weakness death: coming apart at every seam at once, in slow motion (split.ts); smoothed between the game
    // frames the slow motion holds, so it creeps rather than steps)
    const tS = f.deathT + (f.slow ? f.slow.acc : 0);
    drawSplit(c, f.x, f.facing, f.ext, tS, f.total - f.deathT, { pose: 'stunned', t: state.frame, ext: f.ext, alive: 1, beat: Math.max(0, 1 - f.hp / HP), free: true, dents: f.dents }, state.frame);
  } else if (f.down > 0 && !f.blown) {
    const blink = f.iframes > 0 && Math.floor(state.frame / 3) % 2 === 0 && f.mode !== 'dead';
    if (blink) c.globalAlpha = 0.65;
    const dy = -420 * (1 - f.down) - f.y, sx = f.mode === 'intro' && f.step === 'shake' ? Math.sin(state.frame * 1.3) * 6 : 0;
    const crouch = f.mode === 'leap' && f.ph !== 'air' ? 0.9 : 1;
    c.save(); c.translate(sx, dy);
    c.translate(f.x, GY); c.scale(1, crouch); c.translate(-f.x, -GY);
    const qd = { pose: poseOf(f), t: state.frame, ext: f.ext, alive: f.mode === 'dead' ? Math.max(0, 1 - f.deathT / 60) : f.alive, beat: Math.max(0, 1 - f.hp / HP), free: true, foam: f.foam, foamShed: f.mode === 'intro' && f.step === 'shake', stride: f.mode === 'skitter' ? f.stride : 0, dents: f.dents };
    drawQueen(c, f.x, f.facing, qd);
    // (a mallet hit: she flashes, lit up over herself)
    if (f.flash > 8 && f.mode !== 'dead') { c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(1, (f.flash - 8) / 8) * 0.8; drawQueen(c, f.x, f.facing, qd); drawQueen(c, f.x, f.facing, qd); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; }
    c.restore();
    if (blink) c.globalAlpha = 1;
  }
  drawPieces(c, f.pieces, state.frame);
  if (f.suds.length) drawSuds(c, f.suds);
  // (the flail's tell: her reach marked on the floor, red, flashing)
  if (f.mode === 'flail' && f.ph === 'tell') box(c, f.x - FLAIL_WIDE, GY - 3, FLAIL_WIDE * 2, 3, f.t % 6 < 3 ? '#EF4444' : '#7F1D1D');
  // (the impregnator ray: pink rings down out of the DJ booth into her belly)
  if (f.beam > 0) {
    const sx = BOOTH.x + BOOTH.w / 2, sy = BOOTH.y + BOOTH.h, tx = f.x, ty = GY - 150;
    for (let i = 0; i < 9; i++) { const k = ((i / 9) + state.frame * 0.035) % 1; c.strokeStyle = `rgba(244, 114, 182, ${(0.85 * f.beam * (1 - k * 0.4)).toFixed(2)})`; c.lineWidth = 3; c.beginPath(); c.ellipse(sx + (tx - sx) * k, sy + (ty - sy) * k, 8 + k * 16, 12 + k * 20, 0.4, 0, Math.PI * 2); c.stroke(); }
  }
  // (the motor oil in the air)
  for (const d of f.drops) gob(c, d.x, d.y, d.vx, d.vy, fr);
  drawKinShots(c, fr);
  // (the booth's spotlight: its spot marked on the floor, flashing; then down out of the rig)
  if (f.can) {
    const cn = f.can;
    if (cn.t < DROP_TELL + DROP_FALL) {
      const k = Math.min(1, cn.t / 12), red = cn.t % 8 < 4 ? '#EF4444' : '#7F1D1D';
      c.strokeStyle = red; c.lineWidth = 3; c.beginPath(); c.ellipse(cn.x, GY - 2, DROP_R * k, 6 * k, 0, 0, Math.PI * 2); c.stroke();
      box(c, cn.x - 2, GY - 8, 4, 6, red);
      if (cn.t >= DROP_TELL) {
        const y = GY - 560 + ((cn.t - DROP_TELL) / DROP_FALL) * 540;
        limb(c, cn.x, GY - 600, cn.x, y - 30, 2, '#52525B');
        ink(c, () => c.roundRect(cn.x - 18, y - 34, 36, 30, 4), '#27272A', 1.5);
        box(c, cn.x - 14, y - 6, 28, 6, '#FDE047'); box(c, cn.x - 18, y - 34, 36, 3, '#71717A');
      }
    } else {
      // (smashed on the floor)
      box(c, cn.x - 22, GY - 10, 44, 10, '#27272A'); box(c, cn.x - 16, GY - 12, 10, 4, '#FDE047'); box(c, cn.x + 6, GY - 8, 12, 3, '#E2E8F0');
    }
  }
  // (the extinguisher: on the wall, in his hands, in the air at her)
  if (f.ext2 === 'wall' || f.ext2 === 'air') { c.save(); c.translate(f.ext2 === 'wall' ? EXTINGUISHER_X : f.ex.x, f.ext2 === 'wall' ? GY - 110 : f.ex.y); c.rotate(f.ex.r); ink(c, () => c.roundRect(-7, -18, 14, 34, 4), '#DC2626'); box(c, -5, -15, 3, 29, '#F87171'); box(c, -4, -13, 1, 22, '#FECACA'); box(c, 3, -15, 3, 29, '#991B1B'); box(c, -6, 12, 12, 3, '#7F1D1D'); box(c, -5, -20, 10, 3, '#A1A1AA'); box(c, -5, -20, 10, 1, '#F4F4F5'); box(c, -4, -24, 8, 5, '#18181B'); box(c, -3, -24, 6, 1, '#71717A'); box(c, 2, -23, 10, 3, '#18181B'); box(c, 3, -23, 8, 1, '#71717A'); box(c, -2, -27, 4, 3, '#3F3F46'); c.strokeStyle = '#05020B'; c.lineWidth = 2; c.beginPath(); c.moveTo(-3, -22); c.quadraticCurveTo(-12, -14, -9, 6); c.stroke(); box(c, -11, 5, 4, 5, '#18181B'); box(c, -5, -6, 10, 7, '#F8FAFC'); box(c, -5, -6, 10, 1, '#FFFFFF'); box(c, -4, -4, 8, 1, '#B91C1C'); box(c, -4, -2, 6, 1, '#52525B'); c.restore(); }
};
/** Her words; theirs, up in the booth. */
export const drawQueenSaid = (c: Ctx, f: Fight) => {
  // (in pieces: out of her head, wherever it's ended up)
  const hd = f.blown ? headPiece(f.pieces) : null;
  if (f.said && hd) saidAt(c, f.said, Math.max(ARENA_L + 140, Math.min(ARENA_R - 140, hd.x)), hd.y - 50, '#BEF264');
  else if (f.said) saidAt(c, f.said, f.x - f.facing * 20, GY - 330 - f.y, '#BEF264');
  if (f.boothSaid) saidAt(c, f.boothSaid, BOOTH.x + BOOTH.w / 2, BOOTH.y - 20, '#D9F99D');
};
/** Said over a point, the words their full size even with the camera pulled back (her death: discoZoom). */
const saidAt = (c: Ctx, text: string, x: number, y: number, col: string) => {
  const z = c.getTransform().a / (c.canvas.width / CANVAS_WIDTH);
  if (z >= 0.99) { saidOver(c, text, x, y, col, 260); return; }
  c.save(); c.translate(x, y); c.scale(1 / z, 1 / z);
  saidOver(c, text, 0, 0, col, 260);
  c.restore();
};
/** Screen space: her bar, in the top band clear of the HUD. */
export const drawFightHud = (c: Ctx, f: Fight, band: { x1: number; x2: number; mid: number }, inCutscene: boolean) => {
  if (inCutscene || f.mode === 'dead' || f.mode === 'intro' || f.mode === 'wait') return;
  const w = band.x2 - band.x1, k = Math.max(0, f.hp / HP);
  box(c, band.x1, 22, w, 14, '#18181B'); box(c, band.x1 + 2, 24, (w - 4) * k, 10, f.iframes > 0 && Math.floor(f.iframes / 4) % 2 ? '#D9F99D' : '#65A30D');
  // (the chunk a mallet hit just took off her: flashing white and yellow where it was, then gone)
  if (f.barT > 0 && f.barFrom > f.hp) {
    const k0 = Math.min(1, f.barFrom / HP), x = band.x1 + 2 + (w - 4) * k;
    c.globalAlpha = Math.min(1, f.barT / 20);
    box(c, x, 24, (w - 4) * (k0 - k), 10, Math.floor(f.barT / 3) % 2 ? '#FFFFFF' : '#FDE047');
    c.globalAlpha = 1;
  }
  label(c, 'THE QUEEN (LEGALLY DISTINCT)', band.mid, 50, '#D9F99D', 7);
};
