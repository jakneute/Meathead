import type { GameState } from '../../core/state';
import type { WeaponType } from '../../../types';
import { floorTopAt } from '../../core/terrain';
import { body } from './deathAnim';
import type { DeathFace } from './deathFace';
import { pixelBlob, steppedGlow, bandedGradient, hazeBands, checker } from '../pixelArt';
import { drawFireball } from '../fx/fireball';
import { drawFire } from '../fx/fire';
import { ink } from '../npc/kit';
import { drawBike } from '../../stages/tommy/streetDraw';
import { drawChopperBike } from '../enemies/oscar';
import { drawSki } from '../../stages/ernie/drawSea';
import { drawBloodPool } from '../spatter';
import {
  MeatheadDeath, CRASH_LAND, CRASH_V, CRASH_VX, CRASH_G, CRASH_PILE, CRASH_BLAST, SKID, skidAt, CRASH_SKIPS, CRASH_BALL_STOP,
  MEATHEAD_DEATH_FRAMES,
} from '../../player/deathAnim';

// Killed on something he's riding (see player/deathAnim, 'crash'): flung forward off it, end over end, and down;
// then each ride's own ending. Played out on a set of its own (the crash cam: the ride's own stretch of road, water or
// snow, flat and clear, cut to the moment it happens), so nothing in the level's in the way of it.

type Ctx = CanvasRenderingContext2D;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const PI = Math.PI;

/** Him, his middle at (mx, my), turned rot, with the face given. */
const him = (ctx: Ctx, state: GameState, d: MeatheadDeath, weapon: WeaponType, mx: number, my: number, rot: number, face: DeathFace, extra: Record<string, unknown> = {}) => {
  ctx.save();
  ctx.translate(mx, my); ctx.rotate(rot);
  body(ctx, { ...state, blocks: [], camera: { x: 0, y: 0 } } as GameState, { ...d, x: 0, y: 32 }, weapon, { deathFace: face, isGrounded: false, ...extra });
  ctx.restore();
};

/** The ground under x near where he was (the sea, for the jet ski: where he was is the surface). */
const groundAt = (state: GameState, d: MeatheadDeath, gx: number) => (d.ride === 'jetski' ? d.y : floorTopAt(state.blocks, gx, d.y, 90) ?? d.y);

/** Him in the air off it: where his middle is and how he's turned, u frames in (to CRASH_LAND, when he's down). */
const flight = (state: GameState, d: MeatheadDeath, u: number) => {
  const F = d.facing, k = clamp01(u / CRASH_LAND);
  const mx = d.x + F * CRASH_VX * u;
  const gy = groundAt(state, d, d.x + F * CRASH_VX * CRASH_LAND);
  const feet = d.y + (gy - d.y) * k - (CRASH_V * u - (CRASH_G / 2) * u * u);
  // (end over end, two and a quarter turns of him, flat out along the ground as he comes down)
  return { mx, my: feet - 32 + 17 * k, rot: F * k * PI * 2.5 };
};

/** The ride itself: its middle (about where it turns) at (x, y), turned rot, drawn facing his way. */
const drawRide = (ctx: Ctx, d: MeatheadDeath, x: number, y: number, rot: number, f: number, turn: number, filter?: string) => {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(d.facing, 1); ctx.translate(0, 16);
  if (filter) ctx.filter = filter;
  if (d.ride === 'bike') drawBike(ctx, 0, 0, 0, turn, turn * 0.3);
  else if (d.ride === 'moto') drawChopperBike(ctx, -6, 2, 0, turn, '#7F1D1D');
  else if (d.ride === 'jetski') drawSki(ctx, f);
  ctx.restore();
};

/** A pair of skis stood up in the snow where he left them, crossed. */
const plantedSkis = (ctx: Ctx, x: number, y: number) => {
  for (const [a, dx] of [[-0.22, -5], [0.26, 5]] as const) {
    ctx.save(); ctx.translate(x + dx, y + 6); ctx.rotate(a);
    ink(ctx, () => { ctx.moveTo(-2.5, 0); ctx.lineTo(-2.5, -40); ctx.quadraticCurveTo(-2, -48, 3, -50); ctx.lineTo(2.5, -40); ctx.lineTo(2.5, 0); ctx.closePath(); }, '#FACC15', 1);
    ctx.fillStyle = '#CA8A04'; ctx.fillRect(0.5, -40, 2, 40);
    ctx.fillStyle = '#111827'; ctx.fillRect(-3, -22, 6, 4);
    ctx.restore();
  }
  // (snow banked up round where they went in)
  pixelBlob(ctx, x, y + 1, 16, 4, '#F8FAFC');
};

/** A snowball, r round, rolled `spin`: shaded in bands from the light, dimpled, an outline. */
const snowball = (ctx: Ctx, x: number, y: number, r: number, spin: number) => {
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.clip();
  ctx.fillStyle = '#CBD5E1'; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.fillStyle = '#E2E8F0'; ctx.beginPath(); ctx.arc(x - r * 0.12, y - r * 0.12, r * 0.86, 0, PI * 2); ctx.fill();
  ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(x - r * 0.28, y - r * 0.28, r * 0.6, 0, PI * 2); ctx.fill();
  // (clumps of it going round with it)
  for (let k = 0; k < 6; k++) {
    const a = spin + k * 1.05, rr = r * (0.35 + (k % 3) * 0.2);
    ctx.fillStyle = k % 2 ? '#94A3B8' : '#CBD5E1';
    ctx.fillRect(Math.round(x + Math.cos(a) * rr), Math.round(y + Math.sin(a) * rr), 3, 2);
  }
  ctx.restore();
  ctx.strokeStyle = '#64748B'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.stroke();
};

/** A boot sticking out of something at (x, y), pointing angle a. */
const boot = (ctx: Ctx, x: number, y: number, a: number) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ink(ctx, () => ctx.rect(-4, -10, 8, 10), '#1E3A8A', 1);
  ink(ctx, () => ctx.roundRect(-5, -16, 10, 7, [2, 4, 1, 1]), '#292524', 1);
  ctx.fillStyle = '#57534E'; ctx.fillRect(-4, -15, 3, 1);
  ctx.restore();
};

/** Where the ground is on the crash cam's screen, where he comes off (from the side he's heading away from), and how big. */
const CAM_GROUND = 500, CAM_FROM = 130, CAM_Z = 1.5;
const hash = (n: number) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };

/** A row of something along the horizon at y: blocks h tall (plus up to `vary`), w wide each, in `color`. */
const skyline = (ctx: Ctx, W: number, y: number, w: number, h: number, vary: number, color: string, seed: number) => {
  ctx.fillStyle = color;
  for (let x = -w, i = 0; x < W + w; x += w, i++) { const bh = Math.round((h + hash(seed + i) * vary) / 2) * 2; ctx.fillRect(x, y - bh, w - 2, bh); }
};

/** The set for each ride: the sky, what's on the horizon, and the ground he comes down on (flat, nothing in the way). */
const backdrop = (ctx: Ctx, ride: MeatheadDeath['ride'], W: number, H: number, f: number) => {
  const G = CAM_GROUND;
  if (ride === 'bike') {
    // Flint at dusk: the stacks and the water tower against it, the houses, the street
    bandedGradient(ctx, 0, 0, W, G, ['#312E81', '#7C3AED', '#DB2777', '#F97316', '#FDBA74'], 16);
    skyline(ctx, W, G - 60, 70, 20, 30, '#3B1D4A', 1);
    ctx.fillStyle = '#2E1A3A'; for (const sx of [560, 600, 640]) ctx.fillRect(sx, G - 190, 14, 130);
    ctx.fillStyle = '#2E1A3A'; ctx.fillRect(160, G - 160, 6, 100); ctx.fillRect(214, G - 160, 6, 100); ctx.beginPath(); ctx.ellipse(190, G - 175, 46, 26, 0, 0, Math.PI * 2); ctx.fill();
    skyline(ctx, W, G - 26, 120, 34, 14, '#1E1330', 7);
    ctx.fillStyle = '#FDE68A'; for (let i = 0; i < 9; i++) if (hash(i * 3) > 0.4) ctx.fillRect(30 + i * 90, G - 44, 8, 8);
    ctx.fillStyle = '#9CA3AF'; ctx.fillRect(0, G - 10, W, 10); ctx.fillStyle = '#D1D5DB'; ctx.fillRect(0, G - 10, W, 2);
    ctx.fillStyle = '#6B7280'; for (let x = 0; x < W; x += 60) ctx.fillRect(x, G - 10, 2, 10);
    bandedGradient(ctx, 0, G, W, H - G, ['#3F3F46', '#27272A', '#18181B'], 6);
    checker(ctx, 0, G + 20, W, 2, '#52525B');
    ctx.fillStyle = '#FACC15'; for (let x = 20; x < W; x += 110) ctx.fillRect(x, G + 46, 56, 4);
  } else if (ride === 'moto') {
    // The highway out of the oil field at sundown: mesas, the derricks, the flare, the blacktop
    bandedGradient(ctx, 0, 0, W, G, ['#1E1B4B', '#7C2D12', '#EA580C', '#FDBA74', '#FEF3C7'], 16);
    steppedGlow(ctx, 600, G - 30, 90, '#FDE68A', 0.6, 0, 5);
    ctx.fillStyle = '#7C2D12'; ctx.beginPath(); ctx.moveTo(0, G - 40); ctx.lineTo(80, G - 110); ctx.lineTo(260, G - 110); ctx.lineTo(320, G - 40); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#9A3412'; ctx.fillRect(80, G - 112, 180, 4);
    ctx.fillStyle = '#431407'; for (let k = 0; k < 4; k++) { const x = 380 + k * 110; ctx.beginPath(); ctx.moveTo(x - 12, G - 20); ctx.lineTo(x, G - 90 - (k % 2) * 20); ctx.lineTo(x + 12, G - 20); ctx.fill(); }
    bandedGradient(ctx, 0, G - 40, W, 40, ['#A16207', '#854D0E', '#713F12'], 4);
    ctx.fillStyle = '#4D7C0F'; for (let k = 0; k < 14; k++) ctx.fillRect(Math.round(hash(k) * W), G - 8 - Math.round(hash(k + 9) * 18), 8, 6);
    bandedGradient(ctx, 0, G, W, H - G, ['#3F3F46', '#27272A', '#18181B'], 6);
    ctx.fillStyle = '#E5E7EB'; ctx.fillRect(0, G, W, 2);
    ctx.fillStyle = '#FACC15'; for (let x = 20; x < W; x += 110) ctx.fillRect(x, G + 46, 56, 4);
  } else if (ride === 'jetski') {
    // The bay: the bridge, the island, the chop
    bandedGradient(ctx, 0, 0, W, G, ['#0C4A6E', '#0369A1', '#38BDF8', '#BAE6FD'], 14);
    hazeBands(ctx, 0, G - 120, W, 120, '#F1F5F9', 0, 0.35, 5);
    ctx.fillStyle = '#9A3412';
    for (const tx of [120, 420]) { ctx.fillRect(tx, G - 200, 12, 200); ctx.fillRect(tx - 6, G - 140, 24, 6); ctx.fillRect(tx - 6, G - 190, 24, 6); }
    ctx.strokeStyle = '#9A3412'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-40, G - 120); ctx.quadraticCurveTo(272, G - 20, 600, G - 170); ctx.moveTo(126, G - 196); ctx.quadraticCurveTo(272, G - 70, 426, G - 196); ctx.stroke();
    ctx.fillStyle = '#9A3412'; ctx.fillRect(-40, G - 70, W + 80, 6);
    ctx.fillStyle = '#475569'; ctx.beginPath(); ctx.moveTo(560, G); ctx.lineTo(600, G - 34); ctx.lineTo(700, G - 40); ctx.lineTo(740, G); ctx.fill();
    ctx.fillStyle = '#E2E8F0'; ctx.fillRect(612, G - 52, 60, 14); ctx.fillRect(650, G - 70, 8, 20);
    bandedGradient(ctx, 0, G, W, H - G, ['#0E7490', '#155E75', '#164E63', '#083344'], 8);
    for (let k = 0; k < 18; k++) { const x = Math.round((hash(k) * W + f * (0.3 + hash(k + 4) * 0.4)) % W), y = G + 6 + Math.round(hash(k + 2) * (H - G - 20)); ctx.fillStyle = 'rgba(224, 242, 254, 0.45)'; ctx.fillRect(x, y, 18 + Math.round(hash(k + 7) * 20), 2); }
    ctx.fillStyle = '#E0F2FE'; ctx.fillRect(0, G, W, 2);
  } else {
    // The mountain: pale sky, the peaks, the spruce, the snow
    bandedGradient(ctx, 0, 0, W, G, ['#93C5FD', '#BFDBFE', '#E0F2FE', '#F8FAFC'], 14);
    const peaks: [number, number][] = [[-60, 260], [180, 330], [430, 240], [690, 310], [900, 260]];
    for (const [px, ph] of peaks) {
      ctx.fillStyle = '#64748B'; ctx.beginPath(); ctx.moveTo(px - 220, G - 40); ctx.lineTo(px, G - ph); ctx.lineTo(px + 220, G - 40); ctx.fill();
      ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.moveTo(px - 70, G - ph + 70 * ph / 220 * 0.45); ctx.lineTo(px, G - ph); ctx.lineTo(px + 70, G - ph + 70 * ph / 220 * 0.45); ctx.fill();
    }
    ctx.fillStyle = '#14532D';
    for (let k = 0; k < 16; k++) { const x = k * 54 + hash(k) * 20, h = 50 + hash(k + 3) * 40; ctx.beginPath(); ctx.moveTo(x - 14, G - 30); ctx.lineTo(x, G - 30 - h); ctx.lineTo(x + 14, G - 30); ctx.fill(); }
    bandedGradient(ctx, 0, G - 34, W, 34, ['#E2E8F0', '#F1F5F9'], 3);
    bandedGradient(ctx, 0, G, W, H - G, ['#F8FAFC', '#E2E8F0', '#CBD5E1'], 6);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, G, W, 2);
    for (let k = 0; k < 20; k++) { ctx.fillStyle = '#CBD5E1'; ctx.fillRect(Math.round(hash(k) * W), G + 8 + Math.round(hash(k + 5) * 60), 10, 2); }
  }
};

/** The crash cam (screen space, over everything): his ride's own set, and him coming off it, flat ground and nothing
 * in the way. Dims at the end for the message, like the falls. */
export const drawCrashCam = (ctx: Ctx, state: GameState, W: number, H: number, weapon: WeaponType) => {
  const d = state.meatheadDeath;
  if (!d || d.kind !== 'crash' || state.deathTimer <= 0) return;
  const len = state.deathScene?.len ?? MEATHEAD_DEATH_FRAMES.crash;
  const t = Math.min(state.deathScene?.t ?? 9999, len);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  backdrop(ctx, d.ride, W, H, state.frame);
  ctx.save();
  ctx.translate(d.facing > 0 ? CAM_FROM : W - CAM_FROM, CAM_GROUND); ctx.scale(CAM_Z, CAM_Z);
  drawCrash(ctx, { ...state, blocks: [] } as GameState, { ...d, x: 0, y: 0 }, t, weapon);
  ctx.restore();
  const out = clamp01((t - (len - 20)) / 20);
  if (out > 0) hazeBands(ctx, 0, 0, W, H, '#000000', out * 0.5, out * 0.7, 4);
  ctx.restore();
};

const drawCrash = (ctx: Ctx, state: GameState, d: MeatheadDeath, t: number, weapon: WeaponType) => {
  const F = d.facing, f = state.frame, s = t - CRASH_LAND;
  const landX = d.x + F * CRASH_VX * CRASH_LAND, gLand = groundAt(state, d, landX);
  const air = t < CRASH_LAND;
  switch (d.ride) {
    case 'bike': case 'moto': {
      const moto = d.ride === 'moto';
      const restX = landX + F * SKID, gRest = groundAt(state, d, restX);
      const blast = moto ? t - CRASH_BLAST : -1;
      const charred = blast >= 0 ? 'brightness(0.3) sepia(0.5) contrast(1.2)' : undefined;
      // The skid: a smear down the road behind him, wet, then the pool round him
      if (!air) {
        const bx = landX + F * skidAt(s);
        const x0 = Math.min(landX, bx), x1 = Math.max(landX, bx);
        ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x0, gLand - 3, x1 - x0, 3);
        ctx.fillStyle = '#5B0B0B'; for (let k = x0; k < x1; k += 6) ctx.fillRect(k, gLand - 4 + ((k / 6) % 2), 3, 1);
        const pool = clamp01((s - 18) / 50);
        if (pool > 0) drawBloodPool(ctx, bx, gRest + 1, Math.round(10 + pool * 26), 201, { dx: F * 0.6 });
      }
      // Him: in the air, then down and sliding on his face to a stop
      if (air) { const a = flight(state, d, t); him(ctx, state, d, weapon, a.mx, a.my, a.rot, 'scream'); }
      else {
        const bx = landX + F * skidAt(s), gb = groundAt(state, d, bx);
        // (face down, lying on his gun arm: what's under him is under the road)
        ctx.save(); ctx.beginPath(); ctx.rect(bx - 80, gb - 120, 160, 121); ctx.clip();
        if (charred) ctx.filter = charred;
        him(ctx, state, d, weapon, bx, groundAt(state, d, bx) - 15, F * PI / 2 + (s < 8 ? Math.sin(s) * 0.06 : 0), 'dead', { isGrounded: true });
        ctx.restore();
      }
      // The ride: cartwheeling after him, and down on top of him
      const k = clamp01(t / CRASH_PILE);
      const vx = d.x + (restX - d.x) * (1 - (1 - k) * (1 - k));
      const vy = d.y - 16 + ((gRest - 26) - (d.y - 16)) * k - Math.sin(k * PI) * 70;
      const settle = t > CRASH_PILE && t < CRASH_PILE + 10 ? Math.sin((t - CRASH_PILE) * 0.9) * 0.08 * (1 - (t - CRASH_PILE) / 10) : 0;
      const turn = t < CRASH_PILE ? t * 0.6 : (CRASH_PILE * 0.6) + (1 - Math.exp(-(t - CRASH_PILE) / 30)) * 18;
      if (!(moto && blast >= 0 && blast < 6)) drawRide(ctx, d, vx, vy, F * (k * PI * 3 + settle), f, turn, charred);
      // The chopper going up: the flash, the ball of it, and then it burning there, on him
      if (moto && blast >= 0) {
        if (blast < 30) {
          steppedGlow(ctx, restX, gRest - 24, 60 + blast * 2, '#F97316', 0.55 * (1 - blast / 30), 0, 5);
          drawFireball(ctx, restX, gRest - 26 - blast * 0.8, 14 + Math.min(blast, 8) * 3.5 - Math.max(0, blast - 16) * 1.2, f, { seed: 9, heat: blast < 6 ? 1 : 0 });
        }
        drawFire(ctx, restX, gRest + 2, 76, 54 * clamp01(blast / 6) * (1 - clamp01((blast - 60) / 30) * 0.4), f, { seed: 3, smoke: 0.5 });
        for (let q = 0; q < 3; q++) { const u = ((blast + q * 16) % 48) / 48; pixelBlob(ctx, restX - 10 + q * 10 - u * 14, gRest - 50 - u * 70, 10 + u * 12, 8 + u * 9, `rgba(28, 25, 23, ${(0.6 * (1 - u)).toFixed(3)})`); }
      }
      break;
    }
    case 'jetski': {
      const sea = d.y;
      const [k1, k2] = CRASH_SKIPS;
      const inAt = k1.t + k2.t, inX = landX + F * (k1.dx + k2.dx);
      // The ski: over on its back, and floating there, bobbing
      {
        const k = clamp01(t / 36);
        const vx = d.x + F * 120 * (1 - (1 - k) * (1 - k)), vy = sea - 16 + 14 * k - Math.sin(k * PI) * 50 + (k >= 1 ? Math.sin(f * 0.09) * 1.5 : 0);
        drawRide(ctx, d, vx, vy, F * k * PI * (k >= 1 ? 1 : 1) + (k >= 1 ? Math.sin(f * 0.06) * 0.05 : 0), f, 0);
      }
      // (rings out on the water where he touched)
      for (const [at, rx] of [[0, landX], [k1.t, landX + F * k1.dx], [inAt, inX]] as const) {
        const q = (s - at) / 22;
        if (q > 0 && q < 1) { ctx.strokeStyle = `rgba(224, 242, 254, ${(0.8 * (1 - q)).toFixed(3)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(rx, sea, 8 + q * 40, 2 + q * 5, 0, 0, PI * 2); ctx.stroke(); }
        if (q > 0 && q < 0.4) for (let i = 0; i < 6; i++) { ctx.fillStyle = '#E0F2FE'; ctx.fillRect(Math.round(rx + (i - 2.5) * 6), Math.round(sea - 4 - Math.sin((i + 1) * 1.3) * 14 * (1 - q * 2.5)), 3, 3); }
      }
      if (air) { const a = flight(state, d, t); him(ctx, state, d, weapon, a.mx, a.my, a.rot, 'scream'); break; }
      if (s < inAt) {
        // Skipping off it like a stone, flat out, spinning
        const first = s < k1.t, k = first ? s / k1.t : (s - k1.t) / k2.t, h = first ? k1.h : k2.h;
        const sx = landX + F * (first ? k1.dx * k : k1.dx + k2.dx * k);
        him(ctx, state, d, weapon, sx, sea - 12 - Math.sin(k * PI) * h, F * (PI / 2 + Math.sin(s * 0.7) * 0.25), 'scream');
        break;
      }
      // In, head first, legs up out of it, kicking, then under
      const u = s - inAt;
      const turnK = clamp01(u / 8), sink = Math.min(80, Math.max(0, u - 30) * 0.5);
      ctx.save(); ctx.beginPath(); ctx.rect(inX - 120, sea - 200, 240, 202); ctx.clip();
      him(ctx, state, d, weapon, inX, sea + 2 + sink, F * (PI / 2 + turnK * PI / 2) + (u > 8 && u < 70 ? Math.sin(u * 0.5) * 0.08 : 0), 'dead');
      ctx.restore();
      // (the water round his legs, and bubbles coming up)
      ctx.fillStyle = 'rgba(224, 242, 254, 0.8)'; ctx.fillRect(inX - 14, sea - 1, 28, 2);
      for (let b = 0; b < 3; b++) { const q = ((u + b * 9) % 26) / 26; if (u > 10) { ctx.strokeStyle = '#E0F2FE'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(inX + (b - 1) * 7, sea - q * 6, 1.5 + q * 1.5, 0, PI * 2); ctx.stroke(); } }
      break;
    }
    case 'ski': {
      // His skis, stood up where he came off them
      plantedSkis(ctx, d.x, groundAt(state, d, d.x));
      if (air) { const a = flight(state, d, t); him(ctx, state, d, weapon, a.mx, a.my, a.rot, 'scream', { skiing: false }); break; }
      // Into the snow and rolling on in it: a snowball, bigger as it goes, his boots and a hand out of it going round
      const r0 = Math.min(s, CRASH_BALL_STOP);
      const dist = 130 * (1 - (1 - r0 / CRASH_BALL_STOP) ** 2);
      const r = 14 + r0 * 0.34;
      const bx = landX + F * dist, by = groundAt(state, d, bx) - r + 3;
      const spin = F * dist / r;
      if (s < 5) him(ctx, state, d, weapon, landX, gLand - 10, F * PI / 2, 'scream', { skiing: false });
      // (a trail of it flattened behind, packed)
      ctx.fillStyle = '#E2E8F0'; ctx.fillRect(Math.min(landX, bx), gLand - 2, Math.abs(bx - landX), 3);
      const twitch = s > CRASH_BALL_STOP && (s - CRASH_BALL_STOP) % 24 < 3 ? 0.25 : 0;
      for (const [a, len] of [[spin + 0.2, 0.92], [spin + 0.55, 0.92]] as const) boot(ctx, bx + Math.cos(a - PI / 2) * r * len, by + Math.sin(a - PI / 2) * r * len, a + twitch);
      snowball(ctx, bx, by, r, spin);
      // (his hand out of it too, the glove up, and his gun hand)
      const ha = spin + PI * 1.2;
      ctx.save(); ctx.translate(bx + Math.cos(ha) * r * 0.95, by + Math.sin(ha) * r * 0.95); ctx.rotate(ha + PI / 2);
      ink(ctx, () => ctx.roundRect(-3, -8, 6, 9, 2), '#E8A87C', 1);
      ink(ctx, () => ctx.arc(0, -9, 3.6, 0, PI * 2), '#E8A87C', 1);
      ctx.restore();
      break;
    }
  }
};
