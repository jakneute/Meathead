import {
  Enemy, Projectile, WeaponType, Player, Volcano, VulgarityType, TommyBoard, PoopTelegraph, Block,
} from '../types';
import {
  BULLET_DAMAGE, BOULDER_SPEED, BOSS_DOOR_X,
  HECTOR_PULL_STRENGTH, GRAVITY,
  DALE_TRUCK_SPEED, DALE_SPEED_WINDUP, METH_BARREL_DAMAGE, HECTOR_PULL_MAX, HECTOR_PULL_RANGE, HECTOR_PULL_EDGE, HECTOR_PULL_FAR, HECTOR_PULL_NEAR, HECTOR_PULL_FARTHEST, ARENA_LEFT, ARENA_RIGHT,
  TASER_BOSS_DAMAGE_REDUCTION, DALE_TRUCK_DAMAGE, DALE_PUSHBACK_VEL,
  BOSS_VULGARITY_DURATION, ERNIE_STOMP_VIBRATION_DURATION, BOSS_WEAPON_REACTION_CHANCE, BOSS_WEAPON_REACTION_COOLDOWN,
  TOMMY_PUKE_PUSHBACK_DURATION,
  PLAYER_INVINCIBILITY_FRAMES, PLAYER_PUSHBACK_DURATION,
  PLAYER_PUSHBACK_VEL_X, PLAYER_PUSHBACK_VEL_Y,
  TOMMY_SWIM_SPEED, TOMMY_SWIM_SPEED_RAMP, TOMMY_CHASE_FRAMES, TOMMY_CHASE_RAMP,
  TOMMY_TELEGRAPH_FRAMES, TOMMY_TELEGRAPH_RAMP, BARRY_SPEEDUP_AT_ZERO_HP,
} from '../constants';
import { BOSS_DIALOGUE, BOSS_WEAPON_REACTIONS } from '../dialogue';
import { GameState, resetPlayerCombatState } from './state';
import { Fx } from './effects';
import { speak, isSpeaking, getBossVoice, claimLine, takeFreshLine } from './speech';

/** Boss AI, weaknesses and damage rules. Drawing lives in render/bossRenderer.ts. */

export interface BossHelpers extends Fx {
  onBossDeath: () => void;
  setBossVulgarity: (text: string, duration: number) => void;
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

export const createBossHelpers = (state: GameState, fx: Fx, onBossDeath: () => void): BossHelpers => ({
  ...fx,
  onBossDeath,
  setBossVulgarity: (t, d) => { state.bossLastVulgarity = t; state.bossVulgarityTimer = d; },
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
});

/** Shows the line over the boss's head and speaks it (unless someone is already talking). */
export const speakAsBoss = (bossId: string, text: string, helpers: BossHelpers) => {
  if (!claimLine(text)) return; // said too recently
  helpers.setBossVulgarity(text, BOSS_VULGARITY_DURATION);
  if (isSpeaking()) return;
  speak(text, getBossVoice(bossId));
};

/**
 * Sometimes a boss shouts back about the weapon that just hit them. Never on
 * the killing blow, and never over another boss line that's still showing.
 */
export const maybeReactToWeapon = (boss: Enemy, weapon: WeaponType, stageId: string | null, state: GameState, helpers: BossHelpers) => {
  if (!stageId || boss.health <= 0 || state.bossReactionCooldown > 0 || state.bossVulgarityTimer > 0) return;
  if (Math.random() >= BOSS_WEAPON_REACTION_CHANCE) return;
  const lines = BOSS_WEAPON_REACTIONS[stageId]?.[weapon];
  if (!lines) return;
  const line = takeFreshLine(lines);
  if (!line) return;
  state.bossReactionCooldown = BOSS_WEAPON_REACTION_COOLDOWN;
  helpers.setBossVulgarity(line, BOSS_VULGARITY_DURATION);
  if (!isSpeaking()) speak(line, getBossVoice(stageId));
};

/** Toxic Tommy can't be hurt while he's under (or at) the sludge surface. */
export const isTommyShielded = (boss: Enemy, state: GameState): boolean =>
  boss.bossState === 'submerged_chase' ||
  boss.bossState === 'telegraph_emerge' ||
  boss.bossState === 'dive_in_sludge' ||
  boss.pos.y >= state.tommySludgeY - 30;

/** Tommy's weakness: oil clogs him up and stuns him out of whatever he was doing. */
export const stunTommyWithOil = (boss: Enemy, state: GameState, helpers: BossHelpers) => {
  boss.bossState = 'weakness_stunned';
  boss.stateTimer = 75;
  boss.pukeSweepProgress = 0;
  state.tommySludgeOiledTimer = 240;
  boss.isOiled = true;
  boss.oiledTimer = 240;
  helpers.spawnExplosion({ x: boss.pos.x + boss.width / 2, y: boss.pos.y + 20 }, '#111111', 25, 0, 10);
  speakAsBoss('Toxic Tommy', "BLAARGH! CRUDE OIL?! I CAN'T CHUNDER!", helpers);
};

/** Artie's weakness: getting hit makes him leap to the opposite side of the arena. */
export const artieWeaknessLeap = (boss: Enemy) => {
  const tx = boss.pos.x < 7560 ? 7850 : 7250;
  boss.vel.y = -22;
  boss.vel.x = (tx - boss.pos.x) / 50;
  boss.bossState = 'jumping';
  boss.stateTimer = 60;
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

export const triggerBossDeath = (boss: Enemy, playerFacing: number, wasWeakness: boolean, stageId: string | null, currentWeapon: WeaponType, state: GameState, helpers: BossHelpers) => {
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
  resetPlayerCombatState(state.player);
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
  state: GameState, 
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

const handleDaleAI = (boss: Enemy, player: Player, invincibilityEnabled: boolean, state: GameState, helpers: BossHelpers) => {
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
      // Speed gets a long, readable wind-up: he visibly shoots up before dashing
      boss.stateTimer = boss.shipmentType === 'speed' ? DALE_SPEED_WINDUP : 30;
    }
  } else if (boss.bossState === 'using_shipment') {
    // The needle goes in halfway through the speed wind-up
    if (boss.shipmentType === 'speed' && boss.stateTimer === Math.floor(DALE_SPEED_WINDUP * 0.55)) {
      helpers.playGunSound('dart');
      helpers.setScreenShake(6);
    }
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

const handleHectorAI = (boss: Enemy, player: Player, invincibilityEnabled: boolean, state: GameState, helpers: BossHelpers) => {
  if (boss.bossState === 'hurricane') {
    const gap = (boss.pos.x + boss.width / 2) - (player.pos.x + player.width / 2);
    const forceDir = gap > 0 ? 1 : -1;
    state.totalPullForceX += forceDir * getHectorPull(Math.abs(gap));
    
    state.projectiles.forEach((p: Projectile) => {
      if (p.owner === 'player' && p.isBoulder) {
        const pullDir = (boss.pos.x + boss.width/2 - (p.pos.x + p.width/2)) > 0 ? 1 : -1;
        p.vel.x += pullDir * 1.5; 
      }
      if (p.isPoop) p.vel.x += forceDir * HECTOR_PULL_STRENGTH;
    });

    state.bossPoopTelegraphs = state.bossPoopTelegraphs.filter((t: PoopTelegraph) => {
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
      // Landing a hit resets him: he leaps across the arena and starts over
      hectorLeapToOtherSide(boss, helpers);
      return;
    }
    if (boss.stateTimer! <= 0) { boss.bossState = 'idle'; boss.stateTimer = 40; helpers.clearPoopTelegraphs(); }
  } else if (boss.bossState === 'jumping') {
    if (boss.isGroundedBoss) { boss.bossState = 'hurricane'; boss.stateTimer = 300; boss.vel.x = 0; }
  } else if (boss.stateTimer! <= 0) {
    boss.bossState = 'jumping'; boss.vel.y = -22 - Math.random() * 4;
    const targetX = boss.pos.x > 7600 ? 7300 : 7900; boss.vel.x = (targetX - boss.pos.x) * 0.035;
  }
};

/**
 * How hard the hurricane drags Meathead at a given distance. Always some pull,
 * growing the closer you get: walkable past half a screen, stronger than
 * walking inside it, strongest point-blank.
 */
export const getHectorPull = (distance: number) => {
  const innerEdge = HECTOR_PULL_RANGE - HECTOR_PULL_EDGE;
  if (distance >= HECTOR_PULL_RANGE) {
    const farthest = ARENA_RIGHT - ARENA_LEFT;
    const k = Math.min(1, (distance - HECTOR_PULL_RANGE) / (farthest - HECTOR_PULL_RANGE));
    return HECTOR_PULL_FAR + (HECTOR_PULL_FARTHEST - HECTOR_PULL_FAR) * k;
  }
  if (distance > innerEdge) {
    const k = (HECTOR_PULL_RANGE - distance) / HECTOR_PULL_EDGE;
    return HECTOR_PULL_FAR + (HECTOR_PULL_NEAR - HECTOR_PULL_FAR) * k;
  }
  return HECTOR_PULL_NEAR + (HECTOR_PULL_MAX - HECTOR_PULL_NEAR) * (1 - distance / innerEdge);
};

/** Hector abandons whatever he's doing and leaps to the far end of the arena to start a new cycle. */
export const hectorLeapToOtherSide = (boss: Enemy, helpers: BossHelpers) => {
  if (boss.bossState === 'jumping') return;
  boss.bossState = 'jumping';
  boss.isGroundedBoss = false;
  boss.vel.y = -22 - Math.random() * 4;
  const targetX = boss.pos.x > 7600 ? 7300 : 7900;
  boss.vel.x = (targetX - boss.pos.x) * 0.035;
  helpers.clearPoopTelegraphs();
};

const handleArtieAI = (boss: Enemy, player: Player, state: GameState, helpers: BossHelpers) => {
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

export const handleErnieAI = (boss: Enemy, player: Player, state: GameState, helpers: BossHelpers) => {
  if (boss.bossState === 'stunned_drop') { if (boss.isGroundedBoss && boss.stateTimer! <= 0) { boss.bossState = 'idle'; boss.stateTimer = 40; boss.rotation = 0; } } 
  else if (boss.stateTimer! <= 0) {
    const dirToPlayer = player.pos.x + player.width/2 < boss.pos.x + boss.width/2 ? -1 : 1;
    boss.vel.y = -12; boss.vel.x = (player.pos.x - boss.pos.x) * 0.03; boss.stateTimer = 180; 
    helpers.addProjectile({ id: `b-ernie-jump-${Date.now()}`, pos: { x: boss.pos.x + boss.width/2, y: boss.pos.y + 20 }, vel: { x: dirToPlayer * (BOULDER_SPEED + 1), y: 0 }, width: 48, height: 48, health: 1, maxHealth: 1, type: 'projectile', damage: BULLET_DAMAGE, owner: 'enemy', isBoulder: true });
  }
};

const handleVictorAI = (boss: Enemy, player: Player, healthPct: number, state: GameState, helpers: BossHelpers) => {
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
    const platforms = state.blocks.filter((b: Block) => b.type === 'platform' && b.x > BOSS_DOOR_X);
    if (platforms.length > 0) {
      const targetPlate = platforms[Math.floor(Math.random() * platforms.length)];
      boss.vel.x = (targetPlate.x + targetPlate.w / 2 - victorMidX) * 0.04;
    } else { boss.vel.x = (player.pos.x < boss.pos.x ? -1 : 1) * 4 + (Math.random()-0.5)*2; }
    boss.bossState = 'jumping'; boss.stateTimer = 60;
  }
  if (boss.isGroundedBoss) boss.vel.x *= 0.95;
};

const handleBlackoutAI = (boss: Enemy, player: Player, state: GameState, helpers: BossHelpers) => {
  // Mild speed-up as he loses health: every phase timing shrinks a little
  const missingHpRatio = Math.max(0, Math.min(1, 1 - boss.health / boss.maxHealth));
  const pace = 1 - missingHpRatio * BARRY_SPEEDUP_AT_ZERO_HP;
  const frames = (n: number) => Math.max(1, Math.round(n * pace));

  if (boss.bossState === 'idle' && boss.stateTimer! <= 0) {
    boss.bossState = 'blackout_teleport';
    boss.stateTimer = frames(260);
    boss.jumpCount = 0; 
    boss.shootTimer = 0; 
    helpers.setScreenShake(10);
  } else if (boss.bossState === 'blackout_teleport') {
    boss.shootTimer = (boss.shootTimer || 0) + 1;
    const teleportInterval = Math.max(6, Math.floor(frames(26) - (boss.jumpCount || 0) * 2));
    
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
      boss.stateTimer = frames(90); 
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
        boss.stateTimer = frames(130);
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
          boss.stateTimer = frames(150);
          boss.pos.y = 470;
        }
      }
    }
  } else if (boss.bossState === 'lightning_storm') {
    boss.activeLightningStrikes = boss.activeLightningStrikes || [];

    // Periodically spawn new vertical strikes across the arena (excluding directly under boss)
    if (boss.stateTimer! % frames(10) === 0 && boss.stateTimer! > 25) {
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
      boss.stateTimer = frames(150);
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
      boss.stateTimer = frames(35);
      boss.pos.y = 470;
    }
  }
};

const handleTommyAI = (
  boss: Enemy,
  player: Player,
  invincibilityEnabled: boolean,
  state: GameState,
  helpers: BossHelpers
) => {
  const sludgeY = state.tommySludgeY || 510;
  // Health-based scaling factors (0.0 at full health, 1.0 at 0 health)
  const missingHpRatio = Math.max(0, Math.min(1, 1 - (boss.health / (boss.maxHealth || 250))));
  // He gets a bit faster and more aggressive as he loses health
  const baseSpeed = TOMMY_SWIM_SPEED + missingHpRatio * TOMMY_SWIM_SPEED_RAMP;
  // Randomized stalking time before he surfaces
  const getRandomChaseDuration = () => {
    const base = TOMMY_CHASE_FRAMES - missingHpRatio * TOMMY_CHASE_RAMP;
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
        const baseTelegraph = TOMMY_TELEGRAPH_FRAMES - missingHpRatio * TOMMY_TELEGRAPH_RAMP;
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
        const telegraphTime = Math.max(30, Math.round(TOMMY_TELEGRAPH_FRAMES - 7 - missingHpRatio * TOMMY_TELEGRAPH_RAMP));
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
