// The hub's props at the lands' SNES detail (all stamped): the costumed characters, the vendors' carts, benches, trash
// cans, the parade floats, the kiosks where two lands meet, the flower beds along the front. Round things in stepped
// shells or columns (lit at the left, shaded at the right, a row of dither at each step), inked; small highlights.

import { type Ctx, INK, mix, hash, checker, box, R6 } from './kit';
import { signText } from '../signLetters';

// ---------------------------------------------------------------------------------------------------------------
// Shading

/** A round-rect in stepped columns across (lit left, shaded right, dithered at each step), inked. */
export const shadeRR = (g: Ctx, x: number, y: number, w: number, h: number, r: number | number[], R: string[], ink = 1.5) => {
  g.save(); g.beginPath(); g.roundRect(x, y, w, h, r); g.clip();
  const cuts = [0.12, 0.3, 0.68, 0.86, 1.01], cols = [R[3], R[4], R[3], R[2], R[1]];
  let a = x;
  cuts.forEach((t, i) => { const b = x + w * t; box(g, a, y, b - a + 1, h, cols[i]); if (i) checker(g, Math.round(a) - 1, y, 2, h, cols[i - 1]); a = b; });
  box(g, x, y + h - Math.max(2, h * 0.12), w, Math.max(2, h * 0.12), R[1]);
  g.restore();
  g.beginPath(); g.roundRect(x, y, w, h, r); g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = ink; g.stroke();
};
/** A ball in stepped shells (lit up its upper left), inked. */
export const shadeBall = (g: Ctx, x: number, y: number, rx: number, ry: number, R: string[], ink = 1.5) => {
  g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, rx + ink * 0.7, ry + ink * 0.7, 0, 0, Math.PI * 2); g.fill();
  const shells: [number, string][] = [[1, R[1]], [0.86, R[2]], [0.66, R[3]], [0.4, R[4]], [0.16, R[5]]];
  for (const [k, col] of shells) { g.fillStyle = col; g.beginPath(); g.ellipse(x - rx * (1 - k) * 0.38, y - ry * (1 - k) * 0.42, rx * k, ry * k, 0, 0, Math.PI * 2); g.fill(); }
  checker(g, Math.round(x - rx * 0.7), Math.round(y + ry * 0.1), Math.round(rx * 1.3), 2, R[2]);
};
const poly = (g: Ctx, pts: [number, number][], col: string, ink = 0) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = col; g.fill(); if (ink) { g.strokeStyle = INK; g.lineWidth = ink; g.lineJoin = 'round'; g.stroke(); } };
const eye = (g: Ctx, x: number, y: number, rx: number, ry: number, look = 1) => { shadeBall(g, x, y, rx, ry, ['#B8B8C8', '#D8D8E4', '#EEEEF4', '#FFFFFF', '#FFFFFF', '#FFFFFF'], 1); box(g, x + look - 1, y - 1, 3, Math.max(3, ry), INK); box(g, x + look - 1, y - 1, 1, 1, '#FFFFFF'); };

// ---------------------------------------------------------------------------------------------------------------
// Costumed characters (each land's mascot, waving: two frames)

export type Mascot = 'bear' | 'robot' | 'skeleton' | 'knight' | 'beaver' | 'parrot' | 'star' | 'globe' | 'dog';
export const paintMascot = (g: Ctx, kind: Mascot, fi: number) => {
  const wave = fi % 2 ? -20 : -8;
  const body = { bear: '#8A5A32', robot: '#CBD5E1', skeleton: '#26222E', knight: '#A8A29E', beaver: '#7A4E2A', parrot: '#DC2626', star: '#FACC15', globe: '#1E40AF', dog: '#F4F0E8' }[kind];
  const R = R6(body), shoe = R6(kind === 'robot' ? '#64748B' : kind === 'knight' ? '#78716C' : '#27272A'), glove = R6(kind === 'skeleton' ? '#F5F5F4' : kind === 'knight' ? '#D6D3D1' : '#F8FAFC');
  // (legs, big shoes with their soles, the body (a belly patch, buttons or a costume's details), arms, gloves)
  for (const s of [-1, 1]) shadeRR(g, s * 7 - 5, -26, 10, 24, 4, R);
  for (const s of [-1, 1]) { shadeBall(g, s * 9, -4, 10, 5, shoe); box(g, s * 9 - 9, -1, 18, 2, shoe[0]); box(g, s * 9 - 5, -7, 4, 1, shoe[5]); }
  shadeRR(g, -17, -64, 34, 44, 13, R);
  if (kind === 'bear' || kind === 'beaver' || kind === 'dog') { shadeBall(g, 2, -40, 10, 13, R6(kind === 'dog' ? '#FFFFFF' : '#E8C89A'), 1); }
  if (kind === 'robot') { box(g, -9, -54, 18, 16, INK); box(g, -8, -53, 16, 14, '#1E3A8A'); for (let k = 0; k < 3; k++) box(g, -6 + k * 5, -50, 3, 3, ['#EF4444', '#FDE047', '#4ADE80'][(k + fi) % 3]); for (let k = 0; k < 3; k++) box(g, -12, -34 + k * 4, 24, 1, R[2]); }
  if (kind === 'skeleton') { for (let k = 0; k < 4; k++) { box(g, -11, -56 + k * 8, 22, 3, INK); box(g, -10, -55 + k * 8, 20, 1, '#F5F5F4'); } box(g, -1, -60, 3, 36, '#F5F5F4'); }
  if (kind === 'knight') { box(g, -16, -40, 32, 3, INK); box(g, -15, -39, 30, 1, '#F2C84A'); poly(g, [[-8, -60], [8, -60], [6, -46], [0, -42], [-6, -46]], '#2563EB', 1); box(g, -1, -58, 2, 12, '#FACC15'); box(g, -5, -53, 10, 2, '#FACC15'); }
  if (kind === 'parrot') { for (let k = 0; k < 4; k++) { box(g, -14 + k * 2, -58 + k * 9, 28 - k * 4, 2, R[1]); } shadeBall(g, 0, -36, 9, 12, R6('#FDE047'), 1); }
  if (kind === 'star') { box(g, -16, -48, 32, 4, INK); box(g, -15, -47, 30, 2, '#18181B'); for (let k = 0; k < 4; k++) box(g, -12 + k * 8, -46, 2, 1, '#F8FAFC'); }
  if (kind === 'globe') { box(g, -16, -48, 32, 3, '#F8FAFC'); box(g, -16, -34, 32, 3, '#DC2626'); }
  if (kind === 'bear') poly(g, [[-9, -64], [9, -56], [9, -64], [-9, -56]], '#DC2626', 1);
  shadeRR(g, -26, -60, 10, 32, 4, R);
  shadeBall(g, -21, -26, 6, 6, glove);
  g.save(); g.translate(19, -58); g.rotate(wave * 0.06); shadeRR(g, -5, -28, 10, 32, 4, R); shadeBall(g, 0, -30, 7, 7, glove); for (let k = -1; k <= 1; k++) box(g, k * 3 - 1, -35, 1, 3, glove[1]); g.restore();
  // (the big head)
  const hx = 0, hy = -82;
  switch (kind) {
    case 'bear': case 'beaver': case 'dog': {
      if (kind !== 'beaver') for (const s of [-1, 1]) { shadeBall(g, hx + s * 17, hy - 17, 8, 8, kind === 'dog' ? R6('#3F3F46') : R); if (kind === 'bear') shadeBall(g, hx + s * 17, hy - 17, 4, 4, R6('#E8C89A'), 0.5); }
      shadeBall(g, hx, hy, 23, 22, R);
      shadeBall(g, hx + 4, hy + 8, 12, 9, R6(kind === 'dog' ? '#FFFFFF' : '#E8C89A'), 1);
      shadeBall(g, hx + 5, hy + 3, 4, 3, R6('#27272A'), 0.5);
      box(g, hx + 1, hy + 11, 8, 2, INK); box(g, hx + 3, hy + 13, 4, 3, '#E86A8A');
      for (const ex of [-8, 10]) eye(g, hx + ex, hy - 6, 5, 6);
      if (kind === 'beaver') { box(g, hx, hy + 15, 9, 7, INK); box(g, hx + 1, hy + 15, 3, 6, '#F8FAFC'); box(g, hx + 5, hy + 15, 3, 6, '#F8FAFC'); shadeRR(g, hx - 21, hy - 28, 42, 12, 5, R6('#8A6A44')); box(g, hx + 18, hy - 24, 16, 5, '#5E4A32'); for (let k = 0; k < 4; k++) box(g, hx - 16 + k * 9, hy - 25, 5, 1, '#C8A070'); }
      if (kind === 'dog') { shadeBall(g, hx + 10, hy - 14, 6, 8, R6('#3F3F46'), 1); }
      break;
    }
    case 'robot': {
      shadeRR(g, hx - 19, hy - 19, 38, 36, 5, R6('#E2E8F0'));
      box(g, hx - 13, hy - 10, 26, 12, INK); box(g, hx - 12, hy - 9, 24, 10, '#1E3A8A');
      box(g, hx - 9, hy - 7, 6, 6, '#7DF9FF'); box(g, hx + 3, hy - 7, 6, 6, '#7DF9FF'); box(g, hx - 9, hy - 7, 2, 2, '#FFFFFF'); box(g, hx + 3, hy - 7, 2, 2, '#FFFFFF');
      for (let k = 0; k < 5; k++) box(g, hx - 8 + k * 4, hy + 8, 2, 4, '#64748B');
      for (const s of [-1, 1]) { shadeBall(g, hx + s * 21, hy, 4, 7, R6('#94A3B8'), 1); }
      box(g, hx - 1, hy - 32, 2, 13, '#57534E'); shadeBall(g, hx, hy - 33, 4, 4, R6(fi % 2 ? '#EF4444' : '#FDE047'), 1);
      break;
    }
    case 'skeleton': {
      shadeBall(g, hx, hy, 21, 21, R6('#F5F5F4'));
      for (const ex of [-9, 9]) { g.fillStyle = INK; g.beginPath(); g.ellipse(hx + ex, hy - 3, 6, 7, 0, 0, Math.PI * 2); g.fill(); box(g, hx + ex - 1, hy - 3, 2, 2, fi % 2 ? '#86EFAC' : '#3F6212'); }
      poly(g, [[hx - 2, hy + 6], [hx, hy + 2], [hx + 2, hy + 6]], INK);
      box(g, hx - 9, hy + 10, 18, 6, INK); for (let k = 0; k < 6; k++) box(g, hx - 8 + k * 3, hy + 10, 2, 5, '#F5F5F4');
      break;
    }
    case 'knight': {
      shadeRR(g, hx - 17, hy - 21, 34, 40, [15, 15, 5, 5], R6('#D6D3D1'));
      box(g, hx - 11, hy - 5, 22, 4, INK); box(g, hx - 1, hy - 5, 3, 14, INK); for (let k = 0; k < 4; k++) box(g, hx - 9 + k * 6, hy + 6, 2, 2, INK);
      box(g, hx - 17, hy - 9, 34, 2, '#F2C84A');
      for (let k = 0; k < 4; k++) shadeBall(g, hx - 4 + k * 3, hy - 28 - k * 2, 4, 9, R6(k % 2 ? '#DC2626' : '#2563EB'), 1);
      break;
    }
    case 'parrot': {
      shadeBall(g, hx, hy, 21, 21, R);
      shadeBall(g, hx - 6, hy + 2, 9, 8, R6('#F8FAFC'), 1);
      poly(g, [[hx + 9, hy - 6], [hx + 30, hy - 2], [hx + 22, hy + 10], [hx + 12, hy + 16]], '#FDE047', 1.5); poly(g, [[hx + 12, hy + 8], [hx + 22, hy + 10], [hx + 12, hy + 16]], '#C8A010');
      eye(g, hx - 3, hy - 6, 6, 6, 2);
      for (let k = 0; k < 3; k++) shadeBall(g, hx - 6 + k * 6, hy - 25, 3, 8, R6(['#22C55E', '#3B82F6', '#FDE047'][k]), 1);
      break;
    }
    case 'star': {
      const pts: [number, number][] = []; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 12 : 27; pts.push([hx + Math.cos(a) * r, hy + Math.sin(a) * r]); }
      poly(g, pts, R[3], 1.5); poly(g, [pts[9], pts[0], pts[1], [hx, hy]], R[5]); poly(g, [pts[3], pts[4], pts[5], [hx, hy]], R[2]); poly(g, [pts[5], pts[6], pts[7], [hx, hy]], R[1]);
      box(g, hx - 13, hy - 9, 26, 6, INK); box(g, hx - 12, hy - 8, 10, 4, '#3F3F46'); box(g, hx + 2, hy - 8, 10, 4, '#3F3F46'); box(g, hx - 11, hy - 8, 2, 1, '#FFFFFF');
      g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(hx, hy + 3, 6, 0.3, Math.PI - 0.3); g.stroke();
      break;
    }
    case 'globe': {
      shadeBall(g, hx, hy, 23, 23, R6('#3B82F6'));
      for (const [dx, dy, w, h] of [[-13, -12, 12, 9], [3, -3, 13, 14], [-7, 8, 9, 6]] as const) { box(g, hx + dx, hy + dy, w, h, '#22C55E'); box(g, hx + dx, hy + dy, w, 2, '#86EFAC'); box(g, hx + dx + w - 2, hy + dy, 2, h, '#15803D'); }
      g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 1; g.beginPath(); g.ellipse(hx, hy, 23, 8, 0, 0, Math.PI * 2); g.moveTo(hx, hy - 23); g.ellipse(hx, hy, 9, 23, 0, 0, Math.PI * 2); g.stroke();
      for (const ex of [-7, 7]) eye(g, hx + ex, hy - 5, 5, 5);
      g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(hx, hy + 6, 8, 0.2, Math.PI - 0.2); g.stroke();
      break;
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Carts, benches, bins

export type Cart = 'balloons' | 'popcorn' | 'icecream' | 'churros';
/** A spoked wheel. */
const wheel = (g: Ctx, x: number, y: number, r: number) => {
  g.fillStyle = INK; g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3F3F46'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#C9A227'; g.beginPath(); g.arc(x, y, r - 2.5, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#8A6A10'; g.lineWidth = 1; g.beginPath(); for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; g.moveTo(x, y); g.lineTo(x + Math.cos(a) * (r - 2), y + Math.sin(a) * (r - 2)); } g.stroke();
  box(g, x - 1, y - 1, 3, 3, '#FFF0A8'); box(g, x - r + 1, y - r * 0.3, 2, 2, '#71717A');
};
export const paintCart = (g: Ctx, kind: Cart) => {
  const body = { balloons: '#F4F0E8', popcorn: '#DC2626', icecream: '#F9A8D4', churros: '#F59E0B' }[kind], R = R6(body), Au = R6('#D09A30');
  // (the body: paneled, gold trim, the name board, the push handle; wheels)
  box(g, 30, -38, 14, 2, INK); box(g, 42, -40, 3, 6, INK);
  shadeRR(g, -34, -46, 68, 34, 3, R);
  for (const px of [-30, -2]) { box(g, px, -40, 26, 20, R[2]); box(g, px, -40, 26, 1, R[1]); box(g, px, -21, 26, 1, R[4]); }
  box(g, -34, -46, 68, 3, Au[3]); box(g, -34, -46, 68, 1, Au[5]); box(g, -34, -16, 68, 3, Au[2]);
  const name = { balloons: 'BALLOONS', popcorn: 'POPCORN', icecream: 'ICE CREAM', churros: 'CHURROS' }[kind];
  box(g, -27, -37, 54, 11, INK); box(g, -26, -36, 52, 9, '#F8FAFC');
  signText(g, name, 0, -29, { sx: 1, sy: 1, fill: kind === 'popcorn' ? ['#B91C1C', '#7F1D1D'] : ['#1E3A8A', '#142A66'], dither: true });
  wheel(g, -22, -8, 8); wheel(g, 22, -8, 8);
  if (kind === 'popcorn') {
    // (the glass case: popcorn heaped in it, the kettle, its red roof scalloped)
    box(g, -27, -82, 54, 37, INK); box(g, -26, -81, 52, 35, 'rgba(224, 242, 254, 0.6)');
    for (let k = 0; k < 30; k++) box(g, -24 + (k * 13) % 48, -56 - (k * 7) % 12, 4, 4, k % 3 ? '#FEF08A' : '#FFFFFF');
    box(g, -26, -60, 52, 14, '#FDE047'); checker(g, -26, -62, 52, 2, '#FEF08A');
    shadeBall(g, 0, -72, 8, 6, R6('#A8A29E'), 1); box(g, -1, -80, 2, 4, '#57534E');
    box(g, -26, -81, 2, 35, '#FFFFFF'); box(g, -10, -81, 1, 35, '#E0F2FE');
    for (let k = 0; k < 7; k++) { g.fillStyle = INK; g.beginPath(); g.arc(-27 + k * 9, -84, 5, Math.PI, 0); g.fill(); g.fillStyle = k % 2 ? '#F8FAFC' : '#DC2626'; g.beginPath(); g.arc(-27 + k * 9, -84, 4, Math.PI, 0); g.fill(); }
    box(g, -32, -92, 64, 8, INK); for (let k = 0; k < 8; k++) box(g, -31 + k * 8, -91, 8, 6, k % 2 ? '#F8FAFC' : '#DC2626');
    shadeBall(g, 0, -96, 4, 4, Au, 1);
  }
  if (kind === 'icecream' || kind === 'churros') {
    // (the umbrella: gores in their own steps, a scalloped edge, its finial; what's sold on top)
    box(g, -1, -112, 3, 66, '#57534E'); box(g, -1, -112, 1, 66, '#A8A29E');
    for (let k = 0; k < 6; k++) { const a = -40 + k * 13.3, b = a + 13.3, col = k % 2 ? '#F8FAFC' : kind === 'icecream' ? '#38BDF8' : '#DC2626', C = R6(col); poly(g, [[0, -118], [a, -96], [b, -96]], k < 3 ? C[3] : C[2], 1); poly(g, [[0, -118], [a, -96], [a + 4, -96]], C[4]); g.fillStyle = INK; g.beginPath(); g.arc(a + 6.6, -96, 6.6, 0, Math.PI); g.fill(); g.fillStyle = C[2]; g.beginPath(); g.arc(a + 6.6, -96, 5.6, 0, Math.PI); g.fill(); }
    shadeBall(g, 0, -120, 3, 3, Au, 1);
    if (kind === 'icecream') for (let k = 0; k < 3; k++) { shadeBall(g, -14 + k * 14, -52, 6, 5, R6(['#FBCFE8', '#FEF3C7', '#92400E'][k]), 1); box(g, -16 + k * 14, -48, 4, 2, '#C8924A'); }
    else for (let k = 0; k < 5; k++) { box(g, -21 + k * 9, -62, 6, 18, INK); box(g, -20 + k * 9, -61, 4, 17, '#C2741A'); box(g, -20 + k * 9, -61, 1, 17, '#E8A050'); for (let j = 0; j < 4; j++) box(g, -19 + k * 9, -58 + j * 4, 2, 1, '#8A4A10'); }
  }
  if (kind === 'balloons') { box(g, -2, -92, 3, 48, '#57534E'); box(g, -2, -92, 1, 48, '#A8A29E'); }
};
export const paintBench = (g: Ctx) => {
  // (cast iron ends, curled; slats of wood each lit along its top; bolts)
  const W = R6('#8A5A32');
  for (const lx of [-32, 28]) { box(g, lx - 1, -38, 6, 38, INK); box(g, lx, -37, 4, 36, '#3F3F46'); box(g, lx, -37, 1, 36, '#71717A'); g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(lx + 2 + (lx < 0 ? -3 : 3), -4, 3, 0, Math.PI * 2); g.stroke(); }
  for (const [y, h] of [[-17, 5], [-36, 4], [-29, 4]] as const) { box(g, -37, y - 1, 74, h + 2, INK); box(g, -36, y, 72, h, W[3]); box(g, -36, y, 72, 1, W[5]); box(g, -36, y + h - 1, 72, 1, W[1]); for (let k = 0; k < 6; k++) box(g, -30 + k * 12, y + 1, 4, 1, W[2]); }
  for (const lx of [-32, 28]) for (const y of [-15, -34, -27]) box(g, lx + 1, y, 2, 2, '#A1A1AA');
  box(g, -38, -1, 76, 2, 'rgba(26,16,40,0.25)');
};
export const paintBin = (g: Ctx) => {
  shadeRR(g, -11, -32, 22, 32, 2, R6('#2F6B3A'));
  for (let k = 0; k < 4; k++) box(g, -9 + k * 6, -30, 1, 28, '#1F4A28');
  shadeBall(g, 0, -33, 13, 4, R6('#24542F'), 1);
  box(g, -5, -24, 10, 8, '#F8FAFC'); box(g, -4, -23, 8, 6, '#DC2626'); box(g, -1, -22, 2, 4, '#FDE047');
  box(g, -6, -40, 8, 6, INK); box(g, -5, -39, 6, 4, '#F8FAFC'); box(g, 3, -38, 5, 4, INK); box(g, 4, -37, 3, 2, '#DC2626');
};

/** The parade floats: a tiered cake (the candles, piped icing, a scalloped skirt fringed in gold), and a rocket on its
 *  launch tower (fins, portholes, steam puffing round its feet). Two frames each. */
export const paintFloat = (g: Ctx, kind: number, fi: number) => {
  const skirt = R6(['#EC4899', '#2563EB'][kind]), Au = R6('#D09A30');
  box(g, -91, -35, 182, 32, INK);
  for (let x = -90; x < 90; x += 6) box(g, x, -34, 6, 30, skirt[(x / 6) % 2 ? 3 : 2]);
  box(g, -90, -34, 180, 3, skirt[5]); box(g, -90, -8, 180, 4, Au[3]); for (let x = -90; x < 90; x += 3) box(g, x, -4, 2, 3 + (x / 3) % 2, Au[4]);
  for (let k = 0; k < 12; k++) { g.fillStyle = INK; g.beginPath(); g.arc(-82 + k * 15, -30, 7.5, 0, Math.PI); g.fill(); g.fillStyle = skirt[4]; g.beginPath(); g.arc(-82 + k * 15, -30, 6.5, 0, Math.PI); g.fill(); }
  for (const wx of [-60, 60]) { g.fillStyle = INK; g.beginPath(); g.arc(wx, -3, 6, Math.PI, 0); g.fill(); }
  if (kind === 0) {
    const tiers = [R6('#FDE68A'), R6('#FBCFE8'), R6('#FDE68A')];
    for (let t = 0; t < 3; t++) {
      const w = 70 - t * 18, y = -35 - (t + 1) * 22;
      shadeRR(g, -w, y, w * 2, 22, 2, tiers[t]);
      for (let k = -w; k < w; k += 10) { g.fillStyle = INK; g.beginPath(); g.arc(k + 5, y + 2, 4.5, 0, Math.PI); g.fill(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(k + 5, y + 2, 3.5, 0, Math.PI); g.fill(); }
      for (let k = -w + 6; k < w; k += 14) { box(g, k, y + 10, 3, 3, '#DC2626'); box(g, k, y + 10, 1, 1, '#FCA5A5'); }
    }
    for (let k = 0; k < 5; k++) { box(g, -21 + k * 10, -126, 5, 12, INK); box(g, -20 + k * 10, -125, 3, 11, '#F8FAFC'); box(g, -20 + k * 10, -125, 1, 11, '#FFFFFF'); const fl = (k + fi) % 2; box(g, -20 + k * 10, -131 - fl, 3, 5, '#F59E0B'); box(g, -19 + k * 10, -130 - fl, 1, 3, '#FFF7C2'); }
  } else {
    // (the launch tower behind it, the rocket: columns of chrome, red nose and fins, portholes, a band)
    box(g, 30, -130, 12, 96, INK); box(g, 31, -129, 10, 94, '#B91C1C'); g.strokeStyle = '#7F1D1D'; g.lineWidth = 1; g.beginPath(); for (let y = -129; y < -35; y += 10) { g.moveTo(31, y); g.lineTo(41, y + 10); g.moveTo(41, y); g.lineTo(31, y + 10); } g.stroke();
    const C = ['#2A3248', '#4A5670', '#7A88A4', '#AEBAD0', '#DCE4F0', '#FFFFFF'];
    for (let u = 0; u < 28; u += 2) box(g, -14 + u, -110, 2, 76, C[u < 4 ? 4 : u < 8 ? 5 : u < 16 ? 4 : u < 22 ? 3 : 2]);
    box(g, -15, -110, 1, 76, INK); box(g, 14, -110, 1, 76, INK);
    poly(g, [[-14, -110], [0, -142], [14, -110]], '#DC2626', 1.5); poly(g, [[-13, -111], [0, -140], [-4, -111]], '#F87171');
    for (const s of [-1, 1]) poly(g, [[s * 14, -34], [s * 30, -34], [s * 14, -66]], s < 0 ? '#DC2626' : '#991B1B', 1.5);
    box(g, -14, -76, 28, 4, '#DC2626'); box(g, -14, -76, 28, 1, '#FCA5A5');
    for (const py of [-96, -60]) shadeBall(g, 0, py, 6, 6, R6('#38BDF8'), 1.5);
    for (let k = 0; k < 3; k++) { const r = 10 + ((k + fi) % 2) * 2; g.fillStyle = '#E2E8F0'; g.beginPath(); g.arc(-40 + k * 40, -40 - ((k + fi) % 2) * 4, r, 0, Math.PI * 2); g.fill(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(-43 + k * 40, -44 - ((k + fi) % 2) * 4, r * 0.6, 0, Math.PI * 2); g.fill(); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The flower beds along the front (one stamp each, three looks)

export const paintFlowerBed = (g: Ctx, kind: number) => {
  // (clipped shrubs in stepped shells, flowers dotted through, a stone edging)
  const L = R6('#2F6B3A'), L2 = R6('#3F8A4A');
  for (const [dx, r, R] of [[0, 34, L], [44, 26, L2], [80, 30, L]] as const) {
    g.fillStyle = INK; g.beginPath(); g.arc(dx, 8, r + 1, Math.PI, 0); g.fill();
    for (const [k, col] of [[1, R[1]], [0.84, R[2]], [0.6, R[3]], [0.34, R[4]]] as const) { g.fillStyle = col; g.beginPath(); g.arc(dx - r * (1 - k) * 0.4, 8 - r * (1 - k) * 0.3, r * k, Math.PI, 0); g.fill(); }
    checker(g, dx - r * 0.8, 8 - r * 0.45, r * 1.3, 2, R[3]);
    for (let k = 0; k < 9; k++) { const a = Math.PI + 0.2 + (k / 9) * (Math.PI - 0.4), rr = r * (0.5 + hash(dx + k + kind) * 0.4), fx = dx + Math.cos(a) * rr, fy = 8 + Math.sin(a) * rr; box(g, fx - 1, fy - 1, 3, 3, ['#F472B6', '#FDE047', '#F87171', '#FFFFFF', '#A78BFA'][(k + kind) % 5]); box(g, fx, fy, 1, 1, '#FFFFFF'); }
  }
  for (let k = 0; k < 8; k++) box(g, -20 + k * 15, -14 - (k % 3) * 5, 5, 5, ['#F472B6', '#FDE047', '#F87171'][(k + kind) % 3]);
};

/** A pigeon's look doesn't change: crowd.ts keeps those. */
export const pigeonCols = ['#6B7280', '#9CA3AF', '#4B5563'];
void mix;
