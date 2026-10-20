// The broomstick deathmatch's figures (crude-but-readable first pass): MEATHEAD from behind, riding his broom (astride
// the shaft as he got on it at the runway, his fists on it ahead, knees out, boots tucked back by the bristles), the
// rig leaning into his turns, tucked low on a boost, sat up braking, the bristles fanned under him and the sparkle
// trail off them; his jeans' seat or his bare backside (shat: the stain; naked: the balls over the shaft and the BONER
// poking out past his hip, further the harder he banks). The suitors side-on astride their brooms (fantasy/suitors.ts
// 'ride', keep/runway.ts's broom, the ride's survivors still in their boutique tiaras), painted once per look and
// facing and scaled by depth. Their throws, the wand bolts, the dead on the lawn.

import { drawSuitor, type SuitorLook } from '../suitors';
import { drawBroom } from '../keep/runway';
import { INK } from '../kit';

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
const HAIR = '#18181B';

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
  poly(c, INK, [-4, 12, 4, 12, 2.2, tipY, -2.2, tipY]); poly(c, '#8A5A30', [-3, 12, 3, 12, 1.4, tipY + 1, -1.4, tipY + 1]); box(c, -2, tipY + 1, 1, 11 - tipY, '#B8864A');
  // (the LASER on its end (the user's): a steel emitter clamped on, cooling rings, the pink lens glowing; a flash
  // when it fires; X held, it charges, glowing bigger)
  box(c, -4, tipY - 1, 8, 6, INK); box(c, -3, tipY, 6, 4, '#8A8AA0'); box(c, -3, tipY, 2, 4, '#CACADA'); box(c, -4, tipY + 2, 8, 1, '#3A3A48');
  ell(c, 0, tipY - 2, 4, 3, INK); ell(c, 0, tipY - 2, 3, 2.2, (L.f >> 3) % 2 ? '#F472B6' : '#F9A8D4'); box(c, -1, tipY - 3, 1, 1, '#FFFFFF');
  const ch = L.charge ?? 0;
  if (ch > 0) { c.globalAlpha = 0.5 + 0.3 * ((L.f >> 1) % 2); ell(c, 0, tipY - 2, 3 + ch * 6, 3 + ch * 6, L.locked ? '#EF4444' : '#F472B6'); c.globalAlpha = 1; ell(c, 0, tipY - 2, 2.5, 2.5, '#FFFFFF'); }
  if (L.fire < 4) { ell(c, 0, tipY - 2, 9 - L.fire * 2, 9 - L.fire * 2, '#FFE4F2'); ell(c, 0, tipY - 2, 5, 5, '#FFFFFF'); }
  // (the binding, the bristles fanned out toward us, a sparkle trail off them)
  box(c, -9, 12, 18, 5, INK); box(c, -8, 13, 16, 3, '#B91C1C');
  poly(c, INK, [-10, 16, 10, 16, 30, 48, -30, 48]); poly(c, '#D8B060', [-9, 17, 9, 17, 28, 47, -28, 47]);
  for (let s = -6; s <= 6; s += 2) line(c, '#A8803A', 1, [s * 1.2, 18, s * 4.4, 46]);
  poly(c, '#F0D080', [-9, 17, -3, 17, -12, 47, -28, 47]);
  for (let i = 0; i < 6; i++) { const sx = Math.sin(L.f * 0.31 + i * 1.7) * 22, sy = 50 + ((L.f * 2 + i * 9) % 26); box(c, sx - 1, sy, 3, 1, i % 2 ? '#FFF6C8' : '#FFC8E8'); box(c, sx, sy - 1, 1, 3, i % 2 ? '#FFF6C8' : '#FFC8E8'); }
  if (L.boost) for (let i = 0; i < 5; i++) { const sx = (i - 2) * 9 + Math.sin(L.f + i) * 3; line(c, '#FDE68A', 2, [sx, 52, sx * 1.4, 68 + (L.f * 3 + i * 7) % 14]); }
  c.restore();
  const Lg = L.nude ? SK : JE;
  // HIS LEGS, straddling it: thighs out from the seat to the knees (bent, out to the sides and forward), shins back in
  // and down to his boots, tucked back by the binding, their soles at us
  const kx = 19 + tuck * 2 - up * 2, ky = -4 - tuck * 3;
  for (const s of [-1, 1]) {
    line(c, INK, 11, [s * 7, -6, s * kx, ky]);
    line(c, s < 0 ? Lg[3] : Lg[2], 9, [s * 7, -6, s * kx, ky]); line(c, Lg[4], 2, [s * 7, -9, s * (kx - 2), ky - 3]);
    if (!L.nude) line(c, '#B8862E', 0.8, [s * 8, -4, s * (kx - 1), ky + 2]);
  }
  for (const s of [-1, 1]) {
    const fx = s * 12, fy = 12;
    line(c, INK, 10, [s * kx, ky, fx, fy]);
    line(c, s < 0 ? Lg[3] : Lg[2], 8, [s * kx, ky, fx, fy]);
    // (the boot from behind: its heel and sole at us)
    box(c, fx - 5, fy - 2, 10, 9, INK); box(c, fx - 4, fy - 1, 8, 7, '#1A120C'); box(c, fx - 4, fy + 4, 8, 2, '#4A3A2E'); box(c, fx - 3, fy - 1, 3, 2, '#3A2E26');
  }
  // THE SEAT on the shaft: jeans (the belt, the pockets) or bare; the stain; the balls hung over the shaft
  if (L.nude) {
    ell(c, -6, -9, 7, 6.5, BUM[2]); ell(c, 6, -9, 7, 6.5, BUM[1]); ell(c, -8, -12, 3, 2.4, BUM[3]); box(c, -0.5, -15, 1, 10, '#8A5A3A');
    ell(c, -2, -1, 2.8, 3, SK[2]); ell(c, 2, -0.6, 2.8, 3, SK[1]); ell(c, -2.4, -2, 1, 1, SK[4]);
    if (L.shat) { ell(c, 0, -7, 4.5, 3.2, '#5C3A16'); box(c, -1, -5, 2, 3 + ((L.f >> 3) % 3), '#5C3A16'); }
  } else {
    box(c, -14, -17, 28, 13, JE[3]); box(c, -14, -17, 4, 13, JE[4]); box(c, 10, -17, 4, 13, JE[2]); box(c, -0.6, -15, 1.2, 11, JE[1]);
    for (const s of [-1, 1]) { box(c, s * 7 - 4, -14, 8, 6, JE[2]); box(c, s * 7 - 4, -14, 8, 1, '#B8862E'); }
    if (L.shat) { ell(c, 0, -9, 9, 5, '#6A4418'); ell(c, 0, -8, 5, 3, '#4A2E0E'); box(c, -2, -5, 2, 3 + ((L.f >> 3) % 3), '#5C3A16'); }
  }
  // (THE BONER, naked: poking out past his hip on the outside of the turn, further the harder he banks)
  if (L.nude) {
    const side = L.bank > 0.04 ? -1 : 1, len = 7 + Math.min(1, Math.abs(L.bank)) * 10;
    const bx = side * 12, by = -6;
    line(c, INK, 5, [side * 5, by + 1, bx + side * len, by - 3 - len * 0.35]);
    line(c, '#E89A86', 3.4, [side * 5, by + 1, bx + side * len, by - 3 - len * 0.35]);
    ell(c, bx + side * (len + 1), by - 4 - len * 0.35, 2.6, 2.2, '#C8505A');
  }
  // HIS BACK, leaned forward over the shaft (shorter the lower he's tucked; taller sat up or climbing)
  const torsoH = 30 - tuck * 8 + up * 9 + pt * 3, wY = -15, sY = wY - torsoH;
  const hy = sY - 7 + tuck * 3 - up * 2, handY = up ? sY + 2 : hy - 14 - tuck * 2;
  // (his arms: elbows out, forearms in to both fists on the shaft ahead of him; sat up they're pulled in to his chest)
  for (const s of [-1, 1]) {
    const ex = s * (27 - up * 3 + tuck * 2), ey = sY - 4 + up * 8 - L.bank * s * 3, fx = s * (up ? 7 : 3.5), fy = handY - (s > 0 && !up ? 4 : 0);
    line(c, INK, 8, [s * 16, sY + 3, ex, ey, fx, fy]);
    line(c, s < 0 ? SK[4] : SK[3], 6, [s * 16, sY + 3, ex, ey, fx, fy]);
    if (!up) { ell(c, fx, fy, 4.2, 3.6, INK); ell(c, fx, fy, 3.4, 2.8, SK[3]); box(c, fx - 2, fy - 1, 4, 1, SK[2]); }
  }
  if (!L.nude) { box(c, -15, wY - 3, 30, 5, '#5A2A0C'); box(c, -15, wY - 3, 30, 1, '#8A4A1C'); box(c, -2, wY - 3, 4, 3, '#C8A040'); }
  poly(c, INK, [-14, wY - 1, 14, wY - 1, 20, sY + 8, 18, sY - 1, -18, sY - 1, -20, sY + 8]);
  poly(c, SK[3], [-13, wY - 2, 13, wY - 2, 19, sY + 8, 17, sY, -17, sY, -19, sY + 8]);
  poly(c, SK[4], [-13, wY - 2, -1, wY - 2, -1, sY, -17, sY, -19, sY + 8]);
  poly(c, SK[2], [9, wY - 2, 13, wY - 2, 19, sY + 8, 17, sY, 13, sY, 14, sY + 8]);
  box(c, -1, sY + 2, 2, wY - sY - 4, SK[2]);
  ell(c, -8, sY + 6, 5, 3.4, SK[5]); ell(c, 7.5, sY + 6, 4.6, 3.2, SK[4]);
  // (his neck and the back of his head, ducked down on a boost: the short dark hair, the ears)
  box(c, -5, hy + 4, 10, sY - hy - 2, SK[2]);
  ell(c, 0, hy, 9, 10, INK); ell(c, 0, hy, 8, 9, SK[3]);
  ell(c, 0, hy - 3, 8, 7, HAIR); box(c, -8, hy - 3, 16, 3, HAIR);
  ell(c, -8.5, hy + 1, 2, 3, SK[2]); ell(c, 8.5, hy + 1, 2, 3, SK[2]);
  if (L.boost) for (let i = 0; i < 3; i++) box(c, -6 + i * 5, hy - 10 - ((L.f + i * 3) % 4), 2, 3, HAIR);
  c.restore();
};

/** Him falling off it, dead (the tumble: spinning down, the broom away from him). */
export const drawMeatheadFall = (c: Ctx, x: number, y: number, k: number, rot: number, nude: boolean) => {
  c.save(); c.translate(x, y); c.scale(k, k); c.rotate(rot);
  const L = nude ? SK : JE;
  line(c, L[2], 7, [-5, 6, -14, 22]); line(c, L[2], 7, [5, 6, 16, 18]);
  box(c, -12, -16, 24, 20, SK[3]); box(c, -12, -16, 5, 20, SK[4]);
  line(c, SK[3], 6, [-12, -12, -26, -24]); line(c, SK[3], 6, [12, -12, 24, -2]);
  ell(c, 0, -24, 8, 9, SK[3]); ell(c, 0, -27, 8, 6, HAIR);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The suitors on their brooms (side-on; painted once a look and facing)

const TIARA = (c: Ctx, x: number, top: number) => {
  poly(c, INK, [x - 9, top + 4, x - 7, top - 3, x - 3, top + 1, x + 1, top - 7, x + 5, top + 1, x + 9, top - 3, x + 11, top + 4]);
  poly(c, '#F6D365', [x - 8, top + 3, x - 7, top - 1, x - 3, top + 2, x + 1, top - 5, x + 5, top + 2, x + 9, top - 1, x + 10, top + 3]);
  box(c, x, top - 2, 3, 3, '#F472B6');
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
/** A thrown or shot thing at (x, y) on the view, `s` px a unit, spinning by `rot`. */
export const drawThing = (c: Ctx, k: Thing, x: number, y: number, s: number, rot: number, f: number) => {
  const z = Math.max(0.12, s);
  if (k === 'mybolt' || k === 'homing' || k === 'bolt' || k === 'snipe') {
    const r = Math.max(k === 'homing' ? 3 : 1.5, (k === 'snipe' ? 14 : k === 'homing' ? 24 : 11) * z);
    const cols = k === 'mybolt' || k === 'homing' ? ['#F472B6', '#FFE4F2'] : k === 'snipe' ? ['#22D3EE', '#ECFEFF'] : ['#4ADE80', '#F0FFF4'];
    c.globalAlpha = 0.45; ell(c, x, y, r * 1.8, r * 1.8, cols[0]); c.globalAlpha = 1;
    ell(c, x, y, r, r, cols[0]); ell(c, x, y, r * 0.5, r * 0.5, cols[1]);
    if ((f >> 1) % 2) { box(c, x - r * 1.6, y, r * 3.2, 1, cols[1]); box(c, x, y - r * 1.6, 1, r * 3.2, cols[1]); }
    return;
  }
  c.save(); c.translate(x, y); c.scale(Math.max(0.15, z * 2.2), Math.max(0.15, z * 2.2)); c.rotate(rot);
  if (k === 'shaker') { box(c, -5, -8, 10, 16, INK); box(c, -4, -7, 8, 14, '#F4F4F5'); box(c, -4, -3, 8, 5, '#F472B6'); box(c, -3, -10, 6, 3, '#18181B'); }
  else if (k === 'dumbbell') { box(c, -9, -2, 18, 4, INK); box(c, -8, -1, 16, 2, '#A1A1AA'); for (const sx of [-9, 6]) { box(c, sx - 1, -7, 5, 14, INK); box(c, sx, -6, 3, 12, '#52525B'); } }
  else { ell(c, 2, 0, 9, 6, INK); ell(c, 2, 0, 8, 5, '#9A5A24'); ell(c, 0, -2, 4, 2, '#C8864A'); box(c, -12, -2, 7, 3, INK); box(c, -12, -1, 7, 1, '#F4F4F5'); ell(c, -13, 0, 2.4, 2.4, '#F4F4F5'); }
  c.restore();
};

/** A suitor dead on the lawn (or at a tower's foot, or in the moat's mud): flat on his back by his snapped broom, the
 *  blood round him, foreshortened by the eye's height (`flat` 0..1: how much of the ground's face we see). */
export const drawCorpse = (c: Ctx, cv: HTMLCanvasElement, x: number, y: number, s: number, flat: number, mud: boolean) => {
  const w = RIDER_W * s, h = RIDER_H * s, f = Math.max(0.15, Math.min(1, flat));
  ell(c, x, y, 70 * s, 70 * s * f, mud ? '#4A3418' : '#7F1D1D'); ell(c, x - 10 * s, y - 4 * s * f, 40 * s, 40 * s * f, mud ? '#5C4424' : '#991B1B');
  c.save(); c.translate(x, y); c.scale(1, f); c.rotate(-Math.PI / 2);
  c.drawImage(cv, -RIDER_AX * s * 0.8, -RIDER_AY * s * 0.8, w * 0.8, h * 0.8);
  c.restore();
};
