// STUNTMAN STEVE, the fight (the user's design, first pass). Every number that matters is up top, to tune.
//
//   THE INTRO   (a cutscene, skippable, all of it; no HUD) The tornado's dropped him on the stage: the crowd goes wild,
//               the jumbotron cuts from Steve's two seconds to an instant replay of the man who fell out of the sky.
//               The PA; him; the camera down the stage to Steve, furious: "NO ONE SHOWS ME UP. I WAS IN A REAL
//               HOLLYWOOD MOVIE. ONCE. FOR ABOUT 2 SECONDS." His posse revs up in the doors; on.
//   THE POSSE   Steve sends his stunt drivers (cars.ts): RED cars drift into him along the floor, BLUE cars jump the
//               (many, always moving) ramps through the hoops and come down on him; both come from either end. They
//               mostly send him flying. They come in a set order, a beat at a time with a rest after each (BEATS).
//               While he's way off from Steve, they come quicker.
//   STEVE       Wants nothing to do with him (a total pussy): he stays at his end directing traffic. Too close, and a car
//               is sent straight at him; right up to him, Steve flails his arms (a slap, a little hurt); grab him and
//               he squirts out of it (forty years of baby oil). Hang about by him and he's off: a tow car, a rope,
//               dragged on his belly the length of the stage to the other end (blow the tow car up and he's stranded,
//               scrambling back on foot).
//   HURTING HIM The ray gun and Meathead's moves in full; any other weapon 25% (every land boss's way); the 60-frame
//               breather after each hit. His WEAKNESS is the SPELLBOOK, its storm picking by what's on the screen:
//               METEORS for the red cars, COMETS for the blue, the LIGHTNING for Steve (stunned and struck the whole
//               time it's on him: the user's opt-in to a status on a boss). "WHY DID I WEAR A CONDUCTIVE SUIT". Every
//               time it gets him it sets off the stage's PYROTECHNICS ("I FORGOT ABOUT THOSE."): a wave of fire jets
//               out from him down the stage that throws Meathead right back (no hurt): no spamming it from close in.
//               Bulked up (the book's other spell), he can pick a car up and throw it back at him: a big hit.
//
// Two deaths. The weakness (the lightning's the last thing to hit him): the kill cam; fried stood there, charred
//   black, still giving the thumbs-up, the crowd applauding; then he topples flat and goes to ash. Any other way: one
//   last stunt, THE STEVE SIDESTEP (a cutscene, skippable, all of it; Meathead out of the shot): a cut to center
//   stage, the crowd hushed, Steve staggering out onto the star (a trip, a wheeze, "I'M GOOD!"), straightening his neck
//   brace, a shaky thumbs-up, the announcement; the car; he goes to sidestep it and can't anymore (a feeble half-step,
//   his back seizes); it takes him across the stage onto his own burning loop. Then the user's: "steve hangs slumped
//   over on the burning loop, stomach first. his pants burn off to show his underwear then he leans forward and falls
//   headfirst to the pavement, missing the mat and landing awkwardly, dead": draped over it at the waist, the loop
//   swinging; the suit sizzling, scorching black, smoking, bits of it dropping off, till it rips off him burning (his
//   star-print briefs, a rhinestone waistband), and then those burn off him too (the user's: his bare ass side-on, nothing
//   frontal); a word from him; he tips forward off it, a slide whistle all the way
//   down; crunch, on his head, a foot short of the crash mat (his neck brace flies off and lands on it), stood there a
//   beat, and folds over in a heap; a beat of silence, then the crowd's OOOH. Meathead strolls in for the last word.
//   Every shot's camera is kept to the arena (camFor, the kill cam's focus too): nothing past its ends.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind } from '../../../m1/types';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound, stopSound } from '../../../m1/game/platform/audio';
import { say, silenceAll, pickLine } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { CANVAS_WIDTH, CANVAS_HEIGHT, BULLET_DAMAGE, BOSS_CHARGE_DAMAGE, BOSS_UPPERCUT_DAMAGE } from '../../../m1/constants';
import { registerM2Kind } from '../../kinds';
import { newSpam, spamTick, hitKey, swatOff, type Spam, BOSS_IFRAMES } from '../../bossSpam';
import { setStormPick, setStormHit } from '../../weapons/spellbook';
import { TOO_BIG_BY_KIND } from '../../lines/weaponLines';
import { drawSteveGross, drawSteveGrossBack } from './steveGross';
import { box, label, saidOver, hands, speak, voice, meatheadSays, getHollywood } from '../section';
import { bossIntroSeen, markBossIntroSeen } from '../../bossIntro';
import { ARENA_L, ARENA_R, ARENA_MID, GY, ZK, CUT, CAM_ROW, DOORS_X, STEVE_AT, LANE_FRONT, BARRIER_Y, MAT_X, MAT_HW } from './arena';
import { type Box, around } from '../../deathFrame';
import {
  type Garage, newRamps, spawnRed, spawnBlue, spawnTow, pickRamp, updateRamps, updateCars, tickLaunch, launchHim, boom, freeze,
  clearCars, clearWrecks, dropCars, countCars, targetable, carOf, pmid, landingOf, tellsOf,
} from './cars';
import { CAR, drawCar, drawCarShadow, extents, onFloorX } from './carArt';
import { type Car, FLUNG_IN, LAND_FALL } from './state';
import { drawSteve, drawSteveAsh, drawSteveBrace, drawStevePants, STEVE_H, type StevePose } from './steve';
import { drawSkids, drawRamp, drawHoop, drawRing, drawPyro, ringAt, RING_R, PYRO_X, drawTells } from './art';
import { flame, hash } from './paint';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;

// ---------------------------------------------------------------------------------------------------------------
// The numbers (tune here)

/** His health (the land bosses'), and the enemy's (never runs out: the hits come off ours). */
const HP = 666, BIG = 100000;
/** Anything but the ray gun, his moves and the book: this share; the breather after a hit. */
const SHARE = 0.25, IFRAMES = BOSS_IFRAMES;
/** The lightning on him: the first strike of a storm, each one after (no breather: it's one long hit); stunned this
 *  long past the last strike, then smoking a while. (The playtest: a touch more, +25% on 24 and 6.) */
const ZAP_FIRST = 30, ZAP_EACH = 7.5, ZAP_HOLD = 26, SMOKE_T = 70;
/** A meteor or comet that catches him going off on a car; a car thrown into him (bulked up). */
const METEOR_SPLASH = 30, COMET_SPLASH = 20, THROWN_DMG = 120;
/** The pyro: a beat after the lightning lands, the jets go off out from him down the stage this fast (px a frame);
 *  each burns this long; the blast that throws him (along, up; no hurt). */
const PYRO_DELAY = 14, PYRO_SPEED = 24, PYRO_BURN = 42, PYRO_VX = 17, PYRO_VY = -12;
/** Cars (the user's: "a little less chaotic... a little more of a pattern"): Steve sends them in a set order, one beat
 *  at a time, the same loop each phase (a red from his end, from the far end, one from each; a blue off a ramp), a
 *  rest after each beat (frames, by phase) that waits on the cars out to drop under the cap; quicker while he's way off
 *  from Steve. */
type Beat = { red?: 'near' | 'far' | 'both'; blue?: boolean };
const BEATS: Beat[][] = [
  [],
  [{ red: 'near' }, { blue: true }, { red: 'near' }, { red: 'far' }, { blue: true }],
  [{ red: 'near' }, { blue: true }, { red: 'both' }, { blue: true }, { red: 'far' }, { red: 'near', blue: true }],
  [{ red: 'both' }, { blue: true }, { red: 'near', blue: true }, { red: 'far' }, { blue: true }, { red: 'both' }, { red: 'near', blue: true }],
];
const BEAT_GAP = [0, 150, 125, 105], MAX_RED = [0, 2, 3, 3], MAX_BLUE = [0, 1, 1, 2];
const FAR = 1000, FAR_RATE = 1.35;
/** Close to Steve: a car sent straight at him (this often at most); his flail (how close; its slap, how often). */
const CLOSE = 520, PUSH_GAP = 110, FLAIL_AT = 80, FLAIL_DMG = 3, FLAIL_EVERY = 45;
/** Hanging about him (this near, this long): off on a tow rope. The tow's speed, its rope. */
// (sooner and from a bit further (the user's: "steve should call in the tow cable if you spend a little time just standing
// close to him"): were 260 px, 150 frames)
const TOW_NEAR = 300, TOW_AFTER = 90, TOW_V = 9, ROPE = 70;
/** Stranded mid-stage (his tow blown up): back to an end on foot, wheezing (px a frame). */
const SCRAMBLE_V = 1.7;
/** Steve's taunts; Meathead's thinking out loud about the book. */
const TAUNT_EVERY = 760, HINT_GAP = 600;

// ---------------------------------------------------------------------------------------------------------------
// The state

type Act = 'idle' | 'wave' | 'flail' | 'slip' | 'hurt' | 'zapped' | 'smoking' | 'call' | 'yank' | 'towed' | 'slide' | 'getup' | 'scramble' | 'angry';
type Intro = 'land' | 'talk' | 'pan' | 'gross' | 'steve' | 'back';
interface Death {
  how: 'stunt' | 'fried'; t: number; step: string; at: number;
  x: number; y: number; vx: number; vy: number; rot: number; car: Car | null;
  pants: { x: number; y: number; vy: number } | null;
  /** Where his head hit the pavement, and when (the splat, and the pool spreading out of it). */
  hit?: { x: number; t: number };
  /** The stunt: the end whose ring of fire he goes into (the far one from Meathead, parked off the shot at the other);
   *  the stagger's beat ('go', 'trip', 'wheeze') and its clock; where the stagger started; the cut's black (0..1). */
  side: 1 | -1; sub: string; subT: number; from: number; fade: number;
  /** Over the loop: when he landed on it (its swing's clock), how far his suit's burned (0..1), then his briefs
   *  (bburn, 0..1). His neck brace, flown
   *  off him on the landing (onto the mat). */
  hung: number; burn: number; bburn: number; brace: { x: number; y: number; vx: number; vy: number } | null;
}
interface KillCam { t: number; acc: number; z: number; out: boolean }

export interface Fight extends Garage {
  mode: 'intro' | 'on' | 'dead'; t: number; total: number;
  hp: number; iframes: number; flash: number;
  /** Steve: where (his feet's x, his depth), which end he's at, which way he faces, what he's at. */
  sx: number; sz: number; side: 1 | -1; facing: 1 | -1; act: Act; actT: number;
  zapT: number; frizz: number; singe: number; zappedOnce: boolean;
  closeT: number; flailAt: number; pushAt: number; tauntT: number;
  tow: Car | null;
  /** The posse: frames since the last beat; the next beat (BEATS, by phase); the phase it's on. */
  redT: number; beat: number; beatPh: number;
  pyro: { t: number; x: number; hit: boolean } | null; fire: Map<number, number>;
  e: Enemy; moveSeen: number | undefined; grabWas: string;
  /** The same hit landing on him over and over (bossSpam.ts). */
  spam: Spam;
  said: string | null; paSaid: string | null;
  wrongN: number; hintAt: number; lowSaid: boolean; crowdAt: number;
  intro: Intro; introT: number; skipT: number; camX: number; replay: number;
  /** In off the fling: his fall onto the stage (frames in, where along it started, how many times he's gone over, the
   *  style he's tumbling in), till he's down. */
  fall: { t: number; x0: number; over: number; style: 'flail' | 'ball' } | null;
  death: Death | null; deathSaid: number; cam: KillCam | null;
  /** A retry's entrance beat (frames left): playing to the crowd, a taunt, no cars, no slaps (the user's). */
  entrance: number;
}

/** The fight going on now (the spellbook's hooks look at it). */
let live: Fight | null = null;
let game: GameState | null = null;
const pants = (): 'clean' | 'shitty' | 'nude' => (!game ? 'clean' : isNude(game) ? 'nude' : isShat(game) ? 'shitty' : 'clean');
export const resetFight = () => { live = null; };

// ---------------------------------------------------------------------------------------------------------------
// Steve, the enemy (the engine's: for the hits; drawn here)

const STEVE_KIND = 'm2:steve' as const;
registerM2Kind({
  kind: STEVE_KIND,
  stats: { w: 44, h: 96, hp: BIG, contact: 0, mass: 260, air: true },
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y, harmless: true }),
  gender: 'm', humanoid: true, grab: 'none', midBoss: true,
  head: { x: 2, y: -90, r: 12 },
  draw: () => {},
  ai: () => true,
});
TOO_BIG_BY_KIND[STEVE_KIND] = L.GRAB_STEVE;

// ---------------------------------------------------------------------------------------------------------------
// The weakness: the storm's say over its targets (what's on the screen), and what it does

setStormPick((state, px, py) => {
  const f = live;
  if (!f || f.mode !== 'on') return null;
  const a = state.camera.x, b = a + CANVAS_WIDTH;
  // (his entrance beat on a retry: not his to be struck in yet)
  const still = f.entrance > 0;
  const seen = (c: Car) => c.x + 60 > a && c.x - 60 < b;
  const nearest = (cs: Car[]) => cs.sort((p, q) => Math.hypot(p.x - px, p.y - py) - Math.hypot(q.x - px, q.y - py))[0]?.e ?? null;
  return {
    meteor: nearest(f.cars.filter(c => c.color === 'red' && targetable(c) && seen(c))),
    comet: nearest(f.cars.filter(c => c.color === 'blue' && targetable(c) && seen(c))),
    bolt: !still && f.sx > a - 20 && f.sx < b + 20 ? f.e : null,
  };
});
let devBolt = false;
if (import.meta.env.DEV) (window as unknown as { __m2SteveBolt: () => void }).__m2SteveBolt = () => { devBolt = true; };
setStormHit((ctx, e, el, _dmg) => {
  const f = live;
  if (!f) return false;
  if (e === f.e) { if (f.mode === 'on') struck(ctx, f, el); return true; }
  const car = carOf(e);
  if (!car) return false;
  if (el === 'comet') freeze(ctx, f, car); else boom(ctx, f, car);
  return true;
});

// ---------------------------------------------------------------------------------------------------------------
// Saying things (one at a time; words only while said)

let token = 0;
const tokened = (fn: () => void) => { const tok = token; return () => { if (tok === token) fn(); }; };
const quiet = (f: Fight) => !f.said && !f.paSaid;
/** Steve says one of these (waits its turn). */
const steveSays = (f: Fight, text: string, onDone?: () => void) => {
  const tok = token;
  speak(L.STEVE_VOICE, text, s => { if (tok === token) f.said = s?.text ?? null; }, true, () => { if (tok === token) onDone?.(); });
};
const steveLine = (f: Fight, lines: L.ByPants, onDone?: () => void) => steveSays(f, pick(lines[pants()]), onDone);
/** A bark: dropped if somebody's talking. */
const bark = (f: Fight, lines: L.ByPants) => {
  if (!quiet(f)) return;
  const text = pick(lines[pants()]);
  say(text, voice(L.STEVE_VOICE), 'casual', {
    always: true,
    onShow: spoken => { f.said = text; if (!spoken) setTimeout(() => { if (f.said === text) f.said = null; }, Math.max(1600, text.length * 65)); },
    onHide: () => { if (f.said === text) f.said = null; },
  });
};
const paSays = (f: Fight, lines: L.ByPants, onDone?: () => void) => {
  const tok = token;
  speak(L.PA_VOICE, pick(lines[pants()]), s => { if (tok === token) f.paSaid = s?.text ?? null; }, true, () => { if (tok === token) onDone?.(); });
};

// ---------------------------------------------------------------------------------------------------------------
// Starting

// (seen the intro this visit, a retry from the checkpoint skipping it: bossIntro.ts, set as the fight begins)

/** Every shot kept to the arena: never past either end of it. */
const clampCam = (x: number) => Math.max(ARENA_L, Math.min(ARENA_R - CANVAS_WIDTH, x));
const camFor = (x: number) => clampCam(x - CANVAS_WIDTH / 2);

export const startFight = (state: GameState): Fight => {
  game = state; token++;
  const side: 1 | -1 = 1;
  const e = makeKindEnemy(STEVE_KIND as EnemyKind, STEVE_AT(side), GY);
  e.facing = -1; e.seen = true;
  const f: Fight = {
    cars: [], ramps: newRamps(), skids: [], nextId: 0, launch: null, hype: 0, hot: false, doorOpen: DOORS_X.map(() => 0),
    steveBox: () => null, onThrownHit: () => {}, onCrowd: () => {},
    mode: 'intro', t: 0, total: 0, hp: HP, iframes: 0, flash: 0,
    sx: STEVE_AT(side), sz: 0, side, facing: -1, act: 'idle', actT: 0,
    zapT: 0, frizz: 0, singe: 0, zappedOnce: false, closeT: 0, flailAt: -999, pushAt: -999, tauntT: 0, tow: null,
    redT: 0, beat: 0, beatPh: 1, pyro: null, fire: new Map(),
    e, moveSeen: e.hitByMove, spam: newSpam(), grabWas: 'idle', said: null, paSaid: null, wrongN: 0, hintAt: -9999, lowSaid: false, crowdAt: -99,
    intro: 'land', introT: 0, skipT: 0, camX: camFor(pmid(state).x), replay: 0,
    fall: FLUNG_IN.on ? { t: 0, x0: pmid(state).x, over: 0, style: 'flail' } : null,
    death: null, deathSaid: 0, cam: null, entrance: 0,
  };
  FLUNG_IN.on = false;
  f.steveBox = () => (f.mode === 'on' ? { x0: f.sx - 24, x1: f.sx + 24, y0: GY - STEVE_H, y1: GY } : null);
  f.onThrownHit = (ctx) => thrownHit(ctx, f);
  f.onCrowd = (ctx, x, what) => crowd(ctx, f, x, what);
  live = f;
  // (a retry: straight in, but a beat for his entrance first: the user's "give a beat for him to make his entrance
  // before you can take damage")
  if (bossIntroSeen(state, 'steve')) { beginFight(state, f); f.entrance = ENTRANCE_T; f.act = 'wave'; f.hype = 1; return f; }
  state.player.inCutscene = true;
  f.replay = 1;
  return f;
};

/** A retry's entrance beat (frames). */
const ENTRANCE_T = 105;
/** His gross-up's length in the intro (frames): the first go only (a retry has no intro). */
const GROSS_T = 105;

/** On: out of the cutscene, Steve in the world, the posse on its way. */
const beginFight = (state: GameState, f: Fight) => {
  token++; markBossIntroSeen(state, 'steve');
  f.said = null; f.paSaid = null;
  state.cameraOverride = null;
  const p = state.player;
  // (skipped while he was still coming down: down, on his feet)
  if (f.fall) { f.fall = null; p.pos.x = MAT_X(-1) - p.width / 2; touchDown(state, true); }
  p.inCutscene = false; p.isDucking = false;
  f.mode = 'on'; f.act = 'idle'; f.actT = 0; f.replay = 0;
  f.redT = BEAT_GAP[1] - 50; f.beat = 0; f.beatPh = 1;
  if (!state.enemies.includes(f.e)) state.enemies.push(f.e);
};

// ---------------------------------------------------------------------------------------------------------------
// In off the fling: THE STYLISH ENTRANCE (none of it on purpose). Down out of the sky onto the stage, tumbling: head
// over heels three times, flailing, then balled up by accident (a somersault), flailing again, two accidental twists
// (turned clean round in the air, arms everywhere), a last tuck, and he unwinds just in time to come down in a
// three-point crouch. The crowd eats it up; Steve's seething (the intro goes on from here as it always did).

const easeOut = (u: number) => 1 - (1 - u) * (1 - u);
/** The twists: frames in (from, to) each turns him clean round once (a cos about upright: his width). */
const TWISTS: [number, number, 1 | -1][] = [[20, 34, 1], [44, 55, -1]];
/** What he's tumbling in, frames in: flailing, then balled up, and so on; the last stretch flailing for the ground. */
const STYLES: [number, 'flail' | 'ball'][] = [[0, 'flail'], [14, 'ball'], [28, 'flail'], [46, 'ball'], [58, 'flail']];

/** Down on the stage: his feet on the floor, the tumble done. (skipped: just stood there; else the crouch, the dust.) */
const touchDown = (state: GameState, skipped: boolean) => {
  const p = state.player;
  p.freefall = undefined; p.carried = false; p.spriteScaleX = undefined; p.spriteRot = undefined;
  p.facing = 1; p.pos.y = GY - p.height; p.vel.x = 0; p.vel.y = 0; p.isGrounded = true;
  if (skipped) return;
  p.isDucking = true;
  const x = p.pos.x + p.width / 2;
  playSound('crash', 0.8, -4); playSound('thud', 1, -8); playSound('land', 1, -4); shakeScreen(state, 14, 6);
  for (let k = 0; k < 26; k++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 60, y: GY - 6 }, vel: { x: (k % 2 ? 1 : -1) * (1 + Math.random() * 6), y: -1 - Math.random() * 3 }, life: 50, color: 'rgba(168, 162, 158, 0.85)', size: 5 + Math.random() * 6 });
};

/** A frame of the fall; true once he's down. */
const comingDown = (ctx: FrameContext, f: Fight, fall: NonNullable<Fight['fall']>): boolean => {
  const { state } = ctx, p = state.player;
  fall.t++;
  const T = LAND_FALL.t, u = Math.min(1, fall.t / T);
  // Where he is: carried along a way, falling faster and faster
  const x = fall.x0 + (MAT_X(-1) - fall.x0) * easeOut(u), feet = GY - LAND_FALL.h * (1 - u * u);
  p.carried = true; p.pos.x = x - p.width / 2; p.pos.y = feet - p.height; p.vel.x = 0; p.vel.y = 0;
  // How he's going over: three times head over heels, quick to start, slowing, a wobble that dies out, upright as he
  // hits (the luck of it)
  const rot = Math.PI * 6 * easeOut(u) + Math.sin(fall.t * 0.45) * 0.5 * (1 - u);
  // What he's tumbling in (each change eased into from the start)
  let style: 'flail' | 'ball' = 'flail';
  for (const [at, s] of STYLES) if (fall.t >= at) style = s;
  if (!p.freefall || style !== fall.style) { p.freefall = { style, t: 0, rot, land: 0 }; fall.style = style; if (style === 'ball') playSound('whoosh', 0.6, 6); }
  p.freefall.t++; p.freefall.rot = rot;
  // (each time he comes over: the whoosh of it)
  const over = Math.floor(rot / (Math.PI * 2) + 0.5);
  if (over > fall.over) { fall.over = over; playSound('whoosh', 0.8, -2 + over * 2); }
  // The twists: turned clean round, side to side (the crowd: WHOA)
  let tw = 0;
  for (const [a, b, dir] of TWISTS) if (fall.t >= a && fall.t < b) tw = dir * Math.PI * 2 * ((fall.t - a) / (b - a));
  const c = Math.cos(tw);
  p.facing = c < 0 ? -1 : 1;
  p.spriteScaleX = Math.max(0.15, Math.abs(c));
  for (const [a] of TWISTS) if (fall.t === a + 6) crowd(ctx, f, x, 'wow', true);
  if (fall.t % 12 === 0) crowd(ctx, f, x + (Math.random() - 0.5) * 400, 'ooh', true);
  if (fall.t < T) return false;
  touchDown(state, false);
  crowd(ctx, f, x, 'boom', true);
  return true;
};

const intro = (ctx: FrameContext, f: Fight): Controls => {
  const { state } = ctx, p = state.player;
  f.introT++; f.skipT++;
  p.inCutscene = true; p.vel.x = 0;
  if (f.replay > 0) f.replay++;
  if (f.skipT > SKIP_AFTER) offerSkip();
  if (f.skipT > SKIP_AFTER && takeSkip()) { silenceAll(); state.playerVulgarityTimer = 0; beginFight(state, f); return hands(); }
  const t = f.introT, me = camFor(pmid(state).x), him = camFor(f.sx);
  switch (f.intro) {
    case 'land':
      // (in off the fling: the fall, all flips, the crowd already losing it)
      if (f.fall) {
        f.hype = 1; f.camX = me;
        if (comingDown(ctx, f, f.fall)) { f.fall = null; f.introT = 0; }
        break;
      }
      // (down out of the sky in a crouch, up out of it; the crowd goes nuts, the cameras flash)
      p.isDucking = t < 34;
      f.hype = 1;
      if (t % 12 === 0) crowd(ctx, f, p.pos.x + (Math.random() - 0.5) * 500, t % 24 ? 'wow' : 'boom', true);
      if (t >= 46) {
        f.intro = 'talk'; f.introT = 0;
        paSays(f, L.PA_LANDING, () => meatheadSays(state, pick(L.MEATHEAD_LANDED), true, tokened(() => { f.intro = 'pan'; f.introT = 0; })));
      }
      f.camX = me;
      break;
    case 'talk':
      f.hype = Math.max(f.hype, 0.6); f.camX = me;
      break;
    case 'pan':
      // (down the stage to Steve, at his end, livid)
      f.camX += (him - f.camX) * 0.06; f.act = 'angry'; f.facing = -1;
      if (t >= 70) { f.intro = 'gross'; f.introT = 0; playSound('ding', 0.5, -6); }
      break;
    case 'gross':
      // (his face, close up and gross, seething at the applause, a beat; then his say)
      f.camX = him; f.act = 'angry';
      if (t >= GROSS_T) {
        f.intro = 'steve'; f.introT = 0;
        steveLine(f, L.STEVE_FUMING, () => steveSays(f, L.STEVE_SHOWN_UP, () => {
          f.act = 'wave'; playSound('engine', 0.8, -4); playSound('carroar', 0.6, 2);
          steveLine(f, L.STEVE_POSSE, () => { f.intro = 'back'; f.introT = 0; });
        }));
      }
      break;
    case 'steve':
      f.camX = him;
      if (f.act === 'wave' && t % 30 === 0) playSound('carroar', 0.4, Math.random() * 4);
      break;
    case 'back':
      f.camX += (me - f.camX) * 0.08;
      if (t >= 50) beginFight(state, f);
      break;
  }
  f.actT++;
  // (the fight's begun this frame (the pan back's done): the camera's his again, not held here for good)
  if (f.mode !== 'intro') return hands();
  f.camX = clampCam(f.camX);
  state.cameraOverride = { x: f.camX, y: GY - CAM_ROW };
  state.camera.x = f.camX; state.camera.y = GY - CAM_ROW;
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame

const phase = (f: Fight) => (f.hp > HP * 0.66 ? 1 : f.hp > HP * 0.33 ? 2 : 3);
const setAct = (f: Fight, a: Act) => { f.act = a; f.actT = 0; };
const doorOf = (side: 1 | -1, inner = false) => (side > 0 ? DOORS_X[inner ? 2 : 3] : DOORS_X[inner ? 1 : 0]);

export const updateFight = (ctx: FrameContext, f: Fight, controls: Controls): Controls => {
  const { state } = ctx;
  live = f; game = state;
  f.total++;
  f.hype = Math.max(0, f.hype - 0.006);
  for (const [x, t] of f.fire) if (t <= 1) f.fire.delete(x); else f.fire.set(x, t - 1);
  if (f.mode === 'intro') { const out = intro(ctx, f); sync(state, f); return out; }
  f.t++;
  if (f.iframes > 0) f.iframes--;
  if (f.flash > 0) f.flash--;
  tickLaunch(ctx, f);
  if (f.mode === 'dead') { updateCars(ctx, f); return dying(ctx, f); }
  takeHits(ctx, f);
  watchGrab(ctx, f);
  // (dev only: the book's bolt on him, the last of him; tools/bossdeaths records his weakness death off it)
  if (import.meta.env.DEV && devBolt) { devBolt = false; f.hp = Math.min(f.hp, 1); struck(ctx, f, 'bolt'); if ((f.mode as string) === 'dead') return hands(); }
  if (f.hp <= 0) { die(ctx, f, false); return hands(); }
  // (his entrance on a retry: waving to the stands, a taunt, the crowd going; no cars sent, no slaps)
  if (f.entrance > 0) {
    f.entrance--; f.actT++;
    if (f.act !== 'wave' && f.act !== 'hurt') { f.act = 'wave'; f.actT = 0; }
    if (f.act === 'hurt' && f.actT > 14) setAct(f, 'wave');
    f.facing = pmid(state).x < f.sx ? -1 : 1;
    if (f.entrance === ENTRANCE_T - 6) { bark(f, L.STEVE_ENTRANCE); crowd(ctx, f, f.sx, 'wow', true); }
    if (f.entrance === 0) setAct(f, 'idle');
    updateRamps(state, f, pmid(state).x);
    updateCars(ctx, f);
    sync(state, f);
    return controls;
  }
  f.hot = phase(f) >= 3;
  steve(ctx, f);
  pyro(ctx, f);
  spawn(ctx, f);
  updateRamps(state, f, pmid(state).x);
  updateCars(ctx, f);
  if (f.mode === 'on' && f.hp < HP * 0.25 && !f.lowSaid && quiet(f)) { f.lowSaid = true; steveLine(f, L.STEVE_LOW); }
  sync(state, f);
  return controls;
};

/** Steve himself: at his end directing traffic, and whatever's being done to him. */
const steve = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, p = state.player, m = pmid(state);
  const d = Math.abs(m.x - f.sx);
  f.actT++;
  if (f.frizz > 0) f.frizz = Math.max(0, f.frizz - 0.002);
  // Struck (the lightning): jerking, lit up, going nowhere, till it's off him; then smoking
  if (f.zapT > 0) {
    // (being dragged: zap doesn't interrupt — only killing him does)
    if (f.act !== 'yank' && f.act !== 'towed') {
      if (f.act !== 'zapped') { if (f.tow) dropTow(f); setAct(f, 'zapped'); }
      if (--f.zapT === 0) setAct(f, 'smoking');
      f.sz += (0 - f.sz) * 0.2;
      return;
    }
    f.zapT--;
  }
  const atEnd = Math.abs(f.sx - STEVE_AT(f.side)) < 6;
  switch (f.act) {
    case 'smoking': if (f.actT > SMOKE_T) setAct(f, atEnd ? 'idle' : 'scramble'); break;
    case 'hurt': if (f.actT > 14) setAct(f, atEnd ? 'idle' : 'scramble'); break;
    case 'slip': if (f.actT > 40) setAct(f, 'idle'); break;
    case 'wave': if (f.actT > 40) setAct(f, 'idle'); break;
    case 'call': {
      // (whistling the tow over: it comes out of the door and round into the front lane; the rope's thrown)
      const c = f.tow;
      if (!c || c.mode !== 'tow') { f.tow = null; setAct(f, 'idle'); break; }
      c.speed = 1.5;
      f.facing = c.x < f.sx ? -1 : 1;
      if (c.z > LANE_FRONT * 0.6 || f.actT > 120) { setAct(f, 'yank'); playSound('whoosh', 1, -6); playSound('screams', 0.3, 10); }
      break;
    }
    case 'yank': case 'towed': {
      // (yanked off his feet, then dragged on his belly behind it the length of the stage)
      const c = f.tow;
      if (!c || c.mode !== 'tow') { dropTow(f); break; }
      c.speed = Math.min(TOW_V, c.speed + 0.35);
      const rear = c.x - c.dir * (CAR.L / 2), want = rear - c.dir * ROPE;
      f.sx += (want - f.sx) * (f.act === 'yank' ? 0.25 : 0.6); f.sz += (c.z - f.sz) * 0.2;
      f.facing = c.dir;
      if (f.act === 'yank' && f.actT > 14) setAct(f, 'towed');
      if (f.actT % 6 === 0) state.particles.push({ pos: { x: f.sx, y: GY + f.sz * ZK - 4 }, vel: { x: -c.dir, y: -0.8 }, life: 24, color: 'rgba(168, 162, 158, 0.6)', size: 6 });
      // (the far end: let go, slid in the rest of the way)
      const far = doorOf((-f.side) as 1 | -1);
      if ((c.x - far) * c.dir >= 0) { f.side = (-f.side) as 1 | -1; c.mode = 'recover'; c.t = 0; f.tow = null; setAct(f, 'slide'); }
      break;
    }
    case 'slide':
      f.sx += (STEVE_AT(f.side) - f.sx) * 0.08; f.sz += (0 - f.sz) * 0.08;
      if (f.actT > 40) setAct(f, 'getup');
      break;
    case 'getup':
      f.sz += (0 - f.sz) * 0.2;
      if (f.actT > 40) setAct(f, atEnd ? 'idle' : 'scramble');
      break;
    case 'scramble': {
      // (stranded out on the floor: back to the nearer end on foot, wheezing)
      f.side = f.sx > ARENA_MID ? 1 : -1;
      const to = STEVE_AT(f.side), dir = Math.sign(to - f.sx);
      f.sx += dir * Math.min(SCRAMBLE_V, Math.abs(to - f.sx)); f.facing = (dir || f.facing) as 1 | -1;
      if (f.actT % 40 === 1) playSound('snort', 0.4, 6);
      // (keep closeT building while scrambling — so the tow fires quickly once he gets back)
      f.closeT = d < TOW_NEAR ? f.closeT + 1 : Math.max(0, f.closeT - 1);
      if (Math.abs(to - f.sx) < 1) setAct(f, 'idle');
      if (d < FLAIL_AT) setAct(f, 'flail');
      break;
    }
    case 'idle': case 'flail': case 'angry': {
      // (stood out mid-stage off his rope (his tow car blown up, or him flailing at Meathead on the way back): back
      // to his end as soon as Meathead's off him (the user's: his tow cancelled and he stayed stuck there, safe to blast))
      if (!atEnd && !f.tow && d >= FLAIL_AT) { setAct(f, 'scramble'); break; }
      f.facing = m.x < f.sx ? -1 : 1;
      f.sz += (0 - f.sz) * 0.2;
      if (d < FLAIL_AT) {
        if (f.act !== 'flail') { setAct(f, 'flail'); if (Math.random() < 0.6) bark(f, L.STEVE_FLAIL); }
        // (a slap, now and then, when he's in his arms' way)
        if (f.total - f.flailAt > FLAIL_EVERY && Math.abs(m.x - f.sx) < 46 && p.pos.y + p.height > GY - STEVE_H + 10 && p.invincibilityTimer <= 0) {
          f.flailAt = f.total;
          hurtPlayer(ctx, FLAIL_DMG, 'm2:steve_flail', { x: (m.x < f.sx ? -1 : 1) * 4, y: -3 }, 10);
          playSound('punch', 0.6, 8);
        }
      } else if (f.act !== 'idle') setAct(f, 'idle');
      // (hanging about him: off on a tow rope to the other end)
      f.closeT = d < TOW_NEAR ? f.closeT + 1 : Math.max(0, f.closeT - 1);
      if (f.closeT > TOW_AFTER && !f.tow) { callTow(ctx, f); break; }
      // (getting close: a car straight at him)
      if (d < CLOSE && f.total - f.pushAt > PUSH_GAP && countCars(f, 'red') < MAX_RED[phase(f)] + 1) {
        f.pushAt = f.total;
        spawnRed(state, f, doorOf(f.side, Math.random() < 0.4), (-f.side) as 1 | -1, 'drift');
        if (Math.random() < 0.5) bark(f, L.STEVE_TOO_CLOSE);
        if (f.act === 'idle') setAct(f, 'wave');
      }
      if (++f.tauntT >= TAUNT_EVERY) { f.tauntT = Math.floor(Math.random() * 200); bark(f, L.STEVE_TAUNT); }
      break;
    }
    default: break;
  }
};

const callTow = (ctx: FrameContext, f: Fight) => {
  f.closeT = 0;
  f.tow = spawnTow(ctx.state, f, doorOf(f.side), (-f.side) as 1 | -1);
  setAct(f, 'call');
  bark(f, L.STEVE_TOW);
  playSound('beep', 0.6, 10);
};
/** Off the rope (zapped off it, or his tow car's blown up): down where he is; stranded, he'll walk back. */
const dropTow = (f: Fight) => {
  if (f.tow && f.tow.mode === 'tow') { f.tow.mode = 'recover'; f.tow.t = 0; }
  f.tow = null;
  f.sz = 0;
  if (f.act === 'yank' || f.act === 'towed' || f.act === 'call') setAct(f, 'getup');
};

/** The posse, sent, beat by beat (BEATS): red cars out of a door on his end or the far one, at him; a blue car off
 *  whichever ramp's jump comes down nearest him. */
const spawn = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, m = pmid(state), ph = phase(f);
  // (not while he's out of it: nobody's calling them)
  if (f.zapT > 0 || f.act === 'smoking' || f.act === 'towed' || f.act === 'yank') return;
  // (a new phase: its loop from the top)
  if (f.beatPh !== ph) { f.beatPh = ph; f.beat = 0; }
  f.redT += Math.abs(m.x - f.sx) > FAR ? FAR_RATE : 1;
  const loop = BEATS[ph] ?? BEATS[1], beat = loop[f.beat % loop.length];
  if (f.redT < BEAT_GAP[ph]) return;
  const reds = beat.red === 'both' ? 2 : beat.red ? 1 : 0;
  if (countCars(f, 'red') + reds > MAX_RED[ph] || (beat.blue && countCars(f, 'blue') >= MAX_BLUE[ph])) return;
  const ramp = beat.blue ? pickRamp(f, m.x) : -1;
  if (beat.blue && ramp < 0) return;
  f.redT = 0; f.beat++;
  const send = (from: 1 | -1) => {
    // (out of a door on that side of him, well clear of him; none there, the other side)
    let pool = DOORS_X.filter(x => (x - m.x) * from > 140);
    if (!pool.length) { from = (-from) as 1 | -1; pool = DOORS_X.filter(x => (x - m.x) * from > 140); }
    spawnRed(state, f, pool.length ? pool[Math.floor(Math.random() * pool.length)] : doorOf(from), (-from) as 1 | -1);
  };
  if (beat.red === 'near' || beat.red === 'both') send(f.side);
  if (beat.red === 'far' || beat.red === 'both') send((-f.side) as 1 | -1);
  if (reds) { if (f.act === 'idle') setAct(f, 'wave'); if (Math.random() < 0.35) bark(f, L.STEVE_SEND); }
  if (beat.blue && spawnBlue(state, f, ramp) && Math.random() < 0.3) bark(f, L.STEVE_RAMP);
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
  // (anything else but the book: a share; and him thinking out loud about the book, now and then)
  // (no hint at a weapon he hasn't got (the user's))
  if (plain === null && state.player.availableWeapons.includes('SPELLBOOK') && state.player.currentWeapon !== 'SPELLBOOK' && !f.zappedOnce && (++f.wrongN === 2 || f.wrongN % 5 === 0) && f.total - f.hintAt > HINT_GAP) {
    f.hintAt = f.total; meatheadSays(state, pick(L.MEATHEAD_HINT), false);
  }
  hurt(ctx, f, plain ?? Math.max(1, dealt * SHARE), IFRAMES);
  // (the user's: "i don't want the player to be given more than 5 uninterrupted seconds spamming the same attack on a
  // boss": the same hit landing on him for 4 s. On top of him (a dive-kick chain, the charge): his arms going, a shove
  // off him (no hurt) and the tow called there and then; shot at from down the stage: a car at him now)
  if (f.zapT <= 0 && f.act !== 'zapped' && f.act !== 'smoking' && f.act !== 'yank' && f.act !== 'towed' && f.act !== 'call' && spamTick(f.spam, state.frame, hitKey(state.player, melee))) {
    const m = pmid(state);
    if (melee || Math.abs(m.x - f.sx) < TOW_NEAR) {
      swatOff(state, f.sx);
      if (!f.tow) callTow(ctx, f); else { setAct(f, 'flail'); bark(f, L.STEVE_FLAIL); }
    } else {
      f.pushAt = f.total;
      spawnRed(state, f, doorOf(f.side, Math.random() < 0.4), (-f.side) as 1 | -1, 'drift');
      if (Math.random() < 0.5) bark(f, L.STEVE_TOO_CLOSE);
    }
  }
};

const hurt = (ctx: FrameContext, f: Fight, dmg: number, iframes: number) => {
  const { state } = ctx;
  f.hp -= dmg; f.iframes = Math.max(f.iframes, iframes); f.flash = 8;
  for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: f.sx, y: GY - 60 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 18, color: '#B91C1C', size: 2 + Math.random() * 2, grav: 0.3 });
  playSound('gunhit', 0.5, 2);
  ctx.fx.spawnDamageNumber({ x: f.sx - 10, y: GY - STEVE_H - 10 }, Math.max(1, Math.round(dmg)), dmg > 40);
  if (f.act === 'idle' || f.act === 'flail' || f.act === 'wave' || f.act === 'scramble' || f.act === 'getup') setAct(f, 'hurt');
  if (f.hp > 0 && Math.random() < 0.15) bark(f, L.STEVE_HURT);
};

/** The book's storm on him: the lightning (stunned, struck, the pyro off), or a meteor's or comet's splash off a car. */
const struck = (ctx: FrameContext, f: Fight, el: 'meteor' | 'comet' | 'bolt') => {
  if (el !== 'bolt') { if (f.iframes <= 0) hurt(ctx, f, el === 'meteor' ? METEOR_SPLASH : COMET_SPLASH, IFRAMES); if (f.hp <= 0) die(ctx, f, false); return; }
  // (on the rope: a bolt's plain damage, no stun, no pyro; only killing him gets him off it)
  if (f.act === 'yank' || f.act === 'towed') { if (f.iframes <= 0) hurt(ctx, f, ZAP_FIRST, IFRAMES); if (f.hp <= 0) die(ctx, f, true); return; }
  const first = f.zapT <= 0 && f.act !== 'zapped';
  f.zapT = ZAP_HOLD;
  const dmg = first ? ZAP_FIRST : ZAP_EACH;
  f.hp -= dmg; f.flash = 6;
  f.frizz = 1; f.singe = Math.min(1, f.singe + 0.06);
  ctx.fx.spawnDamageNumber({ x: f.sx - 10, y: GY - STEVE_H - 10 }, Math.round(dmg), first);
  if (first) {
    playSound('taser', 1, -2);
    // (and the stage's pyro goes off with it)
    f.pyro = { t: 0, x: f.sx, hit: false };
    if (!f.zappedOnce) { f.zappedOnce = true; steveSays(f, L.STEVE_CONDUCTIVE, () => steveLine(f, L.STEVE_PYRO)); }
    else if (Math.random() < 0.4 && quiet(f)) steveLine(f, Math.random() < 0.5 ? L.STEVE_ZAPPED : L.STEVE_PYRO);
    else if (quiet(f)) steveLine(f, L.STEVE_PYRO);
    f.hype = 1;
  }
  if (f.hp <= 0) die(ctx, f, true);
};

/** The pyrotechnics: a wave of fire jets out from Steve both ways down the stage; it throws Meathead clear (no hurt). */
const pyro = (ctx: FrameContext, f: Fight) => {
  const P = f.pyro;
  if (!P) return;
  const { state } = ctx;
  P.t++;
  if (P.t === PYRO_DELAY) { playSound('ignite', 1, -6); playSound('boom', 0.7, -10); shakeScreen(state, 10, 5); }
  if (P.t < PYRO_DELAY) return;
  const r = (P.t - PYRO_DELAY) * PYRO_SPEED;
  for (const px of PYRO_X) if (Math.abs(px - P.x) <= r && !f.fire.has(px) && Math.abs(px - P.x) > r - PYRO_SPEED - 1) { f.fire.set(px, PYRO_BURN); if (Math.abs(px - (state.camera.x + 400)) < 500 && px % 2 === 0) playSound('flame', 0.4, Math.random() * 4); }
  const m = pmid(state);
  if (!P.hit && Math.abs(m.x - P.x) <= r + 30) {
    P.hit = true;
    const away = (Math.sign(m.x - P.x) || -f.side) as 1 | -1;
    launchHim(ctx, f, away * PYRO_VX, PYRO_VY, 0, 'm2:stunt_pyro');
    ctx.fx.spawnDamageNumber({ x: m.x - 20, y: m.y - 50 }, 'KABOOM!', true, '#F97316');
  }
  if (r > 2200) f.pyro = null;
};

/** A car he threw (bulked up) into Steve. */
const thrownHit = (ctx: FrameContext, f: Fight) => {
  if (f.mode !== 'on') return;
  hurt(ctx, f, THROWN_DMG, IFRAMES);
  if (f.tow && f.act !== 'yank' && f.act !== 'towed') dropTow(f);
  if (quiet(f)) steveLine(f, L.STEVE_CAR_HIT);
  f.hype = 1;
  if (f.hp <= 0) die(ctx, f, false);
};

/** A grab at Steve: he squirts out of it like a wet bar of soap. */
const watchGrab = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  const g = (getHollywood(state) as unknown as { grab?: { phase: string } } | null)?.grab;
  const ph = g?.phase ?? 'idle';
  if (ph !== f.grabWas && (ph === 'windup' || ph === 'reach' || ph === 'awind')) {
    const p = state.player, dx = (f.sx - pmid(state).x) * p.facing;
    if (dx > -20 && dx < 150 && (f.act === 'idle' || f.act === 'flail' || f.act === 'wave' || f.act === 'hurt' || f.act === 'scramble')) {
      setAct(f, 'slip');
      bark(f, L.STEVE_SLIP);
      playSound('oil', 0.8, 4);
      for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: f.sx, y: GY - 50 - Math.random() * 40 }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 4 }, life: 30, color: i % 2 ? '#FDE68A' : '#FEF3C7', size: 2 + Math.random() * 2, grav: 0.3 });
    }
  }
  f.grabWas = ph;
};

/** The crowd: words up over the barrier (not too often). */
const crowd = (ctx: FrameContext, f: Fight, x: number, what: 'ooh' | 'boom' | 'wow', always = false) => {
  f.hype = Math.max(f.hype, what === 'ooh' ? 0.7 : 1);
  if (!always && f.total - f.crowdAt < 25) return;
  f.crowdAt = f.total;
  const s = ctx.state, cx = Math.max(s.camera.x + 60, Math.min(s.camera.x + CANVAS_WIDTH - 60, x + (Math.random() - 0.5) * 160));
  ctx.fx.spawnDamageNumber({ x: cx - 20, y: BARRIER_Y + 30 }, what === 'ooh' ? 'OOOH!' : what === 'boom' ? 'WOOO!' : 'WHOA!', true, '#FDE68A');
  playSound('screams', 0.15, 12);
};

// ---------------------------------------------------------------------------------------------------------------
// Dying

const die = (ctx: FrameContext, f: Fight, fried: boolean) => {
  const { state } = ctx, p = state.player;
  if (f.mode === 'dead') return;
  token++;
  f.mode = 'dead'; f.t = 0;
  state.enemies = state.enemies.filter(o => o !== f.e);
  if (f.tow) dropTow(f);
  clearCars(f);
  if (fried) clearWrecks(f);
  f.pyro = null;
  state.damageNumbers = [];
  f.said = null; f.paSaid = null;
  p.inCutscene = true;
  // (the stunt goes off toward the end Meathead's furthest from: he's parked out of the shot at the other)
  const side: 1 | -1 = pmid(state).x < ARENA_MID ? 1 : -1;
  f.death = {
    how: fried ? 'fried' : 'stunt', t: 0, step: 'start', at: 0, x: f.sx, y: GY, vx: 0, vy: 0, rot: 0, car: null, pants: null,
    side, sub: 'go', subT: 0, from: f.sx, fade: 0, hung: 0, burn: 0, bburn: 0, brace: null,
  };
  f.skipT = 0;
  f.facing = (-f.side) as 1 | -1;
  if (fried) {
    f.cam = { t: 0, acc: 0, z: 1, out: false };
    playSound('bolt', 1.2, -4); playSound('thunder', 0.8, 2);
    steveLine(f, L.STEVE_FRIED);
  } else playSound('hurt', 0.8, -4);
};

/** The splat where his head hit the pavement (spattered out in a burst, stepped reds, a lit rim), and the pool that
 *  keeps spreading out of it, slow, dark, glossy: he's not getting up. `u`: frames since he hit. */
const drawHeadSplat = (c: Ctx, x: number, u: number, facing: 1 | -1) => {
  const burst = Math.min(1, u / 6), pool = Math.min(1, u / 240);
  const rx = 22 + 26 * burst + 46 * pool, ry = 4 + 2 * burst + 4 * pool, px0 = x - facing * 10 * pool;
  // (the spatter: flecks and streaks thrown out round it)
  for (let i = 0; i < 14; i++) {
    const a = hash(i * 7.3) * Math.PI * 2, r = (30 + hash(i * 3.1) * 60) * burst;
    c.fillStyle = i % 3 ? '#7F1D1D' : '#991B1B';
    c.beginPath(); c.ellipse(Math.round(x + Math.cos(a) * r), Math.round(GY + Math.sin(a) * 4 * burst), 1.5 + hash(i) * 3, 1 + hash(i + 9), 0, 0, Math.PI * 2); c.fill();
  }
  // (the pool: banded dark to bright, its lit rim, a glint)
  for (const [k, col] of [[1, '#3F0A0A'], [0.82, '#5A0E0E'], [0.62, '#7F1D1D'], [0.4, '#991B1B']] as const) {
    c.fillStyle = col; c.beginPath(); c.ellipse(Math.round(px0), GY, rx * k, ry * k, 0, 0, Math.PI * 2); c.fill();
  }
  c.fillStyle = 'rgba(254, 202, 202, 0.55)'; c.fillRect(Math.round(px0 - rx * 0.3), GY - Math.round(ry * 0.4), Math.round(rx * 0.25), 1);
};

/** The deaths' beats. */
const dying = (ctx: FrameContext, f: Fight): Controls => {
  const { state } = ctx, d = f.death!, p = state.player;
  d.t++;
  const t = d.t;
  p.inCutscene = true;
  if (d.how === 'stunt') return sidestep(ctx, f);
  // (the camera on him, his end of the stage)
  const want = camFor(d.x);
  f.camX = clampCam(t === 1 ? state.camera.x : f.camX + (want - f.camX) * 0.08);
  state.cameraOverride = { x: f.camX, y: GY - CAM_ROW }; state.camera.x = f.camX; state.camera.y = GY - CAM_ROW;
  {
    if (t % 7 === 0 && t < 70) { playSound('taser', 0.6, Math.random() * 6); for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: d.x, y: GY - 60 }, vel: { x: (Math.random() - 0.5) * 8, y: -Math.random() * 6 }, life: 14, color: i % 2 ? '#FFFFFF' : '#A5F3FC', size: 2 }); }
    if (t === 80) { d.step = 'charred'; playSound('crumble', 0.5, 4); f.hype = 1; }
    if (f.cam && t > 90) f.cam.out = true;
    if (d.step === 'charred') {
      if (t % 5 === 0) state.particles.push({ pos: { x: d.x + (Math.random() - 0.5) * 20, y: GY - 80 - Math.random() * 20 }, vel: { x: (Math.random() - 0.5) * 0.6, y: -1 }, life: 50, color: 'rgba(87, 83, 78, 0.55)', size: 6 + Math.random() * 6 });
      if (t % 20 === 0 && t < 220) crowd(ctx, f, d.x, 'boom', true);
      if (t === 110) paSays(f, L.PA_DEATH_FRIED, tokened(() => { d.step = 'topple'; d.at = d.t; }));
    }
    if (d.step === 'topple') {
      const k = Math.min(1, (t - d.at) / 22);
      d.rot = k * k * (Math.PI / 2);
      if (k >= 1) { d.step = 'ash'; d.at = t; playSound('thud', 1, -6); playSound('crumble', 1, -4); shakeScreen(state, 8, 4); }
    }
    if (d.step === 'ash' && t === d.at + 50 && f.deathSaid === 0) { f.deathSaid = 1; meatheadSays(state, pick(L.MEATHEAD_WON_WEAK), true, tokened(() => { f.deathSaid = 4; })); }
  }
  // (it never hangs)
  if (t > 1800) f.deathSaid = 4;
  // (Meathead out of the shot: he walks in to watch (the user's: "just have meathead walk into frame if he is out of
  // it"), till he's well in it, and never right up on him)
  const mx = pmid(state).x, dir = d.x > mx ? 1 : -1, inShot = mx > f.camX + FRY_IN && mx < f.camX + CANVAS_WIDTH - FRY_IN;
  if (t > 20 && !p.hidden && !inShot && Math.abs(d.x - mx) > FRY_NEAR) return { ...hands(), [dir > 0 ? 'right' : 'left']: true } as Controls;
  return hands();
};
/** Fried: Meathead walks in from out of the shot till he's this far in from its edge (px), stopping short of him. */
const FRY_IN = 120, FRY_NEAR = 150;

/** The sidestep's beats (frames): the cut to black and back; the stagger out (how fast, its trip and wheeze, where
 *  they come); the brace; the half-step before his back goes; the flight's gravity; Meathead's stroll in. */
const SS = {
  CUT_AT: 26, CUT_T: 14, IN_T: 18, START: 300, V: 1.25, LURCH: 1.1, TRIP_AT: 100, TRIP_T: 34, WHEEZE_AT: 205, WHEEZE_T: 52,
  BRACE_T: 46, TRY_GAP: 330, HALF_T: 12, G: 0.42, WALK_STOP: 240,
};
/** Over the loop and off it (frames, px): the swing it takes as he lands on it; the suit catching, then burning through;
 *  then the briefs catching (after the rip) and burning through; his beat bare-assed before he says his piece; the tip forward (how far); the drop's gravity; where his head comes
 *  down, out from the loop toward the mat (short of it); stood on his head a beat, the fold over; the silence before
 *  the crowd's OOOH, and Meathead in after that. */
const DR = { SWING: 0.14, CATCH: 30, BURN_T: 96, B_AT: 14, B_T: 70, BEAT: 26, TIP_T: 44, TIP: 1, G: 0.3, LAND_DX: 70, PLANT_T: 18, FOLD_T: 14, HUSH_T: 50, IN_AT: 80 };
/** The top of the loop, where his gut goes over it (tilted with its swing); the swing, by the frame. */
const perch = (side: 1 | -1, tilt: number) => { const r = ringAt(side), up = RING_R * 0.85 + 5; return { x: r.x + Math.sin(tilt) * up, y: r.y - Math.cos(tilt) * up }; };
const swingOf = (d: Death) => (d.step === 'slump' || d.step === 'tip' ? DR.SWING * Math.sin((d.t - d.hung) * 0.24) * Math.exp(-(d.t - d.hung) / 45) : 0);
/** His crown, off the middle of him (headfirst: the flail pose turned over, `rot` about his middle). */
const CROWN = 54;
/** Where he lies at the end (his head; the mat's on the other side of it). */
const landX = (d: Death) => ringAt(d.side).x - d.side * DR.LAND_DX;

/** THE STEVE SIDESTEP: center stage, Meathead out of the shot; staggering, the brace, the thumb, the car; can't. */
const sidestep = (ctx: FrameContext, f: Fight): Controls => {
  const { state } = ctx, d = f.death!, p = state.player, t = d.t, side = d.side;
  const ring = ringAt(side);
  let out = hands();
  // (all or nothing: skipped, he's in his heap a foot short of the mat, his pants burning under the loop, his brace on
  // the mat, done)
  f.skipT++;
  const skippable = d.step !== 'start' && f.deathSaid < 4;
  if (skippable && f.skipT > SKIP_AFTER) offerSkip();
  if (skippable && f.skipT > SKIP_AFTER && takeSkip()) {
    token++; silenceAll(); state.playerVulgarityTimer = 0;
    f.said = null; f.paSaid = null;
    d.step = 'down'; d.at = t - DR.IN_AT; d.x = landX(d); d.y = GY; d.rot = 0; d.fade = 0; d.burn = 1; d.bburn = 1;
    d.pants = { x: ring.x + side * 12, y: GY - 4, vy: 0 };
    d.brace = { x: MAT_X(side), y: GY - 7, vx: 0, vy: 0 };
    stopSound('fallwhistle');
    p.hidden = false;
    f.deathSaid = 4; d.t = Math.max(d.t, 201);
    return out;
  }
  const hush = () => { f.hype = Math.min(f.hype, 0.05); };
  // (nothing out there touches him while it plays)
  p.noContactUntil = Math.max(p.noContactUntil ?? 0, state.frame + 2);
  switch (d.step) {
    case 'start':
      // (the hit that did it, where he stood; then the cut to black)
      if (t > SS.CUT_AT) d.fade = Math.min(1, (t - SS.CUT_AT) / SS.CUT_T);
      if (t >= SS.CUT_AT + SS.CUT_T) {
        // (in the black: Meathead parked out of the shot at the far end, Steve just off center stage)
        p.pos.x = side > 0 ? ARENA_L + 6 : ARENA_R - p.width - 6; p.pos.y = GY - p.height;
        p.vel.x = 0; p.vel.y = 0; p.isGrounded = true; p.isDucking = false; p.freefall = undefined; p.facing = side;
        p.hidden = true;
        d.step = 'stumble'; d.at = t; d.sub = 'go'; d.subT = 0;
        d.from = ARENA_MID + side * SS.START; d.x = d.from; d.y = GY; d.vy = 0;
        f.facing = (-side) as 1 | -1;
        f.camX = camFor(ARENA_MID);
        steveLine(f, L.STEVE_STUMBLE);
      }
      break;
    case 'stumble': {
      // (out to the star on his last legs, to a hushed crowd: lurching, a trip, a wheeze)
      hush();
      d.fade = Math.max(0, 1 - (t - d.at) / SS.IN_T);
      d.subT++;
      const gone = Math.abs(d.x - d.from);
      if (d.sub === 'go') {
        const v = SS.V + SS.LURCH * Math.max(0, Math.sin(d.subT * 0.22));
        d.x += -side * Math.min(v, Math.abs(d.x - ARENA_MID));
        if (d.subT % 50 === 1) playSound('snort', 0.35, 6);
        // (d.vy: how far through his beats he is, while he's staggering)
        if (d.vy === 0 && gone >= SS.TRIP_AT) { d.vy = 1; d.sub = 'trip'; d.subT = 0; playSound('stomp', 0.5, 4); playSound('screams', 0.1, 14); }
        else if (d.vy === 1 && gone >= SS.WHEEZE_AT) { d.vy = 2; d.sub = 'wheeze'; d.subT = 0; }
        else if (Math.abs(d.x - ARENA_MID) < 0.5) { d.step = 'brace'; d.at = t; }
      } else if (d.sub === 'trip') {
        // (a toe catches: windmilling, a lurch on, and he's caught himself)
        if (d.subT < 14) d.x += -side * 1.6;
        if (d.subT >= SS.TRIP_T) { d.sub = 'go'; d.subT = 0; }
      } else if (d.sub === 'wheeze') {
        // (hands on his knees, wheezing)
        if (d.subT % 14 === 1) playSound('snort', 0.5, 2 + Math.random() * 4);
        if (d.subT >= SS.WHEEZE_T) { d.sub = 'go'; d.subT = 0; }
      }
      break;
    }
    case 'brace':
      // (the neck brace put straight for the crowd; then the thumb, and the big announcement)
      hush();
      if (t === d.at + 22) playSound('click', 0.6, -4);
      if (t >= d.at + SS.BRACE_T) { d.step = 'thumb'; d.at = t; steveLine(f, L.STEVE_LAST_STUNT, tokened(() => { d.step = 'car'; d.at = d.t; })); }
      break;
    case 'thumb': hush(); break;
    case 'car': case 'try': case 'back': {
      if (!d.car) {
        // (out of the far door on Meathead's side, flat out along the line at him)
        const car = spawnRed(state, f, side > 0 ? DOORS_X[0] : DOORS_X[3], side);
        car.plan = 'none'; car.scripted = true; d.car = car;
        playSound('carroar', 1, -2); playSound('horn', 0.7, 0);
      }
      const c = d.car, gap = (d.x - c.x) * c.dir;
      if (d.step === 'car' && gap < SS.TRY_GAP) { d.step = 'try'; d.at = t; playSound('whoosh', 0.4, 10); }
      // (the half-step: about a foot of it; then his back seizes, and that's where he is)
      if (d.step === 'try') { if (t - d.at < SS.HALF_T) d.x += side * 0.6; else { d.step = 'back'; d.at = t; playSound('crack', 1, -6); steveLine(f, L.STEVE_BACK); } }
      if (gap < extents(c.yaw).hx + 12) {
        // (SPLAT: it takes him across the stage, spinning, up onto his own burning loop)
        d.step = 'fly'; d.at = t;
        const up = GY - (perch(side, 0).y + 40);
        d.vy = -Math.sqrt(2 * SS.G * up); d.vx = (ring.x - d.x) / (-d.vy / SS.G);
        // (and the driver brakes, and carries on out the far door: a hit-and-run)
        c.mode = 'skid'; c.t = 0;
        playSound('crash', 1, -4); playSound('punch', 1, -6); playSound('splat', 0.8, -6); shakeScreen(state, 14, 7);
        f.hype = 1; crowd(ctx, f, d.x, 'ooh', true);
      }
      break;
    }
    case 'fly':
      d.x += d.vx; d.y += d.vy; d.vy += SS.G; d.rot += 0.3;
      if (d.vy >= 0) {
        // (over the top of it at the waist, stomach first, with a thump: the loop swings with him)
        d.step = 'slump'; d.at = t; d.hung = t; d.rot = 0;
        const top = perch(side, 0); d.x = top.x; d.y = top.y;
        playSound('clang', 1, -8); playSound('thud', 0.9, -6); playSound('ignite', 0.6, 0); shakeScreen(state, 8, 4);
        crowd(ctx, f, d.x, 'ooh', true);
      }
      break;
    case 'slump': {
      // (hung there limp; then the suit catches: sizzling, scorching, smoking, bits of it dropping off him; it rips
      // off him and drops burning; the briefs; a beat; his piece, and he tips off)
      const u = t - d.hung, fx = -f.facing;
      if (u >= DR.CATCH && !d.pants) {
        d.burn = Math.min(1, (u - DR.CATCH) / DR.BURN_T);
        if (u === DR.CATCH) playSound('ignite', 0.5, 8);
        if ((u - DR.CATCH) % 26 === 0) playSound('sizzle', 0.6 + 0.4 * d.burn, 0);
        if (u % 9 === 0) playSound('flame', 0.25 + 0.25 * d.burn, Math.random() * 4);
        // (charred bits off the legs, falling; embers; black smoke up off him)
        if (u % 3 === 0) state.particles.push({ pos: { x: d.x + fx * (6 + Math.random() * 16), y: d.y + 4 + Math.random() * 22 }, vel: { x: (Math.random() - 0.5) * 0.6, y: 1.2 + Math.random() * 1.8 }, life: 40, color: Math.random() < 0.35 ? '#F97316' : '#1C1917', size: 2 });
        if (u % 5 === 0) state.particles.push({ pos: { x: d.x + fx * (4 + Math.random() * 10), y: d.y - 6 }, vel: { x: (Math.random() - 0.5) * 0.5, y: -0.9 }, life: 50, color: 'rgba(41, 37, 36, 0.5)', size: 5 + Math.random() * 5 });
        if (d.burn >= 1) {
          // (RIP: the burnt suit gives way below the belt and drops off him, still going; the briefs, the rhinestones)
          d.pants = { x: d.x + fx * 12, y: d.y + 14, vy: 0 };
          playSound('cloth', 1, 0); playSound('ignite', 0.4, 10);
          crowd(ctx, f, d.x, 'wow', true);
        }
      }
      // (then the briefs (the user's: "not only do his pants burn, his underpants too. you see the side of his bare ass
      // (no dick is shown, obstructed)"): they catch off what's left, a little flare, holes, down to the rhinestone
      // waistband, then that goes; charred scraps, blue and black, dropping off him; his bare ass out over the loop)
      const rip = DR.CATCH + DR.BURN_T, bAt = rip + DR.B_AT;
      if (u === rip + 8) playSound('twinkle', 0.4, 6);
      if (d.pants && u >= bAt && d.bburn < 1) {
        d.bburn = Math.min(1, (u - bAt) / DR.B_T);
        if (u === bAt) { playSound('ignite', 0.45, 12); playSound('sizzle', 0.6, 4); }
        else if ((u - bAt) % 24 === 0) playSound('sizzle', 0.5, 6);
        if (u % 4 === 0) state.particles.push({ pos: { x: d.x + f.facing * (8 + Math.random() * 10), y: d.y - 22 + Math.random() * 8 }, vel: { x: (Math.random() - 0.5) * 0.8, y: 1 + Math.random() * 1.6 }, life: 44, color: Math.random() < 0.45 ? '#1D4ED8' : Math.random() < 0.5 ? '#F97316' : '#1C1917', size: 2 });
        if (d.bburn >= 1) { playSound('cloth', 0.6, 9); playSound('twinkle', 0.35, 10); crowd(ctx, f, d.x, 'boom', true); }
      }
      if (u === bAt + DR.B_T + DR.BEAT) steveLine(f, L.STEVE_SLUMPED, tokened(() => { d.step = 'tip'; d.at = d.t; playSound('clang', 0.5, -12); }));
      break;
    }
    case 'tip': {
      // (he leans forward off it: slow, then all at once; off the far side of it, headfirst, flailing, a slide whistle)
      const k = Math.min(1, (t - d.at) / DR.TIP_T);
      d.rot = DR.TIP * k * k * k;
      if (k >= 1) {
        const tilt = swingOf(d), top = perch(side, tilt), rf = (tilt + d.rot * f.facing);
        const ox = f.facing * 14, oy = 16;
        const mx = top.x + ox * Math.cos(rf) - oy * Math.sin(rf), my = top.y + ox * Math.sin(rf) + oy * Math.cos(rf);
        d.step = 'fall'; d.at = t; d.x = mx; d.y = my; d.rot = Math.PI - 0.5; d.vy = 0.5;
        const T = (-d.vy + Math.sqrt(d.vy * d.vy + 2 * DR.G * (GY - CROWN - my))) / DR.G;
        d.vx = (landX(d) - mx) / Math.max(1, T);
        playSound('fallwhistle', 1, 0); playSound('whoosh', 0.4, 6);
      }
      break;
    }
    case 'fall':
      d.x += d.vx; d.vy += DR.G; d.y += d.vy;
      d.rot += (Math.PI - 0.08 - d.rot) * 0.1;
      if (d.y - CROWN * Math.cos(d.rot) >= GY) {
        // (CRUNCH: on his head; the brace flies off him and lands on the mat; the crowd's gone dead quiet)
        d.x += CROWN * Math.sin(d.rot * f.facing); d.y = GY; d.rot = Math.PI - 0.08;
        d.step = 'crumple'; d.at = t;
        // (his head on the pavement: a burst of blood, the splat it leaves, the pool spreading from it (the user's: "a
        // big blood splat where his head hit. make sure to sell the idea he's dead"))
        d.hit = { x: d.x, t };
        for (let i = 0; i < 40; i++) state.particles.push({ pos: { x: d.x + (Math.random() - 0.5) * 10, y: GY - 6 }, vel: { x: (Math.random() - 0.5) * 9, y: -2 - Math.random() * 6 }, life: 40 + Math.random() * 30, color: ['#7F1D1D', '#991B1B', '#B91C1C', '#DC2626'][i % 4], size: 2 + Math.random() * 4, grav: 0.35 });
        playSound('splat', 1.2, -8);
        stopSound('fallwhistle');
        playSound('crunch', 1.2, -6); playSound('crack', 1, -4); playSound('thud', 1.2, -8); shakeScreen(state, 14, 7);
        d.brace = { x: d.x, y: GY - 12, vx: (MAT_X(side) - d.x) / 30, vy: -6 };
        f.hype = 0;
      }
      break;
    case 'crumple': {
      // (stood on his head a beat, wobbling; then he folds over the wrong way into a heap)
      hush();
      const u = t - d.at;
      if (u >= DR.PLANT_T) {
        const k = Math.min(1, (u - DR.PLANT_T) / DR.FOLD_T);
        d.rot = Math.PI - 0.08 + (Math.PI / 2 - (Math.PI - 0.08)) * k * k;
        if (k >= 1) { d.step = 'down'; d.at = t; d.rot = 0; playSound('thud', 1, -6); playSound('splat', 0.4, -6); shakeScreen(state, 6, 3); }
      }
      break;
    }
    case 'down': {
      // (a beat of silence; the crowd's OOOH; the PA's wrap-up; Meathead strolls in from off the shot for the last word)
      if (t < d.at + DR.HUSH_T) hush();
      if (t === d.at + DR.HUSH_T) { f.hype = 0.6; crowd(ctx, f, d.x, 'ooh', true); playSound('screams', 0.2, 8); }
      if (t === d.at + DR.IN_AT) {
        p.hidden = false; p.pos.x = (side > 0 ? f.camX - 50 : f.camX + CANVAS_WIDTH + 50 - p.width); p.pos.y = GY - p.height; p.facing = side;
        paSays(f, L.PA_DEATH, tokened(() => meatheadSays(state, pick(L.MEATHEAD_WON), true, tokened(() => { f.deathSaid = 4; }))));
      }
      if (t > d.at + DR.IN_AT && !p.hidden && (d.x - pmid(state).x) * side > SS.WALK_STOP) out = { ...hands(), [side > 0 ? 'right' : 'left']: true } as Controls;
      else if (t > d.at + DR.IN_AT) p.vel.x = 0;
      break;
    }
  }
  if (d.pants && d.pants.y < GY - 4) { d.pants.vy += 0.4; d.pants.y = Math.min(GY - 4, d.pants.y + d.pants.vy); }
  // (the brace: over onto the mat, a little bounce on it)
  const b = d.brace;
  if (b && (b.vx !== 0 || b.vy !== 0)) {
    b.x += b.vx; b.vy += 0.4; b.y += b.vy;
    if (b.y >= GY - 7 && b.vy > 0) { b.y = GY - 7; if (b.vy > 2.5) { b.vy *= -0.3; b.vx *= 0.5; playSound('boing', 0.25, 8); } else { b.vx = 0; b.vy = 0; } }
  }
  // (the camera: on him where it ended; center stage; whipped along after him; held on his end)
  const loop = d.step === 'slump' || d.step === 'tip' || d.step === 'fall' || d.step === 'crumple' || d.step === 'down';
  const want = d.step === 'start' ? camFor(d.x)
    : d.step === 'fly' ? camFor(d.x)
    : loop ? camFor(ring.x)
    : camFor(ARENA_MID);
  const k = d.step === 'start' ? 0.08 : d.step === 'fly' || d.step === 'slump' ? 0.2 : 1;
  f.camX = clampCam(t === 1 ? state.camera.x : f.camX + (want - f.camX) * k);
  state.cameraOverride = { x: f.camX, y: GY - CAM_ROW }; state.camera.x = f.camX; state.camera.y = GY - CAM_ROW;
  if (t > 1800) f.deathSaid = 4;
  return out;
};

/** Done with: his death played out, everybody's had their say. */
export const fightOver = (f: Fight) => f.mode === 'dead' && !!f.death && f.deathSaid >= 4 && f.death.t > 200 && (!f.cam || f.cam.z <= 1);
export const endFight = (state: GameState, f: Fight) => { state.player.inCutscene = false; state.player.hidden = false; state.cameraOverride = null; dropCars(state, f); live = null; };
export const killedByWeakness = (f: Fight) => f.death?.how === 'fried';
export const introOn = (f: Fight) => f.mode === 'intro';
export const introSkipT = (f: Fight) => f.skipT;

/** The enemy, where he is (in the play plane at his x). */
const sync = (state: GameState, f: Fight) => {
  const e = f.e;
  e.pos.x = f.sx - e.width / 2; e.pos.y = GY - e.height - 2;
  e.vel.x = 0; e.vel.y = 0; e.facing = f.facing; e.initialY = e.pos.y;
  e.hitCooldown = f.iframes;
  e.pauseTimer = 0; e.frozenTimer = 0; e.isTased = false; e.sludgeTimer = 0; e.returnHome = false; e.puppet = false;
};

// ---------------------------------------------------------------------------------------------------------------
// The kill cam (the weakness death): Donnie's, near enough

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
  // (its focus kept far enough in from the arena's ends that the zoomed view never shows past them)
  const k = (cam.z - 1) / (CAM_Z - 1), m = CANVAS_WIDTH / 2 / CAM_Z;
  // (on him wherever he is, even a way off the screen as it starts: the camera's still on its way to him then (the user's:
  // "make sure if any boss gets killed slightly offscreen, you zoom out so you can see everything"))
  const fx = Math.max(ARENA_L + m, Math.min(ARENA_R - m, d.x)), fy = GY - 60;
  return { scale: cam.z, x: fx, y: fy, shiftX: k * (state.camera.x + CANVAS_WIDTH / 2 - fx), shiftY: k * (state.camera.y + CANVAS_HEIGHT / 2 + 40 - fy) };
};

/** His death, what of it has to be on screen (deathFrame.ts): him, wherever the hit that did it caught him (the camera's
 *  only on its way there), the stunt's flight; on the loop and off it, the whole drop, the loop up top to the pavement
 *  and the mat he missed. Null till he's dead, and in the cut to black. */
export const deathNeed = (f: Fight): Box | null => {
  const d = f.death;
  if (f.mode !== 'dead' || !d || d.fade > 0.5) return null;
  if (d.how === 'stunt' && (d.step === 'slump' || d.step === 'tip' || d.step === 'fall' || d.step === 'crumple' || d.step === 'down')) {
    const r = ringAt(d.side), lx = landX(d), mx = MAT_X(d.side) + d.side * (MAT_HW - 20);
    return { x0: Math.min(r.x, lx, mx) - 60, y0: r.y - RING_R - 40, x1: Math.max(r.x, lx, mx) + 60, y1: GY + 14 };
  }
  return around(d.x, d.y, 60, d.step === 'fly' ? 150 : 190, 12);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const poseOf = (f: Fight): StevePose => {
  if (f.flash > 0 && f.act !== 'zapped' && f.act !== 'towed') return 'hurt';
  switch (f.act) {
    case 'wave': case 'call': return 'wave';
    case 'flail': return 'flail';
    case 'slip': return 'slip';
    case 'hurt': return 'hurt';
    case 'zapped': return 'zapped';
    case 'smoking': return 'smoking';
    case 'yank': return 'tumble';
    case 'towed': case 'slide': return 'towed';
    case 'getup': return 'getup';
    case 'angry': return 'angry';
    case 'scramble': return f.actT % 20 < 10 ? 'flail' : 'getup';
    default: return f.total % 400 < 60 ? 'thumb' : 'idle';
  }
};

const drawHim = (c: Ctx, f: Fight, fr: number) => {
  const look = { singe: f.singe, frizz: f.frizz, damage: Math.max(0, 1 - Math.max(0, f.hp) / HP) };
  const d = f.death;
  if (f.mode === 'dead' && d) {
    if (d.how === 'fried') {
      if (d.step === 'start') { drawSteve(c, d.x, GY, f.facing, 'zapped', fr, { ...look, frizz: 1, singe: 1 }); return; }
      if (d.step === 'charred') { drawSteve(c, d.x, GY, f.facing, 'charred', fr, look); return; }
      if (d.step === 'topple') { c.save(); c.translate(d.x, GY); c.rotate(d.rot * f.facing); drawSteve(c, 0, 0, f.facing, 'charred', fr, look); c.restore(); return; }
      // (ash: a pile, his aviators on top, the neck brace rolled off beside it)
      const k = Math.min(1, (d.t - d.at) / 40);
      if (k < 1) { c.save(); c.translate(d.x, GY); c.rotate((Math.PI / 2) * f.facing); c.globalAlpha = 1 - k; drawSteve(c, 0, 0, f.facing, 'charred', fr, look); c.restore(); }
      drawSteveAsh(c, d.x + f.facing * 40, GY, k, fr);
      drawSteveBrace(c, d.x + f.facing * 100, GY, fr);
      return;
    }
    const lk = { ...look, pantsDown: !!d.pants, briefsBurn: d.bburn, headWound: !!d.hit };
    // (under him: where his head hit, the splat, and the pool spreading out from it the rest of the scene)
    if (d.hit) drawHeadSplat(c, d.hit.x, d.t - d.hit.t, f.facing);
    // (on his last legs: the whole of him wobbling about his feet)
    const wobbly = (pose: StevePose, amt: number, dx = 0) => {
      c.save(); c.translate(d.x + dx, GY); c.rotate(Math.sin(fr * 0.13) * amt + Math.sin(fr * 0.31) * amt * 0.4);
      drawSteve(c, 0, 0, f.facing, pose, fr, look); c.restore();
    };
    switch (d.step) {
      case 'start': drawSteve(c, d.x, GY, f.facing, 'hurt', fr, look); return;
      case 'stumble':
        if (d.sub === 'trip') { wobbly('flail', 0.06); return; }
        if (d.sub === 'wheeze') { wobbly('smoking', 0.02); return; }
        wobbly('stagger', 0.07);
        return;
      case 'brace': wobbly('brace', 0.03); return;
      // (the thumbs-up to the crowd: shaking)
      case 'thumb': case 'car': wobbly('thumb', 0.035, fr % 4 < 2 ? 0.8 : -0.8); return;
      case 'try': drawSteve(c, d.x, GY, f.facing, 'sidestep', fr, look); return;
      case 'back': drawSteve(c, d.x + (fr % 2 ? 1 : -1), GY, f.facing, 'sidestep', fr, { ...look, back: true }); return;
      case 'fly': drawSteve(c, d.x, d.y, f.facing, 'tumble', fr, lk); return;
      case 'slump': case 'tip': {
        // (over the top of the loop: its back half, him folded over it (the fold at the loop's top, turned with its
        // swing and his tip), its near half; flames licking up round him off it)
        const tilt = swingOf(d), top = perch(d.side, tilt);
        drawRing(c, d.side, false, true, fr, tilt);
        c.save(); c.translate(top.x, top.y); c.rotate(tilt + d.rot * f.facing);
        drawSteve(c, 4 * f.facing, 24, f.facing, 'drape', fr, { ...lk, scorch: d.burn });
        c.restore();
        drawRing(c, d.side, true, true, fr, tilt);
        for (let i = 0; i < 3; i++) flame(c, top.x + (i - 1) * 16 - f.facing * 4, top.y + 6 + Math.abs(i - 1) * 3, 10, 18 + 6 * d.burn, fr, 300 + i * 7);
        return;
      }
      case 'fall':
        // (headfirst, flailing, turned over about his middle)
        c.save(); c.translate(d.x, d.y); c.rotate(d.rot * f.facing);
        drawSteve(c, 0, 50, f.facing, 'flail', fr, { ...lk, pantsDown: true });
        c.restore();
        return;
      case 'crumple': {
        // (on his head: squashed into the pavement as he hits, a wobble; then over he goes, about his head)
        const u = d.t - d.at, sq = u < 6 ? 1 - u / 6 : 0, wob = u < DR.PLANT_T ? Math.sin(u * 0.9) * 0.05 * (1 - u / DR.PLANT_T) : 0;
        c.save(); c.translate(d.x, GY); c.rotate((d.rot + wob) * f.facing); c.scale(1, 1 - 0.16 * sq);
        drawSteve(c, 0, STEVE_H + 2, f.facing, 'plant', fr, { ...lk, pantsDown: true, noBrace: true });
        c.restore();
        return;
      }
      default: drawSteve(c, d.x - f.facing * 46, GY, f.facing, 'heap', fr, { ...lk, pantsDown: true, noBrace: !!d.brace }); return;
    }
  }
  const blink = f.iframes > 0 && Math.floor(fr / 3) % 2 === 0;
  if (blink) c.globalAlpha = 0.6;
  const hop = f.act === 'slip' ? Math.sin(Math.min(1, f.actT / 30) * Math.PI) * 34 : 0;
  drawSteve(c, f.sx, GY + f.sz * ZK - hop, f.facing, poseOf(f), fr, look);
  c.globalAlpha = 1;
  // (zapped: the current crawling over him)
  if (f.act === 'zapped') for (let i = 0; i < 3; i++) {
    const pts: [number, number][] = []; let x = f.sx - 20 + Math.random() * 40, y = GY - 100; pts.push([x, y]);
    for (let k = 0; k < 4; k++) { x += (Math.random() - 0.5) * 24; y += 22; pts.push([x, y]); }
    // (stepped: a wide dim glow, a cyan body, a white core)
    for (const [w, col] of [[6, 'rgba(165, 243, 252, 0.3)'], [3, '#67E8F9'], [1, '#FFFFFF']] as const) { c.strokeStyle = col; c.lineWidth = w; c.lineJoin = 'miter'; c.beginPath(); pts.forEach(([px, py], j) => (j ? c.lineTo(px, py) : c.moveTo(px, py))); c.stroke(); }
  }
  // (smoking, after)
  if (f.act === 'smoking') for (let k = 0; k < 5; k++) {
    // (stepped puffs off him, rising, spreading, thinning)
    const t = ((fr * 0.6 + k * 12) % 60) / 60, r = 4 + t * 10, px = f.sx + Math.sin(t * 5 + k) * 5 + t * 10, py = GY - 104 - t * 60;
    c.fillStyle = `rgba(90, 84, 80, ${(0.5 * (1 - t)).toFixed(2)})`; c.fillRect(Math.round(px - r), Math.round(py - r * 0.6), Math.round(r * 2), Math.round(r * 1.2));
    c.fillStyle = `rgba(150, 144, 138, ${(0.4 * (1 - t)).toFixed(2)})`; c.fillRect(Math.round(px - r * 0.6), Math.round(py - r * 0.6), Math.round(r * 1.1), Math.round(r * 0.5));
  }
};

/** The scene's one eye (x): the bent floor in front of the line fans out from it, and what's on it with it. */
const eyeX = (state: GameState) => state.camera.x + CANVAS_WIDTH / 2;
/** A car (not while it's still in its garage): where it is on the bent floor; its tires smoking in a drift or a slide,
 *  the suspension squashed coming down, sparks as it scrapes, the gas on, the wreck burning. */
const drawOne = (c: Ctx, car: Car, ex: number, fr: number) => {
  if (car.mode === 'held' || car.mode === 'gone' || car.hold) return;
  const fadeA = 1 - car.fade;
  if (fadeA <= 0) return;
  if (fadeA < 1) c.globalAlpha = fadeA;
  const m = car.mode;
  const smoke = m === 'drift' ? 1 : m === 'orbit' ? 0.7 : m === 'skid' ? Math.max(0, 1 - car.t / 40) : 0;
  const squash = m === 'skid' && car.t < 16 ? Math.sin((car.t / 16) * Math.PI) * (1 - car.t / 24) : m === 'crash' && car.t < 10 ? (1 - car.t / 10) * 0.6 : 0;
  const sparks = (m === 'skid' && car.t < 18) || (m === 'crash' && car.t < 14);
  const throttle = m === 'climb' || m === 'enter' || m === 'approach' ? 1 : m === 'run' || m === 'recover' || m === 'tow' ? 0.5 : 0;
  const fire = m === 'wreck' ? (car.burnt > 0.8 ? Math.max(0.25, 1 - car.t / 150) : 0.35) : 0;
  drawCar(c, {
    color: car.color, x: m === 'thrown' ? car.x : onFloorX(car.x, car.z, ex), y: car.y, z: car.z, yaw: car.yaw, pitch: car.pitch,
    crumple: car.crumple, ice: car.ice, burnt: car.burnt, driver: m !== 'wreck', wheel: car.wheel,
    smoke, squash, sparks, throttle, fire, f: fr + car.id * 17,
  });
  c.globalAlpha = 1;
};

/** World space, behind him: the floor's marks, the pyro jets, the ramps and hoops, the cars back of him, Steve. */
export const drawFightBack = (c: Ctx, state: GameState, f: Fight) => {
  const fr = state.frame, ex = eyeX(state);
  // (a car about to come out of its garage: its headlights on in there, their beams out across the floor)
  drawTells(c, tellsOf(f), fr);
  drawSkids(c, f.skids, ex);
  // (the blue cars' marks on the floor: where they'll come down, from the time they're on the ramp)
  for (const car of f.cars) {
    if (car.color !== 'blue' || (car.mode !== 'climb' && car.mode !== 'air')) continue;
    const r = f.ramps[car.ramp];
    const lx = car.mode === 'air' ? car.x + car.vx * Math.max(0, car.airTotal - car.airT) : landingOf(r);
    const k = car.mode === 'air' ? car.airT / car.airTotal : 0, rad = 70 - 30 * k, col = fr % 8 < 4 ? '#EF4444' : '#FDE047';
    c.strokeStyle = '#1A0B06'; c.lineWidth = 5; c.beginPath(); c.ellipse(lx, GY, rad, rad * 0.22, 0, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = col; c.lineWidth = 3; c.stroke();
    box(c, lx - 12, GY - 2, 24, 4, col); box(c, lx - 2, GY - 6, 4, 12, col);
  }
  // (the rings of fire over his two ends: their back halves)
  // (lit for his big finish, too)
  const inRing = f.mode === 'dead' && f.death?.how === 'stunt' && (f.death.step === 'slump' || f.death.step === 'tip'), ringSide = f.death?.side ?? f.side;
  const ringsLit = f.mode !== 'dead' || f.death?.how === 'stunt';
  for (const s of [-1, 1] as const) if (!(inRing && s === ringSide)) drawRing(c, s, false, ringsLit, fr);
  for (const r of f.ramps) { drawHoop(c, r, false, f.hot, fr); drawRamp(c, r, fr); }
  for (const car of f.cars) if (car.mode !== 'held' && car.mode !== 'gone' && !car.hold) { const z = car.mode === 'thrown' ? 0 : car.z; drawCarShadow(c, onFloorX(car.x, z, ex), GY, z, car.yaw, GY - car.y); }
  const back = f.cars.filter(c2 => c2.z < CUT && c2.mode !== 'thrown').sort((a, b) => a.z - b.z);
  for (const car of back) drawOne(c, car, ex, fr);
  for (const r of f.ramps) drawHoop(c, r, true, f.hot, fr);
  for (const s of [-1, 1] as const) if (!(inRing && s === ringSide)) drawRing(c, s, true, ringsLit, fr);
  drawPyro(c, state, f.fire);
  if (f.mode !== 'dead' ? f.sz < CUT : true) drawHim(c, f, fr);
  // (his pants, off and burning on the floor; his neck brace, flown off him onto the mat)
  const pt = f.death?.pants;
  if (pt) drawStevePants(c, pt.x, pt.y + 4, fr);
  const br = f.death?.how === 'stunt' ? f.death.brace : null;
  if (br) drawSteveBrace(c, br.x, br.y, fr);
};

/** World space, in front of him: the cars in front, Steve dragged in front, thrown cars, the tow rope, the words,
 *  the barrier and the crowd. */
export const drawFightFront = (c: Ctx, state: GameState, f: Fight) => {
  const fr = state.frame, ex = eyeX(state);
  const front = f.cars.filter(c2 => c2.z >= CUT || c2.mode === 'thrown').sort((a, b) => a.z - b.z);
  for (const car of front) drawOne(c, car, ex, fr);
  // (him out in front of the line: on the bent floor, as his tow car is)
  const sdx = f.mode !== 'dead' ? onFloorX(f.sx, f.sz, ex) - f.sx : 0;
  if (f.mode !== 'dead' && f.sz >= CUT) { c.save(); c.translate(sdx, 0); drawHim(c, f, fr); c.restore(); }
  // (the tow rope: the car's back bumper to his fists)
  if (f.tow && (f.act === 'yank' || f.act === 'towed' || f.act === 'call')) {
    const t = f.tow, rx0 = t.x - t.dir * CAR.L / 2, rx = onFloorX(rx0, t.z, ex), ry = GY + t.z * ZK - 18;
    const hx = (f.act === 'call' ? f.sx + f.facing * 20 : f.sx + t.dir * 46) + (f.sz >= CUT ? sdx : 0), hy = f.act === 'call' ? GY - 60 : GY + f.sz * ZK - 12;
    c.strokeStyle = '#1A0B06'; c.lineWidth = 3; c.beginPath(); c.moveTo(rx, ry); c.quadraticCurveTo((rx + hx) / 2, Math.max(ry, hy) + (f.act === 'call' ? 20 : 4), hx, hy); c.stroke();
    c.strokeStyle = '#D6B98C'; c.lineWidth = 1.5; c.stroke();
  }
  // (who's talking: Steve over his head; the PA up over the stage)
  if (f.said) {
    const d = f.death;
    // (over the loop: in its hole, under him, clear of the letterbox)
    const onLoop = d && (d.step === 'slump' || d.step === 'tip');
    const x = d ? d.x : f.sx, y = onLoop ? ringAt(d.side).y + 6 : d && d.step !== 'down' && d.step !== 'ash' ? Math.min(GY, d.y) - STEVE_H - 18 : GY + f.sz * ZK - STEVE_H - 18;
    saidOver(c, f.said, x, y, '#FDE047', 220);
  }
  if (f.paSaid) saidOver(c, f.paSaid, state.camera.x + CANVAS_WIDTH / 2, state.camera.y + 120, '#E5E7EB', 420);
};

/** Screen space: his bar in the top band clear of the HUD; the intro's bars and SKIP. */
export const drawFightHud = (c: Ctx, f: Fight, band: { x1: number; x2: number; mid: number }, inCutscene: boolean) => {
  if (f.mode === 'intro') {
    if (f.intro === 'gross') { drawSteveGrossBack(c, CANVAS_WIDTH, CANVAS_HEIGHT); drawSteveGross(c, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 6, 0.9 + 0.1 * Math.min(1, f.introT / 10), game?.frame ?? f.total, f.introT < 16 ? 2 : 0); }
    const k = Math.min(1, f.skipT / 20), bar = Math.round(k * 44);
    c.fillStyle = '#000'; c.fillRect(0, 0, CANVAS_WIDTH, bar); c.fillRect(0, CANVAS_HEIGHT - bar, CANVAS_WIDTH, bar);
    if (f.skipT > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
    return;
  }
  // (the sidestep: the letterbox, the cut's black, SKIP)
  const d = f.death;
  if (d && d.how === 'stunt') {
    const bar = 44;
    c.fillStyle = '#000'; c.fillRect(0, 0, CANVAS_WIDTH, bar); c.fillRect(0, CANVAS_HEIGHT - bar, CANVAS_WIDTH, bar);
    if (d.fade > 0) { c.fillStyle = `rgba(0, 0, 0, ${d.fade.toFixed(2)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
    if (d.step !== 'start' && f.deathSaid < 4 && f.skipT > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
    return;
  }
  if (f.cam) {
    const cam = f.cam, k = cam.out ? Math.max(0, (cam.z - 1) / (CAM_Z - 1)) : Math.min(1, cam.t / 20), bar = Math.round(k * 44);
    if (bar > 0) { c.fillStyle = '#000'; c.fillRect(0, 0, CANVAS_WIDTH, bar); c.fillRect(0, CANVAS_HEIGHT - bar, CANVAS_WIDTH, bar); }
    if (cam.t < 14) { c.fillStyle = `rgba(255, 255, 255, ${(1 - cam.t / 14).toFixed(2)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  }
  if (inCutscene || f.mode === 'dead') return;
  const w = band.x2 - band.x1, k = Math.max(0, f.hp / HP);
  box(c, band.x1, 22, w, 14, '#18181B'); box(c, band.x1 + 2, 24, (w - 4) * k, 10, f.iframes > 0 && Math.floor(f.iframes / 4) % 2 ? '#FEF08A' : '#FACC15');
  // (in tenths, like Tucker's (the user's: "make sure they are all segmented"))
  for (let i = 1; i < 10; i++) box(c, Math.round(band.x1 + 2 + ((w - 4) * i) / 10), 24, 1, 10, '#18181B');
  label(c, 'STUNTMAN STEVE', band.mid, 50, '#FDE047', 7);
  drawCarWarnings(c, f);
};

/** The cars on their way that are off the screen (the user's: "give a warning when one offscreen is coming"): a
 *  flashing arrow at that edge, at its height, in its color; quicker the nearer it is. */
const COMING: ReadonlySet<Car['mode']> = new Set(['enter', 'run', 'drift', 'orbit', 'approach', 'climb', 'air']);
const drawCarWarnings = (c: Ctx, f: Fight) => {
  const s = game;
  if (!s) return;
  const camX = s.camera.x, camY = s.camera.y, fr = s.frame;
  for (const car of f.cars) {
    if (car.scripted || !COMING.has(car.mode)) continue;
    const sx = car.x - camX, half = CAR.L / 2;
    const side = sx + half < 0 ? -1 : sx - half > CANVAS_WIDTH ? 1 : 0;
    // (on the screen already, or going away from it)
    if (!side || car.dir === side) continue;
    const off = side < 0 ? -(sx + half) : sx - half - CANVAS_WIDTH;
    const every = off < 250 ? 4 : off < 600 ? 7 : 11;
    if (Math.floor(fr / every) % 2) continue;
    const x = side < 0 ? 6 : CANVAS_WIDTH - 6, y = Math.max(70, Math.min(CANVAS_HEIGHT - 40, car.y + car.z * ZK - camY - 30));
    const col = car.color === 'red' ? '#EF4444' : car.color === 'blue' ? '#3B82F6' : '#FACC15';
    c.beginPath(); c.moveTo(x, y); c.lineTo(x - side * 20, y - 13); c.lineTo(x - side * 20, y + 13); c.closePath();
    c.fillStyle = '#000'; c.fill(); c.strokeStyle = '#000'; c.lineWidth = 4; c.stroke();
    c.fillStyle = col; c.fill();
    c.fillStyle = '#FFF'; c.fillRect(x - side * 13 - 1, y - 6, 2, 7); c.fillRect(x - side * 13 - 1, y + 3, 2, 2);
  }
};

/** For the jumbotron: the replay while it's on; OUCH when he's hit. */
/** The garage doors as they are (how far up; a car's tell on in it): for the set's art. */
export const bayLooks = (f: Fight) => DOORS_X.map((dx, i) => ({ open: f.doorOpen[i] ?? 0, tell: f.cars.some(c => (c.hold ?? 0) > 0 && Math.abs(c.x - dx) < 4) }));
export const screenState = (f: Fight) => ({ replay: f.replay, hurtFlash: f.flash, hype: f.hype });
