// Blackout Barry's sprite: a power grid engineer, amateur astronomer and R&D's favorite test subject.
// Lanky, pale, unslept, pupils like dinner plates; navy coveralls with reflective stripes and
// glow-in-the-dark star stickers, ceramic insulators bolted to his shoulders, a tool belt, and a hard hat
// wrapped in foil with an antenna on top, blinking. Drawn in the boss's local space (0,0 = his top-left
// corner), in an 80x80 box.

import { Enemy } from '../../../types';
import { ARENA_RIGHT } from '../../../constants';
import { BARRY_TOLERANCE_FRAMES } from '../../bosses/barry';
import { FaceStyle, drawHead, headAt, facingOf, goreOf, moodOf, limb, hand, shoe, foil, bodyBlood, breath } from './kit';

const SKIN = '#EAD7C9', SKIN_DARK = '#B9A091';
const FACE: FaceStyle = {
  skin: SKIN, shadow: SKIN_DARK, highlight: '#FAF0E8', brow: '#3B2F2A', iris: '#0891B2',
  jaw: 'long', stubble: '#4B3A33', bags: '#7C5F8F', lips: '#9A7A70', age: 0.25,
};
const SUIT = '#1E2A4A', SUIT_DARK = '#131B31';

export const drawBarry = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const { width, height } = e;
  const isTeleporting = e.bossState === 'blackout_teleport';
  const isTelegraphing = e.bossState === 'telegraphing';
  const isGroundPound = e.bossState === 'ground_pound';
  const isLightning = e.bossState === 'lightning_storm';
  const isExhausted = e.bossState === 'exhausted';

  // High as a kite: a kite string trailing below him (the colours cycling are barryFx's)
  if (e.bossState === 'high') drawKiteString(ctx, width, height, frame);

  if (isExhausted) {
    // Stars going round his head
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const angle = (frame * 0.08) + (i * ((Math.PI * 2) / 3));
      const sx = Math.cos(angle) * 32 + width / 2;
      const sy = Math.sin(angle * 0.6) * 8 + 2;
      ctx.fillStyle = '#ffff00';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ffff00';
      ctx.beginPath();
      for (let j = 0; j < 10; j++) {
        const r = j % 2 === 0 ? 8 : 3;
        const a = (j * Math.PI) / 5;
        ctx.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  drawBarryBody(ctx, e, frame, { isExhausted, charged: isTelegraphing || isLightning || isGroundPound });

  // Telegraphs: energy pouring down for the ground pound, a ring for the storm
  if (isTelegraphing) {
    if (e.jumpCount === 0) {
      ctx.strokeStyle = '#bd00ff';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const ox = (i - 1) * 20 + width / 2, oy = height + 10 + (frame % 20);
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox, oy + 20); ctx.stroke();
      }
    } else {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(width / 2, height / 2, 60 + Math.sin(frame * 0.2) * 10, 0, Math.PI * 2); ctx.stroke();
    }
  }

  if (isTeleporting) {
    for (let i = 0; i < 8; i++) {
      const px = (Math.random() - 0.5) * width * 2 + width/2;
      const py = (Math.random() - 0.5) * height * 2 + height/2;
      ctx.fillStyle = (Math.random() > 0.5) ? '#120820' : '#4a1175';
      ctx.fillRect(px, py, 3, 3);
    }
  }
};

/** His fading in and out as he teleports, and the psychedelic colours when he's high: over the whole of him at once. */
export const barryFx = (e: Enemy, frame: number) => {
  const teleporting = e.bossState === 'blackout_teleport', high = e.bossState === 'high';
  if (!teleporting && !high) return null;
  return {
    alpha: teleporting ? Math.abs(Math.sin(frame * 0.4)) : undefined,
    filter: high ? `hue-rotate(${(frame * 12) % 360}deg) saturate(2.5)` : undefined,
  };
};

/**
 * The storm he makes, across the whole arena (world space): the lightning bolts coming down, and the walls, floor and
 * ceiling lit up with current when he lands a ground pound.
 */
export const drawBarryStorm = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const isGroundPound = e.bossState === 'ground_pound';
  const isLightning = e.bossState === 'lightning_storm';
  if (!isGroundPound && !isLightning) return;
  ctx.save();
  ctx.translate(e.pos.x, e.pos.y);
  if (isLightning && e.activeLightningStrikes && e.activeLightningStrikes.length > 0) {
    // Lightning Storm: Vertical bolts everywhere except directly under the boss, persisting with the hurtbox
    ctx.save();
    e.activeLightningStrikes.forEach(strike => {
      const relX = strike.x - e.pos.x;
      const floorY = 550 - e.pos.y;
      const ceilY = 100 - e.pos.y;
      const progress = strike.duration / (strike.maxDuration || 35);
      const halfW = (strike.width || 70) / 2;

      // Translucent glowing column marking the active hurtbox area
      const colGrad = ctx.createLinearGradient(relX - halfW, 0, relX + halfW, 0);
      colGrad.addColorStop(0, 'rgba(0, 229, 255, 0)');
      colGrad.addColorStop(0.5, `rgba(0, 240, 255, ${0.35 * progress})`);
      colGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.fillStyle = colGrad;
      ctx.fillRect(relX - halfW, ceilY, strike.width || 70, floorY - ceilY);

      // Core electric bolt
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#00e5ff';
      ctx.beginPath();
      ctx.moveTo(relX, ceilY);
      const segments = 12;
      for (let i = 1; i < segments; i++) {
        const segY = ceilY + (i / segments) * (floorY - ceilY);
        const segX = relX + (Math.sin(frame * 0.5 + i * 2.3) * 16) + (Math.random() - 0.5) * 10;
        ctx.lineTo(segX, segY);
      }
      ctx.lineTo(relX, floorY);
      ctx.stroke();

      // Crackling yellow electric branches off the bolt
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ffff00';
      for (let b = 0; b < 3; b++) {
        const branchY = ceilY + ((b + 1) / 4) * (floorY - ceilY);
        const dir = (b % 2 === 0 ? 1 : -1);
        ctx.beginPath();
        ctx.moveTo(relX, branchY);
        ctx.lineTo(relX + dir * (25 + Math.random() * 25), branchY + (Math.random() - 0.5) * 30);
        ctx.stroke();
      }

      // Floor impact electric splash
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(relX, floorY, 12 + Math.random() * 8, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  if (isGroundPound) {
    // Perimeter electrification (floor, ceiling, walls light up for a half second on landing)
    if ((e.electrifiedTimer || 0) > 0) {
      const floorY = 550 - e.pos.y;
      const ceilY = 100 - e.pos.y;
      const leftX = 7240 - e.pos.x;
      const rightX = 7960 - e.pos.x;

      ctx.save();
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00ffff';

      // 1. High-voltage energy borders
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 6;
      ctx.beginPath();
      // Floor
      ctx.moveTo(leftX, floorY);
      ctx.lineTo(rightX, floorY);
      // Ceiling
      ctx.moveTo(leftX, ceilY);
      ctx.lineTo(rightX, ceilY);
      // Left Wall
      ctx.moveTo(leftX, ceilY);
      ctx.lineTo(leftX, floorY);
      // Right Wall
      ctx.moveTo(rightX, ceilY);
      ctx.lineTo(rightX, floorY);
      ctx.stroke();

      // Core bright white line inside the cyan beam
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.rect(leftX, ceilY, rightX - leftX, floorY - ceilY);
      ctx.stroke();

      // 2. High-frequency crackling lightning arcs along all 4 boundaries
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ffff00';

      // Floor arcs
      const floorSegments = 24;
      ctx.beginPath();
      for (let i = 0; i <= floorSegments; i++) {
        const px = leftX + (i / floorSegments) * (rightX - leftX);
        const py = floorY + (Math.random() - 0.5) * 16;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Ceiling arcs
      const ceilSegments = 24;
      ctx.beginPath();
      for (let i = 0; i <= ceilSegments; i++) {
        const px = leftX + (i / ceilSegments) * (rightX - leftX);
        const py = ceilY + (Math.random() - 0.5) * 16;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Left wall arcs
      const wallSegments = 16;
      ctx.beginPath();
      for (let i = 0; i <= wallSegments; i++) {
        const py = ceilY + (i / wallSegments) * (floorY - ceilY);
        const px = leftX + (Math.random() - 0.5) * 16;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Right wall arcs
      ctx.beginPath();
      for (let i = 0; i <= wallSegments; i++) {
        const py = ceilY + (i / wallSegments) * (floorY - ceilY);
        const px = rightX + (Math.random() - 0.5) * 16;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // 3. Electric sparks shooting inwards from boundaries
      for (let i = 0; i < 8; i++) {
        const rx = leftX + Math.random() * (rightX - leftX);
        ctx.beginPath();
        ctx.moveTo(rx, floorY);
        ctx.lineTo(rx + (Math.random() - 0.5) * 30, floorY - Math.random() * 40);
        ctx.stroke();

        const cx = leftX + Math.random() * (rightX - leftX);
        ctx.beginPath();
        ctx.moveTo(cx, ceilY);
        ctx.lineTo(cx + (Math.random() - 0.5) * 30, ceilY + Math.random() * 40);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  ctx.restore();
};

const drawKiteString = (ctx: CanvasRenderingContext2D, width: number, height: number, frame: number) => {
  ctx.save();
  ctx.strokeStyle = '#F5F5F5';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2, height - 4);
  for (let i = 1; i <= 12; i++) ctx.lineTo(width / 2 + Math.sin(frame * 0.15 + i * 0.7) * (4 + i), height - 4 + i * 11);
  ctx.stroke();
  // Little bows along the tail
  const bows = ['#FF007F', '#FFD700', '#00F0FF'];
  bows.forEach((color, k) => {
    const i = 3 + k * 4;
    const bx = width / 2 + Math.sin(frame * 0.15 + i * 0.7) * (4 + i), by = height - 4 + i * 11;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(bx, by); ctx.lineTo(bx - 7, by - 4); ctx.lineTo(bx - 7, by + 4); ctx.closePath();
    ctx.moveTo(bx, by); ctx.lineTo(bx + 7, by - 4); ctx.lineTo(bx + 7, by + 4); ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
};

/** While his tolerance is up: a crossed-out syringe and a draining bar beside him. */
export const drawBarryTolerance = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const timer = e.toleranceTimer || 0;
  if (timer <= 0 || e.health <= 0) return;
  // Beside his head (on whichever side has room), clear of his health bar and speech
  const x = e.pos.x + e.width + 40 < ARENA_RIGHT ? e.pos.x + e.width + 20 : e.pos.x - 20, y = e.pos.y + 12;
  ctx.save();
  ctx.globalAlpha = timer < 60 && frame % 10 < 5 ? 0.4 : 1;
  // Syringe
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillRect(x - 10, y - 4, 16, 8);
  ctx.fillStyle = '#C084FC';
  ctx.fillRect(x - 9, y - 3, 12, 6);
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x + 6, y); ctx.lineTo(x + 14, y); ctx.stroke();
  ctx.fillStyle = '#9CA3AF';
  ctx.fillRect(x - 15, y - 1, 5, 2);
  // Crossed out
  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, 13, 0, Math.PI * 2);
  ctx.moveTo(x - 9, y - 9); ctx.lineTo(x + 9, y + 9);
  ctx.stroke();
  // Time left
  ctx.fillStyle = '#000000';
  ctx.fillRect(x - 21, y + 16, 42, 5);
  ctx.fillStyle = '#C084FC';
  ctx.fillRect(x - 20, y + 17, 40 * Math.min(1, timer / BARRY_TOLERANCE_FRAMES), 3);
  ctx.restore();
};

/** Barry himself (in an 80x80 box): hunched over when he's spent, arms down or flung out when he's charged. */
const drawBarryBody = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number, { isExhausted, charged }: { isExhausted: boolean; charged: boolean }) => {
  const f = facingOf(e);
  const gore = goreOf(e);
  const mood = isExhausted ? 'dazed' : moodOf(e, frame, { high: 'blissed', ground_pound: 'fierce', lightning_storm: 'roar', telegraphing: 'fierce' });
  const b = breath(frame, 0.09);
  const armsOut = charged && e.jumpCount !== 0;
  ctx.save();
  ctx.scale(e.width / 80, e.height / 80);

  // Work boots, coverall legs
  shoe(ctx, 31, 80, 14, 6, f, '#27272A', '#09090B');
  shoe(ctx, 49, 80, 14, 6, f, '#27272A', '#09090B');
  ctx.fillStyle = SUIT;
  ctx.fillRect(25, 56, 12, 19); ctx.fillRect(43, 56, 12, 19);
  ctx.fillStyle = SUIT_DARK; ctx.fillRect(25, 56, 3, 19); ctx.fillRect(43, 56, 3, 19);
  ctx.fillStyle = '#D4D4D8'; ctx.fillRect(25, 69, 12, 1.4); ctx.fillRect(43, 69, 12, 1.4); // reflective stripes

  // Slumped when he's spent
  ctx.save();
  if (isExhausted) { ctx.translate(40, 58); ctx.rotate(f * 0.18); ctx.translate(-40, -50); }
  else ctx.translate(0, -b);
  // Coveralls: stripes, star stickers, a zip, a tool belt
  ctx.fillStyle = SUIT;
  ctx.beginPath(); ctx.roundRect(20, 32, 40, 26, [6, 6, 2, 2]); ctx.fill();
  ctx.fillStyle = SUIT_DARK; ctx.fillRect(20, 34, 3.5, 23);
  ctx.fillStyle = '#D4D4D8'; ctx.fillRect(20, 45, 40, 1.6);
  ctx.fillStyle = '#64748B'; ctx.fillRect(39.4, 33, 1.2, 20);
  const glow = 0.55 + Math.sin(frame * 0.1) * 0.3;
  ctx.fillStyle = `rgba(190, 242, 100, ${glow})`;
  for (const [x, y, r] of [[27, 39, 2.2], [51, 50, 1.8], [30, 52, 1.5], [53, 38, 1.4]] as const) star(ctx, x, y, r);
  ctx.fillStyle = '#44403C'; ctx.fillRect(20, 53, 40, 4);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(38.5, 53.5, 3, 3);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(25, 54, 2, 6); ctx.fillStyle = '#FACC15'; ctx.fillRect(28, 54, 1.5, 7); // strippers, screwdriver
  ctx.fillStyle = '#18181B'; ctx.fillRect(50, 54, 6, 5); ctx.fillStyle = '#22C55E'; ctx.fillRect(51, 55, 2, 1); // multimeter
  bodyBlood(ctx, gore, [[46, 40, 3.5], [30, 47, 3], [52, 50, 2.5], [35, 38, 2.5], [44, 55, 2.5], [25, 43, 2.5]], frame);

  // Ceramic insulators bolted to the shoulders, crackling
  for (const side of [-1, 1]) {
    const x = 40 + side * 20;
    ctx.fillStyle = '#E7E5E4';
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(x, 30 - i * 3.2, 4.5 - i * 0.6, 1.6, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(x - 0.8, 22, 1.6, 9);
    if ((frame + (side > 0 ? 7 : 0)) % 15 < 5 || charged) {
      ctx.strokeStyle = charged ? '#FF3B3B' : '#BD00FF'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, 21); ctx.lineTo(x + side * 3, 17); ctx.lineTo(x + side * 1, 14); ctx.lineTo(x + side * 4, 10); ctx.stroke();
    }
  }

  // Arms: thin and long; stiff at his sides or flung out with the current in them
  for (const side of [-1, 1]) {
    const sx = 40 + side * 18, sy = 36;
    let ex, ey, hx, hy;
    if (armsOut) { ex = sx + side * 12; ey = sy - 3; hx = sx + side * 26; hy = sy - 6; }
    else if (charged) { ex = sx + side * 4; ey = sy + 11; hx = sx + side * 6; hy = sy + 22; }
    else if (isExhausted) { ex = sx + side * 1; ey = sy + 12; hx = sx - side * 1; hy = sy + 24; }
    else { ex = sx + side * 2.5; ey = sy + 10; hx = sx + side * 2 + Math.sin(frame * 0.06 + side) * 1.5; hy = sy + 20; }
    limb(ctx, sx, sy, ex, ey, 6.5, SUIT, SUIT_DARK);
    limb(ctx, ex, ey, hx, hy, 5.5, SUIT, SUIT_DARK);
    ctx.fillStyle = '#D4D4D8'; ctx.fillRect(ex - 3, ey - 0.7, 6, 1.4);
    hand(ctx, hx, hy, 3.4, SKIN, SKIN_DARK);
    if (charged && frame % 6 < 3) {
      ctx.strokeStyle = '#00E5FF'; ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + side * 3, hy + 3); ctx.lineTo(hx + side * 1, hy + 6); ctx.stroke();
    }
  }

  // The head: messy hair out from under a foil-wrapped hard hat with an antenna
  drawHead(ctx, headAt(e, f, 40, 19.5), FACE, mood, frame, gore, {
    hair: () => {
      ctx.fillStyle = '#3B2F2A';
      for (const [x, y] of [[-11, -7], [-10.5, -3], [10.5, -7], [-8, -10]] as const) {
        ctx.beginPath(); ctx.moveTo(x, y - 2); ctx.lineTo(x + (x < 0 ? -2.5 : 2.5), y + 1); ctx.lineTo(x, y + 2.5); ctx.fill();
      }
    },
    hat: () => {
      // Hard hat
      ctx.fillStyle = '#FACC15';
      ctx.beginPath(); ctx.moveTo(-12, -9); ctx.quadraticCurveTo(-12, -20, 0, -20); ctx.quadraticCurveTo(12, -20, 12, -9); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#CA8A04'; ctx.fillRect(-14, -9.6, 29, 2); ctx.fillRect(-0.8, -20, 1.6, 10);
      // The foil band round it
      foil(ctx, [-12, -13, -6, -14.5, 0, -14, 6, -14.6, 12, -13, 12, -10, 6, -11, 0, -10.5, -6, -11.2, -12, -10], frame, 2);
      // Antenna, blinking
      ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(4, -19.5); ctx.lineTo(7, -27); ctx.stroke();
      ctx.fillStyle = frame % 40 < 20 ? '#F87171' : '#7F1D1D';
      ctx.beginPath(); ctx.arc(7, -27.5, 1.3, 0, Math.PI * 2); ctx.fill();
    },
  });
  ctx.restore();
  ctx.restore();
};

const star = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
  ctx.beginPath();
  for (let j = 0; j < 10; j++) {
    const rr = j % 2 === 0 ? r : r * 0.45, a = (j * Math.PI) / 5 - Math.PI / 2;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fill();
};
