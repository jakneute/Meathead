// Victor's corked-volcano easter egg (see game/volcanoFinale.ts): the volcano
// from outside rumbling then blowing, the magma wave in the arena, and the
// final launch with the death message.

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants';
import { GameState } from '../state';
import { VOLCANO_FINALE, VOLCANO_FINALE_MESSAGE } from '../volcanoFinale';
import { drawSpelledMessage } from './sewerNuke';

type Ctx = CanvasRenderingContext2D;
const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
const CX = W / 2, PEAK_Y = 250, BASE_Y = 520;

const hash = (n: number) => { const x = Math.sin(n * 91.3 + 7.7) * 43758.5453; return x - Math.floor(x); };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Returns true when it has drawn the whole frame (the outside shots). */
export const drawVolcanoFinaleOutside = (ctx: Ctx, state: GameState): boolean => {
  const f = state.volcanoFinale;
  if (!f) return false;
  const t = f.t;
  const outside1 = t < VOLCANO_FINALE.INSIDE;
  const outside2 = t >= VOLCANO_FINALE.OUTSIDE;
  if (!outside1 && !outside2) return false;

  ctx.save();
  const shake = outside1 ? (t < VOLCANO_FINALE.ERUPT ? 1 + t / 20 : 8) : 6;
  ctx.translate((hash(t) - 0.5) * shake * 2, (hash(t + 50) - 0.5) * shake * 2);
  const erupting = outside2 || t >= VOLCANO_FINALE.ERUPT;
  const e = outside2 ? t - VOLCANO_FINALE.OUTSIDE + 70 : t - VOLCANO_FINALE.ERUPT; // frames since it blew
  drawScene(ctx, t, erupting, e);
  if (outside2) drawLaunch(ctx, t - VOLCANO_FINALE.OUTSIDE);
  ctx.restore();

  // A white flash as it blows, and on each cut
  const flash = outside1 ? (t >= VOLCANO_FINALE.ERUPT ? clamp01(1 - (t - VOLCANO_FINALE.ERUPT) / 20) : 0) : clamp01(1 - (t - VOLCANO_FINALE.OUTSIDE) / 15);
  if (flash > 0) { ctx.fillStyle = `rgba(255, 250, 235, ${flash})`; ctx.fillRect(0, 0, W, H); }
  if (outside2 && t >= VOLCANO_FINALE.TEXT) drawSpelledMessage(ctx, VOLCANO_FINALE_MESSAGE, Math.floor((t - VOLCANO_FINALE.TEXT) / VOLCANO_FINALE.TEXT_RATE));
  return true;
};

/** Hilo at dusk: the volcano over the ocean, rumbling or erupting. */
const drawScene = (ctx: Ctx, t: number, erupting: boolean, e: number) => {
  // Sky, darkening and glowing red once it blows
  const sky = ctx.createLinearGradient(0, 0, 0, BASE_Y);
  sky.addColorStop(0, erupting ? '#1A0505' : '#1E0B1E');
  sky.addColorStop(0.6, erupting ? '#7A1A0A' : '#6B2A3A');
  sky.addColorStop(1, erupting ? '#E0661A' : '#D9794A');
  ctx.fillStyle = sky;
  ctx.fillRect(-20, -20, W + 40, BASE_Y + 20);
  // Ocean with glittering light
  ctx.fillStyle = '#1B2A40';
  ctx.fillRect(-20, BASE_Y, W + 40, H - BASE_Y + 20);
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = erupting ? '#FF8A3D' : '#F2B880';
    ctx.fillRect(hash(i) * W, BASE_Y + 6 + hash(i + 9) * 70, 6 + hash(i + 3) * 10, 2);
  }

  // Ash plume billowing up out of the crater once it's erupted
  if (erupting) {
    const grow = clamp01(e / 120);
    for (let i = 0; i < 26; i++) {
      const k = i / 26;
      const y = PEAK_Y - 20 - k * (230 * grow + 40);
      const r = (30 + k * 80) * (0.5 + grow * 0.5);
      ctx.fillStyle = `rgba(${40 + i * 2}, ${30 + i}, ${28 + i}, 0.9)`;
      ctx.beginPath(); ctx.arc(CX + Math.sin(i * 1.7 + e * 0.03) * 30 * k, y, r, 0, Math.PI * 2); ctx.fill();
    }
    // Lava lit from below
    const glow = ctx.createRadialGradient(CX, PEAK_Y, 10, CX, PEAK_Y, 260);
    glow.addColorStop(0, 'rgba(255, 150, 40, 0.55)');
    glow.addColorStop(1, 'rgba(255, 60, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(CX - 260, PEAK_Y - 260, 520, 520);
  } else {
    // Rumbling: smoke puffing from the crater, harder and faster as it builds
    for (let i = 0; i < 8; i++) {
      const s = ((t * (1 + t / 60) + i * 13) % 60) / 60;
      ctx.fillStyle = `rgba(60, 45, 45, ${0.6 * (1 - s)})`;
      ctx.beginPath(); ctx.arc(CX + Math.sin(i * 2 + s * 4) * 20, PEAK_Y - 10 - s * 90, 12 + s * 24, 0, Math.PI * 2); ctx.fill();
    }
  }

  // The volcano
  ctx.fillStyle = '#2A0E08';
  ctx.beginPath();
  ctx.moveTo(CX - 420, BASE_Y); ctx.lineTo(CX - 70, PEAK_Y + 8); ctx.lineTo(CX - 40, PEAK_Y);
  ctx.lineTo(CX + 40, PEAK_Y); ctx.lineTo(CX + 70, PEAK_Y + 8); ctx.lineTo(CX + 420, BASE_Y);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3D160C';
  ctx.beginPath(); ctx.moveTo(CX - 420, BASE_Y); ctx.lineTo(CX - 70, PEAK_Y + 8); ctx.lineTo(CX - 40, PEAK_Y); ctx.lineTo(CX - 20, BASE_Y); ctx.closePath(); ctx.fill();
  // Three glowing plugged vents on its flank (the ones you corked), cracking as it builds
  const build = erupting ? 1 : t / VOLCANO_FINALE.ERUPT;
  for (const [vx, vy] of [[-150, 430], [130, 400], [20, 470]]) {
    ctx.fillStyle = erupting ? '#FFB020' : `rgba(255, ${100 + build * 100}, 20, ${0.4 + build * 0.6})`;
    ctx.beginPath(); ctx.arc(CX + vx, vy, 6 + build * 6, 0, Math.PI * 2); ctx.fill();
  }
  // Lava pouring down the flanks
  const pour = erupting ? clamp01(e / 90) : 0;
  ctx.strokeStyle = '#FF7A1A'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    if (pour <= 0) break;
    const x0 = CX - 30 + i * 15, side = i < 2 ? -1 : i > 2 ? 1 : 0.2;
    ctx.beginPath(); ctx.moveTo(x0, PEAK_Y + 4);
    ctx.lineTo(x0 + side * 260 * pour, PEAK_Y + 4 + (BASE_Y - PEAK_Y) * pour); ctx.stroke();
  }
  // Palms on the shore
  ctx.fillStyle = '#0D0303';
  for (const px of [60, 140, 660, 740]) {
    ctx.fillRect(px, BASE_Y - 70, 5, 70);
    for (let fr = 0; fr < 5; fr++) { ctx.save(); ctx.translate(px + 2, BASE_Y - 70); ctx.rotate(-Math.PI / 2 + (fr - 2) * 0.55); ctx.fillRect(0, -2, 34, 4); ctx.restore(); }
  }

  // The eruption: a fountain of lava and flying bombs
  if (erupting) {
    const h = 120 + Math.sin(e * 0.3) * 20 + clamp01(e / 30) * 120;
    ctx.fillStyle = '#FF6D00';
    ctx.beginPath(); ctx.moveTo(CX - 36, PEAK_Y); ctx.quadraticCurveTo(CX - 10, PEAK_Y - h * 0.7, CX, PEAK_Y - h); ctx.quadraticCurveTo(CX + 10, PEAK_Y - h * 0.7, CX + 36, PEAK_Y); ctx.fill();
    ctx.fillStyle = '#FFD600';
    ctx.beginPath(); ctx.moveTo(CX - 16, PEAK_Y); ctx.quadraticCurveTo(CX, PEAK_Y - h * 0.6, CX + 16, PEAK_Y); ctx.fill();
    for (let i = 0; i < 16; i++) {
      const period = 50 + (i % 5) * 9;
      const s = ((e + i * 13) % period) / period;
      const vx = (hash(i) - 0.5) * 12, vy = -9 - hash(i + 4) * 6;
      const x = CX + vx * s * period, y = PEAK_Y + vy * s * period + 0.2 * (s * period) ** 2;
      ctx.fillStyle = s < 0.5 ? '#FFE082' : '#FF6D00';
      ctx.fillRect(x - 3, y - 3, 7, 7);
    }
  }
};

/** Meathead and Victor, flung out of the crater and away into the sky. */
const drawLaunch = (ctx: Ctx, lt: number) => {
  const figures = [
    { dx: -1, skin: '#E0AC69', pants: '#1E3A8A' },  // Meathead
    { dx: 1, skin: '#B71C1C', pants: '#3E2723' },   // Victor
  ];
  figures.forEach((fg, i) => {
    const s = lt / 90;
    const x = CX + fg.dx * (30 + s * 70 + i * 10);
    const y = PEAK_Y - 40 - s * 120 + s * s * 4;
    if (y < -40) return;
    const scale = Math.max(0.3, 1 - s * 0.12);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(lt * 0.25 * fg.dx);
    ctx.scale(scale, scale);
    ctx.fillStyle = fg.skin; ctx.fillRect(-6, -14, 12, 14); ctx.fillRect(-5, -24, 10, 9);
    ctx.fillStyle = fg.pants; ctx.fillRect(-6, 0, 5, 12); ctx.fillRect(1, 0, 5, 12);
    ctx.fillStyle = fg.skin; ctx.fillRect(-14, -12, 8, 4); ctx.fillRect(6, -12, 8, 4);
    // On fire
    ctx.fillStyle = lt % 6 < 3 ? '#FF6D00' : '#FFD600';
    ctx.fillRect(-4, -30, 8, 6);
    ctx.restore();
  });
  // ...and when they're gone, a little twinkle where they vanished
  if (lt > 150 && lt < 190) {
    const tw = (lt - 150) / 40;
    ctx.fillStyle = `rgba(255, 255, 255, ${1 - tw})`;
    const r = 4 + tw * 14;
    ctx.fillRect(CX - 1, 30 - r, 3, r * 2); ctx.fillRect(CX - r, 30 - 1, r * 2, 3);
  }
};

/** Inside the arena: the room glows and shakes, then the magma wave surges up from below. */
export const drawVolcanoFinaleInside = (ctx: Ctx, state: GameState) => {
  const f = state.volcanoFinale;
  if (!f || f.t < VOLCANO_FINALE.INSIDE || f.t >= VOLCANO_FINALE.OUTSIDE) return;
  const camX = state.camera.x, camY = state.camera.y;
  ctx.fillStyle = `rgba(255, 80, 0, ${0.12 + 0.08 * Math.sin(f.t * 0.4)})`;
  ctx.fillRect(camX, camY, W, H);
  if (f.t < VOLCANO_FINALE.WAVE) return;
  const top = camY + f.waveY;
  const g = ctx.createLinearGradient(0, top, 0, top + 200);
  g.addColorStop(0, '#FFF3B0'); g.addColorStop(0.08, '#FFB020'); g.addColorStop(0.4, '#FF5A00'); g.addColorStop(1, '#8A1B05');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(camX - 20, camY + H + 20);
  for (let x = -20; x <= W + 20; x += 20) ctx.lineTo(camX + x, top + Math.sin(x * 0.05 + f.t * 0.5) * 14);
  ctx.lineTo(camX + W + 20, camY + H + 20);
  ctx.closePath(); ctx.fill();
  // Spray thrown up off the crest
  for (let i = 0; i < 30; i++) {
    const s = ((f.t * 3 + i * 17) % 40) / 40;
    ctx.fillStyle = s < 0.5 ? '#FFE082' : '#FF6D00';
    ctx.fillRect(camX + hash(i) * W, top - s * 90, 6, 6);
  }
};
