// The quakes, on the streets and the bridge:
//
//   quakes:   every so often the ground shakes (a banner and the magnitude go up):
//             the screen rattles, he's jostled about as he walks (never enough to
//             stop him), and things come down: flowerpots and bricks off the
//             windowsills, bits of the bridge off the towers and cables. Each has
//             a tell (it wobbles on the sill, a shadow grows under it). They get
//             bigger and more frequent the further in you get.
//   faults:   paved over at first. A quake splits one open when he gets close
//             (a crack, dust, a rumble, then a chasm): the first well out ahead
//             of him so he sees it happen, the later ones right under his feet if
//             he's rushing. Fall in and that's that.
//
// Falling stuff hurts the enemies too (but tries not to come down on them).
//
// And on Alcatraz, worse than ever: inside, the cell house's lamps and the
// plaster off the galleries come down (and the bricks out of the citadel's
// vaults), and stretches of gallery give way under you; outside, rocks come off
// the cliffs; and the floors, the yard and the cliff road split open.

import type { Block } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import { lastHurtWas } from '../../core/deathCause';
import { shakeScreen } from '../../core/state';
import { hurtPlayer } from '../../bosses/shared';
import { playSound } from '../../platform/audio';
import { rectsOverlap, boundsOf, isOnScreen } from '../../core/utils';
import { profileYAt, floorTopAt } from '../../core/terrain';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../../../constants';
import { COURSE, Fault } from './course';
import { looseOnStreets } from './streets';
import { mainCableY } from './bridge';

export type DebrisLook = 'pot' | 'brick' | 'ac' | 'rivet' | 'beam' | 'lamp' | 'plaster' | 'rock';
export interface Debris {
  x: number; y: number; vy: number; rot: number; spin: number;
  /** Where it'll land, and frames till it lets go (it wobbles on the sill first). */
  ground: number; hold: number;
  look: DebrisLook;
  /** Came off a windowsill (drawn sitting on it till it drops) rather than out of the sky. */
  sill: boolean;
  done: boolean;
}
/** Something sat where you can see it (a pot on a sill, a fitting on a cable) till a quake shakes it off. */
export interface Loose { x: number; y: number; look: DebrisLook; gone: boolean }
export interface FaultState {
  /** 0 paved; warning frames counting up; then open. */
  t: number;
  open: boolean;
  /** When it split open (for the opening animation). */
  openedAt?: number;
  block: Block;
}

export interface Quakes {
  /** Frames left of the current quake (0 = none), how long it lasts, and how big. */
  t: number;
  dur: number;
  mag: number;
  /** Frames till the next one comes along on its own. */
  next: number;
  /** The first one's scripted (it teaches the falling stuff). */
  first: boolean;
  debris: Debris[];
  /** Everything that can come down, where it's sat. */
  loose: Loose[];
  dropTimer: number;
  faults: FaultState[];
  /** Which way he's being jostled, and till when. */
  sway: number;
  swayT: number;
  /** A banner's up (EARTHQUAKE! M6.1): frames it's been up. */
  banner: number;
  lastCause: string;
  lastCauseAt: number;
  /** What it was that hit him last (for the death message). */
  lastLook?: DebrisLook;
  /** The fault he was last standing near (for a death down it). */
  nearFault: number;
  /** The island's galleries (and the gun port's ledge) that give way in a quake. */
  collapses: Collapse[];
}
/** A stretch of gallery that goes in a quake: steady; shaking (t counting up to FAULT_WARN); then down, falling away. */
export interface Collapse { ledge: number; block: Block; t: number; gone: boolean; fallY: number; vy: number }

/** A fault's warning (the crack spreading, dust going up) before it opens. */
export const FAULT_WARN = 55;
/** Debris: how long it wobbles before it falls, how hard it hits. */
export const DEBRIS_HOLD = 34;
/** On the bridge a piece swings on its snapped cable a good while before it drops (it's a longer way down to you). */
export const BRIDGE_HOLD = 50;
const DEBRIS_DAMAGE = 8, DEBRIS_ENEMY_DAMAGE = 40, DEBRIS_GRAVITY = 0.55;
/** The first quake comes when he's this far into the streets. */
const FIRST_QUAKE_AT = 780;
/** How hard he's jostled walking through a quake (px a frame at the biggest). */
const SWAY = 0.8;

export const createQuakes = (state: GameState, startedAt: number): Quakes => {
  const faults = COURSE.faults.map((f, i) => {
    const block: Block = { x: f.x, y: f.y, w: f.w, h: 1400, type: 'ground', hidden: true, tag: `fault-${i}` };
    state.blocks.push(block);
    return { t: 0, open: false, block };
  });
  const collapses: Collapse[] = [];
  COURSE.ledges.forEach((l, i) => {
    if (l.collapse === undefined) return;
    const block = state.blocks.find(b => b.tag === `eledge-${i}`);
    if (block) collapses.push({ ledge: i, block, t: 0, gone: false, fallY: 0, vy: 0 });
  });
  return {
    t: 0, dur: 1, mag: 0, next: 400, first: startedAt === 0, debris: [], dropTimer: 0, faults,
    loose: [...looseOnStreets(state.groundRuns).map(l => ({ ...l, gone: false })), ...looseOnBridge(), ...COURSE.island.loose.map(l => ({ ...l, gone: false }))],
    sway: 1, swayT: 0, banner: 0, lastCause: '', lastCauseAt: -999, nearFault: -1, collapses,
  };
};

/** How far along (0..1) he is through the quake country (the streets, then the bridge on top). */
const progress = (x: number) => {
  const s = COURSE.streets, b = COURSE.bridge;
  // (out on the island they're the biggest yet)
  if (onIsland(x)) return 0.85 + Math.min(1, (x - COURSE.cellblock.x1) / (COURSE.cellblock.x2 - COURSE.cellblock.x1)) * 0.2;
  if (x < s.x2) return Math.max(0, (x - s.x1) / (s.x2 - s.x1)) * 0.7;
  return 0.7 + Math.min(1, Math.max(0, (x - b.x1) / (b.x2 - b.x1))) * 0.3;
};

export const startQuake = (state: GameState, qk: Quakes, frames?: number) => {
  const px = state.player.pos.x;
  const k = progress(px);
  qk.mag = Math.round((4.8 + k * 3.2 + Math.random() * 0.4) * 10) / 10;
  qk.dur = frames ?? Math.round(150 + k * 110 + Math.random() * 60);
  qk.t = qk.dur;
  qk.banner = 0;
  qk.dropTimer = 20;
  playSound('rumble');
};

/** On Alcatraz (past the tour: the quakes are back on out there). */
export const onIsland = (x: number) => x >= COURSE.cellblock.x1 - 200;

/** 0..1: how hard it's shaking right now (eases in and out). */
export const quakeAmount = (qk: Quakes) => {
  if (qk.t <= 0) return 0;
  const done = qk.dur - qk.t;
  return Math.min(1, done / 25, qk.t / 30) * Math.min(1, (qk.mag - 4) / 4);
};

export const updateQuakes = (ctx: FrameContext, qk: Quakes, active: boolean) => {
  const { state } = ctx;
  const p = state.player;
  const px = p.pos.x + p.width / 2;
  if (qk.banner < 999) qk.banner++;
  // (a little cutscene, him out of it: whatever quake's going stops dead, and none starts till it's over)
  const hold = !!p.inCutscene;
  if (hold) qk.t = 0;
  if (active && !hold) {
    // The first one's scripted: once he's up the first hill
    if (qk.first && px > COURSE.streets.x1 + FIRST_QUAKE_AT) { qk.first = false; startQuake(state, qk, 220); qk.next = 600; }
    else if (!qk.first && qk.t <= 0 && --qk.next <= 0) {
      startQuake(state, qk);
      const k = progress(px);
      // (closer together the further in; but out on the bridge, with everything else going on, they give you a breather;
      // on the island, one after another)
      qk.next = Math.round((onIsland(px) ? 360 : px > COURSE.bridge.x1 - 200 ? 560 : 560 - k * 280) + Math.random() * 200);
    }
  }
  if (qk.t > 0) {
    qk.t--;
    const a = quakeAmount(qk);
    if (state.frame % 4 === 0) shakeScreen(state, 5, 2 + a * 6);
    // Jostled as he goes: a nudge one way, then the other (never enough to stop him)
    if (--qk.swayT <= 0) { qk.sway = Math.random() < 0.5 ? -1 : 1; qk.swayT = 25 + Math.floor(Math.random() * 30); }
    // (and never into a wall: a nudge that would put him into one doesn't happen, or he'd be shoved through it)
    if (p.isGrounded && !p.inCutscene && !p.isCharging && state.deathTimer <= 0) {
      const dx = qk.sway * SWAY * a * (0.6 + 0.4 * Math.sin(state.frame * 0.3));
      const box = { x: p.pos.x + dx, y: p.pos.y, w: p.width, h: p.height - 4 };
      if (!state.blocks.some(b => b.type !== 'pit' && !b.oneWay && rectsOverlap(box, b))) p.pos.x += dx;
    }
    // Stuff coming down
    if (active && --qk.dropTimer <= 0) {
      dropSomething(state, qk);
      const k = progress(px);
      qk.dropTimer = onIsland(px) ? Math.round(40 + Math.random() * 24) : px > COURSE.bridge.x1 - 200 ? Math.round(70 + Math.random() * 30) : Math.round(46 - k * 22 + Math.random() * 20);
    }
  }
  updateFaults(ctx, qk);
  updateCollapses(ctx, qk);
  updateDebris(ctx, qk);
};

/** How far below its middle each thing's bottom is (it sits on its ledge by it). */
export const PIECE_BOTTOM: Record<DebrisLook, number> = { pot: 8, ac: 12, brick: 6, rivet: 0, beam: 0, lamp: 0, plaster: 0, rock: 10 };
/** The island's pieces fall to whatever's under them (a gallery, the floor), not just the ground. */
const ISLAND_LOOKS: DebrisLook[] = ['lamp', 'plaster', 'rock'];
const landsOn = (state: GameState, l: Loose) => (onIsland(l.x) ? floorTopAt(state.blocks, l.x, l.y + 6, 0) ?? undefined : profileYAt(state.groundRuns, l.x));

/** How close to the edges of the view a loose thing can be and still be picked to come down (it's all in view, the whole way). */
const VIEW_MARGIN = 26;

/**
 * Shakes something loose, near him (mostly ahead), not on top of one of Ernie's lot. Only things that have
 * been sat there in plain sight all along (see streets.ts; and on the bridge, broken fittings hanging off the
 * suspender cables), and only one that's wholly on screen right now: nothing out of a clear sky, nothing from
 * off the top of the view. It wobbles a moment first, with a target on the ground under it.
 */
const dropSomething = (state: GameState, qk: Quakes) => {
  const p = state.player;
  const px = p.pos.x + p.width / 2;
  const aim = px + p.vel.x * 22;
  const clear = (x: number) => !state.enemies.some(e => e.health > 0 && !e.isBlownAway && Math.abs(e.pos.x + e.width / 2 - x) < e.width / 2 + 50);
  const cam = state.camera;
  let best: Loose | undefined, bestD = Infinity;
  for (const l of qk.loose) {
    if (l.gone) continue;
    if (l.x - 22 < cam.x + VIEW_MARGIN || l.x + 22 > cam.x + CANVAS_WIDTH - VIEW_MARGIN || l.y - 34 < cam.y + VIEW_MARGIN || l.y > cam.y + CANVAS_HEIGHT - 60) continue;
    if (l.x < px - 200 || l.x > px + 420) continue;
    const ground = landsOn(state, l);
    if (ground === undefined || ground <= l.y || !clear(l.x) || qk.faults.some(f => f.open && l.x > f.block.x - 20 && l.x < f.block.x + f.block.w + 20)) continue;
    const d = Math.abs(l.x - aim) + Math.random() * 160;
    if (d < bestD) { bestD = d; best = l; }
  }
  if (!best) return;
  best.gone = true;
  const steel = best.look === 'rivet' || best.look === 'beam';
  qk.debris.push({ x: best.x, y: best.y - PIECE_BOTTOM[best.look], vy: 0, rot: 0, spin: (Math.random() - 0.5) * 0.3, ground: landsOn(state, best)!, hold: steel ? BRIDGE_HOLD : DEBRIS_HOLD, look: best.look, sill: !steel && !ISLAND_LOOKS.includes(best.look), done: false });
};

/** Broken fittings hanging off the bridge's suspender cables, in view from the deck, waiting for a quake to shake them off. */
const looseOnBridge = () => {
  const B = COURSE.bridge, out: Loose[] = [];
  for (let x = B.x1 + 250; x < B.exit - 250; x += 200 + Math.floor(((x * 7) % 5)) * 50) {
    const cx = Math.round(x / 50) * 50;
    if (COURSE.spans.some(s => cx > s.x - 60 && cx < s.x + s.w + 60) || B.towers.some(t => Math.abs(cx - t) < 80)) continue;
    // (clamped to a suspender cable: only where the cable comes down from the main one above it, not out in the open air mid-span)
    const y = GROUND_Y - 250 - ((cx / 50) % 3) * 30;
    if (mainCableY(cx) > y - 60) continue;
    out.push({ x: cx, y, look: (cx / 50) % 2 ? 'rivet' : 'beam', gone: false });
  }
  return out;
};

const updateDebris = (ctx: FrameContext, qk: Quakes) => {
  const { state, fx } = ctx;
  const p = state.player;
  for (const d of qk.debris) {
    if (d.hold > 0) { d.hold--; continue; }
    d.vy = Math.min(16, d.vy + DEBRIS_GRAVITY);
    d.y += d.vy;
    d.rot += d.spin;
    const box = { x: d.x - 14, y: d.y - 14, w: 28, h: 28 };
    if (!d.done && rectsOverlap(box, boundsOf(p)) && p.invincibilityTimer <= 0) {
      d.done = true;
      qk.lastCause = 'falling_debris'; qk.lastCauseAt = state.frame; qk.lastLook = d.look;
      // (on the island: the prison coming down on him, or the cliff)
      const source = d.look === 'rivet' || d.look === 'beam' ? 'falling_steel' : d.look === 'rock' ? 'rockslide' : onIsland(d.x) ? 'cave_in' : 'falling_debris';
      hurtPlayer(ctx, DEBRIS_DAMAGE, source, { x: (p.pos.x + p.width / 2 < d.x ? -1 : 1) * 3, y: -5 });
      fx.spawnDamageNumber({ x: p.pos.x - 20, y: p.pos.y - 30 }, { pot: 'POTTED!', ac: 'AIR CONDITIONED!', brick: 'BONK!', rivet: 'RIVETED!', beam: 'GIRDERED!', lamp: 'LIGHTS OUT!', plaster: 'CAVE-IN!', rock: 'ROCKSLIDE!' }[d.look], true, '#FDE047');
      smash(state, d);
    }
    for (const e of state.enemies) {
      if (d.done || e.health <= 0 || e.isBlownAway || e.type === 'boss' || !rectsOverlap(box, boundsOf(e))) continue;
      d.done = true;
      e.health -= DEBRIS_ENEMY_DAMAGE;
      fx.spawnDamageNumber(e.pos, DEBRIS_ENEMY_DAMAGE, true);
      if (e.health <= 0) { e.isBlownAway = true; e.vel = { x: 0, y: 4 }; fx.spawnDeathShower(e.pos, 0, 1.2); fx.spawnKillCallout(e, 'squished'); fx.spawnPickup(e.pos); }
      smash(state, d);
    }
    if (!d.done && d.y >= d.ground - 6) {
      d.done = true;
      smash(state, d);
      if (isOnScreen(state.camera, { pos: { x: d.x - 20, y: d.ground - 20 }, width: 40, height: 20 })) playSound('crack');
    }
  }
  qk.debris = qk.debris.filter(d => !d.done && d.y < state.camera.y + 1400);
};

const smash = (state: GameState, d: Debris) => {
  const colors: Record<DebrisLook, string[]> = {
    pot: ['#C2410C', '#9A3412', '#166534', '#4D7C0F', '#57331F'],
    brick: ['#991B1B', '#7F1D1D', '#A8A29E'],
    ac: ['#D4D4D8', '#71717A', '#27272A'],
    rivet: ['#B91C1C', '#7F1D1D', '#52525B'],
    beam: ['#C0392B', '#8E2A20', '#3F3F46'],
    lamp: ['#E5E7EB', '#FEF9C3', '#52525B'],
    plaster: ['#D6D3D1', '#A8A29E', '#78716C'],
    rock: ['#78716C', '#57534E', '#44403C'],
  };
  const c = colors[d.look];
  for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: d.x, y: Math.min(d.y, d.ground - 4) }, vel: { x: (Math.random() - 0.5) * 7, y: -1 - Math.random() * 5 }, life: 24 + Math.random() * 16, color: c[i % c.length], size: 3 + Math.random() * 4 });
};

// ---------------------------------------------------------------------------
// Faults
// ---------------------------------------------------------------------------

const updateFaults = (ctx: FrameContext, qk: Quakes) => {
  const { state } = ctx;
  const p = state.player;
  const px = p.pos.x + p.width / 2;
  qk.nearFault = -1;
  COURSE.faults.forEach((f: Fault, i) => {
    const fs = qk.faults[i];
    if (Math.abs(px - (f.x + f.w / 2)) < f.w / 2 + 120) qk.nearFault = i;
    if (fs.open) return;
    if (fs.t === 0) {
      // He's close: it goes (with a quake, if there isn't one on)
      if (px > f.x - f.trigger && px < f.x + f.w) {
        fs.t = 1;
        if (qk.t < FAULT_WARN + 40) startQuake(state, qk, Math.max(FAULT_WARN + 80, qk.t));
        playSound('rumble');
      }
      return;
    }
    fs.t++;
    if (state.frame % 3 === 0) state.particles.push({ pos: { x: f.x + Math.random() * f.w, y: f.y }, vel: { x: (Math.random() - 0.5) * 1.5, y: -1 - Math.random() * 2 }, life: 30, color: Math.random() < 0.5 ? '#A8A29E' : '#78716C', size: 3 + Math.random() * 5 });
    if (fs.t >= FAULT_WARN) {
      // Open: the street drops away
      fs.open = true;
      fs.openedAt = state.frame;
      state.blocks = state.blocks.filter(b => b !== fs.block);
      shakeScreen(state, 20, 8);
      playSound('crash');
      for (let k = 0; k < 26; k++) state.particles.push({ pos: { x: f.x + Math.random() * f.w, y: f.y + 4 }, vel: { x: (Math.random() - 0.5) * 3, y: 1 + Math.random() * 5 }, life: 40, color: k % 3 ? '#3B3A3E' : '#57534E', size: 5 + Math.random() * 7 });
      if (isOnScreen(state.camera, { pos: { x: f.x, y: f.y - 40 }, width: f.w, height: 40 })) ctx.fx.spawnDamageNumber({ x: f.x + f.w / 2 - 40, y: f.y - 70 }, 'FAULT LINE!', true, '#F97316');
    }
  });
};

/** A fault that's cracking or open, as the draw wants it: 0 paved, 0..1 cracking, 1 open. */
export const faultAmount = (qk: Quakes, i: number) => (qk.faults[i].open ? 1 : qk.faults[i].t > 0 ? qk.faults[i].t / FAULT_WARN : 0);

/** A death message if the quake did it (or a fault swallowed him). */
export const quakeDeathMessage = (state: GameState, qk: Quakes): string | undefined => {
  const pick = (l: string[]) => l[Math.floor(Math.random() * l.length)];
  if (state.player.health > 0 && qk.nearFault >= 0) return pick(['SWALLOWED BY THE EARTH', 'MIND THE GAP', 'FAULT LINE: YOURS', 'THE GROUND ATE YOU']);
  if (qk.lastCause === 'falling_debris' && lastHurtWas(state, qk.lastCauseAt)) {
    switch (qk.lastLook) {
      case 'lamp': return pick(['LIGHTS OUT', 'THE PRISON FELL ON YOU', 'SOLITARY CONFINEMENT']);
      case 'plaster': return pick(['CAVE-IN', 'BURIED IN ALCATRAZ', 'THE CEILING WON']);
      case 'rock': return pick(['ROCKSLIDE', 'THE ROCK ROCKED YOU', 'DEATH BY LANDSCAPE']);
      case 'pot': return pick(['KILLED BY A FLOWERPOT', 'HOUSEPLANT HOMICIDE', 'DEATH BY PETUNIA']);
      case 'ac': return pick(['AIR CONDITIONED', 'CHILLED TO DEATH']);
      case 'brick': return onIsland(state.player.pos.x) ? pick(['BURIED IN THE DUNGEON', 'THE FORT FELL ON YOU']) : pick(['DEATH FROM ABOVE', 'ONE BRICK SHORT OF A HOUSE']);
      default: return pick(['RIVETED', 'THE BRIDGE FELL ON YOU', 'STRUCTURAL FAILURE']);
    }
  }
  return undefined;
};

/** Is the view on quake country right now (for the banner)? */
export const inQuakeCountry = (state: GameState) => (state.camera.x + CANVAS_WIDTH / 2 < COURSE.bridge.x2 + 200 && state.camera.x + CANVAS_WIDTH / 2 > COURSE.streets.x1 - 400) || onIsland(state.camera.x + CANVAS_WIDTH / 2);

// ---------------------------------------------------------------------------
// The island's galleries, coming down
// ---------------------------------------------------------------------------

const updateCollapses = (ctx: FrameContext, qk: Quakes) => {
  const { state } = ctx;
  const p = state.player;
  const px = p.pos.x + p.width / 2;
  for (const c of qk.collapses) {
    const l = COURSE.ledges[c.ledge];
    if (c.gone) {
      // What's left of it, going down
      if (c.fallY < 1400) { c.vy = Math.min(16, c.vy + DEBRIS_GRAVITY); c.fallY += c.vy; }
      continue;
    }
    if (c.t === 0) {
      // He's close (or on it): it goes, with a quake if there isn't one on
      if (px > l.x - (l.collapse ?? 0) && px < l.x + l.w + 40 && Math.abs(p.pos.y + p.height - l.y) < 300) {
        c.t = 1;
        if (qk.t < FAULT_WARN + 40) startQuake(state, qk, Math.max(FAULT_WARN + 80, qk.t));
        playSound('crack');
      }
      continue;
    }
    c.t++;
    if (state.frame % 4 === 0) state.particles.push({ pos: { x: l.x + Math.random() * l.w, y: l.y + 8 }, vel: { x: (Math.random() - 0.5) * 1.2, y: 1 + Math.random() * 2 }, life: 30, color: Math.random() < 0.5 ? '#A8A29E' : '#78716C', size: 2 + Math.random() * 4 });
    if (c.t >= FAULT_WARN) {
      // Down it goes, and anyone on it
      c.gone = true;
      state.blocks = state.blocks.filter(b => b !== c.block);
      shakeScreen(state, 16, 7);
      playSound('crash');
      for (let k = 0; k < 20; k++) state.particles.push({ pos: { x: l.x + Math.random() * l.w, y: l.y + 4 }, vel: { x: (Math.random() - 0.5) * 3, y: 1 + Math.random() * 4 }, life: 40, color: k % 3 ? '#52525B' : '#A8A29E', size: 4 + Math.random() * 6 });
      if (isOnScreen(state.camera, { pos: { x: l.x, y: l.y - 40 }, width: l.w, height: 40 })) ctx.fx.spawnDamageNumber({ x: l.x + l.w / 2 - 40, y: l.y - 60 }, 'GIVING WAY!', true, '#F97316');
    }
  }
};

/** A gallery that's going (0 steady .. 0..1 shaking), or gone (how far what's left of it has fallen). */
export const collapseState = (qk: Quakes, ledge: number) => {
  const c = qk.collapses.find(k => k.ledge === ledge);
  return !c ? { k: 0, gone: false, fallY: 0 } : { k: c.gone ? 1 : c.t / FAULT_WARN, gone: c.gone, fallY: c.fallY };
};
