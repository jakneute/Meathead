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
export const VOICE_LINE_COOLDOWN_FRAMES = 60;

// ==========================================
// 2. PHYSICS & ENVIRONMENT
// ==========================================
export const GRAVITY = 0.65;
export const FRICTION_DEFAULT = 0.99; 
export const FRICTION_ICE_STAGE = 0.985;
export const FRICTION_ICE_STOP = 0.99;
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

// ==========================================
// 3. PLAYER CORE STATS
// ==========================================
export const INITIAL_PLAYER_HEALTH = 100;
export const PLAYER_SPEED = 4.2; 
export const PLAYER_JUMP_FORCE = -15; 
export const PLAYER_INVINCIBILITY_FRAMES = 60;
export const TOMMY_PUKE_INVINCIBILITY_FRAMES = 60;
export const TOMMY_PUKE_PUSHBACK_DURATION = 16;
export const PLAYER_STUN_INVINCIBILITY = 30;
export const PLAYER_PUSHBACK_DURATION = 16;
export const PLAYER_PUSHBACK_VEL_X = 7;
export const PLAYER_PUSHBACK_VEL_Y = -4;
export const PLAYER_STUN_DURATION = 40;

// SPECIAL MOVES
export const MAX_SPECIAL_CHARGES = 2;
export const SPECIAL_CHARGE_REGEN_FRAMES = 90;
export const CHARGE_SPEED = 13.5; 
export const CHARGE_DURATION = 30;
export const UPPERCUT_FORCE = -16; 
export const UPPERCUT_AIR_SPEED = 3.0; 
export const UPPERCUT_AIR_ACCEL = 0.5; 
export const JUMP_PREP_FRAMES = 2;

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

// BOULDER (EARTHQUAKE)
export const BOULDER_DAMAGE = 250;
export const BOULDER_SPEED = 7;
export const BOULDER_COOLDOWN = 40;
export const BOULDER_BOUNCE_DAMPING = 0.6;
export const BOULDER_SHRAPNEL_COUNT = 12;
export const BOULDER_SHRAPNEL_DAMAGE = 60;

// SHOTGUN (ICE)
export const SHOTGUN_DAMAGE = 15;
export const SHOTGUN_COOLDOWN = 20;
export const SHOTGUN_FREEZE_TIME = 90; 
export const SHOTGUN_PELLET_COUNT = 7;

// FLAMETHROWER (VOLCANO)
export const FLAMETHROWER_DAMAGE = 8;
export const FLAMETHROWER_RANGE = 220;
export const FLAMETHROWER_MAX_RANGE = 800; 
export const FLAMETHROWER_RAMP_FRAMES = 180; 
export const FLAMETHROWER_SPEED_MULT = 0.45;
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

// SLUDGE BARFER (TOMMY)
export const SLUDGE_DAMAGE = 12; 
export const SLUDGE_DOT_DAMAGE = 18; 
export const SLUDGE_DOT_TICK = 6;
export const SLUDGE_LINGER_DURATION = 90; 
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
export const OILED_COLLISION_DAMAGE = 25;

// ==========================================
// 5. BOSS & ENEMY TUNING
// ==========================================
export const BOSS_CHARGE_DAMAGE = 50;
export const BOSS_UPPERCUT_DAMAGE = 50;
export const ENEMY_UPPERCUT_DAMAGE = 150;
export const BOSS_DIVEKICK_DAMAGE = 50;
export const ENEMY_DIVEKICK_DAMAGE = 150;
export const DIVEKICK_SPEED_X = 14;
export const DIVEKICK_SPEED_Y = 24;
export const WEAKNESS_DAMAGE = 100;
export const ENEMY_HIT_COOLDOWN = 60;

// HECTOR HURRICANE
export const HECTOR_PULL_STRENGTH = 1.0;
export const HECTOR_PULL_STRENGTH_ULT = 1.5;

// ERNIE EARTHQUAKE
export const ERNIE_STOMP_VIBRATION_DURATION = 40;

// DRUG TRADE DALE
export const DALE_TRUCK_SPEED = 11;
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
