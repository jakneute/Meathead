// Artie Avalanche's sprite.
// Drawn in the boss's local space (0,0 = his top-left corner).

import { Enemy } from '../../../types';

export const drawArtie = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const { width, height } = e;
  // 1. Ice-crusted Boots / Greaves
  ctx.fillStyle = '#1B4F72';
  ctx.fillRect(width * 0.15, height * 0.72, width * 0.3, height * 0.28);
  ctx.fillRect(width * 0.55, height * 0.72, width * 0.3, height * 0.28);
  ctx.fillStyle = '#5DADE2';
  ctx.fillRect(width * 0.12, height * 0.88, width * 0.35, height * 0.12);
  ctx.fillRect(width * 0.53, height * 0.88, width * 0.35, height * 0.12);

  // 2. Heavy Cryo Torso & Ice Rune Armor
  ctx.fillStyle = '#1B4F72';
  ctx.fillRect(width * 0.18, height * 0.38, width * 0.64, height * 0.38);
  ctx.strokeStyle = '#0B2027';
  ctx.lineWidth = 2;
  ctx.strokeRect(width * 0.18, height * 0.38, width * 0.64, height * 0.38);
  // Glacier chestplate rune
  ctx.fillStyle = '#5DADE2';
  ctx.beginPath();
  ctx.moveTo(width * 0.5, height * 0.42);
  ctx.lineTo(width * 0.65, height * 0.55);
  ctx.lineTo(width * 0.5, height * 0.68);
  ctx.lineTo(width * 0.35, height * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#EBF5FB';
  ctx.fillRect(width * 0.46, height * 0.51, width * 0.08, height * 0.08);

  // 3. Spiked Crystalline Ice Shoulders / Pauldrons
  ctx.fillStyle = '#2E86C1';
  ctx.beginPath();
  ctx.moveTo(width * 0.18, height * 0.38);
  ctx.lineTo(width * 0.02, height * 0.22);
  ctx.lineTo(width * 0.22, height * 0.26);
  ctx.lineTo(width * 0.28, height * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#EBF5FB';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#2E86C1';
  ctx.beginPath();
  ctx.moveTo(width * 0.82, height * 0.38);
  ctx.lineTo(width * 0.98, height * 0.22);
  ctx.lineTo(width * 0.78, height * 0.26);
  ctx.lineTo(width * 0.72, height * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. White Fur-Lined Hood Collar
  ctx.fillStyle = '#E5E8E8';
  ctx.beginPath();
  ctx.ellipse(width * 0.5, height * 0.36, width * 0.38, height * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#BDC3C7';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 5. Frost-Blue Head & Face
  ctx.fillStyle = '#90CAF9';
  ctx.beginPath();
  ctx.arc(width * 0.5, height * 0.26, width * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#154360';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 6. Glacier Crown / Ice Horns
  ctx.fillStyle = '#2E86C1';
  ctx.beginPath();
  ctx.moveTo(width * 0.34, height * 0.18);
  ctx.lineTo(width * 0.16, -height * 0.05);
  ctx.lineTo(width * 0.42, height * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#EBF5FB';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width * 0.66, height * 0.18);
  ctx.lineTo(width * 0.84, -height * 0.05);
  ctx.lineTo(width * 0.58, height * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Central crystal crest
  ctx.fillStyle = '#5DADE2';
  ctx.beginPath();
  ctx.moveTo(width * 0.44, height * 0.14);
  ctx.lineTo(width * 0.5, -height * 0.02);
  ctx.lineTo(width * 0.56, height * 0.14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 7. Frosty White Eyebrows
  ctx.fillStyle = '#EBF5FB';
  ctx.fillRect(width * 0.32, height * 0.20, width * 0.16, height * 0.04);
  ctx.fillRect(width * 0.52, height * 0.20, width * 0.16, height * 0.04);

  // 8. Glowing Cold Cyan Eyes
  ctx.fillStyle = '#00FFFF';
  ctx.shadowColor = '#00FFFF';
  ctx.shadowBlur = 6;
  ctx.fillRect(width * 0.36, height * 0.24, width * 0.09, height * 0.05);
  ctx.fillRect(width * 0.55, height * 0.24, width * 0.09, height * 0.05);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(width * 0.39, height * 0.25, width * 0.03, height * 0.03);
  ctx.fillRect(width * 0.58, height * 0.25, width * 0.03, height * 0.03);

  // 9. Menacing Snarl & Sharp Teeth
  ctx.fillStyle = '#154360';
  ctx.fillRect(width * 0.38, height * 0.32, width * 0.24, height * 0.06);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(width * 0.40, height * 0.32, width * 0.04, height * 0.03);
  ctx.fillRect(width * 0.48, height * 0.32, width * 0.04, height * 0.03);
  ctx.fillRect(width * 0.56, height * 0.32, width * 0.04, height * 0.03);

  // 10. Frost Breath Particle
  if (frame % 20 < 10) {
    ctx.fillStyle = 'rgba(235, 245, 251, 0.6)';
    ctx.beginPath();
    ctx.arc(width * 0.68 + (frame % 10), height * 0.34, 3, 0, Math.PI * 2);
    ctx.fill();
  }
};
