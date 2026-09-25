// Oily Oscar's body (his launcher, cigarette and taser meter are drawn by ../oscarRenderer.ts).
// Drawn in the boss's local space (0,0 = his top-left corner).

import { Enemy } from '../../../types';

export const drawOscar = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const { width, height } = e;
  // 1. Industrial Grease Boots
  ctx.fillStyle = '#212121';
  ctx.fillRect(width * 0.16, height * 0.74, width * 0.28, height * 0.26);
  ctx.fillRect(width * 0.56, height * 0.74, width * 0.28, height * 0.26);

  // 2. Petroleum Boiler-Plate Torso
  ctx.fillStyle = '#3E2723';
  ctx.fillRect(width * 0.14, height * 0.36, width * 0.72, height * 0.40);
  ctx.strokeStyle = '#1A110F';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(width * 0.14, height * 0.36, width * 0.72, height * 0.40);

  // Brass Pressure Gauge & Pipe
  ctx.strokeStyle = '#D4AC0D';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width * 0.14, height * 0.50);
  ctx.lineTo(width * 0.86, height * 0.50);
  ctx.stroke();

  ctx.fillStyle = '#D4AC0D';
  ctx.beginPath();
  ctx.arc(width * 0.50, height * 0.50, width * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3E2723';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#F9E79F';
  ctx.beginPath();
  ctx.arc(width * 0.50, height * 0.50, width * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // Pressure needle
  ctx.strokeStyle = '#C0392B';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width * 0.50, height * 0.50);
  ctx.lineTo(width * 0.54, height * 0.44);
  ctx.stroke();

  // 3. Rusted Exhaust Smokestacks on Shoulders
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(width * 0.04, height * 0.16, width * 0.14, height * 0.26);
  ctx.strokeRect(width * 0.04, height * 0.16, width * 0.14, height * 0.26);
  ctx.fillRect(width * 0.82, height * 0.16, width * 0.14, height * 0.26);
  ctx.strokeRect(width * 0.82, height * 0.16, width * 0.14, height * 0.26);

  // Chugging black oily smoke clouds
  const smokeOff = (frame * 0.5) % 20;
  ctx.fillStyle = 'rgba(33, 33, 33, 0.6)';
  ctx.beginPath();
  ctx.arc(width * 0.11, height * 0.10 - smokeOff * 0.6, 5 + smokeOff * 0.3, 0, Math.PI * 2);
  ctx.arc(width * 0.89, height * 0.10 - smokeOff * 0.6, 5 + smokeOff * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // 4. Riveted Iron Welding Helmet
  ctx.fillStyle = '#3E2723';
  ctx.beginPath();
  ctx.moveTo(width * 0.25, height * 0.08);
  ctx.lineTo(width * 0.75, height * 0.08);
  ctx.lineTo(width * 0.78, height * 0.36);
  ctx.lineTo(width * 0.64, height * 0.42);
  ctx.lineTo(width * 0.36, height * 0.42);
  ctx.lineTo(width * 0.22, height * 0.36);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#1A110F';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Brass Rivets on Helmet
  ctx.fillStyle = '#D4AC0D';
  ctx.beginPath();
  ctx.arc(width * 0.28, height * 0.12, 2, 0, Math.PI * 2);
  ctx.arc(width * 0.72, height * 0.12, 2, 0, Math.PI * 2);
  ctx.arc(width * 0.26, height * 0.32, 2, 0, Math.PI * 2);
  ctx.arc(width * 0.74, height * 0.32, 2, 0, Math.PI * 2);
  ctx.fill();

  // 5. Glowing Amber Furnace Visor
  ctx.fillStyle = '#111111';
  ctx.fillRect(width * 0.28, height * 0.18, width * 0.44, height * 0.10);
  ctx.strokeStyle = '#D4AC0D';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(width * 0.28, height * 0.18, width * 0.44, height * 0.10);

  ctx.fillStyle = '#FF9800';
  ctx.shadowColor = '#FF9800';
  ctx.shadowBlur = 8;
  ctx.fillRect(width * 0.32, height * 0.20, width * 0.36, height * 0.06);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FFEB3B';
  ctx.fillRect(width * 0.35, height * 0.22, width * 0.30, height * 0.02);

  // 6. Heavy Steel Respirator Jaw dripping Crude
  ctx.fillStyle = '#263238';
  ctx.fillRect(width * 0.34, height * 0.30, width * 0.32, height * 0.10);
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(width * 0.34, height * 0.30, width * 0.32, height * 0.10);
  ctx.fillStyle = '#D4AC0D';
  ctx.beginPath();
  ctx.arc(width * 0.42, height * 0.35, 3, 0, Math.PI * 2);
  ctx.arc(width * 0.58, height * 0.35, 3, 0, Math.PI * 2);
  ctx.fill();

  // Black Oil Drips from Jaw
  ctx.fillStyle = '#111111';
  const dripY = (frame * 0.8) % 15;
  ctx.fillRect(width * 0.40, height * 0.40 + dripY, 3, 6);
  ctx.fillRect(width * 0.58, height * 0.40 + ((dripY + 7) % 15), 3, 6);
};
