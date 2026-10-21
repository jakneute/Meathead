// The walk-away from PIPER THE PIXIE (Fairy Land's boss), SNES'd with the walk-in's look: down the snowy cobbled lane out
// of HOGSMEAT VILLAGE toward the camera at whatever hour it is now (timeOfDay.ts): crooked half-timbered cottages either
// side (snow heaped on their slates, windows glowing, chimneys smoking), iron lamp posts, snowy pines, snowmen. Behind
// him: the Alps (snowfields, rock ribs, no volcanoes), the pine ridge, Hogsmeat's roofs (the steeple, the clock tower,
// chimneys), and over them THE GREAT PIXIE'S CASTLE (fantasy/monument.ts), Piper's window at the top of it smashed in
// (dark, the frame broken, glass glinting). How she went shows: the cork (her usual death) a hole punched up through the
// spire's cone over her chambers, slates and a rafter sticking up, steam still blowing off it and fairy dust drifting
// down; the deflated balloon (her weakness, the flintlock) a long greasy streak of her (fat and gore, in drips) down the
// castle from her window, and the lane strewn with drips of it. Rose petals blow down the lane either way. His new toy:
// the SPELLBOOK (its walk-away act: walkAway/acts.ts).

import { type Ctx, type Prop, type SceneDef, HOR, box, hash, mix, stipple } from './kit';
import { farStrip } from './farStrip';
import { timeOfDay, hourMix } from '../timeOfDay';
import { drawTeaseStrip } from './teases';
import { bookShut } from './toys';
import { drawCastleAt, PIPER_WINDOW } from '../fantasy/monument';
import { ground, cottage, chimneySmoke, lamp, pine, snowman } from './intoFantasy';


/** The far strips: the picture's width and a margin either side (for the sway); the Alps' and the village's heights. */
const M = 24, SW = 400 + M * 2, AH = 72, VH = 52;
const PEAKS: [number, number][] = [[-30, 34], [30, 56], [88, 38], [140, 62], [206, 44], [262, 66], [326, 40], [384, 58], [440, 32]];
/** The Alps' top (picture y over the horizon) at picture x, and which way the face there looks (the sun's from the left). */
const alpsTop = (x: number) => Math.max(6, ...PEAKS.map(([px, h]) => h - Math.abs(x - px) * 0.9));
const facesSun = (x: number) => alpsTop(x - 1) < alpsTop(x + 1) ? 1 : 0;

/** The Alps (painted once for the hour, in picture px at twice the size: farStrip.ts): each flank's rock in steps (the
 *  sun side lit, the far side shaded), banded down toward the haze and dithered between; the snowfields over them,
 *  their ragged foot dithered into the rock, a lit cornice along the ridge; ribs and gullies down the flanks, snow
 *  caught in them; the haze lying along the foot. */
const paintAlps = (g: Ctx) => {
  g.scale(2, 2);
  const H = (d: string, s: string, n: string) => hourMix(d, s, n);
  const rockL = [H('#8A88B0', '#9A6E96', '#323650'), H('#7A78A2', '#86628A', '#2A2E48')], rockS = [H('#5E5C88', '#664C78', '#1E2238'), H('#504E7A', '#583E6A', '#181C30')];
  const snowL = [H('#FFFFFF', '#FFE6EC', '#8A94B8'), H('#E8EEF8', '#F2D8E0', '#7A84A8')], snowS = [H('#C8D2E8', '#D8B8CC', '#545C80'), H('#B0BAD4', '#C0A0B8', '#464E70')];
  const rib = H('#3E3C64', '#4A3258', '#12162A'), haze = mix(timeOfDay().haze, H('#DCE4F4', '#F0C8D8', '#2A3058'), 0.5);
  for (let x = 0; x < SW; x++) {
    const xx = x - M, top = AH - Math.round(alpsTop(xx)), lit = facesSun(xx);
    const sl = Math.max(top, AH - 24 + Math.round(Math.sin(xx * 0.07) * 4) + Math.round(hash(Math.floor(xx / 3) * 0.37) * 3));
    const R = lit ? rockL : rockS, S = lit ? snowL : snowS;
    // (the rock, in two bands down toward the foot, dithered where they meet)
    const mid = sl + Math.round((AH - sl) * 0.45);
    box(g, x, sl, 1, mid - sl, R[0]); box(g, x, mid, 1, AH - mid, R[1]);
    if (x % 2) box(g, x, mid - 1, 1, 1, R[1]); else box(g, x, mid, 1, 1, R[0]);
    // (the snow, its foot ragged and dithered into the rock, a cornice lit along the ridge)
    if (sl > top) {
      const sm = top + Math.round((sl - top) * 0.5);
      box(g, x, top, 1, sm - top, S[0]); box(g, x, sm, 1, sl - sm, S[1]);
      if (x % 2) box(g, x, sm - 1, 1, 1, S[1]);
      box(g, x, sl + (x % 2), 1, 1, S[1]); if (hash(x * 0.53) > 0.6) box(g, x, sl + 2, 1, 1 + (x % 3), S[1]);
      box(g, x, top, 1, 1, lit ? '#FFFFFF' : S[0]);
    }
  }
  // (ribs and gullies down the flanks: dark rock lines falling from near each summit, snow lodged in their tops)
  for (const [px, ph] of PEAKS) for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) {
    let x = px + M + sd * (4 + k * 9), y = AH - ph + 6 + k * 8;
    const len = 10 + k * 4 + Math.round(hash(px + sd * 3 + k) * 8);
    for (let n = 0; n < len && y < AH - 2; n++) {
      if (x >= 0 && x < SW && y > AH - alpsTop(x - M)) { box(g, x, y, 1, 2, rib); if (y < AH - 22) box(g, x - sd, y, 1, 1, sd < 0 ? snowL[1] : snowS[1]); }
      x += sd; y += 1 + (n % 2);
    }
  }
  // (the haze along the foot: banded, dithered)
  for (let k = 0; k < 3; k++) { g.fillStyle = stipple(g, haze, k % 2); g.fillRect(0, AH - 14 + k * 4, SW, 4); }
  box(g, 0, AH - 2, SW, 2, haze);
};

/** Where Hogsmeat's roofs stand (picture x of each at no sway), how wide, how tall. */
const ROOFS = Array.from({ length: 16 }, (_, i) => ({ rx: Math.round(-10 + i * 27 + (hash(i) - 0.5) * 8), rw: 18 + Math.round(hash(i * 2.1) * 10), rh: 6 + Math.round(hash(i * 3.3) * 5), i }));
/** Hogsmeat's roofs at the lane's far end (painted once for the hour): plaster walls lit down one side, a timber or two,
 *  windows framed (lit after dark), slate roofs inked along the eaves, snow heaped on them lit on the sun side, chimneys
 *  capped with snow; the steeple (louvered, a cross), the clock tower (its face, its hands). */
const paintVillage = (g: Ctx) => {
  g.scale(2, 2);
  const H = (d: string, s: string, n: string) => hourMix(d, s, n);
  const roofC = H('#4A4A6A', '#5A3E5A', '#1E2034'), roofD = mix(roofC, '#0A0814', 0.35), wall = H('#CDBCA6', '#C8A898', '#3E3A4A'), wallD = mix(wall, '#1A1028', 0.3), wallL = mix(wall, '#FFFFFF', 0.25);
  const snow = H('#E8EEF8', '#F2D8E0', '#7A84A8'), snowL = H('#FFFFFF', '#FFE6EC', '#8A94B8'), snowS = H('#B8C2DC', '#C8A8C0', '#4A5276');
  const glow = timeOfDay().lamps > 0.3 ? '#FFD87A' : '#8E7A6A', timber = H('#5A3A26', '#4A2E2A', '#1A1218'), INKC = '#1A1028';
  const B = VH - 2;
  for (const { rx: px, rw, rh, i } of ROOFS) {
    const rx = px + M;
    if (Math.abs(px + rw / 2 - 300) < 16) continue;
    box(g, rx - 1, B - rh - 1, rw + 2, rh + 3, INKC);
    box(g, rx, B - rh, rw, rh + 2, wall); box(g, rx, B - rh, 1, rh + 2, wallL); box(g, rx + rw - 2, B - rh, 2, rh + 2, wallD);
    if (i % 2) { box(g, rx + Math.round(rw / 2), B - rh, 1, rh + 2, timber); box(g, rx, B - Math.round(rh / 2), rw, 1, timber); }
    for (const wx of [rx + 3, ...(hash(i * 5) > 0.5 ? [rx + rw - 6] : [])]) { box(g, wx - 1, B - rh + 2, 4, 4, timber); box(g, wx, B - rh + 3, 2, 2, glow); }
    const ey = B - rh, pk = rx + Math.round(rw / 2);
    g.fillStyle = INKC; g.beginPath(); g.moveTo(rx - 3, ey + 1); g.lineTo(pk, ey - 9); g.lineTo(rx + rw + 3, ey + 1); g.closePath(); g.fill();
    g.fillStyle = roofC; g.beginPath(); g.moveTo(rx - 2, ey); g.lineTo(pk, ey - 8); g.lineTo(rx + rw + 2, ey); g.closePath(); g.fill();
    g.fillStyle = roofD; g.beginPath(); g.moveTo(pk, ey - 8); g.lineTo(rx + rw + 2, ey); g.lineTo(pk, ey); g.closePath(); g.fill();
    // (the snow on it: the sun side bright, the far side shaded, a ragged lip over the eaves)
    g.fillStyle = snowL; g.beginPath(); g.moveTo(rx - 2, ey - 1); g.lineTo(pk, ey - 9); g.lineTo(pk, ey - 6); g.lineTo(rx, ey); g.closePath(); g.fill();
    g.fillStyle = snowS; g.beginPath(); g.moveTo(pk, ey - 9); g.lineTo(rx + rw + 2, ey - 1); g.lineTo(rx + rw, ey); g.lineTo(pk, ey - 6); g.closePath(); g.fill();
    for (let x = rx - 1; x < rx + rw + 2; x += 2) box(g, x, ey, 1, 1 + ((x + i) % 3 === 0 ? 1 : 0), snow);
    if (i % 3 === 1) { const cx = rx + rw - 6; box(g, cx - 1, ey - 13, 5, 7, INKC); box(g, cx, ey - 12, 3, 6, '#7A4A3A'); box(g, cx, ey - 12, 1, 6, '#9A6A5A'); box(g, cx - 1, ey - 14, 5, 2, snowL); }
  }
  // (the steeple: its tower, louvers, the spire with snow down its sun side, a cross)
  const sx = 70 + M;
  box(g, sx - 4, B - 30, 8, 32, INKC); box(g, sx - 3, B - 29, 6, 31, wall); box(g, sx - 3, B - 29, 1, 31, wallL); box(g, sx + 2, B - 29, 1, 31, wallD);
  box(g, sx - 1, B - 26, 2, 4, glow); for (let k = 0; k < 2; k++) box(g, sx - 1, B - 18 + k * 2, 2, 1, timber);
  g.fillStyle = INKC; g.beginPath(); g.moveTo(sx - 5, B - 29); g.lineTo(sx, B - 47); g.lineTo(sx + 5, B - 29); g.closePath(); g.fill();
  g.fillStyle = roofC; g.beginPath(); g.moveTo(sx - 4, B - 30); g.lineTo(sx, B - 46); g.lineTo(sx + 4, B - 30); g.closePath(); g.fill();
  g.fillStyle = snowL; g.beginPath(); g.moveTo(sx - 4, B - 30); g.lineTo(sx, B - 46); g.lineTo(sx - 1, B - 30); g.closePath(); g.fill();
  box(g, sx, B - 51, 1, 5, timber); box(g, sx - 1, B - 50, 3, 1, timber);
  // (the clock tower: its face, numerals as ticks, the hands; snow on its cap)
  const cx = 170 + M;
  box(g, cx - 5, B - 26, 10, 28, INKC); box(g, cx - 4, B - 25, 8, 27, wall); box(g, cx - 4, B - 25, 1, 27, wallL); box(g, cx + 3, B - 25, 1, 27, wallD);
  box(g, cx - 3, B - 24, 6, 6, INKC); box(g, cx - 3, B - 23, 6, 5, '#F4F0E0'); box(g, cx, B - 23, 1, 3, INKC); box(g, cx, B - 21, 2, 1, INKC);
  for (const [dx, dy] of [[0, -23], [2, -21], [0, -19], [-2, -21]] as const) box(g, cx + dx, B + dy, 1, 1, '#8A7A6A');
  box(g, cx - 2, B - 14, 4, 5, timber); box(g, cx - 1, B - 13, 2, 3, glow);
  g.fillStyle = INKC; g.beginPath(); g.moveTo(cx - 7, B - 25); g.lineTo(cx, B - 37); g.lineTo(cx + 7, B - 25); g.closePath(); g.fill();
  g.fillStyle = roofC; g.beginPath(); g.moveTo(cx - 6, B - 26); g.lineTo(cx, B - 36); g.lineTo(cx + 6, B - 26); g.closePath(); g.fill();
  g.fillStyle = snowL; g.beginPath(); g.moveTo(cx - 6, B - 26); g.lineTo(cx, B - 36); g.lineTo(cx, B - 33); g.lineTo(cx - 4, B - 26); g.closePath(); g.fill();
  box(g, cx - 6, B - 27, 12, 1, snow);
};

const back = (c: Ctx, t: number, sway: number, weakness: boolean) => {
  // (the Alps: painted once for the hour, slid by his sway)
  c.drawImage(farStrip('wa-pp-alps', SW, AH, paintAlps), -M + Math.round(sway * 0.1), HOR - AH);
  // (in front of the Alps, the neighbors past the land's edge: THRONES OF THE STARS, Jungle Land's temple)
  drawTeaseStrip(c, 'fantasy', 'far', sway);
  // (the castle over the village, her window at the top smashed in)
  const x = Math.round(300 + sway * 0.4), k = 0.2, base = HOR + 4;
  drawCastleAt(c, x, base, k, t);
  const wx = x + PIPER_WINDOW.x * k, wy = base + PIPER_WINDOW.y * k;
  box(c, wx - 3, wy - 4, 6, 8, '#120A1E'); box(c, wx - 3, wy - 4, 1, 3, '#FFD0E8'); box(c, wx + 2, wy + 1, 1, 2, '#F9A8D4');
  if (t % 50 < 4) box(c, wx + 1, wy - 2, 1, 1, '#FFFFFF');
  if (weakness) {
    // (her, down the castle from her window: a greasy streak in drips, red and yellow)
    for (let y = wy + 4; y < HOR + 2; y += 1) { const w = 1 + Math.round(hash(y * 0.7) * 1.4); box(c, wx - 1 + Math.round(Math.sin(y * 0.3)), y, w, 1, y % 3 ? '#7F1D1D' : '#C8A848'); }
    for (let i = 0; i < 4; i++) { const dy = wy + 10 + i * 9 + ((t * 0.2 + i * 7) % 8); box(c, wx + 2 + (i % 2), dy, 1, 2, '#9A1A1A'); }
  } else {
    // (the hole up through the spire's cone over her chambers: dark, slates and a rafter sticking up, steam blowing off
    // it, fairy dust drifting down)
    box(c, wx - 4, wy - 13, 8, 5, '#120A1E'); box(c, wx - 5, wy - 14, 10, 1, '#5A4A6A');
    box(c, wx - 5, wy - 17, 2, 3, '#3E68C4'); box(c, wx + 3, wy - 16, 2, 2, '#3E68C4'); box(c, wx + 1, wy - 19, 1, 5, '#7C5638');
    for (let i = 0; i < 5; i++) { const u = ((t * 0.4 + i * 8) % 40) / 40; c.globalAlpha = 0.55 * (1 - u); box(c, wx - 2 + u * 14, wy - 17 - u * 18, 3 + u * 5, 2 + u * 3, '#F4F4F8'); c.globalAlpha = 1; }
    for (let i = 0; i < 3; i++) { const u = ((t * 0.3 + i * 13) % 40) / 40; if ((t + i * 5) % 8 < 5) box(c, wx - 6 + i * 6 + Math.sin(t * 0.05 + i) * 2, wy - 10 + u * 30, 1, 1, ['#FDE68A', '#F9A8D4', '#C4B5FD'][i]); }
  }
  // (the pine ridge, snow along it)
  const ridge = hourMix('#2E4A50', '#3A3A50', '#121A26'), rsnow = hourMix('#C8D4E4', '#C8A8B8', '#4A5470');
  for (let px = 0; px < 400; px += 3) { const y = HOR - 6 - Math.round(Math.abs(Math.sin((px - sway * 0.25) * 0.11)) * 5); box(c, px, y, 3, HOR - y + 2, ridge); if ((px / 3) % 2) box(c, px + 1, y - 2, 1, 2, ridge); box(c, px, y, 2, 1, rsnow); }
  // (Hogsmeat's roofs at the lane's far end: snowy slates, a steeple, the clock tower, chimneys, a window lit here and there)
  const vx = Math.round(sway * 0.3);
  c.drawImage(farStrip('wa-pp-village', SW, VH, paintVillage), -M + vx, HOR + 2 - VH);
  // (the chimneys' smoke, live over them)
  for (const { rx, rw, rh, i } of ROOFS) {
    if (i % 3 !== 1 || Math.abs(rx + rw / 2 - 300) < 16) continue;
    const u = ((t * 0.3 + i * 5) % 20) / 20; c.globalAlpha = 0.4 * (1 - u); box(c, rx + vx + rw - 6 + u * 4, HOR - rh - 14 - u * 10, 2 + u * 2, 2, '#D8DCE8'); c.globalAlpha = 1;
  }
};

/** A rose petal on the cobbles; a drip of her (the balloon); a dropped tiara glinting on the verge. */
const petal = (g: Ctx, w: number, h: number) => { box(g, 1, h - 3, w - 2, 2, '#F43F6E'); box(g, 2, h - 3, 2, 1, '#FF8AAE'); box(g, w - 3, h - 2, 1, 1, '#A8102E'); };
const gravy = (g: Ctx, w: number, h: number) => { box(g, 0, h - 3, w, 3, '#5A0A0A'); box(g, 1, h - 3, w - 2, 2, '#9A1A1A'); box(g, 2, h - 3, w - 5, 1, '#E8D490'); box(g, w - 3, h - 2, 1, 1, '#FFF4C8'); };
const tiara = (g: Ctx, w: number, h: number) => {
  box(g, 1, h - 3, w - 2, 2, '#946E16'); box(g, 1, h - 3, w - 2, 1, '#F6D24E');
  for (let k = 0; k < 3; k++) { const px = 2 + k * ((w - 5) / 2); box(g, px, h - 5 - (k === 1 ? 2 : 0), 1, 2 + (k === 1 ? 2 : 0), '#F6D24E'); }
  box(g, Math.floor(w / 2), h - 7, 1, 1, '#F43F8E');
};

const props = (weakness: boolean): Prop[] => {
  const out: Prop[] = [];
  const walls = ['#E6D6BC', '#D8C8E0', '#F0D0C0', '#D4E0CC'], roofs = ['#3E4A6A', '#5A3E4A', '#4A5A7A', '#4E4466'];
  for (let i = 0; i < 10; i++) { const side = i % 2 ? -1 : 1, k = (i + 1) % 4; out.push({ id: `wa-pp-cot${k}`, x: side * (5.2 + (i % 3) * 0.6), z: 5 + i * 3.4, w: 3.4, h: 3.8, ppm: 18, paint: cottage(walls[k], roofs[(k + 2) % 4], k + 1), live: chimneySmoke(k + 1) }); }
  for (let k = 0; k < 10; k++) out.push({ id: 'wa-pp-lamp', x: (k % 2 ? 1 : -1) * 2.5, z: 3 + k * 4, w: 0.6, h: 2.6, ppm: 24, paint: lamp });
  for (let k = 0; k < 8; k++) out.push({ id: 'wa-pp-pine', x: (k % 2 ? 1 : -1) * (8.4 + (k % 3)), z: 7 + k * 4.5, w: 2.6, h: 6, ppm: 16, paint: pine });
  out.push({ id: 'wa-pp-snowman', x: 3.4, z: 11, w: 1, h: 1.6, ppm: 24, paint: snowman });
  out.push({ id: 'wa-pp-snowman', x: -3.6, z: 26, w: 1, h: 1.6, ppm: 24, paint: snowman });
  out.push({ id: 'wa-pp-tiara', x: -1.9, z: 8, w: 0.3, h: 0.12, ppm: 40, paint: tiara });
  for (let k = 0; k < 16; k++) out.push({ id: 'wa-pp-petal', x: (hash(k * 2.1) - 0.5) * 3.4, z: 2 + k * 2.6, w: 0.2, h: 0.1, ppm: 40, paint: petal, wrap: true });
  if (weakness) for (let k = 0; k < 9; k++) out.push({ id: 'wa-pp-gravy', x: (hash(k * 5.3) - 0.5) * 1.6, z: 4 + k * 4.4, w: 0.5, h: 0.12, ppm: 32, paint: gravy, wrap: true });
  return out;
};

export const PIPER: SceneDef = {
  land: 'FAIRY LAND',
  weapon: 'SPELLBOOK',
  sky: ['#23307A', '#3A55B4', '#6E8EDC', '#A8C4F0', '#E8D4F0', '#F8C8D8', '#FFE4F2'],
  haze: '#E8D4F0',
  ground, back, props,
  drawWeapon: (c: Ctx, t: number) => { c.translate(-12, 0); bookShut(c, t); },
  grip: [[-4, 2], [16, 2]],
  rim: '#F9A8D4',
};
