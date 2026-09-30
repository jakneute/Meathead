// Drug Trade Dale's sprite and the drugs he's using (his truck is in ../daleTruck.ts): a pharmacist,
// license revoked, delivering "care" across the desert. A purple double-breasted suit with shoulders out
// to here, a pocket square, a gold chain with a dollar medallion, a pompadour with his aviators pushed up
// into it, a gold tooth, a pill bottle in his breast pocket and a row of foil blister packs pinned to his
// lapel like medals. Drawn in the boss's local space (0,0 = his top-left corner), in an 80x80 box.

import { Enemy } from '../../../types';
import { COLORS, ARENA_LEFT, ARENA_RIGHT, DALE_SPEED_WINDUP } from '../../../constants';
import { drawCocaineBag, drawMethDrum } from '../projectiles';
import { FaceStyle, drawHead, headAt, facingOf, goreOf, moodOf, limb, hand, shoe, foil, bodyBlood, breath } from './kit';

const SKIN = '#EDC3A0', SKIN_DARK = '#BB8F6E';
const FACE: FaceStyle = {
  skin: SKIN, shadow: SKIN_DARK, highlight: '#FBDFC7', brow: '#111111', iris: '#4D7C0F',
  jaw: 'square', stubble: '#4B5563', bags: '#8B6A8E', lips: '#9C6450', goldTooth: true, age: 0.3,
};
const SUIT = '#8E44AD', SUIT_DARK = '#5B2C6F', SUIT_LIGHT = '#A569BD';

export const drawDale = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  // Speed: twitching harder and harder as the needle goes in (the strobing colours are daleFx's)
  const windingUp = e.bossState === 'using_shipment' && e.shipmentType === 'speed';
  if (windingUp) {
    const t = 1 - (e.stateTimer || 0) / DALE_SPEED_WINDUP;
    if (t > 0.55) {
      const j = (t - 0.55) * 10;
      ctx.translate((Math.random() - 0.5) * j, (Math.random() - 0.5) * j);
    }
  }
  const f = facingOf(e);
  const gore = goreOf(e);
  const mood = moodOf(e, frame, { speed_dash: 'manic', using_shipment: windingUp ? 'shock' : 'blissed', running: 'fierce' });
  const b = breath(frame);
  ctx.save();
  ctx.scale(e.width / 80, e.height / 80);

  // Two-tone shoes, purple slacks
  shoe(ctx, 30, 80, 14, 5, f, '#111111', '#000000', 'rgba(255,255,255,0.45)');
  shoe(ctx, 50, 80, 14, 5, f, '#111111', '#000000', 'rgba(255,255,255,0.45)');
  ctx.fillStyle = SUIT_DARK;
  ctx.beginPath(); ctx.moveTo(23, 54); ctx.lineTo(57, 54); ctx.lineTo(56, 76); ctx.lineTo(43, 76); ctx.lineTo(40, 62); ctx.lineTo(37, 76); ctx.lineTo(24, 76); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#6C3483'; ctx.fillRect(30, 57, 0.7, 18); ctx.fillRect(50, 57, 0.7, 18);

  ctx.save(); ctx.translate(0, -b);
  // Shirt, open at the neck, and the chest it's open over
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.moveTo(33, 32); ctx.lineTo(47, 32); ctx.lineTo(42, 48); ctx.lineTo(38, 48); ctx.closePath(); ctx.fill();
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.moveTo(36.5, 32); ctx.lineTo(43.5, 32); ctx.lineTo(40, 42); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#44403C'; for (let i = 0; i < 5; i++) ctx.fillRect(38 + (i * 1.7) % 4, 33 + i * 1.5, 0.6, 0.6); // chest hair
  // The jacket: double-breasted, lapels, shoulders out past his arms
  ctx.fillStyle = SUIT;
  ctx.beginPath(); ctx.moveTo(14, 33); ctx.lineTo(36, 31); ctx.lineTo(40, 48); ctx.lineTo(44, 31); ctx.lineTo(66, 33); ctx.lineTo(62, 57); ctx.lineTo(18, 57); ctx.closePath(); ctx.fill();
  ctx.fillStyle = SUIT_DARK; ctx.fillRect(17, 35, 3.5, 21);
  ctx.fillStyle = SUIT_LIGHT;
  ctx.beginPath(); ctx.moveTo(36, 31); ctx.lineTo(31, 36); ctx.lineTo(38, 44); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(44, 31); ctx.lineTo(49, 36); ctx.lineTo(42, 44); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#FFD700';
  for (const [x, y] of [[35, 50], [45, 50], [35, 54], [45, 54]] as const) { ctx.beginPath(); ctx.arc(x, y, 1.3, 0, Math.PI * 2); ctx.fill(); }
  // Pocket square, and a pill bottle in the breast pocket
  ctx.fillStyle = SUIT_DARK; ctx.fillRect(50, 40, 8, 1);
  ctx.fillStyle = '#FF1493'; ctx.beginPath(); ctx.moveTo(51, 40); ctx.lineTo(53, 36.5); ctx.lineTo(55, 40); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#F97316'; ctx.fillRect(55.5, 36, 2.6, 4); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(55.3, 35, 3, 1.4);
  // Blister packs pinned to the lapel like medals
  for (let i = 0; i < 3; i++) {
    const x = 26 + i * 3.6, y = 38 + (i % 2) * 1.5;
    ctx.fillStyle = ['#DC2626', '#2563EB', '#16A34A'][i]; ctx.fillRect(x + 1, y - 3, 1.4, 3); // ribbons
    foil(ctx, [x, y, x + 3.4, y, x + 3.4, y + 5, x, y + 5], frame, i + 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; ctx.fillRect(x + 0.6, y + 0.8, 1, 1); ctx.fillRect(x + 1.9, y + 2.6, 1, 1);
  }
  bodyBlood(ctx, gore, [[48, 47, 3.5], [27, 50, 3], [40, 38, 2.5], [56, 52, 2.5], [33, 44, 2.5], [22, 40, 2.5]], frame);

  // The chain and the dollar medallion
  ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(35.5, 31.5); ctx.quadraticCurveTo(40, 45, 44.5, 31.5); ctx.stroke();
  ctx.save(); ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 4;
  ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.arc(40, 43, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.strokeStyle = '#B7950B'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(40, 43, 4, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#2E1045'; ctx.font = 'bold 6px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 40, 43.3);
  if (frame % 60 < 6) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(41.5, 40.5, 1, 1); }

  // Shoulder pads, and the arms out of them (the needle in one when he's dashing on speed)
  for (const side of [-1, 1]) {
    const sx = 40 + side * 22, sy = 36;
    ctx.fillStyle = SUIT; ctx.beginPath(); ctx.roundRect(sx - 6, sy - 5, 12, 9, 3); ctx.fill();
    ctx.fillStyle = SUIT_LIGHT; ctx.fillRect(sx - 4, sy - 4.5, 8, 1);
    const ex = sx + side * 2, ey = sy + 10;
    const hx = sx + side * 1.5 + Math.sin(frame * 0.07 + side) * 1.2, hy = sy + 19;
    limb(ctx, sx, sy + 1, ex, ey, 7.5, SUIT, SUIT_DARK);
    limb(ctx, ex, ey, hx, hy, 6.5, SUIT, SUIT_DARK);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(hx - 3, hy - 4, 6, 1.4); // shirt cuff
    hand(ctx, hx, hy, 3.6, SKIN, SKIN_DARK);
    ctx.fillStyle = '#FFD700'; ctx.fillRect(hx - 2, hy - 1.2, 1.4, 1.4); // pinky ring
  }
  if (e.bossState === 'speed_dash') {
    ctx.save(); ctx.translate(16, 46); ctx.rotate(-0.5);
    ctx.fillStyle = COLORS.PROJECTILE_DART; ctx.fillRect(0, -2, 16, 4);
    ctx.fillStyle = 'red'; ctx.fillRect(16, -4, 6, 8); ctx.restore();
  }

  // The head: pompadour, aviators pushed up into it
  drawHead(ctx, headAt(e, f, 40, 19), FACE, mood, frame, gore, {
    hair: () => {
      ctx.fillStyle = '#0A0A0A';
      ctx.beginPath();
      ctx.moveTo(-11.5, -2); ctx.quadraticCurveTo(-13, -14, -4, -15); ctx.quadraticCurveTo(6, -21, 14, -15);
      ctx.quadraticCurveTo(10, -12.5, 6, -12); ctx.lineTo(-8, -9.5); ctx.lineTo(-10, -5); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(-6, -14.5); ctx.quadraticCurveTo(3, -19, 11, -15.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-8, -12); ctx.quadraticCurveTo(0, -15.5, 7, -13.5); ctx.stroke();
      // Sideburns
      ctx.fillStyle = '#0A0A0A'; ctx.fillRect(-11, -5, 2, 6);
    },
    hat: () => {
      // Gold aviators up in the pompadour, the sunset in the lenses
      ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(-10, -14); ctx.lineTo(-7, -14.5); ctx.moveTo(0, -15.5); ctx.lineTo(1.5, -15.5); ctx.stroke();
      for (const x of [-4, 5]) {
        ctx.fillStyle = '#111111'; ctx.beginPath(); ctx.ellipse(x, -15, 3.4, 2.2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FF007F'; ctx.fillRect(x - 2.6, -16.2, 5.2, 1);
        ctx.fillStyle = '#00F0FF'; ctx.fillRect(x - 2.2, -14.6, 4.4, 0.8);
        ctx.stroke();
      }
    },
  });
  ctx.restore();
  ctx.restore();
};

/** Speed: a strobing high over the whole of him while he dashes, and coming on as the needle goes in. */
export const daleFx = (e: Enemy, frame: number) => {
  if (e.bossState === 'speed_dash') return { filter: `hue-rotate(${frame * 10}deg) saturate(3)` };
  if (e.bossState === 'using_shipment' && e.shipmentType === 'speed') {
    const t = 1 - (e.stateTimer || 0) / DALE_SPEED_WINDUP;
    if (t > 0.55) return { filter: `hue-rotate(${Math.floor(frame * 12 * t)}deg) saturate(${1 + t * 2})` };
  }
  return null;
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
