

import React, { useRef, useEffect, useCallback } from 'react';
import { 
  GameStatus, Player, Enemy, Projectile, Particle, Vector2, Pickup, PickupType, WeaponType, DamageNumber, Volcano, SteamExplosion, VulgarityType, TommyBoard 
} from '../types';
import { 
  CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, GRAVITY, 
  PLAYER_SPEED, PLAYER_JUMP_FORCE, CHARGE_SPEED, CHARGE_DURATION, 
  SPECIAL_CHARGE_REGEN_FRAMES, MAX_SPECIAL_CHARGES, INITIAL_PLAYER_HEALTH, JUMP_PREP_FRAMES,
  STAGE_COLORS, UPPERCUT_FORCE, BULLET_DAMAGE, BOULDER_DAMAGE, BOULDER_SPEED, BOULDER_BOUNCE_DAMPING,
  SHOTGUN_DAMAGE, SHOTGUN_COOLDOWN, SHOTGUN_FREEZE_TIME, FLAMETHROWER_DAMAGE, FLAMETHROWER_RANGE, FLAMETHROWER_SPEED_MULT,
  TSUNAMI_COOLDOWN, TSUNAMI_WAVE_SPEED, BOSS_CHARGE_DAMAGE, BOSS_UPPERCUT_DAMAGE, ENEMY_UPPERCUT_DAMAGE, BOSS_DIVEKICK_DAMAGE, ENEMY_DIVEKICK_DAMAGE, DIVEKICK_SPEED_X, DIVEKICK_SPEED_Y, MAX_AMMO, AMMO_PICKUP_PCT,
  HECTOR_PULL_STRENGTH, BOSS_DOOR_X, DOOR_WIDTH, VULGARITIES, BOSS_DIALOGUE, PARTICLE_PALETTES, STAGES_SET_0, STAGES_SET_1,
  DALE_TRUCK_SPEED, METH_BARREL_DAMAGE, TASER_RANGE, TASER_DOT_DAMAGE, TASER_FIRE_THRESHOLD, FIRE_DOT_DAMAGE, FIRE_DOT_DAMAGE_HEAVY,
  FRICTION_DEFAULT, FRICTION_ICE_STAGE, FRICTION_ICE_STOP, DOOR_OPEN_SPEED, VULGARITY_TEXT_DURATION, BOSS_VULGARITY_DURATION,
  VOICE_LINE_COOLDOWN_FRAMES, PLAYER_INVINCIBILITY_FRAMES, PLAYER_STUN_INVINCIBILITY, PLAYER_PUSHBACK_DURATION,
  TOMMY_PUKE_INVINCIBILITY_FRAMES, TOMMY_PUKE_PUSHBACK_DURATION,
  UPPERCUT_AIR_SPEED, UPPERCUT_AIR_ACCEL, FIRE_TICK_RATE, TASER_TICK_RATE, TASER_AMMO_CONSUMPTION_RATE,
  BOULDER_SHRAPNEL_COUNT, HEALTH_PICKUP_SMALL, HEALTH_PICKUP_LARGE,
  BOULDER_SHRAPNEL_DAMAGE, TSUNAMI_DAMAGE_BOSS, TSUNAMI_DAMAGE_WEAKNESS, ENEMY_HIT_COOLDOWN,
  NEEDLE_DOT_TICK_RATE, NEEDLE_DOT_DAMAGE_PER_STACK, NEEDLE_OVERDOSE_THRESHOLD,
  PLAYER_PUSHBACK_VEL_X, PLAYER_PUSHBACK_VEL_Y, PLAYER_STUN_DURATION, ERNIE_STOMP_VIBRATION_DURATION,
  SLUDGE_DAMAGE, SLUDGE_DOT_DAMAGE, SLUDGE_DOT_TICK, SLUDGE_LINGER_DURATION, FILTH_SHIELD_CONTACT_DAMAGE,
  OIL_ROCKET_SPLASH_RADIUS, OIL_ROCKET_SPLASH_DAMAGE, OIL_ROCKET_OILED_DURATION, OIL_ROCKET_OILED_PUSHBACK_MULT, OIL_ROCKET_NUKE_DAMAGE,
  OILED_COLLISION_DAMAGE,
  ENEMY_BULLET_DAMAGE
} from '../constants';
import * as BossLogic from '../boss';
import * as WeaponLogic from '../weapons';
import { drawCustomBossArena } from '../arenaRenderers';
import { getActiveGamepad, isButtonPressed, getGamepadMovement, GP_BUTTONS } from '../gamepad';

interface GameCanvasProps {
  status: GameStatus;
  stageId: string | null;
  onPlayerUpdate: (health: number, specialCharges: number, specialChargeTimer: number, ammo?: Record<WeaponType, number>, forcedWeapon?: WeaponType) => void;
  onBossEncounter: () => void;
  onBossTransition: () => void;
  onBossDefeated: (stageId: string) => void;
  onBossDeath: () => void;
  onBossSelect: () => void;
  onGameOver: (victory: boolean) => void;
  onIntroComplete: () => void;
  onTogglePause: () => void;
  currentWeapon: WeaponType;
  initialAmmo: Record<WeaponType, number>;
  invincibilityEnabled: boolean;
  infiniteAmmoEnabled: boolean;
  infinitePowerEnabled: boolean;
  jumpToBossEnabled: boolean;
  bossTauntText: string;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  status, stageId, onPlayerUpdate, onBossEncounter, onBossTransition, 
  onBossDefeated, onBossDeath, onBossSelect, onGameOver, onIntroComplete, onTogglePause, 
  currentWeapon, initialAmmo, invincibilityEnabled, infiniteAmmoEnabled, infinitePowerEnabled, jumpToBossEnabled,
  bossTauntText
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isMeatheadSpeakingRef = useRef<boolean>(false);
  
  const gameStateRef = useRef({
    player: {
      id: 'player',
      pos: { x: 150, y: 100 },
      vel: { x: 0, y: 0 },
      width: 44,
      height: 64,
      health: INITIAL_PLAYER_HEALTH,
      maxHealth: INITIAL_PLAYER_HEALTH,
      type: 'player',
      isCharging: false,
      isUppercutting: false,
      isDivekicking: false,
      isDucking: false,
      specialCharges: MAX_SPECIAL_CHARGES,
      specialChargeTimer: 0,
      chargeDuration: 0,
      isJumping: false,
      isGrounded: false,
      facing: 1,
      shootCooldown: 0,
      jumpPrepTimer: 0,
      landTimer: 0,
      invincibilityTimer: 0,
      pushbackTimer: 0,
      killSatisfactionTimer: 0,
      bossKillSatisfactionTimer: 0,
      hasUsedAirMove: false,
      jumpInputReleased: true,
      chargeInputReleased: true,
      currentWeapon: 'GUN',
      availableWeapons: ['GUN'],
      weaponAmmo: { ...initialAmmo },
      isTasing: false,
      taserTargetId: null,
      taserTimer: 0,
      flameTimer: 0,
      flameAngle: 0,
      filthShieldTimer: 0,
      barfTimer: 0
    } as Player & { killSatisfactionTimer: number, bossKillSatisfactionTimer: number },
    enemies: [] as Enemy[],
    projectiles: [] as Projectile[],
    pickups: [] as Pickup[],
    particles: [] as (Particle & { isWater?: boolean })[],
    damageNumbers: [] as DamageNumber[],
    blocks: [] as { x: number, y: number, w: number, h: number, type: string }[],
    camera: { x: 0, y: 0 },
    bossSpawned: false,
    arenaLocked: false,
    doorOpenAmount: 0,
    doorState: 'closed' as 'closed' | 'opening' | 'open' | 'closing' | 'done',
    frame: 0,
    playerLastVulgarity: "",
    playerVulgarityTimer: 0,
    bossLastVulgarity: "",
    bossVulgarityTimer: 0,
    voiceLineCooldown: 0,
    hurtVoiceCooldown: 0,
    victoryString: "",
    deathString: "",
    deathTimer: 0,
    postVictoryTimer: 0,
    introTimer: 0,
    bossExplosionTimer: 0,
    bossExplosionPos: { x: 0, y: 0 },
    tsunamiX: -1,
    tsunamiStartX: 0,
    tsunamiActive: false,
    tsunamiDir: 1,
    bossVolcanoes: [] as Volcano[],
    bossVolcanoTelegraphs: [] as Volcano[],
    bossPoopTelegraphs: [] as { pos: Vector2, life: number, spawnX: number }[],
    bossSteamExplosions: [] as SteamExplosion[],
    bossTsunamiSide: 0 as number,
    bossTsunamiTimer: 0,
    victorWallSide: 0 as number, 
    ernieVibrationTimer: 0,
    playerStunTimer: 0,
    screenShakeTimer: 0,
    shouldSyncWeapon: false,
    totalPullForceX: 0,
    tommyBoards: [] as TommyBoard[],
    tommySludgeY: 510,
    tommySludgeOiledTimer: 0,
    tommyScrollY: 0,
    stageId: stageId
  });

  const keys = useRef<{ [key: string]: boolean }>({});
  const mouse = useRef({ down: false });
  const lastPadStartRef = useRef(false);

  useEffect(() => {
    gameStateRef.current.player.currentWeapon = currentWeapon;
  }, [currentWeapon]);

  useEffect(() => {
    gameStateRef.current.stageId = stageId;
  }, [stageId]);

  useEffect(() => {
    if (gameStateRef.current.deathTimer <= 0) {
      gameStateRef.current.player.weaponAmmo = { ...initialAmmo };
    }
  }, [initialAmmo]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const c = e.code.toLowerCase();
      keys.current[k] = true;
      keys.current[c] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const c = e.code.toLowerCase();
      keys.current[k] = false;
      keys.current[c] = false;
    };
    const handleMouseDown = () => mouse.current.down = true;
    const handleMouseUp = () => mouse.current.down = false;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, []);

  const spawnDamageNumber = useCallback((pos: Vector2, value: number | string, isCritical: boolean = false, color?: string) => {
    const state = gameStateRef.current;
    state.damageNumbers.push({
      id: `dmg-${Date.now()}-${Math.random()}`,
      value: typeof value === 'number' ? Math.floor(value) : undefined,
      text: typeof value === 'string' ? value : undefined,
      pos: { ...pos },
      vel: { x: (Math.random() - 0.5) * 4, y: -4 - Math.random() * 2 },
      life: typeof value === 'string' ? 90 : 45,
      maxLife: typeof value === 'string' ? 90 : 45,
      isCritical,
      color
    });
  }, []);

  const spawnExplosion = useCallback((pos: Vector2, color: string, count: number, baseVelX: number = 0, spread: number = 15, isGlass: boolean = false, isBossGore: boolean = false) => {
    const state = gameStateRef.current;
    for (let i = 0; i < count; i++) {
      if (state.particles.length > 2500) break; 
      state.particles.push({
        pos: { ...pos },
        vel: { x: baseVelX + (Math.random() - 0.5) * spread, y: (Math.random() - 0.5) * spread },
        life: isGlass ? 150 + Math.random() * 200 : (isBossGore ? 180 + Math.random() * 120 : 20 + Math.random() * 80),
        color: color,
        size: i % 3 === 0 ? 1 + Math.random() * 4 : 2 + Math.random() * 12,
        isGlass,
        isBossGore
      });
    }
  }, []);

  const spawnSteamExplosionParticles = useCallback((pos: Vector2, count: number = 30) => {
    const state = gameStateRef.current;
    for (let i = 0; i < count; i++) {
      state.particles.push({
        pos: { ...pos },
        vel: { x: (Math.random() - 0.5) * 12, y: (Math.random() - 0.5) * 12 - 4 },
        life: 35 + Math.random() * 25,
        color: PARTICLE_PALETTES.STEAM[Math.floor(PARTICLE_PALETTES.STEAM.length * Math.random())],
        size: 10 + Math.random() * 18
      });
    }
  }, []);

  const spawnPoopExplosion = useCallback((pos: Vector2, count: number = 20) => {
    const state = gameStateRef.current;
    for (let i = 0; i < count; i++) {
      const isCorn = Math.random() < 0.35;
      const color = isCorn ? '#FFEB3B' : PARTICLE_PALETTES.POOP[Math.floor(PARTICLE_PALETTES.POOP.length * Math.random())];
      state.particles.push({
        pos: { x: pos.x, y: pos.y },
        vel: { x: (Math.random() - 0.5) * 16, y: (Math.random() - 0.5) * 16 },
        life: 50 + Math.random() * 60,
        color: color,
        size: i % 3 === 0 ? 4 + Math.random() * 3 : 6 + Math.random() * 8
      });
    }
  }, []);

  const spawnPowderExplosion = useCallback((pos: Vector2, count: number = 25) => {
    const state = gameStateRef.current;
    for (let i = 0; i < count; i++) {
        state.particles.push({
            pos: { ...pos },
            vel: { x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 8 },
            life: 40 + Math.random() * 40,
            color: PARTICLE_PALETTES.POWDER[Math.floor(PARTICLE_PALETTES.POWDER.length * Math.random())],
            size: 4 + Math.random() * 12
        });
    }
  }, []);

  const spawnMethExplosion = useCallback((pos: Vector2, count: number = 40) => {
    const state = gameStateRef.current;
    for (let i = 0; i < count; i++) {
        state.particles.push({
            pos: { ...pos },
            vel: { x: (Math.random() - 0.5) * 15, y: (Math.random() - 0.5) * 15 },
            life: 60 + Math.random() * 60,
            color: PARTICLE_PALETTES.METH[Math.floor(PARTICLE_PALETTES.METH.length * Math.random())],
            size: 6 + Math.random() * 10
        });
    }
  }, []);

  const spawnBoulderShrapnel = (pos: Vector2, count: number, direction: number) => {
    const state = gameStateRef.current;
    for (let i = 0; i < count; i++) {
      const ang = (Math.random() - 0.5) * Math.PI;
      const speed = 12 + Math.random() * 18; 
      state.projectiles.push({
        id: `shrap-${Date.now()}-${i}`,
        pos: { ...pos },
        vel: { x: (direction * -1) * Math.cos(ang) * speed, y: Math.sin(ang) * speed - 8 },
        width: 12, height: 12, health: 1, maxHealth: 1, type: 'projectile',
        damage: BOULDER_SHRAPNEL_DAMAGE, owner: 'player', life: 45, isShrapnel: true
      });
    }
  };

  const spawnRockShatter = (pos: Vector2) => {
    PARTICLE_PALETTES.ROCK.forEach(c => spawnExplosion(pos, c, 8, 0, 20));
  };

  const spawnDeathShower = useCallback((pos: Vector2, facing: number = 0, multiplier: number = 1, isBossDeath: boolean = false, spreadOverride?: number) => {
    const spread = spreadOverride !== undefined ? spreadOverride : (isBossDeath ? 45 : 35);
    PARTICLE_PALETTES.FLESH.forEach(c => spawnExplosion(pos, c, Math.ceil(8 * multiplier), facing * 18, spread, false, isBossDeath));
    PARTICLE_PALETTES.GORE.forEach(c => spawnExplosion(pos, c, Math.ceil(12 * multiplier), facing * 22, spread + 10, false, isBossDeath));
    if (!isBossDeath) {
      spawnExplosion(pos, '#FF4500', Math.ceil(10 * multiplier), facing * 12, 40);
      spawnExplosion(pos, '#FFFF00', Math.ceil(5 * multiplier), facing * 8, 30);
    }
  }, [spawnExplosion]);

  const playGlassShatterSound = useCallback(() => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      for(let i=0; i<12; i++) {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = i % 2 === 0 ? 'sine' : 'sawtooth';
        osc.frequency.setValueAtTime(1200 + Math.random() * 5000, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {}
  }, []);

  const spawnGlassShatter = useCallback((pos: Vector2) => {
    PARTICLE_PALETTES.GLASS.forEach(c => spawnExplosion(pos, c, 5, 0, 25, true));
    playGlassShatterSound();
  }, [spawnExplosion, playGlassShatterSound]);

  const speakVulgarity = useCallback((category: VulgarityType, hurtSource?: string) => {
    const state = gameStateRef.current;
    if (!('speechSynthesis' in window)) return;
    if (category === 'death') { 
      window.speechSynthesis.cancel(); 
      isMeatheadSpeakingRef.current = false;
      state.voiceLineCooldown = 0; 
      state.hurtVoiceCooldown = 0;
    } else { 
      // If meathead is currently speaking, do not allow any new line to step on him!
      // If he gets hurt while speaking, the voice line will not fire, allowing him to finish his line.
      if (isMeatheadSpeakingRef.current || window.speechSynthesis.speaking) return; 
      if (category === 'hurt') {
        if (state.hurtVoiceCooldown > 0) return;
        state.voiceLineCooldown = 0;
        state.hurtVoiceCooldown = 45;
      } else { 
        if (state.voiceLineCooldown > 0) return; 
      }
    }
    let pool = VULGARITIES.GUN_KILL;
    if (category === 'hurt') {
      if (hurtSource && (BOSS_DIALOGUE.SPECIFIC_HAZARD_HURT as any)?.[hurtSource]) {
        pool = (BOSS_DIALOGUE.SPECIFIC_HAZARD_HURT as any)[hurtSource];
      } else if (hurtSource && BOSS_DIALOGUE.HURT[hurtSource as keyof typeof BOSS_DIALOGUE.HURT]) {
        pool = BOSS_DIALOGUE.HURT[hurtSource as keyof typeof BOSS_DIALOGUE.HURT];
      } else if (stageId && BOSS_DIALOGUE.HURT[stageId as keyof typeof BOSS_DIALOGUE.HURT]) {
        pool = BOSS_DIALOGUE.HURT[stageId as keyof typeof BOSS_DIALOGUE.HURT];
      } else {
        pool = VULGARITIES.HURT;
      }
    }
    if (category === 'death') pool = VULGARITIES.DEATH;
    if (category === 'charge_kill') pool = VULGARITIES.CHARGE_KILL;
    if (category === 'uppercut_kill') pool = VULGARITIES.UPPERCUT_KILL;
    if (category === 'boulder_kill') pool = VULGARITIES.BOULDER_KILL;
    if (category === 'shotgun_kill') pool = VULGARITIES.SHOTGUN_KILL;
    if (category === 'flamethrower_kill') pool = VULGARITIES.FLAMETHROWER_KILL;
    if (category === 'tsunami_kill') pool = VULGARITIES.TSUNAMI_KILL;
    if (category === 'dart_kill') pool = VULGARITIES.DART_KILL;
    if (category === 'taser_kill') pool = VULGARITIES.TASER_KILL;
    if (category === 'sludge_kill') pool = VULGARITIES.SLUDGE_KILL;
    const text = pool[Math.floor(Math.random() * pool.length)];
    state.playerLastVulgarity = text; state.playerVulgarityTimer = VULGARITY_TEXT_DURATION;
    const utterance = new SpeechSynthesisUtterance(text); utterance.pitch = 0.1; utterance.rate = 1.2; utterance.volume = 1.0;
    isMeatheadSpeakingRef.current = true;
    utterance.onstart = () => { isMeatheadSpeakingRef.current = true; };
    utterance.onend = () => { 
      isMeatheadSpeakingRef.current = false; 
      state.voiceLineCooldown = VOICE_LINE_COOLDOWN_FRAMES; 
    };
    utterance.onerror = () => { 
      isMeatheadSpeakingRef.current = false; 
      state.voiceLineCooldown = VOICE_LINE_COOLDOWN_FRAMES; 
    };
    window.speechSynthesis.speak(utterance);
  }, [stageId]);

  const playGunSound = useCallback((type: 'gun' | 'ice' | 'flame' | 'tsunami' | 'dart' | 'horn' | 'ignite' | 'barf' | 'oil' | 'taser' = 'gun') => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      if (type === 'gun') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      } else if (type === 'ice') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      } else if (type === 'flame') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(40 + Math.random() * 40, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.03, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      } else if (type === 'barf') {
        osc.type = 'sawtooth'; 
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.1, ctx.currentTime); 
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      } else if (type === 'dart') {
        osc.type = 'square'; osc.frequency.setValueAtTime(2200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.04, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      } else if (type === 'ignite') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(50, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(350, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      } else if (type === 'oil') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      } else if (type === 'taser') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(440 + Math.random() * 200, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.04, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      } else if (type === 'horn') {
          osc.type = 'sawtooth'; osc.frequency.setValueAtTime(220, ctx.currentTime);
          const osc2 = ctx.createOscillator(); osc2.type = 'sawtooth'; osc2.frequency.setValueAtTime(277, ctx.currentTime);
          gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
          osc.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
          osc.start(); osc2.start(); osc.stop(ctx.currentTime + 0.8); osc2.stop(ctx.currentTime + 0.8);
          return;
      } else if (type === 'tsunami') {
          const bufferSize = ctx.sampleRate * 0.5; 
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass'; filter.frequency.setValueAtTime(1000, ctx.currentTime); filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
          noise.connect(filter); filter.connect(ctx.destination);
          noise.start();
          return;
      } else if (type === 'oil') {
          osc.type = 'sawtooth'; osc.frequency.setValueAtTime(60, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.2);
          gain.gain.setValueAtTime(0.12, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      }
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  }, []);

  const spawnPickup = (pos: Vector2) => {
    const r = Math.random();
    if (r < 0.6) {
        const pr = Math.random();
        let type: PickupType;
        if (pr < 0.25) type = 'small_health';
        else if (pr < 0.35) type = 'large_health';
        else if (pr < 0.8) type = 'small_ammo';
        else type = 'large_ammo';
        gameStateRef.current.pickups.push({ id: `pickup-${Date.now()}-${Math.random()}`, pos: { ...pos }, vel: { x: (Math.random() - 0.5) * 4, y: -5 }, width: 20, height: 20, type, life: 600 });
    }
  };

  const spawnOilExplosion = useCallback((pos: Vector2, rocketVelX?: number) => {
    const state = gameStateRef.current;
    for (let i = 0; i < 30; i++) {
        state.particles.push({
            pos: { ...pos },
            vel: { x: (Math.random() - 0.5) * 20, y: (Math.random() - 0.5) * 20 },
            life: 40 + Math.random() * 40,
            color: PARTICLE_PALETTES.OIL[Math.floor(PARTICLE_PALETTES.OIL.length * Math.random())],
            size: 8 + Math.random() * 12
        });
    }
    state.enemies.forEach(e => {
        if (e.health > 0 && !e.isBlownAway) {
            const dx = (e.pos.x + e.width/2) - pos.x;
            const dy = (e.pos.y + e.height/2) - pos.y;
            const distSq = dx*dx + dy*dy;
            if (distSq < OIL_ROCKET_SPLASH_RADIUS * OIL_ROCKET_SPLASH_RADIUS) {
                if (e.type === 'boss') {
                  if (e.hitCooldown && e.hitCooldown > 0) return;
                  const isW = BossLogic.checkIsWeakness(stageId, currentWeapon, { isOilRocket: true });
                  const dmg = BossLogic.getBossDamage(e, stageId, currentWeapon, { isOilRocket: true });
                  e.health -= dmg;
                  e.hitCooldown = ENEMY_HIT_COOLDOWN;
                  e.isOiled = true;
                  e.oiledTimer = OIL_ROCKET_OILED_DURATION;
                  spawnDamageNumber(e.pos, dmg, isW);

                  const tempHelpers: any = { 
                    spawnDamageNumber, spawnDeathShower, onBossDeath, speakVulgarity, playGunSound, spawnExplosion, spawnPoopExplosion, spawnPowderExplosion, spawnMethExplosion, spawnGlassShatter,
                    setBossVulgarity: (t: string, d: number) => { state.bossLastVulgarity = t; state.bossVulgarityTimer = d; },
                    setScreenShake: (d: number) => { state.screenShakeTimer = d; },
                    setErnieVibration: (d: number) => { state.ernieVibrationTimer = d; },
                    setPlayerStun: (d: number) => { state.playerStunTimer = d; },
                    addProjectile: (p: any) => state.projectiles.push(p)
                  };

                  if (stageId === 'Toxic Tommy' && isW && e.health > 0) {
                    e.bossState = 'weakness_stunned';
                    e.stateTimer = 75;
                    e.pukeSweepProgress = 0;
                    if (e.pos.y >= state.tommySludgeY - 30) {
                      e.pos.y = 480 - e.height + 5;
                      e.vel.y = -8;
                    }
                    state.tommySludgeOiledTimer = 240;
                    spawnExplosion({ x: e.pos.x + e.width / 2, y: Math.min(e.pos.y + 20, state.tommySludgeY) }, '#111111', 25, 0, 10);
                    BossLogic.speakAsBoss('Toxic Tommy', "BLAARGH! CRUDE OIL?! I CAN'T CHUNDER!", tempHelpers);
                  }

                  if (e.health <= 0) {
                    BossLogic.triggerBossDeath(e, 0, isW, stageId, currentWeapon, state, tempHelpers);
                  }
                } else {
                  e.health -= OIL_ROCKET_SPLASH_DAMAGE;
                  e.isOiled = true;
                  e.oiledTimer = OIL_ROCKET_OILED_DURATION;
                  spawnDamageNumber(e.pos, OIL_ROCKET_SPLASH_DAMAGE);

                  const pushDir = (rocketVelX !== undefined && Math.abs(rocketVelX) > 0.1)
                    ? Math.sign(rocketVelX)
                    : (dx >= 0 ? 1 : -1);
                  const isAirEnemy = e.enemyType === 'flyer' || e.enemyType === 'drone' || e.behavior === 'fly' || e.behavior === 'hover';

                  if (e.health <= 0) {
                    e.isBlownAway = true; 
                    e.vel = { x: pushDir * 24 + (Math.random() - 0.5) * 6, y: -18 }; 
                    spawnDeathShower(e.pos, pushDir); 
                    spawnPickup(e.pos); 
                    speakVulgarity('oil_kill'); 
                  } else {
                    if (isAirEnemy) {
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
                  }
                }
            }
        }
    });
    playGunSound('oil');
    state.screenShakeTimer = 8;
  }, [stageId, currentWeapon, playGunSound, speakVulgarity, spawnDamageNumber, spawnDeathShower, onBossDeath, spawnExplosion, spawnPoopExplosion, spawnPowderExplosion, spawnMethExplosion, spawnGlassShatter, spawnPickup]);

  const spawnNuke = useCallback((pos: Vector2) => {
    const state = gameStateRef.current;
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
        if (e.health > 0 && !e.isBlownAway) {
            const dx = (e.pos.x + e.width/2) - pos.x;
            const dy = (e.pos.y + e.height/2) - pos.y;
            const distSq = dx*dx + dy*dy;
            if (distSq < 250 * 250) {
                e.health -= OIL_ROCKET_NUKE_DAMAGE;
                spawnDamageNumber(e.pos, OIL_ROCKET_NUKE_DAMAGE, true, '#FF0000');
                if (e.health <= 0) {
                    if (e.type === 'boss') {
                      const tempHelpers: any = { 
                        spawnDamageNumber, spawnDeathShower, onBossDeath, speakVulgarity, playGunSound, spawnExplosion, spawnPoopExplosion, spawnPowderExplosion, spawnMethExplosion, spawnGlassShatter,
                        setBossVulgarity: (t: string, d: number) => { state.bossLastVulgarity = t; state.bossVulgarityTimer = d; },
                        setScreenShake: (d: number) => { state.screenShakeTimer = d; },
                        setErnieVibration: (d: number) => { state.ernieVibrationTimer = d; },
                        setPlayerStun: (d: number) => { state.playerStunTimer = d; },
                        addProjectile: (p: any) => state.projectiles.push(p)
                      };
                      BossLogic.triggerBossDeath(e, 0, true, stageId, currentWeapon, state, tempHelpers);
                    } else { 
                      e.isBlownAway = true; e.vel = { x: (Math.random()-0.5)*40, y: -25 }; 
                      spawnDeathShower(e.pos, 0, 3); spawnPickup(e.pos); speakVulgarity('oil_kill'); 
                    }
                }
            }
        }
    });
    playGunSound('tsunami');
    state.screenShakeTimer = 24;
  }, [stageId, currentWeapon, playGunSound, speakVulgarity, spawnDamageNumber, spawnDeathShower, onBossDeath, spawnExplosion, spawnPoopExplosion, spawnPowderExplosion, spawnMethExplosion, spawnGlassShatter, spawnPickup]);
  const createLevel = useCallback(() => {
    const state = gameStateRef.current;
    const stageWidth = 8000; const doorX = BOSS_DOOR_X;
    state.arenaLocked = false; state.doorState = 'closed'; state.doorOpenAmount = 0; state.bossVolcanoes = []; state.bossVolcanoTelegraphs = []; state.bossPoopTelegraphs = []; state.bossSteamExplosions = []; state.victorWallSide = 0; state.ernieVibrationTimer = 0; state.screenShakeTimer = 0; state.playerStunTimer = 0; state.tsunamiActive = false;
    state.tommyBoards = [];
    state.tommySludgeY = 510;
    state.tommySludgeOiledTimer = 0;
    state.tommyScrollY = 0;
    const addPickupOnPlatform = (block: { x: number, y: number, w: number, h: number }) => {
        const type: PickupType = Math.random() > 0.5 ? 'small_health' : 'small_ammo';
        state.pickups.push({ id: `static-pickup-${Date.now()}-${Math.random()}`, pos: { x: block.x + block.w / 2 - 10, y: block.y - 25 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 20000 });
    };

    const groundBlock = stageId === 'Toxic Tommy' 
      ? { x: 0, y: 550, w: doorX, h: 50, type: 'ground' }
      : { x: 0, y: 550, w: stageWidth, h: 50, type: 'ground' };

    state.blocks = [
      { x: -100, y: -1000, w: 100, h: 2000, type: 'wall' }, 
      { x: stageWidth, y: -1000, w: 100, h: 2000, type: 'wall' }, 
      { x: 0, y: -200, w: stageWidth, h: 200, type: 'wall' }, 
      groundBlock, 
      { x: doorX, y: 400, w: DOOR_WIDTH, h: 150, type: 'door' }, 
      { x: doorX, y: -1000, w: DOOR_WIDTH, h: 1400, type: 'wall' }, 
      { x: 7960, y: 100, w: 40, h: 500, type: 'wall' }
    ];

    // Only add arena ceiling if NOT Toxic Tommy (Toxic Tommy has no ceiling!)
    if (stageId !== 'Toxic Tommy') {
      state.blocks.push({ x: doorX, y: 0, w: stageWidth - doorX, h: 100, type: 'wall' });
    } else {
      // Safe entrance catwalk directly outside the boss door
      state.blocks.push({ x: doorX, y: 480, w: 90, h: 70, type: 'ground' });

      // 8 floating boards across the toxic sludge arena
      const boardCount = 8;
      const arenaStartX = doorX + 105; // 7305
      const arenaEndX = 7935;
      const spacing = (arenaEndX - arenaStartX - 68) / (boardCount - 1);
      for (let i = 0; i < boardCount; i++) {
        state.tommyBoards.push({
          index: i,
          x: arenaStartX + i * spacing,
          baseY: 480,
          y: 480,
          w: 68,
          h: 18,
          status: 'active',
          shatterTimer: 0,
          riseProgress: 1,
          shakeX: 0,
          telegraphTimer: 0
        });
      }
    }

    if (stageId === 'Artie Avalanche') { 
      for (let i = 500; i < doorX - 600; i += 700) { 
        const p1 = { x: i, y: 450, w: 150, h: 20, type: 'platform' }; 
        const p2 = { x: i + 200, y: 320, w: 150, h: 20, type: 'platform' }; 
        const p3 = { x: i + 400, y: 190, w: 150, h: 20, type: 'platform' }; 
        if (p1.x + p1.w <= doorX) state.blocks.push(p1); 
        if (p2.x + p2.w <= doorX) { state.blocks.push(p2); if (Math.random() > 0.4) addPickupOnPlatform(p2); }
        if (p3.x + p3.w <= doorX) { state.blocks.push(p3); if (Math.random() > 0.6) addPickupOnPlatform(p3); }
      } 
    } 
    else if (stageId === 'Victor Volcano') { 
      for (let i = 400; i < doorX - 600; i += 800) { 
        const p1 = { x: i, y: 380, w: 300, h: 20, type: 'platform' }; 
        const p2 = { x: i + 400, y: 250, w: 200, h: 20, type: 'platform' }; 
        if (p1.x + p1.w <= doorX) { state.blocks.push(p1); if (Math.random() > 0.3) addPickupOnPlatform(p1); }
        if (p2.x + p2.w <= doorX) { state.blocks.push(p2); if (Math.random() > 0.3) addPickupOnPlatform(p2); }
      } 
      for (let x = 1200; x < doorX - 500; x += 1800) state.blocks.push({ x: x, y: 550, w: 400, h: 1000, type: 'pit' }); 
    } 
    else if (stageId === 'Toxic Tommy') { 
      for (let i = 600; i < doorX - 300; i += 600) { 
        const p = { x: i, y: 350, w: 100, h: 20, type: 'platform' }; 
        if (p.x + p.w <= doorX) state.blocks.push(p); 
      } 
    }
    else { 
      for (let i = 600; i < doorX - 300; i += 600) { 
        const p = { x: i, y: 400 - (Math.random()*200), w: 200, h: 25, type: 'platform' }; 
        if (p.x + p.w <= doorX) { state.blocks.push(p); if (Math.random() > 0.4) addPickupOnPlatform(p); }
      } 
    }
    // Absolute safeguard: completely strip any platform blocks inside any boss arena (at or past doorX)
    if (stageId !== 'Toxic Tommy') {
      state.blocks = state.blocks.filter(b => b.type !== 'platform' || (b.x + b.w <= doorX));
    }
    state.enemies = [];
    if (!jumpToBossEnabled) {
      for (let i = 1200; i < doorX - 300; i += 1000) {
        state.enemies.push({ id: `shield-${i}`, pos: { x: i, y: 480 }, vel: { x: 0, y: 0 }, width: 50, height: 70, health: 120, maxHealth: 120, type: 'enemy', enemyType: 'shield', behavior: 'shoot', patrolRange: 0, initialX: i, shootTimer: 0, isShieldActive: true });
        state.enemies.push({ id: `flyer-${i}`, pos: { x: i + 400, y: 150 }, vel: { x: 2, y: 0 }, width: 40, height: 30, health: 60, maxHealth: 60, type: 'enemy', enemyType: 'flyer', behavior: 'fly', patrolRange: 300, initialX: i + 400, shootTimer: 0 });
        state.enemies.push({ id: `heavy-flyer-${i}`, pos: { x: i + 600, y: 100 }, vel: { x: 0, y: 0 }, width: 80, height: 65, health: 300, maxHealth: 300, type: 'enemy', enemyType: 'flyer', behavior: 'shoot', patrolRange: 0, initialX: i + 600, shootTimer: 0 });
        state.enemies.push({ id: `tank-${i}`, pos: { x: i + 600, y: 490 }, vel: { x: 0, y: 0 }, width: 60, height: 60, health: 200, maxHealth: 200, type: 'enemy', enemyType: 'tank', behavior: 'shoot', patrolRange: 0, initialX: i + 600, shootTimer: 0 });
        state.enemies.push({ id: `rusher-${i}`, pos: { x: i + 800, y: 480 }, vel: { x: 0, y: 0 }, width: 50, height: 70, health: 300, maxHealth: 300, type: 'enemy', enemyType: 'tank', behavior: 'patrol', patrolRange: 0, initialX: i + 800, shootTimer: 0, pauseTimer: 0 });
      }
    }
    const isSet0 = STAGES_SET_0.some(s => s.id === stageId);
    const isSet1 = STAGES_SET_1.some(s => s.id === stageId);
    if (isSet0 || isSet1) {
      const bossInitX = (stageId === 'Drug Trade Dale' || stageId === 'Blackout Barry' || stageId === 'Toxic Tommy' || stageId === 'Oily Oscar') ? 7840 : 7700;
      const bossInitY = stageId === 'Toxic Tommy' ? 525 : 470;
      const bossInitialState = stageId === 'Toxic Tommy' ? 'submerged_chase' : 'idle';
      state.enemies.push({ 
        id: 'boss', 
        pos: { x: bossInitX, y: bossInitY }, 
        vel: { x: 0, y: 0 }, 
        width: 80, 
        height: 80, 
        health: 666, 
        maxHealth: 666, 
        type: 'boss', 
        enemyType: 'tank', 
        behavior: 'shoot', 
        patrolRange: 0, 
        initialX: bossInitX, 
        shootTimer: 0, 
        bossState: bossInitialState as any, 
        stateTimer: stageId === 'Toxic Tommy' ? 120 : 60, 
        truckX: 0, 
        truckActive: false 
      });
    }
  }, [stageId, jumpToBossEnabled]);

  const respawn = useCallback(() => {
    const state = gameStateRef.current;
    state.player.health = INITIAL_PLAYER_HEALTH; const baseStartX = jumpToBossEnabled ? BOSS_DOOR_X - 800 : 0; state.player.pos = { x: baseStartX + 150, y: 100 }; state.player.vel = { x: 0, y: 0 }; state.player.invincibilityTimer = 0; state.player.facing = 1; state.player.isCharging = false; state.player.isUppercutting = false; state.player.isDivekicking = false; state.player.currentWeapon = 'GUN'; state.player.killSatisfactionTimer = 0; state.player.bossKillSatisfactionTimer = 0; state.player.pushbackTimer = 0; state.shouldSyncWeapon = true; 
    state.player.weaponAmmo = { 'GUN': Infinity, 'BOULDER': MAX_AMMO['BOULDER'], 'SHOTGUN': MAX_AMMO['SHOTGUN'], 'FLAMETHROWER': MAX_AMMO['FLAMETHROWER'], 'TSUNAMI': MAX_AMMO['TSUNAMI'], 'NEEDLES': MAX_AMMO['NEEDLES'], 'TASER': MAX_AMMO['TASER'], 'SLUDGE': MAX_AMMO['SLUDGE'], 'OIL_ROCKET': MAX_AMMO['OIL_ROCKET'] };
    state.deathTimer = 0; state.deathString = ""; state.victoryString = ""; state.postVictoryTimer = 0; state.bossExplosionTimer = 0; state.frame = 1; state.arenaLocked = false; state.tsunamiActive = false; state.doorState = 'closed'; state.doorOpenAmount = 0; state.bossVolcanoes = []; state.bossVolcanoTelegraphs = []; state.bossPoopTelegraphs = []; state.bossSteamExplosions = []; state.bossTsunamiSide = 0; state.victorWallSide = 0; state.ernieVibrationTimer = 0; state.screenShakeTimer = 0; state.playerStunTimer = 0; state.playerLastVulgarity = ""; state.playerVulgarityTimer = 0; state.bossLastVulgarity = ""; state.bossVulgarityTimer = 0; state.particles = []; state.projectiles = []; state.pickups = []; state.damageNumbers = []; 
    state.tommyBoards = []; state.tommyScrollY = 0;
    createLevel();
  }, [createLevel, jumpToBossEnabled]);

  const update = useCallback(() => {
    const state = gameStateRef.current;
    const { player, enemies, projectiles, blocks, pickups, damageNumbers, particles } = state;
    state.frame++;
    if (state.screenShakeTimer > 0) state.screenShakeTimer--;
    if (state.deathTimer > 0) { state.deathTimer--; if (state.deathTimer === 0) respawn(); state.particles = state.particles.filter(p => { if (!p.isStuck) { p.pos.x += p.vel.x; p.pos.y += p.vel.y; p.life--; } return p.life > 0; }); return; }
    if (state.bossExplosionTimer > 0) { state.bossExplosionTimer--; state.screenShakeTimer = 5; if (state.frame % 3 === 0) { spawnDeathShower(state.bossExplosionPos, (Math.random() - 0.5) * 4, 15.0, true, 180); spawnExplosion(state.bossExplosionPos, PARTICLE_PALETTES.FIRE[Math.floor(Math.random() * PARTICLE_PALETTES.FIRE.length)], 10, (Math.random() - 0.5) * 15, 60); } state.particles = state.particles.filter(p => { if (p.isStuck) return true; p.pos.x += p.vel.x; p.pos.y += p.vel.y; if (p.isBossGore) { p.vel.y += 0.35; for (const b of blocks) if (b.type !== 'pit' && p.pos.x > b.x && p.pos.x < b.x + b.w && p.pos.y > b.y && p.pos.y < b.y + b.h) { p.vel.x = 0; p.vel.y = 0; p.isStuck = true; break; } } if (!p.isStuck) p.life--; return p.life > 0; }); if (state.bossExplosionTimer <= 0) { onBossDeath(); state.victoryString = "V"; state.postVictoryTimer = 0; } return; }
    if (status === GameStatus.PAUSED) return;
    if (status === GameStatus.LEVEL_INTRO) { 
      state.introTimer++; 
      const baseStartX = jumpToBossEnabled ? BOSS_DOOR_X - 800 : 0; 
      state.camera.x = baseStartX; 
      state.player.facing = 1; 
      if (state.introTimer === 30 && !jumpToBossEnabled && stageId && BOSS_DIALOGUE.INTRO_QUOTES[stageId as keyof typeof BOSS_DIALOGUE.INTRO_QUOTES]) { 
        const quote = BOSS_DIALOGUE.INTRO_QUOTES[stageId as keyof typeof BOSS_DIALOGUE.INTRO_QUOTES][0];
        const utterance = new SpeechSynthesisUtterance(quote); 
        utterance.pitch = 0.1; utterance.rate = 1.0; utterance.volume = 1.0; 
        isMeatheadSpeakingRef.current = true;
        utterance.onstart = () => { isMeatheadSpeakingRef.current = true; };
        utterance.onend = () => { isMeatheadSpeakingRef.current = false; };
        utterance.onerror = () => { isMeatheadSpeakingRef.current = false; };
        window.speechSynthesis.speak(utterance); 
        state.playerLastVulgarity = quote; 
        state.playerVulgarityTimer = 180; 
      } 
      if (state.introTimer < 80) { 
        state.player.pos.x = baseStartX - 150; 
      } else { 
        if (state.introTimer === 80) spawnGlassShatter({ x: baseStartX, y: 450 }); 
        const jumpDuration = 60, t = Math.min(1.0, (state.introTimer - 80) / jumpDuration); 
        state.player.pos.x = baseStartX - 100 + (t * 250); 
        const peakHeight = 250, groundY = 486, startY = 400; 
        state.player.pos.y = startY + (groundY - startY) * t - Math.sin(t * Math.PI) * peakHeight; 
        if (state.introTimer >= 80 + jumpDuration) { 
          state.player.pos.y = groundY; 
          state.player.pos.x = baseStartX + 150; 
          state.player.vel = { x: 0, y: 0 }; 
          onIntroComplete(); 
        } 
      } 
      state.particles = state.particles.filter(p => { 
        if (!p.isStuck) { p.pos.x += p.vel.x; p.pos.y += p.vel.y; p.life--; } 
        return p.life > 0; 
      }); 
      return; 
    }
    if (status === GameStatus.BOSS_TRANSITION) { 
      const targetCameraX = BOSS_DOOR_X;
      const targetPlayerX = stageId === 'Toxic Tommy' ? targetCameraX + 45 : targetCameraX + 150;
      const targetPlayerY = stageId === 'Toxic Tommy' ? 480 - 64 : 486;
      const glideSpeed = 4; 
      if (state.doorState === 'opening') { 
        state.doorOpenAmount += DOOR_OPEN_SPEED; 
        if (state.doorOpenAmount >= 150) { state.doorOpenAmount = 150; state.doorState = 'open'; } 
      } else if (state.doorState === 'open') { 
        if (state.camera.x < targetCameraX) state.camera.x = Math.min(targetCameraX, state.camera.x + glideSpeed); 
        if (player.pos.x < targetPlayerX) player.pos.x = Math.min(targetPlayerX, player.pos.x + glideSpeed); 
        if (state.camera.x >= targetCameraX && player.pos.x >= targetPlayerX) state.doorState = 'closing'; 
      } else if (state.doorState === 'closing') { 
        state.doorOpenAmount -= DOOR_OPEN_SPEED; 
        if (state.doorOpenAmount <= 0) { 
          state.doorOpenAmount = 0; 
          state.doorState = 'done'; 
          player.isCharging = false; 
          player.isUppercutting = false; 
          player.isDivekicking = false;
          onBossEncounter(); 
        } 
      } 
      player.pos.y += (targetPlayerY - player.pos.y) * 0.1; 
      player.vel = { x: 0, y: 0 }; 
      player.facing = 1; 
      state.projectiles = []; 
      return; 
    }
    if (status !== GameStatus.PLAYING) { if (status === GameStatus.BOSS_INTRO) state.arenaLocked = false; return; }
    if (player.pos.x >= BOSS_DOOR_X && state.doorState === 'done') state.arenaLocked = true;
    if (state.victoryString) {
      if (player.filthShieldTimer) player.filthShieldTimer = 0;
      if (player.barfTimer) player.barfTimer = 0;
      if (player.flameTimer) player.flameTimer = 0;
      player.isTasing = false;
      player.taserTargetId = null;
      player.taserTimer = 0;
      player.isCharging = false;
      player.isUppercutting = false;
      player.isDivekicking = false;
      state.playerStunTimer = 0;
      player.pushbackTimer = 0;
      state.projectiles = [];
      state.particles = state.particles.filter(p => { if (!p.isStuck) { p.pos.x += p.vel.x; p.pos.y += p.vel.y; p.life--; } return p.life > 0; });
      if (state.victoryString.length < 7) {
        state.postVictoryTimer++;
        if (state.postVictoryTimer >= 30) {
          const fullStr = "VICTORY";
          state.victoryString += fullStr[state.victoryString.length];
          state.postVictoryTimer = 0;
          if (state.victoryString.length === 7) setTimeout(() => onBossDefeated(stageId || ""), 2000);
        }
      }
      return;
    }
    
    const bossHelpers: BossLogic.BossHelpers = {
      spawnDamageNumber, spawnDeathShower, onBossDeath, speakVulgarity, playGunSound, spawnExplosion, spawnSteamExplosionParticles, spawnPoopExplosion, spawnPowderExplosion, spawnMethExplosion, spawnGlassShatter,
      setBossVulgarity: (t, d) => { state.bossLastVulgarity = t; state.bossVulgarityTimer = d; },
      setScreenShake: (d) => { state.screenShakeTimer = d; },
      setErnieVibration: (d) => { state.ernieVibrationTimer = d; },
      setPlayerStun: (d) => { state.playerStunTimer = d; },
      addProjectile: (p) => state.projectiles.push(p),
      addVolcano: (v) => state.bossVolcanoes.push(v),
      clearVolcanoes: () => state.bossVolcanoes = [],
      addVolcanoTelegraph: (v) => state.bossVolcanoTelegraphs.push(v),
      clearVolcanoTelegraphs: () => state.bossVolcanoTelegraphs = [],
      addPoopTelegraph: (t) => state.bossPoopTelegraphs.push(t),
      clearPoopTelegraphs: () => state.bossPoopTelegraphs = [],
      setVictorWallSide: (s) => state.victorWallSide = s,
      setTsunamiActive: (a) => state.tsunamiActive = a
    };

    const weaponHelpers: WeaponLogic.WeaponHelpers = {
      addProjectile: (p) => state.projectiles.push(p),
      addParticle: (p) => state.particles.push(p),
      playGunSound,
      spawnExplosion,
      spawnDamageNumber,
      spawnGlassShatter,
      spawnNuke,
      setScreenShake: (d) => state.screenShakeTimer = d,
      triggerBossDeath: (b, f, w) => BossLogic.triggerBossDeath(b, f, w, stageId, currentWeapon, state, bossHelpers)
    };

    // Sequential Barf Stream sequence
    if (player.barfTimer && player.barfTimer > 0) {
      player.barfTimer--;
      if (player.barfTimer % 2 === 0) { 
         const shootX = player.pos.x + (player.facing === 1 ? player.width : -10);
         const shootY = player.isDucking ? player.pos.y + 45 : player.pos.y + 25;
         state.projectiles.push({ 
           id: `sludge-part-${Date.now()}-${player.barfTimer}`, 
           pos: { x: shootX, y: shootY }, 
           vel: { 
             x: player.facing * (11 + Math.random() * 8), 
             y: -3 - Math.random() * 9 
           }, 
           width: 22 + Math.random() * 15, 
           height: 22 + Math.random() * 15, 
           health: 1, maxHealth: 1, 
           type: 'projectile', damage: SLUDGE_DAMAGE, owner: 'player', isSludge: true, life: 150 
         });
      }
    }

    if (state.tsunamiActive) {
      state.tsunamiX += TSUNAMI_WAVE_SPEED * state.tsunamiDir; const dist = Math.abs(state.tsunamiX - state.tsunamiStartX), totalDist = CANVAS_WIDTH * 1.5, progress = dist / totalDist;
      const tsunamiTopY = Math.pow(Math.min(1.0, dist / (CANVAS_WIDTH * 1.25)), 0.6) * 560, waveHeight = 600 - tsunamiTopY, bendMult = 120, dir = state.tsunamiDir, density = 35;
      for (let i = 0; i <= density; i++) {
        const yPct = i / density, yPos = tsunamiTopY + (yPct * waveHeight), normalizedY = (yPct - 0.5) * 2, xOffset = (normalizedY * normalizedY) * bendMult * dir, px = state.tsunamiX + xOffset, py = yPos;
        state.particles.push({ pos: { x: px + (Math.random() - 0.5) * 40, y: py + (Math.random() - 0.5) * 15 }, vel: { x: (TSUNAMI_WAVE_SPEED * 0.4 + Math.random() * 8) * dir, y: (Math.random() - 0.5) * 4 }, life: 12 + Math.random() * 18, color: PARTICLE_PALETTES.WATER[Math.floor(PARTICLE_PALETTES.WATER.length * Math.random())], size: 8 + Math.random() * 12, isWater: true });
        if (i < 3 && Math.random() > 0.4) state.particles.push({ pos: { x: px, y: py }, vel: { x: (TSUNAMI_WAVE_SPEED * 0.9) * dir, y: (Math.random() - 0.5) * 10 }, life: 20 + Math.random() * 10, color: '#FFFFFF', size: 5 + Math.random() * 5, isWater: true });
      }
      if (stageId === 'Victor Volcano') state.bossVolcanoes = state.bossVolcanoes.filter(v => { if (Math.abs(v.pos.x - state.tsunamiX) < 60) { state.bossSteamExplosions.push({ pos: { ...v.pos }, life: 45, radius: 100 }); spawnSteamExplosionParticles(v.pos, 40); state.screenShakeTimer = 12; return false; } return true; });
      
      projectiles.forEach(p => {
        if (p.isMethBarrel && p.health > 0) {
          if (Math.abs(p.pos.x + p.width / 2 - state.tsunamiX) < 120) {
            p.vel = { x: state.tsunamiDir * 20, y: -10 };
            p.rotation = (p.rotation || 0) + 0.5;
            p.health -= TSUNAMI_DAMAGE_BOSS; 
            spawnDamageNumber(p.pos, TSUNAMI_DAMAGE_BOSS);
          }
        }
      });

      enemies.forEach(e => { if (e.health > 0 && !e.isBlownAway) { const ebY = e.pos.y + e.height; if (Math.abs(e.pos.x + e.width / 2 - state.tsunamiX) < 120 && ebY > tsunamiTopY) { if (e.type === 'boss') { if (state.arenaLocked && (!e.hitCooldown || e.hitCooldown <= 0)) { const isW = BossLogic.checkIsWeakness(stageId, currentWeapon); 
        const dmg = isW ? TSUNAMI_DAMAGE_WEAKNESS : TSUNAMI_DAMAGE_BOSS; e.health -= dmg; e.hitCooldown = ENEMY_HIT_COOLDOWN; spawnDamageNumber(e.pos, dmg, isW); if (e.health <= 0) BossLogic.triggerBossDeath(e, state.tsunamiDir, isW, stageId, currentWeapon, state, bossHelpers); } } else { e.health = 0; e.isBlownAway = true; e.vel = { x: state.tsunamiDir * 20, y: -10 }; spawnDeathShower(e.pos, state.tsunamiDir); spawnPickup(e.pos); speakVulgarity('tsunami_kill'); player.killSatisfactionTimer = 60; } } } });
      if (progress >= 1.0) state.tsunamiActive = false;
    }
    state.bossSteamExplosions = state.bossSteamExplosions.filter(exp => {
      exp.life--;
      const pMidX = player.pos.x + player.width/2, pMidY = player.pos.y + player.height/2, dx = pMidX - exp.pos.x, dy = pMidY - exp.pos.y;
      if (dx*dx + dy*dy < exp.radius * exp.radius && player.invincibilityTimer <= 0 && !invincibilityEnabled) {
        player.health -= 8;
        if (player.health > 0) {
          player.invincibilityTimer = PLAYER_INVINCIBILITY_FRAMES;
          player.pushbackTimer = PLAYER_PUSHBACK_DURATION;
          player.vel.x = dx > 0 ? PLAYER_PUSHBACK_VEL_X : -PLAYER_PUSHBACK_VEL_X;
          player.vel.y = PLAYER_PUSHBACK_VEL_Y;
          speakVulgarity('hurt', 'steam');
        }
      }
      if (state.frame % 3 === 0) spawnSteamExplosionParticles(exp.pos, 6);
      return exp.life > 0;
    });

    const gp = getActiveGamepad();
    let padMoveX = 0, padMoveY = 0, padJump = false, padSpecial = false, padShoot = false;
    
    if (gp) {
      const move = getGamepadMovement(gp, 0.2);
      padMoveX = move.x;
      padMoveY = move.y;
      
      // Jump: A (Button 0) strictly. D-Pad Up is for Aim Up / Uppercut and does NOT jump
      padJump = isButtonPressed(gp, GP_BUTTONS.A); 
      // Shoot: X (Button 2), Y (Button 3), or RT (Button 7) - LB and RB are reserved strictly for weapon swapping
      padShoot = isButtonPressed(gp, GP_BUTTONS.X) || isButtonPressed(gp, GP_BUTTONS.Y) || isButtonPressed(gp, GP_BUTTONS.RT); 
      // Special: B (Button 1) or LT (Button 6) - LB and RB are reserved strictly for weapon swapping
      padSpecial = isButtonPressed(gp, GP_BUTTONS.B) || isButtonPressed(gp, GP_BUTTONS.LT);
    }

    const km = keys.current, isStunned = state.playerStunTimer > 0, hasAmmo = (wpn: WeaponType) => infiniteAmmoEnabled || wpn === 'GUN' || ((player.weaponAmmo && player.weaponAmmo[wpn] !== undefined ? player.weaponAmmo[wpn] : (MAX_AMMO[wpn] || 0)) >= 1);
    const shootRequested = !isStunned && player.pushbackTimer <= 0 && (mouse.current.down || padShoot || km['f'] || km['keyf'] || km['x'] || km['keyx'] || km['k'] || km['keyk']), 
          moveLeft = !isStunned && player.pushbackTimer <= 0 && (km['a'] || km['arrowleft'] || km['keya'] || padMoveX < -0.3), 
          moveRight = !isStunned && player.pushbackTimer <= 0 && (km['d'] || km['arrowright'] || km['keyd'] || padMoveX > 0.3), 
          moveDown = !isStunned && player.pushbackTimer <= 0 && (km['s'] || km['arrowdown'] || km['keys'] || padMoveY > 0.3), 
          moveUp = !isStunned && player.pushbackTimer <= 0 && (km['w'] || km['arrowup'] || km['keyw'] || padMoveY < -0.4),
          jumpRequested = !isStunned && player.pushbackTimer <= 0 && (km[' '] || km['space'] || km['z'] || km['keyz'] || km['j'] || km['keyj'] || padJump), 
          chargeRequested = !isStunned && player.pushbackTimer <= 0 && (km['shift'] || km['shiftleft'] || km['shiftright'] || km['c'] || km['keyc'] || padSpecial);

    if (state.playerStunTimer > 0) state.playerStunTimer--;
    if (state.playerVulgarityTimer > 0) { state.playerVulgarityTimer--; if (state.playerVulgarityTimer <= 0) state.playerLastVulgarity = ""; }
    if (state.bossVulgarityTimer > 0) { state.bossVulgarityTimer--; if (state.bossVulgarityTimer <= 0) state.bossLastVulgarity = ""; }
    if (state.voiceLineCooldown > 0) state.voiceLineCooldown--;
    if (state.hurtVoiceCooldown > 0) state.hurtVoiceCooldown--;
    if (player.invincibilityTimer > 0) player.invincibilityTimer--;
    if (player.hurtTimer && player.hurtTimer > 0) player.hurtTimer--;
    if (player.smugTimer && player.smugTimer > 0) player.smugTimer--;
    if (player.killSatisfactionTimer > 0) player.killSatisfactionTimer--;
    if (player.bossKillSatisfactionTimer > 0) player.bossKillSatisfactionTimer--;
    if (player.pushbackTimer > 0) { 
      player.pushbackTimer--; 
      player.vel.x *= 0.9; 
    } else if ((!player.smugTimer || player.smugTimer <= 0)) {
      player.isHarmlessPushback = false;
    }
    if (player.specialCharges < MAX_SPECIAL_CHARGES) { player.specialChargeTimer++; if (player.specialChargeTimer >= SPECIAL_CHARGE_REGEN_FRAMES) { player.specialCharges++; player.specialChargeTimer = 0; } }
    if (player.filthShieldTimer && player.filthShieldTimer > 0) player.filthShieldTimer--;
    if (!jumpRequested) player.jumpInputReleased = true;
    if (!chargeRequested) player.chargeInputReleased = true;

    if (currentWeapon === 'TASER' && shootRequested && hasAmmo('TASER')) {
      if (!player.isTasing) {
        WeaponLogic.fireWeapon(player, state, weaponHelpers, moveUp, moveDown, infiniteAmmoEnabled);
      }
      if (player.isTasing) {
        player.taserTimer = (player.taserTimer || 0) + 1;
        if (!infiniteAmmoEnabled && state.frame % TASER_AMMO_CONSUMPTION_RATE === 0) player.weaponAmmo['TASER'] -= 1;
        player.vel.x = 0;

        if (player.weaponAmmo['TASER'] <= 0) {
           player.isTasing = false;
           player.taserTargetId = null;
        }

        // Try to re-acquire target if none exists
        if (!player.taserTargetId) {
          let nearest: (Enemy | Projectile) | null = null;
          let minDist = TASER_RANGE;
          const playerMidX = player.pos.x + player.width/2;
          const playerMidY = player.pos.y + player.height/2;

          state.enemies.forEach((e: Enemy) => {
            if (e.health > 0 && !e.isBlownAway) {
              const ex = e.pos.x + e.width/2;
              const ey = e.pos.y + e.height/2;
              if (ex > state.camera.x && ex < state.camera.x + CANVAS_WIDTH) {
                if ((player.facing === 1 && ex > playerMidX) || (player.facing === -1 && ex < playerMidX)) {
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
                if ((player.facing === 1 && px > playerMidX) || (player.facing === -1 && px < playerMidX)) {
                  const dx = px - playerMidX;
                  const dy = py - playerMidY;
                  const dist = Math.sqrt(dx*dx + dy*dy);
                  if (dist < minDist) { minDist = dist; nearest = p; }
                }
              }
            }
          });

          if (nearest) player.taserTargetId = nearest.id;
        }

        const target = (enemies.find(e => e.id === player.taserTargetId) || projectiles.find(p => p.id === player.taserTargetId)) as (Enemy | Projectile | undefined);
        if (target && (target.pos.x + target.width < state.camera.x || target.pos.x > state.camera.x + CANVAS_WIDTH)) {
            player.taserTargetId = null;
        }

        if (target && target.health > 0) {
          const dx = (target.pos.x + target.width/2) - (player.pos.x + player.width/2);
          const dy = (target.pos.y + target.height/2) - (player.pos.y + player.height/2);
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist > TASER_RANGE + 100) {
            player.taserTargetId = null;
          } else {
            if (target.type === 'boss') {
               const b = target as Enemy;
               if (!b.hitCooldown || b.hitCooldown <= 0) {
                  const isTommyShielded = stageId === 'Toxic Tommy' && (
                    b.bossState === 'submerged_chase' ||
                    b.bossState === 'telegraph_emerge' ||
                    b.bossState === 'dive_in_sludge' ||
                    b.pos.y >= state.tommySludgeY - 30
                  );
                  if (isTommyShielded) {
                    spawnExplosion(b.pos, '#27AE60', 4, 0, 3);
                    return;
                  }
                  const dmg = BossLogic.getBossDamage(b, stageId, currentWeapon);
                  const isW = BossLogic.checkIsWeakness(stageId, currentWeapon);
                  b.health -= dmg;
                  b.hitCooldown = ENEMY_HIT_COOLDOWN;
                  spawnDamageNumber(b.pos, dmg, isW);
                  if (b.health <= 0) BossLogic.triggerBossDeath(b, player.facing, isW, stageId, currentWeapon, state, bossHelpers);
               }
            } else {
               target.isTased = true;
               if (state.frame % TASER_TICK_RATE === 0) {
                 target.health -= TASER_DOT_DAMAGE;
                 spawnDamageNumber(target.pos, TASER_DOT_DAMAGE);
                 if (target.health <= 0) {
                    if (target.type === 'enemy') {
                      const e = target as Enemy;
                      e.isBlownAway = true; 
                      e.vel = { x: (Math.random()-0.5)*10, y: -15 }; 
                      spawnDeathShower(e.pos, 0); 
                      spawnPickup(e.pos); 
                      speakVulgarity('taser_kill');
                    }
                    player.taserTargetId = null;
                 }
               }
               if (player.taserTimer! >= TASER_FIRE_THRESHOLD && !target.isOnFire) {
                 target.isOnFire = true;
                 playGunSound('ignite');
               }
            }
          }
        }
      }
    } else {
      player.isTasing = false;
      player.taserTargetId = null;
      player.taserTimer = 0;
    }

    state.totalPullForceX = 0;
    
    projectiles.forEach(p => {
      if (p.health > 0 && p.isOnFire) {
        if (!p.fireTimer) p.fireTimer = 0; p.fireTimer++;
        if (p.fireTimer >= FIRE_TICK_RATE) {
          p.health -= FIRE_DOT_DAMAGE_HEAVY;
          spawnDamageNumber(p.pos, FIRE_DOT_DAMAGE_HEAVY);
          p.fireTimer = 0;
        }
        if (state.frame % 2 === 0) {
          state.particles.push({ pos: { x: p.pos.x + Math.random() * p.width, y: p.pos.y + Math.random() * p.height }, vel: { x: (Math.random()-0.5)*9, y: -Math.random()*15 }, life: 45, color: '#FF4500', size: 10 + Math.random()*12 });
        }
      }
      if (!player.isTasing || player.taserTargetId !== p.id) p.isTased = false;
    });

    enemies.forEach(e => {
      if (e.health > 0 && e.isOnFire) {
         if (!e.fireTimer) e.fireTimer = 0; e.fireTimer++;
         if (e.fireTimer >= FIRE_TICK_RATE) {
            const isBoss = e.type === 'boss';
            const dmg = isBoss ? FIRE_DOT_DAMAGE : FIRE_DOT_DAMAGE_HEAVY;
            e.health -= dmg;
            spawnDamageNumber(e.pos, dmg);
            e.fireTimer = 0;
            if (e.health <= 0) {
               if (isBoss) BossLogic.triggerBossDeath(e, 0, false, stageId, currentWeapon, state, bossHelpers);
               else { e.isBlownAway = true; e.vel = { x: (Math.random()-0.5)*10, y: -15 }; spawnDeathShower(e.pos, 0); spawnPickup(e.pos); speakVulgarity('flamethrower_kill'); }
            }
         }
         if (state.frame % 2 === 0) {
            const vx = (Math.random()-0.5)*9;
            const vy = -Math.random()*15;
            state.particles.push({ pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + Math.random() * e.height }, vel: { x: vx, y: vy }, life: 45, color: '#FF4500', size: 10 + Math.random()*12 });
            if (Math.random() > 0.4) state.particles.push({ pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + Math.random() * e.height }, vel: { x: vx*0.6, y: vy*0.8 }, life: 30, color: '#FFFF00', size: 6 + Math.random()*8 });
         }
      }

      if (e.health > 0 && e.needleCount && e.needleCount > 0) {
        if (!e.dotTimer) e.dotTimer = 0; e.dotTimer++;
        const isBarry = stageId === 'Blackout Barry' && e.type === 'boss';
        if (isBarry) {
          if (e.needleTimer) e.needleTimer--;
          if (e.needleTimer! <= 0) { e.needleCount = 0; e.needleOffsets = []; }
          else if (e.dotTimer >= 60) {
            const dotDmg = e.needleCount * 15; e.health -= dotDmg; spawnDamageNumber(e.pos, dotDmg); e.dotTimer = 0;
            if (e.health <= 0) BossLogic.triggerBossDeath(e, 0, false, stageId, 'NEEDLES', state, bossHelpers);
          }
        } else if (e.dotTimer >= NEEDLE_DOT_TICK_RATE) { 
          const dotDmg = e.needleCount * NEEDLE_DOT_DAMAGE_PER_STACK; e.health -= dotDmg; spawnDamageNumber(e.pos, dotDmg); e.dotTimer = 0; 
          if (e.health <= 0) { if (e.type === 'boss') BossLogic.triggerBossDeath(e, 0, false, stageId, currentWeapon, state, bossHelpers); else { e.isBlownAway = true; e.vel = { x: (Math.random()-0.5)*10, y: -15 }; spawnDeathShower(e.pos, 0); spawnPickup(e.pos); speakVulgarity('dart_kill'); spawnDamageNumber(e.pos, "OVERDOSE!", true, "#FF00FF"); } } 
        }
      }

      if (e.type === 'boss' && e.health > 0 && state.arenaLocked) {
        BossLogic.updateBossAI(e, stageId, player, currentWeapon, invincibilityEnabled, state, bossHelpers);
      }
      if (e.type !== 'boss' && ((e.frozenTimer && e.frozenTimer > 0) || (e.isTased && player.isTasing && player.taserTargetId === e.id))) {
         e.vel.x = 0; e.vel.y = 0;
      } else if (e.type !== 'boss') {
         e.isTased = false; 
      }
    });

    state.bossVolcanoes = state.bossVolcanoes.filter(v => {
      v.life--; if (state.frame % 12 === 0) { const magVelX = v.type === 'wall' ? (v.pos.x < BOSS_DOOR_X + 400 ? 9 : -9) : (Math.random()-0.5)*4, magVelY = v.type === 'ground' ? -9 : (Math.random()-0.5)*7; state.projectiles.push({ id: `magma-${Date.now()}`, pos: { x: v.pos.x, y: v.pos.y }, vel: { x: magVelX, y: magVelY }, width: 14, height: 14, health: 1, maxHealth: 1, type: 'projectile', damage: 45, owner: 'enemy' }); } return v.life > 0;
    });

    const isFiringFlamethrower = currentWeapon === 'FLAMETHROWER' && shootRequested && hasAmmo('FLAMETHROWER');
    if (!isFiringFlamethrower) player.flameTimer = 0;
    player.isDucking = moveDown && player.isGrounded && !player.isCharging && !player.isUppercutting && !player.isDivekicking && !isFiringFlamethrower && !player.isTasing;
    if (player.jumpPrepTimer > 0) { player.jumpPrepTimer--; if (player.jumpPrepTimer === 0) { player.vel.y = PLAYER_JUMP_FORCE; player.isGrounded = false; } } 
    else {
      if (jumpRequested && player.isGrounded && player.jumpInputReleased && !player.isCharging && !player.isDivekicking && player.pushbackTimer <= 0 && state.playerStunTimer <= 0 && !player.isTasing) { player.jumpPrepTimer = JUMP_PREP_FRAMES; player.jumpInputReleased = false; }
      if (!player.isCharging && !player.isUppercutting && !player.isDivekicking && player.pushbackTimer <= 0 && state.playerStunTimer <= 0 && !player.isTasing) {
        const speedLimit = isFiringFlamethrower ? PLAYER_SPEED * FLAMETHROWER_SPEED_MULT : PLAYER_SPEED;
        if (!player.isDucking) { 
          const accel = (stageId === 'Artie Avalanche' || stageId === 'Blackout Barry') ? 0.55 : 1.5; 
          if (moveLeft) { player.facing = -1; if (player.isGrounded || Math.abs(player.vel.x) <= speedLimit) player.vel.x = Math.max(-speedLimit, player.vel.x - accel); } else if (moveRight) { player.facing = 1; if (player.isGrounded || Math.abs(player.vel.x) <= speedLimit) player.vel.x = Math.min(speedLimit, player.vel.x + accel); } else if (player.isGrounded) { if (stageId === 'Artie Avalanche' || stageId === 'Blackout Barry') { player.vel.x *= FRICTION_ICE_STAGE; if (Math.abs(player.vel.x) < 0.1) player.vel.x = 0; } else player.vel.x = 0; } 
        } else if (player.isGrounded) { 
          if (moveLeft) player.facing = -1; 
          else if (moveRight) player.facing = 1; 
          if (stageId === 'Artie Avalanche' || stageId === 'Blackout Barry') player.vel.x *= FRICTION_ICE_STOP; else player.vel.x = 0; 
        }
        if (!player.isGrounded && Math.abs(player.vel.x) <= speedLimit) player.vel.x *= FRICTION_DEFAULT;
      } else if (player.isCharging) { player.chargeDuration--; player.vel.x = player.facing * CHARGE_SPEED; if (player.chargeDuration <= 0) { player.isCharging = false; if (player.isGrounded) player.vel.x = player.facing * PLAYER_SPEED; } } 
      else if (player.isUppercutting) { player.chargeDuration--; if (moveLeft) player.vel.x = Math.max(-UPPERCUT_AIR_SPEED, player.vel.x - UPPERCUT_AIR_ACCEL); else if (moveRight) player.vel.x = Math.min(UPPERCUT_AIR_SPEED, player.vel.x + UPPERCUT_AIR_ACCEL); else player.vel.x *= 0.95; if (player.chargeDuration <= 0) player.isUppercutting = false; }
      else if (player.isDivekicking) {
        player.vel.x = player.facing * DIVEKICK_SPEED_X;
        player.vel.y = DIVEKICK_SPEED_Y;
        if (state.frame % 2 === 0) {
          state.particles.push({
            pos: { x: player.pos.x + player.width / 2, y: player.pos.y + player.height / 2 },
            vel: { x: -player.facing * (Math.random() * 3 + 2), y: -(Math.random() * 4 + 2) },
            life: 15,
            color: Math.random() > 0.5 ? '#FF4500' : '#FFD700',
            size: 4 + Math.random() * 4
          });
        }
      }
      if (state.totalPullForceX !== 0) player.vel.x += state.totalPullForceX;
      if (chargeRequested && player.chargeInputReleased && !player.isCharging && !player.isUppercutting && !player.isDivekicking && !player.isDucking && (player.specialCharges > 0 || infinitePowerEnabled) && !isFiringFlamethrower && state.playerStunTimer <= 0 && !player.isTasing) { 
        player.chargeInputReleased = false; 
        if (moveUp) { 
          if (!infinitePowerEnabled) player.specialCharges--; 
          player.chargeDuration = CHARGE_DURATION; 
          player.isUppercutting = true; 
          player.vel.y = UPPERCUT_FORCE; 
          player.isGrounded = false; 
          player.vel.x = player.vel.x * 0.5; 
        } else if (moveDown && !player.isGrounded) { 
          // DIVEKICK! (pressing down+charge while in the air - only works in the air)
          if (!infinitePowerEnabled) player.specialCharges--; 
          player.isDivekicking = true; 
          player.vel.x = player.facing * DIVEKICK_SPEED_X; 
          player.vel.y = DIVEKICK_SPEED_Y; 
          playGunSound(); 
        } else { 
          if (!infinitePowerEnabled) player.specialCharges--; 
          player.chargeDuration = CHARGE_DURATION; 
          player.isCharging = true; 
          player.vel.x = player.facing * CHARGE_SPEED; 
        } 
      }
      
      player.currentWeapon = currentWeapon;
      if (shootRequested && player.shootCooldown <= 0 && hasAmmo(currentWeapon) && currentWeapon !== 'TASER') {
        WeaponLogic.fireWeapon(player, state, weaponHelpers, moveUp, moveDown, infiniteAmmoEnabled);
      }
    }
    if (player.shootCooldown > 0) player.shootCooldown--; if (!player.isDivekicking) player.vel.y += GRAVITY; if (!jumpRequested && player.vel.y < 0 && !player.isGrounded && !player.isCharging && !player.isUppercutting && !player.isDivekicking) player.vel.y *= 0.5; if (state.playerStunTimer > 0) player.pos.y += (state.frame % 2 === 0 ? -2 : 2); player.pos.x += player.vel.x; player.pos.y += player.vel.y; if (player.pos.x < 50) player.pos.x = 50; if (state.arenaLocked && stageId !== 'Toxic Tommy' && player.pos.y < 100) { player.pos.y = 100; player.vel.y = 0; }
    player.isGrounded = false;
    blocks.forEach(block => {
      if (block.type === 'door' && (state.doorState === 'opening' || state.doorState === 'open' || state.doorState === 'closing')) return; 
      if (block.type === 'pit' || block.type === 'wall' || block.type === 'ground' || block.type === 'platform' || block.type === 'door') {
          if (player.pos.x < block.x + block.w && player.pos.x + player.width > block.x && player.pos.y < block.y + block.h && player.pos.y + player.height > block.y) {
              if (block.type === 'door' && state.doorState === 'closed') { 
                  const isS1 = STAGES_SET_1.some(s => s.id === stageId); 
                  if (isS1 && stageId !== 'Drug Trade Dale' && stageId !== 'Blackout Barry' && stageId !== 'Toxic Tommy') { onBossDefeated(stageId || ""); return; } 
                  state.doorState = 'opening'; player.vel.x = 0; player.vel.y = 0; state.projectiles = []; 
                  state.enemies.forEach(e => { if (e.type !== 'boss' && e.health > 0) { e.health = 0; spawnDeathShower(e.pos, 0, 1); spawnPickup(e.pos); } }); 
                  onBossTransition(); return; 
              } 
              if (block.type === 'pit') return;
              const overlapX = Math.min(player.pos.x + player.width - block.x, block.x + block.w - player.pos.x), overlapY = Math.min(player.pos.y + player.height - block.y, block.y + block.h - player.pos.y); 
              if (overlapX < overlapY) { player.pos.x = (player.pos.x + player.width / 2 < block.x + block.w / 2) ? block.x - player.width : block.x + block.w; player.vel.x = 0; if (player.isCharging) player.isCharging = false; if (player.isDivekicking) player.isDivekicking = false; } 
              else { 
                if (player.pos.y + player.height / 2 < block.y + block.h / 2) { 
                  player.pos.y = block.y - player.height; 
                  player.isGrounded = true; 
                  player.hasUsedAirMove = false; 
                  player.vel.y = 0; 
                  if (player.isDivekicking) {
                    player.isDivekicking = false;
                    player.vel.x = 0;
                    player.landTimer = 10;
                    for (let i = 0; i < 12; i++) {
                      state.particles.push({
                        pos: { x: player.pos.x + player.width / 2, y: player.pos.y + player.height },
                        vel: { x: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 8 + 4), y: -Math.random() * 3 },
                        life: 20,
                        color: '#B0BEC5',
                        size: 4 + Math.random() * 5
                      });
                    }
                    playGunSound();
                  }
                  const speedLimit = isFiringFlamethrower ? PLAYER_SPEED * FLAMETHROWER_SPEED_MULT : PLAYER_SPEED; 
                  if (Math.abs(player.vel.x) > speedLimit) player.vel.x = Math.sign(player.vel.x) * speedLimit; 
                } else { 
                  player.pos.y = block.y + block.h; 
                  player.vel.y = 0; 
                  if (player.isDivekicking) player.isDivekicking = false;
                } 
              } 
          }
      }
    });

    // Toxic Tommy floating boards physics, board management, and rising toxic sludge
    if (stageId === 'Toxic Tommy' && state.arenaLocked && state.tommyBoards) {
      state.tommyScrollY = (state.tommyScrollY + 2.5) % 400;
      if (state.tommySludgeOiledTimer && state.tommySludgeOiledTimer > 0) {
        state.tommySludgeOiledTimer--;
      }

      let activeCount = 0;
      state.tommyBoards.forEach((b: TommyBoard) => {
        if (b.status === 'shattering') {
          b.shatterTimer--;
          if (b.shatterTimer <= 0) {
            b.status = 'shattered';
          }
        } else if (b.status === 'rising') {
          b.riseProgress += 0.012;
          b.y = b.baseY + (1 - b.riseProgress) * 60;
          if (state.frame % 5 === 0) {
            spawnExplosion({ x: b.x + Math.random() * b.w, y: state.tommySludgeY }, '#27AE60', 2, 0, 3);
          }
          if (b.riseProgress >= 1) {
            b.status = 'active';
            b.y = b.baseY;
            b.riseProgress = 1;
            playGunSound('barf');
            spawnExplosion({ x: b.x + b.w / 2, y: b.y }, '#27AE60', 10, 0, 6);
          }
        }

        if (b.telegraphTimer && b.telegraphTimer > 0) {
          b.telegraphTimer--;
          b.shakeX = (Math.random() - 0.5) * 6;
          if (state.frame % 3 === 0) {
            spawnExplosion({ x: b.x + Math.random() * b.w, y: b.y }, '#ADFF2F', 3, 0, 3);
          }
        } else {
          b.shakeX = 0;
        }

        if (b.status === 'active' || b.status === 'rising') {
          activeCount++;
        }

        // Meathead standing on active board (or rising board when near surface)
        if (b.status === 'active' || (b.status === 'rising' && b.riseProgress > 0.8)) {
          const bobY = b.y + Math.sin(state.frame * 0.05 + b.index * 0.8) * 3;
          if (player.vel.y >= 0 &&
              player.pos.x + player.width > b.x - 4 &&
              player.pos.x < b.x + b.w + 4 &&
              player.pos.y + player.height >= bobY - 4 &&
              player.pos.y + player.height <= bobY + 22) {
            player.pos.y = bobY - player.height;
            player.vel.y = 0;
            player.isGrounded = true;
            player.hasUsedAirMove = false;
            if (player.isDivekicking) {
              player.isDivekicking = false;
              player.vel.x = 0;
              player.landTimer = 10;
              playGunSound();
            }
          }
        }
      });

      // When active boards drop to 5, one shattered board starts rising!
      if (activeCount <= 5) {
        const shattered = state.tommyBoards.filter((b: TommyBoard) => b.status === 'shattered');
        if (shattered.length > 0) {
          const toRise = shattered[0];
          toRise.status = 'rising';
          toRise.riseProgress = 0;
          toRise.y = toRise.baseY + 60;
          spawnExplosion({ x: toRise.x + toRise.w / 2, y: state.tommySludgeY }, '#27AE60', 15, 0, 8);
        }
      }

      // Meathead falling into the rising toxic sludge -> Instant death!
      if (player.pos.y + player.height >= state.tommySludgeY + 8 && player.health > 0) {
        player.health = 0;
        state.deathTimer = 180;
        state.deathString = "DISSOLVED IN TOXIC SLUDGE";
        spawnDeathShower(player.pos, player.facing, 3);
        playGunSound('barf');
        speakVulgarity('death');
      }
    }

    if (state.ernieVibrationTimer > 0) {
      state.ernieVibrationTimer--;
      if (player.isGrounded && !invincibilityEnabled && state.playerStunTimer <= 0) {
        state.playerStunTimer = PLAYER_STUN_DURATION;
      }
    }

    state.enemies = enemies.filter(e => {
      if (e.isBlownAway) { e.pos.x += e.vel.x; e.pos.y += e.vel.y; e.vel.y += GRAVITY * 0.5; e.rotation = (e.rotation || 0) + 0.3; return e.pos.y < 1000; }
      if (e.health <= 0) return false; if (e.hitCooldown && e.hitCooldown > 0) e.hitCooldown--; 
      if (e.enemyCollisionCooldown && e.enemyCollisionCooldown > 0) e.enemyCollisionCooldown--;
      
      // Oiled Logic
        if (e.isOiled) {
          if (!e.oiledTimer) e.oiledTimer = 0;
          e.oiledTimer--;
          if (e.oiledTimer <= 0) {
            e.isOiled = false;
          }
          if (state.frame % 2 === 0) {
             state.particles.push({ 
               pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + e.height }, 
               vel: { x: (Math.random()-0.5)*1, y: 0.5 + Math.random()*1.5 }, 
               life: 30, color: '#000000', size: 3 + Math.random()*5 
             });
          }
          if (state.frame % 5 === 0) {
             state.particles.push({ 
               pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + Math.random() * e.height }, 
               vel: { x: 0, y: 0 }, 
               life: 10, color: '#3E2723', size: 6 + Math.random()*4 
             });
          }
          if (Math.abs(e.vel.x) > 1.2 && state.frame % 2 === 0) {
             state.particles.push({ 
               pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + e.height - 2 }, 
               vel: { x: -Math.sign(e.vel.x) * (Math.random() * 2 + 1), y: -Math.random() * 1.5 }, 
               life: 18, color: '#1A110F', size: 4 + Math.random() * 4 
             });
          }
        }

      if ((e.frozenTimer && e.frozenTimer > 0) || (e.isTased && player.isTasing && player.taserTargetId === e.id)) { if (e.frozenTimer) e.frozenTimer--; } else { e.isTased = false; }
      const onScreen = e.pos.x + e.width > state.camera.x && e.pos.x < state.camera.x + CANVAS_WIDTH, isStunned = (e.pauseTimer || 0) > 0;
      const isAirEnemy = e.enemyType === 'flyer' || e.enemyType === 'drone' || e.behavior === 'fly' || e.behavior === 'hover';
      if (isAirEnemy) {
        if (e.initialY === undefined) e.initialY = e.pos.y;
        if (!((e.frozenTimer && e.frozenTimer > 0) || e.isTased)) {
          if (isStunned) {
            e.pauseTimer!--;
            e.pos.x += e.vel.x;
            e.vel.x *= 0.92;
            e.pos.y += e.vel.y;
            e.vel.y *= 0.92;
          } else {
            if (e.sludgeTimer && e.sludgeTimer > 0) {
              e.pos.y += 3.5;
              // Limit to ground level (floor is top at 550)
              const floorLevel = 550 - e.height;
              if (e.pos.y > floorLevel) e.pos.y = floorLevel;
            } else {
               // Oscillate
               e.pos.y += Math.sin((state.frame + (e.initialX || 0)) / 25) * 1.2;
               // Recover height
               if (e.pos.y > e.initialY) {
                 e.pos.y -= 0.8;
                 if (e.pos.y < e.initialY) e.pos.y = e.initialY;
               }
            }
          }
        }
      }
      
      if (e.sludgeTimer && e.sludgeTimer > 0) e.sludgeTimer--;
      
      if (e.type !== 'boss') { 
        if (!((e.frozenTimer && e.frozenTimer > 0) || e.isTased)) {
          if (isAirEnemy) {
            if (!isStunned) {
              if (e.behavior === 'patrol' || e.behavior === 'fly') { if (e.pos.x > (e.initialX + e.patrolRange) || e.pos.x < e.initialX) e.vel.x *= -1; } 
              else if (e.behavior === 'shoot' && onScreen) { 
                e.shootTimer++; 
                if (e.shootTimer > 60) { 
                  const spawnY = e.pos.y + e.height - 10; 
                  state.projectiles.push({ id: `ep-${Date.now()}`, pos: { x: e.pos.x + e.width/2, y: spawnY }, vel: { x: player.pos.x < e.pos.x ? -7 : 7, y: 0 }, width: 14, height: 14, health: 1, maxHealth: 1, type: 'projectile', damage: ENEMY_BULLET_DAMAGE, owner: 'enemy' }); 
                  e.shootTimer = 0; 
                } 
              } 
              e.pos.x += e.vel.x; 
            }
          } else {
            // Grounded enemy physics & movement
            const floorLevel = 550 - e.height;
            const inAir = e.pos.y < floorLevel - 1;

            if (inAir) {
              // Enemy launched into the air by forceful knockback!
              e.pos.x += e.vel.x;
              e.pos.y += e.vel.y;
              e.vel.y += GRAVITY * 0.75;
              e.vel.x *= (e.isOiled ? 0.985 : 0.97);
              if (e.pos.y >= floorLevel) {
                e.pos.y = floorLevel;
                e.vel.y = 0;
                e.vel.x *= (e.isOiled ? 0.95 : 0.7); // Slide smoothly upon landing!
              }
              if (isStunned) e.pauseTimer!--;
            } else {
              e.pos.y = floorLevel;
              e.vel.y = 0;
              if (isStunned) {
                e.pauseTimer!--;
                e.vel.x *= (e.isOiled ? 0.965 : 0.88); // Oiled enemies slide smoothly across the floor!
                e.pos.x += e.vel.x;
                if (Math.abs(e.vel.x) < 0.1) e.vel.x = 0;
              } else {
                if (e.id.startsWith('rusher')) { 
                  if (onScreen && player.invincibilityTimer <= 0 && Math.abs((player.pos.y + player.height/2) - (e.pos.y + e.height/2)) < 80) e.vel.x = (player.pos.x < e.pos.x ? -1 : 1) * 6; 
                  else e.vel.x = 0; 
                } 
                else if (e.behavior === 'patrol') { 
                  if (e.pos.x > (e.initialX + e.patrolRange) || e.pos.x < e.initialX) e.vel.x *= -1; 
                } 
                else if (e.behavior === 'shoot' && onScreen) { 
                  e.shootTimer++; 
                  if (e.enemyType === 'shield') { 
                    e.isShieldActive = e.shootTimer < 80; 
                    if (e.shootTimer > 120) { 
                      state.projectiles.push({ id: `ep-${Date.now()}`, pos: { x: e.pos.x, y: e.pos.y + 15 }, vel: { x: -6, y: 0 }, width: 14, height: 14, health: 1, maxHealth: 1, type: 'projectile', damage: ENEMY_BULLET_DAMAGE, owner: 'enemy' }); 
                      e.shootTimer = 0; 
                    } 
                  } else if (e.shootTimer > 60) { 
                    state.projectiles.push({ id: `ep-${Date.now()}`, pos: { x: e.pos.x + e.width/2, y: e.pos.y + 10 }, vel: { x: player.pos.x < e.pos.x ? -7 : 7, y: 0 }, width: 14, height: 14, health: 1, maxHealth: 1, type: 'projectile', damage: ENEMY_BULLET_DAMAGE, owner: 'enemy' }); 
                    e.shootTimer = 0; 
                  } 
                } 
                e.pos.x += e.vel.x; 
              }
            }
          }
        }
      }

      // Oiled enemy sliding collision with other enemies
      if (e.isOiled && !e.isBlownAway && e.health > 0 && Math.abs(e.vel.x) > 1.2 && (!e.enemyCollisionCooldown || e.enemyCollisionCooldown <= 0)) {
        for (const other of enemies) {
          if (other !== e && !other.isBlownAway && other.health > 0 && (!other.enemyCollisionCooldown || other.enemyCollisionCooldown <= 0)) {
            if (
              e.pos.x < other.pos.x + other.width &&
              e.pos.x + e.width > other.pos.x &&
              e.pos.y < other.pos.y + other.height &&
              e.pos.y + e.height > other.pos.y
            ) {
              const slideDir = Math.sign(e.vel.x) || (other.pos.x > e.pos.x ? 1 : -1);
              const speed = Math.abs(e.vel.x);
              const collisionDamage = OILED_COLLISION_DAMAGE;

              e.enemyCollisionCooldown = 20;
              other.enemyCollisionCooldown = 20;

              e.health -= collisionDamage;
              other.health -= collisionDamage;
              spawnDamageNumber(e.pos, collisionDamage);
              spawnDamageNumber(other.pos, collisionDamage);

              const midX = (e.pos.x + e.width / 2 + other.pos.x + other.width / 2) / 2;
              const midY = (e.pos.y + e.height / 2 + other.pos.y + other.height / 2) / 2;
              spawnExplosion({ x: midX, y: midY }, '#3E2723', 10, 0, 5);
              for (let pi = 0; pi < 8; pi++) {
                state.particles.push({
                  pos: { x: midX, y: midY },
                  vel: { x: (Math.random() - 0.5) * 12, y: -Math.random() * 8 - 2 },
                  life: 25,
                  color: Math.random() > 0.4 ? '#1A110F' : '#FFD700',
                  size: 4 + Math.random() * 4
                });
              }
              playGunSound();

              if (other.type !== 'boss') {
                other.vel.x = slideDir * Math.max(10, speed * 0.85);
                other.vel.y = -8;
                other.pauseTimer = 30;
                other.isOiled = true;
                other.oiledTimer = Math.max(other.oiledTimer || 0, OIL_ROCKET_OILED_DURATION);
              }

              if (e.type !== 'boss') {
                e.vel.x = -slideDir * Math.max(4, speed * 0.4);
                e.vel.y = -5;
                e.pauseTimer = 20;
              }

              if (e.health <= 0) {
                e.health = 0;
                e.isBlownAway = true;
                e.vel = { x: -slideDir * 12, y: -12 };
                spawnDeathShower(e.pos, -slideDir);
                spawnPickup(e.pos);
                speakVulgarity('oil_kill');
                spawnDamageNumber(e.pos, 'CRUSHED!', true, '#FFA500');
              }

              if (other.health <= 0) {
                if (other.type === 'boss') {
                  BossLogic.triggerBossDeath(other, slideDir, false, stageId, currentWeapon, state, bossHelpers);
                } else {
                  other.health = 0;
                  other.isBlownAway = true;
                  other.vel = { x: slideDir * 14, y: -14 };
                  spawnDeathShower(other.pos, slideDir);
                  spawnPickup(other.pos);
                  speakVulgarity('oil_kill');
                  spawnDamageNumber(other.pos, 'CRUSHED!', true, '#FFA500');
                }
              }

              break;
            }
          }
        }
      }

      let hbW = player.width, hbH = player.height, hbX = player.pos.x, hbY = player.pos.y; 
      if (player.isCharging) { hbW = player.width + 10; hbH = player.height - 10; } 
      else if (player.isUppercutting) { hbW = player.width - 15; hbH = player.height + 40; hbY = player.pos.y - 30; hbX = player.pos.x + 7.5; }
      else if (player.isDivekicking) { hbW = player.width + 20; hbH = player.height + 25; hbX = player.pos.x + (player.facing === 1 ? 0 : -20); hbY = player.pos.y + 10; }
      const hasShield = player.filthShieldTimer && player.filthShieldTimer > 0;
      const chargeHit = (player.isCharging || player.isUppercutting || player.isDivekicking || hasShield) && hbX < e.pos.x + e.width && hbX + hbW > e.pos.x && hbY < e.pos.y + e.height && hbY + hbH > e.pos.y;
      const curH = player.isDucking ? 26 : player.height;
      const curY = player.isDucking ? player.pos.y + (player.height - 26) : player.pos.y;
      const curW = player.isDucking ? player.width - 4 : player.width;
      const curX = player.isDucking ? player.pos.x + 2 : player.pos.x;
      
      if (chargeHit && onScreen && (!e.hitCooldown || e.hitCooldown <= 0)) { 
        if (e.type === 'boss' && !state.arenaLocked) { 
          const pushDir = player.pos.x + player.width/2 < e.pos.x + e.width/2 ? -1 : 1; 
          player.vel = { x: pushDir * 18, y: -4 }; 
          player.pushbackTimer = PLAYER_PUSHBACK_DURATION; 
          player.isHarmlessPushback = true; 
          player.smugTimer = 40; 
          player.hurtTimer = 0; 
          return true; 
        } 
        if (e.type === 'boss' && stageId === 'Toxic Tommy') {
          const isTommyShielded = (
            e.bossState === 'submerged_chase' ||
            e.bossState === 'telegraph_emerge' ||
            e.bossState === 'dive_in_sludge' ||
            e.pos.y >= state.tommySludgeY - 30
          );
          if (isTommyShielded) {
            spawnExplosion(player.pos, '#27AE60', 12, 0, 6);
            playGunSound('barf');
            const pushDir = player.pos.x + player.width/2 < e.pos.x + e.width/2 ? -1 : 1;
            player.vel = { x: pushDir * PLAYER_PUSHBACK_VEL_X, y: PLAYER_PUSHBACK_VEL_Y };
            player.pushbackTimer = PLAYER_PUSHBACK_DURATION;
            player.isCharging = false;
            player.isUppercutting = false;
            player.isDivekicking = false;
            player.invincibilityTimer = PLAYER_STUN_INVINCIBILITY;
            player.isHarmlessPushback = true;
            player.smugTimer = 40;
            player.hurtTimer = 0;
            return true;
          }
        }
        if (e.id === 'boss' && stageId === 'Hector Hurricane' && e.bossState === 'hurricane') e.stateTimer = 0; 
        
        let damage = 0;
        if (player.isCharging) damage = BOSS_CHARGE_DAMAGE;
        else if (player.isUppercutting) damage = (e.type === 'boss' ? BOSS_UPPERCUT_DAMAGE : ENEMY_UPPERCUT_DAMAGE);
        else if (player.isDivekicking) damage = (e.type === 'boss' ? BOSS_DIVEKICK_DAMAGE : ENEMY_DIVEKICK_DAMAGE);
        
        if (hasShield) {
          damage += FILTH_SHIELD_CONTACT_DAMAGE;
          player.filthShieldTimer = 0;
          spawnExplosion({ x: player.pos.x + player.width/2, y: player.pos.y + player.height/2 }, '#43A047', 15, 0, 15);
        }

        const wasFrozen = (e.frozenTimer && e.frozenTimer > 0);
        if (wasFrozen) damage *= 2; 

        e.health -= damage; 
        e.hitCooldown = ENEMY_HIT_COOLDOWN; 
        spawnDamageNumber(e.pos, damage, player.isUppercutting || player.isDivekicking || wasFrozen || hasShield); 
        
        if (e.health > 0) { 
          if (wasFrozen) e.frozenTimer = 0; 
          if (e.id.startsWith('rusher')) { e.vel.x = player.facing * 15; e.pauseTimer = 120; } else if (e.type !== 'boss') e.pauseTimer = 60; 
          if (player.isDivekicking) {
            // NON-LETHAL DIVEKICK: Meathead clips into the enemy, taking damage in the process!
            player.isDivekicking = false;
            player.isGrounded = false;
            player.vel.x = player.facing * 2;
            player.vel.y = 4; // clips right into the enemy without rebounding upward
            if (!invincibilityEnabled) {
              const contactDmg = e.type === 'boss' ? (stageId === 'Drug Trade Dale' ? 10 : 8) : (stageId === 'Drug Trade Dale' ? 7.5 : 5.5);
              player.health -= contactDmg;
              player.invincibilityTimer = PLAYER_INVINCIBILITY_FRAMES;
              player.hurtTimer = PLAYER_INVINCIBILITY_FRAMES;
              player.isHarmlessPushback = false;
              player.smugTimer = 0;
              const enemyHurtSource = e.type === 'boss' ? (stageId || 'boss') : (e.id.startsWith('rusher') ? 'rusher' : e.enemyType);
              speakVulgarity('hurt', enemyHurtSource);
              if (player.health <= 0) {
                player.health = 0;
                if (state.deathTimer <= 0) {
                  state.deathTimer = 180;
                  state.deathString = "YOU DIED";
                  spawnDeathShower(player.pos, player.facing, 3);
                  speakVulgarity('death');
                }
              }
            }
            state.screenShakeTimer = 12;
            spawnExplosion({ x: player.pos.x + player.width / 2, y: player.pos.y + player.height / 2 }, '#FF0000', 14, 0, 8);
            playGunSound();
          } else {
            player.vel = { x: (player.pos.x + player.width/2 < e.pos.x + e.width/2 ? -1 : 1) * PLAYER_PUSHBACK_VEL_X, y: PLAYER_PUSHBACK_VEL_Y }; 
            player.pushbackTimer = PLAYER_PUSHBACK_DURATION; 
            player.isCharging = false; 
            player.isUppercutting = false; 
            player.invincibilityTimer = PLAYER_STUN_INVINCIBILITY; 
            player.isHarmlessPushback = true; 
            player.smugTimer = 35; 
            player.hurtTimer = 0;
          }
        } else { 
          if (e.type === 'boss') BossLogic.triggerBossDeath(e, player.facing, false, stageId, currentWeapon, state, bossHelpers); 
          else { 
            e.isBlownAway = true; 
            if (player.isDivekicking) {
              // LETHAL DIVEKICK: splat the enemy and NOT propel Meathead!
              e.vel = { x: player.facing * 8, y: 18 }; // slammed down / splatted!
              spawnDeathShower(e.pos, player.facing, 2.5);
              spawnExplosion(e.pos, '#8B0000', 16, 0, 12);
              spawnDamageNumber(e.pos, "SPLAT!", true, '#FF0000');
              speakVulgarity('charge_kill');
              // Meathead does NOT propel back up, continues plummeting
            } else {
              e.vel = { x: player.isUppercutting ? 0 : player.facing * 30, y: player.isUppercutting ? -30 : -5 }; 
              if (wasFrozen) { spawnGlassShatter(e.pos); } else { spawnDeathShower(e.pos, player.facing); }
              speakVulgarity(hasShield ? 'sludge_kill' : (player.isUppercutting ? 'uppercut_kill' : 'charge_kill')); 
            }
            spawnPickup(e.pos); 
            player.killSatisfactionTimer = 60; 
          } 
          return false; 
        } 
      } 
      else if (!player.isCharging && !player.isUppercutting && !player.isDivekicking && !hasShield && player.invincibilityTimer <= 0 && curX < e.pos.x + e.width && curX + curW > e.pos.x && curY < e.pos.y + e.height && curY + curH > e.pos.y) { 
        if (!invincibilityEnabled) player.health -= (stageId === 'Drug Trade Dale' ? 7.5 : 5.5); 
        if (player.health > 0) { 
          player.invincibilityTimer = PLAYER_INVINCIBILITY_FRAMES; 
          player.hurtTimer = PLAYER_INVINCIBILITY_FRAMES;
          player.isHarmlessPushback = false;
          player.smugTimer = 0;
          const enemyHurtSource = e.type === 'boss' ? (stageId || 'boss') : (e.id.startsWith('rusher') ? 'rusher' : e.enemyType);
          speakVulgarity('hurt', enemyHurtSource); 
          player.pushbackTimer = (stageId === 'Drug Trade Dale' && e.bossState !== 'idle') ? 24 : PLAYER_PUSHBACK_DURATION;
          const hitDir = player.pos.x < e.pos.x ? -1 : 1;
          player.vel = { x: hitDir * PLAYER_PUSHBACK_VEL_X, y: PLAYER_PUSHBACK_VEL_Y };
        } 
        if (e.id === 'boss' && stageId === 'Hector Hurricane' && e.bossState === 'hurricane') e.stateTimer = 0; 
        if (e.id.startsWith('rusher')) e.pauseTimer = 60; 
      }
      return true;
    });

    state.projectiles = projectiles.filter(p => {
      if (p.isMethBarrel && p.health <= 0) {
        spawnMethExplosion({ x: p.pos.x + p.width/2, y: p.pos.y + p.height/2 });
        return false;
      }
      if (p.health <= 0) return false;

      // --- OIL ROCKET LOGIC ---
      if (p.isOilRocket) {
        p.pos.x += p.vel.x;
        p.pos.y += p.vel.y;
        
        // Particle trail
        if (state.frame % 2 === 0) {
          state.particles.push({ 
            pos: { x: p.pos.x + (p.vel.x > 0 ? 0 : p.width), y: p.pos.y + p.height / 2 }, 
            vel: { x: -p.vel.x * 0.2, y: (Math.random()-0.5)*4 }, 
            life: 30, color: p.isOilRocket ? '#000000' : '#333', size: p.isOilRocket ? 6 + Math.random()*6 : 8 + Math.random()*8 
          });
        }
        // Dripping Oil for Rocket
        if (p.isOilRocket && state.frame % 3 === 0) {
          state.particles.push({
            pos: { x: p.pos.x + Math.random() * p.width, y: p.pos.y + p.height },
            vel: { x: p.vel.x * 0.1, y: 1 + Math.random() * 3 },
            life: 20 + Math.random() * 20, color: '#000000', size: 4 + Math.random() * 4
          });
        }

        // Collision with walls/floors
        for (const b of blocks) {
          if (state.arenaLocked && b.x <= BOSS_DOOR_X + DOOR_WIDTH && p.vel.x > 0) continue;
          if (b.type !== 'pit' && p.pos.x < b.x + b.w && p.pos.x + p.width > b.x && p.pos.y < b.y + b.h && p.pos.y + p.height > b.y) {
            spawnOilExplosion({ x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 }, p.vel.x);
            return false;
          }
        }

        // Collision with enemies
        for (const e of state.enemies) {
          if (e.health > 0 && !e.isBlownAway && p.pos.x < e.pos.x + e.width && p.pos.x + p.width > e.pos.x && p.pos.y < e.pos.y + e.height && p.pos.y + p.height > e.pos.y) {
            spawnOilExplosion({ x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 }, p.vel.x);
            return false;
          }
        }

        return true;
      }

      // --- FILTH SHIELD DEFENSIVE PRIORITY ---
      if (p.owner === 'enemy' && player.filthShieldTimer && player.filthShieldTimer > 0) {
        const shieldPadding = 20; // Slightly larger intercept area
        if (p.pos.x < player.pos.x + player.width + shieldPadding && p.pos.x + p.width > player.pos.x - shieldPadding && p.pos.y < player.pos.y + player.height + shieldPadding && p.pos.y + p.height > player.pos.y - shieldPadding) {
           player.filthShieldTimer = 0; 
           spawnExplosion(p.pos, '#ADFF2F', 15, 0, 10);
           return false; // NEUTRALIZE PROJECTILE IMMEDIATELY
        }
      }

      if (p.isPoop) for (const b of state.enemies.filter(e => e.type === 'boss')) if (Math.abs((p.pos.x + p.width/2) - (b.pos.x + b.width/2)) < 80 && Math.abs((p.pos.y + p.height/2) - (b.pos.y + b.height/2)) < 80) { spawnPoopExplosion({ x: p.pos.x + p.width/2, y: p.pos.y + p.height/2 }, 15); return false; }
      if (p.bounceDecay !== undefined && --p.bounceDecay <= 0) { if (p.isIce) { const fizzleColors = ['#FFFFFF', '#E0FFFF', '#AFEEEE', '#B0E0E6']; for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: p.pos.x + Math.random() * 14 - 7, y: p.pos.y + Math.random() * 14 - 7 }, vel: { x: (Math.random() - 0.5) * 2.0, y: -Math.random() * 2.0 - 0.5 }, life: 25 + Math.random() * 35, color: fizzleColors[Math.floor(Math.random() * fizzleColors.length)], size: 2 + Math.random() * 6 }); } return false; }
      
      if (p.isBoulder || (p.isIce && p.width > 30) || (p.isIce && p.width <= 20) || (p.owner === 'player' && p.isIce) || p.isShrapnel || p.isCocaine || p.isMethBarrel || p.isSludge || p.isPoop) {
        if (!p.isLingering) {
            const gravMult = p.isSludge ? 1.8 : 1.0;
            const mG = (p.isMethBarrel) ? GRAVITY * 1.5 : GRAVITY * gravMult; 
            const poopGravity = 0;
            p.vel.y += (p.isPoop ? poopGravity : ((p.isIce && p.width <= 20) || (p.owner === 'player' && p.isIce) || p.isShrapnel ? GRAVITY * 0.4 : mG)); 
            if (p.isSliding) p.vel.y = 1.5; 
            p.pos.y += p.vel.y;
        }

        for (const b of blocks) if (b.type !== 'pit' && p.pos.x < b.x + b.w && p.pos.x + p.width > b.x && p.pos.y < b.y + b.h && p.pos.y + p.height > b.y) {
          if (p.isPoop && p.spawnX !== undefined && Math.abs(p.pos.x - p.spawnX) < 200) continue;
          const overlapX = Math.min(p.pos.x + p.width - b.x, b.x + b.w - player.pos.x), overlapY = Math.min(p.pos.y + p.height - b.y, b.y + b.h - player.pos.y);
          if (overlapX < overlapY) { 
            if (p.isMethBarrel) { p.vel.x *= -0.8; p.pos.x = (p.pos.x + p.width / 2 < b.x + b.w / 2) ? b.x - p.width : b.x + b.w; continue; } 
            if (p.isBoulder) { spawnRockShatter(p.pos); spawnBoulderShrapnel(p.pos, BOULDER_SHRAPNEL_COUNT, p.vel.x > 0 ? 1 : -1); return false; } 
            if (p.isCocaine) { spawnPowderExplosion({ x: p.pos.x + p.width/2, y: p.pos.y + p.height/2 }, 30); return false; } 
            if (p.isSludge) { p.isSliding = true; p.vel.x = 0; p.pos.x = (p.pos.x + p.width / 2 < b.x + b.w / 2) ? b.x - p.width : b.x + b.w; continue; }
            if (p.isIce && p.width > 30) { for(let i=0; i<3; i++) state.projectiles.push({ id: `shard-${Date.now()}-${i}`, pos: { x: p.pos.x + 20, y: p.pos.y + 20 }, vel: { x: (Math.random()-0.5)*20, y: (Math.random()-0.5)*20 }, width: 20, height: 20, health: 1, maxHealth: 1, type: 'projectile', damage: 15, owner: 'enemy', isIce: true, life: 75 }); spawnGlassShatter(p.pos); return false; } 
            if ((p.isIce && p.width <= 20) || (p.owner === 'player' && p.isIce)) { p.vel.x *= -1.0; p.pos.x += p.vel.x; if ((p.owner === 'player' && p.isIce) && p.bounceDecay === undefined) p.bounceDecay = 15; } 
            if (p.isShrapnel) return false; 
            if (p.isPoop) { spawnPoopExplosion(p.pos, 25); return false; } 
          } 
          else { 
            if (p.isSludge) { 
               p.isLingering = true; 
               p.life = SLUDGE_LINGER_DURATION; 
               p.vel = { x: 0, y: 0 }; 
               p.width = 70 + Math.random() * 30; 
               p.height = 15 + Math.random() * 10; 
               p.pos.y = b.y - p.height; 
               p.pos.x -= p.width/2; 
               break; 
            }
            if (p.isMethBarrel) { p.vel.y = -Math.abs(p.vel.y) * 0.8; p.vel.x *= 0.98; p.bounces = (p.bounces || 0) + 1; if (p.bounces > 100) { p.health = 0; return false; } } else { p.vel.y = Math.abs(p.vel.y) > 1.0 ? -p.vel.y * (p.isBoulder ? BOULDER_BOUNCE_DAMPING : 0.85) : 0; } 
            p.pos.y = (p.pos.y + p.height / 2 < b.y + b.h / 2) ? b.y - p.height : b.y + b.h; 
            if ((p.owner === 'player' && p.isIce) && p.bounceDecay === undefined) p.bounceDecay = 15; 
          }
        }
        if (!p.isLingering) p.pos.x += p.vel.x;
        
        if (p.isSludge && p.isLingering) {
            p.life--; 
            const isDotTick = state.frame % SLUDGE_DOT_TICK === 0;

            for (const en of state.enemies) {
                if (p.life <= 0) break;
                
                if (en.health > 0 && !en.isBlownAway && en.pos.x < p.pos.x + p.width && en.pos.x + en.width > p.pos.x && en.pos.y < p.pos.y + p.height + 15 && en.pos.y + en.height > p.pos.y) {
                    if (en.enemyType === 'flyer') en.sludgeTimer = 45; // Keep grounded if touching pool
                    
                    if (en.type === 'boss') {
                        if (!en.hitCooldown || en.hitCooldown <= 0) {
                            const isDale = stageId === 'Drug Trade Dale';
                            const dmg = isDale ? 50 : 15;
                            const isW = isDale;

                            en.health -= dmg;
                            en.hitCooldown = ENEMY_HIT_COOLDOWN;
                            spawnDamageNumber(en.pos, dmg, isW);
                            
                            p.life = 0; 

                            if (en.health <= 0) {
                                BossLogic.triggerBossDeath(en, 0, isW, stageId, currentWeapon, state, bossHelpers);
                            }
                        }
                    } else if (isDotTick) {
                         const dmg = SLUDGE_DOT_DAMAGE;
                         en.health -= dmg; 
                         spawnDamageNumber(en.pos, dmg);
                         if (en.health <= 0) {
                            en.isBlownAway = true; en.vel = { x: 0, y: -5 }; 
                            spawnDeathShower(en.pos, 0); spawnPickup(en.pos); speakVulgarity('sludge_kill');
                         }
                    }
                }
            }
            if (state.frame % 4 === 0) {
              state.particles.push({ pos: { x: p.pos.x + Math.random() * p.width, y: p.pos.y + p.height/2 }, vel: { x: (Math.random()-0.5)*2, y: -Math.random()*6 }, life: 25, color: '#ADFF2F', size: 6 + Math.random()*8 });
            }
            if (p.life <= 0) return false;
        }
        if (p.isMethBarrel) p.rotation = (p.rotation || 0) + (p.vel.x * 0.05);
      } else { p.pos.x += p.vel.x; p.pos.y += p.vel.y; if (p.life !== undefined && --p.life <= 0) return false; }
      if (p.pos.x < state.camera.x - 400 || p.pos.x > state.camera.x + CANVAS_WIDTH + 400) return false;
      let phbX = player.pos.x, phbY = player.pos.y, phbW = player.width, phbH = player.height; if (player.isDucking) { phbY += 28; phbH -= 28; } else if (player.isCharging) { phbW += 10; phbH -= 10; } else if (player.isUppercutting) { phbW -= 15; phbH += 40; phbY -= 30; phbX += 7.5; }
      
      if (p.owner === 'player') {
        for (const enemy of state.enemies) if (enemy.health > 0 && !enemy.isBlownAway) {
          const inHitbox = p.pos.x < enemy.pos.x + enemy.width && p.pos.x + p.width > enemy.pos.x && p.pos.y < enemy.pos.y + enemy.height && p.pos.y + p.height > enemy.pos.y;
          if (inHitbox) {
            if (p.isOilRocket) {
              spawnOilExplosion({ x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 }, p.vel.x);
              return false;
            }
            if (p.isSludge && p.isLingering) continue; 
            if (enemy.type === 'boss' && !state.arenaLocked) { if (p.isBoulder) { p.vel.x *= -0.5; p.vel.y = -5; } continue; }
            if (enemy.enemyType === 'shield' && enemy.isShieldActive && ((p.vel.x > 0 && p.pos.x < enemy.pos.x) || (p.vel.x < 0 && p.pos.x > enemy.pos.x))) { if (p.isBoulder) { spawnRockShatter(p.pos); spawnBoulderShrapnel(p.pos, BOULDER_SHRAPNEL_COUNT, p.vel.x > 0 ? 1 : -1); } return false; }
            if (enemy.type === 'boss') {
              if (stageId === 'Toxic Tommy') {
                const isTommyShielded = (
                  enemy.bossState === 'submerged_chase' ||
                  enemy.bossState === 'telegraph_emerge' ||
                  enemy.bossState === 'dive_in_sludge' ||
                  enemy.pos.y >= state.tommySludgeY - 30
                );
                if (isTommyShielded) {
                  spawnExplosion(p.pos, '#27AE60', 10, 0, 5);
                  playGunSound('barf');
                  return false;
                }
              }
              if (p.isDart || p.isSludge) { 
                 if (enemy.hitCooldown && enemy.hitCooldown > 0) return false; // SLUDGE PARTICLES RESPECT IFRAMES
                 const isBarryDart = stageId === 'Blackout Barry' && p.isDart;
                 if (isBarryDart) {
                    enemy.needleCount = Math.min(3, (enemy.needleCount || 0) + 1);
                    enemy.needleTimer = 600; // 10 seconds
                    if (!enemy.needleOffsets) enemy.needleOffsets = [];
                    if (enemy.needleOffsets.length >= 3) enemy.needleOffsets.shift(); 
                    const hitX = p.vel.x >= 0
                      ? Math.max(6, Math.min(enemy.width * 0.4, (p.pos.x + p.width) - enemy.pos.x))
                      : enemy.width - Math.max(6, Math.min(enemy.width * 0.4, (enemy.pos.x + enemy.width) - p.pos.x));
                    let hitY = Math.max(10, Math.min(enemy.height - 10, (p.pos.y + p.height / 2) - enemy.pos.y));
                    for (let attempt = 0; attempt < 5; attempt++) {
                      if (!enemy.needleOffsets.some(o => Math.hypot(o.x - hitX, o.y - hitY) < 12)) break;
                      hitY = Math.max(10, Math.min(enemy.height - 10, hitY + ((attempt % 2 === 0) ? 10 : -10)));
                    }
                    const flightAngle = Math.atan2(p.vel.y, p.vel.x);
                    const rot = flightAngle + (Math.random() - 0.5) * 0.25;
                    enemy.needleOffsets.push({ x: hitX, y: hitY, rot });
                    p.health = 0;
                    return false;
                 }
                 const dmg = BossLogic.getBossDamage(enemy, stageId, currentWeapon, p), isW = BossLogic.checkIsWeakness(stageId, currentWeapon, p); 
                 enemy.health -= dmg; 
                 enemy.hitCooldown = ENEMY_HIT_COOLDOWN; 
                 spawnDamageNumber(enemy.pos, dmg, isW); 
                 if (stageId === 'Toxic Tommy' && isW && enemy.health > 0) {
                    enemy.bossState = 'weakness_stunned';
                    enemy.stateTimer = 75;
                    enemy.pukeSweepProgress = 0;
                    state.tommySludgeOiledTimer = 240;
                    enemy.isOiled = true;
                    enemy.oiledTimer = 240;
                    spawnExplosion({ x: enemy.pos.x + enemy.width / 2, y: enemy.pos.y + 20 }, '#111111', 25, 0, 10);
                    BossLogic.speakAsBoss('Toxic Tommy', "BLAARGH! CRUDE OIL?! I CAN'T CHUNDER!", bossHelpers);
                 }
                 if (enemy.health <= 0) BossLogic.triggerBossDeath(enemy, p.vel.x > 0 ? 1 : -1, isW, stageId, currentWeapon, state, bossHelpers); 
                 if (p.isSludge) { p.health = 0; return false; } 
                 return false; 
              }
              if (enemy.hitCooldown && enemy.hitCooldown > 0) return false; 
              if (stageId === 'Ernie Earthquake' && !enemy.isGroundedBoss && p.isIce) { enemy.bossState = 'stunned_drop'; enemy.stateTimer = 90; enemy.vel.y = 15; enemy.rotation = Math.PI / 2; spawnGlassShatter(p.pos); }
              const dmg = BossLogic.getBossDamage(enemy, stageId, currentWeapon, p), isW = BossLogic.checkIsWeakness(stageId, currentWeapon, p); enemy.health -= dmg; enemy.hitCooldown = ENEMY_HIT_COOLDOWN; spawnDamageNumber(enemy.pos, dmg, isW);
              if (stageId === 'Artie Avalanche' && isW && enemy.health > 0) { const tx = enemy.pos.x < 7560 ? 7850 : 7250; enemy.vel.y = -22; enemy.vel.x = (tx - enemy.pos.x) / 50; enemy.bossState = 'jumping'; enemy.stateTimer = 60; }
              if (stageId === 'Toxic Tommy' && isW && enemy.health > 0) {
                enemy.bossState = 'weakness_stunned';
                enemy.stateTimer = 75;
                enemy.pukeSweepProgress = 0;
                state.tommySludgeOiledTimer = 240;
                enemy.isOiled = true;
                enemy.oiledTimer = 240;
                spawnExplosion({ x: enemy.pos.x + enemy.width / 2, y: enemy.pos.y + 20 }, '#111111', 25, 0, 10);
                BossLogic.speakAsBoss('Toxic Tommy', "BLAARGH! CRUDE OIL?! I CAN'T CHUNDER!", bossHelpers);
              }
              if (enemy.health <= 0) BossLogic.triggerBossDeath(enemy, p.vel.x > 0 ? 1 : -1, isW, stageId, currentWeapon, state, bossHelpers);
            } else { 
              if (p.isDart) { 
                enemy.needleCount = (enemy.needleCount || 0) + 1; 
                if (!enemy.needleOffsets) enemy.needleOffsets = []; 

                // Calculate entry penetration point on enemy's body
                const hitX = p.vel.x >= 0
                  ? Math.max(4, Math.min(enemy.width * 0.45, (p.pos.x + p.width) - enemy.pos.x))
                  : enemy.width - Math.max(4, Math.min(enemy.width * 0.45, (enemy.pos.x + enemy.width) - p.pos.x));
                let hitY = Math.max(4, Math.min(enemy.height - 5, (p.pos.y + p.height / 2) - enemy.pos.y));

                // Disperse needles so multiple stuck darts do not stack directly on top of each other
                for (let attempt = 0; attempt < 5; attempt++) {
                  const isTooClose = enemy.needleOffsets.some(o => Math.hypot(o.x - hitX, o.y - hitY) < 10);
                  if (!isTooClose) break;
                  hitY = Math.max(4, Math.min(enemy.height - 5, hitY + ((attempt % 2 === 0) ? 8 : -8)));
                }

                const flightAngle = Math.atan2(p.vel.y, p.vel.x);
                const rot = flightAngle + (Math.random() - 0.5) * 0.25;
                enemy.needleOffsets.push({ x: hitX, y: hitY, rot });

                if (enemy.needleCount >= NEEDLE_OVERDOSE_THRESHOLD) { 
                  enemy.health = 0; enemy.isBlownAway = true; enemy.vel = { x: (Math.random()-0.5)*15, y: -25 }; spawnDeathShower(enemy.pos, 0, 3, false, 80); spawnPickup(enemy.pos); speakVulgarity('dart_kill'); spawnDamageNumber(enemy.pos, "OVERDOSE!", true, "#FF00FF"); 
                } else { 
                  enemy.health -= p.damage; spawnDamageNumber(enemy.pos, p.damage); if (enemy.health <= 0) { enemy.isBlownAway = true; enemy.vel = { x: (Math.random()-0.5)*10, y: -15 }; spawnDeathShower(enemy.pos, 0); spawnPickup(enemy.pos); speakVulgarity('dart_kill'); spawnDamageNumber(enemy.pos, "OVERDOSE!", true, "#FF00FF"); } 
                } return false; 
              } 
              enemy.health -= p.damage; 
              if (enemy.isOiled && !p.isOilRocket) {
                enemy.vel.x = p.vel.x * OIL_ROCKET_OILED_PUSHBACK_MULT;
                enemy.vel.y = -8;
                enemy.pauseTimer = 30;
              }
              if (p.isIce) enemy.frozenTimer = SHOTGUN_FREEZE_TIME; spawnDamageNumber(enemy.pos, p.damage, p.isBoulder); if (enemy.health <= 0) { spawnDeathShower(enemy.pos, 0, 1.2); spawnPickup(enemy.pos); speakVulgarity(p.isBoulder ? 'boulder_kill' : (p.isIce ? 'shotgun_kill' : (p.isSludge ? 'sludge_kill' : 'gun_kill'))); player.killSatisfactionTimer = 60; } }
            if (p.isBoulder) { spawnRockShatter(p.pos); spawnBoulderShrapnel(p.pos, BOULDER_SHRAPNEL_COUNT, p.vel.x > 0 ? 1 : -1); } if (p.isSludge) { enemy.sludgeTimer = 45; p.health = 0; return false; } return false;
          }
        }
        for (const barrel of state.projectiles.filter(pr => pr.isMethBarrel)) if (p.pos.x < barrel.pos.x + barrel.width && p.pos.x + p.width > barrel.pos.x && p.pos.y < barrel.pos.y + barrel.height && p.pos.y + p.height > barrel.pos.y) { 
          if (p.isDart) continue;
          barrel.health -= p.damage; spawnDamageNumber(barrel.pos, p.damage); if (barrel.health <= 0) { barrel.health = 0; } if (p.isBoulder) { spawnRockShatter(p.pos); spawnBoulderShrapnel(p.pos, BOULDER_SHRAPNEL_COUNT, p.vel.x > 0 ? 1 : -1); } if (p.isSludge) { p.health = 0; return false; } return false; 
        }
      } else if (player.invincibilityTimer <= 0 && p.pos.x < phbX + phbW && p.pos.x + p.width > phbX && p.pos.y < phbY + phbH && p.pos.y + p.height > phbY) { 
        if (p.isSludge && stageId === 'Toxic Tommy' && (player.isUppercutting || player.isDivekicking)) {
          // Uppercut or divekick slices cleanly through Tommy's vomit projectiles!
          spawnExplosion(p.pos, '#27AE60', 10, 0, 5);
          return false;
        }
        if (!invincibilityEnabled) { 
          player.health -= (p.damage / 2); 
          if (player.health > 0) { 
            player.invincibilityTimer = PLAYER_INVINCIBILITY_FRAMES; 
            player.hurtTimer = PLAYER_INVINCIBILITY_FRAMES;
            player.isHarmlessPushback = false;
            player.smugTimer = 0;
            let pSource = 'bullet';
            if (p.isMethBarrel) pSource = 'meth_barrel';
            else if (p.isDart) pSource = 'needle';
            else if (p.isPoop) pSource = 'wind';
            else if (p.isBoulder || p.isShrapnel) pSource = 'boulder';
            else if (p.isIce) pSource = 'ice';
            else if (p.isSludge) pSource = 'sludge';
            else if (p.isTased) pSource = 'electric';
            else if (stageId && BOSS_DIALOGUE.HURT[stageId as keyof typeof BOSS_DIALOGUE.HURT]) pSource = stageId;
            speakVulgarity('hurt', pSource); 
            player.pushbackTimer = PLAYER_PUSHBACK_DURATION; 
            const pDir = (p.vel.x !== 0 ? Math.sign(p.vel.x) : (player.pos.x < p.pos.x ? -1 : 1));
            player.vel.x = pDir * PLAYER_PUSHBACK_VEL_X;
            player.vel.y = PLAYER_PUSHBACK_VEL_Y;
            player.isCharging = false; 
            player.isUppercutting = false; 
            player.isDivekicking = false;
          } 
        } 
        if (p.isBoulder) spawnRockShatter(p.pos); if (p.isPoop) spawnPoopExplosion(p.pos, 25); if (p.isCocaine) spawnPowderExplosion(p.pos, 25); if (p.isMethBarrel) { p.health = 0; } return false; 
      }
      return true;
    });

    if (player.isCharging || player.isUppercutting || player.isDivekicking) { 
      let phbX = player.pos.x, phbY = player.pos.y, phbW = player.width, phbH = player.height; 
      if (player.isCharging) { phbW += 10; phbH -= 10; } 
      else if (player.isUppercutting) { phbW = player.width - 15; phbH = player.height + 40; phbY = player.pos.y - 30; phbX = player.pos.x + 7.5; } 
      else if (player.isDivekicking) { phbW = player.width + 20; phbH = player.height + 25; phbX = player.pos.x + (player.facing === 1 ? 0 : -20); phbY = player.pos.y + 10; }
      state.projectiles.forEach(p => { 
        if (p.isMethBarrel && p.health > 0 && phbX < p.pos.x + p.width && phbX + phbW > p.pos.x && phbY < p.pos.y + p.height && phbY + phbH > p.pos.y) { 
          const dmg = (player.isUppercutting || player.isDivekicking) ? 100 : 50; p.health -= dmg; spawnDamageNumber(p.pos, dmg, player.isUppercutting || player.isDivekicking); if (p.health <= 0) p.health = 0; else { p.vel.x = player.facing * 10; p.vel.y = -6; } 
        } 
      }); 
    }
    state.pickups = pickups.filter(p => { p.vel.y += GRAVITY; p.pos.x += p.vel.x; p.pos.y += p.vel.y; p.vel.x *= 0.9; p.life--; blocks.forEach(b => { if (b.type !== 'pit' && p.pos.x < b.x + b.w && p.pos.x + p.width > b.x && p.pos.y < b.y + b.h && p.pos.y + p.height > b.y) { p.pos.y = b.y - p.height; p.vel.y = 0; } }); if (p.pos.x < player.pos.x + player.width && p.pos.x + p.width > player.pos.x && p.pos.y < player.pos.y + player.height && p.pos.y + p.height > player.pos.y) { if (p.type.includes('health')) player.health = Math.min(player.maxHealth, player.health + (p.type === 'large_health' ? HEALTH_PICKUP_LARGE : HEALTH_PICKUP_SMALL)); else { const target = (player.currentWeapon === 'GUN' ? 'BOULDER' : player.currentWeapon) as WeaponType; player.weaponAmmo[target] = Math.min(MAX_AMMO[target], player.weaponAmmo[target] + MAX_AMMO[target] * (p.type === 'large_ammo' ? AMMO_PICKUP_PCT.LARGE : AMMO_PICKUP_PCT.SMALL)); } return false; } return p.life > 0; });
    state.particles = state.particles.filter(p => { if (!p.isStuck) { p.pos.x += p.vel.x; p.pos.y += p.vel.y; if (p.isGlass || (p.color && PARTICLE_PALETTES.FIRE.includes(p.color))) { p.vel.y += 0.25; if (p.pos.y > 548) { p.pos.y = 548; p.vel.y = -p.vel.y * 0.3; p.vel.x *= 0.8; } } p.life--; } return p.life > 0; });
    state.damageNumbers = damageNumbers.filter(d => { d.pos.x += d.vel.x; d.pos.y += d.vel.y; d.vel.y += 0.15; d.life--; return d.life > 0; });
    if (!state.arenaLocked && state.victoryString === "" && state.bossExplosionTimer <= 0) state.camera.x = Math.max(0, Math.min(state.doorState === 'closed' ? BOSS_DOOR_X + DOOR_WIDTH - CANVAS_WIDTH : 8000 - CANVAS_WIDTH, player.pos.x - CANVAS_WIDTH / 2 + player.width / 2));
    if (stageId === 'Toxic Tommy' && state.arenaLocked) {
      const targetCamY = player.pos.y < 220 ? player.pos.y - 220 : 0;
      state.camera.y += (targetCamY - state.camera.y) * 0.15;
    } else {
      state.camera.y = 0;
    }
    if (player.health <= 0 || player.pos.y > 1000) if (state.deathTimer <= 0) { state.deathTimer = 180; state.deathString = "YOU DIED"; spawnDeathShower(player.pos, player.facing, 3); speakVulgarity('death'); }
    const forced = state.shouldSyncWeapon ? 'GUN' as WeaponType : undefined; if (state.shouldSyncWeapon) state.shouldSyncWeapon = false;
    onPlayerUpdate(player.health, player.specialCharges, player.specialChargeTimer, player.weaponAmmo, forced);
  }, [status, stageId, onBossDefeated, currentWeapon, respawn, invincibilityEnabled, infiniteAmmoEnabled, infinitePowerEnabled, jumpToBossEnabled, bossTauntText, onPlayerUpdate, spawnDamageNumber, spawnDeathShower, speakVulgarity, playGunSound, spawnExplosion, spawnSteamExplosionParticles, spawnPoopExplosion, spawnPowderExplosion, spawnMethExplosion, spawnGlassShatter, onBossDeath, onIntroComplete, onBossEncounter, onBossTransition]);

  const drawStuckNeedles = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
    if (!e.needleOffsets || e.needleOffsets.length === 0 || (e.needleCount || 0) <= 0) return;

    ctx.save();
    ctx.filter = 'none'; // Keep stuck syringe colors sharp and un-tinted

    e.needleOffsets.forEach((off, idx) => {
      ctx.save();
      ctx.translate(e.pos.x + off.x, e.pos.y + off.y);

      // Subtle organic twitch / vibration of the stuck needle
      const twitch = Math.sin(frame * 0.4 + idx * 2.1) * 0.08;
      ctx.rotate(off.rot + twitch);

      // 1. Steel needle / cannula (penetrates into enemy body along trajectory)
      ctx.strokeStyle = '#D1D5DB';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.lineTo(6, 0);
      ctx.stroke();

      // Needle hub / base collar
      ctx.fillStyle = '#9CA3AF';
      ctx.fillRect(-6, -2, 2.5, 4);

      // 2. Syringe barrel (clear glass tube, length 12px, height 6px)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fillRect(-18, -3, 12, 6);

      // Glowing toxic drug fluid inside barrel
      const DRUG_COLORS = ['#FF007F', '#39FF14', '#FFD700', '#00F0FF'];
      const drugCol = DRUG_COLORS[idx % DRUG_COLORS.length];
      ctx.fillStyle = drugCol;
      ctx.fillRect(-17, -2, 10, 4);

      // Glass sheen highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(-17, -3, 10, 1.5);

      // Syringe barrel white border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(-18, -3, 12, 6);

      // 3. Syringe finger flange
      ctx.fillStyle = '#E5E7EB';
      ctx.fillRect(-19.5, -5, 1.5, 10);
      ctx.strokeStyle = '#6B7280';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(-19.5, -5, 1.5, 10);

      // 4. Syringe plunger rod
      ctx.fillStyle = '#9CA3AF';
      ctx.fillRect(-24, -1, 4.5, 2);

      // 5. Plunger thumb press button (bright red cap)
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(-25.5, -4, 2, 8);
      ctx.strokeStyle = '#7F1D1D';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(-25.5, -4, 2, 8);

      // 6. Occasional drug droplet dripping from puncture site
      if ((frame + idx * 8) % 30 < 12) {
        ctx.fillStyle = drugCol;
        ctx.beginPath();
        ctx.arc(-2, 3.5, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    ctx.restore();
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, p: Player & { killSatisfactionTimer: number, bossKillSatisfactionTimer: number }) => {
    if (gameStateRef.current.deathTimer > 0) return;
    const state = gameStateRef.current;
    ctx.save();

    // 1. Filth Shield Aura
    if (p.filthShieldTimer && p.filthShieldTimer > 0 && !state.victoryString && status === GameStatus.PLAYING) {
      ctx.save();
      const pulse = Math.sin(state.frame * 0.15) * 0.2;
      ctx.globalAlpha = 0.55 + pulse;
      ctx.fillStyle = '#ADFF2F';
      ctx.beginPath();
      ctx.arc(p.pos.x + p.width / 2, p.pos.y + p.height / 2, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2E7D32';
      ctx.lineWidth = 4;
      ctx.stroke();
      for (let i = 0; i < 3; i++) {
        const bx = p.pos.x + p.width / 2 + Math.cos(state.frame * 0.1 + i * 2) * 32;
        const by = p.pos.y + p.height / 2 + Math.sin(state.frame * 0.1 + i * 2) * 32;
        ctx.fillStyle = '#C5E1A5';
        ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }

    // 2. Invincibility / Hurt Flicker
    const isFlicker = (p.invincibilityTimer > 0 || invincibilityEnabled) && Math.floor(state.frame / 2) % 2 === 0;
    if (isFlicker) {
      ctx.globalAlpha = 0.45;
    }

    // Animation States
    const isHurt = p.pushbackTimer > 0 || (p.invincibilityTimer > 40);
    const isCharging = p.isCharging;
    const isUppercutting = p.isUppercutting;
    const isDivekicking = !!p.isDivekicking;
    const isDucking = p.isDucking;
    const isAirborne = !p.isGrounded;
    const isWalking = p.isGrounded && Math.abs(p.vel.x) > 0.4 && !isCharging && !isDucking && !isDivekicking;
    const isIdle = p.isGrounded && !isWalking && !isCharging && !isDucking && !isUppercutting && !isDivekicking && !isHurt;

    // 3. Charging Afterimages & Energy Trails
    if (isCharging) {
      ctx.save();
      for (let trail = 1; trail <= 3; trail++) {
        const tX = p.pos.x + p.width / 2 - p.facing * trail * 16;
        const tY = p.pos.y + p.height;
        ctx.save();
        ctx.translate(tX, tY);
        ctx.scale(p.facing, 1);
        ctx.globalAlpha = 0.35 / trail;
        ctx.fillStyle = trail % 2 === 0 ? '#EF4444' : '#F59E0B';
        // Afterimage silhouette
        ctx.beginPath();
        ctx.ellipse(0, -32, 22, 34, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      // Speed streaks
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 2;
      for (let s = 0; s < 4; s++) {
        const sy = p.pos.y + 12 + s * 14;
        const sx = p.pos.x + (p.facing === 1 ? -15 : p.width + 15);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - p.facing * (20 + (state.frame * 7 + s * 11) % 25), sy);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 4. Uppercutting Vapor & Upward Energy Cone
    if (isUppercutting) {
      ctx.save();
      const grad = ctx.createLinearGradient(0, p.pos.y + p.height, 0, p.pos.y - 40);
      grad.addColorStop(0, 'rgba(0, 229, 255, 0)');
      grad.addColorStop(0.5, 'rgba(0, 229, 255, 0.3)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(p.pos.x - 10, p.pos.y + p.height);
      ctx.lineTo(p.pos.x + p.width / 2, p.pos.y - 35);
      ctx.lineTo(p.pos.x + p.width + 10, p.pos.y + p.height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 5. Divekick Energy Trails & 60-degree Foot Aura
    if (isDivekicking) {
      ctx.save();
      for (let trail = 1; trail <= 3; trail++) {
        const tX = p.pos.x + p.width / 2 - p.facing * trail * 10;
        const tY = p.pos.y + p.height / 2 - trail * 16;
        ctx.save();
        ctx.translate(tX, tY);
        ctx.scale(p.facing, 1);
        ctx.globalAlpha = 0.4 / trail;
        ctx.fillStyle = trail % 2 === 0 ? '#EF4444' : '#F59E0B';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 30, 0.95, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      // Speed streaks along 60 degree vector
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 2.5;
      for (let s = 0; s < 4; s++) {
        const sx = p.pos.x + (p.facing === 1 ? -10 : p.width + 10) - p.facing * s * 8;
        const sy = p.pos.y - s * 14;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - p.facing * 20, sy - 34);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Set local coordinate frame: (0, 0) is at player feet center
    const anchorX = p.pos.x + p.width / 2;
    const anchorY = p.pos.y + p.height;
    ctx.save();
    ctx.translate(anchorX, anchorY);
    ctx.scale(p.facing, 1);

    // Compute cycle variables
    const idleBreath = Math.sin(state.frame * 0.08) * 1.5;
    const walkPhase = (state.frame * 0.28) % (Math.PI * 2);
    const walkStride = Math.sin(walkPhase);
    const walkBob = Math.abs(Math.sin(walkPhase)) * 3;
    const chargePhase = (state.frame * 0.55) % (Math.PI * 2);
    const chargeStride = Math.sin(chargePhase);

    // Dynamic rotation & vertical offsets based on stance
    let bodyRot = 0;
    let bodyY = 0;
    if (isDivekicking) {
      bodyRot = 0.95; // 55-60 degree downward plummet angle!
      bodyY = -8;
    } else if (isCharging) {
      bodyRot = 0.35; // Aggressive forward bull rush lean
      bodyY = 4;
    } else if (isUppercutting) {
      bodyRot = -0.15; // Dynamic backward launch arch
      bodyY = -6;
    } else if (isHurt) {
      bodyRot = -0.3; // Reeling back in pain/shock
      bodyY = 2;
    } else if (isDucking) {
      bodyRot = 0.05; // Slight forward combat crouch angle
      bodyY = 0; // Feet remain firmly planted on the ground level (0)!
    } else if (isWalking) {
      bodyY = -walkBob;
    } else if (isIdle) {
      bodyY = -idleBreath * 0.5;
    }

    ctx.translate(0, bodyY);
    ctx.rotate(bodyRot);

    // Palette
    const skinTone = '#E0AC69';
    const skinShadow = '#C68B45';
    const skinHighlight = '#F5D0A9';
    const skinVein = '#EF4444';
    const pantsColor = '#1E3A8A'; // Navy tactical pants
    const pantsShadow = '#172554';
    const bootColor = '#18181B'; // Dark combat boots
    const bootToe = '#94A3B8'; // Steel toe
    const beltColor = '#78350F'; // Leather belt
    const beltBuckle = '#FACC15'; // Gold buckle
    const wristbandColor = '#09090B'; // Spiked wristband

    // ==========================================
    // LAYER 1: BACK ARM (Off-Hand)
    // ==========================================
    ctx.save();
    if (isDivekicking) {
      // Tucked back defensively for aerodynamic dive
      ctx.fillStyle = skinShadow;
      ctx.beginPath();
      ctx.arc(-14, -36, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-24, -36, 12, 7);
      ctx.fillStyle = wristbandColor;
      ctx.fillRect(-26, -36, 4, 7);
      ctx.fillStyle = skinShadow;
      ctx.beginPath();
      ctx.arc(-28, -32, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (isUppercutting) {
      // Off-hand tucked defensively near chest / ribs
      ctx.fillStyle = skinShadow;
      ctx.beginPath();
      ctx.arc(-8, -35, 7, 0, Math.PI * 2); // Shoulder
      ctx.fill();
      ctx.fillRect(-12, -35, 7, 14); // Forearm
      ctx.fillStyle = wristbandColor;
      ctx.fillRect(-13, -24, 9, 4); // Wristband
      ctx.fillStyle = skinShadow;
      ctx.beginPath();
      ctx.arc(-8, -18, 5, 0, Math.PI * 2); // Clenched fist
      ctx.fill();
    } else if (isCharging) {
      // Trailing backward for aerodynamic speed
      ctx.fillStyle = skinShadow;
      ctx.beginPath();
      ctx.arc(-14, -38, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-26, -38, 14, 8); // Arm back
      ctx.fillStyle = wristbandColor;
      ctx.fillRect(-28, -38, 4, 8);
      ctx.fillStyle = skinShadow;
      ctx.beginPath();
      ctx.arc(-30, -34, 5, 0, Math.PI * 2); // Fist
      ctx.fill();
    } else if (isHurt) {
      // Flailing back in shock
      ctx.fillStyle = skinShadow;
      ctx.beginPath();
      ctx.arc(-16, -36, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-24, -42, 10, 8);
      ctx.beginPath();
      ctx.arc(-26, -42, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (isDucking) {
      // Tucked back defensively near thigh
      ctx.fillStyle = skinShadow;
      ctx.beginPath();
      ctx.arc(-8, -26, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-12, -26, 8, 12);
      ctx.fillStyle = wristbandColor;
      ctx.fillRect(-13, -15, 9, 4);
      ctx.fillStyle = skinShadow;
      ctx.beginPath();
      ctx.arc(-8, -10, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Idle / Walk pumping arm in opposition
      const armAngle = isWalking ? -walkStride * 0.6 : Math.sin(state.frame * 0.08) * 0.1;
      ctx.save();
      ctx.translate(-6, -40);
      ctx.rotate(armAngle);
      // Shoulder & Bicep
      ctx.fillStyle = skinShadow;
      ctx.beginPath();
      ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-5, 0, 9, 14);
      // Forearm & Spiked Wristband
      ctx.fillStyle = wristbandColor;
      ctx.fillRect(-6, 12, 11, 5);
      // Studs
      ctx.fillStyle = '#E5E7EB';
      ctx.fillRect(-4, 13, 2, 3);
      ctx.fillRect(1, 13, 2, 3);
      // Fist
      ctx.fillStyle = skinShadow;
      ctx.beginPath();
      ctx.arc(0, 21, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // ==========================================
    // LAYER 2: LEGS & BOOTS
    // ==========================================
    ctx.save();
    if (isDivekicking) {
      // Rear leg bent at knee (tucked aerodynamic)
      ctx.fillStyle = pantsShadow;
      ctx.fillRect(-12, -24, 10, 14);
      ctx.fillStyle = bootColor;
      ctx.fillRect(-14, -12, 10, 8);

      // Lead leg thrust straight out forward-downward with steel toe leading
      ctx.fillStyle = pantsColor;
      ctx.save();
      ctx.translate(2, -22);
      ctx.rotate(0.3);
      ctx.fillRect(0, 0, 11, 24); // Extended kicking leg
      ctx.fillStyle = bootColor;
      ctx.fillRect(-2, 22, 15, 9); // Combat boot
      ctx.fillStyle = bootToe;
      ctx.fillRect(6, 23, 7, 7); // Steel toe leading the strike
      ctx.restore();
    } else if (isUppercutting) {
      // Front knee driven high into chest, back leg trailing downward
      // Back leg (straight down)
      ctx.fillStyle = pantsShadow;
      ctx.fillRect(-8, -20, 9, 16);
      ctx.fillStyle = bootColor;
      ctx.fillRect(-9, -4, 11, 8);
      ctx.fillStyle = bootToe;
      ctx.fillRect(-3, -2, 6, 6);

      // Front leg (bent high driving upward)
      ctx.fillStyle = pantsColor;
      ctx.save();
      ctx.translate(6, -22);
      ctx.rotate(-0.8);
      ctx.fillRect(0, 0, 10, 16); // Thigh angled up
      ctx.translate(0, 16);
      ctx.rotate(1.4);
      ctx.fillRect(0, 0, 9, 14); // Shin bent down
      ctx.fillStyle = bootColor;
      ctx.fillRect(-1, 12, 12, 7); // Boot flexed
      ctx.fillStyle = bootToe;
      ctx.fillRect(6, 13, 6, 5);
      ctx.restore();
    } else if (isCharging) {
      // Violent forward sprint stride
      const cLeg = chargeStride * 14;
      // Back leg pushing
      ctx.fillStyle = pantsShadow;
      ctx.fillRect(-14 - cLeg * 0.5, -20, 10, 14);
      ctx.fillStyle = bootColor;
      ctx.fillRect(-16 - cLeg * 0.5, -6, 12, 6);

      // Front leg driving
      ctx.fillStyle = pantsColor;
      ctx.fillRect(2 + cLeg * 0.5, -20, 10, 14);
      ctx.fillStyle = bootColor;
      ctx.fillRect(4 + cLeg * 0.5, -6, 14, 6);
      ctx.fillStyle = bootToe;
      ctx.fillRect(12 + cLeg * 0.5, -5, 6, 5);
    } else if (isDucking) {
      // Deep martial-arts power squat: boots flat on floor level (y = -6 to 0), thighs flared outward
      // Back thigh
      ctx.fillStyle = pantsShadow;
      ctx.beginPath();
      ctx.moveTo(-6, -14);
      ctx.lineTo(-20, -10);
      ctx.lineTo(-18, -6);
      ctx.lineTo(-8, -6);
      ctx.closePath();
      ctx.fill();

      // Back boot firmly planted on the floor
      ctx.fillStyle = bootColor;
      ctx.fillRect(-20, -6, 14, 6);
      ctx.fillStyle = '#09090B';
      ctx.fillRect(-20, -1, 14, 2);

      // Front thigh
      ctx.fillStyle = pantsColor;
      ctx.beginPath();
      ctx.moveTo(6, -14);
      ctx.lineTo(20, -10);
      ctx.lineTo(18, -6);
      ctx.lineTo(8, -6);
      ctx.closePath();
      ctx.fill();

      // Front boot firmly planted on the floor
      ctx.fillStyle = bootColor;
      ctx.fillRect(6, -6, 15, 6);
      ctx.fillStyle = bootToe;
      ctx.fillRect(15, -5, 6, 5);
      ctx.fillStyle = '#09090B';
      ctx.fillRect(6, -1, 15, 2);
    } else if (isAirborne) {
      // Air state: knees tucked slightly
      ctx.fillStyle = pantsShadow;
      ctx.fillRect(-9, -20, 9, 14);
      ctx.fillStyle = bootColor;
      ctx.fillRect(-10, -6, 11, 7);

      ctx.fillStyle = pantsColor;
      ctx.fillRect(2, -22, 10, 15);
      ctx.fillStyle = bootColor;
      ctx.fillRect(2, -7, 13, 7);
      ctx.fillStyle = bootToe;
      ctx.fillRect(9, -6, 6, 5);
    } else if (isHurt) {
      // Staggered backwards
      ctx.fillStyle = pantsShadow;
      ctx.fillRect(-14, -20, 10, 16);
      ctx.fillStyle = bootColor;
      ctx.fillRect(-16, -4, 13, 6);

      ctx.fillStyle = pantsColor;
      ctx.fillRect(2, -22, 10, 18);
      ctx.fillStyle = bootColor;
      ctx.fillRect(3, -4, 13, 6);
      ctx.fillStyle = bootToe;
      ctx.fillRect(10, -3, 6, 5);
    } else if (isWalking) {
      // Smooth 2-legged walking cycle with knee bend & heel strike
      const stride = walkStride * 12;
      // Back leg
      ctx.fillStyle = pantsShadow;
      ctx.save();
      ctx.translate(-4, -20);
      ctx.rotate(-walkStride * 0.5);
      ctx.fillRect(-5, 0, 9, 14);
      ctx.fillStyle = bootColor;
      ctx.fillRect(-6, 12, 12, 7);
      ctx.restore();

      // Front leg
      ctx.fillStyle = pantsColor;
      ctx.save();
      ctx.translate(4, -20);
      ctx.rotate(walkStride * 0.5);
      ctx.fillRect(-4, 0, 10, 14);
      ctx.fillStyle = bootColor;
      ctx.fillRect(-5, 12, 14, 7);
      ctx.fillStyle = bootToe;
      ctx.fillRect(3, 13, 6, 5);
      ctx.restore();
    } else {
      // Idle grounded solid stance
      ctx.fillStyle = pantsShadow;
      ctx.fillRect(-10, -22, 10, 16);
      ctx.fillStyle = bootColor;
      ctx.fillRect(-11, -6, 12, 7);

      ctx.fillStyle = pantsColor;
      ctx.fillRect(2, -22, 10, 16);
      ctx.fillStyle = bootColor;
      ctx.fillRect(2, -6, 14, 7);
      ctx.fillStyle = bootToe;
      ctx.fillRect(10, -5, 6, 5);
      // Tread grips
      ctx.fillStyle = '#09090B';
      ctx.fillRect(2, 0, 14, 2);
    }
    ctx.restore();

    // ==========================================
    // LAYER 3: WEIGHTLIFTING BELT
    // ==========================================
    ctx.save();
    const beltY = isDucking ? -16 : -27;
    const beltH = isDucking ? 6 : 7;
    // Heavy brown leather strap
    ctx.fillStyle = beltColor;
    ctx.fillRect(-13, beltY, 26, beltH);
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 1;
    ctx.strokeRect(-13, beltY, 26, beltH);
    // Heavy gold weightlifting buckle
    ctx.fillStyle = beltBuckle;
    ctx.fillRect(-5, beltY - 1, 10, beltH + 2);
    ctx.strokeStyle = '#B45309';
    ctx.strokeRect(-5, beltY - 1, 10, beltH + 2);
    // Buckle cutout center
    ctx.fillStyle = '#451A03';
    ctx.fillRect(-2, beltY + 1, 4, beltH - 2);
    // Silver studs
    ctx.fillStyle = '#E5E7EB';
    ctx.fillRect(-10, beltY + 2, 2, 2);
    ctx.fillRect(8, beltY + 2, 2, 2);
    ctx.restore();

    // ==========================================
    // LAYER 4: TORSO, CHISELED ABS & BULGING PECS
    // ==========================================
    ctx.save();
    const torsoTop = isDucking ? -36 : -50;
    const torsoHeight = isDucking ? 21 : 24;
    const pecY = isDucking ? -34 : -48;
    // Torso Base
    ctx.fillStyle = skinTone;
    ctx.fillRect(-14, torsoTop, 28, torsoHeight);

    // Chiseled 6-Pack Abs (compacted during crouch)
    ctx.fillStyle = skinShadow;
    // Linea alba (center vertical divider)
    ctx.fillRect(-0.75, torsoTop + 9, 1.5, isDucking ? 10 : 13);
    // Horizontal ab dividers
    ctx.fillRect(-8, torsoTop + 13, 16, 1.2);
    if (!isDucking) {
      ctx.fillRect(-7, -31, 14, 1.2);
    }
    // Six distinct rectus abdominis muscle blocks
    ctx.fillStyle = skinHighlight;
    ctx.fillRect(-6, torsoTop + 9.5, 4.5, 2.8);
    ctx.fillRect(1.5, torsoTop + 9.5, 4.5, 2.8);
    ctx.fillRect(-5.5, torsoTop + 14, 4, 3);
    ctx.fillRect(1.5, torsoTop + 14, 4, 3);
    if (!isDucking) {
      ctx.fillRect(-5, -30, 4, 2.5);
      ctx.fillRect(1, -30, 4, 2.5);
    }

    // Bulging Pectoral Chest Muscles
    ctx.fillStyle = skinTone;
    // Left pec
    ctx.beginPath();
    ctx.roundRect(-13, pecY, 12, isDucking ? 8.5 : 10, [3, 1, 3, 4]);
    ctx.fill();
    // Right pec
    ctx.beginPath();
    ctx.roundRect(1, pecY, 12, isDucking ? 8.5 : 10, [1, 3, 4, 3]);
    ctx.fill();

    // Pec separation shadow & under-pec cleft
    ctx.fillStyle = skinShadow;
    ctx.fillRect(-0.75, pecY, 1.5, isDucking ? 8.5 : 10);
    ctx.fillRect(-13, pecY + (isDucking ? 7.5 : 9), 26, 1.5);
    // Upper pec highlights
    ctx.fillStyle = skinHighlight;
    ctx.fillRect(-11, pecY + 1.5, 8, 2);
    ctx.fillRect(3, pecY + 1.5, 8, 2);

    // Trapezius muscles rising behind neck
    ctx.fillStyle = skinShadow;
    ctx.beginPath();
    ctx.moveTo(-12, torsoTop + 2);
    ctx.lineTo(-6, torsoTop - 6);
    ctx.lineTo(6, torsoTop - 6);
    ctx.lineTo(12, torsoTop + 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // ==========================================
    // LAYER 5: HEAD, GLOWING FACE & SCULPTED JAW
    // ==========================================
    ctx.save();
    const headX = isDucking ? 2 : (isCharging ? 6 : (isHurt ? -4 : (isUppercutting ? -1 : (isDivekicking ? 4 : 0))));
    const headY = isDucking ? -38 : (isUppercutting ? -60 : (isCharging ? -48 : (isDivekicking ? -48 : -54)));

    // Granite Square Jaw & Face base
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.roundRect(headX - 10, headY - 12, 20, 20, [4, 4, 3, 3]);
    ctx.fill();

    // 5 O'clock Stubble Shadow along jawline
    ctx.fillStyle = 'rgba(120, 53, 15, 0.25)';
    ctx.fillRect(headX - 9, headY + 1, 18, 7);

    // Military Buzzcut / Flat-Top Hair
    ctx.fillStyle = '#18181B';
    // Flat top
    ctx.fillRect(headX - 10, headY - 16, 20, 5);
    // Temple fade sides
    ctx.fillRect(headX - 11, headY - 14, 2, 7);
    ctx.fillRect(headX + 9, headY - 14, 2, 7);

    // Forehead Bulging Rage Vein
    ctx.strokeStyle = skinVein;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(headX - 6, headY - 10);
    ctx.lineTo(headX - 3, headY - 8);
    ctx.lineTo(headX - 4, headY - 5);
    ctx.stroke();

    // Heavy Angry Eyebrows
    ctx.fillStyle = '#09090B';
    if (isHurt) {
      // Arched high in shock/pain
      ctx.fillRect(headX - 8, headY - 9, 6, 2.5);
      ctx.fillRect(headX + 2, headY - 9, 6, 2.5);
    } else {
      // Intensely furrowed downward v-shape
      ctx.beginPath();
      ctx.moveTo(headX - 8, headY - 9);
      ctx.lineTo(headX - 1, headY - 6);
      ctx.lineTo(headX - 1, headY - 4);
      ctx.lineTo(headX - 8, headY - 7);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(headX + 8, headY - 9);
      ctx.lineTo(headX + 1, headY - 6);
      ctx.lineTo(headX + 1, headY - 4);
      ctx.lineTo(headX + 8, headY - 7);
      ctx.fill();
    }

    // Eyes
    const eyeY = headY - 4;
    const lEyeX = headX - 5;
    const rEyeX = headX + 4;

    if (p.bossKillSatisfactionTimer > 0) {
      // Glowing Demonic Red Eyes of Doom
      ctx.fillStyle = '#EF4444';
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(lEyeX, eyeY, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(rEyeX, eyeY, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(lEyeX, eyeY, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(rEyeX, eyeY, 1.5, 0, Math.PI * 2); ctx.fill();
    } else if (isHurt) {
      // Wide shocked bloodshot eyes
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(lEyeX, eyeY, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(rEyeX, eyeY, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#DC2626';
      ctx.beginPath(); ctx.arc(lEyeX, eyeY, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(rEyeX, eyeY, 1.5, 0, Math.PI * 2); ctx.fill();
    } else {
      // Narrowed badass squint
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(lEyeX - 2.5, eyeY - 1.5, 5, 3);
      ctx.fillRect(rEyeX - 2.5, eyeY - 1.5, 5, 3);
      ctx.fillStyle = '#09090B';
      ctx.fillRect(lEyeX, eyeY - 1, 2.5, 2.5); // Pupil focused forward
      ctx.fillRect(rEyeX, eyeY - 1, 2.5, 2.5);
    }

    // Mouth / Gritted Teeth
    const mouthY = headY + 3;
    if (isUppercutting) {
      // Wide open mouth roaring up to the heavens
      ctx.fillStyle = '#450A0A';
      ctx.beginPath();
      ctx.ellipse(headX, mouthY + 1, 5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(headX - 3, mouthY - 1, 6, 2); // Top teeth
    } else if (isHurt) {
      // Grimacing yelling mouth askew
      ctx.fillStyle = '#18181B';
      ctx.fillRect(headX - 6, mouthY, 12, 4);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(headX - 5, mouthY + 0.5, 10, 1.5);
      // Sweat / pain droplets flying off head
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath(); ctx.arc(headX - 12, headY - 6, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(headX - 8, headY - 14, 2.5, 0, Math.PI * 2); ctx.fill();
    } else if (p.killSatisfactionTimer > 0 || state.victoryString !== "") {
      // Victorious grin with chewing cigar!
      ctx.fillStyle = '#09090B';
      ctx.fillRect(headX - 6, mouthY, 12, 3.5);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(headX - 5, mouthY, 10, 3);
      // Tooth lines
      ctx.fillStyle = '#09090B';
      ctx.fillRect(headX - 2, mouthY, 0.8, 3);
      ctx.fillRect(headX + 1, mouthY, 0.8, 3);
      // Victory Cigar clamped in teeth
      ctx.fillStyle = '#78350F';
      ctx.fillRect(headX + 4, mouthY - 1, 9, 3);
      ctx.fillStyle = '#EF4444'; // Glowing red cherry tip
      ctx.fillRect(headX + 13, mouthY - 1, 2.5, 3);
      // Smoke puff
      if (state.frame % 10 < 5) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath(); ctx.arc(headX + 17, mouthY - 3, 2.5, 0, Math.PI * 2); ctx.fill();
      }
    } else {
      // Clenched teeth badass snarl
      ctx.fillStyle = '#18181B';
      ctx.fillRect(headX - 6, mouthY, 12, 3);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(headX - 5, mouthY + 0.5, 10, 2);
      // Teeth separator lines
      ctx.fillStyle = '#18181B';
      ctx.fillRect(headX - 2, mouthY + 0.5, 0.8, 2);
      ctx.fillRect(headX + 1, mouthY + 0.5, 0.8, 2);
    }
    ctx.restore();

    // ==========================================
    // LAYER 6: LEAD ARM (Main Arm & Weapon)
    // ==========================================
    ctx.save();
    if (isDivekicking) {
      // Lead arm tucked tight across chest for aerodynamic dive
      ctx.fillStyle = skinTone;
      ctx.beginPath(); ctx.arc(4, -40, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(-6, -42, 12, 8);
      ctx.fillStyle = wristbandColor;
      ctx.fillRect(-8, -42, 4, 8);
      ctx.fillStyle = skinTone;
      ctx.beginPath(); ctx.arc(-11, -38, 5.5, 0, Math.PI * 2); ctx.fill();
    } else if (isUppercutting) {
      // DRAGON PUNCH / SHORYUKEN UPPERCUT POSE!
      // Lead arm launched straight up to the sky
      const fistX = 4;
      const fistY = -78;

      // Arm stretching straight up
      ctx.fillStyle = skinTone;
      // Cannonball delt
      ctx.beginPath(); ctx.arc(6, -46, 8.5, 0, Math.PI * 2); ctx.fill();
      // Bicep / Tricep vertical pillar
      ctx.fillRect(2, -66, 9, 22);
      // Vein bulging on bicep
      ctx.strokeStyle = skinVein;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(4, -52); ctx.lineTo(7, -58); ctx.lineTo(5, -64); ctx.stroke();

      // Spiked wristband
      ctx.fillStyle = wristbandColor;
      ctx.fillRect(1, -70, 11, 5);
      ctx.fillStyle = '#E5E7EB';
      ctx.fillRect(3, -69, 2, 3);
      ctx.fillRect(7, -69, 2, 3);

      // Huge clenched skyward fist
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.arc(fistX + 2.5, fistY, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = skinShadow;
      ctx.lineWidth = 1.2;
      // Knuckles facing forward
      ctx.strokeRect(fistX - 3, fistY - 6, 11, 7);

      // White/cyan spiraling speed streaks around fist
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(fistX + 2.5, fistY + 12, 14, 0, Math.PI);
      ctx.stroke();
    } else if (isCharging) {
      // SHOULDER RAMMING POSE!
      // Shoulder jutted violently forward like a bull ram
      const ramX = 14;
      const ramY = -44;
      // Massive cannonball delt
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.arc(ramX, ramY, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = skinHighlight;
      ctx.beginPath();
      ctx.arc(ramX + 3, ramY - 3, 5, 0, Math.PI * 2);
      ctx.fill();
      // Bicep flexed tightly against chest
      ctx.fillStyle = skinShadow;
      ctx.fillRect(4, ramY - 2, 12, 8);
      // Spiked wristband
      ctx.fillStyle = wristbandColor;
      ctx.fillRect(2, ramY + 3, 9, 5);
      // Clenched fist
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.arc(6, ramY + 11, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (isHurt) {
      // Lead arm knocked back
      ctx.fillStyle = skinTone;
      ctx.beginPath(); ctx.arc(6, -40, 7.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(3, -34, 8, 12);
      ctx.fillStyle = wristbandColor;
      ctx.fillRect(2, -22, 10, 4);
      ctx.fillStyle = skinTone;
      ctx.beginPath(); ctx.arc(7, -16, 5.5, 0, Math.PI * 2); ctx.fill();
    } else {
      // Walking / Standing / Ducking Aiming Pose
      const armPump = isWalking ? walkStride * 8 : 0;
      const armBaseX = isDucking ? 10 : 8;
      const armBaseY = isDucking ? -26 : -42;

      // Shoulder Delt
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.arc(armBaseX, armBaseY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = skinHighlight;
      ctx.beginPath();
      ctx.arc(armBaseX + 2, armBaseY - 2, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Upper arm / Forearm extending forward to hold weapon
      ctx.fillStyle = skinTone;
      ctx.fillRect(armBaseX - 2, armBaseY + 2, 12 + armPump * 0.3, 8);
      // Vein on bicep
      ctx.strokeStyle = skinVein;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(armBaseX, armBaseY + 3);
      ctx.lineTo(armBaseX + 5, armBaseY + 6);
      ctx.stroke();

      // Spiked wristband
      ctx.fillStyle = wristbandColor;
      ctx.fillRect(armBaseX + 8 + armPump * 0.3, armBaseY + 1, 5, 10);
      ctx.fillStyle = '#E5E7EB';
      ctx.fillRect(armBaseX + 9 + armPump * 0.3, armBaseY + 3, 2, 2);
      ctx.fillRect(armBaseX + 9 + armPump * 0.3, armBaseY + 7, 2, 2);

      // Hand / Fist gripping weapon
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.arc(armBaseX + 15 + armPump * 0.3, armBaseY + 6, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Render Equipped Weapon in Meathead's lead hand!
      const wpnX = armBaseX + 10 + armPump * 0.3;
      const wpnY = armBaseY + 2;

      ctx.save();
      if (currentWeapon === 'GUN') {
        // Heavy pump-action shotgun
        ctx.fillStyle = '#27272A';
        ctx.fillRect(wpnX, wpnY, 22, 7);
        ctx.fillStyle = '#71717A';
        ctx.fillRect(wpnX + 6, wpnY + 4, 8, 4); // Pump
        ctx.fillStyle = '#52525B';
        ctx.fillRect(wpnX + 22, wpnY + 1, 4, 3); // Muzzle
      } else if (currentWeapon === 'BOULDER') {
        // Craggy heavy rock
        ctx.fillStyle = '#854D0E';
        ctx.beginPath();
        ctx.arc(wpnX + 12, wpnY - 4, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#451A03';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (currentWeapon === 'SHOTGUN') {
        // Cryo shotgun
        ctx.fillStyle = '#0284C7';
        ctx.fillRect(wpnX, wpnY, 20, 8);
        ctx.fillStyle = '#38BDF8';
        ctx.fillRect(wpnX + 12, wpnY - 2, 4, 4);
        ctx.fillStyle = '#E0F2FE';
        ctx.fillRect(wpnX + 18, wpnY + 2, 4, 3);
      } else if (currentWeapon === 'NEEDLES') {
        // Syringe dart launcher
        ctx.fillStyle = COLORS.PROJECTILE_DART;
        ctx.fillRect(wpnX, wpnY, 20, 7);
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(wpnX + 18, wpnY + 1, 6, 5);
      } else if (currentWeapon === 'FLAMETHROWER') {
        // Industrial flamethrower
        ctx.save();
        ctx.translate(wpnX + 4, wpnY + 4);
        ctx.rotate(p.flameAngle || 0);
        ctx.fillStyle = '#3F3F46';
        ctx.fillRect(0, -4, 24, 9);
        ctx.fillStyle = '#EA580C';
        ctx.fillRect(22, -2, 5, 5); // Pilot nozzle
        ctx.restore();
      } else if (currentWeapon === 'SLUDGE') {
        // Toxic sludge launcher
        ctx.fillStyle = '#14532D';
        ctx.fillRect(wpnX, wpnY, 22, 10);
        ctx.fillStyle = '#4ADE80';
        ctx.fillRect(wpnX + 16, wpnY + 2, 6, 6);
      } else if (currentWeapon === 'TSUNAMI') {
        // Hydro cannon
        ctx.fillStyle = '#1D4ED8';
        ctx.fillRect(wpnX, wpnY, 24, 10);
        ctx.fillStyle = '#93C5FD';
        ctx.fillRect(wpnX + 18, wpnY + 2, 5, 6);
      } else if (currentWeapon === 'TASER') {
        // High voltage stun gun
        ctx.fillStyle = '#18181B';
        ctx.fillRect(wpnX, wpnY, 22, 8);
        ctx.fillStyle = COLORS.TASER_BOLT;
        ctx.fillRect(wpnX + 18, wpnY + 1, 6, 6);
      } else if (currentWeapon === 'OIL_ROCKET') {
        // Heavy military rocket launcher
        ctx.fillStyle = '#18181B';
        ctx.fillRect(wpnX - 4, wpnY - 2, 28, 10);
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.moveTo(wpnX + 24, wpnY - 2);
        ctx.lineTo(wpnX + 32, wpnY + 3);
        ctx.lineTo(wpnX + 24, wpnY + 8);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();

    // Restore local transform
    ctx.restore();

    // 7. Stun Stars Effect when Stunned
    if (gameStateRef.current.playerStunTimer > 0) {
      ctx.save();
      const starAngle = state.frame * 0.2;
      for (let s = 0; s < 3; s++) {
        const sx = p.pos.x + p.width / 2 + Math.cos(starAngle + s * 2.1) * 22;
        const sy = p.pos.y - 12 + Math.sin(starAngle + s * 2.1) * 8;
        ctx.fillStyle = '#FACC15';
        ctx.beginPath();
        ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.restore();
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return; const state = gameStateRef.current;
    if (status === GameStatus.STAGE_SELECT || status === GameStatus.START) { ctx.fillStyle = 'black'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); return; }
    const { player, enemies, projectiles, particles, blocks, camera, pickups, damageNumbers } = state;
    const colors = STAGE_COLORS[stageId || ""] || { ground: COLORS.GROUND, bg: COLORS.BG_DARK, accent: '#fff' };
    ctx.fillStyle = colors.bg; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.save(); if (state.screenShakeTimer > 0) ctx.translate((Math.random()-0.5)*15, (Math.random()-0.5)*15);
    ctx.translate(-camera.x, -camera.y);
    blocks.forEach(b => { if (b.type === 'door') ctx.fillStyle = '#555'; else if (b.type === 'pit') ctx.fillStyle = '#f00'; else { ctx.fillStyle = colors.ground; ctx.strokeStyle = colors.accent; ctx.strokeRect(b.x, b.y, b.w, b.h); } ctx.fillRect(b.x, b.type === 'door' ? b.y - state.doorOpenAmount : b.y, b.w, b.h); });
    
    // DRAW TOXIC TOMMY ENDLESS VERTICAL SHAFT BACKGROUND
    if (stageId === 'Toxic Tommy' && state.arenaLocked) {
      ctx.save();
      const arenaLeft = BOSS_DOOR_X + DOOR_WIDTH;
      const arenaRight = 7960;
      const arenaW = arenaRight - arenaLeft;

      // Dark industrial sewer shaft walls
      ctx.fillStyle = '#0a1a0f';
      ctx.fillRect(arenaLeft, -1200, arenaW, 2000);

      // Looping brick pattern moving with state.tommyScrollY
      ctx.strokeStyle = '#14301d';
      ctx.lineWidth = 1;
      const rowH = 30;
      const brickW = 60;
      const scrollOffset = state.tommyScrollY % rowH;
      for (let y = -500 + scrollOffset; y < 650; y += rowH) {
        ctx.beginPath();
        ctx.moveTo(arenaLeft, y);
        ctx.lineTo(arenaRight, y);
        ctx.stroke();
        const rowIdx = Math.floor(y / rowH);
        const xOffset = (rowIdx % 2) * (brickW / 2);
        for (let x = arenaLeft + xOffset; x < arenaRight; x += brickW) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + rowH);
          ctx.stroke();
        }
      }

      // Vertical dripping pipes
      const pipeXs = [arenaLeft + 80, arenaLeft + 220, arenaRight - 220, arenaRight - 80];
      pipeXs.forEach((px, pIdx) => {
        ctx.fillStyle = '#1c281e';
        ctx.fillRect(px, -500, 16, 1150);
        ctx.fillStyle = '#2d4732';
        ctx.fillRect(px + 3, -500, 4, 1150);
        // Slime leak dripping down pipes
        const dripY = ((-500 + state.frame * (3 + pIdx) * 2) % 900) - 200;
        ctx.fillStyle = '#2ECC71';
        ctx.beginPath();
        ctx.arc(px + 8, dripY, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Biohazard warning stripes on left and right borders
      const drawHazardWall = (wallX: number) => {
        ctx.fillStyle = '#1b241c';
        ctx.fillRect(wallX, -500, 20, 1150);
        for (let y = -500 + (state.frame % 30); y < 650; y += 30) {
          ctx.fillStyle = '#F1C40F';
          ctx.beginPath();
          ctx.moveTo(wallX, y);
          ctx.lineTo(wallX + 20, y + 15);
          ctx.lineTo(wallX + 20, y + 25);
          ctx.lineTo(wallX, y + 10);
          ctx.closePath();
          ctx.fill();
        }
      };
      drawHazardWall(arenaLeft);
      drawHazardWall(arenaRight - 20);

      ctx.restore();
    } else if (stageId && (state.arenaLocked || camera.x >= BOSS_DOOR_X - 100)) {
      drawCustomBossArena(ctx, stageId, state);
    }
    
    // DRAW VOLCANO VENTS & EFFECTS
    state.bossVolcanoTelegraphs.forEach(v => {
      ctx.save();
      ctx.globalAlpha = 0.5 + Math.sin(state.frame * 0.2) * 0.3;
      ctx.fillStyle = 'red';
      const indicatorSize = 40;
      if (v.type === 'wall') {
        const isLeft = v.pos.x < 7600;
        ctx.fillRect(v.pos.x + (isLeft ? 0 : -60), v.pos.y - 20, 60, 40);
        // Arrow
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        const ax = v.pos.x + (isLeft ? 30 : -30);
        ctx.moveTo(ax, v.pos.y - 10);
        ctx.lineTo(ax + (isLeft ? 20 : -20), v.pos.y);
        ctx.lineTo(ax, v.pos.y + 10);
        ctx.fill();
      } else {
        ctx.fillRect(v.pos.x - 30, v.pos.y - 60, 60, 60);
        // Arrow
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.moveTo(v.pos.x - 10, v.pos.y - 30);
        ctx.lineTo(v.pos.x, v.pos.y - 50);
        ctx.lineTo(v.pos.x + 10, v.pos.y - 30);
        ctx.fill();
      }
      ctx.restore();
    });

    state.bossVolcanoes.forEach(v => {
      ctx.save();
      // Draw the Vent itself
      ctx.fillStyle = '#4E342E';
      ctx.strokeStyle = '#BA4A00';
      ctx.lineWidth = 3;
      if (v.type === 'wall') {
        const isLeft = v.pos.x < 7600;
        ctx.beginPath();
        if (isLeft) {
          ctx.moveTo(v.pos.x, v.pos.y - 30);
          ctx.lineTo(v.pos.x + 25, v.pos.y - 15);
          ctx.lineTo(v.pos.x + 25, v.pos.y + 15);
          ctx.lineTo(v.pos.x, v.pos.y + 30);
        } else {
          ctx.moveTo(v.pos.x, v.pos.y - 30);
          ctx.lineTo(v.pos.x - 25, v.pos.y - 15);
          ctx.lineTo(v.pos.x - 25, v.pos.y + 15);
          ctx.lineTo(v.pos.x, v.pos.y + 30);
        }
        ctx.fill(); ctx.stroke();
        // Heat glow
        ctx.fillStyle = (state.frame % 4 === 0) ? '#FFD700' : '#FF4500';
        ctx.beginPath();
        ctx.arc(v.pos.x + (isLeft ? 5 : -5), v.pos.y, 8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(v.pos.x - 30, v.pos.y);
        ctx.lineTo(v.pos.x - 15, v.pos.y - 25);
        ctx.lineTo(v.pos.x + 15, v.pos.y - 25);
        ctx.lineTo(v.pos.x + 30, v.pos.y);
        ctx.fill(); ctx.stroke();
        // Heat glow
        ctx.fillStyle = (state.frame % 4 === 0) ? '#FFD700' : '#FF4500';
        ctx.beginPath();
        ctx.arc(v.pos.x, v.pos.y - 5, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    state.bossSteamExplosions.forEach(s => {
      ctx.save();
      ctx.globalAlpha = s.life / 45;
      const gradient = ctx.createRadialGradient(s.pos.x, s.pos.y, 0, s.pos.x, s.pos.y, s.radius);
      gradient.addColorStop(0, '#FFFFFF');
      gradient.addColorStop(0.4, '#E0F7FA');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(s.pos.x, s.pos.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // RENDER POOP TELEGRAPHS
    state.bossPoopTelegraphs.forEach(t => {
       if (Math.floor(state.frame / 4) % 2 === 0) {
          ctx.save();
          const tx = t.pos.x; // World coords
          const ty = t.pos.y; 
          // Exclamation top
          ctx.fillStyle = '#FF0000';
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(tx, ty - 40);
          ctx.lineTo(tx + 10, ty - 40);
          ctx.lineTo(tx + 5, ty - 10);
          ctx.closePath();
          ctx.fill(); ctx.stroke();
          // Poop dot
          ctx.fillStyle = '#5D4037';
          ctx.beginPath();
          ctx.moveTo(tx, ty - 5);
          ctx.quadraticCurveTo(tx + 5, ty - 15, tx + 10, ty - 5); 
          ctx.lineTo(tx + 12, ty);
          ctx.lineTo(tx - 2, ty);
          ctx.fill(); ctx.stroke();
          ctx.restore();
       }
    });

    pickups.forEach(p => { if (p.type.includes('health')) { ctx.fillStyle = 'red'; const thick = p.type === 'large_health' ? 10 : 5; ctx.fillRect(p.pos.x + p.width/2 - thick/2, p.pos.y, thick, p.height); ctx.fillRect(p.pos.x, p.pos.y + p.height/2 - thick/2, p.width, thick); } else { ctx.fillStyle = 'yellow'; const thick = p.type === 'large_ammo' ? 12 : 6; ctx.fillRect(p.pos.x + p.width/2 - thick/2, p.pos.y, thick, p.height); ctx.fillRect(p.pos.x, p.pos.y + p.height/2 - thick/2, p.width, thick); } });
    
    enemies.forEach(e => { 
      if (e.health <= 0 && !e.isBlownAway) return; 
      ctx.save(); 
      if (e.isTased && player.isTasing && player.taserTargetId === e.id) {
         ctx.translate((Math.random()-0.5)*10, (Math.random()-0.5)*10);
      }
      if (e.isBlownAway) { ctx.translate(e.pos.x + e.width / 2, e.pos.y + e.height / 2); ctx.rotate(e.rotation || 0); ctx.translate(-(e.pos.x + e.width / 2), -(e.pos.y + e.height / 2)); } 
      else if (e.type === 'boss' && state.arenaLocked && e.hitCooldown && e.hitCooldown > 0 && Math.floor(state.frame / 5) % 2 === 0) ctx.globalAlpha = 0.4; 
      
      if (e.needleCount && e.needleCount > 0) ctx.filter = `hue-rotate(${(state.frame * e.needleCount * 5) % 360}deg) saturate(2)`;
      if (e.isOiled) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#000000';
        // Apply a dark, greasy filter
        ctx.filter = (ctx.filter && ctx.filter !== 'none' ? ctx.filter + ' ' : '') + 'brightness(0.4) contrast(1.2)';
      }
      if (e.type === 'boss') { 
        if (state.bossExplosionTimer <= 0) BossLogic.drawBoss(ctx, e, stageId, state.frame); 
        const curT = (status === GameStatus.BOSS_INTRO && bossTauntText) ? bossTauntText : (state.bossVulgarityTimer > 0 ? state.bossLastVulgarity : null); 
        if (curT && state.bossExplosionTimer <= 0) { ctx.save(); ctx.font = 'bold 12px "Press Start 2P"'; ctx.fillStyle = 'white'; ctx.shadowColor = 'black'; ctx.shadowBlur = 6; ctx.textAlign = 'center'; ctx.fillText(curT, e.pos.x + e.width / 2, e.pos.y - 30); ctx.restore(); } 
        BossLogic.drawDaleDrugs(ctx, e);
      } else { 
        if (e.enemyType === 'shield') { ctx.fillStyle = '#444'; ctx.fillRect(e.pos.x + 10, e.pos.y, e.width - 10, e.height); if (e.isShieldActive) { ctx.fillStyle = '#2C3E50'; ctx.fillRect(e.pos.x, e.pos.y - 5, 15, e.height + 10); ctx.strokeStyle = '#00FFFF'; ctx.lineWidth = 2; ctx.strokeRect(e.pos.x, e.pos.y - 5, 15, e.height + 10); } else { ctx.fillStyle = '#7F8C8D'; ctx.fillRect(e.pos.x + 5, e.pos.y + 10, 10, e.height - 20); } } else if (e.id.startsWith('rusher')) ctx.fillStyle = '#9B59B6'; else if (e.enemyType === 'flyer' && e.width > 60) ctx.fillStyle = '#34495E'; else ctx.fillStyle = e.enemyType === 'flyer' ? COLORS.ENEMY_FLYER : (e.enemyType === 'drone' ? COLORS.ENEMY_DRONE : COLORS.ENEMY_TANK); 
        if (!(e.enemyType === 'shield')) ctx.fillRect(e.pos.x, e.pos.y, e.width, e.height); 
        if (e.isOiled) {
           // Greasy shine effect
           ctx.save();
           ctx.globalAlpha = 0.4;
           ctx.fillStyle = '#FFFFFF';
           const shineX = (state.frame * 2) % (e.width * 2) - e.width;
           ctx.beginPath();
           ctx.moveTo(e.pos.x + shineX, e.pos.y);
           ctx.lineTo(e.pos.x + shineX + 15, e.pos.y);
           ctx.lineTo(e.pos.x + shineX + 15 + 10, e.pos.y + e.height);
           ctx.lineTo(e.pos.x + shineX + 10, e.pos.y + e.height);
           ctx.closePath();
           ctx.clip(); // Only shine on the enemy
           ctx.fillRect(e.pos.x, e.pos.y, e.width, e.height);
           ctx.restore();
        }
      } 
      if (e.frozenTimer && e.frozenTimer > 0) { ctx.fillStyle = 'rgba(0, 255, 255, 0.4)'; ctx.fillRect(e.pos.x - 5, e.pos.y - 5, e.width + 10, e.height + 10); } 
      if (e.isTased && player.isTasing && player.taserTargetId === e.id) {
        ctx.fillStyle = 'rgba(0, 229, 255, 0.4)'; 
        ctx.fillRect(e.pos.x - 5, e.pos.y - 5, e.width + 10, e.height + 10);
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2;
        for(let j=0; j<4; j++){ ctx.beginPath(); const sx = e.width/2, sy = e.height/2; ctx.moveTo(sx, sy); ctx.lineTo(sx + (Math.random()-0.5)*100, sy + (Math.random()-0.5)*100); ctx.stroke(); }
      }
      drawStuckNeedles(ctx, e, state.frame);
      if (!e.isBlownAway) { ctx.fillStyle = '#00FF00'; ctx.fillRect(e.pos.x, e.pos.y - 10, (e.health / e.maxHealth) * e.width, 5); } 
      ctx.restore(); 
    });

    // DRAW TOXIC TOMMY FLOATING BOARDS & RISING TOXIC SLUDGE
    if (stageId === 'Toxic Tommy' && state.arenaLocked && state.tommyBoards) {
      const arenaLeft = BOSS_DOOR_X + DOOR_WIDTH;
      const arenaRight = 7960;

      // 0. Safe entrance steel catwalk right at the doorway
      ctx.save();
      const catwalkX = BOSS_DOOR_X;
      const catwalkW = 90;
      const catwalkY = 480;
      ctx.fillStyle = '#374151';
      ctx.fillRect(catwalkX, catwalkY, catwalkW, 16);
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(catwalkX, catwalkY + 16, catwalkW, 54);
      // Hazard diagonal yellow stripes along top
      for (let sx = catwalkX; sx < catwalkX + catwalkW; sx += 18) {
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.moveTo(sx, catwalkY);
        ctx.lineTo(sx + 8, catwalkY);
        ctx.lineTo(sx + 3, catwalkY + 16);
        ctx.lineTo(sx - 5, catwalkY + 16);
        ctx.closePath();
        ctx.fill();
      }
      // Steel rivets
      ctx.fillStyle = '#9CA3AF';
      ctx.fillRect(catwalkX + 8, catwalkY + 4, 4, 4);
      ctx.fillRect(catwalkX + catwalkW - 12, catwalkY + 4, 4, 4);
      ctx.restore();

      // 1. Draw the 8 Floating Boards
      state.tommyBoards.forEach((b: TommyBoard) => {
        const bobY = b.y + Math.sin(state.frame * 0.05 + b.index * 0.8) * 3;
        const bx = b.x + (b.shakeX || 0);

        if (b.status === 'shattered') {
          // Shattered: draw jagged broken wood remnants on left and right edge of the gap
          ctx.save();
          ctx.fillStyle = '#5C3A21';
          ctx.fillRect(bx, b.baseY + 4, 8, 10);
          ctx.fillRect(bx + b.w - 8, b.baseY + 4, 8, 10);
          // Bubbling acid in the gap
          ctx.fillStyle = '#ADFF2F';
          ctx.beginPath();
          ctx.arc(bx + b.w / 2, state.tommySludgeY + 4, 6 + Math.sin(state.frame * 0.2 + b.index) * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          return;
        }

        ctx.save();
        if (b.telegraphTimer && b.telegraphTimer > 0) {
          // Glowing toxic hazard telegraph under the board
          ctx.shadowColor = '#ADFF2F';
          ctx.shadowBlur = 18;
          ctx.fillStyle = 'rgba(173, 255, 47, 0.4)';
          ctx.fillRect(bx - 4, bobY - 4, b.w + 8, b.h + 8);
        }

        if (b.status === 'rising') {
          // Translucent or slime-covered as it rises from the sludge
          ctx.globalAlpha = Math.min(1.0, 0.4 + b.riseProgress * 0.6);
        }

        // Main Timber Board
        ctx.fillStyle = '#8B5A2B';
        ctx.fillRect(bx, bobY, b.w, b.h);
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, bobY, b.w, b.h);

        // Wood grain planks
        ctx.strokeStyle = '#5D4037';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx + 4, bobY + b.h / 2);
        ctx.lineTo(bx + b.w - 4, bobY + b.h / 2);
        ctx.stroke();

        // Iron end reinforcement brackets
        ctx.fillStyle = '#424242';
        ctx.fillRect(bx, bobY, 8, b.h);
        ctx.fillRect(bx + b.w - 8, bobY, 8, b.h);
        ctx.fillStyle = '#212121';
        ctx.fillRect(bx + 2, bobY + 3, 4, 4);
        ctx.fillRect(bx + 2, bobY + b.h - 7, 4, 4);
        ctx.fillRect(bx + b.w - 6, bobY + 3, 4, 4);
        ctx.fillRect(bx + b.w - 6, bobY + b.h - 7, 4, 4);

        // Toxic green moss/slime dripping off the edges
        ctx.fillStyle = '#2ECC71';
        ctx.fillRect(bx + 12, bobY + b.h - 2, 8, 5);
        ctx.fillRect(bx + b.w - 24, bobY + b.h - 2, 10, 7);

        // If shattering: splinter debris flying
        if (b.status === 'shattering') {
          ctx.fillStyle = '#D7CCC8';
          const splCount = 6;
          for (let s = 0; s < splCount; s++) {
            const sx = bx + (s * (b.w / splCount)) + (Math.random() - 0.5) * 10;
            const sy = bobY - (35 - b.shatterTimer) * 1.5;
            ctx.fillRect(sx, sy, 4, 10);
          }
        }

        // If rising: green slime cascade pouring off
        if (b.status === 'rising') {
          ctx.fillStyle = 'rgba(46, 204, 113, 0.7)';
          ctx.fillRect(bx + 4, bobY + b.h, b.w - 8, 14);
        }

        ctx.restore();
      });

      // 2. Draw the Rising Toxic Sludge (Layered animated waves + radioactive glow or crude oil discoloration)
      ctx.save();
      const sludgeY = state.tommySludgeY;
      const isOiled = state.tommySludgeOiledTimer && state.tommySludgeOiledTimer > 0;

      if (isOiled) {
        // Discolored Crude Engine Oil Sludge (semi-transparent so submerged Tommy is visible)
        ctx.fillStyle = 'rgba(10, 8, 13, 0.45)';
        ctx.fillRect(arenaLeft, sludgeY, arenaRight - arenaLeft, 300);

        const sludgeGrad = ctx.createLinearGradient(0, sludgeY, 0, sludgeY + 120);
        sludgeGrad.addColorStop(0, 'rgba(28, 19, 36, 0.55)');
        sludgeGrad.addColorStop(0.3, 'rgba(20, 12, 26, 0.6)');
        sludgeGrad.addColorStop(1, 'rgba(7, 4, 10, 0.7)');
        ctx.fillStyle = sludgeGrad;
        ctx.fillRect(arenaLeft, sludgeY + 8, arenaRight - arenaLeft, 300);

        // Back wave
        ctx.fillStyle = 'rgba(24, 16, 32, 0.45)';
        ctx.beginPath();
        ctx.moveTo(arenaLeft, sludgeY + 20);
        for (let x = arenaLeft; x <= arenaRight; x += 15) {
          const wy = sludgeY + Math.sin(x * 0.02 + state.frame * 0.04) * 6;
          ctx.lineTo(x, wy);
        }
        ctx.lineTo(arenaRight, sludgeY + 300);
        ctx.lineTo(arenaLeft, sludgeY + 300);
        ctx.closePath();
        ctx.fill();

        // Front wave
        ctx.fillStyle = 'rgba(28, 18, 38, 0.55)';
        ctx.beginPath();
        ctx.moveTo(arenaLeft, sludgeY);
        for (let x = arenaLeft; x <= arenaRight; x += 12) {
          const wy = sludgeY + Math.sin(x * 0.035 - state.frame * 0.06) * 5;
          ctx.lineTo(x, wy);
        }
        ctx.lineTo(arenaRight, sludgeY + 300);
        ctx.lineTo(arenaLeft, sludgeY + 300);
        ctx.closePath();
        ctx.fill();

        // Iridescent rainbow oil sheen crest
        ctx.strokeStyle = '#D946EF';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = arenaLeft; x <= arenaRight; x += 12) {
          const wy = sludgeY + Math.sin(x * 0.035 - state.frame * 0.06) * 5;
          if (x === arenaLeft) ctx.moveTo(x, wy);
          else ctx.lineTo(x, wy);
        }
        ctx.stroke();

        // Oil slick sheen highlights
        ctx.strokeStyle = '#06B6D4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = arenaLeft + 6; x <= arenaRight; x += 16) {
          const wy = sludgeY + 4 + Math.sin(x * 0.04 - state.frame * 0.05) * 4;
          if (x === arenaLeft + 6) ctx.moveTo(x, wy);
          else ctx.lineTo(x, wy);
        }
        ctx.stroke();

        // Oil bubbles
        for (let i = 0; i < 7; i++) {
          const bx = arenaLeft + ((i * 95 + state.frame * 1.5) % (arenaRight - arenaLeft));
          const by = sludgeY - 2 + Math.sin(state.frame * 0.1 + i * 2) * 5;
          const br = 4 + (i % 3) * 2;
          ctx.fillStyle = '#2A1838';
          ctx.beginPath();
          ctx.arc(bx, by, br, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#E879F9';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      } else {
        // Base radioactive green glow beneath surface (semi-transparent so submerged Tommy is visible)
        ctx.fillStyle = 'rgba(15, 56, 24, 0.45)';
        ctx.fillRect(arenaLeft, sludgeY, arenaRight - arenaLeft, 300);

        // Deep sludge gradient with translucent layers
        const sludgeGrad = ctx.createLinearGradient(0, sludgeY, 0, sludgeY + 120);
        sludgeGrad.addColorStop(0, 'rgba(39, 174, 96, 0.55)');
        sludgeGrad.addColorStop(0.3, 'rgba(25, 111, 61, 0.6)');
        sludgeGrad.addColorStop(1, 'rgba(11, 38, 18, 0.7)');
        ctx.fillStyle = sludgeGrad;
        ctx.fillRect(arenaLeft, sludgeY + 8, arenaRight - arenaLeft, 300);

        // Back wave
        ctx.fillStyle = 'rgba(30, 132, 73, 0.45)';
        ctx.beginPath();
        ctx.moveTo(arenaLeft, sludgeY + 20);
        for (let x = arenaLeft; x <= arenaRight; x += 15) {
          const wy = sludgeY + Math.sin(x * 0.02 + state.frame * 0.04) * 6;
          ctx.lineTo(x, wy);
        }
        ctx.lineTo(arenaRight, sludgeY + 300);
        ctx.lineTo(arenaLeft, sludgeY + 300);
        ctx.closePath();
        ctx.fill();

        // Front wave (bright radioactive slime, semi-transparent)
        ctx.fillStyle = 'rgba(46, 204, 113, 0.55)';
        ctx.beginPath();
        ctx.moveTo(arenaLeft, sludgeY);
        for (let x = arenaLeft; x <= arenaRight; x += 12) {
          const wy = sludgeY + Math.sin(x * 0.035 - state.frame * 0.06) * 5;
          ctx.lineTo(x, wy);
        }
        ctx.lineTo(arenaRight, sludgeY + 300);
        ctx.lineTo(arenaLeft, sludgeY + 300);
        ctx.closePath();
        ctx.fill();

        // Radioactive foam crest
        ctx.strokeStyle = '#ADFF2F';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = arenaLeft; x <= arenaRight; x += 12) {
          const wy = sludgeY + Math.sin(x * 0.035 - state.frame * 0.06) * 5;
          if (x === arenaLeft) ctx.moveTo(x, wy);
          else ctx.lineTo(x, wy);
        }
        ctx.stroke();

        // Popping toxic bubbles
        const bubbleCount = 7;
        for (let i = 0; i < bubbleCount; i++) {
          const bx = arenaLeft + ((i * 103 + state.frame * 2) % (arenaRight - arenaLeft));
          const by = sludgeY + Math.sin(bx * 0.035 - state.frame * 0.06) * 5 - 4;
          const bSize = 3 + Math.sin(state.frame * 0.15 + i) * 2;
          ctx.fillStyle = '#ADFF2F';
          ctx.beginPath();
          ctx.arc(bx, by, Math.max(1, bSize), 0, Math.PI * 2);
          ctx.fill();
        }

        // Rising biohazard vapor/steam particles
        ctx.fillStyle = 'rgba(173, 255, 47, 0.25)';
        for (let i = 0; i < 6; i++) {
          const vx = arenaLeft + 40 + ((i * 127 + state.frame * 1.2) % (arenaRight - arenaLeft - 80));
          const vy = sludgeY - ((state.frame * (1.5 + (i % 3) * 0.5) + i * 45) % 350);
          const vSize = 8 + (i % 4) * 3;
          ctx.beginPath();
          ctx.arc(vx, vy, vSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }
    
    if (status !== GameStatus.LEVEL_INTRO || state.introTimer >= 80) { drawPlayer(ctx, player); if (state.playerLastVulgarity && state.playerVulgarityTimer > 0 && state.bossExplosionTimer <= 0) { ctx.save(); ctx.font = 'bold 10px "Press Start 2P"'; ctx.fillStyle = 'white'; ctx.shadowColor = 'black'; ctx.shadowBlur = 4; ctx.textAlign = 'center'; ctx.fillText(state.playerLastVulgarity, player.pos.x + player.width / 2, player.pos.y - 20); ctx.restore(); } }
    
    if (player.isTasing && player.currentWeapon === 'TASER') {
      if (state.frame % 3 === 0) playGunSound('taser');
      const target = (enemies.find(en => en.id === player.taserTargetId) || projectiles.find(pr => pr.id === player.taserTargetId)) as (Enemy | Projectile | undefined);
      
      ctx.save();
      ctx.strokeStyle = COLORS.TASER_BOLT;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = COLORS.TASER_BOLT;
      const startX = player.pos.x + (player.facing === 1 ? player.width : 0);
      const startY = player.pos.y + 25;
      
      let endX, endY;
      if (target) {
        endX = target.pos.x + target.width/2;
        endY = target.pos.y + target.height/2;
      } else {
        const taserDist = 400; // Mid-range
        endX = startX + player.facing * taserDist;
        endY = startY + Math.sin(state.frame * 0.4) * 40;
      }
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      const segments = 8;
      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const px = startX + (endX - startX) * t + (Math.random() - 0.5) * 40;
        const py = startY + (endY - startY) * t + (Math.random() - 0.5) * 40;
        ctx.lineTo(px, py);
      }
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    state.projectiles.forEach(p => { 
      ctx.save();
      if (p.isBoulder) { 
        ctx.save(); ctx.translate(p.pos.x + p.width/2, p.pos.y + p.height/2); ctx.rotate(p.pos.x * 0.05); ctx.fillStyle = p.owner === 'player' ? '#8B4513' : '#4E342E'; ctx.beginPath(); const seg = 10, bR = p.width / 2; for (let i = 0; i < seg; i++) { const a = (i / seg) * Math.PI * 2, v = 0.85 + Math.abs(Math.sin(i * 3 + (p.id.length % 5))) * 0.3, r = bR * v, x = Math.cos(a) * r, y = Math.sin(a) * r; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'black'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); 
      } 
      else if (p.isSludge) {
        ctx.save();
        ctx.translate(p.pos.x + p.width/2, p.pos.y + p.height/2);
        if (p.isLingering) {
            ctx.fillStyle = '#1B5E20';
            const rx = p.width / 2;
            const ry = p.height / 2;
            const seed = (p.id.length * 123) % 1000; 
            
            // Multiple overlapping ellipses for natural look
            for (let i = 0; i < 4; i++) {
              ctx.save();
              const bx = (Math.sin(seed + i * 2) * rx * 0.3);
              const by = (Math.cos(seed + i * 2) * ry * 0.2);
              const bw = rx * (0.8 + Math.sin(seed + i) * 0.3);
              const bh = ry * (0.7 + Math.cos(seed + i) * 0.4);
              ctx.translate(bx, by);
              ctx.beginPath();
              ctx.ellipse(0, 0, bw, bh, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
            
            // Bubbles
            ctx.fillStyle = '#ADFF2F';
            for (let i = 0; i < 3; i++) {
               const bpx = Math.sin(state.frame * 0.12 + i + seed) * rx * 0.6;
               const bpy = Math.cos(state.frame * 0.12 + i + seed) * ry * 0.3;
               const bSize = 2 + Math.abs(Math.sin(state.frame * 0.05 + i)) * 3;
               ctx.beginPath(); ctx.arc(bpx, bpy, bSize, 0, Math.PI * 2); ctx.fill();
            }
        } else {
            ctx.rotate(state.frame * 0.3 + p.id.length);
            ctx.fillStyle = '#1B5E20';
            ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height);
            ctx.strokeStyle = '#ADFF2F';
            ctx.lineWidth = 2;
            ctx.strokeRect(-p.width/2, -p.height/2, p.width, p.height);
        }
        ctx.restore();
      }
      else if (p.isCocaine) { ctx.save(); ctx.translate(p.pos.x + p.width/2, p.pos.y + p.height/2); ctx.rotate(state.frame * 0.1); ctx.fillStyle = '#fff'; ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height); ctx.strokeStyle = '#ccc'; ctx.strokeRect(-p.width/2, -p.height/2, p.width, p.height); ctx.restore(); } 
      else if (p.isMethBarrel) { ctx.save(); ctx.translate(p.pos.x + p.width/2, p.pos.y + p.height/2); ctx.rotate(p.rotation || 0); ctx.fillStyle = '#111'; ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2; ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height); ctx.strokeRect(-p.width/2, -p.height/2, p.width, p.height); ctx.fillStyle = '#FFD700'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText("METH", 0, 5); ctx.restore(); } 
      else if (p.isDart) { ctx.save(); ctx.translate(p.pos.x + p.width/2, p.pos.y + p.height/2); ctx.fillStyle = COLORS.PROJECTILE_DART; ctx.fillRect(-p.width/2 + (p.vel.x > 0 ? 5 : 0), -p.height/2, p.width - 5, p.height); ctx.fillStyle = 'red'; ctx.fillRect(p.vel.x > 0 ? -p.width/2 : p.width/2 - 5, -p.height/2 - 1, 6, p.height + 2); ctx.restore(); } 
      else if (p.isDarkness) {
        ctx.save();
        ctx.translate(p.pos.x + p.width/2, p.pos.y + p.height/2);
        const pulse = 0.8 + Math.sin(state.frame * 0.15) * 0.2;
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.width/2 * pulse);
        grad.addColorStop(0, '#bd00ff');
        grad.addColorStop(0.5, '#2e1a47');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, p.width/2 * pulse * 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Core
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(0, 0, p.width/4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      else if (p.isPoop) {
        ctx.save();
        ctx.translate(p.pos.x + p.width/2, p.pos.y + p.height/2);
        ctx.rotate(state.frame * 0.2 + p.id.length);
        // Log
        ctx.fillStyle = '#5D4037';
        ctx.beginPath();
        // @ts-ignore
        if(ctx.roundRect) ctx.roundRect(-p.width/2, -p.height/2, p.width, p.height, 8);
        else ctx.rect(-p.width/2, -p.height/2, p.width, p.height);
        ctx.fill();
        ctx.strokeStyle = '#3E2723';
        ctx.stroke();
        // Corn
        ctx.fillStyle = '#FFEB3B';
        ctx.beginPath(); ctx.arc(-5, -2, 2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(4, 3, 2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(2, -4, 2, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }
      else if (p.isOilRocket) {
        ctx.save();
        ctx.translate(p.pos.x + p.width / 2, p.pos.y + p.height / 2);
        if (p.vel.x < 0) ctx.scale(-1, 1);
        
        // Rocket Body
        ctx.fillStyle = '#212121';
        ctx.fillRect(-20, -8, 30, 16);
        
        // Nose Cone
        ctx.fillStyle = '#D32F2F';
        ctx.beginPath();
        ctx.moveTo(10, -8);
        ctx.lineTo(25, 0);
        ctx.lineTo(10, 8);
        ctx.closePath();
        ctx.fill();
        
        // Fins
        ctx.fillStyle = '#757575';
        ctx.fillRect(-20, -12, 6, 4);
        ctx.fillRect(-20, 8, 6, 4);
        
        // Oil Coating / Drips visual
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-5, 8, 4, 0, Math.PI * 2);
        ctx.arc(5, -8, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(-15, -4, 20, 2);
        
        ctx.restore();
      }
      else { ctx.fillStyle = (p.isIce) ? COLORS.PROJECTILE_ICE : (p.owner === 'player' ? COLORS.PROJECTILE_PLAYER : COLORS.PROJECTILE_ENEMY); ctx.fillRect(p.pos.x, p.pos.y, p.width, p.height); } 
      ctx.restore();
    });
    
    particles.forEach(p => { ctx.save(); if (!p.isStuck) ctx.globalAlpha = p.life < 100 ? p.life / 100 : 1; else ctx.globalAlpha = 0.85; ctx.fillStyle = p.color; ctx.fillRect(p.pos.x, p.pos.y, p.size, p.size); ctx.restore(); });
    damageNumbers.forEach(d => { 
      ctx.save(); 
      ctx.globalAlpha = d.life / d.maxLife; 
      const txt = d.text || (d.value !== undefined ? d.value.toString() : "");
      ctx.font = `bold ${d.isCritical ? (d.text ? '32px' : '24px') : '16px'} "Press Start 2P"`; 
      ctx.fillStyle = d.color || (d.isCritical ? '#FFD700' : (d.value && d.value > 50 ? '#FF4500' : '#FFFFFF')); 
      ctx.textAlign = 'center'; 
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 4;
      ctx.fillText(txt, d.pos.x, d.pos.y); 
      ctx.restore(); 
    });

    // BLACKOUT OVERLAY for Blackout Barry
    const isBarryStage = stageId === 'Blackout Barry';
    const activeBarry = enemies.find(e => e.type === 'boss' && e.health > 0);
    
    // Only show darkness during the teleporting phase, never during attacks or preparation
    const shouldShowBlackout = isBarryStage && activeBarry && activeBarry.bossState === 'blackout_teleport';

    if (shouldShowBlackout) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      // Subtle darkness so Barry's teleportation is mysterious without hiding the arena
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();
    } else if (isBarryStage && activeBarry) {
      if (activeBarry.bossState === 'ground_pound' && (activeBarry.electrifiedTimer || 0) > 0) {
        // Half-second electrified flash lighting up the room when he lands
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const pulse = 0.22 + 0.12 * Math.sin(state.frame * 0.8);
        ctx.fillStyle = `rgba(0, 229, 255, ${pulse})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.restore();
      } else if (activeBarry.bossState === 'lightning_storm' && activeBarry.activeLightningStrikes && activeBarry.activeLightningStrikes.length > 0) {
        // Light up the screen as lightning strikes persist
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.restore();
      }
    }

    ctx.restore();
    
    if (state.victoryString && (status === GameStatus.PLAYING || status === GameStatus.VICTORY)) { ctx.save(); ctx.font = 'bold 50px "Press Start 2P"'; ctx.fillStyle = 'yellow'; ctx.textAlign = 'center'; ctx.strokeStyle = 'black'; ctx.lineWidth = 4; ctx.strokeText(state.victoryString, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2); ctx.fillText(state.victoryString, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2); ctx.restore(); }
    if (state.deathTimer > 0 && state.deathString) {
      ctx.save();
      const maxAllowedWidth = CANVAS_WIDTH - 80;
      let fontSize = 48;
      ctx.font = `bold ${fontSize}px "Press Start 2P"`;
      
      let measured = ctx.measureText(state.deathString).width;
      if (measured > maxAllowedWidth) {
        fontSize = Math.floor(fontSize * (maxAllowedWidth / measured));
      }
      
      // If font size becomes too small (< 22px), split into wrapped lines
      if (fontSize < 22) {
        const words = state.deathString.split(' ');
        const lines: string[] = [];
        let curLine = '';
        for (const w of words) {
          const testLine = curLine ? `${curLine} ${w}` : w;
          ctx.font = 'bold 30px "Press Start 2P"';
          if (ctx.measureText(testLine).width > maxAllowedWidth && curLine) {
            lines.push(curLine);
            curLine = w;
          } else {
            curLine = testLine;
          }
        }
        if (curLine) lines.push(curLine);

        let wrapFontSize = 30;
        lines.forEach(l => {
          ctx.font = `bold ${wrapFontSize}px "Press Start 2P"`;
          const w = ctx.measureText(l).width;
          if (w > maxAllowedWidth) {
            wrapFontSize = Math.floor(wrapFontSize * (maxAllowedWidth / w));
          }
        });
        wrapFontSize = Math.max(16, wrapFontSize);

        ctx.font = `bold ${wrapFontSize}px "Press Start 2P"`;
        ctx.fillStyle = '#FF0000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(3, Math.round(wrapFontSize / 6));
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 8;

        const lineHeight = wrapFontSize * 1.5;
        const startY = (CANVAS_HEIGHT / 2) - ((lines.length - 1) * lineHeight) / 2;
        lines.forEach((line, idx) => {
          const y = startY + idx * lineHeight;
          ctx.strokeText(line, CANVAS_WIDTH / 2, y);
          ctx.fillText(line, CANVAS_WIDTH / 2, y);
        });
      } else {
        ctx.font = `bold ${fontSize}px "Press Start 2P"`;
        ctx.fillStyle = '#FF0000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(4, Math.round(fontSize / 6));
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 8;
        ctx.strokeText(state.deathString, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.fillText(state.deathString, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      }
      ctx.restore();
    }
  }, [status, stageId, onBossDefeated, currentWeapon, respawn, invincibilityEnabled, infiniteAmmoEnabled, infinitePowerEnabled, jumpToBossEnabled, bossTauntText, onPlayerUpdate, spawnDamageNumber, spawnDeathShower, speakVulgarity, playGunSound, spawnExplosion, spawnSteamExplosionParticles, spawnPoopExplosion, spawnPowderExplosion, spawnMethExplosion, spawnGlassShatter, onBossDeath, onIntroComplete, onBossEncounter, onBossTransition]);

  const updateRef = useRef(update);
  updateRef.current = update;
  const drawRef = useRef(draw);
  drawRef.current = draw;

  useEffect(() => {
    let frameId: number;
    let isRunning = true;

    // Fixed 60 FPS timestep (1000 / 60 = 16.6667ms per tick)
    const TARGET_FPS = 60;
    const STEP = 1000 / TARGET_FPS;
    let lastTime = 0;

    const loop = (currentTime: number) => {
      if (!isRunning) return;

      if (lastTime === 0) {
        lastTime = currentTime;
      }

      const elapsed = currentTime - lastTime;

      // Throttle to 60 FPS with a 2ms margin to prevent jitter on 60Hz displays
      if (elapsed >= STEP - 2) {
        updateRef.current();
        drawRef.current();
        lastTime = currentTime - Math.min(elapsed % STEP, STEP);
      }

      frameId = window.requestAnimationFrame(loop);
    };

    if (status !== GameStatus.START && status !== GameStatus.STAGE_SELECT) { 
        if (gameStateRef.current.frame === 0 && status === GameStatus.LEVEL_INTRO) { 
            const s = gameStateRef.current;
            s.victoryString = ""; s.postVictoryTimer = 0; s.bossExplosionTimer = 0; s.introTimer = 0; 
            s.particles = []; s.projectiles = []; s.pickups = []; s.enemies = []; s.damageNumbers = []; 
            s.camera = { x: 0, y: 0 }; s.player.health = INITIAL_PLAYER_HEALTH; 
            s.player.killSatisfactionTimer = 0; s.player.bossKillSatisfactionTimer = 0;
            s.player.invincibilityTimer = 0; s.player.pushbackTimer = 0;
            s.player.filthShieldTimer = 0; s.player.barfTimer = 0; s.player.flameTimer = 0;
            s.player.isTasing = false; s.player.taserTargetId = null; s.player.taserTimer = 0;
            s.player.isCharging = false; s.player.isUppercutting = false; s.player.isDivekicking = false;
            s.playerStunTimer = 0;
            s.hurtVoiceCooldown = 0;
            isMeatheadSpeakingRef.current = false;
            createLevel(); 
            s.frame = 1; 
        } 
        lastTime = 0;
        frameId = window.requestAnimationFrame(loop); 
    } 
    else { 
        const s = gameStateRef.current;
        s.victoryString = ""; s.postVictoryTimer = 0; s.bossExplosionTimer = 0; s.introTimer = 0; 
        s.enemies = []; s.particles = []; s.projectiles = []; s.blocks = []; s.camera = { x: 0, y: 0 }; 
        s.playerLastVulgarity = ""; s.playerVulgarityTimer = 0; s.bossLastVulgarity = ""; s.bossVulgarityTimer = 0;
        s.bossVolcanoes = []; s.bossVolcanoTelegraphs = []; s.bossPoopTelegraphs = []; s.bossSteamExplosions = [];
        s.victorWallSide = 0; s.tsunamiActive = false; s.screenShakeTimer = 0; s.ernieVibrationTimer = 0;
        s.frame = 0;
        s.hurtVoiceCooldown = 0;
        isMeatheadSpeakingRef.current = false;
        s.player.killSatisfactionTimer = 0; s.player.bossKillSatisfactionTimer = 0;
        s.player.filthShieldTimer = 0; s.player.barfTimer = 0; s.player.flameTimer = 0;
        s.player.isTasing = false; s.player.taserTargetId = null; s.player.taserTimer = 0;
        s.player.isCharging = false; s.player.isUppercutting = false; s.player.isDivekicking = false;
        s.playerStunTimer = 0;
        drawRef.current(); 
    }
    return () => {
      isRunning = false;
      window.cancelAnimationFrame(frameId);
    };
  }, [status, createLevel, jumpToBossEnabled]);

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="block bg-black w-[800px] h-[600px]" />;
};

export default GameCanvas;
