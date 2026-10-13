// THE QUEEN (LEGALLY DISTINCT): the cutscene and a PLACEHOLDER fight. The user's boss design (her spawning brood, a
// robot made to birth new aliens, the spawner references) isn't in yet, by the user's word: this is a simple, winnable
// stand-in, all of it in this file, to be thrown out and replaced. The room, her art and her poses (art.ts: birth's
// already drawn) and the land's ending (index.ts) stay.
//
//   THE CUTSCENE  (HUD hidden; skip all-or-nothing) he walks up to her glass; his say; he kicks it in. The real ones up
//                 in the control booth light up: their say; their mind-control dish puts its rings into her head, she
//                 twitches, the green comes on under her crest, she rears up and roars (her say: their words out of her
//                 busted speaker). On.
//   THE FIGHT     (placeholder) she sways on her arm, and between whiles: the SWIPE (claws up and a hiss: the tell; then
//                 out at him on her hydraulic arm, held, back: keep clear of her reach, or jump it), or the SPIT (head
//                 back: the tell; a spray of hydraulic fluid lobbed at him). After a swipe she's stuck out at the end of
//                 her arm a moment, sparking: the window. Past half, quicker, and more spit.
//   HURTING HER   a main boss's rules: 666, the 60-frame breather after each hit; the ray gun and his moves Meathead 1's
//                 way (a shot 25; charge and slide 35; uppercut and dive kick 50); the spawner (her weakness, the land's
//                 own gun) in full; any other special weapon 35%. No instant kills.
//   HER DEATH     her circuits going: sparks, her head drops, her crest bends, a gush of green hydraulic fluid, her
//                 recording slurs out of her; the feedback up the link pops the operators' heads in the booth (green
//                 all over its window). His say. Over.
//
// A retry (killed in it, back at the checkpoint): the glass is in already, she's on and waiting; in the doorway, it's on.

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
import { ENEMY_HIT_COOLDOWN, KICK_POSE_FRAMES, BULLET_DAMAGE, BOSS_CHARGE_DAMAGE, BOSS_UPPERCUT_DAMAGE } from '../../../m1/constants';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { aliensOn, takeBites } from '../../weapons/spawner';
import { ALIEN } from '../../../m1/game/scenes/alienLook';
import { hands, speak, meatheadSays, saidOver, box, label, voice } from '../section';
import { GY } from '../geometry';
import { ARENA_L, ARENA_R, GLASS_X, QUEEN_X, BOOTH } from './geo';
import { drawQueen, queenHead, type QueenPose } from './art';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;
const dressed = (state: GameState): L.Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

// ---------------------------------------------------------------------------------------------------------------
// The numbers (tune here)

/** Her health (a main boss's); the enemy's (never runs out: the hits are taken off ours). */
const HP = 666, BIG = 100000;
/** Any special weapon that isn't her weakness: this share gets through; after each hit, the breather. */
const SHARE = 0.35, IFRAMES = ENEMY_HIT_COOLDOWN;
/** Between goes (frames, by phase). */
const IDLE_T = [0, 100, 66];
/** The swipe: the tell, out, held (the window: stuck out there, sparking), back; how far her arm reaches; the hurt. */
const SWIPE_TELL = [0, 42, 32], SWIPE_OUT = 12, SWIPE_STUCK = 52, SWIPE_BACK = 30, REACH = 250, CLAW_DMG = 20;
/** The spit: the tell, how many globs (by phase), the hurt. */
const SPIT_TELL = [0, 30, 24], SPIT_N = [0, 3, 5], SPIT_DMG = 14;
/** How often she says something at him (frames). */
const TAUNT_EVERY = 900;

const CLAW = 'm2:sp_queen_claw', SPIT = 'm2:sp_queen_spit';
registerHurtLines(CLAW, L.HURT_CLAW, L.DEATH_CLAW);
registerHurtLines(SPIT, L.HURT_SPIT, L.DEATH_SPIT);
registerDeathKind(SPIT, 'dissolved');

/** Kept across his deaths: the glass is in, she's on (a retry skips the cutscene). */
const INTRO_MEMO = 'm2:space:queenIntro';

// ---------------------------------------------------------------------------------------------------------------
// The state

type Step = 'walk' | 'look' | 'kick' | 'booth' | 'beam' | 'rise';
export type Mode = 'wait' | 'intro' | 'idle' | 'swipe' | 'spit' | 'dead';
interface Glob { x: number; y: number; vx: number; vy: number }
interface Splat { x: number; t: number }

export interface Fight {
  mode: Mode; t: number; total: number;
  hp: number; iframes: number; flash: number; moveSeen: number | undefined;
  ext: number; ph: 'tell' | 'out' | 'stuck' | 'back' | null;
  step: Step; stepT: number; skipT: number; token: number;
  glass: boolean; booth: number; beam: number; alive: number;
  said: string | null; boothSaid: string | null;
  globs: Glob[]; splats: Splat[];
  tauntT: number;
  /** The operators in the booth: alive, or popped. */
  operators: boolean;
  deathT: number; deathSaid: number; byWeakness: boolean;
  e: Enemy | null;
}
export const makeFight = (state: GameState): Fight => {
  const seen = !!state.stageMemo[INTRO_MEMO];
  return {
    mode: 'wait', t: 0, total: 0, hp: HP, iframes: 0, flash: 0, moveSeen: undefined, ext: 0, ph: null,
    step: 'walk', stepT: 0, skipT: 0, token: 0,
    glass: !seen, booth: seen ? 1 : 0, beam: 0, alive: seen ? 1 : 0, said: null, boothSaid: null,
    globs: [], splats: [], tauntT: 0, operators: true, deathT: 0, deathSaid: 0, byWeakness: false, e: null,
  };
};

// ---------------------------------------------------------------------------------------------------------------
// Her, the enemy (the engine's: for the hits. She's drawn here, not by it)

const QUEEN_KIND = 'm2:sp_queen' as const;
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
const bark = (state: GameState, f: Fight, lines: L.ByPants) => {
  if (f.said || f.boothSaid) return;
  const text = pick(lines[dressed(state)]);
  say(text, voice('m2.space.queen'), 'casual', {
    always: true,
    onShow: spoken => { f.said = text; if (!spoken) setTimeout(() => { if (f.said === text) f.said = null; }, Math.max(1600, text.length * 65)); },
    onHide: () => { if (f.said === text) f.said = null; },
  });
};

// ---------------------------------------------------------------------------------------------------------------
// Starting: the cutscene (or, on a retry, straight in)

export const startFight = (state: GameState, f: Fight) => {
  f.token++;
  if (!f.glass) { begin(state, f); return; }
  f.mode = 'intro'; f.step = 'walk'; f.stepT = 0; f.skipT = 0;
  state.player.inCutscene = true;
};

/** On: out of the cutscene, the enemy into the world. */
const begin = (state: GameState, f: Fight) => {
  f.token++;
  f.mode = 'idle'; f.t = 0; f.glass = false; f.booth = 1; f.beam = 0; f.alive = 1; f.said = null; f.boothSaid = null;
  state.stageMemo[INTRO_MEMO] = '1';
  state.player.inCutscene = false; state.player.kickPose = 0;
  const e = makeKindEnemy(QUEEN_KIND as EnemyKind, QUEEN_X, GY);
  e.facing = -1; e.seen = true;
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
    if (f.glass) shatter(state, f, true);
    p.pos.x = Math.min(p.pos.x, GLASS_X - 160 - p.width / 2); p.vel.x = 0;
    begin(state, f); return hands();
  }
  const t = f.stepT, cx = p.pos.x + p.width / 2;
  switch (f.step) {
    case 'walk':
      // (up to the glass, on his own feet)
      if (cx < GLASS_X - 60 && t < 240) return { ...hands(), right: true } as Controls;
      p.vel.x = 0; p.facing = 1;
      go(f, 'look');
      meatheadSays(state, pick(L.MH_GLASS[dressed(state)]), true, tokened(f, () => go(f, 'kick')));
      break;
    case 'look': p.vel.x = 0; break;
    case 'kick':
      p.vel.x = 0; p.facing = 1;
      if ((p.kickPose || 0) > 0) p.kickPose!--;
      if (t === 6) { p.kickPose = KICK_POSE_FRAMES; playSound('whoosh', 0.7, -4); }
      if (t === 16) { shatter(state, f, false); meatheadSays(state, pick(L.MH_KICK[dressed(state)]), true, tokened(f, () => go(f, 'booth'))); }
      if (t === 18) { playSound('click', 0.4, -6); }
      break;
    case 'booth':
      // (the booth's lights coming up; the real ones at their controls; their say)
      f.booth = Math.min(1, f.booth + 0.04);
      if (t === 1) { playSound('alarm', 0.4, 2); }
      if (t === 30) {
        speak('m2.space.alien', pick(L.BOOTH_TAKEOVER[dressed(state)]), s => { f.boothSaid = s?.text ?? null; }, true, tokened(f, () => go(f, 'beam')));
      }
      break;
    case 'beam':
      // (the dish's rings into her head: she twitches, the green comes on)
      f.beam = Math.min(1, t / 20);
      f.alive = Math.min(1, Math.max(0, (t - 40) / 50));
      if (t % 8 === 0) { playSound('click', 0.5, 6 + (t % 24) / 2); shakeScreen(state, 2, 2); }
      if (t === 2) playSound('alienCharge', 0.8, -6);
      if (t % 12 === 0) for (let i = 0; i < 4; i++) state.particles.push({ pos: queenHead(QUEEN_X, -1, 0), vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 18, color: i % 2 ? '#A3E635' : '#FFFFFF', size: 2 + Math.random() * 2, grav: 0.2 });
      if (t >= 110) { go(f, 'rise'); f.beam = 0; playSound('roar', 1, -6); shakeScreen(state, 14, 8); queenSays(state, f, L.QUEEN_INTRO, tokened(f, () => begin(state, f))); }
      break;
    case 'rise':
      if (t > 1500) begin(state, f);
      break;
  }
  return hands();
};

/** The glass comes in. */
const shatter = (state: GameState, f: Fight, quiet: boolean) => {
  f.glass = false;
  if (quiet) return;
  playSound('glass', 1, -2); playSound('crash', 0.7, 2); shakeScreen(state, 8, 4);
  for (let i = 0; i < 40; i++) state.particles.push({ pos: { x: GLASS_X + Math.random() * 20, y: GY - Math.random() * 320 }, vel: { x: 1 + Math.random() * 6, y: -2 - Math.random() * 4 }, life: 50, color: i % 3 ? 'rgba(186, 230, 253, 0.8)' : '#FFFFFF', size: 2 + Math.random() * 4, grav: 0.35 });
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame

const phase = (f: Fight) => (f.hp > HP / 2 ? 1 : 2);
const to = (f: Fight, m: Mode) => { f.mode = m; f.t = 0; f.ph = m === 'swipe' || m === 'spit' ? 'tell' : null; };
const pmid = (state: GameState) => ({ x: state.player.pos.x + state.player.width / 2, y: state.player.pos.y + state.player.height / 2 });
const canHurt = (state: GameState) => state.player.health > 0 && state.deathTimer <= 0 && state.player.invincibilityTimer <= 0;

export const updateFight = (ctx: FrameContext, f: Fight, controls: Controls): Controls => {
  const { state } = ctx;
  f.total++;
  if (f.mode === 'intro') return intro(ctx, f);
  if (f.mode === 'wait') return controls;
  f.t++;
  if (f.iframes > 0) f.iframes--;
  if (f.flash > 0) f.flash--;
  if (f.mode !== 'dead') takeHits(ctx, f);
  if (f.hp <= 0 && f.mode !== 'dead') die(state, f);
  const ph = phase(f), p = state.player, pm = pmid(state);
  if (f.mode !== 'dead' && ++f.tauntT >= TAUNT_EVERY) { f.tauntT = Math.floor(Math.random() * 200); bark(state, f, L.QUEEN_TAUNT); }
  switch (f.mode) {
    case 'idle':
      f.ext *= 0.9;
      if (f.t >= IDLE_T[ph]) {
        // (him in her reach, or near enough: the swipe, mostly; far off, the spit)
        const far = Math.abs(pm.x - QUEEN_X) > REACH + 100;
        to(f, far || Math.random() < (ph === 2 ? 0.45 : 0.3) ? 'spit' : 'swipe');
        if ((f.mode as Mode) === 'swipe') { playSound('snort', 0.8, -10); if (Math.random() < 0.4) bark(state, f, L.QUEEN_SWIPE); }
        else { playSound('snort', 0.6, -4); if (Math.random() < 0.4) bark(state, f, L.QUEEN_SPIT); }
      }
      break;
    case 'swipe': {
      const want = -Math.max(60, Math.min(REACH, QUEEN_X - pm.x - 40));
      if (f.ph === 'tell') { f.ext *= 0.9; if (f.t >= SWIPE_TELL[ph]) { f.ph = 'out'; f.t = 0; f.ext = 0; playSound('whoosh', 1, -6); } }
      else if (f.ph === 'out') {
        f.ext += (want - f.ext) * 0.4;
        // (her claws: whatever's under them on the way out)
        const cx2 = QUEEN_X + f.ext - 120;
        if (canHurt(state) && Math.abs(pm.x - cx2) < 70 && p.pos.y + p.height > GY - 200) { hurtPlayer(ctx, CLAW_DMG, CLAW, { x: -7, y: -6 }, 14); playSound('punch', 0.9, -2); }
        if (f.t >= SWIPE_OUT) { f.ph = 'stuck'; f.t = 0; playSound('clang', 0.7, -4); shakeScreen(state, 5, 3); }
      } else if (f.ph === 'stuck') {
        if (f.t % 6 === 0) state.particles.push({ pos: { x: QUEEN_X + f.ext * 0.5, y: GY - 70 }, vel: { x: (Math.random() - 0.5) * 4, y: -2 - Math.random() * 2 }, life: 14, color: '#FDE047', size: 2, grav: 0.3 });
        if (f.t >= SWIPE_STUCK - (ph === 2 ? 14 : 0)) { f.ph = 'back'; f.t = 0; playSound('engine', 0.4, 6); }
      } else {
        f.ext *= 0.88;
        if (f.t >= SWIPE_BACK) to(f, 'idle');
      }
      break;
    }
    case 'spit':
      f.ext *= 0.9;
      if (f.ph === 'tell' && f.t >= SPIT_TELL[ph]) {
        f.ph = 'out'; f.t = 0;
        const h = queenHead(QUEEN_X, -1, f.ext), sx = h.x - 50, sy = h.y + 20;
        for (let i = 0; i < SPIT_N[ph]; i++) {
          const T = 38 + i * 7, tx = pm.x + (i - (SPIT_N[ph] - 1) / 2) * 50, ty = pm.y;
          f.globs.push({ x: sx, y: sy, vx: (tx - sx) / T, vy: (ty - sy) / T - 0.5 * 0.35 * T });
        }
        playSound('gush', 0.9, -2); playSound('retch', 0.5, -6);
      }
      if (f.ph === 'out' && f.t >= 50) to(f, 'idle');
      break;
    case 'dead': dying(state, f); break;
  }
  // The globs (lobbed: they splash where they come down, and on him)
  f.globs = f.globs.filter(g => {
    g.x += g.vx; g.y += g.vy; g.vy += 0.35;
    if (canHurt(state) && g.x > p.pos.x - 6 && g.x < p.pos.x + p.width + 6 && g.y > p.pos.y && g.y < p.pos.y + p.height) {
      hurtPlayer(ctx, SPIT_DMG, SPIT, { x: Math.sign(g.vx) * 3, y: -3 }, 10); playSound('splat', 0.7, 2); return false;
    }
    if (g.y >= GY - 2) {
      f.splats.push({ x: g.x, t: state.frame }); if (f.splats.length > 30) f.splats.shift();
      for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: g.x, y: GY - 2 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 18, color: i % 2 ? ALIEN.slime : ALIEN.slimeDark, size: 2 + Math.random() * 2, grav: 0.3 });
      playSound('splat', 0.4, 6); return false;
    }
    return g.x > ARENA_L - 60 && g.x < ARENA_R + 60;
  });
  sync(f);
  return controls;
};

// ---------------------------------------------------------------------------------------------------------------
// Hits (a main boss's rules)

const takeHits = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, e = f.e;
  if (!e) return;
  const bites = takeBites(e);
  const dealt = Math.max(0, BIG - e.health);
  e.health = BIG; e.maxHealth = BIG;
  const melee = e.hitByMove !== f.moveSeen;
  f.moveSeen = e.hitByMove;
  if (dealt <= 0 || !state.enemies.includes(e)) return;
  // (the spawner's litter on her: her weakness, in full, bite by bite, no breather)
  const nib = Math.min(dealt, bites), hit = dealt - nib;
  if (nib > 0) { f.hp -= nib; if (f.hp <= 0) { f.byWeakness = true; return; } }
  if (hit <= 0.5 || f.iframes > 0) return;
  const p = state.player;
  const dmg = melee ? (p.isUppercutting || p.isDivekicking ? BOSS_UPPERCUT_DAMAGE : BOSS_CHARGE_DAMAGE)
    : p.currentWeapon === 'GUN' ? BULLET_DAMAGE : p.currentWeapon === 'SPAWNER' ? hit : Math.max(1, hit * SHARE);
  f.hp -= dmg; f.iframes = IFRAMES; f.flash = 8;
  for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: e.pos.x + e.width / 2, y: e.pos.y + 60 + Math.random() * 100 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 16, color: i % 2 ? '#FDE047' : ALIEN.slime, size: 2 + Math.random() * 2, grav: 0.3 });
  playSound('clang', 0.5, 4);
  ctx.fx.spawnDamageNumber({ x: e.pos.x + 20, y: e.pos.y + 20 }, Math.max(1, Math.round(dmg)), false);
  if (f.hp <= 0) f.byWeakness = aliensOn(e) > 0;
};

/** The enemy, where she is (her body, out on her arm). */
const sync = (f: Fight) => {
  const e = f.e;
  if (!e) return;
  e.pos.x = QUEEN_X + f.ext - e.width / 2 + 10; e.pos.y = GY - 26 - e.height;
  e.vel.x = 0; e.vel.y = 0; e.facing = -1; e.initialY = e.pos.y;
  e.hitCooldown = f.iframes;
  e.pauseTimer = 0; e.frozenTimer = 0; e.isTased = false; e.sludgeTimer = 0; e.returnHome = false;
};

// ---------------------------------------------------------------------------------------------------------------
// Dying

const die = (state: GameState, f: Fight) => {
  f.token++;
  to(f, 'dead'); f.deathT = 0; f.globs = [];
  if (f.e) state.enemies = state.enemies.filter(o => o !== f.e);
  state.damageNumbers = [];
  f.said = null;
  playSound('rayFizzle', 1, -8); playSound('crash', 0.6, -4);
  queenSays(state, f, L.QUEEN_DIES, tokened(f, () => { f.deathSaid = 1; }));
};
const dying = (state: GameState, f: Fight) => {
  const t = ++f.deathT;
  f.ext *= 0.95;
  if (t % 5 === 0 && t < 200) state.particles.push({ pos: queenHead(QUEEN_X, -1, f.ext), vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 3 }, life: 16, color: Math.random() < 0.5 ? '#FDE047' : '#FFFFFF', size: 2 + Math.random() * 2, grav: 0.3 });
  // (the green gush out of her: her hydraulics going)
  if (t > 30 && t < 120 && t % 2 === 0) state.particles.push({ pos: { x: QUEEN_X - 20, y: GY - 180 }, vel: { x: -2 - Math.random() * 4, y: -3 - Math.random() * 3 }, life: 40, color: [ALIEN.slime, ALIEN.slimeDark, ALIEN.slimeLight][t % 3], size: 3 + Math.random() * 3, grav: 0.35 });
  if (t === 30) playSound('gush', 1, -6);
  // (the feedback up the link: the operators' heads go, green on the booth's glass)
  if (t === 90 && f.operators) { f.operators = false; playSound('splat', 1, -2); playSound('boom', 0.5, 6); shakeScreen(state, 6, 3); for (let i = 0; i < 20; i++) state.particles.push({ pos: { x: BOOTH.x + 60 + (i % 2) * 100, y: BOOTH.y + BOOTH.h - 30 }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 3 }, life: 30, color: [ALIEN.slime, ALIEN.slimeDark, ALIEN.gum][i % 3], size: 2 + Math.random() * 3, grav: 0.3 }); }
  if (t === 140) { playSound('thud', 1, -8); shakeScreen(state, 10, 5); }
  if (f.deathSaid === 1 && t > 160) { f.deathSaid = 2; meatheadSays(state, pick(L.MH_WON[dressed(state)]), true, tokened(f, () => { f.deathSaid = 3; })); }
  if (t > 1500) f.deathSaid = 3;
};

export const fightOver = (f: Fight) => f.mode === 'dead' && f.deathSaid >= 3 && f.deathT > 220;
export const endFight = (state: GameState, f: Fight) => { state.player.inCutscene = false; f.globs = []; };
export const introOn = (f: Fight) => f.mode === 'intro';

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const poseOf = (f: Fight): QueenPose => {
  if (f.mode === 'dead') return f.deathT < 140 ? 'stunned' : 'dead';
  if (f.mode === 'intro' || f.mode === 'wait') return f.glass || f.alive <= 0 ? (f.step === 'beam' && f.alive > 0 ? 'wake' : 'dormant') : f.step === 'beam' ? 'wake' : f.step === 'rise' ? 'roar' : 'idle';
  if (f.flash > 0) return 'hurt';
  if (f.mode === 'swipe') return f.ph === 'tell' ? 'tell' : f.ph === 'stuck' ? 'stunned' : 'swipe';
  if (f.mode === 'spit') return f.ph === 'tell' ? 'roar' : 'spit';
  return 'idle';
};

export const drawQueenFight = (c: Ctx, state: GameState, f: Fight) => {
  const blink = f.iframes > 0 && Math.floor(state.frame / 3) % 2 === 0 && f.mode !== 'dead';
  if (blink) c.globalAlpha = 0.65;
  drawQueen(c, QUEEN_X, -1, { pose: poseOf(f), t: state.frame, ext: -f.ext, alive: f.mode === 'dead' ? Math.max(0, 1 - f.deathT / 60) : f.alive, beat: Math.max(0, 1 - f.hp / HP) });
  if (blink) c.globalAlpha = 1;
  // (the splashes where her spit's come down)
  for (const s of f.splats) { const k = Math.max(0, 1 - (state.frame - s.t) / 600); if (k <= 0) continue; c.fillStyle = `rgba(132, 204, 22, ${(0.6 * k).toFixed(2)})`; c.fillRect(Math.round(s.x - 14), GY - 3, 28, 3); }
  for (const g of f.globs) { box(c, g.x - 6, g.y - 6, 12, 12, '#1A0B06'); box(c, g.x - 5, g.y - 5, 10, 10, ALIEN.slime); box(c, g.x - 3, g.y - 4, 4, 3, ALIEN.slimeLight); }
  // (the swipe's tell: her reach marked on the floor, red)
  if (f.mode === 'swipe' && f.ph === 'tell') { const k = f.t % 8 < 4; box(c, QUEEN_X - REACH - 160, GY - 3, REACH + 60, 3, k ? '#EF4444' : '#7F1D1D'); }
};
/** Her words; theirs, up at the booth. */
export const drawQueenSaid = (c: Ctx, f: Fight) => {
  if (f.said) saidOver(c, f.said, QUEEN_X - 60, GY - 330, '#BEF264', 260);
  if (f.boothSaid) saidOver(c, f.boothSaid, BOOTH.x + BOOTH.w / 2, BOOTH.y - 20, '#D9F99D', 260);
};
/** Screen space: her bar, in the top band clear of the HUD. */
export const drawFightHud = (c: Ctx, f: Fight, band: { x1: number; x2: number; mid: number }, inCutscene: boolean) => {
  if (inCutscene || f.mode === 'dead' || f.mode === 'intro' || f.mode === 'wait') return;
  const w = band.x2 - band.x1, k = Math.max(0, f.hp / HP);
  box(c, band.x1, 22, w, 14, '#18181B'); box(c, band.x1 + 2, 24, (w - 4) * k, 10, f.iframes > 0 && Math.floor(f.iframes / 4) % 2 ? '#D9F99D' : '#65A30D');
  label(c, 'THE QUEEN (LEGALLY DISTINCT)', band.mid, 50, '#D9F99D', 7);
};
