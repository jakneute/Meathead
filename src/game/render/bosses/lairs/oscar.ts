// Oscar's dealership, out in the field: a showroom of plate glass onto the oil field at dusk (pumpjacks nodding,
// derricks, a flare stack going), sale signs painted on the glass, pennants strung across the ceiling, wood
// panelling under the windows, a wacky waving tube man, a pyramid of barrels with a price on it, a water cooler full
// of crude, a wall of EMPLOYEE OF THE MONTH (all Oscar), the NO SMOKING signs he smokes under (an ashtray full under
// each), and a showroom floor of checker tile with the oil worked into it. Two screens wide.

import { bandedGradient, checker, steppedGlow, pixelRidge } from '../../pixelArt';
import { Ctx, hash, box, bevel, label } from './kit';

/** A pumpjack in silhouette, nodding. */
const pumpjack = (ctx: Ctx, x: number, base: number, s: number, f: number, phase: number) => {
  const a = Math.sin(f * 0.04 + phase) * 0.28;
  ctx.fillStyle = '#1A0F0C';
  ctx.beginPath(); ctx.moveTo(x - 4 * s, base); ctx.lineTo(x, base - 26 * s); ctx.lineTo(x + 4 * s, base); ctx.closePath(); ctx.fill();
  ctx.fillRect(x - 16 * s, base - 2 * s, 34 * s, 2 * s);
  ctx.save(); ctx.translate(x, base - 26 * s); ctx.rotate(a);
  ctx.fillRect(-22 * s, -2 * s, 40 * s, 4 * s);
  ctx.fillRect(16 * s, -6 * s, 6 * s, 14 * s);
  ctx.restore();
  ctx.fillRect(x + 20 * s, base - 24 * s + a * 18 * s, 1.5 * s, 24 * s - a * 18 * s);
};

/** A wacky waving inflatable tube man. */
const tubeMan = (ctx: Ctx, x: number, base: number, f: number) => {
  box(ctx, x - 12, base - 10, 24, 10, '#374151');
  const segs = 9;
  let px = x, py = base - 10, ang = -Math.PI / 2;
  const pts: [number, number][] = [];
  for (let i = 0; i < segs; i++) {
    ang += Math.sin(f * 0.18 + i * 0.7) * 0.22 + Math.sin(f * 0.07 + i) * 0.1;
    px += Math.cos(ang) * 12; py += Math.sin(ang) * 12;
    pts.push([px, py]);
  }
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#EA580C'; ctx.lineWidth = 12;
  ctx.beginPath(); ctx.moveTo(x, base - 10); pts.forEach(([a, b]) => ctx.lineTo(a, b)); ctx.stroke();
  ctx.strokeStyle = '#FB923C'; ctx.lineWidth = 4; ctx.stroke();
  // arms off the middle, flailing
  const [mx, my] = pts[4];
  for (const s of [-1, 1]) {
    ctx.strokeStyle = '#EA580C'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(mx, my);
    ctx.quadraticCurveTo(mx + s * 16, my - 10 + Math.sin(f * 0.3 + s) * 12, mx + s * 26, my - 20 + Math.sin(f * 0.25 + s * 2) * 20); ctx.stroke();
  }
  ctx.lineCap = 'butt';
  // the face on top
  const [hx, hy] = pts[segs - 1];
  box(ctx, hx - 4, hy - 2, 2, 2, '#111'); box(ctx, hx + 2, hy - 2, 2, 2, '#111'); box(ctx, hx - 3, hy + 3, 6, 2, '#111');
};

/** A NO SMOKING sign, scorched, and the ashtray full under it. */
const noSmoking = (ctx: Ctx, sx: number, sy: number) => {
  bevel(ctx, sx - 22, sy - 22, 44, 56, '#ECEFF1', '#FFFFFF', '#90A4AE');
  box(ctx, sx - 10, sy - 2, 18, 5, '#FAFAFA'); box(ctx, sx + 8, sy - 2, 3, 5, '#FF7043');
  ctx.strokeStyle = '#D32F2F'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(sx, sy, 16, 0, Math.PI * 2); ctx.moveTo(sx - 11, sy - 11); ctx.lineTo(sx + 11, sy + 11); ctx.stroke();
  label(ctx, 'NO', sx, sy + 24, '#212121', 6); label(ctx, 'SMOKING', sx, sy + 31, '#212121', 6);
  // scorched at a corner
  checker(ctx, sx + 8, sy - 22, 14, 12, 'rgba(40, 20, 10, 0.6)', 0); box(ctx, sx + 14, sy - 22, 8, 6, 'rgba(40, 20, 10, 0.5)');
};

export const drawOscarLair = (ctx: Ctx, L: number, R: number, T: number, B: number, f: number) => {
  const W = R - L;
  const wy = T + 30, wh = 210; // the band of windows
  // The field through the glass: dusk, smog
  ctx.save(); ctx.beginPath(); ctx.rect(L, wy, W, wh); ctx.clip();
  bandedGradient(ctx, L, wy, W, wh, ['#2B1430', '#5B1F3A', '#A63A2E', '#E0702A', '#F2A541'], 14);
  steppedGlow(ctx, L + W * 0.7, wy + wh - 30, 90, '#FFD27A', 0.35, 0.05, 5);
  // far rigs on a low ridge
  pixelRidge(ctx, L, R, wy + wh, x => wy + wh - 40 - Math.sin(x * 0.01) * 8 - Math.sin(x * 0.033) * 4, 0, { fill: '#5A2A2A', rim: '#7A3A30' });
  for (let k = 0; k < 9; k++) {
    const x = L + 60 + k * (W / 9) + hash(k) * 40, base = wy + wh - 38;
    ctx.fillStyle = '#4A2226';
    ctx.beginPath(); ctx.moveTo(x - 12, base); ctx.lineTo(x - 2, base - 70); ctx.lineTo(x + 2, base - 70); ctx.lineTo(x + 12, base); ctx.closePath(); ctx.fill();
    for (let j = 1; j < 5; j++) box(ctx, x - 12 + j * 2.5, base - j * 14, 24 - j * 5, 1, '#4A2226');
  }
  // the near field: tank, flare stack, pumpjacks nodding
  pixelRidge(ctx, L, R, wy + wh, x => wy + wh - 18 - Math.sin(x * 0.02 + 1) * 4, 0, { fill: '#1A0F0C', rim: '#3A2018' });
  for (let k = 0; k < 7; k++) pumpjack(ctx, L + 80 + k * (W / 7) + hash(k + 5) * 50, wy + wh - 16, 1.3, f, k * 1.3);
  for (const tx of [L + W * 0.33, L + W * 0.82]) { box(ctx, tx - 30, wy + wh - 60, 60, 44, '#1A0F0C'); ctx.fillStyle = '#1A0F0C'; ctx.beginPath(); ctx.ellipse(tx, wy + wh - 60, 30, 6, 0, Math.PI, 0); ctx.fill(); }
  const fx = L + W * 0.55, fy = wy + 40;
  box(ctx, fx - 3, fy, 6, wh - 50, '#1A0F0C');
  const fh = 22 + Math.sin(f * 0.2) * 6 + Math.sin(f * 0.53) * 3;
  steppedGlow(ctx, fx, fy - fh / 2, 40, '#FF8A1F', 0.25, 0, 4);
  ctx.fillStyle = '#FF5722'; ctx.beginPath(); ctx.moveTo(fx - 6, fy); ctx.quadraticCurveTo(fx - 10, fy - fh * 0.6, fx + Math.sin(f * 0.3) * 3, fy - fh); ctx.quadraticCurveTo(fx + 10, fy - fh * 0.6, fx + 6, fy); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#FFEB3B'; ctx.beginPath(); ctx.moveTo(fx - 3, fy); ctx.quadraticCurveTo(fx, fy - fh * 0.5, fx, fy - fh * 0.65); ctx.quadraticCurveTo(fx, fy - fh * 0.5, fx + 3, fy); ctx.fill();
  for (let k = 0; k < 4; k++) { const t = (f * 0.5 + k * 20) % 80; box(ctx, fx + t * 0.8 - 6, fy - fh - t * 0.6, 8 + t * 0.2, 6 + t * 0.15, `rgba(30, 18, 16, ${(0.5 - t / 160).toFixed(2)})`); }
  ctx.restore();

  // The glass: mullions, a sill, sale signs painted on it, a shine
  for (let x = L; x <= R; x += 120) { box(ctx, x - 3, wy, 6, wh, '#3A2A22'); box(ctx, x - 3, wy, 1, wh, '#6B4E3E'); }
  box(ctx, L, wy - 6, W, 6, '#3A2A22'); box(ctx, L, wy + wh, W, 8, '#4A3428'); box(ctx, L, wy + wh, W, 2, '#7A5A44');
  const signs: [string, string][] = [['EVERYTHING', 'MUST GO!'], ['0% FRICTION', 'FINANCING'], ['PRE-OWNED', 'DERRICKS'], ["I'LL GREASE", 'ANY DEAL'], ['NO MONEY', 'DOWN!']];
  signs.forEach(([a, b], i) => {
    const sx = L + 120 + i * (W - 200) / (signs.length - 1), sy = wy + 50;
    if (sx > R - 60) return;
    ctx.save(); ctx.translate(sx, sy); ctx.rotate((hash(i) - 0.5) * 0.12);
    label(ctx, a, 1, 1, '#7F1D1D', 8); label(ctx, a, 0, 0, '#FFFFFF', 8);
    label(ctx, b, 1, 13, '#7F1D1D', 8); label(ctx, b, 0, 12, '#FDE047', 8);
    ctx.restore();
  });
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let x = L + 30; x < R; x += 240) { ctx.beginPath(); ctx.moveTo(x, wy); ctx.lineTo(x + 40, wy); ctx.lineTo(x - 20, wy + wh); ctx.lineTo(x - 60, wy + wh); ctx.closePath(); ctx.fill(); }

  // The ceiling: acoustic tile, strip lights, and the pennants strung across
  box(ctx, L, T, W, 30, '#D6CFC2'); for (let x = L; x < R; x += 40) box(ctx, x, T, 1, 30, '#A89F90'); box(ctx, L, T + 14, W, 1, '#A89F90');
  for (let x = L + 60; x < R; x += 180) { box(ctx, x, T + 22, 70, 5, '#FFFBEB'); box(ctx, x, T + 27, 70, 2, '#A89F90'); }
  for (let run = 0; run < Math.ceil(W / 240); run++) {
    const x0 = L + run * 240, x1 = Math.min(R, x0 + 240);
    ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, T + 30); ctx.quadraticCurveTo((x0 + x1) / 2, T + 64, x1, T + 30); ctx.stroke();
    for (let k = 1; k < 12; k++) {
      const t = k / 12, x = x0 + (x1 - x0) * t, y = T + 30 + 4 * 34 * t * (1 - t) * 0.5 * 2;
      const flap = Math.sin(f * 0.1 + k + run) * 2;
      ctx.fillStyle = ['#DC2626', '#FACC15', '#2563EB', '#FFFFFF'][(k + run) % 4];
      ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y); ctx.lineTo(x + flap, y + 14); ctx.closePath(); ctx.fill();
    }
  }

  // Under the windows: wood panelling
  const py = wy + wh + 8;
  box(ctx, L, py, W, B - 14 - py, '#6B4423');
  for (let x = L; x < R; x += 16) { box(ctx, x, py, 2, B - 14 - py, '#4A2E16'); box(ctx, x + 2, py, 1, B - 14 - py, '#8A5A30'); if (hash(x) > 0.6) box(ctx, x + 6, py + 20 + hash(x + 1) * 60, 3, 10, '#5C3A1E'); }
  box(ctx, L, py, W, 4, '#3A2414');

  // Employee of the month: every month, him
  const ex = L + 80;
  label(ctx, 'EMPLOYEE OF THE MONTH', ex + 150, py + 16, '#FDE047', 6);
  ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG'].forEach((m, i) => {
    const x = ex + i * 38, y = py + 24;
    bevel(ctx, x, y, 32, 40, '#B8862E', '#F2C46D', '#6B4A16', 2);
    box(ctx, x + 3, y + 3, 26, 28, '#93C5FD');
    box(ctx, x + 10, y + 10, 12, 12, '#C08A5B'); box(ctx, x + 8, y + 6, 16, 5, '#7C4A1E'); box(ctx, x + 6, y + 9, 20, 2, '#7C4A1E');
    box(ctx, x + 12, y + 18, 8, 1, '#3A1A0A'); box(ctx, x + 20, y + 17, 5, 1, '#F5F5F4'); box(ctx, x + 25, y + 17, 1, 1, '#FF7043');
    box(ctx, x + 8, y + 22, 16, 9, '#E5E7EB');
    label(ctx, m, x + 16, y + 38, '#3A1A0A', 4);
  });

  // The NO SMOKING signs (one a screen) with the ashtray full under each
  for (let k = 0; k < Math.max(1, Math.round(W / 720)); k++) {
    const sx = L + 420 + k * 720, sy = py + 50;
    if (sx > R - 60) continue;
    noSmoking(ctx, sx, sy);
    box(ctx, sx - 14, B - 30, 28, 6, '#57534E'); box(ctx, sx - 14, B - 30, 28, 1, '#A8A29E');
    for (let j = 0; j < 7; j++) box(ctx, sx - 11 + j * 3.5, B - 33 - (j % 3), 4, 2, j % 2 ? '#F5F5F4' : '#D6D3D1');
    box(ctx, sx - 2, B - 24, 4, 10, '#44403C');
  }

  // The barrel pyramid, priced
  const bx = L + W * 0.62;
  for (let r = 0; r < 3; r++) for (let k = 0; k < 3 - r; k++) {
    const x = bx + k * 30 + r * 15, y = B - 14 - (r + 1) * 36;
    bevel(ctx, x, y, 28, 36, '#1C1917', '#57534E', '#0C0A09');
    box(ctx, x, y + 8, 28, 3, '#44403C'); box(ctx, x, y + 26, 28, 3, '#44403C');
    box(ctx, x + 4, y + 2, 3, 30, 'rgba(255,255,255,0.12)');
  }
  ctx.save(); ctx.translate(bx + 45, B - 128); ctx.rotate(-0.08);
  bevel(ctx, -28, -12, 56, 22, '#FDE047', '#FEF9C3', '#A16207', 1); label(ctx, '$49.99', 0, -1, '#B91C1C', 7); label(ctx, 'PER BBL', 0, 7, '#1C1917', 4);
  ctx.restore();

  // A water cooler. Of crude.
  const wx = L + W * 0.48;
  bevel(ctx, wx - 14, B - 64, 28, 50, '#E7E5E4', '#FFFFFF', '#A8A29E');
  box(ctx, wx - 4, B - 46, 8, 4, '#3B82F6'); box(ctx, wx + 2, B - 46, 4, 4, '#EF4444');
  ctx.fillStyle = 'rgba(20, 12, 8, 0.85)'; ctx.beginPath(); ctx.ellipse(wx, B - 82, 14, 18, 0, 0, Math.PI * 2); ctx.fill();
  box(ctx, wx - 9, B - 94, 3, 16, 'rgba(255,255,255,0.3)');
  const bub = (f * 0.6) % 30; box(ctx, wx + 2, B - 70 - bub, 3, 3, 'rgba(90, 70, 50, 0.9)');
  box(ctx, wx - 5, B - 104, 10, 6, '#1C1917');

  // The tube man, by the far window
  tubeMan(ctx, L + W * 0.88, B - 14, f);

  // The side columns: steel, rusted, oil down them
  for (const x of [L, R - 24]) {
    bevel(ctx, x, T, 24, B - T, '#2B211D', '#5D4037', '#120D0B');
    for (let y = T + 15; y < B - 15; y += 35) { box(ctx, x + 5, y, 3, 3, '#A16207'); box(ctx, x + 16, y, 3, 3, '#A16207'); }
    box(ctx, x + 6, T + 60, 5, 120, '#0A0605'); box(ctx, x + 7, T + 180, 3, 12, '#0A0605');
  }

  // The floor: showroom checker, the oil worked into it (real slicks are drawn on top)
  for (let x = L, i = 0; x < R; x += 14, i++) {
    box(ctx, x, B - 14, 14, 7, i % 2 ? '#D6CFC2' : '#6B4423');
    box(ctx, x, B - 7, 14, 7, i % 2 ? '#6B4423' : '#D6CFC2');
  }
  box(ctx, L, B - 15, W, 2, '#3A2414');
  for (let k = 0; k < Math.round(W / 60); k++) { const x = L + hash(k + 70) * W; box(ctx, x, B - 12, 20 + hash(k) * 30, 3 + hash(k + 1) * 6, 'rgba(10, 6, 5, 0.45)'); }
};
