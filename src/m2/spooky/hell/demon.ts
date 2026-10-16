// BLOATHAZAR: real hell's sub-boss. Satan's boy: a big fat tanky lump who'd rather be eating souls than fighting
// anybody. Found at his lunch (a soul in his fist like a hot dog); he gets up, grumbling, and has at him.
//
// Slow windups, big hurt if they land, every one of them readable:
//   THRUST  he draws the fork back, its tines glinting: then it shoots out at chest height. Duck it, jump it, or be
//           out of its reach.
//   SLAM    the fork up over his head, the floor glowing where it'll come down (a long way up, too: a ledge in that
//           glow is no help): then down, and it's stuck in the floor a moment (his back to hit).
//   SWEEP   down on his haunches, the fork back and low, its tines dragging sparks: then it sweeps along the floor in
//           front of him. Jump it.
//   JUMP    a squat, his belly wobbling: up and over at him, his shadow where he'll come down. Landing, he QUAKES the
//           room: anyone on their feet anywhere in it is stunned (Ernie's stomp), and close by, hurt; under him,
//           flattened. Be in the air when he lands. He's winded after.
// Hurt enough at a go, he sits down a moment, whining (an opening). Under 40%, his windups shorten (still readable).
// Beaten, he doesn't die: he sits, whines for his dad, and sinks away into the floor (see satan.ts: the rest of it).
//
// One invisible enemy (the engine's hits, shots and moves all land on it as usual), kept where his body is; it carries
// a big pool of health and this keeps his own (what comes out of the pool each frame is his damage), so the engine
// never kills him (he leaves). The arena's far side is a wall of fire till he's beaten; the way in's always open.
// Beaten once (checkpoint DONE_CP on), he's gone for good.

import type { Enemy, Block, Rect, EnemyKind } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { shakeScreen } from '../../../m1/game/core/state';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { registerDeathKind } from '../../../m1/game/player/deathAnim';
import { hazardVictims, boxHits, setHazardZones } from '../../hazardHit';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { say, cutVoice, pickLine } from '../../../m1/game/platform/speech';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { rectsOverlap, boundsOf } from '../../../m1/game/core/utils';
import { getAttackHitbox, recoilOff } from '../../../m1/game/player/player';
import { POWER_CELLS, BOUNCE_FRAMES } from '../../../m1/constants';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { topBand, CANVAS_WIDTH } from '../../../m1/constants';
import { solid, box, label, saidOver, meatheadSays, voice, type Said } from '../section';
import { GY } from '../geometry';
import { ARENA_IN, ARENA_OUT, DEMON_HOME } from './layout';
import { hazeBands } from '../../../m1/game/render/pixelArt';
import { INK, checker, mix, LAVA, blob, thick, inked, flashed } from './paint';
import { hellOf } from './state';
import { HELL_KINDS } from './kinds';
import {
  DEMON_NAME, MH_TRIP_HINT, DEMON_INTRO, DEMON_CHATTER, DEMON_HIT, DEMON_HURT, MH_DEMON, HURT_FORK, DEATH_FORK, HURT_QUAKE, DEATH_QUAKE,
  HURT_BELLY, DEATH_BELLY, HURT_BOUNCE_FIRE, DEATH_BOUNCE_FIRE, HURT_AIRBODY, DEATH_AIRBODY, type Dressed, type ByPants,
} from './lines';
import { since } from '../../frames';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;

export const DEMON_KIND = 'm2:demon';
const FORK = 'm2:demon_fork', QUAKE = 'm2:demon_quake', BELLY = 'm2:demon_belly';
/** Beaten, and past him: this checkpoint on, he's gone for good. */
export const DONE_CP = 53;

// The numbers
const HP = 2400, POOL = 100000, W = 120, H = 150, MASS = 2400;
/** How hard his moves bounce off him (a firm shove back, not a launch). */
const RECOIL_MASS = 450;
/** A shoulder charge into him: thrown back this hard (and up), locked out of it this long. */
const CHARGE_BOUNCE = { x: 46, y: -8, lock: 44 };
/** A stomp on all that gut: he's thrown way up (chains of them stay his: never capped). */
const STOMP_LAUNCH = 21;
/** The fire walls' height (up out of frame) and the arena's roof (out of frame, over the highest stomp launch). */
const WALL_H = 4000, ROOF_H = 760;
/** Tripped by a slide: down this long (free hits), then this long before a slide can trip him again (he hops it). */
const TRIP_FRAMES = 80, TRIP_COOLDOWN = 300;
/** On his back, tripped: everything hurts him this much more (the window's the payoff). */
const TRIP_MULT = 2.5;
/** Meathead's hints about the legs: the first this far into the fight, then every so often (frames); none once he's
 *  tripped him (ever: this visit, any go at him). */
const HINT_FIRST = 900, HINT_EVERY = 1200;
let trippedEver = false, hintN = 0, hintAt = -1e9, fightT = 0;
/** Bumping into him while he's up in the air on a jump (anything but a stomp on top). */
const AIR_BODY_DMG = 16;
const AIRBODY = 'm2:demon_airbody';
/** The fire walls (the way in's, the far one's), and how far over he can get between them. */
const BACK_X = ARENA_IN + 20, WALL_W = 30, D_MIN = BACK_X + WALL_W + 62, D_MAX = ARENA_OUT - 62;
const THRUST_DMG = 26, SLAM_DMG = 26, SWEEP_DMG = 22, QUAKE_DMG = 10, BELLY_DMG = 28, BUMP_DMG = 10;
/** Windups (frames; shortened under 40%). */
const THRUST_WIND = 52, SLAM_WIND = 62, SWEEP_WIND = 48, CROUCH = 38;
/** Hurt this much in a short while, and he sits down. */
const STAGGER_AT = 520, STAGGER_FRAMES = 80;
/** What his blubber lets through of a shot (or anything else that isn't one of his moves): it's going in close that
 *  gets him. */
const SHOT_SHARE = 0.55;
const GRAV = 0.6;
/** Reach: the thrust's tines, the slam's zone (from his middle), the sweep's. */
const THRUST_REACH = 235, SLAM_NEAR = 95, SLAM_FAR = 245, SWEEP_REACH = 265;
/** His moves on him (his own say, not the engine's: see demonTouch). A charge is the bread and butter (it always lands,
 *  again and again); an uppercut's the big one (two power cells' worth); a stomp's good, and it gives the power back,
 *  and a chain of them is fair game (never capped: the game's own). */
const MELEE = { charge: 34, slide: 22, uppercut: 110, divekick: 60 };
const SWAT_WIND = 16, SWAT_DMG = 20;
/** Touching a fire wall (the engine's own fire hurt: its lines, the burnt death). */
const FIRE_WALL_DMG = 12;
const FIRE_BOUNCE = 'm2:demon_bounce_fire';

type St = 'lounge' | 'rise' | 'walk' | 'thrustWind' | 'thrust' | 'slamWind' | 'slam' | 'stuck' | 'sweepWind' | 'sweep'
  | 'crouch' | 'air' | 'land' | 'stagger' | 'swatWind' | 'swat' | 'tripped' | 'hop' | 'beaten' | 'sink';

export interface Demon {
  fight: 'wait' | 'on' | 'beaten' | 'gone';
  x: number; y: number; vx: number; vy: number; facing: 1 | -1;
  st: St; t: number; cd: number;
  hp: number; flash: number; hurtSince: number; hurtAt: number;
  e: Enemy | null; lock: Block | null;
  /** The fire wall over the way in: up once he's roused (no backing out), down when he's beaten. */
  back: Block | null;
  /** The arena's roof (out of frame, solid), with the walls: boxed in. */
  roof: Block | null;
  /** Tripped by a slide: not again till this frame (he hops his little legs out of the way). */
  tripOk: number;
  /** When a charge last bounced him off (into the fire behind him: its own hurt lines). */
  bouncedAt: number;
  /** The slam's spot (its middle), the jump's landing; whether this strike's landed yet. */
  slamX: number; jumpTo: number; hit: boolean;
  said: Said | null; talkAt: number; used: string[];
  /** Beaten: the fork left stuck in the floor where he dropped it; how far he's sunk away. */
  forkAt: number | null; sink: number;
  /** Stomped on the head this many times running (and when last): twice, and he swats up over his head. */
  stomps: number; stompAt: number;
}
export const demonOf = (state: GameState) => hellOf(state).demon;

const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
const fresh = (d: Demon, pool: readonly string[]) => {
  let left = pool.filter(l => !d.used.includes(l));
  if (!left.length) { d.used = d.used.filter(l => !pool.includes(l)); left = [...pool]; }
  return pick(left);
};
/** He says something (`wait`: in turn; otherwise only if nobody's talking). Whether it'll be said. */
export const demonSays = (state: GameState, d: Demon, pool: ByPants | readonly string[], wait: boolean, onDone?: () => void) => {
  const lines = Array.isArray(pool) ? pool as readonly string[] : (pool as ByPants)[dressed(state)];
  const text = fresh(d, lines), s: Said = { text };
  let done = false;
  const end = () => { if (d.said === s) d.said = null; if (!done) { done = true; onDone?.(); } };
  const ok = say(text, voice('m2.demon'), wait ? 'queue' : 'casual', {
    always: true,
    onShow: spoken => { d.said = s; if (!spoken) setTimeout(end, Math.max(1800, text.length * 70)); },
    onHide: end, onDropped: end,
  });
  if (ok) d.used.push(text);
  else if (onDone) { d.said = s; setTimeout(end, Math.max(1800, text.length * 70)); }
  return ok;
};

// ---------------------------------------------------------------------------------------------------------------

export const buildDemon = (state: GameState) => {
  const h = hellOf(state);
  if (state.checkpoint >= DONE_CP) { h.demon = gone(); return; }
  const d: Demon = {
    fight: 'wait', x: DEMON_HOME, y: GY, vx: 0, vy: 0, facing: -1, st: 'lounge', t: 0, cd: 60,
    hp: HP, flash: 0, hurtSince: 0, hurtAt: -999, e: null, lock: null, back: null, roof: null, tripOk: 0, bouncedAt: -999, slamX: 0, jumpTo: 0, hit: false,
    said: null, talkAt: 0, used: [], forkAt: null, sink: 0, stomps: 0, stompAt: -999,
  };
  d.lock = solid(state, ARENA_OUT, GY - WALL_H, 30, WALL_H, { hidden: true, tag: 'hell-lock' });
  const e = makeKindEnemy(DEMON_KIND as EnemyKind, d.x, GY);
  e.health = e.maxHealth = POOL; e.harmless = true; e.unshakeable = true; e.noCrowd = true; e.seen = true; e.pos.y = -100000;
  d.e = e; state.enemies.push(e);
  h.demon = d;
};
const gone = (): Demon => ({
  fight: 'gone', x: DEMON_HOME, y: GY, vx: 0, vy: 0, facing: -1, st: 'sink', t: 0, cd: 0, hp: 0, flash: 0, hurtSince: 0, hurtAt: 0,
  e: null, lock: null, back: null, roof: null, tripOk: 0, bouncedAt: -999, slamX: 0, jumpTo: 0, hit: false, said: null, talkAt: 0, used: [], forkAt: DEMON_HOME - 90, sink: 1, stomps: 0, stompAt: 0,
});

const place = (d: Demon) => {
  const e = d.e;
  if (!e) return;
  if (d.fight !== 'on') { e.pos.y = -100000; return; }
  e.pos.x = d.x - W / 2; e.pos.y = d.y - H; e.width = W; e.height = H; e.facing = d.facing; e.vel.x = 0; e.vel.y = 0;
};
const shrugOff = (e: Enemy) => {
  e.frozenTimer = 0; e.isTased = false; e.pauseTimer = 0; e.sludgeTimer = 0; e.isOiled = false; e.isOnFire = false;
  e.fireTimer = 0; e.needleCount = 0; e.shockedUntil = undefined; e.runFrom = undefined; e.puppet = false;
  e.pose = undefined; e.frozeAt = undefined; e.returnHome = false; e.vel.x = 0; e.vel.y = 0;
};

const hurtbox = (state: GameState): Rect => {
  const p = state.player;
  return p.isDucking ? { x: p.pos.x + 2, y: p.pos.y + (p.height - 26), w: p.width - 4, h: 26 } : boundsOf(p);
};
/** A box in front of him: from `a` to `b` out from his middle (the way he faces), `top` to `bot` up from his feet. */
const ahead = (d: Demon, a: number, b: number, top: number, bot: number): Rect => {
  const x1 = d.x + d.facing * a, x2 = d.x + d.facing * b;
  return { x: Math.min(x1, x2), y: d.y - top, w: Math.abs(x2 - x1), h: top - bot };
};

/** He's got him: hurt, thrown, and something to say about it (once he's done yelling). */
const strike = (ctx: FrameContext, d: Demon, dmg: number, source: string, kx: number, ky: number) => {
  const p = ctx.state.player;
  if (d.hit || p.invincibilityTimer > 0 || p.health <= 0) return;
  d.hit = true;
  hurtPlayer(ctx, dmg, source, { x: kx, y: ky });
  playSound('crunch', 1, -6); shakeScreen(ctx.state, 10, 5);
  if (p.health > 0 && Math.random() < 0.45) demonSays(ctx.state, d, DEMON_HIT, true);
};

/** A spurt of him (he bleeds, black-red, hot) where a hit's gone in. */
const spurt = (state: GameState, x: number, y: number, n: number, dir: number) => {
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x, y }, vel: { x: dir * (1 + Math.random() * 5) + (Math.random() - 0.5) * 3, y: -2 - Math.random() * 5 }, life: 24 + Math.random() * 16, color: i % 3 ? '#7F1D1D' : '#F97316', size: 2 + Math.random() * 4, grav: 0.35 });
};

/** His moves landing on him (the engine asks first: KindDef's `touch`); his body's own bumps are think()'s. */
const demonTouch = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx, p = state.player;
  const d = demonOf(state);
  if (!d || d.fight !== 'on' || d.e !== e) return true;
  if (!(p.isCharging || p.isUppercutting || p.isDivekicking) || p.health <= 0) return true;
  if (p.isUppercutting && p.uppercutHitIds.includes(e.id)) return true;
  if (p.isDivekicking && p.diveKickHitIds.includes(e.id)) return true;
  // (a sub-boss has no breather: only the same move can't land twice)
  if (e.hitByMove === p.moveId) return true;
  if (!rectsOverlap(getAttackHitbox(ctx), boundsOf(e))) return true;
  const up = !!p.isUppercutting, dk = !!p.isDivekicking, slide = !up && !dk && !!p.isSliding;
  const dmg = up ? MELEE.uppercut : dk ? MELEE.divekick : slide ? MELEE.slide : MELEE.charge;
  e.hitByMove = p.moveId; e.hitCooldown = 0;
  if (up) p.uppercutHitIds.push(e.id);
  if (dk) p.diveKickHitIds.push(e.id);
  const pc = p.pos.x + p.width / 2, dir = Math.sign(d.x - pc) || 1;
  const at = { x: d.x - dir * W * 0.4, y: dk ? d.y - H + 10 : up ? d.y - H * 0.6 : d.y - H * 0.45 };
  const onBack = d.st === 'tripped';
  hurt(ctx, d, dmg);
  ctx.fx.spawnDamageNumber({ x: at.x - 10, y: at.y - 20 }, onBack ? Math.round(dmg * TRIP_MULT) : dmg, up || dk || onBack);
  ctx.fx.playGunSound(dk ? 'stomp' : 'punch');
  spurt(state, at.x, at.y, up ? 16 : 8, -dir);
  if (d.fight !== 'on') return true;
  if (up) { shakeScreen(state, 10, 6); ctx.fx.spawnExplosion(at, '#FFD700', 15, 0, 12); playSound('crunch', 0.8, -6); }
  if (dk) {
    // (the stomp: the bounce and the power back, as off anything; chains of them are his to keep: no swatting him off
    // (stomp chains refunding power are the game's own, never capped))
    p.power = Math.min(POWER_CELLS, p.power + 1);
    ctx.fx.playGunSound('boing', 0.6);
    p.vel.y = -STOMP_LAUNCH; p.vel.x *= 0.5; p.isGrounded = false;
    p.lockTimer = BOUNCE_FRAMES; p.recoiling = true;
    playSound('boing', 1, -8);
    d.stomps = state.frame - d.stompAt < 100 ? d.stomps + 1 : 1; d.stompAt = state.frame;
  } else if (!slide) {
    // (a shoulder charge (or an uppercut) into all that gut: it goes in, and it throws him back hard, a long way, off his feet: in this
    // room, likely into the fire behind him)
    recoilOff(ctx, RECOIL_MASS);
    // (a pushback, not a recoil: the recoil's drag would have him stop short)
    p.recoiling = false; p.isHarmlessPushback = true;
    p.vel.x = -dir * CHARGE_BOUNCE.x; p.vel.y = CHARGE_BOUNCE.y; p.isGrounded = false;
    p.pushbackTimer = Math.max(p.pushbackTimer, CHARGE_BOUNCE.lock); p.lockTimer = Math.max(p.lockTimer, CHARGE_BOUNCE.lock);
    d.bouncedAt = state.frame;
    playSound('boing', 0.9, -10); playSound('thud', 0.8, -6); shakeScreen(state, 8, 4);
    ctx.fx.spawnDamageNumber({ x: pc - 30, y: p.pos.y - 30 }, 'BOING!', true, '#FDE68A');
  } else {
    recoilOff(ctx, RECOIL_MASS);
    // (a slide into his tiny legs: over he goes, a moment's free hits; then he's wise to it a while, and hops it)
    if (state.frame >= d.tripOk && d.st !== 'air' && d.st !== 'tripped' && d.st !== 'hop') {
      d.st = 'tripped'; d.t = 0; d.vx = 0; d.tripOk = state.frame + TRIP_FRAMES + TRIP_COOLDOWN; trippedEver = true;
      playSound('thud', 1, -10); playSound('bellow', 0.9, -6); shakeScreen(state, 10, 5);
      ctx.fx.spawnDamageNumber({ x: d.x - 30, y: d.y - H - 20 }, 'TRIPPED!', true, '#FDE047');
    } else if (d.st === 'walk' || d.st === 'land' || d.st === 'stuck') {
      // (wise to it: he hops his little legs up out of the way)
      d.st = 'hop'; d.t = 0; d.vx = 0; d.vy = -8; playSound('snort', 0.8, -4);
    }
  }
  return true;
};

/** Damage into him: his health, the flash, the stagger (enough at a go and he sits down), beaten. */
const hurt = (ctx: FrameContext, d: Demon, dmg: number) => {
  const { state } = ctx, f = state.frame;
  if (d.st === 'tripped') dmg *= TRIP_MULT;
  d.hp -= dmg; d.flash = 6;
  if (f - d.hurtAt > 240) d.hurtSince = 0;
  d.hurtSince += dmg; d.hurtAt = f;
  if (d.hp <= 0) { beaten(ctx, d); return; }
  if (d.hurtSince >= STAGGER_AT && d.st !== 'air' && d.st !== 'crouch' && d.st !== 'stagger' && d.st !== 'rise' && d.st !== 'swat' && d.st !== 'tripped' && d.st !== 'hop') {
    d.st = 'stagger'; d.t = 0; d.vx = 0; d.hurtSince = 0;
    playSound('bellow', 0.8, -8); shakeScreen(state, 8, 4);
    demonSays(state, d, DEMON_HURT, false);
  }
};

/** The fire wall over the way in (between the arch's posts), and the far one. */
const startFight = (state: GameState, d: Demon) => {
  d.fight = 'on'; d.st = 'rise'; d.t = 0;
  // (the way in goes up in fire behind him: no backing out now)
  d.back = solid(state, BACK_X, GY - WALL_H, WALL_W, WALL_H, { hidden: true, tag: 'hell-lock' });
  // (and the roof over it all, out of frame: however high a stomp off his gut throws him, he's boxed in)
  d.roof = solid(state, BACK_X, GY - ROOF_H - 30, ARENA_OUT + 30 - BACK_X, 30, { hidden: true, tag: 'hell-lock' });
  const p = state.player;
  if (p.pos.x < BACK_X + WALL_W + 2) p.pos.x = BACK_X + WALL_W + 2;
  playSound('flame', 1, -6); playSound('ignite', 0.9, -4); shakeScreen(state, 8, 4);
  for (let i = 0; i < 24; i++) state.particles.push({ pos: { x: BACK_X + Math.random() * WALL_W, y: GY - Math.random() * 40 }, vel: { x: (Math.random() - 0.5) * 3, y: -3 - Math.random() * 6 }, life: 30, color: i % 2 ? '#F97316' : '#FDE047', size: 3 + Math.random() * 4 });
  meatheadSays(state, pick(MH_DEMON), true);
  demonSays(state, d, DEMON_INTRO, true);
  d.talkAt = state.frame + 900;
};

/** The pit taking hold as the walls go up: any of hell's wildlife that followed him in (between the walls) goes off
 *  like a balloon full of meat on the spot; anything caught across a wall is put out the far side of it. */
const WILD = new Set<string>(Object.values(HELL_KINDS));
const purgeArena = (ctx: FrameContext, d: Demon) => {
  const { state, fx } = ctx, L = BACK_X + WALL_W, R = ARENA_OUT;
  let popped = 0;
  for (const e of [...state.enemies]) {
    if (e === d.e || e.health <= 0 || e.isBlownAway || e.type === 'boss' || !WILD.has(e.kind ?? '')) continue;
    const a = e.pos.x, b = e.pos.x + e.width, m = (a + b) / 2;
    if (m > L && m < R) {
      const at = { x: m, y: e.pos.y + e.height / 2 };
      e.health = 0;
      state.enemies = state.enemies.filter(o => o !== e);
      fx.spawnDeathShower(at, 0, 2.2);
      fx.spawnExplosion(at, '#F97316', 10, 0, 30); fx.spawnExplosion(at, '#FDE047', 6, 0, 24);
      fx.spawnDamageNumber({ x: at.x - 20, y: at.y - 30 }, 'POP!', true, '#FCA5A5');
      popped++;
    } else if (b > BACK_X - 14 && a < L + 14) e.pos.x = m < BACK_X + WALL_W / 2 ? BACK_X - 16 - e.width : L + 16;
    else if (b > R - 14 && a < R + 30 + 14) e.pos.x = R + 30 + 16;
  }
  if (popped) { playSound('splat', 1, -4); playSound('boom', 0.8, -6); shakeScreen(state, 10, 5); }
};

/** While the pit's shut (the walls up): the camera's held between them (its left edge on the way in's wall, its right
 *  on the far one: the outsides never on screen). Null when it's open. */
export const demonCamLock = (state: GameState) => {
  const d = demonOf(state);
  if (!d || d.fight !== 'on') return null;
  const min = BACK_X + WALL_W / 2, max = ARENA_OUT + 15 - CANVAS_WIDTH;
  return max >= min ? { min, max } : { min: (min + max) / 2, max: (min + max) / 2 };
};

/** Beaten (satan.ts takes it from here): he plops down, the fork dropped, stuck in the floor; the fire wall's out. */
const beaten = (ctx: FrameContext, d: Demon) => {
  d.fight = 'beaten'; d.st = 'beaten'; d.t = 0; d.vx = 0; d.hp = 0; d.flash = 0;
  // (from the killing blow on, his: nothing gets a hit in on him before the scene's started (it holds everybody off then),
  // however the blow landed (in his own update, or the engine's, later in the frame than the hold-off))
  { const p = ctx.state.player; p.inCutscene = true; p.invincibilityTimer = Math.max(p.invincibilityTimer, 30); }
  d.forkAt = d.x + d.facing * 80;
  if (d.e) { const i = ctx.state.enemies.indexOf(d.e); if (i >= 0) ctx.state.enemies.splice(i, 1); d.e = null; }
  if (d.lock) d.lock.x = -1e7;
  if (d.back) d.back.x = -1e7;
  if (d.roof) d.roof.x = -1e7;
  cutVoice('m2.demon'); d.said = null;
  ctx.state.checkpoint = Math.max(ctx.state.checkpoint, DONE_CP);
  playSound('thud', 1, -10); shakeScreen(ctx.state, 14, 6);
  ctx.fx.spawnDamageNumber({ x: d.x - 40, y: d.y - H - 30 }, 'HE QUITS!', true, '#FDE047');
};

const quake = (ctx: FrameContext, d: Demon) => {
  const { state } = ctx, p = state.player;
  playSound('rumble', 0.9, -7); playSound('thud', 1, -9); playSound('slam', 0.9, -4);
  shakeScreen(state, 18, 8);
  // (Ernie's stomp: on his feet anywhere in the room, he's stunned)
  state.ernieVibrationTimer = 16;
  for (const dir of [-1, 1]) {
    for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: d.x + dir * (30 + i * 4), y: GY - 4 - Math.random() * 6 }, vel: { x: dir * (6 + Math.random() * 3), y: -0.4 - Math.random() }, life: 34, color: i % 3 ? 'rgba(120, 53, 15, 0.7)' : 'rgba(168, 162, 158, 0.6)', size: 7 + Math.random() * 8 });
    for (let i = 0; i < 5; i++) state.particles.push({ pos: { x: d.x, y: GY - 2 }, vel: { x: dir * (9 + i * 1.5), y: 0 }, life: 18 + i * 2, color: '#FB923C', size: 3 });
  }
  for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: ARENA_IN + Math.random() * (ARENA_OUT - ARENA_IN), y: state.camera.y + Math.random() * 20 }, vel: { x: 0, y: 2 + Math.random() * 3 }, life: 80, color: '#57534E', size: 2 + Math.random() * 3 });
  const hb = hurtbox(state), body = { x: d.x - W / 2, y: d.y - H, w: W, h: H };
  if (p.health <= 0 || p.invincibilityTimer > 0) return;
  if (rectsOverlap(hb, body)) { d.hit = false; strike(ctx, d, BELLY_DMG, BELLY, (Math.sign(p.pos.x + p.width / 2 - d.x) || 1) * 12, -8); return; }
  if (p.isGrounded && Math.abs(p.pos.x + p.width / 2 - d.x) < 300) hurtPlayer(ctx, QUAKE_DMG, QUAKE);
};

// ---------------------------------------------------------------------------------------------------------------

export const updateDemon = (ctx: FrameContext) => {
  const { state } = ctx;
  const d = demonOf(state);
  if (!d || d.fight === 'gone') return;
  // (started past him: gone; see buildDemon)
  if (d.fight === 'wait' && state.checkpoint >= DONE_CP) {
    // (and what was built for him with it: the far fire wall out of the way, his body out of the world)
    if (d.lock) d.lock.x = -1e7;
    if (d.back) d.back.x = -1e7;
    if (d.roof) d.roof.x = -1e7;
    if (d.e) { const de = d.e; state.enemies = state.enemies.filter(o => o !== de); }
    Object.assign(d, gone()); return;
  }
  const p = state.player, f = state.frame;
  if (d.flash > 0) d.flash--;
  // What's come out of his pool since last frame
  const e = d.e;
  if (e) {
    const killed = e.health <= 0 || !!e.isBlownAway || !state.enemies.includes(e);
    const lost = killed ? 60 : POOL - e.health;
    e.health = POOL; shrugOff(e);
    if (killed) { e.isBlownAway = false; e.meleeFlung = false; e.uppercutFlung = false; e.rotation = 0; if (!state.enemies.includes(e)) state.enemies.push(e); }
    if (d.fight === 'on' && lost > 0.01) {
      // (the numbers that went up over him: what really got through)
      for (const n of state.damageNumbers) {
        if (n.value === undefined || n.life < n.maxLife - 2 || Math.abs(n.pos.x - e.pos.x) > W || Math.abs(n.pos.y - e.pos.y) > H) continue;
        n.value = Math.max(1, Math.round(n.value * SHOT_SHARE));
      }
      hurt(ctx, d, lost * SHOT_SHARE);
      if (d.fight === 'on') spurt(state, d.x - d.facing * 10 + (Math.random() - 0.5) * W * 0.6, d.y - H * (0.3 + Math.random() * 0.4), 3, -d.facing);
    }
    if (d.fight !== 'on' && d.fight !== 'wait') return;
  }
  if (d.fight === 'beaten') { d.t++; return; }
  // (a while at him and the legs never taken out: Meathead thinks out loud about them, plainer each time)
  if (d.fight === 'on') {
    fightT++;
    if (!trippedEver && fightT > HINT_FIRST && since(f, hintAt) > HINT_EVERY && p.health > 0) {
      hintAt = f;
      meatheadSays(state, MH_TRIP_HINT[Math.min(hintN++, MH_TRIP_HINT.length - 1)], false);
    }
  } else fightT = 0;
  if (d.fight === 'wait') {
    d.t++;
    // (at his lunch: a bite every so often)
    if (d.t % 140 === 60 && Math.abs(d.x - p.pos.x) < 900) playSound('crunch', 0.5, -10);
    if (p.health > 0 && p.pos.x + p.width / 2 > ARENA_IN + 150 && p.pos.x < ARENA_OUT) { startFight(state, d); purgeArena(ctx, d); }
    place(d);
    return;
  }
  // (the fire walls: touch one and it burns; anybody else too, and they keep back from them)
  const walls = [d.back, d.lock].filter(w => w && w.x > -1e6) as { x: number; w: number }[];
  setHazardZones(state, 'hell-firewalls', walls.map(w => ({ x0: w.x - 12, x1: w.x + w.w + 12, y0: GY - 300, y1: GY })));
  for (const w of walls) for (const e of hazardVictims(state, { not: o => o === d.e })) if (boxHits(e, w.x - 12, GY - 300, w.w + 24, 300)) {
    ctx.fx.killWithAnimation(e, 'charred', 'flamethrower_kill', 'cooked');
    ctx.fx.spawnDamageNumber({ x: e.pos.x, y: e.pos.y - 30 }, 'TORCHED!', true, '#FDBA74');
    playSound('ignite', 0.8, -4);
  }
  for (const w of [d.back, d.lock]) {
    if (!w || w.x < -1e6 || p.health <= 0 || p.invincibilityTimer > 0) continue;
    const hb = hurtbox(state);
    if (rectsOverlap(hb, { x: w.x - 12, y: GY - WALL_H, w: w.w + 24, h: WALL_H })) {
      const away = p.pos.x + p.width / 2 < w.x + w.w / 2 ? -1 : 1;
      // (back out of it, off his feet, so he's not left standing in it)
      hurtPlayer(ctx, FIRE_WALL_DMG, state.frame - d.bouncedAt < 90 ? FIRE_BOUNCE : 'fire', { x: away * 9, y: -8 });
    }
  }
  think(ctx, d);
  // (grumbling, now and then)
  if (f > d.talkAt && p.health > 0) d.talkAt = f + (demonSays(state, d, DEMON_CHATTER, false) ? 900 + Math.random() * 400 : 90);
  place(d);
};

const think = (ctx: FrameContext, d: Demon) => {
  const { state } = ctx, p = state.player;
  d.t++;
  if (d.cd > 0) d.cd--;
  const pc = p.pos.x + p.width / 2, pFeet = p.pos.y + p.height;
  const dx = pc - d.x, adx = Math.abs(dx), toward = (dx < 0 ? -1 : 1) as 1 | -1;
  const mad = d.hp < HP * 0.4 ? 0.75 : 1;
  const hb = hurtbox(state);
  const alive = p.health > 0;
  switch (d.st) {
    case 'rise':
      d.vx = 0; d.facing = toward;
      if (d.t === 30) playSound('bellow', 0.7, -10);
      if (d.t > 100) { d.st = 'walk'; d.t = 0; d.cd = 30; }
      break;
    case 'walk':
    default: {
      d.st = 'walk';
      if (d.t > 10) d.facing = toward;
      // (he's backed out of the pit: not worth getting up for. Back to his spot; but shoot him from out there and he
      // comes down on the gate)
      if (pc < ARENA_IN - 10) {
        const home = DEMON_HOME - d.x;
        d.vx = Math.abs(home) > 20 ? Math.sign(home) * 0.9 : 0;
        if (d.cd <= 0 && state.frame - d.hurtAt < 4) { d.st = 'crouch'; d.t = 0; d.vx = 0; d.jumpTo = D_MIN; }
        break;
      }
      d.vx = adx > 150 ? toward * 1.1 : 0;
      if (d.cd > 0 || !alive) break;
      const level = pFeet > GY - 40;
      // (far off, or up on a ledge: over at him, and the quake; or he plods on over a while)
      if (adx > 300 || (!level && adx > 140 && Math.random() < 0.02)) {
        if (Math.random() < 0.6 || !level) { d.st = 'crouch'; d.t = 0; d.vx = 0; d.jumpTo = Math.max(D_MIN, Math.min(D_MAX, pc)); break; }
        d.cd = 70; break;
      }
      if (adx < 260) {
        const r = Math.random();
        // (backed up against a fire wall, there's nowhere to step off the slam: he goes for something that can still be
        // dodged where he's standing (duck the thrust, jump the sweep), or jumps at him)
        const wallBehind = toward > 0 ? ARENA_OUT - pc : pc - (BACK_X + WALL_W);
        const cornered = wallBehind < 250;
        if (cornered && !level) { d.st = 'crouch'; d.t = 0; d.vx = 0; d.jumpTo = Math.max(D_MIN, Math.min(D_MAX, pc)); break; }
        if (cornered) {
          if (r < 0.5 && adx > 80) { d.st = 'thrustWind'; d.t = 0; d.vx = 0; playSound('snort', 0.8, -10); }
          else { d.st = 'sweepWind'; d.t = 0; d.vx = 0; playSound('grind', 0.6, -2); }
          break;
        }
        if (!level) { d.st = 'slamWind'; d.t = 0; d.vx = 0; d.slamX = d.x + d.facing * (SLAM_NEAR + SLAM_FAR) / 2; playSound('grind', 0.5, -6); }
        else if (r < 0.38 && adx > 80) { d.st = 'thrustWind'; d.t = 0; d.vx = 0; playSound('snort', 0.8, -10); }
        else if (r < 0.7 && adx > 70) { d.st = 'slamWind'; d.t = 0; d.vx = 0; d.slamX = d.x + d.facing * (SLAM_NEAR + SLAM_FAR) / 2; playSound('grind', 0.5, -6); }
        else { d.st = 'sweepWind'; d.t = 0; d.vx = 0; playSound('grind', 0.6, -2); }
      }
      break;
    }
    case 'thrustWind':
      d.vx = 0;
      if (d.t === 1) d.facing = toward;
      if (d.t % 12 === 0) playSound('clink', 0.5, 10);
      if (d.t > THRUST_WIND * mad) { d.st = 'thrust'; d.t = 0; d.hit = false; playSound('whoosh', 1, -6); }
      break;
    case 'thrust':
      d.vx = d.t < 8 ? d.facing * 2.5 : 0;
      if (d.t >= 3 && d.t <= 14 && rectsOverlap(hb, ahead(d, 40, 40 + (THRUST_REACH - 40) * Math.min(1, d.t / 5), 74, 42))) strike(ctx, d, THRUST_DMG, FORK, d.facing * 11, -6);
      if (d.t > 50) { d.st = 'walk'; d.t = 0; d.cd = 50 + Math.random() * 40; }
      break;
    case 'slamWind':
      d.vx = 0;
      if (d.t > SLAM_WIND * mad) { d.st = 'slam'; d.t = 0; d.hit = false; playSound('whoosh', 1, -10); }
      break;
    case 'slam':
      if (d.t === 6) {
        playSound('slam', 1, -6); playSound('crunch', 0.8, -8); shakeScreen(state, 14, 6);
        for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: d.slamX + (Math.random() - 0.5) * 60, y: GY - 4 }, vel: { x: (Math.random() - 0.5) * 8, y: -2 - Math.random() * 5 }, life: 30, color: i % 2 ? '#78350F' : '#FB923C', size: 3 + Math.random() * 4, grav: 0.3 });
      }
      if (d.t >= 4 && d.t <= 9 && rectsOverlap(hb, ahead(d, SLAM_NEAR, SLAM_FAR, 230, 0))) strike(ctx, d, SLAM_DMG, FORK, d.facing * 8, -11);
      if (d.t > 10) { d.st = 'stuck'; d.t = 0; }
      break;
    case 'stuck':
      // (the fork stuck in the floor: tugging at it, his back to him)
      if (d.t % 16 === 0) playSound('grind', 0.4, -4);
      if (d.t > 58 * (mad < 1 ? 0.8 : 1)) { d.st = 'walk'; d.t = 0; d.cd = 30 + Math.random() * 30; playSound('crunch', 0.6, 4); }
      break;
    case 'sweepWind':
      d.vx = 0;
      if (d.t === 1) d.facing = toward;
      if (d.t % 5 === 0) state.particles.push({ pos: { x: d.x - d.facing * 70, y: GY - 4 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 14, color: '#FDE047', size: 2 });
      if (d.t > SWEEP_WIND * mad) { d.st = 'sweep'; d.t = 0; d.hit = false; playSound('whoosh', 1, -2); }
      break;
    case 'sweep':
      if (d.t >= 3 && d.t <= 12 && rectsOverlap(hb, ahead(d, -30, SWEEP_REACH, 26, 0))) strike(ctx, d, SWEEP_DMG, FORK, d.facing * 9, -10);
      if (d.t % 2 === 0 && d.t < 14) state.particles.push({ pos: { x: d.x + d.facing * (d.t * 20), y: GY - 6 }, vel: { x: d.facing * 2, y: -1.5 }, life: 16, color: '#FDE047', size: 3 });
      if (d.t > 40) { d.st = 'walk'; d.t = 0; d.cd = 40 + Math.random() * 40; }
      break;
    case 'crouch':
      d.vx = 0;
      if (d.t === 2) playSound('snort', 1, -12);
      if (d.t > CROUCH * mad) {
        d.st = 'air'; d.t = 0;
        const T = 2 * 16 / GRAV;
        d.vy = -16; d.vx = (d.jumpTo - d.x) / T; d.facing = (d.vx < 0 ? -1 : 1) as 1 | -1;
        playSound('whoosh', 1, -12); playSound('jump', 0.8, -12);
      }
      break;
    case 'air':
      // (up in the air, all that gut coming at him: touch it and it hurts (a stomp on top excepted: that lands))
      if (alive && p.invincibilityTimer <= 0 && !p.isDivekicking && state.frame - d.stompAt > 12
        && rectsOverlap(hb, { x: d.x - W / 2 + 6, y: d.y - H + 10, w: W - 12, h: H - 10 })) {
        hurtPlayer(ctx, AIR_BODY_DMG, AIRBODY, { x: (Math.sign(pc - d.x) || -d.facing) * 12, y: -7 });
        d.bouncedAt = state.frame;
      }
      d.vy += GRAV; d.y += d.vy;
      if (d.y >= GY && d.vy > 0) { d.y = GY; d.vy = 0; d.vx = 0; d.st = 'land'; d.t = 0; d.hit = false; quake(ctx, d); }
      break;
    case 'land':
      // (winded)
      d.vx = 0;
      if (d.t > 56 * mad) { d.st = 'walk'; d.t = 0; d.cd = 30 + Math.random() * 30; }
      break;
    case 'swatWind':
      // (looking up, the fork coming round over his head: the tell)
      d.vx = 0;
      if (d.t > SWAT_WIND) { d.st = 'swat'; d.t = 0; d.hit = false; playSound('whoosh', 1, -4); }
      break;
    case 'swat':
      if (d.t >= 2 && d.t <= 8 && rectsOverlap(hb, { x: d.x - 90, y: d.y - H - 170, w: 180, h: 190 })) strike(ctx, d, SWAT_DMG, FORK, (Math.sign(pc - d.x) || 1) * 10, -9);
      if (d.t > 30) { d.st = 'walk'; d.t = 0; d.cd = 20; }
      break;
    case 'tripped':
      // (flat on his back, legs kicking: nothing he can do)
      d.vx = 0;
      if (d.t % 12 === 0) playSound('snort', 0.5, -12);
      if (d.t > TRIP_FRAMES) { d.st = 'walk'; d.t = 0; d.cd = 30; playSound('bellow', 0.6, -10); }
      break;
    case 'hop':
      d.vy += GRAV; d.y += d.vy;
      if (d.y >= GY && d.vy > 0) { d.y = GY; d.vy = 0; d.st = 'walk'; d.t = 0; playSound('thud', 0.6, -10); }
      break;
    case 'stagger':
      d.vx = 0;
      if (d.t > STAGGER_FRAMES) { d.st = 'walk'; d.t = 0; d.cd = 20; }
      break;
  }
  // Along, kept in his pit
  d.x = Math.max(D_MIN, Math.min(D_MAX, d.x + d.vx));
  // (just walked into: his gut)
  const walking = d.st === 'walk' || d.st === 'rise';
  if (walking && alive && p.isGrounded && p.invincibilityTimer <= 0 && !(p.isCharging || p.isUppercutting || p.isDivekicking) && rectsOverlap(hb, { x: d.x - W / 2 + 10, y: d.y - H + 20, w: W - 20, h: H - 20 })) {
    hurtPlayer(ctx, BUMP_DMG, DEMON_KIND, { x: toward * -8, y: -6 });
  }
};

/** Beaten up in the air: he comes down (with a thump). */
export const settleDemon = (state: GameState, d: Demon) => {
  if (d.y >= GY) return;
  d.vy += GRAV; d.y = Math.min(GY, d.y + d.vy);
  if (d.y >= GY) { d.vy = 0; playSound('thud', 1, -10); shakeScreen(state, 12, 5); }
};
/** He's sinking away (satan.ts says when). */
export const sinkDemon = (d: Demon) => { d.st = 'sink'; d.t = 0; };
export const tickSink = (state: GameState, d: Demon) => {
  d.t++; d.sink = Math.min(1, d.t / 110);
  if (d.t % 6 === 0) for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: d.x + (Math.random() - 0.5) * 120, y: GY - 2 }, vel: { x: (Math.random() - 0.5) * 2, y: -2 - Math.random() * 3 }, life: 24, color: i % 2 ? '#F97316' : '#FDE047', size: 3 + Math.random() * 3 });
  if (d.t % 30 === 0) playSound('glug', 0.7, -8);
  if (d.sink >= 1) d.fight = 'gone';
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing, world space, behind Meathead: a big SNES boss sprite (every part a stepped ramp lit from the upper left,
// dithered between the steps, inked; the lava's light along his underside). Big, fat, a napkin tucked in under his
// chins (he was at his lunch), bored half-shut eyes, tiny wings no use to anybody.

const SKIN = ['#2E0604', '#560C08', '#7E1610', '#A2241A', '#C23E28', '#DE6646'];
const GUT = ['#5E2418', '#8A4030', '#B4644E', '#D2866C', '#EAAA8E'];
const HORNC = ['#4A3E30', '#7A6A54', '#A89678', '#D0C0A0', '#F0E4C8'];
const HOOF = ['#0C0806', '#1C1410', '#2E241E', '#463A30'];
const NAPKIN = ['#8E8478', '#BCB2A4', '#DDD6CA', '#F4F0E8'];
const FORK_C = ['#0E0C0C', '#1E1A1A', '#36302E', '#56504C'];
const STEELT = ['#5A5A62', '#8A8A94', '#B4B4BE', '#E4E4EC'];
const HOTT = ['#9A2A0A', '#E06010', '#F8A830', '#FFF0A0'];

/** The fork, from his hand at (hx, hy) pointing `ang` (radians; 0 forward): the iron shaft, the crossbar, the three
 *  barbed tines (hot: glowing up through orange to white), a glint at the tips when he's about to use it. */
const fork = (c: Ctx, hx: number, hy: number, ang: number, glint: boolean, hot: number) => {
  c.save(); c.translate(Math.round(hx), Math.round(hy)); c.rotate(ang);
  box(c, -52, -4, 224, 8, INK);
  box(c, -50, -3, 220, 6, FORK_C[1]); box(c, -50, -3, 220, 2, FORK_C[3]); box(c, -50, 2, 220, 1, FORK_C[0]);
  for (let x = -40; x < 160; x += 30) box(c, x, -3, 2, 6, FORK_C[2]);
  box(c, -56, -6, 8, 12, INK); box(c, -55, -5, 6, 10, FORK_C[2]);
  const t = hot > 0 ? (hot > 0.6 ? [HOTT[2], HOTT[3], '#FFFFFF'] : [HOTT[0], HOTT[1], HOTT[2]]) : [STEELT[0], STEELT[1], STEELT[3]];
  box(c, 164, -19, 10, 38, INK); box(c, 165, -18, 8, 36, FORK_C[2]); box(c, 165, -18, 3, 36, FORK_C[3]);
  for (const y of [-17, -1, 13]) {
    box(c, 172, y - 1, 30, 6, INK);
    box(c, 172, y, 28, 4, t[0]); box(c, 172, y, 28, 2, t[1]); box(c, 174, y, 20, 1, t[2]);
    c.fillStyle = INK; c.beginPath(); c.moveTo(199, y - 2); c.lineTo(211, y + 2); c.lineTo(199, y + 6); c.fill();
    c.fillStyle = t[1]; c.beginPath(); c.moveTo(200, y); c.lineTo(207, y + 2); c.lineTo(200, y + 4); c.fill();
    // (the barb)
    c.fillStyle = INK; c.beginPath(); c.moveTo(192, y + 4); c.lineTo(188, y + 9); c.lineTo(186, y + 4); c.fill();
  }
  if (glint) { box(c, 203, -24, 3, 50, '#FFFFFF'); box(c, 190, 0, 28, 3, '#FFFFFF'); box(c, 199, -6, 11, 13, '#FFFFFF'); }
  c.restore();
};

/** A soul (lunch): a little pale wisp of somebody, a face on it, scared stiff. */
const soul = (c: Ctx, x: number, y: number, s: number, f: number) => {
  const r = ['#3E8FA0', '#7CCBDA', '#B4EEF6', '#E8FCFF'];
  const w = Math.round(9 * s), h = Math.round(11 * s), tail = Math.round(Math.sin(f * 0.2) * 3);
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, w + 1, h + 1, 0, Math.PI, 0); c.lineTo(x + w + 1, y + h * 0.6); c.lineTo(x + tail, y + h * 1.4); c.lineTo(x - w - 1, y + h * 0.6); c.closePath(); c.fill();
  c.fillStyle = r[1]; c.beginPath(); c.ellipse(x, y, w, h, 0, Math.PI, 0); c.lineTo(x + w, y + h * 0.55); c.lineTo(x + tail, y + h * 1.3); c.lineTo(x - w, y + h * 0.55); c.closePath(); c.fill();
  c.fillStyle = r[2]; c.beginPath(); c.ellipse(x - w * 0.25, y - h * 0.2, w * 0.6, h * 0.6, 0, 0, Math.PI * 2); c.fill();
  box(c, x - w * 0.5, y - h * 0.6, 2, 2, r[3]);
  box(c, x - 3 * s, y - 2 * s, Math.max(1, 2 * s), Math.max(1, 2 * s), '#0E3A48'); box(c, x + 1 * s, y - 2 * s, Math.max(1, 2 * s), Math.max(1, 2 * s), '#0E3A48');
  box(c, x - 1 * s, y + 2 * s, Math.max(1, 2 * s), Math.max(2, 3 * s), '#0E3A48');
};

const drawBody = (c: Ctx, d: Demon, f: number) => {
  const st = d.st, t = d.t, fl = d.flash > 0;
  const squat = st === 'crouch' ? Math.min(1, t / 12) * 22 : st === 'sweepWind' || st === 'sweep' ? 14 : st === 'land' ? Math.max(0, 18 - t) : st === 'stagger' || st === 'tripped' || st === 'beaten' || st === 'sink' ? 30 : 0;
  const breathe = Math.round(Math.sin(f * 0.08) * 2), wobble = st === 'crouch' ? Math.round(Math.sin(t * 0.9) * 4) : 0;
  const walk = st === 'walk' && Math.abs(d.vx) > 0.1 ? Math.round(Math.sin(f * 0.2) * 5) : st === 'tripped' && t > 10 && t < 64 ? Math.round(Math.sin(t * 0.9) * 9) : 0;
  const S = flashed(SKIN, fl), G = flashed(GUT, fl), sat = st === 'beaten' || st === 'sink';
  // (the tail: thick, curling up behind him, the spade on the end)
  const tw = Math.round(Math.sin(f * 0.1) * 8);
  c.lineCap = 'round';
  for (const [col, w] of [[INK, 10], [S[1], 6], [S[2], 2]] as [string, number][]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(-50, -46 + squat); c.quadraticCurveTo(-100, -38, -92, -88 + tw); c.stroke(); }
  c.lineCap = 'butt';
  inked(c, [[-92, -106 + tw], [-80, -88 + tw], [-92, -92 + tw], [-104, -86 + tw]], S[2]);
  // (the tiny useless wings, flapping away)
  const flap = Math.floor(f / 10) % 2 ? -6 : 0;
  for (const [dx, sh] of [[-6, 1], [0, 0]] as [number, number][]) {
    inked(c, [[-28 + dx, -142 + squat], [-58 + dx, -172 + squat + flap], [-64 + dx, -156 + squat + flap], [-52 + dx, -152 + squat + flap * 0.5], [-50 + dx, -138 + squat], [-38 + dx, -132 + squat]], S[1 - sh + 1]);
    c.strokeStyle = S[4]; c.lineWidth = 2; c.beginPath(); c.moveTo(-30 + dx, -140 + squat); c.lineTo(-56 + dx, -168 + squat + flap); c.stroke();
  }
  // (legs: stubby, goat-kneed, cloven hooves; sat, out in front of him)
  if (!sat) {
    for (const [lx, w, dark0] of [[-28 + walk, 1, 1], [26 - walk, -1, 0]] as [number, number, number][]) {
      const R = dark0 ? S.map(cc => mix(cc, INK, 0.2)) : S;
      blob(c, lx, -36 + squat * 0.4, 20, 16, R, false);
      thick(c, lx - 4 * w, -22 + squat * 0.3, lx + 2, -8, 14, R);
      inked(c, [[lx - 12, 0], [lx - 10, -12], [lx + 12, -12], [lx + 14, 0]], HOOF[2]);
      box(c, lx - 10, -12, 22, 3, HOOF[3]); box(c, lx, -10, 2, 10, INK);
    }
  } else {
    blob(c, 30, -16, 38, 14, S, false);
    inked(c, [[58, 0], [56, -26], [72, -26], [74, 0]], HOOF[2]); box(c, 64, -24, 2, 24, INK);
  }
  // (the gut: huge, in steps; the pale belly over it; its folds; the button; a few hairs)
  const by = -88 + squat;
  blob(c, 4, by, 66 + wobble, 58 + breathe, S);
  blob(c, 16, by + 6, 44 + wobble, 42 + breathe, G, false);
  c.strokeStyle = G[0]; c.lineWidth = 2;
  c.beginPath(); c.ellipse(16, by + 34 + breathe, 30 + wobble, 10, 0, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
  c.beginPath(); c.ellipse(-30, by + 10, 18, 26, 0, -0.5 * Math.PI, 0.3 * Math.PI); c.stroke();
  box(c, 20, by + 12, 6, 6, INK); box(c, 21, by + 13, 4, 2, G[0]);
  for (const [x, y] of [[0, -14], [26, -20], [34, 2], [6, 20], [-12, 6]]) { box(c, 16 + x, by + y, 2, 5, S[0]); box(c, 18 + x, by + y - 2, 2, 3, S[0]); }
  // (shoulders, and the head: small for him; jowls, two chins, stubby horns, pointed ears)
  const hy = -170 + squat;
  blob(c, 4, -136 + squat, 50, 20, S, false);
  for (const s of [-1, 1]) inked(c, [[6 + s * 18, hy + 14], [6 + s * 34, hy + 6], [6 + s * 22, hy + 26]], s < 0 ? S[1] : S[3]);
  // (horns: curling up and out, ringed)
  for (const s of [-1, 1]) {
    const bx = 6 + s * 10;
    inked(c, [[bx - 6, hy + 6], [bx + s * 6 - 6, hy - 6], [bx + s * 16, hy - 20], [bx + s * 12, hy - 6], [bx + 6, hy + 6]], HORNC[s < 0 ? 1 : 2]);
    box(c, bx + s * 6 - 3, hy - 6, 6, 2, HORNC[0]); box(c, bx + s * 10 - 2, hy - 12, 5, 2, HORNC[0]);
    box(c, bx - 2, hy, 2, 4, HORNC[4]);
  }
  blob(c, 6, hy + 22, 24, 24, S, false);
  blob(c, 6, hy + 44, 26, 10, S, false);
  blob(c, 6, hy + 54, 22, 7, S, false);
  // (the napkin, tucked in under his chins: lunch on it)
  inked(c, [[-14, hy + 54], [30, hy + 54], [38, hy + 66], [8, hy + 104], [-22, hy + 66]], NAPKIN[2]);
  box(c, -12, hy + 56, 40, 4, NAPKIN[3]); checker(c, -10, hy + 60, 36, 2, NAPKIN[3]);
  c.fillStyle = NAPKIN[1]; c.beginPath(); c.moveTo(30, hy + 62); c.lineTo(36, hy + 66); c.lineTo(8, hy + 102); c.lineTo(14, hy + 84); c.closePath(); c.fill();
  for (const s2 of [-1, 1]) inked(c, [[8 + s2 * 22, hy + 52], [8 + s2 * 32, hy + 46], [8 + s2 * 30, hy + 58]], NAPKIN[2], 1.5);
  for (const [x, y, w, col] of [[-6, 68, 8, '#9E1B1B'], [12, 76, 6, '#7CCBDA'], [4, 86, 4, '#9E1B1B'], [-10, 70, 4, '#B4644E']] as [number, number, number, string][]) box(c, x, hy + y, w, w - 2, col);
  // (the face: the brow, bored eyes with the lids half down, a fat nose, the mouth, the goatee)
  box(c, -8, hy + 10, 30, 4, S[0]);
  const lid = st === 'tripped' ? (t < 64 ? 0 : 4) : st === 'stagger' || st === 'beaten' ? 4 : st.endsWith('Wind') || st === 'crouch' ? 1 : 3;
  for (const ex of [4, 19]) {
    c.fillStyle = INK; c.beginPath(); c.ellipse(ex, hy + 18, 5, 4.5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#F6D860'; c.beginPath(); c.ellipse(ex, hy + 18, 4, 3.5, 0, 0, Math.PI * 2); c.fill();
    box(c, ex + 1, hy + 16, 2, 4, INK);
    box(c, ex - 5, hy + 13, 10, lid + 1, S[2]); box(c, ex - 5, hy + 13 + lid, 10, 1, INK);
  }
  blob(c, 12, hy + 28, 7, 5, S, false, 1);
  box(c, 9, hy + 29, 2, 2, INK); box(c, 14, hy + 29, 2, 2, INK);
  const talking = !!d.said || st === 'lounge';
  const open = st === 'tripped' && t < 64 ? 7 + (Math.floor(t / 5) % 2) * 3 : talking && Math.floor(f / 6) % 2 ? 6 : 2;
  box(c, 3, hy + 35, 20, open + 2, INK); box(c, 4, hy + 36, 18, open, '#3A0808');
  if (open > 2) box(c, 8, hy + 38, 8, 3, '#C04050');
  box(c, 2, hy + 34, 3, 2, S[0]); box(c, 21, hy + 34, 3, 2, S[0]);
  box(c, 9, hy + 38 + open, 10, 9, INK); box(c, 10, hy + 38 + open, 8, 8, '#1C1210'); box(c, 10, hy + 38 + open, 2, 6, '#3A2E28');
  return { squat, hy, S };
};

export const drawDemon = (c: Ctx, state: GameState) => {
  const d = demonOf(state);
  if (!d) return;
  const f = state.frame;
  // (the fork he dropped, stuck in the floor: still there on the way back; handle up, tines in, leaning)
  if (d.forkAt !== null) fork(c, d.forkAt, GY - 190, Math.PI / 2 - 0.2, false, 0);
  if (d.fight === 'gone') return;
  if (d.x < state.camera.x - 400 || d.x > state.camera.x + CANVAS_WIDTH + 400) return;
  const st = d.st, t = d.t;
  // (his shadow where he'll come down: in steps, darker as he comes)
  if (st === 'air') {
    const k = Math.max(0.2, 1 - (GY - d.y) / 500), rw = Math.round(70 * k + 10);
    c.fillStyle = `rgba(0, 0, 0, ${(0.3 * k).toFixed(2)})`;
    c.fillRect(Math.round(d.jumpTo - rw), GY - 4, rw * 2, 6); c.fillRect(Math.round(d.jumpTo - rw * 0.7), GY - 6, Math.round(rw * 1.4), 8);
  }
  // (the slam's zone, glowing on the floor and up off it in bands: get out of it)
  if (st === 'slamWind') {
    const a = 0.2 + 0.25 * (Math.sin(t * 0.5) * 0.5 + 0.5);
    const z = ahead(d, SLAM_NEAR, SLAM_FAR, 230, 0);
    for (let i = 0; i < 4; i++) { c.fillStyle = `rgba(239, 68, 68, ${(a * (0.12 + i * 0.08)).toFixed(3)})`; c.fillRect(z.x, z.y + i * z.h / 4, z.w, z.h / 4); }
    c.fillStyle = `rgba(253, 224, 71, ${(a + 0.2).toFixed(3)})`; c.fillRect(z.x, GY - 4, z.w, 4);
    checker(c, z.x, GY - 8, z.w, 4, a > 0.35 ? '#FDE047' : '#F97316');
  }
  if (st === 'tripped') {
    tripDust(c, d.x, t);
    const tf = tripFork(t);
    if (tf) { c.save(); c.translate(Math.round(d.x), Math.round(d.y)); c.scale(d.facing, 1); fork(c, tf.x, tf.y, tf.ang, false, 0); c.restore(); }
  }
  c.save();
  if (st === 'sink') { c.beginPath(); c.rect(d.x - 200, d.y - 400, 400, 400); c.clip(); c.translate(0, d.sink * 200); }
  c.translate(Math.round(d.x), Math.round(d.y));
  c.scale(d.facing, 1);
  // (tripped: over on his back, his little legs kicking at the air)
  if (st === 'tripped') tripPose(c, t);
  drawBodyAndFork(c, d, f, st, t);
  c.restore();
  if (st === 'sink') {
    const r = 80 + Math.round(Math.sin(f * 0.2) * 6);
    c.fillStyle = INK; c.beginPath(); c.ellipse(d.x, GY, r + 2, 10, 0, 0, Math.PI * 2); c.fill();
    for (const [k, col] of [[1, LAVA[3]], [0.8, LAVA[4]], [0.55, LAVA[6]], [0.25, LAVA[7]]] as [number, string][]) { c.fillStyle = col; c.beginPath(); c.ellipse(d.x, GY - 1, r * k, 8 * k, 0, 0, Math.PI * 2); c.fill(); }
  }
  // At his lunch: the souls drifting over to him (he's got one in his fist already)
  if (st === 'lounge') {
    for (let i = 0; i < 3; i++) {
      const k = ((f + i * 50) % 150) / 150, sx = d.x + 260 * (1 - k) * (i % 2 ? 1 : -1) * 0.7, sy = GY - 40 - k * 120 - Math.sin(k * 6 + i) * 20;
      soul(c, Math.round(sx), Math.round(sy), 0.7, f + i * 9);
    }
  }
};

/** How far down he's sunk on his haunches (the windups, the landing, sat down). */
const squatOf = (d: Demon) => {
  const st = d.st, t = d.t;
  return st === 'crouch' ? Math.min(1, t / 12) * 22 : st === 'sweepWind' || st === 'sweep' ? 14 : st === 'land' ? Math.max(0, 18 - t) : st === 'stagger' || st === 'tripped' || st === 'beaten' || st === 'sink' ? 30 : 0;
};
/** His arms' bones: upper arm, forearm. */
const UPPER = 40, FORE = 38;
/** Where the elbow goes reaching from the shoulder S to the hand H (two bones): always bent the natural way, down and
 *  out from the body, never back on itself. The hand's kept within reach. */
const elbowFor = (sx: number, sy: number, hx: number, hy: number) => {
  const d = Math.max(Math.abs(UPPER - FORE) + 1, Math.min(UPPER + FORE - 1, Math.hypot(hx - sx, hy - sy)));
  const base = Math.atan2(hy - sy, hx - sx), a = Math.acos(Math.max(-1, Math.min(1, (UPPER * UPPER + d * d - FORE * FORE) / (2 * UPPER * d))));
  const e1 = [sx + Math.cos(base + a) * UPPER, sy + Math.sin(base + a) * UPPER], e2 = [sx + Math.cos(base - a) * UPPER, sy + Math.sin(base - a) * UPPER];
  // (the one out from his side and down: an elbow sticks out from a fat man, it doesn't fold in over his gut)
  const out = sx >= 4 ? 1 : -1, score = (e: number[]) => (e[0] - sx) * out + (e[1] - sy) * 0.6;
  return score(e1) >= score(e2) ? e1 : e2;
};
/** A hand brought within reach of the shoulder (along the way to where it was going). */
const reach = (sx: number, sy: number, hx: number, hy: number): [number, number] => {
  const d = Math.hypot(hx - sx, hy - sy), m = UPPER + FORE - 2;
  return d <= m ? [hx, hy] : [sx + (hx - sx) * m / d, sy + (hy - sy) * m / d];
};
/** An arm: the shoulder, the elbow (see elbowFor), the fist; `far`: the one behind, a shade darker. */
const arm = (c: Ctx, sx: number, sy: number, hx: number, hy: number, S: readonly string[], far = false) => {
  const R = far ? S.map(x => mix(x, INK, 0.18)) : S;
  const [ex, ey] = elbowFor(sx, sy, hx, hy);
  blob(c, sx, sy + 4, 15, 14, R, false);
  thick(c, sx, sy, ex, ey, 20, R); blob(c, ex, ey, 10, 10, R, false);
  thick(c, ex, ey, hx, hy, 16, R);
  blob(c, hx, hy, 10, 9, R, false);
};

/** The trip, by frame (TRIP_FRAMES long, the free hits all of it): his legs swept out and over he goes, up off the
 *  floor a beat, down on his back with a thud (the gut squashing and bouncing), there he wiggles, legs going; then a
 *  roll to his side and a heave back up. Turned about his feet (local, facing right). */
const tripPose = (c: Ctx, t: number) => {
  const T = TRIP_FRAMES, ease = (k: number) => k * k * (3 - 2 * k);
  let rot = -1.5, lift = 0, sy = 1;
  if (t < 9) { const k = t / 9; rot = -1.5 * k * k; lift = -Math.sin(Math.PI * k) * 26; }
  else if (t < 16) { const k = (t - 9) / 7; sy = 1 - Math.sin(Math.PI * k) * 0.12 * (1 - k * 0.5); lift = Math.sin(Math.PI * k) * 3; }
  else if (t < T - 20) rot = -1.5 + Math.sin(t * 0.6) * 0.05;
  else if (t < T - 9) { const k = ease((t - (T - 20)) / 11); rot = -1.5 + 0.95 * k; lift = -Math.sin(Math.PI * k) * 6; }
  else { const k = ease((t - (T - 9)) / 9); rot = -0.55 * (1 - k); }
  // (kept lying on the floor, his gut over where he stood: turned about his feet, then lifted back up onto it)
  const over = -rot / 1.5;
  c.translate(57 * over, -60 * over + lift); c.scale(1, sy); c.rotate(rot);
};
/** His fork, knocked flying when he goes over, landing flat beside him, clattering; grabbed back at the end (local:
 *  facing right, his feet at 0, unrotated). Null once he's got hold of it again. */
const tripFork = (t: number): { x: number; y: number; ang: number } | null => {
  if (t >= TRIP_FRAMES - 6) return null;
  if (t < 14) { const k = t / 14; return { x: 46 + 40 * k, y: -96 + 90 * k - Math.sin(Math.PI * k) * 70, ang: -1.35 + (1.38 + Math.PI * 2) * k }; }
  const bounce = t < 22 ? Math.abs(Math.sin((t - 14) * 0.8)) * 4 : 0;
  return { x: 86 - (t > TRIP_FRAMES - 16 ? (t - (TRIP_FRAMES - 16)) * 6 : 0), y: -5 - bounce, ang: 0.03 };
};
/** The dust off his landing: puffs rolling out either side, thinning (stepped, flat). */
const tripDust = (c: Ctx, x: number, t: number) => {
  if (t < 9 || t > 34) return;
  const k = (t - 9) / 25;
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    const px = x + s * (50 + k * 90 + i * 22), r = 10 + k * 10 - i * 2, py = GY - 6 - i * 3;
    c.fillStyle = k < 0.5 ? '#6E5848' : '#4A3A30'; c.globalAlpha = 0.75 * (1 - k);
    c.beginPath(); c.arc(Math.round(px), Math.round(py), Math.max(2, r), 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
};

const drawBodyAndFork = (c: Ctx, d: Demon, f: number, st: St, t: number) => {
  const mad = d.hp < HP * 0.4 ? 0.75 : 1;
  // Where the fork is: his hand, which way it points, glinting, how hot its tines are
  let hx = 46, hy = -96, ang = -1.35, glint = false, hot = 0, behind = false;
  switch (st) {
    case 'lounge': hx = -60; hy = -10; ang = -1.6; behind = true; break;
    case 'rise': { const k = Math.min(1, t / 80); hx = -60 + k * 106; hy = -10 - k * 86; ang = -1.6 + k * 0.25; break; }
    case 'thrustWind': { const k = Math.min(1, t / 20); hx = 46 - k * 106; hy = -60; ang = 0; glint = Math.floor(t / 6) % 2 === 0; hot = t / (THRUST_WIND * mad); break; }
    case 'thrust': { const k = Math.min(1, t / 5); hx = -60 + k * 90; hy = -60; ang = 0; hot = t < 14 ? 1 : 0; break; }
    case 'slamWind': { const k = Math.min(1, t / 24); hx = 20; hy = -150 - k * 40; ang = -1.35 - k * 0.9; hot = t / (SLAM_WIND * mad); glint = Math.floor(t / 6) % 2 === 0; break; }
    case 'slam': { const k = Math.min(1, t / 6); hx = 30 + k * 20; hy = -190 + k * 110; ang = -2.25 + k * 2.6; hot = 1; break; }
    case 'stuck': hx = 50 + Math.sin(t * 0.6) * 3; hy = -80; ang = 0.35; break;
    case 'sweepWind': hx = -30; hy = -36; ang = Math.PI - 0.12; behind = true; hot = t / (SWEEP_WIND * mad); break;
    case 'sweep': { const k = Math.min(1, t / 8); hx = -30 + k * 70; hy = -30; ang = (Math.PI - 0.12) * (1 - k) + 0.1 * k; hot = t < 12 ? 1 : 0; behind = k < 0.5; break; }
    case 'crouch': hx = 40; hy = -70; ang = -1.2; break;
    case 'air': hx = 44; hy = -120; ang = -0.9; break;
    case 'land': hx = 50; hy = -60; ang = 0.5; break;
    case 'stagger': hx = 30; hy = -40; ang = 0.9; break;
    case 'tripped': if (t >= TRIP_FRAMES - 6) { hx = 30; hy = -40; ang = 0.9; } else { hx = 0; hy = -9999; } break;
    case 'hop': hx = 44; hy = -120; ang = -0.9; break;
    case 'swatWind': { const k = Math.min(1, t / SWAT_WIND); hx = 20 - k * 30; hy = -150 - k * 20; ang = -1.35 - k * 1.2; glint = t % 6 < 3; hot = k; break; }
    case 'swat': { const k = Math.min(1, t / 5); hx = -10 + k * 30; hy = -170; ang = -2.55 + k * 2.2; hot = 1; break; }
    case 'beaten': case 'sink': hx = 0; hy = -9999; break;
  }
  const showFork = hy > -9000;
  // The grip: his near hand where the fork's held (brought within reach of his shoulder: the fork goes with it), the
  // far hand further down the shaft if he can get it there (a two-handed hold), otherwise resting on his gut
  const sq = squatOf(d), nearSh: [number, number] = [42, -122 + sq], farSh: [number, number] = [-38, -126 + sq];
  if (showFork && st !== 'lounge') [hx, hy] = reach(nearSh[0], nearSh[1], hx, hy);
  const gx = hx - Math.cos(ang) * 46, gy = hy - Math.sin(ang) * 46;
  const twoHands = showFork && st !== 'lounge' && st !== 'stagger' && st !== 'tripped' && Math.hypot(gx - farSh[0], gy - farSh[1]) <= UPPER + FORE - 4;
  if (showFork && behind) fork(c, hx, hy, ang, glint, hot);
  const r = drawBody(c, d, f);
  if (showFork && !behind) fork(c, hx, hy, ang, glint, hot);
  if (st === 'lounge') {
    // (at his lunch: the far hand on his gut, the soul in the near fist)
    arm(c, farSh[0], farSh[1], -4, -96, r.S, true);
    arm(c, nearSh[0], nearSh[1], 66, -118, r.S);
    soul(c, 76, -126, 1, f);
  } else if (showFork) {
    if (twoHands) arm(c, farSh[0], farSh[1], gx, gy, r.S, true);
    else arm(c, farSh[0], farSh[1], -6, -84 + sq, r.S, true);
    arm(c, nearSh[0], nearSh[1], hx, hy, r.S);
  } else if (st === 'tripped') {
    // (tripped: on his back, arms flailing at the air (pushing at the floor, getting up))
    const up = t >= TRIP_FRAMES - 20, w = up ? 0.3 : 1;
    arm(c, farSh[0], farSh[1], 34 + Math.cos(t * 0.9) * 14 * w, -178 + Math.sin(t * 1.1) * 10 * w + (up ? 40 : 0), r.S, true);
    arm(c, nearSh[0], nearSh[1], 82 + Math.sin(t * 0.8) * 14 * w, -150 + Math.cos(t * 0.7) * 12 * w + (up ? 50 : 0), r.S);
  } else {
    // (beaten: arms folded over the gut, sulking)
    thick(c, -30, -126 + r.squat, 36, -116 + r.squat, 16, r.S);
    blob(c, 38, -116 + r.squat, 8, 8, r.S, false);
  }
};

/** What he's saying, over his head (only while he's saying it). */
export const drawDemonSaid = (c: Ctx, state: GameState) => {
  const d = demonOf(state);
  if (!d?.said || d.fight === 'gone') return;
  saidOver(c, d.said.text, d.x, d.y - H - 50 + d.sink * 200, '#FCA5A5', 230);
};

const WALL_FIRE = [LAVA[1], LAVA[2], LAVA[3], LAVA[4], LAVA[5], LAVA[6], LAVA[7]];

/** The walls of fire across his pit's two ways out (the way in only once he's roused), while he's at it: up out of
 *  the top of the frame (there's no getting over them), in rows, each layer licking in and out, white-hot at the core. */
export const drawFireWall = (c: Ctx, state: GameState) => {
  const d = demonOf(state), f = state.frame;
  if (!d) return;
  const top = Math.floor((state.camera.y - 40) / 6) * 6;
  for (const w of [d.back, d.lock]) {
    if (!w || w.x < -1e6) continue;
    const x = w.x + w.w / 2;
    if (x < state.camera.x - 100 || x > state.camera.x + CANVAS_WIDTH + 100) continue;
    // (its light on the floor either side: a faint band, no glare)
    hazeBands(c, x - 60, GY - 30, 120, 30, LAVA[4], 0, 0.16, 3);
    for (let i = 0; i < WALL_FIRE.length; i++) {
      const ww = 44 - i * 6;
      for (let y = top; y < GY; y += 6) {
        const wob = Math.round(Math.sin(f * 0.45 + y * 0.07 + i * 1.7) * (4 - i * 0.4));
        box(c, Math.round(x - ww / 2 + wob), y, ww, 6, WALL_FIRE[i]);
      }
    }
    // (tongues licking up it, rising)
    for (let k = 0; k < 7; k++) {
      const ty = GY - ((f * 3 + k * 97) % Math.max(1, GY - top)), tx = Math.round(x + Math.sin(f * 0.3 + k) * 14);
      c.fillStyle = k % 2 ? LAVA[6] : LAVA[7]; c.beginPath(); c.moveTo(tx - 4, ty + 10); c.lineTo(tx, ty - 14); c.lineTo(tx + 4, ty + 10); c.fill();
    }
    // (its foot: the floor burning)
    for (let i = 0; i < 4; i++) box(c, Math.round(x - 30 + i * 16 + Math.sin(f * 0.6 + i) * 3), GY - 6 - ((f + i * 3) % 4), 10, 6, LAVA[5 + (i % 2)]);
  }
};

/** His bar (top band, clear of the HUD). */
export const drawDemonHud = (c: Ctx, state: GameState) => {
  const d = demonOf(state);
  if (!d || d.fight !== 'on' || state.player.inCutscene) return;
  const band = topBand(), w = band.x2 - band.x1;
  box(c, band.x1, 18, w, 14, '#18181B'); box(c, band.x1 + 2, 20, (w - 4) * Math.max(0, d.hp / HP), 10, d.flash > 0 ? '#FECACA' : '#DC2626');
  label(c, DEMON_NAME, band.mid, 44, '#FDBA74', 8);
};

registerM2Kind({
  kind: DEMON_KIND, stats: { w: W, h: H, hp: POOL, contact: 0, mass: MASS }, ai: (_ctx, e) => { e.vel.x = 0; e.vel.y = 0; return true; },
  // (drawn whole by drawDemon, behind; its box draws nothing, and no daze over it)
  draw: (_c, e) => { e.pauseTimer = 0; },
  head: { x: 14, y: -150, r: 20 }, gender: 'm', grab: 'none', midBoss: true, touch: demonTouch,
});
registerHurtLines(DEMON_KIND, HURT_BELLY, DEATH_BELLY);
registerHurtLines(BELLY, HURT_BELLY, DEATH_BELLY);
registerDeathKind(BELLY, 'flattened');
registerHurtLines(FORK, HURT_FORK, DEATH_FORK);
registerHurtLines(QUAKE, HURT_QUAKE, DEATH_QUAKE);
registerHurtLines(AIRBODY, HURT_AIRBODY, DEATH_AIRBODY);
registerHurtLines(FIRE_BOUNCE, HURT_BOUNCE_FIRE, DEATH_BOUNCE_FIRE);
registerDeathKind(FIRE_BOUNCE, 'burnt');
