// Toxic Tommy's sprite: the city's water quality inspector, who drank it on live TV and now lives in the
// pipes. Bloated and green, his yellow hazmat suit split at the seams and patched with duct tape and
// foil tape, the hood hanging off his back, his inspector's badge still on its lanyard, a glass tank of
// sludge on his back. Drawn in the boss's local space (0,0 = his top-left corner), in an 80x80 box.

import { Enemy } from '../../../types';
import { FaceStyle, Mood, drawHead, facingOf, goreOf, moodOf, limb, hand, foil, bodyBlood, breath } from './kit';

const SKIN = '#9DB58A', SKIN_DARK = '#6E8A5E';
const FACE: FaceStyle = {
  skin: SKIN, shadow: SKIN_DARK, highlight: '#C5D8B4', brow: '#3F4A2E', iris: '#A3A322',
  jaw: 'jowly', age: 0.3, bags: '#4D6B3A', lips: '#5B7A48', stubble: '#3F4A2E',
};
const SUIT = '#EAB308', SUIT_DARK = '#A16207';

export const drawTommy = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const { width, height } = e;
  const isSubmerged = e.bossState === 'submerged_chase' || e.bossState === 'telegraph_emerge' || e.bossState === 'dive_in_sludge';
  const isPuking = e.bossState === 'puke_closing_in' || e.bossState === 'puke_going_outward';
  const isWeaknessStunned = e.bossState === 'weakness_stunned';
  const isExhausted = e.bossState === 'vulnerable_idle' || isWeaknessStunned;

  if (isSubmerged) {
    // Under the sludge: his body dim through the muck, wrapped in a pulsating filth shield
    // (faded, not filtered: a canvas filter on him every frame is expensive; the shield tints him green anyway)
    ctx.save();
    ctx.globalAlpha = 0.6;
    drawTommyBody(ctx, e, frame, 'fierce', false);
    ctx.restore();
    drawFilthShield(ctx, width, height, frame);
    return;
  }

  // Sludge geyser under him while he's up out of it
  if (isPuking || e.bossState === 'emerge_shatter' || isExhausted) {
    ctx.save();
    ctx.fillStyle = '#27AE60';
    ctx.beginPath();
    ctx.moveTo(width * 0.15, height); ctx.lineTo(width * 0.85, height); ctx.lineTo(width * 0.95, height + 80); ctx.lineTo(width * 0.05, height + 80);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2ECC71';
    ctx.beginPath(); ctx.ellipse(width / 2, height + 10, width * 0.4, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  ctx.save();
  const mood = isExhausted ? 'ko' : moodOf(e, frame, { puke_closing_in: 'roar', puke_going_outward: 'roar', emerge_shatter: 'manic' });
  drawTommyBody(ctx, e, frame, mood, isPuking);
  ctx.restore();

  // Knocked out: stars going round
  if (isExhausted) {
    for (let i = 0; i < 3; i++) {
      const angle = frame * 0.08 + i * ((Math.PI * 2) / 3);
      ctx.fillStyle = '#FFFF00';
      ctx.beginPath(); ctx.arc(Math.cos(angle) * 35 + width / 2, Math.sin(angle * 0.6) * 10 - 15, 4, 0, Math.PI * 2); ctx.fill();
    }
  }
  if (e.isOiled || isWeaknessStunned) {
    // Crude running down him
    ctx.fillStyle = '#111111';
    ctx.fillRect(width * 0.35, height * 0.3, 6, 25);
    ctx.fillRect(width * 0.55, height * 0.35, 8, 30);
    ctx.fillRect(width * 0.72, height * 0.4, 5, 20);
    ctx.fillStyle = '#222222';
    ctx.beginPath(); ctx.arc(width * 0.5, height * 0.6, 12, 0, Math.PI * 2); ctx.fill();
  }
};

/** Knocked out, he flashes: a yellow glow round the whole of him, on and off. */
export const tommyFx = (e: Enemy, frame: number) =>
  (e.bossState === 'vulnerable_idle' || e.bossState === 'weakness_stunned') && Math.sin(frame * 0.3) > 0 ? { shadowColor: '#FFFF00', shadowBlur: 15 } : null;

/** Tommy himself (in an 80x80 box). */
const drawTommyBody = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number, mood: Mood, puking: boolean) => {
  const dir = (e.pukeDir || facingOf(e)) > 0 ? 1 : -1;
  const gore = goreOf(e);
  const b = breath(frame, 0.06);
  const heave = puking ? Math.sin(frame * 0.6) * 3 : 0;
  ctx.save();
  ctx.scale(e.width / 80, e.height / 80);

  // The tank on his back: glass, sludge sloshing in it
  const tx = dir > 0 ? 8 : 58;
  ctx.fillStyle = '#6B7280'; ctx.beginPath(); ctx.roundRect(tx, 24, 14, 32, 4); ctx.fill();
  ctx.fillStyle = 'rgba(46, 204, 113, 0.5)'; ctx.fillRect(tx + 2, 27, 10, 26);
  const slosh = Math.sin(frame * 0.1) * 3;
  ctx.fillStyle = '#ADFF2F'; ctx.fillRect(tx + 2, 38 + slosh, 10, 15 - slosh);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; ctx.fillRect(tx + 3, 28, 1.5, 22);
  ctx.fillStyle = '#374151'; ctx.fillRect(tx + 1, 22, 12, 3); ctx.fillRect(tx + 1, 55, 12, 3);
  if (frame % 14 < 7) { ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(tx + 6, 45 + slosh, 1.2, 0, Math.PI * 2); ctx.fill(); }

  // Legs: suit legs, rubber boots
  for (const x of [29, 51]) {
    ctx.fillStyle = SUIT; ctx.fillRect(x - 8, 60, 16, 12);
    ctx.fillStyle = SUIT_DARK; ctx.fillRect(x - 8, 60, 3, 12);
    ctx.fillStyle = '#14532D'; ctx.beginPath(); ctx.roundRect(x - 8.5, 70, 17, 10, [2, 2, 1, 1]); ctx.fill();
    ctx.fillStyle = '#0F3D22'; ctx.fillRect(x - 8.5, 78.4, 17, 1.6);
  }

  ctx.save(); ctx.translate(0, -b);
  // The suit round the belly, split open down the front with him bulging out of it
  ctx.fillStyle = SUIT;
  ctx.beginPath(); ctx.ellipse(40 + heave * 0.5, 50, 26, 19, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = SUIT_DARK; ctx.beginPath(); ctx.ellipse(33, 52, 16, 15, 0, Math.PI * 0.5, Math.PI * 1.4); ctx.fill();
  // His gut through the split
  ctx.fillStyle = SKIN;
  ctx.beginPath(); ctx.ellipse(42 + heave, 51, 11, 13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = SKIN_DARK; ctx.beginPath(); ctx.arc(43 + heave, 56, 1.3, 0, Math.PI * 2); ctx.fill(); // navel
  // Boils and toxic veins on it
  ctx.fillStyle = '#ADFF2F';
  for (const [x, y, r] of [[37, 46, 2.2], [47, 53, 2.8], [40, 60, 1.8]] as const) { ctx.beginPath(); ctx.arc(x + heave, y, r, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(46.5 + heave, 51.5, 1, 1);
  ctx.strokeStyle = '#4D7C0F'; ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(35 + heave, 55); ctx.lineTo(38 + heave, 52); ctx.lineTo(37 + heave, 49); ctx.stroke();
  // Torn edges of the split
  ctx.fillStyle = SUIT;
  for (let y = 40; y < 64; y += 4) { ctx.beginPath(); ctx.moveTo(31 + heave * 0.5, y); ctx.lineTo(34 + heave, y + 2); ctx.lineTo(31 + heave * 0.5, y + 4); ctx.fill(); }
  // Patches: grey duct tape, and foil tape
  ctx.fillStyle = '#9CA3AF'; ctx.save(); ctx.translate(55, 44); ctx.rotate(0.4); ctx.fillRect(-5, -1.8, 10, 3.6); ctx.restore();
  foil(ctx, [19, 48, 25, 46, 27, 52, 21, 54], frame, 3);
  foil(ctx, [50, 62, 57, 60, 58, 64, 51, 66], frame, 6);
  // Inspector's badge on its lanyard
  ctx.strokeStyle = '#1D4ED8'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(33, 33); ctx.lineTo(28, 43); ctx.lineTo(24, 33); ctx.stroke();
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(25, 42, 6, 8);
  ctx.fillStyle = '#1D4ED8'; ctx.fillRect(25, 42, 6, 2);
  ctx.fillStyle = '#9DB58A'; ctx.fillRect(26, 45, 2.4, 3);
  ctx.fillStyle = '#6B7280'; ctx.fillRect(29, 45, 1.5, 0.6); ctx.fillRect(29, 46.5, 1.5, 0.6);
  bodyBlood(ctx, gore, [[48, 47, 3.5], [23, 57, 3], [38, 57, 3], [56, 55, 2.5], [44, 42, 2.5], [30, 62, 2.5]], frame);

  // Arms: bloated, gloves gone, a hand on his gut while he heaves
  for (const side of [-1, 1]) {
    const sx = 40 + side * 21, sy = 38;
    const clutch = puking && side === -dir;
    const ex = sx + side * 5, ey = sy + 9;
    const hx = clutch ? 44 : sx + side * 4, hy = clutch ? 50 : sy + 18 + Math.sin(frame * 0.07 + side) * 1.5;
    limb(ctx, sx, sy, ex, ey, 9, SUIT, SUIT_DARK);
    limb(ctx, ex, ey, hx, hy, 8, SKIN, SKIN_DARK);
    ctx.fillStyle = SUIT_DARK; ctx.fillRect(ex - 3.5, ey - 1, 7, 2); // ragged cuff
    hand(ctx, hx, hy, 4.2, SKIN, SKIN_DARK);
  }
  // The hood, hanging off his back behind the neck
  ctx.fillStyle = SUIT_DARK; ctx.beginPath(); ctx.ellipse(40 - dir * 6, 33, 13, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(186, 230, 253, 0.6)'; ctx.fillRect(34 - dir * 6, 31, 12, 3);

  // Head: leaning out toward whoever he's puking on
  const hx0 = puking ? 40 + dir * 14 : 40 + dir * 2, hy0 = puking ? 16 : 18;
  drawHead(ctx, { x: hx0, y: hy0, s: 1.4, f: dir as 1 | -1, wx: e.pos.x + hx0 * (e.width / 80) }, FACE, mood, frame, gore, {
    hair: () => {
      // Thin, greasy, plastered down
      ctx.fillStyle = '#3F4A2E';
      ctx.beginPath(); ctx.moveTo(-11.5, -5); ctx.quadraticCurveTo(-11, -14.5, 0, -14); ctx.quadraticCurveTo(9, -14, 10.5, -10); ctx.lineTo(4, -11.5); ctx.lineTo(-2, -10.5); ctx.lineTo(-8, -9); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#56633F'; ctx.fillRect(-6, -13, 7, 0.7);
      // Boils on his face
      ctx.fillStyle = '#ADFF2F';
      ctx.beginPath(); ctx.arc(-7, 3, 1.3, 0, Math.PI * 2); ctx.arc(8, -8, 1, 0, Math.PI * 2); ctx.fill();
      if (mood !== 'roar' && mood !== 'ko') {
        // Green drool
        const d = (frame % 50) / 50;
        ctx.fillStyle = '#ADFF2F'; ctx.fillRect(4.5, 6.5, 1, 2 + d * 6);
      }
    },
  });
  // The puke itself, coming up out of him in a thick stream
  if (puking) {
    ctx.save();
    ctx.translate(hx0 + dir * 1, hy0 + 8);
    ctx.fillStyle = '#2ECC71'; ctx.beginPath(); ctx.ellipse(dir * 6, 3, 8, 5, dir * 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ADFF2F';
    for (let i = 0; i < 4; i++) {
      const t = ((frame * 0.25 + i * 0.25) % 1);
      ctx.beginPath(); ctx.arc(dir * (4 + t * 16), 2 + t * t * 10, 4.5 - t * 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();
  ctx.restore();
};

/** The filth shield round him under the sludge: a pulsating biohazard barrier with filth orbiting it. */
const drawFilthShield = (ctx: CanvasRenderingContext2D, width: number, height: number, frame: number) => {
  ctx.save();
  const pulse = Math.sin(frame * 0.12) * 6;
  const rx = width * 0.62 + pulse, ry = height * 0.55 + pulse * 0.6;
  const cx = width * 0.5, cy = height * 0.5;
  const grad = ctx.createRadialGradient(cx, cy, width * 0.2, cx, cy, rx + 12);
  grad.addColorStop(0, 'rgba(39, 174, 96, 0.1)');
  grad.addColorStop(0.5, 'rgba(46, 204, 113, 0.35)');
  grad.addColorStop(0.85, 'rgba(173, 255, 47, 0.6)');
  grad.addColorStop(1, 'rgba(173, 255, 47, 0.0)');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx + 10, ry + 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2ECC71'; ctx.lineWidth = 3.5; ctx.shadowColor = '#ADFF2F'; ctx.shadowBlur = 14;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#ADFF2F'; ctx.lineWidth = 2; ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx - 8, ry - 6, 0, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const a = frame * 0.05 + i * ((Math.PI * 2) / 6);
    ctx.fillStyle = i % 2 === 0 ? '#196F3D' : '#85929E';
    ctx.beginPath(); ctx.arc(cx + Math.cos(a) * (rx - 2), cy + Math.sin(a) * (ry - 2), 4 + (i % 3) * 2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ADFF2F'; ctx.lineWidth = 1; ctx.stroke();
  }
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1.5; ctx.shadowColor = '#ADFF2F'; ctx.shadowBlur = 6;
  for (let k = 0; k < 3; k++) {
    const a = (frame * 0.08 + k * 2.1) % (Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (rx - 6), cy + Math.sin(a) * (ry - 4));
    ctx.lineTo(cx + Math.cos(a + 0.3) * (rx + 4), cy + Math.sin(a + 0.3) * (ry + 3));
    ctx.lineTo(cx + Math.cos(a + 0.6) * (rx - 6), cy + Math.sin(a + 0.6) * (ry - 4));
    ctx.stroke();
  }
  ctx.restore();
};
