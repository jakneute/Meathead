// The boss registry and the rules every boss shares: spawning, weaknesses and
// damage, weapon reactions, dying, and running their behaviour each frame.
// Each boss's own behaviour lives in bosses/<name>.ts.

import { attackless } from '../enemies/attackless';
import { cutBossLines } from '../platform/speech';
import { Enemy, Projectile, WeaponType, VulgarityType } from '../../types';
import {
  ARENA_LEFT, ARENA_RIGHT, STAGE_WIDTH, BULLET_DAMAGE, WEAKNESS_DAMAGE, ENEMY_HIT_COOLDOWN, TASER_BOSS_DAMAGE_REDUCTION,
  BOSS_WEAPON_REACTION_CHANCE, BOSS_WEAPON_REACTION_COOLDOWN, SPOKEN_TEXT_LINGER, BOSS_OWN_WEAPON_DAMAGE, BOSS_OWN_WEAPON_REACTION_CHANCE,
} from '../../constants';
import { BOSS_DIALOGUE, BOSS_WEAPON_REACTIONS, BOSS_OWN_WEAPON_LINES } from '../../content/dialogue';
import { BOSS_WEAPON_MAP } from '../../content/roster';
import type { FrameContext } from '../core/context';
import { GameState, calmPlayer } from '../core/state';
import { Fx } from '../core/effects';
import { pickFreshLine } from '../platform/speech';
import { BossDef, BossHelpers, FLOOR_Y, speakAsBoss } from './shared';
import { applyBossPhysics } from './physics';
import { artie } from './artie';
import { victor } from './victor';
import { ernie } from './ernie';
import { hector } from './hector';
import { dale } from './dale';
import { barry } from './barry';
import { tommy } from './tommy';
import { oscar } from './oscar';

export type { BossDef, BossHelpers };
export { speakAsBoss };

export const BOSS_DEFS: Record<string, BossDef> = Object.fromEntries(
  [artie, victor, ernie, hector, dale, barry, tommy, oscar].map(def => [def.id, def]),
);

export const getBossDef = (stageId: string | null): BossDef | undefined => (stageId ? BOSS_DEFS[stageId] : undefined);

/** Inner face of the boss arena's right wall. */
export const getArenaRight = (stageId: string | null) => getBossDef(stageId)?.arena?.right ?? ARENA_RIGHT;
/** Where the level ends (the outside of the arena's right wall). */
export const getStageWidth = (stageId: string | null) => getArenaRight(stageId) + (STAGE_WIDTH - ARENA_RIGHT);

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

export const createBoss = (stageId: string): Enemy => {
  const { x, y = FLOOR_Y - 80, state = 'idle', timer = 60, fields } = BOSS_DEFS[stageId].spawn;
  return {
    id: 'boss',
    pos: { x, y },
    vel: { x: 0, y: 0 },
    width: 80,
    height: 80,
    health: 666,
    maxHealth: 666,
    type: 'boss',
    enemyType: 'tank',
    behavior: 'shoot',
    patrolRange: 0,
    initialX: x,
    shootTimer: 0,
    bossState: state,
    stateTimer: timer,
    truckX: 0,
    truckActive: false,
    ...fields,
  };
};

export const createBossHelpers = (
  state: GameState, fx: Fx, onBossDeath: () => void, stageId: string | null, currentWeapon: WeaponType,
): BossHelpers => {
  const helpers: BossHelpers = {
    ...fx,
    onBossDeath,
    killBoss: (boss, facing, wasWeakness, weapon = currentWeapon, killLine) =>
      triggerBossDeath(boss, facing, wasWeakness, stageId, weapon, state, helpers, killLine),
    setBossVulgarity: (t, d) => { state.bossLastVulgarity = t; state.bossVulgarityTimer = d; },
    endBossVulgarity: (t) => { if (state.bossLastVulgarity === t) state.bossVulgarityTimer = Math.min(state.bossVulgarityTimer, SPOKEN_TEXT_LINGER); },
    setScreenShake: (d) => { state.screenShakeTimer = d; },
    setErnieVibration: (d) => { state.ernieVibrationTimer = d; },
    setPlayerStun: (d) => { state.playerStunTimer = d; },
    addProjectile: (p) => { state.projectiles.push(p); },
    addVolcano: (v) => { state.bossVolcanoes.push(v); },
    clearVolcanoes: () => { state.bossVolcanoes = []; },
    addVolcanoTelegraph: (v) => { state.bossVolcanoTelegraphs.push(v); },
    clearVolcanoTelegraphs: () => { state.bossVolcanoTelegraphs = []; },
    addPoopTelegraph: (t) => { state.bossPoopTelegraphs.push(t); },
    clearPoopTelegraphs: () => { state.bossPoopTelegraphs = []; },
    setVictorWallSide: (s) => { state.victorWallSide = s; },
    setTsunamiActive: (a) => { state.tsunamiActive = a; },
  };
  return helpers;
};

// ---------------------------------------------------------------------------
// Weaknesses and damage
// ---------------------------------------------------------------------------

/** Which of Meathead's weapons a player projectile came from. */
export const weaponOf = (p: Partial<Projectile>): WeaponType => {
  if (p.isBoulder) return 'BOULDER';
  if (p.isIce) return 'SHOTGUN';
  if (p.isDart) return 'NEEDLES';
  if (p.isSludge) return 'SLUDGE';
  if (p.isOilRocket) return 'OIL_ROCKET';
  return 'GUN';
};

export const isWeakTo = (stageId: string | null, weapon: WeaponType) => getBossDef(stageId)?.weakness === weapon;
/** It's the weapon Meathead took off him (only with cheats for now; a refight, one day): it barely hurts him. */
export const isOwnWeapon = (stageId: string | null, weapon: WeaponType) => !!stageId && BOSS_WEAPON_MAP[stageId] === weapon;

export const getBossDamage = (stageId: string | null, weapon: WeaponType) => {
  const def = getBossDef(stageId);
  if (def && weapon === def.weakness) return def.weaknessDamage ?? WEAKNESS_DAMAGE;
  if (weapon === 'TASER') return Math.floor(BULLET_DAMAGE * TASER_BOSS_DAMAGE_REDUCTION);
  return BULLET_DAMAGE;
};

/**
 * One of Meathead's weapons hits the boss: damage (the weapon's usual amount
 * unless `damage` is given), his weakness reaction, a possible taunt, and death.
 * Returns whether it was his weakness.
 */
export const hitBoss = (
  ctx: FrameContext, boss: Enemy, weapon: WeaponType,
  { facing, damage, p }: { facing: number; damage?: number; p?: Partial<Projectile> },
) => {
  const { stageId, state, fx } = ctx;
  const isWeakness = isWeakTo(stageId, weapon);
  const full = damage ?? getBossDamage(stageId, weapon);
  const dmg = isOwnWeapon(stageId, weapon) ? Math.max(0.1, full * BOSS_OWN_WEAPON_DAMAGE) : full;
  boss.health -= dmg;
  boss.hitCooldown = ENEMY_HIT_COOLDOWN;
  fx.spawnDamageNumber(boss.pos, dmg, isWeakness);
  if (isWeakness && boss.health > 0) getBossDef(stageId)?.onWeaknessHit?.(ctx, boss, p);
  maybeReactToWeapon(boss, weapon, stageId, state, ctx.bossHelpers);
  if (boss.health <= 0) ctx.bossHelpers.killBoss(boss, facing, isWeakness, weapon);
  return isWeakness;
};

/**
 * Sometimes a boss shouts back about the weapon that just hit them. Never on
 * the killing blow, and never over another boss line that's still showing.
 */
export const maybeReactToWeapon = (boss: Enemy, weapon: WeaponType, stageId: string | null, state: GameState, helpers: BossHelpers) => {
  if (!stageId || boss.health <= 0 || state.bossVulgarityTimer > 0) return;
  // (his own weapon: the first time, he always has something to say about it, cooldown or no)
  const own = isOwnWeapon(stageId, weapon) && BOSS_OWN_WEAPON_LINES[stageId];
  if (own && !boss.saidOwnWeapon) {
    const line = pickFreshLine(own);
    if (line && speakAsBoss(stageId, line, helpers, 'casual')) { boss.saidOwnWeapon = true; state.bossReactionCooldown = BOSS_WEAPON_REACTION_COOLDOWN; }
    return;
  }
  if (state.bossReactionCooldown > 0) return;
  if (Math.random() >= (own ? BOSS_OWN_WEAPON_REACTION_CHANCE : BOSS_WEAPON_REACTION_CHANCE)) return;
  const lines = own || BOSS_WEAPON_REACTIONS[stageId]?.[weapon];
  if (!lines) return;
  const line = pickFreshLine(lines);
  if (line && speakAsBoss(stageId, line, helpers, 'casual')) state.bossReactionCooldown = BOSS_WEAPON_REACTION_COOLDOWN;
};

// ---------------------------------------------------------------------------
// Each frame
// ---------------------------------------------------------------------------

/** Runs the boss while the arena is locked: timers, health callouts, behaviour, physics. */
export const updateBossAI = (ctx: FrameContext, boss: Enemy) => {
  const { stageId } = ctx;
  boss.stateTimer = (boss.stateTimer || 0) - 1;

  const lines = stageId ? BOSS_DIALOGUE.THRESHOLDS[stageId] : undefined;
  if (stageId && lines) {
    const healthPct = (boss.health / boss.maxHealth) * 100;
    if (healthPct <= 75 && !boss.said75) { boss.said75 = true; speakAsBoss(stageId, lines[75], ctx.bossHelpers); }
    if (healthPct <= 50 && !boss.said50) { boss.said50 = true; speakAsBoss(stageId, lines[50], ctx.bossHelpers); }
    if (healthPct <= 25 && !boss.said25) { boss.said25 = true; speakAsBoss(stageId, lines[25], ctx.bossHelpers); }
  }
  const def = getBossDef(stageId);
  if (!def) return;
  def.update(ctx, boss);
  if (def.physics) applyBossPhysics(ctx, boss, def.physics);
};

// ---------------------------------------------------------------------------
// Death
// ---------------------------------------------------------------------------

/** How far a weakness-kill corpse is kept from the walls (it sprawls about this far). */
const CORPSE_WALL_GAP = 115;

/** Which of Meathead's kill lines fits the weapon that finished the boss. */
const KILL_LINE_FOR: Partial<Record<WeaponType, VulgarityType>> = {
  BOULDER: 'boulder_kill',
  SHOTGUN: 'shotgun_kill',
  FLAMETHROWER: 'flamethrower_kill',
  TSUNAMI: 'tsunami_kill',
  SLUDGE: 'sludge_kill',
  NEEDLES: 'dart_kill',
};

/**
 * Clears the arena and plays the death: a weakness kill erupts in gore for a
 * few seconds (see core/update.ts), anything else goes straight to victory.
 */
const triggerBossDeath = (boss: Enemy, playerFacing: number, wasWeakness: boolean, stageId: string | null, weapon: WeaponType, state: GameState, helpers: BossHelpers, killLine?: VulgarityType) => {
  // (dead already: one death each. A second blow landing on the same frame, or his own truck, or the puddle he's
  // stood in, doesn't turn a man going over into a man erupting)
  if (state.bossExplosionTimer > 0 || state.bossFallen || state.bossCorpse) return;
  state.deadBoss = { ...boss };
  const pos = { x: boss.pos.x + boss.width / 2, y: boss.pos.y + boss.height / 2 };

  // (whatever he was in the middle of saying, he doesn't get to finish: just his last words)
  cutBossLines();
  if (stageId && BOSS_DIALOGUE.THRESHOLDS[stageId]) speakAsBoss(stageId, BOSS_DIALOGUE.THRESHOLDS[stageId][0], helpers);

  state.bossVolcanoes = [];
  state.bossVolcanoTelegraphs = [];
  state.bossPoopTelegraphs = [];
  state.bossSteamExplosions = [];
  state.ernieVibrationTimer = 0;
  state.projectiles = [];
  state.tsunamiActive = false;
  state.tsunamiX = -1;
  state.tommySludgeOiledTimer = 0;
  state.damageNumbers = []; // no numbers or callouts hanging over the death / victory freeze
  state.oilCells = [];
  state.icicles = [];
  getBossDef(stageId)?.onDeath?.(state);

  // Stop any lingering puke shield, stream, taser, etc. (but if it was a charge, a slide, an uppercut or a dive kick
  // that did it, that's the pose he's held in while it plays out)
  const pl = state.player;
  const pose = pl.isCharging || pl.isUppercutting || pl.isDivekicking
    ? { isCharging: !!pl.isCharging, isSliding: !!pl.isSliding, isUppercutting: !!pl.isUppercutting, isDivekicking: !!pl.isDivekicking } : null;
  calmPlayer(state.player);
  state.killPose = pose;
  if (pose) Object.assign(pl, pose);
  state.playerStunTimer = 0;

  if (wasWeakness) {
    state.bossExplosionTimer = 180;
    state.bossExplosionPos = pos;
    // What's left of him stays behind, wrecked the way the weapon would
    // (in a floorless arena he floats, half sunk, at the surface)
    const floor = getBossDef(stageId)?.arena?.floorless ? state.tommySludgeY - 25 : FLOOR_Y;
    // Nudged out of the corners so the whole mess stays in view
    const corpseX = Math.max(ARENA_LEFT + CORPSE_WALL_GAP, Math.min(getArenaRight(stageId) - CORPSE_WALL_GAP, pos.x));
    state.bossCorpse = { stageId: stageId || '', weapon, x: corpseX, y: floor, facing: playerFacing < 0 ? -1 : 1, frame0: state.frame };
    helpers.spawnDeathShower(state.bossExplosionPos, playerFacing, 35, true, 120);
  } else {
    helpers.spawnDeathShower(pos, playerFacing, 6, true, 45);
    // Not his weakness: no eruption, he just goes over, dead (away from what hit him, unless there's a wall that way)
    const floor = getBossDef(stageId)?.arena?.floorless ? state.tommySludgeY - 10 : FLOOR_Y;
    let dir: 1 | -1 = playerFacing < 0 ? -1 : 1;
    const reach = Math.max(boss.width, boss.height);
    if (dir === 1 && boss.pos.x + boss.width + reach > getArenaRight(stageId)) dir = -1;
    else if (dir === -1 && boss.pos.x - reach < ARENA_LEFT) dir = 1;
    // (without whatever attack he was in the middle of: that doesn't keel over with him)
    state.bossFallen = { e: { ...attackless(boss), vel: { x: 0, y: 0 }, hitCooldown: 0 }, dir, floor, frame0: state.frame };
    helpers.onBossDeath();
    state.victoryString = "V";
    state.postVictoryTimer = 0;
  }
  state.player.killSatisfactionTimer = 0;
  state.player.bossKillSatisfactionTimer = 240;
  state.arenaLocked = false;

  // (only the needles' own kill is an overdose: a charge into him with the needles in hand, high or not, is just a charge)
  if (wasWeakness && weapon === 'NEEDLES') helpers.spawnDamageNumber(boss.pos, "OVERDOSE!", true, "#FF00FF");
  helpers.speakVulgarity(killLine ?? KILL_LINE_FOR[weapon] ?? 'gun_kill');
};
