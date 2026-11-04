// ZORZARBLAX'S GROSS-UP (the standing rule for every close-up: "gross ren and stimpy style close ups": grossKit.ts):
// the fight's first look at him, turned round from the summit's view. Three-quarters on, huge, too close: the
// cinder-block jaw (his dad's) filling the bottom of the frame, the under-bite's pegs up over the lip (yellow, brown at
// the gums, one gone, one chipped), his mom's lipstick smeared round the slot of his mouth, a cold sore; twenty-six and
// still breaking out (a whitehead ready to go on the jaw, blackheads all over the cranium); the tiny cranium up on the
// front of it with mom's curlers still in the crest, her wart with its long hair; his THREE eyes, none matching: two of
// his dad's, beady, yellow, bloodshot, not level, and her big lashed one up top, mascara run, looking off at nothing;
// the veins up the neck; the gaming headset's mic in his face; slime over everything, catching the night.
// Live: the whitehead throbbing, the slime dripping off the jaw, the big eye's lazy drift.

import {
  type Ctx, type Buf, GW, GH, R, hexU, newBuf, cloneBuf, setSeed, rnd, ball, tint, poly, seg, plot, eyeball, skinPost, inkEdges, stamps, drawGrossStamp, grossBackdrop, TOOTH, TOOTH_B, MOUTH, GUM, VEIN, M_SKIN, M_MOUTH, M_OTHER, M_METAL,
} from '../../grossKit';

const FX = 136, FY = 110;
const HIDE = R('#D2E2A0', '#A8C46E', '#7E9E4C', '#5E7E38', '#42602A', '#2A4018', '#18280C', '#0A1004');
const BELLY = R('#F2ECB8', '#DCD48E', '#BEB46C', '#9A9050', '#6E6634', '#3E3818');
const LIP = R('#FF9AAE', '#F4607E', '#D23A5C', '#A82444', '#741430', '#3A0614');
const CURLER = R('#DCEBFF', '#9CC4FF', '#5A92F0', '#2E62C8', '#1A3A86', '#0A1A44');
const YEL = R('#FFFBD0', '#F6E46A', '#D8C03E', '#A8901E', '#6A5A10', '#2A2206');
const PURPLE = R('#E6D0FF', '#B48AF4', '#8452D8', '#5A2AA8', '#341274', '#16063A');
const HEAD = R('#9A9AA8', '#6A6A78', '#46464E', '#2C2C34', '#18181C', '#060608');
const SLIME = hexU('#A8E03A'), SLIME_L = hexU('#EAFFB0');

type Key = 'a' | 'b';
const build = (key: Key): Buf => {
  setSeed(7711);
  const b = newBuf();
  // the neck, wide, going off the bottom right; the veins up it
  poly(b, [150, 120, 272, 100, 272, 204, 120, 204], HIDE.slice(2), M_SKIN, { tilt: 0.6 });
  for (let k = 0; k < 5; k++) { let x = 170 + k * 20, y = 204; for (let s = 0; s < 40; s++) { x += (rnd() - 0.6) * 2; y -= 2; seg(b, x, y, x, y - 2, VEIN[3], 2, undefined, M_SKIN); plot(b, x - 1, y, VEIN[1], undefined, M_SKIN); } }
  // the jaw: the cinder block, filling the bottom of the frame
  poly(b, [24, 112, 236, 98, 252, 150, 236, 204, 18, 204], HIDE, M_SKIN, { tilt: 0.3 });
  ball(b, 132, 150, 122, 58, HIDE, { mat: M_SKIN, soft: 0.3 });
  ball(b, 120, 170, 110, 40, BELLY, { mat: M_SKIN, soft: 0.4, only: (x, y) => y > 150 });
  // the mouth's slot, open on 'b' (the screech), the lipstick smeared round it past the lines
  const open = key === 'b';
  const my = 138, mh = open ? 34 : 10;
  ball(b, 132, my, 98, mh + 8, LIP, { mat: M_OTHER, line: true, lw: 1.4 });
  ball(b, 132, my, 90, mh, MOUTH, { mat: M_MOUTH, line: true });
  if (open) { ball(b, 132, my + mh * 0.4, 60, mh * 0.5, GUM, { mat: M_MOUTH, soft: 0.5 }); ball(b, 150, my + mh * 0.5, 30, 10, R('#FFBCC8', '#F894A4', '#E87286', '#C85068', '#9A344C', '#4A1020'), { mat: M_MOUTH }); }
  // (the cold sore at the corner)
  ball(b, 40, 132, 7, 6, R('#FFD6C8', '#F4A08A', '#D86A54', '#A8402E', '#6A1E10'), { line: true, lw: 0.8 });
  // the under-bite's pegs, up over the top lip: yellow, brown at the gums, one gone, one chipped
  for (let k = 0; k < 9; k++) {
    if (k === 5) continue;
    const x = 52 + k * 18, h = 26 + (k % 3) * 5, top = my - mh * 0.3 - h + (open ? 0 : 6);
    poly(b, [x, top + 4, x + 12, top, x + 13, top + h, x + 1, top + h], k % 4 === 2 ? TOOTH_B : TOOTH, M_OTHER, { tilt: 0.2 });
    tint(b, x + 6, top + h - 3, 7, 4, hexU('#5A3A12'), 0.5, M_OTHER);
    if (k === 7) for (let yy = top; yy < top + 7; yy++) for (let xx = x + 6; xx < x + 13; xx++) if (xx - x - 6 > yy - top) plot(b, xx, yy, MOUTH[2]);
  }
  // the cranium: tiny, up on the front of the jaw; blackheads all over it
  ball(b, 118, 76, 58, 44, HIDE, { mat: M_SKIN, line: (dx, dy) => dy < 0.4 });
  // mom's curlers in the crest off the back of it
  ball(b, 182, 56, 40, 22, R('#6A4A30', '#4A3020', '#2E1C12', '#1A0E08', '#0A0402'), { mat: M_OTHER, line: true });
  for (const [cx, cy] of [[158, 46], [178, 38], [200, 42], [212, 58], [190, 58]] as const) ball(b, cx, cy, 9, 9, CURLER, { mat: M_METAL, line: true, lw: 1 });
  // mom's wart, its hair
  ball(b, 72, 104, 8, 7, R('#B8C878', '#8A9A50', '#6A7A3A', '#4A5A2A', '#2A3214'), { line: true, lw: 0.9 });
  seg(b, 72, 98, 68, 80, hexU('#1A1208'), 1); seg(b, 68, 80, 62, 72, hexU('#1A1208'), 1);
  // the eyes: dad's two (beady, yellow, bloodshot, not level), mom's big lashed one up top (purple, mascara run)
  eyeball(b, 98, 82, { rx: 11, ry: 10, sclera: YEL, iris: R('#FFE8A0', '#E8B838', '#B0801A', '#704C0A', '#3A2404'), ir: 0.3, pr: 0.6, veins: 10 });
  eyeball(b, 138, 88, { rx: 8, ry: 7, sclera: YEL, iris: R('#FFE8A0', '#E8B838', '#B0801A', '#704C0A', '#3A2404'), ir: 0.3, pr: 0.6, veins: 8 });
  eyeball(b, 116, 50, { rx: 18, ry: 14, iris: PURPLE, ir: 0.5, idx: -0.35, idy: 0.2, pr: 0.45, veins: 6 });
  for (let k = 0; k < 7; k++) seg(b, 102 + k * 5, 38, 98 + k * 6, 28 - (k % 2) * 3, hexU('#0A0610'), 1.4);
  for (let k = 0; k < 3; k++) seg(b, 108 + k * 7, 62, 107 + k * 7, 68 + k * 3, hexU('#1E1430'), 1.2);
  // (acne: a whitehead ready to go on the jaw, its friends; blackheads on the cranium)
  for (const [x, y, r] of [[200, 132, 7], [214, 150, 4], [186, 160, 3], [70, 166, 4]] as const) ball(b, x, y, r, r, R('#FFFFF0', '#FFE8D0', '#F4A890', '#D86A5A', '#A8403A'), { line: true, lw: 0.6 });
  skinPost(b, hexU('#2A4018'), (x, y) => (y < 118 ? 0.12 : 0.05), { blackheads: (_x, y) => y < 118, shine: 0.1 });
  // the headset's mic, round into his face off the right
  seg(b, 272, 120, 222, 116, HEAD[3], 5, M_METAL); seg(b, 272, 119, 224, 115, HEAD[1], 2, M_METAL);
  ball(b, 216, 116, 9, 7, HEAD, { mat: M_METAL, line: true });
  inkEdges(b, M_SKIN, hexU('#0A1004'), [M_OTHER, M_MOUTH, M_METAL]);
  // (the slime over him)
  for (let k = 0; k < 40; k++) { const x = 20 + rnd() * 230, y = 20 + rnd() * 170; if (b.mat[(y | 0) * GW + (x | 0)] === M_SKIN) { plot(b, x, y, SLIME); plot(b, x + 1, y, SLIME_L); } }
  return b;
};
const get = stamps<Key>(k => cloneBuf(build(k)), ['a', 'b']);

/** His gross-up: (cx, cy) where his middle goes, `zoom` 1 at the hold; the screech's mouth on `open`. */
export const drawKidGross = (c: Ctx, cx: number, cy: number, zoom: number, f: number, open: boolean, jolt = 0) => {
  const s = get(open ? 'b' : 'a');
  drawGrossStamp(c, s.img, cx, cy, FX, FY, zoom, f, jolt, box => {
    // (the whitehead throbbing)
    const p = 0.5 + 0.5 * Math.sin(f * 0.25);
    box(198, 130, 4, 3, p > 0.6 ? '#FFFFFF' : '#FFF4C8');
    // (slime off the jaw, a drop at a time)
    for (const [x, y, ph] of [[60, 196, 0], [150, 198, 21], [228, 180, 44]] as const) {
      const t = ((f + ph) % 64) / 64;
      if (t < 0.45) { box(x, y, 2, 4 + t * 10, '#A8E03A'); continue; }
      const d = (t - 0.45) / 0.55;
      box(x, y + d * d * 30, 2, 3, '#A8E03A'); box(x, y + d * d * 30, 1, 1, '#EAFFB0');
    }
    // (mom's eye drifting, looking at nothing)
    const dx = Math.round(Math.sin(f * 0.03) * 2);
    box(110 + dx, 50, 3, 3, '#16063A');
  });
};
export const drawKidGrossBack = (c: Ctx, W: number, H: number) => grossBackdrop(c, W, H, ['#04061A', '#080E2A', '#121A40', '#1C2854', '#2A3868']);
export const warmKidGross = () => get.warm();
void GH;
