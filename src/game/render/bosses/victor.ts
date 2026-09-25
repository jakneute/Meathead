// Victor Volcano's sprite.
// Drawn in the boss's local space (0,0 = his top-left corner).

import { Enemy } from '../../../types';

export const drawVictor = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const { width, height } = e;
  const lOff = (e.bossState === 'attacking' || e.bossState === 'telegraphing') ? Math.sin(frame * 0.5) * 6 : 0;
  const isTelegraph = e.bossState === 'telegraphing' || e.bossState === 'attacking';

  // 1. Basalt Obsidian Greaves / Legs
  ctx.fillStyle = '#1A0A07';
  ctx.fillRect(width * 0.15, height * 0.72, width * 0.3, height * 0.28);
  ctx.fillRect(width * 0.55, height * 0.72, width * 0.3, height * 0.28);
  ctx.fillStyle = '#BA4A00';
  ctx.fillRect(width * 0.18, height * 0.78, width * 0.24, height * 0.06);
  ctx.fillRect(width * 0.58, height * 0.78, width * 0.24, height * 0.06);

  // 2. Heavy Volcanic Basalt Torso
  ctx.fillStyle = '#261614';
  ctx.fillRect(width * 0.16, height * 0.36 + lOff * 0.5, width * 0.68, height * 0.38);
  ctx.strokeStyle = '#C62828';
  ctx.lineWidth = 2;
  ctx.strokeRect(width * 0.16, height * 0.36 + lOff * 0.5, width * 0.68, height * 0.38);

  // 3. Pulsing Molten Core / Chest Fissures
  const corePulse = Math.sin(frame * 0.2) * 3;
  ctx.fillStyle = isTelegraph ? '#FFEB3B' : '#FF5722';
  ctx.shadowColor = '#FF5722';
  ctx.shadowBlur = isTelegraph ? 12 : 6;
  ctx.beginPath();
  ctx.moveTo(width * 0.5, height * 0.40 + lOff * 0.5);
  ctx.lineTo(width * 0.64, height * 0.52 + lOff * 0.5 + corePulse);
  ctx.lineTo(width * 0.5, height * 0.66 + lOff * 0.5);
  ctx.lineTo(width * 0.36, height * 0.52 + lOff * 0.5 + corePulse);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  // Core yellow center
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(width * 0.46, height * 0.49 + lOff * 0.5, width * 0.08, height * 0.06);

  // 4. Cracked Magma Shoulders / Basalt Boulders
  ctx.fillStyle = '#1A0A07';
  ctx.beginPath();
  ctx.arc(width * 0.14, height * 0.38 + lOff * 0.5, width * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FF5722';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(width * 0.86, height * 0.38 + lOff * 0.5, width * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 5. Volcanic Rock Head
  ctx.fillStyle = '#3E1A11';
  ctx.beginPath();
  ctx.arc(width * 0.5, height * 0.25 + lOff, width * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#C62828';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 6. Obsidian Chimney Horns & Smoke
  ctx.fillStyle = '#1A0A07';
  ctx.beginPath();
  ctx.moveTo(width * 0.32, height * 0.16 + lOff);
  ctx.lineTo(width * 0.18, -height * 0.04 + lOff);
  ctx.lineTo(width * 0.40, height * 0.10 + lOff);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#FF5722';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width * 0.68, height * 0.16 + lOff);
  ctx.lineTo(width * 0.82, -height * 0.04 + lOff);
  ctx.lineTo(width * 0.60, height * 0.10 + lOff);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Chimney smoke puffs
  ctx.fillStyle = 'rgba(93, 64, 55, 0.6)';
  ctx.beginPath();
  ctx.arc(width * 0.18, -height * 0.08 + lOff + Math.sin(frame * 0.1) * 2, 4, 0, Math.PI * 2);
  ctx.arc(width * 0.82, -height * 0.08 + lOff + Math.cos(frame * 0.1) * 2, 4, 0, Math.PI * 2);
  ctx.fill();

  // 7. Magma Forehead Crack
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width * 0.48, height * 0.08 + lOff);
  ctx.lineTo(width * 0.52, height * 0.16 + lOff);
  ctx.lineTo(width * 0.46, height * 0.20 + lOff);
  ctx.stroke();

  // 8. Blazing Molten-Gold Eyes
  ctx.fillStyle = '#FFD700';
  ctx.shadowColor = '#FF3D00';
  ctx.shadowBlur = 8;
  ctx.fillRect(width * 0.36, height * 0.22 + lOff, width * 0.09, height * 0.05);
  ctx.fillRect(width * 0.55, height * 0.22 + lOff, width * 0.09, height * 0.05);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(width * 0.39, height * 0.23 + lOff, width * 0.03, height * 0.03);
  ctx.fillRect(width * 0.58, height * 0.23 + lOff, width * 0.03, height * 0.03);

  // 9. Molten Magma Jaw
  ctx.fillStyle = '#1A0A07';
  ctx.fillRect(width * 0.36, height * 0.31 + lOff, width * 0.28, height * 0.07);
  ctx.fillStyle = '#FF5722';
  ctx.fillRect(width * 0.39, height * 0.32 + lOff, width * 0.05, height * 0.04);
  ctx.fillRect(width * 0.48, height * 0.32 + lOff, width * 0.05, height * 0.04);
  ctx.fillRect(width * 0.56, height * 0.32 + lOff, width * 0.05, height * 0.04);
};
