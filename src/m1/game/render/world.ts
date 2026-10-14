import { GameStatus, Enemy, TommyBoard, DamageNumber, Particle } from '../../types';
import { attackless } from '../enemies/attackless';
import { hazeBands, steppedGlow, bandedGradient, checker, pixelBlob } from './pixelArt';
import { INK, ink, shaded, shadedTop, dark, lite } from './npc/kit';
import { setBossLook } from './bosses/kit';
import { isDummy, drawDummy } from './dummies';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, RING_CEILING_Y, RING_FLOOR_Y, LEVEL_INTRO_STYLE, COLORS, BOSS_DOOR_X, ARENA_LEFT, ARENA_RIGHT, RENDER_SCALE, PRACTICE_RANGE_STAGE, isRangeStage, GROUND_Y,
} from '../../constants';
import { drawCloudExit, drawSkyAbove } from './skyClouds';
import { STAGE_COLORS } from '../../content/roster';
import { GameState, BOSS_FALL, STAIN_FRAMES, SMEAR_FRAMES } from '../core/state';
import { drawCustomBossArena } from './bosses/arenas';
import { drawBoss, drawBossOverlay } from './bosses';
import { drawVentTelegraph, drawVent, drawMagma, isMagma } from './bosses/victorVents';
import { drawIcicles, drawIceBlock, drawIceShard } from './bosses/artieIce';
import { drawBoulder, drawRockChip } from './bosses/boulders';
import { customWeapon, customWeapons } from '../combat/customWeapons';
import { drawBullet, drawThrown, drawEnemyBullet, drawIcePellet, drawDart, drawPoopLog, drawCocaine, drawMethBarrel, drawSludgeBlob, drawDarkOrb, drawOilRocket } from './projectiles';
import { drawSadBolt } from './bosses/alien';
import { drawParticle } from './particles';
import { drawTsunamiBack, drawTsunamiFront } from './fx/tsunami';
import { drawComposited, needsComposite } from './composite';
import { drawBossCorpse } from './bosses/corpses';
import { drawVictoryPee } from '../scenes/victoryPeeDraw';
import { drawPlayer } from './player/player';
import { drawMeatheadDeath, drawBlindness, drawSpikeCam } from './player/deathAnim';
import { drawAnimalDeathScreen, animalInDeath } from './player/animalDeaths';
import { drawFallCam } from './player/fallCams';
import { drawCrashCam } from './player/crashDeath';
import { drawEyeFallCam } from './player/eyeFallCam';
import { drawKindEnemy, animFrame, KIND_TOP_REACH, kindFacing } from './enemies';
import { isMidBoss } from '../combat/midBoss';
import { drawBossHud } from './bossHud';
import { POUND_ZONES, stormSafe } from '../bosses/barry';
import { drawBackdrop, drawBackdropFront } from './backdrops';
import { drawTerrain, drawGroundProfile } from './backdrops/terrain';
import { drawGooPuddle, drawGooOverhang, drawGooString } from './goo';
import { getStageLayout } from '../stages';
import { drawEnemyDeaths } from './enemies/deaths';
import { drawSewerNukeInside, drawSewerNukeFlash, drawSewerNukeOutside } from '../scenes/sewerNukeDraw';
import { drawVolcanoFinaleInside, drawVolcanoFinaleOutside } from '../scenes/volcanoFinaleDraw';
import { drawSceneLighting } from './lighting';
import { noteShadowStage } from './player/shadow';
import { sentenceShown } from '../platform/speech';
import { drawPickup } from './pickups';
import { SKIP_AFTER, drawSkipPrompt } from '../platform/skip';
import {
  drawOilSlicks, drawOscarFire, drawOscarLaser, drawOscarRocket, drawFlyingCigarette, drawTaserOverload,
} from './bosses/oscarGear';
import { drawBlasts } from './blasts';
import { drawBossDoor, drawLairFacade } from './bossDoors';
import { drawTommyShaftBack } from './bosses/lairs/tommy';
import { drawFrozenShell, drawOnFire, drawTasedFx, drawTaserBeam, isTasedNow, statusTint, tasedJitter } from './statusFx';
import { stampsForStage } from './stamp';

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
  // The skyfall's camera, coming down out of the sky with him: drawn from up there, the camera's own place untouched
  const lift = view.status === GameStatus.LEVEL_INTRO ? state.introLift ?? 0 : 0;
  if (lift <= 0) { drawWorldAt(ctx, state, view, 0); return; }
  const restY = state.camera.y;
  state.camera.y = restY - lift;
  try { drawWorldAt(ctx, state, view, lift); } finally { state.camera.y = restY; }
};

/** How much of the camera's height the backdrop comes down by (it's far off: it moves less than the world). */
const BACKDROP_LIFT = 0.3;

const drawWorldAt = (ctx: CanvasRenderingContext2D, state: GameState, view: WorldView, lift: number) => {
  const { status, stageId } = view;
  stampsForStage(stageId);
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
  // Layered parallax scenery for the stage (a flat colour where there isn't any); coming down out of the sky, drawn from
  // its own place, lower down the screen, the sky carried on up over it
  const backLift = lift > 0 ? Math.round(lift * BACKDROP_LIFT / 2) * 2 : 0;
  if (backLift) { ctx.save(); ctx.translate(0, backLift); state.camera.y += lift; }
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
  if (backLift) { state.camera.y -= lift; ctx.restore(); drawSkyAbove(ctx, CANVAS_WIDTH, backLift, stageId); }

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
    // (the world swaying about a point: a stage's leaning, wobbling tower)
    { const wt = getStageLayout(stageId)?.worldTilt?.(state); if (wt && wt.angle) { wctx.translate(wt.x, wt.y); wctx.rotate(wt.angle); wctx.translate(-wt.x, -wt.y); } }
    // (what of the world that puts on screen: what's drawn to fill the screen fills this)
    const camX = state.camera.x - shiftX, camY = state.camera.y;
    state.view = zoom && zoom.scale !== 1
      ? { x: zoom.x + (camX - (zoom.shiftX ?? 0) - zoom.x) / zoom.scale, y: zoom.y + (camY - (zoom.shiftY ?? 0) - zoom.y) / zoom.scale, w: (CANVAS_WIDTH + shiftX * 2) / zoom.scale, h: CANVAS_HEIGHT / zoom.scale }
      : { x: camX, y: camY, w: CANVAS_WIDTH + shiftX * 2, h: CANVAS_HEIGHT };

    layout?.drawBack?.(wctx, state);
    if (!isRing) drawGroundProfile(wctx, state.groundRuns, stageId, state.frame || 0, state.view);
    if (!isRing && !drawTerrain(wctx, state.blocks, stageId, state.frame || 0, state.doorOpenAmount)) drawBlocks(wctx, state, colors);
    layout?.drawMid?.(wctx, state);
    if (state.groundSmears?.length) drawGroundSmears(wctx, state);
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
    // (the boss door: over the arena's backdrop, since once it's kicked in it's lying in there)
    if (!isRing) { drawLairFacade(wctx, state, stageId); drawBossDoor(wctx, state, stageId); }
    drawBossHazards(wctx, state);
    if (state.bossCorpse) drawBossCorpse(wctx, state.bossCorpse, state.frame);
    if (state.bossFallen) drawBossFallen(wctx, state, stageId);
    drawIcicles(wctx, state);
    drawOilSlicks(wctx, state);
    drawProjectiles(wctx, state, 'puddles');
    state.pickups.forEach(p => drawPickup(wctx, p, state.frame));
    drawTsunamiBack(wctx, state);
    drawEnemies(wctx, state, view);
    drawEnemyDeaths(wctx, state);
    for (const [, w] of customWeapons()) w.drawUnder?.(wctx, state);
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
        castShadow: true,
      });
      if (tilt) wctx.restore();
      if (state.meatheadDeath && state.deathTimer > 0) drawMeatheadDeath(wctx, state, view.currentWeapon);
      drawTaserOverload(wctx, state.player, state.frame);
      drawVictoryPee(wctx, state);
    }
    drawOscarFire(wctx, state);
    drawOscarLaser(wctx, state);
    if (state.player.isTasing && state.player.currentWeapon === 'TASER') drawTaserBeam(wctx, state);
    drawProjectiles(wctx, state, 'flying');
    if (state.waterShock) drawWaterShock(wctx, state.waterShock, state.frame);
    drawBlasts(wctx, state);
    drawMoltenStream(wctx, state);
    drawParticles(wctx, state);
    drawTsunamiFront(wctx, state);
    drawSteamRush(wctx, state);
    drawBarryLighting(wctx, state, stageId);
    if (state.sewerNuke) drawSewerNukeInside(wctx, state);
    if (state.volcanoFinale) drawVolcanoFinaleInside(wctx, state);
    for (const [, w] of customWeapons()) w.drawOverlay?.(wctx, state);
    layout?.drawFront?.(wctx, state);
    if (state.waterStains?.length) drawWaterStains(wctx, state);
    // (the numbers and the callouts go over everything too: no door or wall of the stage's in front of them)
    drawDamageNumbers(wctx, state);
    // (what he says goes over everything, the stage's buildings and scenery in front included)
    if (status !== GameStatus.LEVEL_INTRO || LEVEL_INTRO_STYLE === 'skyfall' || state.introTimer >= 80) drawPlayerSpeech(wctx, state);
    wctx.restore();
  };
  const layout = getStageLayout(stageId);
  const cylinder = layout?.cylinder?.(state);
  if (cylinder) {
    if (cylinder.inside) drawInsideCylinderWorld(ctx, cylinder.radius, cylinder.inside.horizon, worldPass);
    else drawCylinderWorld(ctx, cylinder.radius, worldPass);
    layout?.drawOverCylinder?.(ctx, state, cylinder.radius, x => {
      const a = (x - state.camera.x - CANVAS_WIDTH / 2) / cylinder.radius;
      return a - Math.round(a / (Math.PI * 2)) * Math.PI * 2;
    });
  }
  else worldPass(ctx, 0);
  // The stage's lighting over the lot (the same for everything in it: him, them, the pickups)
  const scene = layout?.lighting?.(state);
  // (what his shadow goes by next frame: the light on him, the walls it can go up, where there's water)
  noteShadowStage(stageId, scene, layout?.shadowWalls?.(state), layout?.waterBodyAt ? (x, y) => !!layout.waterBodyAt!(state, x, y) : undefined);
  if (scene) drawSceneLighting(ctx, state, cylinder ? { ...scene, flat: true } : scene, { camX: state.camera.x, camY: state.camera.y, zoom: layout?.zoom?.(state) });
  layout?.drawHud?.(ctx, state);
  // (a boss's meter up top, as the mid-bosses get: not a bar over his head)
  drawBossHud(ctx, state, stageId);

  // Screen space: the stage's weather over the level (not inside the boss arenas)
  if (state.camera.x < ARENA_LEFT - CANVAS_WIDTH / 2 && !layout?.drawBackdropFront?.(ctx, state)) drawBackdropFront(ctx, stageId, state.camera.x, state.camera.y, state.frame || 0);
  if (state.victoryString && (status === GameStatus.PLAYING || status === GameStatus.VICTORY)) drawVictoryText(ctx, state.victoryString);
  if (state.checkpointBanner && state.deathTimer <= 0) drawCheckpointBanner(ctx, state.checkpointBanner, state.frame);
  drawBlindness(ctx, state, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawSpikeCam(ctx, state, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawFallCam(ctx, state, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawCrashCam(ctx, state, CANVAS_WIDTH, CANVAS_HEIGHT, view.currentWeapon);
  drawEyeFallCam(ctx, state, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawAnimalDeathScreen(ctx, state, CANVAS_WIDTH, CANVAS_HEIGHT, view.currentWeapon);
  if (state.sewerNuke) drawSewerNukeFlash(ctx, state);
  else if (state.deathTimer > 0 && state.deathString && state.deathFreeze === undefined && !(state.deathScene && state.deathScene.t < state.deathScene.len)) drawDeathMessage(ctx, state.deathString);
  if (state.deathTimer > 0 ? state.deathFrames > SKIP_AFTER : state.dyingSkipAt !== undefined && state.frame - state.dyingSkipAt >= 0 && state.frame - state.dyingSkipAt <= 1) drawSkipPrompt(ctx, CANVAS_WIDTH);
  // Skyfall intro: coming down out of the clouds the deploy transition dove into
  // (not on a stage that starts him on his feet: those have their own way in)
  if (status === GameStatus.LEVEL_INTRO && LEVEL_INTRO_STYLE === 'skyfall' && !layout?.startsStanding) drawCloudExit(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, stageId, state.introTimer);
};

/**
 * Fouled water: a slick spreading out on the surface from where the sludge or the rocket went in, with the water
 * under it clouded (green-brown for the sludge; black with a rainbow sheen for the oil), fading out as it breaks up.
 */
/** Skid marks where he slid in his shitty pants: a brown streak along the floor, thickest in the middle, fading out. */
const drawGroundSmears = (ctx: CanvasRenderingContext2D, state: GameState) => {
  for (const s of state.groundSmears!) {
    const k = (state.frame - s.at) / SMEAR_FRAMES;
    const a = k > 0.5 ? 1 - (k - 0.5) / 0.5 : 1;
    const x1 = Math.round(s.x1 / 2) * 2, w = Math.max(2, Math.round((s.x2 - s.x1) / 2) * 2), y = Math.round(s.y);
    ctx.fillStyle = `rgba(92, 58, 22, ${0.85 * a})`; ctx.fillRect(x1, y - 2, w, 4);
    ctx.fillStyle = `rgba(122, 82, 36, ${0.7 * a})`; ctx.fillRect(x1 + 2, y - 2, Math.max(0, w - 4), 2);
    // (streaky: gaps and drips along it)
    ctx.fillStyle = `rgba(60, 36, 14, ${0.8 * a})`;
    for (let x = x1 + 6; x < x1 + w - 4; x += 14) ctx.fillRect(x, y - 1, 4, 2);
  }
};

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

/** The cylinder's screen columns, merged into runs: [destX, destW, srcX, srcW] (cached per radius). */
let cylinderRunCache: { key: string; runs: [number, number, number, number][] } | null = null;
const cylinderRuns = (radius: number, pad: number) => {
  const key = `${radius}:${pad}`;
  if (cylinderRunCache?.key === key) return cylinderRunCache.runs;
  const half = CANVAS_WIDTH / 2, STEP = 2;
  // Each 2px screen column takes the strip column at the matching angle
  const cols: [number, number, number][] = []; // [destX, srcLeft, srcRight]
  for (let sx = 0; sx < CANVAS_WIDTH; sx += STEP) {
    const d = sx + STEP / 2 - half;
    if (Math.abs(d) >= radius) continue;
    const a = Math.asin(d / radius);
    const src = pad + half + radius * a;
    const srcW = Math.min(14, STEP / Math.max(0.12, Math.cos(a)));
    cols.push([sx, src - srcW / 2, src + srcW / 2]);
  }
  // Merge neighbours while one straight mapping still lands every device pixel within a fraction of where it did
  const TOL = 0.35 / RENDER_SCALE, sub = 1 / RENDER_SCALE;
  const fits = (i: number, j: number) => {
    const x0 = cols[i][0], x1 = cols[j][0] + STEP, s0 = cols[i][1], s1 = cols[j][2];
    for (let k = i; k <= j; k++) {
      const [cx, l, r] = cols[k];
      for (let x = cx + sub / 2; x < cx + STEP; x += sub) {
        const want = l + ((x - cx) / STEP) * (r - l), got = s0 + ((x - x0) / (x1 - x0)) * (s1 - s0);
        if (Math.abs(want - got) > TOL) return false;
      }
    }
    return true;
  };
  const runs: [number, number, number, number][] = [];
  for (let i = 0; i < cols.length;) {
    let j = i;
    while (j + 1 < cols.length && cols[j + 1][0] === cols[j][0] + STEP && fits(i, j + 1)) j++;
    runs.push([cols[i][0], cols[j][0] + STEP - cols[i][0], cols[i][1], cols[j][2] - cols[i][1]]);
    i = j + 1;
  }
  cylinderRunCache = { key, runs };
  return runs;
};

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
  // Wrap it round: each 2px screen column takes the strip column at the matching angle (runs of columns that
  // map near enough linearly are laid on in one blit: the same samples, give or take a fraction of a pixel)
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  for (const [dx, dw, sx, sw] of cylinderRuns(radius, pad)) ctx.drawImage(cylinderStrip, sx * RENDER_SCALE, 0, sw * RENDER_SCALE, CANVAS_HEIGHT * RENDER_SCALE, dx, 0, dw, CANVAS_HEIGHT);
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

/**
 * The same trick seen from inside the cylinder (a roundabout you're walking round, the wall of it facing in): the
 * middle of the view is the far wall, the sides swing round toward you, getting wider and taller (about the horizon,
 * so the floor drops away and the tops rise at the edges). Column by column, each one stretched for how near it is.
 */
const drawInsideCylinderWorld = (ctx: CanvasRenderingContext2D, radius: number, horizon: number, worldPass: (w: CanvasRenderingContext2D, shiftX: number) => void) => {
  if (typeof document === 'undefined') return;
  const half = CANVAS_WIDTH / 2, STEP = 2;
  // (the screen's edge, seen from the middle, is only this far round the wall: the strip needs just a little extra)
  const pad = 40, w = CANVAS_WIDTH + pad * 2;
  if (!cylinderStrip) cylinderStrip = document.createElement('canvas');
  if (cylinderStrip.width !== w * RENDER_SCALE || cylinderStrip.height !== CANVAS_HEIGHT * RENDER_SCALE) {
    cylinderStrip.width = w * RENDER_SCALE; cylinderStrip.height = CANVAS_HEIGHT * RENDER_SCALE;
  }
  const s = cylinderStrip.getContext('2d')!;
  s.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
  s.clearRect(0, 0, w, CANVAS_HEIGHT);
  worldPass(s, pad);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  for (let sx = 0; sx < CANVAS_WIDTH; sx += STEP) {
    const a = Math.atan((sx + STEP / 2 - half) / radius), c = Math.cos(a);
    const src = pad + half + radius * a, srcW = STEP * c * c, k = 1 / c;
    ctx.drawImage(cylinderStrip, (src - srcW / 2) * RENDER_SCALE, 0, srcW * RENDER_SCALE, CANVAS_HEIGHT * RENDER_SCALE, sx, horizon - horizon * k, STEP, CANVAS_HEIGHT * k);
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
  ctx.fillStyle = '#161513'; ctx.fillRect(0, 0, W, CANVAS_HEIGHT);
  for (let y = top; y < mat; y += 20) for (let x = (((y - top) / 20) % 2) * 22 - 22; x < W; x += 44) {
    const c = h(x * 0.37 + y) > 0.5 ? '#24221F' : '#201E1B';
    ctx.fillStyle = c; ctx.fillRect(x + 1, y + 1, 42, 18);
    ctx.fillStyle = '#2C2A26'; ctx.fillRect(x + 1, y + 1, 42, 1.4); ctx.fillRect(x + 1, y + 2, 1.4, 16); // (the lit edge)
    ctx.fillStyle = '#191715'; ctx.fillRect(x + 1, y + 17, 42, 2);
  }
  for (let k = 0; k < 7; k++) { // (old green paint, what's left of it)
    const px = h(k) * W, py = top + 40 + h(k + 9) * 130, rw = 30 + h(k + 3) * 60, rh = 16 + h(k + 5) * 30;
    pixelBlob(ctx, px, py, rw, rh, 'rgba(64, 80, 58, 0.35)');
    ctx.fillStyle = 'rgba(120, 140, 110, 0.18)'; ctx.fillRect(Math.floor(px - rw * 0.6), Math.floor(py - rh * 0.8), Math.floor(rw * 0.8), 2); // (its curling edge, catching the light)
  }
  for (let k = 0; k < 6; k++) {
    const sx = Math.floor(40 + h(k + 20) * (W - 80)), sw = Math.floor(8 + h(k + 21) * 10), sh = 60 + h(k + 22) * 130;
    ctx.fillStyle = 'rgba(80, 60, 30, 0.28)'; ctx.fillRect(sx, top, sw, sh);
    checker(ctx, sx, top + Math.floor(sh / 2) * 2, sw, 6, 'rgba(80, 60, 30, 0.28)', 0);
    ctx.fillStyle = 'rgba(110, 80, 40, 0.3)'; ctx.fillRect(sx + 2, top, 2, sh - 10);
  }
  // The ceiling: sagging tiles on a grid, a few gone (the dark in the holes), one hanging down, a brown stain over the
  // corner where the roof leaks, and a joist along the front edge of it
  ctx.fillStyle = '#2A2824'; ctx.fillRect(0, 0, W, top);
  for (let x = 0; x < W; x += 50) for (let y = top - 150; y < top; y += 30) {
    const k = x * 7 + y, hole = h(k) < 0.12;
    const c = hole ? '#0B0A09' : h(k + 1) < 0.2 ? '#3E3A33' : '#46423A';
    ctx.fillStyle = c; ctx.fillRect(x + 1, y + 1, 48, 28);
    if (hole) { ctx.fillStyle = '#1A1815'; ctx.fillRect(x + 1, y + 1, 48, 4); continue; }
    ctx.fillStyle = 'rgba(255, 250, 230, 0.06)'; ctx.fillRect(x + 1, y + 1, 48, 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'; ctx.fillRect(x + 1, y + 26, 48, 3);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'; for (let d = 0; d < 5; d++) ctx.fillRect(x + 4 + h(k + d) * 40, y + 4 + h(k - d) * 20, 1, 1);
  }
  pixelBlob(ctx, W - 70, top - 12, 60, 20, 'rgba(120, 85, 40, 0.3)');
  pixelBlob(ctx, W - 70, top - 12, 36, 11, 'rgba(120, 85, 40, 0.3)');
  ctx.save(); ctx.translate(250, top - 2); ctx.rotate(0.35); // (a tile hanging off by a corner)
  shadedTop(ctx, () => ctx.rect(0, 0, 48, 6), '#46423A', 0, 0, 48, 6, 0.8); ctx.restore();
  shadedTop(ctx, () => ctx.rect(-1, top - 8, W + 2, 10), '#26231F', -1, top - 8, W + 2, 10);
  ctx.fillStyle = '#3A362F'; ctx.fillRect(0, top - 7, W, 1.4);
  // A window up high: one pane out, the dirty light coming in through it, dust in the light
  const wx = 560, wy = top + 16;
  shaded(ctx, () => ctx.rect(wx - 4, wy - 4, 128, 68), '#3F3F46', wx - 4, wy - 4, 128, 68);
  for (let i = 0; i < 4; i++) {
    const px = wx + (i % 2) * 62, py = wy + Math.floor(i / 2) * 31;
    if (i === 2) { ctx.fillStyle = '#0B0B0F'; ctx.fillRect(px, py, 58, 28); continue; }
    bandedGradient(ctx, px, py, 58, 28, ['#8D99A8', '#6F7B8A', '#58626F'], 4);
    ctx.fillStyle = 'rgba(60, 50, 30, 0.35)'; ctx.fillRect(px, py + 20, 58, 8); checker(ctx, px, py + 16, 58, 4, 'rgba(60, 50, 30, 0.35)', 0);
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(px + 4, py + 2, 2, 12); ctx.fillRect(px + 8, py + 2, 1, 6);
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(px - 0.5, py - 0.5, 59, 29);
  }
  ink(ctx, () => { ctx.moveTo(wx, wy + 31); ctx.lineTo(wx + 20, wy + 31); ctx.lineTo(wx, wy + 48); ctx.closePath(); }, '#A8B2BF', 0.8); // (a shard still in the frame)
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(wx - 4.5, wy - 4.5, 129, 69);
  for (let k = 0; k < 3; k++) { // (the shaft of light, in steps)
    ctx.fillStyle = `rgba(226, 232, 240, ${(0.05 - k * 0.012).toFixed(3)})`;
    ctx.beginPath(); ctx.moveTo(wx + k * 10, wy); ctx.lineTo(wx + 120 - k * 10, wy); ctx.lineTo(wx - 60 - k * 30, mat); ctx.lineTo(wx - 260 + k * 30, mat); ctx.fill();
  }
  ctx.fillStyle = 'rgba(226, 232, 240, 0.4)';
  for (let k = 0; k < 14; k++) { const t = (frame * 0.2 + k * 37) % 400; ctx.fillRect(Math.floor(wx - 140 + h(k) * 200 - t * 0.3), Math.floor(wy + 40 + t), 2, 2); }
  // The bleachers: rows of benches, seats gone out of them, a section fallen in on the left
  for (let r = 0; r < 4; r++) {
    const y = 250 + r * 42;
    for (let x = 0; x < W; x += 44) {
      const gone = h(x * 3 + r * 17) < 0.18 || (x < 176 && r >= 2);
      if (gone) continue;
      shaded(ctx, () => ctx.rect(x + 4, y + 8, 4, 18), '#1F1C1A', x + 4, y + 8, 4, 18, 0.8);
      shaded(ctx, () => ctx.rect(x + 36, y + 8, 4, 18), '#1F1C1A', x + 36, y + 8, 4, 18, 0.8);
      shadedTop(ctx, () => ctx.rect(x + 2, y, 40, 8), '#34302B', x + 2, y, 40, 8, 0.8);
      ctx.fillStyle = '#48423A'; ctx.fillRect(x + 3, y + 1, 38, 1);
    }
  }
  // (the fallen-in bit: planks down at an angle, a folding chair on its side)
  for (let k = 0; k < 4; k++) { ctx.save(); ctx.translate(30 + k * 38, 340 + (k % 2) * 30); ctx.rotate(0.35 - k * 0.2); shadedTop(ctx, () => ctx.rect(-24, -4, 48, 8), '#34302B', -24, -4, 48, 8, 0.8); ctx.restore(); }
  for (const [lw, c] of [[5, INK], [3, '#52525B']] as const) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(210, 400); ctx.lineTo(236, 392); ctx.lineTo(240, 410); ctx.moveTo(214, 392); ctx.lineTo(230, 414); ctx.stroke(); }
  // The heavy bag on its chain, taped up where it split; a poster half off the wall; the notice
  const bagSway = Math.sin(frame * 0.02) * 0.04;
  ctx.save(); ctx.translate(96, top); ctx.rotate(bagSway);
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 150); ctx.stroke();
  ctx.strokeStyle = '#71717A'; ctx.lineWidth = 1.4; ctx.setLineDash([3, 2]); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 150); ctx.stroke(); ctx.setLineDash([]);
  shaded(ctx, () => ctx.roundRect(-18, 150, 36, 80, 10), '#7F1D1D', -18, 150, 36, 80);
  ctx.fillStyle = lite('#7F1D1D', 0.35); ctx.fillRect(-12, 156, 3, 66);
  shadedTop(ctx, () => ctx.rect(-18, 176, 36, 7), '#A1A1AA', -18, 176, 36, 7, 0.8);
  shadedTop(ctx, () => ctx.rect(-18, 204, 36, 5), '#A1A1AA', -18, 204, 36, 5, 0.8);
  ink(ctx, () => ctx.rect(-6, 214, 12, 10), '#D6D3D1', 0.7);
  ctx.fillStyle = '#7F1D1D'; ctx.fillRect(-2, 222, 4, 4); // (the stuffing coming out under the tape)
  ctx.fillStyle = '#E7E5E4'; ctx.fillRect(-1, 224, 2, 3);
  ctx.restore();
  ctx.save(); ctx.translate(330, top + 26); ctx.rotate(-0.08);
  ink(ctx, () => { ctx.moveTo(0, 0); ctx.lineTo(70, 0); ctx.lineTo(70, 60); ctx.lineTo(62, 66); ctx.lineTo(56, 70); ctx.lineTo(48, 80); ctx.lineTo(40, 96); ctx.lineTo(0, 96); ctx.closePath(); }, '#A8A29E', 1);
  ctx.fillStyle = 'rgba(80, 60, 30, 0.3)'; ctx.fillRect(1, 70, 40, 25);
  ctx.fillStyle = '#7F1D1D'; ctx.fillRect(4, 36, 60, 3);
  ctx.font = 'bold 8px "Press Start 2P"'; ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillText('FIGHT', 9, 21); ctx.fillText('NIGHT', 9, 33);
  ctx.fillStyle = '#7F1D1D'; ctx.fillText('FIGHT', 8, 20); ctx.fillText('NIGHT', 8, 32);
  ctx.fillStyle = '#44403C'; ctx.font = '6px "Press Start 2P"'; ctx.fillText('1987', 8, 48);
  ctx.fillStyle = '#57534E'; ctx.fillRect(8, 54, 34, 14); ctx.fillStyle = '#78716C'; ctx.fillRect(10, 56, 12, 10); ctx.fillRect(28, 56, 12, 10); // (the two fighters' photos, faded)
  ctx.fillStyle = 'rgba(231, 229, 228, 0.8)'; ctx.fillRect(-3, -2, 10, 5); ctx.restore();
  ink(ctx, () => ctx.rect(440, top + 40, 54, 40), '#FDE68A', 1);
  ctx.fillStyle = '#E9C46A'; ctx.fillRect(441, top + 70, 52, 9);
  ctx.fillStyle = '#B91C1C'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.fillText('CONDEMNED', 441, top + 54);
  ctx.fillStyle = '#44403C'; for (let k = 0; k < 3; k++) ctx.fillRect(444, top + 62 + k * 5, 44 - k * 8, 2);
  ctx.fillStyle = '#A1A1AA'; ctx.fillRect(442, top + 42, 2, 2); ctx.fillRect(490, top + 42, 2, 2);
  // The light over the ring: a tube fixture, one tube dead, the other flickering; its pool of light in rings
  const flick = h(Math.floor(frame / 3)) < 0.08 ? 0.25 : h(Math.floor(frame / 40)) < 0.1 ? 0.6 : 1;
  steppedGlow(ctx, W / 2, mat - 120, 420, '#ECFCCB', 0.07 * flick, 0.015 * flick, 6);
  ctx.strokeStyle = '#3F3F46'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W / 2 - 50, top); ctx.lineTo(W / 2 - 50, top + 12); ctx.moveTo(W / 2 + 50, top); ctx.lineTo(W / 2 + 50, top + 16); ctx.stroke();
  ctx.save(); ctx.translate(W / 2, top + 14); ctx.rotate(0.03);
  shadedTop(ctx, () => ctx.rect(-70, 0, 140, 8), '#3F3F46', -70, 0, 140, 8, 0.9);
  ctx.fillStyle = '#52525B'; ctx.fillRect(-62, 8, 124, 3);
  ctx.fillStyle = `rgba(236, 252, 203, ${0.35 + 0.65 * flick})`; ctx.fillRect(-62, 11, 124, 3);
  ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * flick})`; ctx.fillRect(-58, 11, 116, 1);
  ctx.fillStyle = '#A1A1AA'; ctx.fillRect(-64, 10, 3, 5); ctx.fillRect(61, 10, 3, 5); ctx.restore();
  // The drip from the roof into the bucket
  const bx = W - 70;
  shaded(ctx, () => { ctx.moveTo(bx - 14, mat - 26); ctx.lineTo(bx + 14, mat - 26); ctx.lineTo(bx + 11, mat); ctx.lineTo(bx - 11, mat); ctx.closePath(); }, '#52525B', bx - 14, mat - 26, 28, 26);
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(bx - 13, mat - 16, 26, 1.4); ctx.fillRect(bx - 12, mat - 7, 24, 1.4); // (its ribs)
  ink(ctx, () => ctx.ellipse(bx, mat - 26, 14, 2.4, 0, 0, Math.PI * 2), '#1E3A5F', 0.9);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(bx, mat - 24, 12, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); // (the handle)
  const dt = frame % 70;
  ctx.fillStyle = 'rgba(147, 197, 253, 0.75)';
  if (dt < 40) ctx.fillRect(bx - 1, top + 4 + (mat - 30 - top) * (dt / 40) ** 2, 2, 4);
  else if (dt < 46) { ctx.beginPath(); ctx.arc(bx, mat - 26, (dt - 40) * 1.5, Math.PI, 0); ctx.fill(); }
  // The corner posts, rusting, the turnbuckle pads cracked and taped; the ropes, sagging between them
  const posts = [10, W - 10];
  const ropes = [{ y: mat - 150, c: '#B91C1C', sag: 10 }, { y: mat - 105, c: '#D6D3D1', sag: 16 }, { y: mat - 60, c: '#1E40AF', sag: 8 }];
  for (const r of ropes) {
    const curve = (dy: number) => { ctx.beginPath(); ctx.moveTo(posts[0], r.y + dy); ctx.quadraticCurveTo(W / 2, r.y + dy + r.sag * 2, posts[1], r.y + dy); ctx.stroke(); };
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 5; curve(6);
    ctx.strokeStyle = INK; ctx.lineWidth = 7; curve(0);
    ctx.strokeStyle = dark(r.c, 0.25); ctx.lineWidth = 5; curve(0);
    ctx.strokeStyle = r.c; ctx.lineWidth = 3; curve(-0.6);
    ctx.strokeStyle = lite(r.c, 0.45); ctx.lineWidth = 1; curve(-1.6);
    // (duct tape round it where it's frayed)
    for (const tx of [0.3, 0.64]) { const x = posts[0] + (posts[1] - posts[0]) * tx, y = r.y + 4 * r.sag * tx * (1 - tx); shaded(ctx, () => ctx.rect(x - 5, y - 4, 10, 8), '#A1A1AA', x - 5, y - 4, 10, 8, 0.8); }
  }
  ctx.lineCap = 'butt';
  for (const x of posts) {
    shaded(ctx, () => ctx.rect(x - 6, mat - 180, 12, 180), '#78716C', x - 6, mat - 180, 12, 180);
    for (let k = 0; k < 6; k++) {
      const rx = Math.floor(x - 6 + h(x + k) * 8), ry = Math.floor(mat - 175 + k * 28), rw = Math.floor(4 + h(k) * 4), rh = Math.floor(6 + h(x * k) * 10);
      ctx.fillStyle = 'rgba(154, 52, 18, 0.65)'; ctx.fillRect(rx, ry, rw, rh);
      checker(ctx, rx, ry + rh, rw, 4, 'rgba(154, 52, 18, 0.5)', 0);
    }
    for (const r of ropes) {
      shaded(ctx, () => ctx.roundRect(x - 11, r.y - 7, 22, 18, 3), r.c, x - 11, r.y - 7, 22, 18);
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 6, r.y - 5); ctx.lineTo(x - 1, r.y + 3); ctx.lineTo(x + 4, r.y + 9); ctx.stroke();
      shadedTop(ctx, () => ctx.rect(x - 11, r.y + 2, 22, 4), '#A1A1AA', x - 11, r.y + 2, 22, 4, 0.7);
    }
  }
  // The mat: grey gone yellow, stains, duct-tape crosses over the splits, a tear
  bandedGradient(ctx, 0, mat, W, 14, ['#D4CCB4', '#C8C0A8', '#B4AC94'], 3);
  ctx.fillStyle = '#E2DCC6'; ctx.fillRect(0, mat, W, 1.4);
  ctx.fillStyle = INK; ctx.fillRect(0, mat - 0.5, W, 1);
  for (let k = 0; k < 5; k++) { const sx = Math.floor(80 + k * 160 + h(k) * 60), sw = Math.floor(22 + h(k + 1) * 20); ctx.fillStyle = 'rgba(92, 64, 51, 0.35)'; ctx.fillRect(sx - sw, mat + 5, sw * 2, 4); ctx.fillRect(sx - sw + 6, mat + 3, sw * 2 - 12, 8); }
  for (const tx of [210, 470]) { ctx.save(); ctx.translate(tx, mat + 7); for (const a of [0.5, -0.5]) { ctx.save(); ctx.rotate(a); ink(ctx, () => ctx.rect(-14, -2, 28, 4), '#A1A1AA', 0.6); ctx.restore(); } ctx.restore(); }
  ink(ctx, () => { ctx.moveTo(620, mat + 4); ctx.lineTo(660, mat + 8); ctx.lineTo(624, mat + 11); ctx.closePath(); }, '#44403C', 0.8);
  ctx.fillStyle = 'rgba(153, 27, 27, 0.4)'; ctx.fillRect(W * 0.62, mat + 6, 14, 3); ctx.fillRect(W * 0.3, mat + 8, 6, 2);
  // The apron skirt, faded, stained, its lettering coming off (one letter gone)
  const ah = CANVAS_HEIGHT - mat - 14;
  bandedGradient(ctx, 0, mat + 14, W, ah, ['#1B2540', '#243152', '#1F2A48', '#141B30'], 6);
  ctx.fillStyle = INK; ctx.fillRect(0, mat + 13.5, W, 1);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, mat + 14.5, W, 3);
  for (let x = 0; x < W; x += 60) { ctx.fillStyle = '#141B30'; ctx.fillRect(x, mat + 14, 3, ah); ctx.fillStyle = '#2E3D63'; ctx.fillRect(x + 3, mat + 14, 1, ah); } // (the folds)
  ctx.fillStyle = 'rgba(60, 40, 20, 0.35)'; for (let k = 0; k < 4; k++) ctx.fillRect(Math.floor(h(k + 40) * W), mat + 14, Math.floor(20 + h(k + 41) * 40), ah);
  ctx.font = 'bold 12px "Press Start 2P"'; ctx.textAlign = 'left';
  const word = "MEATHEAD'S GYM", gone = word.indexOf('Y');
  let lx = W / 2 - ctx.measureText(word).width / 2;
  for (let i = 0; i < word.length; i++) {
    const ly = mat + 38 + (i === gone + 1 ? 2 : 0);
    if (i !== gone) { ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'; ctx.fillText(word[i], lx + 1, ly + 1); }
    ctx.fillStyle = i === gone ? 'rgba(202, 164, 21, 0.18)' : 'rgba(202, 164, 21, 0.8)';
    ctx.fillText(word[i], lx, ly);
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
    // (one the stage draws itself, as part of its scenery)
    if (b.type === 'door' || b.hidden) return;
    else if (b.type === 'pit') ctx.fillStyle = '#f00';
    else {
      ctx.fillStyle = colors.ground;
      ctx.strokeStyle = colors.accent;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
    }
    ctx.fillRect(b.x, b.y, b.w, b.h);
  });
};

/** Endless scrolling sewer shaft behind Toxic Tommy's arena. */
const drawTommyShaft = (ctx: CanvasRenderingContext2D, state: GameState) => {
  ctx.save();
  const arenaLeft = ARENA_LEFT;
  const arenaRight = ARENA_RIGHT;
  // The shaft has no top: it's drawn over whatever of it is in view, however high he's got (and down past the sludge)
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  const y0 = Math.min(v.y - 60, -500), y1 = Math.max(v.y + v.h + 60, 800);

  // The inside of it: brick, outfalls, the ladder, pipes, the striped edges (see lairs/tommy.ts)
  drawTommyShaftBack(ctx, arenaLeft, arenaRight, y0, y1, v, state.tommyScrollY, state.frame);

  // The shaft's own walls either side (the door's wall, and the far wall), going by with everything else: big
  // blocks of sewer stone, rising, so the whole shaft reads as climbing
  const stone = (x0: number, w: number, bottom: number) => {
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, bottom - y0); ctx.clip();
    ctx.fillStyle = '#1f2a20'; ctx.fillRect(x0, y0, w, bottom - y0);
    const off = state.tommyScrollY % 40;
    for (let y = Math.floor((y0 - off) / 40) * 40 + off; y < bottom; y += 40) {
      ctx.fillStyle = '#121a13'; ctx.fillRect(x0, y, w, 3);
      const row = Math.round((y - off) / 40);
      for (let x = x0 + (((row % 2) + 2) % 2) * 22; x < x0 + w; x += 44) ctx.fillRect(x, y, 3, 40);
      ctx.fillStyle = '#2f3f30'; ctx.fillRect(x0, y + 3, w, 2);
      // (slime weeping down out of the joints, going by with them)
      if (hash1(row * 7 + x0) > 0.7) { ctx.fillStyle = 'rgba(46, 204, 113, 0.5)'; ctx.fillRect(x0 + 6 + hash1(row + x0) * (w - 12), y + 5, 3, 12 + hash1(row * 3) * 20); }
    }
    ctx.restore();
  };
  // (the door's wall down to the top of the doorway; the far wall all the way)
  const door = state.blocks.find(b => b.type === 'door');
  stone(BOSS_DOOR_X, arenaLeft - BOSS_DOOR_X, door ? door.y : 400);
  stone(arenaRight, CANVAS_WIDTH, y1);

  ctx.restore();
};
const hash1 = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/**
 * Victor: the steam off a vent the wave's blown, rushing back along to him (it's his volcano: it comes up through him).
 * A jet of it, white-hot at the core, its head billowing, from the vent to wherever he is: over the wave, so it reads.
 */
const drawSteamRush = (ctx: CanvasRenderingContext2D, state: GameState) => {
  const boss = state.enemies.find(e => e.type === 'boss' && e.steamFrom && e.steamAt !== undefined && e.steamStart !== undefined);
  if (!boss) return;
  const a = boss.steamFrom!, span = Math.max(1, boss.steamAt! - boss.steamStart!);
  const k = Math.min(1, (state.frame - boss.steamStart!) / span);
  const tx = boss.pos.x + boss.width / 2, ty = boss.pos.y + boss.height * 0.45;
  // (low along the floor, arcing up into him at the end)
  const at = (q: number) => ({ x: a.x + (tx - a.x) * q, y: a.y + (ty - a.y) * q * q - Math.sin(q * Math.PI) * 30 });
  const head = k, tail = Math.max(0, k - 0.55);
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const [w, color] of [[22, 'rgba(226, 232, 240, 0.45)'], [13, 'rgba(248, 250, 252, 0.85)'], [5, 'rgba(253, 186, 116, 0.9)']] as const) {
    ctx.strokeStyle = color; ctx.lineWidth = w;
    ctx.beginPath();
    for (let q = tail; q <= head + 0.001; q += 0.04) { const pt = at(Math.min(q, head)); const wob = Math.sin(q * 30 - state.frame * 0.8) * 3; if (q === tail) ctx.moveTo(pt.x, pt.y + wob); else ctx.lineTo(pt.x, pt.y + wob); }
    ctx.stroke();
  }
  // Its head: a billow of it, pushing on
  const h = at(head);
  for (let i = 0; i < 6; i++) {
    const r = 9 + ((i * 7 + state.frame) % 9);
    ctx.fillStyle = i % 2 ? 'rgba(248, 250, 252, 0.85)' : 'rgba(203, 213, 225, 0.8)';
    ctx.beginPath(); ctx.arc(h.x + Math.cos(i * 1.7 + state.frame * 0.3) * 10, h.y + Math.sin(i * 2.3 + state.frame * 0.3) * 9, r, 0, Math.PI * 2); ctx.fill();
  }
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

/** How far off the screen an enemy can be and still be drawn (anything further, isn't). */
const CULL = 500;

const drawEnemies = (ctx: CanvasRenderingContext2D, state: GameState, { status, stageId, bossTauntText }: WorldView) => {
  const { player } = state;
  // (a test subject on hypermode is coming for him and nobody else: it's drawn over all the rest of them)
  const enemies = state.enemies.some(e => e.hyper) ? [...state.enemies.filter(e => !e.hyper), ...state.enemies.filter(e => e.hyper)] : state.enemies;
  enemies.forEach(live => {
    // (a tenant's dead as he falls, but he's still to be seen going)
    if (live.health <= 0 && !live.isBlownAway && !(live.kind === 'tenant' && (live.aiState === 'fall' || live.aiState === 'splat'))) return;
    // (the animal that's killing him: his death draws it, doing it)
    if (animalInDeath(state, live)) return;
    // (nowhere near the screen: not drawn, its fire and all; a good way out either side, for the zoomed-out views)
    if (live.type !== 'boss' && (live.pos.x + live.width < state.camera.x - CULL || live.pos.x > state.camera.x + CANVAS_WIDTH + CULL || live.pos.y + live.height < state.camera.y - CULL || live.pos.y > state.camera.y + CANVAS_HEIGHT + CULL)) return;
    // (dead and going: without whatever attack it was in the middle of, so that doesn't go flying with it)
    const e = live.isBlownAway || live.health <= 0 ? attackless(live) : live;
    ctx.save();
    const tased = isTasedNow(e, state);
    if (tased) { const j = tasedJitter(state); ctx.translate(j.x, j.y); }
    // (posed by the game: leaned, squashed, turned round, tinted, about its feet)
    if (e.pose && !e.isBlownAway) { const px = e.pos.x + e.width / 2, py = e.pos.y + e.height; ctx.translate(px, py); ctx.rotate(e.pose.lean); ctx.scale(e.pose.sx, e.pose.sy); if (e.pose.face && e.kind && kindFacing(e, state) !== e.pose.face) ctx.scale(-1, 1); ctx.translate(-px, -py); if (e.pose.filter) ctx.filter = e.pose.filter; }
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
      // (oiled, needled: the filter and the shadow on the finished dummy once, not on each of its shapes; firing oil
      // rockets into the ring's dummies was paying for a blur on every one of them, every frame)
      if (needsComposite(ctx)) drawComposited(ctx, { x: e.pos.x - 40, y: e.pos.y - 60, w: e.width + 80, h: e.height + 100 }, c => drawDummy(c, e, animFrame(e, state.frame)));
      else drawDummy(ctx, e, animFrame(e, state.frame));
    } else if (e.kind && getStageLayout(stageId)?.drawSpecialEnemy?.(ctx, e, state)) {
      // (a stage's mid-boss draws itself)
    } else if (e.kind) {
      // (oiled, drugged or flickering: the filter goes on the finished enemy once, not on each of its shapes)
      // (iced over or lit up: washed over just its own pixels)
      const tint = statusTint(e, state);
      if (tint || needsComposite(ctx)) drawComposited(ctx, { x: e.pos.x - 40, y: e.pos.y - 60, w: e.width + 80, h: e.height + 100 }, c => drawKindEnemy(c, e, state), tint ? { tint } : null);
      else drawKindEnemy(ctx, e, state);
      // Dazed from a knock: a few stars going round his head
      if ((e.pauseTimer || 0) > (e.puppet ? 2 : 0) && !e.isBlownAway && e.health > 0) {
        const hx = e.pos.x + e.width / 2, hy = e.pos.y - 8 - (KIND_TOP_REACH[e.kind] ?? 0) * 0.6; // (round his head, where it's drawn)
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
    if (e.type !== 'boss' && e.frozenTimer && e.frozenTimer > 0) { ctx.filter = 'none'; ctx.shadowBlur = 0; drawFrozenShell(ctx, e, state.frame); }
    if (tased) { ctx.filter = 'none'; ctx.shadowBlur = 0; drawTasedFx(ctx, e, state); }
    if (e.type !== 'boss' && e.isOnFire && e.health > 0) { ctx.filter = 'none'; ctx.shadowBlur = 0; drawOnFire(ctx, e, state.frame); }
    drawStuckNeedles(ctx, e, state.frame);
    if (SHOW_ENEMY_BARS && !e.isBlownAway && e.drownT === undefined && !isMidBoss(e) && e.type !== 'boss' && e.kind !== 'civilian' && e.kind !== 'visitor' && e.kind !== 'generator' && e.kind !== 'minion' && e.kind !== 'tenant' && !(e.kind === 'magmafish' && (!e.aiState || e.aiState === 'idle'))) drawEnemyBar(ctx, e, e.pos.y - 10 - (e.kind ? KIND_TOP_REACH[e.kind] ?? 0 : 0)); // (over its head, not across it)
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
  // (nothing over his head once the boss is down: the death, the victory)
  if (!state.playerLastVulgarity || state.playerVulgarityTimer <= 0 || state.bossExplosionTimer > 0 || state.bossFallen || state.victoryString !== '') return;
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
  // (the camera pulled back (a section's zoom): the words kept their full size, and on screen in the wider view)
  const m = ctx.getTransform(), z = m.a / (ctx.canvas.width / CANVAS_WIDTH);
  if (m.a > 0 && z < 0.99) {
    const L = -m.e / m.a, R = (ctx.canvas.width - m.e) / m.a, h = half / z;
    const x = Math.max(L + h, Math.min(R - h, player.pos.x + player.width / 2));
    ctx.translate(x, player.pos.y - 20); ctx.scale(1 / z, 1 / z);
    ctx.fillText(line, 0, 0);
    ctx.restore();
    return;
  }
  const x = Math.max(state.camera.x + half, Math.min(state.camera.x + CANVAS_WIDTH - half, player.pos.x + player.width / 2));
  ctx.fillText(line, x, player.pos.y - 20);
  ctx.restore();
};

/**
 * A regular enemy's health over its head, 16-bit: an inked frame, a dark trough, the bar in three bands (a lit top,
 * the color, a shaded bottom), green going yellow then red as it drops, cut into cells, on the 2px grid.
 */
/** Regular enemies' bars over their heads: off (an option to turn them back on, maybe, later). */
export const SHOW_ENEMY_BARS = false;
const BAR_RAMPS = [['#BBF7D0', '#22C55E', '#15803D'], ['#FEF08A', '#EAB308', '#A16207'], ['#FECACA', '#EF4444', '#991B1B']];
const drawEnemyBar = (ctx: CanvasRenderingContext2D, e: Enemy, top: number) => {
  const k = Math.max(0, Math.min(1, e.health / e.maxHealth));
  const w = Math.max(16, Math.round(e.width / 2) * 2), x = Math.round((e.pos.x + e.width / 2 - w / 2) / 2) * 2, y = Math.round(top / 2) * 2;
  ctx.fillStyle = '#0B0B0F'; ctx.fillRect(x - 2, y - 2, w + 4, 10);
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(x, y, w, 6);
  ctx.fillStyle = '#18181B'; ctx.fillRect(x, y + 4, w, 2);
  const fw = Math.round(w * k / 2) * 2;
  if (fw > 0) {
    const [lit, mid, dark] = BAR_RAMPS[k > 0.5 ? 0 : k > 0.25 ? 1 : 2];
    ctx.fillStyle = mid; ctx.fillRect(x, y, fw, 6);
    ctx.fillStyle = lit; ctx.fillRect(x, y, fw, 2);
    ctx.fillStyle = dark; ctx.fillRect(x, y + 4, fw, 2);
  }
  // (cells: a notch every 8)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'; for (let cx = x + 8; cx < x + w; cx += 8) ctx.fillRect(cx, y, 1, 6);
};

/** Puddles lie on the floor under everyone; everything else flies over them. */
const drawProjectiles = (ctx: CanvasRenderingContext2D, state: GameState, layer: 'puddles' | 'flying') => {
  state.projectiles.forEach(p => {
    if ((layer === 'puddles') !== !!(p.isSludge && p.isLingering)) return;
    ctx.save();
    if (p.custom) customWeapon(p.custom)?.draw(ctx, p, state.frame);
    else if (p.isBoulder) drawBoulder(ctx, p, state.frame);
    else if (p.isShrapnel) drawRockChip(ctx, p, state.frame);
    else if (p.isSludge) {
      if (p.isLingering) { drawGooPuddle(ctx, state, p); if (p.overhang) drawGooOverhang(ctx, p, p.overhang, state.frame); }
      else { if (p.dripFrom !== undefined) drawGooString(ctx, p, p.dripFrom); drawSludgeBlob(ctx, p, state.frame); }
    }
    else if (p.isCocaine) drawCocaine(ctx, p, state.frame);
    else if (p.isMethBarrel) drawMethBarrel(ctx, p, state.frame);
    else if (p.isDart) drawDart(ctx, p);
    else if (p.isDarkness) drawDarkOrb(ctx, p, state.frame);
    else if (p.isPoop) drawPoopLog(ctx, p, state.frame);
    else if (isMagma(p)) drawMagma(ctx, p, state.frame);
    else if (p.isIce && p.owner === 'enemy') (p.width > 30 ? drawIceBlock : drawIceShard)(ctx, p, state.frame);
    else if (p.isOscarRocket) drawOscarRocket(ctx, p, state.frame);
    else if (p.isCigarette) drawFlyingCigarette(ctx, p, state.frame);
    else if (p.isOilRocket) drawOilRocket(ctx, p, state.frame);
    else if (p.isIce) drawIcePellet(ctx, p, state.frame);
    else if (p.thrown) drawThrown(ctx, p, state.frame);
    else if (p.sadBolt) drawSadBolt(ctx, p, state.frame);
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
  let stuck = 0, onLayer = 0, x1 = Infinity, x2 = -Infinity, y1 = Infinity, y2 = -Infinity;
  for (const p of state.particles) if (p.isStuck) {
    stuck++; if (layer?.baked.has(p)) onLayer++;
    if (p.alpha === undefined) { x1 = Math.min(x1, p.pos.x); x2 = Math.max(x2, p.pos.x); y1 = Math.min(y1, p.pos.y); y2 = Math.max(y2, p.pos.y); }
  }
  if (layer && onLayer === 0) { goreLayers.delete(state); layer = undefined; }
  if (!stuck) return null;
  // (gore stuck somewhere off the layer, the camera having moved on since it was made (Oscar's room is two screens
  // wide): it's made again, big enough for all of it, so none of it's left being drawn splat by splat every frame)
  const cam = state.camera;
  let x = Math.min(cam.x - 120, x1 - 300), y = Math.min(cam.y - 120, y1 - 120);
  let w = Math.max(cam.x + CANVAS_WIDTH + 120, x2 + 300) - x, h = Math.max(cam.y + CANVAS_HEIGHT + 120, y2 + 120) - y;
  // (too much for one: as much of it round the view as one can take; what's past that is drawn as it is. And it's
  // only made again for that once the view's left it, not every frame)
  const fits = w <= 4000 && h <= 2400;
  if (!fits) {
    const cx = cam.x + CANVAS_WIDTH / 2, cy = cam.y + CANVAS_HEIGHT / 2;
    if (w > 4000) { x = Math.max(x, Math.min(x + w - 4000, cx - 2000)); w = 4000; }
    if (h > 2400) { y = Math.max(y, Math.min(y + h - 2400, cy - 1200)); h = 2400; }
  }
  const outside = !!layer && (x1 < layer.x || x2 > layer.x + layer.w || y1 < layer.y || y2 > layer.y + layer.h);
  const viewOff = !!layer && (cam.x < layer.x || cam.x + CANVAS_WIDTH > layer.x + layer.w || cam.y < layer.y || cam.y + CANVAS_HEIGHT > layer.y + layer.h);
  if (layer && (fits ? outside : viewOff)) { goreLayers.delete(state); layer = undefined; }
  if (!layer) {
    const m = ctx.getTransform();
    // (and no bigger than it needs to be in memory: a big one's painted at the world's own scale)
    const k = w * h > 2600 * 1000 ? 1 : Math.max(1, Math.min(2, Math.hypot(m.a, m.b)));
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

const drawParticles = (ctx: CanvasRenderingContext2D, state: GameState) => {
  const { particles } = state;
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
};

/** The numbers that fly up off whatever's hit: off (the words that pop up, PSSST and OILED! and the like, still show). */
export const SHOW_DAMAGE_NUMBERS = false;
const drawDamageNumbers = (ctx: CanvasRenderingContext2D, state: GameState) => {
  state.damageNumbers.forEach(d => {
    if (d.isCallout) { drawCallout(ctx, d, state.camera); return; }
    if (!SHOW_DAMAGE_NUMBERS && !d.text) return;
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

/**
 * Barry's tell: what's about to be live lights up while he winds up, flickering faster and brighter as it comes. The
 * ground pound: the floor, the ceiling and the walls, in bands as deep as you'd have to be into them to get it. The
 * storm: the whole room but the column right under him, which stays dark (that's where to be).
 */
const drawBarryTell = (ctx: CanvasRenderingContext2D, state: GameState, boss: Enemy) => {
  const left = Math.round(state.camera.x), top = Math.round(state.camera.y);
  const k = Math.max(0, Math.min(1, 1 - (boss.stateTimer || 0) / 60));
  if (k <= 0) return;
  const on = Math.floor(state.frame / Math.max(2, Math.round(8 - k * 6))) % 2 === 0;
  const a = (on ? 0.35 : 0.18) * (0.3 + k * 0.7);
  ctx.save();
  ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
  ctx.translate(-left, -top);
  const ceil = 100, floor = GROUND_Y, L = ARENA_LEFT, R = ARENA_RIGHT;
  /** A live band: a pale charge over it, dithered at its inner edge, crackle dashes running along its middle. */
  const band = (x: number, y: number, w: number, h: number, along: 'x' | 'y') => {
    ctx.fillStyle = `rgba(0, 229, 255, ${a.toFixed(3)})`; ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = a; checker(ctx, x, y, w, h, 'rgba(224, 255, 255, 0.6)', state.frame & 1); ctx.globalAlpha = 1;
    ctx.fillStyle = `rgba(255, 255, 160, ${(on ? 0.9 : 0.5) * k})`;
    if (along === 'x') for (let dx = (state.frame * 6) % 24; dx < w; dx += 24) ctx.fillRect(x + dx, y + h / 2 - 1, 10, 2);
    else for (let dy = (state.frame * 6) % 24; dy < h; dy += 24) ctx.fillRect(x + w / 2 - 1, y + dy, 2, 10);
  };
  if (boss.jumpCount === 0) {
    const fy = POUND_ZONES.floorY, cy = POUND_ZONES.ceilingY, wall = POUND_ZONES.wall + 30;
    band(L, fy - 10, R - L, floor - fy + 10, 'x');
    band(L, ceil, R - L, cy - ceil, 'x');
    band(L, ceil, wall, floor - ceil, 'y');
    band(R - wall, ceil, wall, floor - ceil, 'y');
  } else {
    const [s1, s2] = stormSafe(boss);
    if (s1 > L) band(L, ceil, s1 - L, floor - ceil, 'y');
    if (s2 < R) band(s2, ceil, R - s2, floor - ceil, 'y');
    // (the safe column's edges, inked, so it reads)
    ctx.fillStyle = `rgba(15, 23, 42, ${(0.5 * k).toFixed(3)})`; ctx.fillRect(s1 - 2, ceil, 2, floor - ceil); ctx.fillRect(s2, ceil, 2, floor - ceil);
  }
  ctx.restore();
};

/** Blackout Barry dims the room while teleporting and flashes it when electrified. */
const drawBarryLighting = (ctx: CanvasRenderingContext2D, state: GameState, stageId: string | null) => {
  const { enemies } = state;
  // BLACKOUT OVERLAY for Blackout Barry
  const isBarryStage = stageId === 'Blackout Barry';
  const activeBarry = enemies.find(e => e.type === 'boss' && e.health > 0);

  // Only show darkness during the teleporting phase, never during attacks or preparation
  const shouldShowBlackout = isBarryStage && activeBarry && activeBarry.bossState === 'blackout_teleport';
  // The lights going down as he does (a bit dimmer each step of it, never back up; the blackout's on top of it)
  const dim = isBarryStage ? Math.floor(state.barryWreck.dim * 6) / 6 * 0.3 : 0;
  if (dim > 0) {
    ctx.save();
    ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
    ctx.fillStyle = `rgba(4, 3, 12, ${dim.toFixed(3)})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  }

  if (shouldShowBlackout) {
    ctx.save();
    ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
    // Subtle darkness so Barry's teleportation is mysterious without hiding the arena
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  } else if (isBarryStage && activeBarry) {
    if (activeBarry.bossState === 'telegraphing') drawBarryTell(ctx, state, activeBarry);
    else if (activeBarry.bossState === 'ground_pound' && (activeBarry.electrifiedTimer || 0) > 0) {
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

/**
 * The flamethrower's stream, as what it is: molten rock poured out of the nozzle in a wobbling ribbon, a glow round it,
 * the body of it orange, white-hot down the middle, thinning to its tip, with flecks of crust carried along it. Drawn
 * along the segments laid this frame (the sparks and globs come off them as particles, over it).
 */
const drawMoltenStream = (ctx: CanvasRenderingContext2D, state: GameState) => {
  const segs = state.flameSegments;
  if (!segs.length || !state.player.isFlaming) return;
  const newest = Math.max(...segs.map(s => s.life));
  const run = segs.filter(s => s.life === newest);
  if (run.length < 2) return;
  const f = state.frame;
  const pts = run.map((s, i) => {
    const wob = Math.sin(f * 0.45 + i * 0.9) * s.size * 0.1 * (1 + i * 0.05);
    return { x: s.x - s.dirY * wob, y: s.y + s.dirX * wob, w: s.size * (0.35 + 0.65 * s.density), alt: s.alt };
  });
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const pass = (color: string, widthK: number) => {
    ctx.strokeStyle = color;
    for (let i = 1; i < pts.length; i++) {
      ctx.lineWidth = Math.max(1, pts[i].w * widthK * (pts[i].alt ? 0.6 : 1));
      ctx.beginPath(); ctx.moveTo(pts[i - 1].x, pts[i - 1].y); ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke();
    }
  };
  pass('rgba(255, 106, 26, 0.28)', 1.25);
  pass('#C2260F', 0.72);
  pass('#F2541B', 0.58);
  pass('#FF8A1F', 0.42);
  pass('#FFC23D', 0.26);
  pass('#FFF1A8', 0.11);
  // (crust carried along it: dark flecks riding the flow, going out)
  for (let k = 0; k < 10; k++) {
    const t = ((f * 0.9 + k * 37) % 100) / 100, at = t * (pts.length - 1), i = Math.floor(at), u = at - i;
    const a = pts[i], b = pts[Math.min(pts.length - 1, i + 1)];
    const px = a.x + (b.x - a.x) * u, py = a.y + (b.y - a.y) * u + Math.sin(k * 2.1 + f * 0.2) * a.w * 0.18;
    ctx.fillStyle = k % 3 ? '#5A1A0C' : '#3A1208';
    ctx.fillRect(Math.round(px - 1.5), Math.round(py - 1), 3 + (k % 2), 2);
  }
  ctx.restore();
};
