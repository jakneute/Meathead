import { WeaponType } from './types';

/**
 * MEATHEAD MASTER TWEAKING SHEET
 * Gameplay, balance, and feel variables. Stage/boss metadata lives in
 * content/roster.ts and all voice lines live in content/dialogue.ts.
 */

// ==========================================
// 1. ENGINE & CANVAS CONFIG
// ==========================================
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
/**
 * The main HUD's corner (top left: health, power, the weapon): anything a stage puts up across the top of the screen
 * (a boss's bar, a counter, a meter, a hint) goes right of HUD_CLEAR_X or below HUD_CLEAR_Y, never under it. Use
 * topBand() for a bar along the top.
 */
export const HUD_CLEAR_X = 310, HUD_CLEAR_Y = 104;
/** The stretch along the top of the screen that's clear of the main HUD (for a bar, a counter, a banner). */
export const topBand = () => ({ x1: HUD_CLEAR_X + 10, x2: CANVAS_WIDTH - 20, mid: (HUD_CLEAR_X + 10 + CANVAS_WIDTH - 20) / 2 });
/** The game canvas has this many real pixels per game pixel, so text and lines stay crisp when the window is scaled up. */
export const RENDER_SCALE = 2;
export const SCREEN_SHAKE_MAX = 15;
export const VULGARITY_TEXT_DURATION = 120;
export const BOSS_VULGARITY_DURATION = 150;
export const SPOKEN_TEXT_HOLD = 1200;   // text stays up while its line is being spoken...
export const BOSS_WEAPON_REACTION_CHANCE = 0.15;   // chance a boss taunts back when hit by a weapon
export const BOSS_WEAPON_REACTION_COOLDOWN = 240; // frames between those taunts
export const BOSS_OWN_WEAPON_DAMAGE = 0.12;      // a boss hit with his own weapon takes this much of the usual damage
export const BOSS_OWN_WEAPON_REACTION_CHANCE = 0.5; // ...and after the first time (always), how often he says so
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
/** The weapon test range after a boss (a one-screen void arena run by its own copy of the engine). */
export const WEAPON_RANGE_STAGE = 'WEAPON_RANGE';
/** The practice range in the garage: the same range, in a boxing ring. */
export const PRACTICE_RANGE_STAGE = 'PRACTICE_RANGE';
/** The gym's ceiling over the ring (low enough to clear the range's writing across the top of the screen). */
export const RING_CEILING_Y = 150;
/** ...and its mat (up clear of the weapons and buttons along the bottom of the screen). */
export const RING_FLOOR_Y = 480;
/** Is this one of the ranges (no pickups, no stage of its own)? */
export const isRangeStage = (stageId: string | null | undefined) => stageId === WEAPON_RANGE_STAGE || stageId === PRACTICE_RANGE_STAGE;
// Oil rockets can be nudged up or down in flight (enough to catch a flyer, not to turn corners)
export const OIL_ROCKET_STEER_ACCEL = 0.6;
export const OIL_ROCKET_STEER_MAX = 8;          // vertical speed cap (about 18 degrees off level)
// An overdosed body: launched upward, it arcs toward an enemy on the way up (strongly preferring
// airborne ones), then at the top dives in a straight line at an enemy below, and splats on the ground.
// Anything it plows into on the way takes a massive hit.
export const OVERDOSE_GRAVITY = 0.65;          // on the way up
export const OVERDOSE_RISE_RANGE = 650;        // how far it looks for something to arc into
export const OVERDOSE_RISE_STEER = 0.45;       // how hard it corrects its sideways speed toward the arc (0..1 per frame)
export const OVERDOSE_MAX_SIDE_SPEED = 20;
export const OVERDOSE_MAX_RISE_SPEED = 32;     // it can kick harder upward to reach a flyer above the top of its arc
export const OVERDOSE_DIVE_RANGE = 700;        // how far it looks for something to dive into from the top
export const OVERDOSE_DIVE_SPEED = 19;
export const OVERDOSE_DROP_GRAVITY = 0.9;      // nothing to dive at: straight down, fast
export const OVERDOSE_HIT_DAMAGE = 300;        // to anything it plows into (no regular enemy survives it)
export const OVERDOSE_MAX_FRAMES = 150;        // a flight that hasn't landed by now (no ceiling, a bottomless drop) bursts in mid-air
export const BOSS_DOOR_X = 7200;
export const DOOR_WIDTH = 40;
export const ARENA_LEFT = BOSS_DOOR_X + DOOR_WIDTH;
export const ARENA_RIGHT = 7960;
/** Oily Oscar's refinery is twice as wide as a normal boss room, so the camera scrolls inside it. */
export const OSCAR_ARENA_RIGHT = ARENA_RIGHT + (ARENA_RIGHT - ARENA_LEFT);
/** The true final fight: the alien who was wearing the President, in the White House press room (straight off the
 * ending: no level before it, he's already facing him). See stages/finale and bosses/alien.ts. */
export const FINALE_STAGE = 'Imposter Invasion';
/** Before all that: the walk out to his mark for the medal, in the same press room (stages/whiteHouse). His to walk, and
 * the ceremony when he's on it. */
export const WALK_ON_STAGE = 'Medal Ceremony';
/** The press room's inside is this wide (the camera pulls back to take in all of it, its side walls too). */
export const FINALE_ARENA_RIGHT = ARENA_LEFT + 1120;
/** Meathead's hide in the finale: everything that hurts him there does this share of what it would anywhere else. */
export const FINALE_DAMAGE_TAKEN = 0.06;

// ==========================================
// 3. PLAYER CORE STATS
// ==========================================
export const INITIAL_PLAYER_HEALTH = 100;
export const PLAYER_INVINCIBILITY_FRAMES = 60;
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
/** Swimming: how much of gravity he feels, how fast he sinks at most, a stroke up (jump), the leap out when he's at the surface, and his pace. */
export const SWIM_GRAVITY_MULT = 0.28;
export const SWIM_MAX_SINK = 3.2;
export const SWIM_STROKE = -5.8;
export const SWIM_LEAP = -12.5;
export const SWIM_SPEED_MULT = 0.6;
/** On skis (Artie's avalanche run) he jumps much higher and hangs longer, to clear what's coming at speed. */
export const SKI_JUMP_SPEED_MULT = 1.3;
export const SKI_JUMP_HOLD_MULT = 1.5;
/** How long his standing kick lasts (booting the skier, the fisherman, the hipster off what he's taking). */
export const KICK_POSE_FRAMES = 24;
/** How long the pose for dropping down through a ledge lasts at most (it ends when he lands, shoots or does a move). */
export const LEDGE_DROP_FRAMES = 36;
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
// Spent cells refill one after another, through ordinary jumps too, but a power move that ends
// in the air stops the refill until he lands. Bouncing a dive kick off an enemy refunds a cell.
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
export const ENEMY_DAZE_FRAMES = 40;
export const SPECIAL_HURT_FRAMES = 32;          // recovery animation after being hit mid-special
/** Enemy masses by id prefix; heavier enemies get pushed less and bounce you back harder. */
export const ENEMY_MASS: Record<string, number> = {
  flyer: 100,
  'heavy-flyer': 300,
  shield: 250,
  tank: 300,
  rusher: 450,
  boss: 500,
  // (the themed enemies carry their own: see KIND_STATS in enemies/kinds)
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
  // (eight; Victor's 666 still goes in five waves that put his fire out or blow a vent into steam, 150 each: three to spare)
  'TSUNAMI': 8,
  'NEEDLES': 120,
  'TASER': 400,
  'SLUDGE': 24,
  'OIL_ROCKET': 22,
  // (Dirty Dan's machine gun: it's only his for the chase, and it never runs dry till it's over)
  'LMG': Infinity,
  // (Meathead 2's souvenir launcher: a big bag of junk)
  'SOUVENIR': 60,
  // (Meathead 2's soul sucker: frames of sucking)
  'SOUL_SUCKER': 600,
  // (Meathead 2's laser-guided flintlock: balls and powder)
  'FLINTLOCK': 24,
  // (Meathead 2's spellbook of the damned: its mana (a storm 11, bulking up 24)
  'SPELLBOOK': 100,
  // (Meathead 2's clapperboard: takes)
  'STUNT_CAR': 6,
  // (Meathead 2's mallet of pain: its durability)
  'MALLET': 100,
  // (Meathead 2's otherworldly spawner: litters)
  'SPAWNER': 50,
  // (Meathead 2's crossbow of plagues: darts)
  'CROSSBOW': 150,
};

/** A fresh ammo loadout with every weapon topped up. */
/** The finale's souped-up guns come at a price: a smaller load each (and the tsunami just five). */
export const FINALE_AMMO_SCALE = 0.7, FINALE_TSUNAMI_AMMO = 5;
/** A weapon's full load on a stage (the finale's smaller). */
export const maxAmmo = (w: WeaponType, stageId?: string | null) =>
  stageId !== FINALE_STAGE || !Number.isFinite(MAX_AMMO[w]) || MAX_AMMO[w] <= 0 ? MAX_AMMO[w]
    : w === 'TSUNAMI' ? FINALE_TSUNAMI_AMMO : Math.max(1, Math.round(MAX_AMMO[w] * FINALE_AMMO_SCALE));
export const createFullAmmo = (stageId?: string | null): Record<WeaponType, number> =>
  Object.fromEntries((Object.keys(MAX_AMMO) as WeaponType[]).map(w => [w, maxAmmo(w, stageId)])) as Record<WeaponType, number>;

// BASIC GUN
export const BULLET_DAMAGE = 25;
export const GUN_COOLDOWN = 12;
// DIRTY DAN'S LIGHT MACHINE GUN (the chase on Oscar's stage): a hose of lead, going everywhere
export const LMG_DAMAGE = 22;
export const LMG_COOLDOWN = 3;
export const LMG_VELOCITY = 21;
/** How far off straight a round can go, each way (degrees). */
export const LMG_SPREAD_DEG = 32;
export const GUN_VELOCITY = 18;

// BOULDER (EARTHQUAKE) - ported from the GML oBoulderBlunderbuss / oBoulderBullet.
// A heavy ball: rolls slowly, can be nudged by walking into it or punted with a
// charge/divekick, hits harder the faster it moves, keeps rolling after a kill,
// breaks on walls, and bounces off other boulders like billiard balls.
export const BOULDER_COOLDOWN = 45;
export const BOULDER_THROW_FRAMES = 16;            // his throwing arm's follow-through (the next rock's in his hand after)
export const BOULDER_ROLL_SPEED = gml(2);
export const BOULDER_HEAVE_SPEED_X = gml(1.4);     // up+fire: heaved steeply up from over his head...
export const BOULDER_HEAVE_SPEED_Y = gml(9.4);     // ...so it hits things right above him (and a little higher)
export const BOULDER_SPIKE_SPEED_X = gml(3);        // down+fire in the air: chucked down in front of him at a sharp angle...
export const BOULDER_SPIKE_SPEED_Y = gml(9);        // ...fast (it hits as hard as it's going)
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
export const BOULDER_SHRAPNEL_DAMAGE = 60;

// SHOTGUN ICE (ARTIE) - ported from the GML oShotgunIce / oShotgunBullet.
// A fan of straight-flying pellets that ricochet off terrain and freeze on hit.
export const SHOTGUN_COOLDOWN = 22;
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
/** A shoulder charge into a frozen enemy: on top of that, again (all his weight into a block of ice: it goes to pieces). */
export const FROZEN_CHARGE_MULTIPLIER = 2;
export const FROZEN_PUSH_MULTIPLIER = 1.7;
// A charge (or slide) into an oiled enemy sends it skidding off far harder than a dry one
export const OILED_CHARGE_PUSH_MULTIPLIER = 2.6;
export const OILED_CHARGE_MIN_PUSH = 16;       // even the heaviest oiled enemy goes at least this fast
export const FROZEN_WALL_IMPACT_MULTIPLIER = 6.7;
export const FROZEN_GROUND_IMPACT_MULTIPLIER = 5.4;
/** Greased and going fast, nothing slows it down before the wall (or the floor, off a ledge): it hits with all of it. */
export const OILED_IMPACT_MULTIPLIER = 3;
/** How far below where it left the ground a greased slider has to come down for it to count as a fall off a ledge. */
export const OILED_LEDGE_DROP = 30;
export const FROZEN_ENEMY_IMPACT_DAMAGE = 20;
/** A frozen enemy shoved into a wall or another enemy thaws out on the spot: the ice bursts, and so does he a bit (a big hit on top of the impact; enough to kill him and he shatters). */
export const THAW_BURST_DAMAGE = 70;
/** Frozen mid-jump, it drops like a stone and shatters on the ground: this on top of the burst, more the further it fell. */
export const FROZEN_DROP_DAMAGE = 40, FROZEN_DROP_PER_SPEED = 6;

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
// The flame off the oil rocket launcher (Y / F): an igniter for what it's slicked, not a flamethrower of its own
export const ALT_FLAME_DAMAGE_SCALE = 0.3;          // of the flamethrower's damage (enemies, mid-bosses, bosses)
export const ALT_FLAME_RANGE_SCALE = 0.65;          // of its reach
export const FIRE_TICK_RATE = 12;
export const FIRE_DOT_DAMAGE = 4;
export const FIRE_DOT_DAMAGE_HEAVY = 112;
export const FIRE_DOT_DAMAGE_ENEMY = 90; // (an enemy on fire: a touch less than a burning barrel takes)

// TSUNAMI (HURRICANE)
export const TSUNAMI_COOLDOWN = 120;
export const TSUNAMI_WAVE_SPEED = 15;
/** How far it goes out on a stage, of the full run it makes in a boss's arena (where it's the whole room, wall to
 * wall): it still wipes out whatever it reaches, it just doesn't reach the far side of the screen and beyond. */
export const TSUNAMI_STAGE_RANGE = 0.6;
export const TSUNAMI_DAMAGE_BOSS = 50;
export const TSUNAMI_DAMAGE_WEAKNESS = 150;
/** A mid-boss isn't washed away by it, but it's a heavy hit (the moose, the Eye)... */
export const TSUNAMI_DAMAGE_MIDBOSS = 300;
/** ...except the doorman: a wall of water barely moves a man that size. */
export const TSUNAMI_DAMAGE_DOORMAN = 12;

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
/** The current jumps from whatever the taser's got to anyone this close to it (edge to edge, px), and on from them, to
 * this many more at most. (The boxer and the balloon man in the practice ring, one right over the other, are 50 apart:
 * it jumps that with room to spare.) */
export const TASER_CHAIN_REACH = 75, TASER_CHAIN_MAX = 6;
export const TASER_BOSS_DAMAGE_REDUCTION = 0.5;
export const TASER_OVERLOAD_FRAMES = 300;   // taser is unusable after bursting Oily Oscar

// SLUDGE BARFER (TOMMY)
export const SLUDGE_DAMAGE = 8;
export const SLUDGE_DOT_DAMAGE = 12;
export const SLUDGE_DOT_TICK = 8;
export const SLUDGE_LINGER_DURATION = 60;
export const SLUDGE_COOLDOWN = 90; 
/** The filth shield's up (it has no time limit: a hit, or putting the Sludge Barfer away, takes it down). */
export const FILTH_SHIELD_DURATION = 240; 
export const FILTH_SHIELD_CONTACT_DAMAGE = 250;   // to a regular enemy (nothing ordinary survives it)
/** To a boss it's one hit, the same as a shot (on top of whatever he hit him with), and it's gone: a little more on Dale,
 * who's weak to the barf, but not much (the barfer's other tricks are what do for him). */
export const FILTH_SHIELD_BOSS_DAMAGE = 25, FILTH_SHIELD_BOSS_WEAKNESS_DAMAGE = 35;

// OIL ROCKET (OSCAR)
export const OIL_ROCKET_DAMAGE = 45;
export const OIL_ROCKET_SPLASH_DAMAGE = 80;
export const OIL_ROCKET_SPLASH_RADIUS = 120;
export const OIL_ROCKET_COOLDOWN = 45;
export const OIL_ROCKET_OILED_DURATION = 300; // 5 seconds
export const OIL_ROCKET_OILED_PUSHBACK_MULT = 2.5;
export const OIL_ROCKET_NUKE_DAMAGE = 1500;
/** A boss in the blast: a big hit, not the end of him (bigger if crude's his weakness). */
export const OIL_ROCKET_NUKE_BOSS_DAMAGE = 75, OIL_ROCKET_NUKE_BOSS_WEAKNESS_DAMAGE = 150;
export const OIL_ROCKET_NUKE_RADIUS = 420;          // setting an oiled enemy on fire levels everything this close
export const OILED_COLLISION_DAMAGE = 25;

// ==========================================
// 5. BOSS & ENEMY TUNING
// ==========================================
// Against a boss (666 health, a second's breather after every hit): a shot from anything is 25 (27 of them), his
// weakness 100 (7). The charge is for making space, so it's a little more than a shot; the dive kick and the uppercut
// are the big ones.
export const BOSS_CHARGE_DAMAGE = 35;
/**
 * Against regular enemies the shoulder charge is for making space (a shove, a little damage) and the slide tackle is
 * for taking out small ground critters in one go (wolverines, raccoons...: see isSmallCritter), a little damage to
 * anything bigger. The big hits are the dive kick (on the ground) and the uppercut (in the air).
 */
export const ENEMY_CHARGE_DAMAGE = 20, ENEMY_SLIDE_DAMAGE = 20;
export const BOSS_UPPERCUT_DAMAGE = 50;
export const ENEMY_UPPERCUT_DAMAGE = 150;
export const BOSS_DIVEKICK_DAMAGE = 50;
export const ENEMY_DIVEKICK_DAMAGE = 150;
/** Those four against regular enemies, as the game playing has them (Meathead 2 sets its own, lighter: in line with its
 *  throws). */
export const enemyMeleeDamage = { charge: ENEMY_CHARGE_DAMAGE, slide: ENEMY_SLIDE_DAMAGE, uppercut: ENEMY_UPPERCUT_DAMAGE, divekick: ENEMY_DIVEKICK_DAMAGE };
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
// (how long after a stomp or a boulder hitting the ground being on the ground stuns you: a short window to be in the air for)
export const ERNIE_STOMP_VIBRATION_DURATION = 16;

// TOXIC TOMMY: how much he speeds up as he loses health (values at 0 HP)
export const TOMMY_SWIM_SPEED = 5.0;
export const TOMMY_SWIM_SPEED_RAMP = 1.5;       // extra swim speed at 0 HP
export const TOMMY_CHASE_FRAMES = 110;           // stalking time before surfacing
export const TOMMY_CHASE_RAMP = 25;              // frames shaved off at 0 HP
export const TOMMY_TELEGRAPH_FRAMES = 62;        // board shake warning before he bursts up
export const TOMMY_TELEGRAPH_RAMP = 10;          // frames shaved off at 0 HP

// BLACKOUT BARRY: a mild speed-up as he loses health
export const BARRY_SPEEDUP_AT_ZERO_HP = 0.55;    // his phases run up to 55% quicker (more than twice as fast by the end)

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
export const OSCAR_SPLASH_DAMAGE = 22;
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
export const OSCAR_FIRE_DAMAGE = 12;
export const OSCAR_TASER_HOLD_FRAMES = 150;    // hold him this long and the taser bursts
export const OSCAR_TASER_RELEASE_GRACE = 8;    // beam can flicker off this long without letting go
export const OSCAR_BURST_DAMAGE = 140;
export const OSCAR_CIGARETTE_ZAP_FRAMES = 55;  // taser held on the cigarette before it blows (let go first: it carries on)
export const OSCAR_CIGARETTE_COMBO_DAMAGE = 200;
/** ...but only if it blows close enough to his face to catch it: how far from his face it can be (px). Further off, it
 * just goes off where it is (and lights any oil it's over). */
export const OSCAR_CIGARETTE_COMBO_REACH = 200;
export const OSCAR_ASH_FACE_FRAMES = 130;

// DRUG TRADE DALE
export const DALE_TRUCK_SPEED = 11;
/** How hard a car-door goon's thrown bottle falls (it's lobbed to come down on you). */
export const BOTTLE_GRAVITY = 0.4;
export const DALE_SPEED_WINDUP = 55;     // frames Dale spends injecting before his speed dash
export const DALE_TRUCK_DAMAGE = 28;
export const DALE_PUSHBACK_VEL = { x: 30, y: -15 };
export const METH_BARREL_DAMAGE = 18;
export const ENEMY_BULLET_DAMAGE = 16;

// ==========================================
// 6. PICKUPS & PROGRESSION
// ==========================================
export const AMMO_PICKUP_PCT = {
  SMALL: 0.20,
  LARGE: 0.50
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
  /** The flamethrower's: not flame so much as liquid rock, white-hot to cooling red. */
  MOLTEN: ['#FFF1A8', '#FFC23D', '#FF8A1F', '#F2541B', '#C2260F'],
  WATER: ['#00BFFF', '#1E90FF', '#4169E1', '#0000FF', '#ADD8E6'],
  STEAM: ['#FFFFFF', '#E0F7FA', '#B2EBF2', '#E1F5FE'],
  POOP: ['#5D4037', '#3E2723', '#4E342E', '#795548', '#212121'],
  POWDER: ['#FFFFFF', '#F0F0F0', '#E0E0E0', '#D0D0D0', '#B0B0B0'],
  METH: ['#00E5FF', '#18FFFF', '#E1F5FE', '#81D4FA', '#01579B'],
  SPARKS: ['#00E5FF', '#18FFFF', '#FFFFFF', '#FFFF00'],
  SLUDGE: ['#1B5E20', '#2E7D32', '#43A047', '#66BB6A', '#004D40'],
  OIL: ['#212121', '#3E2723', '#000000', '#4E342E', '#37474F']
};

/**
 * How each stage opens. 'skyfall': he drops out of the sky (through the clouds the
 * deploy transition from target select ends in) and lands like a meteor.
 * 'window': the original, he crashes in through a pane of glass (kept for
 * reference; not used right now).
 */
export const LEVEL_INTRO_STYLE = 'skyfall' as 'skyfall' | 'window';
/** Skyfall: how many frames the clouds take to part at the start of a stage. */
export const SKYFALL_CLOUD_FRAMES = 30;
