// Hector Hurricane's sprite.
// Drawn in the boss's local space (0,0 = his top-left corner).

import { vortexSpin, vortexShape, vortexGripLevel } from '../../bosses/hector';
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

/**
 * The vortex round him during the hurricane (world space): a spinning funnel of
 * wind bands with debris whipping round it, dust churning at its base and air
 * rushing in from the sides. It darkens and flashes red as it gets its grip.
 */
export const drawHectorVortex = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const spin = vortexSpin(e);
  if (spin <= 0) return;
  const { cx, floor, top, radiusAt } = vortexShape(e);
  const grip = vortexGripLevel(e);
  const yanking = grip >= 1;
  const t = frame * 0.18;
  ctx.save();

  // Air rushing in from both sides
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 10; i++) {
    const side = i % 2 ? 1 : -1;
    const y = top + ((i * 37) % (floor - top));
    const prog = ((frame * (yanking ? 14 : 7) + i * 53) % 260) / 260;
    const x0 = cx + side * (380 - prog * 300);
    ctx.strokeStyle = `rgba(226, 232, 240, ${0.45 * prog * spin})`;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.quadraticCurveTo(x0 - side * 30, y + 6, x0 - side * 60, y + 2);
    ctx.stroke();
  }

  // Dust churning round the base
  for (let i = 0; i < 9; i++) {
    const a = t * 1.3 + i * 0.7;
    const r = radiusAt(floor - 6) + 14;
    ctx.fillStyle = `rgba(168, 162, 158, ${0.35 * spin})`;
    ctx.beginPath();
    ctx.ellipse(cx + Math.cos(a) * r, floor - 6 + Math.sin(a) * 4, 12 + (i % 3) * 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Spinning bands of wind stacked up the funnel
  const bands = 11;
  for (let b = 0; b < bands; b++) {
    const y = floor - (b + 0.5) * (floor - top) / bands;
    const r = radiusAt(y);
    const phase = t * (1.6 - b * 0.06) + b * 0.9;
    const tint = yanking && frame % 6 < 3 ? '248, 113, 113' : grip > 0.5 ? '203, 213, 225' : '226, 232, 240';
    // Back half, faint
    ctx.strokeStyle = `rgba(${tint}, ${0.18 * spin})`;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(cx, y, r, r * 0.22, 0, Math.PI + phase % 1, Math.PI * 2 - 0.3); ctx.stroke();
    // Front half, bold streaks that wrap round
    ctx.strokeStyle = `rgba(${tint}, ${(0.45 + grip * 0.25) * spin})`;
    ctx.lineWidth = 2.5 + grip * 1.5;
    for (let s2 = 0; s2 < 2; s2++) {
      const a0 = (phase + s2 * Math.PI) % (Math.PI * 2);
      ctx.beginPath(); ctx.ellipse(cx, y, r, r * 0.22, 0, a0, a0 + 1.4); ctx.stroke();
    }
  }

  // Debris whipping round it: leaves, grit and the odd turd
  for (let i = 0; i < 12; i++) {
    const y = top + 10 + ((i * 29) % (floor - top - 20));
    const r = radiusAt(y) * 0.95;
    const a = t * (2 + (i % 3) * 0.4) + i * 1.7;
    const depth = Math.sin(a); // behind him when negative
    const x = cx + Math.cos(a) * r;
    ctx.globalAlpha = spin * (depth < 0 ? 0.45 : 1);
    ctx.fillStyle = i % 4 === 0 ? '#5D4037' : i % 4 === 1 ? '#4CAF50' : i % 4 === 2 ? '#8D6E63' : '#9E9E9E';
    ctx.save();
    ctx.translate(x, y + depth * r * 0.2);
    ctx.rotate(a * 2);
    if (i % 4 === 0) { ctx.beginPath(); ctx.ellipse(0, 0, 6, 3, 0, 0, Math.PI * 2); ctx.fill(); }
    else ctx.fillRect(-3, -2, 6 + (i % 3), 4);
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  // The rim flares as it gets its grip, and strobes once it's yanking you in
  if (grip > 0.3) {
    const r = radiusAt(top);
    ctx.strokeStyle = yanking ? (frame % 6 < 3 ? 'rgba(239, 68, 68, 0.9)' : 'rgba(255, 255, 255, 0.8)') : `rgba(248, 250, 252, ${grip * 0.6})`;
    ctx.lineWidth = yanking ? 4 : 2;
    ctx.beginPath(); ctx.ellipse(cx, top, r, r * 0.22, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
};
