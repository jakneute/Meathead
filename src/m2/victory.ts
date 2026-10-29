// VICTORY, Meathead 2's way (every boss, whichever way he died): Meathead 1's yellow letters, but not spelled out
// politely one at a time. Each one comes at the screen from the front (huge, out of the camera, tumbling), and slams
// down onto it at size: a stamp. The hit's hard: the screen jumps, a thud under it, ink spattered out round the letter,
// the letter squashed flat a moment on impact and springing back. V, I, C, T, O, R, Y, one after another, all seven
// the same (the same gap, the same stamp: the user's); then it holds, and they all fade together over the jingle's
// last beat, gone the moment it ends.
//
// Screen space. The caller ticks it each game frame (startVictory, tickVictory) and draws it over everything
// (drawVictory); `victoryDone` once the jingle's over and the letters gone.

import type { GameState } from '../m1/game/core/state';
import { shakeScreen } from '../m1/game/core/state';
import { playSound } from '../m1/game/platform/audio';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../m1/constants';
import { musicMoment } from './music/moments';
import { VICTORY_JINGLE } from './music/songs/jingles';

type Ctx = CanvasRenderingContext2D;

const WORD = 'VICTORY';
/** Each letter's flight in; the squash after the stamp. */
const FLY = 9, SQUASH = 7;
// Timed to the jingle itself (songs/jingles.ts), read from its tempo and length: it starts with the VICTORY, its
// first bar plays out before a letter's down (the lead-in), then a letter stamps on each eighth, V to Y, evenly. The
// letters hold till the jingle's last beat, fade through it, and are gone as it ends.
/** Frames: the jingle's first note after the VICTORY starts (the cue's poll, the player's tenth of a second). */
const LAT = 9;
/** Beats of lead-in before the V (the jingle's first bar). */
const LEAD_BEATS = 4;
/** Frames a beat lasts (60 a second). */
const BEAT = 3600 / VICTORY_JINGLE.bpm;
/** Frames between letters: an eighth, whole (so every gap's the same). */
const GAP = Math.round(BEAT / 2);
/** When each letter starts its flight in (frames after the VICTORY starts): it lands on its eighth. */
const startOf = (i: number) => LAT + Math.round(LEAD_BEATS * BEAT) + i * GAP - FLY;
/** Frames: the jingle's end (its last note's), and the fade over its last beat. */
const END = LAT + Math.round((VICTORY_JINGLE.length ?? 13) * BEAT), FADE = Math.round(BEAT);
/** How much of the letters is left (1 till the jingle's last beat, 0 at its end). */
const shown = (t: number) => Math.max(0, Math.min(1, (END - t) / FADE));
/** The size it lands at (Meathead 1's), and the size it comes in from. */
const SIZE = 54, FROM = 9;
/** How far apart the letters land (their middles: the middle of the screen, across). */
const STEP = 62;

interface Splat { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number }
export interface Victory { t: number; splats: Splat[]; stamped: number }

export const startVictory = (): Victory => ({ t: 0, splats: [], stamped: 0 });
/** The jingle over and the letters gone. */
export const victoryDone = (v: Victory) => v.t >= END;

const landX = (i: number) => CANVAS_WIDTH / 2 + (i - (WORD.length - 1) / 2) * STEP;
const LAND_Y = CANVAS_HEIGHT / 2;

/** A frame: the next letter's stamp when it lands (the jolt, the thud, the ink), the ink flying and drying. */
/** The frame it was last ticked, and whether it was still up: the shell keeps pause, the map and the wheel off it. */
let tickedAt = -99, up = false;
/** VICTORY on screen right now (ticked this frame or the last): no pause, no map, no weapon wheel (the user's). */
export const victoryOn = (frame: number) => up && frame - tickedAt <= 2;
export const tickVictory = (state: GameState, v: Victory) => {
  musicMoment('victory');
  v.t++;
  tickedAt = state.frame; up = !victoryDone(v);
  for (let i = v.stamped; i < WORD.length; i++) {
    if (v.t < startOf(i) + FLY) break;
    v.stamped = i + 1;
    // (every letter's stamp the same)
    shakeScreen(state, 10, 5);
    playSound('slam', 0.8, -4); playSound('thud', 0.9, -8);
    // (ink spattered out round it)
    for (let k = 0; k < 12; k++) {
      const a = Math.random() * Math.PI * 2, sp = 3 + Math.random() * 6;
      v.splats.push({ x: landX(i), y: LAND_Y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.7, r: 2 + Math.random() * 4, life: 0, max: 26 + Math.random() * 20 });
    }
  }
  v.splats = v.splats.filter(s => { s.life++; s.x += s.vx; s.y += s.vy; s.vx *= 0.82; s.vy *= 0.82; return s.life < s.max; });
};

export const drawVictory = (c: Ctx, v: Victory) => {
  const fade = shown(v.t);
  if (fade <= 0) return;
  c.save();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  // The ink (under the letters)
  for (const s of v.splats) {
    c.globalAlpha = Math.min(1, 1.6 * (1 - s.life / s.max)) * fade;
    c.fillStyle = '#111'; c.beginPath(); c.arc(s.x, s.y, s.r, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#CA8A04'; c.beginPath(); c.arc(s.x - 0.5, s.y - 0.5, s.r * 0.55, 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
  for (let i = 0; i < WORD.length; i++) {
    const u = v.t - startOf(i);
    if (u < 0) break;
    let sc: number, sx = 1, sy = 1, rot = 0, alpha = 1;
    if (u < FLY) {
      // (coming at the screen from the front: huge, see-through, turning, accelerating down onto it)
      const k = u / FLY;
      sc = FROM + (1 - FROM) * k * k;
      rot = (1 - k) * (i % 2 ? 0.35 : -0.35);
      alpha = 0.25 + 0.75 * k;
    } else {
      sc = 1;
      // (stamped: squashed flat, then springing back, a little over)
      const k = (u - FLY) / SQUASH;
      if (k < 1) { const q = Math.sin(k * Math.PI) * (1 - k * 0.4); sx = 1 + 0.32 * q; sy = 1 - 0.3 * q + (k > 0.6 ? 0.06 * Math.sin((k - 0.6) * Math.PI * 2.5) : 0); }
    }
    c.save();
    c.globalAlpha = alpha * fade;
    c.translate(landX(i), LAND_Y);
    c.rotate(rot); c.scale(sc * sx, sc * sy);
    c.font = `bold ${SIZE}px "Press Start 2P"`;
    // (its shadow, knocked down onto the screen; the outline; the letter)
    if (u >= FLY) { c.fillStyle = 'rgba(0, 0, 0, 0.55)'; c.fillText(WORD[i], 5, 6); }
    c.lineJoin = 'round'; c.strokeStyle = '#000'; c.lineWidth = 7 / Math.max(1, sc * 0.6);
    c.strokeText(WORD[i], 0, 0);
    c.fillStyle = u >= FLY && u < FLY + 3 ? '#FFFFFF' : '#FACC15';
    c.fillText(WORD[i], 0, 0);
    // (a lit band across its top, the old way)
    if (u >= FLY + 3) { c.save(); c.beginPath(); c.rect(-SIZE, -SIZE / 2, SIZE * 2, SIZE * 0.42); c.clip(); c.fillStyle = '#FEF08A'; c.fillText(WORD[i], 0, 0); c.restore(); }
    c.restore();
  }
  c.restore();
};
