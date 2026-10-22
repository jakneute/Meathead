// SAFARI ARTIE'S GROSS-UP (the user's rule for every close-up: "gross ren and stimpy style close ups"; grossKit.ts): his
// fight's first look at him, up in his blind, found out and livid. The long sunburned face, every pore; the beak of a
// nose burnt raw and peeling in sheets at the tip, blackheads, nose hairs; jug ears (a hair or two, wax); squinted
// bloodshot eyes under a V of brows, crow's feet, bags; the lip curled back off the buck teeth (yellow, chipped, the
// gums showing, plaque); the scrap of a mustache, a few long chin hairs, a whitehead on his chin, mosquito bites,
// freckles and a mole; sweat in beads under the brim and running; the cracked plastic pith helmet, taped, a dead bug
// stuck to it, the band sweated through; the mullet out the sides; the collar and an epaulette, the whistle's lanyard.
// Live: a bead of sweat running, his eye twitching, the nostrils flaring, a fly round his head.

import {
  type Ctx, type Buf, GW, R, hexU, mixU, WHITE, newBuf, setSeed, rnd, matAt, plot, shade, seg, path, ball, tint, poly, bead, eyeball, teeth, vein, skinPost, stubble, hairs, stamps, drawGrossStamp, grossBackdrop, hash2, bay, M_SKIN, M_HAIR, M_MOUTH, M_OTHER, M_CLOTH, M_METAL, SCLERA_R, MOUTH, GUM, BLOOD, HAIRLINE, DARK, TONGUE, TOOTH, TOOTH_B,
} from '../../grossKit';

const FX = 136, FY = 100;

const SKIN_CALM = R('#FFE8D0', '#FCD4B0', '#F0BC94', '#E0A27A', '#C88462', '#A8664A', '#7E4632', '#4A2214');
const BURNT_CALM = R('#FFD0B8', '#F8AE90', '#EC8C70', '#DA6C56', '#C04E40', '#9A3430', '#701E20', '#400A0E');
// (enraged: beet red all over, the nose gone purple)
const SKIN_RAGE = R('#FFC8B8', '#F89C8C', '#EC7A6E', '#DA5A54', '#BC4044', '#962A36', '#6A1828', '#3A0812');
const BURNT_RAGE = R('#F4A8C0', '#E07CA0', '#C85A86', '#A83E6C', '#862A56', '#621A40', '#420C2C', '#24041A');
const RAGE_VEIN = R('#FFB0B0', '#F07C84', '#D04A5E', '#A82E46', '#7A1A32', '#40061A');
/** The top of his head (no helmet on it ever: pale as a fish under where it goes, the tan line hard). */
const SCALP = R('#FFF6F0', '#FCE8E0', '#F4D4CC', '#E8BCB4', '#D49C98', '#B47878', '#844E52', '#4A2228');
const HAIR = R('#C8A070', '#A88458', '#86643E', '#664A2C', '#4A341E', '#2A1C10');
const HELMET = R('#FFFCEC', '#F6EECC', '#E8DCB2', '#D6C89A', '#C2B080', '#A8956A', '#7E6E48', '#4A3E24');
const BAND = R('#B07A48', '#8C5C34', '#6C4426', '#50301A', '#36200E', '#1E1006');
const KHAKI = R('#F0E2B0', '#DCCA92', '#C4AE76', '#A8905A', '#8A7242', '#665230', '#3E3018');
const TAPE = R('#F4F4F6', '#D8D8DE', '#B8B8C2', '#9898A4', '#6E6E7A', '#3A3A44');
const IRIS = R('#B8E0F4', '#80C0E4', '#4A94C8', '#2A6EA4', '#164878', '#082440');
const LIP = R('#F8B8A8', '#EC9A88', '#D87A6C', '#BC5C52', '#94403C', '#5A1E1C');
const STEEL = R('#FFFFFF', '#E4E4E7', '#C4C4CC', '#A1A1AA', '#71717A', '#3F3F46');

/** 'a' / 'b' the fight intro's (b: the tic); 'rc' / 'r' / 'r2' enraged, hatless (rc: seething, the sneer; r: the
 *  yell wide open; r2: half shut, between words), 'hat' his helmet alone (painted 40 down: the whole dome on it),
 *  'fist' his fist, shaken (the boat's picture-in-picture when Meathead goes over the side: artiePip.ts); 't' / 't2'
 *  gloating (a wink, one brow up, the nasty grin; t2: mouth open, mid-word), 'finger' his finger up, wagged (the mine
 *  cart's, when he first comes up behind him). */
export type Key = 'a' | 'b' | 'rc' | 'r' | 'r2' | 'hat' | 'fist' | 't' | 't2' | 'finger';
/** The helmet painted down this far in the 'hat' stamp (the dome's off the buffer's top on him). */
export const HAT_DY = 40;

function* build(key: Key): Generator<void, Buf> {
  if (key === 'hat') return yield* buildHat();
  if (key === 'fist') return yield* buildFist();
  if (key === 'finger') return yield* buildFinger();
  setSeed(5150);
  const rage = key === 'rc' || key === 'r' || key === 'r2', yell = key === 'r' || key === 'r2' || key === 't2', taunt = key === 't' || key === 't2';
  const SKIN = rage ? SKIN_RAGE : SKIN_CALM, BURNT = rage ? BURNT_RAGE : BURNT_CALM;
  const b = newBuf();
  yield;
  // ---- the collar, an epaulette each side, the shirt sweated dark
  ball(b, FX, 262, 200, 96, KHAKI, { mat: M_CLOTH });
  for (const s of [-1, 1]) {
    poly(b, [FX + s * 26, 168, FX + s * 74, 186, FX + s * 66, 204, FX + s * 20, 204], KHAKI, M_CLOTH);
    poly(b, [FX + s * 96, 180, FX + s * 150, 186, FX + s * 150, 196, FX + s * 98, 192], KHAKI, M_CLOTH);
    ball(b, FX + s * 104, 186, 3, 3, STEEL, { line: true, mat: M_METAL });
  }
  tint(b, FX - 60, 204, 40, 16, hexU('#8A7242'), 0.45, M_CLOTH, 0.6);
  yield;
  // ---- the neck: long and stringy, the Adam's apple, the burn line where the collar stops
  poly(b, [FX - 30, 150, FX + 30, 150, FX + 34, 204, FX - 34, 204], SKIN, M_SKIN, { line: false, tilt: 1.2 });
  ball(b, FX + 2, 182, 9, 11, SKIN, { mat: M_SKIN, line: (_dx, dy) => dy > 0.3 });
  for (const s of [-1, 1]) path(b, [FX + s * 18, 160, FX + s * 16, 180, FX + s * 20, 204], SKIN[6], 1, undefined, M_SKIN);
  // (enraged: the cords of it stood out, a vein up each side fit to burst)
  if (rage) for (const s of [-1, 1]) { path(b, [FX + s * 10, 204, FX + s * 14, 176, FX + s * 22, 152], SKIN[2], 3, undefined, M_SKIN); vein(b, [FX + s * 26, 204, FX + s * 24, 186, FX + s * 28, 170, FX + s * 26, 156], RAGE_VEIN, 2); }
  yield;
  // (the lanyard's cord round his neck, the whistle hanging)
  for (const s of [-1, 1]) path(b, [FX + s * 30, 168, FX + s * 18, 196, FX + s * 6, 204], hexU('#C81E1E'), 2);
  yield;
  // ---- the mullet out the sides, down past the ears
  for (const s of [-1, 1]) {
    ball(b, FX + s * 84, 120, 26, 58, HAIR, { mat: M_HAIR, line: true });
    for (let k = 0; k < 26; k++) { const x = FX + s * (64 + rnd() * 40), y = 80 + rnd() * 90; path(b, [x, y, x + s * (2 + rnd() * 4), y + 8 + rnd() * 10, x + s * (4 + rnd() * 6), y + 18 + rnd() * 10], k % 3 ? HAIR[3] : HAIR[0], 1, undefined, M_HAIR); }
    // (the ends, frayed, split, out past the shirt)
  }
  yield;
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
  yield;
  // ---- the face: long, narrow, the cheekbones, the weak chin (enraged, hatless: the dome of his head over it)
  if (rage) ball(b, FX, 52, 60, 46, SKIN, { mat: M_SKIN, line: (_dx, dy) => dy < 0, lw: 1.5 });
  ball(b, FX, FY + 4, 66, 84, SKIN, { mat: M_SKIN, line: (_dx, dy) => dy > -0.1, lw: 1.5 });
  for (const s of [-1, 1]) ball(b, FX + s * 40, 112, 26, 22, SKIN, { mat: M_SKIN, lit: 1.08 });
  // (the jaw dropped with the mouth, yelling)
  const jaw = key === 'r' ? 14 : key === 'r2' || key === 't2' ? 6 : 0;
  ball(b, FX, 168 + jaw, 26, 18, SKIN, { mat: M_SKIN, line: (_dx, dy) => dy > 0.2, lit: 1.05 });
  yield;
  // (the cheeks hollowed under the bones)
  for (const s of [-1, 1]) tint(b, FX + s * 46, 140, 12, 18, SKIN[6], 0.3, M_SKIN, 0.7);
  yield;
  // ---- the sunburn: the forehead under the brim, the cheeks, the nose worst of all
  tint(b, FX, 62, 56, 14, BURNT[3], 0.4, M_SKIN, 0.6);
  for (const s of [-1, 1]) tint(b, FX + s * 40, 112, 26, 16, BURNT[3], 0.45, M_SKIN, 0.6);
  yield;
  // ---- the brows: in a V, bushy, a few long ones curling off
  for (const s of [-1, 1]) {
    // (gloating: his right one cocked right up, the left down over the wink)
    const pts = rage ? [FX + s * 56, 54, FX + s * 42, 60, FX + s * 26, 70, FX + s * 10, 84]
      : taunt && s < 0 ? [FX - 54, 80, FX - 42, 71, FX - 26, 70, FX - 10, 76]
      : taunt ? [FX + 54, 70, FX + 40, 74, FX + 24, 78, FX + 10, 80]
      : [FX + s * 54, 64, FX + s * 40, 68, FX + s * 24, 74, FX + s * 10, 82];
    path(b, pts, HAIR[5], 7); path(b, pts, HAIR[4], 5); path(b, pts.map((v, i) => (i % 2 ? v - 1 : v)), HAIR[2], 2);
    for (let k = 0; k < 22; k++) { const t = rnd(), x = FX + s * (54 - t * 44), y = 64 + t * 18; seg(b, x, y + 2, x + s * (rnd() * 4 - 1), y - 3 - rnd() * 3, k % 4 ? HAIR[3] : HAIR[1]); }
    path(b, [FX + s * 12, 78, FX + s * 6, 70, FX + s * 9, 64], HAIR[4]);
    // (the furrows between them, cut deep)
    path(b, [FX + s * 4, 70, FX + s * 6, 82, FX + s * 3, 92], SKIN[6], 1, undefined, M_SKIN);
  }
  yield;
  // (the forehead's lines, squeezed together)
  for (let k = 0; k < 3; k++) path(b, [FX - 34, 54 + k * 6 - (k === 1 ? 1 : 0), FX - 12, 52 + k * 6, FX + 12, 53 + k * 6, FX + 34, 55 + k * 6], SKIN[5], 1, undefined, M_SKIN);
  yield;
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
  yield;
  // (the peeling: sheets of dead skin lifting off the tip and the bridge, curled, pale, their edges dark)
  const flake = (x: number, y: number, w: number, h: number) => {
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) if (((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2 < 1 + (rnd() - 0.5) * 0.4) plot(b, x + xx, y + yy, yy === 0 ? WHITE : hexU('#FFF0E4'));
    seg(b, x, y + h, x + w, y + h, BURNT[6]); plot(b, x + w, y + h - 1, BURNT[6]);
  };
  flake(FX - 6, 112, 8, 4); flake(FX + 6, 117, 7, 3); flake(FX - 2, 98, 5, 3); flake(FX + 10, 126, 5, 2); flake(FX - 14, 124, 4, 3);
  yield;
  // (the raw pink under where it's come off)
  for (const [x, y, r] of [[FX + 2, 108, 4], [FX - 10, 118, 3], [FX + 12, 112, 3]] as const) tint(b, x, y, r, r * 0.7, hexU('#FF6A70'), 0.5, M_SKIN, 0.4);
  yield;
  // ---- the scrap of a mustache: thin, patchy, never going to fill in
  for (let k = 0; k < 40; k++) { const x = FX - 20 + rnd() * 40, y = 142 + rnd() * 4 - Math.abs(x - FX) * 0.06; seg(b, x, y, x + (x - FX) * 0.05 + (rnd() - 0.5), y + 3, HAIR[k % 3 ? 3 : 4], 1, undefined, M_SKIN); }
  yield;
  // ---- the eyes: squinted at him over the cheeks, bloodshot, bags, crow's feet
  for (const s of [-1, 1]) {
    const ex = FX + s * 30, ey = 92;
    // (the socket shadow)
    tint(b, ex, ey, 22, 14, SKIN[6], 0.3, M_SKIN, 0.6);
    // (enraged: popped wide, the pupils pinpricks, threaded red all over)
    const wink = taunt && s > 0;
    // (gloating: the wink, squeezed shut, the lashes down, the cheek pushed up under it)
    if (wink) {
      ball(b, ex, ey - 1, 16, 9, SKIN, { mat: M_SKIN, line: (_dx, dy) => dy < -0.3, lit: 1.05 });
      path(b, [ex - 15, ey - 1, ex - 6, ey + 3, ex + 6, ey + 3, ex + 15, ey - 2], HAIRLINE, 2, undefined, M_SKIN);
      for (let k = 0; k < 6; k++) { const x = ex - 11 + k * 4.4; seg(b, x, ey + 3, x - 1, ey + 6, HAIRLINE); }
      ball(b, ex, ey + 12, 18, 7, SKIN, { mat: M_SKIN, line: (_dx, dy) => dy < -0.4, lit: 1.1 });
    } else if (taunt) eyeball(b, ex, ey, {
      // (the other one narrowed at him, sly, sidelong)
      rx: 15, ry: 9, sclera: SCLERA_R, iris: IRIS, ir: 6, idx: 4, idy: 1, pr: 2.2, veins: 12, lid: SKIN,
      top: (x) => ey - 2 + Math.abs(x - ex) * 0.1,
      bot: (x) => ey + 4 - ((x - ex) / 15) ** 2 * 2,
    });
    else if (rage) eyeball(b, ex, ey, {
      rx: 16, ry: 12, sclera: SCLERA_R, iris: IRIS, ir: 5, idx: -s * 1, idy: 0, pr: 1.2, veins: 34, lid: SKIN,
      top: (x) => ey - 9 + Math.abs(x - ex) * 0.08 + (s * (x - ex) < 0 ? 3 : 0),
      bot: (x) => ey + 9 - ((x - ex) / 16) ** 2 * 3,
    });
    else eyeball(b, ex, ey, {
      rx: 15, ry: 9, sclera: SCLERA_R, iris: IRIS, ir: 6, idx: -s * 2, idy: 1, pr: 2.4, veins: 14, lid: SKIN,
      top: (x) => ey - 4 + Math.abs(x - (ex - s * 4)) * 0.18 + (s * (x - ex) < 0 ? 2 : 0) + (key === 'b' && s > 0 ? 3 : 0),
      bot: (x) => ey + 4 - ((x - ex) / 15) ** 2 * 2,
    });
    // (the lid crease, the lashes (stubby), the bags in two folds, the crow's feet)
    path(b, [ex - 15, ey - 7, ex, ey - 9, ex + 15, ey - 7], SKIN[6], 1, undefined, M_SKIN);
    if (!wink) for (let k = 0; k < 6; k++) { const x = ex - 11 + k * 4.4; seg(b, x, ey - 4 + Math.abs(x - ex) * 0.18, x + s * 1, ey - 7 + Math.abs(x - ex) * 0.18, HAIRLINE); }
    for (const [dy, col] of [[8, SKIN[6]], [13, SKIN[5]]] as const) path(b, [ex - 13, ey + dy - 2, ex - 5, ey + dy + 1, ex + 5, ey + dy + 1, ex + 13, ey + dy - 2], col, 1, undefined, M_SKIN);
    tint(b, ex, ey + 10, 12, 4, hexU('#8A5A6A'), 0.35, M_SKIN, 0.7);
    for (let k = 0; k < 3; k++) path(b, [ex + s * 17, ey - 2 + k * 4, ex + s * 23, ey - 5 + k * 6, ex + s * 28, ey - 6 + k * 8], SKIN[6], 1, undefined, M_SKIN);
  }
  yield;
  // ---- the mouth: the lip curled back off the buck teeth on his left (the sneer), the gums, the bottom lip under them
  // (yelling: wide open, yellMouth)
  if (yell) yellMouth(b, key === 'r', SKIN);
  else if (taunt) grinMouth(b, SKIN);
  else {
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
  yield;
  // ---- the chin: a whitehead, a few long hairs, stubble that never took, a scrape
  ball(b, FX - 14, 172 + jaw, 3.4, 3, R('#FFFFF0', '#FFF4C0', '#F4C890', '#E07868', '#B84A44', '#6A2020'), { line: true, lw: 0.7, mat: M_OTHER });
  tint(b, FX - 14, 172 + jaw, 7, 6, hexU('#E04A4A'), 0.35, M_SKIN, 0.7);
  path(b, [FX + 10, 176 + jaw, FX + 12, 184 + jaw, FX + 10, 190 + jaw], HAIRLINE); path(b, [FX + 16, 174 + jaw, FX + 19, 181 + jaw], HAIRLINE); path(b, [FX - 20, 180 + jaw, FX - 22, 188 + jaw, FX - 20, 192 + jaw], HAIRLINE);
  stubble(b, (x, y) => (y > 150 && Math.abs(x - FX) < 50 ? 0.25 : 0), HAIR[4], 0.4);
  yield;
  // ---- freckles, a mole with a hair, mosquito bites (welts, a red dot, scratched)
  for (let k = 0; k < 60; k++) { const x = FX + (rnd() - 0.5) * 110, y = 70 + rnd() * 70; if (matAt(b, x, y) === M_SKIN) { plot(b, x, y, SKIN[5]); if (rnd() < 0.4) plot(b, x + 1, y, SKIN[5]); } }
  ball(b, FX + 44, 132, 2.6, 2.4, R('#6A3A22', '#4A2414', '#2E140A', '#1A0804', '#0E0402'), { mat: M_OTHER });
  path(b, [FX + 45, 131, FX + 48, 126, FX + 47, 121], HAIRLINE);
  for (const [x, y] of [[FX - 46, 124], [FX + 52, 76], [FX - 36, 150]] as const) {
    ball(b, x, y, 5, 4, R('#FFC8C0', '#F8A8A0', '#EC8C86', '#D6706C', '#B05050', '#7A3030'), { mat: M_SKIN, soft: 0.3 });
    plot(b, x, y, hexU('#A81818')); plot(b, x + 1, y, hexU('#C42A2A'));
    seg(b, x - 3, y - 1, x - 1, y + 2, hexU('#E04A4A'));
  }
  yield;
  // ---- the pores (thick on the nose and the cheeks), blackheads, the grease
  skinPost(b, SKIN[7], (x, y) => {
    const nose = ((x - FX) / 22) ** 2 + ((y - 118) / 24) ** 2 < 1, cheek = ((x - FX + 40) / 28) ** 2 + ((y - 116) / 22) ** 2 < 1 || ((x - FX - 40) / 28) ** 2 + ((y - 116) / 22) ** 2 < 1;
    return nose ? 0.17 : cheek ? 0.11 : 0.06;
  }, { blackheads: (x, y) => ((x - FX) / 24) ** 2 + ((y - 120) / 20) ** 2 < 1 || (y > 160 && Math.abs(x - FX) < 30) });
  yield;
  if (!rage) yield* helmet(b, 0);
  else {
    // ---- no helmet (it's gone flying): the dome under it pale as a fish, the tan line hard where the band sat; the
    // comb-over plastered across it with sweat, a few strands of it stood up straight off it (he's that mad)
    for (let y = 0; y < 72; y++) for (let x = FX - 80; x <= FX + 80; x++) {
      if (matAt(b, x, y) !== M_SKIN) continue;
      const line = 55 - Math.round(((x - FX) / 96) ** 2 * 6);
      if (y < line) shade(b, x, y, SCALP[1], y < line - 1 ? 0.62 : 0.3);
      else if (y < line + 3) shade(b, x, y, SKIN[6], 0.25);
    }
    tint(b, FX - 18, 26, 18, 10, WHITE, 0.4, M_SKIN, 0.7);
    yield;
    for (let k = 0; k < 9; k++) {
      const y0 = 64 - k * 3, s = k % 2 ? 1 : -1;
      path(b, [FX + s * 62, y0, FX + s * 30, y0 - 14 - k, FX - s * 10, y0 - 22 - k * 1.5, FX - s * 48, y0 - 20 - k], HAIR[k % 3 ? 3 : 1], 1, M_HAIR);
    }
    for (let k = 0; k < 5; k++) { const x = FX - 16 + k * 8; path(b, [x, 22 + (k % 2) * 3, x + (rnd() - 0.5) * 4, 10, x + (rnd() - 0.5) * 6, -2], HAIR[k % 2 ? 2 : 4], 1, M_HAIR); }
    yield;
    // (the veins up it: one forked up the middle of his forehead, one up each temple, fat and throbbing)
    vein(b, [FX - 4, 84, FX - 6, 70, FX - 2, 56, FX - 8, 42, FX - 6, 28], RAGE_VEIN, 3);
    vein(b, [FX - 7, 56, FX + 8, 46, FX + 12, 34], RAGE_VEIN, 2);
    for (const s of [-1, 1]) vein(b, [FX + s * 56, 104, FX + s * 54, 88, FX + s * 50, 70, FX + s * 46, 52], RAGE_VEIN, 2);
    // (sweat pouring off the dome)
    for (let k = 0; k < 16; k++) { const x = FX - 50 + rnd() * 100, y = 22 + rnd() * 48; if (matAt(b, x, y) === M_SKIN) bead(b, x, y, 1.4 + rnd() * 1.8, SCALP); }
  }
  yield;
  // ---- sweat: beads in a row under the brim, on the nose, the lip; tracks down the temples
  for (let k = 0; k < 14; k++) { const x = FX - 50 + rnd() * 100, y = 70 + rnd() * 5; if (matAt(b, x, y) === M_SKIN) bead(b, x, y, 1.4 + rnd() * 1.6, SKIN); }
  bead(b, FX + 6, 110, 1.8, BURNT); bead(b, FX - 12, 144, 1.3, SKIN); bead(b, FX + 14, 146, 1.2, SKIN);
  for (const s of [-1, 1]) { path(b, [FX + s * 58, 80, FX + s * 61, 96, FX + s * 60, 112, FX + s * 62, 124], mixU(SKIN[1], WHITE, 0.5), 2, undefined, M_SKIN); bead(b, FX + s * 62, 126, 2.2, SKIN); }
  return b;
}
/** His mouth wide open, yelling (`wide`: the jaw right down; else half shut, between words): the buck teeth hanging
 *  off the top, the bottom row (yellow, one gone), the tongue up, the uvula, spit strung top to bottom, the lips
 *  stretched round it chapped and wet. */
const yellMouth = (b: Buf, wide: boolean, SKIN: number[]) => {
  const cx = FX + 2, top = 146, bot = wide ? 186 : 172, rx = wide ? 30 : 32, cy = (top + bot) / 2, ry = (bot - top) / 2;
  // (the hole: deepest at the back, the throat)
  for (let y = top; y <= bot; y++) for (let x = cx - rx; x <= cx + rx; x++) {
    const u = (x - cx) / rx, v = (y - cy) / ry, d = u * u + v * v;
    if (d > 1) continue;
    plot(b, x, y, MOUTH[Math.min(5, Math.round((1 - d) * 4 + (bay(x, y) < 0.5 ? 0 : 0.5)))], M_MOUTH);
  }
  // (the uvula, swinging, and the throat behind it)
  if (wide) { ball(b, cx, top + 14, 4, 6, R('#FF9AAC', '#E8708A', '#C84E6C', '#9A3050', '#5A1028'), { mat: M_OTHER, line: true, lw: 0.7 }); }
  // (the tongue: up off the floor of it, curled, a white coat on it)
  ball(b, cx - 2, bot - ry * 0.35, rx * 0.72, ry * 0.42, TONGUE, { mat: M_OTHER, only: (x, y) => matAt(b, x, y) === M_MOUTH, line: (_dx, dy) => dy < 0, lw: 0.8 });
  for (let k = 0; k < 14; k++) { const x = cx - 14 + rnd() * 24, y = bot - ry * 0.55 + rnd() * 4; if (matAt(b, x, y) === M_OTHER) plot(b, x, y, hexU('#F4E8EC')); }
  path(b, [cx - 1, bot - ry * 0.7, cx - 2, bot - ry * 0.3], TONGUE[4], 1);
  // (the teeth: the bottom row, then the two buck ones hanging down off the gums over it)
  teeth(b, cx - rx + 6, cx + rx - 6, (x) => bot - 1 - ((x - cx) / rx) ** 2 * 3, -1, 6, { tw: 6, gaps: [3], rot: [1, 5] });
  for (let x = cx - rx; x <= cx + rx; x++) { const t = top + Math.round(((x - cx) / rx) ** 2 * ry * 0.7); for (let y = t; y < t + 3; y++) if (matAt(b, x, y) === M_MOUTH) plot(b, x, y, GUM[y === t ? 3 : 1], M_OTHER); }
  for (const s of [-1, 1]) {
    const x0 = cx + (s < 0 ? -11 : 0), t = top + 2;
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 11; xx++) {
      if (yy > 13 && (xx === 0 || xx === 10)) continue;
      if (s > 0 && yy > 11 && xx > 6 && xx - 6 > 13 - yy) continue; // (the chip)
      const k = xx === 0 ? 0 : xx > 8 ? 3 : yy > 11 ? 2 : 1;
      plot(b, x0 + xx, t + yy, (xx === 10 || yy === 15) ? TOOTH[5] : TOOTH[bay(x0 + xx, t + yy) > 0.85 && k < 3 ? k + 1 : k], M_OTHER);
    }
    seg(b, x0 + 1, t + 1, x0 + 1, t + 8, WHITE, 1);
  }
  seg(b, cx, top + 2, cx, top + 17, TOOTH_B[5]);
  // (spit, strung from the top teeth to the bottom ones, and pooled on the lip)
  for (const [x, w] of [[cx - 20, 1], [cx + 16, 1], [cx + 22, 1]] as const) path(b, [x, top + 8, x + 1, cy, x - 1, bot - 6], hexU('#E8F0F8'), w);
  // (the lips round it: stretched thin, chapped, wet)
  for (let y = top - 4; y <= bot + 5; y++) for (let x = cx - rx - 5; x <= cx + rx + 5; x++) {
    const u = (x - cx) / (rx + 4), v = (y - cy) / (ry + 4), d = u * u + v * v;
    if (d > 1 || matAt(b, x, y) === M_MOUTH || matAt(b, x, y) === M_OTHER) continue;
    const lit = v < 0 ? (d > 0.86 ? 4 : 2) : d > 0.86 ? 4 : bay(x, y) < 0.5 ? 1 : 2;
    plot(b, x, y, LIP[lit], M_OTHER);
  }
  for (let x = cx - rx; x <= cx + rx; x += 4) if (hash2(x, 9) > 0.5) seg(b, x, bot + 2, x + 1, bot + 4, LIP[4]);
  seg(b, cx - 14, bot + 3, cx - 6, bot + 3, WHITE); seg(b, cx + 8, top - 2, cx + 12, top - 2, WHITE);
  // (the folds from his nose round it, cut deep)
  for (const s of [-1, 1]) path(b, [cx + s * 22, top - 14, cx + s * (rx + 8), cy - 4, cx + s * (rx + 6), bot + 2], SKIN[6], 1, undefined, M_SKIN);
};

/** The nasty grin: ear to ear, up at the corners, every yellow tooth out (the buck ones over the bottom row), the
 *  gums, the cheeks bunched up round it, the dimples. */
const grinMouth = (b: Buf, SKIN: number[]) => {
  const cx = FX + 2, hw = 36;
  const top = (x: number) => { const u = (x - cx) / hw; return 150 - 12 * u * u; };
  const bot = (x: number) => { const u = (x - cx) / hw; return 168 - 30 * u * u; };
  for (let x = cx - hw; x <= cx + hw; x++) for (let y = Math.floor(top(x)); y <= bot(x); y++) plot(b, x, y, MOUTH[Math.min(4, 1 + Math.round((y - top(x)) / 3))], M_MOUTH);
  // (the gums, then the teeth: the bottom row up off its gum, the top along the top, the two buck ones down over it)
  for (let x = cx - hw; x <= cx + hw; x++) { const t = Math.round(top(x)); for (let y = t; y < t + 2; y++) if (matAt(b, x, y) === M_MOUTH) plot(b, x, y, GUM[y === t ? 3 : 1], M_OTHER); }
  teeth(b, cx - hw + 4, cx + hw - 4, (x) => bot(x) - 1, -1, 5, { tw: 6, gaps: [6], rot: [2, 8] });
  teeth(b, cx - hw + 4, cx + hw - 4, (x) => top(x) + 2, 1, 6, { tw: 6, rot: [1], gold: [9] });
  for (const s of [-1, 1]) {
    const x0 = cx + (s < 0 ? -11 : 0), t = Math.round(top(x0 + 5)) + 2;
    for (let yy = 0; yy < 14; yy++) for (let xx = 0; xx < 11; xx++) {
      if (yy > 11 && (xx === 0 || xx === 10)) continue;
      const k = xx === 0 ? 0 : xx > 8 ? 3 : yy > 10 ? 2 : 1;
      plot(b, x0 + xx, t + yy, (xx === 10 || yy === 13) ? TOOTH[5] : TOOTH[bay(x0 + xx, t + yy) > 0.85 && k < 3 ? k + 1 : k], M_OTHER);
    }
    seg(b, x0 + 1, t + 1, x0 + 1, t + 8, WHITE, 1);
  }
  seg(b, cx, Math.round(top(cx)) + 2, cx, Math.round(top(cx)) + 15, TOOTH_B[5]);
  // (the lips round it, stretched thin; wet on the bottom one)
  for (let x = cx - hw - 2; x <= cx + hw + 2; x++) {
    const xc = Math.max(cx - hw, Math.min(cx + hw, x)), t = Math.round(top(xc)), bt = Math.round(bot(xc));
    for (let d = 1; d <= 3; d++) {
      if (matAt(b, x, t - d) === M_SKIN) plot(b, x, t - d, LIP[d === 1 ? 5 : 3], M_OTHER);
      if (matAt(b, x, bt + d) === M_SKIN) plot(b, x, bt + d, LIP[d === 1 ? 4 : d === 2 ? 2 : 3], M_OTHER);
    }
  }
  seg(b, cx - 12, bot(cx) + 2, cx - 4, bot(cx) + 2, WHITE);
  // (the cheeks bunched up at the corners, the dimples, the folds from his nose)
  for (const s of [-1, 1]) {
    ball(b, cx + s * (hw + 6), 132, 12, 10, SKIN, { mat: M_SKIN, soft: 0.5, lit: 1.1 });
    path(b, [cx + s * (hw + 2), 136, cx + s * (hw + 5), 142, cx + s * (hw + 3), 146], SKIN[6], 1, undefined, M_SKIN);
    path(b, [cx + s * 20, 126, cx + s * (hw - 2), 132, cx + s * (hw + 1), 138], SKIN[6], 1, undefined, M_SKIN);
  }
  // (spit in the corner)
  path(b, [cx + hw - 2, 138, cx + hw - 1, 142], hexU('#F0F4FA'));
};

/** His hand up, the finger wagged at him (tsk tsk): the index finger up (a dirty nail, a hangnail, knuckle hair), the
 *  rest curled, the thumb over them; the khaki cuff. (FX, 160) the bottom of the finger, where it wags from. */
function* buildFinger(): Generator<void, Buf> {
  setSeed(7070);
  const b = newBuf(), SKIN = SKIN_CALM;
  ball(b, FX, 214, 40, 22, KHAKI, { mat: M_CLOTH, line: true });
  poly(b, [FX - 26, 204, FX + 26, 204, FX + 26, 180, FX - 26, 180], SKIN, M_SKIN, { line: true, tilt: 1.2 });
  yield;
  // (the curled fingers, then the finger: up, long, its joints creased)
  ball(b, FX, 162, 38, 26, SKIN, { mat: M_SKIN, line: true, lw: 1.5 });
  for (let i = 0; i < 3; i++) { const x = FX - 8 + i * 15; ball(b, x, 150, 9, 13, SKIN, { mat: M_SKIN, line: true, lit: 1.08 }); }
  poly(b, [FX - 30, 160, FX - 16, 160, FX - 16, 52, FX - 30, 52], SKIN, M_SKIN, { line: true, tilt: 1.3 });
  ball(b, FX - 23, 52, 8, 9, SKIN, { mat: M_SKIN, line: (_dx, dy) => dy < 0.2, lit: 1.1 });
  for (const y of [84, 118]) { path(b, [FX - 29, y, FX - 23, y + 2, FX - 17, y], SKIN[6], 1, undefined, M_SKIN); path(b, [FX - 28, y + 3, FX - 18, y + 3], SKIN[5], 1, undefined, M_SKIN); }
  yield;
  // (the nail: long, dirt under it, a hangnail)
  const NAIL = R('#FFF0E8', '#F4D4C8', '#E0B4A8', '#C08C80', '#8A5A50', '#4A2A24');
  ball(b, FX - 23, 50, 5, 6, NAIL, { mat: M_OTHER, line: true, lw: 0.7 });
  seg(b, FX - 27, 45, FX - 19, 45, hexU('#3A2A1A')); seg(b, FX - 26, 44, FX - 20, 44, hexU('#5A4028'));
  seg(b, FX - 18, 54, FX - 15, 51, SKIN[1]);
  // (the thumb across the curled ones)
  ball(b, FX + 4, 170, 28, 10, SKIN, { mat: M_SKIN, line: true, lit: 1.06 });
  ball(b, FX + 26, 168, 6, 5, NAIL, { mat: M_OTHER, line: true, lw: 0.7 });
  yield;
  hairs(b, 30, () => { const x = FX - 30 + rnd() * 60, y = 140 + rnd() * 20; return matAt(b, x, y) === M_SKIN ? [x, y] as [number, number] : null; }, 4, -Math.PI / 2 - 0.4, HAIRLINE, M_SKIN);
  for (let k = 0; k < 30; k++) { const x = FX + (rnd() - 0.5) * 70, y = 60 + rnd() * 130; if (matAt(b, x, y) === M_SKIN) plot(b, x, y, SKIN[5]); }
  skinPost(b, SKIN[7], () => 0.07);
  tint(b, FX - 23, 70, 6, 10, BURNT_CALM[3], 0.4, M_SKIN, 0.6);
  return b;
}

/** His helmet, painted `o` down (0 on his head; HAT_DY for the 'hat' stamp: the whole dome on the buffer). The brim's
 *  shadow goes on whatever skin's under it. */
function* helmet(b: Buf, o: number): Generator<void, void> {
  // ---- the helmet: the dome down to his brows, the band sweated through, the brim; cracked, taped, scuffed, a dead bug
  ball(b, FX, 30 + o, 96, 56, HELMET, { mat: M_OTHER, line: true, lw: 1.5, only: (x, y) => y - o < 50 - ((x - FX) / 96) ** 2 * 6 });
  yield;
  // (the ventilator button on top, the seam)
  ball(b, FX, -18 + o, 10, 6, HELMET, { mat: M_OTHER, line: true });
  path(b, [FX, -12 + o, FX - 2, 10 + o, FX - 3, 34 + o], HELMET[6], 1);
  for (let x = FX - 96; x <= FX + 96; x++) {
    const y = 46 + o + Math.round(((x - FX) / 96) ** 2 * -6);
    for (let d = 0; d < 9; d++) plot(b, x, y + d, BAND[d === 0 || d === 8 ? 5 : d < 3 ? 1 : d < 6 ? 2 : 3], M_OTHER);
    if (hash2(x, 3) > 0.7) plot(b, x, y + 4, BAND[0]);
  }
  yield;
  // (the band sweated dark in a tide line)
  for (let x = FX - 96; x <= FX + 96; x++) { const y0 = 46 + o + Math.round(((x - FX) / 96) ** 2 * -6); for (let d = 4; d < 8; d++) if (bay(x, y0 + d) < 0.6) plot(b, x, y0 + d, BAND[4]); }
  yield;
  // (the brim: wide, its underside in shadow over his forehead)
  for (let x = FX - 136; x <= FX + 136; x++) {
    const u = (x - FX) / 136, yb = 56 + o - Math.round(u * u * 12);
    const th = Math.round(6 + 7 * (1 - u * u));
    for (let d = 0; d < th; d++) { const q = d / th; plot(b, x, yb + d, HELMET[d === 0 ? 0 : q < 0.3 ? 2 : q < 0.55 ? (bay(x, yb + d) < 0.5 ? 3 : 4) : d < th - 1 ? 5 : 7], M_OTHER); }
  }
  for (let x = FX - 70; x <= FX + 70; x++) for (let d = 0; d < 6; d++) { const y = 69 + o - Math.round(((x - FX) / 136) ** 2 * 16) + d; if (matAt(b, x, y) === M_SKIN && bay(x, y) < 0.6 - d * 0.1) shade(b, x, y, DARK, 0.35); }
  yield;
  // (the crack, from the brim up across the dome, and the duct tape over it (silver, crinkled, peeling at a corner))
  const crack: number[] = [];
  { let x = FX + 30, y = 52 + o; crack.push(x, y); for (let k = 0; k < 9; k++) { x += 2 + rnd() * 5; y -= 5 + rnd() * 3; crack.push(x, y); } }
  path(b, crack, HELMET[7], 1);
  poly(b, [FX + 26, 18 + o, FX + 62, 8 + o, FX + 66, 22 + o, FX + 30, 32 + o], TAPE, M_METAL);
  for (let k = 0; k < 8; k++) { const x = FX + 30 + k * 4.4; seg(b, x, 20 + o - k * 1.2, x + 2, 30 + o - k * 1.2, TAPE[k % 2 ? 0 : 3]); }
  poly(b, [FX + 62, 8 + o, FX + 70, 4 + o, FX + 68, 14 + o], TAPE, M_METAL);
  poly(b, [FX - 60, 6 + o, FX - 34, -6 + o, FX - 30, 4 + o, FX - 56, 16 + o], TAPE, M_METAL);
  yield;
  // (scuffs, a gouge; a squashed bug on it, its leg and a smear of blood)
  for (let k = 0; k < 30; k++) { const x = FX + (rnd() - 0.5) * 170, y = -10 + o + rnd() * 56; if (matAt(b, x, y) === M_OTHER) seg(b, x, y, x + 3 + rnd() * 5, y + (rnd() - 0.5) * 2, HELMET[5]); }
  ball(b, FX - 40, 30 + o, 4, 3, R('#3A2A1A', '#2A1A0E', '#1A1008', '#0A0602', '#000000'), { mat: M_OTHER });
  tint(b, FX - 36, 32 + o, 6, 3, BLOOD[2], 0.6, M_OTHER, 0.5);
  for (const [dx, dy] of [[-5, -3], [-6, 2], [4, 4], [5, -2]] as const) seg(b, FX - 40, 30 + o, FX - 40 + dx, 30 + o + dy, hexU('#1A1008'));
}

/** The helmet alone (flying off him). */
function* buildHat(): Generator<void, Buf> {
  setSeed(5150);
  const b = newBuf();
  yield* helmet(b, HAT_DY);
  return b;
}

/** His fist, shaken at the camera: the knuckles (hairy, skinned), the fingers curled, the thumb across, nails bitten,
 *  sunburnt to the cuff; the khaki sleeve rolled. (FX, FY) the middle of it. */
function* buildFist(): Generator<void, Buf> {
  setSeed(6060);
  const b = newBuf(), SKIN = SKIN_RAGE;
  // (the sleeve, rolled at the forearm; the forearm up out of it)
  ball(b, FX + 10, 196, 54, 30, KHAKI, { mat: M_CLOTH, line: true });
  for (let k = 0; k < 3; k++) path(b, [FX - 40, 176 + k * 6, FX + 10, 172 + k * 6, FX + 60, 178 + k * 6], KHAKI[5], 1, undefined, M_CLOTH);
  yield;
  poly(b, [FX - 34, 176, FX + 38, 176, FX + 34, 128, FX - 30, 128], SKIN, M_SKIN, { line: true, tilt: 1.2 });
  vein(b, [FX - 10, 176, FX - 6, 160, FX - 12, 144, FX - 8, 132], RAGE_VEIN, 2);
  vein(b, [FX + 14, 176, FX + 18, 158, FX + 12, 140], RAGE_VEIN, 2);
  yield;
  // (the fist: the back of the hand, a knuckle a finger, the fingers curled under in a row)
  ball(b, FX, 96, 58, 46, SKIN, { mat: M_SKIN, line: true, lw: 1.5 });
  yield;
  for (let i = 0; i < 4; i++) {
    const x = FX - 39 + i * 26;
    ball(b, x, 66 + Math.abs(i - 1.5) * 3, 15, 13, SKIN, { mat: M_SKIN, line: (_dx, dy) => dy < 0.2, lit: 1.12 });
    ball(b, x, 104, 13, 20, SKIN, { mat: M_SKIN, line: true });
    path(b, [x - 9, 100, x, 97, x + 9, 100], SKIN[6], 1, undefined, M_SKIN);
    // (the nails, chewed to the quick)
    ball(b, x + 2, 120, 6, 4, R('#FFE8E0', '#F8C8C0', '#E8A8A0', '#C88480', '#9A5A58', '#5A2A28'), { mat: M_OTHER, line: true, lw: 0.7 });
    // (skinned knuckles, scabbed)
    if (i % 2 === 0) { tint(b, x, 62, 5, 3, BLOOD[1], 0.6, M_SKIN, 0.4); plot(b, x - 1, 62, BLOOD[3]); plot(b, x + 1, 61, BLOOD[4]); }
  }
  yield;
  // (the thumb across the front, its nail)
  ball(b, FX - 6, 130, 36, 13, SKIN, { mat: M_SKIN, line: true, lit: 1.08 });
  ball(b, FX + 24, 128, 8, 7, R('#FFE8E0', '#F8C8C0', '#E8A8A0', '#C88480', '#9A5A58', '#5A2A28'), { mat: M_OTHER, line: true, lw: 0.7 });
  path(b, [FX - 30, 134, FX - 10, 138, FX + 12, 136], SKIN[6], 1, undefined, M_SKIN);
  yield;
  // (hairs on the knuckles and the back of the hand, freckles, the pores)
  hairs(b, 60, () => { const x = FX - 50 + rnd() * 100, y = 50 + rnd() * 30; return matAt(b, x, y) === M_SKIN ? [x, y] : null; }, 5, -Math.PI / 2 - 0.3, HAIRLINE, M_SKIN);
  for (let k = 0; k < 40; k++) { const x = FX + (rnd() - 0.5) * 110, y = 60 + rnd() * 100; if (matAt(b, x, y) === M_SKIN) plot(b, x, y, SKIN[5]); }
  skinPost(b, SKIN[7], () => 0.08);
  for (let k = 0; k < 8; k++) { const x = FX - 40 + rnd() * 80, y = 70 + rnd() * 50; if (matAt(b, x, y) === M_SKIN) bead(b, x, y, 1.3 + rnd(), SKIN); }
  return b;
}

/** (is that pixel on his lips) */
const pxAtLip = (b: Buf, x: number, y: number) => { const v = b.px[y * GW + x]; return v === LIP[1] || v === LIP[2] || v === LIP[0]; };

const get = stamps<Key>(build, ['a', 'b', 'rc', 'r', 'r2', 'hat', 'fist', 't', 't2', 'finger']);
/** One of his stamps (its canvas; null headless), and whether it's painted yet (never paint one the frame it's wanted). */
export const artieStamp = (key: Key) => get(key).img;
export const artieStampReady = (key: Key) => get.ready(key);
/** Where his face's middle is on the buffer. */
export const ARTIE_FX = FX, ARTIE_FY = FY;

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
