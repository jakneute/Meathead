// Victor's office: the VIP lounge at the top of Club Caldera's atrium. Dark lacquered panelling with gold trim, his
// name in neon, a picture window down over the club (spotlights sweeping, the crowd, the lava glowing up through the
// glass dance floor), the framed front page from when his well lit the island, his own poster, a velvet couch and
// rope, the desk with a lava lamp and bottle service with a sparkler going, a mirror ball throwing light about, a
// black marble floor warm from underneath.

import { bandedGradient, checker, steppedGlow } from '../../pixelArt';
import { Ctx, hash, box, bevel, label, frame as picture } from './kit';

export const drawVictorLair = (ctx: Ctx, L: number, R: number, T: number, B: number, f: number) => {
  const W = R - L, cx = L + W / 2;
  // The panelling: lacquered near-black wine, gold trim between the panels
  bandedGradient(ctx, L, T, W, B - T, ['#12070A', '#1C0B10', '#261016', '#2C1215', '#24100E'], 14);
  for (let x = L + 24; x < R - 24; x += 72) {
    box(ctx, x, T + 20, 1, B - T - 34, '#B8862E'); box(ctx, x + 1, T + 20, 1, B - T - 34, '#3A1A12');
    box(ctx, x + 8, T + 90, 56, 2, '#3A1A12'); box(ctx, x + 8, T + 92, 56, 1, '#5A2A1E');
  }
  // dado rail
  box(ctx, L, B - 120, W, 4, '#B8862E'); box(ctx, L, B - 120, W, 1, '#F2C46D'); box(ctx, L, B - 116, W, 2, '#3A1A12');
  // gold cove light along the ceiling
  box(ctx, L, T, W, 18, '#0C0507'); box(ctx, L, T + 18, W, 3, '#B8862E');
  for (let k = 0; k < 3; k++) box(ctx, L, T + 21 + k * 3, W, 3, `rgba(242, 196, 109, ${0.16 - k * 0.05})`);

  // The window down over the club
  const wx = cx - 150, wy = T + 70, ww = 300, wh = 190;
  ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
  bandedGradient(ctx, wx, wy, ww, wh, ['#0A0306', '#1A0610', '#3A0C14', '#7A1E10', '#D9480F', '#FF8A1F'], 12);
  // spotlights sweeping
  for (let k = 0; k < 4; k++) {
    const a = Math.sin(f * 0.02 + k * 1.7) * 0.6;
    const sx = wx + 40 + k * 75, sy = wy + wh + 10;
    ctx.fillStyle = ['rgba(236, 72, 153, 0.18)', 'rgba(56, 189, 248, 0.16)', 'rgba(250, 204, 21, 0.16)', 'rgba(168, 85, 247, 0.18)'][k];
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.sin(a - 0.12) * 260, sy - 260); ctx.lineTo(sx + Math.sin(a + 0.12) * 260, sy - 260); ctx.closePath(); ctx.fill();
  }
  // the far side of the atrium: balconies, little lit windows
  for (let r = 0; r < 3; r++) {
    box(ctx, wx, wy + 30 + r * 38, ww, 3, '#2A0C10');
    for (let k = 0; k < 14; k++) if (hash(k + r * 20) > 0.45) box(ctx, wx + 8 + k * 21, wy + 18 + r * 38, 6, 8, Math.floor(f / 30 + k + r) % 7 === 0 ? '#FDE68A' : '#F59E0B');
  }
  // the crowd, bobbing, against the lava light
  for (let k = 0; k < 26; k++) {
    const hx = wx + 4 + k * 12 + hash(k) * 6, bob = Math.abs(Math.sin(f * 0.15 + k * 0.9)) * 4;
    box(ctx, hx, wy + wh - 22 - bob, 8, 8, '#1A0608'); box(ctx, hx - 2, wy + wh - 14 - bob, 12, 18, '#1A0608');
    if (k % 4 === 0) box(ctx, hx + 2, wy + wh - 32 - bob - Math.abs(Math.sin(f * 0.15 + k)) * 6, 3, 10, '#1A0608');
  }
  ctx.restore();
  // its frame, mullions, the glass's shine
  bevel(ctx, wx - 8, wy - 8, ww + 16, 8, '#B8862E', '#F2C46D', '#6B4A16');
  bevel(ctx, wx - 8, wy + wh, ww + 16, 10, '#B8862E', '#F2C46D', '#6B4A16');
  box(ctx, wx - 8, wy, 8, wh, '#8A6420'); box(ctx, wx + ww, wy, 8, wh, '#8A6420');
  for (const mx of [wx + ww / 3, wx + (2 * ww) / 3]) box(ctx, mx - 2, wy, 4, wh, '#8A6420');
  ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.beginPath(); ctx.moveTo(wx + 70, wy); ctx.lineTo(wx + 130, wy); ctx.lineTo(wx + 60, wy + wh); ctx.lineTo(wx, wy + wh); ctx.closePath(); ctx.fill();
  ctx.restore();

  // His name in neon over it
  const flick = f % 97 < 3 ? 0.4 : 1;
  steppedGlow(ctx, cx, wy - 34, 110, '#FF4FA3', 0.14 * flick, 0, 4);
  ctx.save(); ctx.globalAlpha = flick;
  ctx.font = '14px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillStyle = '#7A1040'; ctx.fillText('CLUB CALDERA', cx + 2, wy - 26);
  ctx.fillStyle = '#FF7AC0'; ctx.fillText('CLUB CALDERA', cx, wy - 28);
  ctx.fillStyle = '#FFE4F2'; ctx.fillText('CLUB CALDERA', cx, wy - 29);
  ctx.restore(); ctx.textAlign = 'left';

  // Left: his poster. Right: the front page.
  picture(ctx, L + 58, T + 64, 76, 100, '#B8862E', '#F2C46D', () => {
    bandedGradient(ctx, L + 58, T + 64, 76, 100, ['#FF8A1F', '#D9480F', '#7A1E10'], 6);
    const px = L + 96, py = T + 120;
    box(ctx, px - 8, py - 34, 16, 16, '#B45309'); box(ctx, px - 8, py - 36, 16, 4, '#1C0B08');
    box(ctx, px - 16, py - 18, 32, 26, '#C2620F');
    box(ctx, px - 30, py - 30, 12, 8, '#C2620F'); box(ctx, px - 30, py - 44, 8, 16, '#C2620F');
    box(ctx, px + 18, py - 30, 12, 8, '#C2620F'); box(ctx, px + 22, py - 44, 8, 16, '#C2620F');
    box(ctx, px - 12, py + 8, 24, 20, '#F5F5F4');
    label(ctx, 'GEOLOGICAL', px, T + 76, '#FFF7ED', 5); label(ctx, 'MASS', px, T + 158, '#FFF7ED', 6);
  });
  picture(ctx, R - 136, T + 64, 80, 100, '#B8862E', '#F2C46D', () => {
    box(ctx, R - 136, T + 64, 80, 100, '#E7E2D3');
    label(ctx, 'HILO HERALD', R - 96, T + 74, '#1C1917', 5);
    box(ctx, R - 132, T + 77, 72, 1, '#1C1917');
    label(ctx, 'ONE WELL', R - 96, T + 88, '#1C1917', 6); label(ctx, 'LIGHTS', R - 96, T + 97, '#1C1917', 6); label(ctx, 'ISLAND', R - 96, T + 106, '#1C1917', 6);
    box(ctx, R - 130, T + 112, 30, 26, '#78716C'); box(ctx, R - 122, T + 118, 12, 14, '#44403C');
    for (let k = 0; k < 7; k++) box(ctx, R - 96, T + 114 + k * 6, 32, 2, '#A8A29E');
  });

  // The couch and the rope, left
  const sx = L + 40;
  bevel(ctx, sx, B - 92, 150, 34, '#7F1D1D', '#B91C1C', '#450A0A');
  for (let k = 0; k < 3; k++) { box(ctx, sx + 8 + k * 46, B - 88, 42, 26, '#991B1B'); box(ctx, sx + 8 + k * 46, B - 88, 42, 2, '#DC2626'); for (const bx of [sx + 20 + k * 46, sx + 36 + k * 46]) box(ctx, bx, B - 78, 2, 2, '#450A0A'); }
  bevel(ctx, sx - 6, B - 64, 162, 22, '#991B1B', '#DC2626', '#450A0A');
  box(ctx, sx + 4, B - 42, 6, 28, '#1C0B08'); box(ctx, sx + 140, B - 42, 6, 28, '#1C0B08');
  for (const px of [sx + 180, sx + 250]) { bevel(ctx, px - 3, B - 70, 6, 56, '#B8862E', '#F2C46D', '#6B4A16', 1); box(ctx, px - 6, B - 76, 12, 8, '#F2C46D'); box(ctx, px - 8, B - 18, 16, 4, '#B8862E'); }
  ctx.strokeStyle = '#B91C1C'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(sx + 183, B - 66); ctx.quadraticCurveTo(sx + 215, B - 46, sx + 247, B - 66); ctx.stroke();
  ctx.strokeStyle = '#EF4444'; ctx.lineWidth = 1; ctx.stroke();
  label(ctx, 'VIP', sx + 215, B - 78, '#F2C46D', 7);

  // The desk, right: a lava lamp going, bottle service with a sparkler
  const dx = R - 250;
  // the chair behind it
  bevel(ctx, dx + 96, B - 150, 54, 70, '#7F1D1D', '#B91C1C', '#450A0A');
  for (let k = 0; k < 3; k++) for (let j = 0; j < 3; j++) box(ctx, dx + 106 + k * 16, B - 140 + j * 18, 2, 2, '#450A0A');
  bevel(ctx, dx, B - 82, 220, 14, '#1C1012', '#F2C46D', '#0A0506');
  bevel(ctx, dx + 6, B - 68, 208, 54, '#140A0C', '#3A1A12', '#050203');
  box(ctx, dx + 6, B - 60, 208, 2, '#B8862E');
  box(ctx, dx + 90, B - 50, 40, 10, '#B8862E'); label(ctx, 'VICTOR', dx + 110, B - 42.5, '#1C0B08', 5);
  // lava lamp
  const lx = dx + 30;
  box(ctx, lx - 6, B - 90, 12, 8, '#B8862E');
  ctx.save(); ctx.beginPath(); ctx.moveTo(lx - 5, B - 90); ctx.lineTo(lx - 8, B - 118); ctx.lineTo(lx + 8, B - 118); ctx.lineTo(lx + 5, B - 90); ctx.closePath(); ctx.clip();
  box(ctx, lx - 9, B - 120, 18, 32, '#4C0519');
  for (let k = 0; k < 3; k++) { const by = B - 94 - ((f * (0.3 + k * 0.12) + k * 11) % 26); box(ctx, lx - 3 + (k - 1) * 2, by, 6, 5, '#FB923C'); box(ctx, lx - 2 + (k - 1) * 2, by - 2, 4, 2, '#FB923C'); }
  ctx.restore();
  box(ctx, lx - 4, B - 124, 8, 6, '#B8862E');
  steppedGlow(ctx, lx, B - 104, 26, '#FB923C', 0.12, 0, 3);
  // the bucket, the bottle, the sparkler
  const bx = dx + 170;
  bevel(ctx, bx - 12, B - 100, 24, 18, '#D6D3D1', '#FFFFFF', '#78716C');
  box(ctx, bx - 4, B - 122, 8, 24, '#14532D'); box(ctx, bx - 2, B - 130, 4, 8, '#14532D'); box(ctx, bx - 2, B - 116, 2, 12, '#4ADE80');
  box(ctx, bx - 1, B - 140, 2, 10, '#A8A29E');
  for (let k = 0; k < 8; k++) {
    const a = hash(k + Math.floor(f / 2) * 3) * Math.PI * 2, d = 3 + hash(k * 7 + Math.floor(f / 2)) * 9;
    box(ctx, bx + Math.cos(a) * d, B - 142 + Math.sin(a) * d, 2, 2, k % 2 ? '#FFFFFF' : '#FDE047');
  }
  steppedGlow(ctx, bx, B - 142, 22, '#FDE047', 0.2, 0, 3);

  // The mirror ball, and the specks of light it throws round the room
  const mx = L + 215, my = T + 44;
  box(ctx, mx - 1, T + 21, 2, 12, '#3A1A12');
  ctx.save(); ctx.beginPath(); ctx.arc(mx, my, 12, 0, Math.PI * 2); ctx.clip();
  for (let yy = -12; yy < 12; yy += 4) for (let xx = -12; xx < 12; xx += 4) {
    const k = Math.floor((xx + f * 0.5) / 4) + yy;
    box(ctx, mx + xx, my + yy, 3, 3, ['#9CA3AF', '#E5E7EB', '#FFFFFF', '#6B7280'][((k % 4) + 4) % 4]);
  }
  ctx.restore();
  for (let k = 0; k < 18; k++) {
    const a = k * 0.35 + f * 0.012, x = L + 30 + ((Math.cos(a) * 0.5 + 0.5) * (W - 60) + k * 97) % (W - 60), y = T + 40 + hash(k) * (B - T - 180);
    box(ctx, x, y, 3, 3, `rgba(255, 255, 255, ${0.18 + 0.15 * Math.sin(f * 0.1 + k)})`);
  }

  // The side columns: obsidian, gold banded
  for (const x of [L, R - 24]) {
    bevel(ctx, x, T, 24, B - T, '#0E0708', '#2A1418', '#050203');
    for (let y = T + 30; y < B - 20; y += 60) { box(ctx, x + 2, y, 20, 3, '#B8862E'); box(ctx, x + 2, y, 20, 1, '#F2C46D'); }
    checker(ctx, x + 2, B - 60, 20, 40, 'rgba(255, 106, 0, 0.15)', 0);
  }

  // The floor: black marble with a gold inlay, warm from underneath
  box(ctx, L, B - 14, W, 14, '#0E0A0B');
  for (let x = L; x < R; x += 48) { box(ctx, x, B - 14, 1, 14, '#B8862E'); box(ctx, x + 10 + hash(x) * 20, B - 10, 14, 1, '#2A2224'); }
  box(ctx, L, B - 14, W, 1, '#F2C46D');
  const heat = 0.25 + 0.12 * Math.sin(f * 0.07);
  box(ctx, L, B - 3, W, 3, `rgba(255, 90, 20, ${heat.toFixed(2)})`);
  checker(ctx, L, B - 7, W, 4, `rgba(255, 90, 20, ${(heat * 0.6).toFixed(2)})`, 0);
  // a few embers drifting up off it
  for (let i = 0; i < 10; i++) {
    const ex = L + ((i * 71 + Math.sin(f * 0.04 + i) * 20) % W);
    const ey = B - ((f * (0.7 + (i % 3) * 0.3) + i * 53) % 220);
    box(ctx, ex, ey, 2, 2, i % 2 ? 'rgba(255, 140, 40, 0.7)' : 'rgba(255, 215, 0, 0.6)');
  }
};
