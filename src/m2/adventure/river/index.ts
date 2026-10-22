// THE RIVER: the Jungle Cruise with Safari Artie, then under it. See course.ts for the layout.
//
// The boat ride (the first time through: `boatRide`): he gets on at the dock, Artie welcomes him aboard (he came
// through the back; Artie doesn't care), the name comes up (Artie Avalanche: his brother, also Artie, a fucking
// asshole), the tour, the boat runs out of gas short of the backside of water, Artie radios maintenance (nobody comes,
// ever) and never shuts up. Getting out's up to him: into the water whenever he likes (Artie's not happy about it).
// The swim needs none of it: off the dock into the water does the same.
//
// Under the water: his air (bubbles from vents on the bed, pockets of air up through the tunnel's roof), the river's
// wildlife after him (kinds.ts), the theme park showing through (discarded rides, then animatronic dinosaurs), the
// aquatic dinosaur tank with the guests behind its glass, and the storm drain's intake: it pulls, then it has him,
// and he comes out over the raptor pen (the dino section's start, falling: `dinoArrival` set for it).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Enemy } from '../../../m1/types';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { groundBlocks, type GroundRun } from '../../../m1/game/core/terrain';
import { hazardVictims, hazardKill, setHazardZones } from '../../hazardHit';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { playSound } from '../../../m1/game/platform/audio';
import { SWIM_LEAP, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import type { Section } from '../section';
import { lay, solid, ledge, teleport, getAdv, sectionState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { talk, stepTalk, pick, type Talk, type Line } from '../queue/talk';
import { guestAt, type Guest } from '../queue/crowd';
import './kinds';
import {
  WS, CEIL, DOCK, BOAT, FALLS, TUNNEL, POCKETS, POCKET_TOP, TANK, PIPE, SUCK_AT, BED, bedAt, roofAt, PROPS, VENTS,
  PIRANHAS_BOAT, PIRANHAS, EELS, eelHome, SNAPPERS, GALLERY, CALLOUTS,
} from './course';
import {
  ARTIE_WELCOME, BROTHER, BROTHER_ARTIE, ARTIE_TOUR, ARTIE_GAS, ARTIE_RADIO, ARTIE_STUCK, MEATHEAD_STUCK, ARTIE_JUMPED, ARTIE_ALONE,
  MEATHEAD_JUMP, MEATHEAD_UNDER, MEATHEAD_AIR, GUESTS_SEE, GUESTS_KILL, type Dressed,
} from './lines';
import { drawRiverBackdrop, drawRiverBack, drawRiverFront, COUGHS } from './draw';
import { startRage, rageLine, stepRage, drawRage, type RageInset } from './rageInset';
import { warmGrossUps } from '../../grossKit';

const { x0, x1 } = SECTIONS.river;
const R = (x: number) => x0 + x;
const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

/**
 * The boat ride with Artie: on for the first trip. (Coming back later, there's no skipper: he just goes in off the
 * dock. Turn it off here and the swim's exactly the same.)
 */
export const boatRide = { on: true };

/** Air: frames of it held (about 22 seconds), how fast it comes back (a full tank in 3 seconds), what a bubble's worth. */
const AIR_FRAMES = 1350, AIR_REFILL = 7.5, BUBBLE_AIR = 0.3;
/** Out of air: a hurt this often. */
const DROWN_EVERY = 45, DROWN_DAMAGE = 7;
/** How far Artie's heard. */
const EARSHOT = 760;
/** How much of the tour he gets through on the way (the rest he does stuck). */
const TOUR_RIDE = 4;
/** Frames of quiet between Artie's lines once the boat's stuck (and after he's lost his guest). */
const STUCK_GAP = 100;

export type BoatPhase = 'moored' | 'ride' | 'stalled' | 'jumped';
export interface Bubble { x: number; y: number; r: number; vy: number }
/** A cloud in the water: blood off something he killed in it, or what's coming out of his pants. */
export interface Cloud { x: number; y: number; r: number; a: number; vx: number; vy: number; blood: boolean }
/** The river's state of it: how red and how brown the whole of it's got (0 to 1, seeping toward the `To`s), the clouds. */
export interface Stain { red: number; redTo: number; brown: number; brownTo: number; clouds: Cloud[]; bled: WeakSet<object>; recent: Map<object, { x: number; y: number; at: number }>; shatIn: boolean }
export interface River {
  /** Set up for where he's starting (the checkpoint's only known once the stage is built: the first frame does it). */
  init?: boolean;
  talk: Talk;
  /** He's been in the water this visit (the first time in, the piranhas keep off a moment). */
  wetYet?: boolean;
  boat: { x: number; v: number; phase: BoatPhase; block: ReturnType<typeof ledge> | null; onFor: number; rode: boolean; tour: number; n: number; smoke: number };
  /** What Artie's saying (shown over him), the radio's static after a call. */
  artieSaid: string | null; artieRadio: boolean; static: number;
  bags: Record<string, number[]>;
  o2: number; lowSaid: boolean; drownT: number;
  bubbles: Bubble[];
  said: Set<string>;
  guests: Guest[]; guestNext: number; tankDead: number;
  suck: number;
  stain: Stain;
  /** Artie losing it in a TV inset up in the corner, him gone over the side (rageInset.ts). */
  rage?: RageInset;
}
export const getRiver = (state: GameState) => sectionState<River>(state, 'river', () => ({
  talk: talk(),
  boat: { x: R(BOAT.x), v: 0, phase: 'moored', block: null, onFor: 0, rode: false, tour: 0, n: 0, smoke: 0 },
  artieSaid: null, artieRadio: false, static: 0, bags: {},
  o2: 1, lowSaid: false, drownT: 0, bubbles: [], said: new Set(),
  guests: [], guestNext: 200, tankDead: 0, suck: 0,
  stain: { red: 0, redTo: 0, brown: 0, brownTo: 0, clouds: [], bled: new WeakSet(), recent: new Map(), shatIn: false },
}));

/** A line from a pool (pickLine: nothing said again inside its cooldown; all of them recent, the longest ago). */
const fromBag = (_rv: River, _key: string, pool: readonly string[]) => pick(pool);
/**
 * A line of Artie's: worded for the state of Meathead's pants when it's said, not when it's queued (a blowout can
 * come any time). Each way's wording is settled the first time it's asked for (so a line from a bag stays put).
 */
const artie = (state: GameState, rv: River, words: (d: Dressed) => string, radio = false): Line => {
  const memo: Partial<Record<Dressed, string>> = {};
  return {
    voice: 'm2.safari',
    get text() { const d = dressed(state); return (memo[d] ??= words(d)); },
    set: t => { rv.artieSaid = t; rv.artieRadio = radio && !!t; if (!t && radio) rv.static = 70; },
  };
};
/** ...one of a pool (round the bag for that way before any comes again). */
const artieFrom = (state: GameState, rv: River, key: string, pool: Record<Dressed, readonly string[]>, radio = false) =>
  artie(state, rv, d => fromBag(rv, `${key}:${d}`, pool[d]), radio);
/** The spiel's next joke (in order: the same one, whichever way it's worded). */
const tour = (state: GameState, rv: River, i: number) => artie(state, rv, d => ARTIE_TOUR[d][i]);
const mh = (text: string): Line => ({ voice: 'meathead', text });

/** Where Artie stands in his boat (his feet). */
export const artieAt = (rv: River) => ({ x: rv.boat.x + 200, y: BOAT.deck });

// ---------------------------------------------------------------------------------------------------------------

const runsFrom = (pts: [number, number][]): GroundRun[] => pts.slice(1).map(([bx, by], i) => ({ x1: R(pts[i][0]), y1: pts[i][1], x2: R(bx), y2: by, surface: 'riverbed' }));

const build = (state: GameState) => {
  const rv = getRiver(state);
  // The dock (dry land), then the river bed (its blocks tagged: the camera leaves it alone till he's under)
  lay(state, [{ x1: x0, y1: GY, x2: R(DOCK), y2: GY, surface: 'dock' }]);
  const bed = runsFrom(BED);
  state.groundRuns.push(...bed);
  state.blocks.push(...groundBlocks(bed).map(b => ({ ...b, tag: 'seabed' })));
  const rock = (x: number, y: number, w: number, h: number) => solid(state, x, y, w, h, { hidden: true });
  // The backside of water, the tunnel's roof (up through it at the pockets, to a hollow over each), the tank's wall
  // down to the intake, the pipe's roof, the end
  rock(R(FALLS.x), -3000, FALLS.w, 3000 + FALLS.bottom);
  let x = TUNNEL.x1;
  for (const p of POCKETS) { rock(R(x), -3000, p.x - x, 3000 + CEIL); rock(R(p.x), -3000, p.w, 3000 + POCKET_TOP); x = p.x + p.w; }
  rock(R(x), -3000, TUNNEL.x2 - x, 3000 + CEIL);
  rock(R(TANK.x2), -3000, TANK.wall + (PIPE.x2 - PIPE.x1), 3000 + PIPE.top);
  rock(R(PIPE.x2), -3000, 200, 4500);
  for (const p of PROPS) solid(state, R(p.x), bedAt(p.x + p.w / 2) - p.h, p.w, p.h + 30, { hidden: true });
  // The boat (a deck to stand on: it moves), only on the boat ride
  if (boatRide.on) rv.boat.block = ledge(state, rv.boat.x, BOAT.deck, BOAT.w, { hidden: true });
  // The wildlife
  const fish = (x: number, y: number, box: Enemy['swimBox']) => {
    const e = makeKindEnemy('m2:piranha', R(x), y);
    e.swimBox = box; e.homeX = e.pos.x; e.homeY = e.pos.y;
    state.enemies.push(e);
  };
  const openBox = { x1: R(DOCK), x2: R(FALLS.x), y1: WS, y2: 870 };
  for (const px of PIRANHAS_BOAT) fish(px, WS + 90 + (px % 3) * 20, openBox);
  for (const [px, py] of PIRANHAS) {
    const tank = px >= TANK.x1;
    fish(px, py, tank ? { x1: R(TANK.x1), x2: R(TANK.x2), y1: WS, y2: 1020 } : { x1: R(TUNNEL.x1), x2: R(TUNNEL.x2), y1: CEIL, y2: 1010 });
  }
  for (const el of EELS) {
    const { y } = eelHome(el);
    const e = makeKindEnemy('m2:eel', R(el.x), y + 16);
    e.homeX = R(el.x); e.homeY = y; e.aiX = el.dir; e.aiState = 'in'; e.facing = el.dir;
    state.enemies.push(e);
  }
  for (const sx of SNAPPERS) {
    const e = makeKindEnemy('m2:snapper', R(sx), bedAt(sx) - 70);
    e.homeX = R(sx); e.homeY = bedAt(sx);
    state.enemies.push(e);
  }
  // The guests behind the tank's glass
  for (let i = 0, n = 12; i < n; i++) rv.guests.push(guestAt(i + 50, R(GALLERY.x1 + 40 + i * ((GALLERY.x2 - GALLERY.x1 - 80) / (n - 1))), GALLERY.floor, i % 3 === 0 ? -1 : 1, 1));
};

// ---------------------------------------------------------------------------------------------------------------
// The boat ride

/** Where the boat ride ended up, kept across his deaths (state.stageMemo): out of gas, or him gone over the side. */
interface BoatMemo { x: number; phase: 'stalled' | 'jumped' }
const MEMO = 'm2:riverBoat';
const memoOf = (state: GameState): BoatMemo | null => { try { return JSON.parse(state.stageMemo[MEMO] ?? 'null'); } catch { return null; } };
/** The ride's been and gone (out of gas, or him over the side after it): remembered, so dying doesn't send him round
 *  it again from the dock. */
const noteBoat = (state: GameState, rv: River) => {
  const b = rv.boat;
  if (!b.rode || (b.phase !== 'stalled' && b.phase !== 'jumped')) return;
  const m = memoOf(state);
  if (m?.phase === b.phase && Math.abs(m.x - b.x) < 1) return;
  state.stageMemo[MEMO] = JSON.stringify({ x: Math.round(b.x), phase: b.phase });
};
/** Back from dying after the ride (or started further on than the dock, under the river): the boat's where it gave
 *  out, Artie in it, stuck; no welcome aboard, no tour again. */
const restoreBoat = (state: GameState, rv: River) => {
  const b = rv.boat;
  const m = memoOf(state) ?? (state.checkpoint >= 21 ? { x: R(BOAT.stop), phase: 'jumped' as const } : null);
  if (!m || !b.block) return;
  b.x = m.x; b.block.x = b.x; b.v = 0; b.smoke = 0; b.onFor = 0;
  b.rode = true; b.phase = m.phase; b.tour = Math.max(b.tour, TOUR_RIDE);
  // (off it, he's off it: no climbing back aboard)
  if (m.phase === 'jumped') { const blk = b.block; state.blocks = state.blocks.filter(o => o !== blk); }
};

const onBoat = (state: GameState, rv: River) => {
  const p = state.player, b = rv.boat;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  return !!b.block && p.isGrounded && Math.abs(feet - BOAT.deck) < 3 && cx > b.x - 4 && cx < b.x + BOAT.w + 4;
};

const updateBoat = (state: GameState, rv: River) => {
  const b = rv.boat, t = rv.talk, p = state.player;
  if (!b.block) return;
  // (his gross-ups painted ahead in idle slices while he's aboard: the inset, him going over the side, never paints on the spot)
  if (b.phase !== 'jumped') warmGrossUps();
  const aboard = onBoat(state, rv);
  const near = Math.abs(p.pos.x - artieAt(rv).x) < EARSHOT && p.pos.y < 1100;
  // Out of earshot: whatever he had to say goes unheard (he's still saying it)
  if (!near) t.q = t.q.filter(l => l.voice !== 'm2.safari');
  // Boarding: welcome aboard, and off. The name comes up; the tour.
  if (b.phase === 'moored') {
    b.onFor = aboard ? b.onFor + 1 : 0;
    if (b.onFor > 15) {
      b.phase = 'ride'; b.rode = true;
      t.q.push(artie(state, rv, d => ARTIE_WELCOME[d][0]), artie(state, rv, d => ARTIE_WELCOME[d][1]));
      const bro = (i: number) => artie(state, rv, d => BROTHER_ARTIE[d][i]);
      t.q.push(mh(BROTHER.meathead1), bro(0), mh(BROTHER.meathead2), bro(1), mh(BROTHER.meathead3), bro(2), mh(BROTHER.meathead4));
    }
  }
  if (b.phase === 'ride') {
    // (the spiel, in order, once the introductions are done: the first of it on the way, the rest when he's stuck)
    if (!t.q.length && !t.busy && b.tour < TOUR_RIDE) t.q.push(tour(state, rv, b.tour++));
    // The boat's pace: there by the time he's done (a crawl, if he's not), never quicker than it goes
    const left = R(BOAT.stop) - b.x;
    const talkLeft = [...t.q, ...ARTIE_TOUR[dressed(state)].slice(b.tour, TOUR_RIDE).map(text => ({ text }))].reduce((n, l) => n + l.text.length * 4.5 + 30, 0) + 120;
    const want = left <= 0 ? 0.25 : Math.max(0.35, Math.min(BOAT.speed, left / talkLeft));
    b.v += (want - b.v) * 0.02;
    // Out of gas: the engine coughs, and that's it (once he's through the spiel, there or as near as makes no odds)
    if ((left <= 0 && b.tour >= TOUR_RIDE && !t.q.length) || b.x >= R(BOAT.stop + 160)) {
      b.phase = 'stalled'; b.smoke = 90;
      t.q = t.q.filter(l => l.voice !== 'm2.safari');
      t.q.push(artie(state, rv, d => ARTIE_GAS[d][0]), artie(state, rv, d => ARTIE_RADIO[d][0], true), artie(state, rv, d => ARTIE_GAS[d][1]));
    }
  } else if (b.v > 0) b.v = Math.max(0, b.v - 0.03);
  // (out of gas: the engine sputters, coughs black smoke a few times, backfires and dies)
  if (b.smoke > 0) {
    const sx = b.x - 22, sy = BOAT.deck - 18;
    if (b.smoke === 90) playSound('engine', 0.45, -9);
    if (COUGHS.includes(b.smoke)) {
      const last = b.smoke === COUGHS[COUGHS.length - 1];
      playSound('thud', last ? 0.7 : 0.45, last ? -2 : 4); playSound('click', 0.5, -3);
      if (last) { playSound('boom', 0.3, 8); for (let k = 0; k < 6; k++) state.particles.push({ pos: { x: sx - 4, y: sy + 4 }, vel: { x: -1.5 - Math.random() * 2, y: (Math.random() - 0.5) * 1.5 }, life: 10, color: k % 2 ? '#FDE047' : '#F97316', size: 4 }); }
      for (let k = 0; k < (last ? 9 : 5); k++) state.particles.push({ pos: { x: sx + (Math.random() - 0.5) * 6, y: sy + (Math.random() - 0.5) * 6 }, vel: { x: -0.6 - Math.random() * 1.2, y: -0.6 - Math.random() * 1.1 }, life: 50 + Math.random() * 30, color: k % 3 ? '#27272A' : '#52525B', size: 6 + Math.random() * 6 });
    }
    if (b.smoke === 20) playSound('clink', 0.6, -6);
    b.smoke--;
  }
  // Stuck: he never shuts up (the radio, the life story, round and round; Meathead's at the end of his rope)
  if (b.phase === 'stalled' && near && !t.q.length && !t.busy) {
    b.n++;
    // (a breather between them: he's not in a hurry, he's got nowhere to be)
    t.gap = Math.max(t.gap, STUCK_GAP);
    if (b.n % 4 === 0) t.q.push(artieFrom(state, rv, 'radio', ARTIE_RADIO, true));
    else if (b.tour < ARTIE_TOUR.clean.length) t.q.push(tour(state, rv, b.tour++));
    else t.q.push(artieFrom(state, rv, 'stuck', ARTIE_STUCK));
    if (b.n % 3 === 2) t.q.push(mh(fromBag(rv, 'mstuck', MEATHEAD_STUCK)));
  }
  // Over the side (whenever he likes): Artie's not happy. Then on at himself, and the radio.
  if (b.phase !== 'jumped' && p.swimming) {
    const wasRiding = b.phase !== 'moored';
    b.phase = 'jumped';
    t.q = [];
    // (off it, he's off it: Artie's not having him back aboard, there's no climbing back on)
    if (wasRiding && b.block) { const blk = b.block; state.blocks = state.blocks.filter(o => o !== blk); }
    if (wasRiding) t.q.push(mh(pick(MEATHEAD_JUMP)));
    if (wasRiding) {
      // (and up in the corner, Artie losing it: his line's the yell)
      const rage = rv.rage = startRage(), l = artieFrom(state, rv, 'jumped', ARTIE_JUMPED), set = l.set;
      l.set = s => { set?.(s); rageLine(rage, s); };
      t.q.push(l);
    }
  }
  if (b.phase === 'jumped' && b.rode && near && !t.q.length && !t.busy && p.swimming) {
    b.n++;
    t.gap = Math.max(t.gap, STUCK_GAP);
    t.q.push(artieFrom(state, rv, 'alone', ARTIE_ALONE));
  }
  // The boat moves (him with it, stood on it)
  if (b.v > 0) {
    b.x += b.v; if (b.block) b.block.x = b.x;
    if (aboard) p.pos.x += b.v;
  }
  if (rv.static > 0) rv.static--;
};

// ---------------------------------------------------------------------------------------------------------------
// In the water

const inWater = (rx: number, y: number) => rx > DOCK && rx < PIPE.x2 && y > WS && y < bedAt(rx) + 4;

const updateSwim = (ctx: FrameContext, rv: River) => {
  const { state } = ctx, p = state.player;
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2, rx = cx - x0;
  const was = p.swimming;
  p.swimming = inWater(rx, cy) && !p.inCutscene && !p.carried;
  p.swimSurfaceY = WS; p.swimLeap = SWIM_LEAP;
  // (in for the first time: the piranhas about aren't right there waiting; they keep off a few seconds, then it's on)
  if (p.swimming && !was && !rv.wetYet) {
    rv.wetYet = true;
    for (const e of state.enemies) if (e.kind === 'm2:piranha' && Math.abs(e.pos.x - cx) < 520) e.runFrom = state.frame + 180;
  }
  if (p.swimming && !was && p.vel.y > 3) {
    for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: cx, y: WS }, vel: { x: (Math.random() - 0.5) * 7, y: -2 - Math.random() * 5 }, life: 26, color: i % 2 ? '#E0F2FE' : '#7DD3FC', size: 3 + Math.random() * 4 });
    ctx.fx.playGunSound('splash');
  }
  if (p.swimming && state.frame % 14 === 0) state.particles.push({ pos: { x: cx + p.facing * 8, y: p.pos.y + 10 }, vel: { x: 0, y: -1.2 }, life: 40, color: 'rgba(224, 242, 254, 0.8)', size: 3 });
  // His air: going while his head's under (under the roof, it's always under), back when it's out (god mode: it never goes)
  const under = p.swimming && p.pos.y + 6 > WS;
  if (state.deathTimer > 0 || p.health <= 0) return;
  if (under && !ctx.cheats.invincible) {
    rv.o2 = Math.max(0, rv.o2 - 1 / AIR_FRAMES);
    if (rv.o2 < 0.3 && !rv.lowSaid) { rv.lowSaid = true; rv.talk.q.unshift(mh(fromBag(rv, 'air', MEATHEAD_AIR))); }
    if (rv.o2 < 0.25 && state.frame % 20 === 0) playSound('beep');
    if (rv.o2 <= 0 && ++rv.drownT >= DROWN_EVERY) {
      rv.drownT = 0;
      p.invincibilityTimer = 0;
      hurtPlayer(ctx, DROWN_DAMAGE, 'm2:drown');
      for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: cx + p.facing * 10, y: p.pos.y + 12 }, vel: { x: (Math.random() - 0.5) * 2, y: -1 - Math.random() * 2 }, life: 40, color: 'rgba(224, 242, 254, 0.9)', size: 3 + Math.random() * 4 });
    }
  } else {
    rv.o2 = Math.min(1, rv.o2 + AIR_REFILL / AIR_FRAMES);
    rv.drownT = 0;
    if (rv.o2 > 0.6) rv.lowSaid = false;
  }
  // The vents' bubbles: up to the roof (or the surface) and gone; one he swims into's a breath
  for (const v of VENTS) if ((state.frame + v) % 70 === 0 && Math.abs(R(v) - cx) < 900) rv.bubbles.push({ x: R(v) + (Math.random() - 0.5) * 16, y: bedAt(v) - 8, r: 7 + Math.random() * 4, vy: -1.1 - Math.random() * 0.5 });
  rv.bubbles = rv.bubbles.filter(b => {
    b.y += b.vy; b.x += Math.sin((b.y + b.r * 10) * 0.05) * 0.6;
    if (p.swimming && b.x > p.pos.x - 8 && b.x < p.pos.x + p.width + 8 && b.y > p.pos.y - 8 && b.y < p.pos.y + 44) {
      rv.o2 = Math.min(1, rv.o2 + BUBBLE_AIR);
      for (let i = 0; i < 5; i++) state.particles.push({ pos: { x: b.x, y: b.y }, vel: { x: (Math.random() - 0.5) * 3, y: -Math.random() * 2 }, life: 14, color: 'rgba(224, 242, 254, 0.9)', size: 2 + Math.random() * 2 });
      playSound('glug', 0.5);
      return false;
    }
    return b.y - b.r > Math.max(WS, roofAt(b.x - x0));
  });
};

/** The drain's pull, then it has him: out the other end, over the raptor pen. */
const updateDrain = (ctx: FrameContext, rv: River) => {
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2, rx = cx - x0;
  // (the river's own get pulled in too, if they're knocked in there: down it, minced; they keep out of it themselves)
  setHazardZones(state, 'river-drain', [{ x0: R(PIPE.x1) - 40, x1: R(PIPE.x2) + 200, y0: PIPE.top - 60, y1: 1200 }]);
  for (const e of hazardVictims(state)) {
    const ex = e.pos.x + e.width / 2 - x0;
    if (ex < PIPE.x1 || e.pos.y + e.height < PIPE.top - 60) continue;
    e.pos.x += 2 + (ex - PIPE.x1) / (PIPE.x2 - PIPE.x1) * 4; e.pos.y += (PIPE.top + 30 - e.pos.y) * 0.04;
    if (ex > SUCK_AT) hazardKill(ctx, e, e.pos.x - 40, 'DOWN THE DRAIN!', { fling: { x: 14, y: 0 }, sound: 'splat' });
  }
  if (rv.suck > 0) {
    rv.suck++;
    p.carried = true; p.inCutscene = true;
    const tx = R(PIPE.x2 - 30) - p.width / 2, ty = PIPE.top + 20;
    p.pos.x += (tx - p.pos.x) * 0.08; p.pos.y += (ty - p.pos.y) * 0.08;
    p.facing = (rv.suck >> 2) % 2 ? 1 : -1;
    if (state.frame % 3 === 0) state.particles.push({ pos: { x: cx, y: p.pos.y + 30 }, vel: { x: 4, y: (Math.random() - 0.5) * 2 }, life: 20, color: 'rgba(224, 242, 254, 0.8)', size: 3 });
    if (rv.suck > 75) {
      // (out over the raptor pen, falling: the dino section takes it from there)
      rv.suck = 0;
      p.carried = false; p.inCutscene = false; p.swimming = false; p.hidden = false;
      rv.o2 = 1;
      teleport(state, SECTIONS.dino.x0 + 150, GY - 520);
      state.camera.y = GY - 520 - 250;
      (getAdv(state)!.s as Record<string, unknown>).dinoArrival = true;
    }
    return;
  }
  if (!p.swimming) return;
  // The pull: toward the intake from the far end of the tank, harder in the pipe
  const pull = rx > PIPE.x1 ? 0.45 + (rx - PIPE.x1) / (PIPE.x2 - PIPE.x1) * 0.5 : rx > TANK.x2 - 300 && p.pos.y + p.height > PIPE.top - 60 ? 0.2 : 0;
  if (pull) { p.vel.x += pull; if (rx > PIPE.x1) p.vel.y += (PIPE.top + 30 - p.pos.y) * 0.004; }
  if (rx > SUCK_AT) { rv.suck = 1; rv.talk.q = []; rv.talk.q.push(mh(MEATHEAD_UNDER.sucked)); }
};

/** How much redder the river gets for each thing killed in it, and how red it can get (about a dozen kills). */
const RED_PER_KILL = 0.075, RED_MAX = 0.9;
/** How brown it gets with him in it in shitty pants: a splash's worth going in, then up to the most in about 40 seconds. */
const BROWN_IN = 0.1, BROWN_PER_FRAME = 1 / 2400, BROWN_MAX = 0.9;
/** How fast the whole of it takes on what's been put in it (the clouds spreading out into it). */
const SEEP = 0.006;
const MAX_CLOUDS = 90;

/**
 * The water fouled: blood off whatever dies in it (a cloud where it happened, drifting and spreading, slowly fading
 * into the whole river going redder with the body count), and in shitty pants, a brown cloud off his seat and the
 * river going browner the longer he's in it. It all lasts the visit (dying, it's a fresh river).
 */
const updateStain = (ctx: FrameContext, rv: River) => {
  const { state } = ctx, p = state.player, st = rv.stain;
  const wet = (x: number, y: number) => inWater(x - x0, y);
  const cloud = (x: number, y: number, blood: boolean, n: number, r: number) => {
    for (let i = 0; i < n; i++) st.clouds.push({ x: x + (Math.random() - 0.5) * r, y: y + (Math.random() - 0.5) * r * 0.7, r: r * (0.5 + Math.random() * 0.5), a: blood ? 0.55 : 0.5, vx: (Math.random() - 0.5) * (blood ? 1.4 : 0.6), vy: (Math.random() - 0.6) * 0.5, blood });
  };
  const kill = (x: number, y: number) => { st.redTo = Math.min(RED_MAX, st.redTo + RED_PER_KILL); cloud(x, y, true, 5, 26); };
  for (const [k, r] of st.recent) if (state.frame - r.at > 60) st.recent.delete(k);
  // What's died in the water (as it dies, or a body flung into it later). (A body flung through it that's then done
  // for where it lands is the one kill: it's bled already, it just bleeds some more.)
  for (const d of state.enemyDeaths) {
    if (st.bled.has(d)) continue;
    const x = d.x + d.w / 2, y = d.y + d.h / 2;
    if (d.x - x0 < -200 || d.x - x0 > PIPE.x2 + 200 || !wet(x, y)) continue;
    st.bled.add(d);
    if ([...st.recent.values()].some(r => Math.abs(r.x - x) < 140 && Math.abs(r.y - y) < 140)) cloud(x, y, true, 2, 20);
    else kill(x, y);
  }
  // (the bodies flung off flying: the ones dropped where they died leave their death behind them, above)
  for (const e of state.enemies) {
    if (!e.isBlownAway) continue;
    const x = e.pos.x + e.width / 2, y = e.pos.y + e.height / 2;
    if (!wet(x, y)) continue;
    st.recent.set(e, { x, y, at: state.frame });
    if (!st.bled.has(e)) { st.bled.add(e); kill(x, y); }
    // (a body flying on through it trails it)
    else if (state.frame % 5 === 0 && Math.abs(e.vel.x) + Math.abs(e.vel.y) > 1.5) cloud(x, y, true, 1, 14);
  }
  // Him, in it in shitty pants: a splash of it going in, then a cloud off his seat as he goes, the river browner and browner
  if (p.swimming && isShat(state)) {
    const sx = p.pos.x + p.width / 2 - p.facing * 8, sy = p.pos.y + p.height - 22;
    if (!st.shatIn) { st.shatIn = true; st.brownTo = Math.min(BROWN_MAX, st.brownTo + BROWN_IN); cloud(sx, Math.max(sy, WS + 14), false, 6, 30); }
    st.brownTo = Math.min(BROWN_MAX, st.brownTo + BROWN_PER_FRAME);
    if (state.frame % 10 === 0 && sy > WS) cloud(sx, sy, false, 1, 16);
  } else if (!p.swimming) st.shatIn = false;
  st.red += (st.redTo - st.red) * SEEP;
  st.brown += (st.brownTo - st.brown) * SEEP;
  // The clouds: drifting, spreading, fading out into the rest of it; kept in the water
  st.clouds = st.clouds.filter(c => {
    c.x += c.vx; c.y += c.vy; c.vx *= 0.985; c.vy = c.vy * 0.985 + Math.sin((state.frame + c.x) * 0.01) * 0.004;
    c.r = Math.min(c.blood ? 80 : 90, c.r + 0.06);
    c.a -= c.blood ? 0.0006 : 0.0005;
    const rx = c.x - x0, top = Math.max(WS, roofAt(rx)) + c.r * 0.5, bottom = bedAt(rx) - c.r * 0.3;
    if (c.y < top) { c.y = top; c.vy = Math.abs(c.vy) * 0.3; }
    if (c.y > bottom) { c.y = bottom; c.vy = -Math.abs(c.vy) * 0.3; }
    return c.a > 0 && rx > DOCK && rx < PIPE.x2;
  });
  if (st.clouds.length > MAX_CLOUDS) st.clouds.splice(0, st.clouds.length - MAX_CLOUDS);
};

/** The guests behind the tank's glass: a word as he goes by, and when he kills something in there. */
const updateGallery = (state: GameState, rv: River) => {
  const p = state.player, cx = p.pos.x + p.width / 2, rx = cx - x0;
  const inTank = p.swimming && rx > TANK.x1 && rx < TANK.x2;
  const dead = state.enemies.filter(e => e.health <= 0 && e.pos.x > R(TANK.x1) && e.pos.x < R(TANK.x2)).length;
  const nearest = rv.guests.reduce((a, g) => (Math.abs(g.x - cx) < Math.abs(a.x - cx) ? g : a));
  const say = (g: Guest, text: string) => rv.talk.q.push({ voice: g.voice, text, set: t => { g.said = t; } });
  if (inTank && dead > rv.tankDead && rv.talk.q.length < 2) say(nearest, fromBag(rv, 'gkill', GUESTS_KILL));
  rv.tankDead = dead;
  if (!inTank) return;
  if (--rv.guestNext <= 0 && !rv.talk.q.length && !rv.talk.busy) {
    rv.guestNext = 260 + Math.floor(Math.random() * 160);
    const d = dressed(state);
    say(nearest, fromBag(rv, `gsee:${d}`, GUESTS_SEE[d]));
  }
};

// ---------------------------------------------------------------------------------------------------------------

export const river: Section = {
  id: 'river', x0, x1,
  checkpoints: [
    { name: 'THE JUNGLE CRUISE', cp: 20, x: x0 + 150, y: GY },
    { name: 'UNDER THE RIVER', cp: 21, x: R(3620), y: 860 },
    { name: 'THE RIDE GRAVEYARD', cp: 22, x: R(5300), y: 900 },
    // (the dinosaur storeroom's way in, by the bubble vent past the ticket booth: the boat's as he left it (restoreBoat:
    // 21 on, over the side), a fresh breath of air)
    { name: 'THE ANIMATRONICS', cp: 23, x: R(7500), y: 900 },
    { name: 'THE DINOSAUR TANK', cp: 24, x: R(9900), y: 900 },
  ],
  build,
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player;
    const rv = getRiver(state);
    const rx = p.pos.x + p.width / 2 - x0;
    if (!rv.init) {
      rv.init = true; restoreBoat(state, rv);
      // (started further on, at a checkpoint under the water: what he'd have said swimming past what's behind him is said)
      if (state.checkpoint >= 21) for (const [x, k] of CALLOUTS) if (x < rx) rv.said.add(k);
    }
    // (back off the dock the way he came: the queue's end)
    if (rx < 40 && !p.swimming) { teleport(state, SECTIONS.queue.x1 - 220, GY); p.facing = -1; return controls; }
    updateSwim(ctx, rv);
    updateBoat(state, rv);
    noteBoat(state, rv);
    updateGallery(state, rv);
    updateDrain(ctx, rv);
    updateStain(ctx, rv);
    // Saying things the once each, swimming past them
    if (p.swimming) for (const [x, k] of CALLOUTS) if (rx > x && !rv.said.has(k)) { rv.said.add(k); if (rv.talk.q.length < 2) rv.talk.q.push(mh(MEATHEAD_UNDER[k])); }
    stepTalk(state, rv.talk);
    if (rv.rage && !stepRage(state, rv.rage, rv.boat.x)) rv.rage = undefined;
    return rv.suck > 0 ? ({}) as typeof controls : controls;
  },
  waterBodyAt: (_state, x, y) => {
    const rx = x - x0;
    if (rx <= DOCK || rx >= PIPE.x2 || y < WS - 12 || y > bedAt(rx) + 10) return null;
    // (its surface, for what floats up to it or spreads out over it: under the tunnel's roof, the rock's where it stops)
    return { key: 'river', x1: R(DOCK), x2: R(PIPE.x2), surface: Math.max(WS, roofAt(rx)), bottom: 1020, kind: 'clean' };
  },
  cameraX: () => ({ min: x0, max: x1 - CANVAS_WIDTH }),
  // (open air on the surface; down in the water, less of the hour's light the deeper the camera goes; the tunnel, the
  // tank and the pipe on from it are under rock and roof: none)
  outdoors: (state) => {
    const rx = state.camera.x + CANVAS_WIDTH / 2 - x0;
    if (rx > TUNNEL.x1) return 0;
    const depth = (state.camera.y + CANVAS_HEIGHT / 2 - WS) / 500;
    return 1 - 0.45 * Math.max(0, Math.min(1, depth));
  },
  drawBackdrop: (c, state) => drawRiverBackdrop(c, state),
  drawBack: (c, state) => drawRiverBack(c, state, getRiver(state)),
  drawFront: (c, state) => drawRiverFront(c, state, getRiver(state)),
  drawHud: (c, state) => { const rv = getRiver(state); if (rv.rage) drawRage(c, rv.rage, state.frame); },
};
