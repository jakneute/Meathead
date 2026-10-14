// THE QUEEN (LEGALLY DISTINCT), in the space disco (GALACTIC GROOVE): the cutscene and the fight (the user's design).
//
//   THE CUTSCENE  (HUD hidden; skip all-or-nothing) he's in (the door kicked in). The lights come up; his say about the
//                 place. Down she drops out of the ceiling, silent (a screech). He grabs the fire extinguisher off the
//                 wall (his say), hoses her down: foam all over her. Nothing: she shakes it off. His say; so he throws
//                 the thing at her head. BONK. Her first words, out of her speaker: NOW ENTERING LESS FATAL MODE. His say
//                 back. Up in the DJ booth, the real ones: ACTIVATE IMPREGNATOR RAY! (a robot giving birth: don't ask);
//                 the beam into her. His say. On.
//   HER SIDE      she holds one side of the hall (left or right), facing in, swaying.
//   BIRTHS        every so often she turns her back on him (the tell: round she goes, a push, a grunt) and out of her
//                 rear it comes: a sac, splat on the floor, and out of that one of her offspring (kin.ts: a BITER, a
//                 SPITTER or a CHARGER). So many at once, at most.
//   THE LEAP      every so often (and straight after she's had her head bonked) she crouches (the tell: down, a
//                 screech), leaps across the hall to the other side, and on the way barfs "acid" (motor oil) down on the
//                 floor: it burns, and it leaves slicks (Meathead 1's oil: he slides on them).
//   THE FLAIL     him in close too long (her reach, about a second and a half): a twitch and a spark (the tell), then all
//                 four arms going at once, a wide heavy hit that knocks him back. Backing off resets it.
//   HURTING HER   a main boss's rules: 666, the 60-frame breather after each hit; the ray gun and his moves Meathead 1's
//                 way (a shot 25; charge and slide 35; uppercut and dive kick 50); any other special weapon 35%. Her
//                 weakness is the MALLET (in full). And:
//                   - one of her own (or anybody) thrown into her: it's destroyed, and she's hurt;
//                   - one of her own BATTED back into her with the mallet: more again, she's stunned a moment, and every
//                     one of her offspring in the hall is destroyed with it;
//                   - her head bonked with the mallet, straight on (him up level with it): stunned, a modest chunk, and
//                     once she's over it she's off to the other side.
//                 No instant kills.
//   HER DEATH     her circuits going: sparks, her head drops, her crest bends, a gush of green hydraulic fluid, her
//                 recording slurring out of her; the feedback up the link pops the operators' heads up in the DJ booth
//                 (green all over its glass); her offspring drop dead where they stand. His say. Over.
//
// A retry (killed in it, back at the checkpoint inside the door): no cutscene; she's in the hall, on, and it's on.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind } from '../../../m1/types';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { say, silenceAll, pickLine } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip } from '../../../m1/game/platform/skip';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { registerDeathKind } from '../../../m1/game/player/deathAnim';
import { ENEMY_HIT_COOLDOWN, BULLET_DAMAGE, BOSS_CHARGE_DAMAGE, BOSS_UPPERCUT_DAMAGE } from '../../../m1/constants';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { takeBites } from '../../weapons/spawner';
import { setHazardZones } from '../../hazardHit';
import { ink } from '../../../m1/game/render/npc/kit';
import { ALIEN } from '../../../m1/game/scenes/alienLook';
import { hands, speak, meatheadSays, saidOver, box, label, voice } from '../section';
import { GY } from '../geometry';
import { DISCO_L as ARENA_L, DISCO_R as ARENA_R, DISCO_QX as QUEEN_X, DJ as BOOTH, EXTINGUISHER_X } from './geo';
import { drawQueen, queenHead, type QueenPose } from './art';
import { BITER, SPITTER, CHARGER, isKin, kinAge, spawnKin, destroyKin, tickKin, drawKinShots, drawSac, resetKin } from './kin';
import * as L from './lines';

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
const SIDE_X = { [-1]: ARENA_L + 200, [1]: QUEEN_X } as Record<-1 | 1, number>;
/** Births: how often (by phase), at most this many of hers about at once; the tell (turning round), the push. */
const BIRTH_EVERY = [0, 300, 220], KIN_CAP = [0, 3, 4], TURN_T = 26, PUSH_T = 34;
/** Which kind comes out (by phase): the chances of a biter, a spitter (the rest chargers). */
const KIN_ODDS = [[0, 0, 0], [0.55, 0.3], [0.4, 0.35]];
/** The leap: how often (by phase); the crouch (the tell), the air, the landing; how high; the oil it barfs. */
const LEAP_EVERY = [0, 760, 560], CROUCH_T = 34, AIR_T = 54, LAND_T = 22, LEAP_UP = 250, OIL_DMG = 12;
/** The flail: in this close this long and it's coming; the tell; the hit (how wide, how hard, how far he goes). */
const FLAIL_REACH = 190, FLAIL_LINGER = 90, FLAIL_TELL = 20, FLAIL_T = 26, FLAIL_WIDE = 230, FLAIL_DMG = 28;
/** Thrown into her: what it does; batted back with the mallet: what that does, and how long she's stunned. */
const THROWN_DMG = 60, BATTED_DMG = 140, BATTED_STUN = 90;
/** Her head bonked with the mallet: the extra, the stun. */
const HEAD_EXTRA = 30, HEAD_STUN = 70;
/** The oil slicks: how long one lasts (frames). */
const SLICK_LIFE = 1100;
/** How often she says something at him (frames). */
const TAUNT_EVERY = 900;

const OIL = 'm2:sp_queen_oil', FLAIL = 'm2:sp_queen_flail', POOL = 'm2:sp_queen_pool';
registerHurtLines(OIL, L.HURT_OIL, L.DEATH_OIL);
registerDeathKind(OIL, 'burnt');
registerDeathKind(POOL, 'boiled');
/** The flail's and the pool's lines go by the state of him: set each frame (registerHurtLines just files them). */
const fileLines = (state: GameState) => {
  const d = dressed(state);
  registerHurtLines(FLAIL, [...L.HURT_FLAIL[d]], [...L.DEATH_FLAIL[d]]);
  registerHurtLines(POOL, [...L.HURT_POOL[d]], [...L.DEATH_POOL[d]]);
};
/** The pool of hot oil she lands in after a leap: how wide; what it does to him. Up till her next birth. */
const POOL_R = 170, POOL_DMG = 22;

/** Kept across his deaths: the disco's cutscene's been (a retry skips it). */
const INTRO_MEMO = 'm2:space:discoIntro';

// ---------------------------------------------------------------------------------------------------------------
// The state

type Step = 'lights' | 'drop' | 'grab' | 'spray' | 'shake' | 'throw' | 'bonk' | 'mode' | 'ray' | 'beam' | 'react';
export type Mode = 'wait' | 'intro' | 'idle' | 'birth' | 'leap' | 'flail' | 'stun' | 'dead';
interface Drop { x: number; y: number; vx: number; vy: number }
interface Sac { x: number; y: number; vx: number; vy: number; t: number; kind: string; landed: number }
interface Slick { x1: number; x2: number; t: number }

export interface Fight {
  mode: Mode; t: number; total: number;
  hp: number; iframes: number; flash: number; moveSeen: number | undefined;
  /** Her side (-1 left, 1 right), where she is (x), how far up she is (the leap), which way she faces. */
  side: -1 | 1; x: number; y: number; facing: 1 | -1;
  ext: number; ph: string | null;
  step: Step; stepT: number; skipT: number; token: number;
  glass: boolean; booth: number; beam: number; alive: number;
  lights: number; down: number; foam: number; ext2: 'wall' | 'held' | 'air' | 'gone'; ex: { x: number; y: number; vx: number; vy: number; r: number };
  said: string | null; boothSaid: string | null;
  birthT: number; leapT: number; linger: number; forceLeap: boolean; stunT: number;
  /** The pool round her (after a leap; gone with her next birth): where, how far up it is (0..1), going. */
  pool: { x: number; k: number; going: boolean } | null;
  drops: Drop[]; sacs: Sac[]; slicks: Slick[];
  tauntT: number; saidBirth: number;
  /** A throw or a bat landed on her lately (the engine's own share of the same hit isn't counted on top). */
  eventAt: number;
  /** The operators in the booth: alive, or popped. */
  operators: boolean;
  deathT: number; deathSaid: number; byWeakness: boolean;
  e: Enemy | null;
}
export const makeFight = (state: GameState): Fight => {
  const seen = !!state.stageMemo[INTRO_MEMO];
  return {
    mode: 'wait', t: 0, total: 0, hp: HP, iframes: 0, flash: 0, moveSeen: undefined,
    side: 1, x: SIDE_X[1], y: 0, facing: -1, ext: 0, ph: null,
    step: 'lights', stepT: 0, skipT: 0, token: 0,
    glass: !seen, booth: 1, beam: 0, alive: 1,
    lights: seen ? 1 : 0, down: seen ? 1 : 0, foam: 0, ext2: seen ? 'gone' : 'wall', ex: { x: EXTINGUISHER_X, y: GY - 90, vx: 0, vy: 0, r: 0 },
    said: null, boothSaid: null,
    birthT: 120, leapT: 0, linger: 0, forceLeap: false, stunT: 0, pool: null,
    drops: [], sacs: [], slicks: [], tauntT: 0, saidBirth: -9999, eventAt: -99,
    operators: true, deathT: 0, deathSaid: 0, byWeakness: false, e: null,
  };
};

// ---------------------------------------------------------------------------------------------------------------
// Her, the enemy (the engine's: for the hits. She's drawn here, not by it)

const QUEEN_KIND = 'm2:sp_queen' as const;
/** The disco's cutscene's lights (0..1), for the hall's own drawing and lighting. */
export const discoLights = (f: Fight) => f.lights;
registerM2Kind({
  kind: QUEEN_KIND,
  stats: { w: 110, h: 240, hp: BIG, contact: 0, mass: 900, air: true },
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y, harmless: true }),
  gender: 'f', grab: 'none', midBoss: true, robot: true,
  head: { x: 40, y: -250, r: 24 },
  draw: () => {},
  ai: () => true,
});

// ---------------------------------------------------------------------------------------------------------------
// Saying things (one voice at a time: a bark's dropped if anybody's talking)

const tokened = (f: Fight, fn: () => void) => { const tok = f.token; return () => { if (tok === f.token) fn(); }; };
const queenSays = (state: GameState, f: Fight, lines: L.ByPants, onDone?: () => void) => {
  const tok = f.token;
  speak('m2.space.queen', pick(lines[dressed(state)]), s => { if (tok === f.token) f.said = s?.text ?? null; }, true, () => { if (tok === f.token) onDone?.(); });
};
const quiet = (f: Fight) => !f.said && !f.boothSaid;
const bark = (state: GameState, f: Fight, lines: L.ByPants, who: 'queen' | 'booth' = 'queen') => {
  if (!quiet(f)) return;
  const text = pick(lines[dressed(state)]);
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

export const startFight = (state: GameState, f: Fight) => {
  f.token++;
  resetKin();
  if (!f.glass) { begin(state, f); return; }
  f.mode = 'intro'; f.step = 'lights'; f.stepT = 0; f.skipT = 0;
  state.player.inCutscene = true;
  meatheadSays(state, pick(L.MH_DISCO[dressed(state)]), true, tokened(f, () => go(f, 'drop')));
};

/** On: out of the cutscene, the enemy into the world. */
const begin = (state: GameState, f: Fight) => {
  f.token++;
  to(f, 'idle'); f.glass = false; f.booth = 1; f.beam = 0; f.alive = 1; f.said = null; f.boothSaid = null;
  f.lights = 1; f.down = 1; f.foam = 0; f.ext2 = 'gone';
  f.birthT = 120; f.leapT = 0;
  state.stageMemo[INTRO_MEMO] = '1';
  state.player.inCutscene = false; state.player.kickPose = 0;
  const e = makeKindEnemy(QUEEN_KIND as EnemyKind, f.x, GY);
  e.facing = f.facing; e.seen = true;
  f.e = e; f.moveSeen = e.hitByMove;
  state.enemies.push(e);
};

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
  const t = f.stepT, cx = p.pos.x + p.width / 2, head = queenHead(QUEEN_X, -1, 0);
  f.lights = Math.min(1, f.lights + 0.03);
  if (f.ext2 === 'held') { f.ex.x = cx + p.facing * 22; f.ex.y = p.pos.y + 34; }
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
      if (t === 30) playSound('roar', 0.8, -8);
      if (t >= 60) go(f, 'grab');
      break;
    case 'grab':
      // (over to the wall for the extinguisher)
      if (Math.abs(cx - EXTINGUISHER_X) > 12 && t < 200) return { ...hands(), right: cx < EXTINGUISHER_X, left: cx > EXTINGUISHER_X } as Controls;
      p.vel.x = 0; p.facing = 1;
      if (f.ext2 === 'wall') { f.ext2 = 'held'; playSound('clink', 0.8, -4); meatheadSays(state, pick(L.MH_EXTINGUISHER), true, tokened(f, () => go(f, 'spray'))); }
      break;
    case 'spray':
      // (the foam: a white stream out at her; it piles up on her)
      if (t % 3 === 0) {
        playSound('oil', 0.3, 8);
        for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: f.ex.x + 18, y: f.ex.y - 4 }, vel: { x: 9 + Math.random() * 3, y: -2 + Math.random() * 2.5 }, life: 40, color: i % 2 ? '#F8FAFC' : '#E2E8F0', size: 4 + Math.random() * 4, grav: 0.08 });
      }
      f.foam = Math.min(1, t / 80);
      if (t >= 90) { go(f, 'shake'); playSound('gush', 0.5, 4); }
      break;
    case 'shake':
      // (nothing: she shakes it all off, like a dog)
      if (t % 6 === 0) { playSound('whoosh', 0.4, 6); for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: QUEEN_X + (Math.random() - 0.5) * 80, y: GY - 120 - Math.random() * 160 }, vel: { x: (Math.random() - 0.5) * 9, y: -2 - Math.random() * 4 }, life: 34, color: '#F8FAFC', size: 4 + Math.random() * 4, grav: 0.3 }); }
      f.foam = Math.max(0, f.foam - 0.025);
      if (t === 40) meatheadSays(state, pick(L.MH_FOAM_FAIL), true, tokened(f, () => go(f, 'throw')));
      break;
    case 'throw':
      // (so he throws it at her head: up, over, end over end)
      if (t === 1) { meatheadSays(state, pick(L.MH_THROW), false); }
      if (t === 20) {
        f.ext2 = 'air';
        const T = 34;
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
      if (t === 40) { go(f, 'mode'); queenSays(state, f, L.QUEEN_LESS_FATAL, tokened(f, () => meatheadSays(state, pick(L.MH_LESS_FATAL[dressed(state)]), true, tokened(f, () => go(f, 'ray'))))); }
      break;
    case 'mode':
      if (t > 1500) go(f, 'ray');
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

const phase = (f: Fight) => (f.hp > HP / 2 ? 1 : 2);
const to = (f: Fight, m: Mode) => { f.mode = m; f.t = 0; f.ph = null; };
const pmid = (state: GameState) => ({ x: state.player.pos.x + state.player.width / 2, y: state.player.pos.y + state.player.height / 2 });
const canHurt = (state: GameState) => state.player.health > 0 && state.deathTimer <= 0 && state.player.invincibilityTimer <= 0;
const kinAbout = (state: GameState) => state.enemies.filter(e => isKin(e) && e.health > 0 && !e.isBlownAway);

export const updateFight = (ctx: FrameContext, f: Fight, controls: Controls): Controls => {
  const { state } = ctx;
  f.total++;
  if (f.mode === 'intro') return intro(ctx, f);
  if (f.mode === 'wait') return controls;
  f.t++;
  if (f.iframes > 0) f.iframes--;
  if (f.flash > 0) f.flash--;
  tickKin(ctx);
  fileLines(state);
  if (f.mode !== 'dead') { thrownInto(ctx, f); takeHits(ctx, f); }
  if (f.hp <= 0 && f.mode !== 'dead') die(ctx, f);
  const ph = phase(f), p = state.player, pm = pmid(state);
  const toward = (pm.x < f.x ? -1 : 1) as 1 | -1;
  if (f.mode !== 'dead' && ++f.tauntT >= TAUNT_EVERY) { f.tauntT = Math.floor(Math.random() * 200); bark(state, f, L.QUEEN_TAUNT); }
  // (him in close: the flail's coming if he stays; backing off, it's off)
  // (not with the pool up round her: that's the keep-off then)
  const close = Math.abs(pm.x - f.x) < FLAIL_REACH && f.y === 0 && p.health > 0 && !f.pool;
  f.linger = close && (f.mode === 'idle' || f.mode === 'birth') ? f.linger + 1 : Math.max(0, f.linger - 3);
  switch (f.mode) {
    case 'idle':
      f.facing = toward; f.ext *= 0.85;
      if (f.linger >= FLAIL_LINGER) { to(f, 'flail'); f.ph = 'tell'; playSound('click', 0.8, 10); break; }
      if (f.forceLeap || ++f.leapT >= LEAP_EVERY[ph]) { startLeap(state, f); break; }
      if (++f.birthT >= BIRTH_EVERY[ph] && kinAbout(state).length + f.sacs.length < KIN_CAP[ph]) { f.birthT = 0; to(f, 'birth'); f.ph = 'turn'; playSound('snort', 0.7, -8); }
      break;
    case 'birth':
      // (round she turns, her back to him; a push; out it comes)
      if (f.linger >= FLAIL_LINGER) { to(f, 'flail'); f.ph = 'tell'; playSound('click', 0.8, 10); break; }
      if (f.ph === 'turn') { f.facing = (-toward) as 1 | -1; if (f.t >= TURN_T) { f.ph = 'push'; f.t = 0; bark(state, f, L.QUEEN_BIRTH); } }
      else if (f.ph === 'push') {
        if (f.t % 8 === 0) { playSound('snort', 0.6, -12 + (f.t % 16) / 2); shakeScreen(state, 2, 1); }
        if (f.t >= PUSH_T) {
          // (out of her rear, toward the middle of the hall: the sac)
          const dir = (-f.facing) as 1 | -1, r = Math.random(), odds = KIN_ODDS[ph];
          const kind = r < odds[0] ? BITER : r < odds[0] + odds[1] ? SPITTER : CHARGER;
          f.sacs.push({ x: f.x + dir * 70, y: GY - 90, vx: dir * (3 + Math.random() * 2), vy: -3, t: 0, kind, landed: 0 });
          playSound('fart', 1, -6); playSound('splat', 0.8, -4); shakeScreen(state, 4, 2);
          for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: f.x + dir * 60, y: GY - 90 }, vel: { x: dir * (1 + Math.random() * 4), y: -1 - Math.random() * 3 }, life: 30, color: i % 2 ? ALIEN.slime : '#0A0A0A', size: 2 + Math.random() * 3, grav: 0.3 });
          if (state.frame - f.saidBirth > 900) { f.saidBirth = state.frame; meatheadSays(state, pick(L.MH_BIRTH), false); }
          else if (Math.random() < 0.4) bark(state, f, L.BOOTH_BIRTH, 'booth');
          f.ph = 'after'; f.t = 0;
          // (and the pool round her goes, as they come)
          if (f.pool) f.pool.going = true;
        }
      } else if (f.t >= 24) to(f, 'idle');
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
  sync(f);
  return controls;
};

// ---------------------------------------------------------------------------------------------------------------
// The leap, the oil

const startLeap = (state: GameState, f: Fight) => {
  to(f, 'leap'); f.ph = 'crouch'; f.leapT = 0; f.forceLeap = false;
  f.facing = (-f.side) as 1 | -1;
  playSound('screams', 0.6, -8);
  if (Math.random() < 0.6) bark(state, f, L.QUEEN_LEAP);
};
const leaping = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  const from = SIDE_X[f.side], dest = SIDE_X[(-f.side) as -1 | 1];
  if (f.ph === 'crouch') { if (f.t >= CROUCH_T) { f.ph = 'air'; f.t = 0; playSound('whoosh', 1, -8); playSound('engine', 0.6, 6); } return; }
  if (f.ph === 'air') {
    const k = f.t / AIR_T;
    f.x = from + (dest - from) * k; f.y = Math.sin(k * Math.PI) * LEAP_UP;
    // (the barf: motor oil down out of her mouth on the way over)
    if (f.t > 6 && f.t < AIR_T - 6 && f.t % 2 === 0) {
      const h = queenHead(f.x, f.facing, 0);
      f.drops.push({ x: h.x + f.facing * 20, y: GY - f.y - 230, vx: f.facing * (1 + Math.random() * 2), vy: 1 + Math.random() * 2 });
      if (f.t % 6 === 0) playSound('gush', 0.6, -2);
    }
    if (f.t >= AIR_T) {
      f.ph = 'land'; f.t = 0; f.x = dest; f.y = 0; f.side = (-f.side) as -1 | 1; playSound('thud', 1.2, -10); playSound('land', 1, -8); shakeScreen(state, 12, 6);
      // (down into a pool of it: hot, all round her, till her next birth)
      f.pool = { x: dest, k: 0, going: false }; playSound('gush', 1, -8);
      // (and a while before she births again: the pool's the keep-off till then; bat her kin back into her)
      f.birthT = 0;
    }
    return;
  }
  if (f.t >= LAND_T) to(f, 'idle');
};
const tickOil = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, p = state.player;
  f.drops = f.drops.filter(d => {
    d.x += d.vx; d.y += d.vy; d.vy += 0.4;
    if (canHurt(state) && d.x > p.pos.x - 6 && d.x < p.pos.x + p.width + 6 && d.y > p.pos.y && d.y < p.pos.y + p.height) {
      hurtPlayer(ctx, OIL_DMG, OIL, { x: Math.sign(d.vx) * 3, y: -3 }, 10); playSound('splat', 0.6, 2); return false;
    }
    if (d.y >= GY - 2) {
      // (a slick where it lands, joined to any next to it)
      const near = f.slicks.find(s => d.x > s.x1 - 30 && d.x < s.x2 + 30);
      if (near) { near.x1 = Math.min(near.x1, d.x - 20); near.x2 = Math.max(near.x2, d.x + 20); near.t = 0; }
      else f.slicks.push({ x1: d.x - 24, x2: d.x + 24, t: 0 });
      for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: d.x, y: GY - 2 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 14, color: '#0A0A0A', size: 2 + Math.random() * 2, grav: 0.3 });
      return false;
    }
    return d.x > ARENA_L - 40 && d.x < ARENA_R + 40;
  });
  for (const s of f.slicks) s.t++;
  f.slicks = f.slicks.filter(s => s.t < SLICK_LIFE);
  // (the engine's oil: he slides on it)
  const others = (state.groundOil ?? []).filter(o => !(o as { queen?: boolean }).queen);
  state.groundOil = [...others, ...f.slicks.map(s => ({ x1: Math.max(ARENA_L, s.x1), x2: Math.min(ARENA_R, s.x2), kind: 'slick' as const, queen: true }))];
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
    hurtPlayer(ctx, POOL_DMG, POOL, { x: away * 11, y: -9 }, 18); playSound('splat', 0.8, -4);
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
      if (f.mode !== 'dead') spawnKin(state, s.kind, Math.max(ARENA_L + 40, Math.min(ARENA_R - 40, s.x)), s.vx > 0 ? 1 : -1);
      playSound('crack', 0.6, 6);
      return false;
    }
    return true;
  });
};

// ---------------------------------------------------------------------------------------------------------------
// Hits

/** Anybody flung into her: thrown (the grab), batted (the mallet), knocked flying. Hers are destroyed on her. */
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
    f.eventAt = f.total;
    if (batted) {
      // (her own, batted back into her: the big one; she's stunned, and the lot of them go)
      f.hp -= BATTED_DMG; f.flash = 16;
      for (const k of kinAbout(state)) destroyKin(ctx, k);
      if (state.enemies.includes(e)) destroyKin(ctx, e);
      f.sacs = [];
      ctx.fx.spawnDamageNumber({ x: f.x - 20, y: GY - 260 }, BATTED_DMG, true);
      ctx.fx.spawnDamageNumber({ x: f.x - 60, y: GY - 300 }, 'RETURN TO SENDER!', true, '#FDE047');
      playSound('bonk', 1.2, -4); playSound('crash', 1, -2); shakeScreen(state, 16, 8);
      if (f.hp > 0) { stun(state, f, BATTED_STUN); meatheadSays(state, pick(L.MH_BAT), false); }
      else f.byWeakness = true;
      return;
    }
    // (thrown into her: it's done for, and she's hurt)
    f.hp -= THROWN_DMG; f.flash = 10;
    ctx.fx.spawnDamageNumber({ x: f.x - 20, y: GY - 260 }, THROWN_DMG, true);
    playSound('crash', 0.8, 2); shakeScreen(state, 8, 4);
    if (isKin(e) || e.isBlownAway) destroyKin(ctx, e);
    else { e.health = 0; ctx.fx.blowAwayEnemy(e, { x: -Math.sign(e.vel.x) * 6, y: -6 }, null as never, -Math.sign(e.vel.x) || 1); }
    if (f.hp <= 0) f.byWeakness = p.currentWeapon === 'MALLET';
  }
};

const takeHits = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, e = f.e, p = state.player;
  if (!e) return;
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
  if (hit <= 0.5 || f.iframes > 0) return;
  const mallet = !melee && p.currentWeapon === 'MALLET';
  const dmg = melee ? (p.isUppercutting || p.isDivekicking ? BOSS_UPPERCUT_DAMAGE : BOSS_CHARGE_DAMAGE)
    : p.currentWeapon === 'GUN' ? BULLET_DAMAGE : mallet ? hit : Math.max(1, hit * SHARE);
  f.hp -= dmg; f.iframes = IFRAMES; f.flash = 8;
  for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: e.pos.x + e.width / 2, y: e.pos.y + 60 + Math.random() * 100 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 16, color: i % 2 ? '#FDE047' : ALIEN.slime, size: 2 + Math.random() * 2, grav: 0.3 });
  playSound('clang', 0.5, 4);
  ctx.fx.spawnDamageNumber({ x: e.pos.x + 20, y: e.pos.y + 20 }, Math.max(1, Math.round(dmg)), false);
  // (the mallet, straight on, at her head (him up level with it): stunned, a bit more, and off to the other side after)
  const head = queenHead(f.x, f.facing, 0);
  if (mallet && f.hp > 0 && f.mode !== 'leap' && Math.abs(pmid(state).y - head.y) < 70 && Math.abs(pmid(state).x - head.x) < 130) {
    f.hp -= HEAD_EXTRA; f.forceLeap = true;
    ctx.fx.spawnDamageNumber({ x: head.x, y: head.y - 30 }, 'BONK!', true, '#FDE047');
    stun(state, f, HEAD_STUN);
    meatheadSays(state, pick(L.MH_HEAD), false);
  }
  if (f.hp <= 0) f.byWeakness = mallet;
};

const stun = (state: GameState, f: Fight, t: number) => {
  to(f, 'stun'); f.stunT = t; f.linger = 0;
  playSound('rayFizzle', 0.8, -6); shakeScreen(state, 6, 3);
  bark(state, f, L.QUEEN_STUN);
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
  to(f, 'dead'); f.deathT = 0; f.drops = []; f.sacs = []; f.y = 0; if (f.pool) f.pool.going = true;
  if (f.e) state.enemies = state.enemies.filter(o => o !== f.e);
  // (her offspring: dead where they stand, the lot)
  for (const k of kinAbout(state)) destroyKin(ctx, k);
  state.damageNumbers = [];
  f.said = null; f.boothSaid = null;
  playSound('rayFizzle', 1, -8); playSound('crash', 0.6, -4);
  queenSays(state, f, L.QUEEN_DIES, tokened(f, () => { f.deathSaid = 1; }));
};
const dying = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  const t = ++f.deathT;
  f.ext *= 0.95;
  if (t % 5 === 0 && t < 200) state.particles.push({ pos: queenHead(f.x, f.facing, f.ext), vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 3 }, life: 16, color: Math.random() < 0.5 ? '#FDE047' : '#FFFFFF', size: 2 + Math.random() * 2, grav: 0.3 });
  if (t > 30 && t < 120 && t % 2 === 0) state.particles.push({ pos: { x: f.x, y: GY - 180 }, vel: { x: f.facing * (2 + Math.random() * 4), y: -3 - Math.random() * 3 }, life: 40, color: [ALIEN.slime, ALIEN.slimeDark, ALIEN.slimeLight][t % 3], size: 3 + Math.random() * 3, grav: 0.35 });
  if (t === 30) playSound('gush', 1, -6);
  if (t === 90 && f.operators) { f.operators = false; playSound('splat', 1, -2); playSound('boom', 0.5, 6); shakeScreen(state, 6, 3); for (let i = 0; i < 20; i++) state.particles.push({ pos: { x: BOOTH.x + 50 + (i % 2) * 100, y: BOOTH.y + BOOTH.h - 30 }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 3 }, life: 30, color: [ALIEN.slime, ALIEN.slimeDark, ALIEN.gum][i % 3], size: 2 + Math.random() * 3, grav: 0.3 }); }
  if (t === 140) { playSound('thud', 1, -8); shakeScreen(state, 10, 5); }
  if (f.deathSaid === 1 && t > 160) { f.deathSaid = 2; meatheadSays(state, pick(L.MH_WON[dressed(state)]), true, tokened(f, () => { f.deathSaid = 3; })); }
  if (t > 1500) f.deathSaid = 3;
};

export const fightOver = (f: Fight) => f.mode === 'dead' && f.deathSaid >= 3 && f.deathT > 220;
export const endFight = (state: GameState, f: Fight) => { state.player.inCutscene = false; f.drops = []; f.pool = null; setHazardZones(state, 'queen-pool', []); clearOil(state); };
export const introOn = (f: Fight) => f.mode === 'intro';

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const poseOf = (f: Fight): QueenPose => {
  if (f.mode === 'dead') return f.deathT < 140 ? 'stunned' : 'dead';
  if (f.mode === 'intro' || f.mode === 'wait') return f.step === 'drop' ? 'roar' : f.step === 'shake' ? 'hurt' : f.step === 'bonk' ? 'stunned' : f.step === 'mode' || f.step === 'beam' ? 'wake' : 'idle';
  if (f.flash > 0) return 'hurt';
  if (f.mode === 'birth') return f.ph === 'push' ? 'birth' : 'idle';
  if (f.mode === 'flail') return f.ph === 'tell' ? 'wake' : f.t % 6 < 3 ? 'swipe' : 'tell';
  if (f.mode === 'leap') return f.ph === 'crouch' ? 'stalk' : f.ph === 'air' ? 'spit' : 'stalk';
  if (f.mode === 'stun') return 'stunned';
  return 'idle';
};

export const drawQueenFight = (c: Ctx, state: GameState, f: Fight) => {
  // (the oil slicks on the floor: glossy black, a sheen)
  for (const s of f.slicks) {
    const a = Math.min(1, (SLICK_LIFE - s.t) / 120);
    c.fillStyle = `rgba(5, 3, 2, ${(0.9 * a).toFixed(2)})`; c.fillRect(Math.round(s.x1), GY - 3, Math.round(s.x2 - s.x1), 5);
    c.fillStyle = `rgba(167, 139, 250, ${(0.35 * a).toFixed(2)})`; c.fillRect(Math.round(s.x1 + 6 + (state.frame % 40)), GY - 3, 10, 1);
  }
  // (the pool: a wide bubbling mound of hot black-brown oil round her feet, a rainbow sheen sliding over it)
  if (f.pool && f.pool.k > 0) {
    const pl = f.pool, r = POOL_R * pl.k, fr = state.frame;
    c.fillStyle = '#0A0603'; c.beginPath(); c.ellipse(pl.x, GY, r + 4, 16 * pl.k + 3, 0, Math.PI, 0); c.fill(); c.fillRect(pl.x - r - 4, GY - 1, r * 2 + 8, 5);
    c.fillStyle = '#2A1A0B'; c.beginPath(); c.ellipse(pl.x, GY, r, 14 * pl.k, 0, Math.PI, 0); c.fill();
    c.fillStyle = '#4A2E12'; c.beginPath(); c.ellipse(pl.x - r * 0.2, GY - 4 * pl.k, r * 0.6, 6 * pl.k, 0, Math.PI, 0); c.fill();
    for (const [col, off] of [['rgba(167, 139, 250, 0.55)', 0], ['rgba(45, 212, 191, 0.5)', 14], ['rgba(250, 204, 21, 0.45)', 28]] as const) { const sx = pl.x - r * 0.7 + ((fr * 0.8 + off * 5) % (r * 1.4)); c.fillStyle = col; c.fillRect(Math.round(sx), Math.round(GY - 10 * pl.k), 18, 2); }
    for (let i = 0; i < 6; i++) { const u = ((fr * 0.05 + i * 0.37) % 1), bx = pl.x - r * 0.8 + (i * 61 % 100) / 100 * r * 1.6, by = GY - 8 * pl.k - u * 14, br = 2 + (1 - u) * 4; c.strokeStyle = `rgba(120, 90, 50, ${(0.9 * (1 - u)).toFixed(2)})`; c.lineWidth = 1.5; c.beginPath(); c.arc(bx, by, br, 0, Math.PI * 2); c.stroke(); }
    for (let i = 0; i < 4; i++) { const u = ((fr * 0.02 + i * 0.25) % 1); c.fillStyle = `rgba(160, 140, 120, ${(0.25 * (1 - u)).toFixed(2)})`; c.fillRect(Math.round(pl.x - r * 0.5 + i * r * 0.33), Math.round(GY - 20 - u * 50), 8 + u * 10, 6 + u * 6); }
  }
  for (const s of f.sacs) drawSac(c, s.x, s.y, state.frame, s.landed > 10 ? Math.min(1, (s.landed - 10) / 16) : 0);
  if (f.down > 0) {
    const blink = f.iframes > 0 && Math.floor(state.frame / 3) % 2 === 0 && f.mode !== 'dead';
    if (blink) c.globalAlpha = 0.65;
    const dy = -420 * (1 - f.down) - f.y, sx = f.mode === 'intro' && f.step === 'shake' ? Math.sin(state.frame * 1.3) * 6 : 0;
    const crouch = f.mode === 'leap' && f.ph !== 'air' ? 0.9 : 1;
    c.save(); c.translate(sx, dy);
    c.translate(f.x, GY); c.scale(1, crouch); c.translate(-f.x, -GY);
    drawQueen(c, f.x, f.facing, { pose: poseOf(f), t: state.frame, ext: f.ext, alive: f.mode === 'dead' ? Math.max(0, 1 - f.deathT / 60) : f.alive, beat: Math.max(0, 1 - f.hp / HP), free: true, foam: f.foam, stride: 0 });
    c.restore();
    if (blink) c.globalAlpha = 1;
  }
  // (the flail's tell: her reach marked on the floor, red, flashing)
  if (f.mode === 'flail' && f.ph === 'tell') box(c, f.x - FLAIL_WIDE, GY - 3, FLAIL_WIDE * 2, 3, f.t % 6 < 3 ? '#EF4444' : '#7F1D1D');
  // (the impregnator ray: pink rings down out of the DJ booth into her belly)
  if (f.beam > 0) {
    const sx = BOOTH.x + BOOTH.w / 2, sy = BOOTH.y + BOOTH.h, tx = f.x, ty = GY - 150;
    for (let i = 0; i < 9; i++) { const k = ((i / 9) + state.frame * 0.035) % 1; c.strokeStyle = `rgba(244, 114, 182, ${(0.85 * f.beam * (1 - k * 0.4)).toFixed(2)})`; c.lineWidth = 3; c.beginPath(); c.ellipse(sx + (tx - sx) * k, sy + (ty - sy) * k, 8 + k * 16, 12 + k * 20, 0.4, 0, Math.PI * 2); c.stroke(); }
  }
  // (the motor oil in the air)
  for (const d of f.drops) { box(c, d.x - 4, d.y - 5, 8, 10, '#0A0A0A'); box(c, d.x - 2, d.y - 4, 2, 3, '#7C6A3A'); }
  drawKinShots(c);
  // (the extinguisher: on the wall, in his hands, in the air at her)
  if (f.ext2 !== 'gone') { c.save(); c.translate(f.ex.x, f.ext2 === 'wall' ? GY - 110 : f.ex.y); c.rotate(f.ex.r); ink(c, () => c.roundRect(-7, -18, 14, 34, 4), '#DC2626'); box(c, -4, -24, 8, 6, '#18181B'); box(c, 2, -22, 10, 3, '#18181B'); box(c, -5, -6, 10, 6, '#F8FAFC'); c.restore(); }
};
/** Her words; theirs, up in the booth. */
export const drawQueenSaid = (c: Ctx, f: Fight) => {
  if (f.said) saidOver(c, f.said, f.x - f.facing * 20, GY - 330 - f.y, '#BEF264', 260);
  if (f.boothSaid) saidOver(c, f.boothSaid, BOOTH.x + BOOTH.w / 2, BOOTH.y - 20, '#D9F99D', 260);
};
/** Screen space: her bar, in the top band clear of the HUD. */
export const drawFightHud = (c: Ctx, f: Fight, band: { x1: number; x2: number; mid: number }, inCutscene: boolean) => {
  if (inCutscene || f.mode === 'dead' || f.mode === 'intro' || f.mode === 'wait') return;
  const w = band.x2 - band.x1, k = Math.max(0, f.hp / HP);
  box(c, band.x1, 22, w, 14, '#18181B'); box(c, band.x1 + 2, 24, (w - 4) * k, 10, f.iframes > 0 && Math.floor(f.iframes / 4) % 2 ? '#D9F99D' : '#65A30D');
  label(c, 'THE QUEEN (LEGALLY DISTINCT)', band.mid, 50, '#D9F99D', 7);
};
