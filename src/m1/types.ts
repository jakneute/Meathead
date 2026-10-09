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

export type WeaponType = 'GUN' | 'BOULDER' | 'SHOTGUN' | 'FLAMETHROWER' | 'TSUNAMI' | 'NEEDLES' | 'TASER' | 'SLUDGE' | 'OIL_ROCKET' | 'LMG'
  // (Meathead 2's, from its lands: see combat/customWeapons.ts)
  | 'SOUVENIR' | 'SOUL_SUCKER' | 'FLINTLOCK' | 'SPELLBOOK' | 'STUNT_CAR' | 'MALLET' | 'SPAWNER' | 'CROSSBOW';

export type VulgarityType = 'gun_kill' | 'boulder_kill' | 'shotgun_kill' | 'flamethrower_kill' | 'tsunami_kill' | 'hurt' | 'death' | 'charge_kill' | 'uppercut_kill' | 'dart_kill' | 'taser_kill' | 'sludge_kill' | 'oil_kill' | 'truck_wreck' | 'range_boxer_kill' | 'range_balloon_kill' | 'alien_kill';

export type SoundType =
  // weapons
  | 'gun' | 'egun' | 'lmg' | 'ice' | 'flame' | 'ignite' | 'barf' | 'oil' | 'dart' | 'taser' | 'tsunami' | 'click'
  // bouncing on something springy (an awning, a trampoline, a head)
  | 'boing'
  // dry fire (fire pressed with it empty)
  | 'dry_lmg' | 'dry_ice' | 'dry_flame' | 'dry_boulder' | 'dry_tsunami' | 'dry_needles' | 'dry_taser' | 'dry_sludge' | 'dry_oil'
  // bodies
  | 'punch' | 'stomp' | 'splat' | 'gunhit' | 'crunch' | 'hurt' | 'whoosh' | 'jump' | 'land' | 'thud' | 'slam'
  // things breaking
  | 'clang' | 'clink' | 'crack' | 'glass' | 'crash' | 'boom' | 'nuke'
  // water
  | 'splash' | 'glug' | 'tinkle'
  // signals, machines, the world
  | 'cursor' | 'menuok' | 'menuback' | 'beep' | 'alert' | 'ding' | 'pickup' | 'reload' | 'powerup' | 'alarm' | 'siren' | 'horn' | 'truckhorn' | 'engine'
  | 'rumble' | 'thunder' | 'roar' | 'bellow' | 'snort' | 'screams'
  // (him)
  | 'fart'
  // (Hector's flying logs)
  | 'poopflight' | 'poopsplat'
  // (the finale's alien: his ray gun charging and firing, and the sad little bolts he lobs once he's beaten)
  | 'alienCharge' | 'alienBeam' | 'sadBolt'
  // (Meathead 2's ray gun)
  | 'raygun'
  // (Meathead 2's souvenir launcher: a hollow pop out of a tube, junk rattling)
  | 'souvenir'
  // (Meathead 2's soul sucker: the vacuum, the grinder, the gore bag emptying)
  | 'suck' | 'grind' | 'gorespray' | 'dry_gore'
  // (Meathead 2's laser-guided flintlock going off, and primed)
  | 'flintlock' | 'primed'
  // (Meathead 2's spellbook, read out)
  | 'spell' | 'bolt'
  // (Meathead 2's clapperboard: the snap, the stunt car coming)
  | 'clap' | 'carroar'
  // (Meathead 2's mallet of pain: the bonk, the twinkle, the tornado, the squash)
  | 'bonk' | 'twinkle' | 'whirl' | 'squish'
  // (Meathead 2's otherworldly spawner: a litter born, their chatter, their chewing, a skeleton falling to bits)
  | 'spawn' | 'chitter' | 'gnaw' | 'crumble'
  // (Meathead 2's crossbow of plagues: a dart loosed, somebody retching, the puke coming)
  | 'twang' | 'retch' | 'gush'
  // his footsteps, by what he's walking on
  | 'step_hard' | 'step_snow' | 'step_metal' | 'step_wood' | 'step_dirt' | 'step_sand' | 'step_wet';

export interface Player extends Entity {
  /** Frames a shoulder charge can keep going while it's driving a shield goon back (held down, it lasts a good while longer). */
  shoveT?: number;
  facing: 1 | -1;
  isGrounded: boolean;
  /** Stood on a slope or stairs: how far below his feet the ground is either side of his middle (game/core/terrain.ts stanceGround; unset on the flat). */
  stance?: { l: number; r: number };
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
  /** How far he's walked since his last footstep (for its sound). */
  stepDist?: number;
  /** Dying: the face for it (see render/player/deathFace). */
  deathFace?: import('./game/render/player/deathFace').DeathFace;
  /** The crouching easter egg (game/player/gut.ts): frames crouched still, and how far it's got (1 the grumble, 2 he's shit himself;
   *  3, a game that has it (Meathead 2), he's done it again so hard his pants are gone: `again` the second grumble). */
  /** `at`: where (world x, y) it happened (unset if he came into the stage like that: the cheat). `debris`: his jeans
   *  and his underpants, blown off him in shreds, flying (and then lying where they landed); `globs` of it flying, `stains`
   *  where they hit (the floor, a wall), and the `pile` of it where he was, torn bits of his pants in it. */
  gut?: { t: number; stage: 0 | 1 | 2 | 3; lineAt?: number; at?: { x: number; y: number }; again?: boolean;
    /** Up off his haunches since he last did it: he can do it again. */
    rearmed?: boolean;
    /** Naked, he's been in clean water long enough to wash it off him (`washT` the frames he's been in it): no pants
     *  still, but clean. */
    washed?: boolean; washT?: number;
    debris?: { kind: 'shred' | 'briefs'; x: number; y: number; vx: number; vy: number; a: number; va: number; t: number; down: boolean; w: number }[];
    globs?: { x: number; y: number; vx: number; vy: number }[];
    stains?: { x: number; y: number; side: number; r: number; seed: number }[];
    pile?: { x: number; y: number; dir: number };
    /** (Meathead 2) The third one: what's left of him, in a heap (x the middle, y the floor), from frame `at`. */
    remains?: { x: number; y: number; dir: number; at: number } };

  // Recoil from bouncing off an enemy (controls locked while lockTimer runs)
  lockTimer: number;
  /** Frames left thrown off something too slick to hold on to (a boss's `slick`): no moves till it's out. */
  slipT?: number;
  recoiling: boolean;

  // Previous frame's buttons, for detecting presses
  jumpHeldLastFrame: boolean;
  specialHeldLastFrame: boolean;
  shootHeldLastFrame: boolean;

  shootCooldown: number;
  /** Just threw a boulder: frames left of the throwing arm's follow-through, and whether it was the overhead lob. */
  throwTimer?: number;
  throwLob?: boolean;
  /** The finale's boulder: the throw's a fastball pitch (the windup, the leg kick, the arm whipped over the top). */
  throwPitch?: boolean;
  /** ...and the alien behind him: thrown backward over his head instead, like a strongman's keg toss. */
  throwKeg?: boolean;
  invincibilityTimer: number;
  /** Knockback from taking damage; input is ignored while it runs. */
  pushbackTimer: number;
  hurtTimer?: number;
  /** Body contact doesn't hurt him right now (Meathead 2: he's busy grabbing somebody; shots still do). */
  noContactHurt?: boolean;
  /** Frames he's still bleeding for (drops off him), and his health as it was last frame (to see a hit land). */
  bleedT?: number;
  bloodHp?: number;
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
  /** His health when the shield went up (or since): any less and he's been hit, and it's gone. */
  filthShieldHp?: number;
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
  /** Held where something else puts him (Meathead 2's vines): no gravity, no moving himself, the engine leaves his
   * position alone; he can still face, shoot and be hurt. */
  carried?: boolean;
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
  /** The taser's current jumping on from what it's got hold of to anyone right up against it, and on from them: who's
   * caught (ids), and the links it's jumped (from, to), for drawing. */
  taserChain?: string[];
  taserLinks?: [string, string][];
  taserTimer?: number;
  /** Frames until the taser works again (it overloads after bursting Oily Oscar). */
  taserOverloadTimer?: number;
  /** Dry fire (see combat/dryFire.ts): the frame the last empty-gun gag went off, and whether he was firing it with
   * something in it last frame (so running dry mid-hold gets one too). */
  dryFireAt?: number;
  /** Out of boulders and tried to throw one anyway: the frame he shrugged (see render/player/player.ts). */
  shrugAt?: number;
  /** Knocked back off a wall out of a slide: whether he's staying down for it (down was held when he hit). */
  slideLow?: boolean;
  dryWasLive?: boolean;
  // Sludge
  barfTimer?: number;
  /** Victory lap after a weakness kill: frames spent relieving himself on the corpse. */
  peeTimer?: number;
}

export type BossState =
  | 'idle' | 'barfing' | 'jumping' | 'attacking' | 'perched' | 'panicking' | 'pain' | 'hurricane' | 'telegraphing' | 'stunned_drop'
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
  // (and inside Club Caldera: the ravers flinging flaming shots, the fire dancers, the partygoers who'd just like to leave)
  | 'raver' | 'firedancer' | 'partygoer'
  // Ernie's stage: San Francisco's finest, its wildlife, drones, the jet ski goons, and the poor souls on fire on the bridge
  | 'techbro' | 'courier' | 'protester' | 'raccoon' | 'seagull' | 'drone' | 'jetskier' | 'burning'
  // (and on Alcatraz: the tour's convict reenactor with his ball and chain, the park rangers)
  | 'convict' | 'parkranger'
  // Dale's stage: the cartel's sicarios, enforcers and car-door men, the desert's wildlife, his distributor
  // (the tweaker upstairs in the warehouse office), and the tourists in the old west town
  | 'sicario' | 'enforcer' | 'cardoor' | 'rattlesnake' | 'scorpion' | 'coyote' | 'junkie' | 'visitor' | 'hawk'
  // Barry's stage: New York. The street (pimps, hookers, muggers, bums, rats), the skyscraper floor by floor (the
  // lobby, the office, maintenance, the lab), the tenants in their windows, his man in the power room and its generators
  | 'pimp' | 'hooker' | 'mugger' | 'bum' | 'rat' | 'guard' | 'commuter' | 'reader' | 'exec' | 'intern' | 'hr'
  | 'exterminator' | 'janitor' | 'custodian' | 'labtech' | 'subject' | 'scientist' | 'tenant' | 'minion' | 'generator'
  // (and the pigeons up the walk-ups' fire escapes)
  | 'pigeon'
  // Tommy's stage: Flint. The hood (gangbangers with pistols, bruisers with bats, pit bulls, the drive-by lowriders),
  // then the sewer (Tommy's hazmat crew with their sprayers, bloated mutant sewer workers, a crew man behind a manhole
  // cover, the little sludge things that hop out of the muck), and what's left of everyone the water killed
  | 'banger' | 'bruiser' | 'pitbull' | 'lowrider' | 'hazmat' | 'bloater' | 'manhole' | 'sludgeling' | 'mutantfish' | 'amalgam'
  // Oscar's stage: the oil field's security (Texas rangers with revolvers, bikers who come at you, a deputy behind
  // his riot shield), its wildlife (armadillos, longhorns), and the chase: union pickups, ranger cruisers, the bikers' choppers
  | 'ranger' | 'biker' | 'deputy' | 'armadillo' | 'longhorn' | 'grackle' | 'pickup' | 'cruiser' | 'chopper'
  // The gym: the department's pencil necks (sent in first, to see what he'd do)
  | 'suit' | 'temp' | 'clerk' | 'bob' | 'cower'
  // The finale: the Secret Service flooding the White House press room (a shooter, a man who tackles, one behind a
  // ballistic shield, and the jetpack men)
  | 'agent' | 'agentrush' | 'agentshield' | 'jetagent'
  // Meathead 2 (drawn by Meathead 2 itself: registerKindDrawer): Happy Land's park security, people in line
  | 'parksec' | 'parkguest'
  // Meathead 2's own enemies, registered by it at startup (enemies/kinds: registerKind): stats, AI, look, all its own
  | `m2:${string}`;

export interface Enemy extends Entity {
  /** A beachgoer running from the smell (Meathead's shit himself: game/player/gut.ts), not from a shooting. */
  disgusted?: boolean;
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
  /** A flyer a boulder killed, coming straight down: it flattens whatever's under it on the way (see flungIntoEnemies). */
  crushing?: boolean;
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
  /** The frame the ice went on (it's drawn held at that frame, not idling, while it's frozen). */
  frozeAt?: number;
  /** Frames it's been in Tommy's muck (knocked in: it's being eaten). */
  muckT?: number;
  /** Where it last stood (its y): how far it's come down, when it lands. */
  lastGroundY?: number;
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
  /** A lab test subject overdosed into HYPERMODE: frames it's been on it (0/undefined: not). */
  hyper?: number;
  /** It's been on the screen (till then nothing out there can kill it: see spared() in enemies.ts); where it started. */
  seen?: boolean;
  /** A charger: frames before it'll jump for him again. */
  leapCd?: number;
  spawnPos?: Vector2;
  /** A tenant: what he's got in his hand to throw (see drawHouseholdItem). */
  heldItem?: number;
  isBlownAway?: boolean;
  rotation?: number;
  pauseTimer?: number;
  /** A practice dummy: bumping into it doesn't hurt. */
  harmless?: boolean;
  /** Moved by hand (Meathead 2's staff room): its AI's held off with a short pauseTimer, which isn't a daze (no stars). */
  puppet?: boolean;
  /** Drawn posed (a game's own animation over whatever it's doing: Meathead 2's puking): leaned about its feet by `lean`,
   *  scaled about them, filtered, and (`face`) turned to face that way whichever way it'd be drawn facing. */
  pose?: { lean: number; sx: number; sy: number; filter?: string; face?: 1 | -1 };
  /** Running from him till this frame (Meathead 2's soul sucker): it faces away, and makes no headway toward him, but
   * still does what it does (shoots, swings). */
  runFrom?: number;
  /** Being electrocuted till this frame by something other than his taser (Meathead 2's lightning): shown the same,
   * and it goes nowhere meanwhile. */
  shockedUntil?: number;
  /** Walks through other enemies rather than being eased apart from them (Meathead 2's people in line). */
  noCrowd?: boolean;
  /** A bystander: only Meathead can hurt it (his shots and moves, or something he knocked into it); nothing else does. */
  innocent?: boolean;
  /** A mid-boss already took a hit from this tsunami wave (it's washed over once, not every frame). */
  tsunamiWave?: number;
  /** A boss in the middle of a weakness's pain (bossState 'pain'): which (Victor 'doused' or 'scalded', Hector
   * 'flattened'). How much this tsunami's already taken off him, and the wave his fire was put out by. */
  painKind?: string;
  /** A pain played over whatever he's doing (it doesn't stop him): frames of it left. */
  painT?: number;
  tsunamiPaid?: number;
  dousedWave?: number;
  /** Victor: the steam off a vent the wave's blown, on its way back to him (the frame it gets to him, and the wave's number). */
  steamAt?: number;
  steamWave?: number;
  /** ...where it came from, and when it set off (for drawing it on its way). */
  steamFrom?: { x: number; y: number };
  steamStart?: number;
  /** The wave Victor's already sneered at for only rinsing him. */
  rinsedWave?: number;
  /** Artie, after a panic: no big leap till this frame. */
  calmAt?: number;
  /** Artie panicking: big leaps still to go. */
  panicLeaps?: number;
  /** Frozen solid in mid-air (caught mid-jump): dropping like the block of ice it is, to shatter on the ground. */
  frozenFall?: boolean;
  /** Which look a themed enemy has (a beachgoer's outfit and pastime, a gator in the water or on land). */
  variant?: number;
  /** Died of an overdose: its body flies off, veering toward anything airborne and wrecking what it hits. */
  overdosed?: boolean;
  /** Enemies an overdosed body has already plowed through. */
  overdoseHitIds?: string[];
  /** Overdosed flight: rising (arcing at something), diving straight at something below, or dropping. */
  overdosePhase?: 'rise' | 'dive' | 'drop' | 'home';
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
  /** Meathead's hits don't knock him back (the gym's man behind the mat: only a shove moves him; others shoved or flung
   * into him still can). */
  unshakeable?: boolean;
  /** A boss has had his say about being hit with his own weapon (the first time, he always does). */
  saidOwnWeapon?: boolean;
  said50?: boolean;
  said25?: boolean;
  // Drug Trade Dale
  shipmentType?: 'cocaine' | 'speed' | 'meth';
  shipmentCount?: number;
  /** Just for show: the frame he last let go of a bag or a drum (his throw's follow-through is drawn from it). */
  daleThrowAt?: number;
  dashCount?: number;
  truckX?: number;
  truckActive?: boolean;
  /** Tires blown out on Meathead's sludge: the truck is careening into Dale. */
  truckCrashing?: boolean;
  /** The frame the truck first smashed through the pharmacy's front doors (left) and its back wall (right). */
  leftWallDownAt?: number;
  rightWallDownAt?: number;
  /** How many times his truck's been through the place (the more, the more of it's wrecked: looks only). */
  truckPasses?: number;
  /** How many times it's plowed through each end of it, and the frame it last did (the holes get bigger every time). */
  leftThroughs?: number; rightThroughs?: number; leftThroughAt?: number; rightThroughAt?: number;
  /** How far into the place each run of the truck got (its front, world x): a run that's wrecked or crashed short of
   * the far end only did for what it got to. */
  truckReach?: number[];
  /** (Oscar) How many times his cigarette's set the oil going: his showroom's that much more burned out (looks only). */
  blazes?: number;
  /** This run of the truck's already through that end. */
  truckThroughLeft?: boolean; truckThroughRight?: boolean;
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
  /** Oscar, staring at his own cigarette hanging in the air in the taser's beam. */
  baffled?: boolean;
  emergeY?: number;
  /** Ernie stood up on a boulder: how long he'll be up there (the climb up is timed off it). */
  perchFor?: number;
  /** Ernie: he's seen Meathead stunned by a quake (once a stun), and how long till he makes him pay for it. */
  sawStun?: boolean;
  punishT?: number;
  /** ...and the kick that sends it: frames of the follow-through left. */
  kickT?: number;
  /** Ernie, after a heave: a beat watching it go before he runs for it, and how hard he runs (it's not the same every time). */
  runDelay?: number;
  runMul?: number;
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
  /** Oscar: when he's next got something to say to you (a sale, or later a bribe), and how many of each he's made. */
  pitchAt?: number;
  pitchN?: number;
  bribeN?: number;
  /** What Meathead's got to say back to it, waiting for Oscar to finish (and how long it's been quiet). */
  pitchReply?: string;
  pitchQuiet?: number;
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
  /** The finale's pitched boulder: a fastball homing in on the alien (see updatePitchedRock). */
  pitched?: boolean;
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
  /** Hits him this hard (in place of the usual shove back). */
  knock?: { x: number; y: number };
  /** Which household item it is (a tenant's throw: a pot, a toaster, a shoe, a potted plant, a phone). */
  item?: number;
  /** What a gun goon's shot looks like (a slug, a frost bolt, a flare). */
  shot?: ShotLook;
  isDart?: boolean;
  isCocaine?: boolean;
  isMethBarrel?: boolean;
  /** Just for show: the frame it was thrown (a fresh throw's sparkle, or its spin starting with a wobble). */
  bornAt?: number;
  isSludge?: boolean;
  /** Sludge run on through a ledge: the puddle it makes is the same size as the one it left up there. */
  puddleW?: number;
  /** ...and the underside of the ledge it ran through (it stretches down off it in a string), or, on the puddle up on
   * a ledge, the ledge's underside and ends (it hangs off the bottom of it in drips). */
  dripFrom?: number;
  overhang?: { y: number; x1: number; x2: number };
  /** Just for show (Tommy's puke stream, say: where it lands is what hurts): never hits him, and gone when it lands. */
  visualOnly?: boolean;
  /** One of the beaten alien's sad little bolts (slow, droopy, barely hurts): drawn by the finale stage. */
  sadBolt?: boolean;
  isOilRocket?: boolean;
  /** A round out of the machine gun. */
  isLmg?: boolean;
  /** A ray gun's bolt (Meathead 2's pistol): drawn pink, and what it kills it vaporizes. */
  isRay?: boolean;
  /** A shot from a game's own weapon (combat/customWeapons.ts): which one; `customData` is that weapon's own. */
  custom?: WeaponType;
  customData?: unknown;
  /** It's already fouled the water it went into (once is enough). */
  stainedWater?: boolean;
  /** Fired from a crouch: this rocket ignores steering and flies straight. */
  noSteer?: boolean;
  /** The finale's fork: an outside rocket of the three, holding this climb or dive the whole way. */
  forkDy?: number;
  isOscarRocket?: boolean;
  isCigarette?: boolean;
  /** Frames the taser has been on this cigarette. */
  zapFrames?: number;
  /** The cigarette: the frame the taser last had hold of it (let go of, it carries on where it was going). */
  zapAt?: number;
  isDarkness?: boolean;
  isLingering?: boolean;
  /** A sludge puddle grown into a slick (the finale: puddles run together and creep out along the floor). */
  slick?: boolean;
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
  /** Off the oil rocket launcher's igniter (Y / F): weaker than the flamethrower proper. */
  alt?: boolean;
  /** The finale's souped-up stream (wall to wall, fatter): it sheds fewer, bigger flecks per segment (there are more of them). */
  big?: boolean;
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
  /** Open grating (a fire escape landing): he stands on it, but anything thrown goes straight through it. */
  grating?: boolean;
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
  /** Blood that came out of him (it doesn't stick back onto him). */
  ownBlood?: boolean;
  color: string;
  size: number;
  isGlass?: boolean;
  isWater?: boolean;
  isBossGore?: boolean;
  isStuck?: boolean;
  /** Blood that's hit the floor and lies there (fades normally, unlike isStuck). */
  isSplat?: boolean;
  /** Blood landed on a floor: how far that floor goes, so its splat lies on it and nowhere else. */
  splatOn?: SplatSurface;
  /** Draw at this opacity instead of fading with life (short, bright bursts). */
  alpha?: number;
  /** A glob of the flamethrower's molten stream: drips, cools as it goes (its crust darkening), and lies where it lands. */
  molten?: boolean;
  /** Falls (this much more speed each frame) and comes to rest on the ground, with a little bounce: a casing, a pebble, a drip. */
  grav?: number;
  /** Drawn as a plain block on the pixel grid (lit on its top-left), never as a twinkle, streak or clump. */
  chunk?: boolean;
}

/**
 * The floor a drop of blood landed on: the height of its top at each 2px column either side of where the drop came
 * down, as far as it goes on (to an edge, a gap or a wall), from x0. Its splat is cut off past that.
 */
export interface SplatSurface {
  face: 'floor';
  /** How it was going when it hit. */
  vx: number;
  vy: number;
  x0: number;
  cols: number[];
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
