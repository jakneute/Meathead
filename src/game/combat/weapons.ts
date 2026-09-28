import { Projectile, Enemy, Vector2 } from '../../types';
import {
  GROUND_Y,
  BULLET_DAMAGE, LMG_DAMAGE, LMG_COOLDOWN, LMG_VELOCITY, LMG_SPREAD_DEG, SHOTGUN_DAMAGE, SHOTGUN_COOLDOWN, SHOTGUN_PELLET_COUNT, SHOTGUN_SPREAD_DEG, SHOTGUN_JITTER_DEG,
  SHOTGUN_PELLET_SPEED_MIN, SHOTGUN_PELLET_SPEED_MAX, SHOTGUN_PELLET_LIFETIME,
  BOULDER_COOLDOWN, BOULDER_THROW_FRAMES, BOULDER_ROLL_SPEED, BOULDER_HEAVE_SPEED_X, BOULDER_HEAVE_SPEED_Y, BOULDER_SPIKE_SPEED_X, BOULDER_SPIKE_SPEED_Y, BOULDER_LIFETIME,
  FLAMETHROWER_DAMAGE, FLAMETHROWER_SEGMENTS, FLAMETHROWER_MAX_RANGE, FLAMETHROWER_START_RANGE,
  FLAMETHROWER_GROWTH, FLAMETHROWER_SHRINK, FLAMETHROWER_AIM_LERP, FLAMETHROWER_AIM_DEG, FLAMETHROWER_NOZZLE_GAP,
  FLAMETHROWER_SEGMENT_LIFETIME, FLAMETHROWER_SEGMENT_SIZE, FLAMETHROWER_AMMO_EVERY, GML_SCALE,
  TSUNAMI_COOLDOWN, COLORS, PARTICLE_PALETTES,
  TASER_RANGE, CANVAS_WIDTH, GUN_COOLDOWN, GUN_VELOCITY,
  NEEDLE_DAMAGE, NEEDLE_COOLDOWN, SLUDGE_COOLDOWN, FILTH_SHIELD_DURATION, SLUDGE_DAMAGE,
  OIL_ROCKET_DAMAGE, OIL_ROCKET_COOLDOWN, OIL_ROCKET_SPLASH_RADIUS, OIL_ROCKET_SPLASH_DAMAGE,
  OIL_ROCKET_OILED_DURATION, OIL_ROCKET_NUKE_DAMAGE, OIL_ROCKET_NUKE_RADIUS,
} from '../../constants';
import { GameState } from '../core/state';
import { FrameContext, killBoss } from '../core/context';
import { hitBoss, getBossDef } from '../bosses/registry';
import { pickRandom, rectsOverlap, boundsOf } from '../core/utils';
import { findFlyingCigarette, igniteOilWithFlame } from '../bosses/oscar';
import { icicleBounds, meltIcicle } from '../bosses/artie';
import { pushEnemy } from './knockback';
import { isMidBoss, midBossDamage, MIDBOSS_DAMAGE, MIDBOSS_SPLASH_DAMAGE, MIDBOSS_NUKE_DAMAGE } from './midBoss';
import { muzzlePoint, flamethrowerNozzle } from './muzzle';
import { floorTopAt } from '../core/terrain';
import { detonateSewerNuke, TOXIC_TOMMY } from '../scenes/sewerNuke';

/** The bits of this frame's input that weapons care about. */
export interface WeaponInput {
  shoot: boolean;
  shootPressed: boolean;
  moveUp: boolean;
  moveDown: boolean;
}

const gml = (v: number) => v * GML_SCALE;

const pointInSolid = (state: GameState, x: number, y: number) =>
  state.blocks.some(b => b.type !== 'pit' && b.type !== 'door' && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);

/**
 * Fires the player's current weapon (called when fire is held and off cooldown).
 * The taser is special: this only starts it; core/update.ts keeps it running.
 */
export const fireWeapon = (ctx: FrameContext, input: WeaponInput) => {
  const { state, fx, cheats } = ctx;
  const { player } = state;
  const { currentWeapon, facing, pos, width } = player;
  // Shots leave from the tip of the weapon as it's drawn (a few pixels inside it, so they emerge from it)
  const muzzle = muzzlePoint(player, currentWeapon);
  const fromMuzzle = (w: number, h: number) => ({ x: facing === 1 ? muzzle.x - 4 : muzzle.x - w + 4, y: muzzle.y - h / 2 });
  const useAmmo = () => { if (!cheats.infiniteAmmo) player.weaponAmmo[currentWeapon]--; };
  const addProjectile = (p: Projectile) => state.projectiles.push(p);

  switch (currentWeapon) {
    case 'GUN':
      addProjectile({
        id: `p-${Date.now()}`,
        pos: fromMuzzle(16, 6),
        vel: { x: facing * GUN_VELOCITY, y: 0 },
        width: 16, height: 6, health: 1, maxHealth: 1,
        type: 'projectile', damage: BULLET_DAMAGE, owner: 'player', fromX: pos.x + width / 2
      });
      player.shootCooldown = GUN_COOLDOWN;
      fx.playGunSound('gun');
      break;

    case 'LMG': {
      // A hose of lead: a round every few frames, each one anywhere in a wide cone (carried along with him: he's on a bike)
      const a = (Math.random() * 2 - 1) * LMG_SPREAD_DEG * Math.PI / 180;
      addProjectile({
        id: `lmg-${Date.now()}-${Math.random()}`,
        pos: fromMuzzle(16, 6),
        vel: { x: facing * Math.cos(a) * LMG_VELOCITY + player.vel.x, y: Math.sin(a) * LMG_VELOCITY },
        width: 16, height: 6, health: 1, maxHealth: 1,
        type: 'projectile', damage: LMG_DAMAGE, owner: 'player', fromX: pos.x + width / 2, pierce: 3, hitIds: [],
      });
      player.shootCooldown = LMG_COOLDOWN;
      // (the muzzle flash, big, and brass going everywhere)
      for (let k = 0; k < 3; k++) state.particles.push({ pos: { x: muzzle.x + facing * 4, y: muzzle.y }, vel: { x: facing * (2 + Math.random() * 4) + player.vel.x, y: (Math.random() - 0.5) * 3 }, life: 5, color: k === 0 ? '#FFFFFF' : '#FDE047', size: 6 + Math.random() * 6 });
      state.particles.push({ pos: { x: muzzle.x - facing * 20, y: muzzle.y }, vel: { x: -facing * (1 + Math.random() * 2) + player.vel.x, y: -2 - Math.random() * 3 }, life: 24, color: '#CA8A04', size: 2 });
      if (state.frame % 2 === 0) fx.playGunSound('gun');
      break;
    }

    case 'BOULDER': {
      // GML oBoulderBlunderbuss: one boulder per press; up+fire lobs it
      if (!input.shootPressed) break;
      const size = 48;
      const lob = input.moveUp;
      // Down+fire in the air: spiked down in front of him, steep and hard
      const spike = !lob && input.moveDown && !player.isGrounded;
      // Heaved straight up from over his head, or rolled out from the rock in his hand
      // (the rolled one sits just in front of the rock in his fist, so it leaves from his hand; the spiked one
      // leaves from down by his feet, clear of him)
      const cx = lob ? pos.x + width / 2 + facing * gml(3) : spike ? pos.x + width / 2 + facing * (width / 2 + size / 2 + 10) : muzzle.x + facing * 12;
      const cy = lob ? pos.y - size / 2 - 2 : spike ? pos.y + player.height - size / 2 : muzzle.y;
      const spawn = { x: cx - size / 2, y: cy - size / 2, w: size, h: size };
      // Don't fire into a wall (a lob goes up through a jump-through ledge overhead, as he would)
      if (state.blocks.some(b => b.type !== 'pit' && !(lob && b.oneWay) && rectsOverlap(spawn, b))) break;
      addProjectile({
        id: `b-${Date.now()}-${Math.random()}`,
        pos: { x: spawn.x, y: spawn.y },
        vel: lob ? { x: facing * BOULDER_HEAVE_SPEED_X, y: -BOULDER_HEAVE_SPEED_Y } : spike ? { x: facing * BOULDER_SPIKE_SPEED_X, y: BOULDER_SPIKE_SPEED_Y } : { x: facing * BOULDER_ROLL_SPEED, y: 0 },
        width: size, height: size, health: 1, maxHealth: 1,
        type: 'projectile', damage: 0, owner: 'player', isBoulder: true, life: BOULDER_LIFETIME, rotation: 0,
      });
      player.shootCooldown = BOULDER_COOLDOWN;
      player.throwTimer = BOULDER_THROW_FRAMES;
      player.throwLob = lob;
      useAmmo();
      break;
    }

    case 'SHOTGUN':
      // GML oShotgunIce: an evenly spaced fan of pellets with a little jitter
      if (!input.shootPressed) break;
      for (let i = 0; i < SHOTGUN_PELLET_COUNT; i++) {
        const offset = i * (SHOTGUN_SPREAD_DEG / (SHOTGUN_PELLET_COUNT - 1)) - SHOTGUN_SPREAD_DEG / 2;
        const jitter = Math.round((Math.random() - 0.5) * 2 * SHOTGUN_JITTER_DEG);
        const angle = (offset + jitter) * Math.PI / 180;
        const speedX = SHOTGUN_PELLET_SPEED_MIN + Math.random() * (SHOTGUN_PELLET_SPEED_MAX - SHOTGUN_PELLET_SPEED_MIN);
        const speedY = SHOTGUN_PELLET_SPEED_MIN + Math.random() * (SHOTGUN_PELLET_SPEED_MAX - SHOTGUN_PELLET_SPEED_MIN);
        addProjectile({
          id: `pellet-${Date.now()}-${i}`,
          pos: fromMuzzle(10, 10),
          vel: { x: facing * Math.cos(angle) * speedX, y: -Math.sin(angle) * speedY },
          width: 10, height: 10, health: 1, maxHealth: 1,
          type: 'projectile', damage: SHOTGUN_DAMAGE, owner: 'player', isIce: true,
          life: SHOTGUN_PELLET_LIFETIME, bounces: 0, fromX: pos.x + width / 2,
        });
      }
      player.shootCooldown = SHOTGUN_COOLDOWN;
      fx.playGunSound('ice');
      useAmmo();
      break;

    case 'NEEDLES':
      addProjectile({
        id: `dart-${Date.now()}`,
        pos: fromMuzzle(20, 4),
        vel: { x: facing * 24, y: (Math.random() - 0.5) * 5 },
        width: 20, height: 4, health: 1, maxHealth: 1,
        type: 'projectile', damage: NEEDLE_DAMAGE, owner: 'player', isDart: true, fromX: pos.x + width / 2
      });
      player.shootCooldown = NEEDLE_COOLDOWN;
      fx.playGunSound('dart');
      useAmmo();
      break;

    case 'FLAMETHROWER':
      // Handled every frame by updateFlamethrower (it needs to grow and shrink)
      break;

    case 'SLUDGE':
      // Starts the barf stream (see updateBarfStream) and grants the filth shield
      player.barfTimer = 24;
      player.shootCooldown = SLUDGE_COOLDOWN;
      player.filthShieldTimer = FILTH_SHIELD_DURATION;
      useAmmo();
      fx.playGunSound('barf');
      break;

    case 'TSUNAMI':
      if (state.tsunamiActive) break;
      state.tsunamiActive = true;
      state.tsunamiSerial = (state.tsunamiSerial ?? 0) + 1;
      state.tsunamiDir = facing;
      state.tsunamiStartX = facing === 1 ? state.camera.x : state.camera.x + CANVAS_WIDTH;
      state.tsunamiX = state.tsunamiStartX;
      // The wave's built for a flat floor at GROUND_Y: lift (or drop) it to the ground he's standing on (or over)
      const feet = player.pos.y + player.height;
      state.tsunamiOffsetY = (floorTopAt(state.blocks, player.pos.x + player.width / 2, feet, 0) ?? feet) - GROUND_Y;
      player.shootCooldown = TSUNAMI_COOLDOWN;
      fx.playGunSound('tsunami');
      useAmmo();
      break;

    case 'TASER':
      if (player.isTasing) break;
      player.isTasing = true;
      player.taserTimer = 0;
      player.taserTargetId = findTaserTarget(state)?.id ?? null;
      break;

    case 'OIL_ROCKET':
      addProjectile({
        id: `oil-${Date.now()}`,
        pos: fromMuzzle(40, 20),
        vel: { x: facing * 24, y: 0 },
        width: 40, height: 20, health: 1, maxHealth: 1,
        type: 'projectile', damage: OIL_ROCKET_DAMAGE, owner: 'player', isOilRocket: true,
        // Fired from a crouch it always flies straight (down is held, and it'd steer into the floor)
        noSteer: player.isDucking
      });
      player.shootCooldown = OIL_ROCKET_COOLDOWN;
      fx.playGunSound('oil');
      useAmmo();
      break;
  }
};

/** One puff of the sludge barf stream; called every frame while player.barfTimer runs. */
export const updateBarfStream = (state: GameState) => {
  const { player } = state;
  if (!player.barfTimer || player.barfTimer <= 0) return;
  player.barfTimer--;
  if (player.barfTimer % 2 !== 0) return;
  // Each glob starts at the launcher's mouth
  const muzzle = muzzlePoint(player, 'SLUDGE');
  const w = 22 + Math.random() * 15, h = 22 + Math.random() * 15;
  state.projectiles.push({
    id: `sludge-part-${Date.now()}-${player.barfTimer}`,
    pos: { x: player.facing === 1 ? muzzle.x - 8 : muzzle.x - w + 8, y: muzzle.y - h / 2 },
    vel: { x: player.facing * (11 + Math.random() * 8), y: -3 - Math.random() * 9 },
    width: w,
    height: h,
    health: 1, maxHealth: 1,
    type: 'projectile', damage: SLUDGE_DAMAGE, owner: 'player', isSludge: true, life: 150
  });
};

/**
 * GML oMoltenFlamethrower: while fire is held, lay down a stream of flame
 * segments from the nozzle. The stream grows toward full range, stops at the
 * first wall, and its aim sweeps slowly toward up/down. Releasing shrinks it.
 * Runs every frame while the flamethrower is equipped.
 */
export const updateFlamethrower = (ctx: FrameContext, input: WeaponInput) => {
  const { state, fx, cheats, currentWeapon } = ctx;
  const { player } = state;
  if (currentWeapon !== 'FLAMETHROWER') {
    player.isFlaming = false;
    player.flameAngle = 0;
    player.flameRange = FLAMETHROWER_START_RANGE;
    return;
  }

  const firing = input.shoot && !player.isDucking && !player.isTasing;

  // Aim sweeps slowly (negative angle = up, in canvas terms), but only while it's firing:
  // up or down on their own (or ducking) leave the nozzle level
  const aimRad = FLAMETHROWER_AIM_DEG * Math.PI / 180;
  const target = !firing ? 0 : input.moveUp ? -aimRad : input.moveDown ? aimRad : 0;
  player.flameAngle = (player.flameAngle || 0) + (target - (player.flameAngle || 0)) * FLAMETHROWER_AIM_LERP;
  if (player.isDucking) player.flameAngle = 0; // crouched: the nozzle's level, full stop
  const hasFuel = cheats.infiniteAmmo || player.weaponAmmo.FLAMETHROWER > 0;
  const range = player.flameRange ?? FLAMETHROWER_START_RANGE;

  if (firing) {
    player.flameDrainTimer = (player.flameDrainTimer || 0) + 1;
    if (player.flameDrainTimer >= FLAMETHROWER_AMMO_EVERY && hasFuel) {
      if (!cheats.infiniteAmmo) player.weaponAmmo.FLAMETHROWER--;
      player.flameDrainTimer = 0;
    }
  } else {
    player.flameDrainTimer = 0;
  }

  // The stream comes out of the nozzle, wherever the barrel is pointing
  const nozzle = flamethrowerNozzle(player);
  const dir = { x: player.facing * Math.cos(player.flameAngle), y: Math.sin(player.flameAngle) };

  if (firing && hasFuel) {
    player.isFlaming = true;
    // A hot, tight jet right at the nozzle (the drifting fire further out takes a moment to bloom)
    for (let k = 0; k < 4; k++) {
      const along = Math.random() * 16;
      const speed = 3 + Math.random() * 3;
      state.particles.push({
        pos: { x: nozzle.x + dir.x * along - 3 + player.vel.x, y: nozzle.y + dir.y * along - 3 + (Math.random() - 0.5) * 3 + player.vel.y },
        vel: { x: dir.x * speed, y: dir.y * speed },
        life: 4 + Math.random() * 4,
        alpha: 0.55 + Math.random() * 0.3,
        color: k === 0 ? '#FFF7D6' : k === 1 ? '#FFD700' : '#FFA500',
        size: 5 + along * 0.35 + Math.random() * 2,
      });
    }
    const gap = range / FLAMETHROWER_SEGMENTS;
    for (let i = 0; i < FLAMETHROWER_SEGMENTS; i++) {
      const dist = FLAMETHROWER_NOZZLE_GAP * 0.3 + i * gap;
      const x = nozzle.x + dir.x * dist + player.vel.x;
      const y = nozzle.y + dir.y * dist + player.vel.y;
      if (pointInSolid(state, x, y)) break;
      const size = FLAMETHROWER_SEGMENT_SIZE * (1 + (dist / GML_SCALE) * 0.01);
      state.flameSegments.push({
        x, y, size, gap, dirX: dir.x, dirY: dir.y,
        life: FLAMETHROWER_SEGMENT_LIFETIME, alpha: 1, density: 1 - i / FLAMETHROWER_SEGMENTS,
      });
    }
    if (range < FLAMETHROWER_MAX_RANGE) player.flameRange = range + (FLAMETHROWER_MAX_RANGE - range) * FLAMETHROWER_GROWTH;
    if (state.frame % 2 === 0) fx.playGunSound('flame');
  } else if (firing) {
    // Out of fuel: just sputtering smoke
    player.isFlaming = false;
    player.flameRange = range + (FLAMETHROWER_START_RANGE - range) * FLAMETHROWER_SHRINK;
    if (Math.random() < 0.33) {
      state.particles.push({
        pos: { x: nozzle.x + dir.x * gml(15), y: nozzle.y + dir.y * gml(15) },
        vel: { x: dir.x * 2 + (Math.random() - 0.5), y: dir.y * 2 - Math.random() },
        life: 25, color: '#6B7280', size: 5 + Math.random() * 6,
      });
    }
  } else {
    player.isFlaming = false;
    player.flameRange = Math.max(FLAMETHROWER_START_RANGE, range + (0 - range) * FLAMETHROWER_SHRINK);
  }
};

/**
 * GML oMoltenStream: each flame segment lives for a few frames, sheds fire
 * particles, burns the first enemy it touches (and is used up), and melts
 * enemy projectiles.
 */
export const updateFlameSegments = (ctx: FrameContext) => {
  const { state, fx } = ctx;

  state.flameSegments = state.flameSegments.filter(seg => {
    seg.life--;
    seg.alpha -= 0.1;
    if (seg.life <= 0 || seg.alpha <= 0) return false;

    // Fire particles along the segment, thinning out toward the tip
    const count = Math.ceil(seg.alpha * 5 * seg.density);
    const spread = 15 * Math.PI / 180;
    const baseAngle = Math.atan2(seg.dirY, seg.dirX);
    for (let i = 0; i < count; i++) {
      const along = Math.random() * seg.gap;
      const jitter = (seg.size / 8) * (1 + (1 - seg.density) * 3);
      const a = baseAngle + (Math.random() - 0.5) * 2 * spread;
      const speed = gml(1 + Math.random() * 1.5);
      state.particles.push({
        pos: { x: seg.x + seg.dirX * along + (Math.random() - 0.5) * 2 * jitter, y: seg.y + seg.dirY * along + (Math.random() - 0.5) * 2 * jitter },
        vel: { x: Math.cos(a) * speed, y: Math.sin(a) * speed },
        life: 8 + Math.random() * 10,
        color: pickRandom(PARTICLE_PALETTES.FIRE),
        size: 4 + Math.random() * 6 * seg.density + 2,
      });
    }

    const box = { x: seg.x - seg.size / 2, y: seg.y - seg.size / 2, w: seg.size, h: seg.size };

    // Melts Artie's icicles (the flame carries on)
    const icicle = state.icicles.findIndex(i => rectsOverlap(box, icicleBounds(i)));
    if (icicle >= 0) meltIcicle(ctx, icicle);

    // Sets Oily Oscar's oil slicks alight (on himself, most likely)
    if (state.oilCells.length > 0) igniteOilWithFlame(ctx, box);

    // Burn the first enemy touched
    const e = state.enemies.find(en => en.health > 0 && !en.isBlownAway && rectsOverlap(box, boundsOf(en)));
    if (e) {
      burnEnemy(ctx, e);
      return false;
    }

    // Melt enemy projectiles (not rubble, magma, enemy boulders or small ice shards)
    const p = state.projectiles.find(pr => pr.owner === 'enemy' && pr.health > 0 && rectsOverlap(box, boundsOf(pr)));
    if (p) {
      const isIndestructible = p.id.startsWith('debris-') || p.id.startsWith('magma-') || p.isBoulder || (p.isIce && p.width <= 20);
      if ((p.isIce && p.width > 30) || !isIndestructible) {
        p.health = 0;
        fx.spawnSteamExplosionParticles({ x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 }, 10);
        fx.spawnExplosion(
          { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 },
          p.isIce ? COLORS.PROJECTILE_ICE : (p.id.startsWith('magma') ? '#FF4500' : COLORS.PROJECTILE_ENEMY),
          Math.min(10, Math.ceil(p.width / 5)), 0, 10
        );
        return false;
      }
    }
    return true;
  });
};

/** One flame segment touching an enemy. */
const burnEnemy = (ctx: FrameContext, e: Enemy) => {
  const { state, fx } = ctx;
  const { player } = state;

  if (e.type === 'boss') {
    if (state.sewerNuke) return;
    // Setting fire to an oil-soaked Toxic Tommy: never a good idea
    if (ctx.stageId === TOXIC_TOMMY && e.isOiled && state.arenaLocked) { detonateSewerNuke(ctx, e); return; }
    if (!state.arenaLocked) return;
    const onFlamed = getBossDef(ctx.stageId)?.onFlamed;
    if (onFlamed) { onFlamed(ctx, e); return; }
    if (e.hitCooldown && e.hitCooldown > 0) return;
    hitBoss(ctx, e, 'FLAMETHROWER', { facing: player.facing });
    return;
  }
  // A mid-boss doesn't catch fire: the flames just hurt, the same however much of it's in them (once a frame)
  if (isMidBoss(e)) {
    if (e.burntAt === state.frame) return;
    e.burntAt = state.frame;
    e.health -= midBossDamage(e, MIDBOSS_DAMAGE.FLAMETHROWER);
    e.hitFlash = Math.max(e.hitFlash || 0, 2);
    if (state.frame % 3 === 0) state.particles.push({ pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + Math.random() * e.height * 0.6 }, vel: { x: (Math.random() - 0.5) * 2, y: -1 - Math.random() * 2 }, life: 18, color: Math.random() > 0.6 ? '#4B5563' : '#F97316', size: 3 + Math.random() * 3 });
    if (state.frame % 20 === 0) fx.spawnDamageNumber(e.pos, Math.round(midBossDamage(e, MIDBOSS_DAMAGE.FLAMETHROWER) * 20));
    return;
  }
  // (the moose shrugs off status effects, oil included: no fireball)
  if (e.isOiled && e.kind !== 'moose') {
    // Fire meets oil
    e.isOiled = false;
    detonateNuke(ctx, { x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2 });
    return;
  }

  e.health -= FLAMETHROWER_DAMAGE;
  // Sizzle
  for (let i = 0; i < 3; i++) {
    state.particles.push({
      pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + Math.random() * e.height * 0.6 },
      vel: { x: (Math.random() - 0.5) * 2, y: -1 - Math.random() * 2 },
      life: 15 + Math.random() * 10,
      color: Math.random() > 0.7 ? '#4B5563' : '#F97316',
      size: 2 + Math.random() * 3,
    });
  }
  if (e.health <= 0) {
    fx.killWithAnimation(e, 'charred', 'flamethrower_kill', 'charred');
    player.killSatisfactionTimer = 60;
  }
};

/** Nearest on-screen enemy or meth barrel in front of the player, within taser range. */
export const findTaserTarget = (state: GameState): Enemy | Projectile | null => {
  const { player, camera } = state;
  const playerMidX = player.pos.x + player.width / 2;
  const playerMidY = player.pos.y + player.height / 2;
  // Oily Oscar's flicked cigarette takes priority over everything
  const cigarette = findFlyingCigarette(state);
  if (cigarette) return cigarette;
  let nearest: Enemy | Projectile | null = null;
  let minDist = TASER_RANGE;

  const consider = (t: Enemy | Projectile) => {
    const tx = t.pos.x + t.width / 2;
    const ty = t.pos.y + t.height / 2;
    if (tx <= camera.x || tx >= camera.x + CANVAS_WIDTH) return;
    const inFront = (player.facing === 1 && tx > playerMidX) || (player.facing === -1 && tx < playerMidX);
    if (!inFront) return;
    const dist = Math.hypot(tx - playerMidX, ty - playerMidY);
    if (dist < minDist) { minDist = dist; nearest = t; }
  };

  state.enemies.forEach(e => { if (e.health > 0 && !e.isBlownAway) consider(e); });
  state.projectiles.forEach(p => { if (p.isMethBarrel && p.health > 0) consider(p); });
  return nearest;
};

/** Oil rocket impact: splash damage, coats targets in oil and knocks them back. */
export const explodeOilRocket = (ctx: FrameContext, pos: Vector2, rocketVelX?: number) => {
  const { state, fx } = ctx;
  fx.spawnOilSplatter(pos);

  state.enemies.forEach(e => {
    if (e.health <= 0 || e.isBlownAway) return;
    const dx = (e.pos.x + e.width / 2) - pos.x;
    const dy = (e.pos.y + e.height / 2) - pos.y;
    if (dx * dx + dy * dy >= OIL_ROCKET_SPLASH_RADIUS * OIL_ROCKET_SPLASH_RADIUS) return;

    if (e.type === 'boss') {
      if (e.hitCooldown && e.hitCooldown > 0) return;
      // Bosses don't get oiled up, except Toxic Tommy (it clogs him up, and there's the matter of setting him alight)
      if (ctx.stageId === TOXIC_TOMMY) {
        e.isOiled = e.kind !== 'moose';
        e.oiledTimer = OIL_ROCKET_OILED_DURATION;
      }
      hitBoss(ctx, e, 'OIL_ROCKET', { facing: 0, p: { isOilRocket: true } });
      return;
    }

    // A mid-boss takes the rocket and its splash as one solid hit (the oil doesn't stick to it)
    if (isMidBoss(e)) {
      const dmg = midBossDamage(e, MIDBOSS_DAMAGE.OIL_ROCKET + MIDBOSS_SPLASH_DAMAGE);
      e.health -= dmg;
      e.hitFlash = 6;
      fx.spawnDamageNumber(e.pos, Math.round(dmg));
      return;
    }
    e.health -= OIL_ROCKET_SPLASH_DAMAGE;
    e.isOiled = e.kind !== 'moose';
    e.oiledTimer = OIL_ROCKET_OILED_DURATION;
    fx.spawnDamageNumber(e.pos, OIL_ROCKET_SPLASH_DAMAGE);

    const pushDir = (rocketVelX !== undefined && Math.abs(rocketVelX) > 0.1) ? Math.sign(rocketVelX) : (dx >= 0 ? 1 : -1);
    const isAirEnemy = e.enemyType === 'flyer' || e.enemyType === 'drone' || e.behavior === 'fly' || e.behavior === 'hover';

    if (e.health <= 0) {
      fx.killWithAnimation(e, 'greased', 'oil_kill', 'greased', { x: pushDir * 12, y: -10 });
    } else if (isAirEnemy) {
      // Air enemies: shoved back (light ones further)
      pushEnemy(e, pushDir * 8, -2, 25);
    } else {
      // Grounded enemies: knocked back with a short hop, by weight; the oil it leaves on them keeps them sliding
      pushEnemy(e, pushDir * 12, -7, 35);
    }
  });

  fx.playGunSound('oil');
  state.screenShakeTimer = 8;
};

/** Setting an oiled enemy on fire: a huge blast that wipes out everything nearby. */
export const detonateNuke = (ctx: FrameContext, pos: Vector2) => {
  const { state, fx } = ctx;
  for (let i = 0; i < 100; i++) {
    state.particles.push({
      pos: { ...pos },
      vel: { x: (Math.random() - 0.5) * 40, y: (Math.random() - 0.5) * 40 },
      life: 80 + Math.random() * 80,
      color: i % 2 === 0 ? '#FFFFFF' : '#FFD700',
      size: 15 + Math.random() * 20
    });
  }

  state.enemies.forEach(e => {
    if (e.health <= 0 || e.isBlownAway) return;
    const dx = (e.pos.x + e.width / 2) - pos.x;
    const dy = (e.pos.y + e.height / 2) - pos.y;
    if (dx * dx + dy * dy >= OIL_ROCKET_NUKE_RADIUS * OIL_ROCKET_NUKE_RADIUS) return;
    // (a mid-boss caught in the blast takes a big hit, not the end of it)
    if (isMidBoss(e)) {
      const dmg = midBossDamage(e, MIDBOSS_NUKE_DAMAGE);
      e.health -= dmg;
      e.hitFlash = 8;
      fx.spawnDamageNumber(e.pos, Math.round(dmg), true, '#FF0000');
      return;
    }
    e.health -= OIL_ROCKET_NUKE_DAMAGE;
    fx.spawnDamageNumber(e.pos, OIL_ROCKET_NUKE_DAMAGE, true, '#FF0000');
    if (e.health > 0) return;
    if (e.type === 'boss') killBoss(ctx, e, 0, true);
    else {
      fx.blowAwayEnemy(e, { x: (Math.random() - 0.5) * 40, y: -25 }, 'oil_kill', 0, 3);
      fx.spawnKillCallout(e, 'nuke');
    }
  });

  // A ring of fire racing out to the edge of the blast
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const speed = OIL_ROCKET_NUKE_RADIUS / 22;
    state.particles.push({
      pos: { ...pos },
      vel: { x: Math.cos(a) * speed, y: Math.sin(a) * speed * 0.6 },
      life: 22,
      color: i % 3 === 0 ? '#FFFFFF' : i % 3 === 1 ? '#FFD700' : '#FF6D00',
      size: 10 + Math.random() * 8,
    });
  }
  fx.playGunSound('nuke');
  state.screenShakeTimer = 30;
  state.screenShakeMagnitude = 12;
};
