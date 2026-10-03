// The finale's souped-up arsenal. In the White House press room (and only there) every one of Meathead's guns is
// turned up to eleven, each its own way (the taser's whole-room reach is in combat/weapons.ts):
//   shotgun ice: a fan of shards two and a half times as thick (the same spread), the agents it catches frozen 2.5x as long;
//   flamethrower: wall to wall, and a fatter stream;                 oil rocket: a much bigger splash;
//   needles: an overdosed agent always ends up in the alien, and they go straight through a ballistic shield;
//   boulder: pitched like a fastball, straight at the alien (anyone in the way just dies);
//   tsunami: the full height of the screen, all the way across;      sludge: a slick that spreads wall to wall and stays;
//   the oil rocket's igniter: lights with the flamethrower's tank empty (and costs it nothing then).
// Everything here is gated on the finale's stage id: nowhere else changes.

import { FINALE_STAGE } from '../../constants';

/** In the finale? (Every buff below checks this.) */
export const inFinale = (stageId: string | null | undefined) => stageId === FINALE_STAGE;

/** Shotgun: shards a shot (usually SHOTGUN_PELLET_COUNT), over the same spread. */
export const FINALE_SHOTGUN_PELLETS = 24;
/** Shotgun: how long an agent stays frozen solid (usually SHOTGUN_FREEZE_TIME, 60). */
export const FINALE_FREEZE_TIME = 150;

/** Flamethrower: how far the stream reaches (the whole room, wall to wall), how many segments it's laid in, how much
 * fatter it is, and how fast it grows out to full reach. */
export const FINALE_FLAME_RANGE = 1180, FINALE_FLAME_SEGMENTS = 24, FINALE_FLAME_WIDTH = 1.7, FINALE_FLAME_GROWTH = 0.06;
/** ...its segments stop getting fatter this far out (or at full reach they'd be taller than the room). */
export const FINALE_FLAME_SIZE_CAP_DIST = 520;

/** Oil rocket: the splash (usually OIL_ROCKET_SPLASH_RADIUS). */
export const FINALE_OIL_SPLASH_RADIUS = 260;

/** Boulder, pitched: the windup and follow-through (frames), when in it the rock leaves his hand (frames left), its
 * speed, how hard it homes in on the alien, its size and how long it flies at most. */
export const PITCH_FRAMES = 26, PITCH_RELEASE_AT = 11, PITCH_SPEED = 30, PITCH_HOMING = 0.35, PITCH_SIZE = 40, PITCH_LIFE = 120;

/** Sludge: globs a barf (frames of barfTimer; one glob every 2), how long a puddle lies there (usually
 * SLUDGE_LINGER_DURATION, 60), how fast a slick creeps out along the floor each side, and how often it eats into a
 * grounded alien (frames) and for how much. */
export const FINALE_BARF_FRAMES = 40, FINALE_SLUDGE_LINGER = 900, FINALE_SLICK_SPREAD = 1.4;
export const FINALE_SLICK_ALIEN_EVERY = 60, FINALE_SLICK_ALIEN_DAMAGE = 12;
