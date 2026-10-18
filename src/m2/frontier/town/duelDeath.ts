// Too slow on the DRAW (the showdown's duel, the user's: "too early and you die in one hit. special death animation as a
// hole goes through your face"): the sheriff's one shot goes in at his face and out the back of his head (the spray
// out behind him), leaving a hole clean through it with the sky showing through. He stands there a beat, swaying, the
// hole smoking, blood running down out of it to his chin; then over he goes backward, stiff as a board, flat in the
// street (a thud, the dust), the pool spreading under his head, and a tumbleweed rolls by. Undignified.

import type { MeatheadDeath } from '../../../m1/game/player/deathAnim';
import { registerDeathAnim, registerDeathKind } from '../../../m1/game/player/deathAnim';
import { registerDeathDraw, body } from '../../../m1/game/render/player/deathAnim';
import { drawBloodPool } from '../../../m1/game/render/spatter';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { PARTICLE_PALETTES } from '../../../m1/constants';

export const FACEHOLE = 'own:fr_facehole' as const;
const FRAMES = 175, STAND = 72, OVER = 24, DOWN = STAND + OVER, WEED = 108;
const GORE = PARTICLE_PALETTES.GORE;

/** Which way it went through him (out the back of his head: away from where he faced). */
const outward = (d: MeatheadDeath) => -d.facing as 1 | -1;
/** How far over he's gone (0 up, 1 flat), t frames in. */
const over = (t: number) => { const k = Math.max(0, Math.min(1, (t - STAND) / OVER)); return k * k; };
/** Where the hole is on him, stood up (his face: a little in front of his head's middle). */
const holeAt = (d: MeatheadDeath) => ({ x: d.x + d.facing * 4, y: d.y - 53 });
/** The sway while he stands there (radians, about his feet: his head snapped back, then rocking). */
const sway = (d: MeatheadDeath, t: number) => (t < 6 ? (t / 6) * 0.14 : 0.14 * Math.max(0, 1 - (t - 6) / 30) + Math.sin(t * 0.18) * 0.025) * outward(d);

registerDeathKind('m2:fr_duel', FACEHOLE);
registerDeathAnim(FACEHOLE, {
  frames: FRAMES,
  tick: (ctx, d, t) => {
    const P = ctx.state.particles, out = outward(d), h = holeAt(d);
    if (t === 1) {
      // (in at the face, out the back of his head: blood, bits of skull, brains, a spray the way it went)
      playSound('splat', 1, 2); playSound('crunch', 0.9, 6); shakeScreen(ctx.state, 9, 4);
      for (let i = 0; i < 30; i++) {
        const a = (out > 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 1.1, sp = 3 + Math.random() * 8;
        P.push({ pos: { x: h.x - d.facing * 8, y: h.y }, vel: { x: Math.cos(a) * sp, y: Math.sin(a) * sp - 1.5 }, life: 40 + Math.random() * 40, color: ['#B91C1C', '#7F1D1D', '#F9A8D4', '#F5F5F4', '#DC2626'][i % 5], size: 2 + Math.random() * 3, grav: 0.3 });
      }
    }
    // (the hole smoking while he stands there; a drip off it)
    if (t > 4 && t < STAND && t % 7 === 0) P.push({ pos: { x: h.x, y: h.y - 2 }, vel: { x: (Math.random() - 0.5) * 0.4, y: -0.8 }, life: 34, color: 'rgba(231, 229, 228, 0.55)', size: 3 + Math.random() * 2 });
    if (t > 10 && t < STAND && t % 9 === 0) P.push({ pos: { x: h.x + (Math.random() - 0.5) * 3, y: h.y + 6 }, vel: { x: 0, y: 1 }, life: 24, color: GORE[t % GORE.length], size: 2, grav: 0.3 });
    if (t === STAND) playSound('whoosh', 0.4, -10);
    if (t === DOWN) {
      // (flat on his back in the street: the thud, the dust)
      playSound('thud', 1, -6); shakeScreen(ctx.state, 5, 3);
      for (let i = 0; i < 14; i++) P.push({ pos: { x: d.x + out * (10 + Math.random() * 50), y: d.y - 2 }, vel: { x: (Math.random() - 0.5) * 3, y: -0.5 - Math.random() * 1.5 }, life: 30, color: i % 2 ? '#C8A878' : '#A8885A', size: 3 + Math.random() * 3 });
    }
    if (t === WEED + 10) playSound('whoosh', 0.3, 8);
  },
});

registerDeathDraw(FACEHOLE, (c, state, d, weapon, t, f) => {
  const out = outward(d), k = over(t);
  const ang = k > 0 ? k * (Math.PI / 2) * out : sway(d, t);
  // (the pool under his head once he's down, spreading)
  if (t > DOWN) drawBloodPool(c, Math.round(d.x + out * 52), Math.round(d.y) + 1, Math.round(6 + Math.min(30, (t - DOWN) * 0.4)), 4417);
  c.save();
  c.translate(d.x, d.y); c.rotate(ang); c.translate(-d.x, -d.y);
  body(c, state, d, weapon, { isGrounded: true, deathFace: t < 30 ? 'shock' : 'dead' });
  // ---- the hole, clean through: an ink ring, a raw red rim, the sky through it (a wisp of cloud going by)
  const h = holeAt(d), r = 5;
  c.fillStyle = '#1C1209'; c.beginPath(); c.arc(h.x, h.y, r + 2, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#991B1B'; c.beginPath(); c.arc(h.x, h.y, r + 1, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#9CCBEA'; c.beginPath(); c.arc(h.x, h.y, r - 0.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#C8E4F6'; c.fillRect(Math.round(h.x - r + 1), Math.round(h.y - 2), r, 1);
  c.save(); c.beginPath(); c.arc(h.x, h.y, r - 0.5, 0, Math.PI * 2); c.clip();
  c.fillStyle = '#F5F5F4'; c.fillRect(Math.round(h.x - r + ((f * 0.2) % (r * 2 + 6)) - 3), Math.round(h.y + 1), 4, 2);
  c.restore();
  // (the blood run down out of it to his chin, longer as he stands there)
  const run = Math.min(14, Math.max(0, t - 4) * 0.25);
  c.fillStyle = '#B91C1C';
  c.fillRect(Math.round(h.x - 2), Math.round(h.y + r), 2, Math.round(run)); c.fillRect(Math.round(h.x + 1), Math.round(h.y + r), 1, Math.round(run * 0.6));
  // (the exit wound at the back of his head: ragged)
  c.fillStyle = '#7F1D1D'; c.fillRect(Math.round(h.x - d.facing * 11 - 2), Math.round(h.y - 4), 4, 8);
  c.restore();
  // ---- a tumbleweed rolls by (from the way he faced, across behind where he lies)
  if (t > WEED) {
    const s = t - WEED, wx = d.x + d.facing * 300 - d.facing * s * 4.2, bounce = Math.abs(Math.sin(s * 0.16)) * 14, wy = d.y - 14 - bounce;
    c.save(); c.translate(wx, wy); c.rotate(-d.facing * s * 0.2);
    c.strokeStyle = '#8A6A3A'; c.lineWidth = 1.5;
    for (let i = 0; i < 9; i++) { const a = i * 0.7; c.beginPath(); c.ellipse(0, 0, 13, 7 + (i % 3) * 2, a, 0, Math.PI * 2); c.stroke(); }
    c.strokeStyle = '#B8935A'; c.lineWidth = 1;
    for (let i = 0; i < 5; i++) { const a = i * 1.3; c.beginPath(); c.moveTo(Math.cos(a) * 4, Math.sin(a) * 4); c.lineTo(Math.cos(a) * 12, Math.sin(a) * 11); c.stroke(); }
    c.restore();
  }
});
