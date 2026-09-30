import { WeaponType } from '../types';
import { mapPoint } from './mapGeo';

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
    coords: mapPoint('ak', -149.9, 61.2),
    coordinatesText: "61°13'N 149°54'W",
    threatBrief: 'SUB-ZERO GLACIAL BLIZZARD ZONE'
  },
  'Victor Volcano': {
    city: 'HILO',
    state: 'HAWAII',
    stateCode: 'HI',
    region: 'PACIFIC ISLANDS',
    coords: mapPoint('hi', -155.1, 19.7),
    coordinatesText: "19°43'N 155°05'W",
    threatBrief: 'ACTIVE MAGMA CALDERA ANARCHY'
  },
  'Ernie Earthquake': {
    city: 'SAN FRANCISCO',
    state: 'CALIFORNIA',
    stateCode: 'CA',
    region: 'PACIFIC COAST',
    coords: mapPoint('us', -122.4, 37.8),
    coordinatesText: "37°46'N 122°25'W",
    threatBrief: 'SAN ANDREAS FAULT PULVERIZATION'
  },
  'Hector Hurricane': {
    city: 'MIAMI',
    state: 'FLORIDA',
    stateCode: 'FL',
    region: 'ATLANTIC COAST',
    coords: mapPoint('us', -80.2, 25.8),
    coordinatesText: "25°46'N 80°11'W",
    threatBrief: 'CAT-5 STORM SURGE & FLOODING'
  },
  'Toxic Tommy': {
    city: 'FLINT',
    state: 'MICHIGAN',
    stateCode: 'MI',
    region: 'GREAT LAKES',
    coords: mapPoint('us', -83.7, 43.0),
    coordinatesText: "43°00'N 83°41'W",
    threatBrief: 'BIO-CORROSIVE SEWAGE OVERFLOW'
  },
  'Blackout Barry': {
    city: 'NEW YORK CITY',
    state: 'NEW YORK',
    stateCode: 'NY',
    region: 'MID-ATLANTIC',
    coords: mapPoint('us', -74.0, 40.7),
    coordinatesText: "40°42'N 74°00'W",
    threatBrief: 'HIGH-VOLTAGE POWER GRID CRISIS'
  },
  'Oily Oscar': {
    city: 'HOUSTON',
    state: 'TEXAS',
    stateCode: 'TX',
    region: 'GULF COAST',
    coords: mapPoint('us', -95.4, 29.8),
    coordinatesText: "29°45'N 95°22'W",
    threatBrief: 'OIL FIELD INFERNO & BIKER UNREST'
  },
  'Drug Trade Dale': {
    city: 'ALBUQUERQUE',
    state: 'NEW MEXICO',
    stateCode: 'NM',
    region: 'SOUTHWEST DESERT',
    coords: mapPoint('us', -106.6, 35.1),
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
  'Artie Avalanche': "A fan of ice pellets that ricochet off every wall and freeze whatever they touch. Then walk up and shatter the popsicle with your bare fucking hands.",
  'Victor Volcano': "Hold it down and the stream grows. Sweep it up or down to cook whatever's hiding. Burns their bullets out of the air, too. Plant your feet.",
  'Ernie Earthquake': "Roll it along the ground and flatten everything, heave it up like a shotput, or spike it straight down from midair. It's a rock. It doesn't care.",
  'Hector Hurricane': "One wave, the whole screen, whichever way you're facing. Everything in front of it just fucking dies. Wait for it to wash out before you do it again.",
  'Toxic Tommy': "Puke a lobbed stream of toxic waste that rots whatever it lands on, drags anything flying right out of the sky, and coats you in a filth shield nobody wants to touch. Gross. Effective.",
  'Blackout Barry': "Hold it and it locks onto the nearest bastard and doesn't let go. Stunned, fried, then on fire. You can't walk while you're zapping, so pick your moment.",
  'Oily Oscar': "Steer the rocket up or down in flight (crouch to fire it dead straight). Everything it hits is greased and sliding. Now get the flamethrower out.",
  'Drug Trade Dale': "Rapid-fire dirty needles. Stack the doses until they overdose, float off and take out anyone they bump into on the way up."
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
  if (weapon === 'LMG') return { name: 'Light Machine Gun', from: "DIRTY DAN'S GANG" };
  const from = Object.keys(BOSS_WEAPON_MAP).find(id => BOSS_WEAPON_MAP[id] === weapon);
  return { name: from ? WEAPON_NAMES[from] : 'Handgun', from: from ?? 'STANDARD ISSUE' };
};

export const getWeaponDescription = (weapon: WeaponType): string => {
  if (weapon === 'LMG') return "Dirty Dan's pride and joy. Zero accuracy, every round goes through three of them, and getting shot doesn't even make you let go. Let God sort out the rest.";
  if (weapon === 'GUN') return "Your trusty sidearm. Straight line, never runs dry, never jams. The only thing small enough to pop a gas line. Point it at a face and pull the trigger.";
  const bossId = Object.keys(BOSS_WEAPON_MAP).find(id => BOSS_WEAPON_MAP[id] === weapon);
  return (bossId && WEAPON_DESCRIPTIONS[bossId]) || "HEAVY DEVASTATION";
};
