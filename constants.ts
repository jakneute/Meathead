import { WeaponType } from './types';

/**
 * MEATHEAD MASTER TWEAKING SHEET
 * All gameplay, balance, and feel variables are centralized here.
 */

// ==========================================
// 1. ENGINE & CANVAS CONFIG
// ==========================================
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const FPS_TICK = 1000 / 60;
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
export const BOSS_DOOR_X = 7200;
export const DOOR_WIDTH = 40;
export const DOOR_OPEN_SPEED = 5;

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
// 7. STAGE & UI VISUALS
// ==========================================
export const STAGES_SET_0 = [
  { id: 'Artie Avalanche', color: 'bg-blue-600' },
  { id: 'Victor Volcano', color: 'bg-orange-600' },
  { id: 'Ernie Earthquake', color: 'bg-amber-800' },
  { id: 'Hector Hurricane', color: 'bg-cyan-600' }
];

export const STAGES_SET_1 = [
  { id: 'Toxic Tommy', color: 'bg-green-600' },
  { id: 'Blackout Barry', color: 'bg-gray-900' },
  { id: 'Oily Oscar', color: 'bg-yellow-900' },
  { id: 'Drug Trade Dale', color: 'bg-pink-600' }
];

export const STAGES = (rank: number) => rank === 0 ? STAGES_SET_0 : STAGES_SET_1;

export const BOSS_SET_TITLES: Record<number, string> = {
  0: "THE FOUR ASSHOLES",
  1: "ANOTHER GROUP OF FOUR ASSHOLES"
};

export interface BossLocationData {
  city: string;
  state: string;
  stateCode: string;
  region: string;
  coords: { x: number; y: number };
  coordinatesText: string;
  threatBrief: string;
}

export const BOSS_LOCATIONS: Record<string, BossLocationData> = {
  'Artie Avalanche': {
    city: 'ANCHORAGE',
    state: 'ALASKA',
    stateCode: 'AK',
    region: 'ALASKA INSET',
    coords: { x: 58, y: 236 },
    coordinatesText: "61°13'N 149°54'W",
    threatBrief: 'SUB-ZERO GLACIAL BLIZZARD ZONE'
  },
  'Victor Volcano': {
    city: 'HILO',
    state: 'HAWAII',
    stateCode: 'HI',
    region: 'PACIFIC ISLANDS',
    coords: { x: 172, y: 262 },
    coordinatesText: "19°43'N 155°05'W",
    threatBrief: 'ACTIVE MAGMA CALDERA ANARCHY'
  },
  'Ernie Earthquake': {
    city: 'SAN FRANCISCO',
    state: 'CALIFORNIA',
    stateCode: 'CA',
    region: 'PACIFIC COAST',
    coords: { x: 50, y: 126 },
    coordinatesText: "37°46'N 122°25'W",
    threatBrief: 'SAN ANDREAS FAULT PULVERIZATION'
  },
  'Hector Hurricane': {
    city: 'MIAMI',
    state: 'FLORIDA',
    stateCode: 'FL',
    region: 'ATLANTIC COAST',
    coords: { x: 370, y: 252 },
    coordinatesText: "25°46'N 80°11'W",
    threatBrief: 'CAT-5 STORM SURGE & FLOODING'
  },
  'Toxic Tommy': {
    city: 'FLINT',
    state: 'MICHIGAN',
    stateCode: 'MI',
    region: 'GREAT LAKES',
    coords: { x: 326, y: 88 },
    coordinatesText: "43°00'N 83°41'W",
    threatBrief: 'BIO-CORROSIVE SEWAGE OVERFLOW'
  },
  'Blackout Barry': {
    city: 'NEW YORK CITY',
    state: 'NEW YORK',
    stateCode: 'NY',
    region: 'MID-ATLANTIC',
    coords: { x: 396, y: 106 },
    coordinatesText: "40°42'N 74°00'W",
    threatBrief: 'HIGH-VOLTAGE POWER GRID CRISIS'
  },
  'Oily Oscar': {
    city: 'HOUSTON',
    state: 'TEXAS',
    stateCode: 'TX',
    region: 'GULF COAST',
    coords: { x: 250, y: 218 },
    coordinatesText: "29°45'N 95°22'W",
    threatBrief: 'PETROCHEMICAL REFINERY INFERNO'
  },
  'Drug Trade Dale': {
    city: 'ALBUQUERQUE',
    state: 'NEW MEXICO',
    stateCode: 'NM',
    region: 'SOUTHWEST DESERT',
    coords: { x: 146, y: 162 },
    coordinatesText: "35°05'N 106°39'W",
    threatBrief: 'ILLEGAL PHARMACEUTICAL CARTEL'
  }
};

export const STAGE_COLORS: Record<string, { ground: string, bg: string, accent: string }> = {
  'Artie Avalanche': { ground: '#AED6F1', bg: '#1B2631', accent: '#2E86C1' },
  'Victor Volcano': { ground: '#BA4A00', bg: '#1A0602', accent: '#FF4500' },
  'Ernie Earthquake': { ground: '#6E2C00', bg: '#1C1C1C', accent: '#A04000' },
  'Hector Hurricane': { ground: '#16A085', bg: '#0E2F44', accent: '#00FFFF' },
  'Toxic Tommy': { ground: '#27AE60', bg: '#091A0D', accent: '#ADFF2F' },
  'Blackout Barry': { ground: '#2C3E50', bg: '#000', accent: '#3498DB' },
  'Oily Oscar': { ground: '#3E2723', bg: '#1A110F', accent: '#212121' },
  'Drug Trade Dale': { ground: '#8E44AD', bg: '#1D0C24', accent: '#FFFFFF' },
};

export const WEAPON_NAMES: Record<string, string> = {
  'Artie Avalanche': 'Shotgun Ice',
  'Victor Volcano': 'Flamethrower',
  'Ernie Earthquake': "Big Fuckin' Boulder",
  'Hector Hurricane': 'TSUNAMI!',
  'Toxic Tommy': 'Sludge Barfer',
  'Blackout Barry': 'Taser Overload',
  'Oily Oscar': 'Oil Rocket Launcher',
  'Drug Trade Dale': 'Rusty Needle Cannon'
};

export const WEAPON_DESCRIPTIONS: Record<string, string> = {
  'Artie Avalanche': "Freeze those noodle armed fucks in a block of ice and shatter them into a million pieces with your bulging biceps.",
  'Victor Volcano': "Lock your feet and obliterate enemies and their projectiles.",
  'Ernie Earthquake': "Roll over the competition with ground based pulverization, or fire upwards to heave it like a shotput.",
  'Hector Hurricane': "Screen nuke! Watch as every living thing in your vicinity just fucking dies to torrential destruction!",
  'Toxic Tommy': "Barf out a sample of your finest toxic waste and watch your foes rot in its filth while you become comfortably protected in it.",
  'Blackout Barry': "It's one of those 'human remote controls' the police use! Hold your charge and zap those bastards until they get set on fire!",
  'Oily Oscar': "Coat those greasy bastards in flammable oil and watch them slide around before you nuke them with the flamethrower.",
  'Drug Trade Dale': "Inject the enemy with drugs! Which drugs? All the drugs! Keep pumping them until they overdose!"
};

export const BOSS_WEAPON_MAP: Record<string, WeaponType> = {
  'Artie Avalanche': 'SHOTGUN',
  'Victor Volcano': 'FLAMETHROWER',
  'Ernie Earthquake': 'BOULDER',
  'Hector Hurricane': 'TSUNAMI',
  'Toxic Tommy': 'SLUDGE',
  'Blackout Barry': 'TASER',
  'Oily Oscar': 'OIL_ROCKET',
  'Drug Trade Dale': 'NEEDLES'
};

export const WEAPONS_AFTER_SET_0: WeaponType[] = ['GUN', 'SHOTGUN', 'FLAMETHROWER', 'BOULDER', 'TSUNAMI'];
export const ALL_WEAPONS: WeaponType[] = ['GUN', 'SHOTGUN', 'FLAMETHROWER', 'OIL_ROCKET', 'BOULDER', 'TSUNAMI', 'SLUDGE', 'TASER', 'NEEDLES'];
export const ALL_WEAPONS_SET_0 = WEAPONS_AFTER_SET_0;

// PALETTES
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

export const VULGARITIES = {
  GUN_KILL: ["FUCK YOU", "EAT SHIT", "DIE PIG", "GET Rekt", "WORTHLESS SCUM", "PISS OFF", "MOTHERFUCKER", "GARBAGE", "WASTE OF MEAT", "SHUT UP", "KNEEL", "WEAKLING", "PATHETIC", "PIECE OF TRASH", "SMASHED", "WASH MY SHORTS", "BRO DO YOU EVEN SURVIVE?", "DELTS OF DOOM", "STERILE BITCH", "DO YOU EVEN LIFT?", "DIE ASSHOLE", "NO DEPTH ON THAT SQUAT", "PUMP COVER DESTOWNED", "STAY SMALL", "CHICKEN LEGGED TRASH", "ZERO REPS", "LACKING SYMMETRY", "SKIPPING LEG DAY IS A SIN", "GO BACK TO THE TREADMILL", "FLOPPY ARM BITCH", "CARDIO-LOOKING MOTHERFUCKER", "SIT DOWN AND DIE", "ABSOLUTELY ATROPHIED"],
  BOULDER_KILL: ["CRUSHED BY 45s", "HEAVY WEIGHT LIGHT WORK", "GET COMPACTED", "PLATES TO THE FACE", "STAY FLAT BITCH", "YOU CAN'T RECOVER FROM THAT", "GRAVITY WINS ASSHOLE", "TOTAL COMPRESSION", "CRUSHED BY MY GAINS", "EAT THE ROCK", "STONE COLD STUPID", "PEBBLE-HEADED TRASH", "ROCKED YOUR WORLD", "FLATTENED LIKE A PANCAKE", "HOW'S THAT FOR DENSITY?", "PURE GEOLOGIC FORCE", "SQUASHED LIKE A BUG", "HEAVY METAL HEARTBREAK", "YOU'RE LACKING SUBSTANCE", "GET CRUNCHED", "GEOLOGY SAYS FUCK YOU", "NATURE'S DUMBBELL", "SOLID AS A ROCK... YOU'RE SHIT"],
  SHOTGUN_KILL: ["FREEZE BITCH", "SHATTERED LATS", "ICE COLD COWARD", "STAY FROSTY ASSHOLE", "SHIVER AND DIE", "ICE TO MEET YOU FUCKER", "ABSOLUTE ZERO REPS", "FROZEN TRASH", "GET CRYSTALLIZED", "SHATTER INTO NOTHING", "ICE SCRAPER REQUIRED", "CHILL OUT FOREVER", "COOLING OFF YOUR ROID RAGE", "COLD SHOULDERED BITCH", "BRRRR-EAK IN HALF", "FROSTBITTEN FAILURE", "SUB-ZERO IQ", "WINTER IS COMING... FOR YOU", "GLACIER GAINS", "CRYO-CRUSHED", "ICE BUCKET CHALLENGE... YOU LOST", "SOLIDIFIED SHIT", "SNOWBALL'S CHANCE IN HELL"],
  FLAMETHROWER_KILL: ["FEEL THE BURN", "EXTRA CRISPY TRASH", "SMOKED ASSHOLE", "BURNING FAT FOREVER", "CARDIO HEAT BITCH", "WELL DONE MOTHERFUCKER", "INCINERATED SCUM", "TOASTED GAINS", "FIRE UP THE GRILL", "CHARRED BEYOND REPAIR", "MELTED LATS", "INTERNAL COMBUSTION FAILURE", "HOT MESS", "SPICY DEATH", "FRIED LIKE chicken", "FLAME ON FUCKER", "HUMAN TORCH BITCH", "SMOKE 'EM IF YOU GOT 'EM", "ASH TO ASH TRASH TO TRASH", "PURE THERMIC POWER", "SAUNA'S TOO HOT FOR YOU", "BURNING CALORIES... AND YOU", "OVEN-BAKED FAILURE"],
  TSUNAMI_KILL: ["WASHED AWAY BITCH", "SOGGY PROTEIN TRASH", "DROWN IN MY WAKE", "TSUNAMI OF PAIN", "WET AND WEAK", "SURF'S UP ASSHOLE", "WASHED UP HAS-BEEN", "PURE LIQUID DOMINANCE", "OCEANIC ANGER", "TIDAL WAVE OF FUCK YOU", "SOAKED AND SMASHED", "GET SWEPT AWAY", "YOU'RE OUT TO SEA BITCH", "DEEP SEA DANGER", "WATERLOGGED LOSER", "FLUSHED DOWN THE TOILET", "SINK LIKE A STONE", "HIGH TIDE FOR HELL", "MOIST MOTHERFUCKER", "WATER PRESSURE KILL", "AQUA-CRUSHED", "CLEANSED BY THE PUMP", "DROWNING IN GAINS"],
  CHARGE_KILL: ["EAT MY DELTS", "BULL RUSHED BITCH", "GET PLOWED", "BODY COMPACTED", "MOVE OR DIE FUCKFACE", "PURE ORGANIC BEEF", "CHEST PRESS TO HELL", "CRUSHED BY GAINS", "TRAIN TO FAILURE", "MAX REP KILL", "CHEST DAY IS EVERY DAY", "BULK SMASH", "CHEST DAY DELIVERY", "PECS OF STEEL", "BULL RUSHED INTO THE DIRT", "FRONT DELT DOMINANCE", "GET STEAMROLLED", "RAMMING SPEED FUCKHEAD", "IMPACT PLATE SPECIAL", "SHOULDER PRESS TO THE JAW", "MAX TONNAGE", "FLATTENED LIKE A PANCAKE", "NO ROOM IN MY LANE", "BODY BY BEEF", "OUT THE WAY SMALL FRY"],
  UPPERCUT_KILL: ["EAT THIS CHIN CHECK", "ASCEND TO HELL", "MANDIBLES SMASHED", "HEAD IN THE CLOUDS ASSHOLE", "ORBITAL STRIKE", "AIRBORNE TRASH", "NICE VIEW UP THERE BITCH?", "SAY HI TO THE SQUAT RACK IN THE SKY", "HEAVY WEIGHT LIGHT WORK", "MANDIBLES TO THE MOON", "CHECK YOUR CHIN BITCH", "GOING UP? TO HELL", "UPPERCUT ENEMA", "TO THE MOON ASSHOLE", "LAUNCHED INTO OBSCURITY", "SKY HIGH TRASH", "TAKE A FLIGHT ON PURE ROID POWER", "CRACKED YOUR JAW LIKE AN EGG", "EAT THE CEILING", "VERTICAL LIMIT ACHIEVED", "UPWARDS TRAJECTORY TO FAILURE", "ELEVATOR TO HELL"],
  DART_KILL: ["ENJOY THE TRIP", "TOTAL OVERDOSE", "RUSTY NEEDLE NAPTIME", "RUSTY AND REKT", "NEEDLE IN A GAYSTACK", "SYRINGE SURPRISE", "HAVE A GOOD SLEEP", "ADDICTED TO DEATH", "DIRTY NEEDLE BITCH", "STAY HIGH FOREVER", "JUNKIE TRASH", "OD'D ON MY GAINS", "PHARMACEUTICAL FAILURE", "VEIN VEIN GO AWAY", "TRACK MARK TERROR", "RUSTED OUT COWARD"],
  TASER_KILL: ["SHOCKING PERFORMANCE", "HIGH VOLTAGE BITCH", "FRY LIKE A PIG", "ZAPPED", "RIDE THE LIGHTNING", "AC/DC MOTHERFUCKER", "STATIC CLING TO HELL", "OVERLOADED SCUM", "BURNT TO A CRISP", "ELECTRIC HEARTBREAK", "JUICED UP AND DEAD"],
  SLUDGE_KILL: ["EAT SLOP", "ROT IN FILTH", "TOXIC WASTE OF SPACE", "MELTED TRASH", "DISSOLVE BITCH", "LIQUIFIED LOSER", "CORROSIVE COWARD", "SMELL THE DEFEAT", "BARFED ON", "GET DISSOLVED"],
  OIL_KILL: ["SLICK AND DEAD", "SLID INTO HELL", "GREASY GONE", "OILED UP OBLITERATION", "NUKE FROM ORBIT", "FLAMMABLE FAILURE", "OILY OBITUARY"],
  HURT: ["OW FUCK", "GOD DAMNIT", "SON OF A BITCH", "YOU PIECE OF SHIT", "THAT HURTS MOTHERFUCKER", "YOU TRYING TO RUIN MY PUMP?", "IL WEAVE YOUR SPINE INTO A ROPE", "CATABOLIC BITCH", "MY LATS ARE CRYING", "RICE AND CHICKEN ONLY FROM NOW ON", "MY PUMP IS FADING!", "STOP TOUCHING THE MERCHANDISE", "WATCH THE LATS", "YOU'RE COSTING ME CALORIES", "ROIDS ARE KICKING IN", "YOU RUINED MY RECOVERY", "THAT WASN'T ON THE PROGRAM", "STOP SNAPPING MY GAINS", "MY TRAPS ARE ANGRY", "DON'T KILL MY VIBE BRO", "THAT WAS CATABOLIC AS FUCK", "ARE YOU TRYING TO SHRINK ME?"],
  DEATH: ["FUCK THIS WORLD", "IL SEE YOU IN HELL", "SHIT", "DAMN IT ALL", "WHO'S GONNA SPOT ME NOW?", "CREATINE CRASH", "OVERTRAINED", "CREATINE WITHDRAWAL", "SYSTEM FAILURE... NEED PROTEIN", "FUCK THE WEIGHTS... I'M OUT", "HEART EXPLODED... WORTH IT", "BURY ME IN THE SQUAT RACK", "NO REPS LEFT", "TOTAL MUSCLE FAILURE", "GAINS RESET TO ZERO", "TELL MY SPOTTER... I LOVE HIM", "DROPPED THE BAR ON MY NECK", "SHITTY RECOVERY... GOODBYE", "GYM CLOSED... FOREVER"],
  REBUKE: ["I ALREADY KILLED HIM, YOU DUMB FUCK.", "THAT SHIT-STAIN is ALREADY GONE.", "HE'S DEAD AS SHIT. QUIT WASTING MY GAINS.", "I ALREADY OBLITERATED THAT TRASH."],
  LOCAL_VICTORY: ["YOUR BIOLOGY WAS INFERIOR. THE PUMP PREVAILS.", "GAINS ACHIEVED. WEAKNESS DELETED.", "THAT WAS just A WARM-UP SET.", "IMAGINE BEING ORGANIC AND THIS WEAK.", "IV HAD TOUGHER WORKOUTS IN THE SAUNA.", "PURE BEEF BEATS METAL EVERY TIME."]
};

export const BOSS_DIALOGUE = {
  HURT: {
    'Artie Avalanche': [
      "IL SHOVE THAT ICICLE UP YOUR ASS!",
      "MY BLOOD IS LITERALLY FREEZING, FUCK YOU!",
      "ICE IS FOR DRINKS, NOT MY NUTS!",
      "STOP THE CHILL, YOU FROZEN PRICK!",
      "I'M GOING TO MELT YOUR SMUG FACE!",
      "MY DELTS ARE NUMB, GOD DAMNIT!",
      "YOU COLD-HEARTED BITCH!",
      "I NEED A SAUNA AND YOUR HEAD ON A PLATE!",
      "STOP NIPPING AT MY GAINS, ELSA!",
      "IL BREAK YOU LIKE a cheap ice cube!",
      "WINTER IS OVER ONCE I KILL YOU!",
      "YOU SLIPPERY LITTLE SHIT!"
    ],
    'Victor Volcano': [
      "MY LATS ARE SMELLING LIKE BACON, FUCK!",
      "STOP COOKING THE MERCHANDISE!",
      "I'M SWEATING OUT MY CREATINE, ASSHOLE!",
      "YOU CALL THIS HEAT? I'VE HAD HOTTER SHOWERS!",
      "STOP BURNING MY PUMP COVER!",
      "I'LL EXTINGUISH YOUR ENTIRE BLOODLINE!",
      "YOU SPICY PIECE OF TRASH!",
      "MY SKIN IS PEELING, SON OF A BITCH!",
      "IL SHOVE THAT MAGMA WHERE THE SIGN DON'T SHINE!",
      "I'M WELL DONE, NOW YOU'RE DEAD!",
      "STOP THE GRILLING, YOU OVERCOOKED PRICK!",
      "IL COOL YOU DOWN WITH MY FISTS!"
    ],
    'Ernie Earthquake': [
      "STOP SHAKING THE SQUAT RACK, FUCKER!",
      "I'LL CRACK YOU LIKE a cheap pebble!",
      "MY KNEES AREN'T MEANT FOR THIS VIBRATION!",
      "GEOLOGY SAYS YOU'RE A BITCH!",
      "STOP THE ROCKING, YOU DUSTY OLD PRICK!",
      "IL TURN YOU INTO GRAVEL!",
      "THAT'S A LOW BLOW, EARTH-WORM!",
      "STOP PITTING MY GAINS AGAINST GRAVITY!",
      "I'LL BURY YOU UNDER YOUR OWN SHIT!",
      "YOU CRUSTY MOTHERFUCKER!",
      "STOP BREAKING THE FLOOR, I'M TRAINING HERE!",
      "ILL SMASH YOUR SEDIMENTARY ASS!"
    ],
    'Hector Hurricane': [
      "STOP THE BLOWJOB, YOU WINDY PRICK!",
      "I'M LOSING MY BALANCE, GOD DAMNIT!",
      "WIND DEOESN'T BUILD MUSCLE, ASSHOLE!",
      "IL GROUND YOU PERMANENTLY!",
      "YOU AIR-HEADED PIECE OF SHIT!",
      "STOP BLOWING MY GAINS AWAY!",
      "IL PUNCH THE AIR OUT OF YOUR LUNGS!",
      "YOU OVERGROWN FAN BITCH!",
      "CATEGORY 5 FUCK YOU COMING UP!",
      "IL TIE YOUR WIND IN A KNOT!",
      "STOP TWISTING MY LATS, YOU BLOWHARD!",
      "ILL SMASH YOUR ATMOSPHERE!"
    ],
    'Toxic Tommy': [
      "I'M COVERED IN RANCID PUKE, FUCK!",
      "MY SKIN IS MELTING OFF MY ABS, ASSHOLE!",
      "THAT SLUDGE SMELLS WORSE THAN A CRACKHOUSE TOILET!",
      "STOP BARFING ON MY FRESH PUMP COVER!",
      "MY LUNGS ARE BURNING FROM YOUR ACID BILE, BITCH!",
      "YOU'RE POISONING MY GAINS, YOU ROTTEN SCUMBAG!",
      "SEPTIC SHOCK WON'T STOP MY SETS, TOMMY!",
      "STOP PROJECTILE VOMITING ON MY QUADRICEPS!",
      "I NEED A GALLON OF BLEACH AND YOUR HEAD ON A STAKE!",
      "CORROSIVE SLIME IS CATABOLIC AS FUCK!",
      "DON'T COAT MY DELTS IN BIOHAZARD SLOP!",
      "MY LATS ARE DISSOLVING, GOD DAMNIT!",
      "PUKING ON ME WON'T SAVE YOUR LIFE, YOU FILTHY PIG!",
      "I'LL CRAM THAT SLUDGE RIGHT BACK DOWN YOUR GULLET!"
    ],
    'Blackout Barry': [
      "YOU'RE FRYING MY NERVOUS SYSTEM, ASSHOLE!",
      "STOP TAZING MY TRAPS, YOU SHOCK-JOCK BITCH!",
      "MY MUSCLES ARE SPASMING, FUCK!",
      "THAT'S 100,000 VOLTS STRAIGHT TO MY NUTS!",
      "YOU'RE BLOWING OUT MY CNS, PRICK!",
      "STOP SHORT-CIRCUITING MY PUMP!",
      "I SMELL BURNT DELTS, GOD DAMN IT!",
      "MY SQUAT FORM IS TWITCHING, STOP ZAPPING ME!",
      "HIGH VOLTAGE WON'T STOP THE GAINS, ASSHOLE!",
      "MY HEART JUST SKIPPED THREE BEATS, MOTHERFUCKER!",
      "DEFIBRILLATE THIS, YOU ELECTRIC BASTARD!",
      "AC/DC CAN SUCK MY SWEATY PECS!",
      "YOU'RE DRAINING MY BATTERY, LIGHTBULB HEAD!",
      "I'LL GROUND YOUR ASS PERMANENTLY!"
    ],
    'Oily Oscar': [
      "I'M SLIPPING ALL OVER THE FUCKING PLACE!",
      "GREASY BASTARD, GET YOUR SLICK SHIT OFF MY LATS!",
      "I CAN'T GET TRACTION FOR MY SQUATS, ASSHOLE!",
      "STOP GREASING THE SQUAT RACK, YOU OILY PIG!",
      "I SMELL LIKE CRUDE OIL AND BURNT CALORIES!",
      "YOU'RE SLICKER THAN A GREASED-UP WEASEL, BITCH!",
      "DON'T OIL UP THE MERCHANDISE, MOTHERFUCKER!",
      "MY FOOTHOLD IS RUINED, GOD DAMN IT!",
      "STOP SLIDING INTO MY PERSONAL SPACE, OSCAR!",
      "THAT ROCKET SPLATTERED PETROLEUM ON MY PECS!",
      "CRUDE OIL IS NOT SQUAT CHALK, FUCKER!",
      "I'M SKIDDING LIKE A BALD TIRE, SON OF A BITCH!",
      "YOUR GREASE IS AN AFFRONT TO MY GAINS!",
      "I'LL IGNITE YOUR OILY ASS INTO OBLIVION!"
    ],
    'Drug Trade Dale': [
      "OW! IS THAT A DIRTY NEEDLE, YOU SICK FUCK?!",
      "KEEP YOUR RUSTY SYRINGES OFF MY DELTS!",
      "DON'T TOUCH MY NATURAL TESTOSTERONE, BITCH!",
      "MY VEINS ARE FOR BULKING, NOT YOUR SKETCHY SHIT!",
      "ARE YOU TRYING TO SPIKE MY PRE-WORKOUT?!",
      "FUCK YOUR FENTANYL, I'M ALL NATURAL ORGANIC BEEF!",
      "YOU RUINED MY STEROID CYCLE, YOU BASTARD!",
      "MY HEART IS POUNDING AT 300 BPM, GOD DAMN IT!",
      "THAT TRUCK ALMOST COMPACTED MY GLUTES!",
      "STOP DOSING MY GAINS, DALE!",
      "I'M TRIPPING BALLS AND MY LATS HURT!",
      "I DON'T NEED YOUR NARCOTICS, I GET HIGH ON THE PUMP!",
      "TAINTED PRODUCT ASSHOLE, I'LL BREAK YOUR VAULT!",
      "MY PUPILS ARE DILATING, YOU PHARMACEUTICAL PRICK!"
    ]
  },
  SPECIFIC_HAZARD_HURT: {
    'steam': [
      "HOT STEAM IN MY FACE! STOP SCALDING THE MERCHANDISE!",
      "MY SKIN IS PEELING FROM THAT STEAM VENT!",
      "I'M BEING STEAMED LIKE A FUCKING DUMPLING, VICTOR!",
      "STEAMING HOT MAGMA BURNS, SON OF A BITCH!"
    ],
    'ice': [
      "BRAIN FREEZE AND BALL FREEZE, FUCK YOU ARTIE!",
      "THAT ICICLE CHIPPED MY QUADRICEPS!",
      "FREEZING SLUSH ON MY SIX-PACK!",
      "FROSTBITE ON MY GLUTES?! YOU'RE DEAD, ARTIE!"
    ],
    'boulder': [
      "A BOULDER TO THE DOME?! MY TRAPS ARE SOLID ROCK, ERNIE!",
      "THAT BOULDER DENTED MY DELTS, YOU CRUSTY OLD BASTARD!",
      "STOP THROWING SEDIMENTARY SHIT AT MY GAINS!",
      "I BENCH HEAVIER ROCKS THAN THAT FOR WARM-UP!"
    ],
    'wind': [
      "THIS HURRICANE IS BLOWING MY SWEATPANTS OFF!",
      "TORNADO STRAIGHT TO THE CHEST?! YOU WINDY PRICK!",
      "I CAN'T HEAR MY GYM MUSIC OVER THIS FUCKING GALE!",
      "STOP BUFFETING MY LATS, HECTOR!"
    ],
    'sludge': [
      "TOXIC VOMIT IN MY MOUTH! I'M GONNA PUKE!",
      "ACID SLUDGE BURNING THROUGH MY HAMSTRINGS!",
      "THAT SEPTIC SLIME RUINED MY FRESH LIFTING SNEAKERS!",
      "GROSS! BIOHAZARD BILE ALL OVER MY CHEST, TOMMY!"
    ],
    'electric': [
      "MY FILLINGS ARE RATTLING! STOP TAZING ME!",
      "100,000 VOLTS RIGHT UP MY ASSHOLE, BARRY!",
      "MY HEART RHYTHM JUST TURNED INTO DUBSTEP!",
      "INVOLUNTARY MUSCLE CONTRACTIONS! FUCK YOU BARRY!"
    ],
    'oil': [
      "OIL IN MY EYES! I CAN'T SEE THE SQUAT RACK!",
      "I'M SLIPPING ON CRUDE OIL, OSCAR YOU GREASY BASTARD!",
      "FLAMMABLE PETROLEUM ON MY CHEST HAIR!",
      "I NEED FIFTY PAPER TOWELS AND YOUR HEAD ON A PLATE!"
    ],
    'needle': [
      "OW! A DIRTY SYRINGE STRAIGHT INTO MY GLUTES!",
      "THAT NEEDLE BETTER NOT HAVE HEPATITIS, DALE!",
      "STOP INJECTING SKETCHY CONTRABAND INTO MY BULK!",
      "DIRTY NEEDLE! KEEP YOUR TAINTED JUNK OFF ME!"
    ],
    'truck': [
      "A FUCKING SEMI TRUCK JUST COMPACTED MY GLUTES!",
      "VEHICULAR ASSAULT WON'T STOP THIS SET, DALE!",
      "YOU DROVE AN 18-WHEELER INTO MY DELTS, BASTARD!",
      "I'LL BENCH PRESS THAT FREIGHTLINER RIGHT BACK AT YOU!"
    ],
    'meth_barrel': [
      "EXPLODING METH BARREL?! ARE YOU SHITTING ME?!",
      "CHEMICAL EXPLOSION ON MY QUADS, FUCK!",
      "THAT DRUG BLAST SINGED MY LEG HAIR, DALE!"
    ],
    'bullet': [
      "A BULLET WON'T PENETRATE THESE PECTORALS!",
      "WHO SHOT ME IN THE BACK?! COWARDLY INSECT!",
      "MOSQUITO BITE! I EAT LEAD FOR BREAKFAST!",
      "IS THAT A PEASHOOTER, YOU WEAK LITTLE SHIT?!"
    ],
    'rusher': [
      "WATCH WHERE YOU'RE CHARGING, CHICKEN LEGS!",
      "YOU BOUNCED RIGHT OFF MY ABS, DUMBASS!",
      "OUT OF MY WAY, NOODLE-ARM!"
    ],
    'drone': [
      "GET THAT BUZZING DRONE AWAY FROM MY LATS!",
      "CHEAP PLASTIC DRONE SCRATCHED MY PUMP!"
    ],
    'flyer': [
      "GET DOWN HERE AND FIGHT LIKE A MAN, FLYER!",
      "ANNOYING MOSQUITO TOUCHED MY SHOULDERS!"
    ],
    'tank': [
      "A TANK WON'T CRUSH THESE QUADS!",
      "HEAVY ARMOR? MY BICEPS ARE HEAVIER!"
    ]
  },
  THRESHOLDS: {
    'Artie Avalanche': { 75: "IS IT GETTING WARM IN HERE? NO MATTER.", 50: "YOU'RE CHIPPING AWAY AT PERFECTION!", 25: "I'M MELTING... NO! REFREEZE EVERYTHING!", 0: "FINALLY... THE SILENCE OF THE VOID." },
    'Victor Volcano': { 75: "A MERE SPARK! I AM THE FURNACE!", 50: "PRESSURE IS BUILDING! YOU'L EXPLODE!", 25: "MAGMA FAILING... COOLING... NOOO!", 0: "EXTINGUISHED... LIKE A WEAK CANDLE." },
    'Ernie Earthquake': { 75: "YOU CAN'T BREAK THE MOUNTAIN, BOY.", 50: "FINE... I FLAT OUT REFUSE!", 25: "STRUCTURAL FAILURE! I'M CRUMBLING!", 0: "DUST TO DUST... DAMN IT ALL." },
    'Hector Hurricane': { 75: "CATCH ME IF YOU CAN, SLOW-POKE!", 50: "THE WINDS ARE SHIFTING... AGAINST YOU!", 25: "I CAN'T BREATHE... THE AIR IS THIN!", 0: "JUST A WHISPER NOW... GOODBYE..." },
    'Toxic Tommy': { 75: "TASTE THE TOXIC WASTE, MEATHEAD!", 50: "MY BILE WILL MELT YOU INTO SLOP!", 25: "CONTAINMENT BREACH! I'M LEAKING EVERYWHERE!", 0: "DISSOLVED... BACK TO THE SEWER..." },
    'Blackout Barry': { 75: "LOWERING YOUR RESISTANCE!", 50: "POWER SURGE INCOMING!", 25: "EMERGENCY GENERATORS ACTIVE!", 0: "OUT OF JUICE... GOODNIGHT." },
    'Oily Oscar': { 75: "CAN'T CATCH ME, I'M TOO SLICK!", 50: "SLIPPING AND SLIDING TOWARDS YOUR GRAVE!", 25: "MY RESERVES ARE BURNING UP!", 0: "SLIPPED UP... AND BURNT OUT..." },
    'Drug Trade Dale': { 75: "BUSINESS IS BOOMING, LITERALLY.", 50: "I'M LOSING INVENTORY! MORE SHIPMENTS!", 25: "THIS IS RECREATIONAL UNTIL I KILL YOU!", 0: "MY EMPIRE... FOR A CLEAN SYRINGE..." }
  },
  INTRO_QUOTES: {
    'Victor Volcano': ["Hell hath no fury like roid rage.", "What a nice meat specimen you are. Well done. That is how you will be cooked."],
    'Artie Avalanche': ["What killed the dinosaurs? The ice age!", "The cold will burn your face."],
    'Hector Hurricane': ["Katrina's got nothing on my wrath.", "You better watch out for the soggy logs of shit, Meatface."],
    'Ernie Earthquake': ["I'D BE QUAKING IN MY boots IF I WERE YOU.", "Are you ready to rumble, motherfucker?"],
    'Toxic Tommy': ["I hope you like the taste of septic tank.", "My puke melts steel beams, bitch."],
    'Blackout Barry': ["The lights go out, then you die.", "I'm the reason your bill is so high."],
    'Oily Oscar': ["Slip and slide into your coffin.", "You're looking a little dry, let me grease you up."],
    'Drug Trade Dale': ["I will ransack your steroid supply.", "Another junkie? How'd you get past my guards?"],
    'default': ["I'll break you in half!", "YOU'RE TOAST."]
  }
};