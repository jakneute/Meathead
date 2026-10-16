// HELICOPTER HARRY, the fight (the user's design). Every number that matters is up top, to tune.
//
//   THE INTRO   (a cutscene, skippable, all of it; no HUD) In through the gate, it slams shut. Harry comes down on the
//               ride's emergency jetpack, green (he left his AIRSICK PILLS in the helicopter: the weakness, planted),
//               rips the flight jacket, the tie-dye and the helmet off: jacked, a bandana, an M60. Meathead's impressed.
//               Harry's rant (the act's gone all the way: "DAMN FOREIGNERS"), Meathead taken aback ("I LIKED YOU
//               BETTER WHEN YOU WERE A PUSSY HIPPIE, AND THAT VERSION OF YOU REALLY SUCKED."), and Harry calls her up
//               out of the dig: THE STATUE OF LIBERTY ("A REAL AMERICAN MONUMENT."). Invulnerable; only her head and
//               upper body in the shot.
//   HIS MOVES   WALK: slowly at him, the machine gun going head on in bursts (jump them, duck them, slide under
//               them). THE CROWN: up into her crown's window to call a smash: the long,
//               heavy windup (her fist up over him, a shadow on the floor following him, locking, glowing), down, and
//               it's STUCK (the Wolverine-sentinel parody): her fist planted on the floor (it only hurts landing; then
//               no collision at all: the user's) while she strains at it; he's down out of the crown ranting ("YOU'RE USELESS
//               NOW", angrier every time: "SHE'S DUMB AT FIGHTING THINGS MUCH SMALLER THAN HER") and walking him down
//               till she yanks it free; then the crown again. THE WALLS (Contra): up a scaffold tower, then SWEEP 1
//               (across to the far wall and rotating slowly down to his own feet: safe only right under him) or
//               SWEEP 2 (straight down and arcing up across the floor and up the far wall: get to the far end and
//               uppercut at the last moment).
//   HURTING HIM Meathead's moves and the ray gun in full; anything else 35% (every land boss's way); the 60-frame
//               breather after each hit. No instant kills. His WEAKNESS (opted in: weapons/crossbow.ts setDartTaker,
//               over the "no puke on bosses" rule) is the PLAGUE CROSSBOW: the darts barely scratch him, but enough of
//               them and he's airsick: he barfs on her; she snaps up standing (her stuck arm yanked free if it was),
//               gags, and barfs her concrete guts on him: a HEAVY hit. Then, covered and furious, he's straight up into
//               her crown for a smash, quicker every time (that's what stops him being sick-spammed: the meter stays
//               shut till it's landed).
//
// Two deaths, each followed by the same beat. The weakness (her concrete's what does it; the kill cam): buried in it,
//   face down, just his socks and sandals sticking out of the mound, kicking, setting. Any other way: on his back, the
//   M60 still going straight up, its recoil spinning him round and round on the slab like a breakdancing turtle till
//   it clicks empty (his jeans split: tie-dye underpants). THEN, either way (the user's): she's heartbroken (a concrete
//   tear, sobbing), lets the torch go, drops the tablet, brings out a statue-sized revolver, puts it to her head, and
//   blows her concrete brains out (no gore: concrete, rebar, dust); over backward into the dig. Meathead's word.
// HER WEAR (the user's): each smash cracks her more; her STATUE_LIFE-th, she comes apart into the dig. Then no crown, no
//   smash, no suicide after; Harry enraged (faster, the walls more often); the crossbow's sickness is grief and
//   airsickness, doubled over puking on the floor, wide open; and his third death: BARFED TO DEATH.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Block, Enemy, EnemyKind } from '../../../m1/types';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { say, silenceAll, pickLine } from '../../../m1/game/platform/speech';
import { harrySaid, harryPick, harryPool } from '../heli/talk';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { ENEMY_HIT_COOLDOWN, CANVAS_WIDTH, CANVAS_HEIGHT, BULLET_DAMAGE, BOSS_CHARGE_DAMAGE, BOSS_UPPERCUT_DAMAGE } from '../../../m1/constants';
import { registerM2Kind } from '../../kinds';
import { keepForRevisits } from '../../store';
import { setDartTaker } from '../../weapons/crossbow';
import { TOO_BIG_BY_KIND } from '../../lines/weaponLines';
import { box, label, saidOver, hands, speak, voice, meatheadSays, landVisit } from '../section';
import { registerHurts } from '../pavilion';
import { drawHarry, TIEDYE } from '../heli/harryArt';
import {
  GY, VIEW_X, ARENA_L, ARENA_R, MID, CAM_ROW, CLING_H, CLING_IN, CROWN, CROWN_SCALE, WINDOW, LIB, FIST_UP, FIST_W, FIST_H, sy,
} from './arena';
import { drawRambo, mouthAt, muzzleAt, type RamboPose } from './rambo';
import { drawLibertyBody, drawArm, drawChunk, drawRubble, drawRevolverAt, drawTorchAt, CONC, PUKE, type Face, type LibLook, type Stain } from './liberty';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;

// ---------------------------------------------------------------------------------------------------------------
// The numbers (tune here)

/** His health (the land bosses'), and the enemy's (never runs out: the hits come off ours). */
const HP = 666, BIG = 100000;
/** Anything but the ray gun and his moves: this share; the breather after a hit. */
const SHARE = 0.35, IFRAMES = ENEMY_HIT_COOLDOWN;
/** A dart: its scratch (never the last of him: only her concrete or a real hit kills), how many make him sick, how
 *  long unhit before the queasiness starts going off, and how fast. */
/** (the user: "harry takes more shots to make queasy too": 7 -> 10, with her or without) */
const QUEASY_DARTS = 10;
const DART_DMG = 2, SICK_AT = QUEASY_DARTS, SICK_COOL = 150, SICK_DECAY = 0.008;
/** Her concrete on him (the weakness's hit). Its splash on the floor round him (and what it does to Meathead). */
const HEAVY = 150, SPLASH_R = 120, SPLASH_DMG = 18;
/** Walking at him: how fast, how close he comes, how long a walk lasts (the stuck arm's walk lasts till she's up). */
const WALK_V = 0.8, WALK_NEAR = 170, WALK_T = 320;
/** The machine gun (head on): a burst's rounds, the frames between them, the rest after; a round's speed and hurt. */
// (a burst's 5 rounds 4 frames apart: 20 frames of stream past any one spot. A full jump keeps his feet over chest
// height for ~36 frames (jump speed 7 held 15 frames, gravity 0.65), so one jump clears a whole burst, with room: the
// user's "so you can safely hop over them with a single jump". The beat between bursts as it was.)
const BURST_N = 5, BURST_GAP = 4, BURST_REST = [0, 50, 42, 34], ROUND_V = 10, ROUND_DMG = 9;
/** On a wall: his feet's height, the laser sight's warning, the sweeps' lengths, a round every so many frames, its
 *  speed and hurt; sweep 1 ends this far out from his wall (safe inside it); sweep 2 ends this high up the far wall. */
const CLING_WARN = 52, SWEEP_T = [0, 170, 196], SWEEP_EVERY = 3, SWEEP_V = 16, SWEEP_DMG = 10, SAFE_IN = 74, SWEEP2_TOP = 170;
/** The smash: the windup (long, slower than anything: quicker each time she's barfed on him, to a cap), tracking him
 *  the first share of it; the drop; its hurt; how long it's stuck; the yank free. */
const WIND = 168, TRACK = 0.7, DROP_T = 12, FIST_DMG = 32, STUCK_T = 400, YANK_T = 44, SNAP_T = 14, SPEED_UP = 0.25, SPEED_MAX = 2.4;
/** Harry's taunts; Meathead thinking out loud about the crossbow. */
const TAUNT_EVERY = 760, HINT_GAP = 600;
/** Her wear (the user: "if the statue of liberty smashes enough times it will crumble and fall apart"): smashes she
 *  survives (the last one's her end: she comes apart while it's stuck); the collapse's length. */
const STATUE_LIFE = 6, CRUMBLE_T = 170;
/** Him without her, enraged: his walk this much faster, his gun's rests this much shorter, his walks this much
 *  shorter (so the walls come round more often). */
const RAGE_WALK = 1.35, RAGE_REST = 0.65, RAGE_WALK_T = 0.55;
/** The crossbow without her: he doubles over puking (grief and airsickness) this long, losing this much to it, every
 *  hit in it this much at least (the weakness's window). */
const GRIEF_T = 200, GRIEF_DRAIN = 60, GRIEF_HIT = 75;

// ---------------------------------------------------------------------------------------------------------------
// The state

type Act =
  | 'idle' | 'walk' | 'leap' | 'crown' | 'cling'
  | 'drop' | 'heave' | 'spew' | 'await' | 'concreted';
type Move = 'walk' | 'crown' | 'cling' | 'stuckWalk';
type ArmSt = 'hidden' | 'rise' | 'up' | 'wind' | 'drop' | 'stuck' | 'yank' | 'snap';
type Intro = 'land' | 'queasy' | 'rip' | 'flex' | 'impressed' | 'rant' | 'aback' | 'summon' | 'rise' | 'monument';

interface Leap { x0: number; y0: number; x1: number; y1: number; t: number; T: number; h: number; then: Act; s0: number; s1: number }
interface Round { x: number; y: number; vx: number; vy: number; src: string; dmg: number; life: number; harmless?: boolean }
interface Chunk { x: number; y: number; vx: number; vy: number; a: number; va: number; s: number; green: boolean; down: boolean }
interface Barf { stage: 'drop' | 'heave' | 'spew' | 'gag' | 'pour' | 'daze' | 'grief'; t: number; hit: boolean; splashed: boolean; first: boolean }
type How = 'spin' | 'buried' | 'barfed';
interface Death {
  how: How; t: number; step: string; at: number;
  x: number; y: number; vy: number; spin: number; spinV: number; mound: number;
  /** Her: which beat, its clock. */
  st: string; stT: number; fade: number;
  /** His last words are done. */
  lineDone: boolean;
}
interface KillCam { t: number; acc: number; z: number; out: boolean }

export interface Fight {
  mode: 'intro' | 'on' | 'dead'; t: number; total: number;
  /** A retry's entrance beat (frames left): he poses and taunts, doesn't fire, before it's on (the user's). */
  entrance: number;
  hp: number; iframes: number; flash: number;
  /** Harry: his feet, which way he faces, what he's at (and how long), the gun's angle, a round going off. */
  hx: number; hy: number; facing: 1 | -1; act: Act; actT: number; aim: number; firing: boolean; moving: boolean; scale: number;
  /** In the crown: the smash called. */
  called: boolean;
  leap: Leap | null;
  move: Move; moveT: number; queue: Move[]; burst: number; burstT: number;
  cling: { side: 1 | -1; kind: 1 | 2; a0: number; a1: number; t: number; fired: boolean } | null; clingKind: 1 | 2;
  /** How many times she's been stuck (his rants get angrier), barfed on him (the smash gets quicker). */
  stuckN: number; barfs: number;
  /** The plague crossbow: how queasy (darts), the last one's frame, being sick (the whole cycle), said it once. */
  sick: number; sickAt: number; sickOn: boolean; sickFirst: boolean; barf: Barf | null;
  green: number; concrete: number;
  /** Her: risen (dy), the arm (its state, clock, the target, the fist, the block it leaves), her face and the rest. */
  arm: { st: ArmSt; t: number; T: number; tx: number; fx: number; fy: number; from: { x: number; y: number }; block: Block | null };
  lib: { dy: number; face: Face; shake: number; stains: Stain[]; tear: number; broken: number; hand: { x: number; y: number }; tablet: boolean; gun: boolean; tilt: number; gone: boolean; wear: number };
  /** Her smashes so far; her collapse (frames into it, -1: not); she's gone (crumbled: him enraged). */
  smashes: number; crumble: number; crumbled: boolean;
  /** His own puke on the floor (the grief puke). */
  puddle: { x: number; k: number } | null;
  rounds: Round[]; chunks: Chunk[]; piles: { x: number; k: number }[];
  /** On the floor after: the torch she let go, the gun (falling, then lying). */
  torch: { x: number; y: number; vy: number; a: number; down: boolean } | null;
  gunDrop: { x: number; y: number; vy: number; a: number; down: boolean } | null;
  e: Enemy; moveSeen: number | undefined;
  said: string | null;
  wrongN: number; hintAt: number; lowSaid: boolean; tauntT: number; gloatAt: number; lastHp: number;
  intro: Intro; introT: number; skipT: number; ripped: boolean; jet: boolean;
  death: Death | null; deathSaid: number; cam: KillCam | null;
  walls: Block[];
}

/** The fight going on now (the crossbow's hook looks at it). */
let live: Fight | null = null;
let game: GameState | null = null;
const pants = (): 'clean' | 'shitty' | 'nude' => (!game ? 'clean' : isNude(game) ? 'nude' : isShat(game) ? 'shitty' : 'clean');
export const resetFight = () => { live = null; };
/** Seen the intro this visit (a retry from the checkpoint skips it); said once a visit. */
let introVisit = -1, stuckSaidVisit = -1, concreteSaidVisit = -1, griefSaidVisit = -1;
export const introSeen = () => introVisit === landVisit();

registerHurts(L.HURT);

// ---------------------------------------------------------------------------------------------------------------
// Harry, the enemy (the engine's: for the hits; drawn here)

const HARRY_KIND = 'm2:fl_harry' as const;
registerM2Kind({
  kind: HARRY_KIND,
  stats: { w: 44, h: 96, hp: BIG, contact: 0, mass: 260, air: true },
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y, harmless: true }),
  gender: 'm', humanoid: true, grab: 'none', midBoss: true,
  head: { x: 2, y: -90, r: 12 },
  draw: () => {},
  ai: () => true,
});
TOO_BIG_BY_KIND[HARRY_KIND] = L.GRAB_HARRY;

// The weakness: the darts are his fight's (the user's opt-in)
setDartTaker(HARRY_KIND, (ctx) => { const f = live; if (f && f.mode === 'on') darted(ctx, f); return true; });

// ---------------------------------------------------------------------------------------------------------------
// Saying things (one at a time; words only while said)

let token = 0;
const tokened = (fn: () => void) => { const tok = token; return () => { if (tok === token) fn(); }; };
const quiet = (f: Fight) => !f.said;
/** Harry says it (waits its turn). */
const harrySays = (f: Fight, text: string | null, onDone?: () => void) => {
  const tok = token;
  // (no line left he hasn't said this life: quiet, and on with what comes next)
  if (text === null) { onDone?.(); return; }
  harrySaid.add(text);
  speak(L.HARRY, text, s => { if (tok === token) f.said = s?.text ?? null; }, true, () => { if (tok === token) onDone?.(); });
};
const harryLine = (f: Fight, lines: L.ByPants, onDone?: () => void) => harrySays(f, harryPick(harryPool(lines, pants())), onDone);
/** A bark: dropped if somebody's talking. */
const bark = (f: Fight, lines: L.ByPants) => {
  if (!quiet(f)) return;
  const text = harryPick(harryPool(lines, pants()));
  if (text === null) return;
  harrySaid.add(text);
  say(text, voice(L.HARRY), 'casual', {
    always: true,
    onShow: spoken => { f.said = text; if (!spoken) setTimeout(() => { if (f.said === text) f.said = null; }, Math.max(1600, text.length * 65)); },
    onHide: () => { if (f.said === text) f.said = null; },
  });
};

// ---------------------------------------------------------------------------------------------------------------
// Starting

const pmid = (state: GameState) => ({ x: state.player.pos.x + state.player.width / 2, y: state.player.pos.y + state.player.height / 2 });
const HAND_TABLET = { x: LIB.x + 200, y: sy(440) };
const HARRY_START = MID + 190;
/** Where her torch and her gun come down on the floor (and lie on revisits: scene.ts). */
export const TORCH_X = MID - 240, GUN_X = MID + 144;

export const startFight = (state: GameState): Fight => {
  game = state; token++;
  const e = makeKindEnemy(HARRY_KIND as EnemyKind, HARRY_START, GY);
  e.facing = -1; e.seen = true;
  const seen = introSeen();
  const f: Fight = {
    mode: 'intro', t: 0, total: 0, entrance: 0, hp: HP, iframes: 0, flash: 0,
    hx: HARRY_START, hy: seen ? GY : sy(-80), facing: -1, act: 'idle', actT: 0, aim: 0, firing: false, moving: false, scale: 1, called: false,
    leap: null, move: 'walk', moveT: 0, queue: ['walk', 'crown'], burst: 0, burstT: 30,
    cling: null, clingKind: 1, stuckN: 0, barfs: 0,
    sick: 0, sickAt: -999, sickOn: false, sickFirst: false, barf: null, green: 0, concrete: 0,
    arm: { st: seen ? 'up' : 'hidden', t: 0, T: 0, tx: MID, fx: FIST_UP.x, fy: FIST_UP.y, from: { ...FIST_UP }, block: null },
    lib: { dy: seen ? 0 : LIB.sink, face: 'stern', shake: 0, stains: [], tear: 0, broken: 0, hand: { ...HAND_TABLET }, tablet: true, gun: false, tilt: 0, gone: false, wear: 0 },
    smashes: 0, crumble: -1, crumbled: false, puddle: null,
    rounds: [], chunks: [], piles: [], torch: null, gunDrop: null,
    e, moveSeen: e.hitByMove, said: null,
    wrongN: 0, hintAt: -9999, lowSaid: false, tauntT: 0, gloatAt: -999, lastHp: state.player.health,
    intro: 'land', introT: 0, skipT: 0, ripped: seen, jet: !seen,
    death: null, deathSaid: 0, cam: null, walls: [],
  };
  f.e.health = BIG; f.e.maxHealth = BIG;
  live = f;
  playSound('clang', 1, -6); playSound('slam', 0.8, -4); shakeScreen(state, 6, 3);
  // (a retry: straight in, but a beat for his entrance first: the user: "give a beat for him to make his entrance
  // before you can take damage")
  if (seen) { beginFight(state, f); f.entrance = 105; return f; }
  state.player.inCutscene = true;
  return f;
};

/** On: out of the cutscene, Harry in the world. */
const beginFight = (state: GameState, f: Fight) => {
  token++; introVisit = landVisit();
  f.said = null;
  state.cameraOverride = null;
  const p = state.player;
  p.inCutscene = false; p.isDucking = false;
  f.mode = 'on'; f.ripped = true; f.jet = false; f.green = 0; f.hy = GY; f.hx = HARRY_START; f.act = 'idle'; f.actT = 0;
  f.lib.dy = 0; f.arm.st = 'up'; f.arm.fx = FIST_UP.x; f.arm.fy = FIST_UP.y; f.lib.shake = 0;
  f.move = 'walk'; f.moveT = 0; f.act = 'walk'; f.aim = 0; f.queue = ['crown']; f.burstT = 40;
  if (!state.enemies.includes(f.e)) state.enemies.push(f.e);
};

// ---------------------------------------------------------------------------------------------------------------
// The intro

const holdCam = (state: GameState) => {
  state.cameraOverride = { x: VIEW_X, y: GY - CAM_ROW };
  state.camera.x = VIEW_X; state.camera.y = GY - CAM_ROW;
};

const intro = (ctx: FrameContext, f: Fight): Controls => {
  const { state } = ctx, p = state.player;
  f.introT++; f.skipT++;
  p.inCutscene = true; p.vel.x = 0; p.facing = 1;
  holdCam(state);
  if (f.skipT > SKIP_AFTER) offerSkip();
  if (f.skipT > SKIP_AFTER && takeSkip()) { silenceAll(); state.playerVulgarityTimer = 0; beginFight(state, f); return hands(); }
  const t = f.introT, fr = state.frame;
  // (her arm up with the torch, in her own frame: drawn with her till she's risen)
  f.arm.fx = FIST_UP.x; f.arm.fy = FIST_UP.y;
  const next = (i: Intro) => { f.intro = i; f.introT = 0; };
  switch (f.intro) {
    case 'land': {
      // (down out of the smoke on the jetpack, onto the slab; it sputters out)
      const u = Math.min(1, t / 80);
      f.hy = sy(-80) + (GY - sy(-80)) * (1 - (1 - u) * (1 - u));
      f.facing = -1;
      if (t % 10 === 0 && u < 1) playSound('whoosh', 0.3, 6);
      if (t === 80) { playSound('thud', 1, -6); playSound('land', 0.8, -4); shakeScreen(state, 6, 3); puff(state, f.hx, GY, 10, CONC[4]); }
      if (t === 100) { playSound('dry_flame', 0.7, 0); f.jet = false; puff(state, f.hx - 14, GY - 50, 8, '#57534E'); }
      if (t >= 120) { next('queasy'); playSound('retch', 0.4, 4); harryLine(f, L.HARRY_QUEASY, tokened(() => next('rip'))); f.green = 0.6; }
      break;
    }
    case 'queasy': break;
    case 'rip':
      if (t === 1) harryLine(f, L.HARRY_RIP, tokened(() => {
        // (the rip: the jacket, the tie-dye, the helmet, in shreds; the flex)
        f.ripped = true; f.green = 0;
        playSound('crack', 1, -2); playSound('whoosh', 1, -6); playSound('punch', 0.7, -8); shakeScreen(state, 8, 4);
        for (let i = 0; i < 36; i++) state.particles.push({ pos: { x: f.hx + (Math.random() - 0.5) * 30, y: GY - 50 - Math.random() * 30 }, vel: { x: (Math.random() - 0.5) * 9, y: -2 - Math.random() * 6 }, life: 50 + Math.random() * 30, color: i % 3 ? TIEDYE[i % TIEDYE.length] : '#4B5A2C', size: 3 + Math.random() * 4, grav: 0.25 });
        state.particles.push({ pos: { x: f.hx, y: GY - 96 }, vel: { x: 4, y: -7 }, life: 70, color: '#F8FAFC', size: 9, grav: 0.3 });
        next('flex');
      }));
      break;
    case 'flex':
      if (t % 20 === 1) playSound('stomp', 0.3, 8);
      if (t >= 70) { next('impressed'); meatheadSays(state, pick(L.MH_IMPRESSED), true, tokened(() => next('rant'))); }
      break;
    case 'impressed': break;
    case 'rant':
      if (t === 1) harryLine(f, L.HARRY_RANT, tokened(() => next('aback')));
      break;
    case 'aback':
      if (t === 1) meatheadSays(state, L.MH_ABACK, true, tokened(() => next('summon')));
      break;
    case 'summon':
      if (t === 1) harryLine(f, L.HARRY_SUMMON, tokened(() => { next('rise'); playSound('rumble', 1, -10); }));
      break;
    case 'rise': {
      // (up out of the dig behind the floor: the ground shaking, dust off the berm the whole way)
      const u = Math.min(1, t / 170);
      f.lib.dy = LIB.sink * (1 - (u * u * (3 - 2 * u)));
      f.lib.shake = u < 1 ? 2 : 0;
      shakeScreen(state, 3, 2);
      if (t % 30 === 0 && u < 1) playSound('rumble', 0.8, -8 + Math.random() * 2);
      if (t % 4 === 0 && u < 1) puff(state, VIEW_X + 100 + Math.random() * 600, sy(440), 2, '#A8A29E');
      if (t === 170) { playSound('crash', 1, -10); playSound('thud', 1, -12); shakeScreen(state, 14, 8); next('monument'); harrySays(f, L.HARRY_MONUMENT, tokened(() => beginFight(state, f))); }
      break;
    }
    case 'monument': break;
  }
  if (f.mode !== 'intro') return hands();
  void fr;
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame

const phase = (f: Fight) => (f.hp > HP * 0.66 ? 1 : f.hp > HP * 0.33 ? 2 : 3);
const setAct = (f: Fight, a: Act) => { f.act = a; f.actT = 0; };
const speed = (f: Fight) => Math.min(SPEED_MAX, 1 + f.barfs * SPEED_UP);
const fistBox = (f: Fight) => (f.arm.block ? { x0: f.arm.block.x, x1: f.arm.block.x + f.arm.block.w, y0: f.arm.block.y, y1: GY } : null);

export const updateFight = (ctx: FrameContext, f: Fight, controls: Controls): Controls => {
  const { state } = ctx;
  live = f; game = state;
  f.total++;
  updateChunks(f);
  if (f.mode === 'intro') { const out = intro(ctx, f); sync(state, f); return out; }
  f.t++;
  if (f.iframes > 0) f.iframes--;
  if (f.flash > 0) f.flash--;
  updateRounds(ctx, f);
  if (f.mode === 'dead') return dying(ctx, f);
  takeHits(ctx, f);
  if (f.hp <= 0) { die(ctx, f, f.barf?.stage === 'grief' ? 'barfed' : 'spin'); return hands(); }
  // (the queasiness going off, unhit a while)
  if (!f.sickOn && f.total - f.sickAt > SICK_COOL) f.sick = Math.max(0, f.sick - SICK_DECAY);
  f.green += ((f.sickOn ? 1 : Math.min(1, f.sick / SICK_AT) * 0.6) - f.green) * 0.08;
  if (!f.barf || f.barf.stage !== 'pour') f.concrete = Math.max(0, f.concrete - 0.0025);
  // (sick: as soon as he's somewhere it can start from)
  if (!f.sickOn && f.sick >= SICK_AT && !f.leap && f.arm.st !== 'drop' && f.crumble < 0) startBarf(state, f);
  // (his entrance on a retry: flexing, a taunt, nothing fired, her arm at rest; Meathead's free to move)
  if (f.entrance > 0) {
    f.entrance--; f.act = 'idle'; f.firing = false; f.moving = false; f.rounds = [];
    if (f.entrance === 100) bark(f, L.HARRY_TAUNT);
    sync(state, f);
    return controls;
  }
  if (f.barf) barfing(ctx, f); else harry(ctx, f);
  // (her concrete's just killed him: the death's begun)
  if (f.mode !== 'on') return hands();
  statue(ctx, f);
  if (f.mode === 'on' && f.hp < HP * 0.25 && !f.lowSaid && quiet(f)) { f.lowSaid = true; harryLine(f, L.HARRY_LOW); }
  // (Meathead hurt: a gloat now and then)
  const p = state.player;
  if (p.health < f.lastHp && p.health > 0 && f.total - f.gloatAt > 500 && Math.random() < 0.35) { f.gloatAt = f.total; bark(f, L.HARRY_GLOAT); }
  f.lastHp = p.health;
  if (++f.tauntT >= TAUNT_EVERY * (f.crumbled ? 0.6 : 1)) { f.tauntT = Math.floor(Math.random() * 200); bark(f, f.crumbled ? L.HARRY_ENRAGED : L.HARRY_TAUNT); }
  sync(state, f);
  return controls;
};

// ---------------------------------------------------------------------------------------------------------------
// Harry: his moves

const nextMove = (f: Fight): Move => {
  // (without her: no crown, no stuck arm; the walls more often)
  if (f.crumbled || f.crumble >= 0) { f.queue = f.queue.filter(m => m !== 'crown' && m !== 'stuckWalk'); if (!f.queue.length) f.queue = ['cling', 'walk', 'cling']; return f.queue.shift()!; }
  if (f.arm.st === 'stuck') return 'stuckWalk';
  if (!f.queue.length) f.queue = phase(f) >= 3 ? ['cling', 'cling', 'walk', 'crown'] : ['cling', 'walk', 'crown'];
  return f.queue.shift()!;
};

const leapTo = (f: Fight, x1: number, y1: number, T: number, h: number, then: Act, s1 = 1) => {
  f.leap = { x0: f.hx, y0: f.hy, x1, y1, t: 0, T, h, then, s0: f.scale, s1 };
  setAct(f, 'leap');
  playSound('jump', 0.8, -6);
};

/** Down to the floor from wherever he is, clear of the fist and over away from Meathead. */
const floorSpot = (state: GameState, f: Fight) => {
  const m = pmid(state).x, fb = fistBox(f);
  const cands = [ARENA_L + 120, MID - 160, MID + 160, ARENA_R - 120].filter(x => !fb || x < fb.x0 - 50 || x > fb.x1 + 50);
  return cands.sort((a, b) => Math.abs(b - m) - Math.abs(a - m))[0] ?? MID;
};

const startMove = (ctx: FrameContext, f: Fight, mv: Move) => {
  const { state } = ctx, m = pmid(state).x;
  if ((f.crumbled || f.crumble >= 0) && (mv === 'crown' || mv === 'stuckWalk')) mv = 'cling';
  f.move = mv; f.moveT = 0;
  if (mv === 'walk' || mv === 'stuckWalk') { setAct(f, 'walk'); f.burstT = 30; f.aim = 0; if (mv === 'walk' && Math.random() < 0.5) bark(f, L.HARRY_FIRE); return; }
  if (mv === 'crown') {
    f.called = false;
    leapTo(f, CROWN.x, CROWN.y, 50, 120, 'crown', CROWN_SCALE);
    return;
  }
  // (a wall: sweep 1 off the far one from him, sweep 2 off the near one)
  const kind = f.clingKind; f.clingKind = kind === 1 ? 2 : 1;
  const nearL = m < MID;
  const side: 1 | -1 = kind === 1 ? (nearL ? 1 : -1) : (nearL ? -1 : 1);
  const wx = side < 0 ? ARENA_L + CLING_IN : ARENA_R - CLING_IN;
  f.cling = { side, kind, a0: 0, a1: 0, t: 0, fired: false };
  leapTo(f, wx, GY - CLING_H, f.crumbled ? 36 : 46, 90, 'cling');
};

const harry = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, m = pmid(state);
  f.actT++; f.moveT++;
  f.firing = false;
  if (f.leap) {
    const l = f.leap; l.t++;
    const u = Math.min(1, l.t / l.T);
    f.hx = l.x0 + (l.x1 - l.x0) * u; f.hy = l.y0 + (l.y1 - l.y0) * u - Math.sin(u * Math.PI) * l.h;
    f.scale = l.s0 + (l.s1 - l.s0) * u;
    if (l.x1 !== l.x0) f.facing = l.x1 > l.x0 ? 1 : -1;
    if (u >= 1) {
      f.leap = null; setAct(f, l.then);
      if (l.then !== 'crown') { playSound('land', 0.8, -4); if (l.y1 >= GY) puff(state, f.hx, GY, 6, CONC[4]); }
      if (l.then === 'crown') harryLine(f, f.sickOn ? L.HARRY_FOLLOWUP : L.HARRY_CROWN);
      if (l.then === 'cling' && f.cling) { f.facing = (-f.cling.side) as 1 | -1; aimSweep(f); playSound('clang', 0.6, 4); bark(f, f.cling.kind === 1 ? L.HARRY_CLING_DOWN : L.HARRY_CLING_UP); }
      if (l.then === 'idle') { f.scale = 1; nextUp(ctx, f); }
    }
    return;
  }
  switch (f.act) {
    case 'idle':
      // (her coming apart: he stands and watches it, horrified)
      if (f.crumble >= 0) { setAct(f, 'await'); f.facing = f.hx < MID ? 1 : -1; break; }
      if (f.actT > (f.crumbled ? 10 : 20)) nextUp(ctx, f);
      break;
    case 'await':
      if (f.crumble < 0) setAct(f, 'idle');
      break;
    case 'walk': {
      f.facing = m.x < f.hx ? -1 : 1;
      const d = Math.abs(m.x - f.hx), fb = fistBox(f), was = f.hx;
      if (d > WALK_NEAR) {
        const nx = f.hx + f.facing * WALK_V * (phase(f) >= 3 ? 1.3 : 1) * (f.crumbled ? RAGE_WALK : 1);
        if (!fb || nx + 22 < fb.x0 || nx - 22 > fb.x1) f.hx = Math.max(ARENA_L + 30, Math.min(ARENA_R - 30, nx));
      }
      f.moving = f.hx !== was;
      gunBursts(state, f);
      // (done: a walk's time up; the stuck arm's walk once she's up again)
      if (f.move === 'walk' && f.moveT > WALK_T * (f.crumbled ? RAGE_WALK_T : 1) && f.burst === 0) setAct(f, 'idle');
      if (f.move === 'stuckWalk' && f.arm.st === 'up' && f.burst === 0) setAct(f, 'idle');
      break;
    }
    case 'crown':
      // (in her crown calling it; once it's stuck, the rant, then down)
      f.facing = m.x < f.hx ? -1 : 1;
      // (the smash called as soon as her arm's free to)
      if (!f.called && (f.arm.st === 'up' || f.arm.st === 'snap')) { f.called = true; windup(state, f); }
      if (f.arm.st === 'stuck' && f.arm.t > 70 && f.actT > 60) leapTo(f, floorSpot(state, f), GY, 46, 70, 'idle', 1);
      else if (f.called && f.arm.st === 'up' && f.actT > 120) leapTo(f, floorSpot(state, f), GY, 46, 70, 'idle', 1);
      break;
    case 'cling': sweep(ctx, f); break;
    default: break;
  }
};

/** What's next, now he's free: the stuck arm's walk while she's stuck, else the queue. */
const nextUp = (ctx: FrameContext, f: Fight) => { startMove(ctx, f, nextMove(f)); };

/** Head on: bursts out of the M60, at his chest's height, a little spray. */
const gunBursts = (state: GameState, f: Fight) => {
  if (f.burst > 0) {
    if (--f.burstT <= 0) {
      f.burstT = BURST_GAP; f.burst--;
      const a = (Math.random() - 0.5) * 0.1 + (state.player.isDucking || state.player.isSliding ? 0.05 : 0);
      f.aim = a;
      fire(state, f, 'walk', a, ROUND_V, ROUND_DMG, 'm2:fl_harry_gun');
      if (f.burst === 0) f.burstT = Math.round(BURST_REST[phase(f)] * (f.crumbled ? RAGE_REST : 1));
    }
    f.firing = true;
    return;
  }
  if (--f.burstT <= 0) { f.burst = BURST_N; f.burstT = 0; }
};

/** A round out of the muzzle (his pose, his aim). */
const fire = (state: GameState, f: Fight, pose: RamboPose, a: number, v: number, dmg: number, src: string, harmless = false) => {
  const mz = muzzleAt(pose, a, f.scale, f.facing);
  const vx = Math.cos(a) * v * f.facing, vy = Math.sin(a) * v;
  f.rounds.push({ x: f.hx + mz.x, y: f.hy + mz.y, vx, vy, src, dmg, life: 120, harmless });
  if (f.total % 2 === 0) playSound('lmg', 0.35, -2 + Math.random());
  state.particles.push({ pos: { x: f.hx + mz.x * 0.6, y: f.hy + mz.y + 4 }, vel: { x: -f.facing * (1 + Math.random() * 2), y: -2 - Math.random() * 2 }, life: 30, color: '#D97706', size: 2, grav: 0.3 });
};

/** On a wall: the sweep's angles off where he hangs. */
const aimSweep = (f: Fight) => {
  const c = f.cling!;
  const wall = c.side < 0 ? ARENA_L : ARENA_R, far = c.side < 0 ? ARENA_R : ARENA_L;
  // (the angle that puts the line through (tx, ty), from where the muzzle is at that angle: a few goes at it)
  const solve = (tx: number, ty: number, a: number) => {
    for (let i = 0; i < 6; i++) { const mz = muzzleAt('cling', a, 1, f.facing); a = Math.atan2(ty - (f.hy + mz.y), Math.abs(tx - (f.hx + mz.x))); }
    return a;
  };
  if (c.kind === 1) {
    // (across, level, to the far wall; then down to the floor SAFE_IN out from his own)
    c.a0 = 0; c.a1 = solve(wall - c.side * SAFE_IN, GY, 1.4);
  } else {
    // (straight down; then up across the floor and up the far wall to SWEEP2_TOP)
    c.a0 = Math.PI / 2; c.a1 = solve(far, GY - SWEEP2_TOP, 0.2);
  }
  f.aim = c.a0;
};

const sweep = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, c = f.cling;
  if (!c) { setAct(f, 'idle'); return; }
  c.t++;
  const T = SWEEP_T[c.kind];
  f.facing = (-c.side) as 1 | -1;
  if (c.t <= CLING_WARN) {
    // (the laser sight on its first line: the warning; a beep)
    f.aim = c.a0;
    if (c.t % 12 === 1) playSound('beep', 0.5, 12);
    return;
  }
  const u = Math.min(1, (c.t - CLING_WARN) / T);
  // (sweep 1 eases in and out; sweep 2 goes steady, so the far end's crossing comes at a speed he can time)
  const k = c.kind === 1 ? u * u * (3 - 2 * u) : u;
  f.aim = c.a0 + (c.a1 - c.a0) * k;
  if ((c.t - CLING_WARN) % SWEEP_EVERY === 0 && u < 1) fire(state, f, 'cling', f.aim, SWEEP_V, SWEEP_DMG, c.kind === 1 ? 'm2:fl_harry_sweep_down' : 'm2:fl_harry_sweep_up');
  f.firing = u < 1;
  if (u >= 1 && c.t - CLING_WARN > T + 20) {
    f.cling = null;
    const wx = c.side < 0 ? ARENA_L + 130 : ARENA_R - 130;
    leapTo(f, wx, GY, 34, 30, 'idle', 1);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// His rounds

const updateRounds = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, p = state.player;
  const top = p.pos.y + (p.isDucking || p.isSliding ? 28 : 0);
  const fb = fistBox(f);
  for (const r of f.rounds) {
    r.x += r.vx; r.y += r.vy; r.life--;
    if (r.y >= GY || r.x < ARENA_L || r.x > ARENA_R || r.y < sy(-60)) { r.life = 0; if (r.y >= GY) spark(state, r.x, GY - 2, '#FDE047'); continue; }
    if (fb && r.x > fb.x0 && r.x < fb.x1 && r.y > fb.y0) { r.life = 0; spark(state, r.x, r.y, '#A8A29E'); if (Math.random() < 0.3) playSound('clink', 0.3, 8); continue; }
    if (r.harmless || f.mode !== 'on' || p.inCutscene) continue;
    if (r.x > p.pos.x && r.x < p.pos.x + p.width && r.y > top && r.y < p.pos.y + p.height) {
      r.life = 0;
      if (p.invincibilityTimer <= 0 && p.health > 0) hurtPlayer(ctx, r.dmg, r.src, { x: Math.sign(r.vx || 1) * 3, y: -3 }, 10);
    }
  }
  f.rounds = f.rounds.filter(r => r.life > 0);
};

// ---------------------------------------------------------------------------------------------------------------
// The statue: her arm, her face

/** Where her fist can get to (the arm's reach from her shoulder), toward (x, y). */
const reach = (x: number, y: number, dy: number) => {
  const S = { x: LIB.shR.x, y: LIB.shR.y + dy }, R = LIB.upper + LIB.fore - 2;
  const dx = x - S.x, dd = y - S.y, d = Math.hypot(dx, dd);
  return d <= R ? { x, y } : { x: S.x + (dx / d) * R, y: S.y + (dd / d) * R };
};
const ease = (u: number) => u * u * (3 - 2 * u);
const HIGH = sy(120);

/** The smash called: her fist up over him, tracking. */
const windup = (state: GameState, f: Fight) => {
  const a = f.arm;
  if (a.st === 'stuck' || a.st === 'yank') return;
  a.st = 'wind'; a.t = 0; a.T = Math.round(WIND / speed(f));
  a.from = { x: a.fx, y: a.fy };
  a.tx = Math.max(ARENA_L + 64, Math.min(ARENA_R - 64, pmid(state).x));
  playSound('grind', 0.7, -10);
};

const statue = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, a = f.arm, lib = f.lib, p = state.player;
  // (gone: nothing; coming apart: that)
  if (f.crumbled) return;
  if (f.crumble >= 0) { crumbling(ctx, f); return; }
  a.t++;
  if (lib.face === 'disgust' && !f.barf) lib.face = 'stern';
  switch (a.st) {
    case 'up': {
      const s = Math.sin(f.total * 0.02) * 6;
      a.fx = FIST_UP.x + s; a.fy = FIST_UP.y + Math.cos(f.total * 0.017) * 4;
      lib.shake = 0;
      if (!f.barf) lib.face = 'stern';
      break;
    }
    case 'wind': {
      // (up and over him: tracking him the first stretch, then locked; rumbling, the fist going hot)
      const u = a.t / a.T;
      if (u < TRACK) a.tx += (Math.max(ARENA_L + 64, Math.min(ARENA_R - 64, pmid(state).x)) - a.tx) * 0.08;
      const g = reach(a.tx, HIGH, lib.dy), k = ease(Math.min(1, u / 0.35));
      a.fx = a.from.x + (g.x - a.from.x) * k; a.fy = a.from.y + (g.y - a.from.y) * k - Math.sin(Math.min(1, u) * Math.PI) * 30;
      lib.shake = u > TRACK ? 1.2 : 0.4; lib.face = 'strain';
      if (a.t % 28 === 0) playSound('rumble', 0.6, -6 + u * 6);
      if (a.t % 6 === 0) state.particles.push({ pos: { x: a.fx + (Math.random() - 0.5) * 80, y: a.fy + 30 }, vel: { x: 0, y: 1 + Math.random() }, life: 40, color: '#A8A29E', size: 3, grav: 0.2 });
      if (Math.abs(a.t - Math.round(a.T * TRACK)) < 1) playSound('alert', 0.5, -4);
      if (a.t >= a.T) { a.st = 'drop'; a.t = 0; a.from = { x: a.fx, y: a.fy }; playSound('whoosh', 1, -10); }
      break;
    }
    case 'drop': {
      const u = Math.min(1, a.t / DROP_T);
      a.fx = a.from.x + (a.tx - a.from.x) * u; a.fy = a.from.y + (GY - FIST_H / 2 - a.from.y) * u * u;
      if (u >= 1) impact(ctx, f);
      break;
    }
    case 'stuck': {
      // (straining at it: shaking, cracks up her arm; silent (the user: no noise as she struggles), the landing and the
      // yank free are the sounds)
      a.fx = a.tx + Math.sin(a.t * 0.9) * (a.t > STUCK_T - 80 ? 2 : 0.6); a.fy = GY - FIST_H / 2;
      lib.shake = 1.4; lib.face = 'strain';
      if (a.t % 10 === 0) puff(state, a.tx + (Math.random() - 0.5) * FIST_W, GY - 4, 1, '#A8A29E');
      // (her last smash: she comes apart while it's stuck)
      if (f.smashes >= STATUE_LIFE && a.t === 30) { startCrumble(ctx, f); break; }
      if (a.t >= STUCK_T) unstick(state, f, false);
      break;
    }
    case 'yank': case 'snap': {
      const T = a.st === 'snap' ? SNAP_T : YANK_T, u = Math.min(1, a.t / T);
      a.fx = a.from.x + (FIST_UP.x - a.from.x) * ease(u); a.fy = a.from.y + (FIST_UP.y - a.from.y) * ease(u);
      lib.shake = 0.6;
      // (the torch's butt up out of the floor trailing dirt)
      if (u < 0.5 && a.t % 2 === 0) { const v = armView(f); for (let i = 0; i < 2; i++) state.particles.push({ pos: { x: v.x + (Math.random() - 0.5) * 16, y: v.y }, vel: { x: (Math.random() - 0.5) * 2, y: Math.random() * 1.5 }, life: 40, color: i ? '#6B5B45' : '#A8A29E', size: 2 + Math.random() * 3, grav: 0.3 }); }
      if (u >= 1) { a.st = 'up'; a.t = 0; lib.shake = 0; }
      break;
    }
    default: break;
  }
  // (anybody on the fist when it comes up: popped off)
  void p;
};

/** Her torch arm as drawn (looks only: the hit's at a.fx, a.fy as ever): where its end is and how far into the smash
 *  (0: her hand there, the torch held up; 1: the torch's head there, the torch out along the arm). The drop swings it
 *  down in an arc about her shoulder; stuck, the torch's flame is what's planted; the yank brings it back up. */
/** How deep the torch's butt goes into the floor. */
const STAKE = 14;
const armView = (f: Fight) => {
  const a = f.arm;
  if (a.st === 'drop') {
    const u = Math.min(1, a.t / DROP_T), k = u * u, S = { x: LIB.shR.x, y: LIB.shR.y + f.lib.dy }, to = { x: a.tx, y: GY + STAKE };
    const a0 = Math.atan2(a.from.y - S.y, a.from.x - S.x), a1 = Math.atan2(to.y - S.y, to.x - S.x);
    let da = a1 - a0; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
    const r0 = Math.hypot(a.from.x - S.x, a.from.y - S.y), r1 = Math.hypot(to.x - S.x, to.y - S.y), ang = a0 + da * k, rr = r0 + (r1 - r0) * k;
    return { x: S.x + Math.cos(ang) * rr, y: S.y + Math.sin(ang) * rr, smash: ease(u) };
  }
  if (a.st === 'stuck') return { x: a.fx, y: a.fy + FIST_H / 2 + STAKE, smash: 1 };
  if (a.st === 'yank' || a.st === 'snap') { const sm = 1 - ease(Math.min(1, a.t / (a.st === 'snap' ? SNAP_T : YANK_T))); return { x: a.fx, y: a.fy + (FIST_H / 2 + STAKE) * sm, smash: sm }; }
  return { x: a.fx, y: a.fy, smash: 0 };
};

/** Bits of her knocked off (her copper shell and its concrete), falling down onto the floor in front of her. */
const chipHer = (state: GameState, f: Fight, n: number) => {
  for (let i = 0; i < n; i++) {
    const x = MID + (Math.random() - 0.5) * 560, y = sy(150 + Math.random() * 260) + f.lib.dy;
    f.chunks.push({ x, y, vx: (Math.random() - 0.5) * 3, vy: -1 - Math.random() * 2, a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3, s: 4 + Math.random() * 9, green: Math.random() < 0.6, down: false });
    state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 2, y: Math.random() }, life: 50, color: i % 2 ? '#4FAE98' : '#B87333', size: 2 + Math.random() * 2, grav: 0.15 });
  }
  if (f.chunks.length > 120) f.chunks.splice(0, f.chunks.length - 120);
};
/** Her last smash: she comes apart. Harry down out of her crown to watch it, horrified. */
const startCrumble = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  f.crumble = 0;
  f.lib.face = 'dread';
  playSound('crack', 1, -10); playSound('rumble', 1, -14); shakeScreen(state, 10, 6);
  if (!f.barf) {
    if (f.act === 'crown' || f.leap) leapTo(f, floorSpot(state, f), GY, 46, 70, 'idle', 1);
    else { f.cling = null; setAct(f, 'await'); f.hy = GY; f.scale = 1; }
  }
  harryLine(f, L.HARRY_CRUMBLE);
};
/** Coming apart: cracking all over, shaking, bits raining off her; her torch let go; down into the dig in pieces. */
const crumbling = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, lib = f.lib, a = f.arm, t = ++f.crumble;
  lib.wear = 1 + Math.min(0.6, t / 120);
  lib.face = t < 90 ? 'dread' : 'sob';
  lib.shake = 1.5 + t / 60;
  if (t % 4 === 0) chipHer(state, f, 2);
  if (t % 18 === 0) { playSound('crumble', 0.8, -10 + Math.random() * 3); shakeScreen(state, 6, 4); }
  if (t % 6 === 0) puff(state, VIEW_X + 80 + Math.random() * 640, sy(440), 2, '#A8A29E');
  if (t === 70) {
    // (her grip goes: the torch drops where it was stuck, her arm with her)
    f.torch = { x: Math.max(ARENA_L + 80, Math.min(ARENA_R - 80, a.tx)), y: GY - 40, vy: 0, a: -Math.PI / 2, down: true };
    playSound('clang', 1, -12); playSound('crash', 0.8, -8); shakeScreen(state, 12, 6);
    puff(state, a.tx, GY, 12, CONC[4]);
  }
  if (t > 70) {
    // (down she goes, in pieces, tipping a little)
    const k = Math.min(1, (t - 70) / (CRUMBLE_T - 70));
    lib.dy = LIB.sink * 1.3 * k * k; lib.tilt = 0.12 * k;
  }
  if (t >= CRUMBLE_T) {
    f.crumble = -1; f.crumbled = true; lib.gone = true; lib.shake = 0; a.st = 'hidden'; a.block = null;
    playSound('crash', 1, -16); playSound('boom', 1, -18); playSound('crumble', 1, -10); shakeScreen(state, 30, 16);
    for (let i = 0; i < 40; i++) puff(state, VIEW_X + Math.random() * 800, sy(440 + Math.random() * 60), 1, i % 2 ? '#A8A29E' : '#78716C');
    f.queue = ['cling', 'walk', 'cling'];
    meatheadSays(state, pick(L.MH_CRUMBLE), false);
    bark(f, L.HARRY_ENRAGED);
  }
};

/** Down: the hit; stuck (planted, but nothing solid: it only ever hurts landing). */
const impact = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, a = f.arm, p = state.player;
  a.st = 'stuck'; a.t = 0; a.fx = a.tx; a.fy = GY - FIST_H / 2;
  playSound('boom', 1, -12); playSound('crash', 1, -8); playSound('thud', 1, -14); shakeScreen(state, 20, 10);
  puff(state, a.tx, GY, 20, '#A8A29E');
  const x0 = a.tx - FIST_W / 2, x1 = a.tx + FIST_W / 2;
  // (under it, or next to it on the ground: hit, and out from under it)
  const px0 = p.pos.x, px1 = p.pos.x + p.width, feet = p.pos.y + p.height;
  const under = px1 > x0 && px0 < x1 && feet > GY - FIST_H;
  const near = !under && feet > GY - 20 && px1 > x0 - 40 && px0 < x1 + 40;
  if (under || near) {
    const away = (pmid(state).x < a.tx ? -1 : 1) as 1 | -1;
    if (under) p.pos.x = away < 0 ? x0 - p.width - 2 : x1 + 2;
    if (p.invincibilityTimer <= 0 && p.health > 0 && !p.inCutscene) hurtPlayer(ctx, under ? FIST_DMG : Math.round(FIST_DMG * 0.5), 'm2:fl_liberty_fist', { x: away * 7, y: -6 }, 16);
  }
  // (the user: no collision once it's down: it hurts only landing on him; then it's just there, planted at the back of
  // the floor: nothing to stand on, no wall, no cover from his rounds or his sweeps. a.block stays null: fistBox's
  // null, so his rounds, his walk and his floor spots all go straight through it)
  f.stuckN++;
  // (her wear: each smash cracks her more, chips flying off her, the patina flaking)
  f.smashes++; f.lib.wear = Math.min(1, f.smashes / STATUE_LIFE);
  chipHer(state, f, 4 + f.smashes * 2);
  playSound('crumble', 0.4 + f.lib.wear * 0.5, -6);
  // (her last: no rant, she's coming apart)
  if (f.smashes >= STATUE_LIFE) { if (f.sickOn) { f.sickOn = false; f.sick = 0; } return; }
  // (the rant from the crown, angrier every time; Meathead's word the first time)
  const lvl = L.HARRY_STUCK[Math.min(L.HARRY_STUCK.length - 1, f.stuckN - 1)];
  harryLine(f, lvl, tokened(() => {
    if (stuckSaidVisit !== landVisit()) { stuckSaidVisit = landVisit(); meatheadSays(state, pick(L.MH_STUCK), false); }
  }));
  // (the followup's landed: the queasiness can start again)
  if (f.sickOn) { f.sickOn = false; f.sick = 0; }
};

/** Free: yanked up slowly (her time's up), or snapped up (he's barfed on her). */
const unstick = (state: GameState, f: Fight, snap: boolean) => {
  const a = f.arm, p = state.player;
  if (a.block) {
    const b = a.block;
    // (anybody stood on it: popped up off it)
    if (p.pos.x + p.width > b.x && p.pos.x < b.x + b.w && Math.abs(p.pos.y + p.height - b.y) < 6) { p.vel.y = -9; p.isGrounded = false; }
    state.blocks = state.blocks.filter(q => q !== b);
    a.block = null;
  }
  a.from = { x: a.fx, y: a.fy };
  a.st = snap ? 'snap' : 'yank'; a.t = 0;
  playSound('crack', 1, -6); playSound('crumble', 0.8, -4); shakeScreen(state, 8, 4);
  puff(state, a.tx, GY, 12, '#A8A29E');
  if (!snap && !f.barf) { f.queue = f.stuckN % 2 === 1 ? ['crown'] : ['cling', 'walk', 'crown']; if (Math.random() < 0.7) bark(f, L.HARRY_UNSTUCK); }
};

// ---------------------------------------------------------------------------------------------------------------
// The weakness: darts, sick, her concrete

const darted = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  // (a scratch: never the last of him)
  const dmg = Math.min(DART_DMG, Math.max(0, f.hp - 1));
  if (dmg > 0) { f.hp -= dmg; ctx.fx.spawnDamageNumber({ x: f.hx - 6, y: f.hy - 100 * f.scale }, dmg, false); }
  for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: f.hx, y: f.hy - 60 * f.scale }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 18, color: '#84CC16', size: 2, grav: 0.2 });
  if (f.sickOn || f.barf) return;
  f.sick = Math.min(SICK_AT, f.sick + 1); f.sickAt = f.total;
  if (f.sick >= SICK_AT - 2 && f.sick < SICK_AT && Math.random() < 0.5) playSound('retch', 0.3, 6);
};

const startBarf = (state: GameState, f: Fight) => {
  f.sickOn = true;
  f.cling = null;
  const up = f.hy < GY - 2 || f.act === 'crown';
  f.barf = { stage: up ? 'drop' : 'heave', t: 0, hit: false, splashed: false, first: !f.sickFirst };
  if (up) { const l = { x0: f.hx, y0: f.hy, x1: floorSpot(state, f), y1: GY, t: 0, T: 40, h: 10, then: 'heave' as Act, s0: f.scale, s1: 1 }; f.leap = l; setAct(f, 'drop'); }
  else setAct(f, 'heave');
  // (the windup called off: her arm back up)
  if (f.arm.st === 'wind') unstick(state, f, true);
  playSound('retch', 0.7, 0);
};

const barfing = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, b = f.barf!, lib = f.lib;
  b.t++; f.actT++;
  f.firing = false;
  const go = (s: Barf['stage']) => { b.stage = s; b.t = 0; };
  switch (b.stage) {
    case 'drop': {
      // (out of the crown or off the wall: down, any way he can)
      const l = f.leap;
      if (l) {
        l.t++;
        const u = Math.min(1, l.t / l.T);
        f.hx = l.x0 + (l.x1 - l.x0) * u; f.hy = l.y0 + (l.y1 - l.y0) * u * u; f.scale = l.s0 + (l.s1 - l.s0) * u;
        if (u >= 1) { f.leap = null; playSound('thud', 1, -6); puff(state, f.hx, GY, 8, CONC[4]); }
      }
      if (!f.leap && b.t > 2) { setAct(f, 'heave'); go('heave'); }
      break;
    }
    case 'heave':
      if (b.t === 1) {
        // (without her: grief on top of the airsickness)
        if (f.crumbled) harryLine(f, L.HARRY_GRIEF_SICK, tokened(() => { if (griefSaidVisit !== landVisit()) { griefSaidVisit = landVisit(); meatheadSays(state, L.MH_GRIEF_PUKE, false); } }));
        else if (b.first) { f.sickFirst = true; harryLine(f, L.HARRY_SICK_FIRST); } else bark(f, L.HARRY_SICK);
      }
      if (b.t % 18 === 6) playSound('retch', 0.8, -2);
      if (b.t >= 56 && f.crumbled) {
        // (nobody to puke on: doubled over, puking his guts out on the floor; wide open)
        go('grief'); setAct(f, 'heave');
        f.puddle = { x: f.hx + f.facing * 46, k: f.puddle ? Math.min(f.puddle.k, 0.5) : 0 };
        playSound('barf', 1, -2); playSound('gush', 0.7, 2);
        break;
      }
      if (b.t >= 56) {
        go('spew'); setAct(f, 'spew');
        // (turned to her; she's standing for it, stuck or not)
        f.facing = f.hx < MID ? 1 : -1;
        if (f.arm.st === 'stuck' || f.arm.st === 'wind' || f.arm.st === 'drop') unstick(state, f, true);
        playSound('barf', 1, -2); playSound('gush', 0.7, 2);
      }
      break;
    case 'spew':
      // (his puke, up onto her: it lands, she's disgusted)
      if (b.t > 16 && b.t % 8 === 0 && lib.stains.length < 14) {
        lib.stains.push({ x: (f.hx - MID) * 0.35 + (Math.random() - 0.5) * 120, y: 150 + Math.random() * 90, r: 10 + Math.random() * 10 });
        playSound('splat', 0.5, 2);
      }
      if (b.t > 18) lib.face = 'disgust';
      if (b.t >= 72) { go('gag'); setAct(f, 'await'); playSound('rumble', 0.8, -12); }
      break;
    case 'gag':
      lib.face = b.t < 20 ? 'disgust' : 'gag'; lib.shake = b.t > 20 ? 1 : 0;
      if (b.t % 16 === 8 && b.t > 20) playSound('retch', 1, -18);
      f.facing = f.hx < MID ? 1 : -1;
      if (b.t >= 60) { go('pour'); playSound('gush', 1, -14); playSound('barf', 1, -16); }
      break;
    case 'pour': {
      // (her concrete guts, down onto him: the hit (heavy), the splash, setting on him)
      lib.face = 'puke'; lib.shake = 0.8;
      f.concrete = Math.min(1, f.concrete + 0.03);
      if (b.t % 10 === 0) playSound('glug', 0.6, -10);
      if (b.t === 14 && !b.hit) {
        b.hit = true;
        f.hp -= HEAVY; f.flash = 10; f.iframes = Math.max(f.iframes, IFRAMES);
        ctx.fx.spawnDamageNumber({ x: f.hx - 14, y: f.hy - 110 }, HEAVY, true);
        playSound('splat', 1, -10); playSound('crunch', 0.8, -8); shakeScreen(state, 10, 5);
        f.barfs++;
        f.piles.push({ x: f.hx, k: 0 }); if (f.piles.length > 4) f.piles.shift();
        if (f.hp <= 0) { die(ctx, f, 'buried'); return; }
        harryLine(f, L.HARRY_CONCRETED, tokened(() => { if (concreteSaidVisit !== landVisit()) { concreteSaidVisit = landVisit(); meatheadSays(state, pick(L.MH_CONCRETE), false); } }));
      }
      // (the splash on the floor round him: Meathead in it)
      const pl = f.piles[f.piles.length - 1]; if (pl && b.hit) pl.k = Math.min(1, pl.k + 0.02);
      if (b.hit && !b.splashed) {
        const p = state.player, m = pmid(state);
        if (Math.abs(m.x - f.hx) < SPLASH_R && p.pos.y + p.height > GY - 30 && p.invincibilityTimer <= 0 && p.health > 0) {
          b.splashed = true;
          hurtPlayer(ctx, SPLASH_DMG, 'm2:fl_liberty_barf', { x: (m.x < f.hx ? -1 : 1) * 5, y: -4 }, 12);
        }
      }
      if (b.t % 3 === 0) state.particles.push({ pos: { x: f.hx + (Math.random() - 0.5) * 40, y: GY - 6 }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 3 }, life: 26, color: CONC[3 + (b.t % 2)], size: 3 + Math.random() * 3, grav: 0.35 });
      if (b.t >= 70) { go('daze'); setAct(f, 'concreted'); lib.face = 'stern'; lib.shake = 0; }
      break;
    }
    case 'grief': {
      // (puking and sobbing; every hit a big one; it takes it out of him)
      f.green = 1;
      if (b.t % 22 === 4) playSound(b.t % 44 === 4 ? 'barf' : 'retch', 0.8, -2 + Math.random() * 2);
      if (b.t % 3 === 0) state.particles.push({ pos: { x: f.hx + f.facing * 40, y: GY - 6 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 2 }, life: 24, color: PUKE[b.t % 3], size: 2 + Math.random() * 3, grav: 0.35 });
      if (f.puddle) f.puddle.k = Math.min(1, f.puddle.k + 1 / GRIEF_T);
      f.hp -= GRIEF_DRAIN / GRIEF_T;
      if (b.t % 50 === 25) ctx.fx.spawnDamageNumber({ x: f.hx - 10, y: f.hy - 100 }, Math.round(GRIEF_DRAIN / 4), false);
      if (f.hp <= 0) { die(ctx, f, 'barfed'); return; }
      if (b.t >= GRIEF_T) {
        f.barf = null; f.sickOn = false; f.sick = 0; f.green = 0;
        f.queue = ['cling'];
        setAct(f, 'idle');
        bark(f, L.HARRY_ENRAGED);
      }
      break;
    }
    case 'daze':
      if (b.t % 20 === 0) puff(state, f.hx + f.facing * 8, f.hy - 84, 2, CONC[4]);
      if (b.t >= 64) {
        // (furious: straight up into her crown for the smash, quicker this time)
        f.barf = null;
        f.queue = [];
        startMove(ctx, f, 'crown');
      }
      break;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Hits on him

const plainHit = (state: GameState, melee: boolean): number | null => {
  const p = state.player;
  if (melee) return p.isUppercutting || p.isDivekicking ? BOSS_UPPERCUT_DAMAGE : BOSS_CHARGE_DAMAGE;
  return p.currentWeapon === 'GUN' ? BULLET_DAMAGE : null;
};

const takeHits = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, e = f.e;
  const dealt = Math.max(0, BIG - e.health);
  e.health = BIG; e.maxHealth = BIG;
  const melee = e.hitByMove !== f.moveSeen;
  f.moveSeen = e.hitByMove;
  if (dealt <= 0 || !state.enemies.includes(e) || f.iframes > 0) return;
  const plain = plainHit(state, melee);
  if (plain === null && state.player.currentWeapon !== 'CROSSBOW' && f.barfs === 0 && (++f.wrongN === 2 || f.wrongN % 5 === 0) && f.total - f.hintAt > HINT_GAP) {
    f.hintAt = f.total; meatheadSays(state, pick(L.MH_HINT), false);
  }
  // (puking his guts out, without her: wide open, every hit a big one)
  const base = plain ?? Math.max(1, dealt * SHARE);
  hurt(ctx, f, f.barf?.stage === 'grief' ? Math.max(GRIEF_HIT, base) : base, IFRAMES);
};

const hurt = (ctx: FrameContext, f: Fight, dmg: number, iframes: number) => {
  const { state } = ctx;
  f.hp -= dmg; f.iframes = Math.max(f.iframes, iframes); f.flash = 8;
  for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: f.hx, y: f.hy - 60 * f.scale }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 18, color: '#B91C1C', size: 2 + Math.random() * 2, grav: 0.3 });
  playSound('gunhit', 0.5, 2);
  ctx.fx.spawnDamageNumber({ x: f.hx - 10, y: f.hy - 106 * f.scale }, Math.max(1, Math.round(dmg)), dmg > 40);
  if (f.hp > 0 && Math.random() < 0.15) bark(f, L.HARRY_HURT);
};

// ---------------------------------------------------------------------------------------------------------------
// Dying, and her

const die = (ctx: FrameContext, f: Fight, how: How) => {
  const weak = how !== 'spin';
  const { state } = ctx, p = state.player;
  if (f.mode === 'dead') return;
  token++;
  f.mode = 'dead'; f.t = 0;
  state.enemies = state.enemies.filter(o => o !== f.e);
  for (const r of f.rounds) r.harmless = true;
  state.damageNumbers = [];
  f.said = null;
  p.inCutscene = true; p.vel.x = 0;
  f.cling = null; f.leap = null; f.barf = null;
  f.skipT = 0;
  // (her arm up, whatever it was at)
  if (f.crumbled || f.crumble >= 0) { /* (she's gone, or going: no arm to put up) */ }
  else if (f.arm.st === 'stuck') unstick(state, f, true);
  else if (f.arm.st === 'wind' || f.arm.st === 'drop') { f.arm.from = { x: f.arm.fx, y: f.arm.fy }; f.arm.st = 'snap'; f.arm.t = 0; }
  f.death = { how, t: 0, step: f.hy < GY - 2 ? 'fall' : 'start', at: 0, x: f.hx, y: f.hy, vy: 0, spin: 0, spinV: 0.32, mound: 0, st: 'wait', stT: 0, fade: 0, lineDone: false };
  if (weak) { f.cam = { t: 0, acc: 0, z: 1, out: false }; playSound(how === 'barfed' ? 'barf' : 'splat', 1, -12); }
  else { playSound('hurt', 0.8, -4); harryLine(f, L.HARRY_DEATH, tokened(() => { if (f.death) f.death.lineDone = true; })); }
};

/** Skipped: straight to how it ends (him dead, her gone, rubble), done. */
const skipToEnd = (state: GameState, f: Fight) => {
  const d = f.death!;
  token++; silenceAll(); state.playerVulgarityTimer = 0; f.said = null;
  d.step = d.how !== 'spin' ? 'set' : 'still'; d.x = f.hx; d.y = GY; d.mound = 1; d.st = 'gone'; d.stT = 999; d.fade = 0;
  f.lib.gone = true; f.lib.broken = 1; f.chunks = [];
  if (!f.crumbled) {
    f.torch = { x: TORCH_X, y: GY - 40, vy: 0, a: -Math.PI / 2, down: true };
    f.gunDrop = { x: GUN_X, y: GY - 40, vy: 0, a: 0, down: true };
  }
  f.crumble = -1;
  if (f.puddle && d.how === 'barfed') f.puddle.k = 1;
  f.barf = null; f.cam = null; f.deathSaid = 4; d.t = Math.max(d.t, 400);
};

const dying = (ctx: FrameContext, f: Fight): Controls => {
  const { state } = ctx, d = f.death!, p = state.player;
  d.t++;
  p.inCutscene = true; p.vel.x = 0;
  holdCam(state);
  statueArmOnly(f);
  f.skipT++;
  if (f.deathSaid < 4 && f.skipT > SKIP_AFTER) { offerSkip(); if (takeSkip()) { skipToEnd(state, f); return hands(); } }
  const t = d.t;
  // (her collapse, if it was going, plays on out)
  if (f.crumble >= 0) crumbling(ctx, f);
  if (d.how === 'barfed') barfedToDeath(ctx, f, d, t);
  else if (d.how === 'buried') {
    // (the pour goes on: down on his face, the mound building over him, just his feet out; kicking; set)
    f.lib.face = d.mound < 1 ? 'puke' : f.lib.face; f.concrete = 1;
    if (d.step === 'start' || d.step === 'fall') { d.step = 'pour'; d.at = t; }
    if (d.step === 'pour') {
      d.mound = Math.min(1, d.mound + 1 / 110);
      if (t % 10 === 0) playSound('glug', 0.6, -10);
      if (t % 3 === 0) state.particles.push({ pos: { x: d.x + (Math.random() - 0.5) * 60, y: GY - 10 }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 3 }, life: 26, color: CONC[3 + (t % 2)], size: 3 + Math.random() * 3, grav: 0.35 });
      if (t === 40) harryLine(f, L.HARRY_BURIED, tokened(() => { d.lineDone = true; }));
      if (d.mound >= 1 && d.lineDone) { d.step = 'set'; d.at = t; f.lib.face = 'sad'; playSound('crumble', 0.6, -6); if (f.cam) f.cam.out = true; }
      if (t > 600) { d.step = 'set'; d.at = t; if (f.cam) f.cam.out = true; }
    }
    if (d.step === 'set' && d.st === 'wait' && t - d.at > 50 && f.crumble < 0) { d.st = f.crumbled ? 'gone' : 'look'; d.stT = 0; }
  } else {
    switch (d.step) {
      case 'fall':
        d.vy += 0.6; d.y = Math.min(GY, d.y + d.vy); f.scale += (1 - f.scale) * 0.2;
        if (d.y >= GY) { d.step = 'start'; d.at = t; f.scale = 1; playSound('thud', 1, -8); }
        break;
      case 'start':
        // (staggering back, hit)
        d.x += -f.facing * 0.6;
        if (t - d.at > 34) { d.step = 'over'; d.at = t; playSound('thud', 1, -10); shakeScreen(state, 6, 3); }
        break;
      case 'over':
        if (t - d.at > 10) { d.step = 'spin'; d.at = t; }
        break;
      case 'spin': {
        // (on his back, the gun still going straight up; the recoil spins him round on the slab)
        d.spin += d.spinV; d.spinV = Math.max(0.05, d.spinV * 0.994);
        if ((t - d.at) % 3 === 0) {
          const mx = d.x, my = GY - 50;
          f.rounds.push({ x: mx, y: my, vx: (Math.random() - 0.5) * 2, vy: -14, src: '', dmg: 0, life: 60, harmless: true });
          if ((t - d.at) % 6 === 0) playSound('lmg', 0.4, -2);
        }
        if (t - d.at > 150) { d.step = 'click'; d.at = t; playSound('dry_lmg', 0.8, 0); }
        break;
      }
      case 'click':
        d.spin += d.spinV * 0.4; d.spinV *= 0.9;
        if ((t - d.at) % 14 === 0 && t - d.at < 60) playSound('click', 0.8, -2);
        if (t - d.at > 70) { d.step = 'still'; d.at = t; }
        break;
      case 'still':
        if (d.st === 'wait' && t - d.at > 40 && (d.lineDone || quiet(f)) && f.crumble < 0) { d.st = f.crumbled ? 'gone' : 'look'; d.stT = 0; }
        break;
    }
  }
  heartbroken(ctx, f, d);
  if (t > 3000) f.deathSaid = 4;
  return hands();
};

/**
 * His third death (the weakness without her: the user's "BARF TO DEATH"): down on his knees by her rubble, retching and
 * sobbing; it gushes out of him in heaves, each bigger (green-brown, then bloody); he deflates, goes pale; keels over
 * face first into the puddle and gurgles; one last heave, a twitch; and he lies there in it.
 */
const BARF_HEAVES = 4, HEAVE_T = 46;
const barfedToDeath = (ctx: FrameContext, f: Fight, d: Death, t: number) => {
  const { state } = ctx;
  if (d.step === 'start' || d.step === 'fall') { d.step = 'kneel'; d.at = t; d.x = f.hx; d.y = GY; f.scale = 1; f.puddle = f.puddle ?? { x: f.hx + f.facing * 46, k: 0 }; f.puddle.x = f.hx + f.facing * 46; }
  const u = t - d.at, pd = f.puddle!;
  switch (d.step) {
    case 'kneel':
      if (u === 8) { playSound('thud', 0.9, -6); puff(state, d.x, GY, 6, CONC[4]); }
      if (u === 14) playSound('bellow', 0.5, 8);
      if (u >= 44) { d.step = 'heave'; d.at = t; }
      break;
    case 'heave': {
      const n = Math.floor(u / HEAVE_T), k = u % HEAVE_T;
      if (k === 1) { playSound('barf', 0.8 + n * 0.1, -2 - n * 3); playSound('gush', 0.6 + n * 0.12, -n * 2); shakeScreen(state, 3 + n * 2, 3); }
      if (k < 28) {
        pd.k = Math.min(1, pd.k + (0.25 + n * 0.1) / 28);
        const cols = n < 2 ? PUKE : BLOODY;
        if (k % 2 === 0) state.particles.push({ pos: { x: pd.x + (Math.random() - 0.5) * 30, y: GY - 6 }, vel: { x: (Math.random() - 0.5) * (4 + n * 2), y: -1 - Math.random() * (2 + n) }, life: 26, color: cols[(k >> 1) % cols.length], size: 2 + Math.random() * (3 + n), grav: 0.35 });
      } else if (k === 34) playSound('bellow', 0.4, 6 - n * 2);
      if (u >= BARF_HEAVES * HEAVE_T) { d.step = 'pale'; d.at = t; harryLine(f, L.HARRY_BARF_DEATH, tokened(() => { d.lineDone = true; })); }
      break;
    }
    case 'pale':
      if (u >= 70) { d.step = 'keel'; d.at = t; }
      break;
    case 'keel':
      if (u === 22) { playSound('splat', 1, -10); playSound('glug', 0.8, -8); for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: pd.x, y: GY - 4 }, vel: { x: (Math.random() - 0.5) * 7, y: -2 - Math.random() * 4 }, life: 30, color: i % 2 ? PUKE[1] : BLOODY[1], size: 2 + Math.random() * 3, grav: 0.35 }); }
      if (u >= 30) { d.step = 'gurgle'; d.at = t; }
      break;
    case 'gurgle':
      if (u % 16 === 0) playSound('glug', 0.5, -4 - (u % 3));
      if (u >= 90 && (d.lineDone || quiet(f) || u > 400)) { d.step = 'last'; d.at = t; }
      break;
    case 'last':
      if (u === 12) { playSound('barf', 0.6, -10); pd.k = Math.min(1, pd.k + 0.05); }
      if (u >= 60) {
        d.step = 'set'; d.at = t; d.lineDone = true;
        if (f.cam) f.cam.out = true;
        ctx.fx.spawnDamageNumber({ x: d.x - 60, y: GY - 120 }, pick(L.BARFED_CAPTION), true, '#BEF264');
      }
      break;
  }
  if (t > 1400 && d.step !== 'set') { d.step = 'set'; d.at = t; if (f.cam) f.cam.out = true; }
  if (d.step === 'set' && d.st === 'wait' && t - d.at > 50 && f.crumble < 0) { d.st = f.crumbled ? 'gone' : 'look'; d.stT = 0; }
};
const BLOODY = ['#450A0A', '#7F1D1D', '#B91C1C', '#5B3A1A'];

/** Her arm, while it's not the fight's any more (up, then the beats' business). */
const statueArmOnly = (f: Fight) => {
  const a = f.arm;
  a.t++;
  if (a.st === 'yank' || a.st === 'snap') {
    const T = a.st === 'snap' ? SNAP_T : YANK_T, u = Math.min(1, a.t / T);
    a.fx = a.from.x + (FIST_UP.x - a.from.x) * ease(u); a.fy = a.from.y + (FIST_UP.y - a.from.y) * ease(u);
    if (u >= 1) { a.st = 'up'; a.t = 0; }
  }
};

/** HER: heartbroken; the torch let go, the tablet dropped, the gun out, to her head; the shot; over into the dig. */
const heartbroken = (ctx: FrameContext, f: Fight, d: Death) => {
  const { state } = ctx, lib = f.lib, a = f.arm;
  d.stT++;
  const t = d.stT;
  // (the torch, the gun: falling to the floor)
  for (const o of [f.torch, f.gunDrop]) if (o && !o.down) {
    o.vy += 0.7; o.y += o.vy; o.a += o === f.torch ? 0.06 : 0.12;
    if (o.y >= GY - 40) { o.y = GY - 40; o.down = true; o.a = o === f.torch ? -Math.PI / 2 : 0; playSound('clang', 1, -10); playSound('thud', 1, -8); shakeScreen(state, 8, 4); puff(state, o.x, GY, 10, CONC[4]); }
  }
  switch (d.st) {
    case 'wait': break;
    case 'look':
      // (she looks down at him: her face falls)
      lib.face = 'sad'; lib.shake = 0;
      if (t === 20) playSound('rumble', 0.5, -14);
      if (t >= 80) { d.st = 'sob'; d.stT = 0; }
      break;
    case 'sob':
      lib.face = 'sob'; lib.shake = 0.6 + Math.max(0, Math.sin(t * 0.2)) * 1.2;
      lib.tear = Math.min(1, t / 90);
      if (t % 26 === 1) playSound('bellow', 0.5, -14 + Math.random() * 2);
      if (t >= 130) { d.st = 'torch'; d.stT = 0; lib.shake = 0; }
      break;
    case 'torch':
      // (the torch let go: down it comes; her arm drops to her side, under the berm)
      lib.face = 'sad';
      if (t === 10) { f.torch = { x: TORCH_X, y: a.fy - 90, vy: -2, a: 0, down: false }; playSound('whoosh', 0.6, -10); }
      if (t > 10) { a.fx += (MID - 330 - a.fx) * 0.05; a.fy += (sy(440) - a.fy) * 0.05; }
      if (t >= 80) { d.st = 'tablet'; d.stT = 0; }
      break;
    case 'tablet':
      // (the tablet dropped into the dig; the hand comes back up with the gun from behind where it was)
      if (t === 6) { lib.tablet = false; playSound('thud', 1, -14); playSound('crumble', 0.6, -8); }
      if (t === 30) { lib.gun = true; playSound('click', 1, -10); }
      if (t > 30) { const u = Math.min(1, (t - 30) / 60); lib.hand = { x: HAND_TABLET.x + (LIB.head.x + 170 - HAND_TABLET.x) * ease(u), y: HAND_TABLET.y + (sy(160) - HAND_TABLET.y) * ease(u) }; }
      if (t >= 100) { d.st = 'aim'; d.stT = 0; }
      break;
    case 'aim':
      // (to her head: shaking; eyes shut)
      // (a beat holding it there, sobbing, then dread, eyes shut)
      lib.face = t < 55 ? 'sob' : 'dread'; lib.shake = 0.8;
      if (t % 30 === 1) playSound('rumble', 0.3, -16);
      if (t === 50) playSound('click', 1, -14);
      if (t >= 100) {
        // (BANG: concrete out the far side of her head; no gore)
        d.st = 'bang'; d.stT = 0; lib.broken = 1; lib.shake = 0;
        playSound('flintlock', 1.2, -14); playSound('boom', 1, -16); playSound('crumble', 1, -6); shakeScreen(state, 24, 12);
        const hx = LIB.head.x - 50, hy = LIB.head.y - 30;
        for (let i = 0; i < 26; i++) f.chunks.push({ x: hx, y: hy, vx: -3 - Math.random() * 9, vy: -6 + Math.random() * 6, a: Math.random() * 6, va: (Math.random() - 0.5) * 0.4, s: 5 + Math.random() * 12, green: i % 3 === 0, down: false });
        for (let i = 0; i < 20; i++) state.particles.push({ pos: { x: hx, y: hy }, vel: { x: -2 - Math.random() * 6, y: -3 + Math.random() * 4 }, life: 60, color: i % 2 ? '#A8A29E' : '#D6D3D1', size: 6 + Math.random() * 8 });
      }
      break;
    case 'bang':
      lib.broken++;
      if (t === 30) { lib.gun = false; f.gunDrop = { x: GUN_X, y: lib.hand.y, vy: -1, a: 0, down: false }; }
      if (t >= 60) { d.st = 'topple'; d.stT = 0; playSound('crumble', 1, -10); playSound('rumble', 1, -14); }
      break;
    case 'topple': {
      // (over, slowly, then all at once, down into the dig)
      lib.broken++;
      const u = Math.min(1, t / 110);
      lib.tilt = 0.55 * u * u; lib.dy = LIB.sink * 1.4 * u * u * u;
      shakeScreen(state, 2, 2);
      if (t % 20 === 0) puff(state, VIEW_X + Math.random() * 800, sy(440), 3, '#A8A29E');
      if (t >= 110) {
        d.st = 'gone'; d.stT = 0; lib.gone = true;
        playSound('crash', 1, -16); playSound('boom', 1, -18); playSound('crumble', 1, -10); shakeScreen(state, 30, 16);
        for (let i = 0; i < 40; i++) puff(state, VIEW_X + Math.random() * 800, sy(440 + Math.random() * 60), 1, i % 2 ? '#A8A29E' : '#78716C');
      }
      break;
    }
    case 'gone':
      if (t === 70) meatheadSays(state, pick(d.how === 'barfed' ? L.MH_WON_BARFED : d.how === 'buried' ? L.MH_WON_WEAK : f.crumbled ? L.MH_WON_ALONE : L.MH_WON), true, tokened(() => { f.deathSaid = 4; }));
      if (t > 900) f.deathSaid = 4;
      break;
  }
};

const updateChunks = (f: Fight) => {
  for (const ch of f.chunks) {
    if (ch.down) continue;
    ch.vy += 0.5; ch.x += ch.vx; ch.y += ch.vy; ch.a += ch.va;
    if (ch.x < ARENA_L + 6) { ch.x = ARENA_L + 6; ch.vx = Math.abs(ch.vx) * 0.3; }
    if (ch.y >= GY - ch.s * 0.5) { ch.y = GY - ch.s * 0.5; if (Math.abs(ch.vy) < 3) { ch.down = true; ch.va = 0; } else { ch.vy *= -0.3; ch.vx *= 0.5; } }
  }
};

/** Done with: his death played out, hers too, Meathead's had his say. */
export const fightOver = (f: Fight) => f.mode === 'dead' && !!f.death && f.deathSaid >= 4 && f.death.t > 200 && (!f.cam || f.cam.z <= 1);
/** Kept for revisits (store.ts keepForRevisits): whether she crumbled in the winning run, how he died. */
export const MEMO_CRUMBLED = 'm2:fl_harry_crumbled', MEMO_DEATH = 'm2:fl_harry_death';
export const endFight = (state: GameState, f: Fight) => {
  // (kept for the playthrough, not just this visit)
  keepForRevisits(MEMO_CRUMBLED, f.crumbled ? '1' : null);
  keepForRevisits(MEMO_DEATH, f.death?.how ?? 'spin');
  state.player.inCutscene = false; state.player.hidden = false; state.cameraOverride = null;
  if (f.arm.block) { const b = f.arm.block; state.blocks = state.blocks.filter(q => q !== b); f.arm.block = null; }
  live = null;
};
export const killedByWeakness = (f: Fight) => !!f.death && f.death.how !== 'spin';

/** The enemy, where he is (in the crown: just the window's worth of him). */
const sync = (state: GameState, f: Fight) => {
  const e = f.e;
  if (f.act === 'crown' && !f.leap) {
    e.width = WINDOW.x1 - WINDOW.x0 - 10; e.height = WINDOW.y1 - WINDOW.y0;
    e.pos.x = WINDOW.x0 + 5; e.pos.y = WINDOW.y0;
  } else {
    e.width = 44 * f.scale; e.height = 96 * f.scale;
    e.pos.x = f.hx - e.width / 2; e.pos.y = f.hy - e.height - 2;
  }
  e.vel.x = 0; e.vel.y = 0; e.facing = f.facing; e.initialY = e.pos.y;
  e.hitCooldown = f.iframes;
  e.pauseTimer = 0; e.frozenTimer = 0; e.isTased = false; e.sludgeTimer = 0; e.returnHome = false; e.puppet = false;
  void state;
};

// ---------------------------------------------------------------------------------------------------------------
// The kill cam (the weakness death): Steve's and Donnie's, near enough

const CAM_Z = 2.2, SLOW = 0.25, SLOW_HOLD = 50, SLOW_RAMP = 110;
export const killCamTick = (f: Fight): boolean => {
  const cam = f.cam;
  if (!cam) return false;
  cam.t++;
  cam.z += ((cam.out ? 1 : CAM_Z) - cam.z) * (cam.out ? 0.05 : cam.t < 6 ? 0.35 : 0.08);
  if (cam.out && cam.z < 1.004) cam.z = 1;
  let rate = cam.t < SLOW_HOLD ? SLOW : Math.min(1, SLOW + ((1 - SLOW) * (cam.t - SLOW_HOLD)) / SLOW_RAMP);
  if (cam.out) rate = 1;
  cam.acc += rate;
  if (cam.acc >= 1) { cam.acc -= 1; return false; }
  return true;
};
export const killCamZoom = (state: GameState, f: Fight) => {
  const cam = f.cam, d = f.death;
  if (!cam || !d || cam.z <= 1) return null;
  const k = (cam.z - 1) / (CAM_Z - 1), m = CANVAS_WIDTH / 2 / CAM_Z;
  const fx = Math.max(state.camera.x + m, Math.min(state.camera.x + CANVAS_WIDTH - m, d.x)), fy = GY - 70;
  return { scale: cam.z, x: fx, y: fy, shiftX: k * (state.camera.x + CANVAS_WIDTH / 2 - fx), shiftY: k * (state.camera.y + CANVAS_HEIGHT / 2 + 40 - fy) };
};

// ---------------------------------------------------------------------------------------------------------------
// Bits

const puff = (state: GameState, x: number, y: number, n: number, col: string) => {
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 40, y: y - Math.random() * 10 }, vel: { x: (Math.random() - 0.5) * 4, y: -0.5 - Math.random() * 2 }, life: 40 + Math.random() * 20, color: col, size: 5 + Math.random() * 7 });
};
const spark = (state: GameState, x: number, y: number, col: string) => {
  for (let i = 0; i < 3; i++) state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 4, y: -Math.random() * 3 }, life: 10, color: col, size: 2 });
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const libLook = (f: Fight, fr: number, crown?: (c: Ctx) => void): LibLook => ({
  f: fr, dy: f.lib.dy, tilt: f.lib.tilt, shake: f.lib.shake, face: f.lib.face, stains: f.lib.stains, tear: f.lib.tear,
  broken: f.lib.broken, hand: f.lib.hand, tablet: f.lib.tablet, gun: f.lib.gun, crown,
});

/** Harry's look, by what he's at. */
const harryPose = (f: Fight): { pose: RamboPose; lean?: number; rot?: number } => {
  if (f.entrance > 0) return { pose: 'flex' };
  if (f.flash > 0 && (f.act === 'walk' || f.act === 'idle')) return { pose: 'hurt' };
  switch (f.act) {
    case 'walk': return { pose: f.moving ? 'walk' : f.firing ? 'fire' : 'stand' };
    case 'leap': return { pose: 'leap' };
    case 'cling': return { pose: 'cling' };
    case 'crown': return { pose: f.arm.st === 'stuck' ? 'rant' : 'command' };
    case 'drop': return { pose: 'fall', rot: f.actT * 0.2 };
    case 'heave': return { pose: 'sick', lean: 0.38 + Math.sin(f.actT * 0.35) * 0.06 };
    case 'spew': return { pose: 'barf', lean: -0.45 };
    case 'await': return { pose: 'rant' };
    case 'concreted': return { pose: 'stand', lean: 0.1 };
    default: return { pose: 'stand' };
  }
};

const drawHim = (c: Ctx, f: Fight, fr: number) => {
  const d = f.death;
  if (f.mode === 'dead' && d) {
    if (d.how === 'buried') { drawBuried(c, d.x, d.mound, fr, d.step === 'set' ? d.t - d.at : 0); return; }
    if (d.how === 'barfed') { drawBarfed(c, f, d, fr); return; }
    if (d.step === 'fall') { drawRambo(c, d.x, d.y, { pose: 'fall', f: fr, facing: f.facing, rot: d.t * 0.2, scale: f.scale }); return; }
    if (d.step === 'start') { drawRambo(c, d.x, GY, { pose: 'hurt', f: fr, facing: f.facing, talking: !!f.said }); return; }
    // (on his back: turned about his hips; spinning: seen from the side, he flips side to side)
    const k = d.step === 'over' ? Math.min(1, (d.t - d.at) / 10) : 1;
    const sx = d.step === 'spin' || d.step === 'click' ? Math.cos(d.spin) : 1, face = (sx < 0 ? -1 : 1) as 1 | -1;
    // (turned about his hips, 44 up: shifted down so he lies on the slab)
    c.save(); c.translate(d.x, GY + 30 * k); c.scale(Math.max(0.2, Math.abs(sx)), 1);
    drawRambo(c, 0, 0, { pose: d.step === 'still' ? 'dead' : 'spin', f: fr, facing: face, rot: -(Math.PI / 2) * k, flash: d.step === 'spin' && fr % 4 < 2, dead: d.step === 'still' || d.step === 'click', talking: !!f.said });
    c.restore();
    return;
  }
  if (f.act === 'crown' && !f.leap) return;
  const blink = f.iframes > 0 && Math.floor(fr / 3) % 2 === 0;
  if (blink) c.globalAlpha = 0.6;
  if (!f.ripped) {
    drawHarry(c, f.hx, f.hy, { pose: f.jet ? 'jet' : 'stand', f: fr, facing: f.facing, mad: true, jetpack: f.jet, talking: !!f.said, scale: 1.15 });
  } else {
    const P = harryPose(f);
    const pose: RamboPose = f.mode === 'intro' ? (f.intro === 'flex' || f.intro === 'impressed' ? 'flex' : f.intro === 'summon' || f.intro === 'rise' || f.intro === 'monument' ? 'command' : 'rant') : P.pose;
    drawRambo(c, f.hx, f.hy, { pose, f: fr, facing: f.facing, aim: f.aim, flash: f.firing && fr % 4 < 2, talking: !!f.said, green: f.green, concrete: f.concrete, lean: P.lean, rot: P.rot, scale: f.scale });
  }
  c.globalAlpha = 1;
};

/** What's left of him on a revisit, by how he died (the standard death: the chalk outline, the scene's). */
export const drawLeftovers = (c: Ctx, how: string, fr: number) => {
  if (how === 'buried') drawBuried(c, MID + 40, 1, fr, 9999);
  else if (how === 'barfed') drawPuddle(c, MID + 90, 1, 1);
};

/** His own puke on the floor: a pool in steps, its middle going red the bloodier it got. */
const drawPuddle = (c: Ctx, x: number, k: number, bloody: number) => {
  if (k <= 0.02) return;
  const w = 24 + 90 * k, h = 4 + 7 * k;
  c.fillStyle = '#1A0B06'; c.beginPath(); c.ellipse(x, GY - 1, w + 2, h + 2, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = PUKE[0]; c.beginPath(); c.ellipse(x, GY - 1, w, h, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = PUKE[1]; c.beginPath(); c.ellipse(x - w * 0.1, GY - 2, w * 0.7, h * 0.6, 0, 0, Math.PI * 2); c.fill();
  if (bloody > 0) { c.fillStyle = BLOODY[1]; c.beginPath(); c.ellipse(x + w * 0.1, GY - 1, w * 0.5 * bloody, h * 0.55 * bloody, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = BLOODY[2]; c.fillRect(x - w * 0.2, GY - 3, w * 0.25 * bloody, 2); }
  c.fillStyle = PUKE[3]; c.fillRect(x - w * 0.5, GY - h * 0.6, w * 0.3, 2);
};
/** Barfed to death: kneeling over the pool heaving; pale; face first into it; gurgling; still. */
const drawBarfed = (c: Ctx, f: Fight, d: Death, fr: number) => {
  const pd = f.puddle, u = d.t - d.at, heaves = d.step === 'heave' ? Math.floor(u / HEAVE_T) : 0;
  const bloody = d.step === 'kneel' ? 0 : d.step === 'heave' ? Math.max(0, (heaves - 1) / 3) : 1;
  if (pd) drawPuddle(c, pd.x, pd.k, bloody);
  const pale = d.step === 'pale' ? Math.min(1, u / 60) : d.step === 'kneel' || d.step === 'heave' ? 0 : 1;
  const face = f.facing;
  if (d.step === 'kneel' || d.step === 'heave' || d.step === 'pale') {
    // (on his knees: what's under the floor line's not drawn; hunched, heaving, deflating)
    const sink = Math.min(1, (d.step === 'kneel' ? u : 99) / 10) * 22, k = d.step === 'heave' ? u % HEAVE_T : 99;
    const lean = 0.45 + (k < 28 ? Math.sin(k * 0.5) * 0.12 + 0.15 : 0) + pale * 0.15;
    c.save(); c.beginPath(); c.rect(d.x - 200, GY - 400, 400, 400); c.clip();
    drawRambo(c, d.x, GY + sink, { pose: 'sick', f: fr, facing: face, lean, scale: 1 - pale * 0.06, green: 1 - pale * 0.5, concrete: pale * 0.35, talking: !!f.said });
    c.restore();
    if (d.step === 'heave' && k > 2 && k < 30) {
      const m = mouthAt(lean, 1, face), sx = d.x + m.x, syy = GY + sink + m.y, ex = pd ? pd.x : d.x + face * 46;
      const cols = heaves < 2 ? PUKE : BLOODY;
      stream(c, sx, syy, (sx + ex) / 2 + face * 20, syy + 6, ex, GY - 4, 7 + heaves * 3, cols, fr, true);
    }
    return;
  }
  // (over, face first into it; the gurgle's bubbles; the twitch)
  const k = d.step === 'keel' ? Math.min(1, u / 22) : 1;
  const tw = d.step === 'last' && u < 24 ? Math.sin(u * 1.4) * 3 : 0;
  c.save(); c.translate(d.x + tw, GY + 30 * k);
  drawRambo(c, 0, 0, { pose: k >= 1 ? 'dead' : 'sick', f: fr, facing: face, rot: (Math.PI / 2) * k * face, dead: k >= 1, green: 0.5, concrete: 0.35 });
  c.restore();
  if (pd && (d.step === 'gurgle' || d.step === 'last')) for (let i = 0; i < 3; i++) {
    const ph = ((fr * 0.04 + i / 3) % 1), bx = d.x + face * (60 + i * 8), by = GY - 4 - ph * 14;
    c.globalAlpha = 1 - ph; c.strokeStyle = PUKE[3]; c.lineWidth = 1.5; c.beginPath(); c.arc(bx, by, 2 + ph * 3, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1;
  }
};

/** Buried in her concrete: a mound over him, face down, just his socks and sandals sticking out, kicking (then not). */
const drawBuried = (c: Ctx, x: number, k: number, fr: number, setT: number) => {
  const set = Math.min(1, setT / 120);
  const kick = set < 1 ? Math.sin(fr * (0.6 - set * 0.4)) * 5 * (1 - set) : 0;
  // (his legs out the end of it, kicking)
  c.save(); c.translate(x + 40, GY - 14);
  for (const [dy, ph] of [[0, 0], [6, 1.6]] as const) {
    const kk = kick * Math.sin(fr * 0.5 + ph);
    c.fillStyle = '#1A0B06'; c.fillRect(-4, dy - 5 + kk, 34, 11);
    c.fillStyle = '#3D5A8A'; c.fillRect(-3, dy - 4 + kk, 26, 9);
    c.fillStyle = '#F8FAFC'; c.fillRect(22, dy - 4 + kk, 6, 9);
    c.fillStyle = '#92400E'; c.fillRect(28, dy - 5 + kk, 3, 11);
  }
  c.restore();
  // (the mound: concrete, slopped, darkening as it sets)
  const h = 18 + 52 * k, w = 70 + 30 * k;
  const col = set > 0.5 ? CONC[2] : CONC[3], lite = set > 0.5 ? CONC[3] : CONC[4];
  c.beginPath(); c.moveTo(x - w, GY); c.quadraticCurveTo(x - w * 0.7, GY - h * 0.9, x - 10, GY - h); c.quadraticCurveTo(x + w * 0.5, GY - h * 0.9, x + w * 0.8, GY); c.closePath();
  c.fillStyle = col; c.fill(); c.strokeStyle = '#1A0B06'; c.lineWidth = 2; c.stroke();
  c.fillStyle = lite; c.fillRect(x - w * 0.5, GY - h * 0.8, w * 0.5, 4); c.fillRect(x - w * 0.3, GY - h * 0.55, 10, 3);
  if (set < 1) for (let i = 0; i < 4; i++) { c.fillStyle = CONC[2]; c.fillRect(x - w * 0.6 + i * 20, GY - h * 0.6 + ((fr * 0.3 + i * 5) % 14), 3, 6); }
  // (the user: "some of his limbs stick out along with blood") Out of the top, his arm, clawing up, then set hard
  // flipping the bird; out the near slope, the top of his head and the bandana's knot; the blood seeping out through the
  // cracks as it sets, down the mound into a pool round its foot, red-stained chunks)
  if (k < 0.35) return;
  const up = Math.min(1, (k - 0.35) / 0.4), claw = set < 1 ? Math.sin(fr * 0.35) * 4 * (1 - set) : 0;
  const ax = x - 18, ay = GY - h + 6, ex = ax - 8 + claw, ey = ay - 30 * up, hx2 = ex - 2 + claw * 0.5, hy2 = ey - 26 * up;
  c.lineCap = 'round';
  c.strokeStyle = '#1A0B06'; c.lineWidth = 13; c.beginPath(); c.moveTo(ax, ay); c.lineTo(ex, ey); c.lineTo(hx2, hy2); c.stroke();
  c.strokeStyle = '#C98E66'; c.lineWidth = 9; c.beginPath(); c.moveTo(ax, ay); c.lineTo(ex, ey); c.lineTo(hx2, hy2); c.stroke();
  c.strokeStyle = '#F2C9A6'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(ax - 3, ay); c.lineTo(ex - 3, ey); c.lineTo(hx2 - 3, hy2); c.stroke();
  // (the fist, the middle finger up once it's set; clawing before)
  c.fillStyle = '#1A0B06'; c.fillRect(hx2 - 8, hy2 - 9, 16, 13); c.fillStyle = '#C98E66'; c.fillRect(hx2 - 7, hy2 - 8, 14, 11); c.fillStyle = '#E2AC84'; c.fillRect(hx2 - 7, hy2 - 8, 14, 3);
  if (set > 0.3) { c.fillStyle = '#1A0B06'; c.fillRect(hx2 - 3, hy2 - 24, 7, 17); c.fillStyle = '#E2AC84'; c.fillRect(hx2 - 2, hy2 - 23, 5, 16); c.fillStyle = '#F2C9A6'; c.fillRect(hx2 - 2, hy2 - 23, 5, 2); }
  else for (let i = 0; i < 3; i++) { c.fillStyle = '#1A0B06'; c.fillRect(hx2 - 7 + i * 5, hy2 - 15 + Math.abs(claw), 4, 8); c.fillStyle = '#C98E66'; c.fillRect(hx2 - 6 + i * 5, hy2 - 14 + Math.abs(claw), 2, 6); }
  c.fillStyle = CONC[3]; c.fillRect(ax - 9, ay - 2, 18, 5);
  // (the top of his head out the near slope: gray hair, the red bandana's knot and tails)
  const tx = x - w * 0.62, ty = GY - h * 0.42;
  c.fillStyle = '#1A0B06'; c.beginPath(); c.ellipse(tx, ty, 15, 10, -0.5, Math.PI, Math.PI * 2); c.fill();
  c.fillStyle = '#9CA3AF'; c.beginPath(); c.ellipse(tx, ty, 13, 8, -0.5, Math.PI, Math.PI * 2); c.fill();
  c.fillStyle = '#DC2626'; c.fillRect(tx - 12, ty - 6, 22, 4); c.fillRect(tx + 8, ty - 9, 5, 5);
  c.fillRect(tx + 12, ty - 12 + Math.sin(fr * 0.2) * 2, 9, 3); c.fillRect(tx + 12, ty - 6 + Math.sin(fr * 0.2 + 1) * 2, 8, 3);
  // (the blood: out through the cracks, down the slopes, pooling round its foot, chunks stained)
  const bleed = Math.min(1, Math.max(0, k - 0.6) + setT / 160);
  if (bleed <= 0) return;
  const BL = ['#2A0404', '#5A0A0A', '#8B1010', '#B91C1C'];
  c.fillStyle = BL[0]; c.beginPath(); c.ellipse(x - 6, GY - 1, (w + 14) * bleed, 7 * bleed + 1, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = BL[1]; c.beginPath(); c.ellipse(x - 10, GY - 1, (w + 4) * bleed, 5 * bleed + 1, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = BL[2]; c.fillRect(x - w * 0.6 * bleed, GY - 3, w * 0.5 * bleed, 2);
  // (re-edge the mound's foot over the pool)
  c.strokeStyle = '#1A0B06'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - w, GY); c.quadraticCurveTo(x - w * 0.7, GY - h * 0.9, x - 10, GY - h); c.quadraticCurveTo(x + w * 0.5, GY - h * 0.9, x + w * 0.8, GY); c.stroke();
  for (const [cx, cy, len] of [[-0.45, 0.7, 0.55], [0.2, 0.8, 0.7], [-0.15, 0.55, 0.45], [0.5, 0.45, 0.4]] as const) {
    const sx = x + w * cx, sy0 = GY - h * cy, L2 = h * len * bleed;
    c.strokeStyle = BL[0]; c.lineWidth = 2; c.beginPath(); c.moveTo(sx - 6, sy0 - 4); c.lineTo(sx, sy0); c.lineTo(sx + 5, sy0 - 6); c.stroke();
    c.fillStyle = BL[2]; c.fillRect(sx - 1, sy0, 3, L2); c.fillStyle = BL[3]; c.fillRect(sx - 1, sy0, 1, L2 * 0.6);
    c.fillStyle = BL[1]; c.beginPath(); c.arc(sx + 0.5, sy0 + L2, 2.5, 0, Math.PI * 2); c.fill();
  }
  for (const [cx, s2] of [[-1.05, 7], [0.9, 6], [-0.8, 5], [1.05, 4]] as const) {
    const bx = x + w * cx * Math.min(1, bleed + 0.4);
    c.fillStyle = '#1A0B06'; c.fillRect(bx - s2 - 1, GY - s2 - 1, s2 * 2 + 2, s2 + 1); c.fillStyle = CONC[3]; c.fillRect(bx - s2, GY - s2, s2 * 2, s2); c.fillStyle = BL[2]; c.fillRect(bx - s2, GY - s2, s2 * 2, 2); c.fillRect(bx - s2 * 0.4, GY - s2 + 2, 2, s2 - 2);
  }
};

/** The streams: his puke up onto her, her concrete down onto him. */
const drawStreams = (c: Ctx, f: Fight, fr: number) => {
  const b = f.barf, d = f.death;
  if (b && b.stage === 'spew' && b.t > 4) {
    const lean = -0.45, m = mouthAt(lean, f.scale, f.facing), sx = f.hx + m.x, syy = f.hy + m.y;
    const tx = LIB.head.x + (f.hx - MID) * 0.35, ty = LIB.head.y + 190 + f.lib.dy;
    const u = Math.min(1, (b.t - 4) / 12), ex = sx + (tx - sx) * u, ey = syy + (ty - syy) * u;
    const cx = (sx + ex) / 2, cy = Math.min(syy, ey) - 60 * u;
    stream(c, sx, syy, cx, cy, ex, ey, 9, PUKE, fr, b.t < 64);
  }
  if (b && b.stage === 'grief' && b.t % 22 < 16) {
    const lean = 0.38, m = mouthAt(lean, f.scale, f.facing), sx = f.hx + m.x, syy = f.hy + m.y, ex = f.puddle ? f.puddle.x : f.hx + f.facing * 46;
    stream(c, sx, syy, (sx + ex) / 2 + f.facing * 16, syy + 6, ex, GY - 4, 8, PUKE, fr, true);
  }
  const pouring = (b && b.stage === 'pour') || (d && d.how === 'buried' && d.step === 'pour');
  if (pouring) {
    const t = b ? b.t : d!.t, sx = LIB.mouth.x, syy = LIB.mouth.y + 16 + f.lib.dy;
    const tx = d ? d.x : f.hx, ty = d ? GY - 30 : f.hy - 90;
    const u = Math.min(1, t / 14), ex = sx + (tx - sx) * u, ey = syy + (ty - syy) * u;
    stream(c, sx, syy, (sx + ex) / 2, syy + 20, ex, ey, 26, CONC.slice(2), fr, true);
  }
};
const stream = (c: Ctx, x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, w: number, cols: string[], fr: number, flowing: boolean) => {
  c.lineCap = 'round';
  c.strokeStyle = '#1A0B06'; c.lineWidth = w + 4; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(cx, cy, x1, y1); c.stroke();
  c.strokeStyle = cols[1]; c.lineWidth = w; c.stroke();
  c.strokeStyle = cols[2] ?? cols[1]; c.lineWidth = w * 0.4; c.beginPath(); c.moveTo(x0, y0 - w * 0.2); c.quadraticCurveTo(cx, cy - w * 0.2, x1, y1 - w * 0.2); c.stroke();
  // (lumps along it, moving down it)
  if (flowing) for (let i = 0; i < 6; i++) {
    const u = ((fr * 0.05 + i / 6) % 1), a = 1 - u;
    const x = a * a * x0 + 2 * a * u * cx + u * u * x1, y = a * a * y0 + 2 * a * u * cy + u * u * y1;
    c.fillStyle = cols[0]; c.beginPath(); c.arc(x, y, w * 0.45, 0, Math.PI * 2); c.fill();
  }
};

/** The queasy meter over his head (the darts working): green, filling. */
const drawQueasy = (c: Ctx, f: Fight) => {
  if (f.mode !== 'on' || (f.sick <= 0.05 && !f.sickOn) || f.act === 'crown') return;
  const k = f.sickOn ? 1 : f.sick / SICK_AT, x = f.hx - 22, y = f.hy - 112 * f.scale;
  box(c, x - 1, y - 1, 46, 7, '#1A0B06'); box(c, x, y, 44 * k, 5, f.sickOn ? '#BEF264' : '#84CC16');
  // (a notch a dart)
  for (let i = 1; i < SICK_AT; i++) box(c, x + Math.round((44 * i) / SICK_AT), y, 1, 5, 'rgba(26, 11, 6, 0.55)');
  label(c, 'QUEASY', f.hx, y - 4, '#BEF264', 6);
};

/** Her body (between the sky and the berm): risen, the crown with him in it when he's there. */
export const drawStatue = (c: Ctx, state: GameState, f: Fight) => {
  const fr = state.frame;
  if (f.lib.gone) return;
  const inCrown = f.act === 'crown' && !f.leap && f.mode === 'on';
  const crown = inCrown ? (g: Ctx) => {
    const P = harryPose(f);
    drawRambo(g, CROWN.x, CROWN.y, { pose: P.pose, f: fr, facing: f.facing, talking: !!f.said, scale: CROWN_SCALE, green: f.green, concrete: f.concrete });
  } : undefined;
  // (toppling: the arm goes over with her)
  const arm = f.lib.tilt > 0 || f.lib.dy > 0 ? (g: Ctx) => { const v = armView(f); drawArm(g, { ...libLook(f, fr), dy: 0, shake: 0 }, v.x, v.y, { torch: !f.torch, smash: v.smash, floor: GY }); } : undefined;
  drawLibertyBody(c, libLook(f, fr, crown), arm);
};

/** A waiting arena (a retry, before he's back on the slab): her up, him stood there. */
export const drawWaiting = (c: Ctx, state: GameState) => {
  const fr = state.frame;
  const look: LibLook = { f: fr, dy: 0, tilt: 0, shake: 0, face: 'stern', stains: [], tear: 0, broken: 0, hand: { ...HAND_TABLET }, tablet: true, gun: false };
  return {
    statue: (g: Ctx) => drawLibertyBody(g, look),
    front: (g: Ctx) => {
      drawArm(g, look, FIST_UP.x, FIST_UP.y + Math.sin(fr * 0.02) * 4, { torch: true });
      drawRambo(g, HARRY_START, GY, { pose: 'stand', f: fr, facing: -1 });
    },
  };
};

/** World space, after the berm: the floor's marks, her arm, what's lying about, Harry. */
export const drawFightBack = (c: Ctx, state: GameState, f: Fight) => {
  const fr = state.frame, a = f.arm;
  // (the concrete she's puked: mounds on the floor, set)
  for (const pl of f.piles) {
    const h = 6 + 20 * pl.k, w = 50 + 30 * pl.k;
    c.fillStyle = CONC[2]; c.beginPath(); c.ellipse(pl.x, GY, w, h, 0, Math.PI, Math.PI * 2); c.fill();
    c.fillStyle = CONC[3]; c.fillRect(pl.x - w * 0.4, GY - h * 0.7, w * 0.4, 3);
  }
  // (his own puke on the floor, while he's alive to make it)
  if (f.puddle && !(f.death && f.death.how === 'barfed')) drawPuddle(c, f.puddle.x, f.puddle.k, 0);
  // (the windup's mark on the floor: following him, then locked, red)
  if (a.st === 'wind' || a.st === 'drop') {
    const u = a.st === 'drop' ? 1 : a.t / a.T, locked = u >= TRACK, col = locked ? (fr % 8 < 4 ? '#EF4444' : '#FDE047') : 'rgba(239, 68, 68, 0.6)';
    const rx = FIST_W / 2 + 6 + (1 - u) * 30;
    c.fillStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.ellipse(a.tx, GY - 2, rx, 8, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.ellipse(a.tx, GY - 2, rx, 8, 0, 0, Math.PI * 2); c.stroke();
  }
  // (her arm, when it's not going over with her)
  if (!f.lib.gone && f.lib.tilt === 0 && f.lib.dy === 0) {
    const stuck = a.st === 'stuck' ? Math.min(1, a.t / STUCK_T) : undefined;
    const glow = a.st === 'wind' ? Math.max(0, (a.t / a.T - 0.4) / 0.6) : a.st === 'drop' ? 1 : 0;
    // (stuck: the cracks in the slab round it)
    if (a.st === 'stuck') { c.strokeStyle = '#1A0B06'; c.lineWidth = 2; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(a.tx + s * FIST_W / 2, GY - 1); c.lineTo(a.tx + s * (FIST_W / 2 + 26), GY - 4); c.lineTo(a.tx + s * (FIST_W / 2 + 50), GY - 2); c.stroke(); } }
    const away = a.st === 'wind' || a.st === 'drop' ? { x: LIB.head.x, y: LIB.head.y - 40 } : undefined;
    const v = armView(f);
    drawArm(c, libLook(f, fr), v.x, v.y, { torch: !f.torch, glow, stuck, away, straight: a.st === 'drop' || a.st === 'stuck' || a.st === 'yank' || a.st === 'snap', smash: v.smash, floor: GY });
  }
  // (the rubble once she's gone; the chunks of her head; the torch and the gun)
  if (f.lib.gone) drawRubble(c, MID - 40, GY, fr);
  for (const ch of f.chunks) drawChunk(c, ch.x, ch.y, ch.s, ch.a, ch.green);
  if (f.torch) drawTorchAt(c, f.torch.x, f.torch.down ? GY - 40 : f.torch.y, f.torch.down ? -Math.PI / 2 + 0.06 : f.torch.a);
  if (f.gunDrop) drawRevolverAt(c, f.gunDrop.x, f.gunDrop.down ? GY - 46 : f.gunDrop.y, f.gunDrop.down ? 0.04 : f.gunDrop.a);
  drawHim(c, f, fr);
};

/** World space, in front of everybody: his rounds, the streams, the words, the queasy meter. */
export const drawFightFront = (c: Ctx, state: GameState, f: Fight) => {
  const fr = state.frame;
  // (the laser sight off the wall: where the rounds are going)
  if (f.act === 'cling' && f.cling && !f.leap) {
    const mz = muzzleAt('cling', f.aim, f.scale, f.facing), mx = f.hx + mz.x, my = f.hy + mz.y;
    const dx = Math.cos(f.aim) * f.facing, dy = Math.sin(f.aim);
    let len = 1200;
    if (dy > 0.001) len = Math.min(len, (GY - my) / dy);
    if (Math.abs(dx) > 0.001) len = Math.min(len, ((dx > 0 ? ARENA_R : ARENA_L) - mx) / dx);
    const warn = f.cling.t <= CLING_WARN;
    c.strokeStyle = warn ? (fr % 8 < 4 ? '#EF4444' : '#FCA5A5') : 'rgba(239, 68, 68, 0.55)'; c.lineWidth = warn ? 2 : 1;
    c.beginPath(); c.moveTo(mx, my); c.lineTo(mx + dx * len, my + dy * len); c.stroke();
    c.fillStyle = '#EF4444'; c.fillRect(mx + dx * len - 3, my + dy * len - 3, 6, 6);
  }
  for (const r of f.rounds) {
    const l = Math.hypot(r.vx, r.vy) || 1, tx = (r.vx / l) * 12, ty = (r.vy / l) * 12;
    c.strokeStyle = '#F97316'; c.lineWidth = 3; c.beginPath(); c.moveTo(r.x - tx, r.y - ty); c.lineTo(r.x, r.y); c.stroke();
    c.strokeStyle = '#FEF08A'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(r.x - tx * 0.5, r.y - ty * 0.5); c.lineTo(r.x, r.y); c.stroke();
  }
  drawStreams(c, f, fr);
  drawQueasy(c, f);
  if (f.said) {
    const inCrown = f.act === 'crown' && !f.leap && f.mode === 'on';
    const d = f.death;
    const x = inCrown ? MID : d ? d.x : f.hx, y = inCrown ? WINDOW.y0 - 12 : d ? GY - 120 : f.hy - 116 * f.scale;
    saidOver(c, f.said, x, y, '#FDE68A', 260);
  }
};

/** Screen space: his bar in the top band clear of the HUD; the cutscenes' bars and SKIP. */
export const drawFightHud = (c: Ctx, f: Fight, band: { x1: number; x2: number; mid: number }, inCutscene: boolean) => {
  if (f.mode === 'intro') {
    const k = Math.min(1, f.skipT / 20), bar = Math.round(k * 44);
    c.fillStyle = '#000'; c.fillRect(0, 0, CANVAS_WIDTH, bar); c.fillRect(0, CANVAS_HEIGHT - bar, CANVAS_WIDTH, bar);
    if (f.skipT > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
    return;
  }
  if (f.mode === 'dead') {
    const cam = f.cam, k = cam ? (cam.out ? Math.max(0.6, (cam.z - 1) / (CAM_Z - 1)) : Math.min(1, cam.t / 20)) : Math.min(1, f.skipT / 20), bar = Math.round(k * 44);
    c.fillStyle = '#000'; c.fillRect(0, 0, CANVAS_WIDTH, bar); c.fillRect(0, CANVAS_HEIGHT - bar, CANVAS_WIDTH, bar);
    if (cam && cam.t < 14) { c.fillStyle = `rgba(255, 255, 255, ${(1 - cam.t / 14).toFixed(2)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
    if (f.deathSaid < 4 && f.skipT > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
    return;
  }
  if (inCutscene) return;
  const w = band.x2 - band.x1, k = Math.max(0, f.hp / HP);
  box(c, band.x1, 22, w, 14, '#18181B'); box(c, band.x1 + 2, 24, (w - 4) * k, 10, f.iframes > 0 && Math.floor(f.iframes / 4) % 2 ? '#FCA5A5' : '#DC2626');
  label(c, 'HELICOPTER HARRY', band.mid, 50, '#FCA5A5', 7);
};
