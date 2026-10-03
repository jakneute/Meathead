// Particles, drawn as shapes instead of squares: blood as stretched droplets
// and splats, glass as shards, water as drops, everything else as soft blobs.

import { Particle } from '../../types';
import { isGoreColor } from '../core/effects';

const GLOSS = 'rgba(255, 255, 255, 0.35)';

/** Stable per-particle wobble so splats don't flicker frame to frame. */
const hash = (p: Particle, salt: number) => {
  const v = Math.sin((p.pos.x * 12.9898 + p.pos.y * 78.233 + salt * 37.719) % 1000) * 43758.5453;
  return v - Math.floor(v);
};

export const drawParticle = (ctx: CanvasRenderingContext2D, p: Particle) => {
  const r = Math.max(1, p.size / 2);
  const x = p.pos.x + r, y = p.pos.y + r;
  if (p.isGlass) return drawShard(ctx, p, x, y, r);
  if (p.molten) return drawMoltenGlob(ctx, p, x, y, r);
  if (isGoreColor(p.color) || p.isBossGore) {
    if (p.isSplat || p.isStuck) return drawSplat(ctx, p, x, y, r);
    return drawDroplet(ctx, p, x, y, r);
  }
  if (p.isWater) {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = GLOSS;
    ctx.beginPath();
    ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  // Everything else (sparks, embers, charge-ups, dust, smoke, motes): chunky, on the pixel grid. Bright ones are lit
  // things: going fast, a streak with a hot head; slower, a little four-pointed twinkle with a halo; the dull ones are
  // dust and smoke: a clump of pixels, lit on its top
  const lum = luminance(p.color);
  const px = Math.round(x / 2) * 2, py = Math.round(y / 2) * 2, s = Math.max(2, Math.round(r) * 2);
  // (a plain block: a casing, a pebble, a drop; lit on its top-left once it's big enough to have one)
  if (p.chunk) {
    ctx.fillStyle = p.color; ctx.fillRect(px - s / 2, py - s / 2, s, s);
    if (s >= 4) { ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; ctx.fillRect(px - s / 2, py - s / 2, 2, 2); }
    return;
  }
  const speed = Math.hypot(p.vel.x, p.vel.y);
  if (lum > 0.55) {
    ctx.fillStyle = p.color;
    if (speed > 2.5) {
      // (the streak: back along where it's come from, in two steps, thinning)
      const k = Math.min(3, speed * 0.6);
      ctx.globalAlpha *= 0.45; ctx.fillRect(Math.round((px - p.vel.x * k) / 2) * 2, Math.round((py - p.vel.y * k) / 2) * 2, Math.max(2, s / 2), Math.max(2, s / 2));
      ctx.globalAlpha /= 0.45;
      ctx.globalAlpha *= 0.7; ctx.fillRect(Math.round((px - p.vel.x * k * 0.5) / 2) * 2, Math.round((py - p.vel.y * k * 0.5) / 2) * 2, Math.max(2, s * 0.75), Math.max(2, s * 0.75));
      ctx.globalAlpha /= 0.7;
      ctx.fillRect(px - s / 2, py - s / 2, s, s);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'; ctx.fillRect(px - 1, py - 1, 2, 2);
      return;
    }
    // (the twinkle: a halo, the cross, a white-hot middle; it turns on the beat)
    ctx.globalAlpha *= 0.28; ctx.fillRect(px - s, py - s / 2, s * 2, s); ctx.fillRect(px - s / 2, py - s, s, s * 2); ctx.globalAlpha /= 0.28;
    const arm = s + 2, tw = (Math.floor((p.life + p.pos.x) / 4) & 1) === 0;
    if (tw) { ctx.fillRect(px - arm, py - 1, arm * 2, 2); ctx.fillRect(px - 1, py - arm, 2, arm * 2); }
    else { ctx.fillRect(px - arm * 0.7, py - arm * 0.7, 2, 2); ctx.fillRect(px + arm * 0.7 - 2, py - arm * 0.7, 2, 2); ctx.fillRect(px - arm * 0.7, py + arm * 0.7 - 2, 2, 2); ctx.fillRect(px + arm * 0.7 - 2, py + arm * 0.7 - 2, 2, 2); }
    ctx.fillRect(px - s / 2, py - s / 2, s, s);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; ctx.fillRect(px - 1, py - 1, 2, 2);
    return;
  }
  // (a clump: a square body with its corners knocked off, a lighter pixel on top, a darker one under)
  ctx.fillStyle = p.color;
  ctx.fillRect(px - s / 2, py - s / 2 + 2, s, Math.max(2, s - 4));
  ctx.fillRect(px - s / 2 + 2, py - s / 2, Math.max(2, s - 4), s);
  if (s >= 6) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)'; ctx.fillRect(px - s / 2 + 2, py - s / 2, Math.max(2, s / 2), 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; ctx.fillRect(px - s / 2 + 2, py + s / 2 - 2, Math.max(2, s - 4), 2);
  }
};

/** How bright a colour is (0..1), cached by its string: '#rrggbb' or 'rgb(a)(r, g, b, ...)'. */
const lumCache = new Map<string, number>();
const luminance = (c: string) => {
  let v = lumCache.get(c);
  if (v !== undefined) return v;
  let r = 0, g = 0, b = 0;
  if (c[0] === '#' && c.length >= 7) { r = parseInt(c.slice(1, 3), 16); g = parseInt(c.slice(3, 5), 16); b = parseInt(c.slice(5, 7), 16); }
  else { const m = c.match(/[\d.]+/g); if (m) { r = +m[0]; g = +m[1]; b = +m[2]; } }
  v = (Math.max(r, g, b) * 0.6 + (0.299 * r + 0.587 * g + 0.114 * b) * 0.4) / 255;
  if (lumCache.size < 500) lumCache.set(c, v);
  return v;
};

/** Flying blood: a droplet stretched along its path, with a wet highlight. */
const drawDroplet = (ctx: CanvasRenderingContext2D, p: Particle, x: number, y: number, r: number) => {
  const speed = Math.hypot(p.vel.x, p.vel.y);
  const stretch = 1 + Math.min(2.2, speed * 0.12);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.atan2(p.vel.y, p.vel.x));
  ctx.fillStyle = p.color;
  ctx.beginPath();
  // Teardrop: round head leading, pointed tail behind
  ctx.moveTo(-r * stretch * 1.4, 0);
  ctx.quadraticCurveTo(-r * 0.2, -r, r * 0.6, -r * 0.85);
  ctx.arc(r * 0.6, 0, r * 0.85, -Math.PI / 2, Math.PI / 2);
  ctx.quadraticCurveTo(-r * 0.2, r, -r * stretch * 1.4, 0);
  ctx.fill();
  if (r > 2) {
    ctx.fillStyle = GLOSS;
    ctx.beginPath();
    ctx.arc(r * 0.7, -r * 0.3, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

/** Blood that's landed: an irregular splat with spatter around it and a thick drip. */
const drawSplat = (ctx: CanvasRenderingContext2D, p: Particle, x: number, y: number, r: number) => {
  const onFloor = !!p.isSplat;
  // Floor splats spread out into a flat puddle; wall/ceiling ones stay round
  const big = r * (onFloor ? 2.4 : 1.4);
  // (one that's come down near the edge of what it's on is cut off there: none of it hangs off a ledge or up a wall)
  const on = p.splatOn;
  if (onFloor && on?.cols && on.x0 !== undefined) {
    const lo = on.x0, hi = on.x0 + on.cols.length * 2, reach = big * 2.3 + r;
    if (x - reach < lo || x + reach > hi) {
      ctx.save();
      ctx.beginPath(); ctx.rect(lo, y - reach - 40, hi - lo, reach * 2 + 80); ctx.clip();
      paintSplat(ctx, p, x, y, r, onFloor, big);
      ctx.restore();
      return;
    }
  }
  paintSplat(ctx, p, x, y, r, onFloor, big);
};

const paintSplat = (ctx: CanvasRenderingContext2D, p: Particle, x: number, y: number, r: number, onFloor: boolean, big: number) => {
  ctx.fillStyle = p.color;
  ctx.beginPath();
  const points = 9;
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const rr = big * (0.65 + hash(p, i) * 0.55);
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * (onFloor ? 0.35 : 1);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  // Spatter
  for (let k = 0; k < 3; k++) {
    const a = hash(p, 20 + k) * Math.PI * 2, d = big * (1.3 + hash(p, 30 + k));
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * (onFloor ? 0.35 : 1), Math.max(1, r * 0.3 * hash(p, 40 + k) + 0.8), 0, Math.PI * 2);
    ctx.fill();
  }
  // Stuck to a wall or ceiling: a drip running down
  if (!onFloor && hash(p, 50) > 0.5) {
    const len = big * (1.5 + hash(p, 51) * 2.5);
    ctx.fillRect(x - r * 0.25, y, r * 0.5, len);
    ctx.beginPath();
    ctx.arc(x, y + len, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }
  // Dark wet centre
  ctx.fillStyle = 'rgba(40, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y, big * 0.45, big * 0.45 * (onFloor ? 0.35 : 1), 0, 0, Math.PI * 2);
  ctx.fill();
};

/** Glass and ice shards: little spinning triangles. */
const drawShard = (ctx: CanvasRenderingContext2D, p: Particle, x: number, y: number, r: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(hash(p, 1) * Math.PI * 2 + p.life * 0.15);
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.moveTo(-r, -r * 0.6);
  ctx.lineTo(r * 1.2, -r * 0.2);
  ctx.lineTo(-r * 0.3, r);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
};

/** A glob of the molten stream: a crust round a glowing core, the core cooling from white-hot to dull red as it goes
 * (and the crust taking over); landed, it's a flat little pool doing the same. */
const drawMoltenGlob = (ctx: CanvasRenderingContext2D, p: Particle, x: number, y: number, r: number) => {
  const heat = Math.max(0, Math.min(1, p.life / 90));
  const core = heat > 0.66 ? '#FFF1A8' : heat > 0.4 ? '#FFC23D' : heat > 0.2 ? '#F2541B' : '#8B1A0A';
  ctx.save();
  if (p.isSplat) {
    ctx.fillStyle = '#3A1208'; ctx.beginPath(); ctx.ellipse(x, y + r * 0.5, r * 1.8, r * 0.55, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = core; ctx.beginPath(); ctx.ellipse(x, y + r * 0.45, r * 1.2 * (0.4 + heat * 0.6), r * 0.32, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    // (stretched along the way it's falling)
    ctx.translate(x, y); ctx.rotate(Math.atan2(p.vel.y, p.vel.x));
    const st = 1 + Math.min(1, Math.hypot(p.vel.x, p.vel.y) * 0.1);
    ctx.fillStyle = '#3A1208'; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.1 * st, r * 1.05, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = core; ctx.beginPath(); ctx.ellipse(r * 0.15, 0, r * 0.75 * st * (0.5 + heat * 0.5), r * 0.7 * (0.5 + heat * 0.5), 0, 0, Math.PI * 2); ctx.fill();
    if (heat > 0.5) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(r * 0.2, -r * 0.35, 1.5, 1.5); }
  }
  ctx.restore();
};
