// THE ROCKET MAN'S GROSS-UP (the Space Needle's fall: the owner's "cut to a gross up shot of a pissed off elon musk
// shaking his fist"; the standing rule for anyone singled out: grossKit.ts's Ren & Stimpy close-up). The crude parody
// register, as Meathead 1's President: a tech billionaire purple with rage at his rocket going up in smoke. Three-
// quarters on, too close: the jaw clenched, the lips peeled back off gritted teeth and gums, spit flying; the eyes
// bulging, bloodshot to the rims, the pupils pinned; the forehead's vein up like a garden hose; the hairline a
// transplant's rows of plugs, sweat beading in them; stubble; the black tee's collar, a little rocket on it; his fist
// up by his face, white-knuckled (it shakes: drawn jolting, live). Two of it: 'a' the fist low, 'b' up high.

import {
  type Ctx, type Buf, GW, GH, R, hexU, newBuf, setSeed, rnd, ball, tint, poly, path, plot, seg, eyeball, skinPost, stubble, vein, bead, inkEdges, stamps, drawGrossStamp, grossBackdrop, matAt, bay,
  MOUTH, GUM, TOOTH, M_SKIN, M_HAIR, M_MOUTH, M_OTHER, M_CLOTH,
} from '../../grossKit';

const SKIN = R('#FFE8DC', '#F8CCB8', '#ECAE96', '#DA8E78', '#C27060', '#A2544A', '#7A3A34', '#4E2420', '#260E0C');
const RAGE = hexU('#C2384A');
const HAIR = R('#8A6A4A', '#6A4E34', '#4E3824', '#36261A', '#20160E', '#0E0804');
const TEE = R('#4A4A52', '#34343A', '#24242A', '#18181C', '#0E0E12', '#060608');
const SCL = R('#FFFFFF', '#FAF2EC', '#F0D4CC', '#E0A8A0', '#B86A64', '#6A2A26');
const IRIS = R('#B8D8F4', '#88B4DC', '#5A8AB8', '#3A6494', '#1E3E68', '#0A1A34');
const STUB = hexU('#4A3020');

type Key = 'a' | 'b';
function* build(key: Key): Generator<void, Buf> {
  setSeed(4242);
  const b = newBuf();
  yield;
  // ---- the tee's collar at the bottom, black; the little rocket on it
  poly(b, [0, 178, 130, 170, 272, 180, 272, 204, 0, 204], TEE, M_CLOTH, { tilt: 0.3 });
  poly(b, [60, 196, 64, 186, 68, 196], R('#F8FAFC', '#E5E7EB', '#9CA3AF'), M_CLOTH);
  yield;
  // ---- the neck, the head: square-jawed, flushed purple-red with it, cords standing out
  poly(b, [80, 130, 200, 126, 210, 180, 72, 182], SKIN.slice(2), M_SKIN, { tilt: 0.5 });
  for (const x of [100, 176]) vein(b, [x, 180, x + 4, 160, x, 140], R('#E89AA8', '#C86A7A', '#A84A5C', '#7A2E40'), 3);
  ball(b, 140, 86, 82, 84, SKIN, { mat: M_SKIN, line: true, soft: 0.4 });
  ball(b, 140, 138, 66, 34, SKIN, { mat: M_SKIN, line: (_dx, dy) => dy > 0.2 });
  tint(b, 140, 96, 80, 70, RAGE, 0.32, M_SKIN, 0.5);
  yield;
  // ---- the hairline: rows of transplant plugs, thin on top, sweat beading in them
  for (let r = 0; r < 6; r++) for (let k = 0; k < 18; k++) {
    const x = 70 + k * 8 + (r % 2) * 4, y = 14 + r * 6 + Math.abs(k - 9) * 0.8;
    if (matAt(b, x, y) !== M_SKIN) continue;
    for (let h = 0; h < 4 + (r > 3 ? 0 : 3); h++) seg(b, x, y, x - 2 + rnd() * 4, y - 4 - h, HAIR[r < 2 ? 1 : 3], 1, M_HAIR);
  }
  for (let k = 0; k < 14; k++) bead(b, 80 + rnd() * 120, 40 + rnd() * 20, 1.4 + rnd() * 1.5, SKIN);
  // (the vein up the forehead, a garden hose)
  vein(b, [128, 70, 124, 54, 132, 40, 128, 26], R('#F4B0C8', '#D07A98', '#A85274', '#7A3456', '#4A1A30'), 4);
  yield;
  // ---- the brows: down hard, knotted; the eyes bulging out under them, bloodshot, the pupils pinned
  for (const [x, s] of [[104, -1], [176, 1]] as const) for (let k = 0; k < 30; k++) seg(b, x - 18 + k, 66 + s * (k - 15) * 0.22 + (k % 2), x - 16 + k, 60 + s * (k - 15) * 0.25, HAIR[2], 1, M_HAIR);
  eyeball(b, 104, 82, { rx: 15, ry: 14, sclera: SCL, iris: IRIS, ir: 4, idx: 2, idy: 0, pr: 1.4, veins: 22, lid: SKIN, top: x => 70 + (x - 104) * 0.1, bot: x => 95 });
  eyeball(b, 176, 82, { rx: 14, ry: 13, sclera: SCL, iris: IRIS, ir: 4, idx: -2, idy: 0, pr: 1.4, veins: 22, lid: SKIN, top: x => 71 - (x - 176) * 0.1, bot: x => 94 });
  for (const ex of [104, 176]) tint(b, ex, 84, 20, 18, hexU('#A8341E'), 0.4, M_SKIN, 0.7);
  // (the nose: up between them, flared, the nostrils dark)
  ball(b, 140, 104, 14, 14, SKIN, { mat: M_SKIN, line: (_dx, dy) => dy > 0.4, lit: 1.1 });
  for (const x of [132, 148]) ball(b, x, 112, 4, 2.6, R('#3A1410', '#200806', '#0A0202', '#000000'), { mat: M_OTHER });
  yield;
  // ---- the mouth: peeled back, gritted: the gums up, two rows of veneers clamped, spit strung between them
  const x0 = 98, x1 = 182, top = (x: number) => 126 + Math.sin(((x - x0) / (x1 - x0)) * Math.PI) * -4, bot = (x: number) => 150 + Math.sin(((x - x0) / (x1 - x0)) * Math.PI) * 4;
  for (let x = x0; x <= x1; x++) for (let y = Math.round(top(x)); y <= bot(x); y++) plot(b, x, y, MOUTH[(y - top(x)) / (bot(x) - top(x)) < 0.5 ? 3 : 4], M_MOUTH);
  for (let x = x0 + 2; x < x1 - 2; x++) { const t = Math.round(top(x)); for (let y = t; y < t + 4; y++) plot(b, x, y, GUM[y - t < 1 ? 4 : 2], M_OTHER); const u = Math.round(bot(x)); for (let y = u - 3; y <= u; y++) plot(b, x, y, GUM[u - y < 1 ? 4 : 2], M_OTHER); }
  for (let k = 0; k < 9; k++) for (const row of [0, 1]) {
    const x = x0 + 6 + k * 8.5, y0 = row ? Math.round(bot(x)) - 12 : Math.round(top(x)) + 4;
    for (let tx = 0; tx < 7; tx++) for (let ty = 0; ty < 9; ty++) plot(b, x + tx, y0 + ty, TOOTH[tx === 0 || tx === 6 ? 3 : ty === 0 || ty === 8 ? 2 : bay(x + tx, y0 + ty) > 0.85 ? 1 : 0], M_OTHER);
  }
  for (const sx of [116, 150, 168]) for (let y = 136; y < 142; y++) plot(b, sx, y, hexU('#E8F4F8'));
  // (the lips round it, thin and stretched)
  for (let x = x0 - 3; x <= x1 + 3; x++) { plot(b, x, Math.round(top(Math.max(x0, Math.min(x1, x)))) - 1, SKIN[6], M_SKIN); plot(b, x, Math.round(bot(Math.max(x0, Math.min(x1, x)))) + 1, SKIN[6], M_SKIN); }
  stubble(b, (x, y) => (y > 120 && y < 170 ? 0.8 : 0), STUB, 0.4);
  yield;
  // ---- the fist, up by his face, white-knuckled: low ('a') or high ('b')
  const fy = key === 'b' ? 54 : 132, fx = 236;
  poly(b, [fx - 20, fy + 70, fx + 10, fy + 70, fx + 20, fy + 20, fx - 22, fy + 20], SKIN.slice(1), M_SKIN, { tilt: 0.3 });
  ball(b, fx, fy, 28, 26, SKIN, { mat: M_SKIN, line: true });
  for (let k = 0; k < 4; k++) { ball(b, fx - 16 + k * 10, fy - 14, 6, 5, SKIN.slice(0, 5), { mat: M_SKIN, line: true, lw: 0.8 }); plot(b, fx - 16 + k * 10, fy - 16, hexU('#FFFFFF')); }
  ball(b, fx - 22, fy + 2, 8, 10, SKIN, { mat: M_SKIN, line: true });
  yield;
  skinPost(b, SKIN[8], (_x, y) => (y < 110 ? 0.02 : 0.012), { blackheads: (_x, y) => y > 98 && y < 118, shine: 0.14 });
  inkEdges(b, M_SKIN, SKIN[8], [M_OTHER, M_MOUTH, M_HAIR]);
  void path; void GW; void GH;
  return b;
}

const get = stamps<Key>(build, ['a', 'b']);
/** His gross-up: (cx, cy) his middle on screen, `zoom` 1 at the hold. `t` frames in (the fist shakes, up and down). */
export const drawMuskGross = (c: Ctx, cx: number, cy: number, zoom: number, t: number) => {
  const s = get(Math.floor(t / 7) % 2 ? 'b' : 'a');
  drawGrossStamp(c, s.img, cx, cy, 140, 100, zoom, t, 2, box => {
    // (spit off the teeth)
    for (let k = 0; k < 4; k++) { const ph = ((t * 3 + k * 17) % 30) / 30; box(140 + (k - 1.5) * 24 + ph * (k - 1.5) * 20, 138 + ph * 50, 2, 2, '#E8F4F8'); }
  });
};
export const drawMuskGrossBack = (c: Ctx, W: number, H: number) => grossBackdrop(c, W, H, ['#1A0606', '#2A0A0A', '#3E1010', '#561818', '#701E1E']);
export const warmMuskGross = () => get.warm();
