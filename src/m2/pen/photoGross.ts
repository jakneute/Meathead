// The staff room's EMPLOYEE OF THE MONTH (MAR 1994), grossed up (the user's: "make the employee of the month image in
// the employee break room 'ren & stimpy' gross"): Gary, in the park's green visor and red polo, lanyard and name tag,
// held still in a John K close-up against the portrait studio's laser backdrop. The lazy eye drifting off, both
// bloodshot; the bags; the bulb of a nose (blackheads, a hair out of it); the patchy mustache; the forced
// customer-service grin, the gums, the crooked yellow teeth in braces, a gold one, spit strung between; cracked lips;
// the shaving nick with its bit of tissue; stubble, pores, grease, sweat. Somebody's drawn horns on him and written
// LOSER over his shoulder. Painted per pixel with the shared gross kit (../grossKit.ts), one screen pixel a pixel.
//
// Painted once, ahead, in idle moments (warmEmployeePhoto, from the room's first frame), then drawn as a cached image
// over the room's stamp (art.ts paints the frame and the brass plate round it).

import {
  type Buf, R, WHITE, newBuf, setSeed, rnd, ball, tint, poly, path, seg, plot, shade, hairs, stubble, skinPost,
  eyeball, teeth, bead, vein, hexU, mixU, bay, hash2, matAt, toCanvas, stepper, GW,
  SCLERA_Y, SCLERA_R, MOUTH, TONGUE, GUM, M_SKIN, M_MOUTH, M_LIP, M_METAL, M_CLOTH, M_OTHER,
} from '../grossKit';
import { idleJob } from '../../m1/game/scenes/art/raster';

type Ctx = CanvasRenderingContext2D;

/** The photo's size, in its pixels (one screen pixel each). */
export const PHOTO_W = 72, PHOTO_H = 62;

const SKIN = R('#FFE8C4', '#F4CA9A', '#E2AA7A', '#C68A5E', '#A06848', '#6C4230', '#2E160C');
const HAIR = hexU('#3A2A16'), HAIR_HI = hexU('#8A7650');
const VISOR = R('#A4F4B0', '#5AD070', '#2E9E48', '#1C6E30', '#0C4018', '#04200A');
const POLO = R('#FF907E', '#EC5040', '#BE2C24', '#861A14', '#4A0A06', '#200402');
const COLLAR = R('#FFB0A0', '#F47060', '#C83A2E', '#8E2018', '#3A0806');
const IRIS = R('#E0C890', '#A8884A', '#6E5426', '#42300E', '#1A1004');
const BRACE = R('#FFFFFF', '#D8DEE8', '#9CA6B6', '#5E687A', '#262C38');
const DROOL = R('#FFFFFF', '#E8F4F0', '#BCD8D0', '#86A8A0', '#4A6A64');
const LIP = R('#E89A8A', '#C87264', '#A0504A', '#743434', '#3E1616');
const PUS = R('#FFF8C8', '#F4DC80', '#D0A848', '#94702A', '#3A2A0A');
const LINE = hexU('#140A08'), MARKER = hexU('#10142E');

/** A mouth's hole between its two edges, deepening into it. */
const maw = (b: Buf, x0: number, x1: number, top: (x: number) => number, bot: (x: number) => number) => {
  for (let x = Math.floor(x0); x <= x1; x++) {
    const t = top(x), bt = bot(x);
    for (let y = Math.floor(t); y <= Math.ceil(bt); y++) {
      if (y + 0.5 < t || y - 0.5 > bt) continue;
      const k = Math.min(MOUTH.length - 1, 1 + Math.round(((y - t) / Math.max(1, bt - t)) * 3 + (bay(x, y) - 0.5)));
      plot(b, x, y, MOUTH[k], M_MOUTH);
    }
  }
};
/** Spit strung across the open mouth, top to bottom (sagging, a bead on it). */
const strings = (b: Buf, xs: number[], top: (x: number) => number, bot: (x: number) => number) => {
  for (const x of xs) {
    const t = Math.round(top(x)) + 1, bt = Math.round(bot(x)) - 1;
    for (let y = t; y <= bt; y++) { const sx = x + Math.round(Math.sin(((y - t) / Math.max(1, bt - t)) * Math.PI) * 1.2); if (matAt(b, sx, y) === M_MOUTH) plot(b, sx, y, DROOL[y % 3 ? 1 : 2]); }
    const my = Math.round((t + bt) / 2); plot(b, x + 1, my, DROOL[0]); plot(b, x + 2, my, DROOL[2]);
  }
};

// (the marker's letters, 3 x 5, scrawled at 2x)
const GLYPH: Record<string, string[]> = {
  L: ['100', '100', '100', '100', '111'],
  O: ['111', '101', '101', '101', '111'],
  S: ['111', '100', '111', '001', '111'],
  E: ['111', '100', '110', '100', '111'],
  R: ['110', '101', '110', '101', '101'],
};

function* paint(): Generator<void, Buf, unknown> {
  const b = newBuf();
  setSeed(1994);
  const W = PHOTO_W, H = PHOTO_H;
  // The portrait studio's laser backdrop: blue, banded off a glow behind his head, streaks of light shot across it
  const BG = ['#121A4A', '#1C2A6E', '#28408E', '#3656AC', '#4870C4', '#5E8CD8'].map(hexU);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = Math.hypot((x - 30) / 44, (y - 22) / 38);
    const k = Math.max(0, Math.min(BG.length - 1, Math.round((1 - d) * (BG.length - 1) + (bay(x, y) - 0.5) * 0.9)));
    b.px[y * GW + x] = BG[k];
    const streak = Math.abs(((x * 0.7 + y) % 23) - 11.5);
    if (streak < 0.6 && bay(x, y) < 0.6) b.px[y * GW + x] = mixU(BG[k], hexU('#C8E4FF'), 0.5);
  }
  yield;

  // The shoulders: the park polo, its collar, the lanyard, the name tag
  poly(b, [0, H, 0, 54, 12, 46, 60, 46, W, 53, W, H], POLO, M_CLOTH, { tilt: 0.25 });
  ball(b, 36, 50, 11, 9, SKIN, { mat: M_SKIN, line: true, lw: 1 });
  poly(b, [22, 46, 36, 56, 31, 61, 18, 50], COLLAR, M_CLOTH);
  poly(b, [50, 46, 36, 56, 41, 61, 54, 50], COLLAR, M_CLOTH);
  for (let k = 0; k < 3; k++) plot(b, 36, 57 + k * 2, LINE);
  path(b, [24, 52, 28, 62], hexU('#1E3A8A'), 2); path(b, [48, 52, 44, 62], hexU('#1E3A8A'), 2);
  for (let k = 0; k < 4; k++) { plot(b, 25 + k, 53 + k * 2.5, hexU('#FACC15')); plot(b, 47 - k, 53 + k * 2.5, hexU('#FACC15')); }
  // (the name tag, pinned crooked on the chest: GARY, a smiley)
  poly(b, [52, 54, 66, 53, 67, 61, 53, 62], R('#FFFFFF', '#F1EFEA', '#DAD7D2', '#B8B4AE', '#26282C'), M_OTHER, { tilt: 0 });
  for (let x = 54; x <= 65; x++) plot(b, x, 55.5 - (x - 54) * 0.07, hexU('#2D51B0'));
  for (const [x, y] of [[55, 58], [56, 59], [57, 58], [58, 59], [59, 58], [61, 58], [62, 59], [63, 58]] as const) plot(b, x, y, LINE);
  yield;

  // The ears (sticking out), the head
  for (const [ex, s] of [[12, -1], [60, 1]] as const) {
    ball(b, ex, 31, 5, 7.5, SKIN, { mat: M_SKIN, line: true, lw: 1 });
    path(b, [ex + s * 0.5, 26, ex + s * 2, 29, ex + s * 1.5, 34, ex, 36], SKIN[4], 1, undefined, M_SKIN);
    tint(b, ex, 31, 3, 5, hexU('#D04A4A'), 0.3, M_SKIN);
  }
  ball(b, 36, 30, 23, 26, SKIN, { mat: M_SKIN, line: true, lw: 1.2 });
  // (the greasy sideburns, and what's left on top: a comb-over, strands stuck down with sweat)
  hairs(b, 70, () => [13 + rnd() * 4, 14 + rnd() * 14], 3, Math.PI / 2, HAIR, M_SKIN, 0.4);
  hairs(b, 70, () => [55 + rnd() * 4, 14 + rnd() * 14], 3, Math.PI / 2, HAIR, M_SKIN, 0.4);
  for (let k = 0; k < 14; k++) {
    const x0 = 16 + k * 3, y0 = 6 + Math.abs(k - 7) * 0.4;
    path(b, [x0, y0, x0 + 6, y0 - 3 + rnd(), x0 + 12, y0 - 2 + rnd() * 2], k % 3 ? HAIR : HAIR_HI, 1, undefined, M_SKIN);
  }
  yield;

  // The visor: its band round the head, the brim out over the brow (the park's star on it), the brim's shadow under it
  for (let y = 6; y <= 10; y++) for (let x = 0; x < W; x++) if (matAt(b, x, y) === M_SKIN) plot(b, x, y, VISOR[y === 6 ? 1 : y === 10 ? 4 : 2]);
  tint(b, 36, 19, 22, 4, hexU('#3A1A10'), 0.35, M_SKIN);
  ball(b, 36, 12, 27, 5.5, VISOR, { mat: M_OTHER, line: true, lw: 1, flat: 0.5 });
  for (let x = 12; x <= 60; x++) { if (x % 2) plot(b, x, 15, VISOR[4]); if (x % 5 === 0) plot(b, x, 10, VISOR[0]); }
  const STAR = [[36, 9], [35, 10], [36, 10], [37, 10], [34, 11], [35, 11], [36, 11], [37, 11], [38, 11], [35, 12], [37, 12], [34, 13], [38, 13]];
  for (const [x, y] of STAR) plot(b, x, y, hexU('#FACC15'));
  plot(b, 36, 10, WHITE);
  // (two strands of hair stuck to his forehead under it)
  path(b, [30, 17, 29, 20, 30, 22], HAIR, 1, undefined, M_SKIN); path(b, [33, 17, 34, 19, 33, 21], HAIR, 1, undefined, M_SKIN);
  vein(b, [46, 17, 47, 19, 46, 22], R('#C8D0F0', '#9AA8D8', '#7080B8', '#506098', '#344070', '#1A2040'), 1);
  yield;

  // The eyes: bloodshot, popping, the left on you, the lazy right one off up the wall; the bags under them
  for (const [ex, ey, rx] of [[26, 33, 7], [47, 33, 8]] as const) tint(b, ex, ey, rx, 2.6, hexU('#6A3A5A'), 0.45, M_SKIN);
  eyeball(b, 26, 27.5, { rx: 6.5, ry: 6, sclera: SCLERA_R, iris: IRIS, ir: 2.4, idx: 0.6, idy: 0.4, pr: 1, veins: 11, top: (x) => 23.2 + Math.abs(x - 26) * 0.18, lid: SKIN });
  eyeball(b, 47, 27, { rx: 7.5, ry: 7, sclera: SCLERA_Y, iris: IRIS, ir: 2.2, idx: 3.2, idy: -2, pr: 0.7, veins: 14 });
  for (const [ex, w] of [[26, 6], [47, 7]] as const) { path(b, [ex - w, 33, ex, 35, ex + w, 33], SKIN[5], 1, undefined, M_SKIN); path(b, [ex - w + 1, 35, ex, 37, ex + w - 1, 35], SKIN[4], 1, undefined, M_SKIN); }
  // (the brows: bushy, up and hopeful)
  hairs(b, 40, () => [20 + rnd() * 12, 20.5 - rnd() * 1.5 + Math.abs(rnd() * 12 - 6) * 0.1], 2.5, -0.35, HAIR, M_SKIN, 0.5);
  hairs(b, 40, () => [41 + rnd() * 13, 19.5 - rnd() * 1.5], 2.5, 0.35 + Math.PI, HAIR, M_SKIN, 0.5);
  yield;

  // The nose: a red bulb, its pores and blackheads, the nostrils, a hair out of one
  ball(b, 36.5, 36, 4.8, 4, SKIN, { mat: M_SKIN, line: (dx, dy) => dy > 0.35 || Math.abs(dx) > 0.8, lw: 0.8 });
  tint(b, 36.5, 36, 5, 4, hexU('#E04848'), 0.35, M_SKIN);
  plot(b, 34, 39, LINE); plot(b, 35, 39, LINE); plot(b, 38, 39, LINE); plot(b, 39, 39, LINE);
  seg(b, 38, 39, 39, 41, HAIR); plot(b, 35, 34, WHITE); plot(b, 36, 34, WHITE);
  // (the cheeks: rosacea, the smile lines dug in from the nose to the corners)
  tint(b, 19, 38, 6, 4, hexU('#E05050'), 0.28, M_SKIN); tint(b, 54, 38, 6, 4, hexU('#E05050'), 0.28, M_SKIN);
  path(b, [31, 38, 24, 41, 20, 45], SKIN[5], 1, undefined, M_SKIN); path(b, [42, 38, 49, 41, 53, 45], SKIN[5], 1, undefined, M_SKIN);
  path(b, [30, 39, 23, 42], SKIN[1], 1, undefined, M_SKIN); path(b, [43, 39, 50, 42], SKIN[1], 1, undefined, M_SKIN);
  yield;

  // The grin: forced wide, corners up, the gums over the teeth, the crooked yellow teeth in braces, a gold one, a gap
  const top = (x: number) => { const u = (x - 36) / 17; return 44 - 3.5 * u * u; };
  const bot = (x: number) => { const u = (x - 36) / 17; return top(x) + 1 + 6.5 * Math.max(0, 1 - u * u); };
  maw(b, 19, 53, top, bot);
  ball(b, 37, bot(37) - 1.5, 7, 2, TONGUE, { only: (x, y) => matAt(b, x, y) === M_MOUTH });
  for (let x = 20; x <= 52; x++) for (let k = 0; k < 2; k++) plot(b, x, Math.round(top(x)) + k, GUM[1 + k + (bay(x, k) > 0.6 ? 1 : 0)], M_MOUTH);
  teeth(b, 20, 53, (x) => top(x) + 2, 1, 3.5, { tw: 3, long: [2, 8], rot: [3, 9], gold: [6], gaps: [4] });
  teeth(b, 22, 51, (x) => bot(x), -1, 2.5, { tw: 3, rot: [1, 6], gaps: [3] });
  // (the braces: a wire along the top row, a bracket on each tooth, a rubber band snapped)
  for (let x = 20; x <= 52; x++) { const y = Math.round(top(x) + 3.5); if (matAt(b, x, y) === M_OTHER) plot(b, x, y, BRACE[x % 4 ? 2 : 0], M_METAL); }
  for (let x = 21; x < 53; x += 3) { const y = Math.round(top(x) + 3); if (matAt(b, x, y + 1) === M_METAL || matAt(b, x, y) === M_OTHER) { plot(b, x, y, BRACE[1], M_METAL); plot(b, x + 1, y, BRACE[3], M_METAL); plot(b, x, y + 1, BRACE[4], M_METAL); } }
  seg(b, 45, top(45) + 4, 46, bot(46) - 1, hexU('#E86A9A'));
  strings(b, [26, 41, 48], top, bot);
  // (the lips: the top one stretched thin over the gums, the bottom cracked, wet)
  for (let x = 19; x <= 53; x++) { const y = Math.round(top(x)) - 1; plot(b, x, y, LIP[2], M_LIP); plot(b, x, y - 1, LIP[x % 5 ? 3 : 4], M_LIP); }
  for (let x = 20; x <= 52; x++) {
    const y = Math.round(bot(x)) + 1;
    plot(b, x, y, LIP[bay(x, y) > 0.5 ? 0 : 1], M_LIP); plot(b, x, y + 1, LIP[2], M_LIP); plot(b, x, y + 2, LIP[4], M_LIP);
    if (x % 4 === 1) plot(b, x, y + 1, LIP[4]);
    if (x % 6 === 3) plot(b, x, y, WHITE);
  }
  // (the patchy mustache: a few dozen hairs, more on one side)
  hairs(b, 46, () => { const x = 23 + rnd() * 26; return x > 33 && x < 37 ? null : (x > 40 && rnd() < 0.5 ? null : [x, top(x) - 3 - rnd() * 1.5]); }, 2, Math.PI / 2, HAIR, M_SKIN, 0.9);
  yield;

  // The skin's going over: stubble on the jaw, pores (thick on the nose), blackheads, the grease
  stubble(b, (x, y) => (y > 44 && Math.abs(x - 36) < 22 ? Math.min(1, (y - 44) / 4) : 0), hexU('#3A2A1A'), 0.42);
  skinPost(b, SKIN[5], (x, y) => 0.08 + (((x - 36.5) / 5) ** 2 + ((y - 36) / 4) ** 2 < 1 ? 0.24 : 0) + ((y > 34 && y < 42 && (x < 26 || x > 47)) ? 0.08 : 0), { shine: 0.22, blackheads: (x, y) => Math.abs(x - 36.5) < 5 && y > 32 && y < 40 });
  // (a whitehead on the chin, one by the ear; the shaving nick, its bit of tissue, the blood through it)
  for (const [x, y] of [[29, 54], [56, 24]] as const) { ball(b, x, y, 1.5, 1.5, PUS, { line: (_dx, dy) => dy > 0 }); plot(b, x - 0.4, y - 0.6, WHITE); tint(b, x, y, 2.5, 2.5, hexU('#E04848'), 0.3, M_SKIN); }
  for (const [x, y] of [[44, 53], [45, 53], [44, 54], [45, 54], [46, 54]] as const) plot(b, x, y, hexU('#F4F0E8'));
  plot(b, 45, 54, hexU('#C8202A')); plot(b, 46, 55, hexU('#8A1018'));
  // (the sweat: under the brim, on the nose, the temples, the upper lip)
  for (const [x, y, r] of [[20, 19, 1.1], [52, 18, 1], [40, 20, 0.9], [14, 24, 1.1], [59, 23, 1], [38, 33, 0.8], [27, 41, 0.8], [17, 34, 0.9]] as const) bead(b, x, y, r, SKIN);
  // (a fleck of spit in the air off the grin)
  plot(b, 56, 44, DROOL[1]); plot(b, 57, 43, DROOL[0]); plot(b, 58, 45, DROOL[2]);
  yield;

  // Somebody's marker: horns on him, LOSER across his shoulder
  path(b, [18, 9, 15, 1, 23, 6], MARKER, 1); path(b, [54, 6, 58, 0, 55, 9], MARKER, 1);
  path(b, [16, 4, 17, 6], MARKER, 1); path(b, [56, 3, 56, 5], MARKER, 1);
  'LOSER'.split('').forEach((ch, i) => {
    const gx = 2 + i * 8, gy = 50 + (i % 2) - Math.round(i * 0.4);
    GLYPH[ch].forEach((row, r) => { for (let cc = 0; cc < 3; cc++) if (row[cc] === '1') for (let a = 0; a < 2; a++) for (let d = 0; d < 2; d++) plot(b, gx + cc * 2 + a, gy + r * 2 + d, a === 1 && d === 1 ? hexU('#7A0A0A') : hexU('#D41E1E')); });
  });
  // The glass over it all: a glare across the top corner
  for (let k = 0; k < 18; k++) { shade(b, 4 + k, 22 - k * 1.2, WHITE, 0.32); shade(b, 5 + k, 22 - k * 1.2, WHITE, 0.18); shade(b, 9 + k, 24 - k * 1.2, WHITE, 0.12); }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (hash2(x + 300, y) > 0.995) b.px[y * GW + x] = mixU(b.px[y * GW + x], WHITE, 0.4);
  return b;
}

const job = stepper(() => paint());
let img: HTMLCanvasElement | null = null, kicked = false;

/** Paints the photo in idle moments, a few ms at a time (once). */
export const warmEmployeePhoto = () => {
  if (kicked || typeof document === 'undefined') return;
  kicked = true;
  idleJob(until => job.run(until));
};

/** The photo at (x, y), PHOTO_W x PHOTO_H (finished now if it's not painted yet). */
export const drawEmployeePhoto = (c: Ctx, x: number, y: number) => {
  if (typeof document === 'undefined') return;
  if (!img) img = toCanvas(job.finish());
  if (!img) return;
  const was = c.imageSmoothingEnabled;
  c.imageSmoothingEnabled = false;
  c.drawImage(img, 0, 0, PHOTO_W, PHOTO_H, Math.round(x), Math.round(y), PHOTO_W, PHOTO_H);
  c.imageSmoothingEnabled = was;
};
