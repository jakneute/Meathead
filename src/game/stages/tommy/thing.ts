// The cistern, and what lives in it: everyone the water killed. The East Side,
// run down the drains over the years and come together down here into one
// great mass of the muck with all of them still in it, bones and faces and
// hands against the inside of it. It can't die. It's tried. It wants him to
// do it, and it knows how: it asks for one thing at a time (the cold, the
// fire, the rocks, a wave of clean water), and what it asks for hurts it a
// lot more than anything else, and satisfies it. Anything else it'll put up
// with, once; ignore it twice running (hit it with the wrong thing, or keep it
// waiting) and it brings a fist the size of a car down on the walkway, slowly,
// and there's nowhere to go. Low on what it wants? It brings some up for him.
//
// Not hostile. Not at first.

import type { Enemy, Projectile, WeaponType } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { shakeScreen } from '../../core/state';
import { playSound } from '../../platform/audio';
import { makeKindEnemy } from '../../enemies/kinds';
import { hurtPlayer } from '../../bosses/shared';
import { weaponOf, midBossProjectileDamage } from '../../combat/midBoss';
import { MAX_AMMO, CANVAS_WIDTH, GROUND_Y } from '../../../constants';
import { COURSE, CP } from './course';
import { Talk, queueLines, replaceLines, hush } from './script';

export type ThingPhase = 'dormant' | 'rise' | 'fight' | 'dying' | 'dead';
export interface Thing {
  phase: ThingPhase;
  t: number;
  e: Enemy | null;
  /** What it wants now, how much of it it's had, how long it's been asking, and whether it's had its fill. */
  want: WeaponType;
  fed: number;
  asked: number;
  full: number;
  /** Times running it's been ignored (two and the fist comes down), and when it last counted one. */
  strikes: number;
  /** When it last asked for something new (a moment's grace after, for shots already on their way). */
  askedAt: number;
  struckAt: number;
  /** The fist: frames into it (0 none). */
  fist: number;
  /** What hit it last (and killed it, in the end). */
  lastWeapon: WeaponType | 'MELEE';
  /** Its health a frame ago (to see what the flames and the wave took off it). */
  prevHealth: number;
  /** The last time it brought ammo up for him. */
  spatAt: number;
  /** How many requests it's made. */
  asks: number;
  /** How it died, and the frames since. */
  death: WeaponType | 'MELEE' | null;
  deathT: number;
  /** Everything it takes a hit from flashes it (per weapon). */
  flash: number;
  /** What it's asking for right now in its words, and what's up on the screen (that changes when it says it). */
  askLine: string;
  shown: WeaponType | null;
  shownAt: number;
  /** Muck dropping off the cistern's roof onto the walkway: where, and how far along (see DROP_*). */
  drops: Drop[];
  dropAt: number;
}

/** A glob of the muck off the roof: a drip forming up there and its mark on the walkway below ('warn'), falling, then a puddle eating at whatever's in it. */
export interface Drop { x: number; y: number; vy: number; state: 'warn' | 'fall' | 'puddle'; t: number }
/** The roof it drops from; how long it warns; the puddle's reach and how long it lasts; what they take off him. */
export const DROP_FROM = GROUND_Y - 480, DROP_WARN = 55, PUDDLE_R = 34, PUDDLE_FRAMES = 150;
const DROP_DAMAGE = 12, PUDDLE_DAMAGE = 6;
/** How often one comes down (quicker as it goes on), and sometimes a second, anywhere on the walkway. */
const DROP_EVERY = 150;

/** What it can ask for (one of them at random each time). */
const MENU: WeaponType[] = ['SHOTGUN', 'FLAMETHROWER', 'BOULDER', 'TSUNAMI'];
/** What it calls them. */
export const WANT_NAME: Partial<Record<WeaponType, string>> = { SHOTGUN: 'THE ICE', FLAMETHROWER: 'FIRE', BOULDER: 'ROCKS', TSUNAMI: 'A WAVE' };
const ASK_LINES: Partial<Record<WeaponType, string[]>> = {
  SHOTGUN: ['THE COLD. FREEZE US. PLEASE. THE ICE.', 'ICE! WE WANT TO FEEL SOMETHING THAT ISN\'T WARM!'],
  FLAMETHROWER: ['BURN US. BOIL US AWAY. THE FIRE.', 'FIRE! LIKE THE REFINERY! PLEASE!'],
  BOULDER: ['ROCKS. THROW ROCKS AT US. BREAK US.', 'THE ROCKS! SMASH THE BONES LOOSE!'],
  TSUNAMI: ['WATER. CLEAN WATER. WE HAVEN\'T SEEN CLEAN WATER IN YEARS.', 'A WAVE OF CLEAN WATER! DROWN US IN IT!'],
};
const THANKS = ['YES... YES...', 'MORE... THANK YOU...', 'WE FELT THAT. ALL OF US.', 'OH, THAT\'S THE GOOD STUFF.'];
const WRONG = ['NOT THAT.', 'THAT\'S NOT WHAT WE ASKED FOR.', 'ARE YOU LISTENING TO US?'];
const WAITING = ['WE\'RE WAITING...', 'MEATHEAD. WE ASKED YOU FOR SOMETHING.'];
const FIST_LINES = ['WE ASKED NICELY.', 'LISTEN. TO. US.', 'WE WERE A NEIGHBORHOOD ONCE. WE HAD MANNERS.'];

/** What it takes from what it wants, on top (x this much), and how much of it satisfies it (per request). */
const WANT_MULT = 2.2;
export const NEED: Partial<Record<WeaponType, number>> = { SHOTGUN: 1300, FLAMETHROWER: 1300, BOULDER: 1300, TSUNAMI: 1150 };
/** How long it'll wait for what it asked for before that counts against him; how long between counting wrong hits. */
const ASK_PATIENCE = 9 * 60, WRONG_EVERY = 90;
/** It gets less patient, and quicker about it, the further the fight goes: at the end it waits this much less (and
 * moves on quicker when it's sated, and counts wrong hits sooner). */
const HURRY = 0.45;
/** How far into the fight (0 fresh, 1 dead), and what that makes a wait of `n` frames. */
const hurried = (th: Thing, n: number) => { const e = th.e; const k = e ? Math.max(0, Math.min(1, 1 - e.health / e.maxHealth)) : 0; return Math.round(n * (1 - HURRY * k)); };
/** The fist: the wind-up (up and over, slowly), when it lands, and what it does. */
export const FIST_UP = 110, FIST_LAND = 150, FIST_DONE = 200;
const FIST_DAMAGE = 26;
/** Bringing up ammo: when what it wants is under this share, no more often than this. */
const SPIT_BELOW = 0.34, SPIT_EVERY = 6 * 60;

export const createThing = (state: GameState, startedAt: number): Thing => {
  void state;
  return {
    phase: startedAt > CP.CISTERN ? 'dead' : 'dormant', t: 0, e: null, want: MENU[0], fed: 0, asked: 0, full: 0, strikes: 0, struckAt: -999, askedAt: -999,
    fist: 0, lastWeapon: 'GUN', prevHealth: 0, spatAt: -999, asks: 0, death: startedAt > CP.CISTERN ? 'TSUNAMI' : null, deathT: 999, flash: 0,
    askLine: '', shown: null, shownAt: 0, drops: [], dropAt: 0,
  };
};

/** Where it sits: up out of the pool at the far end of the cistern (x its middle, y the bottom of the pool). */
export const thingSpot = () => ({ x: (COURSE.sewer.cistern.pool + COURSE.sewer.cistern.x2 - 80) / 2, y: GROUND_Y + 220 });
/** The muck's surface in its pool (where the drawing of it stands). */
export const THING_SURFACE = GROUND_Y + 20;

const say = (state: GameState, talk: Talk, text: string, now = false) => (now ? replaceLines(state, talk, [{ who: 'thing', text }], 0) : queueLines(state, talk, [{ who: 'thing', text }], 6));
const pick = (l: string[], k: number) => l[k % l.length];

/** The room's turn: it wakes when he comes in, the fight, its death; `onDead` once it's gone (the way out opens up). */
export const updateThingRoom = (ctx: FrameContext, th: Thing, talk: Talk, controls: Controls, onDead: () => void): Controls => {
  const { state } = ctx;
  const p = state.player;
  const C = COURSE.sewer.cistern;
  th.t++;
  if (th.flash > 0) th.flash--;
  // (locked in with it from the moment he's in the room, till it's dead)
  if (th.phase === 'rise' || th.phase === 'fight' || th.phase === 'dying') {
    state.cameraMinX = C.x2 - CANVAS_WIDTH; state.cameraMaxX = C.x2 - CANVAS_WIDTH;
    // (framed on the whole of it: it's the size of the room)
    state.cameraOverride = { x: C.x2 - CANVAS_WIDTH, y: GROUND_Y - 500 };
  }
  if (th.phase !== 'dormant' && !p.inCutscene) {
    // (the pool's its, and it's deep: he doesn't get to wade out into it, though whatever he throws does)
    const edge = C.pool + 16;
    if (p.pos.x + p.width > edge) { p.pos.x = edge - p.width; if (p.vel.x > 0) p.vel.x = 0; }
  }
  switch (th.phase) {
    case 'dormant':
      if (p.pos.x > C.x1 + 60 && p.isGrounded) {
        th.phase = 'rise'; th.t = 0;
        const s = thingSpot();
        const e = makeKindEnemy('amalgam', s.x, s.y);
        state.enemies.push(e);
        th.e = e; th.prevHealth = e.health;
        state.blocks.push({ x: C.x1 - 40, y: GROUND_Y - 3000, w: 40, h: 3000, type: 'wall', hidden: true, tag: 'cistern-door' });
        state.checkpoint = Math.max(state.checkpoint, CP.CISTERN);
        playSound('roar'); shakeScreen(state, 60, 4);
        hush(state, talk);
        queueLines(state, talk, [
          { who: 'thing', text: 'WE DRANK THE WATER. PLEASE. KILL US.' },
          { who: 'meathead', text: 'YEAH, OKAY.' },
        ], 20);
      }
      return controls;
    case 'rise':
      // Up out of the pool, and its piece said
      p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
      // (the fight's on as soon as it's up: its first ask comes after what's being said)
      if (th.t > 90) { th.phase = 'fight'; th.t = 0; ask(state, th, talk, true); }
      return th.t < 90 ? { ...NO_CONTROLS } : controls;
    case 'fight': return fight(ctx, th, talk, controls);
    case 'dying':
      th.deathT++;
      if (th.deathT === 1) { hush(state, talk); say(state, talk, 'THANK... YOU...', true); }
      if (th.deathT === 260) { th.phase = 'dead'; state.blocks = state.blocks.filter(b => b.tag !== 'cistern-door'); state.cameraOverride = null; onDead(); }
      return controls;
    default: return controls;
  }
};

const ask = (state: GameState, th: Thing, talk: Talk, first = false) => {
  // Everything he's got on him, in a shuffled order, each once before any comes round again (and never the same thing
  // twice running). The order carries on across his tries at it: dying doesn't start it over on the same few
  const have = (w: WeaponType) => (state.availableWeapons ?? state.player.availableWeapons ?? []).includes(w);
  const owned = MENU.filter(have);
  const menu = owned.length ? owned : MENU;
  let bag = (state.stageMemo.thingBag ?? '').split(',').filter(w => menu.includes(w as WeaponType)) as WeaponType[];
  if (!bag.length) {
    bag = [...menu].sort(() => Math.random() - 0.5);
    if (bag.length > 1 && bag[0] === th.want && !first) bag.push(bag.shift()!);
  }
  th.want = bag.shift() ?? MENU[0];
  state.stageMemo.thingBag = bag.join(',');
  th.asks++;
  th.fed = 0; th.asked = 0; th.full = 0; th.askedAt = state.frame;
  th.askLine = pick(ASK_LINES[th.want]!, th.asks);
  say(state, talk, th.askLine, !first);
};

/** The first few seconds of the fight: shooting it straight away (before it's said what it wants) doesn't count against him. */
export const GRACE_FRAMES = 240;
/** Just sated, on to the next thing: a second before the old weapon counts as the wrong one. */
const SATED_GRACE = 60;
export const inGrace = (th: Thing) => th.phase === 'fight' && th.t < GRACE_FRAMES;

/** A mark against him: twice running and the fist comes down. */
const strike = (state: GameState, th: Thing, talk: Talk, line: string) => {
  if (th.fist) return;
  th.strikes++; th.struckAt = state.frame; th.asked = 0;
  if (th.strikes >= 2) { th.fist = 1; th.strikes = 0; say(state, talk, pick(FIST_LINES, th.asks + state.frame), true); }
  else say(state, talk, line, true);
};

const fight = (ctx: FrameContext, th: Thing, talk: Talk, controls: Controls): Controls => {
  const { state, fx } = ctx;
  const p = state.player;
  const e = th.e!;
  th.asked++;
  // What's up on the screen changes when it says what it wants (or, with no voice, as the line goes up)
  if (th.shown !== th.want && (talk.current?.text === th.askLine || (th.asked > 240))) { th.shown = th.want; th.shownAt = state.frame; }
  // What the flames and the wave took off it since last frame (the shots it counts as they land)
  const took = th.prevHealth - e.health;
  if (took > 0) {
    const w: WeaponType | null = state.tsunamiActive ? 'TSUNAMI' : p.isFlaming && p.currentWeapon === 'FLAMETHROWER' ? 'FLAMETHROWER' : null;
    if (w) feed(ctx, th, talk, w, took);
  }
  // Satisfied: a moment of bliss, then the next thing
  if (th.full > 0 && ++th.full > hurried(th, 70)) ask(state, th, talk);
  // Kept waiting
  else if (!th.full && !inGrace(th) && th.asked > hurried(th, ASK_PATIENCE)) strike(state, th, talk, pick(WAITING, th.asks));
  // The fist
  if (th.fist) {
    th.fist++;
    if (th.fist === 20) playSound('roar');
    if (th.fist === FIST_LAND) {
      shakeScreen(state, 40, 16); playSound('slam'); playSound('splash');
      // Across the whole walkway: nowhere to go (and no getting out of it on the moment of grace after a hit from something else)
      p.invincibilityTimer = 0;
      if (p.health > 0) hurtPlayer(ctx, FIST_DAMAGE, 'amalgam_fist', { x: -4, y: -9 });
      fx.spawnDamageNumber({ x: p.pos.x - 30, y: p.pos.y - 50 }, 'SMASHED!', true, '#A3E635');
      for (let i = 0; i < 40; i++) state.particles.push({ pos: { x: COURSE.sewer.cistern.x1 + 200 + Math.random() * 300, y: GROUND_Y - 4 }, vel: { x: (Math.random() - 0.5) * 12, y: -3 - Math.random() * 9 }, life: 40, color: i % 2 ? '#4D7C0F' : '#A3E635', size: 4 + Math.random() * 6 });
    }
    if (th.fist >= FIST_DONE) { th.fist = 0; th.asked = 0; }
  }
  updateDrops(ctx, th);
  // Short on what it wants: it brings some up
  const w = th.want;
  if (MAX_AMMO[w] > 0 && (p.weaponAmmo[w] ?? 0) < MAX_AMMO[w] * SPIT_BELOW && state.frame - th.spatAt > SPIT_EVERY && !th.fist) {
    th.spatAt = state.frame;
    const m = { x: e.pos.x + 40, y: e.pos.y + 150 };
    // (lobbed to land on the walkway, near him, never out in the pool: a pickup's sideways speed dies off by a tenth a
    // frame, so it goes about nine times what it's thrown at)
    const C = COURSE.sewer.cistern;
    const land = Math.max(C.x1 + 50, Math.min(C.pool - 70, p.pos.x + p.width / 2 + 40));
    state.pickups.push({ id: `thing-ammo-${state.frame}`, pos: { x: m.x, y: m.y }, vel: { x: (land - 10 - m.x) / 9.5, y: -6 }, width: 20, height: 20, type: 'large_ammo', life: 900 });
    for (let i = 0; i < 14; i++) state.particles.push({ pos: { ...m }, vel: { x: -3 - Math.random() * 5, y: (Math.random() - 0.7) * 6 }, life: 30, color: i % 2 ? '#65A30D' : '#D9F99D', size: 3 + Math.random() * 4 });
    playSound('splat');
    say(state, talk, 'HERE. WE BROUGHT THIS UP FOR YOU.');
  }
  th.prevHealth = e.health;
  // Dead: however it went
  if (e.health <= 0) {
    th.phase = 'dying'; th.death = th.lastWeapon; th.deathT = 0; th.fist = 0; th.drops = [];
    e.health = 0;
    shakeScreen(state, 50, 8);
    playSound(th.death === 'FLAMETHROWER' ? 'ignite' : th.death === 'SHOTGUN' ? 'ice' : 'tsunami');
  }
  return th.fist > 0 && th.fist < FIST_DONE ? { ...controls } : controls;
};

/**
 * The muck off the roof: every so often (quicker as the fight goes on) a drip forms up there over where he's standing,
 * its mark on the walkway below swelling, then it drops, splashes, and leaves a puddle that eats at him for a while.
 * Standing still isn't an option.
 */
const updateDrops = (ctx: FrameContext, th: Thing) => {
  const { state } = ctx;
  const p = state.player;
  const C = COURSE.sewer.cistern;
  const clampX = (x: number) => Math.max(C.x1 + 30, Math.min(C.pool - 24, x));
  if (!th.fist && state.frame - th.dropAt > hurried(th, DROP_EVERY)) {
    th.dropAt = state.frame;
    th.drops.push({ x: clampX(p.pos.x + p.width / 2 + (Math.random() - 0.5) * 60), y: DROP_FROM, vy: 0, state: 'warn', t: 0 });
    if (Math.random() < 0.4) th.drops.push({ x: clampX(C.x1 + 30 + Math.random() * (C.pool - C.x1 - 54)), y: DROP_FROM, vy: 0, state: 'warn', t: -20 });
    playSound('glug', 0.5);
  }
  const box = { x: p.pos.x + 6, y: p.pos.y, w: p.width - 12, h: p.height };
  for (const d of th.drops) {
    d.t++;
    if (d.state === 'warn' && d.t >= DROP_WARN) { d.state = 'fall'; d.t = 0; }
    else if (d.state === 'fall') {
      d.vy += 1.1; d.y += d.vy;
      // (it's him it lands on, on the way down)
      if (d.x > box.x && d.x < box.x + box.w && d.y > box.y && d.y < box.y + box.h && p.invincibilityTimer <= 0 && p.health > 0) {
        hurtPlayer(ctx, DROP_DAMAGE, 'amalgam_drip', { x: (p.pos.x + p.width / 2 < d.x ? -1 : 1) * 4, y: -5 });
      }
      if (d.y >= GROUND_Y) {
        d.state = 'puddle'; d.t = 0; d.y = GROUND_Y;
        playSound('splat', 0.7);
        for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: d.x, y: GROUND_Y - 2 }, vel: { x: (Math.random() - 0.5) * 7, y: -2 - Math.random() * 5 }, life: 26, color: i % 2 ? '#65A30D' : '#D9F99D', size: 3 + Math.random() * 4 });
      }
    } else if (d.state === 'puddle') {
      const feet = p.pos.y + p.height;
      if (p.isGrounded && feet > GROUND_Y - 6 && Math.abs(p.pos.x + p.width / 2 - d.x) < PUDDLE_R + p.width / 2 - 8 && p.invincibilityTimer <= 0 && p.health > 0) {
        hurtPlayer(ctx, PUDDLE_DAMAGE, 'amalgam_drip', { x: (p.pos.x + p.width / 2 < d.x ? -1 : 1) * 5, y: -6 });
      }
    }
  }
  th.drops = th.drops.filter(d => !(d.state === 'puddle' && d.t > PUDDLE_FRAMES));
};

/** Damage from a weapon: extra from what it asked for (and that feeds it), the rest counts against him (now and then). */
const feed = (ctx: FrameContext, th: Thing, talk: Talk, w: WeaponType | 'MELEE', dmg: number) => {
  const { state, fx } = ctx;
  const e = th.e!;
  th.lastWeapon = w;
  th.flash = 6;
  if (w === th.want && !th.full) {
    const extra = dmg * (WANT_MULT - 1);
    e.health -= extra;
    th.fed += dmg * WANT_MULT;
    th.asked = 0; th.strikes = 0;
    if (state.frame % 8 === 0) fx.spawnDamageNumber({ x: e.pos.x + 60 + Math.random() * 80, y: e.pos.y + 120 }, Math.round(dmg * WANT_MULT), true, '#A3E635');
    if (th.fed >= (NEED[w] ?? 1300)) { th.full = 1; say(state, talk, pick(THANKS, th.asks), true); playSound('powerup'); }
  } else if (!th.full && !inGrace(th) && state.frame - th.askedAt > SATED_GRACE && state.frame - th.struckAt > hurried(th, WRONG_EVERY)) {
    strike(state, th, talk, pick(WRONG, th.asks + state.frame));
  }
};

/** A shot hitting it: counted, and what it asked for hurts it more. */
export const hitThing = (ctx: FrameContext, e: Enemy, p: Projectile, th: Thing, talk: Talk): true | 'miss' => {
  if (th.phase !== 'fight' || e.health <= 0) return 'miss';
  if (p.isSludge && p.isLingering) return 'miss';
  const dmg = midBossProjectileDamage(p);
  e.health -= dmg;
  th.prevHealth = e.health;
  feed(ctx, th, talk, weaponOf(p), dmg);
  if (p.isBoulder) for (let i = 0; i < 10; i++) ctx.state.particles.push({ pos: { x: p.pos.x, y: p.pos.y }, vel: { x: (Math.random() - 0.5) * 8, y: -Math.random() * 6 }, life: 26, color: i % 2 ? '#57534E' : '#A3E635', size: 3 + Math.random() * 5 });
  return true;
};

export const thingDeathMessage = (th: Thing): string | undefined =>
  th.phase === 'fight' && th.fist ? pick(['FLATTENED BY THE COMMUNITY', 'SHOULD HAVE LISTENED', 'THE EAST SIDE HAS SPOKEN'], Math.floor(Math.random() * 3)) : undefined;
