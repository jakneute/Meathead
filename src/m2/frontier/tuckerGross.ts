// TUCKER'S GROSS-UP (the user's rule for every close-up: "gross ren and stimpy style close ups"; grossKit.ts): the
// jumpscare that starts his real fight (arena/intro.ts: off the oak at Meathead, screaming), his screaming face snapped
// into the screen, every wound so far on it. Red to the ears, sweating, every pore and broken vein, the button nose gone
// purple at the tip; the conductor's cap split by the buzzsaw buried in his forehead (the blade foreshortened, its
// teeth caked, the hanger's arm snapped off), the slot meat and bone, blood sheeting down his brow; the near eye shot
// clean through (a ragged socket, daylight through it, the lens starred round the hole), the far eye bulging,
// bloodshot, behind its wire rim; the ginger muttonchops matted with blood and wood chips and a leaf; the waxed
// handlebar mustache gone limp on one side; the scream (gap teeth, the gums, the uvula, the tongue, spit strung); the
// branch through his chest at the bottom, bark and blood, the vest torn round it; sewer muck, chips, a leaf in his collar.
// Live: the mouth going while he screams (three stamps), blood dripping off his jaw, spit flying, the eye twitching.

import {
  type Ctx, type Buf, R, hexU, mixU, WHITE, newBuf, setSeed, rnd, matAt, plot, seg, path, ball, tint, poly, bead, eyeball, teeth, skinPost, stubble, vein, stamps, drawGrossStamp, grossBackdrop, bay, hash2, M_SKIN, M_HAIR, M_MOUTH, M_OTHER, M_CLOTH, M_METAL, SCLERA_R, MOUTH, TONGUE, GUM, BLOOD, TOOTH_B,
} from '../grossKit';

const FX = 136, FY = 100;

const RAGE = R('#FFC8B0', '#FFB09A', '#F59480', '#F27A66', '#D85848', '#B03A34', '#862220', '#4A0E0A');
const NOSE = R('#E8A0B0', '#D07A94', '#B45A7A', '#963E62', '#74284A', '#4A1430', '#280818');
const GINGER = R('#FFD0A0', '#F6B884', '#DC8A4E', '#B4642E', '#86441C', '#42200C');
const COAT = R('#7A8CC2', '#5A6CA2', '#36467E', '#283662', '#1A2446', '#0A0F22');
const VEST = R('#E07A78', '#C25A58', '#982F35', '#76222A', '#54161C', '#28080C');
const SHIRT = R('#FFFFFF', '#F4F0E6', '#D8D2C4', '#B2AA9A', '#8A8272', '#5E5A50');
const BRASS = R('#FFFCE0', '#FFF6BE', '#F4CC4E', '#CC9E2C', '#926E16', '#4A3608');
const PATENT = R('#A0A0AC', '#7A7A86', '#2A2A32', '#1A1A20', '#101014', '#020203');
const STEEL = R('#FFFFFF', '#E2E4E8', '#C4C8CE', '#A6AAB2', '#72767E', '#3A3C42');
const BARK = R('#C8A67A', '#A8865A', '#7A5634', '#5A3C20', '#3E2812', '#1E1208');
const IRIS = R('#A8D0F4', '#78A8DC', '#4A7AB0', '#2E5486', '#18325A', '#081428');
const LIP = R('#F0A098', '#DC7E78', '#C05E5C', '#9A4244', '#6E2A2E', '#3E1416');
const WIRE = hexU('#8A7A3A');

type Key = '0' | '1' | '2';

function* build(key: Key): Generator<void, Buf> {
  setSeed(1849);
  const n = +key;
  const b = newBuf();
  yield;
  // ---- the coat, the vest, the collar and the bow tie; the branch through his chest, the vest torn round it
  ball(b, FX, 262, 210, 96, COAT, { mat: M_CLOTH });
  for (const s of [-1, 1]) poly(b, [FX + s * 30, 178, FX + s * 110, 186, FX + s * 76, 204, FX + s * 30, 204], COAT, M_CLOTH);
  poly(b, [FX - 34, 182, FX + 34, 182, FX + 40, 204, FX - 40, 204], VEST, M_CLOTH);
  for (const s of [-1, 1]) poly(b, [FX, 184, FX + s * 26, 176, FX + s * 28, 192], R('#5A5A62', '#2A2A30', '#18181C', '#0C0C10', '#000000'), M_CLOTH);
  ball(b, FX, 184, 6, 6, R('#5A5A62', '#2A2A30', '#18181C', '#0C0C10', '#000000'), { mat: M_CLOTH, line: true });
  poly(b, [FX - 40, 170, FX + 40, 170, FX + 34, 180, FX - 34, 180], SHIRT, M_CLOTH);
  yield;
  // (the branch: in at the vest from the lower left, out of the frame; bark, blood up it, the hole's meat)
  for (let x = 0; x < 120; x++) {
    const y = 214 - x * 0.22, r = 12 - x * 0.04;
    for (let d = -r; d <= r; d++) { const v = (d + r) / (2 * r); plot(b, x, y + d, Math.abs(d) >= r - 1 ? BARK[5] : BARK[v < 0.25 ? 0 : v < 0.55 ? 1 : v < 0.8 ? 2 : 3], M_OTHER); }
    if (hash2(x, 3) < 0.3) seg(b, x, y - r * 0.4 + hash2(x, 5) * r, x + 3, y - r * 0.4 + hash2(x, 5) * r, BARK[4]);
    if (x > 70) for (let d = -r; d <= r; d += 1) if (bay(x, y + d) < (x - 70) / 50) plot(b, x, y + d, BLOOD[d < -r * 0.4 ? 1 : 3]);
  }
  ball(b, 122, 188, 16, 14, R('#C42A2A', '#8A1414', '#6A0E0E', '#4A0A0A', '#2A0404'), { line: true, mat: M_OTHER });
  for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2; poly(b, [122 + Math.cos(a) * 14, 188 + Math.sin(a) * 12, 122 + Math.cos(a + 0.3) * 22, 188 + Math.sin(a + 0.3) * 18, 122 + Math.cos(a + 0.6) * 14, 188 + Math.sin(a + 0.6) * 12], VEST, M_CLOTH); }
  path(b, [118, 200, 116, 204], BLOOD[2], 3); path(b, [128, 200, 130, 204], BLOOD[3], 2);
  yield;
  // (the chips and the muck over the coat, a leaf in his collar)
  for (let k = 0; k < 14; k++) { const x = 30 + rnd() * 220, y = 178 + rnd() * 26; if (matAt(b, x, y) === M_CLOTH) { seg(b, x, y, x + 3, y + 1, hexU('#D6A060'), 2); plot(b, x + 1, y + 1, hexU('#8A6030')); } }
  tint(b, FX + 80, 196, 30, 8, hexU('#4A4A26'), 0.6, M_CLOTH, 0.5);
  poly(b, [FX + 30, 172, FX + 50, 160, FX + 56, 168, FX + 40, 178], R('#F4A040', '#D9741E', '#B05A14', '#8A3A10', '#5A2008'), M_OTHER);
  yield;
  // ---- the ears, red
  for (const s of [-1, 1]) {
    const ex = FX + s * 82, ey = 106;
    ball(b, ex, ey, 13, 21, RAGE, { mat: M_SKIN, line: true });
    ball(b, ex - s, ey + 2, 7, 12, RAGE.slice(4), { mat: M_SKIN, soft: 0.3 });
    ball(b, ex - s * 3, ey + 4, 2.4, 3, R('#3A0808', '#240404', '#140202', '#080101', '#000000'), { mat: M_OTHER });
  }
  yield;
  // ---- the face: round and jowly, a double chin, red to the ears
  ball(b, FX, 176, 70, 18, RAGE, { mat: M_SKIN, line: (_dx, dy) => dy > -0.1, lw: 1.5 });
  ball(b, FX, FY, 84, 80, RAGE, { mat: M_SKIN, line: (_dx, dy) => dy > -0.2, lw: 1.5 });
  for (const s of [-1, 1]) ball(b, FX + s * 50, 126, 30, 28, RAGE, { mat: M_SKIN, lit: 1.1 });
  yield;
  // (the veins up his temples, the cords of the scream in his neck)
  for (const s of [-1, 1]) vein(b, [FX + s * 62, 96, FX + s * 66, 80, FX + s * 60, 66], R('#FFB8A8', '#E88A7A', '#C86A5C', '#A04C44', '#78302C', '#401414'), 2);
  yield;
  // ---- the muttonchops: ginger, bushy, down his cheeks to the mustache, matted with blood, chips in them
  for (const s of [-1, 1]) {
    for (let k = 0; k < 260; k++) {
      const t = rnd(), x = FX + s * (64 - t * 18 + rnd() * 16), y = 70 + t * 80;
      seg(b, x, y, x + s * (rnd() - 0.3) * 3, y + 4 + rnd() * 4, GINGER[k % 5 === 0 ? 0 : k % 3 ? 2 : 3], 1, M_HAIR);
    }
    tint(b, FX + s * 60, 130, 10, 14, BLOOD[3], 0.5, M_HAIR, 0.6);
  }
  for (const [x, y] of [[FX - 66, 110], [FX + 58, 136], [FX - 54, 140]] as const) { seg(b, x, y, x + 3, y + 1, hexU('#D6A060'), 2); plot(b, x, y + 1, hexU('#8A6030')); }
  poly(b, [FX - 74, 92, FX - 62, 84, FX - 58, 92, FX - 68, 98], R('#F4A040', '#D9741E', '#B05A14', '#8A3A10', '#5A2008'), M_OTHER);
  yield;
  // ---- the brows: ginger, flung up in the scream
  for (const s of [-1, 1]) {
    const pts = [FX + s * 54, 74, FX + s * 40, 66, FX + s * 24, 64, FX + s * 10, 68];
    path(b, pts, GINGER[4], 6); path(b, pts, GINGER[2], 4); path(b, pts.map((v, i) => (i % 2 ? v - 1 : v)), GINGER[0], 1);
  }
  for (let k = 0; k < 4; k++) path(b, [FX - 40, 50 + k * 4, FX - 14, 47 + k * 4, FX + 14, 48 + k * 4, FX + 40, 51 + k * 4], RAGE[6], 1, undefined, M_SKIN);
  yield;
  // ---- the far eye: bulging, bloodshot to the rims, behind its wire rim; the near one: shot clean through
  {
    const ex = FX - 32, ey = 92;
    eyeball(b, ex, ey, { rx: 15, ry: 13, sclera: SCLERA_R, iris: IRIS, ir: 5, idx: 2, idy: -1, pr: 1.8, veins: 22, lid: RAGE, top: (x) => ey - 12 + Math.abs(x - ex) * 0.1, bot: (x) => ey + 11 - ((x - ex) / 15) ** 2 * 3 });
    for (const [dy, col] of [[14, RAGE[6]], [18, RAGE[5]]] as const) path(b, [ex - 13, ey + dy - 2, ex - 5, ey + dy + 1, ex + 5, ey + dy + 1, ex + 13, ey + dy - 2], col, 1, undefined, M_SKIN);
  }
  {
    const ex = FX + 32, ey = 92;
    // (the socket: a ragged ring of meat, the hole, daylight through it from the far side of his head)
    ball(b, ex, ey, 15, 13, R('#C42A2A', '#9A1818', '#7A1212', '#5A0A0A', '#3A0404', '#1A0202'), { mat: M_OTHER, line: true });
    for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2; plot(b, ex + Math.cos(a) * (14 + rnd() * 2), ey + Math.sin(a) * (12 + rnd() * 2), RAGE[7]); }
    ball(b, ex + 1, ey + 1, 8, 7, R('#3A0404', '#2A0202', '#1A0101', '#0E0000', '#000000'), { mat: M_OTHER });
    ball(b, ex + 2, ey + 1, 3.6, 3.2, R('#FFFFFF', '#E0F0FC', '#BFE0F8', '#90C0E8', '#5A90C0'), { mat: M_OTHER });
    for (let k = 0; k < 8; k++) { const a = rnd() * Math.PI * 2; plot(b, ex + Math.cos(a) * 9, ey + Math.sin(a) * 8, hexU('#F2A8B0')); }
    // (the blood down his cheek from it, through the chop, off the jaw)
    path(b, [ex - 2, ey + 12, ex - 4, ey + 30, ex - 1, ey + 52, ex - 3, ey + 74], BLOOD[3], 3); path(b, [ex - 1, ey + 12, ex - 3, ey + 30, ex, ey + 52], BLOOD[1], 1);
    path(b, [ex + 6, ey + 12, ex + 8, ey + 34], BLOOD[3], 2);
  }
  yield;
  // ---- the spectacles: round wire rims; the near lens starred round the hole
  for (const s of [-1, 1]) {
    const lx = FX + s * 32, ly = 92, r = 19;
    for (let a = 0; a < Math.PI * 2; a += 0.01) { const x = lx + Math.cos(a) * r, y = ly + Math.sin(a) * r * 0.92; plot(b, x, y, Math.cos(a + 2.3) > 0.3 ? BRASS[1] : WIRE, M_METAL); plot(b, x + Math.cos(a), y + Math.sin(a), hexU('#5E4A1C'), M_METAL); }
    if (s < 0) { seg(b, lx - 12, ly - 8, lx - 4, ly - 14, mixU(WHITE, RAGE[2], 0.3), 2); seg(b, lx + 8, ly + 10, lx + 12, ly + 6, WHITE, 1); }
    else for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2 + 0.3; path(b, [lx + Math.cos(a) * 5, ly + Math.sin(a) * 4.6, lx + Math.cos(a + 0.15) * 11, ly + Math.sin(a + 0.15) * 10, lx + Math.cos(a) * r, ly + Math.sin(a) * r * 0.9], hexU('#E8F0F8')); }
    seg(b, lx + s * r, ly - 2, lx + s * (r + 30), ly + 4, WIRE, 1, M_METAL);
  }
  seg(b, FX - 13, 90, FX + 13, 90, WIRE, 1, M_METAL);
  yield;
  // ---- the nose: a button, gone purple at the tip, broken veins, the pores
  ball(b, FX + 2, 118, 18, 15, NOSE, { mat: M_SKIN, line: (_dx, dy) => dy > 0.4, lit: 1.1 });
  for (const s of [-1, 1]) ball(b, FX + 2 + s * 9, 128, 4.4, 2.8, R('#3A0808', '#240404', '#140202', '#080101', '#000000'), { mat: M_OTHER });
  for (let k = 0; k < 7; k++) { let x = FX + 2 + (rnd() - 0.5) * 20, y = 114 + (rnd() - 0.5) * 12, a = rnd() * 6; for (let i = 0; i < 8; i++) { x += Math.cos(a); y += Math.sin(a); a += (rnd() - 0.5) * 1.4; if (matAt(b, x, y) === M_SKIN) plot(b, x, y, hexU('#C02044')); } }
  yield;
  // ---- the scream: wide, the gap teeth, the gums, the uvula, the tongue, spit strung
  const cx = FX, cy = 156, mw = 34, mh = 18 + n * 3;
  ball(b, cx, cy, mw + 5, mh + 5, LIP, { mat: M_OTHER, line: true, lw: 1.4 });
  ball(b, cx, cy, mw, mh, MOUTH, { mat: M_MOUTH, flat: 0.25, lit: 0.55 });
  ball(b, cx, cy - mh + 10, 3, 5, TONGUE, { mat: M_MOUTH, line: true });
  ball(b, cx, cy + mh - 4, 22, 9, TONGUE, { mat: M_MOUTH, line: (_dx, dy) => dy < 0, only: (x, y) => matAt(b, x, y) === M_MOUTH });
  seg(b, cx, cy + mh - 10, cx, cy + mh - 2, TONGUE[4], 1, undefined, M_MOUTH);
  const top = (x: number) => cy - mh * Math.sqrt(Math.max(0, 1 - ((x - cx) / mw) ** 2)) + 1;
  const bot = (x: number) => cy + mh * Math.sqrt(Math.max(0, 1 - ((x - cx) / mw) ** 2)) - 1;
  for (let x = cx - mw; x <= cx + mw; x++) { const t = Math.round(top(x)); for (let y = t; y < t + 3; y++) if (matAt(b, x, y) === M_MOUTH) plot(b, x, y, GUM[y === t ? 3 : 1], M_OTHER); }
  teeth(b, cx - 28, cx + 28, (x) => top(x) + 3, 1, 8, { tw: 6, gaps: [4], rot: [1, 8], ramp: TOOTH_B.map((v, i) => mixU(v, WHITE, i < 3 ? 0.35 : 0.1)) });
  teeth(b, cx - 24, cx + 24, bot, -1, 6, { tw: 6, gaps: [2, 6], rot: [5], ramp: TOOTH_B });
  for (const sx of [cx - 14, cx + 8, cx + 20]) for (let y = Math.round(top(sx) + 8); y < bot(sx) - 3; y++) if (bay(sx, y) < 0.7) plot(b, sx + Math.round(Math.sin(y * 0.4)), y, hexU('#F0E8F8'));
  yield;
  // ---- the handlebar mustache: waxed, curled up at the near end, gone limp at the far; over the scream
  for (let k = 0; k < 300; k++) {
    const s = rnd() < 0.5 ? -1 : 1, t = rnd();
    const x = cx + s * (4 + t * 44), y = 136 - (s > 0 ? t * t * 12 : -t * 10) + rnd() * 5;
    seg(b, x, y, x + s * 3, y + 3 + rnd() * 2, GINGER[k % 4 === 0 ? 0 : k % 3 ? 2 : 3], 1, M_HAIR);
  }
  path(b, [cx + 48, 124, cx + 52, 116, cx + 48, 112, cx + 44, 116], GINGER[2], 2, M_HAIR);
  path(b, [cx - 46, 146, cx - 50, 154, cx - 47, 160], GINGER[3], 2, M_HAIR);
  yield;
  // ---- the cap: navy, the brass band, the CONDUCTOR plate (half of it), the patent visor; split by the saw
  ball(b, FX, 26, 96, 44, COAT, { mat: M_CLOTH, line: true, lw: 1.5, only: (_x, y) => y < 54 });
  for (let x = FX - 92; x <= FX + 92; x++) { const y = 42 + ((x - FX) / 92) ** 2 * 4; for (let d = 0; d < 6; d++) plot(b, x, y + d, BRASS[d === 0 ? 1 : d < 3 ? 2 : d < 5 ? 3 : 5], M_METAL); }
  poly(b, [FX - 40, 16, FX - 4, 14, FX - 4, 36, FX - 40, 38], BRASS, M_METAL);
  for (let k = 0; k < 5; k++) seg(b, FX - 36 + k * 6, 22, FX - 36 + k * 6, 30, BRASS[5], 2);
  for (let x = FX - 96; x <= FX + 96; x++) { const u = (x - FX) / 96, y = 50 + Math.round(u * u * -4); const th = Math.round(5 + 5 * (1 - u * u)); for (let d = 0; d < th; d++) plot(b, x, y + d, PATENT[d === 0 ? 0 : d < 2 ? 1 : d < th - 1 ? (bay(x, y + d) < 0.4 ? 2 : 3) : 5], M_OTHER); }
  for (let x = FX - 60; x <= FX - 20; x++) plot(b, x, 52, WHITE);
  yield;
  // (the slot down through the cap and into his forehead: meat, bone at its lips, blood sheeting down his brow)
  poly(b, [FX + 4, -4, FX + 22, -4, FX + 18, 64, FX + 8, 64], R('#C42A2A', '#8A1414', '#6A0E0E', '#4A0A0A', '#2A0404'), M_OTHER);
  path(b, [FX + 4, 0, FX + 8, 62], hexU('#F5F0E6'), 1); path(b, [FX + 22, 0, FX + 18, 62], hexU('#F5F0E6'), 1);
  ball(b, FX + 13, 40, 3, 10, R('#FFD0D8', '#F2A8B0', '#D88090', '#B05868', '#783040'), { mat: M_OTHER });
  for (const [x0, w] of [[FX + 10, 4], [FX + 16, 3], [FX + 6, 2], [FX + 20, 2]] as const) path(b, [x0, 62, x0 + 1, 72, x0 - 1, 80, x0 + 1, 86], BLOOD[w > 2 ? 3 : 2], w);
  yield;
  // (the blade: what's out of him, foreshortened (edge on), its teeth caked, the hanger's arm snapped off short)
  for (let y = 0; y < 46; y++) {
    const u = (y - 12) / 40, w = 15 * Math.sqrt(Math.max(0, 1 - u * u));
    for (let xx = -Math.ceil(w); xx <= w; xx++) { const v = (xx + w) / (2 * w + 0.01); plot(b, FX + 13 + xx, y, STEEL[Math.abs(xx) >= w - 1 ? 5 : v < 0.2 ? 0 : v < 0.5 ? 2 : v < 0.8 ? 3 : 4], M_METAL); }
    // (its teeth down both edges, caked)
    if (y % 4 === 0) { plot(b, FX + 13 - w - 1, y, STEEL[3]); plot(b, FX + 13 - w - 2, y + 1, STEEL[4]); plot(b, FX + 13 + w + 1, y, STEEL[4]); plot(b, FX + 13 + w + 2, y + 1, STEEL[5]); }
    if (y % 8 === 2 && y > 6) { plot(b, FX + 13 - w - 1, y + 1, BLOOD[3]); plot(b, FX + 13 + w + 1, y + 1, BLOOD[3]); }
  }
  yield;
  // (the hub, the hanger's arm snapped off short up out of it; blood up the blade from the slot)
  ball(b, FX + 13, 14, 4, 6, BRASS, { mat: M_METAL, line: true });
  seg(b, FX + 13, 12, FX + 9, -4, STEEL[4], 3, M_METAL); seg(b, FX + 12, 12, FX + 8, -4, STEEL[1], 1, M_METAL);
  for (let y = 34; y < 46; y++) for (let xx = -10; xx <= 10; xx++) if (matAt(b, FX + 13 + xx, y) === M_METAL && bay(FX + 13 + xx, y) < (y - 34) / 12) plot(b, FX + 13 + xx, y, BLOOD[(y + xx) % 3 ? 2 : 3]);
  path(b, [FX + 8, 30, FX + 9, 40], BLOOD[2], 2); path(b, [FX + 18, 24, FX + 17, 40], BLOOD[3], 1);
  yield;
  // ---- the pores, the sweat, the grime: blood spattered, muck across his brow
  stubble(b, (x, y) => (y > 150 && Math.abs(x - FX) < 70 ? 0.4 : 0), RAGE[6], 0.35);
  skinPost(b, RAGE[7], (x, y) => (((x - FX) / 60) ** 2 + ((y - 124) / 30) ** 2 < 1 ? 0.12 : 0.07), { blackheads: (x, y) => ((x - FX - 2) / 18) ** 2 + ((y - 118) / 15) ** 2 < 1, shine: 0.22 });
  for (let k = 0; k < 16; k++) { const x = FX - 60 + rnd() * 120, y = 56 + rnd() * 18; if (matAt(b, x, y) === M_SKIN) bead(b, x, y, 1.4 + rnd() * 1.6, RAGE); }
  for (let k = 0; k < 18; k++) { const x = FX + (rnd() - 0.5) * 150, y = 60 + rnd() * 110; if (matAt(b, x, y) === M_SKIN) ball(b, x, y, 1 + rnd() * 1.6, 1 + rnd() * 1.2, BLOOD.slice(1)); }
  tint(b, FX - 44, 60, 20, 4, hexU('#4A4A26'), 0.55, M_SKIN, 0.5);
  return b;
}

const get = stamps<Key>(build, ['0', '1', '2']);

/** His gross-up: (cx, cy) where the middle of his face goes on the screen, `zoom` 1 at the hold; `talking` his mouth
 *  going (the scream), `jolt` a shake (the snap). */
export const drawTuckerGross = (c: Ctx, cx: number, cy: number, zoom: number, f: number, talking: boolean, jolt = 0) => {
  const n = talking ? [1, 2, 0, 2][Math.floor(f / 5) % 4] : 2;
  const s = get(String(n) as Key);
  drawGrossStamp(c, s.img, cx, cy, FX, FY, zoom, f, jolt, (box) => {
    // (blood dripping off his jaw under the shot eye)
    const t = (f % 50) / 50;
    if (t > 0.3) { const d = (t - 0.3) / 0.7; box(FX + 28, 166 + d * d * 40, 2, 3, '#861010'); box(FX + 28, 166 + d * d * 40, 1, 1, '#D63434'); }
    // (spit flying out of the scream at the camera)
    for (let i = 0; i < 12; i++) {
      const ph = ((f * 1.4 + i * 19) % 32) / 32, a = -Math.PI * (0.05 + (i / 11) * 0.9);
      const d = 12 + ph * 80, x = FX + Math.cos(a) * d * 1.2, y = 156 + Math.sin(a) * d * 0.7 + ph * ph * 40, sz = 1 + Math.round(ph * 3);
      c.globalAlpha = ph < 0.85 ? 1 : (1 - ph) / 0.15;
      box(x, y, sz, sz, '#E8F0FA'); box(x, y, 1, 1, '#FFFFFF');
    }
    c.globalAlpha = 1;
    // (the far eye twitching)
    if (f % 9 < 3) for (let k = 0; k < 3; k++) box(FX - 58 - k * 3, 80 + k * 5, 3, 1, '#FFFFFF');
  });
};

/** Behind him: the woods, dark, in bands. */
export const drawTuckerGrossBack = (c: Ctx, W: number, H: number) => grossBackdrop(c, W, H, ['#1A1408', '#221A0C', '#2A2010', '#322614', '#3A2A12']);
