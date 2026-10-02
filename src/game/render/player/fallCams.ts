import type { GameState } from '../../core/state';
import type { MeatheadDeath } from '../../player/deathAnim';
import { MEATHEAD_DEATH_FRAMES, FALL_HIT, SPACE_OUT } from '../../player/deathAnim';
import { body } from './deathAnim';
import type { DeathFace } from './deathFace';
import { bandedGradient, checker, brickPattern, steppedGlow, pixelBlob, hazeBands } from '../pixelArt';

// The falls: the kill cam cutting to the bottom of whatever he's gone down (see player/deathAnim), screen space, over
// everything. Quick, and nasty: wedged head first in a crevasse and frozen there, onto the rebar in a dug-up street,
// splattered in an alley (and the rats), into a pit of crude (and then it goes up), folded backwards over a rock in an
// arroyo (and the vultures), onto the rocks under Alcatraz (and the crab), down into the old fort's dungeon (and its
// last tenant has a laugh about it). Painted like the backdrops: banded, dithered, stepped, no smooth gradients.

type Ctx = CanvasRenderingContext2D;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const P = 2;
const snap = (v: number) => Math.floor(v / P) * P;

/** Him in the kill cam: his middle at (x, y), turned rot, s times life size, the face given. */
const him = (ctx: Ctx, state: GameState, d: MeatheadDeath, x: number, y: number, rot: number, s: number, face: DeathFace, extra: Record<string, unknown> = {}) => {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(rot);
  body(ctx, { ...state, blocks: [], camera: { x: 0, y: 0 } } as GameState, { ...d, x: 0, y: 32 }, state.player.currentWeapon, { deathFace: face, ...extra });
  ctx.restore();
};

/** Coming down: from above the top of the screen to y by FALL_HIT. */
const dropTo = (t: number, y: number) => (t >= FALL_HIT ? y : -160 + (y + 160) * (t / FALL_HIT) ** 2);

/** A pool of blood spreading at (x, y), r wide: dark, a wet highlight, a ragged dithered rim. */
export const pool = (ctx: Ctx, x: number, y: number, r: number) => {
  if (r < 2) return;
  const h = Math.max(3, r * 0.16);
  ctx.fillStyle = '#5B0B0B'; ctx.beginPath(); ctx.ellipse(x, y, r, h, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.ellipse(x - r * 0.08, y - h * 0.15, r * 0.82, h * 0.7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(254, 202, 202, 0.45)'; ctx.fillRect(snap(x - r * 0.4), snap(y - h * 0.4), snap(r * 0.3), P);
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; ctx.fillStyle = '#5B0B0B'; ctx.fillRect(snap(x + Math.cos(a) * (r + 3)), snap(y + Math.sin(a) * (h + 1)), P, P); }
};

/** Blood splashed on a surface round (x, y): drops and streaks flung out from it, r far. */
export const splatter = (ctx: Ctx, x: number, y: number, r: number, seed: number, flat = 1) => {
  for (let k = 0; k < 22; k++) {
    const a = hash(seed + k) * Math.PI * 2, d = r * (0.3 + hash(seed + k * 3) * 0.7);
    const sx = x + Math.cos(a) * d, sy = y + Math.sin(a) * d * flat, s = 2 + hash(seed + k * 7) * 5;
    ctx.fillStyle = k % 3 ? '#7F1D1D' : '#991B1B';
    ctx.fillRect(snap(sx), snap(sy), snap(s) + P, snap(s * 0.7) + P);
    if (k % 4 === 0) { ctx.fillStyle = '#5B0B0B'; ctx.fillRect(snap(sx + s), snap(sy + s * 0.5), P, snap(4 + hash(k) * 10)); }
  }
};

/**
 * A wall up one side of the screen (side -1 the left, 1 the right), its inside edge at x = edge(y): clipped to it,
 * `paint` fills it, then a lit rim along the edge and a dithered shadow just inside it.
 */
export const wall = (ctx: Ctx, side: number, W: number, H: number, edge: (y: number) => number, paint: () => void, rim: string, shade: string) => {
  ctx.save();
  ctx.beginPath(); ctx.moveTo(side < 0 ? 0 : W, 0);
  for (let y = 0; y <= H + P * 4; y += P * 4) ctx.lineTo(snap(edge(y)), y);
  ctx.lineTo(side < 0 ? 0 : W, H + P * 4); ctx.closePath(); ctx.clip();
  paint();
  for (let y = 0; y < H; y += P) {
    const x = snap(edge(y));
    ctx.fillStyle = rim; ctx.fillRect(side < 0 ? x - P * 2 : x, y, P * 2, P);
    if ((y / P) % 2 === 0) { ctx.fillStyle = shade; ctx.fillRect(side < 0 ? x - P * 5 : x + P * 3, y, P, P); }
  }
  ctx.restore();
};

/** Strata across (x0, w): bands of the colours given (cycling), each `thick` about, seams dithered. */
export const strata = (ctx: Ctx, x0: number, w: number, H: number, colors: string[], thick: number, seed: number) => {
  let y = 0, i = 0;
  while (y < H) {
    const h = snap(thick * (0.6 + hash(seed + i) * 0.9));
    ctx.fillStyle = colors[i % colors.length]; ctx.fillRect(x0, y, w, h + P);
    if (y > 0) checker(ctx, x0, y - P, w, P, colors[i % colors.length], i % 2);
    y += h; i++;
  }
};

export const drawFallCam = (ctx: Ctx, state: GameState, W: number, H: number) => {
  const d = state.meatheadDeath;
  if (!d || state.deathTimer <= 0 || !(d.kind.startsWith('fall_') || d.kind === 'space')) return;
  const t = Math.min(state.deathScene?.t ?? 9999, MEATHEAD_DEATH_FRAMES[d.kind]);
  const f = state.frame, hit = t >= FALL_HIT, since = t - FALL_HIT;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  switch (d.kind) {
    case 'fall_crevasse': crevasse(ctx, state, d, t, f, hit, since, W, H); break;
    case 'fall_trench': trench(ctx, state, d, t, f, hit, since, W, H); break;
    case 'fall_alley': alley(ctx, state, d, t, f, hit, since, W, H); break;
    case 'fall_crude': crude(ctx, state, d, t, f, hit, since, W, H); break;
    case 'fall_arroyo': arroyo(ctx, state, d, t, f, hit, since, W, H); break;
    case 'fall_rocks': rocks(ctx, state, d, t, f, hit, since, W, H); break;
    case 'fall_dungeon': dungeon(ctx, state, d, t, f, hit, since, W, H); break;
    case 'space': space(ctx, state, d, t, f, W, H); break;
  }
  // (and it dims on him at the end, for the message)
  const out = clamp01((t - (MEATHEAD_DEATH_FRAMES[d.kind] - 20)) / 20);
  if (out > 0) hazeBands(ctx, 0, 0, W, H, '#000000', out * 0.5, out * 0.7, 4);
  ctx.restore();
};

type Scene = (ctx: Ctx, state: GameState, d: MeatheadDeath, t: number, f: number, hit: boolean, since: number, W: number, H: number) => void;

// ---------------------------------------------------------------------------

/**
 * Artie's crevasses: glacier ice in its layers (old snow, blue ice, grit), snow overhanging the lips up top, the crack
 * narrowing into the black. Him head first down it, scraping the walls red as he goes, wedged where it's too tight,
 * blood running down the ice under him and freezing in red icicles; legs kicking, slowing, frosting over.
 */
const crevasse: Scene = (ctx, state, d, t, f, hit, since, W, H) => {
  const cx = W / 2, wedge = 450;
  const hw = (y: number) => Math.max(26, 185 - y * 0.26);
  const edge = (side: number) => (y: number) => cx + side * (hw(y) + (hash(Math.floor(y / 24) + side * 7) - 0.5) * 18 + Math.sin(y * 0.05 + side) * 6);
  // The crack itself: daylight up top, falling away into the dark
  bandedGradient(ctx, 0, 0, W, H, ['#E0F2FE', '#7DD3FC', '#1D4ED8', '#172554', '#020617', '#000000'], 18);
  // The walls: glacier ice, lit through from the crack (glowing pale at its face, deepening to dark blue back into
  // it), old layers bowed through it, big fractured planes, trapped bubbles, a band of grit
  const glow = ['#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8', '#0EA5E9', '#0369A1', '#0C4A6E', '#082F49'];
  for (const side of [-1, 1]) {
    const e = edge(side);
    wall(ctx, side, W, H, e, () => {
      // (in from the face in steps, each step's seam dithered, following the face's line)
      for (let y = 0; y < H; y += P) {
        const ex = e(y);
        for (let b = 0; b < glow.length; b++) {
          const dIn = 6 + b * b * 7 + Math.sin(y * 0.03 + b + side) * 4;
          const x = snap(side < 0 ? ex - dIn : ex + dIn);
          ctx.fillStyle = glow[b];
          if (side < 0) ctx.fillRect(0, y, x, P); else ctx.fillRect(x, y, W - x, P);
          if ((y / P + b) % 2 === 0) ctx.fillRect(side < 0 ? x : x - P, y, P, P);
        }
      }
      // (the old layers, bowed, faint)
      for (let k = 0; k < 12; k++) {
        const y0 = 40 + k * 46 + hash(k + side) * 20;
        ctx.fillStyle = k % 3 === 0 ? 'rgba(100, 116, 139, 0.45)' : 'rgba(240, 249, 255, 0.28)';
        for (let x = 0; x < W; x += P * 2) ctx.fillRect(x, snap(y0 + Math.sin(x * 0.012 + k) * 14 + (side < 0 ? -x : x - W) * 0.04), P * 2, P);
      }
      // (big fractured planes, a shade lighter, their edges catching the light)
      for (let k = 0; k < 6; k++) {
        const y = 60 + k * 90 + hash(k * 9) * 40, x = side < 0 ? 40 + hash(k) * 140 : W - 40 - hash(k) * 140;
        ctx.fillStyle = 'rgba(224, 242, 254, 0.14)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + side * 70, y + 20); ctx.lineTo(x + side * 50, y + 80); ctx.lineTo(x - side * 10, y + 60); ctx.fill();
        ctx.strokeStyle = 'rgba(240, 249, 255, 0.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + side * 70, y + 20); ctx.stroke();
      }
      // (bubbles caught in it)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; for (let k = 0; k < 40; k++) ctx.fillRect(snap(side < 0 ? hash(k + 3) * 330 : W - hash(k + 3) * 330), snap(hash(k * 7 + side) * H), P, P);
      // (deeper is darker: the light doesn't get down there)
      hazeBands(ctx, 0, H * 0.3, W, H * 0.7, '#020617', 0, 0.7, 7);
    }, '#F0F9FF', '#082F49');
  }
  // Snow over the lips, its underside in shadow, icicles off it
  for (const side of [-1, 1]) {
    const lip = edge(side)(20);
    for (let x = 0; x < 230; x += P) {
      const sx = side < 0 ? lip - x : lip + x, top = snap(4 + Math.sin(x * 0.07) * 4), bot = snap(26 + Math.sin(x * 0.05 + 1) * 6 + (x < 30 ? 6 : 0));
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(snap(sx), top, P, bot - top);
      ctx.fillStyle = '#BFDBFE'; ctx.fillRect(snap(sx), bot - P * 2, P, P * 2);
    }
    for (let k = 0; k < 6; k++) { const x = lip + side * (6 + k * 34), len = 10 + hash(k + side) * 24; ctx.fillStyle = '#E0F2FE'; ctx.beginPath(); ctx.moveTo(x - 4, 28); ctx.lineTo(x + 4, 28); ctx.lineTo(x, 28 + len); ctx.fill(); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(snap(x - 2), 28, P, snap(len * 0.6)); }
  }
  // Where he's scraped down the walls on the way: smears, red on the ice
  const by = dropTo(t, wedge);
  for (const side of [-1, 1]) {
    const e = edge(side);
    for (let y = 80; y < Math.min(by, wedge - 30); y += P * 2) {
      if (hash(Math.floor(y / 40) + side * 11) <= 0.3) continue;
      const x = snap(e(y)) + (side < 0 ? -P * 5 : P);
      const wdt = P * (2 + Math.floor(hash(y + side) * 3));
      ctx.fillStyle = (y / P) % 3 ? '#991B1B' : '#7F1D1D'; ctx.fillRect(x, y, wdt, P * 2);
      if (hash(y * 3 + side) > 0.9) { ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x + (side < 0 ? -P * 2 : wdt), y, P, snap(6 + hash(y) * 16)); }
    }
  }
  // Him: head first, wedged; kicking, slowing, still
  const kick = hit ? Math.sin(since * 0.9) * 0.14 * (1 - clamp01(since / 55)) : Math.sin(t * 0.5) * 0.25;
  const frost = clamp01((since - 45) / 35);
  ctx.save();
  if (frost > 0) ctx.filter = `saturate(${1 - frost * 0.55}) brightness(${1 + frost * 0.18}) hue-rotate(${-frost * 12}deg)`;
  him(ctx, state, d, cx + (hit ? 0 : Math.sin(t * 0.4) * 12), by - (hit && since < 4 ? 4 - since : 0), Math.PI + kick, 1.6, !hit ? 'scream' : since < 45 ? 'agony' : 'frozen');
  ctx.restore();
  if (hit) {
    // The impact: blood up the walls either side of him, soaking into the ice round him
    for (const side of [-1, 1]) {
      ctx.fillStyle = 'rgba(153, 27, 27, 0.35)'; ctx.beginPath(); ctx.ellipse(cx + side * 52, wedge + 20, 26, 70, side * 0.2, 0, Math.PI * 2); ctx.fill();
      checker(ctx, cx + side * 52 - 30, wedge - 60, 60, 160, 'rgba(127, 29, 29, 0.3)');
    }
    splatter(ctx, cx - 44, wedge + 20, 70, 3, 1.4); splatter(ctx, cx + 44, wedge + 20, 70, 9, 1.4); splatter(ctx, cx, wedge - 40, 60, 15, 1);
    // ...running down the ice under him, freezing into red icicles at the ends
    for (let k = 0; k < 10; k++) {
      const x = snap(cx + (k - 4.5) * 8 + (hash(k) - 0.5) * 6), y0 = wedge + 50 - Math.abs(k - 4.5) * 4, len = Math.min(70 + hash(k + 2) * 90, since * (1.4 + hash(k) * 1.4));
      ctx.fillStyle = '#991B1B'; ctx.fillRect(x, y0, P * 2, snap(len));
      ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x + P, y0, P, snap(len));
      if (since > 40) { const ic = clamp01((since - 40) / 30) * 10; ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.moveTo(x - 1, y0 + len); ctx.lineTo(x + 5, y0 + len); ctx.lineTo(x + 2, y0 + len + ic); ctx.fill(); }
    }
    // (drops falling away into the black)
    if (since > 6) for (let k = 0; k < 4; k++) { const q = (since * 3 + k * 37) % 120; ctx.fillStyle = '#991B1B'; ctx.fillRect(snap(cx - 20 + k * 13), snap(wedge + 80 + q * 1.4), P * 2, P * 3); }
    // Rime over him as it gets him
    if (frost > 0) for (let k = 0; k < 26; k++) if (hash(k * 7) < frost) {
      const x = snap(cx - 32 + hash(k) * 64), y = snap(wedge - 50 + hash(k + 3) * 100);
      ctx.fillStyle = '#F0F9FF'; ctx.fillRect(x, y, P, P); if (k % 3 === 0) { ctx.fillRect(x - P, y, P * 3, 1); ctx.fillRect(x, y - P, 1, P * 3); }
    }
  }
  void f;
};

/** Barry's dug-up streets: the trench's cut walls (asphalt, base, dirt), a burst main hosing everything, rebar up out of
 * the slab; him onto it on his back, the bars out through his front. */
const trench: Scene = (ctx, state, d, t, f, hit, since, W, H) => {
  const cx = W / 2, floor = 520;
  bandedGradient(ctx, 0, 0, W, H, ['#4A3B30', '#2A211B', '#120D0A', '#070504'], 12);
  // A strip of night and a streetlamp's glow up through the cut
  bandedGradient(ctx, 200, 0, W - 400, 34, ['#1E293B', '#334155'], 3);
  steppedGlow(ctx, 520, 0, 120, '#FDE68A', 0.25, 0, 5);
  for (const side of [-1, 1]) {
    const x = side < 0 ? 200 : W - 200;
    wall(ctx, side, W, H, () => x, () => {
      strata(ctx, 0, W, H, ['#5B4636', '#4A3828', '#6B5240', '#3F2F22'], 40, side);
      ctx.fillStyle = '#18181B'; ctx.fillRect(0, 0, W, 34); checker(ctx, 0, 34, W, P, '#18181B'); // the asphalt
      ctx.fillStyle = '#78716C'; ctx.fillRect(0, 36, W, 18); checker(ctx, 0, 54, W, P, '#78716C', 1); // the gravel base
      for (let k = 0; k < 40; k++) { ctx.fillStyle = k % 3 ? '#8A8178' : '#57534E'; ctx.fillRect(snap(hash(k + side) * W), snap(60 + hash(k * 3 + side) * (H - 60)), P * (2 + (k % 3)), P * 2); }
      hazeBands(ctx, 0, 100, W, H - 100, '#000000', 0, 0.55, 6);
    }, '#8A7060', '#1C1410');
  }
  // The slab, cracked; the rebar
  bandedGradient(ctx, 200, floor, W - 400, H - floor, ['#78716C', '#57534E', '#3F3A36'], 4);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(200, floor, W - 400, P);
  ctx.fillStyle = '#292524'; for (let k = 0; k < 6; k++) ctx.fillRect(snap(240 + k * 60 + hash(k) * 20), floor + P * 2, P, snap(10 + hash(k + 1) * 30));
  const bars = [-64, -26, 12, 48, 84];
  for (const bx of bars) {
    const top = floor - 136 + (bx % 3) * 8, x = snap(cx + bx) - 2;
    ctx.fillStyle = '#7C2D12'; ctx.fillRect(x, top, 4, floor - top); ctx.fillStyle = '#C2410C'; ctx.fillRect(x, top, P, floor - top);
    ctx.fillStyle = '#431407'; for (let y = top; y < floor; y += 8) ctx.fillRect(x, y, 4, P);
  }
  // The burst main, gushing across
  ctx.fillStyle = '#52525B'; ctx.fillRect(W - 214, 296, 70, 24); ctx.fillStyle = '#71717A'; ctx.fillRect(W - 214, 296, 70, P * 2); ctx.fillStyle = '#3F3F46'; ctx.fillRect(W - 220, 292, 10, 32);
  for (let k = 0; k < 22; k++) { const q = ((f * 4 + k * 23) % 170) / 170; const r = 6 - q * 3; ctx.fillStyle = k % 3 ? 'rgba(191, 219, 254, 0.8)' : 'rgba(255, 255, 255, 0.9)'; ctx.fillRect(snap(W - 222 - q * 240), snap(306 + q * q * 160 + Math.sin(k) * 7), snap(r) + P, snap(r * 0.7) + P); }
  const by = dropTo(t, floor - 100);
  if (hit) { pool(ctx, cx, floor + 4, Math.min(160, since * 3)); splatter(ctx, cx, floor - 6, 120, 21, 0.25); }
  him(ctx, state, d, cx, by - (hit && since < 8 && since % 4 < 2 ? 2 : 0), -d.facing * Math.PI / 2, 2, hit && since > 22 ? 'dead' : 'scream');
  if (hit) for (const bx of bars.slice(1, 4)) {
    const x = snap(cx + bx) - 2;
    ctx.fillStyle = '#7C2D12'; ctx.fillRect(x, by - 74, 4, 38); ctx.fillStyle = '#C2410C'; ctx.fillRect(x, by - 74, P, 38);
    ctx.fillStyle = '#B91C1C'; ctx.fillRect(x - 3, by - 42, 10, 6); ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x, by - 74, 4, 14); ctx.fillRect(x - 1, by - 60, P, 10 + Math.min(14, since));
  }
};

/** Barry's rooftop alleys: brick, a fire escape, a dumpster; a sliver of city sky and a lit window. Him flat on the
 * pavement, splattered across it, and the rats in from the dark for a piece. */
const alley: Scene = (ctx, state, d, t, f, hit, since, W, H) => {
  const cx = W / 2, floor = 500;
  bandedGradient(ctx, 0, 0, W, floor, ['#1E1B4B', '#312E81', '#4C1D95', '#1C1917'], 12);
  for (const side of [-1, 1]) {
    wall(ctx, side, W, H, () => (side < 0 ? 220 : W - 220), () => {
      ctx.fillStyle = brickPattern(ctx, 'alley-' + side, 24, 10, side < 0 ? ['#7F1D1D', '#991B1B'] : ['#7C2D12', '#9A3412'], '#292524'); ctx.fillRect(0, 0, W, H);
      // (windows, one lit)
      const wx = side < 0 ? 70 : W - 150;
      for (const wy of [80, 230]) { ctx.fillStyle = '#1C1917'; ctx.fillRect(wx - 4, wy - 4, 88, 108); ctx.fillStyle = wy === 80 && side > 0 ? '#FDE68A' : '#0F172A'; ctx.fillRect(wx, wy, 80, 100); ctx.fillStyle = '#1C1917'; ctx.fillRect(wx + 38, wy, 4, 100); ctx.fillRect(wx, wy + 48, 80, 4); }
      hazeBands(ctx, 0, 0, W, H, '#0C0A09', 0.15, 0.7, 8);
    }, '#B45309', '#0C0A09');
  }
  steppedGlow(ctx, W - 110, 130, 120, '#FDE68A', 0.18, 0, 5);
  // The fire escape down the right wall
  ctx.fillStyle = '#18181B';
  for (const y of [160, 320]) { ctx.fillRect(W - 300, y, 90, P * 3); for (let x = W - 300; x < W - 210; x += 8) ctx.fillRect(x, y - 24, P, 24); ctx.fillRect(W - 300, y - 24, 90, P); }
  ctx.save(); ctx.translate(W - 290, 166); ctx.rotate(0.95); ctx.fillRect(0, 0, 190, P * 2); for (let k = 0; k < 9; k++) ctx.fillRect(k * 20, -6, P, 12); ctx.restore();
  // The pavement, the dumpster
  bandedGradient(ctx, 0, floor, W, H - floor, ['#3F3F46', '#27272A', '#18181B'], 4);
  ctx.fillStyle = '#52525B'; ctx.fillRect(0, floor, W, P);
  ctx.fillStyle = '#14532D'; ctx.fillRect(230, floor - 70, 110, 70); ctx.fillStyle = '#166534'; ctx.fillRect(230, floor - 70, 110, P * 2); ctx.fillStyle = '#052E16'; ctx.fillRect(226, floor - 76, 118, 8); ctx.fillRect(250, floor - 50, 70, P);
  if (hit) {
    splatter(ctx, cx, floor - 2, 170, 33, 0.18); splatter(ctx, cx + 30, floor - 40, 70, 41, 1);
    pool(ctx, cx, floor + 6, Math.min(120, 40 + since * 2));
  }
  const yy = hit ? floor - 12 : dropTo(t, floor - 40);
  ctx.save(); if (hit) { ctx.translate(cx, yy); ctx.scale(1.25, 0.34); ctx.translate(-cx, -yy); }
  him(ctx, state, d, cx, yy, hit ? -d.facing * Math.PI / 2 : Math.sin(t * 0.5) * 0.4, 2, hit ? 'dead' : 'scream');
  ctx.restore();
  // The rats: in from the dark, and off with a piece of him
  if (since > 30) for (let k = 0; k < 2; k++) {
    const q = since - 30 - k * 10; if (q < 0) continue;
    const back = q > 28, rx = back ? W - 50 + (q - 28) * 5 - (k ? 30 : 0) : W + 40 - Math.min(q, 28) * 6 - k * 30, ry = floor - 2;
    ctx.save(); ctx.translate(rx, ry); if (back) ctx.scale(-1, 1);
    ctx.fillStyle = '#44403C'; ctx.beginPath(); ctx.ellipse(0, -7, 14, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(-14, -9, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#57534E'; ctx.fillRect(-6, -13, 12, P);
    ctx.fillStyle = '#FDA4AF'; ctx.fillRect(-22, -9, P, P); ctx.fillRect(-10, -15, P * 2, P * 2);
    ctx.strokeStyle = '#A8A29E'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(14, -7); ctx.quadraticCurveTo(26, -11, 34, -3); ctx.stroke();
    ctx.fillStyle = '#EF4444'; ctx.fillRect(-18, -11, P, P);
    const step = Math.floor(q / 3) % 2; ctx.fillStyle = '#292524'; ctx.fillRect(-8 + step * 3, -2, P, 2); ctx.fillRect(6 - step * 3, -2, P, 2);
    if (back) { ctx.fillStyle = '#991B1B'; ctx.beginPath(); ctx.ellipse(-25, -6, 7, 4, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#F5F5F4'; ctx.fillRect(-30, -7, 4, P); }
    ctx.restore();
  }
};

/** Oscar's crude pits: the field at dusk (a derrick, the flare stack), the pit black with a rainbow sheen; him in it,
 * thrashing, going under black; a burp of it; the flare drips in and the lot goes up. */
const crude: Scene = (ctx, state, d, t, f, hit, since, W, H) => {
  const cx = W / 2, surf = 400;
  bandedGradient(ctx, 0, 0, W, surf, ['#1E1B4B', '#7C2D12', '#EA580C', '#FDBA74'], 14);
  steppedGlow(ctx, 300, surf, 90, '#FDE68A', 0.6, 0, 5);
  // Far derricks in silhouette, and the near derrick
  ctx.fillStyle = '#431407'; for (let k = 0; k < 5; k++) { const x = 60 + k * 170; ctx.beginPath(); ctx.moveTo(x - 14, surf); ctx.lineTo(x, surf - 70 - (k % 2) * 20); ctx.lineTo(x + 14, surf); ctx.fill(); }
  ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(90, surf); ctx.lineTo(150, 80); ctx.lineTo(210, surf); ctx.moveTo(108, 300); ctx.lineTo(192, 300); ctx.moveTo(122, 200); ctx.lineTo(178, 200); ctx.moveTo(108, 300); ctx.lineTo(178, 200); ctx.moveTo(192, 300); ctx.lineTo(122, 200); ctx.stroke();
  ctx.fillStyle = '#1C1917'; ctx.fillRect(640, 120, 14, surf - 120); ctx.fillRect(632, 116, 30, 8);
  // The flare
  const fl = 70 + Math.sin(f * 0.4) * 8;
  steppedGlow(ctx, 647, 90, 80, '#FB923C', 0.3, 0, 4);
  ctx.fillStyle = '#F97316'; ctx.beginPath(); ctx.moveTo(634, 118); ctx.quadraticCurveTo(647, 118 - fl, 660, 118); ctx.fill();
  ctx.fillStyle = '#FDE047'; ctx.beginPath(); ctx.moveTo(640, 118); ctx.quadraticCurveTo(647, 118 - fl * 0.55, 654, 118); ctx.fill();
  // The pit: black, a slow rainbow sheen on it
  bandedGradient(ctx, 0, surf, W, H - surf, ['#1C1410', '#0A0806', '#000000'], 6);
  ctx.fillStyle = '#3F3A36'; ctx.fillRect(0, surf, W, P);
  for (let k = 0; k < 9; k++) { const x = snap(40 + k * 90 + Math.sin(f * 0.04 + k) * 12), y = surf + P * 2 + (k % 3) * P * 3; const c = ['rgba(167, 139, 250, 0.4)', 'rgba(52, 211, 153, 0.35)', 'rgba(251, 191, 36, 0.35)'][k % 3]; ctx.fillStyle = c; ctx.fillRect(x, y, 46, P); checker(ctx, x + 46, y, 12, P, c); }
  // Him: in, and under, the crude creeping up him
  const sink = hit ? Math.min(140, since * 2.4) : 0;
  const by = hit ? surf + sink - 30 : dropTo(t, surf - 30);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, surf + 2); ctx.clip();
  if (hit) ctx.filter = `brightness(${1 - clamp01(since / 26) * 0.85})`;
  him(ctx, state, d, cx + (hit ? Math.sin(since * 0.8) * 6 : 0), by, hit ? Math.sin(since * 0.5) * 0.25 : 0, 2, 'scream');
  ctx.restore();
  // (rings out from where he went in)
  if (hit) for (let r = 0; r < 3; r++) { const q = ((since * 1.2 + r * 20) % 60) / 60; ctx.strokeStyle = `rgba(120, 113, 108, ${0.7 * (1 - q)})`; ctx.lineWidth = P; ctx.beginPath(); ctx.ellipse(cx, surf + 2, 20 + q * 120, 3 + q * 8, 0, 0, Math.PI * 2); ctx.stroke(); }
  if (hit && since < 8) for (let k = 0; k < 16; k++) { ctx.fillStyle = '#0A0806'; ctx.fillRect(snap(cx + (hash(k) - 0.5) * 160), snap(surf - since * (6 + hash(k + 2) * 9) + since * since * 0.5), P * 3, P * 3); }
  // (the burp)
  if (since > 55 && since < 66) { const q = (since - 55) / 11; ctx.fillStyle = '#0A0806'; ctx.beginPath(); ctx.arc(cx + 10, surf, 6 + q * 12, Math.PI, 0); ctx.fill(); ctx.fillStyle = 'rgba(167, 139, 250, 0.5)'; ctx.fillRect(snap(cx + 2), snap(surf - 6 - q * 10), P * 2, P); }
  // The flare drips; the pit goes up
  if (since > 62 && since < 76) { const q = (since - 62) / 14, y = snap(125 + q * q * (surf - 125)); ctx.fillStyle = '#F97316'; ctx.fillRect(644, y - 6, P * 2, 6); ctx.fillStyle = '#FDE047'; ctx.fillRect(644, y, P * 3, P * 4); }
  if (since >= 76) {
    const k = clamp01((since - 76) / 12), die = 1 - clamp01((since - 115) / 25);
    steppedGlow(ctx, 647 - 300 * k, surf, 360 * k + 1, '#F97316', 0.5 * die, 0, 5);
    for (let i = 0; i < 30; i++) {
      const xx = W + 20 - (i / 29) * (W + 40) * k, hgt = (60 + hash(i) * 130) * die * (0.75 + 0.25 * Math.sin(f * 0.6 + i));
      for (const [col, sc] of [['#B91C1C', 1.1], ['#F97316', 0.85], ['#FDE047', 0.5]] as const) {
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(xx - 24 * sc, surf + 4); ctx.quadraticCurveTo(xx - 10 * sc, surf - hgt * sc * 0.6, xx + Math.sin(f * 0.5 + i) * 6, surf - hgt * sc); ctx.quadraticCurveTo(xx + 12 * sc, surf - hgt * sc * 0.6, xx + 24 * sc, surf + 4); ctx.fill();
      }
    }
    for (let i = 0; i < 6; i++) { const q = ((since * 1.5 + i * 25) % 80) / 80; pixelBlob(ctx, 100 + i * 120 + Math.sin(i) * 30, surf - 150 - q * 220, 40 + q * 30, 22 + q * 16, `rgba(28, 25, 23, ${(0.7 * (1 - q) * die).toFixed(3)})`); }
  }
};

/** Dale's arroyos: a slot of red rock in its layers, a strip of desert sky, sand and scrub at the bottom; him bent
 * backwards over a rock, the vultures circling down onto him. */
const arroyo: Scene = (ctx, state, d, t, f, hit, since, W, H) => {
  const cx = W / 2, floor = 520, rockTop = 450;
  bandedGradient(ctx, 0, 0, W, H, ['#FDE68A', '#FDBA74', '#F97316', '#7C2D12'], 14);
  for (const side of [-1, 1]) {
    const e = (y: number) => cx + side * (170 + Math.sin(y * 0.02 + side) * 40 + (hash(Math.floor(y / 30) + side * 5) - 0.5) * 24 - y * 0.05);
    wall(ctx, side, W, H, e, () => {
      strata(ctx, 0, W, H, ['#9A3412', '#C2410C', '#B45309', '#7C2D12', '#D97706', '#92400E'], 26, side * 3);
      // (pocks in the rock, desert varnish streaking down it)
      for (let k = 0; k < 26; k++) { ctx.fillStyle = 'rgba(67, 20, 7, 0.45)'; ctx.fillRect(snap(side < 0 ? hash(k) * 300 : W - hash(k) * 300), snap(hash(k * 3) * H), P * 3, P * 2); }
      for (let k = 0; k < 7; k++) { const x = snap(side < 0 ? 40 + k * 38 : W - 40 - k * 38); ctx.fillStyle = 'rgba(41, 15, 6, 0.3)'; ctx.fillRect(x, snap(hash(k) * 200), P * 2, snap(100 + hash(k + 1) * 200)); }
      hazeBands(ctx, 0, H * 0.4, W, H * 0.6, '#431407', 0, 0.55, 6);
    }, '#FDBA74', '#431407');
  }
  bandedGradient(ctx, 0, floor, W, H - floor, ['#D6A35C', '#B7874A', '#92633A'], 4);
  ctx.fillStyle = '#E8C07D'; for (let k = 0; k < 30; k++) ctx.fillRect(snap(hash(k) * W), snap(floor + 4 + hash(k + 9) * (H - floor - 8)), P * 2, P);
  // (scrub)
  ctx.strokeStyle = '#57534E'; ctx.lineWidth = 1.5; for (const bx of [210, 600]) for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.moveTo(bx, floor); ctx.lineTo(bx + (k - 3) * 6, floor - 14 - hash(k + bx) * 12); ctx.stroke(); }
  // The rock
  ctx.fillStyle = '#7C2D12'; ctx.beginPath(); ctx.ellipse(cx, floor, 64, floor - rockTop + 4, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#9A3412'; ctx.beginPath(); ctx.ellipse(cx - 12, floor - 6, 44, floor - rockTop - 8, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#C2410C'; ctx.fillRect(cx - 34, rockTop + 8, 30, P); ctx.fillRect(cx - 40, rockTop + 14, 12, P);
  checker(ctx, cx + 20, rockTop + 12, 40, 50, 'rgba(67, 20, 7, 0.5)');
  // Him: down on his back over it, each end hanging down off it
  if (!hit) him(ctx, state, d, cx, dropTo(t, rockTop - 30), -d.facing * Math.PI / 2 + Math.sin(t * 0.4) * 0.2, 2, 'scream');
  else {
    splatter(ctx, cx, rockTop + 10, 60, 51, 0.6);
    const fold = 0.7, py = rockTop - 4;
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.beginPath(); ctx.rect(side < 0 ? 0 : cx, 0, side < 0 ? cx : W - cx, H); ctx.clip();
      ctx.translate(cx, py); ctx.rotate(side * fold); ctx.translate(-cx, -py);
      him(ctx, state, d, cx, py - 20, -d.facing * Math.PI / 2, 2, 'dead');
      ctx.restore();
    }
    pool(ctx, cx, floor + 4, Math.min(80, since * 1.5));
    ctx.fillStyle = '#7F1D1D'; ctx.fillRect(snap(cx - 4), rockTop, P * 3, snap(Math.min(64, since * 2))); ctx.fillStyle = '#991B1B'; ctx.fillRect(snap(cx + 18), rockTop + 10, P * 2, snap(Math.min(50, since * 1.5)));
  }
  // The vultures: circling down, then on him
  for (let k = 0; k < 2; k++) {
    if (since < 20 + k * 12) continue;
    const q = clamp01((since - 20 - k * 12) / 50), a = f * 0.05 + k * Math.PI;
    const vx = q < 1 ? cx + Math.cos(a) * 160 * (1 - q) + (k ? 40 : -40) * q : cx + (k ? 50 : -50), vy = q < 1 ? 60 + (rockTop - 90) * q + Math.sin(a) * 30 * (1 - q) : rockTop - 38 + (f % 14 < 4 ? 6 : 0);
    ctx.save(); ctx.translate(vx, vy); if (k) ctx.scale(-1, 1);
    const flap = q < 1 ? Math.sin(f * 0.5 + k) * 14 : 4;
    ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.moveTo(-6, -4); ctx.lineTo(-34, -6 - flap); ctx.lineTo(-24, -2 - flap * 0.5); ctx.lineTo(-10, 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(4, -4); ctx.lineTo(30, -8 - flap); ctx.lineTo(20, -3 - flap * 0.5); ctx.lineTo(8, 2); ctx.fill();
    ctx.fillStyle = '#292524'; ctx.beginPath(); ctx.ellipse(0, 0, 16, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F5F5F4'; ctx.fillRect(10, -6, 6, 4);
    ctx.fillStyle = '#FCA5A5'; ctx.beginPath(); ctx.arc(18, -8, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#E7E5E4'; ctx.fillRect(21, -7, 5, P); if (q >= 1) { ctx.fillStyle = '#991B1B'; ctx.fillRect(22, -6, 4, P * 2); }
    ctx.fillStyle = '#1C1917'; ctx.fillRect(19, -10, P, P);
    ctx.restore();
  }
};

/** Under Alcatraz's cliffs: the fog over the bay, the cliff in its facets, the swell; him belly first onto the rocks in
 * the surf, a wave over it all going back out pink, a crab making off with a finger. */
const rocks: Scene = (ctx, state, d, t, f, hit, since, W, H) => {
  const cx = W / 2, rockTop = 430, sea = 470;
  bandedGradient(ctx, 0, 0, W, sea, ['#CBD5E1', '#94A3B8', '#64748B', '#94A3B8'], 12);
  // (the city across the bay, through the fog)
  ctx.fillStyle = '#7C8DA3'; for (let k = 0; k < 14; k++) { const x = 300 + k * 36, h = 20 + hash(k) * 60; ctx.fillRect(x, sea - 70 - h, 26, h); }
  hazeBands(ctx, 0, sea - 160, W, 120, '#CBD5E1', 0.2, 0.7, 5);
  // The cliff, faceted
  ctx.save();
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(170, 0); ctx.lineTo(140, 120); ctx.lineTo(190, 240); ctx.lineTo(160, 360); ctx.lineTo(210, sea); ctx.lineTo(0, sea); ctx.closePath(); ctx.clip();
  strata(ctx, 0, 260, sea, ['#57534E', '#44403C', '#78716C', '#3F3A36'], 30, 77);
  for (let k = 0; k < 14; k++) { ctx.fillStyle = k % 2 ? 'rgba(168, 162, 158, 0.5)' : 'rgba(28, 25, 23, 0.45)'; ctx.beginPath(); const x = hash(k) * 180, y = hash(k + 4) * sea; ctx.moveTo(x, y); ctx.lineTo(x + 30, y + 10); ctx.lineTo(x + 10, y + 40); ctx.fill(); }
  ctx.restore();
  // The sea, banded, with the swell
  bandedGradient(ctx, 0, sea, W, H - sea, ['#1E3A5F', '#172554', '#0F172A'], 6);
  for (let k = 0; k < 10; k++) { const x = snap((k * 97 + f * 0.6) % (W + 60) - 30); ctx.fillStyle = 'rgba(203, 213, 225, 0.45)'; ctx.fillRect(x, sea + 8 + (k % 4) * 12, 30, P); }
  // The rocks
  const rock = (pts: number[][], lit: string, dark: string) => { ctx.fillStyle = dark; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.fill(); ctx.fillStyle = lit; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]); ctx.lineTo(pts[2][0], pts[2][1]); ctx.lineTo((pts[1][0] + pts[2][0]) / 2, sea); ctx.fill(); };
  rock([[cx - 130, sea + 12], [cx - 40, rockTop - 10], [cx + 10, rockTop], [cx + 70, rockTop + 14], [cx + 140, sea + 12]], '#78716C', '#44403C');
  rock([[cx + 150, sea + 12], [cx + 200, sea - 44], [cx + 225, sea - 38], [cx + 270, sea + 12]], '#57534E', '#292524');
  ctx.fillStyle = '#365314'; for (let k = 0; k < 12; k++) ctx.fillRect(snap(cx - 110 + k * 20), snap(sea + 2 - hash(k) * 8), P * 3, P * 2); // (weed at the waterline)
  if (!hit) him(ctx, state, d, cx, dropTo(t, rockTop - 18), d.facing * Math.PI / 2 + Math.sin(t * 0.4) * 0.2, 2, 'scream');
  else {
    splatter(ctx, cx, rockTop + 4, 90, 61, 0.45);
    ctx.save(); ctx.translate(cx, rockTop - 12); ctx.scale(1.15, 0.7); ctx.translate(-cx, -(rockTop - 12));
    him(ctx, state, d, cx, rockTop - 12, d.facing * Math.PI / 2, 2, 'dead');
    ctx.restore();
    for (let k = 0; k < 5; k++) { ctx.fillStyle = '#7F1D1D'; ctx.fillRect(snap(cx - 50 + k * 24), rockTop + 6, P * 2, snap(Math.min(40, since * (1 + hash(k))))); }
  }
  // The wave, over the lot, and back out pink
  const w = clamp01((since - 30) / 25), back = clamp01((since - 55) / 25);
  if (w > 0) {
    const x = W + 60 - (W + 200) * w + (W + 200) * back * 0.45;
    ctx.fillStyle = back > 0 ? `rgba(251, 113, 133, ${(0.65 * (1 - back)).toFixed(3)})` : 'rgba(241, 245, 249, 0.88)';
    ctx.beginPath(); ctx.moveTo(x, sea + 20); ctx.quadraticCurveTo(x + 40, rockTop - 60, x + 120, rockTop - 30); ctx.lineTo(W + 200, rockTop - 30); ctx.lineTo(W + 200, sea + 20); ctx.fill();
    for (let k = 0; k < 12; k++) pixelBlob(ctx, x + 60 + k * 50, rockTop - 34 + Math.sin(k + f * 0.2) * 6, 16, 10, back > 0 ? `rgba(254, 205, 211, ${(0.7 * (1 - back)).toFixed(3)})` : 'rgba(255, 255, 255, 0.9)');
  }
  // The crab, off with a finger
  if (since > 50) {
    const q = since - 50, x = cx + 40 + q * 4, y = rockTop + 6 - Math.abs(Math.sin(q * 0.6)) * 2;
    ctx.strokeStyle = '#991B1B'; ctx.lineWidth = 2; for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(x + s * 6, y + 2); ctx.lineTo(x + s * (12 + k * 2), y + 7 + (q % 4 < 2 ? 1 : -1)); ctx.stroke(); }
    ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.ellipse(x, y, 10, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F87171'; ctx.fillRect(snap(x - 6), snap(y - 4), 8, P);
    ctx.fillStyle = '#1C1917'; ctx.fillRect(snap(x + 3), snap(y - 8), P, P * 2); ctx.fillRect(snap(x + 7), snap(y - 8), P, P * 2);
    ctx.fillStyle = '#D4A373'; ctx.fillRect(snap(x + 10), snap(y - 6), 10, 4); ctx.fillStyle = '#F5E6D3'; ctx.fillRect(snap(x + 18), snap(y - 6), P, P); ctx.fillStyle = '#B91C1C'; ctx.fillRect(snap(x + 10), snap(y - 6), P, 4);
  }
};

/** Down the hole in the cell house floor into the old fort: brick and damp, a torch, chains; him crumpled head first
 * on the flagstones, and the old boy chained to the wall (down here since 1934) turns to look, and has a laugh. */
const dungeon: Scene = (ctx, state, d, t, f, hit, since, W, H) => {
  const floor = 500, cx = W / 2 + 40;
  ctx.fillStyle = brickPattern(ctx, 'dungeon', 46, 19, ['#44403C', '#3F3A36'], '#1C1917'); ctx.fillRect(0, 0, W, floor);
  for (let k = 0; k < 18; k++) { ctx.fillStyle = 'rgba(28, 25, 23, 0.4)'; ctx.fillRect(snap(hash(k) * W), snap(hash(k + 3) * floor), 46, 19); } // (darker stones)
  for (let k = 0; k < 6; k++) { const x = snap(60 + k * 130 + hash(k) * 30); ctx.fillStyle = 'rgba(21, 128, 61, 0.25)'; ctx.fillRect(x, 0, P * 3, snap(150 + hash(k + 2) * 200)); } // (damp)
  // The torch, flickering
  const fl = Math.sin(f * 0.5) * 0.08 + Math.sin(f * 1.3) * 0.05;
  steppedGlow(ctx, 640, 170, 260 * (1 + fl), '#FDBA74', 0.3, 0, 6);
  ctx.fillStyle = '#292524'; ctx.fillRect(634, 170, 12, 40); ctx.fillStyle = '#57534E'; ctx.fillRect(628, 166, 24, 8);
  ctx.fillStyle = '#F97316'; ctx.beginPath(); ctx.moveTo(630, 166); ctx.quadraticCurveTo(640, 132 - fl * 60, 650, 166); ctx.fill(); ctx.fillStyle = '#FDE047'; ctx.beginPath(); ctx.moveTo(635, 166); ctx.quadraticCurveTo(640, 148 - fl * 40, 645, 166); ctx.fill();
  hazeBands(ctx, 0, 0, W, floor, '#0C0A09', 0.5, 0.15, 6);
  // The hole up in the ceiling, light down through it
  ctx.fillStyle = 'rgba(254, 243, 199, 0.18)'; ctx.beginPath(); ctx.moveTo(cx - 70, 0); ctx.lineTo(cx + 70, 0); ctx.lineTo(cx + 120, floor); ctx.lineTo(cx - 120, floor); ctx.fill();
  checker(ctx, cx - 100, 0, 200, 20, 'rgba(254, 243, 199, 0.2)');
  // The flagstones
  bandedGradient(ctx, 0, floor, W, H - floor, ['#3F3A36', '#292524', '#1C1917'], 4);
  ctx.fillStyle = '#1C1917'; for (let k = 0; k < 9; k++) ctx.fillRect(snap(k * 100 + 30), floor, P, H - floor); ctx.fillRect(0, floor + 40, W, P);
  ctx.fillStyle = '#57534E'; ctx.fillRect(0, floor, W, P);
  // The old boy, chained up, sat against the wall
  const sx = 200, sy = floor;
  ctx.strokeStyle = '#71717A'; ctx.lineWidth = 3; ctx.setLineDash([4, 2]); ctx.beginPath(); ctx.moveTo(sx - 30, sy - 130); ctx.lineTo(sx - 18, sy - 70); ctx.moveTo(sx + 30, sy - 130); ctx.lineTo(sx + 18, sy - 70); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#52525B'; ctx.fillRect(sx - 36, sy - 136, 12, 8); ctx.fillRect(sx + 24, sy - 136, 12, 8);
  ctx.fillStyle = '#57534E'; ctx.fillRect(sx - 34, sy - 26, 60, 26); // (his rags, what's left)
  ctx.strokeStyle = '#E7E5D6'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath();
  ctx.moveTo(sx, sy - 76); ctx.lineTo(sx, sy - 30); for (let r = 0; r < 4; r++) { ctx.moveTo(sx - 12, sy - 70 + r * 9); ctx.lineTo(sx + 12, sy - 70 + r * 9); }
  ctx.moveTo(sx - 14, sy - 74); ctx.lineTo(sx - 18, sy - 70); ctx.moveTo(sx + 14, sy - 74); ctx.lineTo(sx + 18, sy - 70);
  ctx.moveTo(sx, sy - 30); ctx.lineTo(sx + 30, sy - 26); ctx.lineTo(sx + 34, sy); ctx.moveTo(sx, sy - 30); ctx.lineTo(sx - 26, sy - 22); ctx.lineTo(sx - 30, sy);
  ctx.stroke(); ctx.lineCap = 'butt';
  const look = clamp01((since - 20) / 12), laugh = since > 36 && since < 74 && since % 8 < 4;
  ctx.save(); ctx.translate(sx, sy - 90); ctx.rotate(0.35 * look);
  ctx.fillStyle = '#E7E5D6'; ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#C8C3AE'; ctx.fillRect(-12, 2, 24, P * 2);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(-6 + look * 4, -4, 4, 5); ctx.fillRect(2 + look * 4, -4, 4, 5); ctx.fillRect(-1 + look * 3, 3, 2, 3);
  ctx.fillStyle = '#E7E5D6'; ctx.fillRect(-7, 9 + (laugh ? 6 : 0), 14, 5);
  ctx.fillStyle = '#1C1917'; for (let k = -6; k <= 6; k += 3) ctx.fillRect(k, 9 + (laugh ? 6 : 0), 1, 3);
  ctx.restore();
  if (laugh) { ctx.fillStyle = '#E7E5D6'; ctx.font = 'bold 9px "Press Start 2P"'; ctx.fillText(since % 16 < 8 ? 'HEH' : 'HEH HEH', sx + 22, sy - 122); }
  // Him: head first onto the flags, crumpled, his neck the wrong way
  if (!hit) him(ctx, state, d, cx, dropTo(t, floor - 46), Math.PI + Math.sin(t * 0.5) * 0.2, 1.6, 'scream');
  else {
    splatter(ctx, cx - 30 * d.facing, floor - 4, 80, 71, 0.3);
    pool(ctx, cx - 30 * d.facing, floor + 6, Math.min(80, since * 1.4));
    him(ctx, state, d, cx, floor - 30, Math.PI * 0.62 * d.facing, 1.6, 'dead');
    if (since < 12) for (let k = 0; k < 8; k++) pixelBlob(ctx, cx + (hash(k) - 0.5) * 140, floor - since * 2 - hash(k + 1) * 20, 10 + since, 6 + since * 0.6, `rgba(168, 162, 158, ${(0.6 * (1 - since / 12)).toFixed(3)})`);
  }
};

/**
 * Up Hector's tower, the storm got him, and it doesn't stop at the clouds: straight up, spinning, the clouds tearing
 * past and the speed lines streaming, the sky going from storm to blue to black; out of the air. Then nothing: the
 * stars, the Earth curving away below (the hurricane a white spiral on it), the sun, and him, drifting, turning slowly
 * over, his last breath going out of him in a puff and freezing, and that's it. (Long, for a death: SKIP >> goes
 * straight past it.)
 */
const space = (ctx: Ctx, state: GameState, d: MeatheadDeath, t: number, f: number, W: number, H: number) => {
  const up = clamp01(t / SPACE_OUT), out = clamp01((t - SPACE_OUT + 20) / 40);
  // The sky: storm, blue, indigo, black
  const sky = ['#475569', '#38BDF8', '#1D4ED8', '#1E1B4B', '#020617', '#000000'];
  const at = (k: number) => sky[Math.min(sky.length - 1, Math.floor(clamp01(k) * (sky.length - 1)))];
  bandedGradient(ctx, 0, 0, W, H, [at(up + 0.25), at(up), at(up - 0.2)], 10);
  // The stars coming out, and staying
  if (out > 0) for (let k = 0; k < 110; k++) {
    const tw = (hash(k * 3) + f * 0.01 * (k % 5)) % 1 < 0.9 ? 1 : 0.4;
    ctx.fillStyle = `rgba(255, 255, 255, ${(out * tw * (0.4 + hash(k) * 0.6)).toFixed(3)})`;
    const s = k % 13 === 0 ? P * 2 : P;
    ctx.fillRect(snap(hash(k + 1) * W), snap(hash(k + 2) * H), s, s);
  }
  // The Earth, curving away below once he's out (its atmosphere a thin glowing band), and the sun
  if (out > 0) {
    const rise = H + 40 - out * 170, R = 1600;
    ctx.save(); ctx.globalAlpha = out;
    steppedGlow(ctx, 120, 90, 110, '#FEF9C3', 0.9, 0, 6);
    ctx.fillStyle = '#7DD3FC'; ctx.beginPath(); ctx.arc(W / 2, rise + R, R + 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1D4ED8'; ctx.beginPath(); ctx.arc(W / 2, rise + R, R, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(W / 2, rise + R, R, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#15803D'; ctx.beginPath(); ctx.ellipse(W * 0.3, rise + 80, 160, 40, -0.1, 0, Math.PI * 2); ctx.fill();
    for (let k = 0; k < 14; k++) pixelBlob(ctx, (k * 83 + f * 0.05) % (W + 100) - 50, rise + 20 + (k % 4) * 22, 40 + (k % 3) * 16, 8, 'rgba(255, 255, 255, 0.8)');
    // (the hurricane he came up out of, a white spiral down there)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'; ctx.lineWidth = 3; ctx.beginPath();
    for (let a = 0; a < Math.PI * 5; a += 0.2) { const r = 4 + a * 7, x = W * 0.68 + Math.cos(a - f * 0.004) * r, y = rise + 60 + Math.sin(a - f * 0.004) * r * 0.3; if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    ctx.stroke(); ctx.restore();
    checker(ctx, 0, snap(rise - 4), W, P * 2, 'rgba(125, 211, 252, 0.6)');
    ctx.restore();
  }
  // Going up: the clouds tearing past him
  if (up < 1) for (let k = 0; k < 10; k++) { const y = ((t * 26 + k * 140) % (H + 300)) - 150; pixelBlob(ctx, hash(k) * W, y, 90 + hash(k + 1) * 60, 30 + hash(k + 2) * 20, `rgba(226, 232, 240, ${(0.85 * (1 - up)).toFixed(3)})`); }
  // ...and the speed lines, streaming
  const lines = 1 - clamp01((t - SPACE_OUT + 10) / 30);
  if (lines > 0) for (let k = 0; k < 46; k++) {
    const x = snap(hash(k * 5) * W), len = 80 + hash(k) * 220, y = ((t * (40 + hash(k + 3) * 30) + k * 97) % (H + len)) - len;
    if (Math.abs(x - W / 2) < 46 && hash(k) < 0.7) continue;
    ctx.fillStyle = `rgba(255, 255, 255, ${(lines * (0.35 + hash(k + 9) * 0.5)).toFixed(3)})`;
    ctx.fillRect(x, snap(y), k % 4 === 0 ? P * 2 : P, snap(len));
  }
  // Him: shot up spinning, slowing; then drifting, turning over, dead
  const drift = Math.max(0, t - SPACE_OUT);
  const x = W / 2 + (up < 1 ? Math.sin(t * 1.3) * 6 * (1 - up) : drift * 0.35), y = H * 0.5 + (up < 1 ? 40 * (1 - up) : -drift * 0.22);
  const rot = up < 1 ? t * (0.5 - up * 0.35) : SPACE_OUT * 0.325 + drift * 0.012;
  const face: DeathFace = up < 1 ? 'scream' : drift < 40 ? 'frozen' : 'dead';
  ctx.save();
  if (drift > 0) ctx.filter = `saturate(${1 - clamp01(drift / 80) * 0.4}) brightness(${1 - clamp01(drift / 80) * 0.15}) hue-rotate(${-clamp01(drift / 80) * 10}deg)`;
  him(ctx, state, d, x, y, rot, 2, face, { isGrounded: false, vel: { x: 0, y: -2 } });
  ctx.restore();
  // (his last breath going out of him, and freezing; frost over him)
  if (drift > 20 && drift < 70) for (let k = 0; k < 6; k++) {
    const q = clamp01((drift - 20 - k * 3) / 40);
    if (q <= 0 || q >= 1) continue;
    ctx.fillStyle = `rgba(241, 245, 249, ${(0.8 * (1 - q)).toFixed(3)})`;
    ctx.fillRect(snap(x + 10 + q * 40 + k * 3), snap(y - 50 - q * 30 + Math.sin(k) * 6), P * 2, P * 2);
  }
  if (drift > 40) for (let k = 0; k < 16; k++) if (hash(k * 7) < clamp01((drift - 40) / 60)) { ctx.fillStyle = '#F0F9FF'; ctx.fillRect(snap(x - 30 + hash(k) * 60), snap(y - 50 + hash(k + 3) * 100), P, P); }
};
