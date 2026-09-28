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

import { Enemy } from '../../types';
import { GRAVITY } from '../../constants';
import type { FrameContext } from '../context';
import { floorTopAt } from '../terrain';
import { mid, safeAhead, seesPlayer, holdingOff } from './kinds';

export const runHectorKindAI = (ctx: FrameContext, e: Enemy): boolean => {
  switch (e.kind) {
    case 'gator': return e.variant === 1 ? waterGator(ctx, e) : (landGator(ctx, e), false);
    case 'pelican': pelican(ctx, e); return true;
    case 'iguana': return iguana(ctx, e);
    case 'crab': crab(ctx, e); return false;
    case 'civilian': civilian(ctx, e); return false;
    case 'shark': shark(ctx, e); return true;
    default: return false;
  }
};

/** Ground kinds that hold their own position rather than stand on the floor (until a hit knocks them loose). */
export const selfPropelled = (e: Enemy) =>
  (e.kind === 'gator' && e.variant === 1) || (e.kind === 'iguana' && (e.aiState === 'idle' || e.aiState === 'drop' || !e.aiState));

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
  switch (e.aiState) {
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
      e.vel.x = safeAhead(ctx, e, e.facing) ? e.facing * 6.5 : 0;
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
      e.vel.x = safeAhead(ctx, e, e.facing!) ? e.facing! * 6.2 : 0;
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
      // Seen you: it's after you now
      if (Math.hypot(p.x - m.x, p.y - m.y) < 450 && player.health > 0) { e.aiState = 'hunt'; e.aiTimer = 0; }
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
