import type { GameState } from '../../core/state';
import type { MeatheadDeath } from '../../player/deathAnim';
import { MEATHEAD_DEATH_FRAMES, FALL_HIT, SPACE_OUT, MOTO_PIT_LANDS, MOTO_PIT_LIGHTS } from '../../player/deathAnim';
import { WHEEL_STOP, WHEEL_HIT, WHEEL_LIGHTS, WHEEL_ZAP, WHEEL_POP, WHEEL_BIRD } from '../../player/deathAnim';
import { drawChopperBike } from '../enemies/oscar';
import { body } from './deathAnim';
import type { DeathFace } from './deathFace';
import { bandedGradient, checker, brickPattern, steppedGlow, pixelBlob, hazeBands } from '../pixelArt';
import { drawFire } from '../fx/fire';
import { drawFlameLicks, drawFireball } from '../fx/fireball';
import { drawBloodPool } from '../spatter';

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

/** A pool of blood spreading at (x, y), r wide (see drawBloodPool). */
export const pool = (ctx: Ctx, x: number, y: number, r: number) => {
  if (r < 2) return;
  // (on the floor its middle's on: its top half a pool's height over y)
  drawBloodPool(ctx, x, y + Math.max(3, r * 0.16) * 0.5, Math.round(r), Math.round(x * 3 + y));
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
  const len = state.deathScene?.len ?? MEATHEAD_DEATH_FRAMES[d.kind];
  const t = Math.min(state.deathScene?.t ?? 9999, len);
  const f = state.frame, hit = t >= FALL_HIT, since = t - FALL_HIT;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  switch (d.kind) {
    case 'fall_crevasse': crevasse(ctx, state, d, t, f, hit, since, W, H); break;
    case 'fall_trench': trench(ctx, state, d, t, f, hit, since, W, H); break;
    case 'fall_alley': alley(ctx, state, d, t, f, hit, since, W, H); break;
    case 'fall_crude': crude(ctx, state, d, t, f, hit, since, W, H); break;
    case 'fall_moto': motoPit(ctx, state, d, t, f, hit, since, W, H); break;
    case 'fall_arroyo': arroyo(ctx, state, d, t, f, hit, since, W, H); break;
    case 'fall_rocks': rocks(ctx, state, d, t, f, hit, since, W, H); break;
    case 'fall_dungeon': dungeon(ctx, state, d, t, f, hit, since, W, H); break;
    case 'fall_wheel': fairyWheel(ctx, state, d, t, f, W, H); break;
    case 'space': space(ctx, state, d, t, f, W, H); break;
  }
  // (and it dims on him at the end, for the message)
  const out = clamp01((t - (len - 20)) / 20);
  if (out > 0) hazeBands(ctx, 0, 0, W, H, '#000000', out * 0.5, out * 0.7, 4);
  ctx.restore();
};

type Scene = (ctx: Ctx, state: GameState, d: MeatheadDeath, t: number, f: number, hit: boolean, since: number, W: number, H: number) => void;

/** A scene's still part (its walls and the like, thousands of little fills): painted the once into a canvas of its
 * own, then just put down each frame after. */
const stills = new Map<string, HTMLCanvasElement>();
const stillCanvas = (key: string, W: number, H: number, paint: (g: Ctx) => void) => {
  const k = `${key}:${W}x${H}`;
  let c = stills.get(k);
  if (!c) {
    c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d')!; g.imageSmoothingEnabled = false;
    paint(g);
    stills.set(k, c);
  }
  return c;
};
const still = (ctx: Ctx, key: string, W: number, H: number, paint: (g: Ctx) => void) => {
  if (typeof document === 'undefined') { paint(ctx); return; }
  ctx.drawImage(stillCanvas(key, W, H, paint), 0, 0);
};
/** A still painted at the picture's own resolution (its device pixels: copied 1:1, the same pixels as painting it there). */
const sharpStills = new Map<string, HTMLCanvasElement>();
const sharpStill = (ctx: Ctx, key: string, W: number, H: number, paint: (g: Ctx) => void) => {
  const m = ctx.getTransform(), k = Math.hypot(m.a, m.b);
  if (typeof document === 'undefined' || m.b !== 0 || m.c !== 0 || m.a !== m.d) { paint(ctx); return; }
  const id = `${key}:${W}x${H}@${k}`;
  let c = sharpStills.get(id);
  if (!c) {
    c = document.createElement('canvas'); c.width = Math.round(W * k); c.height = Math.round(H * k);
    const g = c.getContext('2d')!; g.setTransform(k, 0, 0, k, 0, 0); g.imageSmoothingEnabled = false;
    g.lineCap = ctx.lineCap; g.lineJoin = ctx.lineJoin; // (strokes end the way they would've in the picture)
    paint(g);
    sharpStills.set(id, c);
  }
  ctx.drawImage(c, 0, 0, W, H);
};
/** Paint a still ahead of when it's needed. */
const warmStill = (key: string, W: number, H: number, paint: (g: Ctx) => void) => {
  if (typeof document !== 'undefined') stillCanvas(key, W, H, paint);
};

// ---------------------------------------------------------------------------

/** The crevasse kill cam's crack: how wide it is down it (it narrows, then closes in a V at the bottom), and its faces. */
const crevasseHalfWidth = (y: number) => (y < 300 ? 185 - y * 0.26 : Math.max(0, 107 - (y - 300) * 0.75));
const crevasseEdge = (W: number) => (side: number) => (y: number) =>
  W / 2 + side * (crevasseHalfWidth(y) + (hash(Math.floor(y / 24) + side * 7) - 0.5) * 18 + Math.sin(y * 0.05 + side) * 6);

/** The crevasse's walls, its snow and icicles: its still part. */
const crevasseWalls = (W: number, H: number) => (ctx: Ctx) => {
  const edge = crevasseEdge(W);
  // The walls: glacier ice, lit through from the crack (glowing pale at its face, deepening to dark blue back into
  // it), old layers bowed through it, big fractured planes, trapped bubbles, a band of grit
  const glow = ['#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8', '#0EA5E9', '#0369A1', '#0C4A6E', '#082F49'];
  for (const side of [-1, 1]) {
    const e = edge(side);
    wall(ctx, side, W, H, e, () => {
      // (in from the face in steps, each step's seam dithered, following the face's line)
      // (a step's rows are filled as one shape: rows never overlap, and within a row the steps still go down in order,
      // so it's the same pixels for a few fills instead of thousands)
      const steps = glow.map(() => [] as number[]);
      for (let y = 0; y < H; y += P) {
        const ex = e(y);
        for (let b = 0; b < glow.length; b++) {
          const dIn = 6 + b * b * 7 + Math.sin(y * 0.03 + b + side) * 4;
          const x = snap(side < 0 ? ex - dIn : ex + dIn);
          // (a step that's gone off the edge of the picture is left out: nothing of it would show)
          if (side < 0 ? x > 0 : x < W) steps[b].push(side < 0 ? 0 : x, y, side < 0 ? x : W - x);
          if ((y / P + b) % 2 === 0) steps[b].push(side < 0 ? x : x - P, y, P);
        }
      }
      steps.forEach((rects, b) => {
        ctx.fillStyle = glow[b]; ctx.beginPath();
        for (let i = 0; i < rects.length; i += 3) ctx.rect(rects[i], rects[i + 1], rects[i + 2], P);
        ctx.fill();
      });
      // (the old layers, bowed, faint: each one a shape of its own, its bits side by side)
      for (let k = 0; k < 12; k++) {
        const y0 = 40 + k * 46 + hash(k + side) * 20;
        ctx.fillStyle = k % 3 === 0 ? 'rgba(100, 116, 139, 0.45)' : 'rgba(240, 249, 255, 0.28)';
        ctx.beginPath();
        for (let x = 0; x < W; x += P * 2) ctx.rect(x, snap(y0 + Math.sin(x * 0.012 + k) * 14 + (side < 0 ? -x : x - W) * 0.04), P * 2, P);
        ctx.fill();
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
    // (column by column, side by side: the snow as one shape, its shadow as another over it)
    const cols: number[] = [];
    for (let x = 0; x < 230; x += P) {
      const sx = side < 0 ? lip - x : lip + x, top = snap(4 + Math.sin(x * 0.07) * 4), bot = snap(26 + Math.sin(x * 0.05 + 1) * 6 + (x < 30 ? 6 : 0));
      cols.push(snap(sx), top, bot);
    }
    ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); for (let i = 0; i < cols.length; i += 3) ctx.rect(cols[i], cols[i + 1], P, cols[i + 2] - cols[i + 1]); ctx.fill();
    ctx.fillStyle = '#BFDBFE'; ctx.beginPath(); for (let i = 0; i < cols.length; i += 3) ctx.rect(cols[i], cols[i + 2] - P * 2, P, P * 2); ctx.fill();
    for (let k = 0; k < 6; k++) { const x = lip + side * (6 + k * 34), len = 10 + hash(k + side) * 24; ctx.fillStyle = '#E0F2FE'; ctx.beginPath(); ctx.moveTo(x - 4, 28); ctx.lineTo(x + 4, 28); ctx.lineTo(x, 28 + len); ctx.fill(); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(snap(x - 2), 28, P, snap(len * 0.6)); }
  }
};

/** The crevasse kill cam's walls painted ahead of time (on Artie's mountain, before anyone's gone down one), so the
 * cam doesn't stall on its first frame painting them. */
export const warmCrevasseCam = (W: number, H: number) => warmStill('crevasse-walls', W, H, crevasseWalls(W, H));

/**
 * Artie's crevasses: glacier ice in its layers (old snow, blue ice, grit), snow overhanging the lips up top, the crack
 * narrowing into the black. Him head first down it, scraping the walls red as he goes, wedged where it's too tight,
 * blood running down the ice under him and freezing in red icicles; legs kicking, slowing, frosting over.
 */
const crevasse: Scene = (ctx, state, d, t, f, hit, since, W, H) => {
  // (the crack narrows, then closes in a V: he's jammed in the bottom of it by the shoulders, his head down in the point)
  const cx = W / 2, wedge = 384;
  const hw = crevasseHalfWidth, edge = crevasseEdge(W);
  // The crack itself: daylight up top, falling away into the dark
  bandedGradient(ctx, 0, 0, W, H, ['#E0F2FE', '#7DD3FC', '#1D4ED8', '#172554', '#020617', '#000000'], 18);
  // Him: head first, down into it, then jammed (the walls are put down over him: they've got him by the shoulders)
  const by = dropTo(t, wedge);
  const kick = hit ? Math.sin(since * 0.9) * 0.14 * (1 - clamp01(since / 55)) : Math.sin(t * 0.5) * 0.25;
  const frost = clamp01((since - 45) / 35);
  ctx.save();
  if (frost > 0) ctx.filter = `saturate(${1 - frost * 0.55}) brightness(${1 + frost * 0.18}) hue-rotate(${-frost * 12}deg)`;
  // (squeezed in it: narrower the tighter it's got him)
  const sq = hit ? 0.8 + 0.06 * Math.max(0, 1 - since / 6) : 1;
  ctx.translate(cx, by); ctx.scale(sq, 1); ctx.translate(-cx, -by);
  him(ctx, state, d, cx + (hit ? 0 : Math.sin(t * 0.4) * 12), by - (hit && since < 4 ? 4 - since : 0), Math.PI + kick, 1.6, !hit ? 'scream' : since < 45 ? 'agony' : 'frozen');
  ctx.restore();
  still(ctx, 'crevasse-walls', W, H, crevasseWalls(W, H));
  // Where he's scraped down the walls on the way: smears, red on the ice
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
  if (hit) {
    // Where the ice has him: cracks starred out from his shoulders and his head, white in the blue
    ctx.strokeStyle = 'rgba(240, 249, 255, 0.85)'; ctx.lineWidth = 1;
    for (const [px, py, n] of [[cx - hw(wedge - 20), wedge - 20, 5], [cx + hw(wedge - 20), wedge - 20, 5], [cx, wedge + 56, 4]] as const) {
      const grow = clamp01(since / 10);
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + hash(px + k), len = (14 + hash(k * 5 + px) * 22) * grow;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(a) * len * 0.5 + (hash(k) - 0.5) * 4, py + Math.sin(a) * len * 0.5); ctx.lineTo(px + Math.cos(a) * len, py + Math.sin(a) * len); ctx.stroke();
      }
    }
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
  // What the crew left (a long time ago): a sawhorse knocked in, its sign face down, a coffee cup, a donut box
  ctx.save(); ctx.translate(250, floor - 10); ctx.rotate(-0.25);
  ctx.fillStyle = '#F97316'; ctx.fillRect(-40, -30, 80, 12); ctx.fillStyle = '#F8FAFC'; for (let k = 0; k < 4; k++) ctx.fillRect(-36 + k * 20, -30, 8, 12);
  ctx.strokeStyle = '#78350F'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-30, 8); ctx.lineTo(-24, -18); ctx.moveTo(30, 8); ctx.lineTo(24, -18); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(W - 236, 26, 8, 10); ctx.fillStyle = '#78350F'; ctx.fillRect(W - 236, 30, 8, 2);
  ctx.fillStyle = '#FBCFE8'; ctx.fillRect(W - 222, 30, 26, 6); ctx.fillStyle = '#EC4899'; ctx.fillRect(W - 222, 30, 26, 2);
  ctx.fillStyle = '#FDE68A'; ctx.fillRect(560, floor - 6, 40, 6); ctx.fillStyle = '#1C1917'; ctx.font = '5px "Press Start 2P"'; ctx.fillText('MEN AT WORK', 562, floor - 1);
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
  drawFire(ctx, 647, 118, 28, fl * 1.3, f, { seed: 5, glow: 0, smoke: 0.6 });
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
    // (racing across from the stack's side: a wall of fire in stretches, each its own height)
    const span = (W + 40) * k, seg = span / 6;
    for (let i = 0; i < 6; i++) drawFire(ctx, W + 20 - seg * (i + 0.5), surf + 4, seg * 1.3, (110 + hash(i) * 90) * die, f, { seed: i * 11, glow: 0, smoke: i % 2 ? 0.8 : 0 });
    for (let i = 0; i < 6; i++) { const q = ((since * 1.5 + i * 25) % 80) / 80; pixelBlob(ctx, 100 + i * 120 + Math.sin(i) * 30, surf - 150 - q * 220, 40 + q * 30, 22 + q * 16, `rgba(28, 25, 23, ${(0.7 * (1 - q) * die).toFixed(3)})`); }
  }
};

/**
 * Oscar's road out, in the chase: off the chopper and down into the trench cut across the road (asphalt on top, the
 * dirt in its layers, black crude at the bottom). Him in up to his chest, thrashing; the chopper coming down after
 * him, end over end, and onto him; his hand up out of it beside the wreck, and gone; the chopper's hot pipes light the
 * crude, and the trench goes up.
 */
const motoPit: Scene = (ctx, state, d, t, f, hit, since, W, H) => {
  const cx = W / 2, top = 150, surf = 440;
  // (the sky, the walls and the crude don't move: painted the once)
  sharpStill(ctx, 'moto-pit', W, H, ctx => {
  // A strip of the evening up top, the trench falling away into the dark below it
  bandedGradient(ctx, 0, 0, W, top, ['#1E1B4B', '#7C2D12', '#EA580C', '#FDBA74'], 10);
  bandedGradient(ctx, 0, top, W, surf - top, ['#3F2A1D', '#1C1410', '#0A0806'], 8);
  const hw = (y: number) => 250 - (y - top) * 0.16;
  for (const side of [-1, 1]) {
    wall(ctx, side, W, H, y => cx + side * (hw(y) + (hash(Math.floor(y / 20) + side * 5) - 0.5) * 14), () => {
      ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, H - top); ctx.clip();
      strata(ctx, 0, W, H, ['#7C4A2D', '#5C3A21', '#8B5A35', '#4A2E1A', '#6B4226'], 26, 3 + side);
      ctx.restore();
      // (the road on top: its asphalt slab, the edge of the yellow line, broken off ragged)
      ctx.fillStyle = '#292524'; ctx.fillRect(0, top - 18, W, 18);
      ctx.fillStyle = '#44403C'; ctx.fillRect(0, top - 18, W, P);
      ctx.fillStyle = '#1C1917'; ctx.fillRect(0, top - P, W, P);
      ctx.fillStyle = '#FACC15'; ctx.fillRect(side < 0 ? cx - 420 : cx + 300, top - 12, 110, P * 2);
    }, '#A16207', 'rgba(0, 0, 0, 0.45)');
  }
  // (nothing of the walls' edges up in the sky over the road)
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, top - 18); ctx.clip();
  bandedGradient(ctx, 0, 0, W, top, ['#1E1B4B', '#7C2D12', '#EA580C', '#FDBA74'], 10);
  ctx.restore();
  // The crude: black, the sheen sliding on it
  bandedGradient(ctx, 0, surf, W, H - surf, ['#1C1410', '#0A0806', '#000000'], 6);
  ctx.fillStyle = '#3F3A36'; ctx.fillRect(0, surf, W, P);
  });
  for (let k = 0; k < 7; k++) { const x = snap(cx - 220 + k * 70 + Math.sin(f * 0.05 + k) * 10), y = surf + P * 2 + (k % 3) * P * 3; const c = ['rgba(167, 139, 250, 0.4)', 'rgba(52, 211, 153, 0.35)', 'rgba(251, 191, 36, 0.35)'][k % 3]; ctx.fillStyle = c; ctx.fillRect(x, y, 40, P); }
  const L = since - MOTO_PIT_LANDS, lit = since - MOTO_PIT_LIGHTS;
  // Him: in, thrashing, up to his chest (till it's on him)
  if (L < 0) {
    const by = hit ? surf - 26 + Math.min(26, since * 2) : dropTo(t, surf - 30);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, surf + 2); ctx.clip();
    him(ctx, state, d, cx + (hit ? Math.sin(since * 0.9) * 5 : 0), by, hit ? Math.sin(since * 0.6) * 0.2 : t * 0.08, 2, 'scream', { hurtTimer: hit ? 10 : 0 });
    ctx.restore();
  }
  // (rings out from him, and from the chopper)
  for (const at of [0, MOTO_PIT_LANDS]) { const q = (since - at) / 30; if (q > 0 && q < 1) { ctx.strokeStyle = `rgba(120, 113, 108, ${(0.7 * (1 - q)).toFixed(3)})`; ctx.lineWidth = P; ctx.beginPath(); ctx.ellipse(cx, surf + 2, 20 + q * 150, 3 + q * 9, 0, 0, Math.PI * 2); ctx.stroke(); } }
  // The chopper: down after him, end over end, and onto him; then sitting half in it, the back wheel still turning
  const fallK = clamp01((since + 14 - MOTO_PIT_LANDS) / 14);
  if (since + 14 >= MOTO_PIT_LANDS) {
    const sinkB = L > 0 ? Math.min(26, L * 0.5) : 0;
    const bx = cx + 10, by = L < 0 ? -140 + (surf - 6 + 140) * fallK * fallK : surf - 6 + sinkB;
    const rot = L < 0 ? fallK * Math.PI * 1.6 : Math.PI * 1.6 + Math.min(0.3, L * 0.02);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, surf + 4); ctx.clip();
    ctx.translate(bx, by); ctx.scale(2, 2); ctx.rotate(rot);
    if (lit > 6) ctx.filter = 'brightness(0.35) sepia(0.5)';
    drawChopperBike(ctx, -6, 18, 0, t * (L < 0 ? 0.5 : 0.3), '#7F1D1D');
    ctx.restore();
    if (L >= 0 && L < 8) for (let k = 0; k < 18; k++) { ctx.fillStyle = '#0A0806'; ctx.fillRect(snap(bx + (hash(k) - 0.5) * 200), snap(surf - L * (6 + hash(k + 2) * 10) + L * L * 0.6), P * 3, P * 3); }
  }
  // His hand, up out of it beside the wreck, opening, closing, going down
  if (L > 8 && L < 44) {
    const hy = surf - 26 + Math.max(0, L - 30) * 2.2;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, surf + 2); ctx.clip();
    ctx.fillStyle = '#1C1410'; ctx.fillRect(snap(cx - 70), hy, 12, 40);
    ctx.fillStyle = '#E8A87C'; ctx.fillRect(snap(cx - 70), hy, 12, 4);
    const open = Math.floor(L / 5) % 2;
    ctx.fillStyle = '#0A0806'; for (let k = 0; k < 4; k++) ctx.fillRect(snap(cx - 72 + k * 4), hy - 8 - (open ? 4 : 0), P * 2, 10 + (open ? 2 : 0));
    ctx.restore();
  }
  // The pipes light it: a flash off the wreck, the fireball, and the trench burning wall to wall
  if (lit >= 0) {
    const die = 1 - clamp01((lit - 70) / 30);
    if (lit < 24) { steppedGlow(ctx, cx + 10, surf - 20, 160 + lit * 6, '#F97316', 0.6 * (1 - lit / 24), 0, 5); drawFireball(ctx, cx + 10, surf - 30 - lit * 2, 30 + Math.min(lit, 6) * 8 - Math.max(0, lit - 12) * 3, f, { seed: 4, heat: lit < 4 ? 1 : 0 }); }
    const k = clamp01(lit / 14), span = (W + 40) * k, seg = span / 6;
    for (let i = 0; i < 6; i++) drawFire(ctx, cx + (i - 2.5) * seg, surf + 4, seg * 1.3, (120 + hash(i) * 90) * die, f, { seed: i * 13, glow: 0, smoke: i % 2 ? 0.8 : 0 });
    for (let i = 0; i < 5; i++) { const q = ((lit * 1.4 + i * 22) % 80) / 80; pixelBlob(ctx, cx - 240 + i * 120, surf - 160 - q * 200, 40 + q * 30, 22 + q * 16, `rgba(28, 25, 23, ${(0.7 * (1 - q) * die).toFixed(3)})`); }
  }
};

/** Dale's arroyos: a slot of red rock in its layers, a strip of desert sky, sand and scrub at the bottom; him bent
 * backwards over a rock, the vultures circling down onto him. */
const arroyo: Scene = (ctx, state, d, t, f, hit, since, W, H) => {
  const cx = W / 2, floor = 520, rockTop = 450;
  // (the sky, the walls, the floor and the rock don't move: painted the once)
  sharpStill(ctx, 'arroyo', W, H, ctx => {
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
  });
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
  drawFlameLicks(ctx, 640, 166, 18, 34 * (1 + fl * 2), f, { seed: 2, n: 3 });
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

// ---------------------------------------------------------------------------
// Meathead 2's fairy wheel

const WH_INK = '#1A1028';
const WH_CAPS = ['#F49AC8', '#9EE6C8', '#C8A8F4', '#FFC8A0'];
const WH_BULBS = ['#FEF08A', '#A5F3FC', '#F9A8D4', '#FFFFFF', '#BBF7D0'];
/** (the fairy wheel) The plaza's floor; the flower bed's soil (he goes in head first there); where his middle is, in it. */
const WH_FLOOR = 470, WH_BED = 452, WH_PLANT = WH_BED - 18;
/** (the fairy wheel) The ground layer: its top (screen, settled), how tall. */
const WH_GL_TOP = WH_FLOOR - 74, WH_GL_H = 210;
/** (the fairy wheel) How far the scenery's gone up past him, t frames in (faster and faster; it stops with the camera). */
const wheelScroll = (t: number) => { const u = Math.min(t, WHEEL_STOP); return 6 * u + 0.25 * u * u; };
const WH_SC = wheelScroll(WHEEL_STOP);
/** A colour toward black (k < 0) or white (k > 0). */
const tint = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16), to = k < 0 ? 0 : 255, a = Math.abs(k);
  const c = (v: number) => Math.round(v + (to - v) * a).toString(16).padStart(2, '0');
  return `#${c(n >> 16)}${c((n >> 8) & 255)}${c(n & 255)}`;
};
const heart = (ctx: Ctx, x: number, y: number, col: string, s = P) => {
  const rows = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
  ctx.fillStyle = col;
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === 'X') ctx.fillRect(snap(x) + (i - 3) * s, snap(y) + (j - 3) * s, s, s); });
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; ctx.fillRect(snap(x) - 2 * s, snap(y) - 2 * s, s, s);
};

/** A suitor, beefy, sat on the bench at x (his feet on the floor at 0), grinning, waving bye-bye. */
const waver = (ctx: Ctx, x: number, f: number) => {
  ctx.fillStyle = WH_INK; ctx.fillRect(x - 14, -24, 30, 12); ctx.fillStyle = '#2A3A6A'; ctx.fillRect(x - 13, -23, 28, 10);
  ctx.fillStyle = WH_INK; ctx.fillRect(x - 16, -58, 32, 36); ctx.fillStyle = '#E07A1E'; ctx.fillRect(x - 14, -56, 28, 33);
  ctx.fillStyle = '#B05A10'; ctx.fillRect(x + 6, -56, 8, 33); checker(ctx, x + 4, -56, P, 33, '#B05A10');
  ctx.fillStyle = WH_INK; ctx.fillRect(x - 10, -78, 20, 21); ctx.fillStyle = '#E8A070'; ctx.fillRect(x - 9, -77, 18, 19);
  ctx.fillStyle = '#C47A48'; ctx.fillRect(x + 4, -77, 5, 19);
  ctx.fillStyle = '#2A1A0E'; ctx.fillRect(x - 9, -78, 18, 5);
  ctx.fillStyle = WH_INK; ctx.fillRect(x - 5, -70, P, P); ctx.fillRect(x + 3, -70, P, P); ctx.fillRect(x - 5, -64, 10, 4);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - 4, -64, 8, P);
  // (the arm up, the hand going side to side)
  ctx.save(); ctx.translate(x + 14, -54); ctx.rotate(-1.9 + Math.sin(f * 0.45) * 0.45);
  ctx.fillStyle = WH_INK; ctx.fillRect(0, -6, 28, 12); ctx.fillStyle = '#E8A070'; ctx.fillRect(1, -5, 26, 10);
  ctx.fillStyle = WH_INK; ctx.fillRect(25, -7, 11, 14); ctx.fillStyle = '#E8A070'; ctx.fillRect(26, -6, 9, 12); ctx.fillStyle = '#C47A48'; ctx.fillRect(26, 2, 9, P);
  ctx.restore();
  ctx.fillStyle = WH_INK; ctx.fillRect(x - 21, -54, 9, 26); ctx.fillStyle = '#E8A070'; ctx.fillRect(x - 20, -53, 7, 24);
};

/** A gondola (its floor's middle at x, y): the hanger up off the top, the petal back, the posts, the toadstool cap
 *  with its lights and wings, the floor (a lit lip) and the flower bowl under it; a suitor in it, waving, if given. */
const gondola = (ctx: Ctx, x: number, y: number, k: number, f: number, s = 1, suitor?: number) => {
  const cap = WH_CAPS[k % WH_CAPS.length];
  ctx.save(); ctx.translate(snap(x), snap(y)); ctx.scale(s, s);
  ctx.fillStyle = WH_INK; ctx.fillRect(-3, -260, 6, 172); ctx.fillStyle = '#B8A8D8'; ctx.fillRect(-1, -260, P, 172);
  // (the wings, either side of the cap, flapping slow)
  for (const sd of [-1, 1]) {
    ctx.save(); ctx.translate(sd * 54, -92); ctx.rotate(sd * (-0.5 + Math.sin(f * 0.08 + k) * 0.25)); ctx.scale(sd, 1);
    ctx.fillStyle = 'rgba(26, 16, 40, 0.8)'; ctx.beginPath(); ctx.ellipse(16, -8, 20, 10, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(220, 208, 255, 0.8)'; ctx.beginPath(); ctx.ellipse(16, -8, 18, 8, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'; ctx.fillRect(6, -12, 10, P);
    ctx.restore();
  }
  // (the petal back: lit left, its right half shaded in a dither)
  ctx.fillStyle = WH_INK; ctx.beginPath(); ctx.moveTo(-50, 0); ctx.quadraticCurveTo(-50, -60, 0, -66); ctx.quadraticCurveTo(50, -60, 50, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = tint(cap, 0.45); ctx.beginPath(); ctx.moveTo(-48, 0); ctx.quadraticCurveTo(-48, -58, 0, -64); ctx.quadraticCurveTo(48, -58, 48, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = tint(cap, 0.15); ctx.fillRect(14, -52, 32, 52); checker(ctx, 8, -52, 6, 52, tint(cap, 0.15));
  ctx.fillStyle = tint(cap, -0.1); for (let p = -2; p <= 2; p++) ctx.fillRect(p * 17, -50 + Math.abs(p) * 6, P, 48 - Math.abs(p) * 6);
  for (const sd of [-1, 1]) { ctx.fillStyle = WH_INK; ctx.fillRect(sd * 48 - 3, -90, 6, 90); ctx.fillStyle = '#FFF0D8'; ctx.fillRect(sd * 48 - 2, -90, 4, 90); }
  if (suitor !== undefined) waver(ctx, suitor * 24, f);
  // (the cap: a toadstool's, in three steps, spotted)
  ctx.fillStyle = WH_INK; ctx.beginPath(); ctx.ellipse(0, -90, 64, 26, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = cap; ctx.beginPath(); ctx.ellipse(0, -90, 62, 24, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = tint(cap, -0.15); ctx.fillRect(-60, -98, 120, 8); checker(ctx, -60, -100, 120, P, tint(cap, -0.15));
  ctx.fillStyle = tint(cap, 0.4); ctx.beginPath(); ctx.ellipse(-14, -104, 26, 7, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; for (const [sx, sy, r] of [[-34, -100, 5], [-6, -108, 4], [22, -102, 6], [44, -96, 3]]) ctx.fillRect(sx - r, sy - r * 0.6, r * 2, r * 1.2);
  ctx.fillStyle = WH_INK; ctx.fillRect(-62, -91, 124, 8); ctx.fillStyle = tint(cap, -0.28); ctx.fillRect(-60, -90, 120, 6);
  for (let i = 0; i < 7; i++) { ctx.fillStyle = (i + Math.floor(f / 6) + k) % 3 ? '#FEF08A' : '#A5F3FC'; ctx.fillRect(-54 + i * 18, -84, 4, 4); }
  // (the bowl, scalloped; the floor, its top lit)
  ctx.fillStyle = WH_INK; ctx.beginPath(); ctx.moveTo(-54, 6); ctx.quadraticCurveTo(0, 38, 54, 6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = tint(cap, -0.12); ctx.beginPath(); ctx.moveTo(-52, 7); ctx.quadraticCurveTo(0, 35, 52, 7); ctx.closePath(); ctx.fill();
  ctx.fillStyle = tint(cap, 0.25); for (let p = -2; p <= 2; p++) ctx.fillRect(p * 19 - 8, 10, 16, 4);
  ctx.fillStyle = WH_INK; ctx.fillRect(-53, -1, 106, 10);
  ctx.fillStyle = '#A85A98'; ctx.fillRect(-52, 0, 104, 8); ctx.fillStyle = '#FFF6C8'; ctx.fillRect(-52, 0, 104, 2); ctx.fillStyle = '#6E2A6E'; ctx.fillRect(-52, 6, 104, 2);
  ctx.restore();
};

/** A string of fairy lights along a curve (a to b, bent by c): its wire, its bulbs (lit, twinkling; one popped, if
 *  given), streaking if it's going past fast. */
const lightString = (ctx: Ctx, a: [number, number], c: [number, number], b: [number, number], f: number, seed: number, streak = 0, popped = -1) => {
  const at = (u: number): [number, number] => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]];
  ctx.strokeStyle = '#1F3A24'; ctx.lineWidth = 2; ctx.beginPath();
  for (let i = 0; i <= 24; i++) { const [x, y] = at(i / 24); if (i) ctx.lineTo(snap(x), snap(y)); else ctx.moveTo(snap(x), snap(y)); }
  ctx.stroke();
  const n = 15;
  for (let i = 1; i < n; i++) {
    const [x, y] = at(i / n), col = WH_BULBS[(i + seed) % WH_BULBS.length];
    const on = i !== popped && (i * 7 + seed + Math.floor(f / 8)) % 6 !== 0;
    if (streak > 0) { ctx.fillStyle = `${col}66`; ctx.fillRect(snap(x), snap(y + 6), P, snap(streak)); ctx.fillStyle = `${col}33`; ctx.fillRect(snap(x), snap(y + 6 + streak), P, snap(streak)); }
    if (on && streak === 0) steppedGlow(ctx, x, y + 4, 12, col, 0.35, 0, 3);
    ctx.fillStyle = WH_INK; ctx.fillRect(snap(x) - 2, snap(y), 6, P * 2);
    ctx.fillStyle = i === popped ? '#3F3A36' : on ? col : tint(col, -0.55); ctx.fillRect(snap(x) - 2, snap(y) + P * 2, 6, 6);
    if (on && i !== popped) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(snap(x) - 2, snap(y) + P * 2, P, P); }
  }
  return at;
};

/** A flower stood up out of the soil at (x, base), h tall: a tulip, a daisy or a bluebell. */
const flower = (ctx: Ctx, x: number, base: number, h: number, kind: number) => {
  x = snap(x);
  ctx.fillStyle = '#2E6A2E'; ctx.fillRect(x, base - h, P, h); ctx.fillStyle = '#4A9A3A'; ctx.fillRect(x - 4, snap(base - h * 0.45), 4, P); ctx.fillRect(x + P, snap(base - h * 0.7), 4, P);
  const y = snap(base - h);
  if (kind % 3 === 0) { ctx.fillStyle = '#BE185D'; ctx.fillRect(x - 4, y - 6, 10, 8); ctx.fillStyle = '#F472B6'; ctx.fillRect(x - 4, y - 8, 10, 6); ctx.fillStyle = '#FBCFE8'; ctx.fillRect(x - 4, y - 8, P, 4); ctx.fillStyle = '#BE185D'; ctx.fillRect(x, y - 8, P, P); }
  else if (kind % 3 === 1) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - 6, y - 4, 14, 4); ctx.fillRect(x - 2, y - 8, 6, 12); ctx.fillStyle = '#E2D6EE'; ctx.fillRect(x - 6, y - 2, 14, P); ctx.fillStyle = '#FDE047'; ctx.fillRect(x - 1, y - 4, 4, 4); ctx.fillStyle = '#CA8A04'; ctx.fillRect(x + 1, y - 2, P, P); }
  else { ctx.fillStyle = '#7C6CC4'; ctx.fillRect(x - 4, y - 4, 10, 8); ctx.fillStyle = '#C4B5FD'; ctx.fillRect(x - 4, y - 6, 10, 6); ctx.fillStyle = '#EDE9FE'; ctx.fillRect(x - 2, y - 6, P, P); ctx.fillStyle = '#7C6CC4'; ctx.fillRect(x - 4, y + 2, P, P); ctx.fillRect(x + 4, y + 2, P, P); }
};

/** The far off behind the wheel (a layer of its own, its foot at WH_SKY_H): the Alps in snow (no volcanoes), the Great
 *  Pixie's castle on its crag with Piper's pink window, and the fairground's tops (a big top, the drop tower, the
 *  helter-skelter, the swing ride) with bunting between, snowy pines along the bottom; all in the evening's haze. */
const WH_SKY_H = 300;
const paintWheelSkyline = (W: number) => (g: Ctx) => {
  const foot = WH_SKY_H;
  const fill = (col: string, pts: number[]) => { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fill(); };
  // (the Alps: jagged, lit faces and shade, snow down from the peaks)
  const peak = (x: number) => { let t = 0; for (const [px, h] of [[60, 150], [190, 196], [330, 140], [470, 210], [610, 160], [740, 188], [880, 150]] as const) t = Math.max(t, h - Math.abs(x - px) * 1.1); return foot - 70 - Math.max(20, t) + (hash(Math.floor(x / 6)) - 0.5) * 6; };
  for (let x = 0; x < W; x += P) {
    const y = peak(x), lit = peak(x + 2) < peak(x - 2);
    g.fillStyle = lit ? '#7E78AE' : '#625C92'; g.fillRect(x, snap(y), P, foot - y);
    const sl = foot - 150 + Math.sin(x * 0.03) * 14;
    if (sl > y) { g.fillStyle = lit ? '#E4DAF4' : '#B8B0DC'; g.fillRect(x, snap(y), P, snap(sl - y)); }
  }
  hazeBands(g, 0, foot - 160, W, 160, '#C8A0DC', 0.1, 0.55, 5);
  // (the castle on its crag)
  const cx = W * 0.3, base = foot - 60;
  fill('#5A527E', [cx - 80, base + 40, cx - 50, base - 20, cx - 10, base - 34, cx + 40, base - 18, cx + 86, base + 40]);
  const tower = (x: number, top: number, w: number, roofH: number) => {
    g.fillStyle = WH_INK; g.fillRect(snap(x - w / 2 - 1), snap(top - 1), w + 2, base - top + 2);
    g.fillStyle = '#C8BCE0'; g.fillRect(snap(x - w / 2), snap(top), w, base - top); g.fillStyle = '#E6DCF4'; g.fillRect(snap(x - w / 2), snap(top), Math.max(P, snap(w * 0.3)), base - top); g.fillStyle = '#9A8EC0'; g.fillRect(snap(x + w * 0.2), snap(top), Math.max(P, snap(w * 0.3)), base - top);
    fill(WH_INK, [x - w / 2 - 3, top, x, top - roofH - 2, x + w / 2 + 3, top]); fill('#4A78D4', [x - w / 2 - 2, top - 1, x, top - roofH, x + w / 2 + 2, top - 1]); fill('#7AA8F0', [x - w / 2 - 2, top - 1, x, top - roofH, x - w * 0.1, top - 1]);
    g.fillStyle = '#F2C84A'; g.fillRect(snap(x - w / 2 - 2), snap(top - 4), w + 4, P);
    g.fillStyle = '#FFE9A8'; g.fillRect(snap(x - 1), snap(top + 8), P, 6);
  };
  tower(cx - 40, base - 70, 14, 30); tower(cx + 44, base - 64, 14, 26); tower(cx - 18, base - 110, 18, 40); tower(cx + 20, base - 104, 16, 36); tower(cx, base - 160, 22, 54);
  g.fillStyle = '#FF8AC8'; g.fillRect(snap(cx - 3), snap(base - 150), 6, 10); g.fillStyle = '#FFD0E8'; g.fillRect(snap(cx - 3), snap(base - 150), P, 4);
  g.fillStyle = '#B8ACD4'; g.fillRect(snap(cx - 56), snap(base - 30), 112, 30); for (let k = 0; k < 14; k++) g.fillRect(snap(cx - 56 + k * 8), snap(base - 36), 4, 6);
  // (the fairground's tops along the bottom)
  const fair = foot - 10;
  // (a big top)
  for (let k = 0; k < 8; k++) fill(k % 2 ? '#F4E8F0' : '#D8508E', [W * 0.55 + k * 18, fair, W * 0.55 + 72, fair - 90, W * 0.55 + (k + 1) * 18, fair]);
  // (the drop tower and its star)
  const tx = W * 0.82; g.fillStyle = '#5A527E'; g.fillRect(snap(tx - 7), snap(fair - 230), 14, 230); g.fillStyle = '#8A80B0'; g.fillRect(snap(tx - 7), snap(fair - 230), 4, 230);
  for (let y = fair - 220; y < fair; y += 16) { g.fillStyle = '#4A4270'; g.fillRect(snap(tx - 7), snap(y), 14, P); }
  fill('#F2C84A', [tx, fair - 262, tx + 5, fair - 248, tx + 16, fair - 246, tx + 7, fair - 238, tx + 10, fair - 226, tx, fair - 234, tx - 10, fair - 226, tx - 7, fair - 238, tx - 16, fair - 246, tx - 5, fair - 248]);
  // (the helter-skelter)
  const hx = W * 0.7; for (let k = 0; k < 8; k++) { g.fillStyle = k % 2 ? '#F49AC8' : '#FFF0F8'; g.fillRect(snap(hx - 10 - k), snap(fair - 140 + k * 17), 20 + k * 2, 17); }
  fill('#9EE6C8', [hx - 14, fair - 140, hx, fair - 172, hx + 14, fair - 140]);
  // (bunting slung between them; snowy pines along the bottom)
  const flags = ['#E0408A', '#F6D365', '#4A78D4', '#9EE6C8'];
  for (let k = 0; k < 20; k++) { const t = k / 20, x = hx + (tx - hx) * t, y = fair - 130 + (fair - 200 - (fair - 130)) * t + Math.sin(t * Math.PI) * 24; fill(flags[k % 4], [x - 3, y, x + 3, y, x, y + 6]); }
  for (let x = 0; x < W; x += 16) { const h = 24 + hash(x) * 22; for (let k = 0; k < 3; k++) fill(k % 2 ? '#2C4E50' : '#1E3A3E', [x - 4 - k * 4, foot - h + k * h / 3 + h / 3, x, foot - h + k * h / 3, x + 4 + k * 4, foot - h + k * h / 3 + h / 3]); g.fillStyle = '#E8ECF8'; g.fillRect(snap(x - 6), snap(foot - h + h / 3), 8, P); }
  g.fillStyle = '#1E3A3E'; g.fillRect(0, foot - 6, W, 6);
  hazeBands(g, 0, foot - 120, W, 120, '#C8A0DC', 0.05, 0.25, 4);
};
/** Clouds the camera falls past (stepped puffs), y in the fall's scroll. */
const wheelClouds = (ctx: Ctx, W: number, rest: number) => {
  for (let i = 0; i < 9; i++) {
    const x = hash(i * 3.3) * W, y = -200 + i * 150 + rest * 0.55 - 300, s = 0.7 + hash(i * 1.7) * 0.8;
    if (y < -80 || y > 520) continue;
    for (const [col, dy, k] of [['#9A88C8', 4, 1], ['#C8B4E4', 0, 0.9], ['#F0DCF4', -4, 0.7], ['#FFFFFF', -7, 0.35]] as const) for (let p = 0; p < 5; p++) pixelBlob(ctx, x + (p - 2) * 22 * s, y - Math.sin((p / 4) * Math.PI) * 16 * s + dy * s, 20 * s * k, 11 * s * k, col);
  }
};

/** The plaza under the wheel (in a layer of its own, WH_GL_TOP its top): the hedge along the back, the cobbles, the
 *  raised flower bed in the middle (its soil at WH_BED) with its flowers and toadstools (none where he goes in). */
const paintWheelGround = (W: number) => (g: Ctx) => {
  const cx = W / 2, fl = WH_FLOOR - WH_GL_TOP, bed = WH_BED - WH_GL_TOP;
  // The hedge along the back, flowers dotted in it
  for (let k = 0; k < 15; k++) { const x = k * 60 + hash(k) * 20 - 20, r = 30 + hash(k + 5) * 12; pixelBlob(g, x, fl - 6, r, r * 0.75, '#3E6A5E'); pixelBlob(g, x - 6, fl - 12 - r * 0.2, r * 0.7, r * 0.45, '#5A8A72'); pixelBlob(g, x - 10, fl - 16 - r * 0.3, r * 0.35, r * 0.2, '#7EAE8E'); }
  for (let k = 0; k < 46; k++) { g.fillStyle = ['#F9A8D4', '#FEF08A', '#FFFFFF', '#C4B5FD'][k % 4]; g.fillRect(snap(hash(k * 3 + 1) * W), snap(fl - 8 - hash(k * 5 + 2) * 30), P, P); }
  // The cobbles: rows getting deeper toward the front, each stone lit along its top, shaded along its bottom
  bandedGradient(g, 0, fl, W, WH_GL_H - fl, ['#7C6C94', '#6C5C86', '#5C4C78', '#4C3E66'], 6);
  g.fillStyle = '#E2D6EE'; g.fillRect(0, fl, W, P);
  for (let y = fl + P, r = 0; y < WH_GL_H; r++) {
    const h = 8 + r * 3, w = Math.round(h * 2.4), off = (r % 2) * (w / 2);
    for (let x = -off; x < W; x += w) {
      g.fillStyle = ['#B4A6C8', '#A294B8', '#9284AA'][Math.floor(hash(r * 31 + x) * 3)];
      g.fillRect(snap(x + 2), snap(y + 1), snap(w - 4), snap(h - 2));
      g.fillStyle = '#D4C8E2'; g.fillRect(snap(x + 2), snap(y + 1), snap(w - 4), P);
      g.fillStyle = '#6C5C86'; g.fillRect(snap(x + 2), snap(y + h - 3), snap(w - 4), P);
    }
    y += h;
  }
  hazeBands(g, 0, fl, W, WH_GL_H - fl, '#2A1E40', 0.05, 0.4, 5);
  // The bed's shadow on them
  g.fillStyle = 'rgba(42, 30, 64, 0.4)'; g.fillRect(cx - 170, fl + 8, 340, 10); checker(g, cx - 170, fl + 18, 340, P * 2, 'rgba(42, 30, 64, 0.4)');
  // The bed: its soil heaped up over the cap stones, the stone curb (cap course, face course, its right end shaded)
  const bx0 = cx - 160, bx1 = cx + 160, cap = bed + 2, face = bed + 10, bot = fl + 8;
  g.fillStyle = WH_INK; g.fillRect(bx0 - 2, cap - 2, bx1 - bx0 + 4, bot - cap + 4);
  for (let x = bx0, i = 0; x < bx1; x += 40, i++) {
    const w = Math.min(40, bx1 - x);
    g.fillStyle = '#E4D8EC'; g.fillRect(x, cap, w - P, face - cap - P); g.fillStyle = '#FFFFFF'; g.fillRect(x, cap, w - P, P); g.fillStyle = '#B4A4C4'; g.fillRect(x, face - P * 2, w - P, P);
    const fx = x - (i % 2 ? 20 : 0);
    for (const xx of [fx, fx + 40]) { const a = Math.max(bx0, xx), b = Math.min(bx1, xx + 40); if (b - a < 4) continue; g.fillStyle = '#C4B4D4'; g.fillRect(a, face, b - a - P, bot - face); g.fillStyle = '#A494B4'; g.fillRect(b - 10, face, 8, bot - face); checker(g, b - 14, face, 4, bot - face, '#A494B4'); }
  }
  g.fillStyle = 'rgba(42, 30, 64, 0.45)'; g.fillRect(bx1 - 40, cap, 40, bot - cap); checker(g, bx1 - 52, cap, 12, bot - cap, 'rgba(42, 30, 64, 0.45)');
  g.fillStyle = '#3A2014'; g.fillRect(bx0 + 4, bed - 2, bx1 - bx0 - 8, 6); pixelBlob(g, cx, bed, 150, 6, '#3A2014');
  g.fillStyle = '#5C3A22'; for (let k = 0; k < 40; k++) g.fillRect(snap(bx0 + 8 + hash(k + 40) * (bx1 - bx0 - 16)), snap(bed - 4 + hash(k + 60) * 6), P, P);
  // Its flowers (none in the middle, where he's coming down), and a pair of toadstools
  for (let k = 0; k < 26; k++) { const x = bx0 + 12 + k * 11.6; if (Math.abs(x - cx) < 52) continue; flower(g, x + (hash(k) - 0.5) * 6, bed - 2, 14 + hash(k + 9) * 18, k); }
  for (const [x, s] of [[cx - 122, 1], [cx + 114, 0.8]] as const) {
    g.fillStyle = '#FFF0D8'; g.fillRect(snap(x - 3 * s), snap(bed - 12 * s), snap(6 * s) + P, snap(12 * s)); g.fillStyle = '#D8C4A8'; g.fillRect(snap(x + 1 * s), snap(bed - 12 * s), P, snap(12 * s));
    g.fillStyle = WH_INK; g.beginPath(); g.ellipse(x, bed - 11 * s, 14 * s, 11 * s, 0, Math.PI, 0); g.fill();
    g.fillStyle = '#DC2626'; g.beginPath(); g.ellipse(x, bed - 11 * s, 12 * s, 9 * s, 0, Math.PI, 0); g.fill();
    g.fillStyle = '#991B1B'; g.fillRect(snap(x - 12 * s), snap(bed - 14 * s), snap(24 * s), P);
    g.fillStyle = '#FFFFFF'; g.fillRect(snap(x - 6 * s), snap(bed - 18 * s), P * 2, P); g.fillRect(snap(x + 3 * s), snap(bed - 16 * s), P, P); g.fillRect(snap(x - 1 * s), snap(bed - 20 * s), P, P);
  }
};

/** The flowers in the middle of the bed: stood up, or (once he's come down on them) flattened out from under him. */
const middleFlowers = (ctx: Ctx, cx: number, bed: number, flat: boolean) => {
  const at = [-44, -32, -18, -6, 8, 20, 34, 46];
  at.forEach((dx, k) => {
    if (!flat) { flower(ctx, cx + dx, bed - 2, 16 + hash(k + 70) * 14, k + 1); return; }
    const sd = dx < 0 ? -1 : 1, x = snap(cx + dx + sd * 10), y = snap(bed - 2);
    ctx.fillStyle = '#2E6A2E'; ctx.fillRect(sd < 0 ? x - 14 : x, y - P, 14, P);
    ctx.fillStyle = ['#F472B6', '#FFFFFF', '#C4B5FD'][(k + 1) % 3]; ctx.fillRect(sd < 0 ? x - 20 : x + 14, y - 4, 6, 4);
    ctx.fillStyle = '#991B1B'; if (k % 2) ctx.fillRect(sd < 0 ? x - 20 : x + 14, y - 4, P, P);
  });
};

/** A bluebird, at (x, y) its feet, facing dir: perched (its beak open when it's tweeting) or flying (its wings). */
const bluebird = (ctx: Ctx, x: number, y: number, dir: number, flap: number, tweet: boolean) => {
  ctx.save(); ctx.translate(snap(x), snap(y)); ctx.scale(dir, 1);
  ctx.fillStyle = WH_INK; ctx.fillRect(-8, -14, 18, 12); ctx.fillRect(4, -20, 10, 10);
  ctx.fillStyle = '#3B82F6'; ctx.fillRect(-7, -13, 16, 10); ctx.fillRect(5, -19, 8, 8);
  ctx.fillStyle = '#FB923C'; ctx.fillRect(-1, -8, 10, 5); ctx.fillStyle = '#FDBA74'; ctx.fillRect(1, -8, 6, P);
  ctx.fillStyle = '#1D4ED8'; ctx.fillRect(-12, -12, 6, 4);
  ctx.fillStyle = WH_INK; ctx.fillRect(9, -17, P, P);
  ctx.fillStyle = '#F59E0B'; ctx.fillRect(13, -15, 4, P); if (tweet) ctx.fillRect(13, -12, 4, P);
  if (flap >= 0) { ctx.fillStyle = '#1D4ED8'; ctx.fillRect(-6, flap ? -24 : -6, 10, flap ? 12 : 8); ctx.fillStyle = '#60A5FA'; ctx.fillRect(-6, flap ? -24 : -6, 10, P); }
  else { ctx.fillStyle = '#1D4ED8'; ctx.fillRect(-6, -12, 10, 6); ctx.fillStyle = '#78350F'; ctx.fillRect(-2, -3, P, 3); ctx.fillRect(3, -3, P, 3); }
  ctx.restore();
};

/**
 * Meathead 2's fairy wheel: thrown out of a gondola (or off the wheel) all the way down. The camera falls with him,
 * him tumbling and screaming, the wheel turning slow behind, the gondolas and the strings of fairy lights whipping up
 * past him faster and faster, the suitor who threw him out waving bye-bye from his cart as it goes up out of the shot.
 * The camera stops with the plaza come up into the shot, and he comes down past it, face first into the flower bed,
 * in up to his shoulders, legs up, kicking; dirt and petals up, blood up the curb and out across the cobbles; hearts
 * fluttering down. A string of fairy lights comes down after him, across his legs, and shorts on him (his legs jump,
 * a bulb pops, his boots smoke); a bluebird lands on his upturned boot and tweets.
 */
const fairyWheel = (ctx: Ctx, state: GameState, d: MeatheadDeath, t: number, f: number, W: number, H: number) => {
  const cx = W / 2, s = t - WHEEL_HIT, hit = s >= 0;
  const sc = wheelScroll(t), rest = WH_SC - sc;
  const speed = t < WHEEL_STOP ? 6 + 0.5 * t : 0;
  // The sky: evening over the park, banded
  bandedGradient(ctx, 0, 0, W, H, ['#2A2F7A', '#4A4CA8', '#8A78CC', '#C8A0DC', '#F0C0D8', '#F8D8D0'], 14);
  // The far off coming up into the shot as he falls (the Alps, the castle, the fairground's tops), clouds whipping past
  {
    const sy = WH_GL_TOP + 24 - WH_SKY_H + rest * 0.3;
    wheelClouds(ctx, W, rest);
    if (sy < H) {
      if (typeof document === 'undefined') { ctx.save(); ctx.translate(0, sy); paintWheelSkyline(W)(ctx); ctx.restore(); }
      else ctx.drawImage(stillCanvas('wheel-skyline', W, WH_SKY_H, paintWheelSkyline(W)), 0, snap(sy));
    }
  }
  // The wheel, far: its rim and spokes and lights turning slow, its gondolas round it, the A-frame down to the plaza
  {
    const hx = cx + 120, hy = 30 + rest * 0.35, ang = t * 0.004, R0 = 380;
    for (const sd of [-1, 1]) {
      ctx.strokeStyle = '#3A2E5A'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + sd * 340, hy + 1200); ctx.stroke();
      ctx.strokeStyle = '#9C8CC0'; ctx.lineWidth = 12; ctx.stroke();
      ctx.strokeStyle = '#7A6AA2'; ctx.lineWidth = 3; for (let k = 1; k < 10; k++) { const ax = hx + sd * 34 * k, ay = hy + 120 * k; ctx.beginPath(); ctx.moveTo(ax - 6, ay); ctx.lineTo(ax + 6, ay - 40); ctx.stroke(); }
    }
    for (let k = 0; k < 24; k++) { const a = ang + (k * Math.PI) / 12; ctx.strokeStyle = '#3A2E5A'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + Math.cos(a) * R0, hy + Math.sin(a) * R0); ctx.stroke(); ctx.strokeStyle = k % 2 ? '#C890B8' : '#90C0B8'; ctx.lineWidth = 2; ctx.stroke(); }
    for (const [r, w, col] of [[R0, 9, '#B8A0D0'], [R0 - 50, 5, '#A890C4']] as const) { ctx.strokeStyle = '#3A2E5A'; ctx.lineWidth = w + 3; ctx.beginPath(); ctx.arc(hx, hy, r, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); }
    for (let k = 0; k < 72; k++) { const a = ang + (k * Math.PI) / 36; ctx.fillStyle = (k * 7 + Math.floor(f / 10)) % 5 ? WH_BULBS[k % 4] : '#5A4A7A'; ctx.fillRect(snap(hx + Math.cos(a) * (R0 + 7)) - 1, snap(hy + Math.sin(a) * (R0 + 7)) - 1, 3, 3); }
    for (let k = 0; k < 12; k++) {
      const a = ang + (k * Math.PI) / 6, gx = hx + Math.cos(a) * R0, gy = hy + Math.sin(a) * R0 + 40;
      ctx.fillStyle = '#3A2E5A'; ctx.fillRect(snap(gx) - 1, snap(gy - 40), P, 30);
      ctx.fillStyle = tint(WH_CAPS[k % 4], -0.25); ctx.beginPath(); ctx.ellipse(gx, gy - 14, 20, 9, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#7A5A8A'; ctx.fillRect(snap(gx - 16), snap(gy), 32, 4); ctx.fillStyle = tint(WH_CAPS[k % 4], 0.1); ctx.fillRect(snap(gx - 14), snap(gy - 14), 28, 14);
    }
    for (let k = 0; k < 8; k++) { const a = ang + (k * Math.PI) / 4; ctx.fillStyle = k % 2 ? '#C890B8' : '#D8A8C8'; ctx.beginPath(); ctx.ellipse(hx + Math.cos(a) * 30, hy + Math.sin(a) * 30, 24, 11, a, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#C8A848'; ctx.beginPath(); ctx.arc(hx, hy, 20, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#A88830'; ctx.fillRect(hx, hy, 12, 12);
    // (it's back in the haze)
    hazeBands(ctx, 0, 0, W, H, '#C8A0DC', 0.28, 0.12, 4);
  }
  // The gondolas whipping up past him; first, the one he was thrown out of, and the suitor in it waving him bye-bye
  const fs = d.facing;
  const carts: [number, number, number, number | undefined][] = [
    [cx + fs * 110, 150 - WH_SC, 1, -fs], [cx - 250, -600, 2, undefined], [cx + 255, -420, 3, undefined], [cx - 240, -250, 0, undefined], [cx + 245, -160, 2, undefined],
  ];
  for (const [x, wy, k, side] of carts) { const y = wy + rest; if (y > -50 && y < H + 300) gondola(ctx, x, y, k, f, 1, side); }
  if (t < 30) heart(ctx, cx + fs * 110 - fs * 24 + Math.sin(t * 0.3) * 6, 150 - WH_SC + rest - 100 - t * 1.2, '#F472B6', 3);
  // The plaza, come up into the shot (painted the once)
  const gy = WH_GL_TOP + rest;
  if (gy < H) {
    if (typeof document === 'undefined') { ctx.save(); ctx.translate(0, gy); paintWheelGround(W)(ctx); ctx.restore(); }
    else ctx.drawImage(stillCanvas('wheel-plaza', W, WH_GL_H, paintWheelGround(W)), 0, snap(gy));
  }
  const bed = WH_BED + rest;
  if (bed < H + 40) middleFlowers(ctx, cx, bed, hit);
  // Blood: up the curb, over the soil, out across the cobbles
  if (hit) {
    pool(ctx, cx + 24, WH_FLOOR + 18, Math.min(86, Math.max(0, s - 8) * 1.5));
    splatter(ctx, cx, WH_BED - 4, 96, 81, 0.3); splatter(ctx, cx + 10, WH_BED + 14, 64, 87, 0.45);
    for (let k = 0; k < 6; k++) { const x = snap(cx - 40 + k * 16 + hash(k + 90) * 6); ctx.fillStyle = '#991B1B'; ctx.fillRect(x, WH_BED + 4, P, snap(Math.min(WH_FLOOR + 8 - WH_BED, s * (0.5 + hash(k) * 0.6)))); ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x + P, WH_BED + 4, P, snap(Math.min(10, s * 0.4))); }
    // (the bouquet, come down with him, burst on the cobbles)
    const bxq = cx - 236, byq = WH_FLOOR + 26 - (s < 12 ? Math.abs(Math.sin(s * 0.5)) * (12 - s) : 0);
    ctx.save(); ctx.translate(snap(bxq), snap(byq)); ctx.rotate(-0.4);
    ctx.fillStyle = WH_INK; ctx.beginPath(); ctx.moveTo(-26, -2); ctx.lineTo(10, -12); ctx.lineTo(10, 10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#86EFAC'; ctx.beginPath(); ctx.moveTo(-23, -1); ctx.lineTo(8, -9); ctx.lineTo(8, 7); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#4ADE80'; ctx.fillRect(-10, 0, 18, 6);
    for (const [rx, ry, col] of [[14, -10, '#E11D48'], [18, 0, '#F472B6'], [12, 8, '#E11D48']] as const) { ctx.fillStyle = WH_INK; ctx.fillRect(rx - 6, ry - 6, 12, 12); ctx.fillStyle = col; ctx.fillRect(rx - 5, ry - 5, 10, 10); ctx.fillStyle = tint(col, -0.3); ctx.fillRect(rx - 1, ry - 3, P, 6); ctx.fillStyle = tint(col, 0.5); ctx.fillRect(rx - 5, ry - 5, P, P); }
    ctx.restore();
    for (let k = 0; k < 9; k++) { ctx.fillStyle = k % 2 ? '#E11D48' : '#F472B6'; ctx.fillRect(snap(bxq + 20 + hash(k + 20) * 70), snap(WH_FLOOR + 12 + hash(k + 30) * 30), P * 2, P); }
  }
  // Him: falling, tumbling, screaming; then (the camera stopped) down past it, turned head first, into the bed
  const r0 = -fs * 0.21, rStop = r0 * WHEEL_STOP;
  const target = Math.sign(r0) * (Math.PI + Math.PI * 2 * Math.ceil((Math.abs(rStop) - Math.PI) / (Math.PI * 2)));
  if (!hit) {
    const k = clamp01((t - WHEEL_STOP) / (WHEEL_HIT - WHEEL_STOP));
    const y = 220 + (WH_PLANT - 220) * k * k + (k === 0 ? Math.sin(t * 0.35) * 6 : 0);
    const rot = t < WHEEL_STOP ? r0 * t : rStop + (target - rStop) * (1 - (1 - k) * (1 - k));
    him(ctx, state, d, cx + (k === 0 ? Math.sin(t * 0.3) * 10 : 0), y, rot, 2, 'scream', { isGrounded: false, vel: { x: 0, y: 6 } });
  } else {
    const zap = s >= WHEEL_ZAP && s < WHEEL_ZAP + 24;
    const kick = Math.sin(s * 1.2) * 0.08 * Math.max(0, 1 - s / 40) + (zap ? (s % 4 < 2 ? 0.06 : -0.06) : 0);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, WH_BED + 1); ctx.clip();
    if (s < 6) { ctx.translate(cx, WH_BED); ctx.scale(1.1, 0.86 + s * 0.023); ctx.translate(-cx, -WH_BED); }
    if (zap && s % 2 === 0) ctx.filter = 'brightness(1.8) saturate(0.4)';
    else if (s >= WHEEL_ZAP + 24) ctx.filter = `brightness(${1 - clamp01((s - WHEEL_ZAP - 24) / 30) * 0.2})`;
    him(ctx, state, d, cx, WH_PLANT, Math.PI + kick, 2, 'dead');
    ctx.restore();
    // (the dirt heaped round his shoulders, bloody)
    pixelBlob(ctx, cx, WH_BED, 30, 7, '#3A2014'); pixelBlob(ctx, cx - 4, WH_BED - 3, 20, 4, '#5C3A22');
    ctx.fillStyle = '#991B1B'; for (let k = 0; k < 7; k++) ctx.fillRect(snap(cx - 24 + hash(k + 11) * 48), snap(WH_BED - 6 + hash(k + 12) * 8), P * (1 + (k % 2)), P);
    // (dirt, petals and blood up out of the bed)
    if (s < 22) for (let k = 0; k < 24; k++) {
      const vx = (hash(k * 3 + 5) - 0.5) * 11, vy = -(4 + hash(k * 7 + 1) * 7), x = cx + vx * s, y = WH_BED + vy * s + 0.45 * s * s;
      if (y > WH_BED + 4) continue;
      ctx.fillStyle = ['#3A2014', '#5C3A22', '#F472B6', '#FDE047', '#991B1B', '#FFFFFF'][k % 6];
      ctx.fillRect(snap(x), snap(y), k % 3 ? P * 2 : P * 3, P * 2);
    }
  }
  // The fairy lights: strings of them streaking up past him; after, one down onto him, shorting on his legs
  if (!hit) for (let k = 0; k < 4; k++) {
    const y = -120 - k * 340 + rest * 1.6;
    if (y < -80 || y > H + 80) continue;
    const tilt = (k % 2 ? 1 : -1) * 30;
    lightString(ctx, [-30, y + tilt], [cx, y + 70], [W + 30, y - tilt], f, k * 3, speed * 1.6);
  }
  if (hit && s >= WHEEL_LIGHTS) {
    const q = clamp01((s - WHEEL_LIGHTS) / 10), drop = -520 * (1 - q * q) + (q === 1 && s < WHEEL_LIGHTS + 16 ? -Math.sin((s - WHEEL_LIGHTS - 10) * 0.5) * 4 : 0);
    const a: [number, number] = [cx - 300, WH_FLOOR + 10 + drop], b: [number, number] = [cx + 280, WH_FLOOR + 16 + drop];
    const m = 392 + drop, c: [number, number] = [cx, (4 * m - a[1] - b[1]) / 2];
    const along = lightString(ctx, a, c, b, f, 2, 0, s >= WHEEL_POP ? 6 : -1);
    // (the short: sparks crackling over his legs, a flash; the bulb going pop; then his boots smoking)
    if (s >= WHEEL_ZAP && s < WHEEL_ZAP + 24) {
      if (s % 2 === 0) steppedGlow(ctx, cx, 392, 60, '#A5F3FC', 0.4, 0, 4);
      ctx.strokeStyle = s % 2 ? '#FFFFFF' : '#A5F3FC'; ctx.lineWidth = 2;
      for (let k = 0; k < 3; k++) { let x = cx - 18 + hash(s * 7 + k) * 36, y = 360 + hash(s * 3 + k) * 20; ctx.beginPath(); ctx.moveTo(snap(x), snap(y)); for (let j = 0; j < 4; j++) { x += (hash(s + k * 5 + j) - 0.5) * 16; y += 6 + hash(s * 2 + j + k) * 6; ctx.lineTo(snap(x), snap(y)); } ctx.stroke(); }
    }
    if (s >= WHEEL_POP && s < WHEEL_POP + 10) {
      const [px, py] = along(6 / 15), u = s - WHEEL_POP;
      for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? '#FFFFFF' : '#FEF08A'; ctx.fillRect(snap(px + (hash(k + 50) - 0.5) * u * 6), snap(py + 6 - u * 3 + hash(k + 51) * u * 2 + 0.3 * u * u), P, P); }
    }
    if (s > WHEEL_ZAP + 8) for (let k = 0; k < 4; k++) { const q2 = ((s - WHEEL_ZAP - 8) * 1.2 + k * 14) % 56 / 56; pixelBlob(ctx, cx - 6 + k * 4 + Math.sin(q2 * 6 + k) * 6, 362 - q2 * 90, 6 + q2 * 10, 5 + q2 * 7, `rgba(120, 113, 128, ${(0.6 * (1 - q2)).toFixed(3)})`); }
  }
  // The bluebird: down onto his upturned boot, and tweeting
  if (hit && s >= WHEEL_BIRD) {
    const q = clamp01((s - WHEEL_BIRD) / 16), bx = W + 30 + (cx + 6 - W - 30) * q, by = 150 + (364 - 150) * (1 - (1 - q) * (1 - q));
    const perched = q >= 1, tweet = perched && (s - WHEEL_BIRD) % 10 < 4 && s >= WHEEL_BIRD + 10;
    bluebird(ctx, bx, by - (perched && (s - WHEEL_BIRD) % 22 < 2 ? 2 : 0), -1, perched ? -1 : Math.floor(s / 3) % 2, tweet);
  }
  // Hearts and petals fluttering down over it all, after
  if (hit) for (let k = 0; k < 6; k++) {
    const y = -20 + s * (0.9 + hash(k + 3) * 0.6) - k * 36;
    if (y < -20 || y > WH_FLOOR) continue;
    const x = cx - 230 + k * 92 + Math.sin(s * 0.07 + k) * 22;
    if (k % 2) heart(ctx, x, y, '#F472B6'); else { ctx.fillStyle = '#F9A8D4'; ctx.fillRect(snap(x), snap(y), P * 2, P); ctx.fillStyle = '#FBCFE8'; ctx.fillRect(snap(x), snap(y), P, P); }
  }
  // Going down: the speed lines, and petals and glitter streaming up past him
  if (!hit && speed > 0) {
    const a = clamp01(speed / 30);
    for (let k = 0; k < 40; k++) {
      const x = snap(hash(k * 5) * W), len = 60 + hash(k) * 160, y = (((k * 97 - sc * (1.2 + hash(k + 3) * 0.6)) % (H + len)) + H + len) % (H + len) - len;
      if (Math.abs(x - cx) < 50 && hash(k) < 0.7) continue;
      ctx.fillStyle = `rgba(255, 255, 255, ${(a * (0.25 + hash(k + 9) * 0.4)).toFixed(3)})`; ctx.fillRect(x, snap(y), k % 4 === 0 ? P * 2 : P, snap(len));
    }
    for (let k = 0; k < 24; k++) {
      const y = (((k * 53 - sc * 1.3) % (H + 40)) + H + 40) % (H + 40) - 20, x = hash(k + 7) * W + Math.sin(t * 0.2 + k) * 10;
      ctx.fillStyle = ['#F9A8D4', '#FEF08A', '#FFFFFF', '#A5F3FC'][k % 4]; ctx.fillRect(snap(x), snap(y), P, k % 3 ? P * 2 : P * 4);
    }
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
  const OUT = d.outAt ?? SPACE_OUT;
  const up = clamp01(t / OUT), out = clamp01((t - OUT + 20) / 40);
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
  const lines = 1 - clamp01((t - OUT + 10) / 30);
  if (lines > 0) for (let k = 0; k < 46; k++) {
    const x = snap(hash(k * 5) * W), len = 80 + hash(k) * 220, y = ((t * (40 + hash(k + 3) * 30) + k * 97) % (H + len)) - len;
    if (Math.abs(x - W / 2) < 46 && hash(k) < 0.7) continue;
    ctx.fillStyle = `rgba(255, 255, 255, ${(lines * (0.35 + hash(k + 9) * 0.5)).toFixed(3)})`;
    ctx.fillRect(x, snap(y), k % 4 === 0 ? P * 2 : P, snap(len));
  }
  // Him: shot up spinning, slowing; then drifting, turning over, dead
  const drift = Math.max(0, t - OUT);
  const x = W / 2 + (up < 1 ? Math.sin(t * 1.3) * 6 * (1 - up) : drift * 0.35), y = H * 0.5 + (up < 1 ? 40 * (1 - up) : -drift * 0.22);
  const rot = up < 1 ? t * (0.5 - up * 0.35) : OUT * 0.325 + drift * 0.012;
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
  // (what he's yelling on the way up, over him)
  if (d.line && (d.talking || (d.lineUntil ?? 0) > t)) {
    ctx.font = '8px "Press Start 2P"';
    const words = d.line.split(' '), rows: string[] = [];
    for (const w of words) { const last = rows[rows.length - 1]; if (last && ctx.measureText(last + ' ' + w).width < 260) rows[rows.length - 1] = last + ' ' + w; else rows.push(w); }
    const bw = Math.max(...rows.map(r => ctx.measureText(r).width)) + 16, bh = rows.length * 12 + 10, bx = Math.max(8, Math.min(W - bw - 8, x - bw / 2)), byy = Math.max(8, y - 110 - bh);
    ctx.fillStyle = '#000000'; ctx.fillRect(bx - 2, byy - 2, bw + 4, bh + 4);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(bx, byy, bw, bh);
    ctx.beginPath(); ctx.moveTo(x - 6, byy + bh); ctx.lineTo(x + 6, byy + bh); ctx.lineTo(x, byy + bh + 10); ctx.fill();
    ctx.fillStyle = '#111827'; rows.forEach((r, k) => ctx.fillText(r, bx + 8, byy + 15 + k * 12));
  }
  if (drift > 40) for (let k = 0; k < 16; k++) if (hash(k * 7) < clamp01((drift - 40) / 60)) { ctx.fillStyle = '#F0F9FF'; ctx.fillRect(snap(x - 30 + hash(k) * 60), snap(y - 50 + hash(k + 3) * 100), P, P); }
};
