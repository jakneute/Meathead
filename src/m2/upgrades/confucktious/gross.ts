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
//   cape: the CLEARANCE CAPE round his shoulders (the shiny black polyester still creased in squares from the bag, the
//          tall stiff collar up either side of his head, the red lining, a ribbon bow under his chin): he sweeps the front
//          of it up across his face in his fist like a movie vampire (the eyes over it), holds it, drops it; the price
//          tag dangles off the collar on its barb and the sweep flings it flapping across his face.
//   amulet: the PISS-OFF PENDANT dangled off its sequin chain from his fist beside his face, swinging slow like a
//          hypnotist's watch; then he LOSES IT (the face 'c': flushed, eyes bulging, veins out, screaming at the lens),
//          the fist shaking, the jewel thrashing about, steam out of his ears; and back to dangling it.
//   armguards: the BEEF BRACERS, one on his forearm, the fist up beside his face, the red LED scrolling BEEF across its
//          window (the armor's own baked LED strip slid along: no pixel work); then the UPPERCUT at the lens: a dip, and
//          the fist rockets up at the camera, swelling, the motion lines under it, the jolt as it lands; and back up.
//   sabatons: the COWBELL CLODHOPPERS, one dangled off his fist by its pull strap beside his face, swinging, the cowbell
//          under it clanking (ring lines off it); then the STOMP: the boot comes down at the lens heel first out of the
//          top right, swelling, a DONG off the bell, the jolt; and back to dangling it.

import {
  type Ctx, type Buf, GW, GH, R, hexU, WHITE, newBuf, setSeed, rnd, matAt, plot, seg, path, ball, tint, poly, bead, eyeball, teeth, skinPost, stubble, hairs, vein, stamps, drawGrossStamp, grossBackdrop, toCanvas, M_SKIN, M_HAIR, M_MOUTH, M_OTHER, M_CLOTH, M_METAL, SCLERA_R, MOUTH, TONGUE, VEIN_B, BLOOD, GOLD,
} from '../../grossKit';
import type { ArmorPiece } from '../state';
import { drawLed } from '../armorArt';

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

/** 'a' the smirk shut, 'b' talking, 'c' LOSING IT (the PISS-OFF PENDANT's tantrum: flushed purple-red, the eyes bulging,
 *  pinprick pupils, veins up the forehead and the temples, the mouth wide open screaming). */
type Key = 'a' | 'b' | 'c';
/** His skin, losing it: flushed purple-red. */
const SKIN_MAD = R('#FCC6B2', '#F2A28C', '#E07E6C', '#C85E52', '#A8423E', '#80282C', '#58161C', '#300A0E');

function* build(key: Key): Generator<void, Buf> {
  setSeed(4243);
  const b = newBuf();
  const mad = key === 'c', S = mad ? SKIN_MAD : SKIN;
  yield;
  // ---- the traps and shoulders, out to the edges; the tank top's straps; its scoop and the gray chest hair
  poly(b, [-10, GH, 282, GH, 282, 168, FX + 70, 140, FX + 40, 128, FX - 40, 128, FX - 70, 140, -10, 168], S.slice(1), M_SKIN, { tilt: 0.25 });
  for (const s of [-1, 1]) {
    poly(b, [FX + s * 60, 142, FX + s * 84, 150, FX + s * 74, GH, FX + s * 48, GH], TANK, M_CLOTH, { tilt: -0.2 * s });
    // (the strap biting into the meat either side of it)
    path(b, [FX + s * 58, 144, FX + s * 46, GH], S[5], 1, undefined, M_SKIN); path(b, [FX + s * 86, 152, FX + s * 76, GH], S[5], 1, undefined, M_SKIN);
  }
  poly(b, [FX - 48, GH, FX + 48, GH, FX + 54, 196, FX - 54, 196], TANK, M_CLOTH, { tilt: 0 });
  for (let k = 0; k < 70; k++) { const x = FX - 34 + rnd() * 68, y = 176 + rnd() * 20; if (matAt(b, x, y) === M_SKIN) seg(b, x, y, x + (rnd() - 0.5) * 4, y - 3, GRAY[(k % 3) + 1]); }
  yield;
  // ---- the neck: as wide as his head, the cords down it, a vein up each side
  ball(b, FX, 150, 56, 40, S, { mat: M_SKIN, line: (dx) => Math.abs(dx) > 0.8, flat: 0.8 });
  for (const s of [-1, 1]) { path(b, [FX + s * 30, 128, FX + s * 40, 160, FX + s * 50, 186], S[5], 2, undefined, M_SKIN); vein(b, [FX + s * 44, 124, FX + s * 48, 142, FX + s * 44, 160, FX + s * 48, 176], VEIN_B, 2); }
  yield;
  // ---- the ears: the near one a cauliflower (lumps on lumps), the far one just big
  ball(b, FX - 64, 98, 13, 20, S, { mat: M_SKIN, line: true, lw: 1.4 });
  ball(b, FX - 64, 98, 6, 11, S.slice(2), { mat: M_SKIN, flat: 0.5 });
  for (const [dx, dy, r] of [[-4, -10, 7], [2, -2, 6], [-3, 6, 7], [2, 12, 5]] as const) ball(b, FX + 64 + dx, 98 + dy, r, r * 0.9, S, { mat: M_SKIN, line: true, lw: 1.1 });
  yield;
  // ---- the head: square, the jaw wide and heavy
  ball(b, FX, FY - 6, 58, 66, S, { mat: M_SKIN, line: true, lw: 1.6, flat: 0.9 });
  ball(b, FX, 132, 56, 36, S, { mat: M_SKIN, line: (_dx, dy) => dy > 0.1, lw: 1.6, flat: 0.8 });
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
  ball(b, FX, 70, 52, 11, S, { mat: M_SKIN, flat: 0.6, lit: 1.05 });
  for (const s of [-1, 1]) hairs(b, 60, () => [FX + s * (10 + rnd() * 30), 66 + rnd() * 5], 4, s > 0 ? -0.2 : Math.PI + 0.2, GRAY[3], undefined, 0.5);
  for (let k = -1; k <= 1; k++) path(b, [FX + k * 4, 56, FX + k * 5, 66, FX + k * 3, 74], S[6], 1, undefined, M_SKIN);
  for (let k = 0; k < 3; k++) path(b, [FX - 30, 46 + k * 6, FX, 44 + k * 6, FX + 30, 46 + k * 6], S[5], 1, undefined, M_SKIN);
  seg(b, FX - 26, 60, FX - 20, 76, S[1], 2); seg(b, FX - 27, 60, FX - 21, 76, S[6], 1);
  // (losing it: the brow knotted down hard, deep creases up between the eyes)
  if (mad) for (let k = -1; k <= 1; k += 2) { path(b, [FX + k * 3, 50, FX + k * 6, 64, FX + k * 12, 74], S[7], 2, undefined, M_SKIN); path(b, [FX + k * 14, 70, FX + k * 26, 74, FX + k * 38, 70], S[6], 2, undefined, M_SKIN); }
  yield;
  // ---- the eyes: narrow, bloodshot, bags under them, crow's feet
  for (const s of [-1, 1]) {
    const ex = FX + s * 26, ey = 84;
    if (mad) eyeball(b, ex, ey, { rx: 13, ry: 11, sclera: SCLERA_R, iris: IRIS, ir: 3.4, idx: 0, pr: 1, veins: 30, lid: S.slice(1) });
    else eyeball(b, ex, ey, { rx: 11, ry: 7, sclera: SCLERA_R, iris: IRIS, ir: 5, idx: -s, pr: 2.4, veins: 12, top: (x) => ey - 3.4 + Math.abs(x - ex) * 0.1, bot: (x) => ey + 3 - Math.abs(x - ex) * 0.06, lid: S.slice(1) });
    for (let k = 0; k < 2; k++) path(b, [ex - 11, ey + 6 + k * 4, ex, ey + 9 + k * 5, ex + 11, ey + 6 + k * 4], S[5 + k], 1, undefined, M_SKIN);
    tint(b, ex, ey + 10, 11, 5, hexU('#6A3A5A'), 0.22, M_SKIN);
    for (let k = -1; k <= 1; k++) path(b, [ex + s * 13, ey + k * 2, ex + s * 22, ey + k * 6], S[6], 1, undefined, M_SKIN);
  }
  yield;
  // ---- the nose: broken, the bridge bent off to one side with a bump on it, the tip fat, the nostrils flared
  path(b, [FX - 2, 84, FX + 4, 96, FX + 2, 104], S[5], 3, undefined, M_SKIN);
  ball(b, FX + 4, 96, 6, 5, S, { mat: M_SKIN, lit: 1.1 });
  ball(b, FX + 3, 114, 19, 14, S, { mat: M_SKIN, line: (_dx, dy) => dy > 0, lit: 1.08 });
  for (const s of [-1, 1]) { ball(b, FX + 3 + s * 10, 121, 5.4, 3.6, R('#3A1A0E', '#2A1008', '#1A0804', '#0A0200'), { mat: M_OTHER }); hairs(b, 4, () => [FX + 3 + s * 10 + (rnd() - 0.5) * 4, 123], 4, Math.PI / 2, GRAY[2], undefined, 0.8); }
  plot(b, FX - 3, 106, WHITE); plot(b, FX - 2, 106, WHITE); plot(b, FX - 3, 107, WHITE);
  yield;
  // ---- the mouth: the smirk off to one side (talking: open), a gold tooth
  const open = key === 'b';
  const cx = FX + 5, cy = mad ? 140 : 144, mw = mad ? 30 : 24, mh = mad ? 30 : open ? 9 : 3;
  // (screaming: the top lip pulled up off the teeth in a square, the jaw dropped as far as it goes)
  const top = mad ? (x: number) => cy - 6 + ((x - cx) / mw) ** 4 * 6 : (x: number) => cy - mh * 0.4 - (x - cx) * 0.12;
  const bot = mad ? (x: number) => cy + mh * (1 - ((x - cx) / mw) ** 2) ** 0.6 : (x: number) => cy + mh * (1 - ((x - cx) / mw) ** 2) - (x - cx) * 0.12;
  for (let x = cx - mw; x <= cx + mw; x++) for (let y = Math.floor(top(x)) - 3; y <= bot(x) + 3; y++) {
    if (y < top(x) - 2.5 || y > bot(x) + 2.5) continue;
    const lip = y < top(x) || y > bot(x);
    plot(b, x, y, lip ? LIP[y < top(x) ? 3 : 2] : MOUTH[Math.min(4, Math.round(((y - top(x)) / Math.max(1, bot(x) - top(x))) * 4))], lip ? M_OTHER : M_MOUTH);
  }
  teeth(b, cx - mw + 4, cx + mw - 4, (x) => top(x) + 0.5, 1, mad ? 7 : open ? 6 : 3, { tw: 5, gold: [6], rot: [2] });
  if (mad) {
    // (the bottom row, the tongue back in the throat, the dangly thing, spit strung between the rows)
    teeth(b, cx - mw + 9, cx + mw - 9, (x) => bot(x) - 0.5, -1, 5, { tw: 5, gaps: [3] });
    ball(b, cx, cy + mh - 8, 16, 7, TONGUE, { only: (x, y) => matAt(b, x, y) === M_MOUTH });
    ball(b, cx - 2, cy + 6, 3, 5, TONGUE, { only: (x, y) => matAt(b, x, y) === M_MOUTH });
    for (const [sx, k] of [[-14, 0.6], [6, 0.9], [18, 0.5]] as const) seg(b, cx + sx, top(cx + sx) + 6, cx + sx + 2, top(cx + sx) + 6 + mh * k, hexU('#F4F8FF'), 1, M_MOUTH, M_MOUTH);
  }
  if (open) { teeth(b, cx - mw + 8, cx + mw - 8, (x) => bot(x) - 0.5, -1, 4, { tw: 5, gaps: [2] }); ball(b, cx + 4, cy + mh - 3, 10, 4, TONGUE, { only: (x, y) => matAt(b, x, y) === M_MOUTH }); }
  yield;
  // ---- the goatee: short, gray, dense round the mouth and down the chin; a gray shadow over the rest of the jaw
  for (let k = 0; k < 900; k++) {
    const a = rnd() * Math.PI * 2, r = rnd();
    const x = cx + Math.cos(a) * (mw + 8) * r * 1.05, y = cy + 6 + Math.sin(a) * 26 * r;
    if (y < cy - 8 && Math.abs(x - cx) < mw - 4) continue;
    if (mad && matAt(b, x, y) === M_MOUTH) continue;
    if (matAt(b, x, y) !== M_SKIN) continue;
    seg(b, x, y, x + (rnd() - 0.5) * 2, y + 2, GRAY[1 + (k % 3)], 1, M_HAIR);
  }
  stubble(b, (x, y) => (y > 112 ? 1 - Math.abs(x - FX) / 70 : 0), GRAY[4], 0.4);
  yield;
  // ---- the pores (thick on the nose), blackheads, grease; a vein up his temple; a shaving nick
  skinPost(b, S[7], (x, y) => (((x - FX - 3) / 22) ** 2 + ((y - 112) / 16) ** 2 < 1 ? 0.22 : 0.06), { blackheads: (x, y) => ((x - FX - 3) / 20) ** 2 + ((y - 112) / 14) ** 2 < 1, shine: 0.22 });
  vein(b, [FX + 44, 50, FX + 48, 62, FX + 44, 74], VEIN_B, 2);
  if (mad) {
    // (losing it: a fat vein forked up the middle of the forehead, one up each temple, the neck's cords roped out)
    vein(b, [FX - 4, 66, FX - 2, 54, FX - 8, 44, FX - 6, 32], VEIN_B, 3); vein(b, [FX - 2, 54, FX + 6, 46, FX + 8, 36], VEIN_B, 2);
    vein(b, [FX - 46, 48, FX - 50, 60, FX - 46, 74], VEIN_B, 3);
    for (const s of [-1, 1]) vein(b, [FX + s * 34, 170, FX + s * 30, 182, FX + s * 36, 196], VEIN_B, 3);
  }
  seg(b, FX + 34, 160, FX + 38, 158, BLOOD[2]); plot(b, FX + 37, 161, BLOOD[3]);
  yield;
  // ---- sweat on the scalp and the brow; the cheeks ruddy from the last set
  for (let k = 0; k < 10; k++) { const x = FX - 44 + rnd() * 88, y = 20 + rnd() * 44; if (matAt(b, x, y) === M_SKIN || matAt(b, x, y) === M_HAIR) bead(b, x, y, 1.4 + rnd() * 1.4, S); }
  for (const s of [-1, 1]) tint(b, FX + s * 40, 116, 16, 12, hexU('#D85A4A'), 0.2, M_SKIN);
  return b;
}

const face = stamps<Key>(build, ['a', 'b']);
/** ...and losing it (the PISS-OFF PENDANT's tantrum), painted ahead only with the props. */
const faceMad = stamps<Key>(build, ['c']);

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
  // (the plastic tusk, glued up off the top: curving up and OUT, away from his face (this pad's the screen's left one:
  // out is left), thick at the root, its mould seam, a shine)
  for (let i = 0; i <= 14; i++) {
    const t = i / 14, x = cx - 14 - t * 30 + t * t * 6, y = cy - 22 - t * 26 - t * t * 10, r = 6.5 * (1 - t) + 1.2;
    ball(b, x, y, r, r, TUSK, { mat: M_OTHER, line: true, lw: 1 });
  }
  path(b, [cx - 18, cy - 26, cx - 30, cy - 38, cx - 38, cy - 50], TUSK[0], 1, undefined, M_OTHER);
  // (the glue: a clear blob at the tusk's root, a string of it)
  tint(b, cx - 15, cy - 21, 9, 5, hexU('#E8F4FF'), 0.55, M_OTHER);
  plot(b, cx - 11, cy - 23, WHITE); plot(b, cx - 12, cy - 23, WHITE); seg(b, cx - 20, cy - 18, cx - 22, cy - 12, hexU('#D8ECFA'));
  // (the price sticker it still has on)
  ball(b, cx + 20, cy - 8, 6, 4, R('#FF9A3A', '#F07A1A', '#C85A0A', '#8A3A04', '#3A1400'), { mat: M_OTHER, line: true, lw: 1 });
  seg(b, cx + 17, cy - 8, cx + 23, cy - 8, hexU('#3A1400'));
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

/** THE CLEARANCE CAPE (Spooky Land), in the face's own buffer coordinates: the shiny black polyester over his traps, the
 *  tall stiff collar standing up either side of his head (the red lining facing in, the stiff ribs up it), every bit of
 *  it still creased in squares from the bag, a red satin ribbon tied in a bow under his chin. (capeCanvas: the still
 *  part; swirlCanvas: the front of it in his fist, swept up across his face; tagCanvas: the price tag.) */
const CBLK = R('#6A6A8E', '#44445E', '#2A2A40', '#1A1A2C', '#0E0E1A', '#04040A');
const CRED = R('#FF9A9A', '#EE4A4A', '#C81E28', '#94101A', '#600810', '#2A0206');
/** The bag's creases: a light ridge and a dark fold, every this many px, across and down. */
const crease = (b: Buf, x0: number, y0: number, x1: number, y1: number, step: number, mat: number) => {
  for (let y = y0 + step; y < y1; y += step) for (let x = x0; x < x1; x++) { if (matAt(b, x, y) !== mat) continue; plot(b, x, y, CBLK[0], mat, mat); plot(b, x, y + 1, CBLK[4], mat, mat); }
  for (let x = x0 + step; x < x1; x += step) for (let y = y0; y < y1; y++) { if (matAt(b, x, y) !== mat) continue; plot(b, x, y, CBLK[1], mat, mat); plot(b, x + 1, y, CBLK[5], mat, mat); }
};
let capeCv: HTMLCanvasElement | null | undefined;
const capeCanvas = () => {
  if (capeCv !== undefined) return capeCv;
  setSeed(6606);
  const b = newBuf();
  for (const s of [-1, 1]) {
    // (the collar: from his shoulder up past his ear to a point, the lining facing in; its black rim round the outside)
    const ib = FX + s * 56, ob = FX + s * 136;
    poly(b, [ib, 156, FX + s * 76, 112, FX + s * 92, 50, FX + s * 124, 22, ob + s * 6, 44, ob + s * 2, 156], CBLK, M_CLOTH, { line: true, tilt: -0.3 * s });
    poly(b, [ib + s * 8, 152, FX + s * 84, 112, FX + s * 99, 56, FX + s * 124, 34, ob - s * 4, 52, ob - s * 6, 150], CRED, M_OTHER, { line: false, tilt: -0.5 * s });
    // (the shadow his head throws on the lining's inner edge; the stiff ribs up it, the satin's sheen down them)
    for (let y = 56; y < 152; y++) for (let k = 0; k < 7; k++) { const x = FX + s * (84 + (y < 112 ? (112 - y) * 0.27 : (112 - y) * 0.7) + k); if (matAt(b, x, y) === M_OTHER && (k < 4 || (x + y) % 2)) plot(b, x, y, CRED[4], M_OTHER, M_OTHER); }
    for (let k = 0; k < 4; k++) {
      const t = (k + 1) / 5, x0 = ib + s * 8 + (ob - s * 6 - ib - s * 8) * t;
      path(b, [x0, 150, FX + s * (99 + 26 * t), 50 - 14 * t], CRED[3], 1, undefined, M_OTHER);
      path(b, [x0 - s, 148, FX + s * (98 + 26 * t), 54 - 14 * t], CRED[0], 1, undefined, M_OTHER);
    }
    // (over the trap, down off the edge of the screen)
    poly(b, [s < 0 ? -12 : 284, GH, s < 0 ? -12 : 284, 150, FX + s * 76, 146, FX + s * 54, 168, FX + s * 50, GH], CBLK, M_CLOTH, { line: true, tilt: 0.2 * s });
  }
  crease(b, 0, 0, GW, GH, 22, M_CLOTH);
  // (the sheen: cheap polyester shines like a trash bag)
  for (let k = 0; k < 40; k++) { const x = 8 + rnd() * 70, y = 160 + rnd() * 40; if (matAt(b, x, y) === M_CLOTH) seg(b, x, y, x + 4, y - 2, CBLK[0], 1, M_CLOTH, M_CLOTH); }
  for (let k = 0; k < 40; k++) { const x = 200 + rnd() * 70, y = 160 + rnd() * 40; if (matAt(b, x, y) === M_CLOTH) seg(b, x, y, x + 4, y - 2, CBLK[1], 1, M_CLOTH, M_CLOTH); }
  // (the red ribbon tied in a bow under his chin, its tails down the tank top)
  for (const s of [-1, 1]) {
    ball(b, FX + 2 + s * 11, 176, 11, 6, CRED, { mat: M_OTHER, line: true, lw: 1.2, flat: 0.7 });
    poly(b, [FX + 2 + s * 2, 178, FX + 2 + s * 8, 180, FX + 2 + s * 14, GH, FX + 2 + s * 6, GH], CRED, M_OTHER, { line: true, tilt: 0.3 });
  }
  ball(b, FX + 2, 177, 5, 5, CRED, { mat: M_OTHER, line: true, lw: 1 });
  plot(b, FX, 175, WHITE);
  capeCv = toCanvas(b);
  return capeCv;
};
/** The front of the cape in his fist: the edge turned over (the lining showing along it), the folds fanning off his
 *  knuckles, the creases; his fist on it and his forearm down off the bottom of the screen. Painted at its height
 *  swept up (under his eyes); drawn lower while it's down. */
let swirlCv: HTMLCanvasElement | null | undefined;
const swirlCanvas = () => {
  if (swirlCv !== undefined) return swirlCv;
  setSeed(6607);
  const b = newBuf();
  const fx = FX + 84, fy = 112;
  poly(b, [-12, 126, FX - 70, 112, FX - 10, 104, FX + 50, 106, fx, fy, fx + 26, GH, -12, GH], CBLK, M_CLOTH, { line: true, tilt: 0.2 });
  // (the edge turned over: a band of the red lining along the top)
  poly(b, [-12, 126, FX - 70, 112, FX - 10, 104, FX + 50, 106, fx, fy, fx - 2, fy + 8, FX + 50, 114, FX - 10, 112, FX - 70, 120, -12, 134], CRED, M_OTHER, { line: true, tilt: 0.1 });
  // (the folds: off his knuckles, fanning down and away)
  for (let k = 0; k < 6; k++) {
    const ex = 10 + k * 40, ey = GH;
    path(b, [fx - 4, fy + 10, (fx + ex) / 2 - 10, 160, ex, ey], CBLK[4], 3, undefined, M_CLOTH);
    path(b, [fx - 6, fy + 10, (fx + ex) / 2 - 13, 160, ex - 4, ey], CBLK[1], 1, undefined, M_CLOTH);
  }
  crease(b, 0, 110, GW, GH, 26, M_CLOTH);
  // (his forearm up into the fist, the fist balled in the cloth: the knuckles, a vein, the gray hair on it)
  poly(b, [fx - 12, fy + 8, fx + 16, fy + 4, fx + 66, GH + 2, fx + 24, GH + 2], SKIN.slice(1), M_SKIN, { line: true, tilt: 0.6 });
  // (the meat of it: the forearm swelling up off the wrist, gray hair over it)
  ball(b, fx + 22, fy + 52, 22, 34, SKIN.slice(1), { mat: M_SKIN, line: true, lw: 1.3, flat: 0.8 });
  ball(b, fx + 40, fy + 98, 26, 30, SKIN.slice(1), { mat: M_SKIN, line: (dx) => dx < 0.2, lw: 1.3, flat: 0.8 });
  path(b, [fx + 2, fy + 30, fx + 20, fy + 70, fx + 30, GH], SKIN[1], 2, undefined, M_SKIN);
  for (let k = 0; k < 70; k++) { const x = fx + rnd() * 60, y = fy + 30 + rnd() * 90; if (matAt(b, x, y) === M_SKIN) seg(b, x, y, x - 1.5, y - 2.5, GRAY[2 + (k % 3)], 1, M_SKIN, M_SKIN); }
  vein(b, [fx + 14, fy + 40, fx + 22, fy + 64, fx + 30, fy + 92], VEIN_B, 2);
  hairs(b, 30, () => [fx + 10 + rnd() * 34, fy + 40 + rnd() * 60], 3, -2.2, GRAY[3], M_SKIN, 0.6);
  ball(b, fx, fy, 17, 14, SKIN, { mat: M_SKIN, line: true, lw: 1.4, flat: 0.8 });
  for (let k = 0; k < 4; k++) { ball(b, fx - 12 + k * 7, fy - 9, 4.6, 4, SKIN, { mat: M_SKIN, line: true, lw: 1 }); plot(b, fx - 13 + k * 7, fy - 11, SKIN[0]); }
  for (let k = 0; k < 3; k++) path(b, [fx - 9 + k * 7, fy - 6, fx - 9 + k * 7, fy + 2], SKIN[6], 1, undefined, M_SKIN);
  // (the cloth bunched up out of his grip)
  poly(b, [fx - 20, fy - 4, fx - 30, fy - 16, fx - 14, fy - 12, fx - 4, fy - 20, fx + 2, fy - 12], CBLK, M_CLOTH, { line: true, tilt: 0.4 });
  swirlCv = toCanvas(b);
  return swirlCv;
};
/** The price tag on its plastic barb: a white card, the hole, CLEARANCE in an orange band, the old price slashed. */
const TAG_W = 16, TAG_H = 22;
let tagCv: HTMLCanvasElement | null | undefined;
const tagCanvas = () => {
  if (tagCv !== undefined) return tagCv;
  if (typeof document === 'undefined') { tagCv = null; return null; }
  const cv = document.createElement('canvas'); cv.width = TAG_W; cv.height = TAG_H;
  const g = cv.getContext('2d')!;
  const bx = (x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  bx(0, 2, 16, 20, '#2A2A36'); bx(1, 3, 14, 18, '#F4F4F0'); bx(1, 3, 14, 1, '#FFFFFF'); bx(14, 3, 1, 18, '#C8C8C0'); bx(1, 20, 14, 1, '#C8C8C0');
  // (the corners clipped, the hole up top with its ring)
  bx(0, 2, 2, 2, 'rgba(0,0,0,0)'); g.clearRect(0, 2, 2, 2); g.clearRect(14, 2, 2, 2);
  bx(6, 4, 4, 3, '#2A2A36'); bx(7, 5, 2, 1, '#8A8A90');
  // (the orange CLEARANCE band, its letters as ticks; the old price slashed; the new one big)
  bx(1, 9, 14, 4, '#F07A1A'); for (let k = 0; k < 6; k++) bx(2 + k * 2, 10, 1, 2, '#FFF4E0');
  bx(3, 14, 9, 2, '#6A6A70'); bx(2, 16, 12, 1, '#DC2626');
  bx(3, 17, 2, 3, '#DC2626'); bx(6, 17, 1, 3, '#1A1A22'); bx(8, 17, 2, 3, '#1A1A22'); bx(11, 17, 2, 3, '#1A1A22');
  tagCv = cv;
  return cv;
};
/** The swirl's cycle (frames): down a while, swept up across his face, held (the eyes over it), dropped. */
const SW_DOWN = 40, SW_UP = 12, SW_HOLD = 40, SW_DROP = 14, SWIRL = SW_DOWN + SW_UP + SW_HOLD + SW_DROP + 14;
/** How far up the front is (1 swept up across his face, 0 down off the screen). */
const swirlUp = (f: number) => {
  const t = f % SWIRL;
  if (t < SW_DOWN) return 0;
  if (t < SW_DOWN + SW_UP) { const k = (t - SW_DOWN) / SW_UP; return 1 - (1 - k) * (1 - k); }
  if (t < SW_DOWN + SW_UP + SW_HOLD) return 1;
  if (t < SW_DOWN + SW_UP + SW_HOLD + SW_DROP) { const k = (t - SW_DOWN - SW_UP - SW_HOLD) / SW_DROP; return 1 - k * k; }
  return 0;
};

/** THE TROPHY SHIN-DIGS (Hollywood Land): AWARD, one of the knockoff gold statuettes, torn off his shin with the duct tape
 *  still flapping off it, up in his fist for the acceptance speech (the forearm down off the screen); KICK, his own leg
 *  (gray fleece, the other statuette taped down the shin, the film reel on the knee, the white high-top) for the flash
 *  kick, painted pointing straight up from the hip at its foot (drawn turned as it swings up across the screen). */
const AWARD_W = 64, AWARD_H = 170;
const SWEATS = R('#B4B4C2', '#9494A2', '#787886', '#5C5C6A', '#42424F', '#1C1C26');
const SHOEW = R('#FFFFFF', '#F2F2F8', '#DADAE4', '#B4B4C4', '#8A8A9C', '#2E2E3A');
const TAPE = R('#F4F4F8', '#D8DAE0', '#B4B8C0', '#8E929C', '#686C76', '#2E3038');
/** The little gold man (head up, arms down his front, feet on a black base), its middle at x, head's top at y, `s` its
 *  size, into the buffer. */
const goldMan = (b: Buf, x: number, y: number, s: number) => {
  // (the base: black, a gold plate on it)
  poly(b, [x - 13 * s, y + 66 * s, x + 13 * s, y + 66 * s, x + 14 * s, y + 80 * s, x - 14 * s, y + 80 * s], R('#5A5A66', '#3A3A44', '#26262E', '#18181E', '#0E0E12', '#000000'), M_METAL, { line: true, tilt: 0.4 });
  poly(b, [x - 8 * s, y + 70 * s, x + 8 * s, y + 70 * s, x + 8 * s, y + 76 * s, x - 8 * s, y + 76 * s], GOLD.slice(1), M_METAL, { line: true, tilt: 0 });
  for (let k = 0; k < 4; k++) seg(b, x - 6 * s + k * 4 * s, y + 73 * s, x - 4 * s + k * 4 * s, y + 73 * s, GOLD[5], 1, M_METAL, M_METAL);
  // (the body: shoulders, tapering down to the feet; the arms folded down the front, the sword-ish thing they hold)
  poly(b, [x - 11 * s, y + 20 * s, x + 11 * s, y + 20 * s, x + 9 * s, y + 34 * s, x + 6 * s, y + 52 * s, x + 4 * s, y + 66 * s, x - 4 * s, y + 66 * s, x - 6 * s, y + 52 * s, x - 9 * s, y + 34 * s], GOLD, M_METAL, { line: true, tilt: 0.5 });
  path(b, [x - 9 * s, y + 24 * s, x - 3 * s, y + 38 * s, x + 3 * s, y + 38 * s, x + 9 * s, y + 24 * s], GOLD[4], 1, undefined, M_METAL);
  seg(b, x, y + 36 * s, x, y + 64 * s, GOLD[4], 1, M_METAL, M_METAL); seg(b, x - 1, y + 38 * s, x - 1, y + 62 * s, GOLD[0], 1, M_METAL, M_METAL);
  path(b, [x - 3 * s, y + 52 * s, x, y + 54 * s, x + 3 * s, y + 52 * s], GOLD[5], 1, undefined, M_METAL);
  // (the neck, the bald round head, a shine on it)
  ball(b, x, y + 18 * s, 4 * s, 3 * s, GOLD, { mat: M_METAL });
  ball(b, x, y + 9 * s, 8 * s, 9 * s, GOLD, { mat: M_METAL, line: true, lw: 1.2 });
  plot(b, x - 3 * s, y + 4 * s, WHITE); plot(b, x - 2 * s, y + 4 * s, WHITE); plot(b, x - 3 * s, y + 5 * s, WHITE);
  for (let k = 0; k < 6; k++) plot(b, x - 6 * s + k * 0.4, y + 24 * s + k * 6 * s, GOLD[0], M_METAL, M_METAL);
};
let awardCv: HTMLCanvasElement | null | undefined;
const awardCanvas = () => {
  if (awardCv !== undefined) return awardCv;
  setSeed(7070);
  const b = newBuf();
  const x = 32;
  goldMan(b, x, 4, 1);
  // (the duct tape round it, torn off his shin: two strips, their ends flapping off ragged)
  for (const [ty, l] of [[28, 1], [56, -1]] as const) {
    poly(b, [x - 12, ty, x + 12, ty - 2, x + 12, ty + 6, x - 12, ty + 8], TAPE, M_CLOTH, { line: true, tilt: 0 });
    poly(b, [x + 12 * l, ty - 2 + (l < 0 ? 2 : 0), x + 26 * l, ty + 8, x + 22 * l, ty + 14, x + 11 * l, ty + 6], TAPE, M_CLOTH, { line: true, tilt: 0.4 * l });
    for (let k = 0; k < 6; k++) plot(b, x - 10 + k * 4, ty + 2, TAPE[0], M_CLOTH, M_CLOTH);
  }
  // (his fist round the base, the forearm down off the bottom; gray hair on it, a vein)
  poly(b, [x - 18, 96, x + 18, 96, x + 30, AWARD_H + 2, x - 12, AWARD_H + 2], SKIN.slice(1), M_SKIN, { line: true, tilt: 0.5 });
  ball(b, x, 88, 19, 13, SKIN, { mat: M_SKIN, line: true, lw: 1.4, flat: 0.8 });
  for (let k = 0; k < 4; k++) { ball(b, x - 13 + k * 8.6, 79, 5, 4.4, SKIN, { mat: M_SKIN, line: true, lw: 1 }); plot(b, x - 14 + k * 8.6, 77, SKIN[0]); }
  for (let k = 0; k < 3; k++) path(b, [x - 9 + k * 8.6, 82, x - 9 + k * 8.6, 90], SKIN[6], 1, undefined, M_SKIN);
  vein(b, [x - 4, 104, x + 2, 124, x + 8, 150], VEIN_B, 2);
  for (let k = 0; k < 40; k++) { const hx = x - 12 + rnd() * 34, hy = 100 + rnd() * 66; if (matAt(b, hx, hy) === M_SKIN) seg(b, hx, hy, hx - 1.5, hy - 2.5, GRAY[2 + (k % 3)], 1, M_SKIN, M_SKIN); }
  const cv = toCanvas(b);
  if (!cv) { awardCv = null; return null; }
  const out = document.createElement('canvas'); out.width = AWARD_W; out.height = AWARD_H;
  out.getContext('2d')!.drawImage(cv, 0, 0, AWARD_W, AWARD_H, 0, 0, AWARD_W, AWARD_H);
  awardCv = out;
  return out;
};
const KICK_W = 76, KICK_H = 200;
let kickCv: HTMLCanvasElement | null | undefined;
const kickCanvas = () => {
  if (kickCv !== undefined) return kickCv;
  setSeed(7071);
  const b = newBuf();
  const x = 38;
  // (the thigh and the shin: baggy fleece, the knee at 110, a crease off it, the ribbed cuff gathered at the ankle)
  poly(b, [x - 26, KICK_H, x + 24, KICK_H, x + 20, 112, x - 20, 108], SWEATS, M_CLOTH, { line: true, tilt: 0.3 });
  poly(b, [x - 20, 112, x + 20, 112, x + 16, 40, x - 16, 40], SWEATS, M_CLOTH, { line: true, tilt: 0.3 });
  for (const yy of [150, 128, 70]) path(b, [x - 18, yy, x - 4, yy + 4, x + 8, yy], SWEATS[4], 1, undefined, M_CLOTH);
  poly(b, [x - 17, 42, x + 17, 42, x + 17, 32, x - 17, 32], SWEATS, M_CLOTH, { line: true, tilt: 0 });
  for (let k = 0; k < 8; k++) seg(b, x - 14 + k * 4, 33, x - 14 + k * 4, 41, SWEATS[4], 1, M_CLOTH, M_CLOTH);
  // (the film reel on the knee)
  ball(b, x, 108, 15, 15, R('#F4F6FA', '#D4DAE2', '#A8B0BC', '#7A828E', '#4A505C', '#1A1C22'), { mat: M_METAL, line: true, lw: 1.4 });
  ball(b, x, 108, 9, 9, R('#3A3A44', '#26262E', '#18181E', '#0E0E12', '#050508', '#000000'), { mat: M_METAL });
  ball(b, x, 108, 3, 3, R('#D4DAE2', '#A8B0BC', '#7A828E', '#4A505C', '#2A2E36', '#101216'), { mat: M_METAL });
  for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + k * (Math.PI * 2 / 3); ball(b, x + Math.cos(a) * 12, 108 + Math.sin(a) * 12, 2, 2, R('#5A606C', '#3A3E48', '#22262E', '#14161C', '#0A0C10', '#000000'), { mat: M_METAL }); }
  // (the statuette down the front of the shin, upside down to it (its head at the knee), taped on)
  goldMan(b, x, 50, 0.62);
  for (const ty of [62, 84]) { poly(b, [x - 18, ty, x + 18, ty - 1, x + 18, ty + 5, x - 18, ty + 6], TAPE, M_CLOTH, { line: true, tilt: 0 }); for (let k = 0; k < 7; k++) plot(b, x - 16 + k * 5, ty + 2, TAPE[0], M_CLOTH, M_CLOTH); }
  // (the white high-top on the end: the sole, the toe up, the laces, the red stripe)
  poly(b, [x - 15, 34, x + 15, 34, x + 16, 12, x + 30, 4, x + 30, -2 + 6, x - 15, 6], SHOEW, M_OTHER, { line: true, tilt: 0.4 });
  poly(b, [x - 17, 8, x + 32, 2, x + 33, 8, x - 17, 13], R('#EEEEF4', '#C8C8D4', '#A0A0B0', '#78788A', '#4A4A5A', '#1E1E28'), M_OTHER, { line: true, tilt: 0 });
  path(b, [x - 12, 26, x + 4, 22, x + 14, 14], hexU('#D23030'), 2, undefined, M_OTHER);
  for (let k = 0; k < 4; k++) seg(b, x + 2 + k * 3, 30 - k * 4, x + 8 + k * 3, 28 - k * 4, SHOEW[4], 1, M_OTHER, M_OTHER);
  const cv = toCanvas(b);
  if (!cv) { kickCv = null; return null; }
  const out = document.createElement('canvas'); out.width = KICK_W; out.height = KICK_H;
  out.getContext('2d')!.drawImage(cv, 0, 0, KICK_W, KICK_H, 0, 0, KICK_W, KICK_H);
  kickCv = out;
  return out;
};
/** The shin-digs' cycle (frames): the speech (the award up beside his face, bobbing), then the flash kick (the leg up
 *  across the screen and back down). */
const SPEECH = 84, FLASH = 34;
/** The kick's swing (0..1 up, back), and its leg's angle (radians off straight up, + toward his left of the screen). */
const kickU = (f: number) => { const t = f % (SPEECH + FLASH) - SPEECH; return t < 0 ? -1 : t / FLASH; };

/** THE PISS-OFF PENDANT (Fairy Land): the gift shop's princess jewel, a hot pink plastic heart, faceted, in a yellow
 *  plastic heart setting with three little tiara points up off it, a paper tag off the side (4+); painted hanging off
 *  its bail (the bail at PEND_X, 6), drawn turned as it swings. His fist, up beside his face with its forearm down off
 *  the bottom of the screen, the sequin chain pinched in it. */
const PEND_W = 62, PEND_H = 62, PEND_X = 30;
const PINK = R('#FFE4F2', '#FF9ACB', '#F4609E', '#D93A80', '#A81E5C', '#4A0828');
const PINK_HI = R('#FFF4FA', '#FFC6E2', '#FF9ACB', '#F4609E', '#D93A80', '#A81E5C');
const YPLAST = R('#FFF8C0', '#FDE047', '#FACC15', '#CA8A04', '#8A5A00', '#3A2400');
const PAPER = R('#FFFFFF', '#F4F2EA', '#DEDACC', '#BEB8A6', '#8E8A7A', '#3A3830');
/** A heart's outline points about (x, y), w wide, its point down. */
const heartPts = (x: number, y: number, w: number) => {
  const out: number[] = [], k = w / 34;
  for (let i = 0; i < 40; i++) { const t = (i / 40) * Math.PI * 2; out.push(x + 16 * Math.sin(t) ** 3 * k, y - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * k); }
  return out;
};
let pendCv: HTMLCanvasElement | null | undefined;
const pendCanvas = () => {
  if (pendCv !== undefined) return pendCv;
  setSeed(6161);
  const b = newBuf();
  const x = PEND_X, y = 34;
  // (the bail: a yellow plastic ring the chain goes through)
  ball(b, x, 6, 4, 4, YPLAST, { mat: M_OTHER, line: true, lw: 1 }); ball(b, x, 6, 1.6, 1.6, R('#3A2400', '#2A1800', '#1A0E00', '#000000'), { mat: M_OTHER });
  // (the tiara points up off the setting's top, a pink dot on each)
  for (const [dx, h] of [[-9, 8], [0, 12], [9, 8]] as const) { poly(b, [x + dx - 3, 19, x + dx + 3, 19, x + dx, 19 - h], YPLAST, M_OTHER, { line: true, tilt: 0.3 }); ball(b, x + dx, 19 - h + 3, 1.5, 1.5, PINK, { mat: M_OTHER }); }
  // (the setting: a fat yellow plastic heart, the mould seam round it)
  poly(b, heartPts(x, y, 48), YPLAST, M_OTHER, { line: true, tilt: 0.5 });
  const seam = heartPts(x, y + 0.5, 42);
  path(b, [...seam, seam[0], seam[1]], YPLAST[3], 1, undefined, M_OTHER);
  // (the jewel: hot pink, cut in facets: a table up top, the crown's facets fanning off it, the pavilion's down to the point)
  poly(b, heartPts(x, y + 1, 36), PINK, M_METAL, { line: true, tilt: 0.7 });
  const tbl = heartPts(x - 1, y - 2, 16);
  poly(b, tbl, PINK_HI, M_METAL, { tilt: 0.4 });
  for (let i = 0; i < 40; i += 5) seg(b, tbl[i * 2], tbl[i * 2 + 1], x - 1 + (tbl[i * 2] - x + 1) * 2.1, y - 2 + (tbl[i * 2 + 1] - y + 2) * 2.1, PINK[4], 1, M_METAL, M_METAL);
  seg(b, x - 12, y + 6, x, y + 18, PINK[4], 1, M_METAL, M_METAL); seg(b, x + 12, y + 6, x, y + 18, PINK[4], 1, M_METAL, M_METAL);
  // (the shine: a big hard white glint up its left lobe, a sparkle)
  for (const [dx, dy] of [[-10, -6], [-9, -6], [-10, -5], [-8, -7], [-11, -4], [-9, -5]] as const) plot(b, x + dx, y + dy, WHITE);
  plot(b, x + 7, y + 6, PINK[0]); plot(b, x + 8, y + 5, PINK[0]);
  // (the paper tag on a thread off the setting's right lobe: 4+)
  seg(b, x + 18, y - 6, x + 24, y + 2, PAPER[3], 1, M_CLOTH);
  poly(b, [x + 21, y + 2, x + 30, y + 2, x + 30, y + 13, x + 21, y + 13], PAPER, M_CLOTH, { line: true, tilt: 0 });
  const ink = hexU('#C81E50');
  for (const [dx, dy] of [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 0], [2, 1], [2, 3], [2, 4], [5, 1], [5, 2], [5, 3], [4, 2], [6, 2]] as const) plot(b, x + 22 + dx, y + 5 + dy, ink, M_CLOTH, M_CLOTH);
  const cv = toCanvas(b);
  if (!cv) { pendCv = null; return null; }
  const out = document.createElement('canvas'); out.width = PEND_W; out.height = PEND_H;
  out.getContext('2d')!.drawImage(cv, 0, 0, PEND_W, PEND_H, 0, 0, PEND_W, PEND_H);
  pendCv = out;
  return out;
};
const FIST_W = 64, FIST_H = 200;
let fistCv: HTMLCanvasElement | null | undefined;
const fistCanvas = () => {
  if (fistCv !== undefined) return fistCv;
  setSeed(6162);
  const b = newBuf();
  const x = 32;
  // (the forearm down off the bottom: hairy, a vein roped up it)
  poly(b, [x - 18, 34, x + 16, 34, x + 26, FIST_H + 2, x - 14, FIST_H + 2], SKIN.slice(1), M_SKIN, { line: true, tilt: 0.5 });
  vein(b, [x - 6, 50, x + 2, 90, x - 2, 130, x + 6, 170], VEIN_B, 2);
  for (let k = 0; k < 50; k++) { const hx = x - 12 + rnd() * 30, hy = 44 + rnd() * 150; if (matAt(b, hx, hy) === M_SKIN) seg(b, hx, hy, hx - 1.5, hy - 2.5, GRAY[2 + (k % 3)], 1, M_SKIN, M_SKIN); }
  // (the fist, its knuckles to the camera, the thumb over the curled fingers pinching the chain)
  ball(b, x, 24, 20, 15, SKIN, { mat: M_SKIN, line: true, lw: 1.4, flat: 0.8 });
  for (let k = 0; k < 4; k++) { ball(b, x - 13 + k * 8.6, 13, 5, 4.4, SKIN, { mat: M_SKIN, line: true, lw: 1 }); plot(b, x - 14 + k * 8.6, 11, SKIN[0]); }
  for (let k = 0; k < 3; k++) path(b, [x - 9 + k * 8.6, 16, x - 9 + k * 8.6, 26], SKIN[6], 1, undefined, M_SKIN);
  ball(b, x - 4, 32, 12, 6, SKIN, { mat: M_SKIN, line: true, lw: 1.1, flat: 0.7 });
  // (the scraped knuckles)
  for (let k = 0; k < 4; k++) tint(b, x - 13 + k * 8.6, 11, 2.5, 2, hexU('#C84A3A'), 0.35, M_SKIN);
  const cv = toCanvas(b);
  if (!cv) { fistCv = null; return null; }
  const out = document.createElement('canvas'); out.width = FIST_W; out.height = FIST_H;
  out.getContext('2d')!.drawImage(cv, 0, 0, FIST_W, FIST_H, 0, 0, FIST_W, FIST_H);
  fistCv = out;
  return out;
};
/** The pendant's cycle (frames): dangled beside his face, swinging slow like a hypnotist's watch; then he loses it. */
const DANGLE = 120, TANTRUM = 76;
const tantrum = (f: number) => { const t = f % (DANGLE + TANTRUM) - DANGLE; return t < 0 ? -1 : t / TANTRUM; };


/** THE BEEF BRACERS (Future Land): a chrome robot bracer round his forearm (stark chrome bands, dithered seams, ridged
 *  rims, rivets, a black LED window the scrolling BEEF is slid through live), baked once; the forearm and fist under it
 *  are the pendant's (fistCanvas). */
const BRC_W = 52, BRC_H = 74, BRC_LED = { x: 6, y: 28, w: 40, h: 12 };
let brcCv: HTMLCanvasElement | null | undefined;
const brcCanvas = () => {
  if (brcCv !== undefined) return brcCv;
  if (typeof document === 'undefined') { brcCv = null; return null; }
  const cv = document.createElement('canvas'); cv.width = BRC_W; cv.height = BRC_H;
  const g = cv.getContext('2d')!;
  const r = (x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  // (the outline, then the body in hard chrome bands across, a checker where two bands meet)
  r(1, 0, BRC_W - 2, BRC_H, '#05070B'); r(0, 2, BRC_W, BRC_H - 4, '#05070B');
  const bands: [number, string][] = [[0, '#475569'], [0.1, '#E2E8F0'], [0.2, '#FFFFFF'], [0.27, '#94A3B8'], [0.45, '#334155'], [0.58, '#64748B'], [0.76, '#CBD5E1'], [0.88, '#334155'], [1, '']];
  for (let i = 0; i < bands.length - 1; i++) {
    const a = 2 + Math.round(bands[i][0] * (BRC_W - 4)), b = 2 + Math.round(bands[i + 1][0] * (BRC_W - 4));
    r(a, 2, b - a, BRC_H - 4, bands[i][1]);
    if (i) for (let y = 2; y < BRC_H - 2; y += 2) r(a, y + ((y >> 1) % 2), 1, 1, bands[i - 1][1]);
  }
  // (the rims, top and bottom: a ridge each, its lip lit, its underside black)
  for (const y of [2, BRC_H - 11]) { r(1, y, BRC_W - 2, 9, '#1E293B'); r(1, y, BRC_W - 2, 2, '#F8FAFC'); r(1, y + 2, BRC_W - 2, 1, '#94A3B8'); r(1, y + 7, BRC_W - 2, 2, '#020617'); for (let x = 4; x < BRC_W - 4; x += 6) r(x, y + 4, 3, 2, '#64748B'); }
  // (the rivets)
  for (const [x, y] of [[4, 14], [BRC_W - 7, 14], [4, BRC_H - 18], [BRC_W - 7, BRC_H - 18]]) { r(x, y, 3, 3, '#020617'); r(x, y, 2, 2, '#E2E8F0'); }
  // (the LED window: recessed black, a lit lip under it, a dark one over it)
  const L = BRC_LED;
  r(L.x - 2, L.y - 2, L.w + 4, L.h + 4, '#0F172A'); r(L.x - 1, L.y - 1, L.w + 2, L.h + 2, '#020617'); r(L.x - 2, L.y + L.h + 2, L.w + 4, 1, '#F8FAFC');
  // (a scratch or two; a strip of gaffer tape holding the battery hatch on)
  r(30, 50, 7, 1, '#F1F5F9'); r(12, 47, 4, 1, '#0F172A');
  r(8, 52, 20, 6, '#18181B'); r(8, 52, 20, 1, '#3F3F46'); r(10, 54, 3, 1, '#52525B');
  brcCv = cv;
  return cv;
};
/** The bracers' cycle (frames): shown off beside his face; the dip; the uppercut at the lens. */
const SHOW_T = 96, DIP_T = 10, CUT_T = 26;
const cutU = (f: number) => { const t = f % (SHOW_T + DIP_T + CUT_T) - SHOW_T; return t < 0 ? -1 : t; };

/** The COWBELL CLODHOPPERS (Wilderness Land), at the gross-up's own grain (not the sprite's boot blown up): a cowboy boot
 *  of rusty railroad iron in profile (toe at the right), baked once: the tall shaft with its scalloped top and pull
 *  strap, a V notch, fancy stitching up it; the vamp down to a pointed toe under an iron toe cap; the stacked iron heel;
 *  the sole's lit edge; rivets down the seams, pitting; the spur off the heel with its star rowel. The cowbell its own
 *  bake (brass in bands, the rim, the clapper). */
const BOOT_W = 104, BOOT_H = 86, BELL_W = 26, BELL_H = 30;
const RST = ['#1E0C06', '#3A1A0C', '#5E2C14', '#82401E', '#A6582A', '#C8773E', '#E49A5C'];
const IRN = ['#0E0E12', '#1E1E24', '#32323A', '#4A4A54', '#6A6A76', '#9A9AA8', '#D2D2DC'];
const BRS = ['#3A2204', '#6A440C', '#9A6A1A', '#C8962E', '#E6BE52', '#F8E08A', '#FFF6CC'];
let bootCv: HTMLCanvasElement | null | undefined, bellCv: HTMLCanvasElement | null | undefined;
/** Bands across x (lit at the left), each band's edge dithered into the next, inside whatever's clipped. */
const bandsX = (g: CanvasRenderingContext2D, x0: number, x1: number, y0: number, y1: number, R: string[], from: number, to: number) => {
  const n = Math.max(1, from - to + 1), bw = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const x = x0 + i * bw;
    g.fillStyle = R[from - i]; g.fillRect(Math.floor(x), y0, Math.ceil(bw) + 1, y1 - y0);
    if (i) { g.fillStyle = R[from - i + 1]; for (let y = y0; y < y1; y += 2) g.fillRect(Math.floor(x) + ((y >> 1) & 1), y, 1, 1); }
  }
};
const bootCanvas = () => {
  if (bootCv !== undefined) return bootCv;
  if (typeof document === 'undefined') return (bootCv = null);
  const cv = document.createElement('canvas'); cv.width = BOOT_W; cv.height = BOOT_H;
  const g = cv.getContext('2d')!;
  const outline = () => {
    g.beginPath();
    g.moveTo(16, 8); g.lineTo(24, 11); g.lineTo(30, 7); g.lineTo(36, 12); g.lineTo(42, 8); g.lineTo(48, 10);
    g.lineTo(50, 44); g.quadraticCurveTo(54, 50, 66, 52); g.lineTo(86, 57); g.quadraticCurveTo(98, 61, 101, 66);
    g.lineTo(96, 70); g.lineTo(38, 70); g.lineTo(36, 80); g.lineTo(18, 80); g.lineTo(15, 66); g.closePath();
  };
  // (the ink round it, two px out)
  g.save(); g.translate(0, 0); g.strokeStyle = '#0A0604'; g.lineWidth = 4; g.lineJoin = 'round'; outline(); g.stroke(); g.restore();
  g.save(); outline(); g.clip();
  // (the shaft and the vamp: rust in bands across, lit down the shaft's back)
  bandsX(g, 14, 52, 0, 72, RST, 6, 2);
  bandsX(g, 52, 102, 40, 72, RST, 5, 2);
  // (the shaft's top: a lit scalloped rim; the V notch; the fancy stitching up it in a pale thread)
  g.fillStyle = RST[6]; g.fillRect(16, 8, 34, 2);
  g.fillStyle = '#0A0604'; g.beginPath(); g.moveTo(40, 8); g.lineTo(44, 18); g.lineTo(48, 8); g.closePath(); g.fill();
  g.strokeStyle = '#E8C898'; g.lineWidth = 1; g.setLineDash([2, 2]);
  g.beginPath(); g.moveTo(24, 16); g.quadraticCurveTo(32, 26, 26, 36); g.quadraticCurveTo(22, 44, 30, 50); g.stroke();
  g.beginPath(); g.moveTo(34, 16); g.quadraticCurveTo(42, 28, 36, 40); g.stroke();
  g.setLineDash([]);
  // (the seam down the shaft's front and along the welt: rivets, each lit on top, its shadow under)
  for (const [x, y] of [[48, 16], [48, 26], [48, 36], [56, 50], [68, 54], [80, 58], [20, 30], [20, 46], [20, 60]] as const) { g.fillStyle = '#F2B27A'; g.fillRect(x - 2, y - 2, 4, 2); g.fillStyle = RST[1]; g.fillRect(x - 2, y, 4, 2); }
  // (pitting)
  for (let k = 0; k < 26; k++) { const x = 16 + ((k * 37) % 80), y = 12 + ((k * 23) % 56); g.fillStyle = k % 3 ? RST[1] : '#D9772E'; g.fillRect(x, y, 2, 1); }
  // (the iron toe cap over the point, its lit rim, a bolt)
  g.save(); g.beginPath(); g.moveTo(74, 54); g.lineTo(88, 57); g.quadraticCurveTo(99, 61, 102, 66); g.lineTo(96, 70); g.lineTo(72, 70); g.closePath(); g.clip();
  bandsX(g, 72, 102, 50, 72, IRN, 5, 2); g.fillStyle = IRN[6]; g.fillRect(74, 55, 16, 1);
  g.restore();
  g.fillStyle = IRN[6]; g.fillRect(84, 61, 2, 2);
  // (the sole: a dark strip, its edge lit; the stacked iron heel under the back)
  g.fillStyle = IRN[1]; g.fillRect(36, 66, 66, 6); g.fillStyle = IRN[4]; g.fillRect(36, 66, 64, 1);
  bandsX(g, 14, 40, 66, 82, IRN, 4, 1);
  for (let y = 70; y < 80; y += 4) { g.fillStyle = IRN[0]; g.fillRect(16, y, 22, 1); }
  g.fillStyle = IRN[5]; g.fillRect(16, 66, 20, 1);
  g.restore();
  // (the pull strap's loop up off the shaft's back top)
  g.strokeStyle = '#0A0604'; g.lineWidth = 4; g.beginPath(); g.arc(20, 7, 5, Math.PI, 0); g.stroke();
  g.strokeStyle = RST[4]; g.lineWidth = 2; g.beginPath(); g.arc(20, 7, 5, Math.PI, 0); g.stroke();
  // (the spur: a strap round the heel, the shank out the back, the star rowel)
  g.fillStyle = '#0A0604'; g.fillRect(2, 60, 16, 5); g.fillStyle = '#CBD5E1'; g.fillRect(4, 61, 13, 2); g.fillStyle = '#F8FAFC'; g.fillRect(6, 61, 6, 1);
  for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4, r = k % 2 ? 3 : 6; g.fillStyle = k % 2 ? '#94A3B8' : '#E2E8F0'; g.fillRect(Math.round(5 + Math.cos(a) * r) - 1, Math.round(62 + Math.sin(a) * r) - 1, 2, 2); }
  g.fillStyle = '#475569'; g.fillRect(4, 61, 3, 3);
  bootCv = cv;
  return cv;
};
const bellCanvas = () => {
  if (bellCv !== undefined) return bellCv;
  if (typeof document === 'undefined') return (bellCv = null);
  const cv = document.createElement('canvas'); cv.width = BELL_W; cv.height = BELL_H;
  const g = cv.getContext('2d')!;
  const body = () => { g.beginPath(); g.moveTo(8, 4); g.lineTo(18, 4); g.lineTo(24, 26); g.lineTo(2, 26); g.closePath(); };
  g.strokeStyle = '#0A0604'; g.lineWidth = 3; g.lineJoin = 'round'; body(); g.stroke();
  g.save(); body(); g.clip(); bandsX(g, 0, 26, 0, 28, BRS, 6, 2); g.fillStyle = BRS[6]; g.fillRect(8, 4, 10, 1); g.restore();
  g.fillStyle = BRS[1]; g.fillRect(2, 24, 22, 3); g.fillStyle = BRS[4]; g.fillRect(3, 24, 20, 1);
  g.fillStyle = '#0A0604'; g.fillRect(11, 26, 4, 3);
  g.fillStyle = '#3A2410'; g.fillRect(11, 0, 4, 5);
  bellCv = cv;
  return cv;
};
/** Its cycle (frames): dangled off his fist by its pull strap beside his face, the cowbell clanking under it; then the
 *  STOMP at the lens: the boot comes down at the camera heel first, swelling, the motion lines behind it, the jolt. */
const DANGLE_T = 104, STOMP_T = 30;
const stompU = (f: number) => { const t = f % (DANGLE_T + STOMP_T) - DANGLE_T; return t < 0 ? -1 : t / STOMP_T; };

type Draw = (c: Ctx, f: number) => void;
/** A piece's prop, drawn in the buffer's own pixels over the face (and a jolt for the screen when it lands). */
interface Prop { draw: Draw; jolt: (f: number) => number; /** Bake its art now (ahead of the close-up). */ warm?: () => void; /** The whole face pushed at the lens (a headbutt): times the zoom. */ zoom?: (f: number) => number; /** His face losing it just now (the tantrum's: flushed, bulging, screaming). */ mad?: (f: number) => boolean }

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
        // (sat down on his traps, out at the screen's edges: shoulder pads, not up his jaw)
        const rx = side ? 242 : 38, ry = side ? 182 : 180;
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
  cape: {
    // (the vampire: the collar up round his head, the front of the cape in his fist swept up across his face (the eyes
    // over it, the BLAH), held, dropped; the price tag on the collar's barb, dangling, flung across his face by the sweep)
    draw: (c, f) => {
      const cv = capeCanvas(), sw = swirlCanvas(), tag = tagCanvas();
      if (!cv || !sw) return;
      c.drawImage(cv, 0, 0);
      const up = swirlUp(f), t = f % SWIRL;
      // (the tag: a pendulum off the collar's edge; the sweep throws it up over his face, and it flaps back down)
      const since = t - SW_DOWN, gust = since >= 0 && since < 70 ? Math.sin(Math.min(1, since / 10) * Math.PI / 2) * Math.exp(-Math.max(0, since - 10) / 26) : 0;
      const a = Math.sin(f * 0.13) * 0.35 - gust * 2.1 + gust * Math.sin(since * 0.9) * 0.25;
      const ax = FX + 126, ay = 64, L = 40, tx = ax + Math.sin(a) * L, ty = ay + Math.cos(a) * L;
      for (let k = 0; k <= 10; k++) { c.fillStyle = k % 2 ? '#F4F4F0' : '#B8B8C0'; c.fillRect(Math.round(ax + (tx - ax) * k / 10), Math.round(ay + (ty - ay) * k / 10), 1, 1); }
      if (tag) { c.save(); c.translate(Math.round(tx), Math.round(ty)); c.rotate(-a); c.drawImage(tag, -TAG_W / 2, -3); c.restore(); }
      // (the front of it, up from below the screen to under his eyes)
      c.drawImage(sw, 0, Math.round((1 - up) * 120 + (up === 1 ? Math.sin(f * 0.15) * 1.5 : 0)));
      // (the swoosh as it comes up)
      if (t >= SW_DOWN && t < SW_DOWN + SW_UP + 4) { c.fillStyle = 'rgba(200,200,255,0.55)'; for (let i = 0; i < 5; i++) c.fillRect(20 + i * 44, Math.round(150 - up * 30 + i * 3), 30, 2); }
    },
    jolt: (f) => ((f % SWIRL) === SW_DOWN + SW_UP - 2 ? 4 : 0),
    zoom: (f) => { const t = f % SWIRL - SW_DOWN; return t >= 0 && t < 24 ? 1 + 0.06 * Math.sin((t / 24) * Math.PI) : 1; },
    warm: () => { capeCanvas(); swirlCanvas(); tagCanvas(); },
  },
  legs: {
    // (the acceptance speech: the award up in his fist beside his face, bobbing with the words, a glint running up it;
    // then the flash kick: the award dropped, his own leg (the other statuette taped down its shin) swung up across the
    // screen in an arc and back down, the arc's motion lines behind the foot)
    draw: (c, f) => {
      const aw = awardCanvas(), kc = kickCanvas();
      if (!aw || !kc) return;
      const u = kickU(f);
      if (u < 0) {
        const t = f % (SPEECH + FLASH), up = Math.min(1, t / 12), bob = Math.sin(f * 0.22) * 2;
        const ax = 218, ay = Math.round(200 - up * 150 + bob);
        c.drawImage(aw, ax - AWARD_W / 2, ay);
        // (the glint running up the gold)
        const g = (f % 60) / 60;
        if (g < 0.5) { const gy = ay + 76 - g * 2 * 70; c.fillStyle = 'rgba(255,255,240,0.9)'; c.fillRect(ax - 6, Math.round(gy), 2, 2); c.fillRect(ax - 7, Math.round(gy) + 1, 4, 1); }
        if (t > 14 && t < 40) { c.fillStyle = '#FFF8C8'; for (const [sx, sy] of [[ax + 22, ay + 2], [ax - 24, ay + 14]] as const) { c.fillRect(sx - 1, sy - 4, 2, 9); c.fillRect(sx - 4, sy - 1, 9, 2); } }
      } else {
        // (pivot at his hip, off the bottom of the screen; from down at his far side, up over, and back)
        const swing = u < 0.55 ? Math.sin((u / 0.55) * Math.PI / 2) : Math.cos(((u - 0.55) / 0.45) * Math.PI / 2);
        const ang = -1.9 + swing * 2.5, px0 = FX + 30, py0 = GH + 70;
        // (the motion lines along the foot's arc behind it)
        if (u < 0.6) {
          c.fillStyle = 'rgba(255,255,255,0.75)';
          for (let k = 1; k < 7; k++) { const a = ang - k * 0.09, r = KICK_H - 6; c.fillRect(Math.round(px0 + Math.sin(a) * r) - 1, Math.round(py0 - Math.cos(a) * r) - 1, 3, 3); }
        }
        c.save(); c.translate(px0, py0); c.rotate(ang); c.drawImage(kc, -KICK_W / 2, -KICK_H); c.restore();
      }
    },
    jolt: (f) => (Math.abs(kickU(f) - 0.55) < 0.02 ? 6 : 0),
    zoom: (f) => { const u = kickU(f); return u < 0 ? 1 : 1 - 0.08 * Math.sin(u * Math.PI); },
    warm: () => { awardCanvas(); kickCanvas(); },
  },
  amulet: {
    // (dangled beside his face off the sequin chain, swinging slow, a twinkle running round the jewel; then he loses it:
    // the face goes (mad), the fist shakes, the jewel thrashes about on its chain, steam out of his ears, the scream at
    // the lens)
    draw: (c, f) => {
      const pc = pendCanvas(), fc = fistCanvas();
      if (!pc || !fc) return;
      const u = tantrum(f), t = f % (DANGLE + TANTRUM);
      const up = Math.min(1, t / 14);
      const shake = u >= 0 ? Math.round(Math.sin(f * 2.3) * 4) : 0;
      const fx = 238 + shake, fy = Math.round(200 - up * 186 + (u >= 0 ? Math.cos(f * 1.7) * 3 : Math.sin(f * 0.1) * 1.5));
      // (the swing: slow and even; in the tantrum, thrashing)
      const a = u < 0 ? Math.sin(f * 0.075) * 0.32 : Math.sin(f * 0.62) * 0.6 * Math.min(1, u * 6);
      const L = 50, bx = fx - 2, by = fy + 34, jx = bx + Math.sin(a) * L, jy = by + Math.cos(a) * L;
      // (the forearm in off the bottom right, the fist up beside his face)
      c.save(); c.translate(fx, fy + 24); c.rotate(-0.32); c.drawImage(fc, -FIST_W / 2, -24); c.restore();
      // (the chain: pink and silver sequins down to the bail)
      for (let k = 0; k <= 14; k++) { const q = k / 14, sx = bx + (jx - bx) * q - Math.sin(q * Math.PI) * (u < 0 ? 1.5 : 4) * Math.sign(a), sy = by + (jy - by) * q; c.fillStyle = k % 2 ? '#F9A8D4' : '#E5E7EB'; c.fillRect(Math.round(sx) - 1, Math.round(sy) - 1, 2, 2); }
      c.save(); c.translate(Math.round(jx), Math.round(jy)); c.rotate(-a); c.drawImage(pc, -PEND_X, -6); c.restore();
      // (the twinkle round the jewel)
      const tw = f % 40;
      if (tw < 10 && u < 0) {
        const s = tw < 5 ? tw / 5 : (10 - tw) / 5, n = Math.floor(f / 40), gx = jx - 8 + ((n * 7) % 16), gy = jy + 22 + ((n * 5) % 10);
        c.fillStyle = '#FFFFFF'; c.fillRect(Math.round(gx) - 1, Math.round(gy - 5 * s), 2, Math.round(10 * s) + 1); c.fillRect(Math.round(gx - 5 * s), Math.round(gy) - 1, Math.round(10 * s) + 1, 2);
      }
      if (u >= 0) {
        // (steam out of both ears, puffing up; the shake lines off his head)
        for (let i = 0; i < 8; i++) {
          const q = (f * 0.05 + i / 8) % 1, side = i % 2 ? 1 : -1, px = FX + side * (70 + q * 22) + Math.sin(f * 0.3 + i) * 3, py = 96 - q * 76, r = Math.round(4 + q * 9);
          c.fillStyle = `rgba(240,240,244,${(0.85 * (1 - q)).toFixed(2)})`; c.fillRect(Math.round(px - r / 2), Math.round(py - r / 2), r, r);
        }
        c.fillStyle = 'rgba(255,255,255,0.8)';
        for (let i = 0; i < 3; i++) for (const side of [-1, 1]) c.fillRect(Math.round(FX + side * (80 + i * 8)), Math.round(26 + i * 10 + (f % 4 < 2 ? 1 : -1)), 2, 9);
      }
    },
    jolt: (f) => (tantrum(f) >= 0 ? (f % 6 < 3 ? 3 : 1) : 0),
    zoom: (f) => { const u = tantrum(f); return u < 0 ? 1 : 1 + 0.22 * Math.sin((Math.min(1, u * 4) * Math.PI) / 2) * (u > 0.85 ? (1 - u) / 0.15 : 1); },
    mad: (f) => tantrum(f) >= 0,
    warm: () => { pendCanvas(); fistCanvas(); faceMad.warm(); },
  },
  armguards: {
    // (the fist up beside his face in the bracer, the LED scrolling BEEF; a dip; the uppercut up at the lens, swelling,
    // the motion lines under it; then back)
    draw: (c, f) => {
      const fc = fistCanvas(), bc = brcCanvas();
      if (!fc || !bc) return;
      const t = f % (SHOW_T + DIP_T + CUT_T), u = cutU(f);
      const up = Math.min(1, t / 14);
      let x = 226, y = Math.round(206 - up * 180 + Math.sin(f * 0.09) * 2), s = 1, a = -0.18;
      if (u >= 0 && u < DIP_T) { y += Math.round(Math.sin((u / DIP_T) * Math.PI / 2) * 26); a = -0.3; }
      else if (u >= DIP_T) {
        const k = (u - DIP_T) / CUT_T, out = k < 0.45 ? Math.sin((k / 0.45) * Math.PI / 2) : Math.cos(((k - 0.45) / 0.55) * Math.PI / 2);
        x = Math.round(226 + (FX + 40 - 226) * out); y = Math.round(52 + 26 - out * 62); s = 1 + out * 0.9; a = -0.18 + out * 0.12;
        // (the motion lines under the fist as it comes)
        if (k < 0.5) { c.fillStyle = 'rgba(255,255,255,0.75)'; for (let i = 0; i < 5; i++) c.fillRect(Math.round(x - 26 + i * 12), Math.round(y + 70 * s + i * 3), 2, 26); }
      }
      c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
      c.drawImage(fc, -FIST_W / 2, -24);
      c.drawImage(bc, -BRC_W / 2, 26);
      drawLed(c, -BRC_W / 2 + BRC_LED.x, 26 + BRC_LED.y, BRC_LED.w, BRC_LED.h, f);
      c.restore();
      // (its LEDs' red on the dark round it while it's shown off)
      if (u < 0) { c.fillStyle = 'rgba(255,59,59,0.10)'; c.fillRect(x - 34, y + 40, 68, 40); }
    },
    jolt: (f) => (cutU(f) === DIP_T + Math.round(CUT_T * 0.45) ? 6 : 0),
    zoom: (f) => { const u = cutU(f); if (u < DIP_T) return 1; const k = (u - DIP_T) / CUT_T; return 1 + 0.1 * Math.sin(Math.min(1, k * 1.6) * Math.PI); },
    warm: () => { fistCanvas(); brcCanvas(); },
  },
  sabatons: {
    // (the boot dangled off his fist by its pull strap, swinging, the cowbell under it clanking (ring lines off it at each
    // end of its swing); then the stomp at the lens: heel first down out of the top right, swelling, and back)
    draw: (c, f) => {
      const fc = fistCanvas(), bt = bootCanvas(), bl = bellCanvas();
      if (!fc || !bt || !bl) return;
      const u = stompU(f), t = f % (DANGLE_T + STOMP_T), up = Math.min(1, t / 14);
      if (u < 0) {
        const fx = 212, fy = Math.round(214 - up * 190 + Math.sin(f * 0.1) * 1.5), k = 0.95;
        const a = Math.sin(f * 0.09) * 0.14, ba = Math.sin(f * 0.09 - 0.8) * 0.5;
        // (the forearm in off the bottom right, the fist up beside his face; the boot hung off the strap in it, swinging in
        // front of the arm; then the fist again over the strap (just the fist: the canvas's top), round it)
        c.save(); c.translate(fx, fy + 24); c.rotate(-0.2); c.drawImage(fc, -FIST_W / 2, -24); c.restore();
        c.save(); c.translate(fx - 2, fy + 10); c.rotate(a);
        c.drawImage(bt, -20 * k, 2 - 2 * k, BOOT_W * k, BOOT_H * k);
        // (the cowbell off a thong round the ankle, on its own swing)
        const ax = 30 * k, ay = 2 + 58 * k;
        c.save(); c.translate(ax, ay); c.rotate(ba - a);
        c.fillStyle = '#0A0604'; c.fillRect(-2, -2, 4, 10); c.fillStyle = '#7A4E26'; c.fillRect(-1, -2, 2, 10);
        c.drawImage(bl, -BELL_W * 0.45, 7, BELL_W * 0.9, BELL_H * 0.9);
        c.restore();
        c.restore();
        c.save(); c.translate(fx, fy + 24); c.rotate(-0.2); c.drawImage(fc, 0, 0, FIST_W, 44, -FIST_W / 2, -24, FIST_W, 44); c.restore();
        // (the clank: ring lines off the bell at each end of its swing)
        const ph = Math.cos(f * 0.09 - 0.8);
        if (Math.abs(ph) > 0.9) {
          const side = ph > 0 ? 1 : -1, bx = fx - 2 + ax + side * 16, by = fy + 10 + ay + 22;
          c.fillStyle = '#FFF2B0';
          for (let i = 0; i < 3; i++) c.fillRect(Math.round(bx + side * (i * 5)), Math.round(by - 8 + i * 6), side * 7, 2);
        }
      } else {
        // (the stomp: down out of the top right at the lens, heel first, swelling; then back)
        const out = u < 0.45 ? Math.sin((u / 0.45) * Math.PI / 2) : Math.cos(((u - 0.45) / 0.55) * Math.PI / 2);
        const x = 250 + (FX + 24 - 250) * out, y = -40 + (FY + 30 + 40) * out, s = 0.8 + out * 1.1;
        if (u < 0.5) { c.fillStyle = 'rgba(255,255,255,0.75)'; for (let i = 0; i < 5; i++) c.fillRect(Math.round(x + 4 + i * 10), Math.round(y - 56 * s - i * 6), 2, 30); }
        c.save(); c.translate(x, y); c.rotate(-0.55); c.scale(s, s);
        c.drawImage(bt, -BOOT_W / 2, -BOOT_H / 2);
        c.drawImage(bl, -BOOT_W / 2 + 24, -BOOT_H / 2 + 56, BELL_W * 0.8, BELL_H * 0.8);
        c.restore();
        // (the bell's DONG as it lands)
        if (out > 0.85) { c.fillStyle = '#FFF2B0'; for (let i = 0; i < 4; i++) { const a = -0.6 + i * 0.4; c.fillRect(Math.round(x + Math.cos(a) * 80), Math.round(y + Math.sin(a) * 58), 8, 2); } }
      }
    },
    jolt: (f) => (Math.abs(stompU(f) - 0.45) < 0.035 ? 7 : 0),
    zoom: (f) => { const u = stompU(f); return u < 0 ? 1 : 1 + 0.12 * Math.sin(Math.min(1, u * 1.6) * Math.PI); },
    warm: () => { fistCanvas(); bootCanvas(); bellCanvas(); },
  },
};

/** His gross-up: (cx, cy) where the middle of his face goes on the screen, `zoom` 1 at the hold; `piece` the one he's
 *  holding (its prop and animation over him), `talking` his mouth going. */
export const drawBenGross = (c: Ctx, cx: number, cy: number, zoom: number, f: number, piece: ArmorPiece | null, talking: boolean) => {
  const prop = piece ? PROPS[piece] : undefined;
  // (losing it: the screaming face, once it's painted (not stalled for there and then))
  const s = prop?.mad?.(f) && faceMad.ready('c') ? faceMad('c') : face(talking && f % 12 < 6 ? 'b' : 'a');
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
