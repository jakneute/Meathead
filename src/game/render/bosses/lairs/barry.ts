// Barry's observatory on the roof: the inside of the dome, ribbed, its slit open on the sky he's blacked the city out
// for (stars, and the Milky Way across them), his telescope up on its pier aimed at it, the switchboard with the big
// knife switch thrown off and every meter on zero, Gary's desk (headset, a monitor of five dark boroughs, the note
// about the switch, R&D's pill bottles), a star chart, the dark city out the little windows.

import { bandedGradient, checker } from '../../pixelArt';
import { Ctx, hash, box, bevel, label } from './kit';

export const drawBarryLair = (ctx: Ctx, L: number, R: number, T: number, B: number, f: number) => {
  const W = R - L, cx = L + W / 2;
  // The back wall, below the dome: dark planking
  bandedGradient(ctx, L, T, W, B - T, ['#07060D', '#0D0B18', '#141024', '#1A1430', '#161026'], 14);

  // The dome: a ring of ribs arching over, the slit open in the middle of it
  const domeCy = B - 60, domeR = Math.min(W / 2 - 20, B - T + 40);
  ctx.save(); ctx.beginPath(); ctx.rect(L, T, W, B - T); ctx.clip();
  ctx.fillStyle = '#100C1E'; ctx.beginPath(); ctx.arc(cx, domeCy, domeR, Math.PI, 0); ctx.fill();
  // the slit, and the sky through it
  const sw = 110;
  ctx.save(); ctx.beginPath(); ctx.rect(cx - sw / 2, T, sw, domeCy - T - 150); ctx.clip();
  bandedGradient(ctx, cx - sw / 2, T, sw, domeCy - T - 150, ['#020617', '#0B1033', '#141B4D'], 6);
  // the Milky Way, a dithered band across it
  ctx.save(); ctx.translate(cx, T + 120); ctx.rotate(-0.5);
  checker(ctx, -200, -14, 400, 28, 'rgba(199, 210, 254, 0.18)', 0);
  checker(ctx, -200, -6, 400, 12, 'rgba(224, 231, 255, 0.22)', 1);
  ctx.restore();
  for (let k = 0; k < 60; k++) {
    const x = cx - sw / 2 + hash(k) * sw, y = T + hash(k + 99) * (domeCy - T - 150);
    const tw = (f + k * 13) % (60 + (k % 5) * 20) < 6;
    box(ctx, x, y, k % 9 === 0 ? 2 : 1, k % 9 === 0 ? 2 : 1, tw ? '#FFFFFF' : ['#C7D2FE', '#E0E7FF', '#A5B4FC'][k % 3]);
    if (k % 9 === 0 && tw) { box(ctx, x - 2, y, 6, 1, 'rgba(255,255,255,0.6)'); box(ctx, x, y - 2, 1, 6, 'rgba(255,255,255,0.6)'); }
  }
  // a shooting star every so often
  const ss = f % 400;
  if (ss < 18) { const x = cx - 40 + ss * 5, y = T + 30 + ss * 2; for (let j = 0; j < 6; j++) box(ctx, x - j * 4, y - j * 2, 3, 1, `rgba(255,255,255,${(1 - j / 6).toFixed(2)})`); }
  ctx.restore();
  // the slit's edges, the shutter rolled back
  box(ctx, cx - sw / 2 - 6, T, 6, domeCy - T - 150, '#2A2340'); box(ctx, cx + sw / 2, T, 6, domeCy - T - 150, '#2A2340');
  // the ribs
  for (let k = 0; k <= 10; k++) {
    const a = Math.PI + (k / 10) * Math.PI;
    if (Math.abs(Math.cos(a)) < 0.12) continue;
    ctx.strokeStyle = '#2A2340'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(cx, domeCy); ctx.lineTo(cx + Math.cos(a) * domeR, domeCy + Math.sin(a) * domeR); ctx.stroke();
    ctx.strokeStyle = '#3B3358'; ctx.lineWidth = 1; ctx.stroke();
  }
  for (const r of [domeR - 2, domeR * 0.75, domeR * 0.5]) {
    ctx.strokeStyle = '#2A2340'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, domeCy, r, Math.PI, 0); ctx.stroke();
  }
  ctx.restore();

  // The telescope up on its pier, aimed at the slit
  const px = cx + 30, py = B - 14;
  bevel(ctx, px - 16, py - 110, 32, 110, '#3F3F46', '#71717A', '#18181B');
  bevel(ctx, px - 26, py - 12, 52, 12, '#27272A', '#52525B', '#09090B');
  box(ctx, px - 6, py - 126, 12, 18, '#52525B');
  ctx.save(); ctx.translate(px, py - 124); ctx.rotate(-1.1);
  bevel(ctx, -20, -13, 200, 26, '#E4E4E7', '#FFFFFF', '#A1A1AA');
  bevel(ctx, 170, -16, 30, 32, '#D4D4D8', '#FFFFFF', '#71717A');
  box(ctx, 60, -13, 6, 26, '#A1A1AA'); box(ctx, 120, -13, 6, 26, '#A1A1AA');
  bevel(ctx, -40, -9, 22, 18, '#27272A', '#52525B', '#09090B');
  box(ctx, 40, -22, 50, 8, '#52525B');
  ctx.restore();

  // The switchboard, left: breakers, meters on zero, the big switch thrown off
  const bx = L + 40;
  bevel(ctx, bx, B - 210, 150, 196, '#1F2937', '#4B5563', '#0B0F19');
  label(ctx, 'MAIN GRID // 5 BOROUGHS', bx + 75, B - 198, '#FACC15', 4);
  for (let k = 0; k < 3; k++) {
    const mx = bx + 26 + k * 50, my = B - 168;
    ctx.fillStyle = '#F5F5F4'; ctx.beginPath(); ctx.arc(mx, my, 16, Math.PI, 0); ctx.fill();
    box(ctx, mx - 16, my, 32, 4, '#F5F5F4');
    ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(mx, my + 2); ctx.lineTo(mx - 14 + Math.sin(f * 0.3 + k) * 0.6, my - 2); ctx.stroke();
    label(ctx, '0', mx, my - 6, '#1C1917', 4);
  }
  for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) {
    const x = bx + 12 + k * 22, y = B - 140 + r * 18;
    box(ctx, x, y, 16, 12, '#111827'); box(ctx, x + 6, y + 6, 4, 5, '#9CA3AF');
  }
  // the knife switch, thrown down (off)
  const kx = bx + 75, ky = B - 70;
  box(ctx, kx - 30, ky - 6, 60, 30, '#3F3F46'); box(ctx, kx - 30, ky - 6, 60, 2, '#71717A');
  for (const s of [-12, 12]) { box(ctx, kx + s - 2, ky - 14, 4, 10, '#B87333'); }
  ctx.save(); ctx.translate(kx, ky + 18); ctx.rotate(0.35);
  box(ctx, -16, 0, 32, 4, '#B87333'); box(ctx, -2, 0, 4, 36, '#B87333'); box(ctx, -8, 36, 16, 10, '#111827');
  ctx.restore();
  label(ctx, 'OFF', kx + 22, ky + 20, '#EF4444', 5);
  // cables from it, up the wall
  ctx.strokeStyle = '#0B0F19'; ctx.lineWidth = 4;
  for (const o of [20, 40, 60]) { ctx.beginPath(); ctx.moveTo(bx + 150, B - 180 + o); ctx.quadraticCurveTo(bx + 190, B - 260 + o, bx + 170 + o, T + 20); ctx.stroke(); }

  // Gary's desk, right
  const dx = R - 210;
  bevel(ctx, dx, B - 64, 180, 10, '#5C4033', '#7A5845', '#3A2A20');
  box(ctx, dx + 8, B - 54, 6, 40, '#3A2A20'); box(ctx, dx + 166, B - 54, 6, 40, '#3A2A20');
  // the monitor: a map of the five boroughs, dark
  bevel(ctx, dx + 20, B - 122, 80, 58, '#D6D3D1', '#F5F5F4', '#78716C');
  box(ctx, dx + 26, B - 116, 68, 44, '#020617');
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(dx + 46, B - 112, 8, 26); ctx.fillRect(dx + 54, B - 108, 22, 14); ctx.fillRect(dx + 56, B - 94, 24, 16); ctx.fillRect(dx + 30, B - 84, 14, 10); ctx.fillRect(dx + 50, B - 82, 10, 6);
  label(ctx, 'GRID: 0%', dx + 60, B - 75, f % 30 < 20 ? '#EF4444' : '#7F1D1D', 4);
  box(ctx, dx + 56, B - 64, 8, 4, '#A8A29E');
  // the headset, the mug, the note, the pills
  ctx.strokeStyle = '#18181B'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(dx + 122, B - 70, 10, Math.PI, 0); ctx.stroke();
  box(ctx, dx + 110, B - 72, 6, 8, '#18181B'); box(ctx, dx + 128, B - 72, 6, 8, '#18181B');
  bevel(ctx, dx + 142, B - 80, 14, 16, '#F5F5F4', '#FFFFFF', '#A8A29E', 1); box(ctx, dx + 156, B - 76, 4, 8, '#F5F5F4');
  box(ctx, dx + 144, B - 76, 10, 3, '#DC2626');
  for (let k = 0; k < 3; k++) { box(ctx, dx + 104 + k * 9, B - 64 - 12, 7, 12, '#F97316'); box(ctx, dx + 104 + k * 9, B - 64 - 14, 7, 3, '#F5F5F4'); }
  ctx.save(); ctx.translate(dx + 60, B - 140); ctx.rotate(0.06);
  box(ctx, -26, -14, 52, 30, '#FEF08A'); label(ctx, "DON'T TOUCH", 0, -3, '#1C1917', 4); label(ctx, 'THE SWITCH', 0, 5, '#1C1917', 4); label(ctx, '- G', 14, 12, '#1C1917', 4);
  ctx.restore();

  // A star chart, high on the wall left of the slit
  const cxs = cx - 190, cys = T + 60;
  bevel(ctx, cxs - 4, cys - 4, 88, 68, '#1E1B4B', '#4338CA', '#0B0A24');
  box(ctx, cxs, cys, 80, 60, '#0B1033');
  ctx.strokeStyle = 'rgba(165, 180, 252, 0.6)'; ctx.lineWidth = 1;
  const pts = [[10, 40], [24, 22], [40, 30], [56, 12], [70, 26]];
  ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(cxs + x, cys + y) : ctx.moveTo(cxs + x, cys + y))); ctx.stroke();
  pts.forEach(([x, y]) => box(ctx, cxs + x - 1, cys + y - 1, 3, 3, '#FFFFFF'));
  label(ctx, 'URSA MAJOR', cxs + 40, cys + 54, '#C7D2FE', 4);

  // The city out the little windows: dark, the odd flashlight
  for (const wx of [cx - 120, cx + 120]) {
    if (Math.abs(wx - px) < 40) continue;
    bevel(ctx, wx - 26, B - 150, 52, 40, '#2A2340', '#3B3358', '#100C1E');
    box(ctx, wx - 22, B - 146, 44, 32, '#0B1033');
    for (let k = 0; k < 6; k++) box(ctx, wx - 22 + k * 8, B - 132 + hash(k + wx) * 10, 7, 30, '#05060F');
    if (f % 90 < 60) box(ctx, wx - 10 + hash(Math.floor(f / 90) + wx) * 20, B - 124, 1, 1, '#FDE68A');
    box(ctx, wx - 1, B - 146, 2, 32, '#2A2340');
  }

  // The side columns: brick, with conduit and an insulator or two
  for (const x of [L, R - 24]) {
    bevel(ctx, x, T, 24, B - T, '#2A2128', '#463742', '#120D11');
    for (let y = T; y < B; y += 10) box(ctx, x, y, 24, 1, '#1A1418');
    box(ctx, x + 9, T, 6, B - T, '#4B5563'); box(ctx, x + 9, T, 2, B - T, '#9CA3AF');
    for (let y = T + 80; y < B - 40; y += 120) { box(ctx, x + 6, y, 12, 8, '#A16207'); box(ctx, x + 6, y, 12, 2, '#FACC15'); }
  }

  // The floor: dark boards
  box(ctx, L, B - 14, W, 14, '#2A1F1A'); box(ctx, L, B - 14, W, 2, '#4A3A30');
  for (let x = L; x < R; x += 36) { box(ctx, x, B - 12, 1, 12, '#160F0C'); box(ctx, x + 12, B - 7, 2, 2, '#160F0C'); }
  // a faint spill of starlight down from the slit
  ctx.fillStyle = 'rgba(165, 180, 252, 0.04)';
  ctx.beginPath(); ctx.moveTo(cx - sw / 2, T); ctx.lineTo(cx + sw / 2, T); ctx.lineTo(cx + sw, B - 14); ctx.lineTo(cx - sw, B - 14); ctx.closePath(); ctx.fill();
};
