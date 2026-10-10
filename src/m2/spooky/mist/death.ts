// Liquefied (the red mist): it gets him, and he stops dead, shaking; his organs come out through his skin (inside out:
// guts, lungs, a heart going like mad, all of it on the outside of him), swelling; then he slumps, and runs, down into a
// spreading brown puddle of liquid shit, bubbling; his boots left standing in it, and one last bubble (a fart). Up in
// the air, he falls as a splash and makes the puddle where he lands.

import type { MeatheadDeath } from '../../../m1/game/player/deathAnim';
import { registerDeathAnim, registerDeathKind } from '../../../m1/game/player/deathAnim';
import { registerDeathDraw, body } from '../../../m1/game/render/player/deathAnim';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';

type Ctx = CanvasRenderingContext2D;
export const LIQUEFIED = 'own:liquefied' as const;
const FRAMES = 175, TURN = 14, SWELL = 50, MELT = 66, MELT_LEN = 34, DROP_G = 0.7;

registerDeathKind('spooky_mist', LIQUEFIED);
/** (up in the air) when he lands, frames in. */
const landAt = (d: MeatheadDeath) => (d.floor !== undefined && d.floor > d.y + 2 ? Math.max(4, Math.round(Math.sqrt((2 * (d.floor - d.y)) / DROP_G))) : 0);
const feetAt = (d: MeatheadDeath, t: number) => Math.min(d.floor ?? d.y, d.y + 0.5 * DROP_G * t * t);

registerDeathAnim(LIQUEFIED, {
  frames: FRAMES, airOk: true,
  tick: (ctx, d, t) => {
    const { state } = ctx, P = state.particles;
    if (t === 1) { d.floor = floorTopAt(state.blocks, d.x, d.y, 0) ?? d.y; playSound('hurt', 1, -6); playSound('squish', 1, -4); shakeScreen(state, 6, 3); }
    const k = landAt(d);
    if (k) {
      // (up in the air: he goes in a splash, down to the floor)
      if (t === k) { playSound('splat', 1, -6); playSound('gush', 1, -2); shakeScreen(state, 8, 4); for (let i = 0; i < 24; i++) P.push({ pos: { x: d.x, y: d.floor! - 4 }, vel: { x: (Math.random() - 0.5) * 9, y: -2 - Math.random() * 5 }, life: 40, color: ['#5B3A1A', '#7C4A1E', '#B91C1C'][i % 3], size: 3 + Math.random() * 4, grav: 0.4 }); }
    } else {
      if (t === TURN) { playSound('gush', 1, -4); playSound('squish', 1, -8); }
      if (t > TURN && t < MELT && t % 7 === 0) playSound('squish', 0.5, Math.random() * 6 - 3);
      if (t === MELT) { playSound('gush', 1, -8); playSound('glug', 0.8, -6); }
      if (t > TURN && t < MELT + MELT_LEN && t % 3 === 0) P.push({ pos: { x: d.x + (Math.random() - 0.5) * 30, y: d.y - 10 - Math.random() * 40 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 30, color: ['#B91C1C', '#F9A8D4', '#7C4A1E'][t % 3], size: 2 + Math.random() * 3, grav: 0.3 });
    }
    if (t === FRAMES - 30) { playSound('fart', 0.9, -4); playSound('glug', 0.6, 4); }
    if (t > MELT && t % 11 === 0) playSound('glug', 0.25, 8 + Math.random() * 6);
  },
});

/** A loop of gut, hung off him at (x, y), `len` long, swinging. */
const loop = (c: Ctx, x: number, y: number, len: number, sway: number, col: string) => {
  c.strokeStyle = '#4A0420'; c.lineWidth = 6; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + sway, y + len, x + sway * 0.4 + 8, y + 2); c.stroke();
  c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + sway, y + len, x + sway * 0.4 + 8, y + 2); c.stroke();
};
/** The puddle: brown, spreading, bubbling; his boots standing in it. */
const puddle = (c: Ctx, x: number, y: number, r: number, t: number, boots: boolean) => {
  c.fillStyle = '#3A2410'; c.beginPath(); c.ellipse(x, y, r + 3, 5 + r * 0.09, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#6B4219'; c.beginPath(); c.ellipse(x, y - 1, r, 3.5 + r * 0.08, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#8A5A26'; c.beginPath(); c.ellipse(x - r * 0.3, y - 2, r * 0.4, 1.6, 0, 0, Math.PI * 2); c.fill();
  // (bits in it: a red one, a pink one)
  c.fillStyle = '#991B1B'; c.fillRect(x + r * 0.3, y - 3, 5, 3); c.fillStyle = '#F9A8D4'; c.fillRect(x - r * 0.5, y - 2, 4, 2);
  if (boots) for (const bx of [-9, 4]) { c.fillStyle = '#1C1917'; c.fillRect(x + bx, y - 12, 8, 12); c.fillRect(x + bx - 1, y - 3, 11, 4); c.fillStyle = '#44403C'; c.fillRect(x + bx + 1, y - 12, 2, 8); }
  // (the bubbles)
  for (let k = 0; k < 3; k++) { const ph = (t + k * 17) % 40; if (ph < 14) { const bx = x + Math.sin(k * 2.3 + Math.floor((t + k * 17) / 40)) * r * 0.6; c.strokeStyle = '#A0703A'; c.lineWidth = 1; c.beginPath(); c.arc(bx, y - 2, 1 + ph * 0.25, Math.PI, 0); c.stroke(); } }
};

registerDeathDraw(LIQUEFIED, (c, state, d, weapon, t, f) => {
  const k = landAt(d);
  if (k) {
    // Up in the air: a falling splash of him (no him left), then the puddle where it landed
    if (t < k) {
      const y = feetAt(d, t);
      c.fillStyle = '#7C4A1E'; c.beginPath(); c.ellipse(d.x, y - 30, 14, 26, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#B91C1C'; c.beginPath(); c.ellipse(d.x + 3, y - 36, 7, 10, 0, 0, Math.PI * 2); c.fill();
      return;
    }
    puddle(c, d.x, d.floor ?? d.y, Math.min(46, 10 + (t - k) * 1.2), t, true);
    return;
  }
  const { x, y } = d;
  const melt = Math.max(0, Math.min(1, (t - MELT) / MELT_LEN));
  const r = 6 + melt * 34 + Math.max(0, t - MELT - MELT_LEN) * 0.15;
  if (t >= MELT) puddle(c, x, y, r, t, melt >= 0.85);
  if (melt >= 1) return;
  // Him: shaking, swelling; going down into the puddle
  const shake = t < MELT ? Math.sin(f * 2.1) * (t < TURN ? 1 : 2) : 0;
  const swell = t < TURN ? 1 : 1 + Math.min(1, (t - TURN) / (SWELL - TURN)) * 0.14;
  c.save();
  c.translate(x + shake, y); c.scale(swell * (1 + melt * 1.4), swell * (1 - melt)); c.translate(-x, -y);
  if (t < TURN) body(c, state, d, weapon, { deathFace: 'shock' });
  else {
    // Inside out: no him to see, just what was in him, on the outside, in his shape
    const inside = Math.min(1, (t - TURN) / 10);
    if (inside < 1) body(c, state, d, weapon, { deathFace: 'agony' });
    c.globalAlpha = inside;
    const top = y - 64;
    // (the body of it: raw red, in his shape, the ribs showing)
    c.fillStyle = '#8B1A1A'; c.beginPath(); c.ellipse(x, top + 12, 11, 12, 0, 0, Math.PI * 2); c.fill();
    c.fillRect(x - 15, top + 22, 30, 26); c.fillRect(x - 13, top + 46, 10, 18); c.fillRect(x + 3, top + 46, 10, 18);
    c.fillStyle = '#E8D9C8'; for (let i = 0; i < 4; i++) c.fillRect(x - 12, top + 26 + i * 5, 24, 2);
    // (the eyes: still in, looking about, very wide)
    c.fillStyle = '#FFFFFF'; c.fillRect(x - 7, top + 8, 5, 5); c.fillRect(x + 2, top + 8, 5, 5);
    c.fillStyle = '#111111'; c.fillRect(x - 5 + Math.round(Math.sin(f * 0.3)), top + 10, 2, 2); c.fillRect(x + 4 + Math.round(Math.sin(f * 0.3)), top + 10, 2, 2);
    // (lungs, the heart going like mad)
    c.fillStyle = '#F472B6'; c.beginPath(); c.ellipse(x - 8, top + 30, 6, 9, 0.2, 0, Math.PI * 2); c.ellipse(x + 8, top + 30, 6, 9, -0.2, 0, Math.PI * 2); c.fill();
    const beat = (f >> 2) % 2 ? 6 : 4.5;
    c.fillStyle = '#DC2626'; c.beginPath(); c.arc(x + 1, top + 34, beat, 0, Math.PI * 2); c.fill();
    // (the guts, hanging off the outside of him in loops)
    const sway = Math.sin(f * 0.15) * 6;
    loop(c, x - 10, top + 42, 18, sway - 6, '#E86A9A'); loop(c, x + 2, top + 44, 24, sway, '#F9A8D4'); loop(c, x + 9, top + 40, 14, sway + 6, '#E86A9A');
    // (going brown from the feet up as he goes)
    if (t > SWELL) { c.fillStyle = '#6B4219'; const h = Math.min(64, (t - SWELL) * 3); c.fillRect(x - 16, y - h, 32, h); }
    c.globalAlpha = 1;
  }
  c.restore();
});
