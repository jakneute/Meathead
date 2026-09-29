import { Vector2, PickupType, VulgarityType, Enemy } from '../../types';
import {
  PARTICLE_PALETTES, BOULDER_SHRAPNEL_DAMAGE, VULGARITY_TEXT_DURATION, VOICE_LINE_COOLDOWN_FRAMES, SPOKEN_TEXT_HOLD, SPOKEN_TEXT_LINGER, WEAPON_RANGE_STAGE } from '../../constants';
import { VULGARITIES, BOSS_DIALOGUE, KILL_LINES, KILL_CALLOUTS, KillCallout } from '../../content/dialogue';
import { GameState } from './state';
import { playSound, playGlassShatterSound } from '../platform/audio';
import { say, isSpeaking, canSpeak, pickFreshLine, MEATHEAD_VOICE } from '../platform/speech';
import { pickRandom } from './utils';
import { startEnemyDeath, EnemyDeathKind } from '../enemies/deaths';

const MAX_PARTICLES = 2500;

/**
 * Visual/audio side effects bound to the current game state: particles,
 * floating damage numbers, pickups and Meathead's voice lines.
 */
/** Blood and flesh colours (not the fire reds). */
const GORE_COLORS = new Set([...PARTICLE_PALETTES.GORE, ...PARTICLE_PALETTES.FLESH].filter(c => !PARTICLE_PALETTES.FIRE.includes(c)));
export const isGoreColor = (color: string) => GORE_COLORS.has(color);

export const createFx = (state: GameState) => {
  const spawnDamageNumber = (pos: Vector2, value: number | string, isCritical: boolean = false, color?: string) => {
    const isText = typeof value === 'string';
    state.damageNumbers.push({
      id: `dmg-${Date.now()}-${Math.random()}`,
      value: isText ? undefined : Math.floor(value),
      text: isText ? value : undefined,
      pos: { ...pos },
      vel: { x: (Math.random() - 0.5) * 4, y: -4 - Math.random() * 2 },
      life: isText ? 90 : 45,
      maxLife: isText ? 90 : 45,
      isCritical,
      color,
    });
  };

  /** Big "SPLAT!"-style callout over a special kill. */
  const spawnKillCallout = (e: { pos: Vector2, width: number, kind?: string }, kind: KillCallout) => {
    if (e.kind === 'tenant') return;
    const { lines, color } = KILL_CALLOUTS[kind];
    state.damageNumbers.push({
      id: `callout-${Date.now()}-${Math.random()}`,
      text: pickRandom(lines),
      pos: { x: e.pos.x + e.width / 2, y: e.pos.y - 10 },
      vel: { x: (Math.random() - 0.5) * 1.5, y: -3 },
      life: 75,
      maxLife: 75,
      isCritical: true,
      isCallout: true,
      color,
    });
  };

  const spawnExplosion = (pos: Vector2, color: string, count: number, baseVelX: number = 0, spread: number = 15, isGlass: boolean = false, isBossGore: boolean = false) => {
    for (let i = 0; i < count; i++) {
      if (state.particles.length > MAX_PARTICLES) break;
      state.particles.push({
        pos: { ...pos },
        vel: { x: baseVelX + (Math.random() - 0.5) * spread, y: (Math.random() - 0.5) * spread },
        life: isGlass ? 150 + Math.random() * 200 : (isBossGore ? 180 + Math.random() * 120 : 20 + Math.random() * 80),
        color,
        size: i % 3 === 0 ? 1 + Math.random() * 4 : 2 + Math.random() * 12,
        isGlass,
        isBossGore,
      });
    }
  };

  /** A burst of `count` particles drawn from a palette. */
  const spawnBurst = (pos: Vector2, palette: string[], count: number, speed: number, life: [number, number], size: [number, number], liftY = 0) => {
    for (let i = 0; i < count; i++) {
      state.particles.push({
        pos: { ...pos },
        vel: { x: (Math.random() - 0.5) * speed, y: (Math.random() - 0.5) * speed + liftY },
        life: life[0] + Math.random() * life[1],
        color: pickRandom(palette),
        size: size[0] + Math.random() * size[1],
      });
    }
  };

  const spawnSteamExplosionParticles = (pos: Vector2, count: number = 30) =>
    spawnBurst(pos, PARTICLE_PALETTES.STEAM, count, 12, [35, 25], [10, 18], -4);

  const spawnPowderExplosion = (pos: Vector2, count: number = 25) =>
    spawnBurst(pos, PARTICLE_PALETTES.POWDER, count, 8, [40, 40], [4, 12]);

  const spawnMethExplosion = (pos: Vector2, count: number = 40) =>
    spawnBurst(pos, PARTICLE_PALETTES.METH, count, 15, [60, 60], [6, 10]);

  const spawnOilSplatter = (pos: Vector2) =>
    spawnBurst(pos, PARTICLE_PALETTES.OIL, 30, 20, [40, 40], [8, 12]);

  const spawnPoopExplosion = (pos: Vector2, count: number = 20) => {
    for (let i = 0; i < count; i++) {
      const isCorn = Math.random() < 0.35;
      state.particles.push({
        pos: { x: pos.x, y: pos.y },
        vel: { x: (Math.random() - 0.5) * 16, y: (Math.random() - 0.5) * 16 },
        life: 50 + Math.random() * 60,
        color: isCorn ? '#FFEB3B' : pickRandom(PARTICLE_PALETTES.POOP),
        size: i % 3 === 0 ? 4 + Math.random() * 3 : 6 + Math.random() * 8,
      });
    }
  };

  const spawnBoulderShrapnel = (pos: Vector2, count: number, direction: number) => {
    for (let i = 0; i < count; i++) {
      const ang = (Math.random() - 0.5) * Math.PI;
      const speed = 12 + Math.random() * 18;
      state.projectiles.push({
        id: `shrap-${Date.now()}-${i}`,
        pos: { ...pos },
        vel: { x: -direction * Math.cos(ang) * speed, y: Math.sin(ang) * speed - 8 },
        width: 12, height: 12, health: 1, maxHealth: 1, type: 'projectile',
        damage: BOULDER_SHRAPNEL_DAMAGE, owner: 'player', life: 45, isShrapnel: true,
      });
    }
  };

  const spawnRockShatter = (pos: Vector2) => {
    PARTICLE_PALETTES.ROCK.forEach(c => spawnExplosion(pos, c, 8, 0, 20));
  };

  const spawnDeathShower = (pos: Vector2, facing: number = 0, multiplier: number = 1, isBossDeath: boolean = false, spreadOverride?: number) => {
    const spread = spreadOverride !== undefined ? spreadOverride : (isBossDeath ? 45 : 35);
    PARTICLE_PALETTES.FLESH.forEach(c => spawnExplosion(pos, c, Math.ceil(8 * multiplier), facing * 18, spread, false, isBossDeath));
    PARTICLE_PALETTES.GORE.forEach(c => spawnExplosion(pos, c, Math.ceil(12 * multiplier), facing * 22, spread + 10, false, isBossDeath));
    if (!isBossDeath) {
      spawnExplosion(pos, '#FF4500', Math.ceil(10 * multiplier), facing * 12, 40);
      spawnExplosion(pos, '#FFFF00', Math.ceil(5 * multiplier), facing * 8, 30);
    }
  };

  const spawnGlassShatter = (pos: Vector2) => {
    PARTICLE_PALETTES.GLASS.forEach(c => spawnExplosion(pos, c, 5, 0, 25, true));
    playGlassShatterSound();
  };

  /** 60% chance to drop a random health or ammo pickup. */
  const spawnPickup = (pos: Vector2) => {
    // Nothing drops in the weapon test range
    if (state.stageId === WEAPON_RANGE_STAGE || Math.random() >= 0.6) return;
    const r = Math.random();
    let type: PickupType;
    if (r < 0.25) type = 'small_health';
    else if (r < 0.35) type = 'large_health';
    else if (r < 0.8) type = 'small_ammo';
    else type = 'large_ammo';
    state.pickups.push({
      id: `pickup-${Date.now()}-${Math.random()}`, pos: { ...pos }, vel: { x: (Math.random() - 0.5) * 4, y: -5 },
      width: 20, height: 20, type, life: 600,
    });
  };

  const getHurtLines = (hurtSource?: string): string[] => {
    if (hurtSource && BOSS_DIALOGUE.SPECIFIC_HAZARD_HURT[hurtSource]) return BOSS_DIALOGUE.SPECIFIC_HAZARD_HURT[hurtSource];
    if (hurtSource && BOSS_DIALOGUE.HURT[hurtSource]) return BOSS_DIALOGUE.HURT[hurtSource];
    if (state.stageId && BOSS_DIALOGUE.HURT[state.stageId]) return BOSS_DIALOGUE.HURT[state.stageId];
    return VULGARITIES.HURT;
  };

  /**
   * Meathead shouts a line. Death always interrupts; otherwise a new line
   * never talks over one that is still playing, and respects cooldowns.
   */
  const speakVulgarity = (category: VulgarityType, hurtSource?: string) => {
    if (category !== 'death') {
      if (isSpeaking() || state.isMeatheadSpeaking) return; // (asking first lets a line whose end got lost time out)
      if (category === 'hurt' ? state.hurtVoiceCooldown > 0 : state.voiceLineCooldown > 0) return;
    }
    // Skip entirely if every line in the pool was said recently
    const text = pickFreshLine(category === 'hurt' ? getHurtLines(hurtSource) : KILL_LINES[category]);
    if (!text) return;

    // Dying cuts off whoever's talking; anything else only speaks up when it's quiet.
    // The text over his head goes up when he starts saying it and down when he's done.
    const said = say(text, MEATHEAD_VOICE, category === 'death' ? 'urgent' : 'casual', {
      onShow: spoken => {
        state.playerLastVulgarity = text;
        state.playerVulgarityTimer = spoken ? SPOKEN_TEXT_HOLD : VULGARITY_TEXT_DURATION;
      },
      onHide: () => {
        if (state.playerLastVulgarity === text) state.playerVulgarityTimer = Math.min(state.playerVulgarityTimer, SPOKEN_TEXT_LINGER);
      },
      onDone: () => {
        state.isMeatheadSpeaking = false;
        state.voiceLineCooldown = VOICE_LINE_COOLDOWN_FRAMES;
      },
    });
    if (!said) return;
    state.isMeatheadSpeaking = canSpeak() && isSpeaking();
    if (category === 'death') {
      state.voiceLineCooldown = 0;
      state.hurtVoiceCooldown = 0;
    } else if (category === 'hurt') {
      state.voiceLineCooldown = 0;
      state.hurtVoiceCooldown = 45;
    }
  };

  /** A non-boss kill with its own death animation in place of the usual gore burst. */
  const killWithAnimation = (e: Enemy, kind: EnemyDeathKind, category: VulgarityType, callout?: KillCallout, vel?: Vector2) => {
    e.health = 0;
    // (a tenant goes out of his window however he's killed: the stage does all of that)
    if (e.kind === 'tenant') return;
    startEnemyDeath(state, e, kind, vel);
    spawnPickup(e.pos);
    speakVulgarity(category);
    if (callout) spawnKillCallout(e, callout);
    state.player.killSatisfactionTimer = 60;
  };

  /** Standard non-boss kill: fling the body, spray gore, maybe drop loot, taunt. */
  const blowAwayEnemy = (e: Enemy, vel: Vector2, category: VulgarityType, showerDir: number = 0, showerMult: number = 1) => {
    // (a tenant always goes out of his window, however he's killed: the stage does all of that)
    if (e.kind === 'tenant') { e.health = Math.min(e.health, 0); return; }
    e.isBlownAway = true; e.vel = vel;
    spawnDeathShower(e.pos, showerDir, showerMult);
    playSound('splat');
    spawnPickup(e.pos);
    speakVulgarity(category);
  };

  return {
    spawnDamageNumber,
    spawnKillCallout,
    spawnExplosion,
    spawnSteamExplosionParticles,
    spawnPoopExplosion,
    spawnPowderExplosion,
    spawnMethExplosion,
    spawnOilSplatter,
    spawnBoulderShrapnel,
    spawnRockShatter,
    spawnDeathShower,
    spawnGlassShatter,
    spawnPickup,
    speakVulgarity,
    blowAwayEnemy,
    killWithAnimation,
    playGunSound: playSound,
  };
};

export type Fx = ReturnType<typeof createFx>;
