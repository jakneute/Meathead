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

import { type Ctx, type Prop, type SceneDef, HOR, box, hash } from './kit';
import { timeOfDay, hourMix } from '../timeOfDay';
import { bookShut } from './toys';
import { drawCastleAt, PIPER_WINDOW } from '../fantasy/monument';
import { ground, cottage, chimneySmoke, lamp, pine, snowman } from './intoFantasy';

const lit = () => timeOfDay().lamps > 0.3;

const back = (c: Ctx, t: number, sway: number, weakness: boolean) => {
  // (the Alps: jagged, snowfields on their tops lit on the sun side, rock ribs)
  const rock = hourMix('#6E6C96', '#7A5A86', '#262A44'), snow = hourMix('#E8EEF8', '#F2D8E0', '#7A84A8'), shade = hourMix('#B8C2DC', '#C8A8C0', '#4A5276'), rib = hourMix('#4E4C76', '#5A3E66', '#181C30');
  const peaks: [number, number][] = [[-30, 34], [30, 56], [88, 38], [140, 62], [206, 44], [262, 66], [326, 40], [384, 58], [440, 32]];
  const yAt = (x: number) => HOR - Math.max(6, ...peaks.map(([px, h]) => h - Math.abs(x - px) * 0.9));
  for (let x = 0; x < 400; x += 2) {
    const xx = x - sway * 0.1, y = Math.round(yAt(xx)), lit2 = yAt(xx + 2) < yAt(xx - 2), sl = Math.max(y, HOR - 24 + Math.round(Math.sin(xx * 0.07) * 4));
    box(c, x, y, 2, HOR - y, rock);
    if (sl > y) box(c, x, y, 2, sl - y, lit2 ? snow : shade);
    if (hash(Math.floor(xx / 2) * 0.7) > 0.86) box(c, x, sl, 1, Math.min(10, HOR - sl), rib);
  }
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
  const roofC = hourMix('#4A4A6A', '#5A3E5A', '#1E2034'), wall = hourMix('#CDBCA6', '#C8A898', '#3E3A4A'), glow = lit() ? '#FFD87A' : '#8E7A6A';
  for (let i = 0; i < 16; i++) {
    const rx = Math.round(-10 + i * 27 + (hash(i) - 0.5) * 8 + sway * 0.3), rw = 18 + Math.round(hash(i * 2.1) * 10), rh = 6 + Math.round(hash(i * 3.3) * 5);
    if (Math.abs(rx + rw / 2 - (300 + sway * 0.4)) < 16) continue;
    box(c, rx, HOR - 2 - rh, rw, rh + 4, wall); box(c, rx + 3, HOR - rh + 1, 2, 2, glow); if (hash(i * 5) > 0.5) box(c, rx + rw - 6, HOR - rh + 1, 2, 2, glow);
    c.fillStyle = roofC; c.beginPath(); c.moveTo(rx - 2, HOR - 2 - rh); c.lineTo(rx + rw / 2, HOR - 2 - rh - 8); c.lineTo(rx + rw + 2, HOR - 2 - rh); c.closePath(); c.fill();
    c.fillStyle = snow; c.beginPath(); c.moveTo(rx - 2, HOR - 2 - rh); c.lineTo(rx + rw / 2, HOR - 2 - rh - 8); c.lineTo(rx + rw / 2, HOR - rh - 7); c.lineTo(rx, HOR - rh - 1); c.closePath(); c.fill();
    if (i % 3 === 1) { box(c, rx + rw - 6, HOR - rh - 12, 3, 6, '#7A4A3A'); const u = ((t * 0.3 + i * 5) % 20) / 20; c.globalAlpha = 0.4 * (1 - u); box(c, rx + rw - 6 + u * 4, HOR - rh - 14 - u * 10, 2 + u * 2, 2, '#D8DCE8'); c.globalAlpha = 1; }
  }
  const sx = Math.round(70 + sway * 0.3);
  box(c, sx - 3, HOR - 30, 6, 30, wall); c.fillStyle = roofC; c.beginPath(); c.moveTo(sx - 4, HOR - 30); c.lineTo(sx, HOR - 46); c.lineTo(sx + 4, HOR - 30); c.closePath(); c.fill(); box(c, sx - 1, HOR - 26, 2, 3, glow);
  const cx = Math.round(170 + sway * 0.3);
  box(c, cx - 4, HOR - 26, 8, 26, wall); box(c, cx - 3, HOR - 24, 6, 6, '#F4F0E0'); box(c, cx, HOR - 23, 1, 3, '#1A1028'); box(c, cx, HOR - 21, 2, 1, '#1A1028');
  c.fillStyle = roofC; c.beginPath(); c.moveTo(cx - 6, HOR - 26); c.lineTo(cx, HOR - 36); c.lineTo(cx + 6, HOR - 26); c.closePath(); c.fill(); box(c, cx - 6, HOR - 27, 12, 1, snow);
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
