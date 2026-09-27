// The moose: the summit's mid-boss. A very large, very territorial moose in a
// clearing you can't leave until one of you is dead.
//
// All it does is charge back and forth, faster as it gets hurt. You have to
// shoot it: it laughs off everything else.
//   shoulder charge / uppercut into its front: it heaves you skyward on its antlers
//   the same into its back end: it kicks you across the clearing with its hind legs
//   dive kick onto it: bucking bronco, and you're thrown aside
//   slide into its legs: it tramples you flat
//   just standing in its way while it charges: trampled too
// No invincibility between hits (it's a mid-boss): every bullet counts. It
// shrugs off status effects (freezing, burning, oil, needles, stun...). How it
// dies decides what's left of it.

import type { Block, Enemy, Projectile, WeaponType } from '../../../types';
import type { FrameContext } from '../../context';
import type { GameState } from '../../state';
import { shakeScreen } from '../../state';
import { rectsOverlap, boundsOf } from '../../utils';
import { hurtPlayer } from '../../bosses/shared';
import { BOULDER_DAMAGE_PER_SPEED, GML_SCALE } from '../../../constants';
import { KIND_STATS } from '../../systems/kinds';
import { COURSE, CP } from './course';

export const MOOSE_HP = KIND_STATS.moose.hp;
const W = KIND_STATS.moose.w, H = KIND_STATS.moose.h;

type MoosePhase = 'waiting' | 'intro' | 'fight' | 'dead';
export interface MooseCorpse { x: number; y: number; facing: 1 | -1; weapon: WeaponType; t0: number }
export interface MooseFight {
  phase: MoosePhase;
  t: number;
  moose: Enemy | null;
  walls: Block[];
  corpse: MooseCorpse | null;
  /** The last reaction worth a word ("HEAVED!"), for the HUD flash. */
  hpFlash: number;
  /** It just got you: once it's pulled up, it backs off to the far side before coming again (no chaining hits on you). */
  retreatNext: boolean;
}

const arena = () => COURSE.moose;

export const createMooseFight = (state: GameState, startedAt: number): MooseFight => {
  const a = arena();
  const dead = startedAt >= CP.AFTER_MOOSE;
  return {
    phase: dead ? 'dead' : 'waiting', t: 0, moose: null, hpFlash: 0, retreatNext: false,
    walls: [
      { x: a.x1 - 40, y: a.y - 900, w: 40, h: 900, type: 'wall', hidden: true, tag: 'moose-wall' },
      { x: a.x2, y: a.y - 900, w: 40, h: 900, type: 'wall', hidden: true, tag: 'moose-wall' },
    ],
    // Killed on an earlier try: it's still lying there, the way you left it
    corpse: dead ? { x: a.x1 + 520, y: a.y, facing: -1, weapon: (state.stageMemo.mooseWeapon as WeaponType) || 'GUN', t0: -600 } : null,
  };
};

export const updateMooseFight = (ctx: FrameContext, fight: MooseFight) => {
  const { state } = ctx;
  const { player } = state;
  const a = arena();
  fight.t++;
  if (fight.hpFlash > 0) fight.hpFlash--;
  if (fight.phase === 'waiting') {
    // Walk into the clearing and it's on
    if (player.pos.x + player.width / 2 > a.x1 + 160 && player.isGrounded) {
      fight.phase = 'intro'; fight.t = 0;
      state.blocks.push(fight.walls[0]);
      const m = makeMoose(a.x2 + 20, a.y);
      fight.moose = m;
      state.enemies.push(m);
    }
  }
  if (fight.phase === 'intro' || fight.phase === 'fight') {
    state.cameraOverride = { x: a.x1, y: a.y - 550 };
    // Once it's in, the far side shuts too
    if (fight.moose && fight.moose.pos.x + W < a.x2 - 4 && !state.blocks.includes(fight.walls[1])) state.blocks.push(fight.walls[1]);
  }
};

const makeMoose = (x: number, floorY: number): Enemy => ({
  id: 'moose', kind: 'moose', pos: { x, y: floorY - H }, vel: { x: -7, y: 0 }, width: W, height: H,
  health: MOOSE_HP, maxHealth: MOOSE_HP, type: 'enemy', enemyType: 'tank', behavior: 'custom',
  patrolRange: 0, initialX: x, shootTimer: 0, aiState: 'enter', aiTimer: 0, facing: -1, hitFlash: 0,
});

// ---------------------------------------------------------------------------
// The moose itself (updated in place of the generic enemy code)
// ---------------------------------------------------------------------------

const PAW_FRAMES = 44, PAW_FRAMES_ANGRY = 26;
const CHARGE_SPEED = 9.5, CHARGE_SPEED_ANGRY = 12;
const REACT_FRAMES = 40;
/** Backing off after it's hurt you: how fast, and how close to the far wall it goes before turning to face you. */
const RETREAT_SPEED = 6.5, RETREAT_WALL_GAP = 40;
/** Already this far from you: no need to back off, it just turns round. */
const RETREAT_FAR_ENOUGH = 380;

export const updateMoose = (ctx: FrameContext, m: Enemy, fight: MooseFight): boolean => {
  const { state } = ctx;
  const a = arena();
  // Status effects don't take
  m.frozenTimer = 0; m.pauseTimer = 0; m.isOnFire = false; m.fireTimer = 0; m.isOiled = false; m.oiledTimer = 0;
  m.sludgeTimer = 0; m.needleCount = 0; m.needleOffsets = []; m.dotTimer = 0; m.isTased = false;
  if (m.hitFlash && m.hitFlash > 0) m.hitFlash--;

  if (m.health <= 0 || m.isBlownAway) { killMoose(ctx, m, fight); return false; }

  const angry = m.health < m.maxHealth * 0.5;
  m.aiTimer = (m.aiTimer || 0) + 1;
  const toward = (state.player.pos.x + state.player.width / 2 < m.pos.x + W / 2 ? -1 : 1) as 1 | -1;
  switch (m.aiState) {
    case 'enter':
      m.vel.x = -7;
      if (m.pos.x < a.x2 - W - 120) { m.aiState = 'bellow'; m.aiTimer = 0; m.vel.x = 0; }
      break;
    case 'bellow':
      m.vel.x = 0;
      if (m.aiTimer === 20) { shakeScreen(state, 30, 7); ctx.fx.playGunSound('horn'); }
      if (m.aiTimer > 70) { m.aiState = 'paw'; m.aiTimer = 0; fight.phase = 'fight'; }
      break;
    case 'paw':
      // Head down, scraping a hoof, lining you up
      m.vel.x = 0;
      m.facing = toward;
      if (m.aiTimer > (angry ? PAW_FRAMES_ANGRY : PAW_FRAMES)) { m.aiState = 'charge'; m.aiTimer = 0; }
      break;
    case 'charge': {
      const top = angry ? CHARGE_SPEED_ANGRY : CHARGE_SPEED;
      m.vel.x += m.facing! * 0.7;
      m.vel.x = Math.max(-top, Math.min(top, m.vel.x));
      // Nearly at the wall: dig in and skid
      const front = m.facing === 1 ? m.pos.x + W : m.pos.x;
      const wall = m.facing === 1 ? a.x2 : a.x1;
      if (Math.abs(wall - front) < 60 + Math.abs(m.vel.x) * 4) { m.aiState = 'skid'; m.aiTimer = 0; }
      if (m.aiTimer % 5 === 0) dust(state, m, 3);
      break;
    }
    case 'skid':
      m.vel.x *= 0.82;
      if (m.aiTimer % 2 === 0) dust(state, m, 2);
      if (Math.abs(m.vel.x) < 0.4) {
        m.vel.x = 0;
        if (fight.retreatNext) { startRetreat(ctx, m, fight); break; }
        m.facing = (m.facing === 1 ? -1 : 1) as 1 | -1;
        // Angry: sometimes it comes straight back without the wind-up
        m.aiState = angry && Math.random() < 0.4 ? 'charge' : 'paw'; m.aiTimer = 0;
      }
      break;
    case 'retreat': {
      // Trotting off to the far side, then turning round to line you up again
      m.vel.x = m.facing! * RETREAT_SPEED;
      const front = m.facing === 1 ? m.pos.x + W : m.pos.x;
      const wall = m.facing === 1 ? a.x2 : a.x1;
      if (Math.abs(wall - front) < RETREAT_WALL_GAP + RETREAT_SPEED * 3) { m.vel.x = 0; m.facing = toward; m.aiState = 'paw'; m.aiTimer = 0; }
      if (m.aiTimer % 6 === 0) dust(state, m, 1);
      break;
    }
    default:
      // A reaction pose (heave, kick, buck, stomp): it plants itself for a moment, then backs off
      m.vel.x *= 0.7;
      if (m.aiTimer > REACT_FRAMES) startRetreat(ctx, m, fight);
      break;
  }
  m.pos.x += m.vel.x;
  m.pos.x = Math.max(a.x1 + 2, Math.min(a.x2 - W - 2, m.pos.x));
  // The bucking bronco hops
  m.pos.y = a.y - H - (m.aiState === 'buck' ? Math.abs(Math.sin(m.aiTimer * 0.35)) * 26 : 0);
  touchPlayer(ctx, m, fight);
  return true;
};

/** It's hurt you: head for the far side from you (unless it's already well clear), then come again. */
const startRetreat = (ctx: FrameContext, m: Enemy, fight: MooseFight) => {
  const p = ctx.state.player;
  fight.retreatNext = false;
  m.aiTimer = 0;
  const away = (p.pos.x + p.width / 2 < m.pos.x + W / 2 ? 1 : -1) as 1 | -1;
  if (Math.abs(p.pos.x + p.width / 2 - (m.pos.x + W / 2)) > RETREAT_FAR_ENOUGH) { m.facing = (-away) as 1 | -1; m.aiState = 'paw'; return; }
  m.facing = away;
  m.aiState = 'retreat';
};

const dust = (state: GameState, m: Enemy, n: number) => {
  for (let i = 0; i < n; i++) {
    state.particles.push({
      pos: { x: m.pos.x + W / 2 - m.facing! * (W / 2 - 10) + (Math.random() - 0.5) * 20, y: m.pos.y + H - 4 },
      vel: { x: -m.facing! * (1 + Math.random() * 3), y: -Math.random() * 2 }, life: 20 + Math.random() * 10, color: Math.random() > 0.5 ? '#F8FAFC' : '#CBD5E1', size: 4 + Math.random() * 5,
    });
  }
};

/** What happens when you touch it: every way of attacking it with your body goes badly. */
const touchPlayer = (ctx: FrameContext, m: Enemy, fight: MooseFight) => {
  const { state, fx } = ctx;
  const p = state.player;
  // (its back, not its antlers: jumping over it is fair)
  const body = { x: m.pos.x + 10, y: m.pos.y + 14, w: W - 20, h: H - 14 };
  if (!rectsOverlap(body, boundsOf(p))) return;
  const special = p.isSliding ? 'slide' : p.isDivekicking ? 'dive' : (p.isCharging || p.isUppercutting) ? 'hit' : null;
  if (!special && (p.invincibilityTimer > 0 || state.deathTimer > 0)) return;
  // Backing off: it's not interested in you right now (brushing past it is harmless)
  if (!special && m.aiState === 'retreat') return;
  const px = p.pos.x + p.width / 2, mx = m.pos.x + W / 2;
  const inFront = Math.sign(px - mx) === m.facing;
  const shout = (text: string, color: string) => fx.spawnDamageNumber({ x: px - 30, y: p.pos.y - 30 }, text, true, color);
  const endSpecial = () => { p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false; p.recoiling = false; p.lockTimer = 0; };
  const react = (pose: string) => { m.aiState = pose; m.aiTimer = 0; m.vel.x *= 0.3; };

  if (special === 'slide') {
    // Slid into its legs: it rears up and tramples you
    endSpecial();
    react('stomp');
    hurtPlayer(ctx, 25, 'moose', { x: -Math.sign(px - mx || 1) * 3, y: -3 }, 50);
    state.playerStunTimer = 45;
    shakeScreen(state, 20, 8);
    shout('TRAMPLED!', '#F97316');
  } else if (special === 'dive') {
    // Stomped on its back: bucking bronco, off you go
    endSpecial();
    react('buck');
    hurtPlayer(ctx, 12, 'moose', { x: (px < mx ? -1 : 1) * 11, y: -15 }, 40);
    shout('BUCKED OFF!', '#FACC15');
  } else if (special === 'hit') {
    endSpecial();
    if (inFront) {
      // Shoulder or fist to the face: it scoops you up on its antlers and flings you
      react('heave');
      hurtPlayer(ctx, 15, 'moose', { x: -m.facing! * 4, y: -24 }, 45);
      shout('HEAVED!', '#38BDF8');
    } else {
      // From behind: both hind legs, square in the chest
      react('kick');
      hurtPlayer(ctx, 18, 'moose', { x: -m.facing! * 19, y: -8 }, 45);
      shout('KICKED!', '#A3E635');
    }
    shakeScreen(state, 14, 6);
  } else if (m.aiState === 'charge' || m.aiState === 'skid' || m.aiState === 'enter') {
    // In its way: run clean over (then it pulls up and backs off, rather than pinning you to the wall)
    hurtPlayer(ctx, 18, 'moose', { x: m.facing! * 13, y: -9 }, 40);
    if (m.aiState !== 'enter') {
      if (m.aiState === 'charge') { m.aiState = 'skid'; m.aiTimer = 0; }
      fight.retreatNext = true;
    }
    shakeScreen(state, 12, 6);
    shout('RUN OVER!', '#F87171');
  } else {
    // Just bumping into it: a shove, and it backs off
    hurtPlayer(ctx, 6, 'moose', { x: (px < mx ? -1 : 1) * 7, y: -4 });
    if (m.aiState === 'paw') startRetreat(ctx, m, fight);
  }
};

/** A player projectile hit it: damage only (no knockback, no status effects, no invincibility). */
export const hitMoose = (ctx: FrameContext, m: Enemy, p: Projectile, fight: MooseFight): boolean => {
  const { fx } = ctx;
  let dmg = p.damage;
  if (p.isBoulder) dmg = BOULDER_DAMAGE_PER_SPEED * Math.max(1, Math.hypot(p.vel.x, p.vel.y) / GML_SCALE) * 0.6;
  if (p.isSludge) dmg = p.isLingering ? 0 : 20;
  if (dmg <= 0) return true;
  m.health -= dmg;
  m.hitFlash = 5;
  fight.hpFlash = 8;
  fx.spawnDamageNumber({ x: p.pos.x, y: p.pos.y - 10 }, Math.round(dmg));
  // Blood where it went in
  for (let i = 0; i < 3; i++) ctx.state.particles.push({ pos: { x: p.pos.x, y: p.pos.y }, vel: { x: -Math.sign(p.vel.x || 1) * Math.random() * 4, y: -Math.random() * 3 }, life: 40, color: '#8B0000', size: 3 + Math.random() * 3 });
  // A boulder breaks up on it
  if (p.isBoulder) for (let i = 0; i < 8; i++) ctx.state.particles.push({ pos: { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 }, vel: { x: (Math.random() - 0.5) * 8, y: -Math.random() * 6 }, life: 35, color: i % 2 ? '#78716C' : '#A8A29E', size: 4 + Math.random() * 6 });
  return true;
};

const killMoose = (ctx: FrameContext, m: Enemy, fight: MooseFight) => {
  const { state, fx } = ctx;
  const weapon: WeaponType = state.player.currentWeapon;
  fight.phase = 'dead';
  fight.corpse = { x: m.pos.x + W / 2, y: arena().y, facing: m.facing || -1, weapon, t0: state.frame };
  fight.moose = null;
  state.stageMemo.mooseWeapon = weapon;
  // A shower of it
  fx.spawnDeathShower({ x: m.pos.x + W / 2, y: m.pos.y + H / 2 }, 0, 4, true, 140);
  shakeScreen(state, 30, 9);
  fx.spawnDamageNumber({ x: m.pos.x + W / 2 - 60, y: m.pos.y - 40 }, 'MOOSE DOWN!', true, '#FACC15');
  fx.speakVulgarity(weapon === 'FLAMETHROWER' ? 'flamethrower_kill' : weapon === 'SHOTGUN' ? 'shotgun_kill' : weapon === 'BOULDER' ? 'boulder_kill' : weapon === 'TSUNAMI' ? 'tsunami_kill' : weapon === 'TASER' ? 'taser_kill' : weapon === 'NEEDLES' ? 'dart_kill' : weapon === 'SLUDGE' ? 'sludge_kill' : weapon === 'OIL_ROCKET' ? 'oil_kill' : 'gun_kill');
  // The way on opens up
  state.blocks = state.blocks.filter(b => !fight.walls.includes(b));
  state.cameraOverride = null;
  state.checkpoint = Math.max(state.checkpoint, CP.AFTER_MOOSE);
  state.player.killSatisfactionTimer = 90;
};
