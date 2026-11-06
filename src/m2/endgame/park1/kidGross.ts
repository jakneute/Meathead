// ZORZARBLAX'S GROSS-UP (the standing rule for every close-up: "gross ren and stimpy style close ups": grossKit.ts):
// the fight's first look at him, turned round from the summit's view. Three-quarters on, huge, too close, a man of
// twenty-six who still lives with his parents: the cinder-block jaw (his dad's) filling the bottom of the frame, the
// under-bite's pegs jutting up over the lip (yellow, brown at the gums, plaque, one gone, one chipped, a Cheeto wedged
// between two), his mom's lipstick caked on the fat lower lip and smeared off past the corner, a cold sore; the wispy
// mustache he's trying; the pug snout, its nostrils wet and crusted; still breaking out (a whitehead ready to go on the
// jaw, its friends, blackheads all over the cranium and the snout), patchy stubble, warts with hairs in them; the tiny
// cranium up on the front of it all, the hair slicked back greasy into mom's curlers, a bobby pin; his THREE eyes,
// none matching: two of his dad's, beady, yellow, bloodshot, not level, under a heavy knotted brow, and her big lashed
// one up top, blue shadow caked on, mascara run, looking off at nothing; the veins up his temples and his neck, the
// neck's rolls; the gaming headset round it, the mic boom up by his mouth, its light on; the band tee's collar
// stretched out and stained; slime over everything, catching the night.
// Live: the whitehead throbbing, the slime dripping off the jaw, the big eye's lazy drift, the headset's light.

import {
  type Ctx, type Buf, GW, GH, R, hexU, newBuf, setSeed, rnd, matAt, ball, tint, poly, seg, path, plot, eyeball, skinPost, stubble, bead, vein, inkEdges, stamps, drawGrossStamp, grossBackdrop, bay,
  TOOTH, TOOTH_B, MOUTH, GUM, TONGUE, M_SKIN, M_HAIR, M_MOUTH, M_OTHER, M_METAL, M_CLOTH,
} from '../../grossKit';

const FX = 136, FY = 106;
const HIDE = R('#E2EEB8', '#C0D494', '#A2BE78', '#86A65E', '#6A8C48', '#4E7034', '#345222', '#1C3012', '#0A1404');
const LIP = R('#FFC0D0', '#FF8AA8', '#F4507A', '#D2305C', '#A81E44', '#741230', '#3A0614');
const CURLER = R('#E0EEFF', '#A8CCFF', '#6A9CF4', '#3A6CD4', '#1E4294', '#0A1A44');
const CURLER_P = R('#FFE0F0', '#FFA8D4', '#F472B6', '#D63A8E', '#9A1A5E', '#4A0628');
const HAIR = R('#9A7A5E', '#6E5038', '#4E3424', '#36221A', '#22140C', '#0E0604');
const YEL = R('#FFFCE0', '#F6EEA0', '#E8D84A', '#C8B430', '#A08A1E', '#5A4A0E');
const IRIS_D = R('#FFE8A0', '#E8B838', '#B0801A', '#704C0A', '#3A2404');
const PURPLE = R('#E6D0FF', '#B48AF4', '#8452D8', '#5A2AA8', '#341274', '#16063A');
const SHADOW = R('#A8BCFF', '#7A94F4', '#5A74E0', '#3B5BDB', '#2A40A8', '#141E5A');
const HEAD = R('#9A9AA8', '#6A6A78', '#46464E', '#2C2C34', '#18181C', '#060608');
const SHIRT = R('#FFF8C8', '#FFF0A0', '#F6D445', '#D4A52A', '#A87818', '#6A4A0C', '#3E2806');
const WART = R('#D0DC98', '#B8C878', '#8A9A50', '#6A7A3A', '#4A5A2A', '#2A3214');
const ZIT = R('#FFFFF0', '#FFE8D0', '#F4A890', '#D86A5A', '#A8403A', '#6A1E18');
const SORE = R('#FFE6D8', '#F4A08A', '#D86A54', '#A8402E', '#6A1E10', '#3A0C04');
const HVEIN = R('#D8B4F4', '#B48AD8', '#9A72B8', '#7A54A0', '#5B3A78', '#22142E');
const BOILR = R('#FFD0C0', '#F4A090', '#E8685A', '#C2403C', '#8E2228', '#4A0E10');
const PUSR = R('#FFFFF0', '#FFF4B0', '#F4E27A', '#D8BC3A', '#A88A1C', '#5A4A08');
const CALA = R('#FFF0F0', '#FBC8C8', '#F4A6AC', '#D88A90', '#A86A70');
const SLIME = hexU('#A8E03A'), SLIME_L = hexU('#EAFFB0'), SLIME_D = hexU('#5E8A18');
const STUB = hexU('#1E3010'), HAIRLINE = hexU('#0A0604'), CHEETO = R('#FFD08A', '#FBA13C', '#F08A1C', '#C8650E', '#8A3E06');

type Key = 'a' | 'b';
function* build(key: Key): Generator<void, Buf> {
  setSeed(7711);
  const open = key === 'b';
  const b = newBuf();
  yield;
  // ---- the band tee's collar at the bottom: stretched out, a sweat ring, a stain, the GLORP print's top
  poly(b, [0, 176, 120, 168, 272, 180, 272, 204, 0, 204], SHIRT, M_CLOTH, { tilt: 0.3 });
  for (let x = 0; x < GW; x++) { const y = Math.round(172 + Math.sin(x * 0.05) * 3 + (x / GW) * 6); for (let d = 0; d < 6; d++) plot(b, x, y + d, SHIRT[d < 1 ? 6 : d < 3 ? 3 : 4], M_CLOTH); }
  for (let k = 0; k < 4; k++) path(b, [10 + k * 50, 204, 18 + k * 50, 186, 30 + k * 50, 182], SHIRT[4], 1, undefined, M_CLOTH);
  tint(b, 60, 196, 40, 10, hexU('#8A6A18'), 0.45, M_CLOTH, 0.6);
  for (let k = 0; k < 3; k++) { poly(b, [210 + k * 8, 186, 214 + k * 8, 186, 216 + k * 8, 204, 212 + k * 8, 204], CHEETO, M_CLOTH, { line: false }); }
  ball(b, 40, 202, 18, 14, R('#FFFFFF', '#F4F4F5', '#D4D4D8', '#A1A1AA', '#3F3F46'), { mat: M_CLOTH, line: true, only: (_x, y) => y < GH });
  for (const [x, y] of [[33, 198], [47, 198], [40, 192]] as const) ball(b, x, y, 3.4, 3, R('#3F3F46', '#18181B', '#0A0A0C', '#000000'), { mat: M_CLOTH });
  yield;
  // ---- the neck: wide, going off the bottom; rolls in it, the veins up it like hoses
  poly(b, [40, 120, 250, 112, 262, 178, 30, 180], HIDE.slice(3), M_SKIN, { tilt: 0.6 });
  for (let k = 0; k < 3; k++) for (let x = 40; x < 250; x++) { const y = 160 + k * 7 + Math.sin(x * 0.04 + k) * 2; plot(b, x, y, HIDE[7], undefined, M_SKIN); plot(b, x, y - 1, HIDE[5], undefined, M_SKIN); plot(b, x, y + 1, HIDE[2], undefined, M_SKIN); }
  vein(b, [70, 180, 74, 166, 68, 150, 74, 136], HVEIN, 3);
  vein(b, [222, 180, 218, 164, 226, 150], HVEIN, 2);
  yield;
  // ---- the headset round his neck: the band, the near cup, its light; the mic boom up by his mouth
  for (let x = 30; x < 262; x++) { const u = (x - 146) / 116, y = Math.round(170 + u * u * -10 + u * 4); for (let d = 0; d < 7; d++) plot(b, x, y + d, HEAD[d < 1 ? 5 : d < 2 ? 1 : d < 5 ? 3 : 5], M_METAL); plot(b, x, y + 3, hexU(x % 6 < 3 ? '#16A34A' : '#22C55E'), M_METAL); }
  ball(b, 244, 178, 24, 26, HEAD, { mat: M_METAL, line: true, lw: 1.5 });
  ball(b, 244, 178, 15, 17, HEAD.slice(2), { mat: M_METAL });
  for (let a = 0; a < Math.PI * 2; a += 0.02) plot(b, 244 + Math.cos(a) * 18, 178 + Math.sin(a) * 20, hexU('#22C55E'), M_METAL);
  yield;
  // ---- the jaw: the cinder block, filling the bottom of the frame; the chin out past the mouth (the under-bite)
  poly(b, [14, 92, 236, 82, 262, 108, 266, 150, 252, 172, 22, 176, 8, 140], HIDE, M_SKIN, { tilt: 0.5 });
  ball(b, 136, 132, 126, 46, HIDE, { mat: M_SKIN, soft: 0.35 });
  ball(b, 230, 150, 34, 24, HIDE, { mat: M_SKIN, line: (_dx, dy) => dy > 0.3, lit: 1.05 });
  // (the cleft in the chin; the jowl's fold)
  path(b, [240, 160, 236, 168, 238, 174], HIDE[8], 1); path(b, [241, 160, 237, 168], HIDE[6], 1);
  path(b, [26, 110, 30, 136, 22, 160], HIDE[7], 1); path(b, [27, 110, 31, 136], HIDE[5], 1);
  yield;
  // ---- the mouth: the slot across it, the black of it (gaping on 'b', the screech: gums, the tongue, spit strung)
  const mx0 = 40, mx1 = 236, my = 124, mh = open ? 30 : 4;
  const top = (x: number) => my - 2 + Math.sin(((x - mx0) / (mx1 - mx0)) * Math.PI) * -4;
  const bot = (x: number) => my + mh + Math.sin(((x - mx0) / (mx1 - mx0)) * Math.PI) * (open ? 8 : 2);
  for (let x = mx0; x <= mx1; x++) for (let y = Math.round(top(x)); y <= bot(x); y++) {
    const d = (y - top(x)) / Math.max(1, bot(x) - top(x));
    plot(b, x, y, MOUTH[d < 0.15 ? 2 : d < 0.5 ? 3 : 4 + (bay(x, y) < 0.5 ? 0 : 1)], M_MOUTH);
  }
  if (open) {
    for (let x = mx0 + 4; x < mx1 - 4; x++) { const t = Math.round(top(x)); for (let y = t; y < t + 5; y++) if (matAt(b, x, y) === M_MOUTH) plot(b, x, y, GUM[y - t < 1 ? 4 : y - t < 3 ? 1 : 2], M_OTHER); }
    teeth(b, mx0 + 30, mx1 - 30, (x) => top(x) + 5, 8);
    ball(b, 140, my + mh - 2, 50, 14, TONGUE, { mat: M_MOUTH, line: (_dx, dy) => dy < 0, only: (x, y) => matAt(b, x, y) === M_MOUTH });
    seg(b, 140, my + mh - 12, 140, my + mh + 2, TONGUE[4], 1, undefined, M_MOUTH);
    ball(b, 152, my + 12, 4, 7, TONGUE, { mat: M_MOUTH, line: true });
    for (const sx of [74, 118, 182, 210]) for (let y = Math.round(top(sx) + 6); y < bot(sx) - 6; y++) if (bay(sx, y) < 0.7) plot(b, sx + Math.round(Math.sin(y * 0.3) * 1.5), y, hexU('#E8F4D8'));
  }
  yield;
  // (the upper lip: thin, his dad's; a smear of the lipstick on it too)
  for (let x = mx0 - 4; x <= mx1 + 4; x++) { const t = Math.round(top(x)); for (let d = 1; d <= 5; d++) plot(b, x, t - d, d === 5 ? HIDE[8] : d > 3 ? HIDE[6] : HIDE[5], M_SKIN); }
  for (let x = 90; x < 170; x++) if (bay(x, 0) < 0.6) plot(b, x, Math.round(top(x)) - 3, LIP[3], M_SKIN);
  // (the mustache he's trying: wispy, two dozen hairs over the lip)
  for (let k = 0; k < 60; k++) { const x = 70 + rnd() * 150, t = top(x); seg(b, x, t - 6, x + 2 + rnd() * 2, t - 13 - rnd() * 5, k % 4 ? hexU('#1E2412') : hexU('#3A4424'), 1, M_HAIR); }
  // (the lower lip: fat, lipsticked, caked, cracked, smeared past the lines off the corner up his cheek)
  const ly = (x: number) => bot(x) + 1;
  for (let x = mx0 - 8; x <= mx1 + 8; x++) {
    const th = 11 + Math.sin(((x - mx0) / (mx1 - mx0)) * Math.PI) * 6, y0 = ly(Math.max(mx0, Math.min(mx1, x)));
    for (let d = 0; d < th; d++) { const u = d / th; plot(b, x, y0 + d - 2, LIP[d >= th - 1 ? 6 : u < 0.2 ? (bay(x, y0 + d) < 0.5 ? 0 : 1) : u < 0.45 ? 2 : u < 0.75 ? 3 : 4], M_OTHER); }
    if (x % 9 === 0) seg(b, x, y0 + 1, x + 1, y0 + th - 4, LIP[5], 1);
  }
  for (let k = 0; k < 260; k++) { const t = rnd(), x = mx0 - 4 - t * 26 + (rnd() - 0.5) * 8, y = ly(mx0) - t * 24 + (rnd() - 0.5) * 7 * (1 - t * 0.5); if (matAt(b, x, y) === M_SKIN && rnd() > t * 0.7) plot(b, x, y, LIP[t < 0.4 ? 3 : bay(x, y) < 0.5 ? 2 : 4]); }
  // (the cold sore at the corner)
  ball(b, mx1 + 6, ly(mx1) + 2, 8, 7, SORE, { line: true, lw: 0.8, mat: M_OTHER });
  for (const [dx, dy] of [[-2, -2], [2, 0], [0, 3]] as const) ball(b, mx1 + 6 + dx, ly(mx1) + 2 + dy, 1.6, 1.6, R('#FFFFF0', '#FFF4D8', '#F4D8A8', '#C8A070'));
  yield;
  // ---- the under-bite's pegs: rooted behind the lower lip, up over the top one; yellow, brown at the gums, plaque,
  // cracked; one gone, one chipped, a Cheeto wedged between two
  for (let k = 0; k < 10; k++) {
    if (k === 6) continue;
    const x = 52 + k * 18 + (k % 2) * 2, root = ly(x) + 2, h = 34 + (k % 3) * 6 + (k === 3 ? 8 : 0), tp = root - h, w = 13 - (k % 2);
    poly(b, [x, tp + 3, x + w * 0.5, tp - 1, x + w, tp + 4, x + w + 1, root, x - 1, root], k % 4 === 1 ? TOOTH_B : TOOTH, M_OTHER, { tilt: 0.25 });
    for (let y = root - 10; y < root; y++) for (let xx = x; xx < x + w; xx++) if (matAt(b, xx, y) === M_OTHER && bay(xx, y) < (y - root + 10) / 10) plot(b, xx, y, TOOTH_B[(xx + y) % 2 ? 3 : 4]);
    if (k % 3 === 0) path(b, [x + 4, tp + 8, x + 6, tp + 16, x + 5, tp + 22], TOOTH_B[4], 1);
    if (k === 8) for (let yy = tp - 1; yy < tp + 9; yy++) for (let xx = x + 5; xx < x + w + 1; xx++) if (xx - x - 5 > yy - tp) plot(b, xx, yy, open ? MOUTH[3] : HIDE[5]);
  }
  poly(b, [158, ly(158) - 26, 170, ly(158) - 30, 172, ly(158) - 14, 160, ly(158) - 10], CHEETO, M_OTHER);
  yield;
  // ---- the snout: a pug's, up over the lip at the front; its nostrils wet, crusted, a booger
  ball(b, 216, 96, 22, 15, HIDE, { mat: M_SKIN, line: (_dx, dy) => dy > 0.45, lit: 1.1 });
  for (const [x, y, rx] of [[208, 102, 5.5], [227, 100, 4.6]] as const) {
    ball(b, x, y, rx, rx * 0.6, R('#1C2010', '#101408', '#080A04', '#020301', '#000000'), { mat: M_OTHER });
    plot(b, x - rx * 0.5, y - 1, SLIME_L); seg(b, x - 2, y + rx * 0.6, x - 1, y + rx * 0.6 + 6, SLIME, 2);
  }
  ball(b, 229, 104, 2.6, 2, R('#D8E090', '#B8C060', '#8A9A3A', '#5A6A1A', '#2A3208'), { mat: M_OTHER, line: true, lw: 0.6 });
  yield;
  // ---- the cranium: tiny, up on the front of the jaw; greasy hair slicked back off it into mom's curlers
  // (the ponytail's crest off the back of it, rolled in curlers, a bobby pin, the hairnet's threads)
  ball(b, 52, 42, 46, 26, HAIR, { mat: M_HAIR, line: true });
  const curls: [number, number, number[]][] = [[30, 30, CURLER], [54, 22, CURLER_P], [78, 28, CURLER], [40, 54, CURLER_P], [66, 50, CURLER]];
  for (const [x, y, r] of curls) {
    ball(b, x, y, 12, 10, r, { mat: M_METAL, line: true, lw: 1.2 });
    for (let k = -2; k <= 2; k++) seg(b, x + k * 4, y - 9, x + k * 4, y + 9, r[4], 1, undefined, M_METAL);
    seg(b, x - 12, y, x + 12, y, hexU('#E4E4EA'), 1, undefined, M_METAL);
  }
  for (let k = 0; k < 9; k++) path(b, [8 + k * 10, 20 + (k % 2) * 6, 20 + k * 10, 60 - (k % 3) * 4], hexU('#8A8A94'), 1);
  seg(b, 92, 18, 108, 48, hexU('#2A2A30'), 2); seg(b, 92, 17, 108, 47, hexU('#9A9AA8'), 1);
  yield;
  ball(b, 132, 64, 64, 50, HIDE, { mat: M_SKIN, line: (dx, dy) => dy < 0.4 || dx < -0.6 });
  // (the hair: slicked over the top, the comb's lines, wet with grease; strays standing up off it)
  for (let k = 0; k < 220; k++) {
    const t = rnd(), x0 = 90 + t * 80, y0 = 18 + (1 - t) * 10 + Math.abs(t - 0.5) * 12;
    const x1 = x0 - 40 - rnd() * 20, y1 = y0 + 10 + rnd() * 14;
    seg(b, x0, y0, x1, y1, HAIR[k % 7 === 0 ? 0 : k % 3 ? 2 : 3], 1, M_HAIR, undefined);
  }
  for (const [x, y] of [[148, 14], [160, 18], [134, 12]] as const) path(b, [x, y + 4, x + 3, y - 6, x + 6, y - 10], HAIRLINE, 1);
  for (let k = 0; k < 10; k++) seg(b, 100 + k * 6, 20 + k * 0.4, 70 + k * 4, 34 + k, hexU('#C8B8A0'), 1, undefined, M_HAIR);
  yield;
  // ---- the brow: a heavy knotted ridge over dad's two eyes (his "I'm not mad" frown); the veins up the temple
  // (the cranium's shadow down over the eyes and onto the jaw)
  tint(b, 142, 92, 66, 18, HIDE[7], 0.35, M_SKIN, 0.6);
  vein(b, [184, 44, 190, 56, 186, 70], HVEIN, 2); vein(b, [98, 52, 92, 64], HVEIN, 2);
  // the eyes: dad's two (beady, yellow, bloodshot, not level, the lids heavy), mom's big lashed one up top
  eyeball(b, 120, 88, { rx: 13, ry: 11, sclera: YEL, iris: IRIS_D, ir: 4, idx: 3, idy: 1, pr: 2.4, veins: 14, lid: HIDE, top: (x) => 81 + (x - 120) * 0.12, bot: (x) => 96 - ((x - 120) / 13) ** 2 * 3 });
  eyeball(b, 166, 94, { rx: 10, ry: 9, sclera: YEL, iris: IRIS_D, ir: 3.4, idx: 3, idy: 0, pr: 2, veins: 10, lid: HIDE, top: (x) => 89 + (x - 166) * 0.1, bot: (x) => 101 });
  for (const [ex, ey, w] of [[120, 104, 12], [166, 107, 9]] as const) { path(b, [ex - w, ey - 2, ex, ey, ex + w, ey - 2], HIDE[7], 1, undefined, M_SKIN); path(b, [ex - w + 2, ey + 3, ex, ey + 5, ex + w - 2, ey + 3], HIDE[6], 1, undefined, M_SKIN); }
  // (the brow over them: two knotted lumps of it, down over the tops of the eyes, the frown's creases between)
  ball(b, 118, 74, 22, 9, HIDE, { mat: M_SKIN, line: (_dx, dy) => dy > 0.3, lit: 1.1 });
  ball(b, 166, 82, 17, 7.5, HIDE, { mat: M_SKIN, line: (_dx, dy) => dy > 0.3, lit: 1.1 });
  for (const x of [140, 145]) path(b, [x, 80, x + 2, 70, x + 1, 62], HIDE[7], 1);
  for (const [ex, ey, r] of [[120, 88, 13], [166, 94, 10]] as const) tint(b, ex, ey + 1, r + 4, r + 3, hexU('#B8341E'), 0.45, M_SKIN, 0.7);
  yield;
  // (mom's: big, up on the dome, blue shadow caked on, the lashes up off it, mascara run, the purple iris off at nothing)
  ball(b, 120, 40, 23, 18, SHADOW, { mat: M_OTHER, soft: 0.25 });
  eyeball(b, 120, 44, { rx: 19, ry: 15, iris: PURPLE, ir: 6, idx: -7, idy: -3, pr: 2.6, veins: 9 });
  for (let x = 101; x <= 139; x++) { const y = Math.round(44 - 15 * Math.sqrt(Math.max(0, 1 - ((x - 120) / 19) ** 2))); plot(b, x, y, HAIRLINE); plot(b, x, y - 1, HAIRLINE); }
  for (let k = 0; k < 9; k++) { const x = 103 + k * 4.4; path(b, [x, 31 - Math.sin(k / 8 * Math.PI) * 2, x - 3 + k * 0.6, 22 - (k % 2) * 3, x - 5 + k * 0.9, 18 - (k % 2) * 3], HAIRLINE, 1); }
  for (let k = 0; k < 4; k++) { let x = 108 + k * 8, y = 58; for (let s = 0; s < 14 + k * 4; s++) { y++; x += (rnd() - 0.5) * 0.8; plot(b, x, y, hexU('#1E1430')); if (s % 3 === 0) plot(b, x + 1, y, hexU('#3A2A5A')); } }
  yield;
  // ---- the skin: warts with hairs in them, zits (the whitehead on the jaw ready to go), patchy stubble, the pores,
  // blackheads all over the cranium and the snout, grease shining; slime over him
  for (const [x, y, r, hair] of [[88, 104, 8, true], [30, 120, 5, false], [196, 54, 4, true], [258, 132, 5, false]] as const) {
    ball(b, x, y, r, r * 0.85, WART, { line: true, lw: 0.9, mat: M_OTHER });
    for (let k = 0; k < 4; k++) plot(b, x - r * 0.3 + (k % 2) * r * 0.5, y - r * 0.2 + (k >> 1) * r * 0.4, WART[3]);
    if (hair) { path(b, [x, y - r, x - 3, y - r - 10, x - 8, y - r - 16], HAIRLINE, 1); path(b, [x + 2, y - r, x + 5, y - r - 7], HAIRLINE, 1); }
  }
  for (const [x, y, r] of [[196, 148, 8], [214, 164, 4], [178, 160, 3], [56, 156, 4], [44, 98, 3], [176, 34, 4], [252, 116, 3]] as const) {
    ball(b, x, y, r + 2, r + 1.5, R('#E88A7A', '#D86A5A', '#B84A40', '#8A2A24'), { soft: 0.6, mat: M_OTHER });
    ball(b, x, y, r, r, ZIT, { line: true, lw: 0.6, mat: M_OTHER });
  }
  // ---- the misery (the owner's "obvious intense discomfort"): boils, ripe, red-ringed, a yellow head on each; the
  // neck's rash scratched raw, mom's calamine dabbed over it; tears out of dad's two
  for (const [x, y, r] of [[26, 104, 9], [178, 34, 6], [252, 104, 6], [72, 168, 6], [200, 164, 5]] as const) {
    tint(b, x, y + 2, r * 1.8, r * 1.5, hexU('#C24A44'), 0.55, M_SKIN, 0.6);
    ball(b, x, y, r, r * 0.9, BOILR, { mat: M_OTHER, line: true, lw: 0.9 });
    ball(b, x - r * 0.15, y - r * 0.3, r * 0.5, r * 0.42, PUSR, { mat: M_OTHER });
  }
  for (let k = 0; k < 140; k++) { const x = 96 + rnd() * 110, y = 150 + rnd() * 26; if (matAt(b, x, y) === M_SKIN) plot(b, x, y, hexU(k % 3 ? '#C24A44' : '#9A2E30')); }
  for (let k = 0; k < 4; k++) path(b, [104 + k * 22, 152, 112 + k * 22, 174], hexU('#FFD0C0'), 1, undefined, M_SKIN);
  ball(b, 140, 166, 12, 6, CALA, { mat: M_OTHER }); ball(b, 186, 158, 7, 4, CALA, { mat: M_OTHER });
  for (const [ex, ey] of [[122, 98], [168, 102]] as const) { path(b, [ex, ey, ex + 2, ey + 14, ex, ey + 30], hexU('#9AD8F4'), 2, undefined, M_OTHER); plot(b, ex + 1, ey + 8, hexU('#E8F8FF')); }
  stubble(b, (x, y) => (y > 134 && y < 172 ? (Math.sin(x * 0.07) > -0.3 ? 0.9 : 0.2) : 0), STUB, 0.45);
  skinPost(b, HIDE[8], (x, y) => (((x - 216) / 22) ** 2 + ((y - 96) / 15) ** 2 < 1 ? 0.1 : y < 112 ? 0.05 : 0.03), { blackheads: (x, y) => y < 112, shine: 0.12 });
  for (let k = 0; k < 12; k++) { const x = 100 + rnd() * 90, y = 30 + rnd() * 30; if (matAt(b, x, y) === M_SKIN) bead(b, x, y, 1.2 + rnd() * 1.4, HIDE); }
  inkEdges(b, M_SKIN, HIDE[8], [M_OTHER, M_MOUTH, M_METAL, M_HAIR]);
  for (let k = 0; k < 60; k++) { const x = 10 + rnd() * 250, y = 20 + rnd() * 160; if (b.mat[(y | 0) * GW + (x | 0)] === M_SKIN) { plot(b, x, y, SLIME); plot(b, x + 1, y, SLIME_L); if (k % 4 === 0) plot(b, x, y + 1, SLIME_D); } }
  // (the mic boom, round from the cup into his face, its foam at the corner of his mouth)
  path(b, [236, 160, 262, 140, 270, 120], HEAD[5], 5); path(b, [236, 159, 262, 139], HEAD[1], 2);
  ball(b, 232, 162, 9, 8, HEAD, { mat: M_METAL, line: true });
  for (let k = 0; k < 10; k++) plot(b, 228 + (k % 4) * 2.4, 158 + (k >> 2) * 3, HEAD[4]);
  return b;
}

/** The screech's top row: blunt pegs, browned (only where the mouth's open, M_MOUTH). */
const teeth = (b: Buf, x0: number, x1: number, edge: (x: number) => number, h: number) => {
  for (let x = x0, i = 0; x < x1; x += 12, i++) {
    if (i === 2 || i === 7) continue;
    for (let tx = 0; tx < 10; tx++) for (let ty = 0; ty < h + (i % 2) * 3; ty++) {
      const y = Math.round(edge(x + tx) + ty);
      if (matAt(b, x + tx, y) !== M_MOUTH) continue;
      const ramp = i % 3 === 1 ? TOOTH_B : TOOTH;
      plot(b, x + tx, y, ramp[tx === 0 ? 0 : tx === 9 ? 4 : ty > h - 2 ? 3 : 1 + (bay(x + tx, y) > 0.8 ? 1 : 0)], M_OTHER);
    }
  }
};

const get = stamps<Key>(build, ['a', 'b']);

/** His gross-up: (cx, cy) where his middle goes, `zoom` 1 at the hold; the screech's mouth on `open`. */
export const drawKidGross = (c: Ctx, cx: number, cy: number, zoom: number, f: number, open: boolean, jolt = 0) => {
  const s = get(open ? 'b' : 'a');
  drawGrossStamp(c, s.img, cx, cy, FX, FY, zoom, f, jolt, box => {
    // (the whitehead throbbing)
    const p = 0.5 + 0.5 * Math.sin(f * 0.25);
    box(194, 146, 4, 3, p > 0.6 ? '#FFFFFF' : '#FFF4C8');
    // (slime off the jaw, a drop at a time)
    for (const [x, y, ph] of [[60, 176, 0], [150, 178, 21], [240, 172, 44]] as const) {
      const t = ((f + ph) % 64) / 64;
      if (t < 0.45) { box(x, y, 2, 4 + t * 10, '#A8E03A'); continue; }
      const d = (t - 0.45) / 0.55;
      box(x, y + d * d * 30, 2, 3, '#A8E03A'); box(x, y + d * d * 30, 1, 1, '#EAFFB0');
    }
    // (mom's eye drifting, looking at nothing)
    const dx = Math.round(Math.sin(f * 0.03) * 2);
    box(112 + dx, 40, 3, 3, '#16063A');
    // (the headset's light)
    if (Math.floor(f / 20) % 2) box(242, 176, 4, 2, '#22D3EE');
  });
};
export const drawKidGrossBack = (c: Ctx, W: number, H: number) => grossBackdrop(c, W, H, ['#04061A', '#080E2A', '#121A40', '#1C2854', '#2A3868']);
export const warmKidGross = () => get.warm();

