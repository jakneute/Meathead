// The Eye of the Storm: the mid-boss at the top of the hurricane. A giant,
// bloodshot human eyeball hanging dead centre in the storm, never moving, its
// pupil following you about. The Eye itself is harmless (land on it and you just
// bounce off it); what hurts is all the junk the storm flings at you from off
// screen (a warning flashes at the edge first). The junk you stand on gives way
// if you stay on one piece too long (it wobbles first), and once it's gone it's
// gone: dawdle and you'll run out of places to stand. It blinks when it's taken
// too much (shots ping off the lid). Shoulder charge into it and it goes red and
// bawls.
//
// Mid-boss rules: no invincibility, lots of health, immune to status effects.
// Kill it and it dies a different grotesque way depending on what you used, and
// the storm dies with it.

import type { Block, Enemy, Projectile, WeaponType } from '../../../types';
import type { FrameContext } from '../../context';
import type { GameState } from '../../state';
import { BOSS_CHARGE_DAMAGE, BOULDER_DAMAGE_PER_SPEED, GML_SCALE } from '../../../constants';
import { hurtPlayer } from '../../bosses/shared';
import { shakeScreen } from '../../state';
import { playSound } from '../../audio';
import { rectsOverlap, boundsOf } from '../../utils';
import { killPlayer } from '../../systems/player';
import { KIND_STATS } from '../../systems/kinds';
import { COURSE, CP } from './course';

export const EYE_HP = KIND_STATS.eye.hp;
/** The Eye's centre and radius (arena coordinates). */
export const EYE_CX = 400, EYE_CY = 262, EYE_R = 78;

type PlatState = 'solid' | 'shake' | 'fall' | 'gone';
/** (wear: frames he's stood on it, less what it's had to settle since) */
export interface EyePlat { block: Block; home: { x: number; y: number; w: number }; state: PlatState; t: number; high: boolean; wear: number }
export type EyeAttack = 'idle' | 'blink';
/** Something the storm's flinging at you: a warning at the screen edge (warn > 0), then it flies across. */
export interface FlyingJunk { look: string; side: 1 | -1; x: number; y: number; vx: number; vy: number; rot: number; warn: number }

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
/** Stand on one piece this long and it starts to wobble; this long and it goes (it settles again at half the rate when you're off it). */
const WEAR_WOBBLE = 110, WEAR_FALL = 200;
const JUNK_DAMAGE = 12, JUNK_WARN = 45;
const JUNK_LOOKS = ['chair', 'flamingo', 'cart', 'sign', 'tire', 'cow', 'jetski', 'grill'];
const BLINK_AT = 170, BLINK_FRAMES = 75;

const A = () => COURSE.eye;

export const createEyeFight = (state: GameState, startedAt: number): EyeFight => {
  const a = A();
  const plats = PLATS.map((p, i): EyePlat => ({
    block: { x: a.x + p.x, y: a.y + p.y, w: p.w, h: 16, type: 'platform', hidden: true, oneWay: true, tag: `eyeplat-${i}` },
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
    const lines = ['SUCKED INTO THE STORM', 'GONE WITH THE WIND', 'CATEGORY 5 DEATH'];
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
    // Worn down while he stands on it (only while the fight's on), settling slowly when he's off it
    if (f.phase === 'fight' && (p.state === 'solid' || p.state === 'shake')) {
      p.wear = on ? p.wear + 1 : Math.max(0, p.wear - 0.5);
      if (p.state === 'solid' && p.wear > WEAR_WOBBLE) { p.state = 'shake'; p.t = 0; playSound('ice'); }
      else if (p.state === 'shake' && p.wear <= WEAR_WOBBLE) { p.state = 'solid'; p.t = 0; }
      else if (p.state === 'shake' && p.wear >= WEAR_FALL) { p.state = 'fall'; p.t = 0; state.blocks = state.blocks.filter(x => x !== b); shakeScreen(state, 8, 3); }
    }
    switch (p.state) {
      case 'shake': {
        // Wobbling, harder the closer it is to going
        const k = (p.wear - WEAR_WOBBLE) / (WEAR_FALL - WEAR_WOBBLE);
        const amp = 1 + k * 3;
        b.x = p.home.x + (p.t % 4 < 2 ? -amp : amp);
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
    const angry = !!f.eye && f.eye.health < EYE_HP * 0.5;
    if (--f.junkT <= 0) {
      f.junkT = (angry ? 70 : 105) + Math.floor(Math.random() * 30);
      const side: 1 | -1 = Math.random() < 0.5 ? -1 : 1;
      const py = player.pos.y + player.height / 2 + (Math.random() - 0.5) * 60;
      const y = Math.max(a.y + 60, Math.min(a.y + 560, py));
      f.junk.push({ look: JUNK_LOOKS[Math.floor(Math.random() * JUNK_LOOKS.length)], side, x: side < 0 ? a.x - 70 : a.x + 870, y, vx: -side * (7 + Math.random() * 2.5), vy: 0, rot: 0, warn: JUNK_WARN });
    }
  } else f.junk = [];
  f.junk = f.junk.filter(j => {
    if (j.warn > 0) { j.warn--; return true; }
    j.x += j.vx; j.vy += 0.015; j.y += j.vy; j.rot += 0.2 * Math.sign(j.vx);
    const box = { x: j.x - 22, y: j.y - 18, w: 44, h: 36 };
    if (player.invincibilityTimer <= 0 && rectsOverlap(box, boundsOf(player))) {
      // (barely a shove: a real one would knock him off the junk into the storm)
      hurtPlayer(ctx, JUNK_DAMAGE, 'eye', { x: Math.sign(j.vx) * 2, y: -4 });
      ctx.fx.spawnExplosion({ x: j.x, y: j.y }, '#A8A29E', 10, 0, 6);
      return false;
    }
    // Shoot it down
    const shot = state.projectiles.find(p => p.owner === 'player' && p.health > 0 && rectsOverlap(box, { x: p.pos.x, y: p.pos.y, w: p.width, h: p.height }));
    if (shot) {
      if (!shot.isTsunami && !shot.isBoulder) shot.health = 0;
      ctx.fx.spawnExplosion({ x: j.x, y: j.y }, '#A8A29E', 10, 0, 6);
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
  // It's harmless to touch: land on it and you bounce off; charge into it and it goes red and bawls
  const a = A();
  const px = player.pos.x + player.width / 2, py = player.pos.y + player.height / 2;
  const touching = Math.hypot(px - (a.x + EYE_CX), py - (a.y + EYE_CY)) < EYE_R + 20;
  if (touching && player.isCharging) {
    const dir = px < a.x + EYE_CX ? -1 : 1;
    if (f.attack !== 'blink') {
      e.health -= BOSS_CHARGE_DAMAGE;
      e.hitFlash = 5; f.hpFlash = 8;
      f.recentDamage += BOSS_CHARGE_DAMAGE;
      ctx.fx.spawnDamageNumber({ x: px, y: py - 30 }, BOSS_CHARGE_DAMAGE);
      ctx.fx.spawnDamageNumber({ x: a.x + EYE_CX - 40, y: a.y + EYE_CY - EYE_R - 20 }, 'WAAAHH!', true, '#7DD3FC');
      f.sore = 200;
      shakeScreen(state, 10, 6);
      playSound('tsunami');
    }
    player.isCharging = false; player.isSliding = false;
    player.vel.x = dir * 9; player.vel.y = Math.min(player.vel.y, -6);
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
  let dmg = p.damage;
  if (p.isBoulder) dmg = BOULDER_DAMAGE_PER_SPEED * Math.max(1, Math.hypot(p.vel.x, p.vel.y) / GML_SCALE) * 0.6;
  if (p.isSludge) dmg = p.isLingering ? 0 : 20;
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
  fx.speakVulgarity(weapon === 'FLAMETHROWER' ? 'flamethrower_kill' : weapon === 'SHOTGUN' ? 'shotgun_kill' : weapon === 'BOULDER' ? 'boulder_kill' : weapon === 'TSUNAMI' ? 'tsunami_kill' : weapon === 'TASER' ? 'taser_kill' : weapon === 'NEEDLES' ? 'dart_kill' : weapon === 'SLUDGE' ? 'sludge_kill' : weapon === 'OIL_ROCKET' ? 'oil_kill' : 'gun_kill');
  state.player.killSatisfactionTimer = 90;
};
