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

import {
  type Ctx, type Buf, GH, R, hexU, WHITE, newBuf, setSeed, rnd, matAt, plot, seg, path, ball, tint, poly, bead, eyeball, teeth, skinPost, stubble, hairs, vein, stamps, drawGrossStamp, grossBackdrop, toCanvas, M_SKIN, M_HAIR, M_MOUTH, M_OTHER, M_CLOTH, SCLERA_R, MOUTH, TONGUE, VEIN_B, BLOOD,
} from '../../grossKit';
import type { ArmorPiece } from '../state';

const FX = 150, FY = 92;

const SKIN = R('#FCE0BE', '#EEC496', '#DCA674', '#C48858', '#A66C42', '#82502E', '#5A341C', '#341A0A');
const GRAY = R('#F2F2F6', '#D2D2DA', '#AEAEBA', '#8A8A98', '#646474', '#3A3A48');
const IRIS = R('#9A7048', '#7A522E', '#5A381A', '#40240C', '#281404', '#140800');
const LIP = R('#E2A080', '#C88264', '#AC6650', '#8C4C3A', '#683226', '#3A1610');
const TANK = R('#C8C8D0', '#A8A8B4', '#8A8A98', '#6C6C7C', '#50505E', '#2A2A36');
const GLOVE = R('#FFFFFF', '#F6F6FA', '#E2E2EC', '#C6C6D6', '#9C9CB4', '#2A2438');

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
  // (scuffs: it's been used)
  tint(b, gx + 18, gy - 4, 8, 6, hexU('#C8B89A'), 0.35, M_OTHER); tint(b, gx - 26, gy + 16, 6, 4, hexU('#A89A86'), 0.3, M_OTHER);
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

type Draw = (c: Ctx, f: number) => void;
/** A piece's prop, drawn in the buffer's own pixels over the face (and a jolt for the screen when it lands). */
interface Prop { draw: Draw; jolt: (f: number) => number; /** Bake its art now (ahead of the close-up). */ warm?: () => void }

const FLURRY = 11;
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
};

/** His gross-up: (cx, cy) where the middle of his face goes on the screen, `zoom` 1 at the hold; `piece` the one he's
 *  holding (its prop and animation over him), `talking` his mouth going. */
export const drawBenGross = (c: Ctx, cx: number, cy: number, zoom: number, f: number, piece: ArmorPiece | null, talking: boolean) => {
  const s = face(talking && f % 12 < 6 ? 'b' : 'a');
  const prop = piece ? PROPS[piece] : undefined;
  drawGrossStamp(c, s.img, cx, cy, FX, FY, zoom, f, prop?.jolt(f) ?? 0, (box) => {
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
