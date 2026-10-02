// Boulders (Ernie's, and Meathead's boulder gun), plus the rock chips they break into.

import { Enemy, Projectile } from '../../../types';
import { ERNIE_BOULDER_SIZE } from '../../bosses/ernie';
import { pixelBlob } from '../pixelArt';
import { dark } from '../npc/kit';
import { mix } from '../backdrops/core';

interface RockPalette { light: string; mid: string; dark: string; crack: string; speck: string }

const ERNIE_ROCK: RockPalette = { light: '#A1887F', mid: '#6D4C41', dark: '#3E2723', crack: '#1B0F0C', speck: '#BCAAA4' };
export const PLAYER_ROCK: RockPalette = { light: '#D7A86E', mid: '#8B5A2B', dark: '#4E2F12', crack: '#2A1808', speck: '#F0D2A8' };

/** A rock's five steps, deepest shadow to the lit top. */
const rampOf = (pal: RockPalette) => [dark(pal.dark, 0.3), pal.dark, pal.mid, mix(pal.mid, pal.light, 0.5), pal.light];
/** The step a face whose outward normal is (nx, ny) in the turned frame earns, the light staying put upper left. */
const faceStep = (ramp: string[], nx: number, ny: number, angle: number, nudge = 0) => {
  const c = Math.cos(angle), s = Math.sin(angle);
  const wx = nx * c - ny * s, wy = nx * s + ny * c, len = Math.hypot(wx, wy) || 1;
  const lit = (-0.62 * wx - 0.78 * wy) / len;
  return ramp[Math.max(0, Math.min(ramp.length - 1, Math.round((lit + 1) * 0.5 * (ramp.length - 1) + nudge)))];
};

/**
 * A craggy rock, knapped into flat faces round a lumpy top face, each face its own step of the palette (lit upper left,
 * whichever way it's turned); strata running through it, inked cracks with a lit lip, specks. `seed` keeps each
 * boulder's lumps and cracks its own.
 */
export const drawRock = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, angle: number, pal: RockPalette, seed: number) => {
  const rnd = (i: number) => ((Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453) % 1 + 1) % 1;
  const lump = (i: number) => 0.84 + rnd(i) * 0.22;
  const points = 14;
  const ramp = rampOf(pal);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  const pts: number[][] = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    pts.push([Math.cos(a) * r * lump(i), Math.sin(a) * r * lump(i)]);
  }
  const poly = (q: number[][]) => { ctx.beginPath(); q.forEach(([x, y], k) => (k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y))); ctx.closePath(); };
  // (the top face: the outline pulled in round a point off-centre, knocked about a bit)
  const ax = (rnd(40) - 0.5) * r * 0.25, ay = (rnd(41) - 0.5) * r * 0.25;
  const inner = pts.map(([x, y], i) => { const k = 0.42 + rnd(i + 20) * 0.14; return [ax + (x - ax) * k, ay + (y - ay) * k]; });
  // Faces round it, two edges to a face
  ctx.lineJoin = 'round';
  for (let k = 0; k < points; k += 2) {
    const q = [pts[k], pts[(k + 1) % points], pts[(k + 2) % points], inner[(k + 2) % points], inner[(k + 1) % points], inner[k]];
    const m = pts[(k + 1) % points];
    ctx.fillStyle = faceStep(ramp, m[0] - ax, m[1] - ay, angle, (rnd(k + 60) - 0.5) * 0.6);
    poly(q); ctx.fill();
    ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 0.6; ctx.stroke(); // (no seams)
  }
  // The top face, its step, a lit corner
  ctx.fillStyle = ramp[3];
  poly(inner); ctx.fill();
  ctx.save(); poly(inner); ctx.clip(); ctx.rotate(-angle);
  ctx.fillStyle = ramp[4]; ctx.beginPath(); ctx.arc(-r * 0.32, -r * 0.34, r * 0.32, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = ramp[2]; ctx.beginPath(); ctx.arc(r * 0.05, r * 0.05, r * 0.6, 0, Math.PI * 2); ctx.rect(r, -r, -r * 2, r * 2); ctx.fill('evenodd');
  ctx.restore();
  // Strata: two darker bands laid through it, turning with it
  ctx.save(); poly(pts); ctx.clip();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
  for (let k = 0; k < 2; k++) {
    const y = (k === 0 ? -0.3 : 0.35) * r + (rnd(k + 70) - 0.5) * r * 0.2, t = Math.max(2, r * 0.07);
    ctx.beginPath(); ctx.moveTo(-r * 1.2, y); ctx.lineTo(r * 1.2, y + r * 0.12); ctx.lineTo(r * 1.2, y + r * 0.12 + t); ctx.lineTo(-r * 1.2, y + t); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  // Edges between the faces, faint
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)'; ctx.lineWidth = 1;
  poly(inner); ctx.stroke();
  // Cracks, each with a lit lip along one side
  ctx.lineCap = 'round';
  for (let k = 0; k < 2; k++) {
    const a = seed * 1.7 + k * 2.9;
    const path = (o: number) => {
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.85 + o, Math.sin(a) * r * 0.85 + o);
      ctx.lineTo(Math.cos(a + 0.3) * r * 0.4 + o, Math.sin(a + 0.3) * r * 0.4 + o);
      ctx.lineTo(Math.cos(a + 0.9) * r * 0.2 + o, Math.sin(a + 0.9) * r * 0.2 + o);
    };
    ctx.strokeStyle = ramp[4]; ctx.lineWidth = 1; path(Math.max(1.2, r * 0.05)); ctx.stroke();
    ctx.strokeStyle = pal.crack; ctx.lineWidth = Math.max(1.5, r * 0.05); path(0); ctx.stroke();
  }
  ctx.lineCap = 'butt';
  // Specks
  ctx.fillStyle = pal.speck;
  const sp = Math.max(2, Math.round(r * 0.07));
  for (let k = 0; k < 6; k++) {
    const a = seed * 3.1 + k * 1.3, d = r * (0.25 + (k % 3) * 0.2);
    ctx.fillRect(Math.cos(a) * d, Math.sin(a) * d, sp, sp);
  }
  // Ink
  ctx.strokeStyle = pal.crack;
  ctx.lineWidth = Math.max(2, r * 0.07);
  poly(pts); ctx.stroke();
  ctx.restore();
};

const seedOf = (id: string) => { let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997; return h; };

/** A boulder projectile: rolls (spins with distance travelled), kicks up dust on the ground. */
export const drawBoulder = (ctx: CanvasRenderingContext2D, p: Projectile, frame: number) => {
  const r = p.width / 2, cx = p.pos.x + r, cy = p.pos.y + p.height / 2;
  const pal = p.owner === 'player' ? PLAYER_ROCK : ERNIE_ROCK;
  const onGround = Math.abs(p.vel.y) < 1;
  if (onGround) {
    // (its shadow, in two steps)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.95, r * 0.95, r * 0.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.95, r * 0.65, r * 0.13, 0, 0, Math.PI * 2); ctx.fill();
  }
  // Dust kicked up behind it while it rolls: chunky puffs, thinning as they rise
  if (onGround && Math.abs(p.vel.x) > 1) {
    const back = -Math.sign(p.vel.x);
    for (let k = 0; k < 3; k++) {
      const t = ((frame * 2 + k * 9) % 24) / 24;
      const pr = r * 0.2 + t * r * 0.3;
      ctx.globalAlpha = Math.round(0.5 * (1 - t) * 4) / 4;
      pixelBlob(ctx, cx + back * (r * 0.6 + t * 30), cy + r * 0.8 - t * 14, pr, pr, '#A1887F');
      ctx.globalAlpha *= 0.8;
      pixelBlob(ctx, cx + back * (r * 0.6 + t * 30) - pr * 0.2, cy + r * 0.8 - t * 14 - pr * 0.25, pr * 0.55, pr * 0.55, '#C8B7AE');
    }
    ctx.globalAlpha = 1;
  }
  drawRock(ctx, cx, cy, r, p.pos.x / r, pal, seedOf(p.id));
};

/** Shrapnel from a broken boulder: small tumbling rock chips, faceted, lit upper left as they turn. */
export const drawRockChip = (ctx: CanvasRenderingContext2D, p: Projectile, frame: number) => {
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  const angle = frame * 0.4 + seedOf(p.id);
  const ramp = rampOf(ERNIE_ROCK);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  const pts = [[-6, -3], [1, -6], [6, -1], [3, 5], [-5, 4]];
  const ax = -0.5, ay = -0.5;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#2A1808'; ctx.lineWidth = 2.5;
  ctx.beginPath(); pts.forEach(([x, y], k) => (k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y))); ctx.closePath(); ctx.stroke();
  for (let k = 0; k < pts.length; k++) {
    const a = pts[k], b = pts[(k + 1) % pts.length];
    ctx.fillStyle = faceStep(ramp, (a[0] + b[0]) / 2 - ax, (a[1] + b[1]) / 2 - ay, angle, 0.3);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(ax, ay); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 0.5; ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = ERNIE_ROCK.speck; ctx.fillRect(Math.round(cx) - 2, Math.round(cy) - 2, 1, 1);
};

/** Ernie holding a boulder over his head before he heaves it; or stood up on one before he jumps off it. */
export const drawErnieHeldBoulder = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  if (e.bossState === 'perched') {
    const r = ERNIE_BOULDER_SIZE / 2;
    // (rocking a touch under him)
    drawRock(ctx, e.pos.x + e.width / 2, e.pos.y + e.height + r, r, Math.sin(frame * 0.6) * 0.05, ERNIE_ROCK, 11);
    return;
  }
  if (e.bossState !== 'attacking') return;
  const r = ERNIE_BOULDER_SIZE / 2;
  const strain = Math.sin(frame * 0.9) * 1.5; // straining under the weight
  drawRock(ctx, e.pos.x + e.width / 2, e.pos.y - r + 12 + strain, r, 0.3, ERNIE_ROCK, 7);
};
