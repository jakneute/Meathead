import { GameStatus, Pickup, Enemy, TommyBoard, DamageNumber } from '../../types';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, BOSS_DOOR_X, ARENA_LEFT, ARENA_RIGHT,
} from '../../constants';
import { STAGE_COLORS } from '../../stages';
import { GameState } from '../state';
import { drawCustomBossArena } from './arenaRenderers';
import { drawBoss, drawBossOverlay } from './bosses';
import { drawPlayer } from './playerRenderer';
import {
  drawOilSlicks, drawOscarFire, drawOscarLaser, drawOscarRocket, drawFlyingCigarette, drawTaserOverload,
} from './oscarRenderer';

export interface WorldView {
  status: GameStatus;
  stageId: string | null;
  currentWeapon: GameState['player']['currentWeapon'];
  invincibilityEnabled: boolean;
  bossTauntText: string;
}

const FONT = '"Press Start 2P"';

/** Renders one frame of the game world (everything except the React HUD/menus). */
export const drawWorld = (ctx: CanvasRenderingContext2D, state: GameState, view: WorldView) => {
  const { status, stageId } = view;
  if (status === GameStatus.STAGE_SELECT || status === GameStatus.START) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    return;
  }

  const colors = STAGE_COLORS[stageId || ""] || { ground: COLORS.GROUND, bg: COLORS.BG_DARK, accent: '#fff' };
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // World space (camera + screen shake)
  ctx.save();
  if (state.screenShakeTimer > 0) {
    const m = state.screenShakeMagnitude * 2;
    ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
  }
  ctx.translate(-state.camera.x, -state.camera.y);

  drawBlocks(ctx, state, colors);
  if (stageId === 'Toxic Tommy' && state.arenaLocked) {
    drawTommyShaft(ctx, state);
  } else if (stageId && (state.arenaLocked || state.camera.x >= BOSS_DOOR_X - 100)) {
    const hurricane = state.enemies.find(e => e.type === 'boss' && e.bossState === 'hurricane' && e.health > 0);
    drawCustomBossArena(ctx, stageId, state.frame || 0, hurricane ? hurricane.pos.x + hurricane.width / 2 : null);
  }
  drawBossHazards(ctx, state);
  drawOilSlicks(ctx, state);
  drawProjectiles(ctx, state, 'puddles');
  state.pickups.forEach(p => drawPickup(ctx, p));
  drawEnemies(ctx, state, view);
  if (stageId === 'Toxic Tommy' && state.arenaLocked && state.tommyBoards) drawTommyPool(ctx, state);
  if (status !== GameStatus.LEVEL_INTRO || state.introTimer >= 80) {
    drawPlayer(ctx, state.player, state, {
      currentWeapon: view.currentWeapon,
      showFilthShield: status === GameStatus.PLAYING,
      invincibilityEnabled: view.invincibilityEnabled,
    });
    drawTaserOverload(ctx, state.player, state.frame);
    drawPlayerSpeech(ctx, state);
  }
  drawOscarFire(ctx, state);
  drawOscarLaser(ctx, state);
  if (state.player.isTasing && state.player.currentWeapon === 'TASER') drawTaserBeam(ctx, state);
  drawProjectiles(ctx, state, 'flying');
  drawParticlesAndDamageNumbers(ctx, state);
  drawBarryLighting(ctx, state, stageId);
  ctx.restore();

  // Screen space
  if (state.victoryString && (status === GameStatus.PLAYING || status === GameStatus.VICTORY)) drawVictoryText(ctx, state.victoryString);
  if (state.deathTimer > 0 && state.deathString) drawDeathMessage(ctx, state.deathString);
};

const drawBlocks = (ctx: CanvasRenderingContext2D, state: GameState, colors: { ground: string, accent: string }) => {
  state.blocks.forEach(b => {
    if (b.type === 'door') ctx.fillStyle = '#555';
    else if (b.type === 'pit') ctx.fillStyle = '#f00';
    else {
      ctx.fillStyle = colors.ground;
      ctx.strokeStyle = colors.accent;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
    }
    ctx.fillRect(b.x, b.type === 'door' ? b.y - state.doorOpenAmount : b.y, b.w, b.h);
  });
};

/** Endless scrolling sewer shaft behind Toxic Tommy's arena. */
const drawTommyShaft = (ctx: CanvasRenderingContext2D, state: GameState) => {
  ctx.save();
  const arenaLeft = ARENA_LEFT;
  const arenaRight = ARENA_RIGHT;
  const arenaW = arenaRight - arenaLeft;

  // Dark industrial sewer shaft walls
  ctx.fillStyle = '#0a1a0f';
  ctx.fillRect(arenaLeft, -1200, arenaW, 2000);

  // Looping brick pattern moving with state.tommyScrollY
  ctx.strokeStyle = '#14301d';
  ctx.lineWidth = 1;
  const rowH = 30;
  const brickW = 60;
  const scrollOffset = state.tommyScrollY % rowH;
  for (let y = -500 + scrollOffset; y < 650; y += rowH) {
    ctx.beginPath();
    ctx.moveTo(arenaLeft, y);
    ctx.lineTo(arenaRight, y);
    ctx.stroke();
    const rowIdx = Math.floor(y / rowH);
    const xOffset = (rowIdx % 2) * (brickW / 2);
    for (let x = arenaLeft + xOffset; x < arenaRight; x += brickW) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + rowH);
      ctx.stroke();
    }
  }

  // Vertical dripping pipes
  const pipeXs = [arenaLeft + 80, arenaLeft + 220, arenaRight - 220, arenaRight - 80];
  pipeXs.forEach((px, pIdx) => {
    ctx.fillStyle = '#1c281e';
    ctx.fillRect(px, -500, 16, 1150);
    ctx.fillStyle = '#2d4732';
    ctx.fillRect(px + 3, -500, 4, 1150);
    // Slime leak dripping down pipes
    const dripY = ((-500 + state.frame * (3 + pIdx) * 2) % 900) - 200;
    ctx.fillStyle = '#2ECC71';
    ctx.beginPath();
    ctx.arc(px + 8, dripY, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Biohazard warning stripes on left and right borders
  const drawHazardWall = (wallX: number) => {
    ctx.fillStyle = '#1b241c';
    ctx.fillRect(wallX, -500, 20, 1150);
    for (let y = -500 + (state.frame % 30); y < 650; y += 30) {
      ctx.fillStyle = '#F1C40F';
      ctx.beginPath();
      ctx.moveTo(wallX, y);
      ctx.lineTo(wallX + 20, y + 15);
      ctx.lineTo(wallX + 20, y + 25);
      ctx.lineTo(wallX, y + 10);
      ctx.closePath();
      ctx.fill();
    }
  };
  drawHazardWall(arenaLeft);
  drawHazardWall(arenaRight - 20);

  ctx.restore();
};

/** Victor's volcano vents and telegraphs, steam blasts, and Hector's poop warnings. */
const drawBossHazards = (ctx: CanvasRenderingContext2D, state: GameState) => {
  // DRAW VOLCANO VENTS & EFFECTS
  state.bossVolcanoTelegraphs.forEach(v => {
    ctx.save();
    ctx.globalAlpha = 0.5 + Math.sin(state.frame * 0.2) * 0.3;
    ctx.fillStyle = 'red';
    if (v.type === 'wall') {
      const isLeft = v.pos.x < 7600;
      ctx.fillRect(v.pos.x + (isLeft ? 0 : -60), v.pos.y - 20, 60, 40);
      // Arrow
      ctx.fillStyle = 'yellow';
      ctx.beginPath();
      const ax = v.pos.x + (isLeft ? 30 : -30);
      ctx.moveTo(ax, v.pos.y - 10);
      ctx.lineTo(ax + (isLeft ? 20 : -20), v.pos.y);
      ctx.lineTo(ax, v.pos.y + 10);
      ctx.fill();
    } else {
      ctx.fillRect(v.pos.x - 30, v.pos.y - 60, 60, 60);
      // Arrow
      ctx.fillStyle = 'yellow';
      ctx.beginPath();
      ctx.moveTo(v.pos.x - 10, v.pos.y - 30);
      ctx.lineTo(v.pos.x, v.pos.y - 50);
      ctx.lineTo(v.pos.x + 10, v.pos.y - 30);
      ctx.fill();
    }
    ctx.restore();
  });

  state.bossVolcanoes.forEach(v => {
    ctx.save();
    // Draw the Vent itself
    ctx.fillStyle = '#4E342E';
    ctx.strokeStyle = '#BA4A00';
    ctx.lineWidth = 3;
    if (v.type === 'wall') {
      const isLeft = v.pos.x < 7600;
      ctx.beginPath();
      if (isLeft) {
        ctx.moveTo(v.pos.x, v.pos.y - 30);
        ctx.lineTo(v.pos.x + 25, v.pos.y - 15);
        ctx.lineTo(v.pos.x + 25, v.pos.y + 15);
        ctx.lineTo(v.pos.x, v.pos.y + 30);
      } else {
        ctx.moveTo(v.pos.x, v.pos.y - 30);
        ctx.lineTo(v.pos.x - 25, v.pos.y - 15);
        ctx.lineTo(v.pos.x - 25, v.pos.y + 15);
        ctx.lineTo(v.pos.x, v.pos.y + 30);
      }
      ctx.fill(); ctx.stroke();
      // Heat glow
      ctx.fillStyle = (state.frame % 4 === 0) ? '#FFD700' : '#FF4500';
      ctx.beginPath();
      ctx.arc(v.pos.x + (isLeft ? 5 : -5), v.pos.y, 8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(v.pos.x - 30, v.pos.y);
      ctx.lineTo(v.pos.x - 15, v.pos.y - 25);
      ctx.lineTo(v.pos.x + 15, v.pos.y - 25);
      ctx.lineTo(v.pos.x + 30, v.pos.y);
      ctx.fill(); ctx.stroke();
      // Heat glow
      ctx.fillStyle = (state.frame % 4 === 0) ? '#FFD700' : '#FF4500';
      ctx.beginPath();
      ctx.arc(v.pos.x, v.pos.y - 5, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  state.bossSteamExplosions.forEach(s => {
    ctx.save();
    ctx.globalAlpha = s.life / 45;
    const gradient = ctx.createRadialGradient(s.pos.x, s.pos.y, 0, s.pos.x, s.pos.y, s.radius);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.4, '#E0F7FA');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(s.pos.x, s.pos.y, s.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // RENDER POOP TELEGRAPHS
  state.bossPoopTelegraphs.forEach(t => {
     if (Math.floor(state.frame / 4) % 2 === 0) {
        ctx.save();
        const tx = t.pos.x; // World coords
        const ty = t.pos.y;
        // Exclamation top
        ctx.fillStyle = '#FF0000';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tx, ty - 40);
        ctx.lineTo(tx + 10, ty - 40);
        ctx.lineTo(tx + 5, ty - 10);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Poop dot
        ctx.fillStyle = '#5D4037';
        ctx.beginPath();
        ctx.moveTo(tx, ty - 5);
        ctx.quadraticCurveTo(tx + 5, ty - 15, tx + 10, ty - 5);
        ctx.lineTo(tx + 12, ty);
        ctx.lineTo(tx - 2, ty);
        ctx.fill(); ctx.stroke();
        ctx.restore();
     }
  });
};

const drawPickup = (ctx: CanvasRenderingContext2D, p: Pickup) => {
  const isHealth = p.type.includes('health');
  ctx.fillStyle = isHealth ? 'red' : 'yellow';
  const thick = isHealth ? (p.type === 'large_health' ? 10 : 5) : (p.type === 'large_ammo' ? 12 : 6);
  ctx.fillRect(p.pos.x + p.width / 2 - thick / 2, p.pos.y, thick, p.height);
  ctx.fillRect(p.pos.x, p.pos.y + p.height / 2 - thick / 2, p.width, thick);
};

const drawEnemies = (ctx: CanvasRenderingContext2D, state: GameState, { status, stageId, bossTauntText }: WorldView) => {
  const { enemies, player } = state;
  enemies.forEach(e => {
    if (e.health <= 0 && !e.isBlownAway) return;
    ctx.save();
    if (e.isTased && player.isTasing && player.taserTargetId === e.id) {
       ctx.translate((Math.random()-0.5)*10, (Math.random()-0.5)*10);
    }
    if (e.isBlownAway) { ctx.translate(e.pos.x + e.width / 2, e.pos.y + e.height / 2); ctx.rotate(e.rotation || 0); ctx.translate(-(e.pos.x + e.width / 2), -(e.pos.y + e.height / 2)); }
    else if (e.type === 'boss' && state.arenaLocked && e.hitCooldown && e.hitCooldown > 0 && Math.floor(state.frame / 5) % 2 === 0) ctx.globalAlpha = 0.4;

    if (e.needleCount && e.needleCount > 0) ctx.filter = `hue-rotate(${(state.frame * e.needleCount * 5) % 360}deg) saturate(2)`;
    if (e.isOiled) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#000000';
      // Apply a dark, greasy filter
      ctx.filter = (ctx.filter && ctx.filter !== 'none' ? ctx.filter + ' ' : '') + 'brightness(0.4) contrast(1.2)';
    }
    if (e.type === 'boss') {
      if (state.bossExplosionTimer <= 0) drawBoss(ctx, e, stageId, state.frame);
      const curT = (status === GameStatus.BOSS_INTRO && bossTauntText) ? bossTauntText : (state.bossVulgarityTimer > 0 ? state.bossLastVulgarity : null);
      if (curT && state.bossExplosionTimer <= 0) { ctx.save(); ctx.font = 'bold 12px "Press Start 2P"'; ctx.fillStyle = 'white'; ctx.shadowColor = 'black'; ctx.shadowBlur = 6; ctx.textAlign = 'center'; ctx.fillText(curT, e.pos.x + e.width / 2, e.pos.y - 30); ctx.restore(); }
      drawBossOverlay(ctx, e, stageId, state.frame);
    } else {
      if (e.enemyType === 'shield') { ctx.fillStyle = '#444'; ctx.fillRect(e.pos.x + 10, e.pos.y, e.width - 10, e.height); if (e.isShieldActive) { ctx.fillStyle = '#2C3E50'; ctx.fillRect(e.pos.x, e.pos.y - 5, 15, e.height + 10); ctx.strokeStyle = '#00FFFF'; ctx.lineWidth = 2; ctx.strokeRect(e.pos.x, e.pos.y - 5, 15, e.height + 10); } else { ctx.fillStyle = '#7F8C8D'; ctx.fillRect(e.pos.x + 5, e.pos.y + 10, 10, e.height - 20); } } else if (e.id.startsWith('rusher')) ctx.fillStyle = '#9B59B6'; else if (e.enemyType === 'flyer' && e.width > 60) ctx.fillStyle = '#34495E'; else ctx.fillStyle = e.enemyType === 'flyer' ? COLORS.ENEMY_FLYER : (e.enemyType === 'drone' ? COLORS.ENEMY_DRONE : COLORS.ENEMY_TANK);
      if (!(e.enemyType === 'shield')) ctx.fillRect(e.pos.x, e.pos.y, e.width, e.height);
      if (e.isOiled) {
         // Greasy shine effect
         ctx.save();
         ctx.globalAlpha = 0.4;
         ctx.fillStyle = '#FFFFFF';
         const shineX = (state.frame * 2) % (e.width * 2) - e.width;
         ctx.beginPath();
         ctx.moveTo(e.pos.x + shineX, e.pos.y);
         ctx.lineTo(e.pos.x + shineX + 15, e.pos.y);
         ctx.lineTo(e.pos.x + shineX + 15 + 10, e.pos.y + e.height);
         ctx.lineTo(e.pos.x + shineX + 10, e.pos.y + e.height);
         ctx.closePath();
         ctx.clip(); // Only shine on the enemy
         ctx.fillRect(e.pos.x, e.pos.y, e.width, e.height);
         ctx.restore();
      }
    }
    if (e.frozenTimer && e.frozenTimer > 0) { ctx.fillStyle = 'rgba(0, 255, 255, 0.4)'; ctx.fillRect(e.pos.x - 5, e.pos.y - 5, e.width + 10, e.height + 10); }
    if (e.isTased && player.isTasing && player.taserTargetId === e.id) {
      ctx.fillStyle = 'rgba(0, 229, 255, 0.4)';
      ctx.fillRect(e.pos.x - 5, e.pos.y - 5, e.width + 10, e.height + 10);
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2;
      for(let j=0; j<4; j++){ ctx.beginPath(); const sx = e.width/2, sy = e.height/2; ctx.moveTo(sx, sy); ctx.lineTo(sx + (Math.random()-0.5)*100, sy + (Math.random()-0.5)*100); ctx.stroke(); }
    }
    drawStuckNeedles(ctx, e, state.frame);
    if (!e.isBlownAway) { ctx.fillStyle = '#00FF00'; ctx.fillRect(e.pos.x, e.pos.y - 10, (e.health / e.maxHealth) * e.width, 5); }
    ctx.restore();
  });
};

export const drawStuckNeedles = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  if (!e.needleOffsets || e.needleOffsets.length === 0 || (e.needleCount || 0) <= 0) return;

  ctx.save();
  ctx.filter = 'none'; // Keep stuck syringe colors sharp and un-tinted

  e.needleOffsets.forEach((off, idx) => {
    ctx.save();
    ctx.translate(e.pos.x + off.x, e.pos.y + off.y);

    // Subtle organic twitch / vibration of the stuck needle
    const twitch = Math.sin(frame * 0.4 + idx * 2.1) * 0.08;
    ctx.rotate(off.rot + twitch);

    // 1. Steel needle / cannula (penetrates into enemy body along trajectory)
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(6, 0);
    ctx.stroke();

    // Needle hub / base collar
    ctx.fillStyle = '#9CA3AF';
    ctx.fillRect(-6, -2, 2.5, 4);

    // 2. Syringe barrel (clear glass tube, length 12px, height 6px)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillRect(-18, -3, 12, 6);

    // Glowing toxic drug fluid inside barrel
    const DRUG_COLORS = ['#FF007F', '#39FF14', '#FFD700', '#00F0FF'];
    const drugCol = DRUG_COLORS[idx % DRUG_COLORS.length];
    ctx.fillStyle = drugCol;
    ctx.fillRect(-17, -2, 10, 4);

    // Glass sheen highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(-17, -3, 10, 1.5);

    // Syringe barrel white border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.strokeRect(-18, -3, 12, 6);

    // 3. Syringe finger flange
    ctx.fillStyle = '#E5E7EB';
    ctx.fillRect(-19.5, -5, 1.5, 10);
    ctx.strokeStyle = '#6B7280';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-19.5, -5, 1.5, 10);

    // 4. Syringe plunger rod
    ctx.fillStyle = '#9CA3AF';
    ctx.fillRect(-24, -1, 4.5, 2);

    // 5. Plunger thumb press button (bright red cap)
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-25.5, -4, 2, 8);
    ctx.strokeStyle = '#7F1D1D';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-25.5, -4, 2, 8);

    // 6. Occasional drug droplet dripping from puncture site
    if ((frame + idx * 8) % 30 < 12) {
      ctx.fillStyle = drugCol;
      ctx.beginPath();
      ctx.arc(-2, 3.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });

  ctx.restore();
};

/** Toxic Tommy's floating boards, entrance catwalk and the rising sludge pool. */
const drawTommyPool = (ctx: CanvasRenderingContext2D, state: GameState) => {
  const arenaLeft = ARENA_LEFT;
  const arenaRight = ARENA_RIGHT;

  // 0. Safe entrance steel catwalk right at the doorway
  ctx.save();
  const catwalkX = BOSS_DOOR_X;
  const catwalkW = 90;
  const catwalkY = 480;
  ctx.fillStyle = '#374151';
  ctx.fillRect(catwalkX, catwalkY, catwalkW, 16);
  ctx.fillStyle = '#1F2937';
  ctx.fillRect(catwalkX, catwalkY + 16, catwalkW, 54);
  // Hazard diagonal yellow stripes along top
  for (let sx = catwalkX; sx < catwalkX + catwalkW; sx += 18) {
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(sx, catwalkY);
    ctx.lineTo(sx + 8, catwalkY);
    ctx.lineTo(sx + 3, catwalkY + 16);
    ctx.lineTo(sx - 5, catwalkY + 16);
    ctx.closePath();
    ctx.fill();
  }
  // Steel rivets
  ctx.fillStyle = '#9CA3AF';
  ctx.fillRect(catwalkX + 8, catwalkY + 4, 4, 4);
  ctx.fillRect(catwalkX + catwalkW - 12, catwalkY + 4, 4, 4);
  ctx.restore();

  // 1. Draw the 8 Floating Boards
  state.tommyBoards.forEach((b: TommyBoard) => {
    const bobY = b.y + Math.sin(state.frame * 0.05 + b.index * 0.8) * 3;
    const bx = b.x + (b.shakeX || 0);

    if (b.status === 'shattered') {
      // Shattered: draw jagged broken wood remnants on left and right edge of the gap
      ctx.save();
      ctx.fillStyle = '#5C3A21';
      ctx.fillRect(bx, b.baseY + 4, 8, 10);
      ctx.fillRect(bx + b.w - 8, b.baseY + 4, 8, 10);
      // Bubbling acid in the gap
      ctx.fillStyle = '#ADFF2F';
      ctx.beginPath();
      ctx.arc(bx + b.w / 2, state.tommySludgeY + 4, 6 + Math.sin(state.frame * 0.2 + b.index) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.save();
    if (b.telegraphTimer && b.telegraphTimer > 0) {
      // Glowing toxic hazard telegraph under the board
      ctx.shadowColor = '#ADFF2F';
      ctx.shadowBlur = 18;
      ctx.fillStyle = 'rgba(173, 255, 47, 0.4)';
      ctx.fillRect(bx - 4, bobY - 4, b.w + 8, b.h + 8);
    }

    if (b.status === 'rising') {
      // Translucent or slime-covered as it rises from the sludge
      ctx.globalAlpha = Math.min(1.0, 0.4 + b.riseProgress * 0.6);
    }

    // Main Timber Board
    ctx.fillStyle = '#8B5A2B';
    ctx.fillRect(bx, bobY, b.w, b.h);
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, bobY, b.w, b.h);

    // Wood grain planks
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bx + 4, bobY + b.h / 2);
    ctx.lineTo(bx + b.w - 4, bobY + b.h / 2);
    ctx.stroke();

    // Iron end reinforcement brackets
    ctx.fillStyle = '#424242';
    ctx.fillRect(bx, bobY, 8, b.h);
    ctx.fillRect(bx + b.w - 8, bobY, 8, b.h);
    ctx.fillStyle = '#212121';
    ctx.fillRect(bx + 2, bobY + 3, 4, 4);
    ctx.fillRect(bx + 2, bobY + b.h - 7, 4, 4);
    ctx.fillRect(bx + b.w - 6, bobY + 3, 4, 4);
    ctx.fillRect(bx + b.w - 6, bobY + b.h - 7, 4, 4);

    // Toxic green moss/slime dripping off the edges
    ctx.fillStyle = '#2ECC71';
    ctx.fillRect(bx + 12, bobY + b.h - 2, 8, 5);
    ctx.fillRect(bx + b.w - 24, bobY + b.h - 2, 10, 7);

    // If shattering: splinter debris flying
    if (b.status === 'shattering') {
      ctx.fillStyle = '#D7CCC8';
      const splCount = 6;
      for (let s = 0; s < splCount; s++) {
        const sx = bx + (s * (b.w / splCount)) + (Math.random() - 0.5) * 10;
        const sy = bobY - (35 - b.shatterTimer) * 1.5;
        ctx.fillRect(sx, sy, 4, 10);
      }
    }

    // If rising: green slime cascade pouring off
    if (b.status === 'rising') {
      ctx.fillStyle = 'rgba(46, 204, 113, 0.7)';
      ctx.fillRect(bx + 4, bobY + b.h, b.w - 8, 14);
    }

    ctx.restore();
  });

  // 2. Draw the Rising Toxic Sludge (Layered animated waves + radioactive glow or crude oil discoloration)
  ctx.save();
  const sludgeY = state.tommySludgeY;
  const isOiled = state.tommySludgeOiledTimer && state.tommySludgeOiledTimer > 0;

  if (isOiled) {
    // Discolored Crude Engine Oil Sludge (semi-transparent so submerged Tommy is visible)
    ctx.fillStyle = 'rgba(10, 8, 13, 0.45)';
    ctx.fillRect(arenaLeft, sludgeY, arenaRight - arenaLeft, 300);

    const sludgeGrad = ctx.createLinearGradient(0, sludgeY, 0, sludgeY + 120);
    sludgeGrad.addColorStop(0, 'rgba(28, 19, 36, 0.55)');
    sludgeGrad.addColorStop(0.3, 'rgba(20, 12, 26, 0.6)');
    sludgeGrad.addColorStop(1, 'rgba(7, 4, 10, 0.7)');
    ctx.fillStyle = sludgeGrad;
    ctx.fillRect(arenaLeft, sludgeY + 8, arenaRight - arenaLeft, 300);

    // Back wave
    ctx.fillStyle = 'rgba(24, 16, 32, 0.45)';
    ctx.beginPath();
    ctx.moveTo(arenaLeft, sludgeY + 20);
    for (let x = arenaLeft; x <= arenaRight; x += 15) {
      const wy = sludgeY + Math.sin(x * 0.02 + state.frame * 0.04) * 6;
      ctx.lineTo(x, wy);
    }
    ctx.lineTo(arenaRight, sludgeY + 300);
    ctx.lineTo(arenaLeft, sludgeY + 300);
    ctx.closePath();
    ctx.fill();

    // Front wave
    ctx.fillStyle = 'rgba(28, 18, 38, 0.55)';
    ctx.beginPath();
    ctx.moveTo(arenaLeft, sludgeY);
    for (let x = arenaLeft; x <= arenaRight; x += 12) {
      const wy = sludgeY + Math.sin(x * 0.035 - state.frame * 0.06) * 5;
      ctx.lineTo(x, wy);
    }
    ctx.lineTo(arenaRight, sludgeY + 300);
    ctx.lineTo(arenaLeft, sludgeY + 300);
    ctx.closePath();
    ctx.fill();

    // Iridescent rainbow oil sheen crest
    ctx.strokeStyle = '#D946EF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = arenaLeft; x <= arenaRight; x += 12) {
      const wy = sludgeY + Math.sin(x * 0.035 - state.frame * 0.06) * 5;
      if (x === arenaLeft) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    ctx.stroke();

    // Oil slick sheen highlights
    ctx.strokeStyle = '#06B6D4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = arenaLeft + 6; x <= arenaRight; x += 16) {
      const wy = sludgeY + 4 + Math.sin(x * 0.04 - state.frame * 0.05) * 4;
      if (x === arenaLeft + 6) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    ctx.stroke();

    // Oil bubbles
    for (let i = 0; i < 7; i++) {
      const bx = arenaLeft + ((i * 95 + state.frame * 1.5) % (arenaRight - arenaLeft));
      const by = sludgeY - 2 + Math.sin(state.frame * 0.1 + i * 2) * 5;
      const br = 4 + (i % 3) * 2;
      ctx.fillStyle = '#2A1838';
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#E879F9';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  } else {
    // Base radioactive green glow beneath surface (semi-transparent so submerged Tommy is visible)
    ctx.fillStyle = 'rgba(15, 56, 24, 0.45)';
    ctx.fillRect(arenaLeft, sludgeY, arenaRight - arenaLeft, 300);

    // Deep sludge gradient with translucent layers
    const sludgeGrad = ctx.createLinearGradient(0, sludgeY, 0, sludgeY + 120);
    sludgeGrad.addColorStop(0, 'rgba(39, 174, 96, 0.55)');
    sludgeGrad.addColorStop(0.3, 'rgba(25, 111, 61, 0.6)');
    sludgeGrad.addColorStop(1, 'rgba(11, 38, 18, 0.7)');
    ctx.fillStyle = sludgeGrad;
    ctx.fillRect(arenaLeft, sludgeY + 8, arenaRight - arenaLeft, 300);

    // Back wave
    ctx.fillStyle = 'rgba(30, 132, 73, 0.45)';
    ctx.beginPath();
    ctx.moveTo(arenaLeft, sludgeY + 20);
    for (let x = arenaLeft; x <= arenaRight; x += 15) {
      const wy = sludgeY + Math.sin(x * 0.02 + state.frame * 0.04) * 6;
      ctx.lineTo(x, wy);
    }
    ctx.lineTo(arenaRight, sludgeY + 300);
    ctx.lineTo(arenaLeft, sludgeY + 300);
    ctx.closePath();
    ctx.fill();

    // Front wave (bright radioactive slime, semi-transparent)
    ctx.fillStyle = 'rgba(46, 204, 113, 0.55)';
    ctx.beginPath();
    ctx.moveTo(arenaLeft, sludgeY);
    for (let x = arenaLeft; x <= arenaRight; x += 12) {
      const wy = sludgeY + Math.sin(x * 0.035 - state.frame * 0.06) * 5;
      ctx.lineTo(x, wy);
    }
    ctx.lineTo(arenaRight, sludgeY + 300);
    ctx.lineTo(arenaLeft, sludgeY + 300);
    ctx.closePath();
    ctx.fill();

    // Radioactive foam crest
    ctx.strokeStyle = '#ADFF2F';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = arenaLeft; x <= arenaRight; x += 12) {
      const wy = sludgeY + Math.sin(x * 0.035 - state.frame * 0.06) * 5;
      if (x === arenaLeft) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    ctx.stroke();

    // Popping toxic bubbles
    const bubbleCount = 7;
    for (let i = 0; i < bubbleCount; i++) {
      const bx = arenaLeft + ((i * 103 + state.frame * 2) % (arenaRight - arenaLeft));
      const by = sludgeY + Math.sin(bx * 0.035 - state.frame * 0.06) * 5 - 4;
      const bSize = 3 + Math.sin(state.frame * 0.15 + i) * 2;
      ctx.fillStyle = '#ADFF2F';
      ctx.beginPath();
      ctx.arc(bx, by, Math.max(1, bSize), 0, Math.PI * 2);
      ctx.fill();
    }

    // Rising biohazard vapor/steam particles
    ctx.fillStyle = 'rgba(173, 255, 47, 0.25)';
    for (let i = 0; i < 6; i++) {
      const vx = arenaLeft + 40 + ((i * 127 + state.frame * 1.2) % (arenaRight - arenaLeft - 80));
      const vy = sludgeY - ((state.frame * (1.5 + (i % 3) * 0.5) + i * 45) % 350);
      const vSize = 8 + (i % 4) * 3;
      ctx.beginPath();
      ctx.arc(vx, vy, vSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
};

const drawPlayerSpeech = (ctx: CanvasRenderingContext2D, state: GameState) => {
  const { player } = state;
  if (!state.playerLastVulgarity || state.playerVulgarityTimer <= 0 || state.bossExplosionTimer > 0) return;
  ctx.save();
  ctx.font = `bold 10px ${FONT}`;
  ctx.fillStyle = 'white';
  ctx.shadowColor = 'black';
  ctx.shadowBlur = 4;
  ctx.textAlign = 'center';
  ctx.fillText(state.playerLastVulgarity, player.pos.x + player.width / 2, player.pos.y - 20);
  ctx.restore();
};

const drawTaserBeam = (ctx: CanvasRenderingContext2D, state: GameState) => {
  const { player, enemies, projectiles } = state;
  const target = enemies.find(en => en.id === player.taserTargetId) || projectiles.find(pr => pr.id === player.taserTargetId);

  ctx.save();
  ctx.strokeStyle = COLORS.TASER_BOLT;
  ctx.lineWidth = 3;
  ctx.shadowBlur = 10;
  ctx.shadowColor = COLORS.TASER_BOLT;
  const startX = player.pos.x + (player.facing === 1 ? player.width : 0);
  const startY = player.pos.y + 25;

  let endX, endY;
  if (target) {
    endX = target.pos.x + target.width/2;
    endY = target.pos.y + target.height/2;
  } else {
    const taserDist = 400; // Mid-range
    endX = startX + player.facing * taserDist;
    endY = startY + Math.sin(state.frame * 0.4) * 40;
  }

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  const segments = 8;
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const px = startX + (endX - startX) * t + (Math.random() - 0.5) * 40;
    const py = startY + (endY - startY) * t + (Math.random() - 0.5) * 40;
    ctx.lineTo(px, py);
  }
  ctx.lineTo(endX, endY);
  ctx.stroke();

  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
};

/** Puddles lie on the floor under everyone; everything else flies over them. */
const drawProjectiles = (ctx: CanvasRenderingContext2D, state: GameState, layer: 'puddles' | 'flying') => {
  state.projectiles.forEach(p => {
    if ((layer === 'puddles') !== !!(p.isSludge && p.isLingering)) return;
    ctx.save();
    if (p.isBoulder) {
      ctx.save(); ctx.translate(p.pos.x + p.width/2, p.pos.y + p.height/2); ctx.rotate(p.pos.x * 0.05); ctx.fillStyle = p.owner === 'player' ? '#8B4513' : '#4E342E'; ctx.beginPath(); const seg = 10, bR = p.width / 2; for (let i = 0; i < seg; i++) { const a = (i / seg) * Math.PI * 2, v = 0.85 + Math.abs(Math.sin(i * 3 + (p.id.length % 5))) * 0.3, r = bR * v, x = Math.cos(a) * r, y = Math.sin(a) * r; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'black'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    }
    else if (p.isSludge) {
      ctx.save();
      ctx.translate(p.pos.x + p.width/2, p.pos.y + p.height/2);
      if (p.isLingering) {
          ctx.fillStyle = '#1B5E20';
          const rx = p.width / 2;
          const ry = p.height / 2;
          const seed = (p.id.length * 123) % 1000;

          // Multiple overlapping ellipses for natural look
          for (let i = 0; i < 4; i++) {
            ctx.save();
            const bx = (Math.sin(seed + i * 2) * rx * 0.3);
            const by = (Math.cos(seed + i * 2) * ry * 0.2);
            const bw = rx * (0.8 + Math.sin(seed + i) * 0.3);
            const bh = ry * (0.7 + Math.cos(seed + i) * 0.4);
            ctx.translate(bx, by);
            ctx.beginPath();
            ctx.ellipse(0, 0, bw, bh, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // Bubbles
          ctx.fillStyle = '#ADFF2F';
          for (let i = 0; i < 3; i++) {
             const bpx = Math.sin(state.frame * 0.12 + i + seed) * rx * 0.6;
             const bpy = Math.cos(state.frame * 0.12 + i + seed) * ry * 0.3;
             const bSize = 2 + Math.abs(Math.sin(state.frame * 0.05 + i)) * 3;
             ctx.beginPath(); ctx.arc(bpx, bpy, bSize, 0, Math.PI * 2); ctx.fill();
          }
      } else {
          ctx.rotate(state.frame * 0.3 + p.id.length);
          ctx.fillStyle = '#1B5E20';
          ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height);
          ctx.strokeStyle = '#ADFF2F';
          ctx.lineWidth = 2;
          ctx.strokeRect(-p.width/2, -p.height/2, p.width, p.height);
      }
      ctx.restore();
    }
    else if (p.isCocaine) { ctx.save(); ctx.translate(p.pos.x + p.width/2, p.pos.y + p.height/2); ctx.rotate(state.frame * 0.1); ctx.fillStyle = '#fff'; ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height); ctx.strokeStyle = '#ccc'; ctx.strokeRect(-p.width/2, -p.height/2, p.width, p.height); ctx.restore(); }
    else if (p.isMethBarrel) { ctx.save(); ctx.translate(p.pos.x + p.width/2, p.pos.y + p.height/2); ctx.rotate(p.rotation || 0); ctx.fillStyle = '#111'; ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2; ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height); ctx.strokeRect(-p.width/2, -p.height/2, p.width, p.height); ctx.fillStyle = '#FFD700'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText("METH", 0, 5); ctx.restore(); }
    else if (p.isDart) { ctx.save(); ctx.translate(p.pos.x + p.width/2, p.pos.y + p.height/2); ctx.fillStyle = COLORS.PROJECTILE_DART; ctx.fillRect(-p.width/2 + (p.vel.x > 0 ? 5 : 0), -p.height/2, p.width - 5, p.height); ctx.fillStyle = 'red'; ctx.fillRect(p.vel.x > 0 ? -p.width/2 : p.width/2 - 5, -p.height/2 - 1, 6, p.height + 2); ctx.restore(); }
    else if (p.isDarkness) {
      ctx.save();
      ctx.translate(p.pos.x + p.width/2, p.pos.y + p.height/2);
      const pulse = 0.8 + Math.sin(state.frame * 0.15) * 0.2;
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.width/2 * pulse);
      grad.addColorStop(0, '#bd00ff');
      grad.addColorStop(0.5, '#2e1a47');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, p.width/2 * pulse * 1.5, 0, Math.PI * 2);
      ctx.fill();
      // Core
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(0, 0, p.width/4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    else if (p.isPoop) {
      ctx.save();
      ctx.translate(p.pos.x + p.width/2, p.pos.y + p.height/2);
      ctx.rotate(state.frame * 0.2 + p.id.length);
      // Log
      ctx.fillStyle = '#5D4037';
      ctx.beginPath();
      if(ctx.roundRect) ctx.roundRect(-p.width/2, -p.height/2, p.width, p.height, 8);
      else ctx.rect(-p.width/2, -p.height/2, p.width, p.height);
      ctx.fill();
      ctx.strokeStyle = '#3E2723';
      ctx.stroke();
      // Corn
      ctx.fillStyle = '#FFEB3B';
      ctx.beginPath(); ctx.arc(-5, -2, 2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(4, 3, 2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(2, -4, 2, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
    else if (p.isOscarRocket) drawOscarRocket(ctx, p, state.frame);
    else if (p.isCigarette) drawFlyingCigarette(ctx, p, state.frame);
    else if (p.isOilRocket) {
      ctx.save();
      ctx.translate(p.pos.x + p.width / 2, p.pos.y + p.height / 2);
      if (p.vel.x < 0) ctx.scale(-1, 1);

      // Rocket Body
      ctx.fillStyle = '#212121';
      ctx.fillRect(-20, -8, 30, 16);

      // Nose Cone
      ctx.fillStyle = '#D32F2F';
      ctx.beginPath();
      ctx.moveTo(10, -8);
      ctx.lineTo(25, 0);
      ctx.lineTo(10, 8);
      ctx.closePath();
      ctx.fill();

      // Fins
      ctx.fillStyle = '#757575';
      ctx.fillRect(-20, -12, 6, 4);
      ctx.fillRect(-20, 8, 6, 4);

      // Oil Coating / Drips visual
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(-5, 8, 4, 0, Math.PI * 2);
      ctx.arc(5, -8, 3, 0, Math.PI * 2);
      ctx.fill();

      // Shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(-15, -4, 20, 2);

      ctx.restore();
    }
    else { ctx.fillStyle = (p.isIce) ? COLORS.PROJECTILE_ICE : (p.owner === 'player' ? COLORS.PROJECTILE_PLAYER : COLORS.PROJECTILE_ENEMY); ctx.fillRect(p.pos.x, p.pos.y, p.width, p.height); }
    ctx.restore();
  });
};

const drawParticlesAndDamageNumbers = (ctx: CanvasRenderingContext2D, state: GameState) => {
  const { particles, damageNumbers } = state;
  particles.forEach(p => { ctx.save(); if (!p.isStuck) ctx.globalAlpha = p.life < 100 ? p.life / 100 : 1; else ctx.globalAlpha = 0.85; ctx.fillStyle = p.color; ctx.fillRect(p.pos.x, p.pos.y, p.size, p.size); ctx.restore(); });
  damageNumbers.forEach(d => {
    if (d.isCallout) { drawCallout(ctx, d); return; }
    ctx.save();
    ctx.globalAlpha = d.life / d.maxLife;
    const txt = d.text || (d.value !== undefined ? d.value.toString() : "");
    ctx.font = `bold ${d.isCritical ? (d.text ? '32px' : '24px') : '16px'} "Press Start 2P"`;
    ctx.fillStyle = d.color || (d.isCritical ? '#FFD700' : (d.value && d.value > 50 ? '#FF4500' : '#FFFFFF'));
    ctx.textAlign = 'center';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 4;
    ctx.fillText(txt, d.pos.x, d.pos.y);
    ctx.restore();
  });
};

/** Blackout Barry dims the room while teleporting and flashes it when electrified. */
const drawBarryLighting = (ctx: CanvasRenderingContext2D, state: GameState, stageId: string | null) => {
  const { enemies } = state;
  // BLACKOUT OVERLAY for Blackout Barry
  const isBarryStage = stageId === 'Blackout Barry';
  const activeBarry = enemies.find(e => e.type === 'boss' && e.health > 0);

  // Only show darkness during the teleporting phase, never during attacks or preparation
  const shouldShowBlackout = isBarryStage && activeBarry && activeBarry.bossState === 'blackout_teleport';

  if (shouldShowBlackout) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // Subtle darkness so Barry's teleportation is mysterious without hiding the arena
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  } else if (isBarryStage && activeBarry) {
    if (activeBarry.bossState === 'ground_pound' && (activeBarry.electrifiedTimer || 0) > 0) {
      // Half-second electrified flash lighting up the room when he lands
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const pulse = 0.22 + 0.12 * Math.sin(state.frame * 0.8);
      ctx.fillStyle = `rgba(0, 229, 255, ${pulse})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();
    } else if (activeBarry.bossState === 'lightning_storm' && activeBarry.activeLightningStrikes && activeBarry.activeLightningStrikes.length > 0) {
      // Light up the screen as lightning strikes persist
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();
    }
  }
};

/** Kill callouts slam in oversized, settle with a slight tilt, then fade. */
const drawCallout = (ctx: CanvasRenderingContext2D, d: DamageNumber) => {
  const age = d.maxLife - d.life;
  const scale = age < 8 ? 2.2 - (age / 8) * 1.2 : 1;
  const tilt = (d.id.length % 2 === 0 ? 1 : -1) * 0.08;
  ctx.save();
  ctx.globalAlpha = Math.min(1, d.life / 20);
  ctx.translate(d.pos.x, d.pos.y);
  ctx.rotate(tilt);
  ctx.scale(scale, scale);
  ctx.font = `bold 22px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'black';
  ctx.strokeText(d.text || '', 0, 0);
  ctx.fillStyle = d.color || '#FFD700';
  ctx.fillText(d.text || '', 0, 0);
  ctx.restore();
};

const drawVictoryText = (ctx: CanvasRenderingContext2D, text: string) => {
  ctx.save();
  ctx.font = `bold 50px ${FONT}`;
  ctx.fillStyle = 'yellow';
  ctx.textAlign = 'center';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 4;
  ctx.strokeText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.restore();
};

/** Big red death message, shrunk or word-wrapped to fit the screen. */
const drawDeathMessage = (ctx: CanvasRenderingContext2D, deathString: string) => {
  ctx.save();
  const maxAllowedWidth = CANVAS_WIDTH - 80;
  let fontSize = 48;
  ctx.font = `bold ${fontSize}px "Press Start 2P"`;

  let measured = ctx.measureText(deathString).width;
  if (measured > maxAllowedWidth) {
    fontSize = Math.floor(fontSize * (maxAllowedWidth / measured));
  }

  // If font size becomes too small (< 22px), split into wrapped lines
  if (fontSize < 22) {
    const words = deathString.split(' ');
    const lines: string[] = [];
    let curLine = '';
    for (const w of words) {
      const testLine = curLine ? `${curLine} ${w}` : w;
      ctx.font = 'bold 30px "Press Start 2P"';
      if (ctx.measureText(testLine).width > maxAllowedWidth && curLine) {
        lines.push(curLine);
        curLine = w;
      } else {
        curLine = testLine;
      }
    }
    if (curLine) lines.push(curLine);

    let wrapFontSize = 30;
    lines.forEach(l => {
      ctx.font = `bold ${wrapFontSize}px "Press Start 2P"`;
      const w = ctx.measureText(l).width;
      if (w > maxAllowedWidth) {
        wrapFontSize = Math.floor(wrapFontSize * (maxAllowedWidth / w));
      }
    });
    wrapFontSize = Math.max(16, wrapFontSize);

    ctx.font = `bold ${wrapFontSize}px "Press Start 2P"`;
    ctx.fillStyle = '#FF0000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(3, Math.round(wrapFontSize / 6));
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 8;

    const lineHeight = wrapFontSize * 1.5;
    const startY = (CANVAS_HEIGHT / 2) - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, idx) => {
      const y = startY + idx * lineHeight;
      ctx.strokeText(line, CANVAS_WIDTH / 2, y);
      ctx.fillText(line, CANVAS_WIDTH / 2, y);
    });
  } else {
    ctx.font = `bold ${fontSize}px "Press Start 2P"`;
    ctx.fillStyle = '#FF0000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(4, Math.round(fontSize / 6));
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 8;
    ctx.strokeText(deathString, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.fillText(deathString, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  }
  ctx.restore();
};
