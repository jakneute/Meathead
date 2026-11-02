// CON-FUCK-TIOUS's GROSS-UP (the owner: "do a 'gross up' of every meetup with him holding the armor piece he will give
// you. he's doing an animation related to the item you will get"; the standing rule: grotesque Ren & Stimpy close-ups,
// grossKit.ts). One face for every land; each armor piece brings its own prop and its own animation (PROPS below).
//
// The face (the owner: "just a buff generic japanese american man... like an older mentor"; "an american gym rat from
// 'whereever, usa'"): a Japanese American gym rat in his fifties or sixties, huge in frame. A square head on a neck as
// wide as it, roped with veins; traps sloping out to the edges of the screen, the cut-off tank top's straps biting into
// them, gray chest hair out of its scoop; a gray buzz cut, a heavy furrowed brow (a scar through one eyebrow), narrow
// bloodshot eyes with bags under them; a nose broken more than once (the bump, the bend, the nostrils flared); a
// cauliflower ear; a short gray goatee and a gray shadow over the jaw; the smirk, a gold tooth; sweat on his scalp,
// pores, grease. Painted once (a stamp per mouth: shut, talking); the props baked once each; the live bits (the props'
// moves, a bead of sweat, the toothpick wagging) drawn over each frame.
//
// THE PIECES' PROPS (add one per piece as the lands get their meetups):
//   hands: the giant white four-finger cartoon gloves, on him: a beatdown flurry at the camera, left, right, left,
//          the motion lines, a jolt each time one lands.
//   pauldrons: the COCO-NUTS strapped on his traps: he shoulder-barges the camera, one shoulder then the other, the
//          coconut looming up at the lens, the motion lines, a jolt as it lands.
//   helmet: the KEGGER HELMET on his head (the silver plastic dome, the gold plastic horns, the flag patch, a beer can
//          in a foam holder each side, the bendy straw from the near one down outside his cheek into the corner of his
//          mouth): he chugs through the straw (the beer going up it in gulps), then HEADBUTTS the camera (the whole face
//          lunging at the lens, the BONK's stars off the dome), and chugs again.

import {
  type Ctx, type Buf, GH, R, hexU, WHITE, newBuf, setSeed, rnd, matAt, plot, seg, path, ball, tint, poly, bead, eyeball, teeth, skinPost, stubble, hairs, vein, stamps, drawGrossStamp, grossBackdrop, toCanvas, M_SKIN, M_HAIR, M_MOUTH, M_OTHER, M_CLOTH, M_METAL, SCLERA_R, MOUTH, TONGUE, VEIN_B, BLOOD,
} from '../../grossKit';
import type { ArmorPiece } from '../state';

const FX = 150, FY = 92;

const SKIN = R('#FCE0BE', '#EEC496', '#DCA674', '#C48858', '#A66C42', '#82502E', '#5A341C', '#341A0A');
const GRAY = R('#F2F2F6', '#D2D2DA', '#AEAEBA', '#8A8A98', '#646474', '#3A3A48');
const IRIS = R('#9A7048', '#7A522E', '#5A381A', '#40240C', '#281404', '#140800');
const LIP = R('#E2A080', '#C88264', '#AC6650', '#8C4C3A', '#683226', '#3A1610');
const TANK = R('#C8C8D0', '#A8A8B4', '#8A8A98', '#6C6C7C', '#50505E', '#2A2A36');
const GLOVE = R('#FFFFFF', '#F6F6FA', '#E2E2EC', '#C6C6D6', '#9C9CB4', '#2A2438');
/** The coconut's husk, its white meat, the leopard trim, the plastic tusk, the strap. */
const COCO = R('#A8784A', '#8A5C34', '#6E4424', '#523018', '#3A200E', '#1E0E04');
const MEAT = R('#FFFFFF', '#FAF6EA', '#ECE4CE', '#D6CAAA', '#A89A78', '#4A3E26');
const LEO = R('#FCE6A8', '#F0CC78', '#DCAE52', '#BC8C36', '#8A6020', '#3A2408');
const TUSK = R('#FFFFFF', '#F4F4F8', '#E0E0E8', '#C4C4D0', '#9A9AA8', '#3A3A48');
const STRAP = R('#9A6A3A', '#7A4E26', '#5E3A1A', '#442810', '#2C1808', '#140A02');

type Key = 'a' | 'b';

function* build(key: Key): Generator<void, Buf> {
  setSeed(4243);
  const b = newBuf();
  yield;
  // ---- the traps and shoulders, out to the edges; the tank top's straps; its scoop and the gray chest hair
  poly(b, [-10, GH, 282, GH, 282, 168, FX + 70, 140, FX + 40, 128, FX - 40, 128, FX - 70, 140, -10, 168], SKIN.slice(1), M_SKIN, { tilt: 0.25 });
  for (const s of [-1, 1]) {
    poly(b, [FX + s * 60, 142, FX + s * 84, 150, FX + s * 74, GH, FX + s * 48, GH], TANK, M_CLOTH, { tilt: -0.2 * s });
    // (the strap biting into the meat either side of it)
    path(b, [FX + s * 58, 144, FX + s * 46, GH], SKIN[5], 1, undefined, M_SKIN); path(b, [FX + s * 86, 152, FX + s * 76, GH], SKIN[5], 1, undefined, M_SKIN);
  }
  poly(b, [FX - 48, GH, FX + 48, GH, FX + 54, 196, FX - 54, 196], TANK, M_CLOTH, { tilt: 0 });
  for (let k = 0; k < 70; k++) { const x = FX - 34 + rnd() * 68, y = 176 + rnd() * 20; if (matAt(b, x, y) === M_SKIN) seg(b, x, y, x + (rnd() - 0.5) * 4, y - 3, GRAY[(k % 3) + 1]); }
  yield;
  // ---- the neck: as wide as his head, the cords down it, a vein up each side
  ball(b, FX, 150, 56, 40, SKIN, { mat: M_SKIN, line: (dx) => Math.abs(dx) > 0.8, flat: 0.8 });
  for (const s of [-1, 1]) { path(b, [FX + s * 30, 128, FX + s * 40, 160, FX + s * 50, 186], SKIN[5], 2, undefined, M_SKIN); vein(b, [FX + s * 44, 124, FX + s * 48, 142, FX + s * 44, 160, FX + s * 48, 176], VEIN_B, 2); }
  yield;
  // ---- the ears: the near one a cauliflower (lumps on lumps), the far one just big
  ball(b, FX - 64, 98, 13, 20, SKIN, { mat: M_SKIN, line: true, lw: 1.4 });
  ball(b, FX - 64, 98, 6, 11, SKIN.slice(2), { mat: M_SKIN, flat: 0.5 });
  for (const [dx, dy, r] of [[-4, -10, 7], [2, -2, 6], [-3, 6, 7], [2, 12, 5]] as const) ball(b, FX + 64 + dx, 98 + dy, r, r * 0.9, SKIN, { mat: M_SKIN, line: true, lw: 1.1 });
  yield;
  // ---- the head: square, the jaw wide and heavy
  ball(b, FX, FY - 6, 58, 66, SKIN, { mat: M_SKIN, line: true, lw: 1.6, flat: 0.9 });
  ball(b, FX, 132, 56, 36, SKIN, { mat: M_SKIN, line: (_dx, dy) => dy > 0.1, lw: 1.6, flat: 0.8 });
  yield;
  // ---- the buzz cut: gray stubble over the top, the hairline square across the forehead
  const hairline = (x: number) => 40 + Math.abs(x - FX) * 0.05 + (Math.abs(x - FX) > 46 ? (Math.abs(x - FX) - 46) * 1.4 : 0);
  for (let y = 0; y < 90; y++) for (let x = FX - 60; x <= FX + 60; x++) {
    if (matAt(b, x, y) !== M_SKIN || y > hairline(x)) continue;
    const h = rnd();
    if (h < 0.55) plot(b, x, y, GRAY[h < 0.2 ? 2 : h < 0.4 ? 3 : 4], M_HAIR);
  }
  yield;
  // ---- the brow: a heavy ridge, furrows up between the eyes and across the forehead, short gray brows, a scar
  ball(b, FX, 70, 52, 11, SKIN, { mat: M_SKIN, flat: 0.6, lit: 1.05 });
  for (const s of [-1, 1]) hairs(b, 60, () => [FX + s * (10 + rnd() * 30), 66 + rnd() * 5], 4, s > 0 ? -0.2 : Math.PI + 0.2, GRAY[3], undefined, 0.5);
  for (let k = -1; k <= 1; k++) path(b, [FX + k * 4, 56, FX + k * 5, 66, FX + k * 3, 74], SKIN[6], 1, undefined, M_SKIN);
  for (let k = 0; k < 3; k++) path(b, [FX - 30, 46 + k * 6, FX, 44 + k * 6, FX + 30, 46 + k * 6], SKIN[5], 1, undefined, M_SKIN);
  seg(b, FX - 26, 60, FX - 20, 76, SKIN[1], 2); seg(b, FX - 27, 60, FX - 21, 76, SKIN[6], 1);
  yield;
  // ---- the eyes: narrow, bloodshot, bags under them, crow's feet
  for (const s of [-1, 1]) {
    const ex = FX + s * 26, ey = 84;
    eyeball(b, ex, ey, { rx: 11, ry: 7, sclera: SCLERA_R, iris: IRIS, ir: 5, idx: -s, pr: 2.4, veins: 12, top: (x) => ey - 3.4 + Math.abs(x - ex) * 0.1, bot: (x) => ey + 3 - Math.abs(x - ex) * 0.06, lid: SKIN.slice(1) });
    for (let k = 0; k < 2; k++) path(b, [ex - 11, ey + 6 + k * 4, ex, ey + 9 + k * 5, ex + 11, ey + 6 + k * 4], SKIN[5 + k], 1, undefined, M_SKIN);
    tint(b, ex, ey + 10, 11, 5, hexU('#6A3A5A'), 0.22, M_SKIN);
    for (let k = -1; k <= 1; k++) path(b, [ex + s * 13, ey + k * 2, ex + s * 22, ey + k * 6], SKIN[6], 1, undefined, M_SKIN);
  }
  yield;
  // ---- the nose: broken, the bridge bent off to one side with a bump on it, the tip fat, the nostrils flared
  path(b, [FX - 2, 84, FX + 4, 96, FX + 2, 104], SKIN[5], 3, undefined, M_SKIN);
  ball(b, FX + 4, 96, 6, 5, SKIN, { mat: M_SKIN, lit: 1.1 });
  ball(b, FX + 3, 114, 19, 14, SKIN, { mat: M_SKIN, line: (_dx, dy) => dy > 0, lit: 1.08 });
  for (const s of [-1, 1]) { ball(b, FX + 3 + s * 10, 121, 5.4, 3.6, R('#3A1A0E', '#2A1008', '#1A0804', '#0A0200'), { mat: M_OTHER }); hairs(b, 4, () => [FX + 3 + s * 10 + (rnd() - 0.5) * 4, 123], 4, Math.PI / 2, GRAY[2], undefined, 0.8); }
  plot(b, FX - 3, 106, WHITE); plot(b, FX - 2, 106, WHITE); plot(b, FX - 3, 107, WHITE);
  yield;
  // ---- the mouth: the smirk off to one side (talking: open), a gold tooth
  const open = key === 'b';
  const cx = FX + 5, cy = 144, mw = 24, mh = open ? 9 : 3;
  const top = (x: number) => cy - mh * 0.4 - (x - cx) * 0.12;
  const bot = (x: number) => cy + mh * (1 - ((x - cx) / mw) ** 2) - (x - cx) * 0.12;
  for (let x = cx - mw; x <= cx + mw; x++) for (let y = Math.floor(top(x)) - 3; y <= bot(x) + 3; y++) {
    if (y < top(x) - 2.5 || y > bot(x) + 2.5) continue;
    const lip = y < top(x) || y > bot(x);
    plot(b, x, y, lip ? LIP[y < top(x) ? 3 : 2] : MOUTH[Math.min(4, Math.round(((y - top(x)) / Math.max(1, bot(x) - top(x))) * 4))], lip ? M_OTHER : M_MOUTH);
  }
  teeth(b, cx - mw + 4, cx + mw - 4, (x) => top(x) + 0.5, 1, open ? 6 : 3, { tw: 5, gold: [6], rot: [2] });
  if (open) { teeth(b, cx - mw + 8, cx + mw - 8, (x) => bot(x) - 0.5, -1, 4, { tw: 5, gaps: [2] }); ball(b, cx + 4, cy + mh - 3, 10, 4, TONGUE, { only: (x, y) => matAt(b, x, y) === M_MOUTH }); }
  yield;
  // ---- the goatee: short, gray, dense round the mouth and down the chin; a gray shadow over the rest of the jaw
  for (let k = 0; k < 900; k++) {
    const a = rnd() * Math.PI * 2, r = rnd();
    const x = cx + Math.cos(a) * (mw + 8) * r * 1.05, y = cy + 6 + Math.sin(a) * 26 * r;
    if (y < cy - 8 && Math.abs(x - cx) < mw - 4) continue;
    if (matAt(b, x, y) !== M_SKIN) continue;
    seg(b, x, y, x + (rnd() - 0.5) * 2, y + 2, GRAY[1 + (k % 3)], 1, M_HAIR);
  }
  stubble(b, (x, y) => (y > 112 ? 1 - Math.abs(x - FX) / 70 : 0), GRAY[4], 0.4);
  yield;
  // ---- the pores (thick on the nose), blackheads, grease; a vein up his temple; a shaving nick
  skinPost(b, SKIN[7], (x, y) => (((x - FX - 3) / 22) ** 2 + ((y - 112) / 16) ** 2 < 1 ? 0.22 : 0.06), { blackheads: (x, y) => ((x - FX - 3) / 20) ** 2 + ((y - 112) / 14) ** 2 < 1, shine: 0.22 });
  vein(b, [FX + 44, 50, FX + 48, 62, FX + 44, 74], VEIN_B, 2);
  seg(b, FX + 34, 160, FX + 38, 158, BLOOD[2]); plot(b, FX + 37, 161, BLOOD[3]);
  yield;
  // ---- sweat on the scalp and the brow; the cheeks ruddy from the last set
  for (let k = 0; k < 10; k++) { const x = FX - 44 + rnd() * 88, y = 20 + rnd() * 44; if (matAt(b, x, y) === M_SKIN || matAt(b, x, y) === M_HAIR) bead(b, x, y, 1.4 + rnd() * 1.4, SKIN); }
  for (const s of [-1, 1]) tint(b, FX + s * 40, 116, 16, 12, hexU('#D85A4A'), 0.2, M_SKIN);
  return b;
}

const face = stamps<Key>(build, ['a', 'b']);

// ---------------------------------------------------------------------------------------------------------------
// The pieces' props (baked once each into a canvas of their own)

/** A balled white cartoon glove, its knuckles to the camera (three fat fingers and the thumb over them, the rolled
 *  cuff behind), painted into a buffer of its own: the canvas, and the box it's in. */
const GLOVE_W = 96, GLOVE_H = 92;
let gloveCv: HTMLCanvasElement | null | undefined;
const gloveCanvas = () => {
  if (gloveCv !== undefined) return gloveCv;
  setSeed(777);
  const b = newBuf();
  const gx = 48, gy = 48;
  // (the cuff, rolled, behind)
  ball(b, gx + 18, gy + 26, 30, 18, GLOVE, { mat: M_OTHER, line: true, lw: 1.6, flat: 0.6 });
  for (let k = 0; k < 3; k++) path(b, [gx - 6 + k * 10, gy + 14, gx + 2 + k * 12, gy + 38], GLOVE[3], 1, undefined, M_OTHER);
  // (the fist)
  ball(b, gx, gy, 40, 36, GLOVE, { mat: M_OTHER, line: true, lw: 1.8 });
  // (three fat curled fingers across its top)
  for (let i = 0; i < 3; i++) ball(b, gx - 22 + i * 21, gy - 18, 12, 14, GLOVE, { mat: M_OTHER, line: true, lw: 1.4 });
  // (the thumb across the front)
  ball(b, gx + 2, gy + 10, 22, 11, GLOVE, { mat: M_OTHER, line: true, lw: 1.4, flat: 0.7 });
  // (the creases: deep between the fingers, folds across each finger's knuckle, wrinkles over the thumb's bend)
  for (let i = 0; i < 2; i++) path(b, [gx - 12 + i * 21, gy - 30, gx - 11 + i * 21, gy - 18, gx - 12 + i * 21, gy - 8], GLOVE[4], 2, undefined, M_OTHER);
  for (let i = 0; i < 3; i++) { path(b, [gx - 28 + i * 21, gy - 14, gx - 22 + i * 21, gy - 12, gx - 16 + i * 21, gy - 14], GLOVE[3], 1, undefined, M_OTHER); path(b, [gx - 27 + i * 21, gy - 23, gx - 22 + i * 21, gy - 25], GLOVE[3], 1, undefined, M_OTHER); }
  for (let k = 0; k < 3; k++) path(b, [gx - 14 + k * 6, gy + 4, gx - 12 + k * 6, gy + 8], GLOVE[3], 1, undefined, M_OTHER);
  path(b, [gx - 20, gy + 18, gx, gy + 21, gx + 20, gy + 17], GLOVE[3], 1, undefined, M_OTHER);
  // (scuffs: it's been used; somebody's blood flecked across the knuckles, dried brown in the creases)
  tint(b, gx + 18, gy - 4, 8, 6, hexU('#C8B89A'), 0.35, M_OTHER); tint(b, gx - 26, gy + 16, 6, 4, hexU('#A89A86'), 0.3, M_OTHER);
  tint(b, gx - 2, gy - 22, 12, 6, hexU('#C8B49A'), 0.3, M_OTHER);
  for (const [x, y, r] of [[-16, -26, 2], [-9, -28, 1], [4, -24, 1.4], [14, -29, 1], [22, -20, 1.6], [-24, -16, 1]] as const) { ball(b, gx + x, gy + y, r, r, BLOOD.slice(1), { mat: M_OTHER }); plot(b, gx + x + 1, gy + y + r + 1, BLOOD[3]); }
  for (let i = 0; i < 2; i++) path(b, [gx - 12 + i * 21, gy - 22, gx - 11 + i * 21, gy - 16], BLOOD[4], 1, undefined, M_OTHER);
  plot(b, gx - 28, gy - 26, WHITE); plot(b, gx - 27, gy - 26, WHITE); plot(b, gx - 28, gy - 25, WHITE);
  const cv = toCanvas(b);
  if (!cv) { gloveCv = null; return null; }
  // (just its corner of the buffer)
  const out = document.createElement('canvas'); out.width = GLOVE_W; out.height = GLOVE_H;
  const g = out.getContext('2d')!; g.drawImage(cv, 0, 0, GLOVE_W, GLOVE_H, 0, 0, GLOVE_W, GLOVE_H);
  // (the buffer's empty pixels are clear already: its alpha's 0 where nothing was painted)
  gloveCv = out;
  return out;
};

/** A COCO-NUT (the pauldron), its shell to the camera: the hairy husk's dome (its three eyes), the white meat round
 *  its rim, the gift-shop leopard trim strapped under it, the plastic tusk glued up off its top (the glue's blob), the
 *  leather strap down off it; painted into a buffer of its own: the canvas, and the box it's in. */
const PAD_W = 104, PAD_H = 96;
let padCv: HTMLCanvasElement | null | undefined;
const padCanvas = () => {
  if (padCv !== undefined) return padCv;
  setSeed(9119);
  const b = newBuf();
  const cx = 50, cy = 56;
  // (the strap down off it behind, its stitching)
  poly(b, [cx - 30, cy + 8, cx - 18, cy + 8, cx - 22, PAD_H, cx - 36, PAD_H], STRAP, M_CLOTH, { line: true, tilt: 0.3 });
  for (let y = cy + 12; y < PAD_H - 2; y += 4) plot(b, cx - 27 + (y - cy) * -0.15, y, STRAP[0], M_CLOTH);
  // (the husk: a dome, hair over it)
  ball(b, cx, cy, 40, 36, COCO, { mat: M_OTHER, line: true, lw: 1.8, only: (_x, y) => y < cy + 6, flat: 0.85 });
  for (let k = 0; k < 520; k++) {
    const a = Math.PI + rnd() * Math.PI, r = Math.sqrt(rnd()) * 0.95, x = cx + Math.cos(a) * 40 * r, y = cy + Math.sin(a) * 36 * r;
    if (matAt(b, x, y) !== M_OTHER || y > cy + 3) continue;
    const ang = a + (rnd() - 0.5) * 1.2, l = 2 + rnd() * 3;
    seg(b, x, y, x + Math.cos(ang) * l, y + Math.sin(ang) * l, COCO[rnd() < 0.3 ? 0 : rnd() < 0.5 ? 3 : 4], 1, M_OTHER);
  }
  // (the fibres frayed out past its outline, the three eyes up its crown)
  hairs(b, 40, () => { const a = Math.PI * (1.05 + rnd() * 0.9); return [cx + Math.cos(a) * 39, cy + Math.sin(a) * 35]; }, 4, -Math.PI / 2, COCO[2], undefined, 1.2);
  for (const [ex, ey] of [[-6, -26], [4, -28], [-1, -19]] as const) { ball(b, cx + ex, cy + ey, 3.2, 2.6, R('#2A1608', '#180A02', '#0A0400', '#000000'), { mat: M_OTHER }); plot(b, cx + ex - 1, cy + ey - 1, COCO[1]); }
  // (the white meat round the rim, a brown skin line through it)
  ball(b, cx, cy + 6, 41, 6, MEAT, { mat: M_OTHER, line: true, lw: 1.2, flat: 0.6 });
  path(b, [cx - 38, cy + 6, cx, cy + 8, cx + 38, cy + 6], COCO[3], 1, undefined, M_OTHER);
  // (the leopard trim under it: tan fake fur, the spots, a band)
  poly(b, [cx - 40, cy + 9, cx + 40, cy + 9, cx + 37, cy + 20, cx - 37, cy + 20], LEO, M_CLOTH, { line: true, tilt: 0 });
  for (let k = 0; k < 16; k++) {
    const x = cx - 34 + k * 4.4 + (k % 2) * 1.5, y = cy + 12 + (k % 3) * 2.4;
    ball(b, x, y, 2.2, 1.6, R('#3A2408', '#2A1804', '#1A0E02', '#0A0400'), { mat: M_CLOTH });
    plot(b, x + 1, y, LEO[3]);
  }
  for (let k = 0; k < 60; k++) { const x = cx - 38 + rnd() * 76; seg(b, x, cy + 20, x + (rnd() - 0.5) * 2, cy + 22.5, LEO[2], 1, M_CLOTH); }
  // (the plastic tusk, glued up off the top: curving up and out, thick at the root, its mould seam, a shine)
  for (let i = 0; i <= 14; i++) {
    const t = i / 14, x = cx + 14 + t * 30 - t * t * 6, y = cy - 22 - t * 26 - t * t * 10, r = 6.5 * (1 - t) + 1.2;
    ball(b, x, y, r, r, TUSK, { mat: M_OTHER, line: true, lw: 1 });
  }
  path(b, [cx + 18, cy - 26, cx + 30, cy - 38, cx + 38, cy - 50], TUSK[0], 1, undefined, M_OTHER);
  // (the glue: a clear blob at the tusk's root, a string of it)
  tint(b, cx + 15, cy - 21, 9, 5, hexU('#E8F4FF'), 0.55, M_OTHER);
  plot(b, cx + 11, cy - 23, WHITE); plot(b, cx + 12, cy - 23, WHITE); seg(b, cx + 20, cy - 18, cx + 22, cy - 12, hexU('#D8ECFA'));
  // (the price sticker it still has on)
  ball(b, cx - 20, cy - 8, 6, 4, R('#FF9A3A', '#F07A1A', '#C85A0A', '#8A3A04', '#3A1400'), { mat: M_OTHER, line: true, lw: 1 });
  seg(b, cx - 23, cy - 8, cx - 17, cy - 8, hexU('#3A1400'));
  const cv = toCanvas(b);
  if (!cv) { padCv = null; return null; }
  const out = document.createElement('canvas'); out.width = PAD_W; out.height = PAD_H;
  out.getContext('2d')!.drawImage(cv, 0, 0, PAD_W, PAD_H, 0, 0, PAD_W, PAD_H);
  padCv = out;
  return out;
};

/** The KEGGER HELMET on his head, painted in the face's own buffer coordinates (a buffer of its own: drawn straight over
 *  the face): the far horn and its can behind, the dome and its band, the brim on his hairline (clear of his brow), the
 *  flag patch, the near horn and its can, the straw down from the near can (his left) outside the cheek to the corner of
 *  his mouth. */
const HPLAST = R('#FFFFFF', '#E8EAEE', '#CDD1D8', '#A6ACB6', '#7C838E', '#2E3440');
const HHORN = R('#FFF6CC', '#F7E08E', '#E3C25A', '#C29A3A', '#8A6420', '#3A2A08');
const HCANR = R('#F87171', '#DC2626', '#B91C1C', '#991B1B', '#6E1414', '#2A0404');
const HCANB = R('#BFDBFE', '#60A5FA', '#2563EB', '#1D4ED8', '#12307A', '#081436');
const HFOAM = R('#4A4A52', '#34343A', '#26262C', '#1A1A1E', '#0E0E12', '#000000');
const HALU = R('#FFFFFF', '#E4E4EA', '#BCBCC6', '#8E8E9A', '#5E5E6A', '#22222A');
const HSTRIPE = R('#FFFFFF', '#FFFFFF', '#F2F2F2', '#E0E0E0', '#C8C8C8', '#6A6A6A');
const HFLAG = R('#F04A5E', '#D81E3A', '#C8102E', '#A80C26', '#7A081A', '#3A040C');
const HSTICK = R('#FFE08A', '#FFC93A', '#E8A010', '#B87A04', '#7A5000', '#3A2400');
const HBLUE = hexU('#1D4ED8');
/** The straw's points (buffer), the can's top to his mouth's corner. */
const STRAW: [number, number][] = [[FX - 84, 70], [FX - 88, 56], [FX - 92, 64], [FX - 84, 104], [FX - 62, 136], [FX - 24, 146]];
let helmCv: HTMLCanvasElement | null | undefined;
const helmCanvas = () => {
  if (helmCv !== undefined) return helmCv;
  setSeed(5150);
  const b = newBuf();
  // (a horn: out of the dome's side, curving out and up to a point; a mould seam; its plastic ring at the root)
  const horn = (s: number) => {
    // (one smooth shape: its outer and inner edges off the curve, the tip a point; shaded across, a shine down it)
    const N = 18, out: number[] = [], inn: number[] = [];
    const at = (t: number) => [FX + s * (52 + t * 46 + t * t * 8), 42 - t * 10 - t * t * 32] as const;
    for (let i = 0; i <= N; i++) {
      const t = i / N, [x, y] = at(t), [x2, y2] = at(Math.min(1, t + 0.02)), [x1, y1] = at(Math.max(0, t - 0.02));
      const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, r = 10 * (1 - t) ** 0.9 + 0.6;
      out.push(x + nx * r, y + ny * r); inn.unshift(x - nx * r, y - ny * r);
    }
    poly(b, [...out, ...inn], HHORN, M_OTHER, { line: true, tilt: -s * 0.9 });
    for (let i = 2; i < N - 2; i++) { const t = i / N, [x, y] = at(t), [x2] = at(t + 0.05); plot(b, x + (x2 > x ? -2 : 2) * (1 - t), y - 3 * (1 - t), WHITE, M_OTHER); }
    // (the ridges moulded round its root, the plastic collar it's glued into)
    for (let k = 1; k < 4; k++) { const [x, y] = at(k * 0.08); seg(b, x - 7, y - 4 * s * 0, x + 7, y + 2, HHORN[4], 1, M_OTHER, M_OTHER); }
    ball(b, FX + s * 54, 44, 8, 6, HPLAST.slice(2), { mat: M_OTHER, line: true, lw: 1 });
  };
  // (a can in its foam holder, hung off the brim's strap by the ear)
  const can = (s: number, ramp: number[]) => {
    const x = FX + s * 82;
    seg(b, x - s * 4, 66, FX + s * 66, 52, HFOAM[3], 3, M_CLOTH);
    poly(b, [x - 11, 66, x + 11, 66, x + 11, 104, x - 11, 104], ramp, M_METAL, { line: true, tilt: s * 0.6 });
    ball(b, x, 66, 11, 3.4, HALU, { mat: M_METAL, line: true, lw: 1 });
    plot(b, x - 3, 65, WHITE); seg(b, x - 1, 66, x + 4, 66, HALU[4]);
    poly(b, [x - 11, 80, x + 11, 80, x + 11, 84, x - 11, 84], HSTRIPE, M_METAL, { line: false, tilt: 0 });
    poly(b, [x - 13, 88, x + 13, 88, x + 13, 108, x - 13, 108], HFOAM, M_CLOTH, { line: true, tilt: 0.2 });
    for (let k = 0; k < 40; k++) plot(b, x - 12 + rnd() * 24, 89 + rnd() * 18, HFOAM[rnd() < 0.5 ? 0 : 3], M_CLOTH, M_CLOTH);
  };
  horn(1); can(1, HCANB);
  // (the dome: silver plastic over his scalp, flat-lit, a hard white shine; the moulded band over its top, fake rivets)
  ball(b, FX, 52, 66, 48, HPLAST, { mat: M_OTHER, line: true, lw: 1.6, only: (_x, y) => y < 52, flat: 0.75 });
  poly(b, [FX - 7, 6, FX + 7, 6, FX + 8, 52, FX - 8, 52], HPLAST.slice(1), M_OTHER, { line: true, tilt: 0.6 });
  for (let y = 12; y < 50; y += 8) { ball(b, FX, y, 2, 2, HPLAST, { mat: M_OTHER, line: true, lw: 0.8 }); plot(b, FX - 1, y - 1, WHITE); }
  for (let k = 0; k < 14; k++) seg(b, FX - 40 + k, 18 - k * 0.3, FX - 28 + k, 14 - k * 0.3, WHITE, 1, M_OTHER, M_OTHER);
  // (the brim on his hairline, its stitched edge, scuffs)
  poly(b, [FX - 70, 44, FX + 70, 44, FX + 72, 58, FX - 72, 58], HPLAST, M_OTHER, { line: true, tilt: 0 });
  for (let x = FX - 64; x < FX + 64; x += 6) plot(b, x, 51, WHITE, M_OTHER);
  for (let k = 0; k < 10; k++) { const x = FX - 60 + rnd() * 120, y = 46 + rnd() * 10; seg(b, x, y, x + 3, y, HPLAST[4], 1, M_OTHER, M_OTHER); }
  // (the flag patch, stitched on crooked: a Nordic cross, red, white, blue)
  const fx0 = FX - 44, fy0 = 22;
  poly(b, [fx0, fy0 + 2, fx0 + 26, fy0, fx0 + 27, fy0 + 17, fx0 + 1, fy0 + 19], HSTRIPE, M_CLOTH, { line: true, tilt: 0 });
  poly(b, [fx0 + 2, fy0 + 3, fx0 + 25, fy0 + 1.5, fx0 + 25.5, fy0 + 15.5, fx0 + 2.5, fy0 + 17], HFLAG, M_CLOTH, { line: false, tilt: 0 });
  for (let y = fy0 + 1; y < fy0 + 18; y++) { plot(b, fx0 + 9, y, WHITE, M_CLOTH, M_CLOTH); plot(b, fx0 + 10, y, HBLUE, M_CLOTH, M_CLOTH); plot(b, fx0 + 11, y, HBLUE, M_CLOTH, M_CLOTH); plot(b, fx0 + 12, y, WHITE, M_CLOTH, M_CLOTH); }
  for (let x = fx0 + 1; x < fx0 + 27; x++) { const y = fy0 + 8 - (x - fx0) * 0.07; plot(b, x, y, WHITE, M_CLOTH, M_CLOTH); plot(b, x, y + 1, HBLUE, M_CLOTH, M_CLOTH); plot(b, x, y + 2, HBLUE, M_CLOTH, M_CLOTH); plot(b, x, y + 3, WHITE, M_CLOTH, M_CLOTH); }
  for (let k = 0; k < 9; k++) { plot(b, fx0 + k * 3, fy0 + 1 - k * 0.07, HPLAST[4], M_CLOTH); plot(b, fx0 + 1 + k * 3, fy0 + 19 - k * 0.07, HPLAST[4], M_CLOTH); }
  // (the price sticker still on the brim)
  ball(b, FX + 40, 50, 7, 4, HSTICK, { mat: M_OTHER, line: true, lw: 1 });
  seg(b, FX + 36, 50, FX + 44, 50, HSTICK[5]);
  horn(-1); can(-1, HCANR);
  // (the straw: white, the red stripe winding down it, the bendy bit's ridges at the bend; outside his cheek)
  for (let i = 1; i < STRAW.length; i++) { const [x0, y0] = STRAW[i - 1], [x1, y1] = STRAW[i]; seg(b, x0, y0, x1, y1, hexU('#2A1A1A'), 4, M_OTHER); }
  for (let i = 1; i < STRAW.length; i++) {
    const [x0, y0] = STRAW[i - 1], [x1, y1] = STRAW[i], n = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
    for (let k = 0; k <= n; k++) { const x = x0 + ((x1 - x0) * k) / n, y = y0 + ((y1 - y0) * k) / n; const red = Math.floor((k + i * 7) / 3) % 2 === 0; seg(b, x, y, x + 0.5, y + 0.5, red ? hexU('#EF4444') : WHITE, 2, M_OTHER); }
  }
  for (let k = 0; k < 4; k++) seg(b, FX - 91 + k * 0.6, 58 + k * 2, FX - 87 + k * 0.6, 58 + k * 2, hexU('#9CA3AF'), 1, M_OTHER);
  helmCv = toCanvas(b);
  return helmCv;
};
/** The chug's gulps up the straw, then the headbutt (frames): a cycle of CHUG then BUTT. */
const CHUG = 84, BUTT = 30;
/** Where along the straw (0 the can, 1 his mouth) a gulp is, `u` 0..1. */
const strawAt = (u: number): [number, number] => {
  const segs = STRAW.length - 1, t = Math.min(segs - 1e-6, u * segs), i = Math.floor(t), k = t - i;
  const [x0, y0] = STRAW[i], [x1, y1] = STRAW[i + 1];
  return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k];
};

type Draw = (c: Ctx, f: number) => void;
/** A piece's prop, drawn in the buffer's own pixels over the face (and a jolt for the screen when it lands). */
interface Prop { draw: Draw; jolt: (f: number) => number; /** Bake its art now (ahead of the close-up). */ warm?: () => void; /** The whole face pushed at the lens (a headbutt): times the zoom. */ zoom?: (f: number) => number }

const FLURRY = 11;
/** A shoulder barge's frames (out at the lens and back, a beat, the other shoulder). */
const BARGE = 26;
const PROPS: Partial<Record<ArmorPiece, Prop>> = {
  hands: {
    // (a beatdown flurry at the camera: each fist in turn out at the lens, bigger as it comes, then back)
    draw: (c, f) => {
      const cv = gloveCanvas();
      if (!cv) return;
      const n = Math.floor(f / FLURRY), u = (f % FLURRY) / FLURRY, out = Math.sin(u * Math.PI);
      for (const side of [0, 1]) {
        const active = n % 2 === side, k = active ? out : 0;
        const rx = side ? 236 : 46, ry = side ? 176 : 170;
        const x = rx + (FX - 14 - rx) * k * 0.7, y = ry + (FY + 40 - ry) * k * 0.7, s = 0.8 + k * 0.9;
        c.save(); c.translate(x, y); if (side) c.scale(-1, 1);
        c.drawImage(cv, -GLOVE_W * s / 2, -GLOVE_H * s / 2, GLOVE_W * s, GLOVE_H * s);
        c.restore();
        // (the motion lines behind the one coming out)
        if (active && out > 0.3) { c.fillStyle = 'rgba(255,255,255,0.7)'; for (let i = 0; i < 4; i++) c.fillRect(Math.round(x + (side ? 30 : -50) + i * 3), Math.round(y - 30 + i * 18), 22, 2); }
      }
    },
    jolt: (f) => ((f % FLURRY) === Math.floor(FLURRY / 2) ? 3 : 0),
    warm: () => { gloveCanvas(); },
  },
  pauldrons: {
    // (a shoulder barge at the camera: one padded shoulder looms up at the lens, then back, then the other)
    draw: (c, f) => {
      const cv = padCanvas();
      if (!cv) return;
      const n = Math.floor(f / BARGE), u = (f % BARGE) / BARGE, out = u < 0.55 ? Math.sin((u / 0.55) * Math.PI) : 0;
      for (const side of [0, 1]) {
        const active = n % 2 === side, k = active ? out : 0;
        const rx = side ? 236 : 44, ry = side ? 150 : 148;
        const x = rx + (FX + (side ? 30 : -30) - rx) * k * 0.5, y = ry + (FY + 70 - ry) * k * 0.4, s = 0.95 + k * 0.85;
        c.save(); c.translate(x, y); if (side) c.scale(-1, 1);
        c.drawImage(cv, -PAD_W * s / 2, -PAD_H * s / 2, PAD_W * s, PAD_H * s);
        c.restore();
        // (the motion lines off the one coming at the lens)
        if (active && out > 0.35) { c.fillStyle = 'rgba(255,240,210,0.7)'; for (let i = 0; i < 4; i++) c.fillRect(Math.round(x + (side ? 44 : -70) + i * 2), Math.round(y - 34 + i * 20), 26, 2); }
      }
    },
    jolt: (f) => ((f % BARGE) === Math.round(BARGE * 0.27) ? 4 : 0),
    warm: () => { padCanvas(); },
  },
  helmet: {
    // (chugging through the straw, gulp by gulp up it, the near can going empty; then the headbutt at the lens (the
    // whole face lunging: zoom), the BONK's stars off the dome)
    draw: (c, f) => {
      const cv = helmCanvas();
      if (!cv) return;
      c.drawImage(cv, 0, 0);
      const t = f % (CHUG + BUTT);
      if (t < CHUG) {
        // (the gulps: amber slugs riding up the straw, a bubble behind each)
        for (let g = 0; g < 3; g++) {
          const u = ((t / CHUG) * 2.2 + g * 0.33) % 1, [x, y] = strawAt(u);
          c.fillStyle = '#E8A21A'; c.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3);
          c.fillStyle = '#FFE08A'; c.fillRect(Math.round(x) - 1, Math.round(y) - 1, 1, 1);
          const [bx, by] = strawAt(Math.max(0, u - 0.04));
          c.fillStyle = '#FFFFFF'; c.fillRect(Math.round(bx), Math.round(by), 1, 1);
        }
        // (the can crumpling in on the last gulps)
        if (t > CHUG - 16) { c.fillStyle = '#5A0A0A'; c.fillRect(FX - 87, 74, 6, 9); c.fillStyle = '#EF4444'; c.fillRect(FX - 86, 75, 2, 2); }
      } else {
        // (the BONK: lines and stars off the dome as it lands)
        const k = (t - CHUG) / BUTT;
        if (k > 0.25 && k < 0.7) {
          c.fillStyle = '#FFFFFF';
          for (let i = 0; i < 8; i++) {
            const side = i < 4 ? 1 : -1, a = (0.04 + (i % 4) * 0.08) * Math.PI, r0 = 70 + k * 24, r1 = r0 + 14;
            for (let s = 0; s < 7; s++) { const r = r0 + ((r1 - r0) * s) / 6; c.fillRect(Math.round(FX + side * Math.cos(a) * r * 1.4), Math.round(56 - Math.sin(a) * r), 2, 2); }
          }
          c.fillStyle = '#FDE047';
          for (const [sx, sy] of [[FX - 104, 14], [FX + 100, 10], [FX - 64, 2], [FX + 58, 0]] as const) { c.fillRect(sx - 1, sy + 4, 3, 9); c.fillRect(sx - 4, sy + 7, 9, 3); c.fillStyle = '#FFFFFF'; c.fillRect(sx, sy + 7, 1, 1); c.fillStyle = '#FDE047'; }
        }
      }
    },
    jolt: (f) => ((f % (CHUG + BUTT)) === CHUG + Math.round(BUTT * 0.3) ? 6 : 0),
    zoom: (f) => {
      const t = f % (CHUG + BUTT);
      if (t < CHUG) return 1;
      const k = (t - CHUG) / BUTT;
      return 1 + 0.32 * (k < 0.3 ? Math.sin(((k / 0.3) * Math.PI) / 2) : Math.cos((((k - 0.3) / 0.7) * Math.PI) / 2));
    },
    warm: () => { helmCanvas(); },
  },
};

/** His gross-up: (cx, cy) where the middle of his face goes on the screen, `zoom` 1 at the hold; `piece` the one he's
 *  holding (its prop and animation over him), `talking` his mouth going. */
export const drawBenGross = (c: Ctx, cx: number, cy: number, zoom: number, f: number, piece: ArmorPiece | null, talking: boolean) => {
  const s = face(talking && f % 12 < 6 ? 'b' : 'a');
  const prop = piece ? PROPS[piece] : undefined;
  drawGrossStamp(c, s.img, cx, cy, FX, FY, zoom * (prop?.zoom?.(f) ?? 1), f, prop?.jolt(f) ?? 0, (box) => {
    // (the toothpick, wagging at the corner of the smirk)
    const w = Math.sin(f * 0.18) * 3;
    for (let i = 0; i < 18; i++) box(FX + 30 + i, 146 - i * 0.4 + (w * i) / 18, 2, 2, i < 2 ? '#B89A5A' : '#EAD8A4');
    // (a bead of sweat down off the dome)
    const u = (f % 150) / 150, sx = FX - 52 + Math.sin(u * 6), sy = 40 + u * 60;
    box(sx, sy, 2, 3, '#FFFFFF'); box(sx + 1, sy + 2, 1, 1, '#B47A4C');
    prop?.draw(c, f);
  });
};
/** Behind him: a basement gym's dim bulb, in bands. */
export const drawBenGrossBack = (c: Ctx, W: number, H: number) => grossBackdrop(c, W, H, ['#1A1208', '#2A1C0C', '#3E2A12', '#56391A', '#704A22']);
/** Paint him ahead (a few ms per idle moment) when his meetup's coming up. */
export const warmBenGross = () => { face.warm(); for (const p of Object.values(PROPS)) p?.warm?.(); };
