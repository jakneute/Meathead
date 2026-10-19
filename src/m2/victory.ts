// VICTORY, Meathead 2's way (every boss, whichever way he died): Meathead 1's yellow letters, but not spelled out
// politely one at a time. Each one comes at the screen from the front (huge, out of the camera, tumbling), and slams
// down onto it at size: a stamp. The hit's hard: the screen jumps, a thud under it, ink spattered out round the letter,
// the letter squashed flat a moment on impact and springing back. V, I, C, T, O, R, Y, one after another; then it holds.
//
// Screen space. The caller ticks it each game frame (startVictory, tickVictory) and draws it over everything
// (drawVictory); `victoryDone` once it's all down and held.

import type { GameState } from '../m1/game/core/state';
import { shakeScreen } from '../m1/game/core/state';
import { playSound } from '../m1/game/platform/audio';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../m1/constants';
import { musicMoment } from './music/moments';

type Ctx = CanvasRenderingContext2D;

const WORD = 'VICTORY';
/** Frames between letters; each one's flight in; the squash after the stamp; the hold, all of them down. */
const GAP = 11, FLY = 9, SQUASH = 7, HOLD = 100;
/** The size it lands at (Meathead 1's), and the size it comes in from. */
const SIZE = 54, FROM = 9;
/** How far apart the letters land (their middles: the middle of the screen, across). */
const STEP = 62;

interface Splat { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number }
export interface Victory { t: number; splats: Splat[]; stamped: number }

export const startVictory = (): Victory => ({ t: 0, splats: [], stamped: 0 });
/** All of it down, and held a while. */
export const victoryDone = (v: Victory) => v.t > (WORD.length - 1) * GAP + FLY + HOLD;

const landX = (i: number) => CANVAS_WIDTH / 2 + (i - (WORD.length - 1) / 2) * STEP;
const LAND_Y = CANVAS_HEIGHT / 2;

/** A frame: the next letter's stamp when it lands (the jolt, the thud, the ink), the ink flying and drying. */
export const tickVictory = (state: GameState, v: Victory) => {
  musicMoment('victory');
  v.t++;
  for (let i = v.stamped; i < WORD.length; i++) {
    if (v.t < i * GAP + FLY) break;
    v.stamped = i + 1;
    const last = i === WORD.length - 1;
    shakeScreen(state, last ? 18 : 10, last ? 9 : 5);
    playSound('slam', last ? 1 : 0.8, -4 - i * 0.6); playSound('thud', 0.9, -8); if (last) playSound('boom', 0.7, -6);
    // (ink spattered out round it)
    const n = last ? 22 : 12;
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2, sp = 3 + Math.random() * (last ? 9 : 6);
      v.splats.push({ x: landX(i), y: LAND_Y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.7, r: 2 + Math.random() * 4, life: 0, max: 26 + Math.random() * 20 });
    }
  }
  v.splats = v.splats.filter(s => { s.life++; s.x += s.vx; s.y += s.vy; s.vx *= 0.82; s.vy *= 0.82; return s.life < s.max; });
};

export const drawVictory = (c: Ctx, v: Victory) => {
  c.save();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  // The ink (under the letters)
  for (const s of v.splats) {
    c.globalAlpha = Math.min(1, 1.6 * (1 - s.life / s.max));
    c.fillStyle = '#111'; c.beginPath(); c.arc(s.x, s.y, s.r, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#CA8A04'; c.beginPath(); c.arc(s.x - 0.5, s.y - 0.5, s.r * 0.55, 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
  for (let i = 0; i < WORD.length; i++) {
    const u = v.t - i * GAP;
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
    c.globalAlpha = alpha;
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
