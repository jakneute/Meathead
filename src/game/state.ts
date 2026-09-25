import {
  Player, Enemy, Projectile, Particle, Pickup, DamageNumber, Block, Volcano,
  SteamExplosion, PoopTelegraph, TommyBoard, Vector2, WeaponType, FlameSegment,
} from '../types';
import { INITIAL_PLAYER_HEALTH, SCREEN_SHAKE_MAX } from '../constants';

export type DoorState = 'closed' | 'opening' | 'open' | 'closing' | 'done';

/** Everything the simulation mutates each frame. Lives in a ref, outside React. */
export interface GameState {
  stageId: string | null;
  frame: number;
  /** Drives Meathead's animations; only advances during live gameplay. */
  playerAnimFrame: number;

  player: Player;
  enemies: Enemy[];
  projectiles: Projectile[];
  flameSegments: FlameSegment[];
  pickups: Pickup[];
  particles: Particle[];
  damageNumbers: DamageNumber[];
  blocks: Block[];
  camera: Vector2;

  // Boss door & arena
  arenaLocked: boolean;
  doorOpenAmount: number;
  doorState: DoorState;

  // Speech bubbles & voice
  playerLastVulgarity: string;
  playerVulgarityTimer: number;
  bossLastVulgarity: string;
  bossVulgarityTimer: number;
  /** Frames until a boss may react to a weapon hit again. */
  bossReactionCooldown: number;
  voiceLineCooldown: number;
  hurtVoiceCooldown: number;
  isMeatheadSpeaking: boolean;

  // Level flow
  introTimer: number;
  deathTimer: number;
  deathString: string;
  victoryString: string;
  postVictoryTimer: number;
  bossExplosionTimer: number;
  bossExplosionPos: Vector2;
  /** Forces React to switch the equipped weapon back to GUN (after respawn). */
  shouldSyncWeapon: boolean;

  // Player-fired tsunami
  tsunamiActive: boolean;
  tsunamiX: number;
  tsunamiStartX: number;
  tsunamiDir: number;

  // Boss hazards
  bossVolcanoes: Volcano[];
  bossVolcanoTelegraphs: Volcano[];
  bossPoopTelegraphs: PoopTelegraph[];
  bossSteamExplosions: SteamExplosion[];
  victorWallSide: number;
  ernieVibrationTimer: number;
  /** Horizontal pull applied to the player this frame (Hector's hurricane). */
  totalPullForceX: number;

  // Toxic Tommy arena
  tommyBoards: TommyBoard[];
  tommySludgeY: number;
  tommySludgeOiledTimer: number;
  tommyScrollY: number;

  playerStunTimer: number;
  screenShakeTimer: number;
  /** Max camera offset in pixels while screenShakeTimer runs. */
  screenShakeMagnitude: number;
}

export const createPlayer = (ammo: Record<WeaponType, number>): Player => ({
  id: 'player',
  pos: { x: 150, y: 100 },
  vel: { x: 0, y: 0 },
  width: 44,
  height: 64,
  health: INITIAL_PLAYER_HEALTH,
  maxHealth: INITIAL_PLAYER_HEALTH,
  type: 'player',
  facing: 1,
  isGrounded: false,
  isDucking: false,
  coyoteAirTimer: 0,
  coyoteJumpTimer: 0,
  jumpBufferTimer: 0,
  jumpHoldTimer: 0,
  isCharging: false,
  isSliding: false,
  isUppercutting: false,
  isDivekicking: false,
  chargeFace: 1,
  chargeTimer: 0,
  chargeCooldown: 0,
  chargeUsed: false,
  uppercutTimer: 0,
  uppercutCooldown: 0,
  uppercutUsed: false,
  diveKickSpeedX: 0,
  uppercutHitIds: [],
  diveKickHitIds: [],
  lockTimer: 0,
  recoiling: false,
  jumpHeldLastFrame: false,
  specialHeldLastFrame: false,
  shootHeldLastFrame: false,
  shootCooldown: 0,
  invincibilityTimer: 0,
  pushbackTimer: 0,
  killSatisfactionTimer: 0,
  bossKillSatisfactionTimer: 0,
  currentWeapon: 'GUN',
  availableWeapons: ['GUN'],
  weaponAmmo: { ...ammo },
  isTasing: false,
  taserTargetId: null,
  taserTimer: 0,
  isFlaming: false,
  flameAngle: 0,
  flameRange: 0,
  flameDrainTimer: 0,
  filthShieldTimer: 0,
  barfTimer: 0,
});

export const TOMMY_SLUDGE_Y = 510;
export const DEFAULT_SHAKE = SCREEN_SHAKE_MAX / 2;

/** Shakes the camera for at least `frames`, at least as hard as `magnitude`. */
export const shakeScreen = (s: GameState, frames: number, magnitude: number = DEFAULT_SHAKE) => {
  s.screenShakeMagnitude = s.screenShakeTimer > 0 ? Math.max(s.screenShakeMagnitude, magnitude) : magnitude;
  s.screenShakeTimer = Math.max(s.screenShakeTimer, frames);
};

export const createGameState = (stageId: string | null, ammo: Record<WeaponType, number>): GameState => ({
  stageId,
  frame: 0,
  playerAnimFrame: 0,
  player: createPlayer(ammo),
  enemies: [],
  projectiles: [],
  flameSegments: [],
  pickups: [],
  particles: [],
  damageNumbers: [],
  blocks: [],
  camera: { x: 0, y: 0 },
  arenaLocked: false,
  doorOpenAmount: 0,
  doorState: 'closed',
  playerLastVulgarity: "",
  playerVulgarityTimer: 0,
  bossLastVulgarity: "",
  bossVulgarityTimer: 0,
  bossReactionCooldown: 0,
  voiceLineCooldown: 0,
  hurtVoiceCooldown: 0,
  isMeatheadSpeaking: false,
  introTimer: 0,
  deathTimer: 0,
  deathString: "",
  victoryString: "",
  postVictoryTimer: 0,
  bossExplosionTimer: 0,
  bossExplosionPos: { x: 0, y: 0 },
  shouldSyncWeapon: false,
  tsunamiActive: false,
  tsunamiX: -1,
  tsunamiStartX: 0,
  tsunamiDir: 1,
  bossVolcanoes: [],
  bossVolcanoTelegraphs: [],
  bossPoopTelegraphs: [],
  bossSteamExplosions: [],
  victorWallSide: 0,
  ernieVibrationTimer: 0,
  totalPullForceX: 0,
  tommyBoards: [],
  tommySludgeY: TOMMY_SLUDGE_Y,
  tommySludgeOiledTimer: 0,
  tommyScrollY: 0,
  playerStunTimer: 0,
  screenShakeTimer: 0,
  screenShakeMagnitude: DEFAULT_SHAKE,
});

/** Cancels any attack, special move or weapon effect the player is in the middle of. */
export const resetPlayerCombatState = (player: Player) => {
  player.filthShieldTimer = 0;
  player.barfTimer = 0;
  player.isFlaming = false;
  player.flameRange = 0;
  player.isTasing = false;
  player.taserTargetId = null;
  player.taserTimer = 0;
  player.isCharging = false;
  player.isUppercutting = false;
  player.isDivekicking = false;
  player.isSliding = false;
  player.pushbackTimer = 0;
  player.lockTimer = 0;
  player.recoiling = false;
};

/**
 * Wipes everything tied to the current attempt at a stage: entities, hazards,
 * timers and speech. Used when leaving to the menu, starting a stage and respawning.
 * The level itself is rebuilt separately by buildLevel().
 */
export const resetStageState = (s: GameState) => {
  s.enemies = [];
  s.projectiles = [];
  s.flameSegments = [];
  s.pickups = [];
  s.particles = [];
  s.damageNumbers = [];
  s.blocks = [];
  s.camera = { x: 0, y: 0 };

  s.arenaLocked = false;
  s.doorState = 'closed';
  s.doorOpenAmount = 0;

  s.playerLastVulgarity = "";
  s.playerVulgarityTimer = 0;
  s.bossLastVulgarity = "";
  s.bossVulgarityTimer = 0;
  s.bossReactionCooldown = 0;
  s.hurtVoiceCooldown = 0;
  s.isMeatheadSpeaking = false;

  s.introTimer = 0;
  s.deathTimer = 0;
  s.deathString = "";
  s.victoryString = "";
  s.postVictoryTimer = 0;
  s.bossExplosionTimer = 0;

  s.tsunamiActive = false;
  s.bossVolcanoes = [];
  s.bossVolcanoTelegraphs = [];
  s.bossPoopTelegraphs = [];
  s.bossSteamExplosions = [];
  s.victorWallSide = 0;
  s.ernieVibrationTimer = 0;

  s.tommyBoards = [];
  s.tommySludgeY = TOMMY_SLUDGE_Y;
  s.tommySludgeOiledTimer = 0;
  s.tommyScrollY = 0;

  s.playerStunTimer = 0;
  s.screenShakeTimer = 0;

  const p = s.player;
  resetPlayerCombatState(p);
  p.health = INITIAL_PLAYER_HEALTH;
  p.invincibilityTimer = 0;
  p.isGrounded = false;
  p.coyoteAirTimer = 0;
  p.coyoteJumpTimer = 0;
  p.jumpHoldTimer = 0;
  p.chargeCooldown = 0;
  p.chargeUsed = false;
  p.uppercutCooldown = 0;
  p.uppercutUsed = false;
  p.killSatisfactionTimer = 0;
  p.bossKillSatisfactionTimer = 0;
};
