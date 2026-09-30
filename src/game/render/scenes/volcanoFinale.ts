// Victor's corked-volcano easter egg (see game/scenes/volcanoFinale.ts): the volcano
// from outside rumbling then blowing, the magma wave in the arena, and the
// final launch with the death message.

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';
import { GameState, createGameState, createPlayer } from '../../core/state';
import { Player } from '../../../types';
import { createFullAmmo } from '../../../constants';
import { drawPlayer } from '../player/player';
import { eyesAt } from '../player/spriteOutline';
import { drawBoss, makeSitter } from '../bosses';
import { inHead } from '../bosses/kit';
import { VOLCANO_FINALE, VOLCANO_FINALE_MESSAGE } from '../../scenes/volcanoFinale';
import { drawSpelledMessage } from './sewerNuke';
import { drawClubVolcano } from './clubVolcano';

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

  const lt = t - VOLCANO_FINALE.OUTSIDE;          // into the launch
  const hits = outside2 ? Math.min(2, Math.floor(lt / VOLCANO_FINALE.FLY)) : 0; // bodies that have hit the screen
  const sinceHit = outside2 && hits > 0 ? lt - hits * VOLCANO_FINALE.FLY : 999;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  // Each impact jolts the "camera"; the second knocks it askew for good
  const shake = outside1 ? (t < VOLCANO_FINALE.ERUPT ? 1 + t / 20 : 8) : 6 + (sinceHit < 12 ? (12 - sinceHit) * 2 : 0);
  ctx.translate((hash(t) - 0.5) * shake * 2, (hash(t + 50) - 0.5) * shake * 2);
  if (hits >= 2) {
    const tilt = Math.min(1, sinceHit / 8) * -0.075;
    ctx.translate(CX, H / 2); ctx.rotate(tilt); ctx.scale(1.12, 1.12); ctx.translate(-CX, -H / 2);
  }
  const erupting = outside2 || t >= VOLCANO_FINALE.ERUPT;
  const e = outside2 ? t - VOLCANO_FINALE.OUTSIDE + 70 : t - VOLCANO_FINALE.ERUPT; // frames since it blew
  drawScene(ctx, t, erupting, e);
  if (outside2) drawLaunch(ctx, lt);
  ctx.restore();

  // The bodies smash into the screen itself: the glass cracks (on the screen, so it doesn't tilt with the camera)
  if (hits >= 1) drawCracks(ctx, IMPACTS[0].x, IMPACTS[0].y, 11, 260);
  if (hits >= 2) { drawCracks(ctx, IMPACTS[1].x, IMPACTS[1].y, 29, 380); drawCracks(ctx, IMPACTS[1].x - 90, IMPACTS[1].y + 60, 47, 140); }

  // A white flash as it blows, on each cut, and on each impact
  const flash = outside1
    ? (t >= VOLCANO_FINALE.ERUPT ? clamp01(1 - (t - VOLCANO_FINALE.ERUPT) / 20) : 0)
    : Math.max(clamp01(1 - lt / 15), sinceHit < 8 ? 0.8 * (1 - sinceHit / 8) : 0);
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
  // The club it is: lit up and pumping while it rumbles; when it blows, the power flickers and goes
  const power = erupting ? (e < 30 && hash(e) > 0.4 ? 1 - e / 30 : 0) : 1;
  drawClubVolcano(ctx, { cx: CX, top: PEAK_Y, base: BASE_Y, half: 420, crater: 40, s: 0.96, f: t, show: 1, power });
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

/**
 * Their charred bodies come flying out of the crater straight at the screen,
 * one after the other (Turtles in Time's "thrown at the screen"), spinning and
 * growing until each one fills it.
 */
/** Where each body smashes into the screen (Meathead left, Victor right). */
const IMPACTS = [{ x: CX - 170, y: 230 }, { x: CX + 150, y: 300 }];

const drawLaunch = (ctx: Ctx, lt: number) => {
  const who = Math.floor(lt / VOLCANO_FINALE.FLY);
  if (who > 1) return;
  const k = (lt % VOLCANO_FINALE.FLY) / VOLCANO_FINALE.FLY; // 0 at the crater .. 1 filling the screen
  const scale = 0.12 * Math.pow(200, k);                    // tiny, then rushing at you
  // Up out of the crater in an arc, then swerving straight at its impact point on the screen
  const hit = IMPACTS[who];
  const arcX = CX + (who === 0 ? -1 : 1) * 60 * Math.sin(k * Math.PI);
  const arcY = PEAK_Y - 30 - Math.sin(k * Math.PI * 0.9) * 90;
  const x = arcX + (hit.x - arcX) * k * k;
  const y = arcY + (hit.y - arcY) * k * k;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lt * 0.16 * (who === 0 ? 1 : -1));
  ctx.scale(scale, scale);
  // Smoke pouring off the body
  for (let i = 0; i < 5; i++) {
    const s = ((lt * 2 + i * 9) % 30) / 30;
    ctx.fillStyle = `rgba(50, 45, 45, ${0.5 * (1 - s)})`;
    ctx.beginPath(); ctx.arc(Math.sin(i * 2.1) * 10, -30 - s * 25, 6 + s * 10, 0, Math.PI * 2); ctx.fill();
  }
  if (who === 0) drawCharredMeathead(ctx, lt); else drawCharredVictor(ctx, lt);
  ctx.restore();
};

/**
 * Cracked screen glass around an impact point: jagged rays shooting out, rings
 * of cracks joining them, and a crushed white spot where it hit.
 */
const drawCracks = (ctx: Ctx, cx: number, cy: number, seed: number, size: number) => {
  const rays = 11;
  const pts: { x: number; y: number }[][] = [];
  for (let i = 0; i < rays; i++) {
    const a0 = (i / rays) * Math.PI * 2 + (hash(seed + i) - 0.5) * 0.5;
    const len = size * (0.45 + hash(seed + i * 3) * 0.55);
    const ray = [{ x: cx, y: cy }];
    let a = a0, r = 0;
    while (r < len) {
      r += 18 + hash(seed + i * 7 + r) * 30;
      a += (hash(seed + i + r * 0.1) - 0.5) * 0.35;
      ray.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
    }
    pts.push(ray);
  }
  const stroke = (draw: () => void) => {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)'; ctx.lineWidth = 3; ctx.save(); ctx.translate(1, 1); draw(); ctx.restore();
    ctx.strokeStyle = 'rgba(245, 250, 255, 0.9)'; ctx.lineWidth = 1.5; draw();
  };
  ctx.save();
  ctx.lineJoin = 'round';
  stroke(() => {
    ctx.beginPath();
    for (const ray of pts) { ctx.moveTo(ray[0].x, ray[0].y); for (const p of ray) ctx.lineTo(p.x, p.y); }
    // Rings of cracks between neighbouring rays
    for (const ring of [2, 4, 6]) {
      for (let i = 0; i < rays; i++) {
        const a = pts[i][ring], b = pts[(i + 1) % rays][ring];
        if (a && b && hash(seed + ring * 13 + i) > 0.25) { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
      }
    }
    ctx.stroke();
  });
  // Crushed glass at the point of impact
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  for (let i = 0; i < 14; i++) {
    const a = hash(seed + i * 5) * Math.PI * 2, r = hash(seed + i * 9) * 18;
    ctx.fillRect(cx + Math.cos(a) * r - 1, cy + Math.sin(a) * r - 1, 3, 3);
  }
  ctx.restore();
};

/** Glowing cracks and embers on a burnt silhouette. */
const embers = (ctx: Ctx, lt: number, spots: [number, number][]) => {
  ctx.fillStyle = lt % 8 < 4 ? '#FF6D00' : '#FFB020';
  for (const [x, y] of spots) ctx.fillRect(x, y, 3, 2);
};

/**
 * Meathead, burnt to a crisp: his own sprite, flailing, burnt near black, with big white cartoon eyes and embers
 * glowing on him.
 */
let crisp: { p: Player; state: GameState } | null = null;
const drawCharredMeathead = (ctx: Ctx, lt: number) => {
  if (!crisp) {
    const ammo = createFullAmmo();
    crisp = { p: createPlayer(ammo), state: createGameState(null, ammo) };
  }
  const { p, state } = crisp;
  p.sootTimer = 0; p.pushbackTimer = 10; p.health = 35; p.hidden = false;
  p.isGrounded = false; p.vel = { x: 0, y: 3 };
  p.pos = { x: -p.width / 2, y: 24 - p.height };
  state.playerAnimFrame = lt;
  ctx.save();
  ctx.filter = 'brightness(0.22) sepia(0.5) contrast(1.3)';
  drawPlayer(ctx, p, state, { currentWeapon: 'GUN', showFilthShield: false, invincibilityEnabled: false });
  ctx.restore();
  // Big white cartoon eyes where his are
  const eyes = eyesAt(0, 24);
  if (eyes) {
    ctx.save(); ctx.translate(eyes.x, eyes.y); ctx.rotate(eyes.angle);
    for (const [x, px] of [[-4.5, -0.8], [4.5, 1]] as const) {
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(x, 0, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(x + px, 0.4, 1.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  embers(ctx, lt, [[-8, -10], [5, -4], [-15, -8], [14, -12], [-6, 12], [4, 16]]);
};

/**
 * Victor, charred: his own sprite (man bun, sweatband, the open shirt, the chest, the pendant, the foil round his
 * wrists) burnt near black, flung spread-eagle, with big white cartoon eyes and embers glowing in the cracks.
 */
const victorSitter = makeSitter('Victor Volcano');
const drawCharredVictor = (ctx: Ctx, lt: number) => {
  const e = { ...victorSitter, health: 0, facing: 1 as const, bossState: 'jumping' as const };
  ctx.save();
  ctx.translate(-32, -46);
  ctx.scale(0.8, 0.8);
  ctx.filter = 'brightness(0.22) sepia(0.5) contrast(1.3)';
  drawBoss(ctx, e, 'Victor Volcano', 0);
  ctx.filter = 'none';
  // Big white cartoon eyes on his head, looking two ways at once
  inHead(ctx, { x: 40, y: 19, s: 1.35, f: 1 }, () => {
    for (const [x, px] of [[-5, -1], [4.5, 1.2]] as const) {
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(x, -3.5, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(x + px, -3.2, 1.1, 0, Math.PI * 2); ctx.fill();
    }
    // Mouth hanging open, a wisp of smoke coming out
    ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.ellipse(0.5, 6, 2.6, 2, 0, 0, Math.PI * 2); ctx.fill();
  });
  // The lava cracks still glowing across his chest, and the pendant
  ctx.strokeStyle = lt % 8 < 4 ? '#FF6D00' : '#FFB020'; ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.moveTo(24, 38); ctx.lineTo(28, 41); ctx.lineTo(27, 44); ctx.moveTo(56, 38); ctx.lineTo(52, 41); ctx.lineTo(53, 44); ctx.stroke();
  ctx.fillStyle = '#FF8A00'; ctx.fillRect(38.5, 42, 3, 5);
  ctx.restore();
  embers(ctx, lt, [[-10, -8], [8, -2], [-22, -14], [20, -12], [-6, 14], [5, 10], [-8, -40], [6, -38]]);
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
