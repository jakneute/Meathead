// Ernie's vault under the old fort on Alcatraz: 1850s brick, whitewash coming off it, two arched bays at the back
// (an old iron cell door in one, his archive of seismograph rolls in the other), timbers propping the wall where
// it's cracked, caged bulbs on cords, his drum seismograph scratching away on a table, the quake schedule on a
// chalkboard (worked round the tours), the city's unpaid invoices on a corkboard, and a square of lawn he's told
// everyone to keep off. The floor is bedrock with the fault running through it.

import { bandedGradient, brickPattern, checker, pixelBlob } from '../../pixelArt';
import { Ctx, hash, box, bevel, label, hangingLight } from './kit';

/** An arched bay set into the brick: dark inside, a ring of voussoirs round the top. */
const bay = (ctx: Ctx, x: number, w: number, top: number, bottom: number, inside: () => void) => {
  const r = w / 2, cy = top + r;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(x, bottom); ctx.lineTo(x, cy); ctx.arc(x + r, cy, r, Math.PI, 0); ctx.lineTo(x + w, bottom); ctx.closePath();
  ctx.fillStyle = '#140B08'; ctx.fill();
  ctx.clip();
  inside();
  ctx.restore();
  // the voussoirs
  for (let k = 0; k <= 12; k++) {
    const a = Math.PI + (k / 12) * Math.PI;
    const x0 = x + r + Math.cos(a) * (r + 2), y0 = cy + Math.sin(a) * (r + 2);
    ctx.save(); ctx.translate(x0, y0); ctx.rotate(a + Math.PI / 2);
    box(ctx, -5, -10, 10, 10, k % 2 ? '#8A4A34' : '#9C5840'); box(ctx, -5, -10, 10, 2, '#B87058');
    ctx.restore();
  }
  box(ctx, x - 6, cy, 6, bottom - cy, '#7A4030'); box(ctx, x + w, cy, 6, bottom - cy, '#5E3022');
};

export const drawErnieLair = (ctx: Ctx, L: number, R: number, T: number, B: number, f: number) => {
  const W = R - L, cx = L + W / 2;
  // Brick, darkening up into the vault
  ctx.fillStyle = brickPattern(ctx, 'ernie-fort', 28, 10, ['#7A4232', '#6E3A2C'], '#3E241A');
  ctx.fillRect(L, T, W, B - T);
  // whitewash coming away in patches
  for (let k = 0; k < 9; k++) {
    const x = L + 40 + hash(k + 3) * (W - 120), y = T + 120 + hash(k + 11) * (B - T - 220), w = 30 + hash(k + 5) * 60, h = 16 + hash(k + 7) * 30;
    pixelBlob(ctx, x + w / 2, y + h / 2, w / 2, h / 2, 'rgba(226, 216, 196, 0.16)');
    pixelBlob(ctx, x + w * 0.3, y + h * 0.4, w / 4, h / 3, 'rgba(226, 216, 196, 0.14)');
  }
  // the vault's shadow up top (banded, see-through)
  for (let k = 0; k < 6; k++) box(ctx, L, T + k * 14, W, 14, `rgba(12, 6, 4, ${0.7 - k * 0.11})`);

  // Two bays at the back
  bay(ctx, L + 60, 130, T + 110, B - 14, () => {
    // an old cell door: iron bars, a plate, the dark behind
    bandedGradient(ctx, L + 60, T + 110, 130, B - T - 124, ['#0A0504', '#1A0E0A', '#22130D'], 6);
    for (let x = L + 74; x < L + 186; x += 12) { box(ctx, x, T + 150, 4, B - T - 164, '#3B3B3E'); box(ctx, x, T + 150, 1, B - T - 164, '#6B6B70'); }
    box(ctx, L + 66, T + 190, 118, 6, '#3B3B3E'); box(ctx, L + 66, B - 70, 118, 6, '#3B3B3E');
    box(ctx, L + 100, T + 166, 50, 14, '#57534E'); label(ctx, 'CELL 1859', L + 125, T + 176, '#D6D3D1', 5);
  });
  bay(ctx, R - 190, 130, T + 110, B - 14, () => {
    // his archive: shelves of seismograph rolls, labelled by year
    bandedGradient(ctx, R - 190, T + 110, 130, B - T - 124, ['#0A0504', '#1A0E0A', '#22130D'], 6);
    for (let s = 0; s < 6; s++) {
      const y = T + 170 + s * 46;
      if (y > B - 40) break;
      box(ctx, R - 186, y, 122, 4, '#5C3A1E'); box(ctx, R - 186, y, 122, 1, '#8A5A30');
      for (let k = 0; k < 9; k++) {
        const rx = R - 182 + k * 13, rh = 18 + hash(k + s * 9) * 18;
        box(ctx, rx, y - rh, 10, rh, hash(k * 3 + s) > 0.5 ? '#E7E0CC' : '#D6CDB4'); box(ctx, rx, y - rh, 10, 2, '#FFFFFF');
        box(ctx, rx + 2, y - rh + 4, 6, 1, '#7F1D1D');
      }
    }
  });

  // Cracks in the brick, and timbers propping it
  ctx.strokeStyle = '#1A0E0A'; ctx.lineWidth = 2;
  for (const [x0, y0, len, s] of [[L + 250, T + 70, 140, 1], [R - 260, T + 90, 120, -1], [cx + 30, T + 30, 80, 1]] as const) {
    ctx.beginPath(); ctx.moveTo(x0, y0);
    for (let k = 1; k <= 6; k++) ctx.lineTo(x0 + s * (hash(k + x0) * 18 - 4) + s * k * 3, y0 + (len * k) / 6);
    ctx.stroke();
  }
  for (const [x, dir] of [[L + 236, 1], [R - 236, -1]] as const) {
    ctx.save(); ctx.translate(x, B - 14); ctx.rotate(dir * -0.32);
    bevel(ctx, -7, -260, 14, 260, '#6B4423', '#8A5A30', '#3E2614');
    for (let y = -250; y < 0; y += 50) box(ctx, -7, y, 14, 2, '#3E2614');
    ctx.restore();
  }

  // The chalkboard: this week's quakes, worked round the tours
  const cbx = cx - 92, cby = T + 66;
  bevel(ctx, cbx - 6, cby - 6, 196, 112, '#6B4423', '#8A5A30', '#3E2614');
  box(ctx, cbx, cby, 184, 100, '#1F2B24'); checker(ctx, cbx, cby, 184, 100, 'rgba(255,255,255,0.03)', 0);
  label(ctx, 'QUAKE SCHEDULE', cbx + 92, cby + 14, '#E7E5E4', 6);
  box(ctx, cbx + 20, cby + 18, 144, 1, 'rgba(231, 229, 228, 0.6)');
  const rows = ['MON 9:00   6.1', 'TUE 11:30  6.4', '  (TOUR AT 12)', 'WED 9:00   7.0', 'THU   AFTERSHOCKS', 'FRI  THE BIG ONE'];
  rows.forEach((t, i) => label(ctx, t, cbx + 12, cby + 32 + i * 11, i === 5 ? '#FCA5A5' : '#D6D3D1', 5, 'left'));
  box(ctx, cbx + 150, cby + 86, 22, 4, '#F5F5F4');

  // His drum seismograph on a table, scratching away (more of it when the room's been shaking)
  const tx = cx - 70, ty = B - 74;
  bevel(ctx, tx, ty, 140, 8, '#6B4423', '#8A5A30', '#3E2614');
  box(ctx, tx + 8, ty + 8, 6, 52, '#4A2E16'); box(ctx, tx + 126, ty + 8, 6, 52, '#4A2E16');
  bevel(ctx, tx + 20, ty - 34, 100, 34, '#3F3F46', '#71717A', '#18181B');
  // the drum, paper going round with the trace on it
  box(ctx, tx + 30, ty - 30, 60, 26, '#F5F0E1');
  ctx.save(); ctx.beginPath(); ctx.rect(tx + 30, ty - 30, 60, 26); ctx.clip();
  ctx.strokeStyle = '#1E3A8A'; ctx.lineWidth = 1;
  for (let line = 0; line < 3; line++) {
    ctx.beginPath();
    for (let x = 0; x <= 60; x += 2) {
      const t = x + f * 0.6, burst = Math.max(0, Math.sin(t * 0.05 + line)) ** 6;
      const y = ty - 24 + line * 8 + Math.sin(t * 1.3 + line) * (0.8 + burst * 4);
      if (x) ctx.lineTo(tx + 30 + x, y); else ctx.moveTo(tx + 30 + x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
  box(ctx, tx + 30, ty - 30, 60, 2, 'rgba(0,0,0,0.25)'); box(ctx, tx + 30, ty - 6, 60, 2, 'rgba(0,0,0,0.25)');
  // the pen arm, twitching
  const pen = ty - 18 + Math.sin(f * 1.3) * 1.5 + Math.max(0, Math.sin(f * 0.05)) ** 6 * 4;
  box(ctx, tx + 90, pen - 1, 26, 2, '#A1A1AA'); box(ctx, tx + 88, pen - 2, 3, 4, '#DC2626');
  label(ctx, 'RICHTER', tx + 105, ty - 24, '#D4D4D8', 4);

  // The corkboard of invoices, unpaid
  const kx = L + 250, ky = T + 200;
  bevel(ctx, kx - 4, ky - 4, 78, 66, '#6B4423', '#8A5A30', '#3E2614');
  box(ctx, kx, ky, 70, 58, '#B08453'); checker(ctx, kx, ky, 70, 58, 'rgba(90, 60, 30, 0.25)', 0);
  for (let k = 0; k < 4; k++) {
    const ix = kx + 4 + (k % 2) * 34, iy = ky + 4 + Math.floor(k / 2) * 28;
    box(ctx, ix, iy, 30, 24, '#F5F5F4');
    for (let j = 0; j < 3; j++) box(ctx, ix + 3, iy + 4 + j * 4, 24, 1, '#A8A29E');
    ctx.save(); ctx.translate(ix + 15, iy + 18); ctx.rotate(-0.25); box(ctx, -12, -3, 24, 7, 'rgba(220, 38, 38, 0.85)'); label(ctx, 'UNPAID', 0, 3, '#FFFFFF', 4); ctx.restore();
    box(ctx, ix + 13, iy - 1, 3, 3, '#DC2626');
  }

  // His square of lawn, right of the table, and the sign about it
  const gx = cx + 110;
  box(ctx, gx, B - 22, 70, 8, '#3F6212');
  for (let x = gx; x < gx + 70; x += 2) box(ctx, x, B - 24 - (hash(x) > 0.5 ? 2 : 0), 1, 3, '#65A30D');
  box(ctx, gx + 44, B - 56, 3, 34, '#78716C');
  bevel(ctx, gx + 24, B - 66, 44, 20, '#F5F5F4', '#FFFFFF', '#A8A29E', 1);
  label(ctx, 'KEEP OFF', gx + 46, B - 58, '#991B1B', 4); label(ctx, 'THE GRASS', gx + 46, B - 51, '#991B1B', 4);
  // (a garden gnome, looking at you)
  box(ctx, gx + 10, B - 34, 8, 10, '#2563EB'); box(ctx, gx + 11, B - 40, 6, 6, '#FCD34D'); box(ctx, gx + 10, B - 48, 8, 8, '#DC2626'); box(ctx, gx + 13, B - 52, 2, 4, '#DC2626');

  // Caged bulbs on cords
  for (const [x, len] of [[L + 140, 70], [cx, 34], [R - 140, 70]] as const) {
    const p = hangingLight(ctx, x, T, len, f, '#FBBF24', 1.4);
    box(ctx, p.x - 4, p.y, 8, 10, '#FDE68A'); box(ctx, p.x - 2, p.y + 2, 4, 6, '#FFFBEB');
    box(ctx, p.x - 5, p.y, 1, 11, '#3F3F46'); box(ctx, p.x + 4, p.y, 1, 11, '#3F3F46'); box(ctx, p.x - 5, p.y + 5, 10, 1, '#3F3F46');
  }
  // Grit sifting down out of the mortar now and then
  for (let k = 0; k < 5; k++) {
    const cyc = 140 + k * 23, t = (f + k * 61) % cyc;
    if (t > 50) continue;
    const x = L + 60 + hash(k + Math.floor((f + k * 61) / cyc) * 5) * (W - 120);
    for (let j = 0; j < 4; j++) box(ctx, x + (j % 2), T + 20 + t * 4 - j * 9, 2, 2, 'rgba(200, 180, 150, 0.6)');
  }

  // The side columns: brick piers with iron straps
  for (const x of [L, R - 24]) {
    ctx.fillStyle = brickPattern(ctx, 'ernie-pier', 12, 8, ['#8A4A34', '#7A4030'], '#3E241A');
    ctx.fillRect(x, T, 24, B - T);
    box(ctx, x, T, 2, B - T, '#A65E44'); box(ctx, x + 22, T, 2, B - T, '#3E241A');
    for (let y = T + 60; y < B - 30; y += 110) { box(ctx, x - 1, y, 26, 6, '#27272A'); box(ctx, x + 4, y + 2, 2, 2, '#71717A'); box(ctx, x + 18, y + 2, 2, 2, '#71717A'); }
  }

  // The floor: bedrock, the fault running through it
  box(ctx, L, B - 14, W, 14, '#3A3330');
  box(ctx, L, B - 14, W, 2, '#5E5550');
  for (let x = L; x < R; x += 34) box(ctx, x + hash(x) * 10, B - 10 + hash(x + 1) * 6, 10, 2, '#2A2421');
  ctx.strokeStyle = '#120E0C'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(L, B - 6);
  for (let x = L; x <= R; x += 20) ctx.lineTo(x, B - 7 + Math.sin(x * 0.07) * 3 + (hash(x) - 0.5) * 3);
  ctx.stroke();
  // dust hanging in the air
  for (let i = 0; i < 16; i++) {
    const dx = L + ((i * 51 + f * 0.25) % W), dy = T + 40 + ((i * 39 + f * 0.3) % (B - T - 60));
    box(ctx, dx, dy, 2, 2, 'rgba(215, 204, 200, 0.35)');
  }
};
