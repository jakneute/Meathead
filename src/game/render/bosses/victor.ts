// Victor Volcano's sprite: geothermal evangelist, nightclub owner, hot yoga, eleven years on the
// juice. Bronzed and enormous, a black silk shirt printed with flames hanging open over lava-crack
// tattoos, a glowing lava-lamp pendant on a gold chain, white linen yoga pants, sandals, a man bun and
// a sweatband, and foil wrapped round both wrists to keep him "grounded". Steam comes off his shoulders.
// Drawn in the boss's local space (0,0 = his top-left corner), in an 80x80 box.

import { Enemy } from '../../../types';
import { FaceStyle, drawHead, headAt, facingOf, goreOf, moodOf, limb, hand, foil, bodyBlood, breath } from './kit';
import { victorHeadTurn } from '../../bosses/victor';

const SKIN = '#C8743F', SKIN_DARK = '#9A5228', SKIN_LIGHT = '#E6A06B';
const FACE: FaceStyle = {
  skin: SKIN, shadow: SKIN_DARK, highlight: SKIN_LIGHT, brow: '#1C1917', iris: '#92400E',
  jaw: 'square', stubble: '#3F1D0B', bags: '#7C3A14', lips: '#7A3515',
};

export const drawVictor = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  // (breathing fire, he faces the way he's aiming it, and his head turns with it)
  const turn = victorHeadTurn(e);
  const f = turn ? turn.f : facingOf(e);
  const gore = goreOf(e);
  const tele = e.bossState === 'attacking' || e.bossState === 'telegraphing';
  const lOff = tele ? Math.sin(frame * 0.5) * 3 : 0;
  const pain = e.bossState === 'pain' && e.health > 0 ? e.painKind : undefined;
  // (choking: each cough a heave, his head jerking forward with it, mouth wide; between them, eyes bulging)
  const choke = pain === 'doused';
  const heave = choke ? Math.max(0, ((e.stateTimer ?? 0) % 24) - 17) / 6 : 0;
  const mood = choke ? (heave > 0 ? 'roar' : 'shock') : pain === 'scalded' ? 'hurt' : moodOf(e, frame, { barfing: 'roar', attacking: 'fierce', telegraphing: 'fierce', jumping: 'fierce' });
  const b = breath(frame) + lOff * 0.5;
  ctx.save();
  ctx.scale(e.width / 80, e.height / 80);
  // (scalded: hopping from foot to foot, shaking; doused: doubled over, sagging, coughing)
  if (pain === 'scalded') ctx.translate(Math.sin(frame * 1.3) * 1.5, -Math.abs(Math.sin(frame * 0.45)) * 7);
  if (pain === 'doused') { ctx.translate(40, 80); ctx.rotate(0.12 * f + heave * 0.12 * f + Math.sin(frame * 0.5) * 0.03); ctx.scale(1, 0.94); ctx.translate(-40, -80 + 2 + heave * 2); }

  // Sandals and bare feet
  for (const x of [29, 51]) {
    ctx.fillStyle = SKIN;
    ctx.beginPath(); ctx.roundRect(x - 8 + f * 2, 74, 16, 5, [3, 3, 1, 1]); ctx.fill();
    ctx.fillStyle = SKIN_DARK;
    for (let i = 0; i < 4; i++) ctx.fillRect(x + f * 6 - f * i * 2.2, 74.5, 0.6, 2);
    ctx.fillStyle = '#5B3A1A'; ctx.fillRect(x - 8 + f * 2, 78.5, 16, 1.5);
    ctx.fillStyle = '#7C4A21'; ctx.fillRect(x - 5 + f * 2, 75, 10, 1.4);
  }
  // White linen yoga pants: loose, creased
  ctx.fillStyle = '#F5F0E6';
  ctx.beginPath(); ctx.moveTo(19, 55); ctx.lineTo(61, 55); ctx.lineTo(62, 75); ctx.lineTo(42, 75); ctx.lineTo(40, 63); ctx.lineTo(38, 75); ctx.lineTo(18, 75); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#D6CFC0';
  ctx.fillRect(19, 55, 3, 20); ctx.fillRect(27, 60, 0.7, 12); ctx.fillRect(52, 61, 0.7, 11); ctx.fillRect(39.6, 56, 0.8, 7);
  ctx.fillStyle = '#E7DFD0'; ctx.fillRect(19, 55, 42, 2.5); // drawstring waist
  ctx.fillStyle = '#B45309'; ctx.fillRect(41, 57, 0.8, 5); ctx.fillRect(43, 57, 0.8, 4);

  ctx.save(); ctx.translate(0, -b);
  // The torso: bare, carved, bronzed
  ctx.fillStyle = SKIN;
  ctx.beginPath(); ctx.moveTo(18, 34); ctx.lineTo(62, 34); ctx.lineTo(58, 56); ctx.lineTo(22, 56); ctx.closePath(); ctx.fill();
  ctx.fillStyle = SKIN_DARK;
  ctx.fillRect(18, 35, 3, 20);
  // Pecs and abs
  ctx.beginPath(); ctx.moveTo(25, 45); ctx.quadraticCurveTo(32, 48, 39, 44); ctx.lineTo(39, 45.2); ctx.quadraticCurveTo(32, 49.4, 25, 46.2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(41, 44); ctx.quadraticCurveTo(48, 48, 55, 45); ctx.lineTo(55, 46.2); ctx.quadraticCurveTo(48, 49.4, 41, 45.2); ctx.fill();
  ctx.fillRect(39.5, 44, 1, 12);
  for (const y of [49.5, 52.5]) { ctx.fillRect(34, y, 5, 0.8); ctx.fillRect(41, y, 5, 0.8); }
  ctx.fillStyle = SKIN_LIGHT;
  ctx.fillRect(29, 39, 7, 1); ctx.fillRect(44, 39, 7, 1); ctx.fillRect(35, 47, 3, 0.8); ctx.fillRect(42, 47, 3, 0.8);
  // Lava-crack tattoos across the chest, glowing, brighter as he winds up
  // (put out, or steamed: gone cold and grey)
  const glow = pain ? 0.9 : tele ? 1 : 0.55 + Math.sin(frame * 0.2) * 0.25;
  ctx.save();
  ctx.shadowColor = pain ? 'transparent' : '#FF5722'; ctx.shadowBlur = pain ? 0 : tele ? 8 : 4;
  ctx.strokeStyle = pain ? 'rgba(87, 83, 78, 0.9)' : `rgba(255, 138, 0, ${glow})`; ctx.lineWidth = 1.1; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(24, 38); ctx.lineTo(28, 41); ctx.lineTo(27, 44); ctx.moveTo(28, 41); ctx.lineTo(33, 40);
  ctx.moveTo(56, 38); ctx.lineTo(52, 41); ctx.lineTo(53, 44); ctx.moveTo(52, 41); ctx.lineTo(47, 40); ctx.stroke();
  ctx.restore();

  // Black silk shirt hanging open, flames up from the hem
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? 16 : 64, x1 = side < 0 ? 27 : 53;
    ctx.fillStyle = '#111114';
    ctx.beginPath(); ctx.moveTo(x0, 33); ctx.lineTo(x1, 33); ctx.lineTo(x1 - side * 3, 45); ctx.lineTo(x1 + side * 1, 57); ctx.lineTo(x0 - side * 1, 57); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2A2A30'; ctx.fillRect(Math.min(x0, x1) + 2, 36, 1, 18);
    // Flames
    for (let i = 0; i < 3; i++) {
      const fx = (side < 0 ? 18 : 55) + i * 3.4, tall = 5 + ((i * 7 + frame / 6) % 3);
      ctx.fillStyle = '#EA580C';
      ctx.beginPath(); ctx.moveTo(fx - 1.8, 57); ctx.quadraticCurveTo(fx - 1, 57 - tall, fx + 0.6, 57 - tall - 2); ctx.quadraticCurveTo(fx + 0.4, 57 - tall * 0.5, fx + 1.8, 57); ctx.fill();
      ctx.fillStyle = '#FACC15';
      ctx.beginPath(); ctx.moveTo(fx - 0.8, 57); ctx.quadraticCurveTo(fx - 0.2, 57 - tall * 0.5, fx + 0.4, 57 - tall * 0.7); ctx.lineTo(fx + 0.9, 57); ctx.fill();
    }
    // Collar
    ctx.fillStyle = '#1F1F24';
    ctx.beginPath(); ctx.moveTo(x1, 33); ctx.lineTo(x1 - side * 4, 33); ctx.lineTo(x1 - side * 1, 40); ctx.closePath(); ctx.fill();
  }
  bodyBlood(ctx, gore, [[34, 42, 3.5], [46, 50, 3], [29, 51, 3], [51, 43, 2.5], [38, 53, 2.5], [25, 47, 2.5]], frame);

  // Gold chain, and the lava-lamp pendant (it pulses, and flares before an eruption)
  ctx.strokeStyle = '#EAB308'; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(31, 33); ctx.quadraticCurveTo(40, 44, 49, 33); ctx.stroke();
  ctx.save();
  ctx.shadowColor = '#FF5722'; ctx.shadowBlur = tele ? 12 : 6;
  ctx.fillStyle = '#A16207'; ctx.fillRect(38, 40, 4, 1.4); ctx.fillRect(38, 47.5, 4, 1.4);
  ctx.fillStyle = pain ? '#57534E' : tele ? '#FFEB3B' : '#FF5722';
  ctx.beginPath(); ctx.moveTo(38.4, 41.4); ctx.lineTo(41.6, 41.4); ctx.lineTo(42.4, 47.5); ctx.lineTo(37.6, 47.5); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#FFD54F';
  const blob = (frame * 0.08) % 1;
  ctx.beginPath(); ctx.arc(40, 46.5 - blob * 4, 1.1, 0, Math.PI * 2); ctx.fill();

  // Shoulders like boulders, and arms to match; foil round his wrists
  const sway = Math.sin(frame * 0.06) * 1.2;
  const armUp = e.bossState === 'jumping' || tele || pain === 'scalded';
  for (const side of [-1, 1]) {
    const sx = 40 + side * 21, sy = 37;
    ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(sx, sy, 7.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = SKIN_LIGHT; ctx.fillRect(sx - 2, sy - 5.5, 4, 1.2);
    ctx.fillStyle = '#111114';
    ctx.beginPath(); ctx.arc(sx, sy - 0.5, 7.8, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); // shirt over the top of it
    // (choking: both hands at his throat)
    const ex = choke ? sx + side * 4 : sx + side * 5, ey = choke ? sy + 9 : armUp ? sy - 2 : sy + 10;
    const hx = choke ? 40 + side * 5 : sx + side * (armUp ? 10 : 6), hy = choke ? 32 + Math.sin(frame * 0.9 + side) * 0.8 : armUp ? sy - 12 : sy + 20 + side * sway;
    limb(ctx, sx + side * 2, sy + 2, ex, ey, 8.5, SKIN, SKIN_DARK);
    limb(ctx, ex, ey, hx, hy, 7, SKIN, SKIN_DARK);
    // Bicep, and a vein up it
    ctx.fillStyle = SKIN_LIGHT; ctx.fillRect(ex - side * 2.5 - 1, ey - 2, 2, 1);
    ctx.strokeStyle = '#8B3A1A'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(ex, ey + 1); ctx.lineTo(ex + side * 1.5, ey - 3); ctx.stroke();
    // The foil cuff
    const cx = ex + (hx - ex) * 0.75, cy = ey + (hy - ey) * 0.75;
    foil(ctx, [cx - 4, cy - 2, cx, cy - 3, cx + 4, cy - 2, cx + 4, cy + 2, cx, cy + 3, cx - 4, cy + 2], frame, side < 0 ? 1 : 4);
    hand(ctx, hx, hy, 4, SKIN, SKIN_DARK);
  }

  // The head: man bun, sweatband, stubble, a stud in one ear
  drawHead(ctx, { ...headAt(e, f, 40, 19 + lOff * 0.3), rot: turn?.rot }, FACE, mood, frame, gore, {
    back: () => {
      ctx.fillStyle = '#1C1917';
      ctx.beginPath(); ctx.arc(-9, -14, 4.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#EA580C'; ctx.fillRect(-9.5, -11, 3, 1.5);
    },
    hair: () => {
      ctx.fillStyle = '#1C1917';
      ctx.beginPath(); ctx.moveTo(-11.5, -6); ctx.quadraticCurveTo(-12, -15, -2, -15.5); ctx.quadraticCurveTo(9, -16, 11.3, -8); ctx.lineTo(10, -11); ctx.lineTo(-10, -10.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#44403C'; ctx.fillRect(-6, -14.6, 9, 0.8);
      ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.arc(-11.8, -1.4, 0.9, 0, Math.PI * 2); ctx.fill();
    },
    hat: () => {
      // Sweatband
      ctx.fillStyle = '#EA580C'; ctx.fillRect(-11.4, -12, 22.6, 2.8);
      ctx.fillStyle = '#FB923C'; ctx.fillRect(-11.4, -12, 22.6, 0.8);
      ctx.fillStyle = '#FDE68A'; ctx.fillRect(3, -11.6, 3, 1.8);
      // Sweat on his brow
      ctx.fillStyle = 'rgba(186, 230, 253, 0.85)';
      ctx.beginPath(); ctx.ellipse(-3, -7.8, 0.7, 1, 0, 0, Math.PI * 2); ctx.fill();
    },
  });
  // Choking: his hands clutching his throat (over his chin), and his face going purple
  if (choke) {
    ctx.fillStyle = `rgba(109, 40, 217, ${0.38 + heave * 0.12})`; ctx.beginPath(); ctx.arc(40 + f, 22, 12, 0, Math.PI * 2); ctx.fill();
    for (const side of [-1, 1]) {
      const hx = 40 + side * 6, hy = 35 + Math.sin(frame * 0.9 + side) * 0.8;
      ctx.fillStyle = '#3B1A0A'; ctx.beginPath(); ctx.arc(hx, hy, 5.6, 0, Math.PI * 2); ctx.fill();
      hand(ctx, hx, hy, 4.8, SKIN, SKIN_DARK);
    }
  }
  // Scalded: the steam coming up through him and whistling out of his ears, like a kettle
  if (pain === 'scalded') {
    for (const side of [-1, 1]) {
      // (a jet straight out of each ear, then billowing up)
      ctx.fillStyle = 'rgba(248, 250, 252, 0.95)';
      ctx.beginPath(); ctx.moveTo(40 + side * 14, 16.5); ctx.lineTo(40 + side * 26, 14 + Math.sin(frame * 1.7) * 1); ctx.lineTo(40 + side * 26, 19 + Math.sin(frame * 1.7) * 1); ctx.lineTo(40 + side * 14, 19.5); ctx.closePath(); ctx.fill();
      for (let k = 0; k < 5; k++) {
        const t = ((frame * 2 + k * 5 + (side > 0 ? 3 : 0)) % 24) / 24;
        ctx.fillStyle = `rgba(248, 250, 252, ${0.95 * (1 - t)})`;
        ctx.beginPath(); ctx.ellipse(40 + side * (24 + t * 18), 17 - t * 14, 3 + t * 6, 2.5 + t * 5, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
  ctx.restore();

  // Doused: his fire put out in his mouth: smoke and steam choking out of it, water running off him
  if (pain === 'doused') {
    for (let k = 0; k < 4; k++) {
      const t = ((frame * 1.4 + k * 12) % 48) / 48;
      ctx.fillStyle = k % 2 ? `rgba(55, 65, 81, ${0.6 * (1 - t)})` : `rgba(226, 232, 240, ${0.7 * (1 - t)})`;
      ctx.beginPath(); ctx.arc(40 + f * (8 + t * 10) + Math.sin(t * 8 + k) * 2, 26 - t * 26, 2 + t * 6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
    for (let k = 0; k < 6; k++) { const t = ((frame * 1.8 + k * 9) % 40) / 40; ctx.fillRect(22 + k * 7, 30 + t * 50, 1.4, 3); }
    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)'; ctx.fillRect(18, 14, 44, 2);
  }
  // Scalded: boiled red in blotches, steam pouring off all of him
  if (pain === 'scalded') {
    ctx.fillStyle = 'rgba(220, 38, 38, 0.45)';
    for (const [x, y, r] of [[30, 40, 6], [50, 44, 7], [40, 22, 7], [24, 52, 4], [56, 36, 5]] as const) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
    for (let k = 0; k < 8; k++) {
      const t = ((frame * 1.6 + k * 7) % 40) / 40;
      ctx.fillStyle = `rgba(248, 250, 252, ${0.7 * (1 - t)})`;
      ctx.beginPath(); ctx.arc(14 + k * 7 + Math.sin(t * 6 + k) * 3, 60 - t * 60, 2.5 + t * 6, 0, Math.PI * 2); ctx.fill();
    }
  }
  // Steam coming off his shoulders
  for (const side of [-1, 1]) {
    const t = ((frame + (side > 0 ? 25 : 0)) % 50) / 50;
    ctx.fillStyle = `rgba(226, 232, 240, ${0.28 * (1 - t)})`;
    ctx.beginPath(); ctx.arc(40 + side * 22 + Math.sin(t * 6) * 2, 28 - t * 20, 2.5 + t * 3.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
};
