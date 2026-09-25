export enum GameStatus {
  START = 'START',
  STAGE_SELECT = 'STAGE_SELECT',
  LEVEL_INTRO = 'LEVEL_INTRO',
  PLAYING = 'PLAYING',
  BOSS_TRANSITION = 'BOSS_TRANSITION',
  BOSS_INTRO = 'BOSS_INTRO',
  BOSS_VICTORY_SPEECH = 'BOSS_VICTORY_SPEECH',
  VICTORY = 'VICTORY',
  PAUSED = 'PAUSED'
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
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

export type SoundType = 'gun' | 'ice' | 'flame' | 'tsunami' | 'dart' | 'horn' | 'ignite' | 'barf' | 'oil' | 'taser';

export interface Player extends Entity {
  facing: 1 | -1;
  isGrounded: boolean;
  isDucking: boolean;

  // Jumping (see JUMP_* / COYOTE_* constants)
  coyoteAirTimer: number;
  coyoteJumpTimer: number;
  jumpBufferTimer: number;
  jumpHoldTimer: number;

  // Special moves
  isCharging: boolean;
  isSliding: boolean;
  isUppercutting: boolean;
  isDivekicking?: boolean;
  chargeFace: 1 | -1;
  chargeTimer: number;
  chargeCooldown: number;
  chargeUsed: boolean;        // one charge per airtime
  uppercutTimer: number;
  uppercutCooldown: number;
  uppercutUsed: boolean;      // one uppercut per airtime
  diveKickSpeedX: number;
  uppercutHitIds: string[];   // enemies already hit by the current uppercut
  diveKickHitIds: string[];   // enemies already stomped by the current divekick

  // Hit mid-special: which move was interrupted, and the recovery animation's timer
  hurtForm?: 'slide' | 'charge' | 'uppercut' | 'divekick' | null;
  hurtFormTimer?: number;
  /** Squash (+) / stretch (-) amount for landing and jumping, decays to 0. */
  squash?: number;

  // Recoil from bouncing off an enemy (controls locked while lockTimer runs)
  lockTimer: number;
  recoiling: boolean;

  // Previous frame's buttons, for detecting presses
  jumpHeldLastFrame: boolean;
  specialHeldLastFrame: boolean;
  shootHeldLastFrame: boolean;

  shootCooldown: number;
  invincibilityTimer: number;
  /** Knockback from taking damage; input is ignored while it runs. */
  pushbackTimer: number;
  hurtTimer?: number;
  smugTimer?: number;
  isHarmlessPushback?: boolean;
  killSatisfactionTimer: number;
  bossKillSatisfactionTimer: number;
  currentWeapon: WeaponType;
  availableWeapons: WeaponType[];
  weaponAmmo: Record<WeaponType, number>;
  // Filth Shield
  filthShieldTimer?: number;
  // Flamethrower
  isFlaming?: boolean;         // stream active: locks facing
  flameAngle?: number;         // current aim in radians (negative = up)
  flameRange?: number;         // current stream length
  flameDrainTimer?: number;
  // Taser
  isTasing?: boolean;
  taserTargetId?: string | null;
  taserTimer?: number;
  /** Frames until the taser works again (it overloads after bursting Oily Oscar). */
  taserOverloadTimer?: number;
  // Sludge
  barfTimer?: number;
}

export type BossState =
  | 'idle' | 'jumping' | 'attacking' | 'hurricane' | 'telegraphing' | 'stunned_drop'
  | 'truck_incoming' | 'using_shipment' | 'speed_dash' | 'shooting' | 'teleporting'
  | 'blackout' | 'blackout_teleport' | 'ground_pound' | 'lightning_storm' | 'exhausted'
  | 'submerged_chase' | 'telegraph_emerge' | 'emerge_shatter' | 'puke_closing_in'
  | 'puke_going_outward' | 'vulnerable_idle' | 'dive_in_sludge' | 'weakness_stunned'
  | 'aiming' | 'flicking' | 'taser_held' | 'ash_face' | 'high';

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
  pauseTimer?: number;
  // Needle / DOT
  needleCount?: number;
  needleOffsets?: { x: number, y: number, rot: number }[];
  dotTimer?: number;
  needleTimer?: number;
  // Taser / fire / oil
  isTased?: boolean;
  isOnFire?: boolean;
  fireTimer?: number;
  isOiled?: boolean;
  oiledTimer?: number;
  enemyCollisionCooldown?: number;
  // Boss
  bossState?: BossState;
  stateTimer?: number;
  jumpCount?: number;
  isGroundedBoss?: boolean;
  sideTimer?: number;
  said75?: boolean;
  said50?: boolean;
  said25?: boolean;
  // Drug Trade Dale
  shipmentType?: 'cocaine' | 'speed' | 'meth';
  shipmentCount?: number;
  dashCount?: number;
  truckX?: number;
  truckActive?: boolean;
  // Blackout Barry
  electrifiedTimer?: number;
  /** Frames left in which needles just bounce off him (after an overload). */
  toleranceTimer?: number;
  activeLightningStrikes?: { x: number; duration: number; maxDuration: number; width: number }[];
  // Toxic Tommy
  targetedBoardIndex?: number;
  pukeSweepProgress?: number;
  pukeType?: 'closing_in' | 'going_outward';
  pukeDir?: number;
  emergeY?: number;
  // Oily Oscar
  oscarFacing?: 1 | -1;
  slideTargetX?: number;
  aimX?: number;              // where the laser sight points (world)
  aimY?: number;
  lockProgress?: number;      // 0..1, fires at 1
  fireWarning?: number;       // frames left in the blinking "about to fire" window
  aimFrames?: number;
  hasCigarette?: boolean;
  impactX?: number;           // where his last rocket hit (the cigarette goes there)
  impactY?: number;
  taserHold?: number;         // frames held by the taser
  taserHeldThisFrame?: boolean;
  taserGrace?: number;
  fireHurtTimer?: number;
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
  isOscarRocket?: boolean;
  isCigarette?: boolean;
  /** Frames the taser has been on this cigarette. */
  zapFrames?: number;
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

/** One piece of the flamethrower stream (GML oMoltenStream). */
export interface FlameSegment {
  x: number;
  y: number;
  size: number;
  gap: number;
  dirX: number;
  dirY: number;
  life: number;
  alpha: number;
  density: number;
}

/** A strip of oil left on a floor, ceiling or wall by Oily Oscar's rockets. */
export interface OilCell {
  surface: 'floor' | 'ceiling' | 'left' | 'right';
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
  life: number;
  /** Frames of fire left (0 = not burning). */
  burn: number;
  /** Frames until fire spreading from a neighbour reaches it (-1 = none coming). */
  igniteIn: number;
}

export type BlockType = 'wall' | 'ground' | 'platform' | 'door' | 'pit';

export interface Block extends Rect {
  type: BlockType;
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

export interface PoopTelegraph {
  pos: Vector2;
  life: number;
  spawnX: number;
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
  /** Big kill callout ("SPLAT!"): pops in and floats instead of falling. */
  isCallout?: boolean;
}
