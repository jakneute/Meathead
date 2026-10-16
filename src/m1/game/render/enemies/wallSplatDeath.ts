// Draws the wall-splatted (see game/enemies/wallSplatDeath.ts): a big wet splat of him across the wall where he hit
// (thrown out round its edge in spikes and flecks, lumps of him in it, flattest against the wall and bulging a little out
// from it), fat gooey runs oozing down the wall from it (the death text's goo: thick at the top, wobbling, a bead
// swelling on the end), the meat sliding after them on smears of its own, the pool spreading at the foot. Stepped
// shading: a dark edge, the red, a lighter core, a wet glint.

import type { EnemyDeath } from '../../enemies/deaths';
import { WALLSPLAT_FRAMES, WALLSPLAT_FADE, type GooRun } from '../../enemies/wallSplatDeath';

type Ctx = CanvasRenderingContext2D;

const BLOOD = ['#2A0404', '#5A0A0A', '#8B1010', '#B91C1C', '#DC2626', '#F87171'];
const h01 = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** One run down the wall from `top`, `L` long so far: wide where it leaves the splat, wobbling, the bead on the end. */
const goo = (ctx: Ctx, cx: number, top: number, L: number, run: GooRun, t: number) => {
  const { w, br, seed } = run;
  const hang = Math.min(1, 0.4 + (Math.sin(t * 0.05 + seed) + 1) * 0.3);
  const bead = top + L + br * hang * 0.5;
  const half = (y: number) => {
    const k = y / Math.max(1, L);
    const lip = w * 1.2 * Math.exp(-y / 4);
    const body = (w / 2) * (1.3 - 0.6 * k) + Math.sin(y * 0.4 + seed) * 0.5 + Math.sin(y * 0.15 + seed * 2 + t * 0.03) * 0.4;
    const neck = y > L - br * 2 ? (w / 2) * (1 - hang * 0.45) : Infinity;
    return Math.max(0.7, Math.min(body, neck) + lip);
  };
  const outline = (grow: number, shift: number, scale: number) => {
    ctx.beginPath();
    ctx.moveTo(cx + shift - (half(0) * scale + grow), top);
    for (let y = 0; y <= L; y += 2) ctx.lineTo(cx + shift - (half(y) * scale + grow), top + y);
    ctx.arc(cx + shift, bead, br * scale + grow, Math.PI, 0, true);
    for (let y = Math.floor(L / 2) * 2; y >= 0; y -= 2) ctx.lineTo(cx + shift + half(y) * scale + grow, top + y);
    ctx.closePath(); ctx.fill();
  };
  ctx.fillStyle = BLOOD[0]; outline(1, 0, 1);
  ctx.fillStyle = BLOOD[2]; outline(0, 0, 1);
  ctx.fillStyle = BLOOD[3]; outline(0, -0.5, 0.55);
  ctx.fillStyle = BLOOD[5];
  for (let y = 3; y < L - 2; y++) if (Math.sin(y * 0.3 + seed) > 0.3) ctx.fillRect(Math.round(cx - half(y) * 0.35), Math.round(top + y), 1, 1);
  ctx.fillRect(Math.round(cx - br * 0.45), Math.round(bead - br * 0.4), 1, 2);
};

export const drawWallSplat = (ctx: Ctx, d: EnemyDeath) => {
  const ws = d.ws;
  if (!ws) return;
  const { wx, side, cy, r, seed } = ws;
  ctx.globalAlpha = Math.max(0, Math.min(1, (WALLSPLAT_FRAMES - d.t) / WALLSPLAT_FADE));
  const t = d.t;
  // (it hits and spreads: a few frames out to its full size)
  const grow = Math.min(1, 0.45 + t / 8);
  const bottom = ws.foot ?? cy + 260;

  // The pool at the foot, spreading as the runs get there
  if (ws.foot !== null) {
    const arrived = ws.runs.filter(run => (t - run.start) * run.speed >= run.max - 1).length;
    const pw = Math.min(r * 2.2, arrived * r * 0.35 + Math.max(0, t - 200) * 0.03);
    if (pw > 1) {
      const px = wx - side * r * 0.3, py = ws.foot;
      ctx.fillStyle = BLOOD[0]; ctx.beginPath(); ctx.ellipse(px, py - 1, pw / 2 + 1, 4, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = BLOOD[2]; ctx.beginPath(); ctx.ellipse(px, py - 1, pw / 2, 3, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = BLOOD[4]; ctx.fillRect(Math.round(px - pw * 0.2), py - 3, Math.max(1, Math.round(pw * 0.15)), 1);
    }
  }

  // The runs down the wall
  for (const run of ws.runs) {
    const L = Math.min(run.max, Math.max(0, (t - run.start) * run.speed));
    if (L < 1) continue;
    goo(ctx, wx + run.dx, cy + run.top, L, run, t);
  }

  // The meat sliding after them, a smear above each lump
  for (const c of ws.chunks) {
    if (c.y > c.y0 + 2) {
      ctx.fillStyle = BLOOD[1]; ctx.fillRect(Math.round(c.x - c.r * 0.45), Math.round(c.y0), Math.max(1, Math.round(c.r * 0.9)), Math.round(c.y - c.y0));
    }
    const y = Math.min(c.y, bottom - c.r);
    ctx.fillStyle = BLOOD[0]; ctx.beginPath(); ctx.arc(c.x, y, c.r + 1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.col; ctx.beginPath(); ctx.arc(c.x, y, c.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(Math.round(c.x - c.r * 0.4), Math.round(y - c.r * 0.5), 1, 1);
  }

  // The splat itself: flattest into the wall (most of it over the wall's face), a bulge out from it, spikes and flecks
  const N = 30;
  const radius = (k: number) => {
    const a = (k / N) * Math.PI * 2;
    const into = -Math.cos(a) * side > 0;
    const spike = h01(seed + k * 3.1) > 0.72 ? 1.5 + h01(seed + k) * 0.6 : 0.78 + h01(seed + k * 1.7) * 0.32;
    // (down's longer: it's running)
    const down = Math.sin(a) > 0 ? 1 + Math.sin(a) * 0.25 : 1;
    return { a, rr: r * grow * spike * down * (into ? 1 : 0.42) };
  };
  const ox = wx - side * r * 0.25;
  const blob = (g: number, sc: number, dx: number, dy: number) => {
    ctx.beginPath();
    for (let k = 0; k <= N; k++) {
      const { rr } = radius(k % N), a = (k / N) * Math.PI * 2;
      const x = ox + dx + Math.cos(a) * (rr * sc + g), y = cy + dy + Math.sin(a) * (rr * sc + g) * 0.95;
      if (k === 0) ctx.moveTo(x, y);
      else {
        // (curved in between the points, pinched a little: the spikes come to points)
        const ma = a - Math.PI / N, mr = Math.min(rr, radius(k - 1).rr) * 0.8 * sc + g;
        ctx.quadraticCurveTo(ox + dx + Math.cos(ma) * mr, cy + dy + Math.sin(ma) * mr * 0.95, x, y);
      }
    }
    ctx.closePath(); ctx.fill();
  };
  ctx.fillStyle = BLOOD[0]; blob(1.5, 1, 0, 0);
  ctx.fillStyle = BLOOD[2]; blob(0, 1, 0, 0);
  ctx.fillStyle = BLOOD[3]; blob(0, 0.6, -side * 2, -2);
  ctx.fillStyle = BLOOD[4]; blob(0, 0.28, -side * 4, -4);
  // (flecks thrown out round it, mostly along the wall)
  for (let k = 0; k < 14; k++) {
    const a = h01(seed + k * 5.3) * Math.PI * 2, dist = r * grow * (1.1 + h01(seed + k * 2.9) * 0.9);
    let fx = Math.cos(a) * dist; const fy = Math.sin(a) * dist;
    if (fx * side > 0) fx *= 0.3;
    const s = 1.5 + h01(seed + k * 4.1) * 2.5;
    ctx.fillStyle = BLOOD[0]; ctx.beginPath(); ctx.arc(ox + fx, cy + fy, s + 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = BLOOD[2]; ctx.beginPath(); ctx.arc(ox + fx, cy + fy, s, 0, Math.PI * 2); ctx.fill();
  }
  // (lumps of him in it: meat, fat, a bit of bone)
  for (let k = 0; k < 4; k++) {
    const a = h01(seed + k * 7.7) * Math.PI * 2, dist = r * 0.45 * h01(seed + k * 3.3);
    const lx = ox + Math.cos(a) * dist * (Math.cos(a) * side > 0 ? 0.4 : 1), ly = cy + Math.sin(a) * dist, lr = 2.5 + h01(seed + k) * 3;
    ctx.fillStyle = BLOOD[0]; ctx.beginPath(); ctx.arc(lx, ly, lr + 1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = k === 3 ? '#E8DCC8' : k % 2 ? '#F0A3A3' : '#B45353'; ctx.beginPath(); ctx.arc(lx, ly, lr, 0, Math.PI * 2); ctx.fill();
  }
  // (wet glints)
  ctx.fillStyle = BLOOD[5];
  for (let k = 0; k < 6; k++) ctx.fillRect(Math.round(ox - side * r * 0.2 + (h01(seed + k * 9.1) - 0.5) * r * 0.9), Math.round(cy - r * 0.3 + (h01(seed + k * 6.7) - 0.5) * r * 0.8), 1, 2);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillRect(Math.round(ox - side * 3), Math.round(cy - r * 0.35), 2, 1);
  ctx.globalAlpha = 1;
};
