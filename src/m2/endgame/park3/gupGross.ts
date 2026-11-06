// GUPPLAX'S GROSS-UP (the standing rule for every close-up: "gross ren and stimpy style close ups": grossKit.ts): the
// fight's first look at him, up on his lifeguard tower, leaning down into the lens, too close. Front-on and a little
// up from under: a big wet green head too heavy for its neck, the light coming through the flesh at its edges; his two
// eyestalks curling up off the top of the skull out of frame and back down into it (veins up them, the eyes on the
// ends yellow and slit-pupiled and bloodshot, one looking at you and one not); the two little eyes sunk in the face,
// pink-rimmed and mean; the fat bulb of a nose with zinc slapped across it (cracked, caked in the pores), blackheads
// in a field round it; the gills either side of the neck flaring, red inside; buck teeth with gaps in a lipless mouth,
// a yellow whistle clamped in it on a white lanyard; sweat beading all over him; slime strung off the chin. Six
// nipples and the gut's top at the bottom of the frame, the red trunks' waistband under it.
// Live: the whistle's pea rattling (a glint), the gills pulsing, a bead of sweat running, the slime off the chin.

import {
  type Ctx, type Buf, R, hexU, newBuf, setSeed, rnd, matAt, ball, tint, poly, path, plot, eyeball, skinPost, vein, inkEdges, teeth, bead, stamps, drawGrossStamp, grossBackdrop,
  MOUTH, SCLERA_Y, M_SKIN, M_MOUTH, M_OTHER, M_METAL, M_CLOTH,
} from '../../grossKit';

const FX = 136, FY = 100;
const SKIN = R('#E8FFD8', '#B8F0A0', '#8ADC78', '#62C05A', '#44A04A', '#2E803A', '#1E602C', '#12401E', '#062010');
const DEEP = R('#9ADC88', '#6AB862', '#4A9448', '#327034', '#1E4E22', '#0E2C12');
const IRIS = R('#FFF6A0', '#F4E040', '#D8B414', '#A07A08', '#5A3A02');
const ZINC = R('#FFFFFF', '#F4F6F8', '#DCE2E8', '#B8C2CC', '#8A96A2', '#4A5460');
const GILL = R('#FF9AA8', '#F06A80', '#D0405A', '#A0243E', '#6A1026', '#300410');
const WHISTLE = R('#FFF8C0', '#F8E070', '#E8C020', '#B88A10', '#7A5A06', '#3A2802');
const LANYARD = R('#FFFFFF', '#E8ECF0', '#C8D0D8', '#98A4B0', '#5A6470');
const TRUNK = R('#FF9A8A', '#F05A48', '#D02A24', '#A01414', '#6A0808', '#300202');
const NIP = R('#E8B8D8', '#C890B8', '#A06A92', '#7A4A6E', '#4A2440');
const VEINS = R('#C8F0B0', '#9AD08A', '#6AA86A', '#44804A', '#285A30', '#0E2A14');
const SLIME = hexU('#D8FFC8'), SLIME_D = hexU('#8AC878'), SWEAT = R('#FFFFFF', '#E0FFE8', '#A8E8C0', '#5AA078');

type Key = 'a' | 'b';
function* build(key: Key): Generator<void, Buf> {
  setSeed(7713);
  const open = key === 'b';
  const b = newBuf();
  yield;
  // ---- the gut at the bottom of the frame: its top, two of the six nipples, the trunks' waistband just showing
  ball(b, 136, 236, 150, 70, SKIN.slice(2), { mat: M_SKIN, soft: 0.5 });
  for (const [x, y] of [[92, 192], [180, 190]] as const) { ball(b, x, y, 7, 5, NIP, { mat: M_OTHER, line: true, lw: 0.7 }); plot(b, x - 2, y - 2, NIP[0]); }
  poly(b, [0, 200, 272, 200, 272, 204, 0, 204], TRUNK, M_CLOTH, { tilt: 0 });
  yield;
  // ---- the neck: fat, folded; the gills either side flaring, red inside
  poly(b, [62, 120, 210, 120, 236, 196, 36, 196], SKIN.slice(2), M_SKIN, { tilt: 0.2 });
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const x = 136 + s * (72 + k * 9), y = 150 + k * 6;
    poly(b, [x - 5, y - 18, x + 5, y - 18, x + 6 * s + 4, y + 18, x + 6 * s - 4, y + 18], GILL, M_OTHER, { tilt: 0.3 * s });
  }
  path(b, [78, 182, 136, 192, 196, 182], DEEP[3], 2, undefined, M_SKIN);
  yield;
  // ---- the head: too big, wet, the light through it at the edges
  ball(b, 136, 96, 112, 90, SKIN.slice(1), { mat: M_SKIN, soft: 0.06, line: true, lw: 1.4, lit: 0.92 });
  // (the double chin hanging down over the neck, a fold under it)
  ball(b, 136, 170, 76, 24, SKIN.slice(2), { mat: M_SKIN, line: (_dx, dy) => dy > 0.3, lit: 0.9 });
  path(b, [76, 160, 136, 172, 196, 160], DEEP[4], 2, undefined, M_SKIN);
  tint(b, 60, 130, 40, 30, SKIN[6], 0.35, M_SKIN, 0.7);
  tint(b, 212, 128, 40, 30, SKIN[6], 0.35, M_SKIN, 0.7);
  for (let k = 0; k < 40; k++) { const a = rnd() * Math.PI * 2, r = 104 + rnd() * 8; plot(b, 136 + Math.cos(a) * r, 92 + Math.sin(a) * r * 0.78, SKIN[1], undefined, M_SKIN); }
  yield;
  // ---- the eyestalks: up off the skull, curling out of frame and back down; veins up them; the eyes on their ends
  for (const [sx, tx, ty, look] of [[100, 64, 26, 1], [170, 214, 20, -1]] as const) {
    for (let k = 0; k < 18; k++) { const t = k / 17, x = sx + (tx - sx) * t + Math.sin(t * Math.PI) * 14 * (sx < 136 ? -1 : 1), y = 30 - Math.sin(t * Math.PI) * 30 + (ty - 30) * t; ball(b, x, y, 9, 9, DEEP, { mat: M_SKIN, soft: 0.4 }); }
    vein(b, [sx, 34, sx + (tx - sx) * 0.4, 4, tx, ty + 6], VEINS, 2);
    eyeball(b, tx, ty, { rx: 22, ry: 20, sclera: SCLERA_Y, iris: IRIS, ir: 10, idx: look * 5, idy: 4, pr: 3, veins: 26, lid: SKIN, top: x => ty - 18 + Math.abs(x - tx) * 0.2, bot: x => ty + 18 - Math.abs(x - tx) * 0.2 });
    // (the slit pupil: a black bar down it)
    for (let y = -7; y <= 7; y++) plot(b, tx + look * 5, ty + 4 + y, hexU('#000000'), M_OTHER);
  }
  yield;
  // ---- the two little eyes sunk in the face: pink-rimmed, mean
  for (const ex of [104, 168]) {
    ball(b, ex, 82, 16, 12, DEEP, { mat: M_SKIN, soft: 0.5 });
    eyeball(b, ex, 82, { rx: 11, ry: 7, sclera: SCLERA_Y, iris: IRIS, ir: 5, idx: ex < 136 ? 2 : -2, idy: 1, pr: 2, veins: 10, lid: SKIN, top: x => 77 + Math.abs(x - ex) * 0.12, bot: x => 88 - Math.abs(x - ex) * 0.1 });
    for (let a = 0; a < Math.PI * 2; a += 0.08) plot(b, ex + Math.cos(a) * 12, 82 + Math.sin(a) * 8, GILL[2], M_OTHER);
  }
  yield;
  // ---- the nose: a fat bulb hanging in the middle of it all; the zinc slapped across its bridge (cracked, caked in
  // the pores), the nostrils flared, blackheads round it
  ball(b, 136, 118, 36, 28, SKIN.slice(1), { mat: M_SKIN, line: (_dx, dy) => dy > -0.2, lit: 1.1 });
  ball(b, 124, 108, 12, 8, SKIN.slice(0, 4), { mat: M_SKIN, soft: 0.5 });
  poly(b, [118, 96, 154, 94, 158, 106, 150, 109, 138, 105, 122, 108, 114, 104], ZINC, M_OTHER, { tilt: 0.1 });
  for (let k = 0; k < 7; k++) { const x = 120 + rnd() * 34; path(b, [x, 96 + rnd() * 2, x + rnd() * 6 - 3, 104 + rnd() * 3], ZINC[4], 1, undefined, M_OTHER); }
  for (const nx of [122, 150]) ball(b, nx, 132, 8, 5, R('#2A4A2A', '#1A321A', '#0A1A0A', '#000000'), { mat: M_OTHER });
  yield;
  // ---- the mouth: lipless, wide; buck teeth with gaps ('b': hanging open on a TWEET, the tongue); the whistle clamped
  // in its corner on its lanyard
  const mx0 = 82, mx1 = 194, my = 150, mh = open ? 20 : 6;
  const top = (x: number) => my - 2 - Math.sin(((x - mx0) / (mx1 - mx0)) * Math.PI) * 3;
  const bot = (x: number) => my + mh + Math.sin(((x - mx0) / (mx1 - mx0)) * Math.PI) * (open ? 8 : 2);
  for (let x = mx0; x <= mx1; x++) for (let y = Math.round(top(x)); y <= bot(x); y++) plot(b, x, y, MOUTH[y - top(x) < 3 ? 2 : 4], M_MOUTH);
  teeth(b, mx0 + 18, mx1 - 18, top, 1, open ? 12 : 9, { gaps: [1, 3], rot: [4], tw: 9, long: [2] });
  if (open) ball(b, 140, bot(140) - 5, 22, 6, R('#FFB0C0', '#F07A94', '#C8506A', '#902E48', '#4A1020'), { mat: M_OTHER, soft: 0.4 });
  for (let x = mx0 - 2; x <= mx1 + 2; x++) { plot(b, x, top(x) - 1, DEEP[4], M_OTHER); plot(b, x, bot(x) + 1, DEEP[4], M_OTHER); plot(b, x, bot(x) + 2, DEEP[2], M_OTHER); }
  // (the whistle: yellow plastic, in the right corner, the lanyard off it down round the neck)
  poly(b, [186, 140, 226, 136, 230, 156, 188, 158], WHISTLE, M_METAL, { line: true, tilt: 0.3 });
  ball(b, 214, 146, 6, 6, WHISTLE, { mat: M_METAL, line: true });
  path(b, [192, 160, 210, 180, 236, 204], LANYARD[1], 3, M_CLOTH); path(b, [186, 158, 150, 186, 120, 204], LANYARD[2], 3, M_CLOTH);
  yield;
  // ---- the skin's going over: sweat beading all over, pores and blackheads round the nose, slime strung off the chin
  for (let k = 0; k < 22; k++) { const x = 40 + rnd() * 192, y = 30 + rnd() * 130; if (matAt(b, x, y) === M_SKIN) bead(b, x, y, 2 + rnd() * 2.5, SWEAT); }
  skinPost(b, SKIN[8], (x, y) => (Math.abs(x - 136) < 50 && y > 96 && y < 146 ? 0.06 : 0.008), { blackheads: (x, y) => Math.abs(x - 136) < 46 && y > 98 && y < 144, shine: 0.05 });
  inkEdges(b, M_SKIN, SKIN[8], [M_OTHER, M_MOUTH, M_METAL, M_CLOTH]);
  for (const sx of [110, 150]) { let x = sx, y = bot(sx) + 3; for (let s = 0; s < 16; s++) { y++; x += (rnd() - 0.5) * 0.6; plot(b, x, y, s % 4 === 0 ? SLIME_D : SLIME); } }
  return b;
}

const get = stamps<Key>(build, ['a', 'b']);

/** His gross-up: (cx, cy) where his middle goes, `zoom` 1 at the hold; `open` the mouth (talking). */
export const drawGupGross = (c: Ctx, cx: number, cy: number, zoom: number, f: number, open: boolean, jolt = 0) => {
  const s = get(open ? 'b' : 'a');
  drawGrossStamp(c, s.img, cx, cy, FX, FY, zoom, f, jolt, box => {
    // (the whistle's glint, the pea rattling)
    if (f % 20 < 6) box(208, 140, 3, 3, '#FFFFFF');
    // (the gills pulsing)
    const g = 0.5 + 0.5 * Math.sin(f * 0.2);
    if (g > 0.6) { box(56, 136, 4, 30, '#F06A80'); box(212, 136, 4, 30, '#F06A80'); }
    // (a bead of sweat running down the cheek)
    const t = (f % 120) / 120; box(70, 70 + t * 70, 3, 4, '#E0FFE8');
    // (the slime off the chin, a drop at a time)
    const u = (f % 80) / 80; if (u > 0.5) box(150, 180 + (u - 0.5) * 50, 2, 3, '#D8FFC8');
  });
};
export const drawGupGrossBack = (c: Ctx, W: number, H: number) => grossBackdrop(c, W, H, ['#04121A', '#06202A', '#0A3038', '#0E4048', '#14505A']);
export const warmGupGross = () => get.warm();
