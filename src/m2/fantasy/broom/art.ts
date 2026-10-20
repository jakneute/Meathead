// The broomstick deathmatch's figures (the SNES pass): MEATHEAD from behind, riding his broom (astride the shaft as he
// got on it at the runway, his fists on it ahead, knees out, boots tucked back by the bristles: the riding pose from
// 7b18744a, kept exactly), the rig leaning into his turns, tucked low on a boost, sat up braking, the bristles fanned
// under him and the sparkle trail off them; his jeans' seat or his bare backside (shat: the stain; naked: the balls over
// the shaft and the BONER poking out past his hip, further the harder he banks). Stepped everywhere now: the ash shaft
// and its grain, leather grips under his fists, a brass ferrule, the laser's emitter and its fins, the binding's twine
// in bands, the bristles in straw ramps; denim in six steps (seams, the yoke, pocket stitching, creases at the knees),
// stepped boots (heel, sole, a pull tab); skin in six steps (shoulder blades, the spine's groove, lats, deltoids,
// forearms), the hair in clumps, ears with their shade. The suitors side-on astride their brooms (fantasy/suitors.ts
// 'ride', keep/runway.ts's broom, the ride's survivors still in their boutique tiaras), painted once per look and
// facing, drawn through their copies by depth. Their throws, the wand bolts, the dead on the lawn.

import { drawSuitor, type SuitorLook } from '../suitors';
import { drawBroom } from '../keep/runway';
import { INK } from '../kit';
import { drawMipped } from './sprites';

type Ctx = CanvasRenderingContext2D;

const box = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2); c.fill(); };
const poly = (c: Ctx, col: string, p: number[]) => { c.fillStyle = col; c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.closePath(); c.fill(); };
const line = (c: Ctx, col: string, w: number, p: number[]) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.stroke(); };

// ---------------------------------------------------------------------------------------------------------------
// Him, from behind

const SK = ['#4A2410', '#7A4220', '#A86630', '#E0AC69', '#EEC48E', '#F8DCB4'];
const JE = ['#0A1028', '#13204A', '#1E3A8A', '#2C50AA', '#4468C0', '#6A8AD4'];
const BUM = ['#B8805A', '#D8A07A', '#EEC4A0', '#F8DCC0'];
const HAIR = ['#0A0A0E', '#18181B', '#2A2A30', '#3E3E46'];
const ASH = ['#3A2412', '#5A3A1E', '#8A5A30', '#A87440', '#C8965A', '#E2B47A'];
const STRAW = ['#6A4A1A', '#8A6428', '#B08A3A', '#D8B060', '#F0D080', '#FFF0B0'];
const BOOT = ['#0E0806', '#1A120C', '#2A1E16', '#3A2E26', '#4A3A2E', '#6A5646'];
const STEEL = ['#2A2A38', '#4A4A5C', '#6A6A80', '#8A8AA0', '#AAAAC0', '#D2D2E2'];
const STITCH = '#C8962E';

export interface MhLook { bank: number; pitch: number; nude: boolean; shat: boolean; boost: boolean; brake?: boolean; fire: number; blink: boolean; f: number; charge?: number; locked?: boolean }

/** Him on his broom, from behind, RIDING it: sat astride the shaft at (x, y) on the view (400x300 space), the shaft
 *  between his legs running off ahead (up the screen: it points away) to the laser on its tip, his fists on it ahead
 *  of him, his knees out and bent, boots tucked back by the bristles (their soles at us), the bristles fanned toward
 *  us under him. `bank` -1..1 (the whole rig leans into the turn), `pitch` (climbing tilts the tip up and sits him
 *  back), `boost` (tucked low, head down), `brake` (sat up, fists pulled in), `fire` frames since a shot. */
export const drawMeatheadBroom = (c: Ctx, x: number, y: number, k: number, L: MhLook) => {
  if (L.blink && (L.f >> 2) % 2) return;
  c.save(); c.translate(x, y); c.scale(k, k);
  const tuck = L.boost ? 1 : 0, up = L.brake && !L.boost ? 1 : 0, pt = Math.max(-1, Math.min(1, L.pitch));
  // (the whole rig leans into the turn about his seat)
  c.rotate(L.bank * 0.3);
  // THE BROOM: the shaft from the binding under him (toward us) off ahead between his legs to the tip
  c.save();
  const tipY = -104 - pt * 12 + tuck * 6;
  poly(c, INK, [-4, 12, 4, 12, 2.2, tipY, -2.2, tipY]);
  poly(c, ASH[2], [-3, 12, 3, 12, 1.4, tipY + 1, -1.4, tipY + 1]);
  poly(c, ASH[4], [-3, 12, -1, 12, -0.6, tipY + 1, -1.4, tipY + 1]);
  poly(c, ASH[1], [1.6, 12, 3, 12, 1.4, tipY + 1, 0.8, tipY + 1]);
  box(c, -1, tipY + 1, 0.6, 11 - tipY, ASH[5]);
  for (let yy = tipY + 8; yy < 10; yy += 7) box(c, -1.6, yy, 2.4, 1, ASH[1]);
  // (a brass ferrule under the emitter)
  box(c, -3, tipY + 4, 6, 3, INK); box(c, -2.6, tipY + 4.5, 5.2, 2, '#C8962A'); box(c, -2.6, tipY + 4.5, 1.6, 2, '#FFF0A8');
  // (the LASER on its end (the user's): a steel emitter clamped on, cooling fins, the pink lens glowing; a flash when it
  // fires; X held, it charges, glowing bigger)
  box(c, -4.5, tipY - 2, 9, 7, INK); box(c, -3.5, tipY - 1, 7, 5, STEEL[3]); box(c, -3.5, tipY - 1, 2, 5, STEEL[5]); box(c, 1.5, tipY - 1, 2, 5, STEEL[1]);
  for (const fy of [tipY, tipY + 2]) { box(c, -5.5, fy, 11, 1, INK); box(c, -5, fy, 10, 0.6, STEEL[4]); }
  ell(c, 0, tipY - 2.5, 4, 3, INK); ell(c, 0, tipY - 2.5, 3, 2.2, (L.f >> 3) % 2 ? '#F472B6' : '#F9A8D4'); ell(c, 0.4, tipY - 2.1, 1.8, 1.2, '#DB2777'); box(c, -1.2, tipY - 3.6, 1, 1, '#FFFFFF');
  const ch = L.charge ?? 0;
  if (ch > 0) { c.globalAlpha = 0.35 + 0.25 * ((L.f >> 1) % 2); ell(c, 0, tipY - 2, 4 + ch * 8, 4 + ch * 8, L.locked ? '#EF4444' : '#F472B6'); c.globalAlpha = 0.6; ell(c, 0, tipY - 2, 3 + ch * 5, 3 + ch * 5, L.locked ? '#FCA5A5' : '#FBCFE8'); c.globalAlpha = 1; ell(c, 0, tipY - 2, 2.5, 2.5, '#FFFFFF');
    for (let i = 0; i < 4; i++) { const a = L.f * 0.2 + i * 1.571, r = 6 + ch * 8; box(c, Math.cos(a) * r - 0.5, tipY - 2 + Math.sin(a) * r - 0.5, 1, 1, '#FFFFFF'); } }
  if (L.fire < 4) { ell(c, 0, tipY - 2, 9 - L.fire * 2, 9 - L.fire * 2, '#FFE4F2'); ell(c, 0, tipY - 2, 5, 5, '#FFFFFF'); for (let i = 0; i < 4; i++) { const a = i * 1.571 + 0.785; line(c, '#FFFFFF', 1, [Math.cos(a) * 5, tipY - 2 + Math.sin(a) * 5, Math.cos(a) * (11 - L.fire * 2), tipY - 2 + Math.sin(a) * (11 - L.fire * 2)]); } }
  // (the binding: twine in red and gold bands; the bristles fanned out toward us in straw steps; a sparkle trail)
  box(c, -9, 11, 18, 7, INK); for (let b = 0; b < 3; b++) { box(c, -8, 12 + b * 2, 16, 1, b % 2 ? '#F2C84A' : '#B91C1C'); box(c, -8, 13 + b * 2, 16, 1, b % 2 ? '#C8962A' : '#7F1D1D'); }
  box(c, -8, 12, 3, 5, '#FFFFFF33');
  poly(c, INK, [-10, 17, 10, 17, 31, 49, -31, 49]);
  poly(c, STRAW[3], [-9, 18, 9, 18, 29, 48, -29, 48]);
  poly(c, STRAW[4], [-9, 18, -3, 18, -12, 48, -29, 48]);
  poly(c, STRAW[5], [-9, 18, -6, 18, -20, 48, -27, 48]);
  poly(c, STRAW[2], [4, 18, 9, 18, 29, 48, 16, 48]);
  poly(c, STRAW[1], [7, 18, 9, 18, 29, 48, 24, 48]);
  for (let s = -7; s <= 7; s++) line(c, s % 3 === 0 ? STRAW[1] : STRAW[2], 0.7, [s * 1.2, 19, s * 4.2, 47]);
  for (let s = -28; s <= 28; s += 4) { box(c, s, 47, 2, 2 + (s & 4 ? 1 : 0), s < 0 ? STRAW[4] : STRAW[2]); }
  box(c, -27, 45, 54, 1, STRAW[1]);
  for (let i = 0; i < 6; i++) { const sx = Math.sin(L.f * 0.31 + i * 1.7) * 22, sy = 51 + ((L.f * 2 + i * 9) % 26); box(c, sx - 1, sy, 3, 1, i % 2 ? '#FFF6C8' : '#FFC8E8'); box(c, sx, sy - 1, 1, 3, i % 2 ? '#FFF6C8' : '#FFC8E8'); }
  if (L.boost) for (let i = 0; i < 5; i++) { const sx = (i - 2) * 9 + Math.sin(L.f + i) * 3; line(c, '#F59E0B', 3, [sx, 52, sx * 1.4, 66 + (L.f * 3 + i * 7) % 14]); line(c, '#FDE68A', 1.6, [sx, 52, sx * 1.4, 68 + (L.f * 3 + i * 7) % 14]); }
  c.restore();
  const Lg = L.nude ? SK : JE;
  // HIS LEGS, straddling it: thighs out from the seat to the knees (bent, out to the sides and forward), shins back in
  // and down to his boots, tucked back by the binding, their soles at us
  const kx = 19 + tuck * 2 - up * 2, ky = -4 - tuck * 3;
  for (const s of [-1, 1]) {
    line(c, INK, 11, [s * 7, -6, s * kx, ky]);
    line(c, s < 0 ? Lg[3] : Lg[2], 9, [s * 7, -6, s * kx, ky]);
    line(c, s < 0 ? Lg[4] : Lg[3], 3.6, [s * 7, -9, s * (kx - 2), ky - 3]);
    line(c, Lg[5], 1.2, [s * 8, -10, s * (kx - 4), ky - 4]);
    line(c, Lg[1], 1.6, [s * 7, -2, s * (kx - 1), ky + 3]);
    if (!L.nude) { line(c, STITCH, 0.7, [s * 8, -4, s * (kx - 1), ky + 2]); for (let w = 0; w < 3; w++) line(c, JE[1], 0.8, [s * (kx - 6 + w * 2), ky - 2, s * (kx - 4 + w * 2), ky + 3]); }
    else { ell(c, s * (kx - 1), ky - 1, 3, 2, SK[4]); }
  }
  for (const s of [-1, 1]) {
    const fx = s * 12, fy = 12;
    line(c, INK, 10, [s * kx, ky, fx, fy]);
    line(c, s < 0 ? Lg[3] : Lg[2], 8, [s * kx, ky, fx, fy]);
    line(c, s < 0 ? Lg[4] : Lg[3], 2.4, [s * (kx - 2), ky + 1, fx - s * 2, fy - 2]);
    if (!L.nude) { line(c, STITCH, 0.6, [s * (kx + 1), ky + 1, fx + s * 3, fy - 3]); box(c, fx - 4, fy - 4, 8, 2, JE[1]); }
    // (the boot from behind: the shaft's leather in steps, the pull tab, the heel and the sole at us)
    box(c, fx - 5, fy - 3, 10, 10, INK);
    box(c, fx - 4, fy - 2, 8, 8, BOOT[2]); box(c, fx - 4, fy - 2, 2, 8, BOOT[4]); box(c, fx + 2, fy - 2, 2, 8, BOOT[1]);
    box(c, fx - 1, fy - 3, 2, 2, BOOT[5]);
    box(c, fx - 4, fy + 3, 8, 3, BOOT[3]); box(c, fx - 4, fy + 3, 8, 1, BOOT[5]); box(c, fx - 3, fy + 5, 6, 1, BOOT[0]);
    for (let n = -3; n < 4; n += 2) box(c, fx + n, fy + 4, 1, 1, BOOT[1]);
  }
  // THE SEAT on the shaft: jeans (the yoke, the pockets and their stitching) or bare; the stain; the balls over the shaft
  if (L.nude) {
    ell(c, -6, -9, 7, 6.5, BUM[2]); ell(c, 6, -9, 7, 6.5, BUM[1]); ell(c, -8, -12, 3, 2.4, BUM[3]); ell(c, 8, -6, 3, 2.2, BUM[0]); box(c, -0.5, -15, 1, 10, '#8A5A3A');
    ell(c, -2, -1, 2.8, 3, SK[2]); ell(c, 2, -0.6, 2.8, 3, SK[1]); ell(c, -2.4, -2, 1, 1, SK[4]);
    if (L.shat) { ell(c, 0, -7, 4.5, 3.2, '#5C3A16'); ell(c, -1, -8, 2, 1.4, '#7A5222'); box(c, -1, -5, 2, 3 + ((L.f >> 3) % 3), '#5C3A16'); }
  } else {
    box(c, -14, -17, 28, 13, JE[3]); box(c, -14, -17, 4, 13, JE[4]); box(c, -14, -17, 1, 13, JE[5]); box(c, 10, -17, 4, 13, JE[2]); box(c, 13, -17, 1, 13, JE[1]);
    poly(c, JE[2], [-14, -17, 14, -17, 14, -14, 0, -12, -14, -14]); line(c, STITCH, 0.6, [-14, -14, 0, -12, 14, -14]);
    box(c, -0.6, -12, 1.2, 8, JE[1]); line(c, STITCH, 0.5, [-1.4, -12, -1.4, -4]);
    for (const s of [-1, 1]) { box(c, s * 7 - 4, -11, 8, 6, JE[2]); box(c, s * 7 - 4, -11, 8, 1, JE[4]); line(c, STITCH, 0.5, [s * 7 - 3.5, -10.5, s * 7 - 3.5, -5.5, s * 7, -4.5, s * 7 + 3.5, -5.5, s * 7 + 3.5, -10.5]); line(c, STITCH, 0.4, [s * 7 - 2, -8, s * 7, -9, s * 7 + 2, -8]); }
    box(c, -14, -6, 28, 2, JE[1]);
    if (L.shat) { ell(c, 0, -9, 9, 5, '#6A4418'); ell(c, 0, -8, 5, 3, '#4A2E0E'); ell(c, -3, -10, 2, 1.2, '#8A5A2A'); box(c, -2, -5, 2, 3 + ((L.f >> 3) % 3), '#5C3A16'); }
  }
  // (THE BONER, naked: poking out past his hip on the outside of the turn, further the harder he banks)
  if (L.nude) {
    const side = L.bank > 0.04 ? -1 : 1, len = 7 + Math.min(1, Math.abs(L.bank)) * 10;
    const bx = side * 12, by = -6;
    line(c, INK, 5, [side * 5, by + 1, bx + side * len, by - 3 - len * 0.35]);
    line(c, '#E89A86', 3.4, [side * 5, by + 1, bx + side * len, by - 3 - len * 0.35]);
    line(c, '#F4B8A4', 1.2, [side * 5, by, bx + side * len, by - 4 - len * 0.35]);
    ell(c, bx + side * (len + 1), by - 4 - len * 0.35, 2.6, 2.2, '#C8505A'); ell(c, bx + side * (len + 0.6), by - 4.6 - len * 0.35, 1, 0.8, '#E87A80');
  }
  // HIS BACK, leaned forward over the shaft (shorter the lower he's tucked; taller sat up or climbing)
  const torsoH = 30 - tuck * 8 + up * 9 + pt * 3, wY = -15, sY = wY - torsoH;
  const hy = sY - 7 + tuck * 3 - up * 2, handY = up ? sY + 2 : hy - 14 - tuck * 2;
  // (his arms: elbows out, forearms in to both fists on the shaft ahead of him; sat up they're pulled in to his chest)
  for (const s of [-1, 1]) {
    const ex = s * (27 - up * 3 + tuck * 2), ey = sY - 4 + up * 8 - L.bank * s * 3, fx = s * (up ? 7 : 3.5), fy = handY - (s > 0 && !up ? 4 : 0);
    line(c, INK, 8, [s * 16, sY + 3, ex, ey, fx, fy]);
    line(c, s < 0 ? SK[4] : SK[3], 6, [s * 16, sY + 3, ex, ey, fx, fy]);
    line(c, s < 0 ? SK[5] : SK[4], 2, [s * 16, sY + 1, ex - s * 1, ey - 2]);
    line(c, SK[2], 1.6, [ex, ey + 2, (ex + fx) / 2, (ey + fy) / 2 + 2]);
    ell(c, ex, ey, 2, 1.6, s < 0 ? SK[5] : SK[4]);
    if (!up) {
      // (the fist round a leather grip on the shaft)
      box(c, fx - 3, fy - 4, 6, 8, INK); box(c, fx - 2.4, fy - 3.4, 4.8, 6.8, '#5A2A0C'); for (let w = 0; w < 3; w++) box(c, fx - 2.4, fy - 3 + w * 2.4, 4.8, 0.8, '#8A4A1C');
      ell(c, fx, fy, 4.2, 3.6, INK); ell(c, fx, fy, 3.4, 2.8, SK[3]); ell(c, fx - 1, fy - 0.8, 2, 1.4, SK[4]);
      for (let n = -1; n <= 1; n++) box(c, fx + n * 1.2 - 0.3, fy + 1, 0.6, 1.4, SK[1]);
      box(c, fx - 2, fy - 1, 4, 1, SK[2]);
    }
  }
  if (!L.nude) { box(c, -15, wY - 3, 30, 5, '#3A1A06'); box(c, -15, wY - 3, 30, 4, '#5A2A0C'); box(c, -15, wY - 3, 30, 1, '#8A4A1C'); for (const lx of [-11, -4, 3, 10]) { box(c, lx, wY - 4, 2, 6, JE[2]); box(c, lx, wY - 4, 1, 6, JE[4]); } }
  poly(c, INK, [-14, wY - 1, 14, wY - 1, 20, sY + 8, 18, sY - 1, -18, sY - 1, -20, sY + 8]);
  poly(c, SK[3], [-13, wY - 2, 13, wY - 2, 19, sY + 8, 17, sY, -17, sY, -19, sY + 8]);
  poly(c, SK[4], [-13, wY - 2, -1, wY - 2, -1, sY, -17, sY, -19, sY + 8]);
  poly(c, SK[2], [9, wY - 2, 13, wY - 2, 19, sY + 8, 17, sY, 13, sY, 14, sY + 8]);
  poly(c, SK[1], [12, wY - 2, 13, wY - 2, 19, sY + 8, 18, sY + 4]);
  // (the lats flaring, the spine's groove, the shoulder blades, the traps, the small of his back)
  line(c, SK[2], 1.2, [-12, wY - 4, -16, sY + 10]); line(c, SK[2], 1.2, [12, wY - 4, 16, sY + 10]);
  box(c, -1, sY + 2, 2, wY - sY - 4, SK[2]); box(c, -0.4, sY + 4, 0.8, wY - sY - 8, SK[1]);
  ell(c, -8, sY + 6, 5, 3.4, SK[5]); ell(c, 7.5, sY + 6, 4.6, 3.2, SK[4]); ell(c, -9, sY + 9, 3, 1, SK[2]); ell(c, 8, sY + 9, 3, 1, SK[2]);
  poly(c, SK[4], [-6, sY + 1, 6, sY + 1, 3, sY - 2, -3, sY - 2]);
  ell(c, -3, wY - 5, 2.4, 1.2, SK[2]); ell(c, 3, wY - 5, 2.4, 1.2, SK[2]);
  // (his neck and the back of his head, ducked down on a boost: the short dark hair in clumps, the ears)
  box(c, -5, hy + 4, 10, sY - hy - 2, SK[2]); box(c, -5, hy + 4, 3, sY - hy - 2, SK[3]); box(c, -3, sY - 3, 6, 1, SK[1]);
  ell(c, 0, hy, 9, 10, INK); ell(c, 0, hy, 8, 9, SK[3]);
  ell(c, 0, hy - 3, 8, 7, HAIR[1]); box(c, -8, hy - 3, 16, 3, HAIR[1]);
  for (let i = 0; i < 7; i++) { const hx = -6 + i * 2, hyy = hy - 7 + (i % 2); box(c, hx, hyy, 1, 3, HAIR[3]); box(c, hx + 1, hyy + 1, 1, 2, HAIR[0]); }
  box(c, -5, hy - 8, 4, 1, HAIR[3]); box(c, -7, hy, 14, 1, HAIR[0]);
  for (const s of [-1, 1]) { ell(c, s * 8.5, hy + 1, 2, 3, SK[2]); ell(c, s * 8.8, hy + 1, 1, 1.8, SK[1]); box(c, s * 8.5 - (s > 0 ? 0 : 1), hy - 1, 1, 1, SK[4]); }
  if (L.boost) for (let i = 0; i < 3; i++) box(c, -6 + i * 5, hy - 10 - ((L.f + i * 3) % 4), 2, 3, HAIR[2]);
  c.restore();
};

/** Him falling off it, dead (the tumble: spinning down, the broom away from him): his jeans, his back, his head. */
export const drawMeatheadFall = (c: Ctx, x: number, y: number, k: number, rot: number, nude: boolean) => {
  c.save(); c.translate(x, y); c.scale(k, k); c.rotate(rot);
  const L = nude ? SK : JE;
  line(c, INK, 9, [-5, 6, -14, 22]); line(c, INK, 9, [5, 6, 16, 18]);
  line(c, L[2], 7, [-5, 6, -14, 22]); line(c, L[3], 7, [5, 6, 16, 18]); line(c, L[4], 2, [-4, 5, -12, 19]);
  box(c, -17, 20, 7, 6, BOOT[1]); box(c, 13, 16, 7, 6, BOOT[1]);
  box(c, -13, -17, 26, 22, INK); box(c, -12, -16, 24, 20, SK[3]); box(c, -12, -16, 6, 20, SK[4]); box(c, 7, -16, 5, 20, SK[2]); box(c, -1, -14, 2, 16, SK[2]);
  if (!nude) { box(c, -12, 2, 24, 4, L[3]); box(c, -12, 2, 24, 1, '#5A2A0C'); }
  line(c, INK, 8, [-12, -12, -26, -24]); line(c, INK, 8, [12, -12, 24, -2]);
  line(c, SK[4], 6, [-12, -12, -26, -24]); line(c, SK[3], 6, [12, -12, 24, -2]);
  ell(c, 0, -24, 9, 10, INK); ell(c, 0, -24, 8, 9, SK[3]); ell(c, 0, -27, 8, 6, HAIR[1]); box(c, -4, -31, 3, 1, HAIR[3]);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The suitors on their brooms (side-on; painted once a look and facing)

const TIARA = (c: Ctx, x: number, top: number) => {
  poly(c, INK, [x - 9, top + 4, x - 7, top - 3, x - 3, top + 1, x + 1, top - 7, x + 5, top + 1, x + 9, top - 3, x + 11, top + 4]);
  poly(c, '#F6D365', [x - 8, top + 3, x - 7, top - 1, x - 3, top + 2, x + 1, top - 5, x + 5, top + 2, x + 9, top - 1, x + 10, top + 3]);
  poly(c, '#FFF0A8', [x - 8, top + 3, x - 7, top - 1, x - 5, top + 1.5, x - 6, top + 3]);
  box(c, x - 8, top + 2, 18, 1, '#C8962A');
  box(c, x, top - 2, 3, 3, '#F472B6'); box(c, x, top - 2, 1, 1, '#FFE4F2'); box(c, x - 6, top, 2, 2, '#60A5FA'); box(c, x + 8, top, 2, 2, '#60A5FA');
};
/** The sprite's size, and where on it his broom's middle is (his place in the world). */
export const RIDER_W = 170, RIDER_H = 160, RIDER_AX = 85, RIDER_AY = 112;
const riders = new Map<string, HTMLCanvasElement>();
/** A suitor sat on his broom facing `face`; `hit` white-hot (shot), `wind` an arm up with his throw. */
export const riderCanvas = (id: string, L: SuitorLook, tiara: boolean, face: 1 | -1, hit: boolean) => {
  const key = `${id}|${face}|${hit ? 1 : 0}`;
  let cv = riders.get(key);
  if (cv) return cv;
  cv = document.createElement('canvas'); cv.width = RIDER_W; cv.height = RIDER_H;
  const g = cv.getContext('2d')!;
  drawBroom(g, RIDER_AX, RIDER_AY, face, 1, true);
  drawSuitor(g, RIDER_AX - face * 4, RIDER_AY + 34, face, 0, L, 'ride');
  if (tiara) TIARA(g, RIDER_AX - face * 4 + face * 12, RIDER_AY + 34 - 102);
  if (hit) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(255,240,240,0.75)'; g.fillRect(0, 0, RIDER_W, RIDER_H); g.globalCompositeOperation = 'source-over'; }
  riders.set(key, cv);
  return cv;
};
/** Drop the cached sprites (a fresh fight: the looks are the same, but cheap to keep honest). */
export const clearRiders = () => riders.clear();

// ---------------------------------------------------------------------------------------------------------------
// What flies about

export type Thing = 'bolt' | 'mybolt' | 'homing' | 'snipe' | 'shaker' | 'dumbbell' | 'turkey';
/** A thrown or shot thing at (x, y) on the view, `s` px a unit, spinning by `rot`. Bolts: a stepped glow (rings), a
 *  hot core, a four-point twinkle; the homing shot a heart. Throws: a protein shaker, a dumbbell, a turkey leg. */
export const drawThing = (c: Ctx, k: Thing, x: number, y: number, s: number, rot: number, f: number) => {
  const z = Math.max(0.12, s);
  if (k === 'mybolt' || k === 'homing' || k === 'bolt' || k === 'snipe') {
    const r = Math.max(k === 'homing' ? 3 : 1.5, (k === 'snipe' ? 14 : k === 'homing' ? 24 : 11) * z);
    const cols = k === 'mybolt' || k === 'homing' ? ['#DB2777', '#F472B6', '#FFE4F2'] : k === 'snipe' ? ['#0E7490', '#22D3EE', '#ECFEFF'] : ['#15803D', '#4ADE80', '#F0FFF4'];
    c.globalAlpha = 0.22; ell(c, x, y, r * 2.2, r * 2.2, cols[1]); c.globalAlpha = 0.4; ell(c, x, y, r * 1.6, r * 1.6, cols[1]); c.globalAlpha = 1;
    if (k === 'homing') {
      // (the homing shot: a pink heart, spinning a little, a white core)
      c.save(); c.translate(x, y); c.rotate(Math.sin(f * 0.3) * 0.3); const h = r * 0.9;
      c.fillStyle = INK; c.beginPath(); c.arc(-h * 0.45, -h * 0.2, h * 0.55, 0, Math.PI * 2); c.arc(h * 0.45, -h * 0.2, h * 0.55, 0, Math.PI * 2); c.fill(); poly(c, INK, [-h, 0, 0, h * 1.05, h, 0]);
      c.fillStyle = cols[1]; c.beginPath(); c.arc(-h * 0.45, -h * 0.2, h * 0.45, 0, Math.PI * 2); c.arc(h * 0.45, -h * 0.2, h * 0.45, 0, Math.PI * 2); c.fill(); poly(c, cols[1], [-h * 0.88, 0, 0, h * 0.9, h * 0.88, 0]);
      ell(c, -h * 0.45, -h * 0.3, h * 0.2, h * 0.16, cols[2]);
      c.restore();
    } else { ell(c, x, y, r, r, cols[0]); ell(c, x, y, r * 0.8, r * 0.8, cols[1]); ell(c, x - r * 0.15, y - r * 0.15, r * 0.45, r * 0.45, cols[2]); }
    if ((f >> 1) % 2) { box(c, x - r * 1.8, y - 0.5, r * 3.6, 1, cols[2]); box(c, x - 0.5, y - r * 1.8, 1, r * 3.6, cols[2]); }
    return;
  }
  c.save(); c.translate(x, y); c.scale(Math.max(0.15, z * 2.2), Math.max(0.15, z * 2.2)); c.rotate(rot);
  if (k === 'shaker') { box(c, -5, -8, 10, 16, INK); box(c, -4, -7, 8, 14, '#E4E4EA'); box(c, -4, -7, 2, 14, '#FFFFFF'); box(c, 2, -7, 2, 14, '#B8B8C4'); box(c, -4, -3, 8, 5, '#F472B6'); box(c, -4, -3, 8, 1, '#FBCFE8'); box(c, -3, -11, 6, 4, INK); box(c, -2, -10, 4, 2, '#2A2A30'); }
  else if (k === 'dumbbell') { box(c, -9, -2, 18, 4, INK); box(c, -8, -1, 16, 2, '#A1A1AA'); box(c, -8, -1, 16, 1, '#D4D4D8'); for (const sx of [-10, 6]) { box(c, sx - 1, -7, 6, 14, INK); box(c, sx, -6, 4, 12, '#3F3F46'); box(c, sx, -6, 1, 12, '#71717A'); } }
  else { ell(c, 2, 0, 9, 6, INK); ell(c, 2, 0, 8, 5, '#7A4218'); ell(c, 1, -1, 6.5, 3.6, '#9A5A24'); ell(c, 0, -2, 4, 2, '#C8864A'); box(c, -1, -3, 2, 1, '#E8B07A'); box(c, -12, -2, 7, 3, INK); box(c, -12, -1, 7, 1, '#F4F4F5'); ell(c, -13, 0, 2.4, 2.4, '#F4F4F5'); ell(c, -13.4, -0.6, 1, 1, '#FFFFFF'); }
  c.restore();
};

/** A suitor dead on the lawn (or at a tower's foot, or in the moat's mud): flat on his back by his snapped broom, the
 *  blood round him in stepped rings, foreshortened by the eye's height (`flat` 0..1: how much of the ground's face we
 *  see). */
export const drawCorpse = (c: Ctx, cv: HTMLCanvasElement, x: number, y: number, s: number, flat: number, mud: boolean) => {
  const w = RIDER_W * s, h = RIDER_H * s, f = Math.max(0.15, Math.min(1, flat));
  ell(c, x + 4 * s, y + 2 * s * f, 72 * s, 72 * s * f, mud ? '#2A1A0A' : '#4A0808');
  ell(c, x, y, 70 * s, 70 * s * f, mud ? '#4A3418' : '#7F1D1D');
  ell(c, x - 10 * s, y - 4 * s * f, 40 * s, 40 * s * f, mud ? '#5C4424' : '#991B1B');
  ell(c, x - 22 * s, y - 10 * s * f, 12 * s, 12 * s * f, mud ? '#7A5A34' : '#C82828');
  c.save(); c.translate(x, y); c.scale(1, f); c.rotate(-Math.PI / 2);
  drawMipped(c, cv, -RIDER_AX * s * 0.8, -RIDER_AY * s * 0.8, w * 0.8, h * 0.8);
  c.restore();
};
