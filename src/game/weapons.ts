import { Projectile, Enemy, Vector2 } from '../types';
import {
  BULLET_DAMAGE, SHOTGUN_DAMAGE, SHOTGUN_COOLDOWN, SHOTGUN_PELLET_COUNT, SHOTGUN_SPREAD_DEG, SHOTGUN_JITTER_DEG,
  SHOTGUN_PELLET_SPEED_MIN, SHOTGUN_PELLET_SPEED_MAX, SHOTGUN_PELLET_LIFETIME,
  BOULDER_COOLDOWN, BOULDER_ROLL_SPEED, BOULDER_LOB_SPEED, BOULDER_LIFETIME,
  FLAMETHROWER_DAMAGE, FLAMETHROWER_SEGMENTS, FLAMETHROWER_MAX_RANGE, FLAMETHROWER_START_RANGE,
  FLAMETHROWER_GROWTH, FLAMETHROWER_SHRINK, FLAMETHROWER_AIM_LERP, FLAMETHROWER_AIM_DEG, FLAMETHROWER_NOZZLE_GAP,
  FLAMETHROWER_SEGMENT_LIFETIME, FLAMETHROWER_SEGMENT_SIZE, FLAMETHROWER_AMMO_EVERY, GML_SCALE,
  TSUNAMI_COOLDOWN, COLORS, PARTICLE_PALETTES,
  TASER_RANGE, CANVAS_WIDTH, GUN_COOLDOWN, GUN_VELOCITY,
  NEEDLE_DAMAGE, NEEDLE_COOLDOWN, SLUDGE_COOLDOWN, FILTH_SHIELD_DURATION, SLUDGE_DAMAGE,
  OIL_ROCKET_DAMAGE, OIL_ROCKET_COOLDOWN, OIL_ROCKET_SPLASH_RADIUS, OIL_ROCKET_SPLASH_DAMAGE,
  OIL_ROCKET_OILED_DURATION, OIL_ROCKET_NUKE_DAMAGE, ENEMY_HIT_COOLDOWN,
} from '../constants';
import { GameState } from './state';
import { FrameContext, killBoss } from './context';
import { getBossDamage, checkIsWeakness, artieWeaknessLeap, speakAsBoss, maybeReactToWeapon } from './boss';
import { pickRandom, rectsOverlap, boundsOf } from './utils';

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
 * The taser is special: this only starts it; update.ts keeps it running.
 */
export const fireWeapon = (ctx: FrameContext, input: WeaponInput) => {
  const { state, fx, cheats } = ctx;
  const { player } = state;
  const { currentWeapon, facing, pos, width, isDucking } = player;
  const shootX = pos.x + (facing === 1 ? width : -10);
  const shootY = isDucking ? pos.y + 52 : pos.y + 25;
  const useAmmo = () => { if (!cheats.infiniteAmmo) player.weaponAmmo[currentWeapon]--; };
  const addProjectile = (p: Projectile) => state.projectiles.push(p);

  switch (currentWeapon) {
    case 'GUN':
      addProjectile({
        id: `p-${Date.now()}`,
        pos: { x: shootX, y: shootY },
        vel: { x: facing * GUN_VELOCITY, y: 0 },
        width: 16, height: 6, health: 1, maxHealth: 1,
        type: 'projectile', damage: BULLET_DAMAGE, owner: 'player'
      });
      player.shootCooldown = GUN_COOLDOWN;
      fx.playGunSound('gun');
      break;

    case 'BOULDER': {
      // GML oBoulderBlunderbuss: one boulder per press; up+fire lobs it
      if (!input.shootPressed) break;
      const size = 48;
      const lob = input.moveUp;
      const cx = shootX + facing * gml(12) + (lob ? -facing * gml(12) : 0);
      const cy = shootY - (lob ? gml(24) : gml(12));
      const spawn = { x: cx - size / 2, y: cy - size / 2, w: size, h: size };
      // Don't fire into a wall
      if (state.blocks.some(b => b.type !== 'pit' && rectsOverlap(spawn, b))) break;
      addProjectile({
        id: `b-${Date.now()}-${Math.random()}`,
        pos: { x: spawn.x, y: spawn.y },
        vel: lob ? { x: facing * BOULDER_LOB_SPEED, y: -BOULDER_LOB_SPEED } : { x: facing * BOULDER_ROLL_SPEED, y: 0 },
        width: size, height: size, health: 1, maxHealth: 1,
        type: 'projectile', damage: 0, owner: 'player', isBoulder: true, life: BOULDER_LIFETIME, rotation: 0,
      });
      player.shootCooldown = BOULDER_COOLDOWN;
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
          pos: { x: shootX, y: shootY },
          vel: { x: facing * Math.cos(angle) * speedX, y: -Math.sin(angle) * speedY },
          width: 10, height: 10, health: 1, maxHealth: 1,
          type: 'projectile', damage: SHOTGUN_DAMAGE, owner: 'player', isIce: true,
          life: SHOTGUN_PELLET_LIFETIME, bounces: 0,
        });
      }
      player.shootCooldown = SHOTGUN_COOLDOWN;
      fx.playGunSound('ice');
      useAmmo();
      break;

    case 'NEEDLES':
      addProjectile({
        id: `dart-${Date.now()}`,
        pos: { x: shootX, y: shootY },
        vel: { x: facing * 24, y: (Math.random() - 0.5) * 5 },
        width: 20, height: 4, health: 1, maxHealth: 1,
        type: 'projectile', damage: NEEDLE_DAMAGE, owner: 'player', isDart: true
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
      state.tsunamiDir = facing;
      state.tsunamiStartX = facing === 1 ? state.camera.x : state.camera.x + CANVAS_WIDTH;
      state.tsunamiX = state.tsunamiStartX;
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
        pos: { x: facing === 1 ? pos.x + width + 4 : pos.x - 44, y: shootY - 10 },
        vel: { x: facing * 24, y: 0 },
        width: 40, height: 20, health: 1, maxHealth: 1,
        type: 'projectile', damage: OIL_ROCKET_DAMAGE, owner: 'player', isOilRocket: true
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
  state.projectiles.push({
    id: `sludge-part-${Date.now()}-${player.barfTimer}`,
    pos: {
      x: player.pos.x + (player.facing === 1 ? player.width : -10),
      y: player.isDucking ? player.pos.y + 45 : player.pos.y + 25,
    },
    vel: { x: player.facing * (11 + Math.random() * 8), y: -3 - Math.random() * 9 },
    width: 22 + Math.random() * 15,
    height: 22 + Math.random() * 15,
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

  // Aim sweeps slowly (negative angle = up, in canvas terms)
  const aimRad = FLAMETHROWER_AIM_DEG * Math.PI / 180;
  const target = input.moveUp ? -aimRad : input.moveDown ? aimRad : 0;
  player.flameAngle = (player.flameAngle || 0) + (target - (player.flameAngle || 0)) * FLAMETHROWER_AIM_LERP;

  const firing = input.shoot && !player.isDucking && !player.isTasing;
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

  const nozzle = {
    x: player.pos.x + (player.facing === 1 ? player.width - 5 : 5),
    y: player.isDucking ? player.pos.y + 45 : player.pos.y + 30,
  };
  const dir = { x: player.facing * Math.cos(player.flameAngle), y: Math.sin(player.flameAngle) };

  if (firing && hasFuel) {
    player.isFlaming = true;
    const gap = range / FLAMETHROWER_SEGMENTS;
    for (let i = 0; i < FLAMETHROWER_SEGMENTS; i++) {
      const dist = FLAMETHROWER_NOZZLE_GAP + i * gap;
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
  const { state, fx, stageId, currentWeapon } = ctx;
  const { player } = state;

  if (e.type === 'boss') {
    if (!state.arenaLocked || (e.hitCooldown && e.hitCooldown > 0)) return;
    const dmg = getBossDamage(e, stageId, currentWeapon);
    const isW = checkIsWeakness(stageId, currentWeapon);
    e.health -= dmg;
    e.hitCooldown = 60;
    fx.spawnDamageNumber(e.pos, dmg, isW);
    if (stageId === 'Artie Avalanche' && isW && e.health > 0) artieWeaknessLeap(e);
    maybeReactToWeapon(e, 'FLAMETHROWER', stageId, state, ctx.bossHelpers);
    if (e.health <= 0) killBoss(ctx, e, player.facing, isW);
    return;
  }
  if (e.isOiled) {
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
    fx.blowAwayEnemy(e, { x: player.facing * 4, y: -6 }, 'flamethrower_kill', player.facing);
    player.killSatisfactionTimer = 60;
  }
};

/** Nearest on-screen enemy or meth barrel in front of the player, within taser range. */
export const findTaserTarget = (state: GameState): Enemy | Projectile | null => {
  const { player, camera } = state;
  const playerMidX = player.pos.x + player.width / 2;
  const playerMidY = player.pos.y + player.height / 2;
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
  const { state, fx, stageId, currentWeapon } = ctx;
  fx.spawnOilSplatter(pos);

  state.enemies.forEach(e => {
    if (e.health <= 0 || e.isBlownAway) return;
    const dx = (e.pos.x + e.width / 2) - pos.x;
    const dy = (e.pos.y + e.height / 2) - pos.y;
    if (dx * dx + dy * dy >= OIL_ROCKET_SPLASH_RADIUS * OIL_ROCKET_SPLASH_RADIUS) return;

    if (e.type === 'boss') {
      if (e.hitCooldown && e.hitCooldown > 0) return;
      const isW = checkIsWeakness(stageId, currentWeapon, { isOilRocket: true });
      const dmg = getBossDamage(e, stageId, currentWeapon, { isOilRocket: true });
      e.health -= dmg;
      e.hitCooldown = ENEMY_HIT_COOLDOWN;
      e.isOiled = true;
      e.oiledTimer = OIL_ROCKET_OILED_DURATION;
      fx.spawnDamageNumber(e.pos, dmg, isW);

      if (stageId === 'Toxic Tommy' && isW && e.health > 0) {
        e.bossState = 'weakness_stunned';
        e.stateTimer = 75;
        e.pukeSweepProgress = 0;
        // Pop him up out of the sludge if he was submerged
        if (e.pos.y >= state.tommySludgeY - 30) {
          e.pos.y = 480 - e.height + 5;
          e.vel.y = -8;
        }
        state.tommySludgeOiledTimer = 240;
        fx.spawnExplosion({ x: e.pos.x + e.width / 2, y: Math.min(e.pos.y + 20, state.tommySludgeY) }, '#111111', 25, 0, 10);
        speakAsBoss('Toxic Tommy', "BLAARGH! CRUDE OIL?! I CAN'T CHUNDER!", ctx.bossHelpers);
      }
      maybeReactToWeapon(e, 'OIL_ROCKET', stageId, state, ctx.bossHelpers);
      if (e.health <= 0) killBoss(ctx, e, 0, isW);
      return;
    }

    e.health -= OIL_ROCKET_SPLASH_DAMAGE;
    e.isOiled = true;
    e.oiledTimer = OIL_ROCKET_OILED_DURATION;
    fx.spawnDamageNumber(e.pos, OIL_ROCKET_SPLASH_DAMAGE);

    const pushDir = (rocketVelX !== undefined && Math.abs(rocketVelX) > 0.1) ? Math.sign(rocketVelX) : (dx >= 0 ? 1 : -1);
    const isAirEnemy = e.enemyType === 'flyer' || e.enemyType === 'drone' || e.behavior === 'fly' || e.behavior === 'hover';

    if (e.health <= 0) {
      fx.blowAwayEnemy(e, { x: pushDir * 24 + (Math.random() - 0.5) * 6, y: -18 }, 'oil_kill', pushDir);
    } else if (isAirEnemy) {
      // Air enemies: forceful pushback
      e.vel.x = pushDir * 14;
      e.vel.y = -3;
      e.pauseTimer = 35;
    } else {
      // Grounded enemies: sent flying high and backward!
      e.vel.x = pushDir * 22;
      e.vel.y = -15;
      e.pauseTimer = 55;
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
    if (dx * dx + dy * dy >= 250 * 250) return;
    e.health -= OIL_ROCKET_NUKE_DAMAGE;
    fx.spawnDamageNumber(e.pos, OIL_ROCKET_NUKE_DAMAGE, true, '#FF0000');
    if (e.health > 0) return;
    if (e.type === 'boss') killBoss(ctx, e, 0, true);
    else {
      fx.blowAwayEnemy(e, { x: (Math.random() - 0.5) * 40, y: -25 }, 'oil_kill', 0, 3);
      fx.spawnKillCallout(e, 'nuke');
    }
  });

  fx.playGunSound('tsunami');
  state.screenShakeTimer = 24;
};
