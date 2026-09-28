// Drug Trade Dale's delivery truck and its incoming-truck warning (world space).

import { Enemy } from '../../../types';
import { BOSS_DOOR_X, DALE_TRUCK_SPEED } from '../../../constants';

const TRUCK_Y = 400;
const TRUCK_W = 350;
const TRUCK_H = 150;
const TRAILER_W = 252;
const WHEEL_R = 22;

/**
 * How far round a wheel of radius r is, having rolled dist at speed (px a frame; + is to the right, which is clockwise
 * on screen). Five spokes: turned more than half a spoke a frame, the eye reads them going backwards (the wagon-wheel
 * thing), so a fast wheel is shown turning the right way at a steady WHEEL_MAX_TURN a frame instead.
 */
const WHEEL_MAX_TURN = 0.4;
export const wheelTurn = (dist: number, speed: number, r: number, frame: number) =>
  Math.abs(speed) / r <= WHEEL_MAX_TURN ? dist / r : frame * WHEEL_MAX_TURN * Math.sign(speed);

export const drawDaleTruck = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  if (!e.truckActive || e.truckX === undefined) return;
  ctx.save();
  // Not affected by Dale's own hit-flicker or drug filters
  ctx.globalAlpha = 1;
  ctx.filter = 'none';
  ctx.shadowBlur = 0;
  if (e.truckX < BOSS_DOOR_X) drawIncomingWarning(ctx, frame);
  drawDeliveryTruck(ctx, e.truckX, TRUCK_Y, frame, !!e.truckCrashing, true, DALE_TRUCK_SPEED);
  ctx.restore();
};

/**
 * The truck itself, its top-left at (x, y) (it's TRUCK_W long, TRUCK_H tall, facing right), moving (speed lines
 * behind it) or parked. (Dale drives it through his arena, and loads it out in the desert.)
 */
export const drawDeliveryTruck = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, crashing = false, moving = false, speed = 0) => {
  // Rattling over the floor; out of control it bucks and fishtails on its rims
  const bounce = crashing ? Math.sin(frame * 1.7) * 3 + 4 : moving ? Math.sin(frame * 0.9) * 1.2 : 0;
  const lean = crashing ? Math.sin(frame * 0.6) * 0.05 - 0.02 : 0;
  if (moving) drawShadowAndSpeedLines(ctx, x, y, frame);
  else { ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.beginPath(); ctx.ellipse(x + TRUCK_W / 2, y + TRUCK_H - 2, TRUCK_W / 2 + 10, 8, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.save();
  ctx.translate(x + TRUCK_W / 2, y + TRUCK_H);
  ctx.rotate(lean);
  ctx.translate(-(x + TRUCK_W / 2), -(y + TRUCK_H) + bounce);
  drawTrailer(ctx, x, y);
  drawCab(ctx, x + TRAILER_W + 6, y, frame);
  ctx.restore();
  // Wheels roll with the truck (flat once the tires are blown)
  const spin = wheelTurn(x, speed, WHEEL_R, frame);
  [x + 46, x + 96, x + 196, x + TRAILER_W + 62].forEach(wx => drawWheel(ctx, wx, y + TRUCK_H - WHEEL_R + 2, spin, crashing));
};

export const DELIVERY_TRUCK = { w: TRUCK_W, h: TRUCK_H };

/** Flashing "!" at the door so you know it's coming. */
const drawIncomingWarning = (ctx: CanvasRenderingContext2D, frame: number) => {
  if (Math.floor(frame / 15) % 2 !== 0) return;
  const wx = BOSS_DOOR_X + 50, wy = 350;
  ctx.save();
  ctx.fillStyle = '#FF0000';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(wx, wy - 30);
  ctx.lineTo(wx + 30, wy + 30);
  ctx.lineTo(wx - 30, wy + 30);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'white';
  ctx.font = 'bold 40px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('!', wx, wy + 22);
  ctx.restore();
};

const drawShadowAndSpeedLines = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) => {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x + TRUCK_W / 2, y + TRUCK_H - 2, TRUCK_W / 2 + 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i++) {
    const ly = y + 18 + i * 24;
    const len = 50 + ((frame * 7 + i * 37) % 60);
    ctx.beginPath();
    ctx.moveTo(x - 12 - len, ly);
    ctx.lineTo(x - 12, ly);
    ctx.stroke();
  }
};

const drawTrailer = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  const top = y + 4, h = 120;
  // Box with a metallic sheen and corrugated ribs
  const sheen = ctx.createLinearGradient(0, top, 0, top + h);
  sheen.addColorStop(0, '#FFFFFF');
  sheen.addColorStop(0.5, '#E5E7EB');
  sheen.addColorStop(1, '#9CA3AF');
  ctx.fillStyle = sheen;
  ctx.fillRect(x, top, TRAILER_W, h);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.lineWidth = 2;
  for (let rx = x + 14; rx < x + TRAILER_W; rx += 18) {
    ctx.beginPath(); ctx.moveTo(rx, top + 4); ctx.lineTo(rx, top + h - 4); ctx.stroke();
  }
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, top, TRAILER_W, h);
  // Roof rail with amber marker lights
  ctx.fillStyle = '#374151';
  ctx.fillRect(x - 2, top - 4, TRAILER_W + 4, 6);
  ctx.fillStyle = '#FBBF24';
  for (let mx = x + 20; mx < x + TRAILER_W; mx += 58) ctx.fillRect(mx, top - 5, 8, 4);
  // Rear doors
  ctx.strokeStyle = '#6B7280';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 4, top + 6, 22, h - 12);
  ctx.fillStyle = '#4B5563';
  ctx.fillRect(x + 18, top + h / 2 - 8, 4, 16);

  // The livery: a purple band with the sign on it
  const bandY = top + 22, bandH = 76;
  const band = ctx.createLinearGradient(x, 0, x + TRAILER_W, 0);
  band.addColorStop(0, '#4C1D95');
  band.addColorStop(0.5, '#7C3AED');
  band.addColorStop(1, '#4C1D95');
  ctx.fillStyle = band;
  ctx.fillRect(x + 32, bandY, TRAILER_W - 40, bandH);
  ctx.fillStyle = '#FDE047';
  ctx.fillRect(x + 32, bandY, TRAILER_W - 40, 3);
  ctx.fillRect(x + 32, bandY + bandH - 3, TRAILER_W - 40, 3);

  // Pill logo
  const px = x + 58, py = bandY + bandH / 2;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(-0.6);
  ctx.fillStyle = '#EF4444';
  ctx.beginPath(); ctx.arc(-6, 0, 9, Math.PI / 2, Math.PI * 1.5); ctx.fill();
  ctx.fillRect(-6, -9, 6, 18);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, -9, 6, 18);
  ctx.beginPath(); ctx.arc(6, 0, 9, -Math.PI / 2, Math.PI / 2); ctx.fill();
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(-6, 0, 9, Math.PI / 2, Math.PI * 1.5); ctx.lineTo(6, -9); ctx.arc(6, 0, 9, -Math.PI / 2, Math.PI / 2); ctx.closePath(); ctx.stroke();
  ctx.restore();

  // DALE'S DRUGS
  const textX = x + 32 + (TRAILER_W - 40) / 2 + 18;
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  ctx.font = 'bold 15px "Press Start 2P"';
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#1E1B4B';
  ctx.strokeText("DALE'S", textX, bandY + 30);
  ctx.fillStyle = '#FDE047';
  ctx.fillText("DALE'S", textX, bandY + 30);
  ctx.font = 'bold 20px "Press Start 2P"';
  ctx.strokeText('DRUGS', textX, bandY + 58);
  ctx.fillStyle = '#F472B6';
  ctx.fillText('DRUGS', textX, bandY + 58);
  ctx.font = '6px "Press Start 2P"';
  ctx.fillStyle = '#E9D5FF';
  ctx.fillText('NO QUESTIONS ASKED', textX, bandY + 71);

  // Chassis and mudflaps
  ctx.fillStyle = '#1F2937';
  ctx.fillRect(x + 2, top + h, TRAILER_W + 6, 10);
  ctx.fillStyle = '#111111';
  ctx.fillRect(x + 120, top + h + 4, 8, 18);
  ctx.fillRect(x + 228, top + h + 4, 8, 18);
};

const drawCab = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) => {
  const w = 92, top = y + 30, bottom = y + TRUCK_H - 14;
  // Exhaust stack puffing black smoke
  ctx.fillStyle = '#9CA3AF';
  ctx.fillRect(x + 4, y - 14, 7, top - y + 20);
  ctx.fillStyle = '#6B7280';
  ctx.fillRect(x + 2, y - 16, 11, 5);
  for (let i = 0; i < 3; i++) {
    const t = ((frame * 2 + i * 13) % 40) / 40;
    ctx.fillStyle = `rgba(30, 30, 30, ${0.55 * (1 - t)})`;
    ctx.beginPath();
    ctx.arc(x + 7 - t * 30, y - 20 - t * 26, 5 + t * 9, 0, Math.PI * 2);
    ctx.fill();
  }

  // Body: sloped windshield, long hood
  const body = ctx.createLinearGradient(0, top, 0, bottom);
  body.addColorStop(0, '#EF4444');
  body.addColorStop(0.6, '#B91C1C');
  body.addColorStop(1, '#7F1D1D');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(x, bottom);
  ctx.lineTo(x, top);
  ctx.lineTo(x + 46, top);
  ctx.lineTo(x + 60, top + 36);
  ctx.lineTo(x + w - 4, top + 42);
  ctx.quadraticCurveTo(x + w + 2, top + 44, x + w + 2, top + 52);
  ctx.lineTo(x + w + 2, bottom);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#450A0A';
  ctx.lineWidth = 3;
  ctx.stroke();
  // Flame decal down the side
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.moveTo(x + 6, bottom - 18);
  for (let i = 0; i < 4; i++) {
    ctx.quadraticCurveTo(x + 18 + i * 18, bottom - 34, x + 24 + i * 18, bottom - 22);
  }
  ctx.lineTo(x + 90, bottom - 12);
  ctx.lineTo(x + 6, bottom - 10);
  ctx.closePath();
  ctx.fill();

  // Tinted window with the driver (a goon in shades)
  ctx.fillStyle = '#1E3A5F';
  ctx.beginPath();
  ctx.moveTo(x + 8, top + 6);
  ctx.lineTo(x + 42, top + 6);
  ctx.lineTo(x + 54, top + 34);
  ctx.lineTo(x + 8, top + 34);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#0F172A';
  ctx.beginPath(); ctx.arc(x + 28, top + 22, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(x + 20, top + 28, 16, 6);
  ctx.fillStyle = '#111111';
  ctx.fillRect(x + 22, top + 19, 14, 4);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.beginPath();
  ctx.moveTo(x + 36, top + 8); ctx.lineTo(x + 41, top + 8); ctx.lineTo(x + 28, top + 32); ctx.lineTo(x + 23, top + 32);
  ctx.closePath();
  ctx.fill();
  // Mirror
  ctx.fillStyle = '#D1D5DB';
  ctx.fillRect(x + 50, top + 10, 4, 14);

  // Chrome grille, bumper and a blazing headlight
  ctx.fillStyle = '#E5E7EB';
  ctx.fillRect(x + w - 6, top + 50, 10, 30);
  ctx.strokeStyle = '#6B7280';
  ctx.lineWidth = 1;
  for (let gy = top + 53; gy < top + 80; gy += 5) { ctx.beginPath(); ctx.moveTo(x + w - 6, gy); ctx.lineTo(x + w + 4, gy); ctx.stroke(); }
  ctx.fillStyle = '#D1D5DB';
  ctx.fillRect(x + w - 10, bottom - 6, 18, 8);
  const beam = ctx.createLinearGradient(x + w, 0, x + w + 90, 0);
  beam.addColorStop(0, 'rgba(255, 244, 180, 0.55)');
  beam.addColorStop(1, 'rgba(255, 244, 180, 0)');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(x + w + 2, top + 44);
  ctx.lineTo(x + w + 90, top + 30);
  ctx.lineTo(x + w + 90, top + 76);
  ctx.lineTo(x + w + 2, top + 50);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#FEF08A';
  ctx.fillRect(x + w - 2, top + 43, 6, 8);

  // Plate
  ctx.fillStyle = '#F9FAFB';
  ctx.fillRect(x + w - 30, bottom - 20, 24, 10);
  ctx.fillStyle = '#111111';
  ctx.font = '5px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.fillText('D34L3R', x + w - 18, bottom - 12);
};

const drawWheel = (ctx: CanvasRenderingContext2D, x: number, y: number, spin: number, flat: boolean) => {
  ctx.fillStyle = '#111111';
  if (flat) {
    // Blown out: the tire slumps and flaps, the rim rides low
    ctx.beginPath(); ctx.ellipse(x, y + 8, WHEEL_R + 4, WHEEL_R * 0.55, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(x - WHEEL_R - 6, y + 10 + Math.sin(spin * 3) * 3, 10, 4);
    y += 6;
  } else {
    ctx.beginPath(); ctx.arc(x, y, WHEEL_R, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#9CA3AF';
  ctx.beginPath(); ctx.arc(x, y, WHEEL_R * 0.55, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#4B5563';
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i++) {
    const a = spin + (i * Math.PI * 2) / 5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * WHEEL_R * 0.5, y + Math.sin(a) * WHEEL_R * 0.5);
    ctx.stroke();
  }
  ctx.fillStyle = '#E5E7EB';
  ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
};
