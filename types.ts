
export enum GameStatus {
  START = 'START',
  STAGE_SELECT = 'STAGE_SELECT',
  LEVEL_INTRO = 'LEVEL_INTRO',
  PLAYING = 'PLAYING',
  BOSS_TRANSITION = 'BOSS_TRANSITION',
  BOSS_INTRO = 'BOSS_INTRO',
  BOSS_VICTORY_SPEECH = 'BOSS_VICTORY_SPEECH',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
  PAUSED = 'PAUSED'
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  pos: Vector2;
  vel: Vector2;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  type: 'player' | 'enemy' | 'projectile' | 'boss';
}

export type WeaponType = 'GUN' | 'BOULDER' | 'SHOTGUN' | 'FLAMETHROWER' | 'TSUNAMI' | 'NEEDLES' | 'TASER' | 'SLUDGE' | 'OIL_ROCKET';

export type VulgarityType = 'gun_kill' | 'boulder_kill' | 'shotgun_kill' | 'flamethrower_kill' | 'tsunami_kill' | 'hurt' | 'death' | 'charge_kill' | 'uppercut_kill' | 'dart_kill' | 'taser_kill' | 'sludge_kill' | 'oil_kill';

export interface Player extends Entity {
  isCharging: boolean;
  isUppercutting: boolean;
  isDivekicking?: boolean;
  isDucking: boolean;
  specialCharges: number;
  specialChargeTimer: number;
  chargeDuration: number;
  isJumping: boolean;
  isGrounded: boolean;
  facing: 1 | -1;
  shootCooldown: number;
  jumpPrepTimer: number;
  landTimer: number;
  invincibilityTimer: number;
  pushbackTimer: number;
  hurtTimer?: number;
  smugTimer?: number;
  isHarmlessPushback?: boolean;
  killSatisfactionTimer: number;
  bossKillSatisfactionTimer: number;
  hasUsedAirMove: boolean;
  jumpInputReleased: boolean;
  chargeInputReleased: boolean;
  currentWeapon: WeaponType;
  availableWeapons: WeaponType[];
  weaponAmmo: Record<WeaponType, number>;
  // Filth Shield
  filthShieldTimer?: number;
  // Flamethrower specific
  flameTimer?: number;
  flameAngle?: number;
  // Taser specific
  isTasing?: boolean;
  taserTargetId?: string | null;
  taserTimer?: number;
  // Sludge specific
  barfTimer?: number;
}

export interface Enemy extends Entity {
  enemyType: 'drone' | 'tank' | 'turret' | 'flyer' | 'shield';
  behavior: 'patrol' | 'shoot' | 'hover' | 'fly';
  patrolRange: number;
  initialX: number;
  initialY?: number;
  shootTimer: number;
  isShieldActive?: boolean;
  hitCooldown?: number;
  frozenTimer?: number;
  sludgeTimer?: number;
  isBlownAway?: boolean;
  rotation?: number;
  // Dart/DOT Fields
  needleCount?: number;
  needleOffsets?: { x: number, y: number, rot: number }[];
  dotTimer?: number;
  needleTimer?: number;
  // Taser/Fire/Oil Fields
  isTased?: boolean;
  isOnFire?: boolean;
  fireTimer?: number;
  isOiled?: boolean;
  oiledTimer?: number;
  enemyCollisionCooldown?: number;
  // Boss fields
  bossState?: 'idle' | 'jumping' | 'attacking' | 'hurricane' | 'telegraphing' | 'stunned_drop' | 'truck_incoming' | 'using_shipment' | 'speed_dash' | 'shooting' | 'teleporting' | 'blackout' | 'blackout_teleport' | 'ground_pound' | 'lightning_storm' | 'exhausted' | 'submerged_chase' | 'telegraph_emerge' | 'emerge_shatter' | 'puke_closing_in' | 'puke_going_outward' | 'vulnerable_idle' | 'dive_in_sludge' | 'weakness_stunned';
  stateTimer?: number;
  jumpCount?: number;
  pauseTimer?: number;
  isGroundedBoss?: boolean;
  sideTimer?: number;
  said75?: boolean;
  said50?: boolean;
  said25?: boolean;
  // Dale Specifics
  shipmentType?: 'cocaine' | 'speed' | 'meth';
  shipmentCount?: number;
  dashCount?: number;
  truckX?: number;
  truckActive?: boolean;
  // Blackout Barry Specifics
  electrifiedTimer?: number;
  activeLightningStrikes?: { x: number; duration: number; maxDuration: number; width: number }[];
  // Toxic Tommy Specifics
  targetedBoardIndex?: number;
  pukeSweepProgress?: number;
  pukeType?: 'closing_in' | 'going_outward';
  pukeDir?: number;
  emergeY?: number;
}

export interface TommyBoard {
  index: number;
  x: number;
  baseY: number;
  y: number;
  w: number;
  h: number;
  status: 'active' | 'shattering' | 'shattered' | 'rising';
  shatterTimer: number;
  riseProgress: number;
  shakeX: number;
  telegraphTimer: number;
}

export interface Projectile extends Entity {
  damage: number;
  owner: 'player' | 'enemy';
  isBoulder?: boolean;
  isIce?: boolean;
  isTsunami?: boolean;
  isShrapnel?: boolean;
  isPoop?: boolean;
  isDart?: boolean;
  isCocaine?: boolean;
  isMethBarrel?: boolean;
  isSludge?: boolean;
  isOilRocket?: boolean;
  isDarkness?: boolean;
  isLingering?: boolean;
  isSliding?: boolean;
  life?: number;
  bounceDecay?: number;
  spawnX?: number;
  bounces?: number;
  rotation?: number;
  // Dynamic reaction fields
  isTased?: boolean;
  isOnFire?: boolean;
  fireTimer?: number;
}

export interface Volcano {
  pos: Vector2;
  life: number;
  type: 'wall' | 'ground';
}

export interface SteamExplosion {
  pos: Vector2;
  life: number;
  radius: number;
}

export type PickupType = 'small_health' | 'large_health' | 'small_ammo' | 'large_ammo';

export interface Pickup {
  id: string;
  pos: Vector2;
  vel: Vector2;
  width: number;
  height: number;
  type: PickupType;
  life: number;
}

export interface Particle {
  pos: Vector2;
  vel: Vector2;
  life: number;
  color: string;
  size: number;
  isGlass?: boolean;
  isWater?: boolean;
  isBossGore?: boolean;
  isStuck?: boolean;
}

export interface DamageNumber {
  id: string;
  value?: number;
  text?: string;
  pos: Vector2;
  vel: Vector2;
  life: number;
  maxLife: number;
  isCritical: boolean;
  color?: string;
}
