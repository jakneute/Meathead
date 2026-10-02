// The desert's and the warehouse's hazards.
//
//   cacti:    touch one and it hurts, and throws you off it (a goon you shove
//             into one is done for).
//   belts:    the warehouse conveyors carry whatever's on them along (the way
//             you came), and crates of product ride them at you, dropping off
//             the end and bursting. A crate hurts if it catches you; shoot it or
//             hit it and it bursts where it is. The high lines, up under the
//             roof: you can ride them (against the current), and what comes off
//             them (off the end, or tipping off partway, wobbling first, the
//             powder trickling out of it) comes down and goes up in a cloud of
//             white that knocks you about if you're under it.

import type { Enemy } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import { rectsOverlap, boundsOf } from '../../core/utils';
import { hurtPlayer } from '../../bosses/shared';
import { playSound } from '../../platform/audio';
import { shakeScreen } from '../../core/state';
import { COURSE, Cactus } from './course';

export interface Crate {
  x: number; y: number; vx: number; vy: number; belt: number; falling: boolean; t: number;
  /** On a high line: where it tips off partway (world x), if it does; how long it's been wobbling there. */
  tipAt?: number; wobble?: number;
}
export interface Hazards {
  crates: Crate[];
  beltTimers: number[];
  /** How far along each belt's surface has moved (for drawing it running). */
  beltShift: number[];
}

export const CRATE = 30;
/** Frames of warning before a crate drops onto a belt: the light going round, the crate coming down the chute, the buzzer. */
export const CRATE_WARN = 70;
/** Where a belt's crates come on (world x of the crate's left side). */
export const feedX = (i: number) => { const b = COURSE.belts[i]; return b.speed < 0 ? b.x + b.w - CRATE - 4 : b.x + 4; };
const CACTUS_DAMAGE = 12, CRATE_DAMAGE = 10;
/** What comes down off a high line: how far its cloud of powder reaches, what it does to him, how long a crate wobbles
 * before it tips. */
const BLAST_R = 80, BLAST_DAMAGE = 8, WOBBLE = 40;
/** What it does to them: one coming down on one, and the blast. */
const CRUSH_DAMAGE = 60, BLAST_ENEMY_DAMAGE = 30;

/** Can a crate (or its powder) get this one: a goon, not the boss, not Chuco, not anyone already going. */
const canHit = (e: Enemy) => e.health > 0 && !e.isBlownAway && e.type !== 'boss' && e.kind !== 'junkie' && !e.innocent;

/** A crate (or its blast) gets one of them: hurt and knocked about, or blown away if that's him done. */
const crush = (ctx: FrameContext, e: Enemy, damage: number, vel: { x: number; y: number }) => {
  const { fx } = ctx;
  e.health -= damage;
  fx.spawnDamageNumber(e.pos, damage);
  if (e.health <= 0) { fx.blowAwayEnemy(e, vel, 'charge_kill', Math.sign(vel.x)); fx.spawnKillCallout(e, 'crush'); }
  else { e.vel.x = vel.x; e.pauseTimer = 30; }
};

export const createHazards = (): Hazards => ({
  crates: [],
  beltTimers: COURSE.belts.map((b, i) => 30 + i * 40),
  beltShift: COURSE.belts.map(() => 0),
});

/** A cactus's prickly part (the saguaro's trunk and arms, a pear's paddles). */
export const cactusBox = (c: Cactus) => (c.look === 'saguaro' ? { x: c.x - 16, y: c.y - c.h, w: 32, h: c.h } : { x: c.x - 22, y: c.y - c.h, w: 44, h: c.h });

/** A belt's machine: its top's the belt. */
export const beltBox = (i: number) => { const b = COURSE.belts[i]; return { x: b.x, y: b.y, w: b.w, h: b.high ? 14 : 550 - b.y }; };

/** The belts as solid blocks (built into the level). */
export const beltBlocks = () => COURSE.belts.map((b, i) => (b.high
  ? { ...beltBox(i), type: 'platform' as const, oneWay: true, hidden: true, tag: `belt-${i}` }
  : { ...beltBox(i), type: 'ground' as const, hidden: true, tag: `belt-${i}` }));

const near = (state: GameState, x: number) => Math.abs(x - (state.camera.x + 400)) < 1400;

export const updateHazards = (ctx: FrameContext, hz: Hazards) => {
  const { state } = ctx;
  const p = state.player;
  // Cacti
  for (const c of COURSE.cacti) {
    if (!near(state, c.x)) continue;
    const box = cactusBox(c);
    if (p.invincibilityTimer <= 0 && state.deathTimer <= 0 && rectsOverlap(box, boundsOf(p))) {
      const away = p.pos.x + p.width / 2 < c.x ? -1 : 1;
      // (which end he met it with: coming down onto the top of it, or into its side)
      const onTop = p.vel.y > 0 && p.pos.y + p.height - p.vel.y <= box.y + 8;
      hurtPlayer(ctx, CACTUS_DAMAGE, 'cactus', { x: away * 7, y: -9 });
      if (p.health <= 0) state.impaleAt = { frame: state.frame, how: onTop ? 'cactus_top' : 'cactus_side', x: c.x, top: box.y, side: away, edge: away < 0 ? box.x : box.x + box.w };
      spines(state, p.pos.x + p.width / 2, p.pos.y + p.height / 2);
    }
    // A goon shoved into one (only a shove: they don't walk into them on their own)
    for (const e of state.enemies) {
      if (e.health <= 0 || e.isBlownAway || e.innocent || e.type === 'boss' || (e.pauseTimer || 0) <= 0 || e.kind === 'junkie') continue;
      if (!rectsOverlap(box, boundsOf(e)) || state.frame - (e.hazardHitAt ?? -1e9) < 30) continue;
      e.hazardHitAt = state.frame;
      pricked(ctx, e, c);
    }
  }
  // Belts (stopped, and quiet, while he's upstairs in the office)
  const upstairs = p.pos.x > COURSE.office.x1 - 60 && p.pos.y + p.height < COURSE.office.floor + 10;
  if (upstairs) { hz.crates = []; return; }
  COURSE.belts.forEach((b, i) => {
    hz.beltShift[i] = (hz.beltShift[i] + b.speed) % 1000;
    if (!near(state, b.x)) return;
    // Anything standing on it goes with it
    const onIt = (o: { pos: { x: number; y: number }; width: number; height: number }) => Math.abs(o.pos.y + o.height - b.y) < 3 && o.pos.x + o.width > b.x && o.pos.x < b.x + b.w;
    if (p.isGrounded && onIt(p)) p.pos.x += b.speed;
    for (const e of state.enemies) if (e.health > 0 && !e.isBlownAway && e.vel.y === 0 && onIt(e)) e.pos.x += b.speed;
    // Crates on at the far end
    // (the buzzer as the next one starts down the chute)
    if (hz.beltTimers[i] === CRATE_WARN + 1) playSound('alert', 0.6, 4);
    if (--hz.beltTimers[i] <= 0) {
      hz.beltTimers[i] = b.crateEvery + Math.floor(Math.random() * 40);
      // (one in two off a high line doesn't make it to the end: it tips off somewhere along it)
      const tipAt = b.high && Math.random() < 0.5 ? b.x + b.w * (0.2 + Math.random() * 0.6) : undefined;
      hz.crates.push({ x: feedX(i), y: b.y - CRATE, vx: b.speed, vy: 0, belt: i, falling: false, t: 0, tipAt, wobble: 0 });
      playSound('thud', 0.7);
    }
  });
  hz.crates = hz.crates.filter(cr => {
    cr.t++;
    const b = COURSE.belts[cr.belt];
    if (!cr.falling) {
      // (one that's going to tip: it gets there, stops, wobbles, the powder trickling out of it; and over it goes)
      const there = cr.tipAt !== undefined && (b.speed < 0 ? cr.x + CRATE / 2 <= cr.tipAt : cr.x + CRATE / 2 >= cr.tipAt);
      if (there) {
        cr.wobble = (cr.wobble ?? 0) + 1;
        if (cr.wobble === 1) playSound('clink', 0.6, -4);
        if (cr.wobble >= WOBBLE) { cr.falling = true; cr.vx = b.speed * 0.25; cr.vy = 0; playSound('whoosh', 0.6, -6); }
      } else cr.x += b.speed;
      if (!cr.falling && (cr.x + CRATE < b.x || cr.x > b.x + b.w)) { cr.falling = true; cr.vx = b.speed * 1.2; cr.vy = -1; }
    } else {
      const was = cr.y + CRATE;
      cr.vy += 0.6; cr.x += cr.vx; cr.y += cr.vy;
      // Coming down on one of them: that's him flattened (and it bursts on him)
      const under = state.enemies.find(e => canHit(e) && rectsOverlap({ x: cr.x, y: cr.y, w: CRATE, h: CRATE }, boundsOf(e)));
      if (under) { crush(ctx, under, CRUSH_DAMAGE, { x: cr.vx, y: -6 }); burst(ctx, cr); return false; }
      // Down on the floor, or onto a line under it: it bursts
      const onto = COURSE.belts.find((o, k) => k !== cr.belt && cr.x + CRATE > o.x && cr.x < o.x + o.w && was <= o.y && cr.y + CRATE >= o.y);
      if (onto) { cr.y = onto.y - CRATE; burst(ctx, cr); return false; }
      if (cr.y + CRATE >= 550) { cr.y = 550 - CRATE; burst(ctx, cr); return false; }
    }
    const box = { x: cr.x, y: cr.y, w: CRATE, h: CRATE };
    // Shot, or hit with a special: it bursts where it is
    const shot = state.projectiles.find(pr => pr.owner === 'player' && pr.health > 0 && !(pr.isSludge && pr.isLingering) && rectsOverlap(box, boundsOf(pr)));
    if (shot) { if (!shot.isBoulder) shot.health = 0; burst(ctx, cr); return false; }
    const hitting = p.isCharging || p.isSliding || p.isUppercutting || p.isDivekicking;
    if (rectsOverlap(box, boundsOf(p))) {
      if (hitting) { burst(ctx, cr); return false; }
      if (p.invincibilityTimer <= 0 && state.deathTimer <= 0) {
        hurtPlayer(ctx, CRATE_DAMAGE, 'conveyor_crate', { x: Math.sign(b.speed) * 8, y: -7 });
        burst(ctx, cr);
        return false;
      }
    }
    return true;
  });
};

const spines = (state: GameState, x: number, y: number) => {
  for (let i = 0; i < 8; i++) state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 7, y: -Math.random() * 6 }, life: 18, color: i % 2 ? '#65A30D' : '#FEF9C3', size: 2 + Math.random() * 2 });
};

const pricked = (ctx: FrameContext, e: Enemy, c: Cactus) => {
  const { state, fx } = ctx;
  // Shoved into one, that's it for him
  e.health = 0;
  spines(state, e.pos.x + e.width / 2, e.pos.y + e.height / 2);
  const away = e.pos.x + e.width / 2 < c.x ? -1 : 1;
  fx.blowAwayEnemy(e, { x: away * 9, y: -12 }, 'charge_kill', away);
  fx.spawnDamageNumber({ x: e.pos.x, y: e.pos.y - 30 }, 'PINCUSHIONED!', true, '#A3E635');
  state.player.killSatisfactionTimer = 60;
};

const burst = (ctx: FrameContext, cr: Crate) => {
  const { state, fx } = ctx;
  const cx = cr.x + CRATE / 2, cy = cr.y + CRATE / 2;
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: cx, y: cy }, vel: { x: (Math.random() - 0.5) * 8, y: -Math.random() * 6 }, life: 30, color: i % 3 ? '#A16207' : '#78350F', size: 3 + Math.random() * 4 });
  fx.spawnPowderExplosion({ x: cx, y: cy }, 14);
  playSound('crunch');
  // Come down off a high line: it goes up in a cloud of white, and knocks him about if he's in it
  if (cr.falling && COURSE.belts[cr.belt].high) powderBlast(ctx, cx, cr.y + CRATE);
};

/** A crate of product come down from up under the roof: a burst of white, a cloud of it hanging there after. */
const powderBlast = (ctx: FrameContext, x: number, y: number) => {
  const { state, fx } = ctx;
  fx.spawnPowderExplosion({ x, y: y - 10 }, 46);
  for (let i = 0; i < 12; i++) {
    const a = Math.PI + (i / 11) * Math.PI;
    state.particles.push({ pos: { x: x + Math.cos(a) * 10, y: y - 6 }, vel: { x: Math.cos(a) * (2 + Math.random() * 3), y: Math.sin(a) * (1 + Math.random() * 2) }, life: 70 + Math.random() * 40, color: i % 3 ? 'rgba(248, 250, 252, 0.8)' : 'rgba(226, 232, 240, 0.75)', size: 14 + Math.random() * 12 });
  }
  playSound('boom', 0.5, 6); playSound('whoosh', 0.7, -8);
  shakeScreen(state, 6, 3);
  // (it gets them too: knocked flying, or done for)
  for (const e of state.enemies) {
    if (!canHit(e)) continue;
    const eb = boundsOf(e), ex = eb.x + eb.w / 2 - x, ey = eb.y + eb.h - y;
    if (Math.abs(ex) < BLAST_R && ey > -BLAST_R - 40 && ey < 30) crush(ctx, e, BLAST_ENEMY_DAMAGE, { x: (ex < 0 ? -1 : 1) * 8, y: -9 });
  }
  const p = state.player, pb = boundsOf(p);
  const dx = pb.x + pb.w / 2 - x, dy = pb.y + pb.h - y;
  if (Math.abs(dx) < BLAST_R && dy > -BLAST_R - 40 && dy < 30 && p.invincibilityTimer <= 0 && state.deathTimer <= 0) {
    hurtPlayer(ctx, BLAST_DAMAGE, 'powder_blast', { x: (dx < 0 ? -1 : 1) * 7, y: -8 });
  }
};
