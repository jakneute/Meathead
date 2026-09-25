// Hector Hurricane's sprite.
// Drawn in the boss's local space (0,0 = his top-left corner).

import { Enemy } from '../../../types';

export const drawHector = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const { width, height } = e;
  // 1. Aviator Boots / Greaves
  ctx.fillStyle = '#0E4B40';
  ctx.fillRect(width * 0.20, height * 0.72, width * 0.26, height * 0.28);
  ctx.fillRect(width * 0.54, height * 0.72, width * 0.26, height * 0.28);

  // 2. Aerodynamic Storm Commando Torso
  ctx.fillStyle = '#16A085';
  ctx.fillRect(width * 0.20, height * 0.36, width * 0.60, height * 0.38);
  ctx.strokeStyle = '#0E4B40';
  ctx.lineWidth = 2;
  ctx.strokeRect(width * 0.20, height * 0.36, width * 0.60, height * 0.38);

  // Central Turbine Rotor
  ctx.fillStyle = '#34495E';
  ctx.beginPath();
  ctx.arc(width * 0.5, height * 0.52, width * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#00FFFF';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Spinning turbine blades
  const rotAngle = frame * 0.2;
  ctx.strokeStyle = '#00FFFF';
  ctx.lineWidth = 1.5;
  for (let b = 0; b < 4; b++) {
    const a = rotAngle + (b * Math.PI) / 2;
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.52);
    ctx.lineTo(width * 0.5 + Math.cos(a) * width * 0.10, height * 0.52 + Math.sin(a) * width * 0.10);
    ctx.stroke();
  }

  // 3. Shoulder Turbine Thrusters
  ctx.fillStyle = '#117A65';
  ctx.beginPath();
  ctx.arc(width * 0.16, height * 0.40, width * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0E4B40';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#00FFFF';
  ctx.beginPath();
  ctx.arc(width * 0.16, height * 0.40, width * 0.05, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#117A65';
  ctx.beginPath();
  ctx.arc(width * 0.84, height * 0.40, width * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0E4B40';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#00FFFF';
  ctx.beginPath();
  ctx.arc(width * 0.84, height * 0.40, width * 0.05, 0, Math.PI * 2);
  ctx.fill();

  // 4. Fluttering Pilot Scarf
  ctx.fillStyle = '#F39C12';
  ctx.beginPath();
  ctx.ellipse(width * 0.5, height * 0.35, width * 0.28, height * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  // Fluttering tail
  const scarfWave = Math.sin(frame * 0.3) * 6;
  ctx.beginPath();
  ctx.moveTo(width * 0.65, height * 0.35);
  ctx.lineTo(width * 0.90, height * 0.38 + scarfWave);
  ctx.lineTo(width * 0.85, height * 0.45 + scarfWave);
  ctx.lineTo(width * 0.60, height * 0.40);
  ctx.closePath();
  ctx.fill();

  // 5. Aviator Helmet & Cowl
  ctx.fillStyle = '#16A085';
  ctx.beginPath();
  ctx.arc(width * 0.5, height * 0.24, width * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0E4B40';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Aerodynamic Wing Fins
  ctx.fillStyle = '#48C9B0';
  ctx.beginPath();
  ctx.moveTo(width * 0.30, height * 0.20);
  ctx.lineTo(width * 0.12, height * 0.12);
  ctx.lineTo(width * 0.28, height * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width * 0.70, height * 0.20);
  ctx.lineTo(width * 0.88, height * 0.12);
  ctx.lineTo(width * 0.72, height * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 6. Face
  ctx.fillStyle = '#F5CBA7';
  ctx.fillRect(width * 0.35, height * 0.24, width * 0.30, height * 0.10);

  // 7. Glowing Cyan Aviator Goggles
  ctx.fillStyle = '#2C3E50';
  ctx.fillRect(width * 0.28, height * 0.18, width * 0.44, height * 0.09);
  ctx.fillStyle = '#00FFFF';
  ctx.shadowColor = '#00FFFF';
  ctx.shadowBlur = 6;
  ctx.fillRect(width * 0.31, height * 0.20, width * 0.17, height * 0.06);
  ctx.fillRect(width * 0.52, height * 0.20, width * 0.17, height * 0.06);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#E0F7FA';
  ctx.fillRect(width * 0.33, height * 0.21, width * 0.05, height * 0.03);
  ctx.fillRect(width * 0.54, height * 0.21, width * 0.05, height * 0.03);

  // 8. Cocky Smirk
  ctx.strokeStyle = '#78281F';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width * 0.42, height * 0.31);
  ctx.quadraticCurveTo(width * 0.52, height * 0.34, width * 0.58, height * 0.29);
  ctx.stroke();

  // Hurricane weather animations
  if (e.bossState === 'hurricane') {
     ctx.save();
     ctx.translate(width/2, height/2);

     // Rain
     ctx.strokeStyle = 'rgba(200, 255, 255, 0.6)';
     ctx.lineWidth = 1;
     for (let i = 0; i < 8; i++) {
        const rx = (Math.random() - 0.5) * 300;
        const ry = (Math.random() - 0.5) * 300;
        const len = 20 + Math.random() * 30;
        const inward = rx < 0 ? 1 : -1; // blown in toward the eye of the storm
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + inward * len, ry + len/2);
        ctx.stroke();
     }

     // Lightning
     if (Math.random() > 0.7) {
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#FFFF00';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        let lx = (Math.random() - 0.5) * 150;
        let ly = (Math.random() - 0.5) * 150;
        ctx.moveTo(lx, ly);
        for(let j=0; j<4; j++) {
            lx += (Math.random() - 0.5) * 40;
            ly += (Math.random() - 0.5) * 40;
            ctx.lineTo(lx, ly);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
     }
     ctx.restore();
  }
};
