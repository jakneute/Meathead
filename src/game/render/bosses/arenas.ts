import { ARENA_LEFT, GROUND_Y } from '../../../constants';
import { getArenaRight } from '../../bosses/registry';
import { bandedGradient } from '../pixelArt';
import type { Enemy } from '../../../types';
import type { GameState } from '../../core/state';

/** Decorative backdrops for each boss arena (drawn in world coordinates). */
export const drawCustomBossArena = (
  ctx: CanvasRenderingContext2D,
  stageId: string,
  frame: number,
  /** Where the wind is being sucked toward (Hector's hurricane), if anywhere. */
  windTargetX: number | null = null,
  /** The game (for arenas that change as the fight goes: Dale's pharmacy walls). */
  state?: GameState,
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
      if (state) drawHectorFilth(ctx, arenaLeft, arenaRight, ceilingY, groundY, frame, state.hectorFilthShown);
      break;
    case 'Drug Trade Dale':
      drawDaleArena(ctx, arenaLeft, arenaRight, arenaW, ceilingY, groundY, frame);
      if (state) drawDaleWalls(ctx, arenaLeft, arenaRight, ceilingY, groundY, frame, state.enemies.find(e => e.type === 'boss') ?? state.deadBoss ?? undefined, state.doorState === 'done');
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
  bandedGradient(ctx, left, top, w, bottom - top, ['#061320', '#081A2B', '#0B2035', '#0A1C30', '#08182B'], 12);

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
  bandedGradient(ctx, left, top, w, bottom - top, ['#100403', '#180604', '#200805', '#260905', '#2D0A06'], 12);

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
  bandedGradient(ctx, left, top, w, bottom - top, ['#0A1018', '#101925', '#162232', '#121D2B', '#0E1824'], 12);

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
 * 5. DRUG TRADE DALE: DALE'S PHARMACY, ALBUQUERQUE
 * The inside of his pharmacy: mint tile, strip lights, aisles of pills, the
 * Rx counter at the back under a neon sign. The glass front doors (left) and
 * the back wall (right) are in his delivery truck's way: the first time it
 * comes through, each of them comes down (and stays down).
 * ========================================================================= */
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

const drawDaleArena = (
  ctx: CanvasRenderingContext2D,
  left: number,
  right: number,
  w: number,
  top: number,
  bottom: number,
  frame: number
) => {
  // 0. Above the ceiling: the roof's dark underside, ducts and joists
  ctx.fillStyle = '#292524'; ctx.fillRect(left - 40, top - 200, w + 80, 200);
  ctx.fillStyle = '#44403C'; for (let x = left - 40; x < right + 40; x += 48) ctx.fillRect(x, top - 200, 10, 200);
  ctx.fillStyle = '#78716C'; ctx.fillRect(left - 40, top - 60, w + 80, 22);
  ctx.fillStyle = '#57534E'; for (let x = left; x < right; x += 90) ctx.fillRect(x, top - 64, 6, 30);
  // 1. The back wall: cream up top, mint tile below
  ctx.fillStyle = '#EEF0E2'; ctx.fillRect(left, top, w, bottom - top);
  const tileTop = bottom - 190;
  ctx.fillStyle = '#9ED3C0'; ctx.fillRect(left, tileTop, w, bottom - tileTop);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1;
  for (let y = tileTop; y < bottom; y += 18) { ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke(); }
  for (let x = left; x < right; x += 18) { ctx.beginPath(); ctx.moveTo(x, tileTop); ctx.lineTo(x, bottom); ctx.stroke(); }
  ctx.fillStyle = '#2F7D6A'; ctx.fillRect(left, tileTop - 6, w, 6);

  // 2. The ceiling: drop tiles and strip lights (one on the blink)
  ctx.fillStyle = '#D6D3D1'; ctx.fillRect(left, top, w, 34);
  ctx.strokeStyle = '#A8A29E'; for (let x = left; x < right; x += 60) { ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top + 34); ctx.stroke(); }
  for (let i = 0; i < 4; i++) {
    const lx = left + 70 + i * 170;
    const on = !(i === 2 && Math.floor(frame / 9) % 11 < 2);
    ctx.fillStyle = on ? '#FEFCE8' : '#A8A29E'; ctx.fillRect(lx, top + 34, 110, 8);
    if (on) {
      // (its pool of light down the wall, in steps)
      for (let k = 0; k < 5; k++) {
        const a = 0.32 * (1 - k / 5), y0 = top + 42 + k * 43.6, y1 = y0 + 43.6, s0 = k / 5, s1 = (k + 1) / 5;
        ctx.fillStyle = `rgba(254, 252, 232, ${a.toFixed(3)})`;
        ctx.beginPath(); ctx.moveTo(lx - 40 * s0, y0); ctx.lineTo(lx + 110 + 40 * s0, y0); ctx.lineTo(lx + 110 + 40 * s1, y1); ctx.lineTo(lx - 40 * s1, y1); ctx.fill();
      }
    }
  }

  // 3. Hanging signs down the aisles
  const hangSign = (x: number, text: string, color: string) => {
    ctx.strokeStyle = '#57534E'; ctx.beginPath(); ctx.moveTo(x - 30, top + 34); ctx.lineTo(x - 30, top + 60); ctx.moveTo(x + 30, top + 34); ctx.lineTo(x + 30, top + 60); ctx.stroke();
    ctx.fillStyle = color; ctx.fillRect(x - 50, top + 60, 100, 22);
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 6px "Press Start 2P", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(text, x, top + 74);
  };
  hangSign(left + 150, 'PAIN RELIEF', '#2563EB');
  hangSign(left + 340, 'SLEEP AIDS', '#7C3AED');

  // 4. The aisles: shelves of boxes and bottles
  const gondola = (x: number, gw: number) => {
    ctx.fillStyle = '#E7E5E4'; ctx.fillRect(x, bottom - 210, gw, 210);
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(x, bottom - 214, gw, 6);
    for (let s = 0; s < 4; s++) {
      const sy = bottom - 200 + s * 50;
      ctx.fillStyle = '#78716C'; ctx.fillRect(x + 4, sy + 40, gw - 8, 4);
      for (let k = 0; k < Math.floor((gw - 12) / 16); k++) {
        const hsh = hash(x + s * 31 + k * 7);
        const bx = x + 8 + k * 16, bh = 18 + hsh * 18;
        ctx.fillStyle = ['#EF4444', '#F97316', '#FACC15', '#22C55E', '#3B82F6', '#A855F7', '#F8FAFC', '#EC4899'][Math.floor(hsh * 8)];
        if (hsh > 0.5) ctx.fillRect(bx, sy + 40 - bh, 12, bh);
        else { ctx.beginPath(); ctx.roundRect(bx + 1, sy + 40 - bh, 10, bh, 3); ctx.fill(); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(bx + 2, sy + 40 - bh - 3, 8, 3); }
      }
    }
    ctx.fillStyle = '#DC2626'; ctx.fillRect(x + gw / 2 - 20, bottom - 232, 40, 16);
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 5px "Press Start 2P", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('SALE!', x + gw / 2, bottom - 221);
  };
  gondola(left + 60, 180);
  gondola(left + 270, 150);

  // 5. The pharmacy counter at the back: pill shelves, Rx, a neon sign, Dale's face
  const cx = right - 290, cw = 250;
  ctx.fillStyle = '#F5F5F4'; ctx.fillRect(cx, bottom - 290, cw, 200);
  for (let s = 0; s < 4; s++) {
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(cx + 10, bottom - 250 + s * 40, cw - 20, 3);
    for (let k = 0; k < 14; k++) { ctx.fillStyle = hash(k + s * 20) > 0.3 ? '#F59E0B' : '#F8FAFC'; ctx.fillRect(cx + 14 + k * 16, bottom - 266 + s * 40, 10, 16); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(cx + 14 + k * 16, bottom - 270 + s * 40, 10, 4); }
  }
  ctx.save();
  ctx.shadowColor = '#22C55E'; ctx.shadowBlur = 14;
  const neon = Math.floor(frame / 50) % 9 !== 0;
  ctx.fillStyle = neon ? '#4ADE80' : '#14532D';
  ctx.font = 'bold 18px "Press Start 2P", sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('PHARMACY', cx + cw / 2, bottom - 306);
  ctx.fillRect(cx - 34, bottom - 330, 10, 30); ctx.fillRect(cx - 44, bottom - 320, 30, 10);
  ctx.restore();
  ctx.fillStyle = '#1D4ED8'; ctx.fillRect(cx + 20, bottom - 90 - 30, 70, 20); ctx.fillStyle = '#B91C1C'; ctx.fillRect(cx + 150, bottom - 90 - 30, 70, 20);
  ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 6px "Press Start 2P", sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('DROP OFF', cx + 55, bottom - 106); ctx.fillText('PICK UP', cx + 185, bottom - 106);
  // The counter itself
  ctx.fillStyle = '#E7E5E4'; ctx.fillRect(cx - 10, bottom - 90, cw + 20, 90);
  ctx.fillStyle = '#6D28D9'; ctx.fillRect(cx - 10, bottom - 90, cw + 20, 10);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(cx - 10, bottom - 6, cw + 20, 6);
  ctx.fillStyle = '#4C1D95'; ctx.font = 'bold 26px serif'; ctx.fillText('Rx', cx + cw / 2, bottom - 36);
  // Dale's framed portrait
  const px = left + 345;
  ctx.fillStyle = '#CA8A04'; ctx.fillRect(px - 30, bottom - 330, 60, 72);
  ctx.fillStyle = '#6D28D9'; ctx.fillRect(px - 24, bottom - 324, 48, 60);
  ctx.fillStyle = '#F5CBA7'; ctx.beginPath(); ctx.arc(px, bottom - 300, 11, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111'; ctx.fillRect(px - 11, bottom - 316, 22, 7); ctx.fillStyle = '#FF007F'; ctx.fillRect(px - 9, bottom - 304, 18, 4);
  ctx.fillStyle = '#FDE047'; ctx.font = '4px "Press Start 2P", sans-serif'; ctx.fillText('PHARMACIST', px, bottom - 268); ctx.fillText('OF EVERY MONTH', px, bottom - 262);

  // 6. Odds and ends: a blood pressure machine, a security mirror, a wet floor sign
  const bpx = left + 450;
  ctx.fillStyle = '#1E40AF'; ctx.fillRect(bpx, bottom - 120, 50, 120); ctx.fillStyle = '#93C5FD'; ctx.fillRect(bpx + 8, bottom - 110, 34, 20);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(bpx + 12, bottom - 60, 26, 26); ctx.fillStyle = '#FFFFFF'; ctx.font = '4px "Press Start 2P", sans-serif'; ctx.fillText('FREE', bpx + 25, bottom - 45);
  ctx.fillStyle = '#E5E7EB'; ctx.beginPath(); ctx.arc(right - 30, top + 70, 22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(148, 163, 184, 0.6)'; ctx.beginPath(); ctx.arc(right - 30, top + 70, 18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.moveTo(left + 250, bottom); ctx.lineTo(left + 262, bottom - 40); ctx.lineTo(left + 274, bottom); ctx.fill();
  ctx.fillStyle = '#111'; ctx.font = '4px "Press Start 2P", sans-serif'; ctx.fillText('WET', left + 262, bottom - 14);

  // 7. The floor: checkerboard linoleum, the slab under it
  ctx.fillStyle = '#57534E'; ctx.fillRect(left - 40, bottom, w + 80, 70);
  ctx.fillStyle = '#78716C'; ctx.fillRect(left - 40, bottom, w + 80, 4);
  ctx.fillStyle = '#F5F5F4'; ctx.fillRect(left, bottom - 14, w, 14);
  ctx.fillStyle = '#6B7280';
  for (let x = left, k = 0; x < right; x += 16, k++) ctx.fillRect(x, bottom - 14 + (k % 2) * 7, 16, 7);
  ctx.textAlign = 'left';
};

/**
 * The pharmacy's front doors (left) and back wall (right), over the arena's own walls: standing, cracking as the
 * truck's about to hit, blowing apart (glass and aluminum, or brick and plaster, flying, a cloud of dust), then a
 * ragged hole with the night outside and rubble along the bottom. (Only once the door's shut behind Meathead: till
 * then the way in is the way in.)
 */
const drawDaleWalls = (ctx: CanvasRenderingContext2D, left: number, right: number, top: number, bottom: number, frame: number, boss: Enemy | undefined, doorShut: boolean) => {
  if (!boss) return;
  const lx = left - 40, rx = right;
  const outside = (x: number, w: number, y1: number) => {
    bandedGradient(ctx, x, y1, w, bottom - y1, ['#2E1A55', '#5A2A62', '#A8406E', '#D07068', '#F4A261'], 10);
  };
  // --- The front doors
  if (doorShut) {
    const down = boss.leftWallDownAt;
    ctx.fillStyle = '#E7E5E4'; ctx.fillRect(lx, top, 40, bottom - top);
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(lx + 34, top, 6, bottom - top);
    const dy = bottom - 180;
    if (down === undefined) {
      // Sliding glass doors, ENTER and all
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(lx, dy, 40, 180);
      ctx.fillStyle = 'rgba(147, 197, 253, 0.55)'; ctx.fillRect(lx + 4, dy + 6, 32, 174);
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(lx + 8, dy + 12, 4, 60);
      ctx.fillStyle = '#16A34A'; ctx.fillRect(lx + 6, dy + 80, 28, 10); ctx.fillStyle = '#FFFFFF'; ctx.font = '4px "Press Start 2P", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('ENTER', lx + 20, dy + 87); ctx.textAlign = 'left';
    } else {
      // Gone: the frame bent in, a few teeth of glass left, the street outside
      outside(lx, 40, dy);
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(lx, dy - 6, 40, 8);
      ctx.save(); ctx.translate(lx + 36, dy); ctx.rotate(0.35); ctx.fillRect(0, 0, 5, 90); ctx.restore();
      ctx.fillStyle = 'rgba(191, 219, 254, 0.8)';
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(lx + k * 10, dy + 2); ctx.lineTo(lx + k * 10 + 8, dy + 2); ctx.lineTo(lx + k * 10 + 3, dy + 14 + hash(k) * 24); ctx.fill(); }
      ctx.fillStyle = '#78716C'; for (let k = 0; k < 6; k++) ctx.fillRect(lx - 4 + k * 9, bottom - 6 - (k % 2) * 3, 7, 6);
      burst(ctx, frame - down, lx + 20, dy + 90, 1, bottom, 'glass');
    }
  }
  // --- The back wall (the truck coming at it: it bulges and cracks just before)
  const down = boss.rightWallDownAt;
  const hy = bottom - 190;
  if (down === undefined) {
    const front = boss.truckActive && boss.truckX !== undefined ? boss.truckX + 350 : -1e9;
    const k = Math.max(0, Math.min(1, (front - (rx - 110)) / 110));
    ctx.save(); if (k > 0) ctx.translate((Math.random() - 0.5) * k * 4, 0);
    ctx.fillStyle = '#E7E5E4'; ctx.fillRect(rx, top, 40, bottom - top);
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(rx, top, 6, bottom - top);
    // The staff door
    ctx.fillStyle = '#78716C'; ctx.fillRect(rx + 4, bottom - 150, 32, 150);
    ctx.fillStyle = '#FACC15'; ctx.fillRect(rx + 6, bottom - 130, 28, 14);
    ctx.fillStyle = '#111827'; ctx.font = '3px "Press Start 2P", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('EMPLOYEES', rx + 20, bottom - 124); ctx.fillText('ONLY', rx + 20, bottom - 119); ctx.textAlign = 'left';
    if (k > 0) {
      ctx.strokeStyle = '#44403C'; ctx.lineWidth = 1.5;
      for (let c = 0; c < Math.ceil(k * 6); c++) { ctx.beginPath(); ctx.moveTo(rx + 4, bottom - 80); ctx.lineTo(rx + 4 + hash(c) * 30, bottom - 80 + (hash(c + 5) - 0.5) * 160); ctx.stroke(); }
    }
    ctx.restore();
  } else {
    // A ragged hole right through it, the night outside, bricks showing in the edges, a pile of it along the bottom
    ctx.fillStyle = '#E7E5E4'; ctx.fillRect(rx, top, 40, hy - top + 10);
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(rx, top, 6, hy - top + 10);
    outside(rx, 40, hy);
    ctx.fillStyle = '#B91C1C';
    for (let k = 0; k < 7; k++) ctx.fillRect(rx + (k % 3) * 12, hy - 4 + (k % 2) * 6 + Math.floor(k / 3) * 3, 11, 5);
    ctx.fillStyle = '#E7E5E4';
    ctx.beginPath(); ctx.moveTo(rx, hy); for (let k = 0; k <= 8; k++) ctx.lineTo(rx + k * 5, hy + 6 + hash(k + 40) * 16); ctx.lineTo(rx + 40, hy); ctx.fill();
    ctx.fillStyle = '#78716C'; for (let k = 0; k < 9; k++) ctx.fillRect(rx - 26 + k * 9, bottom - 8 - (k % 3) * 4, 10, 8);
    ctx.fillStyle = '#B91C1C'; for (let k = 0; k < 5; k++) ctx.fillRect(rx - 20 + k * 13, bottom - 16 - (k % 2) * 5, 9, 5);
    burst(ctx, frame - down, rx + 20, hy + 90, 1, bottom, 'brick');
  }
};

/**
 * The wall coming apart, t frames after the hit: bits flying the way the truck's going and landing on the floor, a
 * cloud of dust rolling out and settling. (Worked out from t, so it plays the same however it's drawn.)
 */
const burst = (ctx: CanvasRenderingContext2D, t: number, x: number, y: number, dir: number, floor: number, kind: 'glass' | 'brick') => {
  if (t < 0 || t > 120) return;
  // The flash of the hit
  if (t < 5) { ctx.fillStyle = `rgba(255, 255, 255, ${0.8 - t * 0.15})`; ctx.beginPath(); ctx.arc(x, y, 90, 0, Math.PI * 2); ctx.fill(); }
  // Bits flying
  for (let i = 0; i < 22; i++) {
    const vx = dir * (2 + hash(i) * 9) - 1.5, vy = -(3 + hash(i + 50) * 9);
    const px = x + vx * t, py = Math.min(floor - 4, y - 60 + hash(i + 9) * 120 + vy * t + 0.3 * t * t);
    ctx.save(); ctx.translate(px, py);
    if (py < floor - 4) ctx.rotate(t * (0.2 + hash(i + 3) * 0.3));
    if (kind === 'glass') {
      ctx.fillStyle = i % 3 === 0 ? '#9CA3AF' : 'rgba(191, 219, 254, 0.9)';
      ctx.beginPath(); ctx.moveTo(-5, -4); ctx.lineTo(6, -2); ctx.lineTo(-1, 6); ctx.fill();
    } else {
      ctx.fillStyle = i % 3 === 0 ? '#E7E5E4' : i % 3 === 1 ? '#B91C1C' : '#991B1B';
      ctx.fillRect(-6, -3, 12, 6);
    }
    ctx.restore();
  }
  // The dust
  for (let i = 0; i < 7; i++) {
    const r = 20 + t * (0.8 + hash(i + 20) * 0.8);
    const a = Math.max(0, 0.45 - t / 260);
    ctx.fillStyle = `rgba(214, 211, 209, ${a})`;
    ctx.beginPath(); ctx.arc(x + dir * (i * 14 + t * 0.6) - 20, floor - 20 - hash(i) * 80 - t * 0.2, r, 0, Math.PI * 2); ctx.fill();
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
  bandedGradient(ctx, left, top, w, bottom - top, ['#120B09', '#1A100D', '#221410', '#1D110E', '#180E0C'], 12);

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

/**
 * Hector's arena, filthier the more poop logs have gone into his wind: smears of it up the windows and the pylons with
 * runs down them, a sludge of it building up along the deck with logs and lumps in it, a brown haze over the lot,
 * flies over the worst of it, stink coming up off it, and the telemetry on the glass with something to say about the
 * air. `f`: 0 clean .. 1 as bad as it gets. Every mark has its own place and turns up at its own level, so it builds.
 */
const drawHectorFilth = (ctx: CanvasRenderingContext2D, left: number, right: number, top: number, bottom: number, frame: number, f: number) => {
  if (f < 0.01) return;
  const w = right - left;
  const h = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const BROWN = ['#4A2F12', '#5C3A17', '#6B4423', '#3B2410'];
  ctx.save();
  ctx.beginPath(); ctx.rect(left, top, w, bottom - top); ctx.clip();
  // Smears up the glass and the pylons, each with a run down from it (longer the longer it's been that bad)
  for (let i = 0; i < 34; i++) {
    const at = h(i) * 0.95;
    if (f < at) continue;
    const k = Math.min(1, (f - at) / 0.15);
    const x = left + 20 + h(i + 50) * (w - 40), y = top + 30 + h(i + 90) * (bottom - top - 120), r = (6 + h(i + 130) * 14) * k;
    ctx.fillStyle = BROWN[i % BROWN.length];
    ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.ellipse(x, y, r, r * (0.6 + h(i + 7) * 0.4), h(i + 3) * 3, 0, Math.PI * 2); ctx.fill();
    for (let s = 0; s < 4; s++) { const a = h(i * 5 + s) * Math.PI * 2; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 1.4, y + Math.sin(a) * r * 1.2, 1 + h(i + s) * 2, 0, Math.PI * 2); ctx.fill(); }
    const run = (8 + h(i + 170) * 50) * k * Math.min(1, f * 1.4);
    ctx.fillRect(x - 1.5, y, 3, run); ctx.beginPath(); ctx.ellipse(x, y + run, 2.2, 3, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // The sludge along the deck: a layer of it building up, lumpy, logs in it
  const depth = 2 + f * 12;
  ctx.fillStyle = '#4A2F12';
  ctx.beginPath(); ctx.moveTo(left, bottom);
  for (let x = left; x <= right; x += 12) ctx.lineTo(x, bottom - 14 - depth + Math.sin(x * 0.07 + 1.3) * 2 * f - h(Math.floor(x / 12)) * 3 * f);
  ctx.lineTo(right, bottom); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(150, 110, 50, 0.4)'; for (let x = left + 6; x < right; x += 23) ctx.fillRect(x, bottom - 14 - depth + 1, 6, 1.5);
  for (let i = 0; i < 26; i++) {
    const at = h(i + 300) * 0.9;
    if (f < at) continue;
    const x = left + 30 + h(i + 320) * (w - 60), y = bottom - 14 - depth + 2;
    ctx.save(); ctx.translate(x, y); ctx.rotate((h(i + 340) - 0.5) * 0.8);
    ctx.fillStyle = BROWN[(i + 1) % BROWN.length]; ctx.beginPath(); ctx.roundRect(-11, -5, 22, 9, 4); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(-4, -5, 1.5, 9); ctx.fillRect(4, -5, 1.5, 9);
    ctx.restore();
  }
  // A brown haze over the whole room
  ctx.fillStyle = `rgba(92, 64, 24, ${0.28 * f})`; ctx.fillRect(left, top, w, bottom - top);
  // Stink coming up off the deck
  if (f > 0.3) {
    ctx.strokeStyle = `rgba(132, 160, 60, ${0.5 * (f - 0.3) / 0.7})`; ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const x = left + 40 + h(i + 400) * (w - 80), t = ((frame * 0.6 + i * 37) % 90) / 90;
      const y0 = bottom - 20 - depth - t * 120;
      ctx.globalAlpha = 1 - t;
      ctx.beginPath(); ctx.moveTo(x, y0); for (let k = 1; k <= 6; k++) ctx.lineTo(x + Math.sin(k * 1.4 + frame * 0.1) * 5, y0 - k * 7); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  // Flies, over the worst of it
  ctx.fillStyle = '#0B0B0B';
  const flies = Math.floor(f * 28);
  for (let i = 0; i < flies; i++) {
    const cx = left + 40 + h(i + 500) * (w - 80), cy = bottom - 40 - h(i + 520) * 60;
    const a = frame * (0.18 + h(i + 540) * 0.2) + i;
    ctx.fillRect(cx + Math.cos(a) * 14 + Math.sin(a * 2.3) * 4, cy + Math.sin(a * 1.7) * 9, 2, 2);
  }
  // The telemetry on the glass: something to say about the air
  if (f > 0.4) {
    ctx.fillStyle = Math.floor(frame / 20) % 2 ? 'rgba(239, 68, 68, 0.9)' : 'rgba(253, 224, 71, 0.9)';
    ctx.font = '7px monospace';
    ctx.fillText(f > 0.85 ? 'AIR QUALITY: BIOHAZARD // DO NOT BREATHE' : 'AIR QUALITY: HAZARDOUS // FECAL PARTICULATE DETECTED', left + 40, top + 64);
  }
  ctx.restore();
};
