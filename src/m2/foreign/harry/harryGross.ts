// HELICOPTER HARRY'S GROSS-UP (the user's rule for every close-up: "gross ren and stimpy style close ups"; grossKit.ts;
// and on this one: "the gross up for harry should show his whole body, not just his face. for the start of the fight.
// to show how jacked he is"): his fight's first look at the real Harry, the hippie torn off, head to sandals in a front
// double-biceps. Twenty-two years of secret push-ups and tanning oil: the head kept big (the Ren & Stimpy full-body
// shot), the face gone to cords and veins (a vein forked up his forehead under the bandana, the temples' too), the round
// amber glasses with his eyes bulging behind them, bloodshot; the red bandana sweated dark, its knot's tails flying; the
// gray hair scraped back under it; the Van Dyke; the war face: lips peeled off clenched teeth, the gums, spit. Under it
// the neck a bundle of ropes into traps up to his ears, striated delts, biceps peaked like hams with veins roped over
// them and down the forearms, a faded PEACE tattoo on one from the old days, pecs with the shadow cut under them, gray
// chest hair, the dog tags, an eight-pack, serratus, the lats flared out, the bandolier's brass across him, oiled and
// shining, a white tan line above the belt where the jeans rode down; the peace-sign buckle; the faded jeans (a knee
// blown out), the white tube socks, the sandals, his gnarled toes. Never did a squat: the legs aren't much.
// Live: the forehead vein throbbing, the biceps pumping (a stamp), spit bubbling, sweat running, the tails flapping.

import {
  type Ctx, type Buf, R, hexU, mixU, WHITE, newBuf, setSeed, rnd, matAt, plot, shade, seg, path, ball, tint, poly, bead, GW, eyeball, teeth, skinPost, stubble, hairs, vein, stamps, drawGrossStamp, grossBackdrop, bay, M_SKIN, M_HAIR, M_SCLERA, M_MOUTH, M_OTHER, M_CLOTH, M_METAL, M_GLASS, SCLERA, MOUTH, GUM, TOOTH_B,
} from '../../grossKit';

/** The middle of him (the buffer's point that goes where the caller says): the figure stands in y 4..197, clear of the screen's edges with the lurch. */
const FX = 136, FY = 100;
/** The face's measure: its features laid out round the eye line (old y 35) and scaled up K, to keep the head big. */
const K = 1.15, HY = 42;
const X = (dx: number) => FX + dx * K, Y = (y: number) => HY + (y - 35) * K;

const TAN = R('#FFE4C4', '#F2C08E', '#DCA06C', '#C78554', '#AC6A3E', '#87502C', '#5C321A', '#2C1408');
const GRAY = R('#FFFFFF', '#F4F4F5', '#D4D4D8', '#A8A8B0', '#7A7A84', '#3A3A42');
const BAND = R('#FCA5A5', '#F87171', '#DC2626', '#A51C1C', '#701414', '#360808');
const BRASS = R('#FFFAD0', '#FEF3A0', '#EAB308', '#B7791F', '#7C4A03', '#3A2002');
const LEATHER = R('#D8A068', '#C99158', '#94602F', '#734620', '#4F2E13', '#24130A');
const STEEL = R('#F0F2F6', '#B8BEC8', '#8890A0', '#5E6672', '#434A55', '#1A1E24');
const LIP = R('#E8A894', '#D08A76', '#B46C5C', '#94504A', '#6A3434', '#3A1A1A');
const IRIS = R('#C8B0F0', '#9A80D0', '#7058A8', '#4A3A80', '#2A1E50', '#100A28');
const TVEIN = R('#F8CC98', '#E6AA76', '#C88A5A', '#B0703E', '#8A4E2A', '#4A2210');
const DENIM = R('#C4D4EA', '#A7BEDD', '#7393C2', '#52709F', '#38507A', '#17233C');
const SOCK = R('#FFFFFF', '#F1F5F9', '#CBD5E1', '#94A3B8', '#475569');
const NAIL = R('#F4E8B0', '#E0CC80', '#C4A858', '#98803A', '#5A4A1E');
const HOLE = R('#3A1808', '#24100A', '#140806', '#080302', '#000000');
const INKT = TAN[7];

type Key = 'a' | 'b' | 'p';

/** A short oiled gleam: a streak of near-white along a lit top. */
const gleam = (b: Buf, x: number, y: number, len: number, ang = -0.35) => {
  for (let k = 0; k < len; k++) { const px = x + Math.cos(ang) * k, py = y + Math.sin(ang) * k; if (matAt(b, px, py) === M_SKIN) plot(b, px, py, k === 0 || k === len - 1 ? TAN[0] : WHITE); }
};

/** A vein roped over the muscle: its shadow cast down-right, the tube, the light along its top. */
const rope = (b: Buf, pts: number[], w = 2) => {
  const off = (dx: number, dy: number) => pts.map((v, i) => v + (i % 2 ? dy : dx));
  path(b, off(0.8, 1.2), TAN[6], w, undefined, M_SKIN);
  path(b, pts, TVEIN[3], w, undefined, M_SKIN);
  path(b, off(-0.6, -0.8), TVEIN[1], Math.max(1, w - 1), undefined, M_SKIN);
  if (w > 2) path(b, off(-0.9, -1), TVEIN[0], 1, undefined, M_SKIN);
};

function* build(key: Key): Generator<void, Buf> {
  setSeed(1969);
  const b = newBuf();
  const pump = key === 'p' ? 1 : 0;
  yield;
  // ---- his shadow on the dirt; the bandana's tails flying out behind his head (the live pair flaps over them)
  ball(b, FX, 194, 86, 4, R('#4E524C', '#4E524C', '#4E524C'), { mat: M_OTHER });
  poly(b, [X(34), Y(11), X(70), 6, X(73), 13, X(36), Y(18)], BAND, M_CLOTH);
  poly(b, [X(34), Y(17), X(66), Y(22), X(63), Y(29), X(32), Y(22)], BAND, M_CLOTH);
  yield;
  // ---- the legs: faded jeans (whiskered at the hip, the knee faded and blown out on one), the hems rolled, flared a
  // little over the white tube socks; the sandals, his toes splayed out over the soles
  for (const s of [-1, 1]) {
    poly(b, [FX + s * 2, 162, FX + s * 37, 157, FX + s * 35, 175, FX + s * 41, 186, FX + s * 19, 186, FX + s * 17, 175, FX + s * 3, 168], DENIM, M_CLOTH, { tilt: s * 0.5 });
    tint(b, FX + s * 26, 175, 7, 5, DENIM[0], 0.55, M_CLOTH, 0.6);
    for (let k = 0; k < 3; k++) path(b, [FX + s * (8 + k * 3), 164 + k, FX + s * (14 + k * 4), 167 + k * 1.5], DENIM[1], 1, undefined, M_CLOTH);
    path(b, [FX + s * 26, 160, FX + s * 26, 184], DENIM[4], 1, undefined, M_CLOTH);
    for (let x = -11; x <= 11; x++) { const xx = FX + s * 30 + x; plot(b, xx, 184, DENIM[5], M_CLOTH); plot(b, xx, 185, DENIM[2], M_CLOTH); plot(b, xx, 186, DENIM[5], M_CLOTH); }
  }
  // (the knee blown out on his right: the tan knee through it, the threads across)
  ball(b, FX - 26, 175, 6, 4, TAN, { mat: M_SKIN, line: true, lw: 0.8 });
  for (const k of [-1, 1]) seg(b, FX - 31, 175 + k * 1.6, FX - 21, 175 + k * 1.2, DENIM[0], 1);
  for (let x = FX - 32; x <= FX - 20; x += 2) { plot(b, x, 171, WHITE); plot(b, x + 1, 179, WHITE); }
  yield;
  for (const s of [-1, 1]) {
    poly(b, [FX + s * 20, 187, FX + s * 39, 187, FX + s * 38, 192, FX + s * 21, 192], SOCK, M_CLOTH);
    seg(b, FX + s * 21, 188, FX + s * 38, 188, hexU('#DC2626')); seg(b, FX + s * 21, 190, FX + s * 38, 190, hexU('#2563EB'));
    // (the sandal's sole under him, turned out; the strap over the foot)
    ball(b, FX + s * 36, 195, 18, 2.8, LEATHER, { mat: M_OTHER, line: true, lw: 0.8 });
    ball(b, FX + s * 34, 192.5, 13, 2.8, TAN, { mat: M_SKIN, line: true, lw: 0.8 });
    // (the toes: knobbed, the nails yellow and thick, a gray hair off each)
    for (let k = 0; k < 5; k++) {
      const tx = FX + s * (41 + k * 3), ty = 193.2 - k * 0.3, r = k === 0 ? 2.4 : 1.8;
      ball(b, tx, ty, r, r * 1.1, TAN, { mat: M_SKIN, line: true, lw: 0.7 });
      plot(b, tx, ty - 0.6, NAIL[k % 2], M_OTHER); if (k === 0) plot(b, tx + s, ty - 0.6, NAIL[2], M_OTHER);
      plot(b, tx, ty - 2, GRAY[3]);
    }
    seg(b, FX + s * 26, 191, FX + s * 40, 191, LEATHER[3], 2, M_OTHER); seg(b, FX + s * 26, 190.5, FX + s * 40, 190.5, LEATHER[1], 1, M_OTHER);
  }
  yield;
  // ---- the seat of the jeans over his hips: the fly's seam, the rivets, the pockets' stitching
  poly(b, [FX - 36, 154, FX + 36, 154, FX + 38, 160, FX + 22, 167, FX, 165, FX - 22, 167, FX - 38, 160], DENIM, M_CLOTH, { tilt: 0.3 });
  path(b, [FX + 2, 156, FX + 2, 165], DENIM[5], 1); path(b, [FX + 3, 157, FX + 6, 163], hexU('#E0A050'), 1);
  for (const s of [-1, 1]) { path(b, [FX + s * 34, 157, FX + s * 22, 160, FX + s * 18, 157], hexU('#E0A050'), 1); plot(b, FX + s * 32, 157, hexU('#F8D080')); }
  yield;
  // ---- the torso: the ribcage's V, broad up top (the lats flared out under his arms), cinched at the waist
  poly(b, [FX - 58, 88, FX + 58, 88, FX + 64, 104, FX + 46, 128, FX + 35, 152, FX - 35, 152, FX - 46, 128, FX - 64, 104], TAN, M_SKIN, { line: true, tilt: 0.2 });
  for (const s of [-1, 1]) ball(b, FX + s * 48, 112, 17, 26, TAN, { mat: M_SKIN, line: (dx) => dx * s > 0.3, lw: 1.4 });
  ball(b, FX, 132, 31, 24, TAN, { mat: M_SKIN, lit: 1.05 });
  yield;
  // (the serratus: fingers down his sides; the obliques into the V)
  for (const s of [-1, 1]) {
    for (let k = 0; k < 4; k++) { const y = 114 + k * 5; path(b, [FX + s * 46, y - 2, FX + s * 40, y, FX + s * 35, y + 2.5], TAN[6], 1, undefined, M_SKIN); path(b, [FX + s * 46, y - 3, FX + s * 40, y - 1, FX + s * 36, y + 1], TAN[1], 1, undefined, M_SKIN); }
    ball(b, FX + s * 31, 140, 8, 11, TAN, { mat: M_SKIN, line: (dx) => dx * s > 0.4, lw: 0.9 });
  }
  // (the eight-pack: four rows of two, each lit on its top, the cuts between inked; the line down the middle)
  for (let r = 0; r < 4; r++) for (const s of [-1, 1]) {
    const ax = FX + s * 10.5, ay = 117 + r * 8.6;
    ball(b, ax, ay, 9.5 - r * 0.4, 4.4, TAN, { mat: M_SKIN, line: (dx, dy) => dy > 0.25 || dx * s < -0.6, lw: 1, lit: 1.12 });
    gleam(b, ax - 5, ay - 2.4, 4, -0.1);
  }
  path(b, [FX, 112, FX, 150], INKT, 1, undefined, M_SKIN);
  for (const s of [-1, 1]) path(b, [FX + s * 26, 136, FX + s * 18, 146, FX + s * 9, 152], TAN[6], 1, undefined, M_SKIN);
  plot(b, FX, 149, TAN[7]); plot(b, FX, 150, TAN[6]);
  // (the tan line: a band of white skin above the belt, where the jeans rode down in the sun)
  for (let x = FX - 34; x <= FX + 34; x++) for (let y = 147; y <= 149; y++) if (matAt(b, x, y) === M_SKIN) shade(b, x, y, hexU('#FFF4EC'), y === 147 && bay(x, y) < 0.5 ? 0.25 : 0.55);
  yield;
  // ---- the traps: hams up to his ears either side of the neck; the neck's column, its cords, the Adam's apple
  for (const s of [-1, 1]) {
    ball(b, FX + s * 34, 74, 31, 19, TAN, { mat: M_SKIN, line: (_dx, dy) => dy < 0.1, lw: 1.4, lit: 0.95 });
    for (let k = 0; k < 3; k++) path(b, [FX + s * (14 + k * 6), 62 + k * 2, FX + s * (30 + k * 7), 70 + k * 2, FX + s * (48 + k * 4), 80 + k], TAN[5], 1, undefined, M_SKIN);
    gleam(b, FX + s * 34 - 14, 59, 9, -0.2);
  }
  poly(b, [FX - 18, 56, FX + 18, 56, FX + 21, 86, FX - 21, 86], TAN, M_SKIN, { line: false, tilt: 0.6 });
  for (const s of [-1, 1]) {
    for (let d = -2; d <= 2; d++) path(b, [FX + s * 19 + d, 66, FX + s * 12 + d, 76, FX + s * 4 + d, 86], TAN[Math.abs(d) === 2 ? 6 : d * s < 0 ? 1 : d === 0 ? 2 : 4], 1, undefined, M_SKIN);
    path(b, [FX + s * 21, 72, FX + s * 26, 78, FX + s * 28, 84], TAN[6], 1, undefined, M_SKIN);
  }
  ball(b, FX, 80, 3.4, 4.4, TAN, { mat: M_SKIN, line: (_dx, dy) => dy > 0.3, lw: 0.8, lit: 1.2 });
  yield;
  // ---- the pecs: two slabs, lit on top, the shadow cut deep under them; the sternum's groove; the nipples; the
  // collarbones over them
  for (const s of [-1, 1]) {
    ball(b, FX + s * 23, 99, 26, 15, TAN, { mat: M_SKIN, line: (dx, dy) => dy > 0.1 || dx * s > 0.8 || dx * s < -0.85, lw: 1.7, lit: 1.12 });
    path(b, [FX + s * 2, 88, FX + s * 20, 84.5, FX + s * 40, 86, FX + s * 48, 90], TAN[6], 1, undefined, M_SKIN);
    tint(b, FX + s * 22, 114, 22, 3.2, TAN[6], 0.5, M_SKIN, 0.6);
    ball(b, FX + s * 30, 104, 2.6, 2, R('#C88070', '#A86058', '#884444', '#5A2A2A', '#3A1A1A'), { mat: M_SKIN, line: true, lw: 0.6 });
    path(b, [FX + s * 4, 85, FX + s * 26, 83, FX + s * 50, 86], TAN[1], 1, undefined, M_SKIN);
    path(b, [FX + s * 4, 86, FX + s * 26, 84, FX + s * 50, 87], TAN[5], 1, undefined, M_SKIN);
    gleam(b, FX + s * 23 - 12, 90, 8, -0.15); gleam(b, FX + s * 23 - 8, 92, 4, -0.15);
    // (the pec's fibres fanned in toward the armpit)
    for (let k = 0; k < 4; k++) path(b, [FX + s * (8 + k * 6), 104 - k, FX + s * (26 + k * 5), 94 - k * 2, FX + s * (42 + k), 92 - k], TAN[5], 1, undefined, M_SKIN);
  }
  path(b, [FX, 86, FX, 112], INKT, 1, undefined, M_SKIN);
  yield;
  // ---- the triceps hung under the upper arms
  for (const s of [-1, 1]) ball(b, FX + s * 90, 96, 20, 7, TAN, { mat: M_SKIN, line: (_dx, dy) => dy > 0, lw: 1.3, lit: 0.75 });
  // ---- the forearms: straight up from the elbows, thick at the top (the brachioradialis), tapering to the wrists
  for (const s of [-1, 1]) {
    ball(b, FX + s * 111, 92, 8, 7, TAN, { mat: M_SKIN, line: true, lw: 1.1 });
    ball(b, FX + s * 104, 52, 9, 14, TAN, { mat: M_SKIN, line: true, lw: 1.2 });
    ball(b, FX + s * 109, 72, 13, 21, TAN, { mat: M_SKIN, line: (dx) => dx * s > -0.5, lw: 1.3, lit: 1.08 });
    for (let k = 0; k < 3; k++) path(b, [FX + s * (100 + k * 4), 88, FX + s * (101 + k * 4), 70, FX + s * (100 + k * 2), 52], TAN[5], 1, undefined, M_SKIN);
    gleam(b, FX + s * 109 - 6, 56, 9, -1.4);
  }
  yield;
  // ---- the fists up by his head: curled tight, the fingers' rolls toward his ears, the thumb across, hair on the
  // knuckles; veins over the backs
  for (const s of [-1, 1]) {
    ball(b, FX + s * 102, 34, 13, 12.5, TAN, { mat: M_SKIN, line: true, lw: 1.3, lit: 1.05 });
    for (let k = 0; k < 4; k++) ball(b, FX + s * 92.5, 25.5 + k * 5, 5.6, 2.9, TAN, { mat: M_SKIN, line: true, lw: 0.9, lit: 1.15 });
    ball(b, FX + s * 98, 44, 8, 3.6, TAN, { mat: M_SKIN, line: true, lw: 0.9 });
    for (let k = 0; k < 4; k++) plot(b, FX + s * 88, 24 + k * 5, INKT);
    hairs(b, 14, () => [FX + s * (94 + rnd() * 8), 22 + rnd() * 20], 2.6, s > 0 ? -2.4 : -0.7, GRAY[3], M_SKIN);
    vein(b, [FX + s * 110, 30, FX + s * 108, 38, FX + s * 104, 46], TVEIN, 1);
  }
  yield;
  // ---- the biceps: peaked like hams, squeezed up against the forearms (pumped: higher, the veins fat)
  for (const s of [-1, 1]) {
    const bx = FX + s * 86, by = 80 - pump * 1.5, rx = 21 + pump * 1.5, ry = 16 + pump * 2.5;
    ball(b, bx, by, rx, ry, TAN, { mat: M_SKIN, line: (dx, dy) => dy < 0.55 || dx * s < -0.6, lw: 1.5, lit: 1.12 });
    // (the split between the heads, the shadow where it meets the forearm)
    path(b, [bx - s * 12, by + 6, bx, by + 2, bx + s * 14, by + 4], TAN[5], 1, undefined, M_SKIN);
    tint(b, bx + s * 17, by + 4, 5, 10, TAN[6], 0.45, M_SKIN, 0.6);
    gleam(b, bx - 10, by - ry + 4, 10, -0.25); gleam(b, bx - 6, by - ry + 6, 5, -0.25);
  }
  yield;
  // ---- the delts: cannonballs capping the shoulders over the arms' ends, striated (the fibres down off the cap)
  for (const s of [-1, 1]) {
    ball(b, FX + s * 63, 91, 17, 17, TAN, { mat: M_SKIN, line: (dx, dy) => dx * s > -0.3 || dy < -0.4 || dy > 0.6, lw: 1.4, lit: 1.1 });
    for (let k = 0; k < 6; k++) { const x0 = FX + s * (53 + k * 4); path(b, [x0, 78 + Math.abs(k - 2.5) * 1.4, x0 + s * (k - 2.5) * 0.9, 91, FX + s * (60 + k * 1.6), 105], k % 2 ? TAN[5] : TAN[6], 1, undefined, M_SKIN); }
    gleam(b, FX + s * 63 - 9, 80, 7, -0.4); gleam(b, FX + s * 63 - 6, 82, 3, -0.4);
  }
  yield;
  // (the faded PEACE tattoo on his right bicep, from the old days: gone green-blue, blurred)
  {
    const tx = FX - 84, ty = 80 - pump, tr = 6.5, ink = hexU('#2A5A66');
    for (let a = 0; a < Math.PI * 2; a += 0.04) shade(b, tx + Math.cos(a) * tr, ty + Math.sin(a) * tr, ink, 0.6, M_SKIN);
    for (let d = -tr; d <= tr; d += 0.5) shade(b, tx, ty + d, ink, 0.5, M_SKIN);
    for (let d = 0; d <= tr; d += 0.5) { shade(b, tx - d * 0.7, ty + d * 0.7, ink, 0.5, M_SKIN); shade(b, tx + d * 0.7, ty + d * 0.7, ink, 0.5, M_SKIN); }
    for (let k = 0; k < 8; k++) shade(b, tx - 8 + k * 2, ty + 10, ink, 0.35, M_SKIN);
  }
  yield;
  // ---- the veins: roped over the biceps (the cephalic, forked), down the inside of the arm, up the forearms in a mess
  const vw = 3 + pump;
  void vein;
  for (const s of [-1, 1]) {
    rope(b, [FX + s * 66, 92, FX + s * 72, 84, FX + s * 80, 72 - pump * 2, FX + s * 90, 66 - pump * 3, FX + s * 100, 68 - pump * 2, FX + s * 104, 76], vw);
    rope(b, [FX + s * 80, 72 - pump * 2, FX + s * 84, 82, FX + s * 92, 86, FX + s * 98, 94], vw - 1);
    rope(b, [FX + s * 90, 66 - pump * 3, FX + s * 94, 76, FX + s * 102, 82], 2);
    rope(b, [FX + s * 72, 102, FX + s * 88, 100, FX + s * 104, 96], 2);
    rope(b, [FX + s * 104, 92, FX + s * 101, 78, FX + s * 106, 66, FX + s * 101, 52, FX + s * 104, 42], vw);
    rope(b, [FX + s * 113, 88, FX + s * 115, 74, FX + s * 109, 62, FX + s * 111, 52], vw - 1);
    rope(b, [FX + s * 106, 66, FX + s * 112, 58, FX + s * 109, 46], 2);
    rope(b, [FX + s * 101, 78, FX + s * 96, 70, FX + s * 98, 58], 2);
  }
  // (a vein down each pec into the armpit, one up the abs, one down the side of the neck)
  for (const s of [-1, 1]) { rope(b, [FX + s * 44, 98, FX + s * 52, 104, FX + s * 56, 112], 2); rope(b, [FX + s * 16, 70, FX + s * 18, 78, FX + s * 15, 86], 2); }
  rope(b, [FX + 20, 150, FX + 22, 140, FX + 18, 132], 2);
  yield;
  // ---- gray chest hair on the sternum and the pecs' insides, the happy trail down to the belt; hair in the pits
  hairs(b, 110, () => { const x = FX - 18 + rnd() * 36, y = 86 + rnd() * 24; return Math.abs(x - FX) < 18 - (y - 86) * 0.5 ? [x, y] : null; }, 3.4, -Math.PI / 2, GRAY[3], M_SKIN, 1.6);
  hairs(b, 40, () => [FX - 14 + rnd() * 28, 88 + rnd() * 18], 3, Math.PI / 2, GRAY[4], M_SKIN, 1.6);
  hairs(b, 30, () => [FX - 12 + rnd() * 24, 88 + rnd() * 16], 2.5, -Math.PI / 2, GRAY[1], M_SKIN, 1.6);
  hairs(b, 34, () => { const y = 112 + rnd() * 36; return [FX + (rnd() - 0.5) * (3 + (y - 112) * 0.08), y]; }, 2, -Math.PI / 2, hexU('#6A5A50'), M_SKIN, 2.4);
  for (const s of [-1, 1]) hairs(b, 14, () => [FX + s * (58 + rnd() * 5), 104 + rnd() * 4], 3, Math.PI / 2 + s * 0.3, hexU('#5A4A40'), M_SKIN, 0.8);
  yield;
  // ---- the dog tags: the bead chain round his neck, the two tags on his sternum
  for (let t = 0; t <= 1; t += 0.02) for (const s of [-1, 1]) { const x = FX + s * 17 * (1 - t), y = 66 + t * 30 + Math.sin(t * Math.PI) * 4; if (Math.round(t * 50) % 2 === 0) { plot(b, x, y, STEEL[1], M_METAL); plot(b, x, y + 1, STEEL[5], M_METAL); } }
  for (const [x, y] of [[FX - 4, 97], [FX + 1, 99]] as const) {
    poly(b, [x, y, x + 5, y, x + 5, y + 8, x, y + 8], STEEL, M_METAL);
    plot(b, x + 1, y + 1, STEEL[0]); seg(b, x + 1, y + 3, x + 3, y + 3, STEEL[3]); seg(b, x + 1, y + 5, x + 3, y + 5, STEEL[3]);
  }
  yield;
  // ---- the bandolier: off his left shoulder across him to his right hip, the strap in steps, the brass in their links
  for (let d = -5; d <= 5; d++) seg(b, FX + 56, 80 + d, FX - 38, 150 + d, LEATHER[Math.abs(d) === 5 ? 5 : d < -2 ? 1 : d < 2 ? 2 : 3], 1, M_CLOTH);
  for (let k = 0; k < 13; k++) {
    const t = (k + 0.5) / 13, x = FX + 56 - 94 * t, y = 80 + 70 * t;
    for (let yy = -10; yy <= 1; yy++) for (let xx = -2; xx <= 2; xx++) plot(b, x + xx + yy * 0.42, y + yy, BRASS[Math.abs(xx) === 2 ? 5 : xx < 0 ? 0 : xx < 1 ? 2 : 3], M_METAL);
    for (let yy = -13; yy <= -11; yy++) for (let xx = -1; xx <= 1; xx++) plot(b, x + xx + yy * 0.42, y + yy, xx < 0 ? hexU('#E8A86A') : xx < 1 ? hexU('#B87333') : hexU('#7A4418'), M_METAL);
    plot(b, x + 2.4, y + 2, LEATHER[4]);
  }
  yield;
  // ---- the belt: tooled leather, its loops; the buckle: a peace sign in brass, from the old days
  poly(b, [FX - 36, 150, FX + 36, 150, FX + 36, 156, FX - 36, 156], LEATHER, M_CLOTH);
  for (let x = FX - 32; x <= FX + 32; x += 3) plot(b, x, 153, LEATHER[3]);
  for (const x of [FX - 24, FX + 22]) poly(b, [x, 149, x + 3, 149, x + 3, 157, x, 157], DENIM, M_CLOTH);
  ball(b, FX, 153, 5.5, 5.5, BRASS, { mat: M_METAL, line: true, lw: 1 });
  for (let a = 0; a < Math.PI * 2; a += 0.08) plot(b, FX + Math.cos(a) * 3.4, 153 + Math.sin(a) * 3.4, BRASS[4]);
  seg(b, FX, 149.6, FX, 156.4, BRASS[4]); seg(b, FX, 153, FX - 2.4, 155.4, BRASS[4]); seg(b, FX, 153, FX + 2.4, 155.4, BRASS[4]);
  plot(b, FX - 3, 150, WHITE);
  yield;
  // ---- the head, kept big and sunk down between the traps: the ears (hairs out of them), the skull, the jaw clenched
  // square, the cheekbones, the jaw muscles knotted. (Drawn in the face's own measure: X/Y off its middle, K up.)
  for (const s of [-1, 1]) {
    const ex = X(s * 31), ey = Y(36);
    ball(b, ex, ey, 6 * K, 10 * K, TAN, { mat: M_SKIN, line: true, lw: 1 });
    ball(b, ex - s * 0.5, ey + 1, 3 * K, 6 * K, TAN.slice(4), { mat: M_SKIN, soft: 0.3 });
    ball(b, ex - s, ey + 2, 1.5, 1.8, HOLE, { mat: M_OTHER });
    hairs(b, 7, () => [ex - s, ey + 2], 5, s > 0 ? -0.3 : Math.PI + 0.3, GRAY[2]);
  }
  ball(b, FX, Y(34), 30 * K, 32 * K, TAN, { mat: M_SKIN, line: (_dx, dy) => dy > -0.2, lw: 1.5 });
  poly(b, [X(-28), Y(42), X(28), Y(42), X(26), Y(56), X(12), Y(66), X(-12), Y(66), X(-26), Y(56)], TAN, M_SKIN, { line: true, tilt: 0.2 });
  for (const s of [-1, 1]) {
    ball(b, X(s * 19), Y(41), 9 * K, 5.5 * K, TAN, { mat: M_SKIN, lit: 1.15 });
    ball(b, X(s * 24), Y(53), 5 * K, 7 * K, TAN, { mat: M_SKIN, lit: 1.08, line: (dx) => dx * s < -0.5, lw: 0.8 });
    path(b, [X(s * 27), Y(46), X(s * 28), Y(55), X(s * 25), Y(60)], TAN[6], 1, undefined, M_SKIN);
    tint(b, X(s * 21), Y(47), 5, 4, TAN[6], 0.4, M_SKIN, 0.7);
  }
  yield;
  // ---- the hair, gray, scraped back flat over the top; the bandana tied over it, sweated dark, the paisley, the knot
  ball(b, FX, Y(11), 30 * K, 9 * K, GRAY.slice(2), { mat: M_HAIR, line: (_dx, dy) => dy < 0, only: (_x, y) => y < Y(13), flat: 0.5 });
  for (let k = 0; k < 44; k++) { const x0 = X(-28 + rnd() * 56); path(b, [x0, Y(13), x0 + (x0 - FX) * 0.1, Y(8), x0 + (x0 - FX) * 0.2, Y(3)], k % 3 ? GRAY[k % 2 ? 5 : 4] : GRAY[1], 1, undefined, M_HAIR); }
  for (let x = Math.floor(X(-32)); x <= X(32); x++) {
    const u = (x - FX) / (32 * K), yt = Y(11) + u * u * 4 * K, h = (8 - u * u * 2) * K;
    for (let d = 0; d < h; d++) { const v = d / h; plot(b, x, yt + d, BAND[d === 0 || d >= h - 1 ? 5 : v < 0.25 ? 1 : v < 0.6 ? (bay(x, yt + d) < 0.5 ? 2 : 1) : 3], M_CLOTH); }
  }
  for (let k = 0; k < 10; k++) { const x = X(-29 + k * 6.4), y = Y(13) + ((x - FX) / (32 * K)) ** 2 * 4 * K + (k % 2) * 2; plot(b, x, y, WHITE); plot(b, x + 1, y, WHITE); plot(b, x + 1, y + 1, BAND[0]); }
  for (let x = Math.floor(X(-31)); x <= X(31); x++) { const y0 = Y(11) + ((x - FX) / (32 * K)) ** 2 * 4 * K + 6 * K; for (let d = 0; d < 2; d++) if (bay(x, y0 + d) < 0.55) plot(b, x, y0 + d, BAND[4], undefined, M_CLOTH); }
  ball(b, X(33), Y(15), 5.5 * K, 5 * K, BAND, { mat: M_CLOTH, line: true, lw: 1 });
  yield;
  // ---- the forehead: furrows, the vein forked up under the bandana, the temples' veins, liver spots
  for (let k = 0; k < 2; k++) path(b, [X(-20), Y(21 + k * 2.5), X(-7), Y(20 + k * 2.5), X(7), Y(20.5 + k * 2.5), X(20), Y(21.5 + k * 2.5)], TAN[6], 1, undefined, M_SKIN);
  vein(b, [X(-3), Y(29), X(-5), Y(25), X(-3), Y(22), X(-5), Y(18)], TVEIN, 2);
  vein(b, [X(-4), Y(23.5), X(3), Y(21), X(5), Y(18)], TVEIN, 1);
  for (const s of [-1, 1]) vein(b, [X(s * 26), Y(34), X(s * 28), Y(26), X(s * 26), Y(20)], TVEIN, 1);
  for (let k = 0; k < 6; k++) { const x = X((rnd() - 0.5) * 48), y = Y(20 + rnd() * 44); if (matAt(b, x, y) === M_SKIN) tint(b, x, y, 1 + rnd() * 1.5, 1 + rnd(), TAN[5], 0.45, M_SKIN, 0.4); }
  yield;
  // ---- the brows: gray, wild, crushed down in the middle
  for (const s of [-1, 1]) {
    const pts = [X(s * 25), Y(24), X(s * 18), Y(25), X(s * 11), Y(28), X(s * 4), Y(31)];
    path(b, pts, GRAY[5], 3); path(b, pts.map((v, i) => (i % 2 ? v - 1 : v)), GRAY[2], 1);
    for (let k = 0; k < 16; k++) { const t = rnd(), x = X(s * (25 - t * 21)), y = Y(24 + t * 7); seg(b, x, y + 1, x + s * (rnd() * 3 - 1), y - 2 - rnd() * 3, k % 3 ? GRAY[3] : GRAY[1]); }
  }
  yield;
  // ---- the eyes: bulging out of his head, bloodshot, a burst vessel in the near one; the bags, the crow's feet
  for (const s of [-1, 1]) {
    const ex = X(s * 13), ey = Y(35), rx = 8 * K, ry = 7 * K;
    tint(b, ex, ey, 11 * K, 8 * K, TAN[6], 0.35, M_SKIN, 0.6);
    eyeball(b, ex, ey, {
      rx, ry, sclera: SCLERA, iris: IRIS, ir: 3.2, idx: -s * 0.5, idy: -0.5, pr: 1.2, veins: 22, lid: TAN,
      top: (x) => ey - ry + 1.5 + Math.abs(x - ex) * 0.1 + (s * (x - ex) < 0 ? 1.5 : 0) + (key === 'b' ? 2.5 : 0),
      bot: (x) => ey + ry - 1 - ((x - ex) / rx) ** 2 * 2,
    });
    if (s > 0) tint(b, ex + 4, ey + 1, 2.6, 2.2, hexU('#D01020'), 0.85, M_SCLERA, 0.3);
    path(b, [ex - rx, ey + ry, ex - 2, ey + ry + 2.5, ex + 3, ey + ry + 2.5, ex + rx, ey + ry], TAN[6], 1, undefined, M_SKIN);
    path(b, [ex - rx + 1, ey + ry + 3, ex, ey + ry + 4.5, ex + rx - 1, ey + ry + 3], TAN[5], 1, undefined, M_SKIN);
    for (let k = 0; k < 3; k++) path(b, [ex + s * (rx + 3), ey - 3 + k * 3, ex + s * (rx + 6), ey - 4 + k * 4, ex + s * (rx + 9), ey - 5 + k * 5], TAN[6], 1, undefined, M_SKIN);
  }
  yield;
  // ---- the nose: long, hooked, pores, hairs out of it
  poly(b, [X(-3), Y(31), X(3), Y(31), X(6), Y(44), X(-6), Y(44)], TAN, M_SKIN, { line: false, tilt: 1.3 });
  path(b, [X(-3), Y(32), X(-4.5), Y(42)], TAN[5], 1, undefined, M_SKIN);
  for (const s of [-1, 1]) ball(b, X(s * 6), Y(46), 4 * K, 4 * K, TAN, { mat: M_SKIN, line: (dx, dy) => dy > -0.2 && dx * s > -0.3, lw: 0.9 });
  ball(b, FX, Y(44), 6.5 * K, 6 * K, TAN, { mat: M_SKIN, line: (_dx, dy) => dy > 0.4, lw: 0.9, lit: 1.1 });
  for (const s of [-1, 1]) {
    ball(b, X(s * 3.6), Y(48.6), 2.4, 1.5, HOLE, { mat: M_OTHER });
    for (let k = 0; k < 3; k++) seg(b, X(s * (2.6 + k)), Y(49), X(s * (2.4 + k * 1.3)), Y(51.5), GRAY[2]);
  }
  gleam(b, X(-3), Y(41), 3, -0.6); plot(b, X(-2), Y(43), WHITE);
  yield;
  // ---- the war face: lips peeled off clenched teeth, gums, tartar, spit between them
  const cx = FX, cy = Y(56), mw = 16 * K;
  const top = (x: number) => cy - 4.5 * K + ((x - cx) / mw) ** 2 * 2;
  const bot = (x: number) => cy + 4.5 * K - ((x - cx) / mw) ** 2 * 2.5;
  for (let x = Math.round(cx - mw); x <= cx + mw; x++) for (let y = Math.round(top(x)); y <= bot(x); y++) plot(b, x, y, MOUTH[2], M_MOUTH);
  for (let x = Math.round(cx - mw); x <= cx + mw; x++) { plot(b, x, Math.round(top(x)), GUM[4], M_OTHER); plot(b, x, Math.round(top(x)) + 1, GUM[1], M_OTHER); plot(b, x, Math.round(bot(x)), GUM[4], M_OTHER); plot(b, x, Math.round(bot(x)) - 1, GUM[2], M_OTHER); }
  teeth(b, cx - mw + 1, cx + mw - 1, (x) => top(x) + 2, 1, 4, { tw: 3, rot: [0, 10], ramp: TOOTH_B.map((v, i) => mixU(v, WHITE, i < 3 ? 0.4 : 0.1)) });
  teeth(b, cx - mw + 2, cx + mw - 2, (x) => bot(x) - 2, -1, 3.5, { tw: 3, rot: [1, 9], gaps: [4], ramp: TOOTH_B.map((v, i) => mixU(v, WHITE, i < 3 ? 0.3 : 0.05)) });
  seg(b, cx - mw + 1, cy, cx + mw - 1, cy, MOUTH[5], 1, undefined, M_MOUTH);
  for (const [x, y] of [[cx - mw + 1, cy], [cx + mw - 1, cy], [cx - 5, cy]] as const) { plot(b, x, y, hexU('#F4F8FC')); plot(b, x + 1, y, WHITE); }
  for (let x = Math.round(cx - mw - 1); x <= cx + mw + 1; x++) { plot(b, x, top(x) - 1, LIP[5], M_OTHER); plot(b, x, top(x) - 2, LIP[1], M_OTHER); plot(b, x, bot(x) + 1, LIP[5], M_OTHER); plot(b, x, bot(x) + 2, LIP[2], M_OTHER); }
  for (const s of [-1, 1]) { path(b, [cx + s * (mw + 1), cy - 2, cx + s * (mw + 3), cy - 10, cx + s * (mw - 1), cy - 17], TAN[6], 1, undefined, M_SKIN); path(b, [cx + s * (mw + 2), cy + 3, cx + s * (mw + 4), cy + 9], TAN[6], 1, undefined, M_SKIN); }
  yield;
  // ---- the Van Dyke: the mustache over the lip (gray), the goatee on the chin hanging down over the neck; jerky in it
  for (let k = 0; k < 140; k++) {
    const x = cx - 20 + rnd() * 40, y = Y(48.5) + rnd() * 2 + Math.abs(x - cx) * 0.14;
    if (Math.abs(x - cx) < 2 && rnd() < 0.6) continue;
    seg(b, x, y, x + (x - cx) * 0.08 + (rnd() - 0.5), y + 2.5 + rnd(), k % 4 ? GRAY[k % 2 ? 3 : 2] : GRAY[4]);
  }
  for (let k = 0; k < 160; k++) {
    const x = cx - 11 + rnd() * 22, y = Y(62.5) + rnd() * 11;
    if (Math.abs(x - cx) > 11 - (y - Y(62.5)) * 0.7) continue;
    seg(b, x, y, x + (rnd() - 0.5) * 1.5, y + 2 + rnd() * 2, k % 4 ? GRAY[k % 2 ? 3 : 2] : GRAY[1]);
  }
  for (const [x, y] of [[cx - 11, Y(50)], [cx + 3, Y(66)]] as const) { plot(b, x, y, hexU('#8A5028')); plot(b, x + 1, y, hexU('#6A3818')); }
  yield;
  // ---- stubble on the cheeks, the pores (thick on the face, fine over the body), blackheads, the oil shining all over
  stubble(b, (_x, y) => (y > Y(44) && y < Y(68) ? 0.6 : 0), GRAY[4], 0.3);
  yield;
  skinPost(b, TAN[7], (x, y) => (y < Y(68) && Math.abs(x - FX) < 40 ? (((x - FX) / 10) ** 2 + ((y - Y(44)) / 11) ** 2 < 1 ? 0.14 : 0.05) : 0.02), { blackheads: (x, y) => ((x - FX) / 9) ** 2 + ((y - Y(45)) / 9) ** 2 < 1, shine: 0.16, shineCol: hexU('#FFF0DC') });
  ball(b, X(-22), Y(50), 1.5, 1.4, R('#6A3A22', '#4A2414', '#2E140A', '#1A0804', '#0E0402'), { mat: M_OTHER });
  plot(b, X(-23), Y(48), GRAY[3]);
  // (liver spots across the shoulders, a mole on the pec: he's sixty-odd under all that)
  for (let k = 0; k < 14; k++) { const s = k % 2 ? 1 : -1, x = FX + s * (30 + rnd() * 34), y = 70 + rnd() * 24; if (matAt(b, x, y) === M_SKIN) tint(b, x, y, 1.2 + rnd(), 1 + rnd(), TAN[5], 0.4, M_SKIN, 0.4); }
  ball(b, FX + 38, 96, 1.3, 1.2, R('#6A3A22', '#4A2414', '#2E140A', '#1A0804', '#0E0402'), { mat: M_OTHER });
  yield;
  // ---- the glasses: round, wire, amber, his bulging eyes through them, the glare; the arms back to his ears
  for (const s of [-1, 1]) {
    const lx = X(s * 13), ly = Y(35), r = 10.5;
    for (let y = Math.floor(ly - r); y <= ly + r; y++) for (let x = Math.floor(lx - r); x <= lx + r; x++) {
      const d = Math.hypot(x - lx, y - ly);
      if (d > r || x < 0 || x >= GW || y < 0) continue;
      const i = y * GW + x;
      b.px[i] = mixU(b.px[i], mixU(hexU('#E8A030'), hexU('#A05A10'), (y - ly + r) / (2 * r)), 0.32); b.mat[i] = M_GLASS;
    }
    for (let a = 0; a < Math.PI * 2; a += 0.02) plot(b, lx + Math.cos(a) * r, ly + Math.sin(a) * r, STEEL[Math.cos(a + 2.3) > 0.3 ? 1 : 4], M_METAL);
    seg(b, lx - 5, ly - 2, lx - 2, ly - 6, mixU(WHITE, hexU('#E8A030'), 0.2), 1, M_GLASS);
    plot(b, lx - 6, ly + 1, WHITE);
    seg(b, lx + s * r, ly - 1, lx + s * (r + 10), ly, STEEL[2], 1, M_METAL);
  }
  seg(b, X(-4), Y(34), X(4), Y(34), STEEL[1], 1, M_METAL);
  yield;
  // ---- sweat: beads across the brow under the bandana, on his chest and the biceps' peaks; running down the temples
  for (let k = 0; k < 8; k++) { const x = X(-22 + rnd() * 44), y = Y(20 + rnd() * 5); if (matAt(b, x, y) === M_SKIN) bead(b, x, y, 0.9 + rnd() * 0.6, TAN); }
  for (let k = 0; k < 10; k++) { const s = k % 2 ? 1 : -1, x = FX + s * (6 + rnd() * 40), y = 88 + rnd() * 50; if (matAt(b, x, y) === M_SKIN) bead(b, x, y, 0.9 + rnd() * 0.5, TAN); }
  for (const s of [-1, 1]) {
    bead(b, FX + s * 84, 70 - pump * 3, 1.2, TAN);
    path(b, [X(s * 28), Y(24), X(s * 29), Y(34), X(s * 28), Y(44)], mixU(TAN[1], WHITE, 0.5), 1, undefined, M_SKIN); bead(b, X(s * 28), Y(45), 1.3, TAN);
  }
  return b;
}

const get = stamps<Key>(build, ['a', 'b', 'p']);
/** Paint his stamps ahead (the fight's intro calls it, long before the cut to him), so it can't hitch. */
export const warmHarryGross = () => get.warm();

/** His gross-up: (cx, cy) where the middle of him goes on the screen (all of him fits with it at the middle of the
 *  screen), `zoom` 1 at the hold. */
export const drawHarryGross = (c: Ctx, cx: number, cy: number, zoom: number, f: number, jolt = 0) => {
  const s = get(f % 72 < 8 ? 'b' : f % 36 >= 18 && f % 36 < 26 ? 'p' : 'a');
  drawGrossStamp(c, s.img, cx, cy, FX, FY, zoom, f, jolt, (box) => {
    // (the forehead vein throbbing)
    if (f % 18 < 7) { c.globalAlpha = 0.6; box(X(-6), Y(18), 3, 12, '#C88A5A'); box(X(-5), Y(19), 1, 10, '#FFE0B8'); box(X(-3), Y(19), 7, 2, '#C88A5A'); c.globalAlpha = 1; }
    // (spit bubbling at his teeth: a bubble swelling and popping at the corner)
    const t = (f % 40) / 40, r = Math.round(t * 2);
    if (t < 0.9) { box(X(16), Y(55) - r, r + 1, r + 1, '#F4F8FC'); box(X(16), Y(55) - r, 1, 1, '#FFFFFF'); }
    // (a bead of sweat running down his temple, another down between the pecs)
    const u = (f % 100) / 100, sx = X(-29) + Math.sin(u * 8) * 0.6, sy = Y(24) + u * 30;
    box(sx, sy, 1, 2, '#FFF4EA'); box(sx, sy, 1, 1, '#FFFFFF');
    const v = ((f + 50) % 120) / 120;
    box(FX + 1, 88 + v * 40, 1, 2, '#FFF4EA'); box(FX + 1, 88 + v * 40, 1, 1, '#FFFFFF');
    // (the bandana's tails flapping)
    const fl = Math.round(Math.sin(f * 0.5) * 2);
    box(X(60), 7 + fl, 16, 3, '#DC2626'); box(X(60), 7 + fl, 16, 1, '#F87171'); box(X(60) + 14, 6 + fl * 2, 4, 3, '#A51C1C');
    box(X(56), Y(23) - fl, 13, 3, '#A51C1C'); box(X(56) + 10, Y(23) + 1 - fl * 2, 4, 3, '#701414');
  });
};

/** Behind him: the dig's dust and the sky, in bands. */
export const drawHarryGrossBack = (c: Ctx, W: number, H: number) => grossBackdrop(c, W, H, ['#1E2A3A', '#2E3E52', '#4A5A6A', '#6E7A80', '#8A8E86']);
