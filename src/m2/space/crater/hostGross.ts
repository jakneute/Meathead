// XENOSCARE's pre-show host on his screen, grossed up (the user's: "grotesquely ren and stimpy detailed"): the face
// filling the TV, painted per pixel with the shared gross kit (../../grossKit.ts) at two screen pixels a pixel: the
// greasy pored skin in a long stepped ramp, the bloodshot yellowed eyes (one lid drooping, one wide), the purple bags,
// the bulb of a nose (red, its blackheads, the nose hairs), the stubble, the sweat, a vein up the temple, the grin full
// of yellow teeth and gums (a gold one, a gap, a rotten one), the mullet, the silver jumpsuit's shoulder pads.
// The still paint's cached (a stamp per mouth); live over it: the blink, the lid's twitch, a bead of sweat running,
// then the CRT (the scanlines, a roll bar, the glass's glare).

import {
  type Buf, R, WHITE, DARK, HAIRLINE, newBuf, setSeed, rnd, ball, tint, poly, path, seg, plot, hairs, stubble, inkEdges,
  skinPost, eyeball, teeth, bead, vein, stamps, mixU, hexU, hash2, bay,
  SCLERA_Y, SCLERA_R, MOUTH, TONGUE, GUM, VEIN_B, M_SKIN, M_HAIR, M_MOUTH, M_CLOTH, M_LIP, matAt,
} from '../../grossKit';

type Ctx = CanvasRenderingContext2D;

/** The painting's size in its pixels (two screen pixels each: the screen's 150 x 100). */
const W = 75, H = 50, PX = 2;

const SKIN = R('#FFE4C4', '#F6C49C', '#E8A47E', '#D08664', '#B4684C', '#8A4834', '#3A1810');
const HAIR = R('#D49A54', '#AE7436', '#86521F', '#623812', '#40220A', '#1E0E04');
const SILVER = R('#FFFFFF', '#E6E6EE', '#C8C8D2', '#A4A4B0', '#80808C', '#5A5A66', '#1E1E26');
const LIP = R('#E89A90', '#D07A72', '#B45C58', '#8E4240', '#5A2422');
const IRIS = R('#B4E0FF', '#6AA8EC', '#3A72C0', '#1E4888', '#0C2050');
const BAGS = hexU('#7A4A70'), RED = hexU('#E05A5A'), INKU = hexU('#140A08');

type Mouth = 'grin' | 'open' | 'wide';
/** The head's middle and size (in its pixels). */
const HX = 37, HY = 23, HRX = 19, HRY = 20;
/** The eyes (left on screen, right on screen). */
const EL = { x: 29, y: 20 }, ER = { x: 45, y: 19 };

/** The grin's top edge across (the corners up), its bottom by how far open. */
const mTop = (x: number) => { const u = (x - HX) / 13; return 35 - 2.6 * u * u; };
const mBot = (x: number, open: number) => { const u = (x - HX) / 13; return mTop(x) + 2.2 + open * (1 - u * u); };

const paint = (m: Mouth): Buf => {
  const b = newBuf();
  setSeed(4471);
  const open = m === 'grin' ? 0.6 : m === 'open' ? 3.6 : 6.2;
  const inHead = (x: number, y: number) => ((x + 0.5 - HX) / HRX) ** 2 + ((y + 0.5 - HY) / HRY) ** 2 <= 1;

  // (the mullet behind: down past his ears to the shoulders)
  poly(b, [15, 18, 13, 34, 11, 44, 20, 46, 54, 46, 63, 44, 61, 34, 59, 18], HAIR, M_HAIR);
  hairs(b, 70, () => { const x = 12 + rnd() * 51, y = 30 + rnd() * 15; return matAt(b, x, y) === M_HAIR ? [x, y] : null; }, 4, Math.PI / 2, HAIR[4], M_HAIR, 0.5);
  hairs(b, 30, () => { const x = 12 + rnd() * 51, y = 28 + rnd() * 15; return matAt(b, x, y) === M_HAIR ? [x, y] : null; }, 3, Math.PI / 2, HAIR[1], M_HAIR, 0.5);
  // (the jumpsuit: silver, the shoulder pads, a red stripe down the middle, the collar)
  poly(b, [0, 50, 1, 42, 12, 37, 26, 39, 48, 39, 62, 37, 74, 42, 75, 50], SILVER, M_CLOTH, { tilt: -0.3 });
  ball(b, 9, 41, 10, 4, SILVER, { mat: M_CLOTH, line: true, lw: 1 });
  ball(b, 65, 41, 10, 4, SILVER, { mat: M_CLOTH, line: true, lw: 1 });
  for (let y = 42; y < H; y++) { plot(b, 36, y, hexU('#B91C1C'), M_CLOTH); plot(b, 37, y, hexU('#DC2626'), M_CLOTH); plot(b, 38, y, hexU('#7F1D1D'), M_CLOTH); }
  // (the neck, sweaty, the Adam's apple)
  ball(b, HX, 40, 9, 5, SKIN, { mat: M_SKIN, line: (_x, dy) => dy > 0.3 });
  ball(b, HX + 1, 41, 2, 2, SKIN, { mat: M_SKIN, lit: 1.2 });
  // (the ears: big, red, a hair or two out of them)
  for (const [ex, s] of [[18.5, -1], [55.5, 1]] as const) {
    ball(b, ex, 24, 3.4, 5.5, SKIN, { mat: M_SKIN, line: true, lw: 1 });
    seg(b, ex + s * 0.5, 21, ex + s * 0.8, 27, SKIN[5], 1);
    tint(b, ex, 24, 3, 5, RED, 0.25, M_SKIN);
    seg(b, ex - s * 0.5, 23, ex - s * 2.5, 21, HAIRLINE, 1);
  }
  // (the head: a big greasy ball)
  ball(b, HX, HY, HRX, HRY, SKIN, { mat: M_SKIN, line: true, lw: 1.2 });
  // (the jowls hanging off it)
  ball(b, 23, 34, 6, 6, SKIN, { mat: M_SKIN, line: (dx, dy) => dy > 0.2 || dx < -0.5, only: (_x, y) => y > 30 });
  ball(b, 51, 34, 6, 6, SKIN, { mat: M_SKIN, line: (dx, dy) => dy > 0.2 || dx > 0.5, only: (_x, y) => y > 30 });
  // (the mullet's top: feathered, the hairline back, the sideburns)
  ball(b, HX, 7, 21, 8.5, HAIR, { mat: M_HAIR, line: (_dx, dy) => dy < 0, only: (x, y) => y < 6.5 + Math.abs(x - HX) * 0.22 || Math.abs(x - HX) > 16 });
  poly(b, [17, 9, 21, 9, 21, 27, 18, 25], HAIR, M_HAIR, { line: false });
  poly(b, [53, 9, 57, 9, 56, 25, 53, 27], HAIR, M_HAIR, { line: false });
  hairs(b, 80, () => { const x = 16 + rnd() * 42, y = rnd() * 12; return matAt(b, x, y) === M_HAIR ? [x, y] : null; }, 4, -0.3 + Math.PI * (rnd() < 0.5 ? 0 : 1), HAIR[0], M_HAIR, 0.8);
  hairs(b, 40, () => { const x = 16 + rnd() * 42, y = rnd() * 12; return matAt(b, x, y) === M_HAIR ? [x, y] : null; }, 3, Math.PI * 0.6, HAIR[4], M_HAIR, 0.8);
  inkEdges(b, M_HAIR, HAIR[5]);

  // (the brow: furrowed, the wrinkles across the forehead)
  for (const [y, a] of [[11, 0.5], [13.5, 0.7], [16, 0.9]] as const) {
    const pts: number[] = []; for (let x = 24; x <= 50; x += 2) pts.push(x, y + Math.sin(x * 0.7 + y) * 0.6);
    path(b, pts, mixU(SKIN[4], SKIN[5], a), 1, undefined, M_SKIN);
    path(b, pts.map((v, i) => (i % 2 ? v + 1 : v)), SKIN[1], 1, undefined, M_SKIN);
  }
  // (the vein up his temple, bulging)
  vein(b, [21, 18, 22, 15, 21, 12, 23, 9], VEIN_B, 1);
  // (the brows: bushy, one up)
  hairs(b, 40, () => [23 + rnd() * 11, 14 + rnd() * 2.2 - (rnd() * 0)], 2.5, -0.2, HAIR[3], M_SKIN, 0.6);
  hairs(b, 40, () => [40 + rnd() * 11, 11 + rnd() * 2.2], 2.5, 0.25, HAIR[3], M_SKIN, 0.6);
  // (the bags: purple, sagging, lined)
  for (const e of [EL, ER]) {
    tint(b, e.x, e.y + 5, 7, 3.2, BAGS, 0.35, M_SKIN);
    path(b, [e.x - 6, e.y + 5, e.x - 2, e.y + 7, e.x + 3, e.y + 7, e.x + 6, e.y + 5], SKIN[5], 1, undefined, M_SKIN);
    path(b, [e.x - 5, e.y + 7.5, e.x, e.y + 9, e.x + 5, e.y + 7.5], SKIN[4], 1, undefined, M_SKIN);
  }
  // (the eyes: yellowed, bloodshot; the left's lid drooping, the right's wide, the pupils off different ways)
  eyeball(b, EL.x, EL.y, { rx: 6, ry: 4.6, sclera: SCLERA_Y, iris: IRIS, ir: 2.8, idx: -1.4, idy: 0.6, pr: 1.3, veins: 7, top: () => EL.y - 1.4, lid: SKIN });
  eyeball(b, ER.x, ER.y, { rx: 6.4, ry: 5.4, sclera: SCLERA_R, iris: IRIS, ir: 2.6, idx: 1.2, idy: -0.4, pr: 1.1, veins: 9, lid: SKIN });
  // (the droopy lid's crease, the lashes)
  path(b, [EL.x - 6, EL.y - 1, EL.x - 2, EL.y - 2, EL.x + 3, EL.y - 2, EL.x + 6, EL.y - 1], SKIN[6], 1);
  path(b, [ER.x - 6, ER.y - 5, ER.x, ER.y - 6.5, ER.x + 6, ER.y - 5], SKIN[5], 1, undefined, M_SKIN);
  // (the cheeks: ruddy, broken capillaries)
  for (const cx of [24, 51]) {
    tint(b, cx, 29, 5, 3.5, RED, 0.28, M_SKIN);
    for (let k = 0; k < 3; k++) { const a = rnd() * Math.PI * 2; seg(b, cx + Math.cos(a) * 2, 29 + Math.sin(a), cx + Math.cos(a) * 4, 29 + Math.sin(a) * 2, hexU('#C03A3A'), 1, undefined, M_SKIN); }
  }
  // (the nose: a great red bulb, shining, the nostrils, the hairs out of them)
  ball(b, HX + 0.5, 22, 2.6, 6, SKIN, { mat: M_SKIN, line: (dx) => dx > 0.5 });
  ball(b, HX, 29, 6.2, 4.6, SKIN, { mat: M_SKIN, line: (_dx, dy) => dy > -0.1, lw: 1 });
  ball(b, HX - 5.2, 30.5, 2.4, 2.2, SKIN, { mat: M_SKIN, line: (dx, dy) => dx < 0 || dy > 0 });
  ball(b, HX + 5.2, 30.5, 2.4, 2.2, SKIN, { mat: M_SKIN, line: (dx, dy) => dx > 0 || dy > 0 });
  tint(b, HX, 28.5, 5.5, 4, RED, 0.3, M_SKIN);
  for (const nx of [HX - 2.6, HX + 2.6]) { ball(b, nx, 32, 1.5, 0.9, [DARK, DARK, INKU], {}); }
  for (const [x0, y0, x1, y1] of [[HX - 3, 32.5, HX - 4, 34.5], [HX - 2, 32.6, HX - 2, 34.8], [HX + 2, 32.6, HX + 3, 34.6], [HX + 3, 32.5, HX + 4.5, 34]]) seg(b, x0, y0, x1, y1, HAIRLINE, 1);
  // (the lines off the nose to the grin)
  path(b, [HX - 8, 30, HX - 11, 33, HX - 13, 36], SKIN[5], 1, undefined, M_SKIN);
  path(b, [HX + 8, 30, HX + 11, 33, HX + 13, 36], SKIN[5], 1, undefined, M_SKIN);

  // (the grin: the mouth, the gums, yellow teeth (a gap, a gold one, a rotten one); open, the tongue)
  for (let x = HX - 13; x <= HX + 13; x++) {
    const t = mTop(x), bt = mBot(x, open);
    for (let y = Math.floor(t); y <= Math.ceil(bt); y++) {
      if (y + 0.5 < t || y - 0.5 > bt) continue;
      const k = Math.min(MOUTH.length - 1, 1 + Math.round(((y - t) / Math.max(1, bt - t)) * 3 + (bay(x, y) - 0.5)));
      plot(b, x, y, MOUTH[k], M_MOUTH);
    }
  }
  if (open > 2) ball(b, HX + 1, mBot(HX, open) - 1.2, 6.5, 2.4, TONGUE, { only: (x, y) => matAt(b, x, y) === M_MOUTH });
  for (let x = HX - 12; x <= HX + 12; x++) { const t = Math.round(mTop(x)); if (matAt(b, x, t) === M_MOUTH) plot(b, x, t, GUM[bay(x, t) > 0.5 ? 2 : 3]); }
  teeth(b, HX - 12, HX + 13, (x) => mTop(x) + 1, 1, open > 2 ? 2.4 : 1.6, { tw: 3, gaps: [5], gold: [3], rot: [6, 1] });
  teeth(b, HX - 9, HX + 10, (x) => mBot(x, open), -1, 1.4, { tw: 3, rot: [2, 4] });
  // (the lips: thin up top, a wet fat one under)
  for (let x = HX - 13; x <= HX + 13; x++) plot(b, x, Math.round(mTop(x)) - 1, LIP[4], M_LIP);
  for (let x = HX - 12; x <= HX + 12; x++) { const y = Math.round(mBot(x, open)) + 1; plot(b, x, y, LIP[bay(x, y) > 0.5 ? 1 : 2], M_LIP); plot(b, x, y + 1, LIP[3], M_LIP); }
  for (const x of [HX - 4, HX - 3, HX + 2]) plot(b, x, Math.round(mBot(x, open)) + 1, WHITE);
  // (the corners, deep, dimpled)
  for (const s of [-1, 1]) { plot(b, HX + s * 14, mTop(HX + s * 13) - 0.5, SKIN[6]); plot(b, HX + s * 15, mTop(HX + s * 13) - 1.5, SKIN[5]); }
  // (the chin's cleft)
  path(b, [HX, 41, HX, 43], SKIN[5], 1, undefined, M_SKIN);

  // (the stubble round the jaw and the lip, the pores and blackheads, the grease shining)
  stubble(b, (x, y) => (inHead(x, y) && y > 33 ? Math.min(1, (y - 33) / 5) : y > 31 && Math.abs(x - HX) < 13 && y < 34 ? 0.6 : 0), HAIR[5], 0.4);
  skinPost(b, SKIN[5], (x, y) => {
    const nose = ((x - HX) / 7) ** 2 + ((y - 27) / 7) ** 2 < 1 ? 0.24 : 0;
    const cheek = Math.min(((x - 24) / 6) ** 2 + ((y - 29) / 5) ** 2, ((x - 51) / 6) ** 2 + ((y - 29) / 5) ** 2) < 1 ? 0.16 : 0;
    return 0.06 + nose + cheek;
  }, { blackheads: (x, y) => Math.abs(x - HX) < 8 && y > 22 && y < 33, shine: 0.2 });
  // (the sweat: beads across the forehead, on the lip; a big one on the nose)
  for (const [x, y, r] of [[26, 9, 1.1], [33, 8, 1.3], [41, 9.5, 1], [47, 8, 1.2], [30, 12.5, 0.9], [52, 13, 1], [44, 31.5, 0.8], [HX + 2, 26, 1.2]] as const) bead(b, x, y, r, SKIN);
  // (a pimple on his chin, ripe)
  ball(b, HX + 7, 41, 1.4, 1.4, R('#FFF6C0', '#F4C870', '#E07060', '#B04040', '#6A2020'), { line: (_dx, dy) => dy > 0 });
  plot(b, HX + 6.6, 40.4, WHITE);
  // (a hair growing off the mole on his cheek)
  ball(b, 52, 24, 1.2, 1.2, R('#8A5A3A', '#6A3E24', '#4A2814', '#2A1408'));
  seg(b, 52, 23, 55, 19, HAIRLINE, 1);
  return b;
};

const face = stamps<Mouth>(paint);

/** The host's TV, live: (x, y) the screen's top left, `talking` while his words are up. */
export const drawHostScreen = (c: Ctx, x: number, y: number, f: number, talking: boolean) => {
  // (the mouth: flapping while he talks (grin, open, wide, open...), the grin otherwise)
  const m: Mouth = talking ? (['grin', 'open', 'wide', 'open', 'grin', 'wide'] as const)[Math.floor(f / 5) % 6] : 'grin';
  const s = face(m);
  // (a little jitter in the tape)
  const jx = hash2(Math.floor(f / 7), 11) > 0.9 ? PX : 0;
  c.save();
  c.beginPath(); c.rect(x, y, W * PX, H * PX); c.clip();
  if (s.img) { c.imageSmoothingEnabled = false; c.drawImage(s.img, 0, 0, W, H, x + jx, y, W * PX, H * PX); }
  const at = (px: number, py: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x + jx + px * PX, y + py * PX, w * PX, h * PX); };
  // (the blink: both lids down for a moment; the droopy one's twitch)
  const bt = f % 170;
  if (bt < 5) {
    for (const e of [EL, ER]) { at(e.x - 6, e.y - 5, 13, 10, '#E8A47E'); at(e.x - 6, e.y - 1, 13, 2, '#D08664'); at(e.x - 6, e.y + 1, 13, 1, '#3A1810'); }
  } else if (f % 53 < 4 && Math.floor(f / 53) % 3 === 1) {
    at(EL.x - 6, EL.y - 3, 13, 3, '#E8A47E'); at(EL.x - 6, EL.y, 13, 1, '#3A1810');
  }
  // (a drop of sweat running down his temple, its trail wet)
  const u = (f % 140) / 140, sy = 10 + u * 22, sx2 = 23 + Math.sin(u * 6) * 0.6;
  if (u < 0.85) {
    at(Math.round(sx2), 10, 1, Math.max(0, Math.round(sy) - 10), 'rgba(255, 240, 220, 0.35)');
    at(Math.round(sx2) - 0.5, Math.round(sy), 2, 2, '#F6C49C'); at(Math.round(sx2) - 0.5, Math.round(sy) + 1, 2, 1, '#8A4834'); at(Math.round(sx2) - 0.5, Math.round(sy), 1, 1, '#FFFFFF');
  }
  // (the CRT: the scanlines, the roll bar coming down, the glass's glare, the edge darkened)
  c.fillStyle = 'rgba(0, 0, 0, 0.2)';
  for (let yy = y; yy < y + H * PX; yy += 3) c.fillRect(x, yy, W * PX, 1);
  c.fillStyle = 'rgba(186, 230, 253, 0.10)'; c.fillRect(x, y + ((f * 0.6) % (H * PX + 20)) - 20, W * PX, 10);
  c.fillStyle = 'rgba(56, 189, 248, 0.06)'; c.fillRect(x, y, W * PX, H * PX);
  c.fillStyle = 'rgba(0, 0, 0, 0.22)'; c.fillRect(x, y, 3, H * PX); c.fillRect(x + W * PX - 3, y, 3, H * PX); c.fillRect(x, y + H * PX - 3, W * PX, 3);
  c.fillStyle = 'rgba(255, 255, 255, 0.22)'; c.fillRect(x + 4, y + 2, 40, 3); c.fillRect(x + 4, y + 6, 18, 2);
  c.restore();
};
