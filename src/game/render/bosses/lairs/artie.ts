// Artie's cryo-vault: a riveted steel room frosted over from the corners in, the great round vault door at the
// back, his specimens in tubes either side of it (the lobbyist and peer reviewer #2 among them), coolant lines along
// the ceiling grown over with icicles, his laminated trail map on the wall, the temperature readout, cold mist
// rolling along an iced-over floor.

import { bandedGradient, checker, steppedGlow, pixelBlob } from '../../pixelArt';
import { Ctx, hash, box, bevel, label, frame as picture } from './kit';

/** A pixel icicle: three tones, stepping in to a point. */
const icicle = (ctx: Ctx, x: number, y: number, len: number, wid: number) => {
  for (let i = 0; i < len; i += 2) {
    const half = Math.max(1, Math.round(wid * (1 - i / len)));
    box(ctx, x - half, y + i, half * 2, 2, i < len * 0.5 ? '#9ED4F0' : '#CFEFFF');
    box(ctx, x - half, y + i, 1, 2, '#FFFFFF');
    box(ctx, x + half - 1, y + i, 1, 2, '#5FA8D3');
  }
};

/** One of his specimen tubes: steel caps, glass, blue coolant with bubbles coming up, and what's in it. */
const tube = (ctx: Ctx, cx: number, top: number, bottom: number, what: number, name: string, f: number) => {
  const w = 54, x = cx - w / 2;
  // Coolant pipe up to the ceiling
  box(ctx, cx - 4, top - 80, 8, 80, '#24415E'); box(ctx, cx - 4, top - 80, 2, 80, '#3E6688');
  bevel(ctx, x - 4, top - 14, w + 8, 14, '#3A5670', '#6B8BA8', '#1C2E40');
  bevel(ctx, x - 6, bottom - 24, w + 12, 24, '#3A5670', '#6B8BA8', '#1C2E40');
  const gy = top, gh = bottom - 24 - top;
  // The liquid, banded darker to the bottom
  bandedGradient(ctx, x, gy, w, gh, ['#1E6E9E', '#175A86', '#12476C'], 6);
  // What's in it (a dark shape through the blue)
  const mx = cx, my = gy + gh * 0.55;
  ctx.fillStyle = 'rgba(8, 24, 40, 0.75)';
  if (what === 0) { // a mammoth calf, tusk and all
    ctx.fillRect(mx - 18, my - 10, 30, 20); ctx.fillRect(mx - 22, my - 14, 14, 14); ctx.fillRect(mx - 24, my - 2, 4, 14);
    ctx.fillRect(mx - 14, my + 10, 5, 10); ctx.fillRect(mx + 4, my + 10, 5, 10);
    ctx.fillStyle = 'rgba(230, 240, 250, 0.7)'; ctx.fillRect(mx - 26, my + 2, 6, 2);
  } else if (what === 1) { // a penguin
    ctx.fillRect(mx - 8, my - 22, 16, 40); ctx.fillRect(mx - 5, my - 28, 10, 8);
    ctx.fillStyle = 'rgba(220, 235, 245, 0.55)'; ctx.fillRect(mx - 4, my - 16, 8, 30);
    ctx.fillStyle = 'rgba(250, 190, 60, 0.8)'; ctx.fillRect(mx + 5, my - 25, 4, 2);
  } else { // a man (a suit and a briefcase; or glasses and a paper)
    ctx.fillRect(mx - 6, my - 34, 12, 12); ctx.fillRect(mx - 10, my - 22, 20, 26); ctx.fillRect(mx - 9, my + 4, 7, 22); ctx.fillRect(mx + 2, my + 4, 7, 22);
    if (what === 2) { ctx.fillRect(mx + 10, my - 4, 12, 10); ctx.fillStyle = 'rgba(200, 40, 40, 0.6)'; ctx.fillRect(mx - 1, my - 21, 2, 12); }
    else { ctx.fillStyle = 'rgba(230, 240, 250, 0.75)'; ctx.fillRect(mx - 5, my - 30, 4, 2); ctx.fillRect(mx + 1, my - 30, 4, 2); ctx.fillRect(mx + 8, my - 16, 9, 12); }
  }
  // Bubbles coming up
  for (let k = 0; k < 5; k++) {
    const life = (f * (0.6 + (k % 3) * 0.25) + k * 37 + what * 13) % gh;
    const bx = x + 8 + hash(k + what * 7) * (w - 16) + Math.sin((f + k * 20) * 0.08) * 2;
    box(ctx, bx, gy + gh - life, 2 + (k % 2), 2 + (k % 2), 'rgba(200, 240, 255, 0.7)');
  }
  // Frost up the glass from the bottom, the glass's shine, the edges
  checker(ctx, x, gy + gh - 18, w, 18, 'rgba(230, 245, 255, 0.45)', 0);
  box(ctx, x + 6, gy, 4, gh, 'rgba(255, 255, 255, 0.22)'); box(ctx, x + 12, gy, 2, gh, 'rgba(255, 255, 255, 0.12)');
  box(ctx, x, gy, 2, gh, '#7FB8DC'); box(ctx, x + w - 2, gy, 2, gh, '#0E3550');
  // The plate on the base
  box(ctx, cx - 28, bottom - 18, 56, 10, '#D8E6F0'); label(ctx, name, cx, bottom - 10.5, '#1C2E40', 5);
};

export const drawArtieLair = (ctx: Ctx, L: number, R: number, T: number, B: number, f: number) => {
  const W = R - L;
  // The wall: cold steel, banded darker up into the gloom
  bandedGradient(ctx, L, T, W, B - T, ['#0A1626', '#0F2236', '#16304A', '#1A3956', '#16314B'], 14);
  // Riveted panels
  for (let y = T + 24, row = 0; y < B - 20; y += 86, row++) {
    for (let x = L + 24 - (row % 2) * 60; x < R - 24; x += 120) {
      const x0 = Math.max(L + 24, x), x1 = Math.min(R - 24, x + 120);
      box(ctx, x0, y, x1 - x0, 2, '#081320'); box(ctx, x0, y + 2, x1 - x0, 1, '#28507A');
      box(ctx, x1 - 2, y, 2, 86, '#081320'); box(ctx, x1, y, 1, 86, '#28507A');
      for (const rx of [x0 + 6, x1 - 8]) for (const ry of [y + 6, y + 78]) { box(ctx, rx, ry, 2, 2, '#4C7BA6'); box(ctx, rx + 1, ry + 1, 1, 1, '#0A1626'); }
    }
  }
  // Frost creeping in off the ceiling and up off the floor: ragged, dithered at the edge
  box(ctx, L, T + 18, W, 30, 'rgba(210, 236, 255, 0.12)');
  checker(ctx, L, T + 48, W, 14, 'rgba(210, 236, 255, 0.12)', 1);
  box(ctx, L, B - 40, W, 26, 'rgba(210, 236, 255, 0.10)');
  checker(ctx, L, B - 56, W, 16, 'rgba(210, 236, 255, 0.10)', 0);

  // The vault door, centre back: a great round slab, bolted, a handwheel, frost round the bottom of it
  const cx = L + W / 2, cy = T + 190;
  steppedGlow(ctx, cx, cy, 150, '#5DADE2', 0.10, 0.0, 5);
  ctx.fillStyle = '#1C2E40'; ctx.beginPath(); ctx.arc(cx, cy, 112, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3A5670'; ctx.beginPath(); ctx.arc(cx, cy, 104, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4E6E8C'; ctx.beginPath(); ctx.arc(cx - 4, cy - 4, 92, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#41607C'; ctx.beginPath(); ctx.arc(cx, cy, 86, 0, Math.PI * 2); ctx.fill();
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    const bx = cx + Math.cos(a) * 97, by = cy + Math.sin(a) * 97;
    box(ctx, bx - 3, by - 3, 6, 6, '#26405A'); box(ctx, bx - 3, by - 3, 3, 3, '#8FB3D0');
  }
  // the handwheel
  ctx.strokeStyle = '#1C2E40'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(cx, cy, 34, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#9DB9D2'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy, 34, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke();
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.3;
    ctx.strokeStyle = '#1C2E40'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 34, cy + Math.sin(a) * 34); ctx.stroke();
  }
  box(ctx, cx - 8, cy - 8, 16, 16, '#26405A'); box(ctx, cx - 8, cy - 8, 8, 4, '#8FB3D0');
  label(ctx, 'CRYO-VAULT 1', cx, cy - 58, '#BFD9EE', 6);
  // frost across the bottom of the door
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, 104, 0, Math.PI * 2); ctx.clip();
  checker(ctx, cx - 110, cy + 40, 220, 30, 'rgba(235, 248, 255, 0.5)', 0);
  box(ctx, cx - 110, cy + 70, 220, 60, 'rgba(235, 248, 255, 0.35)');
  ctx.restore();

  // Specimens either side of it
  const tubeTop = B - 200;
  tube(ctx, L + 100, tubeTop, B - 14, 0, 'MAMMOTH', f);
  tube(ctx, L + 190, tubeTop + 20, B - 14, 1, 'PENGUIN', f);
  tube(ctx, R - 190, tubeTop + 20, B - 14, 2, 'LOBBYIST', f);
  tube(ctx, R - 100, tubeTop, B - 14, 3, 'REVIEWER 2', f);

  // His laminated trail map, every crevasse on it, pinned up top left; the readout top right
  picture(ctx, L + 52, T + 60, 90, 62, '#D8E6F0', '#FFFFFF', () => {
    box(ctx, L + 52, T + 60, 90, 62, '#EEF4F7');
    ctx.strokeStyle = '#7FA7C4'; ctx.lineWidth = 1;
    for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(L + 52, T + 70 + k * 11); for (let x = 0; x <= 90; x += 10) ctx.lineTo(L + 52 + x, T + 70 + k * 11 + Math.sin(x * 0.1 + k) * 4); ctx.stroke(); }
    ctx.strokeStyle = '#B45309'; ctx.beginPath(); ctx.moveTo(L + 58, T + 116); ctx.lineTo(L + 80, T + 96); ctx.lineTo(L + 100, T + 100); ctx.lineTo(L + 132, T + 68); ctx.stroke();
    for (let k = 0; k < 7; k++) { const x = L + 60 + hash(k + 40) * 74, y = T + 66 + hash(k + 60) * 50; box(ctx, x, y, 3, 1, '#DC2626'); box(ctx, x + 1, y - 1, 1, 3, '#DC2626'); }
  });
  box(ctx, L + 95, T + 54, 4, 4, '#DC2626');
  const tx = R - 150, ty = T + 62;
  bevel(ctx, tx, ty, 96, 40, '#0B1B2B', '#3E6688', '#06101A');
  label(ctx, 'VAULT TEMP', tx + 48, ty + 13, '#5DADE2', 5);
  label(ctx, f % 60 < 50 ? '-89°C' : '-89 C', tx + 48, ty + 31, '#7DF9FF', 10);

  // Coolant lines along the ceiling, with icicles grown off them
  for (const [y, h] of [[T + 18, 12], [T + 34, 8]] as const) {
    box(ctx, L, y, W, h, '#2C4A66'); box(ctx, L, y, W, 2, '#6B8BA8'); box(ctx, L, y + h - 2, W, 2, '#152638');
    for (let x = L + 40; x < R; x += 96) bevel(ctx, x, y - 2, 10, h + 4, '#3A5A78', '#8FB3D0', '#152638', 1);
    checker(ctx, L, y, W, 4, 'rgba(235, 248, 255, 0.5)', 0);
  }
  for (let i = 0; i < 34; i++) {
    const x = L + 10 + i * (W - 20) / 33 + (hash(i) - 0.5) * 8;
    icicle(ctx, x, T + 42, 8 + Math.round(hash(i + 5) * 22), 2 + Math.round(hash(i + 9) * 3));
  }

  // The side columns: frosted steel, a coolant core lit inside
  for (const x of [L, R - 24]) {
    bevel(ctx, x, T, 24, B - T, '#13283C', '#34587A', '#081420');
    const pulse = 0.5 + 0.3 * Math.sin(f * 0.08);
    box(ctx, x + 8, T + 24, 8, B - T - 48, '#0A3A4A');
    box(ctx, x + 10, T + 24, 4, B - T - 48, `rgba(125, 249, 255, ${pulse.toFixed(2)})`);
    for (let y = T + 40; y < B - 30; y += 50) { box(ctx, x + 4, y, 16, 3, '#34587A'); checker(ctx, x, y + 3, 24, 6, 'rgba(235, 248, 255, 0.4)', 0); }
  }

  // The floor: iced-over plate, a shine along it, frost at the seams
  box(ctx, L, B - 14, W, 14, '#16324C');
  box(ctx, L, B - 14, W, 2, '#9ED4F0');
  for (let x = L; x < R; x += 60) { box(ctx, x, B - 12, 2, 12, '#0B1B2B'); checker(ctx, x - 4, B - 12, 10, 4, 'rgba(235, 248, 255, 0.6)', 0); }
  for (let x = L + 20; x < R; x += 140) box(ctx, x + (f * 0.2) % 40, B - 10, 18, 1, 'rgba(255, 255, 255, 0.5)');

  // Cold mist rolling along the floor, and the odd flake hanging in the air
  for (let k = 0; k < 7; k++) {
    const mx = L + ((k * 131 + f * (0.25 + (k % 3) * 0.1)) % (W + 160)) - 80;
    pixelBlob(ctx, mx, B - 22 - (k % 3) * 6, 60 + (k % 2) * 30, 10, 'rgba(220, 240, 255, 0.10)');
  }
  for (let i = 0; i < 22; i++) {
    const sx = L + ((i * 37 + Math.sin(f * 0.03 + i) * 20 + f * 0.3) % W);
    const sy = T + ((i * 47 + f * (0.4 + (i % 3) * 0.2)) % (B - T));
    box(ctx, sx, sy, 2, 2, 'rgba(235, 245, 251, 0.6)');
  }
};
