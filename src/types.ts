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

export type WeaponType = 'GUN' | 'BOULDER' | 'SHOTGUN' | 'FLAMETHROWER' | 'TSUNAMI' | 'NEEDLES' | 'TASER' | 'SLUDGE' | 'OIL_ROCKET' | 'LMG';

export type VulgarityType = 'gun_kill' | 'boulder_kill' | 'shotgun_kill' | 'flamethrower_kill' | 'tsunami_kill' | 'hurt' | 'death' | 'charge_kill' | 'uppercut_kill' | 'dart_kill' | 'taser_kill' | 'sludge_kill' | 'oil_kill' | 'truck_wreck' | 'range_boxer_kill' | 'range_balloon_kill';

export type SoundType =
  // weapons
  | 'gun' | 'egun' | 'lmg' | 'ice' | 'flame' | 'ignite' | 'barf' | 'oil' | 'dart' | 'taser' | 'tsunami' | 'click'
  // bodies
  | 'punch' | 'stomp' | 'splat' | 'crunch' | 'hurt' | 'whoosh' | 'jump' | 'land' | 'thud' | 'slam'
  // things breaking
  | 'clang' | 'clink' | 'crack' | 'glass' | 'crash' | 'boom' | 'nuke'
  // water
  | 'splash' | 'glug' | 'tinkle'
  // signals, machines, the world
  | 'beep' | 'alert' | 'ding' | 'pickup' | 'reload' | 'powerup' | 'alarm' | 'siren' | 'horn' | 'truckhorn' | 'engine'
  | 'rumble' | 'thunder' | 'roar' | 'bellow' | 'snort' | 'screams';

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
  /** Down + jump on a jump-through ledge: dropping through it (frames left, and the height of the ledge he's dropping through). */
  dropThroughT?: number;
  dropThroughY?: number;
  /** Dropped down off a ledge that way: frames of the drop's pose left (arms up, legs together, going down). */
  ledgeDrop?: number;

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
  /** ...on a bike (Tommy's stage): the jet ski's rules, pedaling, and the hills speed him up and slow him down. */
  bike?: boolean;
  /** In a hazmat suit (drawn yellow, hooded). */
  suit?: boolean;
  /** Black with soot from a blast (frames left: it wears off). */
  sootTimer?: number;
  /** His head's gone (the sniper): frames since. The body stays up on the death screen, and goes over. */
  headless?: number;
  /** Dead, but still drawn through the death screen (tased himself in the water: charred where he floats). */
  shownDead?: boolean;
  /** ...on a motorcycle (Oscar's stage): the jet ski's rules, sat astride it (the stage draws the bike). */
  moto?: boolean;
  /** A lunge through the water (the special, swimming): which way (forward, up or down). */
  swimDash?: { x: number; y: number };
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
  | 'idle' | 'barfing' | 'jumping' | 'attacking' | 'hurricane' | 'telegraphing' | 'stunned_drop'
  | 'truck_incoming' | 'using_shipment' | 'speed_dash' | 'shooting' | 'teleporting'
  | 'blackout' | 'blackout_teleport' | 'ground_pound' | 'lightning_storm' | 'exhausted'
  | 'submerged_chase' | 'telegraph_emerge' | 'emerge_shatter' | 'puke_closing_in'
  | 'puke_going_outward' | 'vulnerable_idle' | 'dive_in_sludge' | 'weakness_stunned'
  | 'aiming' | 'flicking' | 'taser_held' | 'ash_face' | 'high' | 'running' | 'frozen';

/** Themed enemies: Artie's wildlife and goons. */
/** What the shield goons throw. */
export type ThrownKind = 'tequila' | 'water' | 'coconut' | 'ice' | 'rock' | 'teargas' | 'forty' | 'coffee' | 'stapler' | 'cleaner' | 'flask' | 'household' | 'wrench' | 'horseshoe' | 'lunchpail';
/** What the gun goons fire. */
export type ShotLook = 'slug' | 'cryo' | 'flare' | 'spray' | 'zap' | 'tracer';

export type EnemyKind =
  // Artie's stage
  | 'wolverine' | 'goat' | 'eagle' | 'shooter' | 'charger' | 'shielder' | 'moose'
  // Hector's stage: vacation goons, the cops, Florida wildlife, the beachgoers, and the storm's own
  | 'tourist' | 'bouncer' | 'surfer' | 'cop' | 'riotcop' | 'gator' | 'pelican' | 'iguana' | 'crab' | 'civilian' | 'shark' | 'eye'
  // Victor's stage: goons in heat gear, volcano wildlife, and the club's doorman
  | 'heatsuit' | 'smokejumper' | 'blastshield' | 'salamander' | 'vulture' | 'magmafish' | 'doorman'
  // Ernie's stage: San Francisco's finest, its wildlife, drones, the jet ski goons, and the poor souls on fire on the bridge
  | 'techbro' | 'courier' | 'protester' | 'raccoon' | 'seagull' | 'drone' | 'jetskier' | 'burning'
  // Dale's stage: the cartel's sicarios, enforcers and car-door men, the desert's wildlife, his distributor
  // (the tweaker upstairs in the warehouse office), and the tourists in the old west town
  | 'sicario' | 'enforcer' | 'cardoor' | 'rattlesnake' | 'scorpion' | 'coyote' | 'junkie' | 'visitor' | 'hawk'
  // Barry's stage: New York. The street (pimps, hookers, muggers, bums, rats), the skyscraper floor by floor (the
  // lobby, the office, maintenance, the lab), the tenants in their windows, his man in the power room and its generators
  | 'pimp' | 'hooker' | 'mugger' | 'bum' | 'rat' | 'guard' | 'commuter' | 'reader' | 'exec' | 'intern' | 'hr'
  | 'exterminator' | 'janitor' | 'custodian' | 'labtech' | 'subject' | 'scientist' | 'tenant' | 'minion' | 'generator'
  // Tommy's stage: Flint. The hood (gangbangers with pistols, bruisers with bats, pit bulls, the drive-by lowriders),
  // then the sewer (Tommy's hazmat crew with their sprayers, bloated mutant sewer workers, a crew man behind a manhole
  // cover, the little sludge things that hop out of the muck), and what's left of everyone the water killed
  | 'banger' | 'bruiser' | 'pitbull' | 'lowrider' | 'hazmat' | 'bloater' | 'manhole' | 'sludgeling' | 'mutantfish' | 'amalgam'
  // Oscar's stage: the oil field's security (Texas rangers with revolvers, bikers who come at you, a deputy behind
  // his riot shield), its wildlife (armadillos, longhorns), and the chase: union pickups, ranger cruisers, the bikers' choppers
  | 'ranger' | 'biker' | 'deputy' | 'armadillo' | 'longhorn' | 'grackle' | 'pickup' | 'cruiser' | 'chopper';

export interface Enemy extends Entity {
  /** Its speed along a slick of oil (it doesn't stop, or get going, in a hurry on one). */
  oilSlide?: number;
  /** The water it lives in (a fish): it keeps inside it, and only goes after him when he's in it too. */
  swimBox?: { x1: number; x2: number; y1: number; y2: number };
  /** Which of Meathead's moves last hit it (see Player.moveId). */
  hitByMove?: number;
  /** A gator's meal: the goon it's gone after in the water (by id). */
  prey?: string;
  /** The frame the flamethrower last hurt it (a mid-boss is hurt once a frame, however many flames are on it). */
  burntAt?: number;
  /** The frame a stage hazard (a cactus, a truck, road debris) last hurt it (so one bump isn't a hit every frame). */
  hazardHitAt?: number;
  /** A close-range swing in progress (the cops' club and shield bash): what part of it, how long in, and whether it's landed. */
  melee?: { state: 'windup' | 'strike' | 'recover'; t: number; hit: boolean };
  /** The last frame Meathead was driving him backward on his own shield with a shoulder charge. */
  shovedAt?: number;
  /** The frame a shoulder charge knocked it back (a wall it's slammed into soon after hurts a lot more). */
  chargedAt?: number;
  /** In the water and can't swim: frames since he went in, and where the surface is. */
  drownT?: number;
  drownSurface?: number;
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
  /** Victor's fire barf: frames into it (wind-up, then the stream), where it's pointing (radians, 0 = right), how far
   * it reaches right now, and the frame he can do it again from. */
  barfT?: number;
  /** Sent flying dead by one of his moves (a charge, a slide, an uppercut, a dive kick): it's a projectile now, and
   * these are who it's already hit on the way. */
  meleeFlung?: boolean;
  /** A flyer knocked up above its height: dropping back down to it. */
  returnHome?: boolean;
  /** Uppercut dead off its feet: it comes back down and splats. */
  uppercutFlung?: boolean;
  /** Its body's splat has had its callout already (a wall, then the floor: only the one). */
  splatCalled?: boolean;
  /** A charger stood under him while he's up on something out of its reach, waiting for him to come down. */
  waitingUnder?: boolean;
  /** Its walking pace on its beat (a patrolling enemy). */
  walkSpeed?: number;
  flungHits?: string[];
  barfAngle?: number;
  barfLen?: number;
  barfReadyAt?: number;
  /** Frames of the flash from the last hit (mid-bosses show every hit; they have no invincibility). */
  hitFlash?: number;
  patrolRange: number;
  initialX: number;
  initialY?: number;
  shootTimer: number;
  /** A rifleman's burst: rounds still to come, and frames till the next. */
  burstLeft?: number;
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
  /** The frame the truck first smashed through the pharmacy's front doors (left) and its back wall (right). */
  leftWallDownAt?: number;
  rightWallDownAt?: number;
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
  /** A boss posing for a photo: the look on his face (see the render kit's moods). */
  faceMood?: string;
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
  /** How many more it can go through (the machine gun's rounds punch on through a few of them). */
  pierce?: number;
  isIce?: boolean;
  isTsunami?: boolean;
  isShrapnel?: boolean;
  isPoop?: boolean;
  /** Something a shield goon's lobbed (a bottle, a coconut, a chunk of ice...): it arcs, and smashes on whatever it hits. */
  thrown?: ThrownKind;
  /** Which household item it is (a tenant's throw: a pot, a toaster, a shoe, a potted plant, a phone). */
  item?: number;
  /** What a gun goon's shot looks like (a slug, a frost bolt, a flare). */
  shot?: ShotLook;
  isDart?: boolean;
  isCocaine?: boolean;
  isMethBarrel?: boolean;
  isSludge?: boolean;
  /** Just for show (Tommy's puke stream, say: where it lands is what hurts): never hits him, and gone when it lands. */
  visualOnly?: boolean;
  isOilRocket?: boolean;
  /** It's already fouled the water it went into (once is enough). */
  stainedWater?: boolean;
  /** Fired from a crouch: this rocket ignores steering and flies straight. */
  noSteer?: boolean;
  isOscarRocket?: boolean;
  isCigarette?: boolean;
  /** Frames the taser has been on this cigarette. */
  zapFrames?: number;
  isDarkness?: boolean;
  isLingering?: boolean;
  isSliding?: boolean;
  /** (sludge) Frames it's been running down a wall or a shield. */
  slideT?: number;
  life?: number;
  bounceDecay?: number;
  spawnX?: number;
  /** A player's shot, till its first hit check: the x it came from (his middle), so a point-blank shot still hits what's right up against him. */
  fromX?: number;
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
  /** A jump-through he can come up through but can't drop down through (down + jump does nothing on it). */
  noDropThrough?: boolean;
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
  /** Ammo for this weapon in particular (not whichever he's lowest on). */
  weapon?: WeaponType;
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
