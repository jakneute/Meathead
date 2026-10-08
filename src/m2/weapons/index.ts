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

export interface M2Weapon { name: string; from: string; description: string }

export const M2_WEAPON_INFO: Partial<Record<WeaponType, M2Weapon>> = {
  GUN: {
    name: 'RAY GUN', from: "THE ALIEN'S LEFTOVERS",
    description: "Scrapped together from a dead alien's spaceship, a roll of duct tape and zero instructions. Never runs dry, never misses where you point it, and whoever eats a bolt gets vaporized down to his shoes. Somebody's mom is getting a pair of sneakers in the mail.",
  },
  FLINTLOCK: {
    name: 'LASER-GUIDED FLINTLOCK', from: 'FRONTIER LAND',
    description: "1700s firepower, 2000s laser pointer. Hold fire and the dot finds the nearest head in front of you, on the ground or in the air. You can walk, you can jump, you can't turn around. When the hammer clacks, let go: every head in a straight line comes clean off, and it bounces off one wall, floor or ceiling looking for one more. Yeehaw.",
  },
  SPELLBOOK: {
    name: 'SPELLBOOK OF THE DAMNED', from: 'FANTASY LAND',
    description: "Some wizard's diary, now with more murder. Fire rips holes in the sky and drops a meteor, a comet and a lightning storm on up to three assholes: the meteor sets survivors on fire, the comet freezes them solid, the lightning cooks one in place for a few seconds. Secondary fire is BULK UP: twelve seconds of bigger, faster, and sending everybody you touch into orbit. Runs on mana, because of course it does.",
  },
  SOUL_SUCKER: {
    name: 'SOUL SUCKER', from: 'SPOOKY LAND',
    description: "A haunted shop vac with a meat grinder where the dust bag should be. Hold fire to suck on everybody in front of you, harder the closer they are. Watch the bar over their heads: when it's gone, so are they, feet first into the grinder. Then hit secondary fire and hose their buddies down with them. Waste not, want not.",
  },
  SOUVENIR: {
    name: 'SOUVENIR LAUNCHER', from: 'FOREIGN LANDS',
    description: "A bag of gift-shop crap taped to a drainpipe. Every shot is a surprise: a little Eiffel Tower pinballs off every wall and face in the room, an Easter Island head drops like a cinder block and flattens whatever it lands on. Whoever lives through it sees stars. Made in a country you can't pronounce, killing people in one you can.",
  },
};

/** What he's got, for now: the ray gun and the lands' weapons built so far. */
export const M2_WEAPONS: WeaponType[] = ['GUN', 'SOUVENIR', 'SOUL_SUCKER', 'FLINTLOCK', 'SPELLBOOK'];

export const weaponName = (w: WeaponType) => M2_WEAPON_INFO[w]?.name ?? w;

/** Its picture (the ray gun's its own; the rest are the engine's, by type). */
export const M2WeaponArt: React.FC<{ type: WeaponType; size: number }> = ({ type, size }) =>
  type === 'GUN'
    ? React.createElement('svg', { viewBox: '0 0 32 32', width: size, height: size, shapeRendering: 'crispEdges', style: { imageRendering: 'pixelated' } }, RAYGUN_ART)
    : React.createElement(WeaponArt, { type, size });

/** Plugs the lands' weapons into the engine (startup). */
export const registerWeapons = () => { registerSouvenirLauncher(); registerSoulSucker(); registerFlintlock(); registerSpellbook(); };
/** Whatever any of them was in the middle of, stopped (going through a door). */
export const stopWeapons = () => { stopSoulSucker(); stopFlintlock(); stopSpellbook(); };
/** What its ammo's called (the spellbook's is mana). */
export const ammoName = (w: WeaponType) => (w === 'SPELLBOOK' ? 'MANA' : 'AMMO');
