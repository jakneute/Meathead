// The true final boss: the alien who was wearing the President. He floats about the press room on his anti-grav,
// working from one side of it (a couple of shots) then the other, and fires his ray gun at Meathead: a tell (the gun
// coming up, the beam charging along where it's aimed, locking on) and then the beam, across the room to the wall. He
// speeds up as he loses health. It's a fight of attrition: he's got a mountain of health and no breather between
// hits (every round, pellet, needle and punch counts), and Meathead's own moves barely dent him.
//
// What each weapon does to him:
//   shotgun ice: slows him right down (his float, his tell);       flamethrower: weakens his shot (and cooks him);
//   tsunami: carries him off with it, into the wall (no stun);    boulder: knocks him silly for a moment;
//   needles: stick in him and work their way out (he never ODs); taser: just tingles him, unless it's come to him
//     off his own men (the current jumping off them onto him): that stuns him (with none of them left, it can't);
//   sludge: drags him down onto the floor in it, stuck there a good while (and he takes more there), his aim thrown;
// Only the boulder and that taser chain stun him (and never for good): everything else, he keeps his shot going through.
//   oil rocket: a big hit, and it coats him (oiled, he goes up at a touch of fire);
//   his own men, flung, shoved or overdosed into him: a good hit each (a contact high).
// Once every one of Meathead's guns is empty, his men pull out, and it's just the two of them, he gives up: he lobs
// sad little bolts, begs, and the pistol does him in a few shots (see stages/finale).

import { Enemy, Projectile, WeaponType } from '../../types';
import { TSUNAMI_WAVE_SPEED, TASER_TICK_RATE } from '../../constants';
import { ALIEN_LINES, FINALE_LINES } from '../../content/dialogue';
import type { FrameContext } from '../core/context';
import { BossDef, hurtPlayer, speakAsBoss, enemyProjectile } from './shared';
import { playSound } from '../platform/audio';
import { pickRandom } from '../core/utils';
import { stickNeedle, BOSS_NEEDLE } from '../combat/needles';
import { startEnemyDeath } from '../enemies/deaths';
import { getFinale, alienPace, ammoDrain, FinaleRuntime } from '../stages/finale/state';
import { ROOM_L, ROOM_R, ROOM_TOP, ROOM_MID, FLOOR } from '../stages/finale/geometry';
import { oiledIntoFire, detonateNuke, burnEnemy } from '../combat/weapons';
import { spillOil } from './oscar';
import { alienMuzzle as figureMuzzle, ALIEN } from '../scenes/alienLook';
import { hitBoss } from './registry';
import { startKillCam, killCamPlaying } from '../stages/finale/killCam';

export const ALIEN_ID = 'Imposter Invasion';
/** His size: big and bulky (his figure, scenes/alienLook.ts, drawn at ART_SCALE: every pixel of it two on the screen). */
export const ART_SCALE = 1.5;
export const ALIEN_W = 110, ALIEN_H = 165;
/** A mountain of it: about what every gun Meathead's got, emptied into him in a decent fight, comes to (the finale's
 * smaller loads: FINALE_AMMO_SCALE). */
export const ALIEN_HP = 10500;

/**
 * Where he floats: the bottom of him always between these. Meathead's head is at 486 standing: he walks and runs
 * under him without touching him (a hand's width over his head at the lowest), and everything reaches him there: a
 * jump (a pistol round, a dart), the shotgun's spread standing, the flamethrower turned up, the barfer's lob (its
 * globs top out about 445: this is as high as he can go and still have them land), a heaved boulder, a fresh wave,
 * an oil rocket steered up, the taser. Only the sludge brings him lower (onto the floor); crossing the room he goes
 * up over the top.
 */
export const FLOAT_BOTTOM_HI = 452, FLOAT_BOTTOM_LO = 476;

/** What a hit from each weapon does to him (no breather between them: the per-hit numbers are the balance). The
 * finale's souped-up guns (combat/finaleBuffs.ts) hit him a lot more often in places: the shotgun's 24 shards a shot
 * (from 10) at 2.3 each, and the barfer's longer stream (and the slick it leaves) at 5 a glob (from 8), keep what a
 * whole clip of each does to him about what it was (a touch more). */
const DAMAGE: Partial<Record<WeaponType, number>> = {
  GUN: 6, LMG: 6, SHOTGUN: 2.3, BOULDER: 70, TSUNAMI: 220, NEEDLES: 12, TASER: 4, SLUDGE: 5, OIL_ROCKET: 160, FLAMETHROWER: 12,
};
/** Stuck down in the sludge he takes this much more from everything. */
const GROUNDED_MULT = 1.5;
/** The flamethrower's per-frame burn (counted out every so often, as one hit). */
const FLAME_PER_FRAME = 1.6, FLAME_TICK = 12;
/** The oil rocket launcher's igniter on him (it costs nothing in here once the tank's dry, so it's only a lick of it);
 * once he's begging, nothing (the pistol finishes him). */
const IGNITER_SCALE = 0.15;
/** On fire (oiled and lit): a burn on top of the usual, each tick, for this long. */
const BURN_TICK_DAMAGE = 10, BURN_FRAMES = 240;
/** Slammed into the wall by a wave. */
const WALL_SLAM_DAMAGE = 120;
/** A body thrown into him: what it does by how hard it hits (an overdosed one: the contact high). */
const BODY_MIN = 25, BODY_MAX = 160, BODY_SCALE = 1.6, CONTACT_HIGH_DAMAGE = 160;
/** The taser through his men: the stun, and the tick. */
const CHAIN_DAMAGE = 6;

/** The beam: its raw damage (his hide in the finale scales everything that hurts Meathead down), width, and timings. */
/** (WEAK_BEAM: what's left of it through a flamethrower) */
const WEAK_BEAM = 0.55;
const BEAM_DAMAGE = 45, BEAM_HALF = 10, BEAM_FRAMES = 33, TELL_FRAMES = 72, TELL_RAMP = 36, LOCK_FRAMES = 14;
/** The beaten alien's bolts: slow, and they barely hurt. */
const BOLT_SPEED = 2.4, BOLT_DAMAGE = 12, BOLT_EVERY = 100;

const say = (ctx: FrameContext, text: string) => speakAsBoss(ALIEN_ID, text, ctx.bossHelpers, 'casual');
/** A line about something done to him: once, the first time (and only if it got said). */
const sayOnce = (ctx: FrameContext, rt: FinaleRuntime, key: string, text: string) => {
  if (rt.said[key] || ctx.state.bossVulgarityTimer > 0) return;
  if (say(ctx, text)) rt.said[key] = true;
};

const facing = (boss: Enemy): 1 | -1 => (boss.facing === -1 ? -1 : 1);
const cx = (boss: Enemy) => boss.pos.x + boss.width / 2;
const bottom = (boss: Enemy) => boss.pos.y + boss.height;

/** How far below level the gun's pointed (radians, either way he's facing), as his figure draws it. */
export const aimAngle = (aim: { dx: number; dy: number }) => Math.max(-1.1, Math.min(1.25, Math.atan2(aim.dy, Math.abs(aim.dx) || 1e-3)));

/** Where the ray gun's muzzle is, the gun up and pointed along `aim` (his figure's own arm: see scenes/alienLook.ts). */
export const alienMuzzle = (boss: Enemy, aim: { dx: number; dy: number }) => {
  const m = figureMuzzle(0, 0, facing(boss), aimAngle(aim));
  return { x: cx(boss) + m.x * ART_SCALE, y: bottom(boss) + m.y * ART_SCALE };
};

/** A spot to float to on a side of the room (somewhere in his band, not right against the wall). */
const anchorOn = (side: -1 | 1) => {
  const x = side < 0 ? ROOM_L + 50 + Math.random() * 110 : ROOM_R - 50 - ALIEN_W - Math.random() * 110;
  const b = FLOAT_BOTTOM_HI + Math.random() * (FLOAT_BOTTOM_LO - FLOAT_BOTTOM_HI);
  return { x, y: b - ALIEN_H };
};

/** He stops whatever shot he had going (knocked out of it). */
const dropShot = (rt: FinaleRuntime) => { if (rt.mode === 'charge' || rt.mode === 'fire') { rt.mode = 'float'; rt.modeT = 0; rt.path = []; } rt.beam = null; };

/** How fast he floats (quicker as he loses health; iced, a crawl). */
const floatSpeed = (boss: Enemy, rt: FinaleRuntime, drain = 0) => (1.6 + alienPace(boss) * 3.4) * (1 + drain * 0.25) * (rt.slowT > 0 ? 0.35 : 1);

/** Toward a point at up to `speed`, easing in at the end. True once he's there. */
const floatTo = (boss: Enemy, x: number, y: number, speed: number) => {
  const dx = x - boss.pos.x, dy = y - boss.pos.y, d = Math.hypot(dx, dy);
  if (d < 3) { boss.pos.x = x; boss.pos.y = y; boss.vel.x = 0; boss.vel.y = 0; return true; }
  const v = Math.min(speed, d * 0.12 + 0.6);
  boss.vel.x = dx / d * v; boss.vel.y = dy / d * v;
  boss.pos.x += boss.vel.x; boss.pos.y += boss.vel.y;
  return false;
};

// ---------------------------------------------------------------------------
// Each frame
// ---------------------------------------------------------------------------

const update = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  const rt = getFinale(state);
  if (!rt) return;
  const p = state.player;
  rt.modeT++;
  for (const k of ['slowT', 'stunT', 'pushT', 'flash', 'sludgeFreeT'] as const) if (rt[k] > 0) rt[k]--;
  rt.reel *= 0.9;
  flyChunks(ctx, rt);
  flyJets(ctx, rt);
  // (no breather, ever: the usual flicker after a hit's never wanted)
  boss.hitCooldown = 0;
  // Needles work their way out of him (a couple of seconds each), and drop out
  while (rt.needleAt.length && state.frame - rt.needleAt[0] > 110) {
    rt.needleAt.shift(); boss.needleOffsets?.shift();
    const o = { x: boss.pos.x + Math.random() * boss.width, y: boss.pos.y + 30 + Math.random() * 80 };
    state.particles.push({ pos: o, vel: { x: (Math.random() - 0.5) * 2, y: -1 }, life: 60, color: '#E5E7EB', size: 3, grav: 0.4 });
  }
  boss.needleCount = rt.needleAt.length;
  // Oiled: drips of it pooling on the floor under him; on fire: burning, till it's burnt off
  if (boss.isOiled && state.frame % 18 === 0) spillOil(state, cx(boss) - 14, cx(boss) + 14);
  if (boss.isOnFire) {
    rt.burnT--;
    if (state.frame % FLAME_TICK === 0) { boss.health -= BURN_TICK_DAMAGE; ctx.fx.spawnDamageNumber(boss.pos, BURN_TICK_DAMAGE, false, '#F97316'); if (boss.health <= 0) { ctx.bossHelpers.killBoss(boss, 0, true, 'FLAMETHROWER'); return; } }
    if (rt.burnT <= 0) { boss.isOnFire = false; boss.isOiled = false; boss.oiledTimer = 0; }
  }
  // (in the sludge, or begging: nothing to bump into)
  boss.harmless = rt.groundT > 0 || rt.mode === 'plead';
  if (rt.mode !== 'plead' && rt.mode !== 'fire' && rt.mode !== 'charge') boss.facing = p.pos.x + p.width / 2 < cx(boss) ? -1 : 1;

  if (rt.groundT > 0) {
    sludged(ctx, boss, rt);
    // (stuck to the floor, not out of it: he still takes his shots from down there)
    if (rt.groundT > 0 && rt.mode !== 'plead') {
      if (rt.mode === 'charge') chargeUp(ctx, boss, rt);
      else if (rt.mode === 'fire') fireBeam(ctx, boss, rt);
      else if (rt.modeT > GROUNDED_SHOT_WAIT) startCharge(ctx, boss, rt);
    }
    return;
  }
  if (rt.pushT > 0) { washed(ctx, boss, rt); return; }
  if (rt.stunT > 0) { reeling(boss, rt); return; }
  // (back up out of a sag)
  if (bottom(boss) > FLOAT_BOTTOM_LO + 1 && rt.mode !== 'plead') { boss.pos.y -= 1.5; if (bottom(boss) < FLOAT_BOTTOM_LO) boss.pos.y = FLOAT_BOTTOM_LO - boss.height; }

  switch (rt.mode) {
    case 'float': floatAbout(ctx, boss, rt); break;
    case 'charge': chargeUp(ctx, boss, rt); break;
    case 'fire': fireBeam(ctx, boss, rt); break;
    case 'sputter':
      // Coughing, flapping the smoke off his gun
      if (state.frame % 5 === 0) state.particles.push({ pos: alienMuzzle(boss, { dx: facing(boss), dy: 0 }), vel: { x: (Math.random() - 0.5) * 1.5, y: -1 - Math.random() }, life: 30, color: 'rgba(87, 83, 78, 0.6)', size: 5 + Math.random() * 5 });
      if (rt.modeT > 55) { rt.mode = 'float'; rt.modeT = 0; rt.path = []; }
      break;
    case 'plead': plead(ctx, boss, rt); break;
  }
  bob(boss, rt);
};

/** A gentle float up and down on the anti-grav (never out of his band). */
const bob = (boss: Enemy, rt: FinaleRuntime) => {
  const b = Math.sin(rt.t * 0.05) * (rt.mode === 'plead' ? 0.25 : 0.4);
  // (never below his band: Meathead always has his head room; above it only crossing the room, over the top)
  boss.pos.y = Math.max(ROOM_TOP + 4, Math.min(FLOAT_BOTTOM_LO - boss.height, boss.pos.y + b));
  boss.pos.x = Math.max(ROOM_L + 8, Math.min(ROOM_R - boss.width - 8, boss.pos.x));
};

const floatAbout = (ctx: FrameContext, boss: Enemy, rt: FinaleRuntime) => {
  const pace = alienPace(boss);
  if (rt.path.length === 0) {
    // A couple of shots from this side (three once he's hurting), then over to the other, high across the room
    if (rt.shots >= (pace > 0.5 ? 3 : 2)) {
      rt.side = rt.side < 0 ? 1 : -1; rt.shots = 0;
      rt.path = [{ x: ROOM_MID - ALIEN_W / 2 + (Math.random() - 0.5) * 120, y: ROOM_TOP + 70 }, anchorOn(rt.side)];
    } else rt.path = [anchorOn(rt.side)];
    rt.modeT = 0;
  }
  const at = rt.path[0];
  if (floatTo(boss, at.x, at.y, floatSpeed(boss, rt, ammoDrain(ctx.state)) * (rt.path.length > 1 ? 1.4 : 1))) {
    rt.path.shift();
    if (rt.path.length === 0) {
      // Settled: up comes the gun
      startCharge(ctx, boss, rt);
      // (a beat at the spot before the next spot, the faster he goes the shorter)
      rt.path = [];
    }
  }
};

/** Up comes the gun, aimed at him (more or less: the way he's facing, swung toward him). */
const startCharge = (ctx: FrameContext, boss: Enemy, rt: FinaleRuntime) => {
  rt.mode = 'charge'; rt.modeT = 0; rt.soaked = false;
  rt.tellLen = tellFrames(boss, rt, ammoDrain(ctx.state));
  const m = alienMuzzle(boss, { dx: facing(boss), dy: 0 });
  const p = ctx.state.player;
  const dx = p.pos.x + p.width / 2 - m.x, dy = p.pos.y + p.height / 2 - m.y, d = Math.hypot(dx, dy) || 1;
  rt.aim = { dx: dx / d * 0.6 + facing(boss) * 0.4, dy: dy / d * 0.6 };
  const n = Math.hypot(rt.aim.dx, rt.aim.dy) || 1; rt.aim.dx /= n; rt.aim.dy /= n;
  playSound('alienCharge', 0.9, rt.slowT > 0 ? -5 : 0);
  if (Math.random() < 0.3) say(ctx, pickRandom(ALIEN_LINES.LASER));
};

/** Pinned down in the sludge, he still takes his shots at him from the floor (a beat between them). */
const GROUNDED_SHOT_WAIT = 80;
/** How long he's pinned (from when it first gets him: more sludge on him hurts, but doesn't keep him down longer). */
const GROUNDED_FRAMES = 300;
/** Once he's up out of it, how long before it can drag him down again. */
const SLUDGE_FREE_FRAMES = 240;
/** Knocked silly by a boulder: how long, and how long after before another can do it again. */
const STUN_FRAMES = 55;
const STUN_FREE_FRAMES = 150;
/** The taser through his men: held while it keeps coming, up to this long (from the start of it). */
const CHAIN_STUN_FRAMES = 24, CHAIN_STUN_MAX = 90;
/** Out of the last stun long enough to be stunned again? */
const canStun = (rt: FinaleRuntime, frame: number) => rt.stunAt === undefined || frame - rt.stunAt > CHAIN_STUN_MAX + STUN_FREE_FRAMES;

/** The tell: the gun up, the beam charging along where it's aimed (turning to follow him), then locked on. */
/** (and the more of his ammo Meathead's spent, the quicker it comes: up to a third quicker with it all gone) */
const DRAIN_TELL = 0.35;
const tellFrames = (boss: Enemy, rt: FinaleRuntime, drain = 0) => Math.round((TELL_FRAMES - alienPace(boss) * TELL_RAMP) * (1 - drain * DRAIN_TELL) * (rt.slowT > 0 ? 1.6 : 1));

const chargeUp = (ctx: FrameContext, boss: Enemy, rt: FinaleRuntime) => {
  const p = ctx.state.player;
  const tell = rt.tellLen ?? tellFrames(boss, rt);
  boss.vel.x *= 0.8; boss.vel.y *= 0.8;
  if (rt.modeT < tell - LOCK_FRAMES) {
    const m = alienMuzzle(boss, rt.aim);
    const tx = p.pos.x + p.width / 2 - m.x, ty = p.pos.y + p.height / 2 - m.y;
    const want = Math.atan2(ty, tx), now = Math.atan2(rt.aim.dy, rt.aim.dx);
    let d = want - now; d -= Math.round(d / (Math.PI * 2)) * Math.PI * 2;
    const a = now + Math.max(-0.05, Math.min(0.05, d));
    rt.aim = { dx: Math.cos(a), dy: Math.sin(a) };
    // (he can't turn the gun round behind him: a forward arc)
    if (Math.sign(rt.aim.dx) !== facing(boss)) rt.aim = { dx: facing(boss) * 0.2, dy: Math.sign(rt.aim.dy || 1) * 0.98 };
  }
  if (rt.modeT >= tell) { rt.mode = 'fire'; rt.modeT = 0; rt.shots++; playSound('alienBeam', 1); ctx.bossHelpers.setScreenShake(8); }
};

/** Where a line from (x, y) along (dx, dy) meets the room's walls, floor or ceiling. */
const toWall = (x: number, y: number, dx: number, dy: number) => {
  let t = 4000;
  if (dx > 0.001) t = Math.min(t, (ROOM_R - x) / dx); else if (dx < -0.001) t = Math.min(t, (ROOM_L - x) / dx);
  if (dy > 0.001) t = Math.min(t, (FLOOR - y) / dy); else if (dy < -0.001) t = Math.min(t, (ROOM_TOP - y) / dy);
  return Math.max(0, t);
};

const fireBeam = (ctx: FrameContext, boss: Enemy, rt: FinaleRuntime) => {
  const { state, fx } = ctx;
  const p = state.player;
  const m = alienMuzzle(boss, rt.aim);
  let len = toWall(m.x, m.y, rt.aim.dx, rt.aim.dy);
  // His flamethrower in the way of it, pointed back at him: the two meet, and it goes on through weakened (it still
  // hurts: he's still got to get out of it)
  let blocked: { x: number; y: number } | undefined;
  const pcx = p.pos.x + p.width / 2;
  if (p.isFlaming && (p.flameRange || 0) > 20 && Math.sign(cx(boss) - pcx) === p.facing && Math.sign(rt.aim.dx) === -p.facing) {
    const tipX = pcx + p.facing * (24 + (p.flameRange || 0));
    // (the flame right up to the gun, or past it: they meet at the muzzle)
    const t = Math.max(0, (tipX - m.x) / (rt.aim.dx || 1e-3));
    if (t < len) blocked = { x: m.x + rt.aim.dx * t, y: m.y + rt.aim.dy * t };
  }
  const weak = !!blocked || (rt.dampT ?? 0) > 0;
  if (rt.dampT) rt.dampT--;
  // His filth shield (the Sludge Barfer's) soaks it up: the shield's gone, and so is the shot, all of it, stopped dead
  // on him for as long as it lasts (it's one hit, like any other the shield takes)
  const onHim = p.health > 0 && beamTouches({ x: m.x, y: m.y, dx: rt.aim.dx, dy: rt.aim.dy, len }, p.pos.x - 20, p.pos.y - 20, p.width + 40, p.height + 40);
  if (onHim && !rt.soaked && (p.filthShieldTimer ?? 0) > 0) {
    rt.soaked = true;
    p.filthShieldTimer = 0;
    fx.spawnExplosion({ x: pcx, y: p.pos.y + p.height / 2 }, '#ADFF2F', 18, 0, 12);
    callout(ctx, boss, 'ABSORBED!', '#84CC16');
    playSound('splat', 0.9); playSound('dry_flame', 0.6, 4);
  }
  if (onHim && rt.soaked) {
    len = Math.max(0, Math.min(len, (pcx - m.x) * rt.aim.dx + (p.pos.y + p.height / 2 - m.y) * rt.aim.dy - 26));
    if (state.frame % 2 === 0) for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: m.x + rt.aim.dx * len, y: m.y + rt.aim.dy * len }, vel: { x: -rt.aim.dx * 2 + (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 16, color: i % 2 ? '#84CC16' : 'rgba(132, 204, 22, 0.6)', size: 3 + Math.random() * 3 });
  }
  rt.beam = { x: m.x, y: m.y, dx: rt.aim.dx, dy: rt.aim.dy, len, blocked, weak };
  if (state.frame % 9 === 0) playSound('alienBeam', 0.8);
  // A little kick back off it
  boss.pos.x -= rt.aim.dx * 0.4;
  if (blocked) {
    if (state.frame % 2 === 0) for (let i = 0; i < 3; i++) state.particles.push({ pos: { ...blocked }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 4 }, life: 16 + Math.random() * 10, color: i % 2 ? ALIEN.laser[5] : '#FDE047', size: 2 + Math.random() * 3 });
    if (state.frame % 4 === 0) fx.spawnSteamExplosionParticles(blocked, 3);
    sayOnce(ctx, rt, 'blocked', ALIEN_LINES.BLOCKED);
  }
  {
    // Where it hits the wall: sparks and a scorch mark left behind
    const ex = m.x + rt.aim.dx * len, ey = m.y + rt.aim.dy * len;
    if (state.frame % 2 === 0) state.particles.push({ pos: { x: ex, y: ey }, vel: { x: -rt.aim.dx * (2 + Math.random() * 4) + (Math.random() - 0.5) * 3, y: -rt.aim.dy * 3 - Math.random() * 3 }, life: 14, color: Math.random() < 0.5 ? ALIEN.laser[4] : '#FFFFFF', size: 2 + Math.random() * 3 });
    if (rt.modeT === 6 && rt.scorch.length < 24) rt.scorch.push({ x: ex, y: ey, at: state.frame });
    // Meathead in it
    if (!(onHim && rt.soaked) && p.invincibilityTimer <= 0 && p.health > 0 && beamTouches(rt.beam, p.pos.x, p.pos.y, p.width, p.height)) {
      const k = weak ? WEAK_BEAM : 1;
      hurtPlayer(ctx, Math.round(BEAM_DAMAGE * k), 'alien_laser', { x: rt.aim.dx * 7 * k, y: -5 * k });
      for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: pcx, y: p.pos.y + p.height * 0.6 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 26, color: i % 2 ? 'rgba(87, 83, 78, 0.6)' : '#F97316', size: 3 + Math.random() * 4 });
    }
  }
  // His own men in the way: vaporized (an oiled one goes up)
  for (const e of state.enemies) {
    if (e.type === 'boss' || e.health <= 0 || e.isBlownAway || !beamTouches(rt.beam, e.pos.x, e.pos.y, e.width, e.height)) continue;
    // (a jetpack man still coming in through his window: singed, not done for; he gets his moment)
    if (e.kind === 'jetagent' && e.aiState === 'enter') {
      if (state.frame % 3 === 0) state.particles.push({ pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + Math.random() * e.height }, vel: { x: (Math.random() - 0.5) * 2, y: -1 - Math.random() * 2 }, life: 18, color: Math.random() < 0.5 ? 'rgba(87, 83, 78, 0.7)' : ALIEN.laser[4], size: 3 + Math.random() * 3 });
      continue;
    }
    if (e.isOiled && oiledIntoFire(ctx, e)) continue;
    // (vaporized: gone, from the side the beam came in, leaving his shoes)
    e.health = 0;
    startEnemyDeath(state, e, 'vaporized', { x: Math.sign(rt.aim.dx) || 1, y: 0 });
    fx.spawnKillCallout(e, 'vaporized');
    playSound('alienBeam', 0.6, 6);
  }
  // Fired with the oil still on him: the muzzle flash sets him alight
  if (boss.isOiled && !boss.isOnFire && rt.modeT === 3) ignite(ctx, boss, rt);
  if (rt.modeT >= BEAM_FRAMES + Math.round(alienPace(boss) * 10)) { rt.beam = null; rt.mode = 'float'; rt.modeT = 0; rt.path = []; }
};

/** Is any of a box in the beam? */
export const beamTouches = (b: { x: number; y: number; dx: number; dy: number; len: number }, x: number, y: number, w: number, h: number) => {
  for (let s = 0; s <= b.len; s += 8) {
    const px = b.x + b.dx * s, py = b.y + b.dy * s;
    if (px > x - BEAM_HALF && px < x + w + BEAM_HALF && py > y - BEAM_HALF && py < y + h + BEAM_HALF) return true;
  }
  return false;
};

/** Sludged: dragged down onto the floor in it, stuck there, struggling; then back up. */
const sludged = (ctx: FrameContext, boss: Enemy, rt: FinaleRuntime) => {
  const { state } = ctx;
  rt.groundT--;
  rt.beam = null;
  const floorY = FLOOR - boss.height + 22;
  if (rt.groundT > 40) {
    if (boss.pos.y < floorY) {
      rt.fallV = Math.min(16, rt.fallV + 0.9);
      boss.pos.y = Math.min(floorY, boss.pos.y + rt.fallV);
      if (boss.pos.y >= floorY) {
        rt.landedAt = state.frame; rt.fallV = 0;
        ctx.bossHelpers.setScreenShake(14);
        playSound('slam'); playSound('splat', 0.8);
        for (let i = 0; i < 26; i++) state.particles.push({ pos: { x: cx(boss) + (Math.random() - 0.5) * 100, y: FLOOR - 6 }, vel: { x: (Math.random() - 0.5) * 9, y: -2 - Math.random() * 6 }, life: 30 + Math.random() * 20, color: i % 3 ? '#84CC16' : '#3F6212', size: 3 + Math.random() * 5, grav: 0.35 });
      }
    }
    // (struggling to get up out of it)
    if (state.frame % 7 === 0) state.particles.push({ pos: { x: cx(boss) + (Math.random() - 0.5) * 90, y: FLOOR - 10 }, vel: { x: 0, y: -0.6 - Math.random() }, life: 26, color: 'rgba(132, 204, 22, 0.7)', size: 3 + Math.random() * 3 });
  } else {
    // Hauling himself up out of it, the sludge stringing off him
    boss.pos.y -= 2.4;
    if (state.frame % 4 === 0) state.particles.push({ pos: { x: boss.pos.x + Math.random() * boss.width, y: bottom(boss) - 6 }, vel: { x: 0, y: 1.5 }, life: 30, color: '#65A30D', size: 3, grav: 0.3 });
    if (bottom(boss) <= FLOAT_BOTTOM_LO || rt.groundT <= 0) {
      rt.groundT = 0; rt.sludgeFreeT = SLUDGE_FREE_FRAMES;
      boss.pos.y = Math.min(boss.pos.y, FLOAT_BOTTOM_LO - boss.height);
      // (a shot he's in the middle of, he finishes)
      if (rt.mode !== 'charge' && rt.mode !== 'fire') { rt.mode = rt.mode === 'plead' ? 'plead' : 'float'; rt.modeT = 0; rt.path = []; }
    }
  }
};

/** Carried off by a wave (and into the wall, if it gets him there): pushed, not stunned, so a shot he's lining up
 * or firing keeps going while he goes. */
const washed = (ctx: FrameContext, boss: Enemy, rt: FinaleRuntime) => {
  if (rt.mode === 'charge') chargeUp(ctx, boss, rt);
  else if (rt.mode === 'fire') fireBeam(ctx, boss, rt);
  boss.pos.x += rt.pushDir * TSUNAMI_WAVE_SPEED * 0.6 * Math.min(1, rt.pushT / 20);
  boss.pos.y = Math.min(FLOAT_BOTTOM_LO - boss.height, boss.pos.y + 0.5);
  boss.pos.x = Math.max(ROOM_L + 4, Math.min(ROOM_R - boss.width - 4, boss.pos.x));
};

/** Knocked silly (a boulder, the taser through his men): sagging, swaying, nothing going on behind the eyes. */
const reeling = (boss: Enemy, rt: FinaleRuntime) => {
  rt.beam = null;
  boss.pos.x += Math.sin(rt.t * 0.3) * 0.6;
  if (bottom(boss) < FLOAT_BOTTOM_LO) boss.pos.y += 0.6;
};

/** Beaten: low, cringing, drifting about the middle of his side, lobbing sad little bolts at Meathead. */
const plead = (ctx: FrameContext, boss: Enemy, rt: FinaleRuntime) => {
  const { state } = ctx;
  const p = state.player;
  rt.beam = null;
  boss.facing = p.pos.x + p.width / 2 < cx(boss) ? -1 : 1;
  const tx = Math.max(ROOM_L + 60, Math.min(ROOM_R - 60 - boss.width, (rt.side < 0 ? ROOM_L + 260 : ROOM_R - 260 - boss.width) + Math.sin(rt.t * 0.01) * 80));
  floatTo(boss, tx, FLOAT_BOTTOM_LO - boss.height + 2, 0.9);
  if (--rt.boltT <= 0 && p.health > 0) {
    rt.boltT = BOLT_EVERY + Math.floor(Math.random() * 40);
    const m = alienMuzzle(boss, { dx: facing(boss), dy: 0.1 });
    const dx = p.pos.x + p.width / 2 - m.x, dy = p.pos.y + p.height * 0.4 - m.y, d = Math.hypot(dx, dy) || 1;
    state.projectiles.push(enemyProjectile(`alien-bolt-${state.frame}`, m.x - 7, m.y - 5, dx / d * BOLT_SPEED, dy / d * BOLT_SPEED + 0.3, 14, 10, BOLT_DAMAGE, { sadBolt: true, shooterKind: 'alien', life: 600, bornAt: state.frame }));
    playSound('sadBolt', 0.9);
  }
};

/**
 * A pitched boulder breaking on him: chunks splinter off it, each one homing in on a Secret Service man on screen (just
 * a couple), and whoever one finds, it kills.
 */
const CHUNKS_MAX = 2;
/** How long he burns (still oiled) after a grease fire: much longer than an ordinary lighting. */
const GREASE_FIRE_FRAMES = 600;
const splinter = (ctx: FrameContext, rt: FinaleRuntime, x: number, y: number) => {
  const { state } = ctx;
  const view = state.view ?? { x: state.camera.x, y: state.camera.y, w: 800, h: 600 };
  const targets = state.enemies
    .filter(e => e.type !== 'boss' && e.health > 0 && !e.isBlownAway && e.pos.x + e.width > view.x && e.pos.x < view.x + view.w)
    .sort((a, b) => Math.hypot(a.pos.x - x, a.pos.y - y) - Math.hypot(b.pos.x - x, b.pos.y - y))
    .slice(0, CHUNKS_MAX);
  const list = (rt.chunks ??= []);
  targets.forEach((e, i) => {
    const a = -Math.PI / 2 + (i - (targets.length - 1) / 2) * 0.5;
    list.push({ id: e.id, x, y, vx: Math.cos(a) * 7, vy: Math.sin(a) * 7, t: 0 });
  });
  for (let i = 0; i < 5; i++) state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 9, y: -1 - Math.random() * 6 }, life: 24, color: i % 2 ? '#A8A29E' : '#78716C', size: 3 + Math.random() * 4, chunk: true, grav: 0.4 });
};
const flyChunks = (ctx: FrameContext, rt: FinaleRuntime) => {
  const { state, fx } = ctx;
  if (!rt.chunks?.length) return;
  rt.chunks = rt.chunks.filter(c => {
    const e = state.enemies.find(q => q.id === c.id);
    c.t++;
    if (!e || e.health <= 0 || e.isBlownAway || c.t > 90) return false;
    // (out, then curving round onto him, faster and faster)
    const tx = e.pos.x + e.width / 2, ty = e.pos.y + e.height / 2;
    const dx = tx - c.x, dy = ty - c.y, d = Math.hypot(dx, dy) || 1;
    const sp = Math.min(22, 6 + c.t * 0.9), turn = Math.min(1, 0.12 + c.t * 0.02);
    c.vx += (dx / d * sp - c.vx) * turn; c.vy += (dy / d * sp - c.vy) * turn;
    c.x += c.vx; c.y += c.vy;
    state.particles.push({ pos: { x: c.x - 4, y: c.y - 4 }, vel: { x: 0, y: 0 }, life: 2, color: '#8A847F', size: 8, chunk: true });
    if (c.t % 2 === 0) state.particles.push({ pos: { x: c.x, y: c.y }, vel: { x: -c.vx * 0.1, y: -c.vy * 0.1 }, life: 10, color: 'rgba(168, 162, 158, 0.7)', size: 3 });
    if (d > 16) return true;
    // Found him
    fx.blowAwayEnemy(e, { x: Math.sign(c.vx || 1) * 16, y: -10 }, 'boulder_kill', Math.sign(c.vx) || 1, 1.4);
    fx.spawnDamageNumber({ x: e.pos.x, y: e.pos.y - 20 }, 'SHRAPNEL!', true, '#D6D3D1');
    playSound('crunch', 0.6);
    return false;
  });
};

/** The flamethrower's little homing jets: a curl of fire out to whoever each's after, and he's alight. */
const flyJets = (ctx: FrameContext, rt: FinaleRuntime) => {
  const { state } = ctx;
  if (!rt.flameJets?.length) return;
  rt.flameJets = rt.flameJets.filter(j => {
    const e = state.enemies.find(q => q.id === j.id);
    j.t++;
    if (!e || e.health <= 0 || e.isBlownAway || e.isOnFire || j.t > 70) return false;
    const tx = e.pos.x + e.width / 2, ty = e.pos.y + e.height / 2;
    const dx = tx - j.x, dy = ty - j.y, d = Math.hypot(dx, dy) || 1;
    const sp = Math.min(16, 6 + j.t * 0.6), turn = Math.min(1, 0.1 + j.t * 0.025);
    j.vx += (dx / d * sp - j.vx) * turn; j.vy += (dy / d * sp - j.vy) * turn;
    j.x += j.vx; j.y += j.vy;
    // (a little tongue of fire: a hot head, a trail cooling off behind it)
    state.particles.push({ pos: { x: j.x - 4, y: j.y - 4 }, vel: { x: 0, y: 0 }, life: 3, color: '#FEF3C7', size: 7, alpha: 0.95 });
    state.particles.push({ pos: { x: j.x - 3, y: j.y - 3 }, vel: { x: -j.vx * 0.15, y: -j.vy * 0.15 - 0.3 }, life: 10, color: j.t % 2 ? '#F97316' : '#FDBA74', size: 6, alpha: 0.85 });
    if (j.t % 3 === 0) state.particles.push({ pos: { x: j.x, y: j.y }, vel: { x: (Math.random() - 0.5), y: -0.8 }, life: 16, color: '#DC2626', size: 4, alpha: 0.6 });
    if (d > 14) return true;
    // Caught him: alight
    burnEnemy(ctx, e);
    if (e.health > 0 && !e.isBlownAway) e.isOnFire = true;
    playSound('ignite', 0.5);
    return false;
  });
};

const ignite = (ctx: FrameContext, boss: Enemy, rt: FinaleRuntime) => {
  boss.isOnFire = true;
  rt.burnT = BURN_FRAMES;
  ctx.fx.playGunSound('ignite');
  ctx.fx.spawnExplosion({ x: cx(boss), y: boss.pos.y + boss.height / 2 }, '#F97316', 16, 0, 10);
  ctx.state.damageNumbers.push({ id: `alien-fire-${ctx.state.frame}`, text: 'FLAMBEED!', pos: { x: cx(boss), y: boss.pos.y - 30 }, vel: { x: 0, y: -2.5 }, life: 70, maxLife: 70, isCritical: true, isCallout: true, color: '#F97316' });
  sayOnce(ctx, rt, 'burning', ALIEN_LINES.BURNING);
};

/** A callout over him for something a weapon's done (it's working: you're meant to see it). */
const callout = (ctx: FrameContext, boss: Enemy, text: string, color: string) => {
  ctx.state.damageNumbers.push({ id: `alien-${text}-${ctx.state.frame}`, text, pos: { x: cx(boss), y: boss.pos.y - 34 }, vel: { x: 0, y: -2.8 }, life: 70, maxLife: 70, isCritical: true, isCallout: true, color });
};

// ---------------------------------------------------------------------------
// What's done to him
// ---------------------------------------------------------------------------

const damageFor = (weapon: WeaponType, state: FrameContext['state']) => {
  const rt = getFinale(state);
  // (beaten, the pistol finishes him in a few: see stages/finale's plead phase)
  if (rt?.pleadAt !== undefined && (weapon === 'GUN' || weapon === 'LMG')) return rt.pleadGun;
  const base = DAMAGE[weapon] ?? 6;
  return rt && rt.groundT > 0 ? base * GROUNDED_MULT : base;
};

/** Green: what he bleeds (a spray of it out the far side of him where a round goes in). */
const ooze = (ctx: FrameContext, x: number, y: number, dir: number, n: number) => {
  for (let i = 0; i < n; i++) ctx.state.particles.push({ pos: { x, y }, vel: { x: dir * (1.5 + Math.random() * 4), y: -1.5 - Math.random() * 3 }, life: 18 + Math.random() * 16, color: i % 3 === 0 ? ALIEN.slimeDark : i % 3 === 1 ? ALIEN.slime : ALIEN.slimeLight, size: 1.5 + Math.random() * 3, grav: 0.3 });
};

/**
 * Plinking him with the pistol, or throwing himself at him, while there's still ammo in the good stuff: every so often
 * Meathead mutters that he's got better toys than this (not while he's begging: by then the pistol's the point).
 */
const NUDGE_EVERY = 720, NUDGE_GUN_HITS = 14, NUDGE_MELEE_HITS = 2;
const nudge = (ctx: FrameContext, rt: FinaleRuntime, kind: 'gun' | 'melee') => {
  if (rt.pleadAt !== undefined) return;
  const p = ctx.state.player;
  const toys = (ctx.state.availableWeapons ?? []).some(w => w !== 'GUN' && w !== 'LMG' && (p.weaponAmmo?.[w] ?? 0) >= 1);
  if (!toys) return;
  const n = rt.nudge ??= { gun: 0, melee: 0, at: -NUDGE_EVERY, said: 0 };
  n[kind]++;
  if (n[kind] < (kind === 'gun' ? NUDGE_GUN_HITS : NUDGE_MELEE_HITS) || rt.t - n.at < NUDGE_EVERY) return;
  n.gun = 0; n.melee = 0; n.at = rt.t;
  const pool = kind === 'gun' ? FINALE_LINES.NUDGE_GUN : FINALE_LINES.NUDGE_MELEE;
  const text = pool[n.said++ % pool.length];
  if (rt.lines.length < 8) rt.lines.push({ who: 'meathead', text });
};

const PITCH_CALLOUTS = ['STRIKE!', 'STEE-RIKE!', 'HEATER!', 'CHIN MUSIC!', 'FASTBALL!'];
const PLEAD_HIT_CALLOUTS = ['BAM!', 'OOF!', 'RIGHT IN THE ANTENNA!', 'MERCY DENIED!', 'SPLAT!', 'NO REFUNDS!'];

const onWeaponHit = (ctx: FrameContext, boss: Enemy, weapon: WeaponType, p?: Partial<Projectile>) => {
  const { state } = ctx;
  const rt = getFinale(state);
  if (!rt) return;
  rt.flash = Math.max(rt.flash, 3);
  const hx = p?.pos ? p.pos.x + (p.width ?? 0) / 2 : cx(boss), hy = p?.pos ? p.pos.y + (p.height ?? 0) / 2 : boss.pos.y + boss.height / 2;
  const dir = p?.vel ? Math.sign(p.vel.x) || 1 : 1;
  switch (weapon) {
    case 'GUN': case 'LMG':
      ooze(ctx, Math.max(boss.pos.x, Math.min(boss.pos.x + boss.width, hx)), hy, dir, 4);
      nudge(ctx, rt, 'gun');
      if (rt.pleadAt !== undefined) {
        // Beaten: every round lands like a truck
        rt.flash = 12; rt.reel = 1;
        // (and the next plea's due straight away)
        rt.pleaWaitT = 0;
        ctx.bossHelpers.setScreenShake(12);
        ooze(ctx, cx(boss), hy, dir, 18);
        playSound('splat', 1); playSound('punch', 0.9, -4);
        callout(ctx, boss, pickRandom(PLEAD_HIT_CALLOUTS), '#BEF264');
        boss.pos.x += dir * 14;
      }
      break;
    case 'SHOTGUN':
      if (rt.slowT <= 0) callout(ctx, boss, 'FROZEN STIFF!', '#B3F0FF');
      rt.slowT = Math.max(rt.slowT, 240);
      for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: hx, y: hy }, vel: { x: (Math.random() - 0.5) * 3, y: -Math.random() * 2 }, life: 30, color: '#E0F2FE', size: 2 + Math.random() * 4 });
      sayOnce(ctx, rt, 'slowed', ALIEN_LINES.SLOWED);
      break;
    case 'BOULDER':
      // (a pitched one: a fastball to the face)
      // (the one thing that stuns him: and not again till he's had a moment out of it, so he can't be kept that way;
      // a rock to the face then still hurts, it just doesn't put him out)
      if (rt.stunT <= 0 && canStun(rt, state.frame)) {
        rt.stunT = STUN_FRAMES; rt.stunAt = state.frame;
        callout(ctx, boss, p?.pitched ? pickRandom(PITCH_CALLOUTS) : 'BONK!', '#FDE68A'); playSound('clang', 0.7, -6);
        dropShot(rt);
        sayOnce(ctx, rt, 'stunned', ALIEN_LINES.STUNNED);
      }
      if (p?.pitched) { rt.flash = 10; rt.reel = 1; boss.pos.x += (Math.sign(p.vel?.x ?? 0) || 1) * 12; splinter(ctx, rt, hx, hy); }
      break;
    case 'NEEDLES':
      if (p && p.pos && p.vel) stickNeedle(boss, p as Projectile, BOSS_NEEDLE);
      rt.needleAt.push(state.frame);
      if (rt.needleAt.length > 14) { rt.needleAt.shift(); boss.needleOffsets?.shift(); }
      break;
    case 'SLUDGE':
      // (it only drags him down from up in the air, and not again straight after he's hauled himself out: more of
      // it on him still hurts, but he can't be kept down for good)
      if (rt.groundT <= 0 && rt.sludgeFreeT <= 0) {
        callout(ctx, boss, 'GROUNDED!', '#84CC16'); rt.fallV = 0;
        rt.groundT = GROUNDED_FRAMES;
        // (not out of his shot: yanked down mid-way through it, his aim's knocked off, and a locked beam goes
        // sweeping down the room with him)
        if (rt.mode === 'charge' || rt.mode === 'fire') {
          const a = Math.atan2(rt.aim.dy, rt.aim.dx) + (Math.random() < 0.5 ? -1 : 1) * (0.3 + Math.random() * 0.25);
          rt.aim = { dx: Math.cos(a), dy: Math.sin(a) };
        }
        sayOnce(ctx, rt, 'grounded', ALIEN_LINES.GROUNDED);
      }
      break;
    case 'OIL_ROCKET':
      rt.flash = 10; rt.reel = 0.7;
      boss.pos.x += dir * 10;
      playSound('thud', 1, -6);
      ctx.bossHelpers.setScreenShake(10);
      if (boss.isOiled) sayOnce(ctx, rt, 'oiled', ALIEN_LINES.OILED);
      break;
  }
};

const onFlamed = (ctx: FrameContext, boss: Enemy, scale = 1) => {
  const { state } = ctx;
  const rt = getFinale(state);
  if (!rt) return;
  // (every flame segment touching him calls this: once a frame)
  if ((boss.burntAt ?? -1) === state.frame) return;
  boss.burntAt = state.frame;
  // His shot's weakened (not put out: it still comes, it still hurts)
  if (rt.mode === 'charge' || rt.mode === 'fire') {
    if (!(rt.dampT && rt.dampT > 0)) { callout(ctx, boss, 'LASER WEAKENED!', '#F97316'); playSound('dry_flame', 0.8, -3); }
    rt.dampT = 10;
    sayOnce(ctx, rt, 'blocked', ALIEN_LINES.BLOCKED);
  }
  // Greased and then flamed: he goes up like the whole barrel, and the room with him (every agent in it; him, a
  // nuke's worth)
  if (boss.isOiled && !boss.isOnFire) {
    ignite(ctx, boss, rt);
    // (and he stays greased and burning a good while after: the nuke itself barely scratches him)
    rt.burnT = GREASE_FIRE_FRAMES;
    // (if the blast's what finishes him, it's the fire that did it)
    rt.greaseAt = state.frame;
    detonateNuke(ctx, { x: cx(boss), y: boss.pos.y + boss.height / 2 });
    callout(ctx, boss, 'GREASE FIRE!', '#FDE047');
  }
  const igniter = scale < 1;
  if (igniter && rt.pleadAt !== undefined) return;
  rt.flameAcc += FLAME_PER_FRAME * (igniter ? IGNITER_SCALE : 1);
  if (state.frame % 3 === 0) state.particles.push({ pos: { x: boss.pos.x + Math.random() * boss.width, y: boss.pos.y + Math.random() * boss.height * 0.6 }, vel: { x: (Math.random() - 0.5) * 2, y: -1 - Math.random() * 2 }, life: 18, color: Math.random() > 0.6 ? '#4B5563' : '#F97316', size: 3 + Math.random() * 3 });
  if (rt.flameAcc >= FLAME_PER_FRAME * FLAME_TICK * (igniter ? IGNITER_SCALE : 1)) {
    const dmg = rt.flameAcc * (rt.groundT > 0 ? GROUNDED_MULT : 1);
    rt.flameAcc = 0;
    // (as a hit: the reaction, the number, the death if it's that)
    hitBoss(ctx, boss, 'FLAMETHROWER', { facing: ctx.state.player.facing, damage: dmg });
  }
};

const onTaser = (ctx: FrameContext, boss: Enemy) => {
  // Straight onto him: it tingles, that's all (it's no hold on him)
  const { state } = ctx;
  if (state.frame % TASER_TICK_RATE === 0) hitBoss(ctx, boss, 'TASER', { facing: state.player.facing });
  if (state.frame % 4 === 0) state.particles.push({ pos: { x: boss.pos.x + Math.random() * boss.width, y: boss.pos.y + Math.random() * boss.height }, vel: { x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 3 }, life: 8, color: '#00E5FF', size: 2 });
};

const onTaserChain = (ctx: FrameContext, boss: Enemy) => {
  const rt = getFinale(ctx.state);
  if (!rt) return;
  // Off his own men onto him: it holds him (and fries him a bit). Held for a spell, then he shakes it off for a while,
  // however long the current keeps coming: no keeping him locked up
  const { frame } = ctx.state;
  if (rt.stunT <= 0 && canStun(rt, frame)) {
    rt.stunT = CHAIN_STUN_FRAMES; rt.stunAt = frame;
    callout(ctx, boss, 'GROUNDED OUT!', '#00E5FF');
    dropShot(rt);
  } else if (rt.stunT > 0 && rt.stunAt !== undefined && frame - rt.stunAt < CHAIN_STUN_MAX) rt.stunT = Math.max(rt.stunT, 24);
  rt.chainAt = frame;
  boss.isTased = true;
  if (ctx.state.frame % TASER_TICK_RATE === 0) hitBoss(ctx, boss, 'TASER', { facing: ctx.state.player.facing, damage: CHAIN_DAMAGE });
  sayOnce(ctx, rt, 'chain', ALIEN_LINES.CHAIN);
};

const onTsunami = (ctx: FrameContext, boss: Enemy, dir: number, first: boolean) => {
  const rt = getFinale(ctx.state);
  if (!rt) return;
  if (first) {
    rt.pushT = 46; rt.pushDir = dir; rt.slammed = false;
    hitBoss(ctx, boss, 'TSUNAMI', { facing: dir });
    sayOnce(ctx, rt, 'pushed', ALIEN_LINES.PUSHED);
  }
  rt.pushT = Math.max(rt.pushT, 12);
  // Into the wall with it
  const atWall = dir > 0 ? boss.pos.x + boss.width >= ROOM_R - 6 : boss.pos.x <= ROOM_L + 6;
  if (atWall && !rt.slammed) {
    rt.slammed = true;
    boss.health -= WALL_SLAM_DAMAGE;
    ctx.fx.spawnDamageNumber(boss.pos, WALL_SLAM_DAMAGE, true);
    callout(ctx, boss, 'WALL SPLAT!', '#38BDF8');
    ctx.bossHelpers.setScreenShake(16);
    playSound('slam'); playSound('splat');
    ooze(ctx, dir > 0 ? boss.pos.x + boss.width : boss.pos.x, boss.pos.y + boss.height / 2, -dir, 20);
    if (boss.health <= 0) ctx.bossHelpers.killBoss(boss, dir, true, 'TSUNAMI');
  }
};

const onBodyHit = (ctx: FrameContext, boss: Enemy, body: Enemy, force: number) => {
  const { state, fx } = ctx;
  const rt = getFinale(state);
  if (!rt || boss.health <= 0) return;
  const contact = !!body.overdosed;
  if (!contact && force < 3) return;
  const dmg = contact ? CONTACT_HIGH_DAMAGE : Math.round(Math.max(BODY_MIN, Math.min(BODY_MAX, force * BODY_SCALE)) * (rt.groundT > 0 ? GROUNDED_MULT : 1));
  boss.health -= dmg;
  rt.flash = 8; rt.reel = 0.8;
  fx.spawnDamageNumber(boss.pos, dmg, true);
  const at = { x: body.pos.x + body.width / 2, y: body.pos.y + body.height / 2 };
  fx.spawnExplosion(at, contact ? '#E879F9' : '#8B0000', 12, 0, 10);
  ooze(ctx, at.x, at.y, Math.sign(body.vel.x) || 1, 10);
  playSound('thud', 1, -4); playSound('splat', 0.7);
  ctx.bossHelpers.setScreenShake(10);
  callout(ctx, boss, contact ? 'CONTACT HIGH!' : pickRandom(['SPECIAL DELIVERY!', 'AGENT DOWN! ON HIM!', 'HUMAN SHIELD!', 'RETURN TO SENDER!']), contact ? '#E879F9' : '#FFA500');
  if (contact) sayOnce(ctx, rt, 'contact', ALIEN_LINES.CONTACT);
  // (the body bounces off him)
  body.vel.x *= -0.35; body.vel.y = Math.min(body.vel.y, -4);
  // (a contact high that finishes him: the needles' kill, an overdose of his own)
  if (boss.health <= 0) ctx.bossHelpers.killBoss(boss, Math.sign(body.vel.x) || 1, true, contact ? 'NEEDLES' : 'GUN', 'alien_kill');
};

/** A nuke on him: heavily resisted (well under a rocket's hit), and only when he's not already in the oil fire (oiled
 * and burning, a grease fire): while he's going up, another blast doesn't touch him (the room still goes, his men with
 * it). The blast that a grease fire sets off as it lights him is the one that counts. */
const NUKE_DAMAGE = 60;
const nukeDamage = (ctx: FrameContext, boss: Enemy) => {
  const rt = getFinale(ctx.state);
  if (!rt) return NUKE_DAMAGE;
  const { frame } = ctx.state;
  if (boss.isOnFire && boss.isOiled && rt.greaseAt !== frame) {
    if (rt.nukeAt !== frame) callout(ctx, boss, 'SHRUGGED OFF!', '#A8A29E');
    rt.nukeAt = frame;
    return 0;
  }
  rt.nukeAt = frame;
  return NUKE_DAMAGE;
};

const onNuke = (ctx: FrameContext, boss: Enemy) => {
  const rt = getFinale(ctx.state);
  if (!rt) return;
  rt.flash = 14; rt.reel = 1;
  if (boss.isOiled && !boss.isOnFire) ignite(ctx, boss, rt);
};

/** He's gone (blown apart): what he was doing stops, the room's quiet. */
const onDeath = (state: FrameContext['state']) => {
  const rt = getFinale(state);
  if (!rt) return;
  rt.beam = null; rt.lines = []; rt.radioText = null;
  // (green: what's inside him, everywhere)
  const boss = state.deadBoss;
  if (boss) for (let i = 0; i < 60; i++) {
    const a = Math.random() * Math.PI * 2, sp = 3 + Math.random() * 12;
    state.particles.push({ pos: { x: boss.pos.x + boss.width / 2, y: boss.pos.y + boss.height / 2 }, vel: { x: Math.cos(a) * sp, y: Math.sin(a) * sp - 4 }, life: 160 + Math.random() * 120, color: [ALIEN.slimeDark, ALIEN.hide[4], ALIEN.slime, ALIEN.slimeLight][i % 4], size: 3 + Math.random() * 8, isBossGore: true });
  }
};

export const alien: BossDef = {
  id: ALIEN_ID,
  // (no one weapon's his weakness: they all work. This one never turns up in the finale)
  weakness: 'LMG',
  spawn: { x: ROOM_R - 70 - ALIEN_W, y: FLOAT_BOTTOM_HI + 20 - ALIEN_H, state: 'idle', timer: 0, fields: { width: ALIEN_W, height: ALIEN_H, health: ALIEN_HP, maxHealth: ALIEN_HP, facing: -1 } },
  arena: { right: ROOM_R, openTop: true },
  contact: { damage: 30 },
  update,
  noBreather: true,
  damageFor,
  onWeaponHit,
  meleeScale: 0.08,
  // (and a charge, a slide, an uppercut or a dive kick can grind him down, but never finish him)
  meleeCantKill: true,
  onMeleeHit: (ctx, boss) => { void boss; const rt = getFinale(ctx.state); if (rt) nudge(ctx, rt, 'melee'); },
  onBodyHit,
  onTaser,
  onTaserChain,
  onTsunami,
  onFlamed,
  oilable: true,
  nukeDamage,
  onNuke,
  onDeath,
  alwaysErupts: true,
  // (however he goes, he goes his own way, in close-up: see stages/finale/killCam.ts, bosses/alienDeath.ts)
  // (called through: the kill cam's module and this one load each other)
  ownDeath: { start: (...a) => startKillCam(...a), playing: state => killCamPlaying(state) },
  // (slime, mostly; the odd bit of the President still in there)
  gore: [ALIEN.slime, ALIEN.slimeDark, ALIEN.slimeLight, ALIEN.hide[4], ALIEN.slime, ALIEN.slimeDark, '#8B0000'],
  killLine: 'alien_kill',
};
