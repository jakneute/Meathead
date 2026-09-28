import { WeaponType } from '../types';

/** Boss roster, locations, arena colors and the weapons each boss drops. */

export interface StageInfo {
  id: string;
  color: string;
}

export const STAGES_SET_0: StageInfo[] = [
  { id: 'Artie Avalanche', color: 'bg-blue-600' },
  { id: 'Victor Volcano', color: 'bg-orange-600' },
  { id: 'Ernie Earthquake', color: 'bg-amber-800' },
  { id: 'Hector Hurricane', color: 'bg-cyan-600' }
];

export const STAGES_SET_1: StageInfo[] = [
  { id: 'Toxic Tommy', color: 'bg-green-600' },
  { id: 'Blackout Barry', color: 'bg-gray-900' },
  { id: 'Oily Oscar', color: 'bg-yellow-900' },
  { id: 'Drug Trade Dale', color: 'bg-pink-600' }
];

/** The four bosses available at a given progression rank. */
export const getStages = (rank: number): StageInfo[] => rank === 0 ? STAGES_SET_0 : STAGES_SET_1;

export const isKnownStage = (stageId: string | null): boolean =>
  !!stageId && [...STAGES_SET_0, ...STAGES_SET_1].some(s => s.id === stageId);

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
  'Drug Trade Dale': { ground: '#B5703D', bg: '#2A1B3D', accent: '#40E0D0' },
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

/** Sorts weapons into the canonical arsenal order. */
export const sortWeapons = (weapons: WeaponType[]): WeaponType[] =>
  [...weapons].sort((a, b) => ALL_WEAPONS.indexOf(a) - ALL_WEAPONS.indexOf(b));

/** Weapons the player starts a run with. */
export const getStartingWeapons = (rank: number, allWeaponsCheat: boolean): WeaponType[] => {
  if (allWeaponsCheat) return ALL_WEAPONS;
  return rank === 1 ? WEAPONS_AFTER_SET_0 : ['GUN'];
};

/** A weapon's proper name, and the boss it was taken from (if any). */
export const getWeaponInfo = (weapon: WeaponType) => {
  const from = Object.keys(BOSS_WEAPON_MAP).find(id => BOSS_WEAPON_MAP[id] === weapon);
  return { name: from ? WEAPON_NAMES[from] : 'Handgun', from: from ?? 'STANDARD ISSUE' };
};

export const getWeaponDescription = (weapon: WeaponType): string => {
  if (weapon === 'GUN') return "Your trusty sidearm. Never runs dry, never jams, never lets you down. Point it at a face and pull the trigger.";
  const bossId = Object.keys(BOSS_WEAPON_MAP).find(id => BOSS_WEAPON_MAP[id] === weapon);
  return (bossId && WEAPON_DESCRIPTIONS[bossId]) || "HEAVY DEVASTATION";
};
