// CON-FUCK-TIOUS's SCARECROW, drawn (benLair.ts's m2:fr_crow): a straw cowboy he made out of the old tour's junk, on
// a post stood in a nail keg: a burlap sack for a head (stitched X eyes, a stitched grin, a rope round the neck), a
// beat-up felt cowboy hat with a fistful of nails driven up through its crown (the spikes the boots don't care about),
// a red plaid flannel shirt stuffed with straw (tufts out of the collar and the cuffs), a bandana, the arms lashed
// straight out along the crossbar (no elbows to bend: it's a scarecrow), stuffed jeans hung off the post, straw out of
// the cuffs, over the keg's rim.
//
// Painted once into its own canvas (feet at the origin, facing right; the engine's mirror for facing left), in stepped
// ramps (dark to lit, lit from the upper left, inked), then drawn with one drawImage (turned freely: a canvas, not the
// stamp cache), whatever's done to it.

import type { Enemy } from '../../../m1/types';

type Ctx = CanvasRenderingContext2D;
/** Its height (the enemy's box: to the top of the sack; the hat and its nails stand over it). */
export const CROW_H = 104;
const W = 120, H = 150, OX = 60, OY = 144;
const INK = '#140C08';

const BURLAP = ['#4A3A22', '#6E5832', '#927846', '#B49A60', '#D2BC84'];
const FELT = ['#24160C', '#3A2614', '#523820', '#6C4C2C', '#8A643C'];
const PLAID = ['#3A0A0A', '#6A1414', '#9A2222', '#C23A2E', '#E06A50'];
const DENIM = ['#101A30', '#1C2C50', '#2A4074', '#3E5A98', '#6A86BC'];
const STRAW = ['#6A5222', '#9A7A34', '#C8A456', '#E2C878', '#F6E6A8'];
const OAK = ['#2A180C', '#442814', '#5E3A1E', '#7C502C', '#9C6C40'];
const IRON = ['#16161A', '#2A2A30', '#44444C', '#6A6A74', '#A4A4B0'];
const RAG = ['#0A2A4A', '#143E6A', '#1E5A92', '#3A7AB4', '#7AAAD8'];

let cv: HTMLCanvasElement | null | undefined;
const paint = (g: Ctx) => {
  g.save(); g.translate(OX, OY);
  const box = (x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  /** A box in a ramp, banded across (lit at the left), inked round. */
  const slab = (x: number, y: number, w: number, h: number, R: string[]) => {
    box(x - 1, y - 1, w + 2, h + 2, INK);
    const n = 4, bw = w / n;
    for (let i = 0; i < n; i++) box(x + i * bw, y, bw + 1, h, R[3 - i] ?? R[0]);
    box(x, y, w, 1, R[4]);
    for (let yy = y + 1; yy < y + h; yy += 2) box(x + bw, yy, 1, 1, R[3]);
  };
  // ---- the nail keg: oak staves, two iron hoops, the post down into it, straw over its rim
  const kw = 30, kh = 26;
  box(-kw / 2 - 2, -kh - 1, kw + 4, kh + 2, INK);
  for (let i = 0; i < 6; i++) { const x = -kw / 2 + i * (kw / 6), R = OAK, c = i === 0 ? R[4] : i < 3 ? R[3] : i < 5 ? R[2] : R[1]; box(x, -kh, kw / 6, kh, c); box(x + kw / 6 - 1, -kh, 1, kh, R[0]); }
  for (const y of [-kh + 4, -6]) { box(-kw / 2 - 1, y, kw + 2, 3, IRON[1]); box(-kw / 2 - 1, y, kw + 2, 1, IRON[3]); }
  box(-kw / 2, -kh, kw, 2, OAK[4]);
  box(-11, -kh - 2, 22, 3, '#1A120A');
  // (the post: up out of the keg to the hat, the crossbar at the shoulders)
  slab(-3, -96, 6, 72, OAK);
  slab(-40, -78, 80, 5, OAK);
  // ---- the jeans, stuffed, hung off the post (one in front, one behind), straw out of the cuffs over the keg's rim
  for (const [x, R] of [[-9, DENIM.map((c, i) => DENIM[Math.max(0, i - 1)])], [1, DENIM]] as [number, string[]][]) {
    slab(x, -56, 10, 26, R);
    box(x + 4, -54, 1, 22, R[1]);
    for (let k = 0; k < 5; k++) box(x + k * 2, -31 + (k % 2), 2, 4 + (k % 3), STRAW[2 + (k % 3)]);
  }
  slab(-10, -60, 22, 7, DENIM);
  // (the rope belt)
  box(-11, -61, 24, 3, STRAW[1]); for (let x = -10; x < 12; x += 3) box(x, -61, 1, 3, STRAW[3]);
  // ---- the flannel: the body, stuffed round, the plaid's checks; the arms out along the crossbar, straw at the cuffs
  const shirt = (x: number, y: number, w: number, h: number) => {
    slab(x, y, w, h, PLAID);
    // (the plaid: dark bars down and across, a light thread)
    for (let xx = x + 3; xx < x + w; xx += 6) box(xx, y, 2, h, PLAID[0]);
    for (let yy = y + 3; yy < y + h; yy += 6) box(x, yy, w, 2, PLAID[1]);
    for (let xx = x + 5; xx < x + w; xx += 6) box(xx, y, 1, h, PLAID[4]);
  };
  shirt(-38, -80, 30, 9); shirt(8, -80, 30, 9);
  shirt(-12, -84, 24, 26);
  // (the buttons; patched at the elbow of a sleeve with a scrap of denim)
  for (let k = 0; k < 3; k++) box(0, -80 + k * 7, 2, 2, '#E8DCC0');
  box(-26, -80, 6, 5, DENIM[2]); box(-26, -80, 6, 1, DENIM[4]);
  for (const s of [-1, 1]) for (let k = 0; k < 5; k++) box(s > 0 ? 38 + (k % 2) : -42 - (k % 2), -81 + k * 2, 5, 2, STRAW[2 + (k % 3)]);
  // (the bandana, knotted)
  box(-9, -86, 18, 5, INK); box(-8, -85, 16, 3, RAG[2]); box(-8, -85, 16, 1, RAG[4]);
  g.fillStyle = RAG[2]; g.beginPath(); g.moveTo(-5, -82); g.lineTo(5, -82); g.lineTo(0, -75); g.closePath(); g.fill();
  box(-1, -81, 2, 2, RAG[4]);
  // ---- the sack head: burlap, its weave dithered, the rope round the neck, X eyes, a stitched grin, straw out the top
  box(-13, -107, 26, 23, INK);
  for (let i = 0; i < 4; i++) box(-12 + i * 6, -106, 6.5, 21, BURLAP[3 - i] ?? BURLAP[0]);
  box(-12, -106, 24, 2, BURLAP[4]);
  for (let y = -104; y < -86; y += 2) for (let x = -11 + ((y / 2) % 2 ? 1 : 0); x < 12; x += 4) box(x, y, 1, 1, BURLAP[1]);
  box(-12, -88, 24, 3, STRAW[1]); for (let x = -11; x < 12; x += 3) box(x, -88, 1, 3, STRAW[3]);
  // (the X eyes in black thread, the grin stitched across, a patch)
  for (const ex of [-6, 5]) for (let k = -2; k <= 2; k++) { box(ex + k, -100 + k, 1, 1, INK); box(ex + k, -100 - k, 1, 1, INK); }
  box(-7, -93, 14, 1, INK); for (let x = -6; x < 7; x += 3) box(x, -94, 1, 3, INK);
  box(4, -105, 6, 5, PLAID[2]); box(4, -105, 6, 1, PLAID[4]);
  // ---- the hat: brim, crown, a cracked band; the nails driven up through the crown (lit tips: they're the spikes)
  box(-21, -108, 42, 5, INK); box(-20, -107, 40, 3, FELT[2]); box(-20, -107, 40, 1, FELT[4]); box(-20, -105, 40, 1, FELT[0]);
  box(-12, -122, 24, 15, INK);
  for (let i = 0; i < 4; i++) box(-11 + i * 5.5, -121, 6, 14, FELT[3 - i] ?? FELT[0]);
  box(-11, -121, 22, 1, FELT[4]);
  box(-9, -123, 7, 2, FELT[1]); box(2, -123, 7, 2, FELT[1]);
  box(-11, -111, 22, 3, '#2A1C10'); box(-11, -111, 22, 1, '#5A4028');
  for (const [nx, nh] of [[-9, 9], [-5, 12], [-1, 10], [3, 13], [7, 9]] as const) {
    box(nx - 1, -121 - nh, 3, nh, INK); box(nx, -121 - nh, 1, nh, IRON[3]);
    box(nx - 1, -123 - nh, 3, 2, INK); box(nx, -122 - nh, 1, 1, IRON[4]);
  }
  // (the floor's shadow under it)
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(-20, -1, 40, 2);
  g.restore();
};
const canvas = () => {
  if (cv !== undefined) return cv;
  if (typeof document === 'undefined') return (cv = null);
  cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d')!;
  paint(g);
  return cv;
};

/** It, feet at the origin, facing right (the engine's turned and mirrored it). Hit: a flash over it. */
export const drawCrow = (c: Ctx, e: Enemy, _f: number) => {
  const img = canvas();
  if (!img) return;
  c.drawImage(img, -OX, -OY);
  if ((e.hitFlash ?? 0) > 0) { c.save(); c.globalAlpha = 0.35; c.globalCompositeOperation = 'lighter'; c.drawImage(img, -OX, -OY); c.restore(); }
};
