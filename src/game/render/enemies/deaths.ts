// Draws the special kill animations (see game/enemies/deaths.ts).

import { drawComposited } from '../composite';
import { drawDummy } from '../dummies';
import { drawFlameLicks } from '../fx/fireball';
import { eye } from '../npc/kit';
import { pixelBlob } from '../pixelArt';
import type { Enemy } from '../../../types';
import { GameState } from '../../core/state';
import { EnemyDeath, DEATH_FRAMES, vaporK, VAPOR_HOLD, VAPOR_GO } from '../../enemies/deaths';
import { drawKindCorpse, kindHead, isHumanoidKind, isLyingKind, KIND_HEAD, skeletonOf } from './index';
import { drawBloodPool } from '../spatter';
import { drawCrewman } from './tommy';
import { drawGunDeath, drawEjected } from './gunDeaths';

type Ctx = CanvasRenderingContext2D;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Mix two #rrggbb colours. */
const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * clamp01(t))).join(',')})`;
};

/** Fade out over the last `n` frames. */
const fadeOut = (d: EnemyDeath, n: number) => clamp01((DEATH_FRAMES[d.kind] - d.t) / n);

export const drawEnemyDeaths = (ctx: Ctx, state: GameState) => {
  for (const d of state.enemyDeaths) {
    ctx.save();
    switch (d.kind) {
      case 'charred': drawCharred(ctx, d, state.frame, state); break;
      case 'fried': drawFried(ctx, d, state.frame, state); break;
      case 'melted': drawMelted(ctx, d, state.frame, state); break;
      case 'greased': drawGreased(ctx, d, state.frame, state); break;
      case 'pancaked': drawPancaked(ctx, d, state); break;
      case 'ceilinged': {
        // The pancake, upside down on the underside of the ceiling (its feet line is the ceiling), strands hanging off it
        const ceil = d.y + d.h;
        ctx.save(); ctx.translate(0, 2 * ceil); ctx.scale(1, -1); drawPancaked(ctx, d, state); ctx.restore();
        ctx.globalAlpha = fadeOut(d, 30);
        ctx.strokeStyle = '#7F1D1D'; ctx.lineWidth = 2; ctx.beginPath();
        for (let k = 0; k < 3; k++) { const sx = d.x + d.w / 2 + (k - 1) * d.w * 0.5, len = 6 + ((d.t * (0.3 + k * 0.17)) % 14); ctx.moveTo(sx, ceil + 4); ctx.lineTo(sx, ceil + 4 + len); }
        ctx.stroke();
        break;
      }
      case 'headshot': drawHeadshot(ctx, d, state); break;
      case 'vaporized': drawVaporized(ctx, d, state.frame, state); break;
      case 'plugged': case 'gunned': drawGunDeath(ctx, d, state, drawBody); break;
      case 'ejected': drawEjected(ctx, d, state, drawBody); break;
    }
    ctx.restore();
  }
};

/**
 * What died, drawn as itself: a themed enemy's own sprite (squashed, tinted or
 * clipped as the animation wants), anything else as its coloured block.
 * Scaling is about the middle of its feet.
 */
export type BodyOpts = { filter?: string; sx?: number; sy?: number; clipFromY?: number; run?: number; phase?: number };
const drawBody = (ctx: Ctx, d: EnemyDeath, state: GameState, o: BodyOpts = {}) => {
  const { x, y, w, h } = d;
  ctx.save();
  if (o.clipFromY !== undefined) { ctx.beginPath(); ctx.rect(x - w, o.clipFromY, w * 3, y + h - o.clipFromY + 4); ctx.clip(); }
  const fx = x + w / 2, fy = y + h;
  ctx.translate(fx, fy); ctx.scale(o.sx ?? 1, o.sy ?? 1); ctx.translate(-fx, -fy);
  const body = (c: Ctx) => {
    if (d.dummy) drawDummy(c, { id: `dummy-${d.dummy}`, pos: { x, y }, width: w, height: h, vel: { x: d.sprite?.facing ?? 1, y: 0 } } as Enemy, 0);
    else if (d.crew) drawCrewman(c, x + w / 2, y + h, d.crew.facing, d.crew.shirt);
    else if (d.sprite) drawKindCorpse(c, d.sprite.kind, x, y, w, h, d.sprite.facing, o.phase ?? d.sprite.phase, state, d.sprite.variant, o.run ?? 0, d.sprite.seed);
    else { c.fillStyle = d.color; c.fillRect(x, y, w, h); }
  };
  // (under a filter: drawn plain and put down filtered once, not filtered shape by shape)
  if (o.filter) { ctx.filter = o.filter; drawComposited(ctx, { x: x - w - 40, y: y - h - 60, w: w * 3 + 80, h: h * 2 + 100 }, body); }
  else body(ctx);
  ctx.restore();
};

/** Where its head is (from the middle of its feet): a themed enemy's own; the practice dummies' as they're drawn (the
 * boxer's up top of his tall frame, the balloon man's just over his little box: he's shorter than anybody). */
/** Lying down already when it died (the sunbather): it doesn't keel over, and its head's off the end of it. */
const lying = (d: EnemyDeath) => !d.dummy && !!d.sprite && isLyingKind(d.sprite.kind, d.sprite.variant);

const headOf = (d: EnemyDeath) => d.dummy === 'air' ? { x: 0, y: -(d.h + 3), r: 7 } : d.dummy === 'ground' ? { x: 3, y: -66, r: 9 } : kindHead(d.sprite!.kind, d.sprite!.variant);

/** Where its eyes are (world coords): on a themed enemy's head, else near the top of the block. */
const eyesAt = (d: EnemyDeath, dy = 0) => {
  if (!d.sprite) return { x1: d.x + d.w * 0.3 - 3, x2: d.x + d.w * 0.62 - 2, y: d.y + Math.min(d.h * 0.3, 18) + dy };
  const head = headOf(d), cx = d.x + d.w / 2 + head.x * d.sprite.facing;
  return { x1: cx - 6, x2: cx + 2, y: d.y + d.h + head.y - 2 + dy };
};

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** A seed for the one that died, so its cracks and drips stay put from frame to frame. */
const seedOf = (d: EnemyDeath) => Math.round(d.w * 13 + d.h * 7 + (d.sprite?.kind.length ?? 0) * 31 + (d.sprite?.phase ?? 0) * 3);

let maskBuf: HTMLCanvasElement | null = null;
/** (painted at twice size, so it holds up when the camera's in close) */
const MS = 2;

/**
 * The body, with `over` painted onto it and only onto it (cracks, a coat of goo, a sheen): the body goes into its own
 * canvas first, `over` on top of that clipped to what's there, then the lot comes back down here. `over` draws in world
 * coordinates, same as everything else.
 */
const drawBodyMasked = (ctx: Ctx, d: EnemyDeath, state: GameState, o: Parameters<typeof drawBody>[3], over: (g: Ctx) => void) => {
  if (typeof document === 'undefined') { drawBody(ctx, d, state, o); return; }
  const pad = Math.max(d.w, d.h) * 0.8 + 16;
  const x0 = Math.floor(d.x - pad), y0 = Math.floor(d.y - pad);
  const bw = Math.ceil(d.w + pad * 2), bh = Math.ceil(d.h + pad + 10);
  const cw = bw * MS, ch = bh * MS;
  if (!maskBuf) maskBuf = document.createElement('canvas');
  if (maskBuf.width < cw) maskBuf.width = cw;
  if (maskBuf.height < ch) maskBuf.height = ch;
  const g = maskBuf.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, Math.min(maskBuf.width, cw + 4), Math.min(maskBuf.height, ch + 4));
  g.setTransform(MS, 0, 0, MS, -x0 * MS, -y0 * MS);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.filter = 'none';
  drawBody(g, d, state, o);
  g.globalCompositeOperation = 'source-atop';
  g.save(); over(g); g.restore();
  g.globalCompositeOperation = 'source-over';
  g.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(maskBuf, 0, 0, cw, ch, x0, y0, bw, bh);
};

/** (vaporized) The cell size it goes in (chunky: SNES pixels), and how ragged the edge it's going along is. */
const VCELL = 3, VRAG = 9;

/**
 * Vaporized by the alien's beam: held a moment lit up in its pink (flickering white), then gone a cell at a time
 * from the side the beam came in, a white-hot edge running across it; the bits blow off as particles (game side).
 * Left: a scorch mark and a little heap of ash in grey bands, his shoes (charred, smoking) and his sunglasses on top.
 * Killed in the air, what's left of him (the shoes) drops to the floor. The body's drawn once into the mask and eaten
 * away there, not drawn bit by bit.
 */
const drawVaporized = (ctx: Ctx, d: EnemyDeath, frame: number, state: GameState) => {
  const { x, y, w, h, t } = d;
  const k = vaporK(t), dir = d.vx < 0 ? -1 : 1;
  const seed = seedOf(d), cx = x + w / 2, floor = d.floorY;
  const gone = t > VAPOR_HOLD + VAPOR_GO;
  // (dropping, what's left of one done in mid-air)
  const air = floor - (y + h);
  const fall = air > 2 && gone ? Math.min(air, 0.5 * 0.8 * (t - VAPOR_HOLD - VAPOR_GO) ** 2) : 0;
  const end = fadeOut(d, 18);
  // (going at the end: stepped, never a smooth fade)
  ctx.globalAlpha = end >= 1 ? 1 : end > 0.5 ? 0.66 : 0.33;
  // The scorch mark and the heap of ash, as he goes (on the floor under him, however high he was)
  const pile = clamp01(k * 1.3);
  if (pile > 0 && (air <= 2 || fall >= air)) {
    ctx.fillStyle = 'rgba(28, 25, 23, 0.5)'; ctx.beginPath(); ctx.ellipse(Math.round(cx), floor - 1, Math.round(w * 0.75), 4, 0, 0, Math.PI * 2); ctx.fill();
    const ph = Math.round(9 * pile), pw = Math.round(w * 0.85);
    const bands = ['#44403C', '#57534E', '#78716C', '#A8A29E'];
    bands.forEach((c, i) => {
      const bh = ph * (1 - i / bands.length), bw = pw * (1 - i * 0.18);
      if (bh < 1) return;
      ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(Math.round(cx), floor - 1, Math.round(bw / 2), Math.round(bh), 0, Math.PI, 0); ctx.fill();
    });
    // (cinders winking in it)
    for (let i = 0; i < 4; i++) if ((frame + i * 5) % 16 < 8) { ctx.fillStyle = i % 2 ? '#F97316' : '#FF8CE4'; ctx.fillRect(Math.round(cx - pw * 0.35 + hash(seed + i) * pw * 0.7), floor - 2 - Math.round(hash(seed + i * 3) * ph * 0.6), 1, 1); }
  }
  // The body, being eaten away (the shoes kept: the bottom of it, charred)
  {
    const shoesFrom = y + h + 2;
    const flick = t < VAPOR_HOLD ? (frame % 2 ? 0.75 : 0.5) : 0.35;
    ctx.save();
    if (fall) ctx.translate(0, fall);
    drawBodyMasked(ctx, d, state, {}, g => {
      // (lit up in the beam: its green over all of it, flickering white while it's held)
      g.fillStyle = t < VAPOR_HOLD && frame % 3 === 0 ? `rgba(255, 255, 255, ${flick})` : `rgba(255, 140, 228, ${flick})`;
      g.fillRect(x - w, y - h, w * 3, h * 3);
      if (k <= 0) return;
      // Eaten away: every cell the ragged edge has passed goes; the cells just ahead of it white-hot
      const x0 = x - 12, x1 = x + w + 12;
      const hot: [number, number][] = [];
      g.globalCompositeOperation = 'destination-out';
      g.fillStyle = '#000';
      for (let cy = y - 24; cy < shoesFrom; cy += VCELL) {
        for (let cxx = x0; cxx < x1; cxx += VCELL) {
          const along = dir > 0 ? cxx - x0 : x1 - cxx;
          const edge = (x1 - x0) * k + (hash(seed + cxx * 0.37 + cy * 1.31) - 0.5) * VRAG;
          if (along < edge) g.fillRect(cxx, cy, VCELL, VCELL);
          else if (along < edge + VCELL * 2) hot.push([cxx, cy]);
        }
      }
      g.globalCompositeOperation = 'source-atop';
      for (const [hx, hy] of hot) { g.fillStyle = (hx + hy) % 2 ? '#FFFFFF' : '#FFD8F6'; g.fillRect(hx, hy, VCELL, VCELL); }
    });
    ctx.restore();
  }
  // His shoes, left standing where he stood (charred, a lit edge, a glint), and his sunglasses dropped on the heap
  if (k > 0.6) {
    const f1 = d.sprite?.facing ?? 1, sy = Math.round(y + h + fall) - 4;
    for (const off of [-7, 5]) {
      const sx = Math.round(cx + off * f1 - (f1 < 0 ? 9 : 0));
      ctx.fillStyle = '#0C0A09'; ctx.fillRect(sx, sy, 9, 4); ctx.fillRect(sx + (f1 > 0 ? 6 : 0), sy + 1, 3, 3);
      ctx.fillStyle = '#57534E'; ctx.fillRect(sx + 1, sy, 6, 1);
      ctx.fillStyle = '#F97316'; if ((frame + off) % 12 < 6) ctx.fillRect(sx + 2, sy + 1, 1, 1);
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(sx + (f1 > 0 ? 7 : 1), sy, 1, 1);
    }
  }
  if (k > 0.55 && (air <= 2 || fall >= air)) {
    const gx = Math.round(cx - (d.sprite?.facing ?? 1) * 14 - 7), gy = floor - Math.round(5 * pile) - 3;
    ctx.fillStyle = '#0A0A0A'; ctx.fillRect(gx, gy, 6, 4); ctx.fillRect(gx + 8, gy, 6, 4); ctx.fillRect(gx + 5, gy, 4, 1);
    ctx.fillStyle = '#44403C'; ctx.fillRect(gx, gy, 6, 1); ctx.fillRect(gx + 8, gy, 6, 1);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(gx + 1, gy + 1, 1, 1); ctx.fillRect(gx + 9, gy + 1, 1, 1);
  }
  ctx.globalAlpha = 1;
};

/**
 * A crack wandering across the body from one side to the other in short jags (and a fork off it now and then); the
 * points, for stroking more than once.
 */
const crackPath = (ctx: Ctx, x: number, w: number, cy: number, seed: number, len = 1) => {
  const steps = Math.max(3, Math.round((w * len) / 5));
  let px = x + w * hash(seed) * 0.2, py = cy;
  ctx.moveTo(px, py);
  for (let k = 0; k < steps; k++) {
    px += 4 + hash(seed + k * 3.1) * 3;
    py += (hash(seed + k * 7.7) - 0.5) * 7;
    ctx.lineTo(px, py);
    if (hash(seed + k * 11.3) > 0.78) {
      // (a fork, off downward or up)
      const dir = hash(seed + k * 5.9) > 0.5 ? 1 : -1;
      ctx.lineTo(px + 3, py + dir * 5); ctx.lineTo(px + 5, py + dir * 9); ctx.moveTo(px, py);
    }
  }
};

/** Burns black in the flames, blinks its eyes once (classic cartoon), then crumbles to ash. */
const drawCharred = (ctx: Ctx, d: EnemyDeath, frame: number, state: GameState) => {
  const { x, y, w, h, t } = d;
  const seed = seedOf(d);
  const crumble = clamp01((t - 55) / 25);
  const standingH = h * (1 - crumble);
  const top = y + h - standingH;
  if (standingH > 1) {
    const burnt = clamp01(t / 18);
    if (d.sprite) {
      // Its own drawing gone to charcoal, the cracks in it glowing (only over it, wherever its outline goes), embers
      // winking in the black, and hot along the line where it's coming apart
      const pulse = 0.55 + 0.35 * Math.sin(frame * 0.4 + seed);
      drawBodyMasked(ctx, d, state, { filter: `brightness(${1 - burnt * 0.78}) saturate(${1 - burnt * 0.9}) sepia(${burnt * 0.3}) contrast(${1 + burnt * 0.4})`, clipFromY: top }, g => {
        // (soot creeping up from the feet as the colour goes)
        if (burnt < 1) { g.fillStyle = `rgba(28, 25, 23, ${(0.6 * burnt).toFixed(3)})`; g.fillRect(x - w, y + h - h * burnt * 1.4, w * 3, h * 2); }
        if (t > 12) {
          // (short ones, scattered over it, more of them the bigger it is, opening up as it cooks)
          const n = Math.max(3, Math.round(w * h / 420)), grown = clamp01((t - 12) / 16);
          g.beginPath();
          for (let i = 0; i < n; i++) crackPath(g, x + (hash(seed + i * 2.7) - 0.25) * w, w * 0.45, y + (0.08 + hash(seed + i * 1.3) * 0.84) * h, seed + i * 17, grown);
          g.lineJoin = 'miter'; g.lineCap = 'square';
          g.strokeStyle = 'rgba(127, 29, 29, 0.8)'; g.lineWidth = 2.2; g.stroke();
          g.strokeStyle = `rgba(249, 115, 22, ${pulse.toFixed(3)})`; g.lineWidth = 1; g.stroke();
          g.strokeStyle = `rgba(254, 240, 138, ${(pulse * 0.7).toFixed(3)})`; g.lineWidth = 0.4; g.stroke();
          // (embers)
          for (let k = 0; k < 6; k++) if ((frame + k * 7) % 18 < 9) { g.fillStyle = k % 2 ? '#F97316' : '#FDE047'; g.fillRect(x + hash(seed + k * 2.3) * w, y + hash(seed + k * 4.1) * h, 1.5, 1.5); }
        }
        if (crumble > 0) {
          // (white hot where it's giving way)
          g.fillStyle = 'rgba(234, 88, 12, 0.85)'; g.fillRect(x - w, top, w * 3, 2);
          g.fillStyle = 'rgba(249, 115, 22, 0.5)'; g.fillRect(x - w, top + 2, w * 3, 3);
          g.fillStyle = 'rgba(253, 224, 71, 0.9)'; g.fillRect(x - w, top, w * 3, 1);
        }
      });
    } else {
      ctx.fillStyle = mix(d.color, '#1C1917', burnt); ctx.fillRect(x, top, w, standingH);
      if (t > 12) { ctx.save(); ctx.beginPath(); ctx.rect(x, top, w, standingH); ctx.clip(); ctx.beginPath(); for (let i = 0; i < 3; i++) crackPath(ctx, x, w, top + (i + 0.5) * standingH / 3, seed + i * 17); ctx.strokeStyle = '#F97316'; ctx.lineWidth = 1.4; ctx.stroke(); ctx.restore(); }
    }
    // Two white eyes in the soot, looking about, blinking once
    if (t > 22 && t < 55) {
      const e = eyesAt(d), f1 = d.sprite?.facing ?? 1;
      if (t > 36 && t < 40) {
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(e.x1, e.y + 2, 5, 1.4); ctx.fillRect(e.x2, e.y + 2, 5, 1.4);
      } else {
        const look = t < 44 ? f1 * 0.4 : -f1 * 0.5;
        eye(ctx, e.x1 + 2.5, e.y + 2.5, 2.6, look, t > 46 ? 0.5 : 0);
        eye(ctx, e.x2 + 2.5, e.y + 2.5, 2.6, look, t > 46 ? 0.5 : 0);
      }
    }
  }
  // Flames licking up while it burns
  if (t < 24) {
    // (up off the whole of it, dying down as it goes black)
    drawFlameLicks(ctx, x + w / 2, y + h * 0.7, w + 4, h * 0.75 + 12, frame, { seed: Math.floor(x), k: Math.min(1, (24 - t) / 8) });
  }
  // What's crumbling off it, and the heap of ash it ends as: grey in steps, cinders glowing in it, the odd flake still
  // coming down
  if (crumble > 0) {
    ctx.globalAlpha = fadeOut(d, 20);
    if (crumble < 1) for (let k = 0; k < 5; k++) {
      const q = ((t * 1.3 + k * 9) % 14) / 14;
      ctx.fillStyle = k % 2 ? '#44403C' : '#78716C'; ctx.fillRect(x + hash(seed + k) * w, top + q * (y + h - top), 2, 2);
    }
    const cx = x + w / 2, fy = y + h, rw = w * 0.6 * crumble + 4, rh = 10 * crumble + 2;
    ctx.save(); ctx.beginPath(); ctx.rect(cx - rw - 8, fy - rh - 8, rw * 2 + 16, rh + 8); ctx.clip();
    pixelBlob(ctx, cx, fy, rw, rh, '#292524');
    pixelBlob(ctx, cx - rw * 0.08, fy, rw * 0.8, rh * 0.82, '#44403C');
    pixelBlob(ctx, cx - rw * 0.18, fy, rw * 0.5, rh * 0.6, '#57534E');
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(Math.round(cx - rw * 0.3), Math.round(fy - rh * 0.55), 4, 2); ctx.fillRect(Math.round(cx - rw * 0.1), Math.round(fy - rh * 0.62), 2, 2);
    for (let k = 0; k < 4; k++) if ((frame + k * 5) % 14 < 8) {
      const ex = Math.round(cx + (hash(seed + k * 3) - 0.5) * rw * 1.2), ey = Math.round(fy - 2 - hash(seed + k * 5) * rh * 0.5);
      ctx.fillStyle = 'rgba(234, 88, 12, 0.45)'; ctx.fillRect(ex - 1, ey - 1, 4, 4);
      ctx.fillStyle = k % 2 ? '#F97316' : '#FDE047'; ctx.fillRect(ex, ey, 2, 2);
    }
    ctx.restore();
  }
};

/** A jagged bolt from (x0, y0) to (x1, y1), kicked about at every joint. */
const boltPath = (ctx: Ctx, x0: number, y0: number, x1: number, y1: number, seed: number, jag: number, branch = true) => {
  const n = 6, dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
  ctx.moveTo(x0, y0);
  for (let k = 1; k <= n; k++) {
    const u = k / n, off = k === n ? 0 : (hash(seed + k * 3.7) - 0.5) * 2 * jag;
    const px = x0 + dx * u + nx * off, py = y0 + dy * u + ny * off;
    ctx.lineTo(px, py);
    if (branch && k === 3) { boltPath(ctx, px, py, px + nx * jag * 2.2 + dx * 0.2, py + ny * jag * 2.2 + dy * 0.2, seed + 9, jag * 0.6, false); ctx.moveTo(px, py); }
  }
};

/** Electricity crawling over it: bolts top to bottom (a fork off each), a cyan glow round a white-hot core, sparks. */
const drawArcs = (ctx: Ctx, d: EnemyDeath, frame: number) => {
  const { x, y, w, h } = d;
  const s = Math.floor(frame / 2) * 13 + seedOf(d);
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 2; i++) {
    const x0 = x + hash(s + i * 5) * w, x1 = x + hash(s + i * 5 + 2) * w;
    boltPath(ctx, x0, y - 2 + hash(s + i) * h * 0.2, x1, y + h - hash(s + i + 1) * h * 0.2, s + i * 31, Math.max(4, w * 0.18));
  }
  ctx.lineJoin = 'miter'; ctx.lineCap = 'square';
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)'; ctx.lineWidth = 3.4; ctx.stroke();
  ctx.strokeStyle = 'rgba(165, 243, 252, 0.9)'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 0.7; ctx.stroke();
  for (let k = 0; k < 5; k++) {
    const sx = x - 6 + hash(s + k * 1.7) * (w + 12), sy = y + hash(s + k * 2.9) * h;
    ctx.fillStyle = k % 2 ? '#FFFFFF' : '#67E8F9'; ctx.fillRect(Math.round(sx), Math.round(sy), 2, 2);
    if (k % 2) { ctx.fillRect(Math.round(sx) - 2, Math.round(sy), 1, 2); ctx.fillRect(Math.round(sx) + 3, Math.round(sy), 1, 2); }
  }
  ctx.restore();
};

/** Electrocuted: flashing between its body and an X-ray skeleton, then a smoking heap. */
const drawFried = (ctx: Ctx, d: EnemyDeath, frame: number, state: GameState) => {
  const { x, y, w, h, t } = d;
  if (t < 40) {
    ctx.translate((frame % 2 ? 2 : -2), (frame % 3 ? 1 : -1));
    const xray = frame % 6 < 3;
    if (d.sprite) {
      if (xray) {
        // (it goes see-through: a dark blue ghost of itself, scanlines, the bones lit up inside)
        drawBodyMasked(ctx, d, state, { filter: 'brightness(0.4) sepia(1) hue-rotate(160deg) saturate(4)' }, g => {
          g.fillStyle = 'rgba(8, 47, 73, 0.45)'; g.fillRect(x - w, y - h, w * 3, h * 2.2);
          g.fillStyle = 'rgba(103, 232, 249, 0.18)'; for (let sy = Math.floor(y - h); sy < y + h; sy += 3) g.fillRect(x - w, sy, w * 3, 1);
        });
        drawKindSkeleton(ctx, d, frame);
      } else drawBody(ctx, d, state, { filter: 'brightness(1.35) contrast(1.15)' });
    } else {
      ctx.fillStyle = xray ? '#0E7490' : d.color;
      ctx.fillRect(x, y, w, h);
    }
    if (xray && !d.sprite) {
      ctx.strokeStyle = '#ECFEFF';
      ctx.fillStyle = '#ECFEFF';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      const cx = x + w / 2;
      const skullR = Math.min(w, h) * 0.2;
      const top = y + skullR + 3;
      ctx.beginPath(); ctx.arc(cx, top, skullR, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#164E63';
      ctx.fillRect(cx - skullR * 0.6, top - skullR * 0.2, skullR * 0.45, skullR * 0.45);
      ctx.fillRect(cx + skullR * 0.15, top - skullR * 0.2, skullR * 0.45, skullR * 0.45);
      const spineTop = top + skullR, hip = y + h * 0.68;
      ctx.beginPath();
      ctx.moveTo(cx, spineTop); ctx.lineTo(cx, hip);
      for (let i = 0; i < 3; i++) { const ry = spineTop + 5 + i * (hip - spineTop - 6) / 3; ctx.moveTo(cx - w * 0.28, ry + 2); ctx.quadraticCurveTo(cx, ry - 3, cx + w * 0.28, ry + 2); }
      ctx.moveTo(cx - w * 0.2, hip); ctx.lineTo(cx + w * 0.2, hip);
      ctx.moveTo(cx - w * 0.15, hip); ctx.lineTo(cx - w * 0.22, y + h - 2);
      ctx.moveTo(cx + w * 0.15, hip); ctx.lineTo(cx + w * 0.22, y + h - 2);
      ctx.moveTo(cx - w * 0.28, spineTop + 4); ctx.lineTo(cx - w * 0.45, spineTop + 16);
      ctx.moveTo(cx + w * 0.28, spineTop + 4); ctx.lineTo(cx + w * 0.45, spineTop + 16);
      ctx.stroke();
    }
    drawArcs(ctx, d, frame);
    return;
  }
  // Keeled over, cooked black and smoking: a person flat on their back, an animal legs-up; the last of the current
  // still popping off it for a moment
  if (d.sprite) {
    ctx.globalAlpha = fadeOut(d, 15);
    const k = clamp01((t - 40) / 6);
    const humanoid = isHumanoidKind(d.sprite.kind);
    const fx = x + w / 2, fy = y + h;
    ctx.save();
    if (lying(d)) { /* (flat out on her towel already) */ }
    else if (humanoid) {
      // Toppled backwards about the heels
      ctx.translate(fx, fy - 2); ctx.rotate(-d.sprite.facing * (Math.PI / 2) * k); ctx.translate(-fx, -(fy - 2));
    } else {
      // Rolled over: flipped upside down, lying on its back
      ctx.translate(fx, fy - h / 2); ctx.scale(1, 1 - 2 * k); ctx.translate(-fx, -(fy - h / 2));
    }
    drawBody(ctx, d, state, { filter: 'brightness(0.26) saturate(0.3) contrast(1.3)' });
    ctx.restore();
    if (t < 58 && frame % 7 < 2) {
      const sx = x + hash(t + seedOf(d)) * w, sy = fy - 4 - hash(t * 3) * Math.min(w, h) * 0.5;
      ctx.beginPath(); boltPath(ctx, sx - 4, sy, sx + 5, sy - 3, t, 2, false);
      ctx.strokeStyle = '#A5F3FC'; ctx.lineWidth = 1.2; ctx.stroke();
    }
    return;
  }
  // Collapsed into a smoking black heap
  const k = clamp01((t - 40) / 8);
  const heapH = h * (1 - k) + 12 * k;
  ctx.globalAlpha = fadeOut(d, 15);
  ctx.fillStyle = mix(d.color, '#1C1917', 0.9);
  ctx.beginPath(); ctx.roundRect(x - 4 * k, y + h - heapH, w + 8 * k, heapH, 4 * k); ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + w * 0.35, y + h - heapH + 3, 3, 3);
  ctx.fillRect(x + w * 0.55, y + h - heapH + 3, 3, 3);
};

/**
 * A themed enemy's skeleton, glowing through the x-ray flash: four-legged, bird or human. Bones are white with a cyan
 * glow round them and a knob at every joint; the skull's got its sockets, a nose hole and a jaw that chatters.
 */
const drawKindSkeleton = (ctx: Ctx, d: EnemyDeath, frame: number) => {
  const s = d.sprite!;
  // (lying down: a standing one's bones, laid down along her the way she's lying, head to the head end)
  const head = lying(d) ? KIND_HEAD[s.kind] : headOf(d);
  ctx.save();
  ctx.translate(d.x + d.w / 2, d.y + d.h);
  ctx.scale(s.facing, 1);
  if (lying(d)) { ctx.translate(30, -8); ctx.rotate(-Math.PI / 2); }
  const w = d.w, h = d.h;
  const bones = skeletonOf(s.kind);
  const joints: number[] = [];
  const M = (px: number, py: number) => { ctx.moveTo(px, py); joints.push(px, py); };
  const L = (px: number, py: number) => { ctx.lineTo(px, py); joints.push(px, py); };
  ctx.beginPath();
  if (bones === 'machine') {
    // The board, its traces and chips, wires out to the motors
    const cy = -h * 0.55;
    ctx.rect(-w * 0.22, cy - h * 0.2, w * 0.44, h * 0.4);
    for (let i = 0; i < 3; i++) { ctx.moveTo(-w * 0.18, cy - h * 0.1 + i * h * 0.1); ctx.lineTo(w * 0.18, cy - h * 0.1 + i * h * 0.1); }
    for (const sx of [-1, 1]) { M(sx * w * 0.22, cy); L(sx * w * 0.42, cy - h * 0.25); ctx.moveTo(sx * w * 0.42 + 5, cy - h * 0.25); ctx.arc(sx * w * 0.42, cy - h * 0.25, 5, 0, Math.PI * 2); }
  } else if (bones === 'four-legs') {
    // Four legs, a spine along the back, ribs hanging off it, a tail
    const back = -h * 0.62, hipX = -w * 0.38, shoulderX = w * 0.25;
    M(hipX - 8, back + 2); L(shoulderX, back); L(head.x - head.r * 0.8, head.y + 2);
    for (let i = 0; i < 4; i++) { const rx = hipX + 10 + i * (shoulderX - hipX - 10) / 4; ctx.moveTo(rx, back); ctx.quadraticCurveTo(rx + 5, back + h * 0.12, rx + 1, back + h * 0.28); }
    for (const lx of [hipX, hipX + 8, shoulderX - 6, shoulderX]) { M(lx, back); L(lx + 2, -h * 0.25); L(lx - 1, -1); }
    M(hipX - 8, back + 2); L(hipX - 20, back - (s.kind === 'goat' ? 6 : -4));
    if (s.kind === 'goat') { ctx.moveTo(head.x - 2, head.y - head.r); ctx.quadraticCurveTo(head.x - 12, head.y - head.r - 12, head.x - 16, head.y - 2); }
  } else if (bones === 'fish') {
    // A long spine, rib bones fanning off it, a forked tail
    const cy = -h * 0.5;
    M(head.x - head.r, head.y + 2); L(-w * 0.45, cy);
    for (let i = 0; i < 6; i++) { const rx = -w * 0.35 + i * w * 0.1; ctx.moveTo(rx, cy); ctx.quadraticCurveTo(rx + 4, cy - h * 0.15, rx + 3, cy - h * 0.3); ctx.moveTo(rx, cy); ctx.quadraticCurveTo(rx + 4, cy + h * 0.15, rx + 3, cy + h * 0.3); }
    M(-w * 0.45, cy); L(-w * 0.62, cy - h * 0.4); ctx.moveTo(-w * 0.45, cy); L(-w * 0.62, cy + h * 0.4);
  } else if (bones === 'crab') {
    // A crab's all shell: glow the shell's outline, legs and claws instead
    ctx.ellipse(0, -h * 0.5, w * 0.35, h * 0.3, 0, 0, Math.PI * 2);
    for (const sx of [-1, 1]) { for (let i = 0; i < 3; i++) { M(sx * w * 0.2, -h * 0.45); L(sx * (w * 0.32 + i * 2), -h * 0.25); L(sx * (w * 0.4 + i * 2), -1); } M(sx * w * 0.3, -h * 0.6); L(sx * w * 0.35, -h); }
  } else if (bones === 'bird') {
    // Wings spread wide (the long finger bones fanning off the tip), a short spine, a fan of tail bones, a hooked beak
    const cy = -h * 0.5;
    M(head.x - head.r, head.y + 2); L(-w * 0.35, cy);
    M(0, cy); L(-w * 0.2, cy - h * 0.9); L(-w * 0.55, cy - h * 1.1);
    for (const a of [0.2, 0.45, 0.7]) { ctx.moveTo(-w * 0.55, cy - h * 1.1); ctx.lineTo(-w * 0.55 - Math.cos(a) * 12, cy - h * 1.1 + Math.sin(a) * 12); }
    M(0, cy); L(-w * 0.15, cy + h * 0.5);
    for (const a of [-0.3, 0, 0.3]) { ctx.moveTo(-w * 0.35, cy); ctx.lineTo(-w * 0.35 - Math.cos(a) * 12, cy + Math.sin(a) * 12); }
    ctx.moveTo(head.x + head.r, head.y - 1); ctx.quadraticCurveTo(head.x + head.r + 7, head.y, head.x + head.r + 5, head.y + 5);
  } else {
    // A person: spine, ribs curving round, pelvis, arms (elbows and all), legs (knees and all)
    const neck = head.y + head.r, hip = -h * 0.32, knee = hip * 0.45;
    M(0, neck); L(0, hip);
    for (let i = 0; i < 3; i++) { const ry = neck + 5 + i * (hip - neck - 6) / 3; ctx.moveTo(-w * 0.28, ry + 3); ctx.quadraticCurveTo(0, ry - 4, w * 0.28, ry + 3); }
    ctx.moveTo(-w * 0.2, hip + 2); ctx.quadraticCurveTo(0, hip - 5, w * 0.2, hip + 2);
    M(-w * 0.15, hip); L(-w * 0.18, knee); L(-w * 0.2, -2);
    M(w * 0.15, hip); L(w * 0.18, knee); L(w * 0.2, -2);
    M(-w * 0.28, neck + 4); L(-w * 0.38, neck + 13); L(-w * 0.45, neck + 22);
    M(w * 0.28, neck + 4); L(w * 0.4, neck + 11); L(w * 0.5, neck + 18);
  }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(103, 232, 249, 0.35)'; ctx.lineWidth = 4.4; ctx.stroke();
  ctx.strokeStyle = '#ECFEFF'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < joints.length; i += 2) { ctx.beginPath(); ctx.arc(joints[i], joints[i + 1], 1.5, 0, Math.PI * 2); ctx.fill(); }
  // The skull: the dome, the jaw hanging open and shut under it, the sockets, the nose hole, the teeth
  if (bones !== 'machine') {
    const r = head.r, jaw = frame % 4 < 2 ? 1.6 : 0;
    ctx.fillStyle = 'rgba(103, 232, 249, 0.4)'; ctx.beginPath(); ctx.arc(head.x, head.y, r + 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ECFEFF';
    ctx.beginPath(); ctx.arc(head.x, head.y - r * 0.08, r, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(head.x - r * 0.15, head.y + r * 0.35 + jaw, r * 1.05, r * 0.6, [1, 1, r * 0.3, r * 0.3]); ctx.fill();
    ctx.fillStyle = '#164E63';
    ctx.beginPath(); ctx.ellipse(head.x + r * 0.38, head.y - r * 0.12, r * 0.26, r * 0.3, 0, 0, Math.PI * 2); ctx.ellipse(head.x - r * 0.22, head.y - r * 0.12, r * 0.24, r * 0.3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(head.x + r * 0.62, head.y + r * 0.18, r * 0.16, r * 0.2);
    for (let k = 0; k < 3; k++) ctx.fillRect(head.x + r * (0.05 + k * 0.28), head.y + r * 0.35 + jaw, 0.8, r * 0.22);
    if (frame % 3 === 0) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(head.x + r * 0.32, head.y - r * 0.15, 1.5, 1.5); ctx.fillRect(head.x - r * 0.27, head.y - r * 0.15, 1.5, 1.5); }
  }
  ctx.restore();
};

/** A drip of goo running down off something: a teardrop on a string, inked, a glint on it. */
const drip = (ctx: Ctx, dx: number, top: number, len: number, r: number, fill: string) => {
  const by = top + len;
  ctx.beginPath();
  ctx.moveTo(dx - r * 0.55, top); ctx.lineTo(dx - r * 0.45, by - r * 0.8);
  ctx.arc(dx, by, r, Math.PI * 1.15, Math.PI * 1.85, true);
  ctx.lineTo(dx + r * 0.55, top); ctx.closePath();
  ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = '#365314'; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.fillStyle = '#ECFCCB'; ctx.fillRect(dx - r * 0.5, by - r * 0.5, 1.2, 1.2);
};

/** Slumps down into a bubbling green puddle, its eyes the last thing to sink. */
const drawMelted = (ctx: Ctx, d: EnemyDeath, frame: number, state: GameState) => {
  const { x, y, w, h, t } = d;
  const seed = seedOf(d);
  const p = clamp01(t / 60);
  const bodyH = Math.max(6, h * (1 - p));
  const bodyW = w * (1 + p * 0.9);
  const bx = x + w / 2 - bodyW / 2, by = y + h - bodyH;
  const cx = x + w / 2, fy = y + h;
  ctx.globalAlpha = fadeOut(d, 25);
  // The puddle spreading underneath: dark round the rim, lighter in the middle, a shine on it
  const pw = bodyW * 0.7 + 6, ph = 5 + p * 4;
  pixelBlob(ctx, cx, fy - 1, pw + 3, ph, '#365314');
  pixelBlob(ctx, cx, fy - 2, pw, ph - 1.5, '#4D7C0F');
  pixelBlob(ctx, cx - pw * 0.1, fy - 3, pw * 0.65, ph * 0.5, '#65A30D');
  ctx.fillStyle = '#BEF264'; ctx.fillRect(Math.round(cx - pw * 0.45), Math.round(fy - ph - 1), 6, 1.5); ctx.fillRect(Math.round(cx + pw * 0.2), Math.round(fy - ph), 3, 1.5);
  // The slumping body, going green, a coat of goo sliding down over it (only over it) that hangs in tongues
  if (d.sprite) {
    drawBodyMasked(ctx, d, state, { sx: bodyW / w, sy: bodyH / h, filter: `grayscale(${Math.min(1, p * 2)}) sepia(${Math.min(1, p * 2)}) hue-rotate(${50 * p}deg) saturate(${1 + p * 4})` }, g => {
      const coat = bodyH * Math.min(1, 0.2 + p * 1.4);
      g.beginPath(); g.moveTo(bx - 20, by - 20); g.lineTo(bx + bodyW + 20, by - 20);
      for (let k = 8; k >= 0; k--) { const gx = bx - 4 + k * (bodyW + 8) / 8; g.lineTo(gx, by + coat * (0.6 + 0.4 * hash(seed + k))); }
      g.closePath();
      g.fillStyle = 'rgba(101, 163, 13, 0.6)'; g.fill();
      g.fillStyle = 'rgba(190, 242, 100, 0.55)'; g.fillRect(bx - 4, by, bodyW + 8, 2);
    });
  } else {
    ctx.fillStyle = mix(d.color, '#65A30D', p * 1.3);
    ctx.beginPath(); ctx.roundRect(bx, by, bodyW, bodyH, [Math.min(12, bodyH / 2) * p + 2, Math.min(12, bodyH / 2) * p + 2, 2, 2]); ctx.fill();
  }
  // Drips running down it
  for (let i = 0; i < 4; i++) {
    const dx = bx + (i + 0.3 + hash(seed + i) * 0.4) * bodyW / 4;
    const len = ((t * 1.5 + i * 9) % Math.max(8, bodyH));
    drip(ctx, dx, by, len, 2.2 + hash(seed + i * 3) * 0.8, i % 2 ? '#84CC16' : '#65A30D');
  }
  // Bubbles swelling on top and popping
  for (let i = 0; i < 3; i++) {
    const q = ((frame + i * 11) % 14) / 14, bxx = bx + (i + 1) * bodyW / 4, byy = by + 1;
    if (q < 0.8) {
      const r = 1 + q * 4;
      ctx.beginPath(); ctx.arc(bxx, byy - r * 0.6, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(163, 230, 53, 0.85)'; ctx.fill(); ctx.strokeStyle = '#3F6212'; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.fillStyle = '#ECFCCB'; ctx.fillRect(bxx - r * 0.5, byy - r * 1.1, 1.4, 1.4);
    } else {
      ctx.fillStyle = '#D9F99D';
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.6; ctx.fillRect(bxx + Math.cos(a) * 5, byy - 3 + Math.sin(a) * 4, 1.5, 1.5); }
    }
  }
  // Eyes sinking into the goo, rolling about
  if (t < 85) {
    const ey = d.sprite ? Math.max(by + 2, eyesAt(d).y * (1 - p) + (y + h - 6) * p) : by + Math.min(bodyH * 0.35, 12);
    const roll = Math.sin(t * 0.15);
    eye(ctx, cx - 6, ey, 3.4, roll, 0.4);
    eye(ctx, cx + 6, ey + 1, 3.4, -roll, -0.3);
  }
};

/** Flung off black and glistening, then splatted flat in its own oil slick. */
const drawGreased = (ctx: Ctx, d: EnemyDeath, frame: number, state: GameState) => {
  const { x, y, w, h } = d;
  // (the shine sliding across it, with a rainbow fringe either side)
  const sheen = (g: Ctx, top: number, bot: number) => {
    const sx = x - w * 0.4 + ((frame * 1.6) % (w * 1.8));
    g.fillStyle = 'rgba(168, 85, 247, 0.35)'; g.fillRect(sx - 4, top, 3, bot - top);
    g.fillStyle = 'rgba(255, 255, 255, 0.55)'; g.fillRect(sx - 1, top, 4, bot - top);
    g.fillStyle = 'rgba(45, 212, 191, 0.35)'; g.fillRect(sx + 3, top, 3, bot - top);
  };
  if (!d.landed) {
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(d.rot);
    ctx.translate(-(x + w / 2), -(y + h / 2));
    if (d.sprite) drawBodyMasked(ctx, d, state, { filter: 'brightness(0.16) contrast(1.4)' }, g => {
      sheen(g, y - h, y + h);
      g.fillStyle = 'rgba(255, 255, 255, 0.22)'; g.fillRect(x - w, y + 2, w * 3, 2);
    });
    else { ctx.fillStyle = '#0A0A0A'; ctx.fillRect(x, y, w, h); ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'; ctx.fillRect(x + 4, y + 3, 4, h - 6); }
    return;
  }
  ctx.globalAlpha = fadeOut(d, 40);
  const cx = x + w / 2, fy = d.floorY;
  // The slick: black, spread wide, the rainbow film on it in rings, flecks of it thrown out
  pixelBlob(ctx, cx, fy - 2, w * 1.1 + 4, 7, '#0A0A0A');
  pixelBlob(ctx, cx + w * 0.2, fy - 2, w * 0.7, 4.5, '#1C1917');
  ctx.lineWidth = 1;
  for (const [c, rx, ry, a0, a1] of [['rgba(168, 85, 247, 0.5)', 0.9, 4.5, 3.4, 4.6], ['rgba(45, 212, 191, 0.45)', 0.75, 3.6, 3.6, 5.2], ['rgba(250, 204, 21, 0.4)', 0.55, 2.6, 3.9, 5.6]] as [string, number, number, number, number][]) {
    ctx.strokeStyle = c; ctx.beginPath(); ctx.ellipse(cx + w * 0.15, fy - 2, w * rx, ry, 0, a0, a1); ctx.stroke();
  }
  ctx.fillStyle = '#0A0A0A';
  for (let k = 0; k < 4; k++) { const sx = cx + (k < 2 ? -1 : 1) * (w * 1.2 + 6 + k * 5); ctx.fillRect(Math.round(sx), Math.round(fy - 3 - (k % 2) * 2), 3 + (k % 2), 2); }
  // The body splatted flat in it, black and shining
  const sy = 0.32, flatTop = y + h - h * sy;
  if (d.sprite) drawBodyMasked(ctx, d, state, { sx: 1.35, sy, filter: 'brightness(0.16) contrast(1.4)' }, g => {
    g.fillStyle = 'rgba(255, 255, 255, 0.3)'; g.fillRect(x - w, flatTop + 1, w * 3, 1.5);
    sheen(g, flatTop - 2, y + h);
  });
  else {
    ctx.fillStyle = '#1C1917';
    ctx.beginPath(); ctx.roundRect(cx - w * 0.6, fy - 14, w * 1.2, 13, [8, 8, 2, 2]); ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'; ctx.fillRect(cx - w * 0.6 + (frame * 0.8) % (w * 1.2), fy - 12, 5, 9);
  }
};

/** Flattened like a pancake on the floor, gore squeezed out the sides. */
const drawPancaked = (ctx: Ctx, d: EnemyDeath, state: GameState) => {
  const { x, y, w, h } = d;
  ctx.globalAlpha = fadeOut(d, 30);
  const cx = x + w / 2, fy = y + h, seed = seedOf(d);
  // The pool: near black at the rim, red, a wet shine; gobbets squeezed out either end
  drawBloodPool(ctx, cx, fy + 1, Math.round(w * 1.05 + 3), seed, { color: '#7F1D1D' });
  ctx.fillStyle = '#991B1B';
  for (let k = 0; k < 5; k++) { const sx = cx + (hash(seed + k) - 0.5) * w * 2.8; ctx.fillRect(Math.round(sx), Math.round(fy - 3 - hash(seed + k * 3) * 3), 2 + (k % 2) * 2, 2); }
  ctx.fillStyle = '#F87171'; ctx.fillRect(Math.round(cx - w * 0.7), Math.round(fy - 4), 3, 1); ctx.fillRect(Math.round(cx + w * 0.4), Math.round(fy - 6), 4, 1);
  if (d.sprite) drawBody(ctx, d, state, { sx: 1.5, sy: 7 / h });
  else {
    ctx.fillStyle = d.color;
    ctx.fillRect(cx - w * 0.75, fy - 7, w * 1.5, 6);
  }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(cx - w * 0.75, fy - 3, w * 1.5, 2);
  // X'd-out eyes
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (const ex of [cx - 6, cx + 4]) { ctx.moveTo(ex - 2, fy - 6); ctx.lineTo(ex + 2, fy - 3); ctx.moveTo(ex + 2, fy - 6); ctx.lineTo(ex - 2, fy - 3); }
  ctx.stroke();
};

/**
 * The sniper's round: the head comes off whole and goes spinning away, bouncing; the body stays stood there a moment,
 * the neck going like a fountain, then goes over (a person back on its heels, an animal flat on its side).
 */
const drawHeadshot = (ctx: Ctx, d: EnemyDeath, state: GameState) => {
  const hd = d.head;
  if (!hd) return;
  const { x, y, w, h, t } = d;
  ctx.globalAlpha = fadeOut(d, 20);
  const neckY = y + hd.oy + hd.r * 0.7;
  // The body, from the neck down: stood there, then over
  const k = clamp01((t - 46) / 10);
  const facing = d.sprite?.facing ?? 1;
  const fx = x + w / 2, fy = y + h;
  if (lying(d)) { drawHeadshotLying(ctx, d, state); return; }
  ctx.save();
  if (!d.sprite || isHumanoidKind(d.sprite.kind)) { ctx.translate(fx, fy - 2); ctx.rotate(-facing * (Math.PI / 2) * k); ctx.translate(-fx, -(fy - 2)); }
  else { ctx.translate(fx, fy); ctx.scale(1, 1 - 0.45 * k); ctx.translate(-fx, -fy); }
  drawBody(ctx, d, state, { clipFromY: neckY });
  // The stump
  ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.ellipse(x + hd.ox, neckY + 1, Math.max(3, hd.r * 0.7), 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.ellipse(x + hd.ox, neckY, Math.max(2, hd.r * 0.45), 2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // The head, wherever it's got to: the body's own drawing, cut round the head and carried off
  const cx = x + hd.ox, cy = y + hd.oy;
  ctx.save();
  ctx.translate(hd.x, hd.y); ctx.rotate(hd.rot); ctx.translate(-cx, -cy);
  ctx.beginPath(); ctx.rect(cx - hd.r * 1.6, cy - hd.r * 1.8, hd.r * 3.2, hd.r * 1.8 + hd.r * 0.7); ctx.clip();
  if (d.sprite) drawBody(ctx, d, state);
  else { ctx.fillStyle = d.color; ctx.fillRect(cx - hd.r, cy - hd.r, hd.r * 2, hd.r * 1.7); }
  // (and what's showing where it came off)
  ctx.fillStyle = '#991B1B'; ctx.fillRect(cx - hd.r * 0.6, cy + hd.r * 0.45, hd.r * 1.2, hd.r * 0.25);
  ctx.restore();
};

/** The headshot on one lying down (the sunbather): the head comes off the end of her, the neck's cut across, and the rest
 * of her stays where it was on the towel. */
const drawHeadshotLying = (ctx: Ctx, d: EnemyDeath, state: GameState) => {
  const hd = d.head!;
  const { x, y, w, h } = d;
  const facing = d.sprite?.facing ?? 1;
  const cx = x + hd.ox, cy = y + hd.oy;
  const neckX = cx + facing * hd.r * 0.95;
  // The body, from the neck along: the cut's straight across her (what's past it, on the head's side, isn't drawn)
  ctx.save();
  ctx.beginPath();
  if (facing === 1) ctx.rect(neckX, y - h, w * 3, h * 2 + 4); else ctx.rect(neckX - w * 3, y - h, w * 3, h * 2 + 4);
  ctx.rect(x - w * 2, y + h - 3.4, w * 5, 8); // (and the whole of the towel, under where her head was)
  ctx.clip();
  drawBody(ctx, d, state);
  ctx.restore();
  // The stump, end on
  ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.ellipse(neckX, cy + 1, 2.4, Math.max(3, hd.r * 0.6), 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.ellipse(neckX + facing * 0.4, cy + 1, 1.4, Math.max(2, hd.r * 0.4), 0, 0, Math.PI * 2); ctx.fill();
  // The head, wherever it's got to: cut out of her drawing at the neck and carried off
  ctx.save();
  ctx.translate(hd.x, hd.y); ctx.rotate(hd.rot); ctx.translate(-cx, -cy);
  ctx.beginPath();
  if (facing === 1) ctx.rect(cx - hd.r * 1.8, cy - hd.r * 1.6, neckX - (cx - hd.r * 1.8), hd.r * 2.6);
  else ctx.rect(neckX, cy - hd.r * 1.6, cx + hd.r * 1.8 - neckX, hd.r * 2.6);
  ctx.clip();
  drawBody(ctx, d, state);
  // (and what's showing where it came off)
  ctx.fillStyle = '#991B1B'; ctx.fillRect(neckX - (facing === 1 ? 1.4 : 0), cy - hd.r * 0.5, 1.4, hd.r * 1.1);
  ctx.restore();
};
