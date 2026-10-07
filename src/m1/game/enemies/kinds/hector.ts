// Hector's stage: Florida wildlife, the beachgoers, and the sharks in the storm.
// (His goons and the cops ride on the generic shooter/charger/shield logic, like
// Artie's; see makeKindEnemy.)
//
//   gator:    on land it lies still, jaws shut, until you're close; then it
//             hisses, lunges in a short fast burst and snaps. In the water
//             (variant 1) it waits under the surface and breaches up at you
//             as you jump over; get in the water with it and it comes for you,
//             fast, and doesn't let up till you're out.
//   pelican:  cruises high, then swoops down to head height and skims along
//             the ground at you in a long shallow U, and climbs away.
//   iguana:   clings to the top of a palm until you walk underneath, drops
//             (they fall out of the trees when it's cold and wet), then
//             scurries at you and whips its tail.
//   crab:     tiny, sidesteps back and forth and scuttles at you pincers up.
//             Low enough that a standing shot goes over it: duck, slide or stomp.
//   civilian: a beachgoer doing their thing. When somebody gets shot (or the
//             storm hits) they all run for it.
//   shark:    in the hurricane, circling; once it's seen you it follows you up
//             the storm, circling you, and every so often comes in in a biting lunge.
//
// Returns true when it moved itself (flyers, gators in the water, iguanas in trees).

import { Enemy } from '../../../types';
import { GRAVITY } from '../../../constants';
import type { FrameContext } from '../../core/context';
import { floorTopAt } from '../../core/terrain';
import { mid, safeAhead, seesPlayer, holdingOff } from './index';

export const runHectorKindAI = (ctx: FrameContext, e: Enemy): boolean => {
  switch (e.kind) {
    case 'gator': return e.variant === 1 ? waterGator(ctx, e) : (landGator(ctx, e), false);
    case 'pelican': case 'seagull': case 'grackle': case 'pigeon': pelican(ctx, e); return true;
    case 'iguana': return iguana(ctx, e);
    case 'crab': case 'scorpion': crab(ctx, e); return false;
    case 'civilian': case 'visitor': civilian(ctx, e); return false;
    case 'shark': shark(ctx, e); return true;
    default: return false;
  }
};

/** Ground kinds that hold their own position rather than stand on the floor (until a hit knocks them loose). */
export const selfPropelled = (e: Enemy) =>
  e.kind === 'magmafish' || e.kind === 'jetskier' || e.kind === 'lowrider' ||
  // (a sludgeling floating in the muck, waiting: it keeps itself there till it goes for him)
  (e.kind === 'sludgeling' && (!e.aiState || e.aiState === 'idle')) || (e.kind === 'gator' && e.variant === 1) || (e.kind === 'iguana' && (e.aiState === 'idle' || e.aiState === 'drop' || !e.aiState));

const dirTo = (e: Enemy, x: number) => (x < mid(e).x ? -1 : 1) as 1 | -1;

// ---------------------------------------------------------------------------

const GATOR_LUNGE = 10.5, GATOR_LUNGE_FRAMES = 16, GATOR_REACH = 180;

const landGator = (ctx: FrameContext, e: Enemy) => {
  const { player } = ctx.state;
  e.aiTimer = (e.aiTimer || 0) + 1;
  switch (e.aiState) {
    case 'idle':
    default: {
      // Basking, dead still, facing you; ambles back to its spot if it's been moved
      e.facing = dirTo(e, mid(player).x);
      const home = e.homeX ?? e.pos.x;
      e.vel.x = Math.abs(e.pos.x - home) > 40 && safeAhead(ctx, e, Math.sign(home - e.pos.x)) ? Math.sign(home - e.pos.x) * 0.8 : 0;
      if (seesPlayer(ctx, e, GATOR_REACH, 70) && !holdingOff(ctx.state) && e.aiTimer > 30) { e.aiState = 'hiss'; e.aiTimer = 0; }
      break;
    }
    case 'hiss':
      // Jaws wide, a low hiss: you've got a beat to get out of the way (or jump it)
      e.vel.x = 0;
      e.facing = dirTo(e, mid(player).x);
      if (e.aiTimer > 22) { e.aiState = 'lunge'; e.aiTimer = 0; }
      break;
    case 'lunge':
      if (!safeAhead(ctx, e, e.facing!)) { e.vel.x = 0; e.aiState = 'snap'; e.aiTimer = 0; break; }
      e.vel.x = e.facing! * GATOR_LUNGE;
      if (e.aiTimer > GATOR_LUNGE_FRAMES) { e.aiState = 'snap'; e.aiTimer = 0; }
      break;
    case 'snap':
      e.vel.x *= 0.7;
      if (e.aiTimer > 12) { e.aiState = 'rest'; e.aiTimer = 0; }
      break;
    case 'rest':
      // Tail thrashing, catching its breath
      e.vel.x = 0;
      if (e.aiTimer > 55) { e.aiState = 'idle'; e.aiTimer = 0; }
      break;
  }
};

/** Waits under the water (its home is the surface); breaches up at you as you come over, then flops back in. */
const waterGator = (ctx: FrameContext, e: Enemy): boolean => {
  const { player } = ctx.state;
  // (it was placed with its feet at the waterline)
  const waterline = (e.homeY ?? e.pos.y) + e.height;
  e.aiTimer = (e.aiTimer || 0) + 1;
  // A goon in the water: that's dinner, and Meathead's forgotten
  if (e.aiState !== 'feed' && e.aiState !== 'chomp' && e.aiState !== 'breach' && e.aiState !== 'slide' && !e.aiState?.startsWith('ashore')) {
    const prey = findPrey(ctx, e, waterline);
    if (prey) { e.prey = prey.id; e.aiState = 'feed'; e.aiTimer = 0; }
  }
  switch (e.aiState) {
    case 'feed':
    case 'chomp':
      feed(ctx, e, waterline);
      break;
    case 'idle':
    default: {
      // Just the eyes above the water, drifting a little
      e.pos.y = waterline + 6 - e.height;
      e.pos.x = (e.homeX ?? e.pos.x) + Math.sin((ctx.state.frame + (e.homeX || 0)) * 0.02) * 20;
      e.facing = dirTo(e, mid(player).x);
      const dx = Math.abs(mid(player).x - mid(e).x);
      if (gatorCanHunt(e, player)) { e.aiState = 'hunt'; e.aiTimer = 0; break; }
      // Jump over it without dealing with it and it comes up out of the water at you. Bait it (a hop at the
      // edge), and while it's gone back under to recover you can clear it
      if (!player.isGrounded && !player.swimming && dx < GATOR_BREACH_REACH && e.aiTimer > GATOR_BREACH_REST) {
        // (not held off while he's over the gap: going for him over the gap is the whole point of it)
        e.aiState = 'breach'; e.aiTimer = 0;
        e.vel = { x: Math.max(-7, Math.min(7, (mid(player).x - mid(e).x) / 22)), y: -15.5 };
      }
      break;
    }
    case 'breach': {
      // Up out of the water, jaws open, then back down (onto a dock or the shore, if that's where it comes down)
      const feet = e.pos.y + e.height;
      e.vel.y += GRAVITY * 0.8;
      e.pos.x += e.vel.x;
      e.pos.y += e.vel.y;
      const land = e.vel.y > 0 ? landUnder(ctx, e, feet, waterline) : null;
      if (land !== null && e.pos.y + e.height >= land) { e.pos.y = land - e.height; e.aiState = 'ashore'; e.aiTimer = 0; e.vel = { x: 0, y: 0 }; break; }
      if (e.vel.y > 0 && e.pos.y + e.height > waterline + 6) { e.aiState = 'idle'; e.aiTimer = 0; e.vel = { x: 0, y: 0 }; }
      break;
    }
    case 'ashore':
    case 'ashore-hiss':
    case 'ashore-lunge': {
      // Landed out of the water: it's a land gator now. It goes for him if he's close (hiss, then a lunge),
      // otherwise it waddles back to the edge and slides in
      const home = e.homeX ?? e.pos.x;
      const pdx = mid(player).x - mid(e).x;
      const near = Math.abs(pdx) < GATOR_REACH && Math.abs(mid(player).y - mid(e).y) < 60 && !player.swimming && player.health > 0;
      let dir = Math.sign(home - e.pos.x) || 1, speed = GATOR_WADDLE;
      if (e.aiState === 'ashore' && near && e.aiTimer > 30) { e.aiState = 'ashore-hiss'; e.aiTimer = 0; }
      if (e.aiState === 'ashore-hiss') {
        dir = Math.sign(pdx) || 1; speed = 0;
        if (e.aiTimer > 24) { e.aiState = 'ashore-lunge'; e.aiTimer = 0; e.aiX = dir; }
      } else if (e.aiState === 'ashore-lunge') {
        dir = e.aiX || 1; speed = GATOR_LUNGE;
        if (e.aiTimer > GATOR_LUNGE_FRAMES) { e.aiState = 'ashore'; e.aiTimer = 0; }
      }
      e.facing = dir as 1 | -1;
      const nx = e.pos.x + dir * speed;
      const land = landUnder(ctx, { ...e, pos: { x: nx, y: e.pos.y } }, e.pos.y + e.height, waterline);
      e.pos.x = nx;
      // Off the edge: back in the water it goes
      if (land === null) { e.aiState = 'slide'; e.aiTimer = 0; break; }
      e.pos.y = land - e.height;
      break;
    }
    case 'slide': {
      // Off the edge and back into the water, then home under the surface
      const home = e.homeX ?? e.pos.x;
      const back = home - e.pos.x, down = waterline + 6 - e.height - e.pos.y;
      e.pos.x += Math.sign(back) * Math.min(Math.abs(back), 2.5);
      e.pos.y += Math.sign(down) * Math.min(Math.abs(down), 4);
      if (Math.abs(back) < 3 && Math.abs(down) < 3) { e.aiState = 'idle'; e.aiTimer = 0; }
      break;
    }
    case 'hunt': {
      // He's in the water with it: it goes under and comes straight for him, faster than he can swim
      const home = e.homeX ?? e.pos.x;
      if (!gatorCanHunt(e, player)) {
        // Back to its spot, eyes above the water again
        const back = home - e.pos.x, up = waterline + 6 - e.height - e.pos.y;
        e.pos.x += Math.sign(back) * Math.min(Math.abs(back), 2.5);
        e.pos.y += Math.sign(up) * Math.min(Math.abs(up), 2.5);
        if (Math.abs(back) < 3 && Math.abs(up) < 3) { e.aiState = 'idle'; e.aiTimer = 0; }
        break;
      }
      const t = mid(player), m = mid(e);
      const dx = t.x - m.x, dy = t.y - m.y, len = Math.hypot(dx, dy) || 1;
      // (a burst every so often: a snap)
      const speed = e.aiTimer % 90 < 20 ? 6.5 : 3.8;
      e.vel.x += ((dx / len) * speed - e.vel.x) * 0.15;
      e.vel.y += ((dy / len) * speed - e.vel.y) * 0.15;
      e.pos.x = Math.max(home - GATOR_RANGE, Math.min(home + GATOR_RANGE, e.pos.x + e.vel.x));
      e.pos.y = Math.max(waterline - e.height + 6, Math.min(waterline + 190, e.pos.y + e.vel.y));
      e.facing = dx < 0 ? -1 : 1;
      break;
    }
  }
  return true;
};

// ---------------------------------------------------------------------------
// Feeding time: knock one of Hector's goons into the water with a gator in it and the gator loses all interest
// in Meathead, goes for him, and (with a second gator taking the other side, if there is one) drags him under in a
// death roll. The water goes red (the stage sees to that).
// ---------------------------------------------------------------------------

const GATOR_FEED_SPEED = 7.5;
/** How long it takes them to finish him. */
export const GATOR_CHOMP_FRAMES = 80;
/** The goons (people) a gator will go for: not the bystanders, not other wildlife. */
const edible = (o: Enemy) => o.kind === 'tourist' || o.kind === 'bouncer' || o.kind === 'surfer' || o.kind === 'cop' || o.kind === 'riotcop';
/** Up to this many gators on one goon (one each side). */
const MAX_DINERS = 2;

const findPrey = (ctx: FrameContext, e: Enemy, waterline: number) => {
  const home = e.homeX ?? e.pos.x;
  let best: Enemy | undefined, bestD = Infinity;
  for (const o of ctx.state.enemies) {
    if (!edible(o) || o.health <= 0 || o.isBlownAway || mid(o).y < waterline + 4) continue;
    if (Math.abs(mid(o).x - home) > GATOR_RANGE + 60) continue;
    if (ctx.state.enemies.filter(g => g !== e && g.kind === 'gator' && g.prey === o.id && g.health > 0).length >= MAX_DINERS) continue;
    const d = Math.abs(mid(o).x - mid(e).x);
    if (d < bestD) { bestD = d; best = o; }
  }
  return best;
};

const feed = (ctx: FrameContext, e: Enemy, waterline: number) => {
  const { state, fx } = ctx;
  const prey = state.enemies.find(o => o.id === e.prey && o.health > 0 && !o.isBlownAway);
  if (!prey) { e.prey = undefined; e.aiState = 'hunt'; e.aiTimer = 0; return; }
  // Its side of him: whichever it's coming from, unless the other gator's already got that side
  const pm = mid(prey);
  let side = mid(e).x < pm.x ? -1 : 1;
  const other = state.enemies.find(g => g !== e && g.kind === 'gator' && g.prey === prey.id && g.health > 0);
  if (other) {
    const otherSide = other.aiState === 'chomp' || other.id < e.id ? (mid(other).x < pm.x ? -1 : 1) : 0;
    if (otherSide === side) side = -side;
  }
  const tx = pm.x + side * (prey.width / 2 + e.width / 2 - 14) - e.width / 2;
  const ty = Math.max(waterline - e.height + 6, pm.y - e.height / 2);
  e.facing = (-side) as 1 | -1;
  // He's not going anywhere (or doing anything) with gators on him
  prey.pauseTimer = Math.max(prey.pauseTimer || 0, 12);
  prey.melee = undefined;
  prey.shootTimer = 0;
  if (e.aiState === 'feed') {
    const dx = tx - e.pos.x, dy = ty - e.pos.y, len = Math.hypot(dx, dy) || 1;
    const step = Math.min(len, GATOR_FEED_SPEED);
    e.pos.x += (dx / len) * step; e.pos.y += (dy / len) * step;
    if (len < 14) { e.aiState = 'chomp'; e.aiTimer = 0; }
    return;
  }
  // The death roll: clamped on, thrashing, him jerked about between them, blood in the water
  e.pos.x = tx + Math.sin(e.aiTimer * 0.9) * 3;
  e.pos.y = ty + Math.cos(e.aiTimer * 0.7) * 3;
  prey.vel.x = 0;
  prey.pos.x += Math.sin(e.aiTimer * 1.3) * 1.5;
  if (state.frame % 2 === 0) {
    for (let k = 0; k < 2; k++) state.particles.push({ pos: { x: pm.x + (Math.random() - 0.5) * 30, y: pm.y + (Math.random() - 0.5) * 30 }, vel: { x: (Math.random() - 0.5) * 2, y: -0.5 - Math.random() }, life: 40 + Math.random() * 30, color: Math.random() < 0.5 ? '#B91C1C' : '#7F1D1D', size: 5 + Math.random() * 8 });
  }
  if (e.aiTimer === 20) fx.spawnDamageNumber({ x: pm.x - 40, y: waterline - 60 }, other ? 'DOUBLE CHOMP!' : 'CHOMP!', true, '#DC2626');
  if (e.aiTimer >= GATOR_CHOMP_FRAMES) {
    // Gone. Nothing left but what's floating up
    prey.health = 0;
    for (let k = 0; k < 30; k++) state.particles.push({ pos: { x: pm.x, y: pm.y }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 60 + Math.random() * 40, color: k % 3 ? '#991B1B' : '#450A0A', size: 5 + Math.random() * 9 });
    fx.spawnDamageNumber({ x: pm.x - 50, y: waterline - 80 }, ['GATOR BAIT!', 'DEATH ROLL!', 'SWAMP SNACK!'][Math.floor(Math.random() * 3)], true, '#DC2626');
    fx.spawnPickup({ x: pm.x, y: waterline - 30 });
    state.player.killSatisfactionTimer = 60;
    for (const g of state.enemies) if (g.kind === 'gator' && g.prey === prey.id) { g.prey = undefined; g.aiState = 'hunt'; g.aiTimer = 0; }
  }
};

/** Something to stand on under it that's above the water (a dock, the shore), or null over the water. */
const landUnder = (ctx: FrameContext, e: Enemy, feetY: number, waterline: number) => {
  const top = floorTopAt(ctx.state.blocks, mid(e).x, feetY, 4);
  return top !== null && top < waterline - 4 ? top : null;
};
/** How fast a water gator waddles back to the water when it's ended up on land. */
const GATOR_WADDLE = 1.8;
/** How close you have to jump for a water gator to go for you, and how long it stays under after a go. */
const GATOR_BREACH_REACH = 190, GATOR_BREACH_REST = 100;
/** How far a water gator will leave its spot chasing you. */
const GATOR_RANGE = 380;
const gatorCanHunt = (e: Enemy, player: FrameContext['state']['player']) =>
  !!player.swimming && Math.abs(mid(player).x - (e.homeX ?? e.pos.x)) < GATOR_RANGE + 60;

// ---------------------------------------------------------------------------

const PELICAN_SWOOP = 7.5;

const pelican = (ctx: FrameContext, e: Enemy) => {
  const { player } = ctx.state;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const homeY = e.homeY ?? e.pos.y;
  switch (e.aiState) {
    case 'idle':
    default: {
      // Gliding back and forth up high
      const homeX = e.homeX ?? e.pos.x;
      if (e.facing === undefined) e.facing = -1;
      if (Math.abs(e.pos.x - homeX) > 140) e.facing = (e.pos.x > homeX ? -1 : 1);
      e.vel.x = e.facing * 2;
      e.vel.y = (homeY + Math.sin(ctx.state.frame * 0.05 + homeX) * 8 - e.pos.y) * 0.1;
      const dx = mid(player).x - mid(e).x;
      if (e.aiTimer > 70 && Math.abs(dx) < 460 && Math.abs(dx) > 120 && !holdingOff(ctx.state) && player.health > 0) {
        e.aiState = 'swoop'; e.aiTimer = 0; e.facing = dx < 0 ? -1 : 1;
        e.aiY = player.pos.y + 14; // skims along at his head height
      }
      break;
    }
    case 'swoop': {
      // Down to his head height, a long flat skim, then up and away
      e.vel.x = e.facing! * PELICAN_SWOOP;
      const target = e.aiTimer < 70 ? e.aiY! : homeY;
      e.vel.y = (target - e.pos.y) * (e.aiTimer < 70 ? 0.09 : 0.05);
      if (e.aiTimer > 120) { e.aiState = 'idle'; e.aiTimer = 0; e.homeX = e.pos.x; }
      break;
    }
  }
  e.pos.x += e.vel.x;
  e.pos.y += e.vel.y;
  // Never through the ground
  const floor = floorTopAt(ctx.state.blocks, mid(e).x, e.pos.y + e.height, 0);
  if (floor !== null && e.pos.y + e.height > floor - 4) e.pos.y = floor - 4 - e.height;
};

// ---------------------------------------------------------------------------

const iguana = (ctx: FrameContext, e: Enemy): boolean => {
  const { player } = ctx.state;
  e.aiTimer = (e.aiTimer || 0) + 1;
  switch (e.aiState) {
    case 'idle':
    default: {
      // Clinging to the palm's crown as it whips about (the stage moves it with the tree); once you're close,
      // a gust rips it loose and flings it at you
      e.facing = dirTo(e, mid(player).x);
      const dx = mid(player).x - mid(e).x;
      if (Math.abs(dx) < 260 && !holdingOff(ctx.state)) {
        e.aiState = 'drop'; e.aiTimer = 0;
        e.vel = { x: Math.sign(dx) * Math.min(8, Math.abs(dx) / 22 + 2), y: -6 };
      }
      return true;
    }
    case 'drop': {
      // Flung out of the tree, spinning, legs out
      e.vel.y = Math.min(16, e.vel.y + GRAVITY * 0.8);
      e.pos.x += e.vel.x;
      e.pos.y += e.vel.y;
      const floor = floorTopAt(ctx.state.blocks, mid(e).x, e.pos.y + e.height - e.vel.y, 0);
      if (floor !== null && e.pos.y + e.height >= floor) { e.pos.y = floor - e.height; e.vel.y = 0; e.aiState = 'scurry'; e.aiTimer = 0; }
      return true;
    }
    case 'scurry':
      e.facing = dirTo(e, mid(player).x);
      e.vel.x = safeAhead(ctx, e, e.facing, 20) ? e.facing * 6.5 : 0;
      if (Math.abs(mid(player).x - mid(e).x) < 40 || e.aiTimer > 70) { e.aiState = 'whip'; e.aiTimer = 0; }
      return false;
    case 'whip':
      e.vel.x *= 0.8;
      if (e.aiTimer > 24) { e.aiState = 'scurry'; e.aiTimer = 0; }
      return false;
  }
};

// ---------------------------------------------------------------------------

const crab = (ctx: FrameContext, e: Enemy) => {
  const { player } = ctx.state;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const home = e.homeX ?? e.pos.x;
  switch (e.aiState) {
    case 'idle':
    default:
      if (e.facing === undefined) e.facing = 1;
      if (Math.abs(e.pos.x - home) > 60 || !safeAhead(ctx, e, e.facing)) e.facing = (e.pos.x > home ? -1 : 1);
      e.vel.x = e.facing * 1.6;
      if (seesPlayer(ctx, e, 220, 60) && !holdingOff(ctx.state)) { e.aiState = 'scuttle'; e.aiTimer = 0; }
      break;
    case 'scuttle': {
      const dir = dirTo(e, mid(player).x);
      e.vel.x = safeAhead(ctx, e, dir) ? dir * 4.5 : 0;
      if (Math.abs(mid(player).x - mid(e).x) < 30) { e.aiState = 'pinch'; e.aiTimer = 0; }
      if (!seesPlayer(ctx, e, 320, 90)) { e.aiState = 'idle'; e.homeX = e.pos.x; }
      break;
    }
    case 'pinch':
      e.vel.x = 0;
      if (e.aiTimer > 18) { e.aiState = 'scuttle'; e.aiTimer = 0; }
      break;
  }
};

// ---------------------------------------------------------------------------

/**
 * Beachgoers. What they're doing is their variant (0 sunbathing, 1 jogging,
 * 2 volleyball, 3 metal-detecting, 4 ice cream man). The stage switches them all
 * to 'flee' (a shooting) or 'shelter' (the storm); either way they run for it
 * and are gone once they're well off the screen.
 */
const civilian = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const home = e.homeX ?? e.pos.x;
  switch (e.aiState) {
    case 'idle':
    default:
      if (e.variant === 1) {
        // Jogging up and down the beach
        if (e.facing === undefined) e.facing = 1;
        if (Math.abs(e.pos.x - home) > 170 || !safeAhead(ctx, e, e.facing)) e.facing = (e.pos.x > home ? -1 : 1);
        e.vel.x = e.facing * 2.4;
      } else if (e.variant === 3) {
        // Sweeping a metal detector, a step at a time
        if (e.facing === undefined) e.facing = 1;
        if (Math.abs(e.pos.x - home) > 90) e.facing = (e.pos.x > home ? -1 : 1);
        e.vel.x = e.aiTimer % 60 < 30 ? e.facing * 0.6 : 0;
      } else if (e.variant === 2) {
        // Volleyball: a jump for the ball now and then
        e.vel.x = 0;
        if (e.aiTimer % 70 === 0 && e.vel.y === 0) e.vel.y = -7;
      } else {
        e.vel.x = 0;
      }
      break;
    case 'flee':
    case 'shelter': {
      // Scrambling up (sunbathers take a moment), then running flat out, arms up; flee from him, shelter to the nearest edge
      if (e.aiTimer < (e.variant === 0 ? 14 : 4)) { e.vel.x = 0; break; }
      // A sunbather gets up off the towel (their box goes from lying down to standing)
      if (e.height < 40) { const feet = e.pos.y + e.height, cx = mid(e).x; e.width = 34; e.height = 62; e.pos = { x: cx - 17, y: feet - 62 }; }
      if (e.aiState === 'flee' || e.facing === undefined || e.aiTimer === (e.variant === 0 ? 14 : 4)) {
        e.facing = e.aiState === 'flee' ? -dirTo(e, mid(state.player).x) as 1 | -1 : (e.aiX !== undefined ? dirTo(e, e.aiX) : e.facing ?? 1);
      }
      e.vel.x = safeAhead(ctx, e, e.facing!, 20) ? e.facing! * 6.2 : 0;
      if (!e.vel.x && e.vel.y === 0) e.vel.y = -9; // hop whatever's in the way
      // Well off the screen (or through the door they were running for): gone
      const offscreen = e.pos.x + e.width < state.camera.x - 140 || e.pos.x > state.camera.x + 800 + 140;
      const inside = e.aiX !== undefined && Math.abs(mid(e).x - e.aiX) < 12;
      if (offscreen || inside) { e.aiState = 'gone'; e.health = 0; }
      break;
    }
  }
};

// ---------------------------------------------------------------------------

const shark = (ctx: FrameContext, e: Enemy) => {
  const { player } = ctx.state;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const homeX = e.homeX ?? e.pos.x, homeY = e.homeY ?? e.pos.y;
  switch (e.aiState) {
    case 'idle':
    default: {
      // Swimming laps through the air around its spot
      const t = (ctx.state.frame + homeX) * 0.025;
      const tx = homeX + Math.cos(t) * 150, ty = homeY + Math.sin(t * 2) * 30;
      e.vel.x = (tx - e.pos.x) * 0.05; e.vel.y = (ty - e.pos.y) * 0.05;
      e.facing = (e.vel.x < 0 ? -1 : 1);
      const p = mid(player), m = mid(e);
      // You've climbed up to its level (wherever round the storm you are): it's after you now. One at a time,
      // though: the rest keep circling till the one that's after you is dealt with
      const busy = ctx.state.enemies.some(o => o !== e && o.kind === 'shark' && o.health > 0 && !o.isBlownAway && (o.aiState === 'hunt' || o.aiState === 'bite'));
      if (Math.abs(p.y - m.y) < 280 && player.health > 0 && !busy) { e.aiState = 'hunt'; e.aiTimer = 0; }
      break;
    }
    case 'hunt': {
      // Circling round you wherever you go, closing in, then a lunge
      const p = mid(player), m = mid(e);
      const a = ctx.state.frame * 0.03 + homeX * 0.01;
      const tx = p.x + Math.cos(a) * 190 - e.width / 2, ty = p.y + Math.sin(a) * 80 - e.height / 2;
      e.vel.x += ((tx - e.pos.x) * 0.05 - e.vel.x) * 0.12;
      e.vel.y += ((ty - e.pos.y) * 0.05 - e.vel.y) * 0.12;
      const sp = Math.hypot(e.vel.x, e.vel.y);
      if (sp > 7.5) { e.vel.x *= 7.5 / sp; e.vel.y *= 7.5 / sp; }
      e.facing = (e.vel.x < 0 ? -1 : 1);
      if (e.aiTimer > 110 && Math.hypot(p.x - m.x, p.y - m.y) < 320 && !holdingOff(ctx.state) && player.health > 0) {
        e.aiState = 'bite'; e.aiTimer = 0; e.aiX = p.x; e.aiY = p.y;
        const len = Math.hypot(p.x - m.x, p.y - m.y) || 1;
        e.vel = { x: ((p.x - m.x) / len) * 9, y: ((p.y - m.y) / len) * 9 };
        e.facing = (e.vel.x < 0 ? -1 : 1);
      }
      break;
    }
    case 'bite':
      // A straight lunge through where you were, jaws snapping, then it comes round again
      if (e.aiTimer > 40) { e.aiState = 'hunt'; e.aiTimer = 0; }
      break;
    case 'return':
      e.vel.x = (homeX - e.pos.x) * 0.04; e.vel.y = (homeY - e.pos.y) * 0.04;
      e.facing = (e.vel.x < 0 ? -1 : 1);
      if (Math.hypot(homeX - e.pos.x, homeY - e.pos.y) < 30) { e.aiState = 'idle'; e.aiTimer = 0; }
      break;
  }
  e.pos.x += e.vel.x;
  e.pos.y += e.vel.y;
};
