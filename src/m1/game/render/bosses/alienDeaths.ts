// The finale's alien, dying (game/bosses/alienDeath.ts says which death and where everything in it is, when; the kill
// cam has it in close-up). Each is his own figure (scenes/alienLook.ts), painted as pixel art at its own resolution
// like the fight's (render/bosses/alien.ts), the way he looks at each step of it painted the once and kept, and put
// down big with no smoothing; round it, chunky pixels: green slime for blood, shreds of the suit and the tie.
// Nothing here runs a filter or a blur.

import { BossCorpse } from '../../core/state';
import { drawAlienFigure, ALIEN, AlienPose } from '../../scenes/alienLook';
import { RAMP } from '../../scenes/art/snes';
import { ART_SCALE } from '../../bosses/alien';
import {
  howOf, dropped, landAt, rockHead, ROCK, waveWall, waveBody, WAVE, odBody, OD, NUKE, flyingBit, alienTall,
} from '../../bosses/alienDeath';
import { ROOM_TOP, FLOOR } from '../../stages/finale/geometry';
import { finaleBeingDrawn } from '../../stages/finale/state';
import { RENDER_SCALE } from '../../../constants';
import { drawFire } from '../fx/fire';
import { drawFlameLicks } from '../fx/fireball';
import { pixelBlob, steppedGlow } from '../pixelArt';
import { drawAlienCorpse } from './alien';

type Ctx = CanvasRenderingContext2D;

/** His art canvas, the same as the fight's: feet at (CX, BASE). */
const AW = 168, AH = 128, CX = 84, BASE = 122, S = ART_SCALE;
const H = ALIEN.hide;
const BONE = ['#4a4632', '#8c866a', '#c8c2a2', '#ece6cc'];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const seg = (age: number, a: number, b: number) => clamp01((age - a) / (b - a));
const easeOut = (u: number) => 1 - (1 - u) * (1 - u);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
/** A chunky pixel of him (his art's 1.5 world px), on its grid. */
const dot = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string) => {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x / S) * S, Math.round(y / S) * S, Math.max(S, Math.round(w / S) * S), Math.max(S, Math.round(h / S) * S));
};

// ---------------------------------------------------------------------------
// His figure, each look painted once
// ---------------------------------------------------------------------------

type Eyes = 'none' | 'x' | 'cross' | 'rolled' | 'popped' | 'dilated' | 'shut';
interface Look extends AlienPose {
  eyes?: Eyes; tongue?: boolean;
  /** Washed over (just his own pixels), from art y `from` down: color, how much. */
  tint?: [string, number, number?];
  /** No head (knocked off): a neck stump instead. */
  headless?: boolean;
  /** Only his head. */
  headOnly?: boolean;
  /** A round through it: the hole, on the side facing `holeSide` (1: the way he faces). */
  hole?: 1 | -1;
  /** Ice: frosted from the feet up to art y `frost`, icicles off him. */
  frost?: number;
  /** Glowing cracks over him (cooling: the color). */
  cracks?: string;
  /** The ray gun blown off his arm (a black stump of it). */
  gunGone?: boolean;
  /** The skeleton, through him (the x-ray). */
  xray?: boolean;
  /** Holes eaten in him, the bone through them (0..3). */
  eaten?: number;
}

const looks = new Map<string, HTMLCanvasElement>();
const figure = (key: string, o: Look): HTMLCanvasElement | null => {
  if (typeof document === 'undefined') return null;
  let c = looks.get(key);
  if (c) return c;
  if (looks.size > 80) looks.clear();
  c = document.createElement('canvas');
  c.width = AW; c.height = AH;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  paintLook(g, o);
  looks.set(key, c);
  return c;
};

const P = (g: Ctx, x: number, y: number, w: number, h: number, c: string) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
/** On the art canvas, his way round: x from his middle toward the way he's facing. */
const M = (g: Ctx, f: number) => (x: number, y: number, w: number, h: number, c: string) => P(g, f > 0 ? CX + x : CX - x - w, BASE + y, w, h, c);
/** The head's box on the art canvas (x from his middle, his way round). */
const HEAD = { x0: -5, x1: 26, y0: -110, y1: -83 };
const headBox = (f: number) => ({ x: f > 0 ? CX + HEAD.x0 : CX - HEAD.x1, y: BASE + HEAD.y0, w: HEAD.x1 - HEAD.x0, h: HEAD.y1 - HEAD.y0 });

const paintLook = (g: Ctx, o: Look) => {
  const f = o.facing ?? 1, R = M(g, f);
  drawAlienFigure(g, CX, BASE, { facing: f, t: o.t ?? 0, arm: o.arm, aim: o.aim, open: o.open ?? true, peel: o.peel });
  // His eyes, the way he's going
  const eyes = o.eyes ?? 'none';
  for (const ex of [3, 9]) {
    if (eyes === 'none') break;
    R(ex - 1, -101, 5, 4, H[3]);
    if (eyes === 'x') { for (const [dx, dy] of [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]]) R(ex - 1 + dx, -101 + dy + 1, 1, 1, '#0a0a0a'); }
    else if (eyes === 'cross') { R(ex - 1, -101, 4, 3, ALIEN.sclera); R(ex === 3 ? ex + 1 : ex - 1, -100, 2, 2, ALIEN.pupil); R(ex - 1, -101, 4, 1, ALIEN.eyeRim); }
    else if (eyes === 'rolled') { R(ex, -101, 3, 2, '#f0ecd8'); R(ex + 1, -100, 1, 1, ALIEN.eyeRim); }
    else if (eyes === 'popped') { R(ex - 2, -103, 5, 5, '#f4f0e0'); R(ex, -101, 1, 1, ALIEN.pupil); R(ex - 2, -103, 5, 1, ALIEN.eyeRim); }
    else if (eyes === 'dilated') { R(ex - 1, -101, 4, 3, '#f4d0e0'); R(ex, -101, 2, 3, ALIEN.pupil); R(ex - 1, -101, 1, 1, '#ffffff'); }
    else if (eyes === 'shut') { R(ex - 1, -100, 4, 1, H[0]); }
  }
  if (o.tongue) { R(14, -92, 3, 8, ALIEN.gumLight); R(14, -85, 3, 1, ALIEN.gum); R(15, -91, 1, 5, ALIEN.gum); }
  if (o.gunGone) { R(30, -52, 9, 26, ALIEN.claw[0]); R(31, -50, 3, 20, '#3a2a20'); for (let i = 0; i < 4; i++) R(29 + i * 3, -27 + (i % 2) * 2, 2, 3, ALIEN.slime); }
  if (o.hole) {
    // (in one side, out the other: the out's the bigger mess)
    const inX = o.hole > 0 ? 18 : -2, outX = o.hole > 0 ? -3 : 17;
    R(inX, -104, 3, 3, ALIEN.mouth); R(inX + 1, -103, 1, 1, ALIEN.slimeDark); R(inX - 1, -105, 5, 1, H[1]);
    R(outX - 1, -106, 6, 6, ALIEN.mouth); R(outX, -105, 4, 4, ALIEN.slimeDark); R(outX + 1, -104, 2, 2, ALIEN.slime); R(outX - 2, -101, 2, 4, ALIEN.slime);
  }
  if (o.eaten) {
    // (the sludge eating into him: holes, the bone white through them)
    const holes: [number, number, number][] = [[-14, -60, 6], [6, -70, 5], [-4, -44, 7], [18, -50, 5], [-20, -30, 5], [4, -100, 4], [-10, -84, 5], [12, -26, 6]];
    for (let i = 0; i < Math.min(holes.length, o.eaten * 3); i++) {
      const [x, y, r] = holes[i];
      R(x - 1, y - 1, r + 2, r + 2, ALIEN.slimeDark); R(x, y, r, r, BONE[1]); R(x, y, r, 1, BONE[3]); R(x + 1, y + r - 1, r - 1, 1, BONE[0]);
    }
  }
  if (o.frost !== undefined) {
    // (iced over from his feet up: blue-white over him, glints, icicles off his arms and jaw)
    g.save(); g.globalCompositeOperation = 'source-atop';
    g.globalAlpha = 0.62; g.fillStyle = '#bfe8ff'; g.fillRect(0, BASE + o.frost, AW, AH);
    g.globalAlpha = 0.5; g.fillStyle = '#ffffff';
    for (let i = 0; i < 26; i++) { const y = BASE - 4 - (i * 37) % 104; if (y >= BASE + o.frost) g.fillRect(CX - 34 + (i * 53) % 68, y, 2, 1); }
    g.restore();
    if (o.frost <= -100) for (const [x, y, h] of [[-32, -30, 6], [33, -28, 7], [-6, -26, 5], [8, -25, 6], [22, -60, 4], [6, -86, 5], [12, -86, 4], [18, -86, 6]] as const) { R(x, y, 2, h, '#e0f2fe'); R(x, y, 1, h - 1, '#ffffff'); }
  }
  if (o.cracks) {
    g.save(); g.globalCompositeOperation = 'source-atop'; g.strokeStyle = o.cracks; g.lineWidth = 1;
    for (let k = 0; k < 7; k++) {
      let x = CX - 24 + Math.round(hash(k + 3) * 48), y = BASE - 104 + k * 14;
      g.beginPath(); g.moveTo(x + 0.5, y + 0.5);
      for (let s = 0; s < 4; s++) { x += hash(k * 9 + s) > 0.5 ? 4 : -4; y += 4; g.lineTo(x + 0.5, y + 0.5); }
      g.stroke();
    }
    g.restore();
  }
  if (o.xray) {
    // (him gone dark blue, glowing at the edges; the bones bright through it)
    g.save(); g.globalCompositeOperation = 'source-atop';
    g.fillStyle = '#0b2a4a'; g.fillRect(0, 0, AW, AH);
    g.restore();
    skeleton(g, f);
  }
  if (o.tint) {
    const [col, a, from] = o.tint;
    g.save(); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = a; g.fillStyle = col; g.fillRect(0, BASE + (from ?? -AH), AW, AH); g.restore();
  }
  if (o.headless) {
    // Off at the neck: the stump, ringed in torn hide, the green of him, a knob of bone
    const b = headBox(f);
    g.clearRect(b.x, b.y, b.w, b.h + 2);
    R(-4, -92, 26, 5, ALIEN.slimeDark); R(-2, -93, 22, 3, ALIEN.slime); R(6, -93, 5, 3, BONE[3]); R(7, -92, 3, 1, BONE[1]);
    for (let i = 0; i < 6; i++) R(-4 + i * 5, -94 + (i % 2), 3, 2, H[2]);
  }
  if (o.headOnly) {
    const b = headBox(f);
    const tmp = g.getImageData(b.x, b.y, b.w, b.h);
    g.clearRect(0, 0, AW, AH);
    g.putImageData(tmp, b.x, b.y);
    // (the ragged bottom of the neck, dripping)
    R(-2, -84, 24, 2, ALIEN.slimeDark); R(2, -83, 4, 2, ALIEN.slime); R(12, -83, 3, 3, ALIEN.slime);
  }
};

/** His bones, in art space: the little cranium, the block of a jaw (the pegs in it), spine, ribs, pelvis, limbs. */
const skeleton = (g: Ctx, f: number) => {
  const R = M(g, f), B = '#d8f4ff', D = '#7ab8d8';
  // Skull
  R(1, -108, 12, 8, B); R(3, -105, 3, 3, '#0b2a4a'); R(8, -105, 3, 3, '#0b2a4a');
  R(-1, -99, 24, 9, B); for (let i = 0; i < 5; i++) R(1 + i * 4, -100, 2, 3, '#ffffff'); R(-1, -92, 24, 1, D);
  // Spine, ribs, pelvis
  for (let y = -88; y < -34; y += 4) R(2, y, 4, 3, B);
  for (let r = 0; r < 6; r++) { const y = -78 + r * 6, w = 22 - Math.abs(r - 2) * 2; R(4 - w, y, w, 2, B); R(6, y, w, 2, B); R(4 - w, y + 2, 2, 2, D); }
  R(-12, -36, 30, 6, B); R(-10, -31, 6, 3, D); R(10, -31, 6, 3, D);
  // Legs
  for (const s of [-1, 1]) { R(s * 11 - 1, -30, 3, 14, B); R(s * 14 - 1, -16, 3, 12, B); R(s * 13 - 4, -4, 9, 3, B); }
  // Arms (hanging), the gun's bolts bright on the front one
  R(-26, -74, 3, 22, B); R(-31, -52, 3, 24, B); R(-34, -28, 7, 6, B);
  R(26, -74, 3, 22, B); R(33, -52, 3, 24, B); R(32, -28, 7, 6, B); R(30, -50, 2, 2, '#ff8ce4'); R(30, -38, 2, 2, '#ff8ce4');
};

/** Puts a look down: art point (ax, ay) at world (x, y), turned `rot`, scaled (sx, sy) on top of his own scale. */
const put = (ctx: Ctx, c: HTMLCanvasElement | null, x: number, y: number, o: { rot?: number; sx?: number; sy?: number; ax?: number; ay?: number; alpha?: number } = {}) => {
  if (!c) return;
  const prev = ctx.imageSmoothingEnabled;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  ctx.scale(S * (o.sx ?? 1), S * (o.sy ?? 1));
  ctx.drawImage(c, -(o.ax ?? CX), -(o.ay ?? BASE));
  ctx.restore();
  ctx.imageSmoothingEnabled = prev;
};

/** A piece of a look (art box sx, sy, sw, sh), its middle at world (x, y), turned. */
const piece = (ctx: Ctx, c: HTMLCanvasElement | null, sx: number, sy: number, sw: number, sh: number, x: number, y: number, rot: number, k = 1) => {
  if (!c) return;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(S * k, S * k);
  ctx.drawImage(c, sx, sy, sw, sh, -sw / 2, -sh / 2, sw, sh);
  ctx.restore();
};

// ---------------------------------------------------------------------------
// Slime, everywhere
// ---------------------------------------------------------------------------

/** A pool of it on the floor, banded (dark rim, the green, glints). */
const pool = (ctx: Ctx, x: number, rx: number, ry: number, cols: [string, string, string] = [ALIEN.slimeDark, ALIEN.slime, ALIEN.slimeLight], seed = 0) => {
  if (rx < 2) return;
  ctx.fillStyle = cols[0]; ctx.beginPath(); ctx.ellipse(x, FLOOR - 1, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = cols[1]; ctx.beginPath(); ctx.ellipse(x - rx * 0.06, FLOOR - 2, rx * 0.8, ry * 0.62, 0, 0, Math.PI * 2); ctx.fill();
  for (let k = 0; k < Math.min(8, rx / 14); k++) dot(ctx, x - rx * 0.6 + hash(k + seed) * rx * 1.1, FLOOR - 3 - hash(k * 3 + seed) * ry * 0.5, 4.5, 1.5, cols[2]);
};

/** A splat of it on a wall or the ceiling: a blob with spikes out of it, runs dripping down. */
const splat = (ctx: Ctx, x: number, y: number, r: number, seed: number, runs = 1) => {
  if (r < 1) return;
  pixelBlob(ctx, x, y, r, r * 0.8, ALIEN.slimeDark);
  pixelBlob(ctx, x - r * 0.1, y - r * 0.1, r * 0.7, r * 0.55, ALIEN.slime);
  for (let k = 0; k < 7; k++) {
    const a = hash(seed + k) * Math.PI * 2, d = r * (1 + hash(seed + k * 3) * 0.9);
    pixelBlob(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, r * 0.18 + 1, r * 0.16 + 1, k % 2 ? ALIEN.slime : ALIEN.slimeDark);
  }
  for (let k = 0; k < 3 * runs; k++) { const rx = x - r * 0.6 + hash(seed + k * 7) * r * 1.2; dot(ctx, rx, y, 3, r * (0.6 + hash(seed + k) * 1.4) * runs, ALIEN.slimeDark); }
  dot(ctx, x - r * 0.3, y - r * 0.3, 3, 1.5, ALIEN.slimeLight);
};

/** Goo flying off him: n blobs out of (x, y), `t` frames on, `power` how hard; each one splatted where it comes down. */
const spray = (ctx: Ctx, n: number, t: number, x: number, y: number, power: number, seed: number) => {
  for (let i = 0; i < n; i++) {
    const b = flyingBit(i, t, x, y, power, seed);
    const sz = 2 + b.h(5) * 4;
    if (b.rest || b.y >= FLOOR - 5) { ctx.fillStyle = ALIEN.slimeDark; ctx.fillRect(Math.round(b.x - sz * 1.4), FLOOR - 3, Math.round(sz * 2.8), 3); ctx.fillStyle = ALIEN.slime; ctx.fillRect(Math.round(b.x - sz), FLOOR - 3, Math.round(sz * 2), 1.5); }
    else dot(ctx, b.x, b.y, sz, sz, i % 3 === 0 ? ALIEN.slimeDark : i % 3 === 1 ? ALIEN.slime : ALIEN.slimeLight);
  }
};

/** Bits of the President's clothes coming off him: rags of navy jacket, scraps of shirt, and (i 0) the tie. */
const rag = (ctx: Ctx, x: number, y: number, i: number, rot: number) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  if (i === 0) { ctx.fillStyle = RAMP.red[3]; ctx.fillRect(-3, -10, 6, 18); ctx.fillStyle = RAMP.red[4]; ctx.fillRect(-3, -10, 2, 18); ctx.fillStyle = RAMP.red[1]; ctx.fillRect(-4, -13, 8, 4); }
  else if (i % 3 === 1) { ctx.fillStyle = RAMP.navy[3]; ctx.fillRect(-8, -5, 16, 10); ctx.fillStyle = RAMP.navy[5]; ctx.fillRect(-8, -5, 16, 2); ctx.fillStyle = RAMP.navy[1]; ctx.fillRect(2, 2, 6, 3); }
  else { ctx.fillStyle = RAMP.shirt[3]; ctx.fillRect(-6, -3, 12, 6); ctx.fillStyle = RAMP.shirt[1]; ctx.fillRect(-6, 1, 12, 2); }
  ctx.restore();
};

/** His last words over him, while they're said (sized for the screen, whatever the zoom). */
const words = (ctx: Ctx, x: number, y: number) => {
  const text = finaleBeingDrawn()?.cam?.alienText;
  if (!text) return;
  const z = Math.abs(ctx.getTransform().a) / RENDER_SCALE || 1;
  const rows: string[] = [];
  for (const w of text.split(' ')) { const l = rows[rows.length - 1]; if (l !== undefined && (l + ' ' + w).length <= 22) rows[rows.length - 1] = l + ' ' + w; else rows.push(w); }
  ctx.save();
  ctx.translate(x, y); ctx.scale(1 / z, 1 / z);
  ctx.font = 'bold 12px "Press Start 2P"'; ctx.textAlign = 'center';
  rows.forEach((r, i) => {
    const ry = (i - rows.length + 1) * 16;
    ctx.fillStyle = '#000'; for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [2, 2]]) ctx.fillText(r, dx, ry + dy);
    ctx.fillStyle = '#d9f99d'; ctx.fillText(r, 0, ry);
  });
  ctx.restore();
};

// ---------------------------------------------------------------------------
// His death
// ---------------------------------------------------------------------------

export const drawAlienDeath = (ctx: Ctx, c: BossCorpse, frame: number) => {
  const age = Math.max(0, frame - c.frame0);
  ctx.save();
  let head: { x: number; y: number };
  switch (howOf(c)) {
    case 'ice': head = ice(ctx, c, age, frame); break;
    case 'fire': head = fire(ctx, c, age, frame); break;
    case 'rock': head = rock(ctx, c, age, frame); break;
    case 'wave': head = wave(ctx, c, age, frame); break;
    case 'od': head = od(ctx, c, age, frame); break;
    case 'zap': head = zap(ctx, c, age, frame); break;
    case 'melt': head = melt(ctx, c, age, frame); break;
    case 'nuke': head = nuke(ctx, c, age, frame); break;
    case 'skull': head = keelOver(ctx, c, age, frame, true); break;
    default: head = keelOver(ctx, c, age, frame, false);
  }
  words(ctx, head.x, head.y - 28);
  ctx.restore();
};

/** Where his head is, standing with his feet at (x, y). */
const headOf = (c: BossCorpse, x: number, y: number) => ({ x: x + c.own!.face * 10 * S, y: y - alienTall() });

/**
 * Ice: the frost climbs him from his feet as he hangs there, he's a block, and down he comes; on the floor he bursts:
 * chunks of him (green through the middle of each) skidding off, shards of ice, a green slush spreading, a cold fog.
 */
const ice = (ctx: Ctx, c: BossCorpse, age: number, frame: number) => {
  const f = c.own!.face, L = landAt(c), d = dropped(c, age);
  const frost = -Math.round(seg(age, 0, 20) * 6) * 19;
  const key = `ice${f}|${frost}`;
  const img = figure(key, { facing: f, t: 40, eyes: frost <= -100 ? 'rolled' : 'popped', open: true, frost, tongue: frost <= -100 });
  if (age < L) {
    // (shivering till he's solid)
    const j = frost > -100 && frame % 4 < 2 ? S : 0;
    put(ctx, img, d.x + j, d.y);
    if (age >= 18) {
      // The block round him, setting
      const a = seg(age, 18, 22), w = 92 * S * 0.5, top = d.y - alienTall() - 8;
      ctx.globalAlpha = 0.28 * a; ctx.fillStyle = '#a5f3fc'; ctx.fillRect(d.x - w, top, w * 2, d.y - top);
      ctx.globalAlpha = 0.85 * a; ctx.fillStyle = '#ecfeff';
      ctx.fillRect(d.x - w, top, w * 2, S); ctx.fillRect(d.x - w, top, S, d.y - top); ctx.fillRect(d.x - w + 6, top + 6, S * 2, 30); ctx.fillRect(d.x - w + 6, top + 6, 24, S * 2);
      ctx.fillStyle = '#67e8f9'; ctx.fillRect(d.x + w - S, top, S, d.y - top); ctx.fillRect(d.x - w, d.y - S, w * 2, S);
      ctx.globalAlpha = 1;
    }
    // (his breath fogging, frost smoking off him)
    if (frame % 30 < 18) pixelBlob(ctx, d.x + f * 30, d.y - alienTall() + 30 - (frame % 30), 6 + (frame % 30) * 0.4, 5, 'rgba(224, 242, 254, 0.5)');
    return headOf(c, d.x, d.y);
  }
  const t = age - L, x = c.own!.spot;
  // The slush he leaves, spreading
  pool(ctx, x, lerp(30, 120, easeOut(seg(t, 4, 90))), lerp(4, 9, seg(t, 4, 90)), ['#3f6212', '#a3c56a', '#ecfccb'], 3);
  // The chunks of him: his figure cut up, each piece flying, green showing at its broken edges
  const cols = 4, rows = 5, x0 = CX - 40, y0 = BASE - 112, cw = 84 / cols, rh = 112 / rows;
  for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
    const i = r * cols + q;
    const wx = x + (x0 + q * cw + cw / 2 - CX) * S, wy = FLOOR + (y0 + r * rh + rh / 2 - BASE) * S;
    const b = flyingBit(i, t, wx, wy, 5 + (rows - r) * 0.8, 11);
    piece(ctx, img, x0 + q * cw, y0 + r * rh, cw, rh, b.x, Math.min(b.y, FLOOR - rh * S * 0.4), b.rot);
    // (the green through the break)
    ctx.save(); ctx.translate(b.x, Math.min(b.y, FLOOR - rh * S * 0.4)); ctx.rotate(b.rot);
    ctx.fillStyle = ALIEN.slime; ctx.fillRect(-cw * S * 0.4, rh * S * 0.3, cw * S * 0.8, S); ctx.fillStyle = ALIEN.slimeDark; ctx.fillRect(-cw * S * 0.4, rh * S * 0.3 + S, cw * S * 0.6, S);
    ctx.fillStyle = 'rgba(236, 254, 255, 0.7)'; ctx.fillRect(-cw * S * 0.5, -rh * S * 0.5, S, rh * S * 0.7);
    ctx.restore();
  }
  // Shards of the ice, flying and skittering
  for (let i = 0; i < 22; i++) {
    const b = flyingBit(i, t, x + (hash(i) - 0.5) * 60, FLOOR - 30 - hash(i + 9) * 100, 8, 23);
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot);
    ctx.fillStyle = i % 2 ? '#e0f2fe' : '#a5f3fc'; ctx.fillRect(-4, -1.5, 8, 3); ctx.fillStyle = '#ffffff'; ctx.fillRect(-4, -1.5, 3, 1.5);
    ctx.restore();
  }
  // (the burst: a ring of frost puffing out, the cold fog after)
  if (t < 14) { const r = 20 + t * 9; ctx.strokeStyle = `rgba(236, 254, 255, ${(0.8 * (1 - t / 14)).toFixed(2)})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(x, FLOOR - 50, r, r * 0.7, 0, 0, Math.PI * 2); ctx.stroke(); }
  for (let k = 0; k < 5; k++) { const u = ((t * 0.6 + k * 20) % 100) / 100, a = (1 - u) * 0.35 * clamp01(1 - t / 160); if (a > 0.02) pixelBlob(ctx, x - 80 + k * 40 + u * 10, FLOOR - 10 - u * 30, 22 + u * 14, 8 + u * 6, `rgba(224, 242, 254, ${a.toFixed(2)})`); }
  return { x, y: FLOOR - 60 };
};

/**
 * Fire: he catches, comes down ablaze, flailing; the President's skin on him melts and runs off in drips; he goes from
 * green to brown to black; the ray gun pops off his arm; he goes over and burns down to a husk, the cracks in him
 * glowing and cooling out, smoke going up.
 */
const fire = (ctx: Ctx, c: BossCorpse, age: number, frame: number) => {
  const f = c.own!.face, L = landAt(c), d = dropped(c, age);
  const POP = L + 50, OVER = L + 78, OVER_T = 18;
  const char = Math.floor(seg(age, 0, L + 100) * 4);
  const tint: [string, number] = ([['#000000', 0], ['#6b3a12', 0.38], ['#2a170c', 0.62], ['#120a06', 0.86]] as [string, number][])[Math.min(3, char)];
  const flail = age < OVER && Math.floor(age / 6) % 2 === 0;
  const peel = Math.round(clamp01(1 - seg(age, L, L + 60)) * 4) / 4 * 0.7;
  const glow = age < L + 60 ? '' : age < L + 100 ? '#FFB300' : age < L + 150 ? '#E65100' : age < L + 190 ? '#8D1B0B' : '';
  const key = `fire${f}|${char}|${flail ? 1 : 0}|${peel}|${age >= POP ? 1 : 0}|${glow}`;
  const img = figure(key, { facing: f, t: 30, arm: flail ? 'aim' : 'down', aim: -0.9, eyes: char >= 3 ? 'x' : 'popped', open: true, tongue: char >= 2, peel, tint: tint[1] ? [tint[0], tint[1]] : undefined, gunGone: age >= POP, cracks: glow || undefined });
  const down = age < OVER ? 0 : easeOut(seg(age, OVER, OVER + OVER_T));
  const x = d.x + (age < OVER && age >= L ? Math.sin(age * 0.5) * 3 : 0);
  // The melted skin, run off him into a puddle at his feet; then the black of where he burned
  if (age >= L) pool(ctx, c.own!.spot, lerp(10, 54, seg(age, L, L + 80)), 4, [RAMP.tSkin[1], RAMP.tSkin[3], RAMP.tSkin[5]], 5);
  if (age >= OVER) { ctx.fillStyle = 'rgba(20, 12, 8, 0.6)'; ctx.beginPath(); ctx.ellipse(c.own!.spot - f * 60, FLOOR - 1, lerp(20, 110, seg(age, OVER, OVER + 60)), 5, 0, 0, Math.PI * 2); ctx.fill(); }
  put(ctx, img, x, d.y, { rot: -f * down * Math.PI / 2 });
  // (the skin dripping off him as it goes)
  if (age < L + 70) for (let k = 0; k < 6; k++) {
    const u = ((age * 1.4 + k * 17) % 40) / 40, dx = (hash(k) - 0.5) * 70;
    dot(ctx, x + dx, d.y - 70 + u * 68, 3, 4 + u * 4, k % 2 ? RAMP.tSkin[3] : RAMP.tSkin[4]);
  }
  // The gun going off his arm: a pink pop, chrome flying
  if (age >= POP && age < POP + 40) {
    const t = age - POP, gx = d.x + f * 34 * S, gy = d.y - 40 * S;
    if (t < 10) { steppedGlow(ctx, gx, gy, 16 + t * 5, '#ec44c4', 0.7 * (1 - t / 10), 0, 4); dot(ctx, gx - 6, gy - 6, 12, 12, t < 4 ? '#ffffff' : ALIEN.laser[5]); }
    for (let i = 0; i < 7; i++) { const b = flyingBit(i, t, gx, gy, 7, 31); dot(ctx, b.x, b.y, 4, 3, i % 2 ? ALIEN.steel[4] : ALIEN.steel[2]); }
  }
  // The fire: up from his feet, all over him, lying down with him, dying down
  const k = age < 10 ? seg(age, 0, 10) : 1 - seg(age, L + 110, L + 170);
  if (k > 0.02) {
    const w = lerp(70, 150, down), h = lerp(170, 60, down), fx = x - f * down * 60;
    drawFire(ctx, fx, d.y - 2, w, h, frame, { seed: 7, k, glow: 0.8 });
    drawFlameLicks(ctx, fx, d.y - 2, w * 1.1, h * 1.05, frame, { seed: 5, k, n: 7 });
  }
  // Smoke, and embers going up off the husk
  for (let i = 0; i < 6; i++) {
    const u = ((frame * 0.7 + i * 17) % 100) / 100, a = Math.floor((1 - u) * 4) * 0.12 * seg(age, 20, 60);
    if (a > 0) pixelBlob(ctx, x - f * down * 60 + (hash(i) - 0.5) * 50 + Math.sin(u * 5 + i) * 6, d.y - lerp(150, 50, down) - u * 110, 12 * (0.6 + u), 10 * (0.5 + u), `rgba(41, 37, 36, ${a.toFixed(2)})`);
  }
  if (age > L + 120) for (let i = 0; i < 5; i++) { const u = ((frame * 1.2 + i * 23) % 60) / 60; dot(ctx, c.own!.spot - f * 60 + (hash(i * 3) - 0.5) * 120, FLOOR - 20 - u * 60, 3, 3, u < 0.5 ? '#FF6D00' : '#8D1B0B'); }
  return age < OVER ? headOf(c, x, d.y) : { x: c.own!.spot - f * 130, y: FLOOR - 50 };
};

/**
 * The rock: his head off at the neck in a gout of green; the head goes end over end onto the podium (BONK), off it, and
 * rolls to a stop on the carpet, tongue out. The body hangs there a beat, headless, the neck fountaining; drops; stands
 * there swaying, and goes over.
 */
const rock = (ctx: Ctx, c: BossCorpse, age: number, frame: number) => {
  const f = c.own!.face, L = landAt(c), d = dropped(c, age);
  const body = figure(`rockB${f}`, { facing: f, t: 20, headless: true, open: true });
  const headImg = figure(`rockH${f}|${age >= ROCK.bonk ? 1 : 0}`, { facing: f, t: 20, headOnly: true, eyes: age >= ROCK.bonk ? 'x' : 'cross', tongue: true, open: true });
  const tOver = Math.max(L + 10, ROCK.topple), down = easeOut(seg(age, tOver, tOver + 18));
  const sway = age >= L && age < tOver ? Math.sin(age * 0.4) * 0.06 : 0;
  // The green out of his neck: a fountain, then a pool spreading from it
  const spot = c.own!.spot;
  if (age > L) pool(ctx, spot - f * 70 * down, lerp(16, 90, seg(age, L, L + 90)), lerp(3, 7, seg(age, L, L + 90)), undefined, 9);
  put(ctx, body, d.x, d.y, { rot: -f * down * Math.PI / 2 + sway });
  const neck = { x: d.x + f * 9 * S * Math.cos(down * Math.PI / 2) - f * 92 * S * Math.sin(down * Math.PI / 2) * 1, y: d.y - 92 * S * Math.cos(down * Math.PI / 2) };
  const spurt = 1 - seg(age, 10, L + 50);
  if (spurt > 0) {
    for (let k = 0; k < 4; k++) {
      const h = (14 + ((frame * 0.9 + k * 7) % 20)) * spurt * S * 2;
      ctx.save(); ctx.translate(neck.x + (k - 1.5) * 4, neck.y); ctx.rotate(-f * down * Math.PI / 2);
      ctx.fillStyle = k % 2 ? ALIEN.slime : ALIEN.slimeLight; ctx.fillRect(-1.5, -h, 3, h);
      ctx.restore();
    }
    spray(ctx, 10, (frame % 40), neck.x, neck.y, 4 * spurt + 1, Math.floor(frame / 40));
  }
  // The rock that did it, going on its way, and the stones off it
  if (age < 30) for (let i = 0; i < 8; i++) { const b = flyingBit(i, age, c.own!.from.x + f * 20, c.own!.from.y - alienTall() + 10, 8, 41); dot(ctx, b.x, b.y, 5, 4, i % 2 ? '#78716C' : '#A8A29E'); }
  // The head
  const h = rockHead(c, age);
  // (the trail it rolls along, and the splat it leaves on the podium)
  if (age >= ROCK.bonk) { const p = rockHead(c, ROCK.bonk); pixelBlob(ctx, p.x, p.y + 10, 16, 4, ALIEN.slimeDark); pixelBlob(ctx, p.x, p.y + 9, 11, 3, ALIEN.slime); for (let k = 0; k < 3; k++) dot(ctx, p.x - 12 + k * 11, p.y + 12, 3, 8 + k * 5, ALIEN.slimeDark); }
  if (age > ROCK.floor) { const a = rockHead(c, ROCK.floor); ctx.fillStyle = ALIEN.slimeDark; ctx.fillRect(Math.min(a.x, h.x), FLOOR - 3, Math.abs(h.x - a.x), 3); }
  // (in the air: the stump end dribbling behind it)
  if (age < ROCK.floor) for (let k = 0; k < 3; k++) dot(ctx, h.x - Math.cos(h.spin) * 10 - k * 4, h.y + 14 + k * 5, 3, 3, ALIEN.slime);
  const hb = headBox(f);
  piece(ctx, headImg, hb.x, hb.y, hb.w, hb.h, h.x, h.y, age >= ROCK.rest ? (f > 0 ? Math.PI / 2 : -Math.PI / 2) * 0.9 : h.spin);
  // BONK: the stars off it
  if (age >= ROCK.bonk && age < ROCK.bonk + 12) { const p = rockHead(c, ROCK.bonk), t = age - ROCK.bonk; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; dot(ctx, p.x + Math.cos(a) * (10 + t * 3), p.y + Math.sin(a) * (10 + t * 3) * 0.6, 3, 3, k % 2 ? '#FDE047' : '#ffffff'); } }
  return { x: h.x, y: h.y + 6 };
};

/**
 * The wave: up it comes behind him, a wall of it; it has him off his feet and he goes tumbling in it, into the wall,
 * and he's flat on it, spread out in a great green splat; he peels off and slides down it, a streak behind him, into a
 * heap at its foot in what's left of the water.
 */
const wave = (ctx: Ctx, c: BossCorpse, age: number, frame: number) => {
  const f = c.own!.face, L = landAt(c), t = age - L, { dir, x: wx } = waveWall(c), spot = c.own!.spot;
  const img = figure(`wave${f}|${t >= WAVE.slam ? 1 : 0}`, { facing: f, t: 10, eyes: t >= WAVE.slam ? 'x' : 'popped', tongue: t >= WAVE.slam, open: true, tint: t >= WAVE.grab ? ['#1e3a8a', 0.22] : undefined });
  const flatX = wx - dir * 14, top = FLOOR - alienTall() / 2 - 60;
  // The splat on the wall, from the slam on; the streak down it as he slides
  if (t >= WAVE.slam) {
    const u = easeOut(seg(t, WAVE.slam, WAVE.slam + 8));
    splat(ctx, flatX - dir * 26, top - 20, 70 * u, 5, 2);
    splat(ctx, flatX - dir * 50, top + 70, 34 * u, 9, 1);
    const b = waveBody(c, age);
    ctx.fillStyle = ALIEN.slimeDark; ctx.fillRect(Math.min(flatX, flatX - dir * 40), top, 40, Math.max(0, b.y - top));
    ctx.fillStyle = ALIEN.slime; ctx.fillRect(Math.min(flatX, flatX - dir * 30) + 4, top, 20, Math.max(0, b.y - top - 6));
  }
  // The water: rising behind him, a wall of it with a curl of foam, carrying him; up the wall; draining away
  const water = (front: boolean) => {
    if (t < WAVE.rise) return;
    const b = waveBody(c, Math.max(age, L));
    const rise = easeOut(seg(t, WAVE.rise, WAVE.grab)), fall = seg(t, WAVE.slam, WAVE.slam + 40);
    const fx = t < WAVE.grab ? lerp(spot - dir * 260, spot - dir * 50, rise) : t < WAVE.slam ? b.x - dir * 30 : flatX;
    const h = 260 * rise * (1 - fall);
    if (h > 2) {
      ctx.globalAlpha = front ? 0.42 : 0.9;
      for (let k = 0; k < 160; k++) {
        const dist = k * 6, xx = fx - dir * dist;
        const prof = dist < 80 ? Math.sin((dist / 80) * Math.PI / 2) : 1 - Math.min(0.5, (dist - 80) / 1400);
        let hh = h * prof + Math.sin(xx * 0.05 + frame * 0.25) * 3;
        if (front) hh *= 0.5;
        const top = FLOOR - hh;
        ctx.fillStyle = '#1e3a8a'; ctx.fillRect(xx - 3, top, 6, hh);
        ctx.fillStyle = '#1d4ed8'; ctx.fillRect(xx - 3, top, 6, hh * 0.62);
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(xx - 3, top, 6, hh * 0.3);
        ctx.fillStyle = '#93c5fd'; ctx.fillRect(xx - 3, top, 6, Math.min(6, hh * 0.08));
      }
      ctx.globalAlpha = 1;
      // (the curl at its front, foaming, the lip of it over)
      if (!front) for (let i = 0; i < 14; i++) { const u = i / 14, yy = FLOOR - h + u * h * 0.7, xx = fx + dir * (Math.sin(u * Math.PI) * 26 + Math.sin(i * 0.9 + frame * 0.3) * 5); dot(ctx, xx - 6, yy, 12, 6, i % 2 ? '#e0f2fe' : '#ffffff'); }
    }
    if (front) return;
    // (up the wall, crashing)
    if (t >= WAVE.slam && t < WAVE.slam + 36) { const u = (t - WAVE.slam) / 36; for (let i = 0; i < 16; i++) dot(ctx, wx - dir * (8 + hash(i) * 60), FLOOR - 40 - Math.sin(u * Math.PI) * (160 + hash(i + 3) * 140) + i * 4, 7, 10, i % 2 ? '#e0f2fe' : '#60a5fa'); }
    // (what's left on the floor)
    if (fall > 0) pool(ctx, flatX - dir * 80, 160 * (1 - fall * 0.5), 6, ['#1e3a8a', '#3b82f6', '#bfdbfe'], 7);
  };
  water(false);
  if (age < L) {
    const d = dropped(c, age);
    put(ctx, img, d.x, d.y);
  } else {
    const b = waveBody(c, age);
    if (b.flat > 0) {
      // (flat on it: thin, spread, then peeling and slumping)
      put(ctx, img, b.x, b.y, { ax: CX, ay: BASE - 54, sx: lerp(1, 0.32, b.flat), sy: lerp(0.7, 1.2, b.flat) });
    } else if (t >= WAVE.peel) {
      put(ctx, img, b.x, FLOOR - 4, { ax: CX, ay: BASE, rot: -dir * Math.PI / 2, sx: 0.8, sy: 1 });
    } else put(ctx, img, b.x, b.y, { ax: CX, ay: BASE - 54, rot: b.spin });
    if (t >= WAVE.slam - 2 && t < WAVE.slam + 14) spray(ctx, 26, t - WAVE.slam + 2, flatX, top, 10, 51);
  }
  water(true);
  if (t >= WAVE.heap) pool(ctx, flatX - dir * 50, lerp(20, 70, seg(t, WAVE.heap, WAVE.heap + 40)), 5, undefined, 8);
  const b = waveBody(c, Math.max(age, L));
  return age < L ? headOf(c, dropped(c, age).x, dropped(c, age).y) : { x: b.x - dir * 40, y: b.y - 60 };
};

/**
 * The overdose: needles all over him, twitching, his pupils blown; he swells like a balloon, rounder and rounder, lifts
 * off the floor, drifts up, bumps the ceiling, squashes against it, and POPS: green rain, his rags, his tie, his gun and
 * the needles fluttering down.
 */
const od = (ctx: Ctx, c: BossCorpse, age: number, frame: number) => {
  const f = c.own!.face, L = landAt(c), t = age - L;
  if (age < L) {
    const d = dropped(c, age);
    put(ctx, figure(`od${f}|0`, { facing: f, t: 0, eyes: 'dilated', tongue: true, open: true }), d.x, d.y);
    return headOf(c, d.x, d.y);
  }
  const b = odBody(c, age);
  if (t < OD.pop) {
    const step = Math.min(3, Math.floor((b.swell - 1) / 0.85 * 4));
    const img = figure(`od${f}|${step}`, { facing: f, t: 0, eyes: 'dilated', tongue: true, open: true, tint: step ? ['#c026d3', 0.08 * step] : undefined });
    const jx = t < OD.lift ? (frame % 3 - 1) * S : 0;
    const sq = b.squash;
    const sx = b.swell * 1.08 * (1 + 0.14 * sq), sy = b.swell * 0.94 * (1 - 0.2 * sq);
    // (the shadow of him on the floor, smaller as he goes up)
    const up = clamp01((FLOOR - alienTall() / 2 - b.y) / 500);
    ctx.fillStyle = `rgba(0, 0, 0, ${(0.3 * (1 - up)).toFixed(2)})`; ctx.beginPath(); ctx.ellipse(b.x, FLOOR - 1, 50 * (1 - up * 0.6), 5, 0, 0, Math.PI * 2); ctx.fill();
    put(ctx, img, b.x + jx, b.y, { ax: CX, ay: BASE - 54, sx, sy });
    // (the gut blowing up round, a balloon of him, shiny)
    const g = (b.swell - 1) / 0.85;
    if (g > 0) {
      const gx = b.x + f * 3 * S * sx, gy = b.y + 16 * S * sy, r = 22 * S * sx * (0.6 + g * 0.55);
      ctx.fillStyle = ALIEN.belly[2]; ctx.beginPath(); ctx.ellipse(gx, gy, r, r * 0.9 * (1 - 0.15 * sq), 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = ALIEN.belly[4]; ctx.beginPath(); ctx.ellipse(gx - r * 0.12, gy - r * 0.12, r * 0.78, r * 0.68, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = ALIEN.belly[6]; ctx.beginPath(); ctx.ellipse(gx - r * 0.35, gy - r * 0.4, r * 0.22, r * 0.14, -0.5, 0, Math.PI * 2); ctx.fill();
      for (let v = 0; v < 5; v++) dot(ctx, gx - r * 0.6 + v * r * 0.3, gy + Math.sin(v * 2) * r * 0.4, 1.5, r * 0.25, ALIEN.vein);
      dot(ctx, gx + f * 1, gy + r * 0.15, 3, 3, ALIEN.belly[1]);
    }
    // The needles in him, sticking out all over
    for (let i = 0; i < 9; i++) {
      const a = hash(i * 5) * Math.PI * 2, rr = (0.5 + hash(i * 7) * 0.4) * 50 * Math.max(sx, sy) * 0.55;
      const nx = b.x + Math.cos(a) * rr * 0.8, ny = b.y + Math.sin(a) * rr;
      ctx.save(); ctx.translate(nx, ny); ctx.rotate(a);
      ctx.fillStyle = '#E5E7EB'; ctx.fillRect(0, -2, 12, 4); ctx.fillStyle = '#E879F9'; ctx.fillRect(2, -1, 6, 2); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(12, -0.75, 5, 1.5); ctx.fillRect(-2, -3, 2, 6);
      ctx.restore();
    }
    // (foam at the mouth, dripping)
    if (frame % 8 < 6) dot(ctx, b.x + f * 22 * sx, b.y - 52 * sy + (frame % 8) * 2, 3, 3, '#f5f5f4');
    // (the ceiling giving under him)
    if (sq > 0) for (let k = 0; k < 6; k++) dot(ctx, b.x - 50 + k * 20, ROOM_TOP + 2 + (k % 2) * 3, 6, 3, '#57534e');
    return { x: b.x, y: b.y - 60 * sy };
  }
  // POP
  const p = age - L - OD.pop, top = { x: b.x, y: b.y };
  // (the stain it leaves up there, dripping)
  splat(ctx, top.x, ROOM_TOP + 14, 80, 13, 2);
  for (let k = 0; k < 6; k++) { const u = ((p * 0.8 + k * 13) % 50) / 50; dot(ctx, top.x - 70 + k * 28, ROOM_TOP + 30 + u * (FLOOR - ROOM_TOP - 30), 3, 6, ALIEN.slime); }
  if (p < 12) {
    steppedGlow(ctx, top.x, top.y, 40 + p * 14, '#a8e03a', 0.8 * (1 - p / 12), 0, 5);
    pixelBlob(ctx, top.x, top.y, 50 + p * 10, 40 + p * 8, p < 4 ? '#ffffff' : ALIEN.slimeLight);
  }
  // The green rain, coming down and splatting on the carpet
  spray(ctx, 46, p, top.x, top.y, 9, 61);
  // His rags, the tie, the gun, the needles: fluttering down, settling
  for (let i = 0; i < 9; i++) {
    const heavy = i === 8, fall = heavy ? 4.2 : 1.6 + hash(i) * 1.4;
    const y = Math.min(FLOOR - 4, top.y + p * fall + (heavy ? p * p * 0.05 : 0)), landed = y >= FLOOR - 4;
    const x = top.x + (hash(i * 3) - 0.5) * 220 * clamp01(p / 40) + (landed ? 0 : Math.sin(p * 0.12 + i) * 16);
    if (heavy) { ctx.save(); ctx.translate(x, y); ctx.rotate(landed ? 0.2 : p * 0.2); ctx.fillStyle = ALIEN.steel[2]; ctx.fillRect(-14, -4, 28, 8); ctx.fillStyle = ALIEN.steel[4]; ctx.fillRect(-14, -4, 28, 2); ctx.fillStyle = ALIEN.laser[3]; ctx.fillRect(-4, -2, 8, 4); ctx.restore(); }
    else rag(ctx, x, y, i, landed ? 0 : Math.sin(p * 0.1 + i) * 0.8);
  }
  for (let i = 0; i < 9; i++) { const n = flyingBit(i, p, top.x, top.y, 7, 71); ctx.save(); ctx.translate(n.x, n.y); ctx.rotate(n.rest ? 0 : n.rot); ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-6, -1.5, 12, 3); ctx.fillStyle = '#E879F9'; ctx.fillRect(-3, -1, 5, 2); ctx.restore(); }
  return { x: top.x, y: top.y };
};

/**
 * The taser: jolted, his skeleton flickering through him as he jerks about, eyes popped, bolts crawling over him; then
 * he goes over stiff as a board, smoking, a last flicker of his bones now and then.
 */
const zap = (ctx: Ctx, c: BossCorpse, age: number, frame: number) => {
  const f = c.own!.face, L = landAt(c), d = dropped(c, age), OVER = L + 90;
  const live = age < OVER;
  // (the bones through him in bursts, not a strobe)
  const xray = live ? frame % 9 < 3 : (frame % 50 < 3);
  const burnt = age >= OVER;
  const img = figure(`zap${f}|${xray ? 1 : 0}|${burnt ? 1 : 0}`, { facing: f, t: 0, eyes: burnt ? 'x' : 'popped', tongue: true, open: true, arm: live && !xray ? 'aim' : 'down', aim: -1, xray, tint: burnt && !xray ? ['#1c1410', 0.55] : undefined });
  const h = Math.floor(frame / 2);
  const jx = live ? (hash(h) - 0.5) * 8 : 0, jy = live ? (hash(h + 5) - 0.5) * 5 : 0, jr = live ? (hash(h + 9) - 0.5) * 0.12 : 0;
  const down = easeOut(seg(age, OVER, OVER + 14));
  put(ctx, img, d.x + jx, d.y + jy, { rot: jr - f * down * Math.PI / 2 });
  // The bolts over him, and off his gun
  if (live) for (let k = 0; k < 4; k++) {
    const y0 = d.y - 20 - hash(h * 3 + k) * alienTall(), x0 = d.x + (hash(h * 7 + k) - 0.5) * 120;
    bolt(ctx, x0, y0, x0 + (hash(h + k * 11) - 0.5) * 70, y0 + (hash(h + k * 13) - 0.5) * 70, frame, k);
  }
  // (smoke off him, burnt; sparks)
  for (let i = 0; i < 5; i++) {
    const u = ((frame * 0.8 + i * 20) % 100) / 100, a = Math.floor((1 - u) * 4) * 0.1 * seg(age, L, L + 40);
    if (a > 0) pixelBlob(ctx, d.x - f * down * 100 + (hash(i) - 0.5) * 60, d.y - lerp(130, 30, down) - u * 80, 10 * (0.6 + u), 8 * (0.5 + u), `rgba(64, 64, 70, ${a.toFixed(2)})`);
  }
  if (!live && frame % 50 < 3) bolt(ctx, d.x - f * 80, FLOOR - 30, d.x - f * 20, FLOOR - 20, frame, 9);
  return live ? headOf(c, d.x, d.y) : { x: d.x - f * 140, y: FLOOR - 40 };
};

const bolt = (ctx: Ctx, x0: number, y0: number, x1: number, y1: number, frame: number, seed: number) => {
  const pts: [number, number][] = [], n = 6, h = Math.floor(frame / 2);
  for (let i = 0; i <= n; i++) { const u = i / n, j = i === 0 || i === n ? 0 : (hash(h * 7 + seed * 31 + i) - 0.5) * 16; pts.push([lerp(x0, x1, u) + j, lerp(y0, y1, u) - j * 0.5]); }
  ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
  for (const [col, lw] of [['#006064', 5], ['#26C6DA', 3], ['#E0F7FA', 1.5]] as [string, number][]) {
    ctx.strokeStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke();
  }
};

/**
 * The sludge: down into it with a splash, and it eats him: he sinks, slumping, the green of it climbing him and
 * holes eaten through to the bone, dripping strings of himself, the puddle bubbling wider; till there's just his skull
 * bobbing in it, the tie floating by, the gun sticking up out of it, fumes.
 */
const melt = (ctx: Ctx, c: BossCorpse, age: number, frame: number) => {
  const f = c.own!.face, L = landAt(c), d = dropped(c, age), t = age - L;
  const spot = c.own!.spot;
  const sink = easeOut(seg(t, 6, 140));
  const r = lerp(40, 130, easeOut(seg(t, 0, 140)));
  const SL: [string, string, string] = ['#365314', '#65a30d', '#bef264'];
  if (t >= 0) pool(ctx, spot, r, lerp(5, 11, seg(t, 0, 140)), SL, 21);
  if (sink < 0.92) {
    const step = Math.min(3, Math.floor(sink * 4.2));
    const img = figure(`melt${f}|${step}`, { facing: f, t: 0, eyes: step >= 2 ? 'rolled' : 'popped', tongue: step >= 1, open: true, eaten: step, tint: ['#65a30d', 0.15 + step * 0.15] });
    // (sinking into it, sagging: clipped at its surface)
    ctx.save();
    ctx.beginPath(); ctx.rect(d.x - 200, ROOM_TOP, 400, FLOOR - 4 - ROOM_TOP); ctx.clip();
    put(ctx, img, d.x + Math.sin(age * 0.15) * 2 * sink, d.y + sink * alienTall() * 0.85, { sx: 1 + sink * 0.25, sy: 1 - sink * 0.3 });
    ctx.restore();
    // (strings of him dripping off into it)
    for (let k = 0; k < 7; k++) { const u = ((age * 1.1 + k * 13) % 30) / 30, top = d.y - alienTall() * (1 - sink) * 0.7; dot(ctx, d.x - 50 + k * 16, top + u * (FLOOR - top) * 0.9, 3, 6 + u * 10, k % 2 ? SL[1] : SL[0]); }
  }
  // What's left: the skull bobbing, the tie floating, the gun sticking up
  if (t > 100) {
    const bob = Math.sin(age * 0.12) * 2, a = seg(t, 100, 130);
    ctx.save(); ctx.globalAlpha = a;
    skullAt(ctx, spot + f * 12, FLOOR - 8 + bob, f);
    rag(ctx, spot - f * 50 + Math.sin(age * 0.05) * 10, FLOOR - 4, 0, Math.PI / 2 + Math.sin(age * 0.07) * 0.2);
    ctx.save(); ctx.translate(spot - f * 20, FLOOR - 6); ctx.rotate(f * 0.5); ctx.fillStyle = ALIEN.steel[2]; ctx.fillRect(-4, -34, 8, 34); ctx.fillStyle = ALIEN.steel[4]; ctx.fillRect(-4, -34, 2, 34); ctx.fillStyle = ALIEN.laser[2]; ctx.fillRect(-2, -24, 4, 8); ctx.restore();
    ctx.restore();
  }
  // Bubbles popping in it, and the fumes off it
  if (t >= 0) for (let k = 0; k < 6; k++) { const u = ((frame + k * 11) % 40) / 40, bx = spot - r * 0.7 + hash(k + Math.floor((frame + k * 11) / 40)) * r * 1.4; if (u < 0.7) { ctx.strokeStyle = SL[2]; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bx, FLOOR - 4, 2 + u * 7, Math.PI, 0); ctx.stroke(); } else dot(ctx, bx, FLOOR - 10 - (u - 0.7) * 40, 3, 3, SL[2]); }
  for (let k = 0; k < 4; k++) { const u = ((frame * 0.6 + k * 25) % 100) / 100, a = Math.floor((1 - u) * 4) * 0.08 * seg(t, 0, 30); if (a > 0) pixelBlob(ctx, spot - 60 + k * 40, FLOOR - 20 - u * 100, 12 + u * 10, 8 + u * 6, `rgba(163, 230, 53, ${a.toFixed(2)})`); }
  return sink < 0.92 ? headOf(c, d.x, d.y + sink * alienTall() * 0.85) : { x: spot, y: FLOOR - 30 };
};

/** His skull (bone: the little cranium, the block of the jaw, the pegs), in the world, about as big as his head. */
const skullAt = (ctx: Ctx, x: number, y: number, f: number) => {
  const R = (dx: number, dy: number, w: number, h: number, c: string) => dot(ctx, x + (f > 0 ? dx : -dx - w) * S, y + dy * S, w * S, h * S, c);
  R(-6, -18, 12, 8, BONE[2]); R(-6, -18, 12, 2, BONE[3]); R(-4, -15, 3, 3, '#1a1a10'); R(2, -15, 3, 3, '#1a1a10');
  R(-8, -10, 22, 9, BONE[2]); R(-8, -10, 22, 1, BONE[3]); R(-8, -2, 22, 1, BONE[0]);
  for (let i = 0; i < 5; i++) R(-6 + i * 4, -12, 2, 3, '#f4ecc0');
  R(7, -14, 2, 2, '#1a1a10');
};

/**
 * The blast: he lands smoking and ticking, swelling, cracks glowing in him, shaking; then he goes up: a fireball, and
 * every bit of him out of it, spinning, landing, the green everywhere; his feet left standing where he was, smoking.
 */
const nuke = (ctx: Ctx, c: BossCorpse, age: number, frame: number) => {
  const f = c.own!.face, L = landAt(c), d = dropped(c, age), B = L + NUKE.blast, spot = c.own!.spot;
  if (age < B) {
    const tick = seg(age, L, B);
    const img = figure(`nuke${f}|${tick > 0.5 ? 1 : 0}`, { facing: f, t: 0, eyes: 'popped', open: false, cracks: tick > 0.5 ? '#FDE047' : '#FF6D00', tint: ['#1c1917', 0.35] });
    const s = 1 + tick * 0.18, j = age >= L ? (frame % 2 ? S : -S) * tick * 2 : 0;
    put(ctx, img, d.x + j, d.y, { sx: s * (1 + tick * 0.06), sy: s });
    if (age >= L && frame % 10 < 5) steppedGlow(ctx, d.x, d.y - 80, 40 + tick * 30, '#f97316', 0.35 * tick, 0, 4);
    return headOf(c, d.x, d.y);
  }
  const t = age - B, cy = FLOOR - 80;
  const whole = figure(`nuke${f}|1`, { facing: f, t: 0, eyes: 'popped', open: true, cracks: '#FDE047', tint: ['#1c1917', 0.35] });
  // The scorch, the green over everything, the pool
  ctx.fillStyle = 'rgba(16, 12, 10, 0.7)'; ctx.beginPath(); ctx.ellipse(spot, FLOOR - 1, lerp(30, 150, easeOut(seg(t, 0, 20))), 6, 0, 0, Math.PI * 2); ctx.fill();
  if (t > 30) pool(ctx, spot, lerp(10, 70, seg(t, 30, 90)), 5, undefined, 31);
  // His feet, left standing where he was, smoking
  const feetBox = { x: CX - 26, y: BASE - 12, w: 52, h: 12 };
  piece(ctx, whole, feetBox.x, feetBox.y, feetBox.w, feetBox.h, spot, FLOOR - 6 * S, 0);
  dot(ctx, spot - 20, FLOOR - 18 - 2, 12, 4, ALIEN.slimeDark); dot(ctx, spot + 8, FLOOR - 18 - 2, 12, 4, ALIEN.slimeDark);
  for (let i = 0; i < 3; i++) { const u = ((frame * 0.8 + i * 33) % 100) / 100; pixelBlob(ctx, spot - 14 + i * 14, FLOOR - 24 - u * 70, 6 + u * 6, 5 + u * 4, `rgba(60, 56, 52, ${(0.4 * (1 - u)).toFixed(2)})`); }
  // The bits of him, flying (head, arms, legs, chest, gut, the gun), spinning, trailing green
  const parts: [number, number, number, number][] = [
    [CX - 5, BASE - 110, 31, 27], [CX - 42, BASE - 76, 20, 50], [CX + 22, BASE - 76, 20, 52], [CX - 28, BASE - 34, 22, 24],
    [CX + 6, BASE - 34, 22, 24], [CX - 27, BASE - 82, 54, 30], [CX - 21, BASE - 52, 42, 24],
  ];
  const fp = f > 0 ? parts : parts.map(([x, y, w, h]) => [2 * CX - x - w, y, w, h] as [number, number, number, number]);
  fp.forEach(([sx, sy, sw, sh], i) => {
    const b = flyingBit(i, t, spot + (sx + sw / 2 - CX) * S * 0.5, cy + (sy + sh / 2 - BASE + 54) * S * 0.5, 13, 81);
    const y = Math.min(b.y, FLOOR - sh * S * 0.3);
    if (!b.rest) for (let k = 1; k < 4; k++) dot(ctx, b.x - (b.x - spot) * 0.04 * k, y + k * 6, 3, 3, ALIEN.slime);
    piece(ctx, whole, sx, sy, sw, sh, b.x, y, b.rest ? Math.round(b.rot / (Math.PI / 2)) * (Math.PI / 2) : b.rot);
    if (b.rest) dot(ctx, b.x - 10, FLOOR - 3, 20, 3, ALIEN.slimeDark);
  });
  // Gore, everywhere: up the walls and the ceiling as well as the floor
  spray(ctx, 40, t, spot, cy, 16, 91);
  for (let i = 0; i < 4; i++) rag(ctx, spot + (hash(i * 9) - 0.5) * 260 * clamp01(t / 50), Math.min(FLOOR - 4, cy - 120 + t * (1.4 + hash(i) * 0.8)), i, Math.sin(t * 0.1 + i));
  // The fireball: white, yellow, orange, black smoke rolling up out of it
  if (t < 50) {
    const r = 30 + easeOut(seg(t, 0, 16)) * 120;
    const fade = 1 - seg(t, 18, 50);
    for (const [k, col] of [[1, '#7c2d12'], [0.8, '#f97316'], [0.6, '#fde047'], [0.35, '#ffffff']] as const) {
      if (t > 24 && k < 0.6) continue;
      pixelBlob(ctx, spot, cy - t * 1.5, r * k, r * k * 0.85, col);
    }
    if (fade < 1) pixelBlob(ctx, spot, cy - 40 - t * 2, r * 0.9, r * 0.6, `rgba(41, 37, 36, ${(0.8 * (1 - fade)).toFixed(2)})`);
  } else {
    for (let i = 0; i < 4; i++) { const u = ((t - 50) * 0.01 + i * 0.25) % 1; pixelBlob(ctx, spot + (hash(i) - 0.5) * 80, cy - 140 - u * 120, 40 * (0.6 + u), 26 * (0.6 + u), `rgba(41, 37, 36, ${(0.45 * (1 - u)).toFixed(2)})`); }
  }
  const head = flyingBit(0, t, spot + (fp[0][0] + fp[0][2] / 2 - CX) * S * 0.5, cy + (fp[0][1] + fp[0][3] / 2 - BASE + 54) * S * 0.5, 13, 81);
  return { x: head.x, y: Math.min(head.y, FLOOR - 30) };
};

/**
 * Going over (the plain death, and the pistol's execution as he begs): `shot`, a round through his head first, out the
 * back in a spray of green, his eyes crossing, a beat hanging there; then the float gives, he comes down, his knees go,
 * and he keels over onto his back, and the lake of slime spreads out of him.
 */
const keelOver = (ctx: Ctx, c: BossCorpse, age: number, frame: number, shot: boolean) => {
  const o = c.own!, f = o.face, L = landAt(c), d = dropped(c, age);
  const dir = c.facing; // (the way the round was going)
  const OVER = L + (shot ? 14 : 4), OVER_T = 18;
  // (he lies the way the lake has him: his feet where he stood, his head away from Meathead)
  const lie = -dir as 1 | -1;
  if (age >= OVER + OVER_T) {
    drawAlienCorpse(ctx, o.spot - lie * 70, FLOOR, lie, age - (OVER + OVER_T), frame);
    if (shot) { const hx = o.spot - lie * (alienTall() - 12), hy = FLOOR - 26; dot(ctx, hx - 4, hy - 4, 8, 8, ALIEN.mouth); dot(ctx, hx - 2, hy - 2, 4, 4, ALIEN.slimeDark); }
    return { x: o.spot - lie * 120, y: FLOOR - 40 };
  }
  const img = figure(`keel${f}|${shot ? 1 : 0}|${age >= L ? 1 : 0}`, { facing: f, t: 10, eyes: shot ? 'cross' : 'rolled', tongue: true, open: true, hole: shot ? (dir === f ? -1 : 1) : undefined });
  // (the round's jolt: his head snapped back; then the knees going)
  const snap = shot ? Math.sin(seg(age, 0, 10) * Math.PI) * 0.16 * dir : 0;
  const buckle = age >= L ? Math.sin(seg(age, L, OVER) * Math.PI) * 0.16 : 0;
  const k = easeOut(seg(age, OVER, OVER + OVER_T));
  if (k > 0) {
    // (over onto his back, the way the lake will have him: feet where he stands)
    ctx.save();
    ctx.translate(d.x, d.y - 8 * k);
    ctx.scale(lie, 1);
    ctx.rotate(-k * Math.PI / 2);
    put(ctx, figure(`keelL|${shot ? 1 : 0}`, { facing: 1, t: 10, eyes: shot ? 'cross' : 'rolled', tongue: true, open: true }), 0, 0);
    ctx.restore();
  } else put(ctx, img, d.x, d.y, { rot: snap, sy: 1 - buckle });
  // The round: in one side, out the other in a spray of green, bits in it
  if (shot && age < 30) {
    const hx = o.from.x + f * 6 * S, hy = o.from.y - 100 * S;
    if (age < 3) { dot(ctx, hx - dir * 120, hy - 1.5, 240, 3, '#fef9c3'); }
    // (a mist of it blown out the back first, then the gobbets: green, and pink bits of what he thought with)
    if (age < 10) pixelBlob(ctx, hx + dir * (24 + age * 5), hy - 2, 14 + age * 4, 10 + age * 3, `rgba(168, 224, 58, ${(0.7 * (1 - age / 10)).toFixed(2)})`);
    for (let i = 0; i < 34; i++) {
      const sp = 4 + hash(i) * 10, a = (hash(i + 3) - 0.5) * 1.1;
      const x = hx + dir * (14 + age * sp * Math.cos(a)), y = hy + age * sp * Math.sin(a) + age * age * 0.25;
      const sz = 3 + hash(i * 2) * 6;
      if (y < FLOOR) dot(ctx, x, y, sz, sz * 0.8, i % 5 === 0 ? '#f4a3b8' : i % 3 ? ALIEN.slime : ALIEN.slimeDark);
    }
    if (age < 6) steppedGlow(ctx, hx + dir * 16, hy, 22, '#a8e03a', 0.7, 0, 3);
  }
  // (the green going down him from the hole, out of the back of his head onto the carpet)
  if (shot && age >= 4) for (let kk = 0; kk < 6; kk++) { const g = flyingBit(kk, age, o.from.x - f * 4, o.from.y - 100 * S, 3, 101); if (g.y >= FLOOR - 5) dot(ctx, g.x - 6, FLOOR - 3, 12, 3, ALIEN.slimeDark); }
  return headOf(c, d.x, d.y);
};
