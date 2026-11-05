// ZARBLAX'S GROSS-UP (the standing rule: anyone singled out gets the Ren & Stimpy gross-up: grossKit.ts), for the
// abduction's cockpit shot (shots.ts shotWife): Zorblax's widow, his wife and his sister, at the controls of her
// standby saucer at closing time. Three-quarters on, too close, filling the dome: her people's cinder-block jaw jutting
// out past everything, the under-bite's pegs up over the lip (yellow, nicotine-brown at the roots, one gold), the
// lipstick slathered on past the lines and onto the pegs, the cigarette in the corner of the slot (its paper ringed in
// lipstick, the ash long and bent); rouge in two hot circles; a wart on the chin with three hairs out of it, chin
// whiskers; the tiny cranium perched up on the back in pink and blue curlers under a hairnet, the big pink bow; her ONE
// big eye (the one her boy got), caked in blue shadow up to the curlers, false lashes, mascara run, a purple iris
// drifting; the penciled-on brow way up high; the neck's rolls, pearls sunk in them; the quilted pink housecoat; a
// gold hoop through the jaw's back; pores, blackheads, slime over all of it, catching the dome's light.
// Two mouths: 'a' the slot shut on the cigarette, 'b' hanging open (talking: the cigarette stuck to the lower lip,
// dangling). Live over it (drawZarblaxGross): the ember, the eye's drift and a slow blink. Painted a step at a time
// ahead (warmZarblaxGross, from the garage part of the abduction): nothing paints itself the frame the shot cuts in.

import {
  type Ctx, type Buf, GW, R, hexU, newBuf, setSeed, rnd, matAt, ball, tint, poly, seg, path, plot, eyeball, skinPost, stubble, bead, vein, inkEdges, stamps, drawGrossStamp, bay, teeth,
  TOOTH, TOOTH_B, MOUTH, GUM, TONGUE, GOLD, M_SKIN, M_HAIR, M_MOUTH, M_OTHER, M_METAL, M_CLOTH,
} from '../grossKit';

/** The buffer's point that goes where the shot puts her (her middle). */
export const ZX = 136, ZY = 112;
const HIDE = R('#E8F2BE', '#C8DA98', '#A8C27A', '#8AA860', '#6E8E4A', '#527236', '#385424', '#203214', '#0C1606');
const LIP = R('#FFC8D6', '#FF8AAE', '#F4467C', '#D2245C', '#A41444', '#700C2E', '#360412');
const CURLER = R('#E0EEFF', '#A8CCFF', '#6A9CF4', '#3A6CD4', '#1E4294', '#0A1A44');
const CURLER_P = R('#FFE0F0', '#FFA8D4', '#F472B6', '#D63A8E', '#9A1A5E', '#4A0628');
const BOW = R('#FFD0EA', '#FF9ACD', '#F25BAA', '#D02E86', '#981A62', '#4A0830');
const COAT = R('#FFE4F0', '#FCC0DC', '#F49AC6', '#E070AA', '#BC4A88', '#86285E', '#480C30');
const PEARL = R('#FFFFFF', '#F8F4EC', '#E8E0D2', '#C8BEAE', '#988C7C', '#4A4238');
const HAIR = R('#B89870', '#8C6C48', '#664A30', '#46301E', '#2A1A10', '#120804');
const PURPLE = R('#EAD8FF', '#BC94F6', '#8C5ADC', '#6230AE', '#3A1478', '#18063C');
const SHADOW = R('#B8CCFF', '#86A0F6', '#5E7CE4', '#3E5EDA', '#2C42A8', '#141E5A');
const ROUGE = hexU('#F0507A');
const WART = R('#DCE2A0', '#BCC87C', '#909E54', '#6E7C3C', '#4C5A2A', '#2A3214');
const PAPER = R('#FFFFFF', '#F4F2EE', '#DCD8D0', '#B8B2A8', '#6A645C');
const ASH = R('#D8D8DC', '#B4B4BA', '#8E8E96', '#68686E', '#3A3A40');
const HVEIN = R('#D8B4F4', '#B48AD8', '#9A72B8', '#7A54A0', '#5B3A78', '#22142E');
const SLIME = hexU('#B4E44A'), SLIME_L = hexU('#F0FFC0'), SLIME_D = hexU('#5E8A18');
const HAIRLINE = hexU('#0A0604'), WHISKER = hexU('#26301A');

type Key = 'a' | 'b';
function* build(key: Key): Generator<void, Buf> {
  setSeed(5150);
  const open = key === 'b';
  const b = newBuf();
  yield;
  // ---- the housecoat at the bottom: quilted pink, its collar turned up round the neck, the lapels' V
  poly(b, [0, 168, 70, 160, 150, 170, 230, 158, 272, 166, 272, 204, 0, 204], COAT, M_CLOTH, { tilt: 0.25 });
  for (let k = -6; k < 12; k++) { path(b, [k * 26, 204, k * 26 + 40, 164], COAT[4], 1, undefined, M_CLOTH); path(b, [k * 26 + 40, 204, k * 26, 164], COAT[4], 1, undefined, M_CLOTH); }
  for (let k = -6; k < 12; k++) for (let j = 0; j < 3; j++) { const x = k * 26 + 20, y = 176 + j * 13; if (matAt(b, x, y) === M_CLOTH) { plot(b, x, y, COAT[1]); plot(b, x + 1, y, COAT[0]); } }
  poly(b, [60, 162, 120, 172, 146, 204, 118, 204, 96, 180, 52, 172], COAT.slice(0, 5).concat(COAT[6]), M_CLOTH, { tilt: 0.1 });
  poly(b, [176, 172, 236, 156, 248, 166, 206, 182, 178, 204, 158, 204], COAT.slice(1), M_CLOTH, { tilt: -0.2 });
  // (a lipstick-smeared tissue poking out of a pocket, ash down the front)
  ball(b, 228, 196, 10, 7, PAPER, { mat: M_CLOTH, line: true }); tint(b, 226, 194, 4, 3, LIP[3], 0.6);
  for (let k = 0; k < 30; k++) { const x = 160 + rnd() * 70, y = 176 + rnd() * 26; if (matAt(b, x, y) === M_CLOTH) plot(b, x, y, ASH[k % 3 + 1]); }
  yield;
  // ---- the neck: thick, rolled, the pearls sunk into the creases
  poly(b, [62, 138, 232, 130, 240, 176, 56, 178], HIDE.slice(3), M_SKIN, { tilt: 0.55 });
  for (let k = 0; k < 3; k++) for (let x = 62; x < 238; x++) { const y = Math.round(150 + k * 8 + Math.sin(x * 0.045 + k) * 2); plot(b, x, y, HIDE[7], undefined, M_SKIN); plot(b, x, y - 1, HIDE[5], undefined, M_SKIN); plot(b, x, y + 1, HIDE[2], undefined, M_SKIN); }
  vein(b, [88, 176, 92, 162, 86, 148], HVEIN, 2);
  for (let k = 0; k < 17; k++) { const x = 66 + k * 10.5, y = 166 + Math.sin(x * 0.045 + 1) * 2 + Math.sin((k / 16) * Math.PI) * 5; ball(b, x, y, 4.6, 4.2, PEARL, { mat: M_METAL, line: true, lw: 0.8 }); }
  yield;
  // ---- the jaw: the block, out past the frame's middle, the under-bite's chin jutting out past the mouth
  poly(b, [24, 80, 222, 68, 258, 94, 266, 134, 250, 164, 56, 168, 22, 130], HIDE, M_SKIN, { tilt: 0.45 });
  ball(b, 146, 118, 124, 48, HIDE, { mat: M_SKIN, soft: 0.35 });
  ball(b, 238, 146, 30, 22, HIDE, { mat: M_SKIN, line: (_dx, dy) => dy > 0.3, lit: 1.05 });
  path(b, [24, 108, 28, 134, 22, 156], HIDE[7], 1); path(b, [25, 108, 29, 134], HIDE[5], 1);
  // (the rouge: two hot circles, slapped on, nowhere near where cheeks would be)
  tint(b, 196, 106, 18, 11, ROUGE, 0.5, M_SKIN, 0.55); tint(b, 80, 110, 14, 9, ROUGE, 0.42, M_SKIN, 0.55);
  yield;
  // ---- the mouth: the slot across the block; open, the black of it, the gums, nicotine teeth, the tongue
  const mx0 = 52, mx1 = 236, my = 130, mh = open ? 22 : 3;
  const top = (x: number) => my - 2 + Math.sin(((x - mx0) / (mx1 - mx0)) * Math.PI) * -4;
  const bot = (x: number) => my + mh + Math.sin(((x - mx0) / (mx1 - mx0)) * Math.PI) * (open ? 7 : 1.5);
  for (let x = mx0; x <= mx1; x++) for (let y = Math.round(top(x)); y <= bot(x); y++) {
    const d = (y - top(x)) / Math.max(1, bot(x) - top(x));
    plot(b, x, y, MOUTH[d < 0.15 ? 2 : d < 0.5 ? 3 : 4 + (bay(x, y) < 0.5 ? 0 : 1)], M_MOUTH);
  }
  if (open) {
    for (let x = mx0 + 4; x < mx1 - 4; x++) { const t = Math.round(top(x)); for (let y = t; y < t + 5; y++) if (matAt(b, x, y) === M_MOUTH) plot(b, x, y, GUM[y - t < 1 ? 4 : y - t < 3 ? 1 : 2], M_OTHER); }
    teeth(b, mx0 + 26, mx1 - 26, x => top(x) + 5, 1, 7, { tw: 11, gaps: [3, 9], rot: [1, 5, 8, 11], gold: [6] });
    ball(b, 146, my + mh - 3, 46, 12, TONGUE, { mat: M_MOUTH, line: (_dx, dy) => dy < 0, only: (x, y) => matAt(b, x, y) === M_MOUTH });
    seg(b, 146, my + mh - 12, 146, my + mh + 1, TONGUE[4], 1, undefined, M_MOUTH);
    for (const sx of [86, 128, 176, 204]) for (let y = Math.round(top(sx) + 6); y < bot(sx) - 6; y++) if (bay(sx, y) < 0.7) plot(b, sx + Math.round(Math.sin(y * 0.3) * 1.5), y, hexU('#E8F4D8'));
  }
  yield;
  // (the upper lip: thin, and the lipstick on it anyway, up past the line in a cupid's bow she drew on)
  for (let x = mx0 - 4; x <= mx1 + 4; x++) { const t = Math.round(top(x)); for (let d = 1; d <= 7; d++) plot(b, x, t - d, d === 7 ? LIP[6] : d > 4 ? LIP[bay(x, t - d) < 0.5 ? 3 : 4] : LIP[d < 2 ? 5 : 2], M_OTHER); }
  for (let x = 120; x < 170; x++) { const t = Math.round(top(x)) - 7 - Math.round(Math.abs(Math.sin(((x - 120) / 50) * Math.PI * 2)) * 4); for (let y = t; y < t + 3; y++) if (bay(x, y) < 0.8) plot(b, x, y, LIP[y === t ? 6 : 3], M_OTHER); }
  // (the lower lip: fat, caked, cracked, the lipstick smeared off the corner, out down the chin)
  const ly = (x: number) => bot(x) + 1;
  for (let x = mx0 - 8; x <= mx1 + 8; x++) {
    const th = 10 + Math.sin(((x - mx0) / (mx1 - mx0)) * Math.PI) * 6, y0 = ly(Math.max(mx0, Math.min(mx1, x)));
    for (let d = 0; d < th; d++) { const u = d / th; plot(b, x, y0 + d - 2, LIP[d >= th - 1 ? 6 : u < 0.2 ? (bay(x, y0 + d) < 0.5 ? 0 : 1) : u < 0.45 ? 2 : u < 0.75 ? 3 : 4], M_OTHER); }
    if (rnd() < 0.09) seg(b, x, y0 + 1 + rnd() * 3, x + (rnd() - 0.5) * 3, y0 + th * (0.4 + rnd() * 0.4), LIP[5], 1);
  }
  for (let k = 0; k < 240; k++) { const t = rnd(), x = mx0 - 2 - t * 22 + (rnd() - 0.5) * 8, y = ly(mx0) + t * 20 + (rnd() - 0.5) * 6; if (matAt(b, x, y) === M_SKIN && rnd() > t * 0.7) plot(b, x, y, LIP[t < 0.4 ? 3 : bay(x, y) < 0.5 ? 2 : 4]); }
  yield;
  // ---- the under-bite's pegs: up out behind the lower lip over the top one; yellow, brown at the roots, lipstick on
  // the front two, one gold
  for (let k = 0; k < 9; k++) {
    if (k === 5) continue;
    const x = 64 + k * 20 + (k % 2) * 3, root = ly(x) + 2, h = 17 + ((k * 7) % 4) * 4 + (k === 2 ? 5 : 0), tp = root - h, w = 11 - (k % 2) * 2;
    poly(b, [x, tp + 3, x + w * 0.5, tp - 1, x + w, tp + 4, x + w + 1, root, x - 1, root], k === 6 ? GOLD : k % 3 === 1 ? TOOTH_B : TOOTH, M_OTHER, { tilt: 0.25 });
    for (let y = root - 10; y < root; y++) for (let xx = x; xx < x + w; xx++) if (matAt(b, xx, y) === M_OTHER && bay(xx, y) < (y - root + 10) / 10) plot(b, xx, y, TOOTH_B[(xx + y) % 2 ? 3 : 4]);
    if (k === 3 || k === 4) for (let n = 0; n < 20; n++) { const xx = x + 1 + rnd() * (w - 2), yy = tp + 4 + rnd() * 7; if (matAt(b, xx, yy) === M_OTHER) plot(b, xx, yy, LIP[2 + (n % 2)]); }
    if (k % 3 === 0) path(b, [x + 4, tp + 6, x + 5, tp + 12], TOOTH_B[4], 1);
  }
  yield;
  // ---- the cigarette: in the corner of the slot, out to the right (shut), or stuck to the lower lip dangling (open)
  {
    const cx0 = 232, cy0 = open ? ly(232) + 2 : top(232) + 1, ang = open ? 0.7 : -0.12, L = open ? 30 : 24;
    const ex = cx0 + Math.cos(ang) * L, ey = cy0 + Math.sin(ang) * L;
    for (let d = -3; d <= 3; d++) seg(b, cx0, cy0 + d, ex, ey + d, PAPER[Math.abs(d) === 3 ? 4 : d < -1 ? 0 : d < 1 ? 1 : 2], 1, M_OTHER);
    for (let d = -3; d <= 3; d++) seg(b, cx0, cy0 + d, cx0 + Math.cos(ang) * 6, cy0 + Math.sin(ang) * 6 + d, LIP[Math.abs(d) === 3 ? 6 : 3], 1, M_OTHER);
    for (let d = -3; d <= 3; d++) seg(b, cx0 + Math.cos(ang) * 6, cy0 + Math.sin(ang) * 6 + d, cx0 + Math.cos(ang) * 11, cy0 + Math.sin(ang) * 11 + d, hexU(Math.abs(d) === 3 ? '#5A3A10' : '#D49A3A'), 1, M_OTHER);
    // (the ash: long, bent down at the end, grey going to white)
    const ax = ex + Math.cos(ang + 0.25) * 12, ay = ey + Math.sin(ang + 0.25) * 12;
    for (let d = -3; d <= 3; d++) { seg(b, ex, ey + d, ax, ay + d, ASH[Math.abs(d) === 3 ? 4 : d < 0 ? 1 : 2], 1, M_OTHER); }
    for (let k = 0; k < 20; k++) plot(b, ex + rnd() * (ax - ex), ey - 2 + rnd() * 5, ASH[rnd() < 0.5 ? 0 : 3]);
  }
  yield;
  // ---- the cranium: tiny, up on the back of the block; the hair set in curlers under a hairnet, the bow
  ball(b, 70, 46, 46, 28, HAIR, { mat: M_HAIR, line: true });
  const curls: [number, number, number[]][] = [[42, 36, CURLER_P], [64, 26, CURLER], [88, 28, CURLER_P], [48, 56, CURLER], [74, 50, CURLER_P], [100, 42, CURLER]];
  for (const [x, y, r] of curls) {
    ball(b, x, y, 12, 10, r, { mat: M_METAL, line: true, lw: 1.2 });
    for (let k = -2; k <= 2; k++) seg(b, x + k * 4, y - 9, x + k * 4, y + 9, r[4], 1, undefined, M_METAL);
    seg(b, x - 12, y, x + 12, y, hexU('#E4E4EA'), 1, undefined, M_METAL);
  }
  for (let k = 0; k < 11; k++) path(b, [26 + k * 9, 20 + (k % 2) * 6, 34 + k * 9, 66 - (k % 3) * 4], hexU('#9A8AA4'), 1, undefined, M_METAL);
  for (let k = 0; k < 6; k++) path(b, [26, 24 + k * 7, 114, 20 + k * 7], hexU('#7A6A84'), 1, undefined, M_METAL);
  // (the bow: big, pink, on the back of it)
  ball(b, 26, 46, 14, 11, BOW, { mat: M_CLOTH, line: true, lw: 1.3 });
  ball(b, 26, 70, 12, 10, BOW, { mat: M_CLOTH, line: true, lw: 1.3 });
  ball(b, 33, 58, 7, 7, BOW.slice(1), { mat: M_CLOTH, line: true });
  for (const [x, y] of [[20, 42], [22, 66]] as const) path(b, [x, y, x + 8, y + 4], BOW[4], 1);
  yield;
  // ---- the face's front: the brow ridge, the big eye on it, caked in blue up to the curlers
  ball(b, 128, 64, 42, 30, HIDE, { mat: M_SKIN, line: (dx, dy) => dy < 0.2 || dx < -0.7 });
  vein(b, [154, 40, 160, 52, 156, 62], HVEIN, 2); vein(b, [98, 48, 92, 60], HVEIN, 2);
  ball(b, 132, 62, 24, 18, SHADOW, { mat: M_OTHER, soft: 0.45 });
  for (let k = 0; k < 90; k++) { const a = rnd() * Math.PI * 2, r = 18 + rnd() * 7; const x = 132 + Math.cos(a) * r * 1.25, y = 62 + Math.sin(a) * r * 0.9; if (matAt(b, x, y) === M_SKIN) plot(b, x, y, SHADOW[2 + (k % 3)]); }
  eyeball(b, 133, 66, { rx: 16, ry: 12, iris: PURPLE, ir: 5.5, idx: 3, idy: 1, pr: 2.4, veins: 12, lid: SHADOW, top: (x) => 59 + ((x - 133) / 16) ** 2 * 3 });
  // (the lid's crease, the false lashes up off it and under it, the mascara run down in streaks)
  for (let x = 118; x <= 148; x++) { const y = Math.round(59 + ((x - 133) / 16) ** 2 * 3); plot(b, x, y, HAIRLINE); plot(b, x, y - 1, HAIRLINE); }
  for (let k = 0; k < 10; k++) { const x = 119 + k * 3.2, y = 58 + ((x - 133) / 16) ** 2 * 3; path(b, [x, y, x - 2 + k * 0.4, y - 7 - (k % 2) * 2, x - 4 + k * 0.8, y - 10 - (k % 2) * 2], HAIRLINE, 1); }
  for (let k = 0; k < 7; k++) { const x = 122 + k * 4, y = 78 - Math.abs(k - 3) * 0.6; path(b, [x, y, x - 1, y + 4], HAIRLINE, 1); }
  for (let k = 0; k < 3; k++) { let x = 124 + k * 9, y = 79; for (let s = 0; s < 12 + k * 5; s++) { y++; x += (rnd() - 0.5) * 0.8; plot(b, x, y, hexU('#1E1430')); if (s % 3 === 0) plot(b, x + 1, y, hexU('#3A2A5A')); } }
  // (the brow: plucked to nothing and penciled back on, way up, surprised)
  path(b, [110, 40, 124, 30, 144, 28, 158, 34], hexU('#2A1A10'), 2); path(b, [111, 41, 124, 31, 144, 29], hexU('#5A3A20'), 1);
  yield;
  // ---- the nostrils: two wet slits up the front of the block
  for (const [x, y] of [[212, 100], [226, 96]] as const) { poly(b, [x - 4, y + 2, x + 3, y - 3, x + 4, y - 1, x - 2, y + 4], R('#1C2010', '#080A04', '#000000'), M_OTHER, { line: false }); plot(b, x - 2, y, SLIME_L); seg(b, x - 1, y + 3, x - 1, y + 9, SLIME, 2); }
  // ---- the chin: a wart with three hairs out of it, whiskers, the slime off the jaw
  ball(b, 234, 158, 7, 6, WART, { line: true, lw: 0.9, mat: M_OTHER });
  for (let k = 0; k < 4; k++) plot(b, 232 + (k % 2) * 3, 156 + (k >> 1) * 3, WART[3]);
  for (const [dx, a] of [[-2, 1.9], [1, 1.4], [3, 0.9]] as const) path(b, [234 + dx, 163, 234 + dx + Math.cos(a) * 6, 163 + Math.sin(a) * 6, 234 + dx + Math.cos(a) * 10 + 2, 163 + Math.sin(a) * 10], HAIRLINE, 1);
  for (let k = 0; k < 30; k++) { const x = 190 + rnd() * 60, y = 150 + rnd() * 14; if (matAt(b, x, y) === M_SKIN) seg(b, x, y, x + 1 + rnd() * 2, y + 3 + rnd() * 3, WHISKER, 1); }
  // (a mole by the eye, her beauty mark, drawn darker in pencil)
  ball(b, 168, 86, 3, 3, R('#4A3424', '#2A1A10', '#140A04', '#000000'), { mat: M_OTHER });
  // ---- the earring: a big gold hoop through the back of the jaw
  for (let a = 0; a < Math.PI * 2; a += 0.015) { const x = 46 + Math.cos(a) * 13, y = 152 + Math.sin(a) * 17; plot(b, x, y, GOLD[6], M_METAL); plot(b, x + 0.8, y - 0.5, GOLD[a > 3.4 && a < 5.2 ? 0 : 2], M_METAL); plot(b, x + 0.4, y + 0.6, GOLD[4], M_METAL); }
  ball(b, 46, 134, 4, 3, HIDE.slice(4), { mat: M_SKIN, line: true });
  yield;
  // ---- the skin: pores, blackheads, grease shining, beads of sweat, inked; slime over it
  stubble(b, (x, y) => (y > 146 && y < 168 && x > 160 ? 0.5 : 0), hexU('#203010'), 0.25);
  skinPost(b, HIDE[8], (x, y) => (y > 88 && y < 124 && x > 170 ? 0.07 : 0.03), { blackheads: (x, y) => x > 190 || y < 80, shine: 0.12 });
  for (let k = 0; k < 10; k++) { const x = 150 + rnd() * 90, y = 88 + rnd() * 26; if (matAt(b, x, y) === M_SKIN) bead(b, x, y, 1.2 + rnd() * 1.3, HIDE); }
  inkEdges(b, M_SKIN, HIDE[8], [M_OTHER, M_MOUTH, M_METAL, M_HAIR]);
  for (let k = 0; k < 36; k++) { const x = 20 + rnd() * 240, y = 30 + rnd() * 140; if (b.mat[(y | 0) * GW + (x | 0)] === M_SKIN) { plot(b, x, y, SLIME); plot(b, x + 1, y, SLIME_L); if (k % 4 === 0) plot(b, x, y + 1, SLIME_D); } }
  return b;
}

const get = stamps<Key>(build, ['a', 'b']);

/** Her gross-up, one buffer pixel to `zoom * 3` screen pixels (the cockpit shot's 1/3: one art pixel each), her (ZX, ZY)
 *  at (cx, cy); `open` the talking mouth. */
export const drawZarblaxGross = (c: Ctx, cx: number, cy: number, zoom: number, f: number, open: boolean) => {
  const s = get(open ? 'b' : 'a');
  drawGrossStamp(c, s.img, cx, cy, ZX, ZY, zoom, f, 0, box => {
    // (the eye drifting off, at nothing; now and then a slow blink, the caked lid down over it)
    const dx = Math.round(Math.sin(f * 0.025) * 2.5), dy = Math.round(Math.sin(f * 0.04) * 1);
    const blink = (f + 150) % 260 < 8;
    if (blink) {
      for (let y = -12; y <= 12; y++) { const hw = Math.round(17 * Math.sqrt(1 - (y / 13) ** 2)); box(133 - hw, 66 + y, hw * 2, 1, y < 6 ? (y < -6 ? '#86A0F6' : '#5E7CE4') : '#3E5EDA'); }
      box(118, 77, 31, 1, '#0A0604'); for (let k = 0; k < 7; k++) box(121 + k * 4, 78, 1, 4, '#0A0604');
    } else { box(135 + dx, 66 + dy, 3, 3, '#18063C'); box(134 + dx, 65 + dy, 1, 1, '#FFFFFF'); }
    // (the ember: in the corner while it's in her mouth)
    if (!open) { const hot = (f >> 2) % 3; box(255, 123, 2, 6, hot === 0 ? '#FFF4C8' : hot === 1 ? '#FBBF24' : '#F97316'); }
  });
};
/** Where her mouth's corner (the cigarette's tip) is, in the buffer: for the smoke. */
export const ZARBLAX_CIG: [number, number] = [266, 121];
export const warmZarblaxGross = () => get.warm();
