// How every weapon hurts the mid-bosses (the moose, the Eye, the doorman, Dale's
// distributor). No status effects on them (they shrug off fire, oil, needles,
// the taser's hold): just a solid number per hit, so no weapon's a waste of time
// on them. Each is pitched at roughly the same damage per second as the gun or
// better (the slow, deliberate ones hit harder per shot). The doorman's built
// like a vault: he takes a small slice of all of it (you beat him in the
// clashes). The distributor's out of his mind on his own product: bullets
// barely register (you beat him with his own stash), the rest only a little.

import type { Enemy, Projectile, WeaponType } from '../../types';
import { BOULDER_DAMAGE_PER_SPEED, GML_SCALE } from '../../constants';

export const isMidBoss = (e: Enemy) => !!e.hyper || e.kind === 'moose' || e.kind === 'eye' || e.kind === 'doorman' || e.kind === 'junkie' || e.kind === 'amalgam';

/**
 * Per hit on a mid-boss (per pellet for the shotgun, per tick for the flamethrower and the taser):
 *   gun 25 every 12 frames (~125/s) · shotgun 10 pellets x 14, every 30 (~280/s point blank)
 *   boulder 150 + more the faster it's going, every 45 (~200+/s) · flamethrower 2.5 a frame (~150/s)
 *   tidal wave 300 a wave · needles 16 every 7 (~135/s) · taser 16 every 6 (~160/s)
 *   sludge 14 a glob, a dozen globs a barf, every 90 (~110/s) · oil rocket 90 + 80 splash, every 45 (~225/s)
 *   machine gun 7 a round, a round every 3 (~140/s)
 */
export const MIDBOSS_DAMAGE: Record<WeaponType, number> = {
  GUN: 25, SHOTGUN: 14, BOULDER: 150, FLAMETHROWER: 2.5, TSUNAMI: 300, NEEDLES: 16, TASER: 16, SLUDGE: 14, OIL_ROCKET: 90, LMG: 7, SOUVENIR: 30, SOUL_SUCKER: 0, FLINTLOCK: 150, SPELLBOOK: 60, STUNT_CAR: 150, MALLET: 50,
};
/** The oil rocket's splash on a mid-boss (no oil sticks to it). */
export const MIDBOSS_SPLASH_DAMAGE = 80;
/** What a nearby oiled goon going up takes out of a mid-boss (it's a big blast, but no instant kill). */
export const MIDBOSS_NUKE_DAMAGE = 250;
/**
 * The doorman: he takes this share of everything (fire resistant, blast resistant, the lot: ten seconds of any weapon
 * does less than winning one clash)...
 */
export const DOORMAN_RESIST = 0.08;
/** ...and next to nothing from bullets (the gun, the machine gun, shotgun pellets, darts): they just bounce off him... */
export const DOORMAN_BULLET_RESIST = 0.04;
/** ...and twice those while he's down on the floor. */
export const DOORMAN_DOWN_MULT = 2;
/** Dale's distributor, high as a kite: a fair share of anything that isn't a bullet... */
export const JUNKIE_RESIST = 0.15;
/** ...and hardly anything from bullets (he doesn't even notice he's been shot)... */
export const JUNKIE_BULLET_RESIST = 0.1;
/** ...and next to nothing from the tidal wave washing over him (it's what it does to his filing cabinet that counts). */
export const JUNKIE_WAVE_RESIST = 0.05;

const isBullet = (w: WeaponType) => w === 'GUN' || w === 'SHOTGUN' || w === 'NEEDLES' || w === 'LMG';

/** The share of a shot the doorman takes. */
export const doormanShare = (p: Projectile) => (isBullet(weaponOf(p)) ? DOORMAN_BULLET_RESIST : DOORMAN_RESIST);

/** The share of a shot Dale's distributor takes. */
export const junkieShare = (p: Projectile) => (isBullet(weaponOf(p)) ? JUNKIE_BULLET_RESIST : JUNKIE_RESIST);

/** Which weapon a projectile came out of. */
export const weaponOf = (p: Projectile): WeaponType =>
  p.isBoulder ? 'BOULDER' : p.isSludge ? 'SLUDGE' : p.isDart ? 'NEEDLES' : p.isOilRocket ? 'OIL_ROCKET' : p.isIce ? 'SHOTGUN' : p.isLmg ? 'LMG' : 'GUN';

/** A mid-boss hit by one of his shots (before the doorman's resistance: his own hit code applies it). */
export const midBossProjectileDamage = (p: Projectile) => {
  if (p.isSludge && p.isLingering) return 0;
  const w = weaponOf(p);
  // (a boulder hits harder the faster it's going)
  if (w === 'BOULDER') return MIDBOSS_DAMAGE.BOULDER + BOULDER_DAMAGE_PER_SPEED * 0.5 * Math.max(0, Math.hypot(p.vel.x, p.vel.y) / GML_SCALE - 2);
  return MIDBOSS_DAMAGE[w];
};

/** Damage from something that isn't a shot (the flames, the beam, a splash, a wave), with the doorman's or the distributor's resistance. */
export const midBossDamage = (e: Enemy, amount: number) => amount * (e.hyper ? 0 : e.kind === 'doorman' ? DOORMAN_RESIST : e.kind === 'junkie' ? JUNKIE_RESIST : 1);
