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
export interface M2Weapon { name: string; from: string; description: string; controls: Control[]; /** A line under its controls (when it can't be used). */ note?: string }

export const M2_WEAPON_INFO: Partial<Record<WeaponType, M2Weapon>> = {
  GUN: {
    name: 'RAY GUN', from: "THE ALIEN'S LEFTOVERS",
    controls: [{ pad: ['X'], mouse: 'left', label: 'FIRE' }],
    description: "Scrapped together from a dead alien's spaceship, a roll of duct tape and zero instructions. Never runs dry, never misses where you point it, and whoever eats a bolt gets vaporized down to his shoes. Somebody's mom is getting a pair of sneakers in the mail.",
  },
  FLINTLOCK: {
    name: 'LASER-GUIDED FLINTLOCK', from: 'FRONTIER LAND',
    controls: [{ pad: ['X'], mouse: 'left', label: 'HOLD: LOCK ON' }, { pad: ['X'], mouse: 'left', label: 'LET GO WHEN IT CLICKS: FIRE' }],
    description: "1700s firepower, 2000s laser pointer. Hold fire and the dot finds the nearest head in front of you, on the ground or in the air. You can walk, you can jump, you can't turn around. When the hammer clacks, let go: every head in a straight line comes clean off, and it bounces off one wall, floor or ceiling looking for one more. Yeehaw.",
  },
  SPELLBOOK: {
    name: 'SPELLBOOK OF THE DAMNED', from: 'FANTASY LAND',
    controls: [{ pad: ['X'], mouse: 'left', label: 'ELEMENTAL STORM (2-4 MANA)' }, { pad: ['Y'], kb: ['F'], label: 'BULK UP (10 MANA)' }],
    description: "Some wizard's diary, now with more murder. Fire drops a meteor, a comet and a lightning bolt out of the sky onto up to three assholes: burned, frozen solid, cooked in place. BULK UP makes you bigger, faster, and sends whoever you touch into orbit. Try grabbing somebody like that. Runs on mana. Ammo pickups refill it. Don't ask, it's magic.",
  },
  STUNT_CAR: {
    name: 'CLAPPERBOARD', from: 'HOLLYWOOD LAND',
    controls: [{ pad: ['X'], mouse: 'left', label: 'ACTION!' }],
    description: "Snap it and yell ACTION. A stunt driver in a sports car comes flying in off a ramp nobody can see, sails right over your head and nose-dives into whoever's in front of you. Big fireball, no retakes, and the stuntman gets launched through the windshield into whatever's next. He doesn't get up. Somebody call his agent.",
  },
  MALLET: {
    name: 'MALLET OF PAIN', from: 'CARTOON LAND',
    description: "A cartoon mallet that hits like a real one. Swing it sideways and they leave the zip code, uppercut them into orbit, smash them flat as a pancake, or spin like a cartoon devil and bonk everybody in the room. No ammo, it just wears out, and ammo pickups patch it up anyway. Physics optional.",
    controls: [
      { pad: ['X'], mouse: 'left', label: 'SWING (2)' },
      { pad: ['X'], mouse: 'left', label: 'HOLD, STANDING: TORNADO (1 A HIT)' },
      { pad: ['Y'], kb: ['F'], label: 'LAUNCH (3) · IN THE AIR: SMASH DOWN (4)' },
      { pad: ['Y'], kb: ['F'], label: 'HOLD, STANDING: PANCAKE SMASH (6)' },
    ],
    note: 'STANDING OR IN THE AIR. NOT WHILE DUCKING. WEARS ONLY WHEN IT HITS.',
  },
  SPAWNER: {
    name: 'OTHERWORLDLY SPAWNER', from: 'SPACE LAND',
    controls: [{ pad: ['X'], mouse: 'left', label: 'FIRE' }],
    description: "Nobody knows how it makes them. Nobody wants to know. Pull the trigger and it squirts out a litter of slimy little space goblins that run down anybody in sight, leap like fleas to pull birds out of the sky, latch on and chew. One of them's a nuisance. Thirty of them's a skeleton. They don't live long, but neither does whoever they're eating.",
  },
  CROSSBOW: {
    name: 'CROSSBOW OF PLAGUES', from: 'ADVENTURE LAND',
    controls: [{ pad: ['X'], mouse: 'left', label: 'HOLD: RAPID FIRE' }, { pad: ['DPAD_UP', 'X'], kb: ['W'], mouse: 'left', join: '+', label: 'AIM UP' }, { pad: ['DPAD_DOWN', 'X'], kb: ['S'], mouse: 'left', join: '+', label: 'IN THE AIR: AIM DOWN (OVER SHIELDS)' }],
    description: "A jungle crossbow and a bucket of darts dipped in something the tour guide warned us about. The darts barely scratch. Keep sticking a guy and his stomach gives up: he starts projectile vomiting on whoever's closest, and whoever gets it in the face is next. The big ones take more darts. Nobody around to hit? He aims for the sky. Gravity takes it from there.",
  },
  SOUL_SUCKER: {
    name: 'SOUL SUCKER', from: 'SPOOKY LAND',
    controls: [{ pad: ['X'], mouse: 'left', label: 'HOLD: SUCK' }, { pad: ['Y'], kb: ['F'], label: 'GORE SPRAY' }],
    description: "A haunted shop vac with a meat grinder where the dust bag should be. Hold fire to suck on everybody in front of you, harder the closer they are. Watch the bar over their heads: when it's gone, so are they, feet first into the grinder. Too big to fit? It drinks the blood right out of them instead. Then hit secondary fire and hose their buddies down with them. Waste not, want not.",
  },
  SOUVENIR: {
    name: 'SOUVENIR LAUNCHER', from: 'FOREIGN LANDS',
    controls: [{ pad: ['X'], mouse: 'left', label: 'FIRE' }, { pad: ['DPAD_UP', 'X'], kb: ['W'], mouse: 'left', join: '+', label: 'LOB: ON THEIR HEAD, OVER ANY SHIELD' }],
    description: "A bag of gift-shop crap taped to a drainpipe. Every shot is a surprise: a little Eiffel Tower pinballs off every wall and face in the room, an Easter Island head drops like a cinder block and flattens whatever it lands on. Whoever lives through it sees stars. Made in a country you can't pronounce, killing people in one you can.",
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
