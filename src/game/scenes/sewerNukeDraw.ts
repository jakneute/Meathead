// The sewer nuke easter egg (see sewerNuke.ts): the fireball filling the
// sewer, a whiteout, then the street above as a mushroom cloud bursts out of a
// manhole while the death message spells out what you did.

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants';
import { bandedGradient, steppedGlow } from '../render/pixelArt';
import { chunky } from '../render/fx/fireball';
import { GameState } from '../core/state';
import { SEWER_NUKE, sewerNukeFrame } from './sewerNuke';

type Ctx = CanvasRenderingContext2D;

/** Deterministic 0..1 noise, so the blast looks the same every frame it's drawn. */
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeOut = (v: number) => 1 - Math.pow(1 - clamp01(v), 3);

/**
 * Glowing balls of fire: white-hot cores through orange to smoky red, in hard bands, all of them band by band (so the
 * lobes run together into one boiling mass, not a stack of targets). Each ball [x, y, r, heat, how many bands in it goes]:
 * the lobes stop short of the white-hot middle, which is the core's alone. For painting inside `chunky`.
 */
const fireballs = (ctx: Ctx, balls: [number, number, number, number, number][]) => {
  const rings: [number, (heat: number) => string][] = [
    [1, () => 'rgba(60, 10, 0, 0.45)'],
    [0.85, () => 'rgb(160, 30, 0)'],
    [0.6, h => h > 0.2 ? '#FF7A00' : '#C2410C'],
    [0.3, h => h > 0.3 ? '#FFE066' : '#FF9F1C'],
    [0.12, h => h > 0.5 ? '#FFFFFF' : '#FFE9A0'],
  ];
  rings.forEach(([k, c], i) => { for (const [x, y, r, heat, n] of balls) {
    if (r <= 0 || i >= n) continue;
    ctx.fillStyle = c(heat); ctx.beginPath(); ctx.arc(x, y, r * k, 0, Math.PI * 2); ctx.fill();
  } });
};

// ---------------------------------------------------------------------------
// Inside the sewer (world space, drawn over the arena)
// ---------------------------------------------------------------------------

export const drawSewerNukeInside = (ctx: Ctx, state: GameState) => {
  const t = sewerNukeFrame(state.deathTimer);
  const n = state.sewerNuke;
  if (!n || t >= SEWER_NUKE.OUTSIDE) return;
  const grow = easeOut(t / 80);
  const r = 30 + 620 * grow;
  const heat = 1 - t / SEWER_NUKE.OUTSIDE;

  ctx.save();
  // Everything scorched in the glow
  ctx.fillStyle = `rgba(255, 110, 0, ${0.25 + 0.3 * grow})`;
  ctx.fillRect(state.camera.x - 50, -300, CANVAS_WIDTH + 100, 1200);

  // Shockwave racing ahead of the fire
  const shock = 40 + t * 14;
  ctx.strokeStyle = `rgba(255, 255, 255, ${clamp01(0.8 - t / 60)})`;
  ctx.lineWidth = 10;
  ctx.beginPath(); ctx.arc(n.x, n.y, shock, 0, Math.PI * 2); ctx.stroke();

  // Boards, sludge and chunks of Tommy blasted outward
  for (let i = 0; i < 46; i++) {
    const a = hash(i) * Math.PI * 2;
    const speed = 6 + hash(i + 50) * 14;
    const x = n.x + Math.cos(a) * speed * t;
    const y = n.y + Math.sin(a) * speed * t + 0.08 * t * t;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * (0.1 + hash(i + 9) * 0.3));
    ctx.fillStyle = i % 3 === 0 ? '#5B3A1A' : i % 3 === 1 ? '#39FF14' : '#1F2937';
    if (i % 3 === 0) ctx.fillRect(-12, -3, 24, 6);
    else { ctx.beginPath(); ctx.arc(0, 0, 3 + hash(i + 3) * 5, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }

  // The fireball: a boiling cluster of lobes around a white-hot core
  // (painted chunky in bands, then laid on bright over the lot)
  ctx.globalCompositeOperation = 'lighter';
  chunky(ctx, n.x - r * 1.35, n.y - r * 1.35, r * 2.7, r * 2.7, g => {
    const balls: [number, number, number, number, number][] = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + hash(i) * 0.4;
      const wobble = 0.75 + 0.25 * Math.sin(t * 0.15 + i * 1.7);
      const d = r * 0.55 * wobble;
      balls.push([n.x + Math.cos(a) * d, n.y + Math.sin(a) * d * 0.8, r * (0.35 + hash(i + 20) * 0.2), heat * 0.8, 4]);
    }
    balls.push([n.x, n.y, r * 0.7, heat, 5]);
    fireballs(g, balls);
  });
  ctx.restore();
};

/** Screen-space white flashes: the moment of ignition and the whiteout into the cut outside. */
export const drawSewerNukeFlash = (ctx: Ctx, state: GameState) => {
  const t = sewerNukeFrame(state.deathTimer);
  if (t >= SEWER_NUKE.OUTSIDE) return;
  const ignite = t < 4 ? 1 : clamp01(1 - (t - 4) / 22);
  const whiteout = clamp01((t - SEWER_NUKE.WHITEOUT) / (SEWER_NUKE.OUTSIDE - SEWER_NUKE.WHITEOUT - 10));
  const a = Math.max(ignite, whiteout);
  if (a <= 0) return;
  ctx.fillStyle = `rgba(255, 255, 250, ${a})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
};

// ---------------------------------------------------------------------------
// Outside, on the street above (screen space)
// ---------------------------------------------------------------------------

const STREET_Y = 440;
const MANHOLE_X = CANVAS_WIDTH / 2;
const MANHOLE_Y = 470;

/** Returns false until the cut outside, when it draws the whole frame. */
export const drawSewerNukeOutside = (ctx: Ctx, state: GameState): boolean => {
  const t = sewerNukeFrame(state.deathTimer);
  if (t < SEWER_NUKE.OUTSIDE) return false;
  const e = t - SEWER_NUKE.ERUPT;           // frames since it burst out (negative before)
  const glow = e < 0 ? 0 : clamp01(1 - e / 260) * 0.8 + 0.2;

  ctx.save();
  if (state.screenShakeTimer > 0) {
    const m = state.screenShakeMagnitude * 1.5;
    ctx.translate((hash(t) - 0.5) * m, (hash(t + 99) - 0.5) * m);
  }
  drawSky(ctx, t, glow);
  drawSkyline(ctx, e, glow);
  drawStreet(ctx, t, e, glow);
  if (e >= 0) drawMushroomCloud(ctx, e);
  drawManholeCover(ctx, t, e);
  ctx.restore();

  // Flash of the eruption, and the fade in from the whiteout
  const fadeIn = clamp01(1 - (t - SEWER_NUKE.OUTSIDE) / 16);
  const flash = e >= 0 ? clamp01(1 - e / 30) : 0;
  const white = Math.max(fadeIn, flash);
  if (white > 0) {
    ctx.fillStyle = `rgba(255, 255, 250, ${white})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
  if (t >= SEWER_NUKE.TEXT) drawSpelledMessage(ctx, state.deathString, Math.floor((t - SEWER_NUKE.TEXT) / SEWER_NUKE.TEXT_RATE));
  return true;
};

const drawSky = (ctx: Ctx, t: number, glow: number) => {
  ctx.fillStyle = '#0B1026'; ctx.fillRect(-20, -20, CANVAS_WIDTH + 40, STREET_Y + 20);
  bandedGradient(ctx, -20, 0, CANVAS_WIDTH + 40, STREET_Y, ['#0B1026', '#14142E', '#1E1836', '#2A1B3D'], 10);
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 60; i++) {
    ctx.globalAlpha = 0.3 + 0.7 * hash(i + 7) * (1 - glow);
    ctx.fillRect(hash(i) * CANVAS_WIDTH, hash(i + 1) * 300, 1.5, 1.5);
  }
  ctx.globalAlpha = 1;
  // The whole sky lit up orange by the blast
  if (glow > 0) {
    ctx.fillStyle = `rgba(120, 20, 0, ${(0.5 * glow).toFixed(3)})`; ctx.fillRect(-20, -20, CANVAS_WIDTH + 40, STREET_Y + 20);
    steppedGlow(ctx, MANHOLE_X, 250, 600, '#FF9628', 0.85 * glow, 0, 7);
  }
  void t;
};

const drawSkyline = (ctx: Ctx, e: number, glow: number) => {
  let x = -20;
  let i = 0;
  while (x < CANVAS_WIDTH + 20) {
    const w = 50 + hash(i + 30) * 60;
    const h = 90 + hash(i + 40) * 170;
    const top = STREET_Y - h;
    // Buildings nearest the blast get shoved and lit
    const near = 1 - Math.min(1, Math.abs(x + w / 2 - MANHOLE_X) / 420);
    ctx.fillStyle = '#111827';
    ctx.fillRect(x, top, w, h);
    if (glow > 0) {
      ctx.fillStyle = `rgba(255, 120, 30, ${0.45 * glow * (0.4 + near)})`;
      ctx.fillRect(x, top, w, h);
    }
    // Windows (blown out by the shockwave: they go dark as it passes)
    const shockX = e >= 0 ? e * 9 : -1;
    const blown = Math.abs(x + w / 2 - MANHOLE_X) < shockX;
    for (let wy = top + 10; wy < STREET_Y - 16; wy += 16) {
      for (let wx = x + 7; wx < x + w - 10; wx += 13) {
        const k = wx * 3.1 + wy * 7.7;
        if (hash(k) < 0.45) continue;
        ctx.fillStyle = blown ? (hash(k + 1) < 0.3 ? '#FF9F1C' : '#1F1F1F') : (hash(k + 2) < 0.7 ? '#FDE68A' : '#374151');
        ctx.fillRect(wx, wy, 6, 8);
      }
    }
    // Glass raining out of the blown windows
    if (blown && e < 140) {
      ctx.fillStyle = '#BFDBFE';
      for (let g = 0; g < 6; g++) {
        const gx = x + hash(i * 10 + g) * w + (x < MANHOLE_X ? -1 : 1) * e * 0.6;
        const gy = top + hash(i * 10 + g + 5) * h * 0.5 + e * e * 0.01;
        ctx.fillRect(gx, gy, 2, 3);
      }
    }
    x += w + 4;
    i++;
  }
};

const drawStreet = (ctx: Ctx, t: number, e: number, glow: number) => {
  // Sidewalk, road and lane markings
  ctx.fillStyle = '#4B5563';
  ctx.fillRect(-20, STREET_Y, CANVAS_WIDTH + 40, 12);
  ctx.fillStyle = '#1F2937';
  ctx.fillRect(-20, STREET_Y + 12, CANVAS_WIDTH + 40, CANVAS_HEIGHT - STREET_Y);
  ctx.fillStyle = '#FACC15';
  for (let x = -20; x < CANVAS_WIDTH + 20; x += 70) ctx.fillRect(x, 540, 36, 5);
  if (glow > 0) {
    ctx.fillStyle = `rgba(255, 110, 20, ${0.35 * glow})`;
    ctx.fillRect(-20, STREET_Y, CANVAS_WIDTH + 40, CANVAS_HEIGHT - STREET_Y);
  }
  // Street lamps
  for (const lx of [110, 690]) {
    ctx.fillStyle = '#374151';
    ctx.fillRect(lx - 3, STREET_Y - 110, 6, 110);
    ctx.fillRect(lx - 3, STREET_Y - 110, lx < MANHOLE_X ? 26 : -26, 5);
    ctx.fillStyle = e >= 0 ? '#4B5563' : '#FEF3C7';
    ctx.fillRect(lx + (lx < MANHOLE_X ? 18 : -26), STREET_Y - 106, 8, 6);
  }
  // Street sign
  ctx.fillStyle = '#6B7280';
  ctx.fillRect(236, STREET_Y - 70, 4, 70);
  ctx.fillStyle = '#166534';
  ctx.fillRect(196, STREET_Y - 82, 84, 18);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '8px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SEWER ST', 238, STREET_Y - 73);

  // The manhole (the cover is drawn separately)
  ctx.fillStyle = '#0A0A0A';
  ctx.beginPath(); ctx.ellipse(MANHOLE_X, MANHOLE_Y, 34, 9, 0, 0, Math.PI * 2); ctx.fill();
  if (e < 0) {
    // Sickly green light and steam leaking out of the rim before it blows
    const leak = clamp01((t - SEWER_NUKE.OUTSIDE) / 25);
    ctx.fillStyle = `rgba(57, 255, 20, ${0.5 * leak})`;
    ctx.beginPath(); ctx.ellipse(MANHOLE_X, MANHOLE_Y - 4, 40, 10, 0, Math.PI, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 6; i++) {
      const p = ((t * 2 + i * 13) % 40) / 40;
      ctx.fillStyle = `rgba(220, 255, 220, ${0.5 * (1 - p) * leak})`;
      ctx.beginPath(); ctx.arc(MANHOLE_X - 30 + i * 12, MANHOLE_Y - 8 - p * 50, 5 + p * 10, 0, Math.PI * 2); ctx.fill();
    }
  } else {
    // Base surge: a ring of dust and fire rolling out along the street
    const surge = easeOut(e / 120);
    const w = 40 + surge * 520;
    ctx.fillStyle = `rgba(120, 70, 40, ${0.85 - surge * 0.35})`;
    for (let i = 0; i < 18; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const d = (0.3 + 0.7 * hash(i + 60)) * w;
      ctx.beginPath();
      ctx.arc(MANHOLE_X + side * d, MANHOLE_Y - 10 - hash(i + 70) * 25, 16 + surge * 26 * hash(i + 80), 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

/** The manhole cover rattles, then rockets up spinning when it blows. */
const drawManholeCover = (ctx: Ctx, t: number, e: number) => {
  let x = MANHOLE_X, y = MANHOLE_Y - 3, spin = 0;
  if (e < 0) {
    y -= Math.abs(Math.sin(t * 1.3)) * 4 * clamp01((t - SEWER_NUKE.OUTSIDE) / 10);
  } else {
    y -= e * 22 - e * e * 0.05;
    x += e * 1.5;
    spin = e * 0.35;
    if (y < -60) return;
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, Math.abs(Math.cos(spin)) * 0.8 + 0.2);
  ctx.fillStyle = '#52525B';
  ctx.beginPath(); ctx.ellipse(0, 0, 32, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#27272A';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, 22, 6, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
};

/** The fire column bursts out of the manhole and billows up into a mushroom cloud. */
const drawMushroomCloud = (ctx: Ctx, e: number) => {
  const rise = easeOut(e / 170);
  const capY = MANHOLE_Y - 40 - rise * 250;
  const capRx = 40 + easeOut(e / 200) * 165;
  const capRy = capRx * 0.42;
  // Cooling: bright fire early, dark roiling smoke with a glowing underside later
  const cool = clamp01((e - 40) / 260);
  const mix = (a: number[], b: number[]) => a.map((v, i) => Math.round(v + (b[i] - v) * cool));
  const [r1, g1, b1] = mix([255, 190, 60], [110, 62, 40]);
  const [r2, g2, b2] = mix([255, 120, 20], [70, 40, 30]);

  // Stem: a column of churning puffs from the manhole up into the cap
  const stemW = 16 + rise * 34;
  for (let i = 0; i < 14; i++) {
    const f = i / 13;
    const y = MANHOLE_Y - 10 + (capY - MANHOLE_Y + 10) * f;
    const wob = Math.sin(e * 0.12 + i * 1.3) * 4;
    const r = stemW * (1 - f * 0.35) * (0.8 + 0.3 * hash(i + 100));
    ctx.fillStyle = `rgb(${r2}, ${g2}, ${b2})`;
    ctx.beginPath(); ctx.arc(MANHOLE_X + wob, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255, 200, 80, ${0.6 * (1 - cool * 0.7)})`;
    ctx.beginPath(); ctx.arc(MANHOLE_X + wob, y, r * 0.45, 0, Math.PI * 2); ctx.fill();
  }
  // Condensation ring around the stem
  if (e > 50) {
    const ringY = capY + (MANHOLE_Y - capY) * 0.45;
    ctx.strokeStyle = `rgba(230, 230, 230, ${clamp01((e - 50) / 60) * 0.55})`;
    ctx.lineWidth = 7;
    ctx.beginPath(); ctx.ellipse(MANHOLE_X, ringY, stemW * 2.6, stemW * 0.5, 0, 0, Math.PI * 2); ctx.stroke();
  }
  // Cap: a roiling torus of puffs, tumbling over itself
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2 + e * 0.02;
      const back = Math.sin(a) < 0;
      if ((pass === 0) !== back) continue;
      const px = MANHOLE_X + Math.cos(a) * capRx * 0.75;
      const py = capY + Math.sin(a) * capRy * 0.5 - (back ? capRy * 0.25 : 0);
      const pr = capRy * (0.55 + 0.25 * hash(i + 200)) * (1 + 0.08 * Math.sin(e * 0.1 + i));
      const lit = back ? 0.75 : 1;
      ctx.fillStyle = `rgb(${Math.round(r1 * lit)}, ${Math.round(g1 * lit)}, ${Math.round(b1 * lit)})`;
      ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
      // Hot glow on the underside
      ctx.fillStyle = `rgba(255, 150, 40, ${0.45 * (1 - cool * 0.5)})`;
      ctx.beginPath(); ctx.arc(px, py + pr * 0.35, pr * 0.55, 0, Math.PI * 2); ctx.fill();
    }
    if (pass === 0) {
      // The crown bulging up out of the middle
      ctx.fillStyle = `rgb(${r1}, ${g1}, ${b1})`;
      ctx.beginPath(); ctx.ellipse(MANHOLE_X, capY - capRy * 0.35, capRx * 0.6, capRy * 0.85, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255, 240, 180, ${0.7 * (1 - cool)})`;
      ctx.beginPath(); ctx.ellipse(MANHOLE_X, capY - capRy * 0.2, capRx * 0.3, capRy * 0.45, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
};

/** The death message, typed out a letter at a time over a dark band at the bottom. */
export const drawSpelledMessage = (ctx: Ctx, message: string, letters: number) => {
  ctx.save();
  const size = 17;
  ctx.font = `bold ${size}px "Press Start 2P"`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  // Wrap the full message first so words don't jump lines as they're typed
  const maxW = CANVAS_WIDTH - 70;
  const lines: string[] = [];
  let cur = '';
  for (const para of message.split('\n')) {
    for (const w of para.split(' ')) {
      const test = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test;
    }
    lines.push(cur);
    cur = '';
  }
  const lineH = size * 1.7;
  const top = CANVAS_HEIGHT - 28 - lines.length * lineH;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
  ctx.fillRect(0, top - 14, CANVAS_WIDTH, CANVAS_HEIGHT - top + 14);
  ctx.fillStyle = '#FF1A1A';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  let left = letters;
  lines.forEach((line, i) => {
    if (left <= 0) return;
    const shown = line.slice(0, left);
    left -= line.length + 1;
    const x = (CANVAS_WIDTH - ctx.measureText(line).width) / 2;
    const y = top + lineH * (i + 0.5);
    ctx.strokeText(shown, x, y);
    ctx.fillText(shown, x, y);
  });
  ctx.restore();
};
