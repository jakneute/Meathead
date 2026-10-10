// Drained to a husk: Meathead's death when Donnie's drain is what kills him (and the guests', drawn the same way for
// whoever Donnie sucks dry). He goes gray and thin as the last of it's pulled out of him, shrivels down on himself
// (his skin sucked in tight on his bones, the eyes sunk), and drops, a dried-out husk that crumples where it lands and
// puffs out a little cloud of dust. Then the flies.

import type { WeaponType } from '../../../m1/types';
import { registerDeathKind, registerDeathAnim, type MeatheadDeath } from '../../../m1/game/player/deathAnim';
import { registerDeathDraw, body as drawMeatheadBody } from '../../../m1/game/render/player/deathAnim';
import { playSound } from '../../../m1/game/platform/audio';

type Ctx = CanvasRenderingContext2D;

export const DRAIN = 'm2:donnie_drain';
const HUSK = 'own:husk' as const;
/** How long it plays: shriveling, the drop, lying there. */
const SHRIVEL = 60, DROP = 80, LEN = 170;

registerDeathAnim(HUSK, {
  frames: LEN, airOk: true,
  tick: (_ctx, _d, t) => {
    if (t === 2) playSound('suck', 0.8, -4);
    if (t === 30) playSound('crumble', 0.6, 2);
    if (t === DROP) { playSound('thud', 0.6, 6); playSound('crumble', 0.9, -2); }
  },
});
registerDeathKind(DRAIN, HUSK);

/** A husk: a dried, gray-brown shrivel of a person lying on the floor (feet at x, y; `w` how big; facing). */
export const drawHusk = (c: Ctx, x: number, y: number, facing: number, w = 1, crumpled = 1) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(facing < 0 ? -w : w, w);
  const k = crumpled;
  // (lying in a heap: legs bent, the body a crumple, the head, its jaw hanging, the arms like sticks)
  const ink = '#1A0B06', hide = '#8A7A62', dark = '#5E4E3A', lit = '#B5A585';
  c.fillStyle = ink;
  c.beginPath(); c.ellipse(0, -7 * k - 2, 26, 7 * k + 3, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = hide; c.beginPath(); c.ellipse(0, -7 * k - 2, 24.5, 6 * k + 2.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = dark; for (let i = 0; i < 5; i++) c.fillRect(-14 + i * 6, -9 * k - 2, 1, 6 * k + 2);
  c.fillStyle = lit; c.fillRect(-18, -11 * k - 2, 20, 1.5);
  // (the head: a skull with skin on, sunk eyes, the mouth open)
  c.fillStyle = ink; c.beginPath(); c.arc(25, -9 * k - 2, 8, 0, Math.PI * 2); c.fill();
  c.fillStyle = hide; c.beginPath(); c.arc(25, -9 * k - 2, 7, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#2A1E14'; c.fillRect(25, -12 * k - 2, 3, 3); c.fillRect(21, -12 * k - 2, 2.5, 2.5); c.fillRect(25, -6 * k - 2, 4, 3);
  c.fillStyle = '#E7DCC0'; c.fillRect(25, -6 * k - 2, 4, 1);
  // (an arm, a stick, the fingers curled)
  c.strokeStyle = ink; c.lineWidth = 4; c.beginPath(); c.moveTo(8, -10 * k - 2); c.lineTo(16, -18 * k - 4); c.lineTo(22, -20 * k - 6); c.stroke();
  c.strokeStyle = hide; c.lineWidth = 2.4; c.stroke();
  // (the legs, folded)
  c.strokeStyle = ink; c.lineWidth = 5; c.beginPath(); c.moveTo(-20, -4); c.lineTo(-30, -14 * k - 2); c.lineTo(-38, -2); c.stroke();
  c.strokeStyle = hide; c.lineWidth = 3.2; c.stroke();
  c.restore();
};

registerDeathDraw(HUSK, (c, state, d: MeatheadDeath, weapon: WeaponType, t, f) => {
  const k = Math.min(1, t / SHRIVEL);
  if (t < DROP) {
    // Shriveling: him, thinner and thinner (squeezed in across), shaking, gray coming over him; then the husk in his place
    const shake = t < SHRIVEL ? Math.sin(t * 1.9) * (1 + k * 2) : 0;
    c.save();
    c.translate(d.x + shake, d.y);
    c.scale(1 - 0.45 * k, 1 - 0.12 * k);
    c.translate(-d.x, -d.y);
    c.globalAlpha = 1 - Math.max(0, (t - SHRIVEL + 10) / 20);
    drawMeatheadBody(c, state, d, weapon, { deathFace: 'agony' });
    c.restore();
    // (the gray coming over him, stepped, from the top down)
    const p = state.player, top = d.y - p.height;
    c.fillStyle = 'rgba(120, 104, 80, 0.55)';
    for (let i = 0; i < 6; i++) if (k > i / 6) c.fillRect(Math.round(d.x - p.width * 0.5 * (1 - 0.45 * k)), Math.round(top + i * (p.height / 6)), Math.round(p.width * (1 - 0.45 * k)), Math.ceil(p.height / 6));
    // (the last of him going out of him: red wisps up and away)
    if (t < SHRIVEL) for (let i = 0; i < 4; i++) { const u = ((t * 2 + i * 13) % 40) / 40; c.fillStyle = `rgba(220, 38, 38, ${(0.7 * (1 - u)).toFixed(2)})`; c.fillRect(Math.round(d.x - 6 + i * 4 + Math.sin(u * 6 + i) * 4), Math.round(top + 10 - u * 50), 2, 3); }
    if (t >= SHRIVEL - 10) { c.save(); c.globalAlpha = Math.min(1, (t - SHRIVEL + 10) / 20); c.translate(d.x, d.y); c.rotate(-d.facing * (Math.PI / 2) * 0.9 * Math.min(1, (t - SHRIVEL) / 20)); drawHusk(c, 0, 0, d.facing, 0.9, 1.6); c.restore(); }
    return;
  }
  // Down: the husk on the floor, a puff of dust off it as it lands; the flies
  drawHusk(c, d.x, d.y, d.facing, 0.9, 1);
  const u = t - DROP;
  if (u < 30) for (let i = 0; i < 5; i++) { c.fillStyle = `rgba(180, 160, 130, ${(0.5 * (1 - u / 30)).toFixed(2)})`; c.beginPath(); c.arc(d.x - 30 + i * 15, d.y - 4 - u * 0.5, 4 + u * 0.4, 0, Math.PI * 2); c.fill(); }
  for (let i = 0; i < 3; i++) { const a = f * 0.17 + i * 2.1; c.fillStyle = '#111'; c.fillRect(Math.round(d.x + Math.cos(a) * 14), Math.round(d.y - 14 + Math.sin(a * 1.3) * 6), 2, 2); }
});
