// Toxic Tommy's sprite.
// Drawn in the boss's local space (0,0 = his top-left corner).

import { Enemy } from '../../../types';

export const drawTommy = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const { width, height } = e;
  const isSubmerged = e.bossState === 'submerged_chase' || e.bossState === 'telegraph_emerge' || e.bossState === 'dive_in_sludge';
  const isPukingClose = e.bossState === 'puke_closing_in';
  const isPukingFar = e.bossState === 'puke_going_outward';
  const isPuking = isPukingClose || isPukingFar;
  const isWeaknessStunned = e.bossState === 'weakness_stunned';
  const isExhausted = e.bossState === 'vulnerable_idle' || isWeaknessStunned;

  if (isSubmerged) {
    // Submerged in the sludge: show Tommy's actual body underneath enveloped in a pulsating filth shield!
    ctx.save();

    // 1. Draw Tommy's body underneath (dimmed/sludge-tinted)
    ctx.save();
    ctx.globalAlpha = 0.85;

    // Back tank
    ctx.fillStyle = '#4B5563';
    ctx.fillRect(width * 0.05, height * 0.2, width * 0.2, height * 0.5);
    ctx.fillStyle = '#166534';
    ctx.fillRect(width * 0.07, height * 0.25, width * 0.16, height * 0.4);

    // Bloated mutant body & torso
    ctx.fillStyle = '#145A32';
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.55, width * 0.38, height * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0B3B17';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Glowing predatory mutant eyes glowing through the muck
    ctx.fillStyle = '#FFFF00';
    ctx.shadowColor = '#ADFF2F';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(width * 0.42, height * 0.35, 6, 0, Math.PI * 2);
    ctx.arc(width * 0.62, height * 0.35, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(width * 0.44, height * 0.35, 2.5, 0, Math.PI * 2);
    ctx.arc(width * 0.64, height * 0.35, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Dorsal mutated spines cutting upward
    ctx.fillStyle = '#0F3818';
    ctx.beginPath();
    ctx.moveTo(width * 0.25, height * 0.25);
    ctx.lineTo(width * 0.35, -8);
    ctx.lineTo(width * 0.45, height * 0.25);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.25);
    ctx.lineTo(width * 0.65, -14);
    ctx.lineTo(width * 0.75, height * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2. The Filth Shield: pulsating biohazard toxic barrier surrounding his entire silhouette
    const pulse = Math.sin(frame * 0.12) * 6;
    const shieldRadiusX = width * 0.62 + pulse;
    const shieldRadiusY = height * 0.55 + pulse * 0.6;
    const shieldCenterX = width * 0.5;
    const shieldCenterY = height * 0.5;

    // Outer toxic aura glow
    const shieldGrad = ctx.createRadialGradient(
      shieldCenterX, shieldCenterY, width * 0.2,
      shieldCenterX, shieldCenterY, shieldRadiusX + 12
    );
    shieldGrad.addColorStop(0, 'rgba(39, 174, 96, 0.1)');
    shieldGrad.addColorStop(0.5, 'rgba(46, 204, 113, 0.35)');
    shieldGrad.addColorStop(0.85, 'rgba(173, 255, 47, 0.6)');
    shieldGrad.addColorStop(1, 'rgba(173, 255, 47, 0.0)');

    ctx.fillStyle = shieldGrad;
    ctx.beginPath();
    ctx.ellipse(shieldCenterX, shieldCenterY, shieldRadiusX + 10, shieldRadiusY + 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Thick protective filth crust ring
    ctx.strokeStyle = '#2ECC71';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#ADFF2F';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.ellipse(shieldCenterX, shieldCenterY, shieldRadiusX, shieldRadiusY, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Inner high-voltage toxic barrier ring
    ctx.strokeStyle = '#ADFF2F';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(shieldCenterX, shieldCenterY, shieldRadiusX - 8, shieldRadiusY - 6, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Swirling filth chunks orbiting the barrier
    const chunkCount = 6;
    for (let i = 0; i < chunkCount; i++) {
      const angle = (frame * 0.05) + (i * ((Math.PI * 2) / chunkCount));
      const cx = shieldCenterX + Math.cos(angle) * (shieldRadiusX - 2);
      const cy = shieldCenterY + Math.sin(angle) * (shieldRadiusY - 2);
      const cSize = 4 + (i % 3) * 2;
      ctx.fillStyle = i % 2 === 0 ? '#196F3D' : '#85929E';
      ctx.beginPath();
      ctx.arc(cx, cy, cSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ADFF2F';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Electric bio-arcs crackling across the shield
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#ADFF2F';
    ctx.shadowBlur = 6;
    for (let a = 0; a < 3; a++) {
      const arcAngle = (frame * 0.08 + a * 2.1) % (Math.PI * 2);
      const startX = shieldCenterX + Math.cos(arcAngle) * (shieldRadiusX - 6);
      const startY = shieldCenterY + Math.sin(arcAngle) * (shieldRadiusY - 4);
      const midX = shieldCenterX + Math.cos(arcAngle + 0.3) * (shieldRadiusX + 4);
      const midY = shieldCenterY + Math.sin(arcAngle + 0.3) * (shieldRadiusY + 3);
      const endX = shieldCenterX + Math.cos(arcAngle + 0.6) * (shieldRadiusX - 6);
      const endY = shieldCenterY + Math.sin(arcAngle + 0.6) * (shieldRadiusY - 4);

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(midX, midY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    ctx.restore();
    return;
  }

  // When Tommy is emerging, puking, or vulnerable:
  // Sludge geyser beneath him if puking or emerged
  if (isPuking || e.bossState === 'emerge_shatter' || isExhausted) {
    ctx.save();
    // Toxic sludge spout/column lifting Tommy
    ctx.fillStyle = '#27AE60';
    ctx.beginPath();
    ctx.moveTo(width * 0.15, height);
    ctx.lineTo(width * 0.85, height);
    ctx.lineTo(width * 0.95, height + 80);
    ctx.lineTo(width * 0.05, height + 80);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#2ECC71';
    ctx.beginPath();
    ctx.ellipse(width / 2, height + 10, width * 0.4, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Bloated mutant body
  ctx.save();
  if (isExhausted) {
    // Flashing vulnerability outline
    const flash = Math.sin(frame * 0.3) > 0;
    if (flash) {
      ctx.shadowColor = '#FFFF00';
      ctx.shadowBlur = 15;
    }
  }

  // Hazard suit back tank
  ctx.fillStyle = '#7F8C8D';
  ctx.fillRect(width * 0.05, height * 0.2, width * 0.2, height * 0.5);
  ctx.fillStyle = '#2ECC71';
  ctx.fillRect(width * 0.07, height * 0.25, width * 0.16, height * 0.4);
  // Sludge level inside glass tank
  const tankSludge = Math.sin(frame * 0.1) * 4;
  ctx.fillStyle = '#ADFF2F';
  ctx.fillRect(width * 0.07, height * 0.4 + tankSludge, width * 0.16, height * 0.25 - tankSludge);

  // Bloated belly & torso
  ctx.fillStyle = '#1E8449';
  ctx.beginPath();
  const bellyBulge = isPuking ? Math.sin(frame * 0.6) * 6 : 0;
  ctx.ellipse(width * 0.5 + bellyBulge, height * 0.55, width * 0.38, height * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#145A32';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Biohazard Acid Canister on Shoulder
  ctx.fillStyle = '#374151';
  ctx.fillRect(width * 0.08, height * 0.18, 14, 26);
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(width * 0.08, height * 0.18, 14, 26);
  ctx.fillStyle = '#2ECC71';
  ctx.fillRect(width * 0.10, height * 0.24, 10, 18);
  ctx.fillStyle = '#ADFF2F';
  ctx.fillRect(width * 0.10, height * 0.27, 10, 15);
  if (frame % 14 < 7) {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(width * 0.10 + 5, height * 0.26, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Torn yellow hazard suit remnants
  ctx.fillStyle = '#F1C40F';
  ctx.beginPath();
  ctx.moveTo(width * 0.2, height * 0.35);
  ctx.lineTo(width * 0.4, height * 0.45);
  ctx.lineTo(width * 0.3, height * 0.7);
  ctx.lineTo(width * 0.15, height * 0.6);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(width * 0.8, height * 0.35);
  ctx.lineTo(width * 0.6, height * 0.45);
  ctx.lineTo(width * 0.7, height * 0.7);
  ctx.lineTo(width * 0.85, height * 0.6);
  ctx.closePath();
  ctx.fill();

  // Toxic veins & boils on body
  ctx.fillStyle = '#ADFF2F';
  ctx.beginPath();
  ctx.arc(width * 0.45, height * 0.55, 6, 0, Math.PI * 2);
  ctx.arc(width * 0.62, height * 0.65, 8, 0, Math.PI * 2);
  ctx.arc(width * 0.38, height * 0.72, 5, 0, Math.PI * 2);
  ctx.fill();

  // Head & mutated jaw
  const pukeFacing = e.pukeDir || 1;
  ctx.fillStyle = '#27AE60';
  const headY = isPuking ? height * 0.18 : height * 0.22;
  const headCenterX = isPuking ? (pukeFacing > 0 ? width * 0.58 : width * 0.42) : width * 0.55;
  ctx.beginPath();
  ctx.ellipse(headCenterX, headY, width * 0.3, height * 0.22, isPuking ? (pukeFacing > 0 ? -0.2 : 0.2) : 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Eyes
  if (isExhausted) {
    // Dizzy X eyes
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width * 0.45, headY - 8); ctx.lineTo(width * 0.55, headY + 2);
    ctx.moveTo(width * 0.55, headY - 8); ctx.lineTo(width * 0.45, headY + 2);
    ctx.moveTo(width * 0.65, headY - 8); ctx.lineTo(width * 0.75, headY + 2);
    ctx.moveTo(width * 0.75, headY - 8); ctx.lineTo(width * 0.65, headY + 2);
    ctx.stroke();
  } else {
    // Bloodshot yellow eyes
    ctx.fillStyle = '#F4D03F';
    ctx.beginPath();
    const eye1X = pukeFacing > 0 ? width * 0.5 : width * 0.3;
    const eye2X = pukeFacing > 0 ? width * 0.7 : width * 0.5;
    ctx.arc(eye1X, headY - 4, 7, 0, Math.PI * 2);
    ctx.arc(eye2X, headY - 4, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#C0392B';
    ctx.beginPath();
    ctx.arc(eye1X + 2 * pukeFacing, headY - 4, 3, 0, Math.PI * 2);
    ctx.arc(eye2X + 2 * pukeFacing, headY - 4, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouth & Puking Animation
  if (isPuking) {
    // Gaping spewing jaw facing pukeDir
    const mouthCenterX = pukeFacing > 0 ? width * 0.68 : width * 0.32;
    ctx.fillStyle = '#196F3D';
    ctx.beginPath();
    ctx.ellipse(mouthCenterX, headY + 14, 14, 18, pukeFacing * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Chunky toxic vomit stream exiting mouth
    ctx.fillStyle = '#ADFF2F';
    ctx.beginPath();
    ctx.arc(mouthCenterX + pukeFacing * 6, headY + 16, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2ECC71';
    ctx.beginPath();
    ctx.arc(mouthCenterX + pukeFacing * 14, headY + 20, 10, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Grinning jagged teeth with green drool
    ctx.fillStyle = '#111';
    ctx.fillRect(width * 0.48, headY + 10, width * 0.28, 8);
    ctx.fillStyle = '#ADFF2F';
    ctx.fillRect(width * 0.52, headY + 16, 4, 12);
  }

  // Exhausted stars
  if (isExhausted) {
    const starCount = 3;
    for (let i = 0; i < starCount; i++) {
      const angle = (frame * 0.08) + (i * ((Math.PI * 2) / starCount));
      const sx = Math.cos(angle) * 35 + width / 2;
      const sy = Math.sin(angle * 0.6) * 10 - 15;
      ctx.fillStyle = '#FFFF00';
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (e.isOiled || isWeaknessStunned) {
    // Dark crude oil running down Tommy
    ctx.save();
    ctx.fillStyle = '#111111';
    ctx.fillRect(width * 0.35, height * 0.3, 6, 25);
    ctx.fillRect(width * 0.55, height * 0.35, 8, 30);
    ctx.fillRect(width * 0.72, height * 0.4, 5, 20);
    ctx.fillStyle = '#222222';
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.6, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
};
