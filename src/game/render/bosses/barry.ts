// Blackout Barry's sprite.
// Drawn in the boss's local space (0,0 = his top-left corner).

import { Enemy } from '../../../types';

export const drawBarry = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const { width, height } = e;
  const isTeleporting = e.bossState === 'blackout_teleport';
  const isTelegraphing = e.bossState === 'telegraphing';
  const isGroundPound = e.bossState === 'ground_pound';
  const isLightning = e.bossState === 'lightning_storm';
  const isExhausted = e.bossState === 'exhausted';

  const _α = isTeleporting ? Math.abs(Math.sin(frame * 0.4)) : 1.0;
  ctx.globalAlpha = _α;

  if (isExhausted) {
    // Drawing stars floating above head in a halo
    ctx.save();
    const starCount = 3;
    for (let i = 0; i < starCount; i++) {
      const angle = (frame * 0.08) + (i * ((Math.PI * 2) / starCount));
      const sx = Math.cos(angle) * 32 + width / 2;
      const sy = Math.sin(angle * 0.6) * 8 - 14; // Floating directly above head

      ctx.fillStyle = '#ffff00';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ffff00';
      ctx.beginPath();
      const spikes = 5;
      const outerRadius = 8;
      const innerRadius = 3;
      for (let j = 0; j < spikes * 2; j++) {
        const r = j % 2 === 0 ? outerRadius : innerRadius;
        const a = (j * Math.PI) / spikes;
        ctx.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Shadow cloak / Hood with High-Voltage Tesla Coils
  ctx.fillStyle = '#0a0510';
  ctx.beginPath();
  if (isExhausted) {
    // Hunched
    ctx.moveTo(width * 0.5, height * 0.4);
    ctx.lineTo(0, height);
    ctx.lineTo(width, height);
  } else {
    ctx.moveTo(width * 0.5, 0); 
    ctx.quadraticCurveTo(width * 0.2, 0, width * 0.1, height * 0.3); 
    ctx.lineTo(0, height); 
    ctx.lineTo(width, height); 
    ctx.lineTo(width * 0.9, height * 0.3); 
    ctx.quadraticCurveTo(width * 0.8, 0, width * 0.5, 0); 
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#2E1A47';
  ctx.lineWidth = 2;
  ctx.stroke();

  // High-voltage ceramic insulator coils on shoulders
  if (!isExhausted) {
    ctx.fillStyle = '#34495E';
    ctx.fillRect(width * 0.08, height * 0.32, 10, 16);
    ctx.fillRect(width * 0.82, height * 0.32, 10, 16);
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 1;
    ctx.strokeRect(width * 0.08, height * 0.32, 10, 16);
    ctx.strokeRect(width * 0.82, height * 0.32, 10, 16);
    ctx.beginPath();
    ctx.moveTo(width * 0.08, height * 0.37); ctx.lineTo(width * 0.08 + 10, height * 0.37);
    ctx.moveTo(width * 0.08, height * 0.43); ctx.lineTo(width * 0.08 + 10, height * 0.43);
    ctx.moveTo(width * 0.82, height * 0.37); ctx.lineTo(width * 0.82 + 10, height * 0.37);
    ctx.moveTo(width * 0.82, height * 0.43); ctx.lineTo(width * 0.82 + 10, height * 0.43);
    ctx.stroke();

    // Subtle spark discharge
    if (frame % 15 < 5) {
      ctx.strokeStyle = '#BD00FF';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width * 0.12, height * 0.30);
      ctx.lineTo(width * 0.16, height * 0.26);
      ctx.lineTo(width * 0.14, height * 0.22);
      ctx.stroke();
    }
  }

  // Glowing Piercing Eyes
  const eyeColor = (isGroundPound || isLightning) ? '#ff0000' : '#00e5ff';
  ctx.fillStyle = eyeColor;
  ctx.globalAlpha = _α;
  ctx.shadowBlur = 15;
  ctx.shadowColor = eyeColor;
  const eyeY = isExhausted ? height * 0.6 : height * 0.3;
  ctx.beginPath();
  ctx.ellipse(width * 0.36, eyeY, 6, 3.5, 0.2, 0, Math.PI * 2);
  ctx.ellipse(width * 0.64, eyeY, 6, 3.5, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // White electric eye slits
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(width * 0.35, eyeY - 1, 2, 2);
  ctx.fillRect(width * 0.63, eyeY - 1, 2, 2);

  // ARMS / POSES
  ctx.fillStyle = '#2e1a47';
  if (isTelegraphing || isLightning || isGroundPound) {
    if (e.jumpCount === 0) {
      // ARMS DOWN - More aggressive downward pose
      ctx.fillRect(-12, height * 0.4, 18, height * 0.7);
      ctx.fillRect(width - 6, height * 0.4, 18, height * 0.7);

      // Downward wind/energy lines for telegraphing
      if (isTelegraphing) {
        ctx.strokeStyle = '#bd00ff';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const ox = (i - 1) * 20 + width/2;
          const oy = height + 10 + (frame % 20);
          ctx.beginPath();
          ctx.moveTo(ox, oy);
          ctx.lineTo(ox, oy + 20);
          ctx.stroke();
        }
      }
    } else {
      // ARMS OUT
      ctx.fillRect(-40, height * 0.2, 45, 18);
      ctx.fillRect(width - 5, height * 0.2, 45, 18);

      // Circular energy for Outward telegraph
      if (isTelegraphing) {
          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(width/2, height/2, 60 + Math.sin(frame * 0.2) * 10, 0, Math.PI * 2);
          ctx.stroke();
      }
    }
  }

  if (isLightning && e.activeLightningStrikes && e.activeLightningStrikes.length > 0) {
    // Lightning Storm: Vertical bolts everywhere except directly under the boss, persisting with the hurtbox
    ctx.save();
    e.activeLightningStrikes.forEach(strike => {
      const relX = strike.x - e.pos.x;
      const floorY = 550 - e.pos.y;
      const ceilY = 100 - e.pos.y;
      const progress = strike.duration / (strike.maxDuration || 35);
      const halfW = (strike.width || 70) / 2;

      // Translucent glowing column marking the active hurtbox area
      const colGrad = ctx.createLinearGradient(relX - halfW, 0, relX + halfW, 0);
      colGrad.addColorStop(0, 'rgba(0, 229, 255, 0)');
      colGrad.addColorStop(0.5, `rgba(0, 240, 255, ${0.35 * progress})`);
      colGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.fillStyle = colGrad;
      ctx.fillRect(relX - halfW, ceilY, strike.width || 70, floorY - ceilY);

      // Core electric bolt
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#00e5ff';
      ctx.beginPath();
      ctx.moveTo(relX, ceilY);
      const segments = 12;
      for (let i = 1; i < segments; i++) {
        const segY = ceilY + (i / segments) * (floorY - ceilY);
        const segX = relX + (Math.sin(frame * 0.5 + i * 2.3) * 16) + (Math.random() - 0.5) * 10;
        ctx.lineTo(segX, segY);
      }
      ctx.lineTo(relX, floorY);
      ctx.stroke();

      // Crackling yellow electric branches off the bolt
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ffff00';
      for (let b = 0; b < 3; b++) {
        const branchY = ceilY + ((b + 1) / 4) * (floorY - ceilY);
        const dir = (b % 2 === 0 ? 1 : -1);
        ctx.beginPath();
        ctx.moveTo(relX, branchY);
        ctx.lineTo(relX + dir * (25 + Math.random() * 25), branchY + (Math.random() - 0.5) * 30);
        ctx.stroke();
      }

      // Floor impact electric splash
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(relX, floorY, 12 + Math.random() * 8, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  if (isGroundPound) {
    // Perimeter electrification (floor, ceiling, walls light up for a half second on landing)
    if ((e.electrifiedTimer || 0) > 0) {
      const floorY = 550 - e.pos.y;
      const ceilY = 100 - e.pos.y;
      const leftX = 7240 - e.pos.x;
      const rightX = 7960 - e.pos.x;

      ctx.save();
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00ffff';

      // 1. High-voltage energy borders
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 6;
      ctx.beginPath();
      // Floor
      ctx.moveTo(leftX, floorY);
      ctx.lineTo(rightX, floorY);
      // Ceiling
      ctx.moveTo(leftX, ceilY);
      ctx.lineTo(rightX, ceilY);
      // Left Wall
      ctx.moveTo(leftX, ceilY);
      ctx.lineTo(leftX, floorY);
      // Right Wall
      ctx.moveTo(rightX, ceilY);
      ctx.lineTo(rightX, floorY);
      ctx.stroke();

      // Core bright white line inside the cyan beam
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.rect(leftX, ceilY, rightX - leftX, floorY - ceilY);
      ctx.stroke();

      // 2. High-frequency crackling lightning arcs along all 4 boundaries
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ffff00';

      // Floor arcs
      const floorSegments = 24;
      ctx.beginPath();
      for (let i = 0; i <= floorSegments; i++) {
        const px = leftX + (i / floorSegments) * (rightX - leftX);
        const py = floorY + (Math.random() - 0.5) * 16;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Ceiling arcs
      const ceilSegments = 24;
      ctx.beginPath();
      for (let i = 0; i <= ceilSegments; i++) {
        const px = leftX + (i / ceilSegments) * (rightX - leftX);
        const py = ceilY + (Math.random() - 0.5) * 16;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Left wall arcs
      const wallSegments = 16;
      ctx.beginPath();
      for (let i = 0; i <= wallSegments; i++) {
        const py = ceilY + (i / wallSegments) * (floorY - ceilY);
        const px = leftX + (Math.random() - 0.5) * 16;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Right wall arcs
      ctx.beginPath();
      for (let i = 0; i <= wallSegments; i++) {
        const py = ceilY + (i / wallSegments) * (floorY - ceilY);
        const px = rightX + (Math.random() - 0.5) * 16;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // 3. Electric sparks shooting inwards from boundaries
      for (let i = 0; i < 8; i++) {
        const rx = leftX + Math.random() * (rightX - leftX);
        ctx.beginPath();
        ctx.moveTo(rx, floorY);
        ctx.lineTo(rx + (Math.random() - 0.5) * 30, floorY - Math.random() * 40);
        ctx.stroke();

        const cx = leftX + Math.random() * (rightX - leftX);
        ctx.beginPath();
        ctx.moveTo(cx, ceilY);
        ctx.lineTo(cx + (Math.random() - 0.5) * 30, ceilY + Math.random() * 40);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  if (isTeleporting) {
    for (let i = 0; i < 8; i++) {
      const px = (Math.random() - 0.5) * width * 2 + width/2;
      const py = (Math.random() - 0.5) * height * 2 + height/2;
      ctx.fillStyle = (Math.random() > 0.5) ? '#120820' : '#4a1175';
      ctx.fillRect(px, py, 3, 3);
    }
  }

  ctx.globalAlpha = 1.0;
};
