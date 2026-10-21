// The show's gross-ups (the user's: "make the chelsea and socks wacky adventures poster look 'ren & stimpy' gross"):
// the cartoon stopped dead on a lovingly over-rendered close-up. Socks the cat: matted fur in clumps, bloodshot veiny
// eyes with bags under them, bared gums and yellow teeth, a hairball on his tongue, drool, stubble and broken whiskers,
// pores on his muzzle, a flea or two. Chelsea (the cartoon one) in an inset: a goofy over-detailed grin, braces, curls,
// freckles; mild, nothing mean. Stepped ramps, dithered seams, inked; painted once into stamps (the promo board, the
// screen's title card).

import { box, INK, checker, type Ctx, hash, bands } from './paint';

const C = {
  fur: ['#0E0C10', '#1C1A1E', '#2C2930', '#423D48', '#5C5664'],
  white: ['#9A9080', '#C4BAA6', '#E2D9C6', '#F4EEDF'],
  eye: ['#C9B97A', '#E4D9A6', '#F4ECC8', '#FFFBE6'],
  vein: '#C81E1E', veinLite: '#E85A5A',
  gum: ['#5A0E1C', '#8E1E30', '#B8384A', '#E36A7A'],
  tooth: ['#8A7A3A', '#BFAE64', '#E2D59A', '#F6EEC8'],
  pink: ['#8E3A4A', '#C8606E', '#E8949E', '#F8C4C8'],
  drool: ['rgba(190,226,240,0.85)', 'rgba(230,248,255,0.95)'],
  hair: ['#3A2E22', '#5E4C3A', '#7E6A54', '#9C8870'],
};
const ell = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string, a0 = 0, a1 = Math.PI * 2) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, a0, a1); g.fill(); };
const line = (g: Ctx, pts: number[], col: string, w = 1) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.stroke(); };

/** A bloodshot eye (middle x, y; rx, ry), the pupil off to `look`, veins branching in from the rim, a bag under it. */
const grossEye = (g: Ctx, x: number, y: number, rx: number, ry: number, look: number, seed: number) => {
  // (the bag under it, in two steps, and the lid's heavy fold over it)
  ell(g, x, y + ry * 0.55, rx * 1.05, ry * 0.7, '#3A2A44'); ell(g, x, y + ry * 0.45, rx * 0.95, ry * 0.55, '#56405E');
  ell(g, x, y, rx + 2, ry + 2, INK);
  ell(g, x, y, rx, ry, C.eye[1]);
  ell(g, x - rx * 0.12, y - ry * 0.1, rx * 0.82, ry * 0.8, C.eye[2]);
  ell(g, x - rx * 0.3, y - ry * 0.35, rx * 0.35, ry * 0.25, C.eye[3]);
  // (the pink rim, dithered in)
  g.save(); g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.clip();
  checker(g, x - rx, y + ry * 0.55, rx * 2, ry * 0.5, 'rgba(232,90,90,0.55)', 0, 1);
  // (the veins: from the rim in, forking)
  for (let i = 0; i < 9; i++) {
    const a = hash(seed + i * 1.7) * Math.PI * 2, r0 = 1.02, r1 = 0.45 + hash(seed + i * 3.1) * 0.25;
    const sx = x + Math.cos(a) * rx * r0, sy = y + Math.sin(a) * ry * r0, mx = x + Math.cos(a + 0.2) * rx * (r0 + r1) / 2, my = y + Math.sin(a + 0.2) * ry * (r0 + r1) / 2;
    const ex = x + Math.cos(a - 0.1) * rx * r1, ey = y + Math.sin(a - 0.1) * ry * r1;
    line(g, [sx, sy, mx, my, ex, ey], C.vein, 1.4);
    line(g, [mx, my, mx + Math.cos(a + 1.3) * rx * 0.18, my + Math.sin(a + 1.3) * ry * 0.18], C.veinLite, 1);
  }
  g.restore();
  // (the pupil: a pinprick, way off where it ought to be)
  const px = x + look * rx * 0.35, py = y + ry * 0.05;
  ell(g, px, py, rx * 0.2, ry * 0.24, '#4A6A20'); ell(g, px, py, rx * 0.08, ry * 0.14, INK); box(g, px - 1, py - ry * 0.12, 2, 2, '#FFFFFF');
  // (the lid: a droopy fold of fur over its top)
  g.fillStyle = C.fur[2]; g.beginPath(); g.ellipse(x, y - ry * 0.78, rx * 1.12, ry * 0.36, 0, Math.PI, 0); g.fill();
  line(g, [x - rx * 1.05, y - ry * 0.74, x - rx * 0.4, y - ry * 0.6, x + rx * 0.4, y - ry * 0.62, x + rx * 1.05, y - ry * 0.78], INK, 2);
};

/** Socks, grossed up: his face's middle at x, y, R its radius. */
export const grossSocks = (g: Ctx, x: number, y: number, R: number) => {
  // (the ears: torn, the insides pink and veined, hairs out of them)
  for (const s of [-1, 1]) {
    const bx = x + s * R * 0.62, by = y - R * 0.55;
    g.fillStyle = INK; g.beginPath(); g.moveTo(bx - s * R * 0.42, by + R * 0.12); g.lineTo(bx + s * R * 0.2, by - R * 0.78); g.lineTo(bx + s * R * 0.36, by + R * 0.22); g.closePath(); g.fill();
    g.fillStyle = C.fur[2]; g.beginPath(); g.moveTo(bx - s * R * 0.36, by + R * 0.1); g.lineTo(bx + s * R * 0.19, by - R * 0.7); g.lineTo(bx + s * R * 0.3, by + R * 0.18); g.closePath(); g.fill();
    g.fillStyle = C.pink[2]; g.beginPath(); g.moveTo(bx - s * R * 0.2, by + R * 0.06); g.lineTo(bx + s * R * 0.16, by - R * 0.52); g.lineTo(bx + s * R * 0.2, by + R * 0.12); g.closePath(); g.fill();
    line(g, [bx, by, bx + s * R * 0.08, by - R * 0.22, bx + s * R * 0.14, by - R * 0.4], C.vein, 1);
    for (let k = 0; k < 4; k++) line(g, [bx + s * R * (0.05 + k * 0.03), by + R * 0.04, bx + s * R * (0.02 + k * 0.05), by - R * 0.12], '#D8D0C0', 1);
    // (a notch torn out of the right one)
    if (s > 0) { box(g, bx + R * 0.1, by - R * 0.38, R * 0.08, R * 0.08, INK); }
  }
  // (the head: matted fur in clumps round the edge, dithered mats over it, lit up top left)
  g.fillStyle = INK; g.beginPath();
  for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2, rr = R * (1.04 + (i % 2 ? 0.1 : 0) * (0.6 + hash(i * 2.3) * 0.8)); g.lineTo(x + Math.cos(a) * rr * 1.08, y + Math.sin(a) * rr * 0.94); }
  g.closePath(); g.fill();
  ell(g, x, y, R * 1.08, R * 0.94, C.fur[1]);
  ell(g, x - R * 0.1, y - R * 0.12, R * 0.92, R * 0.76, C.fur[2]);
  ell(g, x - R * 0.3, y - R * 0.38, R * 0.48, R * 0.3, C.fur[3]);
  g.save(); g.beginPath(); g.ellipse(x, y, R * 1.08, R * 0.94, 0, 0, Math.PI * 2); g.clip();
  checker(g, x - R * 1.1, y + R * 0.3, R * 2.2, R * 0.7, C.fur[0], 0, 2);
  // (the mats: wet clumps, each its own little ramp, strands off them)
  for (let i = 0; i < 26; i++) {
    const a = hash(i * 4.1) * Math.PI * 2, rr = Math.sqrt(hash(i * 7.3)) * R, cx = x + Math.cos(a) * rr, cy = y + Math.sin(a) * rr * 0.86;
    const L = cy < y - R * 0.2 ? C.fur[4] : C.fur[3];
    line(g, [cx - 4, cy + 3, cx, cy - 4, cx + 3, cy + 2], L, 1.6);
    line(g, [cx - 1, cy + 4, cx + 2, cy - 2], C.fur[0], 1);
  }
  g.restore();
  // (the eyes: one bigger than the other, both looking nowhere good)
  grossEye(g, x - R * 0.42, y - R * 0.24, R * 0.33, R * 0.3, -0.6, 3);
  grossEye(g, x + R * 0.42, y - R * 0.27, R * 0.4, R * 0.36, 0.5, 11);
  // (the muzzle: white fur gone yellow, pores, stubble)
  ell(g, x, y + R * 0.38, R * 0.62, R * 0.44, INK);
  ell(g, x, y + R * 0.38, R * 0.6, R * 0.42, C.white[1]);
  ell(g, x - R * 0.08, y + R * 0.3, R * 0.48, R * 0.3, C.white[2]);
  ell(g, x - R * 0.2, y + R * 0.18, R * 0.2, R * 0.1, C.white[3]);
  checker(g, x - R * 0.5, y + R * 0.58, R, R * 0.14, C.white[0], 0, 2);
  for (let i = 0; i < 46; i++) {
    const a = hash(i * 5.7) * Math.PI * 2, rr = Math.sqrt(hash(i * 2.9)), px = x + Math.cos(a) * rr * R * 0.55, py = y + R * 0.38 + Math.sin(a) * rr * R * 0.36;
    box(g, Math.round(px), Math.round(py), i % 3 ? 1 : 2, 1, i % 3 ? '#4A4038' : '#8E7E62');
  }
  // (the nose: wet, cracked, a glisten)
  g.fillStyle = INK; g.beginPath(); g.moveTo(x - R * 0.14, y + R * 0.08); g.lineTo(x + R * 0.14, y + R * 0.08); g.lineTo(x, y + R * 0.24); g.closePath(); g.fill();
  g.fillStyle = C.pink[1]; g.beginPath(); g.moveTo(x - R * 0.11, y + R * 0.1); g.lineTo(x + R * 0.11, y + R * 0.1); g.lineTo(x, y + R * 0.21); g.closePath(); g.fill();
  box(g, x - R * 0.07, y + R * 0.11, R * 0.06, 2, C.pink[3]); box(g, x - R * 0.06, y + R * 0.15, 2, 2, C.pink[0]); box(g, x + R * 0.04, y + R * 0.15, 2, 2, C.pink[0]);
  // (the mouth: wide open, gums bared, teeth yellow and gappy, the tongue, the hairball on it)
  const my = y + R * 0.46, mw = R * 0.54, mh = R * 0.38;
  g.fillStyle = INK; g.beginPath(); g.moveTo(x - mw - 3, my - 3); g.quadraticCurveTo(x, my - mh * 0.5, x + mw + 3, my - 3); g.quadraticCurveTo(x, my + mh * 1.3, x - mw - 3, my - 3); g.fill();
  g.fillStyle = C.gum[0]; g.beginPath(); g.moveTo(x - mw, my - 1); g.quadraticCurveTo(x, my - mh * 0.45, x + mw, my - 1); g.quadraticCurveTo(x, my + mh * 1.2, x - mw, my - 1); g.fill();
  // (the gums along the top: a ramp, lit along their curve)
  g.fillStyle = C.gum[2]; g.beginPath(); g.moveTo(x - mw, my - 1); g.quadraticCurveTo(x, my - mh * 0.45, x + mw, my - 1); g.quadraticCurveTo(x, my + mh * 0.05, x - mw, my - 1); g.fill();
  line(g, [x - mw * 0.8, my - 2, x - mw * 0.3, my - mh * 0.16, x + mw * 0.3, my - mh * 0.16, x + mw * 0.8, my - 2], C.gum[3], 1.4);
  // (the teeth: crooked, a couple missing, brown at the roots)
  for (let i = 0; i < 9; i++) {
    if (i === 3 || i === 7) continue;
    const u = (i + 0.5) / 9, tx = x - mw * 0.86 + u * mw * 1.72, top = my - mh * 0.16 * Math.sin(u * Math.PI) + 2, th = (i === 1 || i === 7 ? 11 : 7) + (i % 3), tw = mw * 0.16;
    box(g, tx - tw / 2 - 1, top - 1, tw + 2, th + 2, INK); box(g, tx - tw / 2, top, tw, th, C.tooth[2]); box(g, tx - tw / 2, top, tw * 0.4, th, C.tooth[3]); box(g, tx - tw / 2, top, tw, 2, C.tooth[0]);
    if (i % 2) box(g, tx, top + th - 3, 2, 2, C.tooth[1]);
  }
  // (the tongue, and the hairball on it: a wet wad, strands off it)
  ell(g, x + mw * 0.1, my + mh * 0.62, mw * 0.5, mh * 0.3, C.pink[1]); ell(g, x, my + mh * 0.55, mw * 0.32, mh * 0.16, C.pink[2]);
  const hx = x + mw * 0.2, hy = my + mh * 0.5;
  ell(g, hx, hy, R * 0.12, R * 0.08, INK); ell(g, hx, hy, R * 0.11, R * 0.07, C.hair[1]); ell(g, hx - 2, hy - 2, R * 0.06, R * 0.04, C.hair[3]);
  for (let k = 0; k < 7; k++) { const a = k * 0.9; line(g, [hx + Math.cos(a) * R * 0.06, hy + Math.sin(a) * R * 0.04, hx + Math.cos(a) * R * 0.15, hy + Math.sin(a) * R * 0.1 + 2], C.hair[k % 2 ? 0 : 2], 1); }
  // (the drool: two long strands off his lip, a drop at each end)
  for (const [dx, len] of [[-0.62, 0.55], [0.5, 0.75]] as [number, number][]) {
    const sx = x + mw * dx, sy = my + mh * 0.3;
    g.strokeStyle = C.drool[0]; g.lineWidth = 3; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(sx + 3, sy + R * len * 0.5, sx - 1, sy + R * len); g.stroke();
    g.strokeStyle = C.drool[1]; g.lineWidth = 1; g.stroke();
    ell(g, sx - 1, sy + R * len + 3, 3, 4, C.drool[0]); box(g, sx - 2, sy + R * len + 1, 1, 2, '#FFFFFF');
  }
  // (the whiskers: bent, one snapped, stubble at their roots)
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const rx0 = x + s * R * 0.42, ry0 = y + R * (0.3 + k * 0.08);
    const bend = k === 1 ? 0.5 : -0.1, len = k === 2 && s > 0 ? 0.35 : 0.75;
    line(g, [rx0, ry0, rx0 + s * R * len * 0.5, ry0 + R * 0.04 * (k - 1), rx0 + s * R * len, ry0 + R * bend * 0.3], '#E8E2D2', 1.2);
    box(g, rx0 - 1, ry0 - 1, 2, 2, '#2A2420');
  }
  // (the fleas: a couple of specks hopping off him)
  for (let k = 0; k < 4; k++) box(g, x + R * (-0.9 + hash(k * 9.1) * 1.8), y - R * (0.7 + hash(k * 3.3) * 0.5), 2, 2, '#3A2A1A');
  // (the bow tie, crushed)
  const by = y + R * 0.95;
  g.fillStyle = INK; g.beginPath(); g.moveTo(x - R * 0.34, by - R * 0.14); g.lineTo(x, by); g.lineTo(x - R * 0.34, by + R * 0.12); g.closePath(); g.moveTo(x + R * 0.3, by - R * 0.1); g.lineTo(x, by); g.lineTo(x + R * 0.32, by + R * 0.16); g.closePath(); g.fill();
  g.fillStyle = '#B91C1C'; g.beginPath(); g.moveTo(x - R * 0.3, by - R * 0.1); g.lineTo(x - 2, by); g.lineTo(x - R * 0.3, by + R * 0.08); g.closePath(); g.moveTo(x + R * 0.26, by - R * 0.06); g.lineTo(x + 2, by); g.lineTo(x + R * 0.28, by + R * 0.12); g.closePath(); g.fill();
  box(g, x - R * 0.26, by - R * 0.06, R * 0.1, 2, '#EF4444');
  ell(g, x, by, R * 0.07, R * 0.07, INK); ell(g, x, by, R * 0.05, R * 0.05, '#7F1D1D');
};

/** Chelsea (the cartoon one), grossed up a little: an inset round portrait (middle x, y; radius r), curls, freckles,
 *  big eyes, and the grin: every tooth, every bracket of her braces. Goofy, not mean. */
export const grossChelsea = (g: Ctx, x: number, y: number, r: number) => {
  ell(g, x, y, r + 3, r + 3, INK); bands(g, x - r, y - r, r * 2, r * 2, ['#F9A8D4', '#FBCFE8', '#FCE7F3']);
  g.save(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.clip();
  checker(g, x - r, y - r, r * 2, r * 2, 'rgba(236,72,153,0.18)', 0, 2);
  const HAIR = ['#5A2A10', '#8A4A1E', '#B8682E', '#D88A4A'];
  // (the curls: a big round cloud of them, each its own ramp)
  for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2, cx = x + Math.cos(a) * r * 0.62, cy = y - r * 0.12 + Math.sin(a) * r * 0.58; ell(g, cx, cy, r * 0.2, r * 0.2, INK); ell(g, cx, cy, r * 0.18, r * 0.18, HAIR[1]); ell(g, cx - 1.5, cy - 1.5, r * 0.1, r * 0.1, HAIR[2]); box(g, cx - 3, cy - 3, 2, 2, HAIR[3]); }
  // (her face)
  ell(g, x, y + r * 0.08, r * 0.52, r * 0.6, INK); ell(g, x, y + r * 0.08, r * 0.5, r * 0.58, '#F2C8A4'); ell(g, x - r * 0.12, y - r * 0.08, r * 0.3, r * 0.3, '#FADCBE');
  for (let i = 0; i < 4; i++) { const cx = x - r * 0.5 + i * r * 0.33, cy = y - r * 0.5; ell(g, cx, cy, r * 0.17, r * 0.15, INK); ell(g, cx, cy, r * 0.15, r * 0.13, HAIR[1]); }
  // (the eyes: big, lashes, a shine)
  for (const s of [-1, 1]) { const ex = x + s * r * 0.2, ey = y - r * 0.06; ell(g, ex, ey, r * 0.13, r * 0.15, INK); ell(g, ex, ey, r * 0.11, r * 0.13, '#FFFFFF'); ell(g, ex + s, ey + 1, r * 0.06, r * 0.08, '#2A6A9E'); ell(g, ex + s, ey + 1, r * 0.03, r * 0.04, INK); box(g, ex - 1, ey - 2, 2, 2, '#FFFFFF'); for (let k = 0; k < 3; k++) line(g, [ex - r * 0.08 + k * r * 0.08, ey - r * 0.13, ex - r * 0.1 + k * r * 0.1, ey - r * 0.2], INK, 1); }
  // (freckles, a lot of them)
  for (let i = 0; i < 14; i++) box(g, x + (hash(i * 1.9) - 0.5) * r * 0.7, y + r * 0.06 + hash(i * 4.3) * r * 0.14, 1, 1, '#B8682E');
  // (the grin: ear to ear, every tooth, the braces' brackets and wire)
  const my = y + r * 0.3, mw = r * 0.34;
  g.fillStyle = INK; g.beginPath(); g.moveTo(x - mw - 2, my - 2); g.quadraticCurveTo(x, my - 3, x + mw + 2, my - 2); g.quadraticCurveTo(x, my + r * 0.3, x - mw - 2, my - 2); g.fill();
  g.fillStyle = '#7F1D1D'; g.beginPath(); g.moveTo(x - mw, my); g.quadraticCurveTo(x, my - 1, x + mw, my); g.quadraticCurveTo(x, my + r * 0.25, x - mw, my); g.fill();
  box(g, x - mw * 0.86, my, mw * 1.72, r * 0.1, '#FFFFFF');
  for (let i = 0; i < 7; i++) { const tx = x - mw * 0.8 + i * mw * 0.27; box(g, tx, my, 1, r * 0.1, '#C8C2B4'); box(g, tx + 2, my + 2, 3, 3, '#6B7280'); box(g, tx + 2, my + 2, 1, 1, '#E5E7EB'); }
  box(g, x - mw * 0.86, my + 3, mw * 1.72, 1, '#9CA3AF');
  ell(g, x, my + r * 0.16, mw * 0.4, r * 0.05, '#E36A7A');
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
};

/** The gross-up's backdrop: the cartoon's flat sickly color in bands, a halftone of dots, rays off the middle. */
export const grossBack = (g: Ctx, x: number, y: number, w: number, h: number) => {
  bands(g, x, y, w, h, ['#3F6212', '#65A30D', '#84CC16', '#A3E635', '#BEF264']);
  const cx = x + w / 2, cy = y + h * 0.55;
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; g.fillStyle = i % 2 ? 'rgba(250,204,21,0.22)' : 'rgba(124,58,237,0.16)'; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * w, cy + Math.sin(a) * w); g.lineTo(cx + Math.cos(a + 0.39) * w, cy + Math.sin(a + 0.39) * w); g.closePath(); g.fill(); }
  for (let yy = y + 4; yy < y + h; yy += 6) for (let xx = x + ((yy - y) / 6 % 2) * 3; xx < x + w; xx += 6) box(g, xx, yy, 1, 1, 'rgba(26,46,5,0.35)');
};
