// Act III: Deadwood Gulch, "an authentic 1880s frontier town, est. 1994". A
// tourist trap: a street of false fronts (saloon, general store, bank, hotel...)
// with porch roofs out over the boardwalks, and the fourth truck's cab nose-first
// in the curio shop at the end of it.
//
// The third hitman's up the chapel's bell tower with a rifle: a crosshair drifts
// after Meathead all the way up the street, and every so often it stops, goes
// red, and fires where it stopped. Standing there (or anywhere along the laser
// between it and the tower, out in the open), it's a big hit, unless there's a
// goon in the way: the first thing along the laser takes the round, and only that. Under a porch
// roof, he can't see you (the round goes into the roof). The porch roofs are
// springy, too: land on one and it throws you up onto the rooftops.
//
// Up on the tower the sniper turns out to be a ninja, and when Meathead reaches
// him he's so ashamed of missing that he kneels and commits seppuku on the spot.
//
// Back down on the street: a cut back down to the curio shop, and the second
// hitman isn't dead after all. Riggs backs the cab out, spins it round and comes
// up the street flat out, through the tourists (every last one) and the photo
// cutouts. Warning signs, a meter: when he's close, boost-jump (an uppercut) clean
// over him. Then a cut to the fake jail: the guy the "sheriff" locked in it for a
// photo sees what's coming, the sheriff runs off with the keys, and the cab comes
// through the wall, him and Riggs and all. Dale's pharmacy is past the wreck.
//
// The tourists are the town's, not enemies: Meathead can't hurt them.

import { SKIP_AFTER, offerSkip, takeSkip } from '../../platform/skip';
import type { Enemy } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { GROUND_Y, CANVAS_WIDTH } from '../../../constants';
import { shakeScreen } from '../../core/state';
import { rectsOverlap, boundsOf, isOnScreen } from '../../core/utils';
import { hurtPlayer } from '../../bosses/shared';
import { killPlayer } from '../../player/player';
import { playSound, playSniperShot, playHornDrone } from '../../platform/audio';
import { cancelSpeech } from '../../platform/speech';
import { makeKindEnemy } from '../../enemies/kinds';
import { COURSE, CP } from './course';
import { Talk, queueLines, replaceLines, hush, quiet } from './script';
import { isShat } from '../../player/gut';

const Y = GROUND_Y;
const T = () => COURSE.town;

/** The sniper: tracking time between shots, the lock (it stops and goes red), the hit, and the crosshair's size. */
const TRACK = 190, LOCK = 46, SIGHT_R = 34;
/** How much bigger a goon is to the round than he's drawn (baiting it into them should work). */
const GOON_PAD = 12;
/** The porch roofs throw you this hard. */
export const AWNING_BOUNCE = 17.5;
/** The cab: its size; how fast it comes up the street (chasing, then at you); how far off it is when you get control back. */
export const CAB = { w: 250, h: 196 };
const CHASE_SPEED = 17, RUSH_SPEED = 8, HANDOVER = 1300;
/** Coming in off the highway: how fast the cab comes down the street into the curio shop. */
const ARRIVE_SPEED = 21;

export interface TownProp { x: number; look: 'barrel' | 'cutout' | 'wagon' | 'hay' | 'wanted' | 'trough'; flying: boolean; vx: number; vy: number; y: number; rot: number }
export interface Town {
  phase: 'street' | 'pan' | 'revive' | 'chase' | 'incoming' | 'jail' | 'crashed';
  /** While the cab's coming for him: where the camera's locked (its left edge). */
  lockX?: number;
  /** The jail scene: when the cab went into it (-1 till then). */
  crashedAt: number;
  t: number;
  sniper: { on: boolean; x: number; y: number; state: 'track' | 'lock' | 'cool'; t: number; shots: number; lastShot: { x: number; y: number; t: number; covered: boolean } | null };
  /** The tourists: the town's, not enemies (Meathead can't hurt them; Riggs gets every last one). */
  tourists: Enemy[];
  /** How much of them is on the front of the cab (0..1); when the last scream went up. */
  gore: number;
  screamAt: number;
  /** Coming in off the highway: the cab down the street into the curio shop, Meathead flung off the top of it. */
  arrive: { t: number; x: number; h: number; vx: number; vh: number; rot: number; spin: number; landedAt: number } | null;
  /** The hole in the curio shop (not till the cab's gone into it). */
  shopHit: boolean;
  /** Times Meathead's said he needs to get closer (shooting at the nest from down there). */
  closerSaid: number;
  ninja: { state: 'perch' | 'speech' | 'kneel' | 'dead'; t: number; /** Which way he turned to face Meathead (and stays that way). */ face: 1 | -1; /** Which way he's aiming, up there (he turns round after him if he gets past). */ aim?: 1 | -1;
    /** Shot at from down there: frames left ducked behind his sandbags, and when he last came back up. */ duck?: number; upAt?: number };
  /** Meathead up against the jail with the sniper still up the tower: when he last said so, and how many times. */
  wallNagAt?: number; wallNags?: number;
  /** Riggs coming for him: whether he's jumped since he was last on the ground, and whether that jump was an uppercut. */
  jumped?: boolean; boosted?: boolean;
  cab: { x: number; speed: number; facing: 1 | -1; spin: number; state: 'arrive' | 'parked' | 'reverse' | 'spin' | 'go' | 'wrecked'; t: number };
  props: TownProp[];
  sheriff: { x: number; running: boolean };
  prisoner: { alive: boolean; said: number };
  /** Said: the sniper warning, the cover hint, the town welcome. */
  said: Set<string>;
  /** The crash from the highway: frames since he came to. */
  wakeT: number;
}

export const createTown = (state: GameState, startedAt: number): Town => {
  const t = T();
  const ninjaDead = startedAt >= CP.JAIL || !!state.stageMemo.ninjaDead;
  const props: TownProp[] = [
    { x: t.x1 + 1180, look: 'barrel' }, { x: t.x1 + 1650, look: 'cutout' }, { x: t.x1 + 2000, look: 'trough' }, { x: t.x1 + 2520, look: 'hay' },
    { x: t.x1 + 3130, look: 'wagon' }, { x: t.x1 + 3580, look: 'wanted' }, { x: t.x1 + 4080, look: 'barrel' }, { x: t.x1 + 4600, look: 'cutout' },
    { x: t.x1 + 4900, look: 'hay' }, { x: t.x1 + 5150, look: 'barrel' },
  ].map(p => ({ ...p, look: p.look as TownProp['look'], flying: false, vx: 0, vy: 0, y: Y, rot: 0 }));
  // (back after dying past the jail: it's rubble, and Riggs is in it)
  const wrecked = !!state.stageMemo.jailWrecked;
  // (died while Riggs was coming up the street, before he'd got to the jail: it never happened. The street's as it
  // was, the tread marks, the blood and the beaten-up fronts gone with it, the tourists back)
  if (!wrecked) { delete state.stageMemo.cabReach; delete state.stageMemo.townStains; }
  return {
    phase: wrecked ? 'crashed' : 'street', t: 0,
    sniper: { on: false, x: t.x1 + 1400, y: Y - 200, state: 'track', t: 0, shots: 0, lastShot: null },
    closerSaid: 0,
    ninja: { state: ninjaDead ? 'dead' : 'perch', t: 999, face: -1 },
    cab: wrecked ? { x: t.jail.x1 + 30 - CAB.w, speed: 0, facing: 1, spin: 0, state: 'wrecked', t: 0 } : { x: t.crash - 20, speed: 0, facing: -1, spin: 0, state: 'parked', t: 0 },
    props, sheriff: { x: wrecked ? t.x2 + 400 : t.jail.x1 - 70, running: wrecked }, prisoner: { alive: !wrecked, said: 0 },
    said: new Set(), wakeT: 999,
    tourists: wrecked ? [] : makeTourists(), gore: 0, screamAt: -999, crashedAt: -1, arrive: null, shopHit: true,
  };
};

/** The tourists, all up the street to the jail: milling about, taking pictures. */
const makeTourists = (): Enemy[] => {
  const t = T();
  const out: Enemy[] = [];
  for (let k = 0; ; k++) {
    const x = t.x1 + 700 + k * 165 + ((k * 53) % 70);
    if (x > t.jail.x1 - 160) break;
    const e = makeKindEnemy('visitor', x, Y);
    e.variant = k % 5; e.homeX = x; e.facing = k % 2 ? 1 : -1; e.aiState = 'idle'; e.aiTimer = k * 37;
    out.push(e);
  }
  return out;
};

/** Things Meathead only says the first time through (not again after a checkpoint). */
const once = (state: GameState, town: Town, key: string) => {
  if (town.said.has(key) || state.stageMemo[`said-${key}`]) return false;
  town.said.add(key); state.stageMemo[`said-${key}`] = 'yes';
  return true;
};

// ---------------------------------------------------------------------------
// Coming in off the highway
// ---------------------------------------------------------------------------

/**
 * The last truck's tractor (the trailer long gone somewhere back up the interstate) comes down the street flat out,
 * horn blaring, Meathead hanging on up top, and goes nose first into the curio shop. He goes up off the top of it,
 * comes down on the street, bounces, and lies there a moment.
 */
export const startArrival = (state: GameState, town: Town) => {
  const t = T();
  town.shopHit = false;
  town.cab = { x: t.x1 + 900, speed: -ARRIVE_SPEED, facing: -1, spin: 0, state: 'arrive', t: 0 };
  town.arrive = { t: 0, x: 0, h: CAB.h, vx: 0, vh: 0, rot: 0, spin: 0, landedAt: -1 };
  const p = state.player;
  p.hidden = true; p.inCutscene = true; p.vel = { x: 0, y: 0 };
  state.cameraOverride = { x: t.x1, y: 0 };
  state.camera.x = t.x1; state.camera.y = 0;
  // (Riggs still face down on the horn)
  playHornDrone(1.9);
};

/** How long he lies there before he's up. */
const LIE_FOR = 70;

const arrival = (ctx: FrameContext, town: Town): Controls => {
  const { state, fx } = ctx;
  const p = state.player;
  const t = T();
  const a = town.arrive!;
  const cab = town.cab;
  a.t++;
  state.cameraOverride = { x: t.x1, y: 0 };
  p.hidden = true; p.inCutscene = true; p.vel = { x: 0, y: 0 };
  const yell = (text: string) => { state.playerLastVulgarity = text; state.playerVulgarityTimer = 60; };
  if (cab.state === 'arrive') {
    cab.x -= ARRIVE_SPEED;
    a.x = cab.x + CAB.w * 0.55;
    if (a.t === 8) yell('WHO HAS THE WHEEL?! NOBODY HAS THE WHEEL!');
    if (cab.x <= t.crash - 20) {
      // In through the front of the shop
      cab.x = t.crash - 20; cab.state = 'parked'; cab.speed = 0; cab.t = 0;
      town.shopHit = true;
      shakeScreen(state, 44, 16);
      playSound('crash');
      fx.spawnGlassShatter({ x: t.x1 + 150, y: Y - 150 });
      for (let k = 0; k < 8; k++) fx.spawnExplosion({ x: t.x1 + 60 + k * 30, y: Y - 30 - ((k * 37) % 170) }, k % 2 ? '#A0703F' : '#D2B48C', 18, 0, 22);
      const junk = ['#A0703F', '#F472B6', '#22D3EE', '#FEF3C7', '#8B6B3D', '#FACC15'];
      for (let i = 0; i < 46; i++) state.particles.push({ pos: { x: t.x1 + 80 + Math.random() * 180, y: Y - 40 - Math.random() * 180 }, vel: { x: (Math.random() - 0.3) * 14, y: -4 - Math.random() * 12 }, life: 50 + Math.random() * 40, color: junk[i % junk.length], size: 3 + Math.random() * 7 });
      fx.spawnDamageNumber({ x: t.x1 + 90, y: Y - 300 }, 'CRUNCH!', true, '#FACC15');
      // and up he goes
      a.vx = 3.6; a.vh = 19; a.spin = 0.3;
      yell('WHOAAAAAA!');
    }
  } else if (a.landedAt < 0 || a.vh !== 0 || a.h > 0) {
    // Up, over, down
    a.x += a.vx; a.vh -= 0.65; a.h += a.vh; a.rot += a.spin;
    if (a.h <= 0) {
      a.h = 0;
      if (a.landedAt < 0) {
        a.landedAt = a.t; a.vh = 6; a.vx *= 0.4; a.spin *= 0.5;
        shakeScreen(state, 16, 8); playSound('thud');
        fx.spawnExplosion({ x: a.x, y: Y - 6 }, '#C08A55', 10, 0, 12);
        yell('OOF!');
      } else { a.vh = 0; a.vx = 0; a.spin = 0; }
    }
  }
  // Keep the real him where the body is (his words go up over it)
  p.pos = { x: a.x - p.width / 2, y: Y - a.h - p.height };
  // Lain there long enough: up he gets
  if (a.landedAt >= 0 && a.h <= 0 && a.t >= a.landedAt + LIE_FOR) {
    p.pos = { x: a.x - p.width / 2, y: Y - p.height };
    p.hidden = false; p.inCutscene = false; p.facing = 1;
    town.arrive = null;
    state.cameraOverride = null;
    town.wakeT = 0;
  }
  return { ...NO_CONTROLS };
};

/** The jail's front wall (the street's blocked till the cab goes through it). */
export const jailWall = () => ({ x: T().jail.x1, y: -1200, w: T().jail.x2 - T().jail.x1, h: 1200 + Y, type: 'wall' as const, hidden: true, tag: 'jail' });

export const updateTown = (ctx: FrameContext, town: Town, talk: Talk, controls: Controls): Controls => {
  const { state } = ctx;
  const p = state.player;
  const t = T();
  town.t++;
  if (town.wakeT < 999) town.wakeT++;
  if (town.arrive) return arrival(ctx, town);
  if (town.wakeT === 40 && !state.stageMemo.wokeUp) { state.stageMemo.wokeUp = 'yes'; queueLines(state, talk, [{ who: 'meathead', text: 'NOTE TO SELF: SHOOT THE DRIVER AFTER THE TRUCK STOPS.' }]); }
  if (p.pos.x > t.arch - 100 && p.pos.x < t.arch + 800 && once(state, town, 'welcome')) { queueLines(state, talk, [{ who: 'meathead', text: 'AN AUTHENTIC OLD WEST TOWN. EST. NINETEEN NINETY FOUR. SURE.' }]); }
  checkpoints(state);
  bounceAwnings(state);
  updateProps(ctx, town);
  updateTourists(town);
  // The sniper, from the arch till you get up to him
  if (town.ninja.state === 'perch' && !town.sniper.on && p.pos.x > t.arch + 80) {
    town.sniper.on = true; town.sniper.x = p.pos.x + 200; town.sniper.y = p.pos.y - 100; town.sniper.t = 0;
    if (once(state, town, 'sniper')) replaceLines(state, talk, [{ who: 'meathead', text: "A LITTLE RED DOT ON MY PECS... SNIPER! THE PORCH ROOFS! HE CAN'T SEE ME UNDER THOSE!" }]);
  }
  if (town.ninja.state === 'perch') shotAtNest(ctx, town, talk);
  if (town.sniper.on) updateSniper(ctx, town, talk);
  sniperFirst(state, town, talk);
  const ninjaControls = updateNinja(ctx, town, talk);
  if (ninjaControls) return ninjaControls;
  updatePrisoner(state, town, talk);
  return updateWarpath(ctx, town, talk, controls);
};

const checkpoints = (state: GameState) => {
  const p = state.player;
  if (!p.isGrounded) return;
  if (state.checkpoint < CP.ROOFTOPS && p.pos.x >= COURSE.checkpoints[CP.ROOFTOPS].x) state.checkpoint = CP.ROOFTOPS;
};

/** Up against the jail with the sniper still up his tower: Meathead knows he should deal with him first. */
const WALL_NAGS = [
  'I SHOULD REALLY TAKE OUT THAT SNIPER BEFORE I GO ANY FURTHER.',
  "NOT WITH A SNIPER ON MY BACK. HE'S UP THE BELL TOWER.",
  'SNIPER FIRST. THEN THE DRUGS.',
];
const WALL_NAG_EVERY = 480;
const sniperFirst = (state: GameState, town: Town, talk: Talk) => {
  const p = state.player;
  if (town.ninja.state !== 'perch' || p.pos.x + p.width < T().jail.x1 - 60 || p.pos.x > T().jail.x2) return;
  // (all three, then only now and then)
  if (town.wallNagAt !== undefined && town.t - town.wallNagAt < ((town.wallNags ?? 0) < WALL_NAGS.length ? WALL_NAG_EVERY : WALL_NAG_EVERY * 3)) return;
  if (!quiet(talk)) return;
  town.wallNagAt = town.t;
  const n = town.wallNags ?? 0;
  town.wallNags = n + 1;
  queueLines(state, talk, [{ who: 'meathead', text: WALL_NAGS[n % WALL_NAGS.length] }]);
};

/** Standing under a porch roof: out of the sniper's sight. */
export const underCover = (box: { x: number; y: number; w: number }) =>
  COURSE.awnings.some(a => box.x + box.w * 0.25 > a.x && box.x + box.w * 0.75 < a.x + a.w && box.y > a.y);

/** Land on a porch roof and it throws you up. */
const bounceAwnings = (state: GameState) => {
  const p = state.player;
  if (!p.isGrounded || p.vel.y < 0) return;
  const feet = p.pos.y + p.height;
  const a = COURSE.awnings.find(w => Math.abs(feet - w.y) < 3 && p.pos.x + p.width / 2 > w.x && p.pos.x + p.width / 2 < w.x + w.w);
  if (!a) return;
  p.vel.y = -AWNING_BOUNCE;
  p.isGrounded = false;
  // (no hang time off it, and no jump off it either: the bounce is the bounce)
  p.coyoteAirTimer = 0; p.coyoteJumpTimer = 0; p.jumpHoldTimer = 0;
  p.pos.y -= 2;
  p.squash = -1;
  playSound('jump');
};

// ---------------------------------------------------------------------------
// The sniper
// ---------------------------------------------------------------------------

const updateSniper = (ctx: FrameContext, town: Town, talk: Talk) => {
  const { state, fx } = ctx;
  const p = state.player;
  const s = town.sniper;
  s.t++;
  const px = p.pos.x + p.width / 2, py = p.pos.y + p.height / 2;
  // (he swings round after the crosshair if it goes past his side of the tower)
  const n = town.ninja, sx = ninjaSpot().x;
  if (s.x > sx + 40) n.aim = 1; else if (s.x < sx - 40) n.aim = -1;
  // (down behind his sandbags: no aiming, no shooting, till he's back up)
  if (n.duck) { s.state = 'cool'; s.t = 0; return; }
  if (s.state === 'track' || s.state === 'cool') {
    // Drifting after him, a little behind, a little shaky
    const k = s.state === 'cool' ? 0.025 : 0.058;
    s.x += (px - s.x) * k + Math.sin(state.frame * 0.13) * 1.2;
    s.y += (py - s.y) * k + Math.cos(state.frame * 0.11) * 1.0;
    if (s.state === 'cool' && s.t > 40) { s.state = 'track'; s.t = 0; }
    // (not while he's in a cutscene, or dead)
    if (s.state === 'track' && s.t > TRACK && !p.inCutscene && state.deathTimer <= 0) { s.state = 'lock'; s.t = 0; playSound('alert'); }
  } else if (s.state === 'lock') {
    if (s.t >= LOCK) {
      // Fire: the first thing along the laser takes it (him, or a goon in the way), and only that
      s.state = 'cool'; s.t = 0; s.shots++;
      const hit = firstHit(state, s, town.ninja.aim);
      s.lastShot = { x: hit.x, y: hit.y, t: state.frame, covered: hit.kind === 'roof' };
      playSniperShot(); shakeScreen(state, 18, 12);
      // The muzzle blast up the tower
      const m = muzzle(town.ninja.aim);
      for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: m.x, y: m.y }, vel: { x: (town.ninja.aim ?? -1) * Math.random() * 7, y: (Math.random() - 0.5) * 4 }, life: 30 + Math.random() * 20, color: i % 3 ? '#57534E' : '#FDE68A', size: 5 + Math.random() * 7 });
      if (hit.kind === 'roof') {
        // Into the porch roof
        for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: hit.x, y: hit.y }, vel: { x: (Math.random() - 0.5) * 6, y: -Math.random() * 4 }, life: 26, color: i % 2 ? '#92400E' : '#D6B98C', size: 2 + Math.random() * 3 });
      } else if (hit.kind === 'ground') {
        // Where it went in: a geyser of dirt and splinters off whatever's there
        for (let i = 0; i < 26; i++) state.particles.push({ pos: { x: hit.x, y: hit.y }, vel: { x: (Math.random() - 0.5) * 12, y: -Math.random() * 11 }, life: 26 + Math.random() * 16, color: i % 4 ? '#D6B98C' : '#FDE68A', size: 3 + Math.random() * 6 });
      } else if (hit.kind === 'player') {
        // (no moment of grace from a hit before saves him: a rifle round's a rifle round)
        {
          // One shot: his head comes apart (the body stays stood there a moment, then goes over)
          if (ctx.cheats.invincible) hurtPlayer(ctx, 0, 'sniper', { x: (px < m.x ? -1 : 1) * 9, y: -10 }, 30);
          else headshot(ctx, px < m.x ? -1 : 1);
          shakeScreen(state, 26, 16);
        }
      } else if (hit.enemy) {
        // A goon in the way: his head comes off, same as it would have been Meathead's
        const e = hit.enemy;
        const dir = e.pos.x + e.width / 2 < m.x ? -1 : 1;
        fx.killWithAnimation(e, 'headshot', 'gun_kill', undefined, { x: dir * (3 + Math.random() * 2), y: -7 - Math.random() * 3 });
        fx.spawnDeathShower({ x: e.pos.x + e.width / 2, y: e.pos.y + 6 }, dir, 1.2);
        playSound('splat'); playSound('crunch');
        fx.spawnDamageNumber({ x: e.pos.x - 20, y: e.pos.y - 30 }, 'FRIENDLY FIRE!', true, '#FACC15');
      }
      scatterTourists(town, s.x);
      if (s.shots === 1 && p.health > 0 && once(state, town, 'cover')) { queueLines(state, talk, [{ who: 'meathead', text: "UNDER A PORCH ROOF! THAT'S THE ONLY PLACE HE CAN'T HIT ME!" }], 40); }
    }
  }
};

/** The round takes his head off: skull, brains, flat-top and all, and the body's left standing. */
const headshot = (ctx: FrameContext, dir: number) => {
  const { state, fx } = ctx;
  const p = state.player;
  const hx = p.pos.x + p.width / 2, hy = p.pos.y + 8;
  p.health = 0; p.headless = 1; p.vel = { x: 0, y: 0 };
  // (it was the sniper: whatever hurt him a moment before, a goon's machete, a hawk, it's not what killed him)
  state.lastHurt = { source: 'sniper', at: state.frame };
  // (whatever he was in the middle of, flailing from a hit, a charge, a dive: he's stood there, and it's held on a still)
  p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false; p.isDucking = false;
  p.pushbackTimer = 0; p.hurtForm = undefined; p.hurtFormTimer = 0; p.ledgeDrop = 0; p.kickPose = 0; p.invincibilityTimer = 0; p.hurtTimer = 0;
  state.deathFreeze = 0;
  fx.spawnDeathShower({ x: hx, y: hy }, dir, 2.2);
  fx.spawnExplosion({ x: hx, y: hy }, '#DC2626', 30, dir * 4, 16);
  for (let i = 0; i < 46; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6 + dir * 0.5, sp = 3 + Math.random() * 9;
    state.particles.push({ pos: { x: hx, y: hy }, vel: { x: Math.cos(a) * sp, y: Math.sin(a) * sp }, life: 50 + Math.random() * 60,
      color: ['#B91C1C', '#7F1D1D', '#F9A8D4', '#F5F5F4', '#18181B', '#DC2626'][i % 6], size: 3 + Math.random() * 6 });
  }
  fx.spawnDamageNumber({ x: hx - 50, y: hy - 50 }, 'HEADSHOT!', true, '#EF4444');
  playSound('splat'); playSound('crunch');
};

/** Where the rifle's muzzle is, up the tower (the way he's aiming). */
export const muzzle = (aim: 1 | -1 = -1) => ({ x: ninjaSpot().x + aim * 50, y: ninjaSpot().y - 22 });

/** Where the laser (and the round) stops: the crosshair. It goes no further than that. */
export const laserEnd = (s: { x: number; y: number }) => ({ x: s.x, y: s.y });

/**
 * What the round hits: the first thing along the laser from the tower (him, or a goon in the way), or,
 * if it gets all the way to the crosshair, whatever's in the crosshair (him first), or the ground there. (Under a porch
 * roof, he's out of it: the round goes into the roof over him.)
 */
const firstHit = (state: GameState, s: { x: number; y: number }, aim: 1 | -1 = -1): { kind: 'roof' | 'player' | 'enemy' | 'ground'; x: number; y: number; enemy?: Enemy } => {
  const p = state.player;
  const m = muzzle(aim);
  const covered = underCover({ x: p.pos.x, y: p.pos.y, w: p.width });
  const me = { x: p.pos.x + 4, y: p.pos.y + 4, w: p.width - 8, h: p.height - 4 };
  // (only ones in view: it's him the sniper's after, and whoever he's got in the way; not the lads off up the street)
  const goons = state.enemies.filter(e => e.health > 0 && !e.isBlownAway && e.type !== 'boss' && isOnScreen(state.camera, e, 0));
  const inside = (x: number, y: number, b: { x: number; y: number; w: number; h: number }) => x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h;
  // (a goon's a bit bigger than he looks to the round: baiting the sniper into them is meant to work)
  const padded = (g: Enemy) => { const b = boundsOf(g); return { x: b.x - GOON_PAD, y: b.y - GOON_PAD, w: b.w + GOON_PAD * 2, h: b.h + GOON_PAD * 2 }; };
  const len = Math.hypot(s.x - m.x, s.y - m.y) || 1;
  const n = Math.max(1, Math.ceil(len / 5));
  for (let i = 1; i <= n; i++) {
    const x = m.x + ((s.x - m.x) * i) / n, y = m.y + ((s.y - m.y) * i) / n;
    if (!covered && inside(x, y, me)) return { kind: 'player', x, y };
    const e = goons.find(g => inside(x, y, padded(g)));
    if (e) return { kind: 'enemy', x, y, enemy: e };
  }
  // All the way to the crosshair: whatever's in it
  const px = p.pos.x + p.width / 2, py = p.pos.y + p.height / 2;
  if (Math.hypot(px - s.x, py - s.y) < SIGHT_R + p.width / 2) {
    if (!covered) return { kind: 'player', x: s.x, y: s.y };
    const a = COURSE.awnings.find(w => px > w.x && px < w.x + w.w);
    if (a) return { kind: 'roof', x: s.x, y: a.y };
  }
  const e = goons.find(g => Math.hypot(g.pos.x + g.width / 2 - s.x, g.pos.y + g.height / 2 - s.y) < SIGHT_R + g.width / 2);
  if (e) return { kind: 'enemy', x: s.x, y: s.y, enemy: e };
  // Nothing in the crosshair: the round keeps going the way it was, into whoever's behind it, till it's in the street
  // or a rooftop
  const ux = (s.x - m.x) / len, uy = (s.y - m.y) / len;
  for (let d = 5; d < 900; d += 5) {
    const x = s.x + ux * d, y = s.y + uy * d;
    const g = goons.find(q => inside(x, y, padded(q)));
    if (g) return { kind: 'enemy', x, y, enemy: g };
    if (y >= Y || COURSE.buildings.some(b => x > b.x1 && x < b.x2 && y > b.top) || COURSE.awnings.some(a => x > a.x && x < a.x + a.w && y > a.y && y < a.y + 12)) return { kind: y >= Y ? 'ground' : 'roof', x, y: Math.min(y, Y) };
  }
  return { kind: 'ground', x: s.x, y: s.y };
};

/** Shots near the tourists: they run for it (away from it). */
const scatterTourists = (town: Town, x: number) => {
  for (const e of town.tourists) if (Math.abs(e.pos.x - x) < 420 && e.aiState !== 'flee') { e.aiState = 'flee'; e.aiTimer = 0; e.facing = e.pos.x < x ? -1 : 1; }
};

/** The tourists: milling about their spot and stopping for pictures; running when there's shooting, then cowering. */
const updateTourists = (town: Town) => {
  const t = T();
  for (const e of town.tourists) {
    e.aiTimer = (e.aiTimer || 0) + 1;
    if (e.aiState === 'flee') {
      e.vel.x = e.aiTimer < 0 ? 0 : (e.facing ?? 1) * 5.5;
      if (e.aiTimer > 60 && town.phase === 'street') { e.aiState = 'shelter'; e.aiTimer = 0; }
    } else if (e.aiState === 'shelter') {
      e.vel.x = 0;
      if (e.aiTimer > 240 && town.phase === 'street') { e.aiState = 'idle'; e.aiTimer = 0; }
    } else {
      const home = e.homeX ?? e.pos.x;
      if (e.aiTimer % 240 < 100) e.vel.x = 0;
      else { if (Math.abs(e.pos.x - home) > 50) e.facing = e.pos.x > home ? -1 : 1; e.vel.x = (e.facing ?? 1) * 0.8; }
    }
    e.pos.x = Math.max(t.x1 + 420, Math.min(t.jail.x1 - 110, e.pos.x + e.vel.x));
    e.pos.y = Y - e.height;
  }
};

// ---------------------------------------------------------------------------
// The ninja
// ---------------------------------------------------------------------------

const NINJA_LINES = [
  { who: 'ninja', text: 'YOU CROSSED THE WHOLE TOWN UNDER MY SIGHTS, AND STILL YOU STAND. I HAVE FAILED MY MASTER.' },
  { who: 'ninja', text: 'THERE IS ONLY ONE WAY TO RESTORE MY HONOR.' },
] as const;
/** The same, if he crossed it having shit himself (it's worse, for the ninja). */
const NINJA_LINES_SHAT = [
  { who: 'ninja', text: 'YOU CROSSED THE WHOLE TOWN UNDER MY SIGHTS. WITH SHIT IN YOUR PANTS. AND STILL YOU STAND. I HAVE FAILED MY MASTER.' },
  { who: 'ninja', text: 'THERE IS NO HONOR LEFT TO RESTORE. BUT I WILL TRY.' },
] as const;

/** The seppuku: when the blade goes in, when he's down (and you've got control back). */
export const NINJA_CUT = 30, NINJA_DONE = 70;

/**
 * His nest up the tower: sandbags along the rail. Anything Meathead fires up there from the street goes into the
 * sandbags, and the first time in a while, he gets his head down behind them for a bit (no shots from him meanwhile);
 * Meathead works out it's no good from down there. (Back up, he doesn't duck again for a while: it's not a way
 * to keep him quiet.)
 */
export const DUCK_FOR = 90;
const DUCK_AGAIN = 360;
const CLOSER_LINES = ["HE'S GOT SANDBAGS UP THERE. I NEED TO GET CLOSER.", "NOT FROM DOWN HERE. I'VE GOT TO GET UP THERE.", 'HE JUST DUCKS. CLOSER. GET CLOSER.'];
export const nestBox = () => { const t = T().tower; return { x: t.x - 110, y: t.top - 80, w: 220, h: 84 }; };
const shotAtNest = (ctx: FrameContext, town: Town, talk: Talk) => {
  const { state } = ctx;
  const n = town.ninja;
  if (n.duck && --n.duck === 0) n.upAt = town.t;
  const box = nestBox();
  const hit = state.projectiles.find(pj => pj.owner === 'player' && pj.health > 0 && rectsOverlap(box, boundsOf(pj)));
  const burnt = state.flameSegments.some(sg => rectsOverlap(box, { x: sg.x - sg.size / 2, y: sg.y - sg.size / 2, w: sg.size, h: sg.size }));
  if (!hit && !burnt) return;
  if (hit) {
    // Into the sandbags: a puff of sand
    hit.health = 0;
    for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: hit.pos.x, y: hit.pos.y }, vel: { x: (Math.random() - 0.5) * 4, y: -Math.random() * 3 }, life: 22, color: i % 2 ? '#BFA77F' : '#D6B98C', size: 2 + Math.random() * 3 });
    playSound('thud', 0.4);
  }
  if (n.duck || (n.upAt !== undefined && town.t - n.upAt < DUCK_AGAIN)) return;
  n.duck = DUCK_FOR;
  if (!talk.queue.length) queueLines(state, talk, [{ who: 'meathead', text: CLOSER_LINES[town.closerSaid++ % CLOSER_LINES.length] }]);
};

/** Where the ninja is (his feet, middle). */
export const ninjaSpot = () => ({ x: T().tower.x, y: T().tower.top });

const updateNinja = (ctx: FrameContext, town: Town, talk: Talk): Controls | null => {
  const { state, fx } = ctx;
  const p = state.player;
  const n = town.ninja;
  n.t++;
  const spot = ninjaSpot();
  if (n.state === 'perch') {
    // Up close: that's it for him
    if (Math.abs(p.pos.x + p.width / 2 - spot.x) < 240 && p.pos.y + p.height < Y - 250 && p.isGrounded) {
      n.state = 'speech'; n.t = 0;
      n.face = p.pos.x + p.width / 2 < spot.x ? -1 : 1;
      town.sniper.on = false;
      replaceLines(state, talk, (isShat(state) ? NINJA_LINES_SHAT : NINJA_LINES).map(l => ({ ...l })));
    }
    return null;
  }
  // His piece, and the seppuku: everything else holds off (the goons, the hawks, whatever they'd already fired), and
  // nothing gets at Meathead while he's stood there listening
  // (it's a cutscene: see holdOffForCutscene)
  if (n.state === 'speech' || n.state === 'kneel') p.inCutscene = true;
  if (n.state === 'speech') {
    p.vel.x = 0;
    if (!talk.current && !talk.queue.length && n.t > 20) { n.state = 'kneel'; n.t = 0; playSound('clink'); }
    return { ...NO_CONTROLS };
  }
  if (n.state === 'kneel') {
    if (n.t === NINJA_CUT) { fx.spawnDeathShower({ x: spot.x + 6, y: spot.y - 20 }, 0, 1.2); shakeScreen(state, 6, 3); fx.spawnDamageNumber({ x: spot.x - 50, y: spot.y - 90 }, 'SEPPUKU!', true, '#F87171'); fx.announceKill('SEPPUKU!'); }
    if (n.t === NINJA_CUT + 20) queueLines(state, talk, [{ who: 'meathead', text: '...OKAY. SAVES ME A BULLET.' }]);
    if (n.t > NINJA_DONE) { n.state = 'dead'; n.t = 0; state.stageMemo.ninjaDead = 'yes'; p.inCutscene = false; }
    return { ...NO_CONTROLS };
  }
  return null;
};

// ---------------------------------------------------------------------------
// The jail, and Riggs
// ---------------------------------------------------------------------------

const updatePrisoner = (state: GameState, town: Town, talk: Talk) => {
  const p = state.player;
  const t = T();
  if (!town.prisoner.alive || town.phase !== 'street') return;
  if (town.prisoner.said === 0 && p.pos.x > t.jail.x1 - 700 && p.pos.y + p.height > Y - 20 && town.ninja.state === 'dead' && town.t > 60) {
    town.prisoner.said = 1;
    queueLines(state, talk, [{ who: 'prisoner', text: isShat(state) ? "HEY! HEY, YOU! THE SHERIFF LOCKED ME IN HERE FOR A PHOTO AN HOUR AGO! ...ACTUALLY, STAY OVER THERE. I CAN WAIT." : "HEY! HEY, YOU! THE SHERIFF LOCKED ME IN HERE FOR A PHOTO AN HOUR AGO!" }]);
  }
};

const updateWarpath = (ctx: FrameContext, town: Town, talk: Talk, controls: Controls): Controls => {
  const { state, fx } = ctx;
  const p = state.player;
  const t = T();
  const cab = town.cab;
  cab.t++;
  if (town.phase === 'street') {
    // Down off the chapel (the sniper's done), back on the street: here he comes
    if (town.ninja.state === 'dead' && town.t > 40 && p.isGrounded && p.pos.y + p.height >= Y - 2 && p.pos.x > t.x1 + 4480) {
      if (state.checkpoint < CP.JAIL) state.checkpoint = CP.JAIL;
      town.phase = 'pan'; town.t = 0;
      hush(state, talk);
    }
    return controls;
  }
  if (town.phase === 'pan') {
    // The camera races back down the street to the curio shop
    state.cameraOverride = { x: t.x1, y: 0 };
    if (town.t > 20) {
      town.phase = 'revive'; town.t = 0; cab.state = 'parked'; cab.t = 0;
      playSound('truckhorn');
      queueLines(state, talk, [{ who: 'riggs', text: 'ONE BULLET?! IN ONE EAR AND OUT THE OTHER, BABY! NOTHING IN THERE TO HIT!' }]);
    }
    return { ...NO_CONTROLS };
  }
  if (town.phase === 'revive') {
    state.cameraOverride = { x: t.x1, y: 0 };
    // Revving, backing out of the wall, spinning round (and off, him still talking)
    if (cab.state === 'parked' && town.t > 15) { cab.state = 'reverse'; cab.t = 0; }
    if (cab.state === 'reverse') { cab.x += 3.5; if (town.t % 4 === 0) fx.spawnExplosion({ x: t.crash - 40, y: Y - 80 }, '#A8A29E', 3, 0, 8); if (cab.t > 30) { cab.state = 'spin'; cab.t = 0; playSound('horn'); } }
    if (cab.state === 'spin') { cab.spin = Math.min(1, cab.t / 16); cab.x += 1; if (cab.t >= 16) { cab.facing = 1; cab.spin = 0; cab.state = 'go'; cab.t = 0; } }
    if (cab.state === 'go' && cab.t > 20) {
      town.phase = 'chase'; town.t = 0;
      // Everyone up the street sees it coming
      for (const e of town.tourists) { e.aiState = 'flee'; e.aiTimer = -Math.floor(Math.random() * 30); e.facing = 1; }
    }
    if (cab.state === 'go') cab.x += 1;
    return { ...NO_CONTROLS };
  }
  if (town.phase === 'jail') return jailScene(ctx, town, talk, controls);
  if (town.phase === 'chase' || town.phase === 'incoming') {
    const speed = town.phase === 'chase' ? CHASE_SPEED : RUSH_SPEED;
    // (anyone of Dale's still about has seen what's coming too: they stop dead where they are, staring at it, no
    // more coming at him; it gets them all, on the street or up on the roofs)
    for (const e of state.enemies) if (e.health > 0 && !e.isBlownAway && e.type !== 'boss' && !e.innocent) { e.pauseTimer = Math.max(e.pauseTimer || 0, 2); e.vel.x = 0; e.facing = -1; }
    cab.speed += (speed - cab.speed) * 0.1;
    cab.x += cab.speed;
    plow(ctx, town);
    if (town.phase === 'chase') {
      // Following it up the street till it's close enough, then back to him
      state.cameraOverride = { x: cab.x + CAB.w - 520, y: 0 };
      if (p.pos.x - (cab.x + CAB.w) < HANDOVER) {
        // Back to him, and it stays put there: him on the right of it, the cab coming in off the left
        town.phase = 'incoming'; town.t = 0;
        town.lockX = Math.round(p.pos.x + p.width / 2 - CANVAS_WIDTH * 0.62);
        state.cameraOverride = { x: town.lockX, y: 0 };
      }
      return { ...NO_CONTROLS };
    }
    // Coming for him: clear it, or else. (Come down on its roof and it bounces you back up off it). The camera's locked
    // on it and he's kept on the screen: no running off up the street to the jail, or back down it
    const lockX = town.lockX ?? state.camera.x;
    state.cameraOverride = { x: lockX, y: 0 };
    if (p.pos.x < lockX + 10) { p.pos.x = lockX + 10; if (p.vel.x < 0) p.vel.x = 0; }
    if (p.pos.x + p.width > lockX + CANVAS_WIDTH - 10) { p.pos.x = lockX + CANVAS_WIDTH - 10 - p.width; if (p.vel.x > 0) p.vel.x = 0; }
    const feet = p.pos.y + p.height;
    // (keeping count of how he's trying it: a plain jump won't clear it)
    if (p.isGrounded) { town.jumped = false; town.boosted = false; } else { town.jumped = true; if (p.isUppercutting) town.boosted = true; }
    // (a cab-over: flat on top, the full height of it all the way along)
    const roofs = [{ x: cab.x + 6, w: CAB.w - 12, top: Y - CAB.h }];
    const onRoof = roofs.find(r => p.pos.x + p.width > r.x && p.pos.x < r.x + r.w && feet >= r.top - 4 && feet <= r.top + 30 && p.vel.y >= 0);
    if (onRoof) { p.isUppercutting = false; p.isDivekicking = false; p.pos.y = onRoof.top - p.height - 1; p.vel.y = -11; p.isGrounded = false; p.coyoteAirTimer = 0; p.coyoteJumpTimer = 0; p.jumpHoldTimer = 0; playSound('tinkle'); }
    const hit = roofs.some(r => rectsOverlap({ x: r.x, y: r.top + 30, w: r.w, h: Y - r.top - 30 }, boundsOf(p)));
    if (state.deathTimer <= 0 && hit) {
      p.hidden = true;
      fx.spawnDeathShower({ x: p.pos.x + p.width / 2, y: p.pos.y + 30 }, 1, 3);
      shakeScreen(state, 30, 12);
      // (charged it head on, or slid at it: the death screen has something to say about that; jumped, and not high
      // enough: it's an uppercut that clears it, and the death screen says so)
      const lines = p.isCharging && p.isSliding
        ? ['SLID UNDER A TRUCK. IT HAD WHEELS', 'LEG DAY MEETS FRONT BUMPER', 'YOU SLIDE-TACKLED A TRUCK. THE TRUCK DID NOT FALL OVER']
        : p.isCharging
        ? ['YOU SHOULDER-CHARGED A MOVING TRUCK', 'TRUCK: 1, DELTS: 0', "THE TRUCK DIDN'T EVEN SLOW DOWN", 'MEAT VERSUS METAL. METAL WINS']
        : town.jumped && !town.boosted
        ? ["A JUMP WON'T CLEAR IT. UPPERCUT!", 'NOT A JUMP. AN UPPERCUT.', 'IT TAKES AN UPPERCUT TO CLEAR IT']
        : ['FLATTENED BY A DEAD MAN', 'RUN OVER BY RIGGS. AGAIN.', 'SHOULD HAVE UPPERCUT OVER IT'];
      killPlayer(ctx, lines[Math.floor(Math.random() * lines.length)], false);
      return { ...NO_CONTROLS };
    }
    // Cleared it: over to the jail
    if (cab.x > p.pos.x + p.width + 60 && state.deathTimer <= 0) { town.phase = 'jail'; town.t = 0; hush(state, talk); }
    return controls;
  }
  return controls;
};

/**
 * Over him and away up the street, and a cut to the fake jail: the guy locked in it for a photo sees what's coming,
 * the "sheriff" who's got the keys takes one look and runs for it, and the guy begs through the bars (it's not a
 * bit, it's not funny, he has a timeshare) while the horn gets closer. Then the cab comes through the front of the
 * jail from off the edge of the screen, him and Riggs and all. A moment on the wreck, and back to Meathead.
 */
const JAIL_BEGGING = [
  { who: 'prisoner', text: 'IS THAT A TRUCK?! SHERIFF DAN?!' },
  { who: 'sheriff', text: 'NOPE! NOT FOR TEN BUCKS AN HOUR!' },
  { who: 'prisoner', text: 'DAN! GIMME THE KEYS! STOP PLAYING! LET ME OUT!' },
  { who: 'prisoner', text: 'I HAVE A TIMESHARE!' },
] as const;
/** The latest the cab comes (if the begging's still going), and how long on the wreck after. */
const JAIL_CAB_BY = 720, JAIL_AFTER = 120;
/** The skip works (and says so) after this long. */
export const JAIL_SKIP_AFTER = SKIP_AFTER;

const jailScene = (ctx: FrameContext, town: Town, talk: Talk, controls: Controls): Controls => {
  const { state } = ctx;
  const p = state.player;
  const t = T();
  const cab = town.cab;
  const camX = t.jail.x1 - 430;
  if (town.t === 1) {
    // (the cab's off up the street, out of sight, till it's time)
    cab.x = camX - CAB.w - 700; cab.speed = 0;
    state.cameraOverride = { x: camX, y: 0 };
    state.camera.x = camX;
    queueLines(state, talk, JAIL_BEGGING.map(l => ({ ...l })), 20);
    // Whoever's left up the street, he got on the way (off screen): just the sheriff and the guy in the cell, here
    town.tourists = [];
    town.gore = 1;
    // (and nobody else in the shot: no goons, no bodies still coming down)
    state.enemies = state.enemies.filter(e => e.type === 'boss' || e.pos.x + e.width < camX - 100 || e.pos.x > camX + CANVAS_WIDTH + 100);
  }
  // Skipped: straight to it coming through the wall
  const skippable = town.t > JAIL_SKIP_AFTER && town.crashedAt < 0;
  if (skippable) offerSkip();
  if (skippable && takeSkip()) {
    hush(state, talk); cancelSpeech();
    town.sheriff.running = true; town.sheriff.x = Math.max(town.sheriff.x, camX + CANVAS_WIDTH + 60);
    cab.speed = 26; cab.x = t.jail.x1 + 30 - CAB.w;
  }
  if (town.crashedAt < 0) state.cameraOverride = { x: camX, y: 0 };
  p.vel.x = 0;
  // Dan's off once he's said his piece
  if (!town.sheriff.running && town.t > 30 && !talk.queue.some(l => l.who === 'sheriff') && talk.current?.who !== 'sheriff') town.sheriff.running = true;
  if (town.sheriff.running) town.sheriff.x += 5;
  // The horn, closer and closer
  if (town.crashedAt < 0 && town.t > 40 && town.t % Math.max(10, 50 - Math.floor(town.t / 16)) === 0) playSound('truckhorn');
  // Here it comes (he's begged enough)
  const begged = !talk.current && !talk.queue.length && town.t > 60;
  if (cab.speed === 0 && town.crashedAt < 0 && (begged || town.t >= JAIL_CAB_BY)) { cab.speed = 26; town.sheriff.running = true; }
  if (town.crashedAt < 0 && cab.speed > 0) {
    cab.x += cab.speed;
    plow(ctx, town);
    if (cab.x + CAB.w >= t.jail.x1 + 30) { const now = town.t; hush(state, talk); crashIntoJail(ctx, town, talk); town.phase = 'jail'; town.t = now; town.crashedAt = now; }
  }
  if (town.crashedAt >= 0 && town.t >= town.crashedAt + JAIL_AFTER) {
    town.phase = 'crashed'; town.t = 0;
    state.cameraOverride = null;
    return controls;
  }
  return { ...NO_CONTROLS };
};

/** How far up the street Riggs's cab has come through town (the wreckage behind it), or 0 if it hasn't. */
export const cabReach = (state: GameState) => Number(state.stageMemo.cabReach || (state.stageMemo.jailWrecked ? T().jail.x2 : 0)) || 0;

/** Blood on the street where Riggs got a tourist (kept in the stage's memory, so it's still there after a death). */
const addStain = (state: GameState, x: number) => {
  const list = townStains(state);
  list.push(Math.round(x));
  state.stageMemo.townStains = JSON.stringify(list.slice(-60));
};
export const townStains = (state: GameState): number[] => { try { return JSON.parse(state.stageMemo.townStains || '[]'); } catch { return []; } };

/** When to go up: the boost jump has to be on its way up (it's tall) before the cab gets there. */
const JUMP_FROM = 300, JUMP_TO = 100;
/** How far off the cab is, as a share of the run-up (1 = on him), for the meter; whether it's time to jump, and when that is on the meter. */
export const incoming = (state: GameState, town: Town) => {
  if (town.phase !== 'incoming') return null;
  const gap = state.player.pos.x - (town.cab.x + CAB.w);
  return { k: Math.max(0, Math.min(1, 1 - gap / HANDOVER)), jump: gap < JUMP_FROM && gap > JUMP_TO, zone: [1 - JUMP_FROM / HANDOVER, 1 - JUMP_TO / HANDOVER] as const };
};

/** Through everything in its way: the tourists, the cutouts, the barrels. */
const plow = (ctx: FrameContext, town: Town) => {
  const { state, fx } = ctx;
  const cab = town.cab;
  const front = cab.x + CAB.w;
  // (how far up the street it's been: everything behind that's taken a beating, and stays that way)
  if (front > cabReach(state)) state.stageMemo.cabReach = String(Math.round(front));
  // Anyone of Dale's still about (left alive): the same as the tourists, in the street; up on the roofs, or up in the
  // air, the wind of it going by takes them off and away
  for (const e of state.enemies) {
    if (e.health <= 0 || e.isBlownAway || e.type === 'boss') continue;
    if (e.pos.x + e.width < cab.x || e.pos.x > front + 10) continue;
    e.health = 0;
    if (e.pos.y + e.height >= Y - CAB.h) roadkill(ctx, town, e);
    else {
      fx.blowAwayEnemy(e, { x: 16 + Math.random() * 10, y: -16 - Math.random() * 10 }, 'charge_kill', 1, 1.5);
      fx.spawnDamageNumber({ x: e.pos.x, y: e.pos.y - 30 }, FLUNG[Math.floor(Math.random() * FLUNG.length)], true, '#F87171');
      playSound('whoosh');
    }
  }
  // The tourists: every last one
  town.tourists = town.tourists.filter(e => {
    if (e.pos.x + e.width < cab.x || e.pos.x > front + 10) return true;
    e.health = 0;
    state.enemies.push(e);
    roadkill(ctx, town, e);
    return false;
  });
  for (const pr of town.props) {
    if (pr.flying || pr.x < cab.x || pr.x > front) continue;
    pr.flying = true; pr.vx = 10 + Math.random() * 8; pr.vy = -12 - Math.random() * 8;
    playSound('crash');
  }
};

const SPLATS = ['ROADKILL!', 'SPLAT!', 'NO REFUNDS!', 'TOURIST TRAP!', 'WRONG WAY!', 'SPLORCH!', 'HIT AND RUN!'];
const FLUNG = ['SLIPSTREAMED!', 'GONE WITH THE WIND!', 'AIRBORNE!', 'SWEPT AWAY!'];

/** Under the cab: thrown up and away, in pieces, the street painted with it. */
const roadkill = (ctx: FrameContext, town: Town, e: Enemy) => {
  const { state, fx } = ctx;
  fx.blowAwayEnemy(e, { x: 18 + Math.random() * 12, y: -14 - Math.random() * 12 }, 'charge_kill', 1, 2.6);
  fx.spawnDeathShower({ x: e.pos.x + e.width / 2, y: Y - 40 }, 1, 2);
  fx.spawnDamageNumber({ x: e.pos.x, y: e.pos.y - 40 - Math.random() * 30 }, SPLATS[Math.floor(Math.random() * SPLATS.length)], true, '#F87171');
  // (and what's left of them, all over the street)
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: e.pos.x + e.width / 2, y: Y - 30 }, vel: { x: 4 + Math.random() * 14, y: -Math.random() * 12 }, life: 40 + Math.random() * 30, color: i % 3 ? '#991B1B' : '#DC2626', size: 3 + Math.random() * 6 });
  town.gore = Math.min(1, town.gore + 0.1);
  // (and where it happened stays painted: it doesn't wash off)
  addStain(state, e.pos.x + e.width / 2);
  shakeScreen(state, 10, 6);
  if (state.frame - town.screamAt > 35) { town.screamAt = state.frame; playSound('screams'); }
};

const updateProps = (ctx: FrameContext, town: Town) => {
  for (const pr of town.props) {
    if (!pr.flying) continue;
    pr.vy += 0.6; pr.x += pr.vx; pr.y += pr.vy; pr.rot += pr.vx * 0.02;
    if (pr.y > Y + 400) pr.vy = 0;
  }
  void ctx;
};

const crashIntoJail = (ctx: FrameContext, town: Town, talk: Talk) => {
  const { state, fx } = ctx;
  const t = T();
  town.phase = 'crashed'; town.t = 0;
  town.cab.state = 'wrecked'; town.cab.speed = 0;
  town.prisoner.alive = false;
  state.blocks = state.blocks.filter(b => b.tag !== 'jail');
  for (let k = 0; k < 6; k++) fx.spawnExplosion({ x: t.jail.x1 + 40 + k * 50, y: Y - 60 - (k % 3) * 40 }, k % 2 ? '#F97316' : '#FDE047', 30, 0, 32);
  fx.spawnExplosion({ x: t.jail.x1 + 150, y: Y - 120 }, '#1C1917', 40, 0, 26);
  fx.spawnDeathShower({ x: t.jail.x1 + 120, y: Y - 60 }, 1, 2);
  shakeScreen(state, 44, 15);
  playSound('crash');
  // The guy in the cell (and what's left of Riggs), everywhere: geysers of it, bits of them, his souvenir hat
  for (let k = 0; k < 4; k++) fx.spawnDeathShower({ x: t.jail.x1 + 110 + k * 40, y: Y - 60 - k * 25 }, k % 2 ? 1 : -1, 3.5);
  const reds = ['#991B1B', '#DC2626', '#7F1D1D', '#B91C1C'];
  for (let i = 0; i < 120; i++) state.particles.push({ pos: { x: t.jail.x1 + 100 + Math.random() * 160, y: Y - 40 - Math.random() * 120 }, vel: { x: (Math.random() - 0.35) * 22, y: -4 - Math.random() * 18 }, life: 60 + Math.random() * 50, color: i % 5 === 0 ? '#78716C' : reds[i % reds.length], size: 3 + Math.random() * 8 });
  // (chunks: an arm, a leg, a boot, a trucker cap)
  for (const [c, sz] of [['#F2C9A0', 12], ['#F2C9A0', 14], ['#44403C', 11], ['#1E3A8A', 10], ['#1C1917', 13], ['#E0AC69', 12]] as const) state.particles.push({ pos: { x: t.jail.x1 + 170, y: Y - 110 }, vel: { x: (Math.random() - 0.3) * 18, y: -12 - Math.random() * 10 }, life: 90, color: c, size: sz });
  fx.spawnDamageNumber({ x: t.jail.x1 + 160, y: Y - 230 }, 'TIMESHARE: VACANT', true, '#FACC15'); fx.announceKill('TIMESHARE: VACANT');
  fx.spawnDamageNumber({ x: t.jail.x1 + 40, y: Y - 330 }, 'CASE CLOSED!', true, '#F87171');
  state.stageMemo.jailWrecked = 'yes';
  queueLines(state, talk, [{ who: 'meathead', text: "RIGGS, BUDDY... YOUR LIZARD'S GONNA HAVE TO FEND FOR HIMSELF." }], 50);
};

/** The wreck's still burning (for the draw). */
export const jailWrecked = (state: GameState, town: Town) => town.phase === 'crashed' || !!state.stageMemo.jailWrecked;
