// NED THE NECROMANCER'S GROSS-UP (the standing rule for every close-up: "gross ren and stimpy style close ups":
// grossKit.ts): his intros to the refights (park4/refight.ts's card) and his first look in the lot. Three-quarters on,
// too close: a middle-aged nobody of a demon, a hack. The skin a blotchy liver-maroon going gray at the jowls, sweating
// (he's nervous: this is his big break); the comb-over plastered across a scalp shining with grease, the strands
// counted; a Halloween-store wizard's hat (purple polyester, the fold creases still in it, stick-on foil stars, one
// peeling) with a hole cut in it for his one good horn; the other horn snapped off at the root and duct-taped back on,
// crooked. The eyes don't match: the near one huge, bulging and bloodshot, the far one small and lazy, wandering off;
// bags under both. A big wet nose, the nostril hairs out of it in tufts, a blackhead field up the bridge. A weak little
// chin with a soul patch he's proud of. In his mouth a set of plastic vampire fangs (too big, slipping off his own
// yellow teeth), drool off them; a cold sore at the corner. The robe's collar up round his neck, a glow-in-the-dark
// skull printed on it, cracked. Live: the sweat running, the lazy eye wandering, the drool.

import {
  type Ctx, type Buf, GW, GH, R, hexU, newBuf, setSeed, rnd, matAt, ball, tint, poly, path, plot, eyeball, skinPost, stubble, vein, hairs, inkEdges, stamps, drawGrossStamp, grossBackdrop,
  MOUTH, TOOTH, TOOTH_B, SCLERA_R, SCLERA_Y, M_SKIN, M_HAIR, M_MOUTH, M_OTHER, M_CLOTH,
} from '../../grossKit';

const FX = 136, FY = 104;
const SKIN = R('#F4D4CC', '#E2B0A8', '#CC8E88', '#B2706E', '#965658', '#7A4046', '#5E2C36', '#401C26', '#200A12');
const JOWL = R('#D4B4B0', '#BC9894', '#A07C7C', '#866266', '#6A4A52', '#4E343E', '#30202A');
const HAT = R('#B894E8', '#9670D0', '#7650B4', '#5A3896', '#422474', '#2C1450', '#16082C');
const ROBE = R('#9670D0', '#7650B4', '#5A3896', '#422474', '#2C1450', '#16082C');
const HORN = R('#FFF0D8', '#E8D0A8', '#C8AA7C', '#A08458', '#74583A', '#3A2A18');
const TAPE = R('#E8E8EC', '#C8C8D0', '#A0A0AC', '#7A7A88', '#4A4A56');
const HAIR = R('#6A5A50', '#4A3C34', '#30261E', '#1E1610', '#0E0A06');
const IRIS = R('#F4F070', '#D8C830', '#A89418', '#6A5A0A', '#2E2604');
const FANG = R('#FFFFFF', '#F4F4F4', '#DCDCE0', '#B8B8C0', '#8A8A94', '#4A4A54');
const GUMS = R('#FF9AB0', '#F0708C', '#D04C6C', '#A8304E', '#701830', '#380810');
const SORE = R('#FFE8C0', '#F4C890', '#E89870', '#C86450', '#984030', '#5A1A10');
const STAR = R('#FFFDE0', '#FCEB88', '#F2CC44', '#C89A20', '#8A6410');
const SKULL = R('#E8FFD8', '#C8F4B0', '#9CDC88', '#6AB45E', '#3E8040', '#1E4A22');
const SWEAT = hexU('#F4FAFF'), SWEAT_D = hexU('#A8C4DC'), NOSEH = hexU('#1E120A'), INK = hexU('#1A0A10');

type Key = 'a' | 'b';
function* build(key: Key): Generator<void, Buf> {
  setSeed(4421);
  const open = key === 'b';
  const b = newBuf();
  yield;
  // ---- the robe's collar up round the neck: purple polyester, its printed skull (glow-in-the-dark green, cracked)
  poly(b, [0, 164, 80, 150, 130, 186, 140, 204, 0, 204], ROBE, M_CLOTH, { tilt: 0.5 });
  poly(b, [272, 156, 206, 142, 170, 180, 160, 204, 272, 204], ROBE, M_CLOTH, { tilt: -0.4 });
  ball(b, 42, 186, 14, 12, SKULL, { mat: M_OTHER, line: true, lw: 0.8 });
  for (const [x, y] of [[36, 184], [48, 184]] as const) ball(b, x, y, 3, 3, R('#1E4A22', '#0E2A12', '#041006'), { mat: M_OTHER });
  path(b, [36, 194, 40, 192, 44, 194, 48, 192], hexU('#1E4A22'), 1, undefined, M_OTHER);
  for (let k = 0; k < 10; k++) { const x = 30 + rnd() * 26, y = 176 + rnd() * 20; if (matAt(b, x, y) === M_OTHER) path(b, [x, y, x + 2 + rnd() * 3, y + 1 + rnd() * 2], hexU('#5A3896'), 1, undefined, M_OTHER); }
  // (the creases the packet left in it, still there)
  for (let k = 0; k < 4; k++) path(b, [70 + k * 6, 160 + k * 2, 110 + k * 4, 204], ROBE[0], 1, undefined, M_CLOTH);
  yield;
  // ---- the neck: fat, sweaty, a vein up it
  poly(b, [92, 118, 190, 116, 196, 204, 86, 204], JOWL.slice(1), M_SKIN, { tilt: 0.3 });
  vein(b, [116, 204, 120, 176, 112, 150], undefined, 2);
  yield;
  // ---- the face: round, soft, sagging; the jowls hanging over the collar
  poly(b, [62, 60, 150, 30, 214, 56, 232, 104, 222, 142, 190, 172, 130, 176, 86, 150, 62, 108], SKIN, M_SKIN, { tilt: 0.6 });
  ball(b, 148, 100, 84, 74, SKIN, { mat: M_SKIN, soft: 0.45 });
  ball(b, 104, 150, 36, 26, JOWL, { mat: M_SKIN, soft: 0.4 });
  ball(b, 196, 150, 30, 24, JOWL, { mat: M_SKIN, soft: 0.4 });
  // (the blotches: liver spots, a rash)
  for (const [x, y, r] of [[96, 90, 9], [178, 62, 7], [120, 132, 6], [206, 112, 5]] as const) tint(b, x, y, r, r * 0.8, SKIN[6], 0.45, M_SKIN, 0.6);
  yield;
  // ---- the ear: pointed, droopy, a tuft out of it
  poly(b, [66, 96, 30, 70, 42, 118, 64, 128], SKIN.slice(1), M_SKIN, { tilt: -0.3 });
  path(b, [60, 100, 40, 80, 48, 116], SKIN[6], 1);
  hairs(b, 6, () => [52 + rnd() * 4, 104 + rnd() * 4], 9, Math.PI, NOSEH, undefined, 0.8);
  yield;
  // ---- the eyes: the near one huge, bulging, bloodshot yellow; the far one small and lazy, off to the side; the bags
  for (let k = 0; k < 3; k++) ball(b, 176, 110 + k * 7, 34 - k * 3, 14 - k * 2, R('#C88C88', '#A87070', '#8A5458', '#6A3C44'), { mat: M_SKIN, soft: 0.5 });
  eyeball(b, 174, 88, { rx: 28, ry: 22, sclera: SCLERA_Y, iris: IRIS, ir: 9, idx: 4, idy: 2, pr: 4, veins: 26, lid: SKIN, top: x => 70 + (x - 174) * 0.04, bot: x => 104 - ((x - 174) / 28) ** 2 * 4 });
  for (let k = 0; k < 2; k++) ball(b, 108, 100 + k * 6, 18 - k * 2, 8 - k, R('#C88C88', '#A87070', '#8A5458'), { mat: M_SKIN, soft: 0.5 });
  eyeball(b, 108, 88, { rx: 13, ry: 10, sclera: SCLERA_R, iris: IRIS, ir: 5, idx: -6, idy: 3, pr: 2.4, veins: 12, lid: SKIN, top: x => 82 + (x - 108) * 0.1, bot: x => 96 });
  // (the brows: bushy, uneven, one hair long and curling)
  path(b, [150, 60, 174, 54, 202, 62], HAIR[3], 3); path(b, [94, 74, 108, 70, 122, 74], HAIR[3], 2);
  path(b, [200, 60, 210, 52, 214, 58], HAIR[2], 1);
  yield;
  // ---- the nose: big, wet, bulbous; the nostril with its tufts; blackheads up it
  poly(b, [150, 92, 186, 108, 208, 140, 190, 152, 160, 148, 150, 120], SKIN, M_SKIN, { tilt: -0.4 });
  ball(b, 186, 136, 22, 18, SKIN, { mat: M_SKIN, line: (_dx, dy) => dy > 0.2, lit: 1.12 });
  ball(b, 174, 146, 7, 5, R('#5A2830', '#3A1820', '#200A10', '#0A0206'), { mat: M_OTHER });
  ball(b, 198, 146, 5, 4, R('#5A2830', '#3A1820', '#200A10', '#0A0206'), { mat: M_OTHER });
  hairs(b, 9, () => [172 + rnd() * 6, 146 + rnd() * 2], 9, Math.PI / 2, NOSEH, undefined, 0.9);
  hairs(b, 5, () => [197 + rnd() * 3, 147], 7, Math.PI / 2, NOSEH, undefined, 0.8);
  yield;
  // ---- the mouth: a smug little grin ('b': open, talking), his own yellow teeth under a set of plastic vampire fangs
  // that don't fit (slipping, a gap of pink gum plastic); the cold sore at the corner
  const mx0 = 124, mx1 = 208, my = 160, mh = open ? 16 : 6;
  const top = (x: number) => my - 1 + Math.sin(((x - mx0) / (mx1 - mx0)) * Math.PI) * -3;
  const bot = (x: number) => my + mh + Math.sin(((x - mx0) / (mx1 - mx0)) * Math.PI) * (open ? 5 : 2);
  for (let x = mx0; x <= mx1; x++) for (let y = Math.round(top(x)); y <= bot(x); y++) plot(b, x, y, MOUTH[y - top(x) < 2 ? 3 : 4], M_MOUTH);
  // (his own teeth, yellow, under)
  for (let x = mx0 + 6; x < mx1 - 6; x += 6) for (let ty = 0; ty < 5; ty++) for (let tx = 0; tx < 5; tx++) if (matAt(b, x + tx, top(x) + ty + 2) === M_MOUTH) plot(b, x + tx, top(x) + ty + 2, TOOTH_B[tx === 0 ? 0 : tx === 4 ? 3 : 1], M_OTHER);
  // (the fake ones over them: a pink plastic gum strip, slipped down at one end, two big white fangs)
  for (let x = mx0 + 4; x < mx1 - 4; x++) { const y = top(x) + (x > 170 ? 3 : 0); for (let d = 0; d < 3; d++) plot(b, x, y + d, GUMS[d === 0 ? 1 : 3], M_OTHER); }
  for (const fx of [140, 182]) { const y0 = top(fx) + (fx > 170 ? 5 : 2); poly(b, [fx - 4, y0, fx + 4, y0, fx, y0 + (open ? 14 : 10)], FANG, M_OTHER, { line: true, tilt: 0.2 }); }
  for (let x = mx0 - 2; x <= mx1 + 2; x++) { for (let d = 1; d <= 4; d++) plot(b, x, top(x) - d, SKIN[d < 2 ? 7 : 5], M_SKIN); for (let d = 1; d <= 6; d++) plot(b, x, bot(x) + d, SKIN[d < 2 ? 7 : d < 4 ? 3 : 4], M_SKIN); }
  ball(b, mx1 + 4, my + 4, 6, 5, SORE, { line: true, lw: 0.6, mat: M_OTHER });
  void TOOTH;
  yield;
  // ---- the soul patch (his pride); the stubble over the jowls; pores, grease, the sweat beading
  stubble(b, (x, y) => (y > 176 && y < 200 && x > 150 && x < 176 ? 0.9 : y > 150 && (x < 120 || x > 210) ? 0.35 : 0), hexU('#2A1A14'), 0.4);
  hairs(b, 10, () => [158 + rnd() * 14, 180 + rnd() * 6], 10, Math.PI / 2, hexU('#2A1A14'), undefined, 0.3);
  skinPost(b, SKIN[8], (x, y) => (x > 160 && y > 96 && y < 150 ? 0.1 : 0.016), { blackheads: (x, y) => x > 164 && x < 210 && y > 100 && y < 140, shine: 0.2 });
  for (let k = 0; k < 18; k++) { const x = 70 + rnd() * 150, y = 40 + rnd() * 100; if (matAt(b, x, y) !== M_SKIN) continue; plot(b, x, y, SWEAT); plot(b, x, y + 1, SWEAT_D); plot(b, x + 1, y, SWEAT); }
  inkEdges(b, M_SKIN, SKIN[8], [M_OTHER, M_MOUTH, M_HAIR, M_CLOTH]);
  yield;
  // ---- the comb-over: a few long greasy strands combed across from the far side, the scalp shining between
  for (let k = 0; k < 9; k++) {
    const y0 = 52 + k * 3;
    path(b, [62, y0 + 10, 110, y0 - 6, 170, y0 - 10 + (k % 3), 206, y0 + 2], HAIR[k % 2 ? 1 : 3], 1, M_HAIR);
  }
  yield;
  // ---- the hat: a Halloween-store wizard's hat, tilted, cheap purple, its creases; the stick-on stars (one peeling);
  // the hole cut in it for his good horn
  poly(b, [40, 58, 236, 30, 220, 44, 64, 70], HAT, M_CLOTH, { tilt: 0.3, line: true });
  poly(b, [76, 52, 206, 34, 174, -4, 150, -30, 128, -20, 104, 14], HAT, M_CLOTH, { tilt: 0.5, line: true });
  for (let k = 0; k < 5; k++) path(b, [100 + k * 18, 50 - k * 3, 140 + k * 8, -10 + k * 4], HAT[k % 2 ? 0 : 4], 1, undefined, M_CLOTH);
  const star = (cx: number, cy: number, r: number) => { const pts: number[] = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; pts.push(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } poly(b, pts, STAR, M_OTHER, { line: true, tilt: 0.2 }); };
  star(118, 26, 9); star(158, 10, 7); star(182, 38, 8);
  // (the peeling one: its corner up)
  poly(b, [136, 40, 150, 34, 146, 46], STAR, M_OTHER, { line: true });
  path(b, [146, 46, 152, 50], hexU('#8A6410'), 1);
  yield;
  // ---- the horns: the good one up through its hole in the hat; the other snapped off and duct-taped on, crooked
  poly(b, [196, 40, 204, 10, 222, -14, 214, 14, 210, 42], HORN, M_OTHER, { tilt: 0.3, line: true });
  for (let k = 0; k < 4; k++) path(b, [200, 34 - k * 8, 212, 32 - k * 8], HORN[4], 1, undefined, M_OTHER);
  poly(b, [56, 64, 34, 44, 22, 18, 40, 30, 62, 56], HORN, M_OTHER, { tilt: 0.3, line: true });
  poly(b, [44, 58, 64, 46, 70, 58, 50, 70], TAPE, M_OTHER, { tilt: 0.2, line: true });
  path(b, [48, 60, 64, 52], TAPE[0], 1); path(b, [52, 66, 68, 56], TAPE[3], 1);
  yield;
  // (the drool off the fangs, its start)
  plot(b, 182, bot(182) + 6, SWEAT); plot(b, 182, bot(182) + 7, SWEAT_D);
  void INK;
  return b;
}

const get = stamps<Key>(build, ['a', 'b']);

/** His gross-up: (cx, cy) where his middle goes, `zoom` 1 full size; `open` the mouth (talking). */
export const drawNedGross = (c: Ctx, cx: number, cy: number, zoom: number, f: number, open: boolean, jolt = 0) => {
  const s = get(open ? 'b' : 'a');
  drawGrossStamp(c, s.img, cx, cy, FX, FY, zoom, f, jolt, box => {
    // (the sweat running down off the hairline, a bead at a time)
    for (const [x, ph] of [[96, 0], [150, 40], [200, 70]] as const) { const t = ((f + ph) % 110) / 110; box(x, 54 + t * 60, 2, 3, '#F4FAFF'); }
    // (the lazy eye wandering: its iris off one way, then the other)
    const w = Math.sin(f * 0.03) * 3;
    box(100 + w, 88, 6, 6, '#D8C830'); box(102 + w, 90, 2, 2, '#000000');
    // (the drool off the fang)
    const d = (f % 80) / 80;
    box(182, (open ? 184 : 176) + d * d * 22, 2, 3 + d * 3, '#E8F4FF');
  });
};
export const drawNedGrossBack = (c: Ctx, W: number, H: number) => grossBackdrop(c, W, H, ['#12040A', '#240812', '#380C1A', '#4C1220', '#601826']);
export const warmNedGross = () => get.warm();
export { GW as NED_GW, GH as NED_GH };
