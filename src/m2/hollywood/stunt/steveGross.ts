// STUNTMAN STEVE'S GROSS-UP (the user's rule for every close-up: "gross ren and stimpy style close ups"; grossKit.ts):
// his fight's first look at him, at his end of the stage, seething at the applause. Forty years of sun and baby oil: a
// leathery tan shining with grease, every pore, liver spots and sunspots, deep crow's feet, gray stubble; the nose
// broken and set crooked (blackheads in the bump, hairs out of it); the cheap gold aviators (a gradient lens, his eyes
// slitted behind it, the stage lights in it, a smear of thumbprint); brows down over the frames, a vein up his temple;
// the feathered mullet going gray, silver at the sides, a cigarette tucked behind his ear; the horseshoe mustache, the
// lips peeled back off clenched teeth stained with chew (a gold one, a gap), a toothpick in the corner, a brown dribble
// of tobacco spit; the rhinestone neck brace, sweat-yellowed, the 70s collar, the chest hair and the rope chain.
// Live: the jaw muscle pulsing, a bead of sweat running, a glint sliding across the lenses, the toothpick twitching.

import {
  type Ctx, type Buf, R, hexU, mixU, WHITE, newBuf, setSeed, rnd, matAt, plot, shade, seg, path, ball, tint, poly, bead, eyeball, teeth, skinPost, stubble, hairs, vein, stamps, drawGrossStamp, grossBackdrop, hash2, bay, GW, M_SKIN, M_HAIR, M_MOUTH, M_OTHER, M_CLOTH, M_METAL, M_GLASS, SCLERA_Y, MOUTH, GUM, GOLD, TOOTH_B,
} from '../../grossKit';

const FX = 136, FY = 100;

const TAN = R('#FFD8B0', '#F6BE8E', '#E6A070', '#D08454', '#B4683E', '#94502C', '#6C381C', '#3E1C0A');
const HAIR = R('#E0B888', '#C99A62', '#9A6A36', '#774D24', '#563416', '#2A1808');
const GRAY = R('#FFFFFF', '#F0EEEA', '#D2CCC4', '#ACA49A', '#847C72', '#4E4842');
const STACHE = R('#B48A60', '#8C6440', '#6B4524', '#523318', '#38220E', '#1A0F05');
const SUIT = R('#FFF8C0', '#FEF3A0', '#F5C518', '#D9A30F', '#A87A08', '#4E3504');
const STRIPE = R('#F87171', '#DC2626', '#B91C1C', '#7F1D1D', '#3B0A0A');
const BRACE = R('#FFFFFF', '#F4F0E0', '#E0D8BC', '#C4B894', '#9A8C66', '#5A5038');
const LIP = R('#E0A088', '#C8806A', '#AC6252', '#8C4640', '#683030', '#3A1818');
const IRIS = R('#C0D8B0', '#90B880', '#5E8A50', '#3E6434', '#22401C', '#0C200A');
const TVEIN = R('#FFC8A4', '#E8A07C', '#C87E62', '#A0604C', '#784434', '#44241A');
const CIG = R('#FFFFFF', '#F4F2EC', '#DCD8CC', '#B8B2A2', '#7A7468');

type Key = 'a' | 'b';

const build = (key: Key): Buf => {
  setSeed(1979);
  const b = newBuf();
  // ---- the jumpsuit's collar (pointed, 70s), the zip open on the chest hair and the chain; the brace above it
  for (const s of [-1, 1]) poly(b, [FX + s * 10, 204, FX + s * 136, 204, FX + s * 136, 176, FX + s * 70, 170, FX + s * 40, 204], SUIT, M_CLOTH);
  for (const s of [-1, 1]) { poly(b, [FX + s * 40, 178, FX + s * 104, 172, FX + s * 74, 204, FX + s * 50, 204], SUIT, M_CLOTH); seg(b, FX + s * 112, 176, FX + s * 112, 204, STRIPE[1], 3, M_CLOTH); seg(b, FX + s * 108, 176, FX + s * 108, 204, WHITE, 1, M_CLOTH); }
  poly(b, [FX - 22, 190, FX + 22, 190, FX + 10, 204, FX - 10, 204], TAN, M_SKIN, { line: false });
  hairs(b, 60, () => [FX - 18 + rnd() * 36, 190 + rnd() * 14], 5, -Math.PI / 2, rnd() < 0.5 ? GRAY[2] : GRAY[4]);
  for (let x = FX - 20; x <= FX + 20; x++) { const y = 196 + ((x - FX) / 20) ** 2 * -4; plot(b, x, y, GOLD[(x & 1) ? 1 : 3]); plot(b, x, y + 1, GOLD[4]); }
  // ---- the neck brace: foam, sweat-yellowed, rhinestones glued round it (one gone, the glue), its strap
  ball(b, FX, 182, 96, 20, BRACE, { mat: M_OTHER, line: true, lw: 1.4 });
  tint(b, FX - 40, 186, 30, 8, hexU('#C8B060'), 0.4, M_OTHER, 0.6); tint(b, FX + 50, 190, 20, 6, hexU('#C8B060'), 0.35, M_OTHER, 0.6);
  for (let k = 0; k < 13; k++) {
    const x = FX - 84 + k * 14, y = 182 + Math.round(((x - FX) / 96) ** 2 * -6) + (k % 2) * 3;
    if (k === 8) { plot(b, x, y, hexU('#F0E8C0')); plot(b, x + 1, y, hexU('#D8C890')); continue; }
    ball(b, x, y, 2.6, 2.4, k % 3 === 0 ? R('#FFFFFF', '#FFC8E8', '#F070B8', '#A02870', '#500834') : R('#FFFFFF', '#E0F4FF', '#A0D0F0', '#5090C0', '#204060'), { line: true, lw: 0.6 });
    plot(b, x - 1, y - 1, WHITE);
    b.glints.push(x - 1, y - 1);
  }
  // ---- the mullet's back and sides: feathered, flipped out past his ears, silver at the temples
  for (const s of [-1, 1]) {
    ball(b, FX + s * 88, 108, 32, 70, HAIR, { mat: M_HAIR, line: true });
    for (let k = 0; k < 30; k++) { const x = FX + s * (66 + rnd() * 44), y = 46 + rnd() * 120; path(b, [x, y, x + s * (3 + rnd() * 4), y + 8 + rnd() * 8, x + s * (6 + rnd() * 6), y + 16 + rnd() * 8], k % 3 ? HAIR[k % 2 ? 3 : 1] : GRAY[2], 1, undefined, M_HAIR); }
    // (the flip at the ends)
    for (let k = 0; k < 8; k++) path(b, [FX + s * (84 + k * 4), 168, FX + s * (90 + k * 4), 176, FX + s * (98 + k * 4), 172], k % 2 ? HAIR[2] : GRAY[2], 1);
  }
  // ---- the ears; a cigarette tucked behind the near one
  for (const s of [-1, 1]) {
    const ex = FX + s * 76, ey = 106;
    ball(b, ex, ey, 13, 21, TAN, { mat: M_SKIN, line: true });
    ball(b, ex - s * 1, ey + 2, 7, 12, TAN.slice(3), { mat: M_SKIN, soft: 0.3 });
    ball(b, ex - s * 3, ey + 4, 2.4, 3.2, R('#3A1808', '#24100A', '#140806', '#080302', '#000000'), { mat: M_OTHER });
    hairs(b, 6, () => [ex - s * 3, ey + 3], 6, s > 0 ? -0.2 : Math.PI + 0.2, GRAY[3]);
  }
  for (let k = 0; k < 34; k++) { const x = FX + 64 + k, y = 84 - k * 0.3; for (let d = 0; d < 5; d++) plot(b, x, y + d, k > 26 ? hexU(d < 2 ? '#E8A060' : '#C47838') : CIG[d === 0 ? 0 : d < 3 ? 1 : d < 4 ? 2 : 4], M_OTHER); }
  // ---- the face: square-jawed, gone soft under it, the jowls
  ball(b, FX, FY + 8, 72, 82, TAN, { mat: M_SKIN, line: (_dx, dy) => dy > -0.2, lw: 1.5 });
  poly(b, [FX - 62, 130, FX + 62, 130, FX + 54, 168, FX + 20, 180, FX - 20, 180, FX - 54, 168], TAN, M_SKIN, { line: false, tilt: 0.3 });
  ball(b, FX, 172, 36, 12, TAN, { mat: M_SKIN, line: (_dx, dy) => dy > 0.3 });
  for (const s of [-1, 1]) tint(b, FX + s * 46, 132, 16, 20, TAN[5], 0.3, M_SKIN, 0.7);
  // (the jaw muscle, bunched; the cleft in his chin)
  for (const s of [-1, 1]) path(b, [FX + s * 60, 130, FX + s * 62, 146, FX + s * 58, 160], TAN[6], 1, undefined, M_SKIN);
  seg(b, FX, 170, FX, 178, TAN[6], 1, undefined, M_SKIN);
  // ---- the hair on top: feathered back off his face, streaked gray, the roots showing at the part
  const hairline = (x: number) => 40 + Math.abs(x - FX) * 0.42 - Math.exp(-(((x - FX) / 10) ** 2)) * 4;
  ball(b, FX, 26, 100, 50, HAIR, { mat: M_HAIR, line: (_dx, dy) => dy < 0, only: (x, y) => y < hairline(x) + Math.sin(x * 0.7) * 1.5 });
  // (parted in the middle and swept back in wings: long curved strokes out from the part, gray through it)
  for (let k = 0; k < 90; k++) {
    const s2 = rnd() < 0.5 ? -1 : 1, x0 = FX + s2 * rnd() * 6, y0 = 2 + rnd() * 40, len = 30 + rnd() * 50;
    const pts: number[] = [];
    for (let i = 0; i <= 6; i++) { const u = i / 6; pts.push(x0 + s2 * len * u, y0 + u * u * 26 + Math.sin(u * 3 + k) * 2); }
    path(b, pts, k % 5 ? HAIR[k % 3 ? 1 : 3] : GRAY[2], 1, undefined, M_HAIR);
  }
  seg(b, FX, 0, FX, 40, HAIR[4], 1, undefined, M_HAIR);
  for (const s of [-1, 1]) for (let k = 0; k < 24; k++) { const x = FX + s * (62 + rnd() * 16), y = 44 + rnd() * 40; path(b, [x, y, x + s * 3, y + 8, x + s * 5, y + 16], k % 2 ? GRAY[1] : GRAY[3], 1); }
  // (the feathered wings swept off his forehead)
  // ---- the forehead: three deep lines, sunspots, a vein up the temple
  for (let k = 0; k < 3; k++) path(b, [FX - 44, 60 + k * 6, FX - 14, 57 + k * 6, FX + 14, 58 + k * 6, FX + 44, 61 + k * 6], TAN[6], 1, undefined, M_SKIN);
  vein(b, [FX + 50, 82, FX + 54, 70, FX + 50, 60, FX + 54, 52], TVEIN, 2);
  vein(b, [FX - 52, 80, FX - 56, 68, FX - 52, 58], TVEIN, 2);
  for (let k = 0; k < 14; k++) { const x = FX + (rnd() - 0.5) * 110, y = 58 + rnd() * 100; if (matAt(b, x, y) === M_SKIN) tint(b, x, y, 2 + rnd() * 3, 2 + rnd() * 2, TAN[5], 0.45, M_SKIN, 0.4); }
  // ---- the brows: down hard over the frames, bushy, gray in them
  for (const s of [-1, 1]) {
    const pts = [FX + s * 62, 66, FX + s * 46, 70, FX + s * 28, 77, FX + s * 12, 88];
    path(b, pts, STACHE[5], 5); path(b, pts, STACHE[3], 3); path(b, pts.map((v, i) => (i % 2 ? v - 1 : v)), STACHE[1], 1);
    for (let k = 0; k < 14; k++) { const t = rnd(), x = FX + s * (62 - t * 52), y = 70 + t * 16; seg(b, x, y + 2, x + s * (rnd() * 4 - 1), y - 3 - rnd() * 3, k % 3 ? STACHE[3] : GRAY[2]); }
  }
  for (const s of [-1, 1]) path(b, [FX + s * 4, 74, FX + s * 6, 88], TAN[6], 1, undefined, M_SKIN);
  // ---- the eyes (slitted, yellowed, bloodshot) and the crow's feet, then the aviators over them
  for (const s of [-1, 1]) {
    const ex = FX + s * 34, ey = 100;
    tint(b, ex, ey, 24, 14, TAN[6], 0.35, M_SKIN, 0.6);
    eyeball(b, ex, ey, {
      rx: 15, ry: 9, sclera: SCLERA_Y, iris: IRIS, ir: 6, idx: -s * 3, idy: 0, pr: 2.4, veins: 16, lid: TAN,
      top: (x) => ey - 2 + Math.abs(x - (ex - s * 5)) * 0.12 + (s * (x - ex) < 0 ? 2 : 0) + (key === 'b' ? 2 : 0),
      bot: (x) => ey + 3 - ((x - ex) / 15) ** 2 * 1.5,
    });
    for (const [dy, col] of [[8, TAN[6]], [12, TAN[5]], [15, TAN[5]]] as const) path(b, [ex - 14, ey + dy - 2, ex - 5, ey + dy + 1, ex + 5, ey + dy + 1, ex + 14, ey + dy - 2], col, 1, undefined, M_SKIN);
    for (let k = 0; k < 4; k++) path(b, [ex + s * 26, ey - 6 + k * 5, ex + s * 34, ey - 9 + k * 7, ex + s * 40, ey - 10 + k * 9], TAN[6], 1, undefined, M_SKIN);
  }
  // ---- the nose: broken and set crooked, the bump, the pores, blackheads, the hairs
  poly(b, [FX - 6, 90, FX + 8, 90, FX + 18, 124, FX - 10, 124], TAN, M_SKIN, { line: false, tilt: 1.3 });
  ball(b, FX + 6, 104, 8, 7, TAN, { mat: M_SKIN, lit: 1.15 });
  for (const s of [-1, 1]) ball(b, FX + 4 + s * 16, 132, 9, 9, TAN, { mat: M_SKIN, line: (dx, dy) => dy > -0.2 && dx * s > -0.3 });
  ball(b, FX + 5, 128, 17, 15, TAN, { mat: M_SKIN, line: (_dx, dy) => dy > 0.4, lit: 1.1 });
  path(b, [FX + 2, 94, FX + 8, 104, FX + 4, 114, FX + 8, 122], TAN[6], 1, undefined, M_SKIN);
  for (const s of [-1, 1]) {
    ball(b, FX + 5 + s * 9, 140, 5, 3, R('#3A1808', '#24100A', '#140806', '#080302', '#000000'), { mat: M_OTHER });
    for (let k = 0; k < 4; k++) path(b, [FX + 5 + s * (6 + k * 2), 140, FX + 5 + s * (5 + k * 2.4) + (rnd() - 0.5) * 2, 143 + rnd() * 3, FX + 5 + s * (5 + k * 2.6), 145 + rnd() * 2], GRAY[3]);
  }
  // ---- the mouth: the lips peeled back off clenched teeth (the snarl), the chew in them
  const cx = FX, cy = 162;
  const top = (x: number) => cy - 8 + ((x - cx) / 30) ** 2 * 4;
  const bot = (x: number) => cy + 7 - ((x - cx) / 30) ** 2 * 4;
  for (let x = cx - 30; x <= cx + 30; x++) for (let y = Math.round(top(x)); y <= bot(x); y++) plot(b, x, y, MOUTH[2], M_MOUTH);
  for (let x = cx - 30; x <= cx + 30; x++) { const t = Math.round(top(x)); plot(b, x, t, GUM[3], M_OTHER); plot(b, x, t + 1, GUM[1], M_OTHER); const bt = Math.round(bot(x)); plot(b, x, bt, GUM[3], M_OTHER); plot(b, x, bt - 1, GUM[1], M_OTHER); }
  teeth(b, cx - 28, cx + 28, (x) => top(x) + 2, 1, 7, { tw: 5, gold: [7], rot: [1, 3, 9], gaps: [10], ramp: TOOTH_B });
  teeth(b, cx - 26, cx + 26, (x) => bot(x) - 2, -1, 6, { tw: 5, rot: [0, 4, 6, 8], ramp: TOOTH_B });
  seg(b, cx - 28, cy, cx + 28, cy, MOUTH[4], 1, undefined, M_MOUTH);
  for (let x = cx - 32; x <= cx + 32; x++) { for (let d = 1; d <= 3; d++) { plot(b, x, top(x) - d, LIP[d === 1 ? 5 : d === 2 ? 2 : 1], M_OTHER); plot(b, x, bot(x) + d, LIP[d === 1 ? 5 : d === 2 ? 1 : 3], M_OTHER); } }
  // (the toothpick out of the corner, chewed)
  for (let k = 0; k < 26; k++) { plot(b, cx + 30 + k, cy - 1 - k * 0.35, hexU(k > 22 ? '#B8925A' : '#E8CC94'), M_OTHER); plot(b, cx + 30 + k, cy - k * 0.35, hexU('#B8925A'), M_OTHER); }
  // (the tobacco spit, a brown dribble off the far corner down the chin)
  path(b, [cx - 30, cy + 2, cx - 32, cy + 8, cx - 31, cy + 14, cx - 33, cy + 20], hexU('#6A4A1A'), 2);
  plot(b, cx - 33, cy + 22, hexU('#4A3010')); plot(b, cx - 32, cy + 6, hexU('#C8A060'));
  // ---- the horseshoe mustache: thick over the lip, down both sides to the jaw
  for (let k = 0; k < 340; k++) {
    let x: number, y: number;
    if (rnd() < 0.55) { x = cx - 34 + rnd() * 68; y = 142 + rnd() * 6 + Math.abs(x - cx) * 0.05; }
    else { const s = rnd() < 0.5 ? -1 : 1; x = cx + s * (33 + rnd() * 8); y = 146 + rnd() * 32; }
    if (Math.abs(x - cx) < 3 && y < 150 && rnd() < 0.7) continue;
    seg(b, x, y, x + (x - cx) * 0.03 + (rnd() - 0.5), y + 4 + rnd() * 3, k % 6 ? STACHE[k % 2 ? 3 : 2] : GRAY[2]);
  }
  // ---- gray stubble over the jaw and the chin; the pores, blackheads, the oil shining
  stubble(b, (x, y) => (y > 136 ? 1 - Math.abs(x - FX) / 90 * 0.4 : 0), GRAY[4], 0.4);
  skinPost(b, TAN[7], (x, y) => {
    const nose = ((x - FX - 5) / 22) ** 2 + ((y - 124) / 26) ** 2 < 1;
    return nose ? 0.18 : 0.08;
  }, { blackheads: (x, y) => ((x - FX - 5) / 24) ** 2 + ((y - 120) / 24) ** 2 < 1, shine: 0.28 });
  // (a scar through his far brow, an old one; a liver spot)
  path(b, [FX - 46, 66, FX - 40, 76, FX - 38, 84], TAN[1], 1, undefined, M_SKIN);
  tint(b, FX + 56, 140, 5, 4, TAN[6], 0.4, M_SKIN, 0.4);
  // ---- the aviators: the gold frames, the lenses (brown at the top to amber, his slitted eyes through them), the
  // stage lights in them, a thumbprint smear
  for (const s of [-1, 1]) {
    const lx = FX + s * 34, ly = 100;
    const inLens = (x: number, y: number) => { const dx = (x - lx) / 26, dy = (y - ly) / 20; return dy < 0 ? dx * dx + dy * dy * 1.4 < 1 : dx * dx * (1 + dy * 0.6) + dy * dy < 1; };
    for (let y = ly - 22; y <= ly + 22; y++) for (let x = lx - 28; x <= lx + 28; x++) {
      if (!inLens(x, y)) continue;
      const v = (y - (ly - 20)) / 40;
      const col = mixU(hexU('#3A2010'), hexU('#E8A040'), Math.max(0, Math.min(1, v + (bay(x, y) - 0.5) * 0.15)));
      const i = y * GW + x;
      if (x < 0 || x >= GW || y < 0) continue;
      b.px[i] = mixU(b.px[i], col, 0.62); b.mat[i] = M_GLASS;
    }
    // (the frame)
    for (let a = 0; a < Math.PI * 2; a += 0.01) {
      let x = lx + Math.cos(a) * 26, y = ly + Math.sin(a) * 20;
      if (Math.sin(a) < 0) y = ly + Math.sin(a) * 20 / Math.sqrt(1.4); else x = lx + Math.cos(a) * 26 / Math.sqrt(1 + Math.sin(a) * 0.6);
      plot(b, x, y, GOLD[Math.cos(a + 2.3) > 0.3 ? 1 : 3], M_METAL); plot(b, x, y + 1, GOLD[5], M_METAL);
    }
    // (the stage lights in it: a row of hot dots, and the glare)
    for (let k = 0; k < 5; k++) { const x = lx - 14 + k * 6, y = ly - 8 + Math.abs(k - 2); plot(b, x, y, WHITE); plot(b, x + 1, y, hexU('#FFF0B0')); }
    seg(b, lx - 18, ly + 6, lx - 8, ly - 10, mixU(WHITE, hexU('#E8A040'), 0.3), 2, undefined, M_GLASS);
    seg(b, lx - 12, ly + 10, lx - 4, ly - 2, mixU(WHITE, hexU('#E8A040'), 0.5), 1, undefined, M_GLASS);
  }
  // (the bridge (double bar), the arms back to the ears)
  seg(b, FX - 10, 86, FX + 10, 86, GOLD[2], 2, M_METAL); seg(b, FX - 8, 92, FX + 8, 92, GOLD[3], 1, M_METAL);
  for (const s of [-1, 1]) seg(b, FX + s * 60, 92, FX + s * 74, 98, GOLD[2], 2, M_METAL);
  // (the thumbprint smear on the near lens: whorls of grease)
  for (let r = 3; r < 10; r += 2) for (let a = 0; a < Math.PI * 2; a += 0.3) { const x = FX + 44 + Math.cos(a) * r, y = 110 + Math.sin(a) * r * 0.8; if (matAt(b, x, y) === M_GLASS && hash2(Math.round(x), Math.round(y)) > 0.4) shade(b, x, y, WHITE, 0.25); }
  // ---- the grease and the sweat: beads across the forehead, the lip, a run down the temple
  for (let k = 0; k < 14; k++) { const x = FX - 50 + rnd() * 100, y = 56 + rnd() * 20; if (matAt(b, x, y) === M_SKIN) bead(b, x, y, 1.4 + rnd() * 1.6, TAN); }
  for (const s of [-1, 1]) { path(b, [FX + s * 64, 70, FX + s * 66, 86, FX + s * 65, 104, FX + s * 67, 116], mixU(TAN[1], WHITE, 0.5), 2, undefined, M_SKIN); bead(b, FX + s * 67, 118, 2.2, TAN); }
  return b;
};

const get = stamps<Key>(build);

/** His gross-up: (cx, cy) where the middle of his face goes on the screen, `zoom` 1 at the hold. */
export const drawSteveGross = (c: Ctx, cx: number, cy: number, zoom: number, f: number, jolt = 0) => {
  const s = get(f % 64 < 8 ? 'b' : 'a');
  drawGrossStamp(c, s.img, cx, cy, FX, FY, zoom, f, jolt, (box) => {
    // (the jaw muscle pulsing as he grinds his teeth)
    if (f % 24 < 8) for (const sx of [-1, 1]) { box(FX + sx * 58 - 1, 136, 3, 14, sx < 0 ? '#D08454' : '#E6A070'); box(FX + sx * 62, 136, 1, 14, '#6C381C'); }
    // (a bead of sweat running down his temple)
    const t = (f % 110) / 110, x = FX - 66 + Math.sin(t * 8), y = 70 + t * 50;
    box(x, y, 2, 3, '#FFF4EA'); box(x, y, 1, 1, '#FFFFFF'); box(x + 1, y + 2, 1, 1, '#B4683E');
    // (a glint sliding across the lenses)
    const g = (f % 90) / 90;
    if (g < 0.4) { const gx = FX - 60 + g * 300; c.globalAlpha = 0.6; box(gx, 84, 2, 30, '#FFFFFF'); box(gx + 4, 86, 1, 26, '#FFFFFF'); c.globalAlpha = 1; }
    // (the toothpick twitching up and down)
    if (f % 30 < 15) { box(FX + 46, 154, 10, 1, '#E8CC94'); }
    // (the rhinestones glinting in turn)
    const gl = s.buf.glints;
    for (let i = 0; i < gl.length; i += 2) { const ph = (f + i * 9) % 40; if (ph < 4) { box(gl[i] - 2, gl[i + 1], 5, 1, '#FFFFFF'); box(gl[i], gl[i + 1] - 2, 1, 5, '#FFFFFF'); } }
  });
};

/** Behind him: the stage's lights in bands. */
export const drawSteveGrossBack = (c: Ctx, W: number, H: number) => grossBackdrop(c, W, H, ['#2A0A04', '#4A1408', '#6E220C', '#963410', '#BC4A14']);
