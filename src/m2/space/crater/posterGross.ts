// XENOSCARE's queue posters, grossed up (the user's: "make the posters ren and stimpy detailed"): four B-movie one-sheets
// painted per pixel with the shared gross kit (../../grossKit.ts) at one screen pixel a pixel (the art window's 120 x 90):
//   0 THEY WANT YOUR PLANET   a warty green head over the Earth, drooling on it, its claw round it, the park on top
//                             and its people running
//   1 ...NO ONE HEARS YOU WHINE  the derelict's thing in close-up (the long glossy dome, the silver teeth, the inner jaw
//                             out, slime strung between) at an astronaut bawling in his helmet (the tears, the snot bubble)
//   2 THEY PROBE!             a gray with wet black eyes holding a chrome probe (a glint off it, lube on its tip) at a
//                             sweating man screaming, his eyes popping
//   3 THE QUEEN (LEGALLY DISTINCT)  her, crested, done up: lipstick (on her teeth), lashes, a tiara, pearls; eggs
// Painted once each (a stamp per poster, painted ahead with the other gross-ups); ship.ts frames them and letters them.

import {
  type Buf, R, WHITE, newBuf, setSeed, rnd, ball, tint, poly, path, seg, plot, shade, hairs, stubble, inkEdges, skinPost,
  eyeball, teeth, bead, vein, stamps, hexU, mixU, bay, hash2, matAt, walk, GW,
  SCLERA_Y, SCLERA_R, MOUTH, TONGUE, GUM, VEIN_B, GOLD, M_SKIN, M_MOUTH, M_LIP, M_METAL, M_GLASS, M_OTHER, M_CLOTH,
} from '../../grossKit';

type Ctx = CanvasRenderingContext2D;

/** The art window, in its pixels (one screen pixel each). */
export const ART_W = 120, ART_H = 90;

// (this painting's own materials, past the kit's)
const M_PLANET = 11, M_XENO = 12, M_HAND = 13, M_HUMAN = 14, M_EYE = 15;

const SLIME = R('#F4FFD8', '#D6F5A0', '#A8DC6A', '#78B040', '#4A7A22', '#1E3A0A');
const DROOL = R('#FFFFFF', '#E8F4F0', '#BCD8D0', '#86A8A0', '#4A6A64');
const LINE = hexU('#140A08');

/** The sky behind: bands top to bottom, dithered at each seam; stars (a few) in the dark ones. */
const sky = (b: Buf, cols: string[], stars = 0) => {
  const U = cols.map(hexU), n = U.length;
  for (let y = 0; y < ART_H; y++) for (let x = 0; x < ART_W; x++) {
    const k = Math.max(0, Math.min(n - 1, Math.round((y / ART_H) * (n - 1) + (bay(x, y) - 0.5) * 0.9)));
    b.px[y * GW + x] = U[k];
    if (stars && y < ART_H * 0.6 && hash2(x * 7 + 3, y * 13 + 1) < stars) b.px[y * GW + x] = hash2(x, y) > 0.5 ? WHITE : hexU('#C8D0FF');
  }
};
/** A tapering tube (a finger, a neck, a dome's run): balls along it, no ink (inked after by its material). */
const limb = (b: Buf, x0: number, y0: number, x1: number, y1: number, r0: number, r1: number, ramp: number[], mat: number) => {
  const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 1.2));
  for (let k = 0; k <= n; k++) { const t = k / n; const r = r0 + (r1 - r0) * t; ball(b, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r, r, ramp, { mat }); }
};
/** A string of drool or slime: from (x0, y0) to (x1, y1), sagging; wet (a lit side, a dark side, glints); a bead on
 *  its end if it hangs free. */
const strand = (b: Buf, x0: number, y0: number, x1: number, y1: number, sag: number, ramp: number[], hang = true) => {
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 1.5);
  for (let k = 0; k <= n; k++) {
    const t = k / n, x = x0 + (x1 - x0) * t + Math.sin(t * Math.PI) * sag, y = y0 + (y1 - y0) * t;
    plot(b, x, y, ramp[1]); plot(b, x + 1, y, ramp[3]);
    if (k % 5 === 2) plot(b, x, y, WHITE);
  }
  if (hang) { ball(b, x1 + 0.5, y1 + 1.2, 1.6, 2, ramp, { line: (_dx, dy) => dy > 0.2, lw: 0.8 }); plot(b, x1, y1 + 0.5, WHITE); }
};
/** A mouth's hole between its two edges (top(x), bot(x)), deepening into it. */
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
/** Gums showing over a row of teeth (the lips curled back): `d` rows of them up (dir -1) or down (+1) off the edge. */
const gums = (b: Buf, x0: number, x1: number, edge: (x: number) => number, dir: 1 | -1, d: number, ramp = GUM) => {
  for (let x = Math.floor(x0); x <= x1; x++) for (let k = 0; k < d; k++) plot(b, x, Math.round(edge(x)) + dir * k, ramp[Math.min(ramp.length - 1, 1 + k + (bay(x, k) > 0.6 ? 1 : 0))], M_LIP);
};
/** Slime strung across an open mouth, top to bottom (its middle sagging, a bead on it). */
const strings = (b: Buf, xs: number[], top: (x: number) => number, bot: (x: number) => number, ramp = SLIME) => {
  for (const x of xs) {
    const t = Math.round(top(x)) + 1, bt = Math.round(bot(x)) - 1;
    for (let y = t; y <= bt; y++) { const sx = x + Math.round(Math.sin(((y - t) / Math.max(1, bt - t)) * Math.PI) * 1.2); plot(b, sx, y, ramp[y % 3 ? 1 : 2]); }
    const my = Math.round((t + bt) / 2); plot(b, x + 1, my, ramp[0]); plot(b, x + 2, my, ramp[2]); plot(b, x + 1, my + 1, ramp[3]);
  }
};
/** A little one, running, its arms up, screaming (a few pixels: the B-movie's crowd). */
const tiny = (b: Buf, x: number, y: number, shirt: string, s: number) => {
  const sk = hexU(s > 0.5 ? '#F4C49C' : '#8A5A3A'), sh = hexU(shirt), pants = hexU('#1E3A8A');
  plot(b, x, y, sk); plot(b, x + 1, y, sk); plot(b, x, y + 1, sk); plot(b, x + 1, y + 1, LINE);
  plot(b, x - 1, y, sk); plot(b, x + 2, y - 1, sk);
  plot(b, x, y + 2, sh); plot(b, x + 1, y + 2, sh); plot(b, x, y + 3, sh); plot(b, x + 1, y + 3, sh);
  plot(b, x - 1, y + 4, pants); plot(b, x + 2, y + 4, pants);
};
/** A claw (yellowed, cracked) off a fingertip at (x, y), pointing along (dx, dy). */
const claw = (b: Buf, x: number, y: number, dx: number, dy: number, len: number) => {
  const CL = R('#FFF4C0', '#E8CF7A', '#C4A048', '#8A6A24', '#3A2808');
  const l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, px = -uy, py = ux;
  poly(b, [x + px * 1.6, y + py * 1.6, x + ux * len, y + uy * len, x - px * 1.6, y - py * 1.6], CL, M_OTHER, { tilt: 0 });
  plot(b, x + ux * len * 0.5 + px * 0.5, y + uy * len * 0.5 + py * 0.5, hexU('#5A4012'));
  plot(b, x + ux * 1 - px * 0.6, y + uy * 1 - py * 0.6, WHITE);
};

// ---------------------------------------------------------------------------------------------------------------
// 0: THEY WANT YOUR PLANET

const ALIEN_G = R('#E8FFB0', '#BCEB6A', '#8CCB3C', '#62A02A', '#3E7418', '#24480C', '#0E2004');
const VEIN_G = R('#F4C0F0', '#D07ACA', '#A852A4', '#80347E', '#5A1A5E', '#2A0630');
const OCEAN = R('#9AD8FF', '#5AAEF0', '#2A7AD0', '#1A54A0', '#0E3470', '#061A40', '#020A1E');
const LAND = R('#C8F09A', '#86C850', '#4E9A2C', '#2E6A1A', '#18420C', '#0A2206');
const IRIS_R = R('#FFE07A', '#F0A030', '#C86010', '#8A3008', '#3A1004');
const LIP_G = R('#C88AA0', '#A06080', '#7A4060', '#502840', '#2A1020');

const planet = (b: Buf) => {
  setSeed(9101);
  sky(b, ['#1A0202', '#3A0606', '#5E0C0C', '#861414', '#AE2A16', '#D25A1A', '#EE8A2A'], 0.004);
  const PX = 34, PY = 66, PR = 24;
  // (the sunburst behind it)
  for (let k = 0; k < 16; k += 2) {
    const a = (k / 16) * Math.PI * 2 + 0.2;
    for (let r = PR + 2; r < 140; r += 0.7) for (let w = -r * 0.09; w <= r * 0.09; w += 0.8) {
      const x = PX + Math.cos(a) * r - Math.sin(a) * w, y = PY + Math.sin(a) * r + Math.cos(a) * w;
      if (matAt(b, x, y) === 0 && bay(Math.round(x), Math.round(y)) < 0.5) shade(b, x, y, hexU('#FBBF24'), 0.16, 0);
    }
  }
  // (the Earth: the oceans shaded round, the continents on them (by the same light), clouds, the ice)
  ball(b, PX, PY, PR, PR, OCEAN, { mat: M_PLANET, line: true, lw: 1 });
  for (let y = PY - PR; y <= PY + PR; y++) for (let x = PX - PR; x <= PX + PR; x++) {
    const i = y * GW + x;
    if (x < 0 || y < 0 || matAt(b, x, y) !== M_PLANET || b.tone[i] === 255) continue;
    const n = Math.sin(x * 0.29 + y * 0.11) + Math.sin(y * 0.37 - x * 0.07 + 1.3) * 0.8 + Math.sin((x + y) * 0.53) * 0.4;
    if (n > 0.55) b.px[i] = LAND[Math.min(LAND.length - 2, Math.round((b.tone[i] / 254) * (LAND.length - 2)))];
    if (y < PY - PR + 4 && b.tone[i] < 200) b.px[i] = mixU(b.px[i], WHITE, 0.7);
  }
  for (const [cx, cy, l] of [[24, 60, 9], [40, 76, 11], [30, 82, 6]] as const) for (let k = 0; k < l; k++) shade(b, cx + k, cy + Math.sin(k * 0.8) * 1.2, WHITE, 0.55, M_PLANET);
  // (the park on top of it: the castle, pink, its blue spires)
  const CAS = hexU('#F9A8D4'), CASD = hexU('#BE5A94'), SPIRE = hexU('#3B82F6');
  for (const [tx, h] of [[28, 4], [31, 7], [34, 9], [37, 7], [40, 4]] as const) {
    for (let y = 0; y < h; y++) { plot(b, tx, PY - PR - y, CAS); plot(b, tx + 1, PY - PR - y, CASD); }
    plot(b, tx, PY - PR - h, SPIRE); plot(b, tx + 1, PY - PR - h, SPIRE); plot(b, tx, PY - PR - h - 1, SPIRE);
  }
  // (its people, running round the top of the world, arms up, screaming; one gone off the edge)
  ([[-2.5, '#DC2626'], [-2.1, '#FACC15'], [-1.95, '#22C55E'], [-1.05, '#F97316'], [-0.8, '#A855F7']] as const).forEach(([a, sh], k) => tiny(b, PX + Math.cos(a) * (PR + 3) - 1, PY + Math.sin(a) * (PR + 3) - 4, sh, hash2(k, 4)));
  tiny(b, 6, 34, '#F472B6', 0.9);

  // (the head: a great warty green ball, veined, coming in over it)
  const HX = 84, HY = 30;
  ball(b, HX, HY, 34, 29, ALIEN_G, { mat: M_SKIN, line: true, lw: 1.2 });
  for (const [x0, y0, a] of [[60, 18, -0.6], [74, 8, -0.2], [92, 6, 0.1], [104, 14, 0.5]] as const) {
    const pts: number[] = []; let x = x0, y = y0, ang = a - Math.PI / 2;
    for (let k = 0; k < 6; k++) { pts.push(x, y); x += Math.cos(ang) * 3.5; y += Math.sin(ang) * 3.5; ang += (rnd() - 0.5) * 1.2; }
    vein(b, pts, VEIN_G, 1);
  }
  // (the brow: furrowed, deep)
  for (const [y, w] of [[15, 0.6], [17.5, 0.9]] as const) {
    const pts: number[] = []; for (let x = 64; x <= 104; x += 2) pts.push(x, y + Math.sin(x * 0.5) * 0.8 + Math.abs(x - HX) * 0.06 * w);
    path(b, pts, ALIEN_G[5], 1, undefined, M_SKIN); path(b, pts.map((v, i) => (i % 2 ? v + 1 : v)), ALIEN_G[1], 1, undefined, M_SKIN);
  }
  // (the eyes: bulging, bloodshot, yellow; the left lid drooping, the right wide and mad; both down at the planet)
  tint(b, 71, 34, 9, 4, hexU('#6A3A70'), 0.4, M_SKIN); tint(b, 97, 34, 10, 4, hexU('#6A3A70'), 0.4, M_SKIN);
  eyeball(b, 71, 27, { rx: 8, ry: 7, sclera: SCLERA_Y, iris: IRIS_R, ir: 3.6, idx: -3, idy: 2.6, pr: 1.2, veins: 11, top: (x) => 24 + (x - 71) * 0.15, lid: ALIEN_G });
  eyeball(b, 97, 25, { rx: 9.5, ry: 8.5, sclera: SCLERA_R, iris: IRIS_R, ir: 3.2, idx: -4, idy: 3.4, pr: 0.9, veins: 14 });
  path(b, [63, 24, 68, 22.5, 74, 22.5, 79, 24], ALIEN_G[6], 1);
  // (the nostrils: slits, wet)
  for (const nx of [82, 88]) { seg(b, nx, 38, nx + 1, 41, LINE, 1, undefined, M_SKIN); plot(b, nx - 1, 38, ALIEN_G[0], undefined, M_SKIN); }
  // (the maw: wide, the lips cracked and curled back, the gums, the jagged yellow teeth, the tongue, drool everywhere)
  const top = (x: number) => { const u = (x - HX) / 22; return 47 - 3 * u * u; };
  const bot = (x: number) => { const u = (x - HX) / 22; return top(x) + 1.5 + 9 * (1 - u * u); };
  maw(b, HX - 22, HX + 22, top, bot);
  ball(b, HX + 2, bot(HX) - 2.5, 11, 3.5, TONGUE, { only: (x, y) => matAt(b, x, y) === M_MOUTH });
  gums(b, HX - 21, HX + 21, (x) => top(x) - 1, -1, 2);
  teeth(b, HX - 21, HX + 22, (x) => top(x), 1, 4, { tw: 3, long: [1, 4, 8, 11, 13], rot: [3, 9], gaps: [6] });
  teeth(b, HX - 18, HX + 19, (x) => bot(x), -1, 3, { tw: 3, rot: [2, 7], long: [4, 9] });
  strings(b, [HX - 10, HX + 5, HX + 14], top, bot);
  for (let x = HX - 23; x <= HX + 23; x++) { plot(b, x, top(x) - 3, LIP_G[2], M_LIP); plot(b, x, top(x) - 4, LIP_G[x % 5 ? 3 : 4], M_LIP); }
  for (let x = HX - 20; x <= HX + 20; x++) { const y = Math.round(bot(x)) + 1; plot(b, x, y, LIP_G[bay(x, y) > 0.5 ? 0 : 1], M_LIP); plot(b, x, y + 1, LIP_G[3], M_LIP); if (x % 6 === 0) plot(b, x, y + 1, LIP_G[4]); if (x % 7 === 3) plot(b, x, y, WHITE); }
  // (the skin: pores, pustules, the grease, the sweat)
  skinPost(b, ALIEN_G[5], (x, y) => 0.1 + (y > 30 ? 0.12 : 0), { blackheads: (_x, y) => y > 30 && y < 44, shine: 0.22 });
  for (const [x, y] of [[60, 34], [108, 30], [66, 42], [102, 40]] as const) { ball(b, x, y, 1.6, 1.6, R('#FFF6C0', '#F4D070', '#C8A040', '#8A6A20', '#3A2A08'), { line: (_dx, dy) => dy > 0 }); plot(b, x - 0.5, y - 0.6, WHITE); }
  for (const [x, y, r] of [[70, 10, 1.2], [86, 5, 1.4], [100, 9, 1.1], [64, 18, 1], [110, 20, 1.2]] as const) bead(b, x, y, r, ALIEN_G);

  // (the claw, up from under, round the Earth: the forearm, three knobbed fingers, the yellow claws in it)
  poly(b, [120, 90, 92, 90, 78, 80, 86, 70, 120, 66], ALIEN_G, M_HAND, { line: false, tilt: -0.4 });
  for (const f of [[86, 72, 68, 60, 58, 58], [84, 78, 64, 72, 56, 74], [86, 86, 66, 84, 58, 88]] as const) {
    limb(b, f[0], f[1], f[2], f[3], 5, 4, ALIEN_G, M_HAND); limb(b, f[2], f[3], f[4], f[5], 4, 3, ALIEN_G, M_HAND);
    ball(b, f[2], f[3], 4.6, 4.6, ALIEN_G, { mat: M_HAND });
  }
  inkEdges(b, M_HAND, ALIEN_G[6]);
  for (const f of [[68, 60, 58, 58], [64, 72, 56, 74], [66, 84, 58, 88]] as const) {
    for (let k = -1; k <= 1; k++) plot(b, f[0] + k * 0.4, f[1] + k * 1.6, ALIEN_G[5], undefined, M_HAND);
    claw(b, f[2] - 1, f[3], f[2] - f[0], f[3] - f[1], 6);
  }
  skinPost(b, ALIEN_G[5], () => 0.12, { onMat: M_HAND, shine: 0.2 });
  for (const [x, y] of [[96, 78], [104, 72], [110, 84]] as const) { ball(b, x, y, 1.5, 1.5, ALIEN_G, { line: true, lw: 0.6 }); seg(b, x, y - 1, x + 2, y - 4, LINE, 1); }
  // (the drool: off the lip onto the world, and hanging)
  strand(b, HX - 14, bot(HX - 14) + 2, 54, 64, -2, DROOL, false);
  strand(b, HX - 2, bot(HX - 2) + 2, 80, 80, 2, DROOL);
  strand(b, HX + 13, bot(HX + 13) + 2, 98, 70, 1, DROOL);
  return b;
};

// ---------------------------------------------------------------------------------------------------------------
// 1: IN SPACE NO ONE HEARS YOU WHINE

const XENO = R('#C8D4E8', '#7A8AA8', '#4A5878', '#2C3650', '#1A2034', '#0C1020', '#000000');
const SILV = R('#F4F8FF', '#CCD6E6', '#9AA8BE', '#6A7890', '#3A4458', '#141A26');
const GUM_X = R('#C080A0', '#9A5A80', '#743A60', '#4A2240', '#260C20', '#100008');
const HELM = R('#FFFFFF', '#E4E8EE', '#C0C8D2', '#98A2B0', '#6E7888', '#2A303A');
const VISOR = R('#3A4A6A', '#24304A', '#161E32', '#0C1220', '#04060C');
const PALE = R('#FFE8D6', '#F8C8AE', '#E6A488', '#C8826A', '#A0604E', '#6A3A30', '#2E140E');
const TEAR = R('#F0FAFF', '#BFE6FF', '#7CC4F0', '#3A8AC8', '#1A4A80');
const SNOT = R('#F0FFD0', '#D4F08A', '#B0D85A', '#88B436', '#5A821E', '#2A440A');
const IRIS_B = R('#C8E8FF', '#7AB4F0', '#3A7AC8', '#1A4A8A', '#0A2048');

const whine = (b: Buf) => {
  setSeed(5502);
  sky(b, ['#010208', '#040818', '#081028', '#0C1A3A', '#10264A', '#14304E'], 0.012);
  // (the mist off the derelict's floor: green, low)
  for (let y = 70; y < ART_H; y++) for (let x = 0; x < ART_W; x++) if (bay(x, y) < (y - 70) / 30) shade(b, x, y, hexU('#2A6A3A'), 0.35, 0);
  // (the dome: long, glossy, back up into the dark; its ribs across, the light running along it)
  limb(b, 2, 4, 40, 30, 12, 15, XENO, M_XENO);
  ball(b, 48, 40, 14, 11, XENO, { mat: M_XENO });
  ball(b, 54, 50, 10, 7, XENO, { mat: M_XENO });
  const ax = 0.83, ay = 0.56, pxp = -ay, pyp = ax;
  for (let t = 4; t < 52; t += 4) {
    const cx = 2 + ax * t, cy = 4 + ay * t, r = 12 + t * 0.06;
    for (let s = -r * 0.9; s < r * 0.3; s += 0.6) { plot(b, cx + pxp * s, cy + pyp * s, XENO[5], undefined, M_XENO); plot(b, cx + pxp * s + 1, cy + pyp * s, XENO[2], undefined, M_XENO); }
  }
  for (let t = 0; t < 56; t += 0.7) if (Math.floor(t / 6) % 3 !== 2) { const r = 10 + t * 0.07; plot(b, 2 + ax * t - pxp * r * 0.62, 4 + ay * t - pyp * r * 0.62, t % 3 < 1.4 ? WHITE : XENO[0], undefined, M_XENO); }
  inkEdges(b, M_XENO, XENO[6]);
  // (the jaws: the lips peeled back off the gums, the silver teeth, slime strung between, the inner jaw coming out)
  const top = (x: number) => 47 + (x - 42) * 0.32, bot = (x: number) => top(x) + 2 + 7 * Math.sin(Math.max(0, Math.min(1, (x - 42) / 26)) * Math.PI);
  maw(b, 42, 68, top, bot);
  gums(b, 42, 68, (x) => top(x) - 1, -1, 3, GUM_X);
  gums(b, 43, 67, (x) => bot(x) + 1, 1, 2, GUM_X);
  teeth(b, 42, 69, top, 1, 3, { tw: 2, ramp: SILV, long: [2, 5, 9, 12] });
  teeth(b, 43, 68, bot, -1, 3, { tw: 2, ramp: SILV, long: [3, 8] });
  strings(b, [47, 55, 63], top, bot);
  limb(b, 52, 54, 70, 60, 2.6, 3.2, XENO, M_METAL);
  inkEdges(b, M_METAL, XENO[6]);
  for (let k = 0; k < 4; k++) { plot(b, 73, 57 + k * 1.3, SILV[k % 2]); plot(b, 74, 57.5 + k * 1.3, SILV[2]); }
  plot(b, 60, 55.5, WHITE); plot(b, 66, 57.5, WHITE);
  strand(b, 72, 63, 74, 76, 1, SLIME);
  strand(b, 50, bot(50) + 3, 46, 84, -1.5, SLIME);
  strand(b, 60, bot(60) + 3, 62, 78, 1, SLIME);

  // (the astronaut: his helmet, the visor, his face in it, bawling)
  const AX = 92, AY = 66;
  ball(b, AX, AY, 25, 25, HELM, { mat: M_CLOTH, line: true, lw: 1.2 });
  for (const [dx, dy] of [[-18, 14], [18, 14], [0, 22]] as const) ball(b, AX + dx, AY + dy, 2, 2, R('#E5E7EB', '#9CA3AF', '#4B5563', '#1F2937'), { line: true, lw: 0.6 });
  ball(b, AX, AY, 19, 19, VISOR, { mat: M_GLASS, line: true, lw: 1 });
  const inGlass = (x: number, y: number) => (x - AX) ** 2 + (y - AY) ** 2 < 17.5 ** 2;
  ball(b, AX, AY + 3, 13, 15, PALE, { mat: M_HUMAN, line: true, lw: 1, only: inGlass });
  // (the brows: up in the middle, the forehead crumpled)
  hairs(b, 30, () => [83 + rnd() * 6, 59.5 - (rnd() * 6) * 0.45 - rnd() * 1.2], 2, -0.5, hexU('#5A3A1A'), M_HUMAN, 0.5);
  hairs(b, 30, () => { const x = 95 + rnd() * 6; return [x, 56.8 + (x - 95) * 0.45 + rnd() * 1.2]; }, 2, 0.5 + Math.PI, hexU('#5A3A1A'), M_HUMAN, 0.5);
  for (const y of [54, 56]) path(b, [88, y + 1, 92, y, 96, y + 1], PALE[4], 1, undefined, M_HUMAN);
  // (the eyes: wet, red, up at it; the lower lids brimming)
  eyeball(b, 87, 64, { rx: 3.6, ry: 3, sclera: SCLERA_R, iris: IRIS_B, ir: 1.8, idx: -1.2, idy: -1, pr: 0.7, veins: 6 });
  eyeball(b, 98, 64, { rx: 3.6, ry: 3, sclera: SCLERA_R, iris: IRIS_B, ir: 1.8, idx: -1.6, idy: -1, pr: 0.7, veins: 6 });
  for (const ex of [87, 98]) { for (let k = -3; k <= 3; k++) plot(b, ex + k, 67, TEAR[k % 2 ? 1 : 2]); tint(b, ex, 68.5, 4.5, 1.6, hexU('#C04050'), 0.35, M_HUMAN); }
  // (the nose: red, running; the snot bubble off it)
  ball(b, 92.5, 70, 2.6, 2.4, PALE, { mat: M_HUMAN, line: (dx, dy) => dy > 0.2 || dx > 0.6, lw: 0.8 });
  tint(b, 92.5, 70, 3, 2.5, hexU('#E05050'), 0.4, M_HUMAN);
  plot(b, 91, 72, LINE); plot(b, 94, 72, LINE);
  for (let y = 72; y < 76; y++) { plot(b, 94, y, SNOT[2]); plot(b, 95, y, SNOT[4]); }
  // (the mouth: wailing, the corners down, the lip quivering)
  const mt = (x: number) => { const u = (x - 92) / 6.5; return 76 + 1.8 * u * u; };
  const mb = (x: number) => { const u = (x - 92) / 6.5; return mt(x) + 1 + 4.5 * Math.max(0, 1 - u * u); };
  maw(b, 85, 99, mt, mb);
  ball(b, 92, mb(92) - 1, 4, 1.6, TONGUE, { only: (x, y) => matAt(b, x, y) === M_MOUTH });
  teeth(b, 87, 98, mt, 1, 1.4, { tw: 2 });
  for (let x = 85; x <= 99; x++) { const y = Math.round(mb(x) + 1 + Math.sin(x * 1.9) * 0.6); plot(b, x, y, hexU('#D07A72'), M_LIP); plot(b, x, y + 1, hexU('#8E4240'), M_LIP); if (x % 4 === 1) plot(b, x, y, WHITE); }
  for (let x = 85; x <= 99; x++) plot(b, x, Math.round(mt(x)) - 1, hexU('#B45C58'), M_LIP);
  // (the chin crumpled; the stubble; the pores; the tears down both cheeks; the sweat)
  for (const [x, y] of [[90, 84], [92, 85], [94, 84], [91, 86], [93, 86]] as const) plot(b, x, y, PALE[4], undefined, M_HUMAN);
  stubble(b, (x, y) => (y > 74 && Math.abs(x - AX) < 12 ? Math.min(1, (y - 74) / 5) : 0), hexU('#4A3020'), 0.4, M_HUMAN);
  skinPost(b, PALE[5], () => 0.08, { onMat: M_HUMAN, shine: 0.22 });
  for (const [x0, s] of [[86, -1], [99, 1]] as const) {
    let x = x0, y = 68;
    while (y < 85) { if (inGlass(x, y)) { plot(b, x, y, TEAR[1]); plot(b, x + s, y, TEAR[3]); if (y % 4 === 0) plot(b, x, y, WHITE); } y++; x += s * (y % 3 === 0 ? 1 : 0); }
    ball(b, x, y, 1.4, 1.8, TEAR, { line: (_dx, dy) => dy > 0.2, lw: 0.7 });
  }
  for (const [x, y, r] of [[84, 58, 0.9], [100, 57, 1], [88, 53, 0.8], [97, 52, 0.9]] as const) bead(b, x, y, r, PALE);
  ball(b, 90, 72.5, 3.4, 3.2, SNOT, { soft: 0.2, line: (dx, dy) => dx < -0.3 || dy > 0.5, lw: 0.7 });
  plot(b, 89, 71, WHITE); plot(b, 89.6, 71, WHITE); plot(b, 91.5, 74, SNOT[0]);
  // (the visor's glare over it all)
  for (let k = 0; k < 9; k++) { shade(b, AX - 12 + k * 0.5, AY - 12 + k * 0.9 - k * k * 0.06, WHITE, 0.55); shade(b, AX - 11 + k * 0.5, AY - 12 + k * 0.9 - k * k * 0.06, WHITE, 0.3); }
  return b;
};

// ---------------------------------------------------------------------------------------------------------------
// 2: THEY PROBE!

const GRAY = R('#E4E8DC', '#BCC4B0', '#949E88', '#6E7864', '#4C5444', '#2E3428', '#10140C');
const BLACKEYE = R('#7A8CA0', '#3A4656', '#1A202A', '#0A0C10', '#000000');
const CHROME = R('#FFFFFF', '#E4E6EE', '#B8BCC8', '#868A98', '#55586A', '#1E1E26');
const RUDDY = R('#FFE0C8', '#F4BC98', '#E09A74', '#C27856', '#9A5840', '#643426', '#2A120A');
const IRIS_G = R('#D0F0B0', '#8AC85A', '#4E8A2C', '#2A5A14', '#0E2A04');

const probe = (b: Buf) => {
  setSeed(7727);
  sky(b, ['#12021E', '#1E0533', '#2E1065', '#3E1680', '#4C1D95', '#5B21B6'], 0.008);
  // (the beam down out of the saucer, behind them)
  for (let y = 0; y < ART_H; y++) for (let x = 0; x < ART_W; x++) { const w = 10 + y * 0.35; if (Math.abs(x - 64) < w && bay(x, y) < 0.5) shade(b, x, y, hexU('#C4B5FD'), 0.18, 0); }

  // (the gray: the big head, the jaw tapering, the neck, the robe's shoulders)
  poly(b, [62, 90, 70, 80, 106, 80, 118, 90], R('#6D28D9', '#5B21B6', '#4C1D95', '#2E1065', '#12021E'), M_CLOTH, { tilt: 0.2 });
  for (let x = 74; x <= 102; x++) { plot(b, x, 80, CHROME[1]); plot(b, x, 81, CHROME[3]); }
  limb(b, 88, 62, 88, 80, 4, 5, GRAY, M_SKIN);
  ball(b, 88, 28, 25, 24, GRAY, { mat: M_SKIN });
  limb(b, 88, 40, 88, 60, 17, 6, GRAY, M_SKIN);
  inkEdges(b, M_SKIN, GRAY[6]);
  // (its forehead: wrinkled, veined)
  for (const y of [10, 13, 16]) { const pts: number[] = []; for (let x = 72; x <= 104; x += 2) pts.push(x, y + Math.sin(x * 0.45 + y) * 0.9 + ((x - 88) / 16) ** 2 * 2); path(b, pts, GRAY[5], 1, undefined, M_SKIN); path(b, pts.map((v, i) => (i % 2 ? v + 1 : v)), GRAY[0], 1, undefined, M_SKIN); }
  vein(b, [70, 20, 68, 14, 70, 8, 74, 4], VEIN_B, 1); vein(b, [104, 22, 107, 16, 105, 10], VEIN_B, 1);
  // (the eyes: huge, black, wet, slanting up; the red threads round them in the gray, the man in their shine)
  for (const s of [-1, 1]) {
    for (const [dx, dy, rx, ry] of [[15, -3, 5, 3.5], [11, -1, 6.5, 4.6], [6, 1, 5, 3.6]] as const) ball(b, 88 + s * dx, 34 + dy, rx, ry, BLACKEYE, { mat: M_EYE });
  }
  inkEdges(b, M_EYE, BLACKEYE[4]);
  for (const s of [-1, 1]) {
    for (let k = 0; k < 6; k++) { const a = rnd() * Math.PI * 2; walk(88 + s * 11 + Math.cos(a) * 9, 34 + Math.sin(a) * 6, a, 3 + rnd() * 4, 1.2, (x, y) => { if (matAt(b, x, y) !== M_SKIN) return false; plot(b, x, y, hexU('#B0303C')); }); }
    path(b, [88 + s * 3, 40, 88 + s * 10, 42, 88 + s * 17, 38], GRAY[5], 1, undefined, M_SKIN);
    for (const [x, y] of [[88 + s * 11 - 3, 31], [88 + s * 11 - 2, 31], [88 + s * 11 - 3, 32], [88 + s * 15 - 1, 30]] as const) plot(b, x, y, WHITE);
    plot(b, 88 + s * 10 + 1, 36, hexU('#F4BC98')); plot(b, 88 + s * 10 + 2, 36, hexU('#C27856'));
  }
  // (the nose slits, the mouth: a lipless slit grinning, little teeth, drool off the corner)
  for (const nx of [86, 90]) seg(b, nx, 45, nx, 47, LINE, 1, undefined, M_SKIN);
  const mt = (x: number) => 53 - (x - 80) * 0.12 - ((x - 87) / 8) ** 2 * 0.6, mb = (x: number) => mt(x) + 1 + 1.4 * Math.max(0, 1 - ((x - 88) / 7) ** 2);
  maw(b, 80, 96, mt, mb);
  teeth(b, 82, 95, mt, 1, 1, { tw: 2 });
  skinPost(b, GRAY[5], (_x, y) => 0.1 + (y > 40 ? 0.08 : 0), { shine: 0.24, blackheads: (_x, y) => y > 42 && y < 50 });
  for (const [x, y] of [[74, 26], [102, 44], [96, 12]] as const) { ball(b, x, y, 1.3, 1.3, GRAY, { line: true, lw: 0.6 }); seg(b, x, y, x + 1, y - 3, LINE, 1); }
  strand(b, 95, mb(95) + 1, 98, 72, 1, DROOL);

  // (the probe: chrome, ribbed, the light on its butt, the tip bulbed and greased; glints off it)
  const py = (x: number) => 60 + (x - 50) * 0.18;
  for (let x = 52; x <= 100; x++) {
    const y = Math.round(py(x)), rib = x % 6 === 0;
    plot(b, x, y - 2, CHROME[5], M_METAL); plot(b, x, y - 1, rib ? CHROME[2] : CHROME[0], M_METAL); plot(b, x, y, rib ? CHROME[3] : CHROME[2], M_METAL); plot(b, x, y + 1, CHROME[4], M_METAL); plot(b, x, y + 2, CHROME[5], M_METAL);
  }
  ball(b, 50, py(50), 3.6, 3.4, CHROME, { mat: M_METAL, line: true, lw: 0.8 });
  ball(b, 100, py(100), 2.2, 2.2, R('#FECACA', '#F87171', '#DC2626', '#7F1D1D', '#2A0606'), { line: true, lw: 0.6 });
  strand(b, 50, py(50) + 3, 51, py(50) + 9, 0.5, DROOL);
  for (const [gx, gy, l] of [[48, py(48) - 2, 3], [70, py(70) - 1, 2]] as const) { for (let k = -l; k <= l; k++) { plot(b, gx + k, gy, WHITE); plot(b, gx, gy + k, WHITE); } plot(b, gx - 1, gy - 1, WHITE); plot(b, gx + 1, gy + 1, WHITE); }
  // (its hand round it: long fingers, knobbed at the joints, the wrist off to its body)
  limb(b, 100, 62, 112, 70, 3.4, 4.4, GRAY, M_HAND);
  for (const [x0, y0, x1, y1, x2, y2] of [[98, 60, 88, 60, 84, 64], [98, 63, 90, 64, 87, 68], [99, 66, 92, 69, 90, 72]] as const) {
    limb(b, x0, y0, x1, y1, 2.4, 2, GRAY, M_HAND); ball(b, x1, y1, 2.8, 2.8, GRAY, { mat: M_HAND }); limb(b, x1, y1, x2, y2, 2, 1.6, GRAY, M_HAND);
  }
  inkEdges(b, M_HAND, GRAY[6]);
  for (const [x, y] of [[88, 60], [90, 64], [92, 69]] as const) { plot(b, x, y - 1, GRAY[5], undefined, M_HAND); plot(b, x + 1, y - 1, GRAY[5], undefined, M_HAND); }
  skinPost(b, GRAY[5], () => 0.12, { onMat: M_HAND, shine: 0.2 });

  // (the man: sweating, balding, his eyes popping out at it, screaming)
  const HX = 27, HY = 64;
  ball(b, 49, 66, 3.4, 5.6, RUDDY, { mat: M_HUMAN, line: true, lw: 0.8 });
  ball(b, HX, HY, 22, 25, RUDDY, { mat: M_HUMAN, line: true, lw: 1.2 });
  hairs(b, 70, () => { const x = 8 + rnd() * 38; return [x, 44 + Math.abs(x - HX) * 0.12 + rnd() * 2]; }, 6, 0.1, hexU('#3A2410'), M_HUMAN, 0.3);
  for (const y of [47, 50, 53]) path(b, [12, y + 1, 20, y - 1, 30, y - 1, 40, y + 1], RUDDY[4], 1, undefined, M_HUMAN);
  hairs(b, 30, () => [12 + rnd() * 10, 52 - rnd() * 2], 2.5, -0.4, hexU('#3A2410'), M_HUMAN, 0.5);
  hairs(b, 30, () => [32 + rnd() * 10, 51 - rnd() * 2], 2.5, 0.4, hexU('#3A2410'), M_HUMAN, 0.5);
  vein(b, [8, 58, 7, 54, 9, 50], VEIN_B, 1);
  for (const ex of [18, 36]) { tint(b, ex, 66, 8, 3, hexU('#7A4A70'), 0.4, M_HUMAN); path(b, [ex - 6, 66, ex, 68, ex + 6, 66], RUDDY[5], 1, undefined, M_HUMAN); }
  eyeball(b, 18, 59, { rx: 7, ry: 6.6, sclera: SCLERA_R, iris: IRIS_G, ir: 2.4, idx: 3.2, idy: 0, pr: 0.7, veins: 14 });
  eyeball(b, 36, 59, { rx: 7.4, ry: 7, sclera: SCLERA_Y, iris: IRIS_G, ir: 2.4, idx: 3.6, idy: 0.4, pr: 0.7, veins: 14 });
  ball(b, 27, 70, 3.2, 4.6, RUDDY, { mat: M_HUMAN, line: (dx, dy) => dy > 0.3 || dx > 0.6, lw: 0.8 });
  tint(b, 27, 71, 3.4, 3, hexU('#E05A5A'), 0.3, M_HUMAN);
  plot(b, 25, 74, LINE); plot(b, 29, 74, LINE);
  const ot = (x: number) => 78 - 2.2 * Math.sqrt(Math.max(0, 1 - ((x - 27) / 7.5) ** 2)), ob = (x: number) => 78 + 8 * Math.sqrt(Math.max(0, 1 - ((x - 27) / 7.5) ** 2));
  maw(b, 19, 35, ot, ob);
  ball(b, 27, 84, 5, 2.4, TONGUE, { only: (x, y) => matAt(b, x, y) === M_MOUTH });
  ball(b, 27, 79, 1, 1.4, TONGUE, { only: (x, y) => matAt(b, x, y) === M_MOUTH });
  gums(b, 20, 34, (x) => ot(x), 1, 1);
  teeth(b, 20, 35, (x) => ot(x) + 1, 1, 2, { tw: 3, gold: [2], rot: [4] });
  teeth(b, 21, 34, ob, -1, 1.4, { tw: 3 });
  for (let x = 19; x <= 35; x++) { plot(b, x, Math.round(ot(x)) - 1, hexU('#B45C58'), M_LIP); const y = Math.round(ob(x)) + 1; plot(b, x, y, hexU('#D07A72'), M_LIP); plot(b, x, y + 1, hexU('#8E4240'), M_LIP); }
  strings(b, [23, 31], ot, ob, DROOL);
  stubble(b, (x, y) => (y > 74 && Math.abs(x - HX) < 18 ? Math.min(1, (y - 74) / 4) : 0), hexU('#3A2410'), 0.45, M_HUMAN);
  skinPost(b, RUDDY[5], (x, y) => 0.08 + (((x - 27) / 6) ** 2 + ((y - 70) / 6) ** 2 < 1 ? 0.2 : 0), { onMat: M_HUMAN, shine: 0.22, blackheads: (x, y) => Math.abs(x - 27) < 5 && y > 66 && y < 75 });
  for (const [x, y, r] of [[14, 46, 1.2], [22, 44, 1.4], [32, 45, 1.2], [40, 48, 1.1], [10, 54, 1], [44, 56, 1.2], [26, 52, 0.9], [12, 72, 1], [42, 72, 1.1], [34, 76, 0.8]] as const) bead(b, x, y, r, RUDDY);
  return b;
};

// ---------------------------------------------------------------------------------------------------------------
// 3: THE QUEEN (LEGALLY DISTINCT)

const LIPR = R('#FF8AA0', '#F0506C', '#C82848', '#901830', '#500818');
const EGG = R('#C8B888', '#9A8A5A', '#706238', '#4A3E20', '#2A220E', '#100A02');
const PEARL = R('#FFFFFF', '#F4F0FF', '#D8D0E8', '#A8A0BC', '#4A4458');

const queen = (b: Buf) => {
  setSeed(3313);
  sky(b, ['#020404', '#05080A', '#0A1410', '#10241A', '#163222', '#1C3E28'], 0.004);
  // (her eggs, down in the mist)
  for (const [x, y] of [[100, 82], [113, 86], [88, 89]] as const) {
    ball(b, x, y, 7, 9, EGG, { mat: M_OTHER, line: true, lw: 1 });
    path(b, [x - 4, y - 6, x, y - 8, x + 4, y - 6], EGG[4], 1); seg(b, x, y - 8, x, y - 4, EGG[4], 1);
    for (let k = 0; k < 6; k++) plot(b, x - 3 + k, y - 1 + Math.sin(k) * 2, EGG[3]);
  }
  // (the neck back down into the dark, ribbed; the pearls on it)
  limb(b, 68, 58, 92, 92, 9, 11, XENO, M_XENO);
  // (the crest: a great glossy fan, ridged)
  poly(b, [30, 46, 12, 18, 36, 4, 76, 0, 108, 4, 118, 26, 98, 44, 64, 52], XENO, M_XENO, { tilt: 0.3, line: false });
  for (const [ex, ey] of [[14, 18], [30, 8], [50, 2], [72, 1], [92, 3], [108, 8], [116, 20]] as const) {
    for (let t = 0.15; t < 0.95; t += 0.02) { const x = 60 + (ex - 60) * t, y = 48 + (ey - 48) * t; plot(b, x, y, XENO[5], undefined, M_XENO); plot(b, x + 1, y + 1, XENO[1], undefined, M_XENO); }
  }
  for (let t = 0; t < 1; t += 0.01) { const x = 14 + t * 96, y = 18 - Math.sin(t * Math.PI) * 15; if (Math.floor(t * 30) % 4 !== 3) plot(b, x, y + 3, t % 0.05 < 0.025 ? WHITE : XENO[0], undefined, M_XENO); }
  // (the head and the long snout under it)
  ball(b, 54, 54, 24, 12, XENO, { mat: M_XENO });
  ball(b, 34, 62, 13, 9, XENO, { mat: M_XENO });
  inkEdges(b, M_XENO, XENO[6]);
  for (let x = 20; x < 70; x += 0.5) plot(b, x, 49 + ((x - 46) / 24) ** 2 * 6, x % 3 < 1 ? WHITE : XENO[0], undefined, M_XENO);
  // (the tiara, gold, pink stones)
  poly(b, [36, 44, 40, 36, 44, 42, 50, 32, 56, 40, 62, 30, 68, 38, 74, 34, 76, 42, 70, 46, 40, 48], GOLD, M_METAL, { tilt: 0.2 });
  for (const [x, y] of [[50, 36], [62, 34], [40, 40]] as const) { ball(b, x, y, 1.6, 1.6, R('#FFE4F0', '#F472B6', '#DB2777', '#831843', '#3A0A20'), { line: true, lw: 0.6 }); plot(b, x - 0.5, y - 0.6, WHITE); }
  // (her lashes on the brow ridge, the eye shadow, the blush)
  tint(b, 40, 53, 7, 3, hexU('#7C3AED'), 0.45, M_XENO);
  for (let k = 0; k < 6; k++) { const x = 34 + k * 2.2; seg(b, x, 54, x - 2, 49 - (k % 2), XENO[6], 1); plot(b, x - 3, 48 - (k % 2), XENO[6]); }
  tint(b, 44, 62, 6, 3, hexU('#F472B6'), 0.35, M_XENO);
  // (the mouth: the lipstick on thick, the lips peeled back off the gums, the silver teeth (lipstick on them), the
  // slime, the inner jaw out (painted too))
  const top = (x: number) => 64 + (44 - x) * 0.1, bot = (x: number) => top(x) + 2 + 7 * Math.sin(Math.max(0, Math.min(1, (x - 18) / 26)) * Math.PI);
  maw(b, 18, 44, top, bot);
  gums(b, 18, 44, (x) => top(x) - 1, -1, 2, GUM_X);
  gums(b, 19, 43, (x) => bot(x) + 1, 1, 1, GUM_X);
  teeth(b, 18, 45, top, 1, 3, { tw: 2, ramp: SILV, long: [1, 4, 8, 11] });
  teeth(b, 19, 44, bot, -1, 3, { tw: 2, ramp: SILV, long: [2, 7] });
  for (const x of [22, 23, 30, 36]) plot(b, x, Math.round(top(x)) + 1, LIPR[1]);
  strings(b, [24, 32, 39], top, bot);
  for (let x = 17; x <= 45; x++) { const y = Math.round(top(x)) - 3; plot(b, x, y, LIPR[1], M_LIP); plot(b, x, y - 1, LIPR[3], M_LIP); if (x % 5 === 0) plot(b, x, y, WHITE); }
  for (let x = 18; x <= 44; x++) { const y = Math.round(bot(x)) + 2; plot(b, x, y, LIPR[bay(x, y) > 0.5 ? 0 : 1], M_LIP); plot(b, x, y + 1, LIPR[2], M_LIP); plot(b, x, y + 2, LIPR[4], M_LIP); if (x % 4 === 1) plot(b, x, y, WHITE); }
  for (const [x, y] of [[46, 60], [47, 61], [16, 72], [48, 59]] as const) plot(b, x, y, LIPR[2]);
  limb(b, 30, 68, 12, 70, 3, 2.6, XENO, M_GLASS);
  inkEdges(b, M_GLASS, XENO[6]);
  for (let k = 0; k < 3; k++) { plot(b, 9, 68 + k * 1.4, SILV[k % 2]); plot(b, 10, 68.5 + k * 1.4, SILV[2]); }
  for (let x = 12; x < 18; x++) plot(b, x, 67.5, LIPR[1]);
  plot(b, 18, 68, WHITE); plot(b, 24, 68.5, WHITE);
  strand(b, 10, 72, 8, 86, -1, SLIME);
  strand(b, 26, bot(26) + 4, 24, 88, 1.5, SLIME);
  strand(b, 38, bot(38) + 4, 42, 82, -1, SLIME);
  // (the pearls round her neck)
  for (let k = 0; k < 9; k++) { const t = k / 8; const x = 66 + t * 26, y = 66 + t * 14 + Math.sin(t * Math.PI) * 5; ball(b, x, y, 1.8, 1.8, PEARL, { line: true, lw: 0.6 }); plot(b, x - 0.6, y - 0.7, WHITE); }
  return b;
};

const PAINT = [planet, whine, probe, queen];
const art = stamps<'0' | '1' | '2' | '3'>((k) => PAINT[+k](newBuf()), ['0', '1', '2', '3']);

/** Poster `i`'s art (0..3) into its window at (x, y): ART_W x ART_H, one pixel each. */
export const drawPosterArt = (g: Ctx, i: number, x: number, y: number) => {
  const s = art(String(i) as '0' | '1' | '2' | '3');
  if (!s.img) return;
  g.imageSmoothingEnabled = false;
  g.drawImage(s.img, 0, 0, ART_W, ART_H, x, y, ART_W, ART_H);
};
