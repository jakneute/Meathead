// The chase: out across the field on the stolen chopper, Dirty Dan's machine
// gun in his hands (a hose of lead: no aiming it, but over ground rising and
// falling like this, with this many of them, it doesn't matter), and everybody
// in the field after him, more and more of them (the view pulling back to take
// them all in as it goes on). The union in their pickups (a man stood in the bed throwing whatever's
// in it: lunch pails, thermoses, hard hats), the rangers in their cruisers
// (shooting out of the window), and the rest of the bikers on their choppers
// (they come right up alongside and swing a chain: more dangerous, but one ram
// does for them). A car or a truck takes two big hits (a ram, or coming down on
// it from above): the first leaves it smoking, the second finishes it. The
// driver slumps onto the horn, and it goes careering off the road into the
// field and into a derrick, which goes up. The field gets more and more of a
// ruin as it goes on.
//
// It isn't timed: wreck enough of them and it's over. Until then it goes round
// and round (the road's the same lap over and over: he's quietly moved back a
// lap, and everything with him, every time he's ridden one).
//
// Oil slicks on the road: ride over one and the bike spins out from under his
// control for a moment (jump them).

import type { Enemy, EnemyKind } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { shakeScreen } from '../../core/state';
import { groundLineAt, groundBlocks } from '../../core/terrain';
import type { GroundRun } from '../../core/terrain';
import { playSound, playGlassShatterSound } from '../../platform/audio';
import { makeKindEnemy, mid } from '../../enemies/kinds';
import { hurtPlayer } from '../../bosses/shared';
import { rectsOverlap, boundsOf } from '../../core/utils';
import { CANVAS_WIDTH, GROUND_Y } from '../../../constants';
import { COURSE, CP, LAP, placeOf } from './course';
import { MOTO_BASE, MOTO_FAST, MOTO_SLOW, mountMoto } from './moto';
import { Talk, queueLines } from './script';

export type ChasePhase = 'waiting' | 'riding' | 'won' | 'done';

/** A car or truck that's been done for: on fire, the driver slumped on the horn, careering off the screen (the way it was going). */
export interface Wreck { kind: EnemyKind; paint: number; x: number; y: number; dir: 1 | -1; rel: number; t: number }
/**
 * ...and then away out across the field in the distance, still burning, horn still going, into something out there
 * that goes up. Where it is and where it's headed are along the distant layer (it moves slower than the road: FAR_PAR).
 */
export interface FarWreck { kind: EnemyKind; paint: number; l0: number; l1: number; target: number; t: number; dur: number }
/** What's out across the field in the distance: derricks, storage tanks, a refinery column, flare stacks. Standing, going up (a fuse first if it's caught from the one next to it), or burning. */
export interface FarThing { look: 'derrick' | 'tank' | 'column' | 'flare'; state: 'standing' | 'fuse' | 'blowing' | 'burning'; t: number }
/** A biker who's been rammed off: him flying one way, the chopper cartwheeling down the road. */
export interface Thrown { x: number; y: number; vx: number; vy: number; rot: number; vr: number; what: 'rider' | 'bike'; life: number; paint: number }
/** A derrick out in the field beside the road (one per slot along a lap): standing, going up, or a burning wreck. */
export interface Derrick { state: 'standing' | 'blowing' | 'burning'; t: number }
export interface RoadSlick { x: number; w: number }

export interface Chase {
  phase: ChasePhase;
  t: number;
  kills: number;
  wrecks: Wreck[];
  farWrecks: FarWreck[];
  far: FarThing[];
  /** How far he's come, all told (the laps unwrapped): the distance moves past slower than the road. */
  odo: number;
  /** Where the distance's horizon sits on the screen: always just above the highest bit of road in view, so the road never hides it. */
  farBase: number;
  thrown: Thrown[];
  derricks: Derrick[];
  slicks: RoadSlick[];
  slickTimer: number;
  /** Frames left of a spin-out (on a slick): the bike's out of his hands. */
  spin: number;
  spawnTimer: number;
  spawned: number;
  /** Where the camera was last frame (the shots out of the cruisers go along with the screen). */
  camX: number;
  hint: string;
  hintT: number;
  hinted: Set<string>;
  /** How many laps he's done (the road moving back under him each time). */
  laps: number;
  /** How far the view's pulled back (1: not at all), easing toward where it should be for how far through it is. */
  zoom: number;
  /** The jumps: where the road's out (a trench cut across it), and the ground it had there, to put back once he's past. */
  gaps: RoadGap[];
  /** Which of the jumps (by how many he'd wrecked) have come up. */
  gapsDone: number;
}

/** Where the road's out: a trench across it to jump (it comes up at so many wrecks, called out well before it's there). */
export interface RoadGap { x1: number; x2: number; runs: GroundRun[]; pieces: GroundRun[]; passed: boolean }

/** How many to wreck to win it. */
export const KILLS_NEEDED = 44;
/** The derricks out in the field: how many to a lap, how far apart, how far back off the road they stand. */
export const DERRICKS_PER_LAP = 8, DERRICK_GAP = LAP / DERRICKS_PER_LAP, DERRICK_BACK = 10;
/** A big hit's worth (a ram, or a dive onto it): a car or truck takes two of these. */
const BIG_HIT = 130;
/** What comes after him, in turn (round and round). */
const ORDER: EnemyKind[] = ['chopper', 'pickup', 'chopper', 'cruiser', 'pickup', 'chopper', 'cruiser', 'chopper', 'pickup', 'cruiser'];
/** How many can be on him at once (more and more as it goes on: far more than a handgun could ever deal with). */
const MAX_ON = (kills: number) => Math.min(6, 4 + Math.floor(kills / 14));
/** ...and of those, how many cars and trucks at most (the rest are bikers). */
const MAX_CARS = 3;
/** How far the view pulls back by the end (it's all of them coming at him). */
const ZOOM_MIN = 0.72;
const SPIN_FRAMES = 46;
/** The jumps: at how many wrecked each one comes up, how wide it is, how far ahead of him it's cut (it's called out from then on). */
export const GAP_AT = [8, 18, 28, 38], GAP_W = 230, GAP_AHEAD = 1900;
/** What anything they do takes off him: only a chip each time, but there's nothing to get it back with till it's over. */
const CHIP = 4;
/** How far ahead of the view a slick's put down (it's called out from then on). */
export const SLICK_AHEAD = 700;
/** The distance: how much slower than the road it goes by, how far apart the things out there stand, how many before it repeats. */
export const FAR_PAR = 0.3, FAR_GAP = 250, FAR_N = 13, FAR_SPAN = FAR_GAP * FAR_N;
const FAR_LOOKS: FarThing['look'][] = ['derrick', 'tank', 'derrick', 'column', 'tank', 'flare', 'derrick', 'tank', 'column', 'derrick', 'tank', 'flare', 'tank'];
/** Where something out in the distance is across the screen right now (it wraps round). */
export const farScreenX = (ch: Chase, i: number) => ((((i * FAR_GAP + 140 - ch.odo * FAR_PAR) % FAR_SPAN) + FAR_SPAN) % FAR_SPAN) - 200;
/** Where a wreck out in the distance is across the screen right now. */
export const farWreckX = (ch: Chase, w: FarWreck) => { const k = Math.min(1, w.t / w.dur); const e = k * k * (3 - 2 * k); return w.l0 + (w.l1 - w.l0) * e - ch.odo * FAR_PAR; };

export const createChase = (startedAt: number): Chase => ({
  phase: startedAt > CP.CHASE ? 'done' : 'waiting', t: 0, kills: 0, wrecks: [], farWrecks: [], far: FAR_LOOKS.map(look => ({ look, state: 'standing' as const, t: 0 })), odo: 0, farBase: 400, thrown: [],
  derricks: Array.from({ length: DERRICKS_PER_LAP }, () => ({ state: 'standing' as const, t: 0 })),
  slicks: [], slickTimer: 360, spin: 0, spawnTimer: 60, spawned: 0, camX: NaN, hint: '', hintT: 0, hinted: new Set(), laps: 0, zoom: 1,
  gaps: [], gapsDone: 0,
});

/** The view, pulled back: about where he rides (so he stays put on the screen and it opens out round him). Null at no zoom. */
export const chaseZoom = (state: GameState, ch: Chase) =>
  ch.zoom < 0.999 && (ch.phase === 'riding' || ch.phase === 'won') ? { scale: ch.zoom, x: state.camera.x + 250, y: state.camera.y + 550 } : null;

/** The world the pulled-back view shows, left to right. */
export const chaseView = (state: GameState, ch: Chase) => {
  const s = ch.phase === 'riding' || ch.phase === 'won' ? ch.zoom : 1;
  const ax = state.camera.x + 250;
  return { x1: ax - 250 / s, x2: ax + (CANVAS_WIDTH - 250) / s };
};

/** Onto the road on the bike (straight in from the break room, or back at the start of it after dying). */
export const startChase = (state: GameState, ch: Chase) => {
  ch.phase = 'riding'; ch.t = 0;
  // (topped right up at the start of it: that's all he's getting)
  state.player.health = state.player.maxHealth;
  mountMoto(state);
  state.checkpoint = Math.max(state.checkpoint, CP.CHASE);
};

/** A derrick's slot's world x, in the lap at (or just ahead of) x. */
export const derrickX = (slot: number, lap: number) => COURSE.chase.x1 + lap * LAP + (slot + 0.5) * DERRICK_GAP;

export const updateChase = (ctx: FrameContext, ch: Chase, talk: Talk, controls: Controls, onWon: () => void): Controls => {
  const { state } = ctx;
  const p = state.player;
  ch.t++;
  if (ch.hintT > 0 && ++ch.hintT > 200) ch.hintT = 0;
  updateWrecks(ctx, ch);
  updateThrown(ch);
  for (const d of ch.derricks) d.t++;
  if (ch.phase !== 'riding' && ch.phase !== 'won') return controls;
  if (!p.moto) mountMoto(state);
  p.currentWeapon = 'LMG';
  // (the view pulls back as it goes on, to take them all in)
  const wantZoom = 1 - (1 - ZOOM_MIN) * Math.min(1, ch.kills / (KILLS_NEEDED * 0.8));
  ch.zoom += (wantZoom - ch.zoom) * 0.01;
  // The cruisers' shots go along with the screen (they fly the way they were fired, at the same speed across it)
  const camDx = Number.isNaN(ch.camX) ? 0 : state.camera.x - ch.camX;
  ch.camX = state.camera.x;
  if (camDx) for (const q of state.projectiles) if (q.owner === 'enemy' && q.shooterKind === 'cruiser') q.pos.x += camDx;
  // Spun out on a slick: out of his hands for a moment
  if (ch.spin > 0) {
    ch.spin--;
    controls = { ...NO_CONTROLS };
    p.isCharging = false; p.isUppercutting = false;
    p.skiSpeed = MOTO_SLOW - 1;
  } else {
    p.skiSpeed = controls.right ? MOTO_FAST : controls.left ? MOTO_SLOW : MOTO_BASE;
  }
  if (ch.phase === 'riding') {
    spawn(state, ch);
    slicks(ctx, ch);
    jumps(ctx, ch);
    teach(state, ch);
  }
  // Anything left far behind is gone (it gave up)
  const v = chaseView(state, ch);
  // (only the chase's own: everything waiting further on, out back of the field office, stays)
  state.enemies = state.enemies.filter(e => !isChaseVehicle(e.kind) || (e.pos.x > v.x1 - 600 && e.pos.x < v.x2 + 1000));
  loop(state, ch);
  // Won: the last of them drop away, a moment, and it's over
  if (ch.phase === 'riding' && ch.kills >= KILLS_NEEDED) {
    ch.phase = 'won'; ch.t = 0;
    for (const e of state.enemies) if (isChaseVehicle(e.kind)) e.aiState = 'flee';
    ctx.fx.spawnDamageNumber({ x: p.pos.x - 60, y: p.pos.y - 80 }, 'FIELD CLEARED!', true, '#FDE047');
    queueLines(state, talk, [{ who: 'meathead', text: "THAT'S THE WHOLE MOTOR POOL. WHERE'S THE BOSS?" }], 10);
  }
  if (ch.phase === 'won' && ch.t === 150) onWon();
  return controls;
};

export const isChaseVehicle = (kind?: EnemyKind) => kind === 'pickup' || kind === 'cruiser' || kind === 'chopper';

// ---------------------------------------------------------------------------

/** Round and round: past the second lap, everything goes back a lap (the road's the same, so nobody sees it). */
const loop = (state: GameState, ch: Chase) => {
  const p = state.player;
  if (p.pos.x < COURSE.chase.x1 + 2 * LAP) return;
  const d = -LAP;
  ch.laps++;
  // (the road's put back where a jump was, and cut again a lap back)
  for (const g of ch.gaps) restoreGap(state, g);
  p.pos.x += d;
  state.camera.x += d;
  if (state.cameraOverride) state.cameraOverride.x += d;
  ch.camX += d;
  // (not Oscar, sat waiting in his room: he stays put)
  for (const e of state.enemies) { if (e.type === 'boss' || placeOf(e.pos.x) !== 'chase') continue; e.pos.x += d; if (e.homeX !== undefined && !isChaseVehicle(e.kind)) e.homeX += d; }
  for (const q of state.projectiles) q.pos.x += d;
  for (const q of state.pickups) q.pos.x += d;
  for (const q of state.particles) q.pos.x += d;
  for (const s of state.flameSegments) s.x += d;
  for (const w of ch.wrecks) w.x += d;
  for (const t of ch.thrown) t.x += d;
  for (const s of ch.slicks) s.x += d;
  for (const g of ch.gaps) { g.x1 += d; g.x2 += d; cutGap(state, g); }
};

// ---------------------------------------------------------------------------

/**
 * The jumps. At so many wrecked, the road's out a way ahead (a trench cut across it, full of crude): called out from
 * the moment it's there, well before it's on the screen. Once he's past it the road's put back.
 */
const jumps = (ctx: FrameContext, ch: Chase) => {
  const { state, fx } = ctx;
  const p = state.player;
  if (ch.gapsDone < GAP_AT.length && ch.kills >= GAP_AT[ch.gapsDone] && !ch.gaps.length) {
    ch.gapsDone++;
    // (on the flat or a gentle bit of road, not the steep of a hill)
    let x1 = p.pos.x + GAP_AHEAD;
    for (let k = 0; k < 20; k++) {
      const a = groundLineAt(state.groundRuns, x1 - 60), b = groundLineAt(state.groundRuns, x1 + GAP_W + 60);
      if (a !== Infinity && b !== Infinity && Math.abs(a - b) < 40) break;
      x1 += 80;
    }
    const g: RoadGap = { x1, x2: x1 + GAP_W, runs: [], pieces: [], passed: false };
    cutGap(state, g);
    ch.gaps.push(g);
    playSound('siren');
    fx.spawnDamageNumber({ x: p.pos.x - 40, y: p.pos.y - 90 }, 'ROAD OUT AHEAD!', true, '#F97316');
  }
  for (const g of ch.gaps) {
    // Over it and down on the other side: the road's put back, and something to keep him going
    if (!g.passed && p.pos.x > g.x2 + 40 && p.isGrounded) {
      g.passed = true;
      fx.spawnDamageNumber({ x: p.pos.x - 30, y: p.pos.y - 70 }, 'CLEARED IT!', true, '#4ADE80');
    }
  }
  const v = chaseView(state, ch);
  for (const g of ch.gaps) if (g.passed && g.x2 < v.x1 - 300) restoreGap(state, g);
  ch.gaps = ch.gaps.filter(g => !(g.passed && g.x2 < v.x1 - 300));
};

/** Takes the road out from x1 to x2: the ground either side of it stops there. */
const cutGap = (state: GameState, g: RoadGap) => {
  g.runs = state.groundRuns.filter(r => r.x1 < g.x2 && r.x2 > g.x1 && r.x1 >= COURSE.chase.x1 - 10 && r.x2 <= COURSE.chase.x2 + 10);
  if (!g.runs.length) return;
  const yAt = (r: GroundRun, x: number) => r.y1 + (r.y2 - r.y1) * ((x - r.x1) / (r.x2 - r.x1));
  g.pieces = [];
  for (const r of g.runs) {
    if (r.x1 < g.x1) g.pieces.push({ ...r, x2: g.x1, y2: yAt(r, g.x1) });
    if (r.x2 > g.x2) g.pieces.push({ ...r, x1: g.x2, y1: yAt(r, g.x2) });
  }
  swapGround(state, g.runs, g.pieces);
};

/** Puts the road back. */
const restoreGap = (state: GameState, g: RoadGap) => {
  if (!g.runs.length) return;
  swapGround(state, g.pieces, g.runs);
  g.runs = []; g.pieces = [];
};

/** Swaps some of the ground for other ground: its profile, and the blocks you stand on. */
const swapGround = (state: GameState, out: GroundRun[], into: GroundRun[]) => {
  const x1 = Math.min(...out.map(r => r.x1)), x2 = Math.max(...out.map(r => r.x2));
  state.groundRuns = [...state.groundRuns.filter(r => !out.includes(r)), ...into].sort((a, b) => a.x1 - b.x1);
  state.blocks = [...state.blocks.filter(b => !(b.type === 'ground' && !b.tag && b.x >= x1 - 1 && b.x + b.w <= x2 + 1)), ...groundBlocks(into)];
};

/** The jump coming up, if there is one (for calling it out): how far off it is, and whether it's on the screen yet. */
export const gapAhead = (state: GameState, ch: Chase) => {
  const g = ch.gaps.find(q => !q.passed);
  if (!g) return null;
  const v = chaseView(state, ch);
  return { dist: g.x1 - (state.player.pos.x + state.player.width), onScreen: g.x1 < v.x2 - 40, g };
};

/** The next slick coming up that isn't on the screen yet (for calling it out). */
export const slickAhead = (state: GameState, ch: Chase) => {
  const v = chaseView(state, ch);
  const s = ch.slicks.filter(q => q.x - q.w / 2 > state.player.pos.x).sort((a, b) => a.x - b.x)[0];
  if (!s) return null;
  return { dist: s.x - s.w / 2 - (state.player.pos.x + state.player.width), onScreen: s.x - s.w / 2 < v.x2 - 40 };
};


// ---------------------------------------------------------------------------

const spawn = (state: GameState, ch: Chase) => {
  const on = state.enemies.filter(e => isChaseVehicle(e.kind) && e.health > 0).length;
  if (--ch.spawnTimer > 0 || on >= MAX_ON(ch.kills)) return;
  ch.spawnTimer = Math.max(40, 95 - ch.kills * 1.5) + Math.floor(Math.random() * 35);
  let kind = ORDER[ch.spawned++ % ORDER.length];
  // (he waited out the union's break: they respect that, and they're not in this. Nobody takes their turn: fewer after him, and it takes longer)
  if (kind === 'pickup' && state.stageMemo.unionRespect) return;
  // (never more than a few cars and trucks at once: a biker instead)
  if (kind !== 'chopper' && state.enemies.filter(e => (e.kind === 'pickup' || e.kind === 'cruiser') && e.health > 0).length >= MAX_CARS) kind = 'chopper';
  const behind = Math.random() < 0.55;
  const v = chaseView(state, ch);
  const x = behind ? v.x1 - 170 : v.x2 + 170;
  const e = makeKindEnemy(kind, x, groundLineAt(state.groundRuns, x));
  e.variant = Math.floor(Math.random() * 4);
  e.homeX = Math.floor(Math.random() * 1000);
  e.aiState = 'come'; e.aiTimer = 0;
  e.vel.x = state.player.vel.x + (behind ? 4 : -2);
  e.shootTimer = Math.floor(Math.random() * 60);
  // Where it wants to be: anywhere round him, ahead or behind (wider as the view pulls back); a biker comes alongside
  const reach = (v.x2 - v.x1) * 0.42;
  e.aiX = kind === 'chopper' ? 0 : (behind ? -1 : 1) * (170 + Math.random() * reach);
  state.enemies.push(e);
  if (kind === 'cruiser' && Math.random() < 0.5) playSound('siren');
};

/** What each vehicle's AI does (the stage runs them: see index.ts). Returns false once it's gone. */
export const updateChaseVehicle = (ctx: FrameContext, e: Enemy, ch: Chase | null): boolean => {
  const { state } = ctx;
  const p = state.player;
  e.aiTimer = (e.aiTimer || 0) + 1;
  e.shootTimer = (e.shootTimer || 0) + 1;
  if (e.hitCooldown && e.hitCooldown > 0) e.hitCooldown--;
  const pace = Math.max(4, p.vel.x);
  const pm = mid(p), em = mid(e);
  let target = pm.x + (e.aiX ?? 0);
  // A biker: alongside him, a swing of the chain, then dropping back to come again
  if (e.kind === 'chopper') {
    if (e.aiState === 'back') { target = pm.x - 230; if (e.aiTimer > 80) { e.aiState = 'come'; e.aiTimer = 0; } }
    else if (e.aiState === 'swing') { target = pm.x - 10; }
    else { target = pm.x - 18; if (Math.abs(em.x - pm.x) < 70 && e.aiTimer > 30 && p.health > 0) { e.aiState = 'swing'; e.aiTimer = 0; } }
  }
  if (e.aiState === 'flee') e.vel.x += (pace - 6 - e.vel.x) * 0.05;
  else {
    const dx = target - em.x;
    const keep = e.kind === 'chopper' ? 3.2 : 2.2;
    e.vel.x += (pace + Math.max(-keep, Math.min(keep, dx * 0.04)) - e.vel.x) * (e.aiState === 'come' ? 0.06 : 0.12);
    // (a wreck in waiting weaves about the road)
    if (e.health <= e.maxHealth / 2 && e.kind !== 'chopper') e.vel.x += Math.sin(state.frame * 0.1 + (e.homeX || 0)) * 0.3;
  }
  e.pos.x += e.vel.x;
  const road = groundLineAt(state.groundRuns, em.x);
  if (road !== Infinity) e.pos.y = road - e.height;
  // (tipped with the ground it's on)
  const ahead = groundLineAt(state.groundRuns, em.x + 40), behindY = groundLineAt(state.groundRuns, em.x - 40);
  if (ahead !== Infinity && behindY !== Infinity) e.rotation = Math.atan2(ahead - behindY, 80);
  e.facing = 1;
  if (e.aiState !== 'flee' && e.aiState !== 'come' && e.kind !== 'chopper' && Math.abs(target - em.x) > 400) e.aiState = 'come';
  if (e.aiState === 'come' && e.kind !== 'chopper' && Math.abs(target - em.x) < 60) { e.aiState = 'hold'; e.aiTimer = 0; }
  // Their attacks
  if (e.aiState !== 'flee' && p.health > 0) {
    if (e.kind === 'pickup') truckThrow(state, e);
    if (e.kind === 'cruiser') cruiserShoot(state, e);
    if (e.kind === 'chopper' && e.aiState === 'swing') {
      if (e.aiTimer === 14 && Math.abs(mid(e).x - pm.x) < 80 && Math.abs(mid(e).y - pm.y) < 70 && p.invincibilityTimer <= 0 && !p.inCutscene) {
        hurtPlayer(ctx, CHIP, 'chopper', { x: -3, y: -6 });
      }
      if (e.aiTimer > 26) { e.aiState = 'back'; e.aiTimer = 0; }
    }
  }
  // Him hitting it: a ram, a dive onto it, a leap up into it
  const attacking = p.isCharging || p.isDivekicking || p.isUppercutting;
  if (rectsOverlap(boundsOf(p), boundsOf(e))) {
    if (attacking && e.hitByMove !== p.moveId) {
      e.hitByMove = p.moveId;
      bigHit(ctx, e, ch);
      // (bounced up off it from a dive: he can chain them)
      if (p.isDivekicking) { p.vel.y = -11; p.isDivekicking = false; p.powerLocked = false; }
      else if (p.isCharging) p.vel.x -= 2;
    }
    // (running into them doesn't hurt: there's road enough for all of them round him. It's what they throw, shoot and
    // swing that does)
  }
  if (e.health <= 0) { finish(ctx, e, ch); return false; }
  // Engine smoke
  if (state.frame % 5 === 0 && e.kind !== 'chopper') state.particles.push({ pos: { x: e.pos.x + 4, y: e.pos.y + e.height - 12 }, vel: { x: -1.2 + e.vel.x * 0.6, y: -0.5 }, life: 20, color: 'rgba(120, 113, 108, 0.5)', size: 4 + Math.random() * 3 });
  return e.aiState !== 'flee' || (e.pos.x > state.camera.x - 400);
};

/** A ram or a dive onto it: a biker's done; a car or truck's stove in the first time, done the second. */
const bigHit = (ctx: FrameContext, e: Enemy, ch: Chase | null) => {
  const { state, fx } = ctx;
  e.health -= e.kind === 'chopper' ? e.health : BIG_HIT;
  shakeScreen(state, 12, 6);
  playGlassShatterSound();
  for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: mid(e).x, y: mid(e).y }, vel: { x: (Math.random() - 0.5) * 9, y: -2 - Math.random() * 6 }, life: 26, color: ['#F8FAFC', '#93C5FD', '#9CA3AF', '#FDE047'][i % 4], size: 3 + Math.random() * 4 });
  if (e.health > 0) fx.spawnDamageNumber({ x: e.pos.x + 30, y: e.pos.y - 30 }, 'SMOKING!', true, '#F97316');
  void ch;
};

/** A shot or a big hit's finished it. */
const finish = (ctx: FrameContext, e: Enemy, ch: Chase | null) => {
  const { state, fx } = ctx;
  if (!ch) return;
  if (ch.phase === 'riding') ch.kills++;
  fx.speakVulgarity('charge_kill');
  state.player.killSatisfactionTimer = 60;
  if (e.kind === 'chopper') {
    // The biker one way, the chopper cartwheeling down the road
    ch.thrown.push({ x: mid(e).x, y: e.pos.y + 10, vx: e.vel.x + 3, vy: -13, rot: 0, vr: 0.3, what: 'rider', life: 120, paint: e.homeX || 0 });
    ch.thrown.push({ x: mid(e).x, y: e.pos.y + e.height, vx: e.vel.x * 0.8, vy: -7, rot: 0, vr: 0.22, what: 'bike', life: 140, paint: e.homeX || 0 });
    fx.spawnKillCallout(e, 'crash');
    fx.spawnDeathShower(e.pos, 1, 1);
    return;
  }
  for (let i = 0; i < 18; i++) state.particles.push({ pos: { x: mid(e).x, y: mid(e).y }, vel: { x: e.vel.x * 0.6 + (Math.random() - 0.5) * 8, y: -2 - Math.random() * 6 }, life: 24 + Math.random() * 16, color: ['#FFFFFF', '#FDE047', '#F97316', '#DC2626', '#292524'][i % 5], size: 6 + Math.random() * 12 });
  // A car or a truck: on fire, the driver slumped on the horn, off it goes the way it was headed and out of sight
  const dir: 1 | -1 = mid(e).x >= mid(state.player).x ? 1 : -1;
  ch.wrecks.push({ kind: e.kind!, paint: e.homeX || 0, x: mid(e).x, y: e.pos.y + e.height, dir, rel: 0, t: 0 });
  fx.spawnKillCallout(e, 'truck');
};

const updateWrecks = (ctx: FrameContext, ch: Chase) => {
  const { state } = ctx;
  const p = state.player;
  const pace = Math.max(4, p.vel.x);
  const v = chaseView(state, ch);
  ch.odo = state.camera.x - COURSE.chase.x1 + ch.laps * LAP;
  // (the horizon out there sits just above the highest road on the screen, wherever the hills have it)
  const s = ch.phase === 'riding' || ch.phase === 'won' ? ch.zoom : 1;
  let top = Infinity;
  for (let x = v.x1; x <= v.x2; x += 40) { const g = groundLineAt(state.groundRuns, x); if (g !== Infinity) top = Math.min(top, g); }
  const topSy = top === Infinity ? 470 : s * (top - state.camera.y - 550) + 550;
  const want = Math.min(470, topSy - 12);
  ch.farBase += (want - ch.farBase) * 0.12;
  // Careering off, burning, faster and faster (away ahead of him, or dropping back behind)
  for (const w of ch.wrecks) {
    w.t++;
    w.rel += 0.3;
    w.x += pace + w.dir * w.rel;
    const g = groundLineAt(state.groundRuns, w.x);
    if (g !== Infinity) w.y = g;
    if (w.t % 16 === 0) playSound('horn');
    if (state.frame % 2 === 0) state.particles.push({ pos: { x: w.x - w.dir * 30, y: w.y - 40 }, vel: { x: pace * 0.8 - w.dir * 2, y: -1.5 - Math.random() }, life: 40, color: Math.random() < 0.5 ? 'rgba(41, 37, 36, 0.6)' : 'rgba(249, 115, 22, 0.8)', size: 8 + Math.random() * 10 });
    // Out of sight: now it's out in the distance, heading for something to hit
    if (w.x > v.x2 + 160 || w.x < v.x1 - 160) {
      w.t = -1;
      const from = w.dir > 0 ? CANVAS_WIDTH + 30 : -30;
      // (something that'll still be well on the screen when it gets there: the distance keeps going by as it drives)
      const drift = Math.max(4, p.vel.x) * FAR_PAR;
      const DUR = 80;
      const at = (k: number) => farScreenX(ch, k) - drift * DUR;
      const seen = ch.far.map((_, k) => k).filter(k => { const sx = at(k); return sx > 120 && sx < CANVAS_WIDTH - 120 && farScreenX(ch, k) < CANVAS_WIDTH + 100; });
      const standing = seen.filter(k => ch.far[k].state === 'standing');
      const pool = standing.length ? standing : seen;
      const base = ch.odo * FAR_PAR;
      const target = pool.length ? pool[Math.floor(Math.random() * pool.length)]
        : ch.far.map((_, k) => k).sort((a, b2) => Math.abs(at(a) - CANVAS_WIDTH / 2) - Math.abs(at(b2) - CANVAS_WIDTH / 2))[0];
      const l0 = from + base, l1 = farScreenX(ch, target) + base;
      ch.farWrecks.push({ kind: w.kind, paint: w.paint, l0, l1, target, t: 0, dur: DUR });
    }
  }
  ch.wrecks = ch.wrecks.filter(w => w.t >= 0);
  // Out in the distance: across the field and into it
  for (const w of ch.farWrecks) {
    w.t++;
    if (w.t % 22 === 0) playSound('horn');
    if (w.t === Math.ceil(w.dur)) {
      const f = ch.far[w.target];
      f.state = 'blowing'; f.t = 0;
      shakeScreen(state, 45, 14);
      playSound('boom'); playSound('ignite');
      // (and the things either side of it catch, now and then: a tank farm going up one after another)
      for (const n of [w.target - 1, w.target + 1]) {
        const k = (n + FAR_N) % FAR_N;
        const sx = farScreenX(ch, k);
        if (sx > 40 && sx < CANVAS_WIDTH - 40 && ch.far[k].state === 'standing' && (ch.far[k].look === 'tank' || Math.random() < 0.4)) { ch.far[k].state = 'fuse'; ch.far[k].t = -(30 + Math.floor(Math.random() * 40)); }
      }
    }
  }
  ch.farWrecks = ch.farWrecks.filter(w => w.t <= w.dur);
  for (const f of ch.far) {
    f.t++;
    if (f.state === 'fuse' && f.t >= 0) { f.state = 'blowing'; f.t = 0; shakeScreen(state, 30, 10); playSound('boom'); }
    if (f.state === 'blowing' && f.t > 60) { f.state = 'burning'; f.t = 0; }
  }
};

const updateThrown = (ch: Chase) => {
  for (const t of ch.thrown) {
    t.vy += 0.55; t.x += t.vx; t.y += t.vy; t.rot += t.vr; t.life--;
    t.vx *= 0.99;
  }
  ch.thrown = ch.thrown.filter(t => t.life > 0);
};

// ---------------------------------------------------------------------------

/** How long between throws from a truck, and the wind-up. */
const THROW_EVERY = 95, THROW_WINDUP = 22;

const truckThrow = (state: GameState, e: Enemy) => {
  const p = state.player;
  if (e.aiState === 'windup') {
    if (e.aiTimer >= THROW_WINDUP) {
      e.aiState = 'hold'; e.aiTimer = 0; e.shootTimer = 0;
      // Lobbed at where he'll be (he's moving: it leads him)
      const x = e.pos.x + e.width / 2 - 38, y = e.pos.y - 16;
      const t = 36;
      const tx = p.pos.x + p.width / 2 + p.vel.x * t, ty = p.pos.y + p.height / 2;
      const vx = (tx - x) / t, vy = (ty - y - 0.5 * 0.35 * t * t) / t;
      state.projectiles.push({ id: `lp-${state.frame}-${Math.random()}`, pos: { x: x - 9, y: y - 8 }, vel: { x: vx, y: vy }, width: 18, height: 16, health: 1, maxHealth: 1, type: 'projectile', damage: CHIP, owner: 'enemy', shooterKind: 'pickup', thrown: 'lunchpail', item: Math.floor(Math.random() * 5), rotation: 0 });
    }
    return;
  }
  if (e.aiState === 'hold' && e.shootTimer > THROW_EVERY && Math.abs(mid(e).x - mid(p).x) < 700) { e.aiState = 'windup'; e.aiTimer = 0; }
};

/** How long a cruiser rests between shots, and how fast they go. */
const SHOOT_EVERY = 90, SHOT_SPEED = 9;

const cruiserShoot = (state: GameState, e: Enemy) => {
  const p = state.player;
  const dx = mid(p).x - mid(e).x;
  if (e.aiState !== 'hold' || Math.abs(dx) > 800) return;
  if (e.shootTimer === SHOOT_EVERY || e.shootTimer === SHOOT_EVERY + 12) {
    const dir = dx < 0 ? -1 : 1;
    const x = mid(e).x + dir * 36, y = e.pos.y + 10;
    playSound('egun', 1, -3);
    state.projectiles.push({ id: `cr-${state.frame}-${Math.random()}`, pos: { x: x - 5, y: y - 5 }, vel: { x: dir * SHOT_SPEED, y: 0 }, width: 10, height: 10, health: 1, maxHealth: 1, type: 'projectile', damage: CHIP, owner: 'enemy', shooterKind: 'cruiser', shot: 'slug' });
    for (let i = 0; i < 6; i++) state.particles.push({ pos: { x, y }, vel: { x: dir * (1 + Math.random() * 3), y: (Math.random() - 0.5) * 2 }, life: 8, color: i % 2 ? '#FEF08A' : '#FB923C', size: 3 + Math.random() * 3 });
  }
  if (e.shootTimer > SHOOT_EVERY + 24) e.shootTimer = 0;
};

// ---------------------------------------------------------------------------

/** Oil on the road: a slick every so often out ahead. Ride over one and the bike spins out. */
const slicks = (ctx: FrameContext, ch: Chase) => {
  const { state, fx } = ctx;
  const p = state.player;
  if (--ch.slickTimer <= 0) {
    ch.slickTimer = 300 + Math.floor(Math.random() * 180);
    const x = chaseView(state, ch).x2 + SLICK_AHEAD;
    if (!ch.gaps.some(g => x > g.x1 - 400 && x < g.x2 + 400)) ch.slicks.push({ x, w: 110 });
  }
  const box = boundsOf(p);
  for (const s of ch.slicks) {
    if (ch.spin > 0 || !p.isGrounded || p.isCharging) continue;
    if (box.x + box.w > s.x - s.w / 2 && box.x < s.x + s.w / 2) {
      ch.spin = SPIN_FRAMES;
      fx.spawnDamageNumber({ x: p.pos.x - 30, y: p.pos.y - 60 }, 'SPIN OUT!', true, '#A855F7');
      playSound('splash');
    }
  }
  ch.slicks = ch.slicks.filter(s => s.x > state.camera.x - 300);
};

const hint = (ch: Chase, text: string) => { if (ch.hinted.has(text)) return; ch.hinted.add(text); ch.hint = text; ch.hintT = 1; };

/** What to do, the first time it's the thing to do (never naming a button: what to do). */
const teach = (state: GameState, ch: Chase) => {
  if (ch.hintT > 0) return;
  const p = state.player;
  if (ch.t > 40) hint(ch, `KEEP FIRING. WRECK ${KILLS_NEEDED} OF THEM`);
  const near = (k: EnemyKind) => state.enemies.some(e => e.kind === k && e.health > 0 && Math.abs(mid(e).x - mid(p).x) < 360);
  if (ch.kills > 6 && (near('pickup') || near('cruiser'))) hint(ch, 'OR RAM ONE, OR COME DOWN ON IT FROM ABOVE');
  if (ch.slicks.some(s => s.x > p.pos.x && s.x < p.pos.x + 500)) hint(ch, 'JUMP THE OIL, OR IT SPINS YOU OUT');
};

/** How far through (0..1). */
export const chaseProgress = (ch: Chase) => Math.min(1, ch.kills / KILLS_NEEDED);
export const chaseDeathMessage = (ch: Chase): string | undefined => {
  if (ch.phase !== 'riding') return undefined;
  if (ch.gaps.some(g => !g.passed)) return ['MISSED THE JUMP', 'EVEL KNIEVEL HE IS NOT', 'INTO THE TRENCH'][Math.floor(Math.random() * 3)];
  const l = ['ROADKILL', 'RUN OFF THE ROAD', 'LAID DOWN THE BIKE', 'TEXAS JUSTICE'];
  return l[Math.floor(Math.random() * l.length)];
};

/** Projectiles: his bullets into a car or truck, or a biker (a car or truck soaks them up; a biker doesn't). */
export const hitChaseVehicle = (e: Enemy, dmg: number) => {
  e.health -= dmg;
  e.hitCooldown = 4;
};

void GROUND_Y;
