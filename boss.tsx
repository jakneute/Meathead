

import { 
  Enemy, Projectile, Vector2, WeaponType, Player, Volcano, SteamExplosion, VulgarityType, TommyBoard 
} from './types';
import { 
  BOSS_DIALOGUE, BULLET_DAMAGE, BOULDER_SPEED, BOSS_DOOR_X, 
  HECTOR_PULL_STRENGTH, GRAVITY, COLORS, PARTICLE_PALETTES, 
  BOSS_CHARGE_DAMAGE, BOSS_UPPERCUT_DAMAGE, ENEMY_UPPERCUT_DAMAGE,
  DALE_TRUCK_SPEED, METH_BARREL_DAMAGE, HECTOR_PULL_STRENGTH_ULT,
  TASER_BOSS_DAMAGE_REDUCTION, DALE_TRUCK_DAMAGE, DALE_PUSHBACK_VEL,
  BOSS_VULGARITY_DURATION, ERNIE_STOMP_VIBRATION_DURATION,
  TOMMY_PUKE_INVINCIBILITY_FRAMES, TOMMY_PUKE_PUSHBACK_DURATION,
  PLAYER_INVINCIBILITY_FRAMES, PLAYER_PUSHBACK_DURATION,
  PLAYER_PUSHBACK_VEL_X, PLAYER_PUSHBACK_VEL_Y
} from './constants';

export interface BossHelpers {
  spawnDamageNumber: (pos: Vector2, value: number | string, isCritical?: boolean, color?: string) => void;
  spawnDeathShower: (pos: Vector2, facing: number, multiplier?: number, isBossDeath?: boolean, spreadOverride?: number) => void;
  onBossDeath: () => void;
  speakVulgarity: (category: VulgarityType, hurtDetail?: string) => void;
  playGunSound: (type?: 'gun' | 'ice' | 'flame' | 'tsunami' | 'dart' | 'horn' | 'ignite' | 'barf') => void;
  spawnExplosion: (pos: Vector2, color: string, count: number, baseVelX?: number, spread?: number, isGlass?: boolean, isBossGore?: boolean) => void;
  spawnSteamExplosionParticles: (pos: Vector2, count?: number) => void;
  spawnPoopExplosion: (pos: Vector2, count?: number) => void;
  spawnPowderExplosion: (pos: Vector2, count?: number) => void;
  spawnMethExplosion: (pos: Vector2, count?: number) => void;
  spawnGlassShatter: (pos: Vector2) => void;
  setBossVulgarity: (text: string, duration: number) => void;
  setScreenShake: (duration: number) => void;
  setErnieVibration: (duration: number) => void;
  setPlayerStun: (duration: number) => void;
  addProjectile: (p: Projectile) => void;
  addVolcano: (v: Volcano) => void;
  clearVolcanoes: () => void;
  addVolcanoTelegraph: (v: Volcano) => void;
  clearVolcanoTelegraphs: () => void;
  addPoopTelegraph: (t: { pos: Vector2, life: number, spawnX: number }) => void;
  clearPoopTelegraphs: () => void;
  setVictorWallSide: (side: number) => void;
  setTsunamiActive: (active: boolean) => void;
}

export const speakAsBoss = (bossId: string, text: string, helpers: BossHelpers) => {
  helpers.setBossVulgarity(text, BOSS_VULGARITY_DURATION);
  if ('speechSynthesis' in window) {
    if (window.speechSynthesis.speaking) return;
    const utterance = new SpeechSynthesisUtterance(text);
    switch (bossId) {
      case 'Artie Avalanche': utterance.pitch = 1.6; utterance.rate = 0.85; break;
      case 'Victor Volcano': utterance.pitch = 0.7; utterance.rate = 0.85; break;
      case 'Ernie Earthquake': utterance.pitch = 0.1; utterance.rate = 0.55; break;
      case 'Hector Hurricane': utterance.pitch = 1.2; utterance.rate = 1.5; break;
      case 'Drug Trade Dale': utterance.pitch = 1.8; utterance.rate = 1.1; break;
      case 'Toxic Tommy': utterance.pitch = 0.4; utterance.rate = 0.8; break;
      case 'Blackout Barry': utterance.pitch = 0.9; utterance.rate = 1.4; break;
      case 'Oily Oscar': utterance.pitch = 1.3; utterance.rate = 0.9; break;
      default: utterance.pitch = 1.0; utterance.rate = 1.0;
    }
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
    helpers.setBossVulgarity(text, BOSS_VULGARITY_DURATION);
  }
};

export const checkIsWeakness = (stageId: string | null, currentWeapon: WeaponType, p?: Partial<Projectile>) => {
  if (!p) {
    if (stageId === 'Artie Avalanche' && currentWeapon === 'FLAMETHROWER') return true;
    if (stageId === 'Victor Volcano' && currentWeapon === 'TSUNAMI') return true;
    if (stageId === 'Ernie Earthquake' && currentWeapon === 'SHOTGUN') return true;
    if (stageId === 'Hector Hurricane' && currentWeapon === 'BOULDER') return true;
    if (stageId === 'Drug Trade Dale' && currentWeapon === 'SLUDGE') return true;
    if (stageId === 'Blackout Barry' && currentWeapon === 'NEEDLES') return true;
    if (stageId === 'Toxic Tommy' && currentWeapon === 'OIL_ROCKET') return true;
    return false;
  }
  if (stageId === 'Hector Hurricane' && p.isBoulder) return true;
  if (stageId === 'Victor Volcano' && p.isTsunami) return true;
  if (stageId === 'Artie Avalanche' && (p.owner === 'player' && currentWeapon === 'FLAMETHROWER')) return true;
  if (stageId === 'Ernie Earthquake' && p.isIce) return true;
  if (stageId === 'Drug Trade Dale' && p.isSludge) return true;
  if (stageId === 'Blackout Barry' && p.isDart) return true;
  if (stageId === 'Toxic Tommy' && (p.isOilRocket || currentWeapon === 'OIL_ROCKET')) return true;
  return false;
};

export const getBossDamage = (boss: Enemy, stageId: string | null, currentWeapon: WeaponType, p?: Partial<Projectile>) => {
  if (stageId === 'Victor Volcano' && (p?.isTsunami || (!p && currentWeapon === 'TSUNAMI'))) return 150;
  if (stageId === 'Blackout Barry' && (p?.isDart || (!p && currentWeapon === 'NEEDLES'))) return 0;
  if (stageId === 'Toxic Tommy' && (p?.isOilRocket || (!p && currentWeapon === 'OIL_ROCKET'))) return 100;
  const isWeak = checkIsWeakness(stageId, currentWeapon, p);
  if (isWeak) return 100;
  if (currentWeapon === 'TASER') return Math.floor(BULLET_DAMAGE * TASER_BOSS_DAMAGE_REDUCTION);
  return BULLET_DAMAGE;
};

export const triggerBossDeath = (boss: Enemy, playerFacing: number, wasWeakness: boolean, stageId: string | null, currentWeapon: WeaponType, state: any, helpers: BossHelpers) => {
  if (state.bossExplosionTimer > 0) return;
  const pos = { x: boss.pos.x + boss.width / 2, y: boss.pos.y + boss.height / 2 };
  
  if (stageId && BOSS_DIALOGUE.THRESHOLDS[stageId]) {
    speakAsBoss(stageId, BOSS_DIALOGUE.THRESHOLDS[stageId][0], helpers);
  }

  state.bossVolcanoes = [];
  state.bossVolcanoTelegraphs = [];
  state.bossPoopTelegraphs = [];
  state.bossSteamExplosions = [];
  state.ernieVibrationTimer = 0;
  state.projectiles = [];
  state.tsunamiActive = false;
  state.tsunamiX = -1;
  state.tommySludgeOiledTimer = 0;

  // Clear lingering effects like puke shield, stream, taser, etc. when stage/boss is cleared
  if (state.player) {
    state.player.filthShieldTimer = 0;
    state.player.barfTimer = 0;
    state.player.flameTimer = 0;
    state.player.isTasing = false;
    state.player.taserTargetId = null;
    state.player.taserTimer = 0;
    state.player.isCharging = false;
    state.player.isUppercutting = false;
    state.player.pushbackTimer = 0;
  }
  state.playerStunTimer = 0;

  if (wasWeakness) {
    state.bossExplosionTimer = 180; 
    state.bossExplosionPos = pos;
    helpers.spawnDeathShower(state.bossExplosionPos, playerFacing, 35, true, 120); 
  } else {
    helpers.spawnDeathShower(pos, playerFacing, 6, true, 45);
    helpers.onBossDeath(); 
    state.victoryString = "V"; 
    state.postVictoryTimer = 0;
  }
  state.player.killSatisfactionTimer = 0;
  state.player.bossKillSatisfactionTimer = 240; 
  state.arenaLocked = false;
  
  let cat: VulgarityType = 'gun_kill';
  if (currentWeapon === 'BOULDER') cat = 'boulder_kill';
  else if (currentWeapon === 'SHOTGUN') cat = 'shotgun_kill';
  else if (currentWeapon === 'FLAMETHROWER') cat = 'flamethrower_kill';
  else if (currentWeapon === 'TSUNAMI') cat = 'tsunami_kill';
  else if (currentWeapon === 'SLUDGE') cat = 'sludge_kill';
  else if (currentWeapon === 'NEEDLES') {
    cat = 'dart_kill';
    helpers.spawnDamageNumber(boss.pos, "OVERDOSE!", true, "#FF00FF");
  }
  helpers.speakVulgarity(cat);
};

export const updateBossAI = (
  boss: Enemy, 
  stageId: string | null, 
  player: Player, 
  currentWeapon: WeaponType, 
  invincibilityEnabled: boolean,
  state: any, 
  helpers: BossHelpers
) => {
  boss.stateTimer = (boss.stateTimer || 0) - 1;
  const dirToPlayer = player.pos.x + player.width/2 < boss.pos.x + boss.width/2 ? -1 : 1;
  const healthPct = (boss.health / boss.maxHealth) * 100;
  
  if (stageId && BOSS_DIALOGUE.THRESHOLDS[stageId]) {
    if (healthPct <= 75 && !boss.said75) { boss.said75 = true; speakAsBoss(stageId, BOSS_DIALOGUE.THRESHOLDS[stageId][75], helpers); }
    if (healthPct <= 50 && !boss.said50) { boss.said50 = true; speakAsBoss(stageId, BOSS_DIALOGUE.THRESHOLDS[stageId][50], helpers); }
    if (healthPct <= 25 && !boss.said25) { boss.said25 = true; speakAsBoss(stageId, BOSS_DIALOGUE.THRESHOLDS[stageId][25], helpers); }
  }

  if (stageId === 'Drug Trade Dale') {
    handleDaleAI(boss, player, invincibilityEnabled, state, helpers);
  } else if (stageId === 'Hector Hurricane') {
    handleHectorAI(boss, player, invincibilityEnabled, state, helpers);
  } else if (stageId === 'Artie Avalanche') {
    handleArtieAI(boss, player, state, helpers);
  } else if (stageId === 'Ernie Earthquake') {
    handleErnieAI(boss, player, state, helpers);
  } else if (stageId === 'Victor Volcano') {
    handleVictorAI(boss, player, healthPct, state, helpers);
  } else if (stageId === 'Blackout Barry') {
    handleBlackoutAI(boss, player, state, helpers);
  } else if (stageId === 'Toxic Tommy') {
    handleTommyAI(boss, player, invincibilityEnabled, state, helpers);
  }

  if (boss.bossState !== 'stunned_drop' && stageId !== 'Drug Trade Dale' && stageId !== 'Blackout Barry' && stageId !== 'Toxic Tommy') {
    const gravityMult = (stageId === 'Artie Avalanche' || (stageId === 'Ernie Earthquake' && !boss.isGroundedBoss)) ? 0.5 : 1.0;
    boss.vel.y += GRAVITY * gravityMult; 
    boss.pos.x += boss.vel.x; 
    const prevY = boss.pos.y; 
    boss.pos.y += boss.vel.y;
    boss.pos.x = Math.max(BOSS_DOOR_X + 10, Math.min(8000 - boss.width - 10, boss.pos.x));
    if (boss.pos.y < 100) { boss.pos.y = 100; boss.vel.y = 0; }
    
    let bossGroundedOnBlock = false;
    if (boss.vel.y >= 0) {
      for (const b of state.blocks) {
        if (b.type === 'platform' || b.type === 'ground') {
          if (boss.pos.x < b.x + b.w && boss.pos.x + boss.width > b.x && prevY + boss.height <= b.y && boss.pos.y + boss.height >= b.y) {
            boss.pos.y = b.y - boss.height;
            if (stageId === 'Ernie Earthquake' && prevY < b.y - boss.height) { helpers.setScreenShake(30); helpers.setErnieVibration(ERNIE_STOMP_VIBRATION_DURATION); }
            boss.vel.y = 0; boss.vel.x = 0; boss.isGroundedBoss = true; bossGroundedOnBlock = true;
            if (boss.bossState === 'jumping' && stageId !== 'Victor Volcano' && stageId !== 'Hector Hurricane') boss.bossState = 'idle';
            break;
          }
        }
      }
    }
    if (!bossGroundedOnBlock) {
      if (boss.pos.y > 470) {
        boss.pos.y = 470; 
        if (prevY < 470 && boss.vel.y > 0 && stageId === 'Ernie Earthquake') {
          helpers.setScreenShake(30); helpers.setErnieVibration(ERNIE_STOMP_VIBRATION_DURATION); 
          helpers.addProjectile({ id: `b-ernie-land-${Date.now()}`, pos: { x: boss.pos.x + boss.width/2, y: boss.pos.y + 20 }, vel: { x: dirToPlayer * (BOULDER_SPEED + 1), y: 0 }, width: 48, height: 48, health: 1, maxHealth: 1, type: 'projectile', damage: BULLET_DAMAGE, owner: 'enemy', isBoulder: true });
        }
        boss.vel.y = 0; boss.vel.x = 0; boss.isGroundedBoss = true;
        if (boss.bossState === 'jumping' && stageId !== 'Victor Volcano' && stageId !== 'Hector Hurricane') boss.bossState = 'idle';
      } else boss.isGroundedBoss = false;
    }
  } else if (boss.bossState === 'stunned_drop') { 
    boss.vel.y += GRAVITY * 1.5; boss.pos.y += boss.vel.y; 
    if (boss.pos.y > 470) { boss.pos.y = 470; boss.vel.y = 0; boss.isGroundedBoss = true; if (boss.stateTimer! > 30) boss.stateTimer = 30; } 
  }
};

const handleDaleAI = (boss: Enemy, player: Player, invincibilityEnabled: boolean, state: any, helpers: BossHelpers) => {
  if (boss.bossState === 'idle' && boss.stateTimer! <= 0) {
    boss.bossState = 'truck_incoming';
    boss.stateTimer = 100;
    boss.truckX = BOSS_DOOR_X - 600;
    boss.truckActive = true;
    helpers.playGunSound('horn');
  } else if (boss.bossState === 'truck_incoming') {
    boss.truckX! += DALE_TRUCK_SPEED; 
    const tx = boss.truckX!, ty = 400, tw = 350, th = 150;
    if (player.pos.x < tx + tw && player.pos.x + player.width > tx && player.pos.y < ty + th && player.pos.y + player.height > ty && player.invincibilityTimer <= 0 && !invincibilityEnabled) {
      player.health -= DALE_TRUCK_DAMAGE; 
      player.invincibilityTimer = PLAYER_INVINCIBILITY_FRAMES;
      player.hurtTimer = PLAYER_INVINCIBILITY_FRAMES;
      player.isHarmlessPushback = false;
      player.smugTimer = 0;
      player.pushbackTimer = PLAYER_PUSHBACK_DURATION;
      player.vel = { x: DALE_PUSHBACK_VEL.x, y: PLAYER_PUSHBACK_VEL_Y };
      helpers.speakVulgarity('hurt', 'truck');
    }
    state.projectiles.forEach((p: Projectile) => {
      if (p.isMethBarrel && p.health > 0) {
        if (p.pos.x < tx + tw && p.pos.x + p.width > tx && p.pos.y < ty + th && p.pos.y + p.height > ty) {
          p.health = -1; 
        }
      }
    });

    if (boss.truckX! > 8200) {
      boss.truckActive = false;
      boss.bossState = 'using_shipment';
      const drugs: ('cocaine' | 'speed' | 'meth')[] = ['cocaine', 'speed', 'meth'];
      boss.shipmentType = drugs[Math.floor(Math.random() * drugs.length)];
      boss.shipmentCount = boss.shipmentType === 'cocaine' ? 10 : (boss.shipmentType === 'meth' ? 5 : 1);
      boss.stateTimer = 30;
    }
  } else if (boss.bossState === 'using_shipment') {
    if (boss.stateTimer! <= 0) {
      if (boss.shipmentType === 'cocaine') {
        const rangeRoll = Math.random();
        let vx, vy;
        if (rangeRoll < 0.3) { 
          vx = -2 - Math.random() * 3;
          vy = -18 - Math.random() * 6;
        } else if (rangeRoll < 0.75) { 
          vx = -10 - Math.random() * 5;
          vy = -14 - Math.random() * 5;
        } else { 
          vx = -20 - Math.random() * 8;
          vy = -8 - Math.random() * 4;
        }

        helpers.addProjectile({ 
          id: `coke-${Date.now()}`, 
          pos: { x: boss.pos.x, y: boss.pos.y + 20 }, 
          vel: { x: vx, y: vy }, 
          width: 25, height: 25, health: 1, maxHealth: 1, 
          type: 'projectile', damage: 30, owner: 'enemy', isCocaine: true 
        });
        boss.shipmentCount!--;
        boss.stateTimer = 20;
        if (boss.shipmentCount! <= 0) { boss.bossState = 'idle'; boss.stateTimer = 80; }
      } else if (boss.shipmentType === 'meth') {
        helpers.addProjectile({ 
          id: `meth-${Date.now()}`, 
          pos: { x: boss.pos.x, y: boss.pos.y }, 
          vel: { x: -4 - Math.random() * 3, y: -12 }, 
          width: 40, height: 50, health: 100, maxHealth: 100, 
          type: 'projectile', damage: METH_BARREL_DAMAGE, owner: 'enemy', isMethBarrel: true, bounces: 15
        });
        boss.shipmentCount!--;
        boss.stateTimer = 45; 
        if (boss.shipmentCount! <= 0) { boss.bossState = 'idle'; boss.stateTimer = 100; }
      } else if (boss.shipmentType === 'speed') {
        boss.bossState = 'speed_dash';
        boss.dashCount = 8;
        boss.vel.x = -25;
        boss.stateTimer = 0;
        helpers.playGunSound('ice'); 
      }
    }
  } else if (boss.bossState === 'speed_dash') {
    boss.pos.x += boss.vel.x;
    if (boss.pos.x < BOSS_DOOR_X + 20 || boss.pos.x + boss.width > 7980) {
      boss.vel.x *= -1;
      boss.dashCount!--;
      helpers.setScreenShake(10);
      if (boss.dashCount! <= 0) {
        boss.pos.x = 7840; 
        boss.vel.x = 0;
        boss.bossState = 'idle';
        boss.stateTimer = 150;
      }
    }
  }
};

const handleHectorAI = (boss: Enemy, player: Player, invincibilityEnabled: boolean, state: any, helpers: BossHelpers) => {
  if (boss.bossState === 'hurricane') {
    const forceDir = (boss.pos.x + boss.width/2 - (player.pos.x + player.width/2)) > 0 ? 1 : -1;
    state.totalPullForceX += forceDir * HECTOR_PULL_STRENGTH_ULT;
    
    state.projectiles.forEach((p: Projectile) => {
      if (p.owner === 'player' && p.isBoulder) {
        const pullDir = (boss.pos.x + boss.width/2 - (p.pos.x + p.width/2)) > 0 ? 1 : -1;
        p.vel.x += pullDir * 1.5; 
      }
      if (p.isPoop) p.vel.x += forceDir * HECTOR_PULL_STRENGTH;
    });

    state.bossPoopTelegraphs = state.bossPoopTelegraphs.filter((t: any) => {
      t.life--;
      if (t.life <= 0) {
        const spawnLeft = t.spawnX < 7600; // Based on new spawn logic
        const velX = spawnLeft ? 12 : -12;
        helpers.addProjectile({ id: `poop-${Date.now()}`, pos: { x: t.spawnX, y: t.pos.y }, vel: { x: velX, y: 0 }, width: 45, height: 20, health: 1, maxHealth: 1, type: 'projectile', damage: 12, owner: 'enemy', isPoop: true, spawnX: t.spawnX });
        return false;
      }
      return true;
    });

    if (state.frame % 90 === 0) { 
      // Changed spawns to be inside the arena (approx 7240 to 7960)
      // Left spawn inside door, Right spawn inside right wall
      const spawnLeft = forceDir > 0;
      const spawnX = spawnLeft ? BOSS_DOOR_X + 60 : 7940; 
      const r = Math.random(); let spawnY;
      if (r < 0.33) spawnY = 510; else if (r < 0.66) spawnY = 498; else spawnY = 440;
      helpers.addPoopTelegraph({ pos: { x: spawnX, y: spawnY }, life: 60, spawnX: spawnX });
    }
    
    if (Math.abs((boss.pos.x + boss.width/2) - (player.pos.x + player.width/2)) < 300 && player.invincibilityTimer <= 0 && !invincibilityEnabled) {
      player.health -= 3; if (player.health > 0) { player.invincibilityTimer = PLAYER_INVINCIBILITY_FRAMES; player.pushbackTimer = PLAYER_PUSHBACK_DURATION; helpers.speakVulgarity('hurt', 'wind'); }
    }
    if (boss.stateTimer! <= 0) { boss.bossState = 'idle'; boss.stateTimer = 40; helpers.clearPoopTelegraphs(); }
  } else if (boss.bossState === 'jumping') {
    if (boss.isGroundedBoss) { boss.bossState = 'hurricane'; boss.stateTimer = 300; boss.vel.x = 0; }
  } else if (boss.stateTimer! <= 0) {
    boss.bossState = 'jumping'; boss.vel.y = -22 - Math.random() * 4;
    const targetX = boss.pos.x > 7600 ? 7300 : 7900; boss.vel.x = (targetX - boss.pos.x) * 0.035;
  }
};

const handleArtieAI = (boss: Enemy, player: Player, state: any, helpers: BossHelpers) => {
  if (boss.shootTimer > 0) boss.shootTimer--;
  if (boss.isGroundedBoss && Math.abs(boss.vel.x) < 0.5) boss.sideTimer = (boss.sideTimer || 0) + 1; else boss.sideTimer = 0;
  if ((boss.stateTimer! <= 0 || (boss.sideTimer || 0) > 175) && boss.isGroundedBoss) {
    const r = Math.random(); const mustMove = (boss.sideTimer || 0) > 120;
    if (r < 0.35 || (mustMove && r < 0.6)) { 
      boss.vel.y = -13 - Math.random() * 3; boss.vel.x = (player.pos.x < boss.pos.x ? -1 : 1) * (4 + Math.random() * 2); boss.stateTimer = 70; boss.bossState = 'jumping'; boss.sideTimer = 0; 
    } else if (r < 0.70 && boss.shootTimer <= 0 && !mustMove) { 
      const targetDir = player.pos.x < (boss.pos.x + boss.width/2) ? -1 : 1, projW = 60;
      helpers.addProjectile({ id: `ice-big-${Date.now()}`, pos: { x: targetDir === 1 ? boss.pos.x + boss.width + 5 : boss.pos.x - projW - 5, y: boss.pos.y + 10 }, vel: { x: targetDir * 11, y: 0 }, width: projW, height: 60, health: 1, maxHealth: 1, type: 'projectile', damage: BULLET_DAMAGE, owner: 'enemy', isIce: true });
      boss.shootTimer = 60; boss.stateTimer = 80; boss.bossState = 'attacking';
    } else { boss.vel.x = (player.pos.x + player.width/2 < boss.pos.x + boss.width/2 ? -1 : 1) * 7.5; boss.stateTimer = 65; boss.bossState = 'attacking'; boss.sideTimer = 0; }
  }
  if (boss.bossState === 'jumping' && !boss.isGroundedBoss && boss.shootTimer <= 0) {
    if (Math.abs(boss.vel.y) < 2 && boss.stateTimer! > 20 && Math.random() < 0.08) { 
      const targetDir = player.pos.x < (boss.pos.x + boss.width/2) ? -1 : 1, projW = 60;
      helpers.addProjectile({ id: `ice-big-air-${Date.now()}`, pos: { x: targetDir === 1 ? boss.pos.x + boss.width + 5 : boss.pos.x - projW - 5, y: boss.pos.y + 10 }, vel: { x: targetDir * 11, y: 0 }, width: projW, height: 60, health: 1, maxHealth: 1, type: 'projectile', damage: BULLET_DAMAGE, owner: 'enemy', isIce: true });
      boss.shootTimer = 60; boss.stateTimer = 50; 
    }
  }
  if (boss.isGroundedBoss) boss.vel.x *= 0.95;
};

export const handleErnieAI = (boss: Enemy, player: Player, state: any, helpers: BossHelpers) => {
  if (boss.bossState === 'stunned_drop') { if (boss.isGroundedBoss && boss.stateTimer! <= 0) { boss.bossState = 'idle'; boss.stateTimer = 40; boss.rotation = 0; } } 
  else if (boss.stateTimer! <= 0) {
    const dirToPlayer = player.pos.x + player.width/2 < boss.pos.x + boss.width/2 ? -1 : 1;
    boss.vel.y = -12; boss.vel.x = (player.pos.x - boss.pos.x) * 0.03; boss.stateTimer = 180; 
    helpers.addProjectile({ id: `b-ernie-jump-${Date.now()}`, pos: { x: boss.pos.x + boss.width/2, y: boss.pos.y + 20 }, vel: { x: dirToPlayer * (BOULDER_SPEED + 1), y: 0 }, width: 48, height: 48, health: 1, maxHealth: 1, type: 'projectile', damage: BULLET_DAMAGE, owner: 'enemy', isBoulder: true });
  }
};

const handleVictorAI = (boss: Enemy, player: Player, healthPct: number, state: any, helpers: BossHelpers) => {
  const victorMidX = boss.pos.x + boss.width / 2;
  if (boss.bossState === 'attacking') {
    boss.vel.x = 0; if (state.bossVolcanoes.length === 0 && boss.stateTimer! <= 0) { boss.bossState = 'idle'; boss.stateTimer = 40; }
  } else if (boss.bossState === 'telegraphing') {
    boss.vel.x = 0;
    if (boss.stateTimer! <= 0) {
      boss.bossState = 'attacking'; boss.stateTimer = 180;
      state.bossVolcanoTelegraphs.forEach((t: Volcano) => helpers.addVolcano({ pos: t.pos, life: 180, type: t.type }));
      helpers.clearVolcanoTelegraphs();
    }
  } else if (boss.bossState === 'jumping') {
    if (boss.isGroundedBoss) {
      boss.bossState = 'telegraphing'; boss.stateTimer = 60;
      helpers.clearVolcanoTelegraphs();
      const newSide = (state.victorWallSide + 1) % 2;
      helpers.setVictorWallSide(newSide);
      // Wall turrets exactly on walls
      helpers.addVolcanoTelegraph({ pos: { x: newSide === 0 ? BOSS_DOOR_X : 8000, y: 250 + Math.random() * 200 }, life: 60, type: 'wall' });
      
      const groundCount = healthPct > 50 ? 1 : 2;
      const groundXs: number[] = [];
      for(let i=0; i<groundCount; i++) {
        let tx = 0, attempts = 0, valid = false;
        while(!valid && attempts < 20) {
          tx = BOSS_DOOR_X + 150 + Math.random() * 500;
          valid = Math.abs(tx - victorMidX) > 150; 
          if (valid) for (const existingX of groundXs) if (Math.abs(tx - existingX) < 100) { valid = false; break; }
          attempts++;
        }
        groundXs.push(tx);
        // Ground turrets exactly on ground line (y=550)
        helpers.addVolcanoTelegraph({ pos: { x: Math.max(BOSS_DOOR_X + 50, Math.min(7900, tx)), y: 550 }, life: 60, type: 'ground' });
      }
    }
  } else if (boss.stateTimer! <= 0) {
    boss.vel.y = -20 - Math.random() * 5;
    const platforms = state.blocks.filter((b: any) => b.type === 'platform' && b.x > BOSS_DOOR_X);
    if (platforms.length > 0) {
      const targetPlate = platforms[Math.floor(Math.random() * platforms.length)];
      boss.vel.x = (targetPlate.x + targetPlate.w / 2 - victorMidX) * 0.04;
    } else { boss.vel.x = (player.pos.x < boss.pos.x ? -1 : 1) * 4 + (Math.random()-0.5)*2; }
    boss.bossState = 'jumping'; boss.stateTimer = 60;
  }
  if (boss.isGroundedBoss) boss.vel.x *= 0.95;
};

const handleBlackoutAI = (boss: Enemy, player: Player, state: any, helpers: BossHelpers) => {
  if (boss.bossState === 'idle' && boss.stateTimer! <= 0) {
    boss.bossState = 'blackout_teleport';
    boss.stateTimer = 260; // Snappier teleportation phase
    boss.jumpCount = 0; 
    boss.shootTimer = 0; 
    helpers.setScreenShake(10);
  } else if (boss.bossState === 'blackout_teleport') {
    boss.shootTimer = (boss.shootTimer || 0) + 1;
    const teleportInterval = Math.max(6, Math.floor(26 - (boss.jumpCount || 0) * 2));
    
    if (boss.shootTimer >= teleportInterval) {
      boss.shootTimer = 0;
      boss.jumpCount = (boss.jumpCount || 0) + 1;
      
      const xRange = 7900 - (BOSS_DOOR_X + 100);
      boss.pos.x = BOSS_DOOR_X + 100 + Math.random() * xRange;
      boss.pos.y = 100; // High teleport height
      
      helpers.spawnExplosion({ x: boss.pos.x + boss.width/2, y: boss.pos.y + boss.height/2 }, '#2E1A47', 8, 0, 5);
      helpers.playGunSound('ignite');
    }

    if (boss.stateTimer! <= 0) {
      boss.bossState = 'telegraphing';
      boss.jumpCount = Math.random() > 0.5 ? 1 : 0; // 0 = Downward (Ground Pound), 1 = Outward (Lightning Storm)
      boss.stateTimer = 90; 
      boss.pos.y = 100;
      boss.pos.x = (player.pos.x < 7600) ? 7700 : BOSS_DOOR_X + 250;
      boss.electrifiedTimer = 0;
      boss.activeLightningStrikes = [];
      helpers.playGunSound('ignite');
    }
  } else if (boss.bossState === 'telegraphing') {
    if (boss.stateTimer! <= 0) {
      if (boss.jumpCount === 0) {
        boss.bossState = 'ground_pound';
        boss.stateTimer = 90; 
        boss.electrifiedTimer = 0;
        boss.activeLightningStrikes = [];
      } else {
        boss.bossState = 'lightning_storm';
        boss.stateTimer = 130;
        boss.activeLightningStrikes = [];
        helpers.setScreenShake(15);
        helpers.playGunSound('ignite');
      }
    }
  } else if (boss.bossState === 'ground_pound') {
    // Drop logic: Move rapidly toward floor (Floor is y=550, boss height=80, touching floor is y=470)
    if (boss.pos.y < 470) {
      boss.pos.y = Math.min(470, boss.pos.y + 60);
    } else {
      boss.pos.y = 470; // Floor flush
    }

    // When boss lands on the ground, trigger a half-second (30 frames) perimeter electrification
    if (boss.pos.y >= 470) {
      if (boss.electrifiedTimer === undefined || boss.electrifiedTimer === 0) {
        boss.electrifiedTimer = 30; // Half second (30 frames at 60fps)
        helpers.setScreenShake(25);
        helpers.playGunSound('tsunami');
        helpers.spawnExplosion({ x: boss.pos.x + boss.width / 2, y: 540 }, '#ffff00', 15, 0, 10);
        helpers.spawnExplosion({ x: boss.pos.x, y: 540 }, '#00ffff', 10, -5, 8);
        helpers.spawnExplosion({ x: boss.pos.x + boss.width, y: 540 }, '#00ffff', 10, 5, 8);
      } else if (boss.electrifiedTimer > 0) {
        boss.electrifiedTimer--;

        // Brief hurtbox for the half-second while electrified:
        // Forces a jump (not touching floor), but not an uppercut (not touching ceiling), and not hugging walls!
        const touchesFloor = player.isGrounded || (player.pos.y + player.height >= 540);
        const touchesCeiling = player.pos.y <= 150;
        const touchesWall = player.pos.x <= 7260 || (player.pos.x + player.width >= 7940);

        if ((touchesFloor || touchesCeiling || touchesWall) && (player.invincibilityTimer || 0) <= 0) {
          player.health -= 11;
          player.invincibilityTimer = PLAYER_INVINCIBILITY_FRAMES;
          player.pushbackTimer = PLAYER_PUSHBACK_DURATION;
          player.vel = { x: (player.pos.x < boss.pos.x ? -1 : 1) * PLAYER_PUSHBACK_VEL_X, y: PLAYER_PUSHBACK_VEL_Y };
          helpers.spawnExplosion({ x: player.pos.x + player.width / 2, y: player.pos.y + player.height / 2 }, '#ffff00', 12, 0, 10);
          helpers.playGunSound('gun');
          helpers.speakVulgarity('hurt', 'electric');
        }

        if (boss.electrifiedTimer <= 0) {
          // Half-second electrification complete; Barry enters exhausted state
          boss.bossState = 'exhausted';
          boss.stateTimer = 150;
          boss.pos.y = 470;
        }
      }
    }
  } else if (boss.bossState === 'lightning_storm') {
    boss.activeLightningStrikes = boss.activeLightningStrikes || [];

    // Periodically spawn new vertical strikes across the arena (excluding directly under boss)
    if (boss.stateTimer! % 10 === 0 && boss.stateTimer! > 25) {
      const safeXMin = boss.pos.x - 70;
      const safeXMax = boss.pos.x + boss.width + 70;

      for (let s = 0; s < 2; s++) {
        let strikeX = 7260 + Math.random() * (7940 - 7260);
        if (strikeX >= safeXMin && strikeX <= safeXMax) {
          strikeX = strikeX < (safeXMin + safeXMax) / 2 ? safeXMin - 60 - Math.random() * 80 : safeXMax + 60 + Math.random() * 80;
        }
        strikeX = Math.max(7260, Math.min(7940, strikeX));
        boss.activeLightningStrikes.push({
          x: strikeX,
          duration: 35, // Persists for ~35 frames (> 0.5s)
          maxDuration: 35,
          width: 70
        });
        helpers.spawnExplosion({ x: strikeX, y: 530 }, '#ffffff', 5, 0, 5);
      }
      helpers.playGunSound('gun');
      helpers.setScreenShake(8);
    }

    // Update strikes and apply sustained hurtbox for as long as each bolt persists
    for (let i = boss.activeLightningStrikes.length - 1; i >= 0; i--) {
      const strike = boss.activeLightningStrikes[i];
      strike.duration--;

      const pMidX = player.pos.x + player.width / 2;
      if (Math.abs(pMidX - strike.x) < (strike.width / 2 + player.width / 2)) {
        if ((player.invincibilityTimer || 0) <= 0) {
          player.health -= 15;
          player.invincibilityTimer = PLAYER_INVINCIBILITY_FRAMES;
          player.pushbackTimer = PLAYER_PUSHBACK_DURATION;
          player.vel = { x: (player.pos.x < strike.x ? -1 : 1) * PLAYER_PUSHBACK_VEL_X, y: PLAYER_PUSHBACK_VEL_Y };
          helpers.spawnExplosion({ x: strike.x, y: player.pos.y + player.height / 2 }, '#ffff00', 10, 0, 10);
          helpers.playGunSound('gun');
          helpers.speakVulgarity('hurt', 'electric');
        }
      }

      if (strike.duration <= 0) {
        boss.activeLightningStrikes.splice(i, 1);
      }
    }

    if (boss.stateTimer! <= 0) {
      boss.bossState = 'exhausted';
      boss.stateTimer = 150;
      boss.activeLightningStrikes = [];
    }
  } else if (boss.bossState === 'exhausted') {
    // Gravity for dropping to ground normally; bottom strictly touches floor (y=550 - 80 = 470)
    if (boss.pos.y < 470) {
      boss.pos.y = Math.min(470, boss.pos.y + 14);
    } else {
      boss.pos.y = 470;
    }
    
    if (boss.stateTimer! <= 0) {
      boss.bossState = 'idle';
      boss.stateTimer = 35;
      boss.pos.y = 470;
    }
  }
};

const handleTommyAI = (
  boss: Enemy,
  player: Player,
  invincibilityEnabled: boolean,
  state: any,
  helpers: BossHelpers
) => {
  const sludgeY = state.tommySludgeY || 510;
  // Health-based scaling factors (0.0 at full health, 1.0 at 0 health)
  const missingHpRatio = Math.max(0, Math.min(1, 1 - (boss.health / (boss.maxHealth || 250))));
  // Movement speed: base speed boosted from 2.5 to 5.0, scaling up to 8.5 at low health
  const baseSpeed = 5.0 + missingHpRatio * 3.5;
  // Randomized emerge timer helper: base chase duration scaled from ~90-130 frames down to ~45-75 frames at low health
  const getRandomChaseDuration = () => {
    const base = 110 - missingHpRatio * 55;
    const variation = (Math.random() - 0.5) * 40; // ±20 frames of randomness
    return Math.max(35, Math.round(base + variation));
  };

  if (!boss.bossState || boss.bossState === 'idle') {
    boss.bossState = 'submerged_chase';
    boss.stateTimer = getRandomChaseDuration();
    boss.pos.y = sludgeY + 15;
    boss.pos.x = 7600;
    boss.targetedBoardIndex = undefined;
  }

  if (boss.bossState === 'submerged_chase') {
    boss.pos.y = sludgeY + 15;
    const activeBoards = (state.tommyBoards || []).filter((b: TommyBoard) => b.status === 'active');

    // Pick a board to stalk: if not chosen yet or chosen board is shattered, pick one with weighted variety
    let targetBoard = (state.tommyBoards || []).find((b: TommyBoard) => b.index === boss.targetedBoardIndex && b.status === 'active');
    if (!targetBoard && activeBoards.length > 0) {
      // 70% chance to target a board near the player, 30% chance to target a random active board across the arena
      if (Math.random() < 0.7) {
        // Weighted sort by proximity to player with a random jitter so Tommy doesn't pick the exact same board every run
        const candidateBoards = [...activeBoards].sort((a: TommyBoard, b: TommyBoard) => {
          const distA = Math.abs(a.x + a.w / 2 - (player.pos.x + player.width / 2)) + (Math.random() - 0.5) * 120;
          const distB = Math.abs(b.x + b.w / 2 - (player.pos.x + player.width / 2)) + (Math.random() - 0.5) * 120;
          return distA - distB;
        });
        targetBoard = candidateBoards[0];
      } else {
        targetBoard = activeBoards[Math.floor(Math.random() * activeBoards.length)];
      }
      boss.targetedBoardIndex = targetBoard.index;
    }

    // Swim towards the chosen board
    let destinationX = player.pos.x + player.width / 2 - boss.width / 2;
    if (targetBoard) {
      destinationX = targetBoard.x + targetBoard.w / 2 - boss.width / 2;
    }

    const diffX = destinationX - boss.pos.x;
    boss.vel.x = Math.max(-baseSpeed, Math.min(baseSpeed, diffX * 0.14));
    boss.pos.x += boss.vel.x;
    boss.pos.x = Math.max(7265, Math.min(7935 - boss.width, boss.pos.x));

    // Sludge bubbling particles above submerged Tommy
    if (state.frame % 4 === 0) {
      helpers.spawnExplosion(
        { x: boss.pos.x + boss.width / 2 + (Math.random() - 0.5) * 40, y: sludgeY },
        '#27AE60',
        3,
        0,
        4
      );
    }

    boss.stateTimer = (boss.stateTimer || 0) - 1;
    const isCloseToTargetBoard = targetBoard ? Math.abs((targetBoard.x + targetBoard.w / 2) - (boss.pos.x + boss.width / 2)) < 24 : true;

    // Tommy emerges when timer runs down AND he is directly under his chosen board
    if (boss.stateTimer <= 0 && isCloseToTargetBoard) {
      const chosen = targetBoard || activeBoards[0];
      if (chosen) {
        boss.targetedBoardIndex = chosen.index;
        // Telegraph timer with randomized variation (scaled by missing HP)
        const baseTelegraph = 62 - missingHpRatio * 22;
        const telegraphVariation = (Math.random() - 0.5) * 14; // ±7 frames
        const telegraphTime = Math.max(30, Math.round(baseTelegraph + telegraphVariation));
        chosen.telegraphTimer = telegraphTime;
        boss.bossState = 'telegraph_emerge';
        boss.stateTimer = telegraphTime;
        boss.pos.x = chosen.x + chosen.w / 2 - boss.width / 2;
      } else {
        boss.stateTimer = 30;
      }
    } else if (boss.stateTimer <= -60) {
      // Safety failsafe: if taking too long to reach the board, pick nearest active board immediately
      if (activeBoards.length > 0) {
        const fallback = activeBoards.sort((a: TommyBoard, b: TommyBoard) => 
          Math.abs(a.x + a.w / 2 - (boss.pos.x + boss.width / 2)) - 
          Math.abs(b.x + b.w / 2 - (boss.pos.x + boss.width / 2))
        )[0];
        boss.targetedBoardIndex = fallback.index;
        const telegraphTime = Math.max(30, Math.round(55 - missingHpRatio * 20));
        fallback.telegraphTimer = telegraphTime;
        boss.bossState = 'telegraph_emerge';
        boss.stateTimer = telegraphTime;
        boss.pos.x = fallback.x + fallback.w / 2 - boss.width / 2;
      }
    }
  } else if (boss.bossState === 'telegraph_emerge') {
    boss.pos.y = sludgeY + 15;
    const board = (state.tommyBoards || []).find((b: TommyBoard) => b.index === boss.targetedBoardIndex);
    if (board) {
      board.shakeX = (Math.random() - 0.5) * 8;
      board.telegraphTimer = (board.telegraphTimer || 0) - 1;
      if (state.frame % 5 === 0) {
        helpers.spawnExplosion(
          { x: board.x + Math.random() * board.w, y: board.y },
          '#ADFF2F',
          3,
          0,
          5
        );
      }
    }

    boss.stateTimer = (boss.stateTimer || 0) - 1;
    if (boss.stateTimer <= 0) {
      if (board) {
        board.status = 'shattering';
        board.shatterTimer = 45;
        board.shakeX = 0;
        board.telegraphTimer = 0;

        // Splinter and sludge explosion
        helpers.spawnExplosion({ x: board.x + board.w / 2, y: board.y }, '#27AE60', 30, 0, 14);
        helpers.spawnExplosion({ x: board.x + board.w / 2, y: board.y }, '#8B4513', 25, 0, 12);
        helpers.playGunSound('barf');
        helpers.setScreenShake(25);

        // If Meathead is on the shattering board, heavy damage and violent upward launch
        const onBoard = player.pos.x + player.width > board.x && 
                        player.pos.x < board.x + board.w && 
                        Math.abs(player.pos.y + player.height - board.y) < 25;
        if (onBoard && (player.invincibilityTimer || 0) <= 0 && !invincibilityEnabled) {
          player.health -= 15;
          player.invincibilityTimer = PLAYER_INVINCIBILITY_FRAMES;
          player.pushbackTimer = PLAYER_PUSHBACK_DURATION;
          player.vel.x = player.pos.x < board.x + board.w / 2 ? -PLAYER_PUSHBACK_VEL_X : PLAYER_PUSHBACK_VEL_X;
          player.vel.y = PLAYER_PUSHBACK_VEL_Y;
          helpers.speakVulgarity('hurt', 'Toxic Tommy');
        }
      }

      boss.bossState = 'emerge_shatter';
      boss.vel.y = -10;
      boss.stateTimer = 45;
      boss.emergeY = (board ? board.baseY : 480) - boss.height + 5;
    }
  } else if (boss.bossState === 'emerge_shatter') {
    boss.pos.y += boss.vel.y;
    boss.vel.y += GRAVITY * 0.7;
    if (boss.pos.y >= (boss.emergeY || 405)) {
      boss.pos.y = boss.emergeY || 405;
      boss.vel.y = 0;
    }

    // Heavy collision with Tommy as he erupts upwards!
    const playerMidX = player.pos.x + player.width / 2;
    const playerMidY = player.pos.y + player.height / 2;
    const bossMidX = boss.pos.x + boss.width / 2;
    const bossMidY = boss.pos.y + boss.height / 2;
    const overlapX = Math.abs(playerMidX - bossMidX) < (player.width / 2 + boss.width / 2);
    const overlapY = Math.abs(playerMidY - bossMidY) < (player.height / 2 + boss.height / 2);

    if (overlapX && overlapY && (player.invincibilityTimer || 0) <= 0 && !invincibilityEnabled) {
      player.health -= 15;
      player.invincibilityTimer = PLAYER_INVINCIBILITY_FRAMES;
      player.pushbackTimer = PLAYER_PUSHBACK_DURATION;
      player.vel.x = playerMidX < bossMidX ? -PLAYER_PUSHBACK_VEL_X : PLAYER_PUSHBACK_VEL_X;
      player.vel.y = PLAYER_PUSHBACK_VEL_Y;
      helpers.spawnExplosion({ x: playerMidX, y: playerMidY }, '#2ECC71', 18, 0, 10);
      helpers.setScreenShake(20);
      helpers.speakVulgarity('hurt', 'Toxic Tommy');
    }

    boss.stateTimer = (boss.stateTimer || 0) - 1;
    if (boss.stateTimer <= 0) {
      // Toggle between closing_in and going_outward
      const nextPuke = boss.pukeType === 'closing_in' ? 'puke_going_outward' : 'puke_closing_in';
      boss.pukeType = nextPuke === 'puke_closing_in' ? 'closing_in' : 'going_outward';
      boss.bossState = nextPuke;
      boss.stateTimer = 230;
      boss.pukeSweepProgress = 0;
      // Lock facing direction at start of attack so player can reliably dodge by going behind him!
      boss.pukeDir = player.pos.x + player.width / 2 < boss.pos.x + boss.width / 2 ? -1 : 1;
    }
  } else if (boss.bossState === 'puke_closing_in') {
    boss.pos.y = boss.emergeY || 405;
    boss.vel.y = 0;
    const dir = boss.pukeDir || (player.pos.x + player.width / 2 < boss.pos.x + boss.width / 2 ? -1 : 1);
    boss.pukeDir = dir;
    boss.stateTimer = (boss.stateTimer || 0) - 1;
    const totalPukeFrames = 230;
    const progress = Math.max(0, Math.min(1, 1.0 - (boss.stateTimer / totalPukeFrames)));
    boss.pukeSweepProgress = progress;

    // Sweeps from far (420px) inward toward Tommy (115px) - gentler, slower sweep speed
    const currentDist = 420 - progress * (420 - 115);
    const splashX = boss.pos.x + boss.width / 2 + dir * currentDist;
    const splashY = sludgeY - 15;

    // Vomit spray particles & projectile - slowed spawn frequency (every 4 frames)
    if (state.frame % 4 === 0) {
      helpers.playGunSound('barf');
      const mouthX = boss.pos.x + (dir > 0 ? boss.width * 0.78 : boss.width * 0.22);
      const mouthY = boss.pos.y + 25;
      helpers.spawnExplosion({ x: splashX, y: splashY }, '#ADFF2F', 3, dir * 1.5, 4);
      helpers.spawnExplosion({ x: splashX, y: splashY }, '#27AE60', 3, 0, 3);

      helpers.addProjectile({
        id: `tommy-puke-${Date.now()}-${Math.random()}`,
        pos: { x: mouthX, y: mouthY },
        vel: { x: (splashX - mouthX) / 18, y: -4 },
        width: 14,
        height: 14,
        health: 1,
        maxHealth: 1,
        type: 'projectile',
        damage: 24, // Standard boss projectile damage (deals 12 damage after player resistance formula)
        owner: 'enemy',
        isSludge: true,
        life: 18
      });
    }

    // Direct damage check at splash zone
    // Player is completely safe if:
    // 1. Behind Tommy: (player on opposite side of pukeDir)
    // 2. High in the air / Uppercutting: player.isUppercutting or player feet are well above sludge splash (player.pos.y + player.height <= splashY - 35)
    const pMidX = player.pos.x + player.width / 2;
    const bMidX = boss.pos.x + boss.width / 2;
    const isBehind = dir > 0 ? (pMidX < bMidX) : (pMidX > bMidX);
    const isLeapingAbove = player.isUppercutting || (player.pos.y + player.height <= splashY - 35);

    if (!isBehind && !isLeapingAbove && Math.abs(pMidX - splashX) < 32 && player.pos.y + player.height > splashY - 50) {
      if ((player.invincibilityTimer || 0) <= 0 && !invincibilityEnabled) {
        player.health -= 9; // Standard boss attack damage (reduced)
        player.invincibilityTimer = PLAYER_INVINCIBILITY_FRAMES;
        player.hurtTimer = PLAYER_INVINCIBILITY_FRAMES;
        player.isHarmlessPushback = false;
        player.smugTimer = 0;
        player.pushbackTimer = TOMMY_PUKE_PUSHBACK_DURATION;
        player.vel.x = dir * 7;
        player.vel.y = -4;
        helpers.speakVulgarity('hurt', 'sludge');
        helpers.spawnExplosion({ x: pMidX, y: player.pos.y + player.height / 2 }, '#27AE60', 8, 0, 6);
      }
    }

    if (boss.stateTimer <= 0) {
      boss.bossState = 'vulnerable_idle';
      boss.stateTimer = 110;
    }
  } else if (boss.bossState === 'puke_going_outward') {
    boss.pos.y = boss.emergeY || 405;
    boss.vel.y = 0;
    const dir = boss.pukeDir || (player.pos.x + player.width / 2 < boss.pos.x + boss.width / 2 ? -1 : 1);
    boss.pukeDir = dir;
    boss.stateTimer = (boss.stateTimer || 0) - 1;
    const totalPukeFrames = 230;
    const progress = Math.max(0, Math.min(1, 1.0 - (boss.stateTimer / totalPukeFrames)));
    boss.pukeSweepProgress = progress;

    // Sweeps from close (80px) outward away from Tommy (440px)
    const currentDist = 80 + progress * (440 - 80);
    const splashX = boss.pos.x + boss.width / 2 + dir * currentDist;
    const splashY = sludgeY - 15;

    // Vomit spray particles & projectile - slowed spawn frequency (every 4 frames)
    if (state.frame % 4 === 0) {
      helpers.playGunSound('barf');
      const mouthX = boss.pos.x + (dir > 0 ? boss.width * 0.78 : boss.width * 0.22);
      const mouthY = boss.pos.y + 25;
      helpers.spawnExplosion({ x: splashX, y: splashY }, '#ADFF2F', 3, dir * 1.5, 4);
      helpers.spawnExplosion({ x: splashX, y: splashY }, '#27AE60', 3, 0, 3);

      helpers.addProjectile({
        id: `tommy-puke-${Date.now()}-${Math.random()}`,
        pos: { x: mouthX, y: mouthY },
        vel: { x: (splashX - mouthX) / 18, y: -4 },
        width: 14,
        height: 14,
        health: 1,
        maxHealth: 1,
        type: 'projectile',
        damage: 18, // Standard boss projectile damage
        owner: 'enemy',
        isSludge: true,
        life: 18
      });
    }

    // Direct damage check at splash zone
    // Player is completely safe if:
    // 1. Behind Tommy: (player on opposite side of pukeDir)
    // 2. High in the air / Uppercutting: player.isUppercutting or player feet are well above sludge splash (player.pos.y + player.height <= splashY - 35)
    const pMidX = player.pos.x + player.width / 2;
    const bMidX = boss.pos.x + boss.width / 2;
    const isBehind = dir > 0 ? (pMidX < bMidX) : (pMidX > bMidX);
    const isLeapingAbove = player.isUppercutting || (player.pos.y + player.height <= splashY - 35);

    if (!isBehind && !isLeapingAbove && Math.abs(pMidX - splashX) < 32 && player.pos.y + player.height > splashY - 50) {
      if ((player.invincibilityTimer || 0) <= 0 && !invincibilityEnabled) {
        player.health -= 9; // Standard boss attack damage (reduced)
        player.invincibilityTimer = PLAYER_INVINCIBILITY_FRAMES;
        player.hurtTimer = PLAYER_INVINCIBILITY_FRAMES;
        player.isHarmlessPushback = false;
        player.smugTimer = 0;
        player.pushbackTimer = TOMMY_PUKE_PUSHBACK_DURATION;
        player.vel.x = dir * 7;
        player.vel.y = -4;
        helpers.speakVulgarity('hurt', 'sludge');
        helpers.spawnExplosion({ x: pMidX, y: player.pos.y + player.height / 2 }, '#27AE60', 8, 0, 6);
      }
    }

    if (boss.stateTimer <= 0) {
      boss.bossState = 'vulnerable_idle';
      boss.stateTimer = 110;
    }
  } else if (boss.bossState === 'weakness_stunned') {
    boss.pos.y = boss.emergeY || 405;
    boss.vel.x = 0;
    boss.vel.y = 0;
    boss.pukeSweepProgress = 0;

    // Boss wobbles in place, reeling in agony from crude oil
    if (state.frame % 5 === 0) {
      helpers.spawnExplosion(
        { x: boss.pos.x + Math.random() * boss.width, y: boss.pos.y + Math.random() * boss.height },
        '#111111',
        3,
        0,
        4
      );
    }

    boss.stateTimer = (boss.stateTimer || 0) - 1;
    if (boss.stateTimer <= 0) {
      // Stun expires: forces him to submerge into the sludge!
      boss.bossState = 'dive_in_sludge';
      boss.stateTimer = 45;
      boss.vel.y = 5;
      helpers.playGunSound('barf');
      helpers.spawnExplosion({ x: boss.pos.x + boss.width / 2, y: sludgeY }, '#111111', 30, 0, 12);
    }
  } else if (boss.bossState === 'vulnerable_idle') {
    boss.pos.y = boss.emergeY || 405;
    boss.vel.y = 0;

    boss.stateTimer = (boss.stateTimer || 0) - 1;
    if (boss.stateTimer <= 0) {
      boss.bossState = 'dive_in_sludge';
      boss.stateTimer = 40;
      boss.vel.y = 5;
      helpers.playGunSound('barf');
      helpers.spawnExplosion({ x: boss.pos.x + boss.width / 2, y: sludgeY }, '#27AE60', 30, 0, 12);
    }
  } else if (boss.bossState === 'dive_in_sludge') {
    boss.pos.y += boss.vel.y;
    boss.vel.y += GRAVITY * 0.7;

    boss.stateTimer = (boss.stateTimer || 0) - 1;
    if (boss.pos.y >= sludgeY + 15 || boss.stateTimer <= 0) {
      boss.bossState = 'submerged_chase';
      boss.stateTimer = getRandomChaseDuration();
      boss.targetedBoardIndex = undefined;
      helpers.spawnExplosion({ x: boss.pos.x + boss.width / 2, y: sludgeY }, '#2ECC71', 20, 0, 10);
    }
  }
};

export const drawBoss = (ctx: CanvasRenderingContext2D, e: Enemy, id: string | null, frame: number) => {
  const { pos, width, height } = e; ctx.save(); ctx.translate(pos.x, pos.y);
  if (e.rotation) { ctx.translate(width / 2, height / 2); ctx.rotate(e.rotation); ctx.translate(-width / 2, -height / 2); }
  if (id === 'Drug Trade Dale' && e.bossState === 'speed_dash') {
    ctx.filter = `hue-rotate(${frame * 10}deg) saturate(3)`;
  }
  switch (id) {
    case 'Artie Avalanche': {
      // 1. Ice-crusted Boots / Greaves
      ctx.fillStyle = '#1B4F72';
      ctx.fillRect(width * 0.15, height * 0.72, width * 0.3, height * 0.28);
      ctx.fillRect(width * 0.55, height * 0.72, width * 0.3, height * 0.28);
      ctx.fillStyle = '#5DADE2';
      ctx.fillRect(width * 0.12, height * 0.88, width * 0.35, height * 0.12);
      ctx.fillRect(width * 0.53, height * 0.88, width * 0.35, height * 0.12);

      // 2. Heavy Cryo Torso & Ice Rune Armor
      ctx.fillStyle = '#1B4F72';
      ctx.fillRect(width * 0.18, height * 0.38, width * 0.64, height * 0.38);
      ctx.strokeStyle = '#0B2027';
      ctx.lineWidth = 2;
      ctx.strokeRect(width * 0.18, height * 0.38, width * 0.64, height * 0.38);
      // Glacier chestplate rune
      ctx.fillStyle = '#5DADE2';
      ctx.beginPath();
      ctx.moveTo(width * 0.5, height * 0.42);
      ctx.lineTo(width * 0.65, height * 0.55);
      ctx.lineTo(width * 0.5, height * 0.68);
      ctx.lineTo(width * 0.35, height * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#EBF5FB';
      ctx.fillRect(width * 0.46, height * 0.51, width * 0.08, height * 0.08);

      // 3. Spiked Crystalline Ice Shoulders / Pauldrons
      ctx.fillStyle = '#2E86C1';
      ctx.beginPath();
      ctx.moveTo(width * 0.18, height * 0.38);
      ctx.lineTo(width * 0.02, height * 0.22);
      ctx.lineTo(width * 0.22, height * 0.26);
      ctx.lineTo(width * 0.28, height * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#EBF5FB';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#2E86C1';
      ctx.beginPath();
      ctx.moveTo(width * 0.82, height * 0.38);
      ctx.lineTo(width * 0.98, height * 0.22);
      ctx.lineTo(width * 0.78, height * 0.26);
      ctx.lineTo(width * 0.72, height * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 4. White Fur-Lined Hood Collar
      ctx.fillStyle = '#E5E8E8';
      ctx.beginPath();
      ctx.ellipse(width * 0.5, height * 0.36, width * 0.38, height * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#BDC3C7';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 5. Frost-Blue Head & Face
      ctx.fillStyle = '#90CAF9';
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.26, width * 0.24, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#154360';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 6. Glacier Crown / Ice Horns
      ctx.fillStyle = '#2E86C1';
      ctx.beginPath();
      ctx.moveTo(width * 0.34, height * 0.18);
      ctx.lineTo(width * 0.16, -height * 0.05);
      ctx.lineTo(width * 0.42, height * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#EBF5FB';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width * 0.66, height * 0.18);
      ctx.lineTo(width * 0.84, -height * 0.05);
      ctx.lineTo(width * 0.58, height * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Central crystal crest
      ctx.fillStyle = '#5DADE2';
      ctx.beginPath();
      ctx.moveTo(width * 0.44, height * 0.14);
      ctx.lineTo(width * 0.5, -height * 0.02);
      ctx.lineTo(width * 0.56, height * 0.14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 7. Frosty White Eyebrows
      ctx.fillStyle = '#EBF5FB';
      ctx.fillRect(width * 0.32, height * 0.20, width * 0.16, height * 0.04);
      ctx.fillRect(width * 0.52, height * 0.20, width * 0.16, height * 0.04);

      // 8. Glowing Cold Cyan Eyes
      ctx.fillStyle = '#00FFFF';
      ctx.shadowColor = '#00FFFF';
      ctx.shadowBlur = 6;
      ctx.fillRect(width * 0.36, height * 0.24, width * 0.09, height * 0.05);
      ctx.fillRect(width * 0.55, height * 0.24, width * 0.09, height * 0.05);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(width * 0.39, height * 0.25, width * 0.03, height * 0.03);
      ctx.fillRect(width * 0.58, height * 0.25, width * 0.03, height * 0.03);

      // 9. Menacing Snarl & Sharp Teeth
      ctx.fillStyle = '#154360';
      ctx.fillRect(width * 0.38, height * 0.32, width * 0.24, height * 0.06);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(width * 0.40, height * 0.32, width * 0.04, height * 0.03);
      ctx.fillRect(width * 0.48, height * 0.32, width * 0.04, height * 0.03);
      ctx.fillRect(width * 0.56, height * 0.32, width * 0.04, height * 0.03);

      // 10. Frost Breath Particle
      if (frame % 20 < 10) {
        ctx.fillStyle = 'rgba(235, 245, 251, 0.6)';
        ctx.beginPath();
        ctx.arc(width * 0.68 + (frame % 10), height * 0.34, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'Victor Volcano': {
      const lOff = (e.bossState === 'attacking' || e.bossState === 'telegraphing') ? Math.sin(frame * 0.5) * 6 : 0;
      const isTelegraph = e.bossState === 'telegraphing' || e.bossState === 'attacking';

      // 1. Basalt Obsidian Greaves / Legs
      ctx.fillStyle = '#1A0A07';
      ctx.fillRect(width * 0.15, height * 0.72, width * 0.3, height * 0.28);
      ctx.fillRect(width * 0.55, height * 0.72, width * 0.3, height * 0.28);
      ctx.fillStyle = '#BA4A00';
      ctx.fillRect(width * 0.18, height * 0.78, width * 0.24, height * 0.06);
      ctx.fillRect(width * 0.58, height * 0.78, width * 0.24, height * 0.06);

      // 2. Heavy Volcanic Basalt Torso
      ctx.fillStyle = '#261614';
      ctx.fillRect(width * 0.16, height * 0.36 + lOff * 0.5, width * 0.68, height * 0.38);
      ctx.strokeStyle = '#C62828';
      ctx.lineWidth = 2;
      ctx.strokeRect(width * 0.16, height * 0.36 + lOff * 0.5, width * 0.68, height * 0.38);

      // 3. Pulsing Molten Core / Chest Fissures
      const corePulse = Math.sin(frame * 0.2) * 3;
      ctx.fillStyle = isTelegraph ? '#FFEB3B' : '#FF5722';
      ctx.shadowColor = '#FF5722';
      ctx.shadowBlur = isTelegraph ? 12 : 6;
      ctx.beginPath();
      ctx.moveTo(width * 0.5, height * 0.40 + lOff * 0.5);
      ctx.lineTo(width * 0.64, height * 0.52 + lOff * 0.5 + corePulse);
      ctx.lineTo(width * 0.5, height * 0.66 + lOff * 0.5);
      ctx.lineTo(width * 0.36, height * 0.52 + lOff * 0.5 + corePulse);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      // Core yellow center
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(width * 0.46, height * 0.49 + lOff * 0.5, width * 0.08, height * 0.06);

      // 4. Cracked Magma Shoulders / Basalt Boulders
      ctx.fillStyle = '#1A0A07';
      ctx.beginPath();
      ctx.arc(width * 0.14, height * 0.38 + lOff * 0.5, width * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FF5722';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(width * 0.86, height * 0.38 + lOff * 0.5, width * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 5. Volcanic Rock Head
      ctx.fillStyle = '#3E1A11';
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.25 + lOff, width * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#C62828';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 6. Obsidian Chimney Horns & Smoke
      ctx.fillStyle = '#1A0A07';
      ctx.beginPath();
      ctx.moveTo(width * 0.32, height * 0.16 + lOff);
      ctx.lineTo(width * 0.18, -height * 0.04 + lOff);
      ctx.lineTo(width * 0.40, height * 0.10 + lOff);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#FF5722';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width * 0.68, height * 0.16 + lOff);
      ctx.lineTo(width * 0.82, -height * 0.04 + lOff);
      ctx.lineTo(width * 0.60, height * 0.10 + lOff);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Chimney smoke puffs
      ctx.fillStyle = 'rgba(93, 64, 55, 0.6)';
      ctx.beginPath();
      ctx.arc(width * 0.18, -height * 0.08 + lOff + Math.sin(frame * 0.1) * 2, 4, 0, Math.PI * 2);
      ctx.arc(width * 0.82, -height * 0.08 + lOff + Math.cos(frame * 0.1) * 2, 4, 0, Math.PI * 2);
      ctx.fill();

      // 7. Magma Forehead Crack
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width * 0.48, height * 0.08 + lOff);
      ctx.lineTo(width * 0.52, height * 0.16 + lOff);
      ctx.lineTo(width * 0.46, height * 0.20 + lOff);
      ctx.stroke();

      // 8. Blazing Molten-Gold Eyes
      ctx.fillStyle = '#FFD700';
      ctx.shadowColor = '#FF3D00';
      ctx.shadowBlur = 8;
      ctx.fillRect(width * 0.36, height * 0.22 + lOff, width * 0.09, height * 0.05);
      ctx.fillRect(width * 0.55, height * 0.22 + lOff, width * 0.09, height * 0.05);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(width * 0.39, height * 0.23 + lOff, width * 0.03, height * 0.03);
      ctx.fillRect(width * 0.58, height * 0.23 + lOff, width * 0.03, height * 0.03);

      // 9. Molten Magma Jaw
      ctx.fillStyle = '#1A0A07';
      ctx.fillRect(width * 0.36, height * 0.31 + lOff, width * 0.28, height * 0.07);
      ctx.fillStyle = '#FF5722';
      ctx.fillRect(width * 0.39, height * 0.32 + lOff, width * 0.05, height * 0.04);
      ctx.fillRect(width * 0.48, height * 0.32 + lOff, width * 0.05, height * 0.04);
      ctx.fillRect(width * 0.56, height * 0.32 + lOff, width * 0.05, height * 0.04);
      break;
    }
    case 'Ernie Earthquake': {
      // 1. Bedrock Column Legs
      ctx.fillStyle = '#3E2723';
      ctx.fillRect(width * 0.12, height * 0.70, width * 0.32, height * 0.30);
      ctx.fillRect(width * 0.56, height * 0.70, width * 0.32, height * 0.30);
      ctx.strokeStyle = '#271B17';
      ctx.lineWidth = 2;
      ctx.strokeRect(width * 0.12, height * 0.70, width * 0.32, height * 0.30);
      ctx.strokeRect(width * 0.56, height * 0.70, width * 0.32, height * 0.30);

      // 2. Colossal Bedrock Torso with Geological Strata
      ctx.fillStyle = '#6E2C00';
      ctx.fillRect(width * 0.12, height * 0.35, width * 0.76, height * 0.38);
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 2;
      ctx.strokeRect(width * 0.12, height * 0.35, width * 0.76, height * 0.38);
      // Strata layer bands
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(width * 0.14, height * 0.46, width * 0.72, height * 0.08);
      ctx.fillStyle = '#4E342E';
      ctx.fillRect(width * 0.14, height * 0.58, width * 0.72, height * 0.06);

      // Faultline Gold Fissure on chest
      ctx.strokeStyle = '#FFB300';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width * 0.45, height * 0.38);
      ctx.lineTo(width * 0.52, height * 0.48);
      ctx.lineTo(width * 0.46, height * 0.56);
      ctx.lineTo(width * 0.54, height * 0.65);
      ctx.stroke();

      // 3. Layered Bedrock Shoulder Slabs
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(-width * 0.02, height * 0.28, width * 0.22, height * 0.24);
      ctx.strokeRect(-width * 0.02, height * 0.28, width * 0.22, height * 0.24);
      ctx.fillRect(width * 0.80, height * 0.28, width * 0.22, height * 0.24);
      ctx.strokeRect(width * 0.80, height * 0.28, width * 0.22, height * 0.24);

      // 4. Chiseled Stone Head
      ctx.fillStyle = '#795548';
      ctx.fillRect(width * 0.24, height * 0.08, width * 0.52, height * 0.30);
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(width * 0.24, height * 0.08, width * 0.52, height * 0.30);

      // 5. Tectonic Plate Helmet Crest
      ctx.fillStyle = '#4E342E';
      ctx.beginPath();
      ctx.moveTo(width * 0.22, height * 0.10);
      ctx.lineTo(width * 0.5, -height * 0.02);
      ctx.lineTo(width * 0.78, height * 0.10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#271B17';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(width * 0.44, height * 0.02, width * 0.12, height * 0.06);

      // 6. Heavy Stone Brow Ridge
      ctx.fillStyle = '#3E2723';
      ctx.fillRect(width * 0.28, height * 0.16, width * 0.44, height * 0.05);

      // 7. Glowing Amber Tectonic Eyes
      ctx.fillStyle = '#FFB300';
      ctx.shadowColor = '#FFB300';
      ctx.shadowBlur = 6;
      ctx.fillRect(width * 0.34, height * 0.22, width * 0.10, height * 0.05);
      ctx.fillRect(width * 0.56, height * 0.22, width * 0.10, height * 0.05);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#FFF8E1';
      ctx.fillRect(width * 0.37, height * 0.23, width * 0.04, height * 0.03);
      ctx.fillRect(width * 0.59, height * 0.23, width * 0.04, height * 0.03);

      // 8. Colossal Granite Sledge-Jaw & Blocky Teeth
      ctx.fillStyle = '#4E342E';
      ctx.fillRect(width * 0.30, height * 0.28, width * 0.40, height * 0.09);
      ctx.strokeStyle = '#271B17';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(width * 0.30, height * 0.28, width * 0.40, height * 0.09);
      ctx.fillStyle = '#D7CCC8';
      ctx.fillRect(width * 0.34, height * 0.30, width * 0.06, height * 0.05);
      ctx.fillRect(width * 0.42, height * 0.30, width * 0.06, height * 0.05);
      ctx.fillRect(width * 0.52, height * 0.30, width * 0.06, height * 0.05);
      ctx.fillRect(width * 0.60, height * 0.30, width * 0.06, height * 0.05);

      // Stunned drop dizzy cracks
      if (e.bossState === 'stunned_drop') {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(width * 0.3, height * 0.15);
        ctx.lineTo(width * 0.4, height * 0.25);
        ctx.lineTo(width * 0.35, height * 0.3);
        ctx.stroke();
      }
      break;
    }
    case 'Hector Hurricane': {
      // 1. Aviator Boots / Greaves
      ctx.fillStyle = '#0E4B40';
      ctx.fillRect(width * 0.20, height * 0.72, width * 0.26, height * 0.28);
      ctx.fillRect(width * 0.54, height * 0.72, width * 0.26, height * 0.28);

      // 2. Aerodynamic Storm Commando Torso
      ctx.fillStyle = '#16A085';
      ctx.fillRect(width * 0.20, height * 0.36, width * 0.60, height * 0.38);
      ctx.strokeStyle = '#0E4B40';
      ctx.lineWidth = 2;
      ctx.strokeRect(width * 0.20, height * 0.36, width * 0.60, height * 0.38);

      // Central Turbine Rotor
      ctx.fillStyle = '#34495E';
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.52, width * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Spinning turbine blades
      const rotAngle = frame * 0.2;
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 1.5;
      for (let b = 0; b < 4; b++) {
        const a = rotAngle + (b * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.52);
        ctx.lineTo(width * 0.5 + Math.cos(a) * width * 0.10, height * 0.52 + Math.sin(a) * width * 0.10);
        ctx.stroke();
      }

      // 3. Shoulder Turbine Thrusters
      ctx.fillStyle = '#117A65';
      ctx.beginPath();
      ctx.arc(width * 0.16, height * 0.40, width * 0.14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0E4B40';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#00FFFF';
      ctx.beginPath();
      ctx.arc(width * 0.16, height * 0.40, width * 0.05, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#117A65';
      ctx.beginPath();
      ctx.arc(width * 0.84, height * 0.40, width * 0.14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0E4B40';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#00FFFF';
      ctx.beginPath();
      ctx.arc(width * 0.84, height * 0.40, width * 0.05, 0, Math.PI * 2);
      ctx.fill();

      // 4. Fluttering Pilot Scarf
      ctx.fillStyle = '#F39C12';
      ctx.beginPath();
      ctx.ellipse(width * 0.5, height * 0.35, width * 0.28, height * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();
      // Fluttering tail
      const scarfWave = Math.sin(frame * 0.3) * 6;
      ctx.beginPath();
      ctx.moveTo(width * 0.65, height * 0.35);
      ctx.lineTo(width * 0.90, height * 0.38 + scarfWave);
      ctx.lineTo(width * 0.85, height * 0.45 + scarfWave);
      ctx.lineTo(width * 0.60, height * 0.40);
      ctx.closePath();
      ctx.fill();

      // 5. Aviator Helmet & Cowl
      ctx.fillStyle = '#16A085';
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.24, width * 0.24, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0E4B40';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Aerodynamic Wing Fins
      ctx.fillStyle = '#48C9B0';
      ctx.beginPath();
      ctx.moveTo(width * 0.30, height * 0.20);
      ctx.lineTo(width * 0.12, height * 0.12);
      ctx.lineTo(width * 0.28, height * 0.28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width * 0.70, height * 0.20);
      ctx.lineTo(width * 0.88, height * 0.12);
      ctx.lineTo(width * 0.72, height * 0.28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 6. Face
      ctx.fillStyle = '#F5CBA7';
      ctx.fillRect(width * 0.35, height * 0.24, width * 0.30, height * 0.10);

      // 7. Glowing Cyan Aviator Goggles
      ctx.fillStyle = '#2C3E50';
      ctx.fillRect(width * 0.28, height * 0.18, width * 0.44, height * 0.09);
      ctx.fillStyle = '#00FFFF';
      ctx.shadowColor = '#00FFFF';
      ctx.shadowBlur = 6;
      ctx.fillRect(width * 0.31, height * 0.20, width * 0.17, height * 0.06);
      ctx.fillRect(width * 0.52, height * 0.20, width * 0.17, height * 0.06);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#E0F7FA';
      ctx.fillRect(width * 0.33, height * 0.21, width * 0.05, height * 0.03);
      ctx.fillRect(width * 0.54, height * 0.21, width * 0.05, height * 0.03);

      // 8. Cocky Smirk
      ctx.strokeStyle = '#78281F';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width * 0.42, height * 0.31);
      ctx.quadraticCurveTo(width * 0.52, height * 0.34, width * 0.58, height * 0.29);
      ctx.stroke();

      // Hurricane weather animations
      if (e.bossState === 'hurricane') {
         ctx.save();
         const time = frame * 0.2;
         ctx.translate(width/2, height/2);
         
         // Rain
         ctx.strokeStyle = 'rgba(200, 255, 255, 0.6)';
         ctx.lineWidth = 1;
         for (let i = 0; i < 8; i++) {
            const rx = (Math.random() - 0.5) * 300;
            const ry = (Math.random() - 0.5) * 300;
            const len = 20 + Math.random() * 30;
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx - len, ry + len/2);
            ctx.stroke();
         }

         // Lightning
         if (Math.random() > 0.7) {
            ctx.strokeStyle = '#FFFF00';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#FFFF00';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            let lx = (Math.random() - 0.5) * 150;
            let ly = (Math.random() - 0.5) * 150;
            ctx.moveTo(lx, ly);
            for(let j=0; j<4; j++) {
                lx += (Math.random() - 0.5) * 40;
                ly += (Math.random() - 0.5) * 40;
                ctx.lineTo(lx, ly);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
         }
         ctx.restore();
      }
      break;
    }
    case 'Drug Trade Dale': {
      // 1. Purple Slacks & Shiny Oxford Shoes
      ctx.fillStyle = '#6C3483';
      ctx.fillRect(width * 0.20, height * 0.70, width * 0.26, height * 0.30);
      ctx.fillRect(width * 0.54, height * 0.70, width * 0.26, height * 0.30);
      ctx.fillStyle = '#111111';
      ctx.fillRect(width * 0.16, height * 0.90, width * 0.30, height * 0.10);
      ctx.fillRect(width * 0.54, height * 0.90, width * 0.30, height * 0.10);

      // 2. Double-Breasted Vice Purple Suit Jacket with Broad 80s Padded Shoulders
      ctx.fillStyle = '#8E44AD';
      ctx.fillRect(width * 0.14, height * 0.32, width * 0.72, height * 0.40);
      ctx.strokeStyle = '#4A235A';
      ctx.lineWidth = 2;
      ctx.strokeRect(width * 0.14, height * 0.32, width * 0.72, height * 0.40);

      // Broad padded shoulder pads
      ctx.fillStyle = '#9B59B6';
      ctx.fillRect(width * 0.06, height * 0.30, width * 0.18, height * 0.16);
      ctx.strokeRect(width * 0.06, height * 0.30, width * 0.18, height * 0.16);
      ctx.fillRect(width * 0.76, height * 0.30, width * 0.18, height * 0.16);
      ctx.strokeRect(width * 0.76, height * 0.30, width * 0.18, height * 0.16);

      // Hot-pink pocket square
      ctx.fillStyle = '#FF1493';
      ctx.beginPath();
      ctx.moveTo(width * 0.72, height * 0.40);
      ctx.lineTo(width * 0.78, height * 0.36);
      ctx.lineTo(width * 0.80, height * 0.42);
      ctx.closePath();
      ctx.fill();

      // Gold Suit Buttons
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(width * 0.42, height * 0.55, 3, 0, Math.PI * 2);
      ctx.arc(width * 0.58, height * 0.55, 3, 0, Math.PI * 2);
      ctx.arc(width * 0.42, height * 0.65, 3, 0, Math.PI * 2);
      ctx.arc(width * 0.58, height * 0.65, 3, 0, Math.PI * 2);
      ctx.fill();

      // 3. Unbuttoned White Dress Shirt Collar
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(width * 0.38, height * 0.32);
      ctx.lineTo(width * 0.50, height * 0.50);
      ctx.lineTo(width * 0.62, height * 0.32);
      ctx.closePath();
      ctx.fill();

      // 4. Giant 24k Gold Cuban Chain & Heavy Dollar Sign Medallion
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width * 0.36, height * 0.32);
      ctx.quadraticCurveTo(width * 0.50, height * 0.54, width * 0.64, height * 0.32);
      ctx.stroke();

      ctx.fillStyle = '#FFD700';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(width * 0.50, height * 0.52, width * 0.10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#B7950B';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#2E1045';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', width * 0.50, height * 0.52);

      // 5. Dale's Head & Face
      ctx.fillStyle = '#F5CBA7';
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.22, width * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2C3E50';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 5 o'clock shadow
      ctx.fillStyle = 'rgba(86, 101, 115, 0.25)';
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.24, width * 0.18, 0, Math.PI);
      ctx.fill();

      // 6. Slicked-Back Black Pompadour Hair
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.moveTo(width * 0.26, height * 0.18);
      ctx.quadraticCurveTo(width * 0.22, -height * 0.02, width * 0.50, -height * 0.05);
      ctx.quadraticCurveTo(width * 0.78, -height * 0.02, width * 0.74, height * 0.18);
      ctx.quadraticCurveTo(width * 0.50, height * 0.06, width * 0.26, height * 0.18);
      ctx.closePath();
      ctx.fill();
      // Pompadour highlight sheen
      ctx.strokeStyle = '#5D6D7E';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(width * 0.50, height * 0.02, width * 0.16, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();

      // 7. Gold Aviator Sunglasses reflecting Neon Sunset
      ctx.fillStyle = '#111111';
      ctx.fillRect(width * 0.30, height * 0.16, width * 0.40, height * 0.09);
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(width * 0.30, height * 0.16, width * 0.40, height * 0.09);
      // Neon reflections in lenses
      ctx.fillStyle = '#FF007F';
      ctx.fillRect(width * 0.32, height * 0.17, width * 0.16, height * 0.04);
      ctx.fillRect(width * 0.52, height * 0.17, width * 0.16, height * 0.04);
      ctx.fillStyle = '#00F0FF';
      ctx.fillRect(width * 0.32, height * 0.21, width * 0.16, height * 0.03);
      ctx.fillRect(width * 0.52, height * 0.21, width * 0.16, height * 0.03);

      // 8. Cocky Smirk with Glinting Gold Tooth
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width * 0.40, height * 0.28);
      ctx.quadraticCurveTo(width * 0.50, height * 0.31, width * 0.60, height * 0.27);
      ctx.stroke();
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(width * 0.52, height * 0.27, 3, 3);
      if (e.bossState === 'using_shipment') ctx.fillStyle = '#fff'; ctx.fillRect(width * 0.1, -20, width * 0.8, 20); 
      if (e.bossState === 'speed_dash') {
        ctx.save(); ctx.translate(width * 0.2, height * 0.3); ctx.rotate(-0.5);
        ctx.fillStyle = COLORS.PROJECTILE_DART; ctx.fillRect(0, -2, 16, 4);
        ctx.fillStyle = 'red'; ctx.fillRect(16, -4, 6, 8); ctx.restore();
      }
      if (e.truckActive && e.truckX !== undefined) {
        if (e.truckX < BOSS_DOOR_X) {
             if (Math.floor(frame / 15) % 2 === 0) {
                 ctx.save();
                 const warnX = BOSS_DOOR_X + 50 - pos.x; 
                 const warnY = 350 - pos.y;
                 ctx.fillStyle = '#FF0000';
                 ctx.strokeStyle = '#FFFFFF';
                 ctx.lineWidth = 4;
                 ctx.beginPath();
                 ctx.moveTo(warnX, warnY - 30);
                 ctx.lineTo(warnX + 30, warnY + 30);
                 ctx.lineTo(warnX - 30, warnY + 30);
                 ctx.closePath();
                 ctx.fill();
                 ctx.stroke();
                 ctx.fillStyle = 'white';
                 ctx.font = 'bold 40px sans-serif'; 
                 ctx.textAlign = 'center';
                 ctx.fillText('!', warnX, warnY + 22);
                 ctx.restore();
             }
        }
        ctx.save();
        const tx = e.truckX - pos.x;
        const ty = 400 - pos.y;
        
        // Trailer
        ctx.fillStyle = '#ECF0F1'; ctx.fillRect(tx, ty, 250, 150); ctx.strokeRect(tx, ty, 250, 150);
        // Cab Connector
        ctx.fillStyle = '#555'; ctx.fillRect(tx + 250, ty + 100, 20, 20);
        // Cab
        ctx.fillStyle = '#C0392B'; ctx.fillRect(tx + 270, ty + 40, 80, 110); ctx.strokeRect(tx + 270, ty + 40, 80, 110);
        // Window
        ctx.fillStyle = '#85C1E9'; ctx.fillRect(tx + 275, ty + 50, 60, 40);
        // Wheels
        ctx.fillStyle = '#111'; 
        const wheelY = ty + 150;
        ctx.beginPath(); ctx.arc(tx + 60, wheelY, 24, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(tx + 190, wheelY, 24, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(tx + 310, wheelY, 24, 0, Math.PI*2); ctx.fill();
        
        // Text
        ctx.fillStyle = '#E74C3C'; ctx.font = 'bold 16px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.fillText("DALE'S", tx + 125, ty + 60);
        ctx.fillText("DRUG'S", tx + 125, ty + 90);
        ctx.restore();
      }
    }
    break;
    case 'Blackout Barry':
      {
        const isTeleporting = e.bossState === 'blackout_teleport';
        const isTelegraphing = e.bossState === 'telegraphing';
        const isGroundPound = e.bossState === 'ground_pound';
        const isLightning = e.bossState === 'lightning_storm';
        const isExhausted = e.bossState === 'exhausted';
        
        const _α = isTeleporting ? Math.abs(Math.sin(frame * 0.4)) : 1.0;
        ctx.globalAlpha = _α;
        
        if (isExhausted) {
          // Drawing stars floating above head in a halo
          ctx.save();
          const starCount = 3;
          for (let i = 0; i < starCount; i++) {
            const angle = (frame * 0.08) + (i * ((Math.PI * 2) / starCount));
            const sx = Math.cos(angle) * 32 + width / 2;
            const sy = Math.sin(angle * 0.6) * 8 - 14; // Floating directly above head
            
            ctx.fillStyle = '#ffff00';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ffff00';
            ctx.beginPath();
            const spikes = 5;
            const outerRadius = 8;
            const innerRadius = 3;
            for (let j = 0; j < spikes * 2; j++) {
              const r = j % 2 === 0 ? outerRadius : innerRadius;
              const a = (j * Math.PI) / spikes;
              ctx.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r);
            }
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }

        // Shadow cloak / Hood with High-Voltage Tesla Coils
        ctx.fillStyle = '#0a0510';
        ctx.beginPath();
        if (isExhausted) {
          // Hunched
          ctx.moveTo(width * 0.5, height * 0.4);
          ctx.lineTo(0, height);
          ctx.lineTo(width, height);
        } else {
          ctx.moveTo(width * 0.5, 0); 
          ctx.quadraticCurveTo(width * 0.2, 0, width * 0.1, height * 0.3); 
          ctx.lineTo(0, height); 
          ctx.lineTo(width, height); 
          ctx.lineTo(width * 0.9, height * 0.3); 
          ctx.quadraticCurveTo(width * 0.8, 0, width * 0.5, 0); 
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#2E1A47';
        ctx.lineWidth = 2;
        ctx.stroke();

        // High-voltage ceramic insulator coils on shoulders
        if (!isExhausted) {
          ctx.fillStyle = '#34495E';
          ctx.fillRect(width * 0.08, height * 0.32, 10, 16);
          ctx.fillRect(width * 0.82, height * 0.32, 10, 16);
          ctx.strokeStyle = '#00E5FF';
          ctx.lineWidth = 1;
          ctx.strokeRect(width * 0.08, height * 0.32, 10, 16);
          ctx.strokeRect(width * 0.82, height * 0.32, 10, 16);
          ctx.beginPath();
          ctx.moveTo(width * 0.08, height * 0.37); ctx.lineTo(width * 0.08 + 10, height * 0.37);
          ctx.moveTo(width * 0.08, height * 0.43); ctx.lineTo(width * 0.08 + 10, height * 0.43);
          ctx.moveTo(width * 0.82, height * 0.37); ctx.lineTo(width * 0.82 + 10, height * 0.37);
          ctx.moveTo(width * 0.82, height * 0.43); ctx.lineTo(width * 0.82 + 10, height * 0.43);
          ctx.stroke();

          // Subtle spark discharge
          if (frame % 15 < 5) {
            ctx.strokeStyle = '#BD00FF';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(width * 0.12, height * 0.30);
            ctx.lineTo(width * 0.16, height * 0.26);
            ctx.lineTo(width * 0.14, height * 0.22);
            ctx.stroke();
          }
        }
        
        // Glowing Piercing Eyes
        const eyeColor = (isGroundPound || isLightning) ? '#ff0000' : '#00e5ff';
        ctx.fillStyle = eyeColor;
        ctx.globalAlpha = _α;
        ctx.shadowBlur = 15;
        ctx.shadowColor = eyeColor;
        const eyeY = isExhausted ? height * 0.6 : height * 0.3;
        ctx.beginPath();
        ctx.ellipse(width * 0.36, eyeY, 6, 3.5, 0.2, 0, Math.PI * 2);
        ctx.ellipse(width * 0.64, eyeY, 6, 3.5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // White electric eye slits
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(width * 0.35, eyeY - 1, 2, 2);
        ctx.fillRect(width * 0.63, eyeY - 1, 2, 2);

        // ARMS / POSES
        ctx.fillStyle = '#2e1a47';
        if (isTelegraphing || isLightning || isGroundPound) {
          if (e.jumpCount === 0) {
            // ARMS DOWN - More aggressive downward pose
            ctx.fillRect(-12, height * 0.4, 18, height * 0.7);
            ctx.fillRect(width - 6, height * 0.4, 18, height * 0.7);
            
            // Downward wind/energy lines for telegraphing
            if (isTelegraphing) {
              ctx.strokeStyle = '#bd00ff';
              ctx.lineWidth = 2;
              for (let i = 0; i < 3; i++) {
                const ox = (i - 1) * 20 + width/2;
                const oy = height + 10 + (frame % 20);
                ctx.beginPath();
                ctx.moveTo(ox, oy);
                ctx.lineTo(ox, oy + 20);
                ctx.stroke();
              }
            }
          } else {
            // ARMS OUT
            ctx.fillRect(-40, height * 0.2, 45, 18);
            ctx.fillRect(width - 5, height * 0.2, 45, 18);

            // Circular energy for Outward telegraph
            if (isTelegraphing) {
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(width/2, height/2, 60 + Math.sin(frame * 0.2) * 10, 0, Math.PI * 2);
                ctx.stroke();
            }
          }
        }

        if (isLightning && e.activeLightningStrikes && e.activeLightningStrikes.length > 0) {
          // Lightning Storm: Vertical bolts everywhere except directly under the boss, persisting with the hurtbox
          ctx.save();
          e.activeLightningStrikes.forEach(strike => {
            const relX = strike.x - e.pos.x;
            const floorY = 550 - e.pos.y;
            const ceilY = 100 - e.pos.y;
            const progress = strike.duration / (strike.maxDuration || 35);
            const halfW = (strike.width || 70) / 2;

            // Translucent glowing column marking the active hurtbox area
            const colGrad = ctx.createLinearGradient(relX - halfW, 0, relX + halfW, 0);
            colGrad.addColorStop(0, 'rgba(0, 229, 255, 0)');
            colGrad.addColorStop(0.5, `rgba(0, 240, 255, ${0.35 * progress})`);
            colGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
            ctx.fillStyle = colGrad;
            ctx.fillRect(relX - halfW, ceilY, strike.width || 70, floorY - ceilY);

            // Core electric bolt
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.shadowBlur = 18;
            ctx.shadowColor = '#00e5ff';
            ctx.beginPath();
            ctx.moveTo(relX, ceilY);
            const segments = 12;
            for (let i = 1; i < segments; i++) {
              const segY = ceilY + (i / segments) * (floorY - ceilY);
              const segX = relX + (Math.sin(frame * 0.5 + i * 2.3) * 16) + (Math.random() - 0.5) * 10;
              ctx.lineTo(segX, segY);
            }
            ctx.lineTo(relX, floorY);
            ctx.stroke();

            // Crackling yellow electric branches off the bolt
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#ffff00';
            for (let b = 0; b < 3; b++) {
              const branchY = ceilY + ((b + 1) / 4) * (floorY - ceilY);
              const dir = (b % 2 === 0 ? 1 : -1);
              ctx.beginPath();
              ctx.moveTo(relX, branchY);
              ctx.lineTo(relX + dir * (25 + Math.random() * 25), branchY + (Math.random() - 0.5) * 30);
              ctx.stroke();
            }

            // Floor impact electric splash
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(relX, floorY, 12 + Math.random() * 8, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.restore();
        }

        if (isGroundPound) {
          // Perimeter electrification (floor, ceiling, walls light up for a half second on landing)
          if ((e.electrifiedTimer || 0) > 0) {
            const floorY = 550 - e.pos.y;
            const ceilY = 100 - e.pos.y;
            const leftX = 7240 - e.pos.x;
            const rightX = 7960 - e.pos.x;

            ctx.save();
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00ffff';

            // 1. High-voltage energy borders
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 6;
            ctx.beginPath();
            // Floor
            ctx.moveTo(leftX, floorY);
            ctx.lineTo(rightX, floorY);
            // Ceiling
            ctx.moveTo(leftX, ceilY);
            ctx.lineTo(rightX, ceilY);
            // Left Wall
            ctx.moveTo(leftX, ceilY);
            ctx.lineTo(leftX, floorY);
            // Right Wall
            ctx.moveTo(rightX, ceilY);
            ctx.lineTo(rightX, floorY);
            ctx.stroke();

            // Core bright white line inside the cyan beam
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.rect(leftX, ceilY, rightX - leftX, floorY - ceilY);
            ctx.stroke();

            // 2. High-frequency crackling lightning arcs along all 4 boundaries
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#ffff00';

            // Floor arcs
            const floorSegments = 24;
            ctx.beginPath();
            for (let i = 0; i <= floorSegments; i++) {
              const px = leftX + (i / floorSegments) * (rightX - leftX);
              const py = floorY + (Math.random() - 0.5) * 16;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();

            // Ceiling arcs
            const ceilSegments = 24;
            ctx.beginPath();
            for (let i = 0; i <= ceilSegments; i++) {
              const px = leftX + (i / ceilSegments) * (rightX - leftX);
              const py = ceilY + (Math.random() - 0.5) * 16;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();

            // Left wall arcs
            const wallSegments = 16;
            ctx.beginPath();
            for (let i = 0; i <= wallSegments; i++) {
              const py = ceilY + (i / wallSegments) * (floorY - ceilY);
              const px = leftX + (Math.random() - 0.5) * 16;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();

            // Right wall arcs
            ctx.beginPath();
            for (let i = 0; i <= wallSegments; i++) {
              const py = ceilY + (i / wallSegments) * (floorY - ceilY);
              const px = rightX + (Math.random() - 0.5) * 16;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();

            // 3. Electric sparks shooting inwards from boundaries
            for (let i = 0; i < 8; i++) {
              const rx = leftX + Math.random() * (rightX - leftX);
              ctx.beginPath();
              ctx.moveTo(rx, floorY);
              ctx.lineTo(rx + (Math.random() - 0.5) * 30, floorY - Math.random() * 40);
              ctx.stroke();

              const cx = leftX + Math.random() * (rightX - leftX);
              ctx.beginPath();
              ctx.moveTo(cx, ceilY);
              ctx.lineTo(cx + (Math.random() - 0.5) * 30, ceilY + Math.random() * 40);
              ctx.stroke();
            }

            ctx.restore();
          }
        }

        if (isTeleporting) {
          for (let i = 0; i < 8; i++) {
            const px = (Math.random() - 0.5) * width * 2 + width/2;
            const py = (Math.random() - 0.5) * height * 2 + height/2;
            ctx.fillStyle = (Math.random() > 0.5) ? '#120820' : '#4a1175';
            ctx.fillRect(px, py, 3, 3);
          }
        }

        ctx.globalAlpha = 1.0;
      }
      break;
    case 'Toxic Tommy':
      {
        const isSubmerged = e.bossState === 'submerged_chase' || e.bossState === 'telegraph_emerge' || e.bossState === 'dive_in_sludge';
        const isPukingClose = e.bossState === 'puke_closing_in';
        const isPukingFar = e.bossState === 'puke_going_outward';
        const isPuking = isPukingClose || isPukingFar;
        const isWeaknessStunned = e.bossState === 'weakness_stunned';
        const isExhausted = e.bossState === 'vulnerable_idle' || isWeaknessStunned;

        if (isSubmerged) {
          // Submerged in the sludge: show Tommy's actual body underneath enveloped in a pulsating filth shield!
          ctx.save();

          // 1. Draw Tommy's body underneath (dimmed/sludge-tinted)
          ctx.save();
          ctx.globalAlpha = 0.85;

          // Back tank
          ctx.fillStyle = '#4B5563';
          ctx.fillRect(width * 0.05, height * 0.2, width * 0.2, height * 0.5);
          ctx.fillStyle = '#166534';
          ctx.fillRect(width * 0.07, height * 0.25, width * 0.16, height * 0.4);

          // Bloated mutant body & torso
          ctx.fillStyle = '#145A32';
          ctx.beginPath();
          ctx.ellipse(width * 0.5, height * 0.55, width * 0.38, height * 0.36, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#0B3B17';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Glowing predatory mutant eyes glowing through the muck
          ctx.fillStyle = '#FFFF00';
          ctx.shadowColor = '#ADFF2F';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(width * 0.42, height * 0.35, 6, 0, Math.PI * 2);
          ctx.arc(width * 0.62, height * 0.35, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#DC2626';
          ctx.beginPath();
          ctx.arc(width * 0.44, height * 0.35, 2.5, 0, Math.PI * 2);
          ctx.arc(width * 0.64, height * 0.35, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Dorsal mutated spines cutting upward
          ctx.fillStyle = '#0F3818';
          ctx.beginPath();
          ctx.moveTo(width * 0.25, height * 0.25);
          ctx.lineTo(width * 0.35, -8);
          ctx.lineTo(width * 0.45, height * 0.25);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(width * 0.5, height * 0.25);
          ctx.lineTo(width * 0.65, -14);
          ctx.lineTo(width * 0.75, height * 0.25);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          // 2. The Filth Shield: pulsating biohazard toxic barrier surrounding his entire silhouette
          const pulse = Math.sin(frame * 0.12) * 6;
          const shieldRadiusX = width * 0.62 + pulse;
          const shieldRadiusY = height * 0.55 + pulse * 0.6;
          const shieldCenterX = width * 0.5;
          const shieldCenterY = height * 0.5;

          // Outer toxic aura glow
          const shieldGrad = ctx.createRadialGradient(
            shieldCenterX, shieldCenterY, width * 0.2,
            shieldCenterX, shieldCenterY, shieldRadiusX + 12
          );
          shieldGrad.addColorStop(0, 'rgba(39, 174, 96, 0.1)');
          shieldGrad.addColorStop(0.5, 'rgba(46, 204, 113, 0.35)');
          shieldGrad.addColorStop(0.85, 'rgba(173, 255, 47, 0.6)');
          shieldGrad.addColorStop(1, 'rgba(173, 255, 47, 0.0)');

          ctx.fillStyle = shieldGrad;
          ctx.beginPath();
          ctx.ellipse(shieldCenterX, shieldCenterY, shieldRadiusX + 10, shieldRadiusY + 8, 0, 0, Math.PI * 2);
          ctx.fill();

          // Thick protective filth crust ring
          ctx.strokeStyle = '#2ECC71';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#ADFF2F';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.ellipse(shieldCenterX, shieldCenterY, shieldRadiusX, shieldRadiusY, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Inner high-voltage toxic barrier ring
          ctx.strokeStyle = '#ADFF2F';
          ctx.lineWidth = 2;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.ellipse(shieldCenterX, shieldCenterY, shieldRadiusX - 8, shieldRadiusY - 6, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Swirling filth chunks orbiting the barrier
          const chunkCount = 6;
          for (let i = 0; i < chunkCount; i++) {
            const angle = (frame * 0.05) + (i * ((Math.PI * 2) / chunkCount));
            const cx = shieldCenterX + Math.cos(angle) * (shieldRadiusX - 2);
            const cy = shieldCenterY + Math.sin(angle) * (shieldRadiusY - 2);
            const cSize = 4 + (i % 3) * 2;
            ctx.fillStyle = i % 2 === 0 ? '#196F3D' : '#85929E';
            ctx.beginPath();
            ctx.arc(cx, cy, cSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ADFF2F';
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          // Electric bio-arcs crackling across the shield
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.shadowColor = '#ADFF2F';
          ctx.shadowBlur = 6;
          for (let a = 0; a < 3; a++) {
            const arcAngle = (frame * 0.08 + a * 2.1) % (Math.PI * 2);
            const startX = shieldCenterX + Math.cos(arcAngle) * (shieldRadiusX - 6);
            const startY = shieldCenterY + Math.sin(arcAngle) * (shieldRadiusY - 4);
            const midX = shieldCenterX + Math.cos(arcAngle + 0.3) * (shieldRadiusX + 4);
            const midY = shieldCenterY + Math.sin(arcAngle + 0.3) * (shieldRadiusY + 3);
            const endX = shieldCenterX + Math.cos(arcAngle + 0.6) * (shieldRadiusX - 6);
            const endY = shieldCenterY + Math.sin(arcAngle + 0.6) * (shieldRadiusY - 4);

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(midX, midY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
          }

          ctx.restore();
          break;
        }

        // When Tommy is emerging, puking, or vulnerable:
        // Sludge geyser beneath him if puking or emerged
        if (isPuking || e.bossState === 'emerge_shatter' || isExhausted) {
          ctx.save();
          // Toxic sludge spout/column lifting Tommy
          ctx.fillStyle = '#27AE60';
          ctx.beginPath();
          ctx.moveTo(width * 0.15, height);
          ctx.lineTo(width * 0.85, height);
          ctx.lineTo(width * 0.95, height + 80);
          ctx.lineTo(width * 0.05, height + 80);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#2ECC71';
          ctx.beginPath();
          ctx.ellipse(width / 2, height + 10, width * 0.4, 12, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Bloated mutant body
        ctx.save();
        if (isExhausted) {
          // Flashing vulnerability outline
          const flash = Math.sin(frame * 0.3) > 0;
          if (flash) {
            ctx.shadowColor = '#FFFF00';
            ctx.shadowBlur = 15;
          }
        }

        // Hazard suit back tank
        ctx.fillStyle = '#7F8C8D';
        ctx.fillRect(width * 0.05, height * 0.2, width * 0.2, height * 0.5);
        ctx.fillStyle = '#2ECC71';
        ctx.fillRect(width * 0.07, height * 0.25, width * 0.16, height * 0.4);
        // Sludge level inside glass tank
        const tankSludge = Math.sin(frame * 0.1) * 4;
        ctx.fillStyle = '#ADFF2F';
        ctx.fillRect(width * 0.07, height * 0.4 + tankSludge, width * 0.16, height * 0.25 - tankSludge);

        // Bloated belly & torso
        ctx.fillStyle = '#1E8449';
        ctx.beginPath();
        const bellyBulge = isPuking ? Math.sin(frame * 0.6) * 6 : 0;
        ctx.ellipse(width * 0.5 + bellyBulge, height * 0.55, width * 0.38, height * 0.36, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#145A32';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Biohazard Acid Canister on Shoulder
        ctx.fillStyle = '#374151';
        ctx.fillRect(width * 0.08, height * 0.18, 14, 26);
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(width * 0.08, height * 0.18, 14, 26);
        ctx.fillStyle = '#2ECC71';
        ctx.fillRect(width * 0.10, height * 0.24, 10, 18);
        ctx.fillStyle = '#ADFF2F';
        ctx.fillRect(width * 0.10, height * 0.27, 10, 15);
        if (frame % 14 < 7) {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(width * 0.10 + 5, height * 0.26, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Torn yellow hazard suit remnants
        ctx.fillStyle = '#F1C40F';
        ctx.beginPath();
        ctx.moveTo(width * 0.2, height * 0.35);
        ctx.lineTo(width * 0.4, height * 0.45);
        ctx.lineTo(width * 0.3, height * 0.7);
        ctx.lineTo(width * 0.15, height * 0.6);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(width * 0.8, height * 0.35);
        ctx.lineTo(width * 0.6, height * 0.45);
        ctx.lineTo(width * 0.7, height * 0.7);
        ctx.lineTo(width * 0.85, height * 0.6);
        ctx.closePath();
        ctx.fill();

        // Toxic veins & boils on body
        ctx.fillStyle = '#ADFF2F';
        ctx.beginPath();
        ctx.arc(width * 0.45, height * 0.55, 6, 0, Math.PI * 2);
        ctx.arc(width * 0.62, height * 0.65, 8, 0, Math.PI * 2);
        ctx.arc(width * 0.38, height * 0.72, 5, 0, Math.PI * 2);
        ctx.fill();

        // Head & mutated jaw
        const pukeFacing = e.pukeDir || 1;
        ctx.fillStyle = '#27AE60';
        const headY = isPuking ? height * 0.18 : height * 0.22;
        const headCenterX = isPuking ? (pukeFacing > 0 ? width * 0.58 : width * 0.42) : width * 0.55;
        ctx.beginPath();
        ctx.ellipse(headCenterX, headY, width * 0.3, height * 0.22, isPuking ? (pukeFacing > 0 ? -0.2 : 0.2) : 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Eyes
        if (isExhausted) {
          // Dizzy X eyes
          ctx.strokeStyle = '#111';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(width * 0.45, headY - 8); ctx.lineTo(width * 0.55, headY + 2);
          ctx.moveTo(width * 0.55, headY - 8); ctx.lineTo(width * 0.45, headY + 2);
          ctx.moveTo(width * 0.65, headY - 8); ctx.lineTo(width * 0.75, headY + 2);
          ctx.moveTo(width * 0.75, headY - 8); ctx.lineTo(width * 0.65, headY + 2);
          ctx.stroke();
        } else {
          // Bloodshot yellow eyes
          ctx.fillStyle = '#F4D03F';
          ctx.beginPath();
          const eye1X = pukeFacing > 0 ? width * 0.5 : width * 0.3;
          const eye2X = pukeFacing > 0 ? width * 0.7 : width * 0.5;
          ctx.arc(eye1X, headY - 4, 7, 0, Math.PI * 2);
          ctx.arc(eye2X, headY - 4, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#C0392B';
          ctx.beginPath();
          ctx.arc(eye1X + 2 * pukeFacing, headY - 4, 3, 0, Math.PI * 2);
          ctx.arc(eye2X + 2 * pukeFacing, headY - 4, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Mouth & Puking Animation
        if (isPuking) {
          // Gaping spewing jaw facing pukeDir
          const mouthCenterX = pukeFacing > 0 ? width * 0.68 : width * 0.32;
          ctx.fillStyle = '#196F3D';
          ctx.beginPath();
          ctx.ellipse(mouthCenterX, headY + 14, 14, 18, pukeFacing * 0.4, 0, Math.PI * 2);
          ctx.fill();

          // Chunky toxic vomit stream exiting mouth
          ctx.fillStyle = '#ADFF2F';
          ctx.beginPath();
          ctx.arc(mouthCenterX + pukeFacing * 6, headY + 16, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#2ECC71';
          ctx.beginPath();
          ctx.arc(mouthCenterX + pukeFacing * 14, headY + 20, 10, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Grinning jagged teeth with green drool
          ctx.fillStyle = '#111';
          ctx.fillRect(width * 0.48, headY + 10, width * 0.28, 8);
          ctx.fillStyle = '#ADFF2F';
          ctx.fillRect(width * 0.52, headY + 16, 4, 12);
        }

        // Exhausted stars
        if (isExhausted) {
          const starCount = 3;
          for (let i = 0; i < starCount; i++) {
            const angle = (frame * 0.08) + (i * ((Math.PI * 2) / starCount));
            const sx = Math.cos(angle) * 35 + width / 2;
            const sy = Math.sin(angle * 0.6) * 10 - 15;
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(sx, sy, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        if (e.isOiled || isWeaknessStunned) {
          // Dark crude oil running down Tommy
          ctx.save();
          ctx.fillStyle = '#111111';
          ctx.fillRect(width * 0.35, height * 0.3, 6, 25);
          ctx.fillRect(width * 0.55, height * 0.35, 8, 30);
          ctx.fillRect(width * 0.72, height * 0.4, 5, 20);
          ctx.fillStyle = '#222222';
          ctx.beginPath();
          ctx.arc(width * 0.5, height * 0.6, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.restore();
      }
      break;
    case 'Oily Oscar': {
      // 1. Industrial Grease Boots
      ctx.fillStyle = '#212121';
      ctx.fillRect(width * 0.16, height * 0.74, width * 0.28, height * 0.26);
      ctx.fillRect(width * 0.56, height * 0.74, width * 0.28, height * 0.26);

      // 2. Petroleum Boiler-Plate Torso
      ctx.fillStyle = '#3E2723';
      ctx.fillRect(width * 0.14, height * 0.36, width * 0.72, height * 0.40);
      ctx.strokeStyle = '#1A110F';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(width * 0.14, height * 0.36, width * 0.72, height * 0.40);

      // Brass Pressure Gauge & Pipe
      ctx.strokeStyle = '#D4AC0D';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width * 0.14, height * 0.50);
      ctx.lineTo(width * 0.86, height * 0.50);
      ctx.stroke();

      ctx.fillStyle = '#D4AC0D';
      ctx.beginPath();
      ctx.arc(width * 0.50, height * 0.50, width * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#F9E79F';
      ctx.beginPath();
      ctx.arc(width * 0.50, height * 0.50, width * 0.08, 0, Math.PI * 2);
      ctx.fill();
      // Pressure needle
      ctx.strokeStyle = '#C0392B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width * 0.50, height * 0.50);
      ctx.lineTo(width * 0.54, height * 0.44);
      ctx.stroke();

      // 3. Rusted Exhaust Smokestacks on Shoulders
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(width * 0.04, height * 0.16, width * 0.14, height * 0.26);
      ctx.strokeRect(width * 0.04, height * 0.16, width * 0.14, height * 0.26);
      ctx.fillRect(width * 0.82, height * 0.16, width * 0.14, height * 0.26);
      ctx.strokeRect(width * 0.82, height * 0.16, width * 0.14, height * 0.26);

      // Chugging black oily smoke clouds
      const smokeOff = (frame * 0.5) % 20;
      ctx.fillStyle = 'rgba(33, 33, 33, 0.6)';
      ctx.beginPath();
      ctx.arc(width * 0.11, height * 0.10 - smokeOff * 0.6, 5 + smokeOff * 0.3, 0, Math.PI * 2);
      ctx.arc(width * 0.89, height * 0.10 - smokeOff * 0.6, 5 + smokeOff * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // 4. Riveted Iron Welding Helmet
      ctx.fillStyle = '#3E2723';
      ctx.beginPath();
      ctx.moveTo(width * 0.25, height * 0.08);
      ctx.lineTo(width * 0.75, height * 0.08);
      ctx.lineTo(width * 0.78, height * 0.36);
      ctx.lineTo(width * 0.64, height * 0.42);
      ctx.lineTo(width * 0.36, height * 0.42);
      ctx.lineTo(width * 0.22, height * 0.36);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#1A110F';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Brass Rivets on Helmet
      ctx.fillStyle = '#D4AC0D';
      ctx.beginPath();
      ctx.arc(width * 0.28, height * 0.12, 2, 0, Math.PI * 2);
      ctx.arc(width * 0.72, height * 0.12, 2, 0, Math.PI * 2);
      ctx.arc(width * 0.26, height * 0.32, 2, 0, Math.PI * 2);
      ctx.arc(width * 0.74, height * 0.32, 2, 0, Math.PI * 2);
      ctx.fill();

      // 5. Glowing Amber Furnace Visor
      ctx.fillStyle = '#111111';
      ctx.fillRect(width * 0.28, height * 0.18, width * 0.44, height * 0.10);
      ctx.strokeStyle = '#D4AC0D';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(width * 0.28, height * 0.18, width * 0.44, height * 0.10);

      ctx.fillStyle = '#FF9800';
      ctx.shadowColor = '#FF9800';
      ctx.shadowBlur = 8;
      ctx.fillRect(width * 0.32, height * 0.20, width * 0.36, height * 0.06);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#FFEB3B';
      ctx.fillRect(width * 0.35, height * 0.22, width * 0.30, height * 0.02);

      // 6. Heavy Steel Respirator Jaw dripping Crude
      ctx.fillStyle = '#263238';
      ctx.fillRect(width * 0.34, height * 0.30, width * 0.32, height * 0.10);
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(width * 0.34, height * 0.30, width * 0.32, height * 0.10);
      ctx.fillStyle = '#D4AC0D';
      ctx.beginPath();
      ctx.arc(width * 0.42, height * 0.35, 3, 0, Math.PI * 2);
      ctx.arc(width * 0.58, height * 0.35, 3, 0, Math.PI * 2);
      ctx.fill();

      // Black Oil Drips from Jaw
      ctx.fillStyle = '#111111';
      const dripY = (frame * 0.8) % 15;
      ctx.fillRect(width * 0.40, height * 0.40 + dripY, 3, 6);
      ctx.fillRect(width * 0.58, height * 0.40 + ((dripY + 7) % 15), 3, 6);
      break;
    }
    default: ctx.fillStyle = 'yellow'; ctx.fillRect(0, 0, width, height); break;
  }
  ctx.restore();
};

export const drawDaleDrugs = (ctx: CanvasRenderingContext2D, e: Enemy) => {
  if (e.bossState === 'using_shipment' && e.shipmentCount! > 0) {
    const stackX = e.pos.x - 60, groundY = 550;
    ctx.save();
    for (let i = 0; i < e.shipmentCount!; i++) {
      const row = Math.floor(i / 2), col = i % 2;
      if (e.shipmentType === 'cocaine') {
        ctx.fillStyle = '#fff'; ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1;
        const bx = stackX + (col * 20) + (row * 3), by = groundY - (row * 15) - 20;
        ctx.fillRect(bx, by, 18, 18); ctx.strokeRect(bx, by, 18, 18);
      } else if (e.shipmentType === 'meth') {
        ctx.fillStyle = '#111'; ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2;
        const bx = stackX + (col * 30) - 10, by = groundY - (row * 35) - 40;
        ctx.fillRect(bx, by, 30, 40); ctx.strokeRect(bx, by, 30, 40);
        ctx.fillStyle = '#FFD700'; ctx.font = '8px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText("METH", bx + 15, by + 25);
      } else if (e.shipmentType === 'speed' && e.stateTimer! > 0) {
        const bx = stackX, by = groundY - 20;
        ctx.fillStyle = COLORS.PROJECTILE_DART; ctx.fillRect(bx + 5, by, 15, 4);
        ctx.fillStyle = 'red'; ctx.fillRect(bx, by - 2, 6, 8);
      }
    }
    ctx.restore();
  }
};
