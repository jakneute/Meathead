// THE TEMPLE ROOF. Out of the top of the mine cart's ramp and up through the temple's roof (the first time:
// `blowout`): he and Safari Artie land on it, Artie has his say, and the roof starts going in, the left of it first
// (Artie with it: there's no way off on that side, a wall), then it comes after him from the left. Off the right edge
// he tumbles head over heels down the temple's stepped side, bouncing off every step, and splats flat on his face on
// the ground by the ride's line (no harm done: a beat lying there, and up). The view pulls out on the temple (still
// standing: only its roof's gone in) with the people in line watching it in horror. Then on, right, past the line, to
// the clearing (no way back into the temple: its side's a wall). Caught by the roof, he goes in through the hole,
// behind its broken front, and a big dust cloud puffs up out of it.
//
// The look: art.ts (the final pass); the layout: layout.ts.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Section, Said } from '../section';
import { lay, speak, meatheadSays, teleport, saidOver, hands, getAdv, sectionState, label } from '../section';
import { SECTIONS, GY } from '../geometry';
import { x0, x1, BASE_L, BASE_R, TIER_H, TIER_IN, RY, ROOF_L, ROOF_R, HOLE_X, HOLE_W, TILE, ZOOM_TO, ZOOM_X, ZOOM_Y, TILES, SPLAT_X, EXIT_X, GUESTS, SPEAKER_F, SPEAKER_M } from './layout';
import { drawRoofBackdrop, drawTempleBody, drawLine, drawLineBack, drawDust, drawPoof, drawCart, drawChute, CHUNK_COLORS, TORCHES } from './art';
export { HOLE_X } from './layout';
import { setUi } from '../../store';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { shakeScreen } from '../../../m1/game/core/state';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { CANVAS_WIDTH, CANVAS_HEIGHT, topBand } from '../../../m1/constants';
import { registerHurtLines } from '../../kinds';
import { drawSafariArtie } from '../river/artie';
import { drawPlayer } from '../../../m1/game/render/player/player';
import {
  type Dressed, ARTIE_LANDED, MEATHEAD_LANDED, ARTIE_CHUTE, GUEST_GASP, GUEST2_HIM, MEATHEAD_TO_LINE, GUEST_AFTER, HURT_ROOF, DEATH_ROOF,
} from './lines';

registerHurtLines('roof_collapse', HURT_ROOF, DEATH_ROOF);

const pick = <T>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
/** First time through (a return trip will differ: the temple on fire, say). One flag per set piece. */
const firstVisit = (_state: GameState) => true;

/** Off the edge: the hops down the steps (the landing spots: each tier's ledge, then the ground), frames a hop. */
const HOPS = [
  { x: BASE_R - 2.5 * TIER_IN, y: GY - 3 * TIER_H },
  { x: BASE_R - 1.5 * TIER_IN, y: GY - 2 * TIER_H },
  { x: BASE_R - 0.5 * TIER_IN, y: GY - TIER_H },
  { x: SPLAT_X, y: GY },
];
const HOP_T = 24, SPLAT_HOLD = 60, GET_UP = 18;
/** The roof going in after him: how fast; the lead he gets before it starts (off the arrival; back from a checkpoint);
 * how far behind him it's let fall at most (it catches up to that, so it's all in by the time he's off the edge); how
 * long the RUN! warning's up. */
const FRONT_V = 2.6, LEAD_ARRIVE = 60, LEAD_RESPAWN = 110, FRONT_TRAIL = 150, WARN_T = 170;
/** The tiles over where he comes up through it (intact till the cart bursts through them). */
const holeTile = (i: number) => { const x = ROOF_L + i * TILE; return x + TILE > HOLE_X - HOLE_W / 2 && x < HOLE_X + HOLE_W / 2; };

interface Tumble {
  /** Which hop, how far into it, from where. */
  i: number; t: number; fx: number; fy: number;
  /** Where he is (his feet), his spin, how fast, the squash off the last bonk. */
  x: number; y: number; ang: number; spin: number; squash: number;
  /** Down on his face: frames since; getting up: frames since. */
  flat: number; up: number;
}

interface Roof {
  /** Which tiles of the roof are still there (and their blocks). */
  tiles: { b: { x: number; y: number; w: number; h: number } | null; gone: boolean; shake: number }[];
  /** The scene going on: coming up through it; tumbling off it and the view pulling out; none. */
  scene: 'arrive' | 'tumble' | 'zoom' | null;
  t: number;
  /** (late lines from a skipped scene: ignored) */
  token: number;
  /** The roof going in from the hole rightward, after him (where it's got to), and when it starts. */
  front: number; frontAt: number;
  /** Going in on the way down the side: how fast the rest of it goes (it's all in by his first bonk). */
  frontV: number;
  /** When the RUN! warning went up (0 none). */
  warnAt: number;
  said: Said | null; saidBy: 'artie' | 'f' | 'm' | null;
  /** Him flying up out of it (the cutscene's own physics). */
  me: { x: number; y: number; vx: number; vy: number; landed: boolean };
  /** `falling`: off the roof (a leap, and down under his parachute: `chute` frames since it opened, 0 not yet). */
  artie: { on: boolean; x: number; y: number; vx: number; vy: number; landed: boolean; falling: boolean; gone: boolean; chute: number };
  emptyCart: { x: number; y: number; vy: number; on: boolean };
  step: number;
  /** The view pulled out on the temple (0..1). */
  zoomK: number;
  /** Off the edge and down the side (once: he's down). */
  tum: Tumble | null; tumbled: boolean;
  /** Gone in through the hole (drawn behind its front from here), and the dust cloud puffing up out of it after. */
  inHole: boolean; poof: number; poofX: number;
  /** The temple's taken the hit (looks: the roof in, rubble, dust). */
  caved: boolean;
  /** (the line: horrified, once it's started going in) */
  horror: boolean;
  dust: { x: number; y: number; vx: number; vy: number; r: number; life: number }[];
}

const getRoof = (state: GameState) => sectionState<Roof>(state, 'roof', () => ({
  tiles: [], scene: null, t: 0, token: 0, front: HOLE_X + HOLE_W / 2, frontAt: 0, frontV: 0, warnAt: 0,
  said: null, saidBy: null,
  me: { x: HOLE_X, y: RY + 120, vx: 2.1, vy: -15, landed: false },
  artie: { on: false, x: HOLE_X, y: RY + 120, vx: -1.4, vy: -14, landed: false, falling: false, gone: false, chute: 0 },
  emptyCart: { x: HOLE_X, y: RY + 120, vy: -12, on: false },
  step: 0, zoomK: 0, tum: null, tumbled: false, inHole: false, poof: 0, poofX: HOLE_X,
  caved: false, horror: false, dust: [],
}));

const someoneSays = (r: Roof, who: 'artie' | 'f' | 'm', voiceId: string, text: string, onDone?: () => void) => {
  const tok = r.token;
  r.saidBy = who;
  speak(voiceId, text, s => { if (r.token !== tok) return; r.said = s; if (!s) r.saidBy = null; }, true, () => { if (r.token === tok) onDone?.(); });
};

const crumble = (state: GameState, r: Roof, i: number, quiet = false) => {
  const t = r.tiles[i];
  if (!t || t.gone) return;
  t.gone = true; t.shake = 0;
  if (t.b) { state.blocks = state.blocks.filter(b => b !== t.b); t.b = null; }
  if (quiet) return;
  const x = ROOF_L + i * TILE;
  for (let k = 0; k < 3; k++) state.particles.push({ pos: { x: x + Math.random() * TILE, y: RY + Math.random() * 10 }, vel: { x: (Math.random() - 0.5) * 2, y: Math.random() * 2 }, life: 40, color: CHUNK_COLORS[Math.floor(Math.random() * CHUNK_COLORS.length)], size: 4 + Math.random() * 6 });
  if (Math.random() < 0.4) r.dust.push({ x: x + TILE / 2, y: RY, vx: (Math.random() - 0.5) * 0.6, vy: -0.6 - Math.random() * 0.6, r: 14 + Math.random() * 14, life: 90 });
  if (Math.random() < 0.25) playSound('crack', 0.5, Math.random() * 6 - 3);
};

/** The roof as it is when he's back here from a checkpoint: already blown open, the left of it gone, no Artie. */
const blownOpen = (state: GameState, r: Roof) => {
  for (let i = 0; i < TILES; i++) if (ROOF_L + i * TILE < HOLE_X + HOLE_W / 2) crumble(state, r, i, true);
  r.artie.gone = true; r.artie.on = false; r.emptyCart.on = false;
  r.caved = true; r.dust = [];
};

/** The roof starts going in after him: a lead first, and the warning (and him saying so). */
const startCollapse = (state: GameState, r: Roof, lead: number) => {
  r.front = HOLE_X + HOLE_W / 2; r.frontAt = state.frame + lead; r.warnAt = state.frame;
  playSound('rumble', 0.9); shakeScreen(state, 10, 3);
  meatheadSays(state, HURT_ROOF[0], true);
};

/** Back here from a checkpoint (from dying, too): the roof as it stands then, whatever it was when he died: every tile
 * of it back but the hole's (blown open) and the left of it (gone in with Artie), nothing cracked, the collapse not
 * started, no dust; the view put right up on him (not gliding up from the ground). */
const freshFromCheckpoint = (state: GameState, r: Roof) => {
  const p = state.player;
  r.tiles.forEach(t => { t.shake = 0; });
  blownOpen(state, r);
  r.scene = null; r.inHole = false; r.poof = 0; r.tumbled = false; r.tum = null; r.zoomK = 0; r.frontV = 0;
  state.cameraOverride = null;
  p.carried = false; p.hidden = false;
  if (p.pos.y + p.height < RY + 60) state.camera.y = state.cameraRestY = p.pos.y + p.height - 380;
  r.t = 1;
  startCollapse(state, r, LEAD_RESPAWN);
};

/** The front moved on (and every tile behind it in; the ones just ahead cracking). */
const advanceFront = (state: GameState, r: Roof, v: number) => {
  r.front += v;
  if (state.frame % 20 === 0) shakeScreen(state, 6, 2);
  for (let i = 0; i < TILES; i++) {
    const tx = ROOF_L + i * TILE;
    if (tx < r.front) crumble(state, r, i);
    else if (tx < r.front + 60) r.tiles[i].shake = 1;
  }
};

const endArrival = (state: GameState, r: Roof, skipped: boolean) => {
  const p = state.player;
  r.scene = null; r.token++; r.said = null; r.saidBy = null;
  if (skipped) {
    silenceAll(); state.playerVulgarityTimer = 0;
    blownOpen(state, r);
    p.pos.x = r.me.x - p.width / 2; p.pos.y = RY - p.height;
    if (p.pos.x + p.width / 2 < HOLE_X + HOLE_W / 2 + 20) p.pos.x = HOLE_X + HOLE_W / 2 + 60 - p.width / 2;
  }
  // (under his parachute, he drifts on off on his own, out of sight; otherwise he's gone)
  if (skipped || !r.artie.chute) { r.artie.gone = true; r.artie.on = false; }
  r.emptyCart.on = false;
  p.carried = false; p.hidden = false; p.inCutscene = false; p.vel.x = 0; p.vel.y = 0;
  startCollapse(state, r, LEAD_ARRIVE);
};

/** Up through the roof, both of them; their say; the left of it going in, Artie with it. */
const arrive = (ctx: FrameContext, r: Roof): Controls => {
  const { state } = ctx, p = state.player;
  r.t++;
  p.inCutscene = true; p.carried = !r.me.landed;
  if (r.t > SKIP_AFTER) offerSkip();
  if (r.t > SKIP_AFTER && takeSkip()) { endArrival(state, r, true); return hands(); }
  const t = r.t;
  if (t === 1) { playSound('rumble', 1); shakeScreen(state, 20, 4); state.cameraRestY = RY - 420; }
  // (the tiles over the cart's ramp, intact, then cracking and lifting under what's coming up: a knock, a bigger one)
  if (t > 1 && t < 20) for (let i = 0; i < TILES; i++) if (holeTile(i)) r.tiles[i].shake = 1;
  if (t === 8 || t === 14) {
    playSound('crack', t === 8 ? 0.7 : 1, -2); shakeScreen(state, 8, t === 8 ? 3 : 5);
    for (let k = 0; k < (t === 8 ? 5 : 9); k++) state.particles.push({ pos: { x: HOLE_X + (Math.random() - 0.5) * HOLE_W, y: RY - 2 }, vel: { x: (Math.random() - 0.5) * 3, y: -1.5 - Math.random() * 2.5 }, life: 26 + Math.random() * 14, color: CHUNK_COLORS[k % CHUNK_COLORS.length], size: 2 + Math.random() * 4 });
    r.dust.push({ x: HOLE_X + (Math.random() - 0.5) * 40, y: RY - 6, vx: (Math.random() - 0.5) * 0.6, vy: -0.4, r: 10 + Math.random() * 8, life: 50 });
  }
  // The blowout
  if (t === 20) {
    // (and through: the tiles burst up in pieces, the hole's there from now)
    for (let i = 0; i < TILES; i++) if (holeTile(i)) crumble(state, r, i, true);
    playSound('crash', 1); playSound('boom', 0.8); shakeScreen(state, 24, 12);
    for (let i = 0; i < TILES; i++) if (holeTile(i)) for (let k = 0; k < 3; k++) state.particles.push({ pos: { x: ROOF_L + i * TILE + Math.random() * TILE, y: RY + 4 }, vel: { x: (Math.random() - 0.5) * 6, y: -7 - Math.random() * 8 }, life: 60 + Math.random() * 20, color: k ? CHUNK_COLORS[(i + k) % 4] : CHUNK_COLORS[4 + (i % 2)], size: 8 + Math.random() * 8 });
    for (let i = 0; i < 40; i++) state.particles.push({ pos: { x: HOLE_X + (Math.random() - 0.5) * HOLE_W, y: RY }, vel: { x: (Math.random() - 0.5) * 10, y: -4 - Math.random() * 10 }, life: 50 + Math.random() * 30, color: CHUNK_COLORS[i % CHUNK_COLORS.length], size: 3 + Math.random() * 8 });
    for (let i = 0; i < 8; i++) r.dust.push({ x: HOLE_X + (Math.random() - 0.5) * 80, y: RY - 10, vx: (Math.random() - 0.5) * 1.5, vy: -1 - Math.random(), r: 20 + Math.random() * 20, life: 120 });
    r.emptyCart.on = true;
  }
  // Him: up out of the hole, and down onto the roof (the open side of it, to the right)
  const m = r.me;
  p.hidden = t < 20;
  if (t >= 20 && !m.landed) {
    m.vy += 0.5; m.x += m.vx; m.y += m.vy;
    if (m.vy > 0 && m.y >= RY && m.x > HOLE_X + HOLE_W / 2 + 10) { m.y = RY; m.landed = true; playSound('land', 1); playSound('thud', 0.8, -4); shakeScreen(state, 6, 4); }
  }
  if (!m.landed || p.carried) { p.pos.x = m.x - p.width / 2; p.pos.y = m.y - p.height; p.vel.y = 0; }
  p.vel.x = 0; p.facing = -1;
  // The cart after him: up, and back down the hole
  const ec = r.emptyCart;
  if (ec.on) { ec.vy += 0.5; ec.y += ec.vy; if (ec.y > RY + 200) { ec.on = false; playSound('crash', 0.7, -6); } }
  // Artie, up after him; down on his back on the far side (the left, against the wall)
  const a = r.artie;
  if (t === 34) { a.on = true; playSound('whoosh', 0.8); }
  if (a.on && !a.landed && !a.falling) {
    a.vy += 0.5; a.x += a.vx; a.y += a.vy;
    a.x = Math.max(a.x, ROOF_L + 14);
    if (a.vy > 0 && a.y >= RY && a.x < HOLE_X - HOLE_W / 2 - 10) { a.y = RY; a.landed = true; playSound('thud', 1, -6); playSound('crunch', 0.6); }
  }
  // Their say, then the left of the roof goes (Artie off it first)
  if (m.landed && a.landed && r.step === 0 && t > 100) {
    r.step = 1;
    someoneSays(r, 'artie', 'm2.safari', pick(ARTIE_LANDED[dressed(state)]), () => {
      const tok = r.token;
      meatheadSays(state, pick(MEATHEAD_LANDED), true, () => { if (r.token === tok && r.step === 1) r.step = 2; });
    });
  }
  // (nothing waits forever on a voice)
  if (r.step === 1 && t > 700) r.step = 2;
  if (r.step === 2) { r.step = 3; playSound('rumble', 1); r.caved = true; r.horror = true; }
  if (r.step >= 3) {
    shakeScreen(state, 4, 3);
    // (from the left-hand edge in to the hole, a tile every few frames)
    if (t % 3 === 0) for (let i = 0; i < TILES; i++) {
      if (ROOF_L + i * TILE + TILE > HOLE_X - HOLE_W / 2 + TILE) break;
      if (!r.tiles[i].gone) { crumble(state, r, i); break; }
    }
    // Coming for Artie: he's off it before it gets him, a leap up and out over the roof (and a parachute)
    if (a.landed && !a.falling) {
      const i = Math.floor((a.x - ROOF_L) / TILE);
      const near = [i - 3, i - 2, i - 1, i, i + 1].some(k => r.tiles[k] && r.tiles[k].gone);
      if (near) {
        a.falling = true; a.vy = -11; a.vx = 2.4; r.step = 4; r.said = null; playSound('whoosh', 0.8, 2);
        someoneSays(r, 'artie', 'm2.safari', pick(ARTIE_CHUTE[dressed(state)]), () => { r.step = 5; });
      }
    }
    const leftGone = r.tiles.every((tl, k) => ROOF_L + k * TILE + TILE > HOLE_X - HOLE_W / 2 + TILE || tl.gone);
    if ((r.step === 5 || t > 1100) && (a.gone || a.chute > 0) && leftGone) endArrival(state, r, false);
  }
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------
// Off the right edge: head over heels down the steps, a bonk on every one, and flat on his face at the bottom

const startTumble = (state: GameState, r: Roof) => {
  const p = state.player;
  const x = p.pos.x + p.width / 2, y = p.pos.y + p.height;
  r.scene = 'tumble'; r.tumbled = true; r.t = 0;
  r.tum = { i: 0, t: 0, fx: x, fy: y, x, y, ang: 0, spin: 0.28, squash: 0, flat: 0, up: 0 };
  // (what's left of the roof goes in right behind him: all of it by his first bonk)
  r.frontV = Math.max(FRONT_V, (ROOF_R + TILE - r.front) / (HOP_T - 4));
  p.facing = 1;
  playSound('whoosh', 0.8);
};

/** Down, standing by the line (where the tumble, or skipping it, leaves him). */
const endTumble = (state: GameState, r: Roof) => {
  const p = state.player;
  for (let i = 0; i < TILES; i++) crumble(state, r, i, true);
  r.tum = null; p.hidden = false; p.carried = false; p.isGrounded = true;
  p.pos.x = SPLAT_X - p.width / 2; p.pos.y = GY - p.height; p.vel.x = 0; p.vel.y = 0; p.facing = 1;
};

const bonk = (state: GameState, x: number, y: number, big: boolean) => {
  playSound('thud', big ? 1 : 0.8, big ? -8 : -2 + Math.random() * 4);
  playSound(big ? 'slam' : 'crunch', big ? 1 : 0.35);
  shakeScreen(state, big ? 12 : 6, big ? 7 : 3);
  for (let k = 0; k < (big ? 14 : 6); k++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * (big ? 60 : 24), y: y - 2 }, vel: { x: (Math.random() - 0.5) * (big ? 5 : 3), y: -0.5 - Math.random() * (big ? 2.5 : 1.5) }, life: 34 + Math.random() * 20, color: big ? 'rgba(161,98,7,0.75)' : 'rgba(168,162,158,0.75)', size: 6 + Math.random() * (big ? 10 : 6) });
};

const tumble = (ctx: FrameContext, r: Roof): Controls => {
  const { state } = ctx, p = state.player;
  const m = r.tum!;
  r.t++;
  p.inCutscene = true; p.carried = true; p.hidden = true; p.vel.x = 0; p.vel.y = 0; p.facing = 1;
  // (all of it: the tumble and the view pulling out after, one skip)
  if (r.t > SKIP_AFTER) offerSkip();
  if (r.t > SKIP_AFTER && takeSkip()) { endTumble(state, r); endZoom(state, r, true); return hands(); }
  m.squash *= 0.8;
  if (r.front < ROOF_R + TILE) advanceFront(state, r, r.frontV || FRONT_V);
  if (m.i < HOPS.length) {
    // A hop: across and down to the next step, popping up off the last one, spinning
    const to = HOPS[m.i];
    m.t++;
    const s = Math.min(1, m.t / HOP_T);
    const pop = m.i === 0 ? 14 : 26 - m.i * 3;
    m.x = m.fx + (to.x - m.fx) * s;
    m.y = m.fy + (to.y - m.fy) * s * s - pop * 4 * s * (1 - s);
    m.ang += m.spin;
    if (s >= 1) {
      const last = m.i === HOPS.length - 1;
      bonk(state, to.x, to.y, last);
      m.fx = to.x; m.fy = to.y; m.i++; m.t = 0; m.squash = 1;
      // (each bonk knocks the spin about: faster, slower, the other way a moment)
      m.spin = [0.42, -0.2, 0.5][m.i - 1] ?? m.spin;
      if (last) { m.ang = Math.PI / 2; m.flat = 1; }
    }
  } else if (m.flat > 0 && m.flat < SPLAT_HOLD) {
    // Flat on his face, his backside up; a twitch or two
    m.flat++;
    if (m.flat === 26 || m.flat === 40) playSound('boing', 0.3, 8);
  } else {
    // Up again, dusting himself off (no harm done)
    m.up++;
    if (m.up === 1) playSound('land', 0.5, 4);
    if (m.up >= GET_UP) {
      endTumble(state, r);
      r.scene = 'zoom'; r.t = 0; r.step = 0;
      return hands();
    }
  }
  p.pos.x = m.x - p.width / 2; p.pos.y = m.y - p.height;
  return hands();
};

/** Him as he is, stood at (x, y), in whatever's been done to the canvas round it (no shadow of his own: it'd turn with him). */
const drawMeatheadAt = (c: CanvasRenderingContext2D, state: GameState, x: number, y: number, extra: Record<string, unknown>) => {
  const p = state.player;
  const b = {
    ...p, pos: { x: x - p.width / 2, y: y - p.height }, facing: 1, hidden: false, headless: 0, shownDead: false, isGrounded: true,
    vel: { x: 0, y: 0 }, invincibilityTimer: 0, hurtTimer: 0, pushbackTimer: 0, isCharging: false, isSliding: false, isUppercutting: false,
    isDivekicking: false, isDucking: false, squash: 0, hurtForm: null, hurtFormTimer: 0, filthShieldTimer: 0, ...extra,
  };
  drawPlayer(c, b as typeof p, { ...state, blocks: [], groundRuns: [], deathTimer: 0, playerVulgarityTimer: 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false });
};

/** Him, drawn here in the tumble (spinning, flailing, screaming; flat; getting up). */
const drawTumbler = (c: CanvasRenderingContext2D, state: GameState, m: Tumble) => {
  const f = state.frame;
  if (m.i >= HOPS.length) { c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.ellipse(m.x + 6, GY, 40, 5, 0, 0, Math.PI * 2); c.fill(); }
  c.save();
  if (m.i < HOPS.length) {
    // (spun about his middle, limbs flapping: up, down, up)
    const cy = m.y - 32;
    c.translate(m.x, cy); c.rotate(m.ang); c.scale(1 + m.squash * 0.2, 1 - m.squash * 0.2); c.translate(-m.x, -cy);
    drawMeatheadAt(c, state, m.x, m.y, { isGrounded: false, vel: { x: 0, y: Math.floor(f / 5) % 2 ? 7 : -7 }, deathFace: 'scream' });
  } else {
    // (on his face, his rear end in the air; the squash of the landing; then rolled back up onto his feet)
    const k = m.up > 0 ? Math.min(1, m.up / GET_UP) : 0, e = k * k * (3 - 2 * k);
    const sq = m.flat < 10 && m.up === 0 ? 1 - m.flat / 10 : 0;
    const twitch = (m.flat > 26 && m.flat < 30) || (m.flat > 40 && m.flat < 43) ? -0.06 : 0;
    const ang = (Math.PI / 2 + 0.24 + twitch) * (1 - e);
    c.translate(m.x, GY); c.scale(1 + sq * 0.35, 1 - sq * 0.3); c.translate(-m.x, -GY);
    c.translate(0, 9 * (1 - e));
    const cy = GY - 32;
    c.translate(m.x, cy); c.rotate(ang); c.translate(-m.x, -cy);
    drawMeatheadAt(c, state, m.x, GY, m.up > 0 ? {} : { deathFace: 'dead' });
  }
  c.restore();
  // (seeing stars, while he's down)
  if (m.flat > 6 && m.up === 0) {
    const hx = m.x + 34, hy = GY - 30;
    for (let k = 0; k < 3; k++) {
      const a = f * 0.18 + k * (Math.PI * 2 / 3);
      const sx = Math.round(hx + Math.cos(a) * 16), sy = Math.round(hy + Math.sin(a) * 5);
      c.fillStyle = '#FDE047'; c.fillRect(sx - 1, sy - 3, 2, 6); c.fillRect(sx - 3, sy - 1, 6, 2);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------

const endZoom = (state: GameState, r: Roof, skipped: boolean) => {
  if (skipped) { silenceAll(); state.playerVulgarityTimer = 0; }
  r.token++; r.said = null; r.saidBy = null;
  r.scene = null; r.zoomK = 0;
  const p = state.player; p.inCutscene = false; p.carried = false; p.hidden = false; p.facing = 1;
};

/** The view pulls out on the temple: the roof caving in, chunks coming off it, the dust; the line, horrified. */
const zoomOut = (ctx: FrameContext, r: Roof): Controls => {
  const { state } = ctx, p = state.player;
  r.t++;
  p.inCutscene = true;
  // (the same cutscene as the tumble: skippable from the off)
  offerSkip();
  if (takeSkip()) { endZoom(state, r, true); return hands(); }
  const t = r.t;
  if (r.step < 9) r.zoomK = Math.min(1, r.zoomK + 1 / 60);
  else r.zoomK = Math.max(0, r.zoomK - 1 / 40);
  if (t === 1) { playSound('rumble', 1); playSound('screams', 0.7); }
  // Chunks off the top, dust coming up out of it
  if (r.step < 9 && t % 9 === 0) {
    const x = ROOF_L + Math.random() * (ROOF_R - ROOF_L);
    state.particles.push({ pos: { x, y: RY + 10 }, vel: { x: (Math.random() - 0.5) * 4, y: -2 - Math.random() * 3 }, life: 70, color: CHUNK_COLORS[t % CHUNK_COLORS.length], size: 6 + Math.random() * 10 });
    r.dust.push({ x, y: RY - 10, vx: (Math.random() - 0.5) * 0.8, vy: -0.8 - Math.random() * 0.6, r: 24 + Math.random() * 24, life: 140 });
    if (t % 27 === 0) { playSound('crash', 0.5, -8 + Math.random() * 4); shakeScreen(state, 8, 3); }
  }
  // The line, him, the line
  if (t === 50 && r.step === 0) {
    r.step = 1;
    someoneSays(r, 'f', 'm2.guest', pick(GUEST_GASP), () => {
      someoneSays(r, 'm', 'm2.guest2', GUEST2_HIM[dressed(state)], () => {
        const tok = r.token;
        meatheadSays(state, pick(MEATHEAD_TO_LINE), true, () => {
          if (r.token !== tok) return;
          someoneSays(r, 'f', 'm2.guest', GUEST_AFTER[0], () => { r.step = 8; });
        });
      });
    });
  }
  if ((r.step === 8 || t > 1300) && r.step < 9) r.step = 9;
  if (r.step === 9 && r.zoomK <= 0) endZoom(state, r, false);
  p.vel.x = 0;
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------

/** Artie off the roof: up, the parachute pops (a yank), and he drifts down and off to the right on the breeze (toward the
 * clearing), out of sight. */
const floatArtie = (state: GameState, r: Roof) => {
  const a = r.artie;
  if (!a.on || a.gone || !a.falling) return;
  if (!a.chute) {
    a.vy += 0.45; a.x += a.vx; a.y += a.vy;
    if (a.vy > 1) { a.chute = 1; a.vy = -1.5; playSound('whoosh', 1, 6); }
    return;
  }
  a.chute++;
  a.vy += (0.75 - a.vy) * 0.06; a.vx += (3.2 - a.vx) * 0.03;
  a.x += a.vx + Math.sin(a.chute * 0.05) * 0.7; a.y += a.vy;
  // (out of sight: off the right of the view, or down below the trees)
  if (a.x > state.camera.x + CANVAS_WIDTH + 140 || a.y > GY + 40) a.gone = true;
};

const run = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player;
  const r = getRoof(state);
  const adv = getAdv(state)!.s as Record<string, unknown>;
  // Coming up through it (from the cart), the first time; back here from a checkpoint, it's blown open already
  if (r.t === 0 && r.scene === null && !r.caved) {
    if (adv.roofArrival && firstVisit(state)) { adv.roofArrival = false; r.scene = 'arrive'; }
    else freshFromCheckpoint(state, r);
  }
  floatArtie(state, r);
  if (r.scene === 'arrive') return arrive(ctx, r);
  if (r.scene === 'tumble') return tumble(ctx, r);
  if (r.scene === 'zoom') return zoomOut(ctx, r);
  p.carried = false;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  const onRoof = !r.tumbled && feet < RY + 40 && cx > ROOF_L - 40 && cx < ROOF_R + 40;
  // The roof going in after him, from the hole rightward (cracking a little way ahead of where it's got to)
  // (never more than a way behind him: run as he likes, it's right on his heels when he goes off the edge)
  if (onRoof && r.frontAt && state.frame > r.frontAt) advanceFront(state, r, Math.max(FRONT_V, Math.min(7, (cx - FRONT_TRAIL - r.front) * 0.05)));
  // In through it: down the hole, behind its front (and that's him)
  if (!r.tumbled && feet > RY + 14 && cx > ROOF_L - 20 && cx < ROOF_R + 20) r.inHole = true;
  if (r.inHole && feet > RY + 110 && p.health > 0) {
    hurtPlayer(ctx, 9999, 'roof_collapse');
    if (p.health <= 0 && !r.poof) {
      r.poof = 1; r.poofX = Math.max(ROOF_L + 30, Math.min(ROOF_R - 30, cx)); playSound('crash', 1, -6); playSound('rumble', 0.8);
      // (the view stays up on the roof, a little above it, for the cloud: not down the hole after him)
      state.cameraOverride = { x: state.camera.x, y: state.camera.y - 120 };
    }
  }
  // (still alive down there somehow, the cheat on: back up onto what's left of the roof)
  if (r.inHole && feet > GY + 500 && p.health > 0) {
    r.inHole = false; p.pos.x = ROOF_R - 60 - p.width / 2; p.pos.y = RY - p.height - 40; p.vel.x = 0; p.vel.y = 0;
  }
  // Off the right edge (at roof height, or well clear of it): down the side
  if (!r.tumbled && !r.inHole && p.health > 0 && cx > ROOF_R - 4 && (feet > RY - 10 || cx > ROOF_R + 60)) { startTumble(state, r); return tumble(ctx, r); }
  // On, right, past the line, to the clearing
  if (cx > EXIT_X) teleport(state, SECTIONS.clearing.x0 + 150, GY);
  return controls;
};

const roofZoom = (state: GameState) => {
  const r = getRoof(state);
  if (r.zoomK <= 0.001) return null;
  const k = r.zoomK * r.zoomK * (3 - 2 * r.zoomK);
  const s = 1 - k * (1 - ZOOM_TO);
  if (s > 0.999) return null;
  // The temple's middle, from where it is on screen now to the middle of the screen
  const Zx = ZOOM_X, Zy = ZOOM_Y;
  const cam = state.camera;
  const Sx = (Zx - cam.x) + (400 - (Zx - cam.x)) * k, Sy = (Zy - cam.y) + (360 - (Zy - cam.y)) * k;
  return { scale: s, x: (Sx + cam.x - Zx * s) / (1 - s), y: (Sy + cam.y - Zy * s) / (1 - s) };
};

export const roof: Section = {
  id: 'roof', x0, x1,
  checkpoints: [{ name: 'THE TEMPLE ROOF', cp: 60, x: x0 + 800, y: RY }],
  build: (state) => {
    lay(state, [{ x1: x0, y1: GY, x2: BASE_L - 10, y2: GY, surface: 'concrete' }, { x1: BASE_R + 10, y1: GY, x2: x1, y2: GY, surface: 'concrete' }]);
    // (inside the temple: a floor way down, out of sight; the fall in kills him well before it)
    lay(state, [{ x1: BASE_L - 10, y1: GY + 600, x2: BASE_R + 10, y2: GY + 600, surface: 'concrete' }]);
    // (the far side, the left: no way off it; the right side's foot: no way back into it from the line)
    state.blocks.push({ x: ROOF_L - 40, y: -4000, w: 40, h: 4000 + GY + 700, type: 'wall', hidden: true, tag: 'roof-l' } as never);
    state.blocks.push({ x: BASE_R - 30, y: -4000, w: 40, h: 4000 + GY + 700, type: 'wall', hidden: true, tag: 'roof-r' } as never);
    // (and the end of the section past the way on)
    state.blocks.push({ x: x1 - 40, y: -4000, w: 40, h: 4000 + GY + 700, type: 'wall', hidden: true, tag: 'roof-end' } as never);
    const r = getRoof(state);
    for (let i = 0; i < TILES; i++) {
      const x = ROOF_L + i * TILE;
      // (over the hole-to-be: there, but nothing to stand on: he's coming up through it)
      const b = holeTile(i) ? null : { x, y: RY, w: TILE, h: 30, type: 'wall', hidden: true, tag: 'roof' };
      if (b) state.blocks.push(b as never);
      r.tiles.push({ b, gone: false, shake: 0 });
    }
  },
  update: (ctx, controls) => { const out = run(ctx, controls); setUi({ introCutscene: !!ctx.state.player.inCutscene }); return out; },
  zoom: (state) => roofZoom(state),
  cameraX: (state) => {
    const r = getRoof(state);
    // (up on the roof, it's the roof; down by the line, the way on)
    return state.player.pos.y + state.player.height < RY + 60 && !r.tumbled ? { min: ROOF_L - 200, max: ROOF_R + 300 - CANVAS_WIDTH } : { min: x0, max: x1 - CANVAS_WIDTH };
  },
  // (up on the roof, the temple's tiers under him in view)
  cameraRow: (state) => (state.player.pos.y + state.player.height < RY + 60 && !getRoof(state).tumbled ? 380 : undefined),
  drawBackdrop: (c, state) => { drawRoofBackdrop(c, state); return true; },
  // (the tiki torches by the entrance, at night)
  lamps: () => TORCHES.map(x => ({ x, y: GY - 112, r: 150, a: 0.9, color: '#FFB060' })),
  outdoors: () => 1,
  drawBack: (c, state) => drawTemple(c, state),
  drawFront: (c, state) => drawRoofFront(c, state),
  drawHud: (c, state) => {
    const r = getRoof(state);
    // (in from the cart's black)
    if (r.scene === 'arrive' && r.t < 24) { c.fillStyle = `rgba(0,0,0,${1 - r.t / 24})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
    // (pulled out, the words are said at a size to read: over whoever's saying them, on the screen)
    const z = roofZoom(state);
    if (z && r.said?.text && (r.saidBy === 'f' || r.saidBy === 'm')) {
      const g = GUESTS[r.saidBy === 'f' ? SPEAKER_F : SPEAKER_M];
      const sx = (g.x - z.x) * z.scale + z.x - state.camera.x, sy = (GY - g.h - 10 - z.y) * z.scale + z.y - state.camera.y;
      saidOver(c, r.said.text, Math.max(130, Math.min(CANVAS_WIDTH - 130, sx)), Math.max(130, sy - 10), '#FFFFFF');
    }
    if (z && state.playerVulgarityTimer > 0 && state.playerLastVulgarity) {
      const p = state.player;
      const sx = (p.pos.x + p.width / 2 - z.x) * z.scale + z.x - state.camera.x, sy = (p.pos.y - 10 - z.y) * z.scale + z.y - state.camera.y;
      saidOver(c, state.playerLastVulgarity, Math.max(130, Math.min(CANVAS_WIDTH - 130, sx)), Math.max(130, sy - 30), '#FDE047');
    }
    if ((r.scene === 'arrive' || r.scene === 'tumble') && r.t > SKIP_AFTER || r.scene === 'zoom') drawSkipPrompt(c, CANVAS_WIDTH);
    // RUN! (the roof's going: up top, clear of the HUD, flashing)
    const w = state.frame - r.warnAt;
    if (r.warnAt && w >= 0 && w < WARN_T && !r.scene && !r.tumbled && !r.inHole && !state.player.inCutscene && state.player.health > 0) {
      const band = topBand(), on = Math.floor(w / 8) % 2 === 0;
      label(c, 'RUN!', band.mid, 52, on ? '#FDE047' : '#EF4444', 24);
      label(c, 'THE ROOF IS GOING!', band.mid, 76, '#FFFFFF', 8);
    }
  },
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (art.ts)

const drawTemple = (c: CanvasRenderingContext2D, state: GameState) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  if (v.x > x1 + 600 || v.x + v.w < x0 - 600) return;
  const r = getRoof(state);
  // The ride's line going back in switchbacks across the plaza: behind the temple, so first
  drawLineBack(c, state, r);
  drawTempleBody(c, state, r);
  // The line's front row, its signs, the way on
  drawLine(c, state, r, r.said?.text ? (r.saidBy === 'f' ? SPEAKER_F : r.saidBy === 'm' ? SPEAKER_M : -1) : -1);
  // The dust coming up out of it
  drawDust(c, r);
  r.dust = r.dust.filter(d => { d.x += d.vx; d.y += d.vy; d.r += 0.25; return --d.life > 0; });
};

const drawRoofFront = (c: CanvasRenderingContext2D, state: GameState) => {
  const r = getRoof(state), f = state.frame;
  // Gone in the hole: the temple's front back over him (he's behind it, falling)
  if (r.inHole) {
    c.save(); c.beginPath(); c.rect(BASE_L - 10, RY + 16, BASE_R - BASE_L + 20, GY + 1400 - RY); c.rect(x0 - 600, GY, x1 - x0 + 1200, 1400); c.clip();
    drawTempleBody(c, state, r);
    c.restore();
  }
  if (r.poof) {
    drawPoof(c, r.poof, r.poofX); r.poof++;
    // (what's left of him, down there in the dark, stays down there: nothing of it out over the sides of the temple)
    if (state.particles.some(q => q.pos.y > RY + 16)) state.particles = state.particles.filter(q => q.pos.y <= RY + 16);
  }
  if (r.tum) drawTumbler(c, state, r.tum);
  const a = r.artie;
  if (a.on && !a.gone) {
    if (a.chute) drawChute(c, a.x, a.y, a.chute, f);
    drawSafariArtie(c, a.x, a.y, 1, f, a.chute ? 'dodge' : a.falling ? 'run' : !a.landed ? 'hurt' : r.saidBy === 'artie' ? 'angry' : 'hurt');
  }
  const ec = r.emptyCart;
  if (ec.on) drawCart(c, ec.x, ec.y, ec.vy, f);
  // What's being said, over whoever's saying it
  if (r.said?.text) {
    const who = r.saidBy === 'artie' ? { x: a.x, y: a.y - (a.chute ? 212 : 100) } : r.saidBy === 'f' ? { x: GUESTS[SPEAKER_F].x, y: GY - 90 } : r.saidBy === 'm' ? { x: GUESTS[SPEAKER_M].x, y: GY - 90 } : null;
    if (who && r.zoomK <= 0.001) saidOver(c, r.said.text, Math.min(x1 - 160, Math.max(x0 + 160, who.x)), who.y, r.saidBy === 'artie' ? '#FDE68A' : '#FFFFFF');
  }
};
