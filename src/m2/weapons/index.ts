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
    description: "Built out of what was left of the alien's ship, a lot of tape and one bad afternoon. Never runs dry, shoots straight, and whatever it kills doesn't leave much more than its shoes.",
  },
  FLINTLOCK: {
    name: 'LASER-GUIDED FLINTLOCK', from: 'FRONTIER LAND',
    description: "An old horse pistol with a laser sight duct-taped on. Hold fire to lock onto the head of whoever's in front, ground or air; walk, jump, but no turning. Primed, let go: straight through every head on the line, and the first wall, floor or ceiling bounces it once at somebody else.",
  },
  SPELLBOOK: {
    name: 'SPELLBOOK OF THE DAMNED', from: 'FANTASY LAND',
    description: "Fire reads out a storm on up to three of them: a meteor that blows up and leaves them burning, a comet that hurts and freezes them solid, lightning that keeps striking for a few seconds. Secondary fire: BULK UP. Faster, bigger, and everything he hits goes flying, for twelve seconds. Both run on mana.",
  },
  SOUL_SUCKER: {
    name: 'SOUL SUCKER', from: 'SPOOKY LAND',
    description: "A haunted shop vac with a meat grinder where the bag goes. Hold fire: it drags at everybody in front of it and wears their poise down (the bar over their heads). Poise gone, they go in. Secondary fire sprays what's in the gore bag back out at them.",
  },
  SOUVENIR: {
    name: 'SOUVENIR LAUNCHER', from: 'FOREIGN LANDS',
    description: "A gift-shop bag of junk taped to a pipe. Every shot's a gamble: the light ones bounce off everything and everybody, the heavy ones hit like a truck and hardly bounce. Anybody it doesn't kill sees stars. When it stops, it's plastic.",
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
