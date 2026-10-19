// The broomstick deathmatch's figures (crude-but-readable first pass): MEATHEAD from behind, stood on his broom (as he
// got on it at the runway: he doesn't sit), arms out for balance, leaning into his turns, the bristles fanned under the
// screen and the sparkle trail off them; his jeans' seat or his bare backside (shat: the stain; naked: the balls between
// his thighs and the BONER poking out past his hip, further the harder he banks). The suitors side-on on their brooms
// (fantasy/suitors.ts sat, keep/runway.ts's broom, the ride's survivors still in their boutique tiaras), painted once
// per look and facing and scaled by depth. Their throws, the wand bolts, the dead on the lawn.

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

export interface MhLook { bank: number; pitch: number; nude: boolean; shat: boolean; boost: boolean; fire: number; blink: boolean; f: number; charge?: number; locked?: boolean }

/** Him on his broom, from behind: feet at (x, y) on the view (400x300 space), the broom's tip off up toward the
 *  horizon, the bristles fanned toward us. `bank` -1..1 (leaning into the turn), `fire` frames since a shot. */
export const drawMeatheadBroom = (c: Ctx, x: number, y: number, k: number, L: MhLook) => {
  if (L.blink && (L.f >> 2) % 2) return;
  c.save(); c.translate(x, y); c.scale(k, k);
  // THE BROOM: the handle off ahead of him (up the screen: it points away), the bristles toward us
  c.save(); c.rotate(L.bank * 0.18);
  const tipY = -34 - L.pitch * 6;
  poly(c, INK, [-4, 4, 4, 4, 2, tipY, -2, tipY]); poly(c, '#8A5A30', [-3, 4, 3, 4, 1.4, tipY + 1, -1.4, tipY + 1]); box(c, -2, tipY + 1, 1, -tipY + 2, '#B8864A');
  // (the LASER on its end (the user's): a steel emitter clamped on, cooling rings, the pink lens glowing; a flash
  // when it fires; X held, it charges, glowing bigger)
  box(c, -4, tipY - 1, 8, 6, INK); box(c, -3, tipY, 6, 4, '#8A8AA0'); box(c, -3, tipY, 2, 4, '#CACADA'); box(c, -4, tipY + 2, 8, 1, '#3A3A48');
  ell(c, 0, tipY - 2, 4, 3, INK); ell(c, 0, tipY - 2, 3, 2.2, (L.f >> 3) % 2 ? '#F472B6' : '#F9A8D4'); box(c, -1, tipY - 3, 1, 1, '#FFFFFF');
  const ch = L.charge ?? 0;
  if (ch > 0) { c.globalAlpha = 0.5 + 0.3 * ((L.f >> 1) % 2); ell(c, 0, tipY - 2, 3 + ch * 6, 3 + ch * 6, L.locked ? '#EF4444' : '#F472B6'); c.globalAlpha = 1; ell(c, 0, tipY - 2, 2.5, 2.5, '#FFFFFF'); }
  if (L.fire < 4) { ell(c, 0, tipY - 2, 9 - L.fire * 2, 9 - L.fire * 2, '#FFE4F2'); ell(c, 0, tipY - 2, 5, 5, '#FFFFFF'); }
  // (the binding, the bristles fanned out toward us, a sparkle trail off them)
  box(c, -9, 4, 18, 5, INK); box(c, -8, 5, 16, 3, '#B91C1C');
  poly(c, INK, [-10, 8, 10, 8, 30, 40, -30, 40]); poly(c, '#D8B060', [-9, 9, 9, 9, 28, 39, -28, 39]);
  for (let s = -6; s <= 6; s += 2) line(c, '#A8803A', 1, [s * 1.2, 10, s * 4.4, 38]);
  poly(c, '#F0D080', [-9, 9, -3, 9, -12, 39, -28, 39]);
  for (let i = 0; i < 6; i++) { const sx = Math.sin(L.f * 0.31 + i * 1.7) * 22, sy = 42 + ((L.f * 2 + i * 9) % 26); box(c, sx - 1, sy, 3, 1, i % 2 ? '#FFF6C8' : '#FFC8E8'); box(c, sx, sy - 1, 1, 3, i % 2 ? '#FFF6C8' : '#FFC8E8'); }
  if (L.boost) for (let i = 0; i < 5; i++) { const sx = (i - 2) * 9 + Math.sin(L.f + i) * 3; line(c, '#FDE68A', 2, [sx, 44, sx * 1.4, 60 + (L.f * 3 + i * 7) % 14]); }
  c.restore();
  // HIM: leaning into the turn from his feet
  c.rotate(L.bank * 0.32);
  const Lg = L.nude ? SK : JE;
  // (legs: ski stance on the shaft, knees out, his boots one behind the other)
  for (const s of [-1, 1]) {
    line(c, INK, 9, [s * 7, -36, s * 11, -18, s * 3, -2]);
    line(c, Lg[2], 7, [s * 7, -36, s * 11, -18, s * 3, -2]); line(c, Lg[4], 2, [s * 6, -35, s * 10, -19]);
    if (!L.nude) line(c, '#B8862E', 0.8, [s * 8, -34, s * 12, -18]);
  }
  box(c, -6, -5, 12, 6, '#1A120C'); box(c, -5, -9, 10, 4, '#1A120C'); box(c, -6, -5, 12, 1, '#4A3A2E');
  // (the seat: jeans, the belt; or bare; the stain; the balls between his thighs)
  if (L.nude) {
    ell(c, -5, -38, 6.5, 6, BUM[2]); ell(c, 5, -38, 6.5, 6, BUM[1]); ell(c, -7, -40, 3, 2.4, BUM[3]); box(c, -0.5, -43, 1, 8, '#8A5A3A');
    ell(c, -1.6, -30, 2.6, 2.8, SK[2]); ell(c, 1.8, -30.5, 2.6, 2.8, SK[1]); ell(c, -2, -31, 1, 1, SK[4]);
    if (L.shat) { ell(c, 0, -35, 4.5, 3.2, '#5C3A16'); box(c, -1, -33, 2, 3 + ((L.f >> 3) % 3), '#5C3A16'); }
    // THE BONER: out past his hip on the outside of the turn, further the harder he banks; pink, a darker head
    const side = L.bank > 0.04 ? -1 : 1, len = 7 + Math.min(1, Math.abs(L.bank)) * 9;
    const bx = side * 10, by = -32;
    line(c, INK, 5, [side * 4, by + 1, bx + side * len, by - 3 - len * 0.35]);
    line(c, '#E89A86', 3.4, [side * 4, by + 1, bx + side * len, by - 3 - len * 0.35]);
    ell(c, bx + side * (len + 1), by - 4 - len * 0.35, 2.6, 2.2, '#C8505A');
  } else {
    box(c, -12, -44, 24, 11, JE[3]); box(c, -12, -44, 4, 11, JE[4]); box(c, 8, -44, 4, 11, JE[2]); box(c, -0.6, -42, 1.2, 9, JE[1]);
    for (const s of [-1, 1]) { box(c, s * 6 - 4, -41, 8, 6, JE[2]); box(c, s * 6 - 4, -41, 8, 1, '#B8862E'); }
    if (L.shat) { ell(c, 0, -37, 8.5, 4.8, '#6A4418'); ell(c, 0, -36, 5, 3, '#4A2E0E'); box(c, -2, -33, 2, 3 + ((L.f >> 3) % 3), '#5C3A16'); }
    box(c, -13, -46, 26, 5, '#5A2A0C'); box(c, -13, -46, 26, 1, '#8A4A1C'); box(c, -2, -46, 4, 3, '#C8A040');
  }
  // (his bare back, lit from the upper left; the spine's groove; the shoulder blades)
  poly(c, INK, [-18, -67, 18, -67, 20, -58, 15, -45, -15, -45, -20, -58]);
  poly(c, SK[3], [-17, -66, 17, -66, 19, -58, 14, -46, -14, -46, -19, -58]);
  poly(c, SK[4], [-17, -66, -2, -66, -2, -46, -14, -46, -19, -58]);
  poly(c, SK[2], [12, -65, 17, -66, 19, -58, 14, -46, 10, -46, 13, -57]);
  box(c, -1, -64, 2, 18, SK[2]);
  ell(c, -7.5, -59, 5, 3.6, SK[5]); ell(c, 7, -59, 4.6, 3.4, SK[4]);
  // (arms out for balance (thrown back on a boost), a flap of them as he banks)
  const lift = L.boost ? 6 : 0;
  for (const s of [-1, 1]) {
    const up = -s * L.bank * 8;
    line(c, INK, 8, [s * 16, -63, s * 28, -56 + up + lift, s * 38, -64 + up + lift]);
    line(c, s < 0 ? SK[4] : SK[3], 6, [s * 16, -63, s * 28, -56 + up + lift, s * 38, -64 + up + lift]);
    ell(c, s * 39, -65 + up + lift, 3.6, 3.6, INK); ell(c, s * 39, -65 + up + lift, 2.8, 2.8, SK[3]);
  }
  // (his neck and the back of his head: the short dark hair, the ears)
  box(c, -5, -72, 10, 7, SK[2]);
  ell(c, 0, -79, 9, 10, INK); ell(c, 0, -79, 8, 9, SK[3]);
  ell(c, 0, -82, 8, 7, HAIR); box(c, -8, -82, 16, 3, HAIR);
  ell(c, -8.5, -78, 2, 3, SK[2]); ell(c, 8.5, -78, 2, 3, SK[2]);
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
  drawSuitor(g, RIDER_AX - face * 4, RIDER_AY + 34, face, 0, L, 'sit');
  if (tiara) TIARA(g, RIDER_AX - face * 4 + face * 2, RIDER_AY + 34 - 104);
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
