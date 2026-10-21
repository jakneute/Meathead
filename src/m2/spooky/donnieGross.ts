// DONNIE DRACULA'S GROSS-UP (the user's rule for every close-up: "gross ren and stimpy style close ups"; grossKit.ts):
// his fight's first look at him, the moment Satan's gift takes. The pallor gone gray, sweat sheeting off the dome, the
// veins up it bulging; the $4.99 nylon wig knocked lopsided, its tape and the comb-over under it, the price tag on its
// string; beady eyes burning red, bloodshot to the rims, the bags; the drinker's bulb of a nose (broken veins,
// blackheads, the pores like a strawberry, hairs out of it); the mustache with the drumstick's crumbs and grease in it;
// five o'clock shadow over the jowls and both chins; the mouth wide, real fangs, long and ivory, down past his lip (the
// gums gone back off them, the rest of his teeth brown and crooked), blood strung between them, the tongue; the cape's
// collar stood up behind him, red inside; the ruffles and the clip-on bow tie under the chins.
// Live: the eyes' glow pulsing, blood running off a fang and dripping, a bead of sweat, the aura licking round him.

import {
  type Ctx, type Buf, GW, R, hexU, mixU, WHITE, newBuf, setSeed, rnd, matAt, plot, seg, path, ball, tint, poly, bead, eyeball, teeth, skinPost, stubble, hairs, vein, stamps, drawGrossStamp, grossBackdrop, hash2, bay, M_SKIN, M_HAIR, M_MOUTH, M_OTHER, M_CLOTH, SCLERA_R, MOUTH, TONGUE, GUM, BLOOD, HAIRLINE, TOOTH_B, VEIN_B,
} from '../grossKit';

const FX = 136, FY = 96;

const PALL = R('#E2DCD0', '#CCC4B8', '#B4AAA0', '#9A8E88', '#807272', '#64585C', '#443840', '#22161E');
const NOSE = R('#F0C8C8', '#E0A8AC', '#CC8890', '#B46A76', '#965260', '#743C4A', '#502432', '#2A0E18');
const WIG = R('#9AA8C8', '#5A6480', '#2E3244', '#1E2030', '#141620', '#0A0B10', '#000000');
const HAIR = R('#B0A090', '#8A7A6A', '#6E5E4E', '#54473A', '#3C3228', '#201A14');
const CAPE = R('#5A5A6A', '#3A3A48', '#26262E', '#18181E', '#0E0E12', '#000000');
const LINING = R('#FF9A9A', '#F87171', '#DC2626', '#B91C1C', '#7F1D1D', '#3B0A0A');
const SHIRT = R('#FFFFFF', '#F1EEE6', '#D6D1C2', '#ADA796', '#7E7868', '#4A463C');
const BOW = R('#FCA5A5', '#F43F5E', '#E11D48', '#BE123C', '#881337', '#4C0519');
const EYE = R('#FFF4C0', '#FFD040', '#FF7A1A', '#F01E1E', '#B00A0A', '#5A0000');
const FANG = R('#FFFFF6', '#FAF4DC', '#ECE0BC', '#D8C89C', '#B8A478', '#6A5A3A');
const LIP = R('#C8A0A8', '#AE8490', '#946A78', '#7A5262', '#5E3A4A', '#341E28');

type Key = 'a' | 'b';

function* build(key: Key): Generator<void, Buf> {
  setSeed(6661);
  const b = newBuf();
  yield;
  // ---- the cape's collar stood up behind his head: black polyester out, red lining in, creased from the bag
  for (const s of [-1, 1]) {
    poly(b, [FX + s * 30, 204, FX + s * 136, 204, FX + s * 150, 20, FX + s * 100, 60, FX + s * 70, 130], LINING, M_CLOTH, { tilt: -0.3 * s });
    poly(b, [FX + s * 136, 204, FX + s * 150, 204, FX + s * 160, 10, FX + s * 150, 20], CAPE, M_CLOTH);
    for (let k = 0; k < 3; k++) path(b, [FX + s * (80 + k * 18), 196, FX + s * (96 + k * 16), 120, FX + s * (118 + k * 10), 50], LINING[k % 2 ? 4 : 1], 1, undefined, M_CLOTH);
    path(b, [FX + s * 100, 150, FX + s * 112, 160, FX + s * 124, 150], LINING[0], 1, undefined, M_CLOTH);
  }
  yield;
  // ---- the shirt's ruffles under the chins, the bow tie, the cord
  ball(b, FX, 250, 120, 70, SHIRT, { mat: M_CLOTH });
  for (let k = 0; k < 9; k++) { const x = FX - 60 + k * 15; ball(b, x, 198 + (k % 2) * 3, 9, 8, SHIRT, { mat: M_CLOTH, line: (_dx, dy) => dy > 0 }); }
  for (const s of [-1, 1]) poly(b, [FX, 196, FX + s * 32, 184, FX + s * 34, 204, FX + s * 4, 202], BOW, M_CLOTH);
  ball(b, FX, 197, 8, 7, BOW, { mat: M_CLOTH, line: true });
  path(b, [FX - 58, 186, FX - 30, 192], hexU('#B91C1C'), 2); path(b, [FX + 58, 186, FX + 30, 192], hexU('#B91C1C'), 2);
  yield;
  // ---- the ears, red-rimmed, hairs out of them
  for (const s of [-1, 1]) {
    const ex = FX + s * 94, ey = 104;
    ball(b, ex, ey, 14, 22, PALL, { mat: M_SKIN, line: true });
    ball(b, ex - s * 2, ey + 2, 8, 13, R('#B2A8A6', '#9A8E8E', '#7E7072', '#5A4C50', '#2E2228'), { mat: M_SKIN, soft: 0.3 });
    ball(b, ex - s * 3, ey + 4, 2.6, 3.4, R('#3A2026', '#24121A', '#140810', '#080306', '#000000'), { mat: M_OTHER });
    hairs(b, 8, () => [ex - s * 3, ey + 3], 7, s > 0 ? -0.2 : Math.PI + 0.2, HAIR[3]);
    // (the pointed tips Satan gave him, sprouting up out of the old ones)
    poly(b, [ex - s * 8, ey - 14, ex + s * 10, ey - 46, ex + s * 12, ey - 12], PALL, M_SKIN);
  }
  yield;
  // ---- the face: round and fat, the jowls hanging, the chins (two, then a third when he roars)
  ball(b, FX, 194, 86, 20, PALL, { mat: M_SKIN, line: (_dx, dy) => dy > -0.1, lw: 1.5 });
  ball(b, FX, 180, 80, 22, PALL, { mat: M_SKIN, line: (_dx, dy) => dy > -0.1, lw: 1.5 });
  ball(b, FX, FY, 92, 82, PALL, { mat: M_SKIN, line: (_dx, dy) => dy > -0.2, lw: 1.5 });
  for (const s of [-1, 1]) ball(b, FX + s * 54, 136, 38, 36, PALL, { mat: M_SKIN, line: (dx, dy) => dy > 0.35 || dx * s > 0.85, lit: 1.05 });
  yield;
  // (the dome: shining, the veins up it, blue under the gray)
  ball(b, FX, 30, 78, 52, PALL, { mat: M_SKIN, lit: 1.15, only: (_x, y) => y < 60 });
  vein(b, [FX - 10, 66, FX - 14, 50, FX - 8, 36, FX - 14, 20], VEIN_B, 3);
  vein(b, [FX - 14, 50, FX - 30, 40, FX - 34, 28], VEIN_B, 2);
  vein(b, [FX + 26, 64, FX + 30, 48, FX + 24, 34, FX + 30, 14], VEIN_B, 3);
  vein(b, [FX + 60, 70, FX + 66, 56, FX + 62, 44], VEIN_B, 2);
  vein(b, [FX - 66, 74, FX - 70, 60, FX - 66, 46], VEIN_B, 2);
  yield;
  // (the forehead lines, the furrow between the brows)
  for (let k = 0; k < 3; k++) path(b, [FX - 46, 50 + k * 6, FX - 16, 47 + k * 6, FX + 16, 48 + k * 6, FX + 46, 51 + k * 6], PALL[5], 1, undefined, M_SKIN);
  for (const s of [-1, 1]) path(b, [FX + s * 5, 66, FX + s * 7, 78], PALL[6], 1, undefined, M_SKIN);
  yield;
  // ---- the wig: lopsided, shoved over to his right, the tape under its edge, the comb-over showing, the tag
  {
    const wx = FX + 22, wy = 8;
    ball(b, wx, wy, 82, 40, WIG, { mat: M_HAIR, line: true, lw: 1.5 });
    poly(b, [wx - 70, 16, wx - 82, 54, wx - 64, 40, wx - 50, 22], WIG, M_HAIR);
    poly(b, [wx + 54, 20, wx + 80, 24, wx + 86, 66, wx + 70, 54], WIG, M_HAIR);
    // (the nylon's shine: hard stripes, the strands)
    for (let k = 0; k < 40; k++) { const x0 = wx - 70 + rnd() * 140, y0 = -20 + rnd() * 46; if (matAt(b, x0, y0) === M_HAIR) path(b, [x0, y0, x0 + 6 + rnd() * 10, y0 + 6 + rnd() * 6], k % 4 ? WIG[3] : WIG[0], 1, undefined, M_HAIR); }
    for (const [x, y, w] of [[wx - 40, 0, 30], [wx + 10, -6, 20], [wx - 20, 14, 14]] as const) seg(b, x, y, x + w, y + 3, WIG[0], 1, undefined, M_HAIR);
    // (the double-sided tape, curling off under its left edge; the comb-over hairs plastered across the dome there)
    poly(b, [wx - 74, 46, wx - 60, 40, wx - 58, 46, wx - 72, 52], R('#FFFFF0', '#F0F0E0', '#D8D8C4', '#B0B09A', '#80806A'), M_OTHER);
    for (let k = 0; k < 7; k++) path(b, [FX - 66, 42 + k * 3, FX - 40, 36 + k * 3, FX - 20, 38 + k * 2.6], HAIR[k % 2 ? 2 : 4], 1, undefined, M_SKIN);
    // (the price tag on its string, off the back)
    path(b, [wx + 76, 30, wx + 92, 46, wx + 100, 70], hexU('#E4E4E4'), 1);
    poly(b, [wx + 94, 68, wx + 112, 66, wx + 116, 84, wx + 98, 86], R('#FFFFFF', '#F4F4EC', '#E0E0D0', '#C0C0AC', '#7A7A68'), M_OTHER);
    for (const [x, y] of [[wx + 100, 74], [wx + 104, 74], [wx + 108, 74], [wx + 101, 79], [wx + 106, 79]] as const) plot(b, x, y, hexU('#C81E1E'));
  }
  yield;
  // ---- the brows: down in a V, wiry, gray coming in
  for (const s of [-1, 1]) {
    const pts = [FX + s * 58, 66, FX + s * 42, 70, FX + s * 26, 76, FX + s * 10, 84];
    path(b, pts, HAIR[5], 6); path(b, pts, HAIR[3], 4); path(b, pts.map((v, i) => (i % 2 ? v - 1 : v)), HAIR[1], 1);
    for (let k = 0; k < 18; k++) { const t = rnd(), x = FX + s * (58 - t * 48), y = 66 + t * 18; seg(b, x, y + 2, x + s * (rnd() * 4 - 1), y - 3 - rnd() * 4, k % 3 ? HAIR[4] : hexU('#D0D0D0')); }
  }
  yield;
  // ---- the eyes: beady, sunk in fat, burning red (no pupils, the glow painted in), bloodshot white to the rims, the bags
  for (const s of [-1, 1]) {
    const ex = FX + s * 30, ey = 92;
    tint(b, ex, ey + 2, 22, 14, PALL[6], 0.35, M_SKIN, 0.6);
    eyeball(b, ex, ey, {
      rx: 13, ry: 9, sclera: SCLERA_R, iris: EYE, ir: 6.5, idx: -s * 1, idy: 0, pr: 2.2, veins: 18, glow: true, lid: PALL,
      top: (x) => ey - 5 + Math.abs(x - (ex - s * 5)) * 0.15 + (s * (x - ex) < 0 ? 2 : 0) + (key === 'b' ? 1 : 0),
      bot: (x) => ey + 5 - ((x - ex) / 13) ** 2 * 2,
    });
    for (const [dy, col] of [[8, PALL[6]], [12, PALL[5]], [16, PALL[5]]] as const) path(b, [ex - 13, ey + dy - 2, ex - 5, ey + dy + 1, ex + 5, ey + dy + 1, ex + 13, ey + dy - 2], col, 1, undefined, M_SKIN);
    tint(b, ex, ey + 10, 13, 5, hexU('#6A3A5A'), 0.4, M_SKIN, 0.7);
    for (let k = 0; k < 3; k++) path(b, [ex + s * 15, ey - 2 + k * 4, ex + s * 22, ey - 4 + k * 6, ex + s * 27, ey - 4 + k * 8], PALL[6], 1, undefined, M_SKIN);
  }
  yield;
  // ---- the nose: a drinker's bulb, red and purple, broken veins all over it, the pores like a strawberry's seeds
  poly(b, [FX - 7, 86, FX + 7, 86, FX + 14, 112, FX - 14, 112], PALL, M_SKIN, { line: false, tilt: 1.4 });
  for (const s of [-1, 1]) ball(b, FX + s * 18, 124, 11, 10, NOSE, { mat: M_SKIN, line: (dx, dy) => dy > -0.2 && dx * s > -0.3 });
  ball(b, FX, 118, 22, 20, NOSE, { mat: M_SKIN, line: (_dx, dy) => dy > 0.4, lit: 1.1 });
  for (let k = 0; k < 9; k++) { const a = rnd() * Math.PI * 2; walk2(b, FX + Math.cos(a) * 6, 118 + Math.sin(a) * 6, a, 10 + rnd() * 8, hexU('#C82A44')); }
  for (const s of [-1, 1]) {
    ball(b, FX + s * 10, 132, 6, 3.6, R('#4A1C26', '#2E0E16', '#1A060C', '#0E0206', '#060000'), { mat: M_OTHER });
    for (let k = 0; k < 5; k++) path(b, [FX + s * (6 + k * 2), 132, FX + s * (5.5 + k * 2.4) + (rnd() - 0.5) * 2, 135 + rnd() * 3, FX + s * (5 + k * 2.6) + (rnd() - 0.5) * 3, 137 + rnd() * 3], HAIRLINE);
  }
  yield;
  // ---- the mouth: wide open, the fangs down past his lip
  const cx = FX, cy = 166, mw = 34, mh = 14;
  ball(b, cx, cy, mw + 5, mh + 5, LIP, { mat: M_OTHER, line: true, lw: 1.4 });
  ball(b, cx, cy, mw, mh, MOUTH, { mat: M_MOUTH, flat: 0.25, lit: 0.55 });
  ball(b, cx, cy + mh - 4, 22, 8, TONGUE, { mat: M_MOUTH, line: (_dx, dy) => dy < 0, only: (x, y) => matAt(b, x, y) === M_MOUTH });
  seg(b, cx, cy + mh - 9, cx, cy + mh - 2, TONGUE[4], 1, undefined, M_MOUTH);
  const top = (x: number) => cy - mh * Math.sqrt(Math.max(0, 1 - ((x - cx) / mw) ** 2)) + 1;
  const bot = (x: number) => cy + mh * Math.sqrt(Math.max(0, 1 - ((x - cx) / mw) ** 2)) - 1;
  yield;
  // (the gums, gone back, then the teeth: brown, crooked, a gold one, gaps)
  for (let x = cx - mw; x <= cx + mw; x++) { const t = Math.round(top(x)); for (let y = t; y < t + 4; y++) if (matAt(b, x, y) === M_MOUTH) plot(b, x, y, GUM[y === t ? 3 : y < t + 3 ? 1 : 2], M_OTHER); }
  teeth(b, cx - 28, cx + 28, (x) => top(x) + 4, 1, 6, { gaps: [2, 9], gold: [7], rot: [0, 3, 10], ramp: TOOTH_B });
  teeth(b, cx - 24, cx + 24, bot, -1, 5, { gaps: [5], rot: [1, 7], ramp: TOOTH_B });
  yield;
  // (the fangs: long, ivory, curved in to points, over the bottom lip; the gum swollen round their roots)
  for (const s of [-1, 1]) {
    const fx = cx + s * 17;
    for (let yy = 0; yy < 28; yy++) {
      const w = Math.max(0.6, 4.4 * (1 - (yy / 28) ** 1.6)), xc = fx + s * (yy / 28) ** 2 * -3;
      for (let xx = -Math.ceil(w); xx <= Math.ceil(w); xx++) {
        if (Math.abs(xx) > w) continue;
        const u = (xx + w) / (2 * w);
        const k = Math.abs(xx) >= w - 0.6 ? 5 : u < 0.25 ? 0 : u < 0.55 ? 1 : u < 0.8 ? 2 : 3;
        plot(b, xc + xx, top(fx) + 1 + yy, FANG[bay(xc + xx, yy) > 0.85 && k < 3 ? k + 1 : k], M_OTHER);
      }
    }
    ball(b, fx, top(fx) + 1, 6, 3, GUM, { mat: M_OTHER, line: (_dx, dy) => dy < 0 });
    seg(b, fx - 2, top(fx) + 5, fx - 2, top(fx) + 16, WHITE);
    // (blood down it from the root, beading at the tip)
    path(b, [fx + 1, top(fx) + 4, fx + 2, top(fx) + 14, fx + 1, top(fx) + 22], BLOOD[2], 1);
  }
  yield;
  // (blood and spit strung between the jaws)
  for (const sx of [cx - 8, cx + 4, cx + 26]) for (let y = Math.round(top(sx) + 8); y < bot(sx) - 3; y++) if (bay(sx, y) < 0.7) plot(b, sx + Math.round(Math.sin(y * 0.4)), y, sx === cx - 8 ? BLOOD[1] : hexU('#F0E0E4'));
  yield;
  // (the lips: thin, gray-purple, chapped, a crust of blood at the corner)
  for (let x = cx - mw - 4; x < cx + mw + 4; x += 3) for (let y = cy - mh - 6; y < cy + mh + 6; y++) if (matAt(b, x, y) === M_OTHER && b.px[y * GW + x] === LIP[1] && hash2(x, y) > 0.5) plot(b, x, y, LIP[3]);
  tint(b, cx + mw + 2, cy + 2, 6, 5, BLOOD[3], 0.7, undefined, 0.5);
  yield;
  // ---- the mustache: bristly, gray in it, grease and crumbs off the drumstick
  for (let k = 0; k < 260; k++) {
    const x = FX - 36 + rnd() * 72, y = 139 + rnd() * 5 + Math.abs(x - FX) * 0.1;
    if (Math.abs(x - FX) < 4 && rnd() < 0.6) continue;
    seg(b, x, y, x + (x - FX) * 0.08 + (rnd() - 0.5), y + 5 + rnd() * 3, k % 5 ? HAIR[k % 2 ? 4 : 3] : hexU('#C8C8C8'));
  }
  for (const [x, y] of [[FX - 22, 145], [FX + 10, 147], [FX + 26, 146], [FX - 6, 148]] as const) { ball(b, x, y, 1.8, 1.4, R('#F4D49A', '#E0AE60', '#B8823A', '#8A5A20', '#4A2E0A')); }
  tint(b, FX + 16, 147, 10, 3, hexU('#FFF0B0'), 0.4, undefined, 0.6);
  yield;
  // ---- five o'clock shadow over the jowls and the chins
  stubble(b, (x, y) => {
    if (y < 120) return 0;
    const d = Math.abs(x - FX) / 92;
    return y > 140 ? 1 - d * 0.5 : (y - 120) / 20 * (d > 0.35 ? 1 : 0.3);
  }, PALL[6], 0.5);
  yield;
  // ---- the pores, the blackheads (the nose, the chin), the grease
  skinPost(b, PALL[7], (x, y) => {
    const nose = ((x - FX) / 26) ** 2 + ((y - 120) / 22) ** 2 < 1;
    return nose ? 0.22 : y < 60 ? 0.03 : 0.05;
  }, { blackheads: (x, y) => ((x - FX) / 28) ** 2 + ((y - 122) / 22) ** 2 < 1, shine: 0.22 });
  yield;
  // (a wart on his cheek, hairs out of it; a shaving nick on a chin)
  ball(b, FX - 60, 128, 4.6, 4, R('#D8CCC8', '#BCAEAA', '#9E8E8C', '#80706E', '#5A4A4A', '#2E2222'), { line: true, mat: M_OTHER });
  path(b, [FX - 60, 125, FX - 63, 118, FX - 61, 112], HAIRLINE); path(b, [FX - 58, 125, FX - 56, 119], HAIRLINE);
  seg(b, FX + 40, 178, FX + 44, 176, BLOOD[2]); plot(b, FX + 43, 179, BLOOD[3]);
  yield;
  // ---- sweat: sheeting off the dome, beads over the lip, a run down each temple
  for (let k = 0; k < 18; k++) { const x = FX - 70 + rnd() * 140, y = 30 + rnd() * 34; if (matAt(b, x, y) === M_SKIN) bead(b, x, y, 1.6 + rnd() * 1.8, PALL); }
  
  for (const s of [-1, 1]) { path(b, [FX + s * 78, 62, FX + s * 82, 80, FX + s * 81, 98, FX + s * 84, 110], mixU(PALL[1], WHITE, 0.5), 2, undefined, M_SKIN); bead(b, FX + s * 84, 112, 2.2, PALL); }
  return b;
}
/** A broken vein on his nose: a wandering red thread, branching once. */
const walk2 = (b: Buf, x: number, y: number, a: number, n: number, col: number) => {
  for (let i = 0; i < n; i++) {
    x += Math.cos(a); y += Math.sin(a); a += (rnd() - 0.5) * 1.3;
    if (matAt(b, x, y) !== M_SKIN) return;
    plot(b, x, y, col);
    if (i === 4) { let x2 = x, y2 = y, a2 = a + 1; for (let j = 0; j < 4; j++) { x2 += Math.cos(a2); y2 += Math.sin(a2); if (matAt(b, x2, y2) === M_SKIN) plot(b, x2, y2, col); } }
  }
};

const get = stamps<Key>(build, ['a', 'b']);

/** His gross-up: (cx, cy) where the middle of his face goes on the screen, `zoom` 1 at the hold. */
export const drawDonnieGross = (c: Ctx, cx: number, cy: number, zoom: number, f: number, jolt = 0) => {
  const squint = f % 80 < 8;
  const s = get(squint ? 'b' : 'a');
  drawGrossStamp(c, s.img, cx, cy, FX, FY, zoom, f, jolt, (box) => {
    // (the eyes' glow, pulsing: a halo of hot pixels round each)
    const p = 0.5 + 0.5 * Math.sin(f * 0.25);
    c.globalAlpha = 0.35 + p * 0.35;
    for (const s2 of [-1, 1]) {
      const ex = FX + s2 * 30 - s2, ey = 92;
      box(ex - 3, ey - 3, 7, 7, '#FFD040'); box(ex - 1, ey - 5, 3, 11, '#FF7A1A'); box(ex - 5, ey - 1, 11, 3, '#FF7A1A');
      box(ex - 1, ey - 1, 3, 3, '#FFFFF0');
    }
    c.globalAlpha = 1;
    // (blood running down his near fang, beading at its tip and dripping)
    const t = (f % 70) / 70, x = FX - 17 + 3, y0 = 170;
    box(x, y0, 1, Math.round(t * 10), '#B01C1C');
    if (t > 0.6) { const d = (t - 0.6) / 0.4; box(x - 1, y0 + 10 + d * 30, 2, 3, '#B01C1C'); box(x - 1, y0 + 10 + d * 30, 1, 1, '#F46A6A'); }
    // (a bead of sweat off the dome, down his temple)
    const u = (f % 130) / 130, sx = FX + 80 + Math.sin(u * 8), sy = 60 + u * 54;
    box(sx, sy, 2, 3, '#FFFFFF'); box(sx + 1, sy + 2, 1, 1, '#9A8E8E');
    // (the aura licking up round his shoulders)
    for (let i = 0; i < 10; i++) {
      const ph = ((f * 0.8 + i * 13) % 40) / 40, side = i % 2 ? 1 : -1, ax = FX + side * (110 + (i % 5) * 6), ay = 190 - ph * 120;
      c.globalAlpha = (1 - ph) * 0.6; box(ax, ay, 3, 6, ph < 0.5 ? '#FF4A2A' : '#B00A0A');
    }
    c.globalAlpha = 1;
  });
};

/** Behind him: the circle's red light, in bands. */
export const drawDonnieGrossBack = (c: Ctx, W: number, H: number) => grossBackdrop(c, W, H, ['#1A0204', '#2E0408', '#48080C', '#661010', '#861A14']);
