// MEHPHISTO'S GROSS-UP (the standing rule for every close-up: "gross ren and stimpy style close ups": grossKit.ts): the
// fight's first look at him, up off his beanbag in the smoke, too close. Three-quarters on, the long gaunt face of a kid
// who's never seen the sun (he lives in hell): lavender-gray, the cheek sunk in to the bone, the jaw hanging slack and
// stubbled with four proud goatee hairs; the hooked nose huge in the middle of it all, a whitehead on its tip ready to
// go, blackheads up the bridge, a ring through the nostril; the one eye you can see (the other's under the hair) a
// half-lidded red, bloodshot to the rim, sunk in a raccoon ring of eyeliner smudged and run down the cheek, the bags
// under it in rings; the black lipstick chipped, a vape in the corner of the mouth, a thread of drool off the lip ring;
// greasy black hair down over half of it in strands, dandruff in it, two little horns poking up out of it (chipped,
// a zit at the root of one); the pointed ear with a gauge in it you could see through; the trench coat's collar up
// round the neck at the bottom, cracked leather. Grease shining over everything.
// Live: the vape's light, the drool, the eye's lid sagging, the whitehead throbbing.

import {
  type Ctx, type Buf, GW, GH, R, hexU, newBuf, setSeed, rnd, matAt, ball, tint, poly, path, plot, eyeball, skinPost, stubble, vein, hairs, inkEdges, stamps, drawGrossStamp, grossBackdrop,
  MOUTH, TOOTH_B, M_SKIN, M_HAIR, M_MOUTH, M_OTHER, M_METAL, M_CLOTH,
} from '../../grossKit';

const FX = 136, FY = 100;
const SKIN = R('#F4EEF6', '#DCD2E2', '#C4B6CE', '#AA9AB8', '#8E7CA0', '#705E84', '#524266', '#342648', '#180E24');
const HAIR = R('#5A5068', '#3A3048', '#241C30', '#16101E', '#0C0812', '#040206');
const HORN = R('#FFF8EC', '#EADCC4', '#CDBA98', '#A8946E', '#7A6646', '#3A2C18');
const LINER = R('#4A3A5A', '#2A1E36', '#180E22', '#0A0410', '#000000');
const BAG = R('#B4A0C4', '#9A82AC', '#7E6694', '#62487A', '#3E2A52');
const IRIS = R('#FF8A7A', '#E8402E', '#B8181C', '#7A0A10', '#3A0206');
const LIPS = R('#5A5066', '#38303E', '#221C28', '#141018', '#060408');
const COAT = R('#5A5462', '#3A3442', '#26222C', '#18151E', '#0E0C12', '#040306');
const METAL = R('#FFFFFF', '#D8D8E0', '#A8A8B6', '#6E6E7C', '#3A3A46');
const VAPE = R('#4A4A56', '#2E2E38', '#1C1C24', '#101016', '#040406');
const ZIT = R('#FFFFF0', '#FFE6E0', '#F4A0A8', '#D85A6A', '#A8304A', '#6A1426');
const VEINS = R('#D8C8F0', '#B49ADC', '#9278C0', '#7058A0', '#4E3A7A', '#201436');
const DROOL = hexU('#E8F4FF'), DROOL_D = hexU('#9AB4D4'), DANDR = hexU('#F8F4FF'), STUB = hexU('#2A1E3A'), INKC = hexU('#0A0610');

type Key = 'a' | 'b';
function* build(key: Key): Generator<void, Buf> {
  setSeed(6661);
  const open = key === 'b';
  const b = newBuf();
  yield;
  // ---- the coat's collar up round the neck: cracked black leather, its seam, a stud
  poly(b, [0, 168, 70, 150, 120, 176, 150, 204, 0, 204], COAT, M_CLOTH, { tilt: 0.5 });
  poly(b, [272, 160, 214, 140, 176, 172, 168, 204, 272, 204], COAT, M_CLOTH, { tilt: -0.4 });
  for (let k = 0; k < 14; k++) { const x = rnd() * 272, y = 160 + rnd() * 44; if (matAt(b, x, y) === M_CLOTH) path(b, [x, y, x + 3 + rnd() * 5, y + 1 + rnd() * 3], COAT[0], 1, undefined, M_CLOTH); }
  ball(b, 52, 176, 3.4, 3.4, METAL, { mat: M_METAL, line: true });
  yield;
  // ---- the neck: thin, long, the cords up it, the adam's apple, a vein
  poly(b, [96, 120, 182, 118, 192, 204, 90, 204], SKIN.slice(3), M_SKIN, { tilt: 0.3 });
  ball(b, 146, 168, 14, 10, SKIN.slice(2), { mat: M_SKIN, soft: 0.4 });
  vein(b, [110, 204, 114, 180, 108, 150], VEINS, 2); vein(b, [176, 204, 172, 176, 178, 150], VEINS, 2);
  yield;
  // ---- the face: long and gaunt, three-quarters on; the jaw slack; the cheek sunk in under the bone
  poly(b, [58, 54, 168, 22, 222, 60, 232, 110, 214, 150, 172, 168, 120, 160, 82, 128, 60, 92], SKIN, M_SKIN, { tilt: 0.6 });
  ball(b, 150, 92, 82, 72, SKIN, { mat: M_SKIN, soft: 0.45 });
  ball(b, 192, 134, 30, 26, SKIN, { mat: M_SKIN, soft: 0.3, lit: 1.05 });
  tint(b, 120, 120, 26, 20, SKIN[6], 0.5, M_SKIN, 0.7);
  path(b, [98, 104, 110, 128, 126, 140], SKIN[7], 1, undefined, M_SKIN);
  yield;
  // ---- the ear: pointed, swept back on the left, the gauge through its lobe (the coat's dark through the hole)
  poly(b, [62, 94, 18, 46, 40, 104, 60, 122], SKIN.slice(1), M_SKIN, { tilt: -0.3 });
  path(b, [56, 98, 30, 62, 44, 104], SKIN[6], 1);
  ball(b, 50, 118, 9, 9, METAL, { mat: M_METAL, line: true });
  ball(b, 50, 118, 6, 6, R('#2A2232', '#1A1420', '#0C0810', '#000000'), { mat: M_METAL });
  yield;
  // ---- the eye (the one you can see): the bags in rings under it, the eyeliner's raccoon ring (smudged, run down the
  // cheek in streaks), the red bloodshot ball, the lid hanging half down over it
  for (let k = 0; k < 3; k++) ball(b, 170, 102 + k * 7, 34 - k * 3, 16 - k * 2, BAG, { mat: M_SKIN, soft: 0.5 });
  ball(b, 168, 84, 34, 24, LINER, { mat: M_OTHER, soft: 0.35 });
  for (let k = 0; k < 5; k++) { let x = 146 + k * 10, y = 100; for (let s = 0; s < 18 + k * 6; s++) { y++; x += (rnd() - 0.5) * 0.9; plot(b, x, y, LINER[2]); if (s % 3 === 0) plot(b, x + 1, y, LINER[1]); } }
  eyeball(b, 168, 84, { rx: 24, ry: 16, iris: IRIS, ir: 8, idx: 4, idy: 3, pr: 3.4, veins: 22, lid: SKIN, top: x => 80 + (x - 168) * 0.05, bot: x => 96 - ((x - 168) / 24) ** 2 * 3 });
  // (crust in the corner of it)
  ball(b, 146, 90, 3, 2.4, R('#FFF8D0', '#F0E0A0', '#C8B070', '#806A3A'), { mat: M_OTHER, line: true, lw: 0.6 });
  // (the brow over it: thin, plucked flat)
  path(b, [140, 58, 168, 52, 198, 58], HAIR[4], 2);
  yield;
  // ---- the nose: huge and hooked, out over the mouth; blackheads up the bridge, the whitehead on its tip, the ring
  poly(b, [200, 66, 226, 98, 246, 134, 232, 146, 212, 140, 206, 106], SKIN, M_SKIN, { tilt: -0.5 });
  ball(b, 230, 134, 18, 14, SKIN, { mat: M_SKIN, line: (_dx, dy) => dy > 0.2, lit: 1.1 });
  ball(b, 218, 142, 6, 4, R('#5A4668', '#3A2A4A', '#20162E', '#0A0614'), { mat: M_OTHER });
  ball(b, 238, 126, 6, 6, ZIT, { line: true, lw: 0.7, mat: M_OTHER });
  for (let a = 0; a < Math.PI * 1.6; a += 0.05) plot(b, 212 + Math.cos(a) * 6, 148 + Math.sin(a) * 6, METAL[a < 0.8 ? 1 : 3], M_METAL);
  yield;
  // ---- the mouth: black lipstick, chipped (the gray under it); slack, a little open ('b': open on a "whatever", the
  // gray teeth, the tongue); the lip ring; the vape in its corner
  const mx0 = 132, mx1 = 206, my = 152, mh = open ? 14 : 3;
  const top = (x: number) => my - 2 + Math.sin(((x - mx0) / (mx1 - mx0)) * Math.PI) * -2;
  const bot = (x: number) => my + mh + Math.sin(((x - mx0) / (mx1 - mx0)) * Math.PI) * (open ? 4 : 1);
  for (let x = mx0; x <= mx1; x++) for (let y = Math.round(top(x)); y <= bot(x); y++) plot(b, x, y, MOUTH[y - top(x) < 2 ? 3 : 4], M_MOUTH);
  if (open) for (let x = mx0 + 8; x < mx1 - 10; x += 7) for (let ty = 0; ty < 5; ty++) for (let tx = 0; tx < 5; tx++) if (matAt(b, x + tx, top(x) + ty + 1) === M_MOUTH) plot(b, x + tx, top(x) + ty + 1, TOOTH_B[tx === 0 ? 0 : tx === 4 ? 3 : 1], M_OTHER);
  for (let x = mx0 - 2; x <= mx1 + 2; x++) { for (let d = 1; d <= 5; d++) plot(b, x, top(x) - d, LIPS[d < 2 ? 4 : d < 4 ? 2 : 1], M_OTHER); for (let d = 1; d <= 7; d++) plot(b, x, bot(x) + d, LIPS[d < 2 ? 4 : d < 5 ? 1 : 2], M_OTHER); }
  for (let k = 0; k < 6; k++) { const x = mx0 + rnd() * (mx1 - mx0), y = bot(x) + 2 + rnd() * 4; plot(b, x, y, SKIN[3]); plot(b, x + 1, y, SKIN[4]); }
  for (let a = 0; a < Math.PI; a += 0.05) plot(b, 174 + Math.cos(a) * 6, bot(174) + 5 + Math.sin(a) * 6, METAL[a < 1.2 ? 1 : 3], M_METAL);
  // (the vape: a slim black stick out of the far corner, its tip toward us)
  path(b, [130, 154, 92, 164], VAPE[4], 7); path(b, [130, 153, 92, 163], VAPE[1], 5); path(b, [130, 151, 94, 161], VAPE[0], 1);
  yield;
  // ---- the stubble and the goatee's hairs; the skin's going over (pores, grease shining); zits
  stubble(b, (x, y) => (y > 158 && y < 176 && x > 150 && x < 214 ? 0.6 : 0), STUB, 0.3);
  hairs(b, 6, () => [168 + rnd() * 20, 166 + rnd() * 4], 12, Math.PI / 2, STUB, undefined, 0.4);
  for (const [x, y, r] of [[110, 132, 4], [196, 40, 3], [122, 70, 3], [204, 160, 3]] as const) { ball(b, x, y, r + 2, r + 1.5, R('#E89AAA', '#D87888', '#B85068', '#8A2A44'), { soft: 0.6, mat: M_OTHER }); ball(b, x, y, r, r, ZIT, { line: true, lw: 0.6, mat: M_OTHER }); }
  skinPost(b, SKIN[8], (x, y) => (x > 196 && y > 90 && y < 150 ? 0.08 : 0.012), { blackheads: (x, y) => x > 196 && y < 130, shine: 0.16 });
  inkEdges(b, M_SKIN, SKIN[8], [M_OTHER, M_MOUTH, M_METAL, M_HAIR]);
  yield;
  // ---- the hair: greasy black, down over the left half of the face in strands to past the jaw, over the far eye; shine
  // on it in bands; dandruff
  poly(b, [40, 30, 120, 0, 200, 4, 206, 30, 170, 40, 150, 34, 140, 60, 126, 54, 118, 92, 104, 84, 96, 128, 84, 116, 78, 150, 66, 120, 54, 70], HAIR, M_HAIR, { tilt: 0.2 });
  for (let k = 0; k < 26; k++) { const x0 = 50 + rnd() * 150, y0 = 4 + rnd() * 30; path(b, [x0, y0, x0 - 6 - rnd() * 10, y0 + 30 + rnd() * 50], HAIR[k % 3 === 0 ? 0 : 4], 1, undefined, M_HAIR); }
  for (let k = 0; k < 30; k++) { const x = 50 + rnd() * 150, y = 6 + rnd() * 90; if (matAt(b, x, y) === M_HAIR) plot(b, x, y, DANDR); }
  yield;
  // ---- the horns: two little ones up out of the hair, chipped, ridged; a zit at the root of the near one
  for (const [x, y, s] of [[96, 40, 0.8], [168, 34, 1]] as const) {
    poly(b, [x - 10 * s, y + 10, x - 6 * s, y - 20 * s, x + 6 * s, y - 34 * s, x + 4 * s, y - 14 * s, x + 12 * s, y + 10], HORN, M_OTHER, { tilt: 0.3 });
    for (let k = 0; k < 4; k++) path(b, [x - 7 * s, y - k * 7 * s, x + 6 * s, y - k * 7 * s - 2], HORN[4], 1, undefined, M_OTHER);
  }
  ball(b, 178, 44, 4, 4, ZIT, { line: true, lw: 0.6, mat: M_OTHER });
  // (the drool's start off the lip ring)
  plot(b, 174, bot(174) + 12, DROOL); plot(b, 174, bot(174) + 13, DROOL_D);
  void INKC;
  return b;
}

const get = stamps<Key>(build, ['a', 'b']);

/** His gross-up: (cx, cy) where his middle goes, `zoom` 1 at the hold; `open` the mouth (talking). */
export const drawSonGross = (c: Ctx, cx: number, cy: number, zoom: number, f: number, open: boolean, jolt = 0) => {
  const s = get(open ? 'b' : 'a');
  drawGrossStamp(c, s.img, cx, cy, FX, FY, zoom, f, jolt, box => {
    // (the whitehead on his nose throbbing)
    const p = 0.5 + 0.5 * Math.sin(f * 0.22);
    box(236, 124, 4, 3, p > 0.6 ? '#FFFFFF' : '#FFF4C8');
    // (the drool off the lip ring, a drop at a time)
    const t = (f % 90) / 90;
    if (t < 0.5) box(174, 170, 2, 4 + t * 16, '#E8F4FF'); else { const d = (t - 0.5) / 0.5; box(174, 170 + d * d * 34, 2, 3, '#E8F4FF'); }
    // (the vape's tip: lit when he drags)
    box(90, 160, 4, 4, Math.floor(f / 24) % 3 === 0 ? '#7DD3FC' : '#1E3A5A');
    // (the lid sagging, now and then, nearly shut)
    if (Math.floor(f / 50) % 3 === 2) box(146, 76, 44, 6, '#AA9AB8');
  });
};
export const drawSonGrossBack = (c: Ctx, W: number, H: number) => grossBackdrop(c, W, H, ['#0C0610', '#1A0C1E', '#2A1028', '#3A1430', '#4A1A30']);
export const warmSonGross = () => get.warm();
export { GW as SON_GW, GH as SON_GH };
