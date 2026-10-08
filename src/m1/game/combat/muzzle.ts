import { Player, WeaponType } from '../../types';
import { stanceDrop } from '../core/terrain';

// Where each weapon's business end is drawn, so shots, streams and beams come
// out of it. These mirror the lead arm in render/player/player.ts: in his local
// frame (origin at his feet, +x the way he faces) the weapon is held at
// (18, -40) standing and (20, -24) ducking, and each weapon's tip sits at an
// offset from there. Walking pumps the arm a couple of pixels; that's ignored.
// On a slope or stairs he's drawn down onto the ground under him (stanceDrop),
// and so is the gun.

const HOLD = { x: 18, y: -40 };
const DUCK_SHIFT = { x: 2, y: 16 };
/** Mid slide tackle he's leaning way back, gun thrust out low in front (render/player/player.ts drawSlideTackle). */
export const SLIDE_HOLD = { x: 1, y: -38 };

/** Each weapon's tip, relative to the hand holding it. */
const TIP: Record<WeaponType, { x: number; y: number }> = {
  GUN: { x: 25, y: 2.5 },
  SHOTGUN: { x: 22, y: 3.5 },
  NEEDLES: { x: 24, y: 3.5 },
  SLUDGE: { x: 22, y: 5 },
  TSUNAMI: { x: 24, y: 5 },
  TASER: { x: 24, y: 4 },
  OIL_ROCKET: { x: 32, y: 3 },
  BOULDER: { x: 12, y: -4 },   // the rock he's holding: its centre
  FLAMETHROWER: { x: 4, y: 4 }, // the pivot it swivels on (see flamethrowerNozzle)
  LMG: { x: 34, y: 2 },
  SOUVENIR: { x: 30, y: 2 },
};

/** The flamethrower's nozzle sits this far along the barrel from its pivot. */
export const FLAMETHROWER_BARREL = 27;

/** World position of the equipped weapon's tip. */
export const muzzlePoint = (player: Player, weapon: WeaponType) => {
  const tip = TIP[weapon];
  const hold = player.isSliding ? SLIDE_HOLD : player.isDucking ? { x: HOLD.x + DUCK_SHIFT.x, y: HOLD.y + DUCK_SHIFT.y } : HOLD;
  const lx = hold.x + tip.x;
  const ly = hold.y + tip.y;
  const drop = stanceDrop(player.stance, !player.isSliding && !player.isDucking && !player.isCharging);
  return { x: player.pos.x + player.width / 2 + player.facing * lx, y: player.pos.y + player.height + drop + ly };
};

/** The flamethrower's nozzle, following the barrel as it's aimed up or down. */
export const flamethrowerNozzle = (player: Player) => {
  const pivot = muzzlePoint(player, 'FLAMETHROWER');
  const a = player.flameAngle || 0;
  return {
    x: pivot.x + player.facing * (Math.cos(a) * FLAMETHROWER_BARREL - Math.sin(a) * 0.5),
    y: pivot.y + Math.sin(a) * FLAMETHROWER_BARREL + Math.cos(a) * 0.5,
  };
};
