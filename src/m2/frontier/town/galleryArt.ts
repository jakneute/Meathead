// DEAD-EYE DOOLEY'S SHOOTIN' GALLERY, drawn (gallery.ts runs it). Three looks at it:
//
//   THE BOOTH        on Main Street before the saloon, at the play plane: candy-striped awning on red posts, the sign
//                    board up top, a little gallery in the back (painted mesas, a rail of tin ducks, a bandit, the
//                    bullseye), the counter in front (its top a ledge: lit). Painted once into stamps per how wrecked
//                    it is (0 as new, 1 a few holes, 2 mostly gone (the void showing through), 3 nothing but the
//                    scorch); its back (behind Dooley) and its front (the counter, before him) apart.
//   DOOLEY           the booth man: a heavy, sweating carny in a dealer's green eyeshade, a walrus mustache over a
//                    toothpick, a red bulb of a nose, a combover, a mustard shirt sweated through at the pits, red
//                    suspenders, a polka-dot bow tie, a canvas change apron; on the town's person drawer (costume.ts),
//                    limbs from art/limb. Calm (pitching, beckoning), then the panic attack (hands clutching his head,
//                    hyperventilating, sweat flying, pacing; pointing at Meathead, chewing him out; clutching his
//                    chest). Each frame a stamp.
//   THE GALLERY      first person, full screen: every piece of the set its own baked canvas in art pixels (two screen
//                    pixels each: SNES-chunky), banded and dithered, so it can go a piece at a time: the void behind
//                    everything, the back wall's plywood planks, the painted backdrop's three panels, the moon on its
//                    crank, the bullseye wheel, the score board, the lantern, the prize shelf and its prizes, two rails
//                    of tin ducks, the bandits behind their fence, the bottles on their shelf, the posts, the awning's
//                    scallops, the sign, the counter's brass rail and its three sections. Meathead's left arm and the
//                    ray gun (baked once, drawn turned toward the cursor). Dooley's gross-up (grossBust.ts) per tier.

import { box, mix, hash, INK, still, western } from './paint';
import { signText } from '../../signLetters';
import { lt, dk, part, px, ball, legs, torso, arm, headShape, faceOn, bodyOf, flailHands, frameOf, putFrame, type Body, type Frame, type Pose } from '../../spooky/costume';
import { bust, SKIN, HAIR, CLOTH, IRIS, type Bust, type Mouth } from '../../grossBust';

type Ctx = CanvasRenderingContext2D;

// ---------------------------------------------------------------------------------------------------------------
// Kit

const R7 = (col: string) => [mix(col, INK, 0.66), mix(col, INK, 0.44), mix(col, INK, 0.2), col, mix(col, '#FFFFFF', 0.2), mix(col, '#FFFFFF', 0.42), mix(col, '#FFFFFF', 0.66)];
/** A checker of `col` over (x, y, w, h): the dither between two steps. */
const dith = (g: Ctx, x: number, y: number, w: number, h: number, col: string, odd = 0) => {
  g.fillStyle = col;
  for (let yy = 0; yy < h; yy++) for (let xx = (yy + odd) & 1; xx < w; xx += 2) g.fillRect(Math.round(x) + xx, Math.round(y) + yy, 1, 1);
};
/** Bands down (x, y, w, h), top first, a dithered row between each. */
const bands = (g: Ctx, x: number, y: number, w: number, h: number, cols: string[]) => {
  const n = cols.length, bh = h / n;
  for (let i = 0; i < n; i++) box(g, x, y + i * bh, w, Math.ceil(bh) + 1, cols[i]);
  for (let i = 1; i < n; i++) dith(g, x, Math.round(y + i * bh) - 1, w, 2, cols[i - 1], i);
};
const ellF = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
const polyF = (g: Ctx, pts: number[], col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fill(); };
/** A canvas w x h, painted once. */
export const bake = (w: number, h: number, paint: (g: Ctx) => void): HTMLCanvasElement => {
  const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
  const g = c.getContext('2d')!; g.imageSmoothingEnabled = false; paint(g);
  return c;
};
/** The same shape in the ray's pink (for lighting a piece up as it goes). */
export const pinkOf = (src: HTMLCanvasElement, col = '#FF8CE4') => bake(src.width, src.height, g => { g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, src.width, src.height); });

const WOOD = R7('#8A5A30'), PLYW = R7('#B88A58'), RED = R7('#C8302A'), CREAM = R7('#EEE2C0'), GOLD = R7('#D8A830'), BRASS = R7('#C89A3A');
const TIN = R7('#E8C040'), STEEL = ['#18181B', '#27272A', '#3F3F46', '#52525B', '#71717A', '#A1A1AA', '#D4D4D8', '#F4F4F5'];
const SKY = ['#3A2A5A', '#5A3A6A', '#8A4A6A', '#C25A5A', '#E8804E', '#F4A85A', '#F8CC7A'];
const VOID = ['#05030A', '#0A0614', '#100A1E', '#160E28', '#1C1232'];

// ---------------------------------------------------------------------------------------------------------------
// The first-person gallery: 400 x 300 art pixels (2 screen pixels each)

export const ART_W = 400, ART_H = 300;
/** Where things are (art px): the fence's top (the bandits drop in behind it), the rails' tops, the counter's top. */
export const FENCE_Y = 150, RAIL_A = 95, RAIL_C = 195, COUNTER_Y = 232;
export const DUCK_W = 22, DUCK_H = 18, BANDIT_W = 20, BANDIT_H = 36;

/** The void behind it all: nothing, a few stars, a slow swirl of nothing. */
export const paintVoid = (g: Ctx) => {
  bands(g, 0, 0, ART_W, ART_H, [VOID[4], VOID[3], VOID[2], VOID[1], VOID[0], VOID[0], VOID[1]]);
  for (let i = 0; i < 70; i++) { const x = hash(i * 3.1) * ART_W, y = hash(i * 7.7 + 1) * ART_H; box(g, x, y, 1, 1, i % 5 ? '#4A3A6A' : '#C8B8F0'); }
  for (let k = 0; k < 3; k++) { g.strokeStyle = ['#1A1030', '#22163C', '#2A1C46'][k]; g.lineWidth = 2; g.beginPath(); for (let a = 0; a < 9; a += 0.15) { const r = 8 + a * 14 + k * 5, x = 200 + Math.cos(a + k) * r, y = 120 + Math.sin(a + k) * r * 0.6; if (a === 0) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke(); }
};
/** A back-wall plank (60 x 185): raw plywood, its grain, nails; two of them stenciled. */
export const paintPlank = (i: number) => (g: Ctx) => {
  const w = 60, h = 185, P = i % 2 ? R7('#A87C4E') : PLYW;
  box(g, 0, 0, w, h, INK); box(g, 1, 0, w - 2, h, P[3]); box(g, 1, 0, 2, h, P[4]); box(g, w - 3, 0, 2, h, P[2]);
  for (let k = 0; k < 9; k++) { const y = 8 + hash(i * 9 + k) * (h - 16), x = 4 + hash(i * 5 + k * 3) * (w - 20); box(g, x, y, 10 + hash(k + i) * 12, 1, P[2]); if (k % 3 === 0) ellF(g, x + 6, y, 3, 1.5, P[1]); }
  for (const y of [6, h - 8]) for (const x of [6, w - 8]) { box(g, x, y, 2, 2, STEEL[2]); box(g, x, y, 1, 1, STEEL[6]); }
  const word = ['', 'STAFF', 'ONLY', '', 'NO', 'EXIT'][i];
  if (word) signText(g, word, w / 2, 96, western(1, '#3A2A1A', 'rgba(0,0,0,0)'));
};
/** A panel of the painted backdrop (120 x 185): the sunset sky in bands, mesas, the sun on the middle one, sand, cacti. */
export const paintPanel = (i: number) => (g: Ctx) => {
  const w = 120, h = 185;
  bands(g, 0, 0, w, 120, SKY);
  if (i === 1) { for (const [r, col] of [[30, '#F8B060'], [24, '#FBD07A'], [18, '#FFE8A0']] as const) ellF(g, 60, 120, r, r, col); for (let k = 0; k < 4; k++) box(g, 28, 104 + k * 5, 64, 1, '#F09A5A'); }
  // (the mesas: flat tops lit, their faces in bands, the far ones paler)
  const M = [R7('#8A4A4A'), R7('#6A3A4A')];
  const mesas: [number, number, number, number][] = [[[-10, 40, 92, 0], [60, 120, 84, 1]], [[10, 50, 100, 1], [80, 130, 94, 0]], [[-20, 30, 96, 1], [40, 100, 78, 0]]][i] as [number, number, number, number][];
  for (const [a, b, top, k] of mesas) {
    const C = M[k];
    polyF(g, [a - 6, 132, a, top, b, top, b + 6, 132], INK);
    polyF(g, [a - 5, 132, a + 1, top + 1, b - 1, top + 1, b + 5, 132], C[3]);
    box(g, a + 1, top + 1, b - a - 2, 2, C[5]); box(g, a + 1, top + 3, b - a - 2, 1, C[4]);
    for (let y = top + 10; y < 130; y += 9) box(g, a + 2 - (y - top) * 0.06, y, b - a + (y - top) * 0.12 - 4, 1, C[2]);
    dith(g, b - 10, top + 4, 10, 128 - top, C[1]);
  }
  bands(g, 0, 130, w, h - 130, ['#C89A5A', '#B88A4E', '#A87A44', '#94683A']);
  for (let k = 0; k < 14; k++) box(g, hash(i * 31 + k) * w, 136 + hash(k * 7 + i) * 45, 2, 1, '#7A5430');
  // (a saguaro or two)
  const cact = (x: number, y: number, s: number) => {
    const C = R7('#3A6A3A');
    box(g, x - 1, y - 30 * s, 6 * s + 2, 30 * s, INK); box(g, x, y - 29 * s, 6 * s, 29 * s, C[3]); box(g, x, y - 29 * s, 2 * s, 29 * s, C[4]);
    box(g, x - 7 * s, y - 20 * s, 7 * s, 4 * s, C[3]); box(g, x - 8 * s, y - 28 * s, 4 * s, 12 * s, C[3]); box(g, x - 8 * s, y - 28 * s, 1, 12 * s, C[5]);
    box(g, x + 6 * s, y - 16 * s, 6 * s, 4 * s, C[3]); box(g, x + 9 * s, y - 24 * s, 4 * s, 10 * s, C[3]); box(g, x + 12 * s, y - 24 * s, 1, 10 * s, C[1]);
  };
  if (i !== 1) cact(i === 0 ? 30 : 86, 170, 1);
  if (i === 2) cact(30, 160, 0.7);
  // (the panel's frame: a seam, its nails)
  box(g, 0, 0, 1, h, INK); box(g, w - 1, 0, 1, h, INK); box(g, 1, 0, 1, h, WOOD[2]);
  for (let y = 10; y < h; y += 40) box(g, 2, y, 1, 1, STEEL[6]);
};
/** The moon on its crank (26 x 44): a banded face, sleepy, on a stick. */
export const paintMoon = (g: Ctx) => {
  box(g, 11, 22, 4, 22, INK); box(g, 12, 22, 2, 22, WOOD[3]); box(g, 12, 22, 1, 22, WOOD[5]);
  ellF(g, 13, 13, 13, 13, INK);
  for (const [r, col] of [[12, '#C8B060'], [10.5, '#E8D27A'], [8, '#F6E6A0'], [4, '#FFF6CC']] as const) ellF(g, 11.5 + (12 - r) * 0.1, 11.5 + (12 - r) * 0.1, r, r, col);
  for (const [x, y, r] of [[7, 16, 2], [17, 7, 1.5], [18, 17, 2.5]] as const) ellF(g, x, y, r, r, '#C8B060');
  box(g, 6, 10, 4, 1, INK); box(g, 14, 10, 4, 1, INK);
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.arc(12, 14, 4, 0.2, Math.PI - 0.2); g.stroke();
  ellF(g, 6, 14, 2, 1, '#F09A7A'); ellF(g, 18, 14, 2, 1, '#F09A7A');
};
/** The wheel (48 x 48): red and cream wedges, the bullseye in the middle, the rim lit. */
export const paintWheel = (g: Ctx) => {
  const c = 24;
  ellF(g, c, c, 24, 24, INK); ellF(g, c, c, 22, 22, WOOD[4]);
  for (let k = 0; k < 8; k++) { g.fillStyle = k % 2 ? RED[3] : CREAM[3]; g.beginPath(); g.moveTo(c, c); g.arc(c, c, 20, (k * Math.PI) / 4, ((k + 1) * Math.PI) / 4); g.closePath(); g.fill(); }
  for (const [r, col] of [[11, INK], [10, '#F4F0E6'], [7.5, RED[3]], [5, '#F4F0E6'], [2.5, RED[3]]] as const) ellF(g, c, c, r, r, col);
  box(g, c - 1, c - 1, 2, 2, STEEL[6]);
  for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; box(g, c + Math.cos(a) * 21 - 1, c + Math.sin(a) * 21 - 1, 2, 2, GOLD[5]); }
};
/** The score board (70 x 24): a wooden frame round a black LED panel (the digits are live). */
export const paintScore = (g: Ctx) => {
  box(g, 0, 0, 70, 24, INK); box(g, 1, 1, 68, 22, WOOD[3]); box(g, 1, 1, 68, 1, WOOD[5]); box(g, 1, 22, 68, 1, WOOD[1]);
  box(g, 4, 4, 62, 16, INK); box(g, 5, 5, 60, 14, '#100808'); dith(g, 5, 5, 60, 14, '#1A0C0C');
  for (const x of [2, 66]) for (const y of [2, 20]) box(g, x, y, 1, 1, GOLD[5]);
};
/** The lantern (16 x 30): its chain, brass cap, the glass lit. */
export const paintLantern = (g: Ctx) => {
  for (let y = 0; y < 8; y += 2) box(g, 7, y, 2, 1, STEEL[4]);
  box(g, 3, 8, 10, 4, INK); box(g, 4, 9, 8, 2, BRASS[4]);
  box(g, 2, 12, 12, 14, INK); box(g, 3, 13, 10, 12, '#F8C860'); box(g, 5, 15, 6, 8, '#FFF0B0'); box(g, 7, 17, 2, 4, '#FFFFFF');
  box(g, 3, 13, 1, 12, BRASS[2]); box(g, 12, 13, 1, 12, BRASS[2]); box(g, 3, 25, 10, 4, INK); box(g, 4, 25, 8, 3, BRASS[3]);
};
/** The prize shelf (84 x 6). */
export const paintPrizeShelf = (g: Ctx) => { box(g, 0, 0, 84, 6, INK); box(g, 1, 1, 82, 4, WOOD[3]); box(g, 1, 1, 82, 1, WOOD[5]); for (const x of [6, 74]) { box(g, x, 5, 4, 1, INK); } };
/** A prize (18 x 22): the bear, the rubber chicken, the kewpie doll. */
export const paintPrize = (i: number) => (g: Ctx) => {
  if (i === 0) {
    const C = R7('#8A5A2A');
    for (const x of [3, 15]) ellF(g, x, 4, 3, 3, INK);
    ellF(g, 9, 14, 8, 8, INK); ellF(g, 9, 7, 6, 6, INK);
    for (const x of [3, 15]) ellF(g, x, 4, 2, 2, C[3]);
    ellF(g, 9, 14, 7, 7, C[3]); ellF(g, 8, 12, 4, 4, C[4]); ellF(g, 9, 7, 5, 5, C[3]); ellF(g, 8, 6, 3, 3, C[4]);
    ellF(g, 9, 9, 2, 1.5, C[5]); box(g, 7, 6, 1, 1, INK); box(g, 11, 6, 1, 1, INK); box(g, 9, 8, 1, 1, INK);
    box(g, 6, 11, 6, 2, '#C8302A');
  } else if (i === 1) {
    const C = R7('#E8C83A');
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(9, 21); g.quadraticCurveTo(3, 12, 8, 3); g.stroke();
    g.strokeStyle = C[3]; g.lineWidth = 2; g.stroke();
    box(g, 6, 0, 5, 4, INK); box(g, 7, 1, 3, 2, '#D02A2A'); box(g, 10, 3, 4, 2, '#F09A2A'); box(g, 7, 2, 1, 1, INK);
    box(g, 7, 19, 6, 3, '#F09A2A');
  } else {
    ellF(g, 9, 15, 6, 7, INK); ellF(g, 9, 6, 6, 6, INK);
    ellF(g, 9, 15, 5, 6, '#FFD0C0'); ellF(g, 9, 6, 5, 5, '#FFD8C8'); box(g, 8, 0, 2, 2, '#F4D07A');
    box(g, 6, 5, 1, 2, INK); box(g, 11, 5, 1, 2, INK); ellF(g, 9, 9, 1.5, 1, '#D84A6A'); ellF(g, 6, 8, 1.5, 1, '#F8A0A0'); ellF(g, 12, 8, 1.5, 1, '#F8A0A0');
    box(g, 5, 16, 8, 3, '#7AC8E8');
  }
};
/** A rail segment (120 x 6): a brass rod, brackets at its ends. */
export const paintRail = (g: Ctx) => {
  box(g, 0, 1, 120, 5, INK); box(g, 0, 2, 120, 3, BRASS[3]); box(g, 0, 2, 120, 1, BRASS[5]); box(g, 0, 4, 120, 1, BRASS[1]);
  for (let x = 6; x < 120; x += 18) box(g, x, 2, 1, 3, BRASS[2]);
  for (const x of [1, 115]) { box(g, x, 0, 4, 6, INK); box(g, x + 1, 1, 2, 4, STEEL[4]); }
};
/** A tin duck (22 x 18), facing `dir`: yellow tin banded, an orange beak, a painted target, rivets, its foot on the rail. */
export const paintDuck = (dir: 1 | -1) => (g: Ctx) => {
  g.save(); if (dir < 0) { g.translate(DUCK_W, 0); g.scale(-1, 1); }
  polyF(g, [1, 9, 3, 6, 9, 6, 12, 2, 17, 1, 20, 4, 20, 8, 17, 9, 17, 13, 13, 16, 4, 16, 1, 13], INK);
  polyF(g, [2, 9, 4, 7, 10, 7, 13, 3, 17, 2, 19, 4, 19, 8, 16, 9, 16, 13, 12, 15, 4, 15, 2, 13], TIN[3]);
  box(g, 4, 8, 9, 2, TIN[5]); box(g, 13, 3, 3, 2, TIN[5]); box(g, 4, 13, 10, 2, TIN[1]); dith(g, 4, 11, 11, 2, TIN[2]);
  polyF(g, [19, 5, 22, 6, 19, 8], '#E87A2A'); box(g, 19, 5, 2, 1, '#F8B06A');
  box(g, 16, 4, 2, 2, INK); box(g, 16, 4, 1, 1, '#FFFFFF');
  for (const [r, col] of [[3.5, '#F4F0E6'], [2.4, '#C8302A'], [1.2, '#F4F0E6']] as const) ellF(g, 8, 11, r, r, col);
  box(g, 3, 9, 1, 1, STEEL[2]); box(g, 14, 13, 1, 1, STEEL[2]);
  box(g, 9, 16, 4, 2, INK); box(g, 10, 16, 2, 2, STEEL[4]);
  g.restore();
};
/** A bandit (20 x 36): a plywood cutout on its hinge: the black hat, the mask, a mustache, the red bandana, a pistol. */
export const paintBandit = (i: number) => (g: Ctx) => {
  const skin = ['#E8B08A', '#B87A50', '#8A5A3A'][i % 3];
  polyF(g, [3, 36, 3, 18, 6, 14, 14, 14, 17, 18, 17, 36], INK);
  polyF(g, [4, 36, 4, 19, 7, 15, 13, 15, 16, 19, 16, 36], ['#3A4A7A', '#6A3A2A', '#3A5A3A'][i % 3]);
  box(g, 4, 19, 12, 2, '#C8302A'); box(g, 9, 21, 3, 4, '#C8302A');
  ellF(g, 10, 10, 6, 6, INK); ellF(g, 10, 10, 5, 5, skin);
  box(g, 5, 8, 10, 3, '#1A1A1A'); box(g, 7, 9, 2, 1, '#F4F0E6'); box(g, 11, 9, 2, 1, '#F4F0E6');
  box(g, 7, 12, 6, 2, '#3A2A1A');
  box(g, 1, 4, 18, 2, INK); box(g, 2, 4, 16, 1, '#2A2A2A'); box(g, 5, 0, 10, 5, INK); box(g, 6, 1, 8, 3, '#2A2A2A'); box(g, 6, 3, 8, 1, '#8A6A3A');
  box(g, 15, 22, 5, 3, INK); box(g, 16, 23, 4, 1, STEEL[5]); box(g, 15, 24, 2, 3, '#5A3A1A');
  box(g, 3, 34, 14, 2, WOOD[1]);
};
/** The fence the bandits drop behind (360 x 12). */
export const paintFence = (g: Ctx) => {
  box(g, 0, 0, 360, 12, INK);
  for (let x = 1; x < 359; x += 20) { box(g, x, 1, 19, 10, WOOD[3]); box(g, x, 1, 19, 1, WOOD[5]); box(g, x + 18, 1, 1, 10, WOOD[1]); box(g, x + 3, 5, 6, 1, WOOD[2]); }
};
/** The bottle shelf (84 x 5) and a bottle (8 x 18). */
export const paintBottleShelf = (g: Ctx) => { box(g, 0, 0, 84, 5, INK); box(g, 1, 1, 82, 3, WOOD[3]); box(g, 1, 1, 82, 1, WOOD[5]); };
export const paintBottle = (i: number) => (g: Ctx) => {
  const C = R7(['#3A7A3A', '#7A4A1A', '#9AB8C8', '#3A5A7A', '#6A2A2A'][i % 5]);
  box(g, 2, 6, 4, 2, INK); box(g, 3, 0, 2, 7, INK); box(g, 3, 1, 2, 5, C[3]); box(g, 3, 0, 2, 1, '#B88A5A');
  box(g, 0, 7, 8, 11, INK); box(g, 1, 8, 6, 10, C[3]); box(g, 1, 8, 2, 10, C[5]); box(g, 6, 8, 1, 10, C[1]);
  box(g, 1, 11, 6, 4, '#E8DCC0'); box(g, 2, 12, 4, 1, '#8A2A2A');
};
/** A post (20 x 232): red paint, a gold stripe winding up it, its edge lit. */
export const paintPost = (g: Ctx) => {
  box(g, 0, 0, 20, 232, INK); box(g, 1, 0, 18, 232, RED[3]); box(g, 1, 0, 4, 232, RED[4]); box(g, 15, 0, 4, 232, RED[2]);
  for (let y = -20; y < 232; y += 24) { g.fillStyle = GOLD[3]; g.beginPath(); g.moveTo(1, y); g.lineTo(19, y + 12); g.lineTo(19, y + 16); g.lineTo(1, y + 4); g.closePath(); g.fill(); }
  box(g, 0, 224, 20, 8, INK); box(g, 1, 225, 18, 6, GOLD[2]);
};
/** An awning scallop (50 x 26): red and cream stripes, its scalloped hem, a gold fringe. */
export const paintScallop = (i: number) => (g: Ctx) => {
  g.save(); g.beginPath(); g.rect(0, 0, 50, 16); g.arc(25, 16, 25, 0, Math.PI); g.clip();
  for (let x = 0; x < 50; x += 10) { box(g, x, 0, 5, 30, RED[3]); box(g, x + 5, 0, 5, 30, CREAM[3]); box(g, x, 0, 1, 30, RED[4]); }
  box(g, 0, 0, 50, 3, INK); box(g, 0, 3, 50, 2, 'rgba(0,0,0,0.3)');
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.arc(25, 16, 24.5, 0.05, Math.PI - 0.05); g.stroke();
  for (let a = 0.25; a < Math.PI; a += 0.25) box(g, 25 + Math.cos(a) * 24, 16 + Math.sin(a) * 24, 2, 3, GOLD[4]);
  void i;
};
/** The sign board (150 x 26). */
export const paintSign = (g: Ctx) => {
  box(g, 0, 0, 150, 26, INK); box(g, 1, 1, 148, 24, '#2A1A3A'); box(g, 1, 1, 148, 1, '#5A3A7A');
  for (let x = 4; x < 148; x += 8) box(g, x, 3, 2, 2, (x / 8) % 2 ? '#FFE070' : '#F8A040');
  for (let x = 4; x < 148; x += 8) box(g, x, 21, 2, 2, (x / 8) % 2 ? '#F8A040' : '#FFE070');
  signText(g, "DEAD-EYE DOOLEY'S", 75, 16, western(1, '#F8D84A', '#7A1A1A'));
};
/** The counter's brass rail (400 x 6). */
export const paintCounterRail = (g: Ctx) => {
  box(g, 0, 0, 400, 6, INK); box(g, 0, 1, 400, 4, BRASS[3]); box(g, 0, 1, 400, 1, BRASS[6]); box(g, 0, 4, 400, 1, BRASS[1]);
  for (let x = 30; x < 400; x += 68) { box(g, x, 0, 4, 6, INK); box(g, x + 1, 1, 2, 4, BRASS[5]); }
};
/** A section of the counter (`w` x 68): its lit top, planks, a painted panel (the middle one: EVERYBODY'S A WINNER!). */
export const paintCounter = (i: number, w: number) => (g: Ctx) => {
  const h = 68;
  box(g, 0, 0, w, h, INK);
  box(g, 0, 1, w, 7, WOOD[4]); box(g, 0, 1, w, 1, WOOD[6]); box(g, 0, 7, w, 1, WOOD[1]);
  bands(g, 0, 8, w, h - 8, [WOOD[3], WOOD[3], WOOD[2], WOOD[2], WOOD[1]]);
  for (let x = 12; x < w; x += 24) box(g, x, 8, 1, h - 8, WOOD[1]);
  box(g, 6, 14, w - 12, 34, INK); box(g, 7, 15, w - 14, 32, i === 1 ? '#7A1A2A' : '#1A3A5A'); box(g, 7, 15, w - 14, 1, i === 1 ? '#A83A4A' : '#3A5A8A');
  g.strokeStyle = GOLD[3]; g.lineWidth = 1; g.strokeRect(9.5, 17.5, w - 19, 27);
  if (i === 1) { signText(g, "EVERYBODY'S", w / 2, 30, western(1, '#F8D84A', '#2A0A0A')); signText(g, 'A WINNER!', w / 2, 41, western(1, '#F4F0E6', '#2A0A0A')); }
  else signText(g, i === 0 ? '3 SHOTS' : '1 TICKET', w / 2, 36, western(1, '#F4F0E6', '#0A1A2A'));
};

/** Meathead's left arm and the ray gun, pointing right (156 x 44): the shoulder end at the left, the muzzle at the right
 *  (GUN_MUZZLE). Thick, hairy, a tan; the chrome bulb, the pink coils, the dish, the duct-taped grip. */
export const GUN_W = 156, GUN_H = 56, GUN_PIVOT = [0, 32] as const, GUN_MUZZLE = [154, 16] as const;
const SKINR = ['#4A2414', '#7A4226', '#A86A42', '#C88A5E', '#E4A87A', '#F6C89C'];
export const paintGunArm = (g: Ctx) => {
  // (the forearm: banded round, hair, a vein)
  // (a meathead's forearm: thick at the elbow, thick at the wrist)
  polyF(g, [0, 4, 60, 8, 104, 14, 108, 38, 60, 46, 0, 56], INK);
  polyF(g, [0, 5, 60, 9, 103, 15, 107, 37, 60, 45, 0, 55], SKINR[3]);
  polyF(g, [0, 5, 60, 9, 103, 15, 104, 21, 60, 17, 0, 15], SKINR[4]); polyF(g, [0, 6, 60, 10, 100, 16, 60, 12, 0, 9], SKINR[5]);
  polyF(g, [0, 46, 60, 39, 106, 33, 107, 37, 60, 45, 0, 55], SKINR[2]); dith(g, 0, 40, 104, 3, SKINR[2]);
  for (let k = 0; k < 60; k++) { const x = 4 + hash(k * 3.3) * 96, y = 18 + hash(k * 1.7) * 20 - x * 0.04; box(g, x, y, 2, 1, SKINR[1]); }
  g.strokeStyle = '#8A7AA8'; g.lineWidth = 1; g.beginPath(); g.moveTo(10, 34); g.quadraticCurveTo(50, 24, 96, 28); g.stroke();
  // (the gun behind the hand: the bulb, banded chrome; the barrel, the coils, the dish)
  ellF(g, 126, 14, 17, 11, INK); ellF(g, 126, 14, 15.5, 9.5, STEEL[4]); ellF(g, 124, 12, 13, 7, STEEL[5]); ellF(g, 122, 10, 9, 4, STEEL[6]); ellF(g, 120, 9, 4, 2, STEEL[7]);
  dith(g, 114, 18, 24, 3, STEEL[3]);
  box(g, 134, 9, 16, 11, INK); box(g, 135, 10, 14, 9, STEEL[4]); box(g, 135, 10, 14, 2, STEEL[6]); box(g, 135, 17, 14, 2, STEEL[2]);
  for (const x of [137, 142]) { box(g, x, 7, 3, 15, INK); box(g, x, 8, 3, 13, '#EC44C4'); box(g, x, 8, 1, 13, '#FFB8F0'); }
  box(g, 149, 4, 6, 21, INK); box(g, 150, 5, 4, 19, STEEL[5]); box(g, 150, 5, 4, 2, STEEL[7]); box(g, 152, 10, 2, 9, '#500724');
  polyF(g, [112, 4, 120, 0, 126, 4], INK); polyF(g, [114, 4, 120, 1, 124, 4], '#C8302A');
  // (the hand round the duct-taped grip: knuckles banded, the thumb over)
  box(g, 104, 18, 16, 20, INK); box(g, 105, 19, 14, 18, '#9CA3AF'); for (let y = 20; y < 37; y += 3) box(g, 105, y, 14, 1, '#6B7280');
  ellF(g, 108, 26, 9, 10, INK); ellF(g, 108, 26, 8, 9, SKINR[3]); ellF(g, 106, 23, 5, 5, SKINR[4]);
  for (const y of [20, 26, 32]) { box(g, 113, y, 4, 4, INK); box(g, 113, y, 3, 3, SKINR[4]); box(g, 113, y, 2, 1, SKINR[5]); }
  ellF(g, 112, 16, 6, 3, INK); ellF(g, 112, 16, 5, 2, SKINR[4]);
};

/** The layout: what pieces there are, back to front (the logic gives them life: gallery.ts). */
export type PieceKind = 'plank' | 'panel' | 'moon' | 'wheel' | 'score' | 'lantern' | 'pshelf' | 'prize' | 'rail' | 'duck' | 'bandit' | 'fence' | 'bshelf' | 'bottle' | 'post' | 'scallop' | 'sign' | 'crail' | 'counter';
export interface PieceDef { id: string; kind: PieceKind; x: number; y: number; w: number; h: number; paint: (g: Ctx) => void; row?: 0 | 1; seg?: number; i: number }
export const pieceDefs = (): PieceDef[] => {
  const out: PieceDef[] = [];
  const add = (id: string, kind: PieceKind, x: number, y: number, w: number, h: number, paint: (g: Ctx) => void, i = 0, extra: Partial<PieceDef> = {}) => out.push({ id, kind, x, y, w, h, paint, i, ...extra });
  for (let i = 0; i < 6; i++) add(`plank${i}`, 'plank', 20 + i * 60, 30, 60, 185, paintPlank(i), i);
  for (let i = 0; i < 3; i++) add(`panel${i}`, 'panel', 20 + i * 120, 30, 120, 185, paintPanel(i), i);
  add('moon', 'moon', 40, 40, 26, 44, paintMoon);
  add('wheel', 'wheel', 330, 100, 48, 48, paintWheel);
  add('score', 'score', 296, 34, 70, 24, paintScore);
  add('lantern', 'lantern', 24, 26, 16, 30, paintLantern);
  add('pshelf', 'pshelf', 44, 58, 84, 6, paintPrizeShelf);
  for (let i = 0; i < 3; i++) add(`prize${i}`, 'prize', 54 + i * 24, 36, 18, 22, paintPrize(i), i);
  for (let r = 0; r < 2; r++) for (let s = 0; s < 3; s++) add(`rail${r}${s}`, 'rail', 20 + s * 120, (r ? RAIL_C : RAIL_A), 120, 6, paintRail, s, { row: r as 0 | 1, seg: s });
  for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) add(`duck${r}${i}`, 'duck', 20 + i * 60 + r * 30, (r ? RAIL_C : RAIL_A) - DUCK_H, DUCK_W, DUCK_H, paintDuck(r ? -1 : 1), i, { row: r as 0 | 1 });
  for (let i = 0; i < 3; i++) add(`bandit${i}`, 'bandit', 170 + i * 62, FENCE_Y - BANDIT_H + 4, BANDIT_W, BANDIT_H, paintBandit(i), i);
  add('fence', 'fence', 20, FENCE_Y, 360, 12, paintFence);
  add('bshelf', 'bshelf', 36, 140, 84, 5, paintBottleShelf);
  for (let i = 0; i < 5; i++) add(`bottle${i}`, 'bottle', 44 + i * 15, 122, 8, 18, paintBottle(i), i);
  add('postL', 'post', 0, 0, 20, 232, paintPost, 0);
  add('postR', 'post', 380, 0, 20, 232, paintPost, 1);
  for (let i = 0; i < 8; i++) add(`scallop${i}`, 'scallop', i * 50, 0, 50, 42, paintScallop(i), i);
  add('sign', 'sign', 125, 4, 150, 26, paintSign);
  add('crail', 'crail', 0, COUNTER_Y - 4, 400, 6, paintCounterRail);
  const cw = [133, 134, 133];
  for (let i = 0; i < 3; i++) add(`counter${i}`, 'counter', i === 0 ? 0 : i === 1 ? 133 : 267, COUNTER_Y, cw[i], 68, paintCounter(i, cw[i]), i);
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// Dooley's gross-up (painted once per tier: grossBust.ts)

const MOUTHS: Mouth[] = ['grin', 'talk', 'grimace', 'gape'];
/** Tier 0 (pitching), 1 (sore), 2 (going), 3 (gone). */
export const dooleyBust = (k: number): Bust => bust(`dooley-${k}`, {
  seed: 4711, skin: SKIN.pink, hair: 'combover', hairRamp: HAIR.brown, beard: 'stache', beardRamp: HAIR.brown, iris: IRIS.blue,
  sclera: k >= 2 ? 'red' : 'yellow', mouth: MOUTHS[k], coat: CLOTH.mustard, extras: ['sweaty', 'bowtie', 'wart', ...(k >= 3 ? ['drool' as const] : [])],
  wide: 1.14, tall: 1.0, jowl: 1.5 + k * 0.1, nose: 1.45, eye: 1 + k * 0.1, bulge: 1 + k * 0.15, look: k >= 2 ? [0.6, -0.2] : [-0.3, 0.1],
});

/** His green dealer's eyeshade over the gross-up (he wears it in the world too): `ox, oy` where the bust's box (its
 *  eyes are counted from it) lands on the screen, `s` its scale. */
export const drawVisor = (c: Ctx, bu: Bust, ox: number, oy: number, s: number) => {
  if (bu.eyes.length < 2) return;
  const [l, r] = bu.eyes[0][0] < bu.eyes[1][0] ? [bu.eyes[0], bu.eyes[1]] : [bu.eyes[1], bu.eyes[0]];
  const ey = Math.min(l[1], r[1]), x0 = ox + (l[0] - 40) * s, x1 = ox + (r[0] + 40) * s, by = oy + (ey - 29) * s, bh = 7 * s;
  c.fillStyle = '#0E3A22'; c.fillRect(Math.round(x0), Math.round(by - s), Math.round(x1 - x0), Math.round(bh + 2 * s));
  c.fillStyle = '#1A5A3A'; c.fillRect(Math.round(x0), Math.round(by), Math.round(x1 - x0), Math.round(bh));
  c.fillStyle = '#2E8A5A'; c.fillRect(Math.round(x0), Math.round(by), Math.round(x1 - x0), Math.round(2 * s));
  // (the bill, see-through green, out over his brow)
  c.globalAlpha = 0.55; c.fillStyle = '#2E9A5A';
  c.beginPath(); c.moveTo(x0 - 6 * s, by + bh + 12 * s); c.lineTo(x0 + 8 * s, by + bh); c.lineTo(x1 - 8 * s, by + bh); c.lineTo(x1 + 6 * s, by + bh + 12 * s); c.closePath(); c.fill();
  c.globalAlpha = 1; c.fillStyle = '#8AE8B0'; c.fillRect(Math.round(x0 - 4 * s), Math.round(by + bh + 11 * s), Math.round(x1 - x0 + 8 * s), Math.max(1, Math.round(s)));
};

// ---------------------------------------------------------------------------------------------------------------
// Dooley in the world

/** Who he is (the person drawer's seed: a heavy man). */
export const DOOLEY_SEED = 12;
const SHIRT = '#E2C66A', APRON = '#5E6A3A', PANTS = '#4A3A2A', VISOR = '#2E9A5A';
const DBOX: [number, number, number, number] = [-64, -140, 140, 144];
/** His look: 'idle' (leaning on it), 'pitch' (beckoning), 'panic' (hands on his head), 'gasp' (clutching his chest),
 *  'point' (chewing him out). */
export type DooleyLook = 'idle' | 'pitch' | 'panic' | 'gasp' | 'point';
const paintDooley = (g: Ctx, F: Frame) => {
  const B: Body = bodyOf(DOOLEY_SEED, F.pose === 'after' ? 'stand' : F.pose, F.fr, false);
  B.w += 8; B.hipW += 12; B.legW += 1; B.armW += 1.5; B.rx += 1.2; B.ry += 0.6;
  const L = B.L, skin = '#E8A88A', v = F.v as DooleyLook, k = F.fr % 2;
  legs(g, B, { col: PANTS, shoe: 'shoe', shoeCol: '#24160C', detail: (gg, hip, _kn, ft) => { for (let y = hip[1] + 4; y < ft[1] - 4; y += 5) px(gg, Math.min(hip[0], ft[0]) + 1, y, 2, 1, '#6A5640'); } });
  const panicky = v === 'panic' || v === 'gasp' || v === 'point';
  const fl = flailHands(B, F.fr);
  const far: [number, number] = fl ? fl[0] : v === 'panic' ? [B.hx - 7, B.hy - 7 + k] : v === 'gasp' ? [-3, B.shY + 9] : v === 'point' ? [B.hx - 7, B.hy - 6] : v === 'pitch' ? [-B.w / 2 - 4, B.hipY - 4] : [-B.w / 2 - 2, B.shY + 21];
  const near: [number, number] = fl ? fl[1] : v === 'panic' ? [B.hx + 9, B.hy - 8 - k] : v === 'gasp' ? [7, B.shY + 11] : v === 'point' ? [B.w / 2 + 25, B.shY + 1 + k * 2] : v === 'pitch' ? [B.hx + 17, B.hy - 12 + k * 4] : [B.w / 2 + 4, B.shY + 21];
  arm(g, B, -1, far[0], far[1], { sleeve: SHIRT, hand: skin, len: 0.55 });
  torso(g, B, SHIRT);
  // (the shirt sweated through at the pits and down the middle, worse in a panic)
  px(g, -B.w / 2 + 1, B.shY + 5, 5, panicky ? 9 : 5, '#B89A44'); px(g, B.w / 2 - 6, B.shY + 5, 5, panicky ? 9 : 5, '#B89A44');
  if (panicky) px(g, -2, B.shY + 6, 4, 12, '#C8AA50');
  // (the red suspenders; the canvas change apron, its pockets, coins)
  px(g, -B.w / 2 + 4, B.shY + 1, 3, B.hipY - B.shY, '#B42A2A'); px(g, B.w / 2 - 7, B.shY + 1, 3, B.hipY - B.shY, '#B42A2A');
  part(g, () => g.rect(-B.hipW / 2 - 1, B.hipY - 7, B.hipW + 2, 15), APRON, -B.hipW / 2 - 1, B.hipY - 7, B.hipW + 2, 15, 0.9);
  px(g, -B.hipW / 2, B.hipY - 7, B.hipW, 1, lt(APRON, 0.3));
  for (let x = -B.hipW / 2 + 2; x < B.hipW / 2 - 4; x += 9) { px(g, x, B.hipY - 2, 7, 1, dk(APRON, 0.4)); px(g, x + 2, B.hipY - 4, 2, 2, '#E8C25A'); }
  // (the polka-dot bow tie)
  part(g, () => { g.moveTo(-6, B.shY + 1); g.lineTo(0, B.shY + 4); g.lineTo(6, B.shY + 1); g.lineTo(6, B.shY + 8); g.lineTo(0, B.shY + 4); g.lineTo(-6, B.shY + 8); g.closePath(); }, '#C8302A', -6, B.shY + 1, 12, 7, 0.6);
  px(g, -4, B.shY + 3, 1, 1, '#FFFFFF'); px(g, 4, B.shY + 5, 1, 1, '#FFFFFF');
  // (the head: big, red-faced in a panic; the combover's strands; the walrus mustache over the toothpick; the bulb nose)
  const face = panicky ? mix(skin, '#E04A4A', 0.25) : skin;
  headShape(g, B, face);
  const eyes = v === 'point' ? 'angry' : panicky ? 'wide' : v === 'pitch' ? 'open' : 'smug';
  const mouth = v === 'point' ? (k ? 'teeth' : 'o') : panicky ? (k ? 'o' : 'teeth') : 'grin';
  faceOn(g, B, { skin: face, eyes, mouth, md: F.md, blink: F.blink, nose: false });
  part(g, () => g.ellipse(B.hx + 6.5, B.hy + 2, 3, 2.6, 0, 0, Math.PI * 2), '#D04A44', B.hx + 3.5, B.hy - 0.6, 6, 5.2, 1);
  px(g, B.hx + 5.5, B.hy + 0.6, 1, 1, '#FFB0A0');
  part(g, () => { g.moveTo(B.hx - 1, B.hy + 4); g.quadraticCurveTo(B.hx + 6, B.hy + 2, B.hx + 13, B.hy + 4); g.quadraticCurveTo(B.hx + 14, B.hy + 10, B.hx + 11, B.hy + 10); g.quadraticCurveTo(B.hx + 6, B.hy + 7, B.hx + 1, B.hy + 10); g.quadraticCurveTo(B.hx - 3, B.hy + 9, B.hx - 1, B.hy + 4); g.closePath(); }, '#5A3A22', B.hx - 3, B.hy + 2, 17, 8, 0.8);
  // (the toothpick, calm; in a panic his mouth gaping under the mustache, hyperventilating)
  if (!panicky) { px(g, B.hx + 10, B.hy + 8, 6, 1, '#E8D8A8'); }
  else { part(g, () => g.ellipse(B.hx + 6, B.hy + 11, 3.2, k ? 2.6 : 1.6, 0, 0, Math.PI * 2), '#3A0A10', B.hx + 3, B.hy + 9, 6.4, 5, 0.6); if (k) px(g, B.hx + 5, B.hy + 12, 3, 1, '#D8606A'); }
  // (the combover: a few long strands across the scalp; flying up off it in a panic)
  g.strokeStyle = '#4A3020'; g.lineWidth = 0.8;
  for (let s = 0; s < 3; s++) { g.beginPath(); if (panicky) { g.moveTo(B.hx - 3 + s * 3, B.hy - 9); g.quadraticCurveTo(B.hx - 6 + s * 5, B.hy - 17 - s, B.hx + 2 + s * 4 + (k ? 2 : -1), B.hy - 19 - s * 2); } else { g.moveTo(B.hx - 8, B.hy - 7 + s); g.quadraticCurveTo(B.hx, B.hy - 11 + s, B.hx + 8, B.hy - 8 + s); } g.stroke(); }
  // (the dealer's green eyeshade: its band, the see-through bill)
  px(g, B.hx - 9, B.hy - 8, 19, 2, '#1A5A3A');
  g.globalAlpha = 0.75; part(g, () => { g.moveTo(B.hx - 6, B.hy - 7); g.lineTo(B.hx + 16, B.hy - 7); g.lineTo(B.hx + 12, B.hy - 3); g.lineTo(B.hx - 4, B.hy - 3); g.closePath(); }, VISOR, B.hx - 6, B.hy - 7, 22, 4, 0.6); g.globalAlpha = 1;
  px(g, B.hx - 4, B.hy - 7, 18, 1, '#8AE8B0');
  // (sweat: beading, flying off him in a panic)
  if (panicky) for (let s = 0; s < 3; s++) { const sx = B.hx + [-10, 12, 15][s] + (k ? 1 : -1) * s, sy = B.hy + [-4, -10, 2][s] - k * 2; part(g, () => g.ellipse(sx, sy, 1.4, 2, 0, 0, Math.PI * 2), '#9AD8F8', sx - 1.4, sy - 2, 2.8, 4, 0.6); px(g, sx - 0.5, sy - 1, 1, 1, '#FFFFFF'); }
  else { px(g, B.hx - 8, B.hy - 2, 1, 2, '#9AD8F8'); }
  arm(g, B, 1, near[0], near[1], { sleeve: SHIRT, hand: skin, len: 0.55 });
  if (v === 'point' && !fl) px(g, near[0] + 2, near[1] - 1, 5, 2, skin);
  void L; void ball;
};
/** Him at (x, feet y), facing `face`, in `look` (`walk`: pacing). `md`: as he is (hurt, dead). */
export const drawDooleyAt = (c: Ctx, x: number, y: number, face: 1 | -1, look: DooleyLook, f: number, walk = false, pose?: Pose, md: 'ok' | 'hurt' | 'dead' = 'ok') => {
  const F = frameOf(DOOLEY_SEED, f, pose ?? (walk ? 'walk' : 'stand'), md, 0, false, look);
  // (the panic's frames flip faster: hyperventilating)
  if (!pose && (look === 'panic' || look === 'point' || look === 'gasp') && !walk) F.fr = Math.floor(f / 7) % 2;
  if (!pose && look === 'pitch') F.fr = Math.floor(f / 18) % 2;
  c.save(); c.translate(Math.round(x), Math.round(y)); if (face < 0) c.scale(-1, 1);
  putFrame(c, 'ft-dooley', F, DBOX, g => paintDooley(g, F));
  c.restore();
};
/** For the kind's drawing (the engine's translate and facing already on): the frame for his state. */
export const drawDooleyKind = (c: Ctx, F: Frame) => putFrame(c, 'ft-dooley', F, DBOX, g => paintDooley(g, F));

// ---------------------------------------------------------------------------------------------------------------
// The booth in the world (x0: its left at the play plane, feet at gy)

export const BOOTH_W = 172, COUNTER_H = 46;
const voidPatch = (g: Ctx, x: number, y: number, w: number, h: number) => {
  box(g, x, y, w, h, VOID[2]); dith(g, x, y, w, h, VOID[3]);
  for (let i = 0; i < w * h / 60; i++) box(g, x + hash(i * 3.7 + x) * w, y + hash(i * 5.3 + y) * h, 1, 1, i % 4 ? '#5A4A7A' : '#D8C8FF');
};
const paintBoothBack = (g: Ctx, lvl: number) => {
  const w = BOOTH_W;
  if (lvl >= 3) {
    // (nothing left: the scorched outline of where it stood, a few bolts)
    g.fillStyle = 'rgba(20,12,8,0.55)'; g.beginPath(); g.ellipse(w / 2, -2, w / 2 + 6, 6, 0, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 9; i++) box(g, 10 + hash(i * 2.2) * (w - 20), -3 - hash(i) * 3, 2, 1, i % 3 ? '#3A2A1A' : '#FF8CE4');
    return;
  }
  // (the back wall: the little gallery; at 1 a hole or two burned through to the void, at 2 most of it gone)
  const bx = 8, bw = w - 16, top = -184, bot = -COUNTER_H;
  bands(g, bx, top, bw, 80, SKY);
  for (const [a, b, t] of [[bx, bx + 50, -128], [bx + 70, bx + 140, -136], [bx + 120, bx + bw, -122]] as const) { polyF(g, [a - 4, -96, a, t, b, t, b + 4, -96], INK); polyF(g, [a - 3, -96, a + 1, t + 1, b - 1, t + 1, b + 3, -96], '#8A4A4A'); box(g, a + 1, t + 1, b - a - 2, 1, '#C87A6A'); }
  bands(g, bx, -104, bw, bot + 104, ['#C89A5A', '#A87A44', '#94683A']);
  if (lvl === 1) { voidPatch(g, bx + 20, top + 14, 26, 22); voidPatch(g, bx + 100, top + 40, 18, 30); }
  if (lvl === 2) { voidPatch(g, bx, top, bw * 0.7, bot - top); voidPatch(g, bx + bw * 0.7, top + 30, bw * 0.3, 60); }
  // (the wheel; the rail of ducks; a bandit up; bottles)
  if (lvl < 2) {
    ellF(g, bx + bw - 22, top + 30, 15, 15, INK);
    for (let kk = 0; kk < 8; kk++) { g.fillStyle = kk % 2 ? RED[3] : CREAM[3]; g.beginPath(); g.moveTo(bx + bw - 22, top + 30); g.arc(bx + bw - 22, top + 30, 13, (kk * Math.PI) / 4, ((kk + 1) * Math.PI) / 4); g.closePath(); g.fill(); }
    ellF(g, bx + bw - 22, top + 30, 5, 5, RED[3]); ellF(g, bx + bw - 22, top + 30, 2.5, 2.5, '#F4F0E6');
  }
  const ry = -100;
  if (lvl < 2) { box(g, bx, ry, bw, 4, INK); box(g, bx, ry + 1, bw, 2, BRASS[4]); }
  else { box(g, bx, ry, bw * 0.25, 4, INK); box(g, bx, ry + 1, bw * 0.25 - 1, 2, BRASS[3]); polyF(g, [bx + bw * 0.25, ry, bx + bw * 0.3, ry + 14, bx + bw * 0.27, ry + 15, bx + bw * 0.24, ry + 3], BRASS[2]); }
  const duck = (x: number) => { const d = bake(DUCK_W, DUCK_H, paintDuck(1)); g.drawImage(d, x, ry - DUCK_H * 0.8, DUCK_W * 0.8, DUCK_H * 0.8); };
  const ducks = lvl === 0 ? [14, 52, 90, 128] : lvl === 1 ? [30, 108] : [];
  for (const dx of ducks) duck(bx + dx);
  if (lvl === 0) { const bd = bake(BANDIT_W, BANDIT_H, paintBandit(0)); g.drawImage(bd, bx + 126, -86, BANDIT_W, BANDIT_H); }
  else if (lvl === 1) { box(g, bx + 130, -54, 4, 6, '#3A2A1A'); box(g, bx + 136, -54, 4, 6, '#3A2A1A'); }
  // (the posts; the awning (its roof dimmed: not a platform) and its scalloped hem; the sign board)
  for (const x of [0, w - 8]) { if (lvl === 2 && x > 0) { box(g, x, -60, 8, 60, INK); box(g, x + 1, -59, 6, 59, RED[3]); polyF(g, [x, -60, x + 8, -60, x + 5, -72, x + 2, -66], RED[2]); continue; } box(g, x, -214, 8, 214, INK); box(g, x + 1, -213, 6, 213, RED[3]); box(g, x + 1, -213, 2, 213, RED[4]); for (let y = -210; y < 0; y += 16) { box(g, x + 1, y, 6, 3, GOLD[3]); } }
  g.globalAlpha = 0.82;
  const roofTop = -244, roofBot = -214;
  const roofRight = lvl === 2 ? w * 0.45 : w;
  for (let x = -6; x < roofRight + 6; x += 12) { polyF(g, [x, roofBot, x + 6, roofBot, x + 6 + (x - w / 2) * 0.05, roofTop, x + (x - w / 2) * 0.05, roofTop], RED[2]); polyF(g, [x + 6, roofBot, x + 12, roofBot, x + 12 + (x - w / 2) * 0.05, roofTop, x + 6 + (x - w / 2) * 0.05, roofTop], CREAM[2]); }
  g.globalAlpha = 1;
  const n = Math.round((w + 12) / 16);
  for (let i = 0; i < n; i++) {
    if (lvl === 1 && (i === 3 || i === 7)) continue;
    if (lvl === 2 && i % 3 !== 0) continue;
    const x = -6 + i * 16;
    g.fillStyle = INK; g.beginPath(); g.moveTo(x, -215); g.lineTo(x + 16, -215); g.lineTo(x + 16, -206); g.arc(x + 8, -206, 8, 0, Math.PI); g.closePath(); g.fill();
    g.fillStyle = i % 2 ? RED[3] : CREAM[3]; g.beginPath(); g.moveTo(x + 1, -214); g.lineTo(x + 15, -214); g.lineTo(x + 15, -206); g.arc(x + 8, -206, 7, 0, Math.PI); g.closePath(); g.fill();
    box(g, x + 7, -199, 2, 2, GOLD[4]);
  }
  // (the sign board up top: hanging off one chain at 2)
  g.save();
  if (lvl === 2) { g.translate(30, -250); g.rotate(0.5); g.translate(-30, 250); }
  box(g, 10, -276, w - 20, 34, INK); box(g, 11, -275, w - 22, 32, '#2A1A3A'); box(g, 11, -275, w - 22, 1, '#5A3A7A');
  for (let x = 14; x < w - 12; x += 8) { box(g, x, -273, 2, 2, (x / 8) % 2 ? '#FFE070' : '#F8A040'); box(g, x, -247, 2, 2, (x / 8) % 2 ? '#F8A040' : '#FFE070'); }
  signText(g, "DEAD-EYE DOOLEY'S", w / 2, -262, western(1, '#F8D84A', '#7A1A1A'));
  signText(g, "SHOOTIN' GALLERY", w / 2, -251, western(1, '#F4F0E6', '#3A0A2A'));
  g.restore();
};
const paintBoothFront = (g: Ctx, lvl: number) => {
  if (lvl >= 3) {
    // (the cash box left lying where the counter was)
    box(g, 70, -12, 26, 12, INK); box(g, 71, -11, 24, 10, '#3A5A3A'); box(g, 71, -11, 24, 2, '#5A8A5A'); box(g, 81, -8, 4, 3, GOLD[4]);
    return;
  }
  const w = BOOTH_W, h = COUNTER_H;
  box(g, -2, -h, w + 4, h, INK);
  bands(g, -1, -h + 4, w + 2, h - 4, [WOOD[3], WOOD[3], WOOD[2], WOOD[1]]);
  for (let x = 14; x < w; x += 22) box(g, x, -h + 4, 1, h - 4, WOOD[1]);
  box(g, 10, -h + 10, w - 20, 26, INK); box(g, 11, -h + 11, w - 22, 24, '#7A1A2A'); g.strokeStyle = GOLD[3]; g.lineWidth = 1; g.strokeRect(13.5, -h + 13.5, w - 27, 19);
  signText(g, '3 SHOTS 1 TICKET', w / 2, -h + 22, western(1, '#F8D84A', '#2A0A0A'));
  signText(g, "EVERYBODY'S A WINNER!", w / 2, -h + 31, western(1, '#F4F0E6', '#2A0A0A'));
  box(g, -2, -h - 2, w + 4, 5, INK); box(g, -1, -h - 1, w + 2, 3, BRASS[3]); box(g, -1, -h - 1, w + 2, 1, BRASS[6]);
  if (lvl === 2) { g.fillStyle = 'rgba(20,10,20,0.6)'; g.beginPath(); g.ellipse(w * 0.7, -h + 20, 22, 12, 0.3, 0, Math.PI * 2); g.fill(); for (let i = 0; i < 8; i++) box(g, w * 0.6 + hash(i * 1.3) * 40, -h + 10 + hash(i * 2.9) * 22, 1, 1, '#FF8CE4'); }
};
export const drawBoothBack = (c: Ctx, x0: number, gy: number, lvl: number) =>
  still(c, `gallery-back-${lvl}`, x0, gy, -16, -300, BOOTH_W + 32, 304, g => paintBoothBack(g, lvl));
export const drawBoothFront = (c: Ctx, x0: number, gy: number, lvl: number) =>
  still(c, `gallery-front-${lvl}`, x0, gy, -8, -COUNTER_H - 8, BOOTH_W + 16, COUNTER_H + 10, g => paintBoothFront(g, lvl));

// ---------------------------------------------------------------------------------------------------------------
// The charge shard (lying in the street, and on the card)

export const drawShard = (c: Ctx, x: number, y: number, s: number, f: number) => {
  const w = Math.abs(Math.cos(f * 0.07)) * 0.7 + 0.3;
  for (const [r, a] of [[22, 0.12], [15, 0.18], [9, 0.22]] as const) { c.fillStyle = `rgba(103, 232, 249, ${a})`; c.beginPath(); c.arc(x, y, r * s, 0, Math.PI * 2); c.fill(); }
  const pts = (k: number) => { c.beginPath(); c.moveTo(x, y - 14 * s * k); c.lineTo(x + 7 * s * w * k, y - 3 * s * k); c.lineTo(x + 4 * s * w * k, y + 12 * s * k); c.lineTo(x - 4 * s * w * k, y + 12 * s * k); c.lineTo(x - 7 * s * w * k, y - 3 * s * k); c.closePath(); };
  pts(1.18); c.fillStyle = INK; c.fill();
  pts(1); c.fillStyle = '#0E7490'; c.fill();
  c.save(); pts(1); c.clip();
  box(c, x - 7 * s, y - 14 * s, 7 * s * w, 28 * s, '#22D3EE'); box(c, x - 5 * s * w, y - 10 * s, 2 * s, 16 * s, '#CFFAFE');
  c.restore();
  if (f % 30 < 4) { box(c, x - 1, y - 20 * s, 2, 6 * s, '#FFFFFF'); box(c, x - 3 * s, y - 17 * s, 6 * s, 2, '#FFFFFF'); }
};
