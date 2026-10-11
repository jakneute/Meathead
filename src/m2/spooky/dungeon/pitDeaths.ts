// The dungeon's pits, their own deaths for Meathead:
//   pincushion  the spike bed: flat on his back across it, the spikes up through him (out of his chest, his shoulder,
//               his butt), twitching; sliding slowly down them, the blood running; sagged at the bottom; one last kick.
//   deepfried   the vat of boiling lard: in with a hiss and a big sputtering splash; one thrash; under; then up he
//               bobs, battered, golden-brown and crispy, crumbs of breading on him; and back under, a last bubble.

import type { MeatheadDeath } from '../../../m1/game/player/deathAnim';
import { registerDeathAnim, registerDeathKind } from '../../../m1/game/player/deathAnim';
import { registerDeathDraw, body } from '../../../m1/game/render/player/deathAnim';
import { drawBloodPool } from '../../../m1/game/render/spatter';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { PARTICLE_PALETTES } from '../../../m1/constants';
import { spikeUp, BLOOD } from './paint';

type Ctx = CanvasRenderingContext2D;
export const PINCUSHION = 'own:pincushion' as const, DEEPFRIED = 'own:deepfried' as const;
const GORE = PARTICLE_PALETTES.GORE;
/** Where the spike bed / the lard's surface is (the pits keep it up to date as he goes in). */
export const pitDeath = { floor: 0 };

// ---------------------------------------------------------------------------------------------------------------
// Pincushion

const PIN_FRAMES = 170, SLIDE_AT = 50, KICK_AT = 132;
registerDeathKind('spooky_spikepit', PINCUSHION);
registerDeathAnim(PINCUSHION, {
  frames: PIN_FRAMES, airOk: true,
  tick: (ctx, d, t) => {
    const P = ctx.state.particles;
    if (t === 1) { d.floor = pitDeath.floor; playSound('crunch', 1, -6); playSound('splat', 1, -2); playSound('hurt', 0.8, -4); shakeScreen(ctx.state, 12, 6); }
    if (t < 16) for (let k = 0; k < 2; k++) P.push({ pos: { x: d.x + (Math.random() - 0.5) * 50, y: (d.floor ?? d.y) - 30 }, vel: { x: (Math.random() - 0.5) * 5, y: -2 - Math.random() * 3 }, life: 36, color: GORE[(t + k) % GORE.length], size: 3 + Math.random() * 3, grav: 0.35 });
    if (t === SLIDE_AT) playSound('squish', 0.7, -6);
    if (t > SLIDE_AT && t % 8 === 0) playSound('squish', 0.25, -2 + Math.random() * 4);
    if (t === KICK_AT) playSound('thud', 0.4, 6);
  },
});
registerDeathDraw(PINCUSHION, (c, state, d, weapon, t, f) => {
  const bed = d.floor ?? d.y, slide = Math.min(16, Math.max(0, t - SLIDE_AT) * 0.14);
  const twitch = t < SLIDE_AT ? (Math.sin(f * 2.1) > 0.6 ? 1.5 : 0) : 0;
  const lieY = bed - 38 + slide; // (his back, across the spikes)
  // (the blood down the spikes, pooling at their feet)
  drawBloodPool(c, Math.round(d.x), Math.round(bed), Math.round(12 + Math.min(34, t * 0.3)), 377);
  c.save();
  // Him, flat on his back across the spikes (feet the way he was facing), twitching
  c.translate(d.x, lieY + twitch); c.rotate(-d.facing * Math.PI / 2); c.translate(-d.x, -d.y + 32);
  // (one last kick of a leg: the whole of him jerks once)
  if (t > KICK_AT && t < KICK_AT + 8) c.translate(Math.sin((t - KICK_AT) / 8 * Math.PI) * 3, 0);
  body(c, state, d, weapon, { isGrounded: true, deathFace: t < 20 ? 'scream' : t < 110 ? 'agony' : 'dead' });
  c.restore();
  // The spikes through him: up out of his chest, his shoulder, his butt; red where they came out
  for (const [dx, h] of [[-22, 30], [-4, 38], [16, 32]] as const) {
    const x = d.x + dx * d.facing, top = lieY - h + slide * 0.3;
    spikeUp(c, x - 5, bed, 10, top);
    c.fillStyle = BLOOD[2]; c.beginPath(); c.moveTo(x - 2, top + 14); c.lineTo(x + 2, top + 14); c.lineTo(x, top); c.closePath(); c.fill();
    c.fillStyle = BLOOD[1]; c.fillRect(x - 1, top + 14, 2, Math.min(20, t * 0.3)); c.fillStyle = BLOOD[3]; c.fillRect(x - 1, top + 2, 1, 6);
  }
});

// ---------------------------------------------------------------------------------------------------------------
// Deep fried

const FRY_FRAMES = 175, PLUNGE = 14, THRASH = 40, UNDER = 62, BOB = 92, SINK = 140, BUBBLE = 158;
registerDeathKind('spooky_vat', DEEPFRIED);
registerDeathAnim(DEEPFRIED, {
  frames: FRY_FRAMES, airOk: true,
  tick: (ctx, d, t) => {
    const P = ctx.state.particles, s = d.floor ?? d.y;
    if (t === 1) { d.floor = pitDeath.floor; playSound('splash', 1, -8); playSound('ignite', 1, -6); playSound('flame', 0.6, -10); shakeScreen(ctx.state, 10, 5); }
    // (the sputter: hot fat everywhere, a hiss of steam)
    if (t < THRASH && t % 2 === 0) for (let k = 0; k < 3; k++) P.push({ pos: { x: d.x + (Math.random() - 0.5) * 50, y: s }, vel: { x: (Math.random() - 0.5) * 7, y: -2 - Math.random() * 6 }, life: 30, color: k % 2 ? '#FBBF24' : '#FDE68A', size: 2 + Math.random() * 3, grav: 0.3 });
    if (t % 6 === 0 && t < SINK) P.push({ pos: { x: d.x + (Math.random() - 0.5) * 40, y: s - 4 }, vel: { x: 0, y: -1.2 }, life: 40, color: 'rgba(226, 232, 240, 0.4)', size: 8 + Math.random() * 6 });
    if (t === PLUNGE || t === THRASH - 10) playSound('splash', 0.7, -2);
    if (t === BOB) playSound('glug', 0.7, -4);
    if (t === BUBBLE) { playSound('glug', 0.9, 6); playSound('fart', 0.3, 10); }
  },
});
let fryBuf: HTMLCanvasElement | null = null;
/** Him, battered and fried: drawn, then the batter over every bit of him (golden-brown, crumbs of breading). */
const fried = (c: Ctx, state: Parameters<typeof body>[1], d: MeatheadDeath, weapon: Parameters<typeof body>[3], x: number, feet: number, rot: number) => {
  const m = c.getTransform(), k = Math.abs(m.a) || 1, W = 160, H = 160;
  fryBuf ??= document.createElement('canvas');
  if (fryBuf.width !== Math.ceil(W * k)) { fryBuf.width = Math.ceil(W * k); fryBuf.height = Math.ceil(H * k); }
  const g = fryBuf.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, fryBuf.width, fryBuf.height);
  g.setTransform(k, 0, 0, k, (W / 2 - d.x) * k, (H - 30 - d.y) * k);
  g.translate(d.x, d.y - 32); g.rotate(rot); g.translate(-d.x, -d.y + 32);
  body(g, state, d, weapon, { isGrounded: true, deathFace: 'dead' });
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = 'rgba(180, 100, 20, 0.88)'; g.fillRect(0, 0, fryBuf.width, fryBuf.height);
  // (the breading: crumbs, light and dark)
  for (let i = 0; i < 90; i++) { g.fillStyle = i % 3 ? '#D9A443' : '#7C4A10'; g.fillRect(((i * 37) % W) * k, ((i * 53) % H) * k, 2 * k, 2 * k); }
  g.globalCompositeOperation = 'source-over';
  c.drawImage(fryBuf, x - W / 2, feet - (H - 30), W, H);
};
registerDeathDraw(DEEPFRIED, (c, state, d, weapon, t, f) => {
  const s = d.floor ?? d.y;
  // In, flailing once, and under (raw, still him; nothing of him under the lard shows)
  if (t < UNDER) {
    const sink = t < PLUNGE ? (t / PLUNGE) * 40 : t < THRASH ? 40 + Math.sin((t - PLUNGE) * 0.5) * 12 : 40 + (t - THRASH) * 2.2;
    c.save(); c.beginPath(); c.rect(d.x - 200, s - 400, 400, 400); c.clip();
    c.translate(t < THRASH ? Math.sin(f * 1.7) * 3 : 0, sink + (s - d.y));
    body(c, state, d, weapon, { isGrounded: false, vel: { x: 0, y: 4 }, deathFace: t < THRASH ? 'scream' : 'agony' });
    c.restore();
  } else if (t < BUBBLE) {
    // Up he bobs, battered and golden-brown, belly up; and back under
    const up = t < BOB ? (t - UNDER) / (BOB - UNDER) : t < SINK ? 1 : 1 - (t - SINK) / (BUBBLE - SINK);
    const feet = s + 30 - up * 34 + Math.sin(f * 0.15) * 2;
    c.save(); c.beginPath(); c.rect(d.x - 200, s - 400, 400, 400); c.clip();
    fried(c, state, d, weapon, d.x, feet, d.facing * Math.PI / 2);
    c.restore();
  }
  // (the last bubble)
  if (t >= BUBBLE - 4 && t < BUBBLE + 8) { c.strokeStyle = '#FDE68A'; c.lineWidth = 2; c.beginPath(); c.arc(d.x, s - 2, 3 + (t - BUBBLE + 4) * 0.8, Math.PI, 0); c.stroke(); }
});
