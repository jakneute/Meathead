// How every weapon hurts the mid-bosses (the moose, the Eye, the doorman). No
// status effects on them (they shrug off fire, oil, needles, the taser's hold):
// just a solid number per hit, so no weapon's a waste of time on them. Each is
// pitched at roughly the same damage per second as the gun or better (the slow,
// deliberate ones hit harder per shot). The doorman's built like a vault: he
// takes a small slice of all of it (you beat him in the clashes).

import type { Enemy, Projectile, WeaponType } from '../../types';
import { BOULDER_DAMAGE_PER_SPEED, GML_SCALE } from '../../constants';

export const isMidBoss = (e: Enemy) => e.kind === 'moose' || e.kind === 'eye' || e.kind === 'doorman';

/**
 * Per hit on a mid-boss (per pellet for the shotgun, per tick for the flamethrower and the taser):
 *   gun 25 every 12 frames (~125/s) · shotgun 10 pellets x 14, every 30 (~280/s point blank)
 *   boulder 150 + more the faster it's going, every 45 (~200+/s) · flamethrower 2.5 a frame (~150/s)
 *   tidal wave 300 a wave · needles 16 every 7 (~135/s) · taser 16 every 6 (~160/s)
 *   sludge 160 a blob, every 90 (~105/s, and it's a big slow blob) · oil rocket 90 + 80 splash, every 45 (~225/s)
 */
export const MIDBOSS_DAMAGE: Record<WeaponType, number> = {
  GUN: 25, SHOTGUN: 14, BOULDER: 150, FLAMETHROWER: 2.5, TSUNAMI: 300, NEEDLES: 16, TASER: 16, SLUDGE: 160, OIL_ROCKET: 90,
};
/** The oil rocket's splash on a mid-boss (no oil sticks to it). */
export const MIDBOSS_SPLASH_DAMAGE = 80;
/** What a nearby oiled goon going up takes out of a mid-boss (it's a big blast, but no instant kill). */
export const MIDBOSS_NUKE_DAMAGE = 250;
/** The doorman: he takes this share of everything (bullet resistant, fire resistant, the lot). */
export const DOORMAN_RESIST = 0.12;

/** Which weapon a projectile came out of. */
export const weaponOf = (p: Projectile): WeaponType =>
  p.isBoulder ? 'BOULDER' : p.isSludge ? 'SLUDGE' : p.isDart ? 'NEEDLES' : p.isOilRocket ? 'OIL_ROCKET' : p.isIce ? 'SHOTGUN' : 'GUN';

/** A mid-boss hit by one of his shots (before the doorman's resistance: his own hit code applies it). */
export const midBossProjectileDamage = (p: Projectile) => {
  if (p.isSludge && p.isLingering) return 0;
  const w = weaponOf(p);
  // (a boulder hits harder the faster it's going)
  if (w === 'BOULDER') return MIDBOSS_DAMAGE.BOULDER + BOULDER_DAMAGE_PER_SPEED * 0.5 * Math.max(0, Math.hypot(p.vel.x, p.vel.y) / GML_SCALE - 2);
  return MIDBOSS_DAMAGE[w];
};

/** Damage from something that isn't a shot (the flames, the beam, a splash), with the doorman's resistance. */
export const midBossDamage = (e: Enemy, amount: number) => amount * (e.kind === 'doorman' ? DOORMAN_RESIST : 1);
