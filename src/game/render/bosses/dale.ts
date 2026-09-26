// Drug Trade Dale's sprite and the drugs he's using (his truck is in ../daleTruck.ts).
// Drawn in the boss's local space (0,0 = his top-left corner).

import { Enemy } from '../../../types';
import { COLORS, ARENA_LEFT, ARENA_RIGHT, DALE_SPEED_WINDUP } from '../../../constants';
import { drawCocaineBag, drawMethDrum } from '../projectileArt';

export const drawDale = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const { width, height } = e;
  // Speed: a strobing high while he dashes, and twitching harder and harder as the needle goes in
  if (e.bossState === 'speed_dash') {
    ctx.filter = `hue-rotate(${frame * 10}deg) saturate(3)`;
  }
  if (e.bossState === 'using_shipment' && e.shipmentType === 'speed') {
    const t = 1 - (e.stateTimer || 0) / DALE_SPEED_WINDUP;
    if (t > 0.55) {
      const j = (t - 0.55) * 10;
      ctx.translate((Math.random() - 0.5) * j, (Math.random() - 0.5) * j);
      ctx.filter = `hue-rotate(${Math.floor(frame * 12 * t)}deg) saturate(${1 + t * 2})`;
    }
  }
  // 1. Purple Slacks & Shiny Oxford Shoes
  ctx.fillStyle = '#6C3483';
  ctx.fillRect(width * 0.20, height * 0.70, width * 0.26, height * 0.30);
  ctx.fillRect(width * 0.54, height * 0.70, width * 0.26, height * 0.30);
  ctx.fillStyle = '#111111';
  ctx.fillRect(width * 0.16, height * 0.90, width * 0.30, height * 0.10);
  ctx.fillRect(width * 0.54, height * 0.90, width * 0.30, height * 0.10);

  // 2. Double-Breasted Vice Purple Suit Jacket with Broad 80s Padded Shoulders
  ctx.fillStyle = '#8E44AD';
  ctx.fillRect(width * 0.14, height * 0.32, width * 0.72, height * 0.40);
  ctx.strokeStyle = '#4A235A';
  ctx.lineWidth = 2;
  ctx.strokeRect(width * 0.14, height * 0.32, width * 0.72, height * 0.40);

  // Broad padded shoulder pads
  ctx.fillStyle = '#9B59B6';
  ctx.fillRect(width * 0.06, height * 0.30, width * 0.18, height * 0.16);
  ctx.strokeRect(width * 0.06, height * 0.30, width * 0.18, height * 0.16);
  ctx.fillRect(width * 0.76, height * 0.30, width * 0.18, height * 0.16);
  ctx.strokeRect(width * 0.76, height * 0.30, width * 0.18, height * 0.16);

  // Hot-pink pocket square
  ctx.fillStyle = '#FF1493';
  ctx.beginPath();
  ctx.moveTo(width * 0.72, height * 0.40);
  ctx.lineTo(width * 0.78, height * 0.36);
  ctx.lineTo(width * 0.80, height * 0.42);
  ctx.closePath();
  ctx.fill();

  // Gold Suit Buttons
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(width * 0.42, height * 0.55, 3, 0, Math.PI * 2);
  ctx.arc(width * 0.58, height * 0.55, 3, 0, Math.PI * 2);
  ctx.arc(width * 0.42, height * 0.65, 3, 0, Math.PI * 2);
  ctx.arc(width * 0.58, height * 0.65, 3, 0, Math.PI * 2);
  ctx.fill();

  // 3. Unbuttoned White Dress Shirt Collar
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(width * 0.38, height * 0.32);
  ctx.lineTo(width * 0.50, height * 0.50);
  ctx.lineTo(width * 0.62, height * 0.32);
  ctx.closePath();
  ctx.fill();

  // 4. Giant 24k Gold Cuban Chain & Heavy Dollar Sign Medallion
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width * 0.36, height * 0.32);
  ctx.quadraticCurveTo(width * 0.50, height * 0.54, width * 0.64, height * 0.32);
  ctx.stroke();

  ctx.fillStyle = '#FFD700';
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(width * 0.50, height * 0.52, width * 0.10, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#B7950B';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#2E1045';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('$', width * 0.50, height * 0.52);

  // 5. Dale's Head & Face
  ctx.fillStyle = '#F5CBA7';
  ctx.beginPath();
  ctx.arc(width * 0.5, height * 0.22, width * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2C3E50';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 5 o'clock shadow
  ctx.fillStyle = 'rgba(86, 101, 115, 0.25)';
  ctx.beginPath();
  ctx.arc(width * 0.5, height * 0.24, width * 0.18, 0, Math.PI);
  ctx.fill();

  // 6. Slicked-Back Black Pompadour Hair
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.moveTo(width * 0.26, height * 0.18);
  ctx.quadraticCurveTo(width * 0.22, -height * 0.02, width * 0.50, -height * 0.05);
  ctx.quadraticCurveTo(width * 0.78, -height * 0.02, width * 0.74, height * 0.18);
  ctx.quadraticCurveTo(width * 0.50, height * 0.06, width * 0.26, height * 0.18);
  ctx.closePath();
  ctx.fill();
  // Pompadour highlight sheen
  ctx.strokeStyle = '#5D6D7E';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(width * 0.50, height * 0.02, width * 0.16, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();

  // 7. Gold Aviator Sunglasses reflecting Neon Sunset
  ctx.fillStyle = '#111111';
  ctx.fillRect(width * 0.30, height * 0.16, width * 0.40, height * 0.09);
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(width * 0.30, height * 0.16, width * 0.40, height * 0.09);
  // Neon reflections in lenses
  ctx.fillStyle = '#FF007F';
  ctx.fillRect(width * 0.32, height * 0.17, width * 0.16, height * 0.04);
  ctx.fillRect(width * 0.52, height * 0.17, width * 0.16, height * 0.04);
  ctx.fillStyle = '#00F0FF';
  ctx.fillRect(width * 0.32, height * 0.21, width * 0.16, height * 0.03);
  ctx.fillRect(width * 0.52, height * 0.21, width * 0.16, height * 0.03);

  // 8. Cocky Smirk with Glinting Gold Tooth
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width * 0.40, height * 0.28);
  ctx.quadraticCurveTo(width * 0.50, height * 0.31, width * 0.60, height * 0.27);
  ctx.stroke();
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(width * 0.52, height * 0.27, 3, 3);
  if (e.bossState === 'speed_dash') {
    ctx.save(); ctx.translate(width * 0.2, height * 0.3); ctx.rotate(-0.5);
    ctx.fillStyle = COLORS.PROJECTILE_DART; ctx.fillRect(0, -2, 16, 4);
    ctx.fillStyle = 'red'; ctx.fillRect(16, -4, 6, 8); ctx.restore();
  }
};

export const drawDaleDrugs = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  if (e.bossState === 'using_shipment' && e.shipmentType === 'speed' && e.stateTimer! > 0) {
    drawSpeedWindup(ctx, e, frame);
    return;
  }
  if (e.bossState === 'using_shipment' && e.shipmentCount! > 0) {
    // What's left of the shipment, piled up beside him: the same bags and drums he throws
    const right = e.pos.x - 6, groundY = 550;
    const pile = e.shipmentType === 'cocaine' ? { gap: 22, rowH: 18, perRow: [4, 3, 2, 1] } : { gap: 42, rowH: 50, perRow: [3, 2] };
    let left = e.shipmentCount!;
    pile.perRow.forEach((n, row) => {
      for (let c = 0; c < n && left > 0; c++, left--) {
        const cx = right - pile.gap / 2 - c * pile.gap - row * pile.gap / 2;
        if (e.shipmentType === 'cocaine') {
          drawCocaineBag(ctx, cx, groundY - 12 - row * pile.rowH, 12.5, ((c * 7 + row * 3) % 5 - 2) * 0.15);
        } else if (e.shipmentType === 'meth') {
          drawMethDrum(ctx, cx, groundY - 25 - row * pile.rowH, 40, 50, 0, frame);
        }
      }
    });
  }
};

/** A big, glowing syringe. (0,0) is the needle tip; it points along -x before rotation. */
const drawBigSyringe = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, fill: number, plunge: number, frame: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  // Glow
  ctx.shadowColor = '#ff2fa0';
  ctx.shadowBlur = 16;
  // Needle
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(24, 0); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#9ca3af';
  ctx.fillRect(22, -4, 6, 8);
  // Barrel
  const barrelX = 28, barrelL = 46;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(barrelX, -9, barrelL, 18);
  // Neon drug inside, draining as the plunger goes in
  const juice = barrelL * fill;
  ctx.shadowColor = '#ff2fa0';
  ctx.shadowBlur = 12;
  ctx.fillStyle = frame % 8 < 4 ? '#ff2fa0' : '#ff6fcf';
  ctx.fillRect(barrelX + 2, -7, juice, 14);
  ctx.shadowBlur = 0;
  // Bubbles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  for (let b = 0; b < 3; b++) {
    const bx = barrelX + 4 + ((frame * 1.5 + b * 13) % Math.max(4, juice - 4));
    ctx.fillRect(bx, -3 + (b % 2) * 4, 2, 2);
  }
  // Graduation marks and outline
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(barrelX, -9, barrelL, 18);
  for (let m = 1; m < 5; m++) { ctx.beginPath(); ctx.moveTo(barrelX + m * 9, -9); ctx.lineTo(barrelX + m * 9, -4); ctx.stroke(); }
  // Finger flange
  ctx.fillStyle = '#e5e7eb';
  ctx.fillRect(barrelX + barrelL, -15, 4, 30);
  // Plunger rod + red thumb press (slides in as it plunges)
  const rodOut = 34 * (1 - plunge);
  ctx.fillStyle = '#9ca3af';
  ctx.fillRect(barrelX + barrelL - 2 - (barrelL - 4) * plunge, -3, rodOut + (barrelL - 4) * plunge + 6, 6);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(barrelX + barrelL + 4 + rodOut, -12, 6, 24);
  // Glint
  if (frame % 30 < 6) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(barrelX + 6 + (frame % 30) * 6, -8, 3, 16);
  }
  ctx.restore();
};

/**
 * Dale's speed wind-up, made unmissable: he hoists a giant syringe, jabs it
 * into his neck and pumps it, while a danger lane shows where he'll charge.
 */
const drawSpeedWindup = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const t = 1 - (e.stateTimer || 0) / DALE_SPEED_WINDUP; // 0 -> 1
  const cx = e.pos.x + e.width / 2;
  const top = e.pos.y;

  // Danger lane across the arena at Dale's height, chevrons racing toward his first dash (left)
  if (t > 0.15) {
    ctx.save();
    const flash = 0.18 + 0.14 * Math.sin(frame * 0.6);
    ctx.fillStyle = `rgba(255, 30, 60, ${flash * Math.min(1, (t - 0.15) * 4)})`;
    ctx.fillRect(ARENA_LEFT, top + 8, ARENA_RIGHT - ARENA_LEFT, e.height - 8);
    ctx.fillStyle = `rgba(255, 220, 220, ${0.6 * Math.min(1, (t - 0.15) * 4)})`;
    const off = (frame * 6) % 40;
    for (let x = ARENA_RIGHT - off; x > ARENA_LEFT; x -= 40) {
      ctx.beginPath();
      ctx.moveTo(x, top + e.height / 2);
      ctx.lineTo(x + 14, top + 18);
      ctx.lineTo(x + 20, top + 18);
      ctx.lineTo(x + 6, top + e.height / 2);
      ctx.lineTo(x + 20, top + e.height - 6);
      ctx.lineTo(x + 14, top + e.height - 6);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Pulse rings once it's in
  if (t > 0.55) {
    ctx.save();
    for (let r = 0; r < 2; r++) {
      const ring = ((frame * 3 + r * 30) % 60) / 60;
      ctx.strokeStyle = `rgba(255, 47, 160, ${0.7 * (1 - ring)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, top + e.height / 2, 30 + ring * 60, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // The syringe: raise overhead, stab into the neck, then pump
  const neck = { x: cx + 6, y: top + 14 };
  // The barrel extends along +x from the tip, so an angle near -1.9 holds it
  // up and behind his head with the needle pointing down into his neck.
  let sx, sy, angle, plunge = 0;
  if (t < 0.4) {
    // Hoist it up from his side
    const k = t / 0.4;
    const ease = 1 - Math.pow(1 - k, 2);
    sx = cx - 56 + ease * 40;
    sy = top + 34 - ease * 70;
    angle = -0.5 - ease * 1.4;
  } else if (t < 0.55) {
    // Stab down into the neck
    const k = (t - 0.4) / 0.15;
    sx = cx - 16 + (neck.x - (cx - 16)) * k;
    sy = top - 36 + (neck.y - (top - 36)) * k;
    angle = -1.9;
  } else {
    // Pump it in
    sx = neck.x;
    sy = neck.y;
    angle = -1.9;
    plunge = (t - 0.55) / 0.45;
  }
  drawBigSyringe(ctx, sx, sy, angle, 1 - plunge * 0.95, plunge, frame);

  // Impact burst at the moment of the jab
  if (t >= 0.55 && t < 0.65) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.fillRect(neck.x + Math.cos(a) * 16 - 2, neck.y + Math.sin(a) * 16 - 2, 4, 4);
    }
    ctx.restore();
  }

  // Flashing warning over his head
  if (Math.floor(frame / 5) % 2 === 0) {
    ctx.save();
    ctx.font = 'bold 26px "Press Start 2P", sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#000000';
    ctx.strokeText('!!', cx, top - 58);
    ctx.fillStyle = '#ff2fa0';
    ctx.fillText('!!', cx, top - 58);
    ctx.restore();
  }
};
