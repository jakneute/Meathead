// What's left of a boss killed with his weakness, left lying in the arena.
// Each is the boss's real sprite, wrecked in the way that weapon would:
// burned, melted, turned to stone, shattered, flattened, dissolved, overdosed,
// drowned in oil, or fried. Each plays out from the moment he dies (some a lot more than others) and settles into
// the wreck he stays as, with only a little going on after (smoke, drips, flies, a twitch).

import { WeaponType } from '../../../types';
import { BossCorpse } from '../../core/state';
import { drawBoss, makeSitter } from './index';
import { drawRock, PLAYER_ROCK } from './boulders';
import { skull } from '../../scenes/art/ink';
import { pixelBlob } from '../pixelArt';
import { drawFire } from '../fx/fire';
import { drawFlameLicks } from '../fx/fireball';

type Ctx = CanvasRenderingContext2D;
type Style = 'charred' | 'melted' | 'stone' | 'shattered' | 'flattened' | 'dissolved' | 'overdosed' | 'oiled' | 'fried';

const styleFor = (stageId: string, weapon: WeaponType): Style => {
  switch (weapon) {
    case 'FLAMETHROWER': return stageId === 'Artie Avalanche' ? 'melted' : 'charred';
    case 'TSUNAMI': return 'stone';
    case 'SHOTGUN': return 'shattered';
    case 'BOULDER': return 'flattened';
    case 'SLUDGE': return 'dissolved';
    case 'NEEDLES': return 'overdosed';
    case 'OIL_ROCKET': return 'oiled';
    case 'TASER': return 'fried';
    default: return 'charred';
  }
};

const S = 80; // boss sprite size

/** The boss's sprite, frozen in his final pose, in a local frame where (0,0) is its top-left. */
// (dead, and beaten to show it)
const sprite = (ctx: Ctx, c: BossCorpse) => drawBoss(ctx, { ...makeSitter(c.stageId), health: 0 }, c.stageId, c.frame0);

// ---------------------------------------------------------------------------
// The sprite, painted once
// ---------------------------------------------------------------------------

// He doesn't move once he's dead, so every look of him (burnt, stoned, frozen...) is painted the once into a canvas
// of its own (at 2x, for the zoomed-in cameras) and copied down after: no filters run every frame. The box takes in
// everything that sticks out past his 80px square (a hose, what's under the sludge).
const BX = -24, BY = -32, BW = 168, BH = 208, BS = 2;
const looks = new Map<string, HTMLCanvasElement>();
let looksOf = '';

const painted = (c: BossCorpse, key: string, paint: (g: Ctx) => void): HTMLCanvasElement | null => {
  if (typeof document === 'undefined') return null;
  const who = `${c.stageId}|${c.frame0}`;
  if (who !== looksOf) { looks.clear(); looksOf = who; }
  let cv = looks.get(key);
  if (!cv) {
    cv = document.createElement('canvas');
    cv.width = BW * BS; cv.height = BH * BS;
    const g = cv.getContext('2d')!;
    g.scale(BS, BS); g.translate(-BX, -BY);
    paint(g);
    looks.set(key, cv);
  }
  return cv;
};

/** Him, through `filter`. */
const spriteImg = (c: BossCorpse, filter: string) => painted(c, 'f:' + filter, g => { g.filter = filter; sprite(g, c); g.filter = 'none'; });

/** Only the bits of what `paint` draws that land on him (a tint, cracks, an x-ray), on their own. */
const onHim = (c: BossCorpse, key: string, paint: (g: Ctx) => void) => painted(c, 'm:' + key, g => {
  sprite(g, c);
  g.globalCompositeOperation = 'source-in';
  paint(g);
  g.globalCompositeOperation = 'source-over';
});

const blit = (ctx: Ctx, img: HTMLCanvasElement) => {
  const smooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(img, BX, BY, BW, BH);
  ctx.imageSmoothingEnabled = smooth;
};

/** Him, through `filter`, in the sprite's own frame. */
const body = (ctx: Ctx, c: BossCorpse, filter = 'none') => {
  const img = spriteImg(c, filter);
  if (img) blit(ctx, img);
  else { ctx.filter = filter; sprite(ctx, c); ctx.filter = 'none'; }
};

/** A layer from `onHim`, at `alpha`. */
const overlay = (ctx: Ctx, img: HTMLCanvasElement | null, alpha = 1) => {
  if (!img || alpha <= 0) return;
  ctx.globalAlpha = alpha; blit(ctx, img); ctx.globalAlpha = 1;
};

/** The top of his head (the highest bit of him over the middle of the sprite), measured once. */
const tops = new Map<string, number>();
const headTop = (c: BossCorpse) => {
  const key = `${c.stageId}|${c.frame0}`;
  let top = tops.get(key);
  if (top === undefined) {
    top = 4;
    const img = spriteImg(c, 'none');
    if (img) {
      const x0 = (28 - BX) * BS, y0 = 0, w = 24 * BS, h = (S - BY) * BS;
      const d = img.getContext('2d')!.getImageData(x0, y0, w, h).data;
      outer: for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 40) { top = y / BS + BY; break outer; }
    }
    if (tops.size > 16) tops.clear();
    tops.set(key, top);
  }
  return top;
};

// ---------------------------------------------------------------------------
// Timing
// ---------------------------------------------------------------------------

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** 0..1 over frames a..b. */
const seg = (age: number, a: number, b: number) => clamp01((age - a) / (b - a));
const easeOut = (u: number) => 1 - (1 - u) * (1 - u);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
/** One of `steps`, by u 0..1: looks change in hard steps, the way a 16-bit palette swap does. */
const stepOf = <T>(steps: T[], u: number) => steps[Math.min(steps.length - 1, Math.floor(clamp01(u) * steps.length))];
const PX = 2;
/** A chunky pixel, on the grid. */
const dot = (ctx: Ctx, x: number, y: number, color: string, w = PX, h = w) => {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x / PX) * PX, Math.round(y / PX) * PX, w, h);
};

/** How far over he's gone (0 standing .. 1 down) going over from `a`, `dur` frames, faster as he goes, a bounce when he lands. */
const fallOver = (age: number, a: number, dur: number, bounce = 0.07) => {
  if (age < a) return 0;
  const u = (age - a) / dur;
  if (u < 1) return u * u;
  const b = (age - a - dur) / 10;
  return b < 1 ? 1 - Math.sin(b * Math.PI) * bounce : 1;
};

/** Where his sprite is: its centre and how far it's turned. */
interface Pose { cx: number; cy: number; rot: number }
/** Standing (t 0) to keeled over on his side (t 1, as `lying` draws him). */
const fallingPose = (c: BossCorpse, x: number, floor: number, t: number): Pose => ({ cx: x, cy: floor - S / 2 + 6 * t, rot: c.facing * Math.PI / 2 * t });
const applyPose = (ctx: Ctx, p: Pose) => { ctx.translate(p.cx, p.cy); ctx.rotate(p.rot); ctx.translate(-S / 2, -S / 2); };
/** `fn` draws things where they are on him lying at `from`: draw them carried with him to `to`. */
const carried = (ctx: Ctx, from: Pose, to: Pose, fn: () => void) => {
  ctx.save();
  ctx.translate(to.cx, to.cy); ctx.rotate(to.rot - from.rot); ctx.translate(-from.cx, -from.cy);
  fn();
  ctx.restore();
};

/** Chunky puffs (smoke, steam, dust) rolling up off (x, y): `amt` 0..1 how thick, `w` how wide a column. */
const puffs = (ctx: Ctx, x: number, y: number, frame: number, rgb: string, amt: number, n = 5, w = 30, rise = 80, size = 10, seed = 0) => {
  if (amt <= 0.02) return;
  for (let i = 0; i < n; i++) {
    const t = ((frame * 0.8 + i * (100 / n) + seed * 13) % 100) / 100;
    const a = Math.floor(amt * (1 - t) * 4) * 0.14;
    if (a <= 0) continue;
    pixelBlob(ctx, x + (hash(i + seed) - 0.5) * w + Math.sin(t * 5 + i) * 6, y - t * rise, size * (0.6 + t), size * (0.5 + t * 0.8), `rgba(${rgb}, ${a.toFixed(2)})`);
  }
};

/** A jagged bolt of electricity from (x0, y0) to (x1, y1), re-forked every couple of frames. Hard pixels, no glow. */
const bolt = (ctx: Ctx, x0: number, y0: number, x1: number, y1: number, frame: number, seed: number) => {
  const pts: [number, number][] = [];
  const n = 6, h = Math.floor(frame / 2);
  for (let i = 0; i <= n; i++) {
    const u = i / n, j = i === 0 || i === n ? 0 : (hash(h * 7 + seed * 31 + i) - 0.5) * 14;
    pts.push([Math.round((lerp(x0, x1, u) + j) / PX) * PX, Math.round((lerp(y0, y1, u) - j * 0.5) / PX) * PX]);
  }
  ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
  for (const [color, lw] of [['#006064', 4], ['#26C6DA', 2.5], ['#E0F7FA', 1]] as [string, number][]) {
    ctx.strokeStyle = color; ctx.lineWidth = lw;
    ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke();
  }
};

/** Jagged crack lines across him, in sprite space (`p` 0..1: how far they've run). */
const crackLines = (ctx: Ctx, seed: number, p: number, color: string, lw: number) => {
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'square'; ctx.lineJoin = 'miter';
  for (let k = 0; k < 6; k++) {
    let px = 18 + Math.round(hash(seed + k) * 44), py = 8 + k * 12;
    const steps = 4, upTo = p * steps;
    ctx.beginPath(); ctx.moveTo(px, py);
    for (let s = 0; s < steps && s < upTo; s++) {
      const f = Math.min(1, upTo - s);
      const dx = (hash(seed + k * 9 + s) > 0.5 ? 6 : -6), dy = 6;
      px += dx * f; py += dy * f;
      ctx.lineTo(Math.round(px / PX) * PX, Math.round(py / PX) * PX);
    }
    ctx.stroke();
  }
};

/** The existing stone cracks, run only `p` of the way (1: all of them, as `cracks` draws them). */
const cracksSoFar = (ctx: Ctx, color: string, seed: number, p: number) => {
  if (p >= 1) { cracks(ctx, color, seed); return; }
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  for (let k = 0; k < 4; k++) {
    // (each crack starts a little after the one before)
    const q = clamp01(p * 1.6 - k * 0.2) * 3;
    if (q <= 0) continue;
    let px = 10 + ((seed * (k + 3)) % 60), py = 5 + k * 18;
    ctx.beginPath();
    ctx.moveTo(px, py);
    for (let s = 0; s < 3 && s < q; s++) { const f = Math.min(1, q - s); px += ((seed + k + s) % 2 === 0 ? 8 : -6) * f; py += 7 * f; ctx.lineTo(px, py); }
    ctx.stroke();
  }
};

// ---------------------------------------------------------------------------
// The corpse
// ---------------------------------------------------------------------------

export const drawBossCorpse = (ctx: Ctx, c: BossCorpse, frame: number) => {
  const style = styleFor(c.stageId, c.weapon);
  const { x, y: floor } = c;
  const age = Math.max(0, frame - c.frame0);
  ctx.save();
  switch (style) {
    case 'melted': {
      // Melting where he stood: the whole of him running down, unevenly (the middle holds out longest), every bit of
      // him drooping in long drips into a spreading puddle of pink meltwater; the bones and an eye left in it, steam
      // coming off him
      const k = Math.min(1, age / 160);
      puddle(ctx, x, floor, 50 + k * 40, 'rgba(160, 90, 120, 0.72)', 'rgba(255, 190, 210, 0.6)');
      bloodSwirls(ctx, x, floor, 50 + k * 30);
      melt(ctx, c, x, floor, k, frame);
      boneStump(ctx, x - 44, floor - 6, -2.5, 22 + k * 6);
      boneStump(ctx, x + 40, floor - 5, -0.6, 18 + k * 6);
      eyeball(ctx, x + 60, floor - 5, 5, -1);
      drips(ctx, x, floor, frame, 'rgba(200, 60, 80, 0.9)');
      steam(ctx, x, floor - 30 + k * 20, frame, 'rgba(230, 245, 255, 0.35)');
      flies(ctx, x, floor - 30, frame, age, 3);
      break;
    }
    case 'stone': stoned(ctx, c, x, floor, age, frame); break;
    case 'shattered': shattered(ctx, c, x, floor, age, frame); break;
    case 'flattened': flattened(ctx, c, x, floor, age, frame); break;
    case 'dissolved': dissolved(ctx, c, x, floor, age, frame); break;
    case 'overdosed': overdosed(ctx, c, x, floor, age, frame); break;
    case 'oiled': oiled(ctx, c, x, floor, age, frame); break;
    case 'fried': fried(ctx, c, x, floor, age, frame); break;
    default: charred(ctx, c, x, floor, age, frame);
  }
  ctx.restore();
};

/**
 * Burned to a crisp. He catches at the feet and the flames climb him; he staggers about ablaze, going brown then
 * black, and goes over burning; the fire dies down on him, the splits in his skin glowing white-hot, then orange,
 * then dull red, then out; bits of him crumble off into ash, and the smoke thins to a wisp.
 */
const charred = (ctx: Ctx, c: BossCorpse, x: number, floor: number, age: number, frame: number) => {
  const FALL = 52;
  const down = fallOver(age, FALL, 16);
  const pose = fallingPose(c, x, floor, down);
  if (age < FALL) pose.cx += Math.round(Math.sin(age * 0.45) * 2.5 * seg(age, 6, 18));
  const flame = age < 30 ? easeOut(seg(age, 0, 30)) : 1 - seg(age, 70, 135);
  const pool = easeOut(seg(age, 70, 140));
  if (pool > 0.05) bloodPool(ctx, x, floor, 45 * pool);
  // (the ash coming off him, settled into a heap)
  ash(ctx, x, floor, age, true);
  ctx.save();
  applyPose(ctx, pose);
  body(ctx, c, stepOf(['none', 'sepia(0.35) brightness(0.8) contrast(1.1)', 'sepia(0.7) brightness(0.55) contrast(1.3)', 'sepia(1) brightness(0.3) contrast(1.5)'], seg(age, 6, 96)));
  // (lit orange by the fire on him)
  if (flame > 0.1) overlay(ctx, onHim(c, 'lit', g => { g.fillStyle = '#FF6D00'; g.fillRect(BX, BY, BW, BH); }), Math.ceil(flame * 3) * 0.1);
  // (the skin splitting, the meat glowing through, cooling)
  if (age >= 40 && age < 230) {
    const glow = stepOf(['#FFF59D', '#FFB300', '#E65100', '#8D1B0B'], seg(age, 40, 230));
    overlay(ctx, onHim(c, 'split:' + glow, g => crackLines(g, 3, 1, glow, 2)));
  }
  ctx.restore();
  // The fire: catching at his feet and climbing him, then the whole of him going up, lying down with him, dying down
  if (age < 34) drawFlameLicks(ctx, x, floor, 50, lerp(14, 90, easeOut(seg(age, 0, 30))), age, { seed: 3, k: Math.max(0.3, flame) });
  if (age >= 20 && flame > 0.02) {
    const k = flame * seg(age, 20, 34);
    // (the glow off it, and the blaze itself: a tongue of it for every bit of him)
    drawFire(ctx, x, floor - 2, lerp(40, 70, down), lerp(40, 24, down), age, { seed: 7, k });
    drawFlameLicks(ctx, x, floor - 2, lerp(62, 96, down), lerp(96, 44, down), age, { seed: 5, k, n: Math.round(lerp(6, 8, down)) });
  }
  // (falling bits of him: ash, a few embers in it)
  ash(ctx, x, floor, age, false);
  if (age >= 120) embers(ctx, x, floor - 20, frame);
  puffs(ctx, x, floor - 50, frame, '41, 37, 36', flame * 1.2, 5, 40, 90, 14);
  smoke(ctx, x, floor - 30, frame, seg(age, 90, 170));
};

/** Ash dropping off a body burning down, falling (`falling`) or settled in a heap at his feet (not). */
const ash = (ctx: Ctx, x: number, floor: number, age: number, settled: boolean) => {
  for (let i = 0; i < 12; i++) {
    const t0 = 84 + i * 6, ax = x - 34 + hash(i * 3) * 68, ay0 = floor - 30 - hash(i * 5) * 22;
    if (age < t0) continue;
    const u = Math.min(1, (age - t0) / 14);
    if ((u >= 1) !== settled) continue;
    const ember = age - t0 < 40 && i % 3 === 0;
    const col = ember ? (age % 8 < 4 ? '#FF6D00' : '#E65100') : i % 2 ? '#3A3330' : '#5A524D';
    dot(ctx, ax + (u < 1 ? Math.sin(u * 6 + i) * 3 : 0), lerp(ay0, floor - 2 - (i % 3) * 2, u * u), col, i % 4 ? PX : PX * 2, PX);
  }
};

/**
 * Doused magma, set hard. The water hits him glowing and he goes up in a great hissing billow of steam, the glow
 * dying out of him in steps, orange to dull red to grey; he slumps over stiff as he sets, the cracks running across
 * him; then a chunk of him breaks away and drops, the raw meat inside showing, and he bleeds out of the cracks.
 */
const stoned = (ctx: Ctx, c: BossCorpse, x: number, floor: number, age: number, frame: number) => {
  const BREAK = 72;
  puddle(ctx, x, floor, lerp(24, 60, easeOut(seg(age, 0, 24))), 'rgba(60, 110, 160, 0.55)', 'rgba(170, 210, 240, 0.6)');
  const pool = easeOut(seg(age, BREAK + 4, BREAK + 70));
  const rot = -0.18 * c.facing * easeOut(seg(age, 22, 60));
  ctx.save();
  // Slumped and cracked, with a chunk broken off (once it has)
  ctx.translate(x, floor);
  ctx.rotate(rot);
  ctx.translate(-S / 2, -S);
  ctx.beginPath();
  if (age >= BREAK) { ctx.moveTo(0, 0); ctx.lineTo(S, 0); ctx.lineTo(S, S * 0.45); ctx.lineTo(S * 0.78, S * 0.55); ctx.lineTo(S * 0.9, S); ctx.lineTo(0, S); ctx.closePath(); }
  else ctx.rect(0, 0, S, S);
  ctx.clip();
  const shake = age < BREAK && age > BREAK - 10 ? (frame % 2 ? 1 : -1) : 0;
  ctx.translate(shake, 0);
  body(ctx, c, stepOf(['sepia(1) saturate(4) hue-rotate(-12deg) brightness(1.5)', 'sepia(1) saturate(3) hue-rotate(-20deg) brightness(0.95)',
    'grayscale(0.6) sepia(0.5) brightness(0.65) contrast(1.25)', 'grayscale(1) brightness(0.6) contrast(1.3)'], seg(age, 4, 64)));
  // (the last of the heat glowing in the seams as the crust sets over it)
  if (age < 100) {
    const glow = stepOf(['#FFF176', '#FF9100', '#D84315', '#7F1D1D'], seg(age, 0, 100));
    overlay(ctx, onHim(c, 'seam:' + glow, g => crackLines(g, 11, 1, glow, 2)));
  }
  cracksSoFar(ctx, '#1B1B1B', 7, seg(age, 26, 70));
  if (age >= BREAK) {
    // Where the chunk broke off: raw meat inside the stone
    rawWound(ctx, S * 0.88, S * 0.62, 14, 20, frame);
    if (age >= BREAK + 8) bleedFromCracks(ctx, frame);
  }
  ctx.restore();
  // The broken-off chunk, dropping off him and coming to rest on the floor
  if (age >= BREAK) {
    const u = seg(age, BREAK, BREAK + 14), hop = Math.sin(seg(age, BREAK + 14, BREAK + 24) * Math.PI) * 3;
    // (from where it was on him)
    const lx = S * 0.9 - S / 2, ly = S * 0.75 - S, cs = Math.cos(rot), sn = Math.sin(rot);
    const fx = x + lx * cs - ly * sn, fy = floor + lx * sn + ly * cs;
    const rx = x + c.facing * 60, ry = floor - 6;
    const cx = lerp(fx, rx, u), cy = lerp(fy, ry, u * u) - hop;
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(Math.sin(u * Math.PI) * 0.9 * c.facing); ctx.translate(-rx, -ry);
    ctx.fillStyle = '#5A5A5A';
    ctx.strokeStyle = '#1B1B1B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + c.facing * 48, floor); ctx.lineTo(x + c.facing * 56, floor - 14); ctx.lineTo(x + c.facing * 70, floor - 10); ctx.lineTo(x + c.facing * 72, floor);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    meatSection(ctx, x + c.facing * 60, floor - 6, 7);
    ctx.restore();
    // (grit coming off with it)
    for (let i = 0; i < 5; i++) {
      const v = seg(age, BREAK + i, BREAK + 12 + i);
      if (v >= 1) continue;
      dot(ctx, lerp(fx, rx, v) + (i - 2) * 4, lerp(fy, floor - 2, v * v), i % 2 ? '#6B6B6B' : '#3A3A3A');
    }
  }
  if (pool > 0.05) bloodPool(ctx, x, floor, 50 * pool);
  // The steam: a great hissing billow of it as the water hits, thinning to a wisp
  const hiss = 1 - seg(age, 16, 110);
  puffs(ctx, x, floor - 40, frame * 1.6, '235, 240, 245', hiss * 1.3, 7, 70, 100, 18, 2);
  if (age < 40) for (let i = 0; i < 5; i++) {
    // (jets of it spitting off him)
    const t = ((age * 3 + i * 9) % 18) / 18, jx = x - 26 + i * 13;
    dot(ctx, jx + Math.sin(i * 3) * 4 * t, floor - 50 - (i % 2) * 18 - t * 30, '#F5F5F5', PX, PX * 3);
  }
  steam(ctx, x, floor - S, frame, 'rgba(240, 240, 240, 0.4)', seg(age, 60, 130));
  flies(ctx, x, floor - 50, frame, age - 60, 2);
};

/** The sprite cut into the four chunks a frozen boss breaks into: clip rect in sprite space, landing offset x, spin. */
const CHUNKS: [number, number, number, number, number, number][] = [
  [0, 0, 40, 40, -60, -0.6], [40, 0, 40, 40, 30, 0.9], [0, 40, 40, 40, -15, 1.7], [40, 40, 40, 40, 70, -1.2],
];

/** Him frozen through: pale, iced over, flecked with frost. */
const frozenImg = (c: BossCorpse) => painted(c, 'frozen', g => {
  g.filter = 'saturate(0.35) brightness(1.2)'; sprite(g, c); g.filter = 'none';
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = 'rgba(150, 220, 255, 0.5)'; g.fillRect(BX, BY, BW, BH);
  g.fillStyle = 'rgba(255, 255, 255, 0.7)';
  for (let i = 0; i < 90; i++) g.fillRect(Math.floor(hash(i) * 40) * 2, Math.floor(hash(i + 99) * 50) * 2 - 10, 1, 1);
  g.globalCompositeOperation = 'source-over';
});

/** One frozen chunk of him, centred on (cx, cy) and turned `rot`. */
const iceChunk = (ctx: Ctx, c: BossCorpse, frozen: HTMLCanvasElement | null, ch: (typeof CHUNKS)[number], cx: number, cy: number, rot: number) => {
  const [sx, sy, sw, sh] = ch;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.beginPath();
  // Jagged break edges
  ctx.moveTo(-sw / 2, -sh / 2 + 4); ctx.lineTo(-sw / 6, -sh / 2); ctx.lineTo(sw / 2, -sh / 2 + 6);
  ctx.lineTo(sw / 2 - 3, sh / 2); ctx.lineTo(-sw / 3, sh / 2 - 3); ctx.lineTo(-sw / 2, sh / 6);
  ctx.closePath();
  ctx.save();
  ctx.clip();
  ctx.translate(-sx - sw / 2, -sy - sh / 2);
  if (frozen) blit(ctx, frozen); else sprite(ctx, c);
  ctx.restore();
  ctx.fillStyle = 'rgba(170, 230, 255, 0.3)';
  ctx.fill();
  ctx.strokeStyle = '#E0F7FA';
  ctx.lineWidth = 2;
  ctx.stroke();
  // The broken face: frozen marbled meat and a snapped bone
  ctx.save();
  ctx.clip();
  meatSection(ctx, sw / 2 - 6, 0, sh * 0.45);
  ctx.restore();
  ctx.restore();
};

/**
 * Frozen solid and smashed. The frost creeps up him from his feet, a ragged white front of crystals; frozen
 * through, he shivers and the cracks run across him; a flash, and he bursts: the four chunks of him flying, turning,
 * thudding down and settling, ice shards spraying out across the floor and a cloud of ice dust hanging and thinning.
 */
const shattered = (ctx: Ctx, c: BossCorpse, x: number, floor: number, age: number, frame: number) => {
  const BURST = 44;
  const plain = spriteImg(c, 'none');
  if (age < BURST) {
    const ice = easeOut(seg(age, 0, 30));
    const frozen = frozenImg(c);
    ctx.save();
    ctx.translate(x - S / 2 + (age > 30 ? (frame % 2 ? 1 : -1) : 0), floor - S);
    if (plain) blit(ctx, plain); else sprite(ctx, c);
    // (the frost, up as far as it's got: a ragged front, a column at a time)
    const front: number[] = [];
    ctx.save();
    ctx.beginPath();
    for (let col = BX; col < BX + BW; col += 4) {
      const fy = Math.round((S - ice * (S - BY + 6) + (hash(col) - 0.5) * 10 * (1 - ice)) / PX) * PX;
      front.push(fy);
      ctx.rect(col, fy, 4, S + 4 - fy);
    }
    ctx.clip();
    if (frozen) blit(ctx, frozen);
    ctx.restore();
    // (crystals along the front, on him)
    if (ice < 1) {
      const edge = onHim(c, 'frost-edge', g => { g.fillStyle = '#FFFFFF'; g.fillRect(BX, BY, BW, BH); });
      ctx.save();
      ctx.beginPath();
      front.forEach((fy, i) => ctx.rect(BX + i * 4, fy - 2, 4, 4));
      ctx.clip();
      overlay(ctx, edge);
      ctx.restore();
    }
    // (frozen through, the cracks running along where he'll break)
    if (age >= 32) {
      const p = seg(age, 32, 42);
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2; ctx.lineCap = 'square';
      ctx.beginPath();
      ctx.moveTo(40, 0); for (let k = 1; k <= 8 * p; k++) ctx.lineTo(40 + (k % 2 ? 4 : -2), k * 10);
      ctx.moveTo(0, 40); for (let k = 1; k <= 8 * p; k++) ctx.lineTo(k * 10, 40 + (k % 2 ? -4 : 2));
      ctx.stroke();
    }
    if (age >= 41) overlay(ctx, onHim(c, 'flash', g => { g.fillStyle = '#F0FBFF'; g.fillRect(BX, BY, BW, BH); }), 0.7);
    ctx.restore();
    return;
  }
  const t = age - BURST;
  // Blood thawing out of the pieces
  const pool = easeOut(seg(t, 6, 70));
  if (pool > 0.05) bloodPool(ctx, x, floor, 55 * pool);
  // (thawing, after a while, back to the colors he was)
  const frozen = t < 70 ? frozenImg(c) : plain;
  // The pieces flying apart and coming down (each in its own time), a hop as they land
  CHUNKS.forEach((ch, i) => {
    const [sx, sy, sw, sh, dx, spin] = ch;
    const land = 24 + i * 4, u = clamp01(t / land);
    const x0 = x - S / 2 + sx + sw / 2, y0 = floor - S + sy + sh / 2, x1 = x + dx, y1 = floor - sh / 2 - 2;
    const hop = Math.sin(seg(t, land, land + 10) * Math.PI) * 5;
    const cx = lerp(x0, x1, easeOut(u) * 0.3 + u * 0.7), cy = lerp(y0, y1, u) - Math.sin(u * Math.PI) * (26 + i * 8) - hop;
    iceChunk(ctx, c, frozen, ch, cx, cy, spin * (u < 1 ? u : 1) + (u >= 1 ? Math.sin(seg(t, land, land + 10) * Math.PI) * 0.1 : 0));
  });
  if (t >= 20) guts(ctx, x - 10, floor - 4, 1, lerp(10, 60, easeOut(seg(t, 20, 90))), frame);
  // Shards of ice spraying out and skittering to a stop
  for (let i = 0; i < 16; i++) {
    const vx = (hash(i * 3) - 0.5) * 7, vy = -1.5 - hash(i * 7) * 4, y0 = floor - 30 - hash(i) * 30, g = 0.1;
    const tl = (-vy + Math.sqrt(vy * vy + 4 * g * (floor - 3 - y0))) / (2 * g);
    const tt = Math.min(t, tl), slide = t > tl ? Math.min(8, (t - tl) * 0.4) * Math.sign(vx) : 0;
    const sxp = x + (hash(i * 5) - 0.5) * 40 + vx * tt + slide, syp = y0 + vy * tt + g * tt * tt;
    if (t > tl + 200) continue; // (melted away)
    dot(ctx, sxp, syp, i % 3 ? '#E0F7FA' : '#80DEEA', i % 2 ? PX * 2 : PX, PX);
  }
  // The ice dust, hanging and thinning
  const dust = 1 - seg(t, 0, 60);
  if (dust > 0) for (let i = 0; i < 5; i++) {
    const r = 8 + 22 * easeOut(seg(t, 0, 50)) * (0.6 + hash(i) * 0.5);
    pixelBlob(ctx, x + (i - 2) * 18, floor - 30 - (i % 2) * 16 + t * 0.2, r, r * 0.6, `rgba(225, 245, 255, ${(Math.ceil(dust * 3) * 0.08).toFixed(2)})`);
  }
  if (t >= 10) frost(ctx, x, floor, frame);
};

/**
 * Squashed flat under a boulder. Its shadow swells under him, it drops on him, he goes flat with a bounce of it and
 * it rocks on him; blood and guts squirt out both ends and spread across the floor, an eye pops out and rolls off,
 * a bone sticks out of him; a puff of dust. After that he twitches now and then.
 */
const flattened = (ctx: Ctx, c: BossCorpse, x: number, floor: number, age: number, frame: number) => {
  const HIT = 16;
  const q = age - HIT;
  let sy = 1, rockY: number, rockRot = 0.4;
  if (q < 0) {
    const u = age / HIT;
    rockY = lerp(floor - S - 32 - 260, floor - S - 32, u * u);
    rockRot = 0.4 - (1 - u) * 2.2;
  } else {
    sy = q < 4 ? lerp(1, 0.16, q / 4) : q < 16 ? lerp(0.16, 0.2, (q - 4) / 12) + Math.sin((q - 4) / 12 * Math.PI) * 0.04 : 0.2;
    // (a twitch, now and then)
    const tw = q > 60 && (q % 150) < 8 ? (q % 4 < 2 ? 0.025 : 0) : 0;
    sy += tw;
    const hop = q >= 4 && q < 18 ? Math.sin((q - 4) / 14 * Math.PI) * 10 : 0;
    rockY = floor - S * Math.max(sy - tw, 0.16) - 32 - hop;
    rockRot = 0.4 + (q < 18 ? Math.sin(q * 0.4) * 0.08 * (1 - q / 18) : 0);
  }
  const sx = 1 + 0.6 * (1 - sy) / 0.8;
  const splat = q < 0 ? 0 : easeOut(seg(q, 0, 34));
  if (splat > 0.03) bloodPool(ctx, x, floor, 90 * splat);
  // (the boulder's shadow, swelling as it comes)
  if (q < 0) {
    const u = age / HIT;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = `rgba(0, 0, 0, ${(0.12 + i * 0.08) * u})`;
      ctx.beginPath(); ctx.ellipse(x + 6, floor - 1, (20 + 30 * u) * (1 - i * 0.25), 4, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.save();
  ctx.translate(x - S / 2 * sx, floor - S * sy);
  ctx.scale(sx, sy);
  body(ctx, c);
  ctx.restore();
  if (q >= 2) {
    guts(ctx, x - 50, floor - 3, -1, lerp(6, 70, easeOut(seg(q, 2, 45))), frame);
    guts(ctx, x + 55, floor - 3, 1, lerp(6, 55, easeOut(seg(q, 4, 40))), frame);
  }
  drawRock(ctx, x + 6, rockY, 36, rockRot, PLAYER_ROCK, 11);
  if (q >= 0) {
    bloodSpray(ctx, x, floor, frame, splat);
    const tw = q > 60 && (q % 150) < 8 ? (q % 4 < 2 ? 0.12 : -0.06) : 0;
    boneStump(ctx, x - 30, floor - 6, -2.8 + tw, 30 * easeOut(seg(q, 0, 8)));
    // (the eye, popped out and rolling off to a stop)
    const u = seg(q, 0, 26);
    eyeball(ctx, lerp(x + 20, x + 95, easeOut(u)), lerp(floor - 14, floor - 5, u) - Math.sin(u * Math.PI) * 40, 6, 1);
    gore(ctx, x, floor, 10, 90 * splat);
    // (blood squirting out both ends)
    for (let i = 0; i < 18; i++) {
      const dir = i % 2 ? 1 : -1, vx = dir * (2 + hash(i) * 4), vy = -2 - hash(i + 5) * 4, t = q - (i % 4);
      const py = floor - 8 + vy * t + 0.18 * t * t;
      if (t < 0 || py > floor) continue;
      dot(ctx, x + dir * 40 + vx * t, py, i % 3 ? '#8B0000' : '#C62828');
    }
    // (the dust it threw up)
    const dust = 1 - seg(q, 0, 44);
    if (dust > 0) for (const dir of [-1, 1]) for (let i = 0; i < 3; i++) {
      const r = 6 + easeOut(seg(q, 0, 40)) * (14 + i * 4);
      pixelBlob(ctx, x + dir * (50 + i * 16 + q * 0.6), floor - 6 - i * 4, r, r * 0.6, `rgba(180, 160, 130, ${(Math.ceil(dust * 3) * 0.15).toFixed(2)})`);
    }
  }
  flies(ctx, x, floor - 40, frame, age, 4);
};

/**
 * Sinking into a bubbling pool of barf, eaten away: he fizzes all over, going green; the puddle spreads under him
 * and he sinks into it; the flesh slides off his head from the top down (the skull under it), his shades slip down
 * what's left of his nose, the flesh comes off his shoulders in strings; bones and an eye bob up to the surface.
 */
const dissolved = (ctx: Ctx, c: BossCorpse, x: number, floor: number, age: number, frame: number) => {
  const HEAD_A = 36, HEAD_B = 104;
  const depth = lerp(1, 0.8, easeOut(seg(age, 0, 150)));
  const filter = stepOf(['none', 'sepia(0.3) hue-rotate(20deg) saturate(1.15) brightness(0.95)', 'sepia(0.55) hue-rotate(40deg) saturate(1.3) brightness(0.9)'], seg(age, 0, 54));
  const peel = seg(age, HEAD_A, HEAD_B);
  ctx.save();
  ctx.beginPath(); ctx.rect(x - S, floor - S * 1.5, S * 2, S * 1.5 - 4); ctx.clip();
  ctx.translate(x - S / 2, floor - S * depth);
  // (the body, with the head cut off it: the skull goes where the head was)
  ctx.save(); ctx.beginPath(); ctx.rect(-10, 31, S + 20, S); ctx.clip();
  body(ctx, c, filter);
  ctx.restore();
  if (peel > 0) {
    // (the neck gone to gristle up to it)
    ctx.fillStyle = '#7F1D1D'; ctx.fillRect(33, 26, 14, 8); ctx.fillStyle = '#E8DCC0'; ctx.fillRect(38, 24, 4, 10);
    skull(ctx, 40, 18, 1.15, c.facing * 0.12);
  }
  if (peel < 1) {
    // (the head's flesh, sliding off the skull from the top down, the front of it ragged and running)
    ctx.save(); ctx.beginPath();
    for (let col = -10; col < S + 10; col += 2) {
      const fy = Math.round(lerp(-14, 36, peel) + (peel > 0 ? hash(col) * 8 * Math.sin(peel * Math.PI) : 0));
      ctx.rect(col, fy, 2, 31 - fy);
    }
    ctx.clip();
    body(ctx, c, filter);
    ctx.restore();
  }
  if (peel > 0.4) {
    // (what's left of the face sliding off it: raw at the edges, strings of it hanging)
    const str = seg(age, HEAD_A + 30, HEAD_B + 20);
    ctx.strokeStyle = '#A33B2A'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(29, 12); ctx.quadraticCurveTo(27, 22, 31, 30); ctx.stroke();
    ctx.lineWidth = 1.2;
    for (let k = 0; k < 4; k++) { const len = (5 + ((frame * 0.2 + k * 7) % 9)) * str; ctx.beginPath(); ctx.moveTo(31 + k * 5, 29); ctx.quadraticCurveTo(32 + k * 5, 29 + len * 0.6, 31 + k * 5, 29 + len); ctx.stroke(); }
  }
  if (peel >= 1) {
    // (a few hairs still stuck to the top of it, and his shades, slipping down)
    ctx.strokeStyle = '#3F2A1D'; ctx.lineWidth = 0.6; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(34 + k * 2.4, 6.5); ctx.lineTo(33 + k * 2.6, 4); ctx.stroke(); }
    const slip = easeOut(seg(age, HEAD_B, HEAD_B + 18));
    ctx.save(); ctx.translate(40, lerp(15, 23, slip)); ctx.rotate(0.25 * c.facing * slip);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.75)'; ctx.fillRect(-11, -2.5, 9, 5); ctx.fillRect(2, -2.5, 9, 5);
    ctx.strokeStyle = '#111827'; ctx.lineWidth = 1; ctx.strokeRect(-11, -2.5, 9, 5); ctx.strokeRect(2, -2.5, 9, 5); ctx.beginPath(); ctx.moveTo(-2, -1); ctx.lineTo(2, -1); ctx.stroke();
    ctx.restore();
  }
  if (age >= 50) {
    // (the flesh coming off the shoulders in sheets)
    const sh = seg(age, 50, 110);
    ctx.fillStyle = 'rgba(173, 255, 47, 0.35)';
    for (let k = 0; k < 5; k++) { const sx = 18 + k * 11, len = (8 + ((frame * 0.15 + k * 5) % 12)) * sh; if (len < 1) continue; ctx.beginPath(); ctx.ellipse(sx, 36 + len / 2, 2.4, len / 2, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  // (fizzing all over him, dying down)
  const fizz = 1 - seg(age, 70, 170);
  for (let i = 0; i < 16 * fizz; i++) {
    const t = ((age * 1.3 + i * 11) % 16) / 16, bx = 14 + hash(i) * 52, by = (peel < 1 && i % 3 === 0 ? 4 : 32) + hash(i + 40) * 40;
    if (t < 0.7) dot(ctx, bx, by - t * 4, '#ADFF2F', t < 0.35 ? PX : PX * 2);
    else { ctx.fillStyle = '#E6FF9A'; ctx.fillRect(Math.round(bx / PX) * PX - 2, Math.round(by / PX) * PX - 4, 2, 2); ctx.fillRect(Math.round(bx / PX) * PX + 2, Math.round(by / PX) * PX - 4, 2, 2); }
  }
  ctx.restore();
  // Bones and an eye bobbing up to the surface
  const rise = easeOut(seg(age, 110, 160)), eyeUp = easeOut(seg(age, 126, 156));
  if (rise > 0 || eyeUp > 0) {
    ctx.save();
    ctx.beginPath(); ctx.rect(x - 200, floor - 200, 400, 204); ctx.clip();
    if (rise > 0) { ctx.translate(0, (1 - rise) * 10); bones(ctx, x, floor); ctx.translate(0, -(1 - rise) * 10); }
    if (eyeUp > 0) eyeball(ctx, x - 55, floor - 6 + (1 - eyeUp) * 10, 5, 1);
    ctx.restore();
  }
  const w = lerp(26, 85, easeOut(seg(age, 0, 100)));
  if (age >= 30) bloodSwirls(ctx, x, floor, lerp(30, 80, seg(age, 30, 120)));
  puddle(ctx, x, floor, w, 'rgba(46, 125, 50, 0.9)', 'rgba(173, 255, 47, 0.7)');
  bubbles(ctx, x, floor, frame, '#ADFF2F');
  if (age < 120) bubbles(ctx, x + 14, floor, frame * 1.7 + 9, '#C6FF00', w / 85);
  flies(ctx, x, floor - 50, frame, age - 80, 3);
};

/**
 * Keeled over, foaming at the mouth, the syringes sticking out of him. He fits on his feet, jerking and flickering
 * through colors, then goes over stiff; on the floor he thrashes, less and less, the foam building up out of his
 * mouth and the blood out of his eyes and nose, till he's still; after that he only twitches.
 */
const overdosed = (ctx: Ctx, c: BossCorpse, x: number, floor: number, age: number, frame: number) => {
  const FALL = 50;
  const down = fallOver(age, FALL, 16, 0.08);
  const pose = fallingPose(c, x, floor, down);
  const lie = fallingPose(c, x, floor, 1);
  if (age < FALL) {
    const k = seg(age, 0, 10), h = Math.floor(age / 3);
    pose.cx += Math.round((hash(h) - 0.5) * 6 * k); pose.rot += (hash(h + 50) - 0.5) * 0.16 * k;
  } else if (age < 130) {
    const amp = 1 - seg(age, FALL + 16, 130), h = Math.floor(age / 2);
    pose.cx += Math.round((hash(h) - 0.5) * 5 * amp); pose.cy -= Math.round(hash(h + 9) * 3 * amp);
  } else pose.cx += (frame % 50) < 4 ? Math.sin(frame * 3) * 2 : 0;
  const pool = easeOut(seg(age, FALL + 16, FALL + 90));
  if (pool > 0.05) bloodPool(ctx, x, floor, 40 * pool);
  ctx.save();
  applyPose(ctx, pose);
  // (cycling through colors: a fast flicker while he fits, slowing once he's still)
  const hue = Math.floor(frame / (age < 130 ? 2 : 5)) % 12 * 30;
  body(ctx, c, `hue-rotate(${hue}deg) saturate(1.6)`);
  ctx.restore();
  carried(ctx, lie, pose, () => {
    syringes(ctx, x, floor);
    foam(ctx, x + c.facing * 13, floor - 36, frame, Math.round(5 * easeOut(seg(age, 24, 140)))); // (out of his mouth, his face up, lying on his side)
  });
  if (age >= FALL + 20) {
    bloodStreams(ctx, x + c.facing * 30, floor - 40, frame, seg(age, FALL + 20, FALL + 60));
    if (pool > 0.05) bloodPool(ctx, x + c.facing * 30, floor, 35 * pool);
  }
  flies(ctx, x, floor - 45, frame, age - 80, 4);
};

/**
 * Face-down in a black slick, glistening with crude. The oil splatters over him in globs, he goes dark under it and
 * slumps slowly over into it as it spreads out under him, settling half sunk, bobbing; the sheen slides over it.
 */
const oiled = (ctx: Ctx, c: BossCorpse, x: number, floor: number, age: number, frame: number) => {
  const SLUMP = 26;
  const down = fallOver(age, SLUMP, 24, 0.05);
  const bob = Math.sin(frame * 0.05) * 2;
  const settle = seg(age, SLUMP + 24, SLUMP + 60);
  const pose = fallingPose(c, x, floor + 12 * easeOut(seg(age, SLUMP + 10, SLUMP + 50)) + bob * settle, down);
  const lie = fallingPose(c, x, floor + 12 + bob, 1);
  ctx.save();
  applyPose(ctx, pose);
  body(ctx, c, stepOf(['none', 'brightness(0.72) contrast(1.1)', 'brightness(0.45) contrast(1.3)'], seg(age, 0, 40)));
  ctx.restore();
  carried(ctx, lie, pose, () => {
    // Coated in globs of crude with a rainbow sheen (splattering on, one after another)
    ctx.fillStyle = 'rgba(8, 6, 10, 0.85)';
    for (let i = 0; i < 7; i++) {
      const on = seg(age, i * 3, i * 3 + 4);
      if (on <= 0) continue;
      const big = 1 + (1 - on) * 0.5;
      ctx.beginPath();
      ctx.ellipse(x - 34 + i * 11, floor - 18 + bob + Math.sin(i * 2.3) * 14, (10 + (i % 3) * 3) * big, (7 + (i % 2) * 3) * big, i, 0, Math.PI * 2);
      ctx.fill();
    }
    if (age >= 40) {
      ctx.strokeStyle = `hsla(${(frame * 3) % 360}, 80%, 60%, 0.6)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 30, floor - 30 + bob); ctx.quadraticCurveTo(x, floor - 38 + bob, x + 28, floor - 26 + bob);
      ctx.stroke();
    }
  });
  if (age >= SLUMP + 24) {
    rawWound(ctx, x + 4, floor - 22 + bob, 16, 12, frame);
    guts(ctx, x + 10, floor - 14 + bob, 1, lerp(8, 55, easeOut(seg(age, SLUMP + 24, SLUMP + 90))), frame);
    guts(ctx, x - 5, floor - 12 + bob, -1, lerp(8, 40, easeOut(seg(age, SLUMP + 30, SLUMP + 90))), frame);
  }
  // The slick spreading out under him, and the sheen sliding across it
  const w = lerp(16, 90, easeOut(seg(age, 2, 100)));
  puddle(ctx, x, floor + 22, w, 'rgba(10, 8, 12, 0.9)', `hsla(${(frame * 3) % 360}, 80%, 60%, 0.6)`);
  const gx = x - w * 0.8 + ((frame * 0.5) % (w * 1.6));
  ['#FF8A80', '#FFE57F', '#B9F6CA', '#82B1FF'].forEach((col, i) => dot(ctx, gx + i * 4, floor + 18 + (i % 2) * 2, col, 4, PX));
  drips(ctx, x, floor, frame, '#050505');
  flies(ctx, x, floor - 45, frame, age - 60, 3);
};

/**
 * Electrocuted to a smoking husk. He stands lit up, flickering between himself and his own x-ray, bolts crawling
 * over him and his hair on end, browning and starting to smoke; then he goes over stiff as a board. On the floor:
 * the skin split and glowing, his ribs through it, an eye boiled out, sparks still crackling now and then.
 */
const fried = (ctx: Ctx, c: BossCorpse, x: number, floor: number, age: number, frame: number) => {
  const FALL = 52, DOWN = FALL + 12;
  const down = fallOver(age, FALL, 12, 0.04);
  const pose = fallingPose(c, x, floor, down);
  if (age < FALL) pose.cx += (frame % 2 ? 1 : -1) * Math.round(2 * seg(age, 0, 6));
  const pool = easeOut(seg(age, DOWN, DOWN + 60));
  if (pool > 0.05) bloodPool(ctx, x, floor, 40 * pool);
  const top = headTop(c);
  ctx.save();
  applyPose(ctx, pose);
  const xray = age < FALL && (age < 36 ? Math.floor(age / 3) % 2 === 0 : age % 9 < 2);
  if (xray) {
    overlay(ctx, onHim(c, 'xray', g => { g.fillStyle = '#0D1B4A'; g.fillRect(BX, BY, BW, BH); }));
    skeleton(ctx, top);
  } else body(ctx, c, stepOf(['none', 'sepia(0.4) brightness(0.72) contrast(1.2)', 'sepia(0.8) brightness(0.42) contrast(1.4)'], seg(age, 10, 64)));
  // (his hair stood on end, till it burns off as he goes over)
  if (age >= 6 && age < FALL + 4) {
    for (let k = 0; k < 7; k++) {
      const hx = 30 + k * 3.4, len = 6 + hash(k) * 6 + (frame % 4 < 2 ? 1 : 0);
      dot(ctx, hx + (k - 3) * len * 0.12, top - len, age > 30 ? '#1A1A1A' : '#4E342E', PX, Math.round(len / PX) * PX);
    }
  }
  ctx.restore();
  // (the bolts crawling over him while he's lit up)
  if (age < FALL) {
    const ty = floor - S + top;
    bolt(ctx, x - 26, floor - 10, x - 8, ty + 6, frame, 1);
    bolt(ctx, x + 24, floor - 30, x + 6, ty + 2, frame, 2);
    if (frame % 3) bolt(ctx, x - 20, ty + 20, x + 22, ty + 30, frame, 3);
    puffs(ctx, x, ty, frame, '60, 60, 60', seg(age, 14, 40), 4, 26, 60, 8);
  }
  if (age >= DOWN) {
    charredSplits(ctx, x, floor - 34, frame);
    ribs(ctx, x - 4, floor - 40);
    // (an eye, boiled out of his head as he hit, rolling to a stop)
    const u = seg(age, DOWN, DOWN + 20);
    eyeball(ctx, x + c.facing * lerp(28, 44, easeOut(u)), lerp(floor - 26, floor - 5, u) - Math.sin(u * Math.PI) * 14, 5, c.facing, true);
    if (frame % 20 < 6) sparks(ctx, x, floor - 25, frame);
  }
  smoke(ctx, x, floor - 30, frame, seg(age, FALL - 10, FALL + 30));
  flies(ctx, x, floor - 50, frame, age - 60, 3);
};

/** His x-ray: a chunky white skeleton in the sprite's frame, its skull's top at `top`. */
const skeleton = (ctx: Ctx, top: number) => {
  const b = '#E3F2FD';
  const r = (x: number, y: number, w: number, h: number) => { ctx.fillStyle = b; ctx.fillRect(x, y, w, h); };
  const t = Math.round(top / 2) * 2 + 2;
  // skull, its sockets and teeth
  r(33, t, 14, 12); r(35, t + 12, 10, 4);
  ctx.fillStyle = '#0D1B4A'; ctx.fillRect(35, t + 4, 4, 4); ctx.fillRect(41, t + 4, 4, 4); ctx.fillRect(39, t + 9, 2, 2);
  ctx.fillRect(36, t + 14, 2, 2); ctx.fillRect(40, t + 14, 2, 2);
  // spine and ribs
  const sp = t + 18, hip = Math.max(sp + 20, 56);
  r(39, sp, 2, hip - sp);
  for (let k = 0; k < 4; k++) { r(30 + k, sp + 3 + k * 4, 20 - k * 2, 2); }
  // pelvis, legs
  r(32, hip, 16, 4); r(33, hip + 4, 2, 78 - hip - 4); r(45, hip + 4, 2, 78 - hip - 4);
  // arms
  r(26, sp + 2, 4, 2); r(24, sp + 4, 2, 18); r(50, sp + 2, 4, 2); r(54, sp + 4, 2, 18);
};

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

/** Scratch canvas for the melt (the sprite's drawn into it once a frame, then run down in strips). */
let meltCanvas: HTMLCanvasElement | null = null;

/**
 * The sprite melting: drawn a strip at a time (two pixels wide), each strip slid down by how far it's run (the edges
 * further than the middle, every strip a little different), the bottom of each smeared on down to the floor in a
 * drip, all of it cut off at the puddle. `k` 0..1, how far gone he is.
 */
const melt = (ctx: CanvasRenderingContext2D, c: BossCorpse, x: number, floor: number, k: number, frame: number) => {
  if (typeof document === 'undefined') return;
  const scale = 2;
  if (!meltCanvas) { meltCanvas = document.createElement('canvas'); meltCanvas.width = S * scale; meltCanvas.height = S * scale; }
  const m = meltCanvas.getContext('2d')!;
  m.setTransform(1, 0, 0, 1, 0, 0); m.clearRect(0, 0, meltCanvas.width, meltCanvas.height);
  m.scale(scale, scale); m.filter = 'saturate(0.75) brightness(1.08)';
  sprite(m, c);
  ctx.save();
  ctx.beginPath(); ctx.rect(x - S, floor - S * 1.4, S * 2, S * 1.4 - 3); ctx.clip();
  const left = x - S / 2;
  for (let sx = 0; sx < S; sx += 2) {
    const edge = Math.abs(sx - S / 2) / (S / 2);
    const run = k * (S * (0.2 + edge * 0.45) + Math.sin(sx * 0.37) * 6 + Math.sin(sx * 1.3 + 2) * 4) + Math.sin(frame * 0.05 + sx) * 0.6 * k;
    const top = floor - S + run;
    // (the strip, slumped down)
    ctx.drawImage(meltCanvas, sx * scale, 0, 2 * scale, S * scale, left + sx, top, 2, S);
    // (and its bottom, dragged out in a drip to the floor: the color it was, smeared)
    if (run > 2) ctx.drawImage(meltCanvas, sx * scale, (S - 6) * scale, 2 * scale, 6 * scale, left + sx, top + S - 6, 2, Math.max(6, floor - (top + S - 6)));
  }
  // (a wet shine down it, and the drips running off the bottom edge of what's left)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  for (let sx = 6; sx < S; sx += 9) { const len = 6 + ((frame * 0.3 + sx * 3) % 18) * k; ctx.fillRect(left + sx, floor - S * (1 - k * 0.4) + 10, 1, len); }
  ctx.restore();
};

const puddle = (ctx: CanvasRenderingContext2D, x: number, floor: number, w: number, fill: string, shine: string) => {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, floor - 2, w, 7, 0, 0, Math.PI * 2);
  ctx.ellipse(x - w * 0.6, floor - 1, w * 0.35, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(x + w * 0.7, floor - 1, w * 0.3, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = shine;
  ctx.beginPath();
  ctx.ellipse(x - w * 0.2, floor - 5, w * 0.35, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
};

const bloodPool = (ctx: CanvasRenderingContext2D, x: number, floor: number, w: number) => {
  puddle(ctx, x, floor, w, 'rgba(110, 0, 0, 0.9)', 'rgba(255, 120, 120, 0.35)');
  gore(ctx, x, floor, 5, w);
};

/** Chunks of meat lying around. */
const gore = (ctx: CanvasRenderingContext2D, x: number, floor: number, count: number, spread: number) => {
  const colors = ['#8B0000', '#B22222', '#FF8A80', '#5A0000'];
  for (let i = 0; i < count; i++) {
    const gx = x + Math.sin(i * 7.3) * spread, r = 3 + (i % 3) * 2;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.ellipse(gx, floor - r * 0.6, r * 1.3, r * 0.8, i, 0, Math.PI * 2);
    ctx.fill();
  }
};

const steam = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, color: string, amt = 1) => {
  if (amt <= 0) return;
  ctx.fillStyle = color;
  for (let i = 0; i < 4; i++) {
    const t = ((frame * 0.7 + i * 25) % 100) / 100;
    ctx.globalAlpha = (1 - t) * amt;
    ctx.beginPath();
    ctx.arc(x - 20 + i * 14 + Math.sin(t * 5 + i) * 6, y - t * 70, 6 + t * 12, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
};

const smoke = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, amt = 1) => steam(ctx, x, y, frame, 'rgba(40, 40, 40, 0.55)', amt);

const embers = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) => {
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = (frame + i * 7) % 20 < 10 ? '#FF6D00' : '#FFB300';
    ctx.beginPath();
    ctx.arc(x - 30 + i * 12, y + Math.sin(i * 2.1) * 10, 2, 0, Math.PI * 2);
    ctx.fill();
  }
};

const sparks = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) => {
  ctx.strokeStyle = '#80DEEA';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#00E5FF';
  ctx.shadowBlur = 8;
  for (let k = 0; k < 3; k++) {
    let px = x - 30 + k * 30, py = y;
    ctx.beginPath();
    ctx.moveTo(px, py);
    for (let s = 0; s < 4; s++) { px += Math.sin(frame + k * 5 + s) * 8; py -= 6; ctx.lineTo(px, py); }
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
};

const drips = (ctx: CanvasRenderingContext2D, x: number, floor: number, frame: number, color: string) => {
  ctx.fillStyle = color;
  for (let i = 0; i < 3; i++) {
    const t = ((frame * 0.8 + i * 17) % 40) / 40;
    ctx.beginPath();
    ctx.ellipse(x - 30 + i * 30, floor - 30 + t * 26, 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
};

const cracks = (ctx: CanvasRenderingContext2D, color: string, seed: number) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  for (let k = 0; k < 4; k++) {
    let px = 10 + ((seed * (k + 3)) % 60), py = 5 + k * 18;
    ctx.beginPath();
    ctx.moveTo(px, py);
    for (let s = 0; s < 3; s++) { px += ((seed + k + s) % 2 === 0 ? 8 : -6); py += 7; ctx.lineTo(px, py); }
    ctx.stroke();
  }
};

const frost = (ctx: CanvasRenderingContext2D, x: number, floor: number, frame: number) => {
  ctx.fillStyle = 'rgba(230, 250, 255, 0.85)';
  for (let i = 0; i < 10; i++) {
    const fx = x - 90 + i * 19, glint = (frame + i * 9) % 40 < 3;
    ctx.fillRect(fx, floor - 3 - (i % 3) * 2, glint ? 4 : 3, glint ? 4 : 3);
  }
};

const bones = (ctx: CanvasRenderingContext2D, x: number, floor: number) => {
  ctx.fillStyle = '#F5F5DC';
  ctx.strokeStyle = '#8D8D6E';
  ctx.lineWidth = 1;
  for (const [bx, rot] of [[-45, -0.4], [40, 0.5], [10, -0.1]]) {
    ctx.save();
    ctx.translate(x + bx, floor - 8);
    ctx.rotate(rot);
    ctx.fillRect(-12, -2, 24, 4);
    for (const ex of [-12, 12]) {
      ctx.beginPath();
      ctx.arc(ex, -2, 3, 0, Math.PI * 2);
      ctx.arc(ex, 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
};

const bubbles = (ctx: CanvasRenderingContext2D, x: number, floor: number, frame: number, color: string, spread = 1) => {
  ctx.fillStyle = color;
  for (let i = 0; i < 5; i++) {
    const b = Math.sin(frame * 0.2 + i * 1.9);
    if (b < 0.3) continue;
    ctx.beginPath();
    ctx.arc(x + (-60 + i * 30) * spread, floor - 6 - b * 4, 2 + b * 3, 0, Math.PI * 2);
    ctx.fill();
  }
};

const syringes = (ctx: CanvasRenderingContext2D, x: number, floor: number) => {
  for (const [sx, sy, rot] of [[-20, -50, -0.8], [5, -45, -1.3], [25, -35, -0.5]]) {
    ctx.save();
    ctx.translate(x + sx, floor + sy);
    ctx.rotate(rot);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(-14, -3, 12, 6);
    ctx.fillStyle = '#FF2BD6';
    ctx.fillRect(-13, -2, 9, 4);
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(6, 0); ctx.stroke();
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-18, -3, 2, 6);
    ctx.restore();
  }
};

const foam = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, n = 5) => {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.arc(x + Math.sin(i * 2 + frame * 0.1) * 6, y + i * 4 + Math.cos(frame * 0.15 + i) * 2, 3 + (i % 2) * 2, 0, Math.PI * 2);
    ctx.fill();
  }
};

// ---------------------------------------------------------------------------
// Gore
// ---------------------------------------------------------------------------

/**
 * Intestine spilling out along the floor in direction `dir`: a coil of it, folding back on itself, each loop a fat
 * glistening tube (dark down its underside, a wet shine along its top, the veins on it), and a smear of blood under it.
 */
const guts = (ctx: CanvasRenderingContext2D, x: number, y: number, dir: number, len: number, frame: number) => {
  const n = Math.max(6, Math.round(len / 4));
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, coil = t * Math.PI * 2 * (len / 26);
    pts.push([x + dir * (t * len * 0.75 + Math.sin(coil) * 7), y - 4 - (1 + Math.cos(coil)) * 3.2 + Math.sin(frame * 0.04 + i) * 0.4]);
  }
  ctx.fillStyle = 'rgba(110, 12, 20, 0.6)'; ctx.beginPath(); ctx.ellipse(x + dir * len * 0.4, y - 1, len * 0.45, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  // (the tube itself, under the bulges: dark, then its body)
  const trace = () => { ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); };
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#5E1424'; ctx.lineWidth = 8.5; trace(); ctx.stroke();
  ctx.strokeStyle = '#B9506A'; ctx.lineWidth = 6.5; trace(); ctx.stroke();
  // (back to front: the far side of each loop first)
  const order = pts.map((p, i) => ({ p, i })).sort((u, v) => u.p[1] - v.p[1]);
  for (const { p: [px, py], i } of order) {
    const g = ctx.createRadialGradient(px - 1.2, py - 1.6, 0.4, px, py, 5);
    g.addColorStop(0, '#F4B4C2'); g.addColorStop(0.45, '#D9738A'); g.addColorStop(0.85, '#A23B55'); g.addColorStop(1, '#5E1424');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(px, py, 4.2, 3.4, (pts[Math.min(n, i + 1)][1] - py) * 0.2, 0, Math.PI * 2); ctx.fill();
    // (where one bulge pinches into the next)
    ctx.strokeStyle = 'rgba(94, 20, 36, 0.55)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.arc(px, py, 4.4, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
    if (i % 3 === 0) { ctx.strokeStyle = 'rgba(120, 30, 70, 0.6)'; ctx.lineWidth = 0.35; ctx.beginPath(); ctx.moveTo(px - 2.5, py - 1); ctx.quadraticCurveTo(px, py - 2.6, px + 2.2, py - 0.6); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'; ctx.fillRect(px - 2, py - 3, 1.6, 0.9);
  }
};

/** A snapped bone sticking out of a ring of torn meat. */
const boneStump = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, len: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = '#EFE6CF';
  ctx.strokeStyle = '#8A7F66';
  ctx.lineWidth = 1;
  ctx.fillRect(0, -3, len, 6);
  ctx.strokeRect(0, -3, len, 6);
  // Splintered end
  ctx.beginPath();
  ctx.moveTo(len, -4); ctx.lineTo(len + 5, -1); ctx.lineTo(len + 2, 1); ctx.lineTo(len + 6, 4); ctx.lineTo(len, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Meat still clinging where it tore out
  ctx.fillStyle = '#9B111E';
  ctx.beginPath();
  ctx.ellipse(2, 0, 6, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#E57373';
  ctx.beginPath();
  ctx.ellipse(3, -2, 3, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

/** A loose eyeball, veiny, trailing its nerve. `boiled` = cooked white and cloudy. */
const eyeball = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, dir: number, boiled = false) => {
  ctx.strokeStyle = '#8E2436';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - dir * r * 0.8, y);
  ctx.quadraticCurveTo(x - dir * r * 2.2, y + 3, x - dir * r * 3.2, y + 1);
  ctx.stroke();
  ctx.fillStyle = boiled ? '#E8E4DA' : '#FAFAFA';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(200, 30, 40, 0.8)';
  ctx.lineWidth = 0.8;
  for (let k = 0; k < 4; k++) {
    const a = k * 1.6;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.lineTo(x + Math.cos(a + 0.3) * r * 0.45, y + Math.sin(a + 0.3) * r * 0.45);
    ctx.stroke();
  }
  ctx.fillStyle = boiled ? 'rgba(160, 160, 150, 0.8)' : '#3E6B2F';
  ctx.beginPath();
  ctx.arc(x + dir * r * 0.35, y - r * 0.1, r * 0.45, 0, Math.PI * 2);
  ctx.fill();
  if (!boiled) {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x + dir * r * 0.4, y - r * 0.1, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }
};

/** A cut through frozen meat: red flesh, white fat marbling, a ring of bone. */
const meatSection = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
  ctx.fillStyle = '#A3141F';
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.7, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 235, 225, 0.8)';
  ctx.lineWidth = 1;
  for (let k = -1; k <= 1; k++) {
    ctx.beginPath();
    ctx.moveTo(x - r * 0.5, y + k * r * 0.4);
    ctx.quadraticCurveTo(x, y + k * r * 0.4 - 3, x + r * 0.5, y + k * r * 0.4 + 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#F3E9D2';
  ctx.beginPath();
  ctx.arc(x + r * 0.1, y - r * 0.2, r * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#C2A36B';
  ctx.beginPath();
  ctx.arc(x + r * 0.1, y - r * 0.2, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
};

/** Wet, raw flesh showing through a wound, glistening. */
const rawWound = (ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, frame: number) => {
  ctx.fillStyle = '#5C0A12';
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#B3202E';
  ctx.beginPath();
  ctx.ellipse(x, y, rx * 0.75, ry * 0.75, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#E05A6A';
  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    ctx.arc(x - rx * 0.3 + k * rx * 0.3, y - ry * 0.2 + (k % 2) * ry * 0.3, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = frame % 40 < 3 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.ellipse(x - rx * 0.3, y - ry * 0.4, rx * 0.2, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
};

/** Blood oozing out of every crack in a stone body (local sprite space). */
const bleedFromCracks = (ctx: CanvasRenderingContext2D, frame: number) => {
  ctx.fillStyle = '#8B0000';
  for (let k = 0; k < 4; k++) {
    const sx = 14 + k * 17, len = 8 + ((frame * 0.3 + k * 11) % 26);
    ctx.fillRect(sx, 20 + k * 12, 2.5, len);
    ctx.beginPath();
    ctx.arc(sx + 1.2, 20 + k * 12 + len, 2, 0, Math.PI * 2);
    ctx.fill();
  }
};

/** Pink-red swirls of blood mixing into a puddle. */
const bloodSwirls = (ctx: CanvasRenderingContext2D, x: number, floor: number, w: number) => {
  ctx.strokeStyle = 'rgba(160, 10, 20, 0.8)';
  ctx.lineWidth = 2;
  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    ctx.ellipse(x - w * 0.4 + k * w * 0.4, floor - 3, 10 + k * 3, 2.5, 0, 0.3, Math.PI * 1.6);
    ctx.stroke();
  }
};

/** Blood sprayed out across the floor in streaks, and up the air in droplets. */
const bloodSpray = (ctx: CanvasRenderingContext2D, x: number, floor: number, frame: number, k = 1) => {
  ctx.fillStyle = '#7A0000';
  const kk = k;
  for (const dir of [-1, 1]) {
    for (let k = 0; k < 4; k++) {
      const len = (30 + k * 18) * kk;
      ctx.beginPath();
      ctx.moveTo(x + dir * 60, floor - 2 - k);
      ctx.lineTo(x + dir * (60 + len), floor - 1 - k * 0.5);
      ctx.lineTo(x + dir * 60, floor + 1 - k);
      ctx.fill();
    }
  }
  void frame;
};

/** Streams of blood from the eyes and nose. */
const bloodStreams = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, k = 1) => {
  ctx.fillStyle = '#9B0000';
  for (let i = 0; i < 3; i++) {
    const len = (10 + ((frame * 0.25 + i * 9) % 22)) * k;
    ctx.fillRect(x - 8 + i * 7, y, 2.5, len);
    ctx.beginPath();
    ctx.arc(x - 7 + i * 7, y + len, 2, 0, Math.PI * 2);
    ctx.fill();
  }
};

/** The skin burnt through in glowing splits of raw meat. */
const charredSplits = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) => {
  ctx.shadowColor = '#FF3D00';
  ctx.shadowBlur = 8;
  ctx.strokeStyle = frame % 30 < 15 ? '#E53935' : '#FF7043';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let k = 0; k < 4; k++) {
    ctx.beginPath();
    ctx.moveTo(x - 30 + k * 16, y - 8 + (k % 2) * 10);
    ctx.lineTo(x - 22 + k * 16, y + (k % 2) * 6);
    ctx.lineTo(x - 26 + k * 16, y + 12);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
};

/** Ribs showing through a burnt-away chest. */
const ribs = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  ctx.fillStyle = '#4A0A0A';
  ctx.beginPath();
  ctx.ellipse(x, y, 18, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#E8DFC8';
  ctx.lineWidth = 2.5;
  for (let k = -2; k <= 2; k++) {
    ctx.beginPath();
    ctx.moveTo(x + k * 6, y - 11);
    ctx.quadraticCurveTo(x + k * 6 + 4, y, x + k * 6, y + 11);
    ctx.stroke();
  }
};

/** Flies gathering on the body once it's been lying there a moment. */
const flies = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, age: number, count: number) => {
  const n = Math.min(count, Math.floor(age / 40));
  for (let k = 0; k < n; k++) {
    const a = frame * (0.3 + k * 0.07) + k * 2.4;
    const fx = x + Math.cos(a) * (18 + k * 7), fy = y + Math.sin(a * 1.4) * 12;
    ctx.fillStyle = 'rgba(220, 230, 255, 0.55)';
    ctx.beginPath();
    ctx.ellipse(fx - 2, fy - 2.5, 2.2, 1.3, -0.6 + (frame % 2) * 0.8, 0, Math.PI * 2);
    ctx.ellipse(fx + 2, fy - 2.5, 2.2, 1.3, 0.6 - (frame % 2) * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(fx, fy, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
};
