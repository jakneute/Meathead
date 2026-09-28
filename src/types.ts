export enum GameStatus {
  START = 'START',
  STAGE_SELECT = 'STAGE_SELECT',
  LEVEL_INTRO = 'LEVEL_INTRO',
  PLAYING = 'PLAYING',
  BOSS_TRANSITION = 'BOSS_TRANSITION',
  BOSS_INTRO = 'BOSS_INTRO',
  BOSS_VICTORY_SPEECH = 'BOSS_VICTORY_SPEECH',
  VICTORY = 'VICTORY',
  /** The ending cutscene (after the second set of bosses, for now). */
  ENDING = 'ENDING',
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

export type VulgarityType = 'gun_kill' | 'boulder_kill' | 'shotgun_kill' | 'flamethrower_kill' | 'tsunami_kill' | 'hurt' | 'death' | 'charge_kill' | 'uppercut_kill' | 'dart_kill' | 'taser_kill' | 'sludge_kill' | 'oil_kill' | 'truck_wreck';

export type SoundType = 'gun' | 'ice' | 'flame' | 'tsunami' | 'dart' | 'horn' | 'ignite' | 'barf' | 'oil' | 'taser' | 'tinkle' | 'nuke' | 'siren' | 'thunder' | 'screams';

export interface Player extends Entity {
  /** Frames a shoulder charge can keep going while it's driving a shield goon back (held down, it lasts a good while longer). */
  shoveT?: number;
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
  uppercutTimer: number;
  /** Special-move power, 0..POWER_CELLS: each charge, slide or uppercut spends a whole cell. */
  power: number;
  /** A power move finished in the air: no refilling until he touches down. */
  powerLocked?: boolean;
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
  /** Just threw a boulder: frames left of the throwing arm's follow-through, and whether it was the overhead lob. */
  throwTimer?: number;
  throwLob?: boolean;
  invincibilityTimer: number;
  /** Knockback from taking damage; input is ignored while it runs. */
  pushbackTimer: number;
  hurtTimer?: number;
  smugTimer?: number;
  /** Bounced off an enemy mid-slide: he stays crouched through the recoil for as long as down is held. */
  slideRecoil?: boolean;
  /** A charge or slide that didn't kill: he sets his jaw in grim determination for a moment. */
  angryTimer?: number;
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
  /** Up (-1) or down (+1) held this frame: steers his oil rockets in flight. */
  steer?: number;
  /** The taser's target died: it stays off until fire is released and pressed again. */
  taserSpent?: boolean;
  /** On skis (a stage set piece): he's carried along at skiSpeed, and can only jump, duck and shoot. */
  skiing?: boolean;
  /** ...on a jet ski: carried along the same, but his specials still work (always forward), and holding left turns him round to shoot behind. */
  jetski?: boolean;
  /** In the water (a stage says so each frame): he swims instead of walking and jumping. And where the surface is. */
  swimming?: boolean;
  swimSurfaceY?: number;
  /** How hard a jump at the surface leaps him out (set by the stage: less out of a shallow pool). */
  swimLeap?: number;
  skiSpeed?: number;
  /** Not drawn (rolled up inside a snowball, say). */
  hidden?: boolean;
  /** Frames left of a cutscene kick pose (drawn like the dive kick, standing). */
  kickPose?: number;
  /** Counts up each time he starts a charge, uppercut or dive kick (an enemy's only hit once per move, but again by the next one). */
  moveId?: number;
  /** In a cutscene: can't be hurt, and doesn't flicker for it. */
  inCutscene?: boolean;
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
  /** Victory lap after a weakness kill: frames spent relieving himself on the corpse. */
  peeTimer?: number;
}

export type BossState =
  | 'idle' | 'jumping' | 'attacking' | 'hurricane' | 'telegraphing' | 'stunned_drop'
  | 'truck_incoming' | 'using_shipment' | 'speed_dash' | 'shooting' | 'teleporting'
  | 'blackout' | 'blackout_teleport' | 'ground_pound' | 'lightning_storm' | 'exhausted'
  | 'submerged_chase' | 'telegraph_emerge' | 'emerge_shatter' | 'puke_closing_in'
  | 'puke_going_outward' | 'vulnerable_idle' | 'dive_in_sludge' | 'weakness_stunned'
  | 'aiming' | 'flicking' | 'taser_held' | 'ash_face' | 'high' | 'running' | 'frozen';

/** Themed enemies: Artie's wildlife and goons. */
export type EnemyKind =
  // Artie's stage
  | 'wolverine' | 'goat' | 'eagle' | 'shooter' | 'charger' | 'shielder' | 'moose'
  // Hector's stage: vacation goons, the cops, Florida wildlife, the beachgoers, and the storm's own
  | 'tourist' | 'bouncer' | 'surfer' | 'cop' | 'riotcop' | 'gator' | 'pelican' | 'iguana' | 'crab' | 'civilian' | 'shark' | 'eye'
  // Victor's stage: goons in heat gear, volcano wildlife, and the club's doorman
  | 'heatsuit' | 'smokejumper' | 'blastshield' | 'salamander' | 'vulture' | 'magmafish' | 'doorman'
  // Ernie's stage: San Francisco's finest, its wildlife, drones, the jet ski goons, and the poor souls on fire on the bridge
  | 'techbro' | 'courier' | 'protester' | 'raccoon' | 'seagull' | 'drone' | 'jetskier' | 'burning';

export interface Enemy extends Entity {
  /** Which of Meathead's moves last hit it (see Player.moveId). */
  hitByMove?: number;
  /** A gator's meal: the goon it's gone after in the water (by id). */
  prey?: string;
  /** The frame the flamethrower last hurt it (a mid-boss is hurt once a frame, however many flames are on it). */
  burntAt?: number;
  /** A close-range swing in progress (the cops' club and shield bash): what part of it, how long in, and whether it's landed. */
  melee?: { state: 'windup' | 'strike' | 'recover'; t: number; hit: boolean };
  /** The last frame Meathead was driving him backward on his own shield with a shoulder charge. */
  shovedAt?: number;
  enemyType: 'drone' | 'tank' | 'turret' | 'flyer' | 'shield';
  behavior: 'patrol' | 'shoot' | 'hover' | 'fly' | 'custom';
  /** A themed stage enemy with its own look and AI (see enemies/kinds/index.ts). */
  kind?: EnemyKind;
  /** Its AI's current move, how long it's been at it, and where it's aiming. */
  aiState?: string;
  aiTimer?: number;
  aiX?: number;
  aiY?: number;
  /** Where it started (it doesn't stray far until it's seen you). */
  homeX?: number;
  homeY?: number;
  facing?: 1 | -1;
  /** Frames of the flash from the last hit (mid-bosses show every hit; they have no invincibility). */
  hitFlash?: number;
  patrolRange: number;
  initialX: number;
  initialY?: number;
  shootTimer: number;
  isShieldActive?: boolean;
  hitCooldown?: number;
  frozenTimer?: number;
  sludgeTimer?: number;
  /** How fast sludge is dragging a flyer down right now. */
  sludgeFallSpeed?: number;
  /** Where the current sludge drag started (fall damage grows with the distance). */
  sludgeFallFromY?: number;
  /** The frame a sludge puddle last hurt it (puddles don't stack). */
  sludgeTickFrame?: number;
  /** Hector: how long Meathead has been within half a screen of his vortex. */
  vortexGrip?: number;
  /** Artie: frames left hefting an ice block overhead before he throws it. */
  throwWindup?: number;
  /** Oscar: frames left of the silver shimmer on his fireproof suit (the flamethrower bouncing off). */
  fireproofFlash?: number;
  /** Oscar: when the last "IMMUNE!" popped up over him. */
  immunePopFrame?: number;
  isBlownAway?: boolean;
  rotation?: number;
  pauseTimer?: number;
  /** A practice dummy: bumping into it doesn't hurt. */
  harmless?: boolean;
  /** A bystander: only Meathead can hurt it (his shots and moves, or something he knocked into it); nothing else does. */
  innocent?: boolean;
  /** A mid-boss already took a hit from this tsunami wave (it's washed over once, not every frame). */
  tsunamiWave?: number;
  /** Which look a themed enemy has (a beachgoer's outfit and pastime, a gator in the water or on land). */
  variant?: number;
  /** Died of an overdose: its body flies off, veering toward anything airborne and wrecking what it hits. */
  overdosed?: boolean;
  /** Enemies an overdosed body has already plowed through. */
  overdoseHitIds?: string[];
  /** Overdosed flight: rising (arcing at something), diving straight at something below, or dropping. */
  overdosePhase?: 'rise' | 'dive' | 'drop';
  /** Frames an overdosed body has been flying (it bursts in mid-air if it hasn't landed by OVERDOSE_MAX_FRAMES). */
  overdoseFrames?: number;
  /** The taser set it alight: if the burn finishes it, it's still an electrocution. */
  ignitedByTaser?: boolean;
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
  /** Tires blown out on Meathead's sludge: the truck is careening into Dale. */
  truckCrashing?: boolean;
  /** Standing in Meathead's sludge: frames toward the next tick, and the last frame it ticked. */
  sludgeDotTimer?: number;
  sludgeDotFrame?: number;
  /** Ernie: scrambling back to where he was headed after being frozen and shattered. */
  scrambling?: boolean;
  /** A direct sludge hit is waiting to splash a puddle under him. */
  puddlePending?: boolean;
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
  /** Alternates each shot: 'tracked' follows Meathead up into the air, 'floor' only follows his x along the floor. */
  oscarAimMode?: 'tracked' | 'floor';
  lockProgress?: number;      // 0..1, fires at 1
  fireWarning?: number;       // frames left in the blinking "about to fire" window
  aimFrames?: number;
  hasCigarette?: boolean;
  impactX?: number;           // where his last rocket hit (the cigarette goes there)
  impactY?: number;
  taserHold?: number;         // frames held by the taser
  taserHeldThisFrame?: boolean;
  taserGrace?: number;
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
  /** Which kind of ordinary enemy fired it ('enemy' for the plain ones), for what he shouts when it hits him. */
  shooterKind?: string;
  isBoulder?: boolean;
  /** Ernie's lobbed boulder: its impacts shake the room like his stomps. */
  isHeaved?: boolean;
  /** Enemies this projectile has already hit (sludge splashes through each one once). */
  hitIds?: string[];
  isIce?: boolean;
  isTsunami?: boolean;
  isShrapnel?: boolean;
  isPoop?: boolean;
  isDart?: boolean;
  isCocaine?: boolean;
  isMethBarrel?: boolean;
  isSludge?: boolean;
  isOilRocket?: boolean;
  /** Fired from a crouch: this rocket ignores steering and flies straight. */
  noSteer?: boolean;
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

/** An icicle Artie shakes loose from the ceiling. */
export interface Icicle {
  x: number;        // centre
  y: number;        // top
  length: number;
  vy: number;
  /** Frames until it drops (-1 once it's falling). */
  fallIn: number;
  /** Frames since it formed (it grows out of the ceiling). */
  age: number;
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
  /** Collision only: the stage draws this ground itself (smooth slopes instead of the steps). */
  hidden?: boolean;
  /** A stage hazard/feature this block belongs to (crumbling ledges, the tram, rock overhangs...). */
  tag?: string;
  /** An indoor floor (the tram cabin's): normal footing even on an icy stage. */
  indoor?: boolean;
  /** A jump-through ledge: you can jump up through it from below (no bonked head) and land on top; only its top is solid. */
  oneWay?: boolean;
}

export interface Volcano {
  pos: Vector2;
  life: number;
  type: 'wall' | 'ground';
  /** Vents that erupted together share this (Victor's corking easter egg needs a whole set corked). */
  setId?: number;
  /** A boulder's jammed in it: no more magma, but the pressure builds until it blows. */
  corked?: boolean;
  /** Frames until a corked vent blows its cork. */
  fuse?: number;
  /** Frames since it burst out (its life can be extended, so this drives how far it's risen). */
  age?: number;
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
  /** Blood that's hit the floor and lies there (fades normally, unlike isStuck). */
  isSplat?: boolean;
  /** Draw at this opacity instead of fading with life (short, bright bursts). */
  alpha?: number;
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
