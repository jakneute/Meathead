// Skewered (the dungeon's spiked ceiling): it comes down on him, the spikes go in through the top of him (crumpled
// under it if it's come all the way down), a spurt; then the ceiling grinds back up, and him with it, hung off the
// spikes by his head, his legs kicking and then not, a dribble off his boots; one boot drops off. Undignified.

import type { MeatheadDeath } from '../../../m1/game/player/deathAnim';
import { registerDeathAnim, registerDeathKind } from '../../../m1/game/player/deathAnim';
import { registerDeathDraw, body } from '../../../m1/game/render/player/deathAnim';
import { drawBloodPool } from '../../../m1/game/render/spatter';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { PARTICLE_PALETTES } from '../../../m1/constants';

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
    // (hung off the spikes going up: a dribble off him)
    if (t > SKEWER_LIFT && t % 3 === 0) {
      const feet = hungFeet(d, t);
      P.push({ pos: { x: d.x + (Math.random() - 0.5) * 10, y: feet }, vel: { x: 0, y: 2 }, life: 50, color: GORE[t % GORE.length], size: 2 + Math.random() * 2, grav: 0.3 });
    }
    if (t === 104) { playSound('thud', 0.6, 4); P.push({ pos: { x: d.x - d.facing * 6, y: hungFeet(d, t) }, vel: { x: -d.facing * 0.5, y: 0 }, life: 200, color: '#3B2416', size: 9, grav: 0.4, chunk: true } as never); }
  },
});
/** (hung) His feet, t frames in: under his head on the spikes, going up with them. */
const hungFeet = (d: MeatheadDeath, t: number) => (d.floor ?? d.y - 64) - skewerRise(t) + 64 * stretch(d, t);
/** How squashed he is (1 his full height): crumpled under the spikes, then let down to hang at full length. */
const crush = (d: MeatheadDeath) => Math.max(0.35, Math.min(1, (d.y - (d.floor ?? d.y - 64)) / 64));
const stretch = (d: MeatheadDeath, t: number) => { const c = crush(d); return t < SKEWER_LIFT ? c : c + (1 - c) * Math.min(1, (t - SKEWER_LIFT) / 14); };

registerDeathDraw(SKEWERED, (ctx, state, d, weapon, t) => {
  const tip = d.floor ?? d.y - 64, rise = skewerRise(t), s = stretch(d, t);
  const head = tip - rise, feet = head + 64 * s;
  // (the pool where he was)
  drawBloodPool(ctx, Math.round(d.x), Math.round(d.y) + 1, Math.round(10 + Math.min(30, t * 0.4)), 913);
  ctx.save();
  // (hanging: a sway, legs kicking a moment, then still)
  const sway = t > SKEWER_LIFT ? Math.sin((t - SKEWER_LIFT) * 0.12) * 0.12 * Math.max(0.2, 1 - (t - SKEWER_LIFT) / 120) : 0;
  ctx.translate(d.x, head); ctx.rotate(sway); ctx.translate(-d.x, -head);
  ctx.translate(0, feet - d.y);
  ctx.translate(d.x, d.y); ctx.scale(1 + (1 - s) * 0.5, s); ctx.translate(-d.x, -d.y);
  const kick = t > SKEWER_LIFT && t < SKEWER_LIFT + 50 && ((t >> 2) & 1);
  body(ctx, state, d, weapon, { isGrounded: !(t > SKEWER_LIFT), vel: { x: kick ? 3 : 0, y: t > SKEWER_LIFT ? 2 : 0 }, deathFace: t < 10 ? 'scream' : t < 70 ? 'agony' : 'dead' });
  ctx.restore();
  // The spikes through the top of him (three of them, in to the shoulders), red where they went in
  for (const dx of [-12, 0, 12]) {
    const x = d.x + dx + Math.sin(sway) * 20, len = dx === 0 ? 26 : 18;
    ctx.fillStyle = '#A1A1AA'; ctx.beginPath(); ctx.moveTo(x - 4, head - 30); ctx.lineTo(x + 4, head - 30); ctx.lineTo(x, head + len); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#991B1B'; ctx.beginPath(); ctx.moveTo(x - 2, head + len - 12); ctx.lineTo(x + 2, head + len - 12); ctx.lineTo(x, head + len); ctx.closePath(); ctx.fill();
  }
});
