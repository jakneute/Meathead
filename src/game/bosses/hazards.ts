// Screen-wide effects and stage hazards: the tsunami, steam blasts, volcano vents and Toxic Tommy's arena.

import { TommyBoard } from '../../types';
import {
  CANVAS_WIDTH, BOSS_DOOR_X, PLAYER_INVINCIBILITY_FRAMES, PLAYER_PUSHBACK_DURATION,
  PLAYER_PUSHBACK_VEL_X, PLAYER_PUSHBACK_VEL_Y, PARTICLE_PALETTES,
  TSUNAMI_WAVE_SPEED, TSUNAMI_DAMAGE_BOSS, TSUNAMI_DAMAGE_WEAKNESS, TSUNAMI_DAMAGE_MIDBOSS, TSUNAMI_DAMAGE_DOORMAN,
} from '../../constants';
import { FrameContext } from '../core/context';
import { hitBoss, isWeakTo } from './registry';
import { updateCorkedVent, ventTip } from './victor';
import { pickRandom } from '../core/utils';
import { killPlayer, landPlayer } from '../player/player';
import { isMidBoss, midBossDamage, JUNKIE_WAVE_RESIST } from '../combat/midBoss';

/** The player's tsunami sweeps across the screen, killing regular enemies outright. */
export const updateTsunami = (ctx: FrameContext) => {
  const { state, fx, stageId } = ctx;
  if (!state.tsunamiActive) return;
  const dir = state.tsunamiDir;
  state.tsunamiX += TSUNAMI_WAVE_SPEED * dir;
  const dist = Math.abs(state.tsunamiX - state.tsunamiStartX);
  const progress = dist / (CANVAS_WIDTH * 1.5);
  // (built for a flat floor, then lifted to the height he fired it from)
  const offsetY = state.tsunamiOffsetY || 0;
  const tsunamiTopY = Math.pow(Math.min(1.0, dist / (CANVAS_WIDTH * 1.25)), 0.6) * 560 + offsetY;
  const waveHeight = 600 + offsetY - tsunamiTopY;

  // Wave face particles, curved so the middle leads
  const density = 35, bendMult = 120;
  for (let i = 0; i <= density; i++) {
    const yPct = i / density;
    const normalizedY = (yPct - 0.5) * 2;
    const px = state.tsunamiX + (normalizedY * normalizedY) * bendMult * dir;
    const py = tsunamiTopY + (yPct * waveHeight);
    state.particles.push({ pos: { x: px + (Math.random() - 0.5) * 40, y: py + (Math.random() - 0.5) * 15 }, vel: { x: (TSUNAMI_WAVE_SPEED * 0.4 + Math.random() * 8) * dir, y: (Math.random() - 0.5) * 4 }, life: 12 + Math.random() * 18, color: pickRandom(PARTICLE_PALETTES.WATER), size: 8 + Math.random() * 12, isWater: true });
    if (i < 3 && Math.random() > 0.4) state.particles.push({ pos: { x: px, y: py }, vel: { x: (TSUNAMI_WAVE_SPEED * 0.9) * dir, y: (Math.random() - 0.5) * 10 }, life: 20 + Math.random() * 10, color: '#FFFFFF', size: 5 + Math.random() * 5, isWater: true });
  }

  // Water hitting Victor's volcano vents turns them into steam explosions
  if (stageId === 'Victor Volcano') {
    state.bossVolcanoes = state.bossVolcanoes.filter(v => {
      // A corked vent is sealed: the water just washes over it
      if (v.corked || Math.abs(v.pos.x - state.tsunamiX) >= 60) return true;
      const tip = ventTip(v);
      state.bossSteamExplosions.push({ pos: tip, life: 45, radius: 100 });
      fx.spawnSteamExplosionParticles(tip, 40);
      state.screenShakeTimer = 12;
      return false;
    });
  }

  state.projectiles.forEach(p => {
    if (!p.isMethBarrel || p.health <= 0) return;
    if (Math.abs(p.pos.x + p.width / 2 - state.tsunamiX) < 120) {
      p.vel = { x: dir * 20, y: -10 };
      p.rotation = (p.rotation || 0) + 0.5;
      p.health -= TSUNAMI_DAMAGE_BOSS;
      fx.spawnDamageNumber(p.pos, TSUNAMI_DAMAGE_BOSS);
    }
  });

  state.enemies.forEach(e => {
    if (e.health <= 0 || e.isBlownAway) return;
    const inWave = Math.abs(e.pos.x + e.width / 2 - state.tsunamiX) < 120 && e.pos.y + e.height > tsunamiTopY && e.pos.y < 600 + offsetY + 60;
    if (!inWave) return;
    if (e.type === 'boss') {
      if (!state.arenaLocked || (e.hitCooldown && e.hitCooldown > 0)) return;
      hitBoss(ctx, e, 'TSUNAMI', { facing: dir, damage: isWeakTo(stageId, 'TSUNAMI') ? TSUNAMI_DAMAGE_WEAKNESS : TSUNAMI_DAMAGE_BOSS });
    } else if (isMidBoss(e)) {
      // A mid-boss takes it like a boss would, once per wave (it isn't washed away): a heavy hit, except to the
      // doorman, who just stands there in it (and it never finishes him off: his fight ends its own way)
      // (each wave once: by its number, not where it started, since with the camera locked they all start in the one place)
      if (e.tsunamiWave === state.tsunamiSerial) return;
      e.tsunamiWave = state.tsunamiSerial;
      const dmg = e.kind === 'doorman' ? TSUNAMI_DAMAGE_DOORMAN : e.kind === 'junkie' ? TSUNAMI_DAMAGE_MIDBOSS * JUNKIE_WAVE_RESIST : midBossDamage(e, TSUNAMI_DAMAGE_MIDBOSS);
      e.health = e.kind === 'doorman' ? Math.max(1, e.health - dmg) : e.health - dmg;
      e.hitFlash = 8;
      fx.spawnDamageNumber(e.pos, dmg, e.kind !== 'doorman');
    } else {
      e.health = 0;
      fx.blowAwayEnemy(e, { x: dir * 20, y: -10 }, 'tsunami_kill', dir);
      fx.spawnKillCallout(e, 'tsunami');
      state.player.killSatisfactionTimer = 60;
    }
  });

  if (progress >= 1.0) state.tsunamiActive = false;
};

export const updateSteamExplosions = (ctx: FrameContext) => {
  const { state, fx } = ctx;
  const { player } = state;
  state.bossSteamExplosions = state.bossSteamExplosions.filter(exp => {
    exp.life--;
    const dx = player.pos.x + player.width / 2 - exp.pos.x;
    const dy = player.pos.y + player.height / 2 - exp.pos.y;
    if (dx * dx + dy * dy < exp.radius * exp.radius && player.invincibilityTimer <= 0 && !ctx.cheats.invincible) {
      player.health -= 12;
      state.lastHurt = { source: 'steam', at: state.frame };
      if (player.health > 0) {
        player.invincibilityTimer = PLAYER_INVINCIBILITY_FRAMES;
        player.pushbackTimer = PLAYER_PUSHBACK_DURATION;
        player.vel.x = dx > 0 ? PLAYER_PUSHBACK_VEL_X : -PLAYER_PUSHBACK_VEL_X;
        player.vel.y = PLAYER_PUSHBACK_VEL_Y;
        fx.speakVulgarity('hurt', 'steam');
      }
    }
    if (state.frame % 3 === 0) fx.spawnSteamExplosionParticles(exp.pos, 6);
    return exp.life > 0;
  });
};

/** Victor's active vents spit magma every 12 frames. */
export const updateVolcanoes = (ctx: FrameContext) => {
  const { state } = ctx;
  state.bossVolcanoes = state.bossVolcanoes.filter(v => {
    if (v.corked) return updateCorkedVent(ctx, v);
    v.life--;
    v.age = (v.age || 0) + 1;
    if (state.frame % 12 === 0) {
      // Out of the crater at the tip of the cone
      const tip = ventTip(v);
      const velX = v.type === 'wall' ? (v.pos.x < BOSS_DOOR_X + 400 ? 9 : -9) : (Math.random() - 0.5) * 4;
      const velY = v.type === 'ground' ? -9 : (Math.random() - 0.5) * 7;
      state.projectiles.push({ id: `magma-${Date.now()}-${Math.random()}`, pos: { x: tip.x - 7, y: tip.y - 7 }, vel: { x: velX, y: velY }, width: 14, height: 14, health: 1, maxHealth: 1, type: 'projectile', damage: 22, owner: 'enemy' });
    }
    return v.life > 0;
  });
};

/** Toxic Tommy's arena: bobbing boards that shatter and regrow over a lethal sludge pool. */
export const updateTommyArena = (ctx: FrameContext) => {
  const { state, stageId, fx } = ctx;
  const { player } = state;
  if (stageId !== 'Toxic Tommy' || !state.arenaLocked || !state.tommyBoards) return;

  state.tommyScrollY = (state.tommyScrollY + 2.5) % 400;
  // The door he kicked in is lying across the catwalk and the first board: that board goes, and so does the door,
  // off the end into the sludge (for good)
  const first = state.tommyBoards[0];
  if (state.doorState === 'done' && state.doorSunkAt === undefined && first && first.status !== 'active') {
    state.doorSunkAt = state.frame;
    fx.playGunSound('splash');
    const x = first.x + first.w / 2;
    for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 50, y: state.tommySludgeY }, vel: { x: (Math.random() - 0.5) * 5, y: -2 - Math.random() * 5 }, life: 30 + Math.random() * 20, color: i % 2 ? '#2ECC71' : '#A3E635', size: 3 + Math.random() * 4 });
  }
  if (state.tommySludgeOiledTimer > 0) state.tommySludgeOiledTimer--;

  let activeCount = 0;
  state.tommyBoards.forEach((b: TommyBoard) => {
    if (b.status === 'shattering') {
      if (--b.shatterTimer <= 0) b.status = 'shattered';
    } else if (b.status === 'rising') {
      b.riseProgress += 0.012;
      b.y = b.baseY + (1 - b.riseProgress) * 60;
      if (state.frame % 5 === 0) fx.spawnExplosion({ x: b.x + Math.random() * b.w, y: state.tommySludgeY }, '#27AE60', 2, 0, 3);
      if (b.riseProgress >= 1) {
        b.status = 'active';
        b.y = b.baseY;
        b.riseProgress = 1;
        fx.playGunSound('barf');
        fx.spawnExplosion({ x: b.x + b.w / 2, y: b.y }, '#27AE60', 10, 0, 6);
      }
    }

    if (b.telegraphTimer && b.telegraphTimer > 0) {
      b.telegraphTimer--;
      b.shakeX = (Math.random() - 0.5) * 6;
      if (state.frame % 3 === 0) fx.spawnExplosion({ x: b.x + Math.random() * b.w, y: b.y }, '#ADFF2F', 3, 0, 3);
    } else {
      b.shakeX = 0;
    }

    if (b.status === 'active' || b.status === 'rising') activeCount++;

    // Standing on an active board (or a rising one that's nearly surfaced)
    if (b.status === 'active' || (b.status === 'rising' && b.riseProgress > 0.8)) {
      const bobY = b.y + Math.sin(state.frame * 0.05 + b.index * 0.8) * 3;
      const feetY = player.pos.y + player.height;
      if (player.vel.y >= 0 && player.pos.x + player.width > b.x - 4 && player.pos.x < b.x + b.w + 4 && feetY >= bobY - 4 && feetY <= bobY + 22) {
        player.pos.y = bobY - player.height;
        player.vel.y = 0;
        landPlayer(ctx);
      }
    }
  });

  // Once only 5 boards remain, one shattered board starts rising again
  if (activeCount <= 5) {
    const toRise = state.tommyBoards.find(b => b.status === 'shattered');
    if (toRise) {
      toRise.status = 'rising';
      toRise.riseProgress = 0;
      toRise.y = toRise.baseY + 60;
      fx.spawnExplosion({ x: toRise.x + toRise.w / 2, y: state.tommySludgeY }, '#27AE60', 15, 0, 8);
    }
  }

  // Falling into the sludge is instant death
  if (player.pos.y + player.height >= state.tommySludgeY + 8 && player.health > 0) {
    player.health = 0;
    killPlayer(ctx, "DISSOLVED IN TOXIC SLUDGE");
    fx.playGunSound('barf');
  }
};
