// The walk into Fairy Land (portalWalk.ts), SNES'd with the town square's look: out of the portal and up a snowy cobbled
// lane into HOGSMEAT VILLAGE. Either side, crooked half-timbered cottages (oak studs and braces on cream plaster, a
// jettied upper floor, leaded windows glowing warm, a steep slate roof heaped with snow, icicles, a smoking chimney),
// wrought-iron lamp posts with their lanterns (lit after dark), snowy pines, a snowman in a wizard's hat, the square's
// Christmas tree with its baubles. Underfoot: the verges' snow in stepped drifts, the lane's cobbles each lit along its
// top, slush in the wheel ruts. Far off at the end of it: the Alps (real snowfields, no volcanoes), the pine ridge, and
// on its crag THE GREAT PIXIE'S CASTLE (fantasy/monument.ts: the smallest it ever is), Piper's window glowing at its
// top. The sky by the hour. Timing, lines and skip unchanged.

import { type Ctx, type Prop, type PortalDef, HOR, box, hash, rampOf, lump, smoke } from './kit';
import { timeOfDay, hourMix } from '../timeOfDay';
import { drawCastleAt } from '../fantasy/monument';

const lit = () => timeOfDay().lamps > 0.3;
const SNOW = ['#9AA6C8', '#BCC8E2', '#DCE4F4', '#F2F6FE', '#FFFFFF'];
const COB = ['#2E2840', '#463E5C', '#5E5676', '#7A7294', '#A09AB8'];
const OAK = ['#1E120C', '#3A2418', '#5A3A26', '#7C5638', '#A07650'];
const IRON = ['#0C0A14', '#1E1C30', '#33304A', '#4C4A66', '#6C6A88'];

export const ground = (g: Ctx, w: number, h: number) => {
  // (the verges: snow in stepped drifts, a sparkle here and there, footprints)
  box(g, 0, 0, w, h, SNOW[2]);
  for (let y = 0; y < h; y += 4) for (let x = (y / 4) % 2 ? 2 : 0; x < w; x += 4) { const t = hash(x * 0.71 + y * 1.37); if (t < 0.18) box(g, x, y, 3, 2, SNOW[1]); else if (t < 0.3) box(g, x, y, 2, 1, SNOW[3]); else if (t > 0.97) box(g, x, y, 1, 1, SNOW[4]); }
  for (let i = 0; i < 30; i++) { const x = hash(i * 3.9) * w, y = hash(i * 7.3) * h; box(g, x - 4, y - 1, 9, 3, SNOW[1]); box(g, x - 3, y - 2, 6, 1, SNOW[3]); }
  // (the lane: cobbles in rows, each lit along its top and left, slush in the ruts, the verge's lip of snow either side)
  const cx = w / 2, half = 44;
  box(g, cx - half, 0, half * 2, h, COB[0]);
  for (let y = 0, r = 0; y < h; y += 7, r++) for (let x = cx - half + (r % 2) * 5; x < cx + half - 2; x += 10) {
    box(g, x, y, 9, 6, COB[2]); box(g, x, y, 9, 1, COB[3]); box(g, x, y, 1, 5, COB[3]); box(g, x + 1, y + 1, 2, 1, COB[4]); box(g, x, y + 5, 9, 1, COB[1]);
  }
  for (const rx of [cx - 22, cx + 16]) for (let y = 0; y < h; y += 2) if (hash(y * 0.3 + rx) > 0.35) box(g, rx + Math.round(Math.sin(y * 0.1) * 1), y, 6, 2, hash(y + rx) > 0.6 ? SNOW[1] : SNOW[0]);
  for (let y = 0; y < h; y++) { const l = cx - half - 2 + Math.round((hash(Math.floor(y / 3) * 1.7) - 0.5) * 4), r = cx + half + Math.round((hash(Math.floor(y / 3) * 2.3 + 5) - 0.5) * 4); box(g, l, y, 4, 1, SNOW[3]); box(g, r - 2, y, 4, 1, SNOW[3]); box(g, l + 3, y, 1, 1, SNOW[1]); }
};

const back = (c: Ctx, t: number, sway: number) => {
  // (the Alps far off: jagged, snowfields on their tops, rock ribs; the pine ridge nearer; the castle on its crag)
  const rock = hourMix('#6E6C96', '#7A5A86', '#262A44'), snow = hourMix('#E8EEF8', '#F2D8E0', '#7A84A8'), shade = hourMix('#B8C2DC', '#C8A8C0', '#4A5276');
  const peaks: [number, number][] = [[-20, 30], [40, 52], [96, 34], [150, 58], [214, 40], [268, 62], [330, 38], [390, 54], [440, 30]];
  const yAt = (x: number) => HOR - Math.max(6, ...peaks.map(([px, h]) => h - Math.abs(x - px) * 0.9));
  for (let x = 0; x < 400; x += 2) {
    const xx = x - sway * 0.1, y = Math.round(yAt(xx)), lit2 = yAt(xx + 2) < yAt(xx - 2), sl = Math.max(y, HOR - 22 + Math.round(Math.sin(xx * 0.07) * 4));
    box(c, x, y, 2, HOR - y, rock);
    if (sl > y) box(c, x, y, 2, sl - y, lit2 ? snow : shade);
  }
  drawCastleAt(c, Math.round(200 + sway * 0.45), HOR - 4, 0.17, t);
  const ridge = hourMix('#2E4A50', '#3A3A50', '#121A26');
  for (let x = 0; x < 400; x += 3) { const y = HOR - 6 - Math.round(Math.abs(Math.sin((x - sway * 0.25) * 0.11)) * 5); box(c, x, y, 3, HOR - y + 2, ridge); if ((x / 3) % 2) box(c, x + 1, y - 2, 1, 2, ridge); box(c, x, y, 2, 1, hourMix('#C8D4E4', '#C8A8B8', '#4A5470')); }
};

export const cottage = (wall: string, roof: string, seed: number) => (g: Ctx, w: number, h: number) => {
  // (crooked: the roof leans; an oak frame on plaster, a jettied upper floor, leaded windows glowing, snow heaped on the
  // slate, icicles off the eaves, a chimney)
  const W = rampOf(wall), R = rampOf(roof), rh = Math.round(h * 0.4), gf = Math.round(h * 0.3), lean = Math.round((hash(seed) - 0.5) * 6);
  // (ground floor)
  box(g, 2, h - gf, w - 4, gf, W[2]); box(g, 2, h - gf, 2, gf, W[3]); box(g, w - 6, h - gf, 4, gf, W[1]);
  box(g, 2, h - 3, w - 4, 3, COB[2]);
  const door = Math.round(w * 0.64), G = lit() ? ['#7A3E10', '#F0A83E', '#FFD87A', '#FFF4C8'] : ['#5A3420', '#C0864A', '#E8B874', '#FFF0C8'];
  box(g, door - 1, h - gf + 3, Math.round(w * 0.2) + 2, gf - 3, OAK[0]); box(g, door, h - gf + 4, Math.round(w * 0.2), gf - 4, OAK[2]); box(g, door, h - gf + 4, 1, gf - 4, OAK[3]);
  const sx = Math.round(w * 0.12), sw = Math.round(w * 0.42);
  box(g, sx - 1, h - gf + 3, sw + 2, gf - 7, OAK[1]); for (let i = 0; i < 3; i++) box(g, sx, h - gf + 4 + i * ((gf - 9) / 3), sw, Math.ceil((gf - 9) / 3), G[3 - i]);
  box(g, sx + Math.round(sw / 2), h - gf + 4, 1, gf - 9, OAK[1]);
  // (upper floor: jettied, leaning, timbered)
  const uy = rh, uh = h - gf - rh, ux = 0 + lean;
  box(g, ux, uy + uh - 2, w, 3, OAK[2]);
  box(g, ux, uy, w, uh - 2, W[3]); box(g, ux + w - 4, uy, 4, uh - 2, W[1]);
  for (let k = 0; k <= 4; k++) box(g, ux + Math.round((k * (w - 3)) / 4), uy, 3, uh - 2, OAK[2]);
  box(g, ux, uy, w, 2, OAK[2]); box(g, ux, uy + Math.round(uh * 0.55), w, 2, OAK[1]);
  g.strokeStyle = OAK[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(ux + 3, uy + uh * 0.55); g.lineTo(ux + w / 4, uy + 2); g.moveTo(ux + w - 3, uy + uh * 0.55); g.lineTo(ux + w * 0.75, uy + 2); g.stroke();
  for (const wx of [ux + w * 0.3, ux + w * 0.58]) { box(g, wx - 1, uy + 4, 9, 10, OAK[0]); box(g, wx, uy + 5, 7, 8, G[lit() || hash(seed + wx) > 0.4 ? 2 : 0]); box(g, wx + 3, uy + 5, 1, 8, OAK[1]); box(g, wx - 1, uy + 13, 9, 2, SNOW[3]); }
  // (the roof: steep, crooked, slate in rows under a thick cap of snow, icicles)
  const peak = Math.round(w * 0.46) + lean;
  g.fillStyle = OAK[0]; g.beginPath(); g.moveTo(-2, rh + 2); g.lineTo(peak, -1); g.lineTo(w + 2, rh + 2); g.closePath(); g.fill();
  g.fillStyle = R[2]; g.beginPath(); g.moveTo(0, rh); g.lineTo(peak, 1); g.lineTo(w, rh); g.closePath(); g.fill();
  for (let y = rh - 3; y > 4; y -= 4) box(g, peak - (rh - y) * (peak / rh) * 0.9 + 2, y, (rh - y) * 1.6 * (w / rh) * 0.5, 1, R[1]);
  g.fillStyle = SNOW[3]; g.beginPath(); g.moveTo(-3, rh + 1); g.lineTo(peak, -3); g.lineTo(w + 3, rh + 1); g.lineTo(w + 3, rh - 4); g.lineTo(peak, 5); g.lineTo(-3, rh - 4); g.closePath(); g.fill();
  g.fillStyle = SNOW[4]; g.beginPath(); g.moveTo(-3, rh - 3); g.lineTo(peak, -3); g.lineTo(peak - 2, 2); g.lineTo(-3, rh); g.closePath(); g.fill();
  for (let k = 2; k < w; k += 4) box(g, k, rh + 1, 1, 2 + Math.round(hash(seed + k) * 4), SNOW[1]);
  if (seed % 2) { const cx = Math.round(peak + w * 0.18); box(g, cx - 1, rh * 0.3 - 1, 8, rh * 0.5, OAK[0]); box(g, cx, rh * 0.3, 6, rh * 0.5, '#8A4A3A'); box(g, cx, rh * 0.3, 2, rh * 0.5, '#A86A5A'); box(g, cx - 1, rh * 0.3 - 2, 8, 2, SNOW[4]); }
};
/** A chimney's smoke (live: drawn over its cottage). */
export const chimneySmoke = (seed: number) => (c: Ctx, sx: number, sy: number, s: number, t: number) => { if (seed % 2) smoke(c, sx + s * 0.6, sy - s * 3.4, s * 0.5, t, seed, { n: 6, rise: 0.05, size: 0.6, col: ['#C8CCDA', '#D8DCE8', '#E8ECF4', '#F4F6FA'] }); };

export const lamp = (g: Ctx, w: number, h: number) => {
  // (a fluted iron post on its plinth, a lantern on top (lit after dark), snow on its cap)
  const m = Math.round(w / 2);
  box(g, m - 3, h - 4, 6, 4, IRON[2]); box(g, m - 3, h - 4, 6, 1, IRON[4]);
  box(g, m - 1, 9, 3, h - 13, IRON[1]); box(g, m - 1, 9, 1, h - 13, IRON[3]);
  for (let y = 16; y < h - 6; y += 10) box(g, m - 2, y, 5, 1, IRON[3]);
  box(g, m - 4, 1, 9, 9, IRON[0]); box(g, m - 3, 2, 7, 7, lit() ? '#FFE9A8' : '#E8D8B0'); box(g, m - 3, 2, 2, 7, lit() ? '#FFFFFF' : '#FFF4D8');
  box(g, m - 4, 0, 9, 2, SNOW[3]);
};
export const pine = (g: Ctx, w: number, h: number) => {
  const P = ['#0E1E1C', '#1A3632', '#284E46', '#3A6A5A'];
  box(g, w / 2 - 2, h - 10, 4, 10, OAK[2]); box(g, w / 2 - 2, h - 10, 1, 10, OAK[3]);
  for (let k = 0; k < 4; k++) {
    const y = 4 + k * (h - 14) / 4, half = 4 + k * (w / 2 - 4) / 3, bot = y + (h - 14) / 4;
    g.fillStyle = P[0]; g.beginPath(); g.moveTo(w / 2, y - 7); g.lineTo(w / 2 + half + 1, bot + 1); g.lineTo(w / 2 - half - 1, bot + 1); g.fill();
    g.fillStyle = P[2]; g.beginPath(); g.moveTo(w / 2, y - 6); g.lineTo(w / 2 + half, bot); g.lineTo(w / 2 - half, bot); g.fill();
    g.fillStyle = P[3]; g.beginPath(); g.moveTo(w / 2, y - 6); g.lineTo(w / 2, bot); g.lineTo(w / 2 - half, bot); g.fill();
    box(g, w / 2 - half * 0.8, bot - 2, half * 1.5, 2, SNOW[3]); box(g, w / 2 - half * 0.7, bot - 3, half * 0.6, 1, SNOW[4]);
  }
};
export const snowman = (g: Ctx, w: number, h: number) => {
  const S = rampOf('#E8EEF8'), m = w / 2;
  lump(g, m, h - h * 0.2, w * 0.36, h * 0.2, S); lump(g, m, h - h * 0.5, w * 0.27, h * 0.15, S); lump(g, m, h - h * 0.72, w * 0.2, h * 0.11, S);
  box(g, m - 2, h - h * 0.75, 1, 1, '#1A1028'); box(g, m + 1, h - h * 0.75, 1, 1, '#1A1028'); box(g, m, h - h * 0.72, 3, 1, '#F97316');
  for (let k = 0; k < 4; k++) box(g, m - 4 + k * 2, h - h * 0.62, 2, 2, k % 2 ? '#E0AE3A' : '#9B1C1C');
  g.fillStyle = '#2A2440'; g.beginPath(); g.moveTo(m - w * 0.22, h - h * 0.8); g.lineTo(m + w * 0.22, h - h * 0.8); g.lineTo(m + 1, 0); g.closePath(); g.fill();
  box(g, m - w * 0.24, h - h * 0.81, w * 0.48, 2, '#3A3456');
};
const tree = (g: Ctx, w: number, h: number) => {
  pine(g, w, h);
  const B = ['#E8344A', '#F2C84A', '#60A5FA', '#F472B6'];
  for (let i = 0; i < 14; i++) { const y = 8 + hash(i * 1.7) * (h - 20), half = 4 + (y / h) * (w / 2 - 4); box(g, w / 2 + (hash(i * 2.3) - 0.5) * half * 1.4, y, 2, 2, lit() && i % 2 ? '#FFF4C8' : B[i % 4]); }
  g.fillStyle = '#F2C84A'; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2 + 2, 3); g.lineTo(w / 2, 6); g.lineTo(w / 2 - 2, 3); g.closePath(); g.fill();
};

const props = (): Prop[] => {
  const out: Prop[] = [];
  const walls = ['#E6D6BC', '#D8C8E0', '#F0D0C0', '#D4E0CC'], roofs = ['#3E4A6A', '#5A3E4A', '#4A5A7A', '#4E4466'];
  for (let i = 0; i < 10; i++) { const side = i % 2 ? 1 : -1, k = i % 4; out.push({ id: `pw-fa2-cot${k}`, x: side * (5.2 + (i % 3) * 0.6), z: 4 + i * 3.2, w: 3.4, h: 3.8, ppm: 18, paint: cottage(walls[k], roofs[(k + 1) % 4], k), live: chimneySmoke(k) }); }
  for (let k = 0; k < 8; k++) out.push({ id: 'pw-fa2-lamp', x: (k % 2 ? 1 : -1) * 2.4, z: 3 + k * 4, w: 0.6, h: 2.6, ppm: 24, paint: lamp });
  for (let k = 0; k < 8; k++) out.push({ id: 'pw-fa2-pine', x: (k % 2 ? -1 : 1) * (8 + (k % 3)), z: 6 + k * 4.5, w: 2.6, h: 6, ppm: 16, paint: pine });
  out.push({ id: 'pw-fa2-snowman', x: -3.4, z: 9, w: 1, h: 1.6, ppm: 24, paint: snowman });
  out.push({ id: 'pw-fa2-snowman', x: 3.6, z: 22, w: 1, h: 1.6, ppm: 24, paint: snowman });
  out.push({ id: 'pw-fa2-tree', x: 3.8, z: 14, w: 2.4, h: 4.4, ppm: 18, paint: tree });
  return out;
};

export const INTO_FANTASY: PortalDef = {
  land: 'FAIRY LAND',
  lines: ['WIZARDS, CASTLES, A $14 BUTTER DRINK.', 'ONCE UPON A TIME, FOR A LIMITED TIME.'],
  haze: '#E8D4F0',
  ground, back, props,
  rim: () => hourMix('#FFE4F2', '#F9A8D4', '#C4B5FD'),
};
