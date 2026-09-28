// Types and helpers shared by every boss. Each boss lives in its own file in this folder
// and is registered in ../boss.ts.

import { Block, BossState, Enemy, Player, Projectile, PoopTelegraph, SoundType, Volcano, WeaponType } from '../../types';
import {
  ARENA_LEFT, ARENA_RIGHT, GROUND_Y, BOSS_VULGARITY_DURATION, PLAYER_INVINCIBILITY_FRAMES, PLAYER_PUSHBACK_DURATION,
  SPOKEN_TEXT_HOLD,
} from '../../constants';
import type { FrameContext } from '../context';
import type { GameState } from '../state';
import type { Fx } from '../effects';
import { say, getBossVoice, SpeechPriority } from '../speech';

// ---------------------------------------------------------------------------
// Arena geometry (the standard boss room)
// ---------------------------------------------------------------------------

export const FLOOR_Y = GROUND_Y;
export const CEILING_Y = 100;
export const ARENA_MID = (ARENA_LEFT + ARENA_RIGHT) / 2;

/** Where a boss stands when he's on the floor. */
export const bossFloorY = (boss: Enemy) => FLOOR_Y - boss.height;

export const midX = (e: { pos: { x: number }, width: number }) => e.pos.x + e.width / 2;

/** -1 if `to` is left of `from`, otherwise 1. */
export const dirTo = (from: { pos: { x: number }, width: number }, to: { pos: { x: number }, width: number }) =>
  midX(to) < midX(from) ? -1 : 1;

// ---------------------------------------------------------------------------
// Boss definitions
// ---------------------------------------------------------------------------

/** Shared jump/gravity physics for bosses that don't move themselves (see physics.ts). */
export interface BossPhysics {
  /** Gravity multiplier (default 1). */
  gravity?: (boss: Enemy) => number;
  /** Landing ends a 'jumping' state (default true). */
  landingEndsJump?: boolean;
  /** A real touchdown (not just resting on the floor). `surface` is which collision caught him. */
  onLand?: (ctx: FrameContext, boss: Enemy, dirToPlayer: number, surface: 'block' | 'floor') => void;
}

export interface BossDef {
  id: string;
  /** The weapon he's weak to. */
  weakness: WeaponType;
  /** Damage a weakness hit does (default WEAKNESS_DAMAGE). */
  weaknessDamage?: number;
  /** Where and how he starts. `fields` are extra per-boss fields. */
  spawn: { x: number; y?: number; state?: BossState; timer?: number; fields?: Partial<Enemy> };
  /** His arena, when it differs from the standard boss room. */
  arena?: {
    /** Inner face of the right wall (default ARENA_RIGHT). Wider rooms scroll. */
    right?: number;
    /** No ceiling: the camera follows high jumps. */
    openTop?: boolean;
    /** No ground inside the arena (you stand on whatever `build` adds). */
    floorless?: boolean;
    /** Where Meathead glides to (relative to the door) as the door shuts. */
    entry?: { x: number; y: number };
    /** Adds his arena's own terrain. */
    build?: (state: GameState, blocks: Block[]) => void;
  };
  /** The whole stage has an icy floor. */
  slipperyFloor?: boolean;
  /** Bumping into him (default 5.5 damage), and the knockback from bumping into anything on his stage. */
  contact?: { damage: number; pushbackFrames?: (boss: Enemy) => number | undefined };

  /** His behaviour, every frame while the arena is locked. */
  update: (ctx: FrameContext, boss: Enemy) => void;
  /** Standard jump/gravity physics, run after `update`. Bosses without it move themselves. */
  physics?: BossPhysics;

  /** Some of the time he can't be hurt at all (e.g. under the sludge). */
  shield?: { isUp: (boss: Enemy, state: GameState) => boolean; color: string; sound?: SoundType };
  /** Takes a projectile his own way instead of being damaged by it. True if handled. */
  catchProjectile?: (ctx: FrameContext, boss: Enemy, p: Projectile) => boolean;
  /** Standing in one of Meathead's sludge puddles (called for each puddle, every frame). Replaces the usual one-off hit. */
  onStandInSludge?: (ctx: FrameContext, boss: Enemy) => void;
  /** Needles stuck in him tick his own way (runs after the needle DOT timer advances). */
  needleTick?: (ctx: FrameContext, boss: Enemy) => void;
  /** A weakness hit that didn't kill him. */
  onWeaknessHit?: (ctx: FrameContext, boss: Enemy, p?: Partial<Projectile>) => void;
  /** Meathead's melee connected (before damage is applied). */
  onMeleeHit?: (ctx: FrameContext, boss: Enemy) => void;
  /** He bumped into Meathead and hurt him. */
  onTouchPlayer?: (ctx: FrameContext, boss: Enemy) => void;
  /** He's just died (tidy up his arena). */
  onDeath?: (state: GameState) => void;
  /** Replaces the taser's usual effect on him. */
  onTaser?: (ctx: FrameContext, boss: Enemy) => void;
  /** Replaces the flamethrower's usual effect on him (Oscar's suit is fireproof). */
  onFlamed?: (ctx: FrameContext, boss: Enemy) => void;
}

// ---------------------------------------------------------------------------
// Helpers passed to boss code
// ---------------------------------------------------------------------------

export interface BossHelpers extends Fx {
  onBossDeath: () => void;
  /** Kills the boss (death shower, victory, Meathead's line). `weapon` defaults to the equipped one. */
  killBoss: (boss: Enemy, facing: number, wasWeakness: boolean, weapon?: WeaponType) => void;
  setBossVulgarity: (text: string, duration: number) => void;
  /** The boss finished saying `text`: take it down shortly (if it's still the one showing). */
  endBossVulgarity: (text: string) => void;
  setScreenShake: (duration: number) => void;
  setErnieVibration: (duration: number) => void;
  setPlayerStun: (duration: number) => void;
  addProjectile: (p: Projectile) => void;
  addVolcano: (v: Volcano) => void;
  clearVolcanoes: () => void;
  addVolcanoTelegraph: (v: Volcano) => void;
  clearVolcanoTelegraphs: () => void;
  addPoopTelegraph: (t: PoopTelegraph) => void;
  clearPoopTelegraphs: () => void;
  setVictorWallSide: (side: number) => void;
  setTsunamiActive: (active: boolean) => void;
}

/**
 * The boss says a line. Its text goes up over his head when he actually starts
 * saying it and comes down when he's done. 'queue' lines (the default: health
 * callouts, big moments) wait their turn; 'casual' ones are dropped if someone's
 * talking. Returns false if it was dropped.
 */
export const speakAsBoss = (bossId: string, text: string, helpers: BossHelpers, priority: SpeechPriority = 'queue') =>
  say(text, getBossVoice(bossId), priority, {
    onShow: spoken => helpers.setBossVulgarity(text, spoken ? SPOKEN_TEXT_HOLD : BOSS_VULGARITY_DURATION),
    onHide: () => helpers.endBossVulgarity(text),
  });

/**
 * A boss attack hurts Meathead: damage (unless the invincibility cheat is on),
 * invincibility frames, optional knockback, and a pained line.
 */
export const hurtPlayer = (
  ctx: FrameContext, damage: number, source: string,
  knockback?: { x: number; y: number }, pushbackFrames = PLAYER_PUSHBACK_DURATION,
) => {
  const player: Player = ctx.state.player;
  if (!ctx.cheats.invincible) player.health -= damage;
  if (player.health <= 0) return;
  player.invincibilityTimer = PLAYER_INVINCIBILITY_FRAMES;
  player.hurtTimer = PLAYER_INVINCIBILITY_FRAMES;
  player.isHarmlessPushback = false;
  player.smugTimer = 0;
  player.pushbackTimer = pushbackFrames;
  if (knockback) player.vel = { x: knockback.x, y: knockback.y };
  ctx.fx.speakVulgarity('hurt', source);
};

/** An enemy projectile with the usual boilerplate filled in. */
export const enemyProjectile = (
  id: string, x: number, y: number, velX: number, velY: number, w: number, h: number, damage: number,
  extra: Partial<Projectile> = {},
): Projectile => ({
  id, pos: { x, y }, vel: { x: velX, y: velY }, width: w, height: h, health: 1, maxHealth: 1,
  type: 'projectile', damage, owner: 'enemy', ...extra,
});
