import { ARENA_LEFT, GROUND_Y } from '../../constants';
import { getArenaRight } from '../boss';

/** Decorative backdrops for each boss arena (drawn in world coordinates). */
export const drawCustomBossArena = (
  ctx: CanvasRenderingContext2D,
  stageId: string,
  frame: number,
  /** Where the wind is being sucked toward (Hector's hurricane), if anywhere. */
  windTargetX: number | null = null
) => {
  const arenaLeft = ARENA_LEFT;
  const arenaRight = getArenaRight(stageId);
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
      drawHectorArena(ctx, arenaLeft, arenaRight, arenaW, ceilingY, groundY, frame, windTargetX);
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
  frame: number,
  windTargetX: number | null
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

  // 6. Wind wisps: a calm breeze normally; during the hurricane they rush in
  // toward Hector from both sides, showing which way you're being pulled
  ctx.save();
  ctx.beginPath();
  ctx.rect(left, top, w, bottom - top);
  ctx.clip();
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 14; i++) {
    const wy = top + 40 + ((i * 37) % (bottom - top - 80));
    const wlen = 60 + (i % 3) * 35;
    if (windTargetX === null) {
      ctx.strokeStyle = 'rgba(174, 214, 241, 0.3)';
      const wx = left + ((frame * (4 + (i % 4)) + i * 85) % (w + 200)) - 100;
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.lineTo(wx + wlen, wy);
      ctx.stroke();
      continue;
    }
    const fromLeft = i % 2 === 0;
    const span = fromLeft ? windTargetX - left : right - windTargetX;
    if (span < 40) continue;
    const travel = ((frame * (14 + (i % 4) * 3) + i * 85) % (span + wlen)) - wlen;
    const tail = fromLeft ? left + travel : right - travel;
    const head = fromLeft ? Math.min(windTargetX, tail + wlen) : Math.max(windTargetX, tail - wlen);
    const nearTarget = 1 - Math.min(1, Math.abs(head - windTargetX) / span);
    ctx.strokeStyle = `rgba(200, 235, 255, ${0.25 + 0.4 * nearTarget})`;
    ctx.beginPath();
    ctx.moveTo(tail, wy);
    ctx.lineTo(head, wy);
    ctx.stroke();
    // Arrow tip pointing into the storm
    const dir = fromLeft ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(head, wy);
    ctx.lineTo(head - dir * 7, wy - 4);
    ctx.moveTo(head, wy);
    ctx.lineTo(head - dir * 7, wy + 4);
    ctx.stroke();
  }
  ctx.restore();
};

/* =========================================================================
 * 5. DRUG TRADE DALE: ALBUQUERQUE, NEW MEXICO AT DUSK
 * Sandia Mountains glowing pink, mesas, Balloon Fiesta balloons, an adobe
 * with chile ristras, a suspicious RV, and Route 66.
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
  // 1. High-desert dusk sky
  const sky = ctx.createLinearGradient(left, top, left, bottom);
  sky.addColorStop(0, '#1b1f4b');
  sky.addColorStop(0.35, '#5a3a7a');
  sky.addColorStop(0.62, '#e0735a');
  sky.addColorStop(0.8, '#f7b267');
  sky.addColorStop(1, '#f4d58d');
  ctx.fillStyle = sky;
  ctx.fillRect(left, top, w, bottom - top);

  // First stars
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  for (let i = 0; i < 18; i++) {
    const sx = left + ((i * 97) % w);
    const sy = top + 8 + ((i * 53) % 90);
    if ((frame + i * 13) % 90 < 80) ctx.fillRect(sx, sy, 2, 2);
  }

  // Setting sun with heat-haze bands
  const sunX = left + w * 0.68;
  const sunY = bottom - 150;
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 120);
  sunGlow.addColorStop(0, 'rgba(255, 230, 150, 0.9)');
  sunGlow.addColorStop(1, 'rgba(255, 160, 90, 0)');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(sunX - 120, sunY - 120, 240, 240);
  ctx.fillStyle = '#ffd27a';
  ctx.beginPath(); ctx.arc(sunX, sunY, 34, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(240, 130, 90, 0.9)';
  for (let b = 0; b < 4; b++) ctx.fillRect(sunX - 40, sunY + 6 + b * 8, 80, 2 + b);

  // 2. Sandia Mountains: long ridge lit watermelon-pink
  const ridge = (baseY: number, amp: number, seed: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(left, bottom);
    for (let x = 0; x <= w; x += 12) {
      const y = baseY - amp * (0.55 + 0.45 * Math.sin((x + seed) * 0.011)) - (Math.sin((x + seed) * 0.07) * 6) - ((x * 7 + seed) % 11);
      ctx.lineTo(left + x, y);
    }
    ctx.lineTo(right, bottom);
    ctx.closePath();
    ctx.fill();
  };
  ridge(bottom - 150, 90, 40, '#9c5b8f');
  ridge(bottom - 120, 70, 300, '#c96f8a');
  // Pink alpenglow along the crest
  ctx.strokeStyle = 'rgba(255, 170, 190, 0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= w; x += 12) {
    const y = bottom - 120 - 70 * (0.55 + 0.45 * Math.sin((x + 300) * 0.011)) - (Math.sin((x + 300) * 0.07) * 6) - ((x * 7 + 300) % 11);
    if (x === 0) ctx.moveTo(left, y); else ctx.lineTo(left + x, y);
  }
  ctx.stroke();

  // 3. Mesas in the middle distance
  const mesa = (mx: number, mw: number, mh: number) => {
    ctx.fillStyle = '#8a4b3a';
    ctx.beginPath();
    ctx.moveTo(mx, bottom - 60);
    ctx.lineTo(mx + 14, bottom - 60 - mh);
    ctx.lineTo(mx + mw - 14, bottom - 60 - mh);
    ctx.lineTo(mx + mw, bottom - 60);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#a65d45';
    ctx.fillRect(mx + 14, bottom - 60 - mh, mw - 28, 6);
    ctx.fillStyle = 'rgba(60, 25, 20, 0.35)';
    for (let st = 1; st < 4; st++) ctx.fillRect(mx + 6 + st * 3, bottom - 60 - mh + st * (mh / 4), mw - 12 - st * 6, 2);
  };
  mesa(left + 150, 150, 55);
  mesa(left + 470, 110, 40);
  ctx.fillStyle = '#b87050';
  ctx.fillRect(left, bottom - 60, w, 60);

  // 4. Balloon Fiesta: hot-air balloons drifting and bobbing
  const balloons: [number, number, string, string][] = [
    [0.18, 150, '#e63946', '#ffd166'],
    [0.5, 95, '#118ab2', '#f1faee'],
    [0.82, 175, '#06d6a0', '#ef476f'],
  ];
  balloons.forEach(([fx, by, c1, c2], i) => {
    const bx = left + ((fx * w + frame * (0.15 + i * 0.05)) % (w + 80)) - 40;
    const bob = Math.sin(frame * 0.03 + i * 2) * 5;
    const cy = top + by + bob;
    ctx.save();
    ctx.beginPath(); ctx.ellipse(bx, cy, 20, 24, 0, 0, Math.PI * 2); ctx.clip();
    for (let st = -3; st <= 3; st++) {
      ctx.fillStyle = st % 2 === 0 ? c1 : c2;
      ctx.fillRect(bx + st * 7 - 3.5, cy - 26, 7, 52);
    }
    ctx.restore();
    ctx.strokeStyle = '#3d2b1f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bx - 10, cy + 20); ctx.lineTo(bx - 5, cy + 34);
    ctx.moveTo(bx + 10, cy + 20); ctx.lineTo(bx + 5, cy + 34);
    ctx.stroke();
    ctx.fillStyle = '#7a4e2d';
    ctx.fillRect(bx - 6, cy + 34, 12, 8);
  });

  // 5. Motel-style neon roadside sign
  const signX = left + w / 2;
  const signY = top + 36;
  ctx.save();
  ctx.fillStyle = '#123a3a';
  ctx.fillRect(signX - 150, signY - 22, 300, 52);
  ctx.strokeStyle = '#40e0d0';
  ctx.lineWidth = 3;
  ctx.strokeRect(signX - 150, signY - 22, 300, 52);
  // Chasing bulbs around the edge
  for (let i = 0; i < 30; i++) {
    const onTop = i < 15;
    const bx = signX - 145 + (i % 15) * 20.7;
    const by = onTop ? signY - 22 : signY + 30;
    ctx.fillStyle = (i + Math.floor(frame / 6)) % 3 === 0 ? '#fff4b0' : '#7a6a2a';
    ctx.beginPath(); ctx.arc(bx, by, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.textAlign = 'center';
  ctx.font = 'bold 18px "Press Start 2P", sans-serif';
  ctx.shadowColor = '#ff4f9a';
  ctx.shadowBlur = 12;
  ctx.fillStyle = Math.floor(frame / 45) % 8 === 0 ? '#7a2a4a' : '#ff6fb0'; // occasional flicker
  ctx.fillText("DALE'S", signX, signY + 2);
  ctx.shadowColor = '#40e0d0';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#7ff5ea';
  ctx.font = 'bold 9px monospace';
  ctx.fillText("PHARMACY * NO QUESTIONS * ALBUQUERQUE NM", signX, signY + 20);
  ctx.restore();

  // 6. Adobe building with vigas, ristras and turquoise trim (left)
  const adX = left + 30, adW = 150, adH = 95, adY = bottom - adH;
  ctx.fillStyle = '#c98b5b';
  ctx.beginPath();
  ctx.moveTo(adX, bottom); ctx.lineTo(adX, adY + 8);
  ctx.quadraticCurveTo(adX + 4, adY, adX + 14, adY);
  ctx.lineTo(adX + adW - 14, adY);
  ctx.quadraticCurveTo(adX + adW - 4, adY, adX + adW, adY + 8);
  ctx.lineTo(adX + adW, bottom);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(120, 70, 40, 0.3)';
  ctx.fillRect(adX, bottom - 16, adW, 16);
  // Vigas (roof beams poking out)
  ctx.fillStyle = '#5b3a24';
  for (let v = 0; v < 6; v++) ctx.fillRect(adX + 10 + v * 25, adY + 12, 10, 6);
  // Turquoise door and window
  ctx.fillStyle = '#2bb3a6';
  ctx.fillRect(adX + 26, bottom - 50, 26, 50);
  ctx.fillRect(adX + 88, adY + 32, 34, 24);
  ctx.fillStyle = '#ffcf70';
  ctx.fillRect(adX + 92, adY + 36, 26, 16);
  // Red chile ristras hanging by the door
  const ristra = (rx: number) => {
    for (let k = 0; k < 7; k++) {
      ctx.fillStyle = k % 2 ? '#c1121f' : '#9d0208';
      ctx.beginPath(); ctx.ellipse(rx + (k % 2 ? 3 : -3), adY + 24 + k * 6, 4, 5, 0, 0, Math.PI * 2); ctx.fill();
    }
  };
  ristra(adX + 16);
  ristra(adX + 62);

  // 7. Beat-up RV with suspicious smoke (right)
  const rvX = right - 210, rvY = bottom - 74;
  ctx.fillStyle = '#e8dcc0';
  ctx.fillRect(rvX, rvY, 170, 60);
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(rvX, rvY + 30, 170, 8);
  ctx.fillStyle = '#6b4a2a';
  ctx.fillRect(rvX, rvY + 40, 170, 4);
  ctx.fillStyle = '#e8dcc0';
  ctx.beginPath(); ctx.moveTo(rvX + 170, rvY); ctx.lineTo(rvX + 190, rvY + 22); ctx.lineTo(rvX + 190, rvY + 60); ctx.lineTo(rvX + 170, rvY + 60); ctx.fill();
  ctx.fillStyle = '#3c4f5c';
  ctx.fillRect(rvX + 20, rvY + 10, 26, 16);
  ctx.fillRect(rvX + 110, rvY + 10, 26, 16);
  ctx.beginPath(); ctx.moveTo(rvX + 172, rvY + 6); ctx.lineTo(rvX + 186, rvY + 22); ctx.lineTo(rvX + 172, rvY + 22); ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.arc(rvX + 35, bottom - 10, 11, 0, Math.PI * 2); ctx.arc(rvX + 150, bottom - 10, 11, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#777';
  ctx.beginPath(); ctx.arc(rvX + 35, bottom - 10, 4, 0, Math.PI * 2); ctx.arc(rvX + 150, bottom - 10, 4, 0, Math.PI * 2); ctx.fill();
  // Rust spots
  ctx.fillStyle = 'rgba(140, 70, 30, 0.6)';
  ctx.fillRect(rvX + 60, rvY + 48, 9, 5);
  ctx.fillRect(rvX + 95, rvY + 4, 6, 4);
  // Chemistry smoke puffing from the roof vent
  ctx.fillStyle = '#555';
  ctx.fillRect(rvX + 70, rvY - 8, 12, 8);
  for (let k = 0; k < 5; k++) {
    const age = (frame * 0.6 + k * 20) % 100;
    ctx.fillStyle = `rgba(230, 230, 240, ${0.5 - age / 220})`;
    ctx.beginPath();
    ctx.arc(rvX + 76 + age * 0.35 + Math.sin(age * 0.1) * 4, rvY - 10 - age * 0.9, 5 + age * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }

  // 8. Route 66 shield on a post
  const r66X = left + w / 2 + 10;
  ctx.fillStyle = '#5b4a3a';
  ctx.fillRect(r66X - 2, bottom - 70, 4, 70);
  ctx.fillStyle = '#f5f0e1';
  ctx.beginPath();
  ctx.moveTo(r66X - 18, bottom - 96); ctx.lineTo(r66X + 18, bottom - 96);
  ctx.lineTo(r66X + 16, bottom - 78); ctx.quadraticCurveTo(r66X, bottom - 62, r66X - 16, bottom - 78);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#1a1a1a';
  ctx.textAlign = 'center';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('66', r66X, bottom - 76);
  ctx.font = 'bold 5px sans-serif';
  ctx.fillText('US ROUTE', r66X, bottom - 89);

  // 9. Desert plants: yucca and agave
  const yucca = (yx: number, s: number) => {
    ctx.strokeStyle = '#4f6f3a';
    ctx.lineWidth = 2;
    for (let k = -4; k <= 4; k++) {
      ctx.beginPath();
      ctx.moveTo(yx, bottom);
      ctx.lineTo(yx + k * 4 * s, bottom - (22 - Math.abs(k) * 2) * s);
      ctx.stroke();
    }
    ctx.strokeStyle = '#6b5a3a';
    ctx.beginPath(); ctx.moveTo(yx, bottom - 18 * s); ctx.lineTo(yx + 2, bottom - 48 * s); ctx.stroke();
    ctx.fillStyle = '#f2ecd0';
    for (let k = 0; k < 5; k++) ctx.fillRect(yx - 1 + (k % 2) * 3, bottom - (46 - k * 5) * s, 3, 3);
  };
  yucca(left + 220, 1);
  yucca(right - 240, 0.8);
  const agave = (ax: number) => {
    ctx.fillStyle = '#6f9a7a';
    for (let k = -3; k <= 3; k++) {
      ctx.beginPath();
      ctx.moveTo(ax - 3, bottom); ctx.lineTo(ax + k * 7, bottom - 16 + Math.abs(k) * 2); ctx.lineTo(ax + 3, bottom);
      ctx.fill();
    }
  };
  agave(left + 330);
  agave(right - 30);

  // 10. Tumbleweed rolling through
  const twX = left + ((frame * 2.2) % (w + 120)) - 60;
  const twY = bottom - 16 - Math.abs(Math.sin(frame * 0.12)) * 10;
  ctx.save();
  ctx.translate(twX, twY);
  ctx.rotate(frame * 0.15);
  ctx.strokeStyle = '#a07a4a';
  ctx.lineWidth = 1.5;
  for (let k = 0; k < 7; k++) {
    ctx.beginPath();
    ctx.arc(0, 0, 8 + (k % 3) * 2, k, k + 2.5);
    ctx.stroke();
  }
  ctx.restore();

  // 11. Adobe columns at the arena edges
  const column = (px: number) => {
    ctx.fillStyle = '#b8794d';
    ctx.fillRect(px, top, 24, bottom - top);
    ctx.fillStyle = 'rgba(90, 50, 25, 0.25)';
    ctx.fillRect(px + 16, top, 8, bottom - top);
    ctx.fillStyle = '#5b3a24';
    for (let vy = top + 30; vy < bottom - 20; vy += 90) ctx.fillRect(px - 4, vy, 32, 6);
    ctx.fillStyle = '#2bb3a6';
    ctx.fillRect(px + 4, top + 8, 16, 4);
  };
  column(left);
  column(right - 24);

  // 12. Sun-baked caliche ground with cracks
  const groundGrad = ctx.createLinearGradient(left, bottom - 14, left, bottom);
  groundGrad.addColorStop(0, '#d9a066');
  groundGrad.addColorStop(1, '#b5703d');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(left, bottom - 14, w, 14);
  ctx.strokeStyle = 'rgba(90, 45, 20, 0.55)';
  ctx.lineWidth = 1;
  for (let cx = left + 10; cx < right; cx += 46) {
    ctx.beginPath();
    ctx.moveTo(cx, bottom - 13);
    ctx.lineTo(cx + 8, bottom - 8);
    ctx.lineTo(cx + 4, bottom - 3);
    ctx.moveTo(cx + 8, bottom - 8);
    ctx.lineTo(cx + 18, bottom - 10);
    ctx.stroke();
  }
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

  // Background Cracking Vessels (one per screen of arena)
  const vesselCount = Math.max(1, Math.round(w / 720));
  for (let v = 0; v < vesselCount; v++) {
  const vesselX = left + (w / vesselCount) * (v + 0.5);
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
  }

  // NO SMOKING signs (he doesn't care)
  for (let v = 0; v < vesselCount; v++) {
    const sx = left + (w / vesselCount) * v + (w / vesselCount) * 0.25, sy = top + 190;
    ctx.fillStyle = '#ECEFF1';
    ctx.fillRect(sx - 22, sy - 22, 44, 56);
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(sx - 10, sy - 2, 18, 5);
    ctx.fillStyle = '#FF7043';
    ctx.fillRect(sx + 8, sy - 2, 3, 5);
    ctx.strokeStyle = '#D32F2F';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(sx, sy, 16, 0, Math.PI * 2);
    ctx.moveTo(sx - 11, sy - 11);
    ctx.lineTo(sx + 11, sy + 11);
    ctx.stroke();
    ctx.fillStyle = '#212121';
    ctx.font = 'bold 6px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('NO', sx, sy + 24);
    ctx.fillText('SMOKING', sx, sy + 31);
  }

  // 3. Dense Rusted Pipe Network Across Upper Wall
  ctx.fillStyle = '#3e2723';
  ctx.fillRect(left, top + 75, w, 16);
  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = 2;
  ctx.strokeRect(left, top + 75, w, 16);

  // Vertical pipe feeds
  const pipeXs: number[] = [];
  for (let px = left + 260; px < right - 150; px += 200) pipeXs.push(px);
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

  // 5. Steel grating walkway along the floor (real oil slicks are drawn on top of it)
  ctx.fillStyle = '#2b211d';
  ctx.fillRect(left, bottom - 14, w, 14);
  ctx.strokeStyle = '#3e302a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let gx = left; gx < right; gx += 12) {
    ctx.moveTo(gx, bottom - 14);
    ctx.lineTo(gx + 8, bottom);
  }
  ctx.stroke();
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(left, bottom - 15, w, 2);
};
