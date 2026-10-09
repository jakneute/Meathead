// THE TEMPLE ROOF. Out of the top of the mine cart's ramp and up through the temple's roof (the first time:
// `blowout`): he and Safari Artie land on it, Artie has his say, and the roof starts going in, the left of it first
// (Artie with it: there's no way off on that side, a wall), then it comes after him from the left. Off the right edge
// he tumbles head over heels down the temple's stepped side, bouncing off every step, and splats flat on his face on
// the ground by the ride's line (no harm done: a beat lying there, and up). The view pulls out on the temple (still
// standing: only its roof's gone in) with the people in line watching it in horror. Then on, right, past the line, to
// the clearing (no way back into the temple: its side's a wall). Caught by the roof, he goes in through the hole,
// behind its broken front, and a big dust cloud puffs up out of it.
//
// Crude on purpose (the first pass): boxes and words.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Section, Said } from '../section';
import { lay, speak, meatheadSays, teleport, box, label, saidOver,  hands, getAdv, sectionState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { setUi } from '../../store';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { shakeScreen } from '../../../m1/game/core/state';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { registerHurtLines } from '../../kinds';
import { drawSafariArtie } from '../river/artie';
import { drawPlayer } from '../../../m1/game/render/player/player';
import {
  type Dressed, ARTIE_LANDED, MEATHEAD_LANDED, ARTIE_FALLS, GUEST_GASP, GUEST2_HIM, MEATHEAD_TO_LINE, GUEST_AFTER, HURT_ROOF, DEATH_ROOF,
} from './lines';

const { x0, x1 } = SECTIONS.roof;

registerHurtLines('roof_collapse', HURT_ROOF, DEATH_ROOF);

const pick = <T>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
/** First time through (a return trip will differ: the temple on fire, say). One flag per set piece. */
const firstVisit = (_state: GameState) => true;

// ---------------------------------------------------------------------------------------------------------------
// The temple: a stepped pyramid, four tiers; its roof (the top of the top tier) is what he's on

const BASE_L = x0 + 200, BASE_R = x0 + 1600, TIER_H = 140, TIER_IN = 110;
const RY = GY - 4 * TIER_H;
const ROOF_L = BASE_L + 3 * TIER_IN, ROOF_R = BASE_R - 3 * TIER_IN;
/** Where he comes up through it (the cart's ramp puts him under here). */
export const HOLE_X = x0 + 620;
const HOLE_W = 80;
const TILE = 20;
/** The view pulled out: how far, about where (to the middle of the screen). */
const ZOOM_TO = 0.38, ZOOM_X = x0 + 1190, ZOOM_Y = GY - 290;
const TILES = Math.round((ROOF_R - ROOF_L) / TILE);
/** The ride's line, outside, on the ground to the right (he lands at the head of it). */
const LINE_L = BASE_R + 110, LINE_R = LINE_L + 400;
/** Where he splats, at the foot of the temple's right side; and where the way on is (past the line). */
const SPLAT_X = BASE_R + 50, EXIT_X = x1 - 150;
const GUESTS = Array.from({ length: 11 }, (_, i) => {
  const r = (n: number) => { const s = Math.sin((i + 1) * 91.7 + n * 13.3) * 43758.5; return s - Math.floor(s); };
  return {
    x: LINE_L + 10 + i * 36 + r(1) * 8,
    woman: r(2) < 0.5,
    skin: ['#8D5524', '#C68642', '#E0AC69', '#F1C27D', '#FFDBAC', '#5C3A21'][Math.floor(r(3) * 6)],
    shirt: ['#2563EB', '#DC2626', '#16A34A', '#F59E0B', '#9333EA', '#0EA5E9', '#F472B6'][Math.floor(r(4) * 7)],
    hair: ['#1C1917', '#78350F', '#FDE68A', '#A8A29E', '#B45309'][Math.floor(r(5) * 5)],
    h: 54 + r(6) * 16, wide: 14 + r(7) * 8,
  };
});
/** Which of them say things: a woman, a man. */
const SPEAKER_F = GUESTS.findIndex(g => g.woman), SPEAKER_M = GUESTS.findIndex(g => !g.woman);

/** Off the edge: the hops down the steps (the landing spots: each tier's ledge, then the ground), frames a hop. */
const HOPS = [
  { x: BASE_R - 2.5 * TIER_IN, y: GY - 3 * TIER_H },
  { x: BASE_R - 1.5 * TIER_IN, y: GY - 2 * TIER_H },
  { x: BASE_R - 0.5 * TIER_IN, y: GY - TIER_H },
  { x: SPLAT_X, y: GY },
];
const HOP_T = 24, SPLAT_HOLD = 60, GET_UP = 18;

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
  said: Said | null; saidBy: 'artie' | 'f' | 'm' | null;
  /** Him flying up out of it (the cutscene's own physics). */
  me: { x: number; y: number; vx: number; vy: number; landed: boolean };
  artie: { on: boolean; x: number; y: number; vx: number; vy: number; landed: boolean; falling: boolean; gone: boolean };
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
  tiles: [], scene: null, t: 0, token: 0, front: HOLE_X + HOLE_W / 2, frontAt: 0,
  said: null, saidBy: null,
  me: { x: HOLE_X, y: RY + 120, vx: 2.1, vy: -15, landed: false },
  artie: { on: false, x: HOLE_X, y: RY + 120, vx: -1.4, vy: -14, landed: false, falling: false, gone: false },
  emptyCart: { x: HOLE_X, y: RY + 120, vy: -12, on: false },
  step: 0, zoomK: 0, tum: null, tumbled: false, inHole: false, poof: 0, poofX: HOLE_X,
  caved: false, horror: false, dust: [],
}));

const someoneSays = (r: Roof, who: 'artie' | 'f' | 'm', voiceId: string, text: string, onDone?: () => void) => {
  const tok = r.token;
  r.saidBy = who;
  speak(voiceId, text, s => { if (r.token !== tok) return; r.said = s; if (!s) r.saidBy = null; }, true, () => { if (r.token === tok) onDone?.(); });
};

const crumble = (state: GameState, r: Roof, i: number) => {
  const t = r.tiles[i];
  if (!t || t.gone) return;
  t.gone = true;
  if (t.b) { state.blocks = state.blocks.filter(b => b !== t.b); t.b = null; }
  const x = ROOF_L + i * TILE;
  for (let k = 0; k < 3; k++) state.particles.push({ pos: { x: x + Math.random() * TILE, y: RY + Math.random() * 10 }, vel: { x: (Math.random() - 0.5) * 2, y: Math.random() * 2 }, life: 40, color: ['#A8A29E', '#78716C', '#D6D3D1'][k], size: 4 + Math.random() * 6 });
  if (Math.random() < 0.4) r.dust.push({ x: x + TILE / 2, y: RY, vx: (Math.random() - 0.5) * 0.6, vy: -0.6 - Math.random() * 0.6, r: 14 + Math.random() * 14, life: 90 });
  if (Math.random() < 0.25) playSound('crack', 0.5, Math.random() * 6 - 3);
};

/** The roof as it is when he's back here from a checkpoint: already blown open, the left of it gone, no Artie. */
const blownOpen = (state: GameState, r: Roof) => {
  for (let i = 0; i < TILES; i++) if (ROOF_L + i * TILE < HOLE_X + HOLE_W / 2) crumble(state, r, i);
  r.artie.gone = true; r.artie.on = false; r.emptyCart.on = false;
  r.caved = true; r.dust = [];
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
  r.artie.gone = true; r.artie.on = false; r.emptyCart.on = false;
  p.carried = false; p.hidden = false; p.inCutscene = false; p.vel.x = 0; p.vel.y = 0;
  r.frontAt = state.frame + 20;
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
  // The blowout
  if (t === 20) {
    playSound('crash', 1); playSound('boom', 0.8); shakeScreen(state, 24, 12);
    for (let i = 0; i < 40; i++) state.particles.push({ pos: { x: HOLE_X + (Math.random() - 0.5) * HOLE_W, y: RY }, vel: { x: (Math.random() - 0.5) * 10, y: -4 - Math.random() * 10 }, life: 50 + Math.random() * 30, color: ['#A8A29E', '#78716C', '#D6D3D1', '#57534E'][i % 4], size: 3 + Math.random() * 8 });
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
  // Their say, then the left of the roof goes (and him on it)
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
    // Under Artie: down he goes
    if (a.landed && !a.falling) {
      const i = Math.floor((a.x - ROOF_L) / TILE);
      const under = [i - 1, i, i + 1].some(k => r.tiles[k] && r.tiles[k].gone);
      if (under) { a.falling = true; a.vy = -2; r.step = 4; r.said = null; someoneSays(r, 'artie', 'm2.safari', ARTIE_FALLS[0], () => { r.step = 5; }); }
    }
    if (a.falling) { a.vy += 0.4; a.y += a.vy; if (a.y > RY + 300) a.gone = true; }
    const leftGone = r.tiles.every((tl, k) => ROOF_L + k * TILE + TILE > HOLE_X - HOLE_W / 2 + TILE || tl.gone);
    if ((r.step === 5 || t > 1100) && a.gone && leftGone) endArrival(state, r, false);
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
  p.facing = 1;
  playSound('whoosh', 0.8);
};

/** Down, standing by the line (where the tumble, or skipping it, leaves him). */
const endTumble = (state: GameState, r: Roof) => {
  const p = state.player;
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
    state.particles.push({ pos: { x, y: RY + 10 }, vel: { x: (Math.random() - 0.5) * 4, y: -2 - Math.random() * 3 }, life: 70, color: ['#A8A29E', '#78716C', '#57534E'][t % 3], size: 6 + Math.random() * 10 });
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

const run = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player;
  const r = getRoof(state);
  const adv = getAdv(state)!.s as Record<string, unknown>;
  // Coming up through it (from the cart), the first time; back here from a checkpoint, it's blown open already
  if (r.t === 0 && r.scene === null && !r.caved) {
    if (adv.roofArrival && firstVisit(state)) { adv.roofArrival = false; r.scene = 'arrive'; }
    else { blownOpen(state, r); p.carried = false; r.frontAt = state.frame + 60; r.t = 1; }
  }
  if (r.scene === 'arrive') return arrive(ctx, r);
  if (r.scene === 'tumble') return tumble(ctx, r);
  if (r.scene === 'zoom') return zoomOut(ctx, r);
  p.carried = false;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  const onRoof = !r.tumbled && feet < RY + 40 && cx > ROOF_L - 40 && cx < ROOF_R + 40;
  // The roof going in after him, from the hole rightward (cracking a little way ahead of where it's got to)
  if (onRoof && r.frontAt && state.frame > r.frontAt) {
    r.front += 2.6;
    if (state.frame % 20 === 0) shakeScreen(state, 6, 2);
    for (let i = 0; i < TILES; i++) {
      const tx = ROOF_L + i * TILE;
      if (tx < r.front) crumble(state, r, i);
      else if (tx < r.front + 60) r.tiles[i].shake = 1;
    }
  }
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
      const inHole = x + TILE > HOLE_X - HOLE_W / 2 && x < HOLE_X + HOLE_W / 2;
      const b = inHole ? null : { x, y: RY, w: TILE, h: 30, type: 'wall', hidden: true, tag: 'roof' };
      if (b) state.blocks.push(b as never);
      r.tiles.push({ b, gone: inHole, shake: 0 });
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
  drawBackdrop: (c, state) => {
    const g = c.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    g.addColorStop(0, '#60A5FA'); g.addColorStop(1, '#BAE6FD');
    c.fillStyle = g; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const off = (state.camera.x * 0.2) % 200;
    for (let i = -1; i < 6; i++) box(c, i * 200 - off, 380 - ((i * 53) % 70), 160, 300, '#3F6212');
    return true;
  },
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
  },
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (crude)

const STONE = '#A8A29E', STONE_DK = '#78716C', STONE_LT = '#D6D3D1';

const drawGuest = (c: CanvasRenderingContext2D, g: typeof GUESTS[number], f: number, horror: boolean, i: number) => {
  const x = g.x, y = GY, h = g.h, w = g.wide;
  const shake = horror ? Math.sin(f * 0.6 + i) * 1.2 : 0;
  // legs (or a skirt), body, head, hair; arms down, or up to the face in horror
  if (g.woman && i % 2 === 0) box(c, x - w / 2, y - h * 0.45, w, h * 0.3, g.shirt);
  box(c, x - w / 2 + 2, y - h * 0.4, 4, h * 0.4, '#1E3A8A'); box(c, x + w / 2 - 6, y - h * 0.4, 4, h * 0.4, '#1E3A8A');
  box(c, x - w / 2 + shake, y - h * 0.78, w, h * 0.42, g.shirt);
  const hy = y - h + shake;
  box(c, x - 6 + shake, hy, 12, 13, g.skin);
  box(c, x - 7 + shake, hy - 3, 14, 5, g.hair);
  if (g.woman) box(c, x - 8 + shake, hy, 3, 16, g.hair), box(c, x + 5 + shake, hy, 3, 16, g.hair);
  if (horror) {
    box(c, x - w / 2 - 4 + shake, hy + 4, 4, h * 0.36, g.skin); box(c, x + w / 2 + shake, hy + 4, 4, h * 0.36, g.skin);
    box(c, x - 2 + shake, hy + 8, 4, 4, '#1C1917');
  } else box(c, x - 2, hy + 9, 4, 1, '#1C1917');
};

/** The temple itself (the ground round it, its tiers, its roof): drawn again over him once he's gone in the hole. */
const drawTempleBody = (c: CanvasRenderingContext2D, r: Roof, f: number) => {
  // The ground outside
  box(c, x0 - 600, GY, x1 - x0 + 1200, 1400, '#4D7C0F'); box(c, x0, GY, x1 - x0, 4, '#84CC16');
  // The temple: four tiers, stepped (all of it background: dimmed, but for the roof he's on)
  for (let k = 0; k < 4; k++) {
    const l = BASE_L + k * TIER_IN, rr = BASE_R - k * TIER_IN, top = GY - (k + 1) * TIER_H;
    box(c, l, top, rr - l, TIER_H, k % 2 ? '#857B70' : '#7A7066');
    for (let y = top + 20; y < top + TIER_H; y += 28) box(c, l, y, rr - l, 2, '#615850');
    if (k < 3) box(c, rr - TIER_IN, top, TIER_IN, 3, '#8F857A');
  }
  // (the ride's entrance, at the bottom, where the line goes in)
  box(c, BASE_R - 120, GY - 110, 80, 110, '#1C1917'); label(c, 'ENTRANCE', BASE_R - 80, GY - 118, '#FDE68A', 6);
  // The roof: what's left of it (lit along its top: it's to stand on), the shaking bits, the hole into the dark
  box(c, ROOF_L, RY, ROOF_R - ROOF_L, 40, '#1C1917');
  r.tiles.forEach((t, i) => {
    if (t.gone) return;
    const x = ROOF_L + i * TILE, j = t.shake ? Math.round(Math.sin(f * 1.7 + i) * 1.5) : 0;
    box(c, x + j, RY, TILE, 40, i % 2 ? STONE : '#9E958C'); box(c, x + j, RY, TILE, 4, STONE_LT);
    if (t.shake) box(c, x + 6, RY + 6, 2, 22, STONE_DK);
  });
  // (caved in: broken edges round the top tier, rubble down its sides; it's still standing)
  if (r.caved) {
    for (let i = 0; i < 8; i++) box(c, ROOF_L + 30 + i * 85, RY + 30 + ((i * 17) % 22), 22, 12, STONE_DK);
    for (let i = 0; i < 6; i++) box(c, BASE_L + 40 + i * 230, GY - 18 - ((i * 13) % 10), 26, 18, STONE);
  }
};

const drawTemple = (c: CanvasRenderingContext2D, state: GameState) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  if (v.x > x1 || v.x + v.w < x0) return;
  const r = getRoof(state), f = state.frame;
  drawTempleBody(c, r, f);
  // The ride's line: the posts and ropes, the sign at its tail, the people in it
  box(c, LINE_R + 56, GY - 120, 6, 120, '#57534E'); box(c, LINE_R, GY - 150, 120, 34, '#1C1917');
  label(c, 'WAIT FROM HERE:', LINE_R + 60, GY - 136, '#FDE68A', 6); label(c, '95 MIN', LINE_R + 60, GY - 124, '#FDE68A', 7);
  for (let x = LINE_L; x <= LINE_R; x += 80) box(c, x, GY - 34, 4, 34, '#A16207');
  c.strokeStyle = '#B91C1C'; c.lineWidth = 2; c.beginPath(); c.moveTo(LINE_L, GY - 30); c.lineTo(LINE_R, GY - 30); c.stroke();
  GUESTS.forEach((g, i) => drawGuest(c, g, f, r.horror || r.caved, i));
  // (the way on: past the tail of the line)
  box(c, EXIT_X - 3, GY - 90, 6, 90, '#57534E'); box(c, EXIT_X - 50, GY - 112, 100, 26, '#14532D');
  label(c, 'JUNGLE TRAIL >', EXIT_X, GY - 96, '#FDE68A', 6);
  // The dust coming up out of it
  for (const d of r.dust) { c.fillStyle = `rgba(214,211,209,${Math.min(0.6, d.life / 120)})`; c.beginPath(); c.arc(d.x, d.y, d.r, 0, Math.PI * 2); c.fill(); }
  r.dust = r.dust.filter(d => { d.x += d.vx; d.y += d.vy; d.r += 0.25; return --d.life > 0; });
};

/** Down the hole and dead: a big cartoon cloud of dust mushrooming up out of it, over the roof. */
const drawPoof = (c: CanvasRenderingContext2D, r: Roof) => {
  const t = r.poof, k = Math.min(1, t / 50), fade = t < 160 ? 1 : Math.max(0, 1 - (t - 160) / 80);
  if (fade <= 0) return;
  const x = r.poofX, base = RY + 10, rise = 30 + 75 * (1 - (1 - k) * (1 - k));
  const puffs: [number, number, number][] = [
    [0, 0, 1.25], [-0.75, 0.15, 0.9], [0.75, 0.15, 0.9], [-0.4, -0.45, 0.95], [0.45, -0.45, 0.95], [0, -0.8, 1.05],
    [-1.05, 0.55, 0.6], [1.05, 0.55, 0.6], [0, 0.6, 0.85],
  ];
  const R = 20 + 24 * k;
  c.save();
  c.globalAlpha = fade;
  // (the stalk of it, up out of the hole)
  c.fillStyle = '#A8A29E'; c.fillRect(x - R * 0.45, base - rise * 0.6, R * 0.9, rise * 0.6 + 6);
  for (const [layer, col] of [[1.12, '#57534E'], [1, '#D6D3D1']] as const) {
    c.fillStyle = col;
    for (const [dx, dy, s] of puffs) {
      const wob = Math.sin(t * 0.15 + dx * 5) * 2;
      c.beginPath(); c.arc(x + dx * R * 1.3 + wob, base - rise + dy * R, R * s * layer, 0, Math.PI * 2); c.fill();
    }
  }
  // (lit on top, a few chunks still coming down out of it)
  c.fillStyle = '#F5F5F4';
  for (const [dx, dy, s] of puffs) if (dy < 0.2) { c.beginPath(); c.arc(x + dx * R * 1.3 - R * 0.25, base - rise + dy * R - R * 0.3, R * s * 0.35, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = '#78716C';
  for (let i = 0; i < 6; i++) { const a = i * 1.7; c.fillRect(Math.round(x + Math.cos(a) * R * 1.8), Math.round(base - rise + Math.sin(a) * R + (t % 40) * 1.5), 6, 5); }
  c.restore();
};

const drawRoofFront = (c: CanvasRenderingContext2D, state: GameState) => {
  const r = getRoof(state), f = state.frame;
  // Gone in the hole: the temple's front back over him (he's behind it, falling)
  if (r.inHole) {
    c.save(); c.beginPath(); c.rect(BASE_L - 10, RY + 16, BASE_R - BASE_L + 20, GY + 1400 - RY); c.rect(x0 - 600, GY, x1 - x0 + 1200, 1400); c.clip();
    drawTempleBody(c, r, f);
    c.restore();
  }
  if (r.poof) {
    drawPoof(c, r); r.poof++;
    // (what's left of him, down there in the dark, stays down there: nothing of it out over the sides of the temple)
    if (state.particles.some(q => q.pos.y > RY + 16)) state.particles = state.particles.filter(q => q.pos.y <= RY + 16);
  }
  if (r.tum) drawTumbler(c, state, r.tum);
  const a = r.artie;
  if (a.on && !a.gone) drawSafariArtie(c, a.x, a.y, 1, f, a.falling || !a.landed ? 'hurt' : r.saidBy === 'artie' ? 'angry' : 'hurt');
  const ec = r.emptyCart;
  if (ec.on) { box(c, ec.x - 36, ec.y - 36, 72, 26, '#57534E'); box(c, ec.x - 36, ec.y - 36, 72, 4, '#D6D3D1'); }
  // What's being said, over whoever's saying it
  if (r.said?.text) {
    const who = r.saidBy === 'artie' ? { x: a.x, y: a.y - 100 } : r.saidBy === 'f' ? { x: GUESTS[SPEAKER_F].x, y: GY - 90 } : r.saidBy === 'm' ? { x: GUESTS[SPEAKER_M].x, y: GY - 90 } : null;
    if (who && r.zoomK <= 0.001) saidOver(c, r.said.text, Math.min(x1 - 160, Math.max(x0 + 160, who.x)), who.y, r.saidBy === 'artie' ? '#FDE68A' : '#FFFFFF');
  }
};
