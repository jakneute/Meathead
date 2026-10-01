import { GameStatus, Enemy, TommyBoard, DamageNumber, Particle } from '../../types';
import { attackless } from '../enemies/attackless';
import { hazeBands, steppedGlow } from './pixelArt';
import { setBossLook } from './bosses/kit';
import { isDummy, drawDummy } from './dummies';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, RING_CEILING_Y, RING_FLOOR_Y, LEVEL_INTRO_STYLE, SKYFALL_CLOUD_FRAMES, COLORS, BOSS_DOOR_X, ARENA_LEFT, ARENA_RIGHT, RENDER_SCALE, PRACTICE_RANGE_STAGE, isRangeStage, GROUND_Y,
} from '../../constants';
import { drawSkyClouds, DEPLOY_CLOUD_SCROLL_END, SKYFALL_CLOUD_SPEED } from './skyClouds';
import { STAGE_COLORS } from '../../content/roster';
import { GameState, BOSS_FALL, STAIN_FRAMES } from '../core/state';
import { drawCustomBossArena } from './bosses/arenas';
import { drawBoss, drawBossOverlay } from './bosses';
import { drawVentTelegraph, drawVent, drawMagma, isMagma } from './bosses/victorVents';
import { drawIcicles, drawIceBlock, drawIceShard } from './bosses/artieIce';
import { drawBoulder, drawRockChip } from './bosses/boulders';
import { drawBullet, drawThrown, drawEnemyBullet, drawIcePellet, drawDart, drawPoopLog, drawCocaine, drawMethBarrel, drawSludgeBlob } from './projectiles';
import { drawParticle } from './particles';
import { drawComposited, needsComposite } from './composite';
import { drawBossCorpse } from './bosses/corpses';
import { drawVictoryPee } from '../scenes/victoryPeeDraw';
import { drawPlayer } from './player/player';
import { drawKindEnemy, animFrame } from './enemies';
import { muzzlePoint } from '../combat/muzzle';
import { isMidBoss } from '../combat/midBoss';
import { drawBackdrop, drawBackdropFront } from './backdrops';
import { drawTerrain, drawGroundProfile } from './backdrops/terrain';
import { groundLineAt } from '../core/terrain';
import { getStageLayout } from '../stages';
import { drawEnemyDeaths } from './enemies/deaths';
import { drawSewerNukeInside, drawSewerNukeFlash, drawSewerNukeOutside } from '../scenes/sewerNukeDraw';
import { drawVolcanoFinaleInside, drawVolcanoFinaleOutside } from '../scenes/volcanoFinaleDraw';
import { drawSceneLighting } from './lighting';
import { sentenceShown } from '../platform/speech';
import { drawPickup } from './pickups';
import { SKIP_AFTER, drawSkipPrompt } from '../platform/skip';
import {
  drawOilSlicks, drawOscarFire, drawOscarLaser, drawOscarRocket, drawFlyingCigarette, drawTaserOverload,
} from './bosses/oscarGear';

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

  // The easter egg deaths take over the whole screen for their outside shots
  if (state.sewerNuke && drawSewerNukeOutside(ctx, state)) return;
  if (state.volcanoFinale && drawVolcanoFinaleOutside(ctx, state)) return;

  const isRange = isRangeStage(stageId), isRing = stageId === PRACTICE_RANGE_STAGE;
  const colors = isRange ? { ground: '#0A0A0C', bg: '#000', accent: '#7F1D1D' } : STAGE_COLORS[stageId || ""] || { ground: COLORS.GROUND, bg: COLORS.BG_DARK, accent: '#fff' };
  // Layered parallax scenery for the stage (a flat colour where there isn't any)
  if (isRing) {
    drawRing(ctx, state.frame || 0);
  } else if (isRange) {
    drawRangeVoid(ctx, state.frame || 0);
  } else if (getStageLayout(stageId)?.drawBackdrop?.(ctx, state)) {
    // (a stage that changes its own sky: Hector's beach going from sunny to hurricane, the inside of the storm)
  } else if (!drawBackdrop(ctx, stageId, state.camera.x, state.camera.y, state.frame || 0)) {
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // World space (camera + screen shake; a paused frame holds still). shiftX widens the view to the left (the cylinder pass draws a wider strip)
  const worldPass = (wctx: CanvasRenderingContext2D, shiftX: number) => {
    wctx.save();
    if (state.screenShakeTimer > 0 && status !== GameStatus.PAUSED) {
      const m = state.screenShakeMagnitude * 2;
      wctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
    }
    wctx.translate(-(state.camera.x - shiftX), -state.camera.y);
    // A stage can push the camera in on something (a clash), keeping that spot where it is on screen
    const zoom = getStageLayout(stageId)?.zoom?.(state);
    if (zoom && zoom.scale !== 1) { wctx.translate(zoom.shiftX ?? 0, zoom.shiftY ?? 0); wctx.translate(zoom.x, zoom.y); wctx.scale(zoom.scale, zoom.scale); wctx.translate(-zoom.x, -zoom.y); }
    // (what of the world that puts on screen: what's drawn to fill the screen fills this)
    const camX = state.camera.x - shiftX, camY = state.camera.y;
    state.view = zoom && zoom.scale !== 1
      ? { x: zoom.x + (camX - (zoom.shiftX ?? 0) - zoom.x) / zoom.scale, y: zoom.y + (camY - (zoom.shiftY ?? 0) - zoom.y) / zoom.scale, w: (CANVAS_WIDTH + shiftX * 2) / zoom.scale, h: CANVAS_HEIGHT / zoom.scale }
      : { x: camX, y: camY, w: CANVAS_WIDTH + shiftX * 2, h: CANVAS_HEIGHT };

    layout?.drawBack?.(wctx, state);
    if (!isRing) drawGroundProfile(wctx, state.groundRuns, stageId, state.frame || 0, state.view);
    if (!isRing && !drawTerrain(wctx, state.blocks, stageId, state.frame || 0, state.doorOpenAmount)) drawBlocks(wctx, state, colors);
    layout?.drawMid?.(wctx, state);
    // The boss arena is drawn whenever any of it is on screen: from the moment the door
    // opens onto it, through the fight, his death and the victory lap
    const arenaInView = !!stageId && state.camera.x + CANVAS_WIDTH > ARENA_LEFT;
    const inTommyArena = arenaInView && stageId === 'Toxic Tommy';
    if (inTommyArena) {
      drawTommyShaft(wctx, state);
    } else if (arenaInView) {
      const hurricane = state.enemies.find(e => e.type === 'boss' && e.bossState === 'hurricane' && e.health > 0);
      drawCustomBossArena(wctx, stageId!, state.frame || 0, hurricane ? hurricane.pos.x + hurricane.width / 2 : null, state);
    }
    drawBossHazards(wctx, state);
    if (state.bossCorpse) drawBossCorpse(wctx, state.bossCorpse, state.frame);
    if (state.bossFallen) drawBossFallen(wctx, state, stageId);
    drawIcicles(wctx, state);
    drawOilSlicks(wctx, state);
    drawProjectiles(wctx, state, 'puddles');
    state.pickups.forEach(p => drawPickup(wctx, p, state.frame));
    drawEnemies(wctx, state, view);
    drawEnemyDeaths(wctx, state);
    if (inTommyArena && state.tommyBoards) drawTommyPool(wctx, state);
    // (the window-crash intro keeps him out of sight until he jumps through the glass; in the skyfall one he's falling into view)
    if (status !== GameStatus.LEVEL_INTRO || LEVEL_INTRO_STYLE === 'skyfall' || state.introTimer >= 80) {
      // (on something that's tipping: he goes with it)
      const tilt = layout?.playerTilt?.(state);
      if (tilt) { wctx.save(); wctx.translate(tilt.x, tilt.y); wctx.rotate(tilt.angle); wctx.translate(-tilt.x, -tilt.y); }
      drawPlayer(wctx, state.player, state, {
        currentWeapon: view.currentWeapon,
        showFilthShield: status === GameStatus.PLAYING,
        invincibilityEnabled: view.invincibilityEnabled,
      });
      if (tilt) wctx.restore();
      drawTaserOverload(wctx, state.player, state.frame);
      drawVictoryPee(wctx, state);
    }
    drawOscarFire(wctx, state);
    drawOscarLaser(wctx, state);
    if (state.player.isTasing && state.player.currentWeapon === 'TASER') drawTaserBeam(wctx, state);
    drawProjectiles(wctx, state, 'flying');
    if (state.waterShock) drawWaterShock(wctx, state.waterShock, state.frame);
    drawParticlesAndDamageNumbers(wctx, state);
    drawBarryLighting(wctx, state, stageId);
    if (state.sewerNuke) drawSewerNukeInside(wctx, state);
    if (state.volcanoFinale) drawVolcanoFinaleInside(wctx, state);
    layout?.drawFront?.(wctx, state);
    if (state.waterStains?.length) drawWaterStains(wctx, state);
    // (what he says goes over everything, the stage's buildings and scenery in front included)
    if (status !== GameStatus.LEVEL_INTRO || LEVEL_INTRO_STYLE === 'skyfall' || state.introTimer >= 80) drawPlayerSpeech(wctx, state);
    wctx.restore();
  };
  const layout = getStageLayout(stageId);
  const cylinder = layout?.cylinder?.(state);
  if (cylinder) {
    drawCylinderWorld(ctx, cylinder.radius, worldPass);
    layout?.drawOverCylinder?.(ctx, state, cylinder.radius, x => {
      const a = (x - state.camera.x - CANVAS_WIDTH / 2) / cylinder.radius;
      return a - Math.round(a / (Math.PI * 2)) * Math.PI * 2;
    });
  }
  else worldPass(ctx, 0);
  // The stage's lighting over the lot (the same for everything in it: him, them, the pickups)
  const scene = layout?.lighting?.(state);
  if (scene) drawSceneLighting(ctx, state, cylinder ? { ...scene, flat: true } : scene, { camX: state.camera.x, camY: state.camera.y, zoom: layout?.zoom?.(state) });
  layout?.drawHud?.(ctx, state);

  // Screen space: the stage's weather over the level (not inside the boss arenas)
  if (state.camera.x < ARENA_LEFT - CANVAS_WIDTH / 2 && !layout?.drawBackdropFront?.(ctx, state)) drawBackdropFront(ctx, stageId, state.camera.x, state.camera.y, state.frame || 0);
  if (state.victoryString && (status === GameStatus.PLAYING || status === GameStatus.VICTORY)) drawVictoryText(ctx, state.victoryString);
  if (state.checkpointBanner && state.deathTimer <= 0) drawCheckpointBanner(ctx, state.checkpointBanner, state.frame);
  if (state.sewerNuke) drawSewerNukeFlash(ctx, state);
  else if (state.deathTimer > 0 && state.deathString && state.deathFreeze === undefined && !(state.deathScene && state.deathScene.t < state.deathScene.len)) drawDeathMessage(ctx, state.deathString);
  if (state.deathTimer > 0 ? state.deathFrames > SKIP_AFTER : state.dyingSkipAt !== undefined && state.frame - state.dyingSkipAt >= 0 && state.frame - state.dyingSkipAt <= 1) drawSkipPrompt(ctx, CANVAS_WIDTH);
  // Skyfall intro: coming down out of the clouds the deploy transition dove into
  if (status === GameStatus.LEVEL_INTRO && LEVEL_INTRO_STYLE === 'skyfall' && state.introTimer < SKYFALL_CLOUD_FRAMES) {
    const k = state.introTimer / SKYFALL_CLOUD_FRAMES;
    drawSkyClouds(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, 1 - k * k, DEPLOY_CLOUD_SCROLL_END + state.introTimer * SKYFALL_CLOUD_SPEED);
  }
};

/**
 * Fouled water: a slick spreading out on the surface from where the sludge or the rocket went in, with the water
 * under it clouded (green-brown for the sludge; black with a rainbow sheen for the oil), fading out as it breaks up.
 */
const drawWaterStains = (ctx: CanvasRenderingContext2D, state: GameState) => {
  ctx.save();
  for (const s of state.waterStains!) {
    const t = state.frame - s.at;
    const k = t / STAIN_FRAMES;
    const r = Math.min(170, 18 + t * 1.2);
    const a = (t < 20 ? t / 20 : 1) * (k > 0.6 ? 1 - (k - 0.6) / 0.4 : 1);
    const x1 = Math.max(s.x1, s.x - r), x2 = Math.min(s.x2, s.x + r);
    if (x2 <= x1) continue;
    ctx.save();
    ctx.beginPath(); ctx.rect(x1, s.surface - 6, x2 - x1, 200); ctx.clip();
    // Clouded water under it
    const g = ctx.createLinearGradient(0, s.surface, 0, s.surface + 150);
    const deep = s.kind === 'sludge' ? '77, 92, 30' : s.kind === 'shit' ? '92, 58, 22' : '12, 10, 16';
    g.addColorStop(0, `rgba(${deep}, ${0.55 * a})`); g.addColorStop(1, `rgba(${deep}, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(s.x, s.surface, r, 150, 0, 0, Math.PI); ctx.fill();
    // The slick on top
    ctx.fillStyle = s.kind === 'sludge' ? `rgba(101, 124, 30, ${0.85 * a})` : s.kind === 'shit' ? `rgba(120, 78, 30, ${0.8 * a})` : `rgba(10, 10, 14, ${0.9 * a})`;
    ctx.beginPath(); ctx.ellipse(s.x, s.surface + 1, r, 5, 0, 0, Math.PI * 2); ctx.fill();
    if (s.kind === 'oil') {
      // A rainbow sheen on it
      const bands = ['#F472B6', '#FACC15', '#22D3EE', '#A78BFA'];
      ctx.lineWidth = 1;
      bands.forEach((c, i) => {
        ctx.strokeStyle = c; ctx.globalAlpha = 0.45 * a;
        ctx.beginPath(); ctx.ellipse(s.x + Math.sin(state.frame * 0.02 + i) * 6, s.surface + 1, r * (0.3 + i * 0.15), 2.2, 0, 0, Math.PI * 2); ctx.stroke();
      });
      ctx.globalAlpha = 1;
    } else {
      // Scum and bubbles
      ctx.fillStyle = `rgba(163, 190, 60, ${0.8 * a})`;
      for (let i = 0; i < 6; i++) { const bx = s.x + Math.sin(i * 2.3 + s.at) * r * 0.8; ctx.beginPath(); ctx.arc(bx, s.surface + Math.sin(state.frame * 0.1 + i) * 1.2, 1.6 + (i % 3), 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
  }
  ctx.restore();
};

/** How long the water stays lit after the taser's been put through it (frames). */
const WATER_SHOCK_FRAMES = 40;

/** Water with a current through it: the stretch flickering electric blue, bolts forking through it, the surface white hot. */
const drawWaterShock = (ctx: CanvasRenderingContext2D, w: { x1: number; x2: number; surface: number; bottom: number; at: number }, frame: number) => {
  const t = frame - w.at;
  if (t < 0 || t > WATER_SHOCK_FRAMES) return;
  const fade = 1 - t / WATER_SHOCK_FRAMES;
  const depth = Math.min(w.bottom - w.surface, 220);
  ctx.save();
  ctx.globalAlpha = fade * (frame % 4 < 2 ? 0.55 : 0.35);
  const g = ctx.createLinearGradient(0, w.surface, 0, w.surface + depth);
  g.addColorStop(0, 'rgba(165, 243, 252, 0.9)'); g.addColorStop(1, 'rgba(0, 229, 255, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(w.x1, w.surface, w.x2 - w.x1, depth);
  ctx.globalAlpha = fade;
  // Bolts forking down through it
  ctx.lineJoin = 'round';
  for (let i = 0; i < 7; i++) {
    let x = w.x1 + Math.random() * (w.x2 - w.x1), y = w.surface;
    ctx.strokeStyle = i % 2 ? '#FFFFFF' : '#67E8F9'; ctx.lineWidth = i % 2 ? 1.5 : 2.5;
    ctx.beginPath(); ctx.moveTo(x, y);
    for (let k = 0; k < 5; k++) { x += (Math.random() - 0.5) * 40; y += depth / 6; ctx.lineTo(x, y); }
    ctx.stroke();
  }
  // The surface, crackling white along its length
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(w.x1, w.surface);
  for (let x = w.x1; x <= w.x2; x += 16) ctx.lineTo(x, w.surface + (Math.random() - 0.5) * 6);
  ctx.stroke();
  ctx.restore();
};

/** How long the checkpoint banner's up (frames). */
const BANNER_FRAMES = 120;

/**
 * The checkpoint banner, screen space: a slanted hazard-striped band slams in across the upper screen with the
 * announcer's words on it in big type, holds, then slides away.
 */
const drawCheckpointBanner = (ctx: CanvasRenderingContext2D, b: { text: string; at: number }, frame: number) => {
  const t = frame - b.at;
  if (t < 0 || t > BANNER_FRAMES) return;
  const inK = Math.min(1, t / 8), outK = Math.max(0, (t - (BANNER_FRAMES - 16)) / 16);
  const cx = CANVAS_WIDTH / 2, cy = 150;
  ctx.save();
  ctx.translate(cx + (1 - inK) * -CANVAS_WIDTH + outK * CANVAS_WIDTH, cy);
  ctx.rotate(-0.04);
  // (a punch as it lands)
  const pop = t < 14 ? 1 + Math.sin((t / 14) * Math.PI) * 0.08 : 1;
  ctx.scale(pop, pop);
  // The band: black edges, hazard stripes along them, a dark middle
  const w = 620, h = 64;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(-w / 2, -h / 2, w, h);
  for (const y of [-h / 2, h / 2 - 8]) {
    ctx.save();
    ctx.beginPath(); ctx.rect(-w / 2, y, w, 8); ctx.clip();
    for (let x = -w / 2 - 16; x < w / 2 + 16; x += 16) {
      ctx.fillStyle = '#FACC15';
      ctx.beginPath(); ctx.moveTo(x + ((frame * 2) % 16), y); ctx.lineTo(x + 8 + ((frame * 2) % 16), y); ctx.lineTo(x + ((frame * 2) % 16), y + 8); ctx.lineTo(x - 8 + ((frame * 2) % 16), y + 8); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  // The words
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let size = 26;
  ctx.font = `${size}px "Press Start 2P", monospace`;
  while (size > 12 && ctx.measureText(b.text).width > w - 40) { size -= 1; ctx.font = `${size}px "Press Start 2P", monospace`; }
  ctx.lineWidth = 6; ctx.strokeStyle = '#000000'; ctx.lineJoin = 'round';
  ctx.strokeText(b.text, 3, 3);
  ctx.fillStyle = '#7F1D1D'; ctx.fillText(b.text, 3, 3);
  ctx.strokeText(b.text, 0, 0);
  ctx.fillStyle = t % 10 < 5 && t < 30 ? '#FFFFFF' : '#FDE047';
  ctx.fillText(b.text, 0, 0);
  ctx.restore();
};

/** The offscreen strip the cylinder pass draws the world into (reused). */
let cylinderStrip: HTMLCanvasElement | null = null;

/**
 * The rotating-tower trick (Castlevania Bloodlines, Mickey Mania): the world's
 * drawn flat into a strip wider than the screen, then laid back onto the screen
 * column by column as if wrapped round a cylinder of this radius, so things
 * bunch up and darken as they turn away round the sides. Outside the cylinder,
 * the backdrop shows. Screen-space things (HUD, messages) are drawn afterwards,
 * unwrapped.
 */
const drawCylinderWorld = (ctx: CanvasRenderingContext2D, radius: number, worldPass: (w: CanvasRenderingContext2D, shiftX: number) => void) => {
  if (typeof document === 'undefined') return;
  const half = CANVAS_WIDTH / 2;
  const reach = Math.ceil(radius * Math.PI / 2);          // how far round the visible half of the cylinder goes
  const pad = Math.max(0, reach - half) + 20;
  const w = CANVAS_WIDTH + pad * 2;
  if (!cylinderStrip) cylinderStrip = document.createElement('canvas');
  if (cylinderStrip.width !== w * RENDER_SCALE || cylinderStrip.height !== CANVAS_HEIGHT * RENDER_SCALE) {
    cylinderStrip.width = w * RENDER_SCALE; cylinderStrip.height = CANVAS_HEIGHT * RENDER_SCALE;
  }
  const s = cylinderStrip.getContext('2d')!;
  s.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
  s.clearRect(0, 0, w, CANVAS_HEIGHT);
  worldPass(s, pad);
  // Wrap it round: each 2px screen column takes the strip column at the matching angle
  const STEP = 2;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  for (let sx = 0; sx < CANVAS_WIDTH; sx += STEP) {
    const d = sx + STEP / 2 - half;
    if (Math.abs(d) >= radius) continue;
    const a = Math.asin(d / radius);
    const src = pad + half + radius * a;
    const srcW = Math.min(14, STEP / Math.max(0.12, Math.cos(a)));
    ctx.drawImage(cylinderStrip, (src - srcW / 2) * RENDER_SCALE, 0, srcW * RENDER_SCALE, CANVAS_HEIGHT * RENDER_SCALE, sx, 0, STEP, CANVAS_HEIGHT);
  }
  // Shading round the sides as it turns away from you
  for (const side of [-1, 1]) {
    const x0 = half + side * radius * 0.35, x1 = half + side * radius;
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, 'rgba(4, 8, 20, 0)'); g.addColorStop(1, 'rgba(4, 8, 20, 0.72)');
    ctx.fillStyle = g;
    ctx.fillRect(Math.min(x0, x1), 0, Math.abs(x1 - x0), CANVAS_HEIGHT);
  }
  ctx.restore();
};

/** The weapon range: a black void with a red glow and a receding grid floor. */
/**
 * The practice range, in the garage: the same one-screen range as after a boss, dressed as a boxing ring, in a gym
 * that's seen better decades. Water-stained cinderblock with the paint coming off it, one window up high with a pane
 * out, a tube light over the ring that won't stay on, bleachers with seats gone and a section fallen in, a heavy bag
 * held together with tape, a condemned notice. The ropes sag, the posts are rusting, the mat's patched with duct
 * tape, and a bucket in the corner's catching what comes through the roof. (The mat's the floor: nothing about it
 * plays any differently.)
 */
const RING_HASH = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
const drawRing = (ctx: CanvasRenderingContext2D, frame: number) => {
  const W = CANVAS_WIDTH, mat = RING_FLOOR_Y, h = RING_HASH, top = RING_CEILING_Y;
  // Cinderblock, grimy, the paint peeling off it in patches, water stains run down from the ceiling
  ctx.fillStyle = '#1A1917'; ctx.fillRect(0, 0, W, CANVAS_HEIGHT);
  ctx.fillStyle = '#211F1C';
  for (let y = top; y < mat; y += 20) for (let x = (((y - top) / 20) % 2) * 22; x < W; x += 44) ctx.fillRect(x + 1, y + 1, 42, 18);
  ctx.fillStyle = 'rgba(64, 80, 58, 0.35)'; // (old green paint, what's left of it)
  for (let k = 0; k < 7; k++) { ctx.beginPath(); const px = h(k) * W, py = top + 40 + h(k + 9) * 130; ctx.ellipse(px, py, 30 + h(k + 3) * 60, 16 + h(k + 5) * 30, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = 'rgba(80, 60, 30, 0.28)';
  for (let k = 0; k < 6; k++) { const sx = 40 + h(k + 20) * (W - 80); ctx.fillRect(sx, top, 8 + h(k + 21) * 10, 60 + h(k + 22) * 130); }
  // The ceiling: sagging tiles on a grid, a few gone (the dark in the holes), one hanging down, a brown stain over the
  // corner where the roof leaks, and a joist along the front edge of it
  ctx.fillStyle = '#34312C'; ctx.fillRect(0, 0, W, top);
  for (let x = 0; x < W; x += 50) for (let y = top - 150; y < top; y += 30) {
    const k = x * 7 + y;
    ctx.fillStyle = h(k) < 0.12 ? '#0B0A09' : h(k + 1) < 0.2 ? '#3E3A33' : '#46423A';
    ctx.fillRect(x + 1, y + 1, 48, 28);
  }
  ctx.fillStyle = 'rgba(120, 85, 40, 0.35)'; ctx.beginPath(); ctx.ellipse(W - 70, top - 12, 60, 20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.translate(250, top - 2); ctx.rotate(0.35); ctx.fillStyle = '#46423A'; ctx.fillRect(0, 0, 48, 6); ctx.restore(); // (a tile hanging off by a corner)
  ctx.fillStyle = '#1C1A17'; ctx.fillRect(0, top - 8, W, 10);
  ctx.fillStyle = '#2B2823'; ctx.fillRect(0, top - 8, W, 2);
  // A window up high: one pane out, the dirty light coming in through it, dust in the light
  const wx = 560, wy = top + 16;
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(wx - 4, wy - 4, 128, 68);
  for (let i = 0; i < 4; i++) { ctx.fillStyle = i === 2 ? '#0B0B0F' : 'rgba(148, 163, 184, 0.35)'; ctx.fillRect(wx + (i % 2) * 62, wy + Math.floor(i / 2) * 31, 58, 28); }
  ctx.fillStyle = 'rgba(203, 213, 225, 0.5)'; ctx.beginPath(); ctx.moveTo(wx, wy + 31); ctx.lineTo(wx + 20, wy + 31); ctx.lineTo(wx, wy + 48); ctx.fill();
  ctx.fillStyle = 'rgba(226, 232, 240, 0.05)'; ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + 120, wy); ctx.lineTo(wx - 60, mat); ctx.lineTo(wx - 260, mat); ctx.fill();
  ctx.fillStyle = 'rgba(226, 232, 240, 0.35)';
  for (let k = 0; k < 14; k++) { const t = (frame * 0.2 + k * 37) % 400; ctx.fillRect(wx - 140 + h(k) * 200 - t * 0.3, wy + 40 + t, 1.5, 1.5); }
  // The bleachers: rows of benches, seats gone out of them, a section fallen in on the left
  for (let r = 0; r < 4; r++) {
    const y = 250 + r * 42;
    for (let x = 0; x < W; x += 44) {
      const gone = h(x * 3 + r * 17) < 0.18 || (x < 176 && r >= 2);
      if (gone) continue;
      ctx.fillStyle = '#2A2724'; ctx.fillRect(x + 2, y, 40, 8);
      ctx.fillStyle = '#1F1C1A'; ctx.fillRect(x + 4, y + 8, 4, 18); ctx.fillRect(x + 36, y + 8, 4, 18);
    }
  }
  // (the fallen-in bit: planks down at an angle, a folding chair on its side)
  ctx.fillStyle = '#2A2724';
  for (let k = 0; k < 4; k++) { ctx.save(); ctx.translate(30 + k * 38, 340 + (k % 2) * 30); ctx.rotate(0.35 - k * 0.2); ctx.fillRect(-24, -4, 48, 8); ctx.restore(); }
  ctx.strokeStyle = '#52525B'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(210, 400); ctx.lineTo(236, 392); ctx.lineTo(240, 410); ctx.moveTo(214, 392); ctx.lineTo(230, 414); ctx.stroke();
  // The heavy bag on its chain, taped up where it split; a poster half off the wall; the notice
  const bagSway = Math.sin(frame * 0.02) * 0.04;
  ctx.save(); ctx.translate(96, top); ctx.rotate(bagSway);
  ctx.strokeStyle = '#71717A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 150); ctx.stroke();
  ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.roundRect(-18, 150, 36, 80, 10); ctx.fill();
  ctx.fillStyle = '#A1A1AA'; ctx.fillRect(-18, 176, 36, 7); ctx.fillRect(-18, 204, 36, 5);
  ctx.fillStyle = '#D6D3D1'; ctx.fillRect(-6, 214, 12, 10); ctx.restore();
  ctx.save(); ctx.translate(330, top + 26); ctx.rotate(-0.08);
  ctx.fillStyle = '#A8A29E'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(70, 0); ctx.lineTo(70, 60); ctx.lineTo(40, 96); ctx.lineTo(0, 96); ctx.fill();
  ctx.fillStyle = '#7F1D1D'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.fillText('FIGHT', 8, 20); ctx.fillText('NIGHT', 8, 32);
  ctx.fillStyle = '#44403C'; ctx.font = '6px "Press Start 2P"'; ctx.fillText('1987', 8, 48); ctx.restore();
  ctx.fillStyle = '#FDE68A'; ctx.fillRect(440, top + 40, 54, 40);
  ctx.fillStyle = '#B91C1C'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.fillText('CONDEMNED', 441, top + 54);
  ctx.fillStyle = '#44403C'; for (let k = 0; k < 3; k++) ctx.fillRect(444, top + 62 + k * 5, 44 - k * 8, 2);
  // The light over the ring: a tube fixture, one tube dead, the other flickering
  const flick = h(Math.floor(frame / 3)) < 0.08 ? 0.25 : h(Math.floor(frame / 40)) < 0.1 ? 0.6 : 1;
  const light = ctx.createRadialGradient(W / 2, top + 30, 10, W / 2, mat - 40, 460);
  light.addColorStop(0, `rgba(236, 252, 203, ${0.28 * flick})`);
  light.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = light; ctx.fillRect(0, 0, W, CANVAS_HEIGHT);
  ctx.strokeStyle = '#3F3F46'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W / 2 - 50, top); ctx.lineTo(W / 2 - 50, top + 12); ctx.moveTo(W / 2 + 50, top); ctx.lineTo(W / 2 + 50, top + 16); ctx.stroke();
  ctx.save(); ctx.translate(W / 2, top + 14); ctx.rotate(0.03);
  ctx.fillStyle = '#27272A'; ctx.fillRect(-70, 0, 140, 8);
  ctx.fillStyle = '#52525B'; ctx.fillRect(-62, 8, 124, 3);
  ctx.fillStyle = `rgba(236, 252, 203, ${0.35 + 0.65 * flick})`; ctx.fillRect(-62, 11, 124, 3); ctx.restore();
  // The drip from the roof into the bucket
  const bx = W - 70;
  ctx.fillStyle = '#52525B'; ctx.beginPath(); ctx.moveTo(bx - 14, mat - 26); ctx.lineTo(bx + 14, mat - 26); ctx.lineTo(bx + 11, mat); ctx.lineTo(bx - 11, mat); ctx.fill();
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(bx - 14, mat - 27, 28, 3);
  const dt = frame % 70;
  ctx.fillStyle = 'rgba(147, 197, 253, 0.7)';
  if (dt < 40) ctx.fillRect(bx - 1, top + 4 + (mat - 30 - top) * (dt / 40) ** 2, 2, 4);
  else if (dt < 46) { ctx.beginPath(); ctx.arc(bx, mat - 26, (dt - 40) * 1.5, Math.PI, 0); ctx.fill(); }
  // The corner posts, rusting, the turnbuckle pads cracked and taped; the ropes, sagging between them
  const posts = [10, W - 10];
  const ropes = [{ y: mat - 150, c: '#B91C1C', sag: 10 }, { y: mat - 105, c: '#D6D3D1', sag: 16 }, { y: mat - 60, c: '#1E40AF', sag: 8 }];
  for (const r of ropes) {
    ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.moveTo(posts[0], r.y + 5); ctx.quadraticCurveTo(W / 2, r.y + 5 + r.sag * 2, posts[1], r.y + 5); ctx.stroke();
    ctx.strokeStyle = r.c; ctx.beginPath(); ctx.moveTo(posts[0], r.y); ctx.quadraticCurveTo(W / 2, r.y + r.sag * 2, posts[1], r.y); ctx.stroke();
    // (duct tape round it where it's frayed)
    for (const tx of [0.3, 0.64]) { const x = posts[0] + (posts[1] - posts[0]) * tx, y = r.y + 4 * r.sag * tx * (1 - tx); ctx.fillStyle = '#A1A1AA'; ctx.fillRect(x - 5, y - 4, 10, 8); }
  }
  ctx.lineCap = 'butt';
  for (const x of posts) {
    ctx.fillStyle = '#78716C'; ctx.fillRect(x - 6, mat - 180, 12, 180);
    ctx.fillStyle = 'rgba(154, 52, 18, 0.6)'; for (let k = 0; k < 6; k++) ctx.fillRect(x - 6 + h(x + k) * 8, mat - 175 + k * 28, 4 + h(k) * 4, 6 + h(x * k) * 10);
    for (const r of ropes) {
      ctx.fillStyle = r.c; ctx.fillRect(x - 11, r.y - 7, 22, 18);
      ctx.strokeStyle = '#0B0B0F'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 6, r.y - 5); ctx.lineTo(x - 1, r.y + 3); ctx.lineTo(x + 4, r.y + 9); ctx.stroke();
      ctx.fillStyle = '#A1A1AA'; ctx.fillRect(x - 11, r.y + 2, 22, 4);
    }
  }
  // The mat: grey gone yellow, stains, duct-tape crosses over the splits, a tear
  ctx.fillStyle = '#C8C0A8'; ctx.fillRect(0, mat, W, 14);
  ctx.fillStyle = '#9C9480'; ctx.fillRect(0, mat, W, 2);
  ctx.fillStyle = 'rgba(92, 64, 51, 0.4)'; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.ellipse(80 + k * 160 + h(k) * 60, mat + 7, 22 + h(k + 1) * 20, 4, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#A1A1AA'; for (const tx of [210, 470]) { ctx.save(); ctx.translate(tx, mat + 7); ctx.rotate(0.5); ctx.fillRect(-14, -2, 28, 4); ctx.rotate(-1); ctx.fillRect(-14, -2, 28, 4); ctx.restore(); }
  ctx.fillStyle = '#44403C'; ctx.beginPath(); ctx.moveTo(620, mat + 4); ctx.lineTo(660, mat + 8); ctx.lineTo(624, mat + 11); ctx.fill();
  ctx.fillStyle = 'rgba(153, 27, 27, 0.35)'; ctx.fillRect(W * 0.62, mat + 6, 14, 3); ctx.fillRect(W * 0.3, mat + 8, 6, 2);
  // The apron skirt, faded, stained, its lettering coming off (one letter gone)
  ctx.fillStyle = '#243152'; ctx.fillRect(0, mat + 14, W, CANVAS_HEIGHT - mat - 14);
  ctx.fillStyle = '#1B2540'; for (let x = 0; x < W; x += 60) ctx.fillRect(x, mat + 14, 3, CANVAS_HEIGHT - mat - 14);
  ctx.fillStyle = 'rgba(60, 40, 20, 0.35)'; for (let k = 0; k < 4; k++) ctx.fillRect(h(k + 40) * W, mat + 14, 20 + h(k + 41) * 40, CANVAS_HEIGHT - mat - 14);
  ctx.font = 'bold 12px "Press Start 2P"'; ctx.textAlign = 'left';
  const word = "MEATHEAD'S GYM", gone = word.indexOf('Y');
  let lx = W / 2 - ctx.measureText(word).width / 2;
  for (let i = 0; i < word.length; i++) {
    ctx.fillStyle = i === gone ? 'rgba(202, 164, 21, 0.18)' : 'rgba(202, 164, 21, 0.75)';
    ctx.fillText(word[i], lx, mat + 38 + (i === gone + 1 ? 2 : 0));
    lx += ctx.measureText(word[i]).width;
  }
};

const drawRangeVoid = (ctx: CanvasRenderingContext2D, frame: number) => {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  steppedGlow(ctx, CANVAS_WIDTH / 2, GROUND_Y, 520, '#7F1D1D', 0.42 + Math.sin(frame * 0.03) * 0.05, 0, 7);
  // Grid lines running off to a vanishing point on the horizon
  ctx.save();
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.18)';
  ctx.lineWidth = 1;
  const horizon = GROUND_Y - 150;
  for (let i = -10; i <= 10; i++) {
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2 + i * 12, horizon);
    ctx.lineTo(CANVAS_WIDTH / 2 + i * 120, GROUND_Y);
    ctx.stroke();
  }
  for (let k = 0; k < 7; k++) {
    const y = horizon + 150 * Math.pow(((k + (frame * 0.01) % 1) / 7), 2);
    ctx.globalAlpha = 0.4 + k * 0.08;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }
  ctx.restore();
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
  // Victor's vents: cracking warnings, then the erupting cones
  state.bossVolcanoTelegraphs.forEach(v => drawVentTelegraph(ctx, v, state.frame));
  state.bossVolcanoes.forEach(v => drawVent(ctx, v, state.frame));

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


/**
 * A boss killed some other way than his weakness: no eruption, he's just dead. He drops to the floor if he was up off
 * it, and goes over like a felled tree (away from what hit him), and lies there, gone grey, till it's done.
 */
const FALL_DROP = BOSS_FALL.DROP, FALL_OVER = BOSS_FALL.OVER;
const drawBossFallen = (ctx: CanvasRenderingContext2D, state: GameState, stageId: string | null) => {
  const fb = state.bossFallen!;
  const e = fb.e, t = state.frame - fb.frame0;
  const feet = e.pos.y + e.height;
  // Down to the floor first (a flyer, one caught mid-leap)
  const drop = Math.max(0, fb.floor - feet) * Math.min(1, (t / FALL_DROP) ** 2);
  // Then over, about the edge of him on the way he's going, speeding up as he goes, a little bounce as he lands
  const k = Math.min(1, Math.max(0, t - (feet < fb.floor - 4 ? FALL_DROP : 0)) / FALL_OVER);
  const over = k < 1 ? k * k : 1 + Math.sin(Math.min(1, (t - FALL_OVER) / 10) * Math.PI) * 0.04 * (t - FALL_OVER < 10 ? 1 : 0);
  const px = fb.dir > 0 ? e.pos.x + e.width : e.pos.x, py = feet;
  ctx.save();
  ctx.translate(0, drop);
  ctx.translate(px, py); ctx.rotate(fb.dir * (Math.PI / 2) * Math.min(1.04, over)); ctx.translate(-px, -py);
  ctx.filter = `grayscale(${Math.min(0.6, t / 60)}) brightness(${1 - Math.min(0.25, t / 120)})`;
  drawBoss(ctx, e, stageId, fb.frame0);
  ctx.restore();
};

const drawEnemies = (ctx: CanvasRenderingContext2D, state: GameState, { status, stageId, bossTauntText }: WorldView) => {
  const { enemies, player } = state;
  enemies.forEach(live => {
    // (a tenant's dead as he falls, but he's still to be seen going)
    if (live.health <= 0 && !live.isBlownAway && !(live.kind === 'tenant' && (live.aiState === 'fall' || live.aiState === 'splat'))) return;
    // (dead and going: without whatever attack it was in the middle of, so that doesn't go flying with it)
    const e = live.isBlownAway || live.health <= 0 ? attackless(live) : live;
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
      // (he looks at Meathead)
      setBossLook(player.pos.x + player.width / 2);
      if (state.bossExplosionTimer <= 0) drawBoss(ctx, e, stageId, state.frame);
      setBossLook(null);
      const curT = (status === GameStatus.BOSS_INTRO && bossTauntText) ? bossTauntText : (state.bossVulgarityTimer > 0 ? state.bossLastVulgarity : null);
      if (curT && state.bossExplosionTimer <= 0) { ctx.save(); ctx.font = 'bold 12px "Press Start 2P"'; ctx.fillStyle = 'white'; ctx.shadowColor = 'black'; ctx.shadowBlur = 6; ctx.textAlign = 'center'; ctx.fillText(sentenceShown(curT), e.pos.x + e.width / 2, e.pos.y - 30); ctx.restore(); }
      drawBossOverlay(ctx, e, stageId, state.frame);
    } else if (isDummy(e)) {
      drawDummy(ctx, e, animFrame(e, state.frame));
    } else if (e.kind && getStageLayout(stageId)?.drawSpecialEnemy?.(ctx, e, state)) {
      // (a stage's mid-boss draws itself)
    } else if (e.kind) {
      // (oiled, drugged or flickering: the filter goes on the finished enemy once, not on each of its shapes)
      if (needsComposite(ctx)) drawComposited(ctx, { x: e.pos.x - 40, y: e.pos.y - 60, w: e.width + 80, h: e.height + 100 }, c => drawKindEnemy(c, e, state));
      else drawKindEnemy(ctx, e, state);
      // Dazed from a knock: a few stars going round his head
      if ((e.pauseTimer || 0) > 0 && !e.isBlownAway && e.health > 0) {
        const hx = e.pos.x + e.width / 2, hy = e.pos.y - 8;
        ctx.save(); ctx.fillStyle = '#FDE047'; ctx.font = 'bold 10px "Press Start 2P"'; ctx.textAlign = 'center';
        for (let k = 0; k < 3; k++) { const a = state.frame * 0.25 + (k * Math.PI * 2) / 3; ctx.fillText('*', hx + Math.cos(a) * 14, hy + Math.sin(a) * 4); }
        ctx.restore();
      }
    } else {
      if (e.enemyType === 'shield') { ctx.save(); if (e.facing === 1) { ctx.translate(e.pos.x * 2 + e.width, 0); ctx.scale(-1, 1); } ctx.fillStyle = '#444'; ctx.fillRect(e.pos.x + 10, e.pos.y, e.width - 10, e.height); if (e.isShieldActive) { ctx.fillStyle = '#2C3E50'; ctx.fillRect(e.pos.x, e.pos.y - 5, 15, e.height + 10); ctx.strokeStyle = '#00FFFF'; ctx.lineWidth = 2; ctx.strokeRect(e.pos.x, e.pos.y - 5, 15, e.height + 10); } else { ctx.fillStyle = '#7F8C8D'; ctx.fillRect(e.pos.x + 5, e.pos.y + 10, 10, e.height - 20); } ctx.restore(); } else if (e.id.startsWith('rusher')) ctx.fillStyle = '#9B59B6'; else if (e.enemyType === 'flyer' && e.width > 60) ctx.fillStyle = '#34495E'; else ctx.fillStyle = e.enemyType === 'flyer' ? COLORS.ENEMY_FLYER : (e.enemyType === 'drone' ? COLORS.ENEMY_DRONE : COLORS.ENEMY_TANK);
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
    if (e.type !== 'boss' && e.frozenTimer && e.frozenTimer > 0) { ctx.fillStyle = 'rgba(0, 255, 255, 0.4)'; ctx.fillRect(e.pos.x - 5, e.pos.y - 5, e.width + 10, e.height + 10); }
    if (e.isTased && player.isTasing && player.taserTargetId === e.id) {
      ctx.fillStyle = 'rgba(0, 229, 255, 0.4)';
      ctx.fillRect(e.pos.x - 5, e.pos.y - 5, e.width + 10, e.height + 10);
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2;
      for (let j = 0; j < 4; j++) { ctx.beginPath(); const sx = e.pos.x + e.width / 2, sy = e.pos.y + e.height / 2; ctx.moveTo(sx, sy); ctx.lineTo(sx + (Math.random()-0.5)*100, sy + (Math.random()-0.5)*100); ctx.stroke(); }
    }
    drawStuckNeedles(ctx, e, state.frame);
    if (!e.isBlownAway && e.drownT === undefined && !isMidBoss(e) && e.kind !== 'civilian' && e.kind !== 'visitor' && e.kind !== 'generator' && e.kind !== 'minion' && e.kind !== 'tenant' && !(e.kind === 'magmafish' && (!e.aiState || e.aiState === 'idle'))) { ctx.fillStyle = '#00FF00'; ctx.fillRect(e.pos.x, e.pos.y - 10, (e.health / e.maxHealth) * e.width, 5); }
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

    ctx.fillStyle = 'rgba(7, 4, 10, 0.7)'; ctx.fillRect(arenaLeft, sludgeY + 128, arenaRight - arenaLeft, 180);
    hazeBands(ctx, arenaLeft, sludgeY + 8, arenaRight - arenaLeft, 120, '#1C1324', 0.55, 0.7, 6);
    hazeBands(ctx, arenaLeft, sludgeY + 44, arenaRight - arenaLeft, 84, '#07040A', 0, 0.5, 5);

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
    ctx.fillStyle = 'rgba(11, 38, 18, 0.7)'; ctx.fillRect(arenaLeft, sludgeY + 128, arenaRight - arenaLeft, 180);
    hazeBands(ctx, arenaLeft, sludgeY + 8, arenaRight - arenaLeft, 120, '#27AE60', 0.55, 0.2, 6);
    hazeBands(ctx, arenaLeft, sludgeY + 44, arenaRight - arenaLeft, 84, '#0B2612', 0.1, 0.7, 5);

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
  // (kept on screen: a long line near the edge would otherwise run off it)
  // (a sentence at a time)
  const line = sentenceShown(state.playerLastVulgarity);
  const half = ctx.measureText(line).width / 2 + 8;
  const x = Math.max(state.camera.x + half, Math.min(state.camera.x + CANVAS_WIDTH - half, player.pos.x + player.width / 2));
  ctx.fillText(line, x, player.pos.y - 20);
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
  const { x: startX, y: startY } = muzzlePoint(player, 'TASER');

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

/**
 * A puddle of barf, stuck flat to whatever it's lying on: a low skin of it hugging the ground (following a slope), thin
 * and ragged at the edges, thickest in the middle where it's still lumpy, a wet sheen along the top of it, flecks of it
 * splattered on the ground round it, and bubbles coming up through it and popping.
 */
const drawGooPuddle = (ctx: CanvasRenderingContext2D, state: GameState, p: GameState['projectiles'][number]) => {
  const seed = (p.id.length * 37 + Math.round(p.pos.x)) % 997;
  const h = (n: number) => { const v = Math.sin(n * 127.1 + seed * 3.7) * 43758.5453; return v - Math.floor(v); };
  const x0 = p.pos.x, x1 = p.pos.x + p.width, base = p.pos.y + p.height;
  // (where the ground is under each bit of it: it lies along it, slope and all)
  const floorAt = (x: number) => { const g = groundLineAt(state.groundRuns, x); return g !== null && g !== undefined && Math.abs(g - base) < 24 ? g : base; };
  const thick = Math.min(9, Math.max(4, p.height * 0.55));
  const n = Math.max(6, Math.round(p.width / 6));
  const top: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = x0 + t * p.width;
    const edge = Math.min(1, Math.min(t, 1 - t) * 5);
    const lump = 0.55 + h(i) * 0.45 + Math.sin(t * 9 + seed) * 0.12;
    top.push([x, floorAt(x) - 1 - thick * edge * lump]);
  }
  const outline = () => {
    ctx.beginPath(); ctx.moveTo(x0 - 2, floorAt(x0) + 1);
    for (const [x, y] of top) ctx.lineTo(x, y);
    ctx.lineTo(x1 + 2, floorAt(x1) + 1);
    for (let i = n; i >= 0; i--) { const x = x0 + (i / n) * p.width; ctx.lineTo(x, floorAt(x) + 1.5); }
    ctx.closePath();
  };
  // Flecks of it splattered round it, flat on the ground
  ctx.fillStyle = '#2E7D32';
  for (let k = 0; k < 5; k++) { const side = k % 2 ? 1 : -1, fx = side > 0 ? x1 + 3 + h(k + 9) * 14 : x0 - 3 - h(k + 9) * 14; ctx.beginPath(); ctx.ellipse(fx, floorAt(fx) - 0.6, 1.5 + h(k) * 2.5, 0.9, 0, 0, Math.PI * 2); ctx.fill(); }
  // The body of it: dark under, the green of it, a lighter skin on top
  const g = ctx.createLinearGradient(0, base - thick - 2, 0, base + 1);
  g.addColorStop(0, '#7CB342'); g.addColorStop(0.35, '#43A047'); g.addColorStop(1, '#1B5E20');
  ctx.fillStyle = g; outline(); ctx.fill();
  ctx.strokeStyle = 'rgba(10, 40, 12, 0.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(top[0][0], top[0][1]); for (const [x, y] of top) ctx.lineTo(x, y); ctx.stroke();
  // (the wet sheen along the top, broken up)
  ctx.strokeStyle = 'rgba(220, 255, 180, 0.55)'; ctx.lineWidth = 1;
  for (let i = 1; i < n - 1; i += 2) { if (h(i + 3) < 0.35) continue; ctx.beginPath(); ctx.moveTo(top[i][0], top[i][1] + 1.2); ctx.lineTo(top[i + 1][0], top[i + 1][1] + 1.2); ctx.stroke(); }
  // (chunks in it)
  for (let k = 0; k < Math.round(p.width / 22); k++) { const cx = x0 + 8 + h(k + 20) * (p.width - 16); ctx.fillStyle = k % 2 ? '#C0CA33' : '#8D6E63'; ctx.beginPath(); ctx.ellipse(cx, floorAt(cx) - thick * 0.45, 1.6 + h(k) * 1.4, 1.1, h(k) * 3, 0, Math.PI * 2); ctx.fill(); }
  // Bubbles: one comes up, swells, and pops
  for (let k = 0; k < Math.max(1, Math.round(p.width / 40)); k++) {
    const period = 50 + Math.round(h(k + 30) * 40), ph = (state.frame + Math.round(h(k + 40) * period)) % period;
    const bx = x0 + 6 + h(k + 50 + Math.floor((state.frame + h(k + 40) * period) / period)) * (p.width - 12), by = floorAt(bx) - thick * 0.6;
    if (ph < period - 6) { const r = 1 + (ph / period) * 3.2; ctx.fillStyle = 'rgba(173, 255, 47, 0.85)'; ctx.beginPath(); ctx.arc(bx, by - r * 0.6, r, Math.PI, 0); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(bx - r * 0.4, by - r * 1.2, 1, 1); }
    else { ctx.strokeStyle = 'rgba(173, 255, 47, 0.7)'; ctx.lineWidth = 0.8; for (let s = 0; s < 4; s++) { const a = -Math.PI * (0.15 + s * 0.23); ctx.beginPath(); ctx.moveTo(bx + Math.cos(a) * 2, by + Math.sin(a) * 2); ctx.lineTo(bx + Math.cos(a) * 5, by + Math.sin(a) * 5); ctx.stroke(); } }
  }
};

/** Puddles lie on the floor under everyone; everything else flies over them. */
const drawProjectiles = (ctx: CanvasRenderingContext2D, state: GameState, layer: 'puddles' | 'flying') => {
  state.projectiles.forEach(p => {
    if ((layer === 'puddles') !== !!(p.isSludge && p.isLingering)) return;
    ctx.save();
    if (p.isBoulder) drawBoulder(ctx, p, state.frame);
    else if (p.isShrapnel) drawRockChip(ctx, p, state.frame);
    else if (p.isSludge) {
      if (p.isLingering) drawGooPuddle(ctx, state, p);
      else drawSludgeBlob(ctx, p, state.frame);
    }
    else if (p.isCocaine) drawCocaine(ctx, p, state.frame);
    else if (p.isMethBarrel) drawMethBarrel(ctx, p, state.frame);
    else if (p.isDart) drawDart(ctx, p);
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
    else if (p.isPoop) drawPoopLog(ctx, p, state.frame);
    else if (isMagma(p)) drawMagma(ctx, p, state.frame);
    else if (p.isIce && p.owner === 'enemy') (p.width > 30 ? drawIceBlock : drawIceShard)(ctx, p, state.frame);
    else if (p.isOscarRocket) drawOscarRocket(ctx, p, state.frame);
    else if (p.isCigarette) drawFlyingCigarette(ctx, p, state.frame);
    else if (p.isOilRocket) {
      ctx.save();
      ctx.translate(p.pos.x + p.width / 2, p.pos.y + p.height / 2);
      if (p.vel.x < 0) ctx.scale(-1, 1);
      ctx.rotate(Math.atan2(p.vel.y, Math.abs(p.vel.x))); // nose follows the steering

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
    else if (p.isIce) drawIcePellet(ctx, p, state.frame);
    else if (p.thrown) drawThrown(ctx, p, state.frame);
    else if (p.owner === 'player') drawBullet(ctx, p);
    else drawEnemyBullet(ctx, p, state.frame);
    ctx.restore();
  });
};

/** The layer stuck gore is painted onto: the view (as it was when the gore started sticking) at the view's resolution. */
interface GoreLayer { canvas: HTMLCanvasElement; x: number; y: number; w: number; h: number; k: number; baked: WeakSet<Particle> }
const goreLayers = new WeakMap<GameState, GoreLayer>();

/**
 * Paints any newly stuck gore onto the layer and draws the layer; returns the set of what's on it (so it isn't drawn
 * again), or null when there's none. The layer's wiped once none of its gore is left (a respawn, a new stage).
 */
const goreLayer = (ctx: CanvasRenderingContext2D, state: GameState) => {
  if (typeof document === 'undefined') return null;
  let layer = goreLayers.get(state);
  let stuck = 0, onLayer = 0;
  for (const p of state.particles) if (p.isStuck) { stuck++; if (layer?.baked.has(p)) onLayer++; }
  if (layer && onLayer === 0) { goreLayers.delete(state); layer = undefined; }
  if (!stuck) return null;
  if (!layer) {
    const m = ctx.getTransform();
    const k = Math.max(1, Math.min(2, Math.hypot(m.a, m.b)));
    const x = state.camera.x - 120, y = state.camera.y - 120, w = CANVAS_WIDTH + 240, h = CANVAS_HEIGHT + 240;
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(w * k); canvas.height = Math.ceil(h * k);
    layer = { canvas, x, y, w, h, k, baked: new WeakSet() };
    goreLayers.set(state, layer);
  }
  const g = layer.canvas.getContext('2d')!;
  g.setTransform(layer.k, 0, 0, layer.k, -layer.x * layer.k, -layer.y * layer.k);
  g.globalAlpha = 0.85;
  for (const p of state.particles) {
    if (!p.isStuck || layer.baked.has(p)) continue;
    // (only what's inside the layer: anything stuck outside it is drawn as usual)
    if (p.pos.x < layer.x || p.pos.x > layer.x + layer.w || p.pos.y < layer.y || p.pos.y > layer.y + layer.h) continue;
    if (p.alpha !== undefined) continue;
    drawParticle(g, p);
    layer.baked.add(p);
  }
  ctx.drawImage(layer.canvas, layer.x, layer.y, layer.w, layer.h);
  return layer.baked;
};

const drawParticlesAndDamageNumbers = (ctx: CanvasRenderingContext2D, state: GameState) => {
  const { particles, damageNumbers } = state;
  // Gore that's stuck fast to the walls and ceiling doesn't change: it's painted once onto a layer and the layer is
  // drawn (after a weakness kill that's a couple of thousand splats, which were being redrawn every frame)
  const layer = goreLayer(ctx, state);
  ctx.save();
  for (const p of particles) {
    if (layer && p.isStuck && layer.has(p)) continue;
    ctx.globalAlpha = p.alpha ?? (p.isStuck ? 0.85 : (p.life < 100 ? p.life / 100 : 1));
    drawParticle(ctx, p);
  }
  ctx.restore();
  damageNumbers.forEach(d => {
    if (d.isCallout) { drawCallout(ctx, d, state.camera); return; }
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
    ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
    // Subtle darkness so Barry's teleportation is mysterious without hiding the arena
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  } else if (isBarryStage && activeBarry) {
    if (activeBarry.bossState === 'ground_pound' && (activeBarry.electrifiedTimer || 0) > 0) {
      // Half-second electrified flash lighting up the room when he lands
      ctx.save();
      ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
      const pulse = 0.22 + 0.12 * Math.sin(state.frame * 0.8);
      ctx.fillStyle = `rgba(0, 229, 255, ${pulse})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();
    } else if (activeBarry.bossState === 'lightning_storm' && activeBarry.activeLightningStrikes && activeBarry.activeLightningStrikes.length > 0) {
      // Light up the screen as lightning strikes persist
      ctx.save();
      ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();
    }
  }
};

/** Kill callouts slam in oversized, settle with a slight tilt, then fade. */
const drawCallout = (ctx: CanvasRenderingContext2D, d: DamageNumber, camera: { x: number, y: number }) => {
  const age = d.maxLife - d.life;
  const scale = age < 8 ? 2.2 - (age / 8) * 1.2 : 1;
  const tilt = (d.id.length % 2 === 0 ? 1 : -1) * 0.08;
  ctx.save();
  ctx.globalAlpha = Math.min(1, d.life / 20);
  ctx.font = `bold 22px ${FONT}`;
  // Keep the whole callout on screen (it can be spawned right at the edge)
  const half = (ctx.measureText(d.text || '').width / 2) * scale + 12;
  const x = Math.max(camera.x + half, Math.min(camera.x + CANVAS_WIDTH - half, d.pos.x));
  const y = Math.max(camera.y + 30, Math.min(camera.y + CANVAS_HEIGHT - 16, d.pos.y));
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.scale(scale, scale);
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
