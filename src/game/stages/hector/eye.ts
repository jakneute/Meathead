// The Eye of the Storm: the mid-boss at the top of the hurricane. A giant,
// bloodshot human eyeball hanging dead centre in the storm, never moving. It
// glares (the pupil tracks you, locks, and fires a beam down the line), weeps
// (a spray of scalding tears arcing out), and blinks when it's taken too much
// (shots ping off the lid). The junk you stand on keeps giving way under you, so
// you're always hopping to the next piece; only from the high pieces are you
// level with it, so you have to keep going back up.
//
// Mid-boss rules: no invincibility, lots of health, guns only (touch it and it
// shocks you off), immune to status effects. Kill it and it dies a different
// grotesque way depending on what you used, and the storm dies with it.

import type { Block, Enemy, Projectile, WeaponType } from '../../../types';
import type { FrameContext } from '../../context';
import type { GameState } from '../../state';
import { BOULDER_DAMAGE_PER_SPEED, GML_SCALE } from '../../../constants';
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

type PlatState = 'solid' | 'shake' | 'fall' | 'gone' | 'rise';
export interface EyePlat { block: Block; home: { x: number; y: number; w: number }; state: PlatState; t: number; high: boolean }
export type EyeAttack = 'idle' | 'glare' | 'beam' | 'tears' | 'blink';

export interface EyeFight {
  phase: 'waiting' | 'intro' | 'fight' | 'dead' | 'done';
  t: number;
  eye: Enemy | null;
  hpFlash: number;
  plats: EyePlat[];
  attack: EyeAttack;
  attackT: number;
  /** Where the glare's aimed (world coords); where the beam goes. */
  aim: { x: number; y: number };
  beams: number;
  tears: { x: number; y: number; vx: number; vy: number }[];
  /** Damage taken lately (enough and it blinks). */
  recentDamage: number;
  collapseT: number;
  walls: Block[];
  corpse: { weapon: WeaponType; t0: number } | null;
}

// Arena layout (relative to the arena's top left): high pieces level with the Eye, low ones below
// (each high piece hangs off to the side of the low one under it, so you can jump up onto it)
const PLATS = [
  { x: 20, y: 480, w: 170, high: false }, { x: 150, y: 360, w: 140, high: true }, { x: 290, y: 540, w: 220, high: false },
  { x: 610, y: 480, w: 170, high: false }, { x: 510, y: 360, w: 140, high: true },
];
const SHAKE = 70, GONE = 200, RISE = 60;
const GLARE = 58, LOCK = 12, BEAM = 20, BEAM_DAMAGE = 18, TEAR_DAMAGE = 10, TOUCH_DAMAGE = 16;
const BLINK_AT = 170, BLINK_FRAMES = 75;

const A = () => COURSE.eye;

export const createEyeFight = (state: GameState, startedAt: number): EyeFight => {
  const a = A();
  const plats = PLATS.map((p, i): EyePlat => ({
    block: { x: a.x + p.x, y: a.y + p.y, w: p.w, h: 16, type: 'platform', hidden: true, tag: `eyeplat-${i}` },
    home: { x: a.x + p.x, y: a.y + p.y, w: p.w }, state: 'solid', t: 0, high: p.high,
  }));
  state.blocks.push(...plats.map(p => p.block));
  const walls: Block[] = [
    { x: a.x - 40, y: a.y - 800, w: 40, h: 2000, type: 'wall', hidden: true, tag: 'eye-wall' },
    { x: a.x + 800, y: a.y - 800, w: 40, h: 2000, type: 'wall', hidden: true, tag: 'eye-wall' },
  ];
  state.blocks.push(...walls);
  const done = startedAt > CP.EYE;
  return { phase: done ? 'done' : 'waiting', t: 0, eye: null, hpFlash: 0, plats, attack: 'idle', attackT: 0, aim: { x: 0, y: 0 }, beams: 0, tears: [], recentDamage: 0, collapseT: 0, walls, corpse: null };
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
  if (f.phase === 'intro' && f.t > 90) { f.phase = 'fight'; f.t = 0; f.collapseT = 0; }
  updatePlats(ctx, f);
  // Off the junk and into the storm
  if (state.deathTimer <= 0 && player.pos.y > a.y + 700) {
    const lines = ['SUCKED INTO THE STORM', 'GONE WITH THE WIND', 'CATEGORY 5 DEATH'];
    killPlayer(ctx, lines[Math.floor(Math.random() * lines.length)]);
  }
  if (f.phase === 'dead' && f.corpse && state.frame - f.corpse.t0 > 170) { f.phase = 'done'; onDead(); }
};

const updatePlats = (ctx: FrameContext, f: EyeFight) => {
  const { state } = ctx;
  const { player } = state;
  const angry = !!f.eye && f.eye.health < EYE_HP * 0.5;
  // Every so often the piece he's on (or a high one) starts to go
  if (f.phase === 'fight' && ++f.collapseT > (angry ? 300 : 420)) {
    f.collapseT = 0;
    const standing = f.plats.find(p => p.state === 'solid' && player.isGrounded && player.pos.x + player.width > p.block.x && player.pos.x < p.block.x + p.block.w && Math.abs(player.pos.y + player.height - p.block.y) < 4);
    const pick = standing ?? f.plats.filter(p => p.state === 'solid' && p.high)[0];
    if (pick) { pick.state = 'shake'; pick.t = 0; }
  }
  for (const p of f.plats) {
    p.t++;
    const b = p.block;
    switch (p.state) {
      case 'shake':
        b.x = p.home.x + (p.t % 4 < 2 ? -2 : 2);
        if (p.t > SHAKE) { p.state = 'fall'; p.t = 0; state.blocks = state.blocks.filter(x => x !== b); }
        break;
      case 'fall':
        b.y += 2 + p.t * 0.5;
        if (p.t > 50) { p.state = 'gone'; p.t = 0; }
        break;
      case 'gone':
        if (p.t > GONE) { p.state = 'rise'; p.t = 0; b.x = p.home.x; b.y = p.home.y + 300; }
        break;
      case 'rise': {
        // Something else gets blown in to take its place
        b.y = p.home.y + 300 * (1 - p.t / RISE);
        if (p.t >= RISE) { p.state = 'solid'; p.t = 0; b.y = p.home.y; state.blocks.push(b); }
        break;
      }
      default:
        b.x = p.home.x;
    }
  }
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
  if (e.health <= 0 || e.isBlownAway) { killEye(ctx, e, f); return false; }
  if (f.phase !== 'fight') { f.aim = { x: player.pos.x + player.width / 2, y: player.pos.y + 30 }; return true; }

  const angry = e.health < EYE_HP * 0.5;
  const target = { x: player.pos.x + player.width / 2, y: player.pos.y + player.height / 2 };
  f.attackT++;
  switch (f.attack) {
    case 'idle':
      f.aim.x += (target.x - f.aim.x) * 0.08; f.aim.y += (target.y - f.aim.y) * 0.08;
      if (f.attackT > (angry ? 32 : 55)) {
        f.attack = Math.random() < 0.6 ? 'glare' : 'tears'; f.attackT = 0;
        f.beams = angry ? 2 : 1;
      }
      break;
    case 'glare':
      // Tracking you, then it locks
      if (f.attackT < GLARE) { f.aim.x += (target.x - f.aim.x) * 0.12; f.aim.y += (target.y - f.aim.y) * 0.12; }
      if (f.attackT >= GLARE + LOCK) { f.attack = 'beam'; f.attackT = 0; playSound('taser'); shakeScreen(state, 8, 4); }
      break;
    case 'beam': {
      // Down the line it locked on, out past him
      const pp = pupilPos(f);
      const dx = f.aim.x - pp.x, dy = f.aim.y - pp.y, len = Math.hypot(dx, dy) || 1;
      const ux = dx / len, uy = dy / len;
      const rx = target.x - pp.x, ry = target.y - pp.y;
      const along = rx * ux + ry * uy, off = Math.abs(rx * uy - ry * ux);
      if (along > 0 && off < 22 && player.invincibilityTimer <= 0) hurtPlayer(ctx, BEAM_DAMAGE, 'eye', { x: 0, y: -5 }); // (no shove: it'd knock you off the junk into the storm)
      if (f.attackT > BEAM) {
        f.beams--;
        if (f.beams > 0) { f.attack = 'glare'; f.attackT = GLARE - 22; } else { f.attack = 'idle'; f.attackT = 0; }
      }
      break;
    }
    case 'tears':
      // It wells up, then a spray of scalding tears arcs out off the lower lid
      if (f.attackT === 30) {
        const n = angry ? 9 : 7;
        const a = A();
        for (let i = 0; i < n; i++) f.tears.push({ x: a.x + EYE_CX + (i - (n - 1) / 2) * 12, y: a.y + EYE_CY + EYE_R * 0.8, vx: (i - (n - 1) / 2) * 1.3 + (Math.random() - 0.5), vy: -4 - Math.random() * 3 });
        ctx.fx.playGunSound('tsunami');
      }
      if (f.attackT > 60) { f.attack = 'idle'; f.attackT = 0; }
      break;
    case 'blink':
      // Squeezed shut: shots ping off the lid
      if (f.attackT > BLINK_FRAMES) { f.attack = 'idle'; f.attackT = 0; f.recentDamage = 0; }
      break;
  }
  // Tears falling
  f.tears = f.tears.filter(t => {
    t.vy += 0.32; t.x += t.vx; t.y += t.vy;
    if (rectsOverlap({ x: t.x - 5, y: t.y - 7, w: 10, h: 14 }, boundsOf(player)) && player.invincibilityTimer <= 0) { hurtPlayer(ctx, TEAR_DAMAGE, 'eye', { x: 0, y: -4 }); return false; }
    return t.y < A().y + 800;
  });
  // Touch it and it shocks you off
  const a = A();
  const px = player.pos.x + player.width / 2, py = player.pos.y + player.height / 2;
  if (Math.hypot(px - (a.x + EYE_CX), py - (a.y + EYE_CY)) < EYE_R + 4 && player.invincibilityTimer <= 0) {
    const dir = px < a.x + EYE_CX ? -1 : 1;
    hurtPlayer(ctx, TOUCH_DAMAGE, 'eye', { x: dir * 12, y: -10 });
    player.isCharging = false; player.isUppercutting = false; player.isDivekicking = false; player.isSliding = false;
    ctx.fx.spawnDamageNumber({ x: px - 30, y: py - 40 }, 'ZAPPED!', true, '#FDE047');
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
  if (f.recentDamage > BLINK_AT && f.attack !== 'beam') { f.attack = 'blink'; f.attackT = 0; }
  return true;
};

const killEye = (ctx: FrameContext, e: Enemy, f: EyeFight) => {
  const { state, fx } = ctx;
  const weapon: WeaponType = state.player.currentWeapon;
  f.phase = 'dead';
  f.corpse = { weapon, t0: state.frame };
  f.eye = null;
  f.tears = [];
  state.stageMemo.eyeWeapon = weapon;
  fx.spawnDeathShower({ x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2 }, 0, 4, true, 140);
  shakeScreen(state, 40, 10);
  playSound('thunder');
  fx.spawnDamageNumber({ x: e.pos.x + 20, y: e.pos.y - 30 }, 'THE EYE IS CLOSED!', true, '#FACC15');
  fx.speakVulgarity(weapon === 'FLAMETHROWER' ? 'flamethrower_kill' : weapon === 'SHOTGUN' ? 'shotgun_kill' : weapon === 'BOULDER' ? 'boulder_kill' : weapon === 'TSUNAMI' ? 'tsunami_kill' : weapon === 'TASER' ? 'taser_kill' : weapon === 'NEEDLES' ? 'dart_kill' : weapon === 'SLUDGE' ? 'sludge_kill' : weapon === 'OIL_ROCKET' ? 'oil_kill' : 'gun_kill');
  state.player.killSatisfactionTimer = 90;
};
