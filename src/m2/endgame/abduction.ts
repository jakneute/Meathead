// The prologue of the epilogue's end (the owner's: "when you get to your truck, the roof on the parking garage breaks
// open and an alien beam starts picking you up. we then go to a full hogged 'cutscene mode' we didn't activate since
// the intro stages"): Zorblax's wife in her standby saucer; Satan up out of the ground, grabbing it, throwing the
// truck; it lands in the lot outside the water park (the endgame's first stage: lot/).
//
// In the garage first (intro/index.ts's walk out, at his truck): he climbs back in through the window (the door's
// still stuck from the crash this morning), the place rumbles, the roof over the truck bursts (chunks down, dust), a
// pink beam down through the hole, and up the truck goes. Then the cutscene proper, the gym's way (intro/gym/scene.ts:
// the 256 x 144 pictures, endgame/shots.ts), the words in the box along the bottom (the owner's: "full cutscene mode" shows the spoken text on the bottom of the screen, not bubbles). No HUD from the first frame (introCutscene),
// no input, nobody talking over anybody; SKIP skips the lot, garage and all, to the lot with him out of the truck.

import type { GameState } from '../../m1/game/core/state';
import { shakeScreen } from '../../m1/game/core/state';
import { playSound } from '../../m1/game/platform/audio';
import { isShat, isNude } from '../../m1/game/player/gut';
import { pickLine, silenceAll } from '../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../m1/game/platform/skip';
import { CANVAS_WIDTH } from '../../m1/constants';
import { createScene, tickScene, drawScene, sfx, type Scene, type Beat } from '../intro/gym/scene';
import { R, UPPER, CEIL_Y } from '../intro/geometry';
import { pixelBlob, steppedGlow } from '../intro/art/kit';
import {
  type Dressed, SAUCER_VOICE, SATAN_VOICE, WIFE_HELLO, WIFE_STANDBY, MH_STANDBY, WIFE_ANSWER, WIFE_PLAN, SATAN_GRAB, WIFE_GRABBED, SATAN_CLAIM, MH_OWE, MH_THROWN,
} from './lines';
import { clip, resetClip, shotWife, shotCab, shotWide, shotFlight, shotCrash } from './shots';

type Ctx = CanvasRenderingContext2D;

export interface Abduction {
  /** Frames since it started (the garage part). */
  t: number;
  /** He's in the truck (the frame he got in; -1 not yet). */
  inAt: number;
  /** The cutscene proper, once it's on. */
  scene: Scene | null;
  /** Skipped (the lot opens with him already out of the truck). */
  skipped: boolean;
  dress: Dressed;
}

/** It's on (the music holds off for it: music/cues.ts). */
let on = false;
export const abductionOn = () => on;
/** How the last one ended: skipped, or played out (the lot's opening reads it: lot/index.ts). Taken once. */
let skippedLast = false;
export const takeAbductionSkipped = () => { const s = skippedLast; skippedLast = false; return s; };

const dressOf = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

export const startAbduction = (state: GameState): Abduction => {
  on = true;
  silenceAll();
  state.player.vel.x = 0;
  return { t: 0, inAt: -1, scene: null, skipped: false, dress: dressOf(state) };
};

/** Frames (after he's in the truck): the rumble starts, the roof goes, the beam's on, the truck's gone up, the cut. */
const RUMBLE = 16, BREAK = 80, BEAM = 98, LIFT_END = 250, CUT = 262;
/** How high the truck's gone up in the beam (px), for intro/index.ts truckNow. */
export const abductionLift = (a: Abduction) => {
  if (a.inAt < 0) return 0;
  const u = a.t - a.inAt;
  if (u < BEAM) return u >= RUMBLE && u < BREAK && (u >> 1) % 3 === 0 ? 1 : 0;
  const k = Math.max(0, Math.min(1, (u - BEAM) / (LIFT_END - BEAM)));
  return Math.round(k * k * 300 + Math.sin(u * 0.2) * 2);
};

const beats = (d: Dressed): Beat[] => [
  { shot: shotWife, who: 'ZARBLAX', voice: SAUCER_VOICE.id, text: pickLine(WIFE_HELLO[d]), wait: 30, enter: sfx('whirl', 0.6, -8) },
  { shot: shotWife, who: 'ZARBLAX', voice: SAUCER_VOICE.id, text: pickLine(WIFE_STANDBY[d]) },
  { shot: shotCab('dumb'), who: 'MEATHEAD', voice: 'meathead', text: pickLine(MH_STANDBY[d]), wait: 14 },
  { shot: shotWife, who: 'ZARBLAX', voice: SAUCER_VOICE.id, text: WIFE_ANSWER },
  { shot: shotWife, who: 'ZARBLAX', voice: SAUCER_VOICE.id, text: pickLine(WIFE_PLAN[d]), hold: 20 },
  // Outside: the ground splits, Satan comes up out of it
  { shot: shotWide, hold: 140, enter: () => { clip.rise = clip.t; playSound('rumble', 1, -6); playSound('roar', 0.8, -10); } },
  { shot: shotWide, who: 'SATAN', voice: SATAN_VOICE.id, text: SATAN_GRAB, enter: () => { clip.grab = clip.t; playSound('clang', 0.9, -8); playSound('crunch', 0.8, -4); } },
  { shot: shotWide, who: 'ZARBLAX', voice: SAUCER_VOICE.id, text: WIFE_GRABBED, hold: 10 },
  { shot: shotWide, who: 'SATAN', voice: SATAN_VOICE.id, text: SATAN_CLAIM, wait: 24, enter: () => { clip.catch = clip.t; playSound('thud', 0.8, -6); } },
  { shot: shotCab('dumb', true), who: 'MEATHEAD', voice: 'meathead', text: pickLine(MH_OWE[d]), wait: 10 },
  // The throw
  { shot: shotWide, hold: 60, enter: () => { clip.throw = clip.t; playSound('whoosh', 1, -6); playSound('screams', 0.5, 8); } },
  { shot: shotFlight, who: 'MEATHEAD', voice: 'meathead', text: pickLine(MH_THROWN[d]), wait: 10, hold: 20, enter: sfx('whoosh', 0.7, -2) },
  { shot: shotCrash, hold: 90, enter: () => { setTimeout(() => { playSound('crash', 1); playSound('crunch', 1, -6); playSound('glass', 0.8); }, 430); } },
];

/** A frame of it (the walk out's update, at the truck): `windowX` where the cab's window is (where he climbs in). True:
 *  over (played out or skipped), off to the lot. */
export const tickAbduction = (state: GameState, a: Abduction, windowX: number): boolean => {
  const p = state.player;
  a.t++;
  p.inCutscene = true;
  // The cutscene proper
  if (a.scene) {
    clip.t++;
    if (tickScene(a.scene)) { a.skipped = a.scene.skipped; return finish(a); }
    return false;
  }
  if (a.t > SKIP_AFTER) offerSkip();
  if (a.t > SKIP_AFTER && takeSkip()) { silenceAll(); a.skipped = true; return finish(a); }
  // (in through the window: walked to it, a hop up, gone in)
  if (a.inAt < 0) {
    const px = p.pos.x + p.width / 2;
    if (Math.abs(px - windowX) > 3 && a.t < 120) { p.facing = px > windowX ? -1 : 1; p.pos.x += Math.sign(windowX - px) * Math.min(3, Math.abs(windowX - px)); return false; }
    if (!p.hidden) { p.vel.y = -5; p.facing = 1; playSound('jump', 0.7); }
    if (a.t > 6) { p.hidden = true; p.vel.x = 0; a.inAt = a.t; playSound('thud', 0.6, -4); }
    return false;
  }
  p.hidden = true; p.vel.x = 0; p.vel.y = 0;
  const u = a.t - a.inAt;
  if (u === RUMBLE) playSound('rumble', 0.9, -8);
  if (u > RUMBLE && u < BREAK && u % 12 === 0) shakeScreen(state, 3, 6);
  if (u === BREAK) { playSound('crash', 1); playSound('crunch', 1, -8); playSound('boom', 0.6, -10); shakeScreen(state, 14, 14); }
  if (u === BEAM || u === BEAM + 60 || u === BEAM + 120) playSound('whirl', 0.7, -10);
  if (u === CUT) { resetClip(a.dress); a.scene = createScene(beats(a.dress)); }
  return false;
};

const finish = (a: Abduction) => { on = false; skippedLast = a.skipped; return true; };

// ---------------------------------------------------------------------------------------------------------------
// In the garage: the roof over the truck bursting, the bits coming down, the beam (world space, in front)

/** The hole: its jagged outline across the ceiling over the truck. */
const HOLE: [number, number][] = [[120, CEIL_Y], [138, CEIL_Y - 30], [130, CEIL_Y - 80], [160, -20], [300, -20], [318, CEIL_Y - 70], [304, CEIL_Y - 24], [330, CEIL_Y]];
export const drawAbductionFront = (c: Ctx, state: GameState, a: Abduction) => {
  if (a.inAt < 0 || a.scene) { if (a.inAt < 0 && a.t > SKIP_AFTER) skipPrompt(c, state); return; }
  const u = a.t - a.inAt, f = state.frame;
  // (before it goes: dust sifting down off the ceiling over the truck, more and more)
  if (u > RUMBLE && u < BREAK + 20) for (let k = 0; k < 8; k++) {
    const age = (f * 2 + k * 13) % 60, x = R(130 + ((k * 37) % 190)), y = CEIL_Y + age * 2;
    if (y < UPPER) pixelBlob(c, x, y, 2, 2, `rgba(170, 166, 160, ${(0.6 * (1 - age / 60)).toFixed(2)})`);
  }
  if (u >= BREAK) {
    // The hole: the night through it, the saucer's underside over it, its lights going round
    c.save();
    c.beginPath(); c.moveTo(R(HOLE[0][0]), HOLE[0][1]); for (const [x, y] of HOLE.slice(1)) c.lineTo(R(x), y); c.closePath();
    c.fillStyle = '#0A0E24'; c.fill();
    c.clip();
    c.fillStyle = '#2A2238'; c.beginPath(); c.ellipse(R(225), 20, 120, 34, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#3A3050'; c.beginPath(); c.ellipse(R(225), 14, 110, 22, 0, 0, Math.PI * 2); c.fill();
    for (let i = 0; i < 10; i++) { const lit = (i + (f >> 2)) % 4 === 0; c.fillStyle = lit ? '#FF9AE6' : '#9A3A80'; c.fillRect(R(130 + i * 20), 46, 8, 4); }
    c.fillStyle = '#FDE68A'; c.beginPath(); c.ellipse(R(225), 52, 40, 8, 0, 0, Math.PI * 2); c.fill();
    c.restore();
    // (its broken edge: rebar, the slab's cut face)
    c.strokeStyle = '#1A1A20'; c.lineWidth = 3; c.beginPath(); c.moveTo(R(HOLE[0][0]), HOLE[0][1]); for (const [x, y] of HOLE.slice(1)) c.lineTo(R(x), y); c.stroke();
    for (let k = 0; k < 7; k++) { c.fillStyle = '#8A3A1A'; c.fillRect(R(140 + k * 26), CEIL_Y - 6 - (k % 3) * 8, 2, 14); }
    // The chunks of it, down onto the floor round the truck (the same each time: worked out from the frame)
    const T = u - BREAK;
    for (let k = 0; k < 16; k++) {
      const x0 = R(130 + ((k * 53) % 190)), vy0 = (k % 4) * 0.6, g = 0.4, land = (-vy0 + Math.sqrt(vy0 * vy0 + 2 * g * (UPPER - 6 - CEIL_Y))) / g;
      const tt = Math.min(T, land), y = CEIL_Y + vy0 * tt + 0.5 * g * tt * tt, x = x0 + (k % 2 ? 1 : -1) * tt * 0.4;
      const s = 4 + (k % 3) * 3;
      c.fillStyle = '#1A1A20'; c.fillRect(Math.round(x - 1), Math.round(y - 1), s + 2, s + 1);
      c.fillStyle = k % 3 ? '#6A6A72' : '#8A8A92'; c.fillRect(Math.round(x), Math.round(y), s, s - 1);
    }
    // (the dust it threw up)
    if (T < 90) for (let k = 0; k < 6; k++) pixelBlob(c, R(140 + k * 34), UPPER - 10 - T * 0.3, 14 + T * 0.3, 8 + T * 0.1, `rgba(180, 176, 170, ${(0.45 * (1 - T / 90)).toFixed(2)})`);
  }
  // The beam: down from the saucer through the hole onto the truck, pink, in steps, sparkles rising up it
  if (u >= BEAM) {
    const k = Math.min(1, (u - BEAM) / 10);
    const cols = ['rgba(255, 120, 220, 0.14)', 'rgba(255, 160, 235, 0.18)', 'rgba(255, 220, 250, 0.22)'];
    c.save(); c.globalAlpha = k;
    for (let i = 0; i < 3; i++) {
      const w0 = 70 - i * 18, w1 = 120 - i * 26;
      c.fillStyle = cols[i]; c.beginPath(); c.moveTo(R(225) - w0, 0); c.lineTo(R(225) + w0, 0); c.lineTo(R(225) + w1, UPPER); c.lineTo(R(225) - w1, UPPER); c.closePath(); c.fill();
    }
    for (let i = 0; i < 24; i++) { const v = ((f * 0.01 + i * 0.137) % 1), y = UPPER - v * UPPER; c.fillStyle = i % 3 ? '#FFD6F4' : '#FFFFFF'; c.fillRect(Math.round(R(225) + Math.sin(i * 2.3) * (60 + v * 40)), Math.round(y), 2, 2); }
    steppedGlow(c, R(225), UPPER - 4, 90, '#FF9AE6', 0.18, 0.02, 4);
    c.restore();
  }
  if (a.t > SKIP_AFTER) skipPrompt(c, state);
};
const skipPrompt = (c: Ctx, state: GameState) => { c.save(); c.translate(state.camera.x, state.camera.y); drawSkipPrompt(c, CANVAS_WIDTH); c.restore(); };

/** Over the whole screen, the cutscene proper (the intro's drawHud). */
export const drawAbductionHud = (c: Ctx, a: Abduction) => { if (a.scene) drawScene(c, a.scene); };
