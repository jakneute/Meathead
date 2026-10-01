// Out on the open water in the stolen boat, with the Coast Guard after him ("GET OUT OF THE WATER, IDIOT"). The
// hurricane throws whatever it's picked up at him: junk floating in the swell (hop the boat over it), junk flying in
// low off the shore (duck), and junk coming down out of the sky (its shadow on the water: get out from under it). Every
// hit slows him and lets the cutter close in; it drops back as he runs clean. Let it catch him and they board him and
// beat him to death in his own boat (the kill camera: see chaseDraw.ts). Get to the waterspout and it takes him, and
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
import { COURSE } from './course';

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
  hit: boolean;
}

export interface Chase {
  /** Frames into it. */
  t: number;
  /** The cutter's bow (world x), how far back it's held (the meter), and its bob. */
  cgX: number;
  gap: number;
  /** The boat's hop: height off the water and its speed. */
  hopY: number;
  hopV: number;
  jumpHeld: boolean;
  /** Frames left knocked about after a hit. */
  crash: number;
  junk: Junk[];
  nextJunkX: number;
  /** When the skipper last said something; what's been said. */
  lineAt: number;
  said: Set<string>;
  /** What the skipper's saying right now (his bubble), and for how long. */
  hail: string;
  hailT: number;
  /** Caught: the kill camera's clock (0 = not), its quiet count for its one line. */
  caughtT: number;
  quiet: { n: number };
  /** Sucked up the spout after him: its spin and lift. */
  cgSpin: number;
  cgLift: number;
}

// Speeds (px a frame): his, pushing on, easing off, knocked about
const BOAT_BASE = 7.2, BOAT_FAST = 9.6, BOAT_SLOW = 5, BOAT_HIT = 2.6;
/** The cutter: how far back it starts, the most it drops back, how much a hit lets it close, how fast it drops back clean. */
const CG_START = 560, CG_MAX = 640, CG_HIT = 130, CG_RECOVER = 0.32;
/** How close it has to get to board him (its bow to his stern). */
const CG_BOARD = 60;
const HOP_V = -10.5, HOP_G = 0.55;
const HIT_FRAMES = 40, HIT_DAMAGE = 8;
export const CHASE_BOAT_W = 150;

export const createChase = (): Chase => ({
  t: 0, cgX: 0, gap: CG_START, hopY: 0, hopV: 0, jumpHeld: true, crash: 0, junk: [], nextJunkX: 0,
  lineAt: 0, said: new Set(), hail: '', hailT: 0, caughtT: 0, quiet: { n: 0 }, cgSpin: 0, cgLift: 0,
});

const hail = (c: Chase, text: string) => {
  c.lineAt = c.t;
  say(text, LOUDHAILER, 'queue', { onShow: () => { c.hail = text; c.hailT = 100 + text.length * 3; }, onHide: () => { if (c.hail === text) c.hailT = Math.min(c.hailT, 20); } });
};
const meatheadSays = (state: GameState, text: string) => {
  const shown = say(text, MEATHEAD_VOICE, 'queue', {
    onShow: () => { state.playerLastVulgarity = text; state.playerVulgarityTimer = 150; },
    onHide: () => { if (state.playerLastVulgarity === text) state.playerVulgarityTimer = Math.min(state.playerVulgarityTimer, 30); },
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

/** Junk's box (what it's drawn as, near enough). */
export const junkSize = (j: Junk) => (j.kind === 'float' ? { w: 52, h: 26 } : j.kind === 'flyer' ? { w: 44, h: 30 } : { w: 70, h: 44 });
const junkBox = (j: Junk) => { const s = junkSize(j); return { x: j.x - s.w / 2, y: j.y - s.h, w: s.w, h: s.h }; };

/**
 * The chase, a frame of it: his speed and his hop, the junk, the cutter. `move` moves the boat (and him in it).
 * Returns the controls to pass on (none: he's at the wheel).
 */
export const updateChase = (ctx: FrameContext, c: Chase, b: { x: number; y: number; speed: number }, move: (dx: number, y: number) => void, controls: Controls): Controls => {
  const { state, fx } = ctx;
  const { player } = state;
  c.t++;
  if (c.hailT > 0) c.hailT--;
  player.inCutscene = true;
  player.facing = 1;
  player.vel = { x: 0, y: 0 };
  // At the wheel: lean on it, ease off, or he's been knocked about
  if (c.crash > 0) { c.crash--; b.speed = BOAT_HIT + (1 - c.crash / HIT_FRAMES) * (BOAT_BASE - BOAT_HIT); }
  else b.speed += ((controls.right ? BOAT_FAST : controls.left ? BOAT_SLOW : BOAT_BASE) - b.speed) * 0.08;
  // The hop: up off a swell (jump), and down again with a smack
  const jump = !!controls.jump;
  if (jump && !c.jumpHeld && c.hopY === 0 && c.crash < HIT_FRAMES - 10) { c.hopV = HOP_V; playSound('whoosh', 0.7, 2); }
  c.jumpHeld = jump;
  if (c.hopY < 0 || c.hopV < 0) {
    c.hopV += HOP_G; c.hopY += c.hopV;
    if (c.hopY >= 0) { c.hopY = 0; c.hopV = 0; playSound('splash', 0.6); for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: b.x + Math.random() * CHASE_BOAT_W, y: COURSE.sea.y }, vel: { x: (Math.random() - 0.5) * 6, y: -Math.random() * 5 }, life: 24, color: '#E0F2FE', size: 3 + Math.random() * 4 }); }
  }
  // (and down: he gets his head down)
  player.isDucking = !!controls.down && c.hopY === 0;
  move(b.speed, COURSE.boat.y + Math.sin(c.t * 0.12) * 1.6 + c.hopY);
  // Spray off the bow
  if (state.frame % 2 === 0 && c.hopY === 0) state.particles.push({ pos: { x: b.x + CHASE_BOAT_W, y: b.y - 6 }, vel: { x: 2 + Math.random() * 3, y: -2 - Math.random() * 3 }, life: 18, color: '#E0F2FE', size: 3 + Math.random() * 3 });

  // The junk: more of it the further out he gets
  const out = (b.x - COURSE.boat.x) / (COURSE.sea.spoutX - COURSE.boat.x);
  if (b.x + 900 > c.nextJunkX && c.nextJunkX < COURSE.sea.spoutX - 700) {
    const r = Math.random();
    const kind: JunkKind = r < 0.42 ? 'float' : r < 0.74 ? 'flyer' : 'drop';
    const look = Math.floor(Math.random() * 5);
    if (kind === 'float') c.junk.push({ kind, look, x: c.nextJunkX, y: COURSE.sea.y + 4, vx: -0.6, vy: 0, rot: 0, warn: 0, hit: false });
    else if (kind === 'flyer') c.junk.push({ kind, look, x: c.nextJunkX + 300, y: COURSE.boat.y - 52, vx: -6, vy: 0, rot: 0, warn: 0, hit: false });
    else {
      // (aimed where he'll be if he keeps on as he is: so ease off, or open it up)
      const at = b.x + CHASE_BOAT_W / 2 + b.speed * 80;
      c.junk.push({ kind, look, x: at, y: state.camera.y - 120, vx: 0, vy: 0, rot: 0, warn: 80, hit: false });
      playSound('whoosh', 0.5, -6);
    }
    c.nextJunkX += 300 + Math.random() * 260 - out * 120;
  }
  const hurt = boundsOf(player);
  if (player.isDucking) { hurt.y += 30; hurt.h -= 30; }
  const body = boatBox(b.x, b.y);
  c.junk = c.junk.filter(j => {
    if (j.kind === 'drop') {
      if (j.warn > 0) { j.warn--; if (j.warn === 18) playSound('whoosh', 0.8, -10); j.y = COURSE.sea.y - 40 - j.warn * 9; }
      else { j.vy += 1.2; j.y += j.vy; }
      j.rot += 0.08;
      if (j.warn === 0 && j.y >= COURSE.sea.y + 10) { splash(state, j.x, 30); return false; }
    } else {
      j.x += j.vx; j.rot += j.kind === 'flyer' ? 0.25 : 0;
      if (j.kind === 'float') j.y = COURSE.sea.y + 4 + Math.sin(c.t * 0.1 + j.x * 0.01) * 2;
    }
    if (j.x < state.camera.x - 300) return false;
    if (j.hit || j.warn > 0) return true;
    const box = junkBox(j);
    const hits = j.kind === 'flyer' ? rectsOverlap(box, hurt) : rectsOverlap(box, body) || (j.kind === 'drop' && rectsOverlap(box, hurt));
    // (he's in a cutscene as far as the game's concerned, so it's the knock it gave him that keeps him from taking two at once)
    if (hits && c.crash === 0) {
      j.hit = true;
      c.crash = HIT_FRAMES;
      c.gap -= CG_HIT;
      if (!ctx.cheats.invincible) player.health -= HIT_DAMAGE * (j.kind === 'drop' ? 2 : 1);
      state.lastHurt = { source: 'storm_junk', at: state.frame };
      player.invincibilityTimer = 30;
      shakeScreen(state, j.kind === 'drop' ? 22 : 12, j.kind === 'drop' ? 9 : 5);
      playSound(j.kind === 'drop' ? 'crash' : 'crunch');
      fx.spawnDamageNumber({ x: player.pos.x - 20, y: player.pos.y - 30 }, ['WHAMMO!', 'INCOMING!', 'HOMEOWNERS INSURANCE!', 'FLYING FURNITURE!'][Math.floor(Math.random() * 4)], true, '#FDE047');
      fx.speakVulgarity('hurt', 'storm_junk');
      j.vx = 4; j.vy = -6;
      if (j.kind === 'float') { j.kind = 'flyer'; j.y -= 10; }
    }
    if (j.hit) { j.vy += 0.6; j.y += j.vy; j.x += j.vx; if (j.y > COURSE.sea.y + 40) return false; }
    return true;
  });

  // The cutter: closing in on every hit, dropping back running clean (a bit more flat out, a bit less easing off)
  c.gap = Math.min(CG_MAX, c.gap + CG_RECOVER + (b.speed - BOAT_BASE) * 0.06);
  c.cgX += Math.max(2, (b.x - c.gap - c.cgX) * 0.12);
  // The skipper: the first thing out of him, the answer, then one every so often
  if (c.t === 30) hail(c, 'GET OUT OF THE WATER, IDIOT!');
  if (c.t === 31) meatheadSays(state, 'MAKE ME!');
  if (c.t > 300 && c.t - c.lineAt > 330 && !isTalking()) hail(c, HAILS[Math.floor((c.t / 330)) % HAILS.length]);
  if (c.gap < 200 && !c.said.has('board') && !isTalking()) { c.said.add('board'); hail(c, 'PREPARE TO BE BOARDED!'); }
  if (c.gap > 320) c.said.delete('board');
  if (b.x > COURSE.sea.spoutX - 1300 && !c.said.has('spout') && !isTalking()) { c.said.add('spout'); hail(c, 'SIR. THAT IS A WATERSPOUT.'); }
  // Caught: alongside, and over they come
  if (c.cgX + 0 >= b.x - CG_BOARD && state.deathTimer <= 0 && !ctx.cheats.invincible) boarded(ctx, c);
  if (ctx.cheats.invincible && c.cgX >= b.x - CG_BOARD) c.gap = CG_START;
  return { ...NO_CONTROLS };
};

const splash = (state: GameState, x: number, n: number) => {
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 50, y: COURSE.sea.y }, vel: { x: (Math.random() - 0.5) * 8, y: -3 - Math.random() * 9 }, life: 30, color: i % 3 ? '#E0F2FE' : '#93C5FD', size: 4 + Math.random() * 5 });
  playSound('splash');
};

// ---------------------------------------------------------------------------
// Boarded: the kill camera
// ---------------------------------------------------------------------------

/** Its beats: the cutter slams alongside and they come over the side; the beating; the aftermath and his one line. */
export const BOARD_LEAP = 50, BOARD_BEAT = 190, BOARD_LINE = 200, BOARD_END = 260;
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
  if (t > BOARD_LEAP + 10 && t < BOARD_BEAT && t % 7 === 0) playSound(t % 21 === 0 ? 'crunch' : t % 14 === 0 ? 'thud' : 'punch', 0.8 + Math.random() * 0.2, Math.round(Math.random() * 6 - 3));
  if (t > BOARD_LEAP + 10 && t < BOARD_BEAT && t % 40 === 0) playSound('clang', 0.6);
  if (t === BOARD_LINE) say('WE SAID. GET OUT. OF THE WATER.', COASTIE, 'urgent', { onShow: () => {}, onHide: () => {}, always: true });
  if (t === BOARD_END && state.deathScene) state.deathScene.len = state.deathScene.t + 1;
};

/** Sucked up the spout behind him: in it goes, spinning up after him. */
export const spoutTakesCutter = (c: Chase, spoutX: number, t: number) => {
  if (t < 40) c.cgX += (spoutX - 260 - c.cgX) * 0.05;
  else { c.cgSpin += 0.2; c.cgLift += 5 + (t - 40) * 0.08; c.cgX = spoutX - 110 + Math.cos(c.cgSpin) * 90; }
};
