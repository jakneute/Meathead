// STUPID DAD, the fight (the user's design, verbatim in cartoon-spec.md). HONK AZORIA on his couch (dragged up front at
// the end of the intro), drunk, the mallet he stole off the PUNCHY & KICKY robot by the gate leaning on the couch's arm,
// screaming at his robot family for a beer. Every number that matters is up top, to tune.
//
//   ON THE COUCH  He sits there practically the whole time, yelling for beer and being mean to the family (they're mean
//                 back, off the tapes: the laugh track). Come close and he swats you away with the mallet: a quick one
//                 at a charge, a dive kick or a grab coming in, a slower one otherwise; it misses, and he's open while he
//                 winds back. Grabs don't work on him at all: forty years of beer sweat (TOO GREASY).
//   THE BEER      Every so often one of the family (on its castors, its post, the Boy off his track) jerks over to the
//                 fridge at the end of the set and pitches bottles at him by the armful: they fly all over the set (most
//                 miss him: short, long, off the wall, off his head: the laugh track), so nowhere on it's safe, and one
//                 that hits Meathead hurts a bit (a shadow on the deck where each is coming down); till he catches one
//                 and drinks it. Then one of two (in turn):
//   THE FAMILY    (the user's, 2026-10-21: "the stupid dad fight feels a bit too sedentary. make it so you cannot just
//                 stand there and shoot him.") Each living animatronic patrols its own track along the front of the set
//                 (MOM the left end, SIS the middle in front of the couch, THE BOY right of it, GRAMPS the far end:
//                 overlapping), a jerk at a time, stopping now and then. They never hurt him ("the robots don't hurt you
//                 anymore but they do obstruct your shots. same for beer runs"); they eat his shots and his moves (you
//                 need clearance: "they can only be destroyed with the stunt car"); a ping, sparks, and now and then his
//                 gripe (MH_BLOCKED). The beer run is one of them at random, rushing to the fridge and back to its
//                 track (harmless); two of each armful's wide bottles come down about where he's stood.
//   CAMERA        Zoomed out (0.66) on the middle of the set for the whole fight, wall to wall; the words and the
//                 clapperboard's reset ring drawn on the HUD at full size. The clapperboard snapped while it's
//                 resetting: the stunt coordinator on the walkie with an excuse (CREW_EXCUSE).
//   PUKE          He pukes so hard the couch rockets across the set; into a wall and back (the fridge jolts when it hits
//                 its wall), bouncing harder every time it happens; it settles quickly, and he scoots it straight back to
//                 its spot. The puke
//                 hurts; so does the couch coming at him, unless he's mid-move into it (a charge, a dive kick, an
//                 uppercut: the skilled way in).
//   DRUNKEN RAGE  Up off the couch with the mallet like Mario in Donkey Kong, hammering up and down, coming after him,
//                 hopping at random (run under him; his knees bend a beat before each hop: the tell). The hammer hurts
//                 where it's drawn (its head; him). Every move into him gets him hammered (no melee lands); then he's
//                 winded, a wheeze (open), and shuffles back to the couch.
//   HURTING HIM   The ray gun and Meathead's moves in full; anything else 35% (every land boss's way); the 60-frame
//                 breather. 666 health.
//   THE WEAKNESS  The CLAPPERBOARD: here each snap sends one stunt car that homes in on one of his TV family and
//                 flattens it (wrecks and bodies stay put); the scene takes a while to reset before another
//                 (RECHARGE: it can't be spammed in this fight; it's itself everywhere else). He's more baffled and fed up
//                 with each, and each sets off his counter (a puke or the hammer). The second-to-last one's car comes on
//                 down onto his couch and crushes it: he's up, pathetic, no couch, no counters, no puking, no hammer, and
//                 hardly any fight (double damage). The last of the family goes the same way; then one more snap and the
//                 last car comes down on HIM: the weakness death (a short slow-mo; flattened like a cartoon). No car
//                 touches his health while any of the family's up (the user's); once they're all gone and the couch is
//                 crushed (him up, flailing), ANY hit from anything kills him in one, whatever his health (doomed()).
//
// Two deaths. The weakness: the kill cam, the car on him, burning; it tips off and he's a pancake on the deck, fluttering
//   at the edges, the stuntman up out of the wreck with a thumbs-up, the laugh track, his last words, Meathead's. Any other
//   way (the standard death, the user's): FINE, I'LL GET IT MYSELF: he gets up for a beer at last, shuffles to the
//   fridge and yanks on it; it rocks off the wall, wobbles, wobbles, and tips over on him (UH OH): crushed flat under it,
//   his head and his hands out the end; the laugh track; he shits himself under there (the seep, his line); one can rolls
//   out across the stage to Meathead's feet and cracks open.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind } from '../../../m1/types';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll, isTalking } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { ENEMY_HIT_COOLDOWN, CANVAS_WIDTH, CANVAS_HEIGHT, BULLET_DAMAGE, BOSS_CHARGE_DAMAGE, BOSS_UPPERCUT_DAMAGE } from '../../../m1/constants';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { setStuntCarHook, snapClapper } from '../../weapons/stuntCar';
import type { ByPants } from '../talk';
import { speak, meatheadSays, byPants, saidOver, box, label, getCartoon } from '../section';
import { X, x0, x1, STAGE_Y, MOM, SIS, GRAMPS, BOY_TRACK, D_SET, ARENA, COUCH_HOME, FRIDGE } from './layout';
import { laughTrack } from './show';
import type { DadPose } from './state';
import { drawDad, DAD_K, DAD_H, DAD_SIT_H, type DadFace, hammerGrip, swatGrip, malletHead, MALLET_HEAD } from './dad';
import { pantsOf } from '../section';
import {
  type P, type Member, type PileCan, eyeOf, proj, drawMallet, drawFridge, drawBottle, drawDrop, drawPuddle, drawCouchAt,
  drawCarAt, drawWreck, drawStuntmanAt, drawWallSplat, drawMember, drawDeadMember, drawPancake, drawPile, drawSeep, drawBlood,
} from './fightArt';
import type { Anim } from './family';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;

// ---------------------------------------------------------------------------------------------------------------
// The numbers (tune here)

/** His health (the land bosses'), the enemy's (never runs out: the hits come off ours); the share anything but the ray
 *  gun and his moves does; the breather; up and pathetic: twice the hurt, half the breather. */
const HP = 666, BIG = 100000, SHARE = 0.35, IFRAMES = ENEMY_HIT_COOLDOWN, SAD_MULT = 2, SAD_IFRAMES = 30;
/** His seat on the couch (from its middle), half the couch's width (the arena, the couch's spot, the fridge: layout.ts). */
const SEAT_DX = 46, COUCH_HALF = 76;
/** Where the family stands at the fridge. */
const AT_FRIDGE = { x: FRIDGE.x - 58, d: 0.955 };
/** The swat: how near sets it off (px either side, how high over the deck), its wind-up (slow, at a move coming in),
 *  how long it's live, his recovery (open), the gap before another; the hurt. */
const SWAT_WIND = 16, SWAT_FAST = 7, SWAT_LIVE = 6, SWAT_RECOVER = 40, SWAT_GAP = 26, SWAT_DMG = 22;
/** The beer: how often he yells for one (frames, a range); armfuls a trip (the last has the one he catches); the gap
 *  between them; their flight; how many fly all over the set with each armful (more once he's lost some of them); the
 *  hurt one does Meathead; the family's jerky walk (px a step, a step every 8 frames). */
const CALL_EVERY: [number, number] = [300, 420], BOTTLES: [number, number] = [1, 2], TOSS_GAP = 30, BOTTLE_T = 34, SPRAY = 3, BEER_DMG = 6;
/** The beer run's rush (the user's: "they will move very quickly to the fridge and throw it then back to their
 *  'default' track"): px a frame there and back. */
const RUSH = 9;
/** The beer runner's tell before it bolts (a klaxon, a lean, a rev). */
const READY_T = 34;
/** THE FAMILY ON THEIR TRACKS (the user's: "the various animatronics ... will move on a set track and attempt to slap
 *  you"): each living one patrols its own stretch of the front of the set (they overlap end to end, so nowhere's out of
 *  reach for long), a jerk at a time; in reach, a slap: a wind-up (the slap arm cocking back with a servo whine), a
 *  quick swing, a rest, a wait before another. Only the stunt cars take them out. */
const TRACKS: Record<Member, { a: number; b: number; d: number; sh: number }> = {
  mom: { a: ARENA.a + 30, b: 3210, d: 1.0007, sh: 74 },
  sis: { a: 3110, b: 3500, d: 1.0009, sh: 40 },
  boy: { a: 3420, b: 3760, d: 1.0008, sh: 60 },
  gramps: { a: 3660, b: ARENA.b - 40, d: 1.0006, sh: 62 },
};
const PATROL_STEP = 10, PATROL_EVERY = 6;
/** Catching it, drinking it. */
const CATCH_T = 24, DRINK_T = 64;
/** The puke: the wind-up, how long it comes, the kick it gives the couch (more each time), the push while it's coming,
 *  the couch's slide (friction) and bounce; the hurt (the puke, the couch). */
const PUKE_WIND = 24, PUKE_T = 84, PUKE_KICK = 8, PUKE_KICK_MORE = 2.2, PUKE_KICK_MAX = 17, PUKE_PUSH = 0.3, SLIDE = 0.972, BOUNCE = 0.62;
/** Lower on health, the puke rides further (the user's: "when lower on health, the barf attack will bounce him across
 *  several walls, left and right, across the whole room. many bounces can happen"): by tier (his health over 60%, to
 *  35%, under): the wind-up (a longer tell), the kick on top, the couch's friction and its bounce off a wall, how long
 *  he keeps puking while it's still flying (the spray the whole way). About 1-2 walls, 3-4, 5-8. */
const PUKE_TIER = [
  { wind: PUKE_WIND, kick: 0, slide: SLIDE, bounce: BOUNCE, ride: 0 },
  { wind: 34, kick: 4, slide: 0.991, bounce: 0.84, ride: 240 },
  { wind: 42, kick: 7, slide: 0.996, bounce: 0.91, ride: 480 },
];
const pukeTierOf = (f: Fight) => (f.hp > HP * 0.6 ? 0 : f.hp > HP * 0.35 ? 1 : 2);
/** The couch stopped off its spot: how fast he scoots it back (px a frame, while his heels are down). */
const SCOOT = 3.4;
const PUKE_DMG = 8, COUCH_DMG = 16, COUCH_HURTS = 3.4;
/** The rage: getting up, how long, the hammer's beat (frames up / down), his walk, his hops (how hard, how often), the
 *  gravity; the hurt; winded after. */
const RISE_T = 30, RAGE_T = 420, HAMMER_BEAT = 7, RAGE_WALK = 1.5, HOP_VY = [-11.5, -13.5], HOP_GAP = [40, 110], G = 0.45, HAMMER_DMG = 18, TIRED_T = 60, RETURN_V = 3.4;
/** The hop's tell (frames of knee bend before he goes), the give as he lands. */
const HOP_TELL = 16, LAND_GIVE = 10;
/** Baffled (each one of the family flattened), the clapperboard's reset in this fight; the cars' flight. */
const BAFFLE_T = 84, RECHARGE = 420, CAR_V = 15;
/** Up and pathetic: his stagger, the trips. */
const SAD_WALK = 0.85, TRIP_T = 80, HEAVE_T = 90;
/** Chatter (him at the family, at Meathead): how often. */
const CHAT_EVERY: [number, number] = [520, 820], HINT_GAP = 600;

// ---------------------------------------------------------------------------------------------------------------
// The state

type Act = 'enter' | 'sit' | 'swat' | 'catch' | 'drink' | 'pukeWind' | 'puke' | 'rise' | 'rage' | 'tired' | 'return' | 'baffled'
  | 'thrown' | 'up' | 'trip' | 'heave';
const MEMBERS: Member[] = ['mom', 'boy', 'sis', 'gramps'];
interface Fam {
  id: Member; alive: boolean; x: number; d: number; home: { x: number; d: number }; stepT: number; dir: 1 | -1;
  /** Its patrol (which way along its track), its slap (wind-up, swing, rest) and its clock, the frame it may slap again. */
  way: 1 | -1;
  /** Stopped on its track this many frames more. */
  idle: number;
}
interface Errand { who: Member; step: 'ready' | 'go' | 'open' | 'toss' | 'back'; t: number; left: number; called: boolean; wait: number }
type Miss = 'short' | 'long' | 'head' | 'wall' | 'catch' | 'spray';
interface Bottle { t: number; T: number; ax: number; ay: number; ad: number; bx: number; by: number; bd: number; kind: Miss; rot: number; arc: number }
interface Drop { x: number; y: number; vx: number; vy: number; r: number; k: number }
interface Puddle { x: number; w: number; t: number }
interface Car {
  t: number; T: number; ax: number; ay: number; bx: number; by: number; bd: number; dir: 1 | -1; paint: number; wheel: number;
  target: Member | 'dad'; hop: boolean; couch: boolean;
}
interface Wreck { x: number; d: number; dir: 1 | -1; paint: number; t: number; onCouch: boolean }
interface Flung { x: number; y: number; d: number; vx: number; vy: number; t: number; dir: 1 | -1; seed: number; stuck: boolean }
interface Death {
  how: 'fridge' | 'flat'; t: number; step: string; at: number;
  /** The fridge (the standard death): how far it's crept off the wall to the front (0..1), how far over it's tipped. */
  creep: number; fall: number;
  /** The car on him (the weakness): where it is, its tip off him. */
  car: { x: number; rot: number; vx: number } | null;
  pile: PileCan[]; heap: number; seep: number;
  roll: { x: number; vx: number; open: number } | null;
  stunt: { x: number; y: number; vy: number; up: boolean } | null;
  skipT: number;
  /** Meathead walked off out of its way (which way; 0 not yet); which way the wreck tips off him. */
  walk: number; tip: number;
}
interface KillCam { t: number; acc: number; z: number; out: boolean }

export interface Fight {
  mode: 'on' | 'dead'; t: number; stage: string;
  hp: number; iframes: number; flash: number;
  e: Enemy; moveSeen: number | undefined;
  /** Him: what he's at, its clock; where (section x, feet's height off the deck), which way he faces, on the couch. */
  act: Act; actT: number; x: number; y: number; vy: number; facing: 1 | -1; seated: boolean; landT: number;
  swatWind: number; swatAt: number; swatHit: boolean;
  nextAtk: 'puke' | 'rage'; pukes: number; rages: number; hopAt: number;
  /** The couch: where (its middle), going how fast, squashed (a bounce), crushed. */
  couch: { x: number; vx: number; squash: number; crushed: boolean; rot: number };
  fridge: { open: number; dx: number; tilt: number; jolt: number };
  family: Record<Member, Fam>;
  errand: Errand | null; callAt: number;
  bottles: Bottle[]; drops: Drop[]; puddles: Puddle[];
  cars: Car[]; wrecks: Wreck[]; flung: Flung[];
  kills: number; recharge: number; sad: boolean;
  words: Map<'dad' | Member | 'crew', string>;
  /** The zoom (eased: out to take in the whole set while it's on), the clapperboard's ready flash, the crew's last excuse. */
  zoom: number; readyFlash: number; crewAt: number; blocked: number; blockSaidAt: number;
  /** The puke's tier for this ride (set as it winds up: PUKE_TIER). */
  pukeTier: number;
  chatAt: number; bundy: number; lowSaid: boolean; wrongN: number; hintAt: number; dudAt: number; saidPuke: boolean; saidRage: boolean;
  flat: number;
  death: Death | null; deathSaid: number; cam: KillCam | null;
}

/** The fight going on (the clapperboard's hook looks at it). */
let live: Fight | null = null;
let token = 0;
export const resetFight = () => { live = null; token++; };
const tokened = (fn: () => void) => { const tok = token; return () => { if (tok === token) fn(); }; };

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pmid = (state: GameState) => ({ x: state.player.pos.x + state.player.width / 2 - x0, feet: state.player.pos.y + state.player.height });
const alive = (f: Fight) => MEMBERS.filter(m => f.family[m].alive);
const attacking = (state: GameState) => { const p = state.player; return p.isCharging || p.isUppercutting || !!p.isDivekicking || p.isSliding; };
const grabbing = (state: GameState) => ((getCartoon(state) as unknown as { grab?: { phase?: string } } | null)?.grab?.phase ?? 'idle') !== 'idle';

// ---------------------------------------------------------------------------------------------------------------
// Him, the enemy (the engine's: for the hits; drawn here)

const KIND = 'm2:ct_stupid_dad' as const;
let greaseAt = -9999;
registerM2Kind({
  kind: KIND,
  stats: { w: 44, h: 92, hp: BIG, contact: 0, mass: 400, air: true },
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y, harmless: true }),
  gender: 'm', humanoid: true, grab: 'none', midBoss: true,
  head: { x: 2, y: -88, r: 14 },
  draw: () => {},
  ai: () => true,
  // (TOO GREASY: forty years of beer sweat; the grab slides off and throws him back)
  onGrab: (ctx, e) => {
    const { state } = ctx, p = state.player, dir = p.pos.x + p.width / 2 < e.pos.x + e.width / 2 ? -1 : 1;
    p.isCharging = false; p.isDivekicking = false; p.isUppercutting = false;
    p.vel = { x: dir * 7, y: -4 }; p.lockTimer = Math.max(p.lockTimer, 18);
    playSound('squish', 0.9, -2); playSound('oil', 0.6, 4);
    for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: e.pos.x + e.width / 2 - dir * 16, y: e.pos.y + 30 + (Math.random() - 0.5) * 30 }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 4 }, life: 26, color: ['#FDE68A', '#FACC15', '#A16207'][i % 3], size: 2 + Math.random() * 2, grav: 0.3 } as typeof state.particles[number]);
    if (state.frame - greaseAt > 150) {
      greaseAt = state.frame;
      meatheadSays(state, pick(byPants(state, L.MH_TOO_GREASY)), false);
      if (live) bark(live, state, L.DAD_GRABBED);
    }
    return { said: true, free: true };
  },
  // (the drunken rage: nothing he does to him lands; a move into him gets him hammered)
  touch: (ctx) => {
    const f = live;
    if (!f || f.mode !== 'on' || (f.act !== 'rage' && f.act !== 'rise')) return false;
    if (attacking(ctx.state)) hammered(ctx, f);
    return true;
  },
});
for (const [source, l] of Object.entries(L.HURT)) registerHurtLines(source, l.hurt, l.death);
/** What hurt him, with the state he's in (his callouts and the death screen by clean, shitty, naked). */
const hurtSrc = (state: GameState, base: string) => `${base}.${pantsOf(state)}`;

// ---------------------------------------------------------------------------------------------------------------
// The clapperboard, in this fight: a car for one of the family each snap, and a wait between takes

setStuntCarHook(ctx => {
  const f = live;
  // (only in this fight: not if he's gone off to the hub mid-fight and fires it somewhere else)
  if (!f || ctx.state.stageId !== f.stage) return false;
  if (f.mode !== 'on' || f.cars.length || f.act === 'enter') { ctx.state.player.shootCooldown = 20; return true; }
  if (f.recharge > 0) { dud(ctx, f); return true; }
  snapClapper(ctx);
  launchCar(ctx.state, f);
  f.recharge = RECHARGE;
  return true;
});
const dud = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, p = state.player;
  p.shootCooldown = 24;
  playSound('click', 0.8, -2);
  // (the stunt coordinator, off-stage on the walkie, with why the next car isn't ready (the user's): once a reset, and
  // never two within a few seconds however hard he mashes it)
  if (f.t - f.crewAt > 240 && f.t - f.dudAt > 240 && quiet()) {
    f.dudAt = f.t; f.crewAt = f.t;
    playSound('beep', 0.4, -4);
    const tok = token;
    speak(L.VOICES.crew, pick(L.CREW_EXCUSE), s => { if (tok !== token) return; if (s) f.words.set('crew', s.text); else f.words.delete('crew'); }, true);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Saying things (one at a time; the words only while they're said)

const quiet = () => !isTalking();
/** He says one of these (waits its turn). */
const dadSays = (f: Fight, state: GameState, pool: ByPants, onDone?: () => void) => {
  const tok = token;
  speak(L.VOICES.dad, pick(byPants(state, pool)), s => { if (tok !== token) return; if (s) f.words.set('dad', s.text); else f.words.delete('dad'); }, true, () => { if (tok === token) onDone?.(); });
};
/** A bark: dropped if anybody's talking. */
const bark = (f: Fight, state: GameState, pool: ByPants) => { if (quiet()) dadSays(f, state, pool); };
/** One of the family's tapes (not at him: one pool each). */
const tape = (f: Fight, who: Member, pool: readonly string[], onDone?: () => void) => {
  const tok = token;
  speak(L.VOICES[who], pick(pool), s => { if (tok !== token) return; if (s) f.words.set(who, s.text); else f.words.delete(who); }, true, () => { if (tok === token) onDone?.(); });
};
const meathead = (state: GameState, pool: ByPants, after = false, onDone?: () => void) => meatheadSays(state, pick(byPants(state, pool)), after, onDone);

// ---------------------------------------------------------------------------------------------------------------
// Starting

const homeOf = (m: Member) => (m === 'mom' ? MOM : m === 'sis' ? SIS : m === 'gramps' ? GRAMPS : BOY_TRACK.a);

/** On: him on the couch up front, the mallet by him, the family where the show left them; `retry`: straight back on
 *  (a beat for his entrance first, no swats, no beer). */
export const startFight = (state: GameState, retry: boolean): Fight => {
  token++;
  const x = COUCH_HOME + SEAT_DX;
  const e = makeKindEnemy(KIND as EnemyKind, X(x), STAGE_Y);
  e.facing = -1; e.seen = true;
  const fam = {} as Record<Member, Fam>;
  for (const m of MEMBERS) { const h = homeOf(m); fam[m] = { id: m, alive: true, x: h.x, d: h.d, home: { x: h.x, d: h.d }, stepT: 0, dir: -1, way: Math.random() < 0.5 ? 1 : -1, idle: 0 }; }
  const f: Fight = {
    mode: 'on', t: 0, stage: String(state.stageId), hp: HP, iframes: 0, flash: 0, e, moveSeen: e.hitByMove,
    act: retry ? 'enter' : 'sit', actT: 0, x, y: 0, vy: 0, facing: -1, seated: true, landT: -999,
    swatWind: SWAT_WIND, swatAt: -999, swatHit: false, nextAtk: 'puke', pukes: 0, rages: 0, hopAt: 0,
    couch: { x: COUCH_HOME, vx: 0, squash: 0, crushed: false, rot: 0 },
    fridge: { open: 0, dx: 0, tilt: 0, jolt: 0 },
    family: fam, errand: null, callAt: retry ? 240 : 160,
    bottles: [], drops: [], puddles: [], cars: [], wrecks: [], flung: [],
    kills: 0, recharge: 0, sad: false, words: new Map(),
    chatAt: rnd(...CHAT_EVERY) * 0.6, bundy: 0, lowSaid: false, wrongN: 0, hintAt: -9999, dudAt: -9999, saidPuke: false, saidRage: false,
    flat: 1, death: null, deathSaid: 0, cam: null, zoom: 1, readyFlash: 0, crewAt: -9999, blocked: 0, blockSaidAt: -9999, pukeTier: 0,
  };
  live = f;
  state.enemies.push(e);
  if (retry) dadSays(f, state, L.DAD_ENTRANCE);
  sync(state, f);
  return f;
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame

const setAct = (f: Fight, a: Act) => { f.act = a; f.actT = 0; };
const seatX = (f: Fight) => f.couch.x + SEAT_DX;
/** The world rectangle of something (section x, world y). */
type R = { x0: number; x1: number; y0: number; y1: number };
const pRect = (state: GameState): R => { const p = state.player; return { x0: p.pos.x, x1: p.pos.x + p.width, y0: p.pos.y, y1: p.pos.y + p.height }; };
const hits = (a: R, b: R) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
const hurtable = (state: GameState) => { const p = state.player; return p.health > 0 && !p.inCutscene && p.invincibilityTimer <= 0; };

export const updateFight = (ctx: FrameContext, f: Fight, controls: Controls): Controls => {
  const { state } = ctx;
  live = f;
  f.t++;
  if (f.iframes > 0) f.iframes--;
  if (f.flash > 0) f.flash--;
  if (f.recharge > 0) { f.recharge--; if (f.recharge === 0 && f.mode === 'on') { f.readyFlash = 36; playSound('clap', 0.5, 4); } }
  if (f.readyFlash > 0) f.readyFlash--;
  view(state, f);
  props(ctx, f);
  if (f.mode === 'dead') return dying(ctx, f);
  takeHits(ctx, f);
  if (f.hp <= 0) { die(ctx, f, 'fridge'); return dying(ctx, f); }
  dad(ctx, f);
  errand(ctx, f);
  family(ctx, f);
  blockShots(ctx, f);
  bottles(ctx, f);
  cars(ctx, f);
  chatter(ctx, f);
  if (f.hp < HP * 0.25 && !f.lowSaid && quiet()) { f.lowSaid = true; dadSays(f, state, L.DAD_LOW); }
  sync(state, f);
  return controls;
};

/** What goes on round him whatever he's doing: the couch sliding, the fridge settling, the puke flying, the wrecks
 *  smoking, the stuntmen flung. */
const props = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, c = f.couch;
  // The couch: sliding on, bouncing off the end walls (the fridge jolts when it hits that one), slowing
  if (!c.crushed && c.vx !== 0) {
    const T = PUKE_TIER[f.pukeTier];
    c.x += c.vx; c.vx *= T.slide;
    const lo = ARENA.a + COUCH_HALF + 4, hi = ARENA.b - COUCH_HALF - 4;
    if (c.x < lo || c.x > hi) {
      const sp = Math.abs(c.vx);
      c.x = c.x < lo ? lo : hi; c.vx = -c.vx * T.bounce; c.squash = 1;
      playSound('crash', Math.min(1, 0.4 + sp / 14), -6); playSound('thud', 1, -10); shakeScreen(state, Math.min(14, 4 + sp), 4);
      if (c.x === hi) { f.fridge.jolt = 1; f.fridge.dx = Math.max(-34, f.fridge.dx - sp * 2.2); playSound('clink', 0.9, 2); playSound('glass', 0.5, 4); }
      for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: X(c.x) + (c.x === hi ? COUCH_HALF : -COUCH_HALF), y: STAGE_Y - 30 - Math.random() * 30 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 30, color: i % 2 ? '#F4EFE2' : '#E0752E', size: 2 + Math.random() * 3, grav: 0.25 });
    }
    if (Math.abs(c.vx) < 0.6 && f.act !== 'puke') { c.vx = 0; if (f.act !== 'pukeWind') f.pukeTier = 0; }
    c.rot = Math.max(-0.12, Math.min(0.12, -c.vx * 0.012));
  } else c.rot *= 0.8;
  c.squash *= 0.82;
  // (stopped away from its spot, him on it and nothing on: scooted straight back with his heels, a hop at a time)
  if (!c.crushed && c.vx === 0 && Math.abs(c.x - COUCH_HOME) > 1 && f.seated && (f.act === 'sit' || f.act === 'baffled' || f.act === 'drink' || f.act === 'catch')) {
    if (f.t % 6 < 4) { c.x += Math.sign(COUCH_HOME - c.x) * Math.min(SCOOT, Math.abs(COUCH_HOME - c.x)); if (f.t % 6 === 0) playSound('thud', 0.2, -14); }
  }
  // The fridge: knocked off the wall a way, it creeps back; the wobble dies
  const fr = f.fridge;
  fr.jolt *= 0.9; fr.tilt = Math.sin(f.t * 0.9) * 0.06 * fr.jolt; fr.dx *= 0.995;
  // The puke: flying, then a puddle where it lands
  for (const d of f.drops) { d.x += d.vx; d.y += d.vy; d.vy += 0.34; }
  for (const d of f.drops) if (d.y >= STAGE_Y - 2) { if (Math.random() < 0.25) f.puddles.push({ x: d.x, w: 10 + Math.random() * 14, t: 0 }); d.r = -1; }
  if (hurtable(state) && f.mode === 'on') {
    const pr = pRect(state);
    for (const d of f.drops) {
      if (d.r < 0) continue;
      if (hits(pr, { x0: d.x - d.r, x1: d.x + d.r, y0: d.y - d.r, y1: d.y + d.r })) {
        hurtPlayer(ctx, PUKE_DMG, hurtSrc(state, 'm2:ct_dad_puke'), { x: Math.sign(d.vx || 1) * 5, y: -4 }, 10);
        playSound('splat', 0.8, 2);
        for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: d.x, y: d.y }, vel: { x: (Math.random() - 0.5) * 5, y: -Math.random() * 4 }, life: 24, color: ['#8A9A1E', '#B8C43A', '#E2E87A'][i % 3], size: 2 + Math.random() * 3, grav: 0.3 });
        d.r = -1;
        break;
      }
    }
  }
  f.drops = f.drops.filter(d => d.r >= 0 && d.x > X(ARENA.a) - 40 && d.x < X(ARENA.b) + 40);
  for (const pu of f.puddles) pu.t++;
  f.puddles = f.puddles.filter(pu => pu.t < 600);
  if (f.puddles.length > 40) f.puddles.splice(0, f.puddles.length - 40);
  // The couch coming at him (unless he's mid-move into it: the skilled way)
  if (f.mode === 'on' && !c.crushed && Math.abs(c.vx) > COUCH_HURTS && hurtable(state) && !attacking(state)) {
    if (hits(pRect(state), { x0: X(c.x) - COUCH_HALF + 6, x1: X(c.x) + COUCH_HALF - 6, y0: STAGE_Y - 56, y1: STAGE_Y })) {
      hurtPlayer(ctx, COUCH_DMG, hurtSrc(state, 'm2:ct_dad_couch'), { x: Math.sign(c.vx) * 12, y: -7 });
      playSound('thud', 1, -6); playSound('punch', 0.8, -8); shakeScreen(state, 8, 4);
      ctx.fx.spawnDamageNumber({ x: state.player.pos.x, y: state.player.pos.y - 20 }, 'SOFA!', true, '#F97316');
    }
  }
  // The wrecks (smoking for good), the stuntmen (flung at the wall, stuck there)
  for (const w of f.wrecks) {
    w.t++;
    if (w.t % (w.t < 200 ? 4 : 26) === 0) {
      const E = eyeOf(state), p = proj(E, X(w.x) + (Math.random() - 0.5) * 50, STAGE_Y - (w.onCouch ? 60 : 30), w.d);
      state.particles.push({ pos: p, vel: { x: (Math.random() - 0.5) * 0.6, y: -0.8 - Math.random() }, life: 50, color: w.t < 200 && Math.random() < 0.4 ? '#F97316' : 'rgba(68, 64, 60, 0.5)', size: 5 + Math.random() * 6 });
    }
  }
  for (const s of f.flung) {
    if (s.stuck) continue;
    s.t++; s.x += s.vx; s.y += s.vy; s.vy += 0.3; s.d = Math.max(D_SET + 0.004, s.d - 0.008);
    if (s.d <= D_SET + 0.004) { s.stuck = true; playSound('splat', 0.9, -4); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Him

const dad = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, m = pmid(state);
  f.actT++;
  const t = f.actT;
  if (f.seated) f.x = seatX(f);
  const toward = (m.x < f.x ? -1 : 1) as 1 | -1;
  switch (f.act) {
    case 'enter':
      f.facing = toward;
      if (t > 90) setAct(f, 'sit');
      break;
    case 'sit': {
      if (f.couch.vx === 0) f.facing = toward;
      // (too close: the mallet; quicker at a move coming in)
      if (f.couch.vx === 0 && t > 6 && f.t - f.swatAt > SWAT_GAP && swatZone(f, state, 16)) {
        f.swatWind = attacking(state) || grabbing(state) ? SWAT_FAST : SWAT_WIND; f.swatHit = false;
        setAct(f, 'swat');
        if (Math.random() < 0.5) bark(f, state, L.DAD_SWAT);
        break;
      }
      // (yelling for beer: off one of them goes to the fridge)
      if (!f.errand && f.t >= f.callAt && f.couch.vx === 0 && alive(f).length && Math.abs(f.couch.x - COUCH_HOME) <= 40) {
        f.callAt = f.t + rnd(...CALL_EVERY);
        const al = alive(f), who = al[Math.floor(Math.random() * al.length)];
        // (the runner's picked first; he yells for that one by name (the user's: "make sure the callouts match"), and it
        // goes once he's said it)
        const er: Errand = { who, step: 'ready', t: 0, left: Math.floor(rnd(BOTTLES[0], BOTTLES[1] + 1)), called: false, wait: 0 };
        f.errand = er;
        dadSays(f, state, L.DAD_BEER_FOR[who], () => { er.called = true; });
      }
      break;
    }
    case 'swat': {
      const W = f.swatWind;
      if (t === W) { playSound('whoosh', 1, -6); }
      // (it hurts where the mallet's head is, swept from last frame's spot to this one's)
      if (t >= W && t <= W + SWAT_LIVE && !f.swatHit && hurtable(state) && swatSweep(f, state, swatT(f, t - 1), swatT(f, t))) {
        f.swatHit = true;
        hurtPlayer(ctx, SWAT_DMG, hurtSrc(state, 'm2:ct_dad_swat'), { x: f.facing * 11, y: -8 });
        playSound('bonk', 1.1, -4); playSound('punch', 0.8, -6); shakeScreen(state, 8, 4);
        ctx.fx.spawnDamageNumber({ x: state.player.pos.x, y: state.player.pos.y - 24 }, 'BONK!', true, '#FDE047');
      }
      if (t >= W + 6 + SWAT_RECOVER) { f.swatAt = f.t; setAct(f, 'sit'); }
      break;
    }
    case 'catch': if (t >= CATCH_T) { setAct(f, 'drink'); playSound('glug', 0.6, -4); } break;
    case 'drink':
      if (t === 24 || t === 44) playSound('glug', 0.5, -6);
      if (t >= DRINK_T) { playSound('burp', 0.8, -4); attack(f, state); }
      break;
    case 'pukeWind':
      if (t === 2) { bark(f, state, L.DAD_PUKE); playSound('retch', 0.9, -2); }
      // (the tell: the cheeks puffing, the couch rocking, longer the further it'll go)
      if (t % 4 === 0) f.couch.squash = Math.max(f.couch.squash, 0.35);
      if (t >= PUKE_TIER[f.pukeTier].wind) {
        setAct(f, 'puke'); f.pukes++;
        f.couch.vx += -f.facing * (Math.min(PUKE_KICK_MAX, PUKE_KICK + PUKE_KICK_MORE * (f.pukes - 1 + f.kills)) + PUKE_TIER[f.pukeTier].kick);
        playSound('gush', 1, -2); playSound('barf', 1, 0); shakeScreen(state, 8, 4);
        if (!f.saidPuke) { f.saidPuke = true; meathead(state, L.MH_PUKE); }
      }
      break;
    case 'puke': {
      // (it comes out of him like a fire hose the way he's facing; the couch goes the other way)
      // (pushed only while it's going the way the puke sends it: after a wall it just rides)
      if (Math.sign(f.couch.vx) === -f.facing) f.couch.vx += -f.facing * PUKE_PUSH;
      const mx = X(f.x) + f.facing * 15, my = STAGE_Y - 64;
      for (let k = 0; k < 2; k++) f.drops.push({ x: mx, y: my, vx: f.facing * rnd(7.5, 11.5) + f.couch.vx * 0.4, vy: rnd(-2.6, 0.6), r: rnd(3, 6), k: Math.floor(Math.random() * 6) });
      if (t % 12 === 0) playSound('gush', 0.6, Math.random() * 3);
      if (t >= PUKE_T && !(t < PUKE_T + PUKE_TIER[f.pukeTier].ride && Math.abs(f.couch.vx) > COUCH_HURTS)) { setAct(f, 'sit'); playSound('burp', 0.6, 4); }
      break;
    }
    case 'rise':
      if (t === 1) { f.seated = false; f.x = seatX(f); }
      if (t >= RISE_T) {
        setAct(f, 'rage'); f.rages++; f.hopAt = 30 + rnd(HOP_GAP[0], HOP_GAP[1]);
        dadSays(f, state, L.DAD_RAGE); playSound('roar', 0.5, 6);
        if (!f.saidRage) { f.saidRage = true; meathead(state, L.MH_RAGE); }
      }
      break;
    case 'rage': {
      // (Donkey Kong: the hammer up and down, after him at a stagger, a hop now and then)
      f.facing = toward;
      // (his knees bend a beat before each hop (the tell): he slows for it)
      const v = (RAGE_WALK + 0.15 * f.kills) * (1 - 0.7 * hopTell(f));
      if (Math.abs(m.x - f.x) > 12) f.x += toward * v;
      if (f.y <= 0 && t >= f.hopAt) { f.vy = rnd(HOP_VY[0], HOP_VY[1]); f.hopAt = t + rnd(HOP_GAP[0], HOP_GAP[1]); playSound('jump', 0.6, -10); }
      airborne(state, f);
      if (t % (HAMMER_BEAT * 2) === HAMMER_BEAT + 3 && f.y <= 0) { playSound('stomp', 0.7, -6); shakeScreen(state, 3, 2); }
      hammer(ctx, f);
      if (t >= RAGE_T && f.y <= 0) { setAct(f, 'tired'); dadSays(f, state, L.DAD_TIRED); }
      break;
    }
    case 'tired':
      airborne(state, f);
      if (t % 26 === 1) playSound('snort', 0.6, 2);
      if (t >= TIRED_T) setAct(f, 'return');
      break;
    case 'return': {
      airborne(state, f);
      const to = seatX(f);
      f.facing = (to < f.x ? -1 : 1) as 1 | -1;
      // (back to the couch at a winded waddle-run, twice his old shuffle (the user's: "he moves more quickly back to the
      // couch after the hammer phase"))
      f.x += Math.sign(to - f.x) * Math.min(RETURN_V, Math.abs(to - f.x));
      if (f.actT % 10 === 0) playSound('snort', 0.4, 4);
      if (Math.abs(to - f.x) < 0.5 && f.y <= 0) { f.seated = true; f.couch.squash = 1; playSound('thud', 0.8, -10); setAct(f, 'sit'); f.callAt = Math.max(f.callAt, f.t + 180); }
      break;
    }
    case 'baffled':
      airborne(state, f);
      if (t >= BAFFLE_T) {
        if (f.sad) setAct(f, 'up');
        else if (f.seated) attack(f, state);
        else { setAct(f, 'rage'); f.hopAt = 20; dadSays(f, state, L.DAD_RAGE); }
      }
      break;
    case 'thrown':
      // (off the crushed couch, up and over onto his ass on the deck)
      airborne(state, f);
      f.x += f.facing * 1.6 * (f.y > 0 ? 1 : 0);
      if (t >= 80) setAct(f, 'up');
      break;
    case 'up': {
      // (no couch, no family: on his feet, barely; after him at a stagger, swinging at air, falling over)
      airborne(state, f);
      f.facing = toward;
      const sway = Math.sin(f.t * 0.05) * 0.6;
      if (Math.abs(m.x - f.x) > 40) f.x += toward * (SAD_WALK + sway);
      if ((t > 240 && Math.random() < 0.004) || (Math.abs(m.x - f.x) < 50 && t > 120 && Math.random() < 0.02)) { setAct(f, Math.random() < 0.35 ? 'heave' : 'trip'); break; }
      if (t % 300 === 150) bark(f, state, L.DAD_PATHETIC);
      break;
    }
    case 'trip':
      if (t === 18) { playSound('thud', 1, -8); shakeScreen(state, 5, 3); }
      if (t >= TRIP_T) setAct(f, 'up');
      break;
    case 'heave':
      if (t === 4) bark(f, state, L.DAD_HEAVY);
      if (t % 20 === 10) playSound('snort', 0.5, 0);
      if (t >= HEAVE_T) setAct(f, 'trip');
      break;
  }
  f.x = Math.max(ARENA.a + 30, Math.min(ARENA.b - 30, f.x));
};

/** His feet off the deck (a hop, thrown): up and down. */
const airborne = (state: GameState, f: Fight) => {
  if (f.y > 0 || f.vy < 0) {
    f.y -= f.vy; f.vy += G;
    if (f.y <= 0) { f.y = 0; f.vy = 0; f.landT = f.t; playSound('thud', 0.8, -10); shakeScreen(state, 4, 2); }
  }
};

/** After a beer (or a family member flattened): the puke or the hammer, in turn. */
const attack = (f: Fight, state: GameState) => {
  void state;
  const a = f.nextAtk;
  f.nextAtk = a === 'puke' ? 'rage' : 'puke';
  if (a === 'puke' && f.seated && !f.couch.crushed) { setAct(f, 'pukeWind'); f.pukeTier = pukeTierOf(f); }
  else setAct(f, 'rise');
};

/** A point of his (his units) in the world: mirrored the way he faces, up off the deck. */
const dadPt = (f: Fight, ux: number, uy: number) => ({ x: X(f.x) - f.facing * ux * DAD_K, y: STAGE_Y - f.y + uy * DAD_K });
/** The mallet's head, as drawn (his near hand at `grip`, the mallet at `ang`), in the world. */
const headRect = (f: Fight, grip: readonly number[], ang: number): R => {
  const h = malletHead(grip, ang), p = dadPt(f, h.x, h.y), hx = h.hx * DAD_K, hy = h.hy * DAD_K;
  return { x0: p.x - hx, x1: p.x + hx, y0: p.y - hy, y1: p.y + hy };
};
/** The mallet's head exactly as drawn: its four corners in the world (the barrel turned with the mallet). */
const headPoly = (f: Fight, grip: readonly number[], ang: number): P[] => {
  const h = malletHead(grip, ang), ux = Math.sin(ang), uy = -Math.cos(ang), vx = Math.cos(ang), vy = Math.sin(ang);
  const A = MALLET_HEAD.along, C = MALLET_HEAD.across;
  return [[-C, -A], [C, -A], [C, A], [-C, A]].map(([a, b]) => dadPt(f, h.x + vx * a + ux * b, h.y + vy * a + uy * b));
};
/** Does the turned head (no padding) touch his box? (Separating axes: the box's two, the head's two.) */
const polyHits = (r: R, poly: P[]) => {
  const box = [{ x: r.x0, y: r.y0 }, { x: r.x1, y: r.y0 }, { x: r.x1, y: r.y1 }, { x: r.x0, y: r.y1 }];
  const axes = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: poly[1].x - poly[0].x, y: poly[1].y - poly[0].y }, { x: poly[3].x - poly[0].x, y: poly[3].y - poly[0].y }];
  for (const a of axes) {
    let p0 = Infinity, p1 = -Infinity, q0 = Infinity, q1 = -Infinity;
    for (const v of box) { const d = v.x * a.x + v.y * a.y; p0 = Math.min(p0, d); p1 = Math.max(p1, d); }
    for (const v of poly) { const d = v.x * a.x + v.y * a.y; q0 = Math.min(q0, d); q1 = Math.max(q1, d); }
    if (p1 <= q0 || q1 <= p0) return false;
  }
  return true;
};
/** The swat's pose (0..1) at its frame `t` (poseOf draws the same). */
const swatT = (f: Fight, t: number) => (t < f.swatWind ? (Math.max(0, t) / f.swatWind) * 0.35 : Math.min(1, 0.35 + ((t - f.swatWind) / 5) * 0.65));
/** Only him down at the couch's level (his feet within this of the deck: on it, on the cushions, on the couch's back)
 *  sets the swat off or gets swatted (the user's: "make it safe to single jump shoulder charge over him. as of now it
 *  triggers his bonk range"): up in a jump's arc over him he's clear. */
const SWAT_BAND = 66;
const lowEnough = (state: GameState) => state.player.pos.y + state.player.height > STAGE_Y - SWAT_BAND;
/** The mallet's head swept from pose `a` to `b`: does it touch him? */
const swatSweep = (f: Fight, state: GameState, a: number, b: number) => {
  if (!lowEnough(state)) return false;
  const pr = pRect(state);
  for (let k = 0; k <= 4; k++) { const g = swatGrip(a + ((b - a) * k) / 4); if (polyHits(pr, headPoly(f, g.near, g.ang))) return true; }
  return false;
};
/** Where the swat reaches (its head's whole swing, and `pad` more round it), to start one. */
const swatZone = (f: Fight, state: GameState, pad: number) => {
  if (!lowEnough(state)) return false;
  const pr = pRect(state);
  for (let k = 0; k <= 8; k++) {
    const g = swatGrip(0.35 + (0.65 * k) / 8), r = headRect(f, g.near, g.ang);
    if (hits(pr, { x0: r.x0 - pad, x1: r.x1 + pad, y0: r.y0 - pad, y1: r.y1 + pad })) return true;
  }
  return false;
};

/** The rage's hammer, 0 up over his head .. 1 down on the deck: up over 5 frames, held up 3, slammed down in 3, held
 *  down 3 (the impact). Continuous, so it's drawn swinging, and it hurts where it's drawn. */
const hammerKAt = (t: number) => {
  const n = HAMMER_BEAT * 2, p = ((t % n) + n) % n;
  if (p < 5) { const e = p / 5; return 1 - e * e * (3 - 2 * e); }
  if (p < 8) return 0;
  if (p < 11) { const e = (p - 7) / 3; return e * e; }
  return 1;
};
/** The swing this frame (`dt` frames back): held up over his head while he's off the deck (the user's: "when i run
 *  under him when he jumps, i get hurt despite his hitbox being above me": the hammer used to keep swinging down below
 *  his feet in the air; up there it's held overhead, so under him is safe all the way). */
const hammerK = (f: Fight, dt = 0) => (f.y > 0 ? 0 : hammerKAt(f.actT - dt));
/** His knees bending for a hop (0..1): the tell before it, the give as he lands. */
const hopTell = (f: Fight) => {
  if (f.act !== 'rage' || f.y > 0) return 0;
  const pre = Math.max(0, Math.min(1, (f.actT - (f.hopAt - HOP_TELL)) / HOP_TELL));
  const land = Math.max(0, 1 - (f.t - f.landT) / LAND_GIVE) * 0.7;
  const k = Math.max(pre, land);
  return k * k * (3 - 2 * k);
};
/** The hammer's head as drawn at swing `k`, knees bent and all (the turned barrel exactly: no padding). */
const hammerPoly = (f: Fight, k: number): P[] => {
  const g = hammerGrip(k), drop = hopTell(f) * 11;
  return headPoly(f, [g.near[0], g.near[1] + drop], g.ang);
};
/** The user's: "the 'donkey kong' attack seems to hit you when you're near him but not touching him. the hurt box seems
 *  oversized". It hurts only where the drawn head really is: this frame's, and (only while it's moving: the slam, the
 *  raise) the in-betweens since last frame so a fast slam can't skip him; held up or down it's just where it is. And
 *  his body: his gut and his chest, not the air round him (34 px wide, his shoulders to his feet). */
const hammer = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  if (!hurtable(state)) return;
  const cx = X(f.x), feet = STAGE_Y - f.y, pr = pRect(state);
  const body: R = { x0: cx - 17, x1: cx + 17, y0: feet - 92, y1: feet };
  if (hits(pr, body)) { hammered(ctx, f); return; }
  const k1 = hammerK(f), k0 = f.y > 0 ? 0 : hammerK(f, 1), n = Math.abs(k1 - k0) > 0.01 ? 3 : 0;
  for (let i = 0; i <= n; i++) if (polyHits(pr, hammerPoly(f, k1 + ((k0 - k1) * i) / Math.max(1, n)))) { hammered(ctx, f); return; }
};
const hammered = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  if (!hurtable(state)) return;
  const p = state.player, dir = p.pos.x + p.width / 2 < X(f.x) ? -1 : 1;
  p.isCharging = false; p.isDivekicking = false; p.isUppercutting = false;
  hurtPlayer(ctx, HAMMER_DMG, hurtSrc(state, 'm2:ct_dad_hammer'), { x: dir * 10, y: -9 });
  playSound('bonk', 1.2, -6); playSound('clang', 0.7, -4); shakeScreen(state, 8, 4);
  ctx.fx.spawnDamageNumber({ x: p.pos.x, y: p.pos.y - 24 }, 'BONK!', true, '#FDE047');
};

// ---------------------------------------------------------------------------------------------------------------
// The beer run: one of the family to the fridge and back, the bottles

/** The family on their tracks: each living one not off on the beer run patrols its stretch a jerk at a time, stopping
 *  now and then. They never hurt him (the user's: "the robots don't hurt you anymore but they do obstruct your shots"). */
const family = (ctx: FrameContext, f: Fight) => {
  void ctx;
  for (const id of MEMBERS) {
    const m = f.family[id];
    if (!m.alive || f.errand?.who === id) continue;
    const tr = TRACKS[id];
    if (m.idle > 0) { m.idle--; continue; }
    // (the patrol, along the very front of the set (in front of everything on it, so what eats his shots is always in
    // sight): off its track (just back from the fridge, the fight's start) it heads to it; on it, a jerk at a time end
    // to end, stopping at the ends and now and then on the way: the windows to Dad open and shut)
    m.stepT++;
    if (m.stepT % PATROL_EVERY) continue;
    const tx = m.x < tr.a ? tr.a : m.x > tr.b ? tr.b : m.x + m.way * PATROL_STEP;
    if (tx >= tr.b) { m.way = -1; m.idle = 40 + Math.floor(Math.random() * 40); } else if (tx <= tr.a) { m.way = 1; m.idle = 40 + Math.floor(Math.random() * 40); }
    else if (m.x >= tr.a && m.x <= tr.b && Math.random() < 0.08) m.idle = 30 + Math.floor(Math.random() * 40);
    const nx = Math.max(Math.min(m.x, tr.a), Math.min(Math.max(m.x, tr.b), tx));
    m.dir = (nx < m.x ? -1 : 1) as 1 | -1;
    m.x += Math.sign(nx - m.x) * Math.min(Math.abs(nx - m.x), PATROL_STEP * 2);
    m.d += (tr.d - m.d) * 0.25;
    if (m.stepT % (PATROL_EVERY * 3) === 0) playSound('click', 0.2, 6);
  }
};
/** A living one of the family's body on screen (its depth's projection): what eats his shots. */
const famRect = (state: GameState, m: Fam): R => {
  const E = eyeOf(state), at = proj(E, X(m.x), STAGE_Y, m.d), h = TRACKS[m.id].sh + 34;
  return { x0: at.x - 20, x1: at.x + 20, y0: at.y - h, y1: at.y };
};
/** The user's: "you gotta have clearance for stupid dad, if an animatronic is in the way, it will eat the shot. they
 *  can only be destroyed with the stunt car." His shots into any of the living family: eaten (a ping, sparks), nothing
 *  to it or to him; now and then, his gripe about it (MH_BLOCKED, the user's line first among them). */
const blockShots = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  if (f.mode !== 'on') return;
  const rects = MEMBERS.filter(id => f.family[id].alive && f.errand?.who !== id).map(id => famRect(state, f.family[id]));
  if (!rects.length) return;
  // (they can't be pushed, flung or grabbed (the user's): a charge, a slide, a dive kick into one stops dead and
  // bounces off it, a clang; it never hurts him)
  const p = state.player, me = pRect(state);
  if ((p.isCharging || p.isSliding || p.isDivekicking) && p.pushbackTimer <= 0) {
    const r = rects.find(q => hits(me, q));
    if (r) {
      const dir = (me.x0 + me.x1) / 2 < (r.x0 + r.x1) / 2 ? -1 : 1;
      p.isCharging = false; p.isSliding = false; p.isDivekicking = false; p.isUppercutting = false;
      p.vel = { x: dir * 4, y: Math.min(p.vel.y, -2) }; p.lockTimer = Math.max(p.lockTimer, 12);
      eaten(state, f, dir < 0 ? r.x0 : r.x1, (me.y0 + me.y1) / 2);
    }
  }
  state.projectiles = state.projectiles.filter(pr => {
    if (pr.owner !== 'player') return true;
    const r: R = { x0: pr.pos.x, x1: pr.pos.x + pr.width, y0: pr.pos.y, y1: pr.pos.y + pr.height };
    const hit = rects.find(q => hits(r, q));
    if (!hit) return true;
    eaten(state, f, pr.pos.x + pr.width / 2, pr.pos.y + pr.height / 2);
    return false;
  });
};
/** A shot (or a move) eaten by one of them: the ping, the sparks, and his gripe every so often. */
const eaten = (state: GameState, f: Fight, x: number, y: number) => {
  playSound('clang', 0.6, 6 + Math.random() * 3);
  for (let i = 0; i < 8; i++) state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 14, color: i % 2 ? '#FDE047' : '#FFFFFF', size: 1.5 + Math.random(), grav: 0.2 });
  f.blocked++;
  if (f.blocked >= 3 && f.t - f.blockSaidAt > 420 && quiet()) { f.blocked = 0; f.blockSaidAt = f.t; meathead(state, L.MH_BLOCKED); }
};
/** Something of the family between him and Dad (for his moves: they eat those too). */
const famBetween = (state: GameState, f: Fight) => {
  const pr = pRect(state), px = (pr.x0 + pr.x1) / 2, dx = X(f.x);
  return MEMBERS.some(id => {
    const m = f.family[id];
    if (!m.alive || f.errand?.who === id) return false;
    const r = famRect(state, m), mx = (r.x0 + r.x1) / 2;
    return mx > Math.min(px, dx) + 4 && mx < Math.max(px, dx) - 4 && pr.y1 > r.y0;
  });
};


/** The camera through the fight (the user's: "zoom out so the whole set is always visible"): eased out to take in the
 *  whole living room, wall to wall, his feet low on the screen, the camera parked on the middle of it; the whole view's
 *  the screen for the rules. His weakness death zooms back in for its kill cam (it's in 1 by then); the standard death
 *  stays out (it's all on the set). */
const SET_ZOOM = 0.66, SET_FEET = 520;
const view = (state: GameState, f: Fight) => {
  const want = f.mode === 'dead' && f.death?.how === 'flat' ? 1 : SET_ZOOM;
  f.zoom += Math.max(-0.008, Math.min(0.008, want - f.zoom));
  state.viewIsScreen = f.zoom < 0.999;
  if (f.mode === 'on' || f.death?.how === 'fridge') {
    const cx = X((ARENA.a + ARENA.b) / 2) - CANVAS_WIDTH / 2;
    const cy = STAGE_Y - CANVAS_HEIGHT / 2 - (SET_FEET - CANVAS_HEIGHT / 2) / f.zoom;
    const cam = state.camera;
    state.cameraOverride = { x: cam.x + (cx - cam.x) * 0.1, y: cam.y + (cy - cam.y) * 0.1 };
  }
};
/** After it's over (VICTORY, the walk-away): the zoom eased back in. */
export const fightZoomHome = (f: Fight) => { f.zoom = Math.min(1, f.zoom + 0.008); };
/** The zoom the stage draws at: the kill cam's (in), else the set's (out). */
export const fightZoom = (state: GameState, f: Fight) => {
  const kc = killCamZoom(state, f);
  if (kc) return kc;
  if (f.zoom >= 0.999) return null;
  return { scale: f.zoom, x: state.camera.x + CANVAS_WIDTH / 2, y: state.camera.y + CANVAS_HEIGHT / 2 };
};
/** A world point on screen, through the zoom. */
const toScreen = (state: GameState, f: Fight, x: number, y: number) => {
  const z = fightZoom(state, f), cx = state.camera.x, cy = state.camera.y;
  if (!z) return { x: x - cx, y: y - cy };
  const sh = z as { shiftX?: number; shiftY?: number };
  return { x: (x - z.x) * z.scale + z.x - cx + (sh.shiftX ?? 0), y: (y - z.y) * z.scale + z.y - cy + (sh.shiftY ?? 0) };
};

const errand = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, er = f.errand;
  if (!er) { f.fridge.open = Math.max(0, f.fridge.open - 0.08); return; }
  const m = f.family[er.who];
  if (!m.alive) { f.errand = null; return; }
  er.t++;
  // (his business elsewhere (up off the couch, puking): the run's off, home it goes)
  if (er.step !== 'back' && (!f.seated || f.couch.crushed || f.act === 'pukeWind' || f.act === 'puke' || f.act === 'rise')) { er.step = 'back'; er.t = 0; }
  // (a rush: flat out, sparking at the wheels, a whine)
  const walk = (to: { x: number; d: number }) => {
    m.stepT++;
    const dx = to.x - m.x, dist = Math.abs(dx);
    if (dist < 1) { m.x = to.x; m.d = to.d; return true; }
    const k = Math.min(1, RUSH / dist);
    m.x += dx * k; m.d += (to.d - m.d) * k; m.dir = (dx < 0 ? -1 : 1) as 1 | -1;
    if (m.stepT % 4 === 0) playSound('click', 0.3, 8);
    if (m.stepT % 3 === 0) { const E = eyeOf(state), q = proj(E, X(m.x), STAGE_Y - 2, m.d); state.particles.push({ pos: q, vel: { x: -m.dir * (1 + Math.random() * 2), y: -1 - Math.random() * 2 }, life: 14, color: m.stepT % 2 ? '#FDE047' : '#FFFFFF', size: 1.5, grav: 0.2 }); }
    // (it goes straight through him: harmless (the user's: "same for beer runs"))
    return false;
  };
  switch (er.step) {
    case 'ready':
      // (it waits for its name to be called (a few seconds at most), then the tell: a klaxon off its chest, it leans the
      // way it's going and revs (sparks at its wheels), then it bolts)
      if (!er.called) { er.wait++; if (er.wait < 300) { er.t = 0; break; } }
      m.dir = (AT_FRIDGE.x < m.x ? -1 : 1) as 1 | -1;
      if (er.t % 6 === 0) { const E = eyeOf(state), q = proj(E, X(m.x), STAGE_Y - 2, m.d); for (let i = 0; i < 3; i++) state.particles.push({ pos: q, vel: { x: -m.dir * (1 + Math.random() * 3), y: -1 - Math.random() * 2 }, life: 12, color: '#FDE047', size: 1.5, grav: 0.2 }); }
      if (er.t === 14) playSound('alarm', 0.5, 6);
      if (er.t >= READY_T) { er.step = 'go'; er.t = 0; playSound('whoosh', 0.8, 4); }
      break;
    case 'go': if (walk(AT_FRIDGE)) { er.step = 'open'; er.t = 0; tape(f, er.who, L.FETCH_TAPE[er.who]); } break;
    case 'open':
      f.fridge.open = Math.min(1, f.fridge.open + 0.07);
      if (er.t >= 24) { er.step = 'toss'; er.t = TOSS_GAP - 6; }
      break;
    case 'toss':
      f.fridge.open = Math.min(1, f.fridge.open + 0.07);
      // (an armful at a time: one at him (the last armful's has the one he catches), the rest flung all over the set,
      // one about where Meathead's stood)
      if (er.t >= TOSS_GAP && !f.bottles.some(b => b.kind === 'catch')) {
        er.t = 0;
        throwBottle(f, er.left <= 1 ? 'catch' : (['short', 'long', 'head', 'wall'] as const)[Math.floor(Math.random() * 4)]);
        const n = SPRAY + (f.kills >= 2 ? 1 : 0);
        // (two of them about where he's stood: with the family harmless now, the bottles keep him moving)
        for (let k = 0; k < n; k++) throwSpray(f, state, k < 2);
        playSound('whoosh', 0.5, 8); playSound('clink', 0.5, 6);
        er.left--;
        if (er.left <= 0) { er.step = 'back'; er.t = 0; }
      }
      break;
    case 'back': {
      // (back to the nearest spot on its own track)
      f.fridge.open = Math.max(0, f.fridge.open - 0.06);
      const tr = TRACKS[er.who];
      if (walk({ x: Math.max(tr.a, Math.min(tr.b, m.x)), d: tr.d }) && !f.bottles.some(b => b.kind === 'catch')) f.errand = null;
      break;
    }
  }
};

const throwBottle = (f: Fight, kind: Miss) => {
  const er = f.errand!, m = f.family[er.who];
  const sx = f.x, hy = STAGE_Y - 72;
  let bx = sx, by = hy, bd = 1;
  if (kind === 'short') { bx = sx + (m.x - sx) * 0.45 + rnd(-20, 20); by = STAGE_Y - 2; bd = 0.97; }
  else if (kind === 'long') { bx = sx - Math.sign(m.x - sx) * rnd(90, 170); by = STAGE_Y - 2; bd = 1; }
  else if (kind === 'wall') { bx = sx + rnd(-60, 40); by = STAGE_Y - rnd(100, 150); bd = D_SET + 0.006; }
  else if (kind === 'head') { bx = sx + f.facing * 4; by = STAGE_Y - 84; bd = 1; }
  else { bx = sx + f.facing * 12; by = STAGE_Y - 100; bd = 1; }
  f.bottles.push({ t: 0, T: BOTTLE_T + Math.floor(Math.random() * 6), ax: m.x, ay: STAGE_Y - 76, ad: m.d, bx, by, bd, kind, rot: 0, arc: 70 });
};
/** One flung wide: down anywhere on the set (`atHim`: about where Meathead's stood), its shadow on the deck as it
 *  comes (the longer the throw, the longer it's up). */
const throwSpray = (f: Fight, state: GameState, atHim: boolean) => {
  const er = f.errand!, m = f.family[er.who], me = pmid(state).x;
  const lo = ARENA.a + 20, hi = ARENA.b - 30;
  const bx = Math.max(lo, Math.min(hi, atHim ? me + rnd(-46, 46) : rnd(lo, hi)));
  const T = BOTTLE_T + 8 + Math.floor(Math.min(20, Math.abs(bx - m.x) / 40));
  f.bottles.push({ t: 0, T, ax: m.x, ay: STAGE_Y - 76, ad: m.d, bx, by: STAGE_Y - 4, bd: 1, kind: 'spray', rot: Math.random() * 6, arc: rnd(90, 150) });
};
/** A bottle's spot this frame: how far along (0..1), x (section), y (world), depth. */
const bottleAt = (b: Bottle) => {
  const u = Math.min(1, b.t / b.T);
  return { u, x: b.ax + (b.bx - b.ax) * u, y: b.ay + (b.by - b.ay) * u - b.arc * Math.sin(Math.PI * u), d: b.ad + (b.bd - b.ad) * u };
};

const bottles = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, E = eyeOf(state);
  for (const b of f.bottles) {
    b.t++; b.rot += 0.45;
    // (coming down at the front of the set: one that hits Meathead hurts a bit and smashes on him)
    if (b.kind !== 'catch' && b.kind !== 'wall' && b.kind !== 'head' && hurtable(state) && f.mode === 'on') {
      const q = bottleAt(b);
      if (q.u > 0.45 && q.d > 0.95) {
        const at = proj(E, X(q.x), q.y, q.d);
        if (hits(pRect(state), { x0: at.x - 5, x1: at.x + 5, y0: at.y - 7, y1: at.y + 7 })) {
          hurtPlayer(ctx, BEER_DMG, hurtSrc(state, 'm2:ct_dad_beer'), { x: Math.sign(b.bx - b.ax || 1) * 4, y: -4 }, 8);
          smash(state, at.x, at.y); playSound('bonk', 0.8, 6);
          b.t = -1; continue;
        }
      }
    }
    if (b.t < b.T) continue;
    const at = proj(E, X(b.bx), b.by, b.bd);
    if (b.kind === 'spray') { smash(state, at.x, at.y); b.t = -1; continue; }
    if (b.kind === 'catch' && (f.act === 'sit' || f.act === 'enter') && f.seated) {
      setAct(f, 'catch'); playSound('clink', 0.9, 0); dadSays(f, state, L.DAD_CATCH);
      if (f.errand) f.errand.left = 0;
    } else {
      smash(state, at.x, at.y);
      if (b.kind === 'head') { playSound('bonk', 1, 4); bark(f, state, L.DAD_BONK); laughTrack(state, 0.7); f.flash = 6; }
      else if (Math.random() < 0.35) bark(f, state, L.DAD_MISS);
      // (the one he should've caught, smashed instead: there's always another)
      if (b.kind === 'catch' && f.errand) { f.errand.left = Math.max(1, f.errand.left + 1); if (f.errand.step === 'back' && f.seated && !f.couch.crushed) { f.errand.step = 'toss'; f.errand.t = 0; } }
    }
    b.t = -1;
  }
  f.bottles = f.bottles.filter(b => b.t >= 0);
};
/** A bottle smashed (world point): glass, foam. */
const smash = (state: GameState, x: number, y: number) => {
  playSound('glass', 0.9, Math.random() * 4);
  for (let i = 0; i < 12; i++) state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 4 }, life: 26 + Math.random() * 10, color: i % 3 === 0 ? '#7A4214' : i % 3 === 1 ? '#FFF6D0' : '#F2C84A', size: 1.5 + Math.random() * 2.5, grav: 0.3 });
};

// ---------------------------------------------------------------------------------------------------------------
// The stunt cars (scripted: each homes in on its one)

/** The nearest of the family to him (or him, once they're all gone). */
const launchCar = (state: GameState, f: Fight) => {
  const m = pmid(state), al = alive(f);
  const target: Member | 'dad' = al.length ? al.sort((a, b) => Math.abs(f.family[a].x - m.x) - Math.abs(f.family[b].x - m.x))[0] : 'dad';
  const to = target === 'dad' ? { x: f.x, d: 1 } : { x: f.family[target].x, d: f.family[target].d };
  // (out of nowhere, up off a ramp nobody can see, from behind him)
  const ax = Math.max(ARENA.a - 420, Math.min(ARENA.b + 420, m.x - state.player.facing * 560));
  const dir = (to.x >= ax ? 1 : -1) as 1 | -1;
  const T = Math.max(34, Math.min(64, Math.abs(to.x - ax) / CAR_V));
  f.cars.push({ t: 0, T, ax, ay: STAGE_Y - 250, bx: to.x, by: STAGE_Y - 10, bd: to.d, dir, paint: Math.floor(Math.random() * 8), wheel: 0, target, hop: false, couch: false });
  if (target === 'dad') { bark(f, state, L.DAD_SEES_CAR); }
};
/** Where a car is this frame: x, y (world), depth, its nose's angle. */
const carAt = (c: Car) => {
  const u = Math.min(1, c.t / c.T);
  const x = c.ax + (c.bx - c.ax) * u, d = c.hop || c.couch ? 1 + (c.bd - 1) * u : 1 + (c.bd - 1) * u * u;
  const arc = c.hop ? 70 : 110;
  const y = c.ay + (c.by - c.ay) * u - arc * Math.sin(Math.PI * Math.min(1, u * 1.1));
  const u2 = Math.min(1, u + 0.04), y2 = c.ay + (c.by - c.ay) * u2 - arc * Math.sin(Math.PI * Math.min(1, u2 * 1.1));
  return { x, y, d, rot: Math.max(-0.6, Math.min(0.9, Math.atan2(y2 - y, Math.abs(c.bx - c.ax) * 0.04 + 0.01) * 0.6)) };
};

const cars = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  for (const c of f.cars) {
    c.t++; c.wheel += 1.2;
    // (homing: on whoever it's for, wherever they've got to)
    if (!c.hop) {
      if (c.target === 'dad') c.bx = f.x;
      else { const m = f.family[c.target]; c.bx = m.x; c.bd = m.d; }
    }
    if (c.t % 2 === 0) { const at = carAt(c), E = eyeOf(state), p = proj(E, X(at.x) - c.dir * 50, at.y, at.d); state.particles.push({ pos: p, vel: { x: -c.dir, y: -0.4 }, life: 16, color: 'rgba(120, 113, 108, 0.5)', size: 4 + Math.random() * 3 }); }
    if (c.t < c.T) continue;
    const E = eyeOf(state), hitP = proj(E, X(c.bx), c.by, c.bd);
    boom(ctx, hitP.x, hitP.y);
    if (c.couch) { crushCouch(ctx, f, c); c.t = -1; continue; }
    if (c.target === 'dad') { c.t = -1; die(ctx, f, 'flat', c); continue; }
    const who = c.target, m = f.family[who];
    m.alive = false;
    f.flung.push({ x: X(c.bx), y: STAGE_Y - 60, d: c.bd, vx: c.dir * 1.2, vy: -6, t: 0, dir: c.dir, seed: f.kills + 3, stuck: false });
    onKill(ctx, f, who);
    // (the second-to-last one: on it goes, a hop off the wreck, down onto his couch)
    if (f.kills === 3 && !f.couch.crushed) {
      f.couch.vx = 0;
      c.hop = true; c.couch = true; c.t = 0; c.T = 30; c.ax = c.bx; c.ay = STAGE_Y - 30; c.bx = f.couch.x; c.by = STAGE_Y - 30; c.bd = 1;
      continue;
    }
    f.wrecks.push({ x: c.bx, d: c.bd, dir: c.dir, paint: c.paint, t: 0, onCouch: false });
    c.t = -1;
  }
  f.cars = f.cars.filter(c => c.t >= 0);
};
/** The stunt going off (world point): the flip and the fireball. */
const boom = (ctx: FrameContext, x: number, y: number) => {
  const { state, fx } = ctx;
  playSound('crash', 1, -2); playSound('boom', 0.9, -4); shakeScreen(state, 16, 8);
  fx.spawnExplosion({ x, y }, '#F97316', 30, 0, 22);
  fx.spawnExplosion({ x, y }, '#FDE047', 16, 0, 14);
  fx.spawnExplosion({ x, y: y - 20 }, '#57534E', 14, 0, 20);
};

/** One of the family flattened: him more baffled each time, the laugh track, and (the first two) his counter. */
const onKill = (ctx: FrameContext, f: Fight, who: Member) => {
  const { state } = ctx;
  f.kills++;
  if (f.errand?.who === who) f.errand = null;
  f.words.delete(who);
  tape(f, who, L.DIE_TAPE[who]);
  laughTrack(state, 0.8);
  if (Math.random() < 0.6) meathead(state, L.MH_KILL);
  // (whatever he was at, he stops; the puke's cut off; the couch slides on by itself)
  const n = f.kills;
  if (n === 3) { setAct(f, 'baffled'); return; }
  dadSays(f, state, L.DAD_KILL[Math.min(3, n - 1)]);
  setAct(f, 'baffled');
  // (the last of them: no counter (he's up, pathetic: no drunken anything))
  if (n === 4) f.sad = true;
};

/** The second-to-last car comes down on the couch: it's crushed, he's thrown off it, up for good and pathetic. */
const crushCouch = (ctx: FrameContext, f: Fight, c: Car) => {
  const { state } = ctx, m = pmid(state);
  const cc = f.couch;
  cc.crushed = true; cc.vx = 0; cc.squash = 1;
  f.wrecks.push({ x: cc.x, d: 1, dir: c.dir, paint: c.paint, t: 0, onCouch: true });
  playSound('crunch', 1, -6); playSound('thud', 1.2, -12);
  for (let i = 0; i < 20; i++) state.particles.push({ pos: { x: X(cc.x) + (Math.random() - 0.5) * 120, y: STAGE_Y - 30 }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 5 }, life: 50, color: i % 2 ? '#F4EFE2' : '#E0752E', size: 2 + Math.random() * 3, grav: 0.25 });
  f.seated = false; f.sad = true;
  f.facing = (m.x < f.x ? -1 : 1) as 1 | -1;
  f.vy = -9; f.y = 1;
  if (f.errand) f.errand.step = 'back';
  setAct(f, 'thrown');
  dadSays(f, state, L.DAD_KILL[2]);
  meathead(state, L.MH_COUCH, true);
};

// ---------------------------------------------------------------------------------------------------------------
// Chatter: at the family (the tape fires back, the laugh track), the Al Bundy dig, at him

const memberOf = (line: string): Member | null => (/\bSIS\b/.test(line) ? 'sis' : /GRAMPS/.test(line) ? 'gramps' : /MARLENE/.test(line) ? 'mom' : /\bBOY\b/.test(line) ? 'boy' : null);
const SNARK: Record<Member, string[]> = { mom: L.MOM_SNARK, boy: L.BOY_SNARK, sis: L.SIS_SNARK, gramps: L.GRAMPS_SNARK };
const chatter = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  if (f.t < f.chatAt || f.act !== 'sit' || f.errand || !quiet()) return;
  f.chatAt = f.t + rnd(...CHAT_EVERY);
  const r = Math.random();
  if (f.bundy < 2 && (f.bundy === 0 ? f.t > 700 : r < 0.25)) {
    f.bundy++;
    dadSays(f, state, L.DAD_BUNDY, tokened(() => { laughTrack(state, 0.6); if (f.bundy === 1) meathead(state, L.MH_BUNDY, true); }));
    return;
  }
  const pool = byPants(state, L.DAD_SNIPE).filter(l => { const m = memberOf(l); return m && f.family[m].alive; });
  if (r < 0.7 && pool.length) {
    const text = pick(pool), who = memberOf(text)!;
    const tok = token;
    speak(L.VOICES.dad, text, s => { if (tok !== token) return; if (s) f.words.set('dad', s.text); else f.words.delete('dad'); }, true, () => {
      if (tok !== token || !f.family[who].alive) return;
      tape(f, who, SNARK[who], () => laughTrack(state, 0.9));
    });
    return;
  }
  dadSays(f, state, L.DAD_TAUNT);
};

// ---------------------------------------------------------------------------------------------------------------
// Hits on him

/** Nothing left but him: the family all flattened, the couch crushed, him up flailing (any hit's the last). */
const doomed = (f: Fight) => f.mode === 'on' && f.couch.crushed && !alive(f).length;
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
  // (the user's rule: once the family's all gone and the couch is crushed, him up flailing, anything kills him in one)
  const done = doomed(f);
  if (dealt <= 0 || !state.enemies.includes(e) || (f.iframes > 0 && !done)) return;
  // (in the rage nothing lands but what's fired at him (the moves get him hammered: touch above))
  if (melee && (f.act === 'rage' || f.act === 'rise')) return;
  // (one of the family in the way of his move: it eats it)
  if (melee && famBetween(state, f)) { const pr = pRect(state); eaten(state, f, (pr.x0 + pr.x1) / 2 + state.player.facing * 20, pr.y0 + 30); return; }
  const plain = plainHit(state, melee);
  // (no hint at a weapon he hasn't got (the user's))
  if (plain === null && state.player.availableWeapons.includes('STUNT_CAR') && state.player.currentWeapon !== 'STUNT_CAR' && f.kills === 0 && (++f.wrongN === 2 || f.wrongN % 5 === 0) && f.t - f.hintAt > HINT_GAP) {
    f.hintAt = f.t; meathead(state, L.MH_HINT);
  }
  const dmg = done ? Math.max(1, f.hp) : (plain ?? Math.max(1, dealt * SHARE)) * (f.sad ? SAD_MULT : 1);
  f.hp -= dmg; f.iframes = f.sad ? SAD_IFRAMES : IFRAMES; f.flash = 8;
  const cx = X(f.x), feet = STAGE_Y - f.y;
  for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: cx, y: feet - 60 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 18, color: '#B91C1C', size: 2 + Math.random() * 2, grav: 0.3 });
  playSound('gunhit', 0.5, 2);
  ctx.fx.spawnDamageNumber({ x: cx - 10, y: feet - DAD_H - 10 }, Math.max(1, Math.round(dmg)), dmg > 40);
  if (f.hp > 0 && Math.random() < 0.15) bark(f, state, L.DAD_HURT);
};

/** The enemy, where he is (the play plane, at him). */
const sync = (state: GameState, f: Fight) => {
  const e = f.e;
  e.pos.x = X(f.x) - e.width / 2; e.pos.y = STAGE_Y - f.y - e.height - 2;
  e.vel.x = 0; e.vel.y = 0; e.facing = f.facing; e.initialY = e.pos.y;
  e.hitCooldown = doomed(f) ? 0 : f.iframes;
  e.pauseTimer = 0; e.frozenTimer = 0; e.isTased = false; e.sludgeTimer = 0; e.returnHome = false; e.puppet = false;
  void state;
};

// ---------------------------------------------------------------------------------------------------------------
// Dying (both deaths are cutscenes: no input, no HUD, SKIP >> for the lot)

const die = (ctx: FrameContext, f: Fight, how: 'fridge' | 'flat', car?: Car) => {
  const { state } = ctx, p = state.player;
  if (f.mode === 'dead') return;
  token++; silenceAll(); state.playerVulgarityTimer = 0;
  f.mode = 'dead'; f.words.clear();
  state.enemies = state.enemies.filter(o => o !== f.e);
  state.damageNumbers = [];
  f.errand = null; f.bottles = []; f.drops = []; f.cars = []; f.couch.vx = 0; f.fridge.open = 0;
  p.inCutscene = true;
  f.death = { how, t: 0, step: 'start', at: 0, creep: 0, fall: 0, car: null, pile: [], heap: 0, seep: 0, roll: null, stunt: null, skipT: 0, walk: 0, tip: 1 };
  if (how === 'flat') {
    f.seated = false; f.y = 0;
    f.death.car = { x: f.x, rot: 0, vx: 0 };
    f.wrecks.push({ x: f.x, d: 1, dir: car?.dir ?? 1, paint: car?.paint ?? 0, t: 0, onCouch: false });
    f.cam = { t: 0, acc: 0, z: 1, out: false };
    playSound('crunch', 1.2, -8); playSound('squish', 1, -10);
  } else playSound('hurt', 0.8, -6);
};

/** The sound of the house lights for the finish: the laugh track and the APPLAUSE sign. */
const dying = (ctx: FrameContext, f: Fight): Controls => {
  const { state } = ctx, d = f.death!, p = state.player;
  d.t++; d.skipT++;
  p.inCutscene = true;
  const t = d.t;
  let out: Controls = { ...NO_CONTROLS };
  const skippable = f.deathSaid < 4 && t > 30;
  if (skippable && d.skipT > SKIP_AFTER) offerSkip();
  if (skippable && d.skipT > SKIP_AFTER && takeSkip()) { token++; silenceAll(); state.playerVulgarityTimer = 0; f.words.clear(); finish(state, f); return out; }
  out = d.how === 'flat' ? flatDeath(ctx, f, d) : fridgeDeath(ctx, f, d);
  // (the camera on him, kept to the arena)
  if (d.how === 'flat') {
    const want = camFor(X(f.x));
    const cam = state.camera.x + (want - state.camera.x) * 0.08;
    state.cameraOverride = { x: cam, y: state.camera.y + (STAGE_Y - 500 - state.camera.y) * 0.1 };
  }
  void p;
  // (it never hangs)
  if (t > 2400) f.deathSaid = 4;
  return out;
};
const camFor = (x: number) => Math.max(X(ARENA.a - 100), Math.min(x1 - CANVAS_WIDTH, x - CANVAS_WIDTH / 2));

/** Skipped: straight to how it ends (the pancake, or the fridge on him with the can at Meathead's feet). */
const finish = (state: GameState, f: Fight) => {
  const d = f.death!;
  if (d.how === 'flat') {
    const w = f.wrecks[f.wrecks.length - 1];
    if (f.x + d.tip * 150 > ARENA.b - 90 || f.x + d.tip * 150 < ARENA.a + 90) d.tip = -d.tip;
    if (w) w.x = f.x + d.tip * 150;
    d.stunt = { x: X(f.x + d.tip * 150) - d.tip * 30, y: STAGE_Y, vy: 0, up: true }; if (f.cam) f.cam.out = true;
    d.t = Math.max(d.t, 200); d.step = 'flop'; d.at = d.t - FLOP_T - 10;
  }
  else {
    // (the fridge down on him, flat; the cans out of it on the deck; the seep, the blood)
    d.step = 'done'; d.creep = 1; d.fall = 1; d.heap = 40; f.x = STAND_AT; f.y = 0; f.seated = false; f.facing = 1; f.fridge.open = 0; f.fridge.jolt = 0;
    if (!d.pile.length) for (let k = 0; k < 10; k++) d.pile.push({ x: X(fridgePivot(f) - FRIDGE_LONG * (0.1 + k * 0.09)) + rnd(-20, 20), y: STAGE_Y - 4, vx: 0, vy: 0, rot: k * 1.3, vr: 0, still: true });
    for (const k of d.pile) { k.still = true; k.y = STAGE_Y - 4; }
    d.seep = 60;
    const px = state.player.pos.x + state.player.width / 2;
    d.roll = { x: px + (X(f.x) > px ? 34 : -34), vx: 0, open: 1 };
  }
  f.deathSaid = 4; d.t = Math.max(d.t, 200);
};

/** The weakness: the kill cam, the car on him burning, tipped off; the pancake. */
const flatDeath = (ctx: FrameContext, f: Fight, d: Death): Controls => {
  const { state } = ctx, t = d.t, p = state.player;
  const w = f.wrecks[f.wrecks.length - 1];
  // (Meathead off out of the way of it, if he was stood right by him: a few steps back)
  const dx = p.pos.x + p.width / 2 - X(f.x);
  let out: Controls = { ...NO_CONTROLS };
  if (d.walk === 0 && Math.abs(dx) < 150) {
    const away = dx < 0 ? -1 : 1, room = away < 0 ? p.pos.x - X(ARENA.a) : X(ARENA.b) - p.pos.x - p.width;
    d.walk = room > 160 ? away : -away;
  }
  if (d.walk !== 0 && dx * d.walk < 150 && p.isGrounded) out = { ...NO_CONTROLS, [d.walk < 0 ? 'left' : 'right']: true };
  if (d.step === 'start') {
    if (t % 9 === 0 && t < 80) playSound('flame', 0.4, Math.random() * 4);
    if (t === 60 && f.cam) f.cam.out = true;
    if (t >= 96) {
      d.step = 'tip'; d.at = t; playSound('crunch', 0.8, -2);
      // (off him the side away from Meathead, if there's room)
      let side = d.walk !== 0 ? -d.walk : (p.pos.x + p.width / 2 < X(f.x) ? 1 : -1);
      if (f.x + side * 150 > ARENA.b - 90 || f.x + side * 150 < ARENA.a + 90) side = -side;
      d.tip = side;
    }
  }
  if (d.step === 'tip') {
    // (the wreck tips off him, over onto its roof the other side)
    const k = Math.min(1, (t - d.at) / 26);
    if (w) w.x = f.x + d.tip * 150 * k;
    if (k >= 1) {
      d.step = 'flat'; d.at = t;
      playSound('thud', 1, -8); laughTrack(state, 1);
      d.stunt = { x: X(f.x + d.tip * 150) - d.tip * 10, y: STAGE_Y - 20, vy: -7, up: false };
      playSound('squish', 0.8, 6);
    }
  }
  if (d.step === 'flat' || d.step === 'peel' || d.step === 'paper' || d.step === 'flop') {
    // (the stuntman up out of the wreck, a thumbs-up to the house)
    const s = d.stunt;
    if (s && !s.up) { s.y += s.vy; s.vy += 0.4; s.x -= 2 * d.tip; if (s.y >= STAGE_Y) { s.y = STAGE_Y; s.up = true; playSound('land', 0.8, 0); } }
  }
  // (a pancake on the deck a beat; he peels up off it, paper-thin, wobbling in the draft; his last words; over he goes,
  // fluttering down flat again like a sheet of paper; Meathead's)
  if (d.step === 'flat' && t >= d.at + 46) { d.step = 'peel'; d.at = t; playSound('squish', 0.7, 10); }
  if (d.step === 'peel' && t >= d.at + PEEL_T) { d.step = 'paper'; d.at = t; }
  if (d.step === 'paper' && t === d.at + 10 && f.deathSaid === 0) {
    f.deathSaid = 1;
    dadSays(f, state, L.DAD_FLAT, tokened(() => { d.step = 'flop'; d.at = d.t; playSound('whoosh', 0.5, 8); }));
  }
  if (d.step === 'flop' && t === d.at + FLOP_T) { playSound('squish', 0.5, 4); laughTrack(state, 0.8); meathead(state, L.MH_WON_WEAK, true, tokened(() => { f.deathSaid = 4; })); }
  return out;
};
/** The paper man: peeling up off the deck (frames), toppling back down. */
const PEEL_T = 34, FLOP_T = 46;
/** How the pancake's standing (0 flat on the deck .. 1 up on end), and its tip over (radians), this frame. */
const paperOf = (d: Death) => {
  const u = d.t - d.at;
  if (d.step === 'peel') return { up: Math.min(1, u / PEEL_T), rot: 0 };
  if (d.step === 'paper') return { up: 1, rot: 0 };
  if (d.step === 'flop') { const k = Math.min(1, u / FLOP_T); return { up: 1 - k * k, rot: k * 0.3 + Math.sin(u * 0.4) * 0.08 * (1 - k) }; }
  return { up: 0, rot: 0 };
};

/** The standard death (the user's): up for a beer at last, to the fridge; it rocks off the wall, wobbles, and comes
 *  down on him. */
const FRIDGE_HALF = 28, FRIDGE_LONG = 120;
/** Where he stands to yank on it (his feet), where its foot pivots as it tips over (its near bottom corner). */
const STAND_AT = FRIDGE.x - 80;
const fridgePivot = (f: Fight) => FRIDGE.x + f.fridge.dx - FRIDGE_HALF;
const fridgeDeath = (ctx: FrameContext, f: Fight, d: Death): Controls => {
  const { state } = ctx, t = d.t, p = state.player;
  let out: Controls = { ...NO_CONTROLS };
  // (Meathead out of the way of it: walked back off a way if he's anywhere it'll land)
  const pm = pmid(state);
  if (d.step !== 'done' && d.step !== 'roll' && pm.x > STAND_AT - 230 && p.isGrounded) out = { ...NO_CONTROLS, left: true };
  const fr = f.fridge;
  switch (d.step) {
    case 'start':
      // (off the couch (or down out of a hop), the line, up)
      f.y = Math.max(0, f.y - 6);
      if (t === 10) dadSays(f, state, L.DAD_FRIDGE);
      if (t >= (f.seated ? 70 : 30)) { f.seated = false; d.step = 'walk'; d.at = t; }
      break;
    case 'walk':
      f.facing = 1;
      f.x += Math.sign(STAND_AT - f.x) * Math.min(1.4, Math.abs(STAND_AT - f.x));
      if (Math.abs(STAND_AT - f.x) < 0.5) { d.step = 'yank'; d.at = t; }
      break;
    case 'yank': {
      // (the door's stuck (it's packed solid): he yanks, and yanks, and the whole thing rocks off the wall toward him)
      const u = t - d.at;
      if (u % 16 === 4) { playSound('thud', 0.6, -6); playSound('clink', 0.6, 2); d.creep = Math.min(1, d.creep + 0.24); fr.jolt = 0.7; }
      if (u >= 70) { d.step = 'wobble'; d.at = t; dadSays(f, state, L.DAD_WOBBLE); }
      break;
    }
    case 'wobble': {
      // (it rocks on its corners, the bottles inside clinking; he looks up at it)
      const u = t - d.at;
      fr.jolt = Math.min(1.4, 0.6 + u * 0.02);
      if (u % 9 === 0) playSound('clink', 0.5, 4 + Math.random() * 4);
      if (u === 20) playSound('rumble', 0.6, -6);
      if (u >= 60 && !isTalking()) { d.step = 'fall'; d.at = t; playSound('whoosh', 0.8, -8); }
      break;
    }
    case 'fall': {
      // (over it goes, onto him, faster and faster)
      const u = t - d.at;
      fr.jolt = 0; d.fall = Math.min(1, (u / 16) * (u / 16));
      if (d.fall >= 1) {
        d.step = 'crushed'; d.at = t;
        playSound('crash', 1, -4); playSound('crunch', 1.2, -8); playSound('squish', 1, -10); playSound('glass', 0.8, 2); shakeScreen(state, 16, 10);
        laughTrack(state, 1);
        const x0 = X(fridgePivot(f) - FRIDGE_LONG);
        for (let i = 0; i < 24; i++) state.particles.push({ pos: { x: x0 + Math.random() * FRIDGE_LONG, y: STAGE_Y - 4 }, vel: { x: (Math.random() - 0.5) * 7, y: -1 - Math.random() * 4 }, life: 40, color: i % 3 ? '#D6D3D1' : '#8E9A3E', size: 3 + Math.random() * 4, grav: 0.2 });
        // (the user's: "it opens and spills tons of beer bottles when it topples on top of him": the door bursts open as
        // it lands and forty years of it comes out, bottles and cans, bouncing, rolling, foaming, both ways along the deck
        // (mostly away from his head, so you can still see it))
        for (let k = 0; k < 70; k++) {
          const ox = X(fridgePivot(f) - FRIDGE_LONG * (0.15 + Math.random() * 0.8)), right = Math.random() < 0.72;
          d.pile.push({ x: ox, y: STAGE_Y - 30 - Math.random() * 20, vx: (right ? 1 : -1) * rnd(1, 7.5), vy: rnd(-9, -2), rot: Math.random() * 6, vr: rnd(-0.5, 0.5), still: false, bottle: Math.random() < 0.55 });
        }
        for (let i = 0; i < 30; i++) state.particles.push({ pos: { x: x0 + Math.random() * FRIDGE_LONG, y: STAGE_Y - 30 }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 5 }, life: 40, color: i % 2 ? '#FFFFFF' : '#F2C84A', size: 2 + Math.random() * 3, grav: 0.2 });
        playSound('glass', 1, -2); playSound('clink', 1, 6);
      }
      break;
    }
    case 'crushed':
      if (t === d.at + 40) { playSound('fart', 1, -6); playSound('poopsplat', 0.7, -4); }
      if (t > d.at + 40) d.seep = Math.min(60, d.seep + 0.6);
      d.heap = Math.min(40, d.heap + 0.5);
      if (t === d.at + 70 && f.deathSaid === 0) { f.deathSaid = 1; dadSays(f, state, L.DAD_CRUSHED, tokened(() => { d.step = 'roll'; d.at = d.t; })); }
      break;
    case 'roll': {
      // (one can rolls out from under it, across the deck to his feet; it cracks open on its own)
      const px = p.pos.x + p.width / 2;
      if (!d.roll) d.roll = { x: X(fridgePivot(f) - FRIDGE_LONG) - 10, vx: -5, open: 0 };
      const r = d.roll, stop = px + 34;
      if (r.x > stop) { r.x += r.vx; if (t % 8 === 0) playSound('clink', 0.3, 6); }
      else if (r.open === 0) { r.open = 1; playSound('canopen', 1, 0); for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: r.x, y: STAGE_Y - 6 }, vel: { x: (Math.random() - 0.5) * 3, y: -2 - Math.random() * 3 }, life: 30, color: i % 2 ? '#FFFFFF' : '#F2C84A', size: 2 + Math.random() * 2, grav: 0.25 }); meathead(state, L.MH_WON, true, tokened(() => { f.deathSaid = 4; d.step = 'done'; })); }
      break;
    }
    default: break;
  }
  // The cans and bottles out of it: tumbling, bouncing (a clink), rolling to a stop; none comes to rest over his head
  // (it stays readable sticking out the end)
  const hx0 = X(f.x) - 132, hx1 = X(f.x) - 70;
  for (const k of d.pile) {
    if (k.still) continue;
    k.x += k.vx; k.y += k.vy; k.vy += 0.4; k.rot += k.vr;
    if (k.vy > 0 && k.y >= STAGE_Y - 4) {
      k.y = STAGE_Y - 4;
      if (k.vy > 2.5) { k.vy = -k.vy * 0.38; k.vx *= 0.7; k.vr *= 0.6; if (Math.random() < 0.3) playSound('clink', 0.3, 4 + Math.random() * 6); }
      else { k.vy = 0; k.vx *= 0.9; k.rot = Math.PI / 2 * (k.vx >= 0 ? 1 : -1); if (Math.abs(k.vx) < 0.3) { k.still = true; if (k.x > hx0 && k.x < hx1) k.x = k.x - hx0 < hx1 - k.x ? hx0 - 4 : hx1 + 4; } }
    }
  }
  // (the stage cleared for it (the user's: "move all props so they aren't in the way"): the family left standing
  // backs off to the far left of the set, the wrecks and what's left of the others slide clear of his walk and the
  // fridge's fall, the puddles mopped)
  if (d.t < 120) {
    const lo = STAND_AT - 260, hi = FRIDGE.x + 60;
    let slot = 0;
    for (const id of MEMBERS) {
      const m = f.family[id];
      if (m.alive) { const to = ARENA.a + 40 + slot++ * 70; m.x += Math.sign(to - m.x) * Math.min(6, Math.abs(to - m.x)); m.d += (0.9 - m.d) * 0.08; }
      else if (m.x > lo && m.x < hi) m.x = Math.max(lo - 20, m.x - 6);
    }
    for (const w of f.wrecks) if (!w.onCouch && w.x > lo && w.x < hi) w.x = Math.max(lo - 60, w.x - 6);
    for (const s of f.flung) if (!s.stuck && X(lo) < s.x && s.x < X(hi)) s.x -= 6;
    f.puddles = f.puddles.filter(pu => pu.x < X(lo) || pu.x > X(hi));
  }
  return out;
};

/** Done with: his death played out, everybody's had their say. */
export const fightOver = (f: Fight) => f.mode === 'dead' && !!f.death && f.deathSaid >= 4 && f.death.t > 150 && (!f.cam || f.cam.z <= 1);
export const endFight = (state: GameState, f: Fight) => { state.player.inCutscene = false; state.cameraOverride = null; state.viewIsScreen = false; live = null; void f; };
export const killedByWeakness = (f: Fight) => f.death?.how === 'flat';
/** For the music: the fight's mood (on, him up and pathetic, the end). */
export const fightMood = (f: Fight): 'on' | 'sad' | 'dead' => (f.mode === 'dead' ? 'dead' : f.sad ? 'sad' : 'on');

// ---------------------------------------------------------------------------------------------------------------
// The kill cam (the weakness death): Steve's, near enough

const CAM_Z = 2.1, SLOW = 0.25, SLOW_HOLD = 50, SLOW_RAMP = 90;
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
  const cam = f.cam;
  if (!cam || cam.z <= 1) return null;
  const k = (cam.z - 1) / (CAM_Z - 1), m = CANVAS_WIDTH / 2 / CAM_Z;
  const fx = Math.max(state.camera.x + m, Math.min(state.camera.x + CANVAS_WIDTH - m, X(f.x))), fy = STAGE_Y - 50;
  return { scale: cam.z, x: fx, y: fy, shiftX: k * (state.camera.x + CANVAS_WIDTH / 2 - fx), shiftY: k * (state.camera.y + CANVAS_HEIGHT / 2 + 40 - fy) };
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

type Item = { d: number; x: number; draw: () => void };

/** His pose and how far through it, this frame. */
const poseOf = (f: Fight): { pose: DadPose; t: number; face?: DadFace; can: 'near' | null; rot: number; crouch?: number } => {
  const t = f.actT, d = f.death;
  if (d) {
    if (d.how === 'fridge') {
      if (d.step === 'start') return { pose: f.seated && d.t < 70 ? 'rise' : 'stand', t: Math.min(1, d.t / 70), can: null, rot: 0 };
      if (d.step === 'walk') return { pose: 'shuffle', t: 0, can: null, rot: 0 };
      if (d.step === 'yank') return { pose: 'fridge', t: 0, face: 'strain', can: null, rot: (d.t - d.at) % 16 < 5 ? -0.06 : 0 };
      if (d.step === 'wobble' && d.t - d.at < 24) return { pose: 'fridge', t: 0, face: 'wide', can: null, rot: 0 };
      return { pose: 'cower', t: 0, face: 'wide', can: null, rot: 0 };
    }
    return { pose: 'stand', t: 0, can: null, rot: 0 };
  }
  switch (f.act) {
    case 'swat': return { pose: 'swat', t: swatT(f, t), can: null, rot: 0 };
    case 'catch': return { pose: 'catch', t: 0, can: null, rot: 0 };
    case 'drink': return { pose: 'sip', t: 0, can: null, rot: 0 };
    case 'pukeWind': return { pose: 'sit', t: 0, face: 'burp', can: null, rot: 0 };
    case 'puke': return { pose: 'puke', t: 0, can: null, rot: 0 };
    case 'rise': return { pose: 'rise', t: t / RISE_T, can: null, rot: 0 };
    case 'rage': return { pose: 'hammer', t: hammerK(f), can: null, rot: 0, crouch: hopTell(f) };
    case 'tired': return { pose: 'stand', t: 0, face: 'strain', can: null, rot: 0 };
    case 'return': return { pose: 'shuffle', t: 0, can: null, rot: 0 };
    case 'baffled': return f.seated ? { pose: 'baffled', t: 0, can: null, rot: 0 } : { pose: 'stand', t: 0, face: 'wide', can: null, rot: 0 };
    case 'thrown': return { pose: 'stagger', t: 0, face: 'wide', can: null, rot: f.y > 0 ? -f.facing * Math.min(1.2, t * 0.06) : -f.facing * Math.max(0, 1.2 - (t - 40) * 0.04) };
    case 'up': return { pose: 'stagger', t: 0, can: null, rot: Math.sin(f.t * 0.07) * 0.08 };
    case 'trip': { const k = t < 18 ? t / 18 : t > TRIP_T - 20 ? (TRIP_T - t) / 20 : 1; return { pose: 'stagger', t: 0, face: 'out', can: null, rot: f.facing * k * 1.45 }; }
    case 'heave': return { pose: 'heave', t: 0, can: null, rot: 0 };
    default: return { pose: 'sit', t: 0, can: 'near', rot: 0 };
  }
};

/** The mallet in his hands (his units, his near and far hands), by what he's at. */
const heldFor = (f: Fight, pose: DadPose) => (c: Ctx, near: number[], far: number[]) => {
  const put = (gx: number, gy: number, ang: number) => { c.save(); c.translate(gx, gy); c.rotate(ang); drawMallet(c); c.restore(); };
  // (the swat and the hammer: the grip in his near hand at the angle the hits are worked out from (dad.ts))
  if (pose === 'swat') put(near[0], near[1], swatGrip(swatT(f, f.actT)).ang);
  else if (pose === 'hammer') { void far; put(near[0], near[1], hammerGrip(hammerK(f)).ang); }
  else if (pose === 'stagger' && f.act !== 'thrown' && f.mode === 'on') put(near[0], near[1], 2.1);
  else if (pose === 'heave') put(near[0], near[1], -1.7);
  else if (pose === 'sip') { c.save(); c.translate(near[0] - 3, near[1] - 4); c.rotate(2.0); drawBottle(c, 0, 0, 0); c.restore(); }
};

/** Everything of the fight's on the stage, for the amphitheater's far-to-near sort (art.ts drawAmphiBack draws each at
 *  its depth). */
export const fightItems = (c: Ctx, state: GameState, f: Fight): Item[] => {
  const fr = state.frame, items: Item[] = [];
  const at = (d: number, x: number, draw: () => void) => items.push({ d, x, draw });
  // (the fridge: against its wall; in his standard death rocked off it toward the front, wobbling, then tipped over
  // onto him about its near foot)
  const dd = f.death?.how === 'fridge' ? f.death : null;
  const stuffed = !!dd && dd.step !== 'crushed' && dd.step !== 'roll' && dd.step !== 'done';
  const fall = dd ? dd.fall : 0, fd = dd ? (fall > 0 ? 1.0008 : FRIDGE.d + (1.0003 - FRIDGE.d) * dd.creep) : FRIDGE.d;
  at(fd, X(FRIDGE.x), () => {
    if (fall > 0) {
      const pv = X(fridgePivot(f));
      c.save(); c.translate(pv, STAGE_Y); c.rotate(-fall * Math.PI / 2); c.translate(-pv, -STAGE_Y);
      drawFridge(c, X(FRIDGE.x + f.fridge.dx), STAGE_Y, fr, { open: fall >= 0.85 ? 0.35 + 0.65 * Math.min(1, (fall - 0.85) / 0.15) : 0, tilt: 0, stuffed: fall < 0.85 });
      c.restore();
    } else drawFridge(c, X(FRIDGE.x + f.fridge.dx), STAGE_Y, fr, { open: f.fridge.open, tilt: f.fridge.tilt, stuffed });
  });
  // (the family: going about it, or flattened)
  for (const m of MEMBERS) {
    const fm = f.family[m];
    if (fm.alive) {
      const er = f.errand, out = er?.who === m;
      const a: Anim = { mode: out || f.kills > 0 ? 'glitch' : 'run', f: fr + m.length * 13, talking: f.words.has(m) };
      const throwing = out && er?.step === 'toss';
      const lean = out && er?.step === 'ready' ? fm.dir * 0.16 : out && (er?.step === 'go' || er?.step === 'back') ? fm.dir * 0.08 : 0;
      at(fm.d, X(fm.x), () => {
        if (lean) { c.save(); c.translate(X(fm.x), STAGE_Y); c.rotate(lean); c.translate(-X(fm.x), -STAGE_Y); }
        drawMember(c, m, X(fm.x), STAGE_Y, a, throwing ? 1 : 0, throwing);
        if (lean) c.restore();
      });
    } else at(fm.d - 0.0004, X(fm.x), () => drawDeadMember(c, m, X(fm.x), STAGE_Y, fr, (fm.x > f.x ? 1 : -1) as 1 | -1));
  }
  for (const w of f.wrecks) at(w.onCouch ? 1.0012 : w.d + 0.0002, X(w.x), () => drawWreck(c, X(w.x), STAGE_Y - (w.onCouch ? 26 : 0), w.dir, w.paint, w.t, fr));
  // (the stuntmen, flung at the wall: splatted on the wallpaper, down in a heap under it)
  for (const s of f.flung) {
    if (s.stuck) at(D_SET + 0.003, s.x, () => { drawWallSplat(c, s.x, s.y, s.seed); drawStuntmanAt(c, s.x + 6, STAGE_Y - 4, s.dir, 0, 'down'); });
    else at(s.d, s.x, () => drawStuntmanAt(c, s.x, s.y, s.dir, s.t * 0.4 * s.dir, 'tumble'));
  }
  // (the bottles in the air)
  for (const b of f.bottles) {
    const u = b.t / b.T, d = b.ad + (b.bd - b.ad) * u, x = b.ax + (b.bx - b.ax) * u, y = b.ay + (b.by - b.ay) * u - 70 * Math.sin(Math.PI * u);
    at(d, X(x), () => drawBottle(c, X(x), y, b.rot));
  }
  // (the cars in the air)
  for (const car of f.cars) { const p = carAt(car); at(p.d, X(p.x), () => drawCarAt(c, X(p.x), p.y, car.dir, car.wheel, p.rot, car.paint)); }
  // (the couch; the mallet leaning on its arm while it's not in his hands; him)
  const cc = f.couch;
  const empty = !f.seated || cc.crushed || f.mode === 'dead';
  items.push({ d: 1, x: X(cc.x), draw: () => drawCouchAt(c, X(cc.x), STAGE_Y, fr, { rot: cc.rot, squash: cc.squash, crushed: cc.crushed, empty }) });
  const P = poseOf(f);
  const inHands = P.pose === 'swat' || P.pose === 'hammer' || (P.pose === 'stagger' && f.act !== 'thrown' && f.mode === 'on') || P.pose === 'heave';
  if (!inHands && f.death?.how !== 'flat') {
    const lean = !cc.crushed && f.mode === 'on' ? { x: X(cc.x) - COUCH_HALF - 6, a: -0.3 } : { x: X(cc.x) - COUCH_HALF - 30, a: -1.5 };
    items.push({ d: 1.0002, x: lean.x, draw: () => { c.save(); c.translate(lean.x, STAGE_Y - 4); c.rotate(lean.a); c.scale(DAD_K, DAD_K); drawMallet(c); c.restore(); } });
  }
  const d = f.death;
  if (d?.how === 'flat') {
    // (under the car, then a pancake once it's tipped off him, then up on end like a sheet of paper and down again;
    // the stuntman up out of the wreck)
    if (d.step === 'tip' || d.step === 'flat') items.push({ d: 1.0004, x: X(f.x), draw: () => drawPancake(c, X(f.x), STAGE_Y, fr, d.step === 'flat' ? 1 : 0, f.facing) });
    else if (d.step !== 'start') {
      const pp = paperOf(d);
      items.push({ d: 1.0004, x: X(f.x), draw: () => {
        c.save(); c.translate(X(f.x), STAGE_Y); c.rotate(-f.facing * pp.rot);
        // (paper in a draft: the top of him swaying side to side over his flat feet)
        // (flattened: a squat, wide paper man (a cartoon's accordion squash), never back to his full height)
        c.transform(1, 0, Math.sin(fr * 0.13) * 0.3 * pp.up, 1, 0, 0);
        c.scale(1.6 - 0.25 * pp.up, 0.12 + 0.36 * pp.up);
        drawDad(c, 0, 0, 'stand', fr, { face: 'out', can: null, sway: 0, facing: f.facing, talking: f.words.has('dad') });
        c.restore();
      } });
    }
    const s = d.stunt;
    if (s) items.push({ d: 1.0013, x: s.x, draw: () => drawStuntmanAt(c, s.x, s.y, -1, 0, s.up ? 'up' : 'tumble') });
  } else {
    const crushed = d?.how === 'fridge' && (d.step === 'crushed' || d.step === 'roll' || d.step === 'done');
    if (crushed) {
      // (flat under the fridge, on his back: his head and his hands out the end of it, twitching a while)
      items.push({ d: 1.0002, x: X(f.x), draw: () => {
        const tw = d.step === 'crushed' && d.t - d.at < 90 && (d.t >> 2) % 3 === 0 ? 1 : 0;
        c.save(); c.translate(X(f.x), STAGE_Y - 9); c.scale(1, 0.42); c.rotate(-Math.PI / 2 + tw * 0.02);
        drawDad(c, 0, 0, 'cower', fr, { face: 'out', can: null, sway: 0, facing: 1, talking: f.words.has('dad') });
        c.restore();
      } });
    } else {
      const blink = f.iframes > 0 && Math.floor(fr / 3) % 2 === 0 && f.mode === 'on';
      items.push({ d: 1.0005, x: X(f.x), draw: () => {
        if (blink) c.globalAlpha = 0.65;
        const feet = STAGE_Y - f.y;
        c.save(); c.translate(X(f.x), feet); c.rotate(P.rot);
        drawDad(c, 0, 0, P.pose, fr, { t: P.t, talking: f.words.has('dad'), face: P.face ?? (f.flash > 0 ? 'strain' : undefined), can: P.can, canFull: false, facing: f.facing, held: heldFor(f, P.pose), crouch: P.crouch });
        c.restore();
        c.globalAlpha = 1;
      } });
    }
  }
  // (the seep and the blood from under the fridge, the cans out of it, the can rolled out)
  if (d?.how === 'fridge') {
    items.push({ d: 1.0001, x: X(f.x), draw: () => { drawBlood(c, X(f.x) + 10, STAGE_Y - 1, d.heap); drawSeep(c, X(f.x) + 40 + d.seep * 0.4, STAGE_Y - 1, d.seep); } });
    items.push({ d: 1.0011, x: X(f.x), draw: () => { drawPile(c, d.pile); if (d.roll) drawRolled(c, d.roll.x, d.roll.open > 0, fr); } });
  }
  // (the bottles coming down on the front of the set: a shadow on the deck where each will land, darker as it comes)
  for (const b of f.bottles) {
    if (b.bd < 0.99 || b.by < STAGE_Y - 20) continue;
    const u = Math.min(1, b.t / b.T);
    at(0.9999, X(b.bx), () => { c.fillStyle = `rgba(20, 10, 30, ${(0.18 + 0.32 * u).toFixed(2)})`; c.beginPath(); c.ellipse(X(b.bx), STAGE_Y - 1, 3 + 6 * u, 1.2 + 1.4 * u, 0, 0, Math.PI * 2); c.fill(); });
  }
  return items;
};
const drawRolled = (c: Ctx, x: number, open: boolean, fr: number) => {
  c.save(); c.translate(x, STAGE_Y - 4); c.rotate(open ? Math.PI / 2 : (x * 0.12) % (Math.PI * 2));
  box(c, -7, -4, 14, 8, INK_RED); box(c, -6, -3, 12, 6, '#C8102E'); box(c, -2, -3, 4, 6, '#F4F1E8'); box(c, 6, -3, 1.4, 6, '#C9CDD4');
  c.restore();
  if (open) for (let k = 0; k < 3; k++) { const u = ((fr * 0.5 + k * 10) % 30) / 30; box(c, x + 8 + u * 6, STAGE_Y - 6 - u * 10, 2, 2, `rgba(255,255,255,${(0.7 * (1 - u)).toFixed(2)})`); }
};
const INK_RED = '#38030B';

/** The puke's puddles on the deck. */
export const drawPuddles = (c: Ctx, f: Fight) => { for (const pu of f.puddles) drawPuddle(c, pu.x, STAGE_Y - 1, pu.w, pu.t < 500 ? 0.9 : (600 - pu.t) / 100 * 0.9); };

/** World space, in front of him: the puke flying. (The words are the HUD's: drawFightWords, at full size whatever the
 *  zoom.) */
export const drawFightFront = (c: Ctx, state: GameState, f: Fight) => {
  for (const d of f.drops) drawDrop(c, d.x, d.y, d.r, d.k);
};
/** Screen space: the words over whoever's saying them (through the zoom, at full size: legible zoomed out); the
 *  stunt crew's excuses off the walkie, up under his bar. */
const drawFightWords = (c: Ctx, state: GameState, f: Fight) => {
  const E = eyeOf(state);
  for (const [who, text] of f.words) {
    if (who === 'crew') { saidOver(c, `WALKIE: ${text}`, CANVAS_WIDTH / 2, 112, '#A7F3D0', 520); continue; }
    let p: P;
    if (who === 'dad') {
      const d = f.death;
      const crushed = d?.how === 'fridge' && (d.step === 'crushed' || d.step === 'roll' || d.step === 'done');
      const top = d?.how === 'flat' ? STAGE_Y - 30 - DAD_H * 0.48 * paperOf(d).up : crushed ? STAGE_Y - 90 : STAGE_Y - f.y - (f.seated ? DAD_SIT_H : DAD_H) - 14;
      p = { x: crushed ? X(f.x) - 90 : X(f.x), y: top };
    } else { const m = f.family[who]; p = proj(E, X(m.x), STAGE_Y - 130 * DAD_K, m.d); }
    const q = toScreen(state, f, p.x, p.y);
    saidOver(c, text, q.x, q.y, who === 'dad' ? '#FDE047' : '#93C5FD', 240);
  }
};
/** The clapperboard resetting, over his shoulder while it's in his hand (the user's: "show a little cooldown above his
 *  head when equipped"): a little clapperboard, a ring round it filling as the scene resets; READY! as it's done. Off
 *  to the side of his head, clear of his speech over it. */
const drawCooldown = (c: Ctx, state: GameState, f: Fight) => {
  const p = state.player;
  if (p.currentWeapon !== 'STUNT_CAR' || p.inCutscene || (f.recharge <= 0 && f.readyFlash <= 0)) return;
  const s = toScreen(state, f, p.pos.x + p.width / 2, p.pos.y);
  const x = Math.round(s.x + 30), y = Math.round(s.y + 6), k = f.recharge > 0 ? 1 - f.recharge / RECHARGE : 1;
  // (the ring: a dark track, the fill going round from the top, a bright edge)
  c.fillStyle = 'rgba(12, 10, 20, 0.75)'; c.beginPath(); c.arc(x, y, 13, 0, Math.PI * 2); c.fill();
  c.lineWidth = 3; c.strokeStyle = '#3F3F46'; c.beginPath(); c.arc(x, y, 10, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = f.recharge > 0 ? '#FDE047' : (state.frame >> 2) % 2 ? '#FFFFFF' : '#FDE047';
  c.beginPath(); c.arc(x, y, 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); c.stroke();
  // (the clapperboard: the slate, the striped sticks (open while it's resetting, shut and clacked when it's ready))
  const open = f.recharge > 0 ? 0.5 : 0;
  box(c, x - 6, y - 2, 12, 8, '#1A1A1E'); box(c, x - 5, y - 1, 10, 6, '#3A3A44'); box(c, x - 4, y + 1, 8, 1, '#D4D4D8'); box(c, x - 4, y + 3, 5, 1, '#D4D4D8');
  c.save(); c.translate(x - 6, y - 3); c.rotate(-open);
  box(c, 0, -2, 12, 3, '#F8FAFC'); for (let i = 0; i < 4; i++) box(c, 1 + i * 3, -2, 1.5, 3, '#1A1A1E');
  c.restore();
  if (f.recharge <= 0) label(c, 'READY!', x, y - 18, (state.frame >> 2) % 2 ? '#FFFFFF' : '#FDE047', 6);
};

/** Screen space: his bar (the top band, clear of the HUD), the clapperboard's NEXT TAKE (if he's got it); the deaths'
 *  letterbox and SKIP; the kill cam's flash. */
export const drawFightHud = (c: Ctx, state: GameState, f: Fight, band: { x1: number; x2: number; mid: number }) => {
  const d = f.death;
  if (d) {
    const k = f.cam && !f.cam.out ? Math.min(1, f.cam.t / 20) : 1, bar = Math.round(k * 44);
    c.fillStyle = '#000'; c.fillRect(0, 0, CANVAS_WIDTH, bar); c.fillRect(0, CANVAS_HEIGHT - bar, CANVAS_WIDTH, bar);
    if (f.cam && f.cam.t < 14) { c.fillStyle = `rgba(255, 255, 255, ${(1 - f.cam.t / 14).toFixed(2)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
    if (f.deathSaid < 4 && d.t > 30 && d.skipT > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
    return;
  }
  drawFightWords(c, state, f);
  if (state.player.inCutscene) return;
  drawCooldown(c, state, f);
  const w = band.x2 - band.x1, k = Math.max(0, f.hp / HP);
  box(c, band.x1, 22, w, 14, '#18181B'); box(c, band.x1 + 2, 24, (w - 4) * k, 10, f.iframes > 0 && Math.floor(f.iframes / 4) % 2 ? '#FEF08A' : '#FACC15');
  label(c, 'STUPID DAD', band.mid, 50, '#FDE047', 7);
  // (the clapperboard's reset: only once he's got it)
  if (state.player.availableWeapons.includes('STUNT_CAR')) {
    const r = f.recharge > 0 ? 1 - f.recharge / RECHARGE : 1, bw = 90, bx = band.x2 - bw;
    box(c, bx, 58, bw, 8, '#18181B'); box(c, bx + 1, 59, (bw - 2) * r, 6, r >= 1 ? (Math.floor(state.frame / 10) % 2 ? '#F8FAFC' : '#FDE047') : '#A1A1AA');
    label(c, r >= 1 ? 'ACTION!' : 'NEXT TAKE', bx + bw / 2, 76, r >= 1 ? '#FDE047' : '#D4D4D8', 6);
  }
};
