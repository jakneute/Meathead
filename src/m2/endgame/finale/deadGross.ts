// THE DEAD KIDS' GROSS-UPS (the finale's opening; the owner's: "also all the bosses you kill are the children of satan
// and the alien widow, not just the first two bosses. show all their dead bodies as 'gross ups' when they both turn on
// meathead"; the standing rule for anyone singled out: grossKit.ts's Ren & Stimpy close-up). Five cards in a fast run,
// each one dead the way he died, the color gone out of him, flies at him, his name and whose he was along the bottom:
//
//   ZORZARBLAX  (hers; the water park) popped: every boil burst to a crater, the whole face gone down like a punctured
//               bouncy castle, draped in folds; mom's big eye out on its string, the pegs every which way, the tongue out
//   MEHPHISTO   (his; the lazy river) the pretzel: knotted through his brother, the neck wrung like a rag, the one eye
//   BRATHAZAR   (his; the same knot's other end) bulged out of its liner, the tongues lolling; bones out at the kinks
//   GUPPLAX     (hers; the wave pool) burst: the top of the head blown open like a dropped melon, the flaps peeled back,
//               the eyestalks limp down the sides, the whistle he choked on still jammed in his teeth
//   NED         (his; the lot) empty: his own skeleton climbed out of his mouth and left the skin in a heap like a
//               deflated pool toy: the mouth torn into a great slack O, the sockets flat, the hat crushed, the fangs
//
// Four paintings (the brothers share the knot: each one's card is the same painting from his own end), painted once
// each a step at a time in idle moments (warmDeadGross), kept. Live over them: the flies, a drip, a wheeze.

import {
  type Ctx, type Buf, GW, GH, R, hexU, mixU, newBuf, setSeed, rnd, matAt, ball, tint, poly, seg, path, plot, eyeball, skinPost, stubble, vein, hairs, inkEdges, teeth, stamps, drawGrossStamp, grossBackdrop, bay,
  TOOTH, TOOTH_B, MOUTH, TONGUE, BLOOD, SCLERA_Y, SCLERA_R, M_SKIN, M_HAIR, M_MOUTH, M_OTHER, M_METAL, M_CLOTH,
} from '../../grossKit';

export type DeadKid = 'zorz' | 'meh' | 'brat' | 'gup' | 'ned';
type Paint = 'zorz' | 'knot' | 'gup' | 'ned';

/** The color gone out of a ramp (toward a cold gray), its line tone kept. */
const GRAY = hexU('#8E98A6');
const dead = (ramp: number[], k = 0.34) => ramp.map((c, i) => (i === ramp.length - 1 ? mixU(c, GRAY, k * 0.3) : mixU(c, GRAY, k)));
const PUS = R('#FFFFF0', '#FFF4B0', '#F4E27A', '#D8BC3A', '#A88A1C', '#5A4A08');
const MEAT = R('#FFB8B0', '#F08078', '#D04848', '#A82828', '#781414', '#400608');
const BONE = R('#FFFFF4', '#F4EEDC', '#DCD2B8', '#B8AA8A', '#8A7A5C', '#3E3420');
const HOLE = R('#3A1018', '#22080E', '#120408', '#060204', '#000000');
const METAL = R('#FFFFFF', '#D8D8E0', '#A8A8B6', '#6E6E7C', '#3A3A46');
const INKC = hexU('#0A0610');

/** A fat tube along a run of points (round, shaded: the kit's balls strung close): a neck, a body, a gut, a stalk. */
const tube = (b: Buf, pts: [number, number][], r: number, ramp: number[], mat: number, from = 0, to = 1) => {
  const n = pts.length - 1;
  const at = (u: number): [number, number] => {
    const f = Math.max(0, Math.min(n - 1e-6, u * n)), i = Math.floor(f), t = f - i;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)];
    const cr = (a: number, bb: number, c: number, d: number) => 0.5 * (2 * bb + (c - a) * t + (2 * a - 5 * bb + 4 * c - d) * t * t + (3 * bb - a - 3 * c + d) * t * t * t);
    return [cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])];
  };
  const steps = Math.ceil(n * 14 * (to - from));
  for (let k = 0; k <= steps; k++) { const [x, y] = at(from + ((to - from) * k) / steps); ball(b, x, y, r, r, ramp, { mat, line: true, lw: 1.3 }); }
  // (the ink's left inside where the balls overlap: paint the inside over again without it)
  for (let k = 0; k <= steps; k++) { const [x, y] = at(from + ((to - from) * k) / steps); ball(b, x, y, r - 1.4, r - 1.4, ramp, { mat }); }
  return at;
};
/** A burst boil: the red ring, the crater, the pus run down out of it. */
const crater = (b: Buf, x: number, y: number, r: number, run: number) => {
  tint(b, x, y + 1, r * 2, r * 1.7, hexU('#A8484A'), 0.5, M_SKIN, 0.6);
  ball(b, x, y, r, r * 0.8, [MEAT[1], MEAT[2], MEAT[3], MEAT[4], MEAT[5]], { mat: M_OTHER, line: true, lw: 0.9 });
  ball(b, x + 0.5, y + 0.5, r * 0.55, r * 0.45, HOLE, { mat: M_OTHER });
  let px = x - r * 0.3, py = y + r * 0.6;
  for (let s = 0; s < run; s++) { py++; px += (rnd() - 0.5) * 0.7; plot(b, px, py, PUS[s < 2 ? 0 : 2]); plot(b, px + 1, py, PUS[3]); }
  if (run > 3) ball(b, px + 0.5, py + 1, 2, 2.4, PUS, {});
};
/** A bone out through the skin: the shaft, its splintered end, the blood where it's come through. */
const boneOut = (b: Buf, x: number, y: number, a: number, len: number) => {
  ball(b, x, y, 6, 5, [MEAT[2], MEAT[3], MEAT[4], MEAT[5], MEAT[5]], { mat: M_OTHER, line: true, lw: 0.8 });
  const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len, nx = -Math.sin(a) * 2.4, ny = Math.cos(a) * 2.4;
  poly(b, [x - nx, y - ny, ex - nx, ey - ny, ex + Math.cos(a) * 5, ey + Math.sin(a) * 5, ex + nx * 0.4, ey + ny * 0.4, ex + nx, ey + ny, x + nx, y + ny], BONE, M_OTHER, { tilt: 0.3 });
  plot(b, x + Math.cos(a) * 3, y + Math.sin(a) * 3 + 2, BLOOD[2]); plot(b, x + Math.cos(a) * 3, y + Math.sin(a) * 3 + 3, BLOOD[3]);
};
/** A tongue lolling out along a run of points: fat at the root, the groove down it, wet. */
const tongue = (b: Buf, pts: [number, number][], r: number, ramp = TONGUE) => {
  const n = pts.length - 1;
  for (let k = 0; k <= n * 10; k++) {
    const f = Math.min(n - 1e-6, k / 10), i = Math.floor(f), t = f - i, x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t;
    const rr = r * (1 - 0.25 * (k / (n * 10)));
    ball(b, x, y, rr, rr * 0.8, ramp, { mat: M_OTHER, line: true, lw: 1 });
  }
  for (let k = 0; k <= n * 10; k++) {
    const f = Math.min(n - 1e-6, k / 10), i = Math.floor(f), t = f - i, x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t;
    const rr = r * (1 - 0.25 * (k / (n * 10))) - 1.2;
    ball(b, x, y, rr, rr * 0.8, ramp, { mat: M_OTHER });
  }
  for (let i = 0; i < n; i++) seg(b, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], ramp[4], 1);
  const e = pts[n]; plot(b, e[0] - 2, e[1] - 2, hexU('#FFFFFF'));
};
/** A dead eye's X (the lids shut on it: two crossed stitches of ink, a crust at the corner). */
const eyeX = (b: Buf, x: number, y: number, r: number, skin: number[]) => {
  ball(b, x, y, r + 2, r + 1, [skin[4], skin[5], skin[6], skin[7], skin[8] ?? skin[7]], { mat: M_SKIN, soft: 0.4 });
  seg(b, x - r, y - r * 0.7, x + r, y + r * 0.7, INKC, 2); seg(b, x - r, y + r * 0.7, x + r, y - r * 0.7, INKC, 2);
  ball(b, x - r - 1, y + 2, 2.4, 1.8, R('#FFF8D0', '#F0E0A0', '#C8B070', '#806A3A'), { mat: M_OTHER });
};

// ---------------------------------------------------------------------------------------------------------------
// ZORZARBLAX, popped

function* paintZorz(): Generator<void, Buf> {
  setSeed(9911);
  const b = newBuf();
  const HIDE = dead(R('#E2EEB8', '#C0D494', '#A2BE78', '#86A65E', '#6A8C48', '#4E7034', '#345222', '#1C3012', '#0A1404'), 0.3);
  const LIP = dead(R('#FFC0D0', '#FF8AA8', '#F4507A', '#D2305C', '#A81E44', '#741230', '#3A0614'), 0.2);
  const HAIR = R('#9A7A5E', '#6E5038', '#4E3424', '#36221A', '#22140C', '#0E0604');
  const CURL = R('#E0EEFF', '#A8CCFF', '#6A9CF4', '#3A6CD4', '#1E4294', '#0A1A44'), CURL_P = R('#FFE0F0', '#FFA8D4', '#F472B6', '#D63A8E', '#9A1A5E', '#4A0628');
  const PURPLE = R('#E6D0FF', '#B48AF4', '#8452D8', '#5A2AA8', '#341274', '#16063A');
  const SHADOW = dead(R('#A8BCFF', '#7A94F4', '#5A74E0', '#3B5BDB', '#2A40A8', '#141E5A'), 0.2);
  const IRIS_D = R('#FFE8A0', '#E8B838', '#B0801A', '#704C0A', '#3A2404');
  const CHEETO = R('#FFD08A', '#FBA13C', '#F08A1C', '#C8650E', '#8A3E06');
  yield;
  // ---- the puddle of pus he's lying in
  ball(b, 136, 170, 150, 18, [PUS[1], PUS[2], PUS[3], PUS[4], PUS[5]], { mat: M_OTHER, soft: 0.2, flat: 0.5 });
  yield;
  // ---- the face, gone down: a slack sack of hide draped over nothing, wide and low
  poly(b, [4, 172, 10, 132, 38, 106, 80, 88, 128, 78, 178, 82, 224, 96, 258, 122, 268, 172], HIDE, M_SKIN, { tilt: 0.4 });
  ball(b, 132, 132, 128, 48, HIDE, { mat: M_SKIN, soft: 0.25, flat: 0.6 });
  // (what was the cranium: a flat lump on top, caved in the middle)
  ball(b, 112, 82, 58, 22, HIDE, { mat: M_SKIN, line: (_dx, dy) => dy < 0.1, flat: 0.5 });
  ball(b, 118, 80, 22, 8, [HIDE[4], HIDE[5], HIDE[6], HIDE[7], HIDE[7]], { mat: M_SKIN, soft: 0.5 });
  yield;
  // ---- the folds: creases draped down it like a bouncy castle with the fan off (a dark line, a lit one beside it)
  for (let k = 0; k < 15; k++) {
    const x0 = 16 + k * 17 + (k % 3) * 3, y0 = 96 + Math.abs(k - 7) * 3.2;
    const pts = [x0, y0, x0 + 5 - (k % 2) * 9, y0 + 20, x0 - 3 + (k % 3) * 3, y0 + 44, x0 + 4, 172];
    path(b, pts, HIDE[7], 1, undefined, M_SKIN);
    path(b, pts.map((v, i) => (i % 2 ? v : v + 1)), HIDE[5], 1, undefined, M_SKIN);
    path(b, pts.map((v, i) => (i % 2 ? v : v - 1)), HIDE[1], 1, undefined, M_SKIN);
  }
  for (let k = 0; k < 4; k++) for (let x = 14; x < 262; x++) { const y = 150 + k * 6 + Math.sin(x * 0.11 + k * 2) * 2.5; plot(b, x, y, HIDE[7], undefined, M_SKIN); plot(b, x, y - 1, HIDE[2], undefined, M_SKIN); }
  yield;
  // ---- the mouth: a long slack slot, sagged in the middle; the pegs every which way, one with the Cheeto still in it
  const mx0 = 56, mx1 = 222;
  const top = (x: number) => 132 + Math.sin(((x - mx0) / (mx1 - mx0)) * Math.PI) * 7 + (x - mx0) * 0.03;
  const bot = (x: number) => top(x) + 6 + Math.sin(((x - mx0) / (mx1 - mx0)) * Math.PI) * 9;
  for (let x = mx0; x <= mx1; x++) for (let y = Math.round(top(x)); y <= bot(x); y++) plot(b, x, y, MOUTH[(y - top(x)) / (bot(x) - top(x)) < 0.3 ? 3 : 4 + (bay(x, y) < 0.5 ? 0 : 1)], M_MOUTH);
  for (let x = mx0 - 6; x <= mx1 + 6; x++) {
    const xx = Math.max(mx0, Math.min(mx1, x)), y0 = bot(xx), th = 7 + Math.sin(((xx - mx0) / (mx1 - mx0)) * Math.PI) * 4;
    for (let d = 0; d < th; d++) plot(b, x, y0 + d, LIP[d >= th - 1 ? 6 : d < 2 ? 1 : d < 4 ? 2 : 3 + (bay(x, y0 + d) < 0.5 ? 0 : 1)], M_OTHER);
    for (let d = 1; d <= 3; d++) plot(b, x, top(xx) - d, d === 3 ? HIDE[8] : HIDE[6], M_SKIN);
  }
  for (const [x, lean, h, brown] of [[72, -5, 20, false], [96, 3, 26, true], [124, -8, 18, false], [150, 6, 28, false], [176, -3, 22, true], [200, 9, 16, false]] as const) {
    const root = bot(x) + 2, tx = x + lean, ty = root - h;
    poly(b, [x - 5, root, tx - 4, ty + 3, tx + 1, ty - 1, tx + 6, ty + 4, x + 6, root], brown ? TOOTH_B : TOOTH, M_OTHER, { tilt: 0.25 });
    path(b, [x, root - 2, tx + 1, ty + 6], TOOTH_B[4], 1, undefined, M_OTHER);
  }
  poly(b, [154, bot(154) - 22, 168, bot(154) - 26, 170, bot(154) - 12, 158, bot(154) - 8], CHEETO, M_OTHER);
  // (the tongue, out over the lip and off down the front of him)
  tongue(b, [[116, bot(116) - 2], [112, bot(116) + 10], [102, bot(116) + 18], [86, bot(116) + 20]], 9, dead(TONGUE, 0.25));
  yield;
  // ---- dad's two eyes: one rolled up white under its lid, one shut for good
  eyeball(b, 150, 110, { rx: 13, ry: 11, sclera: SCLERA_Y, iris: IRIS_D, ir: 4.5, idx: 1, idy: -9, pr: 1.6, veins: 20, lid: HIDE, top: x => 104 + (x - 150) * 0.1, bot: x => 119 - ((x - 150) / 13) ** 2 * 3 });
  eyeX(b, 196, 114, 8, HIDE);
  // ---- mom's big one: out of its socket on the dome, hanging down the cheek on its string, looking at nothing
  ball(b, 96, 82, 20, 12, SHADOW, { mat: M_OTHER, soft: 0.3, flat: 0.6 });
  ball(b, 96, 83, 13, 7, HOLE, { mat: M_OTHER });
  vein(b, [98, 84, 80, 94, 58, 96, 44, 108], R('#F4B0C0', '#E08A9A', '#C8607A', '#A0405A', '#70203A', '#30081A'), 3);
  eyeball(b, 38, 122, { rx: 18, ry: 16, iris: PURPLE, ir: 7, idx: -6, idy: 7, pr: 4.4, veins: 30 });
  for (let k = 0; k < 8; k++) { const a = -2.6 + k * 0.26; path(b, [38 + Math.cos(a) * 17, 122 + Math.sin(a) * 15, 38 + Math.cos(a) * 24, 122 + Math.sin(a) * 22 + (k % 2) * 2], INKC, 1); }
  yield;
  // ---- the snout: flat, a wet smear of a nose with two holes
  ball(b, 226, 116, 20, 9, HIDE, { mat: M_SKIN, line: (_dx, dy) => dy > 0.3, flat: 0.5 });
  for (const x of [219, 233]) ball(b, x, 118, 4.4, 2.4, HOLE, { mat: M_OTHER });
  // ---- every boil burst: craters, red-ringed, the pus run down out of each
  for (const [x, y, r, run] of [[58, 112, 7, 12], [178, 96, 6, 9], [236, 138, 7, 10], [128, 100, 5, 7], [30, 150, 6, 8], [206, 152, 5, 6], [84, 150, 4, 5], [252, 110, 4, 6], [150, 86, 4, 4]] as const) crater(b, x, y, r, run);
  // (the one hole that did it: a split in the side of him, its flap up, the air still coming out)
  poly(b, [14, 124, 22, 118, 30, 126, 24, 134, 16, 132], HOLE, M_OTHER);
  poly(b, [22, 118, 34, 110, 30, 126], [HIDE[1], HIDE[2], HIDE[4], HIDE[8]], M_SKIN);
  yield;
  // ---- mom's curlers, come loose with the last of his hair; the mustache he was trying
  for (let k = 0; k < 40; k++) { const x0 = 70 + rnd() * 80, y0 = 64 + rnd() * 10; seg(b, x0, y0, x0 - 20 - rnd() * 24, y0 + 6 + rnd() * 10, HAIR[k % 5 === 0 ? 0 : 2 + (k % 2)], 1, M_HAIR); }
  for (const [x, y, r] of [[50, 74, CURL], [176, 62, CURL_P], [200, 74, CURL]] as [number, number, number[]][]) {
    ball(b, x, y, 12, 9, dead(r, 0.15), { mat: M_METAL, line: true, lw: 1.2 });
    for (let k = -2; k <= 2; k++) seg(b, x + k * 4, y - 8, x + k * 4, y + 8, r[4], 1, undefined, M_METAL);
  }
  for (let k = 0; k < 40; k++) { const x = 80 + rnd() * 130, t = top(x); seg(b, x, t - 4, x + 2 + rnd() * 2, t - 9 - rnd() * 4, hexU(k % 4 ? '#1E2412' : '#3A4424'), 1, M_HAIR); }
  yield;
  stubble(b, (x, y) => (y > 140 && y < 170 ? 0.6 : 0), hexU('#1E3010'), 0.3);
  skinPost(b, HIDE[8], (_x, y) => (y < 110 ? 0.05 : 0.03), { blackheads: (_x, y) => y < 112, shine: 0.05 });
  inkEdges(b, M_SKIN, HIDE[8], [M_OTHER, M_MOUTH, M_METAL, M_HAIR]);
  // (pus spattered all over him)
  for (let k = 0; k < 70; k++) { const x = 10 + rnd() * 250, y = 80 + rnd() * 90; if (matAt(b, x, y) === M_SKIN) { plot(b, x, y, PUS[1]); plot(b, x + 1, y, PUS[2]); if (k % 3 === 0) plot(b, x, y + 1, PUS[3]); } }
  return b;
}

// ---------------------------------------------------------------------------------------------------------------
// MEHPHISTO and BRATHAZAR, the pretzel

const MEH_AT: [number, number] = [50, 100], BRAT_AT: [number, number] = [222, 98];
function* paintKnot(): Generator<void, Buf> {
  setSeed(6662);
  const b = newBuf();
  const LAV = dead(R('#F4EEF6', '#DCD2E2', '#C4B6CE', '#AA9AB8', '#8E7CA0', '#705E84', '#524266', '#342648', '#180E24'), 0.2);
  const COAT = R('#5A5462', '#3A3442', '#26222C', '#18151E', '#0E0C12', '#040306');
  const RED = dead(R('#FFB4A0', '#F47A64', '#DC4A3A', '#B82A22', '#901818', '#680E10', '#44080A', '#280406', '#100102'), 0.22);
  const JACKET = R('#6A5A50', '#4A3C34', '#30261E', '#1E1610', '#0E0A06', '#040200');
  const BLACK = R('#5A5068', '#3A3048', '#241C30', '#16101E', '#0C0812', '#040206');
  const SPIKE = R('#E8FF90', '#B8F040', '#84CC16', '#5A9A0C', '#366406', '#143002');
  const HORN = R('#FFF8EC', '#EADCC4', '#CDBA98', '#A8946E', '#7A6646', '#3A2C18');
  const LINER = R('#4A3A5A', '#2A1E36', '#180E22', '#0A0410', '#000000');
  const IRIS_R = R('#FF8A7A', '#E8402E', '#B8181C', '#7A0A10', '#3A0206'), IRIS_Y = R('#FFF6A0', '#F4E040', '#D8B414', '#A07A08', '#5A3A02');
  const LIPS = R('#5A5066', '#38303E', '#221C28', '#141018', '#060408');
  const GUT = R('#FFE0EC', '#FCA8C8', '#F472B6', '#D0408A', '#9A1E5E', '#4A0628');
  yield;
  // ---- the blood they're lying in
  ball(b, 136, 168, 140, 14, [BLOOD[2], BLOOD[3], BLOOD[4], BLOOD[5], BLOOD[5]], { mat: M_OTHER, soft: 0.2, flat: 0.5 });
  yield;
  // ---- the knot: his long body in the black coat, his brother's red one in the studded jacket, round and through
  // each other; each one's neck wrung out to his head at his own end
  const A: [number, number][] = [[78, 108], [100, 68], [146, 54], [186, 78], [176, 124], [136, 144], [104, 124], [118, 92], [150, 94]];
  const B: [number, number][] = [[196, 106], [182, 148], [132, 160], [88, 142], [92, 98], [130, 76], [164, 92], [156, 122], [128, 120]];
  tube(b, A, 14, COAT, M_CLOTH);
  yield;
  const atB = tube(b, B, 14, [RED[2], RED[3], RED[4], RED[5], RED[6], RED[8]], M_OTHER);
  yield;
  const atA = tube(b, A, 14, COAT, M_CLOTH, 0.3, 0.5);
  tube(b, A, 14, COAT, M_CLOTH, 0.72, 0.86);
  yield;
  // (the coat's cracked leather, its burn holes with the lavender through them; the jacket's studs down the red one)
  for (let k = 0; k < 9; k++) { const [x, y] = atA(0.3 + (k % 4) * 0.05); path(b, [x - 6 + k, y - 5, x + 2 + k, y - 1 + (k % 3)], COAT[0], 1, undefined, M_CLOTH); }
  for (const u of [0.36, 0.44]) { const [x, y] = atA(u); ball(b, x + 2, y - 3, 4.4, 3.4, [LAV[2], LAV[4], LAV[6], LAV[8]], { mat: M_SKIN, line: true, lw: 0.7 }); }
  for (let k = 0; k < 9; k++) { const [x, y] = atB(0.05 + k * 0.058); ball(b, x - 4, y - 5, 2.2, 2.2, METAL, { mat: M_METAL, line: true, lw: 0.6 }); }
  // (torn to the meat where it's pulled tight; bones out at the kinks)
  for (const [u, s] of [[0.22, 1], [0.33, -1]] as const) { const [x, y] = atB(u); ball(b, x, y + 4 * s, 7, 4.4, MEAT, { mat: M_OTHER, line: true, lw: 0.8 }); path(b, [x - 5, y + 4 * s, x + 5, y + 4 * s + 1], MEAT[0], 1); }
  boneOut(b, 104, 62, -2.0, 15); boneOut(b, 190, 82, -0.5, 14); boneOut(b, 86, 146, 2.5, 13); boneOut(b, 180, 150, 0.7, 12);
  yield;
  // (the guts, looped out through the middle of it where it's tied)
  tube(b, [[124, 104], [136, 96], [148, 106], [140, 118], [128, 112], [134, 102], [146, 98]], 4.6, GUT, M_OTHER);
  // (a platform boot out of it the wrong way round; the two tails tied in a bow)
  poly(b, [150, 30, 172, 28, 174, 50, 152, 52], BLACK, M_CLOTH); poly(b, [146, 22, 176, 20, 176, 30, 146, 32], [BLACK[0], BLACK[2], BLACK[4], BLACK[5]], M_CLOTH);
  for (let k = 0; k < 3; k++) seg(b, 156, 36 + k * 5, 168, 35 + k * 5, METAL[1], 1);
  for (const [dx, col] of [[-1, RED], [1, LAV]] as const) { tube(b, [[136, 150], [136 + dx * 14, 160], [136 + dx * 20, 150], [136 + dx * 10, 146]], 3, [col[3], col[4], col[5], col[6], col[8]], M_OTHER); poly(b, [136 + dx * 10, 146, 136 + dx * 4, 138, 136 + dx * 14, 140], [col[4], col[5], col[8]], M_OTHER); }
  yield;

  // ---- MEHPHISTO's head, at his end: the neck wrung like a rag, the long gaunt face slack
  {
    const [hx, hy] = MEH_AT;
    tube(b, [[80, 110], [72, 106], [62, 108]], 9, [LAV[3], LAV[4], LAV[5], LAV[6], LAV[8]], M_SKIN);
    for (let k = 0; k < 4; k++) path(b, [64 + k * 5, 100, 68 + k * 5, 108, 64 + k * 5, 116], LAV[7], 1, undefined, M_SKIN);
    ball(b, hx, hy, 32, 44, LAV, { mat: M_SKIN, line: true, lw: 1.2 });
    ball(b, hx + 4, hy + 34, 18, 14, LAV, { mat: M_SKIN, line: (_dx, dy) => dy > 0.1 });
    tint(b, hx - 10, hy + 14, 12, 14, LAV[6], 0.5, M_SKIN, 0.7);
    // (the eye, bulged right out of its ring of liner, the red of it pinned; the liner run down the cheek)
    ball(b, hx + 10, hy - 10, 20, 17, LINER, { mat: M_OTHER, soft: 0.3 });
    for (let k = 0; k < 4; k++) { let x = hx + k * 7, y = hy + 4; for (let s = 0; s < 16 + k * 5; s++) { y++; x += (rnd() - 0.5) * 0.9; plot(b, x, y, LINER[2]); } }
    eyeball(b, hx + 12, hy - 12, { rx: 16, ry: 15, sclera: SCLERA_R, iris: IRIS_R, ir: 5, idx: 6, idy: -6, pr: 1.2, veins: 34 });
    // (the hooked nose, the ring through it; the black lipstick; the tongue out to his chin and past it)
    poly(b, [hx - 2, hy - 2, hx + 10, hy + 14, hx + 18, hy + 26, hx + 8, hy + 30, hx - 2, hy + 24], LAV, M_SKIN, { tilt: -0.4 });
    ball(b, hx + 10, hy + 25, 9, 6, LAV, { mat: M_SKIN, line: (_dx, dy) => dy > 0.2 });
    ball(b, hx + 6, hy + 28, 2.6, 1.8, HOLE, { mat: M_OTHER });
    for (let a = 0; a < Math.PI * 1.5; a += 0.08) plot(b, hx + 5 + Math.cos(a) * 4, hy + 32 + Math.sin(a) * 4, METAL[a < 0.8 ? 0 : 2], M_METAL);
    for (let x = hx - 12; x <= hx + 18; x++) { const t = hy + 35 + Math.abs(x - hx - 3) * 0.08; for (let y = t; y < t + 7; y++) plot(b, x, y, MOUTH[y - t < 2 ? 3 : 5], M_MOUTH); for (let d = 1; d <= 3; d++) { plot(b, x, t - d, LIPS[d < 2 ? 4 : 2], M_OTHER); plot(b, x, t + 6 + d, LIPS[d < 2 ? 4 : 1], M_OTHER); } }
    tongue(b, [[hx + 4, hy + 40], [hx + 8, hy + 50], [hx + 18, hy + 56], [hx + 30, hy + 54]], 6, dead(TONGUE, 0.2));
    // (the far eye under the hair; the hair, greasy black, down over half of him; the little horns)
    poly(b, [hx - 34, hy - 20, hx - 20, hy - 46, hx + 10, hy - 50, hx + 30, hy - 36, hx + 12, hy - 32, hx - 2, hy - 28, hx - 8, hy + 2, hx - 16, hy - 6, hx - 20, hy + 26, hx - 30, hy + 10], BLACK, M_HAIR, { tilt: 0.2 });
    for (let k = 0; k < 12; k++) { const x0 = hx - 28 + rnd() * 40, y0 = hy - 44 + rnd() * 14; path(b, [x0, y0, x0 - 3 - rnd() * 5, y0 + 20 + rnd() * 30], BLACK[k % 3 === 0 ? 0 : 4], 1, undefined, M_HAIR); }
    for (const [x, s] of [[hx - 14, 0.7], [hx + 16, 0.9]] as const) poly(b, [x - 6 * s, hy - 40, x - 3 * s, hy - 58 * s - 6, x + 5 * s, hy - 66 * s - 6, x + 7 * s, hy - 40], HORN, M_OTHER, { tilt: 0.3 });
    stubble(b, (x, y) => (x < 80 && y > hy + 40 ? 0.7 : 0), hexU('#2A1E3A'), 0.3);
  }
  yield;
  // ---- BRATHAZAR's, at his: big, square, red; both eyes out on their own, the jaw off its hinge
  {
    const [hx, hy] = BRAT_AT;
    tube(b, [[196, 108], [204, 104], [212, 106]], 10, [RED[3], RED[4], RED[5], RED[6], RED[8]], M_SKIN);
    for (let k = 0; k < 3; k++) path(b, [196 + k * 5, 98, 200 + k * 5, 108, 196 + k * 5, 118], RED[7], 1, undefined, M_SKIN);
    ball(b, hx, hy - 4, 38, 36, RED, { mat: M_SKIN, line: true, lw: 1.2 });
    poly(b, [hx - 30, hy + 8, hx + 34, hy + 4, hx + 38, hy + 34, hx + 22, hy + 50, hx - 20, hy + 52, hx - 34, hy + 36], RED.slice(1), M_SKIN, { tilt: 0.3 });
    // (the eyes: each bulged out its own way, yellow, pinned; the brow ridge still mad about it)
    eyeball(b, hx - 14, hy - 8, { rx: 15, ry: 14, sclera: SCLERA_Y, iris: IRIS_Y, ir: 4.6, idx: -7, idy: 5, pr: 1.2, veins: 30 });
    eyeball(b, hx + 18, hy - 12, { rx: 12, ry: 12, sclera: SCLERA_Y, iris: IRIS_Y, ir: 4, idx: 5, idy: -6, pr: 1.2, veins: 24 });
    ball(b, hx + 2, hy - 28, 30, 7, RED, { mat: M_SKIN, line: (_dx, dy) => dy > 0.2, lit: 1.1 });
    // (the snub nose, its ring; the mouth hanging open off its hinge: the fangs, the gold one, the tongue out the side)
    ball(b, hx + 4, hy + 8, 9, 7, RED, { mat: M_SKIN, line: (_dx, dy) => dy > 0.1, lit: 1.1 });
    for (const x of [hx, hx + 8]) ball(b, x, hy + 11, 2.4, 1.8, HOLE, { mat: M_OTHER });
    for (let a = 0.2; a < Math.PI - 0.2; a += 0.08) plot(b, hx + 4 + Math.cos(a) * 5, hy + 13 + Math.sin(a) * 5, METAL[a < 1.2 ? 0 : 2], M_METAL);
    const top = (x: number) => hy + 22 + (x - hx) * 0.12, bot = (x: number) => hy + 42 + (x - hx) * 0.2 - ((x - hx - 2) / 26) ** 2 * 6;
    for (let x = hx - 24; x <= hx + 28; x++) for (let y = Math.round(top(x)); y <= bot(x); y++) plot(b, x, y, MOUTH[y - top(x) < 3 ? 3 : 4 + (bay(x, y) < 0.5 ? 0 : 1)], M_MOUTH);
    teeth(b, hx - 20, hx + 26, top, 1, 7, { tw: 6, long: [1, 6], gold: [3], gaps: [4] });
    teeth(b, hx - 18, hx + 24, bot, -1, 5, { tw: 6, long: [0, 6], rot: [2], gaps: [5] });
    tongue(b, [[hx - 8, hy + 36], [hx - 20, hy + 44], [hx - 34, hy + 48], [hx - 44, hy + 42]], 6.5, dead(TONGUE, 0.2));
    // (the horns, studded; the liberty spikes, wilted, one snapped over)
    for (const [x, dir] of [[hx - 26, -1], [hx + 28, 1]] as const) {
      poly(b, [x - 7, hy - 26, x + dir * 10, hy - 54, x + dir * 20, hy - 60, x + dir * 8, hy - 38, x + 7, hy - 24], HORN, M_OTHER, { tilt: 0.3 });
      for (let k = 0; k < 3; k++) ball(b, x + dir * (3 + k * 5), hy - 34 - k * 8, 2, 2, METAL, { mat: M_METAL, line: true, lw: 0.6 });
    }
    for (let k = 0; k < 5; k++) { const x = hx - 16 + k * 9, lean = (k - 2) * 5 + (k === 3 ? 12 : 0), h = k === 3 ? 12 : 22 + (k % 2) * 6; poly(b, [x - 4, hy - 34, x + lean, hy - 36 - h, x + 5, hy - 34], dead(SPIKE, 0.15), M_HAIR, { tilt: 0.3 }); }
    poly(b, [hx + 12, hy - 46, hx + 34, hy - 44, hx + 14, hy - 40], dead(SPIKE, 0.15), M_HAIR);
    stubble(b, (x, y) => (x > 190 && y > hy + 40 ? 0.7 : 0), hexU('#3A0808'), 0.3);
    void JACKET;
  }
  yield;
  skinPost(b, INKC, () => 0.03, { shine: 0.1 });
  inkEdges(b, M_SKIN, INKC, [M_OTHER, M_MOUTH, M_METAL, M_HAIR]);
  for (let k = 0; k < 50; k++) { const x = 60 + rnd() * 150, y = 50 + rnd() * 110; if (matAt(b, x, y) !== 0) { plot(b, x, y, BLOOD[2]); if (k % 2) plot(b, x, y + 1, BLOOD[3]); } }
  return b;
}

// ---------------------------------------------------------------------------------------------------------------
// GUPPLAX, burst

function* paintGup(): Generator<void, Buf> {
  setSeed(7714);
  const b = newBuf();
  const SKIN = dead(R('#E8FFD8', '#B8F0A0', '#8ADC78', '#62C05A', '#44A04A', '#2E803A', '#1E602C', '#12401E', '#062010'), 0.26);
  const DEEP = dead(R('#9ADC88', '#6AB862', '#4A9448', '#327034', '#1E4E22', '#0E2C12'), 0.26);
  const IRIS = R('#FFF6A0', '#F4E040', '#D8B414', '#A07A08', '#5A3A02');
  const ZINC = R('#FFFFFF', '#F4F6F8', '#DCE2E8', '#B8C2CC', '#8A96A2', '#4A5460');
  const GILL = dead(R('#FF9AA8', '#F06A80', '#D0405A', '#A0243E', '#6A1026', '#300410'), 0.2);
  const WHISTLE = R('#FFF8C0', '#F8E070', '#E8C020', '#B88A10', '#7A5A06', '#3A2802');
  const LANYARD = R('#FFFFFF', '#E8ECF0', '#C8D0D8', '#98A4B0', '#5A6470');
  const BRAIN = R('#FFE0E8', '#F8B0C4', '#E8849E', '#C85A78', '#903450', '#481024');
  const GOO = hexU('#B8F0A0'), GOO_D = hexU('#44A04A');
  yield;
  // ---- bits of him, all over (behind the rest): chunks, strings of it
  for (let k = 0; k < 16; k++) { const x = 8 + rnd() * 256, y = 30 + rnd() * 60; ball(b, x, y, 2.5 + rnd() * 4, 2 + rnd() * 3, k % 3 ? [SKIN[2], SKIN[4], SKIN[6], SKIN[8]] : [MEAT[1], MEAT[2], MEAT[4], MEAT[5]], { mat: M_OTHER, line: true, lw: 0.7 }); }
  yield;
  // ---- the neck and the limp gills
  poly(b, [62, 132, 210, 132, 236, 204, 36, 204], SKIN.slice(2), M_SKIN, { tilt: 0.2 });
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const x = 136 + s * (72 + k * 9), y = 160 + k * 5; poly(b, [x - 5, y - 14, x + 5, y - 14, x + 6 * s + 4, y + 22, x + 6 * s - 4, y + 22], GILL, M_OTHER, { tilt: 0.3 * s }); }
  yield;
  // ---- what's left of the head: the bottom two thirds of it, the top blown off along a ragged line
  const rim = (x: number) => 78 + Math.sin(x * 0.21) * 5 + Math.sin(x * 0.57 + 1) * 4 + ((x - 136) / 110) ** 2 * 16;
  ball(b, 136, 106, 112, 84, SKIN.slice(1), { mat: M_SKIN, line: true, lw: 1.4, lit: 0.92, only: (x, y) => y > rim(x) });
  ball(b, 136, 170, 76, 22, SKIN.slice(2), { mat: M_SKIN, line: (_dx, dy) => dy > 0.3, lit: 0.9 });
  path(b, [76, 164, 136, 174, 196, 164], DEEP[4], 2, undefined, M_SKIN);
  // (the inside of it, open to the sky: the meat round the rim, the dark down the middle, what's left of his brain)
  ball(b, 136, 82, 96, 20, [MEAT[1], MEAT[2], MEAT[3], MEAT[4], MEAT[5]], { mat: M_OTHER, only: (x, y) => y <= rim(x) + 1 && y > rim(x) - 26 + Math.abs(x - 136) * 0.1 });
  ball(b, 136, 80, 70, 11, HOLE, { mat: M_OTHER, only: (x, y) => y <= rim(x) });
  for (const [x, y, r] of [[116, 76, 13], [142, 72, 15], [166, 78, 11]] as const) { ball(b, x, y, r, r * 0.6, BRAIN, { mat: M_OTHER, line: true, lw: 0.8 }); for (let k = 0; k < 3; k++) path(b, [x - r + 3, y - 2 + k * 3, x, y - 4 + k * 3, x + r - 3, y - 1 + k * 3], BRAIN[4], 1, undefined, M_OTHER); }
  yield;
  // (the flaps: the scalp peeled back off it all the way round, red underneath, curling)
  for (const [x, dir, len, w] of [[40, -1, 40, 22], [74, -0.5, 46, 20], [112, -0.15, 50, 20], [154, 0.2, 48, 22], [194, 0.55, 44, 20], [230, 1, 38, 20]] as const) {
    const y0 = rim(x) + 2, tx = x + dir * len * 0.8, ty = y0 - len * (1 - Math.abs(dir) * 0.45);
    poly(b, [x - w / 2, y0, x + w / 2, y0, tx + 4, ty + 6, tx, ty, tx - 5, ty + 8], [SKIN[1], SKIN[2], SKIN[3], SKIN[5], SKIN[8]], M_SKIN, { tilt: dir * 0.4 });
    poly(b, [x - w / 2 + 3, y0, x + w / 2 - 3, y0, tx + 1, ty + 12], [MEAT[2], MEAT[3], MEAT[4], MEAT[5]], M_OTHER, { line: false });
    let px = tx, py = ty + 4; for (let s = 0; s < 10; s++) { py++; px += (rnd() - 0.5) * 0.6; plot(b, px, py, s % 3 ? GOO : GOO_D); }
  }
  yield;
  // ---- the eyestalks: limp, down either side of what's left; one eye hanging on the end of its own, one burst
  tube(b, [[44, 96], [22, 100], [10, 126], [16, 150]], 7, [DEEP[0], DEEP[1], DEEP[2], DEEP[3], DEEP[5]], M_SKIN);
  eyeball(b, 20, 160, { rx: 17, ry: 16, sclera: SCLERA_Y, iris: IRIS, ir: 8, idx: 2, idy: 6, pr: 0, veins: 30 });
  for (let y = -6; y <= 6; y++) plot(b, 22, 166 + y, hexU('#000000'), M_OTHER);
  tube(b, [[228, 96], [250, 98], [262, 118], [258, 138]], 7, [DEEP[0], DEEP[1], DEEP[2], DEEP[3], DEEP[5]], M_SKIN);
  ball(b, 257, 146, 9, 7, MEAT, { mat: M_OTHER, line: true, lw: 0.8 });
  for (let k = 0; k < 7; k++) { const a = 0.3 + k * 0.4; path(b, [257 + Math.cos(a) * 6, 146 + Math.sin(a) * 5, 257 + Math.cos(a) * 15, 146 + Math.sin(a) * 13], k % 2 ? MEAT[2] : hexU('#FFFCE0'), 1); }
  yield;
  // ---- the two little eyes: crossed, pink-rimmed; the fat nose with the zinc still on it, not a mark on it
  for (const ex of [104, 168]) {
    ball(b, ex, 104, 16, 12, DEEP, { mat: M_SKIN, soft: 0.5 });
    eyeball(b, ex, 104, { rx: 12, ry: 9, sclera: SCLERA_Y, iris: IRIS, ir: 4, idx: ex < 136 ? 6 : -6, idy: 3, pr: 1.2, veins: 16, lid: SKIN, top: x => 98 + Math.abs(x - ex) * 0.1, bot: x => 112 - Math.abs(x - ex) * 0.1 });
    for (let a = 0; a < Math.PI * 2; a += 0.08) plot(b, ex + Math.cos(a) * 13, 104 + Math.sin(a) * 10, GILL[2], M_OTHER);
  }
  ball(b, 136, 128, 32, 24, SKIN.slice(1), { mat: M_SKIN, line: (_dx, dy) => dy > -0.2, lit: 1.1 });
  poly(b, [120, 108, 152, 106, 156, 118, 148, 121, 137, 117, 123, 120, 116, 116], ZINC, M_OTHER, { tilt: 0.1 });
  for (const nx of [124, 148]) ball(b, nx, 141, 7, 4.4, HOLE, { mat: M_OTHER });
  yield;
  // ---- the mouth: open on the last of it; the buck teeth, the whistle he choked on jammed in behind them, the tongue
  const mx0 = 84, mx1 = 192, my = 152;
  const top = (x: number) => my - Math.sin(((x - mx0) / (mx1 - mx0)) * Math.PI) * 2;
  const bot = (x: number) => my + 16 + Math.sin(((x - mx0) / (mx1 - mx0)) * Math.PI) * 9;
  for (let x = mx0; x <= mx1; x++) for (let y = Math.round(top(x)); y <= bot(x); y++) plot(b, x, y, MOUTH[y - top(x) < 3 ? 2 : 4], M_MOUTH);
  poly(b, [118, 160, 158, 158, 162, 174, 120, 176], WHISTLE, M_METAL, { line: true, tilt: 0.3 });
  ball(b, 146, 166, 5, 5, [WHISTLE[3], WHISTLE[4], WHISTLE[5], WHISTLE[5]], { mat: M_METAL });
  teeth(b, mx0 + 16, mx1 - 16, top, 1, 10, { gaps: [1, 6], rot: [4], tw: 9, long: [2, 3] });
  for (let x = mx0 - 2; x <= mx1 + 2; x++) { plot(b, x, top(x) - 1, DEEP[4], M_OTHER); plot(b, x, bot(x) + 1, DEEP[4], M_OTHER); plot(b, x, bot(x) + 2, DEEP[2], M_OTHER); }
  path(b, [160, 172, 196, 186, 226, 204], LANYARD[1], 3, M_CLOTH); path(b, [120, 174, 96, 190, 80, 204], LANYARD[2], 3, M_CLOTH);
  tongue(b, [[104, 170], [96, 180], [84, 186], [70, 184]], 7, dead(R('#FFB0C0', '#F07A94', '#C8506A', '#902E48', '#682038', '#4A1020'), 0.2));
  yield;
  skinPost(b, SKIN[8], (x, y) => (Math.abs(x - 136) < 46 && y > 108 && y < 150 ? 0.06 : 0.01), { blackheads: (x, y) => Math.abs(x - 136) < 42 && y > 110 && y < 150, shine: 0.05 });
  inkEdges(b, M_SKIN, SKIN[8], [M_OTHER, M_MOUTH, M_METAL, M_CLOTH]);
  // (pool water and himself, run down what's left of his face)
  for (let k = 0; k < 16; k++) { let x = 50 + rnd() * 170, y = rim(x) + 4; for (let s = 0; s < 8 + rnd() * 26; s++) { y++; x += (rnd() - 0.5) * 0.7; if (matAt(b, x, y) !== M_SKIN) break; plot(b, x, y, k % 3 ? MEAT[3] : GOO); } }
  return b;
}

// ---------------------------------------------------------------------------------------------------------------
// NED, empty

function* paintNed(): Generator<void, Buf> {
  setSeed(4422);
  const b = newBuf();
  const SKIN = dead(R('#F4D4CC', '#E2B0A8', '#CC8E88', '#B2706E', '#965658', '#7A4046', '#5E2C36', '#401C26', '#200A12'), 0.36);
  const HAT = R('#B894E8', '#9670D0', '#7650B4', '#5A3896', '#422474', '#2C1450', '#16082C');
  const HORN = R('#FFF0D8', '#E8D0A8', '#C8AA7C', '#A08458', '#74583A', '#3A2A18');
  const TAPE = R('#E8E8EC', '#C8C8D0', '#A0A0AC', '#7A7A88', '#4A4A56');
  const HAIR = R('#6A5A50', '#4A3C34', '#30261E', '#1E1610', '#0E0A06');
  const IRIS = R('#F4F070', '#D8C830', '#A89418', '#6A5A0A', '#2E2604');
  const FANG = R('#FFFFFF', '#F4F4F4', '#DCDCE0', '#B8B8C0', '#8A8A94', '#4A4A54');
  const GUMS = R('#FF9AB0', '#F0708C', '#D04C6C', '#A8304E', '#701830', '#380810');
  const STAR = R('#FFFDE0', '#FCEB88', '#F2CC44', '#C89A20', '#8A6410');
  const ROBE = R('#9670D0', '#7650B4', '#5A3896', '#422474', '#2C1450', '#16082C');
  yield;
  // ---- the robe, flat on the asphalt with nobody in it
  poly(b, [0, 150, 60, 138, 136, 150, 210, 136, 272, 148, 272, 204, 0, 204], ROBE, M_CLOTH, { tilt: 0.3 });
  for (let k = 0; k < 8; k++) path(b, [10 + k * 34, 150 + (k % 2) * 6, 26 + k * 34, 176, 14 + k * 34, 204], ROBE[k % 2 ? 0 : 4], 1, undefined, M_CLOTH);
  yield;
  // ---- his skin, in a heap like a pool toy with the plug out: the face of it up, nothing behind it
  poly(b, [18, 172, 28, 126, 62, 96, 118, 80, 176, 84, 224, 102, 250, 136, 256, 172], SKIN, M_SKIN, { tilt: 0.5 });
  ball(b, 136, 130, 118, 48, SKIN, { mat: M_SKIN, soft: 0.25, flat: 0.55 });
  for (const [x, y, r] of [[60, 150, 26], [214, 150, 24]] as const) ball(b, x, y, r, r * 0.6, SKIN.slice(1), { mat: M_SKIN, soft: 0.4, flat: 0.6 });
  // (folded over on itself: creases, the lit edge of each fold)
  for (let k = 0; k < 12; k++) {
    const x0 = 30 + k * 20, y0 = 98 + Math.abs(k - 5.5) * 4;
    const pts = [x0, y0, x0 - 4 + (k % 2) * 8, y0 + 22, x0 + 2, y0 + 46, x0 - 3, 172];
    path(b, pts, SKIN[7], 1, undefined, M_SKIN); path(b, pts.map((v, i) => (i % 2 ? v : v - 1)), SKIN[1], 1, undefined, M_SKIN);
  }
  yield;
  // ---- the mouth he came out of: torn into a great slack O, stretched thin at the corners, the dark of nothing in it
  const mcx = 138, mcy = 136;
  ball(b, mcx, mcy, 58, 32, [SKIN[1], SKIN[2], SKIN[3], SKIN[5], SKIN[8]], { mat: M_SKIN, line: true, lw: 1.4, flat: 0.5 });
  ball(b, mcx, mcy, 52, 27, HOLE, { mat: M_MOUTH });
  ball(b, mcx, mcy + 6, 44, 18, [hexU('#000000'), hexU('#000000'), hexU('#060204')], { mat: M_MOUTH });
  // (the tears at the corners, and the stretch marks round it)
  for (const s of [-1, 1]) {
    poly(b, [mcx + s * 50, mcy - 6, mcx + s * 76, mcy - 2, mcx + s * 50, mcy + 8], [MEAT[2], MEAT[3], MEAT[4], MEAT[5]], M_OTHER);
    for (let k = 0; k < 5; k++) { const a = (s > 0 ? 0 : Math.PI) + (k - 2) * 0.26; path(b, [mcx + Math.cos(a) * 60, mcy + Math.sin(a) * 34, mcx + Math.cos(a) * 78, mcy + Math.sin(a) * 46], SKIN[6], 1, undefined, M_SKIN); }
  }
  for (let k = 0; k < 9; k++) { const a = Math.PI + 0.5 + k * 0.27; path(b, [mcx + Math.cos(a) * 59, mcy + Math.sin(a) * 33, mcx + Math.cos(a) * 68, mcy + Math.sin(a) * 41], SKIN[6], 1, undefined, M_SKIN); }
  // (the joke-shop fangs, left behind on the lip; the soul patch, still proud)
  for (let x = 108; x < 170; x++) { const y = mcy + 26 + Math.sin((x - 108) * 0.05) * 2; for (let d = 0; d < 4; d++) plot(b, x, y + d, GUMS[d === 0 ? 1 : d === 3 ? 4 : 2], M_OTHER); }
  for (const fx of [120, 158]) poly(b, [fx - 6, mcy + 26, fx + 6, mcy + 26, fx + 1, mcy + 10], FANG, M_OTHER, { line: true, tilt: 0.2 });
  hairs(b, 14, () => [130 + rnd() * 16, mcy + 34 + rnd() * 4], 10, Math.PI / 2, hexU('#2A1A14'), undefined, 0.3);
  // (the bony footprints out of it, off across his own face)
  for (let k = 0; k < 3; k++) { const x = 190 + k * 20, y = 126 - k * 12; for (let t = 0; t < 4; t++) ball(b, x + t * 3 - 4, y - 5 + Math.abs(t - 1.5), 1.2, 2.4, [MEAT[4], MEAT[5], MEAT[5]], { mat: M_OTHER }); ball(b, x, y + 2, 4, 5, [MEAT[4], MEAT[5], MEAT[5]], { mat: M_OTHER, soft: 0.5 }); }
  yield;
  // ---- the sockets: flat, empty, sagged shut like buttonholes; the big eye left behind, rolled down onto the cheek
  for (const [x, y, w] of [[94, 100, 15], [170, 96, 20]] as const) { ball(b, x, y, w + 4, 8, [SKIN[4], SKIN[5], SKIN[6], SKIN[7], SKIN[7]], { mat: M_SKIN, soft: 0.5 }); ball(b, x, y, w, 4, HOLE, { mat: M_OTHER, line: true }); path(b, [x - w, y + 6, x, y + 9, x + w, y + 6], SKIN[7], 1, undefined, M_SKIN); }
  vein(b, [182, 98, 200, 108, 218, 112], R('#F4B0C0', '#E08A9A', '#C8607A', '#A0405A', '#70203A', '#30081A'), 2);
  eyeball(b, 230, 122, { rx: 16, ry: 15, sclera: SCLERA_Y, iris: IRIS, ir: 6, idx: 5, idy: -5, pr: 2, veins: 30 });
  // (the nose: a flat flap, flopped over to one side, the tufts still in it)
  poly(b, [128, 92, 152, 90, 172, 108, 160, 116, 132, 112], SKIN, M_SKIN, { tilt: -0.3 });
  for (const x of [146, 160]) ball(b, x, 110, 4.4, 2.2, HOLE, { mat: M_OTHER });
  hairs(b, 8, () => [146 + rnd() * 16, 111], 7, Math.PI / 2, hexU('#1E120A'), undefined, 0.9);
  yield;
  // ---- the comb-over, come unstuck; the hat, crushed flat beside him, a star off it; the taped horn, fallen off again
  for (let k = 0; k < 9; k++) path(b, [70, 96 + k, 112, 82 + k * 0.5, 150, 80 + (k % 3), 196 + k * 4, 70 - k * 3], HAIR[k % 2 ? 1 : 3], 1, M_HAIR);
  poly(b, [16, 84, 96, 52, 170, 34, 150, 62, 100, 80, 40, 100], HAT, M_CLOTH, { tilt: 0.4, line: true });
  for (let k = 0; k < 5; k++) path(b, [34 + k * 22, 84 - k * 7, 60 + k * 22, 76 - k * 10], HAT[k % 2 ? 0 : 4], 1, undefined, M_CLOTH);
  const star = (cx: number, cy: number, r: number) => { const pts: number[] = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; pts.push(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.7); } poly(b, pts, STAR, M_OTHER, { line: true, tilt: 0.2 }); };
  star(70, 76, 8); star(118, 54, 7); star(206, 56, 8);
  poly(b, [226, 84, 250, 70, 266, 48, 258, 74, 236, 94], HORN, M_OTHER, { tilt: 0.3, line: true });
  poly(b, [222, 80, 236, 72, 244, 86, 230, 96], TAPE, M_OTHER, { tilt: 0.2, line: true });
  yield;
  stubble(b, (x, y) => (y > 150 && (x < 100 || x > 190) ? 0.4 : 0), hexU('#2A1A14'), 0.35);
  skinPost(b, SKIN[8], () => 0.03, { shine: 0.06 });
  inkEdges(b, M_SKIN, SKIN[8], [M_OTHER, M_MOUTH, M_HAIR, M_CLOTH]);
  void TOOTH; void GW; void GH;
  return b;
}

// ---------------------------------------------------------------------------------------------------------------

const build = (key: Paint) => (key === 'zorz' ? paintZorz() : key === 'knot' ? paintKnot() : key === 'gup' ? paintGup() : paintNed());
const get = stamps<Paint>(build, ['zorz', 'knot', 'gup', 'ned']);
export const warmDeadGross = () => get.warm();

interface Card { paint: Paint; name: string; whose: string; fx: number; fy: number; zoom: number; back: string[]; ink: string; flies: [number, number]; drip?: [number, number, string] }
export const DEAD_CARDS: Record<DeadKid, Card> = {
  zorz: { paint: 'zorz', name: 'ZORZARBLAX', whose: 'HER BOY', fx: 136, fy: 114, zoom: 1, back: ['#04061A', '#080E2A', '#121A40', '#1C2854', '#2A3868'], ink: '#A3E635', flies: [136, 96], drip: [60, 130, '#F4E27A'] },
  meh: { paint: 'knot', name: 'MEHPHISTO', whose: 'HIS BOY', fx: 100, fy: 106, zoom: 1, back: ['#0C0610', '#1A0C1E', '#2A1028', '#3A1430', '#4A1A30'], ink: '#EF4444', flies: [60, 80], drip: [80, 150, '#B01C1C'] },
  brat: { paint: 'knot', name: 'BRATHAZAR', whose: 'HIS OTHER BOY', fx: 172, fy: 106, zoom: 1, back: ['#160404', '#2A0808', '#3E0C0C', '#521212', '#661818'], ink: '#EF4444', flies: [220, 76], drip: [180, 152, '#B01C1C'] },
  gup: { paint: 'gup', name: 'GUPPLAX', whose: 'HER BIG BOY', fx: 136, fy: 116, zoom: 1, back: ['#04121A', '#06202A', '#0A3038', '#0E4048', '#14505A'], ink: '#A3E635', flies: [136, 60], drip: [150, 84, '#D04848'] },
  ned: { paint: 'ned', name: 'NED', whose: 'HIS MIDDLE ONE', fx: 136, fy: 114, zoom: 1, back: ['#12040A', '#240812', '#380C1A', '#4C1220', '#601826'], ink: '#EF4444', flies: [140, 110] },
};
export const DEAD_ORDER: DeadKid[] = ['zorz', 'meh', 'brat', 'gup', 'ned'];

/** One card, inside the box (x, y, w, h: the cutscene's picture, screen space): the painting punched in, the flies,
 *  a drip, the name and whose along its bottom. `t` frames since the card came up, `f` the frame. */
export const drawDeadCard = (c: Ctx, id: DeadKid, t: number, f: number, x: number, y: number, w: number, h: number) => {
  const d = DEAD_CARDS[id], s = get(d.paint);
  c.save();
  c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.translate(x, y);
  grossBackdrop(c, w, h, d.back);
  // (punched in: bigger for a few frames, settling; a jolt as it lands)
  const k = Math.max(0, 1 - t / 7), zoom = d.zoom * (1 + 0.22 * k * k);
  drawGrossStamp(c, s.img, w / 2, h / 2 - 12, d.fx, d.fy, zoom, f, t < 8 ? 5 : 0, box => {
    // (the flies at him: black specks on their loops, a wing's blink)
    for (let i = 0; i < 7; i++) {
      const a = f * 0.11 * (1 + (i % 3) * 0.3) + i * 2.1, fx = d.flies[0] + Math.cos(a) * (26 + i * 9), fy = d.flies[1] + Math.sin(a * 1.7 + i) * (16 + i * 4);
      box(fx, fy, 2, 1, '#050505'); if ((f + i) % 4 < 2) box(fx - 1, fy - 1, 1, 1, '#E8EEF4');
    }
    if (d.drip) { const u = ((f + 13) % 70) / 70; if (u < 0.5) box(d.drip[0], d.drip[1], 1, 2 + u * 8, d.drip[2]); else box(d.drip[0], d.drip[1] + (u - 0.5) * (u - 0.5) * 120, 1, 2, d.drip[2]); }
    // (the air still coming out of the kid)
    if (id === 'zorz') for (let i = 0; i < 3; i++) { const u = ((f * 2 + i * 23) % 60) / 60; box(14 - u * 18, 124 - u * 8 + i * 2, 2, 1, u < 0.5 ? '#E8F0D8' : '#9AA890'); }
  });
  // (the card along the bottom: the name, whose he was)
  c.fillStyle = 'rgba(0, 0, 0, 0.72)'; c.fillRect(0, h - 46, w, 46);
  c.fillStyle = d.ink; c.fillRect(0, h - 46, w, 2);
  c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  c.font = '20px "Press Start 2P"'; c.fillStyle = '#000'; c.fillText(d.name, 18, h - 13); c.fillStyle = '#F8FAFC'; c.fillText(d.name, 16, h - 15);
  c.font = '10px "Press Start 2P"'; c.textAlign = 'right'; c.fillStyle = d.ink; c.fillText(d.whose + '. DEAD.', w - 16, h - 18);
  c.textAlign = 'left';
  c.restore();
};
