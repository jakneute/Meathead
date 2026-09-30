// The Eye of the Storm: the mid-boss at the top of the hurricane. A giant,
// bloodshot human eyeball hanging dead centre in the storm, never moving, its
// pupil following you about. The Eye itself is harmless (land on it and you just
// bounce off it); what hurts is all the junk the storm flings at you from off
// screen (a warning flashes at the edge first). The junk you stand on (up through it from below, but no dropping
// down through it: that's straight into the storm) wears out
// under you: every moment you're stood on a piece takes some out of it (in the
// air it doesn't), none of it comes back, it wobbles once it's nearly done, and
// once it's gone it's gone: dawdle and you'll run out of places to stand. It
// blinks when it's taken too much (shots ping off the lid). Any of his power moves
// into it (a charge, a slide, an uppercut, a dive kick) hurts it: it goes red and bawls.
//
// Mid-boss rules: no invincibility, lots of health, immune to status effects.
// Kill it and it dies a different grotesque way depending on what you used, and
// the storm dies with it.

import type { Block, Enemy, Projectile, WeaponType } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import { BOSS_CHARGE_DAMAGE, BOSS_UPPERCUT_DAMAGE, BOSS_DIVEKICK_DAMAGE } from '../../../constants';
import { midBossProjectileDamage } from '../../combat/midBoss';
import { hurtPlayer } from '../../bosses/shared';
import { shakeScreen } from '../../core/state';
import { playSound } from '../../platform/audio';
import { rectsOverlap, boundsOf } from '../../core/utils';
import { killPlayer } from '../../player/player';
import { KIND_STATS } from '../../enemies/kinds';
import { COURSE, CP } from './course';

export const EYE_HP = KIND_STATS.eye.hp;
/** The Eye's centre and radius (arena coordinates). */
export const EYE_CX = 400, EYE_CY = 262, EYE_R = 78;

type PlatState = 'solid' | 'shake' | 'fall' | 'gone';
/** (wear: frames he's stood on it, less what it's had to settle since) */
export interface EyePlat { block: Block; home: { x: number; y: number; w: number }; state: PlatState; t: number; high: boolean; wear: number; /** He's stood on it right now. */ under?: boolean }
export type EyeAttack = 'idle' | 'blink';
/** Something the storm's flinging at you: a warning at the screen edge (warn > 0), then it flies across. */
export interface FlyingJunk { look: string; side: 1 | -1; x: number; y: number; vx: number; vy: number; rot: number; warn: number; size: number }

export interface EyeFight {
  phase: 'waiting' | 'intro' | 'fight' | 'dead' | 'done';
  t: number;
  eye: Enemy | null;
  hpFlash: number;
  plats: EyePlat[];
  attack: EyeAttack;
  attackT: number;
  /** What it's looking at (world coords). */
  aim: { x: number; y: number };
  junk: FlyingJunk[];
  junkT: number;
  /** Damage taken lately (enough and it blinks). */
  recentDamage: number;
  walls: Block[];
  corpse: { weapon: WeaponType; t0: number } | null;
  /** Frames left of it red and crying (charged in the eyeball). */
  sore: number;
}

// Arena layout (relative to the arena's top left): high pieces level with the Eye, low ones below
// (each high piece hangs off to the side of the low one under it, so you can jump up onto it)
const PLATS = [
  { x: 20, y: 480, w: 170, high: false }, { x: 150, y: 360, w: 140, high: true }, { x: 290, y: 540, w: 220, high: false },
  { x: 610, y: 480, w: 170, high: false }, { x: 510, y: 360, w: 140, high: true },
];
/** How much each piece can take (frames stood on it, all told): past the first it wobbles, at the second it goes. Nothing wears it off him in the air, and nothing puts it back. */
const WEAR_WOBBLE = 110, WEAR_FALL = 200;
export const EYE_WEAR_FALL = WEAR_FALL;
const JUNK_DAMAGE = 12, JUNK_WARN = 45;
const JUNK_LOOKS = ['chair', 'flamingo', 'cart', 'sign', 'tire', 'cow', 'jetski', 'grill'];
/** How big each is (drawn about 44x36 at 1): life size next to him, near enough. A whole cow's a big thing to have coming at you. */
const JUNK_SIZE: Record<string, number> = { chair: 1.2, flamingo: 1, cart: 1.5, sign: 1.4, tire: 1.1, cow: 2.8, jetski: 2.1, grill: 1.3 };
const BLINK_AT = 170, BLINK_FRAMES = 75;

const A = () => COURSE.eye;

export const createEyeFight = (state: GameState, startedAt: number): EyeFight => {
  const a = A();
  const plats = PLATS.map((p, i): EyePlat => ({
    block: { x: a.x + p.x, y: a.y + p.y, w: p.w, h: 16, type: 'platform', hidden: true, oneWay: true, noDropThrough: true, tag: `eyeplat-${i}` },
    home: { x: a.x + p.x, y: a.y + p.y, w: p.w }, state: 'solid', t: 0, high: p.high, wear: 0,
  }));
  state.blocks.push(...plats.map(p => p.block));
  const walls: Block[] = [
    { x: a.x - 40, y: a.y - 800, w: 40, h: 2000, type: 'wall', hidden: true, tag: 'eye-wall' },
    { x: a.x + 800, y: a.y - 800, w: 40, h: 2000, type: 'wall', hidden: true, tag: 'eye-wall' },
  ];
  state.blocks.push(...walls);
  const done = startedAt > CP.EYE;
  return { phase: done ? 'done' : 'waiting', t: 0, eye: null, hpFlash: 0, plats, attack: 'idle', attackT: 0, aim: { x: 0, y: 0 }, junk: [], junkT: 60, recentDamage: 0, walls, corpse: null, sore: 0 };
};

export const inEyeArena = (x: number) => x > A().x - 400 && x < A().x + 1200;

const makeEye = (): Enemy => {
  const a = A();
  const size = EYE_R * 2;
  return {
    id: 'eye', kind: 'eye', pos: { x: a.x + EYE_CX - EYE_R, y: a.y + EYE_CY - EYE_R }, vel: { x: 0, y: 0 }, width: size, height: size,
    health: EYE_HP, maxHealth: EYE_HP, type: 'enemy', enemyType: 'tank', behavior: 'custom',
    patrolRange: 0, initialX: a.x + EYE_CX, shootTimer: 0, aiState: 'idle', aiTimer: 0, facing: -1, hitFlash: 0,
  };
};

/** Runs the arena (the fight, the pieces giving way). Calls onDead once the death's played out. */
export const updateEyeFight = (ctx: FrameContext, f: EyeFight, onDead: () => void) => {
  const { state } = ctx;
  const { player } = state;
  const a = A();
  f.t++;
  if (f.hpFlash > 0) f.hpFlash--;
  if (!inEyeArena(player.pos.x)) return;
  if (f.phase === 'waiting') {
    f.phase = 'intro'; f.t = 0;
    f.eye = makeEye();
    state.enemies.push(f.eye);
    playSound('thunder');
  }
  if (f.phase === 'intro' || f.phase === 'fight' || f.phase === 'dead') state.cameraOverride = { x: a.x, y: a.y };
  if (f.phase === 'intro' && f.t > 90) { f.phase = 'fight'; f.t = 0; }
  updatePlats(ctx, f);
  updateJunk(ctx, f);
  // Won: nothing can kill him now (if he was mid-fall, the storm holds him till it clears)
  if (f.phase === 'dead' || f.phase === 'done') {
    player.invincibilityTimer = Math.max(player.invincibilityTimer, 2);
    if (player.pos.y > a.y + 640) { player.pos.y = a.y + 640; player.vel.y = 0; }
  }
  // Off the junk and into the storm
  else if (state.deathTimer <= 0 && player.pos.y > a.y + 700) {
    const lines = ['SUCKED INTO THE STORM', 'CARRIED OFF BY THE WIND', 'CATEGORY 5 DEATH'];
    killPlayer(ctx, lines[Math.floor(Math.random() * lines.length)]);
  }
  if (f.phase === 'dead' && f.corpse && state.frame - f.corpse.t0 > 170) { f.phase = 'done'; onDead(); }
};

const updatePlats = (ctx: FrameContext, f: EyeFight) => {
  const { state } = ctx;
  const { player } = state;
  for (const p of f.plats) {
    p.t++;
    const b = p.block;
    const on = player.isGrounded && player.pos.x + player.width > b.x && player.pos.x < b.x + b.w && Math.abs(player.pos.y + player.height - b.y) < 4;
    p.under = on;
    // Worn down while he stands on it (only while the fight's on); off it (in the air) it just stops, and the damage
    // stays: it doesn't settle back
    if (f.phase === 'fight' && (p.state === 'solid' || p.state === 'shake')) {
      if (on) p.wear++;
      if (p.state === 'solid' && p.wear > WEAR_WOBBLE) { p.state = 'shake'; p.t = 0; playSound('crack'); }
      else if (p.state === 'shake' && p.wear >= WEAR_FALL) { p.state = 'fall'; p.t = 0; state.blocks = state.blocks.filter(x => x !== b); shakeScreen(state, 8, 3); }
    }
    switch (p.state) {
      case 'shake': {
        // Nearly done: it wobbles while he's stood on it (harder the closer it is to going), and sits still when he's off
        const k = (p.wear - WEAR_WOBBLE) / (WEAR_FALL - WEAR_WOBBLE);
        const amp = 1 + k * 3;
        b.x = on ? p.home.x + (p.t % 4 < 2 ? -amp : amp) : p.home.x;
        break;
      }
      case 'fall':
        // (gone for good: nothing blows in to replace it)
        b.y += 2 + p.t * 0.5;
        if (p.t > 50) { p.state = 'gone'; p.t = 0; }
        break;
      case 'gone':
        break;
      default:
        b.x = p.home.x;
    }
  }
};

/** The storm flinging junk at him from off screen: a flashing warning at the edge, then it comes flying across. */
const updateJunk = (ctx: FrameContext, f: EyeFight) => {
  const { state } = ctx;
  const { player } = state;
  const a = A();
  if (f.phase === 'fight') {
    // The more it's hurt, the worse the storm gets: more often, faster, two at a time past halfway and three right at the end
    const hurt = f.eye ? 1 - f.eye.health / EYE_HP : 0;
    if (--f.junkT <= 0) {
      f.junkT = Math.round(125 - hurt * 55 + Math.random() * 30);
      const count = 1 + (hurt > 0.5 ? 1 : 0) + (hurt > 0.85 ? 1 : 0);
      for (let k = 0; k < count; k++) {
        const side: 1 | -1 = Math.random() < 0.5 ? -1 : 1;
        // (the first at him, the rest above and below, so there's a gap to find)
        const py = player.pos.y + player.height / 2 + (k === 0 ? (Math.random() - 0.5) * 60 : (k === 1 ? -1 : 1) * (90 + Math.random() * 60));
        const y = Math.max(a.y + 60, Math.min(a.y + 560, py));
        const look = JUNK_LOOKS[Math.floor(Math.random() * JUNK_LOOKS.length)], size = JUNK_SIZE[look] ?? 1;
        f.junk.push({ look, side, x: side < 0 ? a.x - 40 - 30 * size : a.x + 840 + 30 * size, y, vx: -side * (6.5 + hurt * 3 + Math.random() * 2), vy: 0, rot: 0, warn: JUNK_WARN + k * 12, size });
      }
    }
  } else f.junk = [];
  f.junk = f.junk.filter(j => {
    if (j.warn > 0) { j.warn--; return true; }
    j.x += j.vx; j.vy += 0.015; j.y += j.vy; j.rot += (0.2 / j.size) * Math.sign(j.vx);
    const box = { x: j.x - 20 * j.size, y: j.y - 16 * j.size, w: 40 * j.size, h: 32 * j.size };
    if (player.invincibilityTimer <= 0 && rectsOverlap(box, boundsOf(player))) {
      // (barely a shove: a real one would knock him off the junk into the storm)
      hurtPlayer(ctx, JUNK_DAMAGE, 'junk', { x: Math.sign(j.vx) * 2, y: -4 });
      ctx.fx.spawnExplosion({ x: j.x, y: j.y }, '#A8A29E', 10, 0, 6);
      return false;
    }
    // Shoot it down
    const shot = state.projectiles.find(p => p.owner === 'player' && p.health > 0 && rectsOverlap(box, { x: p.pos.x, y: p.pos.y, w: p.width, h: p.height }));
    if (shot) {
      if (!shot.isTsunami && !shot.isBoulder) shot.health = 0;
      if (j.look === 'cow') {
        // Shoot the flying cow and it goes off like a bomb full of beef
        ctx.fx.spawnDeathShower({ x: j.x, y: j.y }, Math.sign(j.vx), 3.5, true, 120);
        for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: j.x, y: j.y }, vel: { x: (Math.random() - 0.5) * 16, y: -3 - Math.random() * 9 }, life: 50 + Math.random() * 30, color: i % 3 ? '#F8FAFC' : '#111827', size: 6 + Math.random() * 7 });
        ctx.fx.spawnDamageNumber({ x: j.x - 50, y: j.y - 60 }, 'MOO-SPLOSION!', true, '#EF4444'); ctx.fx.announceKill('MOO-SPLOSION!');
        shakeScreen(state, 14, 7);
        playSound('splat');
      } else ctx.fx.spawnExplosion({ x: j.x, y: j.y }, '#A8A29E', 10, 0, 6);
      return false;
    }
    return j.x > a.x - 150 && j.x < a.x + 950;
  });
};

// ---------------------------------------------------------------------------
// The Eye itself (in place of the generic enemy code)
// ---------------------------------------------------------------------------

const pupilPos = (f: EyeFight) => {
  // The pupil sits toward whatever it's looking at
  const a = A(), cx = a.x + EYE_CX, cy = a.y + EYE_CY;
  const dx = f.aim.x - cx, dy = f.aim.y - cy, len = Math.hypot(dx, dy) || 1;
  return { x: cx + (dx / len) * EYE_R * 0.45, y: cy + (dy / len) * EYE_R * 0.45 };
};
export const eyePupil = pupilPos;

export const updateEye = (ctx: FrameContext, e: Enemy, f: EyeFight): boolean => {
  const { state } = ctx;
  const { player } = state;
  // Nothing takes: no freezing, burning, oiling, sticking needles, tasing
  e.frozenTimer = 0; e.pauseTimer = 0; e.isOnFire = false; e.fireTimer = 0; e.isOiled = false; e.oiledTimer = 0;
  e.sludgeTimer = 0; e.needleCount = 0; e.needleOffsets = []; e.dotTimer = 0; e.isTased = false; e.vel = { x: 0, y: 0 };
  if (e.hitFlash && e.hitFlash > 0) e.hitFlash--;
  if (f.recentDamage > 0) f.recentDamage = Math.max(0, f.recentDamage - 1.2);
  if (f.sore > 0) {
    f.sore--;
    // Bawling: tears streaming off the lower lid (just tears: these don't scald)
    if (state.frame % 3 === 0) {
      const a = A(), side = state.frame % 6 === 0 ? -1 : 1;
      state.particles.push({ pos: { x: a.x + EYE_CX + side * EYE_R * (0.45 + Math.random() * 0.3), y: a.y + EYE_CY + EYE_R * 0.75 }, vel: { x: side * (0.5 + Math.random()), y: 1 + Math.random() * 2 }, life: 45, color: '#7DD3FC', size: 3 + Math.random() * 2 });
    }
  }
  if (e.health <= 0 || e.isBlownAway) { killEye(ctx, e, f); return false; }
  if (f.phase !== 'fight') { f.aim = { x: player.pos.x + player.width / 2, y: player.pos.y + 30 }; return true; }

  // It just watches you (and blinks when it's had enough)
  const target = { x: player.pos.x + player.width / 2, y: player.pos.y + player.height / 2 };
  f.attackT++;
  f.aim.x += (target.x - f.aim.x) * 0.1; f.aim.y += (target.y - f.aim.y) * 0.1;
  if (f.attack === 'blink' && f.attackT > BLINK_FRAMES) { f.attack = 'idle'; f.attackT = 0; f.recentDamage = 0; }
  // It's harmless to touch: land on it and you bounce off; any power move into it (a charge, a slide, an uppercut,
  // a dive kick) hurts it, and it goes red and bawls, and he rebounds off it
  const a = A();
  const px = player.pos.x + player.width / 2, py = player.pos.y + player.height / 2;
  const touching = Math.hypot(px - (a.x + EYE_CX), py - (a.y + EYE_CY)) < EYE_R + 20;
  const move = player.isDivekicking ? 'divekick' : player.isUppercutting ? 'uppercut' : player.isCharging ? 'charge' : null;
  if (touching && move) {
    const dir = px < a.x + EYE_CX ? -1 : 1;
    if (f.attack !== 'blink') {
      const dmg = move === 'divekick' ? BOSS_DIVEKICK_DAMAGE : move === 'uppercut' ? BOSS_UPPERCUT_DAMAGE : BOSS_CHARGE_DAMAGE;
      e.health -= dmg;
      e.hitFlash = 5; f.hpFlash = 8;
      f.recentDamage += dmg;
      ctx.fx.spawnDamageNumber({ x: px, y: py - 30 }, dmg);
      const bawl = move === 'divekick' ? 'RIGHT IN THE EYE!' : 'WAAAHH!';
      ctx.fx.spawnDamageNumber({ x: a.x + EYE_CX - 40, y: a.y + EYE_CY - EYE_R - 20 }, bawl, true, '#7DD3FC');
      f.sore = 200;
      shakeScreen(state, 10, 6);
      playSound('roar', 0.3, 4); // (a sob more than a roar: quieter, higher)
    }
    // (off it he goes, whichever way he came in)
    player.isCharging = false; player.isSliding = false; player.isUppercutting = false; player.isDivekicking = false;
    if (move === 'divekick') { player.vel.x = dir * 5; player.vel.y = -12; }
    else if (move === 'uppercut') { player.vel.x = dir * 7; player.vel.y = Math.max(player.vel.y, 2); }
    else { player.vel.x = dir * 9; player.vel.y = Math.min(player.vel.y, -6); }
  } else if (touching && player.vel.y > 0 && player.pos.y + player.height < a.y + EYE_CY) {
    // Boing (just a little one)
    player.vel.y = -9;
    player.isDivekicking = false;
    ctx.fx.spawnDamageNumber({ x: px - 16, y: player.pos.y - 10 }, 'BOING!', false, '#FCA5A5');
  }
  return true;
};

/** A shot hit it: damage (or a ping off the closed lid). No knockback, no status effects, no invincibility. */
export const hitEye = (ctx: FrameContext, e: Enemy, p: Projectile, f: EyeFight): boolean | 'miss' => {
  const { fx, state } = ctx;
  // Only the round bit counts
  const a = A();
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  // (the corners of its box: the shot flies on past)
  if (Math.hypot(cx - (a.x + EYE_CX), cy - (a.y + EYE_CY)) > EYE_R + Math.max(p.width, p.height) / 2) return 'miss';
  if (f.attack === 'blink' || f.phase !== 'fight') {
    fx.spawnExplosion({ x: cx, y: cy }, '#FCA5A5', 6, 0, 4);
    if (state.frame % 6 === 0) fx.spawnDamageNumber({ x: cx - 20, y: cy - 20 }, 'BLINK!', false, '#FCA5A5');
    return true;
  }
  const dmg = midBossProjectileDamage(p);
  if (dmg <= 0) return true;
  e.health -= dmg;
  e.hitFlash = 5;
  f.hpFlash = 8;
  f.recentDamage += dmg;
  fx.spawnDamageNumber({ x: cx, y: cy - 10 }, Math.round(dmg));
  for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: cx, y: cy }, vel: { x: -Math.sign(p.vel.x || 1) * Math.random() * 4, y: -Math.random() * 3 }, life: 40, color: i % 2 ? '#B91C1C' : '#F8FAFC', size: 3 + Math.random() * 3 });
  // Enough and it squeezes shut for a moment
  if (f.recentDamage > BLINK_AT) { f.attack = 'blink'; f.attackT = 0; }
  return true;
};

const killEye = (ctx: FrameContext, e: Enemy, f: EyeFight) => {
  const { state, fx } = ctx;
  const weapon: WeaponType = state.player.currentWeapon;
  f.phase = 'dead';
  f.corpse = { weapon, t0: state.frame };
  f.eye = null;
  f.junk = [];
  state.stageMemo.eyeWeapon = weapon;
  fx.spawnDeathShower({ x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2 }, 0, 4, true, 140);
  shakeScreen(state, 40, 10);
  playSound('thunder');
  fx.spawnDamageNumber({ x: e.pos.x + 20, y: e.pos.y - 30 }, 'THE EYE IS CLOSED!', true, '#FACC15');
  fx.announceKill('THE EYE IS CLOSED!');
  state.player.killSatisfactionTimer = 90;
};
