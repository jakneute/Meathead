import { ARENA_LEFT, ARENA_RIGHT, GROUND_Y } from '../../constants';

/** Decorative backdrops for each boss arena (drawn in world coordinates). */
export const drawCustomBossArena = (
  ctx: CanvasRenderingContext2D,
  stageId: string,
  frame: number
) => {
  const arenaLeft = ARENA_LEFT;
  const arenaRight = ARENA_RIGHT;
  const arenaW = arenaRight - arenaLeft;
  const groundY = GROUND_Y;
  const ceilingY = 100;

  ctx.save();

  switch (stageId) {
    case 'Artie Avalanche':
      drawArtieArena(ctx, arenaLeft, arenaRight, arenaW, ceilingY, groundY, frame);
      break;
    case 'Victor Volcano':
      drawVictorArena(ctx, arenaLeft, arenaRight, arenaW, ceilingY, groundY, frame);
      break;
    case 'Ernie Earthquake':
      drawErnieArena(ctx, arenaLeft, arenaRight, arenaW, ceilingY, groundY, frame);
      break;
    case 'Hector Hurricane':
      drawHectorArena(ctx, arenaLeft, arenaRight, arenaW, ceilingY, groundY, frame);
      break;
    case 'Drug Trade Dale':
      drawDaleArena(ctx, arenaLeft, arenaRight, arenaW, ceilingY, groundY, frame);
      break;
    case 'Blackout Barry':
      drawBarryArena(ctx, arenaLeft, arenaRight, arenaW, ceilingY, groundY, frame);
      break;
    case 'Oily Oscar':
      drawOscarArena(ctx, arenaLeft, arenaRight, arenaW, ceilingY, groundY, frame);
      break;
    default:
      break;
  }

  ctx.restore();
};

/* =========================================================================
 * 1. ARTIE AVALANCHE: SUB-ZERO CRYO-VAULT & GLACIAL SANCTUARY
 * ========================================================================= */
const drawArtieArena = (
  ctx: CanvasRenderingContext2D,
  left: number,
  right: number,
  w: number,
  top: number,
  bottom: number,
  frame: number
) => {
  // 1. Deep Subzero Cavern Gradient Wall
  const wallGrad = ctx.createLinearGradient(left, top, left, bottom);
  wallGrad.addColorStop(0, '#061320');
  wallGrad.addColorStop(0.5, '#0b2035');
  wallGrad.addColorStop(1, '#08182b');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(left, top, w, bottom - top);

  // 2. Glacial Masonry Blocks Pattern
  ctx.strokeStyle = '#153857';
  ctx.lineWidth = 1;
  const blockH = 45;
  const blockW = 90;
  for (let y = top; y < bottom; y += blockH) {
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
    const row = Math.floor((y - top) / blockH);
    const xOff = (row % 2) * (blockW / 2);
    for (let x = left + xOff; x < right; x += blockW) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + blockH);
      ctx.stroke();
    }
  }

  // 3. Ice Crystal Columns in Background
  const pillarXs = [left + 160, left + 360, left + 560];
  pillarXs.forEach((px) => {
    ctx.fillStyle = 'rgba(21, 67, 102, 0.4)';
    ctx.fillRect(px - 24, top, 48, bottom - top);
    ctx.fillStyle = 'rgba(93, 173, 226, 0.25)';
    ctx.beginPath();
    ctx.moveTo(px - 20, top);
    ctx.lineTo(px, top + 80);
    ctx.lineTo(px + 20, top);
    ctx.fill();
    ctx.strokeStyle = 'rgba(174, 214, 241, 0.3)';
    ctx.strokeRect(px - 24, top, 48, bottom - top);
  });

  // 4. Overhead Cryo-Refrigerant Conduit & Vents
  ctx.fillStyle = '#1c364e';
  ctx.fillRect(left, top, w, 18);
  ctx.strokeStyle = '#5dade2';
  ctx.lineWidth = 2;
  ctx.strokeRect(left, top, w, 18);

  // Cryo Exhaust Vents emitting freezing mist
  const ventXs = [left + 120, left + 280, left + 440, left + 600];
  ventXs.forEach((vx, idx) => {
    ctx.fillStyle = '#2c5372';
    ctx.fillRect(vx - 16, top + 18, 32, 14);
    ctx.fillStyle = '#0e2336';
    ctx.fillRect(vx - 12, top + 26, 24, 6);

    // Billowing cold fog plume
    const mistOffset = ((frame * 1.5 + idx * 40) % 120);
    const mistAlpha = Math.max(0, 0.35 - (mistOffset / 120) * 0.35);
    ctx.fillStyle = `rgba(235, 245, 251, ${mistAlpha})`;
    ctx.beginPath();
    ctx.arc(vx, top + 32 + mistOffset, 14 + mistOffset * 0.25, 0, Math.PI * 2);
    ctx.arc(vx + Math.sin(frame * 0.05 + idx) * 12, top + 42 + mistOffset * 0.8, 18 + mistOffset * 0.3, 0, Math.PI * 2);
    ctx.fill();
  });

  // 5. Hanging Sharp Icicles from Ceiling
  const icicleCount = 28;
  const icicleStep = w / icicleCount;
  for (let i = 0; i < icicleCount; i++) {
    const ix = left + i * icicleStep;
    const len = 18 + Math.sin(i * 1.7) * 14 + ((i * 13) % 18);
    const grad = ctx.createLinearGradient(ix, top, ix, top + len);
    grad.addColorStop(0, '#5dade2');
    grad.addColorStop(0.7, '#aed6f1');
    grad.addColorStop(1, '#ffffff');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(ix - 5, top);
    ctx.lineTo(ix + 5, top);
    ctx.lineTo(ix, top + len);
    ctx.closePath();
    ctx.fill();
  }

  // 6. Side Cryo Hazard Columns
  const drawCryoColumn = (colX: number, isLeft: boolean) => {
    ctx.fillStyle = '#0f273d';
    ctx.fillRect(colX, top, 24, bottom - top);
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(colX, top, 24, bottom - top);

    // Glowing cyan vertical power core
    const corePulse = 0.5 + Math.sin(frame * 0.08) * 0.3;
    ctx.fillStyle = `rgba(0, 255, 255, ${corePulse})`;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 8;
    ctx.fillRect(colX + 9, top + 20, 6, bottom - top - 40);
    ctx.shadowBlur = 0;

    // Cryo warning markers
    ctx.fillStyle = '#eaf2f8';
    ctx.font = '7px monospace';
    ctx.save();
    ctx.translate(colX + (isLeft ? 18 : 6), top + 140);
    ctx.rotate(Math.PI / 2);
    ctx.fillText('CRYO // -273°C', 0, 0);
    ctx.restore();
  };
  drawCryoColumn(left, true);
  drawCryoColumn(right - 24, false);

  // 7. Floor Permafrost Overlay & Glistening Fissures
  ctx.fillStyle = '#091d31';
  ctx.fillRect(left, bottom - 12, w, 12);
  ctx.fillStyle = '#5dade2';
  ctx.fillRect(left, bottom - 4, w, 4);

  // Glowing ice cracks in floor
  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(left + 80, bottom);
  ctx.lineTo(left + 140, bottom - 6);
  ctx.lineTo(left + 220, bottom - 3);
  ctx.moveTo(left + 350, bottom - 2);
  ctx.lineTo(left + 420, bottom - 8);
  ctx.lineTo(left + 500, bottom - 1);
  ctx.moveTo(left + 620, bottom - 5);
  ctx.lineTo(left + 700, bottom);
  ctx.stroke();

  // Snowdrifts in corners
  ctx.fillStyle = '#ebf5fb';
  ctx.beginPath();
  ctx.moveTo(left, bottom);
  ctx.quadraticCurveTo(left + 50, bottom - 15, left + 90, bottom);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(right, bottom);
  ctx.quadraticCurveTo(right - 50, bottom - 15, right - 90, bottom);
  ctx.fill();

  // 8. Ambient Drifting Snowflakes
  ctx.fillStyle = 'rgba(235, 245, 251, 0.7)';
  for (let i = 0; i < 22; i++) {
    const sx = left + ((i * 37 + Math.sin(frame * 0.03 + i) * 20 + frame * 0.5) % w);
    const sy = top + ((i * 47 + frame * (0.8 + (i % 3) * 0.4)) % (bottom - top));
    const size = 1.5 + (i % 3);
    ctx.fillRect(sx, sy, size, size);
  }
};

/* =========================================================================
 * 2. VICTOR VOLCANO: DEEP MAGMA FOUNDRY & OBSIDIAN CALDERA
 * ========================================================================= */
const drawVictorArena = (
  ctx: CanvasRenderingContext2D,
  left: number,
  right: number,
  w: number,
  top: number,
  bottom: number,
  frame: number
) => {
  // 1. Dark Volcanic Caldera Wall
  const wallGrad = ctx.createLinearGradient(left, top, left, bottom);
  wallGrad.addColorStop(0, '#100403');
  wallGrad.addColorStop(0.6, '#200805');
  wallGrad.addColorStop(1, '#2d0a06');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(left, top, w, bottom - top);

  // 2. Basalt Masonry & Molten Veins
  ctx.strokeStyle = '#38120e';
  ctx.lineWidth = 1.5;
  const blockH = 40;
  const blockW = 80;
  for (let y = top; y < bottom; y += blockH) {
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
    const row = Math.floor((y - top) / blockH);
    const xOff = (row % 2) * (blockW / 2);
    for (let x = left + xOff; x < right; x += blockW) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + blockH);
      ctx.stroke();
    }
  }

  // Branching Lava Veins in Wall
  const lavaPulse = 0.6 + Math.sin(frame * 0.07) * 0.35;
  ctx.strokeStyle = `rgba(255, 69, 0, ${lavaPulse})`;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  // Vein 1
  ctx.moveTo(left + 120, top + 60);
  ctx.lineTo(left + 160, top + 140);
  ctx.lineTo(left + 140, top + 220);
  ctx.lineTo(left + 210, top + 310);
  // Vein 2
  ctx.moveTo(left + 540, top + 80);
  ctx.lineTo(left + 490, top + 180);
  ctx.lineTo(left + 520, top + 270);
  ctx.lineTo(left + 470, top + 380);
  ctx.stroke();

  // Core golden branch
  ctx.strokeStyle = `rgba(255, 215, 0, ${lavaPulse * 0.8})`;
  ctx.lineWidth = 1;
  ctx.stroke();

  // 3. Central Smelting Blast Archway in Background
  const archCx = left + w / 2;
  const archW = 200;
  ctx.fillStyle = '#0a0302';
  ctx.fillRect(archCx - archW / 2, top + 80, archW, bottom - top - 80);
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 2;
  ctx.strokeRect(archCx - archW / 2, top + 80, archW, bottom - top - 80);

  // Fiery furnace glow inside arch
  const furnaceGrad = ctx.createLinearGradient(archCx, bottom, archCx, top + 100);
  furnaceGrad.addColorStop(0, 'rgba(255, 87, 34, 0.7)');
  furnaceGrad.addColorStop(0.5, 'rgba(231, 76, 60, 0.35)');
  furnaceGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = furnaceGrad;
  ctx.fillRect(archCx - archW / 2 + 4, top + 84, archW - 8, bottom - top - 84);

  // Cast iron grate over arch
  ctx.strokeStyle = '#1a0806';
  ctx.lineWidth = 3;
  for (let x = archCx - archW / 2 + 20; x < archCx + archW / 2; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, top + 84);
    ctx.lineTo(x, bottom);
    ctx.stroke();
  }

  // 4. Heavy Overhead Cast-Iron Chains & Trusses
  ctx.fillStyle = '#261614';
  ctx.fillRect(left, top, w, 20);
  ctx.strokeStyle = '#922b21';
  ctx.lineWidth = 2;
  ctx.strokeRect(left, top, w, 20);

  const chainXs = [left + 220, left + 500];
  chainXs.forEach((cx) => {
    ctx.strokeStyle = '#4a231d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, top + 20);
    ctx.lineTo(cx, top + 120);
    ctx.stroke();
    // Heavy slag bucket / crucible
    ctx.fillStyle = '#2c1613';
    ctx.fillRect(cx - 20, top + 120, 40, 30);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(cx - 16, top + 122, 32, 6);
  });

  // 5. Basalt Columns & Hazard Chevrons on Borders
  const drawMagmaColumn = (colX: number) => {
    ctx.fillStyle = '#1c0907';
    ctx.fillRect(colX, top, 24, bottom - top);
    ctx.strokeStyle = '#78281f';
    ctx.lineWidth = 2;
    ctx.strokeRect(colX, top, 24, bottom - top);

    // Scorched warning chevrons
    for (let y = top + 20; y < bottom - 20; y += 35) {
      ctx.fillStyle = '#d35400';
      ctx.beginPath();
      ctx.moveTo(colX + 2, y);
      ctx.lineTo(colX + 22, y + 12);
      ctx.lineTo(colX + 22, y + 20);
      ctx.lineTo(colX + 2, y + 8);
      ctx.closePath();
      ctx.fill();
    }
  };
  drawMagmaColumn(left);
  drawMagmaColumn(right - 24);

  // 6. Glowing Magma Floor Seams
  ctx.fillStyle = '#150604';
  ctx.fillRect(left, bottom - 14, w, 14);
  const floorGlow = ctx.createLinearGradient(left, bottom - 14, left, bottom);
  floorGlow.addColorStop(0, 'rgba(255, 69, 0, 0.8)');
  floorGlow.addColorStop(0.5, 'rgba(255, 140, 0, 0.9)');
  floorGlow.addColorStop(1, '#ff3d00');
  ctx.fillStyle = floorGlow;
  ctx.fillRect(left, bottom - 5, w, 5);

  // 7. Rising Fire Spark & Ember Motes
  for (let i = 0; i < 26; i++) {
    const ex = left + ((i * 43 + Math.sin(frame * 0.04 + i) * 30) % w);
    const ey = bottom - ((frame * (1.2 + (i % 3) * 0.5) + i * 37) % (bottom - top));
    const rad = 1.2 + (i % 2.5);
    const alpha = 0.4 + Math.sin(frame * 0.1 + i) * 0.4;
    ctx.fillStyle = i % 2 === 0 ? `rgba(255, 87, 34, ${alpha})` : `rgba(255, 215, 0, ${alpha})`;
    ctx.beginPath();
    ctx.arc(ex, ey, rad, 0, Math.PI * 2);
    ctx.fill();
  }
};

/* =========================================================================
 * 3. ERNIE EARTHQUAKE: TECTONIC MINE SHAFT & DEMOLITION QUARRY
 * ========================================================================= */
const drawErnieArena = (
  ctx: CanvasRenderingContext2D,
  left: number,
  right: number,
  w: number,
  top: number,
  bottom: number,
  frame: number
) => {
  // 1. Stratified Geological Bedrock Wall
  const strataColors = ['#1a1411', '#281c17', '#34251e', '#231813', '#3d2b23', '#2a1e18', '#1e1612'];
  const bandH = (bottom - top) / strataColors.length;
  strataColors.forEach((color, idx) => {
    ctx.fillStyle = color;
    ctx.fillRect(left, top + idx * bandH, w, bandH + 1);
    // Jagged shear line
    ctx.strokeStyle = '#120d0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(left, top + idx * bandH);
    for (let x = left; x <= right; x += 40) {
      const yFluct = Math.sin(x * 0.05 + idx) * 3;
      ctx.lineTo(x, top + idx * bandH + yFluct);
    }
    ctx.stroke();
  });

  // 2. Glistening Gold and Quartz Ore Veins
  const drawOreVein = (startX: number, startY: number, color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + 30, startY + 40);
    ctx.lineTo(startX + 20, startY + 90);
    ctx.lineTo(startX + 60, startY + 140);
    ctx.lineTo(startX + 80, startY + 190);
    ctx.stroke();

    // Ore crystal nuggets
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(startX + 30, startY + 40, 3, 0, Math.PI * 2);
    ctx.arc(startX + 20, startY + 90, 4, 0, Math.PI * 2);
    ctx.arc(startX + 60, startY + 140, 3.5, 0, Math.PI * 2);
    ctx.fill();
  };
  drawOreVein(left + 140, top + 60, '#f1c40f');
  drawOreVein(left + 520, top + 100, '#e67e22');
  drawOreVein(left + 340, top + 180, '#9b59b6');

  // 3. Colossal Steel Mining Shoring Timbers & I-Beams
  const beamXs = [left + 220, left + 480];
  beamXs.forEach((bx) => {
    // Steel I-beam
    ctx.fillStyle = '#415b76';
    ctx.fillRect(bx - 14, top, 28, bottom - top);
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(bx - 8, top, 16, bottom - top);
    // Bolts
    ctx.fillStyle = '#95a5a6';
    for (let by = top + 20; by < bottom - 20; by += 40) {
      ctx.fillRect(bx - 12, by, 4, 4);
      ctx.fillRect(bx + 8, by, 4, 4);
    }
  });

  // Cross brace diagonal beam
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(left + 220, top + 40);
  ctx.lineTo(left + 480, top + 240);
  ctx.stroke();

  // 4. Live Digital Seismograph Terminal on Wall
  const termX = left + 310;
  const termY = top + 70;
  ctx.fillStyle = '#11171d';
  ctx.fillRect(termX, termY, 100, 60);
  ctx.strokeStyle = '#7f8c8d';
  ctx.lineWidth = 2;
  ctx.strokeRect(termX, termY, 100, 60);

  // Animated green seismic waveform
  ctx.strokeStyle = '#2ecc71';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(termX + 6, termY + 30);
  for (let sx = 6; sx < 94; sx += 4) {
    const wave = Math.sin((frame * 0.2) + sx * 0.5) * (sx > 40 && sx < 65 ? 16 : 4);
    ctx.lineTo(termX + sx, termY + 30 + wave);
  }
  ctx.stroke();
  ctx.fillStyle = '#e74c3c';
  ctx.font = '6px monospace';
  ctx.fillText('FAULT: 9.8 MAG', termX + 8, termY + 54);

  // 5. Heavy Demolition Pillars with Safety Chevrons
  const drawMinePillar = (px: number) => {
    ctx.fillStyle = '#212f3d';
    ctx.fillRect(px, top, 24, bottom - top);
    ctx.strokeStyle = '#f4d03f';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px, top, 24, bottom - top);

    for (let y = top + 20; y < bottom - 20; y += 30) {
      ctx.fillStyle = '#f4d03f';
      ctx.beginPath();
      ctx.moveTo(px, y);
      ctx.lineTo(px + 24, y + 12);
      ctx.lineTo(px + 24, y + 20);
      ctx.lineTo(px, y + 8);
      ctx.closePath();
      ctx.fill();
    }

    // Mounted amber revolving beacon atop pillar
    const beaconPulse = 0.5 + Math.sin(frame * 0.15) * 0.45;
    ctx.fillStyle = `rgba(243, 156, 18, ${beaconPulse})`;
    ctx.beginPath();
    ctx.arc(px + 12, top + 15, 8, 0, Math.PI * 2);
    ctx.fill();
  };
  drawMinePillar(left);
  drawMinePillar(right - 24);

  // 6. Mine Cart Rails on Floor
  ctx.fillStyle = '#17110e';
  ctx.fillRect(left, bottom - 12, w, 12);
  ctx.fillStyle = '#7f8c8d';
  ctx.fillRect(left, bottom - 8, w, 3);
  ctx.fillRect(left, bottom - 3, w, 2);

  // Rail ties
  ctx.fillStyle = '#4e342e';
  for (let rx = left + 20; rx < right - 20; rx += 30) {
    ctx.fillRect(rx, bottom - 10, 8, 8);
  }

  // 7. Ambient Dust Motes
  ctx.fillStyle = 'rgba(215, 204, 200, 0.45)';
  for (let i = 0; i < 18; i++) {
    const dx = left + ((i * 51 + frame * 0.3) % w);
    const dy = top + ((i * 39 + frame * 0.7) % (bottom - top));
    ctx.fillRect(dx, dy, 2, 2);
  }
};

/* =========================================================================
 * 4. HECTOR HURRICANE: SKY FORTRESS & AERODYNAMIC WIND TUNNEL
 * ========================================================================= */
const drawHectorArena = (
  ctx: CanvasRenderingContext2D,
  left: number,
  right: number,
  w: number,
  top: number,
  bottom: number,
  frame: number
) => {
  // 1. High-Altitude Turbulent Storm Sky Background
  const skyGrad = ctx.createLinearGradient(left, top, left, bottom);
  skyGrad.addColorStop(0, '#0a1018');
  skyGrad.addColorStop(0.5, '#162232');
  skyGrad.addColorStop(1, '#0e1824');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(left, top, w, bottom - top);

  // Lightning Flash in background clouds
  const isLightning = (frame % 160) > 154;
  if (isLightning) {
    ctx.fillStyle = 'rgba(214, 234, 248, 0.25)';
    ctx.fillRect(left, top, w, bottom - top);
  }

  // Reinforced Panoramic Hangar Window Frames
  ctx.strokeStyle = '#1b2d42';
  ctx.lineWidth = 3;
  ctx.strokeRect(left + 24, top + 15, w - 48, bottom - top - 30);
  ctx.beginPath();
  ctx.moveTo(left + w / 2, top + 15);
  ctx.lineTo(left + w / 2, bottom - 15);
  ctx.moveTo(left + 24, top + 180);
  ctx.lineTo(right - 24, top + 180);
  ctx.moveTo(left + 24, top + 340);
  ctx.lineTo(right - 24, top + 340);
  ctx.stroke();

  // 2. Colossal Spinning Wind Tunnel Turbines
  const turbineXs = [left + 200, left + 520];
  turbineXs.forEach((tx) => {
    // Housing duct
    ctx.fillStyle = '#101a26';
    ctx.beginPath();
    ctx.arc(tx, top + 180, 75, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Spinning 6-Blade Rotor
    const angle = frame * 0.15;
    ctx.save();
    ctx.translate(tx, top + 180);
    ctx.rotate(angle);
    for (let b = 0; b < 6; b++) {
      ctx.rotate(Math.PI / 3);
      ctx.fillStyle = '#5dade2';
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(6, 0);
      ctx.lineTo(12, 65);
      ctx.lineTo(-12, 65);
      ctx.closePath();
      ctx.fill();
    }
    // Rotor hub
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Wind vortex ring
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(tx, top + 180, 85 + (frame % 20), 0, Math.PI * 2);
    ctx.stroke();
  });

  // 3. Digital HUD Telemetry on Window Glass
  ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
  ctx.font = '7px monospace';
  ctx.fillText('AIRSPEED: MACH 3.5 // WIND VORTEX ACTIVE', left + 40, top + 40);
  ctx.fillText('ALTITUDE: 45,000 FT // BAROMETRIC PRESSURE: 920 hPa', left + 40, top + 52);

  // 4. Flight Deck Carrier Warning Pylons
  const drawAeroPylon = (px: number) => {
    ctx.fillStyle = '#162334';
    ctx.fillRect(px, top, 24, bottom - top);
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px, top, 24, bottom - top);

    // Blinking runway strobe lights
    for (let y = top + 30; y < bottom - 30; y += 45) {
      const strobeOn = Math.floor((frame + y) / 10) % 2 === 0;
      ctx.fillStyle = strobeOn ? '#00ffff' : '#1b4f72';
      ctx.fillRect(px + 6, y, 12, 10);
    }
  };
  drawAeroPylon(left);
  drawAeroPylon(right - 24);

  // 5. Flight Deck Steel Plating & Yellow Runway Directional Markings
  ctx.fillStyle = '#121b27';
  ctx.fillRect(left, bottom - 14, w, 14);
  ctx.fillStyle = '#f1c40f';
  // Runway chevron arrows on deck
  for (let ax = left + 80; ax < right - 80; ax += 120) {
    ctx.beginPath();
    ctx.moveTo(ax, bottom - 10);
    ctx.lineTo(ax + 20, bottom - 7);
    ctx.lineTo(ax, bottom - 4);
    ctx.stroke();
  }

  // Cyan deck-edge marker lights
  ctx.fillStyle = '#00ffff';
  for (let lx = left + 30; lx < right - 30; lx += 40) {
    ctx.beginPath();
    ctx.arc(lx, bottom - 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. Fast Gale Wind Wisps Streaking Across Arena
  ctx.strokeStyle = 'rgba(174, 214, 241, 0.4)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 14; i++) {
    const wy = top + 40 + ((i * 37) % (bottom - top - 80));
    const wx = left + ((frame * (12 + (i % 4) * 3) + i * 85) % (w + 200)) - 100;
    const wlen = 60 + (i % 3) * 35;
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx + wlen, wy);
    ctx.stroke();
  }
};

/* =========================================================================
 * 5. DRUG TRADE DALE: NEON VICE PENTHOUSE & CARTEL EMPIRE
 * ========================================================================= */
const drawDaleArena = (
  ctx: CanvasRenderingContext2D,
  left: number,
  right: number,
  w: number,
  top: number,
  bottom: number,
  frame: number
) => {
  // 1. Miami Vice Synthwave Sunset Skyline
  const skyGrad = ctx.createLinearGradient(left, top, left, bottom);
  skyGrad.addColorStop(0, '#10051e');
  skyGrad.addColorStop(0.4, '#2d083a');
  skyGrad.addColorStop(0.7, '#6b1164');
  skyGrad.addColorStop(1, '#b02a64');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(left, top, w, bottom - top);

  // Sunset horizon grid
  ctx.strokeStyle = 'rgba(255, 0, 128, 0.25)';
  ctx.lineWidth = 1;
  for (let y = top + 220; y < bottom; y += 22) {
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
  }

  // Skyline skyscraper silhouettes
  const bldgWidths = [50, 40, 70, 45, 60, 55, 80, 50, 65, 45];
  let curX = left + 30;
  bldgWidths.forEach((bw, bIdx) => {
    const bh = 90 + ((bIdx * 37) % 110);
    ctx.fillStyle = '#0a0314';
    ctx.fillRect(curX, bottom - bh, bw, bh);
    // Glowing skyscraper windows
    ctx.fillStyle = bIdx % 2 === 0 ? '#00ffff' : '#ff007f';
    for (let wy = bottom - bh + 10; wy < bottom - 10; wy += 14) {
      for (let wx = curX + 6; wx < curX + bw - 6; wx += 12) {
        if ((wx + wy + bIdx) % 3 === 0) {
          ctx.fillRect(wx, wy, 4, 6);
        }
      }
    }
    curX += bw + 8;
  });

  // Palm tree silhouettes in foreground window
  const drawPalm = (px: number) => {
    ctx.fillStyle = '#06010a';
    ctx.beginPath();
    ctx.moveTo(px - 5, bottom);
    ctx.quadraticCurveTo(px + 8, bottom - 70, px + 12, bottom - 140);
    ctx.lineTo(px + 17, bottom - 140);
    ctx.quadraticCurveTo(px + 13, bottom - 70, px + 5, bottom);
    ctx.fill();

    // Fronds
    const frondAngles = [-1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8];
    frondAngles.forEach((fa) => {
      ctx.save();
      ctx.translate(px + 14, bottom - 140);
      ctx.rotate(fa);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(25, -15, 55, 10);
      ctx.quadraticCurveTo(25, 5, 0, 0);
      ctx.fill();
      ctx.restore();
    });
  };
  drawPalm(left + 90);
  drawPalm(right - 110);

  // 2. Giant Glowing Neon Signage: "DALE'S CARTEL // VICE CITY"
  const neonX = left + w / 2;
  const neonY = top + 55;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = 'bold 22px "Press Start 2P", sans-serif';

  // Neon pink glow
  ctx.shadowColor = '#ff007f';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#ff69b4';
  ctx.fillText("DALE'S EMPIRE", neonX, neonY);
  ctx.shadowBlur = 0;

  // Subtitle in neon cyan
  ctx.font = 'bold 11px monospace';
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#00ffff';
  ctx.fillText("✦ CARTEL GLOBAL HEADQUARTERS ✦", neonX, neonY + 22);
  ctx.restore();

  // 3. Bundles of Banded Cash in Warehouse Shadows
  const drawCashPallet = (cx: number) => {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        const bx = cx + c * 22;
        const by = bottom - 14 - r * 14;
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(bx, by, 20, 12);
        ctx.strokeStyle = '#145a32';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, 20, 12);
        // Gold band
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(bx + 7, by, 6, 12);
      }
    }
  };
  drawCashPallet(left + 40);
  drawCashPallet(right - 130);

  // 4. Luxury Black Obsidian Pillars with Neon Strips
  const drawDalePillar = (px: number) => {
    ctx.fillStyle = '#0d0414';
    ctx.fillRect(px, top, 24, bottom - top);
    ctx.strokeStyle = '#d4ac0d';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px, top, 24, bottom - top);

    // Glowing hot pink LED strip
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#ff007f';
    ctx.fillRect(px + 10, top + 20, 4, bottom - top - 40);
    ctx.shadowBlur = 0;

    // Security camera with blinking red LED
    ctx.fillStyle = '#34495e';
    ctx.fillRect(px + 4, top + 15, 16, 10);
    const camBlink = Math.floor(frame / 20) % 2 === 0;
    ctx.fillStyle = camBlink ? '#ff0000' : '#4a0000';
    ctx.beginPath();
    ctx.arc(px + 12, top + 20, 2.5, 0, Math.PI * 2);
    ctx.fill();
  };
  drawDalePillar(left);
  drawDalePillar(right - 24);

  // 5. Polished Checkered Italian Marble Floor with Neon Reflections
  const tileW = 28;
  const tileH = 14;
  for (let tx = left; tx < right; tx += tileW) {
    const isAlt = Math.floor((tx - left) / tileW) % 2 === 0;
    ctx.fillStyle = isAlt ? '#ffffff' : '#111111';
    ctx.fillRect(tx, bottom - tileH, tileW, tileH);
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(tx, bottom - tileH, tileW, tileH);
  }

  // Neon floor sheen
  const sheenGrad = ctx.createLinearGradient(left, bottom - tileH, left, bottom);
  sheenGrad.addColorStop(0, 'rgba(255, 0, 128, 0.35)');
  sheenGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = sheenGrad;
  ctx.fillRect(left, bottom - tileH, w, tileH);
};

/* =========================================================================
 * 6. BLACKOUT BARRY: HIGH-VOLTAGE SUBSTATION & TESLA ARC GRID
 * ========================================================================= */
const drawBarryArena = (
  ctx: CanvasRenderingContext2D,
  left: number,
  right: number,
  w: number,
  top: number,
  bottom: number,
  frame: number
) => {
  // 1. Pitch-Black Substation Atmosphere
  ctx.fillStyle = '#040108';
  ctx.fillRect(left, top, w, bottom - top);

  // Electrical grid wall conduits
  ctx.strokeStyle = '#1b102b';
  ctx.lineWidth = 2;
  const conduitH = 50;
  for (let y = top; y < bottom; y += conduitH) {
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
  }

  // 2. Overhead Tangled High-Tension Transmission Cables
  ctx.strokeStyle = '#120720';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(left, top + 30);
  ctx.quadraticCurveTo(left + w * 0.25, top + 75, left + w * 0.5, top + 35);
  ctx.quadraticCurveTo(left + w * 0.75, top + 80, right, top + 40);
  ctx.stroke();

  ctx.strokeStyle = '#0e051a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(left, top + 50);
  ctx.quadraticCurveTo(left + w * 0.35, top + 100, left + w * 0.65, top + 60);
  ctx.quadraticCurveTo(left + w * 0.85, top + 95, right, top + 55);
  ctx.stroke();

  // 3. Central Jacob's Ladder Arc Station
  const ladderX = left + w / 2;
  const ladderY = top + 90;
  // Two V-shaped copper electrode rods
  ctx.strokeStyle = '#b87333';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(ladderX - 18, ladderY + 110);
  ctx.lineTo(ladderX - 6, ladderY);
  ctx.moveTo(ladderX + 18, ladderY + 110);
  ctx.lineTo(ladderX + 6, ladderY);
  ctx.stroke();

  // Ceramic base for electrodes
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(ladderX - 26, ladderY + 110, 52, 16);

  // Electric plasma arc climbing the ladder!
  const arcStep = (frame % 32) / 32;
  const arcY = ladderY + 110 - arcStep * 110;
  const arcSpread = 6 + arcStep * 12;
  ctx.strokeStyle = '#00ffff';
  ctx.shadowColor = '#bd00ff';
  ctx.shadowBlur = 10;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(ladderX - arcSpread, arcY);
  const segments = 6;
  for (let s = 1; s < segments; s++) {
    const sx = ladderX - arcSpread + (arcSpread * 2 * (s / segments)) + (Math.random() - 0.5) * 8;
    const sy = arcY + (Math.random() - 0.5) * 6;
    ctx.lineTo(sx, sy);
  }
  ctx.lineTo(ladderX + arcSpread, arcY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 4. Substation Transformer Tanks in Background
  const tankXs = [left + 140, left + 540];
  tankXs.forEach((tx) => {
    ctx.fillStyle = '#110b1a';
    ctx.fillRect(tx - 35, top + 140, 70, bottom - top - 150);
    ctx.strokeStyle = '#341f4d';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(tx - 35, top + 140, 70, bottom - top - 150);

    // Porcelain cooling ribs
    for (let ry = top + 155; ry < bottom - 30; ry += 20) {
      ctx.fillStyle = '#1c102a';
      ctx.fillRect(tx - 32, ry, 64, 8);
    }

    // High-voltage warning sign
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.moveTo(tx, top + 175);
    ctx.lineTo(tx + 12, top + 195);
    ctx.lineTo(tx - 12, top + 195);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Lightning bolt in triangle
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tx, top + 179);
    ctx.lineTo(tx - 3, top + 187);
    ctx.lineTo(tx + 2, top + 187);
    ctx.lineTo(tx - 1, top + 193);
    ctx.stroke();
  });

  // Digital voltage display
  ctx.fillStyle = '#00ffff';
  ctx.font = '7px monospace';
  ctx.fillText('HIGH-VOLTAGE SUBSTATION // GRID LOAD: 500,000V', left + 40, top + 35);

  // 5. Ceramic Insulator Pylons with Corona Discharge
  const drawInsulatorPylon = (px: number) => {
    ctx.fillStyle = '#12061f';
    ctx.fillRect(px, top, 24, bottom - top);
    ctx.strokeStyle = '#5b2c6f';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px, top, 24, bottom - top);

    // Ribbed insulator discs
    for (let y = top + 25; y < bottom - 25; y += 32) {
      ctx.fillStyle = '#2c133f';
      ctx.fillRect(px + 2, y, 20, 10);
      // Corona violet spark ring
      if (Math.random() > 0.6) {
        ctx.strokeStyle = '#bd00ff';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, y - 2, 24, 14);
      }
    }
  };
  drawInsulatorPylon(left);
  drawInsulatorPylon(right - 24);

  // 6. Steel Industrial Catwalk with Violet Underglow
  ctx.fillStyle = '#0d0517';
  ctx.fillRect(left, bottom - 14, w, 14);

  // Violet/cyan underglow shining through grating
  const floorGlow = ctx.createLinearGradient(left, bottom - 14, left, bottom);
  floorGlow.addColorStop(0, 'rgba(189, 0, 255, 0.4)');
  floorGlow.addColorStop(1, 'rgba(0, 229, 255, 0.6)');
  ctx.fillStyle = floorGlow;
  ctx.fillRect(left, bottom - 4, w, 4);

  // 7. Stray Electric Floor Sparks
  for (let i = 0; i < 4; i++) {
    if (Math.random() > 0.4) {
      const sx = left + Math.random() * w;
      ctx.strokeStyle = i % 2 === 0 ? '#00e5ff' : '#bd00ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx, bottom - 6);
      ctx.lineTo(sx + (Math.random() - 0.5) * 20, bottom - 14);
      ctx.lineTo(sx + (Math.random() - 0.5) * 30, bottom - 2);
      ctx.stroke();
    }
  }
};

/* =========================================================================
 * 7. OILY OSCAR: PETROLEUM REFINERY & CRACKING COMPLEX
 * ========================================================================= */
const drawOscarArena = (
  ctx: CanvasRenderingContext2D,
  left: number,
  right: number,
  w: number,
  top: number,
  bottom: number,
  frame: number
) => {
  // 1. Smoggy Industrial Petroleum Twilight Sky
  const skyGrad = ctx.createLinearGradient(left, top, left, bottom);
  skyGrad.addColorStop(0, '#120b09');
  skyGrad.addColorStop(0.5, '#221410');
  skyGrad.addColorStop(1, '#180e0c');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(left, top, w, bottom - top);

  // 2. Towering Distillation Cracker Towers & Gas Flare Stacks
  const flareXs = [left + 120, right - 130];
  flareXs.forEach((fx, fIdx) => {
    // Flare tower pipe
    ctx.fillStyle = '#2c1d18';
    ctx.fillRect(fx - 8, top + 40, 16, bottom - top - 40);
    ctx.strokeStyle = '#4e342e';
    ctx.lineWidth = 2;
    ctx.strokeRect(fx - 8, top + 40, 16, bottom - top - 40);

    // Active burning gas flare flame
    const flameH = 26 + Math.sin(frame * 0.2 + fIdx) * 8;
    ctx.fillStyle = '#ff5722';
    ctx.beginPath();
    ctx.moveTo(fx - 10, top + 40);
    ctx.quadraticCurveTo(fx - 14, top + 40 - flameH * 0.6, fx, top + 40 - flameH);
    ctx.quadraticCurveTo(fx + 14, top + 40 - flameH * 0.6, fx + 10, top + 40);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.moveTo(fx - 5, top + 40);
    ctx.quadraticCurveTo(fx, top + 40 - flameH * 0.5, fx, top + 40 - flameH * 0.7);
    ctx.quadraticCurveTo(fx, top + 40 - flameH * 0.5, fx + 5, top + 40);
    ctx.fill();

    // Black rolling soot cloud from flare
    const sootOff = (frame * 0.8 + fIdx * 30) % 60;
    ctx.fillStyle = 'rgba(26, 17, 15, 0.45)';
    ctx.beginPath();
    ctx.arc(fx + sootOff * 0.5, top + 20 - sootOff * 0.6, 10 + sootOff * 0.3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Background Cracking Vessel
  const vesselX = left + w / 2;
  ctx.fillStyle = '#1e1310';
  ctx.fillRect(vesselX - 55, top + 110, 110, bottom - top - 110);
  ctx.strokeStyle = '#3e2723';
  ctx.lineWidth = 2;
  ctx.strokeRect(vesselX - 55, top + 110, 110, bottom - top - 110);

  // Pressure gauge on vessel
  ctx.fillStyle = '#d4ac0d';
  ctx.beginPath();
  ctx.arc(vesselX, top + 150, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f9e79f';
  ctx.beginPath();
  ctx.arc(vesselX, top + 150, 12, 0, Math.PI * 2);
  ctx.fill();
  // Needle
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(vesselX, top + 150);
  const needleAng = (frame * 0.05) % (Math.PI * 1.2) - 0.6;
  ctx.lineTo(vesselX + Math.cos(needleAng) * 9, top + 150 + Math.sin(needleAng) * 9);
  ctx.stroke();

  // 3. Dense Rusted Pipe Network Across Upper Wall
  ctx.fillStyle = '#3e2723';
  ctx.fillRect(left, top + 75, w, 16);
  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = 2;
  ctx.strokeRect(left, top + 75, w, 16);

  // Vertical pipe feeds
  const pipeXs = [left + 260, left + 460];
  pipeXs.forEach((px) => {
    ctx.fillStyle = '#2c1d18';
    ctx.fillRect(px - 10, top + 75, 20, bottom - top - 75);
    ctx.strokeStyle = '#4e342e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px - 10, top + 75, 20, bottom - top - 75);

    // Leaking black crude oil drip
    const dripY = top + 95 + ((frame * 1.6 + px) % 180);
    ctx.fillStyle = '#0a0605';
    ctx.fillRect(px - 2, dripY, 4, 8);
  });

  // 4. Heavy Rusted Bulkhead Columns with Oil Drips
  const drawRefineryColumn = (px: number) => {
    ctx.fillStyle = '#1c1210';
    ctx.fillRect(px, top, 24, bottom - top);
    ctx.strokeStyle = '#4e342e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px, top, 24, bottom - top);

    // Rivets
    ctx.fillStyle = '#d4ac0d';
    for (let ry = top + 15; ry < bottom - 15; ry += 35) {
      ctx.beginPath();
      ctx.arc(px + 6, ry, 2, 0, Math.PI * 2);
      ctx.arc(px + 18, ry, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Black crude stain
    ctx.fillStyle = '#090504';
    ctx.fillRect(px + 4, top + 60, 6, 80);
  };
  drawRefineryColumn(left);
  drawRefineryColumn(right - 24);

  // 5. Iridescent Petroleum Oil Slick on Floor
  ctx.fillStyle = '#140c0a';
  ctx.fillRect(left, bottom - 14, w, 14);

  // Rainbow oil sheen gradient
  const rainbowSlick = ctx.createLinearGradient(left, bottom - 12, right, bottom - 12);
  rainbowSlick.addColorStop(0, 'rgba(255, 0, 128, 0.4)');
  rainbowSlick.addColorStop(0.25, 'rgba(0, 255, 255, 0.5)');
  rainbowSlick.addColorStop(0.5, 'rgba(255, 255, 0, 0.45)');
  rainbowSlick.addColorStop(0.75, 'rgba(128, 0, 255, 0.5)');
  rainbowSlick.addColorStop(1, 'rgba(0, 255, 128, 0.4)');
  ctx.fillStyle = rainbowSlick;
  ctx.fillRect(left, bottom - 10, w, 6);

  // Black crude puddles
  ctx.fillStyle = '#070403';
  ctx.beginPath();
  ctx.ellipse(left + 220, bottom - 4, 45, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(left + 500, bottom - 4, 60, 5, 0, 0, Math.PI * 2);
  ctx.fill();
};
