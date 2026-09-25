import { Projectile, Enemy, Vector2 } from '../types';
import {
  BULLET_DAMAGE, BOULDER_DAMAGE, BOULDER_SPEED, SHOTGUN_DAMAGE,
  SHOTGUN_COOLDOWN, FLAMETHROWER_DAMAGE,
  FLAMETHROWER_RANGE, FLAMETHROWER_MAX_RANGE, FLAMETHROWER_RAMP_FRAMES,
  TSUNAMI_COOLDOWN, COLORS, PARTICLE_PALETTES,
  TASER_RANGE, CANVAS_WIDTH, GUN_COOLDOWN, GUN_VELOCITY,
  BOULDER_COOLDOWN, SHOTGUN_PELLET_COUNT, NEEDLE_DAMAGE, NEEDLE_COOLDOWN,
  SLUDGE_COOLDOWN, FILTH_SHIELD_DURATION, SLUDGE_DAMAGE,
  OIL_ROCKET_DAMAGE, OIL_ROCKET_COOLDOWN, OIL_ROCKET_SPLASH_RADIUS, OIL_ROCKET_SPLASH_DAMAGE,
  OIL_ROCKET_OILED_DURATION, OIL_ROCKET_NUKE_DAMAGE, ENEMY_HIT_COOLDOWN,
} from '../constants';
import { GameState } from './state';
import { FrameContext, killBoss } from './context';
import { getBossDamage, checkIsWeakness, artieWeaknessLeap, speakAsBoss } from './boss';
import { pickRandom } from './utils';

/**
 * Fires the player's current weapon (called when fire is held and off cooldown).
 * The taser is special: this only starts it; update.ts keeps it running.
 */
export const fireWeapon = (ctx: FrameContext, isMoveUp: boolean, isMoveDown: boolean) => {
  const { state, fx, cheats } = ctx;
  const { player } = state;
  const { currentWeapon, facing, pos, width, isDucking } = player;
  const shootX = pos.x + (facing === 1 ? width : -10);
  const shootY = isDucking ? pos.y + 52 : pos.y + 25;
  const useAmmo = () => { if (!cheats.infiniteAmmo) player.weaponAmmo[currentWeapon]--; };
  const addProjectile = (p: Projectile) => state.projectiles.push(p);

  switch (currentWeapon) {
    case 'GUN':
      addProjectile({
        id: `p-${Date.now()}`,
        pos: { x: shootX, y: shootY },
        vel: { x: facing * GUN_VELOCITY, y: 0 },
        width: 16, height: 6, health: 1, maxHealth: 1,
        type: 'projectile', damage: BULLET_DAMAGE, owner: 'player'
      });
      player.shootCooldown = GUN_COOLDOWN;
      fx.playGunSound('gun');
      break;

    case 'BOULDER': {
      // Only one player boulder in play at a time
      if (state.projectiles.some(p => p.owner === 'player' && p.isBoulder)) break;
      const vy = isMoveUp ? -18 : 0;
      const vx = isMoveUp ? facing * (BOULDER_SPEED * 0.9) : facing * BOULDER_SPEED;
      addProjectile({
        id: `b-${Date.now()}`,
        pos: { x: pos.x + (facing === 1 ? width : -40), y: pos.y + 20 },
        vel: { x: vx, y: vy },
        width: 48, height: 48, health: 1, maxHealth: 1,
        type: 'projectile', damage: BOULDER_DAMAGE, owner: 'player', isBoulder: true
      });
      player.shootCooldown = BOULDER_COOLDOWN;
      useAmmo();
      break;
    }

    case 'SHOTGUN':
      for (let i = 0; i < SHOTGUN_PELLET_COUNT; i++) {
        const angle = (i - Math.floor(SHOTGUN_PELLET_COUNT / 2)) * 0.15;
        const speed = 11 + Math.random() * 6;
        addProjectile({
          id: `pellet-${Date.now()}-${i}`,
          pos: { x: shootX, y: shootY },
          vel: { x: Math.cos(angle) * facing * speed, y: Math.sin(angle) * speed },
          width: 10, height: 10, health: 1, maxHealth: 1,
          type: 'projectile', damage: SHOTGUN_DAMAGE, owner: 'player', isIce: true
        });
      }
      player.shootCooldown = SHOTGUN_COOLDOWN;
      fx.playGunSound('ice');
      useAmmo();
      break;

    case 'NEEDLES':
      addProjectile({
        id: `dart-${Date.now()}`,
        pos: { x: shootX, y: shootY },
        vel: { x: facing * 24, y: (Math.random() - 0.5) * 5 },
        width: 20, height: 4, health: 1, maxHealth: 1,
        type: 'projectile', damage: NEEDLE_DAMAGE, owner: 'player', isDart: true
      });
      player.shootCooldown = NEEDLE_COOLDOWN;
      fx.playGunSound('dart');
      useAmmo();
      break;

    case 'FLAMETHROWER':
      fireFlamethrower(ctx, isMoveUp, isMoveDown);
      break;

    case 'SLUDGE':
      // Starts the barf stream (see updateBarfStream) and grants the filth shield
      player.barfTimer = 24;
      player.shootCooldown = SLUDGE_COOLDOWN;
      player.filthShieldTimer = FILTH_SHIELD_DURATION;
      useAmmo();
      fx.playGunSound('barf');
      break;

    case 'TSUNAMI':
      if (state.tsunamiActive) break;
      state.tsunamiActive = true;
      state.tsunamiDir = facing;
      state.tsunamiStartX = facing === 1 ? state.camera.x : state.camera.x + CANVAS_WIDTH;
      state.tsunamiX = state.tsunamiStartX;
      player.shootCooldown = TSUNAMI_COOLDOWN;
      fx.playGunSound('tsunami');
      useAmmo();
      break;

    case 'TASER':
      if (player.isTasing) break;
      player.isTasing = true;
      player.taserTimer = 0;
      player.taserTargetId = findTaserTarget(state)?.id ?? null;
      break;

    case 'OIL_ROCKET':
      addProjectile({
        id: `oil-${Date.now()}`,
        pos: { x: facing === 1 ? pos.x + width + 4 : pos.x - 44, y: shootY - 10 },
        vel: { x: facing * 24, y: 0 },
        width: 40, height: 20, health: 1, maxHealth: 1,
        type: 'projectile', damage: OIL_ROCKET_DAMAGE, owner: 'player', isOilRocket: true
      });
      player.shootCooldown = OIL_ROCKET_COOLDOWN;
      fx.playGunSound('oil');
      useAmmo();
      break;
  }
};

/** One puff of the sludge barf stream; called every frame while player.barfTimer runs. */
export const updateBarfStream = (state: GameState) => {
  const { player } = state;
  if (!player.barfTimer || player.barfTimer <= 0) return;
  player.barfTimer--;
  if (player.barfTimer % 2 !== 0) return;
  state.projectiles.push({
    id: `sludge-part-${Date.now()}-${player.barfTimer}`,
    pos: {
      x: player.pos.x + (player.facing === 1 ? player.width : -10),
      y: player.isDucking ? player.pos.y + 45 : player.pos.y + 25,
    },
    vel: { x: player.facing * (11 + Math.random() * 8), y: -3 - Math.random() * 9 },
    width: 22 + Math.random() * 15,
    height: 22 + Math.random() * 15,
    health: 1, maxHealth: 1,
    type: 'projectile', damage: SLUDGE_DAMAGE, owner: 'player', isSludge: true, life: 150
  });
};

/** A cone of fire that ramps up in range the longer it's held. Burns enemies and enemy shots. */
const fireFlamethrower = (ctx: FrameContext, isMoveUp: boolean, isMoveDown: boolean) => {
  const { state, fx, cheats, stageId, currentWeapon } = ctx;
  const { player } = state;
  const { facing, pos, width, isDucking } = player;

  let targetAngle = 0;
  if (isMoveUp) targetAngle = -Math.PI / 4;
  else if (isMoveDown) targetAngle = Math.PI / 4;
  player.flameAngle = targetAngle;

  player.flameTimer = (player.flameTimer || 0) + 1;
  const rampPct = Math.min(1.0, player.flameTimer / FLAMETHROWER_RAMP_FRAMES);
  const currentRange = FLAMETHROWER_RANGE + (FLAMETHROWER_MAX_RANGE - FLAMETHROWER_RANGE) * rampPct;

  // Everything below only happens every other frame
  if (state.frame % 2 !== 0) return;
  if (!cheats.infiniteAmmo) player.weaponAmmo['FLAMETHROWER']--;
  fx.playGunSound('flame');

  const spawnX = pos.x + (facing === 1 ? width - 5 : 5);
  const spawnY = isDucking ? pos.y + 45 : pos.y + 30;

  for (let i = 0; i < 6; i++) {
    const jitter = (Math.random() - 0.5) * 0.4;
    const speed = (8 + Math.random() * 8) * (1 + rampPct * 1.5);
    const finalAngle = targetAngle + jitter;
    state.particles.push({
      pos: { x: spawnX, y: spawnY },
      vel: { x: Math.cos(finalAngle) * facing * speed + player.vel.x, y: Math.sin(finalAngle) * speed },
      life: 15 + Math.random() * 20,
      color: pickRandom(PARTICLE_PALETTES.FIRE),
      size: 8 + Math.random() * 12
    });
  }

  const inCone = (entity: Enemy | Projectile) => {
    const dx = entity.pos.x + entity.width / 2 - spawnX;
    const dy = entity.pos.y + entity.height / 2 - spawnY;
    if (dx * dx + dy * dy > currentRange * currentRange) return false;
    return Math.abs(Math.atan2(dy, dx * facing) - targetAngle) < 0.35;
  };

  // Burn away enemy projectiles (except rubble, magma, enemy boulders and small ice shards)
  state.projectiles.forEach(p => {
    if (p.owner !== 'enemy' || !inCone(p)) return;
    const isIndestructible = p.id.startsWith('debris-') || p.id.startsWith('magma-') || p.isBoulder || (p.isIce && p.width <= 20);
    if ((p.isIce && p.width > 30) || !isIndestructible) {
      p.health = 0;
      fx.spawnExplosion(
        { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 },
        p.isIce ? COLORS.PROJECTILE_ICE : (p.id.startsWith('magma') ? '#FF4500' : COLORS.PROJECTILE_ENEMY),
        Math.min(10, Math.ceil(p.width / 5)), 0, 10
      );
    }
  });

  state.enemies.forEach(e => {
    if (e.health <= 0 || e.isBlownAway || !inCone(e)) return;
    if (e.type === 'boss') {
      if (!state.arenaLocked || (e.hitCooldown && e.hitCooldown > 0)) return;
      const dmg = getBossDamage(e, stageId, currentWeapon);
      const isW = checkIsWeakness(stageId, currentWeapon);
      e.health -= dmg;
      e.hitCooldown = 60;
      fx.spawnDamageNumber(e.pos, dmg, isW);
      if (stageId === 'Artie Avalanche' && isW && e.health > 0) artieWeaknessLeap(e);
      if (e.health <= 0) killBoss(ctx, e, facing, isW);
    } else if (e.isOiled) {
      e.isOiled = false;
      detonateNuke(ctx, { x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2 });
    } else {
      e.health -= FLAMETHROWER_DAMAGE;
      fx.spawnDamageNumber(e.pos, FLAMETHROWER_DAMAGE);
      if (e.health <= 0) {
        e.isBlownAway = true;
        e.vel = { x: (3 + rampPct * 10) * facing, y: -5 };
        player.killSatisfactionTimer = 60;
      }
    }
  });
};

/** Nearest on-screen enemy or meth barrel in front of the player, within taser range. */
export const findTaserTarget = (state: GameState): Enemy | Projectile | null => {
  const { player, camera } = state;
  const playerMidX = player.pos.x + player.width / 2;
  const playerMidY = player.pos.y + player.height / 2;
  let nearest: Enemy | Projectile | null = null;
  let minDist = TASER_RANGE;

  const consider = (t: Enemy | Projectile) => {
    const tx = t.pos.x + t.width / 2;
    const ty = t.pos.y + t.height / 2;
    if (tx <= camera.x || tx >= camera.x + CANVAS_WIDTH) return;
    const inFront = (player.facing === 1 && tx > playerMidX) || (player.facing === -1 && tx < playerMidX);
    if (!inFront) return;
    const dist = Math.hypot(tx - playerMidX, ty - playerMidY);
    if (dist < minDist) { minDist = dist; nearest = t; }
  };

  state.enemies.forEach(e => { if (e.health > 0 && !e.isBlownAway) consider(e); });
  state.projectiles.forEach(p => { if (p.isMethBarrel && p.health > 0) consider(p); });
  return nearest;
};

/** Oil rocket impact: splash damage, coats targets in oil and knocks them back. */
export const explodeOilRocket = (ctx: FrameContext, pos: Vector2, rocketVelX?: number) => {
  const { state, fx, stageId, currentWeapon } = ctx;
  fx.spawnOilSplatter(pos);

  state.enemies.forEach(e => {
    if (e.health <= 0 || e.isBlownAway) return;
    const dx = (e.pos.x + e.width / 2) - pos.x;
    const dy = (e.pos.y + e.height / 2) - pos.y;
    if (dx * dx + dy * dy >= OIL_ROCKET_SPLASH_RADIUS * OIL_ROCKET_SPLASH_RADIUS) return;

    if (e.type === 'boss') {
      if (e.hitCooldown && e.hitCooldown > 0) return;
      const isW = checkIsWeakness(stageId, currentWeapon, { isOilRocket: true });
      const dmg = getBossDamage(e, stageId, currentWeapon, { isOilRocket: true });
      e.health -= dmg;
      e.hitCooldown = ENEMY_HIT_COOLDOWN;
      e.isOiled = true;
      e.oiledTimer = OIL_ROCKET_OILED_DURATION;
      fx.spawnDamageNumber(e.pos, dmg, isW);

      if (stageId === 'Toxic Tommy' && isW && e.health > 0) {
        e.bossState = 'weakness_stunned';
        e.stateTimer = 75;
        e.pukeSweepProgress = 0;
        // Pop him up out of the sludge if he was submerged
        if (e.pos.y >= state.tommySludgeY - 30) {
          e.pos.y = 480 - e.height + 5;
          e.vel.y = -8;
        }
        state.tommySludgeOiledTimer = 240;
        fx.spawnExplosion({ x: e.pos.x + e.width / 2, y: Math.min(e.pos.y + 20, state.tommySludgeY) }, '#111111', 25, 0, 10);
        speakAsBoss('Toxic Tommy', "BLAARGH! CRUDE OIL?! I CAN'T CHUNDER!", ctx.bossHelpers);
      }
      if (e.health <= 0) killBoss(ctx, e, 0, isW);
      return;
    }

    e.health -= OIL_ROCKET_SPLASH_DAMAGE;
    e.isOiled = true;
    e.oiledTimer = OIL_ROCKET_OILED_DURATION;
    fx.spawnDamageNumber(e.pos, OIL_ROCKET_SPLASH_DAMAGE);

    const pushDir = (rocketVelX !== undefined && Math.abs(rocketVelX) > 0.1) ? Math.sign(rocketVelX) : (dx >= 0 ? 1 : -1);
    const isAirEnemy = e.enemyType === 'flyer' || e.enemyType === 'drone' || e.behavior === 'fly' || e.behavior === 'hover';

    if (e.health <= 0) {
      fx.blowAwayEnemy(e, { x: pushDir * 24 + (Math.random() - 0.5) * 6, y: -18 }, 'oil_kill', pushDir);
    } else if (isAirEnemy) {
      // Air enemies: forceful pushback
      e.vel.x = pushDir * 14;
      e.vel.y = -3;
      e.pauseTimer = 35;
    } else {
      // Grounded enemies: sent flying high and backward!
      e.vel.x = pushDir * 22;
      e.vel.y = -15;
      e.pauseTimer = 55;
    }
  });

  fx.playGunSound('oil');
  state.screenShakeTimer = 8;
};

/** Setting an oiled enemy on fire: a huge blast that wipes out everything nearby. */
export const detonateNuke = (ctx: FrameContext, pos: Vector2) => {
  const { state, fx } = ctx;
  for (let i = 0; i < 100; i++) {
    state.particles.push({
      pos: { ...pos },
      vel: { x: (Math.random() - 0.5) * 40, y: (Math.random() - 0.5) * 40 },
      life: 80 + Math.random() * 80,
      color: i % 2 === 0 ? '#FFFFFF' : '#FFD700',
      size: 15 + Math.random() * 20
    });
  }

  state.enemies.forEach(e => {
    if (e.health <= 0 || e.isBlownAway) return;
    const dx = (e.pos.x + e.width / 2) - pos.x;
    const dy = (e.pos.y + e.height / 2) - pos.y;
    if (dx * dx + dy * dy >= 250 * 250) return;
    e.health -= OIL_ROCKET_NUKE_DAMAGE;
    fx.spawnDamageNumber(e.pos, OIL_ROCKET_NUKE_DAMAGE, true, '#FF0000');
    if (e.health > 0) return;
    if (e.type === 'boss') killBoss(ctx, e, 0, true);
    else {
      fx.blowAwayEnemy(e, { x: (Math.random() - 0.5) * 40, y: -25 }, 'oil_kill', 0, 3);
      fx.spawnKillCallout(e, 'nuke');
    }
  });

  fx.playGunSound('tsunami');
  state.screenShakeTimer = 24;
};
