// What's left of something when it dies: itself, without whatever it was in the middle of doing. A death animation
// (flung, falling over) draws this, so an attack it was part way through (the electrified floor, a laser sight, a
// fire barf, a club swing, a puke sweep) doesn't go flying or keel over along with it.

import type { Enemy } from '../../types';

/** A copy of `e` with every attack in progress taken off it (a boss back to standing, for falling over). */
export const attackless = (e: Enemy): Enemy => ({
  ...e,
  pos: { ...e.pos },
  vel: { ...e.vel },
  melee: undefined, throwWindup: undefined, burstLeft: undefined,
  barfT: undefined, barfLen: undefined, barfReadyAt: undefined,
  electrifiedTimer: undefined, activeLightningStrikes: undefined,
  aimX: undefined, aimY: undefined, lockProgress: undefined, fireWarning: undefined, aimFrames: undefined,
  pukeSweepProgress: undefined, pukeType: undefined,
  truckActive: undefined, truckCrashing: undefined,
  taserHold: undefined, isTased: false,
  ...(e.bossState ? { bossState: 'idle' as const, stateTimer: 0 } : {}),
});
