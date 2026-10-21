// SAFARI ARTIE'S GROSS-UP (the user's rule for every close-up: "gross ren and stimpy style close ups"; grossKit.ts): his
// fight's first look at him, up in his blind, found out and livid. The long sunburned face, every pore; the beak of a
// nose burnt raw and peeling in sheets at the tip, blackheads, nose hairs; jug ears (a hair or two, wax); squinted
// bloodshot eyes under a V of brows, crow's feet, bags; the lip curled back off the buck teeth (yellow, chipped, the
// gums showing, plaque); the scrap of a mustache, a few long chin hairs, a whitehead on his chin, mosquito bites,
// freckles and a mole; sweat in beads under the brim and running; the cracked plastic pith helmet, taped, a dead bug
// stuck to it, the band sweated through; the mullet out the sides; the collar and an epaulette, the whistle's lanyard.
// Live: a bead of sweat running, his eye twitching, the nostrils flaring, a fly round his head.

import {
  type Ctx, type Buf, GW, R, hexU, mixU, WHITE, newBuf, setSeed, rnd, matAt, plot, shade, seg, path, ball, tint, poly, bead, eyeball, teeth, skinPost, stubble, hairs, stamps, drawGrossStamp, grossBackdrop, hash2, bay, M_SKIN, M_HAIR, M_MOUTH, M_OTHER, M_CLOTH, M_METAL, SCLERA_R, MOUTH, GUM, BLOOD, HAIRLINE, DARK,
} from '../../grossKit';

const FX = 136, FY = 100;

const SKIN = R('#FFE8D0', '#FCD4B0', '#F0BC94', '#E0A27A', '#C88462', '#A8664A', '#7E4632', '#4A2214');
const BURNT = R('#FFD0B8', '#F8AE90', '#EC8C70', '#DA6C56', '#C04E40', '#9A3430', '#701E20', '#400A0E');
const HAIR = R('#C8A070', '#A88458', '#86643E', '#664A2C', '#4A341E', '#2A1C10');
const HELMET = R('#FFFCEC', '#F6EECC', '#E8DCB2', '#D6C89A', '#C2B080', '#A8956A', '#7E6E48', '#4A3E24');
const BAND = R('#B07A48', '#8C5C34', '#6C4426', '#50301A', '#36200E', '#1E1006');
const KHAKI = R('#F0E2B0', '#DCCA92', '#C4AE76', '#A8905A', '#8A7242', '#665230', '#3E3018');
const TAPE = R('#F4F4F6', '#D8D8DE', '#B8B8C2', '#9898A4', '#6E6E7A', '#3A3A44');
const IRIS = R('#B8E0F4', '#80C0E4', '#4A94C8', '#2A6EA4', '#164878', '#082440');
const LIP = R('#F8B8A8', '#EC9A88', '#D87A6C', '#BC5C52', '#94403C', '#5A1E1C');
const STEEL = R('#FFFFFF', '#E4E4E7', '#C4C4CC', '#A1A1AA', '#71717A', '#3F3F46');

type Key = 'a' | 'b';

const build = (key: Key): Buf => {
  setSeed(5150);
  const b = newBuf();
  // ---- the collar, an epaulette each side, the shirt sweated dark
  ball(b, FX, 262, 200, 96, KHAKI, { mat: M_CLOTH });
  for (const s of [-1, 1]) {
    poly(b, [FX + s * 26, 168, FX + s * 74, 186, FX + s * 66, 204, FX + s * 20, 204], KHAKI, M_CLOTH);
    poly(b, [FX + s * 96, 180, FX + s * 150, 186, FX + s * 150, 196, FX + s * 98, 192], KHAKI, M_CLOTH);
    ball(b, FX + s * 104, 186, 3, 3, STEEL, { line: true, mat: M_METAL });
  }
  tint(b, FX - 60, 204, 40, 16, hexU('#8A7242'), 0.45, M_CLOTH, 0.6);
  // ---- the neck: long and stringy, the Adam's apple, the burn line where the collar stops
  poly(b, [FX - 30, 150, FX + 30, 150, FX + 34, 204, FX - 34, 204], SKIN, M_SKIN, { line: false, tilt: 1.2 });
  ball(b, FX + 2, 182, 9, 11, SKIN, { mat: M_SKIN, line: (_dx, dy) => dy > 0.3 });
  for (const s of [-1, 1]) path(b, [FX + s * 18, 160, FX + s * 16, 180, FX + s * 20, 204], SKIN[6], 1, undefined, M_SKIN);
  // (the lanyard's cord round his neck, the whistle hanging)
  for (const s of [-1, 1]) path(b, [FX + s * 30, 168, FX + s * 18, 196, FX + s * 6, 204], hexU('#C81E1E'), 2);
  // ---- the mullet out the sides, down past the ears
  for (const s of [-1, 1]) {
    ball(b, FX + s * 84, 120, 26, 58, HAIR, { mat: M_HAIR, line: true });
    for (let k = 0; k < 26; k++) { const x = FX + s * (64 + rnd() * 40), y = 80 + rnd() * 90; path(b, [x, y, x + s * (2 + rnd() * 4), y + 8 + rnd() * 10, x + s * (4 + rnd() * 6), y + 18 + rnd() * 10], k % 3 ? HAIR[3] : HAIR[0], 1, undefined, M_HAIR); }
    // (the ends, frayed, split, out past the shirt)
  }
  // ---- the jug ears: out like car doors; the hole, the ridge, wax in it, hairs out of it, sunburnt rims
  for (const s of [-1, 1]) {
    const ex = FX + s * 78, ey = 104;
    ball(b, ex + s * 8, ey, 22, 32, SKIN, { mat: M_SKIN, line: true, lw: 1.4 });
    tint(b, ex + s * 18, ey - 6, 10, 26, BURNT[3], 0.55, M_SKIN, 0.6);
    // (the bowl inside it (darker, no ink), the rim's ridge round it, the flap over the hole; the hole, wax in it)
    ball(b, ex + s * 6, ey + 4, 12, 20, R('#E8AC84', '#D6916C', '#BC7456', '#9A5840', '#6E3A28'), { mat: M_SKIN, soft: 0.2 });
    path(b, [ex + s * 18, ey - 22, ex + s * 23, ey - 6, ex + s * 21, ey + 14, ex + s * 13, ey + 26], SKIN[1], 2, undefined, M_SKIN);
    path(b, [ex + s * 15, ey - 18, ex + s * 19, ey - 4, ex + s * 17, ey + 12, ex + s * 10, ey + 22], SKIN[6], 1, undefined, M_SKIN);
    path(b, [ex - s * 2, ey - 14, ex + s * 6, ey - 6, ex + s * 8, ey + 4], SKIN[5], 1, undefined, M_SKIN);
    ball(b, ex - s * 2, ey + 6, 3.4, 4.4, R('#5A3018', '#40200E', '#2A1408', '#1A0A04', '#0A0402'), { mat: M_OTHER });
    plot(b, ex - s * 2, ey + 8, hexU('#B07818')); plot(b, ex - s * 1, ey + 8, hexU('#80520A')); plot(b, ex - s * 2, ey + 9, hexU('#D8A030'));
    ball(b, ex - s * 5, ey + 4, 3, 5, SKIN, { mat: M_SKIN, line: (dx) => dx * s > 0 });
    hairs(b, 6, () => [ex - s * 2, ey + 4], 6, s > 0 ? -0.3 : Math.PI + 0.3, HAIRLINE);
  }
  // ---- the face: long, narrow, the cheekbones, the weak chin
  ball(b, FX, FY + 4, 66, 84, SKIN, { mat: M_SKIN, line: (_dx, dy) => dy > -0.1, lw: 1.5 });
  for (const s of [-1, 1]) ball(b, FX + s * 40, 112, 26, 22, SKIN, { mat: M_SKIN, lit: 1.08 });
  ball(b, FX, 168, 26, 18, SKIN, { mat: M_SKIN, line: (_dx, dy) => dy > 0.2, lit: 1.05 });
  // (the cheeks hollowed under the bones)
  for (const s of [-1, 1]) tint(b, FX + s * 46, 140, 12, 18, SKIN[6], 0.3, M_SKIN, 0.7);
  // ---- the sunburn: the forehead under the brim, the cheeks, the nose worst of all
  tint(b, FX, 62, 56, 14, BURNT[3], 0.4, M_SKIN, 0.6);
  for (const s of [-1, 1]) tint(b, FX + s * 40, 112, 26, 16, BURNT[3], 0.45, M_SKIN, 0.6);
  // ---- the brows: in a V, bushy, a few long ones curling off
  for (const s of [-1, 1]) {
    const pts = [FX + s * 54, 64, FX + s * 40, 68, FX + s * 24, 74, FX + s * 10, 82];
    path(b, pts, HAIR[5], 7); path(b, pts, HAIR[4], 5); path(b, pts.map((v, i) => (i % 2 ? v - 1 : v)), HAIR[2], 2);
    for (let k = 0; k < 22; k++) { const t = rnd(), x = FX + s * (54 - t * 44), y = 64 + t * 18; seg(b, x, y + 2, x + s * (rnd() * 4 - 1), y - 3 - rnd() * 3, k % 4 ? HAIR[3] : HAIR[1]); }
    path(b, [FX + s * 12, 78, FX + s * 6, 70, FX + s * 9, 64], HAIR[4]);
    // (the furrows between them, cut deep)
    path(b, [FX + s * 4, 70, FX + s * 6, 82, FX + s * 3, 92], SKIN[6], 1, undefined, M_SKIN);
  }
  // (the forehead's lines, squeezed together)
  for (let k = 0; k < 3; k++) path(b, [FX - 34, 54 + k * 6 - (k === 1 ? 1 : 0), FX - 12, 52 + k * 6, FX + 12, 53 + k * 6, FX + 34, 55 + k * 6], SKIN[5], 1, undefined, M_SKIN);
  // ---- the nose: a beak, from between the eyes to a bulb hanging over his lip, burnt raw, peeling at the tip
  poly(b, [FX - 6, 82, FX + 6, 82, FX + 14, 118, FX - 14, 118], BURNT, M_SKIN, { line: false, tilt: 1.4 });
  for (const s of [-1, 1]) ball(b, FX + s * 16, 128, 9, 9, BURNT, { mat: M_SKIN, line: (dx, dy) => dy > -0.2 && dx * s > -0.3 });
  ball(b, FX + 2, 122, 18, 17, BURNT, { mat: M_SKIN, line: (_dx, dy) => dy > 0.35, lit: 1.12 });
  path(b, [FX - 7, 86, FX - 9, 104, FX - 12, 112], BURNT[1], 1, undefined, M_SKIN);
  for (const s of [-1, 1]) {
    // (the nostrils, flared; the hairs out of them)
    ball(b, FX + s * 9, 134, 5, 3.5, R('#4A1C16', '#2E0E0A', '#1A0606', '#0E0202', '#060000'), { mat: M_OTHER });
    for (let k = 0; k < 4; k++) path(b, [FX + s * (6 + k * 2), 134, FX + s * (5.5 + k * 2.4) + (rnd() - 0.5) * 2, 137 + rnd() * 3, FX + s * (5 + k * 2.6) + (rnd() - 0.5) * 3, 139 + rnd() * 2], HAIRLINE);
  }
  // (the peeling: sheets of dead skin lifting off the tip and the bridge, curled, pale, their edges dark)
  const flake = (x: number, y: number, w: number, h: number) => {
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) if (((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2 < 1 + (rnd() - 0.5) * 0.4) plot(b, x + xx, y + yy, yy === 0 ? WHITE : hexU('#FFF0E4'));
    seg(b, x, y + h, x + w, y + h, BURNT[6]); plot(b, x + w, y + h - 1, BURNT[6]);
  };
  flake(FX - 6, 112, 8, 4); flake(FX + 6, 117, 7, 3); flake(FX - 2, 98, 5, 3); flake(FX + 10, 126, 5, 2); flake(FX - 14, 124, 4, 3);
  // (the raw pink under where it's come off)
  for (const [x, y, r] of [[FX + 2, 108, 4], [FX - 10, 118, 3], [FX + 12, 112, 3]] as const) tint(b, x, y, r, r * 0.7, hexU('#FF6A70'), 0.5, M_SKIN, 0.4);
  // ---- the scrap of a mustache: thin, patchy, never going to fill in
  for (let k = 0; k < 40; k++) { const x = FX - 20 + rnd() * 40, y = 142 + rnd() * 4 - Math.abs(x - FX) * 0.06; seg(b, x, y, x + (x - FX) * 0.05 + (rnd() - 0.5), y + 3, HAIR[k % 3 ? 3 : 4], 1, undefined, M_SKIN); }
  // ---- the eyes: squinted at him over the cheeks, bloodshot, bags, crow's feet
  for (const s of [-1, 1]) {
    const ex = FX + s * 30, ey = 92;
    // (the socket shadow)
    tint(b, ex, ey, 22, 14, SKIN[6], 0.3, M_SKIN, 0.6);
    eyeball(b, ex, ey, {
      rx: 15, ry: 9, sclera: SCLERA_R, iris: IRIS, ir: 6, idx: -s * 2, idy: 1, pr: 2.4, veins: 14, lid: SKIN,
      top: (x) => ey - 4 + Math.abs(x - (ex - s * 4)) * 0.18 + (s * (x - ex) < 0 ? 2 : 0) + (key === 'b' && s > 0 ? 3 : 0),
      bot: (x) => ey + 4 - ((x - ex) / 15) ** 2 * 2,
    });
    // (the lid crease, the lashes (stubby), the bags in two folds, the crow's feet)
    path(b, [ex - 15, ey - 7, ex, ey - 9, ex + 15, ey - 7], SKIN[6], 1, undefined, M_SKIN);
    for (let k = 0; k < 6; k++) { const x = ex - 11 + k * 4.4; seg(b, x, ey - 4 + Math.abs(x - ex) * 0.18, x + s * 1, ey - 7 + Math.abs(x - ex) * 0.18, HAIRLINE); }
    for (const [dy, col] of [[8, SKIN[6]], [13, SKIN[5]]] as const) path(b, [ex - 13, ey + dy - 2, ex - 5, ey + dy + 1, ex + 5, ey + dy + 1, ex + 13, ey + dy - 2], col, 1, undefined, M_SKIN);
    tint(b, ex, ey + 10, 12, 4, hexU('#8A5A6A'), 0.35, M_SKIN, 0.7);
    for (let k = 0; k < 3; k++) path(b, [ex + s * 17, ey - 2 + k * 4, ex + s * 23, ey - 5 + k * 6, ex + s * 28, ey - 6 + k * 8], SKIN[6], 1, undefined, M_SKIN);
  }
  // ---- the mouth: the lip curled back off the buck teeth on his left (the sneer), the gums, the bottom lip under them
  {
    const cx = FX + 2, cy = 154;
    const top = (x: number) => cy - 4 - Math.max(0, (x - cx + 10) * 0.12) * (x > cx - 10 ? 1 : 0) - 3 * Math.exp(-(((x - cx) / 10) ** 2));
    const bot = (x: number) => cy + 5 - ((x - cx) / 30) ** 2 * 5;
    for (let x = cx - 28; x <= cx + 28; x++) for (let y = Math.floor(top(x)); y <= bot(x); y++) {
      const dx = (x - cx) / 28;
      if (Math.abs(dx) > 1 - (y - top(x)) * 0.02) continue;
      plot(b, x, y, MOUTH[Math.min(4, 1 + Math.round((y - top(x)) / 3))], M_MOUTH);
    }
    // (the gums over the teeth, pink and wet)
    for (let x = cx - 26; x <= cx + 26; x++) { const t = Math.round(top(x)); for (let y = t; y < t + 3; y++) if (matAt(b, x, y) === M_MOUTH) plot(b, x, y, GUM[y === t ? 3 : y === t + 1 ? 1 : 2], M_OTHER); }
    // (the teeth: the two buck ones, huge, out over the bottom lip; the rest yellowed, a chip, a brown one)
    teeth(b, cx - 26, cx + 26, (x) => top(x) + 3, 1, 8, { tw: 6, rot: [1, 7], gaps: [] });
    ball(b, cx, bot(cx) + 4, 26, 6, LIP, { mat: M_OTHER, line: (_dx, dy) => dy > 0, lit: 1.15 });
    for (let x = cx - 24; x < cx + 24; x += 3) for (let y = cy - 8; y < cy + 14; y++) if (matAt(b, x, y) === M_OTHER && hash2(x, y) > 0.8 && pxAtLip(b, x, y)) plot(b, x, y, LIP[4]);
    for (const s of [-1, 1]) {
      const x0 = cx + (s < 0 ? -11 : 0), t = Math.round(top(x0 + 5)) + 2;
      for (let yy = 0; yy < 17; yy++) for (let xx = 0; xx < 11; xx++) {
        if (yy > 14 && (xx === 0 || xx === 10)) continue;
        if (s > 0 && yy > 12 && xx > 6 && xx - 6 > 14 - yy) continue; // (the chip off his right one)
        const k = xx === 0 ? 0 : xx > 8 ? 3 : yy > 12 ? 2 : 1;
        plot(b, x0 + xx, t + yy, (xx === 10 || yy === 16) ? hexU('#4E3E1E') : [hexU('#FFFDEC'), hexU('#F4EAC0'), hexU('#E0CE94'), hexU('#C4AC6C')][bay(x0 + xx, t + yy) > 0.85 && k < 3 ? k + 1 : k], M_OTHER);
      }
      seg(b, x0 + 1, t + 1, x0 + 1, t + 9, WHITE, 1); // (wet)
      for (let xx = 1; xx < 10; xx++) if (hash2(x0 + xx, t) > 0.4) plot(b, x0 + xx, t + 1, hexU('#C4AC6C'));
    }
    seg(b, cx, Math.round(top(cx)) + 2, cx, Math.round(top(cx)) + 18, hexU('#4E3E1E'));
    // (the lips: the top one curled up and back (chapped), the bottom one fat and wet under the buck teeth)
    for (let x = cx - 30; x <= cx + 30; x++) {
      const t = Math.round(top(x));
      for (let d = 1; d <= 4; d++) if (matAt(b, x, t - d) === M_SKIN) plot(b, x, t - d, LIP[d === 1 ? 5 : d === 2 ? 3 : 2], M_OTHER);
    }
    seg(b, cx - 12, bot(cx) + 2, cx - 4, bot(cx) + 2, WHITE); seg(b, cx + 8, bot(cx) + 3, cx + 12, bot(cx) + 3, WHITE);
    // (spit strung across the corner)
    path(b, [cx + 24, cy - 2, cx + 25, cy + 2, cx + 23, cy + 6], hexU('#F0F4FA'));
    // (the sneer's fold up from the corner past the nose)
    path(b, [cx - 30, cy - 2, cx - 32, cy - 14, cx - 26, cy - 24, cx - 20, cy - 26], SKIN[6], 1, undefined, M_SKIN);
    path(b, [cx + 30, cy, cx + 33, cy - 10, cx + 30, cy - 22], SKIN[5], 1, undefined, M_SKIN);
  }
  // ---- the chin: a whitehead, a few long hairs, stubble that never took, a scrape
  ball(b, FX - 14, 172, 3.4, 3, R('#FFFFF0', '#FFF4C0', '#F4C890', '#E07868', '#B84A44', '#6A2020'), { line: true, lw: 0.7, mat: M_OTHER });
  tint(b, FX - 14, 172, 7, 6, hexU('#E04A4A'), 0.35, M_SKIN, 0.7);
  path(b, [FX + 10, 176, FX + 12, 184, FX + 10, 190], HAIRLINE); path(b, [FX + 16, 174, FX + 19, 181], HAIRLINE); path(b, [FX - 20, 180, FX - 22, 188, FX - 20, 192], HAIRLINE);
  stubble(b, (x, y) => (y > 150 && Math.abs(x - FX) < 50 ? 0.25 : 0), HAIR[4], 0.4);
  // ---- freckles, a mole with a hair, mosquito bites (welts, a red dot, scratched)
  for (let k = 0; k < 60; k++) { const x = FX + (rnd() - 0.5) * 110, y = 70 + rnd() * 70; if (matAt(b, x, y) === M_SKIN) { plot(b, x, y, SKIN[5]); if (rnd() < 0.4) plot(b, x + 1, y, SKIN[5]); } }
  ball(b, FX + 44, 132, 2.6, 2.4, R('#6A3A22', '#4A2414', '#2E140A', '#1A0804', '#0E0402'), { mat: M_OTHER });
  path(b, [FX + 45, 131, FX + 48, 126, FX + 47, 121], HAIRLINE);
  for (const [x, y] of [[FX - 46, 124], [FX + 52, 76], [FX - 36, 150]] as const) {
    ball(b, x, y, 5, 4, R('#FFC8C0', '#F8A8A0', '#EC8C86', '#D6706C', '#B05050', '#7A3030'), { mat: M_SKIN, soft: 0.3 });
    plot(b, x, y, hexU('#A81818')); plot(b, x + 1, y, hexU('#C42A2A'));
    seg(b, x - 3, y - 1, x - 1, y + 2, hexU('#E04A4A'));
  }
  // ---- the pores (thick on the nose and the cheeks), blackheads, the grease
  skinPost(b, SKIN[7], (x, y) => {
    const nose = ((x - FX) / 22) ** 2 + ((y - 118) / 24) ** 2 < 1, cheek = ((x - FX + 40) / 28) ** 2 + ((y - 116) / 22) ** 2 < 1 || ((x - FX - 40) / 28) ** 2 + ((y - 116) / 22) ** 2 < 1;
    return nose ? 0.17 : cheek ? 0.11 : 0.06;
  }, { blackheads: (x, y) => ((x - FX) / 24) ** 2 + ((y - 120) / 20) ** 2 < 1 || (y > 160 && Math.abs(x - FX) < 30) });
  // ---- the helmet: the dome down to his brows, the band sweated through, the brim; cracked, taped, scuffed, a dead bug
  ball(b, FX, 30, 96, 56, HELMET, { mat: M_OTHER, line: true, lw: 1.5, only: (x, y) => y < 50 - ((x - FX) / 96) ** 2 * 6 });
  // (the ventilator button on top, the seam)
  ball(b, FX, -18, 10, 6, HELMET, { mat: M_OTHER, line: true });
  path(b, [FX, -12, FX - 2, 10, FX - 3, 34], HELMET[6], 1);
  for (let x = FX - 96; x <= FX + 96; x++) {
    const y = 46 + Math.round(((x - FX) / 96) ** 2 * -6);
    for (let d = 0; d < 9; d++) plot(b, x, y + d, BAND[d === 0 || d === 8 ? 5 : d < 3 ? 1 : d < 6 ? 2 : 3], M_OTHER);
    if (hash2(x, 3) > 0.7) plot(b, x, y + 4, BAND[0]);
  }
  // (the band sweated dark in a tide line)
  for (let x = FX - 96; x <= FX + 96; x++) { const y0 = 46 + Math.round(((x - FX) / 96) ** 2 * -6); for (let d = 4; d < 8; d++) if (bay(x, y0 + d) < 0.6) plot(b, x, y0 + d, BAND[4]); }
  // (the brim: wide, its underside in shadow over his forehead)
  for (let x = FX - 136; x <= FX + 136; x++) {
    const u = (x - FX) / 136, yb = 56 - Math.round(u * u * 12);
    const th = Math.round(6 + 7 * (1 - u * u));
    for (let d = 0; d < th; d++) { const q = d / th; plot(b, x, yb + d, HELMET[d === 0 ? 0 : q < 0.3 ? 2 : q < 0.55 ? (bay(x, yb + d) < 0.5 ? 3 : 4) : d < th - 1 ? 5 : 7], M_OTHER); }
  }
  for (let x = FX - 70; x <= FX + 70; x++) for (let d = 0; d < 6; d++) { const y = 69 - Math.round(((x - FX) / 136) ** 2 * 16) + d; if (matAt(b, x, y) === M_SKIN && bay(x, y) < 0.6 - d * 0.1) shade(b, x, y, DARK, 0.35); }
  // (the crack, from the brim up across the dome, and the duct tape over it (silver, crinkled, peeling at a corner))
  const crack: number[] = [];
  { let x = FX + 30, y = 52; crack.push(x, y); for (let k = 0; k < 9; k++) { x += 2 + rnd() * 5; y -= 5 + rnd() * 3; crack.push(x, y); } }
  path(b, crack, HELMET[7], 1);
  poly(b, [FX + 26, 18, FX + 62, 8, FX + 66, 22, FX + 30, 32], TAPE, M_METAL);
  for (let k = 0; k < 8; k++) { const x = FX + 30 + k * 4.4; seg(b, x, 20 - k * 1.2, x + 2, 30 - k * 1.2, TAPE[k % 2 ? 0 : 3]); }
  poly(b, [FX + 62, 8, FX + 70, 4, FX + 68, 14], TAPE, M_METAL);
  poly(b, [FX - 60, 6, FX - 34, -6, FX - 30, 4, FX - 56, 16], TAPE, M_METAL);
  // (scuffs, a gouge; a squashed bug on it, its leg and a smear of blood)
  for (let k = 0; k < 30; k++) { const x = FX + (rnd() - 0.5) * 170, y = -10 + rnd() * 56; if (matAt(b, x, y) === M_OTHER) seg(b, x, y, x + 3 + rnd() * 5, y + (rnd() - 0.5) * 2, HELMET[5]); }
  ball(b, FX - 40, 30, 4, 3, R('#3A2A1A', '#2A1A0E', '#1A1008', '#0A0602', '#000000'), { mat: M_OTHER });
  tint(b, FX - 36, 32, 6, 3, BLOOD[2], 0.6, M_OTHER, 0.5);
  for (const [dx, dy] of [[-5, -3], [-6, 2], [4, 4], [5, -2]] as const) seg(b, FX - 40, 30, FX - 40 + dx, 30 + dy, hexU('#1A1008'));
  // ---- sweat: beads in a row under the brim, on the nose, the lip; tracks down the temples
  for (let k = 0; k < 14; k++) { const x = FX - 50 + rnd() * 100, y = 70 + rnd() * 5; if (matAt(b, x, y) === M_SKIN) bead(b, x, y, 1.4 + rnd() * 1.6, SKIN); }
  bead(b, FX + 6, 110, 1.8, BURNT); bead(b, FX - 12, 144, 1.3, SKIN); bead(b, FX + 14, 146, 1.2, SKIN);
  for (const s of [-1, 1]) { path(b, [FX + s * 58, 80, FX + s * 61, 96, FX + s * 60, 112, FX + s * 62, 124], mixU(SKIN[1], WHITE, 0.5), 2, undefined, M_SKIN); bead(b, FX + s * 62, 126, 2.2, SKIN); }
  return b;
};
/** (is that pixel on his lips) */
const pxAtLip = (b: Buf, x: number, y: number) => { const v = b.px[y * GW + x]; return v === LIP[1] || v === LIP[2] || v === LIP[0]; };

const get = stamps<Key>(build);

/** His gross-up: (cx, cy) where the middle of his face goes on the screen, `zoom` 1 at the hold. */
export const drawArtieGross = (c: Ctx, cx: number, cy: number, zoom: number, f: number) => {
  const twitch = f % 70 < 10 && (f >> 1) % 2 === 0;
  const s = get(twitch ? 'b' : 'a');
  drawGrossStamp(c, s.img, cx, cy, FX, FY, zoom, f, 0, (box) => {
    // (a bead of sweat running down his temple, again and again)
    const t = (f % 120) / 120, x = FX - 60 - t * 2 + Math.sin(t * 9), y = 82 + t * 46;
    box(x, y, 2, 3, '#FFF4EA'); box(x, y, 1, 1, '#FFFFFF'); box(x + 1, y + 2, 1, 1, '#C88462');
    // (the nostrils flaring: a dark rim pulsing round them)
    if (f % 30 < 12) { box(FX - 15, 132, 3, 1, '#2E0E0A'); box(FX + 14, 132, 3, 1, '#2E0E0A'); }
    // (the tic: shake marks off the twitching eye)
    if (twitch) for (let k = 0; k < 3; k++) box(FX + 52 + k * 3, 80 + k * 5 - (f % 2), 3, 1, '#FFFFFF');
    // (a fly, round and round his head, landing on his nose now and then)
    const ft = f % 160, land = ft > 110 && ft < 140;
    const fx = land ? FX + 4 : FX + Math.cos(f * 0.09) * 90 + Math.sin(f * 0.23) * 14, fy = land ? 114 : 70 + Math.sin(f * 0.13) * 44;
    box(fx - 1, fy - 1, 3, 2, '#141414'); box(fx, fy - 1, 1, 1, '#7A1A1A');
    if (!land || f % 4 < 2) { box(fx - 3, fy - 3 + (f % 2), 2, 1, '#DCE6F0'); box(fx + 2, fy - 3 + (f % 2), 2, 1, '#DCE6F0'); }
  });
};

/** Behind him: the jungle in bands. */
export const drawArtieGrossBack = (c: Ctx, W: number, H: number) => grossBackdrop(c, W, H, ['#0E2A12', '#14381A', '#1C4A22', '#265C2A', '#2E6A30']);
