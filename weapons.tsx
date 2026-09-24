import { 
  Player, Projectile, Vector2, WeaponType, Particle, Enemy, DamageNumber, Vector2 as Vec2
} from './types';
import { 
  BULLET_DAMAGE, BOULDER_DAMAGE, BOULDER_SPEED, SHOTGUN_DAMAGE, 
  SHOTGUN_COOLDOWN, SHOTGUN_FREEZE_TIME, FLAMETHROWER_DAMAGE, 
  FLAMETHROWER_RANGE, FLAMETHROWER_MAX_RANGE, FLAMETHROWER_RAMP_FRAMES,
  TSUNAMI_COOLDOWN, COLORS, PARTICLE_PALETTES,
  MAX_AMMO, TASER_RANGE, CANVAS_WIDTH, GUN_COOLDOWN, GUN_VELOCITY,
  BOULDER_COOLDOWN, SHOTGUN_PELLET_COUNT, NEEDLE_DAMAGE, NEEDLE_COOLDOWN,
  SLUDGE_DAMAGE, SLUDGE_COOLDOWN, FILTH_SHIELD_DURATION,
  OIL_ROCKET_DAMAGE, OIL_ROCKET_COOLDOWN
} from './constants';
import * as BossLogic from './boss';

export interface WeaponHelpers {
  addProjectile: (p: Projectile) => void;
  addParticle: (p: Particle) => void;
  playGunSound: (type: 'gun' | 'ice' | 'flame' | 'tsunami' | 'dart' | 'horn' | 'ignite' | 'barf' | 'oil' | 'taser') => void;
  spawnExplosion: (pos: Vec2, color: string, count: number, baseVelX?: number, spread?: number) => void;
  spawnDamageNumber: (pos: Vec2, value: number | string, isCritical?: boolean, color?: string) => void;
  spawnGlassShatter: (pos: Vec2) => void;
  spawnNuke: (pos: Vec2) => void;
  setScreenShake: (duration: number) => void;
  triggerBossDeath: (boss: Enemy, facing: number, wasWeakness: boolean) => void;
}

export const fireWeapon = (
  player: Player, 
  state: any, 
  helpers: WeaponHelpers, 
  isMoveUp: boolean,
  isMoveDown: boolean,
  infiniteAmmo: boolean
) => {
  const { currentWeapon, facing, pos, width, isDucking } = player;
  const shootX = pos.x + (facing === 1 ? width : -10);
  const shootY = isDucking ? pos.y + 52 : pos.y + 25;

  if (currentWeapon === 'GUN') {
    helpers.addProjectile({ 
      id: `p-${Date.now()}`, 
      pos: { x: shootX, y: shootY }, 
      vel: { x: facing * GUN_VELOCITY, y: 0 }, 
      width: 16, height: 6, health: 1, maxHealth: 1, 
      type: 'projectile', damage: BULLET_DAMAGE, owner: 'player' 
    });
    player.shootCooldown = GUN_COOLDOWN;
    helpers.playGunSound('gun');
  } 
  else if (currentWeapon === 'BOULDER') {
    if (!state.projectiles.some((p: Projectile) => p.owner === 'player' && p.isBoulder)) {
      const vy = isMoveUp ? -18 : 0;
      const vx = isMoveUp ? facing * (BOULDER_SPEED * 0.9) : facing * BOULDER_SPEED;
      helpers.addProjectile({ 
        id: `b-${Date.now()}`, 
        pos: { x: player.pos.x + (facing === 1 ? width : -40), y: pos.y + 20 }, 
        vel: { x: vx, y: vy }, 
        width: 48, height: 48, health: 1, maxHealth: 1, 
        type: 'projectile', damage: BOULDER_DAMAGE, owner: 'player', isBoulder: true 
      });
      player.shootCooldown = BOULDER_COOLDOWN;
      if (!infiniteAmmo) player.weaponAmmo['BOULDER']--;
    }
  } 
  else if (currentWeapon === 'SHOTGUN') {
    for (let i = 0; i < SHOTGUN_PELLET_COUNT; i++) {
      const angle = (i - Math.floor(SHOTGUN_PELLET_COUNT/2)) * 0.15;
      const speed = 11 + Math.random() * 6;
      helpers.addProjectile({ 
        id: `pellet-${Date.now()}-${i}`, 
        pos: { x: shootX, y: shootY }, 
        vel: { x: Math.cos(angle) * facing * speed, y: Math.sin(angle) * speed }, 
        width: 10, height: 10, health: 1, maxHealth: 1, 
        type: 'projectile', damage: SHOTGUN_DAMAGE, owner: 'player', isIce: true 
      });
    }
    player.shootCooldown = SHOTGUN_COOLDOWN;
    helpers.playGunSound('ice');
    if (!infiniteAmmo) player.weaponAmmo['SHOTGUN']--;
  } 
  else if (currentWeapon === 'NEEDLES') {
    helpers.addProjectile({ 
      id: `dart-${Date.now()}`, 
      pos: { x: shootX, y: shootY }, 
      vel: { x: facing * 24, y: (Math.random() - 0.5) * 5 }, 
      width: 20, height: 4, health: 1, maxHealth: 1, 
      type: 'projectile', damage: NEEDLE_DAMAGE, owner: 'player', isDart: true 
    });
    player.shootCooldown = NEEDLE_COOLDOWN;
    helpers.playGunSound('dart');
    if (!infiniteAmmo) player.weaponAmmo['NEEDLES']--;
  } 
  else if (currentWeapon === 'FLAMETHROWER') {
    let targetAngle = 0;
    if (isMoveUp) targetAngle = -Math.PI / 4;
    else if (isMoveDown) targetAngle = Math.PI / 4;
    player.flameAngle = targetAngle;

    player.flameTimer = (player.flameTimer || 0) + 1;
    const rampPct = Math.min(1.0, player.flameTimer / FLAMETHROWER_RAMP_FRAMES);
    const currentRange = FLAMETHROWER_RANGE + (FLAMETHROWER_MAX_RANGE - FLAMETHROWER_RANGE) * rampPct;

    if (state.frame % 2 === 0) {
      if (!infiniteAmmo) player.weaponAmmo['FLAMETHROWER']--;
      helpers.playGunSound('flame');
      
      const spawnX = pos.x + (facing === 1 ? width - 5 : 5);
      const spawnY = isDucking ? pos.y + 45 : pos.y + 30;

      for (let i = 0; i < 6; i++) {
        const jitter = (Math.random() - 0.5) * 0.4;
        const speed = (8 + Math.random() * 8) * (1 + rampPct * 1.5);
        const finalAngle = targetAngle + jitter;
        helpers.addParticle({ 
          pos: { x: spawnX, y: spawnY }, 
          vel: { 
            x: Math.cos(finalAngle) * facing * speed + player.vel.x, 
            y: Math.sin(finalAngle) * speed 
          }, 
          life: 15 + Math.random() * 20, 
          color: PARTICLE_PALETTES.FIRE[Math.floor(Math.random() * PARTICLE_PALETTES.FIRE.length)], 
          size: 8 + Math.random() * 12 
        });
      }

      const checkHit = (entity: Enemy | Projectile) => {
        const entMidX = entity.pos.x + entity.width / 2;
        const entMidY = entity.pos.y + entity.height / 2;
        const dx = entMidX - spawnX;
        const dy = entMidY - spawnY;
        const distSq = dx * dx + dy * dy;
        if (distSq > currentRange * currentRange) return false;
        const angleToEntity = Math.atan2(dy, dx * facing);
        return Math.abs(angleToEntity - targetAngle) < 0.35;
      };

      state.projectiles.forEach((p: Projectile) => {
        if (p.owner === 'enemy' && checkHit(p)) {
          if ((p.isIce && p.width > 30) || !(p.id.startsWith('debris-') || p.id.startsWith('magma-') || (p.isBoulder && p.owner === 'enemy') || (p.isIce && p.width <= 20))) {
            p.health = 0;
            helpers.spawnExplosion(
              { x: p.pos.x + p.width/2, y: p.pos.y + p.height/2 }, 
              p.isIce ? COLORS.PROJECTILE_ICE : (p.id.startsWith('magma') ? '#FF4500' : COLORS.PROJECTILE_ENEMY), 
              Math.min(10, Math.ceil(p.width / 5)), 0, 10
            );
          }
        }
      });

      state.enemies.forEach((e: Enemy) => {
        if (e.health > 0 && !e.isBlownAway && checkHit(e)) {
          if (e.type === 'boss') {
            if (state.arenaLocked && (!e.hitCooldown || e.hitCooldown <= 0)) {
              const dmg = BossLogic.getBossDamage(e, state.stageId, currentWeapon);
              const isW = BossLogic.checkIsWeakness(state.stageId, currentWeapon);
              e.health -= dmg;
              e.hitCooldown = 60;
              helpers.spawnDamageNumber(e.pos, dmg, isW);
              if (state.stageId === 'Artie Avalanche' && isW && e.health > 0) {
                const tx = e.pos.x < 7560 ? 7850 : 7250;
                e.vel.y = -22;
                e.vel.x = (tx - e.pos.x) / 50;
                e.bossState = 'jumping';
                e.stateTimer = 60;
              }
              if (e.health <= 0) helpers.triggerBossDeath(e, facing, isW);
            }
          } else {
            if (e.isOiled) {
              e.isOiled = false;
              helpers.spawnNuke({ x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2 });
            } else {
              e.health -= FLAMETHROWER_DAMAGE;
              helpers.spawnDamageNumber(e.pos, FLAMETHROWER_DAMAGE);
              if (e.health <= 0) {
                e.isBlownAway = true;
                const pushVel = (3 + rampPct * 10) * facing;
                e.vel = { x: pushVel, y: -5 };
                player.killSatisfactionTimer = 60;
              }
            }
          }
        }
      });
    }
  } 
  else if (currentWeapon === 'SLUDGE') {
    // Sequential Barf Stream sequence
    player.barfTimer = 24; 
    player.shootCooldown = SLUDGE_COOLDOWN; // Exactly 1.5s
    player.filthShieldTimer = FILTH_SHIELD_DURATION; // Grant shield for full duration
    if (!infiniteAmmo) player.weaponAmmo['SLUDGE']--;
    helpers.playGunSound('barf');
  }
  else if (currentWeapon === 'TSUNAMI') {
    if (!state.tsunamiActive) {
      state.tsunamiActive = true;
      state.tsunamiDir = facing;
      state.tsunamiStartX = facing === 1 ? state.camera.x : state.camera.x + 800; 
      state.tsunamiX = state.tsunamiStartX;
      player.shootCooldown = TSUNAMI_COOLDOWN;
      helpers.playGunSound('tsunami');
      if (!infiniteAmmo) player.weaponAmmo['TSUNAMI']--;
    }
  }
  else if (currentWeapon === 'TASER') {
    if (!player.isTasing) {
      let nearest: (Enemy | Projectile) | null = null;
      let minDist = TASER_RANGE;
      const playerMidX = player.pos.x + player.width/2;
      const playerMidY = player.pos.y + player.height/2;

      state.enemies.forEach((e: Enemy) => {
        if (e.health > 0 && !e.isBlownAway) {
          const ex = e.pos.x + e.width/2;
          const ey = e.pos.y + e.height/2;
          if (ex > state.camera.x && ex < state.camera.x + CANVAS_WIDTH) {
            if ((facing === 1 && ex > playerMidX) || (facing === -1 && ex < playerMidX)) {
              const dx = ex - playerMidX;
              const dy = ey - playerMidY;
              const dist = Math.sqrt(dx*dx + dy*dy);
              if (dist < minDist) { minDist = dist; nearest = e; }
            }
          }
        }
      });

      state.projectiles.forEach((p: Projectile) => {
        if (p.isMethBarrel && p.health > 0) {
          const px = p.pos.x + p.width/2;
          const py = p.pos.y + p.height/2;
          if (px > state.camera.x && px < state.camera.x + CANVAS_WIDTH) {
            if ((facing === 1 && px > playerMidX) || (facing === -1 && px < playerMidX)) {
              const dx = px - playerMidX;
              const dy = py - playerMidY;
              const dist = Math.sqrt(dx*dx + dy*dy);
              if (dist < minDist) { minDist = dist; nearest = p; }
            }
          }
        }
      });

      player.isTasing = true;
      player.taserTimer = 0;
      if (nearest) {
        player.taserTargetId = (nearest as (Enemy | Projectile)).id;
      } else {
        player.taserTargetId = null;
      }
    }
  }
  else if (currentWeapon === 'OIL_ROCKET') {
    const rocketX = facing === 1 ? pos.x + width + 4 : pos.x - 44;
    helpers.addProjectile({ 
      id: `oil-${Date.now()}`, 
      pos: { x: rocketX, y: shootY - 10 }, 
      vel: { x: facing * 24, y: 0 }, 
      width: 40, height: 20, health: 1, maxHealth: 1, 
      type: 'projectile', damage: OIL_ROCKET_DAMAGE, owner: 'player', isOilRocket: true 
    });
    player.shootCooldown = OIL_ROCKET_COOLDOWN;
    helpers.playGunSound('oil');
    if (!infiniteAmmo) {
      if (!player.weaponAmmo || player.weaponAmmo['OIL_ROCKET'] === undefined) {
        if (!player.weaponAmmo) player.weaponAmmo = {} as any;
        player.weaponAmmo['OIL_ROCKET'] = MAX_AMMO['OIL_ROCKET'] || 15;
      }
      player.weaponAmmo['OIL_ROCKET']--;
    }
  }
};
