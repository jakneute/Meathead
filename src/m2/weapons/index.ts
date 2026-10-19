// Meathead 2's arsenal: what he's carrying, in order, each with its name, where it came from, what it does (for the
// pause menu), and its picture. The ray gun's the engine's pistol made over (combat/rayGun.ts); the lands' own weapons
// are plugged in as the engine's custom weapons (combat/customWeapons.ts).

import React from 'react';
import type { WeaponType } from '../../m1/types';
import { RAYGUN_ART, WeaponArt } from '../../m1/components/WeaponIcon';
import { registerSouvenirLauncher } from './souvenir';
import { registerSoulSucker, stopSoulSucker } from './soulSucker';
import { registerFlintlock, stopFlintlock } from './flintlock';
import { registerSpellbook, stopSpellbook } from './spellbook';
import { registerStuntCar, stopStuntCar } from './stuntCar';
import { registerMallet, stopMallet } from './mallet';
import { registerSpawner, stopSpawner } from './spawner';
import { registerCrossbow, stopCrossbow } from './crossbow';
import type { PadKey } from '../../m1/components/ButtonIcons';

/** One line of how it's worked, for the pause menu: the buttons (pad, keyboard, mouse; `join`: '+' together), and what they do. */
export interface Control { pad: PadKey[]; kb?: string[]; mouse?: 'left' | 'right'; join?: '+' | '/'; label: string }
export interface M2Weapon {
  name: string; from: string; description: string; controls: Control[];
  /** A line under its controls (when it can't be used). */ note?: string;
  /** The description cut down for the walk-away (two lines of ~107 characters at most), when the whole of it won't fit. */ blurb?: string;
}

export const M2_WEAPON_INFO: Partial<Record<WeaponType, M2Weapon>> = {
  GUN: {
    name: 'RAY GUN', from: "THE ALIEN'S LEFTOVERS",
    controls: [{ pad: ['X'], kb: ['@fire'], label: 'FIRE' }],
    description: "Duct-taped together out of a dead alien's spaceship. Never runs dry. Whoever eats a bolt gets vaporized down to his shoes. Somebody's mom is getting sneakers in the mail.",
  },
  FLINTLOCK: {
    name: 'LASER-GUIDED FLINTLOCK', from: 'WILDERNESS LAND',
    controls: [{ pad: ['X'], kb: ['@fire'], label: 'HOLD: LOCK ON' }, { pad: ['X'], kb: ['@fire'], label: 'LET GO WHEN IT CLICKS: FIRE' }],
    description: "1700s gun, 2000s laser pointer. Hold fire and the dot finds a head. You can't turn around. When it clicks, let go: that head comes clean off. One ball, one head. Yeehaw.",
  },
  SPELLBOOK: {
    name: 'SPELLBOOK OF THE DAMNED', from: 'FAIRY LAND',
    controls: [{ pad: ['X'], kb: ['@fire'], label: 'ELEMENTAL STORM (9-13 MANA)' }, { pad: ['Y'], kb: ['@secondary'], label: 'BULK UP (24 MANA)' }],
    description: "Some wizard's diary, now with murder. Fire drops a meteor, a comet and a lightning bolt on up to three assholes. BULK UP makes you huge and punts whoever you touch into orbit. Runs on mana. Ammo refills it. Don't ask.",
    blurb: "Some wizard's diary, now with murder. Fire drops a meteor, a comet and lightning on up to three assholes. BULK UP makes you huge and punts whoever you touch into orbit. Don't ask.",
  },
  STUNT_CAR: {
    name: 'THE CLAPPING CLAPPERBOARD', from: 'HOLLYWOOD LAND',
    controls: [{ pad: ['X'], kb: ['@fire'], label: 'ACTION!' }],
    description: "Snap it and yell ACTION. A stuntman in a sports car flies over your head and nose-dives into whoever's in front of you. Big fireball. He goes through the windshield into the next guy. He doesn't get up.",
  },
  MALLET: {
    name: 'MALLET OF PAIN', from: 'CARTOON LAND',
    description: "A cartoon mallet that hits like a real one. Knock them out of the zip code, into orbit or flat as a pancake, or spin and bonk the whole room. No ammo: it wears out. Ammo pickups fix it. Physics optional.",
    controls: [
      { pad: ['X'], kb: ['@fire'], label: 'SWING (2)' },
      { pad: ['X'], kb: ['@fire'], label: 'HOLD, STANDING: TORNADO (1 A HIT)' },
      { pad: ['Y'], kb: ['@secondary'], label: 'LAUNCH (3) · IN THE AIR: SMASH DOWN (4)' },
      { pad: ['Y'], kb: ['@secondary'], label: 'HOLD, STANDING: PANCAKE SMASH (6)' },
    ],
    note: 'STANDING OR IN THE AIR. NOT WHILE DUCKING. WEARS ONLY WHEN IT HITS.',
  },
  SPAWNER: {
    name: 'OTHERWORLDLY SPAWNER', from: 'FUTURE LAND',
    controls: [{ pad: ['X'], kb: ['@fire'], label: 'FIRE' }],
    description: "Nobody knows how it makes them. Don't ask. It squirts out slimy little space goblins that run people down, yank birds out of the sky and chew. One's a nuisance. Thirty's a skeleton.",
  },
  CROSSBOW: {
    name: 'CROSSBOW OF PLAGUES', from: 'JUNGLE LAND',
    controls: [{ pad: ['X'], kb: ['@fire'], label: 'HOLD: RAPID FIRE' }, { pad: ['DPAD_UP', 'X'], kb: ['@up', '@fire'], join: '+', label: 'AIM UP' }, { pad: ['DPAD_DOWN', 'X'], kb: ['@down', '@fire'], join: '+', label: 'IN THE AIR: AIM DOWN' }],
    description: "Darts dipped in something the tour guide warned us about. Keep sticking a guy and he projectile vomits on whoever's closest. Then they're next. The big ones take more darts.",
  },
  SOUL_SUCKER: {
    name: 'SOUL SUCKER', from: 'SPOOKY LAND',
    controls: [{ pad: ['X'], kb: ['@fire'], label: 'HOLD: SUCK' }, { pad: ['Y'], kb: ['@secondary'], label: 'GORE SPRAY' }],
    description: "A haunted shop vac with a meat grinder for a bag. Hold fire and suck them in feet first. Too big to fit? It drinks the blood out instead. Then hose their buddies down with them. Waste not.",
  },
  SOUVENIR: {
    name: 'SOUVENIR LAUNCHER', from: 'FOREIGN LANDS',
    controls: [{ pad: ['X'], kb: ['@fire'], label: 'FIRE' }, { pad: ['DPAD_UP', 'X'], kb: ['@up', '@fire'], join: '+', label: 'LOB: ON THEIR HEAD, OVER ANY SHIELD' }],
    description: "Gift shop crap taped to a drainpipe. Every shot's a surprise: an Eiffel Tower that pinballs off every wall and face, an Easter Island head that flattens whoever it lands on. Made in a country you can't pronounce.",
  },
};

/** What he's got, for now: the ray gun and the lands' weapons built so far. */
export const M2_WEAPONS: WeaponType[] = ['GUN', 'SOUVENIR', 'SOUL_SUCKER', 'FLINTLOCK', 'SPELLBOOK', 'STUNT_CAR', 'MALLET', 'SPAWNER', 'CROSSBOW'];

export const weaponName = (w: WeaponType) => M2_WEAPON_INFO[w]?.name ?? w;

/** Its picture (the ray gun's its own; the rest are the engine's, by type). */
export const M2WeaponArt: React.FC<{ type: WeaponType; size: number }> = ({ type, size }) =>
  type === 'GUN'
    ? React.createElement('svg', { viewBox: '0 0 32 32', width: size, height: size, shapeRendering: 'crispEdges', style: { imageRendering: 'pixelated' } }, RAYGUN_ART)
    : React.createElement(WeaponArt, { type, size });

/** Plugs the lands' weapons into the engine (startup). */
export const registerWeapons = () => { registerSouvenirLauncher(); registerSoulSucker(); registerFlintlock(); registerSpellbook(); registerStuntCar(); registerMallet(); registerSpawner(); registerCrossbow(); };
/** Whatever any of them was in the middle of, stopped (going through a door). */
export const stopWeapons = () => { stopSoulSucker(); stopFlintlock(); stopSpellbook(); stopStuntCar(); stopMallet(); stopSpawner(); stopCrossbow(); };
/** What its ammo's called (the spellbook's is mana). */
export const ammoName = (w: WeaponType) => (w === 'SPELLBOOK' ? 'MANA' : w === 'MALLET' ? 'DURABILITY' : 'AMMO');
