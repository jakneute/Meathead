// CON-FUCK-TIOUS's GROSS-UP (the owner: "do a 'gross up' of every meetup with him holding the armor piece he will give
// you. he's doing an animation related to the item you will get"; the standing rule: grotesque Ren & Stimpy close-ups,
// grossKit.ts). One face for every land; each armor piece brings its own prop and its own animation (PROPS below).
//
// The face: the old man huge in frame. A bald dome mottled with liver spots and a few long stray hairs, forehead
// wrinkles in deep stepped creases, white tufts over huge ears (hair out of them, wax), the topknot; brows like two
// white waterfalls drooping past his eyes; the eyes slitted and bloodshot, bags under them, crow's feet; a broad nose
// shining with grease, nostril hairs; the long thin white mustache hanging down past his chin either side, a wisp of
// goatee; the smirk, crooked yellow teeth, a gold one, a toothpick; a mole with a hair in it; the gi's white lapels.
// Painted once (the stamp per mouth: shut, talking), the props baked once each; the live bits (the props' moves, a bead
// of sweat, the toothpick wagging) drawn over each frame.
//
// THE PIECES' PROPS (add one per piece as the lands get their meetups):
//   hands: the giant white four-finger cartoon gloves, on him: a beatdown flurry at the camera, left, right, left,
//          the motion lines, a jolt each time one lands.

import {
  type Ctx, type Buf, GH, R, hexU, WHITE, newBuf, setSeed, rnd, matAt, plot, seg, path, ball, tint, poly, bead, eyeball, teeth, skinPost, stubble, hairs, stamps, drawGrossStamp, grossBackdrop, toCanvas, M_SKIN, M_HAIR, M_MOUTH, M_OTHER, M_CLOTH, SCLERA_R, MOUTH, HAIRLINE, TONGUE,
} from '../../grossKit';
import type { ArmorPiece } from '../state';

const FX = 150, FY = 92;

const SKIN = R('#FFE6C8', '#F6CFA4', '#E6B482', '#D09866', '#B47A4C', '#8E5A34', '#643C20', '#3A200E');
const SPOT = hexU('#8E5A34');
const WHITE_HAIR = R('#FFFFFF', '#EEEEF4', '#D4D2DE', '#B0AEBE', '#86849A', '#4A4858');
const IRIS = R('#B88A5A', '#94683C', '#704A24', '#523214', '#341E08', '#180C02');
const LIP = R('#E8A88C', '#D08A70', '#B46C56', '#94523E', '#6E3828', '#3E1A10');
const GI = R('#FFFFFF', '#F2F0F6', '#DAD8E4', '#B8B6C8', '#8C8AA0', '#4A485A');
const GLOVE = R('#FFFFFF', '#F6F6FA', '#E2E2EC', '#C6C6D6', '#9C9CB4', '#2A2438');

type Key = 'a' | 'b';

function* build(key: Key): Generator<void, Buf> {
  setSeed(4242);
  const b = newBuf();
  yield;
  // ---- the gi's lapels (crossed, white, frayed), a vee of old saggy chest and white chest hair
  poly(b, [FX - 140, GH, FX + 130, GH, FX + 96, 168, FX + 10, 186, FX - 100, 166], GI, M_CLOTH, { tilt: 0.3 });
  poly(b, [FX - 40, GH, FX + 30, GH, FX + 6, 182], SKIN.slice(1), M_SKIN, { line: true });
  for (let k = 0; k < 40; k++) { const x = FX - 16 + rnd() * 32, y = 190 + rnd() * 12; if (matAt(b, x, y) === M_SKIN) seg(b, x, y, x + (rnd() - 0.5) * 3, y - 3, WHITE_HAIR[k % 3]); }
  for (let k = 0; k < 8; k++) path(b, [FX - 120 + k * 4, 170 + k * 3, FX - 40 + k * 3, 200], GI[3], 1, undefined, M_CLOTH);
  yield;
  // ---- the ears: huge, the lobes long, hair out of the holes
  for (const s of [-1, 1]) {
    ball(b, FX + s * 74, 104, 15, 26, SKIN, { mat: M_SKIN, line: true, lw: 1.4 });
    ball(b, FX + s * 74, 104, 7, 15, SKIN.slice(2), { mat: M_SKIN, flat: 0.5 });
    hairs(b, 9, () => [FX + s * 72 + (rnd() - 0.5) * 6, 100 + rnd() * 10], 7, s > 0 ? -0.4 : Math.PI + 0.4, WHITE_HAIR[1], M_SKIN, 0.8);
    tint(b, FX + s * 74, 112, 3, 4, hexU('#C89A2A'), 0.6, M_SKIN);
  }
  yield;
  // ---- the head: a tall bald dome over a long face
  ball(b, FX, FY, 66, 82, SKIN, { mat: M_SKIN, line: true, lw: 1.6 });
  yield;
  // (forehead wrinkles: deep, stepped, five of them)
  for (let k = 0; k < 5; k++) {
    const y = 40 + k * 8, w = 40 - Math.abs(k - 2) * 4;
    const pts: number[] = []; for (let x = -w; x <= w; x += 6) pts.push(FX + x, y + Math.sin(x * 0.12 + k) * 2 + (x * x) / 900);
    path(b, pts, SKIN[6], 1, undefined, M_SKIN); path(b, pts.map((v, i) => (i % 2 ? v + 1 : v)), SKIN[1], 1, undefined, M_SKIN);
  }
  // (liver spots on the dome; a few long stray hairs off it)
  for (let k = 0; k < 16; k++) { const x = FX - 44 + rnd() * 88, y = 14 + rnd() * 30; if (matAt(b, x, y) === M_SKIN) tint(b, x, y, 2 + rnd() * 4, 2 + rnd() * 3, SPOT, 0.55, M_SKIN, 0.6); }
  for (let k = 0; k < 4; k++) { const x = FX - 30 + k * 18; path(b, [x, 14 + k * 2, x + 6, 2, x + 14, -2], WHITE_HAIR[2], 1); }
  // (the topknot, up behind the dome)
  ball(b, FX + 34, 8, 12, 9, WHITE_HAIR, { mat: M_HAIR, line: true });
  seg(b, FX + 28, 16, FX + 40, 16, HAIRLINE, 2);
  yield;
  // ---- the side tufts, white and wiry, over the ears
  for (const s of [-1, 1]) for (let k = 0; k < 60; k++) {
    const x = FX + s * (54 + rnd() * 14), y = 66 + rnd() * 30;
    seg(b, x, y, x + s * (4 + rnd() * 6), y - 3 + rnd() * 8, WHITE_HAIR[k % 4], 1, M_HAIR);
  }
  yield;
  // ---- the eyes: slits, bloodshot, bags, crow's feet; the left a hair wider (the dry look)
  for (const s of [-1, 1]) {
    const ex = FX + s * 27, ey = 88, open = s < 0 ? 4.5 : 3.2;
    eyeball(b, ex, ey, { rx: 12, ry: 8, sclera: SCLERA_R, iris: IRIS, ir: 5, idx: s * 1, pr: 2, veins: 10, top: (x) => ey - open + Math.abs(x - ex) * 0.12, bot: (x) => ey + open - Math.abs(x - ex) * 0.08, lid: SKIN.slice(1) });
    // (the bags, three deep)
    for (let k = 0; k < 3; k++) path(b, [ex - 12, ey + 7 + k * 4, ex, ey + 10 + k * 5, ex + 12, ey + 7 + k * 4], SKIN[5 + (k % 2)], 1, undefined, M_SKIN);
    tint(b, ex, ey + 12, 12, 6, hexU('#7A4A6A'), 0.25, M_SKIN);
    // (crow's feet)
    for (let k = -1; k <= 1; k++) path(b, [ex + s * 14, ey + k * 2, ex + s * 24, ey + k * 7 - 1], SKIN[6], 1, undefined, M_SKIN);
  }
  yield;
  // ---- the brows: two white waterfalls, out and down past the eyes
  for (const s of [-1, 1]) for (let k = 0; k < 140; k++) {
    const t = rnd(), x0 = FX + s * (8 + t * 30), y0 = 72 - t * 4;
    const len = 10 + t * 26 + rnd() * 6;
    path(b, [x0, y0, x0 + s * len * 0.5, y0 + len * 0.2, x0 + s * len * 0.8, y0 + len * 0.7], WHITE_HAIR[k % 5], 1);
  }
  yield;
  // ---- the nose: broad, shining, the nostrils dark, hairs out of them
  ball(b, FX, 120, 20, 16, SKIN, { mat: M_SKIN, line: (_dx, dy) => dy > -0.1, lit: 1.08 });
  ball(b, FX - 2, 100, 9, 18, SKIN, { mat: M_SKIN, flat: 0.6 });
  for (const s of [-1, 1]) { ball(b, FX + s * 9, 127, 5, 3.4, R('#3A1A0E', '#2A1008', '#1A0804', '#0A0200'), { mat: M_OTHER }); hairs(b, 6, () => [FX + s * 9 + (rnd() - 0.5) * 4, 129], 5, Math.PI / 2, WHITE_HAIR[2], undefined, 0.8); }
  plot(b, FX - 6, 112, WHITE); plot(b, FX - 5, 112, WHITE); plot(b, FX - 6, 113, WHITE);
  yield;
  // ---- the mouth: the smirk off to one side (talking: open)
  const open = key === 'b';
  const cx = FX + 6, cy = 148, mw = 26, mh = open ? 10 : 3;
  const top = (x: number) => cy - mh * 0.4 - (x - cx) * 0.12 + Math.abs(x - cx) * 0.04;
  const bot = (x: number) => cy + mh * (1 - ((x - cx) / mw) ** 2) - (x - cx) * 0.12;
  for (let x = cx - mw; x <= cx + mw; x++) for (let y = Math.floor(top(x)) - 3; y <= bot(x) + 3; y++) {
    if (y < top(x) - 2.5 || y > bot(x) + 2.5) continue;
    plot(b, x, y, y < top(x) || y > bot(x) ? LIP[y < top(x) ? 3 : 2] : MOUTH[Math.min(4, Math.round(((y - top(x)) / Math.max(1, bot(x) - top(x))) * 4))], y < top(x) || y > bot(x) ? M_OTHER : M_MOUTH);
  }
  teeth(b, cx - mw + 4, cx + mw - 4, (x) => top(x) + 0.5, 1, open ? 6 : 3, { tw: 5, gaps: [3], gold: [5], rot: [1, 7] });
  if (open) { teeth(b, cx - mw + 8, cx + mw - 8, (x) => bot(x) - 0.5, -1, 4, { tw: 5, gaps: [1, 4] }); ball(b, cx + 4, cy + mh - 3, 10, 4, TONGUE, { only: (x, y) => matAt(b, x, y) === M_MOUTH }); }
  yield;
  // ---- the mustache: thin, white, out from under the nose and down past his chin either side, a wisp of goatee
  for (const s of [-1, 1]) for (let k = 0; k < 26; k++) {
    const o = (rnd() - 0.5) * 3;
    path(b, [FX + s * 6, 136 + o, FX + s * 30, 140 + o, FX + s * 38 + o, 160, FX + s * 40 + o, 186, FX + s * 38 + o, 202], WHITE_HAIR[k % 4], 1);
  }
  for (let k = 0; k < 18; k++) { const o = (rnd() - 0.5) * 6; path(b, [FX + 4 + o, 166, FX + 6 + o * 1.3, 182, FX + 4 + o * 1.6, 196], WHITE_HAIR[k % 4], 1); }
  yield;
  // ---- the mole on his cheek, the hair out of it; stubble gray along the jaw; the pores and the grease
  ball(b, FX - 46, 134, 4, 3.6, R('#9A6A4A', '#7A4A2E', '#5A3018', '#3A1A0A', '#1A0802'), { mat: M_OTHER, line: true });
  path(b, [FX - 46, 132, FX - 50, 122, FX - 47, 114], WHITE_HAIR[1]);
  stubble(b, (x, y) => (y > 150 ? 1 - Math.abs(x - FX) / 90 : 0), SKIN[6], 0.35);
  skinPost(b, SKIN[7], (x, y) => (((x - FX) / 24) ** 2 + ((y - 118) / 18) ** 2 < 1 ? 0.2 : 0.05), { blackheads: (x, y) => ((x - FX) / 22) ** 2 + ((y - 118) / 16) ** 2 < 1, shine: 0.2 });
  yield;
  // ---- sweat on the dome
  for (let k = 0; k < 7; k++) { const x = FX - 40 + rnd() * 80, y = 26 + rnd() * 26; if (matAt(b, x, y) === M_SKIN) bead(b, x, y, 1.4 + rnd() * 1.4, SKIN); }
  // (age: a warm wash low down, the cheeks ruddy)
  for (const s of [-1, 1]) tint(b, FX + s * 40, 120, 16, 12, hexU('#D85A4A'), 0.18, M_SKIN);
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
/** Behind him: a dojo's dim lamplight, in bands. */
export const drawBenGrossBack = (c: Ctx, W: number, H: number) => grossBackdrop(c, W, H, ['#1A1208', '#2A1C0C', '#3E2A12', '#56391A', '#704A22']);
/** Paint him ahead (a few ms per idle moment) when his meetup's coming up. */
export const warmBenGross = () => { face.warm(); for (const p of Object.values(PROPS)) p?.warm?.(); };
