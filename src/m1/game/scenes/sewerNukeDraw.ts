// The sewer nuke easter egg (see sewerNuke.ts): the fireball filling the
// sewer, a whiteout, then the street above as a mushroom cloud bursts out of a
// manhole while the death message spells out what you did.
//
// Painted the way the rest of the game is: at half resolution and blown up
// chunky, every fire and smoke tone a step along a ramp, dither along each seam,
// billows lit on top and shadowed (or fire-lit) underneath. Flashes come and go
// in steps, never a smooth fade.

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants';
import { bandedGradient, checker, hazeBands, steppedGlow, pixelBlob } from '../render/pixelArt';
import { chunky, ditherFill } from '../render/fx/fireball';
import { mix } from '../render/backdrops/core';
import { GameState } from '../core/state';
import { SEWER_NUKE, sewerNukeFrame } from './sewerNuke';
import { shakeScale, flashAlpha } from '../settings';

type Ctx = CanvasRenderingContext2D;
const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;

/** Deterministic 0..1 noise, so the blast looks the same every frame it's drawn. */
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeOut = (v: number) => 1 - Math.pow(1 - clamp01(v), 3);
/** A value held to `n` steps (so a fade or a cooling goes in jumps, the way a palette swap does). */
const step = (v: number, n: number) => Math.round(clamp01(v) * n) / n;
/** Snapped to the chunky pixel grid. */
const snap = (v: number) => Math.round(v / 2) * 2;

/** Fire, darkest to white-hot. */
const FIRE = ['#2A0806', '#5C1408', '#8F1D0B', '#C2380C', '#EA6A0C', '#F59E0B', '#FCD34D', '#FEF3C7', '#FFFFFF'];
/** Smoke as it cools: soot to the lit tops. */
const SMOKE = ['#120C0B', '#251A17', '#3B2B24', '#574034', '#77594A', '#9C7C64'];
/** Dust and grit off the street. */
const DUST = ['#1E1714', '#352A23', '#53433A', '#756152', '#9A836F'];

const disk = (g: Ctx, x: number, y: number, r: number) => { if (r > 0.5) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); } };

interface Puff { x: number; y: number; r: number }
/** A billow's tones: its shadow, an underglow (fire-lit from below, or none), its body, its lit side, a highlight. */
interface Tones { shadow: string; glow?: string; body: string; lit: string; hi: string }

/**
 * Billows: the shadow of the lot first (so they run together into one mass, not a stack of balls), the fire's glow
 * catching their undersides; then each in turn from the top down, its body sat up and left of its shadow and its lit
 * cap on that, so each one lower down rolls up over the one above it and only the tops of them catch the light. A row
 * of dither round each step where it meets the one under. For painting inside `chunky`.
 */
const billows = (g: Ctx, puffs: Puff[], t: Tones) => {
  g.fillStyle = t.shadow; for (const p of puffs) disk(g, p.x, p.y, p.r);
  if (t.glow) { g.fillStyle = t.glow; for (const p of puffs) disk(g, p.x + p.r * 0.04, p.y + p.r * 0.16, p.r * 0.78); }
  const order = [...puffs].sort((a, b) => a.y - b.y);
  const bodyD = ditherFill(g, t.body), litD = ditherFill(g, t.lit);
  for (const p of order) {
    const bx = p.x - p.r * 0.06, by = p.y - p.r * 0.14, br = p.r * 0.84;
    g.fillStyle = bodyD; disk(g, bx, by, br + 3);
    g.fillStyle = t.body; disk(g, bx, by, br);
    g.save(); g.beginPath(); g.arc(bx, by, br, 0, Math.PI * 2); g.clip();
    g.fillStyle = litD; disk(g, bx - br * 0.18, by - br * 0.42, br * 0.78 + 3);
    g.fillStyle = t.lit; disk(g, bx - br * 0.18, by - br * 0.42, br * 0.78);
    g.fillStyle = t.hi; disk(g, bx - br * 0.3, by - br * 0.72, br * 0.4);
    g.restore();
  }
};

/** The tones of the cloud `cool` of the way from fire to smoke (in steps), its underside still lit by `under` of fire. */
const cloudTones = (cool: number, under: number, hot = 0): Tones => {
  const c = step(cool, 8);
  const f = (i: number) => FIRE[Math.max(0, Math.min(FIRE.length - 1, i + hot))];
  return {
    shadow: mix(f(2), SMOKE[0], c),
    glow: under > 0 ? mix(SMOKE[2], f(5), step(under, 5)) : undefined,
    body: mix(f(4), SMOKE[2], c),
    lit: mix(f(6), SMOKE[3], c),
    hi: mix(f(7), SMOKE[5], c),
  };
};

// ---------------------------------------------------------------------------
// Inside the sewer (world space, drawn over the arena)
// ---------------------------------------------------------------------------

/**
 * The fireball: lobes boiling round a white-hot core, ring on ring down the fire ramp to a skin of smoke round the
 * outside that thickens as it goes; every ring dithered into the one outside it.
 */
const fireball = (g: Ctx, x: number, y: number, r: number, t: number) => {
  const cool = step(t / SEWER_NUKE.OUTSIDE, 6);
  const lobes: [number, number, number][] = [], inner: [number, number, number][] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + hash(i) * 0.4 + t * 0.004 * (i % 2 ? 1 : -1);
    const d = r * 0.56 * (0.78 + 0.22 * Math.sin(t * 0.15 + i * 1.7));
    lobes.push([x + Math.cos(a) * d, y + Math.sin(a) * d * 0.82, r * (0.34 + hash(i + 20) * 0.2)]);
  }
  lobes.push([x, y, r * 0.72]);
  // (the heart of it boiling too: a few lobes round the middle, so the white-hot isn't a plain disc)
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + t * 0.03;
    inner.push([x + Math.cos(a) * r * 0.16, y + Math.sin(a) * r * 0.13, r * (0.5 + 0.12 * Math.sin(t * 0.2 + i * 2.1))]);
  }
  inner.push([x, y, r * 0.72]);
  // (out to in: smoke, then the fire hotter and hotter; the white goes out of the middle as it cools)
  const rings: [number, string][] = [
    [1, mix('#5C1408', SMOKE[1], cool)], [0.88, mix(FIRE[2], SMOKE[2], cool * 0.5)], [0.76, FIRE[3]], [0.63, FIRE[4]],
    [0.5, FIRE[5]], [0.37, FIRE[6]], [0.24, cool > 0.5 ? FIRE[6] : FIRE[7]], [0.12, cool > 0.3 ? FIRE[7] : FIRE[8]],
  ];
  rings.forEach(([k, col], li) => {
    const core = li >= 6;
    const set = core ? inner : lobes;
    if (li > 0) { g.fillStyle = ditherFill(g, col); for (const [lx, ly, lr] of set) disk(g, lx, ly, lr * k + 4); }
    g.fillStyle = col;
    for (const [lx, ly, lr] of set) disk(g, lx, ly, lr * k);
  });
};

export const drawSewerNukeInside = (ctx: Ctx, state: GameState) => {
  const t = sewerNukeFrame(state.deathTimer);
  const n = state.sewerNuke;
  if (!n || t >= SEWER_NUKE.OUTSIDE) return;
  const grow = easeOut(t / 80);
  const r = 30 + 620 * grow;
  const cx = state.camera.x, cy = state.camera.y;

  ctx.save();
  // Everything scorched in the glow (in steps, the dark coming off it a band at a time going out from the blast)
  ctx.fillStyle = `rgba(255, 96, 8, ${step(0.22 + 0.32 * grow, 6).toFixed(3)})`;
  ctx.fillRect(cx - 50, cy - 50, W + 100, H + 100);
  steppedGlow(ctx, n.x, n.y, r * 2.2, '#FF8A1F', 0.45 * (1 - t / SEWER_NUKE.OUTSIDE), 0.06, 6);

  chunky(ctx, cx - 40, cy - 40, W + 80, H + 80, g => {
    // The shockwave racing out ahead of the fire: a white front, yellow behind it, a ragged orange tail
    const shock = 40 + t * 14;
    if (t < 70) {
      const k = 1 - t / 70;
      g.lineWidth = 6 + 10 * k; g.strokeStyle = ditherFill(g, '#F59E0B'); g.beginPath(); g.arc(n.x, n.y, shock - 14, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 6 * k + 2; g.strokeStyle = '#FDE68A'; g.beginPath(); g.arc(n.x, n.y, shock - 4, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 4; g.strokeStyle = '#FFFFFF'; g.beginPath(); g.arc(n.x, n.y, shock, 0, Math.PI * 2); g.stroke();
    }
    fireball(g, n.x, n.y, r, t);
    // Boards, sludge and bits of Tommy blasted out: each lit along its top, sparks streaking after them
    for (let i = 0; i < 46; i++) {
      const a = hash(i) * Math.PI * 2;
      const speed = 6 + hash(i + 50) * 14;
      const x = n.x + Math.cos(a) * speed * t, y = n.y + Math.sin(a) * speed * t + 0.08 * t * t;
      if (x < cx - 40 || x > cx + W + 40 || y < cy - 40 || y > cy + H + 40) continue;
      const kind = i % 3;
      if (kind === 0) {
        g.save(); g.translate(x, y); g.rotate(Math.round(t * (0.1 + hash(i + 9) * 0.3) * 4 / Math.PI) * Math.PI / 4);
        g.fillStyle = '#2A1608'; g.fillRect(-13, -4, 26, 8);
        g.fillStyle = '#6B4420'; g.fillRect(-12, -3, 24, 5);
        g.fillStyle = '#9A6A34'; g.fillRect(-12, -3, 24, 2);
        g.fillStyle = '#FF9F1C'; g.fillRect(8, -3, 4, 5); // (on fire at the end)
        g.restore();
      } else {
        const rr = 3 + hash(i + 3) * 5;
        g.fillStyle = kind === 1 ? '#1E3A08' : '#1A1210'; disk(g, x, y, rr + 1);
        g.fillStyle = kind === 1 ? '#4D7C0F' : '#3B2B24'; disk(g, x, y, rr);
        g.fillStyle = kind === 1 ? '#A3E635' : '#77594A'; disk(g, x - rr * 0.3, y - rr * 0.35, rr * 0.4);
      }
      // (a streak of sparks behind it)
      g.fillStyle = t % 4 < 2 ? '#FDE047' : '#F97316';
      for (let s = 1; s <= 3; s++) g.fillRect(snap(x - Math.cos(a) * speed * s * 1.2), snap(y - Math.sin(a) * speed * s * 1.2), 2, 2);
    }
  });
  ctx.restore();
};

/** Screen-space white: a full flash on ignition and the whiteout into the cut outside, both in steps with dither between. */
export const drawSewerNukeFlash = (ctx: Ctx, state: GameState) => {
  const t = sewerNukeFrame(state.deathTimer);
  if (t >= SEWER_NUKE.OUTSIDE) return;
  const ignite = t < 4 ? 1 : clamp01(1 - (t - 4) / 22);
  const whiteout = clamp01((t - SEWER_NUKE.WHITEOUT) / (SEWER_NUKE.OUTSIDE - SEWER_NUKE.WHITEOUT - 10));
  steppedWhite(ctx, Math.max(ignite, whiteout));
};

/** White over the screen, `a` of the way, in quarters: the half step between two of them as a checker of the next. */
const steppedWhite = (ctx: Ctx, a: number) => {
  // (reduce flashing: held down low)
  a = flashAlpha(a);
  if (a <= 0) return;
  const lv = a * 4, base = Math.floor(lv) / 4;
  if (base > 0) { ctx.fillStyle = `rgba(255, 255, 250, ${base})`; ctx.fillRect(0, 0, W, H); }
  if (lv - Math.floor(lv) >= 0.5 && base < 1) checker(ctx, 0, 0, W, H, `rgba(255, 255, 250, ${Math.min(1, 0.25 / (1 - base) * 2).toFixed(3)})`, 0, 2);
};

// ---------------------------------------------------------------------------
// Outside, on the street above (screen space)
// ---------------------------------------------------------------------------

const STREET_Y = 420;
const MANHOLE_X = W / 2;
const MANHOLE_Y = 452;

/** Returns false until the cut outside, when it draws the whole frame. */
export const drawSewerNukeOutside = (ctx: Ctx, state: GameState): boolean => {
  const t = sewerNukeFrame(state.deathTimer);
  if (t < SEWER_NUKE.OUTSIDE) return false;
  const e = t - SEWER_NUKE.ERUPT;           // frames since it burst out (negative before)
  // How lit the sky is by it: blazing at first, dying down to a glow
  const glow = e < 0 ? 0 : step(clamp01(1 - e / 260) * 0.8 + 0.2, 5);

  ctx.save();
  let sx = 0, sy = 0;
  if (state.screenShakeTimer > 0) {
    const m = state.screenShakeMagnitude * 1.5 * shakeScale();
    sx = snap((hash(t) - 0.5) * m); sy = snap((hash(t + 99) - 0.5) * m);
  }
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.translate(sx, sy);
  chunky(ctx, -20, -20, W + 40, H + 40, g => {
    drawSky(g, t, e, glow);
    drawSkyline(g, e, glow);
    drawStreet(g, t, e, glow);
    if (e >= 0) drawMushroomCloud(g, e);
    drawManholeCover(g, t, e);
    if (e >= 0) drawDebris(g, e);
  });
  // (the street sign's lettering, crisp, over the chunky sign)
  ctx.font = '8px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#0A2E14'; ctx.fillText('SEWER ST', 239, STREET_Y - 72);
  ctx.fillStyle = '#F8FAFC'; ctx.fillText('SEWER ST', 238, STREET_Y - 73);
  ctx.restore();

  // Flash of the eruption, and the fade in from the whiteout
  const fadeIn = clamp01(1 - (t - SEWER_NUKE.OUTSIDE) / 16);
  const flash = e >= 0 ? clamp01(1 - e / 30) : 0;
  steppedWhite(ctx, Math.max(fadeIn, flash));
  if (t >= SEWER_NUKE.TEXT) drawSpelledMessage(ctx, state.deathString, Math.floor((t - SEWER_NUKE.TEXT) / SEWER_NUKE.TEXT_RATE));
  return true;
};

const NIGHT = ['#05071A', '#0B0F2C', '#16143C', '#261844', '#3A1D46'];
const BLAZE = ['#2A0A0E', '#5C1408', '#9A2A08', '#D24E0E', '#F28C1C'];

const drawSky = (g: Ctx, t: number, e: number, glow: number) => {
  // The night sky, gone the colour of the fire while it's lit (each band its own step between the two)
  const stops = NIGHT.map((c, i) => mix(c, BLAZE[i], glow));
  bandedGradient(g, -20, -20, W + 40, STREET_Y + 20, stops, 12);
  // Stars, twinkling (washed out by the glow)
  if (glow < 0.6) for (let i = 0; i < 70; i++) {
    const x = snap(hash(i) * W), y = snap(hash(i + 1) * 300);
    const tw = (t + i * 7) % 50 < 4;
    g.fillStyle = hash(i + 7) > 0.7 ? '#FEF3C7' : '#94A3B8';
    g.fillRect(x, y, 2, 2);
    if (tw && glow === 0) { g.fillStyle = '#E2E8F0'; g.fillRect(x - 2, y, 6, 2); g.fillRect(x, y - 2, 2, 6); }
  }
  // The glow behind it all, in rings
  if (glow > 0) steppedGlow(g, MANHOLE_X, 230, 640, '#FFA640', 0.55 * glow, 0.05, 7);
  // Before it goes: the green leaking up out of the street, faint
  if (e < 0) steppedGlow(g, MANHOLE_X, MANHOLE_Y, 90, '#65F01E', 0.2 * clamp01((t - SEWER_NUKE.OUTSIDE) / 25), 0, 4);
};

/** A city block's worth of buildings, the far ones flat in the haze, the near ones lit down the side facing the blast. */
const drawSkyline = (g: Ctx, e: number, glow: number) => {
  // (far off: rooftops in silhouette, the water tower up over them)
  const far = mix('#10132A', '#3A120C', glow);
  g.fillStyle = far;
  for (let x = -20, i = 0; x < W + 20; i++) { const w = 30 + hash(i + 300) * 50, h = 40 + hash(i + 310) * 90; g.fillRect(snap(x), snap(STREET_Y - 40 - h), snap(w), snap(h + 40)); x += w; }
  const tx = 640, ty = STREET_Y - 230;
  g.fillRect(tx - 34, ty + 46, 4, 110); g.fillRect(tx + 30, ty + 46, 4, 110); g.fillRect(tx - 4, ty + 46, 4, 110);
  g.fillRect(tx - 30, ty + 90, 60, 2); g.beginPath(); g.moveTo(tx - 40, ty + 14); g.lineTo(tx, ty - 10); g.lineTo(tx + 40, ty + 14); g.closePath(); g.fill();
  g.fillRect(tx - 38, ty + 12, 76, 36);
  g.fillStyle = mix(far, '#FFB060', glow * 0.5); g.fillRect(tx - 38, ty + 12, 4, 36); g.fillRect(tx - 40, ty + 12, 80, 2);
  hazeBands(g, -20, STREET_Y - 200, W + 40, 200, glow > 0 ? '#C2410C' : '#1E1B4B', 0.0, 0.35, 5);

  // (near: the block itself)
  let x = -20, i = 0;
  const shockX = e >= 0 ? e * 9 : -1;
  while (x < W + 20) {
    const w = snap(56 + hash(i + 30) * 60), h = snap(100 + hash(i + 40) * 170);
    const bx = snap(x), top = STREET_Y - h, mid = bx + w / 2;
    const near = 1 - Math.min(1, Math.abs(mid - MANHOLE_X) / 420);
    const left = mid < MANHOLE_X;
    const base = ['#161A2A', '#1A1626', '#141C24'][i % 3];
    const body = mix(base, '#7A2A10', step(glow * (0.3 + near * 0.5), 5));
    const lit = mix(body, '#FFB25C', step(glow * (0.25 + near * 0.6), 5));
    // Body, the side facing the blast lit in two steps, the far side in shadow; a cornice with a lit lip
    g.fillStyle = body; g.fillRect(bx, top, w, h);
    g.fillStyle = mix(body, '#05060C', 0.35); g.fillRect(left ? bx : bx + w - 6, top, 6, h);
    if (glow > 0) { g.fillStyle = lit; g.fillRect(left ? bx + w - 6 : bx, top, 6, h); checker(g, left ? bx + w - 10 : bx + 6, top, 4, h, lit); }
    g.fillStyle = mix(body, '#05060C', 0.5); g.fillRect(bx - 2, top - 6, w + 4, 6);
    g.fillStyle = glow > 0 ? lit : mix(body, '#5A6280', 0.35); g.fillRect(bx - 2, top - 6, w + 4, 2);
    // Windows: lit, dark; blown out as the shockwave goes through (fire in some of them after)
    const blown = Math.abs(mid - MANHOLE_X) < shockX;
    for (let wy = top + 12; wy < STREET_Y - 18; wy += 18) {
      for (let wx = bx + 8; wx < bx + w - 12; wx += 14) {
        const k = wx * 3.1 + wy * 7.7;
        if (hash(k) < 0.4) continue;
        const burning = blown && hash(k + 1) < 0.28;
        const on = !blown && hash(k + 2) < 0.65;
        g.fillStyle = '#05060C'; g.fillRect(wx - 2, wy - 2, 10, 12);
        g.fillStyle = burning ? ((e + i) % 6 < 3 ? '#F97316' : '#FBBF24') : on ? '#FCD34D' : blown ? '#0A0A0E' : '#263049';
        g.fillRect(wx, wy, 6, 8);
        if (on) { g.fillStyle = '#FEF3C7'; g.fillRect(wx, wy, 6, 2); }
        if (burning) { g.fillStyle = '#FDE68A'; g.fillRect(wx + 2, wy + 4, 2, 4); }
        g.fillStyle = mix(body, '#9AA3BC', 0.3); g.fillRect(wx - 2, wy + 8, 10, 2); // (the sill)
      }
    }
    // Glass raining out of the blown windows
    if (blown && e < 150) {
      for (let k = 0; k < 8; k++) {
        const gx = snap(bx + hash(i * 10 + k) * w + (left ? -1 : 1) * e * 0.7);
        const gy = snap(top + hash(i * 10 + k + 5) * h * 0.6 + e * e * 0.012);
        if (gy > STREET_Y) continue;
        g.fillStyle = (e + k) % 4 < 2 ? '#E0F2FE' : '#7DD3FC'; g.fillRect(gx, gy, 2, 4);
      }
    }
    x += w + 4;
    i++;
  }
};

const drawStreet = (g: Ctx, t: number, e: number, glow: number) => {
  // The air shoved out ahead of it: a dome of it, pale, going out fast (just the ragged dither of it), and its edge
  if (e >= 2 && e < 46) {
    const rr = 40 + e * 11, k = e / 46;
    g.save(); g.beginPath(); g.rect(-20, -20, W + 40, STREET_Y + 20); g.clip();
    if (k < 0.6) { g.fillStyle = ditherFill(g, '#FFF7E0'); g.beginPath(); g.arc(MANHOLE_X, MANHOLE_Y, rr, Math.PI, 0); g.fill(); }
    g.strokeStyle = '#FFFFFF'; g.lineWidth = 6 * (1 - k) + 2; g.beginPath(); g.arc(MANHOLE_X, MANHOLE_Y, rr, Math.PI, 0); g.stroke();
    g.strokeStyle = '#FDBA74'; g.lineWidth = 4; g.beginPath(); g.arc(MANHOLE_X, MANHOLE_Y, rr - 10, Math.PI, 0); g.stroke();
    g.restore();
  }
  // Sidewalk: its lit lip, the curb under it
  g.fillStyle = '#4A4E5A'; g.fillRect(-20, STREET_Y, W + 40, 14);
  g.fillStyle = '#7A7F8E'; g.fillRect(-20, STREET_Y, W + 40, 2);
  for (let x = 0; x < W; x += 48) { g.fillStyle = '#353945'; g.fillRect(x, STREET_Y + 2, 2, 12); }
  g.fillStyle = '#23252E'; g.fillRect(-20, STREET_Y + 14, W + 40, 6);
  // The road: banded darker toward us, the lines on it
  bandedGradient(g, -20, STREET_Y + 20, W + 40, H - STREET_Y, ['#2A2C36', '#1C1D25', '#121318'], 5);
  for (let x = -20; x < W + 20; x += 70) { g.fillStyle = '#A16207'; g.fillRect(x, 536, 36, 6); g.fillStyle = '#FACC15'; g.fillRect(x, 536, 36, 2); }
  // (the fire's light across it)
  if (glow > 0) hazeBands(g, -20, STREET_Y, W + 40, H - STREET_Y, '#FF7A1A', 0.4 * glow, 0.12 * glow, 5);
  // Street lamps (out when it goes)
  for (const lx of [110, 690]) {
    const dir = lx < MANHOLE_X ? 1 : -1;
    g.fillStyle = '#1F2430'; g.fillRect(lx - 4, STREET_Y - 112, 8, 112);
    g.fillStyle = '#4B5262'; g.fillRect(lx - 4, STREET_Y - 112, 2, 112);
    g.fillStyle = '#1F2430'; g.fillRect(dir > 0 ? lx - 4 : lx - 26, STREET_Y - 114, 30, 6);
    g.fillStyle = '#4B5262'; g.fillRect(dir > 0 ? lx - 4 : lx - 26, STREET_Y - 114, 30, 2);
    const hx = lx + dir * 20 - 5;
    g.fillStyle = e >= 0 ? '#2A2C36' : '#FEF3C7'; g.fillRect(hx, STREET_Y - 108, 10, 6);
    if (e < 0) { g.fillStyle = ditherFill(g, '#FDE68A'); g.beginPath(); g.moveTo(hx, STREET_Y - 102); g.lineTo(hx + 10, STREET_Y - 102); g.lineTo(hx + 34, STREET_Y); g.lineTo(hx - 24, STREET_Y); g.closePath(); g.fill(); }
  }
  // The street sign (its lettering's put on after, crisp)
  g.fillStyle = '#3A3F4C'; g.fillRect(236, STREET_Y - 70, 4, 70); g.fillStyle = '#6B7180'; g.fillRect(236, STREET_Y - 70, 2, 70);
  g.fillStyle = '#0A2E14'; g.fillRect(194, STREET_Y - 84, 88, 22);
  g.fillStyle = '#166534'; g.fillRect(196, STREET_Y - 82, 84, 18);
  g.fillStyle = '#22A050'; g.fillRect(196, STREET_Y - 82, 84, 2);

  // The manhole (the cover's drawn separately): its rim, lit along the far edge
  g.fillStyle = '#3A3D48'; g.beginPath(); g.ellipse(MANHOLE_X, MANHOLE_Y, 40, 11, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#05060A'; g.beginPath(); g.ellipse(MANHOLE_X, MANHOLE_Y + 1, 34, 8, 0, 0, Math.PI * 2); g.fill();
  if (e < 0) {
    // Sickly green light and steam leaking out round the rim before it blows
    const leak = step((t - SEWER_NUKE.OUTSIDE) / 25, 4);
    if (leak > 0) {
      g.fillStyle = mix('#05060A', '#39FF14', leak * 0.8); g.beginPath(); g.ellipse(MANHOLE_X, MANHOLE_Y + 1, 34, 8, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = ditherFill(g, '#A3E635'); g.beginPath(); g.ellipse(MANHOLE_X, MANHOLE_Y - 2, 44, 12, 0, Math.PI, Math.PI * 2); g.fill();
      for (let i = 0; i < 6; i++) {
        const p = ((t * 2 + i * 13) % 40) / 40;
        if (p > 0.85) continue;
        pixelBlob(g, MANHOLE_X - 30 + i * 12 + Math.sin(p * 6 + i) * 4, MANHOLE_Y - 10 - p * 60, 5 + p * 10, 4 + p * 8, p < 0.4 ? '#D9F99D' : '#8FA88A');
      }
    }
  } else {
    // Glowing up out of the hole, white-hot
    g.fillStyle = e < 60 ? '#FFFFFF' : '#FCD34D'; g.beginPath(); g.ellipse(MANHOLE_X, MANHOLE_Y + 1, 34, 8, 0, 0, Math.PI * 2); g.fill();
  }
};

/** Bits of the street up in the air: asphalt, brick, all lit along the top, and embers coming down after. */
const drawDebris = (g: Ctx, e: number) => {
  for (let i = 0; i < 34; i++) {
    const vx = (hash(i + 400) - 0.5) * 14, vy = 9 + hash(i + 410) * 14;
    const x = MANHOLE_X + vx * e, y = MANHOLE_Y - 10 - vy * e + 0.11 * e * e;
    if (y > STREET_Y + 40 || x < -20 || x > W + 20) continue;
    const s = 4 + Math.floor(hash(i + 420) * 3) * 2;
    const c = i % 3 === 0 ? '#7F3A22' : '#2E3038';
    g.fillStyle = '#0A0A0E'; g.fillRect(snap(x) - 2, snap(y) - 2, s + 4, s + 2);
    g.fillStyle = c; g.fillRect(snap(x), snap(y), s, s - 2);
    g.fillStyle = mix(c, '#FFFFFF', 0.3); g.fillRect(snap(x), snap(y), s, 2);
    if (e < 90 && e % 4 < 2) { g.fillStyle = '#FB923C'; g.fillRect(snap(x - vx * 1.5), snap(y + vy * 1.5), 2, 2); }
  }
  // Embers, drifting down out of the cloud once it's up
  if (e > 90) for (let i = 0; i < 40; i++) {
    const life = ((e - 90) * 0.6 + hash(i + 500) * 300) % 300;
    const x = MANHOLE_X + (hash(i + 510) - 0.5) * 520 + Math.sin(life * 0.05 + i) * 10;
    const y = 90 + life * 1.1;
    if (y > STREET_Y) continue;
    g.fillStyle = (e + i) % 10 < 5 ? '#FDBA74' : '#EA580C'; g.fillRect(snap(x), snap(y), 2, 2);
  }
};

/** The manhole cover rattles, then rockets up spinning when it blows. */
const drawManholeCover = (g: Ctx, t: number, e: number) => {
  let x = MANHOLE_X, y = MANHOLE_Y - 3, spin = 0;
  if (e < 0) {
    y -= snap(Math.abs(Math.sin(t * 1.3)) * 4 * clamp01((t - SEWER_NUKE.OUTSIDE) / 10));
  } else {
    y -= e * 22 - e * e * 0.05;
    x += e * 1.5;
    spin = e * 0.35;
    if (y < -60) return;
  }
  // (turning over: flat, edge on, its face, in steps)
  const sq = Math.round((Math.abs(Math.cos(spin)) * 0.8 + 0.2) * 4) / 4;
  const ry = Math.max(2, 9 * sq);
  g.fillStyle = '#18191F'; g.beginPath(); g.ellipse(x, y + 2, 34, ry + 1, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#4B4F5C'; g.beginPath(); g.ellipse(x, y, 32, ry, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#7A7F8E'; g.beginPath(); g.ellipse(x, y - ry * 0.3, 26, ry * 0.5, 0, Math.PI, Math.PI * 2); g.fill();
  if (sq > 0.4) { g.fillStyle = '#2E3038'; for (let k = -2; k <= 2; k++) g.fillRect(snap(x + k * 9) - 2, snap(y) - 2, 4, 2); }
  if (e >= 0 && e < 40) { g.fillStyle = '#F97316'; g.fillRect(snap(x - 32), snap(y + ry - 2), 64, 2); } // (scorched underneath, still glowing)
};

/**
 * The fire bursting up out of the manhole as a column, then billowing over into the mushroom: a stem of churning
 * smoke with fire up its middle, the ring of cloud round it partway up, the cap rolling over on itself (fire-lit
 * underneath, its tops lit), all of it cooling from fire to smoke a step at a time; the dust surging out along the
 * street at its foot.
 */
const drawMushroomCloud = (g: Ctx, e: number) => {
  const rise = easeOut(e / 170);
  const capY = MANHOLE_Y - 70 - rise * 250;
  const capR = 36 + easeOut(e / 200) * 175;
  const capH = capR * 0.42;
  const cool = clamp01((e - 30) / 260);
  const stemW = 16 + rise * 30;

  // The first moment: a column of fire shooting straight up out of the hole
  if (e < 40) {
    const k = 1 - e / 40, top = capY - capH * 0.4;
    [[1, FIRE[3]], [0.7, FIRE[5]], [0.45, FIRE[7]], [0.2, FIRE[8]]].forEach(([s, c], li) => {
      const hw = (stemW + 14) * (s as number) * (0.6 + 0.6 * k);
      if (li) { g.fillStyle = ditherFill(g, c as string); g.fillRect(MANHOLE_X - hw - 4, top, hw * 2 + 8, MANHOLE_Y - top); }
      g.fillStyle = c as string; g.fillRect(MANHOLE_X - hw, top, hw * 2, MANHOLE_Y - top);
    });
  }

  // (the glow it throws on the sky round it)
  steppedGlow(g, MANHOLE_X, capY, capR * 1.7, '#FF8A1F', 0.35 * (1 - cool * 0.7), 0.02, 5);

  // The stem: billows rolling up it from the hole into the cap, narrowing as they go, a core of fire up the middle
  const stemTop = capY + capH * 0.25, len = MANHOLE_Y - 8 - stemTop;
  const stem: Puff[] = [];
  const N = 10;
  for (let i = 0; i < N; i++) {
    const k = i + ((e * 0.05) % 1), f = k / N;
    const y = MANHOLE_Y - 8 - len * f;
    const r = stemW * (1.05 - f * 0.3) * (0.8 + 0.35 * hash(i + 100 + Math.floor(e * 0.05)));
    const side = (i % 2 ? 1 : -1) * stemW * 0.35;
    stem.push({ x: MANHOLE_X + side + Math.sin(e * 0.08 + i * 1.3) * 3, y, r });
  }
  // (the fire up the middle of it: a column, ragged at the edges, hottest low down, going out as it cools)
  const coreCol = (g2: Ctx) => {
    if (cool >= 0.85) return;
    const hot = step(1 - cool / 0.85, 4);
    [[0.55, mix(FIRE[3], SMOKE[2], 1 - hot)], [0.34, mix(FIRE[5], FIRE[3], 1 - hot)], [0.16, mix(FIRE[7], FIRE[4], 1 - hot)]].forEach(([s2, c], li) => {
      for (let y = stemTop + capH * 0.1; y < MANHOLE_Y - 8; y += 6) {
        const hw = stemW * (s2 as number) * (1 + 0.25 * Math.sin(y * 0.09 - e * 0.25 + li));
        if (li) { g2.fillStyle = ditherFill(g2, c as string); g2.fillRect(MANHOLE_X - hw - 2, y, hw * 2 + 4, 6); }
        g2.fillStyle = c as string; g2.fillRect(MANHOLE_X - hw, y, hw * 2, 6);
      }
    });
  };

  // The ring round the stem, partway up (its back half behind the stem, its front in front)
  // (a band of cloud condensed out of the air round it, little billows close together, pale, lit along the top)
  const ringY = stemTop + len * 0.4, ringT = easeOut((e - 45) / 60), ringRx = stemW * (1.7 + 1.5 * ringT), ringRy = ringRx * 0.16;
  const rc = step(cool, 4);
  const ringTones: Tones = { shadow: mix('#7A4A38', '#3E3A48', rc), body: mix('#D9A27C', '#8E8A98', rc), lit: mix('#F6D2AE', '#B4B0BE', rc), hi: mix('#FFF1DC', '#DAD6E0', rc) };
  const ringPuffs: { p: Puff; front: boolean }[] = [];
  if (ringT > 0) for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2 + e * 0.008;
    ringPuffs.push({ p: { x: MANHOLE_X + Math.cos(a) * ringRx, y: ringY + Math.sin(a) * ringRy, r: (7 + 8 * ringT) * (0.75 + 0.5 * hash(i + 600)) }, front: Math.sin(a) > 0 });
  }
  const ringHalf = (front: boolean) => { const ps = ringPuffs.filter(r => r.front === front).map(r => r.p); if (ps.length) billows(g, ps, ringTones); };
  ringHalf(false);
  billows(g, stem, cloudTones(Math.min(1, cool * 1.15), 0.7 - cool * 0.4));
  coreCol(g);
  ringHalf(true);

  // The cap: puffs rolling round a ring (the back row darker, behind), a crown bulging up out of the middle, the
  // front row over it, every one fire-lit from under; a dark skirt under it all to close it up
  const back: Puff[] = [], front: Puff[] = [], crown: Puff[] = [];
  const M = 20;
  for (let i = 0; i < M; i++) {
    const a = (i / M) * Math.PI * 2 + e * 0.018;
    const p = { x: MANHOLE_X + Math.cos(a) * capR * 0.76, y: capY + Math.sin(a) * capH * 0.42, r: capH * (0.5 + 0.22 * hash(i + 200)) * (1 + 0.06 * Math.sin(e * 0.1 + i)) };
    (Math.sin(a) < 0 ? back : front).push(p);
  }
  for (let j = 0; j < 5; j++) {
    const u = (j - 2) / 2;
    crown.push({ x: MANHOLE_X + u * capR * 0.42 + Math.sin(e * 0.05 + j) * 3, y: capY - capH * (0.45 + 0.25 * (1 - Math.abs(u))), r: capH * (0.62 - 0.12 * Math.abs(u)) });
  }
  const capTones = cloudTones(cool, 0.9 - cool * 0.5);
  const backTones = cloudTones(Math.min(1, cool + 0.18), 0.5 - cool * 0.3);
  g.fillStyle = capTones.shadow; g.beginPath(); g.ellipse(MANHOLE_X, capY + capH * 0.25, capR * 0.85, capH * 0.55, 0, 0, Math.PI * 2); g.fill();
  billows(g, back, backTones);
  billows(g, crown, capTones);
  billows(g, front, capTones);

  // The base surge: dust and grit rolling out along the street both ways, in front of everything
  const surge = easeOut(e / 120);
  const reach = 40 + surge * 520, rr = 8 + surge * 17;
  const dust: Puff[] = [];
  for (let i = 0; i < 28; i++) {
    const side = i % 2 ? 1 : -1, d = (0.1 + 0.9 * ((Math.floor(i / 2) + 0.3 + 0.4 * hash(i + 90)) / 14)) * reach;
    const r = rr * (0.8 + 0.7 * hash(i + 80)) * (1.15 - 0.45 * (d / reach));
    dust.push({ x: MANHOLE_X + side * d, y: MANHOLE_Y - r * 0.45 - hash(i + 70) * rr * 0.5, r });
  }
  const dc = step(Math.max(cool, e / 140), 5);
  billows(g, dust, { shadow: DUST[0], glow: mix(FIRE[4], DUST[2], dc), body: mix(FIRE[3], DUST[2], dc), lit: mix(FIRE[5], DUST[3], dc), hi: mix(FIRE[7], DUST[4], dc) });
  // (and the foot of the stem, a churn of fire and dust right at the hole)
  billows(g, [{ x: MANHOLE_X - stemW * 0.8, y: MANHOLE_Y - 8, r: stemW * 0.9 }, { x: MANHOLE_X + stemW * 0.8, y: MANHOLE_Y - 6, r: stemW * 0.85 }, { x: MANHOLE_X, y: MANHOLE_Y - 14, r: stemW }], cloudTones(cool, 0.8 - cool * 0.5));
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
