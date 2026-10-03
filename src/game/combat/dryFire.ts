// Dry fire: fire pressed with the weapon in his hands empty. Nothing comes out, and each one fails in its own way
// (a little sound and a few bits at the business end). Feedback only: no damage, nothing said.

import { Particle, WeaponType } from '../../types';
import { FrameContext } from '../core/context';
import { FrameInput, hasAmmo, armsBusy } from '../player/player';
import { muzzlePoint, flamethrowerNozzle } from './muzzle';
import { playSound } from '../platform/audio';

/** Not again within this many frames (mashing an empty gun gets one gag every so often, not one a press). */
const DRY_FIRE_GAP = 20;
/** Fired once per press (holding fire doesn't fire again). */
const ONE_PER_PRESS = new Set<WeaponType>(['BOULDER', 'SHOTGUN']);

type Bit = Omit<Particle, 'pos' | 'vel'> & { x: number; y: number; vx: number; vy: number };

/** Each weapon's gag: its sound, and the bits it puts out (built from the muzzle `m`, facing `f`, his speed `pv`). */
const GAGS: Partial<Record<WeaponType, { sound: Parameters<typeof playSound>[0]; bits: (m: { x: number; y: number }, f: number, r: () => number) => Bit[] }>> = {
  // The LMG: the bolt clacks on nothing, one last casing kicks out the side and bounces, the empty belt's links drop
  // off it, and a wisp of smoke from the barrel
  LMG: {
    sound: 'dry_lmg',
    bits: (m, f, r) => [
      { x: m.x - f * 20, y: m.y - 2, vx: -f * (1 + r()), vy: -3 - r() * 1.5, color: '#CA8A04', size: 4, life: 70, alpha: 1, chunk: true, grav: 0.35 },
      ...[0, 1, 2].map(k => ({ x: m.x - f * (24 + k * 4), y: m.y + 6, vx: -f * r() * 0.6, vy: k * 0.4, color: k % 2 ? '#374151' : '#6B7280', size: 4, life: 50, alpha: 1, chunk: true, grav: 0.3 })),
      { x: m.x, y: m.y - 2, vx: f * 0.3, vy: -0.6, color: '#9CA3AF', size: 6, life: 45 },
    ],
  },
  // The ice gun: a frosty puff out of the barrel and a couple of snowflakes drifting down out of it
  SHOTGUN: {
    sound: 'dry_ice',
    bits: (m, f, r) => [
      ...[0, 1, 2].map(k => ({ x: m.x + f * k * 4, y: m.y - 2, vx: f * (0.6 + k * 0.4), vy: -0.3 - r() * 0.3, color: k ? '#BAE6FD' : '#E0F2FE', size: 8 - k * 2, life: 30, alpha: 0.7 - k * 0.15, chunk: true })),
      ...[0, 1, 2].map(k => ({ x: m.x + f * (4 + k * 6), y: m.y, vx: f * (0.3 + r() * 0.6), vy: 0.2 + r() * 0.3, color: '#F0F9FF', size: 2, life: 50, grav: 0.02 })),
    ],
  },
  // The flamethrower: the pilot light coughs a couple of tiny flames and goes out in a puff of black smoke
  FLAMETHROWER: {
    sound: 'dry_flame',
    bits: (m, f, r) => [
      { x: m.x + f * 4, y: m.y - 2, vx: f * 0.8, vy: -0.8, color: '#FDBA74', size: 4, life: 8, alpha: 1, chunk: true },
      { x: m.x + f * 6, y: m.y, vx: f * 0.4, vy: -0.4, color: '#EA580C', size: 2, life: 12, alpha: 1, chunk: true },
      ...[0, 1, 2].map(k => ({ x: m.x + f * (6 + k * 3), y: m.y - 2 - k * 3, vx: f * (0.3 + r() * 0.4), vy: -0.6 - k * 0.25, color: k === 1 ? '#1F2937' : '#374151', size: 6 + k * 2, life: 50 + k * 8 })),
    ],
  },
  // The boulder blunderbuss: one measly pebble drops out of his fist, and a dribble of dust after it
  BOULDER: {
    sound: 'dry_boulder',
    bits: (m, f, r) => [
      { x: m.x + f * 4, y: m.y + 8, vx: f * (0.8 + r() * 0.6), vy: -1, color: '#A8885A', size: 4, life: 80, alpha: 1, chunk: true, grav: 0.4 },
      ...[0, 1, 2, 3].map(k => ({ x: m.x + f * (2 + r() * 6), y: m.y + 8 + k * 3, vx: f * r() * 0.4, vy: 0.3 + k * 0.25, color: k % 2 ? '#8B7B62' : '#6F6250', size: 2 + (k % 2) * 2, life: 40, grav: 0.04 })),
    ],
  },
  // The tsunami: where a wall of water should be, a sad little dribble off the end of the barrel
  TSUNAMI: {
    sound: 'dry_tsunami',
    bits: (m, f) => [0, 1, 2, 3].map(k => ({ x: m.x + f * (2 - k), y: m.y + 2, vx: f * (0.6 - k * 0.15), vy: k * 0.5, color: k % 2 ? '#93C5FD' : '#3B82F6', size: k ? 2 : 4, life: 60, alpha: 1, chunk: true, grav: 0.18 + k * 0.03 })),
  },
  // The needles: the plunger hisses down on nothing (a faint puff of air), and one last drop of the good stuff
  NEEDLES: {
    sound: 'dry_needles',
    bits: (m, f, r) => [
      ...[0, 1].map(k => ({ x: m.x + f * (2 + k * 4), y: m.y - 1, vx: f * (1.2 + r() * 0.5), vy: -0.2, color: '#E5E7EB', size: 4 - k * 2, life: 18, alpha: 0.5, chunk: true })),
      { x: m.x + f * 2, y: m.y + 2, vx: f * 0.2, vy: 0.2, color: '#FF2BD6', size: 2, life: 60, alpha: 1, chunk: true, grav: 0.15 },
    ],
  },
  // The taser: flat batteries, a couple of weak sparks that hardly leave the prongs (one falls off), and a wisp
  TASER: {
    sound: 'dry_taser',
    bits: (m, f, r) => [
      ...[0, 1, 2].map(k => ({ x: m.x, y: m.y + (k - 1) * 3, vx: f * r() * 0.8, vy: -r() * 0.8, color: k % 2 ? '#E0F2FE' : '#00E5FF', size: 2, life: 10 + k * 3, alpha: 1 })),
      { x: m.x, y: m.y, vx: f * 0.5, vy: -0.5, color: '#00E5FF', size: 2, life: 30, alpha: 1, chunk: true, grav: 0.2 },
      { x: m.x + f * 2, y: m.y - 4, vx: 0, vy: -0.5, color: '#6B7280', size: 4, life: 35 },
    ],
  },
  // The sludge barfer: a burp of green gas, and one gob plopping off the end
  SLUDGE: {
    sound: 'dry_sludge',
    bits: (m, f, r) => [
      ...[0, 1].map(k => ({ x: m.x + f * (4 + k * 4), y: m.y - 4 - k * 3, vx: f * (0.5 + r() * 0.3), vy: -0.5 - k * 0.2, color: k ? '#556B2F' : '#6B7F3A', size: 8 - k * 2, life: 45 })),
      { x: m.x + f * 2, y: m.y + 2, vx: f * 0.6, vy: 0, color: '#65A30D', size: 6, life: 70, alpha: 1, chunk: true, grav: 0.3 },
      { x: m.x, y: m.y + 4, vx: 0, vy: 0.2, color: '#84CC16', size: 2, life: 60, alpha: 1, chunk: true, grav: 0.12 },
    ],
  },
  // The oil rocket launcher: click, a limp little pfft of smoke out of the tube, and a drip of crude
  OIL_ROCKET: {
    sound: 'dry_oil',
    bits: (m, f, r) => [
      ...[0, 1, 2].map(k => ({ x: m.x + f * (2 + k * 5), y: m.y - k * 2, vx: f * (0.8 - k * 0.2), vy: -0.3 - k * 0.2 - r() * 0.2, color: k === 2 ? '#D1D5DB' : '#9CA3AF', size: 4 + k * 2, life: 40 + k * 6 })),
      { x: m.x - f * 2, y: m.y + 4, vx: 0, vy: 0.2, color: '#1C1917', size: 4, life: 70, alpha: 1, chunk: true, grav: 0.15 },
    ],
  },
};

/**
 * Called every frame (from updatePlayerActions). Fire pressed with the current weapon empty, or a held weapon (the
 * LMG, the flamethrower, the needles, the taser) running dry under his finger: the gag, once (not while fire's held,
 * and not again for a moment however fast it's mashed). Never mid charge/uppercut/divekick, in a cutscene, dead, or
 * with the infinite ammo cheat on (hasAmmo is always true then).
 */
export const updateDryFire = (ctx: FrameContext, input: FrameInput) => {
  const { state, currentWeapon } = ctx;
  const { player } = state;
  const gag = GAGS[currentWeapon];
  const loaded = hasAmmo(ctx, currentWeapon);
  // Run dry mid-hold: it tries the next one when the next one's due (the last shot's cooldown up), and clicks. Only
  // the ones that keep firing while it's held; the boulder and the ice gun want a fresh press each, so they wait for one
  const wasLive = !!player.dryWasLive && !ONE_PER_PRESS.has(currentWeapon);
  const due = (player.shootCooldown || 0) <= 0;
  player.dryWasLive = input.shoot && (loaded || (wasLive && !due));
  if (!gag || loaded || !input.shoot) return;
  if (!input.shootPressed && !(wasLive && due)) return;
  if (armsBusy(player) || player.inCutscene || state.deathTimer > 0 || player.health <= 0) return;
  // (the taser still overloaded says so itself; the flamethrower in the water fizzles on its own)
  if (currentWeapon === 'TASER' && (player.taserOverloadTimer || 0) > 0) return;
  if (currentWeapon === 'FLAMETHROWER' && (player.swimming || player.isDucking)) return;
  if (player.dryFireAt !== undefined && state.frame - player.dryFireAt >= 0 && state.frame - player.dryFireAt < DRY_FIRE_GAP) return;
  player.dryFireAt = state.frame;
  const m = currentWeapon === 'FLAMETHROWER' ? flamethrowerNozzle(player) : muzzlePoint(player, currentWeapon);
  // (carried along with him: he may be running)
  for (const b of gag.bits(m, player.facing, Math.random)) {
    const { x, y, vx, vy, ...rest } = b;
    state.particles.push({ ...rest, pos: { x: x - b.size / 2, y: y - b.size / 2 }, vel: { x: vx + player.vel.x * 0.5, y: vy } });
  }
  playSound(gag.sound);
};
