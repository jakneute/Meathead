// Types and helpers shared by every boss. Each boss lives in its own file in this folder
// and is registered in ../boss.ts.

import { Block, BossState, Enemy, Player, Projectile, PoopTelegraph, SoundType, Volcano, VulgarityType, WeaponType } from '../../types';
import {
  ARENA_LEFT, ARENA_RIGHT, GROUND_Y, BOSS_VULGARITY_DURATION, PLAYER_INVINCIBILITY_FRAMES, PLAYER_PUSHBACK_DURATION,
  SPOKEN_TEXT_HOLD,
} from '../../constants';
import type { FrameContext } from '../core/context';
import type { GameState, BossCorpse } from '../core/state';
import type { Fx } from '../core/effects';
import { say, getBossVoice, SpeechPriority } from '../platform/speech';
import { hurtTaken, gritty } from '../core/resist';

// ---------------------------------------------------------------------------
// Arena geometry (the standard boss room)
// ---------------------------------------------------------------------------

export const FLOOR_Y = GROUND_Y;
export const CEILING_Y = 100;
export const ARENA_MID = (ARENA_LEFT + ARENA_RIGHT) / 2;
/** How far a boss keeps off the arena's walls: his whole sprite (arms, shoulders, gear) stays in the room. */
export const BOSS_WALL_GAP = 24;

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
  /**
   * Too slick to get a purchase on: any move into him (a charge, a slide, an uppercut, a dive kick) throws Meathead
   * off him, hard and sideways (x, y), and he can't start another till he's got his balance back (frames). A dive
   * kick off him gets no power back.
   */
  slick?: { x: number; y: number; frames: number };
  /** He bumped into Meathead and hurt him. */
  onTouchPlayer?: (ctx: FrameContext, boss: Enemy) => void;
  /** He's just died (tidy up his arena). */
  onDeath?: (state: GameState) => void;
  /** Replaces the taser's usual effect on him. */
  onTaser?: (ctx: FrameContext, boss: Enemy) => void;
  /** Replaces the flamethrower's usual effect on him (Oscar's suit is fireproof). */
  onFlamed?: (ctx: FrameContext, boss: Enemy, scale?: number) => void;
  /** No breather between hits: every round, pellet, needle and punch counts (his hitCooldown is never set). */
  noBreather?: boolean;
  /** What a hit from each weapon does to him, in place of the usual (see getBossDamage). */
  damageFor?: (weapon: WeaponType, state: GameState) => number;
  /** One of Meathead's weapons has just hit him (after its damage, if it didn't kill him). */
  onWeaponHit?: (ctx: FrameContext, boss: Enemy, weapon: WeaponType, p?: Partial<Projectile>) => void;
  /** Meathead's own moves (the charge, the slide, the uppercut, the dive kick) do this share of their usual damage. */
  meleeScale?: number;
  /** ...and can never finish him: a hit that would leaves him on his last point (something else has to do it). */
  meleeCantKill?: boolean;
  /** A body (flung by a move, shoved, sliding on oil, overdosed and flying) has gone into him: what it does to him. */
  onBodyHit?: (ctx: FrameContext, boss: Enemy, body: Enemy, force: number) => void;
  /** The taser's current has jumped onto him off one of the men round him. */
  onTaserChain?: (ctx: FrameContext, boss: Enemy) => void;
  /** Meathead's tsunami has him (every frame it does; `first` the first frame of each wave). Replaces the usual hit. */
  onTsunami?: (ctx: FrameContext, boss: Enemy, dir: number, first: boolean) => void;
  /** The oil rocket coats him (isOiled), the way it does a regular enemy. */
  oilable?: boolean;
  /** What a fire-meets-oil blast does to him (once a blast), in place of the usual. */
  nukeDamage?: number;
  /** A fire-meets-oil blast has caught him (and not killed him). */
  onNuke?: (ctx: FrameContext, boss: Enemy) => void;
  /** What he's full of, if it isn't blood (the colors his eruption sprays). */
  gore?: string[];
  /** However he dies, he goes the way a boss killed by his weakness goes (the eruption, a corpse left behind). */
  alwaysErupts?: boolean;
  /** What Meathead says over him dying, whatever did it. */
  killLine?: VulgarityType;
  /**
   * He dies his own way (the finale's alien): none of the usual last words, kill line or eruption. `start` has the
   * corpse the moment he dies (to say where it lies and how it goes, and set his death going); the eruption phase
   * holds, quiet, for as long as `playing` says, and the victory follows.
   */
  ownDeath?: {
    start: (state: GameState, corpse: BossCorpse, boss: Enemy, weapon: WeaponType, helpers: BossHelpers) => void;
    playing: (state: GameState) => boolean;
  };
}

// ---------------------------------------------------------------------------
// Helpers passed to boss code
// ---------------------------------------------------------------------------

export interface BossHelpers extends Fx {
  onBossDeath: () => void;
  /** Kills the boss (death shower, victory, Meathead's line). `weapon` defaults to the equipped one. */
  /** `killLine` is for a kill no weapon made (a charge, an uppercut): what Meathead says instead of the weapon's line. */
  killBoss: (boss: Enemy, facing: number, wasWeakness: boolean, weapon?: WeaponType, killLine?: VulgarityType) => void;
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
/**
 * A boss's weakness has really got him: he stops what he's doing for `frames` in a pain of his own (`kind`; his
 * renderer draws it), with a callout over him saying so and a jolt to the screen, so it's plain it's working.
 */
export const bossPain = (ctx: FrameContext, boss: Enemy, kind: string, frames: number, callout: string, color: string) => {
  const { state } = ctx;
  boss.bossState = 'pain';
  boss.painKind = kind;
  boss.stateTimer = frames;
  boss.vel.x = 0;
  state.damageNumbers.push({ id: `pain-${state.frame}-${Math.random()}`, text: callout, pos: { x: midX(boss), y: boss.pos.y - 40 }, vel: { x: 0, y: -3 }, life: 70, maxLife: 70, isCritical: true, isCallout: true, color });
  state.screenShakeTimer = Math.max(state.screenShakeTimer, 14);
};

export const hurtPlayer = (
  ctx: FrameContext, damage: number, source: string,
  knockback?: { x: number; y: number }, pushbackFrames = PLAYER_PUSHBACK_DURATION,
) => {
  const player: Player = ctx.state.player;
  if (!ctx.cheats.invincible) player.health -= hurtTaken(ctx.stageId, damage);
  // (what hurt him, for the death screen: the killing blow included)
  ctx.state.lastHurt = { source, at: ctx.state.frame };
  if (player.health <= 0) return;
  player.invincibilityTimer = PLAYER_INVINCIBILITY_FRAMES;
  player.hurtTimer = PLAYER_INVINCIBILITY_FRAMES;
  ctx.fx.playGunSound('hurt');
  // (the finale: he takes it and keeps going)
  if (gritty(ctx.stageId)) { ctx.fx.speakVulgarity('hurt', source); return; }
  // (hurt out of a rebound: the hurt takes over, the rebound's done)
  player.recoiling = false; player.lockTimer = 0; player.slideRecoil = false;
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
