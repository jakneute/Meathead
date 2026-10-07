// Out on the open water in the stolen boat, with the Coast Guard after him ("GET OUT OF THE WATER, IDIOT"). The
// hurricane throws whatever it's picked up at him, and each thing wants its answer: junk floating in the swell
// (jump the boat over it), junk whirling over the water at about the height a jump would take him (don't jump), and junk
// coming down out of the sky. That's aimed at one of three zones: where the boat will be when it lands if he eases
// off (zone 1), lets the throttle be (zone 2), or leans on it (zone 3); any of the other two speeds gets him out from
// under it. Further out, bigger things, across two zones at once: zones 1 and 2 (only flat out gets clear) or zones 2
// and 3 (only easing right off does). One coming down at a time, and nothing else gets to him while it's coming (a
// knock then would leave him no way out): there's always a speed that's clear. Jumping's nothing to do with it. Every
// hit slows him (it doesn't hurt much) and lets the cutter close in (the bar fills): that's the danger; every one he
// gets past, it drops back a little (it drains). Nothing says which is which: he works it out. Let it catch him and
// they board him and beat him to death in his own boat (the kill camera: see chaseDraw.ts). Get to the waterspout and it takes him, and
// them after him.

import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { shakeScreen } from '../../core/state';
import { rectsOverlap, boundsOf } from '../../core/utils';
import { say, isTalking, silenceAll, holdForSpeech, MEATHEAD_VOICE, Voice } from '../../platform/speech';
import { playSound } from '../../platform/audio';
import { killPlayer } from '../../player/player';
import { deathByCause } from '../../core/deathCause';
import { COURSE } from './course';
import { isShat } from '../../player/gut';

/** The Coast Guard's skipper on the loudhailer, and his boarding crew (up close, no loudhailer). */
const LOUDHAILER: Voice = { id: 'hector.coastguard', pitch: 0.9, rate: 1.0 };
const COASTIE: Voice = { id: 'hector.coastie', pitch: 0.85, rate: 1.0 };

export type JunkKind = 'float' | 'flyer' | 'drop';
export interface Junk {
  kind: JunkKind;
  look: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  /** A drop: frames till it comes down (its shadow on the water till then). */
  warn: number;
  /** A drop: where it'll come down (its shadow's there; it comes in from up and to the right of it). */
  tx?: number;
  /** A drop: the zones it's aimed at, first and last (1 slow, 2 as he is, 3 flat out: one, or two side by side for a big one). */
  zones?: [number, number];
  /** A drop: one of the big ones (a trailer, a shipping container, a yacht), across two zones. */
  big?: boolean;
  hit: boolean;
  /** Got past without it hitting him (it's counted: the cutter drops back a bit). */
  passed?: boolean;
}

export interface Chase {
  /** Frames into it. */
  t: number;
  /** Where the boat is (for drawing the hints: the stern, world x), and how fast it's going. */
  boatX: number;
  boatSpeed: number;
  /** The cutter's bow (world x), how far back it's held (the meter), and its bob. */
  cgX: number;
  gap: number;
  /** The boat's hop: height off the water and its speed. */
  hopY: number;
  hopV: number;
  jumpHeld: boolean;
  /** How far the cutter's still to drop back for what he's got past (it goes a bit at a time). */
  relief: number;
  /** Frames left knocked about after a hit. */
  crash: number;
  junk: Junk[];
  nextJunkX: number;
  /** What's to come next, once it's clear to (a drop waits for the last one down and the water ahead to be clear). */
  nextKind: JunkKind | null;
  /** The throttle he's holding: 0 easing off, 1 letting it be, 2 leaning on it. */
  throttle: number;
  /** Nothing on the water (or whirling over it) gets to him before this frame: something's coming down till then. */
  clearAt: number;
  /** No drop before this frame (a breath after the last one's down). */
  dropReadyAt: number;
  /** How many have come down (the first few teach it: one zone at a time). */
  drops: number;
  /** When the skipper last said something; what's been said. */
  lineAt: number;
  said: Set<string>;
  /** What the skipper's saying right now (his bubble), and for how long. */
  hail: string;
  hailT: number;
  /** Caught: the kill camera's clock (0 = not), its quiet count for its one line. */
  caughtT: number;
  quiet: { n: number };
  /** Sucked up the spout after him: its spin and lift; whether it's got there yet, and how long it's been going round. */
  cgSpin: number;
  cgLift: number;
  cgIn?: boolean;
  cgInT?: number;
  /** Wrecked (killed by the junk): the clock of him flung out and the boat going up (0 = not). */
  wreckT: number;
}

// Speeds (px a frame): his, pushing on, easing off, knocked about
const BOAT_BASE = 7.2, BOAT_FAST = 9.8, BOAT_SLOW = 4.6, BOAT_HIT = 2.6;
/** The cutter: how far back it starts, the most it drops back, how much a hit lets it close, how fast it drops back clean. */
const CG_START = 520, CG_MAX = 640, CG_HIT = 130;
/** What getting past one thing earns (the cutter drops back this far), and how fast it drops back (px a frame). */
const CG_PASS = 55, CG_RELIEF_RATE = 1.2;
/** How close it has to get to board him (its bow to his stern). */
const CG_BOARD = 60;
const HOP_V = -10.5, HOP_G = 0.55;
/** How long the shadow's on the water before what's coming down lands (time to get out from under it: long enough that
 * holding any other speed from when it shows puts him a good boat-length clear). */
export const DROP_WARN = 90;
/** The same for a big one: longer (getting clear of two zones can mean going from flat out to easing right off). */
export const BIG_WARN = 108;
/** How far to the right of its shadow it is, a frame out (it comes down at a slant). */
const DROP_DRIFT = 3.5;
/** How much less of something coming down counts for hitting the boat, each side (out from under it is out from under it). */
const DROP_GRACE = 14;
/** Frames out from landing that something coming down can already hit him (it's in among him by then). */
const DROP_LIVE = 7;
/** After it's landed, frames till anything else can get to him (it's down and out of the water by then, and a bit). */
const DROP_CLEAR = 16;
/** A breath between one coming down and the next: frames after it's cleared, early on and right at the end. */
const DROP_REST_START = 40, DROP_REST_END = 14;
/** How far out (0 to 1) the big ones start coming down, and how many single ones he's seen first. */
const BIG_FROM = 0.4, BIG_AFTER = 4;
/** The single ones first, all aimed where he's going as he is (he has to do something about it). */
const TEACH = 3;
/** Not before he's had the boat this long (he's only just got it going). */
const DROP_FIRST = 75;

/** A hit: how long he's knocked about, and what it costs him (not much: what it costs him is the cutter closing). */
const HIT_FRAMES = 40, HIT_DAMAGE = 3;
/** After a hit, how long before the next can land (short: two at once is two). */
const HIT_GRACE = 12;
/** How fast what's whirling over the water comes at him (px a frame, to the left). */
const FLYER_VX = -4.5;
export const CHASE_BOAT_W = 150;
/** The middle of the boat's hull (boatBox), from its stern: what a zone's aimed at. */
const BODY_MID = 6 + (CHASE_BOAT_W - 6) / 2;

/** The three throttles: easing off, letting it be, leaning on it (zones 1, 2, 3). */
const THROTTLES = [BOAT_SLOW, BOAT_BASE, BOAT_FAST];

/**
 * How far the boat goes in `n` frames from going `v`, knocked about for `crash` more frames first, then easing toward
 * `target`: exactly as updateChase moves it, frame for frame (so a zone's where he'll really be, easing and all).
 */
export const travel = (v: number, crash: number, target: number, n: number) => {
  let x = 0;
  for (let i = 0; i < n; i++) {
    if (crash > 0) { crash--; v = BOAT_HIT + (1 - crash / HIT_FRAMES) * (BOAT_BASE - BOAT_HIT); }
    else v += (target - v) * 0.08;
    x += v;
  }
  return x;
};

/**
 * Where the boat's hull will be, from where it is now, when something coming down lands, for each throttle held from
 * now till then (zones 1, 2 and 3), and for the one he's holding. For the marks on the water (chaseDraw).
 */
export const dropZones = (c: Chase, j: Junk) => {
  const n = Math.max(0, j.warn);
  const q = THROTTLES.map(T => travel(c.boatSpeed, c.crash, T, n));
  return { zones: q, cur: q[c.throttle] ?? q[1], mid: c.boatX + BODY_MID };
};

/** How far off the middle of the hull something coming down can land and still get it (its width, less the grace, and the hull's). */
export const dropReach = (j: Junk) => (CHASE_BOAT_W - 6) / 2 + Math.max(0, junkSize(j).w / 2 - DROP_GRACE);

export const createChase = (): Chase => ({
  t: 0, boatX: 0, boatSpeed: 0, cgX: 0, gap: CG_START, hopY: 0, hopV: 0, jumpHeld: true, relief: 0, crash: 0, junk: [], nextJunkX: 0,
  nextKind: null, throttle: 1, clearAt: 0, dropReadyAt: DROP_FIRST, drops: 0,
  lineAt: 0, said: new Set(), hail: '', hailT: 0, caughtT: 0, quiet: { n: 0 }, cgSpin: 0, cgLift: 0, wreckT: 0,
});

const hail = (c: Chase, text: string) => {
  c.lineAt = c.t;
  say(text, LOUDHAILER, 'queue', { onShow: () => { c.hail = text; c.hailT = 100 + text.length * 3; }, onHide: () => { if (c.hail === text) c.hailT = 0; } });
};
const meatheadSays = (state: GameState, text: string) => {
  const shown = say(text, MEATHEAD_VOICE, 'queue', {
    onShow: () => { state.playerLastVulgarity = text; state.playerVulgarityTimer = 150; },
    onHide: () => { if (state.playerLastVulgarity === text) state.playerVulgarityTimer = 0; },
  });
  if (!shown) { state.playerLastVulgarity = text; state.playerVulgarityTimer = 120; }
};

/** The skipper, every so often while he's at it (in order, then round again). */
const HAILS = [
  'THAT IS A STOLEN VESSEL!',
  'THERE IS A HURRICANE, GENIUS!',
  'PULL OVER! ...THE BOAT! PULL THE BOAT OVER!',
  'WE CAN SEE YOU! WE ARE RIGHT BEHIND YOU!',
  'TURN AROUND! NOBODY GOES OUT IN THIS!',
];
/** The same, with the binoculars on him: he's shit himself. */
const HAILS_SHAT = [
  'THAT IS A STOLEN VESSEL! AND YOU HAVE SOILED IT!',
  'THERE IS A HURRICANE, GENIUS! AND YOUR PANTS!',
  'PULL OVER! ...THE BOAT! AND THEN YOUR PANTS! PULL THOSE UP TOO!',
  'WE CAN SEE YOU! WE CAN SEE ALL OF IT! WE ARE RIGHT BEHIND YOU!',
  'TURN AROUND! NOBODY GOES OUT IN THIS! NOBODY GOES OUT LIKE THAT!',
];

/** Off the pier with the throttle open: the cutter's coming round the end of the marina after him. */
export const startChase = (state: GameState, boatX: number): Chase => {
  const c = createChase();
  c.cgX = boatX - CG_START;
  c.nextJunkX = boatX + 700;
  state.cameraLeadX = 120;
  return c;
};

/** Where the boat's body is (for the floating junk and the falling junk to hit), its hull in the swell. */
const boatBox = (x: number, y: number) => ({ x: x + 6, y: y - 26, w: CHASE_BOAT_W - 6, h: 30 });

/** What each thing the storm throws is (by kind, then look, as chaseDraw draws them): what hit him, for what he says
 * about it and the death screen (the hurt source is junk_<it>). */
const JUNK_IDS: Record<JunkKind, string[]> = {
  float: ['crate', 'oil_drum', 'car_roof', 'fridge', 'porta_potty'],
  flyer: ['lawn_chair', 'palm_tree', 'flamingo', 'shopping_cart', 'beach_umbrella'],
  drop: ['piano', 'jet_ski', 'cow', 'car', 'hot_tub'],
};
/** The big ones coming down (across two zones). */
const BIG_IDS = ['mobile_home', 'shipping_container', 'yacht'];
const junkId = (j: Junk) => (j.big ? BIG_IDS[Math.min(BIG_IDS.length - 1, j.look)] : JUNK_IDS[j.kind][Math.min(4, j.look)]);

/** Junk's box (what it's drawn as, near enough). */
export const junkSize = (j: Junk) => (j.kind === 'float' ? { w: 52, h: 26 } : j.kind === 'flyer' ? { w: 60, h: 32 } : j.big ? { w: 184, h: 56 } : { w: 70, h: 44 });

/** The soonest something on the water (or whirling over it) could get to the boat's bow, in frames, going flat out. */
const soonest = (j: Junk, b: { x: number }) => (j.x - junkSize(j).w / 2 - (b.x + CHASE_BOAT_W)) / (BOAT_FAST - j.vx);
const junkBox = (j: Junk) => { const s = junkSize(j); return { x: j.x - s.w / 2, y: j.y - s.h, w: s.w, h: s.h }; };

/**
 * Clear for something to come down? Not while he's knocked about (he's no say in his speed till he's over it), not
 * till the last one's down and he's had a breath, and not while anything on the water ahead could get to him before
 * this one's down and gone (a knock then would leave him nowhere to go): it waits till that's behind him.
 */
const dropClear = (c: Chase, b: { x: number }) => {
  if (c.crash > 0 || c.t < c.dropReadyAt) return false;
  if (c.junk.some(j => j.kind === 'drop' && !j.hit)) return false;
  const until = BIG_WARN + DROP_CLEAR;
  return !c.junk.some(j => j.kind !== 'drop' && !j.hit && !j.passed && soonest(j, b) < until);
};

/**
 * Something comes down: aimed at a zone, or two side by side for a big one, worked out from how fast he's going now
 * and how the boat picks up or loses speed, so each zone's exactly where he'll be holding that speed from now.
 * The first few, one zone, the one he's in as he is (he has to do something); then one zone, mostly his; further out,
 * more and more often a big one, across his zone and the next (only the one speed left that's clear of it).
 */
const dropDown = (c: Chase, b: { x: number; speed: number }, out: number, cameraY: number) => {
  const mine = c.throttle + 1;
  let big = false, lo = mine, hi = mine;
  if (c.drops >= BIG_AFTER && out >= BIG_FROM) {
    // (the first's a sure thing, as soon as it's time; then more and more of them)
    const bigs = c.said.has('big') ? 0.3 + (out - BIG_FROM) * 0.7 : 1;
    if (Math.random() < bigs) {
      big = true; c.said.add('big');
      // (1 and 2, only flat out's clear; 2 and 3, only easing off is: mostly the pair he's in, going as he is)
      const first = mine === 1 ? 1 : mine === 3 ? 2 : Math.random() < 0.5 ? 1 : 2;
      lo = Math.random() < 0.75 ? first : 3 - first; hi = lo + 1;
    }
  }
  if (!big && c.drops >= TEACH && Math.random() < 0.4) {
    // (now and then one that's not his: holding on as he is, it's clear; he only has to not go into it)
    lo = hi = [1, 2, 3].filter(z => z !== mine)[Math.floor(Math.random() * 2)];
  }
  const warn = big ? BIG_WARN : DROP_WARN;
  const zone = (z: number) => b.x + BODY_MID + travel(b.speed, c.crash, THROTTLES[z - 1], warn);
  const at = (zone(lo) + zone(hi)) / 2;
  const look = Math.floor(Math.random() * (big ? BIG_IDS.length : 5));
  c.junk.push({ kind: 'drop', look, x: at + warn * DROP_DRIFT, y: cameraY - 120, vx: 0, vy: 0, rot: 0, warn, tx: at, zones: [lo, hi], big, hit: false });
  c.drops++;
  c.clearAt = c.t + warn + DROP_CLEAR;
  c.dropReadyAt = c.clearAt + Math.round(DROP_REST_START + (DROP_REST_END - DROP_REST_START) * out);
};

/**
 * The chase, a frame of it: his speed and his hop, the junk, the cutter. `move` moves the boat (and him in it).
 * Returns the controls to pass on (none: he's at the wheel).
 */
export const updateChase = (ctx: FrameContext, c: Chase, b: { x: number; y: number; speed: number }, move: (dx: number, y: number) => void, controls: Controls): Controls => {
  const { state, fx } = ctx;
  const { player } = state;
  c.t++;
  c.boatX = b.x;
  c.boatSpeed = b.speed;
  if (c.hailT > 0) c.hailT--;
  player.inCutscene = true;
  player.facing = 1;
  player.vel = { x: 0, y: 0 };
  // (sat down at the back, on the motor: he's drawn there, not stood up with his gun out)
  player.hidden = true;
  // At the wheel: lean on it, ease off, or he's been knocked about
  c.throttle = controls.right ? 2 : controls.left ? 0 : 1;
  if (c.crash > 0) { c.crash--; b.speed = BOAT_HIT + (1 - c.crash / HIT_FRAMES) * (BOAT_BASE - BOAT_HIT); }
  else b.speed += (THROTTLES[c.throttle] - b.speed) * 0.08;
  // The hop: up off a swell (jump), and down again with a smack
  const jump = !!controls.jump;
  if (jump && !c.jumpHeld && c.hopY === 0 && c.crash < HIT_FRAMES - 10) { c.hopV = HOP_V; playSound('whoosh', 0.7, 2); }
  c.jumpHeld = jump;
  if (c.hopY < 0 || c.hopV < 0) {
    c.hopV += HOP_G; c.hopY += c.hopV;
    if (c.hopY >= 0) { c.hopY = 0; c.hopV = 0; playSound('splash', 0.6); for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: b.x + Math.random() * CHASE_BOAT_W, y: COURSE.sea.y }, vel: { x: (Math.random() - 0.5) * 6, y: -Math.random() * 5 }, life: 24, color: '#E0F2FE', size: 3 + Math.random() * 4 }); }
  }
  player.isDucking = false;
  move(b.speed, COURSE.boat.y + Math.sin(c.t * 0.12) * 1.6 + c.hopY);
  // (where it is now, for the marks: what's coming down is aimed from here)
  c.boatX = b.x;
  c.boatSpeed = b.speed;
  // Spray off the bow
  if (state.frame % 2 === 0 && c.hopY === 0) state.particles.push({ pos: { x: b.x + CHASE_BOAT_W, y: b.y - 6 }, vel: { x: 2 + Math.random() * 3, y: -2 - Math.random() * 3 }, life: 18, color: '#E0F2FE', size: 3 + Math.random() * 3 });

  // The junk: more of it the further out he gets
  const out = (b.x - COURSE.boat.x) / (COURSE.sea.spoutX - COURSE.boat.x);
  if (b.x + 900 > c.nextJunkX && c.nextJunkX < COURSE.sea.spoutX - 700) {
    // (more coming down out of the sky the further out he gets: about one in three at the start, nearly half at the end)
    if (!c.nextKind) {
      const r = Math.random(), dropP = 0.32 + out * 0.16;
      c.nextKind = r < dropP ? 'drop' : r < dropP + (1 - dropP) * 0.55 ? 'float' : 'flyer';
    }
    const look = Math.floor(Math.random() * 5);
    // (nothing on the water gets to him while something's coming down: it's put back far enough that even flat out he
    // can't reach it till that's down and gone, and whatever comes after it is moved back the same)
    const holdOff = (j: Junk) => {
      const short = (c.clearAt - c.t) - soonest(j, b);
      if (short > 0) { const dx = short * (BOAT_FAST - j.vx); j.x += dx; c.nextJunkX += dx; }
      c.junk.push(j);
    };
    const float = (x: number) => holdOff({ kind: 'float', look, x, y: COURSE.sea.y + 4, vx: -0.6, vy: 0, rot: 0, warn: 0, hit: false });
    // (whirling across over the water, high enough to miss him sat in the boat, low enough a jump puts him into it;
    // coming in from off the right, timed so it crosses him about at x)
    const flyer = (x: number) => { const eta = (x - (b.x + CHASE_BOAT_W)) / Math.max(4, b.speed); holdOff({ kind: 'flyer', look, x: x - FLYER_VX * eta, y: COURSE.boat.y - 112, vx: FLYER_VX, vy: 0, rot: 0, warn: 0, hit: false }); };
    let gap = 0, spawned = true;
    if (c.nextKind === 'float') float(c.nextJunkX);
    else if (c.nextKind === 'flyer') flyer(c.nextJunkX);
    else if (dropClear(c, b)) {
      c.nextJunkX = Math.max(c.nextJunkX, b.x + 600);
      dropDown(c, b, out, state.camera.y);
      playSound('whoosh', 0.5, -6);
      // (further out, more and more often, something on the water right after it's down: jump it, or don't; a bit more room after)
      if (out > 0.45 && Math.random() < (out - 0.45) * 1.6) { (Math.random() < 0.6 ? float : flyer)(c.nextJunkX + 150 + Math.random() * 60); gap = 140; }
    } else spawned = false;
    // (one thing at a time, mostly: far enough apart there's the one answer to each; a drop waits its turn)
    if (spawned) { c.nextKind = null; c.nextJunkX += 340 + Math.random() * 240 - out * 60 + gap; }
  }
  const hurt = boundsOf(player);
  const body = boatBox(b.x, b.y);
  c.junk = c.junk.filter(j => {
    if (j.kind === 'drop') {
      // (in from up and to the right, down onto its shadow)
      if (j.warn > 0) { j.warn--; if (j.warn === 18) playSound('whoosh', 0.8, -10); j.y = COURSE.sea.y - 40 - j.warn * 8; j.x = (j.tx ?? j.x) + j.warn * DROP_DRIFT; if (j.warn === 0) j.vy = 8; }
      else { j.vy += 1.2; j.y += j.vy; }
      // (a big one sways as it comes, it doesn't tumble)
      j.rot = j.big ? Math.sin(j.warn * 0.09) * 0.18 : j.rot + 0.08;
      if (j.warn === 0 && j.y >= COURSE.sea.y + 10) { splash(state, j.x, j.big ? 60 : 30, j.big ? junkSize(j).w : 50); if (j.big) shakeScreen(state, 14, 6); if (!j.hit) c.relief += CG_PASS; return false; }
    } else {
      j.x += j.vx; j.rot += j.kind === 'flyer' || j.hit ? 0.25 : 0;
      if (j.kind === 'float' && !j.hit) j.y = COURSE.sea.y + 4 + Math.sin(c.t * 0.1 + j.x * 0.01) * 2;
    }
    if (j.x < state.camera.x - 300) return false;
    // (got past it: the cutter drops back a bit)
    if (!j.hit && !j.passed && j.kind !== 'drop' && j.x + 30 < b.x) { j.passed = true; c.relief += CG_PASS; }
    // (one coming down can hit him from just above him on the way in)
    if (j.hit || j.warn > DROP_LIVE || j.passed) return true;
    const box = junkBox(j);
    // (something coming down: only if it's well onto the boat; its mark off the end of the boat is it missing him)
    const drop = j.kind === 'drop' ? { x: box.x + DROP_GRACE, y: box.y, w: box.w - DROP_GRACE * 2, h: box.h } : box;
    const hits = j.kind === 'flyer' ? rectsOverlap(box, hurt) : rectsOverlap(drop, body) || (j.kind === 'drop' && rectsOverlap(drop, hurt));
    void hurt;
    // (he's in a cutscene as far as the game's concerned, so it's the knock it gave him that keeps him from taking two at once)
    if (hits && c.crash <= HIT_FRAMES - HIT_GRACE) {
      j.hit = true;
      c.crash = HIT_FRAMES;
      c.gap -= CG_HIT;
      if (!ctx.cheats.invincible) player.health -= HIT_DAMAGE + (j.kind === 'drop' ? 1 : 0);
      const what = junkId(j);
      state.lastHurt = { source: `junk_${what}`, at: state.frame };
      player.invincibilityTimer = 30;
      shakeScreen(state, j.kind === 'drop' ? 22 : 12, j.big ? 12 : j.kind === 'drop' ? 9 : 5);
      playSound(j.kind === 'drop' ? 'crash' : 'crunch');
      fx.spawnDamageNumber({ x: player.pos.x - 20, y: player.pos.y - 30 }, `${what.replace('_', ' ').toUpperCase()}!`, true, '#FDE047');
      fx.speakVulgarity('hurt', `junk_${what}`);
      j.vx = 4; j.vy = -6;
      if (j.kind === 'float') j.y -= 10;
      // (and what's still owed for what he'd got past is lost: it's the cutter's now)
      c.relief = 0;
      // (the last of him: thrown out, and the boat goes up)
      if (player.health <= 0 && state.deathTimer <= 0) wrecked(ctx, c);
    }
    if (j.hit) { j.vy += 0.6; j.y += j.vy; j.x += j.vx; if (j.y > COURSE.sea.y + 40) return false; }
    return true;
  });

  // The cutter: closing in on every hit, dropping back a bit for everything he gets past
  const drop = Math.min(c.relief, CG_RELIEF_RATE);
  c.relief -= drop;
  c.gap = Math.min(CG_MAX, c.gap + drop);
  c.cgX += Math.max(2, (b.x - c.gap - c.cgX) * 0.12);
  // The skipper: the first thing out of him, the answer, then one every so often
  if (c.t === 8) meatheadSays(state, "CAN'T SHOOT. BOTH HANDS ON THE MOTOR.");
  if (c.t === 30) hail(c, isShat(state) ? 'GET OUT OF THE WATER, IDIOT! ...WAIT. WE SAW THAT. STAY IN THE WATER!' : 'GET OUT OF THE WATER, IDIOT!');
  if (c.t === 31) meatheadSays(state, 'MAKE ME!');
  if (c.t > 300 && c.t - c.lineAt > 330 && !isTalking()) hail(c, isShat(state) ? HAILS_SHAT[Math.floor((c.t / 330)) % HAILS_SHAT.length] : HAILS[Math.floor((c.t / 330)) % HAILS.length]);
  if (c.gap < 200 && !c.said.has('board') && !isTalking()) { c.said.add('board'); hail(c, 'PREPARE TO BE BOARDED!'); }
  if (c.gap > 320) c.said.delete('board');
  if (b.x > COURSE.sea.spoutX - 1300 && !c.said.has('spout') && !isTalking()) { c.said.add('spout'); hail(c, 'SIR. THAT IS A WATERSPOUT.'); }
  // Caught: alongside, and over they come
  if (c.cgX + 0 >= b.x - CG_BOARD && state.deathTimer <= 0 && !ctx.cheats.invincible) boarded(ctx, c);
  if (ctx.cheats.invincible && c.cgX >= b.x - CG_BOARD) c.gap = CG_START;
  return { ...NO_CONTROLS };
};

const splash = (state: GameState, x: number, n: number, w = 50) => {
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * w, y: COURSE.sea.y }, vel: { x: (Math.random() - 0.5) * 8, y: -3 - Math.random() * 9 }, life: 30, color: i % 3 ? '#E0F2FE' : '#93C5FD', size: 4 + Math.random() * 5 });
  playSound('splash');
};

// ---------------------------------------------------------------------------
// Boarded: the kill camera
// ---------------------------------------------------------------------------

/** Its beats: the cutter slams alongside and they come over the side; the beating; the aftermath and his one line. */
/** (taking its time: the slam, the leap; then a good long beating, every blow landing; then a long look at what's left) */
export const BOARD_LEAP = 90, BOARD_BEAT = 430, BOARD_LINE = 460, BOARD_END = 560;
/** Frames between blows (they come thick and fast). */
export const BLOW = 7;
const BOARD_HOLDS = new Set([BOARD_LINE]);

const boarded = (ctx: FrameContext, c: Chase) => {
  const { state } = ctx;
  c.caughtT = 1;
  state.player.hidden = true;
  state.deathScene = { t: 0, len: 100000, voiced: true };
  silenceAll();
  killPlayer(ctx, 'COAST GUARDED', false);
  playSound('crash'); playSound('slam');
  shakeScreen(state, 20, 8);
};

/** Each frame of the kill camera (the stage's death scene): its sounds, its line, and the end of it. */
export const tickBoarded = (ctx: FrameContext, c: Chase) => {
  const { state } = ctx;
  if (!c.caughtT) return;
  if (!holdForSpeech(c.caughtT, BOARD_HOLDS, c.quiet, 16)) return;
  c.caughtT++;
  const t = c.caughtT;
  if (t === 8) say('YOU ARE BEING BOARDED!', LOUDHAILER, 'urgent', { onShow: () => {}, onHide: () => {}, always: true });
  if (t === BOARD_LEAP) playSound('whoosh');
  // (every blow, its own: a punch, a boot, the nightstick coming down; now and then a crunch that means something broke)
  if (t > BOARD_LEAP + 10 && t < BOARD_BEAT && (t - BOARD_LEAP) % BLOW === 0) {
    const n = (t - BOARD_LEAP) / BLOW;
    playSound(n % 5 === 4 ? 'crunch' : n % 3 === 2 ? 'thud' : 'punch', 1, Math.round(Math.random() * 4 - 6));
    if (n % 5 === 4) playSound('splat', 0.7);
    shakeScreen(state, 5, n % 5 === 4 ? 7 : 3);
  }
  if (t > BOARD_LEAP + 10 && t < BOARD_BEAT && (t - BOARD_LEAP) % (BLOW * 7) === BLOW * 3) playSound('clang', 0.7, -4);
  if (t === BOARD_LINE) say('WE SAID. GET OUT. OF THE WATER.', COASTIE, 'urgent', { onShow: () => {}, onHide: () => {}, always: true });
  if (t === BOARD_END && state.deathScene) state.deathScene.len = state.deathScene.t + 1;
};

// ---------------------------------------------------------------------------
// Wrecked: the junk finishes him
// ---------------------------------------------------------------------------

/** Its beats: him flung up out of the boat and gone off the top; the boat going up; the smoke; him coming back down,
 * head first into the sea by it, legs up; the burning slick reaching his legs; then the screen. */
export const WRECK_BLAST = 22, WRECK_RETURN = 84, WRECK_SPLASH = 100, WRECK_LEGS_LIT = 140, WRECK_END = 200;

const wrecked = (ctx: FrameContext, c: Chase) => {
  const { state } = ctx;
  c.wreckT = 1;
  state.deathScene = { t: 0, len: WRECK_END, voiced: false };
  killPlayer(ctx, deathByCause(state) ?? 'ACT OF GOD', false);
  playSound('crash'); playSound('whoosh', 1, 4);
  shakeScreen(state, 18, 8);
};

/** Each frame of it (the stage's death scene): the bang. */
export const tickWreck = (ctx: FrameContext, c: Chase) => {
  c.wreckT++;
  if (c.wreckT === WRECK_BLAST) { playSound('boom'); playSound('crash', 0.8); shakeScreen(ctx.state, 30, 12); }
  if (c.wreckT === WRECK_BLAST + 14) playSound('splash');
  if (c.wreckT === WRECK_RETURN) playSound('whoosh', 0.9, -6);
  if (c.wreckT === WRECK_SPLASH) { playSound('splash', 1, -4); shakeScreen(ctx.state, 6, 3); }
  if (c.wreckT === WRECK_LEGS_LIT) playSound('ignite', 0.9);
};

/** Where the cutter's bow goes round the spout (its orbit's middle, and how far out). */
const CG_ORBIT_X = -110, CG_ORBIT_R = 90;
/** Sucked up the spout behind him: in it goes, from wherever it was (flat out, if that was a long way back: it's there to
 * be seen going in, never just there), then round and up after him. */
export const spoutTakesCutter = (c: Chase, spoutX: number, t: number) => {
  const mouth = spoutX + CG_ORBIT_X - CG_ORBIT_R;
  if (!c.cgIn) {
    // (there by about the time he's off the water himself, however far back it was)
    const d = mouth - c.cgX, v = Math.max(4, d / Math.max(4, 55 - t));
    if (d > v) { c.cgX += v; return; }
    // (caught by it: going round from where it is, not from somewhere else)
    c.cgIn = true; c.cgInT = 0;
    c.cgSpin = Math.acos(Math.max(-1, Math.min(1, (c.cgX - spoutX - CG_ORBIT_X) / CG_ORBIT_R)));
  }
  c.cgInT = (c.cgInT ?? 0) + 1;
  c.cgSpin += 0.2;
  c.cgLift += 6 + c.cgInT * 0.08;
  c.cgX = spoutX + CG_ORBIT_X + Math.cos(c.cgSpin) * CG_ORBIT_R;
};
