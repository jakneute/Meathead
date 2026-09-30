import type { EnemyDeath } from '../enemies/deaths';
import type { VulgarityType } from '../../types';
import {
  Player, Enemy, Projectile, Particle, Pickup, DamageNumber, Block, Volcano,
  SteamExplosion, PoopTelegraph, TommyBoard, Vector2, WeaponType, FlameSegment, OilCell, Icicle,
} from '../../types';
import { INITIAL_PLAYER_HEALTH, POWER_CELLS, SCREEN_SHAKE_MAX } from '../../constants';
import { resetLineCooldowns, stopDeathAnnouncer } from '../platform/speech';
import type { GroundRun } from './terrain';

export type DoorState = 'closed' | 'opening' | 'open' | 'closing' | 'done';

/** A boss killed with his weakness, left wrecked in the arena (see render/bosses/corpses.ts). */
export interface BossCorpse {
  stageId: string;
  weapon: WeaponType;
  x: number;       // centre
  y: number;       // the floor he's lying on
  facing: 1 | -1;  // which way he fell
  frame0: number;  // when he died
}

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
  /** Special kill animations playing where regular enemies died (charred, fried, melted...). */
  enemyDeaths: EnemyDeath[];
  damageNumbers: DamageNumber[];
  blocks: Block[];
  camera: Vector2;
  /** Sloped ground for stages with a layout (drawn as hills; collision is in `blocks`). */
  groundRuns: GroundRun[];
  /** The camera's resting height: where the ground Meathead last stood on sits on screen (vertical-camera stages). */
  cameraRestY: number;
  /** How far through a long stage this attempt has got (respawns start at the last one). Kept across deaths. */
  checkpoint: number;
  /** The taser just put a current through a stretch of water: where, and when. */
  waterShock?: { x1: number; x2: number; surface: number; bottom: number; at: number };
  /** The last checkpoint the banner went up for (unset until the stage has started: where it starts isn't shown). */
  checkpointCalled?: number;
  /** The checkpoint banner on the screen: what it says and when it went up. */
  checkpointBanner?: { text: string; at: number };
  /** A stage layout's own running state (set pieces, hazards), rebuilt with the level. */
  stage: unknown;
  /** Things a stage remembers across deaths this attempt (how the mid-boss died...). Cleared when a stage starts. */
  stageMemo: Record<string, string>;
  /** A set piece holding the camera (the tram, a mid-boss arena, a cutscene); eases there. */
  cameraOverride: Vector2 | null;
  /** Shifts the camera ahead of Meathead (the ski run looks further down the mountain). */
  cameraLeadX?: number;
  /** A set piece only lets him use this weapon (the jet ski: the gun). */
  lockWeapon?: WeaponType;
  /** Oil on the ground (Oscar's stage): a slick you slide about on, or tar that holds your feet. From x1 to x2 along the ground line. */
  groundOil?: { x1: number; x2: number; kind: 'slick' | 'tar' }[];
  /** The weapons he's got right now (from the game's progress). */
  availableWeapons?: WeaponType[];

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
  /** Skyfall intro: the intro frame he hit the ground on (0 while he's still falling). */
  introLandedAt?: number;
  deathTimer: number;
  /** Frames the death screen's been up (it can be skipped after a moment; it waits for the death announcer). */
  /**
   * A kill with a big callout gets one voice, never two: usually Meathead's quip, sometimes the announcer (more often
   * when Meathead's got nothing to say). What's waiting to be settled next frame: a quip held back for the announcer,
   * the callout, and when Meathead last got a kill quip out.
   */
  killVoice?: { quip?: { category: VulgarityType; at: number; kind?: string }; callout?: { text: string; at: number }; quippedAt?: number; forced?: { text: string; at: number }; handed?: { text: string; at: number; quip?: VulgarityType } };
  /** What hurt him last, and when (the frame): for what the death screen says. */
  lastHurt?: { source: string; at: number };
  /** When a round last pinged off something hard (the ping isn't repeated every frame of a burst). */
  lastSparkSound?: number;
  /** Where the stage's opening drop lands him, when it's started at a checkpoint (the skip cheat): else the start. */
  introAt?: { x: number; y: number };
  deathFrames: number;
  /** The move he killed the boss with, if it was one of his own (a charge, a slide, an uppercut, a dive kick): the
   * death and the victory hold on him still in it. */
  killPose?: { isCharging: boolean; isSliding: boolean; isUppercutting: boolean; isDivekicking: boolean } | null;
  /** A little cutscene's going (enemies holding off): set while it is (see holdOffForCutscene). */
  cutsceneHold?: boolean;
  /** A death held on a still for a moment first (the sniper's headshot): frames since it started (see updateDeathScreen). */
  deathFreeze?: number;
  /** The last frame a long death on its way offered SKIP >> (see skipDying). */
  dyingSkipAt?: number;
  /** Reached the boss this attempt: dying now respawns right outside his door (cleared when a stage starts). */
  bossCheckpoint: boolean;
  /** The camera can't scroll left of this (no backtracking after a boss checkpoint respawn). */
  cameraMinX: number;
  /** Overrides how far right the camera can scroll (the weapon range is one screen wide). */
  cameraMaxX?: number;
  deathString: string;
  /** Easter egg: set fire to an oiled-up Toxic Tommy and the sewer goes nuclear (plays out as the death screen). */
  sewerNuke: Vector2 | null;
  victoryString: string;
  postVictoryTimer: number;
  /** Frames since the last line finished during the VICTORY (the weapon screen waits for the talking to stop). */
  victoryQuiet: number;
  bossExplosionTimer: number;
  bossExplosionPos: Vector2;
  bossCorpse: BossCorpse | null;
  /** A boss killed any way but his weakness: him as he was, going over (which way), where the floor is, when it started. */
  bossFallen?: { e: Enemy; dir: 1 | -1; floor: number; frame0: number } | null;
  /** The boss-defeated event has been sent (so it only goes once). */
  victoryReported: boolean;
  /** Forces React to switch the equipped weapon back to GUN (after respawn). */
  shouldSyncWeapon: boolean;

  // Player-fired tsunami
  tsunamiActive: boolean;
  tsunamiX: number;
  tsunamiStartX: number;
  /** Which wave this is (counting up with every one cast): a mid-boss takes each wave once. */
  tsunamiSerial?: number;
  tsunamiDir: number;
  /** How far the wave's raised or lowered from a flat stage's floor: set from where he's standing when he fires it (hilly stages). */
  tsunamiOffsetY?: number;

  // Boss hazards
  bossVolcanoes: Volcano[];
  bossVolcanoTelegraphs: Volcano[];
  bossPoopTelegraphs: PoopTelegraph[];
  bossSteamExplosions: SteamExplosion[];
  victorWallSide: number;
  ernieVibrationTimer: number;
  /** Horizontal pull applied to the player this frame (Hector's hurricane). */
  totalPullForceX: number;
  /** Wind shoving the player this frame (a stage hazard); used up by the next move. */
  windPushX?: number;
  /** Frames enemies still hold off attacking: he's crossing a crevasse, or only just landed from one. */
  gapGrace?: number;

  // Toxic Tommy arena
  tommyBoards: TommyBoard[];
  tommySludgeY: number;
  tommySludgeOiledTimer: number;
  tommyScrollY: number;

  /** Oily Oscar's oil slicks (and the fire on them). */
  oilCells: OilCell[];
  /** When Meathead last torched Oscar's oil himself (so Oscar's jab doesn't repeat every frame). */
  oscarPlayerIgnitedAt?: number;
  /** When Oscar last mocked the flamethrower bouncing off his suit. */
  oscarFireproofTauntAt?: number;
  /** When Victor last mocked Meathead for corking a vent. */
  victorCorkTauntAt?: number;
  /** Easter egg: all three of Victor's vents corked at once; the volcano's going up (see scenes/volcanoFinale.ts). */
  volcanoFinale: { t: number; waveY: number } | null;
  /** Artie's icicles hanging from (or falling from) the ceiling. */
  icicles: Icicle[];

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
  uppercutTimer: 0,
  power: POWER_CELLS,
  diveKickSpeedX: 0,
  uppercutHitIds: [],
  diveKickHitIds: [],
  lockTimer: 0,
  recoiling: false,
  hurtForm: null,
  hurtFormTimer: 0,
  squash: 0,
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
  enemyDeaths: [],
  damageNumbers: [],
  blocks: [],
  camera: { x: 0, y: 0 },
  groundRuns: [],
  cameraRestY: 0,
  checkpoint: 0,
  stage: null,
  stageMemo: {},
  cameraOverride: null,
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
  deathFrames: 0,
  volcanoFinale: null,
  bossCheckpoint: false,
  cameraMinX: 0,
  deathString: "",
  sewerNuke: null,
  victoryString: "",
  postVictoryTimer: 0,
  victoryQuiet: 0,
  bossExplosionTimer: 0,
  bossExplosionPos: { x: 0, y: 0 },
  bossCorpse: null,
  victoryReported: false,
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
  oilCells: [],
  icicles: [],
  playerStunTimer: 0,
  screenShakeTimer: 0,
  screenShakeMagnitude: DEFAULT_SHAKE,
});

/** Cancels any attack, special move or weapon effect the player is in the middle of. */
export const resetPlayerCombatState = (player: Player) => {
  player.filthShieldTimer = 0;
  player.sootTimer = 0;
  player.headless = 0;
  player.shownDead = false;
  player.barfTimer = 0;
  player.isFlaming = false;
  player.flameRange = 0;
  player.isTasing = false;
  player.taserTargetId = null;
  player.taserTimer = 0;
  player.taserOverloadTimer = 0;
  player.isCharging = false;
  player.isUppercutting = false;
  player.isDivekicking = false;
  player.isSliding = false;
  player.pushbackTimer = 0;
  player.lockTimer = 0;
  player.recoiling = false;
  player.slideRecoil = false;
  player.hurtForm = null;
  player.hurtFormTimer = 0;
};

/** The boss is dead: Meathead drops out of any hurt, flinch or special pose into a plain neutral stance. */
/** A boss going over (not his weakness): frames dropping to the floor if he's up off it, then going over. */
export const BOSS_FALL = { DROP: 12, OVER: 26 };

export const calmPlayer = (player: Player) => {
  resetPlayerCombatState(player);
  player.invincibilityTimer = 0;
  player.hurtTimer = 0;
  player.smugTimer = 0;
  player.angryTimer = 0;
  player.isHarmlessPushback = false;
  player.isDucking = false;
  player.squash = 0;
  player.vel.x = 0;
};

/**
 * Wipes everything tied to the current attempt at a stage: entities, hazards,
 * timers and speech. Used when leaving to the menu, starting a stage and respawning.
 * The level itself is rebuilt separately by buildLevel().
 */
export const resetStageState = (s: GameState) => {
  resetLineCooldowns();
  s.enemies = [];
  s.projectiles = [];
  s.flameSegments = [];
  s.pickups = [];
  s.particles = [];
  s.enemyDeaths = [];
  s.killPose = null;
  s.damageNumbers = [];
  s.blocks = [];
  s.camera = { x: 0, y: 0 };
  s.groundRuns = [];
  s.cameraRestY = 0;
  s.cameraMaxX = undefined;
  s.stage = null;
  s.cameraOverride = null;

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
  s.deathFrames = 0;
  stopDeathAnnouncer();
  s.cameraMinX = 0;
  s.deathString = "";
  s.sewerNuke = null;
  s.victoryString = "";
  s.postVictoryTimer = 0;
  s.victoryQuiet = 0;
  s.bossExplosionTimer = 0;
  s.bossCorpse = null;
  s.bossFallen = null;
  s.victoryReported = false;

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
  s.oilCells = [];
  s.oscarPlayerIgnitedAt = undefined;
  s.oscarFireproofTauntAt = undefined;
  s.victorCorkTauntAt = undefined;
  s.volcanoFinale = null;
  s.icicles = [];

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
  p.power = POWER_CELLS;
  p.killSatisfactionTimer = 0;
  p.bossKillSatisfactionTimer = 0;
  p.peeTimer = 0;
  p.skiing = false;
  p.jetski = false;
  p.moto = false;
  p.skiSpeed = 0;
  p.hidden = false;
  p.inCutscene = false;
  s.cameraLeadX = 0;
  s.lockWeapon = undefined;
  s.groundOil = undefined;
};
