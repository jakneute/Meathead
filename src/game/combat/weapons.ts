import { Projectile, Enemy, Vector2 } from '../../types';
import {
  GROUND_Y,
  BULLET_DAMAGE, LMG_DAMAGE, LMG_COOLDOWN, LMG_VELOCITY, LMG_SPREAD_DEG, SHOTGUN_DAMAGE, SHOTGUN_COOLDOWN, SHOTGUN_PELLET_COUNT, SHOTGUN_SPREAD_DEG, SHOTGUN_JITTER_DEG,
  SHOTGUN_PELLET_SPEED_MIN, SHOTGUN_PELLET_SPEED_MAX, SHOTGUN_PELLET_LIFETIME,
  BOULDER_COOLDOWN, BOULDER_THROW_FRAMES, BOULDER_ROLL_SPEED, BOULDER_HEAVE_SPEED_X, BOULDER_HEAVE_SPEED_Y, BOULDER_SPIKE_SPEED_X, BOULDER_SPIKE_SPEED_Y, BOULDER_LIFETIME,
  FLAMETHROWER_DAMAGE, FLAMETHROWER_SEGMENTS, FLAMETHROWER_MAX_RANGE, FLAMETHROWER_START_RANGE,
  FLAMETHROWER_GROWTH, FLAMETHROWER_SHRINK, FLAMETHROWER_AIM_LERP, FLAMETHROWER_AIM_DEG, FLAMETHROWER_NOZZLE_GAP,
  FLAMETHROWER_SEGMENT_LIFETIME, FLAMETHROWER_SEGMENT_SIZE, FLAMETHROWER_AMMO_EVERY, GML_SCALE, ALT_FLAME_DAMAGE_SCALE, ALT_FLAME_RANGE_SCALE,
  TSUNAMI_COOLDOWN, COLORS, PARTICLE_PALETTES,
  TASER_RANGE, CANVAS_WIDTH, CANVAS_HEIGHT, GUN_COOLDOWN, GUN_VELOCITY, FINALE_STAGE,
  NEEDLE_DAMAGE, NEEDLE_COOLDOWN, SLUDGE_COOLDOWN, FILTH_SHIELD_DURATION, SLUDGE_DAMAGE,
  OIL_ROCKET_DAMAGE, OIL_ROCKET_COOLDOWN, OIL_ROCKET_SPLASH_RADIUS, OIL_ROCKET_SPLASH_DAMAGE,
  OIL_ROCKET_OILED_DURATION, OIL_ROCKET_NUKE_DAMAGE, OIL_ROCKET_NUKE_BOSS_DAMAGE, OIL_ROCKET_NUKE_BOSS_WEAKNESS_DAMAGE, OIL_ROCKET_NUKE_RADIUS,
} from '../../constants';
import { GameState } from '../core/state';
import { FrameContext, killBoss } from '../core/context';
import { hitBoss, getBossDef, getBossDamage, isWeakTo } from '../bosses/registry';
import { pickRandom, rectsOverlap, boundsOf, screenRect } from '../core/utils';
import { findFlyingCigarette, igniteOilWithFlame } from '../bosses/oscar';
import { getStageLayout } from '../stages';
import { playSound } from '../platform/audio';
import { icicleBounds, meltIcicle } from '../bosses/artie';
import { pushEnemy } from './knockback';
import { isMidBoss, midBossDamage, MIDBOSS_DAMAGE, MIDBOSS_SPLASH_DAMAGE, MIDBOSS_NUKE_DAMAGE } from './midBoss';
import { muzzlePoint, flamethrowerNozzle } from './muzzle';
import { detonateSewerNuke, TOXIC_TOMMY } from '../scenes/sewerNuke';
import { killPlayer } from '../player/player';
import { getFinale } from '../stages/finale/state';
import { FINALE_LINES } from '../../content/dialogue';
import { shakeScreen } from '../core/state';
import {
  inFinale, FINALE_SHOTGUN_PELLETS, FINALE_FLAME_RANGE, FINALE_FLAME_SEGMENTS, FINALE_FLAME_WIDTH, FINALE_FLAME_GROWTH, FINALE_FLAME_SIZE_CAP_DIST,
  FINALE_OIL_SPLASH_RADIUS, FINALE_OIL_SPLASH_DAMAGE, FINALE_OIL_COAT_RADIUS, PITCH_FRAMES, PITCH_RELEASE_AT, PITCH_SPEED, PITCH_SIZE, PITCH_LIFE, FINALE_BARF_FRAMES,
} from './finaleBuffs';

/** The bits of this frame's input that weapons care about. */
export interface WeaponInput {
  shoot: boolean;
  shootPressed: boolean;
  moveUp: boolean;
  moveDown: boolean;
}

const gml = (v: number) => v * GML_SCALE;

/** Is (x, y) inside something solid? (A jump-through ledge only counts for something heading down onto it: `down`.) */
const pointInSolid = (state: GameState, x: number, y: number, down = true) =>
  state.blocks.some(b => b.type !== 'pit' && b.type !== 'door' && !(b.oneWay && !down) && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);

/** What the LMG's cone leans toward: the middle of the nearest enemy out in front (the way he's shooting), on screen. */
const lmgTarget = (state: GameState, from: { x: number; y: number }, facing: number) => {
  let best: { x: number; y: number } | null = null, bestD = Infinity;
  for (const e of state.enemies) {
    if (e.health <= 0 || e.isBlownAway || e.harmless || e.innocent) continue;
    const x = e.pos.x + e.width / 2, y = e.pos.y + e.height / 2;
    const dx = (x - from.x) * facing;
    if (dx < 20 || dx > CANVAS_WIDTH) continue;
    if (x < state.camera.x || x > state.camera.x + CANVAS_WIDTH) continue;
    const d = Math.hypot(dx, y - from.y);
    if (d < bestD) { bestD = d; best = { x, y }; }
  }
  return best;
};

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
      // A hose of lead: a round every few frames, each one anywhere in a wide cone (carried along with him: he's on a bike).
      // The cone swings toward the height of whatever's nearest out the way he's shooting (up on a ledge, down in a ditch,
      // on the road): still all over the place, but the bulk of it goes where they are
      const spread = LMG_SPREAD_DEG * Math.PI / 180;
      const t = lmgTarget(state, muzzle, facing);
      const center = t ? Math.max(-spread, Math.min(spread, Math.atan2(t.y - muzzle.y, Math.abs(t.x - muzzle.x)))) : 0;
      const a = center + (Math.random() * 2 - 1) * spread * (t ? 0.7 : 1);
      addProjectile({
        id: `lmg-${Date.now()}-${Math.random()}`,
        pos: fromMuzzle(16, 6),
        vel: { x: facing * Math.cos(a) * LMG_VELOCITY + player.vel.x, y: Math.sin(a) * LMG_VELOCITY },
        width: 16, height: 6, health: 1, maxHealth: 1,
        type: 'projectile', damage: LMG_DAMAGE, owner: 'player', fromX: pos.x + width / 2, pierce: 3, hitIds: [], isLmg: true,
      });
      player.shootCooldown = LMG_COOLDOWN;
      // (the muzzle flash, big, and brass going everywhere)
      for (let k = 0; k < 3; k++) state.particles.push({ pos: { x: muzzle.x + facing * 4, y: muzzle.y }, vel: { x: facing * (2 + Math.random() * 4) + player.vel.x, y: (Math.random() - 0.5) * 3 }, life: 5, color: k === 0 ? '#FFFFFF' : '#FDE047', size: 6 + Math.random() * 6 });
      state.particles.push({ pos: { x: muzzle.x - facing * 20, y: muzzle.y }, vel: { x: -facing * (1 + Math.random() * 2) + player.vel.x, y: -2 - Math.random() * 3 }, life: 24, color: '#CA8A04', size: 2 });
      fx.playGunSound('lmg');
      break;
    }

    case 'BOULDER': {
      // GML oBoulderBlunderbuss: one boulder per press; up+fire lobs it
      if (!input.shootPressed) break;
      // (the finale: pitched like a fastball, straight at the alien: the windup now, the rock leaves his hand in
      // updatePitch)
      if (inFinale(ctx.stageId)) { startPitch(ctx); useAmmo(); break; }
      player.throwPitch = false;
      const size = 48;
      let lob = input.moveUp;
      // Down+fire in the air: spiked down in front of him, steep and hard
      const spike = !lob && input.moveDown && !player.isGrounded;
      // Heaved straight up from over his head, or rolled out from the rock in his hand
      // (the rolled one sits just in front of the rock in his fist, so it leaves from his hand; the spiked one
      // leaves from down by his feet, clear of him)
      const cx = lob ? pos.x + width / 2 + facing * gml(3) : spike ? pos.x + width / 2 + facing * (width / 2 + size / 2 + 10) : muzzle.x + facing * 12;
      const cy = lob ? pos.y - size / 2 - 2 : spike ? pos.y + player.height - size / 2 : muzzle.y;
      let spawn = { x: cx - size / 2, y: cy - size / 2, w: size, h: size };
      // Don't fire into a wall (a lob goes up through a jump-through ledge overhead, as he would)
      const blocked = (r: typeof spawn, up: boolean) => state.blocks.some(b => b.type !== 'pit' && !(up && b.oneWay) && rectsOverlap(r, b));
      if (blocked(spawn, lob)) {
        // A low ceiling (no room over his head, or at his hand): it comes out along the floor instead, rolling
        const low = { x: muzzle.x + facing * 12 - size / 2, y: pos.y + player.height - size - 1, w: size, h: size };
        if (spike || blocked(low, false)) break;
        spawn = low; lob = false;
      }
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
      {
      // (the finale: a fan of shards two and a half times as thick, over the same spread)
      const pellets = inFinale(ctx.stageId) ? FINALE_SHOTGUN_PELLETS : SHOTGUN_PELLET_COUNT;
      for (let i = 0; i < pellets; i++) {
        const offset = i * (SHOTGUN_SPREAD_DEG / (pellets - 1)) - SHOTGUN_SPREAD_DEG / 2;
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
      // Starts the barf stream (see updateBarfStream) and grants the filth shield (the finale: a lot more of it)
      player.barfTimer = inFinale(ctx.stageId) ? FINALE_BARF_FRAMES : 24;
      player.shootCooldown = SLUDGE_COOLDOWN;
      player.filthShieldTimer = FILTH_SHIELD_DURATION;
      player.filthShieldHp = player.health;
      useAmmo();
      fx.playGunSound('barf');
      break;

    case 'TSUNAMI':
      if (state.tsunamiActive) break;
      state.tsunamiActive = true;
      state.tsunamiSerial = (state.tsunamiSerial ?? 0) + 1;
      state.tsunamiDir = facing;
      { const scr = screenRect(state); state.tsunamiStartX = facing === 1 ? scr.x : scr.x + scr.w; }
      state.tsunamiX = state.tsunamiStartX;
      // The wave's built for a flat floor at GROUND_Y: lift (or drop) it to where his feet are as he fires it (up in the
      // air, on a ledge, over a pit: it goes along at the height he was, not the floor under him)
      // (the finale's: along the floor, the full height of the room, wherever he fired it from)
      state.tsunamiOffsetY = inFinale(ctx.stageId) ? 0 : player.pos.y + player.height - GROUND_Y;
      player.shootCooldown = TSUNAMI_COOLDOWN;
      fx.playGunSound('tsunami');
      useAmmo();
      break;

    case 'TASER':
      if (player.isTasing) break;
      // In the water: every volt of it goes straight through him
      if (player.swimming && state.deathTimer <= 0) { tasedHimself(ctx); break; }
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

/** The finale's alien, if he's there and alive (what a pitched rock goes for). */
const finaleAlien = (state: GameState) => state.enemies.find(e => e.type === 'boss' && e.health > 0 && !e.isBlownAway);

/** Where the rock leaves his hand, at the top of the arm's whip over (his hand up by his head, out in front). */
const pitchHand = (state: GameState) => {
  const p = state.player;
  // (a keg toss lets go up over his head, behind him)
  if (p.throwKeg) return { x: p.pos.x + p.width / 2 - p.facing * 8, y: p.pos.y - 14 };
  return { x: p.pos.x + p.width / 2 + p.facing * 16, y: p.pos.y + 6 };
};

/** The finale's boulder: into the windup (turned square to the alien, the way a pitcher faces the plate). The first
 * one, he says he's done with the suits: all of it's for the alien. */
const startPitch = (ctx: FrameContext) => {
  const { state } = ctx;
  const p = state.player;
  const alien = finaleAlien(state);
  // (his back to the alien: he doesn't turn round for it; he heaves it back over his head, a strongman's keg toss)
  const behind = !!alien && Math.sign(alien.pos.x + alien.width / 2 - (p.pos.x + p.width / 2)) === -p.facing;
  p.throwKeg = behind;
  if (alien && !behind && !p.isTasing && !p.isFlaming) p.facing = alien.pos.x + alien.width / 2 < p.pos.x + p.width / 2 ? -1 : 1;
  p.throwTimer = PITCH_FRAMES;
  p.throwPitch = true;
  p.throwLob = false;
  p.shootCooldown = BOULDER_COOLDOWN;
  ctx.fx.playGunSound('whoosh', 0.5, -6);
  const rt = getFinale(state);
  if (rt && !rt.said.firstPitch) {
    rt.said.firstPitch = true;
    if (rt.lines.length < 8) rt.lines.push({ who: 'meathead', text: FINALE_LINES.FIRST_PITCH.text, shat: FINALE_LINES.FIRST_PITCH.shat });
  }
};

/**
 * The pitch, every frame: at the top of the whip over (PITCH_RELEASE_AT frames left in it) the rock leaves his hand,
 * a fastball dead at the alien (see updatePitchedRock in combat/projectiles.ts: it homes in on him the whole way).
 */
export const updatePitch = (ctx: FrameContext) => {
  const { state, fx } = ctx;
  const p = state.player;
  if (!p.throwPitch || p.throwTimer !== PITCH_RELEASE_AT) return;
  const hand = pitchHand(state);
  const alien = finaleAlien(state);
  // (straight at the middle of him; with him gone, straight out in front)
  let dx = p.facing, dy = 0;
  if (alien) { dx = alien.pos.x + alien.width / 2 - hand.x; dy = alien.pos.y + alien.height / 2 - hand.y; }
  const d = Math.hypot(dx, dy) || 1;
  state.projectiles.push({
    id: `pitch-${state.frame}-${Math.random()}`,
    pos: { x: hand.x - PITCH_SIZE / 2, y: hand.y - PITCH_SIZE / 2 },
    vel: { x: dx / d * PITCH_SPEED, y: dy / d * PITCH_SPEED },
    width: PITCH_SIZE, height: PITCH_SIZE, health: 1, maxHealth: 1,
    type: 'projectile', damage: 0, owner: 'player', isBoulder: true, pitched: true, life: PITCH_LIFE, rotation: 0,
  });
  // (the release: a crack of air off his hand, dust kicked off his plant foot)
  for (let i = 0; i < 6; i++) state.particles.push({ pos: { ...hand }, vel: { x: dx / d * (3 + Math.random() * 4) + (Math.random() - 0.5) * 2, y: dy / d * 3 + (Math.random() - 0.5) * 3 }, life: 8 + Math.random() * 6, color: i % 2 ? '#FFFFFF' : '#E7E5E4', size: 2 + Math.random() * 2 });
  for (let i = 0; i < 5; i++) state.particles.push({ pos: { x: p.pos.x + p.width / 2 + p.facing * 12, y: p.pos.y + p.height - 3 }, vel: { x: p.facing * (0.5 + Math.random() * 2), y: -0.5 - Math.random() * 1.5 }, life: 18 + Math.random() * 10, color: 'rgba(168, 162, 158, 0.6)', size: 3 + Math.random() * 3 });
  fx.playGunSound('whoosh', 0.9, 2);
  shakeScreen(state, 4, 3);
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
  // (the finale: hosed out from right in front of him to clear across the room, so it lands all along the floor)
  const vx = inFinale(state.stageId) ? 5 + Math.random() * 30 : 11 + Math.random() * 8;
  state.projectiles.push({
    id: `sludge-part-${Date.now()}-${player.barfTimer}`,
    pos: { x: player.facing === 1 ? muzzle.x - 8 : muzzle.x - w + 8, y: muzzle.y - h / 2 },
    vel: { x: player.facing * vx, y: -3 - Math.random() * 9 },
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
/** The flamethrower under clean water: no flame, a stream of bubbles and steam out of the nozzle, and it says so. */
const fizzle = (ctx: FrameContext, justPressed: boolean) => {
  const { state, fx } = ctx;
  const { player } = state;
  player.isFlaming = false;
  player.flameRange = FLAMETHROWER_START_RANGE;
  const nozzle = flamethrowerNozzle(player);
  for (let k = 0; k < 2; k++) {
    state.particles.push({
      pos: { x: nozzle.x + (Math.random() - 0.5) * 4, y: nozzle.y + (Math.random() - 0.5) * 4 },
      vel: { x: player.facing * (1 + Math.random() * 2), y: -1 - Math.random() * 1.5 },
      life: 20 + Math.random() * 20, color: k ? 'rgba(224, 242, 254, 0.8)' : 'rgba(203, 213, 225, 0.6)', size: 2 + Math.random() * 4, isWater: true,
    });
  }
  if (justPressed) {
    fx.spawnDamageNumber({ x: nozzle.x - 20, y: player.pos.y - 30 }, 'FIZZLE!', false, '#7DD3FC');
    fx.playGunSound('click');
  }
  if (state.frame % 12 === 0) playSound('glug');
};

/** How often a jet spits off the finale's flamethrower, and how far it'll go for someone. */
const FLAME_JET_EVERY = 9, FLAME_JET_REACH = 640;
const spitFlameJet = (ctx: FrameContext, nozzle: { x: number; y: number }, dir: { x: number; y: number }) => {
  const { state } = ctx;
  const rt = getFinale(state);
  if (!rt) return;
  const jets = (rt.flameJets ??= []);
  if (jets.length >= 6) return;
  const taken = new Set(jets.map(j => j.id));
  const view = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  const target = state.enemies
    .filter(e => e.type !== 'boss' && e.health > 0 && !e.isBlownAway && !e.isOnFire && e.burntAt !== state.frame && !taken.has(e.id)
      && e.pos.x + e.width > view.x && e.pos.x < view.x + view.w && Math.hypot(e.pos.x + e.width / 2 - nozzle.x, e.pos.y + e.height / 2 - nozzle.y) < FLAME_JET_REACH)
    .sort((a, b) => Math.hypot(a.pos.x - nozzle.x, a.pos.y - nozzle.y) - Math.hypot(b.pos.x - nozzle.x, b.pos.y - nozzle.y))[0];
  if (!target) return;
  // (off the nozzle at an angle, up or down off the stream, then round onto him)
  const a = Math.atan2(dir.y, dir.x) + (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.4);
  jets.push({ id: target.id, x: nozzle.x, y: nozzle.y, vx: Math.cos(a) * 7, vy: Math.sin(a) * 7, t: 0 });
};

export const updateFlamethrower = (ctx: FrameContext, input: WeaponInput, alt = false) => {
  const { state, fx, cheats, currentWeapon } = ctx;
  const { player } = state;
  if (currentWeapon !== 'FLAMETHROWER') {
    player.isFlaming = false;
    player.flameAngle = 0;
    player.flameRange = FLAMETHROWER_START_RANGE;
    return;
  }

  const firing = input.shoot && !player.isDucking && !player.isTasing;

  // In clean water it won't light: it just fizzles, bubbles and steams (in Flint's muck it burns fine, somehow)
  if (firing && player.swimming) {
    const body = getStageLayout(ctx.stageId)?.waterBodyAt?.(state, player.pos.x + player.width / 2, player.pos.y + player.height / 2);
    if (body?.kind === 'clean') { fizzle(ctx, input.shootPressed); return; }
  }

  // Aim sweeps slowly (negative angle = up, in canvas terms), but only while it's firing:
  // up or down on their own (or ducking) leave the nozzle level
  const aimRad = FLAMETHROWER_AIM_DEG * Math.PI / 180;
  const target = !firing ? 0 : input.moveUp ? -aimRad : input.moveDown ? aimRad : 0;
  player.flameAngle = (player.flameAngle || 0) + (target - (player.flameAngle || 0)) * FLAMETHROWER_AIM_LERP;
  if (player.isDucking) player.flameAngle = 0; // crouched: the nozzle's level, full stop
  // (the launcher's igniter burns the flamethrower's fuel same as the flamethrower does; in the finale, with the tank
  // dry, it lights anyway and burns nothing: it's no flamethrower ammo, and the tank stays at 0 for the wreck)
  const finale = inFinale(ctx.stageId);
  const hasFuel = cheats.infiniteAmmo || player.weaponAmmo.FLAMETHROWER > 0 || (finale && alt);
  const range = player.flameRange ?? FLAMETHROWER_START_RANGE;

  if (firing) {
    player.flameDrainTimer = (player.flameDrainTimer || 0) + 1;
    if (player.flameDrainTimer >= FLAMETHROWER_AMMO_EVERY && hasFuel) {
      if (!cheats.infiniteAmmo && player.weaponAmmo.FLAMETHROWER > 0) player.weaponAmmo.FLAMETHROWER--;
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
        color: k === 0 ? '#FFF7D6' : k === 1 ? '#FFC23D' : '#FF8A1F',
        size: 5 + along * 0.35 + Math.random() * 2,
      });
    }
    // (the finale's flamethrower proper: wall to wall and fatter, laid in more segments so there's no gap between them)
    const big = finale && !alt;
    const segments = big ? FINALE_FLAME_SEGMENTS : FLAMETHROWER_SEGMENTS;
    const gap = range / segments;
    for (let i = 0; i < segments; i++) {
      const dist = FLAMETHROWER_NOZZLE_GAP * 0.3 + i * gap;
      const x = nozzle.x + dir.x * dist + player.vel.x;
      const y = nozzle.y + dir.y * dist + player.vel.y;
      // (the stream goes up through a jump-through ledge, or across it; only aimed down does one stop it)
      if (pointInSolid(state, x, y, dir.y > 0.2)) break;
      const size = finale
        ? FLAMETHROWER_SEGMENT_SIZE * (1 + (Math.min(dist, FINALE_FLAME_SIZE_CAP_DIST) / GML_SCALE) * 0.01) * FINALE_FLAME_WIDTH
        : FLAMETHROWER_SEGMENT_SIZE * (1 + (dist / GML_SCALE) * 0.01);
      state.flameSegments.push({
        x, y, size, gap, dirX: dir.x, dirY: dir.y,
        life: FLAMETHROWER_SEGMENT_LIFETIME, alpha: 1, density: 1 - i / segments, alt, big: finale || undefined,
      });
    }
    // (the finale's: little jets spitting off the nozzle as it goes, each curling off after an agent the stream isn't on)
    if (big && state.frame % FLAME_JET_EVERY === 0) spitFlameJet(ctx, nozzle, dir);
    const maxRange = alt ? FLAMETHROWER_MAX_RANGE * ALT_FLAME_RANGE_SCALE : big ? FINALE_FLAME_RANGE : FLAMETHROWER_MAX_RANGE;
    if (range < maxRange) player.flameRange = range + (maxRange - range) * (big ? FINALE_FLAME_GROWTH : FLAMETHROWER_GROWTH);
    else player.flameRange = range + (maxRange - range) * FLAMETHROWER_SHRINK;
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

    // Fire particles along the segment, thinning out toward the tip (the finale's fat stream: fewer of them a segment,
    // and bigger, there being more segments and far more of the stream)
    const count = seg.big ? Math.round(seg.alpha * 2.4 * seg.density + Math.random() * 0.55) : Math.ceil(seg.alpha * 5 * seg.density);
    const fleck = seg.big ? 1.3 : 1;
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
        color: pickRandom(PARTICLE_PALETTES.MOLTEN),
        size: (4 + Math.random() * 6 * seg.density + 2) * fleck,
      });
    }
    // (now and then a glob of it sags off the stream and drips: it lies where it lands, glowing, then crusts over)
    if (seg.life === FLAMETHROWER_SEGMENT_LIFETIME - 2 && Math.random() < 0.07 * (0.4 + seg.density)) {
      state.particles.push({
        pos: { x: seg.x - 3, y: seg.y - 2 },
        vel: { x: seg.dirX * gml(0.6) + (Math.random() - 0.5), y: 0.5 + Math.random() },
        life: 70 + Math.random() * 40,
        color: '#FFC23D', size: 5 + Math.random() * 4, molten: true,
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
      burnEnemy(ctx, e, seg.alt ? ALT_FLAME_DAMAGE_SCALE : 1);
      return false;
    }

    // Melt enemy projectiles (not rubble, magma, enemy boulders or small ice shards; and only the flamethrower proper:
    // the launcher's igniter is too weak to)
    const p = !seg.alt && state.projectiles.find(pr => pr.owner === 'enemy' && pr.health > 0 && rectsOverlap(box, boundsOf(pr)));
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
export const burnEnemy = (ctx: FrameContext, e: Enemy, scale = 1) => {
  const { state, fx } = ctx;
  const { player } = state;

  if (e.type === 'boss') {
    if (state.sewerNuke) return;
    // Setting fire to an oil-soaked Toxic Tommy: never a good idea
    if (ctx.stageId === TOXIC_TOMMY && e.isOiled && state.arenaLocked) { detonateSewerNuke(ctx, e); return; }
    if (!state.arenaLocked) return;
    const onFlamed = getBossDef(ctx.stageId)?.onFlamed;
    if (onFlamed) { onFlamed(ctx, e, scale); return; }
    if (e.hitCooldown && e.hitCooldown > 0) return;
    hitBoss(ctx, e, 'FLAMETHROWER', { facing: player.facing, damage: scale < 1 ? getBossDamage(ctx.stageId, 'FLAMETHROWER') * scale : undefined });
    return;
  }
  // A mid-boss doesn't catch fire: the flames just hurt, the same however much of it's in them (once a frame)
  if (isMidBoss(e)) {
    if (e.burntAt === state.frame) return;
    e.burntAt = state.frame;
    e.health -= midBossDamage(e, MIDBOSS_DAMAGE.FLAMETHROWER) * scale;
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

  e.health -= FLAMETHROWER_DAMAGE * scale;
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

/** How far the taser reaches (to lock on, and to jump from one to the next): the whole of what's on screen in the
 * finale (the press room, pulled back to take it all in), its usual reach anywhere else. */
export const taserReach = (state: GameState) => (state.stageId === FINALE_STAGE ? 2400 : TASER_RANGE);
/** The current jumps from one to the next this far apart (edge to edge) at most. */
export const taserChainReach = (state: GameState, usual: number) => (state.stageId === FINALE_STAGE ? 2400 : usual);

/** Nearest on-screen enemy or meth barrel in front of the player, within taser range. */
export const findTaserTarget = (state: GameState): Enemy | Projectile | null => {
  const { player, camera } = state;
  // (what's on screen: the camera's view, or all of what a pulled-back view takes in)
  const v = state.stageId === FINALE_STAGE && state.view ? state.view : { x: camera.x, w: CANVAS_WIDTH };
  const playerMidX = player.pos.x + player.width / 2;
  const playerMidY = player.pos.y + player.height / 2;
  // Oily Oscar's flicked cigarette takes priority over everything
  const cigarette = findFlyingCigarette(state);
  if (cigarette) return cigarette;
  let nearest: Enemy | Projectile | null = null;
  let minDist = taserReach(state);

  const consider = (t: Enemy | Projectile) => {
    const tx = t.pos.x + t.width / 2;
    const ty = t.pos.y + t.height / 2;
    if (tx <= v.x || tx >= v.x + v.w) return;
    const inFront = (player.facing === 1 && tx > playerMidX) || (player.facing === -1 && tx < playerMidX);
    if (!inFront) return;
    const dist = Math.hypot(tx - playerMidX, ty - playerMidY);
    if (dist < minDist) { minDist = dist; nearest = t; }
  };

  // (the finale: his own men first, any of them on screen, ahead of him or not; the alien only with none of them about,
  // since it's through them the current gets him)
  if (state.stageId === FINALE_STAGE) {
    let best: Enemy | null = null, bestD = Infinity;
    for (const e of state.enemies) {
      if (e.type === 'boss' || e.health <= 0 || e.isBlownAway) continue;
      const tx = e.pos.x + e.width / 2, ty = e.pos.y + e.height / 2;
      if (tx <= v.x || tx >= v.x + v.w) continue;
      const d = Math.hypot(tx - playerMidX, ty - playerMidY);
      if (d < bestD) { bestD = d; best = e; }
    }
    if (best) return best;
  }
  state.enemies.forEach(e => { if (e.health > 0 && !e.isBlownAway) consider(e); });
  state.projectiles.forEach(p => { if (p.isMethBarrel && p.health > 0) consider(p); });
  return nearest;
};

/** Oil rocket impact: splash damage, coats targets in oil and knocks them back. */
export const explodeOilRocket = (ctx: FrameContext, pos: Vector2, rocketVelX?: number) => {
  const { state, fx } = ctx;
  fx.spawnOilSplatter(pos);
  // (the finale: a far bigger splash, drawn (render/blasts.ts), and the oil off it comes down over the floor under it)
  const big = inFinale(ctx.stageId);
  const radius = big ? FINALE_OIL_SPLASH_RADIUS : OIL_ROCKET_SPLASH_RADIUS;
  if (big) bigOilSplash(ctx, pos, radius);

  const oilable = (e: Enemy) => e.type !== 'boss' || ctx.stageId === TOXIC_TOMMY || !!getBossDef(ctx.stageId)?.oilable;
  state.enemies.forEach(e => {
    if (e.health <= 0 || e.isBlownAway) return;
    const dx = (e.pos.x + e.width / 2) - pos.x;
    const dy = (e.pos.y + e.height / 2) - pos.y;
    // (the finale: measured to the nearest of him, not his middle: the alien's a big target)
    const d2 = big
      ? Math.max(0, Math.abs(dx) - e.width / 2) ** 2 + Math.max(0, Math.abs(dy) - e.height / 2) ** 2
      : dx * dx + dy * dy;
    if (d2 >= radius * radius) {
      // The finale: out past the blast, the oil off it still coats whoever it reaches (a miss still greases them up)
      if (big && d2 < FINALE_OIL_COAT_RADIUS * FINALE_OIL_COAT_RADIUS && oilable(e) && !isMidBoss(e) && e.kind !== 'moose') {
        if (!e.isOiled) fx.spawnDamageNumber({ x: e.pos.x, y: e.pos.y - 10 }, 'OILED!', false, '#A8A29E');
        e.isOiled = true;
        e.oiledTimer = Math.max(e.oiledTimer ?? 0, OIL_ROCKET_OILED_DURATION);
      }
      return;
    }

    if (e.type === 'boss') {
      if (e.hitCooldown && e.hitCooldown > 0) return;
      // Bosses don't get oiled up, except Toxic Tommy (it clogs him up, and there's the matter of setting him alight)
      // and any other who can be (the finale's alien: slick, dripping, and one spark from going up)
      if (ctx.stageId === TOXIC_TOMMY || getBossDef(ctx.stageId)?.oilable) {
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
    const splash = big ? FINALE_OIL_SPLASH_DAMAGE : OIL_ROCKET_SPLASH_DAMAGE;
    e.health -= splash;
    e.isOiled = e.kind !== 'moose';
    e.oiledTimer = OIL_ROCKET_OILED_DURATION;
    fx.spawnDamageNumber(e.pos, splash);

    const pushDir = (rocketVelX !== undefined && Math.abs(rocketVelX) > 0.1) ? Math.sign(rocketVelX) : (dx >= 0 ? 1 : -1);
    const isAirEnemy = e.enemyType === 'flyer' || e.enemyType === 'drone' || e.behavior === 'fly' || e.behavior === 'hover';

    if (e.health <= 0) {
      // (a real body flying, slick and black: it splats into a wall, a ceiling or the floor like any other, and where
      // it comes down on the floor it lies in its own slick)
      fx.blowAwayEnemy(e, { x: pushDir * 12, y: -10 }, 'oil_kill', pushDir);
      fx.spawnKillCallout(e, 'greased');
      state.player.killSatisfactionTimer = 60;
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

/** The finale's oil rocket going off: a big black splash (drawn: render/blasts.ts), gobs of it flung out the whole way
 * round, and where it's in reach of the floor, a slick laid along it under the blast (it burns, like any oil). */
const bigOilSplash = (ctx: FrameContext, pos: Vector2, radius: number) => {
  const { state } = ctx;
  (state.blasts ??= []).push({ x: pos.x, y: pos.y, r: radius, t: 0, kind: 'oil' });
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + Math.random() * 0.2, sp = radius / 22 * (0.6 + Math.random() * 0.5);
    state.particles.push({ pos: { ...pos }, vel: { x: Math.cos(a) * sp, y: Math.sin(a) * sp - 2 }, life: 26 + Math.random() * 16, color: i % 3 === 0 ? '#44403C' : i % 3 === 1 ? '#1C1917' : '#0C0A09', size: 5 + Math.random() * 6, grav: 0.35 });
  }
  // (no slick left on the floor after it: nothing for Meathead to bog down in)
};

/** How far a blast set off by a fire hazard reaches (contained: round him, not the whole screen). */
export const HAZARD_NUKE_RADIUS = 190;

/**
 * An oiled one into a fire hazard (lava, a gas jet, burning oil, a lit gusher): he goes up, a contained blast round
 * him, and takes whatever's close with him (never Meathead). True if he did. An oiled Toxic Tommy does what an oiled
 * Toxic Tommy always does near fire (and that one does get Meathead).
 */
export const oiledIntoFire = (ctx: FrameContext, e: Enemy): boolean => {
  if (!e.isOiled || e.health <= 0 || e.isBlownAway || e.kind === 'moose') return false;
  if (e.type === 'boss') {
    if (ctx.stageId === TOXIC_TOMMY && ctx.state.arenaLocked && !ctx.state.sewerNuke) { detonateSewerNuke(ctx, e); return true; }
    return false;
  }
  e.isOiled = false; e.oiledTimer = 0;
  detonateNuke(ctx, { x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2 }, HAZARD_NUKE_RADIUS);
  return true;
};

/**
 * Setting an oiled enemy on fire: a huge blast that wipes out everything nearby (`radius`: smaller, for one set off
 * by a fire hazard, contained to round him). It never hurts Meathead.
 */
export const detonateNuke = (ctx: FrameContext, pos: Vector2, radius = OIL_ROCKET_NUKE_RADIUS) => {
  const { state, fx } = ctx;
  const big = radius / OIL_ROCKET_NUKE_RADIUS;
  // The fireball, the shockwave and the mushroom cloud (drawn: see render/blasts.ts)
  (state.blasts ??= []).push({ x: pos.x, y: pos.y, r: radius, t: 0 });
  // Embers flung out of it, white-hot cooling to red, and the odd lump of something
  for (let i = 0; i < Math.round(36 * big); i++) {
    const a = Math.random() * Math.PI * 2, sp = (4 + Math.random() * 12) * Math.sqrt(big);
    state.particles.push({
      pos: { ...pos },
      vel: { x: Math.cos(a) * sp, y: Math.sin(a) * sp * 0.7 - 3 },
      life: 30 + Math.random() * 40,
      color: ['#FFFFFF', '#FEF08A', '#FACC15', '#F97316', '#DC2626'][i % 5],
      size: 3 + Math.random() * 4,
    });
  }

  // (in the finale's press room a full-size one clears the whole room: that's what it's for there)
  const reach = state.stageId === FINALE_STAGE && radius === OIL_ROCKET_NUKE_RADIUS ? 2400 : radius;
  state.enemies.forEach(e => {
    if (e.health <= 0 || e.isBlownAway) return;
    const dx = (e.pos.x + e.width / 2) - pos.x;
    const dy = (e.pos.y + e.height / 2) - pos.y;
    if (dx * dx + dy * dy >= reach * reach) return;
    // (a mid-boss caught in the blast takes a big hit, not the end of it)
    if (isMidBoss(e)) {
      const dmg = midBossDamage(e, MIDBOSS_NUKE_DAMAGE);
      e.health -= dmg;
      e.hitFlash = 8;
      fx.spawnDamageNumber(e.pos, Math.round(dmg), true, '#FF0000');
      return;
    }
    // (a boss: a big hit, not the end of him; once a blast, there being no breather to stop it landing again)
    const def = e.type === 'boss' ? getBossDef(ctx.stageId) : undefined;
    const own = typeof def?.nukeDamage === 'function' ? def.nukeDamage(ctx, e) : def?.nukeDamage;
    const dmg = e.type !== 'boss' ? OIL_ROCKET_NUKE_DAMAGE : own ?? (isWeakTo(ctx.stageId, 'OIL_ROCKET') ? OIL_ROCKET_NUKE_BOSS_WEAKNESS_DAMAGE : OIL_ROCKET_NUKE_BOSS_DAMAGE);
    // (a boss it can't touch just now)
    if (dmg <= 0) return;
    e.health -= dmg;
    fx.spawnDamageNumber(e.pos, dmg, true, '#FF0000');
    if (e.health > 0) { def?.onNuke?.(ctx, e); return; }
    // (only his weakness makes a boss erupt: anyone else the blast finishes goes over like any other kill)
    if (e.type === 'boss') killBoss(ctx, e, 0, isWeakTo(ctx.stageId, 'OIL_ROCKET'), 'OIL_ROCKET');
    else {
      fx.blowAwayEnemy(e, { x: (Math.random() - 0.5) * 40, y: -25 }, 'oil_kill', 0, 3);
      fx.spawnKillCallout(e, 'nuke');
    }
  });

  // Flames licking out along the shockwave, low along the ground
  for (let i = 0; i < Math.round(28 * big); i++) {
    const a = (i / Math.round(28 * big)) * Math.PI * 2;
    const speed = radius / 24;
    state.particles.push({
      pos: { x: pos.x, y: pos.y + radius * 0.1 },
      vel: { x: Math.cos(a) * speed, y: Math.sin(a) * speed * 0.3 },
      life: 20,
      color: i % 2 ? '#F97316' : '#FACC15',
      size: 5 + Math.random() * 4,
    });
  }
  fx.playGunSound('nuke');
  state.screenShakeTimer = Math.round(30 * Math.max(0.5, big));
  state.screenShakeMagnitude = Math.round(12 * Math.max(0.5, big));
};

/**
 * The taser, fired in the water: the whole of it goes into him (water conducts, and he's the biggest thing in it). A
 * white flash, a crackle all over him, black as a match head, and it holds on the moment before the death screen.
 */
const TASED_IN_WATER = ['WATER CONDUCTS, GENIUS', 'TASED YOURSELF IN THE POOL', 'SHOCKING LACK OF JUDGMENT', 'ELECTRIC BATH'];
export const tasedHimself = (ctx: FrameContext) => {
  const { state, fx } = ctx;
  const p = state.player;
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  p.health = 0;
  p.isTasing = false;
  p.sootTimer = 600;
  p.shownDead = true; // (he stays on the screen through it: charred, in the water)
  // (the water all round him lights up with it)
  for (let i = 0; i < 50; i++) {
    const a = Math.random() * Math.PI * 2, r = 30 + Math.random() * 140;
    state.particles.push({ pos: { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.6 }, vel: { x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 3 }, life: 10 + Math.random() * 14, color: i % 2 ? '#00E5FF' : '#E0FFFF', size: 2 + Math.random() * 3 });
  }
  for (let i = 0; i < 60; i++) {
    const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 9;
    state.particles.push({ pos: { x: cx, y: cy }, vel: { x: Math.cos(a) * sp, y: Math.sin(a) * sp }, life: 20 + Math.random() * 25, color: i % 3 === 0 ? '#FFFFFF' : i % 3 === 1 ? '#00E5FF' : '#FDE047', size: 2 + Math.random() * 4 });
  }
  fx.spawnExplosion({ x: cx, y: cy }, '#E0FFFF', 20, 0, 18);
  fx.playGunSound('taser');
  fx.playGunSound('boom');
  state.screenShakeTimer = 30; state.screenShakeMagnitude = 12;
  state.lastHurt = { source: 'self_tased', at: state.frame };
  killPlayer(ctx, TASED_IN_WATER[Math.floor(Math.random() * TASED_IN_WATER.length)], false);
  // (held on the still of it: see updateDeathScreen)
  state.deathFreeze = 0;
};
