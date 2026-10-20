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
  SOUL_SUCKER: { x: 30, y: 1 },
  FLINTLOCK: { x: 32, y: 0.5 },
  SPELLBOOK: { x: 18, y: 0 },
  STUNT_CAR: { x: 18, y: -4 },
  MALLET: { x: 20, y: -10 },
  SPAWNER: { x: 26, y: -3 },
  CROSSBOW: { x: 27, y: -4 },
};

/** The flamethrower's nozzle sits this far along the barrel from its pivot. */
export const FLAMETHROWER_BARREL = 27;

/**
 * On a vine (Meathead 2): his body hangs off his hand on it, turned about it (`rot`, in his local frame), but the gun arm
 * stays level from the shoulder, aimed where the shots go.
 */
export const vineGrip = (p: Player) => ({ x: -3, y: -(p.height + 16) });
export const VINE_SHOULDER = { x: 8, y: -42 };
export const vineLean = (p: Player) => {
  const v = p.vine;
  // (on a ladder: upright, whatever)
  if (!v || p.ladder) return 0;
  return -v.th * p.facing * 0.85 - v.om * 3 * p.facing + (v.mode === 'push' ? 0.55 : v.mode === 'zipUp' ? -0.08 : 0);
};

/** World position of the equipped weapon's tip. */
export const muzzlePoint = (player: Player, weapon: WeaponType) => {
  const tip = TIP[weapon];
  if (player.vine) {
    // (the shoulder, where the turned body has it; the gun held level out from there)
    const g = vineGrip(player), a = vineLean(player), dx = VINE_SHOULDER.x - g.x, dy = VINE_SHOULDER.y - g.y;
    const sx = g.x + dx * Math.cos(a) - dy * Math.sin(a), sy = g.y + dx * Math.sin(a) + dy * Math.cos(a);
    const lx = sx + HOLD.x - VINE_SHOULDER.x + tip.x, ly = sy + HOLD.y - VINE_SHOULDER.y + tip.y;
    return { x: player.pos.x + player.width / 2 + player.facing * lx, y: player.pos.y + player.height + ly };
  }
  const hold = player.isSliding ? SLIDE_HOLD : player.isDucking ? { x: HOLD.x + DUCK_SHIFT.x, y: HOLD.y + DUCK_SHIFT.y } : HOLD;
  const lx = hold.x + tip.x;
  const ly = hold.y + tip.y;
  const drop = stanceDrop(player.stance, !player.isSliding && !player.isDucking && !player.isCharging);
  return { x: player.pos.x + player.width / 2 + player.facing * lx, y: player.pos.y + player.height + drop + ly };
};

/** In cat form (Meathead 2's cartoon White House: render/player/catPose.ts), his mouth: where the hairball comes out
 *  (standing, ducked, sliding), in his local frame. */
export const CAT_MOUTH = { x: 12, y: -55 }, CAT_MOUTH_DUCK = { x: 18, y: -44 }, CAT_MOUTH_SLIDE = { x: -13, y: -40 };
export const catMouthPoint = (player: Player) => {
  const m = player.isSliding ? CAT_MOUTH_SLIDE : player.isDucking ? CAT_MOUTH_DUCK : CAT_MOUTH;
  const drop = stanceDrop(player.stance, !player.isSliding && !player.isDucking && !player.isCharging);
  return { x: player.pos.x + player.width / 2 + player.facing * m.x, y: player.pos.y + player.height + drop + m.y };
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
