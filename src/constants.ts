import { WeaponType } from './types';

/**
 * MEATHEAD MASTER TWEAKING SHEET
 * Gameplay, balance, and feel variables. Stage/boss metadata lives in
 * stages.ts and all voice lines live in dialogue.ts.
 */

// ==========================================
// 1. ENGINE & CANVAS CONFIG
// ==========================================
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const SCREEN_SHAKE_MAX = 15;
export const VULGARITY_TEXT_DURATION = 120;
export const BOSS_VULGARITY_DURATION = 150;
export const SPOKEN_TEXT_HOLD = 1200;   // text stays up while its line is being spoken...
export const SPOKEN_TEXT_LINGER = 30;   // ...and this long after it finishes
export const BOSS_WEAPON_REACTION_CHANCE = 0.15;   // chance a boss taunts back when hit by a weapon
export const BOSS_WEAPON_REACTION_COOLDOWN = 240; // frames between those taunts
export const VOICE_LINE_COOLDOWN_FRAMES = 60;

// ==========================================
// 2. PHYSICS & ENVIRONMENT
// ==========================================
/** Gravity for enemies, bosses, projectiles and pickups (the player has their own below). */
export const GRAVITY = 0.65;
export const DOOR_OPEN_SPEED = 5;

// ==========================================
// 2b. WORLD GEOMETRY
// ==========================================
export const STAGE_WIDTH = 8000;
export const GROUND_Y = 550;
export const BOSS_DOOR_X = 7200;
export const DOOR_WIDTH = 40;
export const ARENA_LEFT = BOSS_DOOR_X + DOOR_WIDTH;
export const ARENA_RIGHT = 7960;
/** Oily Oscar's refinery is twice as wide as a normal boss room, so the camera scrolls inside it. */
export const OSCAR_ARENA_RIGHT = ARENA_RIGHT + (ARENA_RIGHT - ARENA_LEFT);

// ==========================================
// 3. PLAYER CORE STATS
// ==========================================
export const INITIAL_PLAYER_HEALTH = 100;
export const PLAYER_INVINCIBILITY_FRAMES = 60;
export const TOMMY_PUKE_INVINCIBILITY_FRAMES = 60;
export const TOMMY_PUKE_PUSHBACK_DURATION = 16;
export const PLAYER_STUN_INVINCIBILITY = 30;
export const PLAYER_PUSHBACK_DURATION = 16;
export const PLAYER_PUSHBACK_VEL_X = 7;
export const PLAYER_PUSHBACK_VEL_Y = -4;
export const PLAYER_STUN_DURATION = 40;

// ==========================================
// 3b. PLAYER MOVEMENT & SPECIAL MOVES
// Ported from the GameMaker version (scripts/consts). Values are written in
// GameMaker units and scaled with gml(): that game uses a 480x270 view,
// this one 800x600. Frame counts carry over as-is (both run at 60fps).
// ==========================================
export const GML_SCALE = 600 / 270;
const gml = (value: number) => value * GML_SCALE;

// Walking
export const PLAYER_MOVE_SPEED = gml(2);
export const PLAYER_ACCEL_BASE = 0.08;          // lerp factor toward target speed
export const PLAYER_FRICTION_BASE = 0.2;        // lerp factor toward 0 on the ground
export const PLAYER_AIR_FRICTION = 0.05;        // lerp factor toward 0 in the air
export const CROUCH_SLIDE_FRICTION_MULT = 0.4;  // crouching keeps some momentum
export const ICE_FRICTION_MULTIPLIER = 0.15;    // surface frictionMultiplier on ice stages
export const MIN_MOVE_SPEED = gml(0.01);        // below this, x velocity snaps to 0

// Jumping
export const PLAYER_GRAVITY = gml(0.275);
export const PLAYER_TERMINAL_VELOCITY = gml(9);
export const PLAYER_JUMP_SPEED = gml(-3.15);    // held constant while the jump button is down
export const JUMP_HOLD_FRAMES = 15;
export const COYOTE_AIR_FRAMES = 7;             // hang time before gravity kicks in off a ledge
export const COYOTE_JUMP_FRAMES = 7;            // grace period to still jump after leaving the ground
export const JUMP_BUFFER_FRAMES = 5;
export const LANDING_SHAKE_SPEED = gml(8);      // hard landings/bonks above this shake the camera

// Shoulder charge (hold to extend) and crouch slide
export const CHARGE_SPEED = gml(6.5);
export const CHARGE_DURATION = 30;
export const SLIDE_SPEED = gml(4.5);
export const SLIDE_DURATION = 45;

// Uppercut
export const UPPERCUT_SPEED = gml(6.5);
export const UPPERCUT_DURATION = 20;
// Power: two cells shared by the shoulder charge / slide and the uppercut (any two in a row).
// Spent cells refill one after another while he's on the ground.
export const POWER_CELLS = 2;
export const POWER_CELL_RECHARGE = 30;          // frames to refill one cell
export const UPPERCUT_LAUNCH_SPEED = gml(9);    // how hard a surviving enemy gets popped up
export const UPPERCUT_LAUNCH_X = gml(1.5);

// Divekick
export const DIVEKICK_SPEED = gml(12);
export const DIVEKICK_ANGLE = 60;

// Hit reactions
export const PLAYER_MASS = 350;
export const RECOIL_FRAMES = 30;                // controls locked after bouncing off an enemy
export const BOUNCE_FRAMES = 5;                 // controls locked after a divekick stomp
export const ENEMY_DAZE_FRAMES = 60;
export const SPECIAL_HURT_FRAMES = 32;          // recovery animation after being hit mid-special
/** Enemy masses by id prefix; heavier enemies get pushed less and bounce you back harder. */
export const ENEMY_MASS: Record<string, number> = {
  flyer: 100,
  'heavy-flyer': 300,
  shield: 250,
  tank: 300,
  rusher: 250,
  boss: 500,
};

// ==========================================
// 4. WEAPON TUNING (THE "MEAT")
// ==========================================

// GLOBAL AMMO
export const MAX_AMMO: Record<WeaponType, number> = {
  'GUN': Infinity,
  'BOULDER': 20,
  'SHOTGUN': 50,
  'FLAMETHROWER': 500,
  'TSUNAMI': 8,
  'NEEDLES': 120,
  'TASER': 400,
  'SLUDGE': 24,
  'OIL_ROCKET': 15
};

/** A fresh ammo loadout with every weapon topped up. */
export const createFullAmmo = (): Record<WeaponType, number> => ({ ...MAX_AMMO });

// BASIC GUN
export const BULLET_DAMAGE = 25;
export const GUN_COOLDOWN = 12;
export const GUN_VELOCITY = 18;

// BOULDER (EARTHQUAKE) - ported from the GML oBoulderBlunderbuss / oBoulderBullet.
// A heavy ball: rolls slowly, can be nudged by walking into it or punted with a
// charge/divekick, hits harder the faster it moves, keeps rolling after a kill,
// breaks on walls, and bounces off other boulders like billiard balls.
export const BOULDER_COOLDOWN = 45;
export const BOULDER_ROLL_SPEED = gml(2);
export const BOULDER_HEAVE_SPEED_X = gml(1.4);     // up+fire: heaved steeply up from over his head...
export const BOULDER_HEAVE_SPEED_Y = gml(8.5);     // ...so it hits things right above him
export const BOULDER_GRAVITY = gml(0.5);
export const BOULDER_MAX_SPEED = gml(10);
export const BOULDER_LIFETIME = 300;
export const BOULDER_DAMAGE_PER_SPEED = 50;         // damage = this x speed (in GML units, min 1)
export const BOULDER_WALK_NUDGE = 0.05;             // share of the player's speed a walk-in pushes
export const BOULDER_PUNT = 0.6;                    // ...and a charge or divekick
export const BOULDER_BILLIARD_LOSS = 0.8;
// Enemy (Ernie) boulders keep the original bouncing physics
export const BOULDER_SPEED = 7;
export const BOULDER_BOUNCE_DAMPING = 0.6;
export const BOULDER_SHRAPNEL_COUNT = 12;
export const BOULDER_SHRAPNEL_DAMAGE = 60;

// SHOTGUN ICE (ARTIE) - ported from the GML oShotgunIce / oShotgunBullet.
// A fan of straight-flying pellets that ricochet off terrain and freeze on hit.
export const SHOTGUN_COOLDOWN = 30;
export const SHOTGUN_PELLET_COUNT = 10;
export const SHOTGUN_SPREAD_DEG = 45;
export const SHOTGUN_JITTER_DEG = 5;
export const SHOTGUN_PELLET_SPEED_MIN = gml(7);
export const SHOTGUN_PELLET_SPEED_MAX = gml(11);
export const SHOTGUN_PELLET_LIFETIME = 60;
export const SHOTGUN_MAX_BOUNCES = 2;
export const SHOTGUN_BOUNCE_VARIANCE_DEG = 50;
export const SHOTGUN_DAMAGE = 11;                  // per pellet (web enemy health scale)
export const SHOTGUN_FREEZE_TIME = 60;

// FROZEN ENEMY PHYSICS - ported from the GML oEnemyParent.
// Frozen enemies can't act, take double melee damage, fly further when shoved,
// and turn into projectiles that smash into walls, the floor and other enemies.
export const FROZEN_DAMAGE_MULTIPLIER = 2;
export const FROZEN_PUSH_MULTIPLIER = 1.7;
export const FROZEN_WALL_IMPACT_MULTIPLIER = 6.7;
export const FROZEN_GROUND_IMPACT_MULTIPLIER = 5.4;
export const FROZEN_ENEMY_IMPACT_DAMAGE = 20;

// SHOVED ENEMY PHYSICS - ported from the GML oEnemyParent.
export const DAMAGE_WALL_IMPACT_SCALER = 2.0;      // x speed (GML units) when slammed into a wall
export const DAMAGE_FALL_SCALER = 1.5;             // x speed (GML units) when slammed into the floor
export const IMPACT_DAMAGE_THRESHOLD = 5;          // smaller impacts do nothing
export const ENEMY_DOMINO_TRANSFER = 0.6;          // share of a shove passed to the enemy you hit
export const ENEMY_DOMINO_LOSS = 0.5;              // share of the shove you keep
export const DOMINO_DAMAGE_SCALER = 1.0;

// FLAMETHROWER (VOLCANO) - ported from the GML oMoltenFlamethrower / oMoltenStream.
// A stream of 15 short-lived flame segments that grows out to full range,
// stops at walls, sweeps slowly up/down to aim, and locks your facing.
export const FLAMETHROWER_SEGMENTS = 15;
export const FLAMETHROWER_MAX_RANGE = gml(185);
export const FLAMETHROWER_START_RANGE = gml(5);
export const FLAMETHROWER_GROWTH = 0.025;           // lerp toward max range per frame while held
export const FLAMETHROWER_SHRINK = 0.2;             // lerp back when released
export const FLAMETHROWER_AIM_LERP = 0.01;          // how fast up/down aiming sweeps
export const FLAMETHROWER_AIM_DEG = 45;
export const FLAMETHROWER_NOZZLE_GAP = gml(10);
export const FLAMETHROWER_SEGMENT_LIFETIME = 15;
export const FLAMETHROWER_SEGMENT_SIZE = gml(8);
export const FLAMETHROWER_DAMAGE = 1.5;             // per segment that touches an enemy
export const FLAMETHROWER_AMMO_EVERY = 2;           // frames per unit of fuel
export const FIRE_TICK_RATE = 12;
export const FIRE_DOT_DAMAGE = 4;
export const FIRE_DOT_DAMAGE_HEAVY = 112;

// TSUNAMI (HURRICANE)
export const TSUNAMI_COOLDOWN = 120;
export const TSUNAMI_WAVE_SPEED = 15;
export const TSUNAMI_DAMAGE_BOSS = 50;
export const TSUNAMI_DAMAGE_WEAKNESS = 150;

// NEEDLE CANNON (DALE)
export const NEEDLE_DAMAGE = 10;
export const NEEDLE_COOLDOWN = 7;
export const NEEDLE_DOT_TICK_RATE = 30;
export const NEEDLE_DOT_DAMAGE_PER_STACK = 2;
export const NEEDLE_OVERDOSE_THRESHOLD = 4;

// TASER (BLACKOUT)
export const TASER_RANGE = 800;
export const TASER_DOT_DAMAGE = 3; 
export const TASER_TICK_RATE = 6;
export const TASER_AMMO_CONSUMPTION_RATE = 5;
export const TASER_FIRE_THRESHOLD = 120;
export const TASER_BOSS_DAMAGE_REDUCTION = 0.5;
export const TASER_OVERLOAD_FRAMES = 300;   // taser is unusable after bursting Oily Oscar

// SLUDGE BARFER (TOMMY)
export const SLUDGE_DAMAGE = 8;
export const SLUDGE_DOT_DAMAGE = 12;
export const SLUDGE_DOT_TICK = 8;
export const SLUDGE_LINGER_DURATION = 60;
export const SLUDGE_COOLDOWN = 90; 
export const FILTH_SHIELD_DURATION = 240; 
export const FILTH_SHIELD_CONTACT_DAMAGE = 250;

// OIL ROCKET (OSCAR)
export const OIL_ROCKET_DAMAGE = 45;
export const OIL_ROCKET_SPLASH_DAMAGE = 80;
export const OIL_ROCKET_SPLASH_RADIUS = 120;
export const OIL_ROCKET_COOLDOWN = 45;
export const OIL_ROCKET_OILED_DURATION = 300; // 5 seconds
export const OIL_ROCKET_OILED_PUSHBACK_MULT = 2.5;
export const OIL_ROCKET_NUKE_DAMAGE = 1500;
export const OIL_ROCKET_NUKE_RADIUS = 420;          // setting an oiled enemy on fire levels everything this close
export const OILED_COLLISION_DAMAGE = 25;

// ==========================================
// 5. BOSS & ENEMY TUNING
// ==========================================
export const BOSS_CHARGE_DAMAGE = 50;
export const BOSS_UPPERCUT_DAMAGE = 50;
export const ENEMY_UPPERCUT_DAMAGE = 150;
export const BOSS_DIVEKICK_DAMAGE = 50;
export const ENEMY_DIVEKICK_DAMAGE = 150;
export const WEAKNESS_DAMAGE = 100;
export const ENEMY_HIT_COOLDOWN = 60;

// HECTOR HURRICANE
export const HECTOR_PULL_STRENGTH = 1.0;            // pull on his flying poop logs
// Hector's hurricane pull on Meathead, in px/frame of drag (walking is ~4.4).
// You're always pulled, harder the closer you are: past half a screen it's
// mild enough to walk out of; inside that it beats walking, so you have to
// shoulder-charge back out to a safe distance.
export const HECTOR_PULL_RANGE = CANVAS_WIDTH / 2;  // the "safe distance"
export const HECTOR_PULL_EDGE = 40;                 // px over which the pull ramps up inside that range
export const HECTOR_PULL_FARTHEST = 0.8;            // across the whole arena
export const HECTOR_PULL_FAR = 1.8;                 // at the safe distance: still walkable
export const HECTOR_PULL_NEAR = 4.8;                // just inside: slightly beats walking
export const HECTOR_PULL_MAX = 5.5;                 // point-blank

// ERNIE EARTHQUAKE
export const ERNIE_STOMP_VIBRATION_DURATION = 40;

// TOXIC TOMMY: how much he speeds up as he loses health (values at 0 HP)
export const TOMMY_SWIM_SPEED = 5.0;
export const TOMMY_SWIM_SPEED_RAMP = 1.5;       // extra swim speed at 0 HP
export const TOMMY_CHASE_FRAMES = 110;           // stalking time before surfacing
export const TOMMY_CHASE_RAMP = 25;              // frames shaved off at 0 HP
export const TOMMY_TELEGRAPH_FRAMES = 62;        // board shake warning before he bursts up
export const TOMMY_TELEGRAPH_RAMP = 10;          // frames shaved off at 0 HP

// BLACKOUT BARRY: a mild speed-up as he loses health
export const BARRY_SPEEDUP_AT_ZERO_HP = 0.2;     // his phases run up to 20% faster

// OILY OSCAR
export const OSCAR_IDLE_FRAMES = 40;           // repositioning between attacks (shrinks as he loses health)
export const OSCAR_IDLE_RAMP = 15;             // frames shaved off at 0 HP
export const OSCAR_SLIDE_SPEED = 5.5;          // his greasy repositioning slide
export const OSCAR_PREFERRED_DISTANCE = 380;   // how far from Meathead he likes to shoot from
export const OSCAR_LOCK_FRAMES = 45;           // laser on target this long = fire
export const OSCAR_MAX_AIM_FRAMES = 180;       // fires anyway after this long
export const OSCAR_FIRE_WARNING = 20;          // locked on: laser freezes and blinks fast, then he fires
export const OSCAR_ROCKET_SPEED = 19;
export const OSCAR_SPLASH_RADIUS = 105;
export const OSCAR_SPLASH_DAMAGE = 18;
export const OSCAR_OIL_RADIUS = 215;           // walls/floor/ceiling this close to the blast get oiled
export const OSCAR_OIL_CELL = 24;              // oil is tracked in strips this long
export const OSCAR_OIL_FRAMES = 720;           // unlit oil dries up after this long
export const OSCAR_OIL_SPEED_MULT = 0.35;      // walking speed on oil
export const OSCAR_OIL_JUMP_MULT = 0.35;       // jump height on oil (you have to dash out)
export const OSCAR_FLICK_WINDUP = 36;
export const OSCAR_CIGARETTE_FLIGHT = 62;      // frames the flicked cigarette is in the air
export const OSCAR_CIGARETTE_GRAVITY = 0.3;
export const OSCAR_FIRE_FRAMES = 240;          // how long each strip of oil burns
export const OSCAR_FIRE_SPREAD_DELAY = 4;      // frames for fire to jump to the next strip
export const OSCAR_FIRE_DAMAGE = 8;
export const OSCAR_TASER_HOLD_FRAMES = 150;    // hold him this long and the taser bursts
export const OSCAR_TASER_RELEASE_GRACE = 8;    // beam can flicker off this long without letting go
export const OSCAR_BURST_DAMAGE = 140;
export const OSCAR_CIGARETTE_ZAP_FRAMES = 6;   // taser contact before the cigarette blows
export const OSCAR_CIGARETTE_COMBO_DAMAGE = 200;
export const OSCAR_ASH_FACE_FRAMES = 130;

// DRUG TRADE DALE
export const DALE_TRUCK_SPEED = 11;
export const DALE_SPEED_WINDUP = 55;     // frames Dale spends injecting before his speed dash
export const DALE_TRUCK_DAMAGE = 20;
export const DALE_PUSHBACK_VEL = { x: 30, y: -15 };
export const METH_BARREL_DAMAGE = 14;
export const METH_BARREL_HEALTH = 100;
export const ENEMY_BULLET_DAMAGE = 16;

// ==========================================
// 6. PICKUPS & PROGRESSION
// ==========================================
export const AMMO_PICKUP_PCT = {
  SMALL: 0.25,
  LARGE: 0.60
};
export const HEALTH_PICKUP_SMALL = 20;
export const HEALTH_PICKUP_LARGE = 50;

// ==========================================
// 7. PALETTES
// ==========================================
export const COLORS = {
  MEATHEAD_SKIN: '#E67E22',
  MEATHEAD_PANTS: '#273746',
  MEATHEAD_GLOW: '#FFC300',
  GUN: '#5D6D7E',
  GROUND: '#1C2833',
  ENEMY_DRONE: '#8E44AD',
  ENEMY_TANK: '#C0392B',
  ENEMY_FLYER: '#3498DB',
  ENEMY_SHIELD: '#7F8C8D',
  PROJECTILE_PLAYER: '#F1C40F',
  PROJECTILE_ENEMY: '#E74C3C',
  PROJECTILE_ICE: '#00FFFF',
  PROJECTILE_DART: '#D1D5DB',
  TASER_BOLT: '#00E5FF',
  BG_DARK: '#0B0B0B',
  BG_LIGHT: '#1B2631',
};

export const PARTICLE_PALETTES = {
  GORE: ['#8B0000', '#FF0000', '#B22222', '#7C0A02', '#5A0000', '#FF1111'],
  FLESH: ['#FF8A80', '#FF5252', '#FF1744', '#D50000', '#C62828'], 
  ROCK: ['#4E342E', '#3E2723', '#212121', '#757575'],
  GLASS: ['#ADD8E6', '#F0F8FF', '#FFFFFF', '#B0C4DE'],
  FIRE: ['#FF4500', '#FF8C00', '#FFA500', '#FFD700', '#FF0000'],
  WATER: ['#00BFFF', '#1E90FF', '#4169E1', '#0000FF', '#ADD8E6'],
  STEAM: ['#FFFFFF', '#E0F7FA', '#B2EBF2', '#E1F5FE'],
  POOP: ['#5D4037', '#3E2723', '#4E342E', '#795548', '#212121'],
  POWDER: ['#FFFFFF', '#F0F0F0', '#E0E0E0', '#D0D0D0', '#B0B0B0'],
  METH: ['#00E5FF', '#18FFFF', '#E1F5FE', '#81D4FA', '#01579B'],
  SPARKS: ['#00E5FF', '#18FFFF', '#FFFFFF', '#FFFF00'],
  SLUDGE: ['#1B5E20', '#2E7D32', '#43A047', '#66BB6A', '#004D40'],
  OIL: ['#212121', '#3E2723', '#000000', '#4E342E', '#37474F']
};
