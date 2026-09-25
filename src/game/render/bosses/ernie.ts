// Ernie Earthquake's sprite.
// Drawn in the boss's local space (0,0 = his top-left corner).

import { Enemy } from '../../../types';

export const drawErnie = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const { width, height } = e;
  // 1. Bedrock Column Legs
  ctx.fillStyle = '#3E2723';
  ctx.fillRect(width * 0.12, height * 0.70, width * 0.32, height * 0.30);
  ctx.fillRect(width * 0.56, height * 0.70, width * 0.32, height * 0.30);
  ctx.strokeStyle = '#271B17';
  ctx.lineWidth = 2;
  ctx.strokeRect(width * 0.12, height * 0.70, width * 0.32, height * 0.30);
  ctx.strokeRect(width * 0.56, height * 0.70, width * 0.32, height * 0.30);

  // 2. Colossal Bedrock Torso with Geological Strata
  ctx.fillStyle = '#6E2C00';
  ctx.fillRect(width * 0.12, height * 0.35, width * 0.76, height * 0.38);
  ctx.strokeStyle = '#3E2723';
  ctx.lineWidth = 2;
  ctx.strokeRect(width * 0.12, height * 0.35, width * 0.76, height * 0.38);
  // Strata layer bands
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(width * 0.14, height * 0.46, width * 0.72, height * 0.08);
  ctx.fillStyle = '#4E342E';
  ctx.fillRect(width * 0.14, height * 0.58, width * 0.72, height * 0.06);

  // Faultline Gold Fissure on chest
  ctx.strokeStyle = '#FFB300';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width * 0.45, height * 0.38);
  ctx.lineTo(width * 0.52, height * 0.48);
  ctx.lineTo(width * 0.46, height * 0.56);
  ctx.lineTo(width * 0.54, height * 0.65);
  ctx.stroke();

  // 3. Layered Bedrock Shoulder Slabs
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(-width * 0.02, height * 0.28, width * 0.22, height * 0.24);
  ctx.strokeRect(-width * 0.02, height * 0.28, width * 0.22, height * 0.24);
  ctx.fillRect(width * 0.80, height * 0.28, width * 0.22, height * 0.24);
  ctx.strokeRect(width * 0.80, height * 0.28, width * 0.22, height * 0.24);

  // 4. Chiseled Stone Head
  ctx.fillStyle = '#795548';
  ctx.fillRect(width * 0.24, height * 0.08, width * 0.52, height * 0.30);
  ctx.strokeStyle = '#3E2723';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(width * 0.24, height * 0.08, width * 0.52, height * 0.30);

  // 5. Tectonic Plate Helmet Crest
  ctx.fillStyle = '#4E342E';
  ctx.beginPath();
  ctx.moveTo(width * 0.22, height * 0.10);
  ctx.lineTo(width * 0.5, -height * 0.02);
  ctx.lineTo(width * 0.78, height * 0.10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#271B17';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#8D6E63';
  ctx.fillRect(width * 0.44, height * 0.02, width * 0.12, height * 0.06);

  // 6. Heavy Stone Brow Ridge
  ctx.fillStyle = '#3E2723';
  ctx.fillRect(width * 0.28, height * 0.16, width * 0.44, height * 0.05);

  // 7. Glowing Amber Tectonic Eyes
  ctx.fillStyle = '#FFB300';
  ctx.shadowColor = '#FFB300';
  ctx.shadowBlur = 6;
  ctx.fillRect(width * 0.34, height * 0.22, width * 0.10, height * 0.05);
  ctx.fillRect(width * 0.56, height * 0.22, width * 0.10, height * 0.05);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FFF8E1';
  ctx.fillRect(width * 0.37, height * 0.23, width * 0.04, height * 0.03);
  ctx.fillRect(width * 0.59, height * 0.23, width * 0.04, height * 0.03);

  // 8. Colossal Granite Sledge-Jaw & Blocky Teeth
  ctx.fillStyle = '#4E342E';
  ctx.fillRect(width * 0.30, height * 0.28, width * 0.40, height * 0.09);
  ctx.strokeStyle = '#271B17';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(width * 0.30, height * 0.28, width * 0.40, height * 0.09);
  ctx.fillStyle = '#D7CCC8';
  ctx.fillRect(width * 0.34, height * 0.30, width * 0.06, height * 0.05);
  ctx.fillRect(width * 0.42, height * 0.30, width * 0.06, height * 0.05);
  ctx.fillRect(width * 0.52, height * 0.30, width * 0.06, height * 0.05);
  ctx.fillRect(width * 0.60, height * 0.30, width * 0.06, height * 0.05);

  // Stunned drop dizzy cracks
  if (e.bossState === 'stunned_drop') {
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.3, height * 0.15);
    ctx.lineTo(width * 0.4, height * 0.25);
    ctx.lineTo(width * 0.35, height * 0.3);
    ctx.stroke();
  }
};
