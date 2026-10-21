// DAVE. VISIONARY. (the Vision room's oil portrait), grossed up (the user's: "same for the 'dave. visionary.' part"):
// the gilt-framed portrait of the studio's genius as a Ren & Stimpy close-up held still, painted per pixel with the
// shared gross kit (../../grossKit.ts): a huge sweaty head, the receding greased-back hair (dandruff), heavy smug lids
// over bloodshot eyes behind thick black frames (smudged lenses), a bulbous drinker's nose (blackheads, nose hairs), a
// lopsided smirk (yellow teeth, the gums, one gold), the goatee (going gray), stubble, a mole with its hair, a pimple,
// the double chin over the black turtleneck's roll, arms crossed (the hairy knuckles, a gold pinky ring). Painted once,
// cached; the live bits (a bead of sweat running down his temple, a glint across his glasses) drawn over it each frame.

import {
  R, hexU, mixU, WHITE, newBuf, setSeed, rnd, matAt, plot, shade, seg, path, ball, tint, poly, bead, hairs, stubble,
  inkEdges, skinPost, eyeball, teeth, toCanvas, hash2, pxAt, GUM, SCLERA_Y, SCLERA_R, GOLD, DARK,
  M_SKIN, M_HAIR, M_LIP, M_MOUTH, M_OTHER, M_CLOTH, type Buf, type Ctx,
} from '../../grossKit';
import { CEIL, X } from './layout';

/** The portrait's canvas (world: its top left; the gilt frame's round it) and the part of it the painting covers. */
const PX = 980, PY = 90, PW = 200, PH = 250, TOP = 46;
const BW = PW, BH = PH - TOP;

const SKIN = R('#FFE8D2', '#F8D6B6', '#F0C8A2', '#E0AE86', '#C88E68', '#A86E4E', '#7E4E36', '#3E2014');
const HAIR = R('#A08670', '#7E6652', '#5B4636', '#463428', '#32241A', '#22180E', '#100A06');
const CLOTH = R('#4C4C56', '#383842', '#28282F', '#1C1C22', '#121216', '#060608');
const IRIS = R('#C8925A', '#A06E3C', '#7C5026', '#5A3618', '#3A2010', '#1A0C04');
const LIP = R('#F0A898', '#DC8A7C', '#C46E64', '#A4544E', '#7E3A38', '#4A1A1C');
const FRAME = R('#74747E', '#4A4A54', '#2C2C34', '#1A1A20', '#0A0A0C');
const MOLE = R('#8A5A3A', '#6A4028', '#4A2A18', '#2A160A');
const ZIT = R('#FFD0C0', '#F07A6A', '#D04A44', '#A02A2A', '#5A1010');
const LINE = SKIN[SKIN.length - 1];

const EYES: [number, number][] = [[78, 62], [122, 59]];
const GLASS_R = 17;

/** y along a run of points (x, y pairs, x rising), held flat past the ends. */
const along = (pts: number[], x: number) => {
  if (x <= pts[0]) return pts[1];
  for (let i = 2; i < pts.length; i += 2) if (x <= pts[i]) { const k = (x - pts[i - 2]) / (pts[i] - pts[i - 2]); return pts[i - 1] + (pts[i + 1] - pts[i - 1]) * k; }
  return pts[pts.length - 1];
};
/** A crease in the skin: the fold's dark line, the lit lip of skin just under it. */
const crease = (b: Buf, pts: number[], k = 1) => {
  path(b, pts.map((v, i) => (i % 2 ? v + 1 : v)), SKIN[1], 1, undefined, M_SKIN);
  for (let i = 2; i < pts.length; i += 2) seg(b, pts[i - 2], pts[i - 1], pts[i], pts[i + 1], k > 0.7 ? SKIN[6] : SKIN[5], 1, undefined, M_SKIN);
};
/** A thick plastic ring (the glasses' rim): lit up left round its tube. */
const ring = (b: Buf, cx: number, cy: number, r: number, w: number) => {
  for (let y = Math.floor(cy - r - w); y <= cy + r + w; y++) for (let x = Math.floor(cx - r - w); x <= cx + r + w; x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy), t = (d - r) / (w / 2);
    if (Math.abs(t) > 1) continue;
    if (Math.abs(t) > 0.72) { plot(b, x, y, FRAME[4], M_OTHER); continue; }
    const lit = (-(dx / d) * 0.6 - (dy / d) * 0.8) * (t < 0 ? -1 : 1) * 0.5 + 0.5 - Math.abs(t) * 0.4;
    const k = Math.max(0, Math.min(3, Math.round((1 - lit) * 3 + (hash2(x, y) - 0.5) * 0.8)));
    plot(b, x, y, FRAME[k], M_OTHER);
  }
};

const paint = (): Buf => {
  const b = newBuf();
  setSeed(1993);
  const inBox = (x0: number, y0: number, w: number, h: number, mat?: number) => () => {
    for (let k = 0; k < 12; k++) { const x = x0 + rnd() * w, y = y0 + rnd() * h; if (mat === undefined || matAt(b, x, y) === mat) return [x, y] as [number, number]; }
    return null;
  };

  // (the black turtleneck: the shoulders, its creases; the arms crossed over it, the near one over the far)
  poly(b, [6, BH, 12, 162, 38, 144, 74, 134, 126, 134, 162, 144, 188, 162, 194, BH], CLOTH, M_CLOTH, { tilt: 0.5 });
  poly(b, [184, 194, 178, 170, 62, 166, 52, 184, 60, 192], CLOTH.slice(1), M_CLOTH, { tilt: -0.3 });
  poly(b, [14, 196, 20, 174, 142, 162, 154, 176, 146, 190, 30, 200], CLOTH, M_CLOTH, { tilt: 0.2 });
  for (const p of [[40, 150, 56, 166], [150, 148, 136, 162], [70, 180, 96, 174], [110, 184, 132, 172], [168, 176, 176, 190]]) seg(b, p[0], p[1], p[2], p[3], CLOTH[4], 1, undefined, M_CLOTH);
  for (const p of [[41, 149, 57, 165], [71, 178, 97, 172]]) seg(b, p[0], p[1], p[2], p[3], CLOTH[1], 1, undefined, M_CLOTH);
  // (his hand round the far arm: thick fingers, hair on the knuckles, the gold pinky ring)
  ball(b, 156, 176, 13, 10, SKIN, { mat: M_SKIN, line: true });
  for (let k = 0; k < 3; k++) seg(b, 147 + k * 6, 170, 146 + k * 6, 184, SKIN[6], 1, undefined, M_SKIN);
  hairs(b, 26, inBox(144, 166, 24, 8, M_SKIN), 3, -1.2, HAIR[5], M_SKIN, 0.9);
  ball(b, 165, 184, 3.5, 2.6, GOLD, { mat: M_OTHER, line: true, lw: 0.8 }); plot(b, 164, 183, WHITE);
  // (the turtleneck's roll, ribbed)
  ball(b, 100, 138, 38, 13, CLOTH, { mat: M_CLOTH, line: true, flat: 0.6 });
  ball(b, 100, 130, 33, 10, CLOTH, { mat: M_CLOTH, line: true, flat: 0.6 });
  for (let x = 66; x < 136; x += 4) { seg(b, x, 122, x + 1, 148, CLOTH[4], 1, undefined, M_CLOTH); seg(b, x + 1, 122, x + 2, 148, CLOTH[0], 1, undefined, M_CLOTH); }
  // (the ears, the dark of their insides)
  for (const [ex, ey, s] of [[48, 74, -1], [152, 71, 1]]) {
    ball(b, ex, ey, 9, 15, SKIN, { mat: M_SKIN, line: true });
    ball(b, ex + s, ey + 1, 5, 9, [SKIN[3], SKIN[4], SKIN[5], SKIN[6], SKIN[6]], { mat: M_SKIN });
    tint(b, ex, ey - 4, 7, 8, hexU('#E06A5A'), 0.25, M_SKIN);
  }
  // (the double chin, slumped over the roll; the head)
  ball(b, 100, 132, 31, 9, SKIN, { mat: M_SKIN, line: (_dx, dy) => dy > -0.1 });
  ball(b, 100, 70, 52, 60, SKIN, { mat: M_SKIN, line: true, lw: 1.4 });
  crease(b, [78, 131, 92, 135, 108, 135, 122, 131]);
  // (the hair: receding off the temples, greased straight back; the sideburns)
  const hairline = (x: number) => 25 - 13 * Math.sin(Math.PI * Math.min(1, Math.abs(x - 100) / 50));
  ball(b, 100, 31, 55, 30, HAIR, { mat: M_HAIR, line: (_dx, dy) => dy < 0.2, only: (x, y) => y < hairline(x) });
  ball(b, 90, 12, 34, 11, HAIR, { mat: M_HAIR, line: (_dx, dy) => dy < 0, only: (x, y) => y < hairline(x) });
  for (const sx of [53, 147]) ball(b, sx, 58, 4.5, 16, HAIR, { mat: M_HAIR, line: true, lw: 0.8 });
  // (the ink round the masses)
  inkEdges(b, M_SKIN, LINE, [M_HAIR, M_OTHER]);
  inkEdges(b, M_HAIR, HAIR[6], [M_SKIN]);
  inkEdges(b, M_CLOTH, CLOTH[5], [M_OTHER]);
  // (the grease: every strand combed back, a shine across the top; dandruff in it)
  hairs(b, 260, inBox(44, 0, 112, 30, M_HAIR), 7, 0.25, HAIR[0], M_HAIR, 0.5);
  hairs(b, 200, inBox(44, 0, 112, 30, M_HAIR), 6, 0.3, HAIR[5], M_HAIR, 0.5);
  tint(b, 86, 11, 24, 4, WHITE, 0.4, M_HAIR, 0.7);
  tint(b, 120, 15, 14, 3, WHITE, 0.25, M_HAIR, 0.7);
  for (let k = 0; k < 30; k++) { const x = 50 + rnd() * 100, y = rnd() * 26; if (matAt(b, x, y) === M_HAIR) plot(b, x, y, hexU('#F4F0E4')); }

  // (the forehead: furrowed under the raised brow; a zit)
  for (let k = 0; k < 3; k++) {
    const y = 34 - k * 5, pts: number[] = [];
    for (let x = 64 + k * 6; x <= 138 - k * 4; x += 6) pts.push(x, y + Math.sin(x * 0.11 + k) * 1.4 - (x > 100 ? (x - 100) * 0.08 : 0));
    crease(b, pts, k === 0 ? 1 : 0.5);
  }
  crease(b, [96, 50, 98, 44], 1); crease(b, [103, 49, 104, 43], 1);
  ball(b, 84, 26, 3, 3, ZIT, { mat: M_SKIN, line: true, lw: 0.8 }); plot(b, 83, 25, hexU('#FFFBEA')); plot(b, 84, 25, hexU('#F6EBC6'));
  tint(b, 84, 27, 6, 5, hexU('#E0605A'), 0.25, M_SKIN);
  // (the brows: the left down, the right hiked up (the smugness), wiry)
  poly(b, [60, 50, 76, 45, 93, 47, 93, 51, 76, 50, 61, 54], HAIR, M_HAIR);
  poly(b, [107, 44, 122, 36, 141, 41, 141, 45, 122, 41, 108, 48], HAIR, M_HAIR);
  hairs(b, 40, inBox(60, 44, 34, 8, M_HAIR), 4, -0.3, HAIR[6], undefined, 1.2);
  hairs(b, 40, inBox(107, 36, 34, 10, M_HAIR), 4, -0.5, HAIR[6], undefined, 1.2);
  seg(b, 136, 40, 141, 31, HAIR[5]); seg(b, 141, 31, 145, 30, HAIR[5]); seg(b, 64, 49, 59, 43, HAIR[5]);

  // (the eyes: bags under them, half lidded, smug, bloodshot, the right one yellowed)
  for (const [ex, ey] of EYES) {
    tint(b, ex, ey + 10, 14, 6, hexU('#7A4E6E'), 0.35, M_SKIN);
    crease(b, [ex - 11, ey + 10, ex - 3, ey + 14, ex + 7, ey + 13, ex + 12, ey + 9], 0.5);
    crease(b, [ex - 9, ey + 15, ex, ey + 18, ex + 9, ey + 16], 0.3);
  }
  eyeball(b, EYES[0][0], EYES[0][1], { rx: 11, ry: 9, sclera: SCLERA_R, iris: IRIS, ir: 5.5, idx: 3, idy: 1, veins: 12, top: () => EYES[0][1] - 2, bot: () => EYES[0][1] + 6, lid: SKIN });
  eyeball(b, EYES[1][0], EYES[1][1], { rx: 11, ry: 9, sclera: SCLERA_Y, iris: IRIS, ir: 5.5, idx: 3, idy: 1, veins: 10, top: () => EYES[1][1] - 3, bot: () => EYES[1][1] + 6, lid: SKIN });
  for (const [ex, ey] of EYES) { seg(b, ex - 11, ey - 2, ex + 11, ey - 3, SKIN[7]); seg(b, ex - 9, ey - 5, ex + 9, ey - 6, SKIN[5], 1, undefined, M_SKIN); }

  // (the nose: bulbous, red at the end, blackheads, wet; the nostrils, hairs out of them)
  ball(b, 100, 72, 6, 12, SKIN, { mat: M_SKIN, flat: 0.5 });
  ball(b, 100, 85, 16, 13, SKIN, { mat: M_SKIN, line: (_dx, dy) => dy > 0.15 });
  for (const s of [-1, 1]) ball(b, 100 + s * 12, 90, 6, 5, SKIN, { mat: M_SKIN, line: (dx, dy) => dy > 0 || dx * s > 0.3 });
  tint(b, 100, 84, 11, 8, hexU('#D85A52'), 0.28, M_SKIN);
  for (const s of [-1, 1]) {
    ball(b, 100 + s * 6, 94, 4, 2.4, [SKIN[6], hexU('#3A1810'), hexU('#200A06'), hexU('#120402')], { mat: M_OTHER });
    for (let k = 0; k < 4; k++) seg(b, 100 + s * (4 + k * 1.5), 95, 100 + s * (3 + k * 2), 99 + (k % 2) * 2, HAIR[5]);
  }
  plot(b, 94, 79, WHITE); plot(b, 95, 79, WHITE); plot(b, 94, 80, WHITE); plot(b, 89, 87, mixU(WHITE, SKIN[0], 0.4));
  // (the folds off the nose to the mouth: the right one deep, he's smirking)
  crease(b, [87, 92, 80, 100, 76, 108], 0.6);
  crease(b, [113, 91, 126, 90, 135, 96, 137, 102], 1);

  // (the smirk: up on the right, gums and yellow teeth, one gold, a gap; the lips round it)
  const TOPE = [76, 106, 90, 103, 104, 102, 118, 99, 131, 94];
  const BOTE = [76, 106, 84, 111, 96, 113, 112, 112, 126, 104, 131, 94];
  ball(b, 103, 115, 22, 4.5, LIP, { mat: M_LIP, only: (x) => x > 80 && x < 127 });
  for (let x = 77; x <= 130; x++) { const t = Math.round(along(TOPE, x)); for (let y = t - 2; y < t; y++) plot(b, x, y, y === t - 1 ? LIP[3] : LIP[2], M_LIP); }
  poly(b, [...TOPE, 126, 104, 112, 112, 96, 113, 84, 111], R('#4C1220', '#320A14', '#1C040C'), M_MOUTH, { line: false });
  for (let x = 76; x <= 131; x++) { const t = along(TOPE, x); for (let k = 1; k <= 2; k++) plot(b, x, Math.round(t + k), GUM[k], M_MOUTH, M_MOUTH); }
  teeth(b, 78, 131, (x) => Math.round(along(TOPE, x) + 3), 1, 5, { tw: 5, gold: [3], rot: [6, 9], gaps: [8] });
  teeth(b, 86, 122, (x) => Math.round(along(BOTE, x) - 1), -1, 3, { tw: 4, rot: [2, 5] });
  path(b, [...TOPE, 126, 104, 112, 112, 96, 113, 84, 111, 76, 106], DARK, 1);
  for (let k = 0; k < 5; k++) plot(b, 95 + k * 2, 115, mixU(WHITE, LIP[0], 0.3));
  crease(b, [131, 94, 135, 89, 136, 85], 1); crease(b, [76, 106, 73, 108], 0.5);
  // (the goatee, going gray, a soul patch; the stubble round it; spit at the corner)
  ball(b, 102, 125, 14, 8, HAIR, { mat: M_HAIR, soft: 0.35, only: (x, y) => matAt(b, x, y) === M_SKIN });
  ball(b, 103, 119, 4, 2.5, HAIR, { mat: M_HAIR, only: (x, y) => matAt(b, x, y) === M_SKIN });
  hairs(b, 60, inBox(88, 117, 28, 16, M_HAIR), 4, 1.6, HAIR[6], undefined, 0.9);
  hairs(b, 18, inBox(88, 117, 28, 16, M_HAIR), 4, 1.5, hexU('#D8D4CC'), undefined, 0.9);
  stubble(b, (x, y) => (y < 92 || y > 142 ? 0 : Math.min(1, (y - 92) / 10) * (Math.abs(x - 100) < 60 ? 1 : 0)), HAIR[4], 0.5);
  plot(b, 132, 95, WHITE); plot(b, 132, 96, hexU('#D8ECF4'));

  // (the skin's going over: pores, the nose and cheeks thick with them, blackheads, the grease)
  skinPost(b, SKIN[5], (x, y) => {
    const nose = Math.hypot((x - 100) / 18, (y - 84) / 15) < 1 ? 0.3 : 0;
    const cheek = Math.min(Math.hypot((x - 72) / 18, (y - 86) / 14), Math.hypot((x - 128) / 18, (y - 84) / 14)) < 1 ? 0.16 : 0;
    return 0.05 + nose + cheek;
  }, { blackheads: (x, y) => Math.hypot((x - 100) / 18, (y - 84) / 15) < 1 || Math.hypot((x - 102) / 16, (y - 124) / 10) < 1, shine: 0.2 });
  // (the mole on his cheek, its hair)
  ball(b, 133, 104, 3, 3, MOLE, { mat: M_OTHER, line: true, lw: 0.7 }); plot(b, 132, 103, MOLE[0]);
  path(b, [134, 103, 137, 99, 141, 98, 143, 100], HAIR[6]);
  // (ear hair)
  hairs(b, 14, inBox(45, 66, 6, 14, M_SKIN), 5, -2.4, HAIR[1], undefined, 1);
  hairs(b, 14, inBox(150, 63, 6, 14, M_SKIN), 5, -0.7, HAIR[1], undefined, 1);
  // (the sweat: beads all over the forehead and the upper lip)
  for (const [x, y, r] of [[70, 32, 2], [92, 24, 1.6], [116, 27, 2.2], [130, 34, 1.6], [62, 42, 1.5], [110, 40, 1.4], [143, 50, 2], [58, 66, 1.6], [96, 99, 1.3], [112, 98, 1.3], [138, 80, 1.6]] as [number, number, number][]) bead(b, x, y, r, SKIN);

  // (the glasses: thick black frames, smudged lenses, a streak of light)
  for (const [ex, ey] of EYES) {
    for (let y = ey - GLASS_R; y <= ey + GLASS_R; y++) for (let x = ex - GLASS_R; x <= ex + GLASS_R; x++) {
      const d = Math.hypot(x + 0.5 - ex, y + 0.5 - ey);
      if (d > GLASS_R - 1.5) continue;
      shade(b, x, y, hexU('#DCEEF8'), 0.1);
      // (a thumbprint: whorls, broken)
      const fd = Math.hypot(x - ex - 6, (y - ey - 6) * 1.2);
      if (fd < 8 && Math.round(fd) % 2 === 0 && hash2(x, y) > 0.35) shade(b, x, y, WHITE, 0.22);
    }
    for (let k = 0; k < 9; k++) { plot(b, ex - 11 + k, ey - 4 - k, mixU(WHITE, pxAt(b, ex - 11 + k, ey - 4 - k), 0.3)); plot(b, ex - 10 + k, ey - 4 - k, mixU(WHITE, pxAt(b, ex - 10 + k, ey - 4 - k), 0.5)); }
    ring(b, ex, ey, GLASS_R, 5);
  }
  seg(b, 95, 58, 105, 56, FRAME[4], 4, M_OTHER); seg(b, 95, 57, 105, 55, FRAME[1], 1, M_OTHER);
  seg(b, 60, 60, 48, 63, FRAME[4], 3, M_OTHER); seg(b, 140, 57, 152, 59, FRAME[4], 3, M_OTHER); seg(b, 140, 56, 151, 58, FRAME[1], 1, M_OTHER);

  // (dandruff on his shoulders)
  for (let k = 0; k < 40; k++) { const x = 16 + rnd() * 168, y = 140 + rnd() * 22; if (matAt(b, x, y) === M_CLOTH) plot(b, x, y, hexU(k % 3 ? '#E8E4DA' : '#FFFFFF')); }
  return b;
};

let img: HTMLCanvasElement | null | undefined;
const portrait = () => (img === undefined ? (img = typeof document === 'undefined' ? null : toCanvas(paint())) : img);

/** The painting into the portrait's canvas (still: the back wall's stamp). */
export const paintDavePortrait = (g: Ctx) => {
  const cv = portrait(); if (!cv) return;
  const sm = g.imageSmoothingEnabled; g.imageSmoothingEnabled = false;
  g.drawImage(cv, 0, 0, BW, BH, X(PX), CEIL + PY + TOP, BW, BH);
  g.imageSmoothingEnabled = sm;
};

/** Its live bits (at the back wall's depth): a bead of sweat running down his temple, now and then a glint across his
 *  glasses. */
export const drawDavePortraitLive = (c: Ctx, f: number) => {
  const ox = X(PX), oy = CEIL + PY + TOP;
  const t = f % 300;
  if (t < 150) {
    const y = oy + 44 + t * 0.32, x = ox + 145 + Math.sin(t * 0.08) * 1.2;
    c.fillStyle = 'rgba(120,70,50,0.55)'; c.fillRect(Math.round(x), Math.round(y) + 3, 3, 1);
    c.fillStyle = 'rgba(232,246,255,0.75)'; c.fillRect(Math.round(x), Math.round(y), 3, 3); c.fillRect(Math.round(x) + 1, Math.round(y) - 1, 1, 1);
    c.fillStyle = '#FFFFFF'; c.fillRect(Math.round(x), Math.round(y), 1, 1);
    // (its wet trail behind it)
    c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(Math.round(x) + 1, oy + 44, 1, Math.max(0, Math.round(y) - oy - 44));
  }
  const g2 = (f + 140) % 420;
  if (g2 < 24) for (const [ex, ey] of EYES) {
    const k = g2 / 24, sx = ox + ex - GLASS_R + k * GLASS_R * 2;
    c.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = -10; i <= 10; i++) { const x = Math.round(sx + i * 0.5), y = Math.round(oy + ey + i); if (Math.hypot(x - ox - ex, y - oy - ey) < GLASS_R - 2) c.fillRect(x, y, 2, 1); }
  }
};

/** The painting itself (his head and shoulders: 200 x 204, the head's middle about (100, 70)), for prints of him
 *  elsewhere (the cardboard stand-in out front: kiddie/art.ts). Null with no document. */
export const davePainting = () => portrait();
