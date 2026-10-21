// HELICOPTER HARRY'S GROSS-UP (the user's rule for every close-up: "gross ren and stimpy style close ups"; grossKit.ts):
// his fight's first look at the real Harry, the hippie torn off, flexing. Twenty-two years of secret push-ups and
// tanning oil: the face gone to cords and veins (a vein forked up his forehead under the bandana, more at the temples,
// the neck a bundle of ropes into traps like hams), the skin oiled and shining, every pore, liver spots, a mole; the
// round amber glasses, his eyes bulging behind them, bloodshot, a burst vessel in one; the red bandana sweated dark,
// its knot's tails flying; the gray hair scraped back under it; the Van Dyke (gray, crumbs of jerky in it); the war
// face: lips peeled off clenched teeth, the gums, tartar, spit forced out between them; nose hairs, ear hairs; gray
// chest hair, the dog tags' chain and the bandolier's brass across the bottom.
// Live: the forehead vein throbbing, spit bubbling at his teeth, a bead of sweat, the bandana's tails flapping.

import {
  type Ctx, type Buf, R, hexU, mixU, WHITE, newBuf, setSeed, rnd, matAt, plot, seg, path, ball, tint, poly, bead, GW, eyeball, teeth, skinPost, stubble, hairs, vein, stamps, drawGrossStamp, grossBackdrop, bay, M_SKIN, M_HAIR, M_SCLERA, M_MOUTH, M_OTHER, M_CLOTH, M_METAL, M_GLASS, SCLERA_R, MOUTH, GUM, TOOTH_B,
} from '../../grossKit';

const FX = 136, FY = 98;

const TAN = R('#FFE0C0', '#F6D2B0', '#EAB894', '#E3AE86', '#C68A62', '#9A6444', '#6E4228', '#3A1C0C');
const GRAY = R('#FFFFFF', '#F4F4F5', '#D4D4D8', '#A8A8B0', '#7A7A84', '#3A3A42');
const BAND = R('#FCA5A5', '#F87171', '#DC2626', '#A51C1C', '#701414', '#360808');
const BRASS = R('#FFFAD0', '#FEF3A0', '#EAB308', '#B7791F', '#7C4A03', '#3A2002');
const LEATHER = R('#D8A068', '#C99158', '#94602F', '#734620', '#4F2E13', '#24130A');
const STEEL = R('#F0F2F6', '#B8BEC8', '#8890A0', '#5E6672', '#434A55', '#1A1E24');
const LIP = R('#E8A894', '#D08A76', '#B46C5C', '#94504A', '#6A3434', '#3A1A1A');
const IRIS = R('#C8B0F0', '#9A80D0', '#7058A8', '#4A3A80', '#2A1E50', '#100A28');
const TVEIN = R('#FFD0B0', '#ECAA86', '#CC8866', '#A86A50', '#7E4C38', '#44241A');

type Key = 'a' | 'b';

function* build(key: Key): Generator<void, Buf> {
  setSeed(1969);
  const b = newBuf();
  yield;
  // ---- the traps and the shoulders: hams, the cords of the neck into them; gray chest hair; the dog tags' chain; the
  yield;
  // bandolier's strap and its brass across him
  for (const s of [-1, 1]) ball(b, FX + s * 104, 214, 86, 70, TAN, { mat: M_SKIN, line: true, lw: 1.5 });
  ball(b, FX, 230, 70, 50, TAN, { mat: M_SKIN });
  for (const s of [-1, 1]) {
    // (the neck's cords: from behind the ear down to the collarbone, bulging)
    for (let d = -3; d <= 3; d++) path(b, [FX + s * 52 + d, 128, FX + s * 40 + d, 160, FX + s * 20 + d, 196], TAN[Math.abs(d) === 3 ? 6 : d * s < 0 ? 1 : d === 0 ? 2 : 4], 1, undefined, M_SKIN);
    path(b, [FX + s * 64, 170, FX + s * 100, 160, FX + s * 136, 166], TAN[6], 1, undefined, M_SKIN);
  }
  hairs(b, 70, () => [FX - 30 + rnd() * 60, 186 + rnd() * 18], 5, -Math.PI / 2, GRAY[2], M_SKIN);
  for (let x = FX - 34; x <= FX + 34; x++) { const y = 192 + ((x - FX) / 34) ** 2 * -14; if (x % 2 === 0) { plot(b, x, y, STEEL[1]); plot(b, x, y + 1, STEEL[4]); } }
  yield;
  // (the bandolier: across from his near shoulder down, its brass rounds)
  for (let d = -6; d <= 6; d++) seg(b, FX + 136, 154 + d, FX - 30, 214 + d, LEATHER[Math.abs(d) === 6 ? 5 : d < -2 ? 1 : d < 2 ? 2 : 3], 1, M_CLOTH);
  for (let k = 0; k < 9; k++) { const x = FX + 128 - k * 18, y = 156 + k * 6.5; for (let yy = -12; yy <= 0; yy++) for (let xx = -3; xx <= 3; xx++) plot(b, x + xx + yy * 0.36, y + yy, BRASS[Math.abs(xx) === 3 ? 5 : xx < -1 ? 0 : xx < 1 ? 2 : 3], M_METAL); plot(b, x - 4.5, y - 13, BRASS[4]); }
  yield;
  // ---- the ears: hairs out of them, the lobes long
  for (const s of [-1, 1]) {
    const ex = FX + s * 66, ey = 104;
    ball(b, ex, ey, 12, 22, TAN, { mat: M_SKIN, line: true });
    ball(b, ex - s, ey + 2, 6, 13, TAN.slice(4), { mat: M_SKIN, soft: 0.3 });
    ball(b, ex - s * 2, ey + 4, 2.4, 3, R('#3A1808', '#24100A', '#140806', '#080302', '#000000'), { mat: M_OTHER });
    hairs(b, 9, () => [ex - s * 2, ey + 3], 7, s > 0 ? -0.3 : Math.PI + 0.3, GRAY[3]);
  }
  yield;
  // ---- the face: lean and hard, the cheekbones up, the jaw clenched square
  ball(b, FX, FY + 4, 64, 78, TAN, { mat: M_SKIN, line: (_dx, dy) => dy > -0.2, lw: 1.5 });
  poly(b, [FX - 56, 120, FX + 56, 120, FX + 50, 162, FX + 22, 178, FX - 22, 178, FX - 50, 162], TAN, M_SKIN, { line: false, tilt: 0.2 });
  for (const s of [-1, 1]) {
    ball(b, FX + s * 40, 110, 20, 13, TAN, { mat: M_SKIN, lit: 1.15 });
    tint(b, FX + s * 44, 136, 12, 18, TAN[6], 0.35, M_SKIN, 0.7);
    path(b, [FX + s * 54, 124, FX + s * 56, 146, FX + s * 50, 162], TAN[6], 1, undefined, M_SKIN);
  }
  yield;
  // ---- the hair, gray, scraped back over the top; the bandana tied over it, sweated dark, the paisley, the knot
  ball(b, FX, 44, 70, 26, GRAY.slice(1), { mat: M_HAIR, line: (_dx, dy) => dy < 0, only: (_x, y) => y < 50, flat: 0.6 });
  for (let k = 0; k < 60; k++) { const x0 = FX - 62 + rnd() * 124; path(b, [x0, 48, x0 + (x0 - FX) * 0.08, 34, x0 + (x0 - FX) * 0.2, 18], k % 3 ? GRAY[k % 2 ? 4 : 3] : GRAY[1], 1, undefined, M_HAIR); }
  for (let x = FX - 72; x <= FX + 72; x++) {
    const u = (x - FX) / 72, yt = 44 + u * u * 8, h = 16 - u * u * 4;
    for (let d = 0; d < h; d++) { const v = d / h; plot(b, x, yt + d, BAND[d === 0 || d >= h - 1 ? 5 : v < 0.25 ? 1 : v < 0.6 ? (bay(x, yt + d) < 0.5 ? 2 : 1) : 3], M_CLOTH); }
  }
  yield;
  // (the paisley: white teardrops and dots; sweated through dark along the bottom)
  for (let k = 0; k < 16; k++) { const x = FX - 64 + k * 8.5, y = 50 + ((x - FX) / 72) ** 2 * 8 + (k % 2) * 3; plot(b, x, y, WHITE); plot(b, x + 1, y, WHITE); plot(b, x + 1, y + 1, BAND[0]); plot(b, x - 1, y + 2, BAND[0]); }
  for (let x = FX - 70; x <= FX + 70; x++) { const y0 = 44 + ((x - FX) / 72) ** 2 * 8 + 10; for (let d = 0; d < 4; d++) if (bay(x, y0 + d) < 0.55) plot(b, x, y0 + d, BAND[4], undefined, M_CLOTH); }
  yield;
  // (the knot off the side of his head and its tails flying out)
  ball(b, FX + 76, 54, 10, 9, BAND, { mat: M_CLOTH, line: true });
  poly(b, [FX + 80, 50, FX + 130, 30, FX + 136, 44, FX + 84, 58], BAND, M_CLOTH);
  poly(b, [FX + 82, 58, FX + 124, 66, FX + 120, 78, FX + 80, 64], BAND, M_CLOTH);
  yield;
  // ---- the forehead: furrows, the vein forked up under the bandana, the temples' veins, liver spots
  for (let k = 0; k < 3; k++) path(b, [FX - 40, 64 + k * 5, FX - 14, 62 + k * 5, FX + 14, 63 + k * 5, FX + 40, 65 + k * 5], TAN[6], 1, undefined, M_SKIN);
  vein(b, [FX - 6, 82, FX - 10, 72, FX - 6, 62, FX - 10, 58], TVEIN, 3);
  vein(b, [FX - 8, 68, FX + 6, 62, FX + 10, 58], TVEIN, 2);
  for (const s of [-1, 1]) vein(b, [FX + s * 52, 90, FX + s * 56, 76, FX + s * 52, 64], TVEIN, 2);
  for (let k = 0; k < 10; k++) { const x = FX + (rnd() - 0.5) * 100, y = 62 + rnd() * 100; if (matAt(b, x, y) === M_SKIN) tint(b, x, y, 2 + rnd() * 2.5, 2 + rnd() * 2, TAN[5], 0.45, M_SKIN, 0.4); }
  yield;
  // ---- the brows: gray, wild, crushed down in the middle
  for (const s of [-1, 1]) {
    const pts = [FX + s * 50, 72, FX + s * 36, 74, FX + s * 22, 80, FX + s * 8, 88];
    path(b, pts, GRAY[4], 5); path(b, pts.map((v, i) => (i % 2 ? v - 1 : v)), GRAY[2], 2);
    for (let k = 0; k < 22; k++) { const t = rnd(), x = FX + s * (50 - t * 42), y = 72 + t * 16; seg(b, x, y + 2, x + s * (rnd() * 6 - 2), y - 4 - rnd() * 5, k % 3 ? GRAY[3] : GRAY[1]); }
  }
  yield;
  // ---- the eyes: bulging, bloodshot, a burst vessel in the near one; the crow's feet; the round amber glasses over
  for (const s of [-1, 1]) {
    const ex = FX + s * 28, ey = 98;
    tint(b, ex, ey, 20, 14, TAN[6], 0.3, M_SKIN, 0.6);
    eyeball(b, ex, ey, {
      rx: 13, ry: 11, sclera: SCLERA_R, iris: IRIS, ir: 5.5, idx: -s * 1, idy: -1, pr: 2, veins: 20, lid: TAN,
      top: (x) => ey - 9 + Math.abs(x - ex) * 0.12 + (s * (x - ex) < 0 ? 3 : 0) + (key === 'b' ? 3 : 0),
      bot: (x) => ey + 9 - ((x - ex) / 13) ** 2 * 3,
    });
    if (s > 0) tint(b, ex + 7, ey + 2, 4, 3, hexU('#D01020'), 0.85, M_SCLERA, 0.3);
    for (const [dy, col] of [[11, TAN[6]], [15, TAN[5]]] as const) path(b, [ex - 13, ey + dy - 2, ex - 5, ey + dy + 1, ex + 5, ey + dy + 1, ex + 13, ey + dy - 2], col, 1, undefined, M_SKIN);
    for (let k = 0; k < 4; k++) path(b, [ex + s * 20, ey - 6 + k * 5, ex + s * 28, ey - 9 + k * 7, ex + s * 34, ey - 10 + k * 9], TAN[6], 1, undefined, M_SKIN);
  }
  yield;
  // ---- the nose: long, hooked, pores, hairs out of it
  poly(b, [FX - 6, 90, FX + 6, 90, FX + 12, 122, FX - 12, 122], TAN, M_SKIN, { line: false, tilt: 1.3 });
  for (const s of [-1, 1]) ball(b, FX + s * 13, 128, 8, 8, TAN, { mat: M_SKIN, line: (dx, dy) => dy > -0.2 && dx * s > -0.3 });
  ball(b, FX, 124, 14, 13, TAN, { mat: M_SKIN, line: (_dx, dy) => dy > 0.4, lit: 1.1 });
  for (const s of [-1, 1]) {
    ball(b, FX + s * 8, 134, 4.6, 3, R('#3A1808', '#24100A', '#140806', '#080302', '#000000'), { mat: M_OTHER });
    for (let k = 0; k < 5; k++) path(b, [FX + s * (5 + k * 2), 134, FX + s * (4.5 + k * 2.4) + (rnd() - 0.5) * 2, 137 + rnd() * 3, FX + s * (4 + k * 2.6), 139 + rnd() * 3], GRAY[3]);
  }
  yield;
  // ---- the war face: lips peeled off clenched teeth, gums, tartar, spit between them
  const cx = FX, cy = 156;
  const top = (x: number) => cy - 9 + ((x - cx) / 32) ** 2 * 4;
  const bot = (x: number) => cy + 9 - ((x - cx) / 32) ** 2 * 5;
  for (let x = cx - 32; x <= cx + 32; x++) for (let y = Math.round(top(x)); y <= bot(x); y++) plot(b, x, y, MOUTH[2], M_MOUTH);
  for (let x = cx - 32; x <= cx + 32; x++) { const t = Math.round(top(x)); for (let d = 0; d < 3; d++) plot(b, x, t + d, GUM[d === 0 ? 4 : d === 1 ? 1 : 2], M_OTHER); const bt = Math.round(bot(x)); for (let d = 0; d < 3; d++) plot(b, x, bt - d, GUM[d === 0 ? 4 : d === 1 ? 1 : 2], M_OTHER); }
  teeth(b, cx - 30, cx + 30, (x) => top(x) + 3, 1, 7, { tw: 5, rot: [0, 11], ramp: TOOTH_B.map((v, i) => mixU(v, WHITE, i < 3 ? 0.4 : 0.1)) });
  teeth(b, cx - 28, cx + 28, (x) => bot(x) - 3, -1, 6, { tw: 5, rot: [1, 10], gaps: [5], ramp: TOOTH_B.map((v, i) => mixU(v, WHITE, i < 3 ? 0.3 : 0.05)) });
  seg(b, cx - 30, cy + 1, cx + 30, cy + 1, MOUTH[5], 1, undefined, M_MOUTH);
  yield;
  // (spit forced out between them, frothing at the corners)
  for (const [x, y] of [[cx - 30, cy], [cx + 30, cy], [cx - 10, cy + 1], [cx + 12, cy + 1]] as const) { ball(b, x, y, 2.4, 1.8, R('#FFFFFF', '#F4F8FC', '#E0E8F0', '#C0CCD8', '#8A9AAA')); plot(b, x - 1, y - 1, WHITE); }
  for (let x = cx - 34; x <= cx + 34; x++) for (let d = 1; d <= 3; d++) { plot(b, x, top(x) - d, LIP[d === 1 ? 5 : d === 2 ? 2 : 1], M_OTHER); plot(b, x, bot(x) + d, LIP[d === 1 ? 5 : d === 2 ? 1 : 3], M_OTHER); }
  yield;
  // (the folds out from the corners: the grimace)
  for (const s of [-1, 1]) { path(b, [cx + s * 34, cy - 4, cx + s * 38, cy - 18, cx + s * 30, cy - 30], TAN[6], 1, undefined, M_SKIN); path(b, [cx + s * 36, cy + 6, cx + s * 40, cy + 18], TAN[6], 1, undefined, M_SKIN); }
  yield;
  // ---- the Van Dyke: the mustache over the lip (gray), the goatee under it on the chin; jerky crumbs in it
  for (let k = 0; k < 260; k++) {
    const x = cx - 36 + rnd() * 72, y = 140 + rnd() * 5 + Math.abs(x - cx) * 0.12;
    if (Math.abs(x - cx) < 3 && rnd() < 0.6) continue;
    seg(b, x, y, x + (x - cx) * 0.08 + (rnd() - 0.5), y + 4 + rnd() * 2, k % 4 ? GRAY[k % 2 ? 3 : 2] : GRAY[4]);
  }
  for (let k = 0; k < 220; k++) {
    const x = cx - 18 + rnd() * 36, y = 170 + rnd() * 18;
    if (Math.abs(x - cx) > 18 - (y - 170) * 0.5) continue;
    seg(b, x, y, x + (rnd() - 0.5) * 2, y + 4 + rnd() * 3, k % 4 ? GRAY[k % 2 ? 3 : 2] : GRAY[1]);
  }
  for (const [x, y] of [[cx - 20, 146], [cx + 8, 178], [cx - 6, 184]] as const) ball(b, x, y, 1.8, 1.4, R('#B8784A', '#8A5028', '#6A3818', '#4A240C', '#2A1004'));
  yield;
  // ---- stubble over the cheeks (shaved round the beard), the pores, the blackheads, the oil shining
  stubble(b, (x, y) => (y > 128 ? 0.6 : 0), GRAY[4], 0.35);
  skinPost(b, TAN[7], (x, y) => (((x - FX) / 18) ** 2 + ((y - 120) / 22) ** 2 < 1 ? 0.18 : 0.07), { blackheads: (x, y) => ((x - FX) / 18) ** 2 + ((y - 122) / 18) ** 2 < 1, shine: 0.3 });
  ball(b, FX - 46, 140, 2.6, 2.4, R('#6A3A22', '#4A2414', '#2E140A', '#1A0804', '#0E0402'), { mat: M_OTHER });
  path(b, [FX - 46, 139, FX - 49, 134, FX - 48, 129], GRAY[3]);
  yield;
  // ---- the glasses: round, wire, amber, his bulging eyes through them, the glare
  for (const s of [-1, 1]) {
    const lx = FX + s * 28, ly = 98, r = 19;
    for (let y = ly - r; y <= ly + r; y++) for (let x = lx - r; x <= lx + r; x++) {
      const d = Math.hypot(x - lx, y - ly);
      if (d > r || x < 0 || x >= GW || y < 0) continue;
      const i = y * GW + x;
      b.px[i] = mixU(b.px[i], mixU(hexU('#E8A030'), hexU('#A05A10'), (y - ly + r) / (2 * r)), 0.4); b.mat[i] = M_GLASS;
    }
    for (let a = 0; a < Math.PI * 2; a += 0.01) { const x = lx + Math.cos(a) * r, y = ly + Math.sin(a) * r; plot(b, x, y, STEEL[Math.cos(a + 2.3) > 0.3 ? 1 : 3], M_METAL); plot(b, x + Math.cos(a), y + Math.sin(a), STEEL[5], M_METAL); }
    seg(b, lx - 10, ly - 4, lx - 4, ly - 12, mixU(WHITE, hexU('#E8A030'), 0.2), 2, undefined, M_GLASS);
    seg(b, lx - 12, ly + 2, lx - 10, ly - 1, WHITE, 1, undefined, M_GLASS);
    seg(b, lx + s * r, ly - 2, lx + s * (r + 18), ly + 2, STEEL[2], 1, M_METAL);
  }
  seg(b, FX - 9, 96, FX + 9, 96, STEEL[2], 1, M_METAL); seg(b, FX - 8, 95, FX + 8, 95, STEEL[0], 1, M_METAL);
  yield;
  // ---- sweat: beads across the brow under the bandana, on the nose; running down the temples into the cords
  for (let k = 0; k < 12; k++) { const x = FX - 46 + rnd() * 92, y = 62 + rnd() * 12; if (matAt(b, x, y) === M_SKIN) bead(b, x, y, 1.4 + rnd() * 1.4, TAN); }
  bead(b, FX + 4, 118, 1.6, TAN);
  for (const s of [-1, 1]) { path(b, [FX + s * 58, 70, FX + s * 60, 90, FX + s * 58, 110, FX + s * 61, 124], mixU(TAN[1], WHITE, 0.5), 2, undefined, M_SKIN); bead(b, FX + s * 61, 126, 2.2, TAN); }
  return b;
}

const get = stamps<Key>(build, ['a', 'b']);

/** His gross-up: (cx, cy) where the middle of his face goes on the screen, `zoom` 1 at the hold. */
export const drawHarryGross = (c: Ctx, cx: number, cy: number, zoom: number, f: number, jolt = 0) => {
  const s = get(f % 72 < 8 ? 'b' : 'a');
  drawGrossStamp(c, s.img, cx, cy, FX, FY, zoom, f, jolt, (box) => {
    // (the forehead vein throbbing)
    if (f % 18 < 7) { c.globalAlpha = 0.6; box(FX - 11, 62, 3, 20, '#CC8866'); box(FX - 10, 63, 1, 18, '#FFD0B0'); box(FX - 4, 60, 10, 3, '#CC8866'); c.globalAlpha = 1; }
    // (spit bubbling at his teeth: a bubble swelling and popping at the corner)
    const t = (f % 40) / 40, r = Math.round(t * 4);
    if (t < 0.9) { box(FX + 30, 154 - r, r + 1, r + 1, '#F4F8FC'); box(FX + 30, 154 - r, 1, 1, '#FFFFFF'); }
    // (a bead of sweat running down his temple)
    const u = (f % 100) / 100, sx = FX - 58 + Math.sin(u * 8), sy = 70 + u * 54;
    box(sx, sy, 2, 3, '#FFF4EA'); box(sx, sy, 1, 1, '#FFFFFF'); box(sx + 1, sy + 2, 1, 1, '#9A6444');
    // (the bandana's tails flapping)
    const fl = Math.sin(f * 0.5) * 3;
    box(FX + 112, 30 + fl, 20, 3, '#DC2626'); box(FX + 112, 30 + fl, 20, 1, '#F87171');
    box(FX + 108, 70 - fl, 16, 3, '#A51C1C');
  });
};

/** Behind him: the dig's dust and the sky, in bands. */
export const drawHarryGrossBack = (c: Ctx, W: number, H: number) => grossBackdrop(c, W, H, ['#1E2A3A', '#2E3E52', '#4A5A6A', '#6E7A80', '#8A8E86']);
