// Skewered (the dungeon's spiked ceiling): it comes down on him, the spikes go in through the top of him, crushing him
// down under it, a spurt; then the ceiling grinds back up, and his head goes with it, stuck on the spikes, torn off at
// the neck: the rest of him left crumpled on the floor, the stump pumping, a leg kicking and then not; the head up
// there, dribbling. Undignified.

import type { MeatheadDeath } from '../../../m1/game/player/deathAnim';
import { registerDeathAnim, registerDeathKind } from '../../../m1/game/player/deathAnim';
import { registerDeathDraw, body } from '../../../m1/game/render/player/deathAnim';
import { drawBloodPool } from '../../../m1/game/render/spatter';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { PARTICLE_PALETTES } from '../../../m1/constants';
import { BLOOD } from './paint';

export const SKEWERED = 'own:skewered' as const;
export const SKEWER_FRAMES = 160, SKEWER_LIFT = 42;
/** How far the ceiling's gone back up, t frames into it. */
export const skewerRise = (t: number) => Math.min(300, Math.max(0, t - SKEWER_LIFT) * 1.7);
/** Where the spikes' tips were as it got him (the dungeon keeps it up to date). */
export const skewer = { tip: 0 };

const GORE = PARTICLE_PALETTES.GORE;

registerDeathKind('spooky_ceiling', SKEWERED);
registerDeathAnim(SKEWERED, {
  frames: SKEWER_FRAMES, airOk: true,
  tick: (ctx, d, t) => {
    const P = ctx.state.particles;
    if (t === 1) { playSound('crunch', 1, -4); playSound('splat', 1, -2); shakeScreen(ctx.state, 14, 7); }
    if (t === 1) d.floor = skewer.tip;
    if (t < 14) for (let k = 0; k < 3; k++) P.push({ pos: { x: d.x + (Math.random() - 0.5) * 30, y: (d.floor ?? d.y) + 10 }, vel: { x: (Math.random() - 0.5) * 7, y: -1 - Math.random() * 3 }, life: 40, color: GORE[(t + k) % GORE.length], size: 3 + Math.random() * 4, grav: 0.35 });
    if (t === SKEWER_LIFT) playSound('rumble', 0.8, -6);
    // (the head torn off going up: a pop, then the stump on the floor pumping, and the head up there dribbling)
    if (t === SKEWER_LIFT + 4) { playSound('gorespray', 1); playSound('crunch', 0.8, 4); }
    if (t > SKEWER_LIFT + 4) {
      const nk = neckY(d), pump = Math.max(0, 1 - (t - SKEWER_LIFT) / 90);
      if (t % 2 === 0 && Math.random() < 0.3 + pump) P.push({ pos: { x: d.x + (Math.random() - 0.5) * 6, y: nk }, vel: { x: (Math.random() - 0.5) * 2.5, y: -2 - Math.random() * 5 * pump }, life: 40, color: GORE[t % GORE.length], size: 2 + Math.random() * 3, grav: 0.35 });
      if (t % 4 === 0) P.push({ pos: { x: d.x + (Math.random() - 0.5) * 8, y: nk - skewerRise(t) + 2 }, vel: { x: 0, y: 1.5 }, life: 60, color: GORE[t % GORE.length], size: 2 + Math.random() * 2, grav: 0.3 });
    }
  },
});
/** How squashed he is (1 his full height): crumpled under the spikes (and he stays that way, on the floor). */
/** (his top this far up past the spikes' tips: they're in his head) */
const SPIKED_IN = 16;
const crush = (d: MeatheadDeath) => Math.max(0.35, Math.min(1, (d.y - (d.floor ?? d.y - 64) + SPIKED_IN) / 64));
/** Where his neck is, crumpled: the line his head's torn off at (the top this much of his height). */
const NECK = 0.27;
const neckY = (d: MeatheadDeath) => d.y - 64 * crush(d) * (1 - NECK);

registerDeathDraw(SKEWERED, (ctx, state, d, weapon, t) => {
  const c = crush(d), rise = skewerRise(t), torn = t > SKEWER_LIFT + 4, nk = neckY(d);
  // (the pool where he was, spreading as the stump pumps)
  drawBloodPool(ctx, Math.round(d.x), Math.round(d.y) + 1, Math.round(10 + Math.min(44, t * 0.5)), 913);
  // Him, crumpled under it (squashed down onto his feet); his head part of him till it goes, then going up with the
  // spikes, the rest left there
  const kick = torn && t < SKEWER_LIFT + 60 && ((t >> 2) & 1);
  const draw = () => body(ctx, state, d, weapon, { isGrounded: true, vel: { x: kick ? 3 : 0, y: 0 }, deathFace: t < 10 ? 'scream' : t < 50 ? 'agony' : 'dead' });
  const squash = () => { ctx.translate(d.x, d.y); ctx.scale(1 + (1 - c) * 0.5, c); ctx.translate(-d.x, -d.y); };
  // (the body: below the neck once it's torn, all of it before)
  ctx.save();
  if (torn) { ctx.beginPath(); ctx.rect(d.x - 80, nk, 160, 200); ctx.clip(); }
  squash(); draw();
  ctx.restore();
  // (the stump: a ragged red ring at the neck)
  if (torn) { ctx.fillStyle = BLOOD[1]; ctx.beginPath(); ctx.ellipse(d.x, nk + 1, 9, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = BLOOD[3]; ctx.fillRect(d.x - 4, nk, 8, 1); }
  // (the head, up on the spikes: torn off at the neck, a ragged stringy edge under it, a sway as it goes)
  if (torn) {
    const sway = Math.sin((t - SKEWER_LIFT) * 0.12) * 0.1 * Math.max(0.2, 1 - (t - SKEWER_LIFT) / 120);
    ctx.save();
    ctx.translate(0, -rise);
    ctx.translate(d.x, nk); ctx.rotate(sway); ctx.translate(-d.x, -nk);
    ctx.beginPath(); ctx.rect(d.x - 80, nk - 200, 160, 200); ctx.clip();
    squash(); draw();
    ctx.restore();
    ctx.fillStyle = BLOOD[2]; for (let k = -2; k <= 2; k++) ctx.fillRect(d.x + k * 4 - 1, nk - rise, 3, 3 + ((k + 7) * 5 + (t >> 3)) % 5);
  }
  // (the ceiling's own spikes are in the top of his head: the blood running down off them over his face)
  const tipY = (d.floor ?? d.y - 64) - rise;
  ctx.fillStyle = BLOOD[2];
  for (const dx of [-10, -2, 7]) ctx.fillRect(Math.round(d.x + dx), Math.round(tipY), 2, 4 + ((dx + 20 + (t >> 2)) % 7));
});
