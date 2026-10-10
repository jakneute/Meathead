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
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { say, cutVoice } from '../../../m1/game/platform/speech';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { rectsOverlap, boundsOf } from '../../../m1/game/core/utils';
import { getAttackHitbox, recoilOff } from '../../../m1/game/player/player';
import { ENEMY_HIT_COOLDOWN, POWER_CELLS, BOUNCE_FRAMES } from '../../../m1/constants';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { topBand, CANVAS_WIDTH } from '../../../m1/constants';
import { solid, box, label, saidOver, meatheadSays, voice, type Said } from '../section';
import { GY } from '../geometry';
import { ARENA_IN, ARENA_OUT, DEMON_HOME } from './layout';
import { hellOf } from './state';
import {
  DEMON_NAME, DEMON_INTRO, DEMON_CHATTER, DEMON_HIT, DEMON_HURT, MH_DEMON, HURT_FORK, DEATH_FORK, HURT_QUAKE, DEATH_QUAKE,
  HURT_BELLY, DEATH_BELLY, HURT_BOUNCE_FIRE, DEATH_BOUNCE_FIRE, type Dressed, type ByPants,
} from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = <T>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];

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
  | 'crouch' | 'air' | 'land' | 'stagger' | 'swatWind' | 'swat' | 'beaten' | 'sink';

export interface Demon {
  fight: 'wait' | 'on' | 'beaten' | 'gone';
  x: number; y: number; vx: number; vy: number; facing: 1 | -1;
  st: St; t: number; cd: number;
  hp: number; flash: number; hurtSince: number; hurtAt: number;
  e: Enemy | null; lock: Block | null;
  /** The fire wall over the way in: up once he's roused (no backing out), down when he's beaten. */
  back: Block | null;
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
    hp: HP, flash: 0, hurtSince: 0, hurtAt: -999, e: null, lock: null, back: null, bouncedAt: -999, slamX: 0, jumpTo: 0, hit: false,
    said: null, talkAt: 0, used: [], forkAt: null, sink: 0, stomps: 0, stompAt: -999,
  };
  d.lock = solid(state, ARENA_OUT, GY - 1200, 30, 1200, { hidden: true, tag: 'hell-lock' });
  const e = makeKindEnemy(DEMON_KIND as EnemyKind, d.x, GY);
  e.health = e.maxHealth = POOL; e.harmless = true; e.unshakeable = true; e.noCrowd = true; e.seen = true; e.pos.y = -100000;
  d.e = e; state.enemies.push(e);
  h.demon = d;
};
const gone = (): Demon => ({
  fight: 'gone', x: DEMON_HOME, y: GY, vx: 0, vy: 0, facing: -1, st: 'sink', t: 0, cd: 0, hp: 0, flash: 0, hurtSince: 0, hurtAt: 0,
  e: null, lock: null, back: null, bouncedAt: -999, slamX: 0, jumpTo: 0, hit: false, said: null, talkAt: 0, used: [], forkAt: DEMON_HOME - 90, sink: 1, stomps: 0, stompAt: 0,
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
  if (p.health > 0 && Math.random() < 0.6) demonSays(ctx.state, d, DEMON_HIT, true);
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
  if (e.hitByMove === p.moveId && (e.hitCooldown ?? 0) > 0) return true;
  if (!rectsOverlap(getAttackHitbox(ctx), boundsOf(e))) return true;
  const up = !!p.isUppercutting, dk = !!p.isDivekicking, slide = !up && !dk && !!p.isSliding;
  const dmg = up ? MELEE.uppercut : dk ? MELEE.divekick : slide ? MELEE.slide : MELEE.charge;
  e.hitByMove = p.moveId; e.hitCooldown = ENEMY_HIT_COOLDOWN;
  if (up) p.uppercutHitIds.push(e.id);
  if (dk) p.diveKickHitIds.push(e.id);
  const pc = p.pos.x + p.width / 2, dir = Math.sign(d.x - pc) || 1;
  const at = { x: d.x - dir * W * 0.4, y: dk ? d.y - H + 10 : up ? d.y - H * 0.6 : d.y - H * 0.45 };
  hurt(ctx, d, dmg);
  ctx.fx.spawnDamageNumber({ x: at.x - 10, y: at.y - 20 }, dmg, up || dk);
  ctx.fx.playGunSound(dk ? 'stomp' : 'punch');
  spurt(state, at.x, at.y, up ? 16 : 8, -dir);
  if (d.fight !== 'on') return true;
  if (up) { shakeScreen(state, 10, 6); ctx.fx.spawnExplosion(at, '#FFD700', 15, 0, 12); playSound('crunch', 0.8, -6); }
  if (dk) {
    // (the stomp: the bounce and the power back, as off anything; chains of them are his to keep: no swatting him off
    // (stomp chains refunding power are the game's own, never capped))
    p.power = Math.min(POWER_CELLS, p.power + 1);
    ctx.fx.playGunSound('boing', 0.6);
    p.vel.y = -Math.abs(p.vel.y) * 0.5; p.vel.x *= 0.5;
    p.lockTimer = BOUNCE_FRAMES; p.recoiling = true;
    d.stomps = state.frame - d.stompAt < 100 ? d.stomps + 1 : 1; d.stompAt = state.frame;
  } else if (!up && !slide) {
    // (a shoulder charge into all that gut: it goes in, and it throws him back hard, a long way, off his feet: in this
    // room, likely into the fire behind him)
    recoilOff(ctx, RECOIL_MASS);
    // (a pushback, not a recoil: the recoil's drag would have him stop short)
    p.recoiling = false; p.isHarmlessPushback = true;
    p.vel.x = -dir * CHARGE_BOUNCE.x; p.vel.y = CHARGE_BOUNCE.y; p.isGrounded = false;
    p.pushbackTimer = Math.max(p.pushbackTimer, CHARGE_BOUNCE.lock); p.lockTimer = Math.max(p.lockTimer, CHARGE_BOUNCE.lock);
    d.bouncedAt = state.frame;
    playSound('boing', 0.9, -10); playSound('thud', 0.8, -6); shakeScreen(state, 8, 4);
    ctx.fx.spawnDamageNumber({ x: pc - 30, y: p.pos.y - 30 }, 'BOING!', true, '#FDE68A');
  } else recoilOff(ctx, RECOIL_MASS);
  return true;
};

/** Damage into him: his health, the flash, the stagger (enough at a go and he sits down), beaten. */
const hurt = (ctx: FrameContext, d: Demon, dmg: number) => {
  const { state } = ctx, f = state.frame;
  d.hp -= dmg; d.flash = 6;
  if (f - d.hurtAt > 240) d.hurtSince = 0;
  d.hurtSince += dmg; d.hurtAt = f;
  if (d.hp <= 0) { beaten(ctx, d); return; }
  if (d.hurtSince >= STAGGER_AT && d.st !== 'air' && d.st !== 'crouch' && d.st !== 'stagger' && d.st !== 'rise' && d.st !== 'swat') {
    d.st = 'stagger'; d.t = 0; d.vx = 0; d.hurtSince = 0;
    playSound('bellow', 0.8, -8); shakeScreen(state, 8, 4);
    demonSays(state, d, DEMON_HURT, false);
  }
};

/** The fire wall over the way in (between the arch's posts), and the far one. */
const startFight = (state: GameState, d: Demon) => {
  d.fight = 'on'; d.st = 'rise'; d.t = 0;
  // (the way in goes up in fire behind him: no backing out now)
  d.back = solid(state, BACK_X, GY - 1200, WALL_W, 1200, { hidden: true, tag: 'hell-lock' });
  const p = state.player;
  if (p.pos.x < BACK_X + WALL_W + 2) p.pos.x = BACK_X + WALL_W + 2;
  playSound('flame', 1, -6); playSound('ignite', 0.9, -4); shakeScreen(state, 8, 4);
  for (let i = 0; i < 24; i++) state.particles.push({ pos: { x: BACK_X + Math.random() * WALL_W, y: GY - Math.random() * 40 }, vel: { x: (Math.random() - 0.5) * 3, y: -3 - Math.random() * 6 }, life: 30, color: i % 2 ? '#F97316' : '#FDE047', size: 3 + Math.random() * 4 });
  meatheadSays(state, pick(MH_DEMON), true);
  demonSays(state, d, DEMON_INTRO, true);
  d.talkAt = state.frame + 900;
};

/** Beaten (satan.ts takes it from here): he plops down, the fork dropped, stuck in the floor; the fire wall's out. */
const beaten = (ctx: FrameContext, d: Demon) => {
  d.fight = 'beaten'; d.st = 'beaten'; d.t = 0; d.vx = 0; d.hp = 0; d.flash = 0;
  d.forkAt = d.x + d.facing * 80;
  if (d.e) { const i = ctx.state.enemies.indexOf(d.e); if (i >= 0) ctx.state.enemies.splice(i, 1); d.e = null; }
  if (d.lock) d.lock.x = -1e7;
  if (d.back) d.back.x = -1e7;
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
  if (d.fight === 'wait' && state.checkpoint >= DONE_CP) { Object.assign(d, gone()); return; }
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
  if (d.fight === 'wait') {
    d.t++;
    // (at his lunch: a bite every so often)
    if (d.t % 140 === 60 && Math.abs(d.x - p.pos.x) < 900) playSound('crunch', 0.5, -10);
    if (p.health > 0 && p.pos.x + p.width / 2 > ARENA_IN + 150 && p.pos.x < ARENA_OUT) startFight(state, d);
    place(d);
    return;
  }
  // (the fire walls: touch one and it burns)
  for (const w of [d.back, d.lock]) {
    if (!w || w.x < -1e6 || p.health <= 0 || p.invincibilityTimer > 0) continue;
    const hb = hurtbox(state);
    if (rectsOverlap(hb, { x: w.x - 12, y: GY - 300, w: w.w + 24, h: 300 })) {
      const away = p.pos.x + p.width / 2 < w.x + w.w / 2 ? -1 : 1;
      // (back out of it, off his feet, so he's not left standing in it)
      hurtPlayer(ctx, FIRE_WALL_DMG, state.frame - d.bouncedAt < 90 ? FIRE_BOUNCE : 'fire', { x: away * 9, y: -8 });
    }
  }
  think(ctx, d);
  // (grumbling, now and then)
  if (f > d.talkAt && p.health > 0) d.talkAt = f + (demonSays(state, d, DEMON_CHATTER, false) ? 600 + Math.random() * 300 : 90);
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
// Drawing (crude: boxes and blobs), world space, behind Meathead

const RED = '#B91C1C', RED_D = '#7F1D1D', RED_L = '#DC2626', BELLY_C = '#F2A08A', BONE = '#E7E5E4', IRON = '#3F3F46';

/** The fork, from his hand at (hx, hy) pointing `ang` (radians; 0 forward): its shaft, its three tines (hot: glowing). */
const fork = (c: Ctx, hx: number, hy: number, ang: number, glint: boolean, hot: number) => {
  c.save(); c.translate(hx, hy); c.rotate(ang);
  box(c, -50, -3, 220, 6, '#1C1917'); box(c, -50, -2, 220, 2, '#57534E');
  box(c, 166, -16, 6, 32, IRON);
  const tine = hot > 0 ? (hot > 0.6 ? '#FDE047' : '#FB923C') : '#A1A1AA';
  for (const y of [-16, -1, 13]) { box(c, 170, y, 30, 4, tine); c.fillStyle = tine; c.beginPath(); c.moveTo(200, y - 1); c.lineTo(208, y + 2); c.lineTo(200, y + 5); c.fill(); }
  if (glint) { box(c, 196, -20, 3, 44, '#FFFFFF'); box(c, 186, 0, 24, 3, '#FFFFFF'); }
  c.restore();
};

const drawBody = (c: Ctx, d: Demon, f: number) => {
  const st = d.st, t = d.t;
  const squat = st === 'crouch' ? Math.min(1, t / 12) * 22 : st === 'sweepWind' || st === 'sweep' ? 14 : st === 'land' ? Math.max(0, 18 - t) : st === 'stagger' || st === 'beaten' || st === 'sink' ? 30 : 0;
  const breathe = Math.sin(f * 0.08) * 2, wobble = st === 'crouch' ? Math.sin(t * 0.9) * 4 : 0;
  const walk = st === 'walk' && Math.abs(d.vx) > 0.1 ? Math.sin(f * 0.2) * 5 : 0;
  const flash = d.flash > 0;
  const col = flash ? '#FECACA' : RED;
  // (tail, the tiny useless wings)
  c.strokeStyle = RED_D; c.lineWidth = 4; c.beginPath(); c.moveTo(-50, -50 + squat); c.quadraticCurveTo(-95, -40, -90, -90 + Math.sin(f * 0.1) * 8); c.stroke();
  c.fillStyle = RED_D; c.beginPath(); c.moveTo(-90, -98 + Math.sin(f * 0.1) * 8); c.lineTo(-82, -86 + Math.sin(f * 0.1) * 8); c.lineTo(-98, -84 + Math.sin(f * 0.1) * 8); c.fill();
  const flap = Math.floor(f / 12) % 2 ? -4 : 0;
  c.fillStyle = '#450A0A';
  c.beginPath(); c.moveTo(-30, -140 + squat); c.lineTo(-62, -168 + squat + flap); c.lineTo(-48, -134 + squat); c.fill();
  // (legs: stubby, goat-kneed, hooves)
  if (st !== 'beaten' && st !== 'sink') {
    box(c, -40 + walk, -36, 26, 36 - squat * 0.3, RED_D); box(c, 14 - walk, -36, 26, 36 - squat * 0.3, RED_D);
    box(c, -42 + walk, -8, 30, 8, '#1C1917'); box(c, 12 - walk, -8, 30, 8, '#1C1917');
  } else {
    // (sat down, legs out in front)
    box(c, -10, -22, 70, 20, RED_D); box(c, 56, -28, 12, 26, '#1C1917');
  }
  // (the gut: huge, banded, the pale belly, the button)
  const by = -88 + squat;
  c.fillStyle = col; c.beginPath(); c.ellipse(4, by, 66 + wobble, 58 + breathe, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = flash ? '#FECACA' : RED_D; c.beginPath(); c.ellipse(4, by + 30, 58 + wobble, 22, 0, 0, Math.PI); c.fill();
  c.fillStyle = flash ? '#FFF1F2' : BELLY_C; c.beginPath(); c.ellipse(16, by + 6, 42 + wobble, 40 + breathe, 0, 0, Math.PI * 2); c.fill();
  box(c, 20, by + 12, 5, 4, '#7F1D1D');
  // (the hair on it, a few)
  for (const [x, y] of [[0, -14], [26, -20], [34, 2], [6, 20]]) box(c, 16 + x, by + y, 2, 5, '#7F1D1D');
  // (shoulders and the head: small for him, two chins, horns; bored eyes, lids half down)
  const hy = -170 + squat;
  c.fillStyle = col; c.beginPath(); c.ellipse(4, -136 + squat, 50, 20, 0, 0, Math.PI * 2); c.fill();
  box(c, -16, hy, 44, 40, col); box(c, -16, hy, 44, 4, RED_L);
  box(c, -12, hy + 36, 40, 10, col); box(c, -6, hy + 44, 30, 6, RED_D);
  c.fillStyle = BONE;
  c.beginPath(); c.moveTo(-12, hy + 2); c.lineTo(-20, hy - 16); c.lineTo(-4, hy); c.fill();
  c.beginPath(); c.moveTo(18, hy + 2); c.lineTo(26, hy - 16); c.lineTo(10, hy); c.fill();
  const lid = st === 'stagger' || st === 'beaten' ? 3 : st.endsWith('Wind') || st === 'crouch' ? 2 : 5;
  box(c, 6, hy + 12, 9, 7, '#FEF9C3'); box(c, 19, hy + 12, 8, 7, '#FEF9C3');
  box(c, 11, hy + 15, 3, 3, '#000000'); box(c, 24, hy + 15, 3, 3, '#000000');
  box(c, 5, hy + 11, 11, lid, RED_D); box(c, 18, hy + 11, 10, lid, RED_D);
  // (the mouth: a bored frown; open, talking or whining or eating)
  const talking = !!d.said || st === 'lounge';
  const open = talking && Math.floor(f / 6) % 2 ? 6 : 2;
  box(c, 10, hy + 26, 16, open, '#450A0A');
  box(c, 8, hy + 25, 3, 2, RED_D); box(c, 25, hy + 25, 3, 2, RED_D);
  // (a goatee, of course)
  box(c, 14, hy + 32 + open, 8, 8, '#1C1917');
  return { squat, hy };
};

export const drawDemon = (c: Ctx, state: GameState) => {
  const d = demonOf(state);
  if (!d) return;
  const f = state.frame;
  // (the fork he dropped, stuck in the floor: still there on the way back)
  if (d.forkAt !== null) {
    // (handle up, tines in the floor, leaning)
    fork(c, d.forkAt, GY - 190, Math.PI / 2 - 0.2, false, 0);
  }
  if (d.fight === 'gone') return;
  if (d.x < state.camera.x - 400 || d.x > state.camera.x + CANVAS_WIDTH + 400) return;
  const st = d.st, t = d.t;
  // (his shadow where he'll come down)
  if (st === 'air') { const k = Math.max(0.2, 1 - (GY - d.y) / 500); c.fillStyle = `rgba(0, 0, 0, ${0.5 * k})`; c.beginPath(); c.ellipse(d.jumpTo, GY - 2, 70 * k + 10, 7, 0, 0, Math.PI * 2); c.fill(); }
  // (the slam's zone, glowing on the floor and up off it: get out of it)
  if (st === 'slamWind') {
    const a = 0.2 + 0.25 * (Math.sin(t * 0.5) * 0.5 + 0.5);
    const z = ahead(d, SLAM_NEAR, SLAM_FAR, 230, 0);
    c.fillStyle = `rgba(239, 68, 68, ${a * 0.35})`; c.fillRect(z.x, z.y, z.w, z.h);
    c.fillStyle = `rgba(253, 224, 71, ${a + 0.2})`; c.fillRect(z.x, GY - 4, z.w, 4);
  }
  // (sinking away: clipped at the floor, lava round him)
  c.save();
  if (st === 'sink') {
    c.beginPath(); c.rect(d.x - 200, d.y - 400, 400, 400); c.clip();
    c.translate(0, d.sink * 200);
  }
  c.translate(Math.round(d.x), Math.round(d.y));
  c.scale(d.facing, 1);
  // The fork behind him (the windups that hold it back), then him, then the fork in front
  const { squat } = drawBodyAndFork(c, d, f, st, t);
  void squat;
  c.restore();
  if (st === 'sink') {
    const r = 80 + Math.sin(f * 0.2) * 6;
    c.fillStyle = '#F97316'; c.beginPath(); c.ellipse(d.x, GY, r, 8, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FDE047'; c.beginPath(); c.ellipse(d.x, GY - 1, r * 0.6, 4, 0, 0, Math.PI * 2); c.fill();
  }
  // At his lunch: the soul in his fist, the wisps drifting over to him
  if (st === 'lounge') {
    for (let i = 0; i < 3; i++) {
      const k = ((f + i * 50) % 150) / 150, sx = d.x + 260 * (1 - k) * (i % 2 ? 1 : -1) * 0.7, sy = GY - 40 - k * 120 - Math.sin(k * 6 + i) * 20;
      c.fillStyle = `rgba(165, 243, 252, ${0.3 + 0.4 * (1 - k)})`; c.beginPath(); c.arc(sx, sy, 6, 0, Math.PI * 2); c.fill();
      box(c, sx - 1, sy - 2, 2, 2, '#0E7490'); box(c, sx + 2, sy - 2, 2, 2, '#0E7490');
    }
  }
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
    case 'swatWind': { const k = Math.min(1, t / SWAT_WIND); hx = 20 - k * 30; hy = -150 - k * 20; ang = -1.35 - k * 1.2; glint = t % 6 < 3; hot = k; break; }
    case 'swat': { const k = Math.min(1, t / 5); hx = -10 + k * 30; hy = -170; ang = -2.55 + k * 2.2; hot = 1; break; }
    case 'beaten': case 'sink': hx = 0; hy = -9999; break;
  }
  const showFork = hy > -9000;
  if (showFork && behind) fork(c, hx, hy, ang, glint, hot);
  const r = drawBody(c, d, f);
  if (showFork && !behind) fork(c, hx, hy, ang, glint, hot);
  // (his arm, to the fork; at his lunch, the soul in his fist)
  if (st === 'lounge') {
    box(c, 30, -120, 40, 14, RED);
    c.fillStyle = '#A5F3FC'; c.beginPath(); c.ellipse(78, -118, 12, 8, 0, 0, Math.PI * 2); c.fill();
    box(c, 74, -122, 2, 2, '#0E7490'); box(c, 80, -122, 2, 2, '#0E7490'); box(c, 76, -116, 4, 2, '#0E7490');
  } else if (showFork) {
    c.strokeStyle = d.flash > 0 ? '#FECACA' : RED; c.lineWidth = 13; c.beginPath(); c.moveTo(24, -130 + r.squat); c.lineTo(hx, hy); c.stroke();
    box(c, hx - 7, hy - 7, 14, 14, RED_D);
  } else {
    // (beaten: arms folded, sulking)
    box(c, -24, -120 + r.squat, 64, 14, RED);
  }
  return r;
};

/** What he's saying, over his head (only while he's saying it). */
export const drawDemonSaid = (c: Ctx, state: GameState) => {
  const d = demonOf(state);
  if (!d?.said || d.fight === 'gone') return;
  saidOver(c, d.said.text, d.x, d.y - H - 50 + d.sink * 200, '#FCA5A5', 230);
};

/** The walls of fire across his pit's two ways out (the way in only once he's roused), while he's at it. */
export const drawFireWall = (c: Ctx, state: GameState) => {
  const d = demonOf(state), f = state.frame;
  if (!d) return;
  for (const w of [d.back, d.lock]) {
    if (!w || w.x < -1e6) continue;
    const x = w.x;
    if (x < state.camera.x - 100 || x > state.camera.x + CANVAS_WIDTH + 100) continue;
    c.fillStyle = 'rgba(249, 115, 22, 0.18)'; c.fillRect(x - 30, GY - 300, w.w + 60, 300);
    for (let i = 0; i < 8; i++) {
      const hgt = 260 + Math.sin(f * 0.3 + i + x) * 30 - i * 14, ww = 34 - i * 3;
      box(c, x + w.w / 2 - ww / 2 + Math.sin(f * 0.5 + i * 2) * 3, GY - hgt, ww, hgt, ['#7F1D1D', '#B91C1C', '#DC2626', '#EA580C', '#F97316', '#FB923C', '#FDBA74', '#FEF3C7'][i]);
    }
    for (let k = 0; k < 3; k++) { const tx = x + 4 + k * 11, th = 20 + Math.sin(f * 0.7 + k + x) * 10; c.fillStyle = k === 1 ? '#FDE047' : '#F97316'; c.beginPath(); c.moveTo(tx - 5, GY - 230); c.lineTo(tx, GY - 250 - th); c.lineTo(tx + 5, GY - 230); c.fill(); }
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
registerHurtLines(FIRE_BOUNCE, HURT_BOUNCE_FIRE, DEATH_BOUNCE_FIRE);
registerDeathKind(FIRE_BOUNCE, 'burnt');
