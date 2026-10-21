// The death message, Meathead 2's way (the way VICTORY got its stamp, victory.ts): not Meathead 1's flat red words.
// The letters drop in one after another and land with a squash, then sit there not quite still (a shudder through
// one now and then, a slow throb in the red), in banded blood red with a black edge. And they bleed: runs creep down
// off the bottoms of the letters, slowing as they go, a bead swelling on the end of each; now and then one lets go and
// a drop falls the rest of the way down the screen.
//
// Screen space. Drawn in place of Meathead 1's message (setDeathMessageDrawer, App.tsx); it keeps its own clock off
// the frame the message first shows, so it starts over for every death.

import type { GameState } from '../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../m1/constants';
import { idleTasks } from '../m1/game/scenes/art/raster';

type Ctx = CanvasRenderingContext2D;
const FONT = '"Press Start 2P"';

/** The house rule: a death screen's text is one line, 28 characters at most (checked in dev: here, and as each
 *  source's lines are registered, kinds.ts registerHurtLines). */
export const DEATH_TEXT_MAX = 28;
const warnedLong = new Set<string>();

/** Frames between letters dropping in; each one's drop; when the bleeding starts (after its letter's landed). */
const GAP = 2, DROP = 10, BLEED_AFTER = 8;
/** The blood, in steps: its darkest edge up to the wet glint. */
const BLOOD = ['#2A0404', '#5A0A0A', '#8B1010', '#B91C1C', '#DC2626', '#F87171'];

interface Run { x: number; y: number; w: number; max: number; speed: number; start: number; len: number; dropEvery: number; nextDrop: number }
interface Drop { x: number; y: number; vy: number; r: number }
interface Glyph { ch: string; x: number; y: number; w: number; i: number }
interface Shown { text: string; at: number; last: number; size: number; glyphs: Glyph[]; runs: Run[]; drops: Drop[] }
let shown: Shown | null = null;

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/**
 * One run of it, gooey: a smear spread wide along the letter's foot where it comes out, thick at the top and thinning
 * as it goes, its sides wobbling like it can't decide, swelling again into the bead hanging off the end (a teardrop
 * that stretches as it fills). Shaded in steps: a dark edge, the red, a lighter core off to one side, a wet glint.
 */
export const goo = (ctx: Ctx, cx: number, top: number, L: number, w: number, br: number, hang: number, seed: number, t: number) => {
  const end = top + L, bead = end + br * hang * 0.5;
  /** The half width down it (y from the top). */
  const half = (y: number) => {
    const k = y / Math.max(1, L);
    const lip = w * 1.5 * Math.exp(-y / 3);
    const body = (w / 2) * (1.35 - 0.55 * k) + Math.sin(y * 0.45 + seed) * 0.45 + Math.sin(y * 0.17 + seed * 2 + t * 0.03) * 0.35;
    // (the neck into the bead: pulled thin as it hangs)
    const neck = y > L - br * 2 ? (w / 2) * (1 - hang * 0.45) : Infinity;
    return Math.max(0.6, Math.min(body, neck) + lip);
  };
  const outline = (grow: number, shift: number, scale: number) => {
    ctx.beginPath();
    const pts: [number, number][] = [];
    for (let y = 0; y <= L; y += 2) pts.push([cx + shift - (half(y) * scale + grow), top + y]);
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (const [x, y] of pts) ctx.lineTo(x, y);
    // (round the bead)
    const r = br * scale + grow;
    ctx.arc(cx + shift, bead, r, Math.PI, 0, true);
    for (let y = L; y >= 0; y -= 2) ctx.lineTo(cx + shift + half(y) * scale + grow, top + y);
    ctx.closePath();
    ctx.fill();
  };
  ctx.fillStyle = BLOOD[0]; outline(1, 0, 1);
  ctx.fillStyle = BLOOD[2]; outline(0, 0, 1);
  ctx.fillStyle = BLOOD[3]; outline(0, -0.4, 0.55);
  // (the wet glint: down the core, and on the bead)
  ctx.fillStyle = BLOOD[5];
  for (let y = 2; y < L - 2; y += 1) if (Math.sin(y * 0.3 + seed) > 0.2) ctx.fillRect(Math.round(cx - half(y) * 0.35), Math.round(top + y), 1, 1);
  ctx.fillRect(Math.round(cx - br * 0.45), Math.round(bead - br * 0.4), 1, 2);
};

/** The lines and the size, as Meathead 1 fits them (one line shrunk to fit; too small, wrapped). */
const layout = (ctx: Ctx, text: string) => {
  const maxW = CANVAS_WIDTH - 80;
  let size = 48;
  ctx.font = `bold ${size}px ${FONT}`;
  const w = ctx.measureText(text).width;
  if (w > maxW) size = Math.floor(size * (maxW / w));
  if (size >= 22) return { lines: [text], size };
  const lines: string[] = [];
  let cur = '';
  ctx.font = `bold 30px ${FONT}`;
  for (const word of text.split(' ')) {
    const t = cur ? `${cur} ${word}` : word;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = word; } else cur = t;
  }
  if (cur) lines.push(cur);
  size = 30;
  for (const l of lines) { ctx.font = `bold ${size}px ${FONT}`; const lw = ctx.measureText(l).width; if (lw > maxW) size = Math.floor(size * (maxW / lw)); }
  return { lines, size: Math.max(16, size) };
};

/** Where a letter's strokes come down to their feet: columns (off its left) whose lowest ink is down near the bottom of
 *  the letter's ink, and how far that is below its middle. Read off the letter drawn for real. */
const feetCache = new Map<string, { dx: number; dy: number }[]>();
const feetOf = (ch: string, size: number) => {
  const key = `${ch}|${size}`;
  const had = feetCache.get(key);
  if (had) return had;
  const cv = document.createElement('canvas'), W = Math.ceil(size * 1.4) + 4, H = size * 2;
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d')!;
  g.font = `bold ${size}px ${FONT}`; g.textBaseline = 'middle'; g.fillStyle = '#FFF';
  g.fillText(ch, 2, size);
  const px = g.getImageData(0, 0, W, H).data;
  const low: number[] = [];
  let lowest = -1;
  for (let x = 0; x < W; x++) {
    let b = -1;
    for (let y = H - 1; y >= 0; y--) if (px[(y * W + x) * 4 + 3] > 128) { b = y; break; }
    low.push(b);
    lowest = Math.max(lowest, b);
  }
  const out: { dx: number; dy: number }[] = [];
  // (a stroke's foot: inked, at or near the very bottom, and not right at a stroke's edge (a run off a corner looks stuck on))
  for (let x = 1; x < W - 1; x++) {
    if (low[x] < 0 || lowest - low[x] > Math.max(2, size * 0.12)) continue;
    if (low[x - 1] < low[x] - 2 || low[x + 1] < low[x] - 2) continue;
    out.push({ dx: x - 2, dy: low[x] - size });
  }
  feetCache.set(key, out);
  return out;
};
/** The letters' feet at the usual size, read ahead one letter per idle moment once the font's in (the first death
 *  read them all off the letters the moment it came up: a stall as he died). */
export const prewarmDeathText = () => {
  if (typeof document === 'undefined') return;
  const go = () => idleTasks([...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?.,-'].map(ch => () => { feetOf(ch, 30); }));
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (fonts) fonts.load(`bold 30px ${FONT}`).then(go, () => {}); else go();
};

const begin = (ctx: Ctx, text: string, frame: number): Shown => {
  const { lines, size } = layout(ctx, text);
  ctx.font = `bold ${size}px ${FONT}`;
  const lh = size * 1.6, y0 = CANVAS_HEIGHT / 2 - ((lines.length - 1) * lh) / 2 - size * 0.25;
  const glyphs: Glyph[] = [], runs: Run[] = [];
  let i = 0;
  lines.forEach((line, li) => {
    const lw = ctx.measureText(line).width;
    let x = CANVAS_WIDTH / 2 - lw / 2;
    const base = y0 + li * lh + size / 2;
    for (const ch of line) {
      const cw = ctx.measureText(ch).width;
      if (ch !== ' ') {
        glyphs.push({ ch, x, y: base, w: cw, i });
        // (a run or two off the bottom of most letters, some long, most short; the last line's run furthest. Only ever
        // off the letter's own ink: from the foot of a stroke, where it actually is, never out of a gap between legs)
        const feet = feetOf(ch, size);
        const n = !feet.length || hash(i * 3.3) < 0.25 ? 0 : hash(i * 7.1) < 0.35 ? 2 : 1;
        for (let k = 0; k < n; k++) {
          const s = i * 11 + k * 5;
          const long = li === lines.length - 1 ? 1.6 : 0.8;
          const foot = feet[Math.floor(hash(s) * feet.length)];
          runs.push({
            x: Math.round(x + foot.dx - 1), y: Math.round(base + foot.dy - 2), w: hash(s + 1) < 0.4 ? 3 : 2,
            max: (8 + hash(s + 2) * size * 1.4) * long, speed: 0.35 + hash(s + 3) * 0.5,
            start: i * GAP + DROP + BLEED_AFTER + Math.floor(hash(s + 4) * 50), len: 0,
            dropEvery: 60 + Math.floor(hash(s + 5) * 120), nextDrop: 0,
          });
        }
      }
      x += cw; i++;
    }
  });
  return { text, at: frame, last: frame, size, glyphs, runs, drops: [] };
};

export const drawM2DeathMessage = (ctx: Ctx, state: GameState, text: string) => {
  const frame = state.frame;
  // (dev only: over the house rule's length, said once per text, whatever it came from)
  if (import.meta.env.DEV && text.length > DEATH_TEXT_MAX && !warnedLong.has(text)) {
    warnedLong.add(text);
    console.warn(`[death text] "${text}" is ${text.length} characters (max ${DEATH_TEXT_MAX})`);
  }
  // (a new death, or the clock gone back (a new stage): from the top)
  if (!shown || shown.text !== text || frame < shown.last || frame - shown.last > 30) shown = begin(ctx, text, frame);
  const S = shown;
  const t = frame - S.at, step = frame !== S.last;
  S.last = frame;
  const size = S.size;
  ctx.save();
  ctx.font = `bold ${size}px ${FONT}`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';

  // The runs, under the letters (they come out from under them)
  for (const r of S.runs) {
    if (t < r.start) continue;
    if (step && r.len < r.max) r.len = Math.min(r.max, r.len + r.speed * (1 - (r.len / r.max) * 0.85));
    const L = Math.round(r.len);
    if (L <= 0) continue;
    // (the bead on the end, swelling as it goes; hanging there, it fills and stretches till it lets go)
    const hang = r.len >= r.max ? ((t - r.start) % r.dropEvery) / r.dropEvery : 0;
    const br = r.w * 0.55 + 1.3 * Math.min(1, r.len / 10) + hang * 1.6;
    goo(ctx, r.x + r.w / 2, r.y, L, r.w, br, hang, r.x * 0.37 + r.y, t);
    if (step && r.len >= r.max && (t - r.start) % r.dropEvery === r.dropEvery - 1) S.drops.push({ x: r.x + r.w / 2, y: r.y + L + br * (1 + hang * 0.5), vy: 1, r: Math.max(1.5, br) });
  }
  // The drops, falling the rest of the way down the screen
  if (step) for (const d of S.drops) { d.vy = Math.min(9, d.vy + 0.35); d.y += d.vy; }
  S.drops = S.drops.filter(d => d.y < CANVAS_HEIGHT + 10);
  for (const d of S.drops) {
    // (a teardrop, drawn out longer the faster it falls)
    const tail = d.r * (1.6 + Math.min(2.5, d.vy * 0.35));
    const tear = (r: number, tl: number) => {
      ctx.beginPath();
      ctx.moveTo(d.x, d.y - tl);
      ctx.bezierCurveTo(d.x + r * 0.35, d.y - tl * 0.45, d.x + r, d.y - r * 0.4, d.x + r, d.y);
      ctx.arc(d.x, d.y, r, 0, Math.PI);
      ctx.bezierCurveTo(d.x - r, d.y - r * 0.4, d.x - r * 0.35, d.y - tl * 0.45, d.x, d.y - tl);
      ctx.fill();
    };
    ctx.fillStyle = BLOOD[0]; tear(d.r + 1, tail + 1.5);
    ctx.fillStyle = BLOOD[2]; tear(d.r, tail);
    ctx.fillStyle = BLOOD[3]; ctx.beginPath(); ctx.ellipse(d.x - d.r * 0.2, d.y + d.r * 0.1, d.r * 0.6, d.r * 0.7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = BLOOD[5]; ctx.fillRect(Math.round(d.x - d.r * 0.5), Math.round(d.y - d.r * 0.4), 1, 2);
  }

  // The letters: each drops in and lands with a squash; then a shudder through one now and then
  const throb = 0.5 + 0.5 * Math.sin(t * 0.06);
  for (const g of S.glyphs) {
    const lt = t - g.i * GAP;
    if (lt < 0) continue;
    let dy = 0, sx = 1, sy = 1;
    if (lt < DROP) { const k = lt / DROP; dy = -(1 - k) * (1 - k) * size * 1.6; sy = 1.15; sx = 0.9; }
    else if (lt < DROP + 6) { const k = (lt - DROP) / 6; sy = 0.75 + 0.25 * k; sx = 1.18 - 0.18 * k; }
    // (the shudder: a letter at a time, a pixel or two, a few frames)
    const shake = (Math.floor(t / 4) + g.i * 13) % 97 < 3 ? (hash(t + g.i) - 0.5) * 3 : 0;
    const cx = g.x + g.w / 2 + shake, cy = g.y + dy;
    ctx.save();
    ctx.translate(Math.round(cx), Math.round(cy + size / 2));
    ctx.scale(sx, sy);
    ctx.translate(0, -size / 2);
    // (the edge: black, thick, a drop shadow under it)
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000'; ctx.lineWidth = Math.max(4, Math.round(size / 5));
    ctx.strokeText(g.ch, -g.w / 2 + 2, 3);
    ctx.strokeStyle = BLOOD[0]; ctx.lineWidth = Math.max(3, Math.round(size / 6));
    ctx.strokeText(g.ch, -g.w / 2, 0);
    // (the red in bands, light at the top down to dark, a hot glint along the top that throbs)
    const grad = ctx.createLinearGradient(0, -size / 2, 0, size / 2);
    const hi = throb > 0.5 ? BLOOD[5] : BLOOD[4];
    grad.addColorStop(0, hi); grad.addColorStop(0.16, hi);
    grad.addColorStop(0.16, BLOOD[4]); grad.addColorStop(0.42, BLOOD[4]);
    grad.addColorStop(0.42, BLOOD[3]); grad.addColorStop(0.7, BLOOD[3]);
    grad.addColorStop(0.7, BLOOD[2]); grad.addColorStop(1, BLOOD[2]);
    ctx.fillStyle = grad;
    ctx.fillText(g.ch, -g.w / 2, 0);
    ctx.restore();
  }
  ctx.restore();
};
